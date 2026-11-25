/* 「오늘의 번쩍」 — 모든 낱칸의 복습(정본 27 문서 5-4 · 5-5절 · T09 설계서). 화면 없음(하네스가 그대로 불러 3000회 돌린다).
 *   더미   = map.js 기록이 통과(2) · 익힘(3)인 낱칸 가운데 옮김 표(MOVE)에 「켬」인 것.
 *   pick   = 하루에 낱칸 셋까지: ① 통과했고 별이 없고 통과한 날이 오늘보다 앞(가장 오래 기다린 것부터) ② 별이 있는 것 가운데 복습한 지 오래된 것 ③ 오늘 통과한 것.
 *   deal   = 낱칸마다 문제 셋(그 틀의 pool(cellId) 에서 · 서로 다름) · 판마다 낱칸이 한 문제씩(차례는 섞음 · 같은 낱칸 연달아 없음).
 *   익힘   = 그날 복습에서 그 낱칸의 문제 셋이 모두 깨끗하고 다른 날이면 별(map.js keep). 덤 한 판은 기록에 세지 않는다.
 *   하루 한 번 = 저장 `kedu_mathplay_flash` { day, done, best }(/kedu_scope.js 규칙 그대로 · 서버 호출 0).
 * 각 틀의 rules.js 는 고치지 않는다 — 그 pool(cellId) 만 가져다 쓴다(풀 이름이 다른 틀은 없다: 모두 pool). 문제를 「번쩍」 꼴로 옮기는 것은 아래 MOVE 한 곳.
 * 물건은 통 하나로 통일(수를 보는 눈은 하나 — 다섯씩 한 줄 · 열 칸) · 세어야 하는 낱칸은 가리지 않는다(머묾) · 띠는 그 낱칸의 교과서 말(식 기호는 B07 부터). */
import { pool as countPool } from '../count/rules.js?v=1';     /* 각 틀이 싣는 버전과 같게(count 1 · serve 1 · match 2 · line 2 · weigh 1 · split 3 · ride 2) */
import { pool as servePool } from '../serve/rules.js?v=1';
import { pool as matchPool } from '../match/rules.js?v=2';
import { pool as linePool, CELLS as LINE } from '../line/rules.js?v=2';
import { pool as weighPool } from '../weigh/rules.js?v=1';
import { pool as splitPool } from '../split/rules.js?v=3';
import { pool as ridePool } from '../ride/rules.js?v=2';
import * as F from './rules.js?v=1';
import { wa, eul, garu, moeu, word } from '../common/say.js?v=4';
import { MOVED, RULE, passed, kept, days, dayKey } from '../common/map.js?v=10';

// ── 내가 정한 수치(설계 기본안 — 열어 둔 것 1 · 2 · 5 의 기본안)
export const RT = { REVIEW_CELLS: 3, REVIEW_Q: 3, BONUS_Q: 3 };
export const KEY = 'kedu_mathplay_flash';

/* 띠 조각: { w: '모두' } 말 · { hole: 답 } 「?」 칸(닫히면 답) · { n: 3 } 수 · { dots: 3 } 점 무늬 · { op: '+' } 식 기호(B07 부터) */
const W = w => ({ w }), H = a => ({ hole: a }), N = n => ({ n }), O = op => ({ op });
const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
/** 고를 수 셋: 답 · 그 문제에 보이는 다른 수 하나(seen — 흔한 잘못 · 정본 5-3절 · 범위 안이면) · 1 차이(· 2 차이). 겹치거나 범위 밖이면 가까운 수. 자리는 섞는다. */
export function near3(answer, lo, hi, rnd = Math.random, seen = []){ const out = [answer], ok = n => n >= lo && n <= hi && !out.includes(n);
  const sv = shuffle(seen.slice(), rnd).find(ok); if (sv != null) out.push(sv);
  const d1 = shuffle([answer - 1, answer + 1], rnd).find(ok); if (d1 != null) out.push(d1); const d2 = out.length < 3 ? shuffle([answer - 2, answer + 2], rnd).find(ok) : null; if (d2 != null) out.push(d2);
  for (let d = 1; out.length < 3 && d < 20; d++) for (const x of [answer - d, answer + d]) if (out.length < 3 && ok(x)) out.push(x);
  return shuffle(out, rnd); }
