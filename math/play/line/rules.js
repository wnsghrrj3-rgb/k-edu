/* 줄 세우기 틀 「배 기차 떠나보내기」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/T06_줄세우기_틀.md · 정본 27 문서 4 · 5절(5-9 · 5-10 · 5-11).
 * 손: 떠 있는 배를 줄의 빈 자리(부표)에 끼우고, 다 됐다고 생각하면 종을 친다 → 앞에서부터 한 척씩 세어 나간다. 묻는 것은 「차례」 하나뿐(덧셈 · 뺄셈 · 비교 · 뛰어 세기 · 몇째 없음).
 *   문제 = { run: [수들 · 앞에서부터], holes: [빈 자리 번호들], loose: [떠 있는 수들 · 들어오는 차례] }
 * 걸음 ① 자리 보고 끼우기(부표에 흐린 숫자 · 맞는 자리에만 걸림 · 통과에 안 셈) → 걸음 ② 차례 생각해 끼우기(어느 자리에나 걸림 · 종을 쳐야 판정 · 통과는 여기서만). */

// ── 낱칸 표(A10 몇째 · A11 1 큰 수 · A12 1 작은 수는 다음 묶음 — cargo · given: 'one' 칸을 받게만 둔다)
export const CELLS = {
  A08: { dir: +1, len: [5, 7], holes: { hand: [1, 2], solo: [2, 3] }, lim: [1, 9], headHole: 3, tailHole: 2, given: 'some', cargo: false },   // 수의 순서 — 올라가는 줄 · 빈 자리 둘~셋(걸음 ① 은 하나~둘)
  A09: { dir: -1, len: [4, 6], start: [6, 9], given: 'head', lim: [1, 9], fullLast: true, cargo: false },                                         // 거꾸로 세기 — 맨 앞만 주어짐 · 마지막은 9 → 1 온 줄
};
export const IDS = Object.keys(CELLS);

// ── 내가 정한 수치(T06 설계 기본안 — 준호가 반에서 보고 바꾼다)
export const T = {
  LEAVE_S: { A08: 22, A09: 26 }, LEAVE_LAST: { A08: 18, A09: 22 }, LEAVE_FULL: 34,   // 밧줄이 다 팽팽해지기까지(생각하는 동안에만 가는 초) · 나들이 셋째 판 · 마지막 긴 줄
  SHUFFLE_P: .3, SHUFFLE_S: 6, DRIFT_P: .3, DRIFT_S: 5, SURPRISE_P: .25, FOG_P: .3,   // 섞는 물결(확률 · 물결이 오는 사이 초) · 떠내려가는 배(확률 · 밀려 나가기까지 초) · 깜짝 짐 · 안개(통과 뒤)
  STREAK: 3, HINT_AFTER: 7, SNAP_R: 70, LOOSE_MIN: 3, CALL_GAP: .4,                 // 뱃노래 · 길잡이 손(초) · 끼우는 반경(px) · 떠 있는 배 최소 · 한 척 세는 사이(초)
  PER_BOARD: 3, BOARDS: 3, RETRY_GAP: 2,
  LOOSE_LAST: 5, SURPRISE_COINS: 3, COIN_PER: 1, SHUFFLE_MAX: 3,                    // 마지막 문제의 떠 있는 배 · 깜짝 짐 덤 · 문제 하나에 동전 · 한 문제에 섞는 물결 최대(코드가 정함)
};
export const INTRO = ['leave', 'shuffle', 'drift', 'surprise', 'fog', 'song'];   // 걸음 ② 의 처음 판들은 이 차례로 하나씩
/** 수를 읽는 음(1 이 낮은 음 · 9 가 높은 음 — 도레미 가락): 올라가는 줄은 오르는 가락 · 거꾸로 줄은 내리는 가락이 된다. */
export const NOTE = [0, 262, 294, 330, 349, 392, 440, 494, 523, 587];

const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const ri = (lo, hi, rnd) => lo + Math.floor(rnd() * (hi - lo + 1));

