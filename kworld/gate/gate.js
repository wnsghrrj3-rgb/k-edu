/* 케이월드 · 골품의 문 — 통일신라·발해 한 장면(S06, 2026-11-17). 본보기 = 그믐밤(순시의 불빛·종), 공통 부품 = ../scene/kit.js.
   목표는 하나(가장 안쪽 전각의 등불)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 종이 다 울리면 다음 판은 진골 벗 길이 닫힌다.
   문 넷(누런·푸른·붉은·자줏빛): 문지기가 옷 빛깔을 본다. 내 옷은 붉은빛 — 붉은 문까지는 열린다. 자줏빛 문은 어떤 빛깔로도 열리지 않는다(진골만).
   거기서부터 길은 몸으로 고른다: 🧱 담 넘기 · 🤝 진골 벗에게 맡기기 · ⛵ 나루(당나라) · 🏯 절 · 🐎 호족 — 다섯 갈래 끝.
   순시하는 관리의 불빛 안에서 서성이면(가만히 서 있거나 일하면) 첫 문 밖으로 쫓겨난다. 담을 넘다 들키면 벼슬을 잃는다.
   좌표: x 동쪽(+), z 남쪽(+). 남쪽 바깥뜰에서 북쪽 전각으로. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, losRects, rayLenRects, gridPath, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, runLoop, loadArt, ART, art, artInst, artGeo, artMat, artGlowMat, scatter, missions } from '../scene/kit.js?v=5';
await loadArt('people', 'nature', 'build', 'props', 'gate');   /* 블렌더로 만든 모델(사람·자연·집·소품 + 이 장면만의 것: tools/blender/make_gate.py → gate.glb) */

const W = 80, H = 70, BX = [2, 78], BZ = [1, 66], DUSK = 200;
const GZ = [46, 34, 22, 10], GX = [37.5, 42.5];
const GATE = [{ name: '누런 문', c: 0xd8b84a, rank: 0, i: '🟨' }, { name: '푸른 문', c: 0x3a6ac0, rank: 1, i: '🟦' }, { name: '붉은 문', c: 0xc0302a, rank: 2, i: '🟥' }, { name: '자줏빛 문', c: 0x7a2a8a, rank: 3, i: '🟪' }];
const START = [40, 55], HALL = [40, 4], LANTERN = [40, 6.6];
const SHELVES = [[15, 40.5], [21, 44], [26, 38]], EXAM = [22, 29.5], ENVOY = [57, 41.5];
const FRIEND = [49, 15.5], CLIMB = [20, 11.7], OVER = [20, 8.2];
const FERRY = [74.5, 48], TEMPLE = [5, 40], HOJOK = [40, 63];
const SOLID = [];
for (const z of GZ) { SOLID.push([10, z - 0.5, GX[0], z + 0.5, 3, 'wall'], [GX[1], z - 0.5, 70, z + 0.5, 3, 'wall']); }
SOLID.push([9.5, -1, 10.5, 38, 3, 'wall'], [9.5, 42, 10.5, 58.5, 3, 'wall'], [69.5, -1, 70.5, 50, 3, 'wall'], [69.5, 54, 70.5, 58.5, 3, 'wall'], [10, 58, 37, 58.8, 3, 'wall'], [43, 58, 70, 58.8, 3, 'wall'], [10, -1.5, 70, -0.5, 3, 'wall']);
SOLID.push([31, 0.5, 49, 5.5, 4, 'hall'], [12, 36.5, 30, 38.6, 2.6, 'library'], [54, 36.5, 66, 39.5, 2.6, 'guest'], [12, 24.5, 26, 27.5, 2.6, 'exam'], [58, 24.5, 66, 28, 2.6, 'office'], [76, 30, 82, 66, 0.2, 'river']);
const gateRects = GZ.map((z) => [GX[0], z - 0.5, GX[1], z + 0.5, 3, 'gate']);
const seed0 = +(new URLSearchParams(location.search).get('seed') || (Date.now() % 100000));

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xf2d0b0, 80, 220], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x7a6a5a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff1d6, intensity: 2.0, box: [46, 40], far: 160, pos: [W / 2 - 34, 50, H / 2 + 30], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261122), drnd = rng(60606);   /* drnd = 꾸밈 전용(놀이의 rnd 차례를 건드리지 않는다) */
/* 그림 도우미 — 모델 여럿을 한 덩이로 굽는다(그리기 한 번). parts = [[이름, x, y, z, 크기 또는 [sx, sy, sz], 돌림y, 색], …]. own 이 참이면 제 재질(비쳐 보이게 할 묶음용) */
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
const sky = skyDome(scene, rnd, { top: 0x74aae8, low: 0xffe0b8 });
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* 땅 · 담 · 문 */
flat(-60, -40, W + 60, H + 30, 0x8ab85a, 0);
flat(10, -1, 70, 58.5, 0xd8c8a8, 0.02);
flat(37, 0, 43, 66, 0xe8dcc0, 0.03);
flat(76, -20, 120, 90, 0x3a8ad8, 0.04);
/* 바닥 돌(옛 판과 같은 rnd 차례: 너비 · 깊이 · 빛깔 · x · z) + 가운데 돌길 */
{ const PV = [[], []]; for (let i = 0; i < 60; i++) { const sx = 0.8 + rnd(), sz = 0.6 + rnd(), k = rnd() > 0.5 ? 1 : 0; PV[k].push([11 + rnd() * 58, 0.015, rnd() * 57, [sx, 1, sz], 0]); }
  for (let z = 0.9; z < 66; z += 1.02) for (const x of [38.55, 40, 41.45]) PV[(Math.round(z) + Math.round(x)) % 3 ? 0 : 1].push([x + (drnd() - 0.5) * 0.06, 0.012, z, [1.38, 1, 0.96], (drnd() - 0.5) * 0.04]);
  artInst(scene, 'pave', PV[0], {}, { shadow: false }); artInst(scene, 'pave_d', PV[1], {}, { shadow: false }); }
