/* 번쩍 틀 「번쩍 궤짝과 불꽃」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/T09_번쩍_틀.md · 정본 27 문서 4 · 5절(5-5 · 5-9 · 5-10 · 5-11).
 * 문제 하나 = 궤짝의 덧문이 번쩍 열렸다 닫힌다 → 그 사이에 본 통이 몇인지 단추 줄에서 바로 누른다(한 문제에 한 번).
 *   걸음 ① 보고 누르기 : 덧문이 열린 채(세어도 된다) · 단추 1 · 2 · 3
 *   걸음 ② 번쩍        : 덧문이 SHOW_S 만큼 열렸다 닫힘 · 단추 1~5 · 깨끗할 때마다 보이는 시간이 SHOW_STEP 배(바닥 SHOW_MIN) · 아니면 한 단계 도로
 * 묻는 것은 「모두 몇 개」 하나뿐 — 덧셈 · 비교 · 6 넘는 수 없음. 4 · 5 는 늘 무늬(통과 뒤의 「흩어진 넷 · 다섯」 사건만 빼고).
 * 같은 틀이 뒤에 맡을 낱칸(F03 · F04 · G04 · G08 · L11)은 아래 CELLS 표에 줄만 더한다(풀 · 단추 · 보여 줄 것을 낱칸 번호로 받는다).
 * 궤짝 안 자리(layout · scatter · fives · tenSlots)도 여기 — 「오늘의 번쩍」(./review.js)이 같이 쓴다. 단위 = 궤짝 안쪽(가로 CRATE.W · 세로 CRATE.D · 가운데가 0 · z 는 화면 아래쪽이 +). */

// ── 낱칸 표: n = 통 수 범위 · small = 한 나들이에 그 범위에서 낼 수(나머지는 무늬 4 · 5) · rows = 걸음마다 단추 줄
export const CELLS = {
  A04: { n: [1, 5], small: { n: [1, 3], k: 7 }, rows: { 1: [1, 2, 3], 2: [1, 2, 3, 4, 5] } },   // 한눈에 알아보기 — 1~3 은 아무 꼴(아홉 중 일곱) · 4 · 5 는 무늬(아홉 중 둘)
};
export const IDS = Object.keys(CELLS);

// ── 내가 정한 수치(T09 설계 기본안 + 코드가 정한 것 — 준호가 반에서 보고 바꾼다)
export const T = {
  SHOW_S: 1.6, SHOW_STEP: .88, SHOW_MIN: .7,     // 보이는 시간: 나들이 시작 · 깨끗할 때마다 곱 · 바닥(초)
  FUSE_S: 8, FUSE_LAST: 6.5,                      // 심지(생각하는 동안에만 타는 초) · 나들이 셋째 판
  PEEK: 1,                                        // 문제마다 한 번 더 보기
  CORNER_P: .3, GOLD_P: .25, TINT_P: .3, LOOSE_P: .3,   // 판마다 사건 하나를 뽑는 몫(흩어진 넷 · 다섯은 통과 뒤에만 · 몫의 합으로 나눠 판마다 꼭 하나)
  STREAK: 3, FIRE_MAX: 5, HINT_AFTER: 6,          // 하늘 가득까지 깨끗한 문제 수 · 불꽃 단계 · 가만히 이만큼(초)이면 길잡이 손
  PER_BOARD: 3, BOARDS: 3, RETRY_GAP: 2,          // 판 = 문제 셋 · 나들이 = 판 셋 · 깨끗하지 못한 문제는 문제 둘을 사이에 두고 다시
  GOLD_COINS: 3, COIN_PER: 1,                     // 금빛 폭죽의 덤 동전 · 문제 하나에 동전(코드가 정함)
  CRATE: { W: 2.6, D: 1.9 }, R: .19, GAP: .06, EDGE: .07, PAT: .48,   // 궤짝 안쪽 크기 · 통 반지름 · 통 사이 · 벽과의 틈 · 무늬의 칸(코드가 정함)
};
/** 꼴: 1~3 은 아무 꼴 · 4 · 5 는 무늬(PATTERN) · 흩어진 꼴(LOOSE — 통과 뒤 사건). 1 의 「꼴」은 놓인 자리. */
export const SHAPES = { 1: ['mid', 'left', 'right'], 2: ['row', 'col', 'slash', 'back'], 3: ['row', 'col', 'slash', 'tri', 'vee'], 4: ['square', 'diamond'], 5: ['line', 'quin'] };
export const PATTERN = ['square', 'diamond', 'line', 'quin'];
export const LOOSE = { 4: 'two2', 5: 'three2' };
export const INTRO = ['fuse', 'corner', 'gold', 'tint', 'loose', 'streak'];   // 걸음 ② 의 처음 판들은 이 차례로 하나씩

