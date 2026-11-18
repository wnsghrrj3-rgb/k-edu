/* 케이월드 · 여덟 가지 법 — 고조선 한 장면(S04, 2026-11-17). 본보기 = 그믐밤, 공통 부품 = ../scene/kit.js.
   목표는 하나(재판 마당의 큰 북)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 못 찾으면 다음 판은 마을 사람들이 입을 닫는다.
   증거 셋: 👣 발자국(발 크기) · 🌾 낟알 길(누구네 집 뒤를 지나는지) · 🪢 자루 매듭(끈 색). 의심받는 사람 곁에 서면 머리 위에 맞음/틀림이 그림으로 뜬다.
   한 증거만으로는 둘이 남는다 — 둘을 모으면 하나, 셋이면 틀림없다. 판마다 훔친 사람이 바뀐다(?seed= 로 고정).
   고인돌에서 「어떻게 하라는지 모르겠다」를 들었으므로: 따라갈 것은 늘 빛나고, 할 일은 「곁에 서기·가만히 서기·데려가기」 셋뿐이다.
   좌표: x 동쪽(+), z 남쪽(+). 흙성 안. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, canvasTex, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, gridPath, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, runLoop, loadArt, ART, art, artOwn, artInst, artGeo, artMat, artGlowMat, scatter, missions } from '../scene/kit.js?v=4';
await loadArt('people', 'nature', 'props', 'law');   /* 블렌더로 만든 모델(사람·자연·소품 + 이 장면만의 것: tools/blender/make_law.py → law.glb) */

const W = 80, H = 60, BX = [7, 73], BZ = [7, 53], TRIAL = 240;
const GRANARY = [18, 13.5], DOOR = [18, 18.4], COURT = [40, 46.5], DRUM = [40, 45.6], WELL = [38, 30], MARKET = [55, 22], SMITHY = [62, 42];
const HOMES = [[13, 40], [67, 12], [29, 37]];
const HIDE2 = [[46, 11], [70, 30], [10, 27]];
const SUS_POS = [[34.5, 31.5], [54, 25.5], [58.5, 47.5]];
const COLORS = [{ shirt: 0xc0503a, name: '빨간' }, { shirt: 0x3a6ac0, name: '파란' }, { shirt: 0x3a9a50, name: '초록' }];
const DOTS = ['🔴', '🔵', '🟢'];
const CORDS = [{ c: 0xd8302a, i: '🟥' }, { c: 0x2a6ad8, i: '🟦' }, { c: 0xe8c020, i: '🟨' }];
const WITNESS = [[21.5, 20, 'keeper'], [41.5, 27.5, 'foot'], [51, 28.5, 'cord'], [66, 36.5, 'rain']];
const INJURED = [57.5, 27.5], SMITH = [60, 37.6];
const SOLID = [[14, 10, 22, 17, 3.4, 'granary'], [36.8, 28.8, 39.2, 31.2, 1, 'well'], [57.5, 39, 66.5, 45, 3, 'smithy'], [38.9, 44.9, 41.1, 46.3, 2, 'drum'],
  [49.5, 17.5, 52.5, 19.5, 2, 'stall'], [56.5, 17.5, 59.5, 19.5, 2, 'stall'], [49.5, 23.5, 52.5, 25, 2, 'stall']];
for (const [x, z] of HOMES) SOLID.push([x - 3, z - 2.4, x + 3, z + 2.4, 2.8, 'home']);
const seed0 = +(new URLSearchParams(location.search).get('seed') || (Date.now() % 100000));

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xf2d6b0, 80, 220], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x7a7a4a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff1d6, intensity: 2.1, box: [46, 36], far: 160, pos: [W / 2 - 34, 50, H / 2 + 30], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261120);
const sky = skyDome(scene, rnd, { top: 0x74aae8, low: 0xffe4bc });
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);
let gateG = null;   /* 남문 — 눈(카메라)이 문 바로 곁에 오면(재판 마당을 남쪽에서 볼 때 · 재판 장면 · 첫 화면) 아예 감춘다 */
const drnd = rng(40417);   /* 꾸밈(풀·나무 뿌리기)만 쓰는 따로 된 난수 — 놀이 난수(rnd)의 차례는 그대로 둔다 */

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
const strew = (o) => scatter(scene, drnd, o);

/* 땅 · 흙성 · 길 */
flat(-60, -30, W + 60, H + 30, 0x8cbf5a, 0);
flat(7, 7, 73, 53, 0xcdb487, 0.02);
for (const r of [[16, 18, 20, 46], [16, 28, 64, 32], [38, 18, 42, 46], [42, 20, 62, 24], [20, 42, 60, 46]]) flat(r[0], r[1], r[2], r[3], 0xd9c496, 0.03);
/* 밟힌 땅 얼룩(예전 네모 조각과 같은 자리 · 같은 난수 차례) */
{ const P = []; for (let i = 0; i < 80; i++) { const w = 0.6 + rnd() * 1.2, d = 0.5 + rnd(), lt = rnd() > 0.5, x = 8 + rnd() * 64, z = 8 + rnd() * 44; P.push(['law_patch', x, 0.045, z, [w * 1.2, 1, d * 1.2], i * 0.9, { c: lt ? 0xbfa678 : 0xd4bd8e }]); } scene.add(bake(P, false, false)); }
/* 흙성: 판축 흙둑 + 나무 울(길이 4 조각을 잇는다) · 네 모서리 망루 · 남문 */
{ const L = []; for (const [x0, z0, x1, z1] of [[5, 5, 75, 5], [5, 55, 36, 55], [44, 55, 75, 55], [5, 5, 5, 55], [75, 5, 75, 55]]) { const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 4)), vert = x0 === x1;
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; L.push([x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t, [len / n / 4.04, 1, 1], vert ? Math.PI / 2 : (i % 2) * Math.PI]); } }
  artInst(scene, 'law_wall', L, {}, { shadow: false });   /* 둘레 60 조각 — 그림자까지 그리면 세모가 두 배라 끈다(흙둑 아래 어둠은 꼭짓점 색에 있다) */
  artInst(scene, 'law_tower', [[5, 0, 5, 1, 0.3], [75, 0, 5, 1, 1.2], [5, 0, 55, 1, 2.1], [75, 0, 55, 1, 0.8]], {}, { shadow: true });
  gateG = group([35.5, 54.4, 44.5, 55.6], [bake([['law_gate', 40, 0, 55, 1, 0]], true)]); }   /* 문 가로보가 재판 마당을 가리면 비쳐 보이게 */
/* 곳간(다락) · 우물 · 대장간 · 장터 · 집 · 재판 마당 */
group([14, 10, 22, 17], [bake([['law_granary', GRANARY[0], 0, GRANARY[1], 1, 0]], true)]);
scene.add(bake([['law_well', WELL[0], 0, WELL[1], 1, 0]]));
group([57.5, 39, 66.5, 45], [bake([['law_smithy', SMITHY[0], 0, SMITHY[1], 1, Math.PI]], true)]);   /* 앞(화덕 쪽)이 북쪽 길을 본다 */
const forge = glowSprite(scene, 'rgba(255,170,90,.95)', 'rgba(255,90,30,0)', 3.5); forge.position.set(SMITHY[0] - 2, 1.2, SMITHY[1] - 3.2);
scene.add(bake(SOLID.filter((s) => s[5] === 'stall').map((s, k) => { const south = s[1] < 21; return ['law_stall_' + 'abc'[k], (s[0] + s[2]) / 2, 0, (s[1] + s[3]) / 2, [(s[2] - s[0]) / 3, 1, (s[3] - s[1]) / 2], south ? 0 : Math.PI]; })));
const WALLS = [0xc8a878, 0xd2b488, 0xbfa070];
const homeFlags = HOMES.map(([x, z], i) => { group([x - 3, z - 2.4, x + 3, z + 2.4], [bake([['law_house_' + 'abc'[i], x, 0, z, 1, 0, { wall: WALLS[i] }]], true)]);
  const flag = art('law_flag', { cloth: COLORS[i].shirt }); flag.position.set(x + 3.8, 2.9, z + 2.2); scene.add(flag); return flag; });
