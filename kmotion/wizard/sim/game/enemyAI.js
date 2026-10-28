// 몬스터 AI 상태기계(06 문서 2절) — idle·chase·windup·attack·recover·hurt·stagger·dead
// 모든 공격은 예고가 있다: windup 동안 telegraph(바닥 범위)를 스냅샷에 낸다
// v1.4: 원거리형(def.ranged — 계산 고블린): 거리 유지 원 keep 위로 가고 너무 가까우면 물러남, 예고 = 조준선(line, 시작 때 플레이어 자리로 고정) → 도토리 발사(game.enemyShoot)
//       분열형(def.split — 큰 슬라임)은 game.hitEnemy 가 죽을 때 처리
import { GAME } from './config.js';
const E = GAME.enemy;
export function makeEnemy(def, uid, x, z, rng, band, opt = {}){
  const label = def.label === 'digit' ? String(opt.label != null ? opt.label : rng.int(def.labelMin || 1, 9)) : null;
  const hp = opt.hp || def.hp, sc = opt.scale || def.scale || 1;
  const e = { uid, kind: def.kind, def, pos: [x, 0, z], yaw: Math.PI, scale: sc, hp, hpMax: hp, state: 'spawn', stateT: 0, since: 0, xp: opt.xp != null ? opt.xp : def.xp,
    label, telegraph: null, token: false, lastAtk: -9, slot: 0, band, h: def.height * (opt.scale ? sc : 1), r: def.body * (opt.scale ? sc : 1), staggerT: 0, tags: opt.tags || [], shield: null };
  // v1.6 방패병: 앞 방패 + 방패에 적힌 빈칸 식 「□+b=c」(1~9) — 수학 수정 정답이면 깨짐
  if (def.shield) { const c = rng.int(3, 9), b = rng.int(1, c - 1); e.shield = { hp: def.shield.hp, hpMax: def.shield.hp, up: true, broken: false, byMath: false, eq: def.shield.eq ? { b, c, ans: c - b } : null }; }
  // v1.7 수정 골렘: 수학 정답마다 갈라짐(down = DEF 깎인 양)
  if (def.crack) e.crack = { down: 0, max: def.crack.max || 16, per: def.crack.per || 8 };
  return e;
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
    case 'chase': { if (e.shield && !e.shield.broken) e.shield.up = true;
      // 부채꼴 자리(플레이어 앞쪽 ±fan) — 뒤에서 오는 공격 0. 원거리형은 keep 이 멀고(6.5m), keepMin 보다 가까우면 물러난다
      const n = Math.max(1, g.aliveCount), a = (n === 1 ? 0 : (e.slot / (n - 1) - .5) * 2) * E.fanDeg * Math.PI / 180;
      const tx = P.pos[0] + Math.sin(a) * cfg.keep, tz = P.pos[2] + Math.cos(a) * cfg.keep;
      const mx = tx - e.pos[0], mz = tz - e.pos[2], md = Math.hypot(mx, mz), sp = cfg.speed * B.speed * (e.slowUntil > g.gameT ? e.slowMul : 1);
      if (md > .05) { const s = Math.min(md, sp * dt); e.pos[0] += mx / md * s; e.pos[2] += mz / md * s; }
      face();
      const wt = cfg.windup * B.windup * g.helpWindup;
      if (cfg.ranged) {
        const ready = g.gameT - e.lastAtk >= cfg.cycle && dist <= cfg.keep + 2.5 && dist >= (cfg.keepMin || 2) * .6;
        if (ready && g.questionOpen === false && g.takeToken(e)) {
          const aim = [P.pos[0], 0, P.pos[2]], len = dist; // 조준선: 시작 때 플레이어 자리로 고정 → 옆으로 비키거나 숙이면 피함
          e.telegraph = { shape: 'line', center: [(e.pos[0] + aim[0]) / 2, 0, (e.pos[2] + aim[2]) / 2], size: [cfg.attack.width, len], yaw: Math.atan2(aim[0] - e.pos[0], aim[2] - e.pos[2]), t0: g.gameT, t1: g.gameT + wt, aim };
          set('windup'); g.emit('telegraph:start', { uid: e.uid, shape: 'line', t1: e.telegraph.t1 });
        }
        return;
      }
      const ready = g.gameT - e.lastAtk >= cfg.cycle && dist < cfg.keep + .4;
      if (ready && g.questionOpen === false && g.takeToken(e)) {
        const reach = cfg.attack.reach, ux = dx / (dist || 1), uz = dz / (dist || 1);
        e.telegraph = { shape: cfg.attack.shape, center: [e.pos[0] + ux * reach, 0, e.pos[2] + uz * reach], size: [cfg.attack.radius], t0: g.gameT, t1: g.gameT + wt };
        set('windup'); g.emit('telegraph:start', { uid: e.uid, shape: cfg.attack.shape, t1: e.telegraph.t1 });
      }
      return;
    }
    case 'windup': if (g.gameT >= e.telegraph.t1) { set('attack'); if (cfg.ranged) g.enemyShoot(e); else g.enemyStrike(e); } return;
    case 'attack': if (e.stateT >= cfg.attack.dur) { e.telegraph = null; e.lastAtk = g.gameT; g.emit('telegraph:end', { uid: e.uid }); set('recover'); g.releaseToken(e, E.tokenReturn); } return;
    case 'recover': { if (e.shield && !e.shield.broken) e.shield.up = false; const back = (cfg.ranged ? E.backoff * 2 : E.backoff) / E.recover * dt, d = dist || 1; e.pos[0] -= dx / d * back; e.pos[2] -= dz / d * back; face(); if (e.stateT >= E.recover) set('chase'); return; }
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
