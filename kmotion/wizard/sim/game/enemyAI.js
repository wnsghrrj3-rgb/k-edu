// 몬스터 AI 상태기계(06 문서 2절) — idle·chase·windup·attack·recover·hurt·stagger·dead (flee 는 P2)
// 모든 공격은 예고가 있다: windup 동안 telegraph(바닥 범위)를 스냅샷에 낸다
import { GAME } from './config.js';
const E = GAME.enemy;
export function makeEnemy(def, uid, x, z, rng, band){
  const label = def.label === 'digit' ? String(rng.int(1, 9)) : null;
  return { uid, kind: def.kind, def, pos: [x, 0, z], yaw: Math.PI, scale: 1, hp: def.hp, hpMax: def.hp, state: 'spawn', stateT: 0, since: 0,
    label, telegraph: null, token: false, lastAtk: -9, slot: 0, band, h: def.height, r: def.body, staggerT: 0, tags: [] };
}
export function stepEnemy(g, e, dt){
  const P = g.player, B = g.band, cfg = e.def; e.stateT += dt;
  const dx = P.pos[0] - e.pos[0], dz = P.pos[2] - e.pos[2], dist = Math.hypot(dx, dz);
  const face = () => { e.yaw = Math.atan2(dx, dz); };
  const set = s => { if (e.state === s) return; e.state = s; e.stateT = 0; };
  switch (e.state) {
    case 'spawn': if (e.stateT >= E.spawnT) set('chase'); return;
    case 'dead': return;
    case 'hurt': if (e.stateT >= e.staggerT) set('chase'); return;
    case 'chase': {
      // 부채꼴 자리(플레이어 앞쪽 ±fan) — 뒤에서 오는 공격 0
      const n = Math.max(1, g.aliveCount), a = (n === 1 ? 0 : (e.slot / (n - 1) - .5) * 2) * E.fanDeg * Math.PI / 180;
      const tx = P.pos[0] + Math.sin(a) * cfg.keep, tz = P.pos[2] + Math.cos(a) * cfg.keep;
      const mx = tx - e.pos[0], mz = tz - e.pos[2], md = Math.hypot(mx, mz), sp = cfg.speed * B.speed;
      if (md > .05) { const s = Math.min(md, sp * dt); e.pos[0] += mx / md * s; e.pos[2] += mz / md * s; }
      face();
      const ready = g.gameT - e.lastAtk >= cfg.cycle && dist < cfg.keep + .4;
      if (ready && g.questionOpen === false && g.takeToken(e)) {
        const reach = cfg.attack.reach, ux = dx / (dist || 1), uz = dz / (dist || 1);
        const wt = cfg.windup * B.windup * g.helpWindup;
        e.telegraph = { shape: cfg.attack.shape, center: [e.pos[0] + ux * reach, 0, e.pos[2] + uz * reach], size: [cfg.attack.radius], t0: g.gameT, t1: g.gameT + wt };
        set('windup'); g.emit('telegraph:start', { uid: e.uid, shape: cfg.attack.shape, t1: e.telegraph.t1 });
      }
      return;
    }
    case 'windup': if (g.gameT >= e.telegraph.t1) { set('attack'); g.enemyStrike(e); } return;
    case 'attack': if (e.stateT >= cfg.attack.dur) { e.telegraph = null; e.lastAtk = g.gameT; g.emit('telegraph:end', { uid: e.uid }); set('recover'); g.releaseToken(e, E.tokenReturn); } return;
    case 'recover': { const back = E.backoff / E.recover * dt, d = dist || 1; e.pos[0] -= dx / d * back; e.pos[2] -= dz / d * back; face(); if (e.stateT >= E.recover) set('chase'); return; }
  }
}
export function hurtEnemy(g, e, kind){
  if (e.state === 'dead' || e.state === 'spawn') return;
  if (e.state === 'windup' || e.state === 'attack') { if (e.telegraph) g.emit('telegraph:end', { uid: e.uid }); e.telegraph = null; g.releaseToken(e, 0); e.lastAtk = g.gameT - e.def.cycle * .5; }
  e.staggerT = E.stagger[kind] || .15; e.state = 'hurt'; e.stateT = 0;
}
export function separate(list){
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { const a = list[i], b = list[j]; if (a.state === 'dead' || b.state === 'dead') continue;
    const dx = b.pos[0] - a.pos[0], dz = b.pos[2] - a.pos[2], d = Math.hypot(dx, dz), m = E.sep; if (d < m && d > 1e-4) { const k = (m - d) / 2 / d; a.pos[0] -= dx * k; a.pos[2] -= dz * k; b.pos[0] += dx * k; b.pos[2] += dz * k; } }
  for (const e of list) { e.pos[0] = Math.max(-E.bounds.x, Math.min(E.bounds.x, e.pos[0])); e.pos[2] = Math.max(E.bounds.zMin, Math.min(E.bounds.zMax, e.pos[2])); }
}
