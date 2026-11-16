/* 케이월드 · 그믐밤 — 조선 노비의 도망 한 장면(샘플 v2.1, 2026-11-17).
   원칙: 목표는 하나(강 건너 나루의 등불)이고 늘 화면에 보인다 · 글 카드 없음 · 한 행동마다 바로 결과 · 잡히면 끝이 아니라 다음 밤이 달라진다.
   v2: 수학 놀이터 섬과 같은 그림 방식(면이 적고 또렷한 색) · 시점 둘(위에서/가까이) · 할 일 셋(문서·옷·주먹밥)과 역사(인정·파루·호패·추노).
   v2.1: 시점 넷(위에서·가까이·어깨 너머·지도) + 돌려 보기(Q/E) + 당겨 보기(휠). 받아 온 모델로 바꾼 v3(k-edu ce81149)은 준호 반려로 되돌림.
   좌표: x 동쪽(+), z 남쪽(+). 강은 북쪽(z 0~6). */
import * as THREE from 'three';

const W = 70, H = 46;
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

/* ───── 무대 ───── */
/* 막는 것: [x0,z0,x1,z1,높이,종류] */
const SOLID = [
  [4, 22, 14, 22.7, 1.7, 'wall'], [16, 22, 30, 22.7, 1.7, 'wall'],
  [4, 43.3, 30, 44, 1.7, 'wall'],
  [4, 22, 4.7, 33, 1.7, 'wall'], [4, 35, 4.7, 44, 1.7, 'wall'],
  [29.3, 22, 30, 31, 1.7, 'wall'], [29.3, 35, 30, 44, 1.7, 'wall'],
  [8, 25.5, 19, 30.5, 3.4, 'tile'],      /* 안채 */
  [6, 38.5, 13, 42, 2.8, 'thatch'],      /* 행랑채 */
  [20.5, 37, 26.5, 41.5, 2.8, 'thatch'], /* 부엌 */
  [44, 20, 49, 23.5, 2.6, 'thatch'], [53, 19, 58, 22.5, 2.6, 'thatch'], [61, 21, 66, 24.5, 2.6, 'thatch'],
  [45, 30, 50, 33.5, 2.6, 'thatch'], [55, 29, 60, 32.5, 2.6, 'thatch'],
  [63, 8.5, 67.5, 12, 2.6, 'thatch'],
];
const SLOW = [
  { r: [14, 21.6, 16, 23.1], k: 0.3, name: 'wallgap' },
  { r: [3.6, 33, 5.1, 35], k: 0.3, name: 'drain' },
  { r: [0.5, 9, 3.4, 45], k: 0.45, name: 'stream' },
  { r: [0.5, 6.2, 52, 9.2], k: 0.5, name: 'reed', hide: true },
];
const HIDE = [
  [6.3, 32, 1.5, 'hay'], [26.5, 28.5, 1.5, 'jar'], [17, 36.5, 1.4, 'hay'],
  [24, 16, 1.5, 'hay'], [35, 13.5, 1.5, 'hay'], [10, 14, 1.5, 'hay'],
  [42.5, 26.5, 1.4, 'jar'], [51.5, 26, 1.5, 'hay'], [62.5, 28, 1.4, 'jar'], [52, 35.5, 1.5, 'hay'], [47.5, 15.5, 1.4, 'jar'],
  [36, 40, 1.5, 'hay'],
];
const TREES = [[9, 17, 2.4], [29, 12.5, 2.6], [17, 11.5, 2.2], [38, 19, 2.4], [40, 33, 2.3], [34, 24, 2.2], [68, 36, 2.4], [58, 14.5, 2.0]];
const STONES0 = [[11, 35.5], [27, 39.5], [22, 19.5], [44, 37], [56, 25.5], [6, 12]];
const RICE = [23.5, 35.6], DOC = [13.5, 31.6], CLOTH = [25.5, 32.2];
const DOG = [20.5, 18.5];
const START = [9.5, 36.6];
const BOAT = [59.5, 6.4], LAMP = [57.2, 7.6], FERRY = [55.2, 9.2];
const SHADOW_K = Math.hypot(22, 16) / 20;
const SD = (() => { const l = Math.hypot(22, 16); return [22 / l, 16 / l]; })();

const GUARDS0 = [
  { path: [[14, 34], [27.5, 34], [27.5, 24.5], [6, 24.5], [6, 34]] },
  { path: [[33, 30], [33, 38.5], [40, 38.5], [40, 30]] },
  { path: [[36, 12], [61, 12.5], [61, 15.5], [36, 15]] },
];
const EXTRA = [
  { path: [[20, 20], [38, 20], [38, 26], [32, 26]] },
  { path: [[50, 27], [64, 27], [64, 37], [50, 37]] },
  { path: [[8, 19.5], [26, 19.5], [26, 10.5], [8, 10.5]] },
];
const VILLAGER = { path: [[51.5, 24.5], [60.5, 26], [53, 34.5], [43.5, 28]] };

/* ───── 화면 ───── */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x16264c, 70, 190);
const cam = new THREE.PerspectiveCamera(38, 1, 0.5, 400);
const hemi = new THREE.HemisphereLight(0x9db8ff, 0x34507a, 1.25); scene.add(hemi);
const moon = new THREE.DirectionalLight(0xd6e4ff, 0.6);
moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -46, right: 46, top: 34, bottom: -34, near: 1, far: 120 });
moon.shadow.bias = -0.001; moon.shadow.normalBias = 0.06;
moon.position.set(W / 2 - 22 * 1.6, 20 * 1.6, H / 2 - 16 * 1.6); moon.target.position.set(W / 2, 0, H / 2);
scene.add(moon, moon.target);
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0, flatShading: true, ...o });
const box = (w, h, d, c, o) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c, o)); m.castShadow = m.receiveShadow = true; return m; };
const cyl = (rt, rb, h, c, seg = 10, o) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), M(c, o)); m.castShadow = m.receiveShadow = true; return m; };
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
const rnd = (() => { let a = 20261116; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
function canvasTex(w, h, fn) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; }

/* 하늘: 밤빛 둥근 지붕 · 별 · 달과 구름(가까이 시점에서 보인다) */
const skyMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false });
{ const g = new THREE.SphereGeometry(300, 24, 12), col = [], top = new THREE.Color(0x0a1230), low = new THREE.Color(0x2b4a86), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const t = clamp(p.getY(i) / 220, 0, 1), c = low.clone().lerp(top, t); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); scene.add(new THREE.Mesh(g, skyMat));
  const sp = []; for (let i = 0; i < 420; i++) { const a = rnd() * 6.28, e = 0.12 + rnd() * 1.3; sp.push(Math.cos(a) * Math.cos(e) * 280, Math.sin(e) * 280, Math.sin(a) * Math.cos(e) * 280); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 }))); }
const moonDisc = at(new THREE.Mesh(new THREE.SphereGeometry(9, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false })), W / 2 - 60, 96, -200); scene.add(moonDisc);
const moonCloud = new THREE.Group(); for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(16 + rnd() * 10, 7 + rnd() * 4, 6), new THREE.MeshBasicMaterial({ color: 0x3a4f80, fog: false })); b.position.set(k * 9 - 18, rnd() * 5, 0); moonCloud.add(b); } moonCloud.position.set(W / 2 - 60, 94, -192); scene.add(moonCloud);

/* 땅 */
const flat = (x0, z0, x1, z1, c, y = 0.02) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.1, z1 - z0), M(c)); m.position.set((x0 + x1) / 2, y - 0.05, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m); return m; };
flat(-40, -4, W + 40, H + 30, 0x58b85c, 0);
flat(4, 22, 30, 44, 0xe2c692, 0.03);                 /* 마당 */
flat(30, 31.2, 44, 34.8, 0xd9bd88, 0.03); flat(42, 16, 68, 40, 0xdcc18e, 0.03);
flat(52, 9, 56.5, 17, 0xd9bd88, 0.04); flat(34, 11, 62, 16, 0xd4b783, 0.035);
flat(0.5, 9, 3.4, 45, 0x3d8fd0, 0.05);                /* 개울 */
flat(0, 6.1, 52, 9.3, 0x6a9a4a, 0.04);                /* 갈대밭 바닥 */
for (let i = 0; i < 150; i++) { const x = rnd() * W, z = 9.5 + rnd() * (H - 10); if ((x > 4 && x < 30 && z > 22 && z < 44) || (x > 42 && z > 16 && z < 40) || x < 3.6) continue; const t = box(0.5 + rnd() * 0.9, 0.1, 0.5 + rnd() * 0.9, rnd() > 0.5 ? 0x6fcb6c : 0x4aa552); t.castShadow = false; at(t, x, 0.06, z); scene.add(t); }
for (let i = 0; i < 46; i++) { const t = box(0.4 + rnd() * 0.7, 0.08, 0.3 + rnd() * 0.5, 0xd2b684); t.castShadow = false; at(t, i % 2 ? 5 + rnd() * 24 : 43 + rnd() * 24, 0.07, i % 2 ? 23 + rnd() * 20 : 17 + rnd() * 22); scene.add(t); }
/* 강: 물결 */
const riverG = new THREE.PlaneGeometry(W + 120, 60, 50, 14); riverG.rotateX(-Math.PI / 2);
const river = new THREE.Mesh(riverG, new THREE.MeshStandardMaterial({ color: 0x2f7fd0, roughness: 0.25, metalness: 0.15, flatShading: true })); river.position.set(W / 2, 0.0, -24); river.receiveShadow = true; scene.add(river);
const riverBase = riverG.attributes.position.array.slice();
flat(-40, -70, W + 40, -52, 0x3f8f4c, 0.3);           /* 강 건너 */
for (let i = 0; i < 9; i++) { const h = box(3.2, 1.8, 2.6, 0xf2e3c2); at(h, 14 + i * 7 + (i % 2) * 2, 1.2, -56 - (i % 3) * 3); const r = box(3.9, 0.7, 3.3, 0xe2b04a); at(r, h.position.x, 2.4, h.position.z); const l = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.1), new THREE.MeshBasicMaterial({ color: 0xffd27a, fog: false })); at(l, h.position.x, 1.3, h.position.z + 1.35); scene.add(h, r, l); }