/** 줄의 수들(앞에서부터). */
export const runOf = (id, start, len) => Array.from({ length: len }, (_, k) => start + CELLS[id].dir * k);
/** 같은 줄 = 시작 · 길이가 같음. */
export const key = p => `${p.run[0]}:${p.run.length}`;
export const same = (p, q) => !!p && !!q && key(p) === key(q);
/** 그 낱칸의 줄 풀(시작 · 길이). A09 의 온 줄(9 → 1)은 마지막 문제로만 따로. */
export function pool(id){ const c = CELLS[id]; if (!c) return []; const [lo, hi] = c.lim, out = [];
  for (let len = c.len[0]; len <= c.len[1]; len++) for (let s = lo; s <= hi; s++) { const e = s + c.dir * (len - 1); if (e < lo || e > hi) continue; if (c.start && (s < c.start[0] || s > c.start[1])) continue; out.push({ start: s, len }); }
  return out; }
/** 빈 자리 꼴: head = 맨 앞이 빔(바로 뒤는 주어짐) · tail = 맨 뒤가 빔(바로 앞은 주어짐) · mid = 가운데만. */
export const kindOf = p => p.holes.includes(0) ? 'head' : p.holes.includes(p.run.length - 1) ? 'tail' : 'mid';

/** 빈 자리 고르기(A08): n 개 · kind 에 맞게. 주어진 배가 하나 이상 남는다. */
function holesA08(len, n, kind, rnd){ for (let g = 0; g < 200; g++) { const hs = new Set();
    if (kind === 'head') hs.add(0); if (kind === 'tail') hs.add(len - 1);
    const inner = shuffle(range(1, len - 2), rnd); for (const i of inner) { if (hs.size >= n) break; if (kind === 'head' && i === 1) continue; if (kind === 'tail' && i === len - 2) continue; hs.add(i); }
    const h = [...hs].sort((a, b) => a - b); if (h.length === n && h.length < len) return h; }
  return kind === 'head' ? [0, 2].slice(0, n) : kind === 'tail' ? [len - 1, len - 3].slice(0, n).sort((a, b) => a - b) : [1, 3].slice(0, n); }
/** 온 줄(9 → 1)의 주어진 배: 맨 앞 9 + 서로 붙지 않은 셋. */
function fullGiven(rnd){ for (let g = 0; g < 200; g++) { const pick = shuffle(range(1, 8), rnd).slice(0, 3).sort((a, b) => a - b); if (pick.every((x, k) => k === 0 || x - pick[k - 1] > 1)) return [0, ...pick]; } return [0, 2, 4, 6]; }

/** 떠 있는 배(들어오는 차례): 빈 자리의 수 + 남는 배. 남는 배는 줄의 바로 앞 · 바로 뒤 수에서 먼저(범위를 벗어나면 그다음 가까운 수 · 줄에 있는 수는 안 됨).
 *  모두 LOOSE_MIN 이상 · 넷이 넘으면 남는 배는 하나 · 마지막 문제는 LOOSE_LAST · 온 줄은 남는 배 없음. 들어오는 차례는 답 차례 그대로가 아니게 섞는다. */
export function loose(p, rnd = Math.random){ const c = CELLS[p.cell], [lo, hi] = c ? c.lim : [1, 9], hn = p.holes.map(i => p.run[i]), avail = range(lo, hi).filter(x => !p.run.includes(x));
  let ex = !avail.length ? 0 : hn.length + 1 >= T.LOOSE_MIN ? 1 : T.LOOSE_MIN - hn.length; if (p.last && avail.length) ex = Math.max(ex, T.LOOSE_LAST - hn.length);
  const a = p.run[0], b = p.run[p.run.length - 1], dist = x => Math.min(Math.abs(x - a), Math.abs(x - b)), cand = shuffle(avail.slice(), rnd).sort((x, y) => dist(x) - dist(y)), extras = cand.slice(0, Math.min(ex, cand.length));
  let order = []; for (let g = 0; g < 60; g++) { order = shuffle([...hn, ...extras], rnd); if (!answerOrder(order, hn)) break; }
  if (answerOrder(order, hn)) order.push(order.shift());
  return order; }
