// 3학년 2학기 3단원 「원」 생성기 — 월드 2 「도형의 신전」 3학년 줄(16 문서 8절 ④), 베프 직접
// 정본: handoff kedu/curriculum/math/g3_2/unit3 [4수03-06] 원의 중심·반지름·지름과 성질(반지름은 모두 같다 · 지름은 반지름의 2배 · 지름 = 가장 긴 선분). 컴퍼스 그리기([4수03-07])는 손 활동이라 안 냄.
// ⚠️ 정본 한계: 지름은 짝수 cm 만(반지름이 자연수) · BAN_U3(원주율·둘레·이등분·circle 등) 안 씀 · 「똑같이 둘로 나눈다」만.
// 답은 정수 하나: 그림 문제는 pics.js 코드 24~27·31·32(지름·중심 안 지나는 선분·반지름·원 밖으로 나간 선), 길이 문제는 cm 수.
import { CODES, PIC } from '../pics.js';
const POOL_PART = [24, 25, 26, 27, 31, 32];
const RMAX = 16;   // 지름 최대 32(정본 원문 2~16 짝수 지름 → 반지름 1~8; d 높으면 16까지)

const BASE = {
  // 지름·반지름 찾기(정본 l02·l03): 「지름은 어느 것?」(중심을 지나는 선분) · 「반지름은 어느 것?」(중심에서 원 위의 한 점까지)
  'g3.circle.part': { id: 'circlePart', choicePic: true, picPool: POOL_PART, gen(rng, d){ const dia = rng.next() < .5; const a = rng.pick(dia ? CODES.cdia : CODES.crad);
      const w1 = dia ? [rng.pick(CODES.crad), 'that-is-radius'] : [rng.pick(CODES.cdia), 'that-is-diameter'];
      const w2 = rng.next() < .5 ? [CODES.cchord[0], 'chord-off-center'] : [CODES.cline[0], 'line-out'];
      return { concept: 'g3.circle.part', fact: `${dia ? 'dia' : 'rad'}:${a}:${w1[0]},${w2[0]}`, d: .3 + d * .2, prompt: { key: dia ? 'q.circle.pick.dia' : 'q.circle.pick.rad', args: {} }, pic: null, dia, answer: a, wrongs: [w1, w2] }; },
    verify: q => (q.dia ? CODES.cdia : CODES.crad).includes(q.answer) },
  // 지름은 반지름의 2배(정본 l04): 반지름 → 지름 · 지름 → 반지름 · 가장 긴 선분(= 지름)
  'g3.circle.dia': { id: 'circleDia', gen(rng, d){ const kind = rng.pick(['r2d', 'd2r', 'longest']); const r = rng.int(1, d > .5 ? RMAX : 8);
      if (kind === 'd2r') { const dd = 2 * r; return { concept: 'g3.circle.dia', fact: `d2r:${dd}`, d: .35 + r / RMAX * .3, prompt: { key: 'q.circle.d2r', args: { d: dd } }, pic: 'cdia', kind, r, answer: r, wrongs: [[dd, 'rad-eq-dia'], [dd - 2, 'rad-minus-two'], [r + 1, 'off-by-one']] }; }
      return { concept: 'g3.circle.dia', fact: `${kind}:${r}`, d: .25 + r / RMAX * .3 + (kind === 'longest' ? .1 : 0), prompt: { key: 'q.circle.' + kind, args: { r } }, pic: kind === 'longest' ? 'cdia' : 'crad', kind, r, answer: 2 * r, wrongs: [[r, 'dia-eq-radius'], [r + 2, 'dia-plus-two'], [2 * r + 1, 'off-by-one']] }; },
    verify: q => q.kind === 'd2r' ? q.answer === q.r && q.prompt.args.d === 2 * q.r : q.answer === 2 * q.r },
  // 한 원에서 반지름은 모두 같다 · 지름도 모두 같다(정본 l02·l03): 「반지름 하나가 {r}cm, 다른 반지름은?」
  'g3.circle.same': { id: 'circleSame', gen(rng, d){ const dia = rng.next() < .4; const r = rng.int(1, d > .5 ? RMAX : 8), n = dia ? 2 * r : r;
      return { concept: 'g3.circle.same', fact: `${dia ? 'dia' : 'rad'}:${n}`, d: .2 + d * .2, prompt: { key: dia ? 'q.circle.sameDia' : 'q.circle.sameRad', args: { n } }, pic: dia ? 'cdia2' : 'crad2', dia, n, answer: n,
        wrongs: dia ? [[r, 'that-is-radius'], [n + 2, 'same-plus'], [n - 1, 'off-by-one']] : [[2 * r, 'that-is-diameter'], [n + 1, 'same-plus'], [n - 1, 'off-by-one']] }; },
    verify: q => q.answer === q.n && q.n >= 1 && q.n <= 2 * RMAX },
};
const HINT1 = { 'g3.circle.part': 'hint.circle.part', 'g3.circle.dia': 'hint.circle.dia', 'g3.circle.same': 'hint.circle.same' };
export const G3_2_U3 = {};
for (const [k, g] of Object.entries(BASE)) G3_2_U3[k] = Object.assign({}, g, { unit: 'g3-2-u3', max: 36, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; q.hint1 = { key: HINT1[k], args: {} }; q.hint2 = null; if (g.choicePic) { q.choicePic = true; q.picPool = g.picPool.slice(); } return q; } });
