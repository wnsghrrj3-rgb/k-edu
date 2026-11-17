// 케이모션 과학실 — 규칙 표 시험 (node kmotion/lab/tests/test_rules.js) · 표·문구는 전부 exp.json 에서 읽는다
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeBody } from '../sim/thermal.js';
import { stateOf, stateName, strikeOutcome, dropOutcome, checkAccident, check, missionDone, currentStep, encyclopediaView, instanceIds, itemOf, isCold, appearIndex, kindOf } from '../sim/rules.js';

const exp = JSON.parse(readFileSync(new URL('../exp/ln2/exp.json', import.meta.url), 'utf8'));
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ✓', name); };
const body = (kind, Ts, Tc = Ts, minTs = Math.min(Ts, 20)) => ({ ...makeBody(kind), Ts, Tc, minTs });
const hit = (target, targetState, level, tool = 'mallet', toolState = null) => strikeOutcome(exp, { tool, toolState, target, targetState, level });
const sentences = s => s.split(/[.!?]+/).map(x => x.trim()).filter(Boolean);
// 화면에 보이는 문구 전부(이 열쇠 아래의 글자열)
const TEXT = /^(name|title|subtitle|shelfLabel|note|stamp|q|cards|happened|cause|whyNot|hints|text|log|real|rule|start|pop|fizzle|blocks|texts|names|lines)$/;
const screenTexts = () => { const out = []; (function walk(v, key, isText){ if (typeof v === 'string') { if (isText) out.push([key, v]); } else if (v && typeof v === 'object') for (const k in v) { const kk = Array.isArray(v) ? key : k; walk(v[k], kk, isText || TEXT.test(kk)); } })(exp, '', false); return out; };

t('기구 이름표는 정해진 스무 가지이고, 바나나는 셋·고무공은 둘이다', () => {
  assert.deepEqual(exp.items.map(i => i.id).sort(), ['dewar', 'bowl', 'tongs', 'mallet', 'gloves', 'visor', 'woodblock', 'balloon', 'rose', 'banana', 'ball', 'bottle', 'kettle', 'tangerine', 'lettuce', 'egg', 'eraser', 'papercup', 'rubberband', 'bubblewand'].sort());
  const ids = instanceIds(exp); for (const id of ['banana_1', 'banana_2', 'banana_3', 'ball_1', 'ball_2', 'rose', 'dewar']) assert.ok(ids.includes(id), id);
  assert.equal(ids.length, 23); assert.ok(!ids.includes('banana') && !ids.includes('ball')); assert.equal(kindOf('banana_3'), 'banana');
});
t('기구마다 화면 이름과 선반 자리가 있고, 자유 실험 물체는 의뢰 셋이 끝난 뒤에 놓인다', () => {
  for (const it of exp.items) { assert.ok(it.name && /^shelf_\d_\d$/.test(it.shelf), it.id); if (it.count) assert.equal(it.slots.length, it.count); }
  for (const id of ['tangerine', 'lettuce', 'egg', 'eraser', 'papercup', 'rubberband', 'bubblewand']) { assert.ok(itemOf(exp, id).free); assert.equal(appearIndex(exp, id), exp.missions.length); }
  assert.equal(appearIndex(exp, 'rose'), 0); assert.equal(appearIndex(exp, 'banana_2'), 2);
});
t('장미는 겉이 영하 60도 아래로 내려가면 무름에서 유리가 된다', () => {
  assert.equal(stateOf(exp, 'rose', body('rose', 20)), 'fresh'); assert.equal(stateOf(exp, 'rose', body('rose', -59)), 'fresh'); assert.equal(stateOf(exp, 'rose', body('rose', -61)), 'glass');
  assert.equal(stateName(exp, 'rose', 'glass'), '유리');
});
t('바나나는 겉 영하 40도에서 겉만 얼고, 속 영하 80도에서 돌이 된다', () => {
  assert.equal(stateOf(exp, 'banana_1', body('banana', 20)), 'soft'); assert.equal(stateOf(exp, 'banana_1', body('banana', -41, 10)), 'crust');
  assert.equal(stateOf(exp, 'banana_1', body('banana', -196, -79)), 'crust'); assert.equal(stateOf(exp, 'banana_1', body('banana', -196, -81)), 'stone');
  assert.deepEqual(['soft', 'crust', 'stone'].map(s => stateName(exp, 'banana', s)), ['무름', '겉만 얾', '돌']);
});
t('고무공은 겉 영하 30도에서 둔해지고, 속 영하 70도에서 유리가 된다', () => {
  assert.equal(stateOf(exp, 'ball_1', body('ball', -29)), 'bouncy'); assert.equal(stateOf(exp, 'ball_1', body('ball', -31, 0)), 'dull'); assert.equal(stateOf(exp, 'ball_1', body('ball', -150, -71)), 'glass');
});
t('얼었다 녹은 장미는 축 늘어지고 바나나는 검게 무르지만, 고무공은 다시 탱탱해진다', () => {
  assert.equal(stateOf(exp, 'rose', body('rose', 18, 18, -190)), 'limp'); assert.equal(stateOf(exp, 'banana_1', body('banana', 18, 18, -190)), 'mushy'); assert.equal(stateOf(exp, 'ball_1', body('ball', 18, 18, -190)), 'bouncy');
});
t('풍선 상태는 부피로 정한다: 탱탱함 → 쭈글쭈글 → 납작함', () => {
  assert.equal(stateOf(exp, 'balloon', body('balloon', 20)), 'full'); assert.equal(stateOf(exp, 'balloon', body('balloon', -100)), 'wrinkled'); assert.equal(stateOf(exp, 'balloon', body('balloon', -192)), 'flat');
  assert.equal(stateOf(exp, 'balloon', { ...body('balloon', 20), cap: 0.95 }), 'full', '되살아난 풍선(95%)도 탱탱함이다');
});
t('영하 20도보다 찬 물체는 맨손으로 만지면 안 된다', () => { assert.equal(isCold(exp, body('rose', -21)), true); assert.equal(isCold(exp, body('rose', -19)), false); });

