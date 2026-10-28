// 길 구간(09 문서 2·3절 · 07 문서 상황 D) — 자동 전진 레일. 플레이어는 z=0 에 서고 길(장애물·반딧불·상자·퍼즐)이 다가온다
// 장애물: 바위(옆으로 비킴) · 가지(숙임) — 맞으면 피해 + 잠깐 느려짐(판은 안 멈춤). 퍼즐 자리에서 길이 멈추고 S08P 로.
// 이 파일은 game.js 가 넘겨 주는 api 만 쓴다(hurtPlayer·spawnEnemy·pickup·mastery) — three·DOM 0
import { GAME } from './config.js';
import { clamp } from '../core/math.js';
import { makePuzzle, verifyPuzzle } from '../learn/puzzles.js';
const R = () => GAME.rail;

export function startRail(g, api, zone, zi){
  const C = R(), rng = g.rng, len = zone.len, v = len / (zone.seconds || 45), gapMul = g.band.feather ? C.lowGapMul : 1;
  const r = { zone, idx: zi, len, dist: 0, v: 0, vBase: v, vTarget: v, phase: 'go', obstacles: [], enemies: (zone.enemies || []).map(e => ({ at: e.at * len, kind: e.kind, done: false })),
    puzzle: zone.puzzle ? { at: zone.puzzle.at * len, type: zone.puzzle.type, opt: zone.puzzle, done: false, cur: null, wrong: 0, hint: 0 } : null, hitUntil: 0, startT: g.gameT, endT: 0, hits: 0, passes: 0 };
  // 자리 뽑기: [startD, len−endD] 안, 서로 gap 이상, 퍼즐 자리 ±puzzleClear 비움
  const taken = []; const free = (d, gap) => taken.every(t => Math.abs(t - d) >= gap) && !(r.puzzle && Math.abs(d - r.puzzle.at) < C.puzzleClear);
  const place = (gap) => { for (let i = 0; i < 80; i++) { const d = rng.range(C.startD, len - C.endD); if (free(d, gap)) { taken.push(d); return d; } } return null; };
  const ob = zone.obstacles || {}; let uid = 0; const nid = api.nid;
  const lanes = [-C.lane, 0, C.lane];
  for (let i = 0; i < (ob.rock || 0); i++) { const d = place(C.gap * gapMul); if (d == null) break; r.obstacles.push({ uid: nid(), kind: 'rock', d, x: rng.pick(lanes), r: C.rock.r, h: 1.1, state: 'ahead' }); }
  for (let i = 0; i < (ob.branch || 0); i++) { const d = place(C.gap * gapMul); if (d == null) break; r.obstacles.push({ uid: nid(), kind: 'branch', d, x: 0, r: C.xMax + 1, h: C.branch.h, state: 'ahead' }); }
  // v1.6 버섯 튕김 발판(09 문서 4-2 「길 A 버섯 튕김 발판(자동)」): 밟으면 폴짝 — 피해 0, 마나 +2, 잠깐 무적(공중). 장애물 사이 .5 간격
  for (let i = 0; i < (ob.mushroom || 0); i++) { const d = place(C.gap * .5); if (d == null) break; r.obstacles.push({ uid: nid(), kind: 'mushroom', d, x: rng.pick(lanes) * .9, r: C.mushroom.r, h: .45, state: 'ahead' }); }
  for (let i = 0; i < (zone.chest || 0); i++) { const d = place(C.gap * .6); if (d == null) break; r.obstacles.push({ uid: nid(), kind: 'chest', d, x: rng.pick(lanes) * .8, r: C.chest.r, h: .8, state: 'ahead' }); }
  for (let i = 0; i < (zone.fireflies || 0); i++) { const d = place(C.gap * .35); if (d == null) break; r.obstacles.push({ uid: nid(), kind: 'firefly', d, x: rng.range(-C.xMax + .4, C.xMax - .4), y: 1.1 + rng.range(0, .5), r: C.firefly.r, h: .3, state: 'ahead' }); }
  r.obstacles.sort((a, b) => a.d - b.d);
  g.rail = r; g.emit('rail:start', { idx: zi, len, seconds: zone.seconds || 45, obstacles: r.obstacles.length });
  return r;
}

