/* 케이월드 · 첫 겨울 — 신석기 한 장면(S02, 2026-11-17). 본보기 = 그믐밤, 공통 부품 = ../scene/kit.js.
   목표는 하나(우리 움집 앞 토기 셋 — 채울수록 밝아진다)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 첫눈까지 못 채우면 다음 해 밭이 작아진다.
   흐름: 밭에서 가만히 서면 이삭을 벤다(한 번에 셋까지) → 건조대에 널면 마른다 → 마른 이삭을 갈판에서 박자 맞춰 간다 → 토기에 붓는다.
   조여 오는 것: 철(잎 색·하늘, 끝에 첫눈) · 멧돼지(밭을 파헤침) · 비(덮지 않으면 널어 둔 이삭이 썩음) · 새 떼(널어 둔 이삭을 쪼아 먹음).
   좌표: x 동쪽(+), z 남쪽(+). 강은 남쪽(z 52~), 밭은 동쪽, 숲은 북쪽·동쪽. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, canvasTex, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, groundAt, runLoop, loadArt, ART, art, artInst } from '../scene/kit.js?v=3';
await loadArt('people');   /* 블렌더로 만든 모델(사람·자연·집·소품) */

const W = 80, H = 60;
const BX = [4, 76], BZ = [6, 50];
const SEASON = 320;

/* ───── 무대 ───── */
const OURS = [30, 19], HOUSES = [[30, 19, 3.3], [18.5, 14.5, 3.0], [42, 12.5, 3.0]];
const POTS = [[27.6, 25.2], [30, 25.6], [32.4, 25.2], [34.8, 24.6]];   /* 넷째는 구워야 생긴다 */
const RACK = [37.5, 28.5], MAT = [40.6, 28.8], GRIND = [24.6, 28.6], HEARTH = [20.5, 30.5], POTTER = [17.4, 33];
const CLAY = [16, 48.6], WEIGHTS = [33.5, 48.8], NET = [46, 49.4];
const FIELD = [47, 19, 69, 40], COLS = 6, ROWS = 4;
const FIELD_BY_YEAR = [24, 18, 13];
const BOAR0 = [76, 13], DOG0 = [9, 25];
const SOLID = [];
for (const [x, z, r] of HOUSES) SOLID.push([x - r * 0.8, z - r * 0.8, x + r * 0.8, z + r * 0.8, 3.4, 'house']);
SOLID.push([RACK[0] - 1.8, RACK[1] - 0.25, RACK[0] + 1.8, RACK[1] + 0.25, 1.6, 'rack']);
const TREES_IN = [[12, 40, 2.2], [36, 38, 2.4], [58, 46, 2.0], [8, 12, 2.4], [52, 10, 2.6], [70, 46, 2.2]];
for (const [x, z] of TREES_IN) SOLID.push([x - 0.5, z - 0.5, x + 0.5, z + 0.5, 3, 'tree']);

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xf2d9b0, 80, 220], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x6a7a3a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff1d6, intensity: 2.1, box: [48, 36], far: 160, pos: [W / 2 - 34, 50, H / 2 + 30], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261118);
const sky = skyDome(scene, rnd, { top: 0x78aee8, low: 0xffe6c0 });
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* 땅 — 철 따라 풀빛이 바래고, 첫눈에 하얘진다 */
const ground = flat(-60, -30, W + 60, H + 10, 0x86c25a, 0);
const groundC0 = new THREE.Color(0x86c25a), groundC1 = new THREE.Color(0xc8b26a), groundC2 = new THREE.Color(0xeef3f8);
const sand = flat(0, 46.5, W, 52.2, 0xe2cc98, 0.03);
flat(-60, 52, W + 60, H + 60, 0x3d8fd0, 0.05);
const soil = flat(44, 17, 72, 42, 0x9a7a4a, 0.03);                         /* 밭흙 */
const yard = flat(16, 22, 44, 36, 0xcdb27e, 0.035);                        /* 마을 마당 */
const whiten = [[sand, new THREE.Color(0xe2cc98)], [soil, new THREE.Color(0x9a7a4a)], [yard, new THREE.Color(0xcdb27e)]];
const tufts = []; for (let i = 0; i < 110; i++) { const x = 4 + rnd() * 72, z = 6 + rnd() * 40; if (inRect(x, z, [43, 16, 73, 43]) || inRect(x, z, [15, 21, 45, 37])) continue; const t = box(0.8 + rnd() * 1.4, 0.1, 0.8 + rnd() * 1.4, 0x9ad466); t.castShadow = false; at(t, x, 0.05, z); scene.add(t); tufts.push(t); }
const riverG = new THREE.PlaneGeometry(W + 140, 40, 60, 10); riverG.rotateX(-Math.PI / 2);
const river = new THREE.Mesh(riverG, new THREE.MeshStandardMaterial({ color: 0x3a8ad8, roughness: 0.25, metalness: 0.15, flatShading: true })); river.position.set(W / 2, 0.02, 72); scene.add(river);
const riverBase = riverG.attributes.position.array.slice();
flat(-60, 92, W + 60, 130, 0x6a9a4a, 0.3);

/* 움집: 둥글게 판 바닥 위에 이엉 지붕 */
function pithouse([x, z, r], ours) { const P = [];
  P.push(at(cyl(r, r + 0.2, 0.5, 0x8a6a40, 12), x, 0.25, z));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(r + 0.5, 3.6, 10), M(ours ? 0xd9a84a : 0xc89a48)); roof.position.set(x, 2.2, z); roof.castShadow = roof.receiveShadow = true; P.push(roof);
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.8, 8), M(0x8a6a3a)); top.position.set(x, 4.2, z); P.push(top);
  for (let k = 0; k < 5; k++) { const s = cyl(0.05, 0.05, 1.1, 0x6a4526, 5); s.position.set(x + Math.cos(k * 1.26) * 0.25, 4.6, z + Math.sin(k * 1.26) * 0.25); s.rotation.set(Math.sin(k) * 0.4, 0, Math.cos(k) * 0.4); P.push(s); }
  P.push(at(box(1.3, 1.5, 1.4, 0x8a6a40), x, 0.75, z + r - 0.2), at(box(0.8, 1.1, 0.1, 0x2a1a0e), x, 0.6, z + r + 0.52));
  group([x - r, z - r, x + r, z + r], P); }
HOUSES.forEach((h, i) => pithouse(h, i === 0));
const doorGlow = glowSprite(scene, 'rgba(255,200,120,.95)', 'rgba(255,140,50,0)', 3.4); doorGlow.position.set(OURS[0], 0.9, OURS[1] + 3.9); doorGlow.material.opacity = 0;
/* 숲(철 따라 잎 색이 바뀐다) */
const leafC = [new THREE.Color(0x3aa866), new THREE.Color(0xe6b43a), new THREE.Color(0xd8642a), new THREE.Color(0x8a6a4a)];
const forest = (() => { const pts = []; for (let i = 0; i < 100; i++) { let x, z; const k = rnd(); if (k < 0.55) { x = rnd() * 80; z = -6 + rnd() * 11; } else { x = 74 + rnd() * 20; z = rnd() * 50; } pts.push([x, z, 0.8 + rnd() * 0.5, rnd()]); }
  for (let i = 0; i < 26; i++) pts.push([-30 + rnd() * 140, -40 + rnd() * 30, 1 + rnd() * 0.6, rnd()]);
  for (const [x, z, s] of TREES_IN) pts.push([x, z, s / 2.2, rnd()]);
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.24, 0.36, 2.4, 6), M(0x7a4f2b), pts.length); trunk.castShadow = true;
  const layers = [0, 1, 2].map(() => { const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1.1, 1), M(0xffffff), pts.length); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; });
  const o = new THREE.Object3D();
  pts.forEach(([x, z, s], i) => { o.position.set(x, 1.2 * s, z); o.rotation.set(0, 0, 0); o.scale.set(s, s, s); o.updateMatrix(); trunk.setMatrixAt(i, o.matrix); });
  scene.add(trunk);
  function paint(k) { const c = new THREE.Color(); pts.forEach(([x, z, s, r], i) => { const kk = clamp(k * 3 - r * 0.6, 0, 2.999), a = Math.floor(kk); c.copy(leafC[a]).lerp(leafC[a + 1], kk - a); const bare = clamp((k - 0.7 - r * 0.15) * 4, 0, 0.75);
    for (let L = 0; L < 3; L++) { const rr = (3.6 - L * 0.8) * s * (1 - bare); o.position.set(x, (2.7 + L * 0.95) * s, z); o.rotation.set(0, L * 0.5 + x, 0); o.scale.set(Math.max(0.01, rr), s * (1 - bare * 0.6), Math.max(0.01, rr)); o.updateMatrix(); layers[L].setMatrixAt(i, o.matrix); layers[L].setColorAt(i, c); } });
    for (const m of layers) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; } }
  return { paint }; })();

