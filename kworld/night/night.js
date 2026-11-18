/* 케이월드 · 그믐밤 — 조선 노비의 도망 한 장면(샘플 v2.1, 2026-11-17).
   원칙: 목표는 하나(강 건너 나루의 등불)이고 늘 화면에 보인다 · 글 카드 없음 · 한 행동마다 바로 결과 · 잡히면 끝이 아니라 다음 밤이 달라진다.
   v2: 수학 놀이터 섬과 같은 그림 방식(면이 적고 또렷한 색) · 시점 둘(위에서/가까이) · 할 일 셋(문서·옷·주먹밥)과 역사(인정·파루·호패·추노).
   v2.1: 시점 넷(위에서·가까이·어깨 너머·지도) + 돌려 보기(Q/E) + 당겨 보기(휠). 받아 온 모델로 바꾼 v3(k-edu ce81149)은 준호 반려로 되돌림.
   좌표: x 동쪽(+), z 남쪽(+). 강은 북쪽(z 0~6). */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, canvasTex, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, losRects, rayLenRects, gridPath, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, groundAt, runLoop, loadArt, ART, art, artInst, artGeo, artMat, artGlowMat, scatter, missions } from '../scene/kit.js?v=4';
await loadArt('people', 'nature', 'build', 'props', 'night');   /* 블렌더로 만든 모델(사람·자연·집·소품 + 이 장면만의 것: tools/blender/make_night.py → night.glb) */

const W = 70, H = 46;

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
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0x16264c, 70, 190], exposure: 1.12 });
const hemi = new THREE.HemisphereLight(0x9db8ff, 0x34507a, 1.25); scene.add(hemi);
const moon = sunLight(scene, { color: 0xd6e4ff, intensity: 0.6, box: [46, 34], pos: [W / 2 - 22 * 1.6, 20 * 1.6, H / 2 - 16 * 1.6], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261116);

/* 그림 도우미 — 모델 여럿을 한 덩이로 굽는다(그리기 한 번). parts = [[이름, x, y, z, 크기 또는 [sx, sy, sz], 돌림y, 색], …]. own 이 참이면 제 재질(비쳐 보이게 할 묶음용 — 빛나는 조각까지 따로) */
const _o = new THREE.Object3D();
function joinGeo(list) { if (!list.length) return null; let nv = 0, ni = 0; for (const g of list) { nv += g.attributes.position.count; ni += g.index.count; }
  const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), C = new Float32Array(nv * 3), I = new Uint32Array(ni); let v = 0, i = 0;
  for (const g of list) { P.set(g.attributes.position.array, v * 3); N.set(g.attributes.normal.array, v * 3); C.set(g.attributes.color.array, v * 3); const ix = g.index.array; for (let k = 0; k < ix.length; k++) I[i + k] = ix[k] + v; v += g.attributes.position.count; i += ix.length; g.dispose(); }
  const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.BufferAttribute(P, 3)); o.setAttribute('normal', new THREE.BufferAttribute(N, 3)); o.setAttribute('color', new THREE.BufferAttribute(C, 3)); o.setIndex(new THREE.BufferAttribute(I, 1)); return o; }
function bake(parts, own = false, shadow = true) { const gs = [[], []];
  for (const [name, x, y, z, s = 1, ry = 0, tints = {}] of parts) { _o.position.set(x, y, z); _o.rotation.set(0, ry, 0); if (Array.isArray(s)) _o.scale.set(s[0], s[1], s[2]); else _o.scale.setScalar(s); _o.updateMatrix();
    for (const k of [0, 1]) { const g = artGeo(name, tints, !!k); if (g) gs[k].push(g.clone().applyMatrix4(_o.matrix)); } }
  const grp = new THREE.Group(), m = new THREE.Mesh(joinGeo(gs[0]) || new THREE.BufferGeometry(), own ? artMat.clone() : artMat); m.castShadow = shadow; m.receiveShadow = true; grp.add(m);
  const gl = joinGeo(gs[1]); if (gl) grp.add(new THREE.Mesh(gl, own ? artGlowMat.clone() : artGlowMat)); return grp; }
/* 뿌리기(kit scatter) + 밤빛에 묻히는 것(솔잎 · 풀)은 제 재질로 조금 밝힌다 */
const litMat = (r, g, b) => { const m = artMat.clone(); m.color.setRGB(r, g, b); return m; }, pineM = litMat(2.1, 2.25, 2.1), grassM = litMat(1.45, 1.5, 1.3);
function strew(o) { const n0 = scene.children.length, put = scatter(scene, rnd, o); for (const m of scene.children.slice(n0)) { const nm = o.names.find((n) => artGeo(n, o.tints || {}) === m.geometry) || ''; if (nm.startsWith('pine')) m.material = pineM; else if (nm.startsWith('grass') || nm.startsWith('flower')) m.material = grassM; } return put; }

