/* 케이월드 · 몰이 — 구석기 한 장면(S01, 2026-11-17). 본보기 = 그믐밤(night.js), 공통 부품 = ../scene/kit.js.
   목표는 하나(북동쪽 골짜기 어귀의 횃불 둘)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 해가 지면 끝이 아니라 다음 날이 달라진다.
   떼의 성질: 다가가면 반대쪽으로 달아난다(걸으면 조금, 뛰면 멀리) · 옆이 비어 있으면 옆으로 샌다 · 바람을 등지고 다가가면 냄새로 일찍 흩어진다 · 늑대가 끼어든다.
   좌표: x 동쪽(+), z 남쪽(+). 강은 남쪽(z 141~), 골짜기는 북동쪽.
   v2(2026-11-17 넓히기): 판 96×72 → 200×150, 세 막 — ① 숲 가장자리에서 발자국 따라 떼 찾기 ② 넓은 들 몰기(개울·징검돌 여울, 늑대) ③ 좁아지는 골짜기(바위 줄 틈).
   큰 순간 = 떼의 폭주(들 한가운데서 내달림 — 곁에서 같이 뛰면 반대쪽으로 꺾인다). 판 밖 세 겹(강 건너 들 · 언덕과 먼 떼 · 산 능선). */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, at, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, gridPath, losRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, groundAt, runLoop, loadArt, ART, art, artInst, artGeo, artMat, artGlowMat, missions } from '../scene/kit.js?v=5';
await loadArt('people', 'nature', 'props', 'hunt');   /* 블렌더로 만든 모델 — hunt = 이 장면에만 쓰는 것(사슴·늑대·막집·벼랑·불꽃 …, tools/blender/make_hunt.py) */

const W = 200, H = 150;
const BX = [5.5, 193], BZ = [6, 139.5]; /* 걸을 수 있는 곳 */

/* ───── 무대 ───── */
/* 막는 것: [x0,z0,x1,z1,높이,종류] */
const SOLID = [
  [164, 0, 167.5, 16.5, 7, 'cliff'], [182.5, 0, 200, 16.5, 7, 'cliff'], [164, 0, 183, 3, 8, 'cliff'], [193, 16.5, 200, 150, 6, 'cliff'],
  [167.5, 13.6, 170.4, 17.6, 3.2, 'rock'], [178, 13.6, 182.5, 17.6, 3.2, 'rock'],   /* 어귀 바위 둘 — 사이 7.6 */
  [150, 0, 164, 10.5, 5, 'cliff'], [159.6, 10.2, 164, 15.8, 2.8, 'rock'], [118, 0, 150, 7.5, 4.5, 'cliff'], /* 북쪽 날개 — 벼랑 끝자락 */
  [178.6, 17.4, 182.4, 23.4, 2.6, 'rock'], [179.2, 23.2, 182.4, 29, 2.3, 'rock'], [178.8, 28.8, 182.6, 35.6, 2.4, 'rock'], /* 남쪽 날개 — 이어진 바위 줄 */
  [173, 35, 180, 39, 2.4, 'rock'], [166, 39, 173, 43, 2.2, 'rock'], /* 틈(161~166) */ [154, 44, 161, 48, 2.3, 'rock'], [147, 47, 154, 51, 2.1, 'rock'], [140, 50, 147, 54, 2.0, 'rock'], /* 3막 — 골짜기로 좁아지는 바위 줄 */
  [78, 58, 80.5, 60.3, 1.6, 'rock'], [124, 82, 126.6, 84.4, 1.8, 'rock'], [66, 96, 68, 97.8, 1.4, 'rock'], [134, 30, 136.6, 32.4, 1.8, 'rock'], [90, 116, 92.4, 118, 1.5, 'rock'], [93.4, 19.4, 97.6, 23.4, 2.2, 'rock'],
  [18, 127.8, 21, 130.6, 2.6, 'hut'], [27.6, 128.2, 30.6, 131, 2.6, 'hut'],
];
const LONE_TREES = [[38, 72, 2.4], [62, 50, 2.2], [22, 58, 2.6], [46, 34, 2.2], [18, 38, 2.4], [64, 74, 2.0], [72, 28, 2.4], [34, 104, 2.2], [58, 100, 2.4], [84, 84, 2.6], [126, 62, 2.4], [140, 100, 2.2], [120, 24, 2.4], [160, 72, 2.6], [150, 120, 2.2], [112, 118, 2.4], [76, 124, 2.0], [30, 20, 2.4], [52, 16, 2.2], [170, 96, 2.4]];
for (const [x, z] of LONE_TREES) SOLID.push([x - 0.5, z - 0.5, x + 0.5, z + 0.5, 3, 'tree']);
const VALLEY = [167.6, 3.2, 182.4, 15.2];
const MOUTH = [174.2, 17.2];
const TORCHMEN = [[168.4, 19.3], [177.2, 21.2]];
const FIRE = [24, 132.5], START = [24.5, 136.2], ANVIL = [14, 137.6];
const STONES0 = [[9, 138.6], [17.5, 139], [104.5, 58], [110, 80], [30, 138.8], [36, 139.2], [42, 138.5], [47.5, 139], [11, 135.2], [93, 100], [120, 44]];
const STICKS0 = [[8, 126], [6.8, 118], [9.5, 109], [33, 128.5], [44, 131], [13.5, 122], [52, 133], [20, 124.5], [7.2, 100]];
const BUSHES = [[10, 104], [14, 84], [46, 76], [70, 54], [118, 96], [150, 74]];
const ROOTS = [[30, 92], [86, 44]];
const HERD_AT = [[52, 62], [38, 46], [30, 28]];       /* 날마다 떼가 있는 곳(숲 가장자리) — 지면 더 깊이 */
const WINDS = [[-0.71, -0.71], [0.6, 0.8], [-0.96, 0.28], [0.28, -0.96]]; /* 바람이 가는 쪽 */
const WOLF_FROM = [[104, 8], [136, 9]];
const NDEER = 9, NEED = 6, DAY = 360;
/* 개울: 북쪽 샘 바위에서 강까지. 여울(징검돌)로 건너면 괜찮고, 물로 몰면 떼가 허둥댄다 */
const FORD = [62, 74], creekX = (z) => 96 + (z - 24) * 0.085;
const inCreek = (x, z) => z > 24 && Math.abs(x - creekX(z)) < 2.6 && !(z > FORD[0] && z < FORD[1]);
const STAMP_X = 118; /* 떼가 이 선을 넘으면 폭주 */

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xf2c9a0, 120, 390], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x5a7a3a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff1d6, intensity: 2.2, box: [62, 62], far: 220, pos: [START[0] - 40, 60, START[1] + 30], target: [START[0], 0, START[1]] });
addEventListener('resize', resize); resize();
const rnd = rng(20261117);
const sky = skyDome(scene, rnd, { top: 0x6aa6e8, low: 0xffe2b8, stars: 0 }); scene.background = new THREE.Color(0x6aa6e8); /* 판이 넓어 하늘 둥근 지붕 끝이 먼 시야 밖으로 잘리는 곳 — 빈 곳은 하늘 윗빛으로 */
const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff2c8, fog: false })); scene.add(sunDisc);
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);
/* 꾸밈 도구 — 꾸밈에는 rndA 만 쓴다(놀이의 난수 rnd 는 사슴을 만들 때 예전과 같은 자리에서 시작하게 따로 흘려보낸다) */
const rndA = rng(1117);
const own = (names, mat, tints = {}) => { const m = new THREE.Mesh(artGeo(names, tints), mat); m.castShadow = m.receiveShadow = true; return m; };
const popMat = (e) => { const m = artMat.clone(); m.emissive.set(e); return m; }; /* 줍는 것이 눈에 띄게 살짝 빛나는 재질 */
const bbOf = (n) => { const p = ART[n].pos, b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]; for (let i = 0; i < p.length; i += 3) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], p[i + k]); b[k + 3] = Math.max(b[k + 3], p[i + k]); } return b; };
/* 모델을 네모(가운데 cx·cz, 너비 w, 높이 h, 깊이 d)에 꼭 맞춰 놓는다 — turn 은 반 바퀴(같은 모델도 달라 보이게) */
const fit = (m, n, cx, cz, w, h, d, turn = false) => { const b = bbOf(n), sx = w / (b[3] - b[0]), sy = h / b[4], sz = d / (b[5] - b[2]), k = turn ? -1 : 1; m.scale.set(sx, sy, sz); m.rotation.y = turn ? Math.PI : 0; m.position.set(cx - k * (b[0] + b[3]) / 2 * sx, 0, cz - k * (b[2] + b[5]) / 2 * sz); return m; };
/* 여러 조각을 한 덩이로 합친다(그리기 한 번) — 조각의 자리·크기·돌림을 꼭짓점에 굽는다 */
const merge = (P, mat) => { let nv = 0, ni = 0; for (const m of P) { m.updateMatrix(); nv += m.geometry.attributes.position.count; ni += m.geometry.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni), v = new THREE.Vector3(), nm = new THREE.Matrix3(); let v0 = 0, i0 = 0;
  for (const m of P) { const g = m.geometry, A = g.attributes; nm.getNormalMatrix(m.matrix);
    for (let i = 0; i < A.position.count; i++) { const o = (v0 + i) * 3; v.fromBufferAttribute(A.position, i).applyMatrix4(m.matrix); pos[o] = v.x; pos[o + 1] = v.y; pos[o + 2] = v.z; v.fromBufferAttribute(A.normal, i).applyMatrix3(nm).normalize(); nor[o] = v.x; nor[o + 1] = v.y; nor[o + 2] = v.z; col[o] = A.color.getX(i); col[o + 1] = A.color.getY(i); col[o + 2] = A.color.getZ(i); }
    for (let i = 0; i < g.index.count; i++) idx[i0 + i] = g.index.getX(i) + v0; v0 += A.position.count; i0 += g.index.count; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  const out = new THREE.Mesh(g, mat); out.castShadow = out.receiveShadow = true; return out; };
const nearCreek = (x, z, r = 4) => z > 21 && Math.abs(x - creekX(z)) < r;
/* 판이 넓어(200×150) 같은 모델 여럿을 한 번에 그리되 칸(cell m)마다 나눠 묶는다 — 화면·그림자 밖의 칸은 그리지 않는다(칸마다 둘레 공을 잰다) */
const FINE = [], GRASS = [], gDir = new THREE.Vector3(); /* 지도 시점(높이 150m~)에서는 점보다 작아 끄는 것: 풀섶 · 꽃(FINE) · 바람 타는 풀잎(GRASS — 칸마다, 멀리 있는 칸도 끈다) */
const instC = (name, list, tints = {}, o = {}, cell = 48, fine = false) => { const by = {}, out = []; for (const t of list) { const k = Math.floor(t[0] / cell) + ',' + Math.floor(t[2] / cell); (by[k] = by[k] || []).push(t); }
  for (const k in by) { const m = artInst(scene, name, by[k], tints, o); if (!m) continue; m.frustumCulled = true; m.computeBoundingSphere(); out.push(m); if (fine) FINE.push(m); } return out; };
/* 뿌리기(kit scatter 와 같되 칸마다 나눠 묶는다) */
const sprinkle = ({ area, n, names, avoid = null, scale = [0.8, 1.25], tints = {}, y = 0, shadow = true, minGap = 0, fine = false }) => { const by = {}, put = []; let tries = 0;
  while (put.length < n && tries++ < n * 12) { const x = area[0] + rndA() * (area[2] - area[0]), z = area[1] + rndA() * (area[3] - area[1]); if (avoid && avoid(x, z)) continue; if (minGap && put.some((p) => Math.abs(p[0] - x) < minGap && Math.abs(p[1] - z) < minGap)) continue;
    const nm = names[Math.floor(rndA() * names.length)]; (by[nm] = by[nm] || []).push([x, y, z, scale[0] + rndA() * (scale[1] - scale[0]), rndA() * 6.28]); put.push([x, z]); }
  for (const nm in by) instC(nm, by[nm], tints, { shadow }, fine ? 96 : 1e4, fine); };

/* 땅: 풀밭 · 강가 모래 · 강 · 골짜기 바닥 */
flat(-240, -240, W + 240, H + 10, 0x6cbf55, 0);
flat(-40, 135.5, W + 40, 141.2, 0xe8d29a, 0.03);
flat(166, 3, 183, 17, 0x8fae5a, 0.03);
flat(-240, 141, W + 240, H + 240, 0x3d8fd0, 0.05);
/* 땅 얼룩: 풀빛 둘 · 야영지 맨땅 · 모래가 풀밭으로 번진 자리 · 골짜기 어귀 (두께 0.07 짜리 납작한 조각을 땅에 묻어 윗면만 살짝 올린다 — 겹치는 것끼리는 높이를 1cm 넘게 달리한다) */
{ const P = [[], []], put = []; for (let t = 0; t < 2400 && put.length < 190; t++) { const x = 4 + rndA() * 188, z = 4 + rndA() * 130, r = 1 + rndA() * 1.4; if ((x > 163 && z < 18) || nearCreek(x, z, 4.6 + r) || dist(x, z, 24, 132.5) < 8.5 || put.some((p) => dist(x, z, p[0], p[1]) < r + p[2] + 0.2)) continue; put.push([x, z, r]); P[put.length % 2].push([x, -0.058, z, [r, 1, r * (0.7 + rndA() * 0.5)], rndA() * 6.28]); }
  artInst(scene, 'hpatch', P[0], { c: 0x66b650 }, { shadow: false }); artInst(scene, 'hpatch', P[1], { c: 0x5aa94a }, { shadow: false });
  artInst(scene, 'hpatch', [[24.2, -0.056, 131.5, [7.2, 1, 5], 0.4], [14, -0.02, 137.6, [2, 1, 1.7], 0.6]], { c: 0xb89e70 }, { shadow: false });
  const S1 = [], S2 = [], S3 = [], V = [], sand = (x, z) => !nearCreek(x, z, 3.8);
  for (let x = -38; x < 238; x += 2.6 + rndA() * 1.6) { const z = 135.2 + rndA() * 0.9, sx = 1.5 + rndA() * 1.1, sz = 0.8 + rndA() * 0.8, ry = (rndA() - 0.5) * 0.8; if (sand(x, z)) S1.push([x, S1.length % 2 ? -0.028 : -0.016, z, [sx, 1, sz], ry]); }
  for (let i = 0; i < 30; i++) { const x = -20 + rndA() * 240, z = 135.7 + rndA() * 0.8, sx = 0.7 + rndA() * 0.7, sz = 0.4 + rndA() * 0.3, ry = (rndA() - 0.5) * 0.6; if (sand(x, z)) S2.push([x, -0.004, z, [sx, 1, sz], ry]); }
  for (let i = 0; i < 64; i++) { const x = -20 + rndA() * 240, z = 137 + rndA() * 3.6, sx = 0.3 + rndA() * 0.4, sz = 0.25 + rndA() * 0.3, ry = rndA() * 6.28; if (sand(x, z)) S3.push([x, 0.008, z, [sx, 1, sz], ry]); }
  for (let x = 167.4; x < 183; x += 2.4) V.push([x + rndA(), -0.02, 16.7 + rndA() * 0.9, [1.4 + rndA() * 0.8, 1, 0.9 + rndA() * 0.6], (rndA() - 0.5) * 0.8]);
  artInst(scene, 'hpatch', S1, { c: 0xe8d29a }, { shadow: false }); artInst(scene, 'hpatch', S2, { c: 0x6cbf55 }, { shadow: false }); artInst(scene, 'hpatch', S3, { c: 0xd8c08a }, { shadow: false }); artInst(scene, 'hpatch', V, { c: 0x8fae5a }, { shadow: false }); }
/* 개울 · 여울 징검돌 — 개울은 곧게 비스듬한 줄(creekX)이라 기울인 띠(모래 둑 · 물 · 여울 · 물)로 그린다. 물 = |x − creekX| < 2.6, 여울(FORD)은 밝고 얕게 */
{ const ang = Math.atan(0.085), k = Math.cos(ang), strip = (z0, z1, hw, y, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(hw * 2 * k, 0.1, (z1 - z0) / k), mat); m.position.set(creekX((z0 + z1) / 2), y - 0.05, (z0 + z1) / 2); m.rotation.y = ang; m.receiveShadow = true; scene.add(m); };
  const water = new THREE.MeshStandardMaterial({ color: 0x3a8ad8, roughness: 0.25, metalness: 0.15, flatShading: true });
  strip(22.6, 141, 3.6, 0.03, M(0xd8c08a)); strip(24, FORD[0], 2.6, 0.045, water); strip(FORD[0], FORD[1], 3.3, 0.04, M(0x5ea9cc, { roughness: 0.35 })); strip(FORD[1], 141, 2.6, 0.045, water);
  const ST = []; for (let k = 0; k < 16; k++) { const z = FORD[0] + 1 + (k % 4) * 3 + rndA(), x = creekX(z) - 2.4 + Math.floor(k / 4) * 1.6 + rndA() * 0.5; ST.push([x, 0, z, [0.62 + rndA() * 0.12, 0.5, 0.6], k]); } artInst(scene, 'rock_flat', ST);
  /* 여울 바닥 자갈 · 물과 만나는 두 끝의 자갈 띠 */
  const GV = []; for (let k = 0; k < 46; k++) { const edge = k < 20, z = edge ? (k % 2 ? FORD[0] : FORD[1]) + (rndA() - 0.5) * 0.9 : FORD[0] + 0.6 + rndA() * (FORD[1] - FORD[0] - 1.2); GV.push([creekX(z) + (rndA() - 0.5) * 6.2, 0, z, edge ? 0.3 + rndA() * 0.25 : 0.14 + rndA() * 0.16, rndA() * 6.28]); } artInst(scene, 'rock_a', GV, {}, { shadow: false });
  /* 둑: 물가 돌 · 갈대 · 풀섶 */
  const BR = [], RD = [], GR = []; for (let z = 25.5; z < 139; z += 1.6 + rndA() * 2.2) { if (z > FORD[0] - 1 && z < FORD[1] + 1) continue; const s = rndA() < 0.5 ? -1 : 1, x = creekX(z) + s * (2.75 + rndA() * 0.6), r = rndA();
    if (r < 0.45) BR.push([x, 0, z, 0.35 + rndA() * 0.4, rndA() * 6.28]); else if (r < 0.7) for (let j = 0; j < 3; j++) RD.push([x + s * rndA() * 0.5, 0, z + (rndA() - 0.5) * 1.4, 0.55 + rndA() * 0.3, rndA() * 6.28]); else GR.push([x + s * 0.4, 0, z, 1.4 + rndA() * 0.7, rndA() * 6.28]); }
  artInst(scene, 'rock_a', BR); artInst(scene, 'hreed', RD, {}, { shadow: false }); FINE.push(artInst(scene, 'htuft', GR, {}, { shadow: false })); }
