/* 케이원더 · 장면 8 「화산이 만든 땅」 — 자라는 땅 (순수 계산 · document·THREE 를 부르지 않는다)
 * 설계 wonder/_design/volcano_design_v1.md 2장.  묶음 1 에서는 규칙 둘:
 *   ① 흐르는 용암   분출구에 melt 가 생겨 낮은 이웃으로 넘어가고, 식으면 그 자리에서 rock 이 된다.
 *                    끈적한 용암은 「두께 × 기울기」가 문턱을 넘어야 움직인다 → 묽으면 넓은 방패, 끈적하면 가파른 돔.
 *   ② 날아가 쌓이는 부스러기   폭발 세기만큼 넓은 고리에 tephra 가 쌓이고, 가는 재는 바람 쪽으로 깔린다.
 *                    30도쯤을 넘으면 미끄러져 내린다 → 가운데가 팬 원뿔.
 * 격자 N×N, 칸 번호 i = y*N + x.  높이·두께는 m, 한 칸의 한 변은 cell(m).  부피 단위 = 「두께 m × 칸」.
 * 시간은 걸음(tick).  step(T, dt) 의 dt 는 1 이하.
 * 문턱값(식는 빠르기·미끄러지는 기울기 따위)은 모두 게임 값이다. 화면에 사실처럼 쓰지 않는다.
 */
export const KIND = { BASE: 0, BASALT: 1, TRACHYTE: 2, TEPHRA: 3 };   // 맨 위 겹: 바닥 / 검은 현무암 / 밝은 조면암 / 재·부스러기
const SQ2 = Math.SQRT2;
const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1], DD = [1, 1, 1, 1, SQ2, SQ2, SQ2, SQ2];
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** 게임 값 — 그림을 보면서 맞춘 것 */
export const TUNE = {
  cool: 0.011,         // 걸음마다 식는 양(두꺼운 용암)
  thin: 3,             // 얇을수록 빨리 식는다: × (1 + thin / (두께 + 0.3))
  wet: 22,             // 물 밑에서는 이만큼 더 빨리
  tauRunny: 0.22,      // 묽은 용암의 문턱(두께 m × 기울기)
  tauSticky: 2,        // 끈적한 용암의 문턱
  mobRunny: 0.85,      // 작은 걸음 한 번에 높이 차의 얼마를 넘기나
  sub: 6,              // 한 걸음을 나눈 작은 걸음 수(용암이 흐르는 계산만)
  focus: 8,            // 가장 가파른 쪽으로 얼마나 몰리나(클수록 가는 줄기)
  bumpy: 2.4,          // 땅의 잔 굴곡(m) — 용암이 판이 아니라 줄기로 흐르게
  mobSticky: 0.12,
  repose: 0.6,         // 부스러기가 미끄러지는 기울기(tan 31°)
};

/** 폭발 세기 0~1 = 기체 × 끈적임 */
export const explosivity = (visc, gas) => gas * (0.35 + 0.65 * visc);
/** 뿜은 것 가운데 부스러기로 날아가는 몫 0~1 */
export const tephraShare = (visc, gas) => smooth(0.2, 0.7, gas) * (0.6 + 0.4 * visc);