/* 하늘: 밤빛 둥근 지붕 · 별 · 달과 구름(가까이 시점에서 보인다) */
const { skyMat } = skyDome(scene, rnd, { top: 0x0a1230, low: 0x2b4a86, stars: 420 });
const moonDisc = at(new THREE.Mesh(new THREE.SphereGeometry(9, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false })), W / 2 - 60, 96, -200); scene.add(moonDisc);
const moonCloud = new THREE.Group(); { const cm = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }); for (const [x, y, z, s, r] of [[-5, -4, 0, 7.4, 0], [17, 0, 3, 5, Math.PI], [-23, 1, 2, 4.2, 0.2]]) { const c = new THREE.Mesh(artGeo('cloud'), cm); c.position.set(x, y, z); c.scale.setScalar(s); c.rotation.y = r; moonCloud.add(c); } } moonCloud.position.set(W / 2 - 60, 94, -192); scene.add(moonCloud);

/* 땅 — 물가(z 6)까지. 나루 동쪽은 배가 뜨는 작은 물굽이(z 7.25 까지 물) */
const flat = flatMaker(scene);
flat(-40, 6, 56.9, H + 30, 0x58b85c, 0); flat(56.9, 7.25, 63.2, H + 30, 0x58b85c, 0); flat(63.2, 6, W + 40, H + 30, 0x58b85c, 0);
flat(4, 22, 30, 44, 0xe2c692, 0.03);                 /* 마당 */
flat(30, 31.2, 44, 34.8, 0xd9bd88, 0.03); flat(42, 16, 68, 40, 0xdcc18e, 0.03);
flat(52, 9, 56.5, 17, 0xd9bd88, 0.04); flat(34, 11, 62, 16, 0xd4b783, 0.035);
flat(0.5, 9, 3.4, 45, 0x3d8fd0, 0.05);                /* 개울 */
flat(0, 6.1, 52, 9.3, 0x6a9a4a, 0.04);                /* 갈대밭 바닥 */
/* 흙바닥·물(풀을 심지 않는 곳) */
const DIRT = [[4, 22, 30, 44], [30, 31.2, 44, 34.8], [42, 16, 68, 40], [52, 9, 56.5, 17], [34, 11, 62, 16], [0, 6.1, 52, 9.3], [-0.2, 9, 3.7, 45]];
const onDirt = (x, z, pad = 0.3) => DIRT.some((r) => inRect(x, z, r, pad));
/* 강: 물결(땅보다 조금 낮다) */
const riverG = new THREE.PlaneGeometry(W + 120, 66, 50, 15); riverG.rotateX(-Math.PI / 2);
const river = new THREE.Mesh(riverG, new THREE.MeshStandardMaterial({ color: 0x2f7fd0, roughness: 0.25, metalness: 0.15, flatShading: true })); river.position.set(W / 2, -0.2, -22); river.receiveShadow = true; scene.add(river);
const riverBase = riverG.attributes.position.array.slice();
flat(-40, -70, W + 40, -52, 0x3f8f4c, 0.3);           /* 강 건너 */
/* 강 건너 마을: 불 켜진 초가 아홉 채 · 뒤로 솔숲 · 물가 갈대 */
{ const hs = []; for (let i = 0; i < 9; i++) hs.push([14 + i * 7 + (i % 2) * 2, 0.3, -56 - (i % 3) * 3, 1, ((i % 3) - 1) * 0.22]);
  artInst(scene, 'choga_b_lit', hs, { wall: 0xe2d2b0 }, { shadow: false });
  strew({ area: [-34, -69, W + 34, -53.2], n: 50, names: ['pine_a', 'pine_b', 'pine_k', 'tree_a', 'pine_a', 'tree_b'], avoid: (x, z) => hs.some((h) => Math.abs(h[0] - x) < 4.6 && z > h[2] - 3 && z < h[2] + 6), scale: [0.9, 1.5], y: 0.3, shadow: false });
  strew({ area: [-20, -52.4, W + 20, -51.4], n: 24, names: ['reed_n'], scale: [1.1, 1.6], y: -0.15, shadow: false }); }