/* 강 물결 */
const riverG = new THREE.PlaneGeometry(W + 300, 40, 70, 10); riverG.rotateX(-Math.PI / 2);
const river = new THREE.Mesh(riverG, new THREE.MeshStandardMaterial({ color: 0x3a8ad8, roughness: 0.25, metalness: 0.15, flatShading: true })); river.position.set(W / 2, 0.02, 161); river.receiveShadow = true; scene.add(river);
const riverBase = riverG.attributes.position.array.slice();
flat(-240, 181, W + 240, 420, 0x5aa04a, 0.3);
/* 판 밖 세 겹: 강 건너 들과 떼 · 언덕 · 먼 산 능선 두 겹 */
{ const o = new THREE.Object3D(), put = (im, i, x, y, z, sx, sy, sz, ry = 0) => { o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(0, ry, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); };
  const lam = (c, fog = true) => new THREE.MeshLambertMaterial({ color: c, flatShading: true, fog });
  const HL = []; for (let i = 0; i < 34; i++) { const k = i % 4; let x, z; if (k === 0) { x = -30 - rndA() * 90; z = rndA() * 170; } else if (k === 1) { x = rndA() * 220; z = -40 - rndA() * 80; } else if (k === 2) { x = W + 20 + rndA() * 90; z = rndA() * 170; } else { x = -60 + rndA() * 320; z = 200 + rndA() * 90; } HL.push([x, -1, z, [20 + rndA() * 26, (5 + rndA() * 10) / 0.56, 20 + rndA() * 26], rndA() * 6.28]); }
  artInst(scene, 'hill', HL, { c: 0x62b04e }, { shadow: false });
  const ridgeGeo = new THREE.ConeGeometry(1, 1, 5); ridgeGeo.translate(0, 0.5, 0);
  for (const [c, r0, n, h0] of [[0x7f95b8, 225, 24, 30], [0xa9b8d2, 268, 18, 52]]) { const im = new THREE.InstancedMesh(ridgeGeo, lam(c, false), n); for (let i = 0; i < n; i++) { const a = -2.9 + (i / (n - 1)) * 4.3 + rndA() * 0.06, r = r0 + rndA() * 16; put(im, i, W / 2 + Math.cos(a) * r, -4, H / 2 + Math.sin(a) * r, 46 + rndA() * 30, h0 + rndA() * 30, 40 + rndA() * 20, rndA() * 3); } im.frustumCulled = false; scene.add(im); }
  /* 강 건너 들에 다른 짐승 떼 */
  const FAR = []; for (let i = 0; i < 26; i++) FAR.push([60 + (i % 13) * 3.2 + rndA() * 2 + Math.floor(i / 13) * 70, 0.3, 196 + rndA() * 14, 1.1, rndA() * 6.28]); artInst(scene, 'hdeer_far', FAR, { fur: 0x9a7048 }, { shadow: false }); }
