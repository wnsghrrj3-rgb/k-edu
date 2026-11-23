/* 청산리 — 엿새 · 큰 지형 한 장(640×360, 2026-11-23 설계 v2 ⑨ map.js)
   좌표: x 동쪽(+) · z 남쪽(+) · y 위. 높이는 함수 하나(H)가 정한다 — 땅 그물·발 디딤·시야·작은 지도가 모두 같은 H 를 본다.
   골짜기 = 꺾은선(가운데 줄)을 따라 깎은 홈. 점마다 [x, z, 바닥 반폭, 바닥 높이, 왼쪽 비탈, 오른쪽 비탈](가는 쪽 기준 왼쪽 = 동쪽으로 갈 때 북쪽).
   산 = 능선 무늬 + 잔무늬. 깎은 홈과 산 가운데 낮은 쪽이 땅이 된다(부드러운 최솟값).
   한 줄 가운데 슬래시 두 개 주석 금지(블록 주석만). */
import * as THREE from 'three';
import { clamp, lerp, rng, ART, artInst, artMat, canvasTex, groundTex } from '../scene/kit.js';

export const MAP_W = 640, MAP_H = 360;

/* ───── 무늬 ───── */
function hash(ix, iz) { let h = Math.imul(ix, 374761393) + Math.imul(iz, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) { const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz); const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s / 0.9375; }
function ridged(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * (1 - Math.abs(vnoise(x * f + 31, z * f + 17) * 2 - 1)); f *= 2.1; a *= 0.5; } return s / 0.9375; }

/* ───── 골짜기 ───── */
export const VALLEYS = {
  main: [   /* 백운평 고갯마루 → 빈터 → 좁은 길 → 어귀 → 청산리 골짜기 → 갑산촌 → 천수평 → 어랑촌 */
    [-60, 178, 12, 5, 0.6, 0.6], [12, 174, 7, 8.5, 0.75, 0.75], [34, 172, 6, 10.5, 0.8, 0.8], [50, 170, 19, 4.2, 0.6, 0.5], [70, 170, 21, 3, 0.62, 0.55],
    [88, 169, 9, 2.4, 0.95, 0.72], [140, 168, 8, 1.7, 0.95, 0.7], [151, 168, 8, 1.5, 2.6, 0.7], [204, 168, 8, 1.0, 2.6, 0.72], [214, 168, 8, 0.9, 0.85, 0.72],
    [250, 168, 9, 0.3, 0.85, 0.7], [263, 169, 12, 0, 0.7, 0.6], [300, 173, 14, -0.8, 0.6, 0.6], [338, 182, 26, -1.6, 0.5, 0.5], [366, 182, 24, -2, 0.5, 0.5],
    [396, 178, 44, -2.6, 0.32, 0.4], [466, 180, 44, -3, 0.35, 0.4], [506, 188, 26, -2.6, 0.5, 0.5], [560, 196, 30, -2.2, 0.5, 0.45], [600, 192, 26, -2, 0.5, 0.5], [710, 186, 20, -1, 0.6, 0.6]],
  wanru: [[430, 178, 10, -2.8, 0.6, 0.6], [440, 120, 11, 2, 0.6, 0.6], [428, 60, 10, 6, 0.6, 0.6], [412, -50, 10, 12, 0.6, 0.6]],   /* 완루구 — 북쪽 갈래 */
  godong: [[10, 430, 12, -6, 0.55, 0.55], [48, 330, 12, -5.5, 0.55, 0.55], [120, 302, 13, -5, 0.5, 0.5], [200, 312, 12, -4.5, 0.5, 0.5], [280, 300, 13, -4, 0.5, 0.5], [360, 314, 12, -3.5, 0.5, 0.5], [440, 300, 12, -3, 0.5, 0.5], [520, 276, 10, -1, 0.55, 0.55], [640, 250, 10, 4, 0.6, 0.6]],   /* 고동하 물줄기 */
  gully: [[66, 191, 4, 3.4, 0.7, 0.7], [62, 240, 6, -1, 0.6, 0.6], [52, 300, 8, -5, 0.6, 0.6]] };   /* 빈터에서 고동하로 내려가는 골 */
/* 불룩·우묵: [x, z, 높이, 반지름] — 망바위 언덕 · 라 자리 앞 둔덕 · 다 자리 */
const BUMPS = [[236, 133, 8, 11], [256, 137, 5, 9], [121, 183.6, 3.6, 4.2], [222, 146, 1.5, 6], [176, 193, 1.2, 5]];

