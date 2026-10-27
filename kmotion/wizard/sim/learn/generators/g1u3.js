// 1학년 1학기 3단원 「덧셈과 뺄셈」(9까지) 생성기 — 08 문서 6절
// 각 생성기: gen(rng, d) → 문제 · verify(q) → 다른 방법(구슬 세기)으로 정답 대조
import { wa, eun, eul } from '../josa.js';
const beads = (a, b, op) => { let n = 0; const s = []; for (let i = 0; i < a; i++) s.push(1); if (op === '+') for (let i = 0; i < b; i++) s.push(1); else for (let i = 0; i < b; i++) s.pop(); return s.length + n; };
const lvl = (rng, d) => rng.next() < d;   // d 높을수록 큰 수

export const G1U3 = {
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