/* 밭: 조 이삭 — 칸마다 줄기 몇 대(인스턴스 한 묶음) */
const PW = (FIELD[2] - FIELD[0]) / COLS, PH = (FIELD[3] - FIELD[1]) / ROWS, PER = 10;
const stalkIM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 1.3, 0.1).translate(0, 0.65, 0), M(0xa8b85a), COLS * ROWS * PER); stalkIM.castShadow = true;
const headIM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.45, 0.22), M(0xe8b84a, { emissive: 0x2a1a00 }), COLS * ROWS * PER); headIM.castShadow = true;
scene.add(stalkIM, headIM);
const patches = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const x0 = FIELD[0] + c * PW, z0 = FIELD[1] + r * PH; const sp = []; for (let k = 0; k < PER; k++) sp.push([x0 + 0.5 + rnd() * (PW - 1), z0 + 0.5 + rnd() * (PH - 1), rnd() * 6, 0.8 + rnd() * 0.5]); patches.push({ i: patches.length, c, r, x0, z0, x: x0 + PW / 2, z: z0 + PH / 2, st: 'ripe', sp, used: true }); }
const _o = new THREE.Object3D();
function drawPatch(p) { p.sp.forEach(([x, z, a, s], k) => { const i = p.i * PER + k; const st = p.used ? p.st : 'none';
  _o.position.set(x, 0, z); _o.rotation.set(st === 'ruined' ? 1.35 : 0, a, st === 'ruined' ? 0.3 : 0); _o.scale.set(1, st === 'ripe' ? s : st === 'none' ? 0.001 : 0.18, 1); _o.updateMatrix(); stalkIM.setMatrixAt(i, _o.matrix);
  _o.position.set(x + (st === 'ruined' ? Math.sin(a) * 1.1 : 0), st === 'ripe' ? 1.3 * s + 0.05 : 0.1, z); _o.rotation.set(0.3, a, 0.2); _o.scale.setScalar(st === 'ripe' ? 1 : 0.001); _o.updateMatrix(); headIM.setMatrixAt(i, _o.matrix); });
  stalkIM.instanceMatrix.needsUpdate = true; headIM.instanceMatrix.needsUpdate = true; }
/* 건조대 · 거적 · 갈판 · 화덕 · 토기 */
scene.add(at(cyl(0.08, 0.08, 1.6, 0x6a4526, 5), RACK[0] - 1.7, 0.8, RACK[1]), at(cyl(0.08, 0.08, 1.6, 0x6a4526, 5), RACK[0] + 1.7, 0.8, RACK[1]), at(box(3.6, 0.08, 0.08, 0x6a4526), RACK[0], 1.5, RACK[1]), at(box(3.6, 0.06, 0.06, 0x6a4526), RACK[0], 1.0, RACK[1]));
const rackSlots = [0, 1, 2, 3].map((k) => { const m = box(0.5, 0.75, 0.3, 0x9cc25a); at(m, RACK[0] - 1.2 + k * 0.8, 1.15, RACK[1]); m.visible = false; scene.add(m); return m; });
const mat = box(4.0, 0.12, 1.3, 0x9a7a4a); mat.rotation.z = 0; at(mat, RACK[0], 1.62, RACK[1]); mat.visible = false; scene.add(mat);
const matPile = new THREE.Group(); for (let k = 0; k < 3; k++) matPile.add(at(box(1.4, 0.12, 1.1, k % 2 ? 0x9a7a4a : 0xb08a52), 0, 0.08 + k * 0.13, 0)); matPile.position.set(MAT[0], 0, MAT[1]); scene.add(matPile);
const grindStone = new THREE.Group(); grindStone.add(at(box(1.6, 0.25, 0.9, 0x8d877c), 0, 0.15, 0)); const roller = at(box(0.9, 0.22, 0.26, 0xa9a396), 0, 0.4, 0); grindStone.add(roller); grindStone.position.set(GRIND[0], 0, GRIND[1]); grindStone.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(grindStone);
for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.28, s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 0), M(0x8a8478)); at(s, HEARTH[0] + Math.cos(a) * 0.9, 0.15, HEARTH[1] + Math.sin(a) * 0.9); s.castShadow = true; scene.add(s); }
const fire = new THREE.Group(); for (let k = 0; k < 3; k++) fire.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.4 - k * 0.1, 0.8 + k * 0.2, 5), new THREE.MeshBasicMaterial({ color: [0xff5a2a, 0xffa23a, 0xffe07a][k] })), (k - 1) * 0.18, 0.5 + k * 0.08, 0)); fire.position.set(HEARTH[0], 0, HEARTH[1]); scene.add(fire);
const fireL = new THREE.PointLight(0xff8a3a, 8, 14, 1.6); fireL.position.set(HEARTH[0], 1.6, HEARTH[1]); scene.add(fireL);
const potterMat = box(1.6, 0.06, 1.2, 0xb08a52); at(potterMat, POTTER[0], 0.05, POTTER[1]); scene.add(potterMat);
/* 빗살무늬토기: 뾰족한 밑 · 비스듬한 빗금 */
const combTex = canvasTex(64, 64, (g) => { g.fillStyle = '#b4784a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#6a3a1e'; g.lineWidth = 3; for (let r = 0; r < 4; r++) for (let k = -2; k < 10; k++) { g.beginPath(); g.moveTo(k * 8, r * 16 + 2); g.lineTo(k * 8 + 6, r * 16 + 13); g.stroke(); } });
function potMesh(c = 0xffffff) { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.34, 0.8, 9), new THREE.MeshStandardMaterial({ map: combTex, color: c, roughness: 0.9, flatShading: true })); body.position.y = 0.72; const tip = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.42, 9), new THREE.MeshStandardMaterial({ map: combTex, color: c, roughness: 0.9, flatShading: true })); tip.rotation.x = Math.PI; tip.position.y = 0.11;
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 9), M(0xf2d06a, { emissive: 0x6a4a00 })); fill.position.y = 0.4; fill.visible = false; g.add(body, tip, fill); g.userData = { fill, body }; g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g; }
const pots = POTS.map(([x, z], i) => { const m = potMesh(); m.position.set(x, 0, z); const gl = glowSprite(scene, 'rgba(255,224,140,.95)', 'rgba(255,170,60,0)', 3); gl.position.set(x, 1.2, z); gl.material.opacity = 0; return { m, gl, n: 0, on: i < 3 }; });
const newPot = potMesh(0xd8b49a); newPot.visible = false;
const goalPos = new THREE.Vector3(30, 1.4, 25.4);
/* 강가: 흙 · 그물추 · 그물 */
const clayMound = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), M(0x9a6a48)); clayMound.scale.set(1.4, 0.4, 1); at(clayMound, CLAY[0], 0.2, CLAY[1]); scene.add(clayMound);
const weights = new THREE.Group(); for (let k = 0; k < 4; k++) weights.add(at(box(0.26, 0.18, 0.2, 0xa9a396, { emissive: 0x2a2620 }), (k - 1.5) * 0.4, 0.1, (k % 2) * 0.2)); weights.position.set(WEIGHTS[0], 0, WEIGHTS[1]); scene.add(weights);
const netFloats = new THREE.Group(); for (let k = 0; k < 7; k++) netFloats.add(at(box(0.32, 0.2, 0.32, 0xe8d8a8), k * 1.1 - 3.3, 0.18, 0)); netFloats.position.set(NET[0], 0, NET[1] + 5.5); netFloats.visible = false; scene.add(netFloats);
const netPole = at(cyl(0.07, 0.08, 1.8, 0x6a4526, 5), NET[0] - 3.8, 0.9, NET[1] + 2.4); scene.add(netPole);
const fishJump = box(0.5, 0.2, 0.16, 0xc8d4e0); fishJump.visible = false; scene.add(fishJump);