/* 집·담 — 가까이 시점에서 아이를 가리면 비쳐 보이게 하려고 묶음으로 둔다(묶음마다 제 재질 하나, 그리기 한 번) */
const { occl, group } = occluders(scene);
const WALLC = { wall: 0xcdbb98 }, POSTS = [[4.35, 22.35], [29.65, 22.35], [4.35, 43.65], [29.65, 43.65]];
/* 초가(night.glb 의 choga — build 의 thatch 와 같은 치수): 번호(SOLID 차례) → [모델, 앞이 보는 쪽(0 남 · π 북), 벽 색, 툇마루 위 소품 [이름, 옆자리, 크기, 돌림, 색]] — 뒷벽을 네모 뒤쪽에 맞추고 툇마루가 네모 앞쪽을 채운다 */
const HOUSES = { 8: ['choga_a', Math.PI, 0xd9c6a2, [['basket', 2.0, 0.6], ['sack', -1.1, 0.8, 0.3]]], 9: ['choga_a', Math.PI, 0xcfbb96, [['jar_b', 2.1, 0.75], ['jar_b', 1.55, 0.6], ['basket', -1.0, 0.55]]],
  10: ['choga_b', 0, 0xd9c6a2, [['basket', 1.2, 0.6]]], 11: ['choga_b_lit', 0, 0xe2d2b0, [['bundle', 1.3, 0.6, 0, { cloth: 0x9a7a5a }]]], 12: ['choga_b', 0, 0xcfbb96, [['sack', 0.9, 0.8, 0.2], ['jar_b', 1.55, 0.6]]],
  13: ['choga_b_lit', 0, 0xd9c6a2, [['soban', 1.1, 0.75]]], 14: ['choga_b', 0, 0xe2d2b0, [['basket', 0.5, 0.55], ['bundle', 1.4, 0.55, 1, { cloth: 0x7a8aa0 }]]], 15: ['choga_b', 0, 0xd9c6a2, [['sack', 1.2, 0.8, -0.3]]] };
function thatchHouse(s, i) { const [x0, z0, x1, z1, h] = s, [name, rot, wc, props] = HOUSES[i], a = name === 'choga_a', bw = a ? 6.4 : 4.4, bd = a ? 3.6 : 3.2, f = Math.cos(rot);
  const sx = (x1 - x0) / bw, sz = (z1 - z0 + 0.25) / (bd + 0.82), sy = h > 2.7 ? 1 : 0.94, cx = (x0 + x1) / 2, oz = f > 0 ? z0 + (sz * bd) / 2 : z1 - (sz * bd) / 2;
  const P = [[name, cx, 0, oz, [sx, sy, sz], rot, { wall: wc }]];
  for (const [pn, lx, ps, pr = 0, pt = {}] of props) P.push([pn, cx + f * lx * sx, 0.55 * sy, oz + f * (bd / 2 + 0.42) * sz, ps, pr, pt]);
  group([x0, z0, x1, z1], [bake(P, true)]); }
/* 안채: 다섯 칸 기와집(night.glb) — 벽 몸통이 막는 네모에 꼭 맞는다. 툇마루 위에 소반·보따리 */
function tileHouse([x0, z0, x1, z1]) { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  group([x0, z0, x1, z1], [bake([['anchae', cx, 0, cz, [(x1 - x0) / 11, 1, (z1 - z0) / 5], 0], ['soban', cx - 4.6, 0.77, z1 - 0.48, 0.8, 0.3], ['bundle', cx + 4.9, 0.77, z1 - 0.5, 0.62, 0.8, { cloth: 0x8a6a8a }]], true)]); }
function wall(s) { const [x0, z0, x1, z1] = s, w = x1 - x0, d = z1 - z0, L = Math.max(w, d), n = Math.max(1, Math.round(L / 4)), P = [];
  for (let i = 0; i < n; i++) P.push(['wall_n', w > d ? x0 + ((i + 0.5) * w) / n : (x0 + x1) / 2, 0, w > d ? (z0 + z1) / 2 : z0 + ((i + 0.5) * d) / n, [L / n / 4, 1.05, 1.25], w > d ? 0 : Math.PI / 2, WALLC]);
  for (const p of POSTS) if (!p[2] && inRect(p[0], p[1], s)) { p[2] = 1; P.push(['wall_post', p[0], 0, p[1], 1, 0, WALLC]); }
  group([x0, z0, x1, z1], [bake(P, true)]); }
