// 4학년 1학기 4단원 「삼각형」 생성기 — 월드 2 「도형의 신전」 4학년 진짜 줄(16 문서 8절, 50절 「다음 ④」), 베프 직접
// 정본: handoff kedu/curriculum/math/g4/unit4 — 02 이등변삼각형(두 변 같다 → 두 각 같다) · 03 정삼각형(세 변 같다 → 세 각 60°) · 04·05 예각삼각형·둔각삼각형(세 각이 모두 예각 / 한 각이 둔각) · 06 두 기준으로 분류 · 08 마무리
// ⚠️ 정본 최대 오개념(지도서 348쪽 7번): 「한 각이 예각이면 예각삼각형」 — 그래서 예각삼각형 찾기 오답은 늘 둔각삼각형·직각삼각형(둘 다 예각이 두 개 있음). 포함 관계: 정삼각형도 이등변삼각형(01차 규약처럼 「이등변삼각형이 아닌 것」 오답에 정삼각형을 넣음). 밑각·꼭지각·둘레 낱말은 안 씀(4학년 정본 밖).
// 답은 정수 하나: 분류는 pics.js 그림 코드(54~63·17·18), 각·길이 문제는 도(°)·cm 수.
import { CODES } from '../pics.js';
const POOL_SIDE = [54, 55, 56, 57, 58, 59], POOL_ANGLE = [60, 61, 62, 63, 17, 18];
const vari = (rng, f) => rng.pick(CODES[f]);
const BASE = {
  // 변의 길이로 분류(정본 02·03차): 「이등변삼각형은?」(오답 = 세 변이 다른 삼각형 2) · 「정삼각형은?」(오답 = 이등변 1 + 세 변 다른 1) · 「이등변삼각형이 아닌 것은?」(오답 = 이등변·정삼각형 — 정삼각형도 이등변)
  'g4.tri.side': { id: 'triSide', choicePic: true, picPool: POOL_SIDE, gen(rng, d){ const kind = rng.pick(['iso', 'equi', 'notIso']);
      if (kind === 'iso') { const a = vari(rng, 'iso'); return { concept: 'g4.tri.side', fact: `iso:${a}`, d: .25 + d * .15, prompt: { key: 'q.tri4.pick.iso', args: {} }, pic: null, kind, answer: a, wrongs: [[CODES.scal[0], 'tri-scal'], [CODES.scal[1], 'tri-scal']] }; }
      if (kind === 'equi') { const a = vari(rng, 'equi'), w1 = vari(rng, 'iso'), w2 = vari(rng, 'scal'); return { concept: 'g4.tri.side', fact: `equi:${a}:${w1},${w2}`, d: .35 + d * .2, prompt: { key: 'q.tri4.pick.equi', args: {} }, pic: null, kind, answer: a, wrongs: [[w1, 'iso-not-equi'], [w2, 'tri-scal']] }; }
      const a = vari(rng, 'scal'), w1 = vari(rng, 'iso'), w2 = vari(rng, 'equi');
      return { concept: 'g4.tri.side', fact: `notIso:${a}:${w1},${w2}`, d: .5 + d * .2, prompt: { key: 'q.tri4.not.iso', args: {} }, pic: null, kind, answer: a, wrongs: [[w1, 'is-iso'], [w2, 'equi-is-iso']] }; },
    verify: q => (q.kind === 'iso' ? CODES.iso : q.kind === 'equi' ? CODES.equi : CODES.scal).includes(q.answer) },
  // 각의 크기로 분류(정본 04·05차): 「예각삼각형은?」(오답 = 둔각삼각형·직각삼각형, 348쪽 오개념) · 「둔각삼각형은?」 · 「직각삼각형은?」 · 「예각삼각형이 아닌 것은?」·「둔각삼각형이 아닌 것은?」
  'g4.tri.byAngle': { id: 'triByAngle', choicePic: true, picPool: POOL_ANGLE, gen(rng, d){ const FAM = { atri: CODES.atri, otri: CODES.otri, rtri: CODES.rtri }; const kind = rng.pick(['atri', 'otri', 'rtri', 'atri', 'otri']); const not = kind !== 'rtri' && rng.next() < .35;
      if (not) { const o = rng.pick(Object.keys(FAM).filter(f => f !== kind)); return { concept: 'g4.tri.byAngle', fact: `not:${kind}:${o}`, d: .45 + d * .2, prompt: { key: 'q.tri4.not.' + kind, args: {} }, pic: null, kind, not, answer: vari(rng, o), wrongs: [[FAM[kind][0], 'is-' + kind], [FAM[kind][1], 'is-' + kind]] }; }
      const [o1, o2] = Object.keys(FAM).filter(f => f !== kind);
      return { concept: 'g4.tri.byAngle', fact: `pick:${kind}:${vari(rng, kind)}`, d: .3 + d * .2 + (kind === 'atri' ? .1 : 0), prompt: { key: 'q.tri4.pick.' + kind, args: {} }, pic: null, kind, not, answer: FAM[kind][rng.int(0, 1)], wrongs: [[vari(rng, o1), 'is-' + o1], [vari(rng, o2), 'is-' + o2]] }; },
    verify: q => { const f = Object.entries({ atri: CODES.atri, otri: CODES.otri, rtri: CODES.rtri }).find(([, cs]) => cs.includes(q.answer)); return !!f && (q.not ? f[0] !== q.kind : f[0] === q.kind); } },
  // 이등변·정삼각형의 각(정본 02·03차): 「이등변삼각형 세 각이 {a}°, {a}°, □°」(= 180 − 2a) · 「세 각이 {a}°, □°, □°」(두 각이 같다 → (180 − a) ÷ 2) · 「정삼각형 한 각의 크기는?」(60)
  'g4.iso.angle': { id: 'isoAngle', gen(rng, d){ const kind = rng.pick(['twoSame', 'oneGiven', 'twoSame', 'oneGiven', 'equi']);
      if (kind === 'equi') return { concept: 'g4.iso.angle', fact: 'equi60', d: .2, prompt: { key: 'q.equi.angle', args: {} }, pic: 'equi', kind, answer: 60, wrongs: [[90, 'equi-sixty'], [180, 'equi-sixty'], [30, 'equi-sixty']] };
      if (kind === 'twoSame') { const a = (d < .5 ? 10 : 5) * rng.int(d < .5 ? 2 : 4, d < .5 ? 8 : 16), ans = 180 - 2 * a;
        return { concept: 'g4.iso.angle', fact: `two:${a}`, d: .3 + d * .3, prompt: { key: 'q.iso.twoSame', args: { a } }, pic: 'iso', kind, a, answer: ans, wrongs: [[180 - a, 'one-only'], [ans + 10 <= 170 ? ans + 10 : ans - 10, 'off-ten'], [2 * a <= 180 && 2 * a !== ans ? 2 * a : a, 'sum-instead']] }; }
      const a = 10 * rng.int(2, 14), ans = (180 - a) / 2;   // 짝수 10° 단위(20~140) → 답 자연수
      return { concept: 'g4.iso.angle', fact: `one:${a}`, d: .4 + d * .3, prompt: { key: 'q.iso.oneGiven', args: { a } }, pic: 'iso2', kind, a, answer: ans, wrongs: [[180 - a, 'half-miss'], [ans + 10 <= 170 ? ans + 10 : ans - 10, 'off-ten'], [a, 'same-as-given']] }; },
    verify: q => q.kind === 'equi' ? q.answer === 60 : q.kind === 'twoSame' ? q.answer === 180 - 2 * q.a && q.answer >= 20 : q.answer * 2 + q.a === 180 && Number.isInteger(q.answer) },
  // 변의 길이(정본 02·03차 성질): 「정삼각형 한 변이 {a}cm — 세 변의 길이의 합은?」(3a) · 「이등변삼각형 두 변이 {a}cm, 다른 변이 {b}cm — 세 변의 길이의 합은?」(2a + b) · 「이등변삼각형 한 변 {a}cm·같은 변이 두 개, 세 변 합 {s}cm — 다른 변은?」
  'g4.tri.len': { id: 'triLen', gen(rng, d){ const kind = rng.pick(['equi', 'iso', 'iso', 'isoMiss']); const a = rng.int(3, d < .5 ? 12 : 30);
      if (kind === 'equi') return { concept: 'g4.tri.len', fact: `equi:${a}`, d: .25 + a / 30 * .2, prompt: { key: 'q.equi.len', args: { a } }, pic: 'equi2', kind, a, answer: 3 * a, wrongs: [[2 * a, 'side-count'], [a, 'side-count'], [3 * a + 1, 'off-one']] };
      let b; do { b = rng.int(2, d < .5 ? 12 : 30); } while (b === a || b >= 2 * a);   // 삼각형이 되려면 b < 2a, 이등변이 아닌 변은 a 와 다르게
      if (kind === 'iso') return { concept: 'g4.tri.len', fact: `iso:${a},${b}`, d: .35 + (a + b) / 60 * .25, prompt: { key: 'q.iso.len', args: { a, b } }, pic: 'iso', kind, a, b, answer: 2 * a + b, wrongs: [[a + b, 'double-miss'], [3 * a, 'side-count'], [2 * b + a, 'double-miss']] };
      const s = 2 * a + b; return { concept: 'g4.tri.len', fact: `isoMiss:${a},${b}`, d: .5 + (a + b) / 60 * .25, prompt: { key: 'q.iso.lenMiss', args: { a, s } }, pic: 'iso2', kind, a, b, answer: b, wrongs: [[s - a, 'double-miss'], [a, 'same-as-given'], [b + 1, 'off-one']] }; },
    verify: q => q.kind === 'equi' ? q.answer === 3 * q.a : q.kind === 'iso' ? q.answer === 2 * q.a + q.b && q.b < 2 * q.a && q.b !== q.a : q.answer === q.b && q.b < 2 * q.a && q.b !== q.a },
};
const HINT1 = { 'g4.tri.side': 'hint.tri.side', 'g4.tri.byAngle': 'hint.tri.byAngle', 'g4.iso.angle': 'hint.iso.angle', 'g4.tri.len': 'hint.tri.len' };
export const G4_1_U4 = {};
for (const [k, g] of Object.entries(BASE)) G4_1_U4[k] = Object.assign({}, g, { unit: 'g4-1-u4', max: 180, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; q.hint1 = { key: HINT1[k], args: {} }; q.hint2 = null; if (g.choicePic) { q.choicePic = true; q.picPool = g.picPool.slice(); } return q; } });