/* 집·담 — 가까이 시점에서 아이를 가리면 비쳐 보이게 하려고 묶음으로 둔다 */
const occl = [];
function group(r, parts) { const g = new THREE.Group(); for (const p of parts) g.add(p); scene.add(g); const mats = new Set(); g.traverse((o) => { if (o.isMesh) mats.add(o.material); }); occl.push({ g, r, mats: [...mats], a: 1 }); return g; }
function thatchHouse([x0, z0, x1, z1, h]) { const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, wh = h * 0.6, P = [];
  P.push(at(box(w, wh, d, 0xf3e4c4), cx, wh / 2, cz));
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) P.push(at(box(0.3, wh, 0.3, 0x8a5a2b), px, wh / 2, pz));
  P.push(at(box(1.2, wh * 0.72, 0.12, 0x7a4a26), cx, wh * 0.36, z1 + 0.04)); P.push(at(box(0.9, 0.7, 0.1, 0xfff6dc), cx + w * 0.3, wh * 0.6, z1 + 0.04));
  const cols = [0xd9a53c, 0xe4b54c, 0xefc661]; for (let k = 0; k < 3; k++) P.push(at(box(w + 1.5 - k * 1.5, 0.62, d + 1.5 - k * 1.3, cols[k]), cx, wh + 0.3 + k * 0.58, cz));
  group([x0, z0, x1, z1], P); }
function tileHouse([x0, z0, x1, z1, h]) { const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, wh = h * 0.62, P = [];
  P.push(at(box(w + 1.2, 0.4, d + 1.2, 0xb9b3a6), cx, 0.2, cz)); P.push(at(box(w, wh, d, 0xfaf3e3), cx, 0.4 + wh / 2, cz));
  for (let i = 0; i <= 4; i++) P.push(at(box(0.32, wh, 0.32, 0x7a3b22), x0 + (w * i) / 4, 0.4 + wh / 2, z1 + 0.02));
  for (let i = 0; i < 4; i++) P.push(at(box(w / 4 - 0.7, wh * 0.62, 0.1, i === 1 ? 0x6a4226 : 0xfff6dc), x0 + (w * (i + 0.5)) / 4, 0.4 + wh * 0.42, z1 + 0.05));
  const s = new THREE.Shape(), half = d / 2 + 1.2; s.moveTo(-half, 0); s.lineTo(-half + 0.5, 0.35); s.lineTo(0, 1.9); s.lineTo(half - 0.5, 0.35); s.lineTo(half, 0); s.closePath();
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: w + 2.2, bevelEnabled: false }), M(0x46527a)); roof.rotation.y = Math.PI / 2; roof.position.set(x0 - 1.1, 0.4 + wh, cz); roof.castShadow = roof.receiveShadow = true; P.push(roof);
  P.push(at(box(w + 2.5, 0.3, 0.5, 0x323b5c), cx, 0.4 + wh + 2.0, cz));
  group([x0, z0, x1, z1], P); }
function wall([x0, z0, x1, z1, h]) { const w = x1 - x0, d = z1 - z0, P = [at(box(w, h, d, 0xcdbb98), (x0 + x1) / 2, h / 2, (z0 + z1) / 2), at(box(w + 0.3, 0.26, d + 0.3, 0x46527a), (x0 + x1) / 2, h + 0.13, (z0 + z1) / 2)];
  const n = Math.max(1, Math.round(Math.max(w, d) / 2.2)); for (let i = 0; i < n; i++) { const s = box(w > d ? 0.9 : w + 0.06, 0.4, w > d ? d + 0.06 : 0.9, 0xb8a37e); s.castShadow = false; at(s, w > d ? x0 + ((i + 0.5) * w) / n : (x0 + x1) / 2, 0.5 + (i % 2) * 0.5, w > d ? (z0 + z1) / 2 : z0 + ((i + 0.5) * d) / n); P.push(s); }
  group([x0, z0, x1, z1], P); }
for (const s of SOLID) (s[5] === 'wall' ? wall : s[5] === 'tile' ? tileHouse : thatchHouse)(s);
/* 무너진 담 · 수챗구멍 · 대문 */
scene.add(at(box(2, 0.5, 0.7, 0xcdbb98), 15, 0.25, 22.35)); for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26 + (i % 3) * 0.1, 0), M(0xb8a37e)); at(s, 13.7 + i * 0.45, 0.2, 21.4 + (i % 2) * 1.9); s.castShadow = true; scene.add(s); }
scene.add(at(box(0.7, 0.9, 2, 0xcdbb98), 4.35, 1.25, 34), at(box(0.3, 0.26, 2.3, 0x46527a), 4.35, 1.83, 34), at(box(1.6, 0.06, 1.2, 0x3d8fd0), 4.2, 0.06, 34));
scene.add(at(box(0.5, 2.8, 0.5, 0x7a3b22), 29.65, 1.4, 30.9), at(box(0.5, 2.8, 0.5, 0x7a3b22), 29.65, 1.4, 35.1), at(box(1.6, 0.4, 5.6, 0x46527a), 29.65, 3.0, 33));

const hideMeshes = [];
for (const [x, z, r, kind] of HIDE) { const g = new THREE.Group(); g.position.set(x, 0, z);
  if (kind === 'hay') { g.add(at(cyl(r * 0.6, r * 0.95, 1.3, 0xe4b54c, 8), 0, 0.65, 0), at(cyl(r * 0.2, r * 0.66, 0.9, 0xefc661, 8), 0, 1.75, 0)); }
  else for (let i = 0; i < 4; i++) { const j = new THREE.Group(); j.add(at(cyl(0.42, 0.3, 0.5, 0x8a4f33, 8), 0, 0.25, 0), at(cyl(0.3, 0.42, 0.5, 0x8a4f33, 8), 0, 0.75, 0), at(cyl(0.34, 0.34, 0.08, 0x5e3320, 8), 0, 1.04, 0)); j.position.set(Math.cos(i * 1.7) * 0.72, 0, Math.sin(i * 1.7) * 0.72); j.scale.setScalar(0.9 + (i % 2) * 0.25); g.add(j); }
  scene.add(g); hideMeshes.push(g); }
for (const [x, z, r] of TREES) { const P = [at(cyl(0.24, 0.36, 2.4, 0x7a4f2b, 7), x, 1.2, z)], cols = [0x2f8f55, 0x3aa866, 0x4cbf78]; for (let k = 0; k < 3; k++) { const b = box((r * 1.5 - k * 0.8), 1.1, (r * 1.5 - k * 0.8), cols[k]); b.rotation.y = k * 0.5; P.push(at(b, x, 2.7 + k * 0.95, z)); } group([x - 1.6, z - 0.4, x + 1.6, z + 0.4], P); }
/* 갈대 */
{ const geo = new THREE.BoxGeometry(0.1, 1.4, 0.1), im = new THREE.InstancedMesh(geo, M(0xb5c86a), 700), o = new THREE.Object3D();
  for (let i = 0; i < 700; i++) { o.position.set(0.5 + rnd() * 51.5, 0.7, 6.2 + rnd() * 3); o.rotation.set((rnd() - 0.5) * 0.3, rnd() * 3, (rnd() - 0.5) * 0.3); o.scale.set(1, 0.7 + rnd() * 0.7, 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); } scene.add(im);
  const tip = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.34, 0.16), M(0x8a6a3a), 220); for (let i = 0; i < 220; i++) { o.position.set(0.5 + rnd() * 51.5, 1.5 + rnd() * 0.3, 6.2 + rnd() * 3); o.rotation.set(0, 0, 0); o.scale.setScalar(1); o.updateMatrix(); tip.setMatrixAt(i, o.matrix); } scene.add(tip); }