/* 벼랑(SOLID 의 cliff 네모에 맞춰 블렌더에서 통째로 지은 한 덩이 — 뒤로 솟은 산마루·동쪽 높은 마루까지) · 바위 · 막집 */
for (const n of ['cliffs_v', 'cliffs_e', 'cliffs_n']) scene.add(art(n));
function rock([x0, z0, x1, z1, h], i) { const w = x1 - x0, d = z1 - z0, long = d > w, L = Math.max(w, d), Sh = Math.min(w, d), mt = artMat.clone(), P = [];
  /* a = 긴 쪽 자리(0~1) · b = 짧은 쪽 자리 · la·sb = 긴 쪽·짧은 쪽 크기(m) */
  const put = (n, a, b, la, sb, hh, turn) => { const u = (a - 0.5) * L, v = (b - 0.5) * Sh; P.push(fit(own(n, mt), n, (x0 + x1) / 2 + (long ? v : u), (z0 + z1) / 2 + (long ? u : v), long ? sb : la, hh, long ? la : sb, turn)); };
  if (L / Sh > 1.3) { const f = i % 2; put('rock_big', f ? 0.64 : 0.36, 0.5, L * 0.72, Sh * 1.06, h, !!f); put(i % 3 ? 'rock_big' : 'rock_tall', f ? 0.22 : 0.78, f ? 0.42 : 0.58, L * 0.46, Sh * 0.84, h * (i % 3 ? 0.7 : 0.94), !f); }
  else put('rock_big', 0.5, 0.5, L * 1.08, Sh * 1.08, h, i % 2 === 1);
  if (L > 2.6) put('rock_b', i % 2 ? 1 - 0.7 / L : 0.7 / L, 0.5 / Sh, 1.4, 1.0, 0.8, i % 2 === 0);
  put('rock_a', i % 2 ? 0.45 / L : 1 - 0.45 / L, 1 - 0.4 / Sh, 0.9, 0.8, 0.5, i % 2 === 1);
  group([x0, z0, x1, z1], [merge(P, mt)]); }
/* 막집: 나뭇가지를 기대 세우고 가죽을 덮은 집 — 문은 모닥불 쪽 */
function hut([x0, z0, x1, z1], i) { const m = own('makjip', artMat.clone()); m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.rotation.y = i ? -0.8 : 0.8; group([x0, z0, x1, z1], [m]); }
{ let ri = 0, hi = 0; for (const s of SOLID) { if (s[5] === 'rock') rock(s, ri++); else if (s[5] === 'hut') hut(s, hi++); } }
/* 숲: 같은 나무끼리 한데 묶어(그림 한 번씩) 서쪽·북쪽 가장자리와 벼랑 위를 두른다. 키 큰 나무는 놀이판 바깥에만 — 남쪽(카메라 쪽, 강)은 비운다 */
{ const T = {}, kind = () => { const k = rndA(); return k < 0.34 ? 'hpine_a' : k < 0.56 ? 'hpine_b' : k < 0.74 ? 'tree_a' : k < 0.9 ? 'tree_b' : 'tree_a|y'; };
  const band = (n, x0, z0, x1, z1, y, s0, s1, far = '') => { for (let i = 0; i < n; i++) { const k = kind() + far; (T[k] = T[k] || []).push([x0 + rndA() * (x1 - x0), y, z0 + rndA() * (z1 - z0), s0 + rndA() * (s1 - s0), rndA() * 6.28]); } };
  band(66, -14, -6, 4.2, 132, 0, 1.0, 1.5); band(66, -6, -12, 117, 4, 0, 1.0, 1.5);
  band(9, 119.5, 1.2, 149, 6.2, 4.7, 0.8, 1.05); band(5, 152, 1.8, 162.2, 8.6, 5.2, 0.8, 1.1); band(10, 184.6, 2, 212, 14.6, 7.2, 0.8, 1.15); band(30, 194.8, 18.5, 212, 140, 6.2, 0.8, 1.15);
  band(8, 114, -9, 154, -1.5, 7.7, 0.9, 1.3); band(8, 157, -11, 198, -1.8, 11.7, 0.9, 1.3); band(5, 164, -22, 191, -11, 15.7, 1, 1.4);
  band(34, -50, -60, 250, -18, 0, 1.3, 1.9, '~'); band(20, -52, 0, -16, 130, 0, 1.3, 1.9, '~'); band(12, 216, -10, 240, 140, 0, 1.2, 1.7, '~'); band(20, -40, 186, 240, 200, 0.3, 1.2, 1.8, '~');
  for (const k in T) instC(k.replace(/\|y|~/g, ''), T[k], k.includes('|y') ? { leaf: 0x86a84a } : {}, { shadow: !k.endsWith('~') }, k.endsWith('~') ? 1e4 : 64); }
