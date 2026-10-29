// MATH WIZARD 게임 한 판(시스템 층) — 그림 없이 돈다. 표현 층은 snapshot()·drainEvents() 만 읽는다
// 입력: step(dt, events) 의 events = WizardInput·KeyInput·boot 가 만든 통일 형식(02 문서 12절) + CURSOR
import { GAME } from './config.js';
import { createBus } from '../core/events.js';
import { createRng } from '../core/rng.js';
import { deepFreeze, r3, v3 } from '../core/snapshot.js';
import { clamp } from '../core/math.js';
import { damage, steer, exactHit } from './combat.js';
import { makeEnemy, stepEnemy, hurtEnemy, separate } from './enemyAI.js';
import { castSpell, stepMagic, shieldFilter, currentSpell, MAIN } from './magic.js';
import { makeBoss, stepBoss, bossMul, bossAfterHit, sealBroken, bossSnapshot } from './boss.js';
import { QuestionEngine } from '../learn/questionEngine.js';
import { conceptsFor, fallbackFor, packWavesFor, packRange } from '../learn/gradeTable.js';   // v2.3 학년 변환표(15 문서 6절)
import { Mastery } from '../learn/mastery.js';
import { Selector } from '../input/selector.js';
import { startRail, stepRail, stepPuzzle, puzzlePick, puzzleTargets, puzzleSnapshot, railSnapshot } from './rail.js';

