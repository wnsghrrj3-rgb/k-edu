/* 장 1 · 첫날 「백운평 — 꾀어서 가두기」 (1920년 10월 21일 아침) — 설계 v2 ④ 장 1
   차례: 흔적 놓기(새벽 안개 90초) → 신호 자리로 가서 엎드리기 → 숨죽이기(추격대가 들어온다 · 신병 기침 · 까마귀 · 모닥불 앞 멈칫)
        → 신호(꼬리가 어귀 표지 바위를 지난 뒤) → 싸움(자동) → 빠질 때(본대 · 산포 — 망바위에서 본대를 살펴 일찍 빠질 수 있다 · 한 번 더 칠까)
        → 고갯마루로 넘기(붉은 산포 고리 피하기 · 떨어진 총 줍기).
   흔적 수 → 추격대가 어디서 멈칫하나: 0 = 어귀 가까이서 두 번 오래(살피는 눈이 넓다) · 1 = 좁은 길 가운데 · 2 = 빈터 앞 · 3 = 모닥불까지(만져 보고 다시 걷는다).
   신호가 이르면 어귀 밖 꼬리가 달아나 본대가 일찍 온다 · 늦으면(앞머리가 빈터 끝) 고갯마루 조가 먼저 맞닥뜨린다 · 안 올리면 앞머리가 고개에 닿아 매복이 깨진다.
   흔적 놓기는 놀이 장치 — 역사 줄에 쓰지 않는다. */
import { clamp, dist, lerp, ART, art } from '../scene/kit.js';
import { SPOTS, SIGNAL, BOULDER, LOOK_A, CAMP, dressSlopes, gradeOf } from './ch0.js';

export const MARKER = [248, 176.5], MARKER_X = 248, LATE_X = 52, PASS = [33, 172.5], PICK = [152, 169];
export const TRACES = [{ id: 'fire', x: 60, z: 172, t: '식은 모닥불' }, { id: 'pack', x: 74, z: 164.5, t: '버린 짐' }, { id: 'foot', x: 47, z: 171, t: '고개 쪽 발자국' }];
const HES = [[{ x: 216, halt: 20 }, { x: 150, halt: 14 }], [{ x: 168, halt: 12 }], [{ x: 120, halt: 7 }], [{ x: 66, halt: 4, fire: true }]];
const VPATH = [[352, 183], [338, 182], [300, 173], [263, 169], [250, 168], [214, 168], [151, 168], [88, 169], [70, 170], [52, 170], [34, 172], [0, 175]];
const BPATH = [[446, 177], [396, 178], [366, 182], [338, 182], [300, 173], [263, 169], [250, 168], [214, 168], [151, 168], [88, 169], [52, 170]];
const TR_LEN = 90, LOSS = { A: 2, B: 6, C: 12 };

