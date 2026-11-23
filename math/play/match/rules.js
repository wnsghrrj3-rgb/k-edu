/* 짝 잇기 틀 「창고 문 열어 주기」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/T05_짝잇기_틀.md · 정본 27 문서 4 · 5절(5-9 · 5-10 · 5-11).
 * 이 틀이 숫자 읽기를 배우는 곳이다. 손: 쟁반에서 문으로 밧줄 한 줄 = 문제 하나. 묻는 것은 「같은 수 잇기」 하나뿐(덧셈 · 뺄셈 · 비교 · 다음 수 없음).
 *   ga(가) 세고 → 숫자 찾기: 쟁반 하나 · 문 셋(숫자가 서로 다름)      na(나) 읽고 → 개수 찾기: 문 하나 · 쟁반 셋(물고기 수가 서로 다름)
 * 걸음 ① 점 보고 잇기(문패 = 숫자 + 점 · (가) 만 · 통과에 안 셈) → 걸음 ② 숫자만 보고 잇기((가) 다섯 + (나) 넷 · 통과는 여기서만). */

// ── 낱칸 표(C07 · D02 · H02 · K02 는 묶음 모형이 따로 필요해 이번에 만들지 않는다 — 낱칸 번호로 풀을 받게만)
export const CELLS = {
  A03: { n: [1, 5], range: [1, 5], twin: [[2, 5]], rows: false },   // 숫자 읽기 — 1~5 가 모두 한 번 이상 · 1 은 아홉 중 한 번
  A07: { n: [6, 9], range: [6, 9], twin: [[6, 9]], rows: true },    // 9까지 숫자 읽기 — 6~9 가 저마다 둘 이상 · 쟁반은 다섯씩 한 줄
};
export const IDS = Object.keys(CELLS);

// ── 내가 정한 수치(T05 설계 기본안 — 준호가 반에서 보고 바꾼다)
export const T = {
  CLOSE_S: { A03: 16, A07: 20 }, CLOSE_LAST: { A03: 13, A07: 16 },   // 문이 다 닫히기까지(생각하는 동안에만 가는 초) · 나들이 셋째 판
  AJAR: 28,                                                           // 처음 열린 각도(도)
  PEEK_P: .3, FLIP_P: .3, SURPRISE_P: .25, CHALK_P: .3,               // 판마다 사건 하나를 뽑을 확률(분필 문패는 통과한 뒤 · 합이 1 을 넘으면 몫대로)
  TWIN_P: { A03: .5, A07: 1 },                                        // 헷갈리는 짝을 같이 낼 확률(2 ↔ 5 · 6 ↔ 9)
  STREAK: 3, HINT_AFTER: 7, DROP_R: 80, EAT_GAP: .45,                 // 문 여는 가락 · 길잡이 손(초) · 놓는 반경(px) · 한 마리 먹는 사이(초)
  PER_BOARD: 3, BOARDS: 3, RETRY_GAP: 2,
  GA: 5, NA: 4,                                                       // 걸음 ② 나들이 하나의 (가) · (나) 수
  SURPRISE_COINS: 3, COIN_PER: 1,                                     // 깜짝 쟁반의 덤 · 문제 하나에 동전(코드가 정함 — 담아 주기 틀과 같게)
};
export const INTRO = ['close', 'peek', 'flip', 'surprise', 'chalk', 'tune'];   // 걸음 ② 의 처음 판들은 이 차례로 하나씩

const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/** 같은 문제 = 같은 답(같은 n 연달아 없음 — 방향이 달라도). */
export const key = p => `${p.dir}${p.n}`;
export const same = (p, q) => !!p && !!q && p.n === q.n;

/** 그 낱칸의 답 풀(n 들). */
export function pool(id){ const c = CELLS[id]; return c ? range(c.n[0], c.n[1]) : []; }
/** 답 n 들 아홉: A03 = 1 하나 + 2~5 둘씩 · A07 = 6~9 둘씩 + 하나 더(고르게). */
function picks(id, rnd){ const c = CELLS[id], ns = pool(id), n = T.PER_BOARD * T.BOARDS;
  if (id === 'A03') return [1, ...[2, 3, 4, 5].flatMap(k => [k, k])];
  const out = ns.flatMap(k => [k, k]); while (out.length < n) out.push(ns[Math.floor(rnd() * ns.length)]); return out.slice(0, n); }
