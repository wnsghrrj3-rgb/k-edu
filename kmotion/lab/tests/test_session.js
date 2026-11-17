// 케이모션 과학실 — 화면 없이 한 판을 끝까지 (node kmotion/lab/tests/test_session.js)
// 뷰가 보낼 「뜻이 있는 사건」만으로 맛보기 · 의뢰 셋(성공·실패·중간) · 질소 떨어짐 · 사고 전부 · 마무리 · 자유 실험을 돌린다.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession, EVENTS } from '../sim/session.js';

const exp = JSON.parse(readFileSync(new URL('../exp/ln2/exp.json', import.meta.url), 'utf8'));
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ✓', name); };

// ── 시험 도구
const find = (fx, type, pred) => fx.find(e => e.type === type && (!pred || pred(e)));
const has = (fx, type, pred) => !!find(fx, type, pred);
const run = (s, sec) => { const all = []; for (let i = 0; i < Math.round(sec * 10); i++) all.push(...s.tick(0.1)); return all; };
const until = (s, type, max = 60, pred) => { const all = []; for (let i = 0; i < max * 10; i++) { const fx = s.tick(0.1); all.push(...fx); if (has(fx, type, pred)) return all; } assert.fail(`「${type}」 효과가 ${max}초 안에 오지 않았다`); };
const gear = s => [...s.wear('visor'), ...s.wear('gloves')];
const fill = (s, to = 0.8) => { const all = []; if (s.view().objects.bowl.loc !== 'bench') all.push(...s.place('bowl', 'bench_a')); let guard = 0; while (s.view().bowl.fill < to && guard++ < 300) all.push(...s.pour('dewar', 'bowl', 0.02)); return all; };
const fresh = () => { const s = createSession(exp); s.start(); return s; };
const obj = (s, id) => s.view().objects[id];
const restocked = (fx, id) => (find(fx, 'restock', e => e.ids.includes(id)) || { ids: null }).ids;

// ── 의뢰마다 가장 곧은 성공 길(사건만으로)
function playTaste(s){ gear(s); fill(s); s.predict(2); s.dip('rose'); run(s, 3); s.lift('rose'); s.place('rose', 'bench_b'); return s.strike('rose', 2); }
function playBalloon(s){ gear(s); fill(s); s.predict(1); s.dip('balloon'); run(s, 5); s.lift('balloon'); s.place('balloon', 'bench_b'); s.cup('balloon'); return until(s, 'missionDone', 20); }
function freezeBanana(s, id){ s.dip(id); until(s, 'boilQuiet', 30); s.lift(id); s.grab(id); }
function playBanana(s, id = 'banana_1'){ gear(s); fill(s); s.predict(1); freezeBanana(s, id); const all = []; for (let i = 0; i < 3; i++) { all.push(...s.strike('woodblock', 2, id)); run(s, 0.6); } return all; }
function playBalls(s){ gear(s); fill(s); s.predict(2); s.grab('ball_1'); const a = s.drop('ball_1', 0.5); s.dip('ball_2'); until(s, 'boilQuiet', 30); s.lift('ball_2'); return [...a, ...s.drop('ball_2', 0.5)]; }
function playFinale(s){ gear(s); fill(s); s.predict(1); const all = []; for (let i = 0; i < 80 && !has(all, 'missionDone'); i++) all.push(...s.pour('kettle', 'bowl', 0.02), ...s.tick(0.1)); return all; }
const PLAY = { taste: playTaste, balloon: playBalloon, banana: playBanana, balls: playBalls, finale: playFinale };
/** 그 의뢰가 막 시작된 판(앞 의뢰들은 성공 길로 지나온다). 'free' = 자유 실험 */
function at(id){ const s = fresh(); for (const m of exp.missions) { if (m.id === id) return s; assert.ok(has(PLAY[m.id](s), 'missionDone'), m.id); s.next(); } return s; }