/* 사람 · 개 · 멧돼지 · 새 */
const SKIN = 0xf0c48e;
const pMesh = person({ shirt: 0xb08a5a, pants: 0x7a5a3a, hat: 'hair', skin: SKIN });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const carryG = new THREE.Group(); scene.add(carryG);
const carryMeshes = [0, 1, 2].map((k) => { const m = box(0.36, 0.5, 0.24, 0xe8b84a); m.visible = false; carryG.add(m); return m; });
const villagers = [[22.5, 31, 0.9], [44, 16.5, -2.2], [14, 18, 0.4]].map(([x, z, r], i) => { const m = person({ shirt: [0xa87a4a, 0x9a8a5a, 0xb88a5a][i], pants: 0x6a4a2a, hat: 'hair', skin: SKIN, hairC: i === 1 ? 0x4a3020 : 0x2b2118 }); m.position.set(x, 0, z); m.rotation.y = r; return { m, x, z, hx: x, hz: z }; });
function quad(c, size = 1) { const g = new THREE.Group(), u = { legs: [] };
  g.add(at(box(1.0 * size, 0.46 * size, 0.42 * size, c), 0, 0.62 * size, 0), at(box(0.42 * size, 0.4 * size, 0.38 * size, c), 0.62 * size, 0.82 * size, 0));
  for (const [lx, lz] of [[0.34, 0.14], [0.34, -0.14], [-0.34, 0.14], [-0.34, -0.14]]) { const l = new THREE.Group(); l.position.set(lx * size, 0.42 * size, lz * size); l.add(at(box(0.12 * size, 0.42 * size, 0.12 * size, c), 0, -0.21 * size, 0)); g.add(l); u.legs.push(l); }
  g.userData = u; g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g; }
const dogM = quad(0xc89048, 0.9); dogM.add(at(box(0.1, 0.18, 0.1, 0x8a5a2b), 0.6, 1.0, 0.12), at(box(0.1, 0.18, 0.1, 0x8a5a2b), 0.6, 1.0, -0.12), at(box(0.34, 0.1, 0.1, 0xc89048), -0.58, 0.72, 0));
const dogTail = dogM.children[dogM.children.length - 1];
const boarM = quad(0x5a4436, 1.25); boarM.add(at(box(0.24, 0.2, 0.3, 0x3a2a20), 1.02, 0.9, 0), at(box(0.06, 0.16, 0.05, 0xf4ecd8), 1.08, 1.02, 0.16), at(box(0.06, 0.16, 0.05, 0xf4ecd8), 1.08, 1.02, -0.16), at(box(0.7, 0.14, 0.16, 0x3a2a20), 0.1, 1.24, 0)); boarM.visible = false;
const birds = Array.from({ length: 7 }, () => { const g = new THREE.Group(); g.add(at(box(0.3, 0.16, 0.18, 0x3a3a44), 0, 0, 0), at(box(0.08, 0.06, 0.5, 0x2a2a34), 0, 0.04, 0)); g.visible = false; scene.add(g); return g; });
const snow = (() => { const N = 900, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = rnd() * (W + 40) - 20; pos[i * 3 + 1] = rnd() * 30; pos[i * 3 + 2] = rnd() * (H + 30) - 10; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, transparent: true, opacity: 0 })); pts.frustumCulled = false; scene.add(pts); return { pts, pos, N }; })();