/** 식 카드 셋(B07): 맞는 식 하나 + 수 하나가 다른 식 둘(참이 아닌 식 · 1~9). */
export function eqCards(a, b, rnd = Math.random){ const c = a + b, s = (x, y, z) => `${x} + ${y} = ${z}`, ok = ([x, y, z]) => [x, y, z].every(v => v >= 1 && v <= 9) && x + y !== z;
  const sumSide = shuffle([[a, b, c + 1], [a, b, c - 1]], rnd).filter(ok), addSide = shuffle([[a + 1, b, c], [a - 1, b, c], [a, b + 1, c], [a, b - 1, c]], rnd).filter(ok), pick = [];
  if (sumSide.length) pick.push(sumSide[0]); if (addSide.length) pick.push(addSide[0]); for (const x of [...sumSide, ...addSide]) if (pick.length < 2 && !pick.includes(x)) pick.push(x);
  return shuffle([s(a, b, c), ...pick.slice(0, 2).map(x => s(...x))], rnd); }

/** 낱칸마다 묶음(칸)의 자리 · 통 크기. 세로 다섯 줄 = 좁은 칸(셋째 칸 · 반쪽)에서 다섯씩 한 줄을 세로로. */
const R_SMALL = .14;
/** 길잡이 손이 답을 짚기까지(초 · 생각하는 동안): 세는 꼴(머묾 · 숫자 → 머묾)은 심지 끝까지 짚지 않는다(세는 시간을 빼앗지 않게 — 심지보다 1초 늦게) · 그 밖은 심지의 3/4(HINT_AFTER 보다 짧지 않게). */
export const hintS = mv => ['stay', 'numStay'].includes(mv.look) ? mv.fuse + 1 : Math.max(F.T.HINT_AFTER, Math.round(mv.fuse * .75 * 10) / 10);
const grp = (n, region, r = R_SMALL, how = 'fives') => ({ n, region, r, pts: how === 'scatter' ? null : F.fives(n, F.region(region), r) });

/* ── 옮김 표(T09 설계서 「각 틀의 문제를 「번쩍」 꼴로 옮기는 표」 — 켬인 줄만 · 새 틀이 생기면 그 묶음에서 줄을 더한다)
 *   look: stay 머묾(덧문이 열린 채 심지만) · flash 번쩍 · flashLR 두 짝이 차례로 번쩍 · flashLeft 번쩍 → 왼짝만 다시 열려 머묾 · flashCover 열 칸 번쩍 → 오른쪽 몇 칸이 가려진 채 머묾 · numStay 숫자가 덧문에 번쩍 → 머묾 · blind 덧문 닫힌 채(식 먼저 → 답한 뒤 열려 확인)
 *   form: row 단추 줄(점 + 숫자) · num 수 셋(숫자) · eq 식 카드 셋 · group 묶음을 누른다 · side 쪽을 누른다
 *   show = 보이는 시간(초 · 낱칸마다 고정 — 짧아지는 것은 A04 나들이와 덤 한 판뿐) · fuse = 심지(생각하는 동안에만 · 세는 낱칸은 길게) · items(cell) = 그 틀의 풀 → 서로 다른 문제 후보 */
