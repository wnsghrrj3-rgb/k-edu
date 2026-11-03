// 3학년 2학기 5단원 「들이와 무게」 생성기 — 월드 3 「측정의 협곡」 3학년 줄(17 문서 4절), 베프 직접
// 정본: handoff kedu/curriculum/math/g3_2/unit5 [4수03-17~23] 1 L = 1000 mL(몇 L 몇 mL ↔ 몇 mL) · 1 kg = 1000 g(몇 kg 몇 g ↔ 몇 g) · 1 t = 1000 kg. 어림·덧셈뺄셈(받아올림)은 2차.
// 답은 정수 하나. 그림 없음. 오개념 태그: unit-ignore(a+b) · ten-hundred(100배) · part-shift(자리 밀림)
const mk = (key, unitA, qa, qp) => ({
  [`g3.${key}.small`]: { id: key + 'Small', gen(rng, d){ const a = rng.int(1, d > .5 ? 9 : 4), b = d > .5 ? rng.int(1, 99) * 10 : rng.int(1, 9) * 100, ans = a * 1000 + b;
      return { concept: `g3.${key}.small`, fact: `${key}:${a},${b}`, d: .25 + (b % 100 ? .25 : 0) + a / 40, prompt: { key: qa, args: { a, b } }, pic: null, a, b, answer: ans, wrongs: [[a + b, 'unit-ignore'], [a * 100 + b, 'ten-hundred'], [a * 1000 + b * 10, 'part-shift']] }; },
    verify: q => q.answer === q.a * 1000 + q.b && q.b >= 10 && q.b <= 990 && q.answer <= 9999 },
  [`g3.${key}.part`]: { id: key + 'Part', gen(rng, d){ const a = rng.int(1, 9), b = d > .5 ? rng.int(1, 99) * 10 : rng.int(1, 9) * 100, n = a * 1000 + b;
      return { concept: `g3.${key}.part`, fact: `${key}Part:${n}`, d: .3 + (b % 100 ? .25 : 0), prompt: { key: qp, args: { n, a } }, pic: null, a, b, n, answer: b, wrongs: [[b / 10, 'part-shift'], [a * 100 + b / 10, 'ten-hundred'], [n - a * 100, 'unit-ignore']] }; },
    verify: q => q.n === q.a * 1000 + q.b && q.answer === q.b && q.b <= 990 },
});
const BASE = Object.assign({}, mk('cap', 'L', 'q.g3.cap.small', 'q.g3.cap.part'), mk('wt', 'kg', 'q.g3.wt.small', 'q.g3.wt.part'), {
  // 몇 t → 몇 kg (1 t = 1000 kg)
  'g3.wt.ton': { id: 'wtTon', gen(rng, d){ const a = rng.int(1, 9), ans = a * 1000;
      return { concept: 'g3.wt.ton', fact: `ton:${a}`, d: .2, prompt: { key: 'q.g3.wt.ton', args: { a } }, pic: null, a, answer: ans, wrongs: [[a * 100, 'ten-hundred'], [a * 10, 'ten-hundred'], [a * 1000 + 100, 'part-shift']] }; },
    verify: q => q.answer === q.a * 1000 },
});
export const G3_2_U5 = {};
for (const [k, g] of Object.entries(BASE)) G3_2_U5[k] = Object.assign({}, g, { unit: 'g3-2-u5', max: 9999, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; q.hint1 = { key: 'hint.' + k, args: q.prompt.args }; q.hint2 = null; q.wrongs = q.wrongs.filter(([w]) => w > 0 && w !== q.answer && w <= 9999); return q; } });
