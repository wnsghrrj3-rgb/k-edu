// 케이모션 과학실 — 「공기를 빼면」 화면 없이 한 판을 끝까지 (node kmotion/lab/tests/test_session_vacuum.js)
// 뷰가 보낼 「뜻이 있는 사건」만으로 의뢰 셋(성공·실패·중간) · 사고 · 밸브 확 열기 · 자유 실험을 돌린다.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession, EVENTS } from '../sim/session_vacuum.js';

const exp = JSON.parse(readFileSync(new URL('../exp/vacuum/exp.json', import.meta.url), 'utf8'));
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ✓', name); };

// ── 시험 도구
const RATE = 1.5;
const find = (fx, type, pred) => fx.find(e => e.type === type && (!pred || pred(e)));
const has = (fx, type, pred) => !!find(fx, type, pred);
const run = (s, sec) => { const all = []; for (let i = 0; i < Math.round(sec * 10); i++) all.push(...s.tick(0.1)); return all; };
const stroke = (s, k = 1) => [...s.pump(k), ...s.tick(1 / RATE)];
const pumpN = (s, count, k = 1) => { const all = []; for (let i = 0; i < count; i++) all.push(...stroke(s, k)); return all; };
/** 초당 1.5번 펌프질을 그 효과가 올 때까지 → { fx, strokes } */
function pumpUntil(s, type, max = 60, pred){ const all = []; for (let i = 1; i <= max; i++) { all.push(...stroke(s)); if (has(all, type, pred)) return { fx: all, strokes: i }; } assert.fail(`「${type}」 효과가 펌프질 ${max}번 안에 오지 않았다`); }
/** 밸브를 천천히 열어 공기를 다 넣고 잠근 뒤 종을 든다 */
const release = s => [...s.valve(1, false), ...run(s, 6), ...s.valve(0), ...s.liftBell()];
const fresh = () => { const s = createSession(exp); s.start(); return s; };
const obj = (s, id) => s.view().objects[id];
const setUp = (s, id, bell = 'bell') => [...s.place(id, 'plate'), ...s.place(bell, 'plate')];

function playMarsh(s){ setUp(s, 'marshmallow'); s.predict(2); return pumpUntil(s, 'missionDone').fx; }
function playClock(s){ release(s); s.place('marshmallow', 'shelf'); setUp(s, 'clock'); s.predict(2); return pumpUntil(s, 'missionDone').fx; }
function playBoil(s){ release(s); s.place('clock', 'shelf'); setUp(s, 'beaker_water'); s.predict(2); return pumpUntil(s, 'missionDone').fx; }
const PLAY = { marsh: playMarsh, clock: playClock, boil: playBoil };
/** 그 의뢰가 막 시작된 판(앞 의뢰들은 성공 길로 지나온다). 'free' = 자유 실험 */
function at(id){ const s = fresh(); for (const m of exp.missions) { if (m.id === id) return s; assert.ok(has(PLAY[m.id](s), 'missionDone'), m.id); s.next(); } return s; }
/** 종 안을 비우고(공기를 넣고 종을 들고) 받침판 위 물체를 선반으로 */
function clear(s){ if (s.view().bell) release(s); for (const id of s.view().plate) { if (obj(s, id).role === 'tube') s.grab(id); s.place(id, 'shelf'); } }

// ════ 시작 · 할 일은 하나
t('시작하기 전에는 어떤 사건도 받지 않는다', () => { const s = createSession(exp); assert.equal(s.pump(1)[0].reason, 'notStarted'); assert.equal(s.phase, 'idle'); assert.deepEqual(s.tick(1), []); });
t('시작하면 쪽지 「마시멜로를 손대지 않고 두 배로 키워라」가 놓이고 마시멜로가 빛난다', () => {
  const s = createSession(exp), fx = s.start(), m = find(fx, 'mission');
  assert.equal(m.note, '마시멜로를 손대지 않고 두 배로 키워라'); assert.deepEqual(find(fx, 'step').glow, ['marshmallow']);
  assert.deepEqual(find(fx, 'appear').ids, ['plate', 'pump', 'bell', 'marshmallow', 'balloon_s']);
  assert.equal(obj(s, 'bell_cracked').available, false, '첫 의뢰에는 금 간 종이 없다'); assert.equal(obj(s, 'clock').available, false); assert.equal(s.view().p, 1);
});
t('첫 의뢰는 한 번에 하나씩 빛난다: 마시멜로 → 종 → (예상 카드) → 펌프', () => {
  const s = fresh(); assert.deepEqual(find(s.place('marshmallow', 'plate_center'), 'step').glow, ['bell']);
  const cover = s.place('bell', 'plate'); assert.ok(has(cover, 'cover', e => e.ids.includes('marshmallow'))); assert.deepEqual(find(cover, 'step').glow, []);
  const ask = find(cover, 'askPredict'); assert.equal(ask.q, '종 안의 공기를 빼면 마시멜로는?'); assert.deepEqual(ask.cards, ['쪼그라든다', '그대로다', '부풀어 오른다']);
  assert.deepEqual(find(s.predict(2), 'step').glow, ['pump']);
});
t('예상 카드를 고르기 전에는 펌프질해도 공기가 빠지지 않고 카드가 다시 뜬다', () => {
  const s = fresh(); setUp(s, 'marshmallow'); const fx = s.pump(1); assert.equal(fx[0].key, 'predictFirst'); assert.ok(find(fx, 'askPredict').again); assert.equal(s.view().p, 1); assert.equal(s.view().strokes, 0);
});