/* 판축 흙담: 4 m 토막(sil_wall)을 담 한 줄마다 한 덩이로 굽는다(화면·그림자 밖의 줄은 통째로 빠진다). 넘을 낮은 담은 sil_wall_low */
const WALLS = [], WALLC = { wall: 0xd4b588 };
function wallM(x0, z0, x1, z1, h) { const w = x1 - x0, d = z1 - z0, along = w >= d, L = along ? w : d, n = Math.max(1, Math.round(L / 4)), low = h < 2, WALLP = []; WALLS.push(WALLP);
  for (let i = 0; i < n; i++) WALLP.push([low ? 'sil_wall_low' : 'sil_wall', along ? x0 + ((i + 0.5) * w) / n : (x0 + x1) / 2, 0, along ? (z0 + z1) / 2 : z0 + ((i + 0.5) * d) / n, [L / n / 4, low ? 1 : h / 3, along ? d : w], along ? 0 : Math.PI / 2, WALLC]); }
for (const s of SOLID) if (s[5] === 'wall') { const low = s[1] < 11 && s[3] > 9 && s[0] < 22 && s[2] > 18; if (!low) wallM(s[0], s[1], s[2], s[3], s[4]); }
/* 낮은 담(넘을 곳): z=10 서쪽 담의 한 토막 */
wallM(10, 9.5, 18, 10.5, 3); wallM(18, 9.5, 22, 10.5, 1.5); wallM(22, 9.5, GX[0], 10.5, 3);
wallM(-1, 26, 0, 38, 3); wallM(-1, 42, 0, 54, 3);   /* 절 담(판 밖, 일주문 너머) */
for (const wp of WALLS) scene.add(bake(wp, false, true));
SOLID.splice(SOLID.findIndex((s) => s[5] === 'wall' && s[1] === 9.5 && s[0] === 10), 1, [10, 9.5, GX[0], 10.5, 3, 'wall']);
/* 문: 누런·푸른 = 맞배 한 칸(gate_a) · 붉은 = 공포 얹은 팔작(gate_b) · 자줏빛 = 두 층 문루(gate_c). 가로대·현판·문짝이 문 빛깔. 지붕 밑을 지날 때 비쳐 보이게 묶음으로 */
const GATEM = ['gate_a', 'gate_a', 'gate_b', 'gate_c'];
const gates = GZ.map((z, i) => { group([GX[0], z - 0.5, GX[1], z + 0.5], [bake([[GATEM[i], 40, 0, z, 1, 0, { rank: GATE[i].c }]], true)]);
  const L = new THREE.Group(), R = new THREE.Group(), lm = art('gate_leaf', { door: GATE[i].c }), rm = art('gate_leaf', { door: GATE[i].c }); rm.scale.x = -1; L.add(lm); R.add(rm); L.position.set(GX[0] + 0.1, 0, z); R.position.set(GX[1] - 0.1, 0, z); scene.add(L, R); return { L, R, open: 0 }; });
