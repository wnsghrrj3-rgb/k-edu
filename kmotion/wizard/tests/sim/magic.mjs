// 마법 5종 시전 경로 — 마나·쿨다운·피해·상태 효과가 실제로 나오는지(node tests/sim/magic.mjs)
import { createFlow } from '../../sim/flow/screens.js';
import { loadData } from './load.mjs';
const data = loadData(), out = [];
function setup(){ const f = createFlow({ data, grade: 1, seed: 11, unlock: 'all' }); f.action('start', { mode: 'keyboard' }); const g = f.game; for (let i = 0; i < 60 * 3.5; i++) { f.step(1 / 60); f.drainEvents(); } return { f, g }; }
const run = (f, s) => { const ev = []; for (let i = 0; i < 60 * s; i++) { f.step(1 / 60); ev.push(...f.drainEvents()); } return ev; };
const push = (g, type, value = {}) => g.input.push({ type, t: 0, via: 'key', value });
for (const id of ['fireball', 'ice', 'lightning', 'meteor']) {
  const { f, g } = setup(); g.player.mana = id === 'meteor' ? 100 : 60; if (id !== 'meteor') g.setSpell(id);
  const hp0 = g.enemies.reduce((a, e) => a + e.hp, 0), mp0 = g.player.mana; const cast = g.snapshot().player.spell;
  push(g, 'CHARGE', { start: true, p: 0 }); run(f, data.spells[cast].cast + .05); push(g, 'CAST', { aim: 'auto' }); const ev = run(f, 2.6);
  const hp1 = g.enemies.reduce((a, e) => a + Math.max(0, e.hp), 0), slowed = g.enemies.some(e => e.slowUntil > g.gameT - 1);
  out.push({ 마법: id, 나간것: cast, 마나: `${mp0}→${g.player.mana}`, 적피해: hp0 - hp1, 이벤트: [...new Set(ev.map(e => e.type).filter(t => /spell|hit|die/.test(t)))].join(' '), 둔화: slowed });
}
{ const { f, g } = setup(); g.player.mana = 60; push(g, 'BLOCK', { on: true }); run(f, 1.0); const on = !!g.snapshot().player.arcana; push(g, 'BLOCK', { on: false });
  const hp = g.player.hp; g.player.invulnUntil = 0; g.enemyStrike({ uid: 0, kind: 'test', telegraph: { center: g.player.pos.slice(), size: [1] }, def: { atk: 14 } }); const hp2 = g.player.hp; g.enemyStrike({ uid: 0, kind: 'test', telegraph: { center: g.player.pos.slice(), size: [1] }, def: { atk: 14 } });
  out.push({ 마법: 'shield', 나간것: on ? 'shield(막기 0.8초)' : '안 나감', 마나: `60→${g.player.mana}`, 적피해: `첫 공격 ${hp - hp2} · 둘째 ${hp2 - g.player.hp}`, 이벤트: '', 둔화: '' }); }
console.table(out);