// ════ 맛보기
t('시작하기 전에는 어떤 사건도 받지 않는다', () => { const s = createSession(exp); assert.equal(s.wear('visor')[0].reason, 'notStarted'); assert.equal(s.phase, 'idle'); assert.deepEqual(s.tick(1), []); });
t('시작하면 쪽지 「장미를 얼려라」가 놓이고 보안면과 장갑이 빛난다', () => {
  const s = createSession(exp), fx = s.start(), m = find(fx, 'mission');
  assert.equal(m.note, '장미를 얼려라'); assert.equal(m.guard, true); assert.deepEqual(find(fx, 'step').glow, ['visor', 'gloves']);
  assert.ok(find(fx, 'appear').ids.includes('rose')); assert.equal(obj(s, 'banana_1').available, false, '바나나는 아직 선반에 없다'); assert.equal(obj(s, 'tangerine').available, false);
});
t('맛보기에서는 장비 없이 통을 집으면 사고가 아니라 손이 닿기 전에 막는다', () => {
  const s = fresh(), fx = s.grab('dewar'); assert.equal(fx[0].type, 'blocked'); assert.equal(fx[0].key, 'gearFirst'); assert.deepEqual(fx[0].glow.sort(), ['gloves', 'visor']);
  s.place('bowl', 'bench_a'); s.pour('dewar', 'bowl', 0.3); assert.equal(s.view().bowl.ln2, 0, '붓기도 막힌다'); assert.equal(s.note.accidents.length, 0);
  s.wear('visor'); s.tick(1.1); assert.deepEqual(s.grab('dewar')[0].glow, ['gloves']); s.wear('gloves'); assert.equal(s.grab('dewar')[0].type, 'grab');
});
t('맛보기 한 판: 쓰기 → 붓기 → 예상 → 담그기 → 꺼내기 → 치기 → 까닭 한 줄까지', () => {
  const s = fresh();
  assert.deepEqual(find(s.wear('visor'), 'wear').slot, 'face'); assert.deepEqual(find(s.wear('gloves'), 'step').glow, ['bowl']);
  assert.deepEqual(find(s.place('bowl', 'bench_a'), 'step').glow, ['dewar']);
  const poured = fill(s); assert.ok(s.view().boil > 1.2, '격렬하게 끓는다'); assert.ok(has(poured, 'pour', e => e.into === 'bowl'));
  const ask = find(poured, 'askPredict'); assert.deepEqual(ask.cards, ['시든다', '그대로다', '유리처럼 된다']); assert.equal(ask.q, '장미를 넣으면?');
  assert.ok(has(run(s, 6), 'boilQuiet'), '그릇이 식으면 끓음이 잦아든다');
  const early = s.dip('rose'); assert.equal(early[0].key, 'predictFirst'); assert.notEqual(obj(s, 'rose').loc, 'bowl', '예상 카드를 고르기 전에는 장미가 들어가지 않는다');
  const pf = s.predict(2); assert.equal(pf[0].text, '유리처럼 된다'); assert.deepEqual(find(pf, 'step').glow, ['tongs', 'rose']);
  const dipFx = s.dip('rose'); assert.ok(has(dipFx, 'dip')); assert.ok(find(dipFx, 'boilUp').boil > 0.5, '끓음이 확 세진다');
  const soak = run(s, 4); assert.ok(has(soak, 'state', e => e.id === 'rose' && e.to === 'glass' && e.name === '유리')); assert.ok(has(soak, 'boilQuiet'), '그리고 잦아든다');
  const lift = s.lift('rose'); assert.equal(find(lift, 'lift').state, 'glass'); assert.ok(find(lift, 'frost').amount > 0.9, '꺼내면 서리가 하얗게 핀다'); assert.deepEqual(find(lift, 'step').glow, ['mallet']);
  s.place('rose', 'bench_b');
  const chip = s.strike('rose', 1); assert.equal(chip[0].type, 'chip'); assert.equal(chip[0].grade, 'mid'); assert.equal(find(chip, 'hint').text, '더 세게 쳐 봐요'); assert.equal(s.phase, 'do', '톡으로는 끝만 깨진다(중간 결과)');
  const hit = s.strike('rose', 2, 'mallet'); assert.deepEqual({ type: hit[0].type, id: hit[0].id, level: hit[0].level }, { type: 'shatter', id: 'rose', level: 2 });
  assert.equal(find(hit, 'missionDone').id, 'taste'); assert.equal(find(hit, 'cause').text, '꽃잎 속 물이 순식간에 얼어 딱딱해졌어요. 휘지 못하니까 깨져요.');
  const e = find(hit, 'note').entry; assert.equal(e.predicted.text, '유리처럼 된다'); assert.equal(e.happened, '장미가 유리처럼 산산조각 났다.'); assert.equal(e.whyTitle, '왜 학교에서는 못 할까?'); assert.ok(e.whyNot.includes('영하 196도'));
  assert.deepEqual(e.tries.map(x => x.key), ['roseChip']); assert.equal(find(hit, 'stamp').text, '유리 장미'); assert.equal(s.phase, 'cause'); assert.equal(s.note.entries.length, 1);
});
t('까닭은 실험이 끝난 뒤에만 뜬다', () => { const s = fresh(); gear(s); const all = [...fill(s), ...s.predict(2), ...s.dip('rose'), ...run(s, 3), ...s.lift('rose')]; assert.ok(!has(all, 'cause')); assert.ok(has(s.strike('rose', 3), 'cause')); });
t('예상은 맞고 틀림을 따지지 않고 실험 노트에 「내 예상」으로 남는다', () => {
  const s = fresh(); gear(s); fill(s); s.predict(0); assert.equal(s.predict(1)[0].type, 'ignored', '한 번 고르면 바꾸지 못한다'); s.dip('rose'); run(s, 3); s.lift('rose');
  const e = find(s.strike('rose', 2), 'note').entry; assert.equal(e.predicted.text, '시든다'); assert.equal(e.predicted.actual, '유리처럼 된다'); assert.ok(!('score' in e) && !('correct' in e.predicted));
});
t('맛보기 실패: 안 얼린 장미를 쾅 치면 뭉개지고, 새 장미로 그 자리에서 이어서 한다', () => {
  const s = fresh(); gear(s); fill(s); s.predict(2); const before = s.view().bowl.ln2;
  const fx = s.strike('rose', 3); assert.equal(fx[0].type, 'crush'); assert.ok(has(fx, 'lose', e => e.id === 'rose')); assert.equal(find(fx, 'missionFail').continues, true); assert.equal(find(fx, 'hint').text, '먼저 꽁꽁 얼려요');
  assert.deepEqual(restocked(run(s, 3), 'rose'), ['rose']);
  const v = s.view(); assert.equal(v.mission.id, 'taste'); assert.equal(v.phase, 'do'); assert.ok(v.worn.visor && v.worn.gloves, '장비는 쓴 그대로'); assert.ok(v.bowl.ln2 > before - 0.1, '부은 질소도 그대로'); assert.equal(v.mission.predicted, 2, '예상도 그대로');
  s.dip('rose'); run(s, 3); s.lift('rose'); const done = s.strike('rose', 2); assert.ok(has(done, 'missionDone')); assert.deepEqual(find(done, 'note').entry.tries.map(x => x.grade), ['fail']);
});
t('맛보기 중간: 1초만 담근 장미는 유리가 못 돼서, 쳐도 꽃잎 몇 장만 떨어진다', () => {
  const s = fresh(); gear(s); fill(s); s.predict(2); s.dip('rose'); run(s, 1); assert.equal(find(s.lift('rose'), 'lift').state, 'fresh');
  const fx = s.strike('rose', 2); assert.equal(fx[0].type, 'petals'); assert.equal(fx[0].grade, 'mid'); assert.equal(obj(s, 'rose').lost, false); assert.equal(s.phase, 'do');
});
t('얼린 장미는 떨어뜨려도 산산조각 난다(푸는 길이 둘)', () => { const s = fresh(); gear(s); fill(s); s.predict(2); s.dip('rose'); run(s, 3); s.lift('rose'); const fx = s.drop('rose', 0.6); assert.equal(fx[0].type, 'shatter'); assert.ok(has(fx, 'missionDone')); });
t('다음 의뢰로 넘어가면 장비는 선반으로 돌아가고, 새 쪽지와 새 물체가 놓인다', () => {
  const s = fresh(); playTaste(s); const fx = s.next(), m = find(fx, 'mission');
  assert.deepEqual(find(fx, 'gearOff').ids.sort(), ['gloves', 'visor']); assert.equal(m.id, 'balloon'); assert.equal(m.guard, false); assert.ok(m.pictures.includes('balloon'), '둘째 의뢰는 쪽지에 그림으로만'); assert.ok(!has(fx, 'step'), '더는 빛나지 않는다');
  assert.ok(find(fx, 'appear').ids.includes('balloon')); assert.equal(find(fx, 'askPredict').q, '풍선을 넣으면?'); assert.equal(s.view().worn.visor, false);
  assert.equal(fresh().next()[0].reason, 'notDone', '의뢰를 풀기 전에는 넘어가지 못한다');
});