LONE_TREES.forEach(([x, z, r], i) => { const m = own(i % 2 ? 'tree_b' : 'tree_a', artMat.clone(), { leaf: [0x4f9a45, 0x5f9c3e, 0x478f4a][i % 3] }); m.position.set(x, 0, z); m.scale.setScalar(r * (i % 2 ? 0.5 : 0.56)); m.rotation.y = i * 1.7; group([x - 1.6, z - 0.4, x + 1.6, z + 0.4], [m]); });
/* 바람 타는 풀: 풀잎이 눕는 쪽 = 바람이 가는 쪽 */
const windU = { uTime: { value: 0 }, uWind: { value: new THREE.Vector2(-0.7, -0.7) } };
{ const geo = new THREE.CylinderGeometry(0.012, 0.07, 0.9, 3, 1, true); geo.translate(0, 0.45, 0);
  const mat = M(0x8fd66a); mat.onBeforeCompile = (sh) => { sh.uniforms.uTime = windU.uTime; sh.uniforms.uWind = windU.uWind; sh.vertexShader = 'uniform float uTime; uniform vec2 uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    float hh = position.y; vec2 ip = vec2(instanceMatrix[3].x, instanceMatrix[3].z); float sw = 0.55 + 0.3 * sin(uTime * 2.3 + ip.x * 0.31 + ip.y * 0.23);
    transformed.x += uWind.x * hh * hh * sw * 0.9; transformed.z += uWind.y * hh * hh * sw * 0.9;`); };
  const N = 5200, o = new THREE.Object3D(), by = {}; let n = 0; /* 30m 칸마다 한 묶음 — 화면 밖 칸, 멀리(62m 넘게) 떨어진 칸은 그리지 않는다 */
  for (let i = 0; i < N * 3 && n < N; i++) { const x = 6 + rndA() * 186, z = 5 + rndA() * 130; if (x > 163 && z < 18) continue; if (inCreek(x, z) || Math.abs(x - creekX(z)) < 3.4) continue; if (dist(x, z, FIRE[0], FIRE[1]) < 7) continue; o.position.set(x, 0, z); o.scale.set(1, 0.6 + rndA() * 0.9, 1); o.updateMatrix(); const k = Math.floor(x / 30) + ',' + Math.floor(z / 30); (by[k] = by[k] || []).push(o.matrix.clone()); n++; }
  for (const k in by) { const im = new THREE.InstancedMesh(geo, mat, by[k].length); by[k].forEach((mx, i) => im.setMatrixAt(i, mx)); im.computeBoundingSphere(); im.boundingSphere.radius += 1; scene.add(im); const [cx, cz] = k.split(',').map((v) => (+v + 0.5) * 30); GRASS.push({ m: im, x: cx, z: cz }); } }

/* 야영지: 모닥불(돌 두른 장작 + 불꽃) · 연기 · 가죽 걸이 · 장작 · 땅에 펴 말리는 가죽 */
const hearth = art('bonfire'); hearth.position.set(FIRE[0], 0, FIRE[1]); hearth.scale.setScalar(1.25); scene.add(hearth);
const fire = new THREE.Mesh(artGeo('flame', {}, true), artGlowMat); fire.position.set(FIRE[0], 0.12, FIRE[1]); scene.add(fire);
const fireL = new THREE.PointLight(0xff8a3a, 10, 16, 1.6); fireL.position.set(FIRE[0], 1.6, FIRE[1]); scene.add(fireL);
const fireGlow = glowSprite(scene, 'rgba(255,200,120,.9)', 'rgba(255,120,40,0)', 5); fireGlow.position.set(FIRE[0], 1.2, FIRE[1]);
const smoke = []; for (let k = 0; k < 7; k++) { const s = new THREE.Mesh(artGeo('puff'), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, transparent: true, opacity: 0.5, depthWrite: false })); s.userData.k = k / 7; scene.add(s); smoke.push(s); }
{ const r = art('hiderack'); r.position.set(32.75, 0, 134); scene.add(r);
  const w = art('firewood'); w.position.set(21.15, 0, 130.75); w.rotation.y = 0.75; w.scale.setScalar(0.8); scene.add(w);
  const h = art('hide_flat'); h.position.set(36.6, 0, 132.4); h.rotation.y = 0.5; scene.add(h);
  const f = art('flakes'); f.position.set(ANVIL[0] + 0.5, 0.03, ANVIL[1] + 0.9); scene.add(f); }
/* 돌 받침(주먹도끼 만드는 곳) · 몸돌 */
const anvil = fit(art('rock_flat'), 'rock_flat', ANVIL[0], ANVIL[1], 1.9, 0.72, 1.6); scene.add(anvil);
const core = new THREE.Mesh(artGeo('flint'), popMat(0x2a2620)); at(core, ANVIL[0], 0.94, ANVIL[1]); core.castShadow = true; scene.add(core);
const kRing = new THREE.Mesh(new THREE.RingGeometry(0.88, 1, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })); kRing.rotation.x = -Math.PI / 2; kRing.visible = false; scene.add(kRing);
const kMark = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.5, 36), new THREE.MeshBasicMaterial({ color: 0xffcf4d, transparent: true, opacity: 0.9, depthWrite: false })); kMark.rotation.x = -Math.PI / 2; kMark.position.set(ANVIL[0], 0.75, ANVIL[1]); kMark.visible = false; scene.add(kMark);
const chips = []; { const cg = new THREE.TetrahedronGeometry(0.1), cm = M(0xe2ddd0); cg.scale(1, 0.45, 0.8); for (let k = 0; k < 10; k++) { const c = new THREE.Mesh(cg, cm); c.visible = false; scene.add(c); chips.push({ m: c, t: 9, vx: 0, vy: 0, vz: 0 }); } }
/* 횃불 둘(목표) — 어귀 양쪽 사람이 든다 */
const torchGlows = TORCHMEN.map(([x, z]) => { const g = glowSprite(scene, 'rgba(255,230,160,.95)', 'rgba(255,150,50,0)', 6); g.position.set(x + 0.5, 2.9, z + 0.25); return g; });
const goalPos = new THREE.Vector3(MOUTH[0], 2.4, MOUTH[1]);
/* 불이 꺼진 밤 — 어둠 속 짐승 눈 */
const eyes = new THREE.Group(); for (const [x, z] of [[17, 125], [31, 124.5], [14, 130.5]]) for (const s of [-0.18, 0.18]) eyes.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.06), new THREE.MeshBasicMaterial({ color: 0xffe27a, fog: false })), x + s, 0.9, z)); eyes.visible = false; scene.add(eyes);

/* 사람 — 가죽옷(맨팔·맨다리), 헝클어진 머리 */
const SKIN = 0xf0c48e, PALEO = { hat: 'wild', style: 'hide', skin: SKIN };
const pMesh = person({ shirt: 0xb57a45, pants: 0x7a5230, ...PALEO });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const comps = [0, 1].map((i) => ({ i, mesh: person({ shirt: i ? 0x8e6a44 : 0xa36e3a, pants: 0x6a4a2a, ...PALEO, spear: true, hairC: i ? 0x4a3020 : 0x2b2118 }), x: 0, z: 0, tx: 0, tz: 0, state: 'follow', dir: 0, slow: false, moving: false }));
const torchmen = TORCHMEN.map(([x, z], i) => { const m = person({ shirt: 0x9a6a3e, pants: 0x6a4a2a, ...PALEO, torch: true }); m.position.set(x, 0, z); m.rotation.y = i ? -0.5 : 0.5; return { mesh: m, x, z, hx: x, hz: z }; });
/* ───── 무리(2026-11-19 준호: 「각기 다른 사람들이 움직이고 자기 일을 하게」) — 야영지의 여섯. 저마다 제 일을 하고, 그 일이 내 사냥과 이어진다.
   불지기 할머니(내가 한 번 넣은 불을 이어 지킨다) · 돌 깨는 이(돌멩이를 건넨다) · 열매 따는 둘(한낮에 먹을 것 하나) · 가죽 다듬는 이 · 아이 둘(배웅) ───── */
const mk = (o, sc) => { const m = person({ pants: 0x6a4a2a, ...PALEO, ...o }); m.rotation.order = 'YXZ'; if (sc) m.scale.setScalar(sc); return m; };
const band = [
  { k: 'keeper', mesh: mk({ shirt: 0x8a6240, hairC: 0xc9c4bc }), sp: 1.5, route: [[25.9, 131.3, 6, 1], [21.6, 126.8, 1.6, 0]] },
  { k: 'knap', mesh: mk({ shirt: 0x9a6c3c, hairC: 0x2b2118 }), sp: 0, route: [[15.7, 138.9, 99, 1]], face: [ANVIL[0], ANVIL[1]] },
  { k: 'gather', mesh: mk({ shirt: 0xa87a4a, hairC: 0x3a2618 }), sp: 2.1, route: [[27.6, 132.4, 2, 0], [12.5, 113, 4.5, 1]] },
  { k: 'gather', mesh: mk({ shirt: 0x94683c, hairC: 0x4a3020 }), sp: 2.0, route: [[30.4, 132.2, 2.6, 0], [41, 123.5, 4.2, 1], [48, 128, 3, 1]] },
  { k: 'scrape', mesh: mk({ shirt: 0xb0804c, hairC: 0x2b2118 }), sp: 0, route: [[33.9, 135.3, 99, 1]], face: [32.75, 134] },
  { k: 'kid', mesh: mk({ shirt: 0xb98a52, hairC: 0x2b2118 }, 0.6), ph: 0 },
  { k: 'kid', mesh: mk({ shirt: 0xa5743e, hairC: 0x4a3020 }, 0.56), ph: -0.9 },
];
function bandReset() { for (const b of band) { b.i = 0; b.wait = 0; b.trips = 0; if (b.route) { b.x = b.route[0][0]; b.z = b.route[0][1]; } else { b.x = FIRE[0] + 4; b.z = FIRE[1] - 2; } b.mesh.visible = true; b.mesh.rotation.x = 0; b.mesh.scale.y = b.mesh.scale.x; b.mesh.position.set(b.x, 0, b.z); } S.gift = false; S.bandFood = false; S.seenOff = false; S.kidA = 0; }
function bandUpdate(dt) {
  if (S.mode === 'camp') return;
  const play = S.mode === 'play', wolfOn = wolves.some((w) => w.state === 'come' || w.state === 'harass'), pd = dist(S.px, S.pz, FIRE[0], FIRE[1]);
  for (const b of band) { const m = b.mesh; let moving = false, work = false;
    if (b.k === 'kid') { /* 모닥불 둘레에서 잡기 놀이 → 내가 떠날 때 따라 나와 배웅 */
      let tx, tz; const follow = play && !S.seenOff && S.t > 1 && S.pz > 118 && pd < 34;
      if (follow) { tx = S.px + (b.ph ? 1.6 : -1.4); tz = S.pz + 2.2 + (b.ph ? 0.8 : 0); }
      else { S.kidA += dt * 0.55; const a = S.kidA + b.ph; tx = FIRE[0] + Math.cos(a) * 5.6; tz = FIRE[1] - 1.2 + Math.sin(a) * 3.3; }
      const d = dist(b.x, b.z, tx, tz); if (d > 0.3) { const sp = Math.min(follow ? 4.4 : 3.6, d * 3); b.x += (tx - b.x) / d * sp * dt; b.z += (tz - b.z) / d * sp * dt; m.rotation.y = -Math.atan2(tz - b.z, tx - b.x) + Math.PI / 2; moving = true; }
      m.position.set(b.x, moving ? Math.abs(Math.sin(S.t * 9 + b.ph)) * 0.12 : 0, b.z); walkAnim(m, S.t * 15 + b.ph * 3, moving); continue; }
    const r = b.route[b.i], d = dist(b.x, b.z, r[0], r[1]), scared = wolfOn && b.k === 'gather';
    if (scared) { m.scale.y = m.scale.x * 0.82; }
    else { m.scale.y = m.scale.x;
      if (d > 0.25 && b.sp) { b.x += (r[0] - b.x) / d * b.sp * dt; b.z += (r[1] - b.z) / d * b.sp * dt; m.rotation.y = -Math.atan2(r[1] - b.z, r[0] - b.x) + Math.PI / 2; moving = true; }
      else { b.wait += dt; work = !!r[3]; if (b.face) m.rotation.y = -Math.atan2(b.face[1] - b.z, b.face[0] - b.x) + Math.PI / 2;
        if (b.wait > r[2]) { b.wait = 0; if (b.k === 'gather' && r[3]) b.trips++; b.i = (b.i + 1) % b.route.length;
          if (b.k === 'keeper' && b.i === 1 && play && S.fed && S.fuel > 0 && S.fuel < 0.6) { S.fuel = Math.min(1, S.fuel + 0.25); if (pd < 40) { ring(FIRE[0], FIRE[1], 3, 0xffb040); say('할머니가 불에 나무를 넣는다 — 불은 무리가 이어 지킨다', 'keeper', 3); } } } } }
    m.rotation.x = work ? 0.22 + Math.sin(S.t * (b.k === 'knap' ? 7 : 4.5) + b.x) * 0.2 : 0;
    m.position.set(b.x, 0, b.z); walkAnim(m, S.t * 9 + b.x, moving);
    if (b.k === 'knap' && play && pd < 16 && Math.sin(S.t * 7 + b.x) > 0.985) SFX.clack(); }
  if (!play) return;
  /* 이어짐: 돌멩이 건네기 · 배웅 · 무리가 모은 먹을 것 */
  const kn = band[1]; if (!S.gift && !S.axe && S.stones < 2 && dist(S.px, S.pz, kn.x, kn.z) < 2.8) { S.gift = true; S.stones = 2; hud(); SFX.pick(); ring(kn.x, kn.z, 2.2, 0xffcf4d); say('돌 깨는 이가 돌멩이를 건넨다 — 모루돌 앞에 서서 깨 보자', null, 3.2); }
  if (!S.seenOff && S.t > 2 && (S.pz < 118 || pd > 34)) { S.seenOff = true; if (S.t < 60) say('아이들이 손을 흔든다 — 「많이 몰아 와!」', null, 2.6); }
  if (!S.bandFood && S.sun > 0.42 && band[2].trips + band[3].trips >= 3) { S.bandFood = true; S.food++; hud(); say('무리가 열매와 뿌리를 모아 왔다 — 먹을 것 하나', null, 3); }
}
const tmark = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.95, 28), new THREE.MeshBasicMaterial({ color: 0xffcf4d, transparent: true, opacity: 0.8, depthWrite: false })); tmark.rotation.x = -Math.PI / 2; tmark.visible = false; scene.add(tmark);

/* 사슴 · 늑대 — 블렌더 모델을 조각(몸통 · 목 · 다리 넷)으로 받아 예전처럼 다리를 흔들고 목을 숙인다.
   모델은 머리가 +z, 떼의 셈은 머리가 +x 라서 조각마다 반의반 바퀴 돌려 제 돌림 중심에 붙인다 */
function beast(pre, tints, neck) { const g = new THREE.Group(), u = { legs: [] };
  const part = (names) => { const P = new THREE.Group(), m = own(names, artMat, tints), pv = ART[names[0]].pivot; m.rotation.y = Math.PI / 2; P.position.set(pv.z, pv.y, -pv.x); P.add(m); g.add(P); return P; };
  part([pre + '_body']); if (neck) u.neck = part(neck);
  for (const n of ['legFL', 'legFR', 'legBL', 'legBR']) u.legs.push(part([pre + '_' + n]));
  g.userData = u; scene.add(g); return g; }
function deerMesh(stag, i) { const g = beast('hdeer', { fur: [0xc58a4a, 0xb67c40, 0xcf9656][i % 3] }, stag ? ['hdeer_neck', 'hdeer_antler'] : ['hdeer_neck']); g.scale.setScalar(stag ? 1.06 : 0.9 + (i % 3) * 0.04); return g; }
function wolfMesh() { const g = beast('hwolf', {}); g.scale.setScalar(1.15); g.visible = false; return g; }
for (let i = 0; i < 20312; i++) rnd(); /* 예전에 꾸밈(땅 얼룩·개울 돌·언덕·숲·풀)에 쓰던 만큼 흘려보낸다 — 떼·늑대의 운이 예전과 똑같게 */
const deer = Array.from({ length: NDEER }, (_, i) => ({ i, mesh: deerMesh(i % 4 === 0, i), x: 0, z: 0, vx: 0, vz: 0, dir: 0, alarm: 0, panic: 0, pdx: 0, pdz: 0, wander: rnd() * 6.28, inside: false, lost: false, free: 0, oa: (i / NDEER) * 6.28, or: 0.8 + (i % 3) * 0.95, head: 0, phase: rnd() * 6 }));
const wolves = [0, 1].map((i) => ({ i, mesh: wolfMesh(), x: WOLF_FROM[i][0], z: WOLF_FROM[i][1], state: 'off', t: 0, dir: 0, hits: 0, ang: 0, phase: 0, vx: 0, vz: 0 }));
/* 줍는 것: 돌멩이 · 나뭇가지 · 열매 덤불 · 뿌리 */
const stoneGeo = artGeo('pebble'), stoneMat = popMat(0x3a3830);
const flying = new THREE.Mesh(stoneGeo, stoneMat); flying.visible = false; scene.add(flying);
const stickGeo = artGeo('branch'), stickMat = popMat(0x2a1808);
const berryMat = popMat(0x501018);
const bushes = BUSHES.map(([x, z], i) => { const g = new THREE.Group(), b = new THREE.Mesh(artGeo('hberries'), berryMat); b.castShadow = true; g.add(art('hbush', { leaf: 0x3e9a4c }), b); g.position.set(x, 0, z); g.rotation.y = i * 1.1; scene.add(g); return { x, z, g, b, on: true }; });
const roots = ROOTS.map(([x, z], i) => { const g = art('rootplant'); g.position.set(x, 0, z); g.rotation.y = i * 2; g.scale.setScalar(1.3); scene.add(g); return { x, z, g, on: true }; });
/* 풀섶 · 꽃 · 돌 · 덤불 · 갈대 — 뿌리기(줍는 것·횃불·모닥불·막는 것·개울·날마다의 발자국 길 둘레는 비운다 — 놀이에 쓰이는 것을 가리지 않게) */
{ const KEEP = [[FIRE[0], FIRE[1], 5.5], [START[0], START[1], 2.6], [ANVIL[0], ANVIL[1], 2.4], [32.75, 134, 2.4], [36.6, 132.4, 1.8], ...TORCHMEN.map(([x, z]) => [x, z, 2.2]), ...STONES0.map(([x, z]) => [x, z, 1.2]), ...STICKS0.map(([x, z]) => [x, z, 1.3]), ...BUSHES.map(([x, z]) => [x, z, 2.4]), ...ROOTS.map(([x, z]) => [x, z, 1.8])];
  const trail = new Uint8Array(W * H); /* 발자국 길(layPrints 와 같은 굽은 줄) 둘레 1m 칸 */
  for (const h of HERD_AT) { const a = [34, 122], n = Math.min(78, Math.floor(dist(a[0], a[1], h[0], h[1]) / 1.7)); for (let i = 1; i < n; i++) { const t = i / n, x = lerp(a[0], h[0], t) + Math.sin(t * Math.PI) * 9 * (h[0] > 40 ? 1 : -1), z = lerp(a[1], h[1], t); for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) { const gx = Math.floor(x) + dx, gz = Math.floor(z) + dz; if (gx >= 0 && gx < W && gz >= 0 && gz < H) trail[gz * W + gx] = 1; } } }
  const busy = (x, z, pad = 0.6) => SOLID.some((s) => inRect(x, z, s, pad)) || KEEP.some(([a, b, r]) => dist(x, z, a, b) < r) || nearCreek(x, z) || (x >= 0 && z >= 0 && trail[Math.floor(z) * W + Math.floor(x)] === 1);
  sprinkle({ fine: true, area: [5, 5, 193, 135], n: 340, names: ['htuft'], avoid: (x, z) => busy(x, z) || (x > 163 && z < 18), scale: [1.3, 2.3], shadow: false });
  const F = { 0xffd84a: [], 0xfff4e8: [], 0xe87a9a: [] }, fn = Object.keys(F);
  for (let c = 0; c < 28; c++) { const cx = 7 + rndA() * 184, cz = 7 + rndA() * 126; for (let k = 0; k < 6; k++) { const x = cx + (rndA() - 0.5) * 4.4, z = cz + (rndA() - 0.5) * 3.6; if (!busy(x, z)) F[fn[c % 3]].push([x, 0, z, 1.5 + rndA() * 0.9, rndA() * 6.28]); } }
  for (const n of fn) instC('hflower', F[n], { c: +n }, { shadow: false }, 96, true);
  sprinkle({ area: [6, 6, 192, 134], n: 50, names: ['rock_a'], avoid: (x, z) => busy(x, z, 1.2), scale: [0.3, 0.7] });
  sprinkle({ area: [-30, 141, 230, 144.6], n: 30, names: ['rock_b', 'rock_flat', 'rock_a'], avoid: (x) => Math.abs(x - creekX(141)) < 4, scale: [0.7, 1.4], minGap: 2.6 });
  const R = []; for (let c = 0; c < 24; c++) { const cx = -30 + rndA() * 260, cz = 141.6 + rndA() * 1.6; for (let k = 0; k < 3; k++) R.push([cx + (rndA() - 0.5) * 1.8, 0, cz + (rndA() - 0.5), 0.6 + rndA() * 0.3, rndA() * 6.28]); } artInst(scene, 'hreed', R, {}, { shadow: false });
  sprinkle({ area: [-2, 4, 5.1, 132], n: 26, names: ['bush', 'bush', 'stump'], tints: { leaf: 0x3f7f3e }, scale: [0.9, 1.5] }); sprinkle({ area: [5, -1, 117, 5.3], n: 26, names: ['bush', 'bush', 'stump'], tints: { leaf: 0x3f7f3e }, scale: [0.9, 1.5] });
  artInst(scene, 'log', [[3.2, 0, 116.4, 1, 0.5], [22, 0, 3.4, 1.1, 1.2], [1.6, 0, 74, 0.9, 2.4], [70, 0, 2.8, 1, 0.3], [2.4, 0, 40, 1, 1.9]]);
  artInst(scene, 'bush', [[165.7, 7.25, 4.2, 1.1, 0], [165.8, 7.25, 9.6, 0.9, 2], [165.6, 7.25, 13.8, 1.2, 4], [169.4, 8.25, 1.3, 1, 1], [174.6, 8.25, 1.2, 1.2, 3], [179.8, 8.25, 1.4, 0.9, 5], [190, 7.25, 15, 1.2, 1], [196.5, 6.25, 44, 1.1, 2], [197, 6.25, 92, 1.2, 4], [196.2, 6.25, 128, 1, 1], [156, 5.25, 9.2, 1.2, 3], [126, 4.75, 6, 1, 2], [141, 4.75, 6.2, 1.1, 5]], { leaf: 0x4a8a40 });
  /* 골짜기 안: 벽 밑에 굴러떨어진 돌 · 풀섶 */
  artInst(scene, 'rock_a', [[168.3, 0, 5.6, 0.9, 0], [168.2, 0, 11.4, 0.6, 2], [181.8, 0, 7.2, 0.8, 4], [181.7, 0, 12.6, 0.6, 1], [172, 0, 3.7, 0.8, 3], [178.4, 0, 3.6, 0.6, 5], [175.2, 0, 3.5, 0.5, 2]]); artInst(scene, 'rock_b', [[170, 0, 3.8, 0.7, 1], [180.8, 0, 4, 0.6, 3]]);
  sprinkle({ fine: true, area: [168.6, 4.4, 181.4, 13], n: 16, names: ['htuft'], scale: [1.3, 2.2], y: 0.03, shadow: false });
  /* 벼랑 위 풀섶 */
  for (const [x0, z0, x1, z1, y, n] of [[184.4, 2, 212, 14.8, 7.27, 12], [194.6, 18, 212, 140, 6.27, 26], [151.8, 1.6, 162.6, 8.8, 5.27, 8], [119.5, 1.2, 149, 6.4, 4.77, 12]]) sprinkle({ fine: true, area: [x0, z0, x1, z1], n, names: ['htuft'], scale: [1.3, 2.2], y, shadow: false }); }

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
  next: 0, shoutCD: 0, fly: null, beatT: 0, stepT: 0, digT: 0, introT: 0, endT: 0, kPhase: 0, kTick: false, slowComp: false, wind: WINDS[0], ground: [], sticksOn: [], herdSide: 1, endWhy: '', lastShout: -9, stamp: 0, stA: 0, stampDone: false, dustT: 0, shake: 0 };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 「뛰기」 · 「소리」 · 땅을 누르면 동료가 그 자리에 선다 · 늑대를 누르면 돌 던지기 · 「시점」 ⟲⟳';
let stoneMeshes = [], stickMeshes = [];

/* 발자국: 야영지 북쪽에서 그날 떼가 있는 곳까지 — 1막의 길잡이 */
const printsIM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.03, 0.34), new THREE.MeshBasicMaterial({ color: 0x3f6a34 }), 160); printsIM.frustumCulled = false; scene.add(printsIM);
function layPrints(h) { const o = new THREE.Object3D(), a = [34, 122], n = Math.min(78, Math.floor(dist(a[0], a[1], h[0], h[1]) / 1.7)); let k = 0;
  for (let i = 1; i < n; i++) { const t = i / n, bend = Math.sin(t * Math.PI) * 9 * (h[0] > 40 ? 1 : -1), x = lerp(a[0], h[0], t) + bend, z = lerp(a[1], h[1], t), t2 = (i + 1) / n, ang = Math.atan2(lerp(a[1], h[1], t2) - z, lerp(a[0], h[0], t2) + Math.sin(t2 * Math.PI) * 9 * (h[0] > 40 ? 1 : -1) - x);
    if (insideSolid(x, z)) continue; for (const sd of [-1, 1]) { o.position.set(x - Math.sin(ang) * 0.22 * sd, 0.12, z + Math.cos(ang) * 0.22 * sd); o.rotation.set(0, -ang + Math.PI / 2, 0); o.updateMatrix(); printsIM.setMatrixAt(k++, o.matrix); } }
  printsIM.count = k; printsIM.instanceMatrix.needsUpdate = true; }

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
  Object.assign(S, { t: 0, sun: 0, px: START[0], pz: START[1], pdir: -Math.PI / 2, moving: false, running: false, sticks: 0, food: 0, hits: 0, misses: 0, fuel: 0.55, fed: false, fireOut: false, nerve: 0, scatters: 0, inside: 0, smellT: 0, firstSmell: -1, next: 0, shoutCD: 0, fly: null, digT: 0, endT: 0, endWhy: '', stamp: 0, stampDone: false, shake: 0 });
  if (!S.axe) S.stones = 0;
  S.slowComp = S.day > 1;
  Object.assign(S, { hx: hx[0], hz: hx[1], hvx: 0, hvz: 0, veer: 0, veerT: 0, kick: 0, scatT: 0, lostN: 0, graze: 0 });
  deer.forEach((d, i) => { d.oa = (i / NDEER) * 6.28; Object.assign(d, { x: hx[0] + Math.cos(d.oa) * d.or, z: hx[1] + Math.sin(d.oa) * d.or, vx: 0, vz: 0, alarm: 0, inside: false, lost: false, free: 0 }); d.mesh.visible = true; });
  comps.forEach((c, i) => Object.assign(c, { x: START[0] + (i ? 1.6 : -1.6), z: START[1] + 1.2, state: 'follow', slow: S.slowComp && i === 1 }));
  torchmen.forEach((t) => { t.x = t.hx; t.z = t.hz; });
  wolves.forEach((w, i) => { Object.assign(w, { x: WOLF_FROM[i][0], z: WOLF_FROM[i][1], state: 'off', t: 0, hits: 0 }); w.mesh.visible = false; });
  for (const m of stoneMeshes) scene.remove(m); for (const m of stickMeshes) scene.remove(m); stoneMeshes = []; stickMeshes = [];
  S.ground = (S.axe ? STONES0.slice(0, 4) : STONES0).map(([x, z]) => { const m = new THREE.Mesh(stoneGeo, stoneMat); m.position.set(x, 0.2, z); m.rotation.y = x * 7; m.castShadow = true; scene.add(m); stoneMeshes.push(m); return { x, z, m, on: true }; });
  S.sticksOn = STICKS0.map(([x, z], i) => { const m = new THREE.Mesh(stickGeo, stickMat); m.position.set(x, 0.07, z); m.rotation.y = i * 1.3; m.castShadow = true; scene.add(m); stickMeshes.push(m); return { x, z, m, on: true }; });
  bushes.forEach((b) => { b.on = true; b.b.visible = true; }); roots.forEach((r) => { r.on = true; r.g.visible = true; });
  layPrints(hx); bandReset();
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
  const wet = inCreek(S.hx, S.hz);
  if (fear > 0.01) {
    const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l;
    S.veerT -= dt; if (S.veerT <= 0) { S.veerT = 0.15;
      const nl = sideCount(S.hx, S.hz, fx, fz, 1), nr = sideCount(S.hx, S.hz, fx, fz, -1);
      if (aheadBlocked(S.hx, S.hz, fx, fz)) S.veer = 1.35 * (nl < nr ? 1 : nl > nr ? -1 : S.herdSide); /* 앞이 막히면 덜 막힌 쪽으로 꺾어 벽을 따라간다 */
      else if (nl && nr) S.veer = 0; else if (nl) S.veer = -0.9; else if (nr) S.veer = 0.9;
      else { S.veer = (S.hx > 138 ? 1.2 : 0.55) * S.herdSide; if (S.mode === 'play' && dp < 11) say(S.hx > 138 ? '떼가 옆으로 샌다 — 땅을 눌러 동료를 양옆에 세우자' : '떼가 한쪽으로 슬슬 샌다 — 새는 쪽으로 돌아가 서거나, 땅을 눌러 동료를 세우자', S.hx > 138 ? 'leak' : 'drift', 3.4); } /* 넓은 들에서는 슬슬, 골짜기 앞에서는 크게 샌다 */ /* 양옆이 비면 옆으로 샌다 — 어느 쪽일지는 몇 초마다 바뀐다 */ }
    const cv = Math.cos(S.veer), sv = Math.sin(S.veer); wx = fx * cv - fz * sv; wz = fz * cv + fx * sv;
    sp = run ? lerp(2.6, 6.4, clamp(fear / 2, 0, 1)) : lerp(0.9, 3.3, clamp(fear, 0, 1));
    if (Math.abs(S.veer) > 1.1) sp *= 1.5; /* 옆이 트이면 그쪽으로 내빼듯 빠르게 샌다 — 걸어서는 못 따라간다 */
  } else { S.graze += (rnd() - 0.5) * dt; wx = Math.cos(S.graze); wz = Math.sin(S.graze); sp = 0.15; }
  if (S.kick > 0) { S.kick -= dt; wx = S.kdx; wz = S.kdz; sp = 6; }
  /* 폭주: 정한 쪽으로 내달린다. 곁에서 같이 뛰는 나·서 있는 동료의 반대쪽으로 꺾이고, 막힌 곳 앞에서는 트인 쪽으로 꺾는다 */
  if (S.stamp > 0) { S.stamp -= dt; const hx = Math.cos(S.stA), hz = Math.sin(S.stA); let turn = 0;
    const push = (sx, sz, r, k) => { const dx = sx - S.hx, dz = sz - S.hz, d = Math.hypot(dx, dz); if (d < r) turn -= Math.sign(hx * dz - hz * dx) * k * (1 - d / r); };
    push(S.px, S.pz, 24, run ? 1.25 : 0.6); for (const c of comps) if (c.state === 'stand') push(c.x, c.z, 15, 1.3);
    if (aheadBlocked(S.hx, S.hz, hx, hz) || aheadBlocked(S.hx + hx * 5, S.hz + hz * 5, hx, hz)) { const nl = sideCount(S.hx, S.hz, hx, hz, 1), nr = sideCount(S.hx, S.hz, hx, hz, -1); turn += (nl <= nr ? 1 : -1) * 2.6; }
    S.stA += turn * dt; wx = Math.cos(S.stA); wz = Math.sin(S.stA); sp = 5.2; fear = 2;
    S.dustT -= dt; if (S.dustT <= 0) { S.dustT = 0.22; ring(S.hx - wx * 2, S.hz - wz * 2, 4.5, 0xe2cfa0); if (rnd() < 0.5) SFX.hooves(); }
    S.shake = 1;
    if (S.stamp <= 0) { S.scatT = 1.6; S.nerve = 0.1; if (S.mode === 'play') say('떼가 멈춰 숨을 고른다 — 다시 천천히', null, 2.6); } }
  S.shake = Math.max(0, S.shake - dt * 1.6);
  let vx = wx * sp, vz = wz * sp;
  if (wet) { vx *= 0.45; vz *= 0.45; }
  /* 울타리: 곁에 선 동료·횃불 든 사람이 떼를 옆으로 밀어 준다(내 쪽으로 되밀지는 않는다) */
  const fence = (cx, cz, r) => { const d = dist(S.hx, S.hz, cx, cz) || 0.01; if (d >= r) return; let ax = (S.hx - cx) / d * (1 - d / r) * 3, az = (S.hz - cz) / d * (1 - d / r) * 3; if (fear > 0.01) { const dd = ax * fx + az * fz; if (dd < 0) { ax -= dd * fx; az -= dd * fz; } } vx += ax; vz += az; };
  for (const c of comps) if (c.state === 'stand') fence(c.x, c.z, 5.5); for (const t of torchmen) fence(t.x, t.z, 5);
  if (S.scatT > 0) { S.scatT -= dt; vx *= 0.2; vz *= 0.2; }
  S.hvx = lerp(S.hvx, vx, Math.min(1, dt * 2.5)); S.hvz = lerp(S.hvz, vz, Math.min(1, dt * 2.5));
  [S.hx, S.hz] = safeMove(S.hx, S.hz, S.hx + S.hvx * dt, S.hz + S.hvz * dt, 1.6, 1.2);
  const hsp = Math.hypot(S.hvx, S.hvz);
  /* 놀람: 뛰어서 다가가면, 바람을 등지고 다가가면 쌓이고 — 쌓이면 흩어진다 */
  if (S.mode === 'play' && wet) { if (S.stamp > 0) { S.stamp = 0; scatter(); say('개울에 뛰어들어 흩어졌다!', null, 2.4); } else { S.nerve += dt * 0.55; say('물에서 허둥댄다 — 징검돌 여울로 건너게 몰자', 'wet', 3.4); } }
  if (S.mode === 'play' && !(S.stamp > 0)) {
    if (sm) { S.smellT += dt; S.nerve += dt * 0.85 * (run ? 2 : 1) * clamp(1 - dp / 22, 0, 1); if (S.firstSmell < 0) S.firstSmell = dp; }
    if (run && dp < 13) S.nerve += dt * 0.6;
    if (S.nerve >= 1 && S.scatT <= 0) scatter();
    S.nerve = Math.max(0, S.nerve - dt * 0.14);
    if (dp < 30) say('저기, 사슴 떼다! — 바람을 안고 걸어서 다가가자', 'found', 3.2);
    if (dp < 15) say('걸어서 다가가면 조금, 뛰면 멀리 달아난다', 'near1', 3);
    if (S.hx > 142 && S.hz < 60) say('골짜기가 좁아진다 — 바위 줄의 틈은 동료를 세워 막자', 'funnel', 3.6);
    if (S.smellT > 0.8) say('킁— 냄새를 맡았다! 풀이 눕는 쪽이 바람이 가는 쪽 — 바람을 안고 다가가자', 'smell', 3.8);
  }
  /* 사슴 하나하나 */
  for (const d of deer) {
    if (d.inside) { d.wander += (rnd() - 0.5) * dt * 2; const tx = 174.5 + Math.cos(d.wander) * 4, tz = 8 + Math.sin(d.wander) * 3; const dx = tx - d.x, dz = tz - d.z, l = Math.hypot(dx, dz) || 1; d.vx = lerp(d.vx, dx / l * Math.min(1.5, l), dt * 2); d.vz = lerp(d.vz, dz / l * Math.min(1.5, l), dt * 2); moveBody(d, d.x + d.vx * dt, Math.min(d.z + d.vz * dt, 14.8), 0.5); }
    else if (d.lost) { d.free -= dt; d.vx = d.pdx * 5.5; d.vz = d.pdz * 5.5; d.x += d.vx * dt; d.z += d.vz * dt; if (d.free <= 0 || d.x < 2 || d.x > W - 4 || d.z < 3 || d.z > H - 8) d.mesh.visible = false; }
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
  const due = [DAY * 0.5, DAY * 0.62];
  wolves.forEach((w, i) => {
    if (i === 1 && S.day < 3) return;
    w.t += dt;
    if (w.state === 'off' && (S.t > due[i] || (i === 0 && S.stampDone && S.stamp <= 0)) && S.mode === 'play') { w.state = 'come'; w.mesh.visible = true; SFX.howl(); say('아우— 늑대다! 늑대를 눌러 돌을 던지자', null, 3.4); }
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
  seat(pMesh, 2.2); seat(comps[0].mesh, 3.3); seat(comps[1].mesh, 4.4); seat(torchmen[0].mesh, 5.4); seat(torchmen[1].mesh, 6.2);
  { const A = [2.75, 3.85, 4.9, 5.85, 0.25, 1.75, 2.05], Rr = [3.9, 3.9, 3.9, 3.9, 3.7, 3.5, 3.6]; band.forEach((b, i) => { const m = b.mesh; m.visible = true; m.rotation.x = 0; m.scale.y = m.scale.x; m.position.set(FIRE[0] + Math.cos(A[i]) * Rr[i], 0, FIRE[1] + Math.sin(A[i]) * Rr[i]); m.rotation.y = -Math.atan2(FIRE[1] - m.position.z, FIRE[0] - m.position.x) + Math.PI / 2; walkAnim(m, 0, false); }); } /* 카메라 쪽(0.9)은 비워 둔다 */
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
    overlay(`<h1>몰았다 — 이겼다</h1><p>사슴 떼가 골짜기로 쏟아져 들어갔고, 횃불이 어귀를 막았다. 무리 열두 사람이 모닥불 곁에서 배불리 먹는다.</p><p style="text-align:left;font-size:14px;line-height:1.6;background:rgba(255,255,255,.08);border-radius:10px;padding:8px 12px"><b>이긴 까닭</b><br>· ${S.scatters ? `떼를 ${S.scatters}번 흩뜨렸지만 다시 모아 몰았다.` : '한 번도 흩뜨리지 않고 조용히 몰았다.'}<br>· ${S.lostN ? `${S.lostN}마리는 숲으로 놓쳤다.` : '한 마리도 놓치지 않았다.'}${S.bandFood ? '<br>· 무리가 모아 온 열매와 뿌리가 먹을 것에 보태졌다.' : ''}</p><p>${S.axe ? '주먹도끼로 가죽까지 벗겨 냈다 — 오늘 밤은 따뜻하다.' : '도끼가 없어 고기만 겨우 떼어 왔다. 가죽은 버려야 했다.'} ${fireLine}</p>${marks}
      <p class="keys">먹을 것이 떨어지자 무리는 강을 따라 떠났다.</p>
      <div class="fact">📜 <b>뗀석기</b> — 돌을 깨뜨려 떼어 낸 도구를 썼다. 주먹도끼 하나로 찍고 자르고 팠다.<br>📜 <b>불</b> — 불로 추위와 짐승을 막고 먹을 것을 익혔다.<br>📜 <b>사냥과 채집</b> — 사냥만으로는 살 수 없었다. 열매와 뿌리가 더 큰 몫이었다.<br>📜 <b>옮겨 다니는 삶</b> — 먹을 것을 따라 무리 지어 옮겨 다니며 동굴이나 막집에서 지냈다.</div>`,
      '한 번 더', () => { S.day = 1; S.axe = false; resetDay(); restorePeople(); S.mode = 'play'; misClear(); });
  } else {
    const nd = S.day + 1;
    overlay(`<h1>해가 졌다 — 졌다</h1><p style="text-align:left;font-size:14px;line-height:1.6;background:rgba(255,255,255,.08);border-radius:10px;padding:8px 12px"><b>진 까닭</b><br>· ${S.inside ? `골짜기에 ${S.inside}마리만 들어갔다 — 여섯은 되어야 무리가 먹는다.` : '떼를 골짜기까지 데려가지 못했다.'}${S.scatters >= 2 ? `<br>· 떼를 ${S.scatters}번 흩뜨렸다 — 바람을 안고, 걸어서 다가가야 한다.` : ''}${S.lostN ? `<br>· ${S.lostN}마리를 숲으로 놓쳤다.` : ''}</p><p>빈손으로 돌아왔다. ${S.food3 ? '<b>그래도 오늘은 굶지 않았다</b> — 주워 둔 열매와 뿌리가 있었다.' : '주린 배로 잠들었다.'}</p><p>${fireLine}</p>${marks}
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
  if (Math.abs(k - skyPaintT) > 0.004) { sky.paint(cSkyTop, cSkyLow); scene.background.copy(cSkyTop); skyPaintT = k; }
  scene.fog.color.copy(cSkyLow); sun.color.set(a[3]).lerp(tmpC.set(b[3]), t); sun.intensity = lerp(a[4], b[4], t); hemi.intensity = lerp(a[5], b[5], t);
  const az = lerp(2.3, 3.0, clamp(k, 0, 1)), el = lerp(1.0, 0.12, clamp(k, 0, 1));
  { const fx = Math.round(S.px / 4) * 4, fz = Math.round(S.pz / 4) * 4; sun.position.set(fx + Math.cos(az) * Math.cos(el) * 70, Math.sin(el) * 70 + 4, fz + Math.sin(az) * Math.cos(el) * 70); sun.target.position.set(fx, 0, fz); }
  sunDisc.position.set(W / 2 + Math.cos(az) * Math.cos(el) * 260, Math.sin(el) * 230 - 10, H / 2 + Math.sin(az) * Math.cos(el) * 260); sunDisc.material.color.copy(sun.color);
  sunDisc.visible = k < 1.0; hemi.groundColor.set(0x5a7a3a).multiplyScalar(lerp(1, 0.4, clamp(k, 0, 1)));
}

/* ───── 한 걸음 ───── */
function update(dt) {
  S.t += dt; windU.uTime.value += dt;
  sayTick(dt); ringsUpdate(dt);
  { const on = S.view !== 3; if (FINE[0].visible !== on) for (const m of FINE) m.visible = on; cam.getWorldDirection(gDir); const gl = Math.hypot(gDir.x, gDir.z) || 1, fx = cam.position.x + gDir.x / gl * 38, fz = cam.position.z + gDir.z / gl * 38; for (const g of GRASS) g.m.visible = on && Math.abs(g.x - fx) < 62 && Math.abs(g.z - fz) < 62; } /* 지도 시점에서는 풀잎·풀섶·꽃을 그리지 않는다(점보다 작다) · 풀잎은 카메라가 보는 곳(앞 38m) 가까운 칸만 */
  { const p = riverG.attributes.position; for (let i = 0; i < p.count; i++) { const x = riverBase[i * 3], z = riverBase[i * 3 + 2]; p.setY(i, Math.sin(x * 0.3 + S.t * 1.1) * 0.12 + Math.cos(z * 0.5 + S.t * 0.8) * 0.08); } p.needsUpdate = true; }
  /* 불 · 연기 · 횃불 */
  const fk = S.fuel > 0 ? 0.35 + S.fuel * 0.85 : 0; fire.scale.setScalar(Math.max(0.01, fk * (0.9 + Math.sin(S.t * 13) * 0.08))); fire.rotation.y = S.t * 2; fire.visible = hearth.userData.glow.visible = fk > 0;
  if (S.mode !== 'camp') { fireL.intensity = fk * 12 * (0.85 + Math.sin(S.t * 21) * 0.15) * (0.4 + S.sun); fireGlow.visible = fk > 0; fireGlow.material.opacity = clamp(fk, 0, 1) * (0.3 + S.sun * 0.7); }
  for (const s of smoke) { const k = (s.userData.k + S.t * 0.09) % 1; s.position.set(FIRE[0] + Math.sin(k * 7 + s.userData.k * 9) * 0.6 * k + S.wind[0] * k * 3, 1.2 + k * 9, FIRE[1] + S.wind[1] * k * 3); s.scale.setScalar(0.5 + k * 1.6); s.material.opacity = (1 - k) * 0.5 * clamp(S.fuel * 3, 0, 1); s.rotation.y = k * 3; }
  for (const t of torchmen) { const fl = t.mesh.userData.flame; if (fl) { fl.scale.setScalar(0.9 + Math.sin(S.t * 15 + t.hx) * 0.12); fl.rotation.y = S.t * 3; } }
  torchGlows.forEach((g, i) => { g.material.opacity = 0.75 + Math.sin(S.t * 3 + i) * 0.2; g.position.set(torchmen[i].mesh.position.x + 0.5, 2.9, torchmen[i].mesh.position.z + 0.25); });
  bandUpdate(dt);
  for (const c of chips) if (c.t < 1.5) { c.t += dt; c.vy -= 9 * dt; c.m.position.x += c.vx * dt; c.m.position.y = Math.max(0.05, c.m.position.y + c.vy * dt); c.m.position.z += c.vz * dt; c.m.rotation.x += dt * 8; if (c.t >= 1.5) c.m.visible = false; }

  if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.4) { S.mode = 'play'; say('발자국이 숲 쪽으로 나 있다 — 따라가서 사슴 떼를 찾자', null, 3.6); } stepDeer(dt); return; }
  if (S.mode === 'title') { stepDeer(dt); return; }
  if (S.mode === 'win' || S.mode === 'dusk') {
    S.endT += dt; stepDeer(dt); stepWolves(dt); stepComps(dt);
    if (S.mode === 'win') torchmen.forEach((t, i) => { const tx = i ? 176.6 : 171.8; t.x = lerp(t.x, tx, dt * 1.2); t.z = lerp(t.z, 16.8, dt * 1.2); t.mesh.position.set(t.x, 0, t.z); walkAnim(t.mesh, S.t * 9, true); });
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
  if (!S.fireOut) { S.fuel = Math.max(0, S.fuel - dt / (DAY * 1.05)); if (S.fuel < 0.22 && S.fuel > 0) say('불이 사그라든다 — 나뭇가지를 넣자', 'low', 3); if (S.fuel <= 0) { S.fireOut = true; hud(); say('불씨가 꺼졌다…', null, 2.4); } }
  S.shoutCD -= dt;
  S.leakT = (S.leakT || 0) - dt; if (S.leakT <= 0) { S.leakT = 10 + rnd() * 6; S.herdSide = rnd() < 0.5 ? -1 : 1; }

  /* 큰 순간: 떼가 들 한가운데를 넘으면 늑대 울음에 놀라 내달린다 */
  if (!S.stampDone && S.hx > STAMP_X && S.scatT <= 0 && !inCreek(S.hx, S.hz)) { S.stampDone = true; S.stamp = 7.5; S.stA = 0.8; S.kick = 0; S.zoomHold = S.zoom; SFX.howl(); SFX.hooves(); SFX.snort(); ring(S.hx, S.hz, 18, 0xffe2a0); say('늑대 울음! 떼가 내달린다 — 곁에 붙어 같이 뛰면 반대쪽으로 꺾인다', null, 4.2); }
  /* 나 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? (S.stamp > 0 ? 5.7 : 4.7) : 3.0) * (back ? 0.6 : 1) * (inCreek(S.px, S.pz) ? 0.6 : 1); { const [nx, nz] = collideRects(SOLID, S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); } if (S.view !== 2) S.pdir = Math.atan2(iz, ix);
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
  const tension = clamp(Math.max(S.nerve, late, wolfOn ? 0.55 : 0, S.stamp > 0 ? 0.9 : 0), 0, 1);
  S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.36, tension); SFX.beat(0.08 + tension * 0.3); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${late > S.nerve ? '120,30,60' : '200,40,20'},${tension * 0.5})`;
}
const v3 = new THREE.Vector3(), v3b = new THREE.Vector3();
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.8, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(MOUTH[0] - 8, START[0] + 6, e), lerp(12, 38, e), lerp(MOUTH[1] + 20, START[1] + 26, e)); cam.lookAt(lerp(MOUTH[0], START[0] + 5, e), lerp(2, 0, e), lerp(MOUTH[1], START[1] - 6, e)); cam.fov = 44; cam.updateProjectionMatrix(); }
  else if (S.mode === 'win' || S.mode === 'dusk') { v3.set(MOUTH[0] - 6, 22, MOUTH[1] + 26); cam.position.lerp(v3, 0.03); cam.lookAt(MOUTH[0], 1, MOUTH[1] - 2); }
  else if (S.mode === 'camp') { cam.position.set(FIRE[0] + 6.4, 4.6, FIRE[1] + 7.6); cam.lookAt(FIRE[0], 1.0, FIRE[1]); if (cam.fov !== 50) { cam.fov = 50; cam.updateProjectionMatrix(); } }
  else { followCam(cam, S, { W, H, clampX: [-40, W + 40], clampZ: [-20, H + 10], farH: [21, 27], farBk: [35, 41], farFov: 46, lookY: 6, aheadFar: 17, map: { h: [150, 250], z: 20, look: -2, fov: 62 } });
    if (S.shake > 0 && S.view !== 3) { cam.position.x += Math.sin(S.t * 47) * 0.16 * S.shake; cam.position.y += Math.sin(S.t * 61) * 0.12 * S.shake; } }
  fadeOccluders(occl, cam, S, S.mode === 'play');
  edgeGoal($('goal'), cam, goalPos, S.mode === 'play', 0.8);
  hints();
  /* 돌 받침 고리(화면 위 표시) */
  const kn = $('knap'); if (S.mode === 'play' && nearAnvil()) { const q = v3b.set(ANVIL[0], 0.8, ANVIL[1]).project(cam); kn.style.display = 'block'; kn.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; kn.style.top = ((1 - q.y) / 2) * innerHeight - 70 + 'px'; const r = Math.max(8, 84 - 62 * S.kPhase); const i = kn.querySelector('i'); i.style.width = i.style.height = r + 'px'; i.style.borderColor = Math.abs(S.kPhase - 0.9) < 0.13 ? '#ffcf4d' : '#fff'; } else kn.style.display = 'none';
}

