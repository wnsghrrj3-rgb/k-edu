import assert from 'node:assert/strict';
import { look, stageAt, distKm, regionAt, thickRatio, COURSE, chunkAt, contact, crossStart, crossStep, diveAfter, grab, push, gapMoon, moonHit, floatTest, MISSIONS, WHY, SAYS, GAP_AIM, RING_DIAM_KM, EARTH_KM, RING_THICK_KM, START_Y, END_Y, GAP_PERIOD } from '../saturn/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const RING = 0.45, GAP = (GAP_AIM[0] + GAP_AIM[1]) / 2, SAT = 0.05;

// 설계 장면 7 「이렇게 하면 → 이렇게 된다」 — 한 줄에 시험 하나
t('1 멀리서 본다 — 매끈한 띠, 가운데 검은 틈', () => {
  const v = look({ lever: 0, aim: RING, elev: 18 });
  assert.equal(v.stage, 'far'); assert.equal(v.key, 'far'); assert.ok(v.says.includes('매끈한 띠') && v.says.includes('검은 틈'));
  assert.ok(v.distKm >= 1e5);
  assert.equal(look({ lever: 0, aim: GAP, elev: 18 }).key, 'far');                       // 멀리서는 틈을 겨눠도 띠 전체가 보인다
});
t('2 다가간다 — 수천 줄의 가는 줄무늬', () => {
  const v = look({ lever: 0.3, aim: RING, elev: 18 });
  assert.equal(v.key, 'lines'); assert.ok(v.stripes >= 1000); assert.ok(v.says.includes('수천 줄'));
  assert.ok(v.distKm < look({ lever: 0 }).distKm);
});
t('3 더 다가간다 — 반짝이는 알갱이의 강', () => {
  const v = look({ lever: 0.6, aim: RING, elev: 18 });
  assert.equal(v.key, 'grains'); assert.ok(v.says.includes('알갱이의 강'));
  for (let f = 0; f < 1; f += 0.05) assert.ok(distKm(f + 0.05) <= distKm(f));          // 레버를 밀수록 가깝다
});
t('4 고리 안으로 — 덩어리들이 모두 같은 방향으로 천천히, 살짝 부딪치고 붙었다 떨어진다', () => {
  const v = look({ lever: 1, aim: RING, elev: 18 });
  assert.equal(v.key, 'inside'); assert.equal(v.distKm, 0); assert.ok(v.says.includes('같은 방향') && v.says.includes('붙었다 떨어져요'));
  assert.ok(COURSE.every(c => c.v > 0));                                                 // 모두 같은 쪽
  const vs = COURSE.map(c => c.v); assert.ok(Math.max(...vs) - Math.min(...vs) < 1);       // 서로 조금씩만 다르다 → 살짝 따라잡아 부딪친다
  assert.ok(Math.min(...COURSE.map(c => c.r)) < 0.5 && Math.max(...COURSE.map(c => c.r)) > 4);   // 눈송이만 한 것부터 집채만 한 것까지
  assert.equal(contact(Math.max(...vs) - Math.min(...vs)), 'stick');
  const a = chunkAt(COURSE[0], 0), b = chunkAt(COURSE[0], 10); assert.ok(b.x !== a.x);
});
t('5 고리를 옆에서 본다 — 거의 안 보인다, 종이 한 장처럼 얇다', () => {
  const v = look({ lever: 0, aim: RING, elev: 0.5 });
  assert.equal(v.key, 'side'); assert.ok(v.edge); assert.ok(v.says.includes('안 보여요') && v.says.includes('종이'));
  assert.ok(thickRatio(0) < 1e-6);                                                      // 폭에 견주면 두께는 백만분의 일보다 얇다
  assert.ok(thickRatio(0) < thickRatio(18) / 1e5);
});
t('6 검은 틈으로 간다 — 텅 비었다, 작은 달 하나가 틈을 쓸고 지나간다', () => {
  assert.equal(regionAt(GAP), 'gap');
  const v = look({ lever: 0.6, aim: GAP, elev: 18 }), w = look({ lever: 1, aim: GAP, elev: 18 });
  assert.equal(v.key, 'gap'); assert.equal(w.key, 'gap'); assert.ok(v.says.includes('텅 비었어요') && v.says.includes('작은 달'));
  const m0 = gapMoon(1), m1 = gapMoon(5); assert.ok(m1.u > m0.u); assert.equal(m0.v, 0.5);  // 틈을 따라 움직인다
  assert.ok(gapMoon(GAP_PERIOD * 0.5).u > 0 && gapMoon(GAP_PERIOD * 0.5).u < 1);
});
t('7 덩어리 하나를 집게로 집어 와 비춘다 — 거의 순수한 얼음, 표본 통에서 녹는다', () => {
  const s = grab(); assert.ok(s.ice >= 0.9 && s.melts); assert.ok(s.says.includes('순수한 얼음') && s.says.includes('녹아'));
});
t('8 덩어리를 세게 민다 — 다른 것과 부딪쳐 부서지고, 한참 뒤 흐름에 다시 섞인다', () => {
  const h = push(0.9); assert.ok(h.breaks); assert.ok(h.rejoinSec > 3); assert.ok(h.says.includes('부서져요') && h.says.includes('다시 섞여요'));
  const s = push(0.05); assert.ok(!s.breaks); assert.equal(s.how, 'stick'); assert.ok(s.says.includes('붙었다가'));
});
t('9 토성 쪽을 본다 — 고리가 드리운 줄무늬 그림자, 극의 육각형 구름', () => {
  const v = look({ lever: 0, aim: SAT, elev: 18 }); assert.equal(v.region, 'saturn'); assert.equal(v.key, 'saturn');
  assert.ok(v.says.includes('줄무늬 그림자') && v.says.includes('육각형'));
  assert.equal(look({ lever: 0.9, aim: SAT, elev: 0 }).key, 'saturn');
});
t('10 토성을 큰 물통에 넣어 본다(자유) — 둥둥 뜬다', () => {
  const s = floatTest('saturn'); assert.ok(s.floats); assert.ok(s.density < 1); assert.ok(s.says.includes('둥둥'));
  const e = floatTest('earth'); assert.ok(!e.floats); assert.ok(e.says.includes('가라앉아요'));
});
t('까닭의 수: 폭은 지구 스무 개 넘게, 두께는 아파트 몇 층', () => {
  assert.ok(RING_DIAM_KM / EARTH_KM > 20); assert.ok(RING_THICK_KM * 1000 >= 9 && RING_THICK_KM * 1000 <= 40);
});

