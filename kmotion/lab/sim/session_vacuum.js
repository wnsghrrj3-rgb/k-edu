// 케이모션 과학실 — 실험 2 「공기를 빼면」 한 판의 상태 기계 (순수: 화면을 모른다 → node 로 한 판을 끝까지 돌린다)
// 모양은 sim/session.js 와 같다: 뷰는 「뜻이 있는 사건」만 보내고, 여기서 결과를 정해 「효과」 목록으로 돌려준다.
//   사건: start · grab · place · pump · valve · liftBell · shield · predict · drop · next · retry · tick
//   효과: mission · step · askPredict · predicted · appear · pump · gauge · valve · hiss · cover · lift · puff · shrink · quiet · loud ·
//         boilStart · boilStop · bubbles · thermo · candleOut · smoke · suctionDrop · foamFill · pop · fizz · dropResult · stuck ·
//         whoosh · spill · crack · shielded · accident · blocked · hint · missionFail · missionDone · cause · note · stamp · whyNot ·
//         freePlay · discover · restock · reset · ignored …
// 문구·숫자는 전부 exp.json (exp/vacuum/exp.json).
//
// 손 조작은 굵게만: 집기 · 받침판/실험대/선반 근처에 놓으면 착 붙기 · 펌프 위아래 · 밸브 돌리기. 뷰는 정밀한 자리를 몰라도 된다.
// 설계가 지키라고 한 것:
//  · 할 일은 하나(첫 의뢰만 빛나는 걸음, 다음부터는 그림 쪽지).
//  · 모든 사건에 결과가 있다(효과가 하나 이상).
//  · 사고는 판단에서만: 금 간 종을 방호 유리판 없이 쓴 것뿐. 밸브를 확 연 것은 사고가 아니다(엎어진 것을 다시 놓으면 된다).
//    손을 놓쳐 떨어뜨린 것(drop 의 lost)은 아무 일도 일으키지 않는다.
//  · 시간 제한이 없다. 긴장은 새는 고무 테에서 온다: 펌프질을 멈추면 바늘이 천천히 되돌아간다.
//  · 실패해도 그 자리에서 이어서 한다. 예상은 실험 전에, 까닭은 끝난 뒤에만.
import * as VX from './vacuum.js';

export const EVENTS = {
  start: [], grab: ['id'], place: ['id', 'where'], pump: ['strength'], valve: ['open', 'fast'], liftBell: [], shield: ['on'],
  predict: ['index'], drop: ['id', 'height', 'lost'], next: [], retry: [], tick: ['dt'],
};

