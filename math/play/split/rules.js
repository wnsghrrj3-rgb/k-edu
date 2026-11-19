/* 가르기 틀 「두 배에 나눠 싣기」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/T01_가르기_틀.md · 정본 27 문서 4 · 5절.
 * 문제 하나 = 손 한 번의 일. 판 = 문제 셋 · 나들이 = 판 셋(문제 아홉) · 한 나들이 = 낱칸 하나.
 *   가르기 split : 짐 N 개를 빨간 배(팻말 a)와 파란 배(?)에 나눠 싣는다 — 답 b = N − a
 *   모으기 join  : 빨간 배(a) · 파란 배(b)의 짐을 창고에 모은다 — 답 N = a + b
 *   여러 가지로 ways : 짐 N 개를 서로 다른 방법 셋으로 나눠 보낸다(2와 5 · 5와 2 는 다른 방법 — 열어 둔 것 1)
 * 0 이 든 가르기는 내지 않는다(a, b ≥ 1). 덧셈식 · 뺄셈식 · 합 고르기는 없다 — 띠는 「5 → 2 와 3」 「2 와 3 → 5」.
 * 같은 틀이 뒤에 맡을 낱칸(C02 · C03 · C05 · F05 · G02 · G03 · G06 · G07)은 아래 CELLS 표에 줄만 더한다. */

// ── 낱칸 표: kind · N 범위 · (big = 큰 수 쪽과 한 나들이에 그 쪽에서 낼 수 · 나머지는 작은 쪽) · max = 고를 수의 위 끝
export const CELLS = {
  B01: { kind: 'join', N: [2, 5], max: 5 },
  B02: { kind: 'split', N: [2, 5], max: 5 },
  B03: { kind: 'join', N: [2, 9], big: { N: [6, 9], n: 7 }, max: 9 },
  B04: { kind: 'split', N: [2, 9], big: { N: [6, 9], n: 7 }, max: 9 },
  B05: { kind: 'ways', N: [4, 9], max: 9 },
  /* 뒤 묶음(T02~)에서 열 줄 — 예: C02: { kind: 'join', N: [10, 10], max: 10 }, C03: { kind: 'split', N: [10, 10], max: 10 } */
};
export const IDS = Object.keys(CELLS);

// ── 내가 정한 수치(T01 설계 기본안 + 코드가 정한 것 — 준호가 반에서 보고 바꾼다)
export const T = {
  ANCHOR_S: 14, ANCHOR_LAST: 11,     // 닻이 다 오르기까지(생각하는 동안에만 가는 초) · 나들이 셋째 판
  WAVE_P: .3, SURPRISE_P: .25, FOG_P: .3,   // 판마다 사건 하나를 뽑을 확률(안개는 통과한 뒤에만)
  STREAK: 3, HINT_AFTER: 6,          // 뱃고동 불꽃까지 깨끗한 문제 수 · 가만히 이만큼(초)이면 길잡이 손
  PER_BOARD: 3, BOARDS: 3, WAYS: 3,  // 판 = 문제 셋 · 나들이 = 판 셋 · 여러 가지로 = 한 문제에 세 번 보내기
  RETRY_GAP: 2,                      // 깨끗하지 못한 문제는 문제 둘을 사이에 두고 다시
  WAVE_S: 3.5, WAVE_AT: [2, 5],      // 파도: 굴러가는 짐을 잡을 시간 · 문제가 시작되고 몇 초 뒤
  SURPRISE_COINS: 3, COIN_PER: 1,    // 깜짝 짐의 덤 동전 · 보낸 문제 하나에 동전
  HORN_FAST: .15,                    // 뱃고동: 깨끗한 문제가 이어질 때 배가 들어오는 시간이 줄어드는 몫(셋까지)
};
export const INTRO = ['anchor', 'wave', 'surprise', 'fog', 'horn'];   // 처음 다섯 판은 이 차례로 하나씩

const R = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const kindOf = id => (CELLS[id] || {}).kind || null;
export const key = p => p.kind === 'ways' ? `${p.N}` : `${p.N}:${p.a}`;
export const same = (p, q) => !!p && !!q && key(p) === key(q);
/** 문제 하나를 꼴로: split { kind, N, a, b } · join { kind, N, a, b } · ways { kind, N } */
export function make(id, N, a){ const kind = kindOf(id); return kind === 'ways' ? { kind, N } : { kind, N, a, b: N - a }; }

/** 그 낱칸의 문제 풀 = 나올 수 있는 모든 경우(풀 밖의 수는 나오지 않는다). */
export function pool(id){ const c = CELLS[id]; if (!c) return []; const out = []; for (const N of range(c.N[0], c.N[1])) { if (c.kind === 'ways') out.push(make(id, N)); else for (const a of range(1, N - 1)) out.push(make(id, N, a)); } return out; }

