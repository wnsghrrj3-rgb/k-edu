/* 케이월드 · 그믐밤 — 조선 노비의 도망 한 장면(샘플, 2026-11-16).
   원칙: 목표는 하나(강 건너 나루의 등불)이고 늘 화면에 보인다 · 글 카드 없음 · 한 행동마다 바로 결과 · 잡히면 끝이 아니라 다음 밤이 달라진다.
   좌표: x 동쪽(+), z 남쪽(+). 강은 북쪽(z 0~6). 화면은 남쪽 위에서 비스듬히 내려다본다. */
import * as THREE from 'three';

const W = 70, H = 46;
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

/* ───── 무대 ───── */
/* 막는 것: [x0,z0,x1,z1,높이,종류] */
const SOLID = [
  /* 양반집 담(북쪽 담 14~16 은 무너진 곳, 서쪽 담 33~35 는 수챗구멍, 동쪽 담 31~35 는 대문) */
  [4, 22, 14, 22.7, 1.7, 'wall'], [16, 22, 30, 22.7, 1.7, 'wall'],
  [4, 43.3, 30, 44, 1.7, 'wall'],
  [4, 22, 4.7, 33, 1.7, 'wall'], [4, 35, 4.7, 44, 1.7, 'wall'],
  [29.3, 22, 30, 31, 1.7, 'wall'], [29.3, 35, 30, 44, 1.7, 'wall'],
  /* 집 */
  [8, 25.5, 19, 30.5, 3.4, 'tile'],      /* 안채 */
  [6, 38.5, 13, 42, 2.8, 'thatch'],      /* 행랑채 */
  [20.5, 37, 26.5, 41.5, 2.8, 'thatch'], /* 부엌 */
  /* 장터 가게 */
  [44, 20, 49, 23.5, 2.6, 'thatch'], [53, 19, 58, 22.5, 2.6, 'thatch'], [61, 21, 66, 24.5, 2.6, 'thatch'],
  [45, 30, 50, 33.5, 2.6, 'thatch'], [55, 29, 60, 32.5, 2.6, 'thatch'],
  /* 나루 창고 */
  [63, 8.5, 67.5, 12, 2.6, 'thatch'],
];
/* 느린 곳(아이만 지남): 무너진 담 · 수챗구멍 · 개울 · 갈대밭 */
const SLOW = [
  { r: [14, 21.6, 16, 23.1], k: 0.3, name: 'wallgap' },
  { r: [3.6, 33, 5.1, 35], k: 0.3, name: 'drain' },
  { r: [0.5, 9, 3.4, 45], k: 0.45, name: 'stream' },
  { r: [0.5, 6.2, 52, 9.2], k: 0.5, name: 'reed', hide: true },
];
/* 숨을 곳: [x,z,반지름,종류] */
const HIDE = [
  [6.3, 32, 1.5, 'hay'], [26.5, 28.5, 1.5, 'jar'], [17, 36.5, 1.4, 'hay'],
  [24, 16, 1.5, 'hay'], [35, 13.5, 1.5, 'hay'], [10, 14, 1.5, 'hay'],
  [42.5, 26.5, 1.4, 'jar'], [51.5, 26, 1.5, 'hay'], [62.5, 28, 1.4, 'jar'], [52, 35.5, 1.5, 'hay'], [47.5, 15.5, 1.4, 'jar'],
  [36, 40, 1.5, 'hay'],
];
const TREES = [[9, 17, 2.4], [29, 12.5, 2.6], [17, 11.5, 2.2], [38, 19, 2.4], [40, 33, 2.3], [34, 24, 2.2], [68, 36, 2.4], [58, 14.5, 2.0]];
const STONES0 = [[11, 35.5], [27, 39.5], [22, 19.5], [44, 37], [56, 25.5], [6, 12]];
const RICE = [23.5, 35.6];
const DOG = [20.5, 18.5];
const START = [9.5, 36.6];
const BOAT = [59.5, 6.4], LAMP = [57.2, 7.6], FERRY = [55.2, 9.2];
const MOON_DIR = (() => { const v = new THREE.Vector3(-22, 20, -16); return v; })();
const SHADOW_K = Math.hypot(22, 16) / 20; /* 높이 1 당 그림자 길이 */
const SD = (() => { const l = Math.hypot(22, 16); return [22 / l, 16 / l]; })(); /* 그림자가 뻗는 방향 */

const GUARDS0 = [
  { path: [[14, 34], [27.5, 34], [27.5, 24.5], [6, 24.5], [6, 34]], hat: 0 },
  { path: [[33, 30], [33, 38.5], [40, 38.5], [40, 30]], hat: 0 },
  { path: [[36, 12], [61, 12.5], [61, 15.5], [36, 15]], hat: 0 },
];
const EXTRA = [
  { path: [[20, 20], [38, 20], [38, 26], [32, 26]], hat: 0 },
  { path: [[50, 27], [64, 27], [64, 37], [50, 37]], hat: 0 },
  { path: [[8, 19.5], [26, 19.5], [26, 10.5], [8, 10.5]], hat: 0 },
];
const VILLAGER = { path: [[51.5, 24.5], [60.5, 26], [53, 34.5], [43.5, 28]], hat: 1 };

/* ───── 화면 ───── */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1224);
scene.fog = new THREE.Fog(0x0b1224, 60, 130);
const cam = new THREE.PerspectiveCamera(36, 1, 0.5, 200);
const hemi = new THREE.HemisphereLight(0x7f97d8, 0x2c3140, 1.15); scene.add(hemi);
const moon = new THREE.DirectionalLight(0xbfd0ff, 0.5);
moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
{ const c = moon.shadow.camera; c.left = -46; c.right = 46; c.top = 34; c.bottom = -34; c.near = 1; c.far = 110; }
moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.04;
moon.position.set(W / 2 + MOON_DIR.x * 1.6, MOON_DIR.y * 1.6, H / 2 + MOON_DIR.z * 1.6); moon.target.position.set(W / 2, 0, H / 2);
scene.add(moon, moon.target);