export function createGame({ data, seed = 1, grade = 1, charId = 'luna', gauge = null, inputMode = 'keyboard', mastery = null, freeze = false, unlock = null, progress = null, startZone = 0, stageId = 'forest-1-1' }){
  const LV = GAME.level; const prog = progress || { xp: 0, level: 1 }; prog.level = Math.max(1, Math.min(LV.max, prog.level | 0 || 1)); prog.xp = Math.max(0, prog.xp | 0);
  prog.cleared = prog.cleared && typeof prog.cleared === 'object' ? prog.cleared : {}; prog.unlocked = Array.isArray(prog.unlocked) ? prog.unlocked : []; prog.crystals = Array.isArray(prog.crystals) ? prog.crystals : [];   // v1.8: 되찾은 결정(09 문서 2절 받침대 6개 — 「수의 결정」부터)   // v1.6: 깬 스테이지(별 수)·해금 마법 — 기기 안 progress 에 같이
  const bus = createBus(), rng = createRng(seed);
  const bandName = GAME.gradeBand(grade), band = GAME.grade[bandName];
  const stage = data.stages[stageId] || data.stages['forest-1-1'], timing = data.anim, spells = data.spells, layout = data.layout;
  const gaugeSetting = gauge || (grade <= 2 ? 'slow' : 'normal');
  // v2.3(D-31): 장면 개념 = 변환표의 그 학년 줄(없으면 장면 JSON 1학년 값) · 묶음 파·학년별 묶음 수 범위도 변환표에서
  const qe = new QuestionEngine({ rng, concepts: conceptsFor(data, stage, grade), mastery: mastery || new Mastery(), grade, fallback: fallbackFor(data, stage, grade) });
  const PACK_WAVES = packWavesFor(data, stage, grade), PACK_RANGE = packRange(data, grade), PK = GAME.pack;
  const sel = new Selector(e => g.input.push(e)); sel.holdMs = band.holdMs;
  let uid = 0; const nid = () => ++uid;

  const g = {
    bus, rng, band, grade, seed, t: 0, gameT: 0, slow: 1, slowTo: 1, screen: 'S08', paused: null, bodyLost: false, lostT: 0,
    player: null, enemies: [], projectiles: [], areas: [], crystals: [], pickups: [], toast: null, trauma: 0, packs: [],
    zone: null, waveIdx: 0, waveT: 0, tokensUsed: 0, tokenQ: [], aliveCount: 0, questionOpen: false, q: null, cursor: null, inputMode,
    helpWindup: 1, deaths: 0, stats: null, input: [], spell: 'fireball', rail: null, puzzle: null, empower: 0, empowerN: 0, empowerAt: 0, empowerOn: false, lastRightT: -99, streak: 0, lastQClose: -99, lastCrystalT: 0, regenT: 0, endT: 0,
    emit: (type, d) => bus.emit(type, d), data, unlocked: new Set(unlock === 'all' ? ['fireball', 'ice', 'lightning', 'shield', 'meteor'] : ['fireball'].concat(prog.unlocked, unlock || [])), meteorOff: false,
  };
  function resetRun(){
    const P = GAME.player;
    const L = prog.level - 1, hpMax = P.hp + L * LV.hpPer;
    g.player = { id: charId, pos: [0, 0, 0], yaw: 0, vel: [0, 0, 0], targetX: 0, hp: hpMax, hpMax, mana: P.mana, manaMax: P.manaMax, atk: P.atk + L * LV.atkPer, def: P.def + L * LV.defPer,
      invulnUntil: 0, cd: {}, arcana: null, blockT0: 0, dodge: null, dodgeReady: 0, duck: false, block: false, charging: null, castReady: 0, hurtUntil: 0, feather: band.feather,
      anim: { lower: 'A01', upper: null, t0: 0, ut0: 0, phaseLoop: 0 }, pending: [], outfit: { hat: charId, cape: charId, staff: charId, bolt: charId, trail: null } };
    g.enemies = []; g.projectiles = []; g.areas = []; g.crystals = []; g.pickups = []; g.tokensUsed = 0; g.tokenQ = []; g.waveIdx = 0; g.waveT = 0; g.packs = [];
    g.zoneIdx = 0; g.zone = stage.zones[0]; g.boss = null; g.rail = null; g.puzzle = null; g.screen = 'S08'; g.paused = null; g.slow = 1; g.slowTo = 1; g.q = null; g.questionOpen = false; g.lastCrystalT = 0; g.lastQClose = -99; g.endT = 0;
    g.empower = 0; g.empowerN = 0; g.empowerAt = 0; g.empowerOn = false; g.lastRightT = -99; g.rewardSpell = null; g.rewardCrystal = null;
    g.stats = g.stats && g.keepStats ? g.stats : { kills: 0, q: 0, right: 0, startT: g.t, keyboard: inputMode === 'keyboard', qTime: 0, deaths: g.deaths, log: [], xp: 0, levelUps: [] };
    g.zoneStartT = g.gameT; g.firstCrystal = false; g.lastCrystalT = g.gameT; enterZone(0);
  }
  // 구역 들어가기(09 문서 3절): 길 구간 → 전투장 → 길 구간 → 전투장 → 보스방. 체크포인트 = 들어간 구역(보스는 페이즈)
  const arenaNoOf = zi => stage.zones.slice(0, zi + 1).filter(z => z.type === 'arena').length;
  function enterZone(zi){
    const z = stage.zones[zi]; if (!z) return false;
    if (z.type === 'boss') return enterBoss(0);
    g.zoneIdx = zi; g.zone = z; g.waveIdx = 0; g.waveT = 0; g.clearT = null; g.enemies = g.enemies.filter(e => e.state !== 'dead'); g.crystals = []; g.zoneStartT = g.gameT; g.firstCrystal = false; g.lastCrystalT = g.gameT; g.rail = null; g.puzzle = null;
    const P = g.player; P.hp = Math.min(P.hpMax, P.hp + (z.heal || 0)); g.checkpoint = { zone: z.type, idx: zi };
    if (z.type === 'rail') { for (const e of g.enemies) e.rail = true; startRail(g, railApi, z, zi); g.toast = { key: z.toast || (z.dark && !g.darkSeen ? 'toast.dark' : 'toast.rail'), t: g.t }; }   // v1.8 zone.toast = 구역 들어갈 때 한마디(보스 전 한마디 — 09 문서 1절)
    if (z.dark) g.darkSeen = true;   // v1.7 첫 어두운 구역은 「동굴이 어두워요」 안내
    g.emit('zone:enter', { zone: z.type, idx: zi, arenaNo: z.type === 'arena' ? arenaNoOf(zi) : 0, stage: stage.id, dark: !!z.dark }); return true;
  }
  // 보스방 들어가기(체크포인트 페이즈부터)
  function enterBoss(phase = 0){
    const zi = stage.zones.findIndex(z => z.type === 'boss'); if (zi < 0) return false; g.zoneIdx = zi; g.zone = stage.zones[zi];
    const P = g.player; P.hp = Math.min(P.hpMax, P.hp + (g.zone.heal || 0));
    g.enemies = g.enemies.filter(e => e.state !== 'dead'); g.crystals = []; g.zoneStartT = g.gameT; g.firstCrystal = false; g.lastCrystalT = g.gameT; g.clearT = null; g.rail = null; g.puzzle = null;   // v1.8 길→보스방 바로 이어질 때 길 상태 정리(1-보스)
    const bdef = data.enemies[g.zone.boss], hm = g.zone.hpMul || 1; g.boss = makeBoss(hm === 1 ? bdef : Object.assign({}, bdef, { phases: bdef.phases.map(p => Object.assign({}, p, { hp: Math.round(p.hp * hm) })) }), nid(), phase); /* v1.8 zone.hpMul(1-보스 ×1.2) — def 복사본, 원본 불변 */ g.enemies.push(g.boss); g.checkpoint = { zone: 'boss', phase };
    g.emit('zone:enter', { zone: 'boss', idx: zi, stage: stage.id }); g.emit('boss:intro', { uid: g.boss.uid, kind: g.boss.kind, phase, pos: v3(g.boss.pos) }); g.toast = { key: g.zone.toast || 'toast.boss', t: g.t };
    return true;
  }
  g.bossHit = (b, dmg) => hurtPlayer(b, dmg);
  g.spawnAdd = kind => { const alive = g.enemies.filter(e => e.state !== 'dead' && !e.boss).length; if (alive + 1 >= band.maxEnemies) return; const b = g.boss, x = clamp((b ? b.pos[0] : 0) + rng.range(-2.5, 2.5), -3.5, 3.5);
    const e = makeEnemy(data.enemies[kind], nid(), x, (b ? b.pos[2] : 8) - .5, rng, band); g.enemies.push(e); g.emit('enemy:spawn', { uid: e.uid, kind: e.kind, pos: v3(e.pos), label: e.label }); };

  // ── 공격 토큰(06 문서 1절): 동시에 공격 준비하는 몬스터 수 상한
  g.takeToken = e => { if (e.token) return true; if (g.tokensUsed >= band.tokens) return false; e.token = true; g.tokensUsed++; return true; };
  g.releaseToken = (e, after) => { if (!e.token) return; e.token = false; g.tokenQ.push(g.gameT + after); };

  // ── 플레이어가 맞음
  // 경험치·레벨(11 문서 1절) — 판 안에서 바로 오름, 능력치도 즉시
  function gainXp(n, why, pos){
    if (!n || n <= 0) return; prog.xp += n; g.stats.xp += n; g.emit('xp', { amount: n, why, level: prog.level, pos: pos || v3([g.player.pos[0], 1.4, g.player.pos[2]]) });
    while (prog.level < LV.max && prog.xp >= LV.need(prog.level)) { prog.xp -= LV.need(prog.level); prog.level++; const P = g.player;
      P.hpMax += LV.hpPer; P.hp = Math.min(P.hpMax, P.hp + LV.hpPer); P.atk += LV.atkPer; P.def += LV.defPer; g.stats.levelUps.push(prog.level);
      g.emit('level:up', { level: prog.level, hpMax: P.hpMax, atk: P.atk, def: P.def }); g.toast = { key: 'toast.levelUp', t: g.t }; }
  }
  // 레벨 차이(04 문서 4절): (플레이어 − 권장) × 3%, 상한 ±25% — 주는 피해는 ×(1+d), 받는 피해는 ×(1−d)
  const lvDiff = () => Math.max(-LV.diffCap, Math.min(LV.diffCap, (prog.level - (stage.recLevel || 1)) * LV.diffPct));
  function hurtPlayer(src, atk, mul = 1){
    const P = g.player; if (g.gameT < P.invulnUntil || g.screen !== 'S08' && g.screen !== 'S08Q') return false;
    let { amount } = damage(rng, { atk: atk * band.dmg * mul * (1 - lvDiff()), def: P.def, canCrit: false });
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
  const magicApi = { hitEnemy: (e, m, k) => hitEnemy(e, m, k, g.empower > g.gameT ? GAME.empower.mul : 1), pickTarget: z => pickTarget(z), pickCluster: r => pickCluster(r), tipPos: () => tipPos(), nid: () => nid(), hurtShieldSeal: b => sealBroken(g, b) };
  // v1.6 방패병: 방패가 올라가 있고(정면 ±coneDeg) 마법탄(bolt)이 정면에서 오면 방패가 받는다(몸 0). 옆·뒤 · 방패 내린 회복 중 · 마법(spell·tick)은 몸에
  function shieldTakes(e, kind, from){
    const sh = e.shield; if (!sh || sh.broken || !sh.up) return false; if (GAME.shield.spellBypass && kind !== 'bolt') return false; if (!from) return true;
    const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw), dx = from[0] - e.pos[0], dz = from[2] - e.pos[2], d = Math.hypot(dx, dz) || 1;
    return (dx / d * fx + dz / d * fz) >= Math.cos((e.def.shield.coneDeg || 60) * Math.PI / 180);
  }
  function breakShield(e, byMath){
    const sh = e.shield; if (!sh || sh.broken) return; sh.broken = true; sh.up = false; sh.hp = 0; sh.byMath = !!byMath; g.stats.shields = (g.stats.shields || 0) + 1;
    g.emit('enemy:shieldBreak', { uid: e.uid, kind: e.kind, pos: v3([e.pos[0], e.h * .6, e.pos[2]]), byMath: !!byMath }); if (e.state !== 'dead') { e.staggerT = GAME.shield.breakStagger; e.state = 'hurt'; e.stateT = 0; if (e.telegraph) { g.emit('telegraph:end', { uid: e.uid }); e.telegraph = null; g.releaseToken(e, 0); } }
  }
  function crackGolem(e){
    const C = e.crack; C.down = Math.min(C.max, C.down + C.per); g.stats.cracks = (g.stats.cracks || 0) + 1;
    g.emit('enemy:crack', { uid: e.uid, kind: e.kind, down: C.down, max: C.max, def: e.def.def - C.down, pos: v3([e.pos[0], e.h * .6, e.pos[2]]) });
    g.toast = { key: C.down >= C.max ? 'toast.golemOpen' : 'toast.golemCrack', t: g.t };
    if (e.telegraph) { g.emit('telegraph:end', { uid: e.uid }); e.telegraph = null; g.releaseToken(e, 0); } e.staggerT = GAME.golem.crackStagger; e.state = 'hurt'; e.stateT = 0;
  }
  function hitEnemy(e, mult, kind, emp = 1, from = null){
    if (e.state === 'dead') return;
    if (e.boss) return hitBoss(e, mult, kind, emp);
    if (shieldTakes(e, kind, from)) { const sh = e.shield; const { amount } = damage(rng, { atk: g.player.atk * (1 + lvDiff()), mult, def: 0, empower: emp }); sh.hp = Math.max(0, sh.hp - amount);
      g.emit('enemy:shieldHit', { uid: e.uid, kind: e.kind, amount, left: sh.hp, pos: v3([e.pos[0], e.h * .6, e.pos[2]]) }); g.emit('hit', { target: e.uid, amount: 0, crit: false, weak: false, shielded: true, pos: v3([e.pos[0], e.h * .6, e.pos[2]]) });
      if (sh.hp <= 0) breakShield(e, false); return; }
    const deflect = !!(e.crack && e.crack.down === 0 && kind === 'bolt'); if (deflect) mult *= GAME.golem.boltMul;   // v1.7 아직 안 갈라진 수정 골렘: 마법탄이 튕김(마법은 그대로)
    let { amount, crit } = damage(rng, { atk: g.player.atk * (1 + lvDiff()), mult, def: e.def.def - (e.crack ? e.crack.down : 0), empower: emp });
    if (e.pack) amount = Math.min(e.hp, crit ? PK.critHit : PK.normalHit);   // v2.3 묶음 슬라임: 몸 공격·일반 마법은 공식대로지만 머리 숫자가 1~2씩만 깎임(15 문서 2절) → 숫자가 흐트러짐
    e.hp = Math.max(0, e.hp - amount); g.trauma = Math.min(GAME.shake.max, g.trauma + GAME.shake.hit);
    g.emit('hit', { target: e.uid, amount, crit, weak: false, deflect, pos: v3([e.pos[0], e.h * .7, e.pos[2]]) });
    if (e.pack) e.label = String(e.hp);
    if (e.hp <= 0) killEnemy(e, false); else hurtEnemy(g, e, kind);
  }
  function killEnemy(e, exact){
    if (e.token) g.releaseToken(e, 0); if (e.telegraph) { g.emit('telegraph:end', { uid: e.uid }); e.telegraph = null; }
    e.state = 'dead'; e.stateT = 0; g.stats.kills++; g.emit('enemy:die', { uid: e.uid, kind: e.kind, pos: v3(e.pos), exact: !!exact }); gainXp(e.xp || 0, 'kill', v3([e.pos[0], e.h * .8, e.pos[2]])); splitEnemy(e);
    if (e.pack) checkPack(e.pack.id, exact);
  }
  // v2.3 정확 피해 채널(15 문서 5절, D-29): share 탄 — 공식 0, 정답 값만큼. HP 가 정답과 같으면 처치, 흐트러진 마리는 남은 만큼만
  function exactHitEnemy(e, amt){
    if (e.state === 'dead' || e.boss) return; const { amount } = exactHit(Math.min(e.hp, amt));
    e.hp = Math.max(0, e.hp - amount); g.trauma = Math.min(GAME.shake.max, g.trauma + GAME.shake.hit); if (e.pack) e.label = String(e.hp);
    g.emit('hit', { target: e.uid, amount, crit: false, weak: false, exact: true, pos: v3([e.pos[0], e.h * .7, e.pos[2]]) });
    if (e.hp <= 0) killEnemy(e, true); else hurtEnemy(g, e, 'spell');
  }
  // ── v2.3 묶음 몬스터(15 문서 2절, D-30): 숫자 슬라임 n마리가 한 묶음 태그로 스폰, 머리 위 = 자기 HP 숫자. 전부 처치 = enemy:packClear(+ 마리 수 × 5 경험치)
  function spawnPack(n, hpEach, z){
    const id = nid(), uids = [], def = data.enemies['num-slime'], x0 = -(n - 1) * .5 * PK.gapX;
    for (let i = 0; i < n; i++) { const x = clamp(x0 + i * PK.gapX, -GAME.enemy.bounds.x + .3, GAME.enemy.bounds.x - .3);
      const e = makeEnemy(def, nid(), x, z + (i % 2) * .8, rng, band, { label: hpEach, hp: hpEach, xp: 0, tags: ['pack'] }); e.pack = { id, n, hpEach }; e.label = String(hpEach); g.enemies.push(e); uids.push(e.uid);
      g.emit('enemy:spawn', { uid: e.uid, kind: e.kind, pos: v3(e.pos), label: e.label, pack: id }); }
    const pk = { id, n, hpEach, total: n * hpEach, uids, retried: false, cleared: false }; g.packs.push(pk);
    g.emit('enemy:pack', { id, n, hpEach, total: pk.total, uids: uids.slice() }); if (!g.packSeen) { g.packSeen = true; g.toast = { key: 'toast.pack', t: g.t }; } return pk;
  }
  const packAlive = pk => g.enemies.filter(e => e.pack && e.pack.id === pk.id && e.state !== 'dead');
  const livePacks = () => g.packs.filter(pk => !pk.cleared && packAlive(pk).length >= 1);
  function checkPack(id, byMath){
    const pk = g.packs.find(p => p.id === id); if (!pk || pk.cleared) return; const alive = packAlive(pk);
    if (alive.length < 2) {   // 15 문서 4절: 2마리 미만이면 묶음 태그 해제(남은 한 마리 = 보통 슬라임, 보통 탄으로) — 수학으로 끝냈으면(마지막 처치가 share 탄) 묶음 처치로 셈
      for (const e of alive) { e.pack = null; e.tags = e.tags.filter(t => t !== 'pack'); } pk.cleared = true; const released = alive.length > 0;
      if (byMath || !released) { g.stats.packClears = (g.stats.packClears || 0) + 1; gainXp(pk.n * PK.xpPer, 'pack'); g.toast = { key: byMath ? 'toast.packClear' : 'toast.packDone', t: g.t }; }
      g.emit('enemy:packClear', { id, byMath: !!byMath, n: pk.n, released, counted: !!(byMath || !released) }); }
  }
  // 흐트러진 묶음 재계산(15 문서 4절): 같은 HP 값이 가장 많은 그룹 → n'·hpEach'. 같은 값 2 미만이면 원래 n·hpEach 의 역방향(합) 문제, 탄은 산 마리 전부에 원래 힘만큼(현재 HP 이하라 전부 처치)
  function packGroup(pk){
    const alive = packAlive(pk); const by = {}; for (const e of alive) (by[e.hp] = by[e.hp] || []).push(e);
    let best = null; for (const k of Object.keys(by)) if (!best || by[k].length > best.length || (by[k].length === best.length && +k > best[0].hp)) best = by[k];
    if (best && best.length >= 2) return { n: best.length, hpEach: best[0].hp, uids: best.map(e => e.uid), amount: best[0].hp, concept: null };
    return { n: pk.n, hpEach: pk.hpEach, uids: alive.map(e => e.uid), amount: pk.hpEach, concept: 'g3.share.mul' };
  }
  function fireShare(uids, amount, label){
    const P = g.player, sp = spells.bolt, from = tipPos();
    for (const uid of uids) { const e = g.enemies.find(x => x.uid === uid && x.state !== 'dead'); if (!e) continue; const dir = [e.pos[0] - from[0], 0, e.pos[2] - from[2]]; const n = Math.hypot(dir[0], dir[2]) || 1;
      const p = { uid: nid(), kind: 'share', pos: from.slice(), vel: [dir[0] / n * PK.speed, 0, dir[2] / n * PK.speed], target: uid, homing: PK.homing, r: sp.radius, left: sp.range, mult: 0, pierce: 0, owner: 'player', exact: amount, label: String(label), hitSet: [] };
      g.projectiles.push(p); g.emit('attack:fire', { uid: p.uid, from: v3(from), dir: v3([p.vel[0] / PK.speed, 0, p.vel[2] / PK.speed]), power: 1, share: true, label: p.label }); }
  }
  function scatterShare(n){
    const sp = spells.bolt, from = tipPos();
    for (let i = 0; i < n; i++) { const a = (i / Math.max(1, n - 1) - .5) * 1.6 + rng.range(-.15, .15); const vel = [Math.sin(a) * PK.speed, 1.5, Math.cos(a) * PK.speed];
      const p = { uid: nid(), kind: 'share', pos: from.slice(), vel, target: null, homing: 0, r: sp.radius * .8, left: PK.scatterRange, mult: 0, pierce: 0, owner: 'player', exact: 0, scatter: true, label: '?', hitSet: [] };
      g.projectiles.push(p); }
    g.emit('share:scatter', { n }); g.toast = { key: 'toast.shareScatter', t: g.t };
  }
  // 큰 슬라임 분열(06 문서 3절·08 문서 11행 「가르기」): 머리 숫자 n → a + b 두 마리. 수학 수정 정답 뒤 graceS 초 안에 처치하면 분열 없음
  function splitEnemy(e){
    const sp = e.def.split; if (!sp) return; if (g.gameT - g.lastRightT <= sp.graceS) { g.emit('enemy:split', { uid: e.uid, kind: e.kind, pos: v3(e.pos), parts: [], label: e.label, prevented: true }); return; }
    const n = parseInt(e.label || '2', 10) || 2, a = rng.int(1, Math.max(1, n - 1)), b = Math.max(1, n - a), def = data.enemies[sp.kind], parts = [a, b], uids = [];
    parts.forEach((lab, i) => { const side = i ? 1 : -1, x = clamp(e.pos[0] + side * .7, -GAME.enemy.bounds.x, GAME.enemy.bounds.x);
      const m = makeEnemy(def, nid(), x, e.pos[2] + .2, rng, band, { label: lab, hp: sp.hp, xp: sp.xp, scale: sp.scale, tags: ['mini'] }); m.lastAtk = g.gameT - def.cycle * .4; g.enemies.push(m); uids.push(m.uid);
      g.emit('enemy:spawn', { uid: m.uid, kind: m.kind, pos: v3(m.pos), label: m.label, mini: true, from: e.uid }); });
    g.stats.splits = (g.stats.splits || 0) + 1; g.toast = { key: 'toast.split', t: g.t };
    g.emit('enemy:split', { uid: e.uid, kind: e.kind, pos: v3(e.pos), parts, label: e.label, uids, prevented: false });
  }
  // 계산 고블린 도토리(06 문서 3절): 조준선 방향으로 날아감(유도 없음), 식 「a+b」가 달림. 옆으로 비키거나 숙이면 피함
  g.enemyShoot = e => {
    const A = e.def.attack, tg = e.telegraph, from = [e.pos[0], A.y, e.pos[2]]; const dir = [tg.aim[0] - from[0], 0, tg.aim[2] - from[2]]; const n = Math.hypot(dir[0], dir[2]) || 1;
    const a = rng.int(1, 8), b = rng.int(1, 9 - a);
    const p = { uid: nid(), kind: 'acorn', pos: from, vel: [dir[0] / n * A.speed, 0, dir[2] / n * A.speed], target: null, homing: 0, r: A.r, left: tg.size[1] + 6, mult: 1, owner: e.uid, atk: e.def.atk, label: `${a}+${b}`, hitSet: [], resolved: false, bornT: g.gameT };
    g.projectiles.push(p); g.emit('enemy:attack', { uid: e.uid, kind: e.kind, shoot: true }); g.emit('enemy:shoot', { uid: e.uid, kind: e.kind, pid: p.uid, from: v3(from), label: p.label });
  };

  function hitBoss(b, mult, kind, emp){
    const bm = bossMul(g, b); if (!bm) return; const shielded = b.shield > 0;
    const { amount, crit } = damage(rng, { atk: g.player.atk, mult, def: b.def.def, empower: emp, weak: shielded ? 1 : bm });
    const dealt = shielded ? Math.max(1, Math.round(amount * bm)) : amount; b.hp = Math.max(0, b.hp - dealt); g.trauma = Math.min(GAME.shake.max, g.trauma + GAME.shake.hit);
    g.emit('hit', { target: b.uid, amount: dealt, crit, weak: bm > 1, shielded, pos: v3([b.pos[0], b.h * .6, b.pos[2]]) });
    const r = bossAfterHit(g, b);
    if (r === 'dead') { g.stats.kills++; g.emit('enemy:die', { uid: b.uid, kind: b.kind, pos: v3(b.pos), boss: true }); g.emit('boss:die', { uid: b.uid }); gainXp(b.def.xp || 0, 'boss', v3([b.pos[0], b.h * .8, b.pos[2]])); if (!g.unlocked.has('shield')) { g.unlocked.add('shield'); g.emit('reward', { kind: 'spell', spell: 'shield', amount: 1, pos: v3(b.pos) }); } for (const e of g.enemies) if (!e.boss && e.state !== 'dead') { e.state = 'dead'; e.stateT = 0; } }
    else if (r === 'phase') g.emit('boss:phaseEnd', { uid: b.uid, phase: b.phase });
    else if (shielded && !g.q && g.screen === 'S08' && g.gameT - g.lastQClose >= GAME.boss.sealCd) openQuestion(null, 'seal');
  }

  // ── 수학 수정(07 문서 1절 상황 A)
  function spawnCrystal(kind = 'math', opt = {}){
    const C = GAME.crystal, P = g.player; if (kind === 'math' && g.crystals.filter(c => c.kind === 'math').length >= C.max) return;
    let x; for (let i = 0; i < 6; i++) { const side = rng.chance(.5) ? -1 : 1; x = P.pos[0] + side * rng.range(C.sideMin, C.sideMax); if (Math.abs(x) <= GAME.player.xMax - .2) break; x = clamp(x, -GAME.player.xMax + .2, GAME.player.xMax - .2); }
    if (g.crystals.some(c => Math.abs(c.pos[0] - x) < 1.2)) x = clamp(-x, -GAME.player.xMax + .2, GAME.player.xMax - .2);
    const c = { uid: nid(), kind, pos: [x, C.y + (kind === 'empower' ? .15 : 0), P.pos[2] + C.z], born: g.gameT, retry: !!opt.retry }; g.crystals.push(c); if (kind === 'math') g.lastCrystalT = g.gameT;
    g.emit('crystal:spawn', { uid: c.uid, kind, pos: v3(c.pos), retry: !!opt.retry }); if (kind === 'empower') g.toast = { key: opt.retry ? 'toast.empowerRetry' : 'toast.empower', t: g.t };
  }
  function crystalNear(){ const P = g.player; return g.crystals.find(c => Math.abs(c.pos[0] - P.pos[0]) <= GAME.crystal.reach); }
  function updateCrystals(dt){
    if (g.empowerOn && g.empower <= g.gameT) { g.empowerOn = false; g.emit('empower:off', {}); }
    const C = Object.assign({}, GAME.crystal, stage.crystal || {}), sp = spells[g.spell]; if (g.screen !== 'S08' || g.endT || g.rail) return;   // 길 구간엔 수정 없음(문제 시간 비율은 길에서 내려감) · v1.6 스테이지가 every·firstAt 을 덮어쓸 수 있음(보스 없는 1-2는 수정이 더 자주)
    const since = g.gameT - g.zoneStartT; const want = g.crystals.length < C.max && (
      (since >= C.firstAt && !g.firstCrystal) || (g.player.mana < sp.mp && g.crystals.length === 0 && g.gameT - g.lastQClose >= C.lowManaAfter) || (g.gameT - Math.max(g.lastQClose, g.lastCrystalT) >= C.every) ||
      (g.crystals.length === 0 && g.gameT - g.lastQClose >= GAME.golem.crystalAfter && g.enemies.some(e => e.crack && e.crack.down < e.crack.max && e.state !== 'dead')) ||
      (g.crystals.length === 0 && g.gameT - g.lastQClose >= PK.crystalAfter && livePacks().length > 0));   // v1.7 골렘이 덜 갈라졌으면 수정을 더 자주 · v2.3 산 묶음이 있으면 수정을 더 자주(나누기 공격 길이 늘 열려 있게)
    if (want && g.gameT - g.lastQClose >= 3) { spawnCrystal(); g.firstCrystal = true; }
    for (const c of g.crystals) if (c.kind === 'math' && g.gameT - c.born > C.approachAfter) { const dx = g.player.pos[0] - c.pos[0]; if (Math.abs(dx) > 1) c.pos[0] += Math.sign(dx) * C.approachV * dt; }
    // 강화 수정(07 문서 상황 B): 마나 100 도달 3초 뒤 1개(판당 perRun 번), 15초 안 열면 사라짐(벌 없음)
    const EM = GAME.empower, P = g.player;
    if (P.mana >= P.manaMax && !g.empowerAt && g.empowerN < EM.perRun && !g.crystals.some(c => c.kind === 'empower') && g.empower <= g.gameT) g.empowerAt = g.gameT + EM.delay;
    if (g.empowerAt && g.gameT >= g.empowerAt) { g.empowerAt = 0; g.empowerN++; spawnCrystal('empower'); }
    for (const c of g.crystals.slice()) if (c.kind === 'empower' && g.gameT - c.born > EM.life) { g.crystals.splice(g.crystals.indexOf(c), 1); g.emit('crystal:break', { uid: c.uid, pos: v3(c.pos), fade: true }); }
  }

  // ── 문제(07 문서 3·4절)
  function openQuestion(c, kind = 'crystal'){
    const Q = GAME.question, b = g.boss;
    // 보스 마지막 페이즈의 마지막 보호막 칸 = 「복합 문제」(문장제, 06 문서 5절·08 문서 64행)
    const lastSeal = kind === 'seal' && b && b.phase >= b.def.phases.length - 1 && b.shield === 1;
    if (c && c.kind === 'empower') kind = 'power';
    // v1.6 방패병: 방패가 살아 있는 방패병이 있으면 수정 문제 = 그 방패의 빈칸 식(가장 가까운 방패병) → 정답이면 방패가 깨진다(06 문서 3절)
    let shieldE = null; if (kind === 'crystal') { let bd = Infinity; for (const e of g.enemies) if (e.shield && !e.shield.broken && e.shield.eq && e.state !== 'dead') { const d = Math.hypot(e.pos[0] - g.player.pos[0], e.pos[2] - g.player.pos[2]); if (d < bd) { bd = d; shieldE = e; } } if (shieldE) kind = 'shield'; }
    // v1.7 수정 골렘: 방패병이 없고 아직 덜 갈라진 골렘이 있으면 수정 문제 = 「골렘 깨기」(문제는 보통 계산형) → 정답이면 DEF −8
    let golemE = null; if (kind === 'crystal') { let bd = Infinity; for (const e of g.enemies) if (e.crack && e.crack.down < e.crack.max && e.state !== 'dead') { const d = Math.hypot(e.pos[0] - g.player.pos[0], e.pos[2] - g.player.pos[2]); if (d < bd) { bd = d; golemE = e; } } if (golemE) kind = 'golem'; }
    // v2.3 묶음 몬스터(15 문서 3절): 방패병·골렘이 없고 산 묶음이 있으면 수정 문제 = 「똑같이 나누기 공격」(share, 숫자는 그 묶음에서) → 정답이면 묶음 수만큼 정확 피해 탄
    let packQ = null; if (kind === 'crystal') { const pks = livePacks(); if (pks.length) { const pk = pks[0], grp = packGroup(pk); const concept = grp.concept || (c && c.retry ? 'g3.share.div' : rng.pick(PK.concepts)); packQ = { pk, grp, concept }; kind = 'share'; } }
    // 강화 문제 = 장착 주 마법의 「수학 연결」 유형(05 문서 12항) — 재도전 수정은 같은 개념 쉬운 문제(qe.retry 예약)
    const qv = qe.next(lastSeal ? { want: 'word' } : kind === 'shield' ? { fixed: { concept: 'g1.missing.add9', b: shieldE.shield.eq.b, c: shieldE.shield.eq.c } } : kind === 'share' ? { fixed: { concept: packQ.concept, n: packQ.grp.n, hpEach: packQ.grp.hpEach } } : kind === 'power' && !(c && c.retry) ? { want: GAME.empower.want[g.spell] || 'calc' } : {});
    if (c) { g.crystals = g.crystals.filter(x => x !== c); g.emit('crystal:break', { uid: c.uid, kind: c.kind, pos: v3(c.pos) }); }
    if (!qv) return;   // v2.3 생성기 0(변환표 학년 줄의 일반 생성기가 아직 없고 fallback 도 없음) = 수정만 사라지고 문제는 안 열림
    if (kind === 'seal' && g.boss) { g.boss.sealsAsked++; }
    const total = (Q.gaugeByType[qv.type] || Q.gaugeBase) * band.gaugeGrade * (Q.gaugeSetting[gaugeSetting] || 1) * (kind === 'power' ? (GAME.empower.gaugeMul[g.spell] || 1) : 1);
    // 힌트 1단계 자동: 봉인 문제 3번째부터 · 오답 뒤 재도전 문제(07 문서 8절)
    const hint0 = (kind === 'seal' && b && b.sealsAsked >= 3) || qv.retry || (kind === 'share' && c && c.retry) ? 1 : 0;
    g.q = { v: qv, kind, shieldUid: shieldE ? shieldE.uid : null, golemUid: golemE ? golemE.uid : null, packId: packQ ? packQ.pk.id : null, shareUids: packQ ? packQ.grp.uids : null, shareAmt: packQ ? packQ.grp.amount : 0, retryCrystal: !!(c && c.retry), state: 'open', openT: g.t, readUntil: g.t + band.readMs / 1000, gauge: 0, total, endAt: 0, picked: null, hint: hint0, hintT: g.t, cursorMoveT: g.t, lastCursor: g.cursor ? { x: g.cursor.x, y: g.cursor.y } : null };
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
      q.state = 'right'; q.endAt = g.t + Q.rightShow; g.stats.right++; g.lastRightT = g.gameT; if (q.kind === 'seal' && g.boss) sealBroken(g, g.boss); g.emit('q:right', { id: v.id, slot, mana: add, streak: g.streak }); gainXp(LV.xpQ, 'q'); g.emit('reward', { kind: 'mana', amount: add, pos: v3([P.pos[0], 1.2, P.pos[2]]) });
      if (q.kind === 'golem') { const e = g.enemies.find(x => x.uid === q.golemUid); if (e && e.crack && e.state !== 'dead') crackGolem(e); }
      if (q.kind === 'shield') { const e = g.enemies.find(x => x.uid === q.shieldUid); if (e) breakShield(e, true); g.toast = { key: 'toast.shieldBroke', t: g.t }; }
      if (q.kind === 'share') { g.stats.shareRight = (g.stats.shareRight || 0) + 1; fireShare(q.shareUids, q.shareAmt, v.answer); g.toast = { key: 'toast.shareGo', t: g.t }; }
      if (q.kind === 'power') { const EM = GAME.empower; g.empower = g.gameT + EM.t; g.empowerOn = true; g.stats.empowers = (g.stats.empowers || 0) + 1; g.emit('empower:on', { t: EM.t, mul: EM.mul, pos: v3([P.pos[0], 1, P.pos[2]]) }); g.toast = { key: 'toast.empowerOn', t: g.t }; } }
    else { g.streak = 0; P.mana = Math.min(P.manaMax, P.mana + Q.mana.wrong); q.state = 'wrong'; q.tag = (v.choices[slot] || {}).tag || 'other'; q.endAt = g.t + Q.wrongExplain + Q.revealShow;
      g.emit('q:wrong', { id: v.id, slot, tag: q.tag }); g.emit('reward', { kind: 'mana', amount: Q.mana.wrong, pos: v3([P.pos[0], 1.2, P.pos[2]]) });
      if (q.kind === 'power' && !q.retryCrystal) q.spawnRetry = true;   // 실패: 「다시 도전」 수정이 바로 1번 더(그것도 틀리면 다음 기회)
      if (q.kind === 'share') { g.stats.shareWrong = (g.stats.shareWrong || 0) + 1; scatterShare(q.shareUids.length); const pk = g.packs.find(p => p.id === q.packId); if (pk && !pk.retried && !q.retryCrystal) { pk.retried = true; q.spawnRetryShare = true; } } }   // v2.3 오답 = 탄 흩어짐·피해 0, 같은 묶음으로 쉬운 재도전 1번(15 문서 3절)
    if (r.stageUp) g.emit('mastery:up', { concept: v.concept, stage: r.stageUp });
    g.stats.log.push({ qid: v.id, concept: v.concept, fact: v.fact, type: v.type, correct: right, hint: q.hint, ms, choice: slot, via, mBefore: Math.round(r.before * 100) / 100, mAfter: Math.round(r.after * 100) / 100 });
  }
  function openHint(auto = false){ const q = g.q; if (!q || q.state !== 'open' || q.hint >= 2) return; q.hint++; q.hintT = g.t; g.stats.hints = (g.stats.hints || 0) + 1; sel.reset();
    g.emit('q:hint', { id: q.v.id, step: q.hint, auto }); }
  function closeQuestion(){ const q = g.q; g.stats.qTime += g.t - q.openT; g.q = null; g.questionOpen = false; g.screen = 'S08'; g.slowTo = 1; g.lastQClose = g.gameT; sel.reset();
    g.emit('q:close', { id: q.v.id }); g.emit('screen', { from: 'S08Q', to: 'S08' }); if (q.spawnRetry) spawnCrystal('empower', { retry: true }); if (q.spawnRetryShare) spawnCrystal('math', { retry: true }); }
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
  function targetsNow(){ const q = g.q;
    if (g.paused === 'user' && g.inputMode === 'camera' && layout.pauseMenu) { const M = layout.pauseMenu, list = g.spellList(), ts = []; const n = list.length, x0 = .5 - M.spell.w / 2 - (n - 1) * M.spell.gap / 2;
      if (n >= 2) list.forEach((id, i) => ts.push({ id: 'spell:' + id, slot: i, kind: 'menu', rect: { x: x0 + i * M.spell.gap, y: M.spell.y, w: M.spell.w, h: M.spell.h }, enabled: true }));
      ts.push({ id: 'resume', slot: -1, kind: 'menu', rect: M.resume.rect, enabled: true }); return ts; }
    if (g.screen === 'S08P') return puzzleTargets(g, layout);
    if (!q) return []; const open = q.state === 'open' && g.t >= q.readUntil;
    const ts = layout.choices3.map(c => ({ id: 'c' + c.slot, slot: c.slot, kind: 'choice', rect: c.rect, enabled: open }));
    if (layout.hint) ts.push({ id: 'hint', slot: -1, kind: 'hint', rect: layout.hint.rect, enabled: open && q.hint < 2 });   // 🦉 힌트 구슬(07 문서 8절)
    return ts; }

  // ── 웨이브(06·09 문서) — P1: 전투장 1개
  function updateWaves(dt){
    const z = g.zone; if (!z || g.endT || z.type === 'rail') return;
    if (z.type === 'boss') { if (g.boss && g.boss.state === 'dead' && g.boss.stateT > .8) victory(); return; }
    g.waveT += dt;
    const alive = g.enemies.filter(e => e.state !== 'dead'); const w = z.waves[g.waveIdx];
    if (w) { const go = w.at != null ? g.waveT >= w.at : (alive.length === 0 && (g.clearT == null ? (g.clearT = g.gameT, false) : g.gameT - g.clearT >= (w.delay || 1)));
      if (go) { let cnt = alive.length; let spawnList = w.spawn;
        // v2.3 묶음 파(변환표 packs, 15 문서 2절): 이 학년·전투장·파면 숫자 슬라임들이 묶음 한 무리로(다른 종류는 그대로), n = 학년 범위 안·남은 자리 안
        const pw = PACK_WAVES[z.id]; if (PACK_RANGE && Array.isArray(pw) && pw.includes(g.waveIdx) && w.spawn.some(s => s.kind === 'num-slime')) { spawnList = w.spawn.filter(s => s.kind !== 'num-slime'); const room = band.maxEnemies - alive.length - spawnList.length;
          const n = Math.max(0, Math.min(rng.int(PACK_RANGE.n[0], PACK_RANGE.n[1]), room)); if (n >= 2) { cnt += n; spawnPack(n, rng.int(PACK_RANGE.hpEach[0], PACK_RANGE.hpEach[1]), Math.max(...w.spawn.map(s => s.z))); } else spawnList = w.spawn; }
        for (const s of spawnList) { if (cnt >= band.maxEnemies) break; cnt++; const e = makeEnemy(data.enemies[s.kind], nid(), s.x, s.z, rng, band, { label: s.label }); g.enemies.push(e); g.emit('enemy:spawn', { uid: e.uid, kind: e.kind, pos: v3(e.pos), label: e.label }); if (e.def.ranged && !g.goblinSeen) { g.goblinSeen = true; g.toast = { key: 'toast.goblin', t: g.t }; } if (e.shield && !g.shieldSeen) { g.shieldSeen = true; g.toast = { key: 'toast.shieldGoblin', t: g.t }; } if (e.crack && !g.golemSeen) { g.golemSeen = true; g.toast = { key: 'toast.golem', t: g.t }; } }
        g.waveIdx++; g.waveT = 0; g.clearT = null; g.emit('wave', { idx: g.waveIdx, of: z.waves.length }); } }
    else if (alive.length === 0) { if (g.clearT == null) g.clearT = g.gameT; else if (g.gameT - g.clearT >= 1.2) { if (!nextZone()) victory(); } }
  }
  // 다음 구역(09 문서 3절) — 길 구간이 끝나거나 전투장을 비우면 1.2초 이음 뒤 다음으로
  function nextZone(){ return enterZone(g.zoneIdx + 1); }
  // 길 구간이 쓰는 손잡이(rail.js 는 이것만 안다)
  const railApi = { nid: () => nid(), hurtPlayer: (src, atk) => hurtPlayer(src, atk), nextZone: () => { if (!nextZone()) victory(); }, gainXp: (n, why) => gainXp(n, why),
    spawnEnemy: (kind, x, z) => { const alive = g.enemies.filter(e => e.state !== 'dead' && !e.boss).length; if (alive >= band.maxEnemies) return null; const e = makeEnemy(data.enemies[kind], nid(), x, z, rng, band); g.enemies.push(e); g.emit('enemy:spawn', { uid: e.uid, kind: e.kind, pos: v3(e.pos), label: e.label, rail: true }); return e; },
    get sel(){ return sel; }, get mastery(){ return qe.m; } };
  function victory(){ if (g.endT) return; g.checkpoint = null; if (g.q) closeQuestion(); gainXp(LV.xpClear, 'clear'); g.endT = g.t; setLower('A14'); g.player.anim.upper = null;
    // v1.6 깬 기록(별 수 최대값)·스테이지 보상 마법(09 문서 12행: 1-2 ICE STORM …) → progress 에 남아 다음 판부터 장착 가능
    const st = starsOf().filter(Boolean).length; prog.cleared[stage.id] = Math.max(prog.cleared[stage.id] || 0, st); g.rewardSpell = null;
    const rw = stage.reward && stage.reward.spell; if (rw && !prog.unlocked.includes(rw)) { prog.unlocked.push(rw); g.rewardSpell = rw; if (!g.unlocked.has(rw)) { g.unlocked.add(rw); g.emit('reward', { kind: 'spell', spell: rw, amount: 1, pos: v3([g.player.pos[0], 1.4, g.player.pos[2]]) }); } }
    // v1.8 결정(09 문서 12행 「보스: 수의 결정」·1절 「보스 후 결정 복구 장면」): progress.crystals 에 한 번만, 결과·stage:clear 에 crystal
    const cr = stage.reward && stage.reward.crystal; g.rewardCrystal = null; if (cr && !prog.crystals.includes(cr)) { prog.crystals.push(cr); g.rewardCrystal = cr; g.emit('reward', { kind: 'crystal', crystal: cr, amount: 1, pos: v3([g.player.pos[0], 1.6, g.player.pos[2]]) }); }
    g.emit('stage:clear', { stage: stage.id, stars: st, reward: g.rewardSpell, crystal: g.rewardCrystal, final: !!stage.final }); }
  function defeat(){ if (g.endT) return; g.endT = g.t; g.deaths++; g.stats.deaths = g.deaths; setLower('A15'); g.player.anim.upper = null; if (g.q) { g.q = null; g.questionOpen = false; } g.slowTo = 1; g.emit('player:defeat', {}); }

  // ── 입력 처리
  function handle(ev){
    const P = g.player, v = ev.value || {};
    if (ev.type === 'PAUSE') { if (g.screen === 'S08' || g.screen === 'S08Q' || g.screen === 'S08P') g.paused = g.paused ? null : 'user'; return; }
    if (ev.type === 'CURSOR') { g.cursor = v.x == null ? null : { x: v.x, y: v.y }; return; }
    if (ev.type === 'LOST') { g.bodyLost = true; g.lostT = g.t; g.toast = { key: 'toast.showBody', t: g.t }; return; }
    if (ev.type === 'FOUND') { g.bodyLost = false; if (g.paused === 'body') g.resumeAt = g.t + .4; return; }
    if (ev.type === 'SWAP') { g.toast = { key: 'toast.oneOnly', t: g.t }; return; }
    if (ev.type === 'HAND_LOST') { g.toast = { key: 'toast.showHand', t: g.t }; return; }
    if (g.paused === 'user' && ev.type === 'SELECT' && typeof v.id === 'string') { if (v.id === 'resume') g.paused = null; else if (v.id.startsWith('spell:')) g.setSpell(v.id.slice(6)); return; }
    if (g.paused || g.endT) return;
    if (g.screen === 'S08Q') { if (ev.type === 'HINT' || (ev.type === 'SELECT' && v.id === 'hint')) openHint(false); else if (ev.type === 'SELECT' && v.slot >= 0) answer(v.slot, ev.via); return; }
    if (g.screen === 'S08P') { if (ev.type === 'SELECT' && v.slot >= 0) puzzlePick(g, railApi, v.slot, ev.via); else if (ev.type === 'MOVE' && g.puzzle && g.puzzle.cur && g.puzzle.cur.type === 'size-gate') P.targetX = clamp(v.u, -1, 1) * GAME.rail.xMax; return; }
    if (g.screen !== 'S08') return;
    const hurt = g.gameT < P.hurtUntil;
    switch (ev.type) {
      case 'MOVE': P.targetX = clamp(v.u, -1, 1) * (g.rail ? GAME.rail.xMax : GAME.player.xMax); break;
      case 'DODGE': if (g.gameT >= P.dodgeReady && !P.block) { const D = GAME.player.dodge; P.dodge = { from: P.pos[0], to: clamp(P.pos[0] + v.dir * D.dist, -(g.rail ? GAME.rail.xMax : GAME.player.xMax), g.rail ? GAME.rail.xMax : GAME.player.xMax), t0: g.gameT }; P.invulnUntil = Math.max(P.invulnUntil, g.gameT + D.invuln); P.dodgeReady = g.gameT + D.cd; P.targetX = P.dodge.to; setLower('A05'); P.lastDodgeT = g.gameT; g.emit('dodge', { dir: v.dir, perfect: false }); if (P.charging) P.charging.ratio *= .5; } break;
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
    if (g.bodyLost && !g.paused && (g.screen === 'S08' || g.screen === 'S08Q' || g.screen === 'S08P') && g.t - g.lostT > 1.5) g.paused = 'body';
    if (g.paused === 'body' && g.resumeAt && g.t >= g.resumeAt) { g.paused = null; g.resumeAt = 0; }
    if (g.toast && g.t - g.toast.t > 2.2) g.toast = null;
    if (g.paused === 'user' && g.inputMode === 'camera') sel.update(g.cursor, targetsNow(), g.t * 1000, g.aspect || 16 / 9);   // 손 유지 마법 바퀴(v1.3)
    if (g.paused) return;
    // 슬로(07 3-1): 들어갈 때 .2초, 나올 때 .25초
    const Q = GAME.question; if (g.slow !== g.slowTo) { const rate = (1 - Q.slowTo) / (g.slowTo < g.slow ? Q.slowIn : Q.slowOut); g.slow = g.slowTo < g.slow ? Math.max(g.slowTo, g.slow - rate * dt) : Math.min(g.slowTo, g.slow + rate * dt); }
    const gdt = dt * g.slow; g.gameT += gdt; g.trauma = Math.max(0, g.trauma - GAME.shake.decay * dt);
    if (g.endT) { if (g.t - g.endT > (g.player.hp > 0 ? 2.0 : 1.6) && g.screen !== 'S13' && g.screen !== 'S14') { g.screen = g.player.hp > 0 ? 'S13' : 'S14'; g.emit('screen', { from: 'S08', to: g.screen }); } }
    stepPlayer(gdt); stepRail(g, railApi, gdt); stepPuzzle(g, railApi, dt, layout); updateWaves(gdt); updateCrystals(gdt); updateQuestion(dt);
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
    const frozen = g.screen === 'S08Q' || (g.screen === 'S08P' && !(g.puzzle && g.puzzle.cur && g.puzzle.cur.type === 'size-gate')), xMax = g.rail ? GAME.rail.xMax : C.xMax;
    if (P.dodge) { const k = Math.min(1, (g.gameT - P.dodge.t0) / C.dodge.dur); const e = 1 - (1 - k) * (1 - k); P.pos[0] = P.dodge.from + (P.dodge.to - P.dodge.from) * e; P.vel[0] = 0; if (k >= 1) P.dodge = null; }
    else if (!frozen) {
      const mul = P.block ? C.blockMul : P.charging ? C.chargeMul : 1, vmax = C.vMax * mul;
      const d = P.targetX - P.pos[0], vDes = clamp(d / C.nearR * vmax, -vmax, vmax);   // 목표 근처 .2m 안이면 거리 비례 감속 → 오버슈트 0
      if (Math.abs(vDes) < Math.abs(P.vel[0]) || Math.sign(vDes) !== Math.sign(P.vel[0])) P.vel[0] = vDes; else P.vel[0] += clamp(vDes - P.vel[0], -C.accel * dt, C.accel * dt);
      P.pos[0] = clamp(P.pos[0] + P.vel[0] * dt, -xMax, xMax);
    } else P.vel[0] = 0;
    P.pos[2] = g.rail ? 0 : C.arcK * P.pos[0] * P.pos[0];   // 전투장 호 · 길 구간은 z=0 고정(길이 다가옴)
    if (P.charging) P.charging.ratio = Math.min(1, P.charging.ratio);
    // 하체 애니메이션
    const a = P.anim, sp = Math.abs(P.vel[0]); const oneShot = { A05: dur('A05'), A12: dur('A12'), A14: dur('A14'), A15: dur('A15') };
    const busy = oneShot[a.lower] && g.gameT - a.t0 < oneShot[a.lower];
    if (!busy && !g.endT) { const want = P.duck ? 'A06' : sp > .2 ? 'A04' : 'A01'; if (a.lower !== want) { a.lower = want; a.t0 = g.gameT; } }
    if (a.upper && ['A07', 'A08', 'A10', 'A16', 'A17'].includes(a.upper) && g.gameT - a.ut0 >= dur(a.upper)) a.upper = P.charging ? 'A09' : P.block ? 'A11' : null;
  }
  function stepProjectiles(dt){
    const keep = [];
    const P = g.player, AC = GAME.acorn;
    for (const p of g.projectiles) {
      const tgt = g.enemies.find(e => e.uid === p.target && e.state !== 'dead'); steer(p, tgt, dt);
      for (let i = 0; i < 3; i++) p.pos[i] += p.vel[i] * dt; p.left -= Math.hypot(p.vel[0], p.vel[2]) * dt;
      let gone = p.left <= 0 || p.pos[1] < 0.05;
      if (p.owner !== 'player') {   // 적 투사체(도토리): 플레이어만 맞춤. 숙이면 머리 위로 지나감 · 날아오는 중 회피하면 「멋진 회피」
        if (!p.resolved && !gone) { const d = Math.hypot(P.pos[0] - p.pos[0], P.pos[2] - p.pos[2]);
          if (d <= p.r + GAME.player.hurtR && !P.duck) { p.resolved = true; gone = true; hurtPlayer(p, p.atk); g.emit('projectile:hit', { uid: p.uid, target: 'player' }); }
          else if (p.pos[2] < P.pos[2] - .3 || d <= p.r + GAME.player.hurtR && P.duck) { p.resolved = true;
            const dodged = P.duck || (P.lastDodgeT || -9) >= p.bornT;   // 날아오는 중(발사 뒤) 회피했거나 숙인 채면 「멋진 회피」
            if (dodged) { P.mana = Math.min(P.manaMax, P.mana + AC.dodgeMana); g.stats.niceDodges = (g.stats.niceDodges || 0) + 1; g.emit('dodge', { dir: 0, perfect: true, duck: !!P.duck, acorn: true }); g.emit('reward', { kind: 'mana', amount: AC.dodgeMana, pos: v3([P.pos[0], 1.2, P.pos[2]]) }); } } }
        if (!gone) keep.push(p); else g.emit('projectile:end', { uid: p.uid }); continue; }
      for (const e of g.enemies) { if (gone || e.state === 'dead' || e.state === 'spawn' || p.hitSet.includes(e.uid)) continue;
        const dx = e.pos[0] - p.pos[0], dz = e.pos[2] - p.pos[2], dy = (e.h * .5) - p.pos[1];
        if (Math.hypot(dx, dz) <= p.r + e.r && Math.abs(dy) <= e.h * .5 + p.r + .3) { p.hitSet.push(e.uid);
          if (p.kind === 'fireball') { gone = true; explode(p); }
          else if (p.kind === 'share') { if (p.scatter) continue; if (e.uid === p.target) { exactHitEnemy(e, p.exact); gone = true; } else p.hitSet.pop(); }   // v2.3 share 탄은 제 목표만 맞춤(정확 피해), 흩어진 탄은 아무것도 안 맞춤
          else { hitEnemy(e, p.mult, 'bolt', 1, [p.pos[0] - p.vel[0] * .2, 0, p.pos[2] - p.vel[2] * .2]); if (p.pierce > 0) p.pierce--; else gone = true; } } }
      if (!gone && p.kind === 'share' && !p.scatter && !tgt) gone = true;   // 목표가 먼저 죽으면 사라짐
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
    const q = g.q, railSnap = railSnapshot(g, r3, v3); const snap = {
      t: r3(g.t), gameT: r3(g.gameT), slow: r3(g.slow), screen: g.screen, paused: g.paused,
      world: { id: 'forest', stage: stage.id, stageName: stage.nameKo, heart: !!(g.zone && g.zone.heart), final: !!stage.final, crystals: prog.crystals.slice(), dark: !!(g.zone && g.zone.dark), light: g.zone && g.zone.dark ? GAME.rail.dark.light : null, zone: g.zone ? g.zone.type : 'arena', zoneIdx: g.zoneIdx, arenaNo: g.zone && g.zone.type === 'arena' ? arenaNoOf(g.zoneIdx) : 0, arenas: stage.zones.filter(z => z.type === 'arena').length, railProgress: g.rail ? r3(g.rail.dist / g.rail.len) : 0, rail: railSnap.rail, seed, wave: g.waveIdx, waves: g.zone && g.zone.waves ? g.zone.waves.length : 0 },
      player: { id: P.id, pos: v3(P.pos), yaw: 0, vel: v3(P.vel), anim: { lower: a.lower, upper: a.upper, phase: r3(lowerPhase), upperPhase: a.upper ? r3(a.upper === 'A09' ? (P.charging ? P.charging.ratio : 1) : ph(a.upper, a.ut0)) : 0, speed: r3(Math.abs(P.vel[0]) / GAME.player.vMax) },
        hp: P.hp, hpMax: P.hpMax, mana: Math.round(P.mana), manaMax: P.manaMax, charging: P.charging ? { spell: P.charging.spell, ratio: r3(P.charging.ratio) } : null,
        blocking: P.block, ducking: P.duck, hopping: !!(P.hopUntil && g.gameT < P.hopUntil), invuln: g.gameT < P.invulnUntil, hurtT: r3(Math.max(0, P.hurtUntil - g.gameT)), empowered: g.empower > g.gameT, empowerT: r3(Math.max(0, (g.empower - g.gameT) / GAME.empower.t)),
        castReady: g.gameT >= P.castReady && g.gameT >= (P.cd[currentSpell(g)] || 0), spell: currentSpell(g), main: g.spell, spells: g.spellList(), spellCost: spells[currentSpell(g)].mp,
        level: prog.level, xp: prog.xp, xpNext: LV.need(prog.level), arcana: P.arcana && g.gameT < P.arcana.until ? { ratio: r3((P.arcana.until - g.gameT) / P.arcana.t), nullify: P.arcana.nullify } : null, shieldReady: g.unlocked.has('shield') && P.mana >= spells.shield.mp && g.gameT >= (P.cd.shield || 0), outfit: P.outfit, feather: P.feather },
      enemies: g.enemies.filter(e => !e.boss).map(e => ({ uid: e.uid, kind: e.kind, pos: v3(e.pos), yaw: r3(e.yaw), scale: e.scale, state: e.state, stateT: r3(e.stateT), hp: e.hp, hpMax: e.hpMax, label: e.label,
        telegraph: e.telegraph ? { shape: e.telegraph.shape, center: v3(e.telegraph.center), size: e.telegraph.size, yaw: e.telegraph.yaw != null ? r3(e.telegraph.yaw) : 0, t0: r3(e.telegraph.t0), t1: r3(e.telegraph.t1) } : null, tags: e.tags,
        shield: e.shield ? { hp: e.shield.hp, hpMax: e.shield.hpMax, up: e.shield.up && !e.shield.broken, broken: e.shield.broken, byMath: e.shield.byMath, eq: e.shield.eq ? `□ + ${e.shield.eq.b} = ${e.shield.eq.c}` : null } : null,
        crack: e.crack ? { down: e.crack.down, max: e.crack.max, ratio: r3(e.crack.down / e.crack.max), def: e.def.def - e.crack.down } : null, pack: e.pack ? { id: e.pack.id, n: e.pack.n, hpEach: e.pack.hpEach } : null })),
      packs: g.packs.filter(pk => !pk.cleared).map(pk => { const al = packAlive(pk); return { id: pk.id, n: pk.n, hpEach: pk.hpEach, total: pk.total, alive: al.length, sum: al.reduce((a, e) => a + e.hp, 0), uids: al.map(e => e.uid), retried: pk.retried }; }),
      boss: bossSnapshot(g, g.boss, r3, v3),
      projectiles: g.projectiles.map(p => ({ uid: p.uid, kind: p.kind, pos: v3(p.pos), vel: v3(p.vel), owner: p.owner, label: p.label || null, r: r3(p.r), exact: p.exact || 0, scatter: !!p.scatter })),
      areas: g.areas.map(x => ({ uid: x.uid, kind: x.kind, pos: x.pos, radius: x.radius, t0: r3(x.t0), t1: r3(x.t1) })),
      crystals: g.crystals.map(c => ({ uid: c.uid, kind: c.kind, pos: v3(c.pos), near: Math.abs(c.pos[0] - P.pos[0]) <= GAME.crystal.reach, retry: !!c.retry, life: c.kind === 'empower' ? r3(Math.max(0, 1 - (g.gameT - c.born) / GAME.empower.life)) : 1 })),
      pickups: [], obstacles: railSnap.obstacles, puzzle: puzzleSnapshot(g, r3),
      question: q ? { id: q.v.id, type: q.v.type, concept: q.v.concept, kind: q.kind, shieldUid: q.shieldUid || null, golemUid: q.golemUid || null, packId: q.packId || null, shareUids: q.shareUids || null, prompt: q.v.prompt, state: q.state, hintStep: q.hint, gauge: r3(Math.min(1, q.gauge)), gaugeOn: Number.isFinite(q.total),
        readP: r3(clamp((g.t - q.openT) / Math.max(.01, q.readUntil - q.openT), 0, 1)), picked: q.picked,
        reveal: q.state === 'right' || (q.state === 'wrong' && g.t >= q.endAt - GAME.question.revealShow) ? q.v.correctSlot : null,
        explain: q.state === 'wrong' ? (q.v.type === 'word1' && ['add-instead', 'sub-instead'].includes(q.tag) ? 'why.word.' : 'why.') + q.tag : null, choices: q.v.choices.map(c => ({ id: c.id, num: c.num, targetId: 'c' + c.slot })),
        hint: q.hint >= 1 && q.v.hint1 ? q.v.hint1 : null, hintPic: q.hint >= 2 && q.v.hint2 ? q.v.hint2 : null } : null,
      targets: q || g.paused === 'user' || g.screen === 'S08P' ? targetsNow().map(x => ({ id: x.id, kind: x.kind, rect: x.rect, hover: r3(sel.hover[x.id] || 0), locked: !x.enabled })) : [],
      input: { cursor: g.cursor, mode: g.inputMode, body: g.bodyLost ? 'lost' : 'ok', calibrating: false, preview: g.preview || null },
      camera: { mode: q ? 'q' : g.screen === 'S08P' ? 'puzzle' : g.rail ? 'rail' : g.boss && g.boss.state === 'intro' ? 'boss-intro' : 'arena', target: v3([P.pos[0], 1, P.pos[2]]), shake: r3(g.trauma * g.trauma) },
      toast: g.toast ? g.toast.key : null, streak: g.streak,
      result: g.endT ? { win: P.hp > 0, kills: g.stats.kills, q: g.stats.q, right: g.stats.right, time: Math.round(g.t - g.stats.startT), keyboard: g.stats.keyboard, deaths: g.deaths, xp: g.stats.xp, level: prog.level, levelUps: g.stats.levelUps.slice(), empowers: g.stats.empowers || 0, splits: g.stats.splits || 0, niceDodges: g.stats.niceDodges || 0,
        fireflies: g.stats.fireflies || 0, chests: g.stats.chests || 0, gold: g.stats.gold || 0, puzzles: g.stats.puzzles || 0, puzzleRight: g.stats.puzzleRight || 0, obstaclesHit: g.stats.obstaclesHit || 0, nicePasses: g.stats.nicePasses || 0, bounces: g.stats.bounces || 0, shields: g.stats.shields || 0, cracks: g.stats.cracks || 0, packClears: g.stats.packClears || 0, shareRight: g.stats.shareRight || 0, shareWrong: g.stats.shareWrong || 0, stars: starsOf(), reward: g.rewardSpell || null, crystal: g.rewardCrystal || null, final: !!stage.final } : null,
    };
    return freeze ? deepFreeze(snap) : snap;
  };
  g.drainEvents = () => bus.drain();
  g.restart = () => { const cp = g.checkpoint; g.keepStats = false; resetRun(); g.zoneStartT = g.gameT; g.firstCrystal = false;
    if (cp && cp.zone === 'boss') enterBoss(cp.phase); else if (cp && cp.idx > 0) enterZone(cp.idx); };   // 지면 들어갔던 구역부터(보스는 그 페이즈)
  // 별 3개(09 문서 4-1): ① 클리어 ② 반딧불 7마리↑ ③ 정답률 70%↑ — 속도·처치수로는 안 줌
  function starsOf(){ const st = g.stats, qn = st.q + (st.puzzles || 0), rn = st.right + (st.puzzleRight || 0); return [g.player.hp > 0, (st.fireflies || 0) >= (stage.stars && stage.stars.fireflies || 7), qn > 0 && rn / qn >= (stage.stars && stage.stars.accuracy || .7)].map(Boolean); }
  g.jumpZone = zi => enterZone(zi);   // 시험·?zone=n 용
  g.wantsPose = () => g.screen === 'S08' || (g.screen === 'S08P' && !!(g.puzzle && g.puzzle.cur && g.puzzle.cur.type === 'size-gate'));   // 보스에서 지면 그 페이즈부터(06 5절) · 전투장 2에서 지면 전투장 2부터
  g.stageId = stage.id; g.qe = qe; g.answer = answer; g.targetsNow = targetsNow; g.progress = prog;
  resetRun(); g.zoneStartT = 0; if (startZone > 0) { enterZone(startZone); g.checkpoint = null; }   // 시험용: 전투장부터 시작(?zone=n)
  return g;
}