/* 북 · 족장 · 마당 */
flat(32, 41, 48, 52, 0xc9ad7a, 0.035);
const drum = new THREE.Group(); drum.add(art('law_drum')); drum.position.set(DRUM[0], 0, DRUM[1]); scene.add(drum);
const drumGlow = glowSprite(scene, 'rgba(255,230,160,.8)', 'rgba(255,190,80,0)', 6); drumGlow.position.set(DRUM[0], 2.2, DRUM[1]);
const SKIN = 0xf0c48e;
const chief = person({ shirt: 0x6a2a20, pants: 0x3a1a10, mood: 'stern', skin: SKIN }); chief.position.set(43.5, 0, 45.4); chief.rotation.y = -Math.PI / 2 + 0.3;
const elders = [[36.5, 45.2], [44.5, 48]].map(([x, z]) => { const m = person({ shirt: 0x8a7a60, pants: 0x5a4a3a, hat: 'top', skin: SKIN }); m.position.set(x, 0, z); m.rotation.y = Math.PI; return m; });
/* 재판 마당 꾸밈: 족장 자리 · 제단(비파형 동검·거울) · 청동 거울 장대 둘 · 신단수(큰 나무 — 가리면 비쳐 보이게) */
scene.add(bake([['law_seat', 45.1, 0, 45.2, 1, -Math.PI / 2], ['law_altar', 46.9, 0, 46.9, 0.9, -Math.PI / 2 - 0.4], ['law_pole', 34.2, 0, 49.6, 1, 0.3], ['law_pole', 45.8, 0, 49.8, 1, -0.3]]));
group([31.6, 49.2, 34.4, 51.8], [bake([['tree_big', 33, 0, 50.6, 0.78, 0.6, { leaf: 0x4f8f45 }], ['rock_flat', 34.6, 0.02, 51.6, 0.6, 0.4]], true)]);

/* 마을 살림(움직이지 않는 꾸밈): 깃대 · 돼지우리 · 소 · 개 · 조 걸이 · 볏가리 · 자루 더미는 그림자를 드리우고, 작은 것(돼지 · 닭 · 장작 · 토기 · 갈돌 · 바구니)은 그림자 없이 한 덩이 더 — 세모를 아낀다 */
scene.add(bake([...HOMES.map(([x, z]) => ['law_flagpole', x + 3.3, 0, z + 2.2, 1, 0]),
  ['law_pen', 9.9, 0, 49.7, 1, 0.1], ['ox', 70.6, 0, 47.2, 0.9, -0.5], ['dog', 69.6, 0, 17.0, 1, 2.5],
  ['law_rack', 24.0, 0, 35.6, 1, Math.PI / 2], ['sack_pile', 55.0, 0, 16.6, 0.9, 0], ['straw_stack', 24.6, 0, 12.0, 1, 0.3], ['straw_stack', 25.9, 0, 14.6, 0.85, 1.4], ['law_rack', 71.3, 0, 22.4, 1, Math.PI / 2]]));
scene.add(bake([['law_pig', 9.2, 0, 49.3, 0.9, 0.7], ['law_pig', 10.7, 0, 50.2, 0.8, 2.6], ['law_pig', 10.4, 0, 48.9, 0.6, 4.2],
  ['law_wood', 68.4, 0, 40.4, 1, Math.PI / 2], ['law_wood', 68.4, 0, 42.6, 0.9, Math.PI / 2 + 0.1], ['law_wood', 9.6, 0, 34.2, 0.9, 0.2],
  ['chicken', 26.4, 0, 41.6, 1, 0.4], ['chicken', 27.2, 0, 42.3, 0.9, 2.2], ['chicken', 15.6, 0, 45.4, 1, 4.0], ['chicken', 70.2, 0, 16.7, 1, 1.1],
  ['law_pots', 24.4, 0, 40.6, 0.9, 0.9], ['law_pots', 62.2, 0, 17.0, 0.9, 0.3], ['law_quern', 47.8, 0, 18.7, 1, 0.4], ['basket', 48.7, 0, 17.7, 0.9, 1.1]], false, false));
/* 성 밖: 남문 길 · 조밭(익은 밭 · 푸른 밭) · 먼 고인돌 · 먼 산 · 숲 · 풀 */
flat(37, 55.9, 43, H + 30, 0xd9c496, 0.03);
const FIELDS = [], fieldList = [[], []];
for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++) { const x = -6 + i * 9.2, zN = 0.4 - j * 6, zS = 59.6 + j * 6, k = (i * 7 + j * 3) % 5;
  if (k !== 4) { fieldList[k % 2].push([x, 0.02, zN, 1, 0]); FIELDS.push([x - 4.2, zN - 2.7, x + 4.2, zN + 2.7]); }
  if (!(x > 30 && x < 50) && k !== 2) { fieldList[(k + 1) % 2].push([x, 0.02, zS, 1, Math.PI]); FIELDS.push([x - 4.2, zS - 2.7, x + 4.2, zS + 2.7]); } }
