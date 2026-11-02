// v2.11 월드 2 「도형의 신전」 모양 열쇠 문(16 문서 8절 ③) — node tests/sim/p15.mjs
// shape-key 생성기 학년 줄(1 물건→입체 · 2 평면 · 3·4 직각 도형) 정답 하나·개념 오답 / 스냅샷 hole·stones[].pic / 봇 1~4학년 temple-2-1 완주(열쇠 문 지남) / 숲 4판 퍼즐 종류 불변(골든은 golden.mjs)
import { createGame } from '../../sim/game/game.js';
import { makePuzzle, verifyPuzzle, SHAPE_KEY_SETS } from '../../sim/learn/puzzles.js';
import { PIC, FAMILY, CODES } from '../../sim/learn/pics.js';
import { picHtml } from '../../skins/proto/pics.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const T = data.text, ST = data.stages['temple-2-1'];
const fam = c => FAMILY[PIC[c]];
const BAN = /예각|둔각|이등변|정삼각형|수직|평행|사다리꼴|마름모|다각형|대각선|90°|원주율|둘레|이등분|타원|π/;

// ── 1. 장면·문구
{ const rb = ST.zones.find(z => z.id === 'rail-b');
  ok('temple-2-1 길 B 60% = shape-key · 길 위 몬스터 0(숲 퍼즐 길과 같은 규칙)', rb.puzzle && rb.puzzle.type === 'shape-key' && rb.puzzle.at === .6 && rb.enemies.length === 0);
  ok('숲 4판 퍼즐 종류 무변경(shape-key 0)', ['forest-1-1', 'forest-1-2', 'forest-1-3', 'forest-1-boss'].every(id => data.stages[id].zones.every(z => !z.puzzle || z.puzzle.type !== 'shape-key')));
  const keys = ['pz.key', 'pz.key.solid', 'pz.key.hint', 'pz.key.solid.hint', 'pz.key.hint.rtri', 'pz.key.hint.rect', 'pz.key.hint.square', 'pz.key.hint.rangle', 'pz.keyWrong'];
  ok('문구 키 9', keys.every(k => typeof T[k] === 'string' && T[k].length > 0), keys.filter(k => !T[k]).join());
  ok('4학년↑ 낱말 0', !BAN.test(keys.map(k => T[k]).join('\n')));
  ok('SHAPE_KEY_SETS: 2학년 3묶음 · 3학년 4묶음(직각삼각형·직사각형·정사각형·직각) · 전부 CODES 에 있음', SHAPE_KEY_SETS.g2.length === 3 && SHAPE_KEY_SETS.g3.length === 4 && [...SHAPE_KEY_SETS.g2, ...SHAPE_KEY_SETS.g3].every(s => CODES[s.answer] && CODES[s.hole] && s.wrongs.every(w => !!CODES[w]))); }