/* 나루 · 배 · 등불 */
scene.add(at(box(3.4, 0.3, 4.6, 0x9a6a3a), 55.2, 0.25, 7.4)); for (const [px, pz] of [[53.8, 5.4], [56.6, 5.4], [53.8, 9.4], [56.6, 9.4]]) scene.add(at(cyl(0.16, 0.16, 1.0, 0x6a4526, 6), px, 0.3, pz));
const boat = new THREE.Group(); boat.add(at(box(4.2, 0.5, 1.5, 0x8a5a2b), 0, 0.3, 0), at(box(0.9, 0.5, 1.1, 0x8a5a2b), 2.5, 0.42, 0), at(box(0.9, 0.5, 1.1, 0x8a5a2b), -2.5, 0.42, 0), at(box(3.6, 0.1, 1.1, 0xb98a55), 0, 0.5, 0)); boat.position.set(BOAT[0], 0, BOAT[1]); scene.add(boat);
scene.add(at(cyl(0.1, 0.12, 3.0, 0x6a4526, 6), LAMP[0], 1.5, LAMP[1]), at(box(1.1, 0.1, 0.1, 0x6a4526), LAMP[0] + 0.45, 2.95, LAMP[1]));
const lamp = new THREE.Group(); lamp.add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.62), new THREE.MeshBasicMaterial({ color: 0xff5a4a })), at(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.62), new THREE.MeshBasicMaterial({ color: 0x4a8cff })), 0, -0.42, 0), at(box(0.7, 0.08, 0.7, 0x2a2a33), 0, 0.25, 0)); lamp.position.set(LAMP[0] + 0.9, 2.5, LAMP[1]); scene.add(lamp);
const lampL = new THREE.PointLight(0xffb347, 34, 24, 1.6); lampL.position.copy(lamp.position); scene.add(lampL);
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,225,150,.95)'); r.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }), depthTest: false, transparent: true, blending: THREE.AdditiveBlending, fog: false }));
glow.scale.set(8, 8, 1); glow.position.copy(lamp.position); scene.add(glow);

/* 사람 — 섬과 같은 네모 사람 */
const faceTex = (skin, mood) => canvasTex(64, 64, (g) => { g.fillStyle = skin; g.fillRect(0, 0, 64, 64); g.fillStyle = '#2b2118'; g.fillRect(16, 26, 8, 9); g.fillRect(40, 26, 8, 9); if (mood === 'stern') { g.fillRect(12, 19, 14, 4); g.fillRect(38, 19, 14, 4); g.fillRect(22, 46, 20, 4); } else { g.fillRect(24, 46, 16, 4); } });
function person({ shirt, pants, hat, mood = 'soft', lantern = false }) {
  const g = new THREE.Group(), skin = M(0xffd9a8), face = new THREE.MeshStandardMaterial({ map: faceTex('#ffd9a8', mood), roughness: 0.85 });
  const legL = new THREE.Group(), legR = new THREE.Group(); legL.add(at(box(0.26, 0.62, 0.3, pants), 0, -0.31, 0)); legR.add(at(box(0.26, 0.62, 0.3, pants), 0, -0.31, 0)); legL.position.set(-0.17, 0.62, 0); legR.position.set(0.17, 0.62, 0);
  const body = at(box(0.7, 0.72, 0.42, shirt), 0, 0.98, 0), skirt = at(box(0.78, 0.22, 0.5, shirt), 0, 0.7, 0);
  const armL = new THREE.Group(), armR = new THREE.Group(); armL.add(at(box(0.2, 0.6, 0.24, shirt), 0, -0.26, 0)); armR.add(at(box(0.2, 0.6, 0.24, shirt), 0, -0.26, 0)); armL.position.set(-0.46, 1.28, 0); armR.position.set(0.46, 1.28, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.58), [skin, skin, skin, skin, face, skin]); head.position.y = 1.66; head.castShadow = true;
  const top = new THREE.Group(); top.position.y = 0; g.add(legL, legR, body, skirt, armL, armR, head, top);
  if (hat === 'guard') { top.add(at(cyl(0.56, 0.6, 0.08, 0x1c1c26, 10), 0, 1.98, 0), at(cyl(0.24, 0.3, 0.36, 0x1c1c26, 8), 0, 2.18, 0), at(box(0.14, 0.14, 0.14, 0xe24a3a), 0, 2.42, 0)); }
  else if (hat === 'gat') { top.add(at(cyl(0.62, 0.62, 0.05, 0x1a1a1a, 12), 0, 1.98, 0), at(cyl(0.22, 0.26, 0.44, 0x1a1a1a, 8), 0, 2.2, 0)); }
  else if (hat === 'satgat') { const c = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.5, 8), M(0xd8b76a)); c.castShadow = true; top.add(at(c, 0, 2.18, 0)); }
  else { top.add(at(box(0.62, 0.2, 0.62, 0x2b2118), 0, 1.98, 0), at(box(0.2, 0.22, 0.2, 0x2b2118), 0, 2.16, -0.05)); }
  if (lantern) { armR.rotation.x = -1.1; const l = new THREE.Group(); l.add(at(cyl(0.03, 0.03, 0.9, 0x6a4526, 5), 0, 0, 0), at(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.3), new THREE.MeshBasicMaterial({ color: 0xffd27a })), 0, -0.5, 0)); l.rotation.x = Math.PI / 2; l.position.set(0.46, 1.1, 0.7); g.add(l); }
  g.userData = { legL, legR, armL, armR, body, skirt, lantern };
  scene.add(g); return g;
}
function walkAnim(g, phase, moving, limp = 0) { const u = g.userData, s = moving ? Math.sin(phase) : 0; u.legL.rotation.x = s * 0.7; u.legR.rotation.x = -s * (limp ? 0.25 : 0.7); u.armL.rotation.x = -s * 0.6; if (!u.lantern) u.armR.rotation.x = s * 0.6; }
const pMesh = person({ shirt: 0xf6f1e4, pants: 0x9a8a72, hat: 'top' });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const dog = new THREE.Group(); dog.add(at(box(0.9, 0.42, 0.4, 0xd9a35c), 0, 0.5, 0), at(box(0.4, 0.4, 0.42, 0xd9a35c), 0.6, 0.72, 0), at(box(0.12, 0.2, 0.1, 0x8a5a2b), 0.66, 1.0, 0.14), at(box(0.12, 0.2, 0.1, 0x8a5a2b), 0.66, 1.0, -0.14), at(box(0.12, 0.34, 0.12, 0xd9a35c), -0.5, 0.82, 0)); for (const [lx, lz] of [[0.3, 0.14], [0.3, -0.14], [-0.3, 0.14], [-0.3, -0.14]]) dog.add(at(box(0.14, 0.3, 0.14, 0xc48d48), lx, 0.15, lz)); dog.position.set(DOG[0], 0, DOG[1]); scene.add(dog);
const boatman = person({ shirt: 0x8fa3b8, pants: 0x6a7686, hat: 'satgat' }); boatman.position.set(FERRY[0], 0.4, FERRY[1]);
/* 할 일의 물건: 주먹밥 · 문서 궤 · 빨랫줄 */
const riceMesh = new THREE.Group(); riceMesh.add(at(box(0.5, 0.06, 0.5, 0x8a5a2b), 0, 0, 0), new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 0), M(0xffffff, { emissive: 0x666655 })), at(box(0.2, 0.12, 0.3, 0x24402a), 0, -0.08, 0.16)); riceMesh.children[1].position.y = 0.22; riceMesh.position.set(RICE[0], 0.5, RICE[1]); scene.add(riceMesh);
const docMesh = new THREE.Group(); docMesh.add(at(box(1.0, 0.6, 0.6, 0x7a3b22), 0, 0.3, 0), at(box(1.06, 0.1, 0.66, 0x5a2a16), 0, 0.64, 0), at(box(0.14, 0.2, 0.06, 0xffcf4d), 0, 0.36, 0.32), at(box(0.5, 0.06, 0.36, 0xfff6dc, { emissive: 0x554422 }), 0, 0.74, 0)); docMesh.position.set(DOC[0], 0, DOC[1]); scene.add(docMesh);
const fire = new THREE.Group(); for (let k = 0; k < 3; k++) fire.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.22 - k * 0.05, 0.5 + k * 0.1, 5), new THREE.MeshBasicMaterial({ color: [0xff5a2a, 0xffa23a, 0xffe07a][k] })), (k - 1) * 0.16, 1.05 + k * 0.05, 0)); fire.position.set(DOC[0], 0, DOC[1]); fire.visible = false; scene.add(fire);
const fireL = new THREE.PointLight(0xff8a3a, 0, 14, 1.6); fireL.position.set(DOC[0], 1.4, DOC[1]); scene.add(fireL);
const clothMesh = new THREE.Group(); clothMesh.add(at(cyl(0.07, 0.07, 2.2, 0x7a4f2b, 5), -1.5, 1.1, 0), at(cyl(0.07, 0.07, 2.2, 0x7a4f2b, 5), 1.5, 1.1, 0), at(box(3.0, 0.04, 0.04, 0xd8c9a0), 0, 2.1, 0), at(box(0.9, 0.9, 0.06, 0x7fc8c0), -0.6, 1.62, 0), at(box(0.8, 0.7, 0.06, 0xf6f1e4), 0.55, 1.72, 0)); clothMesh.position.set(CLOTH[0], 0, CLOTH[1]); scene.add(clothMesh);
const stoneGeo = new THREE.DodecahedronGeometry(0.2, 0), stoneMat = M(0xd6dbe6, { emissive: 0x39404e });
const flying = new THREE.Mesh(stoneGeo, stoneMat); flying.visible = false; scene.add(flying);
const rings = [];
function ring(x, z, r, col = 0xffffff) { const m = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.1, z); scene.add(m); rings.push({ m, r, t: 0 }); }

