// v2.4 방패병 방패 식·길 퍼즐을 3학년 변환표 안으로(D-31 보충) — node tests/sim/p10.mjs
// 변환표 shield/puzzle 줄 읽기 / 1학년 방패 「□ + b = c」·퍼즐 그대로(골든은 golden.mjs) / 3학년 방패 「□ × b = c」 → 문제 fixed g3.shield.mul 정답 = c ÷ b → 정답 방패 깨짐 / 4학년 답 ≤12 / 곱셈 다리·버섯 곱 문·배 규칙 돌 / 봇 3학년 1-2·1-3 완주
import { createFlow } from '../../sim/flow/screens.js';
import { makePuzzle, verifyPuzzle } from '../../sim/learn/puzzles.js';
import { shieldSpec, puzzleSpec } from '../../sim/learn/gradeTable.js';
import { makeEnemy } from '../../sim/game/enemyAI.js';
import { GENERATORS } from '../../sim/learn/questionEngine.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const run = (f, s, until) => { const g = f.game; const ev = []; for (let i = 0; i < 60 * s; i++) { f.step(1 / 60); ev.push(...g.drainEvents()); if (until && until(g.snapshot(), ev)) break; } return ev; };
const push = (g, type, value = {}) => g.input.push({ type, t: 0, via: 'key', value });
const S2 = 'forest-1-2';
const withShield = () => { const d = JSON.parse(JSON.stringify(data)); const z = d.stages[S2].zones.find(z => z.id === 'arena-1'); z.waves = [{ at: .5, spawn: [{ kind: 'shield-goblin', x: 0, z: 6.0 }] }]; return d; };
const flowAt = (d, zone, seed, grade) => { const f = createFlow({ data: d, grade, seed, stage: S2, forceStage: true, startZone: zone }); f.action('start', { mode: 'keyboard' }); f.action('enter'); return f; };

// ── 1. 변환표 줄
{ ok('shield 줄: 1학년 null · 3학년 g3.shield.mul b 2~9 답 2~9 · 4학년 답 2~12', shieldSpec(data, 1) === null && shieldSpec(data, 3).concept === 'g3.shield.mul' && shieldSpec(data, 3).ans[1] === 9 && shieldSpec(data, 4).ans[1] === 12 && !!GENERATORS['g3.shield.mul']);
  ok('puzzle 줄: 1학년 {} · 3학년 bridge/mushroom mul · ruleMul .3', JSON.stringify(puzzleSpec(data, 1)) === '{}' && puzzleSpec(data, 3).bridge === 'mul' && puzzleSpec(data, 3).mushroom === 'mul' && puzzleSpec(data, 3).ruleMul === .3); }

// ── 2. makeEnemy 방패 식 — 1학년 「+」(rng 순서 그대로) · 3학년 「×」 b·c = b×답
{ const def = data.enemies['shield-goblin'], band = { maxEnemies: 4 };
  const r1 = createRng(7), e1 = makeEnemy(def, 1, 0, 6, r1, band, {}); const r1b = createRng(7), c = r1b.int(3, 9), b = r1b.int(1, c - 1);
  ok('1학년: op + · 같은 시드 = 같은 b·c(rng 순서 불변) · concept g1.missing.add9', e1.shield.eq.op === '+' && e1.shield.eq.b === b && e1.shield.eq.c === c && e1.shield.eq.ans === c - b && e1.shield.eq.concept === 'g1.missing.add9', JSON.stringify(e1.shield.eq));
  let all = true, maxAns = 0, maxAns4 = 0; for (let s = 1; s <= 60; s++) { const e = makeEnemy(def, s, 0, 6, createRng(s), band, { shield: shieldSpec(data, 3) }); const q = e.shield.eq; if (!(q.op === '×' && q.b >= 2 && q.b <= 9 && q.ans >= 2 && q.ans <= 9 && q.c === q.b * q.ans && q.concept === 'g3.shield.mul')) all = false; maxAns = Math.max(maxAns, q.ans);
    const e4 = makeEnemy(def, s, 0, 6, createRng(s), band, { shield: shieldSpec(data, 4) }); maxAns4 = Math.max(maxAns4, e4.shield.eq.ans); if (e4.shield.eq.c !== e4.shield.eq.b * e4.shield.eq.ans) all = false; }
  ok('3학년 60개: op × · b 2~9 · 답 2~9 · c = b×답 / 4학년 답 최대 >9 ≤12', all && maxAns <= 9 && maxAns4 > 9 && maxAns4 <= 12, `답 최대 3학년 ${maxAns} 4학년 ${maxAns4}`); }