export function createSession(exp, opts = {}){
  const V = VX.vacuumModel(exp), W = exp.water, FLOW = exp.flow, TX = exp.texts;
  const items = {}; for (const it of exp.items) items[it.id] = it;
  const ids = exp.items.map(it => it.id);
  const objs = {};
  for (const it of exp.items) objs[it.id] = { id: it.id, kind: it.id, role: it.role, loc: 'shelf', available: false, lost: false, lostAt: 0, knocked: false,
    sim: it.vac ? VX.makeObject(it.vac, W) : null, meta: freshMeta(), dirty: false, crackStage: 0 };
  const note = opts.note ? JSON.parse(JSON.stringify(opts.note)) : { entries: [], accidents: [], found: [], stamps: [] };
  let ch = VX.makeChamber(V);
  const st = { mi: -1, phase: 'idle', flags: new Set(), predicted: null, asked: false, step: -2, tries: [], hinted: new Set(), hint: null,
    bell: null, tube: false, shield: false, strokes: 0, gauge: 0, last: {}, cycle: newCycle(), graph: [], graphT: -1, airWasLow: false };
  const log = []; let fx = [];

  function freshMeta(){ return { lvl: 0, soundLvl: 0, silent: false, fizz: false, smoked: false, thermoLvl: 0, coldDone: false }; }
  function newCycle(){ return { minP: 1, gMax: 1, minRatio: 99, boiled: 0, items: new Set() }; }

  // ── 작은 도구
  const out = e => { fx.push(e); log.push({ t: +ch.t.toFixed(3), ...e }); return e; };
  const mission = () => st.mi < 0 ? null : st.mi < exp.missions.length ? exp.missions[st.mi] : exp.free;
  const throttle = (key, sec) => { if (st.last[key] != null && ch.t - st.last[key] < sec) return false; st.last[key] = ch.t; return true; };
  const onPlate = () => ids.filter(id => objs[id].loc === 'plate' && objs[id].role !== 'bell');
  const sealed = () => ch.sealed;
  const pressureAt = o => o.loc === 'plate' && ch.sealed ? ch.p : 1;
  const whereOf = w => { const s = String(w || 'bench'); return /^plate/.test(s) ? 'plate' : /^shelf/.test(s) ? 'shelf' : 'bench'; };
  const r3 = v => +(+v).toFixed(3);
  function usable(id){ const o = objs[id];
    if (!o) { out({ type: 'ignored', reason: 'unknown', id }); return null; }
    if (!o.available || o.lost) { out({ type: 'ignored', reason: o.lost ? 'lost' : 'unavailable', id }); return null; }
    return o; }
  function check(c){ if (!c) return true;
    if (c.at) for (const id in c.at) if (!objs[id] || objs[id].loc !== c.at[id]) return false;
    if (c.sealedWith && !(st.bell && objs[c.sealedWith] && objs[c.sealedWith].loc === 'plate' && !objs[c.sealedWith].knocked)) return false;
    if (c.predicted && st.predicted == null) return false;
    if (c.flag && !st.flags.has(c.flag)) return false;
    return true; }
  const currentStep = m => { const s = m.steps || []; for (let i = 0; i < s.length; i++) if (!check(s[i].done)) return i; return -1; };
  const missionDone = m => !!m.done && m.done.every(f => st.flags.has(f));
  const relevant = id => { const m = mission(); return st.phase === 'do' && !!(m && m.items && m.items.includes(objs[id] ? objs[id].kind : id)); };

  // ── 실험 노트
  function stamp(text, key){ if (note.stamps.includes(text)) return; note.stamps.push(text); out({ type: 'stamp', key, text }); }
  function discover(id){ const en = exp.encyclopedia.find(x => x.id === id); if (!en || note.found.includes(id)) return;
    note.found.push(id); out({ type: 'discover', id, item: en.item, title: en.title, text: en.text, first: true });
    if (note.found.length === exp.encyclopedia.length) stamp(TX.stampEncyclopedia, 'encyclopedia'); }
  function hint(key, glow){ const m = mission(), h = st.phase === 'do' && m.hints && m.hints[key]; if (!h) return;
    const e = { type: 'hint', key, text: h, back: true, first: !st.hinted.has(h) }; if (glow) e.glow = glow; out(e); st.hinted.add(h); st.hint = h; }

  /** 결과 하나를 알린다(표의 이름 → 효과 · 깃발 · 도감 · 등급 · 귀띔) */
  function outcome(key, id, extra = {}){
    const d = exp.outcomes[key]; const e = { type: d.fx, id, outcome: key, text: d.text, ...extra };
    if (d.grade) e.grade = d.grade; if (d.big) e.big = true; if (d.stage) e.stage = d.stage;
    out(e);
    const o = objs[id];
    if (d.flag && o && !o.knocked && o.loc === 'plate' && st.bell) st.flags.add(`${d.flag}:${o.kind}`);
    if (d.discover) discover(d.discover);
    if (d.grade && st.phase === 'do') { const m = mission();
      st.tries.push({ key, grade: d.grade, text: d.text });
      if (d.grade === 'fail') out({ type: 'missionFail', id: m.id, reason: key, text: d.text, continues: true });
      hint(key, extra.glow); }
  }

  // ── 사고: 다치는 모습은 없다. 경보등 + 기록 한 줄 + 「진짜였다면」. 쓰던 종을 잃고, 그 자리에서 이어서 한다.
  function accident(key){ const a = exp.accidents[key];
    let rec = note.accidents.find(x => x.key === key); const first = !rec;
    if (!rec) note.accidents.push(rec = { key, text: a.log, real: a.real, count: 0 }); rec.count++;
    out({ type: 'accident', key, text: a.log, real: a.real, rule: a.rule, show: a.show, first });
    if (first && note.accidents.length === Object.keys(exp.accidents).length) stamp(TX.stampAccidents, 'accidents');
    hint('accident'); }

  // ── 예상하기
  function ask(again){ const p = mission().predict; st.asked = true; out({ type: 'askPredict', q: p.q, cards: p.cards.slice(), again: !!again }); }
  function gate(action){ const m = mission(), p = m && m.predict;
    if (st.phase !== 'do' || !p || st.predicted != null || !(p.gate || []).includes(action) || !check(p.when)) return false;
    if (throttle('gate', 1)) { out({ type: 'blocked', key: 'predictFirst', text: exp.blocks.predictFirst }); ask(true); } else out({ type: 'blocked', key: 'predictFirst', quiet: true });
    return true; }

  // ── 의뢰
  function appear(){ const fresh = []; for (const id of ids) { const o = objs[id]; if (!o.available && appearIndex(o.kind) <= st.mi) { o.available = true; fresh.push(id); } } if (fresh.length) out({ type: 'appear', ids: fresh }); }
  function appearIndex(kind){ const i = exp.missions.findIndex(m => m.id === items[kind].appears); return i >= 0 ? i : exp.missions.length; }
  function startMission(i){
    st.flags.clear(); st.predicted = null; st.asked = false; st.tries = []; st.hinted.clear(); st.hint = null; st.step = -2; st.cycle = newCycle(); st.graph = []; st.graphT = -1;
    if (i >= exp.missions.length) { st.mi = exp.missions.length; st.phase = 'free'; st.asked = true; appear();
      out({ type: 'freePlay', id: exp.free.id, title: exp.free.title, note: exp.free.note, text: TX.freeStart }); out({ type: 'unlock', key: 'nextShelf' }); return; }
    const m = exp.missions[i]; st.mi = i; st.phase = 'do'; appear();
    out({ type: 'mission', id: m.id, index: i, title: m.title, note: m.note, pictures: (m.pictures || []).slice(), glows: !!m.steps });
  }
  function finishMission(m){ st.phase = 'cause'; const p = m.predict;
    const entry = { id: m.id, title: m.title, note: m.note, stamp: m.stamp,
      predicted: p ? { q: p.q, index: st.predicted, text: st.predicted != null ? p.cards[st.predicted] : TX.noPrediction, actual: p.cards[p.actual] } : null,
      happened: m.happened, cause: m.cause, whyTitle: exp.whyNot.title, whyNot: m.whyNot, tries: st.tries.slice() };
    if (m.graph) entry.graph = { title: TX.ui.graphTitle, points: st.graph.map(q => q.slice()) };
    note.entries.push(entry);
    out({ type: 'missionDone', id: m.id, index: st.mi }); out({ type: 'cause', id: m.id, text: m.cause }); out({ type: 'note', entry }); stamp(m.stamp, m.id);
    if (st.mi === exp.missions.length - 1) out({ type: 'whyNot', title: exp.whyNot.title, lines: exp.whyNot.lines.slice() }); }

  /** 공기가 다 돌아왔다(밸브·종 들기·금 간 종): 이번 한 번 뺀 것을 매긴다(의뢰 중, 의뢰 물체가 안에 있었을 때만) */
  function airBack(){
    const c = st.cycle, m = mission(); st.cycle = newCycle();
    for (const id of ids) { const o = objs[id]; if (o.sim && o.sim.kind === 'flame' && o.sim.outByAir && !o.meta.smoked && c.items.has(id)) { o.meta.smoked = true; outcome(items[id].on.back, id); } }
    if (st.phase !== 'do' || !m.cycle || missionDone(m) || !c.items.has(m.item)) return;
    const rows = m.cycle.rows, me = m.cycle.measure;
    for (const [lim, key] of rows) {
      const hit = me === 'gMax' ? c.gMax >= lim : me === 'minP' ? c.minP <= lim : lim === 'boiled' ? c.boiled > 0 : c.minRatio <= lim;
      if (hit) { outcome(key, m.item); return; } }
  }

  // ── 물체마다 바뀐 것을 알린다
  function react(o, before){
    const s = o.sim, it = items[o.kind], on = it.on || {}, vac = it.vac, p = pressureAt(o);
    if (s.kind === 'puff') {
      const step = FLOW.puffStep, lvl = Math.floor((s.g - 1) / step + 1e-9);
      if (s.base !== before.base || (before.minP < 1 && s.minP === 1)) {
        o.dirty = true; o.meta.lvl = 0; o.meta.fizz = false;
        out({ type: 'shrink', id: o.id, scale: r3(s.size), final: true, smaller: s.base < 1 - 1e-6 });
        if (on.back && before.gMax >= 1.1) outcome(on.back, o.id, { scale: r3(s.size) });
      } else if (lvl > o.meta.lvl) { o.dirty = true; o.meta.lvl = lvl; out({ type: 'puff', id: o.id, scale: r3(s.size), g: r3(s.g) }); }
      else if (lvl < o.meta.lvl) { o.meta.lvl = lvl; out({ type: 'shrink', id: o.id, scale: r3(s.size), g: r3(s.g) }); }
      if (on.goal && before.g < vac.goal && s.g >= vac.goal) outcome(on.goal, o.id, { scale: r3(s.size) });
      if (on.full && !before.full && s.full) outcome(on.full, o.id, { scale: r3(s.size) });
      if (on.burst && !before.burst && s.burst) { o.dirty = true; outcome(on.burst, o.id); }
      if (on.fizz && !o.meta.fizz && p < vac.fizz) { o.meta.fizz = true; o.dirty = true; outcome(on.fizz, o.id); }
      return; }
    if (s.kind === 'sound') {
      const marks = FLOW.soundMarks; let lvl = 0; for (const m of marks) if (s.level < m) lvl++;
      if (lvl !== o.meta.soundLvl) { out({ type: lvl > o.meta.soundLvl ? 'quiet' : 'loud', id: o.id, level: r3(s.level) }); o.meta.soundLvl = lvl; }
      if (!o.meta.silent && s.level < vac.quiet) { o.meta.silent = true; outcome(on.quiet, o.id, { level: r3(s.level) }); }
      else if (o.meta.silent && s.level >= vac.quiet * 2) { o.meta.silent = false; outcome(on.back, o.id, { level: r3(s.level) }); }
      return; }
    if (s.kind === 'water') {
      if (!before.boiling && s.boiling) { o.dirty = true; outcome(on.boil, o.id, { T: r3(s.T), p: r3(p) }); }
      if (before.boiling && !s.boiling) { const air = p >= V.airBackAt || ch.valve > V.valveShut; outcome(on.stop, o.id, { T: r3(s.T), air });
        if (!air && relevant(o.id) && !missionDone(mission()) && throttle('waterStop', 4)) hint('waterStop'); }
      if (!before.simmer && s.simmer && !s.boiling && throttle('simmer:' + o.id, 3)) outcome(on.simmer, o.id);
      const tl = Math.floor(Math.max(0, W.T0 - s.T) / W.thermoStep + 1e-9);
      if (tl > o.meta.thermoLvl) { o.meta.thermoLvl = tl; out({ type: 'thermo', id: o.id, T: r3(s.T), boiling: s.boiling }); }
      if (s.boiling && !o.meta.coldDone && s.cooled >= W.coolNeed) { o.meta.coldDone = true; outcome(on.cooled, o.id, { T: r3(s.T), from: r3(s.boilT0) }); }
      return; }
    if (s.kind === 'flame') { if (before.lit && !s.lit) { o.dirty = true; outcome(on.out, o.id); } return; }
    if (s.kind === 'suction') { if (before.stuck && !s.stuck) { o.dirty = true; outcome(on.drop, o.id); } return; }
  }

  /** 물체를 한 걸음(dt = 0 이면 압력이 바뀐 것만 반영) */
  function physics(dt){
    for (const id of ids) { const o = objs[id]; if (!o.sim || !o.available || o.lost) continue;
      if (o.role === 'tube' && !(o.loc === 'plate' && st.tube)) continue;
      const before = o.sim; o.sim = VX.stepObject(o.sim, pressureAt(o), dt, items[id].vac, V); if (o.sim !== before) react(o, before); }
  }

  /** 사건이 끝날 때마다, 시간이 흐를 때마다 보는 것 */
  function settle(){
    const m = mission();
    // 바늘 계기
    const g = VX.gaugeLevel(ch.p, V.gauge);
    if (g !== st.gauge) { out({ type: 'gauge', p: r3(ch.p), level: g, name: TX.gaugeNames[g], dir: g > st.gauge ? 'down' : 'up' }); st.gauge = g; }
    // 이번 한 번 뺀 것 기록
    if (st.bell && ch.p < 1) { const c = st.cycle; c.minP = Math.min(c.minP, ch.p);
      for (const id of onPlate()) { const o = objs[id]; c.items.add(id);
        if (o.sim && o.sim.kind === 'puff') c.gMax = Math.max(c.gMax, o.sim.g);
        if (o.sim && o.sim.kind === 'water') { c.minRatio = Math.min(c.minRatio, ch.p / VX.boilPressure(o.sim.T, W)); if (o.sim.boiling) c.boiled = Math.max(c.boiled, o.sim.boiled); } } }
    if (st.cycle.minP < FLOW.cycleMin && ch.p >= V.airBackAt) airBack();
    // 금 간 종: 빼는 도중 금이 번지고(경보), 더 빼면 안쪽으로 터진다
    if (st.bell && items[st.bell].cracked) crackCheck();
    // 예상 카드 · 빛나는 걸음 · 의뢰 풀림
    if (st.phase === 'do') { const p = m.predict;
      if (p && !st.asked && st.predicted == null && check(p.when)) ask(false);
      if (m.steps) { const i = currentStep(m); if (i !== st.step) { st.step = i; out({ type: 'step', index: i, glow: i >= 0 ? m.steps[i].glow.slice() : [] }); } }
      if (missionDone(m)) finishMission(m); }
    // 자유 실험에서는 깨진 금 간 종이 선반에 다시 놓인다(방호 유리판 뒤에서 터지는 것을 볼 수 있게)
    const cb = Object.values(objs).find(o => o.lost);
    if (cb && st.phase === 'free' && ch.t - cb.lostAt >= FLOW.restockDelay) { cb.lost = false; cb.loc = 'shelf'; cb.crackStage = 0; cb.held = false; out({ type: 'restock', ids: [cb.id], text: TX.crackBack }); }
  }

  function crackCheck(){ const o = objs[st.bell], B = items[st.bell].bell;
    if (o.crackStage < 1 && ch.p < B.crackWarn) { o.crackStage = 1; outcome('crackWarn', o.id); out({ type: 'alarm', id: o.id }); hint('crackWarn'); return; }
    if (o.crackStage === 1 && !o.held && ch.p >= V.liftAt) { o.held = true; outcome('crackHeld', o.id); return; }
    if (o.crackStage >= 1 && ch.p < B.crackBurst) {
      o.crackStage = 2; outcome('crackBurst', o.id, { shield: st.shield });
      if (st.shield) outcome('shielded', o.id); else accident('crackedNoShield');
      const inside = onPlate(); o.lost = true; o.loc = 'gone'; o.lostAt = ch.t; st.bell = null; ch = VX.unseal(ch);
      out({ type: 'lose', id: o.id, text: TX.crackGone });
      knock(inside, 'crack');
      physics(0); settle(); }
  }

  /** 공기가 한꺼번에 들어와 안의 것이 엎어진다: 다시 놓으면 된다(물은 쏟아진다) */
  function knock(list, cause){
    for (const id of list) { const o = objs[id]; o.knocked = true; o.dirty = true;
      if (o.sim && o.sim.kind === 'water' && !o.sim.empty) { o.sim = { ...o.sim, empty: true, boiling: false, simmer: false }; out({ type: 'spill', id, text: TX.spill }); }
      if (o.sim && o.sim.kind === 'flame' && o.sim.lit) o.sim = { ...o.sim, lit: false, flame: 0 };
      if (o.sim && o.sim.kind === 'suction') o.sim = { ...o.sim, stuck: false }; }
    if (list.length) outcome('whoosh', list.find(id => relevant(id)) || list[0], { ids: list.slice(), cause });
  }

  /** 선반에 두면 새것이 된다 */
  function renew(o){ if (!o.sim) return; const wasDirty = o.dirty || o.knocked;
    o.sim = VX.makeObject(items[o.kind].vac, W); o.meta = freshMeta(); o.knocked = false; o.dirty = false;
    if (wasDirty) out({ type: 'restock', ids: [o.id], text: TX.restock }); }

  // ── 사건
  function grab(id){ const o = usable(id); if (!o) return;
    if (o.role === 'fixture') return id === 'pump' ? out({ type: 'handle', id }) : out({ type: 'fixed', id, text: exp.blocks.fixture });
    if (o.role === 'shield') { st.shield = false; o.loc = 'hand'; out({ type: 'grab', id }); return out({ type: 'shield', on: false, text: TX.shieldOff }); }
    if (id === st.bell) return liftBell();
    if (o.loc === 'plate' && st.bell) { if (throttle('bellOn', 1)) out({ type: 'blocked', key: 'bellOn', text: exp.blocks.bellOn, glow: [st.bell] }); else out({ type: 'blocked', key: 'bellOn', quiet: true }); return; }
    if (o.role === 'tube' && o.loc === 'plate') detachTube(o);
    o.loc = 'hand'; o.knocked = false; out({ type: 'grab', id }); }

  function detachTube(o){ o.sim = { ...o.sim, p: ch.p }; st.tube = false; ch = VX.unseal(ch); out({ type: 'detach', id: o.id, p: r3(o.sim.p) }); }

  function place(id, where){ const o = usable(id); if (!o) return; const w = whereOf(where);
    if (o.role === 'fixture') return out({ type: 'fixed', id, text: exp.blocks.fixture });
    if (o.role === 'shield') { o.loc = w === 'shelf' ? 'shelf' : 'bench'; st.shield = o.loc === 'bench'; out({ type: 'place', id, where: o.loc }); return out({ type: 'shield', on: st.shield, text: st.shield ? TX.shieldOn : TX.shieldOff }); }
    if (o.role === 'bell') {
      if (w === 'plate') {
        if (st.bell === id) return out({ type: 'ignored', reason: 'already', id });
        if (st.bell) return out({ type: 'blocked', key: 'bellTaken', text: exp.blocks.bellTaken, glow: [st.bell] });
        if (st.tube) return out({ type: 'blocked', key: 'tooTall', text: exp.blocks.tooTall, glow: ['droptube'] });
        st.bell = id; o.loc = 'plate'; ch = VX.seal(ch, items[id].bell.leak); ch = { ...ch, valve: 0 }; st.cycle = newCycle();
        return out({ type: 'cover', id, ids: onPlate(), text: TX.cover }); }
      if (st.bell === id) { if (!liftBell()) return; }
      o.loc = w; return out({ type: 'place', id, where: w }); }
    // 시료와 낙하 통
    if (o.loc === 'plate' && st.bell && w !== 'plate') { if (throttle('bellOn', 1)) out({ type: 'blocked', key: 'bellOn', text: exp.blocks.bellOn, glow: [st.bell] }); else out({ type: 'blocked', key: 'bellOn', quiet: true }); return; }
    if (w === 'plate') {
      if (st.bell) { if (throttle('bellOn', 1)) out({ type: 'blocked', key: 'bellOn', text: exp.blocks.bellOn, glow: [st.bell] }); else out({ type: 'blocked', key: 'bellOn', quiet: true }); return; }
      if (o.loc === 'plate') { if (o.knocked) { o.knocked = false; out({ type: 'place', id, where: 'plate', upright: true }); if (o.sim && o.sim.kind === 'water' && o.sim.empty) hint('emptyBeaker'); return; } return out({ type: 'ignored', reason: 'already', id }); }
      if (onPlate().length >= FLOW.plateMax) return out({ type: 'blocked', key: 'plateFull', text: exp.blocks.plateFull });
      if (o.role === 'tube') { if (onPlate().length) return out({ type: 'blocked', key: 'plateFull', text: exp.blocks.plateFull });
        o.loc = 'plate'; o.knocked = false; st.tube = true; ch = VX.seal(ch, V.leak); ch = { ...ch, valve: 0, p: o.sim.p, minP: o.sim.p };
        return out({ type: 'connect', id, p: r3(ch.p), text: TX.connect }); }
      o.loc = 'plate'; o.knocked = false; out({ type: 'place', id, where: 'plate' });
      if (o.sim && o.sim.kind === 'water' && o.sim.empty) hint('emptyBeaker');
      return; }
    if (o.role === 'tube' && o.loc === 'plate') detachTube(o);
    o.loc = w; out({ type: 'place', id, where: w });
    if (w === 'shelf') renew(o); }

  function pump(strength = 1){
    const s = Math.max(0, Math.min(1, strength == null ? 1 : +strength || 0)), m = mission();
    if (!sealed()) { out({ type: 'pump', strength: s, p: 1, open: true, text: TX.pumpOpen });
      const item = m && m.item; if (st.phase === 'do' && item && objs[item].loc === 'plate' && throttle('noBell', 1.5)) outcome('noBell', item, { glow: ['bell'] });
      return; }
    if (gate('pump')) return;
    if (ch.valve > V.valveShut) { out({ type: 'pump', strength: s, p: r3(ch.p), valveOpen: true });
      if (throttle('valveOpen', 1)) { out({ type: 'blocked', key: 'valveOpen', text: exp.blocks.valveOpen, glow: ['plate'] }); hint('valveOpen'); } return; }
    const r = VX.pumpStroke(ch, s, V); ch = r.ch; st.strokes++;
    out({ type: 'pump', strength: s, p: r3(ch.p), removed: r3(r.removed), light: r3(1 - ch.p) });
  }

  function valve(open = 1, fast = false){
    const before = ch.p, r = VX.setValve(ch, open, !!fast, V); ch = r.ch;
    out({ type: 'valve', open: ch.valve, fast: !!fast });
    if (ch.valve === 0) return out({ type: 'hiss', none: true, text: TX.valveShut });
    if (!ch.sealed || before >= 1) return out({ type: 'hiss', none: true });
    out({ type: 'hiss', fast: !!fast && ch.valve >= V.fastOpen, text: !!fast && ch.valve >= V.fastOpen ? TX.hissFast : TX.hissSlow });
    if (r.rush) knock(onPlate(), 'valve');
  }

  /** 종 들기: 공기를 뺀 종은 안 들린다(손이 미끄러진다) → 들렸으면 true */
  function liftBell(){
    if (!st.bell) { out({ type: 'ignored', reason: 'noBellOn' }); return false; }
    if (!VX.canLift(ch.p, V)) { outcome('stuck', st.bell, { p: r3(ch.p) }); hint('stuck', ['plate']); return false; }
    const id = st.bell, inside = onPlate(); st.bell = null; ch = VX.unseal(ch); objs[id].loc = 'hand';
    out({ type: 'lift', id, ids: inside, text: TX.lift }); return true; }

  function shield(on = true){ const o = objs.shield; if (!o.available) return out({ type: 'ignored', reason: 'unavailable', id: 'shield' });
    st.shield = !!on; o.loc = st.shield ? 'bench' : 'shelf'; out({ type: 'shield', on: st.shield, text: st.shield ? TX.shieldOn : TX.shieldOff }); }

  function predict(index){ const m = mission(), p = m && m.predict, i = Math.round(index);
    if (st.phase !== 'do' || !p || st.predicted != null || !(i >= 0 && i < p.cards.length)) return out({ type: 'ignored', reason: 'noPrediction' });
    st.predicted = i; st.asked = true; out({ type: 'predicted', index: i, text: p.cards[i] }); }

  /** 떨어뜨리기: 손을 놓친 것은 제자리로(아무것도 안 깨진다). 낙하 통은 뒤집어 깃털과 쇠구슬을 떨어뜨린다. */
  function drop(id, height = 0, lost = false){ const o = usable(id); if (!o) return;
    if (lost) return out({ type: 'return', id, text: TX.lostHand });
    if (o.role === 'tube') { const p = o.loc === 'plate' && st.tube ? ch.p : o.sim.p, r = VX.tubeDrop(p, items[id].vac);
      return outcome(items[id].on[r.key], id, { result: r.key, p: r3(p), tBall: r.tBall, tFeather: r.tFeather }); }
    if (o.role === 'fixture') return out({ type: 'fixed', id, text: exp.blocks.fixture });
    if (id === st.bell) return liftBell();
    if (o.loc === 'plate' && st.bell) { out({ type: 'blocked', key: 'bellOn', text: exp.blocks.bellOn, glow: [st.bell] }); return; }
    if (o.role === 'shield') { st.shield = true; o.loc = 'bench'; return out({ type: 'shield', on: true, text: TX.shieldOn }); }
    o.loc = 'bench'; out({ type: 'thud', id, height: Math.max(0, +height || 0), text: TX.thud }); }

  function next(){ if (st.phase !== 'cause') return out({ type: 'ignored', reason: 'notDone' }); startMission(st.mi + 1); }

  /** 다시 차리기: 실험대를 처음처럼(종은 들고, 밸브는 잠그고, 물체는 선반에 새것으로). 의뢰·예상·도장은 그대로. */
  function retry(){ if (st.phase !== 'do' && st.phase !== 'free') return out({ type: 'ignored', reason: 'notNow' });
    const back = [];
    for (const id of ids) { const o = objs[id]; if (o.role === 'fixture' || o.lost || !o.available) continue;
      if (o.loc !== 'shelf' || o.dirty || o.knocked) back.push(id);
      o.loc = 'shelf'; o.knocked = false; o.dirty = false; o.meta = freshMeta(); if (o.sim) o.sim = VX.makeObject(items[id].vac, W); }
    st.bell = null; st.tube = false; st.shield = false; ch = { ...VX.unseal(ch), valve: 0 }; st.cycle = newCycle();
    for (const f of [...st.flags]) if (!(mission().done || []).includes(f)) st.flags.delete(f);
    out({ type: 'reset', ids: back, text: TX.reset }); }

  function sampleGraph(){ const m = mission(); if (st.phase !== 'do' || !m.graph) return; const o = objs[m.item];
    if (o.loc !== 'plate' || !st.bell || !o.sim || o.sim.empty || ch.p >= 1) return;
    if (st.graphT >= 0 && ch.t - st.graphT < W.graphEvery - 1e-9) return; st.graphT = ch.t;
    if (st.graph.length < W.graphMax) st.graph.push([r3(ch.t), r3(o.sim.T), r3(ch.p), o.sim.boiling ? 1 : 0]); }

  // ── 바깥에 내놓는 것
  const act = fn => (...a) => { fx = []; if (st.phase === 'idle') out({ type: 'ignored', reason: 'notStarted' }); else { fn(...a); physics(0); settle(); } return fx; };
  const api = {
    start(){ fx = []; if (st.phase === 'idle') { startMission(0); settle(); } else out({ type: 'ignored', reason: 'started' }); return fx; },
    grab: act(grab), place: act(place), pump: act(pump), valve: act(valve), liftBell: act(liftBell), shield: act(shield),
    predict: act(predict), drop: act(drop), next: act(next), retry: act(retry),
    /** 시간이 흐른다. dt 가 커도 안에서 잘게 나눠 문턱을 놓치지 않는다. */
    tick(dt){ fx = []; if (st.phase === 'idle') return fx; let left = Math.max(0, +dt || 0);
      do { const h = Math.min(FLOW.tickSlice, left); left -= h; ch = VX.stepChamber(ch, h, V); physics(h); sampleGraph(); settle(); } while (left > 1e-9);
      return fx; },
    /** { type: 'pump', strength } 같은 사건 하나를 받는다 */
    dispatch(ev){ const names = EVENTS[ev && ev.type]; if (!names) { fx = []; return [out({ type: 'ignored', reason: 'unknownEvent' })]; } return api[ev.type](...names.map(n => ev[n])); },
    /** 화면이 그릴 때 읽는 값(전부 복사본) */
    view(){ const m = mission(), objects = {};
      for (const id of ids) { const o = objs[id], it = items[id];
        objects[id] = { kind: o.kind, name: it.name, role: o.role, loc: o.loc, available: o.available, lost: o.lost, knocked: o.knocked };
        if (it.cracked) Object.assign(objects[id], { cracked: true, crackStage: o.crackStage });
        if (o.sim) { const sv = JSON.parse(JSON.stringify(o.sim)); sv.model = sv.kind; delete sv.kind; Object.assign(objects[id], sv, { pressure: o.role === 'tube' ? o.sim.p : pressureAt(o) }); } }
      const clock = objs.clock && objs.clock.sim;
      return { t: ch.t, phase: st.phase, p: ch.p, gauge: st.gauge, gaugeName: TX.gaugeNames[st.gauge], sealed: ch.sealed, leak: ch.sealed ? ch.leak : 0,
        bell: st.bell, tube: st.tube, valve: ch.valve, shield: st.shield, strokes: st.strokes, liftable: VX.canLift(ch.p, V),
        plate: onPlate(), sound: clock && objs.clock.available ? clock.level : null, graph: st.graph.map(q => q.slice()),
        mission: m ? { id: m.id, index: st.mi, title: m.title, note: m.note, hint: st.hint, asked: st.asked, predicted: st.predicted, step: st.step,
          glow: m.steps && st.step >= 0 ? m.steps[st.step].glow.slice() : [], pictures: (m.pictures || []).slice(), flags: [...st.flags] } : null,
        objects }; },
    get phase(){ return st.phase; }, get missionId(){ const m = mission(); return m ? m.id : null; },
    get note(){ return JSON.parse(JSON.stringify(note)); }, get log(){ return log.slice(); },
    encyclopedia(){ return exp.encyclopedia.map(e => note.found.includes(e.id) ? { id: e.id, item: e.item, found: true, title: e.title, text: e.text } : { id: e.id, item: e.item, found: false }); },
  };
  return api;
}