/** 줄 세우기 틀의 줄(시작 · 길이) 안의 세 칸 창 모두(A08 은 8 · 9 · A09 는 3 · 2 · 1 까지 — 틀의 풀 그대로). */
const windows = id => { const d = (LINE[id] || {}).dir || 1, out = new Set(); for (const p of linePool(id)) for (let k = 0; k + 3 <= p.len; k++) out.add(p.start + d * k); return [...out].map(start => ({ start })); };
const uniq = (list, k) => { const seen = new Set(); return list.filter(x => { const v = k(x); if (seen.has(v)) return false; seen.add(v); return true; }); };
export const MOVE = {
  A01: { frame: 'count', look: 'stay', form: 'row', row: [1, 2, 3, 4, 5], show: 0, fuse: 12, items: id => countPool(id).map(n => ({ n })) },
  A06: { frame: 'count', look: 'stay', form: 'row', row: [5, 6, 7, 8, 9], show: 0, fuse: 18, items: id => countPool(id).map(n => ({ n })) },
  A02: { frame: 'serve', look: 'stay', form: 'group', show: 0, fuse: 12, items: id => uniq(servePool(id).filter(p => p.kind === 'give' && p.n >= 1), p => p.n).map(p => ({ n: p.n })) },
  A05: { frame: 'serve', look: 'flash', form: 'row', row: [0, 1, 2], show: 1.4, fuse: 8, items: id => uniq(servePool(id).filter(p => p.kind === 'left'), p => p.n).map(p => ({ n: p.n })) },
  A04: { frame: 'flash', look: 'flash', form: 'row', row: [1, 2, 3, 4, 5], show: 1.2, fuse: 8, items: id => uniq(F.pool(id), p => p.n).map(p => ({ n: p.n })) },
  A03: { frame: 'match', look: 'numStay', form: 'group', show: 1.4, fuse: 10, lim: [1, 5], items: id => matchPool(id).map(n => ({ n })) },
  A07: { frame: 'match', look: 'numStay', form: 'group', show: 1.4, fuse: 14, lim: [6, 9], items: id => matchPool(id).map(n => ({ n })) },
  A08: { frame: 'line', look: 'stay', form: 'num', show: 0, fuse: 10, lim: [1, 9], dir: 1, items: id => windows(id) },
  A09: { frame: 'line', look: 'stay', form: 'num', show: 0, fuse: 10, lim: [1, 9], dir: -1, items: id => windows(id) },
  A13: { frame: 'weigh', look: 'flash', form: 'side', show: 1.8, fuse: 8, items: id => weighPool(id).map(set => ({ set })) },
  A14: { frame: 'weigh', look: 'flash', form: 'side', show: 2.2, fuse: 8, items: id => weighPool(id).map(set => ({ set })) },
  B01: { frame: 'split', look: 'flashLR', form: 'num', show: 1.4, fuse: 8, lim: [1, 5], items: id => splitPool(id) },
  B03: { frame: 'split', look: 'flashLR', form: 'num', show: 1.4, fuse: 8, lim: [1, 9], items: id => splitPool(id) },
  B02: { frame: 'split', look: 'flashLeft', form: 'num', show: 1.4, fuse: 8, lim: [1, 5], items: id => splitPool(id) },
  B04: { frame: 'split', look: 'flashLeft', form: 'num', show: 1.4, fuse: 8, lim: [1, 9], items: id => splitPool(id) },
  B05: { frame: 'split', look: 'flashLeft', form: 'num', show: 1.4, fuse: 8, lim: [1, 9], items: id => splitPool(id) },
  C02: { frame: 'split', look: 'flash', form: 'num', show: 1.6, fuse: 8, lim: [1, 9], items: id => splitPool(id) },
  C03: { frame: 'split', look: 'flashCover', form: 'num', show: 1.6, fuse: 8, lim: [1, 9], items: id => splitPool(id) },
  B06: { frame: 'ride', look: 'stay', form: 'num', show: 0, fuse: 14, lim: [1, 9], items: id => ridePool(id).map(p => ({ a: p.a, b: p.b, kind: p.kind })) },
  B07: { frame: 'ride', look: 'flash', form: 'eq', show: 1.6, fuse: 10, items: id => uniq(ridePool(id), p => p.a + '+' + p.b).map(p => ({ a: p.a, b: p.b })) },
  B08: { frame: 'ride', look: 'blind', form: 'num', show: 0, fuse: 10, lim: [1, 5], items: id => uniq(ridePool(id), p => p.a + '+' + p.b).map(p => ({ a: p.a, b: p.b })) },
  B09: { frame: 'ride', look: 'blind', form: 'num', show: 0, fuse: 10, lim: [1, 9], items: id => uniq(ridePool(id), p => p.a + '+' + p.b).map(p => ({ a: p.a, b: p.b })) },
};
export const ON = Object.keys(MOVE);
/** 식 기호(+ =)를 띠에 쓰는 낱칸 = 덧셈식을 배운 낱칸부터(B07 · B08 · B09). */
export const SYMBOL_CELLS = ['B07', 'B08', 'B09'];
/** 세어야 하는 낱칸(가리지 않는다 — 머묾). */
export const COUNT_CELLS = ['A01', 'A06', 'A02'];