function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, metalness: 0, ...o });
function tex(w, h, fn) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

/* 땅: 한 장 그림 */
const groundTex = tex(1400, 920, (g, w, h) => {
  const sx = w / W, sz = h / H, R = rnd(7);
  g.fillStyle = '#4a5a36'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${40 + R() * 50},${70 + R() * 50},${30 + R() * 30},.35)`; g.fillRect(R() * w, R() * h, 2 + R() * 4, 2 + R() * 3); }
  const dirt = (x0, z0, x1, z1, c = '#8a7250') => { g.fillStyle = c; g.fillRect(x0 * sx, z0 * sz, (x1 - x0) * sx, (z1 - z0) * sz); for (let i = 0; i < (x1 - x0) * (z1 - z0) * 5; i++) { g.fillStyle = `rgba(${60 + R() * 60},${45 + R() * 45},${25 + R() * 30},.3)`; g.fillRect((x0 + R() * (x1 - x0)) * sx, (z0 + R() * (z1 - z0)) * sz, 3, 2); } };
  dirt(4, 22, 30, 44, '#8d7654');                      /* 마당 */
  dirt(30, 31.2, 44, 34.8); dirt(42, 16, 68, 40, '#84704f'); /* 대문 길 · 장터 */
  dirt(52, 9, 56.5, 17); dirt(34, 11, 62, 16, '#7d6a4b');  /* 나루 길 */
  g.fillStyle = '#1d3554'; g.fillRect(0, 0, w, 6 * sz);     /* 강 */
  g.fillStyle = '#2a4a6e'; for (let i = 0; i < 260; i++) g.fillRect(R() * w, R() * 6 * sz, 20 + R() * 40, 1.5);
  g.fillStyle = '#3c4c34'; g.fillRect(0, 6 * sz, 52 * sx, 3.2 * sz); /* 갈대밭 바닥 */
  g.fillStyle = '#28435e'; g.fillRect(0.5 * sx, 9 * sz, 2.9 * sx, 36 * sz); /* 개울 */
  g.fillStyle = '#35587a'; for (let i = 0; i < 120; i++) g.fillRect((0.6 + R() * 2.6) * sx, (9 + R() * 36) * sz, 2, 8 + R() * 10);
});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(W + 60, H + 50), M(0x3f4d30));
ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, -0.02, H / 2); ground.receiveShadow = true; scene.add(ground);
const stage = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 }));
stage.rotation.x = -Math.PI / 2; stage.position.set(W / 2, 0, H / 2); stage.receiveShadow = true; scene.add(stage);
const river = new THREE.Mesh(new THREE.PlaneGeometry(W + 60, 30), M(0x16293f, { roughness: 0.35, metalness: 0.3 }));
river.rotation.x = -Math.PI / 2; river.position.set(W / 2, -0.01, -9); scene.add(river);
const far = new THREE.Mesh(new THREE.PlaneGeometry(W + 60, 14), M(0x232e22)); far.rotation.x = -Math.PI / 2; far.position.set(W / 2, 0.02, -27); scene.add(far);

const thatchTex = tex(128, 128, (g) => { g.fillStyle = '#b89a55'; g.fillRect(0, 0, 128, 128); const R = rnd(3); for (let i = 0; i < 900; i++) { g.strokeStyle = `rgba(${90 + R() * 80},${70 + R() * 70},${20 + R() * 40},.5)`; g.beginPath(); const x = R() * 128, y = R() * 128; g.moveTo(x, y); g.lineTo(x + (R() - .5) * 6, y + 10 + R() * 10); g.stroke(); } });
const tileTex = tex(128, 128, (g) => { g.fillStyle = '#3a3f4c'; g.fillRect(0, 0, 128, 128); for (let y = 0; y < 128; y += 16) for (let x = 0; x < 128; x += 16) { g.fillStyle = (x / 16 + y / 16) % 2 ? '#2f3440' : '#444a58'; g.beginPath(); g.arc(x + 8, y + 16, 8, Math.PI, 0); g.fill(); } });
const wallTex = tex(128, 64, (g) => { g.fillStyle = '#7b6a55'; g.fillRect(0, 0, 128, 64); const R = rnd(5); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${70 + R() * 70},${60 + R() * 60},${50 + R() * 50},.8)`; g.beginPath(); g.ellipse(R() * 128, R() * 64, 7 + R() * 7, 5 + R() * 4, 0, 0, 7); g.fill(); } });
[thatchTex, tileTex, wallTex].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; });

function addBox(x0, z0, x1, z1, h, mat, y = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, h, z1 - z0), mat); m.position.set((x0 + x1) / 2, y + h / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; scene.add(m); return m; }
function addRoof(x0, z0, x1, z1, base, rise, mat) {
  const w = x1 - x0 + 1.4, d = z1 - z0 + 1.4, long = w >= d;
  const s = new THREE.Shape(); const half = (long ? d : w) / 2; s.moveTo(-half, 0); s.lineTo(0, rise); s.lineTo(half, 0); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: long ? w : d, bevelEnabled: false });
  const m = new THREE.Mesh(geo, mat); m.castShadow = true;
  if (long) { m.rotation.y = Math.PI / 2; m.position.set(x0 - 0.7, base, (z0 + z1) / 2); } else m.position.set((x0 + x1) / 2, base, z0 - 0.7);
  scene.add(m);
}
const mWall = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 1 });
const mClay = M(0xc9a876), mThatch = new THREE.MeshStandardMaterial({ map: thatchTex, roughness: 1 }), mTile = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.8 }), mWood = M(0x5b422c);
for (const [x0, z0, x1, z1, h, kind] of SOLID) {
  if (kind === 'wall') { addBox(x0, z0, x1, z1, h, mWall); addBox(x0 - 0.12, z0 - 0.12, x1 + 0.12, z1 + 0.12, 0.22, mTile, h); }
  else { addBox(x0, z0, x1, z1, h * 0.62, kind === 'tile' ? M(0xe6dcc6) : mClay); addRoof(x0, z0, x1, z1, h * 0.62, h * 0.55, kind === 'tile' ? mTile : mThatch);
    const door = addBox((x0 + x1) / 2 - 0.6, z1 - 0.02, (x0 + x1) / 2 + 0.6, z1 + 0.06, h * 0.5, mWood); door.castShadow = false; }
}
/* 무너진 담 · 수챗구멍 */
addBox(14, 22.05, 16, 22.65, 0.55, mWall); for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28 + (i % 3) * 0.08), mWall); s.position.set(13.6 + i * 0.5, 0.2, 21.4 + (i % 2) * 1.9); s.castShadow = true; scene.add(s); }
addBox(4, 33, 4.7, 35, 0.9, mWall, 0.8); addBox(3.9, 33.2, 4.8, 34.8, 0.06, M(0x1b2b3a));
/* 대문 기둥 */
addBox(29.2, 30.6, 30.1, 31, 2.6, mWood); addBox(29.2, 35, 30.1, 35.4, 2.6, mWood); addBox(29.1, 30.6, 30.2, 35.4, 0.3, mTile, 2.6);

