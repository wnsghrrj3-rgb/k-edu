// 1학년 1학기 4단원 「비교하기」 생성기 — 월드 3 「측정의 협곡」 v1(17 문서 3절), 베프 직접
// 정본: handoff kedu/curriculum/math/g1/unit4 [2수03-06] 길이·높이·들이 직접 비교(「더 길다·더 짧다·가장 길다」). 무게(저울)는 2차.
// 답은 정수 하나(계약 그대로): 그림 속 번호 ①②③ 중 하나 = 1~3. 문제 그림 = 'bars:a,b,c'(가로 길이) · 'tall:a,b,c'(세로 높이) · 'cups:a,b,c'(컵 물 높이).
const rankTag = (i, order) => order.indexOf(i) === 0 ? 'cmp-most' : order.indexOf(i) === 2 ? 'cmp-least' : 'cmp-middle';   // 오답 태그 = 고른 것이 셋 중 몇 째인지
function triple(rng, d){ // 서로 다른 셋, d 높으면 차이가 작음(1칸)
  const lo = 2, hi = 9; let vs; do { vs = [rng.int(lo, hi), rng.int(lo, hi), rng.int(lo, hi)]; } while (new Set(vs).size < 3 || (d < .5 && Math.min(...vs.map((v, i) => Math.abs(v - vs[(i + 1) % 3]))) < 2));
  return vs; }
function mk(key, kind, most, d, rng){ const vs = triple(rng, d); const order = [0, 1, 2].sort((a, b) => vs[b] - vs[a]); const ans = (most ? order[0] : order[2]) + 1;
  const wrongs = [0, 1, 2].filter(i => i + 1 !== ans).map(i => [i + 1, rankTag(i, order)]);
  const gap = Math.abs(vs[ans - 1] - vs[(most ? order[1] : order[1])]);
  return { concept: key, fact: `${kind}:${most ? 'most' : 'least'}:${vs.join(',')}`, d: .15 + (gap <= 1 ? .35 : gap === 2 ? .2 : 0), prompt: { key: 'q.' + key, args: {} }, pic: `${kind}:${vs.join(',')}`, vs, most, answer: ans, wrongs }; }
const BASE = {
  // 가장 긴 것(정본 l01 「길이 비교」): 가로 막대 셋 → 번호
  'g1.cmp.long': { id: 'cmpLong', gen(rng, d){ return mk('g1.cmp.long', 'bars', true, d, rng); } },
  // 가장 짧은 것
  'g1.cmp.short': { id: 'cmpShort', gen(rng, d){ return mk('g1.cmp.short', 'bars', false, d, rng); } },
  // 가장 높은 것(l02 「높이·키 비교」): 세로 막대 셋
  'g1.cmp.tall': { id: 'cmpTall', gen(rng, d){ return mk('g1.cmp.tall', 'tall', true, d, rng); } },
  // 가장 많이 담긴 것(l04 「들이 비교」): 같은 컵 셋에 물 높이 다르게
  'g1.cmp.most': { id: 'cmpMost', gen(rng, d){ return mk('g1.cmp.most', 'cups', true, d, rng); } },
};
const verify = q => { const vs = q.vs, best = q.most ? Math.max(...vs) : Math.min(...vs); return vs[q.answer - 1] === best && vs.filter(v => v === best).length === 1 && q.answer >= 1 && q.answer <= 3; };
export const G1_1_U4 = {};
for (const [k, g] of Object.entries(BASE)) G1_1_U4[k] = Object.assign({}, g, { unit: 'g1-1-u4', max: 9 /* 답은 1~3 번호, 오답 2개를 직접 주므로 채움 없음 — 검사 규칙(max ≥ 9)만 맞춤 */, verify, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; q.hint1 = { key: 'hint.' + k, args: {} }; q.hint2 = null; return q; } });