/* ───── 길찾기 · 시야 ───── */
const grid = new Uint8Array(W * H);
function inRect(x, z, r, pad = 0) { return x > r[0] - pad && x < r[2] + pad && z > r[1] - pad && z < r[3] + pad; }
for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { const cx = x + 0.5, cz = z + 0.5; let b = cz < 6.6 || cx < 3.6;
  for (const s of SOLID) if (inRect(cx, cz, s, 0.55)) b = true;
  if (inRect(cx, cz, [14, 21.6, 16, 23.1]) || inRect(cx, cz, [3.6, 33, 5.1, 35])) b = true;
  grid[z * W + x] = b ? 1 : 0; }
function findPath(ax, az, bx, bz) {
  const s = clamp(az | 0, 0, H - 1) * W + clamp(ax | 0, 0, W - 1); let e = clamp(bz | 0, 0, H - 1) * W + clamp(bx | 0, 0, W - 1);
  if (grid[e]) { let best = -1, bd = 1e9; for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) { const x = (bx | 0) + dx, z = (bz | 0) + dz; if (x < 0 || z < 0 || x >= W || z >= H || grid[z * W + x]) continue; const d = dx * dx + dz * dz; if (d < bd) { bd = d; best = z * W + x; } } if (best < 0) return null; e = best; }
  const prev = new Int32Array(W * H).fill(-1), q = new Int32Array(W * H); let qh = 0, qt = 0; q[qt++] = s; prev[s] = s;
  const N = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  while (qh < qt) { const c = q[qh++]; if (c === e) break; const cx = c % W, cz = (c / W) | 0;
    for (const [dx, dz] of N) { const x = cx + dx, z = cz + dz; if (x < 0 || z < 0 || x >= W || z >= H) continue; const n = z * W + x; if (prev[n] >= 0 || grid[n]) continue; if (dx && dz && (grid[cz * W + x] || grid[z * W + cx])) continue; prev[n] = c; q[qt++] = n; } }
  if (prev[e] < 0) return null; const out = []; let c = e; while (c !== s) { out.push([(c % W) + 0.5, ((c / W) | 0) + 0.5]); c = prev[c]; } return out.reverse();
}
function clip(ax, az, dx, dz, r, max) { let t0 = 0, t1 = max; for (const [p, q] of [[-dx, ax - r[0]], [dx, r[2] - ax], [-dz, az - r[1]], [dz, r[3] - az]]) { if (p === 0) { if (q < 0) return -1; } else { const t = q / p; if (p < 0) { if (t > t1) return -1; if (t > t0) t0 = t; } else { if (t < t0) return -1; if (t < t1) t1 = t; } } } return t0; }
function los(ax, az, bx, bz) { for (const s of SOLID) if (clip(ax, az, bx - ax, bz - az, s, 1) >= 0) return false; return true; }
function rayLen(ax, az, dx, dz, max) { let best = max; for (const r of SOLID) { const t = clip(ax, az, dx, dz, r, max); if (t >= 0 && t < best) best = t; } return best; }
function shaded(x, z) {
  for (const s of SOLID) { const L = s[4] * SHADOW_K; for (let i = 0; i <= 6; i++) { const t = (i / 6) * L; if (inRect(x - SD[0] * t, z - SD[1] * t, s, 0.1)) return true; } }
  for (const [tx, tz, r] of TREES) { if (dist(x, z, tx + SD[0] * 3.2, tz + SD[1] * 3.2) < r * 1.05 || dist(x, z, tx, tz) < r * 0.8) return true; }
  for (const [hx, hz, r] of HIDE) if (dist(x, z, hx + SD[0] * 1.2, hz + SD[1] * 1.2) < r) return true;
  return false;
}

/* ───── 소리 ───── */
let AC = null;
function audio() { if (!AC) try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* 소리 없이 */ } return AC; }
function tone(f0, f1, dur, type = 'sine', vol = 0.2, when = 0) { const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + when; o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05); }
function noise(dur, vol = 0.2, freq = 900, when = 0) { const a = audio(); if (!a) return; const n = a.sampleRate * dur, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol; s.connect(f).connect(g).connect(a.destination); s.start(a.currentTime + when); }
const SFX = {
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  whistle: () => { tone(2100, 2500, 0.28, 'square', 0.12); tone(2500, 2000, 0.3, 'square', 0.12, 0.3); },
  bark: () => { noise(0.13, 0.5, 700); noise(0.13, 0.5, 620, 0.22); noise(0.15, 0.5, 700, 0.5); },
  clack: () => { noise(0.07, 0.5, 2400); noise(0.05, 0.3, 1800, 0.12); },
  step: () => noise(0.05, 0.12, 300),
  pick: () => { tone(660, 990, 0.12, 'triangle', 0.16); },
  done: () => { tone(523, 523, 0.14, 'triangle', 0.16); tone(784, 784, 0.22, 'triangle', 0.16, 0.14); },
  huh: () => tone(300, 420, 0.18, 'sawtooth', 0.07),
  bell: (n = 3) => { for (let i = 0; i < n; i++) { tone(196, 190, 1.6, 'sine', 0.22, i * 1.1); tone(392, 388, 1.2, 'sine', 0.07, i * 1.1); } },
  rooster: () => { tone(700, 1100, 0.25, 'sawtooth', 0.12); tone(1100, 900, 0.2, 'sawtooth', 0.12, 0.25); tone(900, 1300, 0.5, 'sawtooth', 0.12, 0.45); },
  burn: () => { for (let i = 0; i < 6; i++) noise(0.12, 0.2, 1200 + i * 200, i * 0.1); },
  caught: () => { tone(220, 70, 0.7, 'sawtooth', 0.2); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  cloud: () => tone(180, 260, 0.6, 'sine', 0.08),
};

/* ───── 상태 ───── */
const S = { mode: 'title', night: 1, caught: 0, limp: 0, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, dawn: 0, DAWN: 170, moonT: 0, moonOut: false, moonSoon: false, mk: 0, meter: 0, alert: false, stones: 3, rice: false, doc: false, cloth: false, seen: false, workT: 0,
  px: START[0], pz: START[1], pdir: 0, moving: false, running: false, hidden: false, inShade: true, slow: null, route: {}, stepT: 0, beatT: 0, sayT: 0, said: {}, win: null, dogT: 0, boatmanA: 0, boatmanT: 0, fly: null, ground: [], introT: 0, fireT: 0 };
let guards = [];
function mkCone(col) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(26 * 3), 3)); const idx = []; for (let i = 1; i < 25; i++) idx.push(0, i + 1, i); geo.setIndex(idx); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = 2; scene.add(m); return m; }
function mkGuard(def, kind = 'guard') {
  const g = { def, kind, x: def.path[0][0], z: def.path[0][1], dir: 0, wp: 1, state: 'patrol', path: null, pi: 0, tx: 0, tz: 0, wait: 0, lost: 0, repath: 0, see: 0, shout: 0, light: null,
    mesh: kind === 'guard' ? person({ shirt: 0x3f5fb0, pants: 0x2c3e73, hat: 'guard', mood: 'stern', lantern: true }) : person({ shirt: 0xe8e2d2, pants: 0xb9b09a, hat: 'gat' }),
    cone: mkCone(kind === 'guard' ? 0xffc65a : 0xd8e2ff) };
  if (kind === 'guard') { g.light = new THREE.PointLight(0xffa640, 10, 9, 1.6); scene.add(g.light); }
  return g;
}
function clearGuards() { for (const g of guards) { scene.remove(g.mesh, g.cone); if (g.light) scene.remove(g.light); } guards = []; }
const ferryCone = mkCone(0xd8e2ff);
let stoneMeshes = [];
function resetNight() {
  clearGuards();
  const defs = GUARDS0.concat(EXTRA.slice(0, Math.min(EXTRA.length, S.night - 1)));
  guards = defs.map((d) => mkGuard(d)); guards.push(mkGuard(VILLAGER, 'villager'));
  Object.assign(S, { t: 0, dawn: 0, moonT: 6, moonOut: false, moonSoon: false, mk: 0, meter: 0, alert: false, stones: 3, rice: false, doc: false, cloth: false, seen: false, workT: 0, px: START[0], pz: START[1], pdir: -Math.PI / 2, moving: false, hidden: false, route: {}, win: null, dogT: 0, fly: null, roosted: false, fireT: 0, ferryShout: 0 });
  riceMesh.visible = true; docMesh.visible = true; fire.visible = false; fireL.intensity = 0; clothMesh.children[3].visible = true; boat.position.set(BOAT[0], 0, BOAT[1]); pMesh.visible = true; pMesh.userData.body.material.color.set(0xf6f1e4); pMesh.userData.skirt.material.color.set(0xf6f1e4);
  for (const m of stoneMeshes) scene.remove(m); stoneMeshes = [];
  S.ground = STONES0.map(([x, z]) => { const m = new THREE.Mesh(stoneGeo, stoneMat); m.position.set(x, 0.2, z); m.castShadow = true; scene.add(m); stoneMeshes.push(m); return { x, z, m, on: true }; });
  hud();
}
function hud() { $('hStone').textContent = '🪨 ' + S.stones; const l = $('hLimp'); l.style.display = S.limp ? '' : 'none'; l.textContent = '🦵 절뚝' + (S.limp > 1 ? ' ×' + S.limp : ''); $('tDoc').className = S.doc ? 'on' : ''; $('tCloth').className = S.cloth ? 'on' : ''; $('tRice').className = S.rice ? 'on' : ''; }
function say(text, key, sec = 2.6) { if (key) { if (S.said[key]) return; S.said[key] = 1; } const e = $('say'); e.textContent = text; e.style.opacity = 1; S.sayT = sec; }

