/* 타고 내리기 틀 「들락날락 동물 집」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/T08_타고내리기_틀.md · 정본 27 문서 4 · 5절(5-9 · 5-10 · 5-11).
 * 손: 일어난 일을 지켜본 뒤(손은 쉰다) → 수 카드 · 딱지를 눌러 적고 → 문(종)을 눌러 연다. 동물에는 손을 대지 않는다.
 * 이번 묶음 = 덧셈 한 줄: B06 덧셈 이야기(말로 — 기호 없음) · B07 덧셈식 읽고 쓰기(기호가 처음) · B08 덧셈(합 5까지 · 가려진 채 답하기) · B09 덧셈(합 9까지).
 *   문제 = { cell, a(처음 수), b(더 온 수), sum, kind: 'join' 더 들어감 | 'merge' 양쪽에서 모임, key }
 * 0 이 든 문제 · 뺄셈 · 세 수 · 비교는 내지 않는다(B10~ 의 몫). 뒤 묶음(나오기 B11~B14 · 0 과 섞기 B10 · B15 · B16)은 낱칸 표에 줄만 더하면 되게 방향(dir)을 받게만 둔다. */
import { eun, wa, UNIT, plusRead, sumRead } from '../common/say.js?v=4';

// ── 낱칸 표(설계서 그대로 · low = 아홉 문제 가운데 합이 5까지인 문제 수 · top = 화면에 나올 수 있는 가장 큰 수)
export const CELLS = {
  B06: { mode: 'story', lim: [1, 8], sum: [3, 9], low: 4, top: 9, dir: 'in' },   // 덧셈 이야기 — 합 5까지가 아홉 중 넷
  B07: { mode: 'write', lim: [1, 8], sum: [2, 9], low: 3, top: 9, dir: 'in' },   // 덧셈식 읽고 쓰기 — 합 5까지가 아홉 중 셋(코드가 정함)
  B08: { mode: 'sum', lim: [1, 4], sum: [2, 5], low: 9, top: 5, dir: 'in' },     // 덧셈 (합 5까지) — 열 가지 가운데 아홉
  B09: { mode: 'sum', lim: [1, 8], sum: [2, 9], low: 2, top: 9, dir: 'in' },     // 덧셈 (합 9까지) — 합 6~9 가 아홉 중 일곱
};
export const IDS = Object.keys(CELLS);
export const KINDS = ['join', 'merge'];
export const LOW = 5;   /* 「합 5까지」의 금 */

// ── 내가 정한 수치(T08 설계 기본안 — 준호가 반에서 보고 바꾼다)
export const T = {
  DUSK_S: { B06: 22, B07: 26, B08: 16, B09: 20 }, DUSK_LAST: .8,     // 해가 다 지기까지(적는 동안에만 가는 초) · 나들이 셋째 판은 × .8
  WALK_S: .7, RUSH_P: .3, WIND_P: .3, SURPRISE_P: .25, BLIND_P: .3,  // 한 마리가 들어가는 사이(초) · 우르르 · 바람 · 방울 단 손님 · 닫힌 덧문/식 먼저(통과 뒤)
  EXPR_FIRST: 3, STREAK: 3, HINT_AFTER: 6,                           // 걸음 ② 판에서 「식 먼저」인 문제(셋째) · 신바람 · 길잡이 손(초)
  PER_BOARD: 3, BOARDS: 3, RETRY_GAP: 2, SURPRISE_COINS: 3, COIN_PER: 1,
  /* 장면의 박자(코드가 정함): 서 있는 동안 · 서 있다 문까지 · 길에서 문까지 · 길에서 설 자리까지 · 우르르의 사이 · 무리 사이 쉼 · 「식 먼저」의 빠르기 · 바람에 굴러가 있는 동안(초) */
  HOLD_S: 1.7, IN_S: .9, LANE_S: 1.7, COME_S: 1.3, RUSH_GAP: .1, RUSH_HOLD: .6, PAUSE_S: .6, FAST: .45, WIND_S: 3,
};
export const INTRO = ['dusk', 'rush', 'wind', 'surprise', 'blind', 'streak'];   // 걸음 ② 의 처음 판들은 이 차례로 하나씩

const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick1 = (a, rnd) => a[Math.floor(rnd() * a.length)];
const run = (a, n) => { let r = 1; for (let i = 1; i < a.length; i++) { r = a[i] === a[i - 1] ? r + 1 : 1; if (r >= n) return true; } return false; };

