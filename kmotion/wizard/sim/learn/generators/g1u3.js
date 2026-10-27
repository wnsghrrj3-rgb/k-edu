// 1학년 1학기 3단원 「덧셈과 뺄셈」(9까지) 생성기 — 08 문서 6절
// 각 생성기: gen(rng, d) → 문제 · verify(q) → 다른 방법(구슬 세기)으로 정답 대조
import { wa, eun, eul, wIga, wEun } from '../josa.js';
// 문장제 재료(08 문서 7절) — 동물·물건, 세는 말
const THINGS = [['곰', '마리'], ['토끼', '마리'], ['다람쥐', '마리'], ['개구리', '마리'], ['새', '마리'], ['사과', '개'], ['사탕', '개'], ['구슬', '개'], ['연필', '자루'], ['풍선', '개']];
const pair = rng => { const i = rng.int(0, THINGS.length - 1); let j = rng.int(0, THINGS.length - 2); if (j >= i) j++; return [THINGS[i], THINGS[j]]; };
const beads = (a, b, op) => { let n = 0; const s = []; for (let i = 0; i < a; i++) s.push(1); if (op === '+') for (let i = 0; i < b; i++) s.push(1); else for (let i = 0; i < b; i++) s.pop(); return s.length + n; };
const lvl = (rng, d) => rng.next() < d;   // d 높을수록 큰 수

const BASE = {
  'g1.compose9': { id: 'compose9', gen(rng, d){ const sum = lvl(rng, d) ? rng.int(6, 9) : rng.int(3, 6); const a = rng.int(1, sum - 1), b = sum - a;
      return { concept: 'g1.compose9', fact: `add:${a},${b}`, d: .15 + (sum - 3) / 6 * .5, prompt: { key: 'q.compose', args: { a, b, j1: wa(a), j2: eul(b) } }, a, b, op: '+', answer: sum,
        wrongs: [[sum + 1, 'off-by-one'], [sum - 1, 'off-by-one'], [Math.max(a, b), 'pick-larger']] }; },
    verify: q => beads(q.a, q.b, '+') === q.answer && q.answer <= 9 },
  'g1.decompose9': { id: 'decompose9', gen(rng, d){ const n = lvl(rng, d) ? rng.int(6, 9) : rng.int(2, 6); const k = rng.int(1, n - 1), ans = n - k;
      return { concept: 'g1.decompose9', fact: `dec:${n},${k}`, d: .2 + (n - 2) / 7 * .5, prompt: { key: 'q.decompose', args: { n, k, j1: eun(n), j2: wa(k) } }, a: n, b: k, op: '-', answer: ans,
        wrongs: [[k, 'even-split'], [n, 'whole'], [ans + 1, 'off-by-one'], [ans - 1, 'off-by-one']] }; },
    verify: q => beads(q.a, q.b, '-') === q.answer && q.answer >= 1 },
  'g1.add.expr9': { id: 'addExpr9', gen(rng, d){ const sum = lvl(rng, d) ? rng.int(6, 9) : rng.int(2, 6); const a = rng.int(1, sum - 1), b = sum - a;
      return { concept: 'g1.add.expr9', fact: `add:${a},${b}`, d: .1 + (sum - 2) / 7 * .5, prompt: { key: 'q.add', args: { a, b } }, a, b, op: '+', answer: sum,
        wrongs: [[sum + 1, 'off-by-one'], [sum - 1, 'off-by-one'], [Math.abs(a - b), 'sub-instead']] }; },
    verify: q => beads(q.a, q.b, '+') === q.answer && q.answer <= 9 },
  'g1.sub.expr9': { id: 'subExpr9', gen(rng, d){ const a = lvl(rng, d) ? rng.int(6, 9) : rng.int(2, 6), b = rng.int(1, a - 1), ans = a - b;
      return { concept: 'g1.sub.expr9', fact: `sub:${a},${b}`, d: .2 + (a - 2) / 7 * .5, prompt: { key: 'q.sub', args: { a, b } }, a, b, op: '-', answer: ans,
        wrongs: [[a + b, 'add-instead'], [ans + 1, 'off-by-one'], [ans - 1, 'off-by-one']] }; },
    verify: q => beads(q.a, q.b, '-') === q.answer && q.answer >= 0 },
  'g1.zero.op': { id: 'zeroOp', gen(rng){ const n = rng.int(1, 9), kind = rng.pick(['+0', '-0', '-n']);
      const a = n, b = kind === '-n' ? n : 0, op = kind === '+0' ? '+' : '-', ans = op === '+' ? n : n - b;
      const wrongs = kind === '-n' ? [[n, 'zero-whole'], [1, 'off-by-one']] : [[n + 1, 'zero-adds-one'], [kind === '-0' ? n - 1 : 0, kind === '-0' ? 'off-by-one' : 'zero-adds-one']];
      return { concept: 'g1.zero.op', fact: `zero:${a}${op}${b}`, d: .25, prompt: { key: op === '+' ? 'q.add' : 'q.sub', args: { a, b } }, a, b, op, answer: ans, wrongs }; },
    verify: q => beads(q.a, q.b, q.op) === q.answer },
};
// 문장제 2종(08 문서 59행·64행 — 보스 3페이즈 마지막 칸 「복합 문제」) — type word1, 게이지 24
BASE['g1.compare.word'] = { id: 'compareWord', word: true, gen(rng, d){ const a = lvl(rng, d) ? rng.int(6, 9) : rng.int(3, 6), b = rng.int(1, a - 1), ans = a - b; const [[n1, u1], [n2]] = pair(rng); const u = u1;
    return { concept: 'g1.compare.word', type: 'word1', fact: `cmp:${a},${b}`, d: .3 + (a - 3) / 6 * .5, prompt: { key: 'q.word.compare', args: { n1, n2, a, b, u, j1: wIga(n1), j2: wIga(n2), j3: wEun(n1) } }, a, b, op: '-', answer: ans,
      wrongs: [[a + b, 'add-instead'], [b, 'smaller-whole'], [ans + 1, 'off-by-one'], [ans - 1, 'off-by-one']] }; },
  verify: q => beads(q.a, q.b, '-') === q.answer && q.answer >= 1 };