/* ───── 입력 ───── */
const keys = {}; let stickX = 0, stickZ = 0, runHeld = false;
const VIEWS = ['위에서', '가까이', '어깨 너머', '지도'];
function toggleView() { S.view = (S.view + 1) % VIEWS.length; S.camYaw = S.pdir; $('bView').textContent = '👁 ' + VIEWS[S.view]; $('rot').style.display = S.view < 2 ? '' : 'none'; say(S.view === 2 ? '어깨 너머 — 좌우로 몸을 틀고, 앞뒤로 걷는다' : S.view === 3 ? '지도처럼 한눈에 본다' : VIEWS[S.view] + ' 본다', null, 1.8); }
function turnView(d) { if (S.view > 1) return; S.yawT += d * Math.PI / 2; }
const yawNow = () => (S.view < 2 ? S.yaw : 0);
addEventListener('keydown', (e) => { keys[e.code] = true; if (e.code === 'KeyV' && !e.repeat) toggleView(); if (e.code === 'KeyQ' && !e.repeat) turnView(-1); if (e.code === 'KeyE' && !e.repeat) turnView(1); if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault(); });
addEventListener('keyup', (e) => { keys[e.code] = false; });
$('bView').addEventListener('pointerdown', (e) => { e.stopPropagation(); toggleView(); });
$('bL').addEventListener('pointerdown', (e) => { e.stopPropagation(); turnView(-1); }); $('bR').addEventListener('pointerdown', (e) => { e.stopPropagation(); turnView(1); });
addEventListener('wheel', (e) => { S.zoom = clamp(S.zoom + Math.sign(e.deltaY) * 0.1, 0.6, 1.5); }, { passive: true });
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (isTouch) { document.body.classList.add('touch'); $('keys').textContent = '왼쪽 동그라미로 걷기 · 「뛰기」는 소리가 남 · 땅을 누르면 돌 던지기 · 「시점」으로 보는 자리 바꾸기, ⟲⟳ 로 돌려 보기'; }
{ const st = $('stick'), nub = st.firstElementChild; let id = null;
  const mv = (e) => { const r = st.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dz = e.clientY - (r.top + r.height / 2), l = Math.hypot(dx, dz), m = Math.min(l, 50); stickX = l > 8 ? (dx / l) * (m / 50) : 0; stickZ = l > 8 ? (dz / l) * (m / 50) : 0; nub.style.transform = `translate(${(dx / (l || 1)) * m}px,${(dz / (l || 1)) * m}px)`; };
  st.addEventListener('pointerdown', (e) => { id = e.pointerId; st.setPointerCapture(id); mv(e); e.stopPropagation(); });
  st.addEventListener('pointermove', (e) => { if (e.pointerId === id) mv(e); });
  const up = (e) => { if (e.pointerId === id) { id = null; stickX = stickZ = 0; nub.style.transform = ''; } }; st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
  const br = $('bRun'); br.addEventListener('pointerdown', (e) => { runHeld = true; e.stopPropagation(); }); const ru = () => { runHeld = false; }; br.addEventListener('pointerup', ru); br.addEventListener('pointercancel', ru); br.addEventListener('pointerleave', ru); }
const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), v2 = new THREE.Vector2(), v3 = new THREE.Vector3(), v3b = new THREE.Vector3();
canvas.addEventListener('pointerdown', (e) => { if (S.mode === 'intro') { S.introT = 99; return; } if (S.mode !== 'play' || S.fly || S.stones < 1) return; v2.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(v2, cam); if (!ray.ray.intersectPlane(plane, v3)) return;
  let tx = v3.x, tz = v3.z; const d = dist(S.px, S.pz, tx, tz); if (d < 1.2) return; if (d > 15) { tx = S.px + ((tx - S.px) / d) * 15; tz = S.pz + ((tz - S.pz) / d) * 15; }
  S.stones--; hud(); S.fly = { x0: S.px, z0: S.pz, x1: clamp(tx, 1, W - 1), z1: clamp(tz, 6.5, H - 1), t: 0 }; flying.visible = true; });

/* ───── 순라꾼 ───── */
function makeNoise(x, z, r, strong) { ring(x, z, r, strong ? 0xff8a5a : 0xffffff); for (const g of guards) { if (g.kind !== 'guard' || g.state === 'chase') continue; if (dist(g.x, g.z, x, z) <= r) { g.state = 'look'; g.tx = x; g.tz = z; g.path = null; g.wait = 2.6; SFX.huh(); } } }
function alertAll() { if (S.alert) return; S.alert = true; S.seen = true; SFX.whistle(); for (const g of guards) if (g.kind === 'guard' && dist(g.x, g.z, S.px, S.pz) < 30) { g.state = 'chase'; g.path = null; g.lost = 0; g.tx = S.px; g.tz = S.pz; } say('"게 섰거라!" — 들켰다, 숨어!', null, 1.9); }
function stepGuard(g, dt) {
  const moonK = S.moonOut && !S.inShade, guard = g.kind === 'guard';
  const range = (guard ? 10 : 6.5) * (moonK ? 1.6 : 1), half = (guard ? 0.56 : 0.5) * (moonK ? 1.25 : 1);
  const d = dist(g.x, g.z, S.px, S.pz); let sees = false;
  if (d < range) { let a = Math.atan2(S.pz - g.z, S.px - g.x) - g.dir; a = Math.atan2(Math.sin(a), Math.cos(a)); if ((Math.abs(a) < half || d < 1.5) && los(g.x, g.z, S.px, S.pz) && !(S.hidden && d > 1.7)) sees = true; }
  g.see = sees ? 1 : 0;
  const plain = S.cloth && !S.running; /* 상민 옷: 걸어 다니면 덜 의심받는다 */
  if (sees && S.mode === 'play') {
    if (guard) { S.meter += (dt / lerp(0.3, 1.15, clamp(d / range, 0, 1))) * (plain && d > 3 ? 0.45 : 1); if (g.state !== 'chase' && S.meter > 0.35) { g.state = 'look'; g.tx = S.px; g.tz = S.pz; g.path = null; g.wait = 1.5; } }
    else if (!plain) { g.shout += dt; if (g.shout > 1.3) { g.shout = -4; say('"이 밤중에 뉘시오!"', null, 1.7); makeNoise(g.x, g.z, 16, true); } }
  } else if (!guard && g.shout > 0) g.shout = Math.max(0, g.shout - dt);
  let sp = 1.7, tx, tz;
  if (g.state === 'chase') { sp = 3.75; if (sees) { g.tx = S.px; g.tz = S.pz; g.lost = 0; } else { g.lost += dt; if (g.lost > 4.5) { g.state = 'look'; g.wait = 3; g.path = null; } } tx = g.tx; tz = g.tz; if (d < 1.05 && S.mode === 'play' && !(S.hidden && !sees)) return caught('잡혔다.'); }
  else if (g.state === 'look') { sp = 2.5; tx = g.tx; tz = g.tz; if (dist(g.x, g.z, tx, tz) < 1.3) { g.wait -= dt; g.dir += dt * 1.6; if (g.wait <= 0) { g.state = 'patrol'; g.path = null; } drawCone(g.cone, g.x, g.z, g.dir, range, half, g); place(g, false); return; } }
  else { const w = g.def.path[g.wp]; tx = w[0]; tz = w[1]; if (dist(g.x, g.z, tx, tz) < 0.7) { g.wp = (g.wp + 1) % g.def.path.length; g.path = null; } if (!guard) sp = 1.2; }
  g.repath -= dt;
  if (!g.path || g.repath <= 0) { g.path = findPath(g.x, g.z, tx, tz); g.pi = 0; g.repath = g.state === 'chase' ? 0.35 : 1.5; }
  let nx = tx, nz = tz; if (g.path && g.path.length) { while (g.pi < g.path.length - 1 && dist(g.x, g.z, g.path[g.pi][0], g.path[g.pi][1]) < 0.6) g.pi++; nx = g.path[g.pi][0]; nz = g.path[g.pi][1]; if (g.pi >= g.path.length - 1 && los(g.x, g.z, tx, tz)) { nx = tx; nz = tz; } }
  const dx = nx - g.x, dz = nz - g.z, l = Math.hypot(dx, dz);
  if (l > 0.05) { g.x += (dx / l) * sp * dt; g.z += (dz / l) * sp * dt; let da = Math.atan2(dz, dx) - g.dir; da = Math.atan2(Math.sin(da), Math.cos(da)); g.dir += clamp(da, -dt * 5, dt * 5); }
  if (g.state === 'patrol') g.dir += Math.sin(S.t * 0.9 + g.x) * dt * 0.5;
  drawCone(g.cone, g.x, g.z, g.dir, range, half, g); place(g, l > 0.05, sp);
}
function place(g, moving, sp = 2) { g.mesh.position.set(g.x, 0, g.z); g.mesh.rotation.y = -g.dir + Math.PI / 2; walkAnim(g.mesh, S.t * (4 + sp * 2.2) + g.x, moving); if (g.light) g.light.position.set(g.x + Math.cos(g.dir) * 0.8, 1.2, g.z + Math.sin(g.dir) * 0.8); }
function drawCone(cone, x, z, dir, range, half, g) { const p = cone.geometry.attributes.position; p.setXYZ(0, x, 0.09, z); for (let i = 0; i <= 24; i++) { const a = dir - half + (i / 24) * half * 2, cx = Math.cos(a), cz = Math.sin(a), l = rayLen(x, z, cx, cz, range); p.setXYZ(i + 1, x + cx * l, 0.09, z + cz * l); } p.needsUpdate = true;
  if (!g) return; const m = cone.material; m.opacity = g.state === 'chase' ? 0.36 : g.see ? 0.4 : 0.22; m.color.set(g.state === 'chase' || g.see ? 0xff5a3c : g.state === 'look' ? 0xffe27a : g.kind === 'guard' ? 0xffc65a : 0xd8e2ff); }