export function createTerrain(o = {}) {
  const N = o.N || 192, n = N * N, L = o.layers || 20;
  const T = {
    N, n, L, cell: o.cell || 100, sea: o.sea ?? 0, t: 0, erupted: 0, rnd: mulberry(o.seed ?? 8),
    base: new Float32Array(n), rock: new Float32Array(n), tephra: new Float32Array(n),
    melt: new Float32Array(n), heat: new Float32Array(n), comp: new Float32Array(n), age: new Float32Array(n),
    kind: new Uint8Array(n), topTh: new Float32Array(n),
    g: new Float32Array(n),                                               // 굳은 땅 높이 = base + rock + tephra
    lk: new Uint8Array(n * L), lt: new Float32Array(n * L), ln: new Uint8Array(n),   // 칸마다 쌓인 겹(아래 → 위)
    rough: new Float32Array(n), dIn: new Float32Array(n), dOut: new Float32Array(n), dHt: new Float32Array(n), dCp: new Float32Array(n),
    box: { x0: N, x1: -1, y0: N, y1: -1 },                                // 녹은 용암이 있는 네모
    dep: { x0: N, x1: -1, y0: N, y1: -1 },                                // 무엇이든 쌓인 네모
    vent: { x: (N - 1) / 2, y: (N - 1) / 2, r: Math.max(1, 105 / (o.cell || 100)), visc: 0.1, gas: 0.1, rate: 0 },   // rate = 한 걸음에 뿜는 부피(두께 m × 칸)
    wind: [0.94, 0.34],                                                   // 가는 재가 실려 가는 쪽(단위 벡터)
    tune: { ...TUNE, ...(o.tune || {}) },
  };
  return reset(T, o);
}
/** 처음 땅으로 되돌린다. o.base = 높이 값 또는 (x, y, N) → 높이 */
export function reset(T, o = {}) {
  const { N } = T, b = o.base ?? 10;
  if (o.seed != null) T.rnd = mulberry(o.seed);
  for (const k of ['rock', 'tephra', 'melt', 'heat', 'comp', 'topTh', 'kind', 'ln', 'dIn', 'dOut', 'dHt', 'dCp']) T[k].fill(0);
  for (let y = 0, i = 0; y < N; y++) for (let x = 0; x < N; x++, i++) { T.base[i] = typeof b === 'function' ? b(x, y, N) : b; T.g[i] = T.base[i]; T.age[i] = o.age ?? 1e6; T.rough[i] = T.rnd(); }
  T.box = { x0: N, x1: -1, y0: N, y1: -1 }; T.dep = { x0: N, x1: -1, y0: N, y1: -1 };
  T.t = 0; T.erupted = 0; T.spill = 0; T.vent.rate = 0;
  return T;
}
export function setVent(T, v = {}) {
  for (const k of ['x', 'y', 'r', 'visc', 'gas', 'rate']) if (v[k] != null) T.vent[k] = k === 'visc' || k === 'gas' ? Math.min(1, Math.max(0, +v[k])) : +v[k];
  return T;
}

// ───────────── 겹 쌓기·걷어 내기 ─────────────
function grow(B, x, y) { if (x < B.x0) B.x0 = x; if (x > B.x1) B.x1 = x; if (y < B.y0) B.y0 = y; if (y > B.y1) B.y1 = y; }
/** 칸 i 에 종류 k 를 th(m) 만큼 얹는다 */
export function deposit(T, i, k, th, keepAge) {
  if (!(th > 0)) return;
  const { L, lk, lt, ln } = T, o = i * L; let c = ln[i];
  if (c && lk[o + c - 1] === k) lt[o + c - 1] += th;
  else {
    if (c === L) { lt[o + 1] += lt[o]; for (let q = 0; q < L - 1; q++) { lk[o + q] = lk[o + q + 1]; lt[o + q] = q ? lt[o + q + 1] : lt[o + 1]; } c--; }   // 꽉 차면 맨 아래 두 겹을 합친다
    lk[o + c] = k; lt[o + c] = th; c++; ln[i] = c;
  }
  if (k === KIND.TEPHRA) T.tephra[i] += th; else T.rock[i] += th;
  T.g[i] += th; T.kind[i] = k; T.topTh[i] = lt[o + c - 1];
  if (!keepAge) T.age[i] *= Math.max(0, 1 - th / 0.6);                    // 0.6m 넘게 덮이면 새 땅
  grow(T.dep, i % T.N, (i / T.N) | 0);
}
/** 칸 i 의 위에서부터 th(m) 를 걷어 낸다 → 실제로 걷은 양(처음 바닥은 못 걷는다) */
export function erode(T, i, th) {
  const { L, lk, lt, ln } = T, o = i * L; let c = ln[i], got = 0;
  while (th > 1e-9 && c) {
    const q = Math.min(th, lt[o + c - 1]), k = lk[o + c - 1];
    lt[o + c - 1] -= q; th -= q; got += q;
    if (k === KIND.TEPHRA) T.tephra[i] -= q; else T.rock[i] -= q;
    if (lt[o + c - 1] <= 1e-6) c--;
  }
  ln[i] = c; T.g[i] -= got; T.kind[i] = c ? lk[o + c - 1] : KIND.BASE; T.topTh[i] = c ? lt[o + c - 1] : 0;
  return got;
}
/** 칸의 겹을 아래에서 위로 → [{ kind, th }] (잘라 보기·시험) */
export function column(T, x, y) {
  const i = y * T.N + x, out = [];
  for (let q = 0; q < T.ln[i]; q++) out.push({ kind: T.lk[i * T.L + q], th: T.lt[i * T.L + q] });
  return out;
}

