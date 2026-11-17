/* 케이월드 · 몰이 — 구석기 한 장면(S01, 2026-11-17). 본보기 = 그믐밤(night.js), 공통 부품 = ../scene/kit.js.
   목표는 하나(북동쪽 골짜기 어귀의 횃불 둘)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 해가 지면 끝이 아니라 다음 날이 달라진다.
   떼의 성질: 다가가면 반대쪽으로 달아난다(걸으면 조금, 뛰면 멀리) · 옆이 비어 있으면 옆으로 샌다 · 바람을 등지고 다가가면 냄새로 일찍 흩어진다 · 늑대가 끼어든다.
   좌표: x 동쪽(+), z 남쪽(+). 강은 남쪽(z 63~), 골짜기는 북동쪽. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, gridPath, losRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, groundAt, runLoop, loadArt, ART, art, artInst } from '../scene/kit.js?v=3';
await loadArt('people');   /* 블렌더로 만든 모델(사람·자연·집·소품) */

const W = 96, H = 72;
const BX = [5.5, 89], BZ = [6, 61.5]; /* 걸을 수 있는 곳 */

/* ───── 무대 ───── */
/* 막는 것: [x0,z0,x1,z1,높이,종류] */
const SOLID = [
  [60, 0, 63.5, 16.5, 7, 'cliff'], [78.5, 0, 96, 16.5, 7, 'cliff'], [60, 0, 79, 3, 8, 'cliff'], [89, 16.5, 96, 72, 6, 'cliff'],
  [63.5, 13.6, 66.4, 17.6, 3.2, 'rock'], [74, 13.6, 78.5, 17.6, 3.2, 'rock'],   /* 어귀 바위 둘 — 사이 7.6 */
  [46, 0, 60, 10.5, 5, 'cliff'], [55.6, 10.2, 60, 15.8, 2.8, 'rock'], /* 왼쪽(북서) 날개 — 벼랑 끝자락 */
  [74.6, 17.4, 78.4, 23.4, 2.6, 'rock'], [75.2, 23.2, 78.4, 29, 2.3, 'rock'], [81, 32, 84, 35, 2.0, 'rock'], /* 오른쪽(남동) 날개 — 이어진 바위 줄(틈 없음) */
  [35.5, 25.5, 38, 27.8, 1.6, 'rock'], [55, 41, 57.6, 43.4, 1.8, 'rock'], [30, 45, 32, 46.8, 1.4, 'rock'],
  [18, 49.8, 21, 52.6, 2.6, 'hut'], [27.6, 50.2, 30.6, 53, 2.6, 'hut'],
];
const LONE_TREES = [[38, 18, 2.4], [16, 33, 2.2], [66, 44, 2.6], [48, 50, 2.0], [74, 34, 2.2]];
for (const [x, z] of LONE_TREES) SOLID.push([x - 0.5, z - 0.5, x + 0.5, z + 0.5, 3, 'tree']);
const VALLEY = [63.6, 3.2, 78.4, 15.2];
const MOUTH = [70.2, 17.2];
const TORCHMEN = [[64.4, 19.3], [73.2, 21.2]];
const FIRE = [24, 54.5], START = [24.5, 58.2], ANVIL = [14, 59.6];
const STONES0 = [[9, 60.6], [17.5, 61], [30, 60.8], [36, 61.2], [42, 60.5], [47.5, 61], [11, 57.2], [40, 40.5], [61, 47]];
const STICKS0 = [[8, 48], [6.8, 40], [9.5, 31], [33, 50.5], [44, 53], [13.5, 44], [52, 55], [7.2, 22], [20, 46.5]];
const BUSHES = [[8.8, 36], [11.5, 26.5], [30, 10.5], [42, 10.8], [58, 51], [86, 44]];
const ROOTS = [[19, 21.5], [50, 57]];
const HERD_AT = [[44, 37], [33, 42], [27, 33]];       /* 날마다 떼가 있는 곳 — 지면 더 멀리 */
const WINDS = [[-0.71, -0.71], [0.6, 0.8], [-0.96, 0.28], [0.28, -0.96]]; /* 바람이 가는 쪽 */
const WOLF_FROM = [[6, 30], [40, 5.5]];
const NDEER = 9, NEED = 6, DAY = 210;

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xf2c9a0, 80, 230], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x5a7a3a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff1d6, intensity: 2.2, box: [56, 44], far: 180, pos: [W / 2 - 40, 60, H / 2 + 30], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261117);
const sky = skyDome(scene, rnd, { top: 0x6aa6e8, low: 0xffe2b8, stars: 0 });
const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff2c8, fog: false })); scene.add(sunDisc);
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* 땅: 풀밭 · 강가 모래 · 강 · 골짜기 바닥 */
flat(-60, -30, W + 60, H + 10, 0x6cbf55, 0);
flat(0, 57.5, W, 63.2, 0xe8d29a, 0.03);
flat(62, 3, 79, 17, 0x8fae5a, 0.03);
flat(-60, 63, W + 60, H + 60, 0x3d8fd0, 0.05);
for (let i = 0; i < 120; i++) { const x = 6 + rnd() * 82, z = 6 + rnd() * 50; if (x > 60 && z < 18) continue; const t = box(0.8 + rnd() * 1.6, 0.1, 0.8 + rnd() * 1.6, rnd() > 0.5 ? 0x7fd062 : 0x5aaa4a); t.castShadow = false; at(t, x, 0.05, z); scene.add(t); }
for (let i = 0; i < 40; i++) { const t = box(0.4 + rnd() * 0.6, 0.08, 0.3 + rnd() * 0.5, 0xd8c08a); t.castShadow = false; at(t, 2 + rnd() * 90, 0.07, 58 + rnd() * 4.6); scene.add(t); }
/* 강 물결 */
const riverG = new THREE.PlaneGeometry(W + 140, 40, 60, 10); riverG.rotateX(-Math.PI / 2);
const river = new THREE.Mesh(riverG, new THREE.MeshStandardMaterial({ color: 0x3a8ad8, roughness: 0.25, metalness: 0.15, flatShading: true })); river.position.set(W / 2, 0.02, 83); river.receiveShadow = true; scene.add(river);
const riverBase = riverG.attributes.position.array.slice();
flat(-60, 103, W + 60, 140, 0x5aa04a, 0.3);
/* 벼랑 · 바위 */
function cliff([x0, z0, x1, z1, h]) { const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; const cols = [0xa08a70, 0x8f7a62, 0xb09a7c];
  for (let k = 0; k < 3; k++) { const b = box(w - k * 0.8, h / 3 + 0.02, d - k * 0.8, cols[k]); at(b, cx + (k % 2 ? 0.3 : -0.2), (h / 3) * (k + 0.5), cz); scene.add(b); }
  const top = box(w - 1.6, 0.3, d - 1.6, 0x6f9a48); at(top, cx, h + 0.15, cz); scene.add(top); }
function rock([x0, z0, x1, z1, h]) { const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, P = [];
  const a = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), M(0x9a948a)); a.scale.set(w * 0.62, h * 0.62, d * 0.62); a.position.set(cx, h * 0.45, cz); a.rotation.y = cx; a.castShadow = a.receiveShadow = true; P.push(a);
  const b = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), M(0xb3ada0)); b.scale.set(w * 0.36, h * 0.4, d * 0.36); b.position.set(cx + w * 0.18, h * 0.86, cz - d * 0.1); b.castShadow = true; P.push(b);
  group([x0, z0, x1, z1], P); }
/* 막집: 나뭇가지를 기대 세우고 가죽을 덮은 집 */
function hut([x0, z0, x1, z1]) { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, P = [];
  const c = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.8, 7), M(0xb07a44)); c.position.set(cx, 1.4, cz); c.castShadow = c.receiveShadow = true; P.push(c);
  for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.28, s = cyl(0.05, 0.06, 1.3, 0x6a4526, 5); s.position.set(cx + Math.cos(a) * 0.2, 3.2, cz + Math.sin(a) * 0.2); s.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); P.push(s); }
  P.push(at(box(0.9, 1.1, 0.12, 0x3a2414), cx, 0.55, cz + 1.25));
  group([x0, z0, x1, z1], P); }
for (const s of SOLID) { if (s[5] === 'cliff') cliff(s); else if (s[5] === 'rock') rock(s); else if (s[5] === 'hut') hut(s); }
/* 숲: 한데 묶어(그림 한 번) 서쪽·북쪽 가장자리를 두른다 */
{ const pts = []; for (let i = 0; i < 110; i++) { let x, z; const k = rnd(); if (k < 0.4) { x = -6 + rnd() * 10; z = rnd() * 64; } else if (k < 0.8) { x = rnd() * 60; z = -6 + rnd() * 10; } else { x = 84 + rnd() * 20; z = 18 + rnd() * 44; } pts.push([x, z, 0.8 + rnd() * 0.5]); }
  for (let i = 0; i < 30; i++) pts.push([-30 + rnd() * 150, -40 + rnd() * 30, 1 + rnd() * 0.6]);
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.24, 0.36, 2.4, 6), M(0x7a4f2b), pts.length); trunk.castShadow = true;
  const cols = [0x2f8f55, 0x3aa866, 0x4cbf78], layers = cols.map((c) => { const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1.1, 1), M(c), pts.length); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; });
  const o = new THREE.Object3D();
  pts.forEach(([x, z, s], i) => { o.position.set(x, 1.2 * s, z); o.rotation.set(0, 0, 0); o.scale.set(s, s, s); o.updateMatrix(); trunk.setMatrixAt(i, o.matrix);
    for (let k = 0; k < 3; k++) { const r = (3.6 - k * 0.8) * s; o.position.set(x, (2.7 + k * 0.95) * s, z); o.rotation.set(0, k * 0.5 + x, 0); o.scale.set(r, s, r); o.updateMatrix(); layers[k].setMatrixAt(i, o.matrix); } });
  scene.add(trunk); }
