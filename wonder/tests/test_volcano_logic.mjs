import assert from 'node:assert/strict';
import { createVolcano, beginMission, setHandles, stepVolcano, sayFor, fastForward, droneLook, flowReach, MISSIONS, WHY, SAYS, SEA, FOREST, CLOUD } from '../volcano/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const V = h => setHandles(createVolcano({ seed: 3 }), h);
const has = (S, key) => S.log.some(e => e.key === key);
/** dt 마다 sayFor 를 불러 보인 글을 모두 모은다 */
const watch = (S, sec, dt = 0.1) => { const seen = new Set(); for (let s = 0; s < sec; s += dt) { stepVolcano(S, dt); seen.add(sayFor(S)); } return [...seen].join(' | '); };

// 설계 장면 8 「이렇게 하면 → 이렇게 된다」 — 한 줄에 시험 하나
t('1 묽음 + 기체 적음 → 용암이 강처럼 흐르고 산이 넓고 완만해진다', () => {
  const S = V({ visc: 0.1, gas: 0.1, push: 0.6 }), w0 = S.cone.w;
  const said = watch(S, 20);
  assert.equal(S.mode, 'flow'); assert.ok(S.flow.front > 0.3); assert.ok(S.cone.w > w0);
  assert.ok(said.includes('강처럼') && said.includes('완만'));
  assert.ok(S.pressure < 0.1);                                                   // 기체가 빠져 압력이 안 쌓인다
});
t('2 묽음 + 기체 많음 → 꼭대기에서 불 분수', () => {
  const S = V({ visc: 0.2, gas: 0.8, push: 0.6 }); const said = watch(S, 3);
  assert.equal(S.mode, 'fountain'); assert.ok(S.fountainH > 0.5); assert.ok(said.includes('불 분수'));
  const lo = V({ visc: 0.2, gas: 0.55, push: 0.6 }); stepVolcano(lo, 3); assert.ok(lo.fountainH < S.fountainH);   // 기체가 많을수록 높이
});
t('3 끈적 + 기체 적음 → 용암 혹이 천천히 부풀고 터지지 않는다', () => {
  const S = V({ visc: 0.8, gas: 0.2, push: 0.6 }); stepVolcano(S, 5); const d5 = S.dome; const said = watch(S, 60);
  assert.equal(S.mode, 'dome'); assert.ok(S.dome > d5 && d5 > 0 && d5 < 0.3); assert.ok(said.includes('용암 혹'));
  assert.ok(!S.summitLost && S.pressure < 0.35);
});
t('4 끈적 + 기체 많음 → 압력 바늘이 오래 오르다 대폭발, 재 기둥이 구름 위로, 번개', () => {
  const S = V({ visc: 0.8, gas: 0.8, push: 0.5 });
  stepVolcano(S, 6); assert.equal(S.mode, 'building'); assert.ok(S.pressure > 0.3 && S.pressure < 1); assert.ok(sayFor(S).includes('압력 바늘'));
  stepVolcano(S, 3); assert.ok(S.tremor);                                        // 기다리는 동안 땅이 떨린다
  const said = watch(S, 12);
  assert.ok(has(S, 'blast') && S.summitLost); assert.ok(said.includes('대폭발'));
  assert.ok(S.column && S.column.top > CLOUD && S.column.h > CLOUD); assert.ok(S.bolts > 0);
  const tBlast = S.log.find(e => e.key === 'blast').t; assert.ok(tBlast > 10);   // 오래 조용하다가 한 번에
});
t('5 재 기둥이 무너지면 잿빛 구름이 산비탈을 쏟아져 내린다', () => {
  const S = V({ visc: 0.8, gas: 0.8, push: 0.6 }); stepVolcano(S, 15); assert.ok(S.column && !S.column.collapsed);
  setHandles(S, { gas: 0.4 });                                                   // 기체가 모자라 기둥이 무거워짐
  const said = watch(S, 3);
  assert.ok(S.column.collapsed && S.column.slide > 0); assert.ok(said.includes('쏟아져 내려요'));
  const steady = V({ visc: 0.8, gas: 0.9, push: 0.5 }); stepVolcano(steady, 20); assert.ok(!has(steady, 'collapse'));
});
t('6 용암이 바다에 닿으면 김 구름, 베개 모양으로 굳는다', () => {
  const S = V({ visc: 0.05, gas: 0.1, push: 0.9 }); assert.ok(flowReach(S) >= SEA);
  const said = watch(S, 20);
  assert.ok(S.flow.front >= SEA && S.sea.steam > 0 && S.sea.pillows > 0); assert.ok(said.includes('베개 모양'));
  const short = V({ visc: 0.3, gas: 0.1, push: 0.5 }); stepVolcano(short, 30); assert.ok(short.flow.front < SEA && !has(short, 'sea'));
});
t('7 용암이 숲에 닿으면 나무가 타고 나무 모양 구멍이 남는다', () => {
  const S = V({ visc: 0.3, gas: 0.1, push: 0.5 }); const said = watch(S, 15);
  assert.ok(S.flow.front >= FOREST && S.forest.burnt && S.forest.molds > 0); assert.ok(said.includes('나무 모양 구멍'));
  const sticky = V({ visc: 0.9, gas: 0.1, push: 1 }); stepVolcano(sticky, 30); assert.ok(!sticky.forest.burnt);   // 끈적한 혹은 숲까지 못 간다
});
t('8 흐르던 용암 겉이 굳어 용암 동굴 — 무인기로 들어가 본다', () => {
  const S = V({ visc: 0.2, gas: 0.1, push: 0.6 }); stepVolcano(S, 5); assert.ok(!S.flow.tube);
  const said = watch(S, 6); assert.ok(S.flow.tube && said.includes('용암 동굴'));
  assert.equal(droneLook(S, 'flow').key, 'tubeIn'); assert.ok(droneLook(S, 'flow').text.includes('동굴 속으로'));
});
t('9 무인기를 용암 호수 위로 → 검은 껍질이 갈라졌다 다시 덮인다', () => {
  const S = V({ visc: 0.2, gas: 0.1, push: 0.5 }); const states = new Set();
  for (let i = 0; i < 100; i++) { stepVolcano(S, 0.1); const d = droneLook(S, 'crater'); assert.equal(d.key, 'lake'); states.add(d.open); }
  assert.ok(states.has(true) && states.has(false)); assert.ok(droneLook(S, 'crater').text.includes('갈라지며'));
  assert.notEqual(droneLook(V({ visc: 0.2, gas: 0.8, push: 0.5 }), 'crater').key, 'lake');
});
t('10 다 끝난 뒤 빨리 감기 → 재 위에 풀이 돋고 숲이 돌아온다', () => {
  const S = V({ visc: 0.8, gas: 0.8, push: 0.8 }); stepVolcano(S, 30); assert.ok(S.ash > 0);
  assert.equal(fastForward(S), 'notYet'); assert.ok(sayFor(S).includes('끝나지 않았어요'));
  setHandles(S, { push: 0 }); stepVolcano(S, 15);
  assert.equal(fastForward(S), 'regrow'); assert.ok(sayFor(S).includes('숲이 돌아와요'));
  assert.ok(S.ash === 0 && S.regrow === 1 && !S.forest.burnt);
  assert.equal(fastForward(V({ push: 0 })), 'nothing');
});

