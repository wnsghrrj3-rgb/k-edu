// K-MOTION 거꾸로 나라 · 몸 입력 층
// 기존 케이모션 공통 엔진(kmotion.js 0.7.x)을 그대로 쓴다: 카메라·MediaPipe 포즈·원유로 떨림 보정·주인 고정(ownerLock)·카메라 범위/고르기.
// 이 파일은 엔진이 주는 33관절(거울 좌표)을 「학생 기준 특징값」으로 바꾸고, 히스테리시스·유지 시간·쿨다운으로 안정화한다.
//
// 좌표 약속(중복 반전 방지): 엔진 좌표는 이미 거울(화면에 보이는 대로). 거울 좌표에서
//   화면 왼쪽 = 학생의 왼쪽, 학생이 자기 오른쪽으로 가면 화면 오른쪽으로 간다.
//   그래서 여기서 나오는 값은 모두 「학생 몸 기준」이며, 화면 표시를 뒤집는 일(자유 체험 좌우 반전)은 이 값에 영향을 주지 않는다.
//   거꾸로 변환은 오직 reverse.js 한 곳에서만 한다.
//
// 키보드 테스트 모드: 카메라 없이 같은 특징값을 만든다(← → 이동 · Q/E 왼팔/오른팔 · ↓/S 웅크리기 · ↑/W 크게 펼치기 · Z/C 고개 · Space 제자리 걷기).

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

// 난이도별 기준(쉬움 = 작은 움직임도 충분히 인식)
export const DIFF = {
  easy:   { name: '쉬움',   crouch: .24, spread: 1.9, raise: .45, tilt: 9,  moveOn: .75, moveOff: .42, hold: .55, hint: 6,  lateral: .45 },
  normal: { name: '보통',   crouch: .38, spread: 2.3, raise: .6,  tilt: 12, moveOn: 1.0, moveOff: .55, hold: .9,  hint: 9,  lateral: .65 },
  hard:   { name: '어려움', crouch: .52, spread: 2.7, raise: .75, tilt: 15, moveOn: 1.25, moveOff: .7, hold: 1.25, hint: 14, lateral: .85 },
};

// 히스테리시스 + 확인 시간: 켜짐 문턱과 꺼짐 문턱을 다르게, 일정 시간 넘어야 상태가 바뀜
class Latch {
  constructor(onMs = 120, offMs = 220){ this.on = false; this.onMs = onMs; this.offMs = offMs; this.t = 0; }
  step(v, onTh, offTh, dtMs){ const want = this.on ? v > offTh : v > onTh;
    if (want !== this.on) { this.t += dtMs; if (this.t >= (want ? this.onMs : this.offMs)) { this.on = want; this.t = 0; return true; } } else this.t = 0; return false; }
  reset(){ this.on = false; this.t = 0; }
}

