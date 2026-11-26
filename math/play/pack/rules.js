/* 포장 틀 「열 개 한 판」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/T10_포장_틀.md · 정본 27 문서 4 · 5절(5-9 · 5-10 · 5-11).
 * 세계가 먼저 흐른다: 굴림대로 자루가 줄줄이 와서 판에 놓인다(놓이는 때 = feed 의 시계 · 누적 시간). 손은 하나 — 열 개가 찼을 때 판을 누르면 「착」 하고 테가 둘러져 한 판(10개씩 묶음)이 된다.
 *   C01 10 알기 : 판에 미리 놓인 k(나들이 첫 문제만 0 · 나머지 5~9) → 하나씩 더 와서 10 · 열 뒤에도 두세 개 더 온다(「열에서 묶는다」가 내용).
 *   C04 십몇    : 자루 N(11~19 — 한 나들이에 한 번씩) → 한 판과 낱개 r(1~9) → 「10개씩 묶음 1개와 낱개 r개는 ?」 수 셋에서 고른다.
 * 판정 judge = packed(딱 열에서 묶음) | early(아홉 아래에서 누름 — 덜컹) | over(넘친 뒤에 묶음 — 굴러 나옴) | loose(낱개 판을 누름).
 * 늘 「판 + 넘침 자리 + 굴림대 + 구르는 중 + 묶은 판 × 10 = 전체」 — 사건은 수를 바꾸지 않는다(count()).
 * 뒤 묶음(이름만): T10b 묶음 세기(C06 몇십 · D01 몇십) / T10c D03 100 알기 / E01~E06 · H01 · H03 · I01~I06(여기서 뜯기) · K01 · K03 — CELLS 에 줄만 더한다(판 여러 개는 packs 로 받을 자리만 열어 둠 · 뜯기는 없다). */
import { sino, native } from '../common/say.js?v=5';

// ── 낱칸 표: kind = ten(10 알기) | teen(십몇) · packs = 한 문제에서 묶는 판 수(이번 묶음은 1 — 뒤 묶음의 몇십이 여러 판)
export const CELLS = {
  C01: { kind: 'ten', first: 0, ks: [5, 6, 7, 8, 9], packs: 1 },          // 10 알기 — 9 다음 수가 10
  C04: { kind: 'teen', ns: [11, 12, 13, 14, 15, 16, 17, 18, 19], packs: 1 }, // 십몇 — 10개씩 묶음 하나와 낱개
};
export const IDS = Object.keys(CELLS);

// ── 내가 정한 수치(T10 설계 기본안 + 코드가 정한 것 — 준호가 반에서 보고 바꾼다)
export const T = {
  GAP_S: { C01: 1.2, C04: .8 }, GAP_LAST: .85,      // 자루 사이(초) · 나들이 셋째 판은 곱
  TEN_HOLD: 2.2, OVER: 2, EXTRA: [2, 3], PULL: true, // 열째 뒤 한숨(초) · 넘침 자리 · C01 에서 열 뒤에 더 오는 수 · 자루를 눌러 당기기
  SAIL_S: 14, SAIL_LAST: 11,                         // 올라가는 돛(C04 · 카드를 고르는 동안에만 · 셋째 판)
  ROLL_P: .3, ROLL_BELOW: 6, PAIR_P: .3, GOLD_P: .25, COVER_P: .3,   // 판마다 사건 하나를 뽑는 몫(덮인 판은 통과 뒤에만 · 몫의 합으로 나눠 판마다 꼭 하나)
  STREAK: 3, HINT_AFTER: 6,                          // 착착 탑 · 가만히 이만큼(초)이면 길잡이 손(카드를 고를 때)
  CALM_GAP: 1.8, CALM_HOLD: 4,                       // ?calm = 자루 사이를 넉넉히 · 한숨을 길게
  PER_BOARD: 3, BOARDS: 3, RETRY_GAP: 2,             // 판 = 문제 셋 · 나들이 = 판 셋 · 깨끗하지 못한 문제는 문제 둘을 사이에 두고 다시
  GOLD_COINS: 3, COIN_PER: 1,                        // 금빛 자루의 덤 동전 · 문제 하나에 동전(코드가 정함)
  FIRST_S: .9, PAIR_GAP: .45, HOLD_PAD: .25,         // 첫 자루가 놓이기까지 · 바짝 붙은 둘의 사이 · 한숨 뒤 다음 자루까지 더 비우는 것(코드가 정함 — 「TEN_HOLD 넘게」)
  ROLL_S: 2.6, ROLL_BACK: 1.8, ROLL_LEAD: 3.1,       // 구르는 자루: 잡을 수 있는 동안 · 굴러 돌아와 줄 맨 뒤에 서기까지 · 놓이기 이만큼 앞에 구르기 시작(코드가 정함)
  TELL_SLOW: .35,                                    // 한 줄 안내가 떠 있는 동안 굴림대 빠르기(곱 · 안내를 읽는 동안 덜 흐른다 — 코드가 정함)
};
/** 사건 차례(처음 판들은 이 차례로 하나씩 · 걸음 ① 인 판은 사건 없음 · 밀려오는 줄은 바탕이라 늘). C01 에는 카드가 없어 돛이 없고, 구르는 자루도 없다(판에 여섯 아래일 때만 구르는데 C01 은 걸음 ② 판에서 늘 다섯 넘게 미리 놓여 있다 — 사건 없는 판이 되지 않게 차례 · 몫에서 뺌). */
export const INTRO = { C01: ['pair', 'gold', 'cover', 'streak'], C04: ['sail', 'roll', 'pair', 'gold', 'cover', 'streak'] };