/** 같은 n 이 연달아 오지 않게(앞 나들이 끝 prev 와도). order: 'shuffle' | 'small'(작은 수부터). 되짚어 찾는다. */
function arrange(ns, prev, rnd, order){ const pick = ns.slice(), out = [];
  const go = last => { if (out.length === ns.length) return true; let cand = [...new Set(pick)].filter(k => k !== last); cand = order === 'small' ? cand.sort((a, b) => a - b) : shuffle(cand, rnd);
    for (const k of cand) { const i = pick.indexOf(k); pick.splice(i, 1); out.push(k); if (go(k)) return true; out.pop(); pick.splice(i, 0, k); } return false; };
  return go(prev) ? out : ns.slice(); }
/** 방향 아홉: (가) GA · (나) NA · 판마다 둘이 다 있음 · 같은 방향 넷 연달아 없음(앞 나들이 끝과도). */
export function dirs(rnd = Math.random, prev = []){ for (let g = 0; g < 200; g++) { const counts = shuffle([2, 2, 1], rnd), out = [];
    for (const c of counts) out.push(...shuffle([...Array(c).fill('ga'), ...Array(T.PER_BOARD - c).fill('na')], rnd));
    if (out.filter(d => d === 'ga').length !== T.GA) continue; const all = [...prev.slice(-3), ...out]; let run = 1, bad = false; for (let k = 1; k < all.length; k++) { run = all[k] === all[k - 1] ? run + 1 : 1; if (run >= 4) bad = true; } if (!bad) return out; }
  return ['ga', 'na', 'ga', 'na', 'ga', 'na', 'ga', 'na', 'ga']; }

/** 같이 보일 수 둘: 범위 안 · 답과 다름 · 서로 다름. 헷갈리는 짝이 먼저(A07 6 ↔ 9 는 꼭 · A03 2 ↔ 5 는 TWIN_P) → 답과 1 차이 → 범위 안의 다른 수. */
export function others(n, id, rnd = Math.random){ const c = CELLS[id], [lo, hi] = c.range, out = [], ok = x => x >= lo && x <= hi && x !== n && !out.includes(x);
  for (const [a, b] of c.twin) { const tw = n === a ? b : n === b ? a : null; if (tw != null && ok(tw) && rnd() < T.TWIN_P[id]) out.push(tw); }
  const near = shuffle([n - 1, n + 1], rnd).filter(ok); if (near.length && out.length < 2) out.push(near[0]);
  const rest = shuffle(range(lo, hi).filter(ok), rnd); while (out.length < 2 && rest.length) { const x = rest.shift(); if (ok(x)) out.push(x); }
  return out; }
/** 답의 자리(0~2): 같은 자리 셋 연달아 없음. history = 앞 문제들의 답 자리. */
export function seats(rnd = Math.random, history = []){ const a = history[history.length - 1], b = history[history.length - 2]; let s; for (let g = 0; g < 20; g++) { s = Math.floor(rnd() * 3); if (!(a === s && b === s)) break; } if (a === s && b === s) s = (s + 1) % 3; return s; }
/** 문제 하나를 채운다: set = 자리 차례의 수 셋(가 = 문패 · 나 = 쟁반 물고기 수) · seat = 답 자리 · 쟁반마다 물고기 자리(layout). */
export function fill(n, dir, id, rnd = Math.random, seatHist = []){ const o = others(n, id, rnd), seat = seats(rnd, seatHist), rest = shuffle(o.slice(), rnd), set = [];
  for (let k = 0; k < 3; k++) set.push(k === seat ? n : rest.shift());
  return { n, dir, seat, set, cell: id }; }
/** 나들이 하나(문제 아홉). opt.small = 막혔을 때 작은 수부터. history = 앞 나들이(같은 n 연달아 · 같은 방향 넷 연달아를 이어서 본다). */
export function deal(id, history = [], rnd = Math.random, opt = {}){ if (!CELLS[id]) return [];
  const prev = history[history.length - 1], ns = arrange(picks(id, rnd), prev ? prev.n : null, rnd, opt.small ? 'small' : 'shuffle'), ds = dirs(rnd, history.map(p => p.dir)), seatsH = history.map(p => p.seat), out = [];
  ns.forEach((n, k) => { const p = fill(n, ds[k], id, rnd, seatsH); seatsH.push(p.seat); out.push(p); }); return out; }