// 한 틱 — dt 는 게임 시간(슬로 반영)
export function stepRail(g, api, dt){
  const r = g.rail; if (!r || g.endT) return; const C = R(), P = g.player;
  // 속도: 퍼즐 앞 멈춤 / 피격 뒤 느려짐 / 평소 vBase
  const slowHit = g.gameT < r.hitUntil ? C.hitSlow + (1 - C.hitSlow) * (1 - (r.hitUntil - g.gameT) / C.hitRecover) : 1;
  const want = r.phase === 'stop' || r.phase === 'puzzle' ? 0 : r.vBase * slowHit;
  r.v = want < r.v ? Math.max(want, r.v - r.vBase / C.decel * dt) : Math.min(want, r.v + r.vBase / C.accel * dt);
  r.dist = Math.min(r.len, r.dist + r.v * dt);
  // 길 위 몬스터: 자리에 오면 앞 14m 에 등장, engageZ 보다 멀면 길과 함께 다가오고 가까우면 AI 가 맡음
  for (const e of r.enemies) if (!e.done && r.dist >= e.at) { e.done = true; const en = api.spawnEnemy(e.kind, g.rng.range(-C.xMax * .7, C.xMax * .7), C.enemyZ); if (en) en.rail = true; }
  for (const e of g.enemies) if (e.rail && e.state !== 'dead' && e.pos[2] > C.engageZ) e.pos[2] = Math.max(C.engageZ, e.pos[2] - r.v * dt);
  // 장애물·줍기 판정(플레이어 z=0, 장애물 z = d − dist)
  for (const o of r.obstacles) { if (o.state !== 'ahead') continue; const z = o.d - r.dist; if (z > 1.2) continue;
    const dx = Math.abs(P.pos[0] - o.x);
    if (o.kind === 'rock') { if (z <= .5 && z >= -.5) { if (dx < o.r + GAME.player.hurtR && g.gameT >= P.invulnUntil) { hitObstacle(g, api, r, o); continue; } }
      if (z < -.5) { o.state = 'passed'; r.passes++; const nice = dx < o.r + C.nicePass.r; if (nice) { P.mana = Math.min(P.manaMax, P.mana + C.nicePass.mana); g.stats.nicePasses = (g.stats.nicePasses || 0) + 1; }
        g.emit('obstacle:pass', { uid: o.uid, kind: o.kind, nice, pos: [o.x, 0, z] }); } }
    else if (o.kind === 'branch') { if (z <= C.branch.win && z >= -C.branch.win && !P.duck && g.gameT >= P.invulnUntil) { hitObstacle(g, api, r, o); continue; }
      if (z < -C.branch.win) { o.state = 'passed'; r.passes++; g.emit('obstacle:pass', { uid: o.uid, kind: o.kind, nice: true, pos: [0, o.h, z] }); } }
    else if (o.kind === 'mushroom') { if (z <= .6 && z >= -.6 && dx < o.r) { o.state = 'bounced'; g.stats.bounces = (g.stats.bounces || 0) + 1; P.mana = Math.min(P.manaMax, P.mana + C.mushroom.mana); P.invulnUntil = Math.max(P.invulnUntil, g.gameT + C.mushroom.hop); P.hopUntil = g.gameT + C.mushroom.hop;
        g.emit('bounce', { uid: o.uid, pos: [o.x, o.h, z], n: g.stats.bounces, mana: C.mushroom.mana }); g.emit('reward', { kind: 'mana', amount: C.mushroom.mana, pos: [P.pos[0], 1.2, 0] }); }
      else if (z < -.6) o.state = 'passed'; }
    else if (o.kind === 'firefly') { if (z <= .8 && z >= -.8 && dx < o.r) { o.state = 'taken'; g.stats.fireflies = (g.stats.fireflies || 0) + 1; P.mana = Math.min(P.manaMax, P.mana + C.firefly.mana); g.emit('pickup', { uid: o.uid, kind: 'firefly', pos: [o.x, o.y, z], n: g.stats.fireflies }); }
      else if (z < -.8) o.state = 'passed'; }
    else if (o.kind === 'chest') { if (z <= .8 && z >= -.8 && dx < o.r) { o.state = 'taken'; const gold = g.rng.int(C.chest.goldMin, C.chest.goldMax); g.stats.chests = (g.stats.chests || 0) + 1; g.stats.gold = Math.min(C.goldCap, (g.stats.gold || 0) + gold);
        P.mana = Math.min(P.manaMax, P.mana + C.chest.mana); g.emit('pickup', { uid: o.uid, kind: 'chest', pos: [o.x, .5, z], gold, mana: C.chest.mana }); g.toast = { key: 'toast.chest', t: g.t }; }
      else if (z < -.8) o.state = 'passed'; } }
  // 퍼즐 자리: 멈추고(살아 있는 몬스터 없을 때) 연다
  const pz = r.puzzle;
  if (pz && !pz.done && r.phase === 'go' && r.dist >= pz.at) { r.phase = 'stop'; g.toast = { key: 'toast.puzzle', t: g.t }; }
  if (pz && r.phase === 'stop' && r.v < .05 && !g.enemies.some(e => e.state !== 'dead')) { r.phase = 'puzzle'; openPuzzle(g, api, r); }
  // 끝: 길 다 가면 다음 구역
  if (r.dist >= r.len && r.phase === 'go' && !r.endT) { r.endT = g.gameT; g.emit('rail:end', { idx: r.idx, hits: r.hits, passes: r.passes }); api.nextZone(); }
}
function hitObstacle(g, api, r, o){
  const C = R(), atk = C[o.kind].atk; o.state = 'hit'; r.hits++; g.stats.obstaclesHit = (g.stats.obstaclesHit || 0) + 1; r.hitUntil = g.gameT + C.hitRecover;
  g.emit('obstacle:hit', { uid: o.uid, kind: o.kind, pos: [o.x, o.kind === 'branch' ? o.h : .5, 0] }); api.hurtPlayer({ kind: o.kind }, atk);
  g.player.invulnUntil = Math.max(g.player.invulnUntil, g.gameT + .6);
}