/* ───── 소리 ───── */
const SFX = {
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  cut: () => { noise(0.08, 0.3, 2400); noise(0.06, 0.2, 1800, 0.07); },
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  done: () => { tone(523, 523, 0.14, 'triangle', 0.16); tone(784, 784, 0.22, 'triangle', 0.16, 0.14); },
  grind: () => { noise(0.18, 0.35, 420); },
  thud: () => noise(0.1, 0.3, 260),
  tick: () => tone(1400, 1400, 0.04, 'square', 0.03),
  pour: () => { for (let i = 0; i < 5; i++) noise(0.05, 0.12, 3000 + i * 300, i * 0.05); tone(700, 900, 0.2, 'triangle', 0.08, 0.2); },
  shout: () => { tone(320, 420, 0.18, 'sawtooth', 0.14); tone(420, 300, 0.32, 'sawtooth', 0.12, 0.18); },
  grunt: () => { noise(0.2, 0.4, 220); tone(110, 80, 0.25, 'sawtooth', 0.1); },
  bark: () => { noise(0.13, 0.45, 700); noise(0.13, 0.45, 620, 0.2); },
  chirp: () => { for (let i = 0; i < 4; i++) tone(2400 + i * 200, 3000, 0.06, 'sine', 0.05, i * 0.09); },
  flap: () => { for (let i = 0; i < 6; i++) noise(0.04, 0.15, 900, i * 0.05); },
  rain: () => noise(0.9, 0.06, 5000),
  rot: () => tone(300, 160, 0.4, 'sawtooth', 0.08),
  splash: () => { noise(0.2, 0.3, 1200); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  snow: () => { [1047, 1319, 1568].forEach((f, i) => tone(f, f, 0.8, 'sine', 0.06, i * 0.3)); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', year: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, sea: 0, px: 30, pz: 32, pdir: -Math.PI / 2, moving: false, running: false, said: {}, sayT: 0,
  carry: [], rack: [], covered: false, potsFilled: 0, extra: 'none', strokes: 0, fireT: 0, dog: 'wild', dogX: DOG0[0], dogZ: DOG0[1], dogDir: 0, dogPh: 0, dogTX: 0, dogTZ: 0,
  net: 'none', netT: 0, fish: 0, boar: 'off', bx: BOAR0[0], bz: BOAR0[1], bDir: Math.PI, bT: 0, bPh: 0, bTarget: -1, bDig: 0, ruined: 0, bird: 'off', birdT: 0, birdX: 0, birdZ: 0, birdEat: 0, birdsEaten: 0,
  rain: 'none', rainT: 0, wetT: 0, rotted: 0, workT: 0, workKey: '', kPhase: 0, kTick: false, shoutCD: 0, beatT: 0, stepT: 0, matLock: false, endT: 0, shown: false, introT: 0, eaten: 0, harvested: 0, lostBoar: 0 };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 가만히 서면 베고·캐고·덮는다 · 「소리」(갈판·빚는 자리에서는 「치기」) · 땅을 누르면 개를 보낸다 · 「시점」 ⟲⟳';
const potsNeeded = () => 3;
const potCap = () => (S.extra === 'done' ? 4 : 3);

function hud() {
  const full = pots.slice(0, 3).filter((p) => p.n >= 3).length; const h = $('hPot'); h.textContent = '🏺 ' + full + ' / 3' + (S.extra === 'done' ? (pots[3].n >= 3 ? ' +1' : ' (+1)') : ''); h.className = 'pill' + (full ? ' got' : '');
  const icon = { ear: '🌾', dry: '🌾', grain: '🥣', clay: '🟤' }, cnt = {}; for (const c of S.carry) cnt[c] = (cnt[c] || 0) + 1;
  $('hCarry').textContent = S.carry.length ? Object.entries(cnt).map(([k, n]) => icon[k] + (k === 'ear' ? '이삭' : k === 'dry' ? '마른 이삭' : k === 'grain' ? '곡식' : '흙') + ' ' + n).join(' · ') + ` (${S.carry.length}/3)` : '손 비었음 (0/3)';
  const hc = $('hCover'); hc.style.display = S.covered ? '' : 'none'; hc.className = 'pill on';
  $('tPot').className = S.extra === 'done' ? 'on' : ''; $('tPot').textContent = S.extra === 'done' ? '🏺 빗살무늬토기 하나 더' : S.extra === 'firing' ? '🏺 화덕에서 굽는 중…' : '🏺 빗살무늬토기 굽기';
  $('tDog').className = S.dog === 'tame' ? 'on' : ''; $('tNet').className = S.fish ? 'on' : ''; $('tNet').textContent = S.fish ? '🐟 그물에 물고기' : S.net === 'set' ? '🐟 그물 쳐 둠 — 기다리기' : S.net === 'full' ? '🐟 그물을 걷자!' : '🐟 강에 그물 치기';
  carryMeshes.forEach((m, i) => { const c = S.carry[i]; m.visible = !!c; if (c) m.material.color.set(c === 'ear' ? 0x9cc25a : c === 'dry' ? 0xe8b84a : c === 'grain' ? 0xf2d06a : 0x9a6a48); });
  rackSlots.forEach((m, i) => { const b = S.rack[i]; m.visible = !!b; if (b) m.material.color.set(b.dry >= 1 ? 0xe8b84a : new THREE.Color(0x9cc25a).lerp(new THREE.Color(0xe8b84a), b.dry).getHex()); });
  mat.visible = S.covered;
  pots.forEach((p, i) => { p.m.visible = p.on; p.m.userData.fill.visible = p.n > 0; p.m.userData.fill.position.y = 0.4 + p.n * 0.22; p.m.userData.body.material.emissive.set(0x3a2200).multiplyScalar(p.n / 3); });
}
function resetYear() {
  const n = FIELD_BY_YEAR[Math.min(S.year - 1, FIELD_BY_YEAR.length - 1)];
  patches.slice().sort((a, b) => a.c - b.c || a.r - b.r).forEach((p, k) => { p.used = k < n; p.st = 'ripe'; }); /* 서쪽(마을 쪽) 칸부터 남긴다 */
  patches.forEach(drawPatch);
  Object.assign(S, { t: 0, sea: 0, px: 30, pz: 32, pdir: -Math.PI / 2, carry: [], rack: [], covered: false, strokes: 0, net: 'none', netT: 0, fish: 0, boar: 'off', bx: BOAR0[0], bz: BOAR0[1], bT: 0, bTarget: -1, bDig: 0, ruined: 0, bird: 'off', birdT: 0, birdEat: 0, birdsEaten: 0, rain: 'none', rainT: 0, wetT: 0, rotted: 0, workT: 0, endT: 0, shown: false, eaten: 0, harvested: 0, lostBoar: 0, matLock: false });
  if (S.extra !== 'done') { S.extra = 'none'; newPot.visible = false; }
  pRing.visible = true; carryG.visible = true;
  pots.forEach((p, i) => { p.n = 0; p.on = i < 3 || S.extra === 'done'; p.gl.material.opacity = 0; p.gl.visible = true; p.m.position.set(POTS[i][0], 0, POTS[i][1]); });
  if (S.dog !== 'tame') { S.dogX = DOG0[0]; S.dogZ = DOG0[1]; } else { S.dogX = 31; S.dogZ = 33; }
  weights.visible = true; netFloats.visible = false; boarM.visible = false; birds.forEach((b) => (b.visible = false)); snow.pts.material.opacity = 0; doorGlow.material.opacity = 0; $('fade').style.opacity = 0; $('rain').style.opacity = 0;
  villagers.forEach((v) => { v.x = v.hx; v.z = v.hz; v.m.position.set(v.x, 0, v.z); });
  lightFor(0); hud();
}

/* ───── 입력 ───── */
function context() {
  if (S.carry.includes('dry') && dist(S.px, S.pz, GRIND[0], GRIND[1]) < 2.3) return 'grind';
  if (S.carry.includes('clay') && S.extra === 'none' && dist(S.px, S.pz, POTTER[0], POTTER[1]) < 2.2) return 'shape';
  return null;
}
function act() {
  if (S.mode !== 'play') return;
  const c = context(); if (c) return strike(c);
  if (S.shoutCD > 0) return; S.shoutCD = 1.2; SFX.shout(); ring(S.px, S.pz, 12, 0xffe2a0);
  let hit = false;
  if ((S.boar === 'come' || S.boar === 'dig') && dist(S.px, S.pz, S.bx, S.bz) < 11) { scareBoar('shout'); hit = true; }
  if (S.bird === 'eat' && dist(S.px, S.pz, RACK[0], RACK[1]) < 13) { scareBirds(); hit = true; }
  if (!hit) say('"훠이—!"', null, 1);
}
function strike(kind) {
  const ok = Math.abs(S.kPhase - 0.9) < 0.14;
  if (!ok) { SFX.thud(); say(kind === 'grind' ? '드륵 — 박자가 어긋났다. 고리가 작아질 때!' : '삐끗 — 고리가 작아질 때 긋자', null, 1.3); return; }
  if (kind === 'grind') { SFX.grind(); roller.position.x = roller.position.x > 0 ? -0.3 : 0.3; S.strokes++; ring(GRIND[0], GRIND[1], 1.8, 0xf2d06a);
    if (S.strokes >= 2) { S.strokes = 0; const i = S.carry.indexOf('dry'); S.carry[i] = 'grain'; SFX.done(); hud(); say(S.carry.includes('dry') ? '곡식 한 줌! — 하나 더 갈자' : '곡식 한 줌! — 토기에 붓자', null, 1.8); } else say('드르륵 — 한 번 더', null, 1); }
  else { SFX.cut(); S.strokes++; ring(POTTER[0], POTTER[1], 1.6, 0xd89a6a); newPot.visible = true; newPot.position.set(POTTER[0], 0, POTTER[1]); newPot.scale.setScalar(0.4 + S.strokes * 0.2);
    if (S.strokes >= 3) { S.strokes = 0; S.carry.splice(S.carry.indexOf('clay'), 1); S.extra = 'firing'; S.fireT = 0; newPot.scale.setScalar(1); newPot.position.set(HEARTH[0], 0.1, HEARTH[1]); SFX.done(); hud(); say('빗금을 그은 토기를 화덕에 올렸다 — 구워지길 기다리자', null, 2.8); }
    else say(['빗금 하나 — 빗살 무늬', '빗금 둘'][S.strokes - 1], null, 1.2); }
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) act(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });
canvas.addEventListener('pointerdown', (e) => { if (S.mode === 'intro') { S.introT = 99; return; } if (S.mode !== 'play') return; const hit = groundAt(cam, e.clientX, e.clientY); if (!hit) return;
  if (S.dog !== 'tame') return say('개를 길들이면 누른 곳으로 보낸다', 'dogcmd', 2);
  S.dogTX = clamp(hit[0], BX[0], BX[1]); S.dogTZ = clamp(hit[1], BZ[0], BZ[1]); S.dogSent = 6; ring(S.dogTX, S.dogTZ, 2, 0xffcf4d); SFX.bark(); });

/* ───── 짐승 · 새 · 비 ───── */
function scareBoar(why) { if (S.boar !== 'come' && S.boar !== 'dig') return; S.boar = 'flee'; S.bT = 0; SFX.grunt(); say(why === 'dog' ? '컹컹! 개가 멧돼지를 숲으로 쫓았다' : '멧돼지가 꽁무니를 빼고 숲으로 달아났다', null, 2.4); }
function scareBirds() { if (S.bird !== 'eat' && S.bird !== 'come') return; S.bird = 'leave'; S.birdT = 0; SFX.flap(); say('새 떼가 푸드득 날아갔다', null, 1.6); }
function stepBoar(dt) {
  const due = SEASON * 0.12;
  if (S.boar === 'off') { if (S.t > due) { S.boar = 'come'; boarM.visible = true; S.bx = BOAR0[0]; S.bz = BOAR0[1]; SFX.grunt(); say('꿀꿀— 멧돼지가 숲에서 나와 밭으로 간다!', null, 3); } return; }
  if (S.boar === 'gone') { S.bT += dt; if (S.bT > 28) { S.boar = 'off'; } return; }
  let tx = S.bx, tz = S.bz, sp = 0;
  if (S.boar === 'flee') { tx = BOAR0[0] + 4; tz = BOAR0[1] - 4; sp = 6; S.bT += dt; if (dist(S.bx, S.bz, tx, tz) < 1.5 || S.bT > 7) { S.boar = 'gone'; S.bT = 0; boarM.visible = false; } }
  else {
    if (S.bTarget < 0 || patches[S.bTarget].st !== 'ripe' || !patches[S.bTarget].used) { let best = -1, bd = 1e9; for (const p of patches) if (p.used && p.st === 'ripe') { const d = dist(S.bx, S.bz, p.x, p.z); if (d < bd) { bd = d; best = p.i; } } S.bTarget = best; S.bDig = 0; }
    if (S.bTarget < 0) { S.boar = 'flee'; return; }
    const p = patches[S.bTarget]; tx = p.x; tz = p.z;
    if (dist(S.bx, S.bz, tx, tz) < 1.2) { S.boar = 'dig'; S.bDig += dt; sp = 0; if (S.bDig > 1.5) { p.st = 'ruined'; drawPatch(p); S.ruined++; S.bTarget = -1; SFX.grunt(); ring(p.x, p.z, 2.5, 0xa05030); say('멧돼지가 밭을 파헤친다! — 다가가 소리치자', 'boardig', 2.6); } }
    else { S.boar = 'come'; sp = 3.8; }
    if (dist(S.px, S.pz, S.bx, S.bz) < 4.5) scareBoar('near');
    if (S.dog === 'tame' && dist(S.dogX, S.dogZ, S.bx, S.bz) < 2.6) scareBoar('dog');
  }
  const dx = tx - S.bx, dz = tz - S.bz, l = Math.hypot(dx, dz);
  if (l > 0.1 && sp > 0) { const st = Math.min(l, sp * dt); S.bx += dx / l * st; S.bz += dz / l * st; S.bDir = Math.atan2(dz, dx); }
  S.bPh += dt * (sp > 0 ? 12 : 4); boarM.position.set(S.bx, S.boar === 'dig' ? Math.abs(Math.sin(S.bPh)) * 0.08 : 0, S.bz); boarM.rotation.y = -S.bDir; boarM.rotation.z = S.boar === 'dig' ? -0.25 : 0;
  const u = boarM.userData, s = Math.sin(S.bPh) * (sp > 0 ? 0.7 : 0); u.legs[0].rotation.z = s; u.legs[3].rotation.z = s; u.legs[1].rotation.z = -s; u.legs[2].rotation.z = -s;
}
function stepDog(dt) {
  let tx = S.dogX, tz = S.dogZ, sp = 0;
  if (S.dog === 'wild') { S.dogWander = (S.dogWander || 0) + (rnd() - 0.5) * dt; tx = DOG0[0] + Math.cos(S.t * 0.2) * 3; tz = DOG0[1] + Math.sin(S.t * 0.27) * 4; sp = 1.2; const dp = dist(S.px, S.pz, S.dogX, S.dogZ); if (S.running && dp < 7) { tx = S.dogX + (S.dogX - S.px); tz = S.dogZ + (S.dogZ - S.pz); sp = 4; }
    else if (dp < 10 && S.carry.some((c) => c === 'ear' || c === 'dry')) { tx = S.px + 1.2; tz = S.pz + 0.6; sp = dp > 1.8 ? 2.8 : 0; say('들개가 이삭 냄새를 맡고 다가온다 — 가만히 서서 나눠 주자', 'dogsniff', 3); } }
  else {
    const boarOn = S.boar === 'come' || S.boar === 'dig';
    if (boarOn && dist(S.bx, S.bz, (FIELD[0] + FIELD[2]) / 2, (FIELD[1] + FIELD[3]) / 2) < 22) { tx = S.bx; tz = S.bz; sp = 6.2; if (!S.dogBarkT || S.t - S.dogBarkT > 1.6) { S.dogBarkT = S.t; SFX.bark(); } }
    else if (S.dogSent > 0) { S.dogSent -= dt; tx = S.dogTX; tz = S.dogTZ; sp = 5.5; if (S.bird === 'eat' && dist(S.dogX, S.dogZ, RACK[0], RACK[1]) < 4) scareBirds(); }
    else { const bx = -Math.cos(S.pdir), bz = -Math.sin(S.pdir); tx = S.px + bx * 1.8 + bz * 1.2; tz = S.pz + bz * 1.8 - bx * 1.2; sp = dist(S.dogX, S.dogZ, tx, tz) > 4 ? 4.2 : 2.8; if (dist(S.dogX, S.dogZ, tx, tz) < 0.8) sp = 0; }
  }
  const dx = tx - S.dogX, dz = tz - S.dogZ, l = Math.hypot(dx, dz);
  if (l > 0.15 && sp > 0) { const st = Math.min(l, sp * dt); let [nx, nz] = collideRects(SOLID, S.dogX + dx / l * st, S.dogZ + dz / l * st, 0.4); S.dogX = clamp(nx, BX[0], BX[1]); S.dogZ = clamp(nz, BZ[0], BZ[1]); S.dogDir = Math.atan2(dz, dx); }
  S.dogPh += dt * (sp > 0 && l > 0.15 ? 12 : 3); dogM.position.set(S.dogX, 0, S.dogZ); dogM.rotation.y = -S.dogDir; dogTail.rotation.y = S.dog === 'tame' ? Math.sin(S.t * 14) * 0.6 : 0;
  const u = dogM.userData, s = Math.sin(S.dogPh) * (sp > 0 && l > 0.15 ? 0.7 : 0); u.legs[0].rotation.z = s; u.legs[3].rotation.z = s; u.legs[1].rotation.z = -s; u.legs[2].rotation.z = -s;
}
function stepBirds(dt) {
  const due = [0.22, 0.47, 0.72, 0.86].map((k) => k * SEASON);
  S.birdT += dt;
  if (S.bird === 'off') { if (due.some((d) => S.t > d && S.t - dt <= d) || (S.birdBack && S.t > S.birdBack)) { S.birdBack = 0; S.bird = 'come'; S.birdT = 0; S.birdX = -10; S.birdZ = 20; SFX.chirp(); birds.forEach((b) => (b.visible = true)); } else return; }
  let cx, cz, cy;
  if (S.bird === 'come') { const dx = RACK[0] - S.birdX, dz = RACK[1] - S.birdZ, l = Math.hypot(dx, dz); S.birdX += dx / l * Math.min(l, 9 * dt); S.birdZ += dz / l * Math.min(l, 9 * dt); cx = S.birdX; cz = S.birdZ; cy = 4 + l * 0.08;
    if (l < 0.6) { if (S.rack.length && !S.covered) { S.bird = 'eat'; S.birdT = 0; S.birdEat = 0; SFX.chirp(); say('짹짹— 새 떼가 널어 둔 이삭에 앉았다! 소리쳐 쫓자', 'birds', 2.8); } else { S.bird = 'leave'; S.birdT = 0; } } }
  else if (S.bird === 'eat') { cx = RACK[0]; cz = RACK[1]; cy = 1.7; S.birdEat += dt; if (S.covered || !S.rack.length) { S.bird = 'leave'; S.birdT = 0; }
    else if (S.birdEat > 3.4) { S.birdEat = 0; S.rack.pop(); S.birdsEaten++; SFX.chirp(); ring(RACK[0], RACK[1], 2, 0x7a7a8a); hud(); }
    if (dist(S.px, S.pz, RACK[0], RACK[1]) < 4.5) scareBirds(); }
  else if (S.bird === 'leave') { S.birdX += 10 * dt; S.birdZ -= 6 * dt; cx = S.birdX; cz = S.birdZ; cy = 3 + S.birdT * 3; if (S.birdT > 4) { S.bird = 'off'; S.birdBack = S.t + 30; birds.forEach((b) => (b.visible = false)); return; } }
  else return;
  birds.forEach((b, i) => { const a = S.t * (S.bird === 'eat' ? 0.6 : 3) + i * 0.9, r = S.bird === 'eat' ? 0.4 + (i % 3) * 0.45 : 1.2 + (i % 3) * 0.5; b.position.set(cx + Math.cos(a) * r, cy + (S.bird === 'eat' ? (i % 2) * 0.2 : Math.sin(a * 2) * 0.5), cz + Math.sin(a) * r * 0.5); b.rotation.y = -a; b.children[1].rotation.z = S.bird === 'eat' ? 0 : Math.sin(S.t * 30 + i) * 0.8; });
}
function stepRain(dt) {
  const due = [0.36, 0.66].map((k) => k * SEASON);
  if (S.rain === 'none') { if (due.some((d) => S.t > d && S.t - dt <= d)) { S.rain = 'warn'; S.rainT = 0; say('먹구름이 몰려온다 — 건조대에 거적을 덮자!', null, 3.2); } return; }
  S.rainT += dt;
  if (S.rain === 'warn' && S.rainT > 7) { S.rain = 'rain'; S.rainT = 0; $('rain').style.opacity = 1; }
  if (S.rain === 'rain') { if (S.rainT % 0.9 < dt) SFX.rain();
    if (!S.covered && S.rack.length) { S.wetT += dt; if (S.wetT > 2) { S.wetT = 0; S.rack.shift(); S.rotted++; SFX.rot(); ring(RACK[0], RACK[1], 2, 0x405060); hud(); say('젖은 이삭이 썩어 버린다! — 거적을 덮자', null, 2.2); } }
    if (S.rainT > 16) { S.rain = 'none'; S.rainT = 0; $('rain').style.opacity = 0; if (S.covered) say('비가 그쳤다 — 거적을 걷어야 다시 마른다', null, 2.8); } }
}

/* ───── 끝 ───── */
function finish(win) {
  S.mode = win ? 'win' : 'snow'; S.endT = 0; S.endWin = win; SFX[win ? 'win' : 'snow']();
  say(win ? '토기 셋이 가득! — 움집에 들이자' : '첫눈이 온다…', null, 2.6);
}
function endScreen() {
  const win = S.endWin, full = pots.filter((p) => p.on && p.n >= 3).length;
  const marks = `<div class="marks"><span class="${full >= 3 ? 'ok' : ''}">🌾 채운 토기 ${full}</span><span class="${S.extra === 'done' ? 'ok' : ''}">🏺 ${S.extra === 'done' ? '구운 토기' : '토기 못 구움'}</span><span class="${S.dog === 'tame' ? 'ok' : ''}">🐕 ${S.dog === 'tame' ? '개가 따른다' : '개는 숲에'}</span><span class="${S.fish ? 'ok' : ''}">🐟 ${S.fish ? '말린 물고기' : '물고기 없음'}</span></div>`;
  const lost = [S.ruined ? `멧돼지가 밭 ${S.ruined}칸을 파헤쳤다` : '', S.rotted ? `비에 이삭 ${S.rotted}단이 썩었다` : '', S.birdsEaten ? `새가 ${S.birdsEaten}단을 쪼아 먹었다` : ''].filter(Boolean).join(' · ');
  if (win) {
    overlay(`<h1>겨울 채비</h1><p>토기마다 곡식이 가득하다. 눈 내리는 밤, 움집 안 화덕이 따뜻하다.</p><p>${S.fish ? '그물로 건진 물고기도 말려 두었다.' : ''} ${S.dog === 'tame' ? '개가 문가에 웅크려 밤을 지킨다.' : ''}</p>${marks}${lost ? `<p class="keys">${lost}</p>` : ''}
      <p class="keys">이제 사람들은 떠나지 않는다. 봄에 다시 씨를 뿌릴 것이다.</p>
      <div class="fact">📜 <b>농사의 시작</b> — 조·피·수수 같은 잡곡을 기르기 시작했다. 사냥과 고기잡이도 여전히 중요했다.<br>📜 <b>간석기</b> — 돌을 갈아 만든 도구를 썼다. 갈돌과 갈판으로 곡식을 갈았다.<br>📜 <b>빗살무늬토기</b> — 흙으로 빚어 구운 그릇에 먹을 것을 담아 두고 익혔다.<br>📜 <b>머물러 사는 삶</b> — 강가나 바닷가에 움집을 짓고 마을을 이뤘다. 개와 돼지를 길렀다.</div>`,
      '한 번 더', () => { S.year = 1; S.extra = 'none'; S.dog = 'wild'; resetYear(); S.mode = 'play'; });
  } else {
    const ny = S.year + 1;
    overlay(`<h1>첫눈</h1><p>토기를 다 채우지 못했다. 겨울은 났지만 <b>봄에 뿌릴 씨가 모자라다.</b></p>${lost ? `<p>${lost}.</p>` : ''}${marks}
      <p>이듬해 — <b>밭이 작아졌다</b>(${FIELD_BY_YEAR[Math.min(ny - 1, 2)]}칸).${S.extra === 'done' ? ' 구워 둔 토기는 그대로 있다.' : ''}${S.dog === 'tame' ? ' 개는 여전히 따른다.' : ''}</p>
      <p class="keys">${ny}번째 해 가을 · 토기는 아직 비어 있다.</p>`,
      '이듬해 가을', () => { S.year = ny; resetYear(); S.mode = 'play'; say('밭이 작아졌다 — 멧돼지와 비를 더 잘 막자', null, 3); });
  }
}

/* ───── 철 · 빛 ───── */
const SKY = [[0, 0x78aee8, 0xffe6c0, 0xfff1d6, 2.1, 1.3], [0.45, 0x7a9ed8, 0xffd8a0, 0xffe2b0, 1.9, 1.2], [0.75, 0x8a94b0, 0xe8c0a0, 0xf0d0b0, 1.4, 1.05], [0.93, 0x9aa2b4, 0xd8d4d0, 0xe8e8f0, 1.0, 1.0], [1.0, 0xa8b0c0, 0xe8ecf2, 0xf0f4ff, 0.8, 1.05], [1.3, 0x2a3050, 0x5a5a7a, 0x8a90c0, 0.25, 0.5]];
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); let lastSky = -1, lastLeaf = -1;
function lightFor(k) {
  let a = SKY[0], b = SKY[SKY.length - 1]; for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = clamp((k - a[0]) / ((b[0] - a[0]) || 1), 0, 1);
  cT.set(a[1]).lerp(tc.set(b[1]), t); cL.set(a[2]).lerp(tc.set(b[2]), t);
  if (Math.abs(k - lastSky) > 0.004) { sky.paint(cT, cL); lastSky = k; }
  scene.fog.color.copy(cL); sun.color.set(a[3]).lerp(tc.set(b[3]), t); sun.intensity = lerp(a[4], b[4], t); hemi.intensity = lerp(a[5], b[5], t);
  const sn = clamp((k - 0.97) * 12, 0, 1); ground.material.color.copy(groundC0).lerp(groundC1, clamp(k * 1.3, 0, 1)).lerp(groundC2, sn);
  for (const [m, c0] of whiten) m.material.color.copy(c0).lerp(groundC2, sn * 0.85);
  for (const tf of tufts) tf.material.color.copy(groundC0).lerp(groundC1, clamp(k * 1.4, 0, 1)).lerp(groundC2, sn);
  if (Math.abs(k - lastLeaf) > 0.02) { forest.paint(Math.min(k, 1)); lastLeaf = k; }
  snow.pts.material.opacity = clamp((k - 0.9) * 8, 0, 0.95);
}