t('내리치기: 바나나(겉만 얾, 쾅) → 뭉개진다', () => { const r = hit('woodblock', null, 3, 'banana_1', 'crust'); assert.equal(r.def.fx, 'squash'); assert.equal(r.def.grade, 'fail'); assert.ok(r.def.lose); assert.equal(r.by, 'tool'); });
t('내리치기: 바나나(돌, 탁) → 못이 1/3 박힌다', () => { const r = hit('woodblock', null, 2, 'banana_2', 'stone'); assert.equal(r.def.fx, 'nail'); assert.equal(r.def.nail / exp.nail.full, 1 / 3); });
t('내리치기: 돌 바나나로 탁 세 번이면 못이 다 들어간다 — 톡은 여섯 번, 쾅은 두 번', () => {
  assert.deepEqual([1, 2, 3].map(l => exp.nail.full / hit('woodblock', null, l, 'banana_1', 'stone').def.nail), [6, 3, 2]);
});
t('내리치기: 무른 바나나로 톡 치면 못은 그대로다(중간 결과)', () => { const r = hit('woodblock', null, 1, 'banana_1', 'soft'); assert.equal(r.key, 'bananaThud'); assert.equal(r.def.grade, 'mid'); assert.ok(!r.def.lose); });
t('내리치기: 얼린 장미는 톡에 끝만 깨지고, 탁·쾅에 산산조각 난다', () => {
  assert.equal(hit('rose', 'glass', 1).def.fx, 'chip'); assert.equal(hit('rose', 'glass', 2).def.fx, 'shatter'); assert.equal(hit('rose', 'glass', 3).def.fx, 'shatter');
});
t('내리치기: 안 얼린 장미는 깨지지 않는다 — 흔들리거나, 꽃잎이 떨어지거나, 뭉개진다', () => {
  assert.deepEqual([1, 2, 3].map(l => hit('rose', 'fresh', l).def.fx), ['wobble', 'petals', 'crush']);
});
t('내리치기: 풍선은 톡이면 튕기고 탁부터 터진다. 납작한 풍선은 찰랑거리다 찢어진다', () => {
  assert.deepEqual([1, 2, 3].map(l => hit('balloon', 'full', l).def.fx), ['boing', 'pop', 'pop']); assert.deepEqual([1, 2, 3].map(l => hit('balloon', 'flat', l).def.fx), ['slosh', 'tear', 'tear']);
});
t('내리치기: 탱탱한 공은 망치를 튕겨 내고, 유리 공은 깨진다', () => { assert.equal(hit('ball_1', 'bouncy', 3).def.fx, 'boing'); assert.equal(hit('ball_1', 'glass', 2).def.fx, 'shatter'); });
t('내리치기: 표에 없는 조합도 반드시 결과가 있다(아무 일도 안 일어나는 조작은 없다)', () => {
  for (const tool of ['mallet', 'tongs', 'banana_1', 'rose']) for (const target of instanceIds(exp)) for (const lv of [1, 2, 3]) { const r = hit(target, null, lv, tool, null); assert.ok(r.def && r.def.fx && r.def.text, `${tool}>${target}`); }
});
t('내리치기 표의 칸은 모두 세기 셋이고, 적힌 결과는 모두 결과 사전에 있다', () => {
  for (const row in exp.strike) for (const s in exp.strike[row].states) { const c = exp.strike[row].states[s]; assert.equal(c.length, 3, `${row} ${s}`); for (const k of c) assert.ok(exp.outcomes[k], `${row} ${s} ${k}`); }
  for (const tab of [exp.drop.table, exp.drop.low]) for (const k in tab) for (const s in tab[k]) assert.ok(exp.outcomes[tab[k][s]], `${k} ${s}`);
});
t('내리치기 표의 상태 이름은 그 물체의 문턱표에 있는 이름이다', () => {
  for (const row in exp.strike) { const kindName = exp.strike[row].by === 'tool' ? row.split('>')[0] : row.split('>')[1], it = itemOf(exp, kindName); if (!it || !it.states) continue;
    const names = Object.keys(it.states.names); for (const s in exp.strike[row].states) if (s !== '*') assert.ok(names.includes(s), `${row}: ${s}`);
    for (const s of names) assert.ok(exp.strike[row].states[s] || exp.strike[row].states['*'], `${row}: ${s} 칸이 비었다`); }
});
t('의뢰의 물체마다 성공·중간·실패 결과가 모두 표에 있다', () => {
  const grades = kind => { const g = new Set(); for (const row in exp.strike) if (row.split('>').includes(kind)) for (const s in exp.strike[row].states) for (const k of exp.strike[row].states[s]) g.add(exp.outcomes[k].grade || (exp.outcomes[k].nail ? 'success' : 'none'));
    for (const tab of [exp.drop.table, exp.drop.low]) for (const s in tab[kind] || {}) g.add(exp.outcomes[tab[kind][s]].grade || 'none');
    for (const r of itemOf(exp, kind).onLift || []) g.add(exp.outcomes[r.outcome].grade); return g; };
  for (const kind of ['rose', 'banana', 'ball']) for (const g of ['success', 'mid', 'fail']) assert.ok(grades(kind).has(g), `${kind} ${g}`);
  for (const g of ['mid', 'fail']) assert.ok(grades('balloon').has(g), `balloon ${g}`);
  for (const k of ['waterOnly', 'cloudSmall', 'cloudBig']) assert.ok(exp.outcomes[k].grade);
});