/** 풀에서 고른 것 하나를 「번쩍」 문제로. → { cell, look, show, fuse, form, opts, answer, band, say, groups, ten, doorNum, signs, roll, reveal, key, nums } */
export function make(cell, it, rnd = Math.random){ const mv = MOVE[cell], base = { cell, look: mv.look, show: mv.show, fuse: mv.fuse, hint: hintS(mv), form: mv.form, groups: [], ten: null, doorNum: null, signs: null, roll: false, say: null, reveal: 'count' };
  const lim = mv.lim || [1, 9];
  switch (cell) {
    case 'A01': case 'A06': { const n = it.n, r = cell === 'A06' ? .16 : F.T.R, g = { n, region: 'all', r, pts: F.scatter(n, F.region('all'), rnd, r) };
      return { ...base, key: `${n}`, opts: mv.row.slice(), answer: n, band: [W('모두'), H(n), W('개')], groups: [g], nums: [n, ...mv.row] }; }
    case 'A05': { const n = it.n, g = { n, region: 'all', r: F.T.R, pts: F.scatter(n, F.region('all'), rnd, F.T.R) };
      return { ...base, key: `${n}`, opts: mv.row.slice(), answer: n, band: [W('몇 개 남았지?'), H(n), W('개')], groups: [g], nums: [n, ...mv.row] }; }
    case 'A04': { const n = it.n, shape = F.SHAPES[n][Math.floor(rnd() * F.SHAPES[n].length)], g = { n, region: 'all', r: F.T.R, pts: F.layout(n, shape, rnd) || F.fives(n) };
      return { ...base, key: `${n}`, shape, opts: mv.row.slice(), answer: n, band: [W('모두'), H(n), W('개')], groups: [g], nums: [n, ...mv.row] }; }
    case 'A02': { const n = it.n, ns = near3(n, 1, 5, rnd), groups = ns.map((k, i) => grp(k, 'c' + i));
      return { ...base, key: `${n}`, opts: ns, answer: ns.indexOf(n), band: [W(word(n)), { dots: n }, W('주세요')], say: `${word(n)} 주세요`, groups, nums: [n, ...ns] }; }
    case 'A03': case 'A07': { const n = it.n, ns = near3(n, lim[0], lim[1], rnd), groups = ns.map((k, i) => grp(k, 'c' + i));
      return { ...base, key: `${n}`, opts: ns, answer: ns.indexOf(n), band: [N(n)], doorNum: n, groups, nums: [n, ...ns] }; }
    case 'A08': case 'A09': { const run = [0, 1, 2].map(k => it.start + mv.dir * k), hole = cell === 'A09' ? 1 + Math.floor(rnd() * 2) : Math.floor(rnd() * 3), ans = run[hole], xs = [-.85, 0, .85];   /* A09 는 줄 세우기 틀처럼 맨 앞이 늘 주어짐 */
      const signs = run.map((v, k) => ({ text: k === hole ? '?' : String(v), hole: k === hole, pt: { x: xs[k], z: .15 } }));
      const band = []; run.forEach((v, k) => { if (k) band.push(W('·')); band.push(k === hole ? H(ans) : N(v)); });
      return { ...base, key: `${it.start}`, run, opts: near3(ans, lim[0], lim[1], rnd, run.filter(v => v !== ans)), answer: ans, band, signs, groups: [{ n: 3, region: 'all', r: F.T.R, pts: xs.map(x => ({ x, z: .15 })) }], reveal: 'none', nums: [...run, ans] }; }
    case 'A13': case 'A14': { const set = shuffle(it.set.slice(), rnd), ask = rnd() < .5 ? 'big' : 'small', k = set.length, ans = ask === 'big' ? Math.max(...set) : Math.min(...set);
      const words = k === 2 ? (ask === 'big' ? '더 많은 쪽은?' : '더 적은 쪽은?') : (ask === 'big' ? '가장 많은 쪽은?' : '가장 적은 쪽은?'), groups = set.map((v, i) => grp(v, (k === 2 ? 'h' : 'c') + i));
      return { ...base, key: set.slice().sort((a, b) => a - b).join(','), set, ask, opts: set.slice(), answer: set.indexOf(ans), band: [W(words)], groups, nums: set.slice() }; }
    case 'B01': case 'B03': { const { a, b, N: n } = it;
      return { ...base, key: `${a}+${b}`, a, b, N: n, opts: near3(n, lim[0], lim[1], rnd, [a, b]), answer: n, band: [N(a), W(wa(a)), N(b), W(moeu(b)), H(n)], groups: [grp(a, 'L'), grp(b, 'R')], reveal: 'join', nums: [a, b, n] }; }
    case 'B02': case 'B04': case 'B05': { const n = it.N, a = it.a != null ? it.a : 1 + Math.floor(rnd() * (n - 1)), b = n - a;
      return { ...base, key: `${n}:${a}`, a, b, N: n, opts: near3(b, lim[0], lim[1], rnd, [a, n]), answer: b, band: [N(n), W(garu(n)), N(a), W(wa(a)), H(b)], groups: [grp(a, 'L'), grp(b, 'R')], reveal: 'split', nums: [n, a, b] }; }
    case 'C02': { const { a, b } = it;
      return { ...base, key: `${a}`, a, b, N: 10, opts: near3(b, lim[0], lim[1], rnd, [a]), answer: b, band: [N(a), W(wa(a)), H(b), { moeu: b }, N(10)], ten: { a, full: false, cover: 0 }, reveal: 'empty', nums: [a, b, 10] }; }
    case 'C03': { const { a, b } = it;
      return { ...base, key: `${a}`, a, b, N: 10, opts: near3(b, lim[0], lim[1], rnd, [a]), answer: b, band: [N(10), W(garu(10)), N(a), W(wa(a)), H(b)], ten: { a, full: true, cover: b }, reveal: 'split', nums: [10, a, b] }; }
    case 'B06': { const { a, b } = it, c = a + b, kind = it.kind || 'join';   /* 타고 내리기 틀의 이야기 둘 그대로: 더 들어감(join) · 양쪽에서 모임(merge) */
      const band = kind === 'merge' ? [W('왼쪽에서'), N(a), W('개,'), W('오른쪽에서'), N(b), W('개가 들어왔어요.'), W('모두'), H(c), W('개')] : [N(a), W('개가 있었는데'), N(b), W('개가 더 들어왔어요.'), W('모두'), H(c), W('개')];
      return { ...base, key: `${a}+${b}:${kind}`, a, b, kind, opts: near3(c, lim[0], lim[1], rnd, [a, b]), answer: c, band, groups: [grp(a, 'L'), grp(b, 'R')], roll: kind, reveal: 'join', nums: [a, b, c] }; }
    case 'B07': { const { a, b } = it, opts = eqCards(a, b, rnd), right = `${a} + ${b} = ${a + b}`;
      return { ...base, key: `${a}+${b}`, a, b, opts, answer: right, band: [W('알맞은 식은?')], groups: [grp(a, 'L'), grp(b, 'R')], reveal: 'join', nums: [a, b, a + b, ...opts.flatMap(s => s.match(/\d+/g).map(Number))] }; }
    case 'B08': case 'B09': { const { a, b } = it, c = a + b;
      return { ...base, key: `${a}+${b}`, a, b, opts: near3(c, lim[0], lim[1], rnd, [a, b]), answer: c, band: [N(a), O('+'), N(b), O('='), H(c)], groups: [grp(a, 'L'), grp(b, 'R')], reveal: 'join', nums: [a, b, c] }; }
  }
  return null; }
