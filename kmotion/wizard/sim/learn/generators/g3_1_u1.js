// 3학년 1학기 1단원 「덧셈과 뺄셈」 생성기 — 08 문서 6절 · 정본 kedu/curriculum/math/g3/unit1 [4수01-03]
// 변환표(concepts-by-grade.json) 키 `g3.addsub.3digit` 하나에 받아올림 0~3회 덧셈·받아내림 0~2회(0 처리 포함) 뺄셈이 다 들어간다(장면 개념 키를 안 늘리기 위해 — p9 「배울 것」 3키 그대로). 문장제 1종은 보스 마지막 칸(want 'word').
// 오개념(정본 「덧셈 오류 4종·뺄셈 오류 7종」): 받아올림 안 함(carry-miss) · 더한 결과 나란히 쓰기(carry-side) · 받아내림 안 하고 큰 수−작은 수(borrow-miss) · 받아내림 뒤 1 안 뺌(borrow-keep) · 0에서 못 빼면 0 씀(zero-stay) · 연산 바꿈(add-instead/sub-instead)
import { wIga, wEun } from '../josa.js';
const wEul = w => { const c = w.charCodeAt(w.length - 1); return (c - 0xAC00) % 28 !== 0 ? '을' : '를'; };   // 세는 말(권·개·장) 뒤 을/를
const THINGS = [['책', '권'], ['구슬', '개'], ['사과', '개'], ['우표', '장'], ['동전', '개'], ['종이학', '마리'], ['블록', '개'], ['스티커', '장']];
const digits = n => [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100) % 10, Math.floor(n / 1000) % 10];
// 검산용: 자리별 세로셈을 손으로(gen 의 a+b 와 다른 방법)
const colAdd = (a, b) => { const A = digits(a), B = digits(b); let c = 0, r = 0, m = 1; for (let i = 0; i < 4; i++) { const s = A[i] + B[i] + c; r += (s % 10) * m; c = s >= 10 ? 1 : 0; m *= 10; } return r; };
const colSub = (a, b) => { const A = digits(a), B = digits(b); let br = 0, r = 0, m = 1; for (let i = 0; i < 4; i++) { let s = A[i] - B[i] - br; if (s < 0) { s += 10; br = 1; } else br = 0; r += s * m; m *= 10; } return br === 0 ? r : -1; };
const carries = (a, b) => { const A = digits(a), B = digits(b); let c = 0, n = 0; for (let i = 0; i < 3; i++) { const s = A[i] + B[i] + c; c = s >= 10 ? 1 : 0; n += c; } return n; };
const borrows = (a, b) => { const A = digits(a), B = digits(b); let br = 0, n = 0; for (let i = 0; i < 3; i++) { const s = A[i] - B[i] - br; br = s < 0 ? 1 : 0; n += br; } return n; };
// 오개념 값
const noCarry = (a, b) => { const A = digits(a), B = digits(b); let r = 0, m = 1; for (let i = 0; i < 3; i++) { r += ((A[i] + B[i]) % 10) * m; m *= 10; } return r; };                   // 받아올림 무조건 안 함
const sideBySide = (a, b) => { const A = digits(a), B = digits(b); let r = 0, m = 1; for (let i = 0; i < 3; i++) { const s = A[i] + B[i]; r += s * m; m *= s >= 10 ? 100 : 10; } return r; };   // 더한 결과 나란히(14 → 「14」 그대로)
const bigMinusSmall = (a, b) => { const A = digits(a), B = digits(b); let r = 0, m = 1; for (let i = 0; i < 3; i++) { r += Math.abs(A[i] - B[i]) * m; m *= 10; } return r; };        // 받아내림 없이 큰 수−작은 수
const keepOne = (a, b) => colSub(a, b) + 10 * borrows(a, b);                                                                                                                              // 받아내림 뒤 1 안 뺌(받아내림마다 10 큼)
const zeroStay = (a, b) => { const A = digits(a), B = digits(b); let br = 0, r = 0, m = 1; for (let i = 0; i < 3; i++) { let s = A[i] - B[i] - br; if (A[i] === 0 && B[i] > 0) { s = 0; br = 0; } else if (s < 0) { s += 10; br = 1; } else br = 0; r += s * m; m *= 10; } return r; }; // 0에서 못 빼면 0
// 세 자리 수 두 개 — want = 원하는 받아올림/받아내림 횟수(0~3 / 0~2). 찾을 때까지 다시 뽑음(결정적: rng 만 씀)
function pickAdd(rng, want){ for (let t = 0; t < 80; t++) { const a = rng.int(100, 999), b = rng.int(100, 999); if (carries(a, b) === want) return [a, b]; } return want === 0 ? [123, 456] : want === 1 ? [234, 158] : want === 2 ? [347, 285] : [567, 789]; }
function pickSub(rng, want, zero){ for (let t = 0; t < 80; t++) { const a = zero ? rng.int(1, 9) * 100 + (rng.chance(.5) ? 0 : rng.int(1, 9)) : rng.int(200, 999), b = rng.int(100, a - 1); if (zero && !/0/.test(String(a).slice(0, 3))) continue; const n = borrows(a, b); if (n === want) return [a, b]; } return want === 0 ? [327, 214] : want === 1 ? [453, 138] : [621, 147]; }
const dAdd = c => [.15, .4, .65, .85][c];
const dSub = (n, zero) => Math.min(.9, [.2, .5, .75][n] + (zero ? .1 : 0));

