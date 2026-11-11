/* 섬 탐험 — 수학 놀이터의 「느낌 맛보기」. 작은 섬 셋을 내 캐릭터로 걷고 뛰어 건넌다.
 * 수학은 딱 한 군데: 숲 섬 → 보물 섬의 「수 다리」(2씩 뛰어 센 돌만 버틴다). 문제 창도 채점도 없다 — 틀린 돌은 그냥 가라앉는다.
 * 조작: 방향키/WASD + 스페이스 · 마우스 끌기 = 둘러보기 / 터치: 왼쪽 막대 + 점프 단추, 오른쪽 끌기 = 둘러보기
 * 저장 0. 3D: /labs/vendor/three185 (r185). 설계: 핸드오프 kmotion/math-wizard/23_수학놀이터_섬세계_설계_v1.md */
import * as THREE from 'three';
const $ = id => document.getElementById(id);
const R = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.08;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xbfe6ff, 70, 230);
const cam = new THREE.PerspectiveCamera(58, 1, .1, 400);
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .85, metalness: 0, flatShading: true, ...o });
const box = (w, h, d, c, o) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c, o)); m.castShadow = m.receiveShadow = true; return m; };
const cyl = (rt, rb, h, c, seg = 12, o) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), M(c, o)); m.castShadow = m.receiveShadow = true; return m; };
const rnd = (() => { let a = 20261111; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();

// ── 하늘·빛·바다
{ const g = new THREE.SphereGeometry(300, 24, 12), col = [], top = new THREE.Color(0x3d9ff0), mid = new THREE.Color(0xa9defc), low = new THREE.Color(0xfff1d0), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const t = Math.max(0, p.getY(i) / 300), c = t > .25 ? mid.clone().lerp(top, (t - .25) / .75) : low.clone().lerp(mid, t / .25); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }))); }
scene.add(new THREE.HemisphereLight(0xdff3ff, 0x6fae6a, 1.15));
const sun = new THREE.DirectionalLight(0xfff2d6, 2.3); sun.position.set(-30, 46, 22); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 140 }); sun.shadow.bias = -.001; sun.shadow.normalBias = .09; scene.add(sun, sun.target);
const seaG = new THREE.PlaneGeometry(520, 520, 52, 52); seaG.rotateX(-Math.PI / 2); const sea = new THREE.Mesh(seaG, new THREE.MeshStandardMaterial({ color: 0x2aa7d8, roughness: .25, metalness: .1, flatShading: true, transparent: true, opacity: .93 })); sea.receiveShadow = true; scene.add(sea);
const seaBase = seaG.attributes.position.array.slice(); const deep = new THREE.Mesh(new THREE.PlaneGeometry(520, 520).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x1173a8 })); deep.position.y = -2.2; scene.add(deep);
const clouds = []; for (let i = 0; i < 9; i++) { const g = new THREE.Group(); for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(5 + rnd() * 6, 2 + rnd() * 1.6, 4 + rnd() * 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .92, fog: false })); b.position.set(k * 3.4 - 5, rnd() * 1.4, rnd() * 3); g.add(b); } g.position.set(-90 + rnd() * 200, 34 + rnd() * 16, -110 + rnd() * 160); scene.add(g); clouds.push(g); }

// ── 땅(밟는 곳)·부딪히는 것
const plats = [], solids = [], bobbers = [], trees = [];
function island(x, z, r, top, name){ const g = new THREE.Group(); g.position.set(x, 0, z);
  const sand = cyl(r + 1.5, r + 2.6, 1.0, 0xf2dfa8, 28); sand.position.y = .3; const dirt = cyl(r + .2, r + 1.2, top - .8, 0xb88755, 26); dirt.position.y = .5 + (top - .8) / 2; /* 흙 윗면은 풀 아래에 숨긴다(같은 높이면 깜빡임) */ const grass = cyl(r, r + .25, .5, 0x63c860, 26); grass.position.y = top - .25; sand.castShadow = dirt.castShadow = grass.castShadow = false; g.add(sand, dirt, grass);
  for (let i = 0; i < Math.round(r * 2.2); i++) { const a = rnd() * 6.28, d = Math.sqrt(rnd()) * (r - 1.2), t = box(.5 + rnd() * .8, .12, .5 + rnd() * .8, 0x78d86e); t.position.set(Math.cos(a) * d, top + .04, Math.sin(a) * d); t.castShadow = false; t.position.y = top + .07; g.add(t); }
  scene.add(g); plats.push({ kind: 'disc', x, z, r, top, name }, { kind: 'disc', x, z, r: r + 1.9, top: .78, beach: true }); return g; }
function tree(x, z, top, s = 1, palm = false){ const g = new THREE.Group(); g.position.set(x, top, z); const tr = cyl(.22 * s, .34 * s, (palm ? 3.4 : 2.0) * s, 0x8a5a2b, 7); tr.position.y = (palm ? 1.7 : 1.0) * s; g.add(tr);
  if (palm) { for (let k = 0; k < 6; k++) { const l = box(2.4 * s, .14, .7 * s, 0x3fae5a); l.position.set(Math.cos(k * 1.05) * 1.1 * s, 3.4 * s, Math.sin(k * 1.05) * 1.1 * s); l.rotation.y = -k * 1.05; l.rotation.z = -.35; g.add(l); } }
  else { const cols = [0x2f9e4f, 0x3fb866, 0x56cc7a]; for (let k = 0; k < 3; k++) { const b = box((2.3 - k * .6) * s, 1.0 * s, (2.3 - k * .6) * s, cols[k]); b.position.y = (2.2 + k * .85) * s; b.rotation.y = k * .5; g.add(b); } }
  scene.add(g); solids.push({ x, z, r: .5 * s }); trees.push({ g, x, z, h: (palm ? 4 : 4.6) * s, a: 1 }); return g; }
