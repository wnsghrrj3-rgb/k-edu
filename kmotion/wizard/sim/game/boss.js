// 보스 「숫자 골렘」(06 문서 4·5절) — 3페이즈 · 수학 보호막(봉인 문제) · 약점 시간 · 페이즈 체크포인트
// 그림 없음. 게임(game.js)이 g.enemies 안의 boss:true 적을 이 모듈로 돌린다. 모든 공격은 예고(telegraphs[])가 먼저다
import { GAME } from './config.js';
import { makeWall, makeWarmWall, makeMirror } from '../learn/guardian.js';   // v2.15 기하학 수호신(모양 벽·거울 분신)
const B = GAME.boss;

export function makeBoss(def, uid, phase = 0){
  const b = { uid, kind: def.kind, def, boss: true, pos: [def.spawn.x, 0, def.spawn.z], yaw: Math.PI, scale: 1, h: def.height, r: def.body,
    state: 'intro', stateT: 0, phase, phaseHp: def.phases.map(p => p.hp), hp: def.phases[phase].hp, hpMax: def.phases[phase].hp,
    shield: 0, shieldMax: 0, sealsAsked: 0, weakUntil: 0, attack: null, tgs: [], lastAtk: 0, lastKind: null, dash: null, hitDone: false,
    telegraph: null, token: false, label: null, tags: ['boss'], slot: 0, wall: null, mirror: null, beam: null, holdUntil: 0, stunUntil: 0, qSeen: false, wallDue: false };   // v2.15 wall·mirror·beam = 수호신 공격 상태
  for (let i = 0; i < phase; i++) b.phaseHp[i] = 0;
  return b;
}
const ph = b => b.def.phases[b.phase];
const cycleOf = (g, b) => ph(b).cycle * (g.grade <= 2 ? B.lowCycleMul : 1);
const windOf = (g, b, kind) => b.def.attacks[kind].windup * g.band.windup;

// 페이즈 시작: 보호막 칸 펴기
function startPhase(g, b){
  const P = ph(b); b.hp = b.hpMax = b.phaseHp[b.phase] = P.hp; b.shield = b.shieldMax = P.shield; b.sealsAsked = 0; b.lastAtk = g.gameT; b.state = 'chase'; b.stateT = 0;
  g.checkpoint = { zone: 'boss', phase: b.phase };
  if (b.shield) g.emit('boss:shield', { uid: b.uid, n: b.shield, max: b.shieldMax });
}
function clearTgs(g, b){ if (b.tgs.length) g.emit('telegraph:end', { uid: b.uid }); b.tgs = []; b.attack = null; b.dash = null; b.telegraph = null; b.beam = null; if (b.wall) { b.wall = null; g.emit('boss:wallEnd', { uid: b.uid }); } }

