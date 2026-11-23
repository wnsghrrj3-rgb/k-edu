/* 세기 틀 「물고기 세어 담기」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/T03_세기_틀.md · 정본 27 문서 4 · 5절(5-9 · 5-10 · 5-11).
 * 문제 하나 = 얕은 바다의 물고기 N 마리를 하나씩 짚어 통에 담는다(짚는 손이 곧 세기 — 담기면 사라지니 두 번 셀 수 없다).
 *   걸음 ① 따라 세기 : 담을 때마다 통 위의 수가 하나씩 오른다 · 바다가 비면 저절로 닫힘(묻지 않음)
 *   걸음 ② 세고 답하기 : 수는 오르지 않는다 · 다 담았다고 생각하면 아이가 스스로 「다 담았어요」(종) → 「물고기는 모두 ?마리」 + 점 카드 셋
 * 묻는 것은 「모두 몇 마리」 하나뿐 — 덧셈 · 뺄셈 · 모으기 · 가르기 · 비교 없음. 숫자를 배우기 전의 낱칸이라 카드는 점 + 숫자(정본 5-10절).
 * 같은 틀이 뒤에 맡을 낱칸(G01 이어 세어 더하기 · G05 거꾸로 세어 빼기)은 아래 CELLS 표에 줄만 더한다. */

// ── 낱칸 표: N = 물고기 수 범위 · big = 한 나들이에 그 범위에서 낼 수(나머지는 작은 쪽) · range = 카드에 나올 수의 범위 · hideMax = 한 문제에 숨는 물고기 수의 위 끝
export const CELLS = {
  A01: { N: [1, 5], big: { N: [3, 5], n: 7 }, range: [1, 5], hideMax: 1 },   // 하나씩 짚으며 세기 — 3 · 4 · 5 가 아홉 중 일곱
  A06: { N: [6, 9], range: [6, 9], hideMax: 2 },                             // 9까지 세기 — 6 · 7 · 8 · 9 를 고르게
};
export const IDS = Object.keys(CELLS);

// ── 내가 정한 수치(T03 설계 기본안 + 코드가 정한 것 — 준호가 반에서 보고 바꾼다)
export const T = {
  EBB_S: { A01: 16, A06: 22 }, EBB_LAST: { A01: 13, A06: 18 },   // 썰물이 다 빠지기까지(생각하는 동안에만 가는 초) · 나들이 셋째 판
  HIDE_P: .5, HIDE_S: 3,             // 숨는 물고기가 나올 확률(문제마다 — 처음 소개하는 판은 늘) · 숨어 있는 시간(초)
  FAST_P: .3, SURPRISE_P: .25, LID_P: .3,   // 판마다 사건 하나를 뽑을 확률(뚜껑 덮인 통은 통과한 뒤에만)
  STREAK: 3, HINT_AFTER: 6, TAP_R: 56, HINT_PICK: 14,   // 점 카드를 고르는 동안의 길잡이 손(초 · 막혀도 줄이지 않음 — 점을 세는 시간) · 물보라까지 깨끗한 문제 수 · 가만히 이만큼(초)이면 길잡이 손 · 물고기를 누르는 반경(px)
  PER_BOARD: 3, BOARDS: 3, RETRY_GAP: 2,    // 판 = 문제 셋 · 나들이 = 판 셋 · 깨끗하지 못한 문제는 문제 둘을 사이에 두고 다시
  SURPRISE_COINS: 3, COIN_PER: 1,           // 깜짝 물고기의 덤 동전 · 담은 문제 하나에 동전
  HIDE_MIN: 1.6, HIDE_AT: [4, 7], HIDE_SWIM: 1.1, HIDE_GAP: 1.4,   // 숨기 시작할 수 있는 때(물고기가 다 보인 뒤) · 늦어도 이때는 숨으러 감 · 숨는 곳까지 헤엄치는 시간 · 두 마리면 사이
  FAST_X: 2.1, SPLASH_FAST: .12,            // 빠른 물고기의 빠르기(배) · 물장구: 깨끗한 문제가 이어질 때 들어오는 시간이 줄어드는 몫(셋까지)
  SEA: { x: [-3.6, 2.9], z: [-1.95, .55] }, SEP: .95,   // 물고기가 헤엄치는 얕은 바다(세계 좌표) · 처음 자리끼리 떨어진 거리
};
/** 숨는 곳 둘(바위 · 해초)의 자리 후보 — 문제마다 하나를 고른다(다시 나오는 문제도 새로). [바위 x, z, 해초 x, z] */
export const SPOTS = [[-2.6, -1.2, 2.3, -.45], [-2.2, -.3, 2.45, -1.25], [2.3, -1.2, -2.7, -.4], [-1.0, -1.3, 2.55, -.2], [1.0, -1.3, -2.85, -.25]];
/** 섞어 헤엄칠 물고기(종류는 세지 않는다 — 크기 · 빛깔만 섞임). 이름은 ./art.js 의 모형 이름과 같다. */
export const FISH = ['Clownfish', 'BlueTang', 'YellowTang', 'Koi', 'ButterflyFish', 'Betta', 'Tang', 'RoyalGramma', 'CardinalFish', 'Tetra'];
export const INTRO = ['ebb', 'hide', 'fast', 'surprise', 'lid', 'splash'];   // 걸음 ② 의 처음 판들은 이 차례로 하나씩