const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const make = (cell, v) => CELLS[cell].kind === 'ten' ? { cell, k: v } : { cell, N: v };
export const val = p => p.k != null ? p.k : p.N;
export const key = p => (p.k != null ? 'k' : 'N') + val(p);
export const same = (p, q) => !!p && !!q && key(p) === key(q);
/** 그 낱칸의 문제 풀(풀 밖의 수는 나오지 않는다). C01 = { k } 0 · 5~9 / C04 = { N } 11~19. */
export function pool(id){ const c = CELLS[id]; if (!c) return []; return c.kind === 'ten' ? [c.first, ...c.ks].map(k => make(id, k)) : c.ns.map(n => make(id, n)); }
/** 한 문제의 자루 수(굴림대로 오는 것) · 판에 미리 놓인 수 · 묶은 뒤의 낱개. */
export const pre = p => p.k != null ? p.k : 0;
export const loose = p => p.N != null ? p.N - 10 : 0;

function evenly(list, n, rnd){ const out = []; while (out.length < n) out.push(...shuffle(list.slice(), rnd)); return out.slice(0, n); }
/** 같은 값이 연달아 오지 않게 늘어놓는다(prev = 바로 앞 문제의 값). order = 'shuffle' | 'up' | 'down'. */
function arrange(vs, prev, rnd, order){ const cnt = new Map(); for (const v of vs) cnt.set(v, (cnt.get(v) | 0) + 1); const out = [];
  const go = last => { if (out.length === vs.length) return true; let cand = [...cnt.keys()].filter(v => cnt.get(v) > 0 && v !== last); cand = order === 'up' ? cand.sort((a, b) => a - b) : order === 'down' ? cand.sort((a, b) => b - a) : shuffle(cand, rnd);
    for (const v of cand) { cnt.set(v, cnt.get(v) - 1); out.push(v); if (go(v)) return true; out.pop(); cnt.set(v, cnt.get(v) + 1); } return false; };
  return go(prev) ? out : null; }
/** 나들이 하나(문제 아홉). history = 앞 나들이(첫 문제가 앞 끝과 같지 않게). opt.small = 막혔을 때 쉬운 쪽부터(C01 = 셀 것이 적은 큰 k 부터 · C04 = 작은 N 부터)
 *  opt.carry = 앞 나들이 끝에서 다시 낼 자리가 없던 문제들(이번 나들이 앞쪽에 — C01 은 첫 문제 0 뒤 · C04 는 같은 N 을 앞으로 당긴다 · 아홉 수가 한 번씩은 그대로). */