SOLID.forEach((s, i) => (s[5] === 'wall' ? wall : s[5] === 'tile' ? tileHouse : thatchHouse)(s, i));
/* 무너진 담 · 수챗구멍 · 대문(열린 솟을대문 — 지붕이 아이를 가리면 비쳐 보이게) */
scene.add(bake([['wall_broken', 15, 0, 22.35, [1, 1.05, 1.25], 0, WALLC], ['drain', 4.35, 0, 34, [1, 1.05, 1.25], Math.PI / 2, WALLC]]));
group([29.3, 31.6, 30, 37.4], [bake([['gate_open', 29.65, 0, 33, 1, Math.PI / 2]], true)]);   /* 묶음 네모를 남쪽으로 조금 밀어 둔다 — 문 지붕 바로 밑을 지날 때도 비쳐 보이게 */

/* 숨을 곳: 볏가리 · 장독 */
const hideMeshes = [];
HIDE.forEach(([x, z, r, kind], i) => { const g = new THREE.Group(); g.position.set(x, 0, z); const m = art(kind === 'hay' ? 'straw_stack' : 'jar_hide');
  if (kind === 'hay') m.scale.set(r * 0.93, 1.02 + (i % 3) * 0.05, r * 0.93); else m.scale.setScalar(r / 1.5); m.rotation.y = i * 1.9; g.add(m); scene.add(g); hideMeshes.push(g); });
/* 나무: 잎 넓이를 그늘 넓이(r)에 맞추고, 잎 아랫단은 머리 위(2.2쯤)로 — 나무 밑에 선 아이가 잎에 묻히지 않게 */
TREES.forEach(([x, z, r], i) => { const big = r >= 2.4, k = r / 2.4;
  group([x - 1.6, z - 0.4, x + 1.6, z + 0.4], [bake([[big ? 'tree_big' : 'tree_a', x, 0, z, big ? [0.74 * k, 0.78, 0.74 * k] : [1.6 * k, 1.45, 1.6 * k], i * 1.3, { leaf: [0x4f8f45, 0x457f4a, 0x5a8f3f][i % 3] }]], true)]); });
/* 갈대: 갈대밭(숨는 곳)과 그 앞 물가 */
strew({ area: [0.5, 6.2, 52, 9.2], n: 175, names: ['reed_n'], scale: [0.72, 1.08], shadow: false });
strew({ area: [-14, 4.8, 53.2, 6.15], n: 60, names: ['reed_n'], scale: [0.8, 1.2], y: (x, z) => (z < 6 ? -0.24 : 0), shadow: false });
/* 나루 · 배 · 등불 */
scene.add(bake([['dock', 55.2, 0, 7.4, 1, 0], ['lamp_pole', LAMP[0], 0, LAMP[1], 1, 0], ['sotdae', 52.6, -0.15, 5.45, 1, 0.6], ['sack', 54.25, 0.4, 5.9, 0.9, 0.5], ['barrel', 54.15, 0.4, 6.75, 0.8, 0]]));
const boat = new THREE.Group(); boat.add(art('ferry')); boat.position.set(BOAT[0], 0, BOAT[1]); scene.add(boat);
const lamp = new THREE.Group(); { const c = bake([['chorong', 0, 0, 0]], true, false); for (const m of c.children) { m.material.transparent = true; m.renderOrder = 5; } lamp.add(c); } lamp.position.set(LAMP[0] + 0.9, 2.5, LAMP[1]); scene.add(lamp);   /* 청사초롱 — 빛무리(glow) 위에 그려 붉고 푸른 빛이 살아 있게 */
const lampL = new THREE.PointLight(0xffb347, 34, 24, 1.6); lampL.position.copy(lamp.position); scene.add(lampL);
const glow = glowSprite(scene); glow.position.copy(lamp.position);