for (const [x, z, r] of LONE_TREES) { const P = [at(cyl(0.24, 0.36, 2.4, 0x7a4f2b, 7), x, 1.2, z)], cols = [0x2f8f55, 0x3aa866, 0x4cbf78]; for (let k = 0; k < 3; k++) { const b = box(r * 1.5 - k * 0.8, 1.1, r * 1.5 - k * 0.8, cols[k]); b.rotation.y = k * 0.5; P.push(at(b, x, 2.7 + k * 0.95, z)); } group([x - 1.6, z - 0.4, x + 1.6, z + 0.4], P); }
/* 바람 타는 풀: 풀잎이 눕는 쪽 = 바람이 가는 쪽 */
const windU = { uTime: { value: 0 }, uWind: { value: new THREE.Vector2(-0.7, -0.7) } };
{ const geo = new THREE.BoxGeometry(0.09, 0.9, 0.09); geo.translate(0, 0.45, 0);
  const mat = M(0x8fd66a); mat.onBeforeCompile = (sh) => { sh.uniforms.uTime = windU.uTime; sh.uniforms.uWind = windU.uWind; sh.vertexShader = 'uniform float uTime; uniform vec2 uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    float hh = position.y; vec2 ip = vec2(instanceMatrix[3].x, instanceMatrix[3].z); float sw = 0.55 + 0.3 * sin(uTime * 2.3 + ip.x * 0.31 + ip.y * 0.23);
    transformed.x += uWind.x * hh * hh * sw * 0.9; transformed.z += uWind.y * hh * hh * sw * 0.9;`); };
  const N = 2200, im = new THREE.InstancedMesh(geo, mat, N), o = new THREE.Object3D(); let n = 0;
  for (let i = 0; i < N * 3 && n < N; i++) { const x = 6 + rnd() * 82, z = 5 + rnd() * 52; if (x > 59 && z < 18) continue; if (dist(x, z, FIRE[0], FIRE[1]) < 7) continue; o.position.set(x, 0, z); o.scale.set(1, 0.6 + rnd() * 0.9, 1); o.updateMatrix(); im.setMatrixAt(n++, o.matrix); }
  im.count = n; scene.add(im); }

/* 야영지: 모닥불 · 연기 · 가죽 걸이 */
for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.28, s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 0), M(0x8a8478)); at(s, FIRE[0] + Math.cos(a) * 0.8, 0.15, FIRE[1] + Math.sin(a) * 0.8); s.castShadow = true; scene.add(s); }
for (let k = 0; k < 4; k++) { const l = cyl(0.07, 0.08, 1.3, 0x5a3a20, 5); l.rotation.z = Math.PI / 2; l.rotation.y = k * 0.8; at(l, FIRE[0], 0.14, FIRE[1]); scene.add(l); }
const fire = new THREE.Group(); for (let k = 0; k < 3; k++) fire.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.42 - k * 0.1, 0.9 + k * 0.2, 5), new THREE.MeshBasicMaterial({ color: [0xff5a2a, 0xffa23a, 0xffe07a][k] })), (k - 1) * 0.18, 0.5 + k * 0.08, 0)); fire.position.set(FIRE[0], 0, FIRE[1]); scene.add(fire);
const fireL = new THREE.PointLight(0xff8a3a, 10, 16, 1.6); fireL.position.set(FIRE[0], 1.6, FIRE[1]); scene.add(fireL);
const fireGlow = glowSprite(scene, 'rgba(255,200,120,.9)', 'rgba(255,120,40,0)', 5); fireGlow.position.set(FIRE[0], 1.2, FIRE[1]);
const smoke = []; for (let k = 0; k < 7; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: 0xd8d4cc, transparent: true, opacity: 0.5, flatShading: true, depthWrite: false })); s.userData.k = k / 7; scene.add(s); smoke.push(s); }
scene.add(at(cyl(0.06, 0.06, 2, 0x6a4526, 5), 31.5, 1, 56), at(cyl(0.06, 0.06, 2, 0x6a4526, 5), 34, 1, 56), at(box(2.8, 0.06, 0.06, 0x6a4526), 32.75, 1.95, 56), at(box(1.6, 1.1, 0.06, 0xc8955a), 32.75, 1.35, 56));
/* 돌 받침(주먹도끼 만드는 곳) */
const anvil = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0), M(0x8d877c)); anvil.scale.set(1.2, 0.55, 1); at(anvil, ANVIL[0], 0.35, ANVIL[1]); anvil.castShadow = anvil.receiveShadow = true; scene.add(anvil);
const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), M(0xc9c3b4, { emissive: 0x2a2620 })); at(core, ANVIL[0], 0.85, ANVIL[1]); core.castShadow = true; scene.add(core);
const kRing = new THREE.Mesh(new THREE.RingGeometry(0.88, 1, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })); kRing.rotation.x = -Math.PI / 2; kRing.visible = false; scene.add(kRing);
const kMark = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.5, 36), new THREE.MeshBasicMaterial({ color: 0xffcf4d, transparent: true, opacity: 0.9, depthWrite: false })); kMark.rotation.x = -Math.PI / 2; kMark.position.set(ANVIL[0], 0.75, ANVIL[1]); kMark.visible = false; scene.add(kMark);
const chips = []; for (let k = 0; k < 10; k++) { const c = box(0.12, 0.05, 0.1, 0xe2ddd0); c.castShadow = false; c.visible = false; scene.add(c); chips.push({ m: c, t: 9, vx: 0, vy: 0, vz: 0 }); }
/* 횃불 둘(목표) — 어귀 양쪽 사람이 든다 */
const torchGlows = TORCHMEN.map(([x, z]) => { const g = glowSprite(scene, 'rgba(255,230,160,.95)', 'rgba(255,150,50,0)', 6); g.position.set(x + 0.5, 2.9, z + 0.25); return g; });
const goalPos = new THREE.Vector3(MOUTH[0], 2.4, MOUTH[1]);
/* 불이 꺼진 밤 — 어둠 속 짐승 눈 */
const eyes = new THREE.Group(); for (const [x, z] of [[17, 47], [31, 46.5], [14, 52.5]]) for (const s of [-0.18, 0.18]) eyes.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.06), new THREE.MeshBasicMaterial({ color: 0xffe27a, fog: false })), x + s, 0.9, z)); eyes.visible = false; scene.add(eyes);

/* 사람 — 털가죽 옷, 헝클어진 머리 */
const SKIN = 0xf0c48e;
const pMesh = person({ shirt: 0xb57a45, pants: 0x7a5230, hat: 'hair', skin: SKIN });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const comps = [0, 1].map((i) => ({ i, mesh: person({ shirt: i ? 0x8e6a44 : 0xa36e3a, pants: 0x6a4a2a, hat: 'hair', skin: SKIN, spear: true, hairC: i ? 0x4a3020 : 0x2b2118 }), x: 0, z: 0, tx: 0, tz: 0, state: 'follow', dir: 0, slow: false, moving: false }));
const torchmen = TORCHMEN.map(([x, z], i) => { const m = person({ shirt: 0x9a6a3e, pants: 0x6a4a2a, hat: 'hair', skin: SKIN, torch: true }); m.position.set(x, 0, z); m.rotation.y = i ? -0.5 : 0.5; return { mesh: m, x, z, hx: x, hz: z }; });
const tmark = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.95, 28), new THREE.MeshBasicMaterial({ color: 0xffcf4d, transparent: true, opacity: 0.8, depthWrite: false })); tmark.rotation.x = -Math.PI / 2; tmark.visible = false; scene.add(tmark);

/* 사슴 · 늑대 */
function deerMesh(stag) {
  const g = new THREE.Group(), c = 0xc58a4a, u = { legs: [] };
  g.add(at(box(1.35, 0.58, 0.56, c), 0, 1.05, 0), at(box(1.1, 0.16, 0.5, 0xf0dcc0), 0, 0.78, 0), at(box(0.18, 0.22, 0.2, 0xffffff), -0.72, 1.18, 0));
  const neck = new THREE.Group(); neck.position.set(0.55, 1.2, 0); neck.add(at(box(0.26, 0.62, 0.26, c), 0, 0.28, 0));
  const head = new THREE.Group(); head.position.set(0, 0.6, 0); head.add(at(box(0.52, 0.3, 0.28, c), 0.18, 0, 0), at(box(0.12, 0.1, 0.14, 0x2b2118), 0.44, -0.02, 0), at(box(0.08, 0.22, 0.12, 0xb07a40), -0.04, 0.2, 0.15), at(box(0.08, 0.22, 0.12, 0xb07a40), -0.04, 0.2, -0.15));
  if (stag) for (const s of [1, -1]) { head.add(at(box(0.06, 0.5, 0.06, 0x8a6a4a), -0.02, 0.4, 0.12 * s), at(box(0.3, 0.06, 0.06, 0x8a6a4a), 0.08, 0.58, 0.16 * s), at(box(0.06, 0.26, 0.06, 0x8a6a4a), -0.12, 0.62, 0.2 * s)); }
  neck.add(head); g.add(neck); u.neck = neck;
  for (const [lx, lz] of [[0.48, 0.18], [0.48, -0.18], [-0.48, 0.18], [-0.48, -0.18]]) { const l = new THREE.Group(); l.position.set(lx, 0.8, lz); l.add(at(box(0.13, 0.8, 0.13, 0xa8743c), 0, -0.4, 0)); g.add(l); u.legs.push(l); }
  g.userData = u; g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g;
}
function wolfMesh() {
  const g = new THREE.Group(), c = 0x7d828c, u = { legs: [] };
  g.add(at(box(1.15, 0.48, 0.42, c), 0, 0.72, 0), at(box(0.46, 0.42, 0.42, c), 0.72, 0.92, 0), at(box(0.3, 0.2, 0.26, 0x5e636c), 1.02, 0.84, 0), at(box(0.1, 0.18, 0.1, 0x4a4e56), 0.66, 1.2, 0.13), at(box(0.1, 0.18, 0.1, 0x4a4e56), 0.66, 1.2, -0.13), at(box(0.5, 0.14, 0.14, c), -0.78, 0.86, 0), at(box(0.07, 0.07, 0.04, 0xffe27a), 0.95, 0.98, 0.22), at(box(0.07, 0.07, 0.04, 0xffe27a), 0.95, 0.98, -0.22));
  for (const [lx, lz] of [[0.4, 0.14], [0.4, -0.14], [-0.4, 0.14], [-0.4, -0.14]]) { const l = new THREE.Group(); l.position.set(lx, 0.5, lz); l.add(at(box(0.13, 0.5, 0.13, 0x6a6e78), 0, -0.25, 0)); g.add(l); u.legs.push(l); }
  g.userData = u; g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); g.visible = false; scene.add(g); return g;
}
const deer = Array.from({ length: NDEER }, (_, i) => ({ i, mesh: deerMesh(i % 4 === 0), x: 0, z: 0, vx: 0, vz: 0, dir: 0, alarm: 0, panic: 0, pdx: 0, pdz: 0, wander: rnd() * 6.28, inside: false, lost: false, free: 0, oa: (i / NDEER) * 6.28, or: 0.8 + (i % 3) * 0.95, head: 0, phase: rnd() * 6 }));
const wolves = [0, 1].map((i) => ({ i, mesh: wolfMesh(), x: WOLF_FROM[i][0], z: WOLF_FROM[i][1], state: 'off', t: 0, dir: 0, hits: 0, ang: 0, phase: 0, vx: 0, vz: 0 }));
/* 줍는 것: 돌 · 나뭇가지 · 열매 덤불 · 뿌리 */
const stoneGeo = new THREE.DodecahedronGeometry(0.22, 0), stoneMat = M(0xd6d2c8, { emissive: 0x3a3830 });
const flying = new THREE.Mesh(stoneGeo, stoneMat); flying.visible = false; scene.add(flying);
const stickGeo = new THREE.BoxGeometry(1.1, 0.1, 0.12), stickMat = M(0x8a5a2b, { emissive: 0x2a1808 });
const bushes = BUSHES.map(([x, z]) => { const g = new THREE.Group(); g.add(at(new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 0), M(0x3e9a4c)), 0, 0.7, 0)); const b = new THREE.Group(); for (let k = 0; k < 7; k++) { const a = k * 0.9; b.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), M(0xd8324a, { emissive: 0x501018 })), Math.cos(a) * 0.82, 0.55 + (k % 3) * 0.3, Math.sin(a) * 0.82)); } g.add(b); g.position.set(x, 0, z); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return { x, z, g, b, on: true }; });
const roots = ROOTS.map(([x, z]) => { const g = new THREE.Group(); for (let k = 0; k < 5; k++) g.add(at(box(0.08, 0.5, 0.08, 0x5aa040), (k - 2) * 0.12, 0.25, (k % 2) * 0.1)); g.add(at(box(0.7, 0.08, 0.5, 0x7a5a3a), 0, 0.04, 0)); g.position.set(x, 0, z); scene.add(g); return { x, z, g, on: true }; });

/* ───── 소리 ───── */
const SFX = {
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  done: () => { tone(523, 523, 0.14, 'triangle', 0.16); tone(784, 784, 0.22, 'triangle', 0.16, 0.14); },
  clack: () => { noise(0.07, 0.6, 2600); noise(0.05, 0.35, 1900, 0.06); },
  thud: () => { noise(0.1, 0.4, 260); },
  tick: () => tone(1400, 1400, 0.04, 'square', 0.03),
  shout: () => { tone(320, 420, 0.18, 'sawtooth', 0.14); tone(420, 300, 0.32, 'sawtooth', 0.12, 0.18); },
  hey: () => tone(440, 560, 0.16, 'triangle', 0.1),
  snort: () => { noise(0.12, 0.35, 500); noise(0.1, 0.25, 700, 0.18); },
  hooves: () => { for (let i = 0; i < 6; i++) noise(0.04, 0.18, 400 + (i % 2) * 120, i * 0.08); },
  howl: () => { tone(380, 620, 0.7, 'sine', 0.12); tone(620, 420, 1.0, 'sine', 0.1, 0.7); },
  yelp: () => { tone(900, 500, 0.18, 'sawtooth', 0.1); },
  crack: () => { for (let i = 0; i < 5; i++) noise(0.06, 0.25, 1500 + i * 300, i * 0.07); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  dusk: () => { tone(330, 220, 1.2, 'sine', 0.14); tone(262, 175, 1.4, 'sine', 0.1, 0.4); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', day: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, sun: 0, px: START[0], pz: START[1], pdir: -Math.PI / 2, moving: false, running: false,
  stones: 0, sticks: 0, food: 0, axe: false, hits: 0, misses: 0, fuel: 0.55, fed: false, fireOut: false, nerve: 0, scatters: 0, inside: 0, smellT: 0, firstSmell: -1, said: {}, sayT: 0,
  next: 0, shoutCD: 0, fly: null, beatT: 0, stepT: 0, digT: 0, introT: 0, endT: 0, kPhase: 0, kTick: false, slowComp: false, wind: WINDS[0], ground: [], sticksOn: [], herdSide: 1, endWhy: '', lastShout: -9 };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 「뛰기」 · 「소리」 · 땅을 누르면 동료가 그 자리에 선다 · 늑대를 누르면 돌 던지기 · 「시점」 ⟲⟳';
let stoneMeshes = [], stickMeshes = [];

function hud() {
  $('hStone').textContent = '🪨 ' + S.stones; $('hStick').textContent = '🪵 ' + S.sticks;
  const d = $('deer'); d.textContent = '🦌 ' + Math.min(S.inside, NEED) + ' / ' + NEED; d.className = 'pill' + (S.inside ? ' got' : '');
  $('tAxe').className = S.axe ? 'on' : ''; $('tFire').className = S.fed && !S.fireOut ? 'on' : ''; $('tFire').textContent = S.fireOut ? '🔥 불씨가 꺼졌다' : '🔥 야영지 불씨 지키기';
  $('tFood').className = S.food >= 3 ? 'on' : ''; $('tFood').textContent = '🫐 열매·뿌리 줍기 ' + Math.min(3, S.food) + '/3';
  $('wind').querySelector('b').style.transform = `rotate(${Math.atan2(S.wind[1], S.wind[0])}rad)`;
}
function resetDay() {
  const hx = HERD_AT[Math.min(S.day - 1, HERD_AT.length - 1)];
  S.wind = WINDS[(S.day - 1) % WINDS.length]; windU.uWind.value.set(S.wind[0], S.wind[1]);
  Object.assign(S, { t: 0, sun: 0, px: START[0], pz: START[1], pdir: -Math.PI / 2, moving: false, running: false, sticks: 0, food: 0, hits: 0, misses: 0, fuel: 0.55, fed: false, fireOut: false, nerve: 0, scatters: 0, inside: 0, smellT: 0, firstSmell: -1, next: 0, shoutCD: 0, fly: null, digT: 0, endT: 0, endWhy: '' });
  if (!S.axe) S.stones = 0;
  S.slowComp = S.day > 1;
  Object.assign(S, { hx: hx[0], hz: hx[1], hvx: 0, hvz: 0, veer: 0, veerT: 0, kick: 0, scatT: 0, lostN: 0, graze: 0 });
  deer.forEach((d, i) => { d.oa = (i / NDEER) * 6.28; Object.assign(d, { x: hx[0] + Math.cos(d.oa) * d.or, z: hx[1] + Math.sin(d.oa) * d.or, vx: 0, vz: 0, alarm: 0, inside: false, lost: false, free: 0 }); d.mesh.visible = true; });
  comps.forEach((c, i) => Object.assign(c, { x: START[0] + (i ? 1.6 : -1.6), z: START[1] + 1.2, state: 'follow', slow: S.slowComp && i === 1 }));
  torchmen.forEach((t) => { t.x = t.hx; t.z = t.hz; });
  wolves.forEach((w, i) => { Object.assign(w, { x: WOLF_FROM[i][0], z: WOLF_FROM[i][1], state: 'off', t: 0, hits: 0 }); w.mesh.visible = false; });
  for (const m of stoneMeshes) scene.remove(m); for (const m of stickMeshes) scene.remove(m); stoneMeshes = []; stickMeshes = [];
  S.ground = (S.axe ? STONES0.slice(0, 4) : STONES0).map(([x, z]) => { const m = new THREE.Mesh(stoneGeo, stoneMat); m.position.set(x, 0.2, z); m.castShadow = true; scene.add(m); stoneMeshes.push(m); return { x, z, m, on: true }; });
  S.sticksOn = STICKS0.map(([x, z], i) => { const m = new THREE.Mesh(stickGeo, stickMat); m.position.set(x, 0.1, z); m.rotation.y = i * 1.3; m.castShadow = true; scene.add(m); stickMeshes.push(m); return { x, z, m, on: true }; });
  bushes.forEach((b) => { b.on = true; b.b.visible = true; }); roots.forEach((r) => { r.on = true; r.g.visible = true; });
  core.scale.setScalar(1); core.visible = !S.axe; tmark.visible = false; $('fade').style.opacity = 0;
  fire.visible = true; hud();
}

/* ───── 입력: 땅 누르기 = 동료를 그 자리에(늑대를 누르면 돌 던지기) · 스페이스 = 소리치기(돌 받침 곁에서는 내리치기) ───── */
function nearAnvil() { return !S.axe && dist(S.px, S.pz, ANVIL[0], ANVIL[1]) < 2.4 && S.stones >= 2; }
function pressGround(x, z) {
  if (S.mode !== 'play') return;
  for (const w of wolves) if (w.state !== 'off' && w.state !== 'gone' && dist(x, z, w.x, w.z) < 4.5) return throwAt(w);
  let tx = clamp(x, BX[0] + 0.5, BX[1] - 0.5), tz = clamp(z, BZ[0] + 0.5, BZ[1] - 0.5); [tx, tz] = collideRects(SOLID, tx, tz, 1.0);
  const c = comps[S.next]; S.next = 1 - S.next; c.state = 'go'; c.tx = tx; c.tz = tz; c.best = 99; c.stuck = 0;
  ring(tx, tz, 2.4, 0xffcf4d); tmark.position.set(tx, 0.12, tz); tmark.visible = true; SFX.hey();
  say(c.i ? '"이쪽은 내가 막는다!"' : '"내가 저기 선다!"', null, 1.6); say('동료가 그 자리에 서서 사람 벽이 된다 — 하나 더 누르면 다른 동료가 간다', 'wall1', 3.4);
}
function throwAt(w) {
  if (S.stones < 1) return say('던질 돌이 없다 — 강가에서 줍자', null, 2.2);
  if (S.fly) return; if (dist(S.px, S.pz, w.x, w.z) > 20) return say('너무 멀다 — 더 다가가서 던지자', null, 1.8);
  S.stones--; hud(); S.fly = { x0: S.px, z0: S.pz, x1: w.x + w.vx * 0.5 || w.x, z1: w.z + w.vz * 0.5 || w.z, t: 0, w }; flying.visible = true;
}
function shout() {
  if (S.mode !== 'play') return;
  if (nearAnvil()) return strike();
  if (S.shoutCD > 0) return; S.shoutCD = 1.4; S.lastShout = S.t; SFX.shout(); ring(S.px, S.pz, 16, 0xffe2a0);
  const dc = dist(S.px, S.pz, S.hx, S.hz) || 0.01;
  if (dc > 18 || !deer.some((d) => !d.inside && !d.lost)) return say('"어이—!" 아무도 못 들었다', null, 1.4);
  S.kick = 1.2; S.kdx = (S.hx - S.px) / dc; S.kdz = (S.hz - S.pz) / dc;
  if (dc < 6.5) { S.nerve += 0.75; say('너무 가까이서 소리쳤다 — 떼가 놀란다!', null, 2); }
  else say('"어이—!" 떼가 크게 달아난다', 'shout1', 2.2);
}
function strike() {
  const ph = S.kPhase, ok = Math.abs(ph - 0.9) < 0.13;
  if (ok) { S.hits++; SFX.clack(); core.scale.set(1 - S.hits * 0.12, 1 + S.hits * 0.14, 1 - S.hits * 0.2); for (let k = 0; k < 4; k++) { const c = chips.find((c) => c.t > 1); if (c) { c.t = 0; c.vx = (rnd() - 0.5) * 3; c.vy = 2 + rnd() * 2; c.vz = (rnd() - 0.5) * 3; c.m.position.set(ANVIL[0], 0.9, ANVIL[1]); c.m.visible = true; } }
    ring(ANVIL[0], ANVIL[1], 2.2, 0xffcf4d);
    if (S.hits >= 3) { S.axe = true; S.stones -= 2; core.visible = false; kRing.visible = kMark.visible = false; $('knap').style.display = 'none'; SFX.done(); hud(); say('주먹도끼! — 이 돌 하나로 찍고, 자르고, 판다', null, 3.2); }
    else say(['딱! 한 조각 떨어졌다', '딱! 날이 서기 시작한다'][S.hits - 1], null, 1.4); }
  else { S.misses++; SFX.thud(); say('퍽 — 빗맞았다. 고리가 작아질 때!', null, 1.4);
    if (S.misses >= 3) { S.misses = 0; S.stones--; hud(); SFX.crack(); say('돌이 쪼개져 버렸다 — 하나 더 주워 오자', null, 2.6); } }
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) shout(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); shout(); });
canvas.addEventListener('pointerdown', (e) => { if (S.mode === 'intro') { S.introT = 99; return; } const hit = groundAt(cam, e.clientX, e.clientY); if (hit) pressGround(hit[0], hit[1]); });

/* ───── 막힘 · 떼 ───── */
function blockedAt(x, z) {
  if (x < BX[0] || x > BX[1] || z < BZ[0] || z > BZ[1]) return true;
  for (const s of SOLID) if (inRect(x, z, s, 0.8)) return true;
  for (const c of comps) if (c.state === 'stand' && dist(x, z, c.x, c.z) < 3.4) return true;
  for (const t of torchmen) if (dist(x, z, t.x, t.z) < 3.4) return true;
  return false;
}
function sideCount(cx, cz, fx, fz, s) { const lx = -fz * s, lz = fx * s; let n = 0; for (const f of [1, 5, 9, 13]) for (const l of [3.5, 6, 8.5]) if (blockedAt(cx + fx * f + lx * l, cz + fz * f + lz * l)) n++; return n; }
function aheadBlocked(x, z, fx, fz) { for (const f of [2.5, 4, 5.5]) if (blockedAt(x + fx * f, z + fz * f)) return true; return false; }
function smells(o) { const dx = o.x - S.px, dz = o.z - S.pz, dd = Math.hypot(dx, dz); return dd < 22 && dd > 0.1 && (dx * S.wind[0] + dz * S.wind[1]) / dd > 0.62; }
const insideSolid = (x, z) => SOLID.some((s) => inRect(x, z, s));
function safeMove(x0, z0, nx, nz, r, bx = 0) { let [x, z] = collideRects(SOLID, nx, nz, r); x = clamp(x, BX[0] + bx, BX[1] - bx); z = clamp(z, BZ[0] + bx, BZ[1] - bx); return insideSolid(x, z) || !losRects(SOLID, x0, z0, x, z) ? [x0, z0] : [x, z]; } /* 바위 속으로는 절대 들어가지 않는다 */
function moveBody(o, nx, nz, r) { [o.x, o.z] = safeMove(o.x, o.z, nx, nz, r); }
function scatter() {
  S.nerve = 0.2; S.scatters++; S.scatT = 3.6; SFX.hooves(); SFX.snort();
  const fl = deer.filter((d) => !d.inside && !d.lost);
  for (const d of fl) { const a = Math.atan2(d.z - S.pz, d.x - S.px) + (rnd() - 0.5) * 3.2; d.free = 2.6 + rnd() * 1.4; d.pdx = Math.cos(a); d.pdz = Math.sin(a); }
  /* 흩어지면 한 마리는 숲으로 달아나 돌아오지 않는다 — 남은 사슴이 모자라지 않을 만큼만 */
  if (fl.length > NEED) { fl.sort((a, b) => dist(b.x, b.z, S.px, S.pz) - dist(a.x, a.z, S.px, S.pz)); const far = fl[0]; far.lost = true; far.free = 6; S.lostN++; say('흩어졌다! 한 마리는 숲으로 달아나 버렸다', null, 2.6); }
  else say('흩어졌다! — 다시 모일 때까지 기다리자', null, 2.4);
  const dp = dist(S.px, S.pz, S.hx, S.hz) || 1; for (let k = 0; k < 10; k++) [S.hx, S.hz] = safeMove(S.hx, S.hz, S.hx + (S.hx - S.px) / dp * 0.5, S.hz + (S.hz - S.pz) / dp * 0.5, 1.6, 1.2);
}
/* 떼는 한 덩이로 움직인다(가운데 S.hx·S.hz). 사슴은 그 둘레 제자리를 따라간다. 흩어질 때만 저마다 달린다. */
function stepDeer(dt) {
  const act = S.mode === 'play' || S.mode === 'win', run = S.running && S.mode === 'play';
  const dp = dist(S.px, S.pz, S.hx, S.hz) || 0.01, sm = act && smells({ x: S.hx, z: S.hz });
  let fx = 0, fz = 0, fear = 0;
  if (act) {
    const R = (run ? 15 : 10) * (sm ? 1.4 : 1);
    if (dp < R) { const w = 1 - dp / R; fx += (S.hx - S.px) / dp * w; fz += (S.hz - S.pz) / dp * w; fear = w * (run ? 2 : 1); }
    for (const w of wolves) if (w.state === 'come' || w.state === 'harass') { const dw = dist(w.x, w.z, S.hx, S.hz) || 0.01; if (dw < 12) { const k = (1 - dw / 12) * 2; fx += (S.hx - w.x) / dw * k; fz += (S.hz - w.z) / dw * k; fear = Math.max(fear, k); } }
  }
  let wx = 0, wz = 0, sp = 0;
  if (fear > 0.01) {
    const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l;
    S.veerT -= dt; if (S.veerT <= 0) { S.veerT = 0.15;
      const nl = sideCount(S.hx, S.hz, fx, fz, 1), nr = sideCount(S.hx, S.hz, fx, fz, -1);
      if (aheadBlocked(S.hx, S.hz, fx, fz)) S.veer = 1.35 * (nl < nr ? 1 : nl > nr ? -1 : S.herdSide); /* 앞이 막히면 덜 막힌 쪽으로 꺾어 벽을 따라간다 */
      else if (nl && nr) S.veer = 0; else if (nl) S.veer = -0.9; else if (nr) S.veer = 0.9;
      else { S.veer = 1.2 * S.herdSide; if (S.mode === 'play' && dp < 11) say('떼가 옆으로 샌다 — 땅을 눌러 동료를 양옆에 세우자', 'leak', 3.4); } /* 양옆이 비면 옆으로 샌다 — 어느 쪽일지는 몇 초마다 바뀐다 */ }
    const cv = Math.cos(S.veer), sv = Math.sin(S.veer); wx = fx * cv - fz * sv; wz = fz * cv + fx * sv;
    sp = run ? lerp(2.6, 6.4, clamp(fear / 2, 0, 1)) : lerp(0.9, 3.3, clamp(fear, 0, 1));
    if (Math.abs(S.veer) > 1.1) sp *= 1.5; /* 옆이 트이면 그쪽으로 내빼듯 빠르게 샌다 — 걸어서는 못 따라간다 */
  } else { S.graze += (rnd() - 0.5) * dt; wx = Math.cos(S.graze); wz = Math.sin(S.graze); sp = 0.15; }
  if (S.kick > 0) { S.kick -= dt; wx = S.kdx; wz = S.kdz; sp = 6; }
  let vx = wx * sp, vz = wz * sp;
  /* 울타리: 곁에 선 동료·횃불 든 사람이 떼를 옆으로 밀어 준다(내 쪽으로 되밀지는 않는다) */
  const fence = (cx, cz, r) => { const d = dist(S.hx, S.hz, cx, cz) || 0.01; if (d >= r) return; let ax = (S.hx - cx) / d * (1 - d / r) * 3, az = (S.hz - cz) / d * (1 - d / r) * 3; if (fear > 0.01) { const dd = ax * fx + az * fz; if (dd < 0) { ax -= dd * fx; az -= dd * fz; } } vx += ax; vz += az; };
  for (const c of comps) if (c.state === 'stand') fence(c.x, c.z, 5.5); for (const t of torchmen) fence(t.x, t.z, 5);
  if (S.scatT > 0) { S.scatT -= dt; vx *= 0.2; vz *= 0.2; }
  S.hvx = lerp(S.hvx, vx, Math.min(1, dt * 2.5)); S.hvz = lerp(S.hvz, vz, Math.min(1, dt * 2.5));
  [S.hx, S.hz] = safeMove(S.hx, S.hz, S.hx + S.hvx * dt, S.hz + S.hvz * dt, 1.6, 1.2);
  const hsp = Math.hypot(S.hvx, S.hvz);
  /* 놀람: 뛰어서 다가가면, 바람을 등지고 다가가면 쌓이고 — 쌓이면 흩어진다 */
  if (S.mode === 'play') {
    if (sm) { S.smellT += dt; S.nerve += dt * 0.85 * (run ? 2 : 1) * clamp(1 - dp / 22, 0, 1); if (S.firstSmell < 0) S.firstSmell = dp; }
    if (run && dp < 13) S.nerve += dt * 0.6;
    if (S.nerve >= 1 && S.scatT <= 0) scatter();
    S.nerve = Math.max(0, S.nerve - dt * 0.14);
    if (dp < 15) say('걸어서 다가가면 조금, 뛰면 멀리 달아난다', 'near1', 3);
    if (S.smellT > 0.8) say('킁— 냄새를 맡았다! 풀이 눕는 쪽이 바람이 가는 쪽 — 바람을 안고 다가가자', 'smell', 3.8);
  }
  /* 사슴 하나하나 */
  for (const d of deer) {
    if (d.inside) { d.wander += (rnd() - 0.5) * dt * 2; const tx = 70.5 + Math.cos(d.wander) * 4, tz = 8 + Math.sin(d.wander) * 3; const dx = tx - d.x, dz = tz - d.z, l = Math.hypot(dx, dz) || 1; d.vx = lerp(d.vx, dx / l * Math.min(1.5, l), dt * 2); d.vz = lerp(d.vz, dz / l * Math.min(1.5, l), dt * 2); moveBody(d, d.x + d.vx * dt, Math.min(d.z + d.vz * dt, 14.8), 0.5); }
    else if (d.lost) { d.free -= dt; d.vx = d.pdx * 5.5; d.vz = d.pdz * 5.5; d.x += d.vx * dt; d.z += d.vz * dt; if (d.free <= 0 || d.x < 2 || d.x > 92 || d.z < 3 || d.z > 64) d.mesh.visible = false; }
    else {
      let gx, gz, spd;
      if (d.free > 0) { d.free -= dt; gx = d.x + d.pdx * 4; gz = d.z + d.pdz * 4; spd = 5.2; }
      else { d.oa += dt * 0.15 * (d.i % 2 ? 1 : -1); const r = d.or; gx = S.hx + Math.cos(d.oa) * r; gz = S.hz + Math.sin(d.oa) * r; spd = hsp + 2.4;
        if (!losRects(SOLID, d.x, d.z, gx, gz) && S.hz < VALLEY[3] + 1) { gx = MOUTH[0]; gz = MOUTH[1] + 1; } /* 떼가 골짜기로 들어갔으면 바위를 돌아 어귀로 */ }
      const dx = gx - d.x, dz = gz - d.z, l = Math.hypot(dx, dz), s = l > 0.05 ? Math.min(spd, l * 2.5) : 0;
      d.vx = lerp(d.vx, l > 0.05 ? dx / l * s : 0, Math.min(1, dt * 5)); d.vz = lerp(d.vz, l > 0.05 ? dz / l * s : 0, Math.min(1, dt * 5));
      moveBody(d, d.x + d.vx * dt, d.z + d.vz * dt, 0.5);
      if (d.x > VALLEY[0] && d.x < VALLEY[2] && d.z < VALLEY[3] && d.z > VALLEY[1] && act) { d.inside = true; d.free = 0; S.inside++; SFX.hooves(); ring(d.x, d.z, 3, 0xffcf4d); hud();
        say(S.inside >= NEED ? '다 들어갔다!' : `들어갔다! ${S.inside}마리 — ${NEED - S.inside}마리 더`, null, 1.8); }
    }
    d.alarm = d.free > 0 ? 1 : fear;
  }
  for (const d of deer) {
    const sp = Math.hypot(d.vx, d.vz), m = d.mesh, u = m.userData; m.position.set(d.x, 0, d.z);
    if (sp > 0.15) { const a = Math.atan2(d.vz, d.vx); let da = a - d.dir; da = Math.atan2(Math.sin(da), Math.cos(da)); d.dir += clamp(da, -dt * 6, dt * 6); }
    m.rotation.y = -d.dir; d.phase += dt * (3 + sp * 3.2); const s = Math.sin(d.phase) * Math.min(1, sp / 1.5) * 0.8;
    u.legs[0].rotation.z = s; u.legs[3].rotation.z = s; u.legs[1].rotation.z = -s; u.legs[2].rotation.z = -s;
    const alert = d.alarm > 0.1 || dist(d.x, d.z, S.px, S.pz) < 16; d.head = lerp(d.head, sp > 0.8 || alert ? 0 : 1, dt * 3);
    u.neck.rotation.z = -d.head * 1.25 + (sp > 2.5 ? -0.3 : 0); m.position.y = sp > 3 ? Math.abs(Math.sin(d.phase)) * 0.25 : 0;
  }
}
/* ───── 동료 · 늑대 ───── */
const grid = new Uint8Array(W * H);
for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { const cx = x + 0.5, cz = z + 0.5; let b = cx < BX[0] || cx > BX[1] || cz < BZ[0] || cz > BZ[1]; for (const s of SOLID) if (inRect(cx, cz, s, 0.6)) b = true; grid[z * W + x] = b ? 1 : 0; }
const findPath = gridPath(grid, W, H);
function steer(c, tx, tz, dt) { /* 막히면 길을 찾아 돌아간다 */
  c.repath = (c.repath || 0) - dt;
  if (losRects(SOLID, c.x, c.z, tx, tz)) { c.path = null; return [tx, tz]; }
  if (!c.path || c.repath <= 0) { c.path = findPath(c.x, c.z, tx, tz) || []; c.pi = 0; c.repath = 1; }
  while (c.pi < c.path.length - 1 && dist(c.x, c.z, c.path[c.pi][0], c.path[c.pi][1]) < 0.7) c.pi++;
  return c.path.length ? c.path[c.pi] : [tx, tz];
}
function stepComps(dt) {
  comps.forEach((c, i) => {
    let tx, tz, sp = c.state === 'go' ? (c.slow ? 2.6 : 4.3) : (c.slow ? 2.0 : 3.4);
    if (c.state === 'follow') { const bx = -Math.cos(S.pdir), bz = -Math.sin(S.pdir); tx = S.px + bx * 1.2 + (i ? 1 : -1) * -bz * 2.6; tz = S.pz + bz * 1.2 + (i ? 1 : -1) * bx * 2.6; /* 옆뒤로 따라온다(어깨 너머 시점을 가리지 않게) */ if (dist(c.x, c.z, tx, tz) < 0.8) { tx = c.x; tz = c.z; } if (dist(c.x, c.z, S.px, S.pz) > 6) sp *= 1.3; }
    else { tx = c.tx; tz = c.tz; if (c.state === 'go') { const dd = dist(c.x, c.z, tx, tz); if (dd < (c.best || 99) - 0.3) { c.best = dd; c.stuck = 0; } else c.stuck = (c.stuck || 0) + dt; if (dd < 0.5 || c.stuck > 2.5) { c.state = 'stand'; c.tx = c.x; c.tz = c.z; c.best = 99; ring(c.x, c.z, 2, 0xfff0c0); } } }
    const l0 = dist(c.x, c.z, tx, tz); if (l0 > 0.3) [tx, tz] = steer(c, tx, tz, dt); const dx = tx - c.x, dz = tz - c.z, l = Math.hypot(dx, dz); c.moving = l0 > 0.3 && c.state !== 'stand';
    if (c.moving && l > 0.01) { const st = Math.min(l, sp * dt); moveBody(c, c.x + dx / l * st, c.z + dz / l * st, 0.42); c.dir = Math.atan2(dz, dx); }
    else if (c.state === 'stand') { const h = deer.filter((d) => !d.inside); if (h.length) { let cx = 0, cz = 0; for (const d of h) { cx += d.x; cz += d.z; } c.dir = lerp(c.dir, Math.atan2(cz / h.length - c.z, cx / h.length - c.x), dt * 2); } }
    const m = c.mesh, u = m.userData; m.position.set(c.x, 0, c.z); m.rotation.y = -c.dir + Math.PI / 2; walkAnim(m, S.t * (c.slow ? 7 : 10) + i, c.moving, c.slow ? 1 : 0);
    const wall = c.state === 'stand' ? 1 : 0; u.armL.rotation.z = lerp(u.armL.rotation.z, -wall * 1.2, dt * 6); u.armR.rotation.z = lerp(u.armR.rotation.z, wall * 1.2, dt * 6); m.rotation.z = c.slow && c.moving ? Math.sin(S.t * 7) * 0.08 : 0;
  });
}
function stepWolves(dt) {
  const due = [DAY * 0.33, DAY * 0.52];
  wolves.forEach((w, i) => {
    if (i === 1 && S.day < 3) return;
    w.t += dt;
    if (w.state === 'off' && S.t > due[i] && S.mode === 'play') { w.state = 'come'; w.mesh.visible = true; SFX.howl(); say('아우— 늑대다! 늑대를 눌러 돌을 던지자', null, 3.4); }
    if (w.state === 'off' || w.state === 'gone2') { w.mesh.visible = w.state !== 'off' && w.state !== 'gone2' ? w.mesh.visible : false; return; }
    const herd = deer.filter((d) => !d.inside && !d.lost); let tx = w.x, tz = w.z, sp = 0;
    if (w.state === 'come' || w.state === 'harass') {
      if (!herd.length) { w.state = 'flee'; return; }
      let cx = 0, cz = 0; for (const d of herd) { cx += d.x; cz += d.z; } cx /= herd.length; cz /= herd.length;
      const dc = dist(w.x, w.z, cx, cz);
      if (w.state === 'come') { tx = cx; tz = cz; sp = 5.2; if (dc < 9) { w.state = 'harass'; w.ang = Math.atan2(w.z - cz, w.x - cx); } }
      else { w.ang += dt * 0.55 * (i ? -1 : 1); tx = cx + Math.cos(w.ang) * 6.5; tz = cz + Math.sin(w.ang) * 6.5; sp = 4.6; if (S.mode === 'play') S.nerve += dt * 0.12; }
      if (dist(w.x, w.z, S.px, S.pz) < 3.5) { tx = w.x + (w.x - S.px); tz = w.z + (w.z - S.pz); sp = 4.8; }
    } else if (w.state === 'flee') { tx = WOLF_FROM[i][0] - 8; tz = WOLF_FROM[i][1]; sp = 7; if (dist(w.x, w.z, tx, tz) < 2 || w.t > 6) { w.state = w.hits >= 2 ? 'gone2' : 'gone'; w.t = 0; w.mesh.visible = false; } }
    else if (w.state === 'gone') { if (w.t > 34) { w.state = 'come'; w.x = WOLF_FROM[i][0]; w.z = WOLF_FROM[i][1]; w.mesh.visible = true; SFX.howl(); say('늑대가 다시 왔다!', null, 2); } return; }
    const dx = tx - w.x, dz = tz - w.z, l = Math.hypot(dx, dz); w.vx = 0; w.vz = 0;
    if (l > 0.2) { const st = Math.min(l, sp * dt); w.vx = dx / l * sp; w.vz = dz / l * sp; w.x += dx / l * st; w.z += dz / l * st; [w.x, w.z] = collideRects(SOLID, w.x, w.z, 0.5); let da = Math.atan2(dz, dx) - w.dir; da = Math.atan2(Math.sin(da), Math.cos(da)); w.dir += clamp(da, -dt * 7, dt * 7); }
    const m = w.mesh, u = m.userData; m.position.set(w.x, 0, w.z); m.rotation.y = -w.dir; w.phase += dt * (4 + sp * 3); const s = Math.sin(w.phase) * (l > 0.2 ? 0.8 : 0); u.legs[0].rotation.z = s; u.legs[3].rotation.z = s; u.legs[1].rotation.z = -s; u.legs[2].rotation.z = -s;
  });
}

/* ───── 끝 ───── */
function campScene() {
  /* 해가 진 뒤 모닥불 앞 — 잡는 순간은 그리지 않는다 */
  S.mode = 'camp'; S.endT = 0; S.sun = 1.05; lightFor(1.05);
  for (const d of deer) d.mesh.visible = false; for (const w of wolves) w.mesh.visible = false;
  const seat = (m, a) => { m.position.set(FIRE[0] + Math.cos(a) * 2.4, 0, FIRE[1] + Math.sin(a) * 2.4); m.rotation.y = -Math.atan2(FIRE[1] - m.position.z, FIRE[0] - m.position.x) + Math.PI / 2; walkAnim(m, 0, false); };
  seat(pMesh, 2.2); seat(comps[0].mesh, 3.3); seat(comps[1].mesh, 4.4); seat(torchmen[0].mesh, 5.4); seat(torchmen[1].mesh, 6.2); /* 카메라 쪽(0.9)은 비워 둔다 */
  eyes.visible = !(S.fuel > 0);
  fire.visible = S.fuel > 0; fireL.intensity = S.fuel > 0 ? 26 : 0; fireGlow.visible = S.fuel > 0; torchGlows.forEach((g) => (g.visible = false));
  $('fade').style.opacity = 0;
}
function finish(win) {
  S.mode = win ? 'win' : 'dusk'; S.endT = 0; S.endWin = win; S.food3 = S.food >= 3; S.fireAlive = S.fed && S.fuel > 0;
  if (win) { SFX.win(); say('떼가 골짜기로 쏟아져 들어간다!', null, 2.6); torchmen.forEach((t) => { t.tz = 16.5; }); }
  else { SFX.dusk(); say('해가 졌다…', null, 2.4); }
}
function endScreen() {
  const win = S.endWin, marks = `<div class="marks"><span class="${win ? 'ok' : ''}">🦌 몬 사슴 ${S.inside}마리</span><span class="${S.axe ? 'ok' : ''}">🪨 ${S.axe ? '주먹도끼' : '도끼 없음'}</span><span class="${S.fireAlive ? 'ok' : ''}">🔥 ${S.fireAlive ? '불을 지켰다' : S.fireOut ? '불이 꺼졌다' : '불을 돌보지 않았다'}</span><span class="${S.food3 ? 'ok' : ''}">🫐 열매 ${S.food3 ? '넉넉' : Math.min(3, S.food) + '/3'}</span></div>`;
  const fireLine = S.fireAlive ? '불이 밤새 타올라 짐승이 야영지에 오지 못했다.' : '불이 꺼져, 어둠 속에서 짐승 눈이 번득였다.';
  if (win) {
    overlay(`<h1>몰았다</h1><p>사슴 떼가 골짜기로 쏟아져 들어갔고, 횃불이 어귀를 막았다.</p><p>${S.axe ? '주먹도끼로 가죽까지 벗겨 냈다 — 오늘 밤은 따뜻하다.' : '도끼가 없어 고기만 겨우 떼어 왔다. 가죽은 버려야 했다.'} ${fireLine}</p>${marks}
      <p class="keys">먹을 것이 떨어지자 무리는 강을 따라 떠났다.</p>
      <div class="fact">📜 <b>뗀석기</b> — 돌을 깨뜨려 떼어 낸 도구를 썼다. 주먹도끼 하나로 찍고 자르고 팠다.<br>📜 <b>불</b> — 불로 추위와 짐승을 막고 먹을 것을 익혔다.<br>📜 <b>사냥과 채집</b> — 사냥만으로는 살 수 없었다. 열매와 뿌리가 더 큰 몫이었다.<br>📜 <b>옮겨 다니는 삶</b> — 먹을 것을 따라 무리 지어 옮겨 다니며 동굴이나 막집에서 지냈다.</div>`,
      '한 번 더', () => { S.day = 1; S.axe = false; resetDay(); restorePeople(); S.mode = 'play'; });
  } else {
    const nd = S.day + 1;
    overlay(`<h1>해가 졌다</h1><p>빈손으로 돌아왔다. ${S.food3 ? '<b>그래도 오늘은 굶지 않았다</b> — 주워 둔 열매와 뿌리가 있었다.' : '주린 배로 잠들었다.'}</p><p>${fireLine}</p>${marks}
      <p>다음 날 — <b>동료 하나가 기운이 없어 느리다.</b> 떼는 <b>더 멀리</b> 옮겨 갔고 바람도 바뀌었다.${nd >= 3 ? ' <b>늑대가 한 마리 더</b> 어슬렁거린다.' : ''}</p>
      <p class="keys">${nd}번째 날 · 횃불은 아직 골짜기 어귀에서 기다린다.</p>`,
      '다음 날 나선다', () => { S.day = nd; resetDay(); restorePeople(); S.mode = 'play'; say('바람이 바뀌었다 — 풀이 눕는 쪽을 보자', null, 3); });
  }
}
function restorePeople() { eyes.visible = false; torchmen.forEach((t, i) => { t.mesh.position.set(t.hx, 0, t.hz); t.mesh.rotation.y = i ? -0.5 : 0.5; t.tz = undefined; }); torchGlows.forEach((g) => (g.visible = true)); fireGlow.visible = true; lightFor(0); }

/* ───── 해 · 빛 ───── */
const cSkyTop = new THREE.Color(), cSkyLow = new THREE.Color(), tmpC = new THREE.Color();
const SKY = [[0, 0x6aa6e8, 0xffe2b8, 0xfff1d6, 2.2, 1.3], [0.55, 0x6f9ee0, 0xffd29a, 0xffe0b0, 2.0, 1.2], [0.78, 0x6a6aa8, 0xff9a5a, 0xffa060, 1.6, 0.95], [0.92, 0x3a3a78, 0xd8505a, 0xff7040, 0.9, 0.6], [1.0, 0x141a3a, 0x40306a, 0x8a60a0, 0.25, 0.35], [1.2, 0x0a1028, 0x1c2350, 0x6070b0, 0.18, 0.3]];
let skyPaintT = -1;
function lightFor(k) {
  let a = SKY[0], b = SKY[SKY.length - 1]; for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = clamp((k - a[0]) / ((b[0] - a[0]) || 1), 0, 1);
  cSkyTop.set(a[1]).lerp(tmpC.set(b[1]), t); cSkyLow.set(a[2]).lerp(tmpC.set(b[2]), t);
  if (Math.abs(k - skyPaintT) > 0.004) { sky.paint(cSkyTop, cSkyLow); skyPaintT = k; }
  scene.fog.color.copy(cSkyLow); sun.color.set(a[3]).lerp(tmpC.set(b[3]), t); sun.intensity = lerp(a[4], b[4], t); hemi.intensity = lerp(a[5], b[5], t);
  const az = lerp(2.3, 3.0, clamp(k, 0, 1)), el = lerp(1.0, 0.12, clamp(k, 0, 1));
  sun.position.set(W / 2 + Math.cos(az) * Math.cos(el) * 70, Math.sin(el) * 70 + 4, H / 2 + Math.sin(az) * Math.cos(el) * 70);
  sunDisc.position.set(W / 2 + Math.cos(az) * Math.cos(el) * 260, Math.sin(el) * 230 - 10, H / 2 + Math.sin(az) * Math.cos(el) * 260); sunDisc.material.color.copy(sun.color);
  sunDisc.visible = k < 1.0; hemi.groundColor.set(0x5a7a3a).multiplyScalar(lerp(1, 0.4, clamp(k, 0, 1)));
}

/* ───── 한 걸음 ───── */
function update(dt) {
  S.t += dt; windU.uTime.value += dt;
  sayTick(dt); ringsUpdate(dt);
  { const p = riverG.attributes.position; for (let i = 0; i < p.count; i++) { const x = riverBase[i * 3], z = riverBase[i * 3 + 2]; p.setY(i, Math.sin(x * 0.3 + S.t * 1.1) * 0.12 + Math.cos(z * 0.5 + S.t * 0.8) * 0.08); } p.needsUpdate = true; }
  /* 불 · 연기 · 횃불 */
  const fk = S.fuel > 0 ? 0.35 + S.fuel * 0.85 : 0; fire.scale.setScalar(Math.max(0.01, fk * (0.9 + Math.sin(S.t * 13) * 0.08))); fire.rotation.y = S.t * 2; fire.visible = fk > 0;
  if (S.mode !== 'camp') { fireL.intensity = fk * 12 * (0.85 + Math.sin(S.t * 21) * 0.15) * (0.4 + S.sun); fireGlow.visible = fk > 0; fireGlow.material.opacity = clamp(fk, 0, 1) * (0.3 + S.sun * 0.7); }
  for (const s of smoke) { const k = (s.userData.k + S.t * 0.09) % 1; s.position.set(FIRE[0] + Math.sin(k * 7 + s.userData.k * 9) * 0.6 * k + S.wind[0] * k * 3, 1.2 + k * 9, FIRE[1] + S.wind[1] * k * 3); s.scale.setScalar(0.5 + k * 1.6); s.material.opacity = (1 - k) * 0.5 * clamp(S.fuel * 3, 0, 1); s.rotation.y = k * 3; }
  for (const t of torchmen) { const fl = t.mesh.userData.flame; if (fl) { fl.scale.setScalar(0.9 + Math.sin(S.t * 15 + t.hx) * 0.12); fl.rotation.y = S.t * 3; } }
  torchGlows.forEach((g, i) => { g.material.opacity = 0.75 + Math.sin(S.t * 3 + i) * 0.2; g.position.set(torchmen[i].mesh.position.x + 0.5, 2.9, torchmen[i].mesh.position.z + 0.25); });
  for (const c of chips) if (c.t < 1.5) { c.t += dt; c.vy -= 9 * dt; c.m.position.x += c.vx * dt; c.m.position.y = Math.max(0.05, c.m.position.y + c.vy * dt); c.m.position.z += c.vz * dt; c.m.rotation.x += dt * 8; if (c.t >= 1.5) c.m.visible = false; }

  if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.4) { S.mode = 'play'; say('해가 기운다 — 사슴 떼를 골짜기 횃불 사이로', null, 3.2); } stepDeer(dt); return; }
  if (S.mode === 'title') { stepDeer(dt); return; }
  if (S.mode === 'win' || S.mode === 'dusk') {
    S.endT += dt; stepDeer(dt); stepWolves(dt); stepComps(dt);
    if (S.mode === 'win') torchmen.forEach((t, i) => { const tx = i ? 72.6 : 67.8; t.x = lerp(t.x, tx, dt * 1.2); t.z = lerp(t.z, 16.8, dt * 1.2); t.mesh.position.set(t.x, 0, t.z); walkAnim(t.mesh, S.t * 9, true); });
    if (S.mode === 'dusk') { S.sun = Math.min(1.12, S.sun + dt * 0.04); lightFor(S.sun); }
    if (S.endT > 2.6 && S.endT - dt <= 2.6) $('fade').style.opacity = 1;
    if (S.endT > 4.0) { campScene(); }
    return;
  }
  if (S.mode === 'camp') { S.endT += dt; fireL.intensity = S.fuel > 0 ? 26 * (0.85 + Math.sin(S.t * 21) * 0.15) : 0; if (S.endT > 2.2 && !S.shown) { S.shown = true; endScreen(); } return; }
  if (S.mode !== 'play') return;
  S.shown = false;

  /* 해 */
  S.sun = S.t / DAY; $('sun').querySelector('i').style.width = clamp(S.sun, 0, 1) * 100 + '%'; lightFor(S.sun);
  if (S.sun > 0.8) say('해가 산마루에 걸렸다 — 서두르자!', 'late', 2.8);
  if (S.sun >= 1) return finish(false);
  /* 불: 저절로 사그라든다 */
  if (!S.fireOut) { S.fuel = Math.max(0, S.fuel - dt / 120); if (S.fuel < 0.22 && S.fuel > 0) say('불이 사그라든다 — 나뭇가지를 넣자', 'low', 3); if (S.fuel <= 0) { S.fireOut = true; hud(); say('불씨가 꺼졌다…', null, 2.4); } }
  S.shoutCD -= dt;
  S.leakT = (S.leakT || 0) - dt; if (S.leakT <= 0) { S.leakT = 10 + rnd() * 6; S.herdSide = rnd() < 0.5 ? -1 : 1; }

  /* 나 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 4.7 : 3.0) * (back ? 0.6 : 1); { const [nx, nz] = collideRects(SOLID, S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); } if (S.view !== 2) S.pdir = Math.atan2(iz, ix);
    S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; noise(0.05, S.running ? 0.12 : 0.05, 300); } }
  pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving);
  pRing.position.set(S.px, 0.11, S.pz);

  /* 줍기 */
  for (const g of S.ground) if (g.on && dist(S.px, S.pz, g.x, g.z) < 1.1) { g.on = false; g.m.visible = false; S.stones++; hud(); SFX.pick(); say(S.axe ? '돌멩이 — 늑대를 누르면 던진다' : '돌멩이 — 둘이면 돌 받침에서 주먹도끼를 깬다', 'stone', 3); }
  for (const g of S.sticksOn) if (g.on && S.sticks < 3 && dist(S.px, S.pz, g.x, g.z) < 1.2) { g.on = false; g.m.visible = false; S.sticks++; hud(); SFX.pick(); say('나뭇가지 — 모닥불에 넣으면 불이 산다', 'stick', 2.6); }
  for (const b of bushes) if (b.on && dist(S.px, S.pz, b.x, b.z) < 1.9) { b.on = false; b.b.visible = false; S.food++; hud(); SFX.pick(); ring(b.x, b.z, 2, 0xff6a80); say(S.food >= 3 ? '먹을 것을 넉넉히 모았다 — 사냥이 안 돼도 굶지 않는다' : '열매를 땄다', null, 2.2); if (S.food === 3) SFX.done(); }
  let digging = null; for (const r of roots) if (r.on && dist(S.px, S.pz, r.x, r.z) < 1.4) digging = r;
  if (digging && !S.moving) { S.digT += dt; say('뿌리 — 가만히 서서 캔다', 'dig', 2); if (S.digT > 1.3) { digging.on = false; digging.g.visible = false; S.digT = 0; S.food++; hud(); SFX.pick(); say(S.food >= 3 ? '먹을 것을 넉넉히 모았다 — 사냥이 안 돼도 굶지 않는다' : '뿌리를 캤다', null, 2.2); if (S.food === 3) SFX.done(); } } else if (!digging) S.digT = 0;
  overBar($('work'), cam, S.px, 2.6, S.pz, digging && S.digT > 0 ? S.digT / 1.3 : null);
  /* 모닥불 */
  const dF = dist(S.px, S.pz, FIRE[0], FIRE[1]);
  if (dF < 2.8 && S.sticks > 0 && !S.fireOut) { S.fuel = Math.min(1, S.fuel + 0.32 * S.sticks); S.sticks = 0; S.fed = true; hud(); SFX.crack(); SFX.done(); ring(FIRE[0], FIRE[1], 3, 0xffa040); say('불이 확 살아났다 — 불이 있으면 밤에 짐승이 못 온다', null, 2.8); }
  else if (dF < 6 && !S.fed && !S.fireOut) say('모닥불 — 저절로 사그라든다. 숲가의 나뭇가지를 넣자', 'firenear', 3.2);
  /* 돌 받침 */
  const dA = dist(S.px, S.pz, ANVIL[0], ANVIL[1]), kOn = nearAnvil();
  kRing.visible = kMark.visible = kOn; $('bAct').textContent = kOn ? '치기' : '소리';
  if (kOn) { S.kPhase = (S.kPhase + dt / 1.1) % 1; kRing.position.set(ANVIL[0], 0.76, ANVIL[1]); kRing.scale.setScalar(Math.max(0.05, 2.3 - 1.9 * S.kPhase)); const hot = Math.abs(S.kPhase - 0.9) < 0.13; kRing.material.color.set(hot ? 0xffcf4d : 0xffffff);
    if (S.kPhase > 0.88 && !S.kTick) { S.kTick = true; SFX.tick(); } if (S.kPhase < 0.5) S.kTick = false;
    say(ctl.isTouch ? '돌 받침 — 흰 고리가 노란 고리에 닿을 때 「치기」' : '돌 받침 — 흰 고리가 노란 고리에 닿을 때 스페이스', 'knap', 3.4); }
  else if (dA < 5 && !S.axe) say(S.stones >= 2 ? '돌 받침 — 곁에 서면 깬다' : '돌 받침 — 강가에서 돌 두 개를 주워 오자', 'anvil' + (S.stones >= 2 ? 2 : 1), 3);
  /* 돌 던지기 */
  if (S.fly) { const f = S.fly; f.t += dt / 0.5; const k = Math.min(1, f.t); flying.position.set(lerp(f.x0, f.x1, k), 0.9 + Math.sin(k * Math.PI) * 3, lerp(f.z0, f.z1, k));
    if (k >= 1) { flying.visible = false; S.fly = null; SFX.thud(); ring(f.x1, f.z1, 3.5, 0xffffff); const w = f.w; if (w.state !== 'gone' && w.state !== 'gone2' && dist(w.x, w.z, f.x1, f.z1) < 3.4) { w.hits++; w.state = 'flee'; w.t = 0; SFX.yelp(); say(w.hits >= 2 ? '늑대가 꼬리를 감고 숲으로 사라졌다' : '깨갱 — 늑대가 물러났다', null, 2.4); } else say('빗나갔다!', null, 1.2); } }

  stepComps(dt); stepWolves(dt); stepDeer(dt);
  if (S.inside >= NEED) return finish(true);
  if (S.scatters === 1) say('흩어진 사슴은 다시 모인다 — 천천히, 걸어서', 'regroup', 3);

  /* 조임: 해 · 놀람 · 늑대 */
  const wolfOn = wolves.some((w) => w.state === 'harass' || w.state === 'come'), late = clamp((S.sun - 0.7) * 3.3, 0, 1);
  const tension = clamp(Math.max(S.nerve, late, wolfOn ? 0.55 : 0), 0, 1);
  S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.36, tension); SFX.beat(0.08 + tension * 0.3); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${late > S.nerve ? '120,30,60' : '200,40,20'},${tension * 0.5})`;
}
const v3 = new THREE.Vector3(), v3b = new THREE.Vector3();
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.8, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(MOUTH[0] - 8, START[0] + 6, e), lerp(12, 38, e), lerp(MOUTH[1] + 20, START[1] + 26, e)); cam.lookAt(lerp(MOUTH[0], START[0] + 5, e), lerp(2, 0, e), lerp(MOUTH[1], START[1] - 6, e)); cam.fov = 44; cam.updateProjectionMatrix(); }
  else if (S.mode === 'win' || S.mode === 'dusk') { v3.set(MOUTH[0] - 6, 22, MOUTH[1] + 26); cam.position.lerp(v3, 0.03); cam.lookAt(MOUTH[0], 1, MOUTH[1] - 2); }
  else if (S.mode === 'camp') { cam.position.set(FIRE[0] + 6.4, 4.6, FIRE[1] + 7.6); cam.lookAt(FIRE[0], 1.0, FIRE[1]); if (cam.fov !== 50) { cam.fov = 50; cam.updateProjectionMatrix(); } }
  else followCam(cam, S, { W, H, map: { h: [104, 190], z: 12, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  edgeGoal($('goal'), cam, goalPos, S.mode === 'play', 0.8);
  /* 돌 받침 고리(화면 위 표시) */
  const kn = $('knap'); if (S.mode === 'play' && nearAnvil()) { const q = v3b.set(ANVIL[0], 0.8, ANVIL[1]).project(cam); kn.style.display = 'block'; kn.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; kn.style.top = ((1 - q.y) / 2) * innerHeight - 70 + 'px'; const r = Math.max(8, 84 - 62 * S.kPhase); const i = kn.querySelector('i'); i.style.width = i.style.height = r + 'px'; i.style.borderColor = Math.abs(S.kPhase - 0.9) < 0.13 ? '#ffcf4d' : '#fff'; } else kn.style.display = 'none';
}

resetDay(); lightFor(0); stepDeer(0.01);
pMesh.position.set(S.px, 0, S.pz); pRing.position.set(S.px, 0.11, S.pz);
for (const c of comps) { c.mesh.position.set(c.x, 0, c.z); }
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.howl(); };
runLoop(update, view, () => renderer.render(scene, cam));
window.__scene = { S, deer, comps, wolves, update, keys, ctl,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  press: pressGround, shout, strike, smells,
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz); ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode, x: +S.px.toFixed(1), z: +S.pz.toFixed(1), inside: S.inside, nerve: +S.nerve.toFixed(2), scatters: S.scatters }; },
  herd() { return { x: S.hx, z: S.hz, n: deer.filter((d) => !d.inside && !d.lost).length }; } };
