// 3학년 1학기 2단원 「평면도형」 생성기 — 월드 2 「도형의 신전」 3학년 줄(16 문서 8절 ④), 베프 직접
// 정본: handoff kedu/curriculum/math/g3/unit2 [4수03-01] 선분·반직선·직선 구별 · [4수03-02] 각·직각(3학년은 직각까지만) · [4수03-09] 직각삼각형만 · [4수03-10] 직사각형·정사각형만.
// ⚠️ 범위 경계(정본): 각도(90°)·예각·둔각·이등변·수직·평행·사다리꼴·평행사변형·마름모 = 4학년 — 문구·태그 어디에도 안 씀. 「직각이 아닌 각」까지만.
// 답은 정수 하나(계약 그대로): 그림 문제는 pics.js 코드(10~23·28~30) — choicePic 이면 보기 구슬에 숫자 대신 그림. 직각 세기만 수 답.
import { CODES, PIC, FAMILY, RIGHT_ANGLES } from '../pics.js';
const LINES = ['seg', 'ray', 'line'];
const others = (arr, f) => arr.filter(x => x !== f);
const vari = (rng, f, d) => rng.next() < d ? CODES[f][1] : CODES[f][0];   // d 높으면 방향이 다른 변형
const NORIGHT_TRI = [1, 2], NORIGHT_QUAD = CODES.quadNoRight;   // 직각 없는 삼각형(2-1 2단원 그림 그대로)·직각 없는 사각형
const POOL_LINE = [10, 11, 12, 28, 29, 30], POOL_RIGHT = [13, 14, 15, 16, 1, 2, 17, 18], POOL_QUAD = [4, 19, 20, 21, 22, 23];