group([37, 58, 43, 58.8], [bake([['gate_a', 40, 0, 58.4, [1.2, 1, 1], 0, { rank: 0x8a5a3a }]], true)]);   /* 관청 거리 바깥문(문짝 없음) */
/* 전각 · 등불 */
/* 전각: 두 단 기단 · 일곱 칸 붉은 기둥 · 단청 · 팔작지붕과 치미(jeongak — 기단이 막는 네모 18 x 5 에 꼭 맞는다) */
group([31, 0.5, 49, 5.5], [bake([['jeongak', 40, 0, 3, 1, 0]], true)]);
const lantern = new THREE.Group(); lantern.add(art('seokdeung')); lantern.position.set(LANTERN[0], 0, LANTERN[1]); scene.add(lantern);   /* 신라 석등 — 불 창 가운데가 2.9 */
const lanternGlow = glowSprite(scene, 'rgba(255,225,150,.95)', 'rgba(255,170,60,0)', 6); lanternGlow.position.set(LANTERN[0], 2.9, LANTERN[1]);
/* 서고 · 객관 · 시험장 · 관청 */
/* 서고(앞이 트인 툇간 — 셋째 책 시렁이 그 안에 선다) · 객관(툇마루) · 시험장(트인 대청과 책상 줄) · 관청 — 막는 네모에 꼭 맞게 지은 모델 */
function hall(x0, z0, x1, z1, name, roofC) { group([x0, z0, x1, z1], [bake([[name, (x0 + x1) / 2, 0, (z0 + z1) / 2, 1, 0, { roof: roofC }]], true)]); }
hall(12, 36.5, 30, 38.6, 'lib_hall', 0x58627a); hall(54, 36.5, 66, 39.5, 'guest_hall', 0x5c6a66); hall(12, 24.5, 26, 27.5, 'exam_hall', 0x665c66); hall(58, 24.5, 66, 28, 'office_hall', 0x58627a);
const shelves = SHELVES.map(([x, z], i) => { const g = new THREE.Group(); g.add(art('bookshelf')); g.position.set(x, i === 2 ? 0.2 : 0, z - 0.6); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g; });
const desk = new THREE.Group(); desk.add(art('exam_desk')); desk.rotation.y = Math.PI; desk.position.set(EXAM[0], 0, EXAM[1] - 0.8); scene.add(desk);
/* 바깥: 나루 배 · 절 일주문 · 호족 말 */
const boat = new THREE.Group(); { const s = art('tang_ship'); s.rotation.y = -Math.PI / 2; boat.add(s); } boat.position.set(79.4, 0, FERRY[1]); boat.rotation.y = Math.PI / 2; scene.add(boat);   /* 당나라 가는 배(대발 돛) */
{ const n = art('naru'); n.position.set(76.3, 0, FERRY[1]); scene.add(n); }
{ const g = new THREE.Group(), m = art('iljumun'); m.rotation.y = Math.PI / 2; g.add(m); g.position.set(TEMPLE[0], 0, TEMPLE[1]); scene.add(g); }   /* 절 일주문 — 기둥 둘이 z ±1.6 */
const horse = new THREE.Group(); { const m = art('horse'); m.rotation.y = Math.PI / 2; horse.add(m); } horse.position.set(HOJOK[0] + 2.4, 0, HOJOK[1]); scene.add(horse);
/* ───── 판 밖(못 가는 곳) · 가장자리 풀 — 꾸밈은 drnd 만 쓴다 ───── */
{ flat(37, 66, 43, 104, 0xe0d2b4, 0.03); flat(-26, 36.5, 2, 43.5, 0xd8c8a8, 0.025);
  /* 판 밖은 구역마다 한 덩이로 굽는다 — 화면 밖 구역은 통째로 빠진다(나무 · 집이 많아도 삼각형을 아낀다) */
  const CH = {}, put = (x, z, part) => { const k = x < 2 ? (z < 30 ? 'w0' : z < 62 ? 'w1' : 'w2') : x > 76 ? (z < 30 ? 'e0' : 'e1') : z < 20 ? 'n' : 's'; (CH[k] = CH[k] || []).push(part); };
  /* 절: 삼층 석탑 · 석등 · 금당 */
  put(-7, 40, ['pagoda', -7, 0, 40, 1, Math.PI / 2]); put(-3, 40, ['seokdeung', -3.2, 0, 40, 0.8, Math.PI / 2]); put(-15, 40, ['office_hall', -15, 0, 40, [1, 1.1, 1.2], Math.PI / 2, { roof: 0x5a6272 }]);
  /* 북쪽 너머 궁궐 지붕(진골의 세상) · 서라벌 기와집 거리(남쪽) · 먼 마을 초가 */
  put(40, -16, ['jeongak', 40, 0, -16, 1.15, 0]);
  [[14, 71.5, 'tile_a', Math.PI], [26, 72, 'tile_b', Math.PI], [56, 71.5, 'tile_a', Math.PI], [67, 72, 'tile_b', Math.PI], [22, 86, 'tile_b', 0], [58, 86, 'tile_a', 0]].forEach(([x, z, n, ry]) => put(x, z, [n, x + (drnd() - 0.5) * 1.2, 0, z, 0.95 + drnd() * 0.15, ry, { wall: 0xe0d0b0 }]));
  for (let i = 0; i < 3; i++) { const x = -26 + i * 22 + drnd() * 3, z = 99 + drnd() * 5; put(x, z, [i % 2 ? 'thatch_a' : 'thatch_b', x, 0, z, 1, Math.PI + (drnd() - 0.5) * 0.4, { wall: 0xe0d0b0 }]); }
  const out = (x, z) => (x > 1 && x < 76.5 && z > -2.5 && z < 68.5) || (x > -24 && x < 3 && z > 34 && z < 46) || (Math.abs(x - 40) < 9 && z > -22 && z < -6) || (z > 66 && z < 92 && x > 0 && x < 80) || (x > 76 && x < 121) || (z > 94 && z < 106 && x > -32 && x < 46);
  for (let i = 0, n = 0; i < 600 && n < 50; i++) { const x = -60 + drnd() * 190, z = -48 + drnd() * 160, nm = ['pine_a', 'pine_b', 'pine_k', 'pine_a', 'tree_a'][Math.floor(drnd() * 5)], sc = 0.9 + drnd() * 0.6, ry = drnd() * 6.28; if (out(x, z)) continue; n++; put(x, z, [nm, x, 0, z, sc, ry]); }
  for (const k in CH) scene.add(bake(CH[k], false, false));
  const hills = [[-40, -55, 60, 14], [10, -62, 70, 20], [70, -58, 64, 16], [125, -30, 50, 12], [140, 20, 46, 10], [132, 70, 54, 13], [-55, 10, 44, 11], [-60, 70, 50, 12]];
  hills.forEach(([x, z, r, h], i) => artInst(scene, i % 2 ? 'hill_b' : 'hill_a', [[x, -0.5, z, [r, h, r], i * 0.9]], {}, { shadow: false }));
  scatter(scene, drnd, { area: [76.1, 30, 77.4, 66], n: 6, names: ['reed'], avoid: (x, z) => z > 43 && z < 53, scale: [0.8, 1.2], shadow: false });
  /* 판 안 가장자리 풀(밟고 지나가도 되는 것만): 서쪽 · 남쪽 · 동쪽 띠 */
  const inYard = (x, z) => x > 9.3 && x < 70.7 && z > -1.8 && z < 59;
  scatter(scene, drnd, { area: [2, 1, 78, 66], n: 95, names: ['grass_a', 'grass_b', 'grass_a'], avoid: (x, z) => inYard(x, z) || (x > 36.5 && x < 43.5) || dist(x, z, TEMPLE[0], TEMPLE[1]) < 2.6 || x > 75.6 || dist(x, z, HOJOK[0], HOJOK[1]) < 2 || dist(x, z, FERRY[0], FERRY[1]) < 2.5, scale: [0.8, 1.3], shadow: false }); }