// ───────────── 한 걸음 ─────────────
export function step(T, dt = 1) {
  dt = Math.min(1, dt);
  const sub = T.tune.sub;
  for (let q = 0; q < sub; q++) { lava(T, dt / sub); flow(T, dt / sub); }
  erupt(T, dt); slide(T);
  const { age, n } = T; for (let i = 0; i < n; i++) age[i] += dt;
  T.t += dt;
  return T;
}

/** 부스러기 v(두께×칸)를 분출구 둘레 고리와 바람 쪽 재 이불로 뿌린다 */
function scatter(T, v, E) {
  if (!(v > 0)) return;
  const { N, vent, wind } = T;
  const u = 100 / T.cell;                                                 // 거리는 100m 칸으로 맞춘 값
  const r0 = (1.3 + 4.2 * E) * u, w = (0.75 + 1.9 * E) * u;               // 고리의 반지름과 너비(칸)
  const fa = 0.55 * E * E, sg = (5 + 16 * E) * u;                         // 가는 재의 몫과 퍼지는 너비
  const cxA = vent.x + wind[0] * sg * 0.7, cyA = vent.y + wind[1] * sg * 0.7;
  const R = Math.ceil(Math.max(r0 + 3 * w, fa > 0.01 ? sg * 3.2 : 0));
  const x0 = Math.max(0, Math.floor(vent.x - R)), x1 = Math.min(N - 1, Math.ceil(vent.x + R + (fa > 0.01 ? sg : 0)));
  const y0 = Math.max(0, Math.floor(vent.y - R)), y1 = Math.min(N - 1, Math.ceil(vent.y + R + (fa > 0.01 ? sg : 0)));
  const W = scatter.buf && scatter.buf.length >= (x1 - x0 + 1) * (y1 - y0 + 1) ? scatter.buf : (scatter.buf = new Float32Array((x1 - x0 + 1) * (y1 - y0 + 1)));
  let sr = 0, sa = 0, q = 0;
  const A = scatter.bufA && scatter.bufA.length >= W.length ? scatter.bufA : (scatter.bufA = new Float32Array(W.length));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++, q++) {
    const dx = x - vent.x, dy = y - vent.y, r = Math.hypot(dx, dy);
    const lee = r > 0.01 ? (dx * wind[0] + dy * wind[1]) / r : 0;         // 바람 아래쪽 둘레가 조금 더 높게 쌓인다
    const a = (r - r0) / w; W[q] = Math.exp(-a * a) * (1 + 0.3 * lee) * (0.8 + 0.4 * T.rough[y * N + x]); sr += W[q];
    if (fa > 0.01) { const ax = x - cxA, ay = y - cyA, al = ax * wind[0] + ay * wind[1], ac = -ax * wind[1] + ay * wind[0]; A[q] = Math.exp(-(al * al) / (2 * sg * sg * 1.8) - (ac * ac) / (2 * sg * sg * 0.5)); sa += A[q]; } else A[q] = 0;
  }
  const kr = sr > 0 ? v * (sa > 0 ? 1 - fa : 1) / sr : 0, ka = sa > 0 ? v * fa / sa : 0; q = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++, q++) { const th = W[q] * kr + A[q] * ka; if (th > 1e-5) deposit(T, y * N + x, KIND.TEPHRA, th); else T.spill = (T.spill || 0) + th; }
  if (T.spill > 0) { deposit(T, Math.round(vent.y) * N + Math.round(vent.x), KIND.TEPHRA, T.spill); T.spill = 0; }   // 먼지만 한 양은 모아서 — 새는 곳이 없게
}
/** 분출구 둘레의 땅과 용암을 파내어 → 파낸 부피. 깔때기(안쪽으로 약 30도)보다 깊게는 못 판다 */
function dig(T, rc, depth) {
  const { N, vent, g, melt } = T; let v = 0, rim = -1e9;
  const x0 = Math.max(0, Math.floor(vent.x - rc - 1)), x1 = Math.min(N - 1, Math.ceil(vent.x + rc + 1)), y0 = Math.max(0, Math.floor(vent.y - rc - 1)), y1 = Math.min(N - 1, Math.ceil(vent.y + rc + 1));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const r = Math.hypot(x - vent.x, y - vent.y); if (r >= rc && r < rc + 1.5 && g[y * N + x] > rim) rim = g[y * N + x]; }
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const r = Math.hypot(x - vent.x, y - vent.y); if (r >= rc) continue; const i = y * N + x;
    if (melt[i] > 0) { const q = Math.min(melt[i], depth); melt[i] -= q; v += q; }
    const floor = rim - (rc - r) * T.cell * 0.55, want = Math.min(depth * (1 - (r / rc) * (r / rc)), g[i] - floor);
    if (want > 0) v += erode(T, i, want);
  }
  return v;
}
/** 분출구에 녹은 용암을 넣는다(부스러기로 날아갈 몫은 뺀 것) */
function lava(T, dt) {
  const { vent, N, melt, heat, comp } = T; const V = vent.rate * dt * (1 - tephraShare(vent.visc, vent.gas)); if (!(V > 0)) return;
  T.erupted += V;
  const r = vent.r, x0 = Math.max(0, Math.floor(vent.x - r)), x1 = Math.min(N - 1, Math.ceil(vent.x + r)), y0 = Math.max(0, Math.floor(vent.y - r)), y1 = Math.min(N - 1, Math.ceil(vent.y + r));
  let cnt = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (Math.hypot(x - vent.x, y - vent.y) <= r) cnt++;
  const q = V / cnt;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (Math.hypot(x - vent.x, y - vent.y) <= r) {
    const i = y * N + x, m = melt[i];
    heat[i] = (m * heat[i] + q) / (m + q); comp[i] = (m * comp[i] + q * vent.visc) / (m + q); melt[i] = m + q; grow(T.box, x, y);
  }
}
/** 부스러기: 폭발이 분출구를 파내고(가운데가 팬다), 파낸 것까지 고리에 쌓는다 */
function erupt(T, dt) {
  const { vent } = T; const V = vent.rate * dt; if (!(V > 0)) return;
  const E = explosivity(vent.visc, vent.gas), ft = tephraShare(vent.visc, vent.gas);
  let teph = V * ft; T.erupted += teph;
  if (ft > 0.05 && E > 0.25) teph += dig(T, 0.6 * (1.3 + 4.2 * E) * 100 / T.cell, 6 * E * dt * Math.min(1, vent.rate / 40));
  scatter(T, teph, E);
}
/** 큰 폭발 한 번: 꼭대기를 날려 그 부피를 넓게 뿌린다. power 0~1 → 날아간 부피 */
export function blast(T, power = 1) {
  const v = dig(T, (2.4 + 3.2 * power) * 100 / T.cell, 70 + 150 * power);
  scatter(T, v, 0.75 + 0.25 * power);
  return v;
}