/* ───── 잡힘 · 건넘 ───── */
function overlay(html, btn, fn) { const o = $('ov'); o.firstElementChild.innerHTML = html + `<button id="go">${btn}</button>`; o.style.display = 'flex'; $('go').onclick = () => { audio(); if (AC && AC.state === 'suspended') AC.resume(); o.style.display = 'none'; fn(); }; }
function caught(why, dawn) {
  if (S.mode !== 'play') return; S.mode = 'over'; SFX.caught(); S.caught++; S.night++; if (!dawn) S.limp++;
  const next = dawn ? '파루 종이 울렸다. 날이 밝아 행랑채로 돌아왔다.<br>발자국을 본 주인이 <b>순라꾼을 한 명 더</b> 세웠다.' : '끌려와 매를 맞았다. <b>다리를 절게 됐다</b> — 걸음이 느려진다.<br>주인은 <b>순라꾼을 한 명 더</b> 세웠다.';
  setTimeout(() => overlay(`<h1>${why}</h1><p>${next}</p><p class="keys">${S.night}번째 밤 · 그래도 등불은 아직 저기 있다.</p>`, '다시 달아난다', () => { resetNight(); S.mode = 'play'; }), 700);
}
function won(how) {
  if (S.mode !== 'play') return; S.mode = 'cross'; S.win = how; S.crossT = 0; SFX.win(); pMesh.visible = how === 'pay'; $('tLamp').className = 'main on';
  setTimeout(() => {
    const r = S.route, way = r.stream ? '개울과 갈대밭을 따라' : r.market ? '장터를 지나' : r.wall ? '무너진 담을 넘어' : '어둠을 따라';
    const clean = [S.doc, S.cloth, how === 'pay', !S.seen && !S.caught], n = clean.filter(Boolean).length;
    const after = S.doc ? '노비 문서는 재가 됐다. 주인은 네가 제 노비라는 것을 관아에 보일 길이 없다.' : '주인은 날이 밝자 <b>노비 문서</b>를 들고 관아로 갔다. 추노꾼이 강을 건넌다 — 아직 끝난 게 아니다.';
    overlay(`<h1>강을 건넜다</h1><p>${way} 나루에 닿아, ${how === 'pay' ? '주먹밥을 삯으로 내고 배에 올랐다.' : '사공이 돌아선 틈에 배 밑에 숨어들었다.'}</p><p>${after}</p>
      <div class="marks"><span class="${S.doc ? 'ok' : ''}">📜 문서 ${S.doc ? '태움' : '남음'}</span><span class="${S.cloth ? 'ok' : ''}">👘 ${S.cloth ? '상민 옷' : '해진 옷 그대로'}</span><span class="${how === 'pay' ? 'ok' : ''}">🍙 ${how === 'pay' ? '삯을 냄' : '몰래 탐'}</span><span class="${clean[3] ? 'ok' : ''}">👁 ${clean[3] ? '아무도 못 봄' : S.caught ? S.night + '번째 밤' : '들킨 적 있음'}</span></div>
      <p class="keys">${n === 4 ? '흔적 하나 없이 사라졌다.' : `남긴 흔적 ${4 - n}개 — 흔적이 적을수록 쫓기 어렵다.`}</p>
      <div class="fact">📜 <b>인정과 파루</b> — 조선은 밤에 종(인정)을 치면 길을 막고, 새벽 종(파루)이 울려야 풀었다. 그 사이 순라꾼이 돌았다.<br>📜 <b>추노</b> — 달아난 노비가 아주 많아서, 주인과 나라가 사람을 풀어 잡으러 다녔다.<br>📜 <b>노비 문서</b> — 누가 누구의 노비인지 적은 문서가 있어야 주인이 권리를 내세울 수 있었다. 난리 때 사람들이 가장 먼저 태운 것이 이 문서였다.<br>📜 <b>옷과 호패</b> — 옷차림과 호패(신분을 적은 패)로 신분이 한눈에 드러났다.</div>`,
      n === 4 ? '한 번 더' : '흔적 없이 한 번 더', () => { S.night = 1; S.caught = 0; S.limp = 0; resetNight(); S.mode = 'play'; });
  }, 3600);
}

