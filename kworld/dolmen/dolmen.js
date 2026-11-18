/* 케이월드 · 고인돌 — 청동기 한 장면(S03, 2026-11-17). 본보기 = 그믐밤, 공통 부품 = ../scene/kit.js.
   목표는 하나(언덕 위 받침돌 둘)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 해가 지면 돌은 길에 남고 다음 날 이어서 끈다.
   끌기: 줄 곁에 서면 줄을 잡는다. 「영—차!」의 「차」에 맞춰 누르면 다 같이 당겨 돌이 앞으로 간다. 어긋나게 누르면 돌이 뒤로 밀리고 굴림대가 빠진다.
   굴림대: 돌 밑에 둘 이상 있어야 움직인다. 지나온 것은 주워서 돌 앞 길에 놓는다(아이 하나도 천천히 돕는다).
   좌표: x 동쪽(+), z 남쪽(+). 길은 z=24 를 따라 서쪽 채석장 → 동쪽 무덤 언덕. 마을은 남쪽. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, canvasTex, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, runLoop, loadArt, ART, art, artOwn, artInst, artGeo, artMat, scatter as strew , missions } from '../scene/kit.js?v=5';
await loadArt('people', 'nature', 'props', 'dolmen');   /* 블렌더로 만든 모델(사람·자연·소품 + 이 장면만의 묶음 dolmen.glb = tools/blender/make_dolmen.py) */

const W = 92, H = 58, BX = [4, 88], BZ = [8, 52];
const ROAD_Z = 24, S0 = 17, GOAL = 73, MOUND = [73, 24], DAY = 320;
const SLOPE0 = 62, SLOPE1 = 69;                  /* 비탈 */
const QUARRY = [6, 24], DIRT = [64, 33.5], KITCHEN = [44, 45], ALTAR = [82, 30], TOWER = [57, 37], CHAMBER = [73, 24];
const NROLL = 5, CREW0 = 8;
const SOLID = [[0, 8, 9, 40, 6, 'cliff'], [79.5, 27.5, 84.5, 32, 2.4, 'hut'], [36, 40, 52, 50, 2.6, 'village'], [55, 35, 59, 39, 4, 'tower']];
const groundH = (x, z) => { const d = dist(x, z, MOUND[0], MOUND[1]); return 2.2 * clamp((11.5 - d) / 7.5, 0, 1); };

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xf2c9a0, 80, 230], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x6a7a3a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff1d6, intensity: 2.1, box: [52, 38], far: 170, pos: [W / 2 - 34, 50, H / 2 + 30], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261119);
const sky = skyDome(scene, rnd, { top: 0x70a8e8, low: 0xffe2b8 });
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* 꾸밈(2026-11-17 블렌더 모델 — tools/blender/make_dolmen.py → dolmen.glb). 꾸밈에는 rndA 만 쓴다: 놀이 난수 rnd 는 예전 자리에서 예전과 같은 수만큼만 쓴다(자동 확인 숫자가 그대로) */
const rndA = rng(1119);
const put = (n, x, z, ry = 0, s = 1, y = 0, o) => { const m = art(n, { wall: 0xc8a070, c: 0x8aa848 }, o); m.position.set(x, y, z); m.rotation.y = ry; if (Array.isArray(s)) m.scale.set(s[0], s[1], s[2]); else m.scale.setScalar(s); scene.add(m); return m; };
const lay = (n, x, z, ry = 0, s = 1, y = 0) => { const m = put(n, x, z, ry, s, y); m.castShadow = false; return m; };   /* 땅에 깔린 것: 그림자를 드리우지 않는다 */
const face = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);   /* 모델 앞(+z)이 (tx, tz)를 보게 */