/* ───── 미션(11-18): 지금 할 일 하나 — 무엇을·어떻게·어디서. 세 막을 따라 간다(발자국 → 떼 → 개울 여울 → 바위 줄 틈 → 횃불).
   미션은 S 를 읽기만 한다. 「한 번이라도 했다」는 아래 작은 변수로 지켜본다(misWatch 는 돌림 고리에서만 — 시험용 update 와 놀이 숫자는 그대로) ───── */
const PRINT0 = [34, 122], GAP = [163.5, 43.6], FORDC = [creekX((FORD[0] + FORD[1]) / 2), (FORD[0] + FORD[1]) / 2];
let misTrail = false, misFound = false, misWall = false, misCross = false, misNear = false;
const standing = () => comps.filter((c) => c.state === 'stand').length;
/* 동료를 세울 만한 자리: 떼에서 가는 쪽(여울 · 어귀)으로 조금 앞, 옆으로 비켜서 */
/* 11-18 준호 「빛기둥이 계속 위치가 바뀌어서 할 수가 없다」 → 자리를 한 번 정하면 그대로 둔다(떼가 12m 넘게 옮겨 갔을 때만 다시). 첫 동료가 서면 둘째 자리는 떼 반대편 */
let wallFix = null, wallHerd = null, wallSide = 1, wallN = -1, wallStay = 0, wallSentAt = -99;
function wallCalc() { const [gx, gz] = misCross ? MOUTH : FORDC, l = dist(S.hx, S.hz, gx, gz) || 1, ux = (gx - S.hx) / l, uz = (gz - S.hz) / l, s = wallSide;
  return collideRects(SOLID, clamp(S.hx + ux * 7 - uz * 5.5 * s, BX[0] + 1, BX[1] - 1), clamp(S.hz + uz * 7 + ux * 5.5 * s, BZ[0] + 1, BZ[1] - 1), 1.0); } /* 바위 속에는 세우지 않는다(누를 때와 같은 셈) */