const hideMeshes = [];
for (const [x, z, r, kind] of HIDE) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  if (kind === 'hay') { const a = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.95, 1.5, 10), mThatch); a.position.y = 0.75; const b = new THREE.Mesh(new THREE.ConeGeometry(r * 0.7, 0.9, 10), mThatch); b.position.y = 1.9; g.add(a, b); }
  else for (let i = 0; i < 4; i++) { const j = new THREE.Mesh(new THREE.SphereGeometry(0.5 + (i % 2) * 0.12, 12, 10), M(0x5a3b28, { roughness: 0.5 })); j.scale.y = 1.25; j.position.set(Math.cos(i * 1.7) * 0.75, 0.6, Math.sin(i * 1.7) * 0.75); g.add(j); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); scene.add(g); hideMeshes.push(g);
}
for (const [x, z, r] of TREES) {
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 3.4, 7), M(0x3d2c1e)); t.position.set(x, 1.7, z); t.castShadow = true; scene.add(t);
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r * (0.62 - i * 0.07), 1), M(0x24402a)); c.position.set(x + Math.cos(i * 2.1) * r * 0.36, 3.6 + (i % 2) * 0.7, z + Math.sin(i * 2.1) * r * 0.36); c.castShadow = true; scene.add(c); }
}
/* 갈대 */
{ const R = rnd(11), geo = new THREE.ConeGeometry(0.07, 1.5, 4), im = new THREE.InstancedMesh(geo, M(0x7d8a52), 900), o = new THREE.Object3D();
  for (let i = 0; i < 900; i++) { o.position.set(0.5 + R() * 51.5, 0.75, 6.2 + R() * 3); o.rotation.set((R() - .5) * .3, 0, (R() - .5) * .3); o.scale.setScalar(0.7 + R() * 0.7); o.updateMatrix(); im.setMatrixAt(i, o.matrix); } scene.add(im); }
/* 나루 · 배 · 등불 */
addBox(53.6, 5.2, 56.8, 9.6, 0.25, mWood, 0.1);
const boat = new THREE.Group();
{ const hull = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 1.5), mWood); hull.position.y = 0.3; const bow = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.2, 4), mWood); bow.rotation.z = -Math.PI / 2; bow.position.set(2.6, 0.3, 0); boat.add(hull, bow); boat.position.set(BOAT[0], 0, BOAT[1]); scene.add(boat); }
const lampPost = addBox(LAMP[0] - 0.08, LAMP[1] - 0.08, LAMP[0] + 0.08, LAMP[1] + 0.08, 2.6, mWood);
const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffd27a })); lamp.position.set(LAMP[0], 2.8, LAMP[1]); scene.add(lamp);
const lampL = new THREE.PointLight(0xffb347, 26, 22, 1.7); lampL.position.copy(lamp.position); scene.add(lampL);
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,220,140,.9)'); r.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }), depthTest: false, transparent: true, blending: THREE.AdditiveBlending }));
glow.scale.set(7, 7, 1); glow.position.copy(lamp.position); scene.add(glow);
/* 먼 마을 불빛(강 건너) */
for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffc777 })); s.position.set(30 + i * 7 + (i % 2) * 3, 0.8, -22 - (i % 3) * 2); scene.add(s); }

/* 사람 */
function person(body, hat) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.75, 4, 10), M(body)); b.position.y = 0.95;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 10), M(0xe2b98f)); head.position.y = 1.75;
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.285, 12, 8, 0, 7, 0, 1.5), M(0x1b1512)); hair.position.y = 1.78;
  g.add(b, head, hair);
  if (hat === 0) { const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 14), M(0x15151a)); brim.position.y = 1.98; const top = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.34, 10), M(0x15151a)); top.position.y = 2.16; const tassel = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), M(0xc0392b)); tassel.position.y = 2.36; g.add(brim, top, tassel); }
  if (hat === 2) { const band = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.05, 6, 14), M(0xf2efe6)); band.rotation.x = Math.PI / 2; band.position.y = 1.86; g.add(band); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g;
}
const pMesh = person(0xf2ecdc, 2);
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.78, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const dog = new THREE.Group();
{ const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.6, 4, 8), M(0xc9a36b)); b.rotation.z = Math.PI / 2; b.position.y = 0.42; const h = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), M(0xc9a36b)); h.position.set(0.5, 0.6, 0); dog.add(b, h); dog.position.set(DOG[0], 0, DOG[1]); dog.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(dog); }
const boatman = person(0x6f7f8c, 1); boatman.position.set(FERRY[0], 0.35, FERRY[1]);
const riceMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x554422, roughness: 0.7 })); riceMesh.position.set(RICE[0], 0.5, RICE[1]); scene.add(riceMesh);
const stoneGeo = new THREE.DodecahedronGeometry(0.2), stoneMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, emissive: 0x222630, roughness: 0.8 });
const flying = new THREE.Mesh(stoneGeo, stoneMat); flying.visible = false; scene.add(flying);
const rings = [];
function ring(x, z, r, col = 0xffffff) { const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.08, z); scene.add(m); rings.push({ m, r, t: 0 }); }