// ── 2. 생성기 300문씩(학년별)
{ const run = (grade, f) => { const rng = createRng(15 + grade); let bad = 0, seen = new Set(); for (let i = 0; i < 300; i++) { const p = makePuzzle('shape-key', rng, grade); seen.add(p.hole.pic); if (!f(p)) bad++; } return { bad, seen }; };
  const base = p => p.type === 'shape-key' && p.need === 1 && p.stones.length === 3 && p.answer.length === 1 && p.stones.every(s => !!PIC[s.num]) && new Set(p.stones.map(s => s.num)).size === 3 && verifyPuzzle(p) && typeof p.hole.pic === 'string' && /^<svg/.test(picHtml(p.hole.pic)) && typeof T[p.prompt.key] === 'string' && typeof T[p.hint1.key] === 'string';
  const one = p => p.stones.filter(s => fam(s.num) === p.hole.family).length === 1 && fam(p.stones[p.answer[0]].num) === p.hole.family;
  const r1 = run(1, p => base(p) && one(p) && p.hole.kind === 'solid' && p.concept === 'g1.solid.same' && p.stones.map(s => s.num).sort().join() === '7,8,9');
  ok('1학년 300: 물건 구멍 → 입체 열쇠 7·8·9 전부 · 정답 = 물건의 입체 · proto 가 물건을 그림', r1.bad === 0 && r1.seen.size === 9, `bad ${r1.bad} 물건 ${r1.seen.size}`);
  const r2 = run(2, p => base(p) && one(p) && p.hole.kind === 'plane' && p.concept === 'g2.plane.pick' && ['tri', 'quad', 'circ'].includes(p.hole.family) && p.stones[p.answer[0]].num !== PIC_CODE(p.hole.pic) && p.stones.map(s => fam(s.num)).sort().join() === 'circ,quad,tri');
  ok('2학년 300: 평면 구멍 → 같은 묶음의 다른 변형이 정답 · 보기 = 삼각형·사각형·원 하나씩 · 구멍 6종 다 나옴', r2.bad === 0 && r2.seen.size === 6, `bad ${r2.bad} 구멍 ${r2.seen.size}`);
  const r3 = run(3, p => { if (!(base(p) && one(p) && p.hole.kind === 'plane')) return false; const h = p.hole.family, ws = p.stones.filter((_, i) => i !== p.answer[0]).map(s => fam(s.num));
    if (h === 'rtri') return p.concept === 'g3.right.find' && ws.includes('tri') && ws.includes('rect');
    if (h === 'rect') return p.concept === 'g3.quad.right' && ws.includes('quad') && ws.includes('rtri') && !ws.includes('square');
    if (h === 'square') return p.concept === 'g3.quad.right' && ws.includes('rect') && ws.includes('quad');
    if (h === 'rangle') return p.concept === 'g3.right.find' && ws.every(w => w === 'angle') && new Set(p.stones.map(s => s.num)).size === 3;
    return false; });
  ok('3학년 300: 직각삼각형(오답 직각 없는 삼각형·직사각형) · 직사각형(오답 직각 없는 사각형·직각삼각형, 정사각형 없음) · 정사각형(오답 직사각형·직각 없는 사각형) · 직각(오답 직각 아닌 각 2) · 구멍 8종', r3.bad === 0 && r3.seen.size === 8, `bad ${r3.bad} 구멍 ${r3.seen.size}`);
  const r4 = run(4, p => base(p) && one(p) && ['iso', 'equi', 'atri', 'otri'].includes(p.hole.family));   // v2.14 4학년 진짜 줄(세부는 p17)
  ok('4학년 = 4-1 삼각형 줄(v2.14)', r4.bad === 0 && r4.seen.size === 8, `bad ${r4.bad} 구멍 ${r4.seen.size}`);
  ok('verify: 직사각형 구멍에 정사각형 돌이 섞이면 거짓(두 답 방지)', !verifyPuzzle({ type: 'shape-key', hole: { family: 'rect', kind: 'plane' }, stones: [{ slot: 0, num: 19 }, { slot: 1, num: 21 }, { slot: 2, num: 23 }], answer: [0] }) && !verifyPuzzle({ type: 'shape-key', hole: { family: 'tri', kind: 'plane' }, stones: [{ slot: 0, num: 1 }, { slot: 1, num: 2 }, { slot: 2, num: 3 }], answer: [0] })); }
function PIC_CODE(id){ return +Object.keys(PIC).find(k => PIC[k] === id); }

// ── 3. 스냅샷: 길 B 60% 에서 S08P · hole·stones[].pic · targets 3 · 열쇠 맞히면 길 열림 / 3번 틀리면 reveal 통과
import { GAME } from '../../sim/game/config.js';
import { createFlow } from '../../sim/flow/screens.js';
const RL = GAME.rail; const push = (g, type, value = {}) => g.input.push({ type, t: g.t * 1000, via: 'key', value });
function toPuzzle(grade, seed){ const f = createFlow({ data, grade, seed, startZone: 2, stage: 'temple-2-1', forceStage: true }); f.action('start', { mode: 'keyboard' }); f.action('enter'); const g = f.game; let steer = null;   // p3 toPuzzle 과 같은 길 봇(바위 비키기·가지 숙이기), 길 위 슬라임은 마법으로
  for (let i = 0; i < 60 * 90 && g.screen !== 'S08P' && g.screen !== 'S14'; i++) { const s = g.snapshot(); const nxt = s.obstacles.filter(o => o.state === 'ahead' && o.pos[2] > -.5).sort((a, b) => a.pos[2] - b.pos[2])[0];
    if (nxt) { const want = nxt.kind === 'rock' ? (nxt.x <= 0 ? RL.xMax : -RL.xMax) : nxt.kind === 'branch' ? g.player.pos[0] : nxt.pos[0]; if (steer !== want) { steer = want; push(g, 'MOVE', { u: want / RL.xMax }); } push(g, 'DUCK', { on: nxt.kind === 'branch' }); }
    if (s.enemies.some(e => e.state !== 'dead' && e.state !== 'spawn') && i % 40 === 0) push(g, 'ATTACK', { zone: 1, side: 'R' });
    if (s.screen === 'S08Q' && s.question && s.question.state === 'open') push(g, 'SELECT', { slot: g.q.v.correctSlot });
    f.step(1 / 60); f.drainEvents(); } return { f, g }; }
{ for (const grade of [1, 2, 3]) { const { f, g } = toPuzzle(grade, 40 + grade); const snap = g.snapshot(); const opened = snap.screen === 'S08P' && snap.puzzle && snap.puzzle.state === 'open'; const Z = snap.puzzle;
    ok(`${grade}학년 길 B: S08P shape-key · hole pic·name · stones 3 전부 pic · targets 3 · camera puzzle`, opened && Z.type === 'shape-key' && Z.hole && typeof Z.hole.pic === 'string' && Z.hole.name && Z.stones.length === 3 && Z.stones.every(s => typeof s.pic === 'string' && PIC[s.num] === s.pic) && snap.targets.filter(t => t.kind === 'puzzle').length === 3 && snap.camera.mode === 'puzzle', opened ? Z.id + ' ' + Z.hole.pic : 'S08P 안 열림 ' + snap.screen);
    if (!opened) continue;
    const wrongSlot = [0, 1, 2].find(x => x !== g.puzzle.cur.answer[0]); push(g, 'SELECT', { slot: wrongSlot }); let wrong = false, hint = false, reopened = false;
    for (let i = 0; i < 60 * 4; i++) { f.step(1 / 60); f.drainEvents(); const s2 = g.snapshot(); if (s2.puzzle && s2.puzzle.state === 'wrong' && s2.puzzle.stones.some(x => x.wrong && x.slot === wrongSlot)) wrong = true; if (wrong && s2.puzzle && s2.puzzle.state === 'open' && s2.puzzle.wrong === 1) { reopened = true; hint = !!s2.puzzle.hint; break; } }
    ok(`${grade}학년 틀린 열쇠 → wrong(그 돌 wrong) → 다른 구멍으로 다시 열림 · 🦉 힌트 켜짐`, wrong && reopened && hint);
    push(g, 'SELECT', { slot: g.puzzle.cur.answer[0] }); let right = false, back = false;
    for (let i = 0; i < 60 * 5; i++) { f.step(1 / 60); f.drainEvents(); const s2 = g.snapshot(); if (s2.puzzle && s2.puzzle.state === 'right' && s2.puzzle.stones.some(x => x.answer)) right = true; if (right && s2.screen === 'S08') { back = true; break; } }
    ok(`${grade}학년 맞는 열쇠 → right(정답 돌 answer) → S08 길 열림 · 마나 +${GAME.rail.puzzle.mana}`, right && back && g.stats.puzzleRight === 1); } }