/* 사람: 나 · 문지기 · 순시 · 진골 벗 · 발해 사신 · 호족 */
const SKIN = 0xf0c48e;
const ROBE = [0xd8b84a, 0x3a6ac0, 0xc0503a, 0x9a2a2a];
const pMesh = person({ shirt: ROBE[2], pants: 0x5a3a2a, hat: 'boktu', skin: SKIN });
const scroll = at(cyl(0.1, 0.1, 0.5, 0xf2e6d0, 8), 0, 0, 0); scroll.rotation.z = Math.PI / 2; scene.add(scroll);
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const keepers = GZ.map((z, i) => { const m = person({ shirt: GATE[i].c, pants: 0x3a2a2a, hat: 'guard', mood: 'stern', skin: SKIN }); m.position.set(44.4, 0, z + 1.6); m.rotation.y = Math.PI; return m; });
const friend = person({ shirt: 0x7a2a8a, pants: 0x3a1a3a, hat: 'boktu', skin: SKIN }); friend.position.set(FRIEND[0], 0, FRIEND[1]); friend.rotation.y = 0;
const envoy = person({ shirt: 0x2a5a4a, pants: 0x2a3a3a, hat: 'satgat', skin: SKIN }); envoy.position.set(ENVOY[0], 0, ENVOY[1]); envoy.rotation.y = -Math.PI / 2;
const hojok = person({ shirt: 0x6a5a3a, pants: 0x3a2a1a, hat: 'band', mood: 'stern', skin: SKIN }); hojok.position.set(HOJOK[0], 0, HOJOK[1]); hojok.rotation.y = Math.PI;
const monk = person({ shirt: 0x8a7a6a, pants: 0x5a4a3a, hat: 'crop', skin: SKIN }); monk.position.set(TEMPLE[0] + 1.6, 0, TEMPLE[1] + 2); monk.rotation.y = Math.PI / 2;
const boatman = person({ shirt: 0x8fa3b8, pants: 0x6a7686, hat: 'satgat', skin: SKIN }); boatman.position.set(76.4, 0.3, FERRY[1] + 1.4); boatman.rotation.y = -Math.PI / 2;
/* 순시: 그믐밤 순라꾼과 같은 불빛 부채꼴 */
const PATROL_DEF = [[[16, 44.5], [67.5, 44.5], [67.5, 35.5], [34, 35.5], [34, 44.5], [16, 44.5], [16, 35.5]], [[14, 31.5], [67.5, 31.5], [67.5, 23.5], [44, 23.5], [44, 31.5], [30, 23.5], [14, 23.5]], [[14, 12.5], [34, 12.5], [34, 19.5], [62, 19.5], [66, 12.5], [44, 12.5], [44, 19.5], [14, 19.5]]];
function mkCone(col) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(26 * 3), 3)); const idx = []; for (let i = 1; i < 25; i++) idx.push(0, i + 1, i); geo.setIndex(idx); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = 2; scene.add(m); return m; }
const patrols = PATROL_DEF.map((path) => ({ path, x: path[0][0], z: path[0][1], wp: 1, dir: 0, see: 0, look: 0, mesh: person({ shirt: 0x3a4a7a, pants: 0x2a2a3a, hat: 'guard', mood: 'stern', lantern: true, skin: SKIN }), cone: mkCone(0xffc65a) }));
const allSolid = () => SOLID.concat(gateRects.filter((r, i) => gates[i].open < 0.5));
/* 갈림 표시(자줏빛 문에 막힌 뒤 보인다) */
const PATHS = [{ k: 'wall', at: CLIMB, ic: '🧱 담 넘기' }, { k: 'friend', at: FRIEND, ic: '🤝 진골 벗' }, { k: 'ferry', at: FERRY, ic: '⛵ 나루 · 당나라' }, { k: 'temple', at: TEMPLE, ic: '🏯 절' }, { k: 'hojok', at: HOJOK, ic: '🐎 호족' }];
const pathGlows = PATHS.map((p) => { const g = glowSprite(scene, 'rgba(255,240,180,.9)', 'rgba(255,200,90,0)', 3.4); g.position.set(p.at[0], 1.6, p.at[1]); g.visible = false; return g; });
const tagBox = $('tags'); const mkTag = () => { const d = document.createElement('div'); d.className = 'tag'; tagBox.appendChild(d); return d; };
const gateTags = GZ.map(mkTag), pathTags = PATHS.map(mkTag), tagEnvoy = mkTag(), tagFriend = mkTag();

