// MATH WIZARD 게임 한 판(시스템 층) — 그림 없이 돈다. 표현 층은 snapshot()·drainEvents() 만 읽는다
// 입력: step(dt, events) 의 events = WizardInput·KeyInput·boot 가 만든 통일 형식(02 문서 12절) + CURSOR
import { GAME } from './config.js';
import { createBus } from '../core/events.js';
import { createRng } from '../core/rng.js';
import { deepFreeze, r3, v3 } from '../core/snapshot.js';
import { clamp } from '../core/math.js';
import { damage, steer } from './combat.js';
import { makeEnemy, stepEnemy, hurtEnemy, separate } from './enemyAI.js';
import { castSpell, stepMagic, shieldFilter, currentSpell, MAIN } from './magic.js';
import { makeBoss, stepBoss, bossMul, bossAfterHit, sealBroken, bossSnapshot } from './boss.js';
import { QuestionEngine } from '../learn/questionEngine.js';
import { Mastery } from '../learn/mastery.js';
import { Selector } from '../input/selector.js';

export function createGame({ data, seed = 1, grade = 1, charId = 'luna', gauge = null, inputMode = 'keyboard', mastery = null, freeze = false, unlock = null }){
  const bus = createBus(), rng = createRng(seed);
  const bandName = GAME.gradeBand(grade), band = GAME.grade[bandName];
  const stage = data.stages['forest-1-1'], timing = data.anim, spells = data.spells, layout = data.layout;
  const gaugeSetting = gauge || (grade <= 2 ? 'slow' : 'normal');
  const qe = new QuestionEngine({ rng, concepts: stage.concepts, mastery: mastery || new Mastery() });
  const sel = new Selector(e => g.input.push(e)); sel.holdMs = band.holdMs;
  let uid = 0; const nid = () => ++uid;

  const g = {
    bus, rng, band, grade, seed, t: 0, gameT: 0, slow: 1, slowTo: 1, screen: 'S08', paused: null, bodyLost: false, lostT: 0,
    player: null, enemies: [], projectiles: [], areas: [], crystals: [], pickups: [], toast: null, trauma: 0,
    zone: null, waveIdx: 0, waveT: 0, tokensUsed: 0, tokenQ: [], aliveCount: 0, questionOpen: false, q: null, cursor: null, inputMode,
    helpWindup: 1, deaths: 0, stats: null, input: [], spell: 'fireball', empower: 0, streak: 0, lastQClose: -99, lastCrystalT: 0, regenT: 0, endT: 0,
    emit: (type, d) => bus.emit(type, d), data, unlocked: new Set(unlock === 'all' ? ['fireball', 'ice', 'lightning', 'shield', 'meteor'] : ['fireball'].concat(unlock || [])), meteorOff: false,
  };
  function resetRun(){
    const P = GAME.player;
    g.player = { id: charId, pos: [0, 0, 0], yaw: 0, vel: [0, 0, 0], targetX: 0, hp: P.hp, hpMax: P.hp, mana: P.mana, manaMax: P.manaMax, atk: P.atk, def: P.def,
      invulnUntil: 0, cd: {}, arcana: null, blockT0: 0, dodge: null, dodgeReady: 0, duck: false, block: false, charging: null, castReady: 0, hurtUntil: 0, feather: band.feather,
      anim: { lower: 'A01', upper: null, t0: 0, ut0: 0, phaseLoop: 0 }, pending: [], outfit: { hat: charId, cape: charId, staff: charId, bolt: charId, trail: null } };
    g.enemies = []; g.projectiles = []; g.areas = []; g.crystals = []; g.pickups = []; g.tokensUsed = 0; g.tokenQ = []; g.waveIdx = 0; g.waveT = 0;
    g.zoneIdx = 0; g.zone = stage.zones[0]; g.boss = null; g.screen = 'S08'; g.paused = null; g.slow = 1; g.slowTo = 1; g.q = null; g.questionOpen = false; g.lastCrystalT = 0; g.lastQClose = -99; g.endT = 0;
    g.stats = g.stats && g.keepStats ? g.stats : { kills: 0, q: 0, right: 0, startT: g.t, keyboard: inputMode === 'keyboard', qTime: 0, deaths: g.deaths, log: [] };
    g.emit('zone:enter', { zone: 'arena', idx: 0, stage: stage.id });
  }
  // 보스방 들어가기(체크포인트 페이즈부터)
  function enterBoss(phase = 0){
    const zi = stage.zones.findIndex(z => z.type === 'boss'); if (zi < 0) return false; g.zoneIdx = zi; g.zone = stage.zones[zi];
    const P = g.player; P.hp = Math.min(P.hpMax, P.hp + (g.zone.heal || 0));
    g.enemies = g.enemies.filter(e => e.state !== 'dead'); g.crystals = []; g.zoneStartT = g.gameT; g.firstCrystal = false; g.lastCrystalT = g.gameT; g.clearT = null;
    g.boss = makeBoss(data.enemies[g.zone.boss], nid(), phase); g.enemies.push(g.boss); g.checkpoint = { zone: 'boss', phase };
    g.emit('zone:enter', { zone: 'boss', idx: zi, stage: stage.id }); g.emit('boss:intro', { uid: g.boss.uid, kind: g.boss.kind, phase, pos: v3(g.boss.pos) }); g.toast = { key: 'toast.boss', t: g.t };
    return true;
  }
  g.bossHit = (b, dmg) => hurtPlayer(b, dmg);
  g.spawnAdd = kind => { const alive = g.enemies.filter(e => e.state !== 'dead' && !e.boss).length; if (alive + 1 >= band.maxEnemies) return; const b = g.boss, x = clamp((b ? b.pos[0] : 0) + rng.range(-2.5, 2.5), -3.5, 3.5);
    const e = makeEnemy(data.enemies[kind], nid(), x, (b ? b.pos[2] : 8) - .5, rng, band); g.enemies.push(e); g.emit('enemy:spawn', { uid: e.uid, kind: e.kind, pos: v3(e.pos), label: e.label }); };

  // ── 공격 토큰(06 문서 1절): 동시에 공격 준비하는 몬스터 수 상한
  g.takeToken = e => { if (e.token) return true; if (g.tokensUsed >= band.tokens) return false; e.token = true; g.tokensUsed++; return true; };
  g.releaseToken = (e, after) => { if (!e.token) return; e.token = false; g.tokenQ.push(g.gameT + after); };

  // ── 플레이어가 맞음
  function hurtPlayer(src, atk, mul = 1){
    const P = g.player; if (g.gameT < P.invulnUntil || g.screen !== 'S08' && g.screen !== 'S08Q') return false;
    let { amount } = damage(rng, { atk: atk * band.dmg * mul, def: P.def, canCrit: false });
    const blocked = P.block; if (blocked) amount = Math.max(1, Math.round(amount * GAME.player.blockDmg));
    const sf = shieldFilter(g, amount); amount = sf.amount; if (sf.used && amount === 0) { g.emit('hit', { target: 'player', amount: 0, crit: false, weak: false, pos: v3([P.pos[0], 1, P.pos[2]]), blocked: true, arcana: true }); return true; }
    P.hp = Math.max(0, P.hp - amount); g.trauma = Math.min(GAME.shake.max, g.trauma + GAME.shake.hurt * (blocked ? .4 : 1));
    if (blocked) g.emit('block', { pos: v3([P.pos[0], 1, P.pos[2]]), perfect: false });
    else { P.hurtUntil = g.gameT + GAME.player.hurtLock; setLower('A12'); P.pending = P.pending.filter(x => x.kind !== 'attack'); }
    g.emit('hit', { target: 'player', amount, crit: false, weak: false, pos: v3([P.pos[0], 1, P.pos[2]]), blocked });
    if (P.hp <= 0) { if (P.feather) { P.feather = false; P.hp = Math.round(P.hpMax * .5); P.invulnUntil = g.gameT + 1.5; g.toast = { key: 'toast.feather', t: g.t }; g.emit('reward', { kind: 'feather', amount: 1, pos: v3(P.pos) }); }
      else defeat(); }
    return true;
  }
  g.enemyStrike = e => {
    const P = g.player, c = e.telegraph.center, r = e.telegraph.size[0];
    const d = Math.hypot(P.pos[0] - c[0], P.pos[2] - c[2]);
    g.emit('enemy:attack', { uid: e.uid, kind: e.kind });
    if (d <= r + GAME.player.hurtR) hurtPlayer(e, e.def.atk);
  };

  // ── 애니메이션 상태(03 문서 2절) — 시간은 데이터(anim-timing.json)
  function setLower(id){ g.player.anim.lower = id; g.player.anim.t0 = g.gameT; }
  function setUpper(id){ g.player.anim.upper = id; g.player.anim.ut0 = g.gameT; }
  const dur = id => (timing[id] && timing[id].duration) || .4;
  const mark = (id, k) => (timing[id] && timing[id].marks && timing[id].marks[k]) || 0;

  // ── 목표 고르기: 구역(왼·가운데·오른)의 가장 가까운 적, 없으면 전체에서 가장 가까운 적
  function pickTarget(zone){
    const P = g.player, alive = g.enemies.filter(e => e.state !== 'dead' && e.state !== 'spawn' && !(e.boss && !bossMul(g, e))); if (!alive.length) return null;
    const rel = e => Math.atan2(e.pos[0] - P.pos[0], e.pos[2] - P.pos[2]);
    const inZone = zone == null || zone === 1 ? alive.filter(e => Math.abs(rel(e)) < .45) : alive.filter(e => zone === 0 ? rel(e) <= -.15 : rel(e) >= .15);
    const pool = inZone.length ? inZone : alive; let best = null, bd = Infinity;
    for (const e of pool) { const d = Math.hypot(e.pos[0] - P.pos[0], e.pos[2] - P.pos[2]); if (d < bd) { bd = d; best = e; } } return best;
  }
  function pickCluster(radius){ // 폭발 반지름 안에 가장 많이 들어가는 적
    const alive = g.enemies.filter(e => e.state !== 'dead' && e.state !== 'spawn' && !(e.boss && !bossMul(g, e))); let best = null, bn = -1;
    for (const a of alive) { const n = alive.filter(b => Math.hypot(a.pos[0] - b.pos[0], a.pos[2] - b.pos[2]) <= radius).length; if (n > bn) { bn = n; best = a; } } return best;
  }
  function tipPos(){ const P = g.player, s = GAME.player.staffTip; return [P.pos[0] + s[0], s[1] - (P.duck ? .35 : 0), P.pos[2] + s[2]]; }
  function fireBolt(zone, side){
    const P = g.player, sp = spells.bolt, tgt = pickTarget(zone), from = tipPos(); const strong = g.empower > g.gameT;
    const dir = tgt ? [tgt.pos[0] - from[0], 0, tgt.pos[2] - from[2]] : [0, 0, 1]; const n = Math.hypot(dir[0], dir[2]) || 1;
    const p = { uid: nid(), kind: 'bolt', pos: from, vel: [dir[0] / n * sp.speed, 0, dir[2] / n * sp.speed], target: tgt && tgt.uid, homing: sp.homing, r: sp.radius * (strong ? sp.power.scale : 1),
      left: sp.range, mult: strong ? sp.power.dmg : sp.dmg, pierce: strong ? sp.power.pierce : 0, owner: 'player', side, hitSet: [] };
    g.projectiles.push(p); g.emit('attack:fire', { uid: p.uid, from: v3(from), dir: v3([p.vel[0] / sp.speed, 0, p.vel[2] / sp.speed]), power: strong ? 1 : .5, side });
  }
  function fireSpell(aim){
    const P = g.player, id = P.castId || currentSpell(g), sp = spells[id]; P.castId = null; if (P.mana < sp.mp) { g.emit('spell:fizzle', { spell: id, reason: 'mana' }); return; }
    P.mana -= sp.mp; P.cd[id] = g.gameT + sp.cd; P.castReady = g.gameT + Math.min(1, sp.cd);
    if (id !== 'fireball') { castSpell(g, id, aim, magicApi); return; }
    const from = tipPos();
    const tgt = aim === 'auto' || !aim ? pickCluster(sp.radius) : pickTarget(aim === 'L' ? 0 : aim === 'R' ? 2 : 1);
    const dir = tgt ? [tgt.pos[0] - from[0], 0, tgt.pos[2] - from[2]] : [0, 0, 1]; const n = Math.hypot(dir[0], dir[2]) || 1;
    const p = { uid: nid(), kind: 'fireball', pos: from, vel: [dir[0] / n * sp.speed, 0, dir[2] / n * sp.speed], target: tgt && tgt.uid, homing: sp.homing, r: sp.hit, left: sp.range, owner: 'player', hitSet: [] };
    g.projectiles.push(p); g.emit('spell:cast', { spell: 'fireball', uid: p.uid, pos: v3(from), dir: v3([p.vel[0] / sp.speed, 0, p.vel[2] / sp.speed]) });
  }
  function explode(p){
    const sp = spells.fireball, c = p.pos, emp = g.empower > g.gameT ? 1.5 : 1;
    g.areas.push({ uid: nid(), kind: 'explosion', pos: v3([c[0], 0, c[2]]), radius: sp.radius, t0: g.gameT, t1: g.gameT + .35 });
    g.emit('spell:impact', { spell: 'fireball', pos: v3([c[0], 0, c[2]]), radius: sp.radius }); g.trauma = Math.min(GAME.shake.max, g.trauma + .2);
    for (const e of g.enemies) { if (e.state === 'dead' || e.state === 'spawn') continue; const d = Math.hypot(e.pos[0] - c[0], e.pos[2] - c[2]);
      if (e.uid === p.target && d <= sp.radius + e.r || p.hitSet.includes(e.uid)) hitEnemy(e, sp.dmg.direct + sp.dmg.splash, 'spell', emp);
      else if (d <= sp.radius + e.r * .5) hitEnemy(e, sp.dmg.splash, 'spell', emp); }
  }
  const magicApi = { hitEnemy: (e, m, k) => hitEnemy(e, m, k), pickTarget: z => pickTarget(z), pickCluster: r => pickCluster(r), tipPos: () => tipPos(), nid: () => nid(), hurtShieldSeal: b => sealBroken(g, b) };
  function hitEnemy(e, mult, kind, emp = 1){
    if (e.state === 'dead') return;
    if (e.boss) return hitBoss(e, mult, kind, emp);
    const { amount, crit } = damage(rng, { atk: g.player.atk, mult, def: e.def.def, empower: emp });
    e.hp = Math.max(0, e.hp - amount); g.trauma = Math.min(GAME.shake.max, g.trauma + GAME.shake.hit);
    g.emit('hit', { target: e.uid, amount, crit, weak: false, pos: v3([e.pos[0], e.h * .7, e.pos[2]]) });
    if (e.hp <= 0) { if (e.token) g.releaseToken(e, 0); if (e.telegraph) { g.emit('telegraph:end', { uid: e.uid }); e.telegraph = null; }
      e.state = 'dead'; e.stateT = 0; g.stats.kills++; g.emit('enemy:die', { uid: e.uid, kind: e.kind, pos: v3(e.pos) }); }
    else hurtEnemy(g, e, kind);
  }

  function hitBoss(b, mult, kind, emp){
    const bm = bossMul(g, b); if (!bm) return; const shielded = b.shield > 0;
    const { amount, crit } = damage(rng, { atk: g.player.atk, mult, def: b.def.def, empower: emp, weak: shielded ? 1 : bm });
    const dealt = shielded ? Math.max(1, Math.round(amount * bm)) : amount; b.hp = Math.max(0, b.hp - dealt); g.trauma = Math.min(GAME.shake.max, g.trauma + GAME.shake.hit);
    g.emit('hit', { target: b.uid, amount: dealt, crit, weak: bm > 1, shielded, pos: v3([b.pos[0], b.h * .6, b.pos[2]]) });
    const r = bossAfterHit(g, b);
    if (r === 'dead') { g.stats.kills++; g.emit('enemy:die', { uid: b.uid, kind: b.kind, pos: v3(b.pos), boss: true }); g.emit('boss:die', { uid: b.uid }); if (!g.unlocked.has('shield')) { g.unlocked.add('shield'); g.emit('reward', { kind: 'spell', spell: 'shield', amount: 1, pos: v3(b.pos) }); } for (const e of g.enemies) if (!e.boss && e.state !== 'dead') { e.state = 'dead'; e.stateT = 0; } }
    else if (r === 'phase') g.emit('boss:phaseEnd', { uid: b.uid, phase: b.phase });
    else if (shielded && !g.q && g.screen === 'S08' && g.gameT - g.lastQClose >= GAME.boss.sealCd) openQuestion(null, 'seal');
  }

  // ── 수학 수정(07 문서 1절 상황 A)
  function spawnCrystal(){
    const C = GAME.crystal, P = g.player; if (g.crystals.length >= C.max) return;
    let x; for (let i = 0; i < 6; i++) { const side = rng.chance(.5) ? -1 : 1; x = P.pos[0] + side * rng.range(C.sideMin, C.sideMax); if (Math.abs(x) <= GAME.player.xMax - .2) break; x = clamp(x, -GAME.player.xMax + .2, GAME.player.xMax - .2); }
    if (g.crystals.some(c => Math.abs(c.pos[0] - x) < 1.2)) x = clamp(-x, -GAME.player.xMax + .2, GAME.player.xMax - .2);
    const c = { uid: nid(), kind: 'math', pos: [x, C.y, P.pos[2] + C.z], born: g.gameT }; g.crystals.push(c); g.lastCrystalT = g.gameT; g.emit('crystal:spawn', { uid: c.uid, pos: v3(c.pos) });
  }
  function crystalNear(){ const P = g.player; return g.crystals.find(c => Math.abs(c.pos[0] - P.pos[0]) <= GAME.crystal.reach); }
  function updateCrystals(dt){
    const C = GAME.crystal, sp = spells[g.spell]; if (g.screen !== 'S08' || g.endT) return;
    const since = g.gameT - g.zoneStartT; const want = g.crystals.length < C.max && (
      (since >= C.firstAt && !g.firstCrystal) || (g.player.mana < sp.mp && g.crystals.length === 0 && g.gameT - g.lastQClose >= C.lowManaAfter) || (g.gameT - Math.max(g.lastQClose, g.lastCrystalT) >= C.every));
    if (want && g.gameT - g.lastQClose >= 3) { spawnCrystal(); g.firstCrystal = true; }
    for (const c of g.crystals) if (g.gameT - c.born > C.approachAfter) { const dx = g.player.pos[0] - c.pos[0]; if (Math.abs(dx) > 1) c.pos[0] += Math.sign(dx) * C.approachV * dt; }
  }

  // ── 문제(07 문서 3·4절)
  function openQuestion(c, kind = 'crystal'){
    const Q = GAME.question, b = g.boss;
    // 보스 마지막 페이즈의 마지막 보호막 칸 = 「복합 문제」(문장제, 06 문서 5절·08 문서 64행)
    const lastSeal = kind === 'seal' && b && b.phase >= b.def.phases.length - 1 && b.shield === 1;
    const qv = qe.next(lastSeal ? { want: 'word' } : {});
    if (c) { g.crystals = g.crystals.filter(x => x !== c); g.emit('crystal:break', { uid: c.uid, pos: v3(c.pos) }); }
    if (kind === 'seal' && g.boss) { g.boss.sealsAsked++; }
    const total = (Q.gaugeByType[qv.type] || Q.gaugeBase) * band.gaugeGrade * (Q.gaugeSetting[gaugeSetting] || 1);
    // 힌트 1단계 자동: 봉인 문제 3번째부터 · 오답 뒤 재도전 문제(07 문서 8절)
    const hint0 = (kind === 'seal' && b && b.sealsAsked >= 3) || qv.retry ? 1 : 0;
    g.q = { v: qv, kind, state: 'open', openT: g.t, readUntil: g.t + band.readMs / 1000, gauge: 0, total, endAt: 0, picked: null, hint: hint0, hintT: g.t, cursorMoveT: g.t, lastCursor: g.cursor ? { x: g.cursor.x, y: g.cursor.y } : null };
    g.questionOpen = true; g.screen = 'S08Q'; g.slowTo = Q.slowTo; sel.reset(); g.stats.q++;
    const P = g.player; P.charging = null; P.pending = P.pending.filter(x => x.kind !== 'attack' && x.kind !== 'spell'); if (P.block) P.block = false; P.duck = false;
    g.emit('q:open', { id: qv.id, concept: qv.concept, kind }); g.emit('screen', { from: 'S08', to: 'S08Q' });
  }
  function answer(slot, via){
    const q = g.q; if (!q || q.state !== 'open' || g.t < q.readUntil) return;
    const Q = GAME.question, v = q.v, right = slot === v.correctSlot, ms = Math.round((g.t - q.openT) * 1000);
    q.picked = slot; const P = g.player;
    const yRight = q.hint >= 2 ? .6 : q.hint === 1 ? .8 : 1;   // 07 문서 7-2: 힌트 1단계 .8 · 2단계 .6
    const r = qe.result(v, right ? yRight : 0, ms, false);
    if (right) { g.streak++; const bonus = Q.mana.streak[Math.min(g.streak, 5)] || 0; const add = (q.hint >= 2 ? Q.mana.hint2 : q.hint === 1 ? Q.mana.hint1 : Q.mana.right) + bonus; P.mana = Math.min(P.manaMax, P.mana + add);
      q.state = 'right'; q.endAt = g.t + Q.rightShow; g.stats.right++; if (q.kind === 'seal' && g.boss) sealBroken(g, g.boss); g.emit('q:right', { id: v.id, slot, mana: add, streak: g.streak }); g.emit('reward', { kind: 'mana', amount: add, pos: v3([P.pos[0], 1.2, P.pos[2]]) }); }
    else { g.streak = 0; P.mana = Math.min(P.manaMax, P.mana + Q.mana.wrong); q.state = 'wrong'; q.tag = (v.choices[slot] || {}).tag || 'other'; q.endAt = g.t + Q.wrongExplain + Q.revealShow;
      g.emit('q:wrong', { id: v.id, slot, tag: q.tag }); g.emit('reward', { kind: 'mana', amount: Q.mana.wrong, pos: v3([P.pos[0], 1.2, P.pos[2]]) }); }
    if (r.stageUp) g.emit('mastery:up', { concept: v.concept, stage: r.stageUp });
    g.stats.log.push({ qid: v.id, concept: v.concept, fact: v.fact, type: v.type, correct: right, hint: q.hint, ms, choice: slot, via, mBefore: Math.round(r.before * 100) / 100, mAfter: Math.round(r.after * 100) / 100 });
  }
  function openHint(auto = false){ const q = g.q; if (!q || q.state !== 'open' || q.hint >= 2) return; q.hint++; q.hintT = g.t; g.stats.hints = (g.stats.hints || 0) + 1; sel.reset();
    g.emit('q:hint', { id: q.v.id, step: q.hint, auto }); }
  function closeQuestion(){ const q = g.q; g.stats.qTime += g.t - q.openT; g.q = null; g.questionOpen = false; g.screen = 'S08'; g.slowTo = 1; g.lastQClose = g.gameT; sel.reset();
    g.emit('q:close', { id: q.v.id }); g.emit('screen', { from: 'S08Q', to: 'S08' }); }
  function updateQuestion(dt){
    const q = g.q; if (!q) return;
    if (q.state === 'open') {
      if (g.t >= q.readUntil) sel.update(g.inputMode === 'camera' ? g.cursor : null, targetsNow(), g.t * 1000, g.aspect || 16 / 9);
      const handOk = g.inputMode !== 'camera' || !!g.cursor;
      if (handOk && Number.isFinite(q.total)) q.gauge += dt / q.total;
      // 1~2학년: 문제 열리고 6초 동안 손(커서)이 안 움직이면 부엉이가 먼저 말 걸기(07 문서 8절) — 키보드는 안 함
      if (band.feather && q.hint === 0 && g.inputMode === 'camera') { const c = g.cursor; if (c && q.lastCursor && Math.hypot(c.x - q.lastCursor.x, c.y - q.lastCursor.y) > .03) { q.cursorMoveT = g.t; q.lastCursor = { x: c.x, y: c.y }; }
        if (g.t - q.readUntil >= 0 && g.t - Math.max(q.cursorMoveT, q.openT) >= GAME.question.hint.autoLowS) openHint(true); }
      if (q.gauge >= 1) { q.gauge = 0; g.streak = 0; const e = nearestEnemy(); g.emit('q:gauge', { id: q.v.id, uid: e && e.uid });
        if (e) { g.emit('enemy:attack', { uid: e.uid, kind: e.kind, gauge: true }); hurtPlayer(e, e.def.atk || e.def.attacks.slam.dmg, band.gaugeHitMul); } }
    } else if (g.t >= q.endAt) closeQuestion();
  }
  function nearestEnemy(){ let b = null, bd = Infinity; for (const e of g.enemies) { if (e.state === 'dead' || e.state === 'spawn') continue; const d = Math.hypot(e.pos[0] - g.player.pos[0], e.pos[2] - g.player.pos[2]); if (d < bd) { bd = d; b = e; } } return b; }
  function targetsNow(){ const q = g.q; if (!q) return []; const open = q.state === 'open' && g.t >= q.readUntil;
    const ts = layout.choices3.map(c => ({ id: 'c' + c.slot, slot: c.slot, kind: 'choice', rect: c.rect, enabled: open }));
    if (layout.hint) ts.push({ id: 'hint', slot: -1, kind: 'hint', rect: layout.hint.rect, enabled: open && q.hint < 2 });   // 🦉 힌트 구슬(07 문서 8절)
    return ts; }

  // ── 웨이브(06·09 문서) — P1: 전투장 1개
  function updateWaves(dt){
    const z = g.zone; if (!z || g.endT) return;
    if (z.type === 'boss') { if (g.boss && g.boss.state === 'dead' && g.boss.stateT > .8) victory(); return; }
    g.waveT += dt;
    const alive = g.enemies.filter(e => e.state !== 'dead'); const w = z.waves[g.waveIdx];
    if (w) { const go = w.at != null ? g.waveT >= w.at : (alive.length === 0 && (g.clearT == null ? (g.clearT = g.gameT, false) : g.gameT - g.clearT >= (w.delay || 1)));
      if (go) { for (const s of w.spawn) { if (alive.length >= band.maxEnemies) break; const e = makeEnemy(data.enemies[s.kind], nid(), s.x, s.z, rng, band); g.enemies.push(e); g.emit('enemy:spawn', { uid: e.uid, kind: e.kind, pos: v3(e.pos), label: e.label }); }
        g.waveIdx++; g.waveT = 0; g.clearT = null; g.emit('wave', { idx: g.waveIdx, of: z.waves.length }); } }
    else if (alive.length === 0) { if (g.clearT == null) g.clearT = g.gameT; else if (g.gameT - g.clearT >= 1.2) { if (!nextZone()) victory(); } }
  }
  // 다음 구역(09 문서 2절: 전투장 → 전투장 → 보스방 — 길 구간은 P3, 지금은 1초 이음만)
  function nextZone(){
    const zi = g.zoneIdx + 1, z = stage.zones[zi]; if (!z) return false;
    if (z.type === 'boss') return enterBoss(0);
    g.zoneIdx = zi; g.zone = z; g.waveIdx = 0; g.waveT = 0; g.clearT = null; g.enemies = g.enemies.filter(e => e.state !== 'dead'); g.crystals = []; g.zoneStartT = g.gameT; g.firstCrystal = false; g.lastCrystalT = g.gameT;
    const P = g.player; P.hp = Math.min(P.hpMax, P.hp + (z.heal || 0)); g.checkpoint = { zone: 'arena', idx: zi };
    g.emit('zone:enter', { zone: 'arena', idx: zi, stage: stage.id }); return true; }
  function victory(){ if (g.endT) return; g.checkpoint = null; if (g.q) closeQuestion(); g.endT = g.t; setLower('A14'); g.player.anim.upper = null; g.emit('stage:clear', { stage: stage.id }); }
  function defeat(){ if (g.endT) return; g.endT = g.t; g.deaths++; g.stats.deaths = g.deaths; setLower('A15'); g.player.anim.upper = null; if (g.q) { g.q = null; g.questionOpen = false; } g.slowTo = 1; g.emit('player:defeat', {}); }

  // ── 입력 처리
  function handle(ev){
    const P = g.player, v = ev.value || {};
    if (ev.type === 'PAUSE') { if (g.screen === 'S08' || g.screen === 'S08Q') g.paused = g.paused ? null : 'user'; return; }
    if (ev.type === 'CURSOR') { g.cursor = v.x == null ? null : { x: v.x, y: v.y }; return; }
    if (ev.type === 'LOST') { g.bodyLost = true; g.lostT = g.t; g.toast = { key: 'toast.showBody', t: g.t }; return; }
    if (ev.type === 'FOUND') { g.bodyLost = false; if (g.paused === 'body') g.resumeAt = g.t + .4; return; }
    if (ev.type === 'SWAP') { g.toast = { key: 'toast.oneOnly', t: g.t }; return; }
    if (ev.type === 'HAND_LOST') { g.toast = { key: 'toast.showHand', t: g.t }; return; }
    if (g.paused || g.endT) return;
    if (g.screen === 'S08Q') { if (ev.type === 'HINT' || (ev.type === 'SELECT' && v.id === 'hint')) openHint(false); else if (ev.type === 'SELECT' && v.slot >= 0) answer(v.slot, ev.via); return; }
    if (g.screen !== 'S08') return;
    const hurt = g.gameT < P.hurtUntil;
    switch (ev.type) {
      case 'MOVE': P.targetX = clamp(v.u, -1, 1) * GAME.player.xMax; break;
      case 'DODGE': if (g.gameT >= P.dodgeReady && !P.block) { const D = GAME.player.dodge; P.dodge = { from: P.pos[0], to: clamp(P.pos[0] + v.dir * D.dist, -GAME.player.xMax, GAME.player.xMax), t0: g.gameT }; P.invulnUntil = Math.max(P.invulnUntil, g.gameT + D.invuln); P.dodgeReady = g.gameT + D.cd; P.targetX = P.dodge.to; setLower('A05'); g.emit('dodge', { dir: v.dir, perfect: false }); if (P.charging) P.charging.ratio *= .5; } break;
      case 'DUCK': P.duck = !!v.on; if (v.on) setLower('A06'); break;
      case 'BLOCK': P.block = !!v.on; P.blockT0 = v.on ? g.gameT : 0; if (v.on) { P.charging = null; setUpper('A11'); } else if (P.anim.upper === 'A11') P.anim.upper = null; break;
      case 'ATTACK': { if (P.block || P.charging || hurt) break; const c = crystalNear(); if (c) { openQuestion(c); break; }
        const strong = g.empower > g.gameT, id = strong ? 'A08' : 'A07'; setUpper(id); P.pending.push({ kind: 'attack', at: g.gameT + mark(id, 'fire'), zone: v.zone, side: v.side }); break; }
      case 'CHARGE': if (v.start && !g.canCast()) { handle({ type: 'NEED_MANA', value: {} }); break; } if (v.start) { P.castId = currentSpell(g); P.charging = { spell: P.castId, ratio: 0 }; setUpper('A09'); g.emit('spell:charge', { spell: g.spell, ratio: 0, pos: v3(tipPos()) }); } else if (P.charging) P.charging.ratio = v.p; break;
      case 'CAST': if (P.charging) { P.charging = null; setUpper('A10'); P.pending.push({ kind: 'spell', at: g.gameT + mark('A10', 'fire'), aim: v.aim }); } break;
      case 'FIZZLE': if (P.charging) { P.charging = null; if (P.anim.upper === 'A09') P.anim.upper = null; g.emit('spell:fizzle', { spell: P.castId || g.spell }); P.castId = null; g.toast = { key: 'toast.fizzle', t: g.t }; } break;
      case 'NEED_MANA': g.toast = { key: 'toast.findCrystal', t: g.t }; g.emit('hint:crystal', { uids: g.crystals.map(c => c.uid) }); if (!g.crystals.length) spawnCrystal(); break;
    }
  }
  g.canCast = () => { const P = g.player, id = currentSpell(g), sp = spells[id]; return g.screen === 'S08' && !g.paused && P.mana >= sp.mp && g.gameT >= P.castReady && g.gameT >= (P.cd[id] || 0) && !P.block; };
  g.chargeTime = () => spells[currentSpell(g)].cast;
  g.setSpell = id => { if (!MAIN.includes(id) || !g.unlocked.has(id)) return false; g.spell = id; g.emit('spell:equip', { spell: id }); return true; };
  g.spellList = () => MAIN.filter(k => g.unlocked.has(k));

  // ── 한 틱
  g.step = function(dt, events = []){
    g.t += dt; for (const ev of events) handle(ev); for (const ev of g.input.splice(0)) handle(ev);
    if (g.bodyLost && !g.paused && (g.screen === 'S08' || g.screen === 'S08Q') && g.t - g.lostT > 1.5) g.paused = 'body';
    if (g.paused === 'body' && g.resumeAt && g.t >= g.resumeAt) { g.paused = null; g.resumeAt = 0; }
    if (g.toast && g.t - g.toast.t > 2.2) g.toast = null;
    if (g.paused) return;
    // 슬로(07 3-1): 들어갈 때 .2초, 나올 때 .25초
    const Q = GAME.question; if (g.slow !== g.slowTo) { const rate = (1 - Q.slowTo) / (g.slowTo < g.slow ? Q.slowIn : Q.slowOut); g.slow = g.slowTo < g.slow ? Math.max(g.slowTo, g.slow - rate * dt) : Math.min(g.slowTo, g.slow + rate * dt); }
    const gdt = dt * g.slow; g.gameT += gdt; g.trauma = Math.max(0, g.trauma - GAME.shake.decay * dt);
    if (g.endT) { if (g.t - g.endT > (g.player.hp > 0 ? 2.0 : 1.6) && g.screen !== 'S13' && g.screen !== 'S14') { g.screen = g.player.hp > 0 ? 'S13' : 'S14'; g.emit('screen', { from: 'S08', to: g.screen }); } }
    stepPlayer(gdt); updateWaves(gdt); updateCrystals(gdt); updateQuestion(dt);
    // 토큰 반납 예약
    g.tokenQ = g.tokenQ.filter(at => { if (g.gameT >= at) { g.tokensUsed = Math.max(0, g.tokensUsed - 1); return false; } return true; });
    // 몬스터
    const live = g.enemies.filter(e => e.state !== 'dead' && !e.boss); g.aliveCount = live.length;
    live.slice().sort((a, b) => a.pos[0] - b.pos[0]).forEach((e, i) => { e.slot = i; });
    for (const e of g.enemies) { if (e.boss) stepBoss(g, e, gdt); else stepEnemy(g, e, gdt); }
    separate(g.enemies.filter(e => !e.boss));
    if (g.boss && g.boss.state === 'dead') g.boss.stateT += 0;   // 보스 시체는 승리까지 남김
    g.enemies = g.enemies.filter(e => e.boss || !(e.state === 'dead' && e.stateT > GAME.enemy.dieT));
    stepProjectiles(gdt); stepMagic(g, magicApi);
    { const P = g.player, sh = spells.shield; if (P.block && P.blockT0 && g.unlocked.has('shield') && g.screen === 'S08' && !g.endT && g.gameT - P.blockT0 >= sh.hold && P.mana >= sh.mp && g.gameT >= (P.cd.shield || 0) && !(P.arcana && g.gameT < P.arcana.until)) {
        P.blockT0 = 0; P.mana -= sh.mp; P.cd.shield = g.gameT + sh.cd; castSpell(g, 'shield', null, magicApi); } }
    g.areas = g.areas.filter(a => a.kind === 'meteor' ? !a.hit : g.gameT < a.t1);
    // 마나 자연 회복: 1~2학년만 5초마다 +1
    if (band.regen && g.screen === 'S08') { g.regenT += gdt; if (g.regenT >= band.regen) { g.regenT = 0; g.player.mana = Math.min(g.player.manaMax, g.player.mana + 1); } }
  };
  function stepPlayer(dt){
    const P = g.player, C = GAME.player; if (g.endT) { P.vel[0] = 0; return; }
    for (const pd of P.pending.slice()) if (g.gameT >= pd.at) { P.pending.splice(P.pending.indexOf(pd), 1); if (pd.kind === 'attack') fireBolt(pd.zone, pd.side); else if (pd.kind === 'spell') fireSpell(pd.aim); }
    const frozen = g.screen === 'S08Q';
    if (P.dodge) { const k = Math.min(1, (g.gameT - P.dodge.t0) / C.dodge.dur); const e = 1 - (1 - k) * (1 - k); P.pos[0] = P.dodge.from + (P.dodge.to - P.dodge.from) * e; P.vel[0] = 0; if (k >= 1) P.dodge = null; }
    else if (!frozen) {
      const mul = P.block ? C.blockMul : P.charging ? C.chargeMul : 1, vmax = C.vMax * mul;
      const d = P.targetX - P.pos[0], vDes = clamp(d / C.nearR * vmax, -vmax, vmax);   // 목표 근처 .2m 안이면 거리 비례 감속 → 오버슈트 0
      if (Math.abs(vDes) < Math.abs(P.vel[0]) || Math.sign(vDes) !== Math.sign(P.vel[0])) P.vel[0] = vDes; else P.vel[0] += clamp(vDes - P.vel[0], -C.accel * dt, C.accel * dt);
      P.pos[0] = clamp(P.pos[0] + P.vel[0] * dt, -C.xMax, C.xMax);
    } else P.vel[0] = 0;
    P.pos[2] = C.arcK * P.pos[0] * P.pos[0];   // 전투장 호
    if (P.charging) P.charging.ratio = Math.min(1, P.charging.ratio);
    // 하체 애니메이션
    const a = P.anim, sp = Math.abs(P.vel[0]); const oneShot = { A05: dur('A05'), A12: dur('A12'), A14: dur('A14'), A15: dur('A15') };
    const busy = oneShot[a.lower] && g.gameT - a.t0 < oneShot[a.lower];
    if (!busy && !g.endT) { const want = P.duck ? 'A06' : sp > .2 ? 'A04' : 'A01'; if (a.lower !== want) { a.lower = want; a.t0 = g.gameT; } }
    if (a.upper && ['A07', 'A08', 'A10', 'A16', 'A17'].includes(a.upper) && g.gameT - a.ut0 >= dur(a.upper)) a.upper = P.charging ? 'A09' : P.block ? 'A11' : null;
  }
  function stepProjectiles(dt){
    const keep = [];
    for (const p of g.projectiles) {
      const tgt = g.enemies.find(e => e.uid === p.target && e.state !== 'dead'); steer(p, tgt, dt);
      for (let i = 0; i < 3; i++) p.pos[i] += p.vel[i] * dt; p.left -= Math.hypot(p.vel[0], p.vel[2]) * dt;
      let gone = p.left <= 0 || p.pos[1] < 0.05;
      for (const e of g.enemies) { if (gone || e.state === 'dead' || e.state === 'spawn' || p.hitSet.includes(e.uid)) continue;
        const dx = e.pos[0] - p.pos[0], dz = e.pos[2] - p.pos[2], dy = (e.h * .5) - p.pos[1];
        if (Math.hypot(dx, dz) <= p.r + e.r && Math.abs(dy) <= e.h * .5 + p.r + .3) { p.hitSet.push(e.uid);
          if (p.kind === 'fireball') { gone = true; explode(p); }
          else { hitEnemy(e, p.mult, 'bolt'); if (p.pierce > 0) p.pierce--; else gone = true; } } }
      if (gone && p.kind === 'fireball' && !p.hitSet.length) explode(p);
      if (!gone) keep.push(p); else g.emit('projectile:end', { uid: p.uid });
    }
    g.projectiles = keep;
  }

  // ── 스냅샷(contract/snapshot.d.ts)
  g.snapshot = function(){
    const P = g.player, a = P.anim, ph = (id, t0) => { const d = dur(id); return d ? clamp((g.gameT - t0) / d, 0, 1) : 0; };
    const loopPh = id => id === 'A04' ? (g.gameT * Math.max(.6, Math.min(1.6, Math.abs(P.vel[0]) / 3))) % 1 : (g.gameT / 2.4) % 1;
    const lowerPhase = ['A01', 'A04'].includes(a.lower) ? loopPh(a.lower) : ph(a.lower, a.t0);
    const q = g.q; const snap = {
      t: r3(g.t), gameT: r3(g.gameT), slow: r3(g.slow), screen: g.screen, paused: g.paused,
      world: { id: 'forest', stage: stage.id, zone: g.zone && g.zone.type === 'boss' ? 'boss' : 'arena', zoneIdx: g.zoneIdx, arenas: stage.zones.filter(z => z.type === 'arena').length, railProgress: 0, seed, wave: g.waveIdx, waves: g.zone && g.zone.waves ? g.zone.waves.length : 0 },
      player: { id: P.id, pos: v3(P.pos), yaw: 0, vel: v3(P.vel), anim: { lower: a.lower, upper: a.upper, phase: r3(lowerPhase), upperPhase: a.upper ? r3(a.upper === 'A09' ? (P.charging ? P.charging.ratio : 1) : ph(a.upper, a.ut0)) : 0, speed: r3(Math.abs(P.vel[0]) / GAME.player.vMax) },
        hp: P.hp, hpMax: P.hpMax, mana: Math.round(P.mana), manaMax: P.manaMax, charging: P.charging ? { spell: P.charging.spell, ratio: r3(P.charging.ratio) } : null,
        blocking: P.block, ducking: P.duck, invuln: g.gameT < P.invulnUntil, hurtT: r3(Math.max(0, P.hurtUntil - g.gameT)), empowered: g.empower > g.gameT,
        castReady: g.gameT >= P.castReady && g.gameT >= (P.cd[currentSpell(g)] || 0), spell: currentSpell(g), main: g.spell, spells: g.spellList(), spellCost: spells[currentSpell(g)].mp,
        arcana: P.arcana && g.gameT < P.arcana.until ? { ratio: r3((P.arcana.until - g.gameT) / P.arcana.t), nullify: P.arcana.nullify } : null, shieldReady: g.unlocked.has('shield') && P.mana >= spells.shield.mp && g.gameT >= (P.cd.shield || 0), outfit: P.outfit, feather: P.feather },
      enemies: g.enemies.filter(e => !e.boss).map(e => ({ uid: e.uid, kind: e.kind, pos: v3(e.pos), yaw: r3(e.yaw), scale: e.scale, state: e.state, stateT: r3(e.stateT), hp: e.hp, hpMax: e.hpMax, label: e.label,
        telegraph: e.telegraph ? { shape: e.telegraph.shape, center: v3(e.telegraph.center), size: e.telegraph.size, t0: r3(e.telegraph.t0), t1: r3(e.telegraph.t1) } : null, tags: e.tags })),
      boss: bossSnapshot(g, g.boss, r3, v3),
      projectiles: g.projectiles.map(p => ({ uid: p.uid, kind: p.kind, pos: v3(p.pos), vel: v3(p.vel), owner: p.owner, label: null, r: r3(p.r) })),
      areas: g.areas.map(x => ({ uid: x.uid, kind: x.kind, pos: x.pos, radius: x.radius, t0: r3(x.t0), t1: r3(x.t1) })),
      crystals: g.crystals.map(c => ({ uid: c.uid, kind: c.kind, pos: v3(c.pos), near: Math.abs(c.pos[0] - P.pos[0]) <= GAME.crystal.reach })),
      pickups: [],
      question: q ? { id: q.v.id, type: q.v.type, concept: q.v.concept, prompt: q.v.prompt, state: q.state, hintStep: q.hint, gauge: r3(Math.min(1, q.gauge)), gaugeOn: Number.isFinite(q.total),
        readP: r3(clamp((g.t - q.openT) / Math.max(.01, q.readUntil - q.openT), 0, 1)), picked: q.picked,
        reveal: q.state === 'right' || (q.state === 'wrong' && g.t >= q.endAt - GAME.question.revealShow) ? q.v.correctSlot : null,
        explain: q.state === 'wrong' ? (q.v.type === 'word1' && ['add-instead', 'sub-instead'].includes(q.tag) ? 'why.word.' : 'why.') + q.tag : null, choices: q.v.choices.map(c => ({ id: c.id, num: c.num, targetId: 'c' + c.slot })),
        hint: q.hint >= 1 && q.v.hint1 ? q.v.hint1 : null, hintPic: q.hint >= 2 && q.v.hint2 ? q.v.hint2 : null } : null,
      targets: q ? targetsNow().map(x => ({ id: x.id, kind: x.kind, rect: x.rect, hover: r3(sel.hover[x.id] || 0), locked: !x.enabled })) : [],
      input: { cursor: g.cursor, mode: g.inputMode, body: g.bodyLost ? 'lost' : 'ok', calibrating: false, preview: g.preview || null },
      camera: { mode: q ? 'q' : g.boss && g.boss.state === 'intro' ? 'boss-intro' : 'arena', target: v3([P.pos[0], 1, P.pos[2]]), shake: r3(g.trauma * g.trauma) },
      toast: g.toast ? g.toast.key : null, streak: g.streak,
      result: g.endT ? { win: P.hp > 0, kills: g.stats.kills, q: g.stats.q, right: g.stats.right, time: Math.round(g.t - g.stats.startT), keyboard: g.stats.keyboard, deaths: g.deaths } : null,
    };
    return freeze ? deepFreeze(snap) : snap;
  };
  g.drainEvents = () => bus.drain();
  g.restart = () => { const cp = g.checkpoint; g.keepStats = false; resetRun(); g.zoneStartT = g.gameT; g.firstCrystal = false;
    if (cp && cp.zone === 'boss') enterBoss(cp.phase); else if (cp && cp.zone === 'arena') { while (g.zoneIdx < cp.idx) nextZone(); } };   // 보스에서 지면 그 페이즈부터(06 5절) · 전투장 2에서 지면 전투장 2부터
  g.qe = qe; g.answer = answer; g.targetsNow = targetsNow;
  resetRun(); g.zoneStartT = 0;
  return g;
}