/** 들어오는 차례가 답 차례 그대로인가: 빈 자리 수들이 줄 차례대로 들어옴(둘 이상) · 하나면 그 배가 맨 먼저 들어옴. */
export const answerOrder = (order, hn) => { const sub = order.filter(x => hn.includes(x)); return hn.length >= 2 ? sub.join() === hn.join() : order[0] === hn[0]; };

/** 물 위 자리: seats[k] = loose[k] 배가 놓일 자리 번호(자리 0 = 가로는 왼쪽 끝 · 세로는 왼쪽 위). 들어오는 차례 그대로가 아니고, 자리 차례로 읽어도 답 차례가 되지 않게. */
export function seats(p, rnd = Math.random){ const n = p.loose.length, hn = p.holes.map(i => p.run[i]); let a = [];
  for (let g = 0; g < 80; g++) { a = shuffle(Array.from({ length: n }, (_, i) => i), rnd); if (n > 1 && a.every((x, i) => x === i)) continue; if (!answerOrder(bySeat(p.loose, a), hn)) return a; }
  return a; }
/** 자리 차례로 읽은 수(자리 0 부터). */
export const bySeat = (lo, seat) => { const out = []; seat.forEach((s, k) => { out[s] = lo[k]; }); return out; };
/** 문제 하나를 짓는다. */
export function make(id, start, len, holes, rnd = Math.random, extra = {}){ const p = { cell: id, run: runOf(id, start, len), holes: holes.slice().sort((a, b) => a - b), ...extra }; p.loose = loose(p, rnd); return p; }

/** 나들이 하나(문제 아홉). history = 앞 나들이(같은 줄 연달아를 이어서 본다). opt.small = 막혔을 때 짧은 줄 · 빈 자리 적은 것부터.
 *  A08: 같은 줄 연달아 없음 · 시작 수를 고르게(끝이 8 · 9 인 줄이 셋 이상) · 맨 앞이 빈 문제 셋 · 맨 뒤가 빈 문제 둘 이상 · 마지막은 일곱 칸.
 *  A09: 시작 수 6~9 가 저마다 둘 · 맨 앞만 주어짐 · 마지막은 9 → 1 온 줄(9 와 다른 셋이 주어지고 다섯을 채움). */