/* 땅 · 길 · 언덕 · 논 · 마을 */
flat(-60, -30, W + 60, H + 30, 0x7cbf58, 0);
flat(9, ROAD_Z - 2.2, 66, ROAD_Z + 2.2, 0xc8a878, 0.03);           /* 끌길 */
{ const P = []; for (let i = 0; i < 26; i++) { const w = 0.5 + rnd() * 0.8, d = 0.4 + rnd() * 0.5, x = 10 + rnd() * 55, z = ROAD_Z - 2 + rnd() * 4; P.push([x, -0.032, z, [w * 0.8, 1, d * 0.9], rndA() * 6.28]); } artInst(scene, 'dpatch', P, { c: 0xb39466 }, { shadow: false }); }   /* 밟혀 다진 흙 얼룩(예전 널조각 자리) */
lay('mound', MOUND[0], MOUND[1]);   /* 무덤 언덕(groundH 와 같은 꼴) + 서쪽 비탈 끌길 */
{ const K = ['paddy_gold', 'paddy_cut', 'paddy_gold', 'paddy_gold', 'paddy_gold', 'paddy_cut', 'paddy_cut', 'paddy_gold', 'paddy_green'], L = {}; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) (L[K[r * 3 + c]] = L[K[r * 3 + c]] || []).push([11 + c * 7.2 + 3.3, 0, 36 + r * 5.2 + 2.3, 1, 0]); for (const k in L) artInst(scene, k, L[k], {}, { shadow: false }); }   /* 논 아홉: 익은 논 · 벤 논 · 늦은 논 */
/* 채석 벼랑(SOLID cliff 네모에 맞춘 한 덩이 — 덮개돌을 떼어 낸 자리가 길 끝에 있다) · 뒤로 이어진 벼랑 */
scene.add(art('quarry')); put('quarry_back', 0, 0, 0, 1, 0, { shadow: false });
{ const P = []; for (let k = 0; k < 6; k++) { const r = 0.6 + rnd() * 0.5, x = 10 + rnd() * 2; P.push([x, 0, 12 + k * 4.5, r * 0.95, rndA() * 6.28]); } P.push([56.8, 0, 15.6, [0.8, 0.45, 0.8], 1], [87.5, 0, 18, [1, 0.5, 1], 2], [62, 0, 44, [0.9, 0.45, 0.9], 3]); artInst(scene, 'rock_b', P); }   /* 채석장 앞 돌 여섯(예전 자리) + 들판의 납작한 돌 */
put('rope_coil', 10.6, 19.2, 0.8); put('menhir', 9.8, 29.4, 0.3, 0.55);
/* 목책 마을: 도랑 · 목책(북쪽 어귀) · 둥근 집 둘과 긴 집 · 다락 곳간 · 화덕 · 토기 · 볏단 걸이 · 솟대 */
lay('dpatch', 44, 45, 0.2, [8.0, 1, 5.2], -0.03);
lay('ditch', 44, 45);
{ const m = artOwn('palisade_ring'); m.position.set(44, 0, 45); group([35, 39, 53, 51], [m]); }
for (const [x, z, n, ry, sc] of [[40.5, 44, 'bhut', Math.PI - 0.5, 0.85], [48, 44, 'bhut_long', Math.PI + 0.25, 0.8], [44, 48, 'bhut', Math.PI + 0.35, 0.8]]) { const m = artOwn(n, { wall: 0xc8a070 }); m.position.set(x, 0, z); m.rotation.y = ry; m.scale.setScalar(sc); group([x - 2, z - 2, x + 2, z + 2], [m]); }
put('granary_raised', 49.4, 48.3, -0.4, 0.74); put('hearth', 44.2, 42.1, 0.3, 0.9); put('pots_set', 40.3, 47.7, 0.5, 0.9); put('drying_rack', 47.6, 41.2, 0.1, 0.9);
artInst(scene, 'sotdae', [[39.3, 0, 38.7, 1, 0.3], [47.5, 0, 38.4, 0.9, -0.2], [86.5, 0, 26.5, 0.95, 2.4]]);
const tower = put('watchtower', TOWER[0], TOWER[1]);   /* 망루(불 바구니에서 연기가 오른다) */
const smokeGeo = artGeo('dpuff'), smoke = []; for (let k = 0; k < 8; k++) { const s = new THREE.Mesh(smokeGeo, new THREE.MeshStandardMaterial({ color: 0x5a5a60, vertexColors: true, transparent: true, opacity: 0, flatShading: true, depthWrite: false })); s.userData.k = k / 8; scene.add(s); smoke.push(s); }
/* 족장 집 · 제단(껴묻거리) */
{ const m = artOwn('chief_house', { wall: 0xc8a070 }); m.position.set(82, 0, 29.8); group([79.5, 27.5, 84.5, 32], [m]); }
put('pots_set', 86.2, 31.6, -0.6, 0.8);
const goods = new THREE.Group(); goods.add(art('altar'), at(art('bronze_set'), 0, 0.76, 0)); goods.children[1].scale.setScalar(0.85); goods.position.set(ALTAR[0], 0, ALTAR[1] + 2.9); scene.add(goods);
const goodsGlow = glowSprite(scene, 'rgba(255,230,140,.9)', 'rgba(255,190,60,0)', 2.6); goodsGlow.position.set(ALTAR[0], 1.3, ALTAR[1] + 2.9);
/* 흙더미 · 새참 */
const dirt = put('dirt_pile', DIRT[0], DIRT[1], 0.2, 0.9);
const meal = new THREE.Group(); meal.add(art('meal_bowl')); meal.position.set(45.2, 0.5, 35.4); scene.add(meal); /* 목책 밖 어귀에 내놓은 새참(밥 함지) */
put('meal_table', 45.2, 35.4);
/* 둘레: 조밭 · 선돌 · 나무 · 덤불 · 풀꽃 · 땅 얼룩 · 먼 산 */
artInst(scene, 'field_dry', [[27.5, 0, 12.6, 1, 0], [35.3, 0, 12.6, 1, 0], [40, 0, 55.4, 1, 0], [48, 0, 55.4, 1, 0]], { c: 0x8aa848 }, { shadow: false });
put('menhir', 53, 14.6, 0.4); put('menhir', 55.4, 13.2, 2.1, 0.8);
{ const near = [], far = [], isFree = (x, z) => !(inRect(x, z, [24, 9.5, 39, 15.8]) || inRect(x, z, [51, 11.5, 57.5, 16.5]) || Math.abs(z - ROAD_Z) < 5 || dist(x, z, MOUND[0], MOUND[1]) < 13);
  const T = ['tree_a', 'pine_a', 'tree_b'];
  for (let t = 0; t < 400 && near.length < 30; t++) { const x = 14 + rndA() * 76, z = 1 + rndA() * 16.5; if (!isFree(x, z) || near.some((p) => dist(x, z, p[0], p[2]) < 3.2)) continue; near.push([x, 0, z, 0.85 + rndA() * 0.45, rndA() * 6.28]); }
  for (let t = 0; t < 400 && far.length < 34; t++) { const a = rndA(), x = a < 0.6 ? -8 + rndA() * 112 : (a < 0.8 ? 90 + rndA() * 14 : 10 + rndA() * 80), z = a < 0.6 ? -14 + rndA() * 14 : (a < 0.8 ? -10 + rndA() * 72 : 59 + rndA() * 10); if (far.some((p) => dist(x, z, p[0], p[2]) < 4) || (x < 16 && z > -2)) continue; far.push([x, 0, z, 1 + rndA() * 0.6, rndA() * 6.28]); }
  T.forEach((n, k) => { artInst(scene, n, near.filter((_, i) => i % 3 === k), { leaf: 0x5a9a48 }); artInst(scene, n, far.filter((_, i) => i % 3 === k), { leaf: 0x5a9a48 }, { shadow: false }); });
  artInst(scene, 'bush', [[60.5, 0, 12.5, 1, 0.3], [20, 0, 18, 0.9, 2], [88, 0, 34, 1.1, 1], [58.5, 0, 46, 1, 4], [33.5, 0, 53, 0.9, 1.4], [86, 0, 44, 1, 2.6], [70, 0, 41, 0.9, 0.8]], { leaf: 0x5a9a48 });
  const busy = (x, z) => Math.abs(z - ROAD_Z) < 2.8 || inRect(x, z, [10.4, 35.6, 32.6, 51.4]) || inRect(x, z, [34.5, 38, 53.5, 52]) || SOLID.some((r) => inRect(x, z, r, 0.6)) || inRect(x, z, [24, 9.5, 39, 15.8]) || dist(x, z, DIRT[0], DIRT[1]) < 3.4 || dist(x, z, 45.2, 35.4) < 2.4 || dist(x, z, MOUND[0], MOUND[1]) < 5 || dist(x, z, ALTAR[0], ALTAR[1] + 2.9) < 2;
  strew(scene, rndA, { area: [9, 8, 90, 54], n: 150, names: ['grass_a', 'grass_b', 'flower_y'], avoid: busy, scale: [0.8, 1.3], y: (x, z) => groundH(x, z), shadow: false });
  const P = [[], []], put2 = []; for (let t = 0; t < 600 && put2.length < 46; t++) { const x = 6 + rndA() * 84, z = 4 + rndA() * 52, r = 1.0 + rndA() * 1.2; if (busy(x, z) || dist(x, z, MOUND[0], MOUND[1]) < 12 || put2.some((p) => dist(x, z, p[0], p[1]) < r + p[2])) continue; put2.push([x, z, r]); P[0].push([x, -0.058 + (put2.length % 2) * 0.012, z, [r, 1, r * (0.6 + rndA() * 0.5)], rndA() * 6.28]); }
  artInst(scene, 'dpatch', P[0], { c: 0x68a648 }, { shadow: false });
  artInst(scene, 'dhill', [[-30, 0, -40, [40, 12, 18], 0.2], [20, 0, -48, [36, 14, 16], 1], [70, 0, -44, [40, 11, 16], 2], [150, 0, -30, [26, 13, 30], 0.6], [156, 0, 30, [20, 9, 30], 1.4], [148, 0, 84, [30, 8, 20], 2.2], [40, 0, 96, [44, 9, 18], 0.4], [-34, 0, 84, [30, 8, 20], 3]], { c: 0x6f9c4c }, { shadow: false }); }