function flow(T, dt) {
  const { N, melt, heat, comp, g, dIn, dOut, dHt, dCp, cell, rough, sea, tune: U } = T, B = T.box;
  if (B.x1 < B.x0) return;
  const x0 = B.x0, x1 = B.x1, y0 = B.y0, y1 = B.y1, w8 = flow.w8 || (flow.w8 = new Float64Array(8));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * N + x, m = melt[i]; if (m <= 1e-4) continue;
    const ht = heat[i], c = comp[i], cold = 1 - ht;
    const tau = (U.tauRunny + (U.tauSticky - U.tauRunny) * Math.pow(c, 1.5)) * (1 + 3 * cold * cold);
    const mob = (U.mobRunny + (U.mobSticky - U.mobRunny) * Math.pow(c, 0.7)) * (0.3 + 0.7 * ht) * Math.min(1, dt * U.sub);
    const Hi = g[i] + m + rough[i] * U.bumpy; let sum = 0, smax = 0, dmax = 0;
    for (let k = 0; k < 8; k++) {
      w8[k] = 0; const nx = x + DX[k], ny = y + DY[k]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      const j = ny * N + nx, d = Hi - (g[j] + melt[j] + rough[j] * U.bumpy); if (d <= 0) continue;
      const s = d / (DD[k] * cell); if (m * s < tau) continue;
      const ww = Math.pow(s, U.focus) * (0.8 + 0.4 * T.rnd()); w8[k] = ww; sum += ww;                       // 가파른 쪽으로 몰린다 → 강처럼
      if (s > smax) { smax = s; dmax = d; }
    }
    if (sum <= 0) continue;
    const out = Math.min(m - tau / smax, 0.48 * dmax) * Math.min(1, mob); if (out <= 0) continue;
    dOut[i] = out;
    for (let k = 0; k < 8; k++) if (w8[k] > 0) { const j = (y + DY[k]) * N + x + DX[k], q = out * w8[k] / sum; dIn[j] += q; dHt[j] += q * ht; dCp[j] += q * c; }
  }
  // 옮기고 · 식히고 · 굳히기
  const ax0 = Math.max(0, x0 - 1), ax1 = Math.min(N - 1, x1 + 1), ay0 = Math.max(0, y0 - 1), ay1 = Math.min(N - 1, y1 + 1);
  B.x0 = N; B.x1 = -1; B.y0 = N; B.y1 = -1;
  for (let y = ay0; y <= ay1; y++) for (let x = ax0; x <= ax1; x++) {
    const i = y * N + x, keep = melt[i] - dOut[i], inn = dIn[i]; let m = keep + inn;
    if (m <= 0) { melt[i] = 0; dOut[i] = 0; continue; }
    let ht = (keep * heat[i] + dHt[i]) / m; const c = (keep * comp[i] + dCp[i]) / m;
    dIn[i] = dOut[i] = dHt[i] = dCp[i] = 0;
    const top = g[i] + m, wet = top < sea ? U.wet : g[i] < sea ? 1 + (U.wet - 1) * 0.5 : 1;
    ht -= dt * U.cool * (1 + U.thin / (m + 0.3)) * wet;
    if (ht <= 0 || m < 0.04) { deposit(T, i, c > 0.5 ? KIND.TRACHYTE : KIND.BASALT, m); melt[i] = 0; heat[i] = 0; continue; }
    melt[i] = m; heat[i] = ht; comp[i] = c; grow(B, x, y);
  }
}
/** 맨 위가 부스러기인 칸은 31도쯤보다 가파르면 낮은 이웃으로 미끄러진다 */
function slide(T) {
  const { N, g, kind, topTh, cell, tune: U } = T, D = T.dep; if (D.x1 < D.x0) return;
  const x0 = D.x0, x1 = D.x1, y0 = D.y0, y1 = D.y1, lim = U.repose * cell;
  for (let pass = 0; pass < 2; pass++) {
    const fwd = ((T.t | 0) + pass) & 1;
    for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) {
      const x = fwd ? xx : x1 - (xx - x0), y = fwd ? yy : y1 - (yy - y0), i = y * N + x;
      if (kind[i] !== KIND.TEPHRA) continue; const th = topTh[i]; if (th <= 1e-4) continue;
      let best = 0, bj = -1;
      for (let k = 0; k < 8; k++) { const nx = x + DX[k], ny = y + DY[k]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx, ex = g[i] - g[j] - lim * DD[k]; if (ex > best) { best = ex; bj = j; } }
      if (bj < 0) continue;
      const q = erode(T, i, Math.min(th, best * 0.3)); deposit(T, bj, KIND.TEPHRA, q, true);
    }
  }
}