const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const key = p => `${p.N}`;
export const same = (p, q) => !!p && !!q && key(p) === key(q);
export const make = N => ({ kind: 'count', N });
/** 그 낱칸의 문제 풀 = 물고기 수 N 들(풀 밖의 수는 나오지 않는다). */
export function pool(id){ const c = CELLS[id]; return c ? range(c.N[0], c.N[1]) : []; }

/** N 들을 고르게: list 에서 n 개(한 바퀴씩 섞어 돌림 — 어느 수도 다른 수보다 둘 이상 많이 나오지 않는다). */
function evenly(list, n, rnd){ const out = []; while (out.length < n) out.push(...shuffle(list.slice(), rnd)); return out.slice(0, n); }
/** 같은 N 이 연달아 오지 않게 늘어놓는다(앞 나들이 끝 prev 와도). order = 'shuffle' | 'small'(작은 수부터). 아홉 개라 되짚어 찾는다. */
function arrange(Ns, prev, rnd, order){ const cnt = new Map(); for (const n of Ns) cnt.set(n, (cnt.get(n) | 0) + 1); const out = [];
  const go = last => { if (out.length === Ns.length) return true; let cand = [...cnt.keys()].filter(n => cnt.get(n) > 0 && n !== last); cand = order === 'small' ? cand.sort((a, b) => a - b) : shuffle(cand, rnd);
    for (const n of cand) { cnt.set(n, cnt.get(n) - 1); out.push(n); if (go(n)) return true; out.pop(); cnt.set(n, cnt.get(n) + 1); } return false; };
  return go(prev) ? out : Ns.slice(); }
/** 나들이 하나의 차례(문제 아홉). history = 앞 나들이의 문제들(첫 문제가 앞 끝 문제와 같지 않게). opt.small = 막혔을 때 — 작은 수부터.
 *  규칙: 같은 N 연달아 없음 · A01 은 3 · 4 · 5 가 일곱 이상 · A06 은 6~9 를 고르게. */
export function deal(id, history = [], rnd = Math.random, opt = {}){ const c = CELLS[id], n = T.PER_BOARD * T.BOARDS; if (!c) return [];
  const Ns = c.big ? [...evenly(range(c.big.N[0], c.big.N[1]), c.big.n, rnd), ...evenly(range(c.N[0], c.big.N[0] - 1), n - c.big.n, rnd)] : evenly(range(c.N[0], c.N[1]), n, rnd);
  const last = history[history.length - 1]; return arrange(Ns, last ? last.N : null, rnd, opt.small ? 'small' : 'shuffle').map(make); }
/** 깨끗하지 못했던 문제를 「문제 둘을 사이에 두고」 다시 낸다(같은 나들이 안 · 길이는 그대로 — 끝의 문제 하나가 빠진다). 앞뒤가 같은 N 이면 한 칸씩 뒤로 · 자리가 없으면 그대로. */
export function requeue(q, i){ for (let at = i + T.RETRY_GAP + 1; at < q.length; at++) { const a = q.slice(); a.splice(at, 0, { ...q[i], retry: true }); a.length = q.length;
    if (!a.some((p, k) => k && same(a[k - 1], p))) return a; }
  return q.slice(); }

