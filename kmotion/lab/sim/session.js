// 케이모션 과학실 — 실험 한 판의 상태 기계 (순수: 화면을 모른다 → node 로 한 판을 끝까지 돌린다)
// 화면(뷰)은 「뜻이 있는 사건」만 보낸다: wear · unwear · grab · place · pour · dip · lift · handIn · strike · drop · cup · cap · predict · next · retry · tick
// 여기서 결과를 정해 「효과」 목록으로 돌려준다: { type: 'shatter', id } · { type: 'frost', id, amount } · { type: 'accident', key } …
// → 화면은 결과를 스스로 정하지 않는다. 문구·숫자는 전부 exp.json (createSession 에 읽어 온 것을 넘긴다).
//
// 설계가 지키라고 한 것:
//  · 사고는 판단에서만 난다(장비를 안 썼다, 하면 안 되는 조합). 손을 놓쳐 떨어진 것(drop 의 lost)은 아무것도 깨뜨리지 않는다.
//  · 시간 제한이 없다. 긴장은 날아가는 질소에서만 온다.
//  · 실패해도 그 자리에서 이어서 한다(처음부터 다시가 아니다). 잃은 물체는 선반에 새로 놓인다.
import { thermalModel, makeWorld, makeBody, stepWorld, pourLn2, addWater, dipIn, setEnv, envOf, frostAmount, balloonVolume, pourStartDeg, kindOf, clamp } from './thermal.js';
import * as R from './rules.js';

/** 뷰가 보내는 사건과 인자 차례 (dispatch 가 이 표를 읽는다) */
export const EVENTS = {
  start: [], wear: ['id'], unwear: ['id'], grab: ['id'], place: ['id', 'where'], pour: ['from', 'into', 'amount'],
  dip: ['id', 'how'], lift: ['id', 'how'], handIn: ['where', 'holding'], strike: ['target', 'level', 'with'],
  drop: ['id', 'height', 'lost'], cup: ['id', 'on'], cap: ['id'], predict: ['index'], next: [], retry: [], tick: ['dt'],
};