/* 땅 꾸밈(그림만 — 막지 않는다): 풀·들꽃 · 담 밑 풀 · 마당 디딤돌 · 물가 돌 · 판 밖 숲 */
{ const inSolid = (x, z, pad) => SOLID.some((s) => inRect(x, z, s, pad)), nearHide = (x, z) => HIDE.some(([hx, hz, r]) => dist(x, z, hx, hz) < r + 0.3);
  strew({ area: [-10, 9.5, W + 10, H + 8], n: 280, names: ['grass_a', 'grass_b', 'grass_b', 'grass_a', 'grass_b', 'grass_a', 'flower_w'], avoid: (x, z) => onDirt(x, z) || inSolid(x, z, 0.7), scale: [0.8, 1.5], shadow: false });
  strew({ area: [4, 16, 68, 44], n: 70, names: ['grass_a', 'grass_b'], avoid: (x, z) => !(onDirt(x, z, 0) && inSolid(x, z, 0.75) && !inSolid(x, z, 0.2)) || nearHide(x, z) || (x > 28 && x < 31.5 && z > 30 && z < 36), scale: [0.7, 1.1], shadow: false });
  artInst(scene, 'rock_flat', [[28.2, 0.03, 33.1, 0.5, 0.2], [26.9, 0.03, 32.9, 0.42, 1.4], [25.7, 0.03, 33.5, 0.46, 2.9], [24.4, 0.03, 33.3, 0.4, 0.7], [23.1, 0.03, 33.6, 0.48, 2.1], [21.8, 0.03, 33.2, 0.42, 3.6], [20.5, 0.03, 33.4, 0.46, 1.1], [19.2, 0.03, 32.9, 0.4, 4.4], [17.9, 0.03, 32.6, 0.46, 0.4], [16.7, 0.03, 32.2, 0.42, 2.5], [15.5, 0.03, 31.9, 0.44, 5.2]].map(([x, y, z, s, r]) => [x, 0.005, z, [s, 0.12, s], r]));
  /* 개울가 · 강가 돌(못 가는 곳과 가장자리에만) */
  strew({ area: [-1.6, 9.5, 0.45, 45], n: 22, names: ['rock_a', 'rock_flat', 'rock_a'], scale: [0.5, 1.0], minGap: 0.8 }); strew({ area: [3.45, 9.6, 3.85, 21.6], n: 7, names: ['rock_a', 'rock_flat'], scale: [0.35, 0.6], minGap: 0.9 });
  strew({ area: [63.6, 5.2, W + 16, 6.25], n: 16, names: ['rock_a', 'rock_b', 'rock_flat'], scale: [0.5, 1.0], y: -0.12, minGap: 0.9 });
  strew({ area: [-16, 5.0, 0.3, 6.3], n: 9, names: ['rock_a', 'rock_flat'], scale: [0.5, 1.0], y: -0.12, minGap: 0.9 });
  artInst(scene, 'rock_a', [[57.1, -0.12, 7.2, 0.6, 1], [63.1, -0.1, 7.1, 0.8, 2.2], [62.8, -0.14, 6.3, 0.55, 4], [63.5, -0.05, 6.5, 1.0, 0.4]]);
  /* 판 밖: 가까운 띠는 덤불·돌·풀, 그 뒤로 숲(키 큰 나무는 아이를 가리지 않게 멀찍이) */
  const out = (x, z) => x < -1.8 || x > W + 0.6 || z > H + 0.4;
  strew({ area: [-9, 9.5, W + 8, H + 7.5], n: 46, names: ['bush', 'bush', 'rock_a', 'stump', 'rock_b'], avoid: (x, z) => !out(x, z), scale: [0.7, 1.3], minGap: 1.4, tints: { leaf: 0x457f4a } });
  const far = (x, z) => x < -8.5 || x > W + 7.5 || z > H + 7.5;
  strew({ area: [-36, 7, W + 34, H + 26], n: 84, names: ['pine_k', 'pine_a', 'tree_a', 'pine_b', 'tree_big', 'tree_b', 'pine_a', 'pine_k'], avoid: (x, z) => !far(x, z), scale: [0.9, 1.35], minGap: 2.6, shadow: false });
  /* 마을 어귀 장승 한 쌍 · 판 밖 수레와 짐 */
  scene.add(bake([['jangseung', 41.5, 0, 30.5, 1, Math.PI / 2], ['jangseung', 41.5, 0, 35.5, 0.92, Math.PI / 2], ['cart', 72.6, 0, 29.5, 1, 0.5], ['sack_pile', 71.6, 0, 26.8, 1, 1.2], ['firewood', 71.4, 0, 20.5, 1.1, 0.3], ['log', 72.2, 0, 22.4, 1, 0.9], ['jige', 71.2, 0, 33.2, 1, -0.8]])); }