/* 꺾은선의 가장 가까운 점: 돌려주는 값 [거리(왼쪽 −, 오른쪽 +), 그 자리의 점 값들] */
const _seg = (P) => { const S = []; for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz; S.push({ a, b, dx, dz, L2, L: Math.sqrt(L2) }); } return S; };
const VSEG = Object.fromEntries(Object.entries(VALLEYS).map(([k, P]) => [k, _seg(P)]));
function nearest(segs, x, z) {
  let best = 1e9, bs = null, bt = 0;
  for (const s of segs) { let t = ((x - s.a[0]) * s.dx + (z - s.a[1]) * s.dz) / s.L2; t = clamp(t, 0, 1); const cx = s.a[0] + s.dx * t, cz = s.a[1] + s.dz * t, d = (x - cx) * (x - cx) + (z - cz) * (z - cz); if (d < best) { best = d; bs = s; bt = t; } }
  const cx = bs.a[0] + bs.dx * bt, cz = bs.a[1] + bs.dz * bt, cr = bs.dx * (z - cz) - bs.dz * (x - cx), d = Math.sqrt(best);
  const p = [0, 0, 0, 0, 0, 0]; for (let i = 2; i < 6; i++) p[i] = lerp(bs.a[i], bs.b[i], bt); p[0] = cx; p[1] = cz;
  return [cr < 0 ? -d : d, p];
}
function smin(a, b, k) { const h = clamp(0.5 + 0.5 * (b - a) / k, 0, 1); return lerp(b, a, h) - k * h * (1 - h); }
function mountain(x, z) {
  let m = 26 + 24 * ridged(x / 115, z / 115) + 9 * fbm(x / 38 + 7, z / 38 + 3);
  const ox = Math.max(0, -x, x - MAP_W), oz = Math.max(0, -z, z - MAP_H); m += (ox + oz) * 0.35;   /* 판 밖은 산이 높아진다 */
  return m;
}
/* 높이 · 골짜기 바닥에서 얼마나 올라왔나(올라가면 보인다) */
const _hc = new Map();
export function H(x, z) {
  let h = mountain(x, z);
  for (const k in VSEG) { const [d, p] = nearest(VSEG[k], x, z), ad = Math.abs(d), w = p[2], kk = d < 0 ? p[4] : p[5]; const carve = p[3] + (ad <= w ? 0 : kk * (ad - w) * (1 + 0.012 * (ad - w))) + (ad <= w ? 0.25 * fbm(x / 9, z / 9) : 0); h = smin(h, carve, 5); }
  for (const b of BUMPS) { const d2 = ((x - b[0]) ** 2 + (z - b[1]) ** 2) / (b[3] * b[3]); if (d2 < 4) h += b[2] * Math.exp(-d2 * 1.6); }
  return eorang(x, z, h);
}
/* 갑산촌 집 아홉(장 3 — 문 연 집 셋은 0 할머니 · 3 나무꾼 · 5 겁먹은 집): [x, z, 돌림] · 천수평 기병 야영지 */
export const GAPSAN = [[332, 190, 0.2], [340, 197, -0.1], [350, 190, 0.1], [358, 196, 0.3], [336, 181, 0], [347, 182, 0.2], [356, 183, -0.2], [328, 197, 0.4], [364, 189, 0]];
export const CAMP3 = [440, 179];
/* 어랑촌 뒤 고지(장 4): 우묵한 지휘소에서 부채꼴로 뻗은 능선 셋(왼·가운데·오른). 능선 사이는 골로 낮춘다. */
export const EORANG = { hq: [565, 104], spurs: [[[549, 114], [518, 142]], [[565, 118], [565, 146]], [[581, 114], [612, 142]]] };
function segD(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz; let t = ((x - a[0]) * dx + (z - a[1]) * dz) / L2; t = clamp(t, 0, 1); return [Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t), t]; }
function eorang(x, z, h) {
  const wx = clamp(Math.min(x - 488, 642 - x) / 16, 0, 1), wz = clamp(Math.min(z - 84, 168 - z) / 12, 0, 1), w = wx * wz; if (w <= 0) return h;
  let d = h - Math.min(11, Math.max(0, h - 6) * 0.65);
  for (const [a, b] of EORANG.spurs) { const [dd, t] = segD(x, z, a, b), crest = lerp(31, 21, t), r = crest - 0.075 * dd * dd - (t >= 1 ? 0.06 * dd * dd : 0); d = Math.max(d, r); }
  const hd = Math.hypot(x - EORANG.hq[0], z - EORANG.hq[1]); if (hd < 22) { const k = clamp(1 - (hd - 12) / 10, 0, 1); d = lerp(d, 26 + 0.25 * fbm(x / 6, z / 6), k); }
  return lerp(h, d, w);
}
export function floorAt(x, z) { const [, p] = nearest(VSEG.main, x, z); return p[3]; }
/* 큰 골짜기 가운데 줄에서 얼마나 떨어졌나(왼쪽 −) — 길 위인지 · 비탈 어디쯤인지 */
export function mainD(x, z) { return nearest(VSEG.main, x, z); }
/* 빠른 높이: 땅 그물 칸(2.5 m)을 겹선형으로 — 걷는 자리·사람 발밑에 매 걸음 쓴다 */
let GRID = null;
export function Hq(x, z) {
  if (!GRID) return H(x, z);
  const { x0, z0, cs, nx, nz, h } = GRID, fx = (x - x0) / cs, fz = (z - z0) / cs, ix = clamp(Math.floor(fx), 0, nx - 2), iz = clamp(Math.floor(fz), 0, nz - 2), tx = clamp(fx - ix, 0, 1), tz = clamp(fz - iz, 0, 1);
  const a = h[iz * nx + ix], b = h[iz * nx + ix + 1], c = h[(iz + 1) * nx + ix], d = h[(iz + 1) * nx + ix + 1];
  return lerp(lerp(a, b, tx), lerp(c, d, tx), tz);
}
/* 땅이 가리는가: a 에서 b 까지 땅 위로 선이 지나가는지(눈높이 포함 좌표) */
export function losClear(ax, ay, az, bx, by, bz, step = 4) {
  const L = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.ceil(L / step));
  for (let i = 1; i < n; i++) { const t = i / n, x = lerp(ax, bx, t), z = lerp(az, bz, t), y = lerp(ay, by, t); if (Hq(x, z) > y + 0.4) return false; }
  return true;
}
export function slopeAt(x, z) { const e = 1.2; return Math.hypot(Hq(x + e, z) - Hq(x - e, z), Hq(x, z + e) - Hq(x, z - e)) / (2 * e); }