// ════ ① 마시멜로
t('① 성공: 펌프질 6~8번에 마시멜로가 두 배가 되고, 까닭 한 줄은 그 뒤에만 뜬다', () => {
  const s = fresh(); setUp(s, 'marshmallow'); s.predict(2); const { fx, strokes } = pumpUntil(s, 'missionDone');
  assert.ok(strokes >= 6 && strokes <= 8, `${strokes}번`);
  assert.ok(fx.filter(e => e.type === 'puff' && e.id === 'marshmallow').length >= 3, '부풀어 가는 것이 여러 번 보인다');
  const big = find(fx, 'puff', e => e.outcome === 'marshDouble'); assert.ok(big.scale >= 2);
  assert.ok(s.log.findIndex(e => e.type === 'cause') > s.log.findIndex(e => e.type === 'missionDone'), '까닭은 끝난 뒤에');
  assert.equal(find(fx, 'cause').text, exp.missions[0].cause);
  const e = find(fx, 'note').entry; assert.equal(e.predicted.text, '부풀어 오른다'); assert.equal(e.happened, '공기를 뺄수록 마시멜로가 부풀어 두 배가 되었다.'); assert.equal(e.whyTitle, '왜 학교에서는 못 할까?'); assert.ok(e.whyNot);
  assert.equal(find(fx, 'stamp').text, '두 배 마시멜로'); assert.ok(!has(fx, 'whyNot'), '「왜 학교에서는」 묶음은 마지막 의뢰 뒤에'); assert.equal(s.phase, 'cause');
});
t('공기를 다시 넣으면 마시멜로는 처음보다 작아진다', () => {
  const s = fresh(); playMarsh(s); pumpN(s, 10); const fx = [...s.valve(1, false), ...run(s, 6)];
  const sh = find(fx, 'shrink', e => e.outcome === 'marshShrink'); assert.ok(sh && sh.scale < 1, '처음보다 작게'); assert.ok(has(fx, 'discover', e => e.id === 'marshShrink'));
  assert.ok(obj(s, 'marshmallow').size < 1); assert.ok(s.liftBell().some(e => e.type === 'lift'), '공기를 넣으면 종이 들린다');
});
t('① 실패: 종을 덮지 않고 펌프질하면 공기가 그냥 들어온다 → 실패 기록, 종을 덮으라는 귀띔', () => {
  const s = fresh(); s.place('marshmallow', 'plate'); const fx = s.pump(1);
  assert.ok(find(fx, 'pump').open); assert.equal(find(fx, 'pumpOpen').outcome, 'noBell'); const f = find(fx, 'missionFail'); assert.equal(f.continues, true);
  assert.deepEqual(find(fx, 'hint').glow, ['bell']); assert.equal(find(fx, 'hint').text, '종을 덮어야 공기가 빠져요.');
  s.place('bell', 'plate'); s.predict(2); assert.ok(pumpUntil(s, 'missionDone').strokes <= 8, '그 자리에서 이어서 된다'); assert.equal(s.note.entries[0].tries[0].key, 'noBell');
});
t('① 중간: 반쯤 부풀리고 공기를 넣으면 「두 배가 되기 전에 공기가 돌아왔다」 → 이어서 하면 된다', () => {
  const s = fresh(); setUp(s, 'marshmallow'); s.predict(2); pumpN(s, 4); assert.ok(obj(s, 'marshmallow').g > 1.4 && obj(s, 'marshmallow').g < 2);
  const fx = [...s.valve(1, false), ...run(s, 6)]; const mid = find(fx, 'shrink', e => e.outcome === 'marshHalf'); assert.equal(mid.grade, 'mid'); assert.equal(find(fx, 'hint').text, '조금만 더! 두 배가 될 때까지 펌프질해요.');
  assert.ok(!has(fx, 'missionFail'), '중간은 실패가 아니다'); assert.equal(s.phase, 'do');
  s.valve(0); assert.ok(has(pumpUntil(s, 'missionDone').fx, 'missionDone')); assert.deepEqual(s.note.entries[0].tries.map(x => x.grade), ['mid']);
});
t('① 모자람: 한두 번만 펌프질하고 공기를 넣으면 「조금 부풀다 말았다」(실패, 이어서)', () => {
  const s = fresh(); setUp(s, 'marshmallow'); s.predict(2); pumpN(s, 2); const fx = [...s.valve(1, false), ...run(s, 6)];
  assert.equal(find(fx, 'shrink', e => e.outcome === 'marshLittle').grade, 'fail'); assert.ok(has(fx, 'missionFail', e => e.continues));
});
t('펌프질을 멈추면 바늘이 아주 천천히 되돌아간다', () => {
  const s = fresh(); setUp(s, 'marshmallow'); s.predict(2); pumpN(s, 3); const p0 = s.view().p; run(s, 10); const p1 = s.view().p;
  assert.ok(Math.abs(p1 - p0 - 0.04) < 0.002, `${p0} → ${p1}`); assert.equal(s.view().bell, 'bell');
});
t('공기를 뺀 종은 안 들린다 — 밸브로 공기를 넣으면 들린다', () => {
  const s = fresh(); setUp(s, 'marshmallow'); s.predict(2); pumpN(s, 5);
  const fx = s.liftBell(); assert.equal(fx[0].type, 'stuck'); assert.ok(has(fx, 'discover', e => e.id === 'stuckBell')); assert.deepEqual(find(fx, 'hint').glow, ['plate']); assert.equal(s.view().bell, 'bell');
  assert.equal(s.grab('bell')[0].type, 'stuck', '집으려 해도 마찬가지'); assert.equal(s.place('bell', 'bench')[0].type, 'stuck');
  s.valve(1, false); run(s, 6); assert.ok(s.view().liftable); assert.equal(find(s.liftBell(), 'lift').id, 'bell'); assert.equal(s.view().p, 1); assert.equal(s.view().sealed, false);
});
t('종이 덮인 물체는 집을 수 없다 — 종을 먼저 들라고 종이 빛난다', () => {
  const s = fresh(); setUp(s, 'marshmallow'); const fx = s.grab('marshmallow'); assert.equal(fx[0].key, 'bellOn'); assert.deepEqual(fx[0].glow, ['bell']);
  assert.equal(s.place('balloon_s', 'plate')[0].key, 'bellOn', '종이 덮였으면 더 넣을 수도 없다'); assert.equal(s.place('marshmallow', 'shelf').find(e => e.type === 'blocked').key, 'bellOn');
});
t('밸브를 한 번에 확 열면 안의 것이 엎어질 뿐 사고가 아니다', () => {
  const s = fresh(); setUp(s, 'marshmallow'); s.place('marshmallow', 'plate'); s.predict(2); pumpN(s, 5);
  const fx = s.valve(1, true); const w = find(fx, 'whoosh'); assert.ok(w); assert.deepEqual(w.ids, ['marshmallow']); assert.equal(w.cause, 'valve');
  assert.ok(!has(fx, 'accident')); assert.equal(s.note.accidents.length, 0); assert.equal(find(fx, 'hiss').fast, true); assert.equal(s.view().p, 1);
  assert.ok(obj(s, 'marshmallow').knocked); assert.ok(has(fx, 'discover', e => e.id === 'whoosh')); assert.equal(find(fx, 'hint').text, '밸브는 천천히 열어요. 엎어진 것을 다시 놓아요.');
  s.liftBell(); const up = s.place('marshmallow', 'plate'); assert.ok(find(up, 'place').upright); assert.equal(obj(s, 'marshmallow').knocked, false);
  s.place('bell', 'plate'); assert.equal(s.view().valve, 0, '종을 덮으면 밸브가 잠긴다'); assert.ok(has(pumpUntil(s, 'missionDone').fx, 'missionDone'), '다시 놓고 이어서 하면 된다');
});
t('조금만 뺀 상태에서 확 열면 「푸슉」 소리뿐 엎어지지 않는다', () => { const s = fresh(); setUp(s, 'marshmallow'); s.predict(2); pumpN(s, 1); const fx = s.valve(1, true); assert.ok(!has(fx, 'whoosh')); assert.equal(obj(s, 'marshmallow').knocked, false); });
t('밸브를 열어 둔 채 펌프질하면 빠지지 않고 밸브(받침판)가 빛난다', () => {
  const s = fresh(); setUp(s, 'marshmallow'); s.predict(2); s.valve(1, false); const fx = s.pump(1); assert.ok(find(fx, 'pump').valveOpen); assert.deepEqual(find(fx, 'blocked').glow, ['plate']); assert.equal(s.view().p, 1);
  s.valve(0); assert.ok(s.pump(1).some(e => e.type === 'pump' && e.p < 1));
});

