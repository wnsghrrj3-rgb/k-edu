// 3학년 1학기 4단원 「곱셈」 생성기 — 08 문서 6절 · 정본 kedu/curriculum/math/g3/unit4 [4수01-04]
// 범위 경계(정본): (몇십)×(몇)·(몇십몇)×(몇)만, 곱하는 수 한 자리, 결과 ≤ 999. (세 자리)×(한 자리)·(두 자리)×(두 자리)는 3-2.
// 변환표 키 `g3.mul.2x1` 하나에 (몇십)×(몇)·올림 없음·십의 자리 올림·일의 자리 올림·두 자리 올림이 d 로 나뉘어 들어간다. 문장제 1종은 보스 마지막 칸.
// 오개념(정본): 10배 누락 20×3=6(tens-miss) · 부분 곱 따로 씀 30×3=90, 2×3=6 → 「906」(partial-side) · 올림한 수 안 더함(carry-miss) · 올림을 결과에 바로 씀 47×6=2442(carry-side) · 더함(add-instead)
import { wIga } from '../josa.js';
const THINGS = [['사탕', '개'], ['구슬', '개'], ['연필', '자루'], ['색종이', '장'], ['비즈', '개'], ['쿠키', '개'], ['우표', '장'], ['블록', '개']];
// 검산용: 반복 덧셈(gen 의 × 와 다른 방법)
const repAdd = (a, b) => { let s = 0; for (let i = 0; i < b; i++) s += a; return s; };
const tens = a => Math.floor(a / 10), ones = a => a % 10;
const carryMiss = (a, b) => tens(a) * b * 10 + (ones(a) * b) % 10;                                                      // 일의 자리 올림을 더하지 않음
const carrySide = (a, b) => { const o = ones(a) * b, t = tens(a) * b; return o >= 10 ? t * 100 + o : t * 10 + o; };    // 올림을 결과에 나란히(47×6 → 24 42 → 2442)
const partialSide = (a, b) => { const t = tens(a) * b * 10, o = ones(a) * b; return o >= 10 ? t * 100 + o : t * 10 + o; };   // 부분 곱을 안 더하고 이어 씀(30×3=90, 2×3=6 → 906)
const kinds = ['tens', 'noCarry', 'carryTens', 'carryOnes', 'carryBoth'];
function pickMul(rng, kind){ for (let t = 0; t < 80; t++) { const b = rng.int(2, 9); let a; if (kind === 'tens') a = rng.int(1, 9) * 10; else a = rng.int(11, 99); if (a % 10 === 0 && kind !== 'tens') continue;
    const oc = ones(a) * b >= 10, tc = tens(a) * b + (oc ? Math.floor(ones(a) * b / 10) : 0) >= 10;
    const okKind = kind === 'tens' ? true : kind === 'noCarry' ? !oc && !tc : kind === 'carryTens' ? !oc && tc : kind === 'carryOnes' ? oc && !tc : oc && tc;
    if (okKind && a * b <= 999) return [a, b]; }
  return kind === 'tens' ? [20, 3] : kind === 'noCarry' ? [32, 3] : kind === 'carryTens' ? [52, 3] : kind === 'carryOnes' ? [26, 3] : [47, 6]; }
const dOf = { tens: .15, noCarry: .3, carryTens: .5, carryOnes: .65, carryBoth: .85 };

const BASE = {
  'g3.mul.2x1': { id: 'mul2x1', gen(rng, d){ const kind = rng.next() < d ? rng.pick(['carryTens', 'carryOnes', 'carryBoth']) : rng.pick(['tens', 'noCarry', 'carryTens']); const [a, b] = pickMul(rng, kind), ans = a * b;
      const wrongs = kind === 'tens' ? [[tens(a) * b, 'tens-miss'], [a + b, 'add-instead'], [ans + 10, 'off-ten'], [ans - 10, 'off-ten']]
        : [[carryMiss(a, b), 'carry-miss'], [carrySide(a, b), 'carry-side'], [partialSide(a, b), 'partial-side'], [a + b, 'add-instead'], [ans + 10, 'off-ten'], [ans - 10, 'off-ten']];
      return { concept: 'g3.mul.2x1', fact: `mul:${a},${b}`, d: dOf[kind] + (b - 2) / 7 * .05, type: kind === 'tens' || kind === 'noCarry' ? 'calc1' : 'calc2', prompt: { key: 'q.g3.mul', args: { a, b } }, a, b, op: '×', answer: ans, kind, wrongs }; },
    verify: q => repAdd(q.a, q.b) === q.answer && q.a >= 10 && q.a <= 99 && q.b >= 2 && q.b <= 9 && q.answer <= 999 },
  // 문장제 — 「한 상자에 a개씩 b상자. 모두 몇 개?」(등비 모으기)
  'g3.mul.word': { id: 'mulWord', word: true, gen(rng, d){ const kind = rng.next() < d ? rng.pick(['carryOnes', 'carryBoth']) : rng.pick(['tens', 'noCarry', 'carryTens']); const [a, b] = pickMul(rng, kind), ans = a * b; const [n, u] = rng.pick(THINGS);
      return { concept: 'g3.mul.word', fact: `mulw:${a},${b}`, d: dOf[kind] + .05, type: 'word1', prompt: { key: 'q.g3.word.box', args: { n, u, a, b, j1: wIga(n) } }, a, b, op: '×', answer: ans, kind,
        wrongs: [[a + b, 'add-instead'], [kind === 'tens' ? tens(a) * b : carryMiss(a, b), kind === 'tens' ? 'tens-miss' : 'carry-miss'], [ans + 10, 'off-ten'], [ans - 10, 'off-ten']] }; },
    verify: q => repAdd(q.a, q.b) === q.answer && q.a >= 10 && q.a <= 99 && q.b >= 2 && q.answer <= 999 },
};
const HINT1 = { 'g3.mul.2x1': q => q.kind === 'tens' ? 'hint.g3.mulTens' : 'hint.g3.mulSplit', 'g3.mul.word': q => q.kind === 'tens' ? 'hint.g3.mulTens' : 'hint.g3.mulSplit' };
export const G3_1_U4 = {};
for (const [k, g] of Object.entries(BASE)) G3_1_U4[k] = Object.assign({}, g, { unit: 'g3-1-u4', max: 999, gen(rng, d, opt){ const q = g.gen(rng, d, opt);
  q.type = q.type || 'calc1'; q.hint1 = { key: HINT1[k](q), args: { a: q.a, b: q.b, t: tens(q.a) * 10, o: ones(q.a), tb: tens(q.a) * q.b } }; q.hint2 = null; return q; } });
