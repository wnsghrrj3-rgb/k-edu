// 4학년 1학기 2단원 「각도」 생성기 — 월드 2 「도형의 신전」 4학년 진짜 줄(16 문서 8절, 50절 「다음 ④」), 베프 직접
// 정본: handoff kedu/curriculum/math/g4/unit2 — 01 1° · 02 각의 크기 비교 · 03·04 각도기로 재기 · 05 어림 · 06 각도의 합과 차(직각의 합 → 360°) · 07 삼각형 세 각의 합 180° · 08 사각형 네 각의 합 360° · 09 삼각자 · 10 마무리(예각·직각·둔각 분류)
// ⚠️ 범위 경계: 각도기 읽기·어림은 손 활동이라 안 냄(구슬에 눈금이 안 들어감). 보각·맞꼭지각·평행 = 중학·4-2 낱말 — 안 씀. 각은 5° 단위(d 낮으면 10°).
// 답은 정수 하나(계약 그대로): 예각·둔각 찾기는 pics.js 그림 코드(50~53·13·16), 나머지는 도(°) 수. 삼각형·사각형 문제의 그림은 proto 가 `tri:a,b`·`quad:a,b,c` 로 각 크기 그대로 작도(정본 작도 규약).
import { CODES, ANGLE_DEG } from '../pics.js';
const POOL_ANGLE = [50, 51, 52, 53, 13, 16];
const RIGHT = CODES.rangle;
const step = d => d < .5 ? 10 : 5;
const pickDeg = (rng, lo, hi, st) => lo + st * rng.int(0, Math.floor((hi - lo) / st));
const offTen = (ans, lim = 360) => ans + 10 <= lim ? [[ans + 10, 'off-ten'], [ans - 10, 'off-ten']] : [[ans - 10, 'off-ten'], [ans - 20, 'off-ten']];