const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const key = p => `${p.n}:${p.shape}`;
export const same = (p, q) => !!p && !!q && p.n === q.n;   /* 연달아 안 되는 것 = 같은 수(꼴이 달라도) */
export const make = (n, shape) => ({ kind: 'flash', n, shape });
/** 그 낱칸의 문제 풀 = (수, 꼴) 모두(풀 밖의 수는 나오지 않는다). */
export function pool(id){ const c = CELLS[id]; if (!c) return []; return range(c.n[0], c.n[1]).flatMap(n => SHAPES[n].map(s => make(n, s))); }
/** 단추 줄(왼쪽부터 작은 수 · 자리 고정). */
export const buttons = (id, step) => ((CELLS[id] || {}).rows || {})[step] ? CELLS[id].rows[step].slice() : [];

function evenly(list, n, rnd){ const out = []; while (out.length < n) out.push(...shuffle(list.slice(), rnd)); return out.slice(0, n); }
/** 같은 n 이 연달아 오지 않게 늘어놓는다(앞 나들이 끝 prev 와도). need(k, n) = k 번째에 n 이 와도 되는가. order = 'shuffle' | 'small'. */
function arrange(Ns, prev, rnd, order, need = () => true){ const cnt = new Map(); for (const n of Ns) cnt.set(n, (cnt.get(n) | 0) + 1); const out = [];
  const go = last => { if (out.length === Ns.length) return true; let cand = [...cnt.keys()].filter(n => cnt.get(n) > 0 && n !== last && need(out.length, n)); cand = order === 'small' ? cand.sort((a, b) => a - b) : shuffle(cand, rnd);
    for (const n of cand) { cnt.set(n, cnt.get(n) - 1); out.push(n); if (go(n)) return true; out.pop(); cnt.set(n, cnt.get(n) + 1); } return false; };
  return go(prev) ? out : null; }
/** n 마다 꼴을 고른다 — 한 나들이에 같은 (n, 꼴) 두 번 없음(꼴이 모자라면 다시 쓴다 · 1 은 셋 · 4 는 둘). 4 · 5 는 늘 무늬. */
function shapesFor(Ns, rnd){ const left = {}; return Ns.map(n => { if (!left[n] || !left[n].length) left[n] = shuffle(SHAPES[n].slice(), rnd); return make(n, left[n].pop()); }); }
/** 나들이 하나(문제 아홉). history = 앞 나들이(첫 문제가 앞 끝과 같은 n 이 아니게). opt.hand = 첫 판이 걸음 ①(첫 셋이 1~3) · opt.small = 막혔을 때 작은 수부터. */
export function deal(id, history = [], rnd = Math.random, opt = {}){ const c = CELLS[id], n = T.PER_BOARD * T.BOARDS; if (!c) return [];
  const Ns = [...evenly(range(c.small.n[0], c.small.n[1]), c.small.k, rnd), ...evenly(range(c.small.n[1] + 1, c.n[1]), n - c.small.k, rnd)], last = history[history.length - 1];
  const hi = c.rows[1][c.rows[1].length - 1], need = opt.hand ? (k, v) => k >= T.PER_BOARD || v <= hi : () => true;
  const order = arrange(Ns, last ? last.n : null, rnd, opt.small ? 'small' : 'shuffle', need) || arrange(Ns, null, rnd, 'shuffle', need) || Ns;
  return shapesFor(order, rnd); }