// ── 3. 3학년 판: 스냅샷 「□ × b = c」 → 수정 → 문제 kind shield · q.shield.mul · 정답 = c ÷ b · 정답 → 방패 깨짐 byMath
{ const f = flowAt(withShield(), 1, 3, 3); const g = f.game; run(f, 4, s => s.crystals.length > 0); const e = g.enemies[0];
  const sn = g.snapshot().enemies.find(x => x.kind === 'shield-goblin'); ok('3학년 스냅샷 shield.eq 「□ × b = c」', sn && /^□ × \d = \d+$/.test(sn.shield.eq), sn && sn.shield.eq);
  const c = g.crystals[0]; push(g, 'MOVE', { u: c.pos[0] / 4 }); run(f, 3, s => s.crystals[0] && s.crystals[0].near); push(g, 'ATTACK', { zone: 1, side: 'R', power: 1 }); run(f, 2, s => s.screen === 'S08Q');
  const q = g.snapshot().question; ok('문제 kind shield · q.shield.mul · 식 = 방패 식 · 정답 = c ÷ b · hint2 groups', q && q.kind === 'shield' && q.prompt.key === 'q.shield.mul' && `□ × ${q.prompt.args.b} = ${q.prompt.args.c}` === sn.shield.eq && g.q.v.answer * q.prompt.args.b === q.prompt.args.c && g.q.v.verified && q.hintPic == null && g.q.v.hint2 && g.q.v.hint2.kind === 'groups', q && `${q.kind} ${q.prompt.key} ${JSON.stringify(q.prompt.args)} ans=${g.q && g.q.v.answer}`);
  ok('보기 3 서로 다름 · 오답에 c(equals-answer) 또는 c−b 포함 가능', g.q.v.choices.length === 3 && new Set(g.q.v.choices.map(x => x.num)).size === 3, JSON.stringify(g.q.v.choices.map(x => `${x.num}:${x.tag}`)));
  run(f, 2.5); push(g, 'SELECT', { slot: g.q.v.correctSlot }); const ev = run(f, 4, s => s.screen === 'S08');
  const br = ev.find(x => x.type === 'enemy:shieldBreak'); ok('정답 → 방패 깨짐(byMath)', !!br && br.byMath && e.shield.broken && e.shield.byMath); }

// ── 4. 1학년 판 회귀: 방패 식 「□ + b = c」 · 문제 q.missing
{ const f = flowAt(withShield(), 1, 3, 1); const g = f.game; run(f, 4, s => s.crystals.length > 0); const sn = g.snapshot().enemies[0];
  const c = g.crystals[0]; push(g, 'MOVE', { u: c.pos[0] / 4 }); run(f, 3, s => s.crystals[0] && s.crystals[0].near); push(g, 'ATTACK', { zone: 1, side: 'R', power: 1 }); run(f, 2, s => s.screen === 'S08Q');
  const q = g.snapshot().question; ok('1학년 회귀: 「□ + b = c」 · q.missing · g1.missing.add9', /^□ \+ \d = \d$/.test(sn.shield.eq) && q && q.prompt.key === 'q.missing' && q.concept === 'g1.missing.add9', sn.shield.eq); }

