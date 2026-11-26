/* 같은 접시 틀 「둘씩 한 접시」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/T11_같은접시_틀.md · 정본 27 문서 4 · 5절(5-9 · 5-10 · 5-11).
 * 손이 다르다: 낱개를 세어 담지 않는다. 접시 더미를 한 번 누르면 같은 묶음(둘 · 다섯)이 올라간 접시가 한 장 깔린다 — 세는 것은 「몇 번 놓았는가」.
 *   D06 짝수와 홀수 : 통에 물고기 N → 둘씩 놓아 하나가 남는지 → 「7은 ?」 낱말 카드 둘(짝수 · 홀수). 늘 「통 + 접시 위 = N」.
 *   J01 묶어 세기   : g 마리씩 n 접시(2씩 2~9 · 5씩 2~6) → 종(「다 놓았어요」) → 「2씩 4묶음은 ?」 수 셋. 접시마다 물고기는 꼭 g 마리.
 * 뒤 묶음(이름만): T11b J02 몇의 몇 배 · J03 곱셈식 / T11c~ 곱셈구구 L01~L10 — CELLS 에 줄만 더한다(묶음 크기 g · 접시 수 n 을 낱칸으로 받는다). 이번에는 곱하기 기호가 어디에도 없다. */
import { eun, UNIT } from '../common/say.js?v=6';

// ── 낱칸 표: kind = parity(짝수와 홀수) | skip(묶어 세기)
export const CELLS = {
  D06: { kind: 'parity', g: 2, hand: [2, 10], lo: 1, hi: 20 },                       // 걸음 ① 2~10 · 걸음 ② 1~20
  J01: { kind: 'skip', gs: { 2: [2, 9], 5: [2, 6] }, boards: [[2, 2, 5], [2, 2, 5], [2, 5, 5]] },   // 2씩 2~9 · 5씩 2~6 · 판마다 2씩 · 5씩이 함께(셋째 판은 5씩 둘)
};
export const IDS = Object.keys(CELLS);
export const WORDS = ['짝수', '홀수'];   /* 낱말 카드(자리 고정 — 왼쪽 짝수 · 오른쪽 홀수) */

// ── 내가 정한 수치(T11 설계 기본안 + 코드가 정한 것 — 준호가 반에서 보고 바꾼다)
export const T = {
  ORDER_S: { D06: 16, J01: 20 }, ORDER_LAST: { D06: 13, J01: 16 },   // 쌓이는 주문(생각하는 동안에만 · 나들이 셋째 판은 조금 빨리)
  SLIDE_P: .3, DOG_P: .3, GOLD_P: .25, BARE_P: .3,                  // 판마다 사건 하나를 뽑는 몫(빈 접시 먼저는 통과 뒤에만 · 몫의 합으로 나눠 판마다 꼭 하나)
  STREAK: 3, HINT_AFTER: 6, FAN_MS: 120, PLATE_MAX: 10, ONE_MAX: 1, // 척척 · 가만히 이만큼(초)이면 길잡이 손 · 쫙 펴질 때 접시 사이(ms) · 탁자 위 접시 · D06 한 나들이에 N = 1
  PER_BOARD: 3, BOARDS: 3, RETRY_GAP: 2,                            // 판 = 문제 셋(쪽지 셋이 한꺼번에) · 나들이 = 판 셋 · 깨끗하지 못한 문제는 문제 둘 뒤에 다시
  GOLD_COINS: 3, COIN_PER: 1,                                       // 금테 쪽지의 덤 · 문제 하나에 동전(코드가 정함)
  BIG: 5,                                                           // D06 걸음 ② 아홉 가운데 11~20 이 다섯(걸음 ① 판이 끼면 그 몫만큼 줄인다)
  ORDER_ADD: [.4, .7], ORDER_SHAKE: .82,                            // 쌓이는 주문: 시계의 이만큼에서 새 쪽지가 하나씩 밀려 들어옴 · 이만큼부터 줄이 출렁(코드가 정함)
  SLIDE_S: 2.6, SLIDE_AT: [.25, .6], DOG_S: 4.5, DOG_AT: [.2, .55], // 미끄러지는 접시를 잡을 수 있는 동안(초) · 시계의 어디쯤 · 강아지가 고개를 내민 동안 · 어디쯤(코드가 정함)
  TELL_SLOW: .35, CARD_GUARD: .3,                                   // 한 줄 안내가 떠 있는 동안 시계 빠르기(곱) · 새 카드 뒤 누름을 받지 않는 동안(초 · 코드가 정함)
};
/** 사건 차례(처음 판들은 이 차례로 하나씩 · 걸음 ① 인 판은 사건 없음 · 쌓이는 주문은 처음 나온 뒤로 늘). D06 에는 미끄러지는 접시가 없다 — 접시를 놓지 않고 바로 고르는 아이에게는 미끄러질 접시가 없어 사건 없는 판이 되므로 차례 · 몫에서 뺐다. */
export const INTRO = { D06: ['order', 'dog', 'gold', 'bare', 'streak'], J01: ['order', 'slide', 'dog', 'gold', 'bare', 'streak'] };