// 의뢰 셋
const run = (h, sec) => { const S = V(h); stepVolcano(S, sec); return S; };
t('의뢰 1: 용암 강을 바다까지', () => {
  const m = MISSIONS[0];
  assert.ok(m.ok(run({ visc: 0.05, gas: 0.1, push: 0.9 }, 20)));
  const start = run({}, 20); assert.ok(!m.ok(start)); assert.ok(m.tell(start).includes('바다 앞에서 멈춰요'));
  const sticky = run({ visc: 0.8, gas: 0.1, push: 1 }, 20); assert.ok(!m.ok(sticky)); assert.ok(m.tell(sticky).includes('끈적한 용암'));
  assert.ok(m.tell(run({ push: 0 }, 1)).includes('펌프'));
});
t('의뢰 2: 불 분수', () => {
  const m = MISSIONS[1];
  assert.ok(m.ok(run({ visc: 0.2, gas: 0.8, push: 0.5 }, 3)));
  const few = run({ visc: 0.2, gas: 0.2, push: 0.5 }, 3); assert.ok(!m.ok(few)); assert.ok(m.tell(few).includes('밸브를 더 열어요'));
  const sticky = run({ visc: 0.8, gas: 0.8, push: 0.5 }, 3); assert.ok(!m.ok(sticky)); assert.ok(m.tell(sticky).includes('갇혀요'));
  const low = run({ visc: 0.2, gas: 0.5, push: 0.5 }, 3); assert.ok(!m.ok(low)); assert.ok(m.tell(low).includes('분수가 낮아요'));
  // 의뢰 1 이 끝난 자리(묽고 세게)에서 시작해도 손잡이 하나로는 안 된다
  const from = () => { const S = run({ visc: 0.05, gas: 0.1, push: 0.9 }, 20); beginMission(S, 1); return S; };
  const gasOnly = from(); setHandles(gasOnly, { gas: 0.8 }); stepVolcano(gasOnly, 3); assert.ok(!m.ok(gasOnly)); assert.ok(m.tell(gasOnly).includes('갇혀요'));
  const leverOnly = from(); setHandles(leverOnly, { visc: 0.2 }); stepVolcano(leverOnly, 3); assert.ok(!m.ok(leverOnly)); assert.ok(m.tell(leverOnly).includes('밸브'));
  const both = from(); setHandles(both, { visc: 0.2, gas: 0.8 }); stepVolcano(both, 3); assert.ok(m.ok(both));
});
t('의뢰 3: 산꼭대기 날리기 — 묽은 용암으로는 안 된다', () => {
  const m = MISSIONS[2];
  assert.ok(m.ok(run({ visc: 0.8, gas: 0.8, push: 0.5 }, 20)));
  const runny = run({ visc: 0.2, gas: 1, push: 1 }, 120); assert.ok(!m.ok(runny)); assert.ok(m.tell(runny).includes('쉽게 빠져나가'));
  const dome = run({ visc: 0.9, gas: 0.2, push: 1 }, 120); assert.ok(!m.ok(dome)); assert.ok(m.tell(dome).includes('혹만'));
  const wait = run({ visc: 0.8, gas: 0.8, push: 0.5 }, 4); assert.ok(!m.ok(wait)); assert.ok(m.tell(wait).includes('기다려요'));
  // 앞에서 터진 것은 치지 않는다 — 의뢰 3 을 시작한 뒤 새로 터져야 한다
  const old = run({ visc: 0.8, gas: 0.8, push: 0.5 }, 30); assert.ok(old.summitLost); beginMission(old, 2); assert.ok(!m.ok(old));
  stepVolcano(old, 20); assert.ok(m.ok(old));
});
t('까닭 두 문장과 결과 문구', () => {
  assert.equal(WHY.length, 2); assert.ok(WHY[0].includes('사이다') && WHY[1].includes('한꺼번에 터져요'));
  for (const k of ['flow', 'fountain', 'dome', 'building', 'blast', 'collapse', 'sea', 'forest', 'tube', 'tubeIn', 'lake', 'regrow']) assert.ok(SAYS[k], k);
});
t('산이 넓어져도 숲을 덮지 않는다', () => { const S = run({ visc: 0, gas: 0, push: 1 }, 120); assert.ok(S.cone.w <= 1.3 && 0.3 * S.cone.w < FOREST); });
t('씨앗이 같으면 결과가 같다', () => {
  const a = run({ visc: 0.8, gas: 0.8, push: 0.6 }, 25), b = run({ visc: 0.8, gas: 0.8, push: 0.6 }, 25);
  assert.equal(a.bolts, b.bolts); assert.deepEqual(a.log, b.log);
});
console.log(n + ' 통과');