/** 띠의 글(하네스 · 소리 없는 기기): 「?」 칸은 '?' · closed 면 답. */
export const bandText = (p, closed = false) => p.band.map(x => partWord(x, closed) != null ? partWord(x, closed) : x.hole != null ? (closed ? String(x.hole) : '?') : x.n != null ? String(x.n) : x.dots != null ? '' : x.op).join(' ').replace(/\s+/g, ' ').trim();
/** 띠 조각의 말(「?」 뒤의 토씨는 닫히면 답의 받침을 따라간다 — C02 「6과 ?를 모으면 10」 → 「6과 4를 모으면 10」 · 「7과 3을 모으면 10」). 말이 아닌 조각이면 null. */
export const partWord = (x, closed) => x.w != null ? x.w : x.moeu != null ? moeu(closed ? x.moeu : '?') : null;
/** 판정: 누른 것(row · num 의 수 · eq 의 식 · group · side 의 칸 번호)이 답인가 → 'fit' | 'off'. */
export const judge = (pick, p) => pick === p.answer ? 'fit' : 'off';
/** 그 문제를 「한 번 더 볼」 수 있는가(번쩍이 있는 꼴만 · 쪽을 누르는 낱칸은 궤짝을 누르는 것이 답이라 없음). */
export const canPeek = p => ['flash', 'flashLR', 'flashLeft', 'flashCover'].includes(p.look) && p.form !== 'side';