export class MotionInput {
  constructor({ video, canvas, settings }){
    this.video = video; this.canvas = canvas; this.S = settings; this.km = null; this.mode = 'none';
    this.keys = {}; this.listeners = {};
    this.base = null; this.baseBuf = []; this.calibrating = false;
    this.pose = null; this.lastSeen = 0; this.prevPts = null; this.prevT = 0;
    this.f = this.zero();
    this.latch = { armL: new Latch(), armR: new Latch(), spread: new Latch(150, 250), crouch: new Latch(150, 250), tiltL: new Latch(160, 220), tiltR: new Latch(160, 220), moving: new Latch(180, 420) };
    this.kbX = 0;
    this._kd = e => { if (this.mode !== 'keyboard') return; const k = e.key.toLowerCase(); if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(k)) e.preventDefault(); this.keys[k] = true; };
    this._ku = e => { this.keys[e.key.toLowerCase()] = false; };
    addEventListener('keydown', this._kd); addEventListener('keyup', this._ku);
  }
  zero(){ return { present: false, x: 0, armL: 0, armR: 0, spread: 0, crouch: 0, tilt: 0, energy: 0, moving: false,
    armLUp: false, armRUp: false, spreadOn: false, crouchOn: false, tiltDir: 0,
    vec: { L: { u: { x: 0, y: 1 }, f: { x: 0, y: 1 } }, R: { u: { x: 0, y: 1 }, f: { x: 0, y: 1 } } }, quality: 0 }; }
  on(type, fn){ (this.listeners[type] = this.listeners[type] || []).push(fn); return this; }
  emit(type, d){ (this.listeners[type] || []).forEach(f => f(d)); }
  get diff(){ return DIFF[this.S.diff] || DIFF.normal; }
  // 민감도 0.5~1.5: 높을수록 문턱이 낮아짐
  get sens(){ return 1 / clamp(+this.S.sens || 1, .5, 1.6); }

  async startCamera(){
    if (this.km && this.mode === 'camera') return true;
    this.stop(); this.mode = 'camera';
    const KM = window.KMotion; if (!KM) throw new Error('케이모션 엔진을 불러오지 못했어요');
    this.km = KM.create({ video: this.video, canvas: this.canvas, modes: ['pose'], activity: 'upside', numPoses: 2, ownerLock: true, rangeButton: false, poseConf: .5 });
    this.km.onStatus = s => this.emit('status', s);
    this.km.onFrame = f => this.onFrame(f);
    try { await this.km.start(); this.emit('status', ''); return true; }
    catch (e) { this.emit('status', '카메라를 켤 수 없어요'); this.mode = 'none'; this.km = null; throw e; }
  }
  startKeyboard(){ this.stop(); this.mode = 'keyboard'; this.base = { x: 0, y: 0, sw: 1, tilt: 0 }; this.f = this.zero(); this.f.present = true; this.emit('status', '⌨️ 키보드 테스트 모드'); }
  // 카메라 스트림·추론 정리(게임 종료·모드 전환 시)
  stop(){ if (this.km) { try { this.km.stop(); } catch (e) {} this.km = null; } if (this.video && this.video.srcObject) { this.video.srcObject.getTracks().forEach(t => t.stop()); this.video.srcObject = null; } this.mode = 'none'; this.pose = null; this.f = this.zero(); }
  destroy(){ this.stop(); removeEventListener('keydown', this._kd); removeEventListener('keyup', this._ku); }

  // 다음 학생: 이전 학생의 동작 데이터·기준값을 모두 비운다
  resetStudent(){ this.base = null; this.baseBuf = []; this.prevPts = null; this.pose = null; this.f = this.zero(); Object.values(this.latch).forEach(l => l.reset()); this.kbX = 0;
    if (this.km && this.km.resetOwner) this.km.resetOwner(); if (this.mode === 'keyboard') { this.base = { x: 0, y: 0, sw: 1, tilt: 0 }; this.f.present = true; } }

  // 자세 보정: 차렷 자세로 가운데 선 모습을 기준으로 삼는다(학생별)
  beginCalibration(){ this.calibrating = true; this.baseBuf = []; if (this.mode === 'keyboard') { this.base = { x: 0, y: 0, sw: 1, tilt: 0 }; this.calibrating = false; this.emit('calibrated', this.base); } }
  calibProgress(){ return this.mode === 'keyboard' ? 1 : clamp(this.baseBuf.length / 24, 0, 1); }

  onFrame(fr){
    // 카메라 미리보기는 HUD 쪽에서 직접 그린다(영상 저장 없음)
    if (this.onPreview) this.onPreview(fr, this.km);
    if (!fr.fresh) return;
    const p = fr.pose; const t = fr.t;
    const ok = p && p[11].v > .5 && p[12].v > .5;
    if (!ok) { this.pose = null; return; }
    this.pose = p; this.lastSeen = t;
    const sh = mid(p[11], p[12]), sw = Math.max(20, dist(p[11], p[12]));
    const tilt = this.headTilt(p);
    if (this.calibrating) {
      // 몸이 흔들리지 않을 때만 모은다
      const last = this.baseBuf[this.baseBuf.length - 1];
      if (!last || Math.abs(last.y - sh.y) < sw * .08) this.baseBuf.push({ x: sh.x, y: sh.y, sw, tilt }); else this.baseBuf = [];
      if (this.baseBuf.length >= 24) { const n = this.baseBuf.length, avg = k => this.baseBuf.reduce((s, b) => s + b[k], 0) / n;
        this.base = { x: avg('x'), y: avg('y'), sw: avg('sw'), tilt: avg('tilt') }; this.calibrating = false; this.emit('calibrated', this.base); }
    }
    if (!this.base) this.base = { x: sh.x, y: sh.y, sw, tilt }; // 보정 전 임시 기준
    // 움직임 에너지: 어깨·팔꿈치·손목·코의 초당 이동량(어깨너비 단위)
    const ids = [0, 11, 12, 13, 14, 15, 16];
    if (this.prevPts && t > this.prevT) { const dt = (t - this.prevT) / 1000; let s = 0; for (const i of ids) s += dist(p[i], this.prevPts[i]); const e = s / ids.length / sw / dt;
      this.rawEnergy = Math.min(4, e); }
    this.prevPts = ids.reduce((o, i) => (o[i] = { x: p[i].x, y: p[i].y }, o), {}); this.prevT = t;
  }
  headTilt(p){ const a = p[7].v > .4 && p[8].v > .4 ? [p[7], p[8]] : [p[2], p[5]];
    return Math.atan2(a[1].y - a[0].y, a[1].x - a[0].x) * 180 / Math.PI; } // + = 학생 오른쪽으로 기울임(거울 화면 기준 오른쪽 귀가 내려감)

  // 매 프레임(렌더 루프) 호출 → this.f 갱신
  update(dt){
    const D = this.diff, s = this.sens, f = this.f, dtMs = dt * 1000;
    if (this.mode === 'keyboard') this.keyboardFeatures(dt);
    else if (this.mode === 'camera') {
      const now = performance.now(); const p = this.pose;
      const was = f.present; f.present = !!p && now - this.lastSeen < 700;
      if (was && !f.present) this.emit('lost'); if (!was && f.present) this.emit('found');
      if (!f.present) { f.energy *= .9; return f; }
      const B = this.base, sw = Math.max(20, dist(p[11], p[12])), sh = mid(p[11], p[12]), bsw = B.sw;
      const ease = (k, v) => f[k] + (v - f[k]) * Math.min(1, dt * 14);
      f.x = ease('x', clamp((sh.x - B.x) / bsw, -2.5, 2.5));
      const raise = (w, shp) => clamp(((shp.y - w.y) / sw + .25) / (D.raise * s + .25), 0, 1.2);
      f.armL = ease('armL', raise(p[15], p[11])); f.armR = ease('armR', raise(p[16], p[12]));
      const wd = Math.abs(p[15].x - p[16].x) / sw;
      f.spread = ease('spread', clamp((wd - 1.3) / (D.spread * s - 1.3), 0, 1.2));
      let cr = clamp(((sh.y - B.y) / bsw) / (D.crouch * s), 0, 1.3);
      // 상반신만 보일 때를 위한 보조: 두 팔로 몸을 감싸 안기(손목이 반대쪽 어깨 가까이) = 웅크리기
      const hug = dist(p[15], p[12]) < sw * .75 && dist(p[16], p[11]) < sw * .75; if (hug) cr = Math.max(cr, .9);
      f.crouch = ease('crouch', cr);
      f.tilt = ease('tilt', clamp((this.headTilt(p) - B.tilt) / (D.tilt * s), -1.4, 1.4));
      const vec = (a, b) => { const d = dist(a, b) || 1; return { x: (b.x - a.x) / d, y: (b.y - a.y) / d }; };
      const lv = (o, k, v) => { o[k].x += (v.x - o[k].x) * Math.min(1, dt * 16); o[k].y += (v.y - o[k].y) * Math.min(1, dt * 16); };
      if (p[13].v > .3) lv(f.vec.L, 'u', vec(p[11], p[13])); if (p[15].v > .3) lv(f.vec.L, 'f', vec(p[13], p[15]));
      if (p[14].v > .3) lv(f.vec.R, 'u', vec(p[12], p[14])); if (p[16].v > .3) lv(f.vec.R, 'f', vec(p[14], p[16]));
      f.energy += ((this.rawEnergy || 0) - f.energy) * Math.min(1, dt * 6);
      f.quality = Math.min(p[11].v, p[12].v, p[15].v, p[16].v);
    }
    // 상태(히스테리시스) — 켜짐 1.0 / 꺼짐 0.6
    const L = this.latch;
    if (L.armL.step(f.armL, 1, .6, dtMs)) this.emit(L.armL.on ? 'armL:up' : 'armL:down');
    if (L.armR.step(f.armR, 1, .6, dtMs)) this.emit(L.armR.on ? 'armR:up' : 'armR:down');
    if (L.spread.step(f.spread, 1, .6, dtMs)) this.emit(L.spread.on ? 'spread:on' : 'spread:off');
    if (L.crouch.step(f.crouch, 1, .6, dtMs)) this.emit(L.crouch.on ? 'crouch:on' : 'crouch:off');
    L.tiltL.step(-f.tilt, 1, .6, dtMs); L.tiltR.step(f.tilt, 1, .6, dtMs);
    L.moving.step(f.energy, D.moveOn * s, D.moveOff * s, dtMs);
    f.armLUp = L.armL.on; f.armRUp = L.armR.on; f.spreadOn = L.spread.on; f.crouchOn = L.crouch.on && !L.spread.on;
    f.tiltDir = L.tiltR.on ? 1 : L.tiltL.on ? -1 : 0; f.moving = L.moving.on;
    return f;
  }
  // 크기 상태: big(웅크림) / small(펼침) / mid(평범)
  sizeState(){ const f = this.f; return f.spreadOn ? 'spread' : f.crouchOn ? 'crouch' : 'normal'; }
  // 좌우 위치 상태(문턱 = 난이도)
  sideState(){ const th = this.diff.lateral * this.sens; return this.f.x > th ? 1 : this.f.x < -th ? -1 : 0; }

  keyboardFeatures(dt){
    const k = this.keys, f = this.f, e = (key, v, sp) => { f[key] += (v - f[key]) * Math.min(1, dt * (sp || 10)); };
    f.present = true;
    if (k.arrowleft) this.kbX -= dt * 2.2; if (k.arrowright) this.kbX += dt * 2.2; if (k.x) this.kbX *= Math.max(0, 1 - dt * 6);
    this.kbX = clamp(this.kbX, -1.6, 1.6); e('x', this.kbX);
    const lu = !!k.q, ru = !!k.e, sp = !!(k.arrowup || k.w), cr = !!(k.arrowdown || k.s);
    e('armL', lu ? 1.1 : 0); e('armR', ru ? 1.1 : 0); e('spread', sp ? 1.15 : 0); e('crouch', cr ? 1.15 : 0, 7); e('tilt', k.z ? -1.15 : k.c ? 1.15 : 0);
    e('energy', k[' '] ? 2.2 : 0.1, 6);
    const V = (ang) => ({ x: Math.sin(ang), y: Math.cos(ang) });
    const la = sp ? -Math.PI / 2 : lu ? -2.7 : -.12, ra = sp ? Math.PI / 2 : ru ? 2.7 : .12; // 화면 기준 각도(0 = 아래)
    const sw = k[' '] ? Math.sin(performance.now() / 160) * .5 : 0;
    f.vec.L.u = V(la + sw); f.vec.L.f = V(la + sw + (lu ? 0 : -.25)); f.vec.R.u = V(ra - sw); f.vec.R.f = V(ra - sw + (ru ? 0 : .25));
    f.quality = 1;
  }
}