for (let j = 0; j < 5; j++) for (const [x, side] of [[0.5, 0], [-5.6, 1], [79.5, 0], [85.6, 1]]) { const z = 10 + j * 9.6; if ((j + side) % 3 === 2) continue; fieldList[(j + side) % 2].push([x, 0.02, z, 1, Math.PI / 2]); FIELDS.push([x - 2.7, z - 4.2, x + 2.7, z + 4.2]); }
artInst(scene, 'law_field', fieldList[0], {}, { shadow: false }); artInst(scene, 'law_field_g', fieldList[1], {}, { shadow: false });
scene.add(bake([['dolmen', -16, 0, -24, 1.3, 0.3], ['dolmen', 30, 0, -31, 1.1, 1.0], ['dolmen', 99, 0, 6, 1.2, 2.2], ['dolmen', -22, 0, 40, 1.0, 1.4], ['dolmen', 96, 0, 70, 1.1, 0.6], ['dolmen', 18, 0, 78, 1.0, 2.6]], false, false));
{ const hs = []; for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + 0.2, r = 118 + (i % 3) * 14; hs.push([W / 2 + Math.cos(a) * r, 0, H / 2 + Math.sin(a) * r * 0.85, [1.6 + (i % 4) * 0.35, 1 + (i % 3) * 0.35, 1.4], -a + Math.PI / 2]); } artInst(scene, 'law_hill', hs, {}, { shadow: false }); }
{ const inWall = (x, z, p = 0) => x > 3 - p && x < 77 + p && z > 3 - p && z < 57 + p, onField = (x, z, p = 0.6) => FIELDS.some((r) => inRect(x, z, r, p));
  const ROADS = [[16, 18, 20, 46], [16, 28, 64, 32], [38, 18, 42, 46], [42, 20, 62, 24], [20, 42, 60, 46], [32, 41, 48, 52]];
  const KEEP = [DOOR, [DOOR[0], DOOR[1] + 2.4], ...WITNESS, ...SUS_POS, INJURED, SMITH, ...HIDE2, ...HOMES.map(([x, z]) => [x, z + 3.4]), [17.2, 36.6], [62.8, 8.6], [33.2, 33.6]];
  const busy = (x, z) => ROADS.some((r) => inRect(x, z, r, 0.4)) || SOLID.some((s) => inRect(x, z, s, 1.1)) || KEEP.some((k) => Math.hypot(k[0] - x, k[1] - z) < 2.2) || (x < 12 && z > 47) || (x > 66 && z > 45);
  strew({ area: [-40, -34, W + 40, H + 34], n: 58, names: ['pine_a', 'tree_a', 'pine_b', 'tree_b', 'tree_a', 'pine_a', 'bush'], avoid: (x, z) => inWall(x, z, 9) || onField(x, z, 1.5) || (x > 34 && x < 46 && z > 56), scale: [0.9, 1.4], minGap: 2.4, shadow: false, tints: { leaf: 0x4f8f45 } });
  strew({ area: [-26, -18, W + 26, H + 22], n: 190, names: ['grass_a', 'grass_b', 'grass_a', 'grass_a', 'grass_b', 'flower_y', 'grass_a', 'grass_a', 'grass_a', 'grass_b', 'grass_a', 'flower_w'], avoid: (x, z) => inWall(x, z, 0.4) || onField(x, z, 0.1) || (x > 36.5 && x < 43.5 && z > 55), scale: [0.9, 1.5], shadow: false });
  strew({ area: [7.4, 7.4, 72.6, 52.6], n: 110, names: ['grass_a', 'grass_b', 'grass_a', 'grass_a', 'flower_y', 'grass_a', 'grass_b', 'grass_a', 'grass_a', 'grass_a', 'flower_p'], avoid: busy, scale: [0.7, 1.2], shadow: false });
  strew({ area: [-12, -8, W + 12, H + 12], n: 26, names: ['rock_a', 'rock_flat', 'rock_a'], avoid: (x, z) => inWall(x, z, 1) || onField(x, z, 0.3), scale: [0.6, 1.2], minGap: 1.5, shadow: false }); }

/* 증거: 발자국 · 낟알 · 자루 */
const grid = new Uint8Array(W * H); for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { const cx = x + 0.5, cz = z + 0.5; let b = cx < BX[0] || cx > BX[1] || cz < BZ[0] || cz > BZ[1]; for (const s of SOLID) if (inRect(cx, cz, s, 0.9)) b = true; grid[z * W + x] = b ? 1 : 0; }
const findPath = gridPath(grid, W, H);
const printMat = new THREE.MeshStandardMaterial({ color: 0x4a3420, transparent: true, opacity: 0.85, roughness: 1 });
const grainMat = new THREE.MeshStandardMaterial({ color: 0xf0c040, emissive: 0x6a4a00, roughness: 0.6 });
let prints = [], grains = [];
const printGeo = artGeo('law_print'), grainGeo = artGeo('law_grain');   /* 발자국(길이·너비 1 — 판마다 크기를 준다) · 낟알 몇 톨 */
const sack = new THREE.Group(); { const b = art('law_sack'); sack.add(b); const cord = artOwn('law_knot'); sack.add(cord); sack.userData.cord = cord; } scene.add(sack);   /* 매듭은 흰색 모델 + 제 재질 — 재질 색이 끈 색이 된다 */
const sackGlow = glowSprite(scene, 'rgba(255,236,150,.85)', 'rgba(255,200,80,0)', 3);
/* 길잡이 빛: 내 곁의 자취에서 몇 걸음 앞을 비춘다 — 따라가면 된다 */
const lamp = glowSprite(scene, 'rgba(255,248,200,.95)', 'rgba(255,220,120,0)', 2.6); const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3, 6), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.35, depthWrite: false })); scene.add(lampPost);
const spill = new THREE.Group(); { const P = [['law_spill', 0.1, 0, -0.1, 1, 0.25]]; for (let k = 0; k < 14; k++) P.push(['law_grain', (rnd() - 0.5) * 2, 0.04, (rnd() - 0.5) * 1, 1, k * 0.8]); spill.add(bake(P, false, false)); } spill.position.set(DOOR[0], 0, DOOR[1] + 0.4); scene.add(spill);
/* 비 */
const rainEl = (() => { const N = 700, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = rnd() * (W + 20) - 10; pos[i * 3 + 1] = rnd() * 26; pos[i * 3 + 2] = rnd() * (H + 20) - 10; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbcd4ff, size: 0.22, transparent: true, opacity: 0 })); pts.frustumCulled = false; scene.add(pts); return { pts, pos, N }; })();

/* 사람: 의심받는 셋 · 본 사람 넷 · 다친 사람 · 대장장이 · 굶는 식구 */
function suspectMesh(i) { const m = person({ shirt: COLORS[i].shirt, pants: 0x5a4434, hat: i === 1 ? 'satgat' : 'top', skin: SKIN }); const belt = artOwn('law_belt', {}, { shadow: false }); belt.position.y = 0.66; m.add(belt); m.userData.belt = belt;
  const feet = [-0.17, 0.17].map((x) => { const f = art('law_shoe', {}, { shadow: false }); f.position.set(x, 0.05, 0.06); m.add(f); return f; }); m.userData.feet = feet; return m; }
const sus = [0, 1, 2].map((i) => ({ i, m: suspectMesh(i), x: SUS_POS[i][0], z: SUS_POS[i][1], hx: SUS_POS[i][0], hz: SUS_POS[i][1], big: false, cord: 0, follow: false, dir: Math.PI / 2, tag: null, moving: false }));
const witnesses = WITNESS.map(([x, z, kind], i) => { const m = person({ shirt: [0xb89a70, 0xa89070, 0xc0a880, 0x9a8a68][i], pants: 0x6a5034, hat: i === 3 ? 'satgat' : 'top', skin: SKIN }); m.position.set(x, 0, z); m.rotation.y = -Math.PI / 2 + i; return { x, z, kind, m, tag: null }; });
const injured = person({ shirt: 0xa89878, pants: 0x6a5034, hat: 'top', skin: SKIN }); injured.position.set(INJURED[0], -0.35, INJURED[1]); injured.add(at(art('law_bandage', {}, { shadow: false }), 0, 1.86, 0));
const smith = person({ shirt: 0x5a4a3a, pants: 0x3a2a20, hat: 'top', skin: SKIN }); smith.position.set(SMITH[0], 0, SMITH[1]); smith.rotation.y = Math.PI;
const family = HOMES.map(([x, z]) => { const g = new THREE.Group(); const kid = person({ shirt: 0xc8b090, pants: 0x7a6040, hat: 'top', skin: SKIN }); kid.scale.setScalar(0.6); kid.position.set(-0.8, 0, 0); scene.remove(kid); g.add(kid); const pot = art('law_pot_full'); pot.position.set(0.6, 0, 0); g.add(pot); g.position.set(x - 1, 0, z + 3.4); scene.add(g); return { g, kid, pot }; });
const pMesh = person({ shirt: 0xd8c8a0, pants: 0x7a6040, hat: 'top', skin: SKIN });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const tagBox = $('tags'); function mkTag() { const d = document.createElement('div'); d.className = 'tag'; tagBox.appendChild(d); return d; }
sus.forEach((s) => (s.tag = mkTag())); witnesses.forEach((w) => (w.tag = mkTag())); const tagInj = mkTag(), tagSmith = mkTag(), tagHome = mkTag(), tagTrail = mkTag(); tagTrail.classList.add('hint');

