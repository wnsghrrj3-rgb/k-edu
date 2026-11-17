// 케이모션 과학실 — 영하 196도 열 계산 시험 (node kmotion/lab/tests/test_thermal.js) · 시험 이름 = 설계 5-4 의 문장
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { thermalModel, makeWorld, stepWorld, pourLn2, addWater, dipIn, setEnv, stepBody, makeBody, stepBottle, boilOf, frostAmount, balloonVolume, pourStartDeg, curve, kindOf, heatLeft } from '../sim/thermal.js';
import { stateOf } from '../sim/rules.js';

const exp = JSON.parse(readFileSync(new URL('../exp/ln2/exp.json', import.meta.url), 'utf8'));
const M = thermalModel(exp), B = exp.bowl;
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ✓', name); };

// 그릇에 질소를 붓고 그릇이 다 식을 때까지 기다린 세계
const ready = (ids, amount = 0.8) => stepWorld(pourLn2(makeWorld(M, ids), amount, M).world, null, 12, M);
const run = (w, sec, each) => { for (let i = 0; i < Math.round(sec * 10); i++) { w = stepWorld(w, null, 0.1, M); if (each) each(w, (i + 1) / 10); } return w; };
const st = (w, id) => stateOf(exp, kindOf(id), w.bodies[id]);
const vol = (w, id = 'balloon') => balloonVolume(w.bodies[id], M.specs[kindOf(id)]);
const near = (a, b, eps) => assert.ok(Math.abs(a - b) <= eps, `${a} ≉ ${b}`);

