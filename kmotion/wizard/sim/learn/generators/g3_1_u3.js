// 3학년 1학기 3단원 「나눗셈」 생성기 — 08 문서 6절 · 정본 kedu/curriculum/math/g3/unit3 [4수01-05·06]
// 범위 경계(정본): 곱셈구구 범위만 — 나누어지는 수 ≤ 81, 나누는 수·몫 1~9, 나머지 0. 나머지·세로셈·(몇십)÷(몇)은 3-2.
// 변환표 키 `g3.div.basic` 하나에 「몫 구하기 t ÷ b = □」·「나누는 수 빈칸 t ÷ □ = q」 가 들어간다. 문장제 1종(등분제·포함제)은 보스 마지막 칸.
// 오개념(정본): 등분제·포함제 혼동(ask-swap) · 순서 무시 12÷4=4÷12(swap-div) · 몫·나누는 수 혼동(swap-div) · 곱셈식 방향 역전(mul-instead) · 옆 단(table-neighbor)
import { wIga } from '../josa.js';
const wEul = w => { const c = w.charCodeAt(w.length - 1); return (c - 0xAC00) % 28 !== 0 ? '을' : '를'; };   // 세는 말 뒤 을/를
const THINGS = [['사탕', '개'], ['구슬', '개'], ['연필', '자루'], ['색종이', '장'], ['쿠키', '개'], ['공책', '권'], ['풍선', '개'], ['딸기', '개']];
// 검산용: 몇 번 덜어낼 수 있는지 세기(gen 의 곱셈과 다른 방법)
const takeAway = (t, b) => { let n = 0, r = t; while (r >= b && n < 20) { r -= b; n++; } return r === 0 ? n : -1; };
const neighbor = (rng, v) => v <= 2 ? v + 1 : v >= 9 ? v - 1 : v + (rng.chance(.5) ? 1 : -1);
// 나누는 수 b·몫 q (2~9) — d 낮으면 2~5단, 높으면 6~9단
const pick = (rng, d) => { const hi = rng.next() < d; const b = hi ? rng.int(6, 9) : rng.int(2, 5), q = hi ? rng.int(3, 9) : rng.int(2, 6); return [b, q]; };
const diff = (b, q) => Math.min(.9, .1 + (b - 2) / 7 * .4 + (q - 2) / 7 * .4);

const BASE = {
  'g3.div.basic': { id: 'div', gen(rng, d){ const [b, q] = pick(rng, d), t = b * q;
      if (rng.chance(.3)) {   // 나누는 수 빈칸 「t ÷ □ = q」 — 곱셈과 나눗셈의 관계(05차)
        return { concept: 'g3.div.basic', fact: `divm:${t},${q}`, d: Math.min(.95, diff(b, q) + .05), type: 'calc1', prompt: { key: 'q.g3.div.missing', args: { t, q } }, a: t, b, c: q, op: '÷', answer: b,
          wrongs: [[q, 'swap-div'], [t - q, 'sub-instead'], [neighbor(rng, b), 'table-neighbor'], [b + 1, 'off-one'], [b - 1, 'off-one']] }; }
      return { concept: 'g3.div.basic', fact: `div:${t},${b}`, d: diff(b, q), type: 'calc1', prompt: { key: 'q.g3.div', args: { t, b } }, a: t, b, op: '÷', answer: q,
        wrongs: [[b, 'swap-div'], [t * b, 'mul-instead'], [t - b, 'sub-instead'], [neighbor(rng, q), 'table-neighbor'], [q + 1, 'off-one'], [q - 1, 'off-one']] }; },
    verify: q => (q.c ? takeAway(q.a, q.answer) === q.c : takeAway(q.a, q.b) === q.answer) && q.a <= 81 && q.b >= 2 && q.b <= 9 && q.answer >= 1 && q.answer <= 9 },
  // 문장제 — 등분제(「n명이 똑같이 나누면 한 명은 몇 개」) · 포함제(「k개씩 묶으면 몇 묶음」)
  'g3.div.word': { id: 'divWord', word: true, gen(rng, d){ const [b, q] = pick(rng, d), t = b * q; const [n, u] = rng.pick(THINGS); const share = rng.chance(.5);
      return share
        ? { concept: 'g3.div.word', fact: `divw:s:${t},${b}`, d: Math.min(.95, diff(b, q) + .1), type: 'word1', prompt: { key: 'q.g3.word.share', args: { n, u, t, b, j1: wIga(n) } }, a: t, b, op: '÷', answer: q, share,
            wrongs: [[b, 'ask-swap'], [t - b, 'sub-instead'], [neighbor(rng, q), 'table-neighbor'], [q + 1, 'off-one'], [q - 1, 'off-one'], [t * b, 'mul-instead']] }
        : { concept: 'g3.div.word', fact: `divw:g:${t},${q}`, d: Math.min(.95, diff(b, q) + .15), type: 'word1', prompt: { key: 'q.g3.word.group', args: { n, u, t, k: q, j2: wEul(u) } }, a: t, b: q, op: '÷', answer: b, share,
            wrongs: [[q, 'ask-swap'], [t - q, 'sub-instead'], [neighbor(rng, b), 'table-neighbor'], [b + 1, 'off-one'], [b - 1, 'off-one'], [t * q, 'mul-instead']] }; },
    verify: q => takeAway(q.a, q.b) === q.answer && q.a <= 81 && q.answer >= 1 && q.answer <= 9 },
};
const HINT1 = { 'g3.div.basic': q => q.c ? 'hint.g3.divMissing' : 'hint.g3.divTable', 'g3.div.word': q => q.share ? 'hint.g3.divShare' : 'hint.g3.divGroup' };
export const G3_1_U3 = {};
for (const [k, g] of Object.entries(BASE)) G3_1_U3[k] = Object.assign({}, g, { unit: 'g3-1-u3', max: 81, gen(rng, d, opt){ const q = g.gen(rng, d, opt);
  q.type = q.type || 'calc1'; q.hint1 = { key: HINT1[k](q), args: { t: q.a, b: q.b, q: q.c || q.answer } };
  // 2단계 = 묶음 그림(groups: 줄 수 × 한 줄 구슬) — 몫 문제는 b줄 × 몫, 빈칸·포함제는 답(줄 수) × 한 줄
  const rows = q.c ? q.answer : q.share === false ? q.answer : q.b, each = q.c ? q.c : q.share === false ? q.b : q.answer;
  q.hint2 = rows >= 2 && rows <= 8 && rows * each <= 96 ? { kind: 'groups', n: rows, each } : null; return q; } });