// ───────────── 재기 ─────────────
/** 지금 있는 것(굳은 것 + 녹은 것)의 부피 */
export function volume(T) { let v = 0; for (let i = 0; i < T.n; i++) v += T.rock[i] + T.tephra[i] + T.melt[i]; return v; }
/** 산의 생김새를 잰다(설계 2-5 의 첫 걸음). ref = 높이를 재는 바닥(처음 땅 또는 바다) */
export function measure(T, o = {}) {
  const { N, n, g, base, rock, tephra, cell } = T, min = o.min ?? 2;
  let peak = -1e9, pi = 0, area = 0, slopeSum = 0, cnt = 0, ref = 0, rn = 0;
  for (let i = 0; i < n; i++) { const a = rock[i] + tephra[i]; if (a > min) { area++; ref += base[i]; rn++; } if (g[i] > peak) { peak = g[i]; pi = i; } }
  ref = o.ref ?? (rn ? ref / rn : 0);
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const i = y * N + x; if (rock[i] + tephra[i] <= min) continue; slopeSum += Math.atan(Math.hypot(g[i + 1] - g[i - 1], g[i + N] - g[i - N]) / (2 * cell)); cnt++; }
  const width = 2 * Math.sqrt(area / Math.PI) * cell, height = peak - ref;
  const vi = Math.round(T.vent.y) * N + Math.round(T.vent.x);
  return { peak, height, width, ratio: width > 0 ? height / width : 0, slopeDeg: cnt ? slopeSum / cnt * 180 / Math.PI : 0, craterDepth: peak - g[vi], peakAt: [pi % N, (pi / N) | 0], area };
}