// ════ 의뢰 1 — 풍선 수수께끼
t('풍선 성공: 담가서 납작하게 만든 뒤, 꺼내 두 손으로 감싸면 금세 되살아난다', () => {
  const s = at('balloon'); gear(s); fill(s); s.predict(1); s.dip('balloon');
  const soak = run(s, 5); assert.ok(has(soak, 'state', e => e.to === 'wrinkled' && e.name === '쭈글쭈글')); assert.ok(has(soak, 'state', e => e.to === 'flat')); assert.ok(obj(s, 'balloon').volume < 0.1);
  s.lift('balloon'); s.place('balloon', 'bench_b'); assert.equal(s.cup('balloon')[0].type, 'cup'); const t0 = s.view().t;
  const fx = until(s, 'missionDone', 20); assert.ok(s.view().t - t0 < 6, '손의 열로 빨리 부푼다'); assert.ok(has(fx, 'revive', e => e.id === 'balloon'));
  assert.equal(find(fx, 'cause').text, '차가워지면 공기가 차지하는 자리가 줄어들고, 따뜻해지면 다시 늘어나요. 공기는 빠져나간 적이 없어요.'); assert.ok(obj(s, 'balloon').volume <= 0.95 + 1e-9);
});
t('풍선 성공(다른 길): 실험대에 두기만 해도 천천히 스스로 되살아난다', () => {
  const s = at('balloon'); gear(s); fill(s); s.predict(1); s.dip('balloon'); run(s, 5); s.lift('balloon'); s.place('balloon', 'bench_b'); const t0 = s.view().t;
  until(s, 'missionDone', 40); const took = s.view().t - t0; assert.ok(took >= 8 && took <= 20, `${took}초`);
});
t('풍선 중간: 덜 줄었을 때 꺼내면 「조금만 줄었다」 — 다시 담그면 된다', () => {
  const s = at('balloon'); gear(s); fill(s); s.predict(1); s.dip('balloon'); run(s, 1.5);
  const fx = s.lift('balloon'); assert.equal(find(fx, 'peek').grade, 'mid'); assert.equal(find(fx, 'hint').text, '납작해질 때까지 더 담가요'); assert.ok(!has(fx, 'missionFail'));
  run(s, 30); assert.equal(s.phase, 'do', '납작해진 적이 없으면 되살린 것이 아니다');
  s.dip('balloon'); run(s, 5); s.lift('balloon'); s.cup('balloon'); const done = until(s, 'missionDone', 20); assert.deepEqual(find(done, 'note').entry.tries.map(x => x.key), ['balloonHalf']);
});
t('풍선 실패: 망치로 치면 터진다 — 새 풍선으로 그 자리에서 이어서 한다', () => {
  const s = at('balloon'); gear(s); fill(s); s.predict(1);
  const pop = s.strike('balloon', 2); assert.equal(pop[0].type, 'pop'); assert.ok(has(pop, 'missionFail', e => e.reason === 'balloonPop')); assert.ok(has(pop, 'lose'));
  assert.deepEqual(restocked(run(s, 3), 'balloon'), ['balloon']);
  s.dip('balloon'); run(s, 5); s.lift('balloon'); s.place('balloon', 'bench_b');
  const tear = s.strike('balloon', 3); assert.equal(tear[0].type, 'tear'); assert.equal(find(tear, 'hint').text, '망치는 내려놓고, 두 손으로 감싸 봐요');
  run(s, 3); assert.ok(!s.view().mission.flags.includes('flat:balloon'), '찢어진 풍선의 「납작해짐」은 새 풍선 것이 아니다'); assert.equal(s.view().mission.predicted, 1);
  s.dip('balloon'); run(s, 5); s.lift('balloon'); s.cup('balloon'); const done = until(s, 'missionDone', 20); assert.deepEqual(find(done, 'note').entry.tries.map(x => x.key), ['balloonPop', 'balloonTear']);
});
t('풍선 실패: 꽁꽁 언 채로 따뜻한 물을 부으면 터진다 — 조금 기다렸다 부으면 괜찮다', () => {
  const s = at('balloon'); gear(s); fill(s); s.predict(1); s.dip('balloon'); run(s, 5); s.lift('balloon'); s.place('balloon', 'bench_b');
  const pop = s.pour('kettle', 'balloon', 0.05); assert.equal(pop[0].outcome, 'balloonPopWarm'); assert.equal(pop[0].type, 'pop'); assert.equal(find(pop, 'hint').text, '천천히 데워요. 두 손으로 감싸 봐요');
  run(s, 3); s.dip('balloon'); run(s, 5); s.lift('balloon'); s.place('balloon', 'bench_b'); run(s, 8);
  const warm = s.pour('kettle', 'balloon', 0.1); assert.equal(warm[0].type, 'warm'); assert.ok(has(until(s, 'missionDone', 10), 'missionDone'));
});
t('납작한 풍선을 톡 치면 안에서 액체가 찰랑거린다(도감 「찰랑이는 공기」)', () => {
  const s = at('balloon'); gear(s); fill(s); s.predict(1); s.dip('balloon'); run(s, 5); s.lift('balloon');
  const fx = s.strike('balloon', 1); assert.equal(fx[0].type, 'slosh'); assert.equal(find(fx, 'discover').title, '찰랑이는 공기'); assert.equal(obj(s, 'balloon').lost, false);
});

// ════ 의뢰 2 — 바나나 망치
t('바나나 성공: 끓음이 조용해질 때까지 담갔다가 탁 세 번 치면 못이 들어간다', () => {
  const s = at('banana'); gear(s); fill(s); s.predict(1); s.dip('banana_1');
  const soak = until(s, 'boilQuiet', 30); assert.ok(has(soak, 'state', e => e.to === 'crust' && e.name === '겉만 얾')); assert.ok(has(soak, 'state', e => e.to === 'stone'), '조용해졌을 때는 이미 돌이다');
  assert.equal(find(s.lift('banana_1'), 'lift').name, '돌'); assert.equal(s.grab('banana_1')[0].type, 'grab');
  const a = s.strike('woodblock', 2, 'banana_1'); assert.deepEqual({ type: a[0].type, id: a[0].id, by: a[0].by, depth: a[0].depth }, { type: 'nail', id: 'woodblock', by: 'banana_1', depth: 0.333 });
  run(s, 1); const b = s.strike('woodblock', 2, 'banana_1'); assert.equal(b[0].depth, 0.667); assert.ok(!has(b, 'missionDone'));
  run(s, 1); const c = s.strike('woodblock', 2, 'banana_1'); assert.equal(c[0].depth, 1); assert.equal(find(c, 'missionDone').id, 'banana');
  assert.equal(find(c, 'cause').text, '바나나 속은 거의 물이라, 속까지 얼면 돌처럼 단단해져요. 끓는 건 바나나의 열을 빼앗는 중이라는 뜻이에요.');
});
t('바나나 실패: 2초만 담갔다 치면 뭉개져 하나를 잃고, 쪽지 뒷면에 「보글보글이 조용해질 때까지」가 뜬다', () => {
  const s = at('banana'); gear(s); fill(s); s.predict(1); s.dip('banana_1'); run(s, 2); assert.equal(find(s.lift('banana_1'), 'lift').state, 'crust'); s.grab('banana_1');
  const fx = s.strike('woodblock', 3, 'banana_1'); assert.deepEqual({ type: fx[0].type, id: fx[0].id, outcome: fx[0].outcome }, { type: 'squash', id: 'banana_1', outcome: 'bananaOoze' });
  assert.ok(has(fx, 'lose', e => e.id === 'banana_1')); assert.ok(has(fx, 'missionFail')); const h = find(fx, 'hint'); assert.equal(h.text, '보글보글이 조용해질 때까지'); assert.ok(h.back && h.first);
  assert.equal(s.view().mission.hint, '보글보글이 조용해질 때까지'); assert.equal(s.view().mission.nail, 0); assert.equal(obj(s, 'banana_2').lost, false, '선반에 둘 남았다'); assert.ok(!has(run(s, 4), 'restock'));
  freezeBanana(s, 'banana_2'); let done = []; for (let i = 0; i < 2; i++) done = s.strike('woodblock', 3, 'banana_2'); assert.ok(has(done, 'missionDone'), '쾅은 두 번이면 된다'); assert.equal(find(done, 'note').entry.tries[0].key, 'bananaOoze');
});
t('바나나 중간: 겉만 언 바나나로 톡 치면 겉에 금만 간다(잃지는 않는다)', () => {
  const s = at('banana'); gear(s); fill(s); s.predict(1); s.dip('banana_1'); run(s, 2); s.lift('banana_1'); s.grab('banana_1');
  const fx = s.strike('woodblock', 1, 'banana_1'); assert.equal(fx[0].type, 'crackle'); assert.equal(fx[0].grade, 'mid'); assert.equal(obj(s, 'banana_1').lost, false); assert.ok(!has(fx, 'missionFail')); assert.ok(has(fx, 'hint'));
});
t('바나나 중간: 한 번 박고 머뭇거리면 녹아 물러진다 — 못은 박힌 만큼 그대로이고 다음 바나나로 마저 박는다', () => {
  const s = at('banana'); gear(s); fill(s); s.predict(1); freezeBanana(s, 'banana_1'); s.strike('woodblock', 2, 'banana_1');
  const wait = run(s, 45); assert.ok(has(wait, 'state', e => e.id === 'banana_1' && e.to === 'mushy')); assert.equal(find(wait, 'discover').title, '검게 무른 바나나');
  assert.equal(s.strike('woodblock', 2, 'banana_1')[0].outcome, 'bananaSquash'); assert.ok(Math.abs(s.view().mission.nail - 1 / 3) < 1e-9);
  fill(s); freezeBanana(s, 'banana_2'); s.strike('woodblock', 2, 'banana_2'); assert.ok(has(s.strike('woodblock', 2, 'banana_2'), 'missionDone'));
});
t('바나나: 고무망치로 못을 박으면 의뢰가 풀리지 않고 새 못으로 다시 한다', () => {
  const s = at('banana'); s.strike('woodblock', 3, 'mallet'); const fx = s.strike('woodblock', 3, 'mallet');
  assert.equal(fx[0].depth, 1); assert.ok(has(fx, 'nailReset')); assert.equal(find(fx, 'hint').text, '망치 말고 바나나로!'); assert.equal(s.phase, 'do'); assert.equal(s.view().mission.nail, 0);
});
t('바나나 셋을 다 잃으면 선반에 새로 놓인다(막히지 않는다)', () => {
  const s = at('banana'); for (const id of ['banana_1', 'banana_2', 'banana_3']) assert.equal(s.strike(id, 3)[0].type, 'squash');
  assert.deepEqual(restocked(run(s, 3), 'banana_1'), ['banana_1', 'banana_2', 'banana_3']); assert.equal(obj(s, 'banana_1').state, 'soft'); assert.equal(s.phase, 'do');
});