/** 같은 문제 = 같은 (a, b). twin = 차례만 바꾼 것까지(3 + 2 와 2 + 3 — 연달아 내지 않는다). */
export const keyOf = (a, b) => a + '+' + b;
export const same = (p, q) => !!p && !!q && p.a === q.a && p.b === q.b;
export const twin = (p, q) => !!p && !!q && ((p.a === q.a && p.b === q.b) || (p.a === q.b && p.b === q.a));
/** 그 낱칸의 (a, b) 짝 모두 · 풀 = 짝 × 장면 둘. 표에 없는 낱칸은 빈 풀. */
export function pairs(id){ const c = CELLS[id]; if (!c) return []; const out = []; for (let a = c.lim[0]; a <= c.lim[1]; a++) for (let b = c.lim[0]; b <= c.lim[1]; b++) if (a + b >= c.sum[0] && a + b <= c.sum[1]) out.push([a, b]); return out; }
export function pool(id){ return pairs(id).flatMap(([a, b]) => KINDS.map(kind => ({ a, b, kind }))); }
export const make = (id, a, b, kind) => ({ cell: id, a, b, sum: a + b, kind, key: keyOf(a, b) });

/** 나들이 하나(문제 아홉). history = 앞 나들이(같은 (a, b) 연달아 · 같은 합 셋 연달아를 이어서 본다).
 *  낱칸의 비율(합 5까지 low 문제 · 나머지는 합 6~9) · 한 나들이에 같은 (a, b) 두 번 없음 · 장면 둘을 고르게(넷과 다섯 · 같은 장면 넷 연달아 없음).
 *  opt.small = 막혔을 때 합이 작은 문제부터. */
export function deal(id, history = [], rnd = Math.random, opt = {}){ const c = CELLS[id]; if (!c) return [];
  const all = pairs(id), lows = all.filter(([a, b]) => a + b <= LOW), highs = all.filter(([a, b]) => a + b > LOW), n = T.PER_BOARD * T.BOARDS, nLow = Math.min(c.low, n);
  const prev = history[history.length - 1], prevSums = history.slice(-2).map(p => p.sum), prevKinds = history.slice(-3).map(p => p.kind);
  for (let g = 0; g < 600; g++) { let set = [...shuffle(lows.slice(), rnd).slice(0, nLow), ...shuffle(highs.slice(), rnd).slice(0, n - nLow)]; if (set.length !== n) return [];
    let order = shuffle(set, rnd); if (opt.small) order = order.map(s => [s, s[0] + s[1] + rnd() * (g < 400 ? 1.6 : 2.6)]).sort((x, y) => x[1] - y[1]).map(x => x[0]);
    const nJ = 4 + Math.floor(rnd() * 2), kinds = shuffle([...Array(nJ).fill('join'), ...Array(n - nJ).fill('merge')], rnd);
    const q = order.map(([a, b], k) => make(id, a, b, kinds[k]));
    if (twin(prev, q[0])) continue; let bad = false; for (let k = 1; k < n; k++) if (twin(q[k - 1], q[k])) bad = true; if (bad) continue;
    if (run([...prevSums, ...q.map(p => p.sum)], 3)) continue; if (run([...prevKinds, ...kinds], 4)) continue;
    return q; }
  return []; }
/** 깨끗하지 못했던 문제를 「문제 둘을 사이에 두고」 다시(같은 a · b · 다른 장면 꼴) — 밀어 넣지 않고 뒤의 문제 하나와 바꾼다.
 *  마지막 문제(아홉째)는 바꾸지 않는다 · 이미 다시 낸 자리는 건너뜀 · 앞뒤로 같은 문제(차례만 바꾼 것 포함) · 같은 합 셋 연달아가 되지 않게 ·
 *  낱칸의 비율(합 5까지 / 6~9)이 무너지지 않게 같은 쪽 문제와 먼저 바꾼다(그런 자리가 없으면 비율보다 다시 내기를 앞세운다). 자리가 없으면 다시 내지 않는다.
 *  사건 꼴(「식 먼저」 · 방울 · 바람)은 문제에 붙지 않고 판의 자리에 붙는다 — 다시 낸 문제는 들고 가지 않는다. */