/* 받침돌 둘 · 흙 비탈 · 덮개돌 · 굴림대 */
const supH = 1.7;
const supports = put('supports', MOUND[0], MOUND[1], 0, 1, 2.2);   /* 받침돌 둘(z ±1.5) */
const ramp = art('ramp'); ramp.position.set(MOUND[0] - 1.2, 2.2, MOUND[1]); ramp.scale.y = 0.001; scene.add(ramp);
const capRopes = art('cap_ropes'), capstone = new THREE.Group(); capstone.add(art('capstone'), capRopes); scene.add(capstone);   /* 납작한 너럭바위 + 묶은 줄(앞 매듭에 끄는 줄 · 남쪽 매듭에 잡는 줄) */
const rollGeo = artGeo('roller');   /* 껍질이 군데군데 벗겨진 통나무 — 구르는 것이 보인다 */
const rollers = Array.from({ length: NROLL }, () => { const m = new THREE.Mesh(rollGeo, artMat); m.castShadow = m.receiveShadow = true; scene.add(m); const glow = glowSprite(scene, 'rgba(255,230,140,.9)', 'rgba(255,200,80,0)', 2.6); glow.visible = false; return { m, glow, x: 0, z: ROAD_Z, side: false }; });
const ropeGeo = artGeo('rope_seg').clone(); ropeGeo.translate(-0.5, 0, 0);
const ropeSegs = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(ropeGeo, artMat); scene.add(m); return m; });
const tailSegs = Array.from({ length: 3 }, () => { const m = new THREE.Mesh(ropeGeo, artMat); scene.add(m); return m; });   /* 남쪽 매듭에서 늘어진 잡는 줄(빛 기둥 자리로) */
const goalPos = new THREE.Vector3(MOUND[0], 3.4, MOUND[1]);
/* 「무엇을 어떻게」 보이기(11-17 준호 「어떻게 하라는 건지 모르겠다」): 줄 잡는 자리 빛 기둥 · 주울 굴림대 빛 · 내려놓을 자리 고리 · 머리 위 그림 */
const pillarTex = canvasTex(8, 128, (g) => { const r = g.createLinearGradient(0, 0, 0, 128); r.addColorStop(0, 'rgba(255,230,140,0)'); r.addColorStop(1, 'rgba(255,220,120,.85)'); g.fillStyle = r; g.fillRect(0, 0, 8, 128); });
const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 9, 18, 1, true), new THREE.MeshBasicMaterial({ map: pillarTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); pillar.visible = false; scene.add(pillar);
const dropRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.5, 32), new THREE.MeshBasicMaterial({ color: 0xffcf4d, transparent: true, opacity: 0.8, depthWrite: false })); dropRing.rotation.x = -Math.PI / 2; dropRing.visible = false; scene.add(dropRing);
const tagEls = {}; function tagEl(k, html) { if (!tagEls[k]) { const e = document.createElement('div'); e.className = 'tag'; e.innerHTML = html; document.body.appendChild(e); tagEls[k] = e; } return tagEls[k]; }
const goalGlow = glowSprite(scene, 'rgba(255,236,170,.75)', 'rgba(255,200,90,0)', 7); goalGlow.position.copy(goalPos);

/* 사람 */
const SKIN = 0xf0c48e;
const pMesh = person({ shirt: 0xc8b08a, pants: 0x7a5a3a, hat: 'top', skin: SKIN });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const carryM = new THREE.Group(); carryM.add(art('basket_earth'), at(art('meal_bowl'), 0, 0.02, 0), at(art('bronze_set'), 0, 0.02, 0)); carryM.children[1].scale.setScalar(0.62); carryM.children[2].scale.setScalar(0.62); carryM.visible = false; scene.add(carryM);   /* 머리에 인 것: 흙 바구니 · 밥 함지 · 청동 검과 거울 */
const haulers = Array.from({ length: CREW0 }, (_, i) => ({ i, m: person({ shirt: [0xb89a70, 0xa88a60, 0xc0a07a, 0x9a8a68][i % 4], pants: 0x6a5034, hat: 'top', skin: SKIN }), x: 0, z: 0, away: false, hurt: false, ph: rnd() * 6 }));
const helper = { m: person({ shirt: 0xd0b890, pants: 0x7a6040, hat: 'top', skin: SKIN }), x: 30, z: 27, carry: -1, t: 0 }; helper.m.scale.setScalar(0.78);
const chief = person({ shirt: 0x8a3a2a, pants: 0x4a2a1a, hat: 'hair', mood: 'stern', skin: SKIN }); chief.add(art('chief_gear'));   /* 깃 머리띠 · 가슴의 청동 거울 · 허리의 청동 검 · 털 망토 · 방울 지팡이 */
chief.position.set(MOUND[0] + 4.2, groundH(MOUND[0] + 4.2, MOUND[1] - 1.5), MOUND[1] - 1.5); chief.rotation.y = -Math.PI / 2;
/* 구경하는 마을 사람(움직이지 않는다 — 놀이와 상관없음) */
for (const [x, z, shirt, pants, hat, chima, sc, tx, tz] of [[61.6, 37.6, 0xd8c8a8, 0x8a5a3a, 'bun', true, 1, MOUND[0], MOUND[1]], [63.4, 38.4, 0xc8a070, 0x6a5034, 'braid', false, 0.72, MOUND[0], MOUND[1]], [42.4, 41.9, 0xd8c8a8, 0x7a5a3a, 'bun', true, 1, 44.2, 42.1]]) { const o = person({ shirt, pants, hat, chima, skin: SKIN }); o.scale.setScalar(sc); o.position.set(x, groundH(x, z), z); o.rotation.y = face(x, z, tx, tz); }
const guardsLeft = [];