/* ───── 한 걸음 ───── */
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  { const p = riverG.attributes.position; for (let i = 0; i < p.count; i++) { const x = riverBase[i * 3], z = riverBase[i * 3 + 2]; p.setY(i, Math.sin(x * 0.3 + S.t * 1.1) * 0.12 + Math.cos(z * 0.5 + S.t * 0.8) * 0.08); } p.needsUpdate = true; }
  fire.scale.setScalar(0.9 + Math.sin(S.t * 13) * 0.08); fire.rotation.y = S.t * 2; fireL.intensity = 8 * (0.85 + Math.sin(S.t * 21) * 0.15) * (0.5 + S.sea);
  if (snow.pts.material.opacity > 0) { const p = snow.pos; for (let i = 0; i < snow.N; i++) { p[i * 3 + 1] -= dt * (1.4 + (i % 5) * 0.2); p[i * 3] += Math.sin(S.t + i) * dt * 0.3; if (p[i * 3 + 1] < 0) p[i * 3 + 1] += 30; } snow.pts.geometry.attributes.position.needsUpdate = true; }
  netFloats.children.forEach((f, i) => { f.position.y = 0.18 + Math.sin(S.t * 2 + i) * (S.net === 'full' ? 0.12 : 0.04); });
  if (S.mode === 'play') pots.forEach((p) => { p.gl.material.opacity = lerp(p.gl.material.opacity, p.on ? (p.n / 3) * 0.9 : 0, dt * 3); });
  if (S.extra === 'firing') { S.fireT += dt; newPot.userData.body.material.color.set(new THREE.Color(0xd8b49a).lerp(new THREE.Color(0xb4784a), clamp(S.fireT / 18, 0, 1))); fire.scale.setScalar(1.4 + Math.sin(S.t * 13) * 0.1);
    if (S.fireT > 18 && S.mode === 'play') { S.extra = 'done'; newPot.visible = false; pots[3].on = true; SFX.done(); ring(POTS[3][0], POTS[3][1], 2.5, 0xffcf4d); hud(); say('토기가 구워졌다! — 움집 앞에 하나 더, 곡식을 더 담는다', null, 3); } }

  if (S.mode === 'title') return;
  if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.2) { S.mode = 'play'; say('첫눈 전에 — 움집 앞 토기 셋을 채우자', null, 3.2); } return; }
  if (S.mode === 'win' || S.mode === 'snow') {
    S.endT += dt; S.sea = Math.min(1.12, S.sea + dt * (S.mode === 'win' ? 0.06 : 0.03)); lightFor(S.sea);
    if (S.mode === 'win') { villagers.forEach((v, i) => { const p = pots[i % 3]; const tx = OURS[0] + (i - 1) * 0.9, tz = OURS[1] + 4.2; v.x = lerp(v.x, S.endT < 1.6 ? p.m.position.x : tx, dt * 2); v.z = lerp(v.z, S.endT < 1.6 ? p.m.position.z + 0.8 : tz, dt * 2); v.m.position.set(v.x, 0, v.z); walkAnim(v.m, S.t * 9, true); });
      if (S.endT > 1.6) pots.forEach((p, i) => { if (!p.on) return; p.m.position.x = lerp(p.m.position.x, OURS[0] + (i - 1.5) * 0.4, dt * 1.6); p.m.position.z = lerp(p.m.position.z, OURS[1] + 3.6, dt * 1.6); p.gl.position.copy(p.m.position).setY(1.2); p.gl.material.opacity = Math.min(p.gl.material.opacity, clamp(3 - S.endT, 0, 1) * 0.5); if (S.endT > 3) { p.m.visible = false; p.gl.visible = false; } }); }
    doorGlow.material.opacity = clamp((S.endT - 2.5) / 2, 0, 0.95);
    if (S.endT > 4.6 && S.endT - dt <= 4.6) $('fade').style.opacity = 1;
    if (S.endT > 6.0 && !S.camp) { S.camp = true; S.sea = 1.25; lightFor(1.25); $('fade').style.opacity = 0; S.px = OURS[0] + 1.8; S.pz = OURS[1] + 4.6; S.pdir = Math.PI / 2; pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = 0; walkAnim(pMesh, 0, false); pRing.visible = false; carryG.visible = false; if (S.dog === 'tame') { S.dogX = OURS[0] - 1.6; S.dogZ = OURS[1] + 4.4; S.dogDir = Math.PI / 2; dogM.position.set(S.dogX, 0, S.dogZ); dogM.rotation.y = -S.dogDir; } }
    if (S.endT > 8.0 && !S.shown) { S.shown = true; endScreen(); }
    return;
  }
  if (S.mode !== 'play') return;
  S.camp = false;

  /* 철 */
  S.sea = S.t / SEASON; $('season').querySelector('i').style.width = clamp(S.sea, 0, 1) * 100 + '%'; lightFor(S.sea);
  if (S.sea > 0.86) say('바람이 차다 — 곧 첫눈이 온다!', 'late', 3);
  if (S.sea >= 1) return finish(false);
  S.shoutCD -= dt;

  /* 나 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 4.7 : 3.0) * (back ? 0.6 : 1) * (S.carry.length >= 3 ? 0.85 : 1); const [nx, nz] = collideRects(SOLID, S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); if (S.view !== 2) S.pdir = Math.atan2(iz, ix);
    S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; noise(0.05, S.running ? 0.12 : 0.05, 300); } }
  pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving);
  pRing.position.set(S.px, 0.11, S.pz);
  carryG.position.set(S.px - Math.cos(S.pdir) * 0.4, 0, S.pz - Math.sin(S.pdir) * 0.4); carryG.rotation.y = -S.pdir + Math.PI / 2; carryMeshes.forEach((m, i) => m.position.set((i - 1) * 0.36, 1.25 + (i % 2) * 0.1, -0.1));

  /* 가만히 서서 하는 일: 베기 · 덮기/걷기 · 흙 캐기 · 개에게 주기 · 그물 */
  let job = null, need = 1;
  const inPatch = patches.find((p) => p.used && p.st === 'ripe' && inRect(S.px, S.pz, [p.x0, p.z0, p.x0 + PW, p.z0 + PH]));
  if (inPatch && S.carry.length < 3) { job = 'cut'; need = 0.85; }
  else if (inPatch && S.carry.length >= 3) say('손이 가득 찼다 — 건조대에 널고 오자', 'full', 2.4);
  if (!job && dist(S.px, S.pz, MAT[0], MAT[1]) < 1.6 && !S.matLock) { job = 'mat'; need = 0.6; }
  if (dist(S.px, S.pz, MAT[0], MAT[1]) > 2.2) S.matLock = false;
  if (!job && dist(S.px, S.pz, CLAY[0], CLAY[1]) < 1.9 && S.carry.length < 3 && S.extra === 'none' && !S.carry.includes('clay')) { job = 'clay'; need = 1.0; }
  if (!job && S.dog === 'wild' && dist(S.px, S.pz, S.dogX, S.dogZ) < 2.8 && S.carry.some((c) => c === 'ear' || c === 'dry')) { job = 'dog'; need = 1.1; }
  if (!job && dist(S.px, S.pz, NET[0], NET[1]) < 2.0 && (S.net === 'weights' || S.net === 'full')) { job = S.net === 'weights' ? 'net' : 'fish'; need = 1.2; }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  overBar($('work'), cam, S.px, 2.6, S.pz, job && S.workT > 0.05 ? S.workT / need : null);
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'cut') { inPatch.st = 'cut'; drawPatch(inPatch); S.carry.push('ear'); S.harvested++; SFX.cut(); ring(inPatch.x, inPatch.z, 2, 0xe8b84a); say(S.carry.length >= 3 ? '이삭 셋 — 손이 가득! 건조대로' : '쓱— 이삭을 벴다', null, 1.6); }
    else if (job === 'mat') { S.covered = !S.covered; S.matLock = true; SFX.pick(); say(S.covered ? '거적을 덮었다 — 비도 새도 막는다. 덮인 동안은 더디게 마른다' : '거적을 걷었다 — 해에 빨리 마른다', null, 2.6); }
    else if (job === 'clay') { S.carry.push('clay'); SFX.pick(); say('강가 흙 한 덩이 — 빚는 자리(화덕 곁)로', null, 2.4); }
    else if (job === 'dog') { const i = S.carry.findIndex((c) => c === 'ear' || c === 'dry'); S.carry.splice(i, 1); S.dog = 'tame'; SFX.bark(); SFX.done(); ring(S.dogX, S.dogZ, 2.5, 0xffcf4d); say('이삭을 나눠 주었다 — 개가 꼬리를 흔들며 따라온다', null, 3); }
    else if (job === 'net') { S.net = 'set'; S.netT = 0; netFloats.visible = true; SFX.splash(); say('그물추를 단 그물을 쳤다 — 나중에 걷으러 오자', null, 2.6); }
    else if (job === 'fish') { S.net = 'done'; S.fish = 1; netFloats.visible = false; SFX.splash(); SFX.done(); say('그물 가득 물고기! — 말려서 겨울에 먹는다', null, 2.6); }
    hud(); }
  if (inPatch && S.carry.length < 3) say('조 이삭 — 가만히 서 있으면 벤다', 'cut1', 2.6);
  /* 걸어가면 되는 일: 널기 · 걷기 · 붓기 · 그물추 */
  const dR = dist(S.px, S.pz, RACK[0], RACK[1]);
  if (dR < 2.4) {
    let ch = false;
    /* 마른 것은 걷고 젖은 것은 그 자리에 넌다(손이 가득해도 바꿔 들 수 있게) */
    if (!S.covered) for (let i = 0; i < S.rack.length; i++) { const e = S.carry.indexOf('ear'); if (e < 0) break; if (S.rack[i].dry >= 1) { S.carry[e] = 'dry'; S.rack[i] = { dry: 0 }; ch = true; } }
    if (!S.covered) { for (let i = S.carry.length - 1; i >= 0; i--) if (S.carry[i] === 'ear' && S.rack.length < 4) { S.carry.splice(i, 1); S.rack.push({ dry: 0 }); ch = true; } }
    for (let i = S.rack.length - 1; i >= 0; i--) if (S.rack[i].dry >= 1 && S.carry.length < 3) { S.rack.splice(i, 1); S.carry.push('dry'); ch = true; }
    if (ch) { SFX.pick(); hud(); say(S.carry.includes('dry') ? '마른 이삭을 챙겼다 — 갈판으로' : '건조대에 널었다 — 해와 바람에 마른다', null, 2); }
    else if (S.covered && S.carry.includes('ear')) say('거적이 덮여 있다 — 곁의 거적 더미에 서면 걷는다', 'coveredrack', 2.6);
    else if (S.rack.length >= 4 && S.carry.includes('ear')) say('건조대가 꽉 찼다 — 마른 것부터 갈자', 'rackfull', 2.4);
  }
  if (S.carry.includes('grain') && dist(S.px, S.pz, goalPos.x, goalPos.z) < 3.4) {
    let poured = 0; for (let i = S.carry.length - 1; i >= 0; i--) if (S.carry[i] === 'grain') { const p = pots.find((p) => p.on && p.n < 3); if (!p) break; p.n++; S.carry.splice(i, 1); poured++; ring(p.m.position.x, p.m.position.z, 1.8, 0xffe08a); }
    if (poured) { SFX.pour(); hud(); const full = pots.slice(0, 3).filter((p) => p.n >= 3).length; say(full >= 3 ? '셋 다 찼다!' : `토기에 부었다 — ${3 - full}개 남았다`, null, 1.8); }
  }
  if (S.net === 'none' && dist(S.px, S.pz, WEIGHTS[0], WEIGHTS[1]) < 1.4) { S.net = 'weights'; weights.visible = false; SFX.pick(); hud(); say('그물추 — 강가 그물 자리에 서서 그물을 치자', null, 2.6); }
  if (S.net === 'set') { S.netT += dt; if (S.netT > 45) { S.net = 'full'; hud(); say('그물이 출렁인다 — 물고기가 들었다!', 'netfull', 2.4); } if (S.netT % 6 < dt) { fishJump.visible = true; fishJump.position.set(NET[0] + (rnd() - 0.5) * 6, 0.5, NET[1] + 5.5); } }
  if (fishJump.visible) { fishJump.position.y -= dt * 2; if (fishJump.position.y < 0) fishJump.visible = false; }
  /* 말리기 */
  if (S.rain !== 'rain') { let ch = false; for (const b of S.rack) if (b.dry < 1) { b.dry = Math.min(1, b.dry + dt / 20 * (S.covered ? 0.5 : 1)); /* 거적 아래서도 바람에 천천히 마른다 */ ch = true; if (b.dry >= 1) { SFX.pick(); say('이삭이 바싹 말랐다 — 건조대에서 챙기자', 'dry1', 2.4); } } if (ch && S.t % 0.5 < dt) hud(); }
  /* 박자 고리(갈판 · 빚는 자리) */
  const kc = context(); $('bAct').textContent = kc ? (kc === 'grind' ? '갈기' : '긋기') : '소리';
  if (kc) { S.kPhase = (S.kPhase + dt / 1.05) % 1; if (S.kPhase > 0.88 && !S.kTick) { S.kTick = true; SFX.tick(); } if (S.kPhase < 0.5) S.kTick = false;
    say(kc === 'grind' ? (ctl.isTouch ? '갈판 — 흰 고리가 노란 고리에 닿을 때 「갈기」' : '갈판 — 흰 고리가 노란 고리에 닿을 때 스페이스') : (ctl.isTouch ? '빚는 자리 — 고리가 닿을 때 「긋기」로 빗금' : '빚는 자리 — 고리가 닿을 때 스페이스로 빗금'), 'k' + kc, 3.2); }
  else if (S.carry.includes('dry') && dist(S.px, S.pz, GRIND[0], GRIND[1]) < 6) say('갈판 — 곁에 서면 간다', 'grindnear', 2.2);

  stepBoar(dt); stepDog(dt); stepBirds(dt); stepRain(dt);
  if (S.carry.length === 0 && S.t > 6) say('밭(동쪽)에서 이삭을 베어 오자', 'start', 2.8);
  if (pots.slice(0, 3).every((p) => p.n >= 3)) return finish(true);

  /* 조임 */
  const late = clamp((S.sea - 0.72) * 3.5, 0, 1), boarOn = S.boar === 'dig' ? 0.6 : S.boar === 'come' ? 0.35 : 0, wet = S.rain === 'rain' && !S.covered && S.rack.length ? 0.7 : S.rain === 'warn' ? 0.35 : 0, bird = S.bird === 'eat' ? 0.5 : 0;
  const tension = Math.max(late, boarOn, wet, bird);
  S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.4, tension); SFX.beat(0.08 + tension * 0.28); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${late >= Math.max(boarOn, wet, bird) ? '120,140,190' : '200,60,20'},${tension * 0.45})`;
}
const v3 = new THREE.Vector3();
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(30, 34, e), lerp(5.5, 38, e), lerp(33, 58, e)); cam.lookAt(lerp(30, 34, e), lerp(1.2, 0, e), lerp(25, 30, e)); if (cam.fov !== 44) { cam.fov = 44; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'win' || S.mode === 'snow') { if (S.camp) { cam.position.set(OURS[0] + 7, 4.2, OURS[1] + 13); cam.lookAt(OURS[0], 1.5, OURS[1]); } else { v3.set(OURS[0] + 3, 12, OURS[1] + 20); cam.position.lerp(v3, 0.04); cam.lookAt(OURS[0], 1, OURS[1] + 4); } }
  else followCam(cam, S, { W, H, map: { h: [86, 160], z: 10, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  edgeGoal($('goal'), cam, goalPos, S.mode === 'play', 0.8);
  const kn = $('knap'), kc = S.mode === 'play' && context(); if (kc) { const p = kc === 'grind' ? GRIND : POTTER, q = v3.set(p[0], 0.5, p[1]).project(cam); kn.style.display = 'block'; kn.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; kn.style.top = ((1 - q.y) / 2) * innerHeight - 70 + 'px'; const r = Math.max(8, 84 - 62 * S.kPhase), i = kn.querySelector('i'); i.style.width = i.style.height = r + 'px'; i.style.borderColor = Math.abs(S.kPhase - 0.9) < 0.14 ? '#ffcf4d' : '#fff'; } else kn.style.display = 'none';
}

resetYear(); stepDog(0.01);
pMesh.position.set(S.px, 0, S.pz); pRing.position.set(S.px, 0.11, S.pz);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.chirp(); };
runLoop(update, view, () => renderer.render(scene, cam));
window.__scene = { S, patches, pots, update, keys, ctl, act, strike, context,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz); ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  beat(n) { let k = 0; for (let g = 0; g < 400 && k < n && S.mode === 'play'; g++) { update(1 / 60); if (Math.abs(S.kPhase - 0.9) < 0.02 && context()) { strike(context()); k++; update(1 / 30); } } return k; },
  const: { RACK, MAT, GRIND, POTTER, CLAY, WEIGHTS, NET, FIELD, POTS, DOG0 } };