// ════ ② 자명종
t('② 둘째 의뢰부터는 빛나지 않고 쪽지 그림만 — 금 간 종과 방호 유리판이 선반에 놓인다', () => {
  const s = fresh(); playMarsh(s); const fx = s.next(); const m = find(fx, 'mission');
  assert.equal(m.note, '자명종을 끄지 않고 조용히 시켜라'); assert.deepEqual(m.pictures, ['clock', 'bell', 'pump']); assert.equal(m.glows, false); assert.ok(!has(fx, 'step'));
  assert.deepEqual(find(fx, 'appear').ids, ['bell_cracked', 'shield', 'clock', 'candle', 'suction']); assert.equal(obj(s, 'bell_cracked').name, obj(s, 'bell').name, '겉보기 이름은 같다'); assert.ok(obj(s, 'bell_cracked').cracked);
});
t('② 성공: 자명종은 계속 울리는데 소리가 점점 작아져 18~22번 만에 안 들린다', () => {
  const s = at('clock'); release(s); s.place('marshmallow', 'shelf'); setUp(s, 'clock'); s.predict(2);
  const { fx, strokes } = pumpUntil(s, 'missionDone'); assert.ok(strokes >= 18 && strokes <= 22, `${strokes}번`);
  const levels = fx.filter(e => e.type === 'quiet' && e.id === 'clock' && e.level != null).map(e => e.level); assert.ok(levels.length >= 3); for (let i = 1; i < levels.length; i++) assert.ok(levels[i] < levels[i - 1], '점점 작아진다');
  assert.ok(has(fx, 'quiet', e => e.outcome === 'clockSilent')); assert.equal(obj(s, 'clock').ringing, true, '끈 것이 아니다'); assert.ok(find(fx, 'quiet', e => e.outcome === 'clockSilent').level < 0.06); assert.ok(s.view().sound < 0.1);
  assert.equal(find(fx, 'cause').text, '소리는 공기를 타고 와요. 탈 것이 없으면 못 와요.');
  const back = [...s.valve(1, false), ...run(s, 6)]; assert.ok(has(back, 'loud', e => e.outcome === 'clockBack'), '공기를 넣으면 소리가 돌아온다');
});
t('② 중간: 소리가 작아졌다가 공기와 함께 돌아오면 「거의 다 왔어요」', () => {
  const s = at('clock'); release(s); s.place('marshmallow', 'shelf'); setUp(s, 'clock'); s.predict(2); pumpN(s, 12);
  const fx = [...s.valve(1, false), ...run(s, 6)]; assert.equal(find(fx, 'quiet', e => e.outcome === 'clockSoft').grade, 'mid'); assert.equal(find(fx, 'hint').text, '거의 다 왔어요. 소리가 사라질 때까지 빼요.');
});
t('② 실패: 몇 번만 빼고 그치면 「소리가 거의 그대로였다」', () => {
  const s = at('clock'); release(s); s.place('marshmallow', 'shelf'); setUp(s, 'clock'); s.predict(2); pumpN(s, 3);
  const fx = [...s.valve(1, false), ...run(s, 6)]; assert.equal(find(fx, 'quiet', e => e.outcome === 'clockSame').grade, 'fail'); assert.ok(has(fx, 'missionFail', e => e.continues));
});
t('금 간 종을 방호 유리판 없이 쓰면 사고 기록', () => {
  const s = at('clock'); release(s); s.place('marshmallow', 'shelf'); setUp(s, 'clock', 'bell_cracked'); s.predict(2);
  const warn = pumpUntil(s, 'crack').fx; assert.equal(find(warn, 'crack').stage, 1); assert.ok(has(warn, 'alarm')); assert.ok(find(warn, 'hint').text.includes('방호 유리판'));
  const { fx } = pumpUntil(s, 'accident'); const a = find(fx, 'accident');
  assert.equal(find(fx, 'crack', e => e.stage === 2).shield, false); assert.equal(a.text, '금 간 종을 방호 유리판 없이 썼다'); assert.ok(a.real.startsWith('진짜였다면')); assert.equal(a.show, 'alarm');
  assert.equal(s.note.accidents.length, 1); assert.equal(find(fx, 'stamp').text, '사고 수집가');
  assert.ok(obj(s, 'bell_cracked').lost, '깨진 종은 없어진다'); assert.equal(s.view().p, 1); assert.equal(s.view().bell, null); assert.ok(find(fx, 'whoosh', e => e.cause === 'crack').ids.includes('clock'));
  s.place('clock', 'plate'); s.place('bell', 'plate'); assert.ok(has(pumpUntil(s, 'missionDone').fx, 'missionDone'), '처음부터가 아니라 그 자리에서 이어서');
  run(s, 5); assert.ok(obj(s, 'bell_cracked').lost, '의뢰 중에는 금 간 종이 다시 놓이지 않는다');
});
t('금 간 종도 방호 유리판을 세웠으면 사고가 아니다 — 유리판이 조각을 막는다', () => {
  const s = at('clock'); release(s); s.place('marshmallow', 'shelf'); assert.equal(find(s.shield(true), 'shield').on, true); setUp(s, 'clock', 'bell_cracked'); s.predict(2);
  const { fx } = pumpUntil(s, 'shielded'); assert.ok(!has(fx, 'accident')); assert.equal(s.note.accidents.length, 0); assert.ok(has(fx, 'discover', e => e.id === 'shieldSaved'));
});
t('금이 번질 때 밸브를 천천히 열어 멈추면 사고도 없고 종도 남는다', () => {
  const s = at('clock'); release(s); s.place('marshmallow', 'shelf'); setUp(s, 'clock', 'bell_cracked'); s.predict(2); pumpUntil(s, 'crack');
  const fx = [...s.valve(1, false), ...run(s, 3)]; assert.ok(has(fx, 'crackHeld')); assert.equal(s.note.accidents.length, 0); assert.equal(obj(s, 'bell_cracked').lost, false);
});

