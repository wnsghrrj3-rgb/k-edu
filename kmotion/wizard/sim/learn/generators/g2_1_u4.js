// 2학년 1학기 4단원 「길이 재기」 생성기 — 월드 3 「측정의 협곡」 v1(17 문서 3절), 베프 직접
// 정본: handoff kedu/curriculum/math/g2/unit4 [2수03-06·10·12] 1 cm 단위·자로 재기·몇 cm 더 긴지. 어림(「약 몇 cm」)은 2차.
// 답은 정수 하나(cm). 문제 그림 = 'units:n'(1 cm 조각 n개 이어 붙임) · 'ruler:a,b'(자 눈금 a 에서 b 까지 막대) · 'ruler2:a,b'(0 에서 시작하는 막대 둘).
const BASE = {
  // 1 cm 가 몇 번(정본 l02): 조각 n개 → n cm
  'g2.len.unit': { id: 'lenUnit', gen(rng, d){ const n = rng.next() < d ? rng.int(6, 9) : rng.int(2, 6);
      return { concept: 'g2.len.unit', fact: `unit:${n}`, d: .1 + (n - 2) / 7 * .4, prompt: { key: 'q.g2.len.unit', args: {} }, pic: `units:${n}`, n, answer: n, wrongs: [[n + 1, 'off-by-one'], [n - 1, 'off-by-one'], [n + 2, 'count-off']] }; },
    verify: q => q.answer === q.n && q.n >= 2 && q.n <= 9 },
  // 자로 재기(정본 l03·l04): 눈금 a 부터 b 까지 → b − a (a 가 0 이 아닐 때 끝 눈금을 그대로 읽는 오답)
  'g2.len.ruler': { id: 'lenRuler', gen(rng, d){ const a = rng.next() < d ? rng.int(1, 4) : (rng.next() < .4 ? 0 : rng.int(1, 3)); const len = rng.int(2, Math.min(8, 10 - a)); const b = a + len;
      const wr = [[b, 'read-end'], [len + 1, 'count-ticks'], [len - 1, 'off-by-one']]; if (a === 0) wr[0] = [len + 2, 'count-off'];
      return { concept: 'g2.len.ruler', fact: `ruler:${a},${b}`, d: .2 + (a > 0 ? .3 : 0) + len / 20, prompt: { key: 'q.g2.len.ruler', args: {} }, pic: `ruler:${a},${b}`, a, b, answer: len, wrongs: wr }; },
    verify: q => q.answer === q.b - q.a && q.a >= 0 && q.b <= 10 && q.answer >= 2 },
  // 몇 cm 더 긴지(정본 l05): 막대 둘(0 에서) 길이 x·y → |x − y|
  'g2.len.diff': { id: 'lenDiff', gen(rng, d){ let x, y; do { x = rng.int(2, 10); y = rng.int(2, 10); } while (x === y || (d < .5 && Math.abs(x - y) < 2)); const ans = Math.abs(x - y);
      return { concept: 'g2.len.diff', fact: `diff:${x},${y}`, d: .3 + (ans <= 1 ? .3 : 0) + Math.max(x, y) / 25, prompt: { key: 'q.g2.len.diff', args: {} }, pic: `ruler2:${x},${y}`, x, y, answer: ans, wrongs: [[Math.max(x, y), 'read-long'], [Math.min(x, y), 'read-short'], [ans + 1, 'off-by-one']] }; },
    verify: q => q.answer === Math.abs(q.x - q.y) && q.answer >= 1 && q.x <= 10 && q.y <= 10 },
};
export const G2_1_U4 = {};
for (const [k, g] of Object.entries(BASE)) G2_1_U4[k] = Object.assign({}, g, { unit: 'g2-1-u4', max: 12, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; q.hint1 = { key: 'hint.' + k, args: {} }; q.hint2 = null; return q; } });