function rock(x, z, top, s = 1){ const m = new THREE.Mesh(new THREE.DodecahedronGeometry(.7 * s, 0), M(0x9aa3ad)); m.position.set(x, top + .35 * s, z); m.rotation.set(rnd(), rnd(), rnd()); m.castShadow = m.receiveShadow = true; scene.add(m); solids.push({ x, z, r: .6 * s }); }
function house(x, z, top, rot = 0){ const g = new THREE.Group(); g.position.set(x, top, z); g.rotation.y = rot; const b = box(3.6, 2.4, 3.2, 0xfff1d6); b.position.y = 1.2; const roof = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.8, 4), M(0xe5574d)); roof.position.y = 3.3; roof.rotation.y = Math.PI / 4; roof.castShadow = true; const door = box(.9, 1.5, .1, 0x8a5a2b); door.position.set(0, .75, 1.62); const w1 = box(.8, .8, .1, 0x8fd8ff, { emissive: 0x3a7fa8, emissiveIntensity: .4 }); w1.position.set(-1.1, 1.5, 1.62); const w2 = w1.clone(); w2.position.x = 1.1; g.add(b, roof, door, w1, w2); scene.add(g); solids.push({ x, z, r: 2.4 }); }
function stone(x, z, top, w = 1.7, col = 0xcfd6dd){ const m = box(w, .7, w, col); m.position.set(x, top - .35, z); scene.add(m); const p = { kind: 'box', x, z, w, d: w, top, mesh: m, baseY: top - .35 }; plats.push(p); return p; }
function label(text, w = 256, h = 256, fg = '#2b2f3a', bg = '#ffffff', size = 150){ const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = `900 ${size}px "Pretendard","Noto Sans KR",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + size * .04); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function sign(x, z, top, text, rot = 0, w = 3.6){ const g = new THREE.Group(); g.position.set(x, top, z); g.rotation.y = rot; const p1 = box(.18, 2.2, .18, 0x8a5a2b); p1.position.set(-w / 2 + .3, 1.1, 0); const p2 = p1.clone(); p2.position.x = w / 2 - .3; const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1.3, .16), [M(0xb9853b), M(0xb9853b), M(0xb9853b), M(0xb9853b), new THREE.MeshStandardMaterial({ map: label(text, 768, 276, '#4a2c0a', '#fff4d6', text.length > 8 ? 96 : 120), roughness: .9 }), M(0xb9853b)]); b.position.y = 2.0; b.castShadow = true; g.add(p1, p2, b); scene.add(g); solids.push({ x, z, r: .5 }); }
const coins = []; function coin(x, y, z){ const m = cyl(.34, .34, .1, 0xffc928, 14, { emissive: 0xb37a00, emissiveIntensity: .5, metalness: .6, roughness: .3, flatShading: false }); m.rotation.x = Math.PI / 2; m.position.set(x, y, z); m.castShadow = true; scene.add(m); coins.push({ m, x, y, z, got: false, ph: rnd() * 6 }); }
const flags = []; function flag(x, z, top, name){ const g = new THREE.Group(); g.position.set(x, top, z); const pole = cyl(.06, .06, 2.6, 0xffffff, 6); pole.position.y = 1.3; const f = box(1.0, .6, .05, 0x9aa3ad); f.position.set(.52, 2.25, 0); g.add(pole, f); scene.add(g); flags.push({ x, z, top, f, on: false, name }); }

// ── 세계: 섬 셋 (v0.2 — 준호 「섬이 너무 작잖아」 → 지름을 두 배 넘게, 언덕·마을·숲길·등대를 넣어 돌아다닐 거리를 만든다)
const A = { x: 0, z: 0, r: 24, top: 1.3 }, B = { x: 59, z: -16, r: 20, top: 1.7 }, C = { x: 108.7, z: 3.8, r: 16, top: 2.1 };
function hill(x, z, r, top, base, col = 0x58bd58){ const m = cyl(r, r + .5, top - base + .3, col, 14); m.position.set(x, base + (top - base + .3) / 2 - .3, z); m.castShadow = false; scene.add(m); plats.push({ kind: 'disc', x, z, r, top }); }
function flowers(x, z, top, n = 6){ for (let i = 0; i < n; i++) { const f = box(.22, .3, .22, [0xff6b9a, 0xffd35c, 0xffffff, 0xb48bff][i % 4]); f.position.set(x + (rnd() - .5) * 2.4, top + .15, z + (rnd() - .5) * 2.4); f.castShadow = false; scene.add(f); } }
function path(x0, z0, x1, z1, top, w = 2.2){ const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 1.5); for (let i = 0; i <= n; i++) { const u = i / n, s = box(w * (.8 + rnd() * .3), .08, 1.3, 0xe9d3a0); s.position.set(x0 + (x1 - x0) * u + (rnd() - .5) * .3, top + .03, z0 + (z1 - z0) * u + (rnd() - .5) * .3); s.rotation.y = Math.atan2(x1 - x0, z1 - z0) + (rnd() - .5) * .3; s.castShadow = false; scene.add(s); } }
function fence(x0, z0, x1, z1, top){ const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 1.6); for (let i = 0; i <= n; i++) { const u = i / n, p = box(.16, .8, .16, 0xf4e6c8); p.position.set(x0 + (x1 - x0) * u, top + .4, z0 + (z1 - z0) * u); scene.add(p); } const r = box(L, .12, .1, 0xf4e6c8); r.position.set((x0 + x1) / 2, top + .62, (z0 + z1) / 2); r.rotation.y = -Math.atan2(z1 - z0, x1 - x0); scene.add(r); }
island(A.x, A.z, A.r, A.top, '출발 섬'); island(B.x, B.z, B.r, B.top, '숲 섬'); island(C.x, C.z, C.r, C.top, '보물 섬');
const dirAB = new THREE.Vector2(B.x - A.x, B.z - A.z).normalize(), nAB = new THREE.Vector2(-dirAB.y, dirAB.x);
const dirBC = new THREE.Vector2(C.x - B.x, C.z - B.z).normalize(), nBC = new THREE.Vector2(-dirBC.y, dirBC.x), rotBC = Math.atan2(dirBC.x, dirBC.y);
// 출발 섬: 마을 광장 · 집 넷 · 연못 · 뒷동산(두 단) · 바닷가 길
house(-7, -6, A.top, .6); house(-11, 4, A.top, 1.4); house(-2, 9, A.top, 2.6); house(6, -9, A.top, -.4);
{ const pond = cyl(3.2, 3.2, .1, 0x49b8e8, 16, { roughness: .2 }); pond.position.set(8, A.top + .03, 7); pond.castShadow = false; scene.add(pond); for (let k = 0; k < 7; k++) rock(8 + Math.cos(k * .9) * 3.5, 7 + Math.sin(k * .9) * 3.5, A.top, .45); }
hill(-13, -13, 7.5, 2.5, A.top); hill(-14, -14, 4.2, 3.6, 2.5, 0x4fb055); hill(-14.5, -14.5, 1.8, 4.6, 3.6, 0x46a34d);
for (const [x, z, s, palm] of [[-17, 6, 1.2], [-19, -3, 1.0], [-6, 16, 1.1], [3, 18, .9], [13, 14, 1.2, 1], [18, 4, 1.0, 1], [16, -12, 1.1], [3, -19, 1.2], [-6, -20, .9], [-20, -9, 1.0], [-9, -9, .8], [19, -4, .9, 1], [-14, 12, .9], [10, -16, 1.0]]) tree(x, z, A.top, s, !!palm);
rock(-4, -14, A.top, .9); rock(14, 9, A.top, .7); rock(-16, 0, A.top, .6); rock(1, -6, A.top, .5);
flowers(-4, 3, A.top); flowers(3, 2, A.top); flowers(-9, -2, A.top); flowers(11, 2, A.top); flowers(-12, -12, 2.5, 8); flowers(0, 13, A.top);
fence(-10, 8, -4, 13, A.top); fence(2, -13, 9, -13, A.top);
path(0, 2, dirAB.x * (A.r - 1), dirAB.y * (A.r - 1), A.top); path(0, 2, -7, -3, A.top, 1.8); path(0, 2, -2, 6.5, A.top, 1.8); path(-7, -3, -11, -9, A.top, 1.6);
sign(dirAB.x * (A.r - 3) + nAB.x * 3, dirAB.y * (A.r - 3) + nAB.y * 3, A.top, '숲 섬 →', Math.atan2(dirAB.x, dirAB.y) + Math.PI); sign(-9.5, -7.5, A.top, '뒷동산 ↑', .8, 3.2);
flag(1.5, 1.5, A.top, '출발 섬');
// 나루터: 널다리 끝의 배에 오르면 「활동의 섬」으로 간다(첫 배 = 가게 섬)
const dP = new THREE.Vector2(-.35, 1).normalize(), ports = [];
path(0, 4, dP.x * (A.r - 1), dP.y * (A.r - 1), A.top, 1.9); sign(dP.x * (A.r - 2.5) + 3.2, dP.y * (A.r - 2.5) + .6, A.top, '가게 섬 가는 배', Math.atan2(dP.x, dP.y) + Math.PI, 4.4);
for (let i = 0; i < 4; i++) { const d = A.r + 1.2 + i * 2.0; stone(dP.x * d, dP.y * d, 1.15, 2.05, 0xb9853b); }
{ const d = A.r + 11.2, bx = dP.x * d, bz = dP.y * d; const deck = stone(bx, bz, 1.05, 3.4, 0xd9a05b); const hull = box(4.2, .9, 4.2, 0x8a5a2b); hull.position.set(bx, .45, bz); const mast = cyl(.12, .12, 4.6, 0xf4e6c8, 6); mast.position.set(bx, 3.3, bz); const sail = box(.08, 2.6, 2.4, 0xff6b6b); sail.position.set(bx, 3.6, bz + .1); scene.add(hull, mast, sail); bobbers.push({ p: deck, ph: 1.7 }); ports.push({ x: bx, z: bz, top: 1.05, name: '가게 섬', href: '/math/play/shop/', t: 0 }); }
for (let i = 0; i < 9; i++) coin(dirAB.x * (4 + i * 2.2), A.top + 1.0, dirAB.y * (4 + i * 2.2) + 2 - i * .2);               // 길 따라 동전
for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; coin(-14.5 + Math.cos(a) * 1.1, 4.6 + 1.0, -14.5 + Math.sin(a) * 1.1); }        // 뒷동산 꼭대기
for (const [x, z] of [[8, 7], [-11, 7.5], [-2, 12.5], [9, -6], [17, -8], [-18, 2], [5, 19], [-7, -17]]) coin(x, A.top + 1.0, z);
// 출발 섬 → 숲 섬: 징검돌 일곱(조금씩 높낮이, 둘은 오르내림)
for (let i = 0; i < 7; i++) { const d = A.r + 1.7 + i * 2.35, off = Math.sin(i * 1.3) * 1.1, x = A.x + dirAB.x * d + nAB.x * off, z = A.z + dirAB.y * d + nAB.y * off, top = 1.0 + (i % 3) * .28; const p = stone(x, z, top, 1.8); if (i === 2 || i === 5) bobbers.push({ p, ph: i }); coin(x, top + 1.1, z); }
// 숲 섬: 빽빽한 숲 사이로 굽은 길, 가운데 빈터, 큰 나무 언덕
const bIn = { x: B.x - dirAB.x * (B.r - 1.5), z: B.z - dirAB.y * (B.r - 1.5) }, bOut = { x: B.x + dirBC.x * (B.r - 1.5), z: B.z + dirBC.y * (B.r - 1.5) };
path(bIn.x, bIn.z, B.x - 3, B.z + 4, B.top, 2); path(B.x - 3, B.z + 4, B.x + 4, B.z - 2, B.top, 2); path(B.x + 4, B.z - 2, bOut.x, bOut.z, B.top, 2);
{ const onPath = (x, z) => [[bIn.x, bIn.z, B.x - 3, B.z + 4], [B.x - 3, B.z + 4, B.x + 4, B.z - 2], [B.x + 4, B.z - 2, bOut.x, bOut.z]].some(([ax, az, bx, bz]) => { const L = (bx - ax) ** 2 + (bz - az) ** 2, u = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / L)); return Math.hypot(ax + u * (bx - ax) - x, az + u * (bz - az) - z) < 3.4; });
  let n = 0, g = 0; while (n < 26 && g++ < 400) { const a = rnd() * 6.28, d = 2 + rnd() * (B.r - 3.5), x = B.x + Math.cos(a) * d, z = B.z + Math.sin(a) * d; if (onPath(x, z) || Math.hypot(x - (B.x + 9), z - (B.z + 9)) < 6.5 || solids.some(o => Math.hypot(o.x - x, o.z - z) < 2.6)) continue; tree(x, z, B.top, .8 + rnd() * .7); n++; } }
hill(B.x + 9, B.z + 9, 5.2, 2.9, B.top); hill(B.x + 9.5, B.z + 9.5, 2.6, 4.0, 2.9, 0x4fb055); tree(B.x + 9.5, B.z + 9.5, 4.0, 1.9);
for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28 + .4, rr = 3.2 + (i % 3) * 3.6; const st = cyl(.14, .18, .5, 0xfff1d6, 8); st.position.set(B.x + Math.cos(a) * rr, B.top + .25, B.z + Math.sin(a) * rr); const cap = cyl(.1, .5, .34, i % 2 ? 0xff6b6b : 0xffa23d, 9); cap.position.set(st.position.x, B.top + .64, st.position.z); scene.add(st, cap); coin(st.position.x, B.top + 1.5, st.position.z); }
for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; coin(B.x + 9 + Math.cos(a) * 3.8, 2.9 + 1.0, B.z + 9 + Math.sin(a) * 3.8); }
flowers(B.x - 3, B.z + 4, B.top, 8); flowers(B.x + 4, B.z - 2, B.top, 8); rock(B.x - 8, B.z - 9, B.top, 1.0); rock(B.x + 12, B.z - 6, B.top, .8);
flag(B.x - 3, B.z + 2.5, B.top, '숲 섬'); sign(bIn.x + nAB.x * 3.2 + dirAB.x * 2.5, bIn.z + nAB.y * 3.2 + dirAB.y * 2.5, B.top, '보물 섬 →', Math.atan2(dirAB.x, dirAB.y) + Math.PI);
// 숲 섬 → 보물 섬: 수 다리 — 줄마다 돌 셋, 2씩 뛰어 센 수만 버틴다
sign(bOut.x + nBC.x * 4.4, bOut.z + nBC.y * 4.4, B.top, '2 → 4 → 6 → ?', rotBC + Math.PI, 5.0);
const bridge = []; const ROWS = 5, gapBC = (Math.hypot(C.x - B.x, C.z - B.z) - B.r - C.r - 2.2) / (ROWS - 1);
for (let i = 0; i < ROWS; i++) { const ok = 2 * (i + 1), opts = [ok, ok + (i % 2 ? -1 : 1), ok + (i < 2 ? 3 : -3)].sort(() => rnd() - .5), d = B.r + 1.4 + i * gapBC;
  opts.forEach((v, k) => { const x = B.x + dirBC.x * d + nBC.x * (k - 1) * 2.5, z = B.z + dirBC.y * d + nBC.y * (k - 1) * 2.5, top = 1.25 + i * .12; const p = stone(x, z, top, 1.9, 0xf4efe2); p.num = v; p.ok = v === ok; p.row = i; p.sink = 0; p.shake = 0;
    const t = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshStandardMaterial({ map: label(String(v), 256, 256, '#2b2f3a', '#f4efe2', 170), roughness: .9 })); t.rotation.x = -Math.PI / 2; const hold = new THREE.Group(); hold.rotation.y = Math.atan2(-dirBC.x, -dirBC.y); hold.position.y = .356; hold.add(t); p.mesh.add(hold); p.face = t; bridge.push(p); }); }
// 보물 섬: 야자숲 · 등대 · 가운데 둔덕(두 단) 꼭대기에 상자
hill(C.x + 1, C.z, 6.5, 3.2, C.top, 0xe9d3a0); hill(C.x + 1, C.z, 3.4, 4.3, 3.2, 0xe2c88e);
for (const [dx, dz, s] of [[-9, -6, 1.1], [-6, 9, 1.0], [5, 11, 1.2], [11, 5, .9], [10, -7, 1.1], [2, -12, 1.0], [-11, 3, .9]]) tree(C.x + dx, C.z + dz, C.top, s, true);
rock(C.x - 5, C.z - 9, C.top, 1.0); rock(C.x + 8, C.z + 9, C.top, .8); rock(C.x + 12, C.z - 1, C.top, .7); flowers(C.x - 6, C.z + 3, C.top, 6);
{ const lx = C.x + 9, lz = C.z - 11; for (let k = 0; k < 5; k++) { const s = cyl(1.5 - k * .14, 1.6 - k * .14, 1.9, k % 2 ? 0xe5484d : 0xffffff, 12); s.position.set(lx, C.top + .95 + k * 1.9, lz); scene.add(s); } const top = cyl(1.2, 1.2, 1.1, 0xffe27a, 10, { emissive: 0xffc23d, emissiveIntensity: 1.2 }); top.position.set(lx, C.top + 10.1, lz); const cap = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.2, 10), M(0x2b3a67)); cap.position.set(lx, C.top + 11.2, lz); scene.add(top, cap); solids.push({ x: lx, z: lz, r: 1.8 }); }
const cIn = { x: C.x - dirBC.x * (C.r - 1.5), z: C.z - dirBC.y * (C.r - 1.5) }; path(cIn.x, cIn.z, C.x - 5, C.z, C.top, 2); flag(cIn.x + dirBC.x * 3, cIn.z + dirBC.y * 3 + 2.5, C.top, '보물 섬');
for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; coin(C.x + 1 + Math.cos(a) * 5, 3.2 + 1.0, C.z + Math.sin(a) * 5); }
const chest = new THREE.Group(); chest.position.set(C.x + 1, 4.3, C.z); { const b = box(1.5, .9, 1.0, 0x9a5b22); b.position.y = .45; const band = box(1.56, .16, 1.06, 0xffc928, { metalness: .7, roughness: .3 }); band.position.y = .5; const lid = new THREE.Group(); lid.position.set(0, .9, -.5); const l = box(1.5, .4, 1.0, 0xb26a28); l.position.set(0, .2, .5); const lock = box(.26, .3, .1, 0xffc928, { metalness: .7, roughness: .3 }); lock.position.set(0, .1, 1.02); lid.add(l, lock); chest.add(b, band, lid); chest.lid = lid; const glowL = new THREE.PointLight(0xffd35c, 0, 9); glowL.position.y = 1.4; chest.add(glowL); chest.glow = glowL; } scene.add(chest); solids.push({ x: chest.position.x, z: chest.position.z, r: 1.0 });

// ── 내 캐릭터(상자 몸)
const me = new THREE.Group(); const body = new THREE.Group(); me.add(body);
{ const face = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#ffd9a8'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#1b2233'; x.beginPath(); x.arc(42, 56, 9, 0, 7); x.arc(86, 56, 9, 0, 7); x.fill(); x.strokeStyle = '#1b2233'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.arc(64, 74, 22, .2 * Math.PI, .8 * Math.PI); x.stroke(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const skin = M(0xffd9a8), head = new THREE.Mesh(new THREE.BoxGeometry(.62, .62, .62), [skin, skin, skin, skin, new THREE.MeshStandardMaterial({ map: face, roughness: .85 }), skin]); head.position.y = 1.72; head.castShadow = true;
  const hat = box(.7, .2, .7, 0xff7a3d); hat.position.y = 2.1; const brim = box(.7, .08, .34, 0xff7a3d); brim.position.set(0, 2.02, .46);
  const torso = box(.74, .78, .42, 0x2d7ff0); torso.position.y = 1.02; const mk = (c, x) => { const g = new THREE.Group(); const m = box(.26, .72, .28, c); m.position.y = -.36; g.add(m); g.position.set(x, 1.4, 0); return g; }; const lk = (x) => { const g = new THREE.Group(); const m = box(.32, .64, .34, 0x26355c); m.position.y = -.32; g.add(m); g.position.set(x, .64, 0); return g; };
  me.armL = mk(0xffd9a8, -.51); me.armR = mk(0xffd9a8, .51); me.legL = lk(-.2); me.legR = lk(.2); body.add(head, hat, brim, torso, me.armL, me.armR, me.legL, me.legR); }
const blob = new THREE.Mesh(new THREE.CircleGeometry(.5, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28, depthWrite: false })); scene.add(me, blob);
const P = { x: 0, y: A.top, z: 3.5, vx: 0, vy: 0, vz: 0, yaw: Math.PI * .6, on: true, air: 0, dead: 0, spawn: { x: 0, y: A.top, z: 3.5 }, walk: 0, land: 0 };

// ── 입력
const key = {}; let jumpQ = 0, camYaw = -1.9, camPit = .62, camDist = 12.5;
addEventListener('keydown', e => { key[e.code] = true; if (e.code === 'Space') { jumpQ = .15; e.preventDefault(); } audio(); }); addEventListener('keyup', e => { key[e.code] = false; });
const stick = { id: null, x: 0, y: 0, cx: 0, cy: 0 }, look = { id: null, x: 0, y: 0 }; const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window; if (isTouch) document.body.classList.add('touch');
const sEl = $('stick'), nub = sEl.firstElementChild;
sEl.addEventListener('pointerdown', e => { stick.id = e.pointerId; const r = sEl.getBoundingClientRect(); stick.cx = r.left + r.width / 2; stick.cy = r.top + r.height / 2; sEl.setPointerCapture(e.pointerId); moveStick(e); audio(); });
function moveStick(e){ let dx = (e.clientX - stick.cx) / 52, dy = (e.clientY - stick.cy) / 52; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } stick.x = dx; stick.y = dy; nub.style.transform = `translate(${dx * 40}px,${dy * 40}px)`; }
sEl.addEventListener('pointermove', e => { if (e.pointerId === stick.id) moveStick(e); }); const endStick = e => { if (e.pointerId === stick.id) { stick.id = null; stick.x = stick.y = 0; nub.style.transform = ''; } }; sEl.addEventListener('pointerup', endStick); sEl.addEventListener('pointercancel', endStick);
$('jump').addEventListener('pointerdown', e => { jumpQ = .15; audio(); e.preventDefault(); });
const cv = $('c'); cv.addEventListener('pointerdown', e => { look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY; cv.setPointerCapture(e.pointerId); audio(); });
cv.addEventListener('pointermove', e => { if (e.pointerId !== look.id) return; camYaw -= (e.clientX - look.x) * .006; camPit = Math.max(.25, Math.min(1.15, camPit + (e.clientY - look.y) * .004)); look.x = e.clientX; look.y = e.clientY; }); const endLook = e => { if (e.pointerId === look.id) look.id = null; }; cv.addEventListener('pointerup', endLook); cv.addEventListener('pointercancel', endLook);
cv.addEventListener('wheel', e => { camDist = Math.max(6, Math.min(18, camDist + e.deltaY * .01)); }, { passive: true });

// ── 소리
let ac = null; function audio(){ try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) {} }
function tone(f, d = .12, type = 'triangle', g = .12, delay = 0, to){ if (!ac) return; try { const t = ac.currentTime + delay, o = ac.createOscillator(), a = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d); a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(a); a.connect(ac.destination); o.start(t); o.stop(t + d + .02); } catch (_) {} }
const SFX = { jump: () => tone(380, .16, 'sine', .1, 0, 760), land: () => tone(140, .08, 'sine', .1, 0, 80), coin: () => { tone(988, .07, 'square', .06); tone(1319, .16, 'square', .06, .07); }, splash: () => tone(500, .45, 'sawtooth', .08, 0, 90), good: () => { tone(660, .1); tone(880, .16, 'triangle', .12, .08); }, sink: () => tone(220, .5, 'sine', .14, 0, 70), flag: () => [523, 659, 784].forEach((f, i) => tone(f, .16, 'triangle', .12, i * .08)), win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, .28, 'triangle', .14, i * .11)) };

// ── 알림
let msgT = 0; function say(t, sec = 3.5){ $('msg').textContent = t; $('msg').style.opacity = 1; msgT = sec; }
function big(t, s, sec = 3){ $('bigT').textContent = t; $('bigS').textContent = s || ''; $('big').style.opacity = 1; setTimeout(() => { $('big').style.opacity = 0; }, sec * 1000); }
let nCoins = 0, won = false, goal = 0; const GOALS = [{ x: B.x - 3, z: B.z + 2.5, t: '숲 섬으로' }, { x: flags[2].x, z: flags[2].z, t: '수 다리를 건너 보물 섬으로' }, { x: chest.position.x, z: chest.position.z, t: '둔덕 꼭대기 보물 상자!' }];
const parts = []; function burst(x, y, z, col, n = 14, sp = 5){ for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.16, .16, .16), new THREE.MeshBasicMaterial({ color: col })); m.position.set(x, y, z); scene.add(m); parts.push({ m, vx: (rnd() - .5) * sp, vy: 2 + rnd() * sp, vz: (rnd() - .5) * sp, t: .9 + rnd() * .5 }); } }

// ── 한 걸음
const SPEED = 6.2, JUMP = 8.6, GRAV = 23;
function ground(x, z, y, vy){ let best = null; for (const p of plats) { let inside; if (p.kind === 'disc') inside = Math.hypot(x - p.x, z - p.z) <= p.r; else inside = Math.abs(x - p.x) <= p.w / 2 + .12 && Math.abs(z - p.z) <= p.d / 2 + .12; if (!inside) continue; const top = p.kind === 'box' ? p.mesh.position.y + .35 : p.top; if (top <= y + .55 && (!best || top > best.top)) best = { top, p }; } return best; }
function step(dt, t){
  // 바다·구름·동전·움직이는 돌
  const sp = seaG.attributes.position; for (let i = 0; i < sp.count; i++) { const x = seaBase[i * 3] + sea.position.x, z = seaBase[i * 3 + 2] + sea.position.z; sp.array[i * 3 + 1] = Math.sin(x * .16 + t * 1.1) * .16 + Math.cos(z * .2 + t * .8) * .14; } sp.needsUpdate = true; seaG.computeVertexNormals();
  for (const c of clouds) { c.position.x += dt * .9; if (c.position.x > 130) c.position.x = -130; }
  for (const b of bobbers) b.p.mesh.position.y = b.p.baseY + Math.sin(t * 1.4 + b.ph) * .22;
  for (const c of coins) { if (c.got) continue; c.m.rotation.z = t * 2.4 + c.ph; c.m.position.y = c.y + Math.sin(t * 2 + c.ph) * .14; if (Math.hypot(P.x - c.x, P.z - c.z) < .95 && Math.abs(P.y + .9 - c.m.position.y) < 1.3) { c.got = true; c.m.visible = false; nCoins++; $('coins').textContent = nCoins; SFX.coin(); burst(c.x, c.m.position.y, c.z, 0xffd35c, 8, 3); } }
  for (const p of bridge) { if (p.shake > 0) { p.shake -= dt; p.mesh.position.x = p.x + Math.sin(t * 60) * .06; if (p.shake <= 0) { p.sink = 3.2; SFX.sink(); } } else p.mesh.position.x = p.x; if (p.sink > 0) { p.sink -= dt; p.mesh.position.y = Math.max(-2.2, p.mesh.position.y - dt * 7); if (p.sink <= 0) p.mesh.position.y = p.baseY; } else if (!p.shake) p.mesh.position.y += (p.baseY - p.mesh.position.y) * Math.min(1, dt * 4); }
  for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.vy -= 14 * dt; q.m.position.x += q.vx * dt; q.m.position.y += q.vy * dt; q.m.position.z += q.vz * dt; q.m.rotation.x += dt * 6; q.t -= dt; if (q.t <= 0) { scene.remove(q.m); parts.splice(i, 1); } }
  if (msgT > 0) { msgT -= dt; if (msgT <= 0) $('msg').style.opacity = 0; }
  // 빠졌다가 돌아오기
  if (P.dead > 0) { P.dead -= dt; me.position.y -= dt * 2; if (P.dead <= 0) { Object.assign(P, { x: P.spawn.x, y: P.spawn.y + .2, z: P.spawn.z, vx: 0, vy: 0, vz: 0 }); me.visible = true; } return; }
  // 걷기(카메라가 보는 쪽 기준)
  let ix = (key.KeyD || key.ArrowRight ? 1 : 0) - (key.KeyA || key.ArrowLeft ? 1 : 0) + stick.x, iz = (key.KeyS || key.ArrowDown ? 1 : 0) - (key.KeyW || key.ArrowUp ? 1 : 0) + stick.y; const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
  const s = Math.sin(camYaw), c = Math.cos(camYaw), wx = ix * c + iz * s, wz = -ix * s + iz * c, acc = P.on ? 14 : 7;
  P.vx += (wx * SPEED - P.vx) * Math.min(1, acc * dt); P.vz += (wz * SPEED - P.vz) * Math.min(1, acc * dt);
  if (il > .1) { const want = Math.atan2(wx, wz); let d = want - P.yaw; while (d > Math.PI) d -= 6.283; while (d < -Math.PI) d += 6.283; P.yaw += d * Math.min(1, dt * 12); }
  jumpQ -= dt; P.air += dt; if (jumpQ > 0 && P.air < .13) { P.vy = JUMP; P.on = false; P.air = 1; jumpQ = 0; SFX.jump(); }
  P.vy -= GRAV * dt; let nx = P.x + P.vx * dt, nz = P.z + P.vz * dt;
  for (const o of solids) { const dx = nx - o.x, dz = nz - o.z, d = Math.hypot(dx, dz), m = o.r + .36; if (d < m && d > .001) { nx = o.x + dx / d * m; nz = o.z + dz / d * m; } }
  for (const p of plats) { if (p.kind !== 'disc' || p.beach) continue; if (P.y < p.top - .5) { const dx = nx - p.x, dz = nz - p.z, d = Math.hypot(dx, dz), m = p.r + .9; if (d < m && d > .001) { nx = p.x + dx / d * m; nz = p.z + dz / d * m; } } }      // 섬 옆구리는 못 뚫는다
  P.x = nx; P.z = nz; const prevY = P.y; P.y += P.vy * dt; const g = ground(P.x, P.z, prevY, P.vy); const was = P.on; P.on = false;
  if (g && P.vy <= 0 && P.y <= g.top) { P.y = g.top; P.vy = 0; P.on = true; P.air = 0; if (!was) { P.land = .18; SFX.land(); }
    const p = g.p; if (p.num != null && !p.stepped && !p.sink && !p.shake) { p.stepped = true; setTimeout(() => { p.stepped = false; }, 1200); if (p.ok) { p.mesh.material.color.set(0x7dffa8); p.face.material.color.set(0x9dffbf); SFX.good(); burst(p.x, p.top + .3, p.z, 0x7dffa8, 10, 4); } else { p.shake = .32; p.face.material.color.set(0xff9a9a); setTimeout(() => p.face.material.color.set(0xffffff), 3600); } } }
  if (P.y < .15) { P.dead = .9; me.visible = true; SFX.splash(); burst(P.x, .3, P.z, 0xbfefff, 22, 6); say('풍덩! 깃발로 돌아가요', 2); }
  for (const f of flags) if (!f.on && Math.hypot(P.x - f.x, P.z - f.z) < 2.2 && Math.abs(P.y - f.top) < 1) { f.on = true; f.f.material.color.set(0xff4d6a); P.spawn = { x: f.x + .8, y: f.top, z: f.z + .8 }; if (f.name !== '출발 섬') { SFX.flag(); big(f.name, '여기서부터 다시 시작해요', 2.2); if (goal < 2 && f.name === '숲 섬') goal = 1; if (f.name === '보물 섬') goal = 2; } }
  for (const po of ports) { if (Math.hypot(P.x - po.x, P.z - po.z) < 1.5 && P.on && P.y < 1.6) { po.t += dt; if (po.t > .5 && !po.go) { po.go = true; SFX.flag(); big(po.name + '으로 출발!', '', 2); setTimeout(() => { location.href = po.href; }, 1300); } } else if (!po.go) po.t = 0; }
  if (!won && Math.hypot(P.x - chest.position.x, P.z - chest.position.z) < 2.3 && Math.abs(P.y - chest.position.y) < 1) { won = true; SFX.win(); big('보물을 찾았어!', `동전 ${nCoins}개를 모았어요`, 6); for (let i = 0; i < 5; i++) setTimeout(() => burst(chest.position.x, chest.position.y + 1.2, chest.position.z, [0xffd35c, 0xff7a3d, 0x7dffa8, 0x8fe3ff][i % 4], 26, 9), i * 260); }
  if (won) { chest.lid.rotation.x += (-1.9 - chest.lid.rotation.x) * Math.min(1, dt * 4); chest.glow.intensity += (60 - chest.glow.intensity) * dt * 2; }
  // 몸짓
  const moving = Math.hypot(P.vx, P.vz) > .6 && P.on; P.walk += dt * (moving ? 11 : 0); const sw = moving ? Math.sin(P.walk) * .9 : 0; P.land = Math.max(0, P.land - dt);
  me.legL.rotation.x = sw; me.legR.rotation.x = -sw; me.armL.rotation.x = P.on ? -sw : -2.6; me.armR.rotation.x = P.on ? sw : -2.6; body.position.y = (moving ? Math.abs(Math.sin(P.walk)) * .07 : Math.sin(t * 2) * .015) - P.land * .5; body.scale.y = 1 - P.land * .7;
  me.position.set(P.x, P.y, P.z); me.rotation.y = P.yaw;
  const gb = ground(P.x, P.z, P.y + .1, 0); blob.visible = !!gb; if (gb) { blob.position.set(P.x, gb.top + .03, P.z); const hgt = Math.max(0, P.y - gb.top); blob.scale.setScalar(Math.max(.4, 1 - hgt * .12)); blob.material.opacity = Math.max(.08, .28 - hgt * .04); }
}
function camera(dt){ const tx = P.x, ty = Math.max(P.y, .4) + 1.5, tz = P.z, cx = tx + Math.sin(camYaw) * Math.cos(camPit) * camDist, cy = ty + Math.sin(camPit) * camDist, cz = tz + Math.cos(camYaw) * Math.cos(camPit) * camDist; const k = Math.min(1, dt * 7); cam.position.x += (cx - cam.position.x) * k; cam.position.y += (cy - cam.position.y) * k; cam.position.z += (cz - cam.position.z) * k; cam.lookAt(tx, ty, tz);
  for (const tr of trees) { const ax = cam.position.x, az = cam.position.z, bx = P.x - ax, bz = P.z - az, L = bx * bx + bz * bz || 1, u = Math.max(0, Math.min(1, ((tr.x - ax) * bx + (tr.z - az) * bz) / L)), d = Math.hypot(ax + u * bx - tr.x, az + u * bz - tr.z), want = d < 2.4 && u < .93 && cam.position.y < tr.h + 9 ? .16 : 1; if (Math.abs(want - tr.a) > .01) { tr.a += (want - tr.a) * Math.min(1, dt * 8); tr.g.traverse(o => { if (o.material) { o.material.transparent = tr.a < .99; o.material.opacity = tr.a; o.castShadow = tr.a > .6; } }); } }
  sea.position.x = deep.position.x = Math.round(P.x / 10) * 10; sea.position.z = deep.position.z = Math.round(P.z / 10) * 10;
  sun.position.set(P.x - 30, 46, P.z + 22); sun.target.position.set(P.x, 0, P.z);
  const G = GOALS[goal]; if (G && !won) { const a = Math.atan2(G.x - P.x, G.z - P.z) - camYaw + Math.PI; $('arrowSvg').style.transform = `rotate(${-a}rad)`; $('arrowT').textContent = G.t; } else $('arrow').style.opacity = 0; }
function resize(){ const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 72 : 58; cam.updateProjectionMatrix(); } addEventListener('resize', resize); resize();
cam.position.set(P.x + 8, 9, P.z + 9);
let last = performance.now(), T = 0; function loop(now){ requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now; T += dt; step(dt, T); camera(dt); R.render(scene, cam); }
say(isTouch ? '왼쪽 막대로 걷고, 「점프」로 뛰어요. 화면을 끌면 둘러봐요' : '방향키로 걷고, 스페이스로 뛰어요. 마우스로 끌면 둘러봐요', 6); requestAnimationFrame(loop);
window.__isle = { ports, P, plats, bridge, coins, flags, chest, key, get won(){ return won; }, get nCoins(){ return nCoins; }, set camYaw(v){ camYaw = v; }, get camYaw(){ return camYaw; }, A, B, C, step, T: () => T };