export function stepBoss(g, b, dt){
  const P = g.player; b.stateT += dt;
  const dx = P.pos[0] - b.pos[0], dz = P.pos[2] - b.pos[2], dist = Math.hypot(dx, dz) || 1;
  const set = s => { b.state = s; b.stateT = 0; };
  switch (b.state) {
    case 'intro': if (b.stateT >= B.introT) { startPhase(g, b); } return;
    case 'dead': return;
    case 'phase': if (b.stateT >= B.phaseT) { b.phase++; startPhase(g, b); g.emit('boss:phase', { uid: b.uid, phase: b.phase }); } return;
    case 'kneel': if (g.gameT >= b.weakUntil) { set('chase'); b.lastAtk = g.gameT - cycleOf(g, b) * .5; g.emit('boss:weak', { uid: b.uid, on: false }); } return;
    // v2.15 거울 분신: 셋이 멈춰 있음(5초) — 진짜를 맞히면 game.js 가 bossMirrorHit 로 끝냄, 시간이 다 되면 셋이 동시에 광선
    case 'hold': { b.yaw = Math.atan2(dx, dz); if (g.gameT >= b.holdUntil) beginTriBeam(g, b); return; }
    case 'stun': if (g.gameT >= b.stunUntil) { set('chase'); b.lastAtk = g.gameT - cycleOf(g, b) * .3; } return;
    case 'chase': {
      b.yaw = Math.atan2(dx, dz);
      const want = [P.pos[0] * .6, 0, Math.min(B.zMax, P.pos[2] + B.keep)];
      const mx = want[0] - b.pos[0], mz = want[2] - b.pos[2], md = Math.hypot(mx, mz), sp = ph(b).speed * g.band.speed * (b.slowUntil > g.gameT ? b.slowMul : 1);
      if (md > .1) { const s = Math.min(md, sp * dt); b.pos[0] += mx / md * s; b.pos[2] += mz / md * s; }
      // 크리스털 문제 중엔 새 공격을 시작하지 않는다(봉인 문제 중엔 계속 — 06 4절)
      const crystalQ = g.q && g.q.kind !== 'seal';
      // v2.15 모양 벽은 문제가 열려 있으면 못 내니(몸이 멈춤) 2페이즈부터는 봉인 문제가 닫힌 직후 다음 공격 = 벽(「벽 = 자리로 답하기」가 보호막 사이사이에 꼭 나오게)
      if (g.q) b.qSeen = true; else if (b.qSeen) { b.qSeen = false; if (b.phase >= 1 && ph(b).attacks.includes('wall')) b.wallDue = true; }
      if (!crystalQ && g.gameT - b.lastAtk >= cycleOf(g, b)) begin(g, b, dx / dist, dz / dist);
      return;
    }
    case 'windup': if (g.gameT >= b.tgs[0].t1) { set('attack'); strike(g, b); } return;
    case 'attack': {
      if (b.dash) { const k = Math.min(1, b.stateT / B.dashT); b.pos[0] = b.dash.from[0] + (b.dash.to[0] - b.dash.from[0]) * k; b.pos[2] = b.dash.from[2] + (b.dash.to[2] - b.dash.from[2]) * k;
        if (!b.hitDone && segHit(P.pos, b.dash.from, b.pos, b.dash.w / 2 + GAME.player.hurtR)) { b.hitDone = true; g.bossHit(b, b.def.attacks.charge.dmg); } }
      if (b.stateT >= (b.attack === 'charge' ? B.dashT + .1 : b.def.attacks[b.attack].dur)) { const tri = b.attack === 'beam' && b.mirror; clearTgs(g, b); if (tri) { b.mirror = null; g.emit('boss:mirrorEnd', { uid: b.uid, real: null }); } b.lastAtk = g.gameT; set('recover'); }   // v2.15 분신 셋의 광선이 끝나면 분신도 사라짐
      return; }
    case 'recover': if (b.stateT >= B.recover) set('chase'); return;
  }
}
function begin(g, b, ux, uz){
  const list = ph(b).attacks.filter(k => k !== b.lastKind || ph(b).attacks.length === 1); const kind = b.wallDue && !g.q && list.includes('wall') ? 'wall' : g.rng.pick(list); b.wallDue = false; b.lastKind = kind; b.attack = kind; b.hitDone = false;
  const A = b.def.attacks[kind], t0 = g.gameT, t1 = t0 + windOf(g, b, kind), P = g.player, X = GAME.player.xMax;
  if (kind === 'slam') b.tgs = [{ shape: 'circle', center: [b.pos[0] + ux * A.reach, 0, b.pos[2] + uz * A.reach], size: [A.radius], t0, t1 }];
  else if (kind === 'charge') { const len = Math.max(2, Math.hypot(P.pos[0] - b.pos[0], P.pos[2] - b.pos[2]) + A.over), to = [b.pos[0] + ux * len, 0, b.pos[2] + uz * len]; to[2] = Math.max(to[2], P.pos[2] - 1.5);
    b.dash = { from: b.pos.slice(), to, w: A.width }; b.tgs = [{ shape: 'line', center: [(b.pos[0] + to[0]) / 2, 0, (b.pos[2] + to[2]) / 2], size: [A.width, Math.hypot(to[0] - b.pos[0], to[2] - b.pos[2])], yaw: Math.atan2(to[0] - b.pos[0], to[2] - b.pos[2]), t0, t1 }]; }
  else if (kind === 'rocks') { const xs = [P.pos[0], P.pos[0] - A.gap, P.pos[0] + A.gap].map(x => Math.max(-X, Math.min(X, x)));
    b.tgs = xs.map((x, i) => ({ shape: 'circle', center: [x, 0, GAME.player.arcK * x * x + (i ? g.rng.range(-.4, .4) : 0)], size: [A.radius], t0, t1, label: String(g.rng.int(1, 9)) })); }
  else if (kind === 'quake') b.tgs = [{ shape: 'ring', center: [b.pos[0], 0, b.pos[2]], size: [A.radius], t0, t1, avoid: 'duck' }];
  // v2.15 기하학 수호신(16 문서 9-3): 광선(제자리에서 바닥 직선 띠) · 모양 벽(구멍 3, 몸 x 자리 = 답) · 거울 분신(섞임 예고 → hold)
  else if (kind === 'beam') { const len = Math.max(3, Math.hypot(P.pos[0] - b.pos[0], P.pos[2] - b.pos[2]) + 4), to = [b.pos[0] + ux * len, 0, b.pos[2] + uz * len];
    b.beam = { from: b.pos.slice(), to, w: A.width }; b.tgs = [{ shape: 'line', center: [(b.pos[0] + to[0]) / 2, 0, (b.pos[2] + to[2]) / 2], size: [A.width, len], yaw: Math.atan2(to[0] - b.pos[0], to[2] - b.pos[2]), t0, t1, beam: true }]; g.toast = { key: 'toast.beam', t: g.t }; }
  else if (kind === 'wall') { if (g.q) { b.lastAtk = g.gameT - cycleOf(g, b) * .6; b.attack = null; return; }   // 문제가 열려 있으면 벽은 안 낸다(몸으로 답해야 하니까) — 조금 뒤 다른 공격
    const W = b.phase === 0 ? makeWarmWall(g.rng) : makeWall(g.rng, g.grade); b.wall = W; b.wall.judged = false;
    b.tgs = [{ shape: 'wall', center: [0, 0, b.pos[2] - 1.2], size: [X * 2, A.windup], yaw: 0, t0, t1, holes: W.holes.map(h => ({ pic: h.pic, x: h.x })) }];
    g.emit('boss:wall', { uid: b.uid, holes: W.holes.map(h => ({ pic: h.pic, x: h.x })), answerPic: W.answerPic, concept: W.concept, name: W.name, toast: W.toast, t1 }); }
  else if (kind === 'mirror') { const M = makeMirror(g.rng, g.grade); b.mirror = M; b.mirror.hit = []; b.tgs = [{ shape: 'mirror', center: [0, 0, b.pos[2]], size: [3], t0, t1 }]; g.toast = { key: 'toast.mirror', t: g.t }; }
  b.telegraph = b.tgs[0]; b.state = 'windup'; b.stateT = 0;
  g.emit('telegraph:start', { uid: b.uid, shape: b.tgs[0].shape, t1, attack: kind, n: b.tgs.length });
  if (kind === 'quake') g.toast = { key: 'toast.duck', t: g.t };
}
function strike(g, b){
  const P = g.player, A = b.def.attacks[b.attack]; g.emit('enemy:attack', { uid: b.uid, kind: b.kind, attack: b.attack });
  if (b.attack === 'charge') { b.dash.from = b.pos.slice(); return; }   // 돌진은 attack 동안 판정
  if (b.attack === 'beam') { for (const t of b.tgs) { const sx = Math.sin(t.yaw), sz = Math.cos(t.yaw), hl = t.size[1] / 2, from = [t.center[0] - sx * hl, 0, t.center[2] - sz * hl], to = [t.center[0] + sx * hl, 0, t.center[2] + sz * hl]; if (segHit(P.pos, from, to, t.size[0] / 2 + GAME.player.hurtR)) { g.bossHit(b, A.dmg); break; } } return; }
  if (b.attack === 'wall') { const W = b.wall; if (!W || W.judged) return; W.judged = true;   // 예고 끝 순간의 몸 x 한 번만(흔들림으로 두 번 맞지 않게)
    if (g.q) { g.emit('boss:wallPass', { uid: b.uid, ok: true, free: true, slot: -1 }); return; }   // 벽이 오는 동안 봉인 문제가 열렸으면 그냥 지나감(보상 없음)
    let slot = 0, bd = Infinity; W.holes.forEach((h, i) => { const d = Math.abs(P.pos[0] - h.x); if (d < bd) { bd = d; slot = i; } });
    const ok = slot === W.answer && bd <= 1.3 + (W.holes.length === 1 ? .3 : 0);
    g.stats.walls = (g.stats.walls || 0) + 1; if (W.answerPic) g.stats.log.push({ qid: 'wall:' + W.fact, concept: W.concept, fact: W.fact, type: 'wall', correct: ok, hint: 0, ms: Math.round(A.windup * g.band.windup * 1000), choice: slot, via: 'body', mBefore: 0, mAfter: 0 });
    if (ok) { g.stats.wallPass = (g.stats.wallPass || 0) + 1; g.toast = { key: 'toast.wallPass', t: g.t }; P.mana = Math.min(P.manaMax, P.mana + 5); g.emit('dodge', { dir: 0, perfect: true, duck: false, wall: true }); g.emit('reward', { kind: 'mana', amount: 5, pos: [P.pos[0], 1.2, P.pos[2]] }); g.emit('boss:wallPass', { uid: b.uid, ok: true, slot }); }
    else { g.bossHit(b, A.dmg); g.trauma = Math.min(GAME.shake.max, g.trauma + .4); g.toast = { key: W.answerPic ? 'toast.wallHit' : 'toast.wall.warm', t: g.t }; g.emit('boss:wallPass', { uid: b.uid, ok: false, slot, answer: W.answer, name: W.name }); }   // 뒤로 밀림(push)은 전투장 z 가 호로 고정이라 코드 0(수치만 남김)
    return; }
  if (b.attack === 'mirror') { const M = b.mirror; b.state = 'hold'; b.stateT = 0; b.holdUntil = g.gameT + A.hold; clearTgs(g, b); b.attack = 'mirror'; b.lastAtk = g.gameT;
    g.emit('boss:mirror', { uid: b.uid, bodies: M.bodies.map(m => ({ x: m.x, pic: m.pic })), pic: M.pic, concept: M.concept, name: M.name, t: A.hold }); return; }
  if (b.attack === 'quake') { if (!P.duck) g.bossHit(b, A.dmg); else g.emit('dodge', { dir: 0, perfect: true, duck: true }); g.trauma = Math.min(GAME.shake.max, g.trauma + .5); return; }
  for (const t of b.tgs) { if (Math.hypot(P.pos[0] - t.center[0], P.pos[2] - t.center[2]) <= t.size[0] + GAME.player.hurtR) { g.bossHit(b, A.dmg); break; } }
  if (b.attack === 'slam') g.trauma = Math.min(GAME.shake.max, g.trauma + .3);
}
// v2.15 분신 5초 끝: 셋이 동시에 광선(몸 x 각각에서 곧게) — 분신은 광선이 끝날 때 사라짐
function beginTriBeam(g, b){
  const A = b.def.attacks.beam, t0 = g.gameT, t1 = t0 + windOf(g, b, 'beam'), P = g.player, len = Math.max(3, b.pos[2] - P.pos[2] + 4);
  b.attack = 'beam'; b.hitDone = false; b.lastKind = 'beam';
  b.tgs = b.mirror.bodies.map(m => ({ shape: 'line', center: [m.x, 0, b.pos[2] - len / 2], size: [A.width, len], yaw: Math.PI, t0, t1, beam: true }));
  b.telegraph = b.tgs[0]; b.state = 'windup'; b.stateT = 0; g.emit('telegraph:start', { uid: b.uid, shape: 'line', t1, attack: 'beam', n: 3 }); g.toast = { key: 'toast.beam', t: g.t };
}
// v2.15 hold 중 마법탄이 수호신에게 닿음 — 몸 x 와 가장 가까운 분신이 맞음. 진짜면 분신 소멸·경직 → 'real'(피해는 game.js 가 이어서) · 가짜면 폭발(플레이어 8)·그 분신만 사라짐 → 'fake'
export function bossMirrorHit(g, b){
  if (b.state !== 'hold' || !b.mirror) return null; const M = b.mirror, P = g.player, live = M.bodies.filter(m => !m.gone); if (!live.length) return null;
  let hit = live[0], bd = Infinity; for (const m of live) { const d = Math.abs(P.pos[0] - m.x); if (d < bd) { bd = d; hit = m; } }
  if (hit.real) { b.mirror = null; b.state = 'stun'; b.stateT = 0; b.stunUntil = g.gameT + b.def.attacks.mirror.stun; b.lastAtk = g.gameT; g.stats.mirrorReal = (g.stats.mirrorReal || 0) + 1;
    g.stats.log.push({ qid: 'mirror:' + M.fact, concept: M.concept, fact: M.fact, type: 'mirror', correct: true, hint: 0, ms: Math.round((g.gameT - (b.holdUntil - b.def.attacks.mirror.hold)) * 1000), choice: M.bodies.indexOf(hit), via: 'body', mBefore: 0, mAfter: 0 });
    g.emit('boss:mirrorHit', { uid: b.uid, real: true, x: hit.x }); g.emit('boss:mirrorEnd', { uid: b.uid, real: true }); g.trauma = Math.min(GAME.shake.max, g.trauma + .3); return 'real'; }
  hit.gone = true; g.stats.mirrorFake = (g.stats.mirrorFake || 0) + 1; g.bossHit(b, b.def.attacks.mirror.dmg);
  g.stats.log.push({ qid: 'mirror:' + M.fact, concept: M.concept, fact: M.fact, type: 'mirror', correct: false, hint: 0, ms: 0, choice: M.bodies.indexOf(hit), via: 'body', mBefore: 0, mAfter: 0 });
  g.emit('boss:mirrorHit', { uid: b.uid, real: false, x: hit.x, pos: [hit.x, b.h * .6, b.pos[2]] }); return 'fake';
}
function segHit(p, a, c, r){ const vx = c[0] - a[0], vz = c[2] - a[2], L = vx * vx + vz * vz || 1; const k = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[2] - a[2]) * vz) / L));
  return Math.hypot(p[0] - (a[0] + vx * k), p[2] - (a[2] + vz * k)) <= r; }