/* ───── 소리 ───── */
const SFX = {
  yeong: () => { tone(220, 240, 0.32, 'sawtooth', 0.07); tone(330, 350, 0.32, 'triangle', 0.05); },
  cha: () => { tone(300, 260, 0.2, 'sawtooth', 0.11); noise(0.08, 0.2, 500); },
  pull: () => { noise(0.4, 0.35, 180); tone(70, 50, 0.4, 'sine', 0.2); },
  slide: () => { noise(0.5, 0.4, 140); tone(120, 60, 0.5, 'sawtooth', 0.08); },
  pop: () => { tone(400, 200, 0.15, 'square', 0.06); noise(0.15, 0.2, 700, 0.05); },
  thunk: () => { noise(0.1, 0.35, 260); tone(150, 120, 0.12, 'sine', 0.12); },
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  done: () => { tone(523, 523, 0.14, 'triangle', 0.16); tone(784, 784, 0.22, 'triangle', 0.16, 0.14); },
  horn: () => { tone(180, 190, 1.2, 'sawtooth', 0.09); tone(270, 280, 1.2, 'sine', 0.06); },
  shout: () => { tone(260, 200, 0.3, 'sawtooth', 0.1); },
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  win: () => { [392, 523, 659, 784].forEach((f, i) => tone(f, f, 0.6, 'triangle', 0.16, i * 0.18)); },
  dusk: () => { tone(330, 220, 1.2, 'sine', 0.14); tone(262, 175, 1.4, 'sine', 0.1, 0.4); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', day: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, sun: 0, px: 24, pz: 27.5, pdir: -Math.PI / 2, moving: false, running: false, said: {}, sayT: 0,
  s: S0, sv: 0, holding: false, bPh: 0.3, pressed: 0, lastOk: -9, pulls: 0, misses: 0, slips: 0, stuck: 0, hurt: 0, tired: false, meal: false, mealCarry: false, ramp: 0, earth: false, goods: 'altar', carry: -1,
  away: 0, smokeT: -1, workT: 0, workKey: '', beatT: 0, stepT: 0, endT: 0, shown: false, introT: 0, chiefSaid: 0, crewMax: CREW0, tut: 0 };
let mis = null;   /* 미션 카드(아래에서 만든다) */
const TUT = 3;   /* 처음 세 박자는 따라 하기: 박자가 느리고 폭이 넓고, 맞으면 돌이 크게 움직이고, 어긋나도 굴림대가 안 빠진다 */
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 줄 곁에서 「차!」에 맞춰 「당기기」 · 지나온 굴림대는 주워서 돌 앞에 · 가만히 서면 담고 나른다 · 「시점」 ⟲⟳';

const onSlope = () => S.s >= SLOPE0 && S.s < GOAL;
const crew = () => Math.max(3, S.crewMax - S.hurt - S.away);
const period = () => (onSlope() ? 1.5 : 2.0) * lerp(1, 0.84, clamp(S.sun, 0, 1)) * (S.tired ? 0.92 : 1) * (S.tut < TUT ? 1.2 : 1);
const windowW = () => clamp(0.22 + (S.meal ? 0.12 : 0) - (S.tired ? 0.07 : 0) + (S.tut < TUT ? 0.1 : 0), 0.1, 0.45);
const pickable = (r) => r !== rollers[helper.carry] && r !== rollers[S.carry] && (r.side || r.x < S.s - 2.8);
const grab = () => [S.s + 0.4, ROAD_Z + 2.8];   /* 돌 바로 옆 — 굴림대를 뒤에서 앞으로 옮기기 쉽게 */
const frontSpot = (r) => { let x = S.s + 4.4; while (rollers.some((o) => o !== r && !o.side && !loose(o) && Math.abs(o.x - x) < 0.8) && x > S.s + 1.6) x -= 0.5; return x; }; /* 앞쪽 끝부터 깐다 */
const loose = (r) => r === rollers[S.carry] || r === rollers[helper.carry];
const isUnder = (r) => !r.side && !loose(r) && r.x > S.s - 2.8 && r.x < S.s + 4.8; /* 돌 밑 + 앞에 깐 것(놓을 수 있는 곳은 다 센다 — 외통수 없음) */
const under = () => rollers.filter(isUnder).length;

function hud() {
  const c = crew(), h = $('hCrew'); h.textContent = '🙋 끄는 사람 ' + c + (S.hurt ? ` · 🤕 ${S.hurt}` : '') + (S.away ? ` · 🏃 ${S.away}` : ''); h.className = 'pill' + (S.hurt ? ' hurt' : '');
  const u = under(), r = $('hRoll'); r.textContent = '🪵 돌 밑 굴림대 ' + u; r.className = 'pill' + (u < 2 ? ' low' : '');
  const hc = $('hCarry'); const cc = S.carry >= 0 ? '🪵 굴림대' : S.earth ? '🧺 흙' : S.mealCarry ? '🍚 새참' : S.goods === 'carry' ? '🗡 껴묻거리' : ''; hc.style.display = cc ? '' : 'none'; hc.textContent = cc + ' 들었음';
  $('tRamp').className = S.ramp >= 4 ? 'on' : ''; $('tRamp').textContent = '⛰ 받침돌 사이 흙 비탈 ' + S.ramp + '/4';
  $('tMeal').className = S.meal ? 'on' : ''; $('tGoods').className = S.goods === 'in' ? 'on' : '';
  carryM.visible = S.earth || S.mealCarry || S.goods === 'carry'; carryM.children[0].visible = S.earth; carryM.children[1].visible = !S.earth && S.mealCarry; carryM.children[2].visible = !S.earth && !S.mealCarry && S.goods === 'carry';
}
function placeRollersAround(s) { rollers.forEach((r, i) => { r.x = s - 2.4 + i * 2.2; r.z = ROAD_Z; r.side = false; }); }
function resetDay(keep) {
  if (!keep) { if (mis) mis.reset(); misHeld = misLaid = false; S.s = S0; placeRollersAround(S0); S.hurt = 0; S.ramp = 0; S.goods = 'altar'; S.day = 1; S.tired = false; }
  Object.assign(S, { t: 0, sun: 0, sv: 0, holding: false, bPh: 0.3, pressed: 0, lastOk: -9, pulls: 0, misses: 0, slips: 0, stuck: 0, meal: false, mealCarry: false, earth: false, carry: -1, away: 0, smokeT: -1, workT: 0, endT: 0, shown: false, chiefSaid: 0 });
  if (S.goods === 'carry') S.goods = 'altar';
  S.px = S.s + 6; S.pz = ROAD_Z + 3.5; S.pdir = -Math.PI / 2;
  haulers.forEach((h) => { h.away = false; h.hurt = h.i >= CREW0 - S.hurt; h.m.visible = !h.hurt; });
  rollers.forEach((r) => (r.m.visible = true)); capRopes.visible = true;
  helper.carry = -1; helper.x = S.s - 4; helper.z = ROAD_Z + 3; helper.t = 0;
  meal.visible = true; goods.visible = S.goods === 'altar'; goodsGlow.visible = S.goods === 'altar'; $('fade').style.opacity = 0;
  lightFor(0); hud();
}

/* ───── 당기기 ───── */
function press() {
  if (S.mode !== 'play') return;
  if (!S.holding) { SFX.shout(); say(S.carry >= 0 || S.earth || S.mealCarry ? '먼저 들고 있는 것을 내려놓자' : '돌 옆 줄 끝(남쪽)에 서야 당긴다', 'nohold', 2); return; }
  const P = period(), off = Math.min(S.bPh, 1 - S.bPh) * P;   /* 「차」(위상 0) 와의 거리(초) */
  if (S.pressed) return miss('또 당겼다 — 한 박자에 한 번!', true);
  S.pressed = 1;
  if (off <= windowW()) {
    if (under() < 2) { S.stuck++; SFX.thunk(); say('굴림대가 모자라 꿈쩍 않는다 — 지나온 굴림대를 돌 앞에!', null, 2.4); hud(); return; }
    let step = 0.24 * crew() * (onSlope() ? 0.62 : 1) * (S.tut < TUT ? 2.2 : 1);
    if (S.tut < TUT) { S.tut++; say(S.tut < TUT ? `맞았다! 돌이 크게 움직인다 — 따라 하기 ${S.tut}/${TUT}` : '좋다 — 이제 박자마다 한 번씩. 흰 점이 노란 칸에 올 때!', null, 2.6); }
    if (S.s >= SLOPE1 && S.ramp < 4) step *= 0.35;   /* 흙 비탈이 없으면 지레로 조금씩 */
    S.sv += step; S.pulls++; S.lastOk = S.t; SFX.pull(); $('chant').className = 'hit'; ring(S.s, ROAD_Z, 3, 0xffcf4d);
    if (S.s >= SLOPE1 && S.ramp < 4) say('받침돌 사이가 비어 지레로 조금씩 — 흙 비탈을 쌓으면 쉽다', 'noramp', 3);
  } else if (S.tut < TUT) miss(S.bPh < 0.5 ? '조금 늦었다 — 흰 점이 노란 칸 한가운데 올 때 「차!」' : '조금 일렀다 — 흰 점이 노란 칸 한가운데 올 때 「차!」', true);
  else miss('박자가 어긋났다 — 돌이 뒤로 밀린다!');
}
function miss(text, soft) {
  if (soft && S.tut < TUT) { S.sv -= 0.12; SFX.thunk(); say(text, null, 2.2); ring(S.s, ROAD_Z, 2, 0xff9a6a); return; }
  S.misses++; S.slips++; S.sv -= onSlope() ? 1.2 : 0.6; SFX.slide(); say(text, null, 1.8); ring(S.s, ROAD_Z, 3, 0xff6a4a);
  const u = rollers.filter(isUnder); if (u.length) { const r = u[Math.floor(rnd() * u.length)]; r.side = true; r.z = ROAD_Z + (rnd() < 0.5 ? -2.8 : 2.8); SFX.pop(); }
  if (S.slips >= 4) { S.slips = 0; S.hurt = Math.min(S.hurt + 1, CREW0 - 3); const h = haulers.filter((h) => !h.hurt).pop(); if (h) { h.hurt = true; h.m.visible = false; } say('한 사람이 다쳐 줄에서 빠졌다', null, 2.4); }
  hud();
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) press(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); press(); });
canvas.addEventListener('pointerdown', () => { if (S.mode === 'intro') S.introT = 99; });