// ── 5. 퍼즐 생성 — 3학년 spec: 곱셈 다리(두 돌의 곱, 쌍 하나) · 버섯 곱 문 · 배 규칙 돌 / 1학년 spec {} 그대로
{ const sp3 = puzzleSpec(data, 3); let okB = true, okM = true, okR = true, mulSeen = 0, addSeen = 0, mushMax = 0;
  for (let s = 1; s <= 300; s++) { const r = createRng(s);
    const b = makePuzzle('number-bridge', r, 3, { target: 6 }, sp3); if (!(b.op === '×' && verifyPuzzle(b) && b.stones.every(x => x.num >= 2 && x.num <= 9) && b.target >= 6 && b.target <= 72 && b.prompt.key === 'pz.bridge.mul' && b.concept === 'g3.share.mul')) okB = false;
    const m = makePuzzle('mushroom-add', r, 3, {}, sp3); if (!(m.op === '×' && verifyPuzzle(m) && m.mush.a >= 2 && m.mush.a <= 4 && m.target === m.mush.a * m.mush.b && m.prompt.key === 'pz.mush.mul')) okM = false; mushMax = Math.max(mushMax, m.target);
    const ru = makePuzzle('rule-stones', r, 3, {}, sp3); if (!verifyPuzzle(ru)) okR = false; if (ru.mul) { mulSeen++; if (!(ru.seq[2] * ru.mul <= 50 && ru.seq[1] === ru.seq[0] * ru.mul && ru.hint1.key === 'pz.rule.mul.hint')) okR = false; } else { addSeen++; if (!(ru.step && ru.hint1.key === 'pz.rule.hint')) okR = false; } }
  ok('곱셈 다리 300: op × · 돌 2~9 · 곱 쌍 하나(verify) · target 6 무시', okB);
  ok('버섯 곱 문 300: 점 2~4 · 문 = 곱 ≤16 · verify', okM && mushMax <= 16, `문 최대 ${mushMax}`);
  ok('규칙 돌 300: 배 규칙 섞임(약 30%) · ×2/×3 네 번째 돌 ≤50 · 더하기 규칙도 남음', okR && mulSeen > 40 && mulSeen < 140 && addSeen > 100, `배 ${mulSeen} 더하기 ${addSeen}`);
  const a1 = makePuzzle('number-bridge', createRng(4), 1, { target: 6 }), a2 = makePuzzle('number-bridge', createRng(4), 1, { target: 6 }, {});
  ok('1학년 spec {} = 같은 시드 같은 퍼즐(더하기 다리 · op 없음)', !a1.op && JSON.stringify(a1) === JSON.stringify(a2) && a1.target === 6);
  const g2 = makePuzzle('mushroom-add', createRng(9), 2, {}, puzzleSpec(data, 2)); ok('2학년(줄 없음) 버섯 문 = 더하기 그대로', !g2.op && g2.prompt.key === 'pz.mush'); }

// ── 6. 3학년 길 퍼즐 스냅샷 op · 봇 3학년 1-2(방패병·버섯 문·크기 문)·1-3(규칙 돌) 완주
{ const f = createFlow({ data, grade: 3, seed: 5, stage: S2, forceStage: true, startZone: 2 }); f.action('start', { mode: 'keyboard' }); f.action('enter'); const g = f.game;
  run(f, 60, s => s.screen === 'S08P'); const pz = g.snapshot().puzzle; ok('3학년 1-2 길 B 버섯 문 = op × · 문 = 점의 곱', pz && pz.type === 'mushroom-add' && pz.op === '×' && pz.target === pz.mush.a * pz.mush.b, pz && `${pz.type} ${pz.op} ${JSON.stringify(pz.mush)}→${pz.target}`);
  const rows = [], runs = [[S2, 3, 1], [S2, 3, 2], ['forest-1-3', 3, 3], ['forest-1-3', 4, 4]]; let allOk = true;
  for (const [stage, grade, seed] of runs) { const r = playOne({ data, seed, acc: .85, react: .35, grade, stage, maxT: 900, progress: { xp: 0, level: 1 } }); if (!r.win) allOk = false; rows.push({ stage, grade, seed, win: r.win, q: r.q, right: r.right, shields: r.shields, puzzles: `${r.pzRight}/${r.puzzles}`, t: r.t }); }
  console.table(rows); ok('봇 3·4학년 1-2·1-3 4판 완주(이김) · 방패 깨기 있음', allOk && rows[0].shields >= 1, JSON.stringify(rows[0])); }

console.table(out); console.log(fail ? `✗ ${fail}개 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