// ── 4. 봇 1~4학년 완주 — 퍼즐 1 · 로그에 puzzle:shape-key(개념 = 그 학년 줄)
{ for (const grade of [1, 2, 3, 4]) { let wins = 0, pzs = 0, right = 0; const rec = [];
    for (const seed of [11, 12, 13]) { const r = playOne({ data, seed, grade, acc: .8, stage: 'temple-2-1', rand: createRng(seed * 3 + grade).next, record: seed === 11 ? rec : null }); if (r.win) wins++; pzs += r.puzzles || 0; right += r.pzRight || 0; }
    ok(`봇 ${grade}학년 temple-2-1 3판 완주 · 모양 열쇠 문 3판 다 지남`, wins === 3 && pzs === 3, `wins ${wins} pz ${right}/${pzs}`); }
  const r = playOne({ data, seed: 11, grade: 2, acc: 1, stage: 'temple-2-1', rand: createRng(5).next });
  const pz = (r.log || []).filter(l => l.type === 'puzzle:shape-key');
  ok('2학년 정확도 1 봇: 로그 puzzle:shape-key 1 · 맞힘 · concept g2.plane.pick · via puzzle', pz.length === 1 && pz[0].correct && pz[0].concept === 'g2.plane.pick' && pz[0].via === 'puzzle', JSON.stringify(pz[0] || {}).slice(0, 100));
  const r3 = playOne({ data, seed: 12, grade: 3, acc: 0, stage: 'temple-2-1', rand: createRng(6).next });
  const pz3 = (r3.log || []).filter(l => l.type === 'puzzle:shape-key');
  ok('3학년 정확도 0 봇: 3번 틀려 reveal 통과(correct false·wrong 3) · concept 3학년 줄', pz3.length === 1 && !pz3[0].correct && pz3[0].wrong === 3 && ['g3.right.find', 'g3.quad.right'].includes(pz3[0].concept), JSON.stringify(pz3[0] || {}).slice(0, 100));
  // 숲 1-2 길 B·C 퍼즐은 전과 같은 종류(골든 해시는 golden.mjs)
  const rf = playOne({ data, seed: 11, grade: 1, acc: .8, stage: 'forest-1-2', rand: createRng(11).next });
  ok('숲 1-2: 퍼즐 종류 버섯 문·크기 문 그대로', (rf.log || []).filter(l => /^puzzle:/.test(l.type)).map(l => l.type).sort().join() === 'puzzle:mushroom-add,puzzle:size-gate'); }
console.table(out); console.log(fail ? `✗ ${fail} 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