/** 바꾼 자리 at 를 지나는 「같은 합 셋 연달아」가 생겼는가(앞뒤에 이미 있던 연달아 때문에 다시 낼 자리를 놓치지 않게 — 그 자리를 지나는 것만 본다). */
const runAt = (a, at) => { for (let s = Math.max(0, at - 2); s <= at && s + 2 < a.length; s++) if (a[s].sum === a[s + 1].sum && a[s + 1].sum === a[s + 2].sum) return true; return false; };
export function requeue(q, i, rnd = Math.random){ const p = q[i]; if (!p || !CELLS[p.cell]) return q.slice();
  const lowOf = x => x.sum <= LOW, kind = p.kind === 'join' ? 'merge' : 'join';
  for (const strict of [true, false]) for (let at = i + T.RETRY_GAP + 1; at < q.length; at++) { if (q[at].retry) continue;   /* 아홉째 자리도 쓴다(큰 집 · 식 먼저는 자리에 붙어 따라가지 않는다) — 여섯째까지는 늘 그 나들이에서 다시 */ if (strict && lowOf(q[at]) !== lowOf(p)) continue;
    const a = q.slice(); a[at] = { ...make(p.cell, p.a, p.b, kind), retry: true };
    if (twin(a[at - 1], a[at]) || twin(a[at], a[at + 1])) continue; if (runAt(a, at)) continue;
    return a; }
  if (i <= q.length - 1 - T.RETRY_GAP - 1) { const at = q.length - 1, a = q.slice(); a[at] = { ...make(p.cell, p.a, p.b, kind), retry: true }; if (!twin(a[at - 1], a[at])) return a; if (twin(q[at - 1], p)) { const c = q.slice(); c[at - 1] = { ...q[at - 1], retry: true }; return c; } }   /* 여섯째까지는 못 박는다: 자리가 없으면 아홉째와(같은 합 셋 연달아는 눈감음) · 여덟째가 이미 그 짝(차례만 바뀐)이면 그것이 다시 냄 */
  return q.slice(); }

/** 이 나들이에서 다시 낼 자리가 없던 문제(일곱째~아홉째)를 다음 나들이에 넣는다: 둘째 자리(안 되면 셋째) 문제와 바꾼다 · 앞뒤로 같은 문제(차례만 바꾼 것 포함) · 같은 합 셋 연달아가 되지 않게. carry = [문제…](둘까지). */
export function carryIn(q, carry = []){ const a = q.slice(); let used = 0;
  for (const p of carry.slice(0, 2)) for (const at of [1, 2, 3]) { if (at >= a.length || a[at].retry) continue; const b = a.slice(); b[at] = { ...make(p.cell, p.a, p.b, p.kind === 'join' ? 'merge' : 'join'), retry: true, carried: true };
    if (twin(b[at - 1], b[at]) || twin(b[at], b[at + 1])) continue; if (runAt(b, at)) continue; a.splice(0, a.length, ...b); used++; break; }
  return a; }

// ── 고르는 것
const inTop = (id, v) => Number.isInteger(v) && v >= 1 && v <= CELLS[id].top;
/** 그 칸의 답: slot = 'a' 처음 · 'b' 온 수 · 'sum' 모두. */
export const answer = (p, slot) => (slot === 'a' ? p.a : slot === 'b' ? p.b : p.sum);
/** 수 카드 셋: 답 · 답과 1 차이 나는 수 · 그 문제에 보이는 다른 수(더하지 않고 본 수를 그대로 고르는 흔한 잘못). 겹치거나 범위를 벗어나면 가까운 수로. 0 은 없다. */
export function cards(p, slot = 'sum', rnd = Math.random){ const id = p.cell, ans = answer(p, slot), out = [ans], ok = v => inTop(id, v) && !out.includes(v);
  const near = shuffle([ans - 1, ans + 1], rnd).filter(ok); if (near.length) out.push(near[0]);
  const seen = shuffle((slot === 'sum' ? [p.a, p.b] : slot === 'a' ? [p.b] : [p.a]).slice(), rnd).filter(ok); if (seen.length) out.push(seen[0]);
  for (let d = 1; out.length < 3 && d < 10; d++) for (const v of shuffle([ans - d, ans + d], rnd)) if (out.length < 3 && ok(v)) out.push(v);
  return shuffle(out, rnd); }