const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const make = (cell, a, b) => CELLS[cell].kind === 'parity' ? { cell, N: a } : { cell, g: a, n: b };
export const key = p => p.N != null ? 'N' + p.N : 'g' + p.g + 'n' + p.n;
export const same = (p, q) => !!p && !!q && key(p) === key(q);
/** 답: D06 = 「짝수」 · 「홀수」 · J01 = 모두 몇 마리(g × n 을 뛰어 센 수). */
export const parity = N => N % 2 === 0 ? WORDS[0] : WORDS[1];
export const answer = p => p.N != null ? parity(p.N) : p.g * p.n;
/** 그 낱칸의 문제 풀(풀 밖의 수는 나오지 않는다). D06 = { N } 1~20 / J01 = { g, n } 2씩 2~9 · 5씩 2~6. */
export function pool(id){ const c = CELLS[id]; if (!c) return []; if (c.kind === 'parity') return range(c.lo, c.hi).map(N => make(id, N));
  return Object.keys(c.gs).map(Number).flatMap(g => range(c.gs[g][0], c.gs[g][1]).map(n => make(id, g, n))); }

/** 나들이 하나(쪽지 아홉 · 판마다 셋). history = 앞 나들이(첫 문제가 앞 끝과 같지 않게).
 *  opt.hand = 판마다 걸음 ① 인가 [b0, b1, b2](D06 걸음 ① 판은 2~10) · opt.small = 막혔을 때 작은 수 쪽에서(D06 큰 수 하나까지 · J01 2씩 2~6 · 5씩 2~5) · opt.carry = 앞 나들이 끝에서 다시 낼 자리가 없던 문제들(이번 나들이 앞쪽에). */
export function deal(id, history = [], rnd = Math.random, opt = {}){ const c = CELLS[id]; if (!c) return []; const last = history.length ? history[history.length - 1] : null, carry = (opt.carry || []).filter(p => p && p.cell === id);
  for (let tries = 0; tries < 400; tries++) { const q = c.kind === 'parity' ? dealD06(c, rnd, opt, carry) : dealJ01(c, rnd, opt, carry); if (q && okDeal(id, q, last, opt)) return q; }
  return c.kind === 'parity' ? fallbackD06(c, opt) : fallbackJ01(); }
/** 나들이 규칙 검사(deal 이 스스로 본다 · 하네스도 같은 것을 본다): 같은 문제 연달아 없음 · D06 같은 답 셋 연달아 없음 · 1 은 한 번까지 · J01 한 판에 같은 n 두 번 없음. */
export function okDeal(id, q, last, opt = {}){ if (q.length !== T.PER_BOARD * T.BOARDS) return false; if (last && same(last, q[0])) return false; for (let k = 1; k < q.length; k++) if (same(q[k - 1], q[k])) return false;
  const hand = opt.hand || [];
  if (id === 'D06') { for (let k = 2; k < q.length; k++) if (parity(q[k].N) === parity(q[k - 1].N) && parity(q[k].N) === parity(q[k - 2].N)) return false; if (q.filter(p => p.N === 1).length > T.ONE_MAX) return false;
    for (let k = 0; k < q.length; k++) { const h = !!hand[Math.floor(k / T.PER_BOARD)], N = q[k].N; if (h ? N < CELLS.D06.hand[0] || N > CELLS.D06.hand[1] : N < 1 || N > 20) return false; }
    const ev = q.filter(p => p.N % 2 === 0).length; if (ev < 3 || ev > 6) return false; }
  else { for (let b = 0; b < T.BOARDS; b++) { const bd = q.slice(b * 3, b * 3 + 3); if (new Set(bd.map(p => p.n)).size !== 3) return false; if (!bd.some(p => p.g === 2) || !bd.some(p => p.g === 5)) return false; } if (q.filter(p => p.g === 2).length !== 5) return false; }
  return true; }