t('떨어뜨리기: 탱탱한 공은 통통 튀고, 둔한 공은 툭, 유리 공은 산산조각 난다', () => {
  const a = dropOutcome(exp, { kind: 'ball_1', state: 'bouncy', height: 0.5 }), b = dropOutcome(exp, { kind: 'ball_1', state: 'dull', height: 0.5 }), c = dropOutcome(exp, { kind: 'ball_2', state: 'glass', height: 0.5 });
  assert.equal(a.def.fx, 'bounce'); assert.ok(a.rebound > 0.3); assert.equal(b.def.fx, 'thud'); assert.ok(b.rebound < 0.05 && b.def.grade === 'mid'); assert.equal(c.def.fx, 'shatter'); assert.ok(c.def.lose);
});
t('떨어뜨리기: 너무 낮으면 유리 공도 딱 소리만 나고 안 깨진다', () => { const r = dropOutcome(exp, { kind: 'ball_1', state: 'glass', height: 0.05 }); assert.equal(r.key, 'ballClack'); assert.ok(!r.def.lose); });
t('떨어뜨리기: 살며시 내려놓으면 아무것도 깨지지 않는다', () => { for (const id of instanceIds(exp)) for (const s of ['glass', 'stone', 'crisp', 'stiff', null]) { const r = dropOutcome(exp, { kind: id, state: s, height: 0 }); assert.ok(r.def && !r.def.lose, id); } });
t('떨어뜨리기: 얼린 달걀은 깨지지 않고 굴러가고, 언 고무줄은 뚝뚝 끊어진다', () => {
  assert.equal(dropOutcome(exp, { kind: 'egg', state: 'stone', height: 0.4 }).def.fx, 'roll'); assert.equal(dropOutcome(exp, { kind: 'rubberband', state: 'stiff', height: 0.4 }).def.fx, 'shreds'); assert.equal(dropOutcome(exp, { kind: 'woodblock', state: null, height: 0.4 }).key, 'plop');
});

