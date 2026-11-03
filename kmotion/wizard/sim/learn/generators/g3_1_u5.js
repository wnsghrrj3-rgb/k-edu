// 3학년 1학기 5단원 「길이와 시간」 생성기 — 월드 3 「측정의 협곡」 3학년 줄(17 문서 4절), 베프 직접
// 정본: handoff kedu/curriculum/math/g3/unit5 [4수03-15] 1 mm·1 km(몇 cm 몇 mm ↔ 몇 mm, 몇 km 몇 m ↔ 몇 m) · [4수03-13] 1분 = 60초(몇 분 몇 초 ↔ 몇 초). 시간의 덧셈·뺄셈([4수03-14])은 답이 둘(분·초)이라 2차.
// 답은 정수 하나. 그림 없음(글 문제). 오개념 태그: unit-ignore(단위 무시 a+b) · ten-hundred(10배·100배 혼동) · base60(60 대신 100) · part-only(한 부분만 읽음)
const BASE = {
  // 몇 cm 몇 mm → 몇 mm (1 cm = 10 mm)
  'g3.len.mm': { id: 'lenMm', gen(rng, d){ const a = rng.int(1, d > .5 ? 9 : 5), b = rng.int(1, 9), ans = a * 10 + b;
      return { concept: 'g3.len.mm', fact: `mm:${a},${b}`, d: .2 + a / 30, prompt: { key: 'q.g3.len.mm', args: { a, b } }, pic: null, a, b, answer: ans, wrongs: [[a + b, 'unit-ignore'], [a * 100 + b, 'ten-hundred'], [b * 10 + a, 'part-swap']] }; },
    verify: q => q.answer === q.a * 10 + q.b && q.b >= 1 && q.b <= 9 },
  // 몇 mm → 몇 cm 몇 mm 에서 mm 부분(「87 mm = 8 cm □ mm」)
  'g3.len.mmPart': { id: 'lenMmPart', gen(rng, d){ const a = rng.int(1, d > .5 ? 9 : 5), b = rng.int(1, 9), n = a * 10 + b;
      return { concept: 'g3.len.mmPart', fact: `mmPart:${n}`, d: .25 + a / 30, prompt: { key: 'q.g3.len.mmPart', args: { n, a } }, pic: null, a, b, n, answer: b, wrongs: [[a, 'part-swap'], [n - a, 'unit-ignore'], [b + 10, 'off-ten']] }; },
    verify: q => q.n === q.a * 10 + q.b && q.answer === q.b },
  // 몇 km 몇 m → 몇 m (1 km = 1000 m)
  'g3.len.km': { id: 'lenKm', gen(rng, d){ const a = rng.int(1, d > .5 ? 9 : 4), b = d > .5 ? rng.int(1, 99) * 10 : rng.int(1, 9) * 100, ans = a * 1000 + b;
      return { concept: 'g3.len.km', fact: `km:${a},${b}`, d: .25 + (b % 100 ? .25 : 0) + a / 40, prompt: { key: 'q.g3.len.km', args: { a, b } }, pic: null, a, b, answer: ans, wrongs: [[a + b, 'unit-ignore'], [a * 100 + b, 'ten-hundred'], [a * 1000 + b * 10, 'part-shift']] }; },
    verify: q => q.answer === q.a * 1000 + q.b && q.b >= 10 && q.b <= 990 && q.answer <= 9999 },
  // 몇 m → 몇 km 몇 m 에서 m 부분(「3400 m = 3 km □ m」)
  'g3.len.mPart': { id: 'lenMPart', gen(rng, d){ const a = rng.int(1, 9), b = d > .5 ? rng.int(1, 99) * 10 : rng.int(1, 9) * 100, n = a * 1000 + b;
      return { concept: 'g3.len.mPart', fact: `mPart:${n}`, d: .3 + (b % 100 ? .25 : 0), prompt: { key: 'q.g3.len.mPart', args: { n, a } }, pic: null, a, b, n, answer: b, wrongs: [[b / 10, 'part-shift'], [a * 100 + b / 10, 'ten-hundred'], [n - a * 100, 'unit-ignore']] }; },
    verify: q => q.n === q.a * 1000 + q.b && q.answer === q.b && q.b <= 990 },
  // 몇 분 몇 초 → 몇 초 (1분 = 60초)
  'g3.time.sec': { id: 'timeSec', gen(rng, d){ const a = rng.int(1, d > .5 ? 5 : 3), b = rng.int(1, 59), ans = a * 60 + b;
      return { concept: 'g3.time.sec', fact: `sec:${a},${b}`, d: .3 + a / 15, prompt: { key: 'q.g3.time.sec', args: { a, b } }, pic: null, a, b, answer: ans, wrongs: [[a * 100 + b, 'base60'], [a + b, 'unit-ignore'], [a * 60 + b + 60, 'off-min']] }; },
    verify: q => q.answer === q.a * 60 + q.b && q.b >= 1 && q.b <= 59 },
  // 몇 초 → 몇 분 몇 초 에서 초 부분(「150초 = 2분 □초」)
  'g3.time.secPart': { id: 'timeSecPart', gen(rng, d){ const a = rng.int(1, d > .5 ? 5 : 3), b = rng.int(1, 59), n = a * 60 + b;
      return { concept: 'g3.time.secPart', fact: `secPart:${n}`, d: .35 + a / 15, prompt: { key: 'q.g3.time.secPart', args: { n, a } }, pic: null, a, b, n, answer: b, wrongs: [[n - a * 100 > 0 ? n - a * 100 : b + 40, 'base60'], [n - a, 'unit-ignore'], [b + 60 > 99 ? b + 1 : b + 60, 'off-min']] }; },
    verify: q => q.n === q.a * 60 + q.b && q.answer === q.b },
};
export const G3_1_U5 = {};
for (const [k, g] of Object.entries(BASE)) G3_1_U5[k] = Object.assign({}, g, { unit: 'g3-1-u5', max: 9999, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; q.hint1 = { key: 'hint.' + k, args: q.prompt.args }; q.hint2 = null; q.wrongs = q.wrongs.filter(([w]) => w > 0 && w !== q.answer && w <= 9999); return q; } });