/** 손으로 하는 판(걸음 ①)은 (가) 만 — 그 판 자리(start ~ start+2)의 (나) 를 (가) 로(답 · 같이 보이는 수는 그대로). */
export function handFix(q, start){ return q.map((p, k) => k >= start && k < start + T.PER_BOARD && p.dir !== 'ga' ? { ...p, dir: 'ga' } : p); }
/** 깨끗하지 못했던 문제를 「문제 둘을 사이에 두고」 다시(같은 답 · 같은 방향 · 자리와 같이 보이는 수는 새로 · 길이는 그대로). */
export function requeue(q, i, rnd = Math.random){ for (let at = i + T.RETRY_GAP + 1; at < q.length; at++) { const a = q.slice(), hist = a.slice(0, at).map(p => p.seat), p = { ...fill(q[i].n, q[i].dir, q[i].cell, rnd, hist), retry: true }; a.splice(at, 0, p); a.length = q.length;
    if (!same(a[at - 1], a[at]) && !same(a[at], a[at + 1])) return a; }
  return q.slice(); }

/** 판정: link = { at: 자리 } (가 = 고른 문 · 나 = 고른 쟁반) · 없으면 'none'(문이 아닌 곳에 놓음). */
export function judge(p, link){ if (!link || link.at == null || link.at < 0 || link.at > 2) return 'none'; return p.set[link.at] === p.n ? 'fit' : 'off'; }
/** 깨끗한 문제 = 빗장 걸린 문 · 물러난 쟁반 없음 · 길잡이 손이 뜨기 전 · 문이 다 닫히기 전. 문이 아닌 곳에 놓은 밧줄 · 들었다 놓은 쟁반 · 뒤집힌 문패를 돌린 것은 깨끗함 그대로. */
export const clean = r => !!r && !(r.barred || r.retreat || r.hinted || r.missed);

/** 쟁반 위 물고기 자리(쟁반 지름 1 기준 · 가운데 0): rows = 다섯씩 한 줄(윗줄 다섯 + 아랫줄 · 점 무늬와 같은 눈 · 몸은 옆으로) · 아니면 흩어 놓음(겹치지 않음).
 *  물고기 한 마리 = 길이 LEN · 너비 WID 의 둥근 막대(캡슐) — 흩어 놓을 때 막대끼리 GAP 보다 가까우면 다시 뽑는다. ry = 몸의 방향(0 이면 +z 를 봄 — 모형과 같게). */
export const FISH = { LEN: .32, WID: .13, GAP: .025, JIT: .04, ROW_LEN: .18, DX: .19, DZ: .23 };
const seg = q => { const h = Math.max(0, ((q.len || FISH.LEN) - FISH.WID) / 2),   /* 캡슐 끝까지가 몸 길이 */ dx = Math.sin(q.ry) * h, dz = Math.cos(q.ry) * h; return [q.x - dx, q.z - dz, q.x + dx, q.z + dz]; };
function segDist(a, b){ const [ax, az, bx, bz] = a, [cx, cz, dx, dz] = b, d = (px, pz, x1, z1, x2, z2) => { const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz, t = L2 ? Math.max(0, Math.min(1, ((px - x1) * vx + (pz - z1) * vz) / L2)) : 0; return Math.hypot(px - (x1 + t * vx), pz - (z1 + t * vz)); };
  const cr = (o1x, o1z, o2x, o2z, p1x, p1z, p2x, p2z) => { const s = (ax2, az2, bx2, bz2, cx2, cz2) => Math.sign((bx2 - ax2) * (cz2 - az2) - (bz2 - az2) * (cx2 - ax2)); return s(o1x, o1z, o2x, o2z, p1x, p1z) * s(o1x, o1z, o2x, o2z, p2x, p2z) < 0 && s(p1x, p1z, p2x, p2z, o1x, o1z) * s(p1x, p1z, p2x, p2z, o2x, o2z) < 0; };
  if (cr(ax, az, bx, bz, cx, cz, dx, dz)) return 0; return Math.min(d(ax, az, cx, cz, dx, dz), d(bx, bz, cx, cz, dx, dz), d(cx, cz, ax, az, bx, bz), d(dx, dz, ax, az, bx, bz)); }