/* ───── 한 걸음 ───── */
function collide(x, z) { for (const s of SOLID) { const cx = clamp(x, s[0], s[2]), cz = clamp(z, s[1], s[3]); const dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz), r = 0.42; if (d < r) { if (d < 1e-4) { const l = x - s[0], rr = s[2] - x, t = z - s[1], b = s[3] - z, m = Math.min(l, rr, t, b); if (m === l) x = s[0] - r; else if (m === rr) x = s[2] + r; else if (m === t) z = s[1] - r; else z = s[3] + r; } else { x = cx + (dx / d) * r; z = cz + (dz / d) * r; } } } return [clamp(x, 0.8, W - 0.8), clamp(z, 6.4, H - 0.8)]; }
const skyA = new THREE.Color(), skyB = new THREE.Color(0x16264c), skyC = new THREE.Color(0x2f4a86), skyD = new THREE.Color(0xf0b890);
function update(dt) {
  S.t += dt;
  if (S.sayT > 0) { S.sayT -= dt; if (S.sayT <= 0) $('say').style.opacity = 0; }
  for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += dt * 1.6; const k = Math.min(1, r.t); r.m.scale.setScalar(Math.max(0.01, k * r.r)); r.m.material.opacity = 0.75 * (1 - k); if (k >= 1) { scene.remove(r.m); rings.splice(i, 1); } }
  glow.material.opacity = 0.8 + Math.sin(S.t * 3) * 0.15; lamp.rotation.z = Math.sin(S.t * 1.3) * 0.08;
  { const p = riverG.attributes.position; for (let i = 0; i < p.count; i++) { const x = riverBase[i * 3], z = riverBase[i * 3 + 2]; p.setY(i, Math.sin(x * 0.35 + S.t * 1.2) * 0.1 + Math.cos(z * 0.5 + S.t * 0.9) * 0.08); } p.needsUpdate = true; riverG.computeVertexNormals(); }
  if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.2) { S.mode = 'play'; say('순라꾼의 불빛을 피해 — 등불까지', null, 3); } for (const g of guards) stepGuard(g, dt); return; }
  if (S.mode === 'cross') { S.crossT += dt; boat.position.z -= dt * 1.6; boat.position.x += dt * 0.3; boat.rotation.z = Math.sin(S.t * 2) * 0.03; if (S.win === 'pay') { pMesh.position.set(boat.position.x - 0.7, 0.5, boat.position.z); walkAnim(pMesh, 0, false); } boatman.position.set(boat.position.x + 1.0, 0.5, boat.position.z); return; }
  if (S.mode !== 'play') return;

  /* 새벽(파루) · 달 */
  S.dawn += dt; const dk = clamp(S.dawn / S.DAWN, 0, 1); $('dawn').querySelector('i').style.width = dk * 100 + '%';
  if (dk > 0.86 && !S.roosted) { S.roosted = true; SFX.rooster(); say('닭이 운다 — 곧 파루 종이 울린다!', null, 2.8); }
  if (dk >= 1) { SFX.bell(2); return caught('날이 샜다.', true); }
  S.moonT += dt; const cyc = S.moonT % 21, out = cyc > 13, soon = cyc > 10.4 && !out;
  if (soon && !S.moonSoon) { SFX.cloud(); say('구름이 걷힌다 — 그늘로!', 'moon1', 2.4); }
  S.moonSoon = soon; S.moonOut = out; const mEl = $('moon'); mEl.className = 'pill' + (out ? ' out' : soon ? ' soon' : ''); mEl.textContent = out ? '🌕 달빛' : soon ? '🌥️ 곧 달' : '☁️ 구름';
  const mk = out ? clamp((cyc - 13) / 0.8, 0, 1) * clamp((21 - cyc) / 0.8, 0, 1) : soon ? ((cyc - 10.4) / 2.6) * 0.18 : 0; S.mk = mk;
  moon.intensity = lerp(0.55, 2.7, mk) + dk * 0.3; hemi.intensity = 1.2 + mk * 0.25 + dk * dk * 1.1;
  moonCloud.position.x = W / 2 - 60 + mk * 34; skyA.copy(skyB).lerp(skyC, mk * 0.6).lerp(skyD, dk * dk * 0.7); scene.fog.color.copy(skyA); skyMat.color.setScalar(1 + mk * 0.5 + dk * dk * 1.6);

  /* 아이 */
  let ix = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0) + stickX, iz = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0) + stickZ;
  let back = false; if (S.view === 2) { S.pdir += clamp(ix, -1, 1) * 2.6 * dt; const f = clamp(-iz, -1, 1); back = f < 0; ix = Math.cos(S.pdir) * f; iz = Math.sin(S.pdir) * f; } else { const a = yawNow(), wx = Math.cos(a) * ix + Math.sin(a) * iz, wz = -Math.sin(a) * ix + Math.cos(a) * iz; ix = wx; iz = wz; }
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.slow = null;
  for (const s of SLOW) if (inRect(S.px, S.pz, s.r)) S.slow = s;
  S.running = S.moving && (keys.ShiftLeft || keys.ShiftRight || runHeld) && !S.slow;
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il);
    const sp = (S.running ? 4.7 : 3.0) * Math.pow(0.84, Math.min(S.limp, 3)) * (S.slow ? S.slow.k : 1) * (back ? 0.6 : 1);
    const [nx, nz] = collide(S.px + ix * sp * dt, S.pz + iz * sp * dt); S.px = nx; S.pz = nz; if (S.view !== 2) S.pdir = Math.atan2(iz, ix);
    S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; if (S.running) { SFX.step(); makeNoise(S.px, S.pz, 7.5); } else if (S.slow && S.slow.name === 'stream') noise(0.08, 0.05, 1500); else if (S.slow && S.slow.name === 'reed') { noise(0.09, 0.07, 2600); makeNoise(S.px, S.pz, 6.5); } } }
  if (S.slow) { const n = S.slow.name; S.route[n === 'wallgap' ? 'wall' : 'stream'] = 1; if (n === 'wallgap') say('무너진 담 — 기어 넘는다', 'gap'); if (n === 'drain') say('수챗구멍 — 개울로 이어진다', 'drain'); if (n === 'reed') say('갈대밭 — 멈추면 안 보인다. 움직이면 바스락', 'reed', 3.2); }
  if (S.px > 43 && S.pz > 17 && S.pz < 40) S.route.market = 1;
  S.hidden = !!(S.slow && S.slow.hide && !S.moving); let near = false;
  for (let i = 0; i < HIDE.length; i++) { const [hx, hz, r] = HIDE[i], d = dist(S.px, S.pz, hx, hz); if (d < r + 0.75 && !S.running) { S.hidden = true; near = true; } hideMeshes[i].scale.setScalar(d < r + 0.75 ? 1.08 : 1); }
  if (near) say('숨었다 — 여기 있으면 안 보인다', 'hide');
  S.inShade = shaded(S.px, S.pz) || S.hidden;
  pMesh.position.set(S.px, S.hidden ? -0.35 : 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; pMesh.rotation.z = S.limp && S.moving ? Math.sin(S.t * 9) * 0.14 : 0; pMesh.scale.y = S.hidden ? 0.75 : 1; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving, S.limp);
  pRing.position.set(S.px, 0.11, S.pz); pRing.material.opacity = S.hidden ? 0.2 : 0.6; pRing.material.color.set(S.moonOut && !S.inShade ? 0xff6a4a : S.hidden ? 0x7fe0a0 : 0xffffff);

  /* 줍기 · 할 일 */
  for (const g of S.ground) if (g.on && dist(S.px, S.pz, g.x, g.z) < 1) { g.on = false; g.m.visible = false; S.stones++; hud(); SFX.pick(); say('돌멩이 — 땅을 눌러 던지면 순라꾼이 그쪽으로 간다', 'stone', 3.2); }
  if (!S.rice && dist(S.px, S.pz, RICE[0], RICE[1]) < 1.1) { S.rice = true; riceMesh.visible = false; hud(); SFX.done(); say('주먹밥 — 사공에게 뱃삯으로 낸다', null, 2.6); }
  riceMesh.position.y = 0.5 + Math.sin(S.t * 3) * 0.08; riceMesh.rotation.y = S.t;
  if (!S.cloth && dist(S.px, S.pz, CLOTH[0], CLOTH[1]) < 1.3) { S.cloth = true; clothMesh.children[3].visible = false; pMesh.userData.body.material.color.set(0x7fc8c0); pMesh.userData.skirt.material.color.set(0x7fc8c0); hud(); SFX.done(); say('상민 옷으로 갈아입었다 — 걸어 다니면 덜 의심받는다', null, 3); }
  const dDoc = dist(S.px, S.pz, DOC[0], DOC[1]), w = $('work');
  if (!S.doc && dDoc < 1.5) { if (!S.moving) { S.workT += dt; if (S.workT > 0.1) say('궤를 열고 문서를 꺼낸다 — 가만히…', 'docing', 2); } else S.workT = Math.max(0, S.workT - dt * 2);
    if (S.workT >= 2.4) { S.doc = true; S.fireT = 5; fire.visible = true; docMesh.children[3].visible = false; hud(); SFX.burn(); SFX.done(); say('노비 문서가 탄다! — 불빛이 번진다, 어서 피해!', null, 3); makeNoise(DOC[0], DOC[1], 9, true); } }
  else if (dDoc < 6 && !S.doc) say('안채 궤 — 저 안에 노비 문서가 있다. 곁에 가만히 서면 꺼낸다', 'docnear', 3.4);
  if (!S.doc && dDoc < 1.5 && S.workT > 0) { const q = v3.set(DOC[0], 1.6, DOC[1]).project(cam); w.style.display = 'block'; w.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; w.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; w.firstElementChild.style.width = clamp(S.workT / 2.4, 0, 1) * 100 + '%'; } else { w.style.display = 'none'; if (dDoc >= 1.5) S.workT = 0; }
  if (S.fireT > 0) { S.fireT -= dt; fireL.intensity = 18 * clamp(S.fireT / 1.2, 0, 1) * (0.8 + Math.sin(S.t * 30) * 0.2); fire.scale.setScalar(clamp(S.fireT / 1.2, 0, 1)); fire.rotation.y = S.t * 4; if (S.fireT <= 0) fire.visible = false; }
  if (!S.cloth && dist(S.px, S.pz, CLOTH[0], CLOTH[1]) < 6) say('빨랫줄 — 상민 옷이 널려 있다', 'clothnear', 2.6);
  /* 돌 */
  if (S.fly) { const f = S.fly; f.t += dt / 0.55; const k = Math.min(1, f.t); flying.position.set(lerp(f.x0, f.x1, k), 0.8 + Math.sin(k * Math.PI) * 3, lerp(f.z0, f.z1, k)); if (k >= 1) { flying.visible = false; SFX.clack(); makeNoise(f.x1, f.z1, 10.5); S.fly = null; } }
  /* 개 */
  S.dogT -= dt; const dd = dist(S.px, S.pz, DOG[0], DOG[1]); dog.rotation.y = -Math.atan2(S.pz - DOG[1], S.px - DOG[0]);
  if (S.dogT <= 0 && (dd < 3.2 || (dd < 9 && S.running))) { S.dogT = 5; SFX.bark(); say('컹! 컹! — 개가 짖는다', null, 1.6); makeNoise(DOG[0], DOG[1], 17, true); } else if (dd < 8) say('개가 있다 — 뛰거나 가까이 가면 짖는다', 'dog', 3);
  dog.position.y = S.dogT > 4 ? Math.abs(Math.sin(S.t * 20)) * 0.18 : 0;

  /* 순라꾼 */
  const m0 = S.meter; for (const g of guards) { stepGuard(g, dt); if (S.mode !== 'play') return; }
  if (S.meter === m0) S.meter = Math.max(0, S.meter - dt * 0.45);
  if (S.meter >= 1) { S.meter = 1; alertAll(); }
  if (S.alert && !guards.some((g) => g.state === 'chase')) { S.alert = false; S.meter = 0.2; say('따돌렸다…', null, 1.6); }

  /* 사공 · 배 */
  S.boatmanT += dt; const look = (S.boatmanT % 9) < 5.2; S.boatmanA = lerp(S.boatmanA, look ? Math.PI * 0.5 : -Math.PI * 0.5, dt * 3); boatman.rotation.y = -S.boatmanA + Math.PI / 2; drawCone(ferryCone, FERRY[0], FERRY[1], S.boatmanA, 6, 0.8);
  const db = dist(S.px, S.pz, FERRY[0], FERRY[1]);
  if (db < 2.2 && S.rice) return won('pay');
  if (db < 8) say(S.rice ? '사공이다 — 주먹밥을 내밀자' : '뱃삯이 없다 — 사공이 등을 돌릴 때 배로', 'ferry', 3.4);
  if (S.px > 56.8 && S.px < 61.5 && S.pz < 7.6) { if (!look) return won('hide'); if (S.t - S.ferryShout > 4) { S.ferryShout = S.t; S.seen = true; say('"웬 놈이냐!"', null, 1.6); makeNoise(FERRY[0], FERRY[1], 16, true); S.meter = Math.min(0.95, S.meter + 0.5); } }

  /* 조임 */
  let nearest = 99; for (const g of guards) if (g.kind === 'guard') nearest = Math.min(nearest, dist(g.x, g.z, S.px, S.pz));
  const exposed = S.moonOut && !S.inShade, tension = clamp(Math.max(S.meter, S.alert ? 1 : 0, 1 - nearest / 9, exposed ? 0.5 : 0, S.workT > 0 ? 0.6 : 0), 0, 1);
  S.beatT -= dt; if (tension > 0.12 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.36, tension); SFX.beat(0.1 + tension * 0.35); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${exposed && S.meter < 0.3 ? '210,220,255' : '200,20,20'},${(S.alert ? 0.5 : S.meter * 0.55) + (exposed ? 0.16 : 0)})`;
}
const setFov = (f) => { if (cam.fov !== f) { cam.fov = f; cam.updateProjectionMatrix(); } };
function view() {
  const tall = cam.aspect < 1;
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k); v3.set(lerp(LAMP[0] - 6, START[0] + 10, e), lerp(9, 30, e), lerp(LAMP[1] + 16, START[1] + 22, e)); cam.position.copy(v3); v3b.set(lerp(LAMP[0], START[0] + 8, e), lerp(2, 0, e), lerp(LAMP[1], START[1] - 4, e)); cam.lookAt(v3b); cam.fov = 44; cam.updateProjectionMatrix(); }
  else if (S.mode === 'cross') { v3.set(boat.position.x - 9, 3.2, boat.position.z + 9); cam.position.lerp(v3, 0.04); cam.lookAt(boat.position.x + 3, 1.6, boat.position.z - 6); }
  else if (S.view === 2) { setFov(60); let d = S.pdir - S.camYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); S.camYaw += d * 0.12; const fx = Math.cos(S.camYaw), fz = Math.sin(S.camYaw); cam.position.lerp(v3.set(S.px - fx * 6.2, 3.6, S.pz - fz * 6.2), 0.14); cam.lookAt(S.px + fx * 5, 1.3, S.pz + fz * 5); }
  else if (S.view === 3) { setFov(38); const hh = tall ? 150 : 82; cam.position.lerp(v3.set(W / 2, hh, H / 2 + 10), 0.1); cam.lookAt(W / 2, 0, H / 2 - 2.5); }
  else { let d = S.yawT - S.yaw; S.yaw += d * 0.14; const a = S.yaw, near = S.view === 1; setFov(near ? 52 : 38);
    const hh = (near ? (tall ? 13 : 9.5) : (tall ? 58 : 41)) * S.zoom, bk = (near ? (tall ? 16 : 12.5) : (tall ? 36 : 27)) * S.zoom, ahead = near ? 3.5 : 5;
    const tx = clamp(S.px - Math.sin(a) * ahead, 6, W - 6), tz = clamp(S.pz - Math.cos(a) * ahead, 2, H - 4);
    cam.position.lerp(v3.set(tx + Math.sin(a) * bk, hh, tz + Math.cos(a) * bk), near ? 0.1 : 0.08); cam.lookAt(cam.position.x - Math.sin(a) * bk, near ? 1.2 : 0, cam.position.z - Math.cos(a) * bk); }
  /* 가까이 시점: 아이를 가리는 집·나무는 비쳐 보이게 */
  const ccx = cam.position.x, ccz = cam.position.z, sx = S.px - ccx, sz = S.pz - ccz, sl = sx * sx + sz * sz || 1;
  for (const o of occl) { const ox = (o.r[0] + o.r[2]) / 2, oz = (o.r[1] + o.r[3]) / 2, t = ((ox - ccx) * sx + (oz - ccz) * sz) / sl, pd = Math.hypot(ccx + sx * t - ox, ccz + sz * t - oz), rad = Math.max(o.r[2] - o.r[0], o.r[3] - o.r[1]) / 2 + (S.view === 0 ? 0.2 : 1.3);
    const hide = S.view !== 3 && S.mode === 'play' && t > 0.03 && t < (S.view === 0 ? 0.985 : 1.0) && pd < rad && Math.hypot(ox - S.px, oz - S.pz) < (S.view === 0 ? 6 : 16), a = hide ? 0.22 : 1; if (Math.abs(o.a - a) > 0.01) { o.a = lerp(o.a, a, 0.2); for (const m of o.mats) { m.transparent = o.a < 0.98; m.opacity = o.a; m.depthWrite = o.a > 0.5; } } }
  const p = v3.copy(lamp.position).project(cam), ge = $('goal'), behind = p.z > 1; if (S.mode === 'play' && (behind || Math.abs(p.x) > 0.96 || Math.abs(p.y) > 0.9)) { let gx = behind ? -p.x : p.x, gy = behind ? 1 : p.y; const k = 0.88 / Math.max(Math.abs(gx), Math.abs(gy), 0.001); ge.style.display = 'block'; ge.style.left = ((gx * k + 1) / 2) * innerWidth + 'px'; ge.style.top = ((1 - gy * k) / 2) * innerHeight + 'px'; } else ge.style.display = 'none';
  const e = $('eye'); if (S.mode === 'play' && S.meter > 0.02) { const q = v3.set(S.px, 2.7, S.pz).project(cam); e.style.display = 'block'; e.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; e.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; e.firstElementChild.style.width = S.meter * 100 + '%'; } else e.style.display = 'none';
}
let last = performance.now();
function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); view(); renderer.render(scene, cam); requestAnimationFrame(loop); }

resetNight(); for (const g of guards) { drawCone(g.cone, g.x, g.z, g.dir, 10, 0.56, g); place(g, false); }
pMesh.position.set(S.px, 0, S.pz); pRing.position.set(S.px, 0.11, S.pz); skyMat.color.setScalar(1);
$('go').onclick = () => { audio(); if (AC && AC.state === 'suspended') AC.resume(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.bell(3); say('댕— 댕— 인정 종이 울렸다. 이제 밤길은 막혔다', null, 3.6); };
requestAnimationFrame(loop);
window.__night = { S, get guards() { return guards; }, update, shaded, findPath, los, keys, go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz); stickX = (x - S.px) / l; stickZ = (z - S.pz) / l; runHeld = !!run; update(1 / 30); t += 1 / 30; } } stickX = stickZ = 0; runHeld = false; return { t: +t.toFixed(1), mode: S.mode, x: +S.px.toFixed(1), z: +S.pz.toFixed(1), meter: +S.meter.toFixed(2), alert: S.alert, dawn: +S.dawn.toFixed(0) }; } };