/* ───── 자리 이름(지도·꼬리표) ───── */
export const ZONES = [
  { id: 'pass', name: '고갯마루', x: 34, z: 172 }, { id: 'baek', name: '백운평', x: 120, z: 168 }, { id: 'cheong', name: '청산리 골짜기', x: 290, z: 172 },
  { id: 'gapsan', name: '갑산촌', x: 345, z: 186 }, { id: 'cheonsu', name: '천수평', x: 432, z: 182 }, { id: 'eorang', name: '어랑촌', x: 562, z: 204 },
  { id: 'wanru', name: '완루구', x: 436, z: 92 }, { id: 'godong', name: '고동하', x: 200, z: 318 }, { id: 'ando', name: '안도 방면 ▼', x: 40, z: 350 }, { id: 'ido', name: '이도구 ▶', x: 612, z: 120 }];

/* ───── 땅 그물 ───── */
const C = { floor: new THREE.Color(0xc0a76c), dry: new THREE.Color(0x9a8a5c), slope: new THREE.Color(0x7d6e4e), forest: new THREE.Color(0x6a5a40), rock: new THREE.Color(0x8a8780), snow: new THREE.Color(0xeef2f6), road: new THREE.Color(0xa8916a), frost: new THREE.Color(0xd9d6c8), water: new THREE.Color(0x5a7a96) };
export function groundColor(x, z, h, sl, out) {
  const [d] = mainD(x, z), road = Math.abs(d) < 3.2 && x > 20 && x < 640 ? 1 : 0, n = fbm(x / 14, z / 14), up = h - floorAt(x, z);
  out.copy(C.floor).lerp(C.dry, clamp(up / 10, 0, 1) * 0.8 + n * 0.2);
  out.lerp(C.slope, clamp((up - 6) / 16, 0, 1) * 0.7);
  out.lerp(C.forest, clamp((up - 10) / 20, 0, 1) * 0.35 * n);
  out.lerp(C.rock, clamp((sl - 0.9) * 1.6, 0, 1));
  out.lerp(C.frost, clamp((h - 30) / 14, 0, 1) * 0.45);
  out.lerp(C.snow, clamp((h - 44) / 8, 0, 1));
  if (road) out.lerp(C.road, 0.75 - 0.25 * n);
  const [dg] = nearest(VSEG.godong, x, z); if (Math.abs(dg) < 4.5 && z > 220) out.copy(C.water);
  return out;
}
export function buildTerrain(scene, { x0 = -90, z0 = -90, x1 = MAP_W + 90, z1 = MAP_H + 90, cs = 2.5 } = {}) {
  const nx = Math.round((x1 - x0) / cs) + 1, nz = Math.round((z1 - z0) / cs) + 1, hh = new Float32Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) hh[j * nx + i] = H(x0 + i * cs, z0 + j * cs);
  GRID = { x0, z0, cs, nx, nz, h: hh };
  const pos = new Float32Array(nx * nz * 3), col = new Float32Array(nx * nz * 3), c = new THREE.Color(), sun = new THREE.Vector3(-0.5, 0.75, 0.42).normalize();
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i, x = x0 + i * cs, z = z0 + j * cs, h = hh[k];
    const hl = hh[j * nx + Math.max(0, i - 1)], hr = hh[j * nx + Math.min(nx - 1, i + 1)], hu = hh[Math.max(0, j - 1) * nx + i], hd = hh[Math.min(nz - 1, j + 1) * nx + i];
    const gx = (hr - hl) / (2 * cs), gz = (hd - hu) / (2 * cs), sl = Math.hypot(gx, gz), nl = 1 / Math.sqrt(gx * gx + gz * gz + 1), lit = clamp((-gx * sun.x + sun.y - gz * sun.z) * nl, 0, 1);
    groundColor(x, z, h, sl, c); const s = 0.62 + 0.5 * lit; pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z; col[k * 3] = c.r * s; col[k * 3 + 1] = c.g * s; col[k * 3 + 2] = c.b * s; }
  const idx = new Uint32Array((nx - 1) * (nz - 1) * 6); let q = 0;
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, cc = a + nx, d = cc + 1; if (Math.abs(hh[a] - hh[d]) < Math.abs(hh[b] - hh[cc])) { idx[q++] = a; idx[q++] = cc; idx[q++] = d; idx[q++] = a; idx[q++] = d; idx[q++] = b; } else { idx[q++] = a; idx[q++] = cc; idx[q++] = b; idx[q++] = b; idx[q++] = cc; idx[q++] = d; } }
  const uv = new Float32Array(nx * nz * 2); for (let k = 0; k < nx * nz; k++) { uv[k * 2] = pos[k * 3] / 9; uv[k * 2 + 1] = pos[k * 3 + 2] / 9; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, flatShading: false, map: groundTex() }));
  m.receiveShadow = true; m.frustumCulled = false; scene.add(m);
  /* 고동하 물낯 · 빈터 옆 샘 */
  const wm = new THREE.MeshStandardMaterial({ color: 0x6f93b4, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.85 });
  const river = []; for (const P of [VALLEYS.godong]) for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); const pl = new THREE.Mesh(new THREE.PlaneGeometry(9, L + 6), wm); pl.rotation.x = -Math.PI / 2; pl.rotation.z = -Math.atan2(b[0] - a[0], b[1] - a[1]); pl.position.set((a[0] + b[0]) / 2, (a[3] + b[3]) / 2 + 0.35, (a[1] + b[1]) / 2); scene.add(pl); river.push(pl); }
  return { mesh: m, grid: GRID };
}

