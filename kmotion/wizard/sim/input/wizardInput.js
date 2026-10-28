// WizardInput — 엔진 포즈 프레임 → 게임 입력 7종(02 문서 3·4절)
// 입력: pose(p, t, W, H) — p = 엔진 f.pose(33점, 거울 캔버스 픽셀 {x,y,v}), t = ms(captureTime 우선)
// 출력: this.out 에 { type, t, via:'body', value, conf } — 키보드·마우스와 같은 형식(12절)
// 화면·Three·DOM 을 모른다. 노드에서 합성 관절열로 시험한다(tests/sim/input.mjs).
import { INPUT, STAGE_ACTIONS } from './config.js';
import { ChargeFSM } from './charge.js';
import { clamp, slope, segCross, median } from '../core/math.js';

const P = { nose: 0, lS: 11, rS: 12, lE: 13, rE: 14, lW: 15, rW: 16, lH: 23, rH: 24 };
const vis = (q, m = INPUT.visMin) => q && (q.v == null || q.v >= m);
const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export class WizardInput {
  constructor({ stage = 'A', cal = null, uMaxAuto = null } = {}){ this.uMaxAuto = uMaxAuto;
    this.out = []; this.stage = stage; this.cal = cal ? Object.assign({}, cal) : null;
    this.hist = []; this.sw = 0; this.seen = false; this.lostT = 0; this.lastSeenT = 0;
    this.duck = false; this.duckT = 0; this.block = false; this.blockT = 0; this.blockOffT = 0;
    this.hand = { L: { armed: true, last: -1e9 }, R: { armed: true, last: -1e9 } }; this.lastAtk = -1e9;
    this.dodgeT = -1e9; this.dodgeArmed = true; this.gatherT = 0; this.ignoreUntil = 0;
    this.charge = new ChargeFSM(e => { if (e.type === 'CAST' || e.type === 'FIZZLE') this.castEndT = e.t; this.out.push(e); }); this.castEndT = -1e9; this.aimX0 = null;
    this.autoCal = []; this.drift = { t: 0, xs: [] }; this.preview = null; this.state = 'ok';
    this.enabled = true;  // 문제 중에는 몸 입력을 막는다(game 이 끔)
  }
  emit(type, t, value = {}, conf = 1){ this.out.push({ type, t, via: 'body', value, conf: Math.round(conf * 100) / 100 }); }
  drain(){ return this.out.splice(0, this.out.length); }
  get allow(){ return STAGE_ACTIONS[this.stage] || STAGE_ACTIONS.A; }

  pose(p, t, W = 640, H = 480){
    const C = INPUT;
    if (!p || !vis(p[P.lS]) || !vis(p[P.rS])) return this.noBody(t);
    const lS = p[P.lS], rS = p[P.rS], cx = (lS.x + rS.x) / 2, cy = (lS.y + rS.y) / 2, swNow = d2(lS, rS);
    this.preview = { ok: true, joints: [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].map(i => p[i] ? [Math.round(p[i].x / W * 1000) / 1000, Math.round(p[i].y / H * 1000) / 1000, vis(p[i]) ? 1 : 0] : null) };
    // 보정이 없으면 1.5초 동안 서 있는 값으로 자동(마우스 모드·보정 건너뜀)
    if (!this.cal) { this.autoCal.push({ cx, cy, sw: swNow, t }); if (t - this.autoCal[0].t < 1500) return;
      this.cal = { sw0: median(this.autoCal.map(a => a.sw)), cx0: median(this.autoCal.map(a => a.cx)), yS0: median(this.autoCal.map(a => a.cy)), uMax: this.uMaxAuto || C.move.uMax, vPeak: 0, aPeak: 0, auto: true };
      this.sw = this.cal.sw0; this.emit('CALIBRATED', t, { auto: true }); }
    const k = this.cal; const sw0 = k.sw0;
    // 다른 사람이 잡힘 의심(6-3)
    const last = this.hist[this.hist.length - 1];
    if (last && t - last.t < 200) { const jump = Math.abs(cx - last.cx) / sw0, r = swNow / sw0;
      if (jump >= C.swap.jump && (r < C.swap.swLo || r > C.swap.swHi)) { this.ignoreUntil = t + C.swap.ignore; this.emit('SWAP', t, {}); return; } }
    if (t < this.ignoreUntil) return;
    if (swNow / sw0 > C.swBand[0] && swNow / sw0 < C.swBand[1]) this.sw = this.sw ? this.sw + (swNow - this.sw) * C.swAlpha : swNow;
    if (!this.seen) { this.seen = true; this.emit('FOUND', t); }
    this.lastSeenT = t; this.lostT = 0;
    const s = { t, cx, cy, W: { L: p[P.lW], R: p[P.rW] }, S: { L: lS, R: rS }, E: { L: p[P.lE], R: p[P.rE] } };
    this.hist.push(s); while (this.hist.length && t - this.hist[0].t > 500) this.hist.shift();
    if (!this.enabled) return;

    // I1 이동 — 절대 위치(어깨 중심), 필터는 엔진 One Euro 한 번뿐
    let u = (cx - k.cx0) / sw0; const au = Math.abs(u); u = au < C.move.dead ? 0 : Math.sign(u) * (au - C.move.dead);
    u = clamp(u / (k.uMax || C.move.uMax), -1, 1); this.u = u; this.emit('MOVE', t, { u: Math.round(u * 1000) / 1000 });
    // 기준 표류(5-3): 가만히 서 있던 자리로 C0 를 조금씩
    if (Math.abs(u) < C.drift.still) this.drift.xs.push(cx); if (t - this.drift.t > C.drift.every) { if (this.drift.xs.length > 20) k.cx0 += (median(this.drift.xs) - k.cx0) * C.drift.pull; this.drift = { t, xs: [] }; }
    const h3 = this.hist.slice(-3), ts = h3.map(q => q.t / 1000);
    const vBody = slope(ts, h3.map(q => q.cx / sw0));   // sw/초

    // I6 막기 — X자(가장 먼저: 막기 중엔 공격·충전 안 됨)
    const lW = p[P.lW], rW = p[P.rW], lE = p[P.lE], rE = p[P.rE];
    const armsOk = vis(lW, .3) && vis(rW, .3) && vis(lE, .3) && vis(rE, .3);
    if (this.allow.BLOCK || this.blockOpt) {
      const cross = armsOk && (lW.x - rW.x) / sw0 > C.block.cross && [lW, rW].every(w => (w.y - cy) / sw0 > C.block.yTop && (w.y - cy) / sw0 < C.block.yBot) && segCross(lE, lW, rE, rW);
      if (cross) { if (!this.blockT) this.blockT = t; if (!this.block && t - this.blockT >= C.block.hold && t - this.blockOffT > C.block.rearm) { this.block = true; this.charge.cancel(t); this.emit('BLOCK', t, { on: true }); } }
      else { this.blockT = 0; if (this.block) { this.block = false; this.blockOffT = t; this.emit('BLOCK', t, { on: false }); } }
    }
    // I5 마법 — 두 손 모아 머리 위 → 유지 → 내림
    const nose = p[P.nose]; const top = vis(nose) ? nose.y - C.gather.aboveNose * sw0 : cy - C.gather.noseFallback * sw0;
    const gathered = armsOk && lW.y < top && rW.y < top && d2(lW, rW) <= C.gather.dist * sw0 && !this.block;
    const dropped = vis(lW, .3) && vis(rW, .3) && lW.y > cy && rW.y > cy;
    if (gathered) { if (!this.gatherT) this.gatherT = t; if (t - this.gatherT >= C.gather.hold && this.charge.state === 'idle') { this.charge.start(t, 'body'); this.aimX0 = (lW.x + rW.x) / 2; } }
    else this.gatherT = 0;
    let aim = 'auto'; if (this.aimX0 != null && armsOk) { const sh = ((lW.x + rW.x) / 2 - this.aimX0) / sw0; if (sh < -C.gather.aimShift) aim = 'L'; else if (sh > C.gather.aimShift) aim = 'R'; }
    this.charge.update(t, gathered, dropped, this.allow.autoAim ? 'auto' : aim);
    // I3 숙이기 — 어깨가 기준보다 0.30sw 아래(충전·회피 중엔 끔)
    const d = (cy - k.yS0) / sw0;
    if (!this.charge.active && t - this.dodgeT > 300) {
      if (!this.duck && d >= C.duck.in) { if (!this.duckT) this.duckT = t; if (t - this.duckT >= C.duck.hold) { this.duck = true; this.emit('DUCK', t, { on: true }, d / C.duck.in); } }
      else if (this.duck && d <= C.duck.out) { this.duck = false; this.duckT = 0; this.emit('DUCK', t, { on: false }); }
      else if (!this.duck && d < C.duck.in) this.duckT = 0;
    }
    // I2 회피 — 빠른 한 발(최근 3샘플 회귀 기울기 + 200ms 이동량)
    if (this.allow.DODGE) {
      const vD = Math.max(C.dodge.vMin, Math.min(C.dodge.v, k.vPeak ? k.vPeak * C.dodge.peakMul : C.dodge.v));
      const old = this.hist.find(q => t - q.t <= C.dodge.win) || h3[0]; const moved = (cx - old.cx) / sw0;
      if (this.dodgeArmed && Math.abs(vBody) >= vD && Math.abs(moved) >= C.dodge.dist && t - this.dodgeT >= C.dodge.cd && Math.sign(moved) === Math.sign(vBody)) {
        this.dodgeT = t; this.dodgeArmed = false; this.emit('DODGE', t, { dir: Math.sign(vBody) }, Math.abs(vBody) / vD); }
      if (Math.abs(vBody) < C.dodge.exit) this.dodgeArmed = true;
    }
    // I4 기본 공격 — 손목 상대 속도 + 펴짐(또는 휘두르기)
    if (!this.charge.active && !this.block && this.hist.length >= 3) this.attack(p, t, sw0, vBody, W);
  }

  attack(p, t, sw0, vBody, Wpx){
    const C = INPUT.attack, k = this.cal;
    const vA = Math.max(C.vMin, Math.min(C.v, k.aPeak ? k.aPeak * C.peakMul : C.v)) * (Math.abs(vBody) >= C.walkV ? C.walkMul : 1);
    const lH = p[P.lH], rH = p[P.rH]; const hipY = vis(lH) && vis(rH) ? (lH.y + rH.y) / 2 : null;
    const h = this.hist, n = h.length, h3 = h.slice(-3), ts = h3.map(q => q.t / 1000);
    const st = {};
    for (const side of ['L', 'R']) {
      const rx = h3.map(q => (q.W[side].x - q.S[side].x) / sw0), ry = h3.map(q => (q.W[side].y - q.S[side].y) / sw0);
      const vx = slope(ts, rx), vy = slope(ts, ry); st[side] = { vx, vy, s: Math.hypot(vx, vy) };
    }
    const both = st.L.s >= vA * .6 && st.R.s >= vA * .6 && (st.L.vx * st.R.vx + st.L.vy * st.R.vy) / (st.L.s * st.R.s || 1) > C.corr;
    for (const side of ['L', 'R']) {
      const hs = this.hand[side], w = h[n - 1].W[side], sh = h[n - 1].S[side]; if (!vis(w, .3)) continue;
      const S = st[side];
      if (!hs.armed) { if (S.s < C.exit) hs.armed = true; continue; }
      if (S.s < vA || both) continue;
      const q0 = h.find(q => t - q.t <= C.dispWin) || h[0];
      const disp = Math.hypot((w.x - sh.x) - (q0.W[side].x - q0.S[side].x), (w.y - sh.y) - (q0.W[side].y - q0.S[side].y)) / sw0;
      const cx = (h[n - 1].S.L.x + h[n - 1].S.R.x) / 2, nose = p[P.nose];
      const notDown = S.vy <= C.down * S.s;                                        // 손을 내리는 움직임(시전 뒤 등)은 공격 아님
      const outSide = (side === 'R' ? w.x - cx : cx - w.x) / sw0 >= C.mid;          // 손뼉·막기처럼 가운데로 모이면 아님
      const offHead = !vis(nose) || Math.hypot(w.x - nose.x, w.y - nose.y) / sw0 >= C.head;   // 머리 긁기·손 들어 대답 아님
      const above = w.y < (hipY != null ? hipY : sh.y + C.hipFallback * sw0);
      const inward = (side === 'R' ? -S.vx : S.vx) > C.inward * S.s;                // 가운데로 모으는 움직임(손뼉·X자)
      let toHead = false; if (vis(nose)) { const hx = nose.x - w.x, hy = nose.y - w.y, hn = Math.hypot(hx, hy) || 1; toHead = (S.vx * sw0 * hx + S.vy * sw0 * hy) / (S.s * sw0 * hn) > C.toHead; }   // 머리 쪽으로 가는 손
      const o = st[side === 'R' ? 'L' : 'R'], raise2 = S.vy < -C.raise2 * vA && o.vy < -C.raise2 * vA;   // 두 손 함께 올림 = 마법 모으기 시작
      const raiseHit = S.vy < -C.raiseHit * S.s && !raise2 && !inward && vis(nose) && (nose.y - w.y) / sw0 >= C.raiseAbove;   // v2.1 한 손을 머리 위로 치켜들기 = 공격(머리 긁기는 코 높이에서 멈춰 제외)
      if (disp < C.disp || !notDown || !outSide || !above || inward || raise2 || (!raiseHit && (!offHead || toHead)) || t - this.castEndT < C.afterCast || t - this.blockOffT < C.afterCast) continue;
      if (t - hs.last < C.cdHand || t - this.lastAtk < C.cdAll) continue;
      hs.last = t; this.lastAtk = t; hs.armed = false;
      const fx = w.x / Wpx, zone = fx < 1 / 3 ? 0 : fx < 2 / 3 ? 1 : 2;
      this.emit('ATTACK', t, { side, zone, power: clamp(S.s / vA - .5, 0, 1) }, S.s / vA);
    }
  }

  noBody(t){
    this.preview = this.preview ? Object.assign({}, this.preview, { ok: false }) : null;
    if (!this.seen) return; if (!this.lostT) this.lostT = t;
    if (t - this.lostT >= INPUT.lost.body) { this.seen = false; this.charge.cancel(t); if (this.block) { this.block = false; this.emit('BLOCK', t, { on: false }); } if (this.duck) { this.duck = false; this.emit('DUCK', t, { on: false }); } this.emit('LOST', t); }
  }
  // 문제 중 등에서 몸 입력을 끄고 켬 — 켤 때 상태를 깨끗이
  setEnabled(on, t = 0){ if (this.enabled === on) return; this.enabled = on; if (!on) { this.charge.cancel(t); this.out = this.out.filter(e => e.type !== 'FIZZLE'); if (this.block) { this.block = false; this.emit('BLOCK', t, { on: false }); } if (this.duck) { this.duck = false; this.emit('DUCK', t, { on: false }); } } this.hist = []; this.gatherT = 0; this.blockT = 0; this.duckT = 0; }
}
