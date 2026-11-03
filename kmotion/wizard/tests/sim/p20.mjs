// v3.1 길이 맞추기 다리(17 문서 8절 ②, 월드 3 길 B) — node tests/sim/p20.mjs
// 퍼즐 생성 1·2·3학년(틈과 같은 길이 널빤지 하나만 · 1학년 plank: 그림 돌 · 2학년↑ 숫자 돌 + 자 gapcm:) / 판 안 S08P 스냅샷 hole kind length / 틀림→힌트→맞음 / 봇 1·2학년 완주 로그 puzzle:length-bridge / 숲·신전 퍼즐 무변경
import { createFlow } from '../../sim/flow/screens.js';
import { makePuzzle, verifyPuzzle } from '../../sim/learn/puzzles.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const T = data.text;

// ── 1. 생성
{ let bad = 0, near = 0, a0 = 0, aN = 0, readEnd = 0;
  for (let i = 0; i < 300; i++) { const p = makePuzzle('length-bridge', createRng(i + 1), 1); if (!verifyPuzzle(p) || p.concept !== 'g1.cmp.long' || !/^gap:[3-7]$/.test(p.hole.pic) || p.hole.kind !== 'length' || !p.stones.every(s => s.pic === 'plank:' + s.num && s.num >= 2 && s.num <= 9)) bad++; if (p.stones.some(s => Math.abs(s.num - p.gap) === 1)) near++; }
  ok('1학년 300: 틈 3~7 · 널빤지 2~9 그림 돌(plank:) · 틈과 같은 것 하나 · concept g1.cmp.long', bad === 0, `어긋남 ${bad}`); ok('1학년: 1칸 차 오답이 섞임(한쪽 끝 맞추기 필요)', near > 100, `${near}/300`);
  bad = 0; for (let i = 0; i < 300; i++) { const p = makePuzzle('length-bridge', createRng(i + 1), 2); const m = p.hole.pic.match(/^gapcm:(\d),(\d+)$/); if (!verifyPuzzle(p) || !m || p.concept !== 'g2.len.ruler' || +m[2] - +m[1] !== p.gap || +m[2] > 10 || !p.stones.every(s => s.pic === null)) bad++; else { if (+m[1] === 0) a0++; else { aN++; if (p.stones.some(s => s.num === +m[2])) readEnd++; } } }
  ok('2학년 300: 자 gapcm:a,b · 틈 = b−a · 눈금 ≤10 · 숫자 돌(pic null) · concept g2.len.ruler', bad === 0, `어긋남 ${bad}`); ok('2학년: 0시작·n시작 둘 다 · n시작이면 끝 눈금 그대로 읽는 오답(read-end) 있음', a0 > 50 && aN > 50 && readEnd === aN, `0시작 ${a0} n시작 ${aN} read-end ${readEnd}`);
  const p3 = makePuzzle('length-bridge', createRng(9), 3); ok('3학년 = 2학년 틀(임시)', p3.concept === 'g2.len.ruler' && p3.hole.pic.startsWith('gapcm:'));
  ok('문구 키 5', ['pz.plank', 'pz.plank.hint', 'pz.plankcm', 'pz.plankcm.hint', 'pz.plankWrong'].every(k => !!T[k])); }