// ════ 의뢰 3 — 튕길까 깨질까
t('고무공 성공: 안 얼린 공은 통통 튀고, 얼린 공은 유리구슬처럼 산산조각 난다', () => {
  const s = at('balls'); gear(s); fill(s); assert.equal(s.dip('ball_2')[0].key, 'predictFirst'); s.predict(0); s.grab('ball_1');
  const a = s.drop('ball_1', 0.5); assert.equal(a[0].type, 'bounce'); assert.ok(a[0].rebound > 0.3); assert.ok(!has(a, 'missionDone'));
  s.dip('ball_2'); const soak = until(s, 'boilQuiet', 30); assert.ok(has(soak, 'state', e => e.to === 'dull')); assert.ok(has(soak, 'state', e => e.to === 'glass')); s.lift('ball_2');
  const b = s.drop('ball_2', 0.5); assert.equal(b[0].type, 'shatter'); assert.equal(b[0].id, 'ball_2'); const e = find(b, 'note').entry;
  assert.equal(e.predicted.text, '더 높이 튄다'); assert.equal(e.predicted.actual, '깨진다'); assert.equal(e.cause, '고무는 아주 차가워지면 늘어나는 성질을 잃어요. 같은 물질인데 온도만으로 성질이 바뀌었어요.');
});
t('고무공 중간: 살짝만 얼린 공은 둔하게 툭 떨어진다 — 더 얼리면 깨진다', () => {
  const s = at('balls'); gear(s); fill(s); s.predict(2); s.dip('ball_2'); run(s, 1.5); assert.equal(find(s.lift('ball_2'), 'lift').state, 'dull');
  const fx = s.drop('ball_2', 0.5); assert.equal(fx[0].outcome, 'ballDull'); assert.equal(fx[0].grade, 'mid'); assert.ok(fx[0].rebound < 0.05); assert.equal(find(fx, 'hint').text, '더 오래 얼려 봐요'); assert.equal(obj(s, 'ball_2').lost, false);
  s.dip('ball_2'); until(s, 'boilQuiet', 30); s.lift('ball_2'); const low = s.drop('ball_2', 0.05); assert.equal(low[0].outcome, 'ballClack'); assert.equal(find(low, 'hint').text, '더 높은 데서 떨어뜨려요');
  s.lift('ball_2'); assert.equal(s.drop('ball_2', 0.5)[0].type, 'shatter'); assert.equal(s.phase, 'do', '안 얼린 공도 떨어뜨려 봐야 한다'); assert.ok(has(s.drop('ball_1', 0.4), 'missionDone'));
});
t('고무공 실패: 얼린 공을 망치로 깨 버리면 하나를 잃는다 — 남은 공으로 이어서 한다', () => {
  const s = at('balls'); gear(s); fill(s); s.predict(2); s.dip('ball_2'); until(s, 'boilQuiet', 30); s.lift('ball_2'); s.place('ball_2', 'bench_b');
  const fx = s.strike('ball_2', 2); assert.equal(fx[0].outcome, 'ballShatterMallet'); assert.ok(has(fx, 'missionFail')); assert.ok(has(fx, 'lose')); assert.equal(find(fx, 'hint').text, '망치 말고, 높이 들어 떨어뜨려요');
  s.drop('ball_1', 0.5); assert.equal(s.phase, 'do'); s.dip('ball_1'); until(s, 'boilQuiet', 30); s.lift('ball_1'); assert.ok(has(s.drop('ball_1', 0.5), 'missionDone'));
});
t('얼린 공을 꺼내 놓고 기다리면 녹아서 다시 탱탱해진다(도감 「되살아난 고무공」)', () => {
  const s = at('balls'); gear(s); fill(s); s.predict(2); s.dip('ball_2'); until(s, 'boilQuiet', 30); s.lift('ball_2'); s.place('ball_2', 'bench_b');
  const wait = run(s, 40); assert.ok(has(wait, 'revive', e => e.id === 'ball_2')); assert.equal(find(wait, 'discover', e => e.id === 'revivedBall').title, '되살아난 고무공'); assert.equal(s.drop('ball_2', 0.5)[0].type, 'bounce');
});
t('손을 놓쳐 떨어진 것은 유리처럼 언 것이라도 깨지지 않는다', () => {
  const s = at('balls'); gear(s); fill(s); s.predict(2); s.dip('ball_2'); until(s, 'boilQuiet', 30); s.lift('ball_2');
  const fx = s.drop('ball_2', 1.2, true); assert.deepEqual(fx.map(e => e.type), ['return']); assert.equal(obj(s, 'ball_2').lost, false); assert.equal(obj(s, 'ball_2').state, 'glass'); assert.equal(s.note.accidents.length, 0);
  assert.equal(s.drop('ball_2', 0, false)[0].type, 'clink', '살며시 내려놓으면 딱 소리만 난다'); assert.equal(obj(s, 'ball_2').lost, false);
});