/* ───── 소리 ───── */
const SFX = {
  drum: () => { tone(70, 40, 0.9, 'sine', 0.4); noise(0.3, 0.4, 120); },
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  clue: () => { tone(523, 784, 0.18, 'triangle', 0.14); tone(784, 1047, 0.2, 'triangle', 0.12, 0.12); },
  hey: () => tone(440, 560, 0.16, 'triangle', 0.1),
  wrong: () => tone(260, 160, 0.4, 'sawtooth', 0.1),
  rain: () => noise(0.9, 0.06, 5000),
  step: () => noise(0.05, 0.05, 300),
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  sad: () => { tone(330, 220, 1.0, 'sine', 0.14); tone(262, 175, 1.2, 'sine', 0.1, 0.4); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', round: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, k: 0, px: DOOR[0], pz: DOOR[1] + 2.4, pdir: -Math.PI / 2, moving: false, running: false, said: {}, sayT: 0,
  thief: 0, ev: [null, null, null], hints: 4, rain: 'none', rainT: 0, rained: false, moved: false, sackAt: [0, 0], sackOld: [0, 0], why: false, hurtSeen: false, hurtDone: false, drums: 0, workT: 0, workKey: '', endT: 0, shown: false, introT: 0, beatT: 0, stepT: 0, verdict: null, by: 'you' };
let mis = null;   /* 미션 카드(아래에서 만든다) */
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 빛나는 발자국·낟알을 따라간다 · 가만히 서면 살핀다 · 사람 곁에서 「데려가기」 · 「시점」 ⟲⟳';

function roundSetup() {
  const r = rng(seed0 * 7 + S.round * 131); const T = Math.floor(r() * 3) % 3; S.thief = T; const O1 = (T + 1) % 3, O2 = (T + 2) % 3;
  /* 발 크기: 훔친 사람과 O1 이 같다 · 끈 색: 훔친 사람과 O2 가 같다 → 증거 하나로는 둘이 남는다 */
  const big = r() < 0.5; sus[T].big = big; sus[O1].big = big; sus[O2].big = !big;
  const c = Math.floor(r() * 3), c2 = (c + 1 + Math.floor(r() * 2)) % 3; sus[T].cord = c; sus[O2].cord = c; sus[O1].cord = c2;
  sus.forEach((s) => { s.m.userData.belt.material.color.set(CORDS[s.cord].c); s.m.userData.feet.forEach((f) => f.scale.set(s.big ? 1.3 : 0.8, 1, s.big ? 1.4 : 0.75)); });
  S.hideK = Math.floor(r() * 3);
}
function layTrails() {
  for (const p of prints) scene.remove(p.m); for (const g of grains) scene.remove(g.m); prints = []; grains = [];
  const T = S.thief, home = HOMES[T], back = [home[0] + (home[0] > 40 ? -4.2 : 4.2), home[1] - 3.4];
  S.sackAt = back.slice(); S.sackOld = back.slice();
  const pth = findPath(DOOR[0], DOOR[1] + 1, home[0], home[1] + 3.6) || [];
  const big = sus[T].big, pw = big ? 0.3 : 0.2, pl = big ? 0.56 : 0.36;
  for (let i = 1; i < pth.length; i += 1) { const [x, z] = pth[i], [px, pz] = pth[i - 1], a = Math.atan2(z - pz, x - px), side = i % 2 ? 1 : -1; const m = new THREE.Mesh(printGeo, printMat.clone()); m.scale.set(pl, 1, pw); m.position.set(x - Math.sin(a) * 0.22 * side, 0.06, z + Math.cos(a) * 0.22 * side); m.rotation.y = -a; scene.add(m); prints.push({ m, x: m.position.x, z: m.position.z }); }
  addGrains(DOOR[0] + 1.2, DOOR[1] + 1, back[0], back[1]);
  sack.position.set(back[0], 0, back[1]); sack.visible = true; sack.userData.cord.material.color.set(CORDS[sus[T].cord].c); sackGlow.position.set(back[0], 1.4, back[1]);
}
function addGrains(ax, az, bx, bz) { const pth = findPath(ax, az, bx, bz) || []; for (let i = 0; i < pth.length; i += 2) { const [x, z] = pth[i]; const m = new THREE.Mesh(grainGeo, grainMat); m.position.set(x + 0.6, 0.06, z + 0.3); m.rotation.y = i; scene.add(m); grains.push({ m, x, z }); } }
function resetRound(full) {
  if (full) { S.round = 1; S.hints = 4; }
  roundSetup();
  Object.assign(S, { t: 0, k: 0, px: DOOR[0], pz: DOOR[1] + 2.4, pdir: -Math.PI / 2, ev: [null, null, null], rain: 'none', rainT: 0, rained: false, moved: false, why: false, hurtSeen: false, hurtDone: false, drums: 0, workT: 0, endT: 0, shown: false, verdict: null, by: 'you' });
  sus.forEach((s) => { s.x = s.hx; s.z = s.hz; s.follow = false; s.carrying = false; s.m.visible = true; });
  layTrails(); printMat.opacity = 0.85; prints.forEach((p) => (p.m.material.opacity = 0.85)); rainEl.pts.material.opacity = 0;
  family.forEach((f, i) => { f.pot.geometry = artGeo(i === S.thief ? 'law_pot_empty' : 'law_pot_full'); });   /* 훔친 사람 집 솥은 텅 비었다 */
  smith.position.set(SMITH[0], 0, SMITH[1]); injured.userData.paid = false;
  $('fade').style.opacity = 0; lightFor(0); hud();
}
function hud() {
  const T = S.thief; $('e0').textContent = S.ev[0] ? '👣 ' + (S.ev[0] === 'big' ? '큰 발' : '작은 발') : '👣 ?'; $('e0').className = S.ev[0] ? 'on' : '';
  $('e1').textContent = S.ev[1] != null ? '🌾 → 🏠' + DOTS[S.ev[1]] : '🌾 ?'; $('e1').style.background = S.ev[1] != null ? '#' + COLORS[S.ev[1]].shirt.toString(16).padStart(6, '0') : ''; $('e1').style.color = S.ev[1] != null ? '#fff' : ''; $('e1').className = S.ev[1] != null ? 'on' : '';
  $('e2').textContent = S.ev[2] != null ? '🪢 ' + CORDS[S.ev[2]].i : '🪢 ?'; $('e2').className = S.ev[2] != null ? 'on' : '';
  $('tWhy').className = S.why ? 'on' : ''; $('tHurt').className = S.hurtDone ? 'on' : '';
  const f = sus.find((s) => s.follow), hw = $('hWho'); hw.style.display = f ? '' : 'none'; if (f) { hw.textContent = '🧍 데려가는 중'; hw.style.background = '#' + COLORS[f.i].shirt.toString(16).padStart(6, '0'); }
  $('drum').querySelector('i').style.width = clamp(S.k, 0, 1) * 100 + '%';
}
/* 맞대 보기: 의심받는 사람의 표시와 모은 증거 */
function matchOf(s) { const out = []; if (S.ev[0]) out.push((s.big ? 'big' : 'small') === S.ev[0]); if (S.ev[1] != null) out.push(s.i === S.ev[1]); if (S.ev[2] != null) out.push(s.cord === S.ev[2]); return out; }

/* ───── 입력 ───── */
function act() {
  if (S.mode !== 'play') return;
  const f = sus.find((s) => s.follow);
  const near = sus.filter((s) => dist(S.px, S.pz, s.x, s.z) < 2.4).sort((a, b) => dist(S.px, S.pz, a.x, a.z) - dist(S.px, S.pz, b.x, b.z))[0];
  if (f && (!near || near === f)) { f.follow = false; SFX.hey(); say('놓아주었다 — 다시 제자리로 간다', null, 1.8); hud(); return; }
  if (near) { if (f) f.follow = false; near.follow = true; near.carrying = false; SFX.hey(); const m = matchOf(near), n = m.filter(Boolean).length; say(m.length === 0 ? '증거 없이 데려간다 — 북 앞에 세우면 재판이다' : `데려간다 — 증거 ${n}/${m.length} 맞음. 북 앞에 세우면 재판이다`, null, 2.8); hud(); return; }
  if (S.hurtSeen && !S.hurtDone && dist(S.px, S.pz, smith.position.x, smith.position.z) < 2.6) { S.hurtDone = true; SFX.clue(); say('"다치게 했으니 곡식으로 갚겠소" — 대장장이가 곡식을 지고 간다', null, 3); hud(); return; }
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) act(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });
canvas.addEventListener('pointerdown', () => { if (S.mode === 'intro') S.introT = 99; });