const BASE = {
  'g3.addsub.3digit': { id: 'addSub3', gen(rng, d){
      if (rng.chance(.5)) {   // 덧셈 — d 낮으면 받아올림 0~1, 높으면 2~3
        const want = rng.next() < d ? rng.int(2, 3) : rng.int(0, 1); const [a, b] = pickAdd(rng, want), ans = a + b;
        return { concept: 'g3.addsub.3digit', fact: `add3:${a},${b}`, d: dAdd(carries(a, b)), type: 'calc2', prompt: { key: 'q.add', args: { a, b } }, a, b, op: '+', answer: ans,
          wrongs: [[noCarry(a, b), 'carry-miss'], [sideBySide(a, b), 'carry-side'], [Math.abs(a - b), 'sub-instead'], [ans + 10, 'off-ten'], [ans - 10, 'off-ten']] };
      }
      const zero = rng.next() < d && rng.chance(.35); const want = rng.next() < d ? rng.int(1, 2) : rng.int(0, 1); const [a, b] = pickSub(rng, zero ? Math.max(1, want) : want, zero), ans = a - b;
      return { concept: 'g3.addsub.3digit', fact: `sub3:${a},${b}`, d: dSub(borrows(a, b), zero), type: 'calc2', prompt: { key: 'q.sub', args: { a, b } }, a, b, op: '-', answer: ans,
        wrongs: [[bigMinusSmall(a, b), 'borrow-miss'], [keepOne(a, b), 'borrow-keep'], [zeroStay(a, b), 'zero-stay'], [a + b, 'add-instead'], [ans + 10, 'off-ten']] }; },
    verify: q => (q.op === '+' ? colAdd(q.a, q.b) === q.answer && q.answer <= 1998 : colSub(q.a, q.b) === q.answer && q.answer >= 1) && q.a >= 100 && q.b >= 100 && q.a <= 999 && q.b <= 999 },
  // 문장제(보스 마지막 칸) — 모으기(「모두 몇」)·남기기(「남은 것은」), 받아올림/받아내림 1회
  'g3.addsub.word': { id: 'addSubWord', word: true, gen(rng, d){ const [n, u] = rng.pick(THINGS); const hard = rng.next() < d;
      if (rng.chance(.5)) { const [a, b] = pickAdd(rng, hard ? 2 : 1), ans = a + b;
        return { concept: 'g3.addsub.word', fact: `addw:${a},${b}`, d: .35 + (hard ? .3 : 0), type: 'word1', prompt: { key: 'q.g3.word.join', args: { n, u, a, b, j1: wIga(n), j3: wEul(u) } }, a, b, op: '+', answer: ans,
          wrongs: [[noCarry(a, b), 'carry-miss'], [Math.abs(a - b), 'sub-instead'], [ans + 10, 'off-ten'], [ans - 10, 'off-ten']] }; }
      const [a, b] = pickSub(rng, hard ? 2 : 1, false), ans = a - b;
      return { concept: 'g3.addsub.word', fact: `subw:${a},${b}`, d: .4 + (hard ? .3 : 0), type: 'word1', prompt: { key: 'q.g3.word.left', args: { n, u, a, b, j1: wIga(n), j2: wEun(n), j3: wEul(u) } }, a, b, op: '-', answer: ans,
        wrongs: [[bigMinusSmall(a, b), 'borrow-miss'], [a + b, 'add-instead'], [keepOne(a, b), 'borrow-keep'], [ans + 10, 'off-ten']] }; },
    verify: q => (q.op === '+' ? colAdd(q.a, q.b) === q.answer && q.answer <= 1998 : colSub(q.a, q.b) === q.answer && q.answer >= 1) && q.a >= 100 && q.b >= 100 },
};
const HINT1 = { 'g3.addsub.3digit': q => q.op === '+' ? 'hint.g3.addCol' : 'hint.g3.subCol', 'g3.addsub.word': q => q.op === '+' ? 'hint.g3.addCol' : 'hint.g3.subCol' };
export const G3_1_U1 = {};
for (const [k, g] of Object.entries(BASE)) G3_1_U1[k] = Object.assign({}, g, { unit: 'g3-1-u1', max: 1999, gen(rng, d, opt){ const q = g.gen(rng, d, opt);
  q.type = q.type || 'calc2'; q.hint1 = { key: HINT1[k](q), args: { a: q.a, b: q.b } }; q.hint2 = null; return q; } });