/* 땅에 붙은 고리(비탈에서도 땅을 따라 휘게 — 한 번 놓으면 안 움직이는 것) */
export function groundRing(scene, x, z, r0, r1, color, opacity = 0.85, seg = 40) {
  const g = new THREE.RingGeometry(r0, r1, seg, 1); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, Hq(x + p.getX(i), z + p.getZ(i)) + 0.14);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false })); m.position.set(x, 0, z); m.renderOrder = 3; scene.add(m); return m;
}
/* 땅에 붙은 원판(붉은 산포 고리 안쪽 · 시야 부채) */
export function groundFan(scene, x, z, r, a0, a1, color, opacity = 0.3) {
  const n = 24, pos = [x, Hq(x, z) + 0.2, z], idx = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n), px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; pos.push(px, Hq(px, pz) + 0.2, pz); if (i) idx.push(0, i, i + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide })); m.renderOrder = 2; scene.add(m); return m;
}

/* ───── 숲: 가까운 곳(백운평)은 블렌더 나무, 먼 곳은 값싼 나무 ───── */
export function plantForest(scene, { avoid = () => false, seed = 1920, lite = false } = {}) {
  const r = rng(seed), near = { cs_birch: [], cs_birch_b: [], cs_larch: [], cs_spruce: [], cs_spruce_snow: [], cs_bush_dry: [], cs_grass_dry: [] }, far = { gold: [], dark: [], grey: [] }, put = [];
  const okTree = (x, z) => { const h = Hq(x, z), [d, vp] = mainD(x, z), w = Math.abs(d); if (w < Math.max(12, vp[2] + 3) && x < 650) return false; if (h > 50) return false; if (slopeAt(x, z) > 1.5) return false; if (avoid(x, z)) return false; return true; };
  /* 가까운 숲: 놀이 터(백운평 · 어랑촌 고지 …) — 블렌더 나무 */
  const NEAR = [[-20, 90, 300, 260, lite ? 900 : 1700], [470, 40, 660, 268, lite ? 450 : 900]];
  const inNear = (x, z) => NEAR.some((q) => x > q[0] && x < q[2] && z > q[1] && z < q[3]);
  for (const [nx0, nz0, nx1, nz1, nNear] of NEAR) for (let i = 0, tries = 0; i < nNear && tries < nNear * 8; tries++) { const x = nx0 + r() * (nx1 - nx0), z = nz0 + r() * (nz1 - nz0); if (!okTree(x, z)) continue; const h = Hq(x, z), up = h - floorAt(x, z), cl = fbm(x / 30, z / 30);
    if (up < 3 && r() < 0.8) continue; if (cl < 0.42 && r() < 0.75) continue;   /* 숲은 덩어리지게 */
    const nm = h > 34 ? (r() < 0.6 ? 'cs_spruce_snow' : 'cs_spruce') : up > 14 ? ['cs_spruce', 'cs_larch', 'cs_birch', 'cs_larch'][Math.floor(r() * 4)] : ['cs_birch', 'cs_birch_b', 'cs_larch', 'cs_birch'][Math.floor(r() * 4)];
    near[nm].push([x, h - 0.15, z, 0.75 + r() * 0.5, r() * 6.28]); put.push([x, z]); i++; }
  for (let i = 0, tries = 0; i < (lite ? 650 : 1400) && tries < 12000; tries++) { const q = r() < 0.8 ? [-10, 100, 290, 150] : [480, 60, 160, 110], x = q[0] + r() * q[2], z = q[1] + r() * q[3]; if (avoid(x, z)) continue; const [d] = mainD(x, z); if (Math.abs(d) < 4.5) continue; const h = Hq(x, z); if (h > 40) continue; (r() < 0.62 ? near.cs_grass_dry : near.cs_bush_dry).push([x, h - 0.05, z, 0.7 + r() * 0.7, r() * 6.28]); }
  /* 먼 숲: 나머지 판 전체(그림자 없음) */
  for (let i = 0, tries = 0; i < (lite ? 2600 : 5200) && tries < 40000; tries++) { const x = -60 + r() * 760, z = -60 + r() * 480; if (inNear(x, z)) continue; if (!okTree(x, z)) continue; const h = Hq(x, z), cl = fbm(x / 34 + 5, z / 34); if (cl < 0.4 && r() < 0.8) continue;
    const k = h > 32 ? 'dark' : r() < 0.45 ? 'gold' : r() < 0.6 ? 'grey' : 'dark'; far[k].push([x, h - 0.2, z, 1.6 + r() * 1.4, r() * 6.28]); i++; }
  const out = {};
  for (const nm in near) if (near[nm].length) { const shadow = !nm.includes('grass') && !nm.includes('bush'); out[nm] = artInst(scene, nm, near[nm], {}, { shadow }); }
  const FT = { gold: { leaf: 0xd4a040, bark: 0x6a4a30 }, dark: { leaf: 0x2e4a3a, bark: 0x4a3a2a }, grey: { leaf: 0x8a8070, bark: 0x9a948a } };
  for (const k in far) if (far[k].length) { const m = artInst(scene, 'cs_tree_far', far[k], FT[k], { shadow: false }); if (!m) { const g = new THREE.ConeGeometry(1.4, 5, 5); g.translate(0, 3, 0); const im = new THREE.InstancedMesh(g, new THREE.MeshLambertMaterial({ color: FT[k].leaf, flatShading: true }), far[k].length); const d = new THREE.Object3D(); far[k].forEach((t, i) => { d.position.set(t[0], t[1], t[2]); d.scale.setScalar(t[3]); d.rotation.set(0, t[4], 0); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }); im.frustumCulled = false; scene.add(im); } }
  return { near, far, put, out };
}