/** 판 자리 start 부터 셋이 걸음 ① 이 된다(막혀서 돌아갈 때): 그 셋을 1~3 으로(뒤의 1~3 문제와 바꾼다 · 연달아 같은 n 이 생기지 않게 · 안 되면 그대로). */
export function fixHand(q, start, id = 'A04'){ const hi = CELLS[id].rows[1].slice(-1)[0], a = q.slice(); if (a.slice(start, start + T.PER_BOARD).every(p => p.n <= hi)) return a;
  const head = a.slice(0, start), rest = a.slice(start), Ns = rest.map(p => p.n), byN = {}; rest.forEach(p => (byN[p.n] = byN[p.n] || []).push(p));
  const ord = arrange(Ns, head.length ? head[head.length - 1].n : null, Math.random, 'shuffle', (k, v) => k >= T.PER_BOARD || v <= hi); if (!ord) return a;
  return [...head, ...ord.map(n => byN[n].shift())]; }
/** 깨끗하지 못했던 문제를 「문제 둘을 사이에 두고」 다시(같은 수 · 다른 꼴 · 길이 그대로 — 끝의 문제 하나가 빠진다). 앞뒤가 같은 n 이면 한 칸씩 뒤로 · 자리가 없으면 그대로. */
export function requeue(q, i, rnd = Math.random){ const p = q[i], used = new Set(q.filter(x => x.n === p.n).map(x => x.shape)), others = SHAPES[p.n].filter(s => s !== p.shape), fresh = others.filter(s => !used.has(s)), shape = (fresh.length ? fresh : others.length ? others : [p.shape])[Math.floor(rnd() * (fresh.length || others.length || 1))];
  for (let at = i + T.RETRY_GAP + 1; at < q.length; at++) { const a = q.slice(); a.splice(at, 0, { ...make(p.n, shape), retry: true }); a.length = q.length;
    if (!same(a[at - 1], a[at]) && !same(a[at], a[at + 1])) return a; }
  return q.slice(); }

// ── 보이는 시간(단계 level 0 = SHOW_S)
export const showTime = level => Math.max(T.SHOW_MIN, T.SHOW_S * Math.pow(T.SHOW_STEP, Math.max(0, level | 0)));
/** 가장 짧아지는 단계(그 뒤로는 바닥 그대로). */
export const LEVEL_MAX = (() => { let k = 0; while (T.SHOW_S * Math.pow(T.SHOW_STEP, k) > T.SHOW_MIN && k < 40) k++; return k; })();
/** 다음 단계: 깨끗하면 하나 짧게(바닥까지) · 아니면 한 단계 도로(길게). */
export const step = (level, clean) => clean ? Math.min(LEVEL_MAX, (level | 0) + 1) : Math.max(0, (level | 0) - 1);
export const nextLevel = step;

/** 판정: 누른 수가 그 문제의 수인가 → 'fit' | 'off'. */
export const judge = (pick, p) => pick === p.n ? 'fit' : 'off';
/** 깨끗한 문제 = 첫 누름에 맞음 · 길잡이 손이 답을 짚기 전 · 심지가 다 타기 전. 한 번 더 본 것 · 덧문이 열린 동안의 이른 누름 · 헛누름은 깨끗함 그대로. */
export const clean = r => !!r && !(r.retreat || r.hinted || r.missed);