// ── 더미 · 고르기 · 나누기
/** 더미: 통과(2) · 익힘(3)이고 옮김 표에 켬인 낱칸(옮김 표 차례). */
export const deck = m => ON.filter(id => passed(m[id]));
/** 오늘 별을 딸 수 있는 낱칸인가: 통과했고 별이 없고 통과한 날이 오늘보다 앞(통과한 날을 모르면 앞으로 친다). */
export const canStar = (rec, day) => !!rec && rec.state === 2 && (!rec.passDay || days(rec.passDay, day) >= RULE.KEEP_DAYS);
/** 하루에 뽑는 낱칸(셋까지) — 차례: ① 별을 딸 수 있는 것(가장 오래 기다린 것부터) ② 별이 있는 것(복습한 지 오래된 것부터) ③ 오늘 통과한 것. */
export function pick(m, day = dayKey()){ const ids = deck(m), ord = id => ON.indexOf(id), d = s => s || '0000-00-00';
  const a = ids.filter(id => canStar(m[id], day)).sort((x, y) => d(m[x].passDay).localeCompare(d(m[y].passDay)) || ord(x) - ord(y));
  const b = ids.filter(id => kept(m[id])).sort((x, y) => d(m[x].revDay || m[x].keptDay || m[x].passDay).localeCompare(d(m[y].revDay || m[y].keptDay || m[y].passDay)) || ord(x) - ord(y));
  const c = ids.filter(id => !a.includes(id) && !b.includes(id)).sort((x, y) => ord(x) - ord(y));
  return [...a, ...b, ...c].slice(0, RT.REVIEW_CELLS); }