/* 사람 — 블렌더로 만든 사람(people.glb) */
const { person, walkAnim } = people(scene);
const pMesh = person({ shirt: 0xf6f1e4, pants: 0x9a8a72, hat: 'top' });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const dog = new THREE.Group(); { const d = art('dog'); d.rotation.y = Math.PI / 2; d.scale.setScalar(1.05); dog.add(d); } dog.position.set(DOG[0], 0, DOG[1]); scene.add(dog);   /* 모델 머리는 +z — 묶음의 +x 를 보게 돌려 둔다 */
const boatman = person({ shirt: 0x8fa3b8, pants: 0x6a7686, hat: 'satgat' }); boatman.position.set(FERRY[0], 0.4, FERRY[1]);
/* 할 일의 물건: 주먹밥 · 문서 궤 · 빨랫줄 */
const riceMesh = new THREE.Group(); { const r = art('riceball'); r.scale.setScalar(1.15); r.position.y = -0.04; riceMesh.add(r); } riceMesh.position.set(RICE[0], 0.5, RICE[1]); scene.add(riceMesh);
const docMesh = new THREE.Group(); docMesh.add(art('chest'), at(art('mat_straw', {}, { shadow: false }), 0, 0.035, 0.1), new THREE.Group(), art('doc_scroll')); docMesh.position.set(DOC[0], 0, DOC[1]); scene.add(docMesh);   /* children[3] = 문서(태우면 사라진다) */
const fire = new THREE.Group(); for (let k = 0; k < 3; k++) fire.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.22 - k * 0.05, 0.5 + k * 0.1, 5), new THREE.MeshBasicMaterial({ color: [0xff5a2a, 0xffa23a, 0xffe07a][k] })), (k - 1) * 0.16, 1.05 + k * 0.05, 0)); fire.position.set(DOC[0], 0, DOC[1]); fire.visible = false; scene.add(fire);
const fireL = new THREE.PointLight(0xff8a3a, 0, 14, 1.6); fireL.position.set(DOC[0], 1.4, DOC[1]); scene.add(fireL);
const clothMesh = new THREE.Group(); clothMesh.add(art('clothesline'), art('cloth_sheet'), new THREE.Group(), art('cloth_jeogori', { cloth: 0x7fc8c0 })); clothMesh.position.set(CLOTH[0], 0, CLOTH[1]); scene.add(clothMesh);   /* children[3] = 상민 옷(입으면 사라진다) */
const stoneGeo = artGeo('rock_a').clone().scale(0.44, 0.52, 0.44).translate(0, -0.18, 0), stoneMat = artMat.clone(); stoneMat.color.setRGB(2.3, 2.4, 2.6); stoneMat.emissive.set(0x39404e);
const flying = new THREE.Mesh(stoneGeo, stoneMat); flying.visible = false; scene.add(flying);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* ───── 길찾기 · 시야 ───── */
const grid = new Uint8Array(W * H);
for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { const cx = x + 0.5, cz = z + 0.5; let b = cz < 6.6 || cx < 3.6;
  for (const s of SOLID) if (inRect(cx, cz, s, 0.55)) b = true;
  if (inRect(cx, cz, [14, 21.6, 16, 23.1]) || inRect(cx, cz, [3.6, 33, 5.1, 35])) b = true;
  grid[z * W + x] = b ? 1 : 0; }
const findPath = gridPath(grid, W, H);
const los = (ax, az, bx, bz) => losRects(SOLID, ax, az, bx, bz);
const rayLen = (ax, az, dx, dz, max) => rayLenRects(SOLID, ax, az, dx, dz, max);
function shaded(x, z) {
  for (const s of SOLID) { const L = s[4] * SHADOW_K; for (let i = 0; i <= 6; i++) { const t = (i / 6) * L; if (inRect(x - SD[0] * t, z - SD[1] * t, s, 0.1)) return true; } }
  for (const [tx, tz, r] of TREES) { if (dist(x, z, tx + SD[0] * 3.2, tz + SD[1] * 3.2) < r * 1.05 || dist(x, z, tx, tz) < r * 0.8) return true; }
  for (const [hx, hz, r] of HIDE) if (dist(x, z, hx + SD[0] * 1.2, hz + SD[1] * 1.2) < r) return true;
  return false;
}

/* ───── 소리 ───── */
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
const { say, tick: sayTick } = sayLine(S);

/* ───── 입력 ───── */
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) { $('keys').textContent = '왼쪽 동그라미로 걷기 · 「뛰기」는 소리가 남 · 땅을 누르면 돌 던지기 · 「시점」으로 보는 자리 바꾸기, ⟲⟳ 로 돌려 보기'; }
const v3 = new THREE.Vector3(), v3b = new THREE.Vector3();
canvas.addEventListener('pointerdown', (e) => { if (S.mode === 'intro') { S.introT = 99; return; } if (S.mode !== 'play' || S.fly || S.stones < 1) return; const hit = groundAt(cam, e.clientX, e.clientY); if (!hit) return;
  let [tx, tz] = hit; const d = dist(S.px, S.pz, tx, tz); if (d < 1.2) return; if (d > 15) { tx = S.px + ((tx - S.px) / d) * 15; tz = S.pz + ((tz - S.pz) / d) * 15; }
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
      n === 4 ? '한 번 더' : '흔적 없이 한 번 더', () => { S.night = 1; S.caught = 0; S.limp = 0; resetNight(); misClear(); S.mode = 'play'; });
  }, 3600);
}