/* ───── 소리 ───── */
const SFX = {
  bell: (n = 1) => { for (let i = 0; i < n; i++) { tone(196, 190, 1.8, 'sine', 0.22, i * 1.2); tone(392, 388, 1.3, 'sine', 0.07, i * 1.2); } },
  gate: () => { noise(0.5, 0.25, 220); tone(120, 90, 0.5, 'sawtooth', 0.06); },
  no: () => { tone(260, 160, 0.4, 'sawtooth', 0.1); },
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  done: () => { tone(523, 523, 0.14, 'triangle', 0.16); tone(784, 784, 0.22, 'triangle', 0.16, 0.14); },
  huh: () => tone(300, 420, 0.18, 'sawtooth', 0.07),
  whistle: () => { tone(2100, 2500, 0.28, 'square', 0.1); tone(2500, 2000, 0.3, 'square', 0.1, 0.3); },
  step: () => noise(0.05, 0.05, 300),
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  end: () => { [392, 494, 587, 784].forEach((f, i) => tone(f, f, 0.6, 'triangle', 0.14, i * 0.2)); },
  sad: () => { tone(330, 220, 1.2, 'sine', 0.14); tone(262, 175, 1.4, 'sine', 0.1, 0.4); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', round: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, k: 0, px: START[0], pz: START[1], pdir: -Math.PI / 2, moving: false, running: false, said: {}, sayT: 0,
  rank: 2, books: [false, false, false], exam: false, balhae: false, refused: false, friendClosed: false, meter: 0, climbT: 0, inHall: false, bells: 0, path: null, caught: 0, workT: 0, workKey: '', endT: 0, shown: false, introT: 0, beatT: 0, stepT: 0, spd: 0 };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 문 앞에 서면 문지기가 옷을 본다 · 가만히 서면 읽고·건넨다 · 순시 불빛 안에서 서성이면 쫓겨난다 · 「시점」 ⟲⟳';
const grid = new Uint8Array(W * H); for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { const cx = x + 0.5, cz = z + 0.5; let b = false; for (const s of SOLID) if (inRect(cx, cz, s, 0.6)) b = true; grid[z * W + x] = b ? 1 : 0; }
const findPath = gridPath(grid, W, H);
const gateOk = (i, rank = S.rank) => rank >= GATE[i].rank && i < 3;   /* 자줏빛 문(i=3)은 옷 빛깔로 열리지 않는다 — 진골만 */

function resetRound(full) {
  if (full) { S.round = 1; S.friendClosed = false; }
  Object.assign(S, { t: 0, k: 0, px: START[0], pz: START[1], pdir: -Math.PI / 2, rank: 2, books: [false, false, false], exam: false, balhae: false, refused: false, meter: 0, climbT: 0, inHall: false, bells: 0, path: null, caught: 0, workT: 0, endT: 0, shown: false });
  gates.forEach((g) => (g.open = 0)); patrols.forEach((p) => { p.x = p.path[0][0]; p.z = p.path[0][1]; p.wp = 1; });
  friend.visible = !S.friendClosed; pathGlows.forEach((g) => (g.visible = false)); pMesh.userData.body.material.color.set(ROBE[2]); pMesh.userData.skirt.material.color.set(ROBE[2]);
  $('fade').style.opacity = 0; lightFor(0); hud();
}
function hud() {
  const r = $('robe'); r.querySelector('b').style.background = '#' + ROBE[S.exam ? 3 : 2].toString(16).padStart(6, '0'); r.querySelector('span').textContent = S.exam ? '짙은 붉은빛' : '붉은빛';
  const nb = S.books.filter(Boolean).length; $('hBook').textContent = '📜 글 다듬기 ' + nb + '/3'; $('tBook').className = nb >= 3 ? 'on' : ''; $('tExam').className = S.exam ? 'on' : ''; $('tBalhae').className = S.balhae ? 'on' : '';
  $('bell').querySelector('i').style.width = clamp(S.k, 0, 1) * 100 + '%';
}

/* ───── 끝 ───── */
const PATH_END = {
  friend: ['진골 벗에게', '글은 임금 앞에 올라갔다. 그러나 이름은 <b>진골 벗의 것</b>이 되었다.', '🤝 벗에게 맡김'],
  wall: ['담을 넘어', '담을 넘어 전각 앞에 글을 놓았다. <b>누가 썼는지는 아무도 묻지 않았다.</b>', '🧱 담을 넘음'],
  wallCaught: ['벼슬을 잃다', '담을 넘다 붙잡혔다. <b>벼슬을 잃고</b> 서라벌에서 쫓겨났다.', '🧱 담에서 붙잡힘'],
  ferry: ['당나라로', '나루에서 당나라 가는 배를 탔다. 그곳 시험에 붙어 이름을 날렸다. <b>돌아와도 문은 같았다.</b>', '⛵ 당나라'],
  temple: ['절로', '산속 절에 들어가 글을 남겼다. 글은 <b>산문 밖으로</b> 조용히 퍼졌다.', '🏯 절'],
  hojok: ['호족에게', '서라벌을 떠나 지방 호족을 찾아갔다. 서라벌 밖에서 <b>새 힘</b>이 자라기 시작했다.', '🐎 호족'],
};
function finish(kind) { S.mode = 'end'; S.endT = 0; S.path = kind; SFX[kind === 'wallCaught' ? 'sad' : 'end'](); say(kind === 'wallCaught' ? '"게 섰거라!" — 담 위에서 붙잡혔다' : '길을 골랐다…', null, 2.6); }
function endScreen() {
  const nb = S.books.filter(Boolean).length, p = PATH_END[S.path];
  const quality = nb >= 3 ? ' 다듬은 글이 날카로워 읽은 사람마다 고개를 끄덕였다.' : nb ? ' 글은 아직 거칠었다.' : ' 다듬지 못한 글이라 힘이 약했다.';
  const marks = `<div class="marks"><span class="${nb >= 3 ? 'ok' : ''}">📜 다듬은 글 ${nb}/3</span><span class="${S.exam ? 'ok' : ''}">🎓 ${S.exam ? '시험에 붙음' : '시험 안 봄'}</span><span class="${S.balhae ? 'ok' : ''}">🤝 ${S.balhae ? '발해 사신' : '발해 모름'}</span><span class="ok">🚪 ${p[2]}</span></div>`;
  overlay(`<h1>${p[0]}</h1><p>${p[1]}${S.path === 'wallCaught' ? '' : quality}</p>${S.balhae ? '<p class="keys">객관에서 만난 발해 사람이 말했다 — 북쪽에도 고구려를 이은 나라가 있다고.</p>' : ''}${marks}
    <p class="keys">재주가 문을 열지 못할 때, 사람들은 다른 문을 찾아 떠났다.</p>
    <div class="fact">📜 <b>골품</b> — 신라는 태어난 집안에 따라 오를 수 있는 벼슬이 정해져 있었다. 옷 빛깔, 집 크기까지 달랐다.<br>📜 <b>6두품</b> — 재주가 있어도 높은 벼슬에는 오를 수 없었다. 당나라로 떠나거나 지방 힘센 사람들과 손잡은 이가 많았다.<br>📜 <b>발해</b> — 고구려가 무너진 뒤 그 사람들이 북쪽에 세운 나라다. 「바다 동쪽의 번성한 나라」라 불렸다.<br>📜 <b>남과 북</b> — 남쪽에 신라, 북쪽에 발해가 함께 있던 때다.</div>`,
    '다른 길로 한 번 더', () => { S.round++; resetRound(false); S.mode = 'play'; });
}
function failBell() {
  S.mode = 'fail'; S.endT = 0; SFX.sad(); say('종이 다 울렸다 — 문이 모두 닫혔다', null, 2.6);
  setTimeout(() => overlay(`<h1>문이 닫혔다</h1><p>종이 다 울렸다. 글은 올라가지 못했다.</p><p>다음 날 — 진골 벗이 <b>먼저 다른 사람의 글을 맡았다</b>. 벗에게 맡기는 길은 닫혀 있다.</p><p class="keys">${S.round + 1}번째 날 · 등불은 아직 켜져 있다.</p>`, '다시 관청 거리로', () => { S.round++; S.friendClosed = true; resetRound(false); S.mode = 'play'; say('진골 벗 길이 닫혔다 — 다른 길을 찾자', null, 3); }), 1800);
}

/* ───── 하늘 ───── */
const SKY = [[0, 0x74aae8, 0xffe0b8, 0xfff1d6, 2.0, 1.3], [0.55, 0x7a9ed8, 0xffc890, 0xffd8a8, 1.7, 1.15], [0.8, 0x6a6aa8, 0xff9a5a, 0xffa060, 1.3, 0.95], [1.0, 0x3a3a78, 0xd8505a, 0xff7040, 0.8, 0.7], [1.2, 0x1a1a40, 0x4a3060, 0x8a60a0, 0.3, 0.5]];
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); let lastSky = -1;
function lightFor(k) { let a = SKY[0], b = SKY[SKY.length - 1]; for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = clamp((k - a[0]) / ((b[0] - a[0]) || 1), 0, 1); cT.set(a[1]).lerp(tc.set(b[1]), t); cL.set(a[2]).lerp(tc.set(b[2]), t);
  if (Math.abs(k - lastSky) > 0.004) { sky.paint(cT, cL); lastSky = k; } scene.fog.color.copy(cL); sun.color.set(a[3]).lerp(tc.set(b[3]), t); sun.intensity = lerp(a[4], b[4], t); hemi.intensity = lerp(a[5], b[5], t);
  const az = lerp(2.3, 3.0, clamp(k, 0, 1)), el = lerp(1.0, 0.18, clamp(k, 0, 1)); sun.position.set(W / 2 + Math.cos(az) * Math.cos(el) * 70, Math.sin(el) * 70 + 4, H / 2 + Math.sin(az) * Math.cos(el) * 70); }