function dealD06(c, rnd, opt, carry){ const n = T.PER_BOARD * T.BOARDS, hand = opt.hand || [], isH = k => !!hand[Math.floor(k / T.PER_BOARD)], c2 = range(0, n - 1).filter(k => !isH(k)).length;
  /* 짝 · 홀 차례: 넷 · 다섯(또는 다섯 · 넷) · 셋 연달아 없음 */ const evens = rnd() < .5 ? 4 : 5, par = shuffle([...Array(evens).fill(0), ...Array(n - evens).fill(1)], rnd);
  let big = Math.round(T.BIG * c2 / n); if (opt.small) big = Math.min(big, 1);
  const pos2 = range(0, n - 1).filter(k => !isH(k)), bigAt = new Set(opt.small ? pos2.slice(-big) : shuffle(pos2.slice(), rnd).slice(0, big)), used = new Set(), out = new Array(n);
  /* 넘겨받은 문제(걸음 ② 자리 앞쪽에 · 그 수의 짝 · 홀을 차례에 맞춘다) */ let ci = 0; for (const p of carry) { const k = pos2.find((x, i) => i >= ci && !out[x]); if (k == null) break; ci = pos2.indexOf(k) + 1; out[k] = make('D06', p.N); used.add(p.N); par[k] = p.N % 2; }
  for (let k = 0; k < n; k++) { if (out[k]) continue; const want = par[k], lo = isH(k) ? c.hand[0] : bigAt.has(k) ? 11 : 1, hi = isH(k) ? c.hand[1] : bigAt.has(k) ? 20 : 10;
    let cand = range(lo, hi).filter(N => N % 2 === want && !used.has(N)); if (!cand.length) cand = range(lo, hi).filter(N => N % 2 === want); if (!cand.length) return null;
    cand = opt.small && !isH(k) ? cand.slice(0, 3) : cand; const N = cand[Math.floor(rnd() * cand.length)]; out[k] = make('D06', N); used.add(N); }
  return out; }
function dealJ01(c, rnd, opt, carry){ const gs = c.boards.map(b => shuffle(b.slice(), rnd)).flat(), lists = {};
  for (const g of [2, 5]) { const [a, b] = c.gs[g]; let all = range(a, b); if (opt.small) all = all.slice(0, g === 2 ? 5 : 4); lists[g] = shuffle(all.slice(), rnd).slice(0, g === 2 ? 5 : 4); }
  for (const p of carry.slice().reverse()) { const L = lists[p.g]; if (!L) continue; const i = L.indexOf(p.n); if (i >= 0) L.splice(i, 1); else L.pop(); L.unshift(p.n); }   /* 넘겨받은 문제는 그 묶음 크기의 맨 앞으로 */
  const at = { 2: 0, 5: 0 }; return gs.map(g => make('J01', g, lists[g][at[g]++])); }
function fallbackD06(c, opt){ const hand = opt.hand || []; const base = [2, 7, 4, 9, 6, 13, 16, 11, 18]; return base.map((N, k) => make('D06', hand[Math.floor(k / 3)] ? [2, 5, 4, 3, 6, 7, 8, 9, 10][k] : N)); }
function fallbackJ01(){ return [[2, 3], [5, 2], [2, 5], [2, 4], [5, 3], [2, 6], [2, 7], [5, 4], [5, 5]].map(([g, n]) => make('J01', g, n)); }

/** 깨끗하지 못했던 문제를 「문제 둘 뒤에」 다시(같은 N · 같은 g 와 n · 길이 그대로 — 끝의 문제 하나가 빠진다). 앞뒤가 같으면 한 칸씩 뒤로.
 *  자리가 없으면(일곱째~아홉째) { q 그대로, carry: 그 문제 } — 다음 나들이 앞쪽으로 넘긴다(deal opt.carry). */