function wallSpot() { const n = standing();
  if (!wallFix) { const [gx, gz] = misCross ? MOUTH : FORDC, l = dist(S.hx, S.hz, gx, gz) || 1; wallSide = (S.px - S.hx) * -((gz - S.hz) / l) + (S.pz - S.hz) * ((gx - S.hx) / l) > 0 ? -1 : 1; }
  if (wallFix && n !== wallN && n > wallN) wallSide = -wallSide;   /* 한 명이 서면 다음 자리는 반대편 */
  if (!wallFix || n !== wallN || dist(S.hx, S.hz, wallHerd[0], wallHerd[1]) > 12) { wallFix = wallCalc(); wallHerd = [S.hx, S.hz]; }
  wallN = n; return wallFix; }
const mis = missions(scene, cam, [
  { t: '발자국 찾기', how: (tc) => `${tc ? '왼쪽 동그라미' : '<kbd>방향키</kbd>'}로 빛기둥까지 걷기`, done: () => misTrail, at: () => PRINT0, tag: '👣 발자국이 여기서 시작' },
  { t: '발자국 따라 사슴 떼 찾기', how: '땅에 난 발자국 줄을 따라 걷기 · 떼가 보이면 뛰지 말고 천천히', done: () => misFound },
  { t: '동료 둘을 떼 옆에 세우기', how: (tc) => `${tc ? '땅을 톡 누르면' : '땅을 <kbd>클릭</kbd>하면'} 동료가 가서 선다 · 빛기둥 안에 잠깐 서 있어도 동료가 온다`, n: () => [misWall ? 2 : standing(), 2], done: () => misWall,
    at: wallSpot, tag: (() => (wallStay > 0 ? '🙋 동료를 부르는 중…' : ctl.isTouch ? '👆 여기를 톡 — 또는 빛 안에 서 있기' : '🖱 여기를 클릭 — 또는 빛 안에 서 있기')) },
  { t: '떼를 개울 건너편으로', how: '떼 뒤에서 걸어서 밀기 · 물 말고 징검돌 여울(빛기둥)로 건너게', done: () => misCross, at: () => FORDC, tag: '🪨 징검돌 여울 — 떼를 이리로' },
  { t: '떼를 골짜기 어귀 앞까지', how: (tc) => `떼가 내달리면 곁에서 ${tc ? '「뛰기」' : '<kbd>Shift</kbd>'}로 같이 뛰어 꺾기 · 바위 줄 틈(빛기둥)은 동료로 막기`, done: () => misNear, at: () => GAP, tag: '🧍 틈 — 동료를 세워 막기' },
  { t: '횃불 사이로 사슴 몰아넣기', how: '어귀 양옆에 동료를 세우고 떼 뒤에서 천천히 밀기', n: () => [S.inside, NEED], done: () => S.inside >= NEED || S.mode === 'win' },
], { allText: '🎉 떼가 골짜기로 들어갔다!' });
function misWatch() { if (S.mode !== 'play') return;
  /* 빛기둥 안에 0.7초 서 있으면 동료를 그 자리로(땅 누르기와 같은 일 — 돌림 고리에서만, 시험용 update 는 그대로) */
  const sent = S.t - wallSentAt < 6 && standing() === wallN;   /* 방금 보낸 동료가 아직 가는 중이면 기다린다 */
  if (mis.idx === 2 && wallFix && !misWall && !sent && dist(S.px, S.pz, wallFix[0], wallFix[1]) < 2.4 && !S.moving) { wallStay += 1 / 30; if (wallStay > 0.7) { wallStay = 0; wallSentAt = S.t; pressGround(wallFix[0], wallFix[1]); } } else wallStay = 0;
  if (dist(S.px, S.pz, PRINT0[0], PRINT0[1]) < 4) misTrail = true;
  if (dist(S.px, S.pz, S.hx, S.hz) < 30) misFound = misTrail = true; /* 발자국 끝(떼)에 먼저 닿아도 첫 미션은 한 셈 */
  if (standing() >= 2) misWall = true;
  if (S.hx > creekX(S.hz) + 3.2) misCross = true;
  if (dist(S.hx, S.hz, MOUTH[0], MOUTH[1]) < 24 && S.hx < 178.4) misNear = true; }
