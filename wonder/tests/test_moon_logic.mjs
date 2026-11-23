import assert from 'node:assert/strict';
import { collide, timeline, dialYears, yearsDial, yearsText, skyDeg, SKY_NOW, MISSIONS, WHY, SAYS, FORM_YEARS, FATE_YEARS, NOW_YEARS, OUR_MOON } from '../moon/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const MARS = 0.107, EARTH = 1;

// 설계 장면 6 「이렇게 하면 → 이렇게 된다」 — 한 줄에 시험 하나
t('1 작은 것을 정면으로 — 큰 구덩이와 번쩍, 파편 조금 → 다시 떨어짐, 달 없음', () => {
  const r = collide({ size: 0.01, angle: 0, speed: 1.2 });
  assert.equal(r.outcome, 'crater'); assert.equal(r.debris, 'little'); assert.equal(r.moons.length, 0);
  assert.ok(r.says.includes('구덩이') && r.says.includes('번쩍') && r.says.includes('다시 떨어져요'));
  assert.equal(timeline(r, NOW_YEARS).alive, 0);
});
t('2 화성만 한 것을 비스듬히 알맞게 — 빛나는 고리 → 감으면 뭉쳐서 달 하나', () => {
  const r = collide({ size: MARS, angle: 45, speed: 1.1 });
  assert.equal(r.outcome, 'moon'); assert.equal(r.debris, 'ring'); assert.equal(r.moons.length, 1);
  assert.ok(r.says.includes('빛나는 고리'));
  const early = timeline(r, 1 / 365), late = timeline(r, FORM_YEARS);
  assert.ok(early.ring && !early.formed && early.says.includes('고리'));
  assert.ok(late.formed && late.alive === 1 && late.says.includes('달 하나'));
  assert.ok(r.ratio > 0.75 && r.ratio < 1.3, r.ratio);                                   // 그게 지금 달만 하다
  const a = collide({ size: MARS, angle: 45, speed: 1.1, seed: 2 }), b = collide({ size: MARS, angle: 45, speed: 1.1, seed: 3 });
  assert.notEqual(a.moonMass, b.moonMass);                                                // 매번 조금씩 다르다
  assert.equal(collide({ size: MARS, angle: 45, speed: 1.1, seed: 2 }).moonMass, a.moonMass);   // 같은 seed = 같은 결과
  assert.equal(collide({ size: MARS, angle: 45, speed: 1.1, seed: 2, jitter: false }).moonMass, collide({ size: MARS, angle: 45, speed: 1.1, seed: 3, jitter: false }).moonMass);   // 의뢰 중에는 안 흔든다
});
t('3 같은 것을 정면으로 — 합쳐져 큰 행성 하나, 달 없음', () => {
  const r = collide({ size: EARTH, angle: 5, speed: 1.1 });
  assert.equal(r.outcome, 'merge'); assert.equal(r.moons.length, 0); assert.ok(r.says.includes('합쳐져'));
});
t('4 같은 것을 너무 빠르게 — 둘 다 부서져 파편 구름', () => {
  const r = collide({ size: EARTH, angle: 30, speed: 2.6 });
  assert.equal(r.outcome, 'shatter'); assert.equal(r.debris, 'cloud'); assert.ok(r.says.includes('파편 구름'));
  assert.equal(collide({ size: EARTH, angle: 30, speed: 1.1 }).outcome === 'shatter', false);   // 알맞으면 안 부서진다
  assert.notEqual(collide({ size: MARS, angle: 30, speed: 3 }).outcome, 'shatter');              // 작은 것으로는 지구를 못 부순다
});
t('5 아주 스치듯 — 빗나갔다 돌아와 두 번째 충돌', () => {
  const r = collide({ size: MARS, angle: 80, speed: 1.1 });
  assert.equal(r.outcome, 'graze'); assert.ok(r.secondHit); assert.ok(r.says.includes('두 번째'));
});
t('6 조금 다르게 비스듬히 — 달 둘, 나중에 하나는 떨어지거나 달아난다', () => {
  const a = collide({ size: MARS, angle: 58, speed: 1.1 }), b = collide({ size: MARS, angle: 67, speed: 1.1 });
  for (const r of [a, b]) { assert.equal(r.outcome, 'twomoons'); assert.equal(r.moons.length, 2); assert.ok(r.says.includes('달이 둘')); }
  assert.equal(timeline(a, FORM_YEARS).alive, 2);
  const la = timeline(a, FATE_YEARS), lb = timeline(b, FATE_YEARS);
  assert.equal(la.alive, 1); assert.equal(lb.alive, 1);
  assert.ok(la.says.includes('달아났어요') && lb.says.includes('떨어졌어요'));
});
t('7 얼음 행성을 던짐(자유) — 바다가 생긴다', () => {
  const r = collide({ size: MARS, angle: 45, speed: 1.1, what: 'ice', free: true });
  assert.ok(r.ocean); assert.ok(r.says.includes('바다'));
  assert.ok(!collide({ size: MARS, angle: 45, speed: 1.1 }).ocean);
  const run = collide({ size: MARS, angle: 45, speed: 2.4, what: 'ice', free: true }); assert.equal(run.outcome, 'runaway'); assert.ok(!run.ocean && !run.says.includes('바다'));   // 달아나면 바다도 없다
  assert.ok(timeline(r, 1e7).says.includes('바다'));
  const huge = collide({ size: 8, angle: 0, speed: 1.1, free: true }); assert.equal(huge.size, 8);     // 자유에서는 한도가 풀린다
  assert.equal(collide({ size: 8, angle: 0, speed: 1.1 }).size, 1);
});
t('8 달이 생긴 뒤 감기 — 처음엔 하늘을 크게 덮을 만큼 가깝다가 점점 멀어지고, 지구 겉이 식어 파래진다', () => {
  const r = collide({ size: MARS, angle: 45, speed: 1.1 });
  const ys = [FORM_YEARS, 1e3, 1e6, 1e8, NOW_YEARS].map(y => timeline(r, y));
  for (let i = 1; i < ys.length; i++) { assert.ok(ys[i].moons[0].a >= ys[i - 1].moons[0].a); assert.ok(ys[i].moons[0].sky <= ys[i - 1].moons[0].sky); }
  assert.ok(ys[0].moons[0].sky > SKY_NOW * 15);                                          // 처음엔 오늘 달의 열다섯 배 넘게
  assert.ok(Math.abs(ys[4].moons[0].a - 60.3) < 1);                                       // 오늘 거리(지구 반지름 60배)
  assert.equal(ys[0].earth, 'hot'); assert.equal(ys[4].earth, 'blue');
  assert.ok(ys[1].says.includes('멀어져요')); assert.ok(ys[4].says.includes('파래져요'));
  assert.ok(Math.abs(skyDeg(OUR_MOON, 60.3) - 0.53) < 0.02);
});
t('시간 다이얼 — 9시간에서 45억 년까지', () => {
  assert.ok(Math.abs(dialYears(0) - 1e-3) < 1e-9); assert.ok(Math.abs(dialYears(1) / NOW_YEARS - 1) < 1e-9);
  assert.ok(Math.abs(yearsDial(dialYears(0.4)) - 0.4) < 1e-9);
  assert.equal(yearsText(NOW_YEARS), '45억 년'); assert.equal(yearsText(dialYears(0)), '9시간'); assert.equal(yearsText(2e6), '200만 년');
});