/** 그 판의 사건. evBoards = 이 낱칸에서 앞서 사건이 붙은 판 수 · opt = { passed, calm, hand }.
 *  손으로 하는 판(걸음 ①)은 사건 없음. 처음 여섯 판은 INTRO 차례로 하나씩(심지는 한 번 나온 뒤로 늘) · 그 뒤는 판마다 하나(몫의 합으로 나눠 늘 하나).
 *  흩어진 넷 · 다섯은 통과한 뒤에만. ?calm = 심지 · 구석 없음(보이는 시간도 짧아지지 않는다 — 부르는 쪽). 사건은 수를 바꾸지 않는다. */
export function events(evBoards, rnd = Math.random, opt = {}){ const ev = { fuse: false, corner: false, gold: false, tint: false, loose: false, streak: true, intro: null };
  if (opt.hand) return { ...ev, streak: false, none: true };
  const can = { fuse: true, corner: true, gold: true, tint: true, loose: !!opt.passed, streak: true };
  if (evBoards < INTRO.length) { const k = INTRO[evBoards]; ev.intro = k; if (can[k] && k !== 'streak') ev[k] = true; ev.fuse = true; }
  else { ev.fuse = true; const P = [['corner', T.CORNER_P], ['gold', T.GOLD_P], ['tint', T.TINT_P], ['loose', can.loose ? T.LOOSE_P : 0]], sum = P.reduce((s, x) => s + x[1], 0); let r = rnd() * sum; for (const [k, w] of P) { if (w > 0 && r < w) { ev[k] = true; break; } r -= w; } }
  if (opt.calm) { ev.fuse = false; ev.corner = false; }
  return ev; }
/** 심지 시간: 나들이 셋째 판은 조금 짧다. */
export const fuseS = board => board >= T.BOARDS - 1 ? T.FUSE_LAST : T.FUSE_S;

// ── 궤짝 안 자리(순수 — 화면이 그대로 놓고, 하네스가 「겹치지 않음 · 궤짝 안 · 무늬 그대로」를 본다)
/** 칸: 'all' 온 궤짝 · 'L' · 'R' 반쪽(덧문 한 짝 아래) · 'c0' 'c1' 'c2' 셋째 칸 · 'h0' 'h1' 둘째 칸(칸막이로 나뉨). */
export function region(name){ const W = T.CRATE.W / 2, D = T.CRATE.D / 2, e = T.EDGE;
  if (name === 'L') return { x0: -W + e, x1: -e, z0: -D + e, z1: D - e }; if (name === 'R') return { x0: e, x1: W - e, z0: -D + e, z1: D - e };
  const m = /^([ch])(\d)$/.exec(name || ''); if (m) { const k = m[1] === 'c' ? 3 : 2, w = T.CRATE.W / k, x0 = -W + w * +m[2]; return { x0: x0 + e, x1: x0 + w - e, z0: -D + e, z1: D - e }; }
  return { x0: -W + e, x1: W - e, z0: -D + e, z1: D - e }; }
/** 자리들이 칸 안이고 서로 겹치지 않는가(r = 통 반지름). */
export function fits(pts, r = T.R, box = region('all')){ for (let i = 0; i < pts.length; i++) { const p = pts[i]; if (p.x - r < box.x0 - 1e-6 || p.x + r > box.x1 + 1e-6 || p.z - r < box.z0 - 1e-6 || p.z + r > box.z1 + 1e-6) return false;
    for (let j = 0; j < i; j++) if (Math.hypot(p.x - pts[j].x, p.z - pts[j].z) < 2 * r + T.GAP - 1e-6) return false; } return true; }
