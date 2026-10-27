// 보스 「숫자 골렘」(06 문서 4·5절) — 3페이즈 · 수학 보호막(봉인 문제) · 약점 시간 · 페이즈 체크포인트
// 그림 없음. 게임(game.js)이 g.enemies 안의 boss:true 적을 이 모듈로 돌린다. 모든 공격은 예고(telegraphs[])가 먼저다
import { GAME } from './config.js';
const B = GAME.boss;

export function makeBoss(def, uid, phase = 0){
  const b = { uid, kind: def.kind, def, boss: true, pos: [def.spawn.x, 0, def.spawn.z], yaw: Math.PI, scale: 1, h: def.height, r: def.body,
    state: 'intro', stateT: 0, phase, phaseHp: def.phases.map(p => p.hp), hp: def.phases[phase].hp, hpMax: def.phases[phase].hp,
    shield: 0, shieldMax: 0, sealsAsked: 0, weakUntil: 0, attack: null, tgs: [], lastAtk: 0, lastKind: null, dash: null, hitDone: false,
    telegraph: null, token: false, label: null, tags: ['boss'], slot: 0 };
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
function clearTgs(g, b){ if (b.tgs.length) g.emit('telegraph:end', { uid: b.uid }); b.tgs = []; b.attack = null; b.dash = null; b.telegraph = null; }

export function stepBoss(g, b, dt){
  const P = g.player; b.stateT += dt;
  const dx = P.pos[0] - b.pos[0], dz = P.pos[2] - b.pos[2], dist = Math.hypot(dx, dz) || 1;
  const set = s => { b.state = s; b.stateT = 0; };
  switch (b.state) {
    case 'intro': if (b.stateT >= B.introT) { startPhase(g, b); } return;
    case 'dead': return;
    case 'phase': if (b.stateT >= B.phaseT) { b.phase++; startPhase(g, b); g.emit('boss:phase', { uid: b.uid, phase: b.phase }); } return;
    case 'kneel': if (g.gameT >= b.weakUntil) { set('chase'); b.lastAtk = g.gameT - cycleOf(g, b) * .5; g.emit('boss:weak', { uid: b.uid, on: false }); } return;
    case 'chase': {
      b.yaw = Math.atan2(dx, dz);
      const want = [P.pos[0] * .6, 0, Math.min(B.zMax, P.pos[2] + B.keep)];
      const mx = want[0] - b.pos[0], mz = want[2] - b.pos[2], md = Math.hypot(mx, mz), sp = ph(b).speed * g.band.speed;
      if (md > .1) { const s = Math.min(md, sp * dt); b.pos[0] += mx / md * s; b.pos[2] += mz / md * s; }
      // 크리스털 문제 중엔 새 공격을 시작하지 않는다(봉인 문제 중엔 계속 — 06 4절)
      const crystalQ = g.q && g.q.kind !== 'seal';
      if (!crystalQ && g.gameT - b.lastAtk >= cycleOf(g, b)) begin(g, b, dx / dist, dz / dist);
      return;
    }
    case 'windup': if (g.gameT >= b.tgs[0].t1) { set('attack'); strike(g, b); } return;
    case 'attack': {
      if (b.dash) { const k = Math.min(1, b.stateT / B.dashT); b.pos[0] = b.dash.from[0] + (b.dash.to[0] - b.dash.from[0]) * k; b.pos[2] = b.dash.from[2] + (b.dash.to[2] - b.dash.from[2]) * k;
        if (!b.hitDone && segHit(P.pos, b.dash.from, b.pos, b.dash.w / 2 + GAME.player.hurtR)) { b.hitDone = true; g.bossHit(b, b.def.attacks.charge.dmg); } }
      if (b.stateT >= (b.attack === 'charge' ? B.dashT + .1 : b.def.attacks[b.attack].dur)) { clearTgs(g, b); b.lastAtk = g.gameT; set('recover'); }
      return; }
    case 'recover': if (b.stateT >= B.recover) set('chase'); return;
  }
}
function begin(g, b, ux, uz){
  const list = ph(b).attacks.filter(k => k !== b.lastKind || ph(b).attacks.length === 1); const kind = g.rng.pick(list); b.lastKind = kind; b.attack = kind; b.hitDone = false;
  const A = b.def.attacks[kind], t0 = g.gameT, t1 = t0 + windOf(g, b, kind), P = g.player, X = GAME.player.xMax;
  if (kind === 'slam') b.tgs = [{ shape: 'circle', center: [b.pos[0] + ux * A.reach, 0, b.pos[2] + uz * A.reach], size: [A.radius], t0, t1 }];
  else if (kind === 'charge') { const len = Math.max(2, Math.hypot(P.pos[0] - b.pos[0], P.pos[2] - b.pos[2]) + A.over), to = [b.pos[0] + ux * len, 0, b.pos[2] + uz * len]; to[2] = Math.max(to[2], P.pos[2] - 1.5);
    b.dash = { from: b.pos.slice(), to, w: A.width }; b.tgs = [{ shape: 'line', center: [(b.pos[0] + to[0]) / 2, 0, (b.pos[2] + to[2]) / 2], size: [A.width, Math.hypot(to[0] - b.pos[0], to[2] - b.pos[2])], yaw: Math.atan2(to[0] - b.pos[0], to[2] - b.pos[2]), t0, t1 }]; }
  else if (kind === 'rocks') { const xs = [P.pos[0], P.pos[0] - A.gap, P.pos[0] + A.gap].map(x => Math.max(-X, Math.min(X, x)));
    b.tgs = xs.map((x, i) => ({ shape: 'circle', center: [x, 0, GAME.player.arcK * x * x + (i ? g.rng.range(-.4, .4) : 0)], size: [A.radius], t0, t1, label: String(g.rng.int(1, 9)) })); }
  else if (kind === 'quake') b.tgs = [{ shape: 'ring', center: [b.pos[0], 0, b.pos[2]], size: [A.radius], t0, t1, avoid: 'duck' }];
  b.telegraph = b.tgs[0]; b.state = 'windup'; b.stateT = 0;
  g.emit('telegraph:start', { uid: b.uid, shape: b.tgs[0].shape, t1, attack: kind, n: b.tgs.length });
  if (kind === 'quake') g.toast = { key: 'toast.duck', t: g.t };
}
function strike(g, b){
  const P = g.player, A = b.def.attacks[b.attack]; g.emit('enemy:attack', { uid: b.uid, kind: b.kind, attack: b.attack });
  if (b.attack === 'charge') { b.dash.from = b.pos.slice(); return; }   // 돌진은 attack 동안 판정
  if (b.attack === 'quake') { if (!P.duck) g.bossHit(b, A.dmg); else g.emit('dodge', { dir: 0, perfect: true, duck: true }); g.trauma = Math.min(GAME.shake.max, g.trauma + .5); return; }
  for (const t of b.tgs) { if (Math.hypot(P.pos[0] - t.center[0], P.pos[2] - t.center[2]) <= t.size[0] + GAME.player.hurtR) { g.bossHit(b, A.dmg); break; } }
  if (b.attack === 'slam') g.trauma = Math.min(GAME.shake.max, g.trauma + .3);
}
function segHit(p, a, c, r){ const vx = c[0] - a[0], vz = c[2] - a[2], L = vx * vx + vz * vz || 1; const k = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[2] - a[2]) * vz) / L));
  return Math.hypot(p[0] - (a[0] + vx * k), p[2] - (a[2] + vz * k)) <= r; }