// ════ ③ 물
t('③ 성공: 22~26번에 불 없이 끓고, 끓는 동안 온도계가 내려간다 — 노트에 그래프', () => {
  const s = at('boil'); release(s); s.place('clock', 'shelf'); setUp(s, 'beaker_water'); s.predict(2);
  const b = pumpUntil(s, 'boilStart'); assert.ok(b.strokes >= 22 && b.strokes <= 26, `${b.strokes}번`); assert.equal(find(b.fx, 'boilStart').T, 30);
  const { fx } = pumpUntil(s, 'missionDone', 20); assert.ok(has(fx, 'thermo', e => e.outcome === 'waterCold')); assert.ok(obj(s, 'beaker_water').T <= 29); assert.ok(obj(s, 'beaker_water').boiling);
  const e = find(fx, 'note').entry; assert.ok(e.graph.points.length >= 10); const boiling = e.graph.points.filter(q => q[3] === 1); assert.ok(boiling.length >= 3); assert.ok(boiling[boiling.length - 1][1] < boiling[0][1], '끓는 동안 온도가 내려간 그래프');
  assert.equal(e.predicted.actual, '내려간다'); assert.equal(find(fx, 'whyNot').title, '왜 학교에서는 못 할까?'); assert.equal(find(fx, 'whyNot').lines.length, 3);
  const stop = [...s.valve(1, false), ...run(s, 3)]; assert.ok(has(stop, 'boilStop', e => e.air), '공기를 넣으면 뚝 멈춘다');
});
t('③ 중간(방울만): 바닥 가까이 갔다가 끓기 전에 공기를 넣으면 「작은 방울만」', () => {
  const s = at('boil'); release(s); s.place('clock', 'shelf'); setUp(s, 'beaker_water'); s.predict(2); const fx0 = pumpN(s, 22); assert.ok(has(fx0, 'bubbles'), '작은 방울이 송송');
  const fx = [...s.valve(1, false), ...run(s, 6)]; assert.equal(find(fx, 'bubbles', e => e.outcome === 'waterBubbles').grade, 'mid');
});
t('③ 중간(잠깐 끓음): 끓다가 쉬면 공기가 새어 들어와 멈춘다 → 계속하라는 귀띔, 이어서 하면 된다', () => {
  const s = at('boil'); release(s); s.place('clock', 'shelf'); setUp(s, 'beaker_water'); s.predict(2); pumpUntil(s, 'boilStart');
  const pause = run(s, 8); assert.ok(has(pause, 'boilStop', e => !e.air)); assert.equal(find(pause, 'hint').text, '멈추면 공기가 새어 들어와요. 끝까지 계속해요.'); assert.equal(s.phase, 'do');
  const fx = [...s.valve(1, false), ...run(s, 6)]; assert.equal(find(fx, 'boilStop', e => e.outcome === 'waterBrief').grade, 'mid');
  s.valve(0); assert.ok(has(pumpUntil(s, 'missionDone', 40).fx, 'missionDone'), '식은 물이라도 끝까지 빼면 된다');
});
t('③ 실패: 조금만 빼고 그치면 「물은 그대로였다」', () => {
  const s = at('boil'); release(s); s.place('clock', 'shelf'); setUp(s, 'beaker_water'); s.predict(2); pumpN(s, 6);
  const fx = [...s.valve(1, false), ...run(s, 6)]; assert.equal(find(fx, 'still', e => e.outcome === 'waterStill').grade, 'fail');
});
t('물이 든 채로 밸브를 확 열면 물이 쏟아진다 — 선반에 두면 새 미지근한 물', () => {
  const s = at('boil'); release(s); s.place('clock', 'shelf'); setUp(s, 'beaker_water'); s.predict(2); pumpN(s, 10);
  const fx = s.valve(1, true); assert.ok(has(fx, 'spill', e => e.id === 'beaker_water')); assert.ok(obj(s, 'beaker_water').empty); assert.equal(s.note.accidents.length, 0);
  s.liftBell(); assert.ok(has(s.place('beaker_water', 'plate'), 'hint', e => e.text.includes('새 물')), '빈 비커를 놓으면 새 물을 담으라는 귀띔');
  const r = s.place('beaker_water', 'shelf'); assert.ok(has(r, 'restock')); assert.equal(obj(s, 'beaker_water').empty, false); assert.equal(obj(s, 'beaker_water').T, 30);
});