export function deal(id, history = [], rnd = Math.random, opt = {}){ const c = CELLS[id], n = T.PER_BOARD * T.BOARDS; if (!c) return [];
  const last = history.length ? val(history[history.length - 1]) : null, carry = (opt.carry || []).filter(p => p && p.cell === id).map(val).filter(v => c.kind !== 'ten' || v !== c.first);   /* C01 의 k = 0 은 나들이 첫 문제만 — 넘겨진 0 은 버린다 */
  if (c.kind === 'ten') { let rest = evenly(c.ks, n - 1, rnd); for (const v of carry) { const i = rest.indexOf(v); if (i >= 0) rest.splice(i, 1); else rest.pop(); }
    const ord = opt.small ? 'down' : 'shuffle', head = []; let prev = c.first; for (const v of carry) { if (v !== prev && v !== c.first) { head.push(v); prev = v; } else rest.push(v); }
    rest = rest.slice(0, n - 1 - head.length); const tail = arrange(rest, prev, rnd, ord) || arrange(rest, null, rnd, 'shuffle') || rest;
    return [c.first, ...head, ...tail].map(v => make(id, v)); }
  const order = opt.small ? 'up' : 'shuffle', head = carry.filter((v, i, a) => a.indexOf(v) === i && v !== last).slice(0, 2), rest = c.ns.filter(v => !head.includes(v));
  let seq = null; if (head.length) { const tail = arrange(rest, head[head.length - 1], rnd, order); if (tail && head.every((v, i) => i === 0 || v !== head[i - 1])) seq = [...head, ...tail]; }
  if (!seq) seq = arrange(c.ns.slice(), last, rnd, order) || arrange(c.ns.slice(), null, rnd, 'shuffle') || c.ns.slice();
  return seq.slice(0, n).map(v => make(id, v)); }
/** 깨끗하지 못했던 문제를 「문제 둘을 사이에 두고」 다시(같은 k · 같은 N · 길이 그대로 — 끝의 문제 하나가 빠진다). 앞뒤가 같으면 한 칸씩 뒤로.
 *  자리가 없으면(일곱째~아홉째) { q 그대로, carry: 그 문제 } — 다음 나들이 앞쪽으로 넘긴다(deal opt.carry). */
export function requeue(q, i){ const p = q[i];
  for (let at = i + T.RETRY_GAP + 1; at < q.length; at++) { const a = q.slice(); a.splice(at, 0, { ...make(p.cell, val(p)), retry: true }); a.length = q.length; if (!same(a[at - 1], a[at]) && !same(a[at], a[at + 1])) return { q: a, carry: null }; }
  return { q: q.slice(), carry: { ...make(p.cell, val(p)), retry: true } }; }

/** 그 판의 사건. evBoards = 이 낱칸에서 앞서 사건이 붙은 판 수 · opt = { passed, calm, hand }.
 *  손으로 하는 판(걸음 ①)은 사건 없음. 처음 판들은 INTRO 차례로 하나씩(그 낱칸에 없는 것 · 아직 못 나오는 것은 몫으로 뽑은 하나로) · 그 뒤는 판마다 하나(몫의 합으로 나눠 늘 하나).
 *  올라가는 돛(C04)은 처음 나온 뒤로 늘. 착착은 늘(손으로 하는 판 빼고). ?calm = 돛 · 구르는 자루 · 바짝 붙은 둘 없음. 사건은 수를 바꾸지 않는다. */