const worn = (gloves, visor) => ({ gloves, visor });
t('사고: 맨손으로 질소 그릇에 손을 넣으면 사고다 — 그릇이 비었으면 아니다', () => {
  assert.equal(checkAccident(exp, 'handIn', { worn: worn(false, true), bowlLn2: true }), 'bareHand'); assert.equal(checkAccident(exp, 'handIn', { worn: worn(false, false), bowlLn2: false }), null);
  assert.equal(checkAccident(exp, 'handIn', { worn: worn(true, false), bowlLn2: true }), null);
});
t('사고: 장갑 없이 얼린 물체를 집으면 사고다 — 안 언 물체나 장갑 낀 손은 아니다', () => {
  assert.equal(checkAccident(exp, 'touch', { worn: worn(false, true), cold: true }), 'frozenNoGloves'); assert.equal(checkAccident(exp, 'touch', { worn: worn(false, true), cold: false }), null); assert.equal(checkAccident(exp, 'touch', { worn: worn(true, false), cold: true }), null);
});
t('사고: 보안면 없이 질소를 부으면 사고다', () => { assert.equal(checkAccident(exp, 'pourLn2', { worn: worn(true, false) }), 'pourNoVisor'); assert.equal(checkAccident(exp, 'pourLn2', { worn: worn(false, true) }), null); });
t('사고: 질소가 든 병의 뚜껑을 닫으려 하면 장비를 다 써도 사고다 — 빈 병은 아니다', () => { assert.equal(checkAccident(exp, 'cap', { worn: worn(true, true), bottleLn2: true }), 'capBottle'); assert.equal(checkAccident(exp, 'cap', { worn: worn(true, true), bottleLn2: false }), null); });
t('사고 목록은 넷이고, 쏟기와 손 놓침은 사고가 아니다', () => {
  assert.deepEqual(Object.keys(exp.accidents).sort(), ['bareHand', 'capBottle', 'frozenNoGloves', 'pourNoVisor']);
  for (const a of ['spill', 'drop', 'lost', 'release', 'place']) assert.equal(checkAccident(exp, a, { worn: worn(false, false), bowlLn2: true, cold: true, bottleLn2: true }), null);
  assert.ok(exp.encyclopedia.some(e => e.id === 'rollingDrops' && e.title === '굴러다니는 방울'));
});
t('사고마다 기록 한 줄, 「진짜였다면」 한 줄, 안전 수칙 한 줄이 있고 다치는 장면은 없다', () => {
  for (const k in exp.accidents) { const a = exp.accidents[k]; assert.ok(a.log && a.rule); assert.ok(a.real.startsWith('진짜였다면'), k); assert.equal(sentences(a.real.replace('진짜였다면:', '')).length <= 2, true); assert.ok(['frost', 'alarm'].includes(a.show), '화면 서리 아니면 경보등'); }
  assert.equal(exp.accidents.bareHand.log, '맨손으로 영하 196도를 만지려 했다');
});