/* ───── 끝 ───── */
function finish(win) { S.mode = win ? 'win' : 'dusk'; S.endT = 0; S.endWin = win; S.holding = false; $('beat').style.display = 'none'; SFX[win ? 'win' : 'dusk'](); say(win ? '덮개돌이 받침돌 위에 앉았다!' : '해가 졌다…', null, 2.8); }
function endScreen() {
  const win = S.endWin, marks = `<div class="marks"><span class="${win ? 'ok' : ''}">🪨 ${win ? '돌을 올렸다' : '돌은 길에'}</span><span class="${S.hurt ? '' : 'ok'}">🤕 다친 사람 ${S.hurt}</span><span class="${S.meal ? 'ok' : ''}">🍚 ${S.meal ? '새참을 날랐다' : '새참 없음'}</span><span class="${S.goods === 'in' ? 'ok' : ''}">🗡 ${S.goods === 'in' ? '껴묻거리를 넣었다' : '껴묻거리 없음'}</span></div>`;
  if (win) {
    overlay(`<h1>고인돌</h1><p>노을 속에 큰 돌이 섰다. 사람들은 언덕 아래에, 족장은 돌 곁에 섰다.</p><p>${S.goods === 'in' ? '무덤방에는 청동 검과 거울이 들어갔다 — 족장 집안의 무덤이다.' : '무덤방은 비어 있다. 누구의 무덤인지 아직 드러나지 않았다.'}${S.ramp >= 4 ? ' 쌓았던 흙 비탈은 다시 파냈다.' : ''}</p>${marks}
      <p class="keys">이 큰 돌 아래 묻히는 사람은 하나다. 너는 끌었다.</p>
      <div class="fact">📜 <b>고인돌</b> — 힘 있는 사람의 무덤이다. 수많은 사람을 부릴 수 있어야 세울 수 있었다.<br>📜 <b>다스리는 사람</b> — 농사로 남는 것이 생기자 더 가진 사람과 덜 가진 사람이 나뉘었다.<br>📜 <b>청동은 귀했다</b> — 청동 검과 거울은 다스리는 사람의 것이었고, 농사는 여전히 돌과 나무 도구로 지었다.<br>📜 <b>벼농사와 싸움</b> — 벼농사가 시작됐고, 마을은 목책과 도랑을 둘러 서로를 막았다.</div>`,
      '한 번 더', () => { resetDay(false); S.mode = 'play'; });
  } else {
    const left = Math.max(0, GOAL - S.s);
    overlay(`<h1>해가 졌다</h1><p>돌은 길 위에 남았다. 언덕까지 아직 <b>${left.toFixed(0)}걸음</b>.</p>${marks}
      <p>다음 날 — 사람들이 지쳐 <b>박자가 빡빡하다.</b>${S.hurt ? ` 다친 사람 ${S.hurt}은 줄에 못 선다.` : ''} 돌은 어제 멈춘 자리에서 다시 끈다.</p>
      <p class="keys">${S.day + 1}번째 날 · 받침돌은 아직 언덕에서 기다린다.</p>`,
      '다음 날 줄을 잡는다', () => { S.day++; S.tired = true; resetDay(true); S.mode = 'play'; say('지친 몸 — 박자 폭이 좁다. 새참이 있으면 낫다', null, 3); });
  }
}

/* ───── 해 · 빛 ───── */
const SKY = [[0, 0x70a8e8, 0xffe2b8, 0xfff1d6, 2.1, 1.3], [0.55, 0x6f9ee0, 0xffd29a, 0xffe0b0, 1.9, 1.2], [0.78, 0x6a6aa8, 0xff9a5a, 0xffa060, 1.6, 0.95], [0.92, 0x3a3a78, 0xd8505a, 0xff7040, 0.9, 0.6], [1.0, 0x2a2a5a, 0xc0506a, 0xff8050, 0.7, 0.55], [1.2, 0x0a1028, 0x1c2350, 0x6070b0, 0.2, 0.3]];
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); let lastSky = -1;
function lightFor(k) { let a = SKY[0], b = SKY[SKY.length - 1]; for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = clamp((k - a[0]) / ((b[0] - a[0]) || 1), 0, 1); cT.set(a[1]).lerp(tc.set(b[1]), t); cL.set(a[2]).lerp(tc.set(b[2]), t);
  if (Math.abs(k - lastSky) > 0.004) { sky.paint(cT, cL); lastSky = k; } scene.fog.color.copy(cL); sun.color.set(a[3]).lerp(tc.set(b[3]), t); sun.intensity = lerp(a[4], b[4], t); hemi.intensity = lerp(a[5], b[5], t);
  const az = lerp(2.3, 3.0, clamp(k, 0, 1)), el = lerp(1.0, 0.14, clamp(k, 0, 1)); sun.position.set(W / 2 + Math.cos(az) * Math.cos(el) * 70, Math.sin(el) * 70 + 4, H / 2 + Math.sin(az) * Math.cos(el) * 70); }