// ── 2. 판 안: 길 B 퍼즐까지 → S08P 스냅샷 · 틀림 → 힌트 · 맞음 → 길 열림
import { GAME } from '../../sim/game/config.js';
const RL = GAME.rail; const push = (g, type, value = {}) => g.input.push({ type, t: g.t * 1000, via: 'key', value });
function toPuzzle(grade, seed){ const f = createFlow({ data, grade, seed, startZone: 2, stage: 'canyon-3-1', forceStage: true }); f.action('start', { mode: 'keyboard' }); f.action('enter'); const g = f.game; let steer = null;   // p15 toPuzzle 과 같은 길 봇
  for (let i = 0; i < 60 * 90 && g.screen !== 'S08P' && g.screen !== 'S14'; i++) { const s = g.snapshot(); const nxt = s.obstacles.filter(o => o.state === 'ahead' && o.pos[2] > -.5).sort((a, b) => a.pos[2] - b.pos[2])[0];
    if (nxt) { const want = nxt.kind === 'rock' ? (nxt.x <= 0 ? RL.xMax : -RL.xMax) : nxt.kind === 'branch' ? g.player.pos[0] : nxt.pos[0]; if (steer !== want) { steer = want; push(g, 'MOVE', { u: want / RL.xMax }); } push(g, 'DUCK', { on: nxt.kind === 'branch' }); }
    if (s.enemies.some(e => e.state !== 'dead' && e.state !== 'spawn') && i % 40 === 0) push(g, 'ATTACK', { zone: 1, side: 'R' });
    if (s.screen === 'S08Q' && s.question && s.question.state === 'open') push(g, 'SELECT', { slot: g.q.v.correctSlot });
    f.step(1 / 60); f.drainEvents(); } return { f, g }; }
{ for (const grade of [1, 2]) { const { f, g } = toPuzzle(grade, 30 + grade); const snap = g.snapshot(); const Z = snap.puzzle; const opened = snap.screen === 'S08P' && Z && Z.state === 'open';
    ok(`${grade}학년 길 B: S08P length-bridge · hole kind length pic ${grade === 1 ? 'gap:' : 'gapcm:'} · stones 3(${grade === 1 ? '그림 plank:' : '숫자'}) · targets 3`, opened && Z.type === 'length-bridge' && Z.hole && Z.hole.kind === 'length' && Z.hole.pic.startsWith(grade === 1 ? 'gap:' : 'gapcm:') && Z.stones.length === 3 && Z.stones.every(s => grade === 1 ? s.pic === 'plank:' + s.num : s.pic === null) && snap.targets.filter(t => t.kind === 'puzzle').length === 3, opened ? Z.id : 'S08P 안 열림 ' + snap.screen);
    if (!opened) continue;
    const wrongSlot = [0, 1, 2].find(x => x !== g.puzzle.cur.answer[0]); push(g, 'SELECT', { slot: wrongSlot }); let wrong = false, hint = false;
    for (let i = 0; i < 60 * 4; i++) { f.step(1 / 60); f.drainEvents(); const s2 = g.snapshot(); if (s2.puzzle && s2.puzzle.state === 'wrong') wrong = true; if (wrong && s2.puzzle && s2.puzzle.state === 'open' && s2.puzzle.wrong === 1) { hint = !!s2.puzzle.hint; break; } }
    ok(`${grade}학년 틀린 널빤지 → wrong → 다시 열림 + 힌트`, wrong && hint);
    push(g, 'SELECT', { slot: g.puzzle.cur.answer[0] }); let right = false, back = false;
    for (let i = 0; i < 60 * 5; i++) { f.step(1 / 60); f.drainEvents(); const s2 = g.snapshot(); if (s2.puzzle && s2.puzzle.state === 'right') right = true; if (right && s2.screen === 'S08') { back = true; break; } }
    ok(`${grade}학년 맞는 널빤지 → right → S08 길 열림`, right && back && g.stats.puzzleRight === 1); } }

// ── 3. 봇 1·2학년 완주 — 퍼즐 1 · 로그 puzzle:length-bridge
{ for (const grade of [1, 2]) { let wins = 0, pzs = 0; const rec = []; for (const seed of [11, 12, 13]) { const r = playOne({ data, seed, grade, acc: .8, stage: 'canyon-3-1', rand: createRng(seed * 3 + grade).next, record: seed === 11 ? rec : null }); if (r.win) wins++; pzs += r.puzzles || 0; if (seed === 11) { const lg = (r.log || []).filter(x => x.type === 'puzzle:length-bridge'); ok(`${grade}학년 로그 puzzle:length-bridge 1 · 개념 ${grade === 1 ? 'g1.cmp.long' : 'g2.len.ruler'}`, lg.length === 1 && lg[0].concept === (grade === 1 ? 'g1.cmp.long' : 'g2.len.ruler'), JSON.stringify(lg.map(x => x.concept))); } }
    ok(`봇 ${grade}학년 canyon-3-1 3판 완주 · 퍼즐 3`, wins === 3 && pzs === 3, `wins ${wins} pz ${pzs}`); } }

// ── 4. 숲·신전 퍼즐 무변경
{ ok('숲 4판·신전 2판에 length-bridge 없음', ['forest-1-1', 'forest-1-2', 'forest-1-3', 'forest-1-boss', 'temple-2-1', 'temple-2-boss'].every(id => data.stages[id].zones.every(z => !z.puzzle || z.puzzle.type !== 'length-bridge'))); }

console.table(out); console.log(fail ? `✗ ${fail} 실패` : '✓ 전부 통과');
process.exit(fail ? 1 : 0);