// ════ 마무리 한 방
t('마무리 성공: 남은 질소에 따뜻한 물을 부으면 구름이 솟고, 「왜 학교에서는 못 할까?」가 나온다', () => {
  const s = at('finale'); gear(s); fill(s); assert.equal(s.pour('kettle', 'bowl', 0.05)[0].key, 'predictFirst'); assert.equal(s.view().bowl.water, 0); s.predict(1);
  const all = []; for (let i = 0; i < 80 && !has(all, 'missionDone'); i++) all.push(...s.pour('kettle', 'bowl', 0.02), ...s.tick(0.1));
  assert.ok(has(all, 'cloudStart')); assert.equal(find(all, 'cloud').size, 'big'); assert.ok(s.view().cloud >= exp.bowl.cloudBig); assert.ok(s.view().boil > 1.5);
  assert.equal(find(all, 'cause').text, '하얀 것은 질소가 아니에요. 공기 속 물기가 차가워져 생긴 아주 작은 물방울, 구름이에요.');
  const why = find(all, 'whyNot'); assert.equal(why.title, '왜 학교에서는 못 할까?'); assert.equal(why.lines.length, 3); assert.ok(why.lines.join(' ').includes('700배') && why.lines.join(' ').includes('영하 196도'));
  assert.equal(s.note.entries.length, 5); assert.deepEqual(s.note.stamps, ['유리 장미', '되살아난 풍선', '바나나 망치', '유리 고무공', '실험대 구름']);
});
t('마무리 실패: 질소가 없는 그릇에 부으면 그냥 따뜻한 물이다 — 거기에 질소를 부어도 구름이 솟는다', () => {
  const s = at('finale'); gear(s); assert.ok(has(s.pour('bowl', 'bench', 1), 'spill')); assert.equal(s.view().bowl.ln2, 0); s.predict(1);
  const fx = s.pour('kettle', 'bowl', 0.3); assert.equal(find(fx, 'peek').outcome, 'waterOnly'); assert.ok(has(fx, 'missionFail')); assert.equal(find(fx, 'hint').text, '그릇에 질소가 남아 있어야 해요'); assert.equal(s.view().cloud, 0);
  const all = [...s.pour('dewar', 'bowl', 0.6)]; assert.ok(has(all, 'cloudStart')); all.push(...until(s, 'missionDone', 10)); assert.deepEqual(find(all, 'note').entry.tries.map(x => x.key), ['waterOnly']);
});
t('마무리 중간: 물을 찔끔 부으면 구름이 작게 피었다 사라진다', () => {
  const s = at('finale'); gear(s); fill(s); s.predict(1); s.pour('kettle', 'bowl', 0.01);
  const fx = run(s, 3), c = find(fx, 'cloud'); assert.equal(c.size, 'small'); assert.equal(c.grade, 'mid'); assert.equal(find(fx, 'hint').text, '질소와 물을 더 넉넉히'); assert.equal(s.phase, 'do'); assert.ok(!has(fx, 'missionFail'));
});

// ════ 질소가 줄어든다(긴장) — 시간 제한은 없다
t('시간 제한은 없다: 가만히 서 있어도 실패하지 않는다', () => { const s = fresh(); const fx = run(s, 300); assert.ok(!has(fx, 'missionFail') && !has(fx, 'ln2Out')); assert.equal(s.phase, 'do'); assert.equal(s.over, false); });
t('머뭇거리면 그릇의 질소가 날아가 다시 부어야 한다 — 얕은 질소에는 담가도 얼지 않는다', () => {
  const s = fresh(); gear(s); fill(s, 0.3); s.predict(2); const fx = run(s, 100); assert.equal(find(fx, 'ln2Low').text, '질소가 모자라요. 통에서 더 부어요.'); assert.ok(has(fx, 'bowlEmpty')); assert.equal(s.view().bowl.ln2, 0); assert.equal(s.view().boil, 0);
  const dip = s.dip('rose'); assert.equal(dip[0].type, 'shallow'); run(s, 5); assert.equal(obj(s, 'rose').state, 'fresh');
  const again = fill(s, 0.5); assert.ok(has(again, 'dip', e => e.id === 'rose'), '질소가 차오르면 그때부터 언다'); assert.ok(has(run(s, 4), 'state', e => e.to === 'glass'));
});
t('물체를 넣을 때마다 질소가 훅 줄고, 통은 비어 갈수록 더 기울여야 나온다', () => {
  const s = at('banana'); gear(s); const d0 = s.view().dewar.pourStartDeg; fill(s); s.predict(1); assert.ok(s.view().dewar.pourStartDeg > d0);
  const b0 = s.view().bowl.ln2; s.dip('banana_1'); assert.ok(Math.abs(b0 - s.view().bowl.ln2 - 0.04) < 1e-9);
});
t('통이 비면 그 의뢰는 실패로 적히고 「질소 한 통 더」를 한 번 준다 — 처음부터가 아니라 그 자리에서 이어서', () => {
  const s = at('banana'); gear(s); s.predict(1); s.pour('bowl', 'bench', 1);
  const fx = s.pour('dewar', 'bench', 99); assert.ok(has(fx, 'spill')); assert.equal(find(fx, 'ln2Out').final, false); assert.equal(find(fx, 'missionFail').reason, 'ln2Out');
  const r = find(fx, 'refill'); assert.equal(r.left, 0); assert.equal(r.text, '질소 한 통 더! 이번이 마지막이에요.');
  const v = s.view(); assert.equal(v.dewar.fill, 1); assert.equal(v.mission.id, 'banana'); assert.equal(v.phase, 'do'); assert.equal(v.mission.predicted, 1); assert.equal(v.over, false); assert.equal(s.note.entries.length, 2, '앞 의뢰의 도장도 그대로');
  assert.ok(has(playBanana(s), 'missionDone'), '한 통 더 받은 질소로 의뢰를 푼다');
});
t('두 번째로 통이 비면 더는 주지 않는다 — 그래도 판은 잠기지 않는다', () => {
  const s = at('banana'); gear(s); s.pour('bowl', 'bench', 1); s.pour('dewar', 'bench', 99);
  const fx = s.pour('dewar', 'bench', 99); assert.equal(find(fx, 'ln2Out').final, true); assert.ok(!has(fx, 'refill')); assert.equal(find(fx, 'missionFail').continues, false); assert.equal(s.over, true); assert.equal(s.view().dewar.ln2, 0);
  const more = [...s.pour('dewar', 'bowl', 0.1), ...run(s, 5)]; assert.ok(!has(more, 'ln2Out') && !has(more, 'refill'), '같은 알림을 되풀이하지 않는다'); assert.equal(find(more, 'empty').text, '통이 비었어요.');
  assert.equal(s.strike('banana_1', 1)[0].type, 'dent', '남은 것으로는 계속 만질 수 있다'); assert.equal(s.phase, 'do');
});
t('질소가 두 번 다 떨어지면 실험 전체가 아니라 그 의뢰만 새 통으로 다시 한다 — 앞 의뢰의 도장과 내 예상은 그대로', () => {
  const s = at('banana'); assert.equal(s.retry()[0].reason, 'notOver'); gear(s); s.predict(2); s.pour('bowl', 'bench', 1); s.pour('dewar', 'bench', 99); s.pour('dewar', 'bench', 99); assert.equal(s.over, true);
  const fx = s.retry(), m = find(fx, 'mission'); assert.equal(m.id, 'banana'); assert.equal(m.retry, true); assert.ok(find(fx, 'refill').retry); assert.ok(!has(fx, 'gearOff'), '장비는 쓴 그대로');
  const v = s.view(); assert.equal(v.over, false); assert.equal(v.dewar.fill, 1); assert.equal(v.mission.predicted, 2); assert.ok(v.worn.visor && v.worn.gloves); assert.deepEqual(s.note.stamps, ['유리 장미', '되살아난 풍선']);
  fill(s); freezeBanana(s, 'banana_1'); s.strike('woodblock', 3, 'banana_1'); const done = s.strike('woodblock', 3, 'banana_1');
  assert.deepEqual(find(done, 'note').entry.tries.map(x => x.key), ['ln2Out', 'ln2Out'], '실패한 일은 노트에 남는다'); assert.equal(find(done, 'note').entry.predicted.text, '바나나가 깨진다');
});
t('풍선이 이미 납작해졌으면 질소가 떨어져도 실패가 아니다(되살리는 데는 질소가 필요 없다)', () => {
  const s = at('balloon'); gear(s); fill(s); s.predict(1); s.dip('balloon'); run(s, 5); s.lift('balloon'); s.place('balloon', 'bench_b'); s.pour('bowl', 'bench', 1);
  const fx = s.pour('dewar', 'bench', 99); assert.ok(!has(fx, 'ln2Out')); s.cup('balloon'); assert.ok(has(until(s, 'missionDone', 20), 'missionDone'));
});

