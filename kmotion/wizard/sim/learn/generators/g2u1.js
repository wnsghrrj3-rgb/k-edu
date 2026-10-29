// 2학년 1학기 1단원 「세 자리 수」 생성기 — 비교형(compare)·규칙형(pattern), 강화 수정 전용(05 문서 12항: 얼음 = 비교·크기형, 번개 = 이어지는 규칙형)
// 14 문서 8절: 비교·규칙 단원은 베프 몫. g1u1.js 와 같은 틀 — 답은 정수 하나, 보기 수 3개, 화면·계약 무변경. hint2(구슬 그림) 없음(null), hint1 글만.
// 정본: 자기주도 2-1 수학 1단원(C5 뛰어 세기 · C6 크기 비교 · 1 큰/작은 수) [2수01-02] [2수01-03]. 2학년 장면(월드 2)이 열리기 전엔 want 풀에 안 들어감(같은 학년 장면 단원 이하 규칙).
const lvl = (rng, d) => rng.next() < d;
const sorted = xs => xs.slice().sort((p, q) => p - q);
const digits = n => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
// 서로 다른 세 자리 수 셋 — d 낮음: 백의 자리가 다 다름(쉬움) · 중간: 백의 자리 같고 십의 자리 다름 · 높음: 백·십 같고 일의 자리만 다름(어려움)
const three = (rng, d) => { const r = rng.next(); const level = r < 1 - d ? 0 : r < 1 - d / 2 ? 1 : 2; let xs;
  if (level === 0) { const s = new Set(); while (s.size < 3) s.add(rng.int(1, 9)); xs = [...s].map(h => h * 100 + rng.int(0, 99)); }
  else if (level === 1) { const h = rng.int(1, 9); const s = new Set(); while (s.size < 3) s.add(rng.int(0, 9)); xs = [...s].map(t => h * 100 + t * 10 + rng.int(0, 9)); }
  else { const h = rng.int(1, 9), t = rng.int(0, 9); const s = new Set(); while (s.size < 3) s.add(rng.int(0, 9)); xs = [...s].map(o => h * 100 + t * 10 + o); }
  return [rng.shuffle(xs), level]; };
const PLACE = ['백', '십', '일'];

