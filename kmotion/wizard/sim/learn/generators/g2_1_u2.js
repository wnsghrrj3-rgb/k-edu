// 2학년 1학기 2단원 「여러 가지 도형」 생성기 — 월드 2 「도형의 신전」(16 문서 4절), 베프 직접
// 정본: handoff kedu/curriculum/math/g2/unit2 [2수03-02~05] 삼각형·사각형·원(예·예 아님 가르기, 변·꼭짓점 수), 쌓기나무 개수.
// 답은 정수 하나(계약 그대로): 그림 문제는 pics.js 코드 1~6(삼각형 2종·사각형 2종·원 2종 — 모양 하나로 외우지 않게 변형 섞음).
import { CODES, PIC, FAMILY } from '../pics.js';
const PLANES = ['tri', 'quad', 'circ'];
const SIDES = { tri: 3, quad: 4, circ: 0 };
const others = f => PLANES.filter(x => x !== f);
const why = f => 'plane-' + f;   // 오답 태그 = 고른 도형(그 도형이 뭔지 설명)
const pickCode = (rng, f) => rng.pick(CODES[f]);

const BASE = {
  // 예 찾기(정본 l02~l04): 「삼각형은 어느 것일까요?」 — 보기 = 정답 도형 변형 1 + 다른 도형 2
  'g2.plane.pick': { id: 'planePick', choicePic: true, gen(rng, d){ const f = rng.pick(PLANES); const [o1, o2] = others(f); const a = rng.next() < d ? CODES[f][1] : CODES[f][0]; const w1 = pickCode(rng, o1), w2 = pickCode(rng, o2);   // d 높으면 흔치 않은 모양(둔각·사다리꼴·작은 원)
      return { concept: 'g2.plane.pick', fact: `pick:${f}:${a}:${w1},${w2}`, d: .2 + (a === CODES[f][1] ? .3 : 0), prompt: { key: 'q.plane.pick.' + f, args: {} }, pic: null, fam: f, answer: a, wrongs: [[w1, why(o1)], [w2, why(o2)]] }; },
    verify: q => FAMILY[PIC[q.answer]] === q.fam },
  // 예 아닌 것 찾기(학습 목표 1): 「사각형이 아닌 것은?」 — 보기 = 그 도형 변형 2 + 다른 도형 1(정답)
  'g2.plane.not': { id: 'planeNot', choicePic: true, gen(rng, d){ const f = rng.pick(PLANES); const o = rng.pick(others(f)); const a = pickCode(rng, o);
      return { concept: 'g2.plane.not', fact: `not:${f}:${a}`, d: .35 + d * .2, prompt: { key: 'q.plane.not.' + f, args: {} }, pic: null, fam: f, answer: a, wrongs: [[CODES[f][0], 'is-' + f], [CODES[f][1], 'is-' + f]] }; },
    verify: q => FAMILY[PIC[q.answer]] !== q.fam && PLANES.includes(q.fam) },
  // 변·꼭짓점 수(정본 l02·l03, 학습 목표 2·3): 도형 그림 → 수 — 원은 변·꼭짓점이 없다(0)
  'g2.plane.count': { id: 'planeCount', gen(rng, d){ const f = rng.next() < d * .5 ? 'circ' : rng.pick(['tri', 'quad']); const what = rng.pick(['side', 'vertex']); const g = rng.pick(CODES[f]); const ans = SIDES[f];
      const wrongs = f === 'circ' ? [[3, 'circ-has-none'], [4, 'circ-has-none'], [1, 'circ-has-none']] : [[ans === 3 ? 4 : 3, 'count-other-shape'], [ans + 1, 'off-by-one'], [ans - 1, 'off-by-one']];
      return { concept: 'g2.plane.count', fact: `cnt:${f}:${what}:${g}`, d: f === 'circ' ? .55 : .25, prompt: { key: `q.plane.${what}.${f}`, args: {} }, pic: PIC[g], fam: f, answer: ans, wrongs }; },
    verify: q => q.answer === SIDES[q.fam] && FAMILY[q.pic] === q.fam },
  // 변 수로 찾기(학습 목표 2): 「변이 3개인 도형은?」
  'g2.plane.bySides': { id: 'planeBySides', choicePic: true, gen(rng, d){ const f = rng.pick(['tri', 'quad']); const [o1, o2] = others(f); const what = rng.pick(['side', 'vertex']); const a = rng.next() < d ? CODES[f][1] : CODES[f][0];
      return { concept: 'g2.plane.bySides', fact: `by:${what}:${f}:${a}`, d: .3 + (a === CODES[f][1] ? .25 : 0), prompt: { key: `q.plane.by.${what}`, args: { n: SIDES[f] } }, pic: null, fam: f, answer: a, wrongs: [[pickCode(rng, o1), why(o1)], [pickCode(rng, o2), why(o2)]] }; },
    verify: q => FAMILY[PIC[q.answer]] === q.fam && SIDES[q.fam] === q.prompt.args.n },
  // 쌓기나무 개수(정본 l06): 앞에서 본 기둥 그림(기둥 높이 1~3, 2~4줄) → 모두 몇 개
  'g2.cubes.count': { id: 'cubesCount', gen(rng, d){ const cols = rng.next() < d ? rng.int(3, 4) : rng.int(2, 3); const hs = []; for (let i = 0; i < cols; i++) hs.push(rng.int(1, 3)); const sum = hs.reduce((a, b) => a + b, 0), tall = Math.max(...hs);
      return { concept: 'g2.cubes.count', fact: `cubes:${hs.join(',')}`, d: .15 + (sum - 2) / 10 * .6, prompt: { key: 'q.cubes.count', args: {} }, pic: 'cubes:' + hs.join(','), hs, answer: sum,
        wrongs: [[cols, 'count-columns'], [tall, 'count-tall'], [sum + 1, 'off-by-one'], [sum - 1, 'off-by-one']] }; },
    verify: q => q.hs.reduce((a, b) => a + b, 0) === q.answer && q.answer >= 2 && q.answer <= 12 },
};
const HINT1 = { 'g2.plane.pick': 'hint.plane.pick', 'g2.plane.not': 'hint.plane.not', 'g2.plane.count': 'hint.plane.count', 'g2.plane.bySides': 'hint.plane.bySides', 'g2.cubes.count': 'hint.cubes.count' };
export const G2_1_U2 = {};
for (const [k, g] of Object.entries(BASE)) G2_1_U2[k] = Object.assign({}, g, { unit: 'g2-1-u2', max: 12, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; q.hint1 = { key: HINT1[k], args: {} }; q.hint2 = null; if (g.choicePic) { q.choicePic = true; q.picPool = [1, 2, 3, 4, 5, 6]; } return q; } });