// 의뢰 셋
t('의뢰 1: 고리가 사라지는 자리 — 옆에서 보기', () => {
  const m = MISSIONS[0];
  assert.ok(m.ok(look({ lever: 0, aim: RING, elev: 0.8 }))); assert.ok(m.ok(look({ lever: 0.3, aim: RING, elev: -1 })));
  const tilted = look({ lever: 0, aim: RING, elev: 12 }); assert.ok(!m.ok(tilted)); assert.ok(m.tell(tilted).includes('아직 고리가 보여요'));
  const close = look({ lever: 0.9, aim: RING, elev: 0 }); assert.ok(!m.ok(close)); assert.ok(m.tell(close).includes('멀리서'));
});
t('의뢰 2: 덩어리 사이로 고리를 뚫고 반대편으로', () => {
  const m = MISSIONS[1], at = s => ({ ...s, stage: 'inside', region: 'ring' });
  const good = diveAfter(11); assert.ok(good.crossed && !good.hit); assert.ok(m.ok(at(good)));
  const bad = diveAfter(0); assert.ok(bad.hit); assert.ok(!m.ok(at(bad))); assert.ok(m.tell(at(bad)).includes('부딪혔어요'));
  assert.ok(!m.ok({ ...good, stage: 'inside', region: 'gap' })); assert.ok(m.tell({ ...good, stage: 'inside', region: 'gap' }).includes('틈으로'));
  assert.ok(m.tell({ ...crossStart(), stage: 'grains', region: 'ring' }).includes('고리 속으로'));
  let s = crossStart(); for (let i = 0; i < 60; i++) s = crossStep(s, { x: 0, y: 0 }); assert.equal(s.y, START_Y); assert.ok(!s.hit);   // 기다리면 안 부딪친다
  const skip = new Set([bad.hitId]); let k = crossStart(); for (let i = 0; i < 600 && !k.hit && !k.crossed; i++) k = crossStep(k, { x: 0, y: -1 }, 1 / 30, skip);
  assert.ok(k.hitId !== bad.hitId);                                                       // 치운 덩어리에는 안 부딪친다
  assert.ok(good.y <= END_Y);
});
t('의뢰 3: 틈을 만든 범인 — 틈을 따라 지나가는 작은 달을 짚는다', () => {
  const m = MISSIONS[2], key = 'gap', T = 4, mo = gapMoon(T);
  assert.ok(m.ok({ key, t: T, tap: [mo.u, mo.v] }));
  assert.ok(!m.ok({ key, t: T, tap: [mo.u, mo.v + 0.3] })); assert.ok(m.tell({ key, t: T, tap: [0, 0] }).includes('거기는 아니에요'));
  assert.ok(!m.ok({ key: 'grains', t: T, tap: [mo.u, mo.v] })); assert.ok(m.tell({ key: 'grains', t: T, tap: [0, 0] }).includes('검은 틈으로'));
  assert.ok(moonHit({ tap: [mo.u, mo.v], t: T }).hit);
});
t('까닭 두 문장과 결과 문구', () => {
  assert.equal(WHY.length, 2); assert.ok(WHY[0].includes('얼음 조각') && WHY[0].includes('둘레를 돌고') && WHY[1].includes('스무 개') && WHY[1].includes('아파트'));
  for (const k of ['far', 'lines', 'grains', 'inside', 'side', 'gap', 'saturn', 'grab', 'pushHard', 'float']) assert.ok(SAYS[k]);
});
console.log(n + ' 통과');
