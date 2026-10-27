// 피해 공식(04 문서 3절) · 투사체(05 문서 1·2-1절)
import { GAME } from './config.js';
export function damage(rng, { atk, mult = 1, def = 0, canCrit = true, empower = 1, weak = 1 }){
  const crit = canCrit && rng.chance(GAME.player.crit); const raw = atk * mult * (crit ? GAME.player.critMul : 1) * empower * weak - def * .5;
  return { amount: Math.max(1, Math.round(raw)), crit };
}
const yawTo = (dx, dz) => Math.atan2(dx, dz);
// 유도: 목표 쪽으로 초당 turn(도)만큼 방향을 꺾음(수평면)
export function steer(p, target, dt){
  if (!target) return; const sp = Math.hypot(p.vel[0], p.vel[2]); if (sp < 1e-4) return;
  const want = yawTo(target.pos[0] - p.pos[0], target.pos[2] - p.pos[2]), cur = yawTo(p.vel[0], p.vel[2]);
  let d = want - cur; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  const m = p.homing * Math.PI / 180 * dt, nd = Math.max(-m, Math.min(m, d)), ny = cur + nd;
  p.vel[0] = Math.sin(ny) * sp; p.vel[2] = Math.cos(ny) * sp;
  const dy = (target.pos[1] + target.h * .5) - p.pos[1]; p.vel[1] = Math.max(-4, Math.min(4, dy * 4));
}