/* ───── 순시 ───── */
function drawCone(cone, x, z, dir, range, half, hot) { const p = cone.geometry.attributes.position, sol = allSolid(); p.setXYZ(0, x, 0.09, z); for (let i = 0; i <= 24; i++) { const a = dir - half + (i / 24) * half * 2, cx = Math.cos(a), cz = Math.sin(a), l = rayLenRects(sol, x, z, cx, cz, range); p.setXYZ(i + 1, x + cx * l, 0.09, z + cz * l); } p.needsUpdate = true; cone.material.color.set(hot ? 0xff5a3c : 0xffc65a); cone.material.opacity = hot ? 0.38 : 0.22; }
function stepPatrol(p, dt) {
  const range = 8.5, half = 0.58, d = dist(p.x, p.z, S.px, S.pz); let sees = false;
  if (d < range && S.mode === 'play' && !S.inHall) { let a = Math.atan2(S.pz - p.z, S.px - p.x) - p.dir; a = Math.atan2(Math.sin(a), Math.cos(a)); if ((Math.abs(a) < half || d < 1.4) && losRects(allSolid(), p.x, p.z, S.px, S.pz)) sees = true; }
  p.see = sees;
  let sp = 1.9; if (p.look > 0) { p.look -= dt; sp = 0; p.dir += dt * 1.2; }
  else { p.wp %= p.path.length; const w = p.path[p.wp]; const dx = w[0] - p.x, dz = w[1] - p.z, l = Math.hypot(dx, dz); if (l < 0.5) { p.wp = (p.wp + 1) % p.path.length; if (rnd() < 0.3) p.look = 1.6; } else { p.x += dx / l * sp * dt; p.z += dz / l * sp * dt; let da = Math.atan2(dz, dx) - p.dir; da = Math.atan2(Math.sin(da), Math.cos(da)); p.dir += clamp(da, -dt * 4, dt * 4); } }
  p.mesh.position.set(p.x, 0, p.z); p.mesh.rotation.y = -p.dir + Math.PI / 2; walkAnim(p.mesh, S.t * 9 + p.x, sp > 0 && p.look <= 0);
  drawCone(p.cone, p.x, p.z, p.dir, range, half, sees);
  return sees;
}

