// 1학년 1학기 1단원 「9까지의 수」 생성기 — 비교형(compare)·규칙형(pattern), 강화 수정 전용(05 문서 12항: 얼음 = 비교·크기형, 번개 = 이어지는 규칙형)
// 14 문서 4절·8절: 비교형·규칙형은 베프 몫. 계산형처럼 답은 정수 하나, 선택지는 수 3개 — 비교는 「보기 세 수 중 고르기」로, 규칙은 「다음 수」로 만들어 화면·계약을 안 바꾼다.
// hint2(구슬 그림)는 더하기·빼기 그림이라 여기엔 없음(null) — hint1 글만.
import { wa } from '../josa.js';
const lvl = (rng, d) => rng.next() < d;
// 서로 다른 세 수(1~9). d 높을수록 세 수가 붙어 있어(7·8·6) 비교가 어려움
const three = (rng, d) => { const close = lvl(rng, d); let a, b, c;
  if (close) { const base = rng.int(1, 7); const s = rng.shuffle([base, base + 1, base + 2]); [a, b, c] = s; }
  else { const s = new Set(); while (s.size < 3) s.add(rng.int(1, 9)); [a, b, c] = rng.shuffle([...s]); }
  return [a, b, c]; };
const sorted = xs => xs.slice().sort((p, q) => p - q);

const BASE = {
  // 가장 큰 수 — 오개념: 가장 작은 수(세는 순서를 거꾸로 봄)·가운데 수
  'g1.compare.max': { id: 'compareMax', compare: true, gen(rng, d){ const xs = three(rng, d), [lo, mid, hi] = sorted(xs);
      return { concept: 'g1.compare.max', fact: `max:${sorted(xs).join(',')}`, d: .15 + (hi - lo <= 2 ? .45 : .1) + (hi - 3) / 6 * .2, prompt: { key: 'q.compare.max', args: { a: xs[0], b: xs[1], c: xs[2] } }, xs, answer: hi,
        wrongs: [[lo, 'pick-smallest'], [mid, 'pick-middle']] }; },
    verify: q => q.answer === Math.max(...q.xs) && q.xs.length === 3 && new Set(q.xs).size === 3 },
  // 가장 작은 수 — 오개념: 가장 큰 수·가운데 수
  'g1.compare.min': { id: 'compareMin', compare: true, gen(rng, d){ const xs = three(rng, d), [lo, mid, hi] = sorted(xs);
      return { concept: 'g1.compare.min', fact: `min:${sorted(xs).join(',')}`, d: .2 + (hi - lo <= 2 ? .45 : .1) + (hi - 3) / 6 * .2, prompt: { key: 'q.compare.min', args: { a: xs[0], b: xs[1], c: xs[2] } }, xs, answer: lo,
        wrongs: [[hi, 'pick-largest'], [mid, 'pick-middle']] }; },
    verify: q => q.answer === Math.min(...q.xs) && q.xs.length === 3 && new Set(q.xs).size === 3 },
  // 이어 세기 「4, 5, 6, □」 — 1씩 커짐(쉬움) · 2씩 커짐 · 1씩 작아짐(어려움). 오개념: 앞으로 되돌아감·1씩만 센다고 봄(2씩 규칙에서)·건너뜀
  'g1.pattern.count': { id: 'patternCount', pattern: true, gen(rng, d){ const kind = lvl(rng, d) ? rng.pick(['up2', 'down1']) : 'up1';
      const step = kind === 'up2' ? 2 : kind === 'up1' ? 1 : -1; const lo = step > 0 ? 0 : 3, hi = step > 0 ? 9 - 3 * step : 9; const s = rng.int(lo, hi); const seq = [s, s + step, s + 2 * step], ans = s + 3 * step;
      const wrongs = [[seq[2] - step, 'prev-number'], [kind === 'up2' ? seq[2] + 1 : seq[2] + 2 * step, kind === 'up2' ? 'step-one' : 'skip-step'], [seq[2], 'repeat-last']];
      return { concept: 'g1.pattern.count', fact: `cnt:${s}${step > 0 ? '+' : ''}${step}`, d: kind === 'up1' ? .15 + s / 9 * .15 : kind === 'up2' ? .45 + s / 9 * .15 : .55 + (9 - s) / 9 * .15, prompt: { key: 'q.pattern.next', args: { s: seq.join(', ') } }, seq, step, answer: ans, wrongs }; },
    verify: q => q.seq.length === 3 && q.seq[1] - q.seq[0] === q.step && q.seq[2] - q.seq[1] === q.step && q.answer === q.seq[2] + q.step && q.answer >= 0 && q.answer <= 9 },
  // 수의 순서 — 「3과 5 사이에 있는 수는?」(between) · 「6 바로 다음 수는?」(after) · 「6 바로 앞의 수는?」(before). 오개념: 양 끝 수를 고름·반대 방향·건너뜀
  'g1.pattern.between': { id: 'patternBetween', pattern: true, gen(rng, d){ const kind = rng.pick(['between', 'after', 'before']); const hard = lvl(rng, d);
      if (kind === 'between') { const a = hard ? rng.int(4, 7) : rng.int(1, 4), b = a + 2, ans = a + 1;
        return { concept: 'g1.pattern.between', fact: `btw:${a},${b}`, d: .2 + (a - 1) / 6 * .3, prompt: { key: 'q.pattern.between', args: { a, b, j1: wa(a) } }, kind, a, b, answer: ans, wrongs: [[a, 'edge-number'], [b, 'edge-number'], [ans + 2, 'skip-step']] }; }
      if (kind === 'after') { const a = hard ? rng.int(5, 8) : rng.int(1, 5), ans = a + 1;
        return { concept: 'g1.pattern.between', fact: `aft:${a}`, d: .1 + (a - 1) / 8 * .25, prompt: { key: 'q.pattern.after', args: { a } }, kind, a, answer: ans, wrongs: [[a - 1, 'prev-number'], [a + 2, 'skip-step'], [a, 'repeat-last']] }; }
      const a = hard ? rng.int(6, 9) : rng.int(2, 5), ans = a - 1;
      return { concept: 'g1.pattern.between', fact: `bef:${a}`, d: .2 + (a - 2) / 7 * .3, prompt: { key: 'q.pattern.before', args: { a } }, kind, a, answer: ans, wrongs: [[a + 1, 'next-number'], [a - 2, 'skip-step'], [a, 'repeat-last']] }; },
    verify: q => q.kind === 'between' ? (q.b - q.a === 2 && q.answer === q.a + 1 && q.answer <= 9) : q.kind === 'after' ? q.answer === q.a + 1 && q.answer <= 9 : q.answer === q.a - 1 && q.answer >= 1 },
};
const HINT1 = { 'g1.compare.max': 'hint.compareMax', 'g1.compare.min': 'hint.compareMin', 'g1.pattern.count': 'hint.pattern', 'g1.pattern.between': 'hint.between' };
export const G1U1 = {};
for (const [k, g] of Object.entries(BASE)) G1U1[k] = Object.assign({}, g, { unit: 'g1-1-u1', max: 9, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1';
  q.hint1 = { key: HINT1[k], args: { a: q.a, b: q.b, d: q.step ? Math.abs(q.step) : undefined, dir: q.step ? (q.step > 0 ? '커져요' : '작아져요') : undefined } }; q.hint2 = null; return q; } });