// ════ 사고 — 판단에서만 난다. 다치는 모습은 없고, 그 자리에서 이어서 한다.
t('사고: 보안면 없이 부으면 질소가 튀어 부은 만큼 잃는다 — 붓는 내내가 아니라 한 번만 적힌다', () => {
  const s = at('balloon'), d0 = s.view().dewar.ln2;
  const fx = s.pour('dewar', 'bowl', 0.02), a = find(fx, 'accident'); assert.equal(a.key, 'pourNoVisor'); assert.equal(a.text, '보안면 없이 액체 질소를 부었다'); assert.ok(a.real.startsWith('진짜였다면')); assert.equal(a.show, 'alarm'); assert.equal(a.first, true);
  assert.ok(find(fx, 'spill').splash); assert.equal(s.view().bowl.ln2 > 0.5, true, '그릇에는 앞 의뢰의 질소가 그대로'); assert.ok(Math.abs(d0 - s.view().dewar.ln2 - 0.07) < 1e-9);
  const b0 = s.view().bowl.ln2; for (let i = 0; i < 10; i++) assert.ok(!has(s.pour('dewar', 'bowl', 0.02), 'accident')); assert.equal(s.view().bowl.ln2, b0, '보안면 없이는 그릇에 들어가지 않는다'); assert.equal(s.note.accidents[0].count, 1);
  run(s, 3.1); assert.equal(find(s.pour('dewar', 'bowl', 0.02), 'accident').first, false); assert.equal(s.note.accidents[0].count, 2); assert.equal(s.note.accidents.length, 1);
  assert.equal(s.phase, 'do'); assert.equal(s.view().mission.id, 'balloon'); s.wear('visor'); assert.ok(has(s.pour('dewar', 'bowl', 0.02), 'pour'), '쓰고 나면 바로 이어서 붓는다');
});
t('사고: 맨손으로 질소 그릇에 손을 넣으려 하면 사고 기록이 남는다 — 들고 있던 것은 그릇에 빠진다', () => {
  const s = at('balloon'); s.wear('visor'); fill(s); s.predict(1);
  const fx = s.handIn('bowl'), a = find(fx, 'accident'); assert.equal(a.key, 'bareHand'); assert.equal(a.text, '맨손으로 영하 196도를 만지려 했다'); assert.equal(a.show, 'frost'); assert.ok(a.real.includes('동상'));
  run(s, 3.1); s.grab('balloon'); const d = s.dip('balloon', 'hand'); assert.ok(has(d, 'accident')); assert.ok(has(d, 'dip', e => e.id === 'balloon')); assert.equal(obj(s, 'balloon').loc, 'bowl');
  run(s, 3.1); assert.ok(has(s.lift('balloon', 'hand'), 'accident'), '맨손으로 건지려 해도 사고다'); assert.equal(obj(s, 'balloon').loc, 'bowl'); assert.equal(find(s.lift('balloon', 'tongs'), 'lift').with, 'tongs');
  assert.equal(s.note.accidents.length, 1); assert.equal(s.note.accidents[0].count, 3); assert.equal(s.phase, 'do');
});
t('장갑을 껴도 손을 넣지는 못한다(사고는 아니고 집게를 알려 준다) — 빈 그릇은 만져도 된다', () => {
  const s = at('balloon'); gear(s); fill(s); const fx = s.handIn('bowl'); assert.equal(fx[0].type, 'blocked'); assert.equal(fx[0].key, 'useTongs'); assert.deepEqual(fx[0].glow, ['tongs']); assert.equal(s.note.accidents.length, 0);
  const e = at('balloon'); e.pour('bowl', 'bench', 1); assert.equal(e.handIn('bowl')[0].type, 'touch'); assert.equal(e.note.accidents.length, 0);
});
t('사고: 장갑 없이 얼린 물체를 집으면 그 물체를 잃는다 — 안 언 것은 맨손으로 집어도 된다', () => {
  const s = at('balloon'); s.wear('visor'); fill(s); s.predict(1); assert.equal(s.grab('balloon')[0].type, 'grab', '안 언 풍선은 괜찮다');
  s.dip('balloon', 'tongs'); run(s, 5); s.lift('balloon'); s.place('balloon', 'bench_b');
  const fx = s.grab('balloon'), a = find(fx, 'accident'); assert.equal(a.key, 'frozenNoGloves'); assert.equal(a.text, '장갑 없이 얼린 물체를 집으려 했다'); assert.ok(has(fx, 'lose', e => e.id === 'balloon'));
  assert.deepEqual(restocked(run(s, 3), 'balloon'), ['balloon']); assert.equal(s.phase, 'do');
  s.dip('balloon'); run(s, 5); s.lift('balloon'); run(s, 1); assert.ok(has(s.cup('balloon'), 'accident'), '감싸는 것도 만지는 것이다');
  s.tick(0.1); assert.equal(s.grab('tongs')[0].type, 'grab', '집게는 도구라 괜찮다');
});
t('사고: 얼린 바나나를 장갑 없이 망치 삼아 쥐어도 사고다', () => {
  const s = at('banana'); s.wear('visor'); fill(s); s.predict(1); s.dip('banana_1'); until(s, 'boilQuiet', 30); s.lift('banana_1');
  const fx = s.strike('woodblock', 2, 'banana_1'); assert.equal(find(fx, 'accident').key, 'frozenNoGloves'); assert.ok(!has(fx, 'nail')); assert.equal(obj(s, 'banana_1').lost, true); assert.equal(s.view().mission.nail, 0);
});
t('사고: 질소를 병에 넣고 뚜껑을 닫으려 하면 안 닫히고, 대신 풍선을 씌워 보여 준다(거대하게 부풀다 펑)', () => {
  const s = at('balloon'); gear(s); assert.equal(s.cap('bottle')[0].type, 'cap', '빈 병은 닫아도 된다');
  assert.equal(find(s.pour('dewar', 'bottle', 0.1), 'pour').into, 'bottle');
  const fx = s.cap('bottle'), a = find(fx, 'accident'); assert.equal(a.key, 'capBottle'); assert.ok(a.real.includes('700배')); assert.equal(find(fx, 'demo').key, 'balloonOnBottle'); assert.ok(!has(fx, 'pop'), '병이 터지는 장면은 없다');
  run(s, 1); assert.ok(s.view().bottle.size > 0.3); const end = until(s, 'pop', 10), pop = find(end, 'pop'); assert.equal(pop.id, 'bottle'); assert.equal(pop.big, true);
  assert.ok(find(end, 'cause').text.includes('약 700배')); assert.equal(find(end, 'discover').title, '거대 풍선'); assert.equal(s.view().bottle.ln2, 0); assert.equal(s.phase, 'do');
  s.pour('dewar', 'bottle', 0.01); run(s, 3.1); s.pour('dewar', 'bottle', 0.01); assert.ok(has(s.cap('bottle'), 'demo')); assert.equal(find(until(s, 'demoEnd', 10), 'demoEnd').outcome, 'fizzle');
});
t('실험대에 쏟는 것은 사고가 아니라 발견이다(도감 「굴러다니는 방울」)', () => {
  const s = at('balloon'); gear(s); const fx = s.pour('dewar', 'bench', 0.1); assert.equal(find(fx, 'spill').text, '방울이 구슬처럼 굴러다니다 사라졌어요.'); assert.equal(find(fx, 'discover').title, '굴러다니는 방울');
  assert.ok(!has(fx, 'accident')); assert.equal(s.note.accidents.length, 0); assert.ok(!has(s.pour('dewar', 'bench', 0.1), 'discover'), '도감은 처음 본 것만 찍는다');
  s.pour('dewar', 'bowl', 5); assert.ok(s.view().bowl.fill === 1 && s.note.accidents.length === 0, '넘치게 부어도 사고가 아니다');
});
t('사고 넷을 다 모으면 도장이 나오고, 사고마다 「진짜였다면」이 붙는다', () => {
  const s = at('balloon'); s.pour('dewar', 'bowl', 0.02); s.wear('visor'); fill(s); s.handIn('bowl'); s.predict(1);
  s.dip('balloon'); run(s, 5); s.lift('balloon'); s.grab('balloon'); s.pour('dewar', 'bottle', 0.1);
  const fx = s.cap('bottle'); assert.equal(find(fx, 'stamp').text, '사고 수집가'); const acc = s.note.accidents;
  assert.deepEqual(acc.map(a => a.key).sort(), Object.keys(exp.accidents).sort()); for (const a of acc) assert.ok(a.real.startsWith('진짜였다면') && a.text);
  const kept = createSession(exp, { note: s.note }); assert.equal(kept.note.accidents.length, 4, '노트는 다음 판으로 넘겨줄 수 있다');
});
t('맛보기에서는 어떤 짓을 해도 사고가 나지 않는다(막기만 한다)', () => {
  const s = fresh(); gear(s); fill(s); s.predict(2); s.unwear('gloves'); s.unwear('visor');
  assert.equal(s.handIn('bowl')[0].type, 'blocked'); s.wear('gloves'); s.dip('rose'); run(s, 3); s.lift('rose'); s.place('rose', 'bench_b'); s.unwear('gloves');
  assert.equal(s.grab('rose')[0].type, 'blocked'); assert.equal(obj(s, 'rose').lost, false); run(s, 1.1); assert.equal(s.pour('dewar', 'bowl', 0.1)[0].type, 'blocked'); assert.equal(s.note.accidents.length, 0);
});
t('어떤 효과도 다친 모습을 그리게 하지 않는다 — 사고는 화면 서리나 경보등, 기록 한 줄뿐이다', () => {
  const s = at('balloon'); s.pour('dewar', 'bowl', 0.02); s.wear('visor'); fill(s); s.handIn('bowl'); s.predict(1); s.dip('balloon'); run(s, 5); s.lift('balloon'); s.grab('balloon'); s.pour('dewar', 'bottle', 0.1); s.cap('bottle'); run(s, 8);
  const acc = s.log.filter(e => e.type === 'accident'); assert.equal(acc.length, 4); for (const a of acc) assert.ok(['frost', 'alarm'].includes(a.show));
  for (const e of s.log) assert.ok(!/injur|hurt|wound|burn|blood|pain/i.test(e.type + ' ' + (e.outcome || '')), e.type);
});