// 피해 배율(보호막 ×0.1 · 약점 ×1.5) — 게임의 hitEnemy 가 먼저 묻는다
export function bossMul(g, b){ if (b.state === 'intro' || b.state === 'phase' || b.state === 'dead') return 0;   // v2.15 hold(분신)·stun(경직) 은 맞는다
  return b.shield > 0 ? B.shieldMul : g.gameT < b.weakUntil ? B.weakMul : 1; }
// 피해 적용 뒤: 페이즈 넘김(넘친 피해는 다음 페이즈로 안 감)
export function bossAfterHit(g, b){
  b.phaseHp[b.phase] = b.hp;
  if (b.hp > 0) return 'alive';
  clearTgs(g, b); b.weakUntil = 0; if (b.mirror) { b.mirror = null; g.emit('boss:mirrorEnd', { uid: b.uid, real: null }); }
  if (b.phase >= b.def.phases.length - 1) { b.state = 'dead'; b.stateT = 0; return 'dead'; }
  b.state = 'phase'; b.stateT = 0; g.trauma = Math.min(GAME.shake.max, g.trauma + .4); return 'phase';
}
// 봉인 문제 정답 → 칸 하나 깨짐. 다 깨지면 약점 시간
export function sealBroken(g, b){
  if (b.shield <= 0) return; b.shield--; g.emit('boss:seal', { uid: b.uid, left: b.shield, max: b.shieldMax, pos: [b.pos[0], b.h * .6, b.pos[2]] }); g.trauma = Math.min(GAME.shake.max, g.trauma + .35);
  if (ph(b).summonOnSeal) g.spawnAdd(ph(b).summonOnSeal);
  if (b.shield === 0) { clearTgs(g, b); if (b.mirror) { b.mirror = null; g.emit('boss:mirrorEnd', { uid: b.uid, real: null }); } b.state = 'kneel'; b.stateT = 0; b.weakUntil = g.gameT + B.weakT; g.emit('boss:weak', { uid: b.uid, on: true, t: B.weakT }); }
}
export function bossSnapshot(g, b, r3, v3){
  if (!b) return null;
  return { uid: b.uid, kind: b.kind, pos: v3(b.pos), yaw: r3(b.yaw), scale: b.scale, state: b.state, stateT: r3(b.stateT), attack: b.attack,
    phase: b.phase, phases: b.def.phases.length, hp: b.hp, hpMax: b.hpMax, phaseHp: b.phaseHp.slice(), phaseHpMax: b.def.phases.map(p => p.hp),
    shield: b.shield, shieldMax: b.shieldMax, weak: b.weakUntil > g.gameT ? r3((b.weakUntil - g.gameT) / B.weakT) : 0,
    telegraphs: b.tgs.map(t => ({ shape: t.shape, center: v3(t.center), size: t.size.map(r3), yaw: t.yaw != null ? r3(t.yaw) : 0, t0: r3(t.t0), t1: r3(t.t1), label: t.label || null, avoid: t.avoid || null, holes: t.holes || null, beam: !!t.beam })),
    // v2.15 수호신: wall = 다가오는 모양 벽(구멍 pic·x, 답 모양·이름) · mirrors = 분신 셋(진짜는 안 알려줌 — 그림만) · mirrorPic = 문제 그림 · stun = 경직 남은 비율
    wall: b.wall ? { holes: b.wall.holes.map(h => ({ pic: h.pic, x: r3(h.x) })), answerPic: b.wall.answerPic, name: b.wall.name, concept: b.wall.concept, judged: !!b.wall.judged } : null,
    mirrors: b.mirror ? b.mirror.bodies.filter(m => !m.gone).map(m => ({ x: r3(m.x), z: r3(b.pos[2]), pic: m.pic })) : null, mirrorPic: b.mirror ? b.mirror.pic : null, mirrorName: b.mirror ? b.mirror.name : null,
    hold: b.state === 'hold' ? r3((b.holdUntil - g.gameT) / b.def.attacks.mirror.hold) : 0, stun: b.state === 'stun' ? r3((b.stunUntil - g.gameT) / b.def.attacks.mirror.stun) : 0,
    nameKey: 'boss.' + b.kind };
}