/* ───── 판 밖: 먼 산 세 겹(눈 덮인 산) · 하늘 — 카메라를 따라다닌다 ───── */
export function farRing(scene, seed = 7) {
  const r = rng(seed), far = new THREE.Group(); scene.add(far);
  const sg = new THREE.SphereGeometry(900, 32, 14), sp = sg.attributes.position, sc = new Float32Array(sp.count * 3); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
  const sky = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -3; far.add(sky);
  const cT = new THREE.Color(), cL = new THREE.Color(), cS = new THREE.Color(), cc = new THREE.Color();
  function paint(top, low, sunC, sunDir = [-0.6, 0.2, 0.3], k = 0.4) { cT.set(top); cL.set(low); cS.set(sunC); const sd = new THREE.Vector3(...sunDir).normalize(); for (let i = 0; i < sp.count; i++) { const x = sp.getX(i) / 900, y = sp.getY(i) / 900, z = sp.getZ(i) / 900, t = clamp(y / 0.55, 0, 1); cc.copy(cL).lerp(cT, Math.pow(t, 0.7)); const s = Math.max(0, x * sd.x + y * sd.y + z * sd.z); cc.lerp(cS, Math.pow(s, 6) * k); sc[i * 3] = cc.r; sc[i * 3 + 1] = cc.g; sc[i * 3 + 2] = cc.b; } sg.attributes.color.needsUpdate = true; }
  function ridge(R, hmin, hmax, c, snowC, seed2) { const N = 120, hs = []; let h = (hmin + hmax) / 2; for (let i = 0; i < N; i++) { h = clamp(h + (Math.sin(i * 1.37 + seed2) + (r() - 0.5) * 1.8) * (hmax - hmin) * 0.16, hmin, hmax); hs.push(h); }
    const pos = [], col = [], idx = [], c0 = new THREE.Color(c), cs = new THREE.Color(snowC);
    for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI * 2, hh = hs[i % N], top = hh > (hmin + hmax) * 0.6 ? cs : c0; pos.push(Math.cos(a) * R, -20, Math.sin(a) * R, Math.cos(a) * R, hh, Math.sin(a) * R); col.push(c0.r, c0.g, c0.b, top.r, top.g, top.b); if (i < N) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false, depthWrite: false })); m.renderOrder = -2; far.add(m); return m; }
  const ridges = [ridge(860, 60, 190, 0x8e98ae, 0xf2f4f8, 1), ridge(800, 40, 120, 0x7a8496, 0xdfe4ec, 4), ridge(740, 20, 70, 0x6c7464, 0xb8bcae, 9)];
  paint(0x8fb4dc, 0xe8e2d4, 0xffe2b0);
  function update(cam) { far.position.set(cam.position.x, 0, cam.position.z); }
  return { far, sky, paint, update, ridges };
}

/* ───── 작은 지도 그림(한 번 그려 두고 표시만 얹는다) ───── */
export function mapImage(scale = 0.5) {
  const w = Math.round(MAP_W * scale), h = Math.round(MAP_H * scale), cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'), im = g.createImageData(w, h), c = new THREE.Color();
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const x = i / scale, z = j / scale, hh = Hq(x, z), sl = slopeAt(x, z), lit = clamp(0.75 + (Hq(x - 2, z - 2) - Hq(x + 2, z + 2)) * 0.12, 0.35, 1.25); groundColor(x, z, hh, sl, c); const k = (j * w + i) * 4; im.data[k] = clamp(c.r * lit * 255, 0, 255); im.data[k + 1] = clamp(c.g * lit * 255, 0, 255); im.data[k + 2] = clamp(c.b * lit * 255, 0, 255); im.data[k + 3] = 255; }
  g.putImageData(im, 0, 0);
  return cv;
}