/** 낱칸 하나의 서로 다른 문제 k 개(그 틀의 풀에서). */
export function draw(cell, k = RT.REVIEW_Q, rnd = Math.random){ const its = shuffle(MOVE[cell].items(cell).slice(), rnd), out = [], keys = new Set();
  for (const it of its) { const p = make(cell, it, rnd); if (!p || keys.has(p.key)) continue; keys.add(p.key); out.push(p); if (out.length >= k) break; }
  return out; }
/** 복습 한 번: 낱칸마다 문제 셋 → 판마다 낱칸이 한 문제씩(차례 섞음 · 같은 낱칸 연달아 없음 — 낱칸이 둘 이상일 때). opt.bonus = 덤 한 판(문제 셋 · 낱칸을 돌려 가며). */
export function deal(cells, rnd = Math.random, opt = {}){ if (!cells.length) return []; const per = opt.bonus ? Math.ceil(RT.BONUS_Q / cells.length) : RT.REVIEW_Q, bags = {}; for (const c of cells) bags[c] = draw(c, per, rnd);
  const rounds = Math.max(...cells.map(c => bags[c].length)), out = [];
  for (let k = 0; k < rounds; k++) { let ord = shuffle(cells.filter(c => bags[c][k]), rnd); if (out.length && ord.length > 1 && ord[0] === out[out.length - 1].cell) ord = [...ord.slice(1), ord[0]]; for (const c of ord) out.push(bags[c][k]); }
  return opt.bonus ? out.slice(0, RT.BONUS_Q) : out; }
/** 복습을 마친 기록(순수): 낱칸마다 그 낱칸의 결과로 keep. results = [{ cell, clean }…]. keepFn = map.js keep. → { m: 새 기록들, starred: [별을 새로 단 낱칸] } */
export function settle(m, results, day, keepFn){ const out = {}, starred = []; const cells = [...new Set(results.map(r => r.cell))];
  for (const c of cells) { const before = m[c], after = keepFn(before, results.filter(r => r.cell === c), day); out[c] = after; if (!kept(before) && kept(after)) starred.push(c); }
  return { m: out, starred }; }

// ── 하루 한 번(저장 — map.js 와 같은 방식: /kedu_scope.js 가 있으면 기기에 · 없으면 화면이 열려 있는 동안만)
const scope = () => (typeof window !== 'undefined' && window.__keduScope) || null;
const mem = {};
const store = { get(k){ try { if (scope()) return localStorage.getItem(k); } catch (_) {} return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
  set(k, v){ try { if (scope()) { localStorage.setItem(k, v); return; } } catch (_) {} mem[k] = v; } };
const blank = () => ({ day: '', done: false, best: 0 });
/** 오늘의 기록 { day, done, best } — 날이 바뀌면 새로. */
export function today(day = dayKey()){ let o = null; try { o = JSON.parse(store.get(KEY) || 'null'); } catch (_) {} const s = { ...blank(), ...(o || {}) }; return s.day === day ? s : { ...blank(), day }; }
export function save(s){ try { store.set(KEY, JSON.stringify({ day: s.day, done: !!s.done, best: Math.max(0, Math.min(F.T.FIRE_MAX, s.best | 0)) })); } catch (_) {} }
/** 고르는 화면의 단추 모습: off(통과한 낱칸 없음) · on(오늘 할 것이 있음) · done(오늘 끝) + 오늘 별을 딸 수 있는 깃발 수(셋까지) · 오늘 가장 큰 불꽃. */
export function status(m, day = dayKey(), st = today(day)){ const ids = deck(m); if (!ids.length) return { look: 'off', stars: 0, best: 0 };
  if (st.done) return { look: 'done', stars: 0, best: st.best | 0 };
  return { look: 'on', stars: pick(m, day).filter(id => canStar(m[id], day)).length, best: st.best | 0 }; }