/** 딱지(B07): 수 딱지 넷(a · b · a + b · 가까운 수 하나) + 걸음 ② 는 기호 딱지 둘('+' · '='). 「−」 는 없다.
 *  가까운 수는 다른 참인 식을 지을 수 없는 수로 고른다(1 · 2 · 3 에 4 를 주면 1 + 3 = 4 가 지어진다). 수는 섞고 기호는 오른쪽 끝에 둔다. */
export function tiles(p, step = 2, rnd = Math.random){ const { a, b, sum } = p, has = [a, b, sum], free = v => inTop(p.cell, v) && !has.includes(v);
  const safe = v => { if (!free(v)) return false; const t = [a, b, sum, v]; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) if (i !== j && i !== k && j !== k && t[i] + t[j] === t[k] && (i === 3 || j === 3 || k === 3)) return false; return true; };
  const nearOf = v => has.some(h => Math.abs(h - v) === 1), dist = v => Math.min(...has.map(h => Math.abs(h - v))); let cand = [];
  for (const f of [v => safe(v) && nearOf(v), v => safe(v), v => free(v)]) { cand = []; for (let v = 1; v <= CELLS[p.cell].top; v++) if (f(v)) cand.push(v); if (cand.length) { const d0 = Math.min(...cand.map(dist)); cand = cand.filter(v => dist(v) === d0); break; } }   /* 가까운 수가 없으면 세 수와 가장 가까운 수(1 + 3 에 9 가 아니라 5 · 6) */
  const nums = shuffle([a, b, sum, pick1(cand, rnd)], rnd); return step >= 2 ? [...nums, '+', '='] : nums; }
/** 맞는 것으로 받는 꼴들(B07): 걸음 ① 은 `□ + □ = □` 의 수 셋 · 걸음 ② 는 다섯 칸. `2 + 3 = 5` · `5 = 3 + 2` 도 참이고 장면의 세 수를 다 썼다. */
export function forms(p, n){ const { a, b, sum } = p; return n === 3 ? [[a, b, sum], [b, a, sum]] : [[a, '+', b, '=', sum], [b, '+', a, '=', sum], [sum, '=', a, '+', b], [sum, '=', b, '+', a]]; }
/** 판정 → { res: 'fit' | 'off', at, bad } — at = 맞지 않는 첫 칸 · bad = 통으로(카드로) 돌아갈 칸들.
 *  B06 이야기(written = [처음, 온 수(, 모두)]): 칸마다 따로 본다 · B07 식(수 셋 또는 다섯 칸): 가장 가깝게 맞는 꼴에 견줘 맞지 않는 첫 칸부터 뒤 · B08 · B09(written = [답]). */
export function judge(written, p){ const c = CELLS[p.cell], w = written || [];
  if (c.mode === 'story') { const want = [p.a, p.b, p.sum].slice(0, Math.max(2, w.length)), bad = want.map((v, k) => (w[k] === v ? -1 : k)).filter(k => k >= 0); return { res: bad.length ? 'off' : 'fit', at: bad.length ? bad[0] : -1, bad }; }
  if (c.mode === 'write') { let at = -1, fit = false; for (const f of forms(p, w.length === 3 ? 3 : 5)) { let k = 0; while (k < f.length && w[k] === f[k]) k++; if (k === f.length) fit = true; at = Math.max(at, k); }
    if (fit) return { res: 'fit', at: -1, bad: [] }; const n = w.length === 3 ? 3 : 5, bad = []; for (let k = at; k < n; k++) bad.push(k); return { res: 'off', at, bad }; }
  const fit = w[0] === p.sum; return { res: fit ? 'fit' : 'off', at: fit ? -1 : 0, bad: fit ? [] : [0] }; }
/** 깨끗한 문제 = 문(종)을 눌렀는데 돌아간 수 · 딱지 · 물러난 문패가 없었고(back) · 길잡이 손이 뜨기 전이고(hinted) · 해가 다 지지 않았다(missed).
 *  장면을 다시 본 것 · 문을 열기 전에 고쳐 건 것 · 지켜보는 동안의 헛누름 · 바람에 굴러간 것을 잡은 것은 깨끗함 그대로. */
export const clean = r => !!r && !(r.back || r.hinted || r.missed);