const BASE = {
  // 선의 종류(정본 02차): 「선분은 어느 것?」 / 「선분이 아닌 것은?」 — 끝 처리(점·화살표)로 가른다
  'g3.line.find': { id: 'lineFind', choicePic: true, picPool: POOL_LINE, gen(rng, d){ const f = rng.pick(LINES); const [o1, o2] = others(LINES, f);
      if (rng.next() < .4) {   // 아닌 것: 그 선 변형 2 + 다른 선 1(정답)
        const o = rng.pick([o1, o2]), a = vari(rng, o, d);
        return { concept: 'g3.line.find', fact: `not:${f}:${a}`, d: .4 + d * .2, prompt: { key: 'q.line.not.' + f, args: {} }, pic: null, fam: f, kind: 'not', answer: a, wrongs: [[CODES[f][0], 'is-' + f], [CODES[f][1], 'is-' + f]] }; }
      const a = vari(rng, f, d);
      return { concept: 'g3.line.find', fact: `pick:${f}:${a}`, d: .2 + d * .2, prompt: { key: 'q.line.pick.' + f, args: {} }, pic: null, fam: f, kind: 'pick', answer: a, wrongs: [[vari(rng, o1, d), 'line-' + o1], [vari(rng, o2, d), 'line-' + o2]] }; },
    verify: q => q.kind === 'pick' ? FAMILY[PIC[q.answer]] === q.fam : (FAMILY[PIC[q.answer]] !== q.fam && LINES.includes(FAMILY[PIC[q.answer]])) },
  // 직각·직각삼각형 찾기(정본 04·05차): 「직각은 어느 것?」「직각이 아닌 각은?」「직각삼각형은 어느 것?」「직각삼각형이 아닌 것은?」 — 놓인 방향이 달라도 직각(삼각자 대기)
  'g3.right.find': { id: 'rightFind', choicePic: true, picPool: POOL_RIGHT, gen(rng, d){ const tri = rng.next() < .5; const not = rng.next() < .4;
      const yes = tri ? CODES.rtri : CODES.rangle, no = tri ? NORIGHT_TRI : CODES.angle, name = tri ? 'tri' : 'angle';
      const a = not ? rng.pick(no) : rng.pick(yes), w = not ? yes : no;
      return { concept: 'g3.right.find', fact: `${name}:${not ? 'not' : 'pick'}:${a}`, d: (not ? .45 : .25) + d * .2, prompt: { key: `q.right.${not ? 'not' : 'pick'}.${name}`, args: {} }, pic: null, tri, not, answer: a,
        wrongs: [[w[0], not ? 'is-right-' + name : 'no-right-' + name], [w[1], not ? 'is-right-' + name : 'no-right-' + name]] }; },
    verify: q => { const yes = q.tri ? CODES.rtri : CODES.rangle, no = q.tri ? NORIGHT_TRI : CODES.angle; return (q.not ? no : yes).includes(q.answer) && !(q.not ? yes : no).includes(q.answer); } },
  // 직사각형·정사각형(정본 06차): 「직사각형은?」(직각 없는 사각형 2 가 오답) · 「정사각형은?」(직사각형 1 + 직각 없는 사각형 1 이 오답) · 「직사각형이 아닌 것은?」(직사각형·정사각형이 오답 — 정사각형도 직사각형)
  'g3.quad.right': { id: 'quadRight', choicePic: true, picPool: POOL_QUAD, gen(rng, d){ const kind = rng.pick(['rect', 'square', 'notRect']);
      if (kind === 'rect') { const a = vari(rng, 'rect', d); return { concept: 'g3.quad.right', fact: `rect:${a}`, d: .25 + d * .15, prompt: { key: 'q.quad.pick.rect', args: {} }, pic: null, kind, answer: a, wrongs: [[NORIGHT_QUAD[0], 'quad-no-right'], [NORIGHT_QUAD[1], 'quad-no-right']] }; }
      if (kind === 'square') { const a = vari(rng, 'square', d), r = vari(rng, 'rect', d), n = rng.pick(NORIGHT_QUAD); return { concept: 'g3.quad.right', fact: `square:${a}:${r},${n}`, d: .35 + d * .2, prompt: { key: 'q.quad.pick.square', args: {} }, pic: null, kind, answer: a, wrongs: [[r, 'rect-not-square'], [n, 'quad-no-right']] }; }
      const a = rng.pick(NORIGHT_QUAD), r = vari(rng, 'rect', d), s = vari(rng, 'square', d);
      return { concept: 'g3.quad.right', fact: `notRect:${a}:${r},${s}`, d: .5 + d * .2, prompt: { key: 'q.quad.not.rect', args: {} }, pic: null, kind, answer: a, wrongs: [[r, 'is-rect'], [s, 'square-is-rect']] }; },
    verify: q => q.kind === 'rect' ? CODES.rect.includes(q.answer) : q.kind === 'square' ? CODES.square.includes(q.answer) : NORIGHT_QUAD.includes(q.answer) },
  // 직각 세기(정본 05·06차 분류 활동): 도형 그림 → 직각이 몇 개(0·1·4) — 수 답. 직사각형·정사각형은 4, 직각삼각형은 1, 나머지 0
  'g3.right.count': { id: 'rightCount', gen(rng, d){ const codes = Object.keys(RIGHT_ANGLES).map(Number); const g = rng.pick(codes), ans = RIGHT_ANGLES[g];
      const wrongs = ans === 0 ? [[1, 'count-right'], [4, 'count-right'], [3, 'count-right']] : ans === 1 ? [[0, 'miss-right'], [3, 'count-right'], [2, 'count-right']] : [[2, 'miss-right'], [1, 'miss-right'], [0, 'miss-right']];
      return { concept: 'g3.right.count', fact: `cnt:${g}`, d: ans === 0 ? .3 : ans === 1 ? .35 : .4 + d * .1, prompt: { key: 'q.right.count', args: {} }, pic: PIC[g], g, answer: ans, wrongs }; },
    verify: q => RIGHT_ANGLES[q.g] === q.answer && [0, 1, 4].includes(q.answer) },
};
const HINT1 = { 'g3.line.find': 'hint.line.find', 'g3.right.find': 'hint.right.find', 'g3.quad.right': 'hint.quad.right', 'g3.right.count': 'hint.right.count' };
export const G3_1_U2 = {};
for (const [k, g] of Object.entries(BASE)) G3_1_U2[k] = Object.assign({}, g, { unit: 'g3-1-u2', max: 32, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; q.hint1 = { key: HINT1[k], args: {} }; q.hint2 = null; if (g.choicePic) { q.choicePic = true; q.picPool = g.picPool.slice(); } return q; } });