/* ───── 길찾기(순라꾼용) ───── */
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
function segRect(ax, az, bx, bz, r) { /* 선분이 사각형을 지나는가 */
  let t0 = 0, t1 = 1; const dx = bx - ax, dz = bz - az;
  for (const [p, q] of [[-dx, ax - r[0]], [dx, r[2] - ax], [-dz, az - r[1]], [dz, r[3] - az]]) { if (p === 0) { if (q < 0) return false; } else { const t = q / p; if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; } } }
  return true;
}
function los(ax, az, bx, bz) { for (const s of SOLID) if (segRect(ax, az, bx, bz, s)) return false; return true; }
function rayLen(ax, az, dx, dz, max) { let best = max; for (const r of SOLID) { let t0 = 0, t1 = max, ok = true;
    for (const [p, q] of [[-dx, ax - r[0]], [dx, r[2] - ax], [-dz, az - r[1]], [dz, r[3] - az]]) { if (p === 0) { if (q < 0) { ok = false; break; } } else { const t = q / p; if (p < 0) { if (t > t1) { ok = false; break; } if (t > t0) t0 = t; } else { if (t < t0) { ok = false; break; } if (t < t1) t1 = t; } } }
    if (ok && t0 < best) best = t0; } return best; }
function shaded(x, z) { /* 달빛을 가리는 그늘 안인가 */
  for (const s of SOLID) { const L = s[4] * SHADOW_K; for (let i = 0; i <= 6; i++) { const t = (i / 6) * L; if (inRect(x - SD[0] * t, z - SD[1] * t, s, 0.1)) return true; } }
  for (const [tx, tz, r] of TREES) { const cx = tx + SD[0] * 4 * SHADOW_K * 0.9, cz = tz + SD[1] * 4 * SHADOW_K * 0.9; if (dist(x, z, cx, cz) < r * 1.05 || dist(x, z, tx, tz) < r * 0.8) return true; }
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
  huh: () => tone(300, 420, 0.18, 'sawtooth', 0.07),
  rooster: () => { tone(700, 1100, 0.25, 'sawtooth', 0.12); tone(1100, 900, 0.2, 'sawtooth', 0.12, 0.25); tone(900, 1300, 0.5, 'sawtooth', 0.12, 0.45); },
  caught: () => { tone(220, 70, 0.7, 'sawtooth', 0.2); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  cloud: () => tone(180, 260, 0.6, 'sine', 0.08),
};

/* ───── 상태 ───── */
const S = { mode: 'title', night: 1, caught: 0, limp: 0, t: 0, dawn: 0, DAWN: 160, moonT: 0, moonOut: false, moonSoon: false, meter: 0, alert: false, stones: 3, rice: false,
  px: START[0], pz: START[1], pdir: 0, moving: false, running: false, hidden: false, inShade: true, slow: null, route: {}, stepT: 0, beatT: 0, sayT: 0, said: {}, win: null, climbT: 0, dogT: 0, boatmanA: 0, boatmanT: 0, fly: null, ground: [] };
let guards = [];
function mkGuard(def, kind = 'guard') {
  const g = { def, kind, x: def.path[0][0], z: def.path[0][1], dir: 0, wp: 1, state: 'patrol', path: null, pi: 0, tx: 0, tz: 0, wait: 0, lost: 0, repath: 0, see: 0, mesh: person(kind === 'guard' ? 0x34466e : 0x8d7a5c, def.hat), cone: null, light: null };
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(26 * 3), 3)); const idx = []; for (let i = 1; i < 25; i++) idx.push(0, i + 1, i); geo.setIndex(idx);
  g.cone = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: kind === 'guard' ? 0xffc65a : 0xd8e2ff, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide })); g.cone.frustumCulled = false; g.cone.renderOrder = 2; scene.add(g.cone);
  if (kind === 'guard') { g.light = new THREE.PointLight(0xffa640, 9, 9, 1.6); scene.add(g.light); const l = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd27a })); l.position.set(0.45, 1.0, 0.25); g.mesh.add(l); }
  return g;
}
function clearGuards() { for (const g of guards) { scene.remove(g.mesh, g.cone); if (g.light) scene.remove(g.light); } guards = []; }
let stoneMeshes = [];
function resetNight() {
  clearGuards();
  const defs = GUARDS0.concat(EXTRA.slice(0, Math.min(EXTRA.length, S.night - 1)));
  guards = defs.map((d) => mkGuard(d)); guards.push(mkGuard(VILLAGER, 'villager'));
  Object.assign(S, { t: 0, dawn: 0, moonT: 6, moonOut: false, moonSoon: false, meter: 0, alert: false, stones: 3, rice: false, px: START[0], pz: START[1], pdir: Math.PI, moving: false, hidden: false, route: {}, win: null, dogT: 0, fly: null, roosted: false });
  riceMesh.visible = true; boat.position.set(BOAT[0], 0, BOAT[1]); pMesh.visible = true;
  for (const m of stoneMeshes) scene.remove(m); stoneMeshes = [];
  S.ground = STONES0.map(([x, z]) => { const m = new THREE.Mesh(stoneGeo, stoneMat); m.position.set(x, 0.18, z); scene.add(m); stoneMeshes.push(m); return { x, z, m, on: true }; });
  hud();
}
function hud() { $('hStone').textContent = '🪨 ' + S.stones; $('hRice').className = S.rice ? '' : 'off'; const l = $('hLimp'); l.style.display = S.limp ? '' : 'none'; l.textContent = '🦵 절뚝' + (S.limp > 1 ? ' ×' + S.limp : ''); }
function say(text, key, sec = 2.6) { if (key) { if (S.said[key]) return; S.said[key] = 1; } const e = $('say'); e.textContent = text; e.style.opacity = 1; S.sayT = sec; }