// ── 띠의 말 · 식 · 읽는 말(토씨 · 단위는 say.js)
const U = UNIT.fish;   /* 「마리」 */
const show = v => (v == null ? '?' : v);
/** 띠의 말 조각: filled = { a, b, sum } — 값이 있으면 그 수 · '?' 면 빈칸 · 열쇠가 없으면 그 마디는 아직 안 나옴. → [{ slot, pre, v, post }] */
export function storyParts(p, filled = {}){ const out = [], has = k => Object.prototype.hasOwnProperty.call(filled, k);
  if (has('a')) out.push({ slot: 'a', pre: p.kind === 'merge' ? '왼쪽에서 ' : '', v: filled.a, post: p.kind === 'merge' ? `${U},` : `${U}가 있었는데` });
  if (has('b')) out.push({ slot: 'b', pre: p.kind === 'merge' ? '오른쪽에서 ' : '', v: filled.b, post: p.kind === 'merge' ? `${U}가 들어갔어요` : `${U}가 더 들어갔어요` });
  if (has('sum')) out.push({ slot: 'sum', pre: '모두 ', v: filled.sum, post: U });
  return out; }
/** 띠의 말 한 줄: 「3마리가 있었는데 2마리가 더 들어갔어요」 · 「왼쪽에서 3마리, 오른쪽에서 2마리가 들어갔어요」 · 「모두 5마리」. filled 를 안 주면 다 채운 말. */
export function story(p, filled){ const f = filled || { a: p.a, b: p.b }; return storyParts(p, f).map(x => x.pre + show(x.v) + x.post).join(' '); }
export const total = (p, v) => `모두 ${show(v === undefined ? p.sum : v)}${U}`;
/** 띠의 식 조각(B07 부터): upto = 장면을 따라 적힌 데까지(1 = a · 2 = a + b · 3 = a + b = □) · sum = 답 칸의 값('?' 이면 빈칸). */
export function exprParts(p, f = {}){ const upto = f.upto == null ? 3 : f.upto, out = [{ v: p.a }]; if (upto >= 2) out.push({ op: '+' }, { v: p.b }); if (upto >= 3) out.push({ op: '=' }, { slot: 'sum', v: f.sum === undefined ? p.sum : f.sum }); return out; }
export function expr(p, f){ return exprParts(p, f).map(x => (x.op ? x.op : show(x.v))).join(' '); }
/** 읽는 말: k 가 짝수면 「3 더하기 2는 5와 같습니다」 · 홀수면 「3과 2의 합은 5입니다」(번갈아). written = 아이가 지은 식(그대로 읽는다 — `2 + 3 = 5` · `5 = 3 + 2`). */
export function read(p, k = 0, written = null){ let x = p.a, y = p.b, rev = false; const w = written || [];
  if (w.length === 3) { x = w[0]; y = w[1]; } else if (w.length === 5) { if (w[1] === '=') { rev = true; x = w[2]; y = w[4]; } else { x = w[0]; y = w[2]; } }
  if (k % 2) return sumRead(x, y, p.sum); return rev ? `${p.sum}${eun(p.sum)} ${x} 더하기 ${y}${wa(y)} 같습니다` : plusRead(x, y, p.sum); }

// ── 장면: 동물마다 { i, g(무리 a · b), from(yard 마당 · left · right 길), show(길에 나타나는 때), stand(마당에 서는 때 — 없으면 null), go(문으로 떠나는 때), enter(들어가는 때) }
/** 더 들어감(join): 마당의 a 마리가 한 마리씩 들어간다(문 닫힘) → 길에서 b 마리가 한 마리씩 와서 더 들어간다.
 *  양쪽에서 모임(merge): 왼쪽 길에서 a 마리 · 오른쪽 길에서 b 마리가 와서 마당 양쪽에 섰다가 번갈아 같이 들어간다.
 *  event.rush = 우르르(온 무리가 한꺼번에) · event.side = 온 무리의 길(join) · event.fast = 「식 먼저」의 빠른 장면. 사건은 수를 바꾸지 않는다.
 *  → { list, tA(처음 무리를 적는 때), tB(온 무리를 적는 때), end, n } — 어느 때든 「집 안 + 마당 + 길 위 = a + b」(where). 다시 보기는 같은 것을 그대로 다시 돌린다. */
