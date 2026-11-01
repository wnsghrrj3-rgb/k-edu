// 1학년 1학기 2단원 「여러 가지 모양」 생성기 — 월드 2 「도형의 신전」 첫 단원(16 문서 4절), 베프 직접
// 정본: handoff kedu/curriculum/math/g1/unit2 [2수03-01] 상자 모양·둥근 기둥 모양·공 모양을 생활 물건에서 찾고 특징(쌓기·굴리기·뾰족·평평)으로 가름.
// 답은 정수 하나(계약 그대로): 그림 문제는 pics.js 코드(7 상자·8 둥근 기둥·9 공) — choicePic 이면 보기 구슬에 숫자 대신 그림. 문제 그림(pic)은 스킨이 id 로 그림.
import { CODES, OBJECTS, PIC, FAMILY } from '../pics.js';
const SOLIDS = ['box', 'cyl', 'ball'];
const code = f => CODES[f][0];
const others = f => SOLIDS.filter(x => x !== f);
const why = f => 'solid-' + f;   // 오답 태그 = 고른 입체(그 입체의 특징을 설명)

// 특징 문제(정본 l03 촉각·쌓기·굴리기): 모양 하나만 맞는 특징만 쓴다(둘 다 굴러가는 「굴러가는 모양」은 안 씀)
const PROPS = [
  { key: 'q.solid.rollAll', ans: 'ball' },     // 어느 쪽으로도 잘 굴러가는 모양
  { key: 'q.solid.stackRoll', ans: 'cyl' },    // 쌓을 수도 있고 굴릴 수도 있는 모양
  { key: 'q.solid.pointy', ans: 'box' },       // 뾰족한 부분이 있는 모양
  { key: 'q.solid.noFlat', ans: 'ball' },      // 평평한 부분이 없는 모양
  { key: 'q.solid.stackOnly', ans: 'box' },    // 잘 쌓이고 굴러가지 않는 모양
  { key: 'q.solid.allFlat', ans: 'box' },      // 모든 면이 평평한 모양
  { key: 'q.solid.rollOne', ans: 'cyl' },      // 한쪽으로만 굴러가는 모양
  { key: 'q.solid.flatRound', ans: 'cyl' },    // 평평한 면과 둥근 부분이 다 있는 모양
];

const BASE = {
  // 같은 모양 찾기(정본 l01·l02): 물건 그림 → 같은 입체 고르기
  'g1.solid.same': { id: 'solidSame', choicePic: true, gen(rng){ const f = rng.pick(SOLIDS), obj = rng.pick(OBJECTS[f]); const [o1, o2] = others(f);
      return { concept: 'g1.solid.same', fact: `same:${obj}`, d: .25, prompt: { key: 'q.solid.same', args: {} }, pic: obj, fam: f, answer: code(f), wrongs: [[code(o1), why(o1)], [code(o2), why(o2)]] }; },
    verify: q => FAMILY[PIC[q.answer]] === q.fam && OBJECTS[q.fam].includes(q.pic) },
  // 특징으로 찾기(정본 l03)
  'g1.solid.prop': { id: 'solidProp', choicePic: true, gen(rng, d){ const p = rng.pick(PROPS); const [o1, o2] = others(p.ans);
      return { concept: 'g1.solid.prop', fact: `prop:${p.key.slice(8)}`, d: .35 + d * .2, prompt: { key: p.key, args: {} }, pic: null, fam: p.ans, answer: code(p.ans), wrongs: [[code(o1), why(o1)], [code(o2), why(o2)]] }; },
    verify: q => FAMILY[PIC[q.answer]] === q.fam && PROPS.some(p => p.key === q.prompt.key && p.ans === q.fam) },
  // 몇 개(정본 l02 분류): 물건 4~6개 줄 그림에서 한 모양 세기 — 답 정수
  'g1.solid.count': { id: 'solidCount', gen(rng, d){ const n = rng.next() < d ? rng.int(5, 6) : rng.int(4, 5); const f = rng.pick(SOLIDS); const row = []; let cnt = 0;
      for (let i = 0; i < n; i++) { const g = rng.pick(SOLIDS); row.push(rng.pick(OBJECTS[g])); if (g === f) cnt++; }
      if (cnt === 0) { row[rng.int(0, n - 1)] = rng.pick(OBJECTS[f]); cnt = 1; }   // 최소 1개는 있게
      const other = row.filter(o => FAMILY_OBJ(o) !== f).length;
      return { concept: 'g1.solid.count', fact: `cnt:${row.join(',')}`, d: .2 + (n - 4) * .2, prompt: { key: 'q.solid.count.' + f, args: {} }, pic: 'row:' + row.join(','), fam: f, row, answer: cnt,
        wrongs: [[n, 'count-all'], [other, 'count-other'], [cnt + 1, 'off-by-one'], [cnt - 1, 'off-by-one']] }; },
    verify: q => q.row.filter(o => FAMILY_OBJ(o) === q.fam).length === q.answer && q.answer >= 1 },
};
function FAMILY_OBJ(o){ for (const f of SOLIDS) if (OBJECTS[f].includes(o)) return f; return null; }
const HINT1 = { 'g1.solid.same': 'hint.solid.same', 'g1.solid.prop': 'hint.solid.prop', 'g1.solid.count': 'hint.solid.count' };
export const G1_1_U2 = {};
for (const [k, g] of Object.entries(BASE)) G1_1_U2[k] = Object.assign({}, g, { unit: 'g1-1-u2', max: 9, picPool: [7, 8, 9], gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; q.hint1 = { key: HINT1[k], args: {} }; q.hint2 = null; if (g.choicePic) { q.choicePic = true; q.picPool = [7, 8, 9]; } return q; } });
