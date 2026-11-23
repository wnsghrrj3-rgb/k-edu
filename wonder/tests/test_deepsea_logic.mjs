import assert from 'node:assert/strict';
import { createDive, step, setLever, setLight, setDir, tapWindow, takePhoto, visible, waterColor, sunPattern, brightness, cupScale, thumbKg,
  PLAIN, TRENCH, THUMB, MISSIONS, WHY, SAYS } from '../deepsea/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const DT = 1 / 30;
/** sec 초 동안 돌리며 일어난 일을 모은다. until(s) 가 참이면 멈춘다 */
const run = (s, sec, until) => { const ev = []; for (let x = 0; x < sec; x += DT) { ev.push(...step(s, DT)); if (until && until(s)) break; } return ev; };
const goTo = (s, depth, lever = 0.6) => { const down = depth > s.depth; setLever(s, down ? lever : -lever); const ev = run(s, 200, q => down ? q.depth >= depth || q.landed : q.depth <= depth); setLever(s, 0); return ev; };
const has = (ev, k) => ev.some(e => e.k === k);
const say = (ev, k) => (ev.find(e => e.k === k) || {}).say || '';

// 설계 장면 3 「이렇게 하면 → 이렇게 된다」 — 한 줄에 시험 하나
t('1 내려가면 물색이 하늘색 → 파랑 → 남색 → 검정, 창 위 햇빛 무늬가 사라진다', () => {
  const s = createDive(); s.free = true;
  const ev = goTo(s, 1200, 0.5);
  assert.deepEqual(ev.filter(e => e.k === 'descend').map(e => e.color), ['파랑', '남색', '검정']);
  assert.equal(waterColor(0).name, '하늘색');
  assert.ok(has(ev, 'sungone')); assert.ok(sunPattern(0) === 1 && sunPattern(100) > 0 && sunPattern(200) === 0);
  for (let d = 0; d < 1000; d += 50) assert.ok(brightness(d + 50) < brightness(d));
});
t('2 50m 쯤 빨간 물고기가 검게 보이고, 탐조등을 켜면 다시 빨갛다', () => {
  const s = createDive();
  const ev1 = goTo(s, 30, 0.2); assert.ok(has(ev1, 'redfish')); assert.ok(visible(s).some(v => v.id === 'redfish_red'));
  const ev2 = goTo(s, 90, 0.2); assert.ok(has(ev2, 'redblack')); assert.ok(say(ev2, 'redblack').includes('검게'));
  assert.ok(visible(s).some(v => v.id === 'redfish_black'));
  const ev3 = setLight(s, true); assert.ok(has(ev3, 'redback')); assert.ok(say(ev3, 'redback').includes('빨개요'));
});
t('3 어스름 층에서 탐조등을 끄면 푸른 점들 — 해파리, 등불 물고기 떼', () => {
  const s = createDive(); goTo(s, 500); setLight(s, true); run(s, 1);
  setLight(s, false);
  const ev = run(s, 4); const g = ev.filter(e => e.k === 'glow').map(e => e.what);
  assert.deepEqual(g, ['빛나는 해파리', '등불 물고기 떼']); assert.ok(say(ev, 'glow').includes('푸른 점'));
  assert.ok(visible(s).every(v => v.id === 'jelly' || v.id === 'lantern'));
});
t('4 탐조등을 켜면 빛나던 것들이 달아나고 바다 눈만', () => {
  const s = createDive(); goTo(s, 500); run(s, 4);
  assert.ok(visible(s).some(v => v.glow));
  const ev = setLight(s, true); assert.ok(has(ev, 'snow')); assert.ok(say(ev, 'snow').includes('바다 눈'));
  assert.deepEqual(visible(s).map(v => v.id), ['snow']);
});
t('5 캄캄한 층에서 끄고 기다리면 초롱이 다가오고, 켜면 이빨', () => {
  const s = createDive(); goTo(s, 2000);
  const early = run(s, 2); assert.ok(!has(early, 'angler'));
  const ev = run(s, 3); assert.ok(has(ev, 'angler')); assert.ok(visible(s).some(v => v.id === 'angler' && v.glow));
  const ev2 = setLight(s, true); assert.ok(has(ev2, 'teeth')); assert.ok(ev2[ev2.length - 1].say.includes('이빨'));
  // 움직이면 다가오지 않는다
  const m = createDive(); goTo(m, 2000); setLever(m, 0.05 + 0.01); assert.ok(!has(run(m, 6, q => q.depth > 3800), 'angler'));
});
t('6 창을 톡톡 두드리면 둘레의 작은 것들이 번쩍 푸른 불빛', () => {
  const s = createDive(); goTo(s, 700);
  const ev = tapWindow(s); assert.ok(has(ev, 'flash')); assert.ok(visible(s).some(v => v.id === 'flash' && v.glow));
  run(s, 2); assert.ok(!visible(s).some(v => v.id === 'flash'));
  setLight(s, true); assert.ok(has(tapWindow(s), 'taplight'));
  assert.ok(has(tapWindow(createDive()), 'tapbright'));
});
t('7 계속 내려가면 컵이 점점 쪼그라들고 선체가 끼익', () => {
  const s = createDive(); s.free = true;
  const ev = goTo(s, 5000); const sq = ev.filter(e => e.k === 'squeeze');
  assert.equal(sq.length, 5);
  for (let i = 1; i < sq.length; i++) assert.ok(sq[i].cup < sq[i - 1].cup);
  assert.ok(sq[0].say.includes('쪼그라들') && sq[0].say.includes('끼익'));
  goTo(s, 1000); assert.ok(cupScale(s.maxDepth) < cupScale(1000));                    // 올라가도 다시 안 커진다
  assert.ok(thumbKg(TRENCH) > 1000);                                                     // 가장 깊은 곳: 엄지손톱에 자동차 한 대
});
t('8 깊은 바닥 — 오른쪽을 비추면 굴뚝, 검은 연기, 하얀 게, 붉은 관 벌레', () => {
  const s = createDive(); s.free = true;
  const near = goTo(s, 5800); assert.ok(has(near, 'ventnear'));
  setLight(s, true); assert.ok(!s.found.vent);
  const ev = setDir(s, 'right'); assert.ok(has(ev, 'vent')); assert.ok(s.found.vent);
  const t2 = say(ev, 'vent'); assert.ok(t2.includes('검은 연기') && t2.includes('하얀 게') && t2.includes('관 벌레'));
});
t('9 바닥에 내리면 고래 뼈대, 흙먼지 — 더 내리면 골짜기 바닥', () => {
  const s = createDive(); s.free = true; setLever(s, 0.7);
  const ev = run(s, 60, q => q.landed); assert.ok(has(ev, 'land')); assert.equal(s.depth, PLAIN);
  assert.ok(say(ev, 'land').includes('고래 뼈대') && say(ev, 'land').includes('흙먼지'));
  assert.ok(visible(s).some(v => v.id === 'whale')); assert.ok(s.dustT > 0);
  const ev2 = run(s, 60, q => q.landed && q.stage === 'trench'); assert.ok(has(ev2, 'edge')); assert.ok(has(ev2, 'landdeep'));
  assert.equal(s.depth, TRENCH); assert.ok(say(ev2, 'landdeep').includes('흙먼지'));
});
t('10 너무 빨리 내려가면 압력 경보 → 자동 멈춤(사고 기록)', () => {
  const s = createDive(); setLever(s, 1);
  const ev = run(s, 3); assert.ok(has(ev, 'alarm')); assert.ok(say(ev, 'alarm').includes('자동으로 멈췄'));
  assert.equal(s.lever, 0); assert.equal(s.accidents.length, 1);
  assert.equal(setLever(s, 0.5), false);                                                 // 잠깐 잠김
  const d = s.depth; run(s, 0.5); assert.equal(s.depth, d);
  run(s, 2); assert.equal(setLever(s, 0.75), true); assert.ok(!has(run(s, 5), 'alarm')); // 0.8 아래면 괜찮다
});
t('긴장: 전지 — 불을 켜면 빨리 닳고, 다 떨어지면 비상으로 떠오른다', () => {
  const a = createDive(), b = createDive(); goTo(a, 300); goTo(b, 300); setLight(b, true);
  run(a, 5); run(b, 5); assert.ok(b.battery < a.battery - 10);
  const ev = run(b, 60, q => q.depth === 0 && q.dives > 0); assert.ok(has(ev, 'out') && has(ev, 'surface'));
  assert.ok(b.lastDive.emergency); assert.equal(b.battery, 100);                          // 물 위에서 새 전지
});

