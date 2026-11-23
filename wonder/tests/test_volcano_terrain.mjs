/* 화산 「자라는 땅」 시험 — 설계 2-6 의 문장이 곧 시험 이름(묶음 1: 흐르는 용암 · 날아가 쌓이는 부스러기) */
import assert from 'node:assert/strict';
import { createTerrain, reset, setVent, step, blast, measure, volume, column, deposit, erode, explosivity, tephraShare, KIND } from '../volcano/terrain.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
/** 물 위의 낮고 평평한 땅(높이 10m)에서 v 로 ticks 걸음 */
const grow = (v, ticks = 1200, o = {}) => { const T = createTerrain({ N: 96, base: 10, sea: 0, seed: 5, ...o }); setVent(T, v); for (let i = 0; i < ticks; i++) step(T); return T; };
const RUNNY = { visc: .05, gas: .05, rate: 80 }, STICKY = { visc: .95, gas: .1, rate: 30 }, CINDER = { visc: .12, gas: .92, rate: 58 };
/** 흘러간 끝의 낭떠러지를 빼고 잰 비탈(가운데에서 반지름의 0.25~0.7 배) */
function flank(T) { const m = measure(T), c = (T.N - 1) / 2, R = m.width / 2 / T.cell; let s = 0, k = 0;
  for (let y = 1; y < T.N - 1; y++) for (let x = 1; x < T.N - 1; x++) { const r = Math.hypot(x - c, y - c); if (r < R * .25 || r > R * .7) continue; const i = y * T.N + x;
    s += Math.atan(Math.hypot(T.g[i + 1] - T.g[i - 1], T.g[i + T.N] - T.g[i - T.N]) / (2 * T.cell)); k++; }
  return s / k * 180 / Math.PI; }

t('묽은 용암만 오래 뿜으면 평균 기울기가 10도를 넘지 않는다', () => {
  const T = grow(RUNNY, 1500), m = measure(T);
  assert.ok(m.height > 120, `산이 자랐다(${m.height | 0}m)`);
  assert.ok(flank(T) < 10, `비탈 ${flank(T).toFixed(1)}도`);
  assert.ok(m.width > 3000, `넓게 퍼졌다(${m.width | 0}m)`);
  assert.equal(T.kind[T.N * 48 + 60], KIND.BASALT);                             // 검은 현무암
});
t('끈적한 용암만 뿜으면 높이 ÷ 밑넓이가 묽을 때의 세 배를 넘는다', () => {
  const a = measure(grow(RUNNY, 1500)), T = grow(STICKY, 1500), b = measure(T);
  assert.ok(b.ratio > a.ratio * 3, `돔 ${b.ratio.toFixed(3)} · 방패 ${a.ratio.toFixed(3)}`);
  assert.ok(b.width < a.width * .6, '멀리 못 간다');
  assert.equal(T.kind[T.N * 48 + 50], KIND.TRACHYTE);                           // 밝은 조면암
});
t('기체 많은 폭발만 하면 꼭대기가 팬 원뿔이 된다', () => {
  const T = grow(CINDER, 1200), m = measure(T), c = 48;
  assert.ok(m.craterDepth > 25, `꼭대기가 팼다(${m.craterDepth | 0}m)`);
  const rim = Math.hypot(m.peakAt[0] - T.vent.x, m.peakAt[1] - T.vent.y); assert.ok(rim >= 2 && rim < 12, '가장 높은 곳은 분출구 둘레의 고리');
  let top = 0; for (let x = c; x < c + 12; x++) top = Math.max(top, T.tephra[c * T.N + x]); assert.ok(top > 100, '부스러기가 쌓였다');
  // 부스러기 비탈은 미끄러지는 각(31도쯤)보다 가파르지 않다
  let steep = 0; for (let y = 2; y < T.N - 2; y++) for (let x = 2; x < T.N - 2; x++) { const i = y * T.N + x; if (T.kind[i] !== KIND.TEPHRA || T.kind[i + 1] !== KIND.TEPHRA) continue; steep = Math.max(steep, Math.abs(T.g[i] - T.g[i + 1]) / T.cell); }
  assert.ok(steep < 0.75, `가장 가파른 곳 tan ${steep.toFixed(2)}`);
});
t('묽음과 폭발을 번갈아 하면 겹이 번갈아 쌓인다', () => {
  const T = createTerrain({ N: 96, base: 10, sea: 0, seed: 5 });
  for (let k = 0; k < 6; k++) { setVent(T, k % 2 ? CINDER : RUNNY); for (let i = 0; i < 260; i++) step(T); }
  setVent(T, { rate: 0 }); for (let i = 0; i < 400; i++) step(T);              // 다 굳을 때까지
  let best = 0;
  for (let x = 50; x < 62; x++) { const col = column(T, x, 48); let flips = 0; for (let q = 1; q < col.length; q++) if ((col[q].kind === KIND.TEPHRA) !== (col[q - 1].kind === KIND.TEPHRA)) flips++; best = Math.max(best, flips); }
  assert.ok(best >= 4, `단면에서 용암과 부스러기가 ${best}번 바뀐다`);
  const m = measure(T); assert.ok(m.ratio > measure(grow(RUNNY, 1500)).ratio * 1.5, '방패보다 가파른 층층 화산');
});
t('쌓인 부피는 뿜은 부피와 같다(새는 곳이 없다)', () => {
  for (const v of [RUNNY, STICKY, CINDER, { visc: .9, gas: .95, rate: 100 }]) { const T = grow(v, 500); assert.ok(Math.abs(volume(T) / T.erupted - 1) < 1e-3, JSON.stringify(v) + ' ' + volume(T) / T.erupted); }
  const T = grow(RUNNY, 600), v0 = volume(T), out = blast(T, 1);                // 큰 폭발은 꼭대기를 날려 그대로 다시 뿌린다
  assert.ok(out > 1000); assert.ok(Math.abs(volume(T) / v0 - 1) < 1e-3);
  // 겹의 합 = 두께
  for (const i of [48 * 96 + 48, 48 * 96 + 55, 40 * 96 + 52]) { let s = 0; for (const l of column(T, i % 96, (i / 96) | 0)) s += l.th; assert.ok(Math.abs(s - (T.rock[i] + T.tephra[i])) < .05, '겹의 합'); }
});