/** 고를 수 셋: 답 · 답과 1 차이 · 답과 2 차이(범위 안 · 겹치거나 범위 밖이면 가까운 수). 자리는 섞는다. */
export function cards(answer, lim = [1, 9], rnd = Math.random){ const [lo, hi] = lim, ok = n => n >= lo && n <= hi && !out.includes(n), out = [answer];
  const d1 = shuffle([answer - 1, answer + 1], rnd).find(ok); if (d1 != null) out.push(d1);
  const d2 = shuffle([answer - 2, answer + 2], rnd).find(ok); if (d2 != null) out.push(d2);
  for (let d = 1; out.length < 3 && d < 20; d++) for (const x of [answer - d, answer + d]) if (out.length < 3 && ok(x)) out.push(x);
  return shuffle(out, rnd); }
export const picksFor = (id, p, rnd = Math.random) => cards(p.N, (CELLS[id] || {}).range || [1, 9], rnd);

/** 판정. state = { left(바다에 남은 수), answer } · action = { type: 'tap', fish } | { type: 'bell' } | { type: 'pick', k }
 *  → 'scooped'(물고기를 짚어 담음) | 'miss'(헛누름 — 물만 튐) | 'early'(남았는데 종) | 'fit'(다 담고 종 · 맞는 수) | 'off'(아닌 수) */
export function judge(state, action){ if (action.type === 'tap') return action.fish ? 'scooped' : 'miss';
  if (action.type === 'bell') return state.left > 0 ? 'early' : 'fit';
  if (action.type === 'pick') return action.k === state.answer ? 'fit' : 'off';
  return 'miss'; }
/** 깨끗한 문제 = 일찍 울린 종 · 물러난 수 · 길잡이 손 · 놓침(썰물) 없이 해낸 문제. 헛누름 · 숨은 물고기를 기다린 시간은 깨끗함 그대로. */
export const clean = r => !!r && !(r.early || r.retreat || r.hinted || r.missed);

/** 그 판의 사건. evBoards = 이 낱칸에서 앞서 사건이 붙은 판 수 · opt = { passed, calm, hand }.
 *  손으로 하는 판(걸음 ①)은 사건 없음. 처음 여섯 판은 INTRO 차례로 하나씩(썰물은 한 번 나온 뒤로 늘 · 숨는 물고기는 소개한 뒤로 문제마다 HIDE_P) · 그 뒤는 판마다 하나를 뽑는다.
 *  뚜껑 덮인 통은 통과한 뒤에만. ?calm = 썰물 · 빠른 물고기 · 뚜껑 없음(숨는 물고기는 남는다 — 내용이다). 사건은 수를 바꾸지 않는다. */
export function events(evBoards, rnd = Math.random, opt = {}){ const ev = { ebb: false, hide: false, hideAll: false, fast: false, surprise: false, lid: false, splash: true, intro: null };
  if (opt.hand) return { ...ev, none: true };
  const can = { ebb: true, hide: true, fast: true, surprise: true, lid: !!opt.passed, splash: true };
  if (evBoards < INTRO.length) { const k = INTRO[evBoards]; ev.intro = k; if (can[k]) ev[k] = true; if (evBoards > 0) ev.ebb = true; if (evBoards >= INTRO.indexOf('hide')) ev.hide = true; ev.hideAll = k === 'hide'; }
  else { ev.ebb = true; ev.hide = true; const r = rnd(); if (r < T.FAST_P) ev.fast = true; else if (r < T.FAST_P + T.SURPRISE_P) ev.surprise = true; else if (r < T.FAST_P + T.SURPRISE_P + T.LID_P && can.lid) ev.lid = true; }
  if (opt.calm) { ev.ebb = false; ev.fast = false; ev.lid = false; }
  return ev; }