/* ───── 입력 ───── */
const keys = {}; let stickX = 0, stickZ = 0, runHeld = false;
addEventListener('keydown', (e) => { keys[e.code] = true; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault(); });
addEventListener('keyup', (e) => { keys[e.code] = false; });
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (isTouch) { document.body.classList.add('touch'); $('keys').textContent = '왼쪽 동그라미로 걷기 · 「뛰기」는 소리가 남 · 땅을 누르면 돌 던지기'; }
{ const st = $('stick'), nub = st.firstElementChild; let id = null;
  const mv = (e) => { const r = st.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dz = e.clientY - (r.top + r.height / 2), l = Math.hypot(dx, dz), m = Math.min(l, 50); stickX = l > 8 ? (dx / l) * (m / 50) : 0; stickZ = l > 8 ? (dz / l) * (m / 50) : 0; nub.style.transform = `translate(${(dx / (l || 1)) * m}px,${(dz / (l || 1)) * m}px)`; };
  st.addEventListener('pointerdown', (e) => { id = e.pointerId; st.setPointerCapture(id); mv(e); e.stopPropagation(); });
  st.addEventListener('pointermove', (e) => { if (e.pointerId === id) mv(e); });
  const up = (e) => { if (e.pointerId === id) { id = null; stickX = stickZ = 0; nub.style.transform = ''; } }; st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
  const br = $('bRun'); br.addEventListener('pointerdown', (e) => { runHeld = true; e.stopPropagation(); }); const ru = () => { runHeld = false; }; br.addEventListener('pointerup', ru); br.addEventListener('pointercancel', ru); br.addEventListener('pointerleave', ru); }
const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), v2 = new THREE.Vector2(), v3 = new THREE.Vector3();
canvas.addEventListener('pointerdown', (e) => { if (S.mode !== 'play' || S.fly || S.stones < 1) return; v2.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(v2, cam); if (!ray.ray.intersectPlane(plane, v3)) return;
  let tx = v3.x, tz = v3.z; const d = dist(S.px, S.pz, tx, tz); if (d < 1.2) return; if (d > 15) { tx = S.px + ((tx - S.px) / d) * 15; tz = S.pz + ((tz - S.pz) / d) * 15; }
  S.stones--; hud(); S.fly = { x0: S.px, z0: S.pz, x1: clamp(tx, 1, W - 1), z1: clamp(tz, 6.5, H - 1), t: 0 }; flying.visible = true; });

/* ───── 순라꾼 ───── */
function makeNoise(x, z, r, strong) { ring(x, z, r, strong ? 0xff8a5a : 0xffffff); for (const g of guards) { if (g.kind !== 'guard' || g.state === 'chase') continue; if (dist(g.x, g.z, x, z) <= r) { g.state = 'look'; g.tx = x; g.tz = z; g.path = null; g.wait = 2.6; SFX.huh(); } } }
function alertAll() { if (S.alert) return; S.alert = true; SFX.whistle(); for (const g of guards) if (g.kind === 'guard' && dist(g.x, g.z, S.px, S.pz) < 30) { g.state = 'chase'; g.path = null; g.lost = 0; g.tx = S.px; g.tz = S.pz; } say('들켰다! 숨어!', null, 1.8); }
function stepGuard(g, dt) {
  const moonK = S.moonOut && !S.inShade;
  const range = (g.kind === 'guard' ? 10 : 6.5) * (moonK ? 1.6 : 1), half = (g.kind === 'guard' ? 0.56 : 0.5) * (moonK ? 1.25 : 1);
  /* 본다 */
  const d = dist(g.x, g.z, S.px, S.pz); let sees = false;
  if (d < range) { let a = Math.atan2(S.pz - g.z, S.px - g.x) - g.dir; a = Math.atan2(Math.sin(a), Math.cos(a)); if ((Math.abs(a) < half || d < 1.5) && los(g.x, g.z, S.px, S.pz) && !(S.hidden && d > 1.7)) sees = true; }
  g.see = sees ? 1 : 0;
  if (sees && S.mode === 'play') {
    if (g.kind === 'guard') { S.meter += dt / lerp(0.3, 1.15, clamp(d / range, 0, 1)); if (g.state !== 'chase' && S.meter > 0.35) { g.state = 'look'; g.tx = S.px; g.tz = S.pz; g.path = null; g.wait = 1.5; } }
    else { g.shout = (g.shout || 0) + dt; if (g.shout > 1.3) { g.shout = -4; say('"거기 누구요!"', null, 1.6); makeNoise(g.x, g.z, 16, true); } }
  } else if (g.kind !== 'guard' && g.shout > 0) g.shout = Math.max(0, g.shout - dt);
  /* 움직인다 */
  let sp = 1.7, tx, tz;
  if (g.state === 'chase') { sp = 3.75; if (sees) { g.tx = S.px; g.tz = S.pz; g.lost = 0; } else { g.lost += dt; if (g.lost > 4.5) { g.state = 'look'; g.wait = 3; g.path = null; } } tx = g.tx; tz = g.tz; if (d < 1.05 && S.mode === 'play' && !(S.hidden && !sees)) return caught('잡혔다.'); }
  else if (g.state === 'look') { sp = 2.5; tx = g.tx; tz = g.tz; if (dist(g.x, g.z, tx, tz) < 1.3) { g.wait -= dt; g.dir += dt * 1.6; if (g.wait <= 0) { g.state = 'patrol'; g.path = null; } drawCone(g, range, half); place(g, dt, false); return; } }
  else { const w = g.def.path[g.wp]; tx = w[0]; tz = w[1]; if (dist(g.x, g.z, tx, tz) < 0.7) { g.wp = (g.wp + 1) % g.def.path.length; g.path = null; } if (g.kind !== 'guard') sp = 1.2; }
  g.repath -= dt;
  if (!g.path || g.repath <= 0) { g.path = findPath(g.x, g.z, tx, tz); g.pi = 0; g.repath = g.state === 'chase' ? 0.35 : 1.5; }
  let nx = tx, nz = tz; if (g.path && g.path.length) { while (g.pi < g.path.length - 1 && dist(g.x, g.z, g.path[g.pi][0], g.path[g.pi][1]) < 0.6) g.pi++; nx = g.path[g.pi][0]; nz = g.path[g.pi][1]; if (g.pi >= g.path.length - 1 && los(g.x, g.z, tx, tz)) { nx = tx; nz = tz; } }
  const dx = nx - g.x, dz = nz - g.z, l = Math.hypot(dx, dz);
  if (l > 0.05) { g.x += (dx / l) * sp * dt; g.z += (dz / l) * sp * dt; let da = Math.atan2(dz, dx) - g.dir; da = Math.atan2(Math.sin(da), Math.cos(da)); g.dir += clamp(da, -dt * 5, dt * 5); }
  if (g.state === 'patrol') g.dir += Math.sin(S.t * 0.9 + g.x) * dt * 0.5;
  drawCone(g, range, half); place(g, dt, l > 0.05);
}
function place(g, dt, moving) { g.mesh.position.set(g.x, moving ? Math.abs(Math.sin(S.t * 9 + g.x)) * 0.07 : 0, g.z); g.mesh.rotation.y = -g.dir + Math.PI / 2; if (g.light) g.light.position.set(g.x + Math.cos(g.dir) * 0.6, 1.3, g.z + Math.sin(g.dir) * 0.6); }
function drawCone(g, range, half) { const p = g.cone.geometry.attributes.position; p.setXYZ(0, g.x, 0.07, g.z); for (let i = 0; i <= 24; i++) { const a = g.dir - half + (i / 24) * half * 2, cx = Math.cos(a), cz = Math.sin(a), l = rayLen(g.x, g.z, cx, cz, range); p.setXYZ(i + 1, g.x + cx * l, 0.07, g.z + cz * l); } p.needsUpdate = true;
  const m = g.cone.material; m.opacity = g.state === 'chase' ? 0.34 : g.see ? 0.38 : 0.2; m.color.set(g.state === 'chase' || g.see ? 0xff5a3c : g.state === 'look' ? 0xffe27a : g.kind === 'guard' ? 0xffc65a : 0xd8e2ff); }