/* ───── 한 걸음 ───── */
const v3 = new THREE.Vector3();
function showTag(el, x, y, z, html) { if (!html) { el.style.display = 'none'; return; } const q = v3.set(x, y, z).project(cam); if (q.z > 1) { el.style.display = 'none'; return; } el.style.display = 'block'; el.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; el.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; if (el._h !== html) { el.innerHTML = html; el._h = html; } }
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  lanternGlow.material.opacity = 0.75 + Math.sin(S.t * 2.6) * 0.18; pathGlows.forEach((g, i) => (g.material.opacity = 0.6 + Math.sin(S.t * 3 + i) * 0.25));
  gates.forEach((g) => { const a = g.open * 1.5; g.L.rotation.y = -a; g.R.rotation.y = a; });
  if (S.mode === 'title' || S.mode === 'intro') { if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.2) { S.mode = 'play'; say('문지기가 옷 빛깔을 본다 — 내 옷은 붉은빛', null, 3); } } for (const p of patrols) stepPatrol(p, dt); place(); return; }
  if (S.mode === 'end' || S.mode === 'fail') { S.endT += dt; if (S.mode === 'end' && S.endT > 2.6 && !S.shown) { S.shown = true; endScreen(); } place(); return; }
  if (S.mode !== 'play') return;

  /* 종 */
  S.k = S.t / DUSK; lightFor(S.k); hud();
  const nb = S.k >= 1 ? 3 : S.k >= 0.8 ? 2 : S.k >= 0.55 ? 1 : 0; if (nb > S.bells) { S.bells = nb; SFX.bell(nb === 3 ? 3 : 1); if (nb < 3) say(nb === 1 ? '댕— 첫 종. 해가 기운다' : '댕— 두 번째 종! 곧 문이 닫힌다', null, 2.8); }
  if (S.bells >= 3) { gates.forEach((g) => (g.open = 0)); return failBell(); }

  /* 나 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running(); const ox = S.px, oz = S.pz;
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 4.7 : 3.0) * (back ? 0.6 : 1); const [nx, nz] = collideRects(allSolid(), S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); if (S.view !== 2) S.pdir = Math.atan2(iz, ix); S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; SFX.step(); } }
  S.spd = Math.hypot(S.px - ox, S.pz - oz) / dt;
  S.inHall = S.pz < 9.4 && S.px > 10.5 && S.px < 69.5;

  /* 문지기: 옷 빛깔을 본다 */
  for (let i = 0; i < 4; i++) { const d = dist(S.px, S.pz, 40, GZ[i] + 1.4);
    if (d < 3.4 && gates[i].open < 1) { if (gateOk(i)) { if (gates[i].open === 0) { SFX.gate(); say(GATE[i].name + ' — 문지기가 옷을 보고 문을 연다', null, 1.8); } gates[i].open = Math.min(1, gates[i].open + dt * 1.5); }
      else if (!S.said['purple']) { S.said['purple'] = 1; S.refused = true; SFX.no(); say('"자줏빛 옷은 진골만 입는다." — 이 문은 열리지 않는다', null, 4); setTimeout(() => say('다른 길을 찾자 — 빛나는 곳 다섯', null, 3), 4200); pathGlows.forEach((g, j) => (g.visible = j !== 1 || !S.friendClosed)); } } }

  /* 순시: 불빛 안에서 서성이면 */
  let seen = false; for (const p of patrols) if (stepPatrol(p, dt)) seen = true;
  const climbing = S.workKey === 'climb' && S.workT > 0;
  if (seen) { S.meter += dt / (climbing ? 0.7 : S.spd < 0.8 ? 1.6 : 7); if (S.meter > 0.2) say('순시 관리가 이쪽을 본다 — 서성이지 말고 움직이자!', 'loiter', 2.4); }
  else S.meter = Math.max(0, S.meter - dt * 0.6);
  if (S.meter >= 1) { S.meter = 0; if (climbing) return finish('wallCaught'); S.caught++; SFX.whistle(); S.px = START[0]; S.pz = START[1]; S.workT = 0; say('"관청에서 무얼 서성이느냐!" — 첫 문 밖으로 쫓겨났다', null, 3); }

  /* 가만히 서서: 책 · 시험 · 사신 · 벗 · 담 넘기 · 나루 · 절 · 호족 · 등불 */
  let job = null, need = 1, arg = null;
  SHELVES.forEach(([x, z], i) => { if (!job && !S.books[i] && dist(S.px, S.pz, x, z) < 1.8) { job = 'book'; need = 1.2; arg = i; } });
  if (!job && !S.exam && dist(S.px, S.pz, EXAM[0], EXAM[1]) < 1.8) { job = 'exam'; need = 2.2; }
  if (!job && !S.balhae && dist(S.px, S.pz, ENVOY[0] - 1.4, ENVOY[1]) < 2.2) { job = 'envoy'; need = 0.9; }
  if (!job && !S.friendClosed && dist(S.px, S.pz, FRIEND[0], FRIEND[1] + 1.2) < 2.0) { job = 'friend'; need = 1.4; }
  if (!job && dist(S.px, S.pz, CLIMB[0], CLIMB[1]) < 1.6) { job = 'climb'; need = 2.2; }
  if (!job && dist(S.px, S.pz, FERRY[0], FERRY[1]) < 2.2) { job = 'ferry'; need = 1.0; }
  if (!job && dist(S.px, S.pz, TEMPLE[0], TEMPLE[1]) < 2.4) { job = 'temple'; need = 1.0; }
  if (!job && dist(S.px, S.pz, HOJOK[0], HOJOK[1] - 1.4) < 2.2) { job = 'hojok'; need = 1.0; }
  if (!job && S.inHall && dist(S.px, S.pz, LANTERN[0], LANTERN[1] + 1) < 2.4) { job = 'lantern'; need = 0.8; }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  overBar($('work'), cam, S.px, 2.8, S.pz, job && S.workT > 0.05 ? S.workT / need : null);
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'book') { S.books[arg] = true; SFX.pick(); say(['「논어」 — 글에 뼈대가 선다', '「사기」 — 지난 나라들의 일을 안다', '「문선」 — 글이 매끄러워진다'][arg], null, 2.4); }
    if (job === 'exam') { if (S.books.filter(Boolean).length >= 2) { S.exam = true; S.rank = 2.5; pMesh.userData.body.material.color.set(ROBE[3]); pMesh.userData.skirt.material.color.set(ROBE[3]); SFX.done(); say('시험에 붙었다 — 옷 빛깔이 한 단계 짙어졌다. 그래도 자줏빛은 아니다', null, 3.4); } else { SFX.no(); say('아직 책을 덜 읽었다 — 서고에서 둘은 읽고 오자', null, 2.4); } }
    if (job === 'envoy') { S.balhae = true; SFX.done(); say('발해 사신 — "우리는 고구려를 이은 나라, 북쪽 바다 동쪽에 있소"', null, 3.4); }
    if (job === 'friend') return finish('friend');
    if (job === 'climb') { S.px = OVER[0]; S.pz = OVER[1]; SFX.pick(); say('담을 넘었다 — 등불로!', null, 2); }
    if (job === 'ferry') return finish('ferry');
    if (job === 'temple') return finish('temple');
    if (job === 'hojok') return finish('hojok');
    if (job === 'lantern') return finish('wall');
    hud(); }
  if (job === 'climb' && S.workT > 0.1) say('담을 넘는 중 — 순시 불빛에 들키면 벼슬을 잃는다', 'climb1', 2.4);
  if (job === 'friend' && S.workT > 0.1) say('진골 벗에게 글을 건넨다…', 'friend1', 2);
  place();

  /* 조임 */
  let nearest = 99; for (const p of patrols) nearest = Math.min(nearest, dist(p.x, p.z, S.px, S.pz));
  const late = clamp((S.k - 0.6) * 2.5, 0, 1), tension = clamp(Math.max(S.meter * 1.2, 1 - nearest / 9, late, climbing ? 0.7 : 0), 0, 1);
  S.beatT -= dt; if (tension > 0.12 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.36, tension); SFX.beat(0.08 + tension * 0.3); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${late > S.meter ? '120,30,60' : '200,20,20'},${Math.max(S.meter * 0.55, late * 0.35)})`;
}
function place() {
  pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving); pRing.position.set(S.px, 0.11, S.pz);
  scroll.position.set(S.px + Math.cos(S.pdir + 1.2) * 0.5, 1.1, S.pz + Math.sin(S.pdir + 1.2) * 0.5); scroll.visible = S.mode !== 'end';
  const play = S.mode === 'play';
  gateTags.forEach((d, i) => showTag(d, 44.4, 2.9, GZ[i] + 1.6, play && dist(S.px, S.pz, 40, GZ[i] + 1.6) < 6 ? `${GATE[i].i} ${gateOk(i) ? '<span class="ok">✔</span>' : '<span class="no">✘</span> 🟪=진골'}` : null));
  pathTags.forEach((d, i) => showTag(d, PATHS[i].at[0], 2.6, PATHS[i].at[1], play && S.refused && (i !== 1 || !S.friendClosed) && dist(S.px, S.pz, PATHS[i].at[0], PATHS[i].at[1]) < 14 ? PATHS[i].ic : null));
  showTag(tagEnvoy, ENVOY[0], 2.6, ENVOY[1], play && dist(S.px, S.pz, ENVOY[0], ENVOY[1]) < 5 ? (S.balhae ? '🌊🏯🙂' : '⬆🌊 🏯') : null);
  showTag(tagFriend, FRIEND[0], 2.6, FRIEND[1], play && S.friendClosed && dist(S.px, S.pz, FRIEND[0], FRIEND[1]) < 6 ? '📜❌' : null);
  friend.visible = !S.friendClosed;
}
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(40, 40, e), lerp(8, 36, e), lerp(16, START[1] + 24, e)); cam.lookAt(lerp(40, 40, e), lerp(3, 0, e), lerp(4, START[1] - 4, e)); if (cam.fov !== 44) { cam.fov = 44; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'end' || S.mode === 'fail') { v3.set(S.px + 6, 9, S.pz + 12); cam.position.lerp(v3, 0.04); cam.lookAt(S.px, 1.5, S.pz); }
  else followCam(cam, S, { W, H, map: { h: [96, 176], z: 10, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  edgeGoal($('goal'), cam, v3.set(LANTERN[0], 2.9, LANTERN[1]).clone(), S.mode === 'play', 0.8);
  overBar($('eye'), cam, S.px, 3.2, S.pz, S.mode === 'play' && S.meter > 0.02 ? S.meter : null);
}

/* ───── 미션(11-18): 지금 할 일 하나 — 무엇을·어떻게·어디서. 흔적 할 일(책·시험·사신)은 고르는 재미로 남겨 두고 미션에 넣지 않는다.
   길 다섯은 장면이 이미 빛·꼬리표로 보여 주니 마지막 미션에는 빛기둥을 두지 않는다. 미션은 S 를 읽기만 한다 ───── */
let misGates = 0;
const mis = missions(scene, cam, [
  { t: '첫 문(누런 문) 지나기', how: '문 앞 빛기둥에 서면 문지기가 옷 빛깔을 보고 문을 연다', done: () => misGates >= 1, at: () => [40, GZ[0] + 1.8], tag: '🚪 여기 서면 문이 열린다' },
  { t: '푸른 문 · 붉은 문 지나기', how: '순시 불빛 안에서는 멈추지 말고 걷기 — 서성이면 첫 문 밖으로 쫓겨난다', n: () => [Math.max(0, misGates - 1), 2], done: () => misGates >= 3, at: () => [40, GZ[Math.min(2, Math.max(1, misGates))] + 1.8], tag: '' },
  { t: '가장 안쪽 자줏빛 문 앞에 서기', how: '붉은 문을 지나 북쪽으로 — 문지기가 옷 빛깔을 본다', done: () => S.refused || misGates >= 4, at: () => [40, GZ[3] + 1.8], tag: '🟪 자줏빛 문' },
  { t: '다른 길 하나 골라 끝까지 가기', how: () => (S.friendClosed ? '빛나는 곳 넷' : '빛나는 곳 다섯') + ' 중 하나로 가서 가만히 서기 · 담은 넘은 뒤 등불까지', done: () => S.mode === 'end' },
], { allText: '🎉 길을 골랐다!' });
function misWatch() { if (S.mode !== 'play') return; let k = 0; for (let i = 0; i < 4; i++) if (S.pz < GZ[i] - 0.6) k = i + 1; if (k > misGates) misGates = k; }

resetRound(true); place();
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.bell(1); };
runLoop((dt) => { update(dt); misWatch(); mis.update(dt, S.mode === 'play' || (S.mode === 'end' && S.endT < 2.4)); }, view, () => renderer.render(scene, cam));
window.__scene = { S, patrols, gates, update, keys, ctl, gateOk,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { let stuck = 0; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz), ox = S.px, oz = S.pz; ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - ox, S.pz - oz) < 0.005) { if (++stuck > 45) break; } else stuck = 0; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  path: (ax, az, bx, bz) => findPath(ax, az, bx, bz),
  const: { GZ, START, HALL, LANTERN, SHELVES, EXAM, ENVOY, FRIEND, CLIMB, OVER, FERRY, TEMPLE, HOJOK } };
