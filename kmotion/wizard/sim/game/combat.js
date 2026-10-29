// 피해 공식(04 문서 3절) · 투사체(05 문서 1·2-1절)
import { GAME } from './config.js';
export function damage(rng, { atk, mult = 1, def = 0, canCrit = true, empower = 1, weak = 1 }){
  const crit = canCrit && rng.chance(GAME.player.crit); const raw = atk * mult * (crit ? GAME.player.critMul : 1) * empower * weak - def * .5;
  return { amount: Math.max(1, Math.round(raw)), crit };
}
// v2.3 정확 피해 채널(15 문서 5절, D-29): 수학 정답으로 나가는 탄은 공식 안 거침 — 치명·레벨 차이·DEF·강화·약점·난이도 전부 0. 쓰는 곳: 보스 봉인 칸·방패병 방패 byMath·골렘 균열(고정 결과)·share 탄
export function exactHit(amount){ return { amount: Math.max(0, Math.round(amount)), crit: false, exact: true }; }
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