export function createSession(exp, opts = {}){
  const model = thermalModel(exp), items = R.itemMap(exp), ids = R.instanceIds(exp);
  const TX = exp.texts, FLOW = exp.flow, B = exp.bowl, air = exp.env.temps.air;
  let world = makeWorld(model, ids.filter(id => items[kindOf(id)].thermal));
  const objs = {}, byKind = {};
  for (const id of ids) { const o = objs[id] = { id, kind: kindOf(id), loc: 'shelf', slot: null, lost: false, lostAt: 0, cupped: false, state: null, seen: [], available: false }; (byKind[o.kind] = byKind[o.kind] || []).push(o); }
  const worn = {}; for (const it of exp.items) if (it.wear) worn[it.id] = false;
  const note = opts.note ? JSON.parse(JSON.stringify(opts.note)) : { entries: [], accidents: [], found: [], stamps: [] };
  const st = { mi: -1, phase: 'idle', flags: new Set(), predicted: null, asked: false, step: -2, tries: [], hinted: new Set(), hint: null,
    refills: exp.dewar.refills, over: false, nail: { depth: 0, mallet: false, done: false }, last: {}, flashing: false, cloudBig: false, loud: false, deep: false, hadLn2: false, demoOn: false };
  const log = []; let fx = [];

  // ── 작은 도구
  const out = e => { fx.push(e); log.push({ t: +world.t.toFixed(3), ...e }); return e; };
  const mission = () => st.mi < 0 ? null : st.mi < exp.missions.length ? exp.missions[st.mi] : exp.free;
  const throttle = (key, sec) => { if (st.last[key] != null && world.t - st.last[key] < sec) return false; st.last[key] = world.t; return true; };
  const roleOf = o => o ? items[o.kind].role : null;
  const stateNow = id => world.bodies[id] ? R.stateOf(exp, kindOf(id), world.bodies[id]) : null;
  const relevant = kind => { const m = mission(); return !!(m && m.items && m.items.includes(kind)); };
  function usable(id){ const o = objs[id];
    if (!o) { out({ type: 'ignored', reason: 'unknown', id }); return null; }
    if (!o.available || o.lost) { out({ type: 'ignored', reason: o.lost ? 'lost' : 'unavailable', id }); return null; }
    return o; }
  const condCtx = () => { const at = {}; for (const id of ids) at[id] = objs[id].loc; return { worn, bowlLn2: world.bowl.ln2, flags: st.flags, predicted: st.predicted, at }; };
  const accCtx = id => ({ worn, bowlLn2: world.bowl.ln2 > 0, bottleLn2: world.bottle.ln2 > 0, cold: id ? R.isCold(exp, world.bodies[id]) : false });
  const air_ = id => { if (world.bodies[id]) world = setEnv(world, id, 'air', model); };

  // ── 실험 노트
  function stamp(text, key){ if (note.stamps.includes(text)) return; note.stamps.push(text); out({ type: 'stamp', key, text }); }
  function discover(id){ const en = exp.encyclopedia.find(x => x.id === id); if (!en || note.found.includes(id)) return;
    note.found.push(id); out({ type: 'discover', id, item: en.item, title: en.title, text: en.text, first: true });
    if (note.found.length === exp.encyclopedia.length) stamp(TX.stampEncyclopedia, 'encyclopedia'); }
  function fail(reason, text){ const m = mission(); st.tries.push({ key: reason, grade: 'fail', text }); out({ type: 'missionFail', id: m.id, reason, text, continues: true }); }

  // ── 사고: 다치는 모습은 없다. 기록 한 줄 + 「진짜였다면」 + 쓰던 것을 잃는다. 첫 의뢰(guard)에서는 사고 대신 막는다.
  function accident(key){ const a = exp.accidents[key];
    if (mission().guard) { if (throttle('blk:' + key, 1)) out({ type: 'blocked', key, text: a.rule }); return 'blocked'; }
    const k = 'acc:' + key; if (st.last[k] != null && world.t - st.last[k] < FLOW.accidentCooldown) return 'cooldown';
    st.last[k] = world.t;
    let rec = note.accidents.find(x => x.key === key); const first = !rec;
    if (!rec) note.accidents.push(rec = { key, text: a.log, real: a.real, count: 0 }); rec.count++;
    out({ type: 'accident', key, text: a.log, real: a.real, rule: a.rule, show: a.show, first });
    if (first && note.accidents.length === Object.keys(exp.accidents).length) stamp(TX.stampAccidents, 'accidents');
    return 'accident'; }
  function guardBlock(it){ if (!mission().guard || !it.needs || it.needs.every(g => worn[g])) return false;
    if (throttle('gearFirst', 1)) out({ type: 'blocked', key: 'gearFirst', text: exp.blocks.gearFirst, glow: it.needs.filter(g => !worn[g]) }); return true; }
  /** 손으로 만져도 되나: 얼린 물체를 장갑 없이 만지면 사고(물체를 잃는다) */
  function touchOk(id){ const o = objs[id]; if (roleOf(o) === 'tool' || !world.bodies[id]) return true;
    const key = R.checkAccident(exp, 'touch', accCtx(id)); if (!key) return true;
    const r = accident(key); if (r === 'accident') lose(id); else if (r === 'cooldown') out({ type: 'blocked', key, quiet: true }); return false; }

  function lose(id){ const o = objs[id]; if (o.lost) return; o.lost = true; o.loc = 'gone'; o.lostAt = world.t; o.cupped = false; air_(id);
    if (items[o.kind].flagsReset) for (const f of [...st.flags]) if (f.endsWith(':' + o.kind)) st.flags.delete(f);
    out({ type: 'lose', id }); }

  // ── 결과 하나를 적용한다(표에서 읽은 이름 → 효과·깃발·도감·잃음·귀띔)
  function outcome(key, { target, tool, level, by, extra } = {}){
    const d = exp.outcomes[key]; if (!d) { out({ type: 'tap', id: target, outcome: key }); return; }
    const subj = d.subject === 'target' ? target : d.subject === 'tool' ? tool : by === 'tool' ? tool : target, kind = kindOf(subj);
    const e = { type: d.fx, id: subj, outcome: key, text: d.text };
    if (level) e.level = level; if (tool) e.by = tool; if (d.grade) e.grade = d.grade; if (d.size) e.size = d.size; if (d.frozen) e.frozen = true; Object.assign(e, extra);
    if (d.nail) { if (roleOf(objs[tool]) === 'tool') st.nail.mallet = true; st.nail.depth = Math.min(exp.nail.full, st.nail.depth + d.nail); e.depth = +(st.nail.depth / exp.nail.full).toFixed(3); }
    out(e);
    if (d.flag) st.flags.add(`${d.flag}:${d.flagKind || kind}`);
    if (d.spill && world.bowl.ln2 > 0) { const a = Math.min(world.bowl.ln2, d.spill); world.bowl.ln2 -= a; spill(a); }
    if (d.discover) discover(d.discover);
    if (d.lose) lose(subj);
    if (d.grade && d.grade !== 'success' && st.phase === 'do' && relevant(kind)) { const m = mission();
      if (d.grade === 'fail') fail(key, d.text); else st.tries.push({ key, grade: d.grade, text: d.text });
      const h = m.hints && m.hints[key]; if (h) { out({ type: 'hint', text: h, back: true, first: !st.hinted.has(h) }); st.hinted.add(h); st.hint = h; } }
    if (d.nail && st.nail.depth >= exp.nail.full && !st.nail.done) {
      if (st.nail.mallet) { st.nail = { depth: 0, mallet: false, done: false }; outcome('nailByMallet', { target }); out({ type: 'nailReset', id: target }); }
      else { st.nail.done = true; st.flags.add(`nail:${kindOf(tool)}`); } }
  }
  function spill(amount){ out({ type: 'spill', amount: +amount.toFixed(4), text: TX.spill }); discover('rollingDrops'); }   // 쏟기는 사고가 아니라 발견이다

  // ── 예상하기
  function ask(again){ const p = mission().predict; st.asked = true; out({ type: 'askPredict', q: p.q, cards: p.cards, again: !!again }); }
  function gate(action){ const m = mission(), p = m && m.predict;
    if (st.phase !== 'do' || !p || st.predicted != null || !(p.gate || []).includes(action)) return false;
    if (throttle('gate', 1)) { out({ type: 'blocked', key: 'predictFirst', text: exp.blocks.predictFirst }); ask(true); } return true; }

  // ── 의뢰
  function startMission(i, again = false){
    if (i >= exp.missions.length) { st.mi = exp.missions.length; st.phase = 'free'; st.over = false; st.flags.clear(); st.predicted = null; st.asked = true; st.tries = []; st.hint = null; st.step = -2; appear();
      out({ type: 'freePlay', id: exp.free.id, title: exp.free.title, note: exp.free.note, text: TX.freeStart }); out({ type: 'unlock', key: 'nextShelf' }); return; }
    const m = exp.missions[i]; st.mi = i; st.phase = 'do'; st.flags.clear(); st.step = -2; st.nail = { depth: 0, mallet: false, done: false };
    if (!again) { st.predicted = null; st.asked = false; st.tries = []; st.hinted.clear(); st.hint = null; st.over = false; }
    if (!again && i > 0 && FLOW.gearOffEachMission) { const off = Object.keys(worn).filter(g => worn[g]); for (const g of off) { worn[g] = false; objs[g].loc = 'shelf'; } if (off.length) out({ type: 'gearOff', ids: off }); }
    appear();
    out({ type: 'mission', id: m.id, index: i, title: m.title, note: m.note, pictures: m.pictures || [], guard: !!m.guard, retry: again });
  }
  function appear(){ const fresh = []; for (const id of ids) { const o = objs[id]; if (!o.available && R.appearIndex(exp, o.kind) <= st.mi) { o.available = true; fresh.push(id); } } if (fresh.length) out({ type: 'appear', ids: fresh }); }
  function finishMission(m){ st.phase = 'cause'; const p = m.predict;
    const entry = { id: m.id, title: m.title, note: m.note, stamp: m.stamp,
      predicted: p ? { q: p.q, index: st.predicted, text: st.predicted != null ? p.cards[st.predicted] : TX.noPrediction, actual: p.cards[p.actual] } : null,
      happened: m.happened, cause: m.cause, whyTitle: exp.whyNot.title, whyNot: m.whyNot, tries: st.tries.slice() };
    note.entries.push(entry);
    out({ type: 'missionDone', id: m.id, index: st.mi }); out({ type: 'cause', id: m.id, text: m.cause }); out({ type: 'note', entry }); stamp(m.stamp, m.id);
    if (st.mi === exp.missions.length - 1) out({ type: 'whyNot', title: exp.whyNot.title, lines: exp.whyNot.lines.slice() }); }

  // ── 사건이 끝날 때마다, 시간이 흐를 때마다 보는 것
  function onState(o, s){ const S = items[o.kind].states; st.flags.add(`${s}:${o.kind}`);
    if (S.revive && s === S.revive.to && o.seen.includes(S.revive.from)) { if (S.revive.flag) st.flags.add(`${S.revive.flag}:${o.kind}`); out({ type: 'revive', id: o.id }); if (S.revive.discover) discover(S.revive.discover); o.seen = []; }
    const on = S.onState && S.onState[s]; if (on && on.discover) discover(on.discover); }
  function settle(){
    const m = mission();
    // 물체 상태(문턱표)
    for (const id of ids) { const o = objs[id], b = world.bodies[id]; if (!b || o.lost || !o.available) continue;
      const s = R.stateOf(exp, o.kind, b); if (s === o.state) continue;
      const from = o.state; o.state = s;
      if (from != null) { out({ type: 'state', id, from, to: s, name: R.stateName(exp, o.kind, s) }); onState(o, s); }
      if (!o.seen.includes(s)) o.seen.push(s); }
    // 병 + 풍선 대신 보여 주기
    if (st.demoOn) { const bt = world.bottle, D = exp.demo.balloonOnBottle, end = () => { st.demoOn = false; world.bottle = { ln2: 0, size: 0, demo: false, popped: false }; };
      if (bt.popped) { out({ type: 'pop', id: bottleId, big: true, text: D.pop }); out({ type: 'cause', id: bottleId, text: D.cause }); discover(D.discover); end(); }
      else if (!(bt.ln2 > 0)) { out({ type: 'demoEnd', id: bottleId, outcome: 'fizzle', size: +bt.size.toFixed(2), text: D.fizzle }); end(); } }
    // 그릇: 깊이·비었나
    const deep = world.bowl.ln2 >= B.minDip, has = world.bowl.ln2 > 0;
    if (deep && !st.deep) for (const id of ids) { const o = objs[id]; if (o.loc === 'bowl' && !o.lost && world.bodies[id] && !st.flags.has(`dip:${o.kind}`)) { st.flags.add(`dip:${o.kind}`); out({ type: 'dip', id }); out({ type: 'boilUp', id, boil: +world.boil.toFixed(3) }); } }
    if (!deep && st.deep) out({ type: 'ln2Low', text: TX.shallow });
    if (!has && st.hadLn2) out({ type: 'bowlEmpty' });
    st.deep = deep; st.hadLn2 = has;
    // 구름(따뜻한 물 + 질소)
    const flashing = world.bowl.water > 0 && has;
    if (flashing && !st.flashing) { st.flashing = true; st.cloudBig = false; out({ type: 'cloudStart' }); }
    if (st.flashing && !st.cloudBig && world.cloud >= B.cloudBig) { st.cloudBig = true; outcome('cloudBig', { target: bowlId }); }
    if (!flashing && st.flashing) { st.flashing = false; if (!st.cloudBig && throttle('cloudSmall', 3)) outcome('cloudSmall', { target: bowlId }); }
    // 끓음이 잦아듦(소리·귀띔이 읽는다)
    if (world.boil >= B.loud) st.loud = true; else if (st.loud && world.boil <= B.quiet) { st.loud = false; if (has) out({ type: 'boilQuiet', boil: +world.boil.toFixed(3) }); }
    // 예상 카드 · 빛나는 걸음 · 의뢰 풀림
    if (st.phase === 'do') { const p = m.predict;
      if (p && !st.asked && st.predicted == null && R.check(p.when, condCtx())) ask(false);
      if (m.steps) { const i = R.currentStep(m, condCtx()); if (i !== st.step) { st.step = i; out({ type: 'step', index: i, glow: i >= 0 ? m.steps[i].glow.slice() : [] }); } }
      if (R.missionDone(m, st.flags)) finishMission(m); }
    // 다 잃은 물체는 선반에 새로 놓인다(막히지 않게)
    for (const k in byKind) { const L = byKind[k]; if (!L[0].available || !L.every(o => o.lost) || world.t - Math.max(...L.map(o => o.lostAt)) < FLOW.restockDelay) continue;
      for (const o of L) { o.lost = false; o.loc = 'shelf'; o.cupped = false; o.seen = []; o.state = null;
        if (world.bodies[o.id]) { world.bodies[o.id] = makeBody(k, air); o.state = R.stateOf(exp, k, world.bodies[o.id]); if (o.state != null) o.seen.push(o.state); } }
      out({ type: 'restock', ids: L.map(o => o.id), text: TX.restock }); }
    // 질소가 다 떨어짐: 한 번은 한 통 더 준다
    // (의뢰 중: 통도 비고 그릇도 담글 수 없을 만큼 얕아 더는 할 수 없을 때 · 자유 실험: 통이 비면 바로)
    const free = st.phase === 'free' && !!exp.free.refill;
    if ((st.phase === 'do' || free) && !st.over && world.dewar.ln2 <= 1e-6 && (free || !deep) && !(m.ln2Until && st.flags.has(m.ln2Until))) {
      if (free || st.refills > 0) { out({ type: 'ln2Out', final: false, text: TX.ln2Out }); if (!free) { st.refills--; fail('ln2Out', TX.ln2Out); }
        world.dewar.ln2 = exp.dewar.amount; out({ type: 'refill', left: free ? null : st.refills, text: free ? TX.refillFree : TX.refill }); }
      else { st.over = true; out({ type: 'ln2Out', final: true, text: TX.ln2OutFinal }); st.tries.push({ key: 'ln2Out', grade: 'fail', text: TX.ln2OutFinal }); out({ type: 'missionFail', id: m.id, reason: 'ln2Out', text: TX.ln2OutFinal, continues: false }); } }
  }
  const idByRole = role => { const it = exp.items.find(x => x.role === role); return it ? it.id : null; };
  const bowlId = idByRole('vessel'), bottleId = idByRole('bottle');

  // ── 사건
  function wear(id){ const o = usable(id); if (!o) return; const it = items[o.kind]; if (!it.wear) return out({ type: 'ignored', reason: 'notWearable', id });
    worn[id] = true; o.loc = 'worn'; out({ type: 'wear', id, slot: it.wear }); }
  function unwear(id){ const o = usable(id); if (!o) return; const it = items[o.kind]; if (!it.wear || !worn[id]) return out({ type: 'ignored', reason: 'notWorn', id });
    worn[id] = false; o.loc = 'hand'; out({ type: 'unwear', id, slot: it.wear }); }

  function grab(id){ const o = usable(id); if (!o) return; const it = items[o.kind];
    if (guardBlock(it)) return;
    if (o.loc === 'bowl' && world.bowl.ln2 > 0) return handIn('bowl');
    if (!touchOk(id)) return;
    if (it.wear && worn[id]) worn[id] = false;
    o.loc = 'hand'; o.cupped = false; air_(id); out({ type: 'grab', id }); }

  function place(id, where = 'bench'){ const o = usable(id); if (!o) return; const it = items[o.kind];
    if (where === bowlId) return dip(id, o.loc === 'hand' ? 'hand' : 'tongs');
    if (where === 'body' || where === 'wear_face' || where === 'wear_hands') return wear(id);
    if (o.loc === 'bowl') lift(id, 'tongs');
    if (it.wear && worn[id]) worn[id] = false;
    o.loc = /^shelf/.test(where) ? 'shelf' : /^bench/.test(where) ? 'bench' : where; o.slot = where; o.cupped = false; air_(id);
    out({ type: 'place', id, where }); }

  /** 맨손(또는 장갑 낀 손)이 그릇 속으로: 맨손이면 사고, 장갑이면 막고 집게를 알려 준다 */
  function handIn(where = bowlId, holding = null){
    if (where !== bowlId || !(world.bowl.ln2 > 0)) return out({ type: 'touch', where });
    const key = R.checkAccident(exp, 'handIn', accCtx());
    if (!key) { if (throttle('useTongs', 1)) out({ type: 'blocked', key: 'useTongs', text: exp.blocks.useTongs, glow: ['tongs'] }); return; }
    const r = accident(key); if (r === 'cooldown') out({ type: 'blocked', key, quiet: true });
    if (r === 'accident' && holding && objs[holding] && !objs[holding].lost && world.bodies[holding]) sink(holding);   // 들고 있던 것은 그릇에 빠진다 → 집게로 건진다
  }

  function sink(id){ const o = objs[id]; o.cupped = false; o.loc = 'bowl';
    if (world.bowl.ln2 < B.minDip) { world = setEnv(world, id, 'ln2', model); return out({ type: 'shallow', id, text: TX.shallow }); }
    world = dipIn(world, id, model); st.flags.add(`dip:${o.kind}`); st.deep = true;
    out({ type: 'dip', id }); out({ type: 'boilUp', id, boil: +world.boil.toFixed(3) }); }
  function dip(id, how = 'tongs'){ const o = usable(id); if (!o) return; const it = items[o.kind];
    if (it.onDip) return outcome(world.bowl.ln2 > 0 ? it.onDip.withLn2 : it.onDip.without, { target: id });
    if (!world.bodies[id]) return out({ type: 'blocked', key: 'notDippable', id, text: exp.blocks.notDippable });
    if (gate(`dip:${o.kind}`)) return;
    if (how === 'hand' && world.bowl.ln2 > 0) return handIn(bowlId, id);
    sink(id); }

  function lift(id, how = 'tongs'){ const o = usable(id); if (!o) return; const b = world.bodies[id], wasIn = o.loc === 'bowl';
    if (how === 'hand') { if (wasIn && world.bowl.ln2 > 0) return handIn(bowlId); if (!touchOk(id)) return; }
    o.loc = how === 'hand' ? 'hand' : 'tongs'; o.cupped = false; air_(id);
    const s = stateNow(id);
    out({ type: 'lift', id, with: how, state: s, name: R.stateName(exp, o.kind, s) });
    if (!b || !wasIn) return;
    st.flags.add(`lift:${o.kind}`); out({ type: 'frost', id, amount: +frostAmount(b.Ts, exp.frost).toFixed(3) });
    for (const r of items[o.kind].onLift || []) if ((r.ifState == null || r.ifState === s) && (r.ifBelow == null || b.Ts <= r.ifBelow)) outcome(r.outcome, { target: id }); }

  function cup(id, on = true){ const o = usable(id); if (!o) return; if (!world.bodies[id]) return out({ type: 'ignored', reason: 'notCuppable', id });
    if (!on) { o.cupped = false; if (o.loc !== 'bowl') air_(id); return out({ type: 'cup', id, on: false }); }
    if (o.loc === 'bowl' && world.bowl.ln2 > 0) return handIn(bowlId);
    if (!touchOk(id)) return;
    if (o.loc === 'bowl') o.loc = 'hand';
    o.cupped = true; world = setEnv(world, id, 'hands', model); out({ type: 'cup', id, on: true }); }

  function strike(targetId, level = 1, withId = 'mallet'){
    const tool = usable(withId); if (!tool) return; let tgt = usable(targetId); if (!tgt) return;
    level = clamp(Math.round(level) || 1, 1, 3);
    if (roleOf(tool) !== 'tool' && !touchOk(withId)) return;                       // 얼린 것을 망치 삼아 쥐려면 장갑이 있어야 한다
    if (tgt.loc === 'bowl') tgt = objs[bowlId];                                     // 그릇 속에 든 것을 치면 그릇을 친 것이다
    const tState = tgt.id === bowlId ? (world.bowl.ln2 > 0 ? 'filled' : 'empty') : stateNow(tgt.id);
    const r = R.strikeOutcome(exp, { tool: tool.kind, toolState: stateNow(withId), target: tgt.kind, targetState: tState, level });
    outcome(r.key, { target: tgt.id, tool: withId, level, by: r.by }); }

  function drop(id, height = 0, lost = false){ const o = usable(id); if (!o) return;
    if (lost) return out({ type: 'return', id, text: TX.lostHand });               // 손을 놓친 것으로는 아무것도 깨지지 않는다(설계 1·3-3)
    const h = Math.max(0, +height || 0), r = R.dropOutcome(exp, { kind: o.kind, state: stateNow(id), height: h });
    o.loc = 'bench'; o.cupped = false; air_(id);
    outcome(r.key, { target: id, extra: { height: h, rebound: r.rebound } }); }

  function pour(from, into, amount){ const src = usable(from); if (!src) return; amount = Math.max(0, +amount || 0);
    const dst = into != null && objs[into] && objs[into].available && !objs[into].lost ? objs[into] : null, role = roleOf(src), dRole = roleOf(dst);
    if (role === 'ln2source') {
      if (guardBlock(items[src.kind])) return;
      if (!(world.dewar.ln2 > 0)) { if (throttle('empty', 1)) out({ type: 'empty', id: src.id, text: TX.dewarEmpty }); return; }
      const key = R.checkAccident(exp, 'pourLn2', accCtx());
      if (key) { const r = accident(key); if (r === 'blocked') return;                 // 보안면 없이 부으면 튄다: 부은 만큼 잃는다
        const a = Math.min(world.dewar.ln2, amount + (r === 'accident' ? exp.dewar.splash : 0)); world.dewar.ln2 -= a; out({ type: 'spill', amount: +a.toFixed(4), splash: true, text: TX.splash }); return; }
      const r = pourLn2(world, amount, model, dRole === 'vessel' ? 'bowl' : dRole === 'bottle' ? 'bottle' : 'bench'); world = r.world;
      if (dRole === 'vessel' || dRole === 'bottle') out({ type: 'pour', from: src.id, into: dst.id, amount: +(r.poured - r.spilled).toFixed(4),
        fill: +(dRole === 'vessel' ? world.bowl.ln2 / B.capacity : world.bottle.ln2 / exp.bottle.capacity).toFixed(3), left: +(world.dewar.ln2 / exp.dewar.amount).toFixed(3) });
      if (r.spilled > 0) spill(r.spilled);
      return; }
    if (role === 'warmwater') {
      if (dRole === 'vessel') { if (gate(`pour:${src.kind}>${dst.kind}`)) return; const had = world.bowl.ln2 > 0; world = addWater(world, amount, model);
        out({ type: 'pour', from: src.id, into: dst.id, amount, water: true }); if (!had && throttle('waterOnly', 3)) outcome('waterOnly', { target: dst.id }); return; }
      const b = dst && world.bodies[dst.id];
      if (!b) return out({ type: 'spill', amount, water: true });
      const it = items[dst.kind], K = exp.kettle;
      if (it.warm && b.Ts <= it.warm.popBelow) return outcome(it.warm.outcome, { target: dst.id });   // 꽁꽁 언 풍선을 너무 빨리 데우면 터진다
      if (throttle('warm:' + dst.id, 2)) outcome(b.Ts <= K.iceCoatBelow ? 'iceCoat' : 'warmUp', { target: dst.id });
      b.warm = Math.min(K.warmMax, b.warm + amount * K.warmPerUnit); return; }
    if (role === 'vessel') { const a = Math.min(amount, world.bowl.ln2); if (!(a > 0)) return out({ type: 'empty', id: src.id }); world.bowl.ln2 -= a; return spill(a); }
    out({ type: 'ignored', reason: 'notPourable', id: from }); }

  /** 병 뚜껑 닫기: 질소가 들었으면 닫히지 않는다(사고 기록) → 같은 원리를 풍선 씌우기로 대신 보여 준다 */
  function cap(id){ const o = usable(id); if (!o) return; if (roleOf(o) !== 'bottle') return out({ type: 'ignored', reason: 'notCappable', id });
    const key = R.checkAccident(exp, 'cap', accCtx()); if (!key) return out({ type: 'cap', id, text: TX.capEmpty });
    if (st.demoOn) return out({ type: 'blocked', key, quiet: true });
    const r = accident(key); if (r !== 'accident') return out({ type: 'blocked', key, quiet: true });
    st.demoOn = true; world.bottle.demo = true; out({ type: 'demo', key: 'balloonOnBottle', id, text: exp.demo.balloonOnBottle.start }); }

  function predict(index){ const m = mission(), p = m && m.predict, i = Math.round(index);
    if (st.phase !== 'do' || !p || st.predicted != null || !(i >= 0 && i < p.cards.length)) return out({ type: 'ignored', reason: 'noPrediction' });
    st.predicted = i; st.asked = true; out({ type: 'predicted', index: i, text: p.cards[i] }); }

  /** 질소가 두 번째로 다 떨어진 뒤: 실험 전체가 아니라 이 의뢰만 새 통으로 다시 한다(앞 의뢰의 도장·노트·내 예상은 그대로) */
  function retry(){ if (!st.over) return out({ type: 'ignored', reason: 'notOver' });
    st.over = false; world.dewar.ln2 = exp.dewar.amount; out({ type: 'refill', left: st.refills, retry: true, text: TX.refillFree }); startMission(st.mi, true); }

  function next(){ if (st.phase !== 'cause') return out({ type: 'ignored', reason: 'notDone' }); startMission(st.mi + 1); }

  // ── 바깥에 내놓는 것
  const act = fn => (...a) => { fx = []; if (st.phase === 'idle') out({ type: 'ignored', reason: 'notStarted' }); else { fn(...a); settle(); } return fx; };
  const api = {
    start(){ fx = []; if (st.phase === 'idle') { startMission(0); settle(); } else out({ type: 'ignored', reason: 'started' }); return fx; },
    wear: act(wear), unwear: act(unwear), grab: act(grab), place: act(place), pour: act(pour), dip: act(dip), lift: act(lift), handIn: act(handIn),
    strike: act(strike), drop: act(drop), cup: act(cup), cap: act(cap), predict: act(predict), next: act(next), retry: act(retry),
    /** 시간이 흐른다. dt 가 커도 안에서 잘게 나눠 문턱을 놓치지 않는다. */
    tick(dt){ fx = []; if (st.phase === 'idle') return fx; let left = Math.max(0, +dt || 0);
      do { const h = Math.min(FLOW.tickSlice, left); left -= h; world = stepWorld(world, null, h, model); settle(); } while (left > 1e-9);
      return fx; },
    /** { type: 'pour', from, into, amount } 같은 사건 하나를 받는다 */
    dispatch(ev){ const names = EVENTS[ev && ev.type]; if (!names) { fx = []; return [out({ type: 'ignored', reason: 'unknownEvent' })]; } return api[ev.type](...names.map(n => ev[n])); },
    /** 화면이 그릴 때 읽는 값(전부 복사본) */
    view(){ const m = mission(), objects = {};
      for (const id of ids) { const o = objs[id], b = world.bodies[id], it = items[o.kind], e = b ? envOf(b, world.bowl, model) : null;
        objects[id] = { kind: o.kind, name: it.name, loc: o.loc, slot: o.slot, lost: o.lost, available: o.available, cupped: o.cupped };
        if (b) Object.assign(objects[id], { Ts: b.Ts, Tc: b.Tc, env: e, state: o.state, stateName: R.stateName(exp, o.kind, o.state), cold: R.isCold(exp, b), frost: e === 'ln2' ? 0 : frostAmount(b.Ts, exp.frost) });
        if (b && it.thermal.volume) objects[id].volume = balloonVolume(b, it.thermal); }
      return { t: world.t, phase: st.phase, over: st.over, boil: world.boil, quiet: world.boil <= B.quiet, cloud: world.cloud,
        bowl: { ln2: world.bowl.ln2, fill: world.bowl.ln2 / B.capacity, water: world.bowl.water, T: world.bowl.T, deep: world.bowl.ln2 >= B.minDip },
        dewar: { ln2: world.dewar.ln2, fill: world.dewar.ln2 / exp.dewar.amount, pourStartDeg: pourStartDeg(world.dewar.ln2 / exp.dewar.amount, exp.dewar), refills: st.refills },
        bottle: { ...world.bottle }, worn: { ...worn },
        mission: m ? { id: m.id, index: st.mi, title: m.title, note: m.note, hint: st.hint, asked: st.asked, predicted: st.predicted, step: st.step,
          glow: m.steps && st.step >= 0 ? m.steps[st.step].glow.slice() : [], flags: [...st.flags], nail: st.nail.depth / exp.nail.full } : null,
        objects }; },
    get phase(){ return st.phase; }, get over(){ return st.over; }, get missionId(){ const m = mission(); return m ? m.id : null; },
    get note(){ return JSON.parse(JSON.stringify(note)); }, get log(){ return log.slice(); },
    encyclopedia(){ return R.encyclopediaView(exp, note.found); },
  };
  return api;
}
