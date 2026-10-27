// 화면 상태기계 — 「지금 무슨 화면인가」만(그리는 법 없음). S01 시작 → S17 보정 → S08 전투 ⇄ S08Q 문제 → S13 클리어 / S14 다시 일어서기
// boot.js 는 엔진 프레임·키·클릭을 여기로 넘기고, snapshot()·drainEvents() 를 스킨에 넘긴다
import { createGame } from '../game/game.js';
import { WizardInput } from '../input/wizardInput.js';
import { KeyInput } from '../input/keyboard.js';
import { Calib, CALIB_STEPS } from '../input/calib.js';
import { Selector } from '../input/selector.js';
import { STAGE_BY_GRADE } from '../input/config.js';
import { createBus } from '../core/events.js';
import { deepFreeze } from '../core/snapshot.js';

export function createFlow({ data, grade = 1, seed = Date.now() % 100000, freeze = false, cal = null, unlock = null }){
  const bus = createBus();
  const f = { screen: 'S01', mode: 'keyboard', char: 'luna', grade, game: null, calib: null, cal, wi: null, kb: new KeyInput(), t: 0, preview: null, cursor: null, seed };
  const ctrl = STAGE_BY_GRADE(grade);
  function newGame(){
    f.wi = new WizardInput({ stage: ctrl, cal: f.mode === 'mouse' ? null : f.cal, uMaxAuto: f.mode === 'mouse' ? .55 : null });
    f.game = createGame({ data, seed: f.seed, grade, charId: f.char, inputMode: f.mode === 'keyboard' ? 'keyboard' : 'camera', freeze, unlock, mastery: f.game ? f.game.qe.m : null });
    for (const ch of [f.wi.charge, f.kb.charge]) { ch.canCharge = () => f.game.canCast(); Object.defineProperty(ch, 'chargeTime', { get: () => f.game.chargeTime(), configurable: true }); }
    f.screen = 'S08'; bus.emit('screen', { from: 'S17', to: 'S08' });
  }
  f.action = function(id, p = {}){
    bus.emit('ui:action', { id });
    if (id === 'start') { f.mode = p.mode || 'keyboard'; f.char = p.char || f.char; f.seed = p.seed != null ? p.seed : f.seed;
      if (f.mode === 'camera' && (p.calib || !f.cal)) { f.calib = new Calib(); f.screen = 'S17'; bus.emit('screen', { from: 'S01', to: 'S17' }); } else newGame(); }
    else if (id === 'calib-skip' && f.calib) f.calib.skip(f.t * 1000);
    else if (id === 'again' && f.game) { f.game.restart(); f.wi = new WizardInput({ stage: ctrl, cal: f.mode === 'mouse' ? null : f.cal, uMaxAuto: f.mode === 'mouse' ? .55 : null }); for (const ch of [f.wi.charge]) { ch.canCharge = () => f.game.canCast(); Object.defineProperty(ch, 'chargeTime', { get: () => f.game.chargeTime(), configurable: true }); } f.screen = 'S08'; }
    else if (id === 'home') { f.screen = 'S01'; f.game = null; f.calib = null; bus.emit('screen', { to: 'S01' }); }
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
      if (f.calib.done) { f.cal = f.calib.result() || f.cal; f.calib = null; newGame(); } return; }
    if (f.wi && f.game) { f.wi.pose(p, tMs, W, H); f.game.preview = f.wi.preview; }
  };
  f.hand = function(lm, W, H){ // 손바닥 중심(9) → 커서
    if (!f.game) return; const c = lm ? Selector.norm(lm[9].x, lm[9].y, W, H) : null; f.game.input.push({ type: 'CURSOR', t: f.t * 1000, via: 'hand', value: c || {} });
  };
  f.key = (code, down, tMs) => { if (f.game && f.mode === 'keyboard') f.kb.key(code, down, tMs); else if (f.game && (code === 'Escape' || code === 'KeyP') && down) f.game.input.push({ type: 'PAUSE', t: tMs, via: 'key', value: {} }); };
  f.wantModes = () => !f.game ? (f.screen === 'S17' ? ['pose'] : []) : f.game.screen === 'S08Q' ? ['hands'] : f.game.screen === 'S08' ? ['pose'] : ['hands'];
  f.step = function(dt){
    f.t += dt; const tMs = f.t * 1000;
    if (!f.game) return;
    if (f.mode === 'keyboard') f.kb.tick(tMs);
    const evs = []; if (f.wi) { f.wi.setEnabled(f.game.screen === 'S08', tMs); evs.push(...f.wi.drain()); } evs.push(...f.kb.drain());
    f.game.step(dt, evs);
  };
  f.snapshot = function(){
    if (f.game) { const s = f.game.snapshot(); if (freeze) return s; return s; }
    const s = { t: f.t, screen: f.screen, calib: f.calib ? { step: f.calib.step, idx: f.calib.i, of: CALIB_STEPS.length, msg: f.calib.msg, p: Math.round(f.calib.p * 100) / 100 } : null,
      input: { preview: f.preview, mode: f.mode }, title: f.screen === 'S01' ? { chars: ['luna', 'tori', 'haru'], char: f.char, hasCal: !!f.cal } : null };
    return freeze ? deepFreeze(s) : s;
  };
  f.drainEvents = () => [...bus.drain(), ...(f.game ? f.game.drainEvents() : [])];
  return f;
}
function previewOf(p, W, H){ if (!p) return null; return { ok: true, joints: [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].map(i => p[i] ? [p[i].x / W, p[i].y / H, 1] : null) }; }