export function scene(p, event = {}, rnd = Math.random){ const W = T.WALK_S, list = [], rush = !!event.rush; let tA = 0, tB = 0, end = 0;
  if (p.kind === 'join') { const side = event.side || (rnd() < .5 ? 'left' : 'right'); let t = T.HOLD_S;
    for (let i = 0; i < p.a; i++) { const go = t + i * W * .6; list.push({ i, g: 'a', k: i, from: 'yard', show: 0, stand: 0, go, enter: go + T.IN_S }); }
    tA = T.HOLD_S * .4; t = list[list.length - 1].enter + T.PAUSE_S;
    for (let j = 0; j < p.b; j++) { const go = t + j * (rush ? T.RUSH_GAP : W); list.push({ i: p.a + j, g: 'b', k: j, from: side, show: go, stand: null, go, enter: go + T.LANE_S * (rush ? .7 : 1) }); }
    tB = list[list.length - 1].enter; end = tB + .5; }
  else { for (let i = 0; i < p.a; i++) list.push({ i, g: 'a', k: i, from: 'left', show: i * .12, stand: i * .12 + T.COME_S });
    for (let j = 0; j < p.b; j++) list.push({ i: p.a + j, g: 'b', k: j, from: 'right', show: j * .12, stand: j * .12 + T.COME_S });
    const t = Math.max(...list.map(x => x.stand)) + (rush ? T.RUSH_HOLD : T.HOLD_S), order = []; for (let k = 0; k < Math.max(p.a, p.b); k++) { if (k < p.a) order.push(k); if (k < p.b) order.push(p.a + k); }
    order.forEach((i, n) => { const go = t + n * (rush ? T.RUSH_GAP : W * .5); list[i].go = go; list[i].enter = go + T.IN_S; });
    tA = T.COME_S + .2; tB = Math.max(...list.map(x => x.enter)); end = tB + .5; }
  const k = event.fast ? T.FAST : 1; if (k !== 1) { for (const x of list) { x.show *= k; if (x.stand != null) x.stand *= k; x.go *= k; x.enter *= k; } tA *= k; tB *= k; end *= k; }
  const ord = list.slice().sort((x, y) => x.enter - y.enter || x.i - y.i); ord.forEach((x, n) => { x.rank = n; });   /* 들어간 차례(창의 머리 자리) */
  return { list, tA, tB, end, n: list.length, rush, fast: !!event.fast, kind: p.kind }; }
/** 그때 한 마리가 있는 곳: road 길 위 · yard 마당 · in 집 안. */
export const stateAt = (x, t) => (t >= x.enter ? 'in' : x.stand != null && t >= x.stand ? 'yard' : 'road');
export function where(sc, t){ const o = { in: 0, yard: 0, road: 0 }; for (const x of sc.list) o[stateAt(x, t)]++; return o; }

// ── 사건
/** 그 판의 사건. evBoards = 이 낱칸에서 앞서 사건이 붙은 판 수 · opt = { cell, passed, calm, hand, blindShown }.
 *  손으로 하는 판(걸음 ①)은 사건 없음. 처음 판들은 INTRO 차례로 하나씩(해 질 녘은 한 번 나온 뒤로 늘) · 그 뒤는 판마다 하나.
 *  닫힌 덧문 · 식 먼저(blind)는 통과한 뒤만 — 통과 전에는 그 차례를 건너뛰고, 통과한 뒤 첫 사건 판에 한 번 보여 준다(blindShown). 바람은 B06 에 없다(굴러갈 딱지 · 문패가 없다).
 *  ?calm = 해 질 녘 · 우르르 · 바람 없음(가려진 집 · 식 먼저 · 방울은 남는다). 사건은 수를 바꾸지 않는다. */