export function requeue(q, i){ const p = q[i], copy = () => ({ ...(p.N != null ? make(p.cell, p.N) : make(p.cell, p.g, p.n)), retry: true });
  for (let at = i + T.RETRY_GAP + 1; at < q.length; at++) { const a = q.slice(); a.splice(at, 0, copy()); a.length = q.length; if (!same(a[at - 1], a[at]) && !same(a[at], a[at + 1])) return { q: a, carry: null }; }
  return { q: q.slice(), carry: copy() }; }

/** 그 판의 사건. evBoards = 이 낱칸에서 앞서 사건이 붙은 판 수 · opt = { passed, calm, hand }.
 *  손으로 하는 판(걸음 ①)은 사건 없음. 처음 판들은 INTRO 차례로 하나씩(아직 못 나오는 것은 몫으로 뽑은 하나로) · 그 뒤는 판마다 하나(몫의 합으로 나눠 늘 하나).
 *  쌓이는 주문(시계)은 처음 나온 뒤로 늘. 척척은 늘. ?calm = 쌓이는 주문 · 미끄러지는 접시 · 강아지 없음. 사건은 수를 바꾸지 않는다. */
export function events(cell, evBoards, rnd = Math.random, opt = {}){ const ev = { order: false, slide: false, dog: false, gold: false, bare: false, streak: true, intro: null, none: false };
  if (opt.hand) return { ...ev, streak: false, none: true };
  const can = { order: true, slide: cell === 'J01', dog: true, gold: true, bare: !!opt.passed }, list = INTRO[cell] || INTRO.D06, calmOut = k => opt.calm && (k === 'order' || k === 'slide' || k === 'dog');
  const draw = () => { const P = [['slide', can.slide ? T.SLIDE_P : 0], ['dog', T.DOG_P], ['gold', T.GOLD_P], ['bare', can.bare ? T.BARE_P : 0]].filter(x => !calmOut(x[0]) && x[1] > 0), sum = P.reduce((s, x) => s + x[1], 0); let r = rnd() * sum;
    for (const [k, w] of P) { if (r < w) return k; r -= w; } return P[P.length - 1][0]; };
  if (evBoards < list.length) { const k = list[evBoards]; ev.intro = k; if (k === 'streak' || k === 'order') {} else if (can[k] && !calmOut(k)) ev[k] = true; else ev[draw()] = true; }
  else ev[draw()] = true;
  if (evBoards >= 1 || ev.intro === 'order') ev.order = true;
  if (opt.calm) { ev.order = false; ev.slide = false; ev.dog = false; }
  return ev; }
/** 쌓이는 주문의 시계(초): 나들이 셋째 판은 조금 빨리. */
export const orderS = (cell, board) => (board >= T.BOARDS - 1 ? T.ORDER_LAST : T.ORDER_S)[cell] || 16;

/** 고르는 것: D06 = 낱말 카드 둘(자리 고정) · J01 = 수 셋 — 답 · 한 접시만큼 차이 나는 수(한 번 더 · 덜 뛴 수) · 묶음 크기 + 접시 수(보이는 두 수를 그냥 더함). 겹치면 답과 1 차이 나는 수로. 자리는 섞는다.
 *  한 접시 더 뛴 수가 그 낱칸의 수 범위(30)를 넘으면 덜 뛴 수로(카드에 범위 밖 수가 나오지 않게). */
export function cards(p, rnd = Math.random){ if (p.N != null) return WORDS.slice();
  const a = p.g * p.n, out = [a], ok = v => v >= 1 && v <= 30 && !out.includes(v);
  let one = rnd() < .5 ? a + p.g : a - p.g; if (!ok(one)) one = one > a ? a - p.g : a + p.g; if (ok(one)) out.push(one);
  const sum = p.g + p.n; if (ok(sum)) out.push(sum);
  for (let d = 1; out.length < 3 && d < 30; d++) for (const v of shuffle([a - d, a + d], rnd)) if (out.length < 3 && ok(v)) out.push(v);
  return shuffle(out, rnd); }