/* ───── 한 걸음 ───── */
function collide(x, z) { [x, z] = collideRects(SOLID, x, z); return [clamp(x, 0.8, W - 0.8), clamp(z, 6.4, H - 0.8)]; }
const skyA = new THREE.Color(), skyB = new THREE.Color(0x16264c), skyC = new THREE.Color(0x2f4a86), skyD = new THREE.Color(0xf0b890);
function update(dt) {
  S.t += dt;
  sayTick(dt); ringsUpdate(dt);
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
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.slow = null;
  for (const s of SLOW) if (inRect(S.px, S.pz, s.r)) S.slow = s;
  S.running = S.moving && ctl.running() && !S.slow;
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
function view() {
  const tall = cam.aspect < 1;
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k); v3.set(lerp(LAMP[0] - 6, START[0] + 10, e), lerp(9, 30, e), lerp(LAMP[1] + 16, START[1] + 22, e)); cam.position.copy(v3); v3b.set(lerp(LAMP[0], START[0] + 8, e), lerp(2, 0, e), lerp(LAMP[1], START[1] - 4, e)); cam.lookAt(v3b); cam.fov = 44; cam.updateProjectionMatrix(); }
  else if (S.mode === 'cross') { v3.set(boat.position.x - 9, 3.2, boat.position.z + 9); cam.position.lerp(v3, 0.04); cam.lookAt(boat.position.x + 3, 1.6, boat.position.z - 6); }
  else followCam(cam, S, { W, H });
  /* 가까이 시점: 아이를 가리는 집·나무는 비쳐 보이게 · 목표가 화면 밖이면 가장자리에 빛 */
  fadeOccluders(occl, cam, S, S.mode === 'play');
  edgeGoal($('goal'), cam, lamp.position, S.mode === 'play');
  overBar($('eye'), cam, S.px, 2.7, S.pz, S.mode === 'play' && S.meter > 0.02 ? S.meter : null);
}

/* ───── 미션(11-18 준호 「어떻게 뭘 하는지 · 미션이 있으면」): 지금 할 일 하나 — 무엇을·어떻게·어디서.
   숨기 놀이라 빛기둥은 첫 볏가리(숨기 배우기) 하나만, 그것도 가까이 있을 때만 · 밤빛을 덮지 않게 빛기둥을 흐리게.
   흔적 할 일(문서·옷·주먹밥)은 미션에 넣지 않는다 — 고르는 재미로 남긴다. 미션은 S 를 읽기만 하고, 「한 번이라도 했다」는 아래 작은 변수로 지켜본다(misWatch 는 돌림 고리에서만) ───── */
const HAY0 = [HIDE[0][0], HIDE[0][1]], YARD = [4, 22, 30, 44];
const EXITS = [[15, 22.35, '🧱 무너진 담 — 기어 넘는다'], [4.35, 34, '🕳 수챗구멍 — 개울로 이어진다'], [29.65, 33, '🚪 대문 — 장터 쪽으로']];
let mis = null, misWalk = false, misHid = false, misMoonT = 0, misThrew = false, misOut = false;
mis = missions(scene, cam, [
  { t: '살금살금 걸어 보기', how: (tc) => `${tc ? '왼쪽 동그라미' : '<kbd>방향키</kbd>'}로 걷기 · ${tc ? '「뛰기」는' : '<kbd>Shift</kbd> 뛰기는'} 소리가 난다`, done: () => misWalk },
  { t: '볏가리 곁에 숨기', how: '볏가리·장독 곁에 걸어가 서면 숨는다 — 발밑 고리가 초록이면 숨은 것', done: () => misHid,
    at: () => (dist(S.px, S.pz, HAY0[0], HAY0[1]) < 14 ? HAY0 : null), tag: '🌾 곁에 서면 숨는다', tagY: 2.6 },
  { t: '달빛 동안 그늘에 있기', how: '오른쪽 위가 🌕 달빛이면 밝은 데서는 멀리서도 보인다 — 그늘·숨을 곳에서 기다리기(발밑 고리가 빨가면 밝은 곳)', n: () => [Math.min(3, Math.floor(misMoonT)), 3], done: () => misMoonT >= 3 },
  { t: '돌을 던져 순라꾼 꾀기', how: (tc) => `${tc ? '땅을 톡 누르면' : '땅을 <kbd>클릭</kbd>하면'} 그쪽으로 돌을 던진다 — 순라꾼은 소리 난 곳으로 간다 · 떨어진 돌은 밟으면 줍는다`, done: () => misThrew },
  { t: '담 밖으로 빠져나가기', how: '대문 · 무너진 담 · 수챗구멍 가운데 하나로 — 순라꾼의 노란 불빛 부채꼴에 들지 않게', done: () => misOut },
  { t: '강 건너 나루의 등불까지', how: '주먹밥(🍙)이 있으면 사공 곁에 서서 삯을 내고, 없으면 사공이 등을 돌릴 때 배로 숨어든다', done: () => S.mode === 'cross' || !!S.win },
], { allText: '🎉 강을 건넌다!' });
{ const b = scene.children[scene.children.length - 2]; if (b && b.material && b.material.blending === THREE.AdditiveBlending) b.material.color.setScalar(0.6); }   /* 빛기둥(더하기 섞기)을 밤에 맞게 흐리게 */
function misWatch(dt) { if (S.mode !== 'play') return;
  if (dist(S.px, S.pz, START[0], START[1]) > 3) misWalk = true;
  if (S.hidden) misHid = true;
  if (mis.idx >= 2 && S.moonOut && S.inShade) misMoonT += dt;   /* 달 미션에 온 뒤부터만 센다 — 저절로 지나가지 않게 */
  if (S.fly) misThrew = true;
  if (!inRect(S.px, S.pz, YARD)) misOut = true; }