// ── 퍼즐(S08P)
function openPuzzle(g, api, r){
  const pz = r.puzzle; pz.cur = makePuzzle(pz.type, g.rng, g.grade, pz.opt); pz.cur.verified = verifyPuzzle(pz.cur);
  pz.state = 'open'; pz.stateT = g.t; pz.picks = []; pz.laneT = 0; pz.openT = pz.openT || g.t; pz.id = pz.cur.id + '-' + (pz.wrong + 1);
  g.screen = 'S08P'; g.puzzle = pz; api.sel.reset(); const P = g.player; P.charging = null; P.pending = []; P.block = false; P.duck = false; P.targetX = 0;
  g.emit('puzzle:open', { id: pz.id, ptype: pz.type, wrong: pz.wrong, hint: pz.hint }); g.emit('screen', { from: 'S08', to: 'S08P' });
}
export function puzzleTargets(g, layout){
  const pz = g.puzzle; if (!pz || !pz.cur || !pz.cur.stones) return []; const open = pz.state === 'open';
  return layout.choices3.map(c => ({ id: 'c' + c.slot, slot: c.slot, kind: 'puzzle', rect: c.rect, enabled: open && !pz.picks.includes(c.slot) }));
}
export function puzzlePick(g, api, slot, via){
  const pz = g.puzzle; if (!pz || pz.state !== 'open' || !pz.cur.stones || pz.picks.includes(slot) || slot < 0 || slot > 2) return;
  pz.picks.push(slot); api.sel.reset(); g.emit('puzzle:pick', { id: pz.id, slot, via });
  if (pz.picks.length < pz.cur.need) return;
  const want = pz.cur.answer.slice().sort().join(), got = pz.picks.slice().sort().join();
  resolvePuzzle(g, api, pz, want === got);
}
export function puzzleLane(g, api, side){ const pz = g.puzzle; if (!pz || pz.state !== 'open' || pz.cur.type !== 'size-gate') return; pz.picks = [side]; g.emit('puzzle:pick', { id: pz.id, side, via: 'lane' }); resolvePuzzle(g, api, pz, side === pz.cur.answer); }
function resolvePuzzle(g, api, pz, right){
  const C = R().puzzle, P = g.player;
  if (right) { pz.state = 'right'; pz.stateT = g.t; const y = pz.wrong ? .6 : 1; pz.y = y;
    const gold = pz.wrong < C.maxWrong ? g.rng.int(R().chest.goldMin, R().chest.goldMax) : 0; P.mana = Math.min(P.manaMax, P.mana + C.mana); g.stats.gold = Math.min(R().goldCap, (g.stats.gold || 0) + gold);
    g.emit('puzzle:right', { id: pz.id, gold, mana: C.mana, pos: [P.pos[0], 1.2, P.pos[2]] }); g.emit('reward', { kind: 'mana', amount: C.mana, pos: [P.pos[0], 1.2, P.pos[2]] }); api.gainXp(GAME.level.xpQ, 'puzzle'); return; }
  pz.wrong++; pz.hint = 1; g.streak = 0;
  if (pz.wrong >= C.maxWrong) { pz.state = 'reveal'; pz.stateT = g.t; pz.y = 0; g.emit('puzzle:reveal', { id: pz.id, answer: pz.cur.answer }); return; }
  pz.state = 'wrong'; pz.stateT = g.t; g.emit('puzzle:wrong', { id: pz.id, wrong: pz.wrong, ptype: pz.type });
  if (pz.cur.type === 'size-gate') { P.targetX = 0; P.pos[0] *= .3; }
}
export function stepPuzzle(g, api, dt, layout){
  const pz = g.puzzle; if (!pz || g.screen !== 'S08P') return; const C = R().puzzle, P = g.player;
  if (pz.state === 'open') {
    if (pz.cur.stones) api.sel.update(g.inputMode === 'camera' ? g.cursor : null, puzzleTargets(g, layout), g.t * 1000, g.aspect || 16 / 9);
    else { const side = P.pos[0] <= -C.laneX ? 'L' : P.pos[0] >= C.laneX ? 'R' : null; pz.laneT = side && side === pz.laneSide ? pz.laneT + dt : 0; pz.laneSide = side; if (side && pz.laneT >= C.laneHold) puzzleLane(g, api, side); }
    return; }
  const show = pz.state === 'right' ? C.rightShow : pz.state === 'wrong' ? C.wrongShow : C.revealShow;
  if (g.t - pz.stateT < show) return;
  if (pz.state === 'wrong') { openPuzzle(g, api, g.rail); return; }   // 다른 수로 다시(힌트 1단계 켜짐)
  closePuzzle(g, api, pz);
}
function closePuzzle(g, api, pz){
  const solved = pz.state === 'right', cur = pz.cur; pz.done = true; g.puzzle = null; g.screen = 'S08'; g.rail.phase = 'go';
  g.stats.puzzles = (g.stats.puzzles || 0) + 1; if (solved) g.stats.puzzleRight = (g.stats.puzzleRight || 0) + 1;
  const m = api.mastery.update(cur.concept, cur.d, pz.y, false);
  g.stats.log.push({ qid: pz.id, concept: cur.concept, fact: cur.fact, type: 'puzzle:' + cur.type, correct: solved, hint: pz.hint, wrong: pz.wrong, ms: Math.round((g.t - pz.openT) * 1000), via: 'puzzle', mBefore: Math.round(m.before * 100) / 100, mAfter: Math.round(m.after * 100) / 100 });
  g.emit('puzzle:close', { id: pz.id, solved, wrong: pz.wrong }); g.emit('screen', { from: 'S08P', to: 'S08' }); g.toast = { key: solved ? 'toast.puzzleGo' : 'toast.puzzlePass', t: g.t };
}
export function puzzleSnapshot(g, r3){
  const pz = g.puzzle; if (!pz || !pz.cur) return null; const c = pz.cur, revealed = pz.state === 'reveal' || pz.state === 'right';
  return { id: pz.id, type: c.type, concept: c.concept, state: pz.state, stateT: r3(g.t - pz.stateT), prompt: c.prompt, picks: pz.picks.slice(), wrong: pz.wrong, maxWrong: R().puzzle.maxWrong, need: c.need,
    hint: pz.hint ? c.hint1 : null, seq: c.seq || null, target: c.target || null, mush: c.mush || null,
    stones: c.stones ? c.stones.map(s => ({ id: 'c' + s.slot, slot: s.slot, num: s.num, targetId: 'c' + s.slot, lit: pz.picks.includes(s.slot), answer: revealed && c.answer.includes(s.slot), wrong: pz.state === 'wrong' && pz.picks.includes(s.slot) })) : null,
    gate: c.gate ? { left: c.gate.left, right: c.gate.right, bigger: c.bigger, picked: pz.picks[0] || null, answer: revealed ? c.answer : null, lane: g.player.pos[0] <= -R().puzzle.laneX ? 'L' : g.player.pos[0] >= R().puzzle.laneX ? 'R' : null } : null };
}
export function railSnapshot(g, r3, v3){
  const r = g.rail; if (!r) return { rail: null, obstacles: [] };
  const C = R();
  return { rail: { idx: r.idx, len: r.len, dist: r3(r.dist), progress: r3(r.dist / r.len), speed: r3(r.v), base: r3(r.vBase), phase: r.phase, xMax: C.xMax },
    obstacles: r.obstacles.filter(o => { const z = o.d - r.dist; return z > -8 && z < C.viewZ; }).map(o => ({ uid: o.uid, kind: o.kind, pos: v3([o.x, o.y || 0, o.d - r.dist]), r: o.r, h: o.h, state: o.state })) };
}