// 의뢰 셋
t('의뢰 1: 달 하나 — 던지고 감아야', () => {
  const m = MISSIONS[0], good = collide({ size: MARS, angle: 45, speed: 1.1 });
  assert.ok(m.ok({ res: good, years: 1 }));
  assert.ok(!m.ok({ res: good, years: 1e-3 })); assert.ok(m.tell({ res: good, years: 1e-3 }).includes('시간 다이얼'));
  const head = collide({ size: MARS, angle: 0, speed: 1.1 }); assert.ok(!m.ok({ res: head, years: 1 })); assert.ok(m.tell({ res: head, years: 1 }).includes('비스듬히'));
  const fast = collide({ size: MARS, angle: 45, speed: 2.4 }); assert.equal(fast.outcome, 'runaway'); assert.ok(m.tell({ res: fast, years: 1 }).includes('느리게'));
  assert.ok(m.tell({ res: collide({ size: 0.01, angle: 45 }), years: 1 }).includes('작아요'));
});
t('의뢰 2: 우리 달만 하게 — 크기와 방향을 같이', () => {
  const m = MISSIONS[1];
  for (let th = 25; th < 55; th += 1) assert.ok(!m.ok({ res: collide({ size: 0.3, angle: th, speed: 1.1, jitter: false }), years: 1 }));   // 처음 크기(0.3)로는 방향만 바꿔서 안 된다
  assert.ok(MISSIONS[0].ok({ res: collide({ size: 0.3, angle: 40, speed: 1.1, jitter: false }), years: 1 }));                             // 의뢰 1은 처음 크기로 방향만 바꿔도 된다
  assert.ok(m.ok({ res: collide({ size: MARS, angle: 45, speed: 1.1 }), years: 1 }));
  const big = collide({ size: 0.4, angle: 45, speed: 1.1 }); assert.ok(!m.ok({ res: big, years: 1 })); assert.ok(m.tell({ res: big, years: 1 }).includes('너무 커요'));
  const tilt = collide({ size: MARS, angle: 28, speed: 1.1 }); assert.ok(!m.ok({ res: tilt, years: 1 })); assert.ok(m.tell({ res: tilt, years: 1 }).includes('너무 작아요'));
  assert.ok(m.ok({ res: collide({ size: 0.16, angle: 28, speed: 1.1 }), years: 1 }));      // 덜 비스듬하면 더 큰 행성으로 맞춘다
});
t('의뢰 3: 달 둘 다 살아남게 — 더 세게 던져야 떨어져 산다', () => {
  const m = MISSIONS[2], good = collide({ size: MARS, angle: 62, speed: 1.65 });
  assert.equal(good.outcome, 'twomoons'); assert.ok(m.ok({ res: good, years: NOW_YEARS }));
  assert.equal(timeline(good, NOW_YEARS).alive, 2); assert.ok(timeline(good, NOW_YEARS).says.includes('살아남았어요'));
  assert.ok(!m.ok({ res: good, years: FORM_YEARS })); assert.ok(m.tell({ res: good, years: FORM_YEARS }).includes('더 감아'));
  const slow = collide({ size: MARS, angle: 67, speed: 1.1 }); assert.ok(!m.ok({ res: slow, years: NOW_YEARS })); assert.ok(m.tell({ res: slow, years: NOW_YEARS }).includes('더 세게'));
  const one = collide({ size: MARS, angle: 45, speed: 1.1 }); assert.ok(m.tell({ res: one, years: NOW_YEARS }).includes('더 비스듬히'));
});
t('까닭 두 문장과 결과 문구', () => {
  assert.equal(WHY.length, 2); assert.ok(WHY[0].includes('화성만 한 행성') && WHY[0].includes('뭉쳐 달이') && WHY[1].includes('지구의 돌과 닮았어요'));
  for (const k of ['crater', 'moon', 'merge', 'shatter', 'graze', 'twomoons', 'ocean', 'recede', 'blue']) assert.ok(SAYS[k]);
});
console.log(n + ' 통과');
