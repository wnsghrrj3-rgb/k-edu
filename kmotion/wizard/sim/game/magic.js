// 마법 5종(05 문서 2절) — 불꽃탄은 game.js(탄 비행), 나머지 넷은 여기. 시전 동작은 하나, 무엇이 나가는지는 장착 칸이 정한다(D-04)
// api: { hitEnemy, pickTarget, pickCluster, tipPos, nid, hurtShieldSeal }
import { v3 } from '../core/snapshot.js';
export const MAIN = ['fireball', 'ice', 'lightning'];
const alive = g => g.enemies.filter(e => e.state !== 'dead' && e.state !== 'spawn' && !(e.boss && ['intro', 'phase'].includes(e.state)));
const d2 = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);

// 지금 시전하면 나갈 마법: 마나 100 + METEOR 해금이면 METEOR(손을 2초 안에 풀면 주 마법 — 충전 취소 = FIZZLE 로 대신)
export function currentSpell(g){ const P = g.player; if (g.unlocked.has('meteor') && P.mana >= g.data.spells.meteor.mp && !g.meteorOff) return 'meteor'; return g.spell; }

export function castSpell(g, id, aim, api){
  const sp = g.data.spells[id], P = g.player;
  if (id === 'ice') { const t = api.pickCluster(sp.radius); const c = t ? [t.pos[0], 0, t.pos[2]] : [P.pos[0], 0, P.pos[2] + 5];
    const a = { uid: api.nid(), kind: 'ice', pos: v3(c), radius: sp.radius, t0: g.gameT, t1: g.gameT + sp.tick * sp.ticks, next: g.gameT, left: sp.ticks }; g.areas.push(a);
    g.emit('spell:cast', { spell: id, uid: a.uid, pos: v3(api.tipPos()), dir: [0, 0, 1], at: a.pos, radius: sp.radius }); return; }
  if (id === 'lightning') { const first = api.pickTarget(aim === 'L' ? 0 : aim === 'R' ? 2 : 1); const chain = []; let cur = first, mult = sp.dmg;
    while (cur && chain.length < sp.targets) { chain.push(cur); const next = alive(g).filter(e => !chain.includes(e) && d2(e.pos, cur.pos) <= sp.jump).sort((a, b) => d2(a.pos, cur.pos) - d2(b.pos, cur.pos))[0]; cur = next; }
    const pts = [v3(api.tipPos()), ...chain.map(e => v3([e.pos[0], e.h * .6, e.pos[2]]))];
    g.emit('spell:cast', { spell: id, uid: api.nid(), pos: pts[0], dir: [0, 0, 1] }); g.emit('spell:chain', { spell: id, points: pts });
    for (const e of chain) { api.hitEnemy(e, mult, 'spell'); mult *= sp.decay; } if (!chain.length) g.emit('spell:fizzle', { spell: id, reason: 'target' }); return; }
  if (id === 'shield') { P.arcana = { until: g.gameT + sp.t, nullify: sp.nullify, t: sp.t }; g.emit('spell:cast', { spell: id, uid: api.nid(), pos: v3([P.pos[0], 1, P.pos[2]]), dir: [0, 0, 1] }); g.emit('shield:on', { t: sp.t }); return; }
  if (id === 'meteor') { const t = api.pickCluster(sp.radius); const c = t ? [t.pos[0], 0, t.pos[2]] : [0, 0, P.pos[2] + 7];
    const a = { uid: api.nid(), kind: 'meteor', pos: v3(c), radius: sp.radius, t0: g.gameT, t1: g.gameT + sp.fall, hit: false }; g.areas.push(a);
    g.emit('spell:cast', { spell: id, uid: a.uid, pos: v3(api.tipPos()), dir: [0, 0, 1], at: a.pos, radius: sp.radius, stars: g.stats.right }); return; }
}
// 지속 효과 — 얼음 틱·별똥 착지
export function stepMagic(g, api){
  const S = g.data.spells;
  for (const a of g.areas) {
    if (a.kind === 'ice') { const sp = S.ice; while (a.left > 0 && g.gameT >= a.next) { a.left--; a.next += sp.tick; for (const e of alive(g)) if (d2(e.pos, a.pos) <= a.radius + e.r * .5) { api.hitEnemy(e, sp.dmg, 'tick'); e.slowUntil = g.gameT + sp.slow.t; e.slowMul = sp.slow.mul; } } }
    if (a.kind === 'meteor' && !a.hit && g.gameT >= a.t1) { a.hit = true; g.areas.push({ uid: api.nid(), kind: 'explosion', pos: a.pos, radius: a.radius, t0: g.gameT, t1: g.gameT + .45 }); const sp = S.meteor; g.emit('spell:impact', { spell: 'meteor', pos: a.pos, radius: a.radius }); g.trauma = Math.min(.7, g.trauma + .6);
      for (const e of alive(g)) { const d = d2(e.pos, a.pos); if (d > a.radius + e.r * .5) continue; const k = Math.min(1, d / a.radius);
        if (e.boss && e.shield > 1) api.hurtShieldSeal(e); api.hitEnemy(e, sp.dmg.center + (sp.dmg.edge - sp.dmg.center) * k, 'spell'); } }
  }
}
// 플레이어가 맞을 때 비전 방패: 처음 n번 무효, 그다음 −70%
export function shieldFilter(g, amount){ const P = g.player, A = P.arcana; if (!A || g.gameT >= A.until) return { amount, used: false };
  if (A.nullify > 0) { A.nullify--; g.emit('shield:block', { nullify: true }); return { amount: 0, used: true }; }
  g.emit('shield:block', { nullify: false }); return { amount: Math.max(1, Math.round(amount * (1 - g.data.spells.shield.reduce))), used: true }; }