/** 썰물 시간: 나들이 셋째 판은 조금 더 빠르다. */
export const ebbS = (board, id) => (board >= T.BOARDS - 1 ? T.EBB_LAST : T.EBB_S)[id] || T.EBB_S.A01;
/** 이 문제에 숨을 물고기 수: 숨는 판이 아니면 0 · 소개하는 판은 늘 · 그 뒤는 HIDE_P. A01 은 한 마리 · A06 은 두 마리까지(그리고 N − 1 까지 — 한 마리뿐이면 숨지 않는다). */
export function hidesFor(id, N, ev, rnd = Math.random){ if (!ev || !ev.hide || N < 2) return 0; if (!ev.hideAll && rnd() >= T.HIDE_P) return 0;
  const mx = (CELLS[id] || {}).hideMax || 1; return Math.min(N - 1, 1 + Math.floor(rnd() * mx)); }

/** 문제 하나의 바다: 물고기마다 { 처음 자리, 머리 방향, 빠르기, 크기, 모형, 빠른 물고기, 깜짝 물고기, 들어오는 곳 } + 숨기 계획 + 숨는 곳.
 *  숨기 계획 hides[i] = { at(늦어도 이때 숨으러 감), spot(0 바위 · 1 해초), dur, trigger(바다에 남은 수가 이만큼 이하면 숨으러 감) } — 숨는 물고기는 그때 바다에 있는 것 가운데서 고른다(먼저 담겼으면 다른 물고기).
 *  opt = { hides, fast, surprise } · 사건은 수를 바꾸지 않는다(물고기는 늘 N 마리). */
export function scene(N, rnd = Math.random, opt = {}){ const sp = SPOTS[Math.floor(rnd() * SPOTS.length)], spots = [[sp[0], sp[1]], [sp[2], sp[3]]], { x: X, z: Z } = T.SEA, fish = [], kinds = shuffle(FISH.slice(), rnd);
  for (let i = 0; i < N; i++) { let x = 0, z = 0;
    for (let t = 0; t < 80; t++) { x = X[0] + .3 + rnd() * (X[1] - X[0] - .6); z = Z[0] + .2 + rnd() * (Z[1] - Z[0] - .4); const sep = T.SEP * (t < 60 ? 1 : .6); if (fish.every(f => Math.hypot(f.x - x, f.z - z) >= sep) && spots.every(s => Math.hypot(s[0] - x, s[1] - z) >= .9)) break; }
    const side = rnd() < .5 ? -1 : 1; fish.push({ i, x, z, heading: rnd() * Math.PI * 2, speed: .35 + rnd() * .3, size: .85 + rnd() * .3, model: kinds[i % kinds.length], fast: false, surprise: false, from: [side * (X[1] + 2.2), z + (rnd() - .5) * 1.2], delay: i * .07 }); }
  if (opt.fast && N > 1) { const f = fish[Math.floor(rnd() * N)]; f.fast = true; f.speed *= T.FAST_X; }
  if (opt.surprise) fish[Math.floor(rnd() * N)].surprise = true;
  const h = Math.min(opt.hides | 0, N - 1), hides = []; const first = rnd() < .5 ? 0 : 1;
  for (let k = 0; k < h; k++) hides.push({ at: T.HIDE_AT[0] + rnd() * (T.HIDE_AT[1] - T.HIDE_AT[0]) + k * T.HIDE_GAP, spot: (first + k) % 2, dur: T.HIDE_S, trigger: h + 1 });
  return { N, fish, hides, spots }; }