/* ───── 잡힘 · 건넘 ───── */
function overlay(html, btn, fn) { const o = $('ov'); o.firstElementChild.innerHTML = html + `<button id="go">${btn}</button>`; o.style.display = 'flex'; $('go').onclick = () => { audio(); if (AC && AC.state === 'suspended') AC.resume(); o.style.display = 'none'; fn(); }; }
function caught(why, dawn) {
  if (S.mode !== 'play') return; S.mode = 'over'; SFX.caught(); S.caught++; S.night++; if (!dawn) S.limp++;
  const next = dawn ? '날이 밝아 버렸다. 행랑채로 돌아왔다.<br>어젯밤 발자국을 본 주인이 <b>순라꾼을 한 명 더</b> 세웠다.' : `끌려와 매를 맞았다. <b>다리를 절게 됐다</b> — 걸음이 느려진다.<br>주인은 <b>순라꾼을 한 명 더</b> 세웠다.`;
  setTimeout(() => overlay(`<h1>${why}</h1><p>${next}</p><p class="keys">${S.night}번째 밤 · 그래도 등불은 아직 저기 있다.</p>`, '다시 달아난다', () => { resetNight(); S.mode = 'play'; }), 700);
}
function won(how) {
  if (S.mode !== 'play') return; S.mode = 'cross'; S.win = how; SFX.win(); pMesh.visible = how === 'pay';
  setTimeout(() => {
    const r = S.route, way = r.stream ? '개울과 갈대밭을 따라' : r.market ? '장터를 지나' : r.wall ? '무너진 담을 넘어' : '어둠을 따라';
    const h = how === 'pay' ? '주먹밥을 삯으로 내고 배에 올랐다.' : '사공이 돌아선 틈에 배 밑에 숨어들었다.';
    overlay(`<h1>강을 건넜다</h1><p>${way} 나루에 닿았다. ${h}</p><p>${S.caught ? `${S.night}번째 밤 만에 · 절뚝이는 다리로.` : '첫 밤에, 한 번도 잡히지 않고.'}</p><p class="fact">📜 조선에는 정말로 달아난 노비가 많았다. 나라와 주인은 사람을 풀어 잡으러 다녔고(추노), 잡히면 큰 벌을 받았다. 그래도 사람들은 달아났다.</p>`, '다른 길로 한 번 더', () => { S.night = 1; S.caught = 0; S.limp = 0; resetNight(); S.mode = 'play'; });
  }, 3200);
}

