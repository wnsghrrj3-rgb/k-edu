// 화면 상태기계 — 「지금 무슨 화면인가」만(그리는 법 없음). S01 시작 → (S17 보정) → S04 월드 지도 → S08 전투 ⇄ S08Q 문제 → S13 클리어 / S14 다시 일어서기 → S04
// v1.9 S04 월드 지도(10 문서 S04 받침대 + S06 지도 합침): 숲 4갈래 노드·결정 받침대 6개·배울 것·들어가기 — 손 유지 고르기(targets kind 'map', 카메라·마우스)·키보드 ←→ Enter·클릭. ?stage=(forceStage) 는 지도 없이 바로 판
// boot.js 는 엔진 프레임·키·클릭을 여기로 넘기고, snapshot()·drainEvents() 를 스킨에 넘긴다
import { createGame } from '../game/game.js';
import { WizardInput } from '../input/wizardInput.js';
import { KeyInput } from '../input/keyboard.js';
import { Calib, CALIB_STEPS } from '../input/calib.js';
import { Selector } from '../input/selector.js';
import { STAGE_BY_GRADE } from '../input/config.js';
import { createBus } from '../core/events.js';
import { deepFreeze } from '../core/snapshot.js';

export function createFlow({ data, grade = 1, seed = Date.now() % 100000, freeze = false, cal = null, unlock = null, progress = null, startZone = 0, stage = null, forceStage = false }){
  const bus = createBus();
  const f = { screen: 'S01', mode: 'keyboard', char: 'luna', grade, game: null, calib: null, cal, wi: null, kb: new KeyInput(), t: 0, preview: null, cursor: null, seed, progress: progress || null, forceStage, mastery: null, toast: null, aspect: 16 / 9 };
  const WORLDS = data.worlds || { crystals: ['number', 'shape', 'measure', 'pattern', 'data', 'arcana'], worlds: [{ id: 'forest', nameKo: '숫자의 숲', crystal: 'number', open: true }] };
  const MAP = (data.layout && data.layout.map) || { node: [{ slot: 0, rect: { x: .07, y: .30, w: .15, h: .27 } }, { slot: 1, rect: { x: .29, y: .22, w: .15, h: .27 } }, { slot: 2, rect: { x: .51, y: .30, w: .15, h: .27 } }, { slot: 3, rect: { x: .73, y: .20, w: .15, h: .27 } }], enter: { rect: { x: .41, y: .70, w: .18, h: .32 } } };
  // v1.6 스테이지 목록(data.stages 순서) — requires 를 깬 뒤 열림(?stage= 로 들어오면 forceStage). 기본 = 가장 뒤에 열린 스테이지가 아니라 「고른 것」, 처음은 1-1
  const STAGES = Object.keys(data.stages);
  const isLocked = id => { const z = data.stages[id]; const prog = f.progress || {}; return !!(z && z.requires && !(prog.cleared && prog.cleared[z.requires]) && !(forceStage && id === f.stage)); };
  f.stage = stage && data.stages[stage] ? stage : STAGES[0]; if (isLocked(f.stage) && !forceStage) f.stage = STAGES[0];
  f.stageList = () => STAGES.map(id => ({ id, nameKo: data.stages[id].nameKo, stars: (f.progress && f.progress.cleared && f.progress.cleared[id]) || 0, locked: isLocked(id), requires: data.stages[id].requires || null, reward: data.stages[id].reward ? data.stages[id].reward.spell || null : null, crystal: data.stages[id].reward ? data.stages[id].reward.crystal || null : null, final: !!data.stages[id].final }));   // v1.8 crystal·final(보스 스테이지)
  const ctrl = STAGE_BY_GRADE(grade);
  // ── v1.9 S04 지도: 손 유지 선택은 S08Q 와 같은 Selector(판정 = targets.json map rect, 시스템 소유)
  const mapSel = new Selector(ev => { if (ev.type !== 'SELECT') return; if (ev.value.id === 'enter') f.action('enter'); else if (ev.value.id && ev.value.id.startsWith('stage:')) f.action('pick', { stage: ev.value.id.slice(6), via: 'hand' }); });
  const mapTargets = () => [...STAGES.map((id, i) => ({ id: 'stage:' + id, slot: i, kind: 'map', rect: (MAP.node[i] || MAP.node[MAP.node.length - 1]).rect, enabled: true })), { id: 'enter', slot: -1, kind: 'map', rect: MAP.enter.rect, enabled: !isLocked(f.stage) }];
  const say = key => { f.toast = { key, t: f.t }; };
  function toMap(from){ if (f.game) { f.mastery = f.game.qe.m; f.progress = f.game.progress; f.game = null; } f.calib = null; mapSel.reset(); f.cursor = null; f.screen = 'S04'; bus.emit('screen', { from, to: 'S04' }); }
  f.mapModel = function(){ const prog = f.progress || {}; const stages = f.stageList(); const st = data.stages[f.stage] || {}; const tg = mapTargets();
    const stars = stages.reduce((a, z) => a + (z.stars || 0), 0), crystals = Array.isArray(prog.crystals) ? prog.crystals : [];
    return { world: 'forest', worldName: (WORLDS.worlds.find(w => w.id === 'forest') || {}).nameKo || '', stages, stage: f.stage, locked: isLocked(f.stage), learn: (st.concepts || []).slice(), recLevel: st.recLevel || 1, stars, level: prog.level || 1, xp: prog.xp || 0,
      pedestals: WORLDS.crystals.map((c, i) => ({ idx: i, crystal: c, world: (WORLDS.worlds[i] || {}).id || null, worldName: (WORLDS.worlds[i] || {}).nameKo || '', icon: (WORLDS.worlds[i] || {}).icon || '', open: !!(WORLDS.worlds[i] && WORLDS.worlds[i].open), got: crystals.includes(c) })),
      targets: tg.map(x => ({ id: x.id, kind: x.kind, rect: x.rect, hover: Math.round((mapSel.hover[x.id] || 0) * 1000) / 1000, locked: !x.enabled || (x.id.startsWith('stage:') && isLocked(x.id.slice(6))) })) }; };
  function newGame(){
    f.wi = new WizardInput({ stage: ctrl, cal: f.mode === 'mouse' ? null : f.cal, uMaxAuto: f.mode === 'mouse' ? .55 : null });
    f.game = createGame({ data, seed: f.seed, grade, charId: f.char, inputMode: f.mode === 'keyboard' ? 'keyboard' : 'camera', freeze, unlock, mastery: f.game ? f.game.qe.m : f.mastery, progress: f.game ? f.game.progress : (f.progress || progress), startZone, stageId: f.stage });
    f.progress = f.game.progress;
    for (const ch of [f.wi.charge, f.kb.charge]) { ch.canCharge = () => f.game.canCast(); Object.defineProperty(ch, 'chargeTime', { get: () => f.game.chargeTime(), configurable: true }); }
    const from = f.screen; f.screen = 'S08'; bus.emit('screen', { from, to: 'S08' });
  }
  f.action = function(id, p = {}){
    bus.emit('ui:action', { id });
    if (id === 'start') { f.mode = p.mode || 'keyboard'; f.char = p.char || f.char; f.seed = p.seed != null ? p.seed : f.seed; if (p.stage && data.stages[p.stage] && !isLocked(p.stage)) f.stage = p.stage;
      if (f.mode === 'camera' && (p.calib || !f.cal)) { f.calib = new Calib(); f.screen = 'S17'; bus.emit('screen', { from: 'S01', to: 'S17' }); } else if (forceStage) newGame(); else toMap('S01'); }   // v1.9: 보정 뒤·바로 시작 모두 S04 지도. ?stage= 강제만 지도 없이 판
    else if (id === 'pick' && f.screen === 'S04') { const sid = p.stage; if (!data.stages[sid]) return; bus.emit('map:pick', { stage: sid, locked: isLocked(sid), via: p.via || 'click' }); if (isLocked(sid)) say('map.locked.' + sid); else { f.stage = sid; f.toast = null; } }
    else if (id === 'enter' && f.screen === 'S04') { if (isLocked(f.stage)) { say('map.locked.' + f.stage); return; } bus.emit('map:enter', { stage: f.stage, via: p.via || 'click' }); newGame(); }
    else if (id === 'map') { toMap(f.screen); }
    else if (id === 'calib-skip' && f.calib) f.calib.skip(f.t * 1000);
    else if (id === 'again' && f.game) { f.game.restart(); f.wi = new WizardInput({ stage: ctrl, cal: f.mode === 'mouse' ? null : f.cal, uMaxAuto: f.mode === 'mouse' ? .55 : null }); for (const ch of [f.wi.charge]) { ch.canCharge = () => f.game.canCast(); Object.defineProperty(ch, 'chargeTime', { get: () => f.game.chargeTime(), configurable: true }); } f.screen = 'S08'; }
    else if (id === 'home') { if (f.game) { f.mastery = f.game.qe.m; f.progress = f.game.progress; } f.screen = 'S01'; f.game = null; f.toast = null; f.calib = null; bus.emit('screen', { to: 'S01' }); }
    else if (id === 'resume' && f.game) f.game.paused = null;
    else if (id === 'pause' && f.game) f.game.paused = f.game.paused ? null : 'user';
    else if (id === 'recalib') { f.calib = new Calib(); f.screen = 'S17'; f.game = null; }
    else if (id === 'spell' && f.game) f.game.setSpell(p.id);
    else if (id === 'select' && f.game) f.game.input.push({ type: 'SELECT', t: f.t * 1000, via: 'mouse', value: { slot: p.slot } });
    else if (id === 'hint' && f.game) f.game.input.push({ type: 'HINT', t: f.t * 1000, via: 'mouse', value: {} });
    else if (id === 'attack' && f.game) f.game.input.push({ type: 'ATTACK', t: f.t * 1000, via: 'mouse', value: { side: 'R', zone: p.zone != null ? p.zone : 1, power: 1 } });
  };
  // 엔진 프레임 — pose(문제 밖) / hands(문제 중)
  f.pose = function(p, tMs, W, H){
    if (f.screen === 'S17' && f.calib) { f.calib.pose(p, tMs, W); f.preview = previewOf(p, W, H);
      if (f.calib.done) { f.cal = f.calib.result() || f.cal; f.calib = null; if (forceStage) newGame(); else toMap('S17'); } return; }
    if (f.wi && f.game) { f.wi.pose(p, tMs, W, H); f.game.preview = f.wi.preview; }
  };
  f.hand = function(lm, W, H){ // 손바닥 중심(9) → 커서
    const c = lm ? Selector.norm(lm[9].x, lm[9].y, W, H) : null;
    if (f.screen === 'S04' && !f.game) { f.cursor = c; return; }   // v1.9 지도: 커서는 step 에서 mapSel 로
    if (!f.game) return; f.game.input.push({ type: 'CURSOR', t: f.t * 1000, via: 'hand', value: c || {} });
  };
  f.key = (code, down, tMs) => { if (f.screen === 'S04' && !f.game) { if (!down) return; const i = STAGES.indexOf(f.stage);   // v1.9 지도 키보드: ←→(↑↓) 고르기 · 1~4 바로 · Enter/Space 들어가기 · Esc 처음으로
      if (code === 'ArrowRight' || code === 'ArrowDown') f.action('pick', { stage: STAGES[Math.min(STAGES.length - 1, i + 1)], via: 'key' }); else if (code === 'ArrowLeft' || code === 'ArrowUp') f.action('pick', { stage: STAGES[Math.max(0, i - 1)], via: 'key' });
      else if (/^Digit[1-9]$/.test(code) && STAGES[+code[5] - 1]) f.action('pick', { stage: STAGES[+code[5] - 1], via: 'key' }); else if (code === 'Enter' || code === 'Space') f.action('enter', { via: 'key' }); else if (code === 'Escape') f.action('home'); return; }
    if (f.game && f.mode === 'keyboard') f.kb.key(code, down, tMs); else if (f.game && (code === 'Escape' || code === 'KeyP') && down) f.game.input.push({ type: 'PAUSE', t: tMs, via: 'key', value: {} }); };
  f.wantModes = () => !f.game ? (f.screen === 'S17' ? ['pose'] : f.screen === 'S04' && f.mode !== 'keyboard' ? ['hands'] : []) : f.game.paused === 'user' ? ['hands'] : f.game.screen === 'S08Q' ? ['hands'] : f.game.wantsPose() ? ['pose'] : ['hands'];   // S08P 크기 문은 몸(pose), 돌 고르기는 손(hands)
  f.step = function(dt){
    f.t += dt; const tMs = f.t * 1000;
    if (f.screen === 'S04' && !f.game) { if (f.mode !== 'keyboard') mapSel.update(f.cursor, mapTargets(), tMs, f.aspect); return; }
    if (!f.game) return;
    if (f.mode === 'keyboard') f.kb.tick(tMs);
    const evs = []; if (f.wi) { f.wi.setEnabled(f.game.wantsPose(), tMs); evs.push(...f.wi.drain()); } evs.push(...f.kb.drain());
    f.game.step(dt, evs);
  };
  f.snapshot = function(){
    if (f.game) { const s = f.game.snapshot(); if (freeze) return s; return s; }
    const mm = f.screen === 'S04' ? f.mapModel() : null;
    const s = { t: f.t, screen: f.screen, calib: f.calib ? { step: f.calib.step, idx: f.calib.i, of: CALIB_STEPS.length, msg: f.calib.msg, p: Math.round(f.calib.p * 100) / 100 } : null,
      input: { preview: f.preview, mode: f.mode, cursor: f.screen === 'S04' ? f.cursor : null }, title: f.screen === 'S01' ? { chars: ['luna', 'tori', 'haru'], char: f.char, hasCal: !!f.cal, stages: f.stageList(), stage: f.stage } : f.screen === 'S04' ? { char: f.char } : null,
      map: mm, targets: mm ? mm.targets : [], toast: f.toast && f.t - f.toast.t < 2.6 ? f.toast.key : null };
    return freeze ? deepFreeze(s) : s;
  };
  f.drainEvents = () => [...bus.drain(), ...(f.game ? f.game.drainEvents() : [])];
  return f;
}
function previewOf(p, W, H){ if (!p) return null; return { ok: true, joints: [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].map(i => p[i] ? [p[i].x / W, p[i].y / H, 1] : null) }; }
