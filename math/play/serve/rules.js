/* 담아 주기 틀 「손님에게 담아 주기」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/T04_담아주기_틀.md · 정본 27 문서 4 · 5절(5-9 · 5-10 · 5-11).
 * 세기 틀은 「있는 것을 센다」, 이 틀은 「들은 수만큼 만들어 낸다」. 손님이 말한 만큼(말 + 점 무늬) 바구니에 담고 종(「여기요」)을 눌러 건넨다.
 *   give : 주문 n 개를 담아 건넨다(n = 0 이면 빈 바구니 — 미리 든 것이 있으면 꺼내야 한다 · A05)
 *   left : 손님이 접시의 것을 하나씩 먹고 「접시에 몇 개 남았지?」 — 남은 것을 센다(뺄셈이 아니다 · 띠에 − 없음 · A05)
 * 숫자만으로 주문하지 않는다(숫자 읽기는 A03 · A07). 값 · 동전 세기 · 거스름 · 덧셈은 없다. */

// ── 낱칸 표
export const CELLS = {
  A02: { N: [1, 5], big: { N: [3, 5], n: 7 } },   // 수만큼 가져오기 — 주문 1~5 · 3 · 4 · 5 가 아홉 중 일곱
  A05: { zero: true },                            // 0 알기 — (가) 주문 여섯(0 넷 · 1~3 둘) + (나) 남은 수 셋(0 둘 · 1~2 하나)
};
export const IDS = Object.keys(CELLS);

// ── 내가 정한 수치(T04 설계 기본안 + 코드가 정한 것 — 준호가 반에서 보고 바꾼다)
export const T = {
  WAIT_S: 14, WAIT_LAST: 11, HURRY_S: 9,        // 손님이 기다리는 시간(생각하는 동안에만 가는 초) · 나들이 셋째 판 · 급한 손님
  HURRY_P: .3, ROLL_P: .3, SURPRISE_P: .25, QUIET_P: .3,   // 판마다 사건 하나를 뽑을 확률(작은 목소리는 통과한 뒤 · 소리가 날 때만)
  STREAK: 3, HINT_AFTER: 6, HINT_PICK: 14, PEEK_S: 2.5,    // 손뼉까지 깨끗한 문제 수 · 길잡이 손 · 카드를 고르는 동안의 길잡이 손 · 걸음 ② 에서 점 무늬가 보이는 시간
  SHELF: 8, SPOTS: 10, PRELOAD_P: .35,          // 진열대는 늘 여덟(자리는 열 — 꺼낸 것이 돌아올 자리) · 0 주문에 바구니가 미리 든 확률(한두 개)
  PER_BOARD: 3, BOARDS: 3, RETRY_GAP: 2,
  SURPRISE_COINS: 3, COIN_PER: 1, NOPEEK_RUN: 3, NOPEEK_COINS: 2,   // 깜짝 손님의 덤 · 문제 하나에 동전 · 걸음 ② 에서 점 무늬를 다시 안 보고 깨끗하게 연달아 셋이면 덤 둘
  REGULAR_FAST: .15,                            // 단골: 깨끗한 문제가 이어질 때 손님이 들어오는 시간이 줄어드는 몫(셋까지)
};
export const INTRO = ['wait', 'hurry', 'roll', 'surprise', 'quiet', 'regular'];   // 걸음 ② 의 처음 판들은 이 차례로 하나씩

const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const key = p => `${p.kind}${p.n}`;
export const same = (p, q) => !!p && !!q && key(p) === key(q);
/** 문제 하나: give { kind, n, pre } · left { kind, n, start } */
export const give = (n, pre = 0) => ({ kind: 'give', n, pre });
export const left = (n, start) => ({ kind: 'left', n, start });

/** 그 낱칸의 문제 풀(주문 · 남은 수). */
export function pool(id){ const c = CELLS[id]; if (!c) return []; if (c.zero) return [...range(0, 3).map(n => give(n)), ...range(0, 2).map(n => left(n, n + 1))]; return range(c.N[0], c.N[1]).map(n => give(n)); }