function misClear() { mis.reset(); misWalk = misHid = misThrew = misOut = false; misMoonT = 0; }
/* 자리 꼬리표(처음 하는 일이 무엇인지 그 자리에 — 보이기만 한다) */
const tagEls = {}, tv = new THREE.Vector3();
function showTag(k, html, on, x, y, z) { let e = tagEls[k]; if (!e) { e = tagEls[k] = document.createElement('div'); e.className = 'tag'; document.body.appendChild(e); }
  if (!on) { e.style.display = 'none'; return; } const q = tv.set(x, y, z).project(cam); if (q.z > 1 || Math.abs(q.x) > 1 || Math.abs(q.y) > 1) { e.style.display = 'none'; return; }
  if (e.innerHTML !== html) e.innerHTML = html; e.style.display = 'block'; const hw = e.offsetWidth / 2 + 6; e.style.left = clamp(((q.x + 1) / 2) * innerWidth, hw, innerWidth - hw) + 'px'; e.style.top = clamp(((1 - q.y) / 2) * innerHeight, 120, innerHeight - 30) + 'px'; }
function hints() { const play = S.mode === 'play' && S.view !== 3, i = mis.idx;
  let st = null, bd = 5; if (play && i >= 3 && S.ground.every((g) => g.on)) for (const g of S.ground) { const d = dist(S.px, S.pz, g.x, g.z); if (d < bd) { bd = d; st = g; } }
  showTag('stone', '🪨 밟으면 줍는다', !!st, st ? st.x : 0, 0.9, st ? st.z : 0);
  EXITS.forEach(([x, z, h], k) => showTag('exit' + k, h, play && i === 4 && inRect(S.px, S.pz, YARD) && dist(S.px, S.pz, x, z) < 15, x, 2.4, z));
  showTag('ferry', S.rice ? '🍙 사공 곁에 서면 삯을 낸다' : '⛵ 사공이 등 돌릴 때 배로', play && i === 5 && dist(S.px, S.pz, FERRY[0], FERRY[1]) < 16, S.rice ? FERRY[0] : 59.2, 2.4, S.rice ? FERRY[1] : 6.8); }

resetNight(); for (const g of guards) { drawCone(g.cone, g.x, g.z, g.dir, 10, 0.56, g); place(g, false); }
pMesh.position.set(S.px, 0, S.pz); pRing.position.set(S.px, 0.11, S.pz); skyMat.color.setScalar(1);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.bell(3); say('댕— 댕— 인정 종이 울렸다. 이제 밤길은 막혔다', null, 3.6); };
runLoop((dt) => { update(dt); misWatch(dt); mis.update(dt, S.mode === 'play' || (S.mode === 'cross' && S.crossT < 2.4)); }, () => { view(); hints(); }, () => renderer.render(scene, cam));
window.__night = { S, get guards() { return guards; }, update, shaded, findPath, los, keys, go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz); ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode, x: +S.px.toFixed(1), z: +S.pz.toFixed(1), meter: +S.meter.toFixed(2), alert: S.alert, dawn: +S.dawn.toFixed(0) }; } };