/** N 들을 고르게: list 에서 n 개(한 바퀴씩 섞어 돌림 — 어느 수도 다른 수보다 둘 이상 많이 나오지 않는다). */
function evenly(list, n, rnd){ const out = []; while (out.length < n) out.push(...shuffle(list.slice(), rnd)); return out.slice(0, n); }

/** 나들이 하나의 차례(문제 아홉). history = 앞 나들이의 문제들(첫 문제가 앞 끝 문제와 같지 않게 · 같은 (N, a) 를 덜 내게).
 *  opt.small = 막혔을 때 — 작은 수부터. 규칙: 같은 문제 연달아 없음 · N 을 고르게 · B03 · B04 는 6~9 가 일곱 이상. */
export function deal(id, history = [], rnd = Math.random, opt = {}){ const c = CELLS[id], n = T.PER_BOARD * T.BOARDS; if (!c) return [];
  const Ns = c.big ? [...evenly(range(c.big.N[0], c.big.N[1]), c.big.n, rnd), ...evenly(range(c.N[0], c.big.N[0] - 1), n - c.big.n, rnd)] : evenly(range(c.N[0], c.N[1]), n, rnd);
  const used = new Map(); for (const p of history.slice(-9)) used.set(key(p), (used.get(key(p)) | 0) + 1);
  const qs = Ns.map(N => { if (c.kind === 'ways') return make(id, N); const as = shuffle(range(1, N - 1), rnd).sort((x, y) => (used.get(`${N}:${x}`) | 0) - (used.get(`${N}:${y}`) | 0)); const a = as[0]; used.set(`${N}:${a}`, (used.get(`${N}:${a}`) | 0) + 1); return make(id, N, a); });
  let out = qs, best = null, bestBad = 1e9; const last = history[history.length - 1];
  for (let t = 0; t < 60; t++) { const cand = opt.small ? qs.slice().sort((x, y) => x.N - y.N || rnd() - .5) : shuffle(qs.slice(), rnd); let bad = 0;
    for (let i = 0; i < cand.length; i++) { const prev = i ? cand[i - 1] : last; if (same(prev, cand[i])) bad += 100; else if (prev && prev.N === cand[i].N) bad += 1; }   /* 같은 문제 연달아는 안 됨 · 같은 N 연달아는 되도록 피함 */
    if (bad < bestBad) { bestBad = bad; best = cand; } if (bad === 0) break; }
  out = best; if (bestBad >= 100) out = fixRuns(out, last);
  return out; }
/** 같은 문제가 연달아 있으면 뒤의 것을 다른 자리와 바꾼다(작은 수 차례가 조금 흐트러져도). */
function fixRuns(q, last){ const a = q.slice(); for (let i = 0; i < a.length; i++) { const prev = i ? a[i - 1] : last; if (!same(prev, a[i])) continue;
    for (let j = 0; j < a.length; j++) { if (j === i) continue; const ok = (x, k) => !same(k ? a[k - 1] : last, x) && !same(a[k + 1], x); const ai = a[i], aj = a[j]; a[i] = aj; a[j] = ai; if (ok(a[i], i) && ok(a[j], j)) break; a[i] = ai; a[j] = aj; } }
  return a; }

/** 깨끗하지 못했던 문제를 「문제 둘을 사이에 두고」 다시 낸다(같은 나들이 안 · 길이는 그대로 — 끝의 문제 하나가 빠진다).
 *  그 자리 앞뒤가 같은 문제면 한 칸씩 뒤로 · 들어갈 자리가 없으면 그대로. */
export function requeue(q, i){ for (let at = i + T.RETRY_GAP + 1; at < q.length; at++) { const a = q.slice(); a.splice(at, 0, { ...q[i], retry: true }); a.length = q.length;
    if (!a.some((p, k) => k && same(a[k - 1], p))) return a; }
  return q.slice(); }
/** 고를 수 셋: 답 · 답±1 · 그 문제에 보이는 다른 수(흔한 잘못). 겹치거나 범위 밖이면 가까운 수. 자리는 섞는다. */
export function choices(answer, shown = [], lim = [1, 9], rnd = Math.random){ const [lo, hi] = lim, ok = n => n >= lo && n <= hi && n !== answer, out = [answer];
  const add = n => { if (ok(n) && !out.includes(n) && out.length < 3) out.push(n); };
  const near = shuffle([answer - 1, answer + 1], rnd); add(near[0]); for (const s of shuffle(shown.slice(), rnd)) add(s); add(near[1]);
  for (let d = 2; out.length < 3 && d < 20; d++) { add(answer - d); add(answer + d); }
  return shuffle(out, rnd); }