// ════ 자유 실험 · 도감
t('의뢰 셋을 끝내면 자유 실험이 열리고 과자 봉지·스펀지·낙하 통이 놓인다', () => {
  const s = at('boil'); playBoil(s); const fx = s.next(); assert.equal(find(fx, 'freePlay').note, '이것도 넣어 볼까'); assert.equal(find(fx, 'unlock').key, 'nextShelf');
  assert.deepEqual(find(fx, 'appear').ids, ['chips', 'sponge', 'droptube']); assert.equal(s.phase, 'free');
  const blanks = s.encyclopedia(); assert.equal(blanks.length, 16); assert.ok(blanks.filter(e => !e.found).every(e => !e.title), '빈칸은 그림자만');
});
t('낙하 통: 공기가 있으면 쇠구슬 먼저 → 조금 빼면 깃털이 조금 늦게 → 다 빼면 같이 떨어진다', () => {
  const s = at('free'); clear(s);
  const a = find(s.drop('droptube', 0.3), 'dropResult'); assert.equal(a.result, 'ballFirst'); assert.ok(a.tFeather > a.tBall);
  const c = s.place('droptube', 'plate'); assert.ok(has(c, 'connect')); assert.equal(s.place('bell', 'plate')[0].key, 'tooTall', '통 위에는 종을 못 덮는다');
  pumpN(s, 10); const b = find(s.drop('droptube'), 'dropResult'); assert.equal(b.result, 'featherLate'); assert.ok(b.tFeather < a.tFeather && b.tFeather > b.tBall);
  pumpN(s, 25); s.grab('droptube'); assert.equal(s.view().p, 1, '빼면 받침판은 열린다'); assert.ok(obj(s, 'droptube').p < 0.05, '통은 마개가 있어 진공이 남는다');
  const d = s.drop('droptube'); assert.equal(find(d, 'dropResult').result, 'together'); assert.equal(find(d, 'dropResult').tFeather, find(d, 'dropResult').tBall); assert.ok(has(d, 'discover', e => e.id === 'dropTogether'));
});
t('자유 실험: 물체마다 결과가 다 다르고, 처음 본 결과는 도감에 찍힌다 — 다 모으면 도장', () => {
  const s = at('free'); const found = () => s.note.found;
  // 촛불 · 흡착판 · 풍선
  clear(s); for (const id of ['candle', 'suction', 'balloon_s']) s.place(id, 'plate'); s.place('bell', 'plate');
  let fx = pumpN(s, 30); assert.ok(has(fx, 'candleOut')); assert.ok(has(fx, 'suctionDrop')); assert.ok(has(fx, 'puff', e => e.outcome === 'balloonWall'));
  const cOut = fx.findIndex(e => e.type === 'candleOut'), sDrop = fx.findIndex(e => e.type === 'suctionDrop'); assert.ok(cOut < sDrop, '촛불(0.35)이 흡착판(0.25)보다 먼저');
  fx = [...s.valve(1, false), ...run(s, 6)]; assert.ok(has(fx, 'smoke', e => e.outcome === 'candleSmoke')); assert.equal(obj(s, 'candle').lit, false, '다시 안 켜진다'); assert.ok(has(fx, 'shrink', e => e.outcome === 'balloonBack'));
  // 거품 · 과자 봉지 · 스펀지
  clear(s); assert.equal(obj(s, 'candle').lit, true, '선반에 두면 새 초'); for (const id of ['foam', 'chips', 'sponge']) s.place(id, 'plate'); s.place('bell', 'plate');
  fx = pumpN(s, 30); for (const k of ['foamFill', 'chipsPuff', 'chipsBurst', 'spongeFizz']) assert.ok(has(fx, null, e => e.outcome === k) || fx.some(e => e.outcome === k), k);
  fx = [...s.valve(1, false), ...run(s, 6)]; assert.ok(fx.some(e => e.outcome === 'foamCollapse')); assert.ok(obj(s, 'foam').size < 0.5); assert.ok(obj(s, 'chips').burst);
  // 낙하 통
  clear(s); s.place('droptube', 'plate'); pumpN(s, 30); s.drop('droptube');
  // 금 간 종 + 방호 유리판 · 안 들리는 종 · 확 열기
  clear(s); s.shield(true); setUp(s, 'marshmallow', 'bell_cracked'); pumpUntil(s, 'shielded');
  run(s, 3); assert.equal(obj(s, 'bell_cracked').lost, false, '자유 실험에서는 금 간 종이 다시 놓인다');
  clear(s); setUp(s, 'marshmallow'); pumpN(s, 8); s.liftBell(); s.valve(1, true);
  const want = exp.encyclopedia.map(e => e.id).sort(); assert.deepEqual([...found()].sort(), want);
  assert.ok(s.note.stamps.includes('도감 완성')); assert.ok(s.encyclopedia().every(e => e.found && e.title && e.text));
  const outs = new Set(exp.encyclopedia.map(e => e.text)); assert.equal(outs.size, exp.encyclopedia.length, '도감 칸마다 설명이 다르다');
});
t('받침판에는 셋까지만 올라간다', () => { const s = at('free'); clear(s); for (const id of ['candle', 'suction', 'balloon_s']) s.place(id, 'plate'); assert.equal(s.place('foam', 'plate')[0].key, 'plateFull'); });