/* ───── 한 걸음 ───── */
function collide(x, z) { for (const s of SOLID) { const cx = clamp(x, s[0], s[2]), cz = clamp(z, s[1], s[3]); let dx = x - cx, dz = z - cz; const d = Math.hypot(dx, dz), r = 0.42; if (d < r) { if (d < 1e-4) { const l = x - s[0], rr = s[2] - x, t = z - s[1], b = s[3] - z, m = Math.min(l, rr, t, b); if (m === l) x = s[0] - r; else if (m === rr) x = s[2] + r; else if (m === t) z = s[1] - r; else z = s[3] + r; } else { x = cx + (dx / d) * r; z = cz + (dz / d) * r; } } } return [clamp(x, 0.8, W - 0.8), clamp(z, 6.4, H - 0.8)]; }
function update(dt) {
  S.t += dt;
  if (S.sayT > 0) { S.sayT -= dt; if (S.sayT <= 0) $('say').style.opacity = 0; }
  for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += dt * 1.6; const k = Math.min(1, r.t); r.m.scale.setScalar(Math.max(0.01, k * r.r)); r.m.material.opacity = 0.7 * (1 - k); if (k >= 1) { scene.remove(r.m); rings.splice(i, 1); } }
  glow.material.opacity = 0.75 + Math.sin(S.t * 3) * 0.15;
  if (S.mode === 'cross') { boat.position.z -= dt * 1.5; boat.position.x += dt * 0.25; if (S.win === 'pay') pMesh.position.set(boat.position.x - 0.6, 0.45, boat.position.z); for (const g of guards) drawCone(g, 10, 0.56); return; }
  if (S.mode !== 'play') return;

  /* 새벽 · 달 */
  S.dawn += dt; const dk = clamp(S.dawn / S.DAWN, 0, 1); $('dawn').firstElementChild.style.width = dk * 100 + '%';
  if (dk > 0.86 && !S.roosted) { S.roosted = true; SFX.rooster(); say('닭이 운다. 곧 날이 샌다!', null, 2.6); }
  if (dk >= 1) return caught('날이 샜다.', true);
  S.moonT += dt; const cyc = S.moonT % 21, out = cyc > 13, soon = cyc > 10.4 && !out;
  if (soon && !S.moonSoon) { SFX.cloud(); say('구름이 걷힌다 — 그늘로!', 'moon1', 2.4); }
  S.moonSoon = soon; S.moonOut = out; const mEl = $('moon'); mEl.className = out ? 'out' : soon ? 'soon' : ''; mEl.textContent = out ? '🌕 달빛' : soon ? '🌥️ 곧 달' : '☁️ 구름';
  const mk = out ? clamp((cyc - 13) / 0.8, 0, 1) * clamp((21 - cyc) / 0.8, 0, 1) : soon ? (cyc - 10.4) / 2.6 * 0.18 : 0;
  moon.intensity = lerp(0.5, 2.6, mk) + dk * 0.3; hemi.intensity = 1.15 + mk * 0.25 + dk * dk * 1.2;
  const sky = new THREE.Color(0x0b1224).lerp(new THREE.Color(0x16203a), mk * 0.7).lerp(new THREE.Color(0x6f7fa0), dk * dk * 0.85); scene.background.copy(sky); scene.fog.color.copy(sky);

  /* 아이 */
  let ix = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0) + stickX, iz = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0) + stickZ;
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.slow = null;
  for (const s of SLOW) if (inRect(S.px, S.pz, s.r)) S.slow = s;
  S.running = S.moving && (keys.ShiftLeft || keys.ShiftRight || runHeld) && !S.slow;
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il);
    const sp = (S.running ? 4.7 : 3.0) * Math.pow(0.84, Math.min(S.limp, 3)) * (S.slow ? S.slow.k : 1);
    const [nx, nz] = collide(S.px + ix * sp * dt, S.pz + iz * sp * dt); S.px = nx; S.pz = nz; S.pdir = Math.atan2(iz, ix);
    S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; if (S.running) { SFX.step(); makeNoise(S.px, S.pz, 7.5); } else if (S.slow && S.slow.name === 'stream') noise(0.08, 0.05, 1500); else if (S.slow && S.slow.name === 'reed') { noise(0.09, 0.07, 2600); makeNoise(S.px, S.pz, 6.5); } } }
  if (S.slow) { S.route[S.slow.name === 'wallgap' ? 'wall' : S.slow.name === 'drain' || S.slow.name === 'stream' || S.slow.name === 'reed' ? 'stream' : 'x'] = 1; if (S.slow.name === 'wallgap') say('무너진 담 — 기어 넘는다', 'gap'); if (S.slow.name === 'drain') say('수챗구멍 — 개울로 이어진다', 'drain'); if (S.slow.name === 'reed') say('갈대밭 — 멈추면 안 보인다. 움직이면 바스락', 'reed', 3.2); }
  if (S.px > 43 && S.pz > 17 && S.pz < 40) S.route.market = 1;
  S.hidden = !!(S.slow && S.slow.hide && !S.moving); let near = false;
  for (let i = 0; i < HIDE.length; i++) { const [hx, hz, r] = HIDE[i], d = dist(S.px, S.pz, hx, hz); if (d < r + 0.75 && !S.running) { S.hidden = true; near = true; } hideMeshes[i].scale.setScalar(d < r + 0.75 ? 1.06 : 1); }
  if (near) say('숨었다 — 가만히 있으면 안 보인다', 'hide');
  S.inShade = shaded(S.px, S.pz) || S.hidden;
  const bob = S.moving ? Math.abs(Math.sin(S.t * (S.running ? 14 : 9))) * (S.limp ? 0.16 : 0.08) : 0;
  pMesh.position.set(S.px, bob - (S.hidden ? 0.45 : 0), S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; pMesh.rotation.z = S.limp && S.moving ? Math.sin(S.t * 9) * 0.12 : 0; pMesh.scale.y = S.hidden ? 0.72 : 1; pRing.position.set(S.px, 0.09, S.pz); pRing.material.opacity = S.hidden ? 0.18 : 0.55; pRing.material.color.set(S.moonOut && !S.inShade ? 0xff6a4a : S.hidden ? 0x7fe0a0 : 0xffffff);

  /* 줍기 */
  for (const g of S.ground) if (g.on && dist(S.px, S.pz, g.x, g.z) < 1) { g.on = false; g.m.visible = false; S.stones++; hud(); SFX.pick(); say('돌멩이 — 땅을 눌러 던지면 순라꾼이 그쪽으로 간다', 'stone', 3.2); }
  if (!S.rice && dist(S.px, S.pz, RICE[0], RICE[1]) < 1.1) { S.rice = true; riceMesh.visible = false; hud(); SFX.pick(); say('주먹밥 — 사공에게 삯으로 낼 수 있다', 'rice', 3); }
  riceMesh.position.y = 0.5 + Math.sin(S.t * 3) * 0.08;
  /* 돌 */
  if (S.fly) { const f = S.fly; f.t += dt / 0.55; const k = Math.min(1, f.t); flying.position.set(lerp(f.x0, f.x1, k), 0.8 + Math.sin(k * Math.PI) * 3, lerp(f.z0, f.z1, k)); if (k >= 1) { flying.visible = false; SFX.clack(); makeNoise(f.x1, f.z1, 10.5); S.fly = null; } }
  /* 개 */
  S.dogT -= dt; const dd = dist(S.px, S.pz, DOG[0], DOG[1]); dog.rotation.y = -Math.atan2(S.pz - DOG[1], S.px - DOG[0]);
  if (S.dogT <= 0 && (dd < 3.2 || (dd < 9 && S.running))) { S.dogT = 5; SFX.bark(); say('컹! 컹! — 개가 짖는다', null, 1.6); makeNoise(DOG[0], DOG[1], 17, true); } else if (dd < 8) say('개가 있다 — 뛰거나 가까이 가면 짖는다', 'dog', 3);
  dog.position.y = S.dogT > 4 ? Math.abs(Math.sin(S.t * 20)) * 0.15 : 0;

  /* 순라꾼 */
  const m0 = S.meter; for (const g of guards) { stepGuard(g, dt); if (S.mode !== 'play') return; }
  if (S.meter === m0) S.meter = Math.max(0, S.meter - dt * 0.45);
  if (S.meter >= 1) { S.meter = 1; alertAll(); }
  if (S.alert && !guards.some((g) => g.state === 'chase')) { S.alert = false; S.meter = 0.2; say('따돌렸다…', null, 1.6); }

  /* 사공 · 배 */
  S.boatmanT += dt; const look = (S.boatmanT % 9) < 5.2; S.boatmanA = lerp(S.boatmanA, look ? Math.PI * 0.5 : -Math.PI * 0.5, dt * 3); boatman.rotation.y = -S.boatmanA + Math.PI / 2;
  const db = dist(S.px, S.pz, FERRY[0], FERRY[1]);
  if (db < 2.2 && S.rice) return won('pay');
  if (db < 7) say(S.rice ? '사공이다 — 주먹밥을 내밀자' : '삯이 없다 — 사공이 등을 돌릴 때 배로', 'ferry', 3.4);
  if (dist(S.px, S.pz, BOAT[0] - 1.5, 7) < 1.5 || (S.px > 56.5 && S.px < 61 && S.pz < 7.3)) { if (!look) return won('hide'); if (!S.ferryShout || S.t - S.ferryShout > 4) { S.ferryShout = S.t; say('"웬 놈이냐!"', null, 1.6); makeNoise(FERRY[0], FERRY[1], 16, true); S.meter = Math.min(1, S.meter + 0.5); } }

  /* 조임: 심장 · 붉은 가장자리 · 들킴 막대 */
  let nearest = 99; for (const g of guards) if (g.kind === 'guard') nearest = Math.min(nearest, dist(g.x, g.z, S.px, S.pz));
  const tension = clamp(Math.max(S.meter, S.alert ? 1 : 0, 1 - nearest / 9, (S.moonOut && !S.inShade) ? 0.5 : 0), 0, 1);
  S.beatT -= dt; if (tension > 0.12 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.36, tension); SFX.beat(0.1 + tension * 0.35); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${S.moonOut && !S.inShade && S.meter < 0.3 ? '210,220,255' : '200,20,20'},${(S.alert ? 0.5 : S.meter * 0.55) + (S.moonOut && !S.inShade ? 0.16 : 0)})`;
}
function view() {
  const tall = cam.aspect < 1, hh = tall ? 58 : 41, back = tall ? 36 : 27;
  const tx = clamp(S.px, tall ? 10 : 27, W - (tall ? 10 : 27)), tz = clamp(S.pz - 5, 3, H - 13);
  cam.position.lerp(v3.set(tx, hh, tz + back), 0.08); cam.lookAt(cam.position.x, 0, cam.position.z - back);
  /* 등불이 화면 밖이면 가장자리에 빛으로 */
  const p = lamp.position.clone().project(cam), ge = $('goal'); if (S.mode === 'play' && (Math.abs(p.x) > 0.96 || Math.abs(p.y) > 0.92)) { const k = 0.9 / Math.max(Math.abs(p.x), Math.abs(p.y)); ge.style.display = 'block'; ge.style.left = ((p.x * k + 1) / 2) * innerWidth + 'px'; ge.style.top = ((1 - p.y * k) / 2) * innerHeight + 'px'; } else ge.style.display = 'none';
  const e = $('eye'); if (S.mode === 'play' && S.meter > 0.02) { const q = v3.set(S.px, 2.6, S.pz).project(cam); e.style.display = 'block'; e.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; e.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; e.firstElementChild.style.width = S.meter * 100 + '%'; } else e.style.display = 'none';
}
let last = performance.now();
function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); view(); renderer.render(scene, cam); requestAnimationFrame(loop); }

resetNight(); cam.position.set(27, 41, S.pz + 25);
$('go').onclick = () => { audio(); if (AC && AC.state === 'suspended') AC.resume(); $('ov').style.display = 'none'; S.mode = 'play'; say('순라꾼의 불빛을 피해 — 등불까지', null, 3); };
requestAnimationFrame(loop);
window.__night = { S, get guards() { return guards; }, update, shaded, findPath, los, keys, go() { $('go').click(); }, tp(x, z) { S.px = x; S.pz = z; }, stick(x, z, run) { stickX = x; stickZ = z; runHeld = !!run; }, walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz); stickX = (x - S.px) / l; stickZ = (z - S.pz) / l; runHeld = !!run; update(1 / 30); t += 1 / 30; } } stickX = stickZ = 0; runHeld = false; return { t: +t.toFixed(1), mode: S.mode, x: +S.px.toFixed(1), z: +S.pz.toFixed(1), meter: +S.meter.toFixed(2), alert: S.alert, dawn: +S.dawn.toFixed(0) }; }, step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); } };