/** 문제의 고를 수: 가르기 = 파란 배의 수 b(보이는 다른 수 a · N) · 모으기 = 창고 N(보이는 다른 수 a · b). */
export function picksFor(id, p, rnd = Math.random){ const c = CELLS[id]; if (p.kind === 'split') return choices(p.b, [p.a, p.N], [1, c.max], rnd); if (p.kind === 'join') return choices(p.N, [p.a, p.b], [1, c.max], rnd); return []; }

/** 판정. state = { a, red, answer, ways } · action = { type: 'load', boat } | { type: 'pick', k } | { type: 'send', a, b }
 *  → 'fit'(맞음 · 실림) | 'over'(넘침 — 빨간 배에 a 보다 많이 · 고른 수가 커서 칸이 빔) | 'short'(고른 수가 작아 짐이 남음) | 'same'(앞과 같은 방법) */
export function judge(state, action){ if (action.type === 'load') return action.boat === 'red' && state.red + 1 > state.a ? 'over' : 'fit';
  if (action.type === 'pick') return action.k === state.answer ? 'fit' : action.k < state.answer ? 'short' : 'over';
  if (action.type === 'send') return seen(state.ways || [], action.a, action.b) ? 'same' : 'fit';
  return 'fit'; }
export const seen = (ways, a, b) => ways.some(w => w[0] === a && w[1] === b);
/** 여러 가지로: 아직 안 쓴 방법이 남았는가(늘 셋이 가능한지 하네스가 본다). */
export const waysLeft = (N, ways) => range(1, N - 1).filter(a => !seen(ways, a, N - a)).length;
/** 깨끗한 문제 = 넘침 · 물러난 수 · 길잡이 손 · 놓침 · 같은 방법 없이 해낸 문제(스스로 고쳐 실은 것은 그대로 깨끗함). */
export const clean = r => !!r && !(r.over || r.retreat || r.hinted || r.missed || r.same);

/** 그 판의 사건. evBoards = 이 낱칸에서 앞서 사건이 붙은 판 수 · opt = { passed, calm, kind, hand }.
 *  손으로 하는 판(걸음 ①)은 사건 없음. 처음 다섯 판은 INTRO 차례로 하나씩(닻은 한 번 나온 뒤로 늘 — 시계) · 그 뒤는 판마다 하나를 뽑는다.
 *  틀에 맞지 않는 사건은 건너뛴다: 모으기는 파도 없음(선착장에 짐이 없다) · 여러 가지로는 안개 없음(셀 것이 없다) · 안개는 통과한 뒤에만.
 *  ?calm = 닻 · 파도 · 안개 없음(깜짝 짐과 뱃고동은 남는다). 사건은 수를 바꾸지 않는다. */
export function events(evBoards, rnd = Math.random, opt = {}){ const ev = { anchor: false, wave: false, surprise: false, fog: false, horn: true, intro: null };
  if (opt.hand) return { ...ev, none: true };
  const can = { anchor: true, wave: opt.kind !== 'join', surprise: true, fog: opt.kind !== 'ways' && !!opt.passed, horn: true };
  if (evBoards < INTRO.length) { const k = INTRO[evBoards]; ev.intro = k; if (k !== 'anchor') ev.anchor = true; if (can[k]) ev[k] = true; }
  else { ev.anchor = true; const r = rnd(); if (r < T.WAVE_P) { if (can.wave) ev.wave = true; } else if (r < T.WAVE_P + T.SURPRISE_P) ev.surprise = true; else if (r < T.WAVE_P + T.SURPRISE_P + T.FOG_P && can.fog) ev.fog = true; }
  if (evBoards >= 0 && INTRO[evBoards] === 'anchor') ev.anchor = true;
  if (opt.calm) { ev.anchor = false; ev.wave = false; ev.fog = false; }
  return ev; }
/** 닻 시간: 나들이 셋째 판은 조금 더 빠르다. */
export const anchorS = board => board >= T.BOARDS - 1 ? T.ANCHOR_LAST : T.ANCHOR_S;

/** 한 문제를 봇이 끝까지(하네스용): pick(choices) → 고른 수. → { ok, retreats, result } */
export function play(id, p, pick = cs => cs[0], rnd = Math.random){ if (p.kind === 'ways') { const ways = []; let guard = 0; while (ways.length < T.WAYS && ++guard < 50) { const a = R(rnd, 1, p.N - 1), b = p.N - a; if (judge({ ways }, { type: 'send', a, b }) === 'fit') ways.push([a, b]); } return { ok: ways.length === T.WAYS, ways, retreats: 0 }; }
  const cs = picksFor(id, p, rnd), ans = p.kind === 'split' ? p.b : p.N; let left = cs.slice(), retreats = 0, guard = 0;
  while (left.length && ++guard < 10) { const k = pick(left); if (judge({ answer: ans }, { type: 'pick', k }) === 'fit') return { ok: true, retreats, k }; retreats++; left = left.filter(x => x !== k); }
  return { ok: false, retreats }; }