// ════ 자유 실험 · 도감
t('마무리까지 끝내면 자유 실험이 열리고 「이것도 넣어 볼까」 물체들이 선반에 놓인다', () => {
  const s = at('finale'); playFinale(s); const fx = s.next(), f = find(fx, 'freePlay'); assert.equal(f.note, '이것도 넣어 볼까'); assert.equal(find(fx, 'unlock').key, 'nextShelf');
  assert.deepEqual(find(fx, 'appear').ids.sort(), ['bubblewand', 'egg', 'eraser', 'lettuce', 'papercup', 'rubberband', 'tangerine']); assert.equal(s.phase, 'free');
  const blanks = s.encyclopedia(); assert.equal(blanks.length, 14); assert.ok(blanks.every(e => !e.found && !e.title), '빈칸은 그림자만');
});
t('자유 실험: 물체마다 결과가 다 다르고, 처음 본 결과는 도감에 찍힌다 — 다 모으면 도장', () => {
  const s = at('free'); gear(s); fill(s); const seen = [];
  const got = (fx, title, type) => { const d = find(fx, 'discover', e => e.title === title); assert.ok(d && d.first && d.text, `${title} 이(가) 안 찍혔다`); if (type) assert.ok(has(fx, type), `${title}: ${type}`); seen.push(title); };
  s.dip('tangerine'); until(s, 'boilQuiet', 30); s.lift('tangerine'); s.place('tangerine', 'bench_b'); got(s.strike('tangerine', 2), '구슬 귤', 'beads');
  s.dip('lettuce'); run(s, 2); s.lift('lettuce'); s.place('lettuce', 'bench_b'); got(s.strike('lettuce', 1), '과자 상추', 'crumble');
  fill(s); s.dip('egg'); until(s, 'boilQuiet', 30); s.lift('egg'); got(s.drop('egg', 0.4), '돌 달걀', 'roll'); assert.equal(obj(s, 'egg').lost, false, '달걀은 안 깨진다');
  s.dip('eraser'); until(s, 'boilQuiet', 30); s.lift('eraser'); s.place('eraser', 'bench_b'); got(s.strike('eraser', 2), '두 동강 지우개', 'snap');
  s.dip('papercup'); run(s, 3); got(s.lift('papercup'), '그대로인 종이컵', 'same'); assert.equal(obj(s, 'papercup').stateName, '그대로');
  fill(s); s.dip('rubberband'); run(s, 2); s.lift('rubberband'); got(s.drop('rubberband', 0.3), '국수 고무줄', 'shreds');
  const bub = s.dip('bubblewand'); got(bub, '얼음 비눗방울', 'bubbles'); assert.equal(bub[0].frozen, true);
  s.dip('rose'); run(s, 4); s.lift('rose'); s.place('rose', 'bench_b'); got(s.pour('kettle', 'rose', 0.1), '얼음 옷', 'icecoat');
  got(run(s, 6), '축 늘어진 장미', 'state'); assert.equal(obj(s, 'rose').state, 'limp');
  fill(s); s.dip('balloon'); run(s, 5); s.lift('balloon'); got(s.strike('balloon', 1), '찰랑이는 공기', 'slosh');
  if (s.note.found.includes('mushyBanana')) seen.push('검게 무른 바나나'); else { s.dip('banana_2'); run(s, 1); s.lift('banana_2'); got(run(s, 20), '검게 무른 바나나'); }   // 바나나 의뢰에서 쓴 바나나가 녹으며 이미 찍혔을 수 있다
  s.dip('ball_1'); until(s, 'boilQuiet', 30); s.lift('ball_1'); got(run(s, 40), '되살아난 고무공', 'revive');
  got(s.pour('dewar', 'bench', 0.05), '굴러다니는 방울', 'spill'); s.pour('dewar', 'bottle', 0.1); s.cap('bottle'); const end = until(s, 'pop', 10); got(end, '거대 풍선');
  assert.equal(new Set(seen).size, 14); assert.equal(find(end, 'stamp').text, '도감 완성'); assert.ok(s.encyclopedia().every(e => e.found && e.title && e.text));
});
t('자유 실험: 질소가 없으면 비눗방울은 그냥 떠오르고, 얼리지 않은 물체는 평범하게 군다', () => {
  const s = at('free'); s.pour('bowl', 'bench', 1); const b = s.dip('bubblewand'); assert.equal(b[0].type, 'bubbles'); assert.ok(!b[0].frozen && !has(b, 'discover'));
  assert.equal(s.strike('eraser', 3)[0].type, 'boing'); assert.equal(s.drop('egg', 0.4)[0].outcome, 'plop'); assert.equal(s.strike('lettuce', 3)[0].type, 'flop'); assert.equal(s.dip('kettle')[0].key, 'notDippable');
});
t('자유 실험에서는 질소가 떨어져도 계속 한 통 더 준다', () => {
  const s = at('free'); gear(s); for (let i = 0; i < 3; i++) { s.pour('bowl', 'bench', 1); const fx = s.pour('dewar', 'bench', 99); assert.equal(find(fx, 'refill').text, '질소 한 통 더!'); assert.ok(!has(fx, 'missionFail')); } assert.equal(s.over, false);
});

