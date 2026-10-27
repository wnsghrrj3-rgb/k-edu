// 합성 관절열 혼동 행렬(02 문서 13-1) — 7종 동작 + 방해 동작, 각 50변형(속도 ±30%, 크기 ±20%, 잡음 σ=.03sw)
// node tests/sim/input.mjs  → 대각(의도 동작 잡힘) ≥ 95%, 방해 동작 오발 ≤ 3% 이면 통과
import { WizardInput } from '../../sim/input/wizardInput.js';
import { createRng } from '../../sim/core/rng.js';
const rng = createRng(42); const gauss = () => { let u = 0, v = 0; while (!u) u = rng.next(); while (!v) v = rng.next(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const W = 640, H = 480, ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k), lerp = (a, b, k) => a + (b - a) * k;
// 몸 하나: 어깨폭 S 픽셀, 어깨 중심 (cx, sy). 손목·팔꿈치는 [x,y] 어깨폭 단위(어깨 중심 기준)
function body(o){ const S = o.S, cx = o.cx, sy = o.sy, n = () => gauss() * .03 * S; const P = (x, y) => ({ x: cx + x * S + n(), y: sy + y * S + n(), z: 0, v: 1 });
  const p = new Array(33).fill(null).map(() => P(0, 0)); p[0] = P(0, -.75); p[11] = P(-.5, 0); p[12] = P(.5, 0); p[23] = P(-.3, 1.35); p[24] = P(.3, 1.35);
  p[13] = P(...o.eL); p[14] = P(...o.eR); p[15] = P(...o.wL); p[16] = P(...o.wR); return p; }
const REST = { wL: [-.6, 1.05], wR: [.6, 1.05], eL: [-.62, .55], eR: [.62, .55] };
// 동작 정의: f(k 0~1 진행, sp 속도배율, sz 크기배율) → 몸 변화. dur 초
const ACT = {
  attackR: { dur: 1.0, want: 'ATTACK', f: (t, sp, sz) => { const k = ease((t - .2) / (.17 / sp)), back = ease((t - .6) / .4); const w = [lerp(.6, 1.35 * sz, k - back), lerp(1.05, .15, k - back)]; return { wR: w, eR: [lerp(.62, 1.0 * sz, k - back), lerp(.55, .2, k - back)] }; } },
  attackL: { dur: 1.0, want: 'ATTACK', f: (t, sp, sz) => { const k = ease((t - .2) / (.17 / sp)), back = ease((t - .6) / .4); return { wL: [lerp(-.6, -1.35 * sz, k - back), lerp(1.05, .15, k - back)], eL: [lerp(-.62, -1.0 * sz, k - back), lerp(.55, .2, k - back)] }; } },
  swingR:  { dur: 1.0, want: 'ATTACK', f: (t, sp, sz) => { const k = ease((t - .2) / (.15 / sp)), back = ease((t - .6) / .4); return { wR: [lerp(.2, 1.4 * sz, k - back), lerp(.6, .45, k - back)], eR: [lerp(.5, .9, k - back), .5] }; } },
  dodgeL:  { dur: 1.2, want: 'DODGE', f: (t, sp, sz) => ({ dx: -lerp(0, .85 * sz, ease((t - .2) / (.2 / sp))) }) },
  duck:    { dur: 1.4, want: 'DUCK', f: (t, sp, sz) => ({ dy: lerp(0, .45 * sz, ease((t - .2) / (.3 / sp)) - ease((t - 1.0) / .3)) }) },
  cast:    { dur: 2.2, want: 'CAST', f: (t, sp, sz) => { const up = ease((t - .2) / (.4 / sp)), down = ease((t - 1.5) / (.25 / sp)), k = up - down;
              return { wL: [lerp(-.6, -.15, k), lerp(1.05, -1.5 * sz, k)], wR: [lerp(.6, .15, k), lerp(1.05, -1.5 * sz, k)], eL: [lerp(-.62, -.55, k), lerp(.55, -.35, k)], eR: [lerp(.62, .55, k), lerp(.55, -.35, k)] }; } },
  block:   { dur: 1.4, want: 'BLOCK', f: (t, sp, sz) => { const k = ease((t - .2) / (.3 / sp)) - ease((t - 1.0) / .3);
              return { wL: [lerp(-.6, .25 * sz, k), lerp(1.05, .55, k)], wR: [lerp(.6, -.25 * sz, k), lerp(1.05, .55, k)], eL: [lerp(-.62, -.7, k), lerp(.55, .8, k)], eR: [lerp(.62, .7, k), lerp(.55, .8, k)] }; } },
  moveSlow:{ dur: 1.6, want: 'MOVE', f: (t, sp, sz) => ({ dx: lerp(0, 1.0 * sz, ease((t - .2) / (1.0 / sp))) }) },
  // 방해 동작 — 아무것도 잡히면 안 됨
  idle:    { dur: 2.0, want: null, f: () => ({}) },
  walkSwing:{ dur: 2.0, want: null, f: (t, sp, sz) => { const s = Math.sin(t * Math.PI * 3 * sp) * .25 * sz; return { dx: t * .5, wL: [-.6 + s, 1.05 + Math.abs(s) * .3], wR: [.6 - s, 1.05 + Math.abs(s) * .3] }; } },
  scratch: { dur: 1.6, want: null, f: (t, sp, sz) => { const k = ease((t - .2) / (.6 / sp)) - ease((t - 1.1) / .4); return { wR: [lerp(.6, .3, k), lerp(1.05, -.55 * sz, k)], eR: [lerp(.62, .7, k), lerp(.55, -.1, k)] }; } },
  clap:    { dur: 1.2, want: null, f: (t, sp, sz) => { const k = ease((t - .2) / (.2 / sp)) - ease((t - .6) / .3); return { wL: [lerp(-.6, -.05, k), lerp(1.05, .5, k)], wR: [lerp(.6, .05, k), lerp(1.05, .5, k)] }; } },
  chat:    { dur: 2.0, want: null, f: (t, sp) => ({ wR: [.6 + Math.sin(t * 7 * sp) * .12, 1.0 + Math.sin(t * 5) * .1], dx: Math.sin(t * 2) * .05 }) },
};
const DET = ['ATTACK', 'DODGE', 'DUCK', 'CAST', 'BLOCK', 'CHARGE'];
function trial(name, i){
  const a = ACT[name], sp = 1 + (rng.next() * 2 - 1) * .3, sz = 1 + (rng.next() * 2 - 1) * .2, S = 110, cx0 = 320, sy0 = 170;
  const wi = new WizardInput({ stage: 'C', cal: { sw0: S, cx0, yS0: sy0, uMax: 1.6, vPeak: 0, aPeak: 0 } });
  wi.charge.chargeTime = .5; const got = new Set(); let t = 0;
  const run = (secs, fn) => { for (let s = 0; s < secs; s += 1 / 30) { const tt = s + (rng.next() - .5) * .008; const o = Object.assign({}, REST, fn ? fn(tt) : {}); const dx = o.dx || 0, dy = o.dy || 0;
      wi.pose(body({ S, cx: cx0 + dx * S, sy: sy0 + dy * S, wL: o.wL, wR: o.wR, eL: o.eL, eR: o.eR }), (t += 1000 / 30), W, H);
      for (const e of wi.drain()) { if (e.type === 'CHARGE' && !e.value.start) continue; if (e.type === 'DUCK' && !e.value.on) continue; if (e.type === 'BLOCK' && !e.value.on) continue; if (DET.includes(e.type)) got.add(e.type); if (e.type === 'MOVE' && Math.abs(e.value.u) > .3) got.add('MOVE'); } } };
  run(.6); run(a.dur, tt => a.f(tt, sp, sz)); run(.8, () => a.f(a.dur, sp, sz));   // 끝 자세 유지(순간이동 방지)
  return got;
}
const rows = []; let diagOk = 0, diagN = 0, falseN = 0, distN = 0;
for (const name of Object.keys(ACT)) { const want = ACT[name].want; const cnt = {}; let hit = 0, wrong = 0;
  for (let i = 0; i < 50; i++) { const got = trial(name, i); for (const k of got) cnt[k] = (cnt[k] || 0) + 1;
    const others = [...got].filter(k => k !== want && k !== 'MOVE' && !(want === 'CAST' && k === 'CHARGE') && !(want === 'DODGE'));
    if (want) { if (got.has(want)) hit++; if (others.length) wrong++; } else if ([...got].some(k => k !== 'MOVE')) wrong++; }
  if (want) { diagOk += hit; diagN += 50; } else { falseN += wrong; distN += 50; }
  rows.push({ 동작: name, 의도: want || '(없음)', 잡힘: want ? hit + '/50' : '-', 다른동작: wrong + '/50', 감지: JSON.stringify(cnt) }); }
console.table(rows);
const diag = diagOk / diagN, fp = falseN / distN;
console.log(`대각 ${(diag * 100).toFixed(1)}% (기준 ≥95%) · 방해 오발 ${(fp * 100).toFixed(1)}% (기준 ≤3%) → ${diag >= .95 && fp <= .03 ? '통과' : '미달'}`);
if (process.env.DBG_ACT) { const nm = process.env.DBG_ACT; const a = ACT[nm]; const S = 110, cx0 = 320, sy0 = 170; const wi = new WizardInput({ stage: 'C', cal: { sw0: S, cx0, yS0: sy0, uMax: 1.6 } }); let t = 0;
  for (const [secs, fn] of [[.6], [a.dur, tt => a.f(tt, 1, 1)], [.8, () => a.f(a.dur, 1, 1)]]) for (let s = 0; s < secs; s += 1 / 30) { const o = Object.assign({}, REST, fn ? fn(s) : {});
    wi.pose(body({ S, cx: cx0 + (o.dx || 0) * S, sy: sy0 + (o.dy || 0) * S, wL: o.wL, wR: o.wR, eL: o.eL, eR: o.eR }), (t += 1000 / 30), W, H); for (const e of wi.drain()) if (e.type !== 'MOVE') console.log((t / 1000).toFixed(2), e.type, JSON.stringify(e.value)); } }