// 의뢰 셋
t('의뢰 1: 빛나는 것 셋 찍기', () => {
  const m = MISSIONS[0], s = createDive();
  takePhoto(s); assert.ok(!m.ok(s)); assert.ok(m.tell(s).includes('밝아서'));
  goTo(s, 500); setLight(s, true); takePhoto(s); assert.ok(m.tell(s).includes('달아나요'));
  setLight(s, false); run(s, 4); takePhoto(s); assert.ok(!m.ok(s)); assert.ok(m.tell(s).includes('1가지 더'));
  tapWindow(s); takePhoto(s); assert.ok(m.ok(s));
});
t('의뢰 2: 굴뚝 마을 찾기', () => {
  const m = MISSIONS[1], s = createDive(); s.free = true;
  goTo(s, 3000); assert.ok(!m.ok(s)); assert.ok(m.tell(s).includes('더 깊이'));
  goTo(s, 5800); assert.ok(m.tell(s).includes('탐조등을 켜요'));
  setLight(s, true); setDir(s, 'left'); assert.ok(!m.ok(s)); assert.ok(m.tell(s).includes('돌려'));
  setDir(s, 'right'); assert.ok(m.ok(s));
});
t('의뢰 3: 컵을 엄지만 하게 — 불을 아끼면 되고, 켜고 다니면 전지가 모자란다', () => {
  const m = MISSIONS[2];
  const good = createDive(); setLever(good, 0.75);
  run(good, 200, q => q.landed && q.stage === 'trench'); setLever(good, -1); run(good, 200, q => q.dives > 0);
  assert.ok(m.ok(good), JSON.stringify(good.lastDive)); assert.ok(good.lastDive.cup <= THUMB);
  const shallow = createDive(); setLever(shallow, 0.75); run(shallow, 200, q => q.landed); setLever(shallow, -1); run(shallow, 200, q => q.dives > 0);
  assert.ok(!m.ok(shallow)); assert.ok(m.tell(shallow).includes('더 깊이'));
  const lit = createDive(); setLight(lit, true); setLever(lit, 0.75); run(lit, 200, q => q.dives > 0 || (q.landed && q.stage === 'trench'));
  setLever(lit, -1); run(lit, 200, q => q.dives > 0);
  assert.ok(!m.ok(lit)); assert.ok(m.tell(lit).includes('탐조등을 아껴요'));
  assert.ok(m.tell(createDive()).includes('돌아오지'));
});
t('까닭 둘과 결과 문구', () => {
  assert.equal(WHY.length, 2);
  assert.ok(WHY[0].startsWith('햇빛은 200m 아래로는 거의 못 내려가요.') && WHY[0].includes('적을 놀라게 하려고'));
  assert.ok(WHY[1].includes('엄지손톱 위에 자동차 한 대가 올라선 만큼'));
  for (const k of ['descend', 'redblack', 'redback', 'glow', 'snow', 'angler', 'teeth', 'flash', 'squeeze', 'vent', 'land', 'alarm']) assert.ok(SAYS[k]);
});
console.log(n + ' 통과');