// ════ 다시 차리기 · 떨어뜨리기 · 뷰와의 약속
t('다시 차리기: 종을 들고 밸브를 잠그고 물체를 선반에 새것으로 — 의뢰와 예상은 그대로', () => {
  const s = fresh(); setUp(s, 'marshmallow'); s.predict(2); pumpN(s, 4); s.valve(1, false); run(s, 6);
  const fx = s.retry(); assert.ok(find(fx, 'reset').ids.includes('marshmallow')); const v = s.view();
  assert.equal(v.bell, null); assert.equal(v.valve, 0); assert.equal(v.p, 1); assert.equal(v.objects.marshmallow.loc, 'shelf'); assert.equal(v.objects.marshmallow.size, 1); assert.equal(v.mission.predicted, 2); assert.equal(s.missionId, 'marsh');
});
t('손을 놓쳐 떨어뜨린 것은 제자리로 돌아갈 뿐 아무 일도 안 일어난다', () => {
  const s = fresh(); s.grab('bell'); const fx = s.drop('bell', 1.2, true); assert.equal(fx[0].type, 'return'); assert.equal(obj(s, 'bell').lost, false); assert.equal(s.note.accidents.length, 0);
  const d = s.drop('marshmallow', 0.5); assert.equal(d[0].type, 'thud'); assert.equal(obj(s, 'marshmallow').loc, 'bench');
});
t('어떤 효과도 다친 모습을 그리게 하지 않는다 — 사고는 경보등과 기록 한 줄뿐이다', () => {
  const s = at('clock'); release(s); s.place('marshmallow', 'shelf'); setUp(s, 'clock', 'bell_cracked'); s.predict(2); pumpUntil(s, 'accident');
  for (const a of s.log.filter(e => e.type === 'accident')) assert.equal(a.show, 'alarm');
  for (const e of s.log) assert.ok(!/injur|hurt|wound|burn|blood|pain|cut/i.test(e.type + ' ' + (e.outcome || '')), e.type);
});
t('모든 사건은 효과를 하나 이상 돌려준다(아무 일도 안 일어나는 조작은 없다)', () => {
  const s = at('clock'); const tries = [() => s.grab('pump'), () => s.grab('plate'), () => s.place('pump', 'bench'), () => s.liftBell(), () => s.liftBell(), () => s.pump(0), () => s.pump(1), () => s.valve(0),
    () => s.valve(1, true), () => s.valve(0), () => s.shield(true), () => s.shield(false), () => s.grab('shield'), () => s.place('shield', 'bench'), () => s.predict(9), () => s.drop('pump'), () => s.drop('candle', 0.2),
    () => s.grab('nothing'), () => s.grab('chips'), () => s.next(), () => s.place('bell', 'plate'), () => s.place('bell', 'plate'), () => s.place('bell_cracked', 'plate'), () => s.grab('clock'), () => s.retry(), () => s.retry()];
  for (const f of tries) { const fx = f(); assert.ok(fx.length >= 1, f.toString()); for (const e of fx) assert.equal(typeof e.type, 'string'); }
  assert.equal(s.grab('chips')[0].reason, 'unavailable');
});
t('사건 이름표로도 보낼 수 있다: { type, … } 한 덩이', () => {
  const s = createSession(exp); assert.equal(find(s.dispatch({ type: 'start' }), 'mission').id, 'marsh');
  s.dispatch({ type: 'place', id: 'marshmallow', where: 'plate' }); s.dispatch({ type: 'place', id: 'bell', where: 'plate' }); s.dispatch({ type: 'predict', index: 2 });
  let done = false; for (let i = 0; i < 12 && !done; i++) { done = has(s.dispatch({ type: 'pump', strength: 1 }), 'missionDone') || has(s.dispatch({ type: 'tick', dt: 0.6 }), 'missionDone'); } assert.ok(done);
  assert.equal(s.dispatch({ type: 'valve', open: 1, fast: false })[0].type, 'valve'); assert.equal(s.dispatch({ type: 'jump' })[0].type, 'ignored');
  for (const k of ['start', 'grab', 'place', 'pump', 'valve', 'liftBell', 'shield', 'predict', 'drop', 'next', 'retry', 'tick']) assert.ok(EVENTS[k] && typeof s[k] === 'function', k);
});
t('화면이 읽는 값은 복사본이다 — 뷰가 고쳐도 판은 흔들리지 않는다', () => {
  const s = fresh(); setUp(s, 'marshmallow'); s.predict(2); pumpN(s, 3); const v = s.view(); v.p = 1; v.objects.marshmallow.size = 9; v.mission.flags.push('double:marshmallow'); v.plate.length = 0; s.note.stamps.push('가짜');
  const w = s.view(); assert.ok(w.p < 0.7); assert.ok(w.objects.marshmallow.size < 2); assert.equal(w.mission.flags.length, 0); assert.deepEqual(w.plate, ['marshmallow']); assert.equal(s.note.stamps.length, 0);
  assert.equal(w.objects.marshmallow.kind, 'marshmallow'); assert.equal(w.objects.marshmallow.model, 'puff'); assert.equal(w.objects.marshmallow.name, '마시멜로'); assert.equal(w.gaugeName, '조금 뺐다'); assert.equal(w.strokes, 3);
});
t('큰 dt 한 번이나 잘게 여러 번이나 같은 일이 일어난다(문턱을 놓치지 않는다)', () => {
  const a = at('boil'), b = at('boil'); for (const s of [a, b]) { release(s); s.place('clock', 'shelf'); setUp(s, 'beaker_water'); s.predict(2); pumpN(s, 26); }
  const fa = a.tick(6), fb = run(b, 6); const types = fx => fx.filter(e => /boil|thermo|gauge/.test(e.type)).map(e => e.type + (e.outcome || ''));
  assert.deepEqual(types(fa), types(fb)); assert.ok(Math.abs(a.view().p - b.view().p) < 1e-9); assert.ok(Math.abs(a.view().objects.beaker_water.T - b.view().objects.beaker_water.T) < 1e-6);
});
t('한 판 전체: 마시멜로 → 자명종 → 물 → 자유 실험까지 사건만으로, 사고 없이 끝까지 간다', () => {
  const s = fresh();
  for (const m of exp.missions) { assert.equal(s.missionId, m.id); assert.ok(has(PLAY[m.id](s), 'missionDone'), m.id); s.next(); }
  assert.equal(s.phase, 'free'); assert.equal(s.note.accidents.length, 0); assert.ok(s.view().t < 120, `${s.view().t}초`); assert.ok(s.view().strokes < 70, `${s.view().strokes}번`);
  assert.deepEqual(s.note.entries.map(e => e.title), ['부푸는 마시멜로', '조용한 자명종', '불 없이 끓는 물']);
  for (const e of s.note.entries) { assert.ok(e.predicted.text && e.happened && e.cause && e.whyNot && e.stamp); assert.ok(e.cause.split(/[.!?]\s*/).filter(Boolean).length <= 2, '까닭은 두 문장 이내'); }
});
console.log(`session_vacuum: ${n} 통과`);