// ════ 한 판 전체 · 뷰와의 약속
t('한 판 전체: 맛보기 → 풍선 → 바나나 → 고무공 → 마무리 → 자유 실험까지 사건만으로 끝까지 간다', () => {
  const s = fresh(), all = [];
  for (const m of exp.missions) { assert.equal(s.missionId, m.id); const fx = PLAY[m.id](s); assert.ok(has(fx, 'missionDone'), m.id); all.push(...fx, ...s.next()); }
  assert.equal(s.phase, 'free'); assert.equal(s.over, false); assert.equal(s.note.accidents.length, 0); assert.ok(s.view().t < 240, `${s.view().t}초`);
  assert.deepEqual(s.note.entries.map(e => e.title), ['맛보기', '풍선 수수께끼', '바나나 망치', '튕길까 깨질까', '마무리 한 방']);
  for (const e of s.note.entries) assert.ok(e.predicted.text && e.happened && e.cause && e.whyNot && e.stamp);
  assert.ok(!s.log.some(e => e.type === 'refill'), '곧장 가면 질소 한 통으로 충분하다');
});
t('모든 사건은 효과를 하나 이상 돌려준다(아무 일도 안 일어나는 조작은 없다)', () => {
  const s = at('banana'); gear(s); fill(s); s.predict(1);
  const tries = [() => s.grab('rose'), () => s.place('rose', 'bench_c'), () => s.dip('woodblock'), () => s.lift('woodblock'), () => s.strike('bowl', 3), () => s.strike('dewar', 1), () => s.strike('tongs', 2, 'rose'), () => s.drop('mallet', 0.3),
    () => s.cup('rose'), () => s.cup('rose', false), () => s.dip('gloves'), () => s.pour('kettle', 'bench', 0.1), () => s.pour('kettle', 'rose', 0.1), () => s.cap('bottle'), () => s.cap('rose'), () => s.wear('rose'), () => s.grab('nothing'), () => s.grab('tangerine'), () => s.unwear('visor'), () => s.place('visor', 'body')];
  for (const f of tries) { const fx = f(); assert.ok(fx.length >= 1, f.toString()); for (const e of fx) assert.equal(typeof e.type, 'string'); }
  assert.equal(s.grab('tangerine')[0].reason, 'unavailable'); assert.ok(find(s.strike('bowl', 3), 'spill'), '질소가 든 그릇을 쾅 치면 튄다');
});
t('사건 이름표로도 보낼 수 있다: { type, … } 한 덩이', () => {
  const s = createSession(exp); assert.equal(find(s.dispatch({ type: 'start' }), 'mission').id, 'taste');
  assert.equal(s.dispatch({ type: 'wear', id: 'visor' })[0].type, 'wear'); s.dispatch({ type: 'wear', id: 'gloves' }); s.dispatch({ type: 'place', id: 'bowl', where: 'bench_a' });
  assert.equal(s.dispatch({ type: 'pour', from: 'dewar', into: 'bowl', amount: 0.5 })[0].type, 'pour'); s.dispatch({ type: 'predict', index: 2 }); s.dispatch({ type: 'dip', id: 'rose' }); s.dispatch({ type: 'tick', dt: 3 });
  s.dispatch({ type: 'lift', id: 'rose' }); assert.ok(has(s.dispatch({ type: 'strike', target: 'rose', level: 3, with: 'mallet' }), 'missionDone')); assert.equal(s.dispatch({ type: 'jump' })[0].type, 'ignored');
  for (const k of ['start', 'wear', 'unwear', 'grab', 'place', 'pour', 'dip', 'lift', 'handIn', 'strike', 'drop', 'cup', 'cap', 'predict', 'next', 'retry', 'tick']) assert.ok(EVENTS[k] && typeof s[k] === 'function', k);
});
t('화면이 읽는 값은 복사본이다 — 뷰가 고쳐도 판은 흔들리지 않는다', () => {
  const s = fresh(); gear(s); fill(s); const v = s.view(); v.bowl.ln2 = 0; v.objects.rose.loc = 'gone'; v.worn.visor = false; const nt = s.note; nt.stamps.push('가짜');
  assert.ok(s.view().bowl.ln2 > 0.5); assert.equal(s.view().objects.rose.loc, 'shelf'); assert.equal(s.view().worn.visor, true); assert.equal(s.note.stamps.length, 0);
  const o = s.view().objects.rose; assert.deepEqual([o.name, o.state, o.stateName, o.frost, o.cold], ['장미', 'fresh', '싱싱함', 0, false]); assert.ok(s.view().dewar.pourStartDeg > 25 && s.view().quiet === false);
});
t('큰 dt 한 번이나 잘게 여러 번이나 같은 일이 일어난다(문턱을 놓치지 않는다)', () => {
  const a = at('balloon'), b = at('balloon'); for (const s of [a, b]) { gear(s); fill(s); s.predict(1); s.dip('balloon'); }
  const fa = a.tick(5), fb = run(b, 5); assert.deepEqual(fa.filter(e => e.type === 'state').map(e => e.to), fb.filter(e => e.type === 'state').map(e => e.to)); assert.ok(a.view().mission.flags.includes('flat:balloon'));
});
console.log(`session: ${n} 통과`);