export function deal(id, history = [], rnd = Math.random, opt = {}){ const c = CELLS[id]; if (!c) return []; const prev = history[history.length - 1], N = T.PER_BOARD * T.BOARDS;
  if (id === 'A09' || c.given === 'head') { let runs = null;
    for (let g = 0; g < 400 && !runs; g++) { const st = shuffle([6, 6, 7, 7, 8, 8, 9, 9].filter(s => s >= c.start[0] && s <= c.start[1]), rnd), lens = {}; const rs = st.map(s => { const used = lens[s] || (lens[s] = []), cand = shuffle(range(c.len[0], c.len[1]).filter(l => !used.includes(l)), rnd), len = cand[0] || c.len[0]; used.push(len); return { start: s, len }; });   /* 같은 시작 수의 두 줄은 길이가 다르다(같은 줄이 두 번 나오지 않게) */
      if (opt.small) rs.sort((x, y) => x.len - y.len);
      const all = [...(prev ? [{ start: prev.run[0], len: prev.run.length }] : []), ...rs]; if (all.some((r, k) => k && r.start === all[k - 1].start)) continue; if (c.fullLast && rs[rs.length - 1].start === 9) continue; runs = rs; }   /* 여덟째가 9 로 시작하면 곧 온 줄(9 시작)이 붙는다 — 피함 */
    if (!runs) runs = [6, 7, 8, 9, 6, 7, 8, 9].map(s => ({ start: s, len: c.len[0] }));
    const out = runs.map(r => make(id, r.start, r.len, range(1, r.len - 1), rnd));
    if (c.fullLast) { const gv = fullGiven(rnd); out.push(make(id, 9, 9, range(0, 8).filter(i => !gv.includes(i)), rnd, { last: true, full: true })); }
    else out.push(make(id, c.start[1], c.len[1], range(1, c.len[1] - 1), rnd, { last: true }));
    return out.slice(0, N); }
  if (c.given === 'one') { const pl = pool(id); return Array.from({ length: N }, (_, k) => { const r = pl[Math.floor(rnd() * pl.length)], keep = Math.floor(rnd() * r.len); return make(id, r.start, r.len, range(0, r.len - 1).filter(i => i !== keep), rnd, k === N - 1 ? { last: true } : {}); }); }   /* 뒤 묶음(A11 · A12)이 쓸 꼴 — 받게만 */
  /* A08 */
  const pl = pool(id), longest = pl.filter(r => r.len === c.len[1]); let runs = null;
  for (let g = 0; g < 600 && !runs; g++) { const L = longest[Math.floor(rnd() * longest.length)], rs = shuffle(pl.filter(r => !(r.start === L.start && r.len === L.len)), rnd).slice(0, N - 1); if (opt.small) rs.sort((x, y) => x.len - y.len);
    rs.push(L);   /* 마지막 긴 줄을 먼저 뽑고 나머지는 그 줄을 뺀 풀에서 — 한 나들이에 같은 줄 두 번 없음 */ const all = [...(prev ? [{ start: prev.run[0], len: prev.run.length }] : []), ...rs];
    if (all.some((r, k) => k && r.start === all[k - 1].start && r.len === all[k - 1].len)) continue;
    const ends = rs.filter(r => r.start + r.len - 1 >= 8).length, starts = new Set(rs.map(r => r.start)).size; if (ends < 3 || starts < 4) continue; runs = rs; }
  if (!runs) runs = [{ start: 1, len: 5 }, { start: 4, len: 5 }, { start: 2, len: 6 }, { start: 5, len: 5 }, { start: 1, len: 6 }, { start: 3, len: 7 }, { start: 4, len: 6 }, { start: 2, len: 5 }, { start: 1, len: 7 }];
  const idx = shuffle(range(0, N - 1), rnd), heads = new Set(idx.slice(0, c.headHole)), tails = new Set(idx.slice(c.headHole, c.headHole + c.tailHole + (rnd() < .5 ? 1 : 0)));
  return runs.map((r, k) => { const kind = heads.has(k) ? 'head' : tails.has(k) ? 'tail' : 'mid', last = k === N - 1, n = last ? c.holes.solo[1] : opt.small ? c.holes.solo[0] : ri(c.holes.solo[0], c.holes.solo[1], rnd);
    return make(id, r.start, r.len, holesA08(r.len, n, kind, rnd), rnd, last ? { last: true } : {}); }); }

/** 걸음 ① 판(start ~ start+2): A08 은 빈 자리를 하나~둘로(맨 앞 · 맨 뒤 빈 꼴은 그대로) — 처음 꼴은 solo 에 남긴다. A09 는 그대로(부표에 흐린 숫자가 있다). */
export function handFix(q, start, rnd = Math.random){ return q.map((p, k) => { if (k < start || k >= start + T.PER_BOARD || p.hand) return p; const c = CELLS[p.cell]; if (!c.holes) return { ...p, hand: true, solo: p };
  const kind = kindOf(p), n = ri(c.holes.hand[0], c.holes.hand[1], rnd); let hs = kind === 'head' ? [0] : kind === 'tail' ? [p.run.length - 1] : []; for (const i of shuffle(p.holes.filter(i => !hs.includes(i)), rnd)) if (hs.length < n) hs.push(i);
  const h = { ...p, holes: hs.sort((a, b) => a - b), hand: true, solo: p }; h.loose = loose(h, rnd); return h; }); }
