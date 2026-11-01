// 3학년 2학기 1단원 「곱셈」 생성기 — 08 문서 6절 · 정본 kedu/curriculum/math/g3_2/unit1 [4수01-04·08]
// 이 파일의 몫 = **(세 자리)×(한 자리)** 만(정본 l02 올림 0회 · l03 1회 · l04 2회↑). (몇십)×(몇십)·(두 자리)×(두 자리)(l05~l08)는 오푸스 14 문서 #11 이 이 파일에 키를 **더한다**(등록부·unit 그대로).
// 왜 지금: 변환표(concepts-by-grade.json) 4학년 장면 키 `g3.mul.3x1` — 4학년 장면은 두 자리 ÷ 한 자리·세 자리 × 한 자리(15 문서 7절 묶음 수 범위에 맞춘 것)라 교육과정상 3-2 내용이다(진짜 4-1 3단원 (세 자리)×(두 자리)는 구슬 자릿수·묶음 상한 96 을 넘음). 키 접두는 gen.mjs 규칙대로 unit 학년(g3).
// 오개념(정본 l03~l04·3-1 4단원 계보): 올림한 수 안 더함(carry-miss) · 올림을 결과에 나란히 씀 426×3=12618(carry-side) · 부분 곱 이어 씀(partial-side: 백의 곱과 나머지 곱을 더하지 않고 이어 씀 — 217×2 → 4·34 → 「434」) · 더함(add-instead) · 십 자리 빠뜨림(off-ten)
import { wIga } from '../josa.js';
const THINGS = [['고구마', '개'], ['블루베리', '개'], ['방울토마토', '개'], ['구슬', '개'], ['색종이', '장'], ['쿠키', '개'], ['우표', '장'], ['블록', '개']];
// 검산용: 반복 덧셈(gen 의 × 와 다른 방법)
const repAdd = (a, b) => { let s = 0; for (let i = 0; i < b; i++) s += a; return s; };
const dg = a => [a % 10, Math.floor(a / 10) % 10, Math.floor(a / 100) % 10];   // [일, 십, 백]
// 올림 횟수(일→십, 십→백, 백→천)
const carries = (a, b) => { const D = dg(a); let c = 0, n = 0; for (let i = 0; i < 3; i++) { const p = D[i] * b + c; c = Math.floor(p / 10); if (c > 0) n++; } return n; };
// 오개념 값
const carryMiss = (a, b) => { const D = dg(a); let r = 0, m = 1; for (let i = 0; i < 3; i++) { r += ((D[i] * b) % 10) * m; m *= 10; } return r + Math.floor(D[2] * b / 10) * 1000; };   // 올림을 다음 자리에 더하지 않음(천의 자리만 그대로)
const carrySide = (a, b) => { const D = dg(a); let r = 0, m = 1; for (let i = 0; i < 3; i++) { const p = D[i] * b; r += p * m; m *= p >= 10 ? 100 : 10; } return r; };          // 각 자리 곱을 그대로 나란히(426×3 → 18·6·12 → 12618)
const partialSide = (a, b) => { const hi = Math.floor(a / 100) * b, lo = (a % 100) * b; return hi * (lo >= 100 ? 1000 : lo >= 10 ? 100 : 10) + lo; };                       // 백의 곱과 나머지 곱을 안 더하고 이어 씀(143×2 → 2·86 → 286)
const kinds = ['noCarry', 'carry1', 'carry2'];
function pickMul(rng, kind){ for (let t = 0; t < 80; t++) { const b = rng.int(2, 9), a = rng.int(100, 999); const n = carries(a, b);
    const okKind = kind === 'noCarry' ? n === 0 : kind === 'carry1' ? n === 1 : n >= 2;
    if (okKind && a * b <= 9999) return [a, b]; }
  return kind === 'noCarry' ? [143, 2] : kind === 'carry1' ? [217, 2] : [426, 3]; }
const dOf = { noCarry: .25, carry1: .5, carry2: .8 };

const BASE = {
  'g3.mul.3x1': { id: 'mul3x1', gen(rng, d){ const kind = rng.next() < d ? rng.pick(['carry1', 'carry2', 'carry2']) : rng.pick(['noCarry', 'noCarry', 'carry1']); const [a, b] = pickMul(rng, kind), ans = a * b;
      return { concept: 'g3.mul.3x1', fact: `mul3:${a},${b}`, d: dOf[kind] + (b - 2) / 7 * .1, type: kind === 'noCarry' ? 'calc1' : 'calc2', prompt: { key: 'q.g3.mul', args: { a, b } }, a, b, op: '×', answer: ans, kind,
        wrongs: [[carryMiss(a, b), 'carry-miss'], [carrySide(a, b), 'carry-side'], [partialSide(a, b), 'partial-side'], [a + b, 'add-instead'], [ans + 10, 'off-ten'], [ans - 10, 'off-ten'], [ans + 100, 'off-hundred'], [ans - 100, 'off-hundred']] }; },
    verify: q => repAdd(q.a, q.b) === q.answer && q.a >= 100 && q.a <= 999 && q.b >= 2 && q.b <= 9 && q.answer <= 9999 },
  // 문장제 — 「한 자루에 a개씩 b자루. 모두 몇 개?」(정본 l02 고구마 143개씩 2자루)
  'g3.mul3.word': { id: 'mul3Word', word: true, gen(rng, d){ const kind = rng.next() < d ? rng.pick(['carry1', 'carry2']) : rng.pick(['noCarry', 'carry1']); const [a, b] = pickMul(rng, kind), ans = a * b; const [n, u] = rng.pick(THINGS);
      return { concept: 'g3.mul3.word', fact: `mul3w:${a},${b}`, d: dOf[kind] + .05, type: 'word1', prompt: { key: 'q.g3.word.sack', args: { n, u, a, b, j1: wIga(n) } }, a, b, op: '×', answer: ans, kind,
        wrongs: [[a + b, 'add-instead'], [carryMiss(a, b), 'carry-miss'], [partialSide(a, b), 'partial-side'], [ans + 10, 'off-ten'], [ans - 10, 'off-ten'], [ans + 100, 'off-hundred']] }; },
    verify: q => repAdd(q.a, q.b) === q.answer && q.a >= 100 && q.a <= 999 && q.b >= 2 && q.b <= 9 && q.answer <= 9999 },
};
const HINT1 = { 'g3.mul.3x1': q => q.kind === 'noCarry' ? 'hint.g3.mul3Split' : 'hint.g3.mul3Col', 'g3.mul3.word': q => 'hint.g3.mul3Split' };
export const G3_2_U1 = {};
for (const [k, g] of Object.entries(BASE)) G3_2_U1[k] = Object.assign({}, g, { unit: 'g3-2-u1', max: 9999, gen(rng, d, opt){ const q = g.gen(rng, d, opt);
  q.type = q.type || 'calc1'; q.hint1 = { key: HINT1[k](q), args: { a: q.a, b: q.b, h: Math.floor(q.a / 100) * 100, lo: q.a % 100, hb: Math.floor(q.a / 100) * 100 * q.b } }; q.hint2 = null; return q; } });
