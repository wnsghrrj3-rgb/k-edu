// v2.5 묶음 자리(pack slots) — node tests/sim/p11.mjs
// 4학년 묶음 n(≤8) 이 maxEnemies(mid 6) 에 깎이던 것(38 알려진 것) 해소: 산 묶음은 min(산 마리, PK.slots=3) 자리만 차지.
// 검사: 설정 / 4학년·3학년 봇 여러 판의 enemy:pack n 분포가 학년 상한까지 가는지 / 자리 불변식(보통 적 + 묶음 자리 ≤ maxEnemies, 분열 mini·보스 제외) / 1학년 회귀(골든은 golden.mjs)
import { createGame } from '../../sim/game/game.js';
import { GAME } from '../../sim/game/config.js';
import { packRange } from '../../sim/learn/gradeTable.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 140) }); if (!cond) fail++; };

// ── 1. 설정
ok('GAME.pack.slots = 3 · 4학년 n 상한 8 > mid maxEnemies 6', GAME.pack.slots === 3 && packRange(data, 4).n[1] === 8 && GAME.grade.mid.maxEnemies === 6);

// ── 2. 묶음 n 분포(봇 판, 이벤트 기록) + 자리 불변식(매 프레임 스냅샷)
function packStats(grade, seeds, stage = 'forest-1-1'){ const ns = []; let maxSlots = 0, frames = 0, wins = 0; const band = GAME.grade[GAME.gradeBand(grade)];
  for (const seed of seeds) { const rec = []; const r = playOne({ data, seed, acc: .85, react: .35, grade, stage, maxT: 700, record: rec, progress: { xp: 0, level: 1 } }); if (r.win) wins++;
    for (const ev of rec) if (ev.type === 'enemy:pack') ns.push(ev.n); }
  return { ns, wins, band };
}
function slotsInvariant(grade, seed, stage = 'forest-1-1'){ const band = GAME.grade[GAME.gradeBand(grade)]; const g = createGame({ data, seed, grade, startZone: 3, unlock: 'all', stageId: stage }); let worst = 0, packMax = 0;
  for (let i = 0; i < 60 * 150; i++) { g.step(1 / 60); g.drainEvents(); const s = g.snapshot(); if (s.screen !== 'S08') break;
    const normal = s.enemies.filter(e => !e.pack && !e.boss && !(e.tags || []).includes('mini')).length; const packs = s.packs.reduce((a, p) => a + Math.min(p.alive, GAME.pack.slots), 0);
    worst = Math.max(worst, normal + packs); for (const p of s.packs) packMax = Math.max(packMax, p.n);
    if (i % 90 === 0) g.input.push({ type: 'ATTACK', t: 0, via: 'key', value: { zone: 'C', side: i % 180 ? 'L' : 'R' } }); }
  return { worst, packMax, max: band.maxEnemies };
}
{ const g4 = packStats(4, [41, 42, 43, 44, 45, 46]); const n4 = g4.ns;
  ok('4학년 1-1 6판: 묶음 등장 ≥ 6 · n 전부 2~8', n4.length >= 6 && n4.every(n => n >= 2 && n <= 8), JSON.stringify(n4));
  ok('4학년 묶음 n 최대 7 이상 등장(maxEnemies 6 에 안 깎임)', Math.max(...n4) >= 7, `max=${Math.max(...n4)} n=${JSON.stringify(n4)}`);
  ok('4학년 봇 6판 전부 이김', g4.wins === 6, `wins=${g4.wins}`);
  const g3 = packStats(3, [51, 52, 53, 54]); const n3 = g3.ns;
  ok('3학년 1-1 4판: n 전부 2~6 · 최대 6 등장', n3.length >= 4 && n3.every(n => n >= 2 && n <= 6) && Math.max(...n3) === 6, JSON.stringify(n3));
  ok('3학년 봇 4판 전부 이김', g3.wins === 4, `wins=${g3.wins}`); }
{ const rows = [slotsInvariant(4, 61), slotsInvariant(4, 62), slotsInvariant(3, 63), slotsInvariant(4, 64, 'forest-1-2')];
  console.table(rows);
  ok('자리 불변식: 보통 적 + Σmin(묶음 산 마리, 3) ≤ maxEnemies(6) 매 프레임', rows.every(r => r.worst <= r.max), JSON.stringify(rows.map(r => r.worst)));
  ok('그 판들 중 묶음 n 7~8 이 실제로 선 적 있음', rows.some(r => r.packMax >= 7), JSON.stringify(rows.map(r => r.packMax))); }

// ── 3. 1학년 회귀: packs 0 · 전투장 2 적 수 ≤ 4
{ const g = createGame({ data, seed: 3, grade: 1, startZone: 3, unlock: 'all' }); let worst = 0, packs = 0;
  for (let i = 0; i < 60 * 60; i++) { g.step(1 / 60); g.drainEvents(); const s = g.snapshot(); if (s.screen !== 'S08') break; packs += s.packs.length; worst = Math.max(worst, s.enemies.filter(e => !e.boss && !(e.tags || []).includes('mini')).length); }
  ok('1학년 전투장 2: 묶음 0 · 적 ≤ 4(low maxEnemies)', packs === 0 && worst <= 4, `worst=${worst}`); }

console.table(out); console.log(fail ? `✗ ${fail}개 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