export function events(evBoards, rnd = Math.random, opt = {}){ const ev = { dusk: false, rush: false, wind: false, surprise: false, blind: false, streak: true, intro: null };
  if (opt.hand) return { ...ev, none: true };
  const noWind = opt.cell && CELLS[opt.cell] && CELLS[opt.cell].mode === 'story', list = INTRO.filter(k => k !== 'blind' && !(noWind && k === 'wind')), i = evBoards - (opt.blindShown ? 1 : 0);
  /* 판마다 깜짝 하나: 몫(.3 : .3 : .25 : .3)대로 꼭 하나 고른다(몫의 합이 1 보다 작아도 빈 판이 없게) */
  const one = () => { const w = [['rush', T.RUSH_P], ['wind', noWind ? 0 : T.WIND_P], ['surprise', T.SURPRISE_P], ['blind', opt.passed ? T.BLIND_P : 0]], sum = w.reduce((a, x) => a + x[1], 0); let r = rnd() * sum;
    for (const [name, pr] of w) { if (pr > 0 && r < pr) { ev[name] = true; return; } r -= pr; } const last = w.filter(x => x[1] > 0).pop(); ev[last[0]] = true; };
  if (opt.passed && !opt.blindShown && evBoards > 0) { ev.intro = 'blind'; ev.blind = true; ev.dusk = true; }
  else if (i < list.length) { const k = list[i]; ev.intro = k; ev[k] = true; if (evBoards > 0) ev.dusk = true; if (k === 'streak') one(); }   /* 신바람 판에도 깜짝 하나 */
  else { ev.dusk = true; one(); }
  if (opt.calm) { ev.dusk = false; ev.rush = false; ev.wind = false; }
  return ev; }
/** 해가 다 지기까지(초): 나들이 셋째 판이 조금 빠르다. */
export const duskS = (id, board) => (T.DUSK_S[id] || T.DUSK_S.B08) * (board >= T.BOARDS - 1 ? T.DUSK_LAST : 1);
/** 「식 먼저」인가: B08 · B09 의 걸음 ② 판 셋째 문제 · 통과 뒤 닫힌 판(blind)은 셋 모두. 문제가 아니라 판의 자리에 붙는다. */
export const exprFirst = (id, step, j, ev = {}) => !!CELLS[id] && CELLS[id].mode === 'sum' && step === 2 && (!!ev.blind || j === T.EXPR_FIRST - 1);
/** 방울 단 손님: 어느 한 마리(답과 상관없이). */
export const bellAt = (p, rnd = Math.random) => Math.floor(rnd() * (p.a + p.b));
/** 사건을 입힌 문제(하네스가 「사건이 수를 바꾸지 않음」을 본다): 꾸밈만 더하고 수 · 장면 꼴은 그대로. */
export const dress = (p, ev, rnd = Math.random) => ({ ...p, bell: ev.surprise ? bellAt(p, rnd) : -1, rush: !!ev.rush, wind: !!ev.wind });

/** 마당에 나와 서는 자리(정본 5-10절 — 다섯씩 한 줄 · 윗줄 다섯 + 아랫줄): k 번째 → { row, col, gap } — gap = 처음 무리와 온 무리 사이의 틈이 앞에 있는가(같은 줄에서 갈릴 때만). */
export const spot = (k, a) => ({ row: Math.floor(k / 5), col: k % 5, gap: k >= a && a % 5 !== 0 && Math.floor(k / 5) === Math.floor(a / 5) });

/** 한 문제를 봇이 끝까지(하네스용): 아무 수나 적고 문(종)을 누른다 → 돌아간 칸만 다시. → { ok, tries } */
export function play(p, step = 2, rnd = Math.random){ const c = CELLS[p.cell]; let tries = 0;
  if (c.mode === 'write') { const pile = tiles(p, step, rnd), n = step >= 2 ? 5 : 3; let w = Array(n).fill(null);
    for (let g = 0; g < 60; g++) { const left = pile.slice(); for (const v of w) if (v != null) left.splice(left.indexOf(v), 1); for (let k = 0; k < n; k++) if (w[k] == null) { const fm = forms(p, n).find(f => w.every((x, m) => x == null || x === f[m])), f = g < 2 || !fm ? null : fm[k], v = f != null && left.includes(f) ? f : pick1(left.filter(x => (n === 3 ? typeof x === 'number' : true)), rnd); w[k] = v; left.splice(left.indexOf(v), 1); }
      tries++; const j = judge(w, p); if (j.res === 'fit') return { ok: true, tries, w }; for (const k of j.bad) w[k] = null; }
    return { ok: false, tries }; }
  const slots = c.mode === 'story' ? ['a', 'b'] : ['sum'], w = slots.map(() => null), out = slots.map(() => []);
  for (let g = 0; g < 12; g++) { slots.forEach((s, k) => { if (w[k] == null) { const cs = cards(p, s, rnd).filter(v => !out[k].includes(v)); w[k] = pick1(cs, rnd); } }); tries++; const j = judge(w, p); if (j.res === 'fit') return { ok: true, tries, w }; for (const k of j.bad) { out[k].push(w[k]); w[k] = null; } }
  return { ok: false, tries }; }
