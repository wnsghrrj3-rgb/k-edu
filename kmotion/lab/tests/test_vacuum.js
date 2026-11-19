// 케이모션 과학실 — 「공기를 빼면」 압력 계산 시험 (node kmotion/lab/tests/test_vacuum.js)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as VX from '../sim/vacuum.js';

const exp = JSON.parse(readFileSync(new URL('../exp/vacuum/exp.json', import.meta.url), 'utf8'));
const V = VX.vacuumModel(exp), W = exp.water, S = V.specs;
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ✓', name); };

const sealed = (leak = V.leak) => VX.seal(VX.makeChamber(V), leak);
/** 아이가 초당 rate 번 펌프질: 처음으로 p ≤ target 이 되는 횟수 */
function strokesTo(target, rate = 1.5, leak = V.leak, strength = 1){
  let ch = sealed(leak); for (let i = 1; i <= 200; i++) { ch = VX.pumpStroke(ch, strength, V).ch; if (ch.p <= target) return i; ch = VX.stepChamber(ch, 1 / rate, V); } return Infinity; }
const pAtGrowth = (g, s) => 1 / (1 + (g - 1) / s.elastic);

t('펌프질 한 번에 압력이 0.86 배가 된다(끝까지 내린 한 번)', () => { const ch = VX.pumpStroke(sealed(), 1, V).ch; assert.ok(Math.abs(ch.p - 0.86) < 1e-9); });
t('덜 내린 펌프질은 덜 뺀다', () => { const a = VX.pumpStroke(sealed(), 1, V).ch.p, b = VX.pumpStroke(sealed(), 0.4, V).ch.p; assert.ok(b > a && b < 1); assert.ok(Math.abs(b - (1 - 0.14 * 0.4)) < 1e-9); });
t('압력은 0.02 아래로는 내려가지 않는다', () => { let ch = sealed(0); for (let i = 0; i < 200; i++) ch = VX.pumpStroke(ch, 1, V).ch; assert.equal(ch.p, V.pMin); });
t('종을 안 덮으면 펌프질해도 압력이 그대로다', () => { const r = VX.pumpStroke(VX.makeChamber(V), 1, V); assert.equal(r.ch.p, 1); assert.equal(r.removed, 0); });
t('밸브가 열려 있으면 펌프질해도 빠지지 않는다', () => { const ch = VX.setValve(sealed(), 1, false, V).ch; assert.equal(VX.pumpStroke(ch, 1, V).ch.p, 1); });
t('펌프질을 멈추면 바늘이 아주 천천히 되돌아간다(초당 0.004)', () => {
  let ch = sealed(); for (let i = 0; i < 25; i++) ch = VX.pumpStroke(ch, 1, V).ch; const p0 = ch.p;
  ch = VX.stepChamber(ch, 1, V); assert.ok(Math.abs(ch.p - p0 - 0.004) < 1e-9);
  ch = VX.stepChamber(ch, 10, V); assert.ok(Math.abs(ch.p - p0 - 0.044) < 1e-9); assert.ok(ch.p < 0.2, '10초를 쉬어도 아직 바닥 가까이');
});
t('금 간 종은 훨씬 빨리 샌다', () => { const a = VX.stepChamber({ ...sealed(), p: 0.3 }, 1, V).p, b = VX.stepChamber({ ...sealed(exp.items.find(i => i.id === 'bell_cracked').bell.leak), p: 0.3 }, 1, V).p; assert.ok(b - 0.3 > 10 * (a - 0.3)); });
t('밸브를 천천히 열면 몇 초에 걸쳐 공기가 찬다', () => {
  let ch = VX.setValve({ ...sealed(), p: 0.02 }, 1, false, V).ch; assert.equal(ch.p, 0.02);
  ch = VX.stepChamber(ch, 1, V); assert.ok(ch.p > 0.4 && ch.p < 0.7, `${ch.p}`); ch = VX.stepChamber(ch, 4, V); assert.ok(ch.p > V.airBackAt);
  const half = VX.stepChamber(VX.setValve({ ...sealed(), p: 0.02 }, 0.3, false, V).ch, 1, V).p; assert.ok(half < 0.4, '조금 열면 더 천천히');
});
t('밸브를 한 번에 확 열면 공기가 바로 차고, 많이 뺀 상태였으면 안의 것이 날아갈 만큼 세다', () => {
  const r = VX.setValve({ ...sealed(), p: 0.1 }, 1, true, V); assert.equal(r.ch.p, 1); assert.equal(r.rush, true);
  assert.equal(VX.setValve({ ...sealed(), p: 0.8 }, 1, true, V).rush, false, '조금만 뺐으면 휙 하고 끝');
  assert.equal(VX.setValve({ ...sealed(), p: 0.1 }, 0.3, true, V).rush, false, '조금만 돌리면 확 열린 것이 아니다');
});
t('공기를 뺀 종은 안 들리고, 공기를 다시 넣으면 들린다', () => { assert.equal(VX.canLift(0.5, V), false); assert.equal(VX.canLift(0.89, V), false); assert.equal(VX.canLift(0.95, V), true); });
t('소리 크기는 압력과 같다', () => { assert.equal(VX.soundLevel(1), 1); assert.equal(VX.soundLevel(0.3), 0.3); assert.equal(VX.stepSound(VX.makeObject(S.clock, W), 0.05).level, 0.05); });
t('끓는 압력표: 30℃ 물은 0.04 에서 끓고, 차가울수록 더 빼야 끓는다', () => { assert.equal(VX.boilPressure(30, W), 0.04); assert.ok(VX.boilPressure(25, W) < 0.04); assert.ok(VX.boilPressure(40, W) > 0.04); assert.equal(VX.boilPressure(100, W), 1); });