// ── 탁자 위(순수): D06 = { N, tub, plates: [2 | 1 …] } · J01 = { g, n, plates: [g …] }. 늘 「통 + 접시 위 = N」 · 접시마다 g.
export function world(p){ return p.N != null ? { N: p.N, tub: p.N, plates: [], lid: false } : { g: p.g, n: p.n, plates: [] }; }
/** 접시 더미를 누름: 접시 한 장(D06 = 통에서 둘 · 하나만 남았으면 하나 / J01 = g 마리째). 놓을 수 없으면 null(통이 비었거나 접시가 열 장). */
export function place(w){ if (w.plates.length >= T.PLATE_MAX) return null; if (w.N != null) { if (w.lid) return null; const k = Math.min(2, w.tub); if (k <= 0) return null; w.tub -= k; w.plates.push(k); return k; } w.plates.push(w.g); return w.g; }
/** 깔린 접시를 누름: 더미로 돌아간다(D06 은 물고기가 통으로). */
export function remove(w, i){ if (i < 0 || i >= w.plates.length) return null; const k = w.plates.splice(i, 1)[0]; if (w.N != null) w.tub += k; return k; }
/** 물고기 셈(통 + 접시 위). */
export const count = w => (w.tub | 0) + w.plates.reduce((s, k) => s + k, 0);
/** 쫙 — 남은 물고기를 둘씩 한꺼번에(D06). → 새로 깔린 접시들 [2 | 1 …]. */
export function fan(w){ const add = []; while (w.tub > 0 && w.plates.length < T.PLATE_MAX) { const k = Math.min(2, w.tub); w.tub -= k; w.plates.push(k); add.push(k); } return add; }
/** 혼자 남은 접시(D06 — 물고기가 하나인 접시의 자리 · 없으면 −1). */
export const lone = w => w.plates.indexOf(1);
/** 판정: 종(J01) = fit | short | over · 카드 = fit | off. */
export function judge(p, action, w){ if (action.type === 'bell') { const k = w.plates.length; return k === p.n ? 'fit' : k < p.n ? 'short' : 'over'; }
  return action.v === answer(p) || String(action.v) === String(answer(p)) ? 'fit' : 'off'; }
/** 깨끗한 문제: D06 = 첫 고름이 맞음(놓아 본 것 · 다 놓고 고른 것은 그대로) · J01 = 첫 종에 접시 수가 딱 맞음 + 물러난 카드 없음. 둘 다 길잡이 손이 뜨기 전 · 쪽지가 날아가기 전. */
export const clean = r => !!r && !r.short && !r.over && !r.retreat && !r.hinted && !r.missed;
/** 쫙 펴질 때(J01): 접시마다 켜질 수 g, 2g, … · D06 은 수 없음(마지막 · 혼자 남은 접시만 표시). */
export function spread(p, w){ if (p.N != null) { const wl = w || world(p), ws = { ...wl, plates: wl.plates.slice() }; fan(ws); return { plates: ws.plates.slice(), mark: ws.plates.indexOf(1) >= 0 ? ws.plates.indexOf(1) : ws.plates.length - 1, nums: [] }; }
  return { plates: Array(p.n).fill(p.g), mark: p.n - 1, nums: range(1, p.n).map(k => k * p.g) }; }
/** 탁자 위 접시 자리(칸 번호 i → 다섯씩 한 줄 · 두 줄까지): { col, row }. */
export const slot = i => ({ col: i % 5, row: Math.floor(i / 5) });

// ── 띠(교과서 말): D06 「7은 ?」 → 「7은 홀수」 · J01 「2씩 4묶음은 ?」 → 「2씩 4묶음은 8」. 조각 = { n } 수 · { w, glue } 말(glue = 앞 수에 붙음) · { hole } 「?」 칸.
export function band(p, run){ if (p.N != null) return [{ n: p.N }, { w: eun(p.N), glue: true }, { hole: parity(p.N) }];
  return [{ n: p.g }, { w: '씩', glue: true }, { n: p.n }, { w: UNIT.plateBand + '은', glue: true }, { hole: p.g * p.n, run: run != null ? run : null }]; }
/** 띠의 글(하네스 · 소리): 「?」 칸은 '?' · closed 면 답 · run(걸음 ① 의 뛰어 세는 수)이 있으면 그 수. */
export function bandText(parts, closed = false){ let s = ''; for (const x of parts) { const t = x.n != null ? String(x.n) : x.w != null ? x.w : closed ? String(x.hole) : x.run != null ? String(x.run) : '?'; s += (s && !x.glue ? ' ' : '') + t; } return s; }
/** 쪽지의 말(그림 옆 · 소리): D06 = 수 팻말 N · J01 = 「2마리씩 4접시」. */
export const noteText = p => p.N != null ? String(p.N) : `${p.g}${UNIT.fish}씩 ${p.n}${UNIT.plate}`;