export function events(cell, evBoards, rnd = Math.random, opt = {}){ const ev = { sail: false, roll: false, pair: false, gold: false, cover: false, streak: true, intro: null, none: false };
  if (opt.hand) return { ...ev, streak: false, none: true };
  const can = { sail: cell === 'C04', roll: cell !== 'C01', pair: true, gold: true, cover: !!opt.passed, streak: true }, list = INTRO[cell] || INTRO.C01;
  const draw = () => { const P = [['roll', can.roll ? T.ROLL_P : 0], ['pair', T.PAIR_P], ['gold', T.GOLD_P], ['cover', can.cover ? T.COVER_P : 0]].filter(x => !(opt.calm && (x[0] === 'roll' || x[0] === 'pair'))), sum = P.reduce((s, x) => s + x[1], 0); let r = rnd() * sum;
    for (const [k, w] of P) { if (w > 0 && r < w) return k; r -= w; } return P.filter(x => x[1] > 0).slice(-1)[0][0]; };
  if (evBoards < list.length) { const k = list[evBoards]; ev.intro = k; if (k === 'streak') {} else if (can[k] && !(opt.calm && (k === 'roll' || k === 'pair' || k === 'sail'))) ev[k] = true; else if (k !== 'sail') ev[draw()] = true; }
  else ev[draw()] = true;
  if (can.sail && (evBoards >= 1 || ev.intro === 'sail')) ev.sail = true;
  if (opt.calm) { ev.sail = false; ev.roll = false; ev.pair = false; }
  return ev; }
/** 돛 시간(C04): 나들이 셋째 판은 조금 짧다. */
export const sailS = board => board >= T.BOARDS - 1 ? T.SAIL_LAST : T.SAIL_S;

/** 자루마다 놓이는 때(feed 의 시계 — 누적 초 · 그림 빠르기와 상관없다). → { pre, bags: [{ t, dt, gold, pair }], ten(판이 열이 되는 자루의 번호), gap, holdS, roll: { at } | null }
 *  C01 = 10 − k 개 + 덤 EXTRA · C04 = N 개. 자루 사이(dt)는 고른 사이만(바짝 붙은 둘만 PAIR_GAP) — 열째 뒤 한숨은 흐름(place)이 열째가 실제로 놓일 때 넣는다(구르는 자루 · 당김이 있어도 한숨이 열에서 온다).
 *  opt = { board, calm, gold, hand } — 걸음 ① 판(hand)은 셋째 판이어도 빨라지지 않는다. */
export function feed(p, ev = {}, rnd = Math.random, opt = {}){ const k = pre(p), extra = T.EXTRA[0] + Math.floor(rnd() * (T.EXTRA[1] - T.EXTRA[0] + 1)), n = p.k != null ? 10 - k + extra : p.N;
  const gap = (opt.calm ? T.CALM_GAP : T.GAP_S[p.cell]) * (!opt.calm && !opt.hand && opt.board >= T.BOARDS - 1 ? T.GAP_LAST : 1), holdS = opt.calm ? T.CALM_HOLD : T.TEN_HOLD, ten = 10 - k - 1;
  const bags = []; let t = T.FIRST_S;
  let pairAt = -1; if (ev.pair) { const ok = range(1, n - 1).filter(j => j !== ten + 1 && j !== ten && j - 1 !== ten); if (ok.length) pairAt = ok[Math.floor(rnd() * ok.length)]; }   /* 바짝 붙은 둘 = (pairAt−1, pairAt) · 열째 · 열한째 언저리는 피한다 */
  for (let i = 0; i < n; i++) { const dt = i === 0 ? T.FIRST_S : i === pairAt ? T.PAIR_GAP : gap; if (i > 0) t += dt; bags.push({ t: Math.round(t * 1000) / 1000, dt, gold: false, pair: i === pairAt || i === pairAt - 1 }); }
  if (opt.gold) bags[Math.floor(rnd() * (ten + 1))].gold = true;   /* 금빛 자루는 묶일 판에(열째까지) */
  let roll = null; if (ev.roll) { const ok = range(1, Math.min(n - 1, T.ROLL_BELOW - k - 1)).filter(j => bags[j].t - T.ROLL_LEAD >= .3); if (ok.length) { const j = ok[Math.floor(rnd() * ok.length)]; roll = { at: Math.round((bags[j].t - T.ROLL_LEAD) * 1000) / 1000 }; } }   /* 판에 여섯 개 아래로 놓였을 때만 */
  return { pre: k, bags, ten, gap, holdS, roll, n, total: k + n }; }