export default function ch1(c) {
  const { S, say, cmd, band, pad, pads, put, ppl, army, fx, choose, closeChoice, SFX, H, card } = c;
  const st = { ph: 'trace', t: 0, placed: {}, traces: 0, van: null, main: null, hes: 0, sig: null, caught: 0, fled: 0, late: false, broken: null, units: [], flashT: 0, lossLeft: 0, lossT: 0, shellT: 0, order: false, withdrawn: false, withdrawAt: null, extra: false, pick: false, pickT: 0, crow: null, cough: null, cough2: false, halt50: false, mainSeen: false, shellHits: 0, firstSeen: null, crows: [], fog: 1, retreatT: 0, passHit: 0 };
  const P = {};
  let N0 = null, S0 = null;
  const ch = {
    id: 1, title0: '첫날 · 10월 21일 백운평', title: '꾀어서 가두기', when: '1920년 10월 21일 아침', place: '백운평', len: 600, region: [24, 104, 300, 224], zones: [], yaw: -Math.PI / 2,
    goal: '추격대를 골짜기에 다 가두고, 본대가 오기 전에 빠진다', idle: '숨죽이고 기다린다',
    K: { TRACES, SIGNAL, LOOK_A, PASS, PICK, MARKER_X, LATE_X },
    get st() { return st; },
    start() {
      if (!S.tags.grade) { S.tags.grade = 'B'; S.tags.pickN = 'ga'; S.tags.pickS = 'ra'; }
      N0 = SPOTS.find((s) => s.id === S.tags.pickN) || SPOTS[0]; S0 = SPOTS.find((s) => s.id === S.tags.pickS) || SPOTS[3];
      S.px = 66; S.pz = 177; S.pdir2 = Math.PI / 2;
      dressSlopes(c); c.putArt('cs_tent_cmd', CAMP.tent[0], CAMP.tent[1], 0.35);   /* 천막은 걷었다 — 사령관 천막 하나만 남김(짐 실을 것) */
      /* 우리 편: 고른 두 자리에 엎드린 조 · 고갯마루 조 */
      const lay = (s, n, gi) => { const face = s.side === 'N' ? 0 : Math.PI; for (let i = 0; i < n; i++) { const x = s.x + (i - (n - 1) / 2) * 2.4 + Math.sin(i * 2.1) * 0.6, z = s.z + Math.cos(i * 1.7) * 1.2 + (s.side === 'N' ? 0.6 : -0.6) * Math.abs(i - n / 2) * 0.15; const g = army.iaP[(i + gi) % 3]; st.units.push({ u: g.add({ x, z, ry: face }), x, z, ry: face, side: s.side, g: (i + gi) % 3, run: null }); } };
      lay(N0, 16, 0); lay(S0, 16, 1);
      for (let i = 0; i < 8; i++) { const x = 38 + (i % 4) * 1.6, z = 167 + Math.floor(i / 4) * 9 + Math.sin(i) * 0.6; const g = army.iaK[i % 3]; st.units.push({ u: g.add({ x, z, ry: Math.PI / 2 }), x, z, ry: Math.PI / 2, side: 'P', g: i % 3, kneel: true, run: null }); }
      P.mak = ppl.cast('mak', SIGNAL[0] - 3.4, SIGNAL[1] + 1.6, Math.PI); P.mak.pose = 'prone';
      P.bug = ppl.cast('bug', SIGNAL[0] - 1.2, SIGNAL[1] + 3.4, Math.PI); P.bug.pose = 'prone';
      P.lee = ppl.cast('lee', S0.x - 3, S0.z + 2.4, Math.PI); P.lee.pose = 'kneel';
      P.kim = ppl.cast('kim', PASS[0] - 2, PASS[1] + 4, Math.PI / 2);
      /* 고리 */
      for (const tr of TRACES) pad('tr_' + tr.id, tr.x, tr.z, 0xffcf4d, 1.9);
      pad('sig', SIGNAL[0], SIGNAL[1], 0xe0402a, 2.4); pad('lookA', LOOK_A[0], LOOK_A[1], 0xffcf4d, 2.2); pad('pass', PASS[0], PASS[1], 0xffcf4d, 3.4); pad('pick', PICK[0], PICK[1], 0x8ad08a, 2.0);
      c.scene.fog.color.set(0xd8dce0); c.scene.fog.near = 14; c.scene.fog.far = 95; c.sky.paint(0xb8c4d4, 0xe8e4dc, 0xffe0c0, [0.8, 0.08, 0.3], 0.6);
      c.sun.color.set(0xffe2c0); c.sun.intensity = 1.5; c.hemi.intensity = 1.0;
      ch.sunOff = [70, 50, 30];
      st.vanSpawn = TR_LEN + 6;
      setTimeout(() => say('새벽 안개 — 안개가 걷히기 전에 빈터에 흔적을 놓자(달아난 것처럼)', null, 4.4), 3400);
    },
    timeK() { if (st.ph === 'trace') return clamp(1 - st.t / TR_LEN, 0, 1); if ((st.ph === 'hold' || st.ph === 'extra') && st.main) return clamp((army.headX(st.main) - 255) / 190, 0, 1); return st.ph === 'hide' ? 1 : 0; },
    update(dt) {
      st.t += dt; const ph = st.ph, tm = document.getElementById('time').firstChild;
      const lab = ph === 'trace' ? '10월 21일 새벽 · 안개가 걷히기까지 ' : ph === 'hide' ? '10월 21일 아침 · 숨죽이기 ' : ph === 'fight' ? '10월 21일 아침 · 싸움 ' : ph === 'hold' || ph === 'extra' ? '본대가 닿기까지 ' : '고갯마루로 ';
      if (tm.textContent !== lab) tm.textContent = lab;
      /* 안개가 걷힌다 */
      const fogK = ph === 'trace' ? clamp(1 - (st.t - 50) / 40, 0, 1) : Math.max(0, st.fog - dt * 0.05); st.fog = fogK; c.scene.fog.near = lerp(120, 14, fogK); c.scene.fog.far = lerp(560, 95, fogK);
      if (ph === 'trace') { if (st.t > 55) say('안개가 걷힌다 — 곧 추격대가 온다. 신호 자리로!', 'fogLift', 3.4);
        if (st.t >= TR_LEN || (st.traces >= 3 && dist(S.px, S.pz, SIGNAL[0], SIGNAL[1]) < 3 && S.crouch && st.t > 20)) ch.toHide(); }
      if (ph === 'hide') ch.hide(dt);
      if (ph === 'fight' || ph === 'broken') ch.fight(dt);
      if (ph === 'hold' || ph === 'extra') ch.hold(dt);
      if (ph === 'retreat') ch.retreat(dt);
      /* 우리 편 사람들 */
      for (const p of st.units) { if (p.run) continue; p.u.x = p.x; p.u.z = p.z; p.u.ry = p.ry; }
      if (st.crows.length) for (const cw of st.crows) { cw.t += dt; cw.m.position.set(cw.x + cw.vx * cw.t, cw.y + cw.t * 4 + Math.sin(cw.t * 9) * 0.3, cw.z + cw.vz * cw.t); cw.m.rotation.z = Math.sin(cw.t * 14) * 0.5; if (cw.t > 7) cw.m.visible = false; }
      /* 고리 보이기 */
      for (const tr of TRACES) pads['tr_' + tr.id].m.visible = ph === 'trace' && !st.placed[tr.id];
      pads.sig.m.visible = ph === 'trace' ? st.traces >= 1 : ph === 'hide' || ph === 'hold';
      pads.lookA.m.visible = ph === 'hold' && !st.mainSeen; pads.pass.m.visible = ph === 'retreat'; pads.pick.m.visible = (ph === 'hold' || ph === 'retreat') && !st.pick;
    },
    toHide() { st.ph = 'hide'; st.t = 0; S.detOn = true; S.det = 0; S.yawT = 0;   /* 남쪽 비탈에서 길(북쪽)을 내려다보게 */ say('추격대가 온다 — 신호 자리(붉은 고리)로 가서 C 로 엎드리자', null, 4);
      const tr = st.traces; st.hesList = HES[tr].map((h) => ({ ...h, done: false }));
      st.van = army.column({ n: 60, p: c.path(VPATH), files: 3, gap: 3.5, speed: 1.75, s0: 0, name: '추격대', seed: 7 });
      ch.colTarget(st.van, '추격대'); },
    colTarget(col, nm) { c.addTarget({ id: 'col_' + nm, get x() { const p = army.center(col); return p ? p[0] : -999; }, get y() { const p = army.center(col); return p ? H(p[0], p[1]) + 1.5 : -999; }, get z() { const p = army.center(col); return p ? p[1] : -999; }, range: 470, need: 0.5, labelY: 2.8, off: () => col.gone || !army.center(col),
      ok: (eye) => { const p = army.center(col); return p && c.losClear(eye.x, eye.y, eye.z, p[0], H(p[0], p[1]) + 1.6, p[1], 3); },
      label: () => `${nm} 약 ${army.alive(col)}명<small>${col.dir > 0 ? '서쪽(우리 쪽)으로 →' : '동쪽으로 물러간다'}${col.off && col.off.st === 'walk' ? ' · 말 탄 장교' : ''}</small>`, line: () => `⚔ ${nm} 약 ${army.alive(col)}명`,
      onSeen: () => { col.seen = true; if (nm === '본대') { st.mainSeen = true; S.tags.seen_chase = 1; say('본대다 — 산포를 끌고 온다! 깃발 자리(또는 이 망바위)에서 F — 빠지자', null, 4.4); } } }); },
    /* ───── 숨죽이기 ───── */
    hide(dt) { const v = st.van; if (!v) return; const hx = army.headX(v), tx = army.tailX(v), py = H(S.px, S.pz);
      /* 멈칫 */
      for (const h of st.hesList) if (!h.done && hx <= h.x) { h.done = true; v.halt = h.halt; v.look = 1; if (h.fire) { say('앞머리가 식은 모닥불을 만져 본다…', null, 3); } else say(st.traces === 0 ? '추격대가 멈칫한다 — 흔적이 없어 비탈을 두리번거린다!' : '추격대가 멈칫한다 — 두리번거린다', null, 3.2); }
      if (v.halt <= 0) v.look = 0;
      if (v.halt <= 0 && st.hesList.some((h) => h.done) && !st.goOn && hx < 220) { st.goOn = true; if (st.traces >= 2) say('흔적을 믿었다 — 다시 걷는다', null, 2.4); }
      /* 들킴: 가장 가까운 적의 눈에서 내 몸까지 */
      let best = 1e9, seen = false; const R = v.halt > 0 ? 58 : 40, ty = py + (S.crouch ? 0.35 : 1.5);
      for (let i = 0; i < v.men.length; i += 2) { const m = v.men[i]; if (m.st !== 'walk') continue; const [x, z, , arc] = army.manPos(v, m); if (arc <= 0) continue; const d = dist(x, z, S.px, S.pz); if (d < best && d < R && c.losClear(x, H(x, z) + 1.6, z, S.px, ty, S.pz, 3)) { best = d; seen = true; } }
      if (seen) S.det += c.exposure() * 30 * (1 - best / R) * (v.halt > 0 ? 1.3 : 1) * dt; else S.det = Math.max(0, S.det - 5 * dt);
      if (!st.halt50 && S.det >= 50) { st.halt50 = true; v.halt = Math.max(v.halt, 5); v.look = 1; say('? 앞머리가 이쪽 비탈을 본다 — 엎드려 가만히!', null, 3); SFX.drum(0.5); }
      /* 까마귀 */
      if (!st.crow && hx < 232) { st.crow = { t: 0, hit: false }; SFX.crow(); say('까마귀가 난다! — 지금 움직이면 눈에 띈다', null, 2.8); const m0 = ART.cs_crow; for (let i = 0; i < 6; i++) { const m = m0 ? art('cs_crow') : new c.THREE.Mesh(new c.THREE.BoxGeometry(0.6, 0.1, 0.25), new c.THREE.MeshBasicMaterial({ color: 0x222222 })); const x = 196 + i * 3, z = 154 + (i % 2) * 6; m.position.set(x, H(x, z) + 6, z); c.scene.add(m); st.crows.push({ m, x, y: H(x, z) + 6, z, vx: 3 + i, vz: -2 - i * 0.5, t: 0 }); } }
      if (st.crow && st.crow.t < 3.2) { st.crow.t += dt; if (S.moving && !st.crow.hit) { st.crow.hit = true; S.det += 22; say('까마귀가 날 때 움직였다 — 눈길이 이쪽으로!', null, 2.6); } }
      /* 막둥이 기침 */
      const near = dist(S.px, S.pz, P.mak.x, P.mak.z) < 3.4 && S.crouch && !S.moving;
      if (!st.cough && hx < 238) { st.cough = { t: 6.5, calmT: 0 }; ppl.talk(P.mak, '…콜록', 2.6, 1.6); say('막둥이가 기침하려 한다 — 곁에 기어가 가만히 엎드리자', null, 3.4); }
      if (!st.cough2 && st.cough && st.cough.done && !S.tags.calm && hx < 150) { st.cough2 = true; st.cough = { t: 6.5, calmT: 0 }; ppl.talk(P.mak, '…콜록', 2.6, 1.6); }
      if (st.cough && !st.cough.done) { const q = st.cough; q.t -= dt; if (near) q.calmT += dt; if (q.calmT >= 1.4) { q.done = true; q.held = true; ppl.talk(P.mak, '(꾹 참는다)', 2.4, 1.6); SFX.good(); } else if (q.t <= 0) { q.done = true; SFX.cough(); S.det += S.tags.calm ? 14 : 30; ppl.talk(P.mak, '콜록! 콜록!', 2.4, 1.6); P.mak.pose = 'cough'; st.coughPose = 1.6; } }
      if (st.coughPose > 0) { st.coughPose -= dt; if (st.coughPose <= 0) P.mak.pose = 'prone'; }
      S.det = clamp(S.det, 0, 100);
      if (S.det >= 100) return ch.breakAmbush('들켰다! 매복이 깨졌다');
      if (hx < 44 && !st.sig) return ch.breakAmbush('앞머리가 고갯마루에 닿았다 — 고갯마루 조가 홀로 맞닥뜨린다');
      S.tension = clamp(0.25 + (tx < MARKER_X ? 0.4 : 0) + (hx < 90 ? 0.3 : 0), 0, 1);
      if (tx < MARKER_X) say('꼬리가 어귀 표지 바위를 지났다 — 지금이다! F', 'tailIn', 3.4);
    },
    signal() {
      const atSig = dist(S.px, S.pz, SIGNAL[0], SIGNAL[1]) < 2.8, atA = dist(S.px, S.pz, LOOK_A[0], LOOK_A[1]) < 3;
      if (st.ph === 'hide' && atSig) { const v = st.van; if (!v || army.headX(v) > 300) { say('아직 아무도 안 왔다 — 기다리자', null, 2); return true; } ch.spring(); return true; }
      if ((st.ph === 'hold' || st.ph === 'fight') && (atSig || atA)) { if (st.ph === 'fight') { say('아직 싸우는 중 — 끝나면 빠지자', null, 2); return true; } ch.withdraw(); return true; }
      if (st.ph === 'trace' && atSig) { say('추격대가 아직 안 왔다 — 흔적부터', null, 2); return true; }
      return false; },
    /* ───── 신호 → 싸움 ───── */
    spring() { const v = st.van, hx = army.headX(v); st.ph = 'fight'; st.t = 0; S.detOn = false; S.tension = 0.5; v.halt = 999; v.look = 1;
      let inN = 0, outN = 0; st.doom = [];
      for (const m of v.men) { if (m.st !== 'walk') continue; const [x, , , arc] = army.manPos(v, m); if (arc > 0 && x < MARKER_X) { inN++; st.doom.push({ m, at: 1.5 + Math.random() * 26 }); } else outN++; }
      st.caught = inN; st.fled = outN; st.late = hx < LATE_X; st.sig = { t: S.cht, hx, tx: army.tailX(v) };
      if (v.off) { v.off.st = 'flee'; v.off.arc = v.s - v.off.back; }
      st.fleeL = []; for (const m of v.men) if (m.st === 'walk' && !st.doom.find((d) => d.m === m)) st.fleeL.push({ m, at: 0.9 + Math.random() * 0.8 });
      st.lossLeft = LOSS[S.tags.grade] + (st.late ? 8 : 0); band('ammo', -8, '매복');
      st.quiet = 0.6; if (st.late) say('늦었다 — 앞머리가 빈터 끝에서 고갯마루 조와 맞닥뜨렸다!', null, 3.6);
      else if (outN > 6) say('일렀다 — 어귀 밖 꼬리가 달아난다! 본대를 부르러 간다', null, 3.6);
      else say('다 들어왔다 — 골짜기가 닫혔다!', null, 3);
      for (const k in pads) if (k.startsWith('tr_')) pads[k].m.visible = false; },
    breakAmbush(why) { if (st.broken) return; const v = st.van; st.broken = why; st.ph = 'broken'; st.t = 0; S.detOn = false; say(why, null, 4); SFX.bad(); cmd('이범석 연성대장', '쏴라! 그대로 맞서라!', 3);
      v.halt = 999; v.look = 1; st.doom = []; let k = 0; for (const m of v.men) { if (m.st !== 'walk') continue; const [x, , , arc] = army.manPos(v, m); if (arc > 0 && x < MARKER_X + 30 && k++ % 3 === 0) st.doom.push({ m, at: 2 + Math.random() * 18 }); }
      st.lossLeft = 25; band('ammo', -8, '맞붙는 싸움'); st.quiet = 0; st.caught = st.doom.length; st.fled = 0;
      if (v.off) { v.off.st = 'flee'; v.off.arc = v.s - v.off.back; } },
    fight(dt) { const v = st.van;
      if (st.quiet > 0) { st.quiet -= dt; if (st.quiet <= 0) { SFX.bugle(); setTimeout(() => SFX.volley(1.2), 260); } return; }
      /* 비탈에서 내려다보며 쏜다(총구 불빛 · 연기) — 적은 쓰러지면서 사라진다 */
      st.flashT -= dt; if (st.flashT <= 0 && st.t < 30) { st.flashT = 0.07; const live = st.units.filter((p) => p.side !== 'P' || st.late || st.broken); const p = live[Math.floor(Math.random() * live.length)]; if (p) { const y = H(p.x, p.z) + 0.45, fx2 = p.x + Math.sin(p.ry) * 1.4, fz = p.z + Math.cos(p.ry) * 1.4; fx.flash(fx2, y, fz, 1.3); if (Math.random() < 0.35) fx.puff(fx2, y + 0.3, fz, { size: 1.2, life: 2, vy: 0.5, op: 0.5 }); if (Math.random() < 0.3) SFX.shot(0.5 + Math.random() * 0.5); } }
      if (Math.random() < dt * 3 && st.t < 26) { const m = v.men[Math.floor(Math.random() * v.men.length)]; if (m.st === 'walk' || m.st === 'flee') { const [x, z] = army.manPos(v, m); fx.flash(x, H(x, z) + 1.5, z, 0.9); SFX.shot(0.3); } }
      for (const d of st.doom) if (!d.f && st.t >= d.at) { d.f = true; army.fall(d.m); }
      if (st.fleeL) for (const d of st.fleeL) if (!d.f && st.t >= d.at) { d.f = true; army.flee(v, d.m); }
      if (st.lossLeft > 0) { st.lossT -= dt; if (st.lossT <= 0) { st.lossT = 24 / Math.max(1, LOSS[S.tags.grade] + 8); const n = Math.min(st.lossLeft, st.broken ? 2 : 1); st.lossLeft -= n; band('troop', -n, st.broken ? '맞붙는 싸움' : '매복 싸움'); } }
      if (st.t > 32 && st.lossLeft <= 0 && st.doom.every((d) => d.f)) ch.toHold();
    },
    toHold() { st.ph = 'hold'; st.t = 0; S.tension = 0.3; const early = st.fled > 6 || !!st.broken, slow = !S.tags.smokeAll;
      const s0 = (early ? 90 : 0) + (slow ? 60 : 0);
      st.main = army.column({ n: 150, p: c.path(BPATH), files: 4, gap: 3.0, speed: 1.5, s0, name: '본대', seed: 11 }); ch.colTarget(st.main, '본대');
      SFX.far(); setTimeout(() => SFX.far(), 1400);
      say(early ? '동쪽에서 산포 소리 — 본대가 벌써 온다! 망바위에서 살피고, 빠질 때를 정하자' : '싸움이 끝났다. 동쪽에서 산포 소리 — 본대가 온다. 망바위에서 살피자', null, 4.6);
      ppl.talk(P.lee, '본대가 온다. 척후, 살피고 알려라!', 3.4); },
    hold(dt) { const m = st.main, dB = army.headX(m) - 255;
      S.tension = clamp(1 - dB / 200, 0.2, 1);
      /* 산포: 본대가 150 m 안 */
      if (dB < 150) { st.shellT -= dt; if (st.shellT <= 0) { st.shellT = 4.5; SFX.far(); const p = st.units[Math.floor(Math.random() * 32)] || st.units[0], x = p.x + (Math.random() - 0.5) * 14, z = p.z + (Math.random() - 0.5) * 10;
        fx.shell(x, z, 3.2, (lx, lz) => { SFX.boom(dist(S.px, S.pz, lx, lz) < 40 ? 1 : 0.4); fx.shake = dist(S.px, S.pz, lx, lz) < 30 ? 1.2 : 0.3; if (!st.withdrawn && [N0, S0].some((s) => dist(lx, lz, s.x, s.z) < 16)) { st.shellHits++; band('troop', -1, '산포 — 비탈 조에서 다친 사람을 뒤로 보냈다'); } if (dist(S.px, S.pz, lx, lz) < 3.2) ch.hitMe(); }); } }
      if (!st.order && dB < 95) { st.order = true; cmd('김좌진 사령관', '거두어라!', 4); say('사령관의 명령 — 지금 빠지지 않으면 크게 잃는다! 깃발 자리에서 F', null, 4); }
      if (st.order && !st.withdrawn) S.tension = 1;
      if (dB <= 0 && !st.withdrawn) { band('troop', -20, '본대가 닿을 때까지 빠지지 못했다'); say('본대가 어귀에 닿았다 — 뒤늦게 흩어져 빠진다', null, 4); ch.withdraw(true); return; }
      if (st.ph === 'extra') { st.t2 = (st.t2 || 0) + dt; for (const d of st.doom2 || []) if (!d.f && st.t2 >= d.at) { d.f = true; army.fall(d.m); } st.flashT -= dt; if (st.flashT <= 0 && st.t2 < 12) { st.flashT = 0.1; const p = st.units[Math.floor(Math.random() * 32)]; if (p) { fx.flash(p.x + Math.sin(p.ry) * 1.4, H(p.x, p.z) + 0.45, p.z + Math.cos(p.ry) * 1.4); if (Math.random() < 0.3) SFX.shot(0.6); } }
        if (st.t2 > 13) { st.ph = 'hold'; say('한 번 더 쳤다 — 이제 빠지자! F', null, 3); } }
      /* 깃발 자리에서 고르기 */
      const atSig = dist(S.px, S.pz, SIGNAL[0], SIGNAL[1]) < 2.8 || dist(S.px, S.pz, LOOK_A[0], LOOK_A[1]) < 3;
      if (st.ph === 'hold' && atSig && !st.extra && !c.choosing() && !st.choiceShown && st.mainSeen) { st.choiceShown = true; choose('본대가 온다 — 어떻게 할까?', [{ t: '지금 빠진다', s: '깃발 F 와 같다', fn: () => ch.withdraw() }, { t: '한 번 더 친다', s: '탄약 −10 · 부대 −6 · 본대에 피해', fn: () => ch.again() }]); }
      if (!atSig && st.choiceShown && c.choosing()) { closeChoice(); st.choiceShown = false; }
    },
    again() { if (st.extra) return; st.extra = true; st.ph = 'extra'; st.t2 = 0; S.tags.longFight = 1; band('ammo', -10, '한 번 더'); band('troop', -6, '한 번 더 — 본대와 맞섰다'); SFX.volley(1.2); const m = st.main; let k = 0; st.doom2 = []; for (const man of m.men) { if (man.st === 'walk' && k < 18) { const [x] = army.manPos(m, man); if (x < 330) { k++; st.doom2.push({ m: man, at: 0.4 + Math.random() * 9 }); } } } st.extraN = k; },
    withdraw(forced) { if (st.withdrawn) return; st.withdrawn = true; st.withdrawAt = { dB: st.main ? army.headX(st.main) - 255 : 0, order: st.order, forced: !!forced }; closeChoice(); st.ph = 'retreat'; st.t = 0;
      if (!forced) { SFX.bugle(); say(st.order ? '빠진다 — 고갯마루로!' : '명령보다 먼저 빠진다 — 본대를 살핀 덕이다. 고갯마루로!', null, 3.6); }
      /* 엎드린 조가 일어나 길로 내려와 서쪽 고갯마루로 */
      for (const p of st.units) { p.u.on = false; const g = army.iaS[p.g]; const ry = -Math.PI / 2; p.run = { u: g.add({ x: p.x, z: p.z, ry }), leg: 0, wait: Math.random() * 3, pts: [[p.x - 6 + Math.random() * 4, 168 + (Math.random() - 0.5) * 6], [PASS[0] + 2 - Math.random() * 6, PASS[1] + (Math.random() - 0.5) * 6], [-10, 175 + (Math.random() - 0.5) * 6]] }; }
      for (const k of ['mak', 'bug', 'lee']) { const q = P[k]; q.pose = 'stand'; q.tx = PASS[0] + 3; q.tz = PASS[1] + (Math.random() - 0.5) * 4; q.speed = 4.2; } },
    hitMe() { st.passHit++; band('troop', -2, '산포 고리에 걸렸다 — 곁의 동지가 다쳐 뒤로 보냈다'); fx.shake = 1.6; SFX.bad(); say('붉은 고리를 피하자!', null, 2); },
    retreat(dt) { st.retreatT += dt;
      for (const p of st.units) { const r = p.run; if (!r) continue; if (r.wait > 0) { r.wait -= dt; continue; } const tg = r.pts[r.leg]; if (!tg) { r.u.on = false; continue; } const d = dist(r.u.x, r.u.z, tg[0], tg[1]); if (d < 1.5) { r.leg++; continue; } const sp = 4.6 * dt; r.u.x += (tg[0] - r.u.x) / d * sp; r.u.z += (tg[1] - r.u.z) / d * sp; r.u.ry = Math.atan2(tg[0] - r.u.x, tg[1] - r.u.z); r.u.bob = Math.abs(Math.sin(S.t * 11 + p.x)) * 0.1; }
      /* 산포가 길을 따라 떨어진다 */
      st.shellT -= dt; if (st.shellT <= 0 && st.retreatT < 80) { st.shellT = 2.2; SFX.far(); const nearMe = Math.random() < 0.3, x = nearMe ? S.px + (Math.random() - 0.5) * 10 : 70 + Math.random() * 170, z = nearMe ? S.pz + (Math.random() - 0.5) * 8 : 168 + (Math.random() - 0.5) * 30;
        fx.shell(x, z, 2.6, (lx, lz) => { SFX.boom(dist(S.px, S.pz, lx, lz) < 40 ? 1 : 0.4); fx.shake = dist(S.px, S.pz, lx, lz) < 25 ? 1 : 0.2; if (dist(S.px, S.pz, lx, lz) < 3.2) ch.hitMe(); }); }
      const m = st.main; if (m && !st.withdrawAt.forced) { m.halt = 0; }
      if (dist(S.px, S.pz, PASS[0], PASS[1]) < 3.6 && st.retreatT > 5) ch.finish();
      else if (st.retreatT > 110) { band('troop', -5, '늦게 넘었다'); ch.finish(); } },
    job() { const ph = st.ph, at = (k) => pads[k] && pads[k].m.visible && dist(S.px, S.pz, pads[k].x, pads[k].z) < pads[k].r;
      for (const tr of TRACES) if (ph === 'trace' && at('tr_' + tr.id)) return { key: 'tr' + tr.id, need: 2.2, label: tr.t + ' 놓기', fn: () => ch.placeTrace(tr) };
      if (at('pick') && !st.pick) return { key: 'pick', need: 10, label: '떨어진 총·탄약 줍기', fn: () => { st.pick = true; band('ammo', 6, '떨어진 총·탄약'); SFX.good(); } };
      return null; },
    placeTrace(tr) { if (st.placed[tr.id]) return; st.placed[tr.id] = 1; st.traces++; SFX.page();
      if (tr.id === 'fire') { c.putArt('cs_fire_cold', tr.x, tr.z); c.putArt('cs_fire_cold', tr.x + 5, tr.z + 3, 1, 0.8); c.putArt('cs_fire_cold', tr.x - 4, tr.z - 3.5, 2, 0.9); }
      if (tr.id === 'pack') c.putArt('cs_pack_drop', tr.x, tr.z, 0.8);
      if (tr.id === 'foot') for (let i = 0; i < 9; i++) { const x = tr.x - i * 1.5, z = tr.z + Math.sin(i) * 0.4 + (i % 2 ? 0.35 : -0.35); c.groundRing(c.scene, x, z, 0.01, 0.22, 0x4a3a2a, 0.7, 7); }
      say(st.traces === 3 ? '흔적 셋 — 급히 달아난 것처럼 보인다. 이제 신호 자리로!' : `${tr.t}을(를) 남겼다 (${st.traces}/3)`, null, 2.8); },
    tasks() { const L = [], ph = st.ph, v = st.van, tailIn = v && army.tailX(v) < MARKER_X, nearTr = () => { let b = null, bd = 1e9; for (const tr of TRACES) if (!st.placed[tr.id]) { const d = dist(S.px, S.pz, tr.x, tr.z); if (d < bd) { bd = d; b = tr; } } return b; };
      L.push({ id: 'trace', req: true, t: '빈터에 흔적 놓기 — 달아난 것처럼', n: () => [st.traces, 3], how: '노란 고리에 가만히 서기 · 식은 모닥불·버린 짐·고개 쪽 발자국. 놓은 만큼 추격대가 깊이 들어온다', done: () => st.traces >= 3, gone: () => ph !== 'trace' && st.traces < 3, at: () => { const tr = nearTr(); return ph === 'trace' && tr ? [tr.x, tr.z] : null; }, tag: () => { const tr = nearTr(); return tr ? tr.t : ''; } });
      L.push({ id: 'hide', req: true, t: '신호 자리(오른 비탈 큰 바위)에서 엎드리기', how: '붉은 고리에 서서 <kbd>C</kbd> — 엎드리면 들킴이 거의 안 오른다', done: () => (dist(S.px, S.pz, SIGNAL[0], SIGNAL[1]) < 2.8 && S.crouch) || !!st.sig || !!st.broken, at: () => SIGNAL, tag: '🚩 신호 자리 — 엎드려', wait: ph === 'trace' && st.traces < 1 });
      L.push({ id: 'wait', req: true, t: '숨죽이기 — 추격대가 다 들어오면 깃발', how: () => (!v ? '추격대가 아직 안 보인다 — 엎드려 기다리자' : tailIn ? '<b>지금!</b> 꼬리가 어귀 표지 바위를 지났다 — <kbd>F</kbd> 깃발' : '꼬리가 아직 어귀 밖이다 — 일찍 올리면 꼬리가 달아난다. 앞머리가 빈터 끝에 닿기 전에'), done: () => !!st.sig || !!st.broken, gone: () => !!st.broken, at: () => (ph === 'hide' && dist(S.px, S.pz, SIGNAL[0], SIGNAL[1]) > 2.8 ? SIGNAL : null), tag: '🚩 신호 자리', wait: ph !== 'hide' || dist(S.px, S.pz, SIGNAL[0], SIGNAL[1]) < 2.8 });
      if (ph === 'hide' && st.cough && !st.cough.done) L.push({ id: 'cough', req: false, t: '막둥이 곁에서 기침 참게 하기', how: '막둥이 곁에 엎드려 가만히', done: () => st.cough.done && st.cough.held, at: () => [P.mak.x, P.mak.z], tag: '⚠ 막둥이' });
      L.push({ id: 'fight', req: true, t: '싸움 — 비탈 조가 내려다보며 친다', how: '엎드려 지켜보자 — 끝나면 본대가 온다', done: () => ph === 'hold' || ph === 'extra' || ph === 'retreat' || st.done, at: () => null, wait: true });
      L.push({ id: 'out', req: true, t: '본대가 오기 전에 빠지기', how: () => (!st.mainSeen ? '망바위 고리에 올라 <kbd>Space</kbd> 꾹 — 본대를 살피고 거기서 바로 <kbd>F</kbd>' : '깃발 자리나 망바위에서 <kbd>F</kbd> — 「거두어라」 전에 빠지면 덜 잃는다'), done: () => st.withdrawn, at: () => (ph === 'hold' ? (!st.mainSeen ? LOOK_A : dist(S.px, S.pz, LOOK_A[0], LOOK_A[1]) < dist(S.px, S.pz, SIGNAL[0], SIGNAL[1]) ? LOOK_A : SIGNAL) : null), tag: () => (st.mainSeen ? '🚩 F — 빠지기' : '🔭 망바위 — 본대 살피기'), wait: ph !== 'hold' && ph !== 'extra' });
      L.push({ id: 'pass', req: true, t: '고갯마루로 — 부대와 함께 넘기', how: '서쪽 고갯마루 고리 · 붉은 고리(산포)는 피한다', done: () => st.done, at: () => (ph === 'retreat' ? PASS : null), tag: '⛰ 고갯마루', wait: ph !== 'retreat' });
      if (ph === 'hold' || ph === 'retreat') L.push({ id: 'pick', req: false, t: '떨어진 총·탄약 줍기 (10초)', how: '길 위 초록 고리에 10초 가만히 — 산포가 떨어지는 길이다', done: () => st.pick, at: () => [PICK[0], PICK[1]], tag: '🎯 총·탄약' });
      return L; },
    tags(put) { const v = st.van;
      if (dist(S.px, S.pz, MARKER[0], MARKER[1]) < 160) put(MARKER[0], H(MARKER[0], MARKER[1]) + 3.4, MARKER[1], '어귀 표지 바위<small>꼬리가 여기를 지나면 신호</small>');
      if (v && !v.gone && st.ph === 'hide') { const [hx, hz] = v.p.at(v.s), tb = army.tailBack(v), [tx, tz] = v.p.at(v.s - tb); if (v.s > 1) put(hx, H(hx, hz) + 3, hz, '앞머리', 'hot'); if (v.s - tb > 1) put(tx, H(tx, tz) + 3, tz, tx < MARKER_X ? '꼬리 — 다 들어왔다' : '꼬리', tx < MARKER_X ? 'good' : ''); }
      if (st.ph === 'hide' && st.cough && !st.cough.done) put(P.mak.x, H(P.mak.x, P.mak.z) + 1.8, P.mak.z, '⚠ 막둥이 — 곁에 엎드려', 'hot');
      for (const s of [N0, S0]) if (st.ph !== 'retreat' && dist(S.px, S.pz, s.x, s.z) < 100) put(s.x, H(s.x, s.z) + 3, s.z, `${s.side === 'N' ? '왼' : '오른'} 비탈 조 (${s.name})`, 'good');
      if (st.main && !st.main.gone && (st.ph === 'hold' || st.ph === 'extra') && st.mainSeen) { const p = army.center(st.main); if (p) put(p[0], H(p[0], p[1]) + 4, p[1], `본대 — 어귀까지 ${Math.max(0, Math.round(army.headX(st.main) - 255))}m`, 'hot'); } },
    mini(g, k) { for (const s of [N0, S0]) { g.fillStyle = '#3fb46a'; g.beginPath(); g.arc(s.x * k, s.z * k, 4, 0, 6.28); g.fill(); } g.fillStyle = '#e0402a'; g.fillRect(MARKER[0] * k - 2, MARKER[1] * k - 2, 4, 4); },
    finish() { if (st.done) return; st.done = true; S.tension = 0; const g = S.tags.grade, v = st.van, total = v ? v.n : 60, frac = st.sig ? st.caught / total : 0, onTime = st.withdrawn && st.withdrawAt && !st.withdrawAt.order && !st.withdrawAt.forced;
      S.tags.caught = Math.round(frac * 100) / 100; S.tags.onTime = onTime ? 1 : 0;
      const head = st.broken ? '매복이 깨졌다' : frac >= 0.95 && S.band.troop >= 90 ? '치고, 사라졌다' : frac >= 0.95 ? '다 가뒀지만 많이 다쳤다' : frac >= 0.6 ? '꼬리를 놓쳤다' : '반만 가뒀다';
      c.endChapter({ b0: ch.b0, head,
        marks: [{ t: `흔적 ${st.traces}/3`, ok: st.traces >= 3 }, { t: '들키지 않음', ok: !st.broken && S.det < 100 }, { t: st.sig ? `가둠 ${Math.round(frac * 100)}%` : '가두지 못함', ok: frac >= 0.95 }, { t: '제때 빠짐', ok: onTime }, { t: `부대 ${Math.round(S.band.troop)}`, ok: S.band.troop >= 90 }],
        lines: [
          `흔적 ${st.traces}개 — ${['추격대가 어귀 가까이서 오래 두리번거렸다', '추격대가 좁은 길 가운데서 멈칫했다', '추격대가 빈터 앞까지 들어왔다', '추격대가 식은 모닥불까지 들어와 「달아났다」고 믿었다'][st.traces]}`,
          st.broken ? `${st.broken} — 맞붙어 싸우느라 많이 다쳤다` : st.sig ? (st.late ? '깃발이 늦었다 — 앞머리가 빈터 끝에서 고갯마루 조와 먼저 맞닥뜨렸다' : st.fled > 6 ? `깃발이 일렀다 — 어귀 밖 꼬리 ${st.fled}명이 달아나 본대가 일찍 왔다` : '꼬리가 표지 바위를 지난 뒤 깃발을 올렸다 — 골짜기가 닫혔다') : '깃발을 올리지 못했다',
          st.sig || st.broken ? `추격대 ${total}명 가운데 ${st.caught}명이 골짜기에서 쓰러졌다 · 우리 자리 ${g}등급` : '',
          st.withdrawAt ? (st.withdrawAt.forced ? '본대가 닿을 때까지 빠지지 못했다 — 흩어져 빠지며 크게 잃었다' : onTime ? '본대를 먼저 살피고 「거두어라」 전에 빠졌다' : '「거두어라」 명령을 듣고 빠졌다 — 그사이 산포에 다친 사람이 나왔다') : '',
          ...(st.extra ? [`한 번 더 쳤다 — 본대 ${st.extraN || 0}명이 쓰러졌지만 탄약과 사람을 더 잃었다`] : []), ...(st.pick ? ['떨어진 총과 탄약을 주워 왔다'] : []), ...(st.passHit ? [`빠지는 길에 산포 고리에 ${st.passHit}번 걸렸다`] : []),
          '— 차례 1은 여기까지. 이어지는 장(완루구·천수평·어랑촌…)은 만드는 중이다.'].filter(Boolean),
        hist: '실제: 1920년 10월 21일 아침, 북로 군정서 부대는 백운평 골짜기 양쪽 비탈과 고갯마루에 숨어 있다가 골짜기로 들어온 일본군 추격대를 쳤고, 뒤따라온 본대에도 큰 피해를 준 뒤 물러났다. 청산리 일대의 싸움은 그 뒤로도 엿새쯤 이어졌다. 일본군이 입은 피해는 <b>기록마다 다르다</b>.<br><small>빈터에 흔적을 놓는 일, 막둥이·나팔 형 같은 부대원은 놀이로 꾸민 것이다(기록에 없다).</small>', delay: 2.2 }); },
    b0: { ...S.band } };
  return ch;
}