/** 안개 낀 줄(A08 · 통과 뒤): 줄의 양 끝만 보이고 가운데가 다 빈다(수는 그대로 · 떠 있는 배를 새로). A09 는 줄이 그대로(맨 앞 팻말만 가려짐 — 화면이 한다). */
export function fogFix(p, rnd = Math.random){ if (p.cell !== 'A08' || p.run.length < 3) return { ...p, fog: true, prefog: p }; const f = { ...p, holes: range(1, p.run.length - 2), fog: true, prefog: p }; f.loose = loose(f, rnd); return f; }
/** 깨끗하지 못했던 문제를 「문제 둘을 사이에 두고」 다시(같은 줄 · 같은 빈 자리 · 떠 있는 배의 차례와 남는 배는 새로).
 *  밀어 넣지 않고 뒤의 문제 하나와 바꾼다 — 마지막 문제(가장 긴 줄 · 온 줄)는 바꾸지 않는다 · 빈 꼴(맨 앞 · 맨 뒤 · 가운데)이 같은 문제와 먼저 바꾼다 · 앞뒤로 같은 줄이 붙지 않게.
 *  그런 자리가 없으면(나들이 끝 가까이) 다시 내지 않는다. 걸음 ① 판의 문제는 처음 꼴(solo)로 다시 낸다. */
export function requeue(q, i, rnd = Math.random){ const src = q[i] && (q[i].prefog || q[i].solo || q[i]); if (!src) return q.slice();   /* 안개 문제는 안개 앞의 빈 꼴로 · 걸음 ① 문제는 처음 꼴로 */
  for (const [gap, strict] of [[T.RETRY_GAP, true], [T.RETRY_GAP, false], [1, true], [1, false]]) for (let at = i + gap + 1; at < q.length - 1; at++) { if (q[at].retry || q[at].last) continue; if (strict && kindOf(q[at].solo || q[at]) !== kindOf(src)) continue;   /* 두 문제 뒤가 없으면(여섯째~여덟째) 마지막 바로 앞까지 남은 자리와 바꾼다 */
    const a = q.slice(), r = { cell: src.cell, run: src.run.slice(), holes: src.holes.slice(), retry: true }; r.loose = loose(r, rnd); a[at] = r;
    if (same(a[at - 1], a[at]) || same(a[at], a[at + 1])) continue; return a; }
  return q.slice(); }

/** 끼우기(손을 떼는 순간): 걸음 ① 은 같은 수의 자리에만 걸림(아니면 물로 미끄러져 돌아감) · 걸음 ② 는 빈 자리면 늘 걸림. state = { p, fill } */
export function snap(state, boat, slot, hand){ const p = state.p; if (!p || !p.holes.includes(slot) || (state.fill && state.fill[slot] != null)) return 'back'; return !hand || p.run[slot] === boat ? 'ok' : 'back'; }
/** 종을 쳤을 때: 앞에서부터 세어 나가다 — 끝까지 맞으면 depart · 틀린 배에 닿으면 slip(그 배와 그 뒤의 틀린 배들) · 빈 자리에 닿으면 gap. upto = 세어진 칸 수. */
export function judge(state){ const p = state.p, fill = state.fill || [];
  for (let i = 0; i < p.run.length; i++) { if (!p.holes.includes(i)) continue; const v = fill[i];
    if (v == null) return { gap: i, upto: i };
    if (v !== p.run[i]) return { slip: p.holes.filter(j => j >= i && fill[j] != null && fill[j] !== p.run[j]), upto: i }; }
  return { depart: true, upto: p.run.length }; }
/** 세어 나가는 차례: 앞에서부터 upto 칸까지 — 자리 · 수 · 음. */
export const callout = (run, upto = run.length) => run.slice(0, upto).map((n, at) => ({ at, n, f: NOTE[n] || 262 }));
/** 깨끗한 문제 = 첫 종에 떠났다(풀린 배 · 빈 자리에서 멎음 · 길잡이 손 · 놓친 시계가 없음). 종 치기 전에 끼웠다 뺀 것 · 물에 놓친 끌기 · 떠내려가는 배를 잡은 것은 깨끗함 그대로. */
export const clean = r => !!r && !(r.slipped || r.gapped || r.hinted || r.missed);

