import assert from 'node:assert/strict';
import { createRide, step, setLever, setFork, setRun, view, flowAt, pulseShape, resetLap, resetLapMission, markHere, answerLap, ORDER, SEG, BPM, O2, MISSIONS, WHY, SAYS } from '../blood/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const DT = 1 / 60;
const at = s => ORDER[s.seg];
const run = (s, sec, until) => { const ev = []; for (let x = 0; x < sec; x += DT) { ev.push(...step(s, DT)); if (until && until(s, ev)) break; } return ev; };
const rideTo = (s, id, max = 120) => run(s, max, q => at(q) === id);
const has = (ev, k) => ev.some(e => e.k === k);
const say = (ev, k) => (ev.find(e => e.k === k) || {}).say || '';
/** 한 박자 동안 재기 */
const overBeat = (s, f) => { const out = []; const T = 60 / (s.run ? BPM.run : BPM.rest); for (let x = 0; x < T; x += DT) { step(s, DT); out.push(f(s)); } return out; };

// 설계 장면 12 「이렇게 하면 → 이렇게 된다」 — 한 줄에 시험 하나
t('1 심장 안에서 기다리면 문이 닫혔다가 쿵 열리며 왈칵 밀려 나간다', () => {
  const s = createRide(); assert.equal(at(s), 'heartL');
  const before = run(s, 0.3); assert.equal(at(s), 'heartL'); assert.ok(!has(before, 'beat')); assert.equal(view(s).heartOpen, false);
  const ev = run(s, 2, (q, e) => has(e, 'beat')); assert.ok(say(ev, 'beat').includes('쿵 열리며'));
  assert.equal(at(s), 'aorta');
  // 쿵 직후 흐름이 가장 세다
  const sp = overBeat(s, q => q.speed); assert.ok(sp.slice(0, 15).reduce((a, b) => a + b) / 15 > sp.slice(-15).reduce((a, b) => a + b) / 15 * 3);
});
t('2 굵은 길 — 넓고, 맥박마다 벽이 불룩, 빨리 흐른다', () => {
  const s = createRide(); const ev = rideTo(s, 'aorta'); assert.ok(has(ev, 'big')); assert.ok(say(ev, 'big').includes('불룩'));
  const w = overBeat(s, q => view(q).width), sp = overBeat(s, q => q.speed);
  assert.ok(Math.max(...w) > Math.min(...w) * 1.08);                                     // 불룩
  assert.ok(Math.max(...sp) > Math.min(...sp) * 5);                                       // 맥박마다 왈칵
  assert.ok(view(s).width >= 1);
  const a = createRide(); rideTo(a, 'aorta'); const big = overBeat(a, q => q.speed); rideTo(a, 'vein'); const vein = overBeat(a, q => q.speed);
  const avg = x => x.reduce((p, q) => p + q) / x.length; assert.ok(avg(big) > avg(vein) * 2);
});
t('3 가는 길로 들면 점점 좁아진다', () => {
  const s = createRide(); const ev = rideTo(s, 'artery'); assert.ok(has(ev, 'small')); assert.ok(say(ev, 'small').includes('좁아져요'));
  const w0 = view(s).width; run(s, 30, q => q.pos > SEG.artery.len * 0.9); assert.ok(view(s).width < w0 * 0.6);
});
t('4 실핏줄 — 한 줄로, 몸을 접어 가며, 선홍색이 검붉게(산소를 내려놓음)', () => {
  const s = createRide(); const ev = rideTo(s, 'cap'); assert.ok(has(ev, 'cap')); assert.ok(say(ev, 'cap').includes('한 줄로') && say(ev, 'cap').includes('접어'));
  assert.ok(view(s).singleFile); assert.equal(view(s).color, '선홍색');
  const ev2 = rideTo(s, 'vein'); assert.ok(has(ev2, 'capdark')); assert.ok(say(ev2, 'capdark').includes('검붉게'));
  assert.equal(view(s).color, '검붉은색'); assert.ok(Math.abs(s.o2 - O2.rest) < 0.01);
});
t('5 돌아오는 길 — 느리고, 한쪽으로만 열리는 문(거꾸로 못 간다)', () => {
  const s = createRide(); const ev = rideTo(s, 'vein'); assert.ok(has(ev, 'vein')); assert.ok(say(ev, 'vein').includes('한쪽으로만'));
  const ev2 = run(s, 20, q => q.valveIdx >= 1); assert.ok(has(ev2, 'valve'));
  const gate = SEG.vein.valves[0]; setLever(s, -1);
  const ev3 = run(s, 6); assert.ok(has(ev3, 'valveblock')); assert.ok(say(ev3, 'valveblock').includes('거꾸로 못 가요'));
  assert.ok(s.pos >= gate - 1e-9);
  const r = createRide(); rideTo(r, 'aorta'); setLever(r, -1); run(r, 3); assert.ok(r.pos >= 0);  // 굵은 길도 심장 문 밖으로는 못 돌아간다
});
t('6 허파의 실핏줄 — 공기주머니가 숨마다 부풀고, 검붉던 것이 선홍색으로', () => {
  const s = createRide(); rideTo(s, 'heartR'); assert.equal(view(s).color, '검붉은색');
  const ev = rideTo(s, 'lungcap'); assert.ok(has(ev, 'lung')); assert.ok(say(ev, 'lung').includes('공기주머니'));
  const al = [], ev2 = []; for (let x = 0; x < 4; x += DT) { ev2.push(...step(s, DT)); al.push(view(s).alveoli); }
  assert.ok(Math.max(...al) > 0.9 && Math.min(...al) < 0.1);
  ev2.push(...rideTo(s, 'pv')); assert.ok(has(ev2, 'lungred')); assert.ok(say(ev2, 'lungred').includes('선홍색으로')); assert.equal(view(s).color, '선홍색');
});
t('7 달리기를 누르면 쿵쿵이 빨라지고 흐름이 거세진다', () => {
  const a = createRide(), b = createRide(); rideTo(a, 'aorta'); rideTo(b, 'aorta');
  const ev = setRun(b, true); assert.ok(has(ev, 'run')); assert.ok(say(ev, 'run').includes('빨라지고'));
  assert.equal(view(b).bpm, 140); assert.equal(view(a).bpm, 70);
  let fa = 0, fb = 0; for (let x = 0; x < 6; x += DT) { a.pos = b.pos = 1; step(a, DT); step(b, DT); fa += a.flow; fb += b.flow; }
  assert.ok(fb > fa * 1.6);
  const p = createRide(), q = createRide(); setRun(q, true); run(p, 10); run(q, 10);
  assert.ok(Math.abs((q.phase - 0.5) / (p.phase - 0.5) - 2) < 0.01);                     // 박자가 두 배로 잦다
});
t('8 벽에 난 상처 — 혈소판이 몰려와 그물을 치고 메운다(발 쪽 길)', () => {
  const s = createRide(); setFork(s, '발'); const ev = rideTo(s, 'cap'); assert.ok(has(ev, 'wound'));
  const w = say(ev, 'wound'); assert.ok(w.includes('혈소판') && w.includes('그물'));
  const h = createRide(); setFork(h, '손'); assert.ok(!has(rideTo(h, 'cap'), 'wound'));
});
t('9 세균 — 백혈구가 벽을 타고 기어와 삼킨다', () => {
  const s = createRide(); setFork(s, '발'); const ev = rideTo(s, 'heartR'); assert.ok(has(ev, 'germ'));
  const g = say(ev, 'germ'); assert.ok(g.includes('백혈구') && g.includes('삼켜요'));
});
t('10 흐름을 거슬러 버티면 전지가 닳고 적혈구들이 창에 부딪쳐 온다', () => {
  const a = createRide(), b = createRide(); rideTo(a, 'aorta'); rideTo(b, 'aorta');
  setLever(b, -1); const ev = run(b, 2); run(a, 2);
  assert.ok(has(ev, 'hold')); assert.ok(say(ev, 'hold').includes('부딪쳐'));
  assert.ok(b.battery < 90 && a.battery === 100); assert.ok(b.bumps > 5);
  assert.ok(b.pos < a.pos * 0.5);
  const c = createRide(); rideTo(c, 'aorta'); setLever(c, -1); const e2 = run(c, 40); assert.ok(has(e2, 'out')); assert.equal(c.lever, 0);  // 다 떨어지면 흐름에 맡긴다
});
t('긴장: 맥박이 장면 전체의 박자 — 흐름·벽이 한 박자로', () => {
  for (let p = 0; p < 1; p += 0.05) assert.ok(pulseShape(p) > 0);
  let m = 0; for (let p = 0; p < 1; p += 0.001) m += pulseShape(p) * 0.001; assert.ok(Math.abs(m - 1) < 0.01);
  const s = createRide(); rideTo(s, 'aorta'); const both = overBeat(s, q => [view(q).bulge, q.flow]);
  const iMaxB = both.reduce((bi, x, i) => (x[0] > both[bi][0] ? i : bi), 0), iMaxF = both.reduce((bi, x, i) => (x[1] > both[bi][1] ? i : bi), 0);
  assert.ok(Math.abs(iMaxB - iMaxF) <= 2);
});