t('부풂은 1/p 를 물체마다 한도까지 — 마시멜로는 p 0.375 에서 두 배', () => {
  assert.ok(Math.abs(VX.growth(0.375, S.marshmallow) - 2) < 1e-9); assert.equal(VX.growth(0.02, S.marshmallow), S.marshmallow.cap); assert.equal(VX.growth(1, S.marshmallow), 1);
  assert.equal(VX.growth(0.02, S.balloon_s), S.balloon_s.cap, '풍선은 종 벽(한도)에서 멈춘다'); assert.equal(VX.growth(0.02, S.foam), S.foam.cap);
});
function cycle(spec, ps){ let o = VX.makeObject(spec, W); for (const p of ps) o = VX.stepPuff(o, p, spec, V); return o; }
const down = (to, n = 30) => Array.from({ length: n }, (_, i) => 1 - (1 - to) * (i + 1) / n), up = (from, n = 30) => Array.from({ length: n }, (_, i) => from + (1 - from) * (i + 1) / n);
t('공기를 다시 넣으면 마시멜로는 처음보다 작아진다', () => {
  const sp = S.marshmallow, top = cycle(sp, down(0.1)); assert.ok(top.size > 2, '빼는 동안은 크게 부풀고');
  const end = cycle(sp, [...down(0.1), ...up(0.1)]); assert.ok(end.size < 1 && end.size > 0.5, `끝 크기 ${end.size}`); assert.equal(end.base, end.size);
  const mid = cycle(sp, [...down(0.1), 0.5]); assert.ok(mid.size < top.size && mid.size > end.size, '돌아오는 길에는 그 사이');
  const little = cycle(sp, [...down(0.8), ...up(0.8)]); assert.ok(little.size < 1 && little.size > end.size, '조금만 부풀린 것은 조금만 줄어든다');
});
t('덜 분 풍선은 공기가 돌아오면 원래대로 돌아온다', () => { const o = cycle(S.balloon_s, [...down(0.05), ...up(0.05)]); assert.ok(Math.abs(o.size - 1) < 1e-9); assert.equal(cycle(S.balloon_s, down(0.05)).full, true); });
t('면도 거품은 종을 채웠다가 공기가 돌아오면 푹 꺼진다', () => { const sp = S.foam; assert.equal(cycle(sp, down(0.1)).size, sp.cap); const o = cycle(sp, [...down(0.1), ...up(0.1)]); assert.ok(o.size < 0.5, `${o.size}`); });
t('과자 봉지는 빵빵해지다 끝까지 빼면 터지고, 터진 봉지는 다시 부풀지 않는다', () => {
  const sp = S.chips; const a = cycle(sp, down(0.3)); assert.equal(a.full, true); assert.equal(a.burst, false);
  const b = cycle(sp, down(0.05)); assert.equal(b.burst, true); const c = cycle(sp, [...down(0.05), ...up(0.05), ...down(0.3)]); assert.equal(c.burst, true); assert.ok(c.size < 1);
});
t('물은 끓는데 온도계는 내려간다', () => {
  let o = VX.makeObject(S.beaker_water, W); o = VX.stepWater(o, 0.05, 0.1, W); assert.equal(o.boiling, false); assert.equal(o.simmer, true, '0.05 에서는 작은 방울만');
  o = VX.stepWater(o, 0.03, 0.1, W); assert.equal(o.boiling, true); assert.equal(o.boilT0, 30);
  for (let i = 0; i < 40; i++) o = VX.stepWater(o, 0.025, 0.1, W); assert.ok(o.boiling); assert.ok(o.T < 29 && o.T > 20, `${o.T}`); assert.ok(o.cooled >= 1);
});
t('식은 물은 더 빼야 끓는다 — 바닥(0.02)에서는 20℃ 아래로 내려가며 멈춘다', () => {
  let o = VX.makeObject(S.beaker_water, W); for (let i = 0; i < 2000; i++) o = VX.stepWater(o, 0.02, 0.1, W); assert.equal(o.boiling, false); assert.ok(o.T > 15 && o.T < 20, `${o.T}`);
});
t('공기가 들어오면 끓음이 뚝 멈춘다', () => { let o = VX.stepWater(VX.makeObject(S.beaker_water, W), 0.03, 0.1, W); assert.ok(o.boiling); o = VX.stepWater(o, 0.3, 0.1, W); assert.equal(o.boiling, false); assert.equal(o.simmer, false); });
t('촛불은 p 0.35 아래에서 꺼지고, 공기가 돌아와도 다시 안 켜진다', () => {
  const sp = S.candle; let o = VX.stepFlame(VX.makeObject(sp, W), 0.6, sp); assert.ok(o.lit && o.flame > 0 && o.flame < 1, '불꽃이 작아진다');
  o = VX.stepFlame(o, 0.34, sp); assert.equal(o.lit, false); assert.equal(o.outByAir, true); assert.equal(VX.stepFlame(o, 1, sp).lit, false);
});
t('흡착판은 p 0.25 아래에서 툭 떨어지고, 공기가 돌아와도 다시 안 붙는다', () => { const sp = S.suction; let o = VX.stepSuction(VX.makeObject(sp, W), 0.3, sp); assert.equal(o.stuck, true); o = VX.stepSuction(o, 0.24, sp); assert.equal(o.stuck, false); assert.equal(VX.stepSuction(o, 1, sp).stuck, false); });
t('낙하 통: 공기가 있으면 쇠구슬이 먼저, 조금 빼면 깃털이 조금 늦게, 다 빼면 같이 떨어진다', () => {
  const sp = S.droptube, a = VX.tubeDrop(1, sp), b = VX.tubeDrop(0.2, sp), c = VX.tubeDrop(0.03, sp);
  assert.equal(a.key, 'ballFirst'); assert.ok(a.tFeather > 2 * a.tBall); assert.equal(b.key, 'featherLate'); assert.ok(b.tFeather < a.tFeather && b.tFeather > b.tBall); assert.equal(c.key, 'together'); assert.equal(c.tFeather, c.tBall);
});
t('걸음 함수는 받은 상태를 고치지 않는다', () => {
  const ch = sealed(), c0 = JSON.stringify(ch); VX.pumpStroke(ch, 1, V); VX.stepChamber(ch, 1, V); VX.setValve(ch, 1, true, V); assert.equal(JSON.stringify(ch), c0);
  const o = VX.makeObject(S.marshmallow, W), o0 = JSON.stringify(o); VX.stepPuff(o, 0.2, S.marshmallow, V); assert.equal(JSON.stringify(o), o0);
  const w = VX.makeObject(S.beaker_water, W), w0 = JSON.stringify(w); VX.stepWater(w, 0.02, 1, W); assert.equal(JSON.stringify(w), w0);
});

