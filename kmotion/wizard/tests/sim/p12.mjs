// v2.6 묶음 때 수정 자리(42절 ②) — node tests/sim/p12.mjs
// 산 묶음이 있는 동안 수학 수정이 플레이어 곁(reach 바로 밖)에 뜨고 4초 뒤 다가옴 → 적만 쫓는(수정 쪽으로 안 걷는) 플레이어도 share 문제를 만나 묶음을 수학으로 처치.
// 검사: 설정 / 4학년 전투장 2 「적만 쫓는」 봇(MOVE 없음, ATTACK 만) 여러 판에서 share 문제·packClear byMath > 0 / 묶음 있을 때 스폰 거리 ≤ 2.4·곧 near / 묶음 없을 때(1학년)는 전과 같은 거리(골든은 golden.mjs)
import { createGame } from '../../sim/game/game.js';
import { GAME } from '../../sim/game/config.js';
import { loadData } from './load.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 140) }); if (!cond) fail++; };
const CN = GAME.pack.crystalNear;
ok('설정: crystalNear sideMin 1.8 ≥ reach 1.5 · sideMax 2.4 < crystal.sideMin 2.5 · approachAfter 4 < 25', CN.sideMin >= GAME.crystal.reach && CN.sideMax < GAME.crystal.sideMin && CN.approachAfter < GAME.crystal.approachAfter);

// 적만 쫓는 봇: 옆으로 안 걸음(MOVE 0), 문제가 열리면 정답. 수정은 곁에 오면 ATTACK 이 저절로 연다(crystalNear 우선).
function chaseOnly(seed, grade = 4, T = 240){ const g = createGame({ data, seed, grade, startZone: 3, unlock: 'all', stageId: 'forest-1-1' }); const rec = []; let i = 0, qAt = Infinity, lastQ = null, spawnD = [], nearIn = [];
  const born = {};
  for (; i < 60 * T; i++) { g.step(1 / 60); for (const ev of g.drainEvents()) { rec.push(ev);
      if (ev.type === 'crystal:spawn' && ev.kind === 'math') { born[ev.uid] = { t: g.gameT, d: Math.abs(ev.pos[0] - g.player.pos[0]), packs: g.enemies.filter(e => e.pack && e.state !== 'dead').length }; if (born[ev.uid].packs) spawnD.push(born[ev.uid].d); } }
    const s = g.snapshot(); if (s.screen !== 'S08' && s.screen !== 'S08Q') break;
    for (const c of s.crystals) if (c.kind === 'math' && c.near && born[c.uid] && born[c.uid].packs && born[c.uid].nearAt == null) { born[c.uid].nearAt = g.gameT; nearIn.push(g.gameT - born[c.uid].t); }
    if (s.screen === 'S08Q' && s.question) { if (lastQ !== s.question.id) { lastQ = s.question.id; qAt = g.gameT + 2.5; }
      if (s.question.state === 'open' && g.gameT >= qAt) { g.input.push({ type: 'SELECT', t: 0, via: 'key', value: { slot: g.q.v.correctSlot } }); qAt = Infinity; } }
    else if (i % 40 === 0 && (s.enemies.some(e => e.state !== 'dead' && e.state !== 'spawn') || s.crystals.some(c => c.near))) g.input.push({ type: 'ATTACK', t: 0, via: 'key', value: { zone: 'C', side: i % 80 ? 'L' : 'R' } }); }
  const share = rec.filter(e => e.type === 'q:open' && e.kind === 'share').length, clears = rec.filter(e => e.type === 'enemy:packClear').length, byMath = rec.filter(e => e.type === 'enemy:packClear' && e.byMath).length, packs = rec.filter(e => e.type === 'enemy:pack').length;
  return { seed, packs, share, clears, byMath, spawnDmax: spawnD.length ? Math.max(...spawnD) : null, nearInMax: nearIn.length ? Math.round(Math.max(...nearIn) * 10) / 10 : null, screen: g.snapshot().screen, t: Math.round(g.gameT) };
}
{ const rows = [71, 72, 73, 74].map(s => chaseOnly(s)); console.table(rows);
  ok('4학년 적만 쫓는 봇 4판: 묶음이 섰고 share 문제가 매 판 ≥1', rows.every(r => r.packs > 0 && r.share >= 1), JSON.stringify(rows.map(r => [r.packs, r.share])));
  ok('묶음 처치 byMath 가 4판 합 ≥ 3(42절 ② 전엔 0)', rows.reduce((a, r) => a + r.byMath, 0) >= 3, JSON.stringify(rows.map(r => r.byMath)));
  ok('묶음 있을 때 수정 스폰 거리 ≤ 2.4', rows.every(r => r.spawnDmax == null || r.spawnDmax <= 2.4 + 1e-6), JSON.stringify(rows.map(r => r.spawnDmax)));
  ok('그 수정이 스폰 뒤 6초 안에 near(4초 + 1.2 m/s)', rows.every(r => r.nearInMax == null || r.nearInMax <= 6), JSON.stringify(rows.map(r => r.nearInMax))); }
{ const r3 = chaseOnly(75, 3); console.table([r3]); ok('3학년 같은 봇 1판도 share ≥1 · byMath ≥1', r3.share >= 1 && r3.byMath >= 1, JSON.stringify(r3)); }
// 묶음 없을 때(1학년): 스폰 거리는 전처럼 2.5~3.5
{ const g = createGame({ data, seed: 5, grade: 1, startZone: 3, unlock: 'all' }); const ds = [];
  for (let i = 0; i < 60 * 60; i++) { g.step(1 / 60); for (const ev of g.drainEvents()) if (ev.type === 'crystal:spawn' && ev.kind === 'math') ds.push(Math.abs(ev.pos[0] - g.player.pos[0])); if (g.snapshot().screen !== 'S08') break; }
  ok('1학년(묶음 0): 수정 거리 전과 같음(≥ 2.5 또는 벽 clamp)', ds.length > 0 && ds.every(d => d >= 2.5 - 1e-6 || d <= 1.2), JSON.stringify(ds.map(d => Math.round(d * 100) / 100))); }
console.table(out); console.log(fail ? `✗ ${fail}개 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