// ── 흐름(순수 상태 기계 — 화면은 이것을 그대로 그리고, 하네스는 3000회 돌린다)
/** 한 문제의 세계. 줄(queue)의 자루는 「앞 자루 뒤 dt 초」로 이어지고 맨 앞 자루만 놓일 때(t)를 정한다 — 앞 자루가 빠지면(놓임 · 당김 · 굴러 떨어짐) 뒤가 그만큼 당겨진다.
 *  → W = { clock, board(지금 판의 수), over(넘침 자리), queue, rolling(굴러 떨어져 돌아오는 중), packed(묶은 판), boardNo(0 첫 판 · 1 낱개 판), risk(구르려는 자루), blocked, ... } */
export function world(p, fd){ const W = { cell: p.cell, total: fd.total, clock: 0, board: fd.pre, over: 0, packed: 0, boardNo: 0, gap: fd.gap, holdS: fd.holdS,
  queue: fd.bags.map((b, i) => ({ id: i, t: b.t, dt: b.dt, hv: 0, gold: b.gold, pair: b.pair })), rolling: [], risk: null, rollAt: fd.roll ? fd.roll.at : null, blocked: false, tenAt: fd.pre >= 10 ? 0 : null, placed: [], lastAt: 0 }; reflow(W); return W; }
/** 전체 셈(늘 total 이어야 한다). */
export const count = W => W.board + W.over + W.queue.length + W.rolling.length + (W.risk && !W.queue.some(b => b.id === W.risk.id) ? 1 : 0) + W.packed * 10;
/** 줄을 다시 잇는다: 맨 앞 자루의 t 는 그대로 · 뒤는 앞 자루 + dt. */
function reflow(W){ for (let i = 1; i < W.queue.length; i++) W.queue[i].t = W.queue[i - 1].t + W.queue[i].dt; }
/** 맨 앞 자루를 「지금 + 제 사이」로(앞 자루가 빠졌을 때 — 줄이 비지 않게) · 한숨 중이면 한숨 끝까지. */
function front(W, now){ const f = W.queue[0]; if (!f) return; const hold = W.board >= 10 && W.over === 0 && W.tenAt != null && W.boardNo === 0 ? W.tenAt + W.holdS + T.HOLD_PAD + W.gap * .5 : 0; f.t = Math.max(now + (f.dt || W.gap), hold); f.hv = hold && f.t === hold ? W.holdS : 0; reflow(W); }
/** 자루 하나를 판에 놓는다(시계 at) → 놓인 곳. */
function place(W, b, at, pulled){ let to, slot; if (W.board < 10) { slot = W.board; W.board++; to = 'board'; } else { slot = W.over; W.over++; to = 'over'; }
  W.placed.push({ id: b.id, at, to, slot, pulled: !!pulled, back: !!b.back, after: !!b.after, board: W.board, over: W.over, boardNo: W.boardNo }); W.lastAt = at;
  if (to === 'board' && W.board === 10) { W.tenAt = at; const nx = W.queue[0]; if (nx) { nx.t = Math.max(nx.t, at + W.holdS + T.HOLD_PAD + W.gap * .5); nx.hv = W.holdS; reflow(W); } }   /* 열째가 놓이면 다음 자루는 굴림대 끝에서 한숨(줄 전체가 그만큼 뒤로) */
  else if (pulled) front(W, at);   /* 당긴 뒤에는 다음 자루가 지금 + 제 사이부터(빈 굴림대가 되지 않게) */
  return { type: 'place', id: b.id, to, slot, at, gold: b.gold, pulled: !!pulled, board: W.board, over: W.over }; }