function evenly(list, n, rnd){ const out = []; while (out.length < n) out.push(...shuffle(list.slice(), rnd)); return out.slice(0, n); }
/** 같은 문제가 연달아 오지 않게 늘어놓는다(앞 문제 prev 와도). 아홉 개라 되짚어 찾는다. order = 'small' 이면 작은 수부터 · 'keep' 이면 지금 차례를 되도록 그대로. need(k, p) = k 번째 자리에 p 가 와도 되는가. */
function arrange(ps, prev, rnd, order, need = () => true){ const pick = ps.slice(), out = [];
  const go = last => { if (out.length === ps.length) return true; let cand = [...new Set(pick.map(key))].filter(k => !same({ kind: k.slice(0, 4), n: +k.slice(4) }, last) && need(out.length, { kind: k.slice(0, 4) })); cand = order === 'small' ? cand.sort((a, b) => +a.slice(4) - +b.slice(4)) : order === 'keep' ? cand.sort((a, b) => pick.findIndex(p => key(p) === a) - pick.findIndex(p => key(p) === b)) : shuffle(cand, rnd);
    for (const k of cand) { const i = pick.findIndex(p => key(p) === k), p = pick[i]; pick.splice(i, 1); out.push(p); if (go(p)) return true; out.pop(); pick.splice(i, 0, p); } return false; };
  return go(prev) ? out : null; }
/** 나들이 하나의 차례(문제 아홉). A02: 주문 1~5(3 · 4 · 5 가 일곱 이상). A05: 0 주문 넷 · 1~3 주문 둘 · 남은 수 셋(0 이 둘). 0 주문의 반쯤은 바구니에 한두 개가 미리 들어 있다. */
export function deal(id, history = [], rnd = Math.random, opt = {}){ const c = CELLS[id], n = T.PER_BOARD * T.BOARDS; if (!c) return [];
  let ps;
  if (c.zero) { const g = [0, 0, 0, 0, ...shuffle([1, 2, 3], rnd).slice(0, 2)].map(k => give(k, k === 0 && rnd() < T.PRELOAD_P ? 1 + Math.floor(rnd() * 2) : 0)), l = [0, 0, 1 + Math.floor(rnd() * 2)].map(k => left(k, Math.min(3, k + 1 + Math.floor(rnd() * (k < 2 ? 2 : 1))))); ps = [...g, ...l]; }
  else ps = [...evenly(range(c.big.N[0], c.big.N[1]), c.big.n, rnd), ...evenly(range(c.N[0], c.big.N[0] - 1), n - c.big.n, rnd)].map(k => give(k));
  return arrange(ps, history[history.length - 1] || null, rnd, opt.small ? 'small' : 'shuffle') || ps; }
/** 손으로 하는 판(걸음 ①)은 주문만 — 그 판 자리(start ~ start+2)의 「남은 수」를 뒤의 주문과 바꾼다(연달아 같은 문제가 생기면 다른 주문과). */
export function handFix(q, start){ const head = q.slice(0, start), rest = q.slice(start); if (rest.slice(0, T.PER_BOARD).every(p => p.kind === 'give')) return q.slice();
  const a = arrange(rest, head[head.length - 1] || null, Math.random, 'keep', (k, p) => k >= T.PER_BOARD || p.kind === 'give'); if (a) return [...head, ...a];
  const g = rest.filter(p => p.kind === 'give'), first = g.slice(0, T.PER_BOARD); while (first.length < Math.min(T.PER_BOARD, rest.length)) first.push(give(first.length % 2 ? 1 + (first.length % 3) : 0));   /* 주문이 모자라면 새 주문을 채운다(걸음 ① 은 주문만) */
  const others = rest.filter(p => !first.includes(p)); return [...head, ...first, ...others].slice(0, q.length); }   /* 주문 0 이 많아 연달아를 피할 수 없으면 「걸음 ① 은 주문만」을 앞세운다 */
/** 깨끗하지 못했던 문제를 「문제 둘을 사이에 두고」 다시(같은 주문 · 다른 손님 · 길이는 그대로). */
export function requeue(q, i){ for (let at = i + T.RETRY_GAP + 1; at < q.length; at++) { const a = q.slice(); a.splice(at, 0, { ...q[i], retry: true }); a.length = q.length;
    if (!same(a[at - 1], a[at]) && !same(a[at], a[at + 1])) return a; }   /* 넣은 자리의 둘레만 본다(앞쪽에 이미 있던 연달아 때문에 통째로 못 넣는 일이 없게) */
  return q.slice(); }

/** 고를 수 셋(남은 수): 0 · 1 · 2 를 섞는다(범위가 셋뿐). 다른 범위를 주면 답 · 1 차이 · 2 차이. */
export function cards(answer, lim = [0, 2], rnd = Math.random){ const [lo, hi] = lim, out = [answer], ok = x => x >= lo && x <= hi && !out.includes(x);
  for (const d of [1, 2]) { const c = shuffle([answer - d, answer + d], rnd).find(ok); if (c != null) out.push(c); }
  for (let d = 1; out.length < 3 && d < 20; d++) for (const x of [answer - d, answer + d]) if (out.length < 3 && ok(x)) out.push(x);
  return shuffle(out, rnd); }