/** 꼴의 모양(칸 = s 를 곱하기 전 · 가운데가 0). */
function shapeOf(n, shape){ const t = .866;
  switch (`${n}:${shape}`) {
    case '2:row': return [[-.5, 0], [.5, 0]]; case '2:col': return [[0, -.5], [0, .5]]; case '2:slash': return [[-.5, .5], [.5, -.5]]; case '2:back': return [[-.5, -.5], [.5, .5]];
    case '3:row': return [[-1, 0], [0, 0], [1, 0]]; case '3:col': return [[0, -1], [0, 0], [0, 1]]; case '3:slash': return [[-1, 1], [0, 0], [1, -1]]; case '3:tri': return [[-.5, t / 2], [.5, t / 2], [0, -t / 2]]; case '3:vee': return [[-.5, -t / 2], [.5, -t / 2], [0, t / 2]];
    case '4:square': return [[-.5, -.5], [.5, -.5], [-.5, .5], [.5, .5]]; case '4:diamond': return [[0, -.71], [.71, 0], [0, .71], [-.71, 0]];
    case '5:line': return [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0]]; case '5:quin': return [[-.72, -.72], [.72, -.72], [0, 0], [-.72, .72], [.72, .72]];
    default: return [[0, 0]]; } }
/** 한눈에 알아보기의 자리: n 개를 꼴대로(무늬는 정해진 모양 그대로 · 1~3 은 칸 너비를 조금씩 바꿈 · 놓이는 곳은 흔들림).
 *  opt.corner = 'L' | 'R' — 한쪽 반에 몰아 놓는다(덧문 한 짝만 열리는 사건 · 들어가지 않으면 null). 흩어진 꼴(two2 · three2)은 두 무리로 떨어져 놓인다. → [{ x, z }] | null */
export function layout(n, shape, rnd = Math.random, opt = {}){ const r = T.R, box = region(opt.corner || 'all');
  if (shape === 'two2' || shape === 'three2') return loose(n, shape, rnd, box);
  if (n === 1) { const cx = shape === 'left' ? -T.CRATE.W / 4 : shape === 'right' ? T.CRATE.W / 4 : 0, b = opt.corner ? box : { x0: cx - .35, x1: cx + .35, z0: box.z0, z1: box.z1 };
    for (let t = 0; t < 40; t++) { const p = [{ x: b.x0 + r + rnd() * Math.max(0, b.x1 - b.x0 - 2 * r), z: b.z0 + r + rnd() * Math.max(0, b.z1 - b.z0 - 2 * r) * .7 + (b.z1 - b.z0 - 2 * r) * .15 }]; if (fits(p, r, box)) return p; } return null; }
  const pat = PATTERN.includes(shape), minS = (2 * r + T.GAP) + .005;
  for (let t = 0; t < 24; t++) { const s = pat ? T.PAT : t < 12 ? T.PAT + rnd() * .16 : Math.max(minS, T.PAT - (t - 12) * .01), rel = shapeOf(n, shape).map(([x, z]) => [x * s, z * s]);   /* 1~3 은 칸 너비를 조금씩 바꾼다(들어가지 않으면 좁혀 본다 · 무늬는 그대로) */
    const xs = rel.map(p => p[0]), zs = rel.map(p => p[1]), w0 = Math.min(...xs) - r, w1 = Math.max(...xs) + r, d0 = Math.min(...zs) - r, d1 = Math.max(...zs) + r;
    const lo = box.x0 - w0, hi = box.x1 - w1, zlo = box.z0 - d0, zhi = box.z1 - d1; if (lo > hi + 1e-9 || zlo > zhi + 1e-9) { if (pat) return null; continue; }
    const mid = (lo + hi) / 2, cx = opt.corner ? mid + (rnd() - .5) * (hi - lo) * .6 : Math.max(lo, Math.min(hi, (rnd() - .5) * Math.min(.9, hi - lo))), cz = (zlo + zhi) / 2 + (rnd() - .5) * (zhi - zlo) * .6;
    const pts = rel.map(([x, z]) => ({ x: cx + x, z: cz + z })); if (fits(pts, r, box)) return pts; }
  return null; }