/* ───── 재판 ───── */
function trial(s, by) {
  S.mode = 'trial'; S.endT = 0; S.by = by; s.follow = false; s.x = DRUM[0] + 1.6; s.z = DRUM[1] + 1.8;
  const right = s.i === S.thief, evOk = S.ev.filter((e) => e != null).length;
  S.verdict = !right ? 'wrong' : (S.why && by === 'you') ? 'pay' : 'slave';
  S.accused = s.i; S.evAtTrial = evOk; SFX.drum(); setTimeout(SFX.drum, 400); setTimeout(SFX.drum, 800);
  say(by === 'you' ? '둥 둥 둥 — 재판이 열린다' : '세 번째 북 — 족장이 스스로 가린다', null, 2.6);
}
function endScreen() {
  const v = S.verdict, s = sus[S.accused], evN = S.ev.filter((e) => e != null).length, right = v !== 'wrong', mine = S.by === 'you';
  const who = `<b style="color:#${COLORS[s.i].shirt.toString(16).padStart(6, '0')}">${COLORS[s.i].name} 옷 사람</b>`;
  const head = v === 'wrong' ? '엉뚱한 사람' : v === 'pay' ? '값을 치르고' : '훔친 사람이 종으로';
  const story = v === 'wrong' ? `${who}이 남의 곡식을 훔쳤다고 가려져 <b>곳간 주인 집의 종</b>이 되었다. 진짜 훔친 사람은 <b>${COLORS[S.thief].name} 옷 사람</b>이었다.`
    : v === 'pay' ? `${who}이 훔쳤다. 집에는 굶는 식구가 있었다. 족장은 <b>곡식으로 갚게 하고</b> 풀어 주었다.` : `${who}이 훔쳤다. 법대로 <b>곳간 주인 집의 종</b>이 되었다.`;
  const marks = `<div class="marks"><span class="${evN === 3 ? 'ok' : ''}">👣 증거 ${evN}/3</span><span class="${right && mine ? 'ok' : ''}">⚖ ${right && mine ? '바로 가림' : mine ? '잘못 가림' : '족장이 가림'}</span><span class="${v === 'pay' ? 'ok' : ''}">🌾 ${v === 'pay' ? '갚게 함' : '갚을 길 없음'}</span><span class="${S.hurtDone ? 'ok' : ''}">🤝 ${S.hurtDone ? '다친 일 가림' : '다친 일 남음'}</span></div>`;
  const facts = `<div class="fact">📜 <b>고조선</b> — 우리 역사의 첫 나라다. 단군왕검이 세웠다고 전한다.<br>📜 <b>여덟 가지 법</b> — 여덟 조항 가운데 셋이 전한다. 사람을 죽이면 죽음으로, 다치게 하면 곡식으로 갚는다.<br>📜 <b>훔치면 종</b> — 남의 것을 훔치면 그 집 종이 된다. 큰 값을 치르면 면할 수 있었다.<br>📜 <b>법이 말해 주는 것</b> — 사람 목숨과 일할 힘을 귀하게 여겼고, 제 것과 남의 것, 종과 주인이 나뉜 사회였다.</div>`;
  if (right && mine) overlay(`<h1>${head}</h1><p>${story}</p>${marks}<p class="keys">법이 있다는 것은 지킬 것이 있다는 뜻이다.</p>${facts}`, '다른 날 한 번 더', () => { misClear(); S.round++; resetRound(false); S.mode = 'play'; });
  else { const nh = Math.max(1, S.hints - 2);
    overlay(`<h1>${head}</h1><p>${story}</p>${marks}<p>다음 일 — 마을 사람들이 <b>입을 닫는다</b>. 그림으로 알려 주는 사람이 ${S.hints}명에서 ${nh}명으로 준다.</p><p class="keys">${S.round + 1}번째 일 · 북은 다시 기다린다.</p>`, '다시 가린다', () => { S.round++; S.hints = nh; resetRound(false); S.mode = 'play'; say('마을 사람들이 입을 닫았다 — 증거를 직접 모으자', null, 3); }); }
}

/* ───── 하늘 ───── */
const SKY = [[0, 0x74aae8, 0xffe4bc, 0xfff1d6, 2.1, 1.3], [0.34, 0x7aa0d8, 0xffd8a8, 0xffe4b8, 1.9, 1.2], [0.67, 0x7a7ab0, 0xffb07a, 0xffb878, 1.5, 1.0], [1.0, 0x4a4a80, 0xe8706a, 0xff8a60, 1.0, 0.75], [1.2, 0x2a2a5a, 0xc0506a, 0xff8050, 0.7, 0.6]];
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); let lastSky = -1;
function lightFor(k) { let a = SKY[0], b = SKY[SKY.length - 1]; for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = clamp((k - a[0]) / ((b[0] - a[0]) || 1), 0, 1), dark = S.rain === 'rain' ? 0.6 : 1; cT.set(a[1]).lerp(tc.set(b[1]), t).multiplyScalar(dark); cL.set(a[2]).lerp(tc.set(b[2]), t).multiplyScalar(dark);
  if (Math.abs(k - lastSky) > 0.004 || S.rain === 'rain') { sky.paint(cT, cL); lastSky = k; } scene.fog.color.copy(cL); sun.color.set(a[3]).lerp(tc.set(b[3]), t); sun.intensity = lerp(a[4], b[4], t) * dark; hemi.intensity = lerp(a[5], b[5], t) * (0.6 + dark * 0.4);
  const az = lerp(2.3, 3.0, clamp(k, 0, 1)), el = lerp(1.0, 0.25, clamp(k, 0, 1)); sun.position.set(W / 2 + Math.cos(az) * Math.cos(el) * 70, Math.sin(el) * 70 + 4, H / 2 + Math.sin(az) * Math.cos(el) * 70); }