/** 판정: 바구니 수 vs 주문 → 'fit' | 'short'(모자람 — 「더 줘」) | 'over'(많음 — 남는 것을 돌려보냄). 카드는 { pick, answer } → 'fit' | 'off'. */
export function judge(basket, order){ if (typeof basket === 'object') return basket.pick === basket.answer ? 'fit' : 'off'; return basket === order ? 'fit' : basket < order ? 'short' : 'over'; }
/** 깨끗한 문제 = 첫 종에 딱 맞음 · 물러난 카드 없음 · 길잡이 손이 뜨기 전 · 기다리다 가지 않음. 담았다 뺀 것 · 다시 본 것 · 다시 들은 것은 깨끗함 그대로. */
export const clean = r => !!r && !(r.short || r.over || r.retreat || r.hinted || r.missed);

/** 그 판의 사건. evBoards = 이 낱칸에서 앞서 사건이 붙은 판 수 · opt = { passed, calm, hand, voiced }.
 *  손으로 하는 판은 사건 없음. 처음 여섯 판은 INTRO 차례로 하나씩(기다리는 줄은 한 번 나온 뒤로 늘) · 그 뒤는 판마다 하나.
 *  작은 목소리는 통과한 뒤 · 소리가 날 때만. ?calm = 기다림 · 급한 손님 · 굴러가는 물건 · 작은 목소리 없음. 사건은 주문을 바꾸지 않는다. */
export function events(evBoards, rnd = Math.random, opt = {}){ const ev = { wait: false, hurry: false, roll: false, surprise: false, quiet: false, regular: true, intro: null };
  if (opt.hand) return { ...ev, none: true };
  const can = { wait: true, hurry: true, roll: true, surprise: true, quiet: !!opt.passed && !!opt.voiced, regular: true };
  if (evBoards < INTRO.length) { const k = INTRO[evBoards]; ev.intro = k; if (can[k]) ev[k] = true; if (evBoards > 0) ev.wait = true; }
  else { ev.wait = true; const w = [['hurry', T.HURRY_P], ['roll', T.ROLL_P], ['surprise', T.SURPRISE_P], ['quiet', can.quiet ? T.QUIET_P : 0]], sum = w.reduce((a, x) => a + x[1], 0), k = Math.max(1, sum); let r = rnd() * k;   /* 확률의 합이 1 을 넘으면 그 몫대로 나눈다 */
    for (const [name, p] of w) { if (r < p) { ev[name] = true; break; } r -= p; } }
  if (opt.calm) { ev.wait = false; ev.hurry = false; ev.roll = false; ev.quiet = false; }
  return ev; }
/** 기다림: 급한 손님이 가장 짧고 · 나들이 셋째 판이 조금 짧다. */
export const waitS = (board, hurry) => hurry ? T.HURRY_S : board >= T.BOARDS - 1 ? T.WAIT_LAST : T.WAIT_S;

/** 손님이 먹는 차례(남은 수): start 에서 하나씩 n 까지 → 먹는 번 수. */
export const eats = p => p.kind === 'left' ? p.start - p.n : 0;
/** 진열대 처음 개수(늘 SHELF) — 미리 든 것은 따로(꺼내면 빈 자리로 돌아온다). 진열대는 주문 + 3 이상. */
export const shelfN = () => T.SHELF;

/** 한 문제를 봇이 끝까지(하네스용): 담고 빼다가 종 → 「더 줘」 · 돌려보냄을 따라 고친다 · 카드. → { ok, bells, retreats } */
export function play(p, rnd = Math.random){ if (p.kind === 'left') { const cs = cards(p.n); let ls = cs.slice(), retreats = 0; while (ls.length) { const x = ls[Math.floor(rnd() * ls.length)]; if (judge({ pick: x, answer: p.n }) === 'fit') return { ok: true, retreats, cards: cs }; retreats++; ls = ls.filter(y => y !== x); } return { ok: false }; }
  let b = p.pre, shelf = T.SHELF, bells = 0; for (let g = 0; g < 50; g++) { const want = Math.floor(rnd() * (T.SHELF + 1)); while (b < want && shelf > 0) { b++; shelf--; } while (b > want) { b--; shelf++; } bells++; const j = judge(b, p.n);
    if (j === 'fit') return { ok: shelf >= 0 && shelf + b === T.SHELF + p.pre, bells }; if (j === 'over') { shelf += b - p.n; b = p.n; return { ok: shelf + b === T.SHELF + p.pre, bells }; } }
  return { ok: false, bells }; }