BASE['g1.join.word'] = { id: 'joinWord', word: true, gen(rng, d){ const sum = lvl(rng, d) ? rng.int(6, 9) : rng.int(3, 6); const a = rng.int(1, sum - 1), b = sum - a; const [[n1, u1], [n2]] = pair(rng); const u = u1;
    return { concept: 'g1.join.word', type: 'word1', fact: `join:${a},${b}`, d: .25 + (sum - 3) / 6 * .5, prompt: { key: 'q.word.join', args: { n1, n2, a, b, u, j1: wIga(n1), j2: wIga(n2) } }, a, b, op: '+', answer: sum,
      wrongs: [[Math.abs(a - b), 'sub-instead'], [Math.max(a, b), 'pick-larger'], [sum + 1, 'off-by-one'], [sum - 1, 'off-by-one']] }; },
  verify: q => beads(q.a, q.b, '+') === q.answer && q.answer <= 9 };
// 힌트(07 문서 8절): 1단계 = 생각 길잡이 문구 키 · 2단계 = 구슬 그림(a·b·연산) — 모든 생성기에 공통으로 붙임
const HINT1 = { 'g1.compose9': 'hint.addCount', 'g1.add.expr9': 'hint.addCount', 'g1.join.word': 'hint.joinCount', 'g1.decompose9': 'hint.subCount', 'g1.sub.expr9': 'hint.subCount', 'g1.compare.word': 'hint.compare', 'g1.zero.op': 'hint.zero' };
export const G1U3 = {};
for (const [k, g] of Object.entries(BASE)) G1U3[k] = Object.assign({}, g, { gen(rng, d){ const q = g.gen(rng, d); q.type = q.type || 'calc1';
  q.hint1 = { key: HINT1[k], args: { a: q.a, b: q.b } }; q.hint2 = { kind: 'beads', a: q.a, b: q.b, op: q.op }; return q; } });