/** 흩어진 넷 · 다섯: 둘과 둘 · 셋과 둘 — 무리 사이는 넓게(한 덩이 무늬로 보이지 않게). */
function loose(n, shape, rnd, box){ const r = T.R, s = T.PAT, a = shape === 'three2' ? 3 : 2, b = n - a;
  for (let t = 0; t < 200; t++) { const left = rnd() < .5, grp = (k, cx, cz) => { const rel = k === 3 ? (rnd() < .5 ? shapeOf(3, 'tri') : shapeOf(3, 'row')) : (rnd() < .5 ? shapeOf(2, 'row') : shapeOf(2, 'col')); return rel.map(([x, z]) => ({ x: cx + x * s, z: cz + z * s })); };
    const ax = (left ? -1 : 1) * (.55 + rnd() * .25), bx = -ax + (rnd() - .5) * .2, az = (rnd() - .5) * .5, bz = (rnd() - .5) * .5, pts = [...grp(a, ax, az), ...grp(b, bx, bz)];
    if (fits(pts, r, box) && Math.abs(ax - bx) >= 1.1) return pts; }
  return null; }
/** 흩어 놓기(세는 낱칸 — A01 · A06 · A05 복습): 칸 안에 n 개를 겹치지 않게 아무렇게나. */
export function scatter(n, box = region('all'), rnd = Math.random, r = T.R){ for (let g = 0; g < 60; g++) { const pts = []; let bad = false;
    for (let i = 0; i < n && !bad; i++) { let ok = false; for (let t = 0; t < 120; t++) { const p = { x: box.x0 + r + rnd() * (box.x1 - box.x0 - 2 * r), z: box.z0 + r + rnd() * (box.z1 - box.z0 - 2 * r) }; if (pts.every(q => Math.hypot(p.x - q.x, p.z - q.z) >= 2 * r + T.GAP + .05)) { pts.push(p); ok = true; break; } } if (!ok) bad = true; }
    if (!bad) return pts; }
  return fives(n, box, r); }
/** 다섯씩 한 줄(정본 5-10절 — 점 무늬 · 열 칸과 같은 눈): 칸이 넓으면 가로줄(윗줄 다섯 + 아랫줄) · 좁으면 세로줄(왼줄 다섯 + 오른줄). 칸 가운데에 놓는다. */
export function fives(n, box = region('all'), r = T.R, opt = {}){ if (n <= 0) return []; const w = box.x1 - box.x0, d = box.z1 - box.z0, p = 2 * r + T.GAP, vert = opt.vertical != null ? opt.vertical : w < 5 * p, lines = Math.ceil(n / 5), out = [], cx = (box.x0 + box.x1) / 2, cz = (box.z0 + box.z1) / 2;
  for (let i = 0; i < n; i++) { const ln = Math.floor(i / 5), k = i % 5, a = (k - 2) * p, b = (ln - (lines - 1) / 2) * p * 1.08; out.push(vert ? { x: cx + b, z: cz + a } : { x: cx + a, z: cz + b }); }
  return out; }
/** 열 칸(T02 의 열 칸 틀 — 다섯씩 두 줄): 칸 열의 자리(왼쪽 위부터 · 윗줄 다섯 → 아랫줄 다섯). */
export function tenSlots(r = T.R){ const p = 2 * r + T.GAP + .08, out = []; for (let k = 0; k < 10; k++) out.push({ x: (k % 5 - 2) * p, z: (Math.floor(k / 5) - .5) * p * 1.05 }); return out; }

/** 한 문제를 봇이 끝까지(하네스용): 단추 줄에서 누른다(아닌 수는 물러남). pick(남은 단추) → 누를 수. → { ok, retreats, k } */
export function play(id, p, stepNo = 2, opt = {}){ const pick = opt.pick || (bs => bs[0]); let ls = buttons(id, stepNo), retreats = 0, k = null;
  while (ls.length) { const x = pick(ls); if (judge(x, p) === 'fit') { k = x; break; } retreats++; ls = ls.filter(y => y !== x); }
  return { ok: k === p.n, retreats, k }; }