const BASE = {
  // 가장 큰 수 — 오개념: 가장 작은 수·가운데 수(백의 자리부터 보지 않고 눈에 띄는 숫자로 고름)
  'g2.compare.max': { id: 'compareMax3', compare: true, gen(rng, d){ const [xs, level] = three(rng, d), [lo, mid, hi] = sorted(xs);
      return { concept: 'g2.compare.max', fact: `max3:${sorted(xs).join(',')}`, d: .15 + level * .3 + (hi - lo <= 20 ? .1 : 0), prompt: { key: 'q.compare.max', args: { a: xs[0], b: xs[1], c: xs[2] } }, xs, level, answer: hi,
        wrongs: [[lo, 'pick-smallest'], [mid, 'pick-middle']] }; },
    verify: q => q.answer === Math.max(...q.xs) && q.xs.length === 3 && new Set(q.xs).size === 3 && q.xs.every(x => x >= 100 && x <= 999) },
  // 가장 작은 수 — 오개념: 가장 큰 수·가운데 수
  'g2.compare.min': { id: 'compareMin3', compare: true, gen(rng, d){ const [xs, level] = three(rng, d), [lo, mid, hi] = sorted(xs);
      return { concept: 'g2.compare.min', fact: `min3:${sorted(xs).join(',')}`, d: .2 + level * .3 + (hi - lo <= 20 ? .1 : 0), prompt: { key: 'q.compare.min', args: { a: xs[0], b: xs[1], c: xs[2] } }, xs, level, answer: lo,
        wrongs: [[hi, 'pick-largest'], [mid, 'pick-middle']] }; },
    verify: q => q.answer === Math.min(...q.xs) && q.xs.length === 3 && new Set(q.xs).size === 3 && q.xs.every(x => x >= 100 && x <= 999) },
  // 뛰어 세기 「300, 400, 500, □」 — 100씩(쉬움)·10씩·1씩 · 거꾸로(어려움). 받아올림(490→500)은 d 높을 때만. 오개념: 다른 자리를 뛰움(wrong-place)·되돌아감·건너뜀·마지막 수 그대로
  'g2.pattern.skip': { id: 'patternSkip3', pattern: true, gen(rng, d){ const hard = lvl(rng, d); const step = hard ? rng.pick([100, 10, 1, -100, -10, -1]) : rng.pick([100, 100, 10, 1]); const carry = hard && lvl(rng, d);
      const a = Math.abs(step), pi = a === 100 ? 0 : a === 10 ? 1 : 2; let s;
      if (carry || a === 100) s = rng.int(100 - Math.min(0, 3 * step), 999 - Math.max(0, 3 * step));
      else { // 받아올림 없이: 뛰는 자리 숫자가 4번 안에 넘치지 않게
        const h = rng.int(1, 9), dg = step > 0 ? rng.int(0, 6) : rng.int(3, 9), other = rng.int(0, 9);
        s = pi === 1 ? h * 100 + dg * 10 + other : h * 100 + other * 10 + dg; }
      const seq = [s, s + step, s + 2 * step], ans = s + 3 * step;
      const otherStep = pi === 0 ? 10 : pi === 1 ? (hard ? rng.pick([100, 1]) : 100) : 10;   // 자리를 잘못 본 오답(100씩인데 10씩 등)
      const wrongs = [[seq[2] + Math.sign(step) * otherStep, 'wrong-place'], [seq[2] - step, 'prev-number'], [seq[2] + 2 * step, 'skip-step'], [seq[2], 'repeat-last']];
      return { concept: 'g2.pattern.skip', fact: `skip:${s}${step > 0 ? '+' : ''}${step}`, d: (a === 100 ? .15 : a === 10 ? .3 : .4) + (step < 0 ? .25 : 0) + (carry ? .2 : 0), prompt: { key: 'q.pattern.next', args: { s: seq.join(', ') } }, seq, step, place: PLACE[pi], answer: ans, wrongs }; },
    verify: q => q.seq.length === 3 && q.seq[1] - q.seq[0] === q.step && q.seq[2] - q.seq[1] === q.step && q.answer === q.seq[2] + q.step && q.answer >= 100 && q.answer <= 999 && [100, 10, 1].includes(Math.abs(q.step)) },
  // 1·10·100 큰 수 / 작은 수 「{a}보다 10 큰 수는?」 — 오개념: 다른 자리를 바꿈(wrong-place)·반대로(opposite-way)·그대로
  'g2.pattern.near': { id: 'patternNear3', pattern: true, gen(rng, d){ const hard = lvl(rng, d); const dlt = rng.pick([1, 10, 100]); const up = hard ? rng.next() < .5 : true; const step = up ? dlt : -dlt; const pi = dlt === 100 ? 0 : dlt === 10 ? 1 : 2;
      let a; if (hard && lvl(rng, d)) a = rng.int(100 - Math.min(0, step), 999 - Math.max(0, step));   // 받아올림·내림 허용(499 → 500)
      else { const dg = digits(rng.int(100, 999)); dg[pi] = up ? rng.int(pi === 0 ? 1 : 0, 8) : rng.int(pi === 0 ? 2 : 1, 9); a = dg[0] * 100 + dg[1] * 10 + dg[2]; }
      const ans = a + step; const otherDlt = dlt === 100 ? 10 : dlt === 10 ? 1 : 10; const dgA = Math.floor(a / dlt) % 10, carry = dgA + Math.sign(step) < 0 || dgA + Math.sign(step) > 9;
      const wrongs = [[a + Math.sign(step) * otherDlt, 'wrong-place'], [a - step, 'opposite-way'], [a, 'repeat-last'], [ans + step, 'skip-step']];
      return { concept: 'g2.pattern.near', fact: `near:${a}${step > 0 ? '+' : ''}${step}`, d: (dlt === 100 ? .15 : dlt === 10 ? .25 : .35) + (up ? 0 : .25) + (carry ? .2 : 0), prompt: { key: up ? 'q.pattern.bigger' : 'q.pattern.smaller', args: { a, d: dlt } }, a, step, place: PLACE[pi], answer: ans, wrongs }; },
    verify: q => q.answer === q.a + q.step && q.a >= 100 && q.a <= 999 && q.answer >= 100 && q.answer <= 999 && [100, 10, 1].includes(Math.abs(q.step)) },
};
const HINT1 = { 'g2.compare.max': 'hint.compare3', 'g2.compare.min': 'hint.compare3', 'g2.pattern.skip': 'hint.skip3', 'g2.pattern.near': 'hint.near3' };
export const G2U1 = {};
for (const [k, g] of Object.entries(BASE)) G2U1[k] = Object.assign({}, g, { unit: 'g2-1-u1', max: 999, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1';
  q.hint1 = { key: HINT1[k], args: { a: q.a, d: q.step ? Math.abs(q.step) : undefined, place: q.place, dir: q.step ? (q.step > 0 ? '커져요' : '작아져요') : undefined } }; q.hint2 = null; return q; } });