/** 시계를 dt 만큼(넘침 자리가 다 차고 줄에 자루가 남았으면 굴림대가 멈춘다 — 시계도 멈춘다). → 일어난 일 [{ type: place | rollStart | rollFall | rollBack | block }] */
export function step(W, dt){ const out = [];
  if (W.over >= T.OVER && W.queue.length) { if (!W.blocked) out.push({ type: 'block' }); W.blocked = true; return out; } W.blocked = false;
  const end = W.clock + Math.max(0, dt);
  /* 일은 때의 차례대로 하나씩(시계가 크게 건너뛰어도 — 느린 기기 — 앞의 일이 뒤의 일보다 먼저): 놓임 · 구르기 시작 · 굴러 떨어짐 · 굴러 돌아옴 */
  for (let guard = 0; guard < 500; guard++) { const tq = W.queue.length ? W.queue[0].t : Infinity, tr = W.rollAt != null ? W.rollAt : Infinity, tf = W.risk ? W.risk.until : Infinity, tb = W.rolling.length ? Math.min(...W.rolling.map(r => r.back)) : Infinity, t = Math.min(tq, tr, tf, tb);
    if (t > end) break; const now = Math.max(W.clock, t);
    if (t === tr) { const b = W.board < T.ROLL_BELOW ? W.queue.find((x, i) => i >= 1 && x.t - now >= T.ROLL_S + .3) : null; W.rollAt = null; if (b) { W.risk = { id: b.id, until: now + T.ROLL_S }; out.push({ type: 'rollStart', id: b.id }); } continue; }   /* 판에 여섯 개 아래일 때 · 놓이려면 아직 먼 자루가 옆으로 기운다 */
    if (t === tf) { const i = W.queue.findIndex(x => x.id === W.risk.id); if (i >= 0) { const [b] = W.queue.splice(i, 1); if (i === 0 && W.queue.length) { W.queue[0].t = Math.max(W.lastAt + W.queue[0].dt, now + .05); reflow(W); } else reflow(W); W.rolling.push({ id: b.id, back: now + T.ROLL_BACK, gold: b.gold }); out.push({ type: 'rollFall', id: b.id }); } W.risk = null; continue; }   /* 떨어진 자루 뒤는 그만큼 당겨진다(한숨이 열이 아닌 곳에서 오지 않게) */
    if (t === tb) { const k = W.rolling.findIndex(r => r.back === tb), r = W.rolling.splice(k, 1)[0]; W.queue.push({ id: r.id, t: 0, dt: W.gap, hv: 0, gold: r.gold, pair: false, back: true }); if (W.queue.length === 1) front(W, now); else reflow(W); out.push({ type: 'rollBack', id: r.id }); continue; }   /* 굴러 돌아와 줄 맨 뒤에 선다(열째 뒤면 한숨도 지킨다) */
    const b = W.queue.shift(); if (W.risk && W.risk.id === b.id) W.risk = null; out.push(place(W, b, now, false)); W.clock = now;
    if (W.over >= T.OVER && W.queue.length) { W.blocked = true; out.push({ type: 'block' }); return out; } }
  W.clock = end; return out; }
/** 구르는 자루를 눌러 잡음 → 제자리(줄 그대로). */
export function catchRoll(W){ if (!W.risk) return false; W.risk = null; return true; }
/** 굴림대의 자루를 눌러 당김(성미 급한 아이의 빨리 감기) — 맨 앞 자루가 기다리지 않고 지금 놓이고, 다음 자루는 지금 + 제 사이부터. 넘침 자리가 다 찼으면 못 당김. → 놓인 곳 | null */
export function pull(W){ if (!T.PULL || !W.queue.length || W.over >= T.OVER) return null; const b = W.queue.shift(); if (W.risk && W.risk.id === b.id) W.risk = null; return place(W, b, W.clock, true); }
/** 판을 누른 것의 판정(순수): 첫 판(boardNo 0) — 열이면 packed · 열에 넘친 것이 있으면 over · 열 아래면 early / 낱개 판(boardNo ≥ 1) — loose. */
export function judge(s){ if (s.boardNo >= (CELLS[s.cell] || { packs: 1 }).packs) return 'loose'; if (s.board < 10) return 'early'; return s.over > 0 ? 'over' : 'packed'; }
/** 판을 누른다 → { how, back: [넘침 자리에서 굴러 나와 줄 맨 앞으로 돌아간 자루 수] }. 묶으면 판은 비고 묶은 판이 하나 는다(넘친 것은 굴림대 쪽으로 · 다음 판에 놓인다).
 *  남은 한숨은 버린다 — 맨 앞 자루는 지금 + gap(바로 묶은 아이가 새 판 앞에서 기다리지 않게). */