// ── 바다의 상태(순수 — 화면이 이 상태를 그리고, 하네스가 그대로 돌린다)
//   물고기 st: 'swim'(헤엄) · 'go'(숨는 곳으로 헤엄 — 보임) · 'hide'(숨음 — 꼬리만) · 'fly'(뜰채에 떠서 통으로) · 'tub'(통 안) · 'gone'(썰물에 먼바다로)
const IN_SEA = ['swim', 'go', 'hide'];
export function sea(sc){ return { t: 0, N: sc.N, fish: sc.fish.map(f => ({ i: f.i, st: 'swim', spot: -1, until: 0 })), plan: sc.hides.map(h => ({ ...h, used: false })), hidden: 0 }; }
/** 바다에 남은 수(화면 안 + 숨은 곳) = 아직 안 담긴 수. */
export const left = s => s.fish.filter(f => IN_SEA.includes(f.st)).length;
export const scooped = s => s.fish.filter(f => f.st === 'fly' || f.st === 'tub').length;
/** 시간을 dt 만큼 → 일어난 일들 [{ type: 'go' | 'hide' | 'out', i, spot }]. pick(후보들) = 숨으러 갈 물고기 고르기(화면은 숨는 곳에 가까운 것). */
export function tick(s, dt, pick = c => c[0]){ s.t += dt; const out = [], n = left(s);
  for (const p of s.plan) { if (p.used) continue; if (!((n <= p.trigger && s.t >= T.HIDE_MIN) || s.t >= p.at)) continue;
    const c = s.fish.filter(f => f.st === 'swim'); if (!c.length) continue; const f = pick(c, p.spot); p.used = true; f.st = 'go'; f.spot = p.spot; f.until = s.t + T.HIDE_SWIM; f.dur = p.dur; out.push({ type: 'go', i: f.i, spot: p.spot }); break; }   /* 한 번에 한 마리씩 */
  for (const f of s.fish) { if (f.st === 'go' && s.t >= f.until) { f.st = 'hide'; f.until = s.t + f.dur; out.push({ type: 'hide', i: f.i, spot: f.spot }); }
    else if (f.st === 'hide' && s.t >= f.until) { f.st = 'swim'; out.push({ type: 'out', i: f.i, spot: f.spot }); f.spot = -1; } }
  return out; }
/** 물고기 i 를 짚었다 → 담겼는가(바다에 있을 때만 — 담긴 것은 다시 꺼낼 수 없다). */
export function scoop(s, i){ const f = s.fish[i]; if (!f || !IN_SEA.includes(f.st)) return false; f.st = 'fly'; f.spot = -1; return true; }
export function land(s, i){ const f = s.fish[i]; if (f && f.st === 'fly') f.st = 'tub'; }
/** 종을 일찍 눌렀다: 숨은 물고기가 고개를 내밀고 나온다(「나도!」) → 남은 물고기 i 들. */
export function peek(s){ const ids = []; for (const f of s.fish) { if (!IN_SEA.includes(f.st)) continue; ids.push(f.i); if (f.st !== 'swim') { f.st = 'swim'; f.spot = -1; } } return ids; }
/** 썰물이 다 빠졌다: 남은 물고기가 먼바다로(담은 것은 그대로). */
export function flee(s){ const ids = []; for (const f of s.fish) if (IN_SEA.includes(f.st)) { f.st = 'gone'; ids.push(f.i); } return ids; }

/** 한 문제를 봇이 끝까지(하네스용): 바다를 돌리며 아무 때나 짚고 · 다 담으면 종 · 카드를 고른다. pick(cards) → 고른 수. → { ok, early, retreats, k, maxHide } */
export function play(id, p, opt = {}, rnd = Math.random){ const sc = scene(p.N, rnd, opt), s = sea(sc), pick = opt.pick || (cs => cs[0]); let early = 0, guard = 0, maxHide = 0, bad = 0;
  while (left(s) > 0 && ++guard < 5000) { tick(s, .1); maxHide = Math.max(maxHide, s.fish.filter(f => f.st === 'hide').length); if (left(s) + scooped(s) !== p.N) bad++;
    const vis = s.fish.filter(f => f.st === 'swim' || f.st === 'go'); if (vis.length && rnd() < .2) { const f = vis[Math.floor(rnd() * vis.length)]; scoop(s, f.i); land(s, f.i); }
    else if (!vis.length && rnd() < .05) { if (judge({ left: left(s) }, { type: 'bell' }) === 'early') { early++; peek(s); } } }
  const cs = picksFor(id, p, rnd); let ls = cs.slice(), retreats = 0, k = null;
  while (ls.length) { const x = pick(ls); if (judge({ answer: p.N }, { type: 'pick', k: x }) === 'fit') { k = x; break; } retreats++; ls = ls.filter(y => y !== x); }
  return { ok: k === p.N && scooped(s) === p.N, early, retreats, k, maxHide, bad, cards: cs }; }