const BASE = {
  // 예각·직각·둔각(정본 10차 분류·04차): 「예각은 어느 것?」「둔각은?」「직각은?」 · 「예각이 아닌 것은?」「둔각이 아닌 것은?」 — 직각보다 작으면 예각, 크면 둔각
  'g4.angle.kind': { id: 'angleKind', choicePic: true, picPool: POOL_ANGLE, gen(rng, d){ const kind = rng.pick(['acute', 'obtuse', 'right', 'acute', 'obtuse']); const not = kind !== 'right' && rng.next() < .35;
      const pool = { acute: CODES.acute, obtuse: CODES.obtuse, right: RIGHT };
      if (not) { const o = rng.pick(kind === 'acute' ? ['obtuse', 'right'] : ['acute', 'right']); const a = rng.pick(pool[o]);
        return { concept: 'g4.angle.kind', fact: `not:${kind}:${a}`, d: .45 + d * .2, prompt: { key: 'q.angle.not.' + kind, args: {} }, pic: null, kind, not, answer: a, wrongs: [[pool[kind][0], 'is-' + kind], [pool[kind][1], 'is-' + kind]] }; }
      const a = rng.pick(pool[kind]); const [o1, o2] = ['acute', 'obtuse', 'right'].filter(x => x !== kind);
      return { concept: 'g4.angle.kind', fact: `pick:${kind}:${a}`, d: .25 + d * .2 + (kind === 'obtuse' ? .05 : 0), prompt: { key: 'q.angle.pick.' + kind, args: {} }, pic: null, kind, not, answer: a, wrongs: [[rng.pick(pool[o1]), 'is-' + o1], [rng.pick(pool[o2]), 'is-' + o2]] }; },
    verify: q => { const deg = ANGLE_DEG[q.answer]; if (deg == null) return false; const k = deg < 90 ? 'acute' : deg > 90 ? 'obtuse' : 'right'; return q.not ? k !== q.kind : k === q.kind; } },
  // 각도의 합과 차(정본 06차): 「{a}° + {b}° = □°」·「{a}° − {b}° = □°」·「직각 {n}개의 합은?」 — d 낮으면 10° 단위·합 180° 안, 높으면 5° 단위·360° 까지(직각 4개 = 360°)
  'g4.angle.sum': { id: 'angleSum', gen(rng, d){ const kind = rng.pick(['sum', 'diff', 'sum', 'diff', 'rights']); const st = step(d), lim = d < .5 ? 180 : 360;
      if (kind === 'rights') { const n = rng.int(2, 4), ans = 90 * n; return { concept: 'g4.angle.sum', fact: `rights:${n}`, d: .2 + n * .05, prompt: { key: 'q.angle.rights', args: { n } }, pic: 'rangle', kind, n, answer: ans, wrongs: [[ans - 90, 'rights-count'], [ans + 90 <= 360 ? ans + 90 : 90, 'rights-count'], [90, 'rights-count']] }; }
      if (kind === 'sum') { const a = pickDeg(rng, 10, lim - 10, st), b = pickDeg(rng, 10, lim - a, st), ans = a + b;
        return { concept: 'g4.angle.sum', fact: `sum:${a}+${b}`, d: .25 + ans / 360 * .3 + (st === 5 ? .1 : 0), prompt: { key: 'q.angle.sum', args: { a, b } }, pic: null, kind, a, b, answer: ans, wrongs: [a === b ? [a, 'other'] : [Math.abs(a - b), 'sub-instead'], ...offTen(ans)] }; }
      const b = pickDeg(rng, 10, lim - 20, st), a = pickDeg(rng, b + 10, lim, st), ans = a - b;
      return { concept: 'g4.angle.sum', fact: `diff:${a}-${b}`, d: .3 + a / 360 * .3 + (st === 5 ? .1 : 0), prompt: { key: 'q.angle.diff', args: { a, b } }, pic: null, kind, a, b, answer: ans, wrongs: [[a + b <= 360 ? a + b : a, 'add-instead'], ...offTen(ans)] }; },
    verify: q => q.kind === 'rights' ? q.answer === 90 * q.n : q.kind === 'sum' ? q.answer === q.a + q.b && q.answer <= 360 : q.answer === q.a - q.b && q.answer > 0 },
  // 삼각형 세 각의 합 180°(정본 07차): 「세 각이 {a}°, {b}°, □°」(그림 = 그 각으로 작도한 삼각형) · 「삼각형 세 각의 크기의 합은?」
  'g4.tri.angle': { id: 'triAngle', gen(rng, d){ if (rng.next() < .2) return { concept: 'g4.tri.angle', fact: 'sum180', d: .2, prompt: { key: 'q.tri4.sum', args: {} }, pic: 'tri:60,70', kind: 'sum', answer: 180, wrongs: [[360, 'tri-360'], [90, 'tri-90'], [270, 'tri-360']] };
      const st = step(d); let a = pickDeg(rng, 20, 120, st), b = pickDeg(rng, 20, Math.min(120, 160 - a), st); const ans = 180 - a - b;
      const w1 = [a + b, 'sum-instead'], w2 = [360 - a - b, 'tri-360'];
      return { concept: 'g4.tri.angle', fact: `miss:${a},${b}`, d: .3 + d * .3 + (st === 5 ? .1 : 0), prompt: { key: 'q.tri4.missing', args: { a, b } }, pic: `tri:${a},${b}`, kind: 'miss', a, b, answer: ans, wrongs: [w1, w2, offTen(ans, 180)[0]] }; },
    verify: q => q.kind === 'sum' ? q.answer === 180 : q.answer === 180 - q.a - q.b && q.answer >= 20 && q.a >= 20 && q.b >= 20 },
  // 사각형 네 각의 합 360°(정본 08차 — 대각선으로 삼각형 2개): 「네 각이 {a}°, {b}°, {c}°, □°」(그림 = 그 각으로 작도한 사각형) · 「사각형 네 각의 크기의 합은?」 — 각은 전부 60~140°(작도가 찌그러지지 않게)
  'g4.quad.angle': { id: 'quadAngle', gen(rng, d){ if (rng.next() < .2) return { concept: 'g4.quad.angle', fact: 'sum360', d: .25, prompt: { key: 'q.quad4.sum', args: {} }, pic: 'quad:90,110,70', kind: 'sum', answer: 360, wrongs: [[180, 'quad-180'], [270, 'quad-180'], [90, 'quad-180']] };
      const st = step(d); let a, b, c, ans; do { a = pickDeg(rng, 60, 140, st); b = pickDeg(rng, 60, 140, st); c = pickDeg(rng, 60, 140, st); ans = 360 - a - b - c; } while (ans < 60 || ans > 140);
      return { concept: 'g4.quad.angle', fact: `miss:${a},${b},${c}`, d: .4 + d * .3 + (st === 5 ? .1 : 0), prompt: { key: 'q.quad4.missing', args: { a, b, c } }, pic: `quad:${a},${b},${c}`, kind: 'miss', a, b, c, answer: ans, wrongs: [[a + b + c, 'sum-instead'], [Math.abs(180 - a - b - c), 'quad-180'], offTen(ans, 180)[0]] }; },
    verify: q => q.kind === 'sum' ? q.answer === 360 : q.answer === 360 - q.a - q.b - q.c && [q.a, q.b, q.c, q.answer].every(x => x >= 60 && x <= 140) },
};
const HINT1 = { 'g4.angle.kind': 'hint.angle.kind', 'g4.angle.sum': 'hint.angle.sum', 'g4.tri.angle': 'hint.tri.angle', 'g4.quad.angle': 'hint.quad.angle' };
export const G4_1_U2 = {};
for (const [k, g] of Object.entries(BASE)) G4_1_U2[k] = Object.assign({}, g, { unit: 'g4-1-u2', max: 360, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; q.hint1 = { key: HINT1[k], args: {} }; q.hint2 = null; if (g.choicePic) { q.choicePic = true; q.picPool = g.picPool.slice(); } return q; } });