export function press(W, waitS = 0){ const how = judge(W); if (how !== 'packed' && how !== 'over') return { how, back: 0 };
  const back = W.over; W.packed++; W.board = 0; W.over = 0; W.boardNo++; W.blocked = false; W.tenAt = null;
  for (let i = back - 1; i >= 0; i--) W.queue.unshift({ id: 1000 + W.packed * 10 + i, t: 0, dt: W.gap, hv: 0, gold: false, pair: false, after: true });   /* 넘쳤던 자루(새 번호 — 그림은 굴러 나온 것을 그대로 쓴다) */
  if (W.queue.length) { W.queue.forEach(q => { q.hv = 0; }); W.queue[0].after = true; front(W, W.clock + waitS); }
  return { how, back }; }
/** 길잡이 손이 판을 짚어야 하는가(순수): 열이 찼고 ① 넘침 자리가 다 찼거나 ② 더 올 자루가 없는데 마지막으로 놓인 뒤 HINT_AFTER 가 지났다(안 누르면 그대로 서 있지 않게 — C04 열하나 등). */
export const needHand = W => W.board >= 10 && W.boardNo === 0 && (W.over >= T.OVER || (!W.queue.length && !W.rolling.length && !W.risk && W.clock - W.lastAt > T.HINT_AFTER));
/** 흐름이 끝났는가(굴림대 · 구르는 중 · 넘침 자리가 다 비었다). */
export const drained = W => !W.queue.length && !W.rolling.length && !W.risk && W.over === 0;

// ── 고르기(C04) · 띠 · 읽는 말
/** C04 수 카드 셋: 답 N · 답과 1 차이(11~19 안 — 20 · 몇십은 내지 않는다) · 낱개 수만(N − 10 — 묶음을 빼먹는 흔한 잘못). 자리는 섞는다. step 은 그림만 바꾼다(① 묶음 그림 · ② 숫자 — 수는 같음). */
export function cards(p, step = 2, rnd = Math.random){ if (typeof step === 'function') { rnd = step; } const N = p.N, r = N - 10, d = shuffle([N - 1, N + 1].filter(x => x >= 11 && x <= 19), rnd)[0]; return shuffle([N, d, r], rnd); }
/** 띠 조각: { w } 말 · { n } 수 · { hole: 답 } 「?」 칸(닫히면 답) · { box: 수|null } 차오르는 칸(C04 의 묶음 · 낱개 — 아직이면 빈 칸). 식 기호(+ =)는 없다. */
export function band(p, st = {}){ if (p.k != null) return [{ n: 9 }, { w: '보다' }, { n: 1 }, { w: '만큼 더 큰 수는' }, { hole: 10 }];
  return [{ n: 10 }, { w: '개씩 묶음' }, { box: st.packs != null ? st.packs : null }, { w: '개와 낱개' }, { box: st.loose != null ? st.loose : null }, { w: '개는' }, { hole: p.N }]; }
/** 띠 글(하네스 · 소리 없는 기기): 「?」 칸은 '?' · closed 면 답 · 빈 칸은 '□'. */
export const bandText = (parts, closed = false) => parts.map(x => x.w != null ? x.w : x.n != null ? String(x.n) : x.hole != null ? (closed ? String(x.hole) : '?') : x.box != null ? String(x.box) : '□').join(' ').replace(/ (보다|만큼|개)/g, '$1').replace(/\s+/g, ' ').trim();
/** 읽는 말(닫힐 때 띠 아래 · 소리로도): 10 = 「십 · 열」 · 14 = 「십사 · 열넷」. */
export const read = n => `${sino(n)} · ${native(n)}`;
/** 깨끗한 문제 = 딱 열에서 첫 누름으로 묶음(모자란 · 넘친 · 낱개 판 누름 없음) · 물러난 카드 없음 · 길잡이 손 전 · 배가 떠나기 전. 자루를 당긴 것 · 구르는 자루를 놓친 것 · 헛누름은 깨끗함 그대로. */
export const clean = r => !!r && !(r.early || r.over || r.loose || r.retreat || r.hinted || r.missed);