/* ───── 한 걸음 ───── */
function placeStone() { const y = S.mode === 'win' ? capstone.position.y : groundH(S.s, ROAD_Z) + 1.15 + Math.max(0, S.ramp >= 4 && S.s > SLOPE1 ? (S.s - SLOPE1) / (GOAL - SLOPE1) * supH * 0.9 : 0); capstone.position.set(S.s, y, ROAD_Z); }
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  goalGlow.material.opacity = 0.45 + Math.sin(S.t * 2.4) * 0.2; goodsGlow.material.opacity = 0.6 + Math.sin(S.t * 3) * 0.2;
  for (const s of smoke) { const k = (s.userData.k + S.t * 0.12) % 1, on = S.smokeT >= 0 ? 1 : 0; s.position.set(TOWER[0] + Math.sin(k * 6) * 0.5 * k, 6 + k * 12, TOWER[1]); s.scale.setScalar(0.6 + k * 2); s.material.opacity = lerp(s.material.opacity, on * (1 - k) * 0.7, dt * 2); }
  if (S.mode === 'title') { placeStone(); placeAll(dt); return; }
  if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.2) { S.mode = 'play'; say('줄을 잡고 「차!」에 맞춰 — 받침돌 위까지', null, 3); } placeStone(); placeAll(dt); return; }
  if (S.mode === 'win' || S.mode === 'dusk') {
    S.endT += dt;
    if (S.mode === 'win') { const k = clamp(S.endT / 2.4, 0, 1); capstone.position.set(lerp(capstone.position.x, GOAL, dt * 2), lerp(capstone.position.y, 2.2 + supH + 0.55, dt * 1.6), ROAD_Z); ramp.scale.y = Math.max(0.001, (S.ramp / 4) * 1.6 * (1 - clamp((S.endT - 2.6) / 2, 0, 1))); S.sun = Math.min(0.95, S.sun + dt * 0.05); lightFor(S.sun); }
    else { S.sun = Math.min(1.1, S.sun + dt * 0.04); lightFor(S.sun); }
    placeAll(dt); if (S.mode === 'win' && S.endT > 2.5) { rollers.forEach((r) => (r.m.visible = false)); capRopes.visible = false; } /* 굴림대와 묶은 줄은 치운다 */
    if (S.endT > 5.5 && !S.shown) { S.shown = true; endScreen(); }
    return;
  }
  if (S.mode !== 'play') return;

  /* 해 · 족장 */
  S.sun = S.t / DAY; $('sun').querySelector('i').style.width = clamp(S.sun, 0, 1) * 100 + '%'; lightFor(S.sun);
  const lines = [[0.45, '"해가 기운다 — 더 빨리!"'], [0.7, '"서둘러라! 해 지기 전에 올려라!"'], [0.88, '"다 같이 — 힘껏!"']];
  if (S.chiefSaid < lines.length && S.sun > lines[S.chiefSaid][0]) { say('족장: ' + lines[S.chiefSaid][1], null, 2.6); SFX.shout(); S.chiefSaid++; }
  if (S.sun >= 1) return finish(false);
  /* 이웃 마을 연기: 끄는 사람 셋이 목책으로 */
  for (const k of [0.4, 0.7]) if (S.t > k * DAY && S.t - dt <= k * DAY) { S.smokeT = 0; S.away = 3; SFX.horn(); say('망루에 연기! 이웃 마을이다 — 셋이 목책으로 달려간다', null, 3); hud(); }
  if (S.smokeT >= 0) { S.smokeT += dt; if (S.smokeT > 35) { S.smokeT = -1; S.away = 0; say('목책에 갔던 사람들이 돌아왔다', null, 2); hud(); } }

  /* 나 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 4.7 : 3.0) * (back ? 0.6 : 1) * (S.carry >= 0 || S.earth ? 0.8 : 1);
    let [nx, nz] = collideRects(SOLID.concat([[S.s - 2.4, ROAD_Z - 1.8, S.s + 2.4, ROAD_Z + 1.8]]), S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); if (S.view !== 2) S.pdir = Math.atan2(iz, ix);
    S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; noise(0.05, S.running ? 0.12 : 0.05, 300); } }
  const [gx, gz] = grab(), hands = S.carry < 0 && !S.earth && !S.mealCarry && S.goods !== 'carry';
  S.holding = hands && dist(S.px, S.pz, gx, gz) < 1.8;
  if (S.holding) { S.pdir = Math.PI; say(ctl.isTouch ? '줄을 잡았다 — 「차!」에 맞춰 「당기기」' : '줄을 잡았다 — 「차!」에 맞춰 스페이스', 'hold1', 3); }
  else if (dist(S.px, S.pz, gx, gz) < 6 && hands) say('줄 끝 — 곁에 서면 잡는다', 'ropenear', 2.4);

  /* 박자: 줄을 잡았든 아니든 사람들은 「영—차」 한다 */
  const P = period(), ph0 = S.bPh; S.bPh = (S.bPh + dt / P) % 1;
  if (ph0 < 0.5 && S.bPh >= 0.5) { SFX.yeong(); $('chant').textContent = '영—'; $('chant').className = ''; }
  if (S.bPh < ph0) { SFX.cha(); $('chant').textContent = '차!'; haulers.forEach((h) => (h.ph = 0)); }
  if (ph0 < 0.25 && S.bPh >= 0.25) { if (S.holding && !S.pressed && onSlope() && S.t - S.lastOk > P * 1.2) { S.sv -= 0.3; say('비탈에서 손을 놓으면 돌이 미끄러진다!', 'slopeidle', 2.4); } S.pressed = 0; }   /* 다음 박자 준비 */
  const bt = $('beat'); bt.style.display = S.holding ? 'flex' : 'none';
  const inWin = Math.min(S.bPh, 1 - S.bPh) * P <= windowW(); bt.querySelector('.win').className = 'win' + (inWin ? ' in' : '');
  const tu = $('tut'); tu.style.display = S.holding && S.tut < TUT ? 'block' : 'none'; if (S.holding && S.tut < TUT) tu.textContent = `따라 하기 ${S.tut + 1}/${TUT} — 흰 점이 노란 칸에 들어올 때 ${ctl.isTouch ? '「당기기」' : '스페이스'}`;
  if (S.holding) { const lane = bt.querySelector('.lane'), w = lane.clientWidth; bt.querySelector('.dot').style.left = ((S.bPh + 0.5) % 1) * w + 'px'; const ww = (windowW() / P) * w, wn = bt.querySelector('.win'); wn.style.right = 'auto'; wn.style.left = (w / 2 - ww) + 'px'; wn.style.width = 2 * ww + 'px'; }
  $('bAct').textContent = S.holding ? '당기기' : '소리';

  /* 돌 움직임 */
  if (Math.abs(S.sv) > 0.001) { const d = S.sv * Math.min(1, dt * 4); const s0 = S.s; S.s = clamp(S.s + d, S0 - 3, GOAL); S.sv -= d; if (S.holding) S.px += S.s - s0;   /* 줄을 잡은 손은 돌과 함께 간다 */ for (const r of rollers) if (isUnder(r)) r.m.rotation.z -= d * 3.5; }
  if (S.s >= GOAL - 0.05) return finish(true);

  /* 굴림대: 지나온 것 줍기 → 돌 앞 길에 놓기 */
  if (S.carry < 0 && hands) { const r = rollers.find((r) => r !== rollers[helper.carry] && (r.side || r.x < S.s - 2.8) && dist(S.px, S.pz, r.x, r.z) < 1.6); if (r) { S.carry = rollers.indexOf(r); SFX.pick(); hud(); say('굴림대를 들었다 — 돌 앞 길에 내려놓자', 'roll1', 2.6); } }
  if (S.carry >= 0) { const r = rollers[S.carry]; r.side = false; r.x = S.px; r.z = S.pz; r.y = 1.0;
    if (Math.abs(S.pz - ROAD_Z) < 2.6 && S.px > S.s + 1.6 && S.px < S.s + 4.6 && true) { r.x = frontSpot(r); r.z = ROAD_Z; r.y = 0; S.carry = -1; SFX.thunk(); ring(r.x, ROAD_Z, 2, 0xc8a070); hud(); say(under() >= 2 ? '굴림대를 깔았다' : '굴림대를 깔았다 — 하나 더 있으면 굴러간다', null, 1.6); } }
  if (under() < 2 && S.t > 4) say('돌 밑 굴림대가 모자란다 — 뒤에 남은 굴림대를 앞으로!', 'rolllow', 3);

  /* 가만히 서서: 흙 담기 · 새참 받기 · 껴묻거리 들기 / 걸어가서: 흙 붓기 · 새참 주기 · 무덤방에 넣기 */
  let job = null, need = 1;
  const free = S.carry < 0 && !S.earth && !S.mealCarry && S.goods !== 'carry';
  if (free && S.ramp < 4 && dist(S.px, S.pz, DIRT[0], DIRT[1]) < 2.6) { job = 'earth'; need = 0.9; }
  if (free && !S.meal && dist(S.px, S.pz, meal.position.x, meal.position.z) < 1.8) { job = 'meal'; need = 0.8; }
  if (free && S.goods === 'altar' && dist(S.px, S.pz, goods.position.x, goods.position.z) < 2.0) { job = 'goods'; need = 1.0; }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  overBar($('work'), cam, S.px, 2.6 + groundH(S.px, S.pz), S.pz, job && S.workT > 0.05 ? S.workT / need : null);
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'earth') { S.earth = true; SFX.pick(); say('흙 한 바구니 — 받침돌 사이에 붓자', null, 2.2); }
    if (job === 'meal') { S.mealCarry = true; meal.visible = false; SFX.pick(); say('반달돌칼로 벤 벼로 지은 밥 — 끄는 사람들에게', null, 2.6); }
    if (job === 'goods') { S.goods = 'carry'; goods.visible = false; goodsGlow.visible = false; SFX.pick(); say('청동 검과 거울 — 무덤방(받침돌 사이)에', null, 2.6); }
    hud(); }
  const dC = dist(S.px, S.pz, CHAMBER[0] - 1.2, CHAMBER[1]);
  if (S.earth && dC < 2.6) { S.earth = false; S.ramp++; ramp.scale.y = (S.ramp / 4) * 1.6; SFX.thunk(); ring(CHAMBER[0], CHAMBER[1], 2.5, 0x9a7a50); hud(); say(S.ramp >= 4 ? '흙 비탈이 다 됐다 — 돌을 밀어 올릴 수 있다' : `흙을 부었다 (${S.ramp}/4)`, null, 2); if (S.ramp >= 4) SFX.done(); }
  if (S.goods === 'carry' && dC < 2.6) { S.goods = 'in'; SFX.done(); ring(CHAMBER[0], CHAMBER[1], 2.5, 0xffcf4d); hud(); say('무덤방에 청동 검과 거울을 넣었다 — 족장 집안의 무덤이다', null, 3); }
  if (S.mealCarry && dist(S.px, S.pz, gx + 2, gz) < 4) { S.mealCarry = false; S.meal = true; SFX.done(); hud(); say('새참을 먹고 기운이 돌았다 — 박자 폭이 넉넉해진다', null, 3); }

  /* 굴림대 나르는 아이(천천히) */
  stepHelper(dt);
  placeStone(); placeAll(dt);

  /* 조임 */
  const late = clamp((S.sun - 0.7) * 3.3, 0, 1), low = under() < 2 ? 0.5 : 0, away = S.away ? 0.45 : 0, slope = onSlope() ? 0.35 : 0;
  const tension = Math.max(late, low, away, slope);
  S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0 && !S.holding) { S.beatT = lerp(1.1, 0.45, tension); SFX.beat(0.06 + tension * 0.25); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${late >= Math.max(low, away) ? '120,30,60' : '200,60,20'},${tension * 0.45})`;
}
function stepHelper(dt) {
  helper.t += dt; let tx = helper.x, tz = helper.z;
  if (helper.carry < 0) { const r = rollers.find((r, i) => i !== S.carry && (r.side || r.x < S.s - 2.8)); if (r && helper.t > 16) { tx = r.x; tz = r.z; if (dist(helper.x, helper.z, tx, tz) < 0.8) { helper.carry = rollers.indexOf(r); helper.t = 0; } } else { tx = S.s - 4; tz = ROAD_Z + 3; } }
  else { const r = rollers[helper.carry]; r.side = false; tx = S.s + 4.6; tz = ROAD_Z - 2.6; r.x = helper.x; r.z = helper.z; r.y = 0.9; if (dist(helper.x, helper.z, tx, tz) < 0.6) { r.x = frontSpot(r); r.z = ROAD_Z; r.y = 0; helper.carry = -1; helper.t = 0; SFX.thunk(); hud(); } }
  const dx = tx - helper.x, dz = tz - helper.z, l = Math.hypot(dx, dz); if (l > 0.1) { const st = Math.min(l, 2.6 * dt); [helper.x, helper.z] = collideRects(SOLID.concat([[S.s - 2.4, ROAD_Z - 1.8, S.s + 2.4, ROAD_Z + 1.8]]), helper.x + dx / l * st, helper.z + dz / l * st, 0.35); helper.dir = Math.atan2(dz, dx); }
  helper.m.position.set(helper.x, groundH(helper.x, helper.z), helper.z); helper.m.rotation.y = -(helper.dir || 0) + Math.PI / 2; walkAnim(helper.m, S.t * 11, l > 0.1);
}
function placeAll(dt) {
  /* 굴림대 */
  for (const r of rollers) { const held = loose(r); r.m.position.set(r.x, groundH(r.x, r.z) + 0.28 + (held ? 1.25 : r.y || 0), r.z); r.m.rotation.y = held ? Math.PI / 2 : r.side ? 0.4 : 0; } /* 들고 갈 때는 어깨에 가로로 */
  /* 끄는 사람: 돌 앞 줄 양쪽 */
  let k = 0; const c = crew();
  haulers.forEach((h) => { if (h.hurt) return; const isAway = k >= c && !h.hurt; let tx, tz;
    if (isAway) { tx = 38 + (h.i % 3) * 3; tz = 37.5; } else { tx = S.s + 6 + Math.floor(k / 2) * 1.6; tz = ROAD_Z + (k % 2 ? 1.0 : -1.0); }
    if (S.mode === 'win' && S.endT > 2.5) { tx = MOUND[0] - 10 + (h.i % 4) * 1.5; tz = MOUND[1] + 7 + Math.floor(h.i / 4) * 1.4; }
    const dx = tx - h.x, dz = tz - h.z, l = Math.hypot(dx, dz); if (l > 0.05) { const sp = isAway ? 5 : 4, st = Math.min(l, sp * (dt || 0.016)); h.x += dx / l * st; h.z += dz / l * st; }
    h.ph += (dt || 0); const lean = !isAway && S.mode === 'play' ? Math.max(0, 0.45 - h.ph * 0.6) : 0;
    h.m.position.set(h.x, groundH(h.x, h.z), h.z); h.m.rotation.y = l > 0.3 ? -Math.atan2(dz, dx) + Math.PI / 2 : -Math.PI / 2; h.m.rotation.x = 0; h.m.rotation.z = lean; walkAnim(h.m, S.t * 10 + h.i, l > 0.3); if (!isAway) k++; });
  /* 줄 */
  const x0 = S.s + 2.3, x1 = S.s + 6 + Math.floor((c - 1) / 2) * 1.6 + 0.6; ropeSegs.forEach((m, i) => { const a = x0 + (x1 - x0) * (i / ropeSegs.length), b = x0 + (x1 - x0) * ((i + 1) / ropeSegs.length); m.position.set((a + b) / 2, groundH((a + b) / 2, ROAD_Z) + 1.0, ROAD_Z); m.scale.x = b - a; m.visible = S.mode !== 'win'; });
  { const ky = capstone.position.y, kz = ROAD_Z + 2.05, gy = groundH(S.s + 0.5, ROAD_Z + 3), P = S.holding ? [[S.s, ky, kz], [lerp(S.s, S.px, 0.5), lerp(ky, gy + 1.0, 0.6) - 0.08, lerp(kz, S.pz, 0.5)], [S.px - 0.1, gy + 1.0, S.pz - 0.32], [S.px - 0.1, gy + 0.98, S.pz - 0.3]] : [[S.s, ky, kz], [S.s + 0.3, gy + 0.72, ROAD_Z + 2.72], [S.s + 0.72, gy + 0.07, ROAD_Z + 3.2], [S.s + 1.45, gy + 0.07, ROAD_Z + 3.32]];
    tailSegs.forEach((m, i) => { segTo(m, P[i], P[i + 1]); m.visible = S.mode !== 'win'; }); }
  ramp.visible = ramp.scale.y > 0.01;   /* 흙을 붓기 전에는 비탈이 없다 */
  /* 나 */
  pMesh.position.set(S.px, groundH(S.px, S.pz), S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; pMesh.rotation.z = S.holding ? Math.max(0, 0.4 - (S.t - S.lastOk) * 0.8) : 0; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving);
  pRing.position.set(S.px, groundH(S.px, S.pz) + 0.11, S.pz); pRing.material.color.set(S.holding ? 0xffcf4d : 0xffffff);
  carryM.position.set(S.px, groundH(S.px, S.pz) + 1.95, S.pz);
  /* 할 일 보이기 */
  const play = S.mode === 'play', free = S.carry < 0 && !S.earth && !S.mealCarry && S.goods !== 'carry', [gx, gz] = grab(), low = under() < 2, pulse = 0.5 + Math.sin(S.t * 5) * 0.5;
  pillar.visible = play && free && !S.holding; pillar.position.set(gx, 4.5, gz); pillar.material.opacity = 0.55 + pulse * 0.35;
  for (const r of rollers) { const on = play && S.carry < 0 && pickable(r); r.glow.visible = on; if (on) { r.glow.position.set(r.x, groundH(r.x, r.z) + 0.6, r.z); r.glow.material.opacity = low ? 0.6 + pulse * 0.4 : 0.35; r.glow.scale.setScalar(low ? 2.6 + pulse : 2); } }
  dropRing.visible = play && S.carry >= 0; if (dropRing.visible) { dropRing.position.set(S.s + 3.2, groundH(S.s + 3.2, ROAD_Z) + 0.08, ROAD_Z); dropRing.scale.setScalar(0.9 + pulse * 0.25); }
  const near = play && free ? rollers.filter(pickable).sort((a, b) => dist(a.x, a.z, S.px, S.pz) - dist(b.x, b.z, S.px, S.pz))[0] : null;
  showTag('grab', '🙌 여기 서서 줄 잡기', play && free && !S.holding, gx, 2.6, gz);
  showTag('roll', '🪵 들어서 돌 앞으로', !!near && under() < 3, near ? near.x : 0, 1.6, near ? near.z : 0);
  showTag('drop', '⬇ 여기 내려놓기', dropRing.visible, S.s + 3.2, 1.4, ROAD_Z);
}
const tv = new THREE.Vector3();
const sA = new THREE.Vector3(), sB = new THREE.Vector3(), sX = new THREE.Vector3(1, 0, 0);
function segTo(m, a, b) { sA.set(a[0], a[1], a[2]); sB.set(b[0], b[1], b[2]); const l = sA.distanceTo(sB) || 0.001; m.position.copy(sA).add(sB).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(sX, sB.sub(sA).divideScalar(l)); m.scale.set(l, 1, 1); }
function showTag(k, html, on, x, y, z) { const e = tagEl(k, html); if (!on) { e.style.display = 'none'; return; } const q = tv.set(x, y + groundH(x, z), z).project(cam); if (q.z > 1) { e.style.display = 'none'; return; } e.style.display = 'block'; e.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; e.style.top = clamp(((1 - q.y) / 2) * innerHeight, 120, innerHeight - 30) + 'px'; }
const v3 = new THREE.Vector3();
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(MOUND[0] - 6, S.s + 8, e), lerp(9, 36, e), lerp(MOUND[1] + 14, ROAD_Z + 30, e)); cam.lookAt(lerp(MOUND[0], S.s + 8, e), lerp(3, 0, e), lerp(MOUND[1], ROAD_Z - 2, e)); if (cam.fov !== 44) { cam.fov = 44; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'win' || S.mode === 'dusk') { v3.set((S.mode === 'win' ? MOUND[0] : S.s) - 10, 9, MOUND[1] + 18); cam.position.lerp(v3, 0.03); cam.lookAt(S.mode === 'win' ? MOUND[0] : S.s, 2.5, MOUND[1]); }
  else followCam(cam, S, { W, H, map: { h: [96, 176], z: 10, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  edgeGoal($('goal'), cam, goalPos, S.mode === 'play', 0.8);
}

/* ───── 미션(11-18): 지금 할 일 하나 — 무엇을·어떻게·어디서. 이 장면은 줄·굴림대 자리를 이미 빛으로 보여 주니 빛기둥은 흙 비탈 미션에만 ───── */
let misHeld = false, misLaid = false, misCarry = -1;
mis = missions(scene, cam, [
  { t: '줄 잡기', how: '빛기둥 자리(줄 끝)에 가서 서면 저절로 잡는다', done: () => misHeld },
  { t: '「차!」에 맞춰 당기기', how: (tc) => `흰 점이 노란 칸에 들어올 때 ${tc ? '「당기기」' : '<kbd>스페이스</kbd>'}`, n: () => [S.tut, TUT], done: () => S.tut >= TUT },
  { t: '지나온 굴림대를 돌 앞에 깔기', how: '빛나는 굴림대 곁에 서면 든다 → 돌 앞 노란 고리로 걸어가면 내려놓는다', done: () => misLaid },
  { t: '돌을 언덕 비탈까지', how: (tc) => `줄을 잡고 「차!」마다 ${tc ? '「당기기」' : '<kbd>스페이스</kbd>'} · 굴림대가 모자라면 앞으로 옮기기`, n: () => [Math.max(0, Math.round(S.s - S0)), SLOPE0 - S0], done: () => S.s >= SLOPE0 },
  { t: '받침돌 사이 흙 비탈 쌓기', how: '흙더미 곁에 가만히 서면 바구니에 담는다 → 받침돌 사이에 가서 붓는다', n: () => [S.ramp, 4], done: () => S.ramp >= 4,
    at: () => (S.earth ? [CHAMBER[0] - 1.2, CHAMBER[1]] : [DIRT[0], DIRT[1]]), tag: () => (S.earth ? '⬇ 받침돌 사이에 붓기' : '🧺 가만히 서서 흙 담기') },
  { t: '덮개돌을 받침돌 위로', how: (tc) => `다시 줄을 잡고 끝까지 ${tc ? '「당기기」' : '<kbd>스페이스</kbd>'} — 비탈에서는 손을 놓지 말기`, done: () => S.mode === 'win' },
], { groundY: groundH, allText: '🎉 고인돌이 섰다!' });
function misWatch() { if (S.mode !== 'play') return; if (S.holding) misHeld = true; if (misCarry >= 0 && S.carry < 0 && !S.earth) misLaid = true; misCarry = S.carry; }

resetDay(false); placeStone(); placeAll(0.016);
haulers.forEach((h, k) => { h.x = S.s + 6 + Math.floor(k / 2) * 1.6; h.z = ROAD_Z + (k % 2 ? 1 : -1); });
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.horn(); };
runLoop((dt) => { update(dt); misWatch(); mis.update(dt, S.mode === 'play' || (S.mode === 'win' && S.endT < 2.4)); }, view, () => renderer.render(scene, cam));
window.__scene = { S, rollers, pillar, dropRing, pickable, helper, update, keys, ctl, press, under, period, windowW, grab,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz); ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  const: { DIRT, KITCHEN, ALTAR, CHAMBER, GOAL, ROAD_Z, meal: [meal.position.x, meal.position.z], goods: [goods.position.x, goods.position.z] } };