// ── 긴장 맞춤: 초당 1.5번 펌프질하는 아이
t('초당 1.5번이면 마시멜로는 6~8번 만에 두 배가 된다', () => { const k = strokesTo(pAtGrowth(S.marshmallow.goal, S.marshmallow)); assert.ok(k >= 6 && k <= 8, `${k}번`); });
t('초당 1.5번이면 자명종은 18~22번 만에 안 들린다', () => { const k = strokesTo(S.clock.quiet); assert.ok(k >= 18 && k <= 22, `${k}번`); });
t('초당 1.5번이면 30℃ 물은 22~26번 만에 끓는다', () => { const k = strokesTo(VX.boilPressure(W.T0, W)); assert.ok(k >= 22 && k <= 26, `${k}번`); });
t('반만 내리는 펌프질로는 물을 끓이려면 훨씬 오래 걸린다', () => { const k = strokesTo(VX.boilPressure(W.T0, W), 1.5, V.leak, 0.5); assert.ok(k > 40, `${k}번`); });
t('너무 느리게(3초에 한 번) 펌프질하면 새는 공기를 못 이겨 물이 끓지 않는다', () => { assert.equal(strokesTo(VX.boilPressure(W.T0, W), 1 / 3), Infinity); });
t('금 간 종으로는 물도 자명종도 안 된다(새는 공기가 이긴다)', () => { const leak = exp.items.find(i => i.id === 'bell_cracked').bell.leak; assert.equal(strokesTo(S.clock.quiet, 1.5, leak), Infinity); assert.ok(strokesTo(0.4, 1.5, leak) < 12, '금이 번질 만큼은 빠진다'); });
console.log(`vacuum: ${n} 통과`);