t('주변 온도는 공기 20도, 질소 속 영하 196도, 감싼 손 34도, 따뜻한 물 60도다', () => {
  assert.deepEqual(exp.env.temps, { air: 20, ln2: -196, hands: 34, warm: 60 });
});
t('물체는 겉이 먼저 식고 속이 뒤따라 식는다', () => {
  let b = makeBody('banana'); for (let i = 0; i < 20; i++) b = stepBody(b, M.specs.banana, 'ln2', M.env, 0.1);
  assert.ok(b.Ts < -100 && b.Tc > -20 && b.Ts < b.Tc);
});
t('바나나를 2초만 담그면 겉만 언다', () => {
  const w = run(dipIn(ready(['banana_1']), 'banana_1', M), 2);
  assert.equal(st(w, 'banana_1'), 'crust'); assert.ok(w.bodies.banana_1.Ts < -40 && w.bodies.banana_1.Tc > -80);
});
t('겉만 언 바나나는 꺼내 두어도 돌이 되지 않는다', () => {
  let w = setEnv(run(dipIn(ready(['banana_1']), 'banana_1', M), 2), 'banana_1', 'air', M), stone = false;
  run(w, 40, x => { if (st(x, 'banana_1') === 'stone') stone = true; }); assert.equal(stone, false);
});
t('바나나는 속까지 얼어야 돌이 된다 — 8초쯤 걸린다', () => {
  let at = null; run(dipIn(ready(['banana_1']), 'banana_1', M), 20, (w, s) => { if (at == null && st(w, 'banana_1') === 'stone') at = s; });
  assert.ok(at >= 6 && at <= 10, `돌이 된 때 ${at}초`);
});
t('물체를 넣는 순간 끓음이 확 세지고 질소가 훅 준다', () => {
  const a = ready(['banana_1']), b = dipIn(a, 'banana_1', M);
  assert.ok(b.boil > a.boil + 0.8, `${a.boil} → ${b.boil}`); near(a.bowl.ln2 - b.bowl.ln2, M.specs.banana.gulp, 1e-9);
});
t('끓음은 물체가 다 식으면 바닥값으로 돌아온다', () => {
  const a = dipIn(ready(['banana_1']), 'banana_1', M), mid = run(a, 5), end = run(a, 60);
  assert.ok(a.boil > mid.boil && mid.boil > end.boil, '점점 잦아든다'); near(end.boil, B.boilFloor, 0.01);
});
t('끓음이 조용해졌을 때 꺼내면 속까지 얼어 있다(속이 있는 물체 전부)', () => {
  for (const it of exp.items) { if (!it.states || !it.states.core) continue; const id = it.count ? it.id + '_1' : it.id;
    let quiet = null, top = null; run(dipIn(ready([id]), id, M), 30, (w, s) => { if (top == null && st(w, id) === it.states.core.state) top = s; if (quiet == null && w.boil <= B.quiet) quiet = s; });
    assert.ok(top != null && quiet != null && top <= quiet, `${it.name}: 다 언 때 ${top}초, 조용해진 때 ${quiet}초`); }
});
t('얼린 바나나는 실험대에 두면 녹아서 다시 물러진다 — 못을 박을 틈은 15초 넘게 있다', () => {
  let w = dipIn(ready(['banana_1']), 'banana_1', M), quietAt = null; w = run(w, 14); assert.equal(st(w, 'banana_1'), 'stone');
  w = setEnv(w, 'banana_1', 'air', M); let until = null; w = run(w, 60, (x, s) => { if (until == null && st(x, 'banana_1') !== 'stone') until = s; });
  assert.ok(until >= 15 && until <= 40, `돌로 남은 시간 ${until}초`); assert.equal(st(w, 'banana_1'), 'mushy');
});
t('장미는 1초로는 모자라고 2초면 유리가 된다', () => {
  assert.equal(st(run(dipIn(ready(['rose']), 'rose', M), 1), 'rose'), 'fresh'); assert.equal(st(run(dipIn(ready(['rose']), 'rose', M), 2), 'rose'), 'glass');
});
t('고무공은 살짝 얼리면 둔해지고 오래 얼리면 유리가 된다', () => {
  assert.equal(st(run(dipIn(ready(['ball_1']), 'ball_1', M), 1.5), 'ball_1'), 'dull'); assert.equal(st(run(dipIn(ready(['ball_1']), 'ball_1', M), 6), 'ball_1'), 'glass');
});
t('속은 얼 때보다 녹을 때가 더 느리다', () => {
  const th = M.specs.banana; let cold = { ...makeBody('banana'), Ts: -196, Tc: 20 }, warm = { ...makeBody('banana'), Ts: 20, Tc: -196 };
  cold = stepBody(cold, th, 'ln2', M.env, 1); warm = stepBody(warm, th, 'air', M.env, 1);
  assert.ok(20 - cold.Tc > warm.Tc + 196);
});
t('풍선 부피는 곡선표를 따른다: 20도 1.0 → 영하 150도 0.35 → 영하 190도 0.06', () => {
  const c = M.specs.balloon.volume.curve; near(curve(c, 20), 1, 1e-9); near(curve(c, -150), 0.35, 1e-9); near(curve(c, -190), 0.06, 1e-9);
  near(curve(c, -65), (1 + 0.35) / 2, 1e-9); assert.equal(curve(c, 60), 1);
});
t('풍선을 담그면 몇 초 만에 쭈글쭈글 줄어 납작해진다', () => {
  let at = null; const w = run(dipIn(ready(['balloon']), 'balloon', M), 8, (x, s) => { if (at == null && st(x, 'balloon') === 'flat') at = s; });
  assert.ok(at >= 2 && at <= 6, `납작해진 때 ${at}초`); assert.ok(vol(w) < 0.08);
});
t('풍선은 꺼낸 뒤 원래 부피의 95%까지 돌아온다', () => {
  let w = setEnv(run(dipIn(ready(['balloon']), 'balloon', M), 6), 'balloon', 'air', M), max = 0; w = run(w, 60, x => { max = Math.max(max, vol(x)); });
  near(vol(w), 0.95, 1e-9); assert.ok(max <= 0.95 + 1e-9, '95%를 넘지 않는다'); assert.ok(w.bodies.balloon.Ts > 15);
});
t('풍선은 실험대에 두면 10~20초에 되살아나고, 두 손으로 감싸면 훨씬 빨리 되살아난다', () => {
  const flat = run(dipIn(ready(['balloon']), 'balloon', M), 6), time = env => { let at = null; run(setEnv(flat, 'balloon', env, M), 40, (x, s) => { if (at == null && vol(x) >= 0.9) at = s; }); return at; };
  const bench = time('air'), hands = time('hands');
  assert.ok(bench >= 10 && bench <= 20, `실험대 ${bench}초`); assert.ok(hands <= 5 && hands < bench / 2, `손 ${hands}초`);
});
t('납작해진 적 없는 풍선은 처음 크기 그대로 돌아온다', () => {
  let w = setEnv(run(dipIn(ready(['balloon']), 'balloon', M), 1), 'balloon', 'air', M); w = run(w, 60); near(vol(w), 1, 0.005);
});
t('질소를 처음 부으면 그릇이 식는 동안 격렬하게 끓다가 잦아든다', () => {
  const a = pourLn2(makeWorld(M, []), 0.8, M).world, b = run(a, 12);
  assert.ok(a.boil > 1.2, `처음 ${a.boil}`); near(b.boil, B.boilFloor, 0.01);
});
t('그릇에 질소가 없으면 끓음은 0이다', () => {
  assert.equal(makeWorld(M, []).boil, 0); assert.equal(run(makeWorld(M, ['rose']), 1).boil, 0);
  let w = ready([], 0.05); w = run(w, 30); assert.equal(w.bowl.ln2, 0); assert.equal(w.boil, 0);
});
t('그릇의 질소는 가만히 둬도 날아가고, 끓을수록 더 빨리 날아간다', () => {
  const a = ready(['banana_1']), calm = run(a, 5), busy = run(dipIn(a, 'banana_1', M), 5);
  assert.ok(calm.bowl.ln2 < a.bowl.ln2); assert.ok(a.bowl.ln2 - calm.bowl.ln2 < (a.bowl.ln2 - M.specs.banana.gulp) - busy.bowl.ln2);
});
t('가득 부은 그릇도 3분 남짓이면 다 날아간다(머뭇거리면 다시 부어야 한다)', () => {
  let w = pourLn2(makeWorld(M, []), 1, M).world, at = null; run(w, 400, (x, s) => { if (at == null && x.bowl.ln2 === 0) at = s; });
  assert.ok(at > 120 && at < 300, `${at}초`);
});
t('통의 질소도 조금씩 줄어든다', () => { const w = run(makeWorld(M, []), 60); assert.ok(w.dewar.ln2 < exp.dewar.amount && w.dewar.ln2 > exp.dewar.amount * 0.9); });
t('통에 든 것보다 많이 부을 수 없고, 그릇에 넘치게 부으면 넘친 만큼 쏟아진다', () => {
  const r = pourLn2(makeWorld(M, []), 1.3, M); near(r.world.bowl.ln2, 1, 1e-9); near(r.spilled, 0.3, 1e-9); near(r.world.dewar.ln2, exp.dewar.amount - 1.3, 1e-9);
  const all = pourLn2(makeWorld(M, []), 99, M, 'bench'); near(all.poured, exp.dewar.amount, 1e-9); assert.equal(all.world.dewar.ln2, 0); assert.equal(all.world.bowl.ln2, 0);
});
t('질소가 얕으면 넣어도 얼지 않는다', () => {
  let w = ready(['rose'], 0.18); w = run(w, 6); assert.ok(w.bowl.ln2 < B.minDip && w.bowl.ln2 > 0); w = run(dipIn(w, 'rose', M), 4);
  assert.equal(st(w, 'rose'), 'fresh'); assert.ok(w.bodies.rose.Ts > 0);
});
t('서리는 겉 온도가 0도에서 영하 60도로 내려가는 동안 0에서 1로 덮인다', () => {
  assert.equal(frostAmount(20, exp.frost), 0); assert.equal(frostAmount(0, exp.frost), 0); near(frostAmount(-30, exp.frost), 0.5, 1e-9); assert.equal(frostAmount(-60, exp.frost), 1); assert.equal(frostAmount(-196, exp.frost), 1);
});
t('꺼낸 물체의 서리는 녹으면서 서서히 걷힌다', () => {
  let w = setEnv(run(dipIn(ready(['rose']), 'rose', M), 5), 'rose', 'air', M); const f0 = frostAmount(w.bodies.rose.Ts, exp.frost); w = run(w, 120);
  assert.equal(f0, 1); assert.equal(frostAmount(w.bodies.rose.Ts, exp.frost), 0);
});
t('따뜻한 물을 부으면 구름이 솟고 질소가 한꺼번에 날아간다', () => {
  const a = ready([], 0.6), calm = run(a, 3); let w = addWater(a, 0.3, M), peak = 0; w = run(w, 3, x => { peak = Math.max(peak, x.cloud); });
  assert.ok(peak >= B.cloudBig, `구름 ${peak}`); assert.ok(a.bowl.ln2 - w.bowl.ln2 > 5 * (a.bowl.ln2 - calm.bowl.ln2)); assert.ok(w.boil > 1.5);
  const later = run(w, 40); assert.ok(later.cloud < 0.05, '구름은 걷힌다');
});
t('물이 조금이면 구름도 작다', () => { let peak = 0; run(addWater(ready([], 0.6), 0.02, M), 5, x => { peak = Math.max(peak, x.cloud); }); assert.ok(peak > 0.02 && peak < B.cloudBig, `구름 ${peak}`); });
t('질소가 줄수록 통을 더 많이 기울여야 나온다', () => {
  assert.equal(pourStartDeg(1, exp.dewar), 25); assert.ok(pourStartDeg(0.5, exp.dewar) > pourStartDeg(1, exp.dewar)); assert.equal(pourStartDeg(0, exp.dewar), exp.dewar.tiltEmpty);
});
t('병 속 질소는 씌운 풍선을 거대하게 불리다 터뜨린다 — 질소가 모자라면 부풀다 만다', () => {
  let b = { ln2: 0.1, size: 0, demo: true, popped: false }, at = null; for (let i = 1; i <= 100 && !b.popped; i++) { b = stepBottle(b, 0.1, M); at = i / 10; }
  assert.ok(b.popped && at >= 3 && at <= 8, `터진 때 ${at}초`);
  let c = { ln2: 0.01, size: 0, demo: true, popped: false }; for (let i = 0; i < 100; i++) c = stepBottle(c, 0.1, M); assert.ok(!c.popped && c.size > 0 && c.ln2 === 0);
  let open = { ln2: 0.1, size: 0, demo: false, popped: false }; for (let i = 0; i < 100; i++) open = stepBottle(open, 0.1, M); assert.ok(!open.popped && open.size === 0, '뚜껑 없는 병은 그냥 날아간다');
});
t('걸음 함수는 받은 상태를 고치지 않는다(숨은 전역 없음)', () => {
  const w = dipIn(ready(['banana_1', 'balloon']), 'banana_1', M), snap = JSON.stringify(w);
  const a = stepWorld(w, { pour: 0.1, water: 0.05, dip: ['balloon'], env: { banana_1: 'air' } }, 1, M), b = stepWorld(w, { pour: 0.1, water: 0.05, dip: ['balloon'], env: { banana_1: 'air' } }, 1, M);
  pourLn2(w, 0.2, M); addWater(w, 0.2, M); dipIn(w, 'balloon', M); setEnv(w, 'banana_1', 'hands', M);
  assert.equal(JSON.stringify(w), snap); assert.equal(JSON.stringify(a), JSON.stringify(b), '같은 입력이면 같은 결과');
});
t('한 번에 크게 가나 잘게 나눠 가나 결과가 같다', () => {
  const w = dipIn(ready(['banana_1']), 'banana_1', M), big = stepWorld(w, null, 5, M), small = run(w, 5);
  near(big.bodies.banana_1.Tc, small.bodies.banana_1.Tc, 1e-6); near(big.bowl.ln2, small.bowl.ln2, 1e-6); near(big.boil, small.boil, 1e-6);
});
t('끓음은 담긴 물체에 남은 열의 합이다 — 둘을 넣으면 더 세게 끓는다', () => {
  const a = ready(['banana_1', 'ball_1']), one = dipIn(a, 'banana_1', M), two = dipIn(one, 'ball_1', M);
  near(two.boil - one.boil, M.specs.ball.area * heatLeft(two.bodies.ball_1, M.specs.ball, M.env), 1e-9); near(boilOf(two, M), two.boil, 1e-12);
});
console.log(`thermal: ${n} 통과`);