/* ───── 한 걸음 ───── */
const v3 = new THREE.Vector3();
function showTag(el, x, y, z, html) { if (!html) { el.style.display = 'none'; return; } const q = v3.set(x, y, z).project(cam); if (q.z > 1) { el.style.display = 'none'; return; } el.style.display = 'block'; el.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; el.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; if (el._h !== html) { el.innerHTML = html; el._h = html; } }
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  drumGlow.material.opacity = 0.55 + Math.sin(S.t * 2.6) * 0.2; sackGlow.material.opacity = sack.visible && S.ev[2] == null && dist(S.px, S.pz, sack.position.x, sack.position.z) < 10 ? 0.6 + Math.sin(S.t * 3) * 0.25 : 0; forge.material.opacity = 0.7 + Math.sin(S.t * 9) * 0.15;
  for (const g of grains) g.m.position.y = 0.06 + Math.max(0, Math.sin(S.t * 3 + g.x * 0.7)) * 0.05;
  if (rainEl.pts.material.opacity > 0) { const p = rainEl.pos; for (let i = 0; i < rainEl.N; i++) { p[i * 3 + 1] -= dt * 22; if (p[i * 3 + 1] < 0) p[i * 3 + 1] += 26; } rainEl.pts.geometry.attributes.position.needsUpdate = true; }
  if (S.mode === 'title' || S.mode === 'intro') { if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4) { S.mode = 'play'; say('곳간 문 앞 — 발자국과 흘린 낟알이 빛난다. 따라가 보자', null, 3.4); } } placeAll(dt); return; }
  if (S.mode === 'trial') { S.endT += dt; const s = sus[S.accused]; s.m.position.set(s.x, 0, s.z); s.m.rotation.y = Math.PI; if (S.endT > 2.2 && S.endT - dt <= 2.2) { if (S.verdict === 'wrong') SFX.sad(); else SFX.win(); } if (S.endT > 3.2 && !S.shown) { S.shown = true; endScreen(); } placeAll(dt); return; }
  if (S.mode !== 'play') return;

  /* 북: 셋째 북에 재판 */
  S.k = S.t / TRIAL; hud(); lightFor(S.k);
  const nd = Math.floor(S.k * 3 + 1e-6); if (nd > S.drums) { S.drums = nd; SFX.drum(); if (nd < 3) say(nd === 1 ? '둥— 첫 번째 북. 해가 기운다' : '둥— 두 번째 북! 한 번 남았다', null, 2.8); }
  if (S.k >= 1) { const f = sus.find((s) => s.follow); let pick = f; if (!pick) { const sc = sus.map((s) => matchOf(s).filter(Boolean).length); const mx = Math.max(...sc); const c = sus.filter((s, i) => sc[i] === mx); pick = c[Math.floor(rng(seed0 + S.round)() * c.length)]; } return trial(pick, f ? 'late' : 'chief'); }
  /* 비: 발자국이 지워진다 */
  if (!S.rained && S.k > 0.36 && S.rain === 'none') { S.rain = 'warn'; S.rainT = 0; say('먹구름 — 비가 오면 발자국이 지워진다!', null, 3); }
  if (S.rain !== 'none') { S.rainT += dt;
    if (S.rain === 'warn' && S.rainT > 8) { S.rain = 'rain'; S.rainT = 0; rainEl.pts.material.opacity = 0.7; }
    if (S.rain === 'rain') { if (S.rainT % 0.9 < dt) SFX.rain(); const f = clamp(1 - S.rainT / 10, 0, 1); for (const p of prints) p.m.material.opacity = 0.85 * f; if (S.rainT > 14) { S.rain = 'none'; S.rained = true; rainEl.pts.material.opacity = 0; for (const p of prints) p.m.visible = false; say(S.ev[0] ? '비가 그쳤다 — 발자국은 지워졌지만 본떠 두었다' : '비가 그쳤다 — 발자국이 다 지워졌다', null, 2.8); } } }
  /* 치우는 손: 훔친 사람이 자루를 다른 데로 옮긴다 */
  if (!S.moved && S.k > 0.52) { S.moved = true; const T = sus[S.thief]; if (!T.follow && S.ev[2] == null) { T.carrying = true; T.dest = HIDE2[S.hideK]; say('누군가 자루를 지고 어디론가 간다…', null, 2.6); } }

  /* 나 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 4.7 : 3.0) * (back ? 0.6 : 1); const [nx, nz] = collideRects(SOLID, S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); if (S.view !== 2) S.pdir = Math.atan2(iz, ix); S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; SFX.step(); } }

  /* 가만히 서서 살피기: 발자국 본뜨기 · 자루 살피기 · 집 들여다보기 · 다친 사람 */
  let job = null, need = 1, jobArg = null;
  const pr = !S.rained && S.ev[0] == null && prints.find((p) => p.m.visible && p.m.material.opacity > 0.3 && dist(S.px, S.pz, p.x, p.z) < 1.3);
  if (pr) { job = 'print'; need = 1.0; }
  if (!job && sack.visible && S.ev[2] == null && dist(S.px, S.pz, sack.position.x, sack.position.z) < 1.9 && !sus[S.thief].carrying) { job = 'sack'; need = 1.0; }
  if (!job) for (let i = 0; i < 3; i++) if (dist(S.px, S.pz, HOMES[i][0], HOMES[i][1] + 3.4) < 2.0) { job = 'home'; need = 0.8; jobArg = i; }
  if (!job && !S.hurtSeen && dist(S.px, S.pz, INJURED[0], INJURED[1]) < 2.2) { job = 'hurt'; need = 0.8; }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  overBar($('work'), cam, S.px, 2.6, S.pz, job && S.workT > 0.05 && job !== 'home' ? S.workT / need : null);
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'print') { S.ev[0] = sus[S.thief].big ? 'big' : 'small'; SFX.clue(); ring(pr.x, pr.z, 2.2, 0xffcf4d); say(S.ev[0] === 'big' ? '발자국을 본떴다 — 큰 발이다. 발이 큰 사람은 둘…' : '발자국을 본떴다 — 작은 발이다', null, 3); }
    if (job === 'sack') { S.ev[2] = sus[S.thief].cord; S.ev[1] = S.thief; SFX.clue(); ring(sack.position.x, sack.position.z, 2.5, 0xffcf4d); say('자루를 찾았다! 끈 색과, 낟알 길이 지나온 집을 알았다', null, 3.2); }
    if (job === 'home' && jobArg === S.thief && !S.why) { S.why = true; SFX.clue(); say('빈 솥 곁에 아이가 배를 곯고 있다 — 이 집은 먹을 것이 없다', null, 3.2); }
    if (job === 'hurt') { S.hurtSeen = true; SFX.pick(); say('장터 싸움에서 다쳤다 — 대장장이가 그랬다고 그림으로 알려 준다', null, 3); }
    hud(); }
  if (S.t < 12 && dist(S.px, S.pz, DOOR[0], DOOR[1] + 2) < 5) say('발자국 위에 가만히 서면 본뜬다 · 낟알을 따라가면 자루가 있다', 'how', 3.6);

  /* 데려가는 사람이 북 앞에 닿으면 재판 */
  const f = sus.find((s) => s.follow); if (f && dist(f.x, f.z, DRUM[0], DRUM[1]) < 3.6 && dist(S.px, S.pz, DRUM[0], DRUM[1]) < 4.2) return trial(f, 'you');
  placeAll(dt);

  /* 조임 */
  const late = clamp((S.k - 0.62) * 2.6, 0, 1), wet = S.rain === 'rain' && !S.ev[0] ? 0.7 : S.rain === 'warn' && !S.ev[0] ? 0.4 : 0, move = sus[S.thief].carrying ? 0.5 : 0;
  const tension = Math.max(late, wet, move); S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.4, tension); SFX.beat(0.06 + tension * 0.26); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${late >= Math.max(wet, move) ? '120,30,60' : '200,60,20'},${tension * 0.45})`;
  $('bAct').className = 'btn' + (sus.some((s) => dist(S.px, S.pz, s.x, s.z) < 2.4) || f || (S.hurtSeen && !S.hurtDone && dist(S.px, S.pz, smith.position.x, smith.position.z) < 2.6) ? ' show' : ''); $('bAct').textContent = f && !sus.some((s) => s !== f && dist(S.px, S.pz, s.x, s.z) < 2.4) ? '놓아주기' : sus.some((s) => dist(S.px, S.pz, s.x, s.z) < 2.4) ? '데려가기' : '갚게 하기';
}
function stepSus(s, dt) {
  let tx = s.hx, tz = s.hz, sp = 2.2;
  if (s.follow) { const bx = -Math.cos(S.pdir), bz = -Math.sin(S.pdir); tx = S.px + bx * 1.6; tz = S.pz + bz * 1.6; sp = dist(s.x, s.z, tx, tz) > 3 ? 4.6 : 2.8; if (dist(s.x, s.z, tx, tz) < 0.6) sp = 0; }
  else if (s.carrying) { const [hx, hz] = S.sackAt; if (!s.got) { tx = hx; tz = hz; if (dist(s.x, s.z, hx, hz) < 1.0) { s.got = true; sack.visible = false; } } else { tx = s.dest[0]; tz = s.dest[1]; if (dist(s.x, s.z, tx, tz) < 0.8) { s.carrying = false; s.got = false; S.sackOld = S.sackAt.slice(); S.sackAt = s.dest.slice(); sack.position.set(tx, 0, tz); sack.visible = true; sackGlow.position.set(tx, 1.4, tz); addGrains(S.sackOld[0], S.sackOld[1], tx, tz); } } sp = 2.4; }
  const dx = tx - s.x, dz = tz - s.z, l = Math.hypot(dx, dz); s.moving = l > 0.3 && sp > 0;
  if (s.moving) { if (!s.path || (s.repath -= dt) <= 0) { s.path = findPath(s.x, s.z, tx, tz) || []; s.pi = 0; s.repath = 1; } let nx = tx, nz = tz; if (s.path.length) { while (s.pi < s.path.length - 1 && dist(s.x, s.z, s.path[s.pi][0], s.path[s.pi][1]) < 0.7) s.pi++; [nx, nz] = s.path[s.pi]; if (l < 2) { nx = tx; nz = tz; } }
    const ex = nx - s.x, ez = nz - s.z, el = Math.hypot(ex, ez) || 1, st = Math.min(l, sp * dt); [s.x, s.z] = collideRects(SOLID, s.x + ex / el * st, s.z + ez / el * st, 0.4); s.dir = Math.atan2(ez, ex); }
  else if (!s.follow) s.dir = lerp(s.dir, Math.atan2(S.pz - s.z, S.px - s.x), dt * 2);
  s.m.position.set(s.x, 0, s.z); s.m.rotation.y = -s.dir + Math.PI / 2; walkAnim(s.m, S.t * 10 + s.i, s.moving);
}
const fmtColor = (i) => '#' + COLORS[i].shirt.toString(16).padStart(6, '0');
function placeAll(dt) {
  for (const s of sus) if (S.mode === 'play' || S.mode === 'title' || S.mode === 'intro') stepSus(s, dt);
  pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving); pRing.position.set(S.px, 0.11, S.pz);
  if (sus[S.thief].got) sack.visible = false;
  trailLamp();
  /* 머리 위 그림: 의심받는 사람(맞대 보기) · 본 사람 · 다친 사람 · 집 */
  const play = S.mode === 'play';
  for (const s of sus) { const d = dist(S.px, S.pz, s.x, s.z); let html = null;
    if (play && d < 4.2) { const foot = `<span style="font-size:${s.big ? 26 : 16}px">👣</span>`, chk = (ok) => (ok == null ? '' : ok ? '<span class="ok">✔</span>' : '<span class="no">✘</span>');
      const m0 = S.ev[0] ? (s.big ? 'big' : 'small') === S.ev[0] : null, m1 = S.ev[1] != null ? s.i === S.ev[1] : null, m2 = S.ev[2] != null ? s.cord === S.ev[2] : null;
      html = `${foot}${chk(m0)} 🏠${DOTS[s.i]}${chk(m1)} 🪢${CORDS[s.cord].i}${chk(m2)}`; if (!misFollow && !sus.some((q) => q.follow)) html += `<br><small>${ctl.isTouch ? '「데려가기」' : '스페이스'} = 데려가기</small>`; if (s.carrying && s.got) html = '🌾💦'; }
    showTag(s.tag, s.x, 2.7, s.z, html); s.m.userData.belt.scale.setScalar(d < 4.2 ? 1.15 : 1); }
  witnesses.forEach((w, i) => { const d = dist(S.px, S.pz, w.x, w.z); let html = null;
    if (play && d < 4) { const talk = i < S.hints; const T = sus[S.thief];
      html = !talk ? '🤐' : w.kind === 'keeper' ? `🌙 🧍🌾 ${arrowTo(DOOR, HOMES[S.thief])}` : w.kind === 'foot' ? `🌙 <span style="font-size:${T.big ? 28 : 16}px">👣</span>` : w.kind === 'cord' ? `🌙 🪢${CORDS[T.cord].i}` : '🌧️ ➡ 👣❌'; }
    showTag(w.tag, w.x, 2.6, w.z, html); });
  showTag(tagInj, INJURED[0], 2.2, INJURED[1], play && dist(S.px, S.pz, INJURED[0], INJURED[1]) < 4 ? (S.hurtDone ? '🌾🙂' : '🤕 ⬅ 🔨') : null);
  showTag(tagSmith, smith.position.x, 2.6, smith.position.z, play && S.hurtSeen && !S.hurtDone && dist(S.px, S.pz, smith.position.x, smith.position.z) < 4 ? `🔨😓<br><small>곁에서 ${ctl.isTouch ? '「갚게 하기」' : '스페이스'} = 갚게 하기</small>` : null);
  let hh = null; for (let i = 0; i < 3; i++) if (play && dist(S.px, S.pz, HOMES[i][0], HOMES[i][1] + 3.4) < 3) hh = i;
  showTag(tagHome, hh == null ? 0 : HOMES[hh][0], 2.4, hh == null ? 0 : HOMES[hh][1] + 3.4, hh == null ? null : (hh === S.thief ? '🍲❌ 👶😢' : '🍲🙂'));
  if (S.hurtDone) { smith.position.x = lerp(smith.position.x, INJURED[0] + 1.2, (dt || 0) * 0.8); smith.position.z = lerp(smith.position.z, INJURED[1] + 0.6, (dt || 0) * 0.8); walkAnim(smith, S.t * 9, dist(smith.position.x, smith.position.z, INJURED[0] + 1.2, INJURED[1] + 0.6) > 0.3); }
}
function trailLamp() { /* 아직 못 찾은 자취(발자국 → 낟알)에서 내 곁 지점의 몇 걸음 앞 */
  const show = S.mode === 'play'; let list = null, step = 5;
  if (S.ev[0] == null && !S.rained && prints.length) list = prints; else if (S.ev[2] == null && grains.length) { list = grains; step = 3; }
  if (!show || !list) { lamp.visible = lampPost.visible = false; return; }
  let bi = 0, bd = 1e9; list.forEach((p, i) => { const d = dist(S.px, S.pz, p.m.position.x, p.m.position.z); if (d < bd) { bd = d; bi = i; } });
  const j = bd > 6 ? bi : Math.min(list.length - 1, bi + step), q = list[j].m.position; lamp.visible = lampPost.visible = true;
  lamp.position.set(q.x, 0.9 + Math.sin(S.t * 4) * 0.15, q.z); lampPost.position.set(q.x, 1.5, q.z); lamp.material.opacity = 0.6 + Math.sin(S.t * 4) * 0.25; }
function arrowTo(a, b) { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); const arr = ['➡', '↘', '⬇', '↙', '⬅', '↖', '⬆', '↗']; return arr[(Math.round(ang / (Math.PI / 4)) + 8) % 8]; }
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(DRUM[0] - 6, DOOR[0] + 4, e), lerp(7, 34, e), lerp(DRUM[1] + 10, DOOR[1] + 26, e)); cam.lookAt(lerp(DRUM[0], DOOR[0] + 4, e), lerp(2, 0, e), lerp(DRUM[1], DOOR[1] - 2, e)); if (cam.fov !== 44) { cam.fov = 44; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'trial') { v3.set(DRUM[0] + 2, 7, DRUM[1] + 13); cam.position.lerp(v3, 0.05); cam.lookAt(DRUM[0] + 1, 1.5, DRUM[1]); }
  else followCam(cam, S, { W, H, map: { h: [86, 160], z: 10, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  gateG.visible = Math.abs(cam.position.z - 55) > 4.5 || Math.abs(cam.position.x - 40) > 6.5;
  edgeGoal($('goal'), cam, new THREE.Vector3(DRUM[0], 2.2, DRUM[1]), S.mode === 'play', 0.8);
  if (S.mode !== 'play') { for (const s of sus) s.tag.style.display = 'none'; for (const w of witnesses) w.tag.style.display = 'none'; tagInj.style.display = tagSmith.style.display = tagHome.style.display = 'none'; }
  /* 처음 하는 일 꼬리표(11-18): 빛나는 자취 위에 무엇을 하는 곳인지 — 발자국 → 낟알 → 자루 */
  { const near = sack.visible && S.ev[2] == null && !sus[S.thief].carrying && dist(S.px, S.pz, sack.position.x, sack.position.z) < 7, ok = S.mode === 'play' && lamp.visible;
    showTag(tagTrail, near ? sack.position.x : lamp.position.x, near ? 2.2 : 3.8, near ? sack.position.z : lamp.position.z, !ok && !near ? null : near ? '🪢 자루 곁에 가만히 서기' : S.ev[0] == null && !S.rained ? '👣 발자국 위에 가만히 서기' : '🌾 낟알을 따라가기'); if (S.mode !== 'play') tagTrail.style.display = 'none'; else if (tagTrail.style.display === 'block') { const hw = tagTrail.offsetWidth / 2 + 6; tagTrail.style.left = clamp(parseFloat(tagTrail.style.left), hw, innerWidth - hw) + 'px'; } }
}

/* ───── 미션(11-18): 지금 할 일 하나 — 무엇을·어떻게·어디서. 자취는 장면이 이미 빛으로 따라가게 하니 빛기둥은 사람·북에만. 누가 훔쳤는지는 미션이 알려 주지 않는다 ───── */
const misSeen = new Set(); let misFollow = false;
function misClear() { if (mis) mis.reset(); misSeen.clear(); misFollow = false; }
const misNext = () => sus.filter((s) => !misSeen.has(s.i)).sort((a, b) => dist(S.px, S.pz, a.x, a.z) - dist(S.px, S.pz, b.x, b.z))[0];
mis = missions(scene, cam, [
  { t: '발자국 본뜨기', how: '곳간 문 앞 빛나는 발자국 위에 가만히 서 있으면 본뜬다 — 비가 오면 지워진다', done: () => S.ev[0] != null || S.rained },
  { t: '낟알 길 따라가 자루 찾기', how: '흘린 낟알을 따라가다 자루 곁에 가만히 서면 살핀다 — 끈 색과 지나온 집을 안다', done: () => S.ev[2] != null },
  { t: '세 사람 곁에 서서 맞대 보기', how: '빨강·파랑·초록 옷 사람 곁에 서면 머리 위에 증거가 ✔ ✘ 로 뜬다', n: () => [misSeen.size, 3], done: () => misSeen.size >= 3 || misFollow,
    at: () => { const s = misNext(); return s && dist(S.px, S.pz, s.x, s.z) > 4.2 ? [s.x, s.z] : null; }, tag: '🧍 곁에 가서 ✔✘ 보기' },
  { t: '훔친 것 같은 사람 데려가기', how: (tc) => `✔ 가 가장 많은 사람 곁에서 ${tc ? '「데려가기」' : '<kbd>스페이스</kbd>'} — 한 번 더 누르면 놓아준다`, done: () => misFollow },
  { t: '재판 마당 큰 북 앞에 세우기', how: '데려가는 사람과 함께 남쪽 재판 마당의 큰 북 곁까지 걷기 — 셋째 북이 울리기 전에', done: () => S.mode === 'trial' && S.by === 'you',
    at: () => (sus.some((s) => s.follow) && dist(S.px, S.pz, DRUM[0], DRUM[1]) > 8 ? [DRUM[0], DRUM[1] + 2.2] : null), tag: '🥁 데려와서 북 곁에 서기' },
], { allText: '⚖ 재판이 열린다!' });
function misWatch() { if (S.mode !== 'play') return; for (const s of sus) if (dist(S.px, S.pz, s.x, s.z) < 4.2) misSeen.add(s.i); if (sus.some((s) => s.follow)) misFollow = true; }

resetRound(true); placeAll(0.016);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.drum(); };
runLoop((dt) => { update(dt); misWatch(); mis.update(dt, S.mode === 'play' || (S.mode === 'trial' && S.endT < 2.4)); }, view, () => renderer.render(scene, cam));
window.__scene = { S, sus, update, keys, ctl, act, matchOf, get prints() { return prints; }, get grains() { return grains; }, sack,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { let stuck = 0, lx = S.px, lz = S.pz; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz); ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - lx, S.pz - lz) < 0.01) { if (++stuck > 30) break; } else stuck = 0; lx = S.px; lz = S.pz; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  path: (ax, az, bx, bz) => findPath(ax, az, bx, bz),
  const: { DOOR, DRUM, HOMES, INJURED, SMITH, HIDE2 } };