// 의뢰 셋
t('의뢰 1: 심장에서 손끝까지', () => {
  const m = MISSIONS[0];
  const bad = createRide(); rideTo(bad, 'cap'); assert.ok(!m.ok(bad)); assert.ok(m.tell(bad).includes('머리의 실핏줄'));
  const good = createRide(); setFork(good, '손'); rideTo(good, 'cap'); assert.ok(m.ok(good));
  assert.ok(m.tell(createRide()).includes('아직'));
});
t('의뢰 2: 검붉은 피가 다시 붉어지는 곳 — 흐름만 타서는 안 되고 「여기!」를 그 자리에서', () => {
  const m = MISSIONS[1], s = createRide();
  assert.ok(m.tell(s).includes('검붉어지지도'));
  rideTo(s, 'pv'); assert.ok(!m.ok(s));                                                  // 손대지 않고 허파를 지나도 아니다
  const c = createRide(); rideTo(c, 'cap'); run(c, 8); markHere(c); assert.ok(!m.ok(c)); assert.ok(m.tell(c).includes('거꾸로'));
  rideTo(c, 'heartR'); markHere(c); assert.ok(!m.ok(c)); assert.ok(m.tell(c).includes('숨 쉬는 곳'));
  rideTo(c, 'pv'); markHere(c); assert.ok(!m.ok(c)); assert.ok(m.tell(c).includes('이미 붉은'));
  rideTo(c, 'lungcap'); const ev = markHere(c); assert.ok(m.ok(c)); assert.ok(ev[0].say.includes('선홍색으로'));
});
t('의뢰 3: 한 바퀴 돌고 심장 지난 수 맞히기 — 돌기만 하면 아니다', () => {
  const m = MISSIONS[2], s = createRide(); resetLapMission(s);
  assert.ok(m.tell(s).includes('출발'));
  rideTo(s, 'heartR'); assert.ok(!m.ok(s)); assert.ok(m.tell(s).includes('아직 한 바퀴가 아니'));
  const ev = run(s, 120, q => q.lap.done); assert.ok(has(ev, 'lap')); assert.equal(s.lastLap.hearts, 2);
  assert.ok(!m.ok(s)); assert.ok(m.tell(s).includes('답을 골라요'));                       // 돌기만 해서는 아니다
  assert.ok(!say(ev, 'lap').includes('두 번'));                                          // 답을 미리 말하지 않는다
  run(s, 2); answerLap(s, 1); assert.ok(!m.ok(s)); assert.ok(m.tell(s).includes('1번이 아니'));   // 바퀴가 다시 시작돼도 지난 바퀴로 판정
  answerLap(s, 2); assert.ok(m.ok(s));
  resetLapMission(s); assert.ok(!m.ok(s));
});
t('판: 처음 손대기 전에는 심장 안에서 기다린다', () => {
  const s = createRide({ parked: true }); const ev = run(s, 5); assert.equal(at(s), 'heartL'); assert.ok(!has(ev, 'beat') && !has(ev, 'hold'));
  s.parked = false; run(s, 1.5); assert.equal(at(s), 'aorta');
});
t('까닭 둘 — 쉬며 흐름만 타면 한 바퀴 1분쯤', () => {
  assert.equal(WHY.length, 2);
  assert.equal(WHY[0], '피는 온몸에 산소를 배달하고 돌아와요. 심장은 쉬지 않는 펌프예요.');
  assert.equal(WHY[1], '한 바퀴 도는 데 1분쯤 걸려요. 지금도 돌고 있어요.');
  const s = createRide(); run(s, 200, q => q.lap.done); assert.ok(s.lap.time > 45 && s.lap.time < 75, s.lap.time);
  for (const k of ['beat', 'big', 'small', 'cap', 'capdark', 'vein', 'lung', 'lungred', 'run', 'wound', 'germ', 'hold']) assert.ok(SAYS[k]);
});
console.log(n + ' 통과');