// 피해 배율(보호막 ×0.1 · 약점 ×1.5) — 게임의 hitEnemy 가 먼저 묻는다
export function bossMul(g, b){ if (b.state === 'intro' || b.state === 'phase' || b.state === 'dead') return 0; return b.shield > 0 ? B.shieldMul : g.gameT < b.weakUntil ? B.weakMul : 1; }
// 피해 적용 뒤: 페이즈 넘김(넘친 피해는 다음 페이즈로 안 감)
export function bossAfterHit(g, b){
  b.phaseHp[b.phase] = b.hp;
  if (b.hp > 0) return 'alive';
  clearTgs(g, b); b.weakUntil = 0;
  if (b.phase >= b.def.phases.length - 1) { b.state = 'dead'; b.stateT = 0; return 'dead'; }
  b.state = 'phase'; b.stateT = 0; g.trauma = Math.min(GAME.shake.max, g.trauma + .4); return 'phase';
}
// 봉인 문제 정답 → 칸 하나 깨짐. 다 깨지면 약점 시간
export function sealBroken(g, b){
  if (b.shield <= 0) return; b.shield--; g.emit('boss:seal', { uid: b.uid, left: b.shield, max: b.shieldMax, pos: [b.pos[0], b.h * .6, b.pos[2]] }); g.trauma = Math.min(GAME.shake.max, g.trauma + .35);
  if (ph(b).summonOnSeal) g.spawnAdd(ph(b).summonOnSeal);
  if (b.shield === 0) { clearTgs(g, b); b.state = 'kneel'; b.stateT = 0; b.weakUntil = g.gameT + B.weakT; g.emit('boss:weak', { uid: b.uid, on: true, t: B.weakT }); }
}
export function bossSnapshot(g, b, r3, v3){
  if (!b) return null;
  return { uid: b.uid, kind: b.kind, pos: v3(b.pos), yaw: r3(b.yaw), scale: b.scale, state: b.state, stateT: r3(b.stateT), attack: b.attack,
    phase: b.phase, phases: b.def.phases.length, hp: b.hp, hpMax: b.hpMax, phaseHp: b.phaseHp.slice(), phaseHpMax: b.def.phases.map(p => p.hp),
    shield: b.shield, shieldMax: b.shieldMax, weak: b.weakUntil > g.gameT ? r3((b.weakUntil - g.gameT) / B.weakT) : 0,
    telegraphs: b.tgs.map(t => ({ shape: t.shape, center: v3(t.center), size: t.size.map(r3), yaw: t.yaw != null ? r3(t.yaw) : 0, t0: r3(t.t0), t1: r3(t.t1), label: t.label || null, avoid: t.avoid || null })),
    nameKey: 'boss.' + b.kind };
}