/** 그 판의 사건. evBoards = 이 낱칸에서 앞서 사건이 붙은 판 수 · opt = { passed, calm, hand }.
 *  걸음 ① 판은 사건 없음. 처음 여섯 판은 INTRO 차례로 하나씩(팽팽해지는 밧줄은 한 번 나온 뒤로 늘) · 그 뒤는 판마다 하나.
 *  안개 낀 줄은 통과한 뒤만. ?calm = 팽팽해지는 밧줄 · 섞는 물결 · 떠내려가는 배 · 안개 없음(뒤섞여 들어오는 것은 남는다 — 내용이다). 사건은 줄의 수를 바꾸지 않는다. */
export function events(evBoards, rnd = Math.random, opt = {}){ const ev = { leave: false, shuffle: false, drift: false, surprise: false, fog: false, song: true, intro: null };
  if (opt.hand) return { ...ev, none: true };
  const can = { leave: true, shuffle: true, drift: true, surprise: true, fog: !!opt.passed, song: true };
  if (evBoards < INTRO.length) { const k = INTRO[evBoards]; ev.intro = k; if (can[k]) ev[k] = true; if (evBoards > 0) ev.leave = true; }
  else { ev.leave = true; const w = [['shuffle', T.SHUFFLE_P], ['drift', T.DRIFT_P], ['surprise', T.SURPRISE_P], ['fog', can.fog ? T.FOG_P : 0]], sum = w.reduce((a, x) => a + x[1], 0); let r = rnd() * Math.max(1, sum);
    for (const [name, p] of w) { if (r < p) { ev[name] = true; break; } r -= p; } }
  if (opt.calm) { ev.leave = false; ev.shuffle = false; ev.drift = false; ev.fog = false; }
  return ev; }
/** 밧줄이 다 팽팽해지기까지(초): 나들이 셋째 판이 조금 빠르고 · 마지막 긴 줄은 넉넉히. */
export const leaveS = (id, board, last) => last ? T.LEAVE_FULL : ((board >= T.BOARDS - 1 ? T.LEAVE_LAST : T.LEAVE_S)[id] || T.LEAVE_S.A08);
/** 섞는 물결: 떠 있는 배의 자리 차례를 바꾼다(수는 그대로 — 자리만). 같은 차례로 돌아오지 않게. */
export function reshuffle(order, rnd = Math.random){ if (order.length < 2) return order.slice(); let o = order.slice(); for (let g = 0; g < 20; g++) { o = shuffle(order.slice(), rnd); if (o.some((x, k) => x !== order[k])) break; } if (o.every((x, k) => x === order[k])) o.push(o.shift()); return o; }

/** 한 문제를 봇이 끝까지(하네스용): 떠 있는 배를 아무 빈 자리에나 끼우고 · 다 차면 종 · 풀린 배는 물로 — 다시. → { ok, bells } */
export function play(p, rnd = Math.random){ const fill = Array(p.run.length).fill(null); let bells = 0;
  for (let g = 0; g < 400; g++) { const empty = p.holes.filter(i => fill[i] == null), free = p.loose.filter(n => !fill.includes(n));
    if (empty.length && free.length) { const i = empty[Math.floor(rnd() * empty.length)], n = free[Math.floor(rnd() * free.length)]; if (snap({ p, fill }, n, i, false) === 'ok') fill[i] = n; continue; }
    bells++; const j = judge({ p, fill }); if (j.depart) return { ok: true, bells }; if (j.slip) for (const i of j.slip) fill[i] = null; if (j.gap != null && !free.length) return { ok: false, bells }; }
  return { ok: false, bells }; }