// ── 덧붙인 시험: 규칙의 바탕
t('끈적한 용암은 얇으면 아예 못 흐른다(두께 × 기울기가 문턱을 넘어야)', () => {
  const T = createTerrain({ N: 32, base: (x) => 400 - x * 12, sea: -500, seed: 1 });   // 한쪽으로 기운 땅(약 7도)
  for (const [x, comp] of [[10, 0.02], [20, 0.98]]) { const i = 16 * 32 + x; T.melt[i] = 3; T.heat[i] = 1; T.comp[i] = comp; T.box = { x0: 0, x1: 31, y0: 0, y1: 31 }; }
  step(T); step(T);
  assert.ok(T.melt[16 * 32 + 10] < 2.5, '묽은 용암은 흘러내린다'); assert.ok(Math.abs(T.melt[16 * 32 + 20] - 3) < 1e-6, '끈적한 용암은 그대로');
});
t('물 밑에서는 훨씬 빨리 식는다', () => {
  const run = sea => { const T = createTerrain({ N: 48, base: 10, sea, seed: 2 }); setVent(T, { ...RUNNY, rate: 40 }); for (let i = 0; i < 300; i++) step(T); return measure(T); };
  const dry = run(0), wet = run(400); assert.ok(wet.width < dry.width * .75, `물속 ${wet.width | 0}m · 뭍 ${dry.width | 0}m`); assert.ok(wet.ratio > dry.ratio * 1.5, '물속에서는 가파르게 쌓인다');
});
t('폭발 세기 = 기체 × 끈적임: 셀수록 넓게 뿌린다', () => {
  assert.ok(explosivity(.9, .9) > explosivity(.1, .9) && explosivity(.1, .9) > explosivity(.1, .1));
  assert.equal(tephraShare(.5, .1), 0); assert.ok(tephraShare(1, 1) > .99);
  const far = v => { const T = grow(v, 300); let r = 0; for (let x = 48; x < 96; x++) if (T.tephra[48 * 96 + x] > 1) r = x - 48; return r; };
  assert.ok(far({ visc: .9, gas: .95, rate: 60 }) > far(CINDER) + 3);
});
t('걷어 내고 다시 쌓아도 겹이 맞는다 · 처음으로 되돌리기', () => {
  const T = createTerrain({ N: 16, base: 0 }); const i = 8 * 16 + 8;
  deposit(T, i, KIND.BASALT, 5); deposit(T, i, KIND.TEPHRA, 2); deposit(T, i, KIND.BASALT, 1);
  assert.equal(erode(T, i, 1.5), 1.5); assert.equal(T.kind[i], KIND.TEPHRA); assert.ok(Math.abs(T.g[i] - 6.5) < 1e-6); assert.ok(Math.abs(T.tephra[i] - 1.5) < 1e-6);
  assert.equal(erode(T, i, 100), 6.5); assert.equal(T.kind[i], KIND.BASE); assert.equal(T.g[i], 0);
  for (let k = 0; k < 60; k++) deposit(T, i, k % 2 ? KIND.TEPHRA : KIND.BASALT, 1);      // 겹이 꽉 차도 두께는 그대로
  assert.ok(Math.abs(T.g[i] - 60) < 1e-4); assert.ok(column(T, 8, 8).length <= T.L);
  reset(T, { base: 3 }); assert.equal(T.g[i], 3); assert.equal(volume(T), 0);
});
console.log(n + ' 통과');