/** 두 물고기가 겹치는가(캡슐) — 하네스도 쓴다. */
export const overlap = (a, b) => segDist(seg(a), seg(b)) < FISH.WID - 1e-6;
/** 흩어 놓는 틀(가운데 0 · 지름 1 기준): 수마다 대충의 자리 — 통째로 돌리고 조금씩 흔들고, 몸 방향은 마음대로(겹치면 다시). */
const SCATTER = { 1: [[0, 0]], 2: [[-.17, .02], [.17, -.02]], 3: [[0, -.2], [-.19, .13], [.19, .13]], 4: [[-.2, -.17], [.2, -.17], [-.2, .17], [.2, .17]], 5: [[0, -.27], [.26, -.08], [.16, .23], [-.16, .23], [-.26, -.08]] };
export function layout(n, rows, rnd = Math.random){ if (rows || !SCATTER[n]) { const out = []; for (let k = 0; k < n; k++) { const r = Math.floor(k / 5), c = k % 5; out.push({ x: (c - 2) * FISH.DX, z: (r - (n > 5 ? .5 : 0)) * FISH.DZ, ry: Math.PI / 2, len: FISH.ROW_LEN }); } return out; }
  for (let g = 0; g < 300; g++) { const turn = rnd() * Math.PI * 2, cs = Math.cos(turn), sn = Math.sin(turn), out = []; let okAll = true;
    for (const [x0, z0] of SCATTER[n]) { let placed = false; for (let t = 0; t < 40 && !placed; t++) { const x = x0 * cs - z0 * sn + (rnd() - .5) * 2 * FISH.JIT, z = x0 * sn + z0 * cs + (rnd() - .5) * 2 * FISH.JIT, q = { x, z, ry: rnd() * Math.PI * 2, len: FISH.LEN }, sg = seg(q);
        if (Math.max(Math.hypot(sg[0], sg[1]), Math.hypot(sg[2], sg[3])) > .44) continue;   /* 쟁반 밖으로 나가지 않게 */
        if (out.every(o => segDist(seg(o), sg) >= FISH.WID + FISH.GAP)) { out.push(q); placed = true; } }
      if (!placed) { okAll = false; break; } }
    if (okAll) return out; }
  return layout(n, true, rnd); }
/** 그 판의 사건. evBoards = 이 낱칸에서 앞서 사건이 붙은 판 수 · opt = { passed, calm, hand }.
 *  손으로 하는 판(걸음 ①)은 사건 없음(문은 열린 채 멈춰 있다). 처음 여섯 판은 INTRO 차례로 하나씩(닫히는 문은 한 번 나온 뒤로 늘) · 그 뒤는 판마다 하나.
 *  분필 문패는 통과한 뒤만. ?calm = 닫히는 문 · 뒤집힌 문패 · 분필 문패 없음. 사건은 수를 바꾸지 않는다(문제는 deal 이 정하고 사건은 그 판의 꾸밈만 고른다). */
export function events(evBoards, rnd = Math.random, opt = {}){ const ev = { close: false, peek: false, flip: false, surprise: false, chalk: false, tune: true, intro: null };
  if (opt.hand) return { ...ev, none: true };
  const can = { close: true, peek: true, flip: true, surprise: true, chalk: !!opt.passed, tune: true };
  if (evBoards < INTRO.length) { const k = INTRO[evBoards]; ev.intro = k; if (can[k]) ev[k] = true; if (evBoards > 0) ev.close = true; }
  else { ev.close = true; const w = [['peek', T.PEEK_P], ['flip', T.FLIP_P], ['surprise', T.SURPRISE_P], ['chalk', can.chalk ? T.CHALK_P : 0]], sum = w.reduce((a, x) => a + x[1], 0); let r = rnd() * Math.max(1, sum);
    for (const [name, p] of w) { if (r < p) { ev[name] = true; break; } r -= p; } }
  if (opt.calm) { ev.close = false; ev.flip = false; ev.chalk = false; }
  return ev; }
/** 문이 다 닫히기까지(초): 나들이 셋째 판이 조금 빠르다. */
export const closeS = (id, board) => (board >= T.BOARDS - 1 ? T.CLOSE_LAST : T.CLOSE_S)[id] || T.CLOSE_S.A03;
/** 빼꼼: 어느 문인지는 답과 상관없이 뽑는다(문 셋 가운데 고르게 · 문이 하나면 그 문). */
export const peekAt = (p, rnd = Math.random) => (p.dir === 'ga' ? Math.floor(rnd() * 3) : 0);
/** 뒤집힌 문패: 어느 문패인지도 답과 상관없이. */
export const flipAt = (p, rnd = Math.random) => (p.dir === 'ga' ? Math.floor(rnd() * 3) : 0);

/** 한 문제를 봇이 끝까지(하네스용): 아무 데나 이어 보고 · 아니면 그 자리는 빗장(가) / 물러남(나) — 남은 것 가운데 다시. → { ok, tries } */
export function play(p, rnd = Math.random){ let left = [0, 1, 2], tries = 0; for (let g = 0; g < 40 && left.length; g++) { const at = rnd() < .2 ? -1 : left[Math.floor(rnd() * left.length)]; tries++; const j = judge(p, { at });
    if (j === 'fit') return { ok: true, tries }; if (j === 'off') left = left.filter(x => x !== at); }
  return { ok: false, tries }; }