function misClear() { mis.reset(); misTrail = misFound = misWall = misCross = misNear = false; wallFix = null; wallN = -1; wallStay = 0; wallSentAt = -99; }
/* 자리 꼬리표(처음 하는 일이 무엇인지 그 자리에 — 보이기만 한다) */
const tagEls = {}, tv = new THREE.Vector3();
function showTag(k, html, on, x, y, z) { let e = tagEls[k]; if (!e) { e = tagEls[k] = document.createElement('div'); e.className = 'tag'; document.body.appendChild(e); }
  if (!on) { e.style.display = 'none'; return; } const q = tv.set(x, y, z).project(cam); if (q.z > 1 || Math.abs(q.x) > 1 || Math.abs(q.y) > 1) { e.style.display = 'none'; return; }
  if (e.innerHTML !== html) e.innerHTML = html; e.style.display = 'block'; const hw = e.offsetWidth / 2 + 6; e.style.left = clamp(((q.x + 1) / 2) * innerWidth, hw, innerWidth - hw) + 'px'; e.style.top = clamp(((1 - q.y) / 2) * innerHeight, 120, innerHeight - 30) + 'px'; }
const nearest = (list, r) => { let b = null, bd = r; for (const o of list) { if (!o.on) continue; const d = dist(S.px, S.pz, o.x, o.z); if (d < bd) { bd = d; b = o; } } return b; };
function hints() { const play = S.mode === 'play' && S.view !== 3, tc = ctl.isTouch, calm = mis.idx > 0; /* 첫 미션(발자국 찾기) 동안은 그 꼬리표 하나만 */
  const st = play && calm && !S.axe && S.stones < 2 && dist(S.px, S.pz, ANVIL[0], ANVIL[1]) < 22 ? nearest(S.ground, 14) : null;
  showTag('stone', '🪨 밟으면 줍는다', !!st, st ? st.x : 0, 1.1, st ? st.z : 0);
  const dA = dist(S.px, S.pz, ANVIL[0], ANVIL[1]);
  showTag('anvil', '🪨 여기 서서 주먹도끼 깨기', play && !S.axe && S.stones >= 2 && !nearAnvil() && dA < 18, ANVIL[0], 1.6, ANVIL[1]);
  const dF = dist(S.px, S.pz, FIRE[0], FIRE[1]);
  showTag('fire', '🔥 여기 와서 나뭇가지 넣기', play && S.sticks > 0 && !S.fireOut && dF > 2.8 && dF < 20, FIRE[0], 2.2, FIRE[1]);
  const sk = play && calm && S.sticks === 0 && !S.fed && !S.fireOut && dF < 14 ? nearest(S.sticksOn, 16) : null;
  showTag('stick', '🪵 나뭇가지 — 밟으면 줍는다', !!sk, sk ? sk.x : 0, 1.0, sk ? sk.z : 0);
  const rt = play && !(S.digT > 0) ? nearest(roots, 7) : null;
  showTag('root', '⛏ 곁에 가만히 서서 캐기', !!rt, rt ? rt.x : 0, 1.4, rt ? rt.z : 0);
  const bu = play ? nearest(bushes, 8) : null;
  showTag('bush', '🫐 곁을 지나가면 딴다', !!bu && !rt, bu ? bu.x : 0, 2.2, bu ? bu.z : 0);
  const wf = play && S.stones > 0 ? wolves.find((w) => (w.state === 'come' || w.state === 'harass') && dist(S.px, S.pz, w.x, w.z) < 30) : null;
  showTag('wolf', tc ? '👆 늑대를 톡 — 돌 던지기' : '🖱 늑대를 클릭 — 돌 던지기', !!wf, wf ? wf.x : 0, 2.0, wf ? wf.z : 0); }

resetDay(); lightFor(0); stepDeer(0.01);
pMesh.position.set(S.px, 0, S.pz); pRing.position.set(S.px, 0.11, S.pz);
for (const c of comps) { c.mesh.position.set(c.x, 0, c.z); }
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.howl(); };
runLoop((dt) => { update(dt); misWatch(); mis.update(dt, S.mode === 'play' || (S.mode === 'win' && S.endT < 2.4)); }, view, () => renderer.render(scene, cam));
window.__scene = { S, deer, comps, wolves, update, keys, ctl, wallFix: () => wallFix, misIdx: () => mis.idx,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  press: pressGround, shout, strike, smells,
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz); ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode, x: +S.px.toFixed(1), z: +S.pz.toFixed(1), inside: S.inside, nerve: +S.nerve.toFixed(2), scatters: S.scatters }; },
  herd() { return { x: S.hx, z: S.hz, n: deer.filter((d) => !d.inside && !d.lost).length }; } };