t('의뢰는 맛보기 · 풍선 수수께끼 · 바나나 망치 · 튕길까 깨질까 · 마무리 한 방 차례다', () => {
  assert.deepEqual(exp.missions.map(m => m.title), ['맛보기', '풍선 수수께끼', '바나나 망치', '튕길까 깨질까', '마무리 한 방']);
  assert.equal(exp.missions[0].note, '장미를 얼려라'); assert.equal(exp.missions[2].note, '바나나로 못을 박아라');
});
t('의뢰마다 쪽지 한 줄, 예상 카드 셋, 까닭, 「왜 학교에서는 못 할까?」 한 줄이 있다', () => {
  for (const m of exp.missions) { assert.ok(m.note && m.happened && m.cause && m.whyNot && m.stamp && m.done.length, m.id); assert.equal(m.predict.cards.length, 3); assert.ok(m.predict.q && m.predict.actual >= 0 && m.predict.actual < 3);
    assert.equal(sentences(m.note).length, 1, '쪽지는 한 줄'); assert.ok(sentences(m.whyNot).length <= 2); }
  assert.deepEqual(exp.missions[0].predict.cards, ['시든다', '그대로다', '유리처럼 된다']); assert.deepEqual(exp.missions[3].predict.cards, ['더 높이 튄다', '안 튄다', '깨진다']);
  assert.equal(exp.whyNot.title, '왜 학교에서는 못 할까?'); assert.equal(exp.whyNot.lines.length, 3);
});
t('까닭 문구는 두 문장 이내이고 한 문장이 길지 않다', () => {
  const all = [...exp.missions.map(m => m.cause), exp.demo.balloonOnBottle.cause];
  for (const c of all) { const s = sentences(c); assert.ok(s.length <= 2, c); for (const x of s) assert.ok(x.length <= 40, x); }
  assert.equal(exp.missions[0].cause, '꽃잎 속 물이 순식간에 얼어 딱딱해졌어요. 휘지 못하니까 깨져요.');
  assert.equal(exp.missions[3].cause, '고무는 아주 차가워지면 늘어나는 성질을 잃어요. 같은 물질인데 온도만으로 성질이 바뀌었어요.');
  assert.equal(exp.missions[4].cause, '하얀 것은 질소가 아니에요. 공기 속 물기가 차가워져 생긴 아주 작은 물방울, 구름이에요.');
});
t('문구에 쓰는 진짜 숫자는 영하 196도와 약 700배뿐이다', () => {
  const nums = new Set(); for (const [, s] of screenTexts()) for (const x of s.match(/\d+/g) || []) nums.add(x);
  assert.deepEqual([...nums].sort(), ['196', '700']); assert.equal(exp.env.temps.ln2, -196);
});
t('바나나 의뢰는 처음 실패하면 쪽지 뒷면에 「보글보글이 조용해질 때까지」를 귀띔한다', () => { const h = exp.missions[2].hints; assert.equal(h.bananaSquash, '보글보글이 조용해질 때까지'); assert.equal(h.bananaOoze, '보글보글이 조용해질 때까지'); });
t('화면에 보이는 문구에는 영어 코드가 없다', () => {
  const all = screenTexts(); for (const [key, v] of all) assert.ok(!/[A-Za-z]/.test(v), `${key}: ${v}`);
  assert.ok(all.length > 150, `문구 ${all.length}개`);
});
t('의뢰가 풀렸는지는 깃발로 본다: 풍선은 납작해졌다가 되살아나야 한다', () => {
  const m = exp.missions[1]; assert.equal(missionDone(m, new Set(['flat:balloon'])), false); assert.equal(missionDone(m, new Set(['revived:balloon'])), false); assert.equal(missionDone(m, new Set(['flat:balloon', 'revived:balloon'])), true);
  assert.equal(missionDone(exp.missions[3], new Set(['shatter:ball'])), false, '안 얼린 공도 떨어뜨려 봐야 한다'); assert.equal(missionDone(exp.free, new Set()), false);
});
t('맛보기에서는 다음에 집을 기구가 차례로 빛난다: 보안면·장갑 → 그릇 → 통 → 예상 → 집게·장미 → 망치', () => {
  const m = exp.missions[0], ctx = { worn: { visor: false, gloves: false }, bowlLn2: 0, flags: new Set(), predicted: null, at: { bowl: 'shelf' } };
  assert.deepEqual(m.steps[currentStep(m, ctx)].glow, ['visor', 'gloves']); ctx.worn = { visor: true, gloves: true }; assert.deepEqual(m.steps[currentStep(m, ctx)].glow, ['bowl']);
  ctx.at.bowl = 'bench'; assert.deepEqual(m.steps[currentStep(m, ctx)].glow, ['dewar']); ctx.bowlLn2 = 0.5; assert.equal(currentStep(m, ctx), 3); ctx.predicted = 2; assert.deepEqual(m.steps[currentStep(m, ctx)].glow, ['tongs', 'rose']);
  ctx.flags.add('dip:rose'); ctx.flags.add('lift:rose'); assert.deepEqual(m.steps[currentStep(m, ctx)].glow, ['mallet']); ctx.flags.add('shatter:rose'); assert.equal(currentStep(m, ctx), -1);
  assert.ok(!exp.missions[2].steps && !exp.missions[2].pictures, '셋째 의뢰부터는 스스로 고른다'); assert.ok(exp.missions[1].pictures.length, '둘째 의뢰는 쪽지에 그림으로만');
  assert.equal(check({ worn: ['visor'], bowlMin: 0.3 }, ctx), true); assert.equal(check({ flag: 'nothing' }, ctx), false); assert.equal(check(undefined, ctx), true);
});
t('도감: 못 본 칸은 그림자만 보이고, 본 칸에만 이름과 설명이 뜬다', () => {
  const v = encyclopediaView(exp, ['rollingDrops']); assert.equal(v.length, exp.encyclopedia.length); assert.equal(v.find(e => e.id === 'rollingDrops').title, '굴러다니는 방울');
  const blank = v.find(e => e.id === 'stoneEgg'); assert.equal(blank.found, false); assert.equal(blank.item, 'egg'); assert.ok(!('title' in blank) && !('text' in blank));
});
t('도감: 자유 실험 물체마다 칸이 하나씩 있고 결과가 서로 다 다르다', () => {
  const free = exp.items.filter(i => i.free).map(i => i.id), seen = new Set();
  for (const id of free) { const e = exp.encyclopedia.filter(x => x.item === id); assert.equal(e.length, 1, id); assert.ok(e[0].free);
    const o = Object.entries(exp.outcomes).filter(([, d]) => d.discover === e[0].id); assert.ok(o.length >= 1, `${id}: 도감에 찍는 결과가 없다`); const sig = o[0][1].fx + '|' + o[0][1].text; assert.ok(!seen.has(sig), id); seen.add(sig); }
  assert.equal(new Set(exp.encyclopedia.map(e => e.title)).size, exp.encyclopedia.length); assert.equal(new Set([...seen].map(s => s.split('|')[0])).size, free.length, '효과 종류도 서로 다르다');
  for (const e of exp.encyclopedia) assert.ok(itemOf(exp, e.item) && e.title && sentences(e.text).length <= 2, e.id);
});
t('도감에 찍는 결과와 대신 보여 주기는 모두 도감 칸을 가리킨다', () => {
  const ids = exp.encyclopedia.map(e => e.id), used = new Set(['rollingDrops', exp.demo.balloonOnBottle.discover]);
  for (const k in exp.outcomes) if (exp.outcomes[k].discover) { assert.ok(ids.includes(exp.outcomes[k].discover), k); used.add(exp.outcomes[k].discover); }
  for (const it of exp.items) if (it.states) { for (const s in it.states.onState || {}) used.add(it.states.onState[s].discover); if (it.states.revive && it.states.revive.discover) used.add(it.states.revive.discover); }
  for (const id of ids) assert.ok(used.has(id), `${id} 칸을 채울 길이 없다`);
});
console.log(`rules: ${n} 통과`);
