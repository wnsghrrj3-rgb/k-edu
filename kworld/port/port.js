/* 케이월드 · 벽란도 — 고려 한 장면(S07, 2026-11-17). 본보기 = 그믐밤, 공통 부품 = ../scene/kit.js.
   목표는 하나(물이 빠지기 전 내 배 다섯 칸 — 부두 끝 물때 깃대가 다 내려가면 배가 떠난다)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 물때를 놓치면 다음 판은 단골 상인 하나가 떠난다.
   흐름: 창고에서 내 물건(🌱인삼·📄종이·🖋️먹·🦪나전칠기)을 집어 → 상인 머리 위 그림(바라는 것·기다림 띠)에 맞게 건네면 은을 받는다 →
         상인 곁 저울 앞에서 스페이스로 은을 한 닢씩 올리고 가만히 서면 셈(모자라면 고개를 젓고 돌려줌 · 딱 맞으면 「딱이오」 · 넘치면 손해) → 산 물건을 내 배에 싣는다.
   청자(언덕 가마)는 걸어서 날라야 한다 — 들고 뛰면 깨진다. 아라비아 상인 곁에 빈손으로 서 있으면 「고려」를 알려 준다. 은병(10닢)으로 큰 짐(12)을 사면 두 칸.
   좌표: x 동쪽(+), z 남쪽(+). 강은 북쪽. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, runLoop, loadArt, ART, art, artInst, artGeo, artMat, artGlowMat, scatter, missions } from '../scene/kit.js?v=4';
await loadArt('people', 'nature', 'build', 'props', 'port');   /* 블렌더로 만든 모델(사람·자연·집·소품 + 이 장면만의 것: tools/blender/make_port.py → port.glb) */

const W = 84, H = 60, BX = [4, 81], BZ = [12.2, 56], TIDE = 260;
const EXP = { ginseng: { i: '🌱', n: '인삼', v: 4, c: 0xd8c890 }, paper: { i: '📄', n: '종이', v: 2, c: 0xf6f2e6 }, ink: { i: '🖋️', n: '먹', v: 2, c: 0x2a2a2a }, najeon: { i: '🦪', n: '나전칠기', v: 3, c: 0x3a2a3a }, celadon: { i: '🏺', n: '청자', v: 6, c: 0x8ac8b0 } };
const IMP = { silk: { i: '🧣', n: '비단', p: 3, c: 0xc04a6a }, book: { i: '📚', n: '책', p: 2, c: 0x8a5a2a }, herb: { i: '🌿', n: '약재', p: 2, c: 0x6a9a4a }, tea: { i: '🍵', n: '차', p: 2, c: 0x4a7a3a }, spice: { i: '🫙', n: '향료', p: 3, c: 0xd88a3a }, big: { i: '📦', n: '큰 짐', p: 12, c: 0xb06a3a, slots: 2 } };
const MER = [
  { k: 'song', name: '송 상인', x: 18, shirt: 0x8a2e3a, hat: 'boktu', wants: ['ginseng', 'paper', 'celadon', 'najeon', 'ink'], offers: ['silk', 'book', 'herb', 'tea'], bonus: 0 },
  { k: 'wae', name: '왜 상인', x: 38, shirt: 0x3a4a72, hat: 'band', wants: ['najeon', 'ginseng', 'ink', 'paper'], offers: [], bonus: 1 },
  { k: 'arab', name: '아라비아 상인', x: 58, shirt: 0xe8e0d0, hat: 'scarf', wants: ['celadon', 'ginseng', 'najeon'], offers: ['spice'], bonus: 0 },
];
const MY_SHIP = 74, GANG = [74, 16.2], TIDEPOLE = [79.5, 13.4];
const PILES = [['ginseng', 8, 22.6], ['paper', 12.5, 22.6], ['ink', 17, 22.6], ['najeon', 21.5, 22.6]], BOTTLE = [26, 22.4], KILN = [68, 48.5];
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); return w + ((c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28) ? a : b); }; /* 받침 따라 을/를 */
const SOLID = [[5, 26, 24, 32, 3.4, 'store'], [64, 50.5, 72, 55, 3, 'kiln'], [30, 24, 34, 26.5, 2, 'stall'], [40, 24, 44, 26.5, 2, 'stall'], [50, 24, 54, 26.5, 2, 'stall']];
for (const m of MER) SOLID.push([m.x + 2.4, 13.5, m.x + 4, 15, 1, 'scale']);
const seed0 = +(new URLSearchParams(location.search).get('seed') || (Date.now() % 100000));

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xf2d6b0, 80, 230], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x6a7a5a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff1d6, intensity: 2.1, box: [48, 36], far: 160, pos: [W / 2 - 34, 50, H / 2 + 30], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261123), drnd = rng(70717);   /* drnd = 꾸밈 전용(놀이의 rnd 차례를 건드리지 않는다) */
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
const sky = skyDome(scene, rnd, { top: 0x74aae8, low: 0xffe4bc });
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* 땅 · 강 · 부두 · 창고 · 저잣거리 · 언덕 가마 */
flat(-60, 11, W + 60, H + 30, 0x8ab85a, 0);
const mud = flat(-60, 4, W + 60, 11.2, 0x9a8460, -0.24);   /* 갯벌: 물이 빠질수록 드러난다 */
const riverG = new THREE.PlaneGeometry(W + 160, 60, 60, 10); riverG.rotateX(-Math.PI / 2);
const river = new THREE.Mesh(riverG, new THREE.MeshStandardMaterial({ color: 0x3a8ad8, roughness: 0.25, metalness: 0.15, flatShading: true })); river.position.set(W / 2, 0.05, -18); scene.add(river);
const riverBase = riverG.attributes.position.array.slice();
flat(-60, -60, W + 60, -46, 0x6a9a4a, 0.4);
flat(4, 15.2, 81, 22, 0xd8c8a0, 0.03); flat(26, 22, 58, 30, 0xd2c098, 0.03); flat(60, 30, 76, 56, 0xb8a878, 0.03);
flat(81, 15.6, W + 70, 21.6, 0xd8c8a0, 0.025);   /* 개경 가는 길(동쪽, 판 밖) */
/* 풀(옛 판과 같은 rnd 차례: 너비 · 깊이 · 빛깔 · x · z — 모래 땅이면 비운다) */
{ const G = { grass_a: [], grass_b: [], flower_y: [], flower_w: [] }, sand = (x, z) => (x > 4.6 && x < 24.4 && z < 32.6) || (x > 25.6 && x < 58.4 && z < 30.4) || (x > 59.6 && x < 76.4 && z > 29.6);
  for (let i = 0; i < 70; i++) { const sx = 0.6 + rnd(), sz = 0.5 + rnd(), k = rnd() > 0.5, x = 4 + rnd() * 76, z = 22 + rnd() * 33; if (sand(x, z)) continue; (G[k ? (i % 5 ? 'grass_a' : 'flower_y') : (i % 4 ? 'grass_b' : 'flower_w')]).push([x, 0, z, 0.8 + sx * 0.5, sz * 6]); }
  scatter(scene, drnd, { area: [4, 22, 81, 56], n: 100, names: ['grass_a', 'grass_b', 'grass_a', 'grass_b'], avoid: (x, z) => sand(x, z) || dist(x, z, KILN[0], KILN[1]) < 3, scale: [0.8, 1.3], shadow: false });
  for (const k in G) artInst(scene, k, G[k], {}, { shadow: false }); }
/* 나무 부두: 6 m 토막 열셋(서 · 가운데 · 동, 덩이마다 한 번에) + 강가 짐 */
{ const PIER = [[], [], []], LOAD = [[], [], []]; for (let i = 0; i < 13; i++) { const x = 7.5 + i * 6; PIER[x < 29 ? 0 : x < 53 ? 1 : 2].push(['pier_seg', x, 0, 13.1, 1, 0]); }
  const Y = 0.08, put = (n, x, z, s = 1, ry = 0, y = Y) => LOAD[x < 40 ? 0 : x < 60 ? 1 : 2].push([n, x, y, z, s, ry]);
  put('crate', 8.6, 11.95, 1, 0.1); put('crate', 9.6, 11.9, 0.9, -0.2); put('crate', 9.1, 11.92, 0.85, 0.4, Y + 0.62); put('rope_coil', 11.2, 12.05); put('barrel', 26.4, 11.9); put('bale', 27.8, 11.95, 1, 0.2); put('sack_pile', 30.3, 11.95, 0.9, 0.3); put('cel_crate', 32.4, 11.9, 1, -0.2);
  put('crate', 46.2, 11.9, 1, 0.15); put('crate', 47.2, 11.95, 1, -0.1); put('crate', 46.7, 11.92, 0.9, 0.3, Y + 0.62); put('rope_coil', 49.4, 12.05); put('jar_a', 51.0, 11.9, 0.9); put('jar_b', 51.8, 12.15); put('anchor_stone', 53.6, 11.75, 1, 0.3);
  put('bale', 64.4, 11.95, 1, 0.1); put('bale', 65.5, 12.0, 0.9, 0.5); put('barrel', 67.0, 11.9); put('barrel', 67.7, 12.2, 0.9); put('crate', 69.3, 11.92, 1, 0.2); put('rope_coil', 77.0, 12.05);
  for (const P of PIER) scene.add(bake(P, false, false)); for (const P of LOAD) scene.add(bake(P, false, true)); }   /* 널은 납작해서 그림자를 드리우지 않는다(짐만) */
/* 창고(비쳐 보이게 할 묶음 — 제 재질) · 문 앞 물건 더미 넷(인삼 · 종이 · 먹 · 나전칠기) */
group([5, 26, 24, 32], [bake([['storehouse', 14.5, 0, 29, 1, 0]], true)]);
scene.add(bake([...PILES.map(([k, x, z]) => ['pile_' + k, x, 0.03, z, 1, 0]), ['barrel', 24.9, 0.03, 25.4, 0.95], ['barrel', 24.6, 0.03, 26.3, 0.9, 0.5], ['sack_pile', 4.7, 0.03, 24.5, 0.8, 1.2]], false, true));
/* 저잣거리 가게 셋: 청자 · 비단 · 약재와 차(막는 네모 4 x 2.5 에 꼭 맞는 판매대) */
{ const ST = ['stall_cel', 'stall_silk', 'stall_herb'], P = SOLID.filter((s) => s[5] === 'stall').map((s, i) => [ST[i], (s[0] + s[2]) / 2, 0.03, (s[1] + s[3]) / 2, 1, 0]);
  P.push(['jar_a', 35.0, 0.03, 24.4, 0.9], ['jar_b', 35.7, 0.03, 25.3], ['basket', 45.1, 0.03, 26.1, 1, 0.4], ['sack', 45.3, 0.03, 24.4, 1, 1.2], ['jar_b', 55.0, 0.03, 24.7], ['cel_crate', 56.1, 0.03, 25.8, 0.9, 0.3], ['bundle', 28.6, 0.03, 24.8, 1, 0, { cloth: 0x9a6a8a }]);
  scene.add(bake(P, false, true)); }
/* 언덕 가마(오름가마 — 아궁이가 북쪽, 가운데 위 연기 구멍) · 청자 시렁 · 장작 · 질그릇 */
scene.add(bake([['kiln', 68, 0.03, 52.75, 1, 0], ['cel_shelf', 74.9, 0.03, 51.6, 1, Math.PI / 2], ['firewood', 62.8, 0.03, 53.4, 1.1, 0.4], ['pot_plain', 72.7, 0.03, 49.2, 0.9], ['pot_comb', 73.3, 0.03, 48.6, 0.8, 1], ['jar_b', 63.3, 0.03, 50.3]], false, true));
const kilnGlow = glowSprite(scene, 'rgba(255,180,100,.9)', 'rgba(255,100,40,0)', 3); kilnGlow.position.set(68, 1.2, 50);
const kilnSmoke = []; for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), new THREE.MeshStandardMaterial({ color: 0xd8d4cc, transparent: true, opacity: 0.4, depthWrite: false, flatShading: true })); s.userData.k = k / 5; scene.add(s); kilnSmoke.push(s); }
/* 배: 송(정크선 · 대발 돛) · 왜(삼나무 · 돗자리 돛) · 아라비아(다우선 · 세모 돛) · 내 배(고려 배) — 몸통 · 돛(아래가 원점: 늘이면 올라간다) · 건널 널 */
function ship(x, hullN, sailN) { const g = new THREE.Group(); g.add(art(hullN)); const s = art(sailN); s.position.copy(ART[sailN].pivot); s.receiveShadow = false; g.add(s); g.userData.sail = s;
  const pl = art('gangplank', {}, { shadow: false }); g.add(pl); g.userData.plank = pl; g.position.set(x, 0, 6.6); scene.add(g); return g; }
const ships = [ship(18, 'ship_song', 'sail_song'), ship(38, 'ship_wae', 'sail_wae'), ship(58, 'ship_arab', 'sail_arab')];
const myShip = ship(MY_SHIP, 'ship_goryeo', 'sail_goryeo');
const gCargo = artGeo('cargo'), gCarryB = artGeo('carry_bottle'), gCarryC = artGeo('carry_cel');
const slotM = Array.from({ length: 5 }, (_, i) => { const m = new THREE.Mesh(gCargo, artMat.clone()); m.position.set(-3 + i * 1.5, 1.4, 0); m.rotation.y = (i % 2 ? 0.08 : -0.06); m.castShadow = true; m.visible = false; myShip.add(m); return m; });
/* 물때 깃대 */
{ const t = art('tide_pole'); t.position.set(TIDEPOLE[0], 0.08, TIDEPOLE[1]); scene.add(t); }
const tideFlag = art('tide_flag', {}, { shadow: false }); tideFlag.position.set(TIDEPOLE[0] + 0.75, 5.5, TIDEPOLE[1]); scene.add(tideFlag);
const goalPos = new THREE.Vector3(GANG[0], 2.2, GANG[1] - 1);
/* 은병 · 저울 */
const bottle = new THREE.Group(); bottle.add(art('eunbyeong')); bottle.position.set(BOTTLE[0], 0.03, BOTTLE[1]); scene.add(bottle);
const bottleGlow = glowSprite(scene, 'rgba(230,236,255,.85)', 'rgba(180,200,255,0)', 2.4); bottleGlow.position.set(BOTTLE[0], 1.3, BOTTLE[1]);
const scales = MER.map((m) => { const g = new THREE.Group(); g.add(art('scale_base')); const beam = new THREE.Group(); beam.position.y = 1.8; beam.add(art('scale_beam', {}, { shadow: false })); const pL = art('scale_pan'), pR = art('scale_pan'); pL.position.set(-0.65, -0.3, 0); pR.position.set(0.65, -0.3, 0); beam.add(pL, pR); g.add(beam); g.position.set(m.x + 3.2, 0.08, 14.2); scene.add(g); return { g, beam, pL, pR }; });
/* ───── 판 밖(못 가는 곳) — 꾸밈은 drnd 만 쓴다. 구역마다 한 덩이로 굽고(화면 밖 구역은 통째로 빠진다) 그림자는 드리우지 않는다 ───── */
{ const CH = {}, put = (part) => { const x = part[1], z = part[3], k = z < 0 ? (x < 42 ? 'nw' : 'ne') : x < 4 ? (z < 34 ? 'w0' : 'w1') : x > 81 ? 'e' : z > 56 ? (x < 42 ? 's0' : 's1') : 'in'; (CH[k] = CH[k] || []).push(part); };
  /* 서쪽 강가: 벽란정(송나라 사신을 맞던 정자) · 기와집 */
  put(['byeokranjeong', -7, 0, 16.5, 1, 0]);
  [[-6, 28, 'tile_a'], [-5, 38, 'tile_b'], [-6, 48, 'tile_a'], [-15, 33, 'tile_b']].forEach(([x, z, n]) => put([n, x, 0, z, 0.95 + drnd() * 0.1, Math.PI / 2, { wall: 0xe4d6b8 }]));
  /* 남쪽: 벽란도 마을(초가 · 기와) · 가마 언덕 */
  [[8, 62, 'thatch_a'], [17, 63, 'thatch_b'], [27, 62.5, 'tile_b'], [37, 63, 'thatch_a'], [47, 62, 'thatch_b'], [12, 72, 'thatch_b'], [30, 73, 'thatch_a'], [52, 72, 'granary']].forEach(([x, z, n]) => put([n, x + (drnd() - 0.5), 0, z, 0.95 + drnd() * 0.1, Math.PI + (drnd() - 0.5) * 0.2, { wall: 0xe4d6b8 }]));
  put(['hill_p', 69, -0.4, 66, [30, 8, 20], 0.3]); put(['hill_q', 104, -0.4, 70, [30, 9, 24], 1.1]);
  /* 동쪽: 개경 가는 길 — 장승 둘 · 수레와 소 · 길가 돌 */
  put(['jangseung', 86, 0, 14.8, 1, 0]); put(['jangseung', 86, 0, 22.4, 1, Math.PI]); put(['cart', 97, 0.03, 18.6, 1, Math.PI / 2]); put(['ox', 101.2, 0.03, 18.6, 1, Math.PI / 2]); put(['rock_tall', 90, 0, 23.4, 0.6, 0.4]);
  put(['shed', 92, 0, 27, 1, Math.PI]); put(['sack_pile', 89.5, 0, 25.5, 0.9, 0.3]);
  /* 북쪽 건너편: 언덕 · 초가 · 그물 */
  put(['hill_p', 10, 0, -72, [60, 14, 26], 0]); put(['hill_q', 62, 0, -76, [70, 18, 30], 0.6]); put(['hill_p', 112, 0, -66, [50, 12, 24], 1.3]);
  [[14, -52], [24, -53], [58, -52.5], [70, -53]].forEach(([x, z], i) => put([i % 2 ? 'thatch_b' : 'thatch_a', x, 0.4, z, 1, (drnd() - 0.5) * 0.3, { wall: 0xe4d6b8 }]));
  /* 나무: 판 밖 둘레(마을 · 가마 언덕 · 건너편 · 길가) */
  const HOUSE = [[-7, 16.5, 7], [-6, 28, 5.5], [-5, 38, 5], [-6, 48, 5.5], [-15, 33, 5], [8, 62, 5], [17, 63, 4.5], [27, 62.5, 4.5], [37, 63, 5], [47, 62, 4.5], [12, 72, 4.5], [30, 73, 5], [52, 72, 4], [92, 27, 4], [14, -52, 5], [24, -53, 4.5], [58, -52.5, 5], [70, -53, 4.5]];
  const out = (x, z) => (x > 2 && x < 83 && z > 9 && z < 58) || (x > 80 && z > 13.5 && z < 23.5) || (z > -46 && z < 9) || HOUSE.some(([hx, hz, r]) => dist(x, z, hx, hz) < r) || (((x - 69) / 15) ** 2 + ((z - 66) / 10) ** 2 < 0.75) || (((x - 104) / 15) ** 2 + ((z - 70) / 12) ** 2 < 0.75);
  for (let i = 0, n = 0; i < 800 && n < 64; i++) { const x = -40 + drnd() * 170, z = -70 + drnd() * 160, nm = ['pine_a', 'pine_b', 'tree_a', 'pine_a', 'tree_b'][Math.floor(drnd() * 5)], sc = 0.9 + drnd() * 0.5, ry = drnd() * 6.28; if (out(x, z) || (z < -46 && z > -51) || z < -62) continue; n++; put([nm, x, z < 0 ? 0.4 : 0, z, sc, ry]); }
  for (const k in CH) scene.add(bake(CH[k], false, false));
  scatter(scene, drnd, { area: [-30, 8.6, 120, 11], n: 10, names: ['reed'], avoid: (x, z) => x > 3 && x < 83, scale: [0.8, 1.2], shadow: false });
  scatter(scene, drnd, { area: [-40, -46, 120, -44], n: 12, names: ['reed'], scale: [0.8, 1.3], shadow: false });
  scatter(scene, drnd, { area: [-40, 11, 120, 80], n: 70, names: ['grass_a', 'grass_b', 'grass_a'], avoid: (x, z) => (x > 3 && x < 82 && z < 57) || (x > -12 && x < -1 && z < 21) || (x > 80 && z > 14 && z < 23), scale: [0.8, 1.3], shadow: false }); }
/* 강 위: 고깃배 셋 · 닻 내린 먼 배 둘(물때 따라 함께 내려간다) */
const riverBoats = bake([['fishboat', 30, 0, -14, 1, 0.4], ['fishboat', 50, 0, -24, 1, -0.8], ['fishboat', 8, 0, -30, 1, 2.2], ['ship_song', 22, 0, -36, 0.9, Math.PI], ['sail_song', 22, 2.2 * 0.9, -36, [0.9, 0.7, 0.9], Math.PI], ['ship_arab', 66, 0, -34, 0.9, 0.2], ['sail_arab', 66, 2.2 * 0.9, -34, [0.9, 0.8, 0.9], 0.2]], false, false); scene.add(riverBoats);
/* 사람: 나(고려 상인 — 상투) · 송 상인(복두) · 왜 상인(머리띠) · 아라비아 상인(머리에 감은 천) · 가마의 도공 · 저잣거리 사람 */
const SKIN = 0xf0c48e;
const pMesh = person({ shirt: 0x5a8a9a, pants: 0x4a5a5a, hat: 'top', skin: SKIN });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const carryM = new THREE.Mesh(gCargo, artMat.clone()); carryM.castShadow = true; carryM.visible = false; scene.add(carryM);
const shards = Array.from({ length: 8 }, () => { const s = box(0.14, 0.05, 0.12, 0x8ac8b0); s.visible = false; scene.add(s); return { m: s, t: 9, vx: 0, vy: 0, vz: 0 }; });
const MER_LOOK = { song: { pants: 0x2a2a3a }, wae: { pants: 0xe8e2d4 }, arab: { pants: 0x8a7a5a, skin: 0xc89a6a } };
const merMesh = MER.map((m) => { const p = person({ shirt: m.shirt, pants: MER_LOOK[m.k].pants, hat: m.hat, skin: MER_LOOK[m.k].skin || SKIN }); p.position.set(m.x, 0.08, 13.6); p.rotation.y = 0; return p; });
const potter = person({ shirt: 0x8a7a6a, pants: 0x5a4a3a, hat: 'top', skin: SKIN }); potter.position.set(70.4, 0.03, 48.6); potter.rotation.y = -Math.PI / 2;
const townsfolk = [[33, 28], [46, 27.5], [52, 28.4], [28, 19]].map(([x, z], i) => { const m = person({ shirt: [0xb89a70, 0xd8a8a0, 0xc0a880, 0x9a8a68][i], pants: [0x6a5034, 0x5a6a8a, 0x6a5034, 0x6a5034][i], hat: ['top', 'bun', 'paeraengi', 'top'][i], chima: i === 1, skin: SKIN }); m.position.set(x, 0.03, z); m.rotation.y = i; return m; });
const tagBox = $('tags'); const mkTag = () => { const d = document.createElement('div'); d.className = 'tag'; tagBox.appendChild(d); return d; };
const merTags = MER.map(mkTag), scaleTags = MER.map(mkTag), pileTags = PILES.map(mkTag), tagKiln = mkTag(), tagBottle = mkTag(), tagGang = mkTag();

/* ───── 소리 ───── */
const SFX = {
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  coin: () => { tone(1800, 2200, 0.08, 'square', 0.06); tone(2400, 2600, 0.1, 'triangle', 0.08, 0.05); },
  deal: () => { tone(523, 659, 0.16, 'triangle', 0.14); tone(784, 1047, 0.22, 'triangle', 0.14, 0.12); },
  no: () => { tone(300, 200, 0.3, 'sawtooth', 0.08); },
  crash: () => { for (let i = 0; i < 6; i++) noise(0.08, 0.35, 2800 + i * 400, i * 0.04); },
  load: () => { noise(0.2, 0.3, 300); tone(200, 160, 0.2, 'sine', 0.1); },
  bell: () => { tone(880, 870, 0.8, 'sine', 0.1); },
  horn: () => { tone(180, 190, 1.2, 'sawtooth', 0.09); tone(270, 280, 1.2, 'sine', 0.06); },
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  sad: () => { tone(330, 220, 1.0, 'sine', 0.14); tone(262, 175, 1.2, 'sine', 0.1, 0.4); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', round: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, k: 0, px: 30, pz: 20, pdir: -Math.PI / 2, moving: false, running: false, said: {}, sayT: 0,
  silver: 2, carry: null, slots: [], deals: 0, celadonOk: 0, broken: 0, kilnT: 99, named: false, bottleUsed: false, bottleTaken: false, friends: new Set(), lost: 0, over: 0,
  mer: MER.map(() => ({ wi: 0, oi: 0, pat: 1, pan: 0, panBottle: false, lastAdd: -9, gone: false })), workT: 0, workKey: '', endT: 0, shown: false, introT: 0, beatT: 0, stepT: 0, goneK: null };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 「뛰기」(청자는 깨진다) · 가만히 서면 집고·건넨다 · 저울 앞에서 「은 올리기」 뒤 가만히 서면 셈 · 「시점」 ⟲⟳';
const offerOf = (i) => { const m = MER[i], st = S.mer[i]; if (!m.offers.length) return null; if (m.k === 'arab' && (st.panBottle || S.carry === 'bottle') && !S.bottleUsed) return 'big'; return m.offers[st.oi % m.offers.length]; };
const wantOf = (i) => MER[i].wants[S.mer[i].wi % MER[i].wants.length];
/* 미션이 지켜보는 것(장면 쪽 작은 변수 — S 는 읽기만 한다) */
let mis = null, misPicked = false, misSold = false, misBought = false, misPrevCarry = null, misPrevSilver = 0;
function misClear() { misPicked = misSold = misBought = false; misPrevCarry = null; misPrevSilver = S.silver; }

function resetRound(full) {
  if (full) { S.round = 1; S.goneK = null; }
  const r = rng(seed0 * 5 + S.round * 77);
  Object.assign(S, { t: 0, k: 0, px: 30, pz: 20, pdir: -Math.PI / 2, silver: 3, carry: null, slots: [], deals: 0, celadonOk: 0, broken: 0, kilnT: 99, named: false, bottleUsed: false, bottleTaken: false, friends: new Set(), lost: 0, over: 0, workT: 0, endT: 0, shown: false });
  S.mer = MER.map((m) => ({ wi: Math.floor(r() * m.wants.length), oi: Math.floor(r() * Math.max(1, m.offers.length)), pat: 1, pan: 0, panBottle: false, lastAdd: -9, gone: m.k === S.goneK }));
  merMesh.forEach((p, i) => (p.visible = !S.mer[i].gone)); bottle.visible = true; bottleGlow.visible = true; slotM.forEach((m) => (m.visible = false));
  ships.forEach((s, i) => { s.position.set(MER[i].x, 0, 6.6); s.rotation.y = 0; }); myShip.position.set(MY_SHIP, 0, 6.6);
  $('fade').style.opacity = 0; lightFor(0); hud();
  if (full && mis) { mis.reset(); misClear(); }
}
function hud() {
  $('hSilver').textContent = '🪙 ' + S.silver;
  const c = S.carry, label = !c ? '손 비었음' : c === 'bottle' ? '⚱ 은병(10닢)' : EXP[c] ? EXP[c].i + ' ' + EXP[c].n : IMP[c].i + ' ' + IMP[c].n;
  $('hCarry').textContent = label + (c ? ' 들었음' : '');
  const sl = $('slots').children; for (let i = 0; i < 5; i++) { const s = S.slots[i]; sl[i].textContent = s ? IMP[s].i : ''; sl[i].className = s ? 'on' : ''; }
  $('tCel').className = S.celadonOk ? 'on' : ''; $('tName').className = S.named ? 'on' : ''; $('tBottle').className = S.bottleUsed ? 'on' : '';
  slotM.forEach((m, i) => { m.visible = !!S.slots[i]; if (S.slots[i]) m.material.color.set(IMP[S.slots[i]].c); });
}

/* ───── 저울: 스페이스 = 은 한 닢(은병을 들었으면 은병) ───── */
const atScale = () => MER.findIndex((m, i) => !S.mer[i].gone && dist(S.px, S.pz, m.x + 3.2, 16.5) < 1.6);
function act() {
  if (S.mode !== 'play') return;
  const i = atScale(); if (i < 0) return;
  const st = S.mer[i], off = offerOf(i);
  if (!off) return say(MER[i].name + '은 팔 물건이 없다 — 은만 준다', null, 2);
  if (S.carry && S.carry !== 'bottle') return say('먼저 들고 있는 것을 내려놓자(배·상인에게)', null, 1.8);
  if (S.carry === 'bottle') { S.carry = null; st.panBottle = true; st.pan += 10; st.lastAdd = S.t; SFX.coin(); SFX.coin(); hud(); say('은병을 저울에 올렸다 — 10닢', null, 1.8); return; }
  if (S.silver < 1) return say('은이 없다 — 내 물건을 상인에게 팔아 은을 받자', null, 2);
  S.silver--; st.pan++; st.lastAdd = S.t; SFX.coin(); hud();
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) act(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });
canvas.addEventListener('pointerdown', () => { if (S.mode === 'intro') S.introT = 99; });
function settle(i) { /* 가만히 서서 셈 */
  const st = S.mer[i], off = offerOf(i), price = IMP[off].p, pan = st.pan;
  if (pan < price) { S.silver += st.panBottle ? pan - 10 : pan; if (st.panBottle) S.carry = 'bottle'; st.pan = 0; st.panBottle = false; SFX.no(); say(`고개를 젓는다 — ${price}닢인데 ${pan}닢. 돌려받았다`, null, 2.6); hud(); return 'under'; }
  const extra = pan - price; S.carry = off; st.pan = 0; if (st.panBottle) { S.bottleUsed = true; st.panBottle = false; } if (off !== 'big') st.oi++; S.deals++; S.friends.add(MER[i].k); S.over += extra; SFX.deal();
  say(extra === 0 ? `딱 맞다! ${IMP[off].i} ${josa(IMP[off].n, '을', '를')} 샀다 — 내 배로` : `${josa(IMP[off].n, '을', '를')} 샀지만 ${extra}닢 더 줬다(손해)`, null, 2.6); hud(); return extra === 0 ? 'exact' : 'over';
}

/* ───── 끝 ───── */
function finish(full) { S.mode = 'sail'; S.endT = 0; S.endFull = full; SFX.horn(); say(full ? '내 배가 가득 찼다 — 돛을 올린다!' : '물이 빠졌다 — 배들이 떠난다', null, 2.8); }
function endScreen() {
  const n = S.slots.length, full = S.endFull;
  const marks = `<div class="marks"><span class="${S.deals ? 'ok' : ''}">⚖ 마친 거래 ${S.deals}</span><span class="${S.celadonOk ? 'ok' : ''}">🏺 온전한 청자 ${S.celadonOk}${S.broken ? ` · 깨짐 ${S.broken}` : ''}</span><span class="${S.silver ? 'ok' : ''}">🪙 남은 은 ${S.silver}</span><span class="${S.friends.size ? 'ok' : ''}">🌏 사귄 상인 ${S.friends.size}${S.named ? ' · 「코리아」' : ''}</span></div>`;
  const facts = `<div class="fact">📜 <b>벽란도</b> — 고려 서울 개경에서 가까운 예성강 나루로, 여러 나라 배가 드나든 큰 무역항이었다.<br>📜 <b>오간 물건</b> — 고려는 인삼·종이·먹·나전칠기를 내보내고, 비단·책·약재·차를 들여왔다.<br>📜 <b>아라비아 상인</b> — 먼 서쪽 상인들도 향료와 산호를 싣고 왔다. 「코리아」라는 이름이 이때 퍼졌다.<br>📜 <b>청자</b> — 고려 사람들은 흙에 무늬를 파고 다른 흙을 메워 굽는 상감 청자를 만들었다.</div>`;
  if (full) overlay(`<h1>돛을 올린다</h1><p>노을 속에 배들이 돛을 올린다. 내 배에는 ${S.slots.map((s) => IMP[s].i).join(' ')} 이 실렸다.${S.named ? ' 아라비아 배에서 누군가 「코리아!」 하고 손을 흔든다.' : ''}</p>${marks}<p class="keys">이 나루에서 고려의 이름이 먼 바다 건너까지 실려 갔다.</p>${facts}`, '한 번 더', () => { resetRound(true); S.mode = 'play'; });
  else { const leave = MER.find((m) => m.k !== 'arab' && m.k !== S.goneK) || MER[1];
    overlay(`<h1>물이 빠졌다</h1><p>빈 칸 ${5 - n}개를 남긴 채 배가 떠났다.${n === 0 ? ' 내 배는 텅 비었다.' : ''}</p>${marks}<p>다음 물때 — 단골이던 <b>${leave.name}</b>이 다른 가게로 갔다.</p><p class="keys">${S.round + 1}번째 물때 · 깃발은 다시 오른다.</p>`, '다음 물때', () => { S.round++; S.goneK = leave.k; resetRound(false); S.mode = 'play'; say(leave.name + '이 떠났다 — 남은 상인과 거래하자', null, 3); }); }
}

/* ───── 하늘 ───── */
const SKY = [[0, 0x74aae8, 0xffe4bc, 0xfff1d6, 2.1, 1.3], [0.6, 0x7aa0d8, 0xffd0a0, 0xffe0b0, 1.9, 1.2], [0.85, 0x6a6aa8, 0xff9a5a, 0xffa060, 1.5, 1.0], [1.0, 0x4a4a88, 0xe8706a, 0xff8a60, 1.1, 0.8], [1.2, 0x2a2a5a, 0xc0506a, 0xff8050, 0.7, 0.6]];
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); let lastSky = -1;
function lightFor(k) { let a = SKY[0], b = SKY[SKY.length - 1]; for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = clamp((k - a[0]) / ((b[0] - a[0]) || 1), 0, 1); cT.set(a[1]).lerp(tc.set(b[1]), t); cL.set(a[2]).lerp(tc.set(b[2]), t);
  if (Math.abs(k - lastSky) > 0.004) { sky.paint(cT, cL); lastSky = k; } scene.fog.color.copy(cL); sun.color.set(a[3]).lerp(tc.set(b[3]), t); sun.intensity = lerp(a[4], b[4], t); hemi.intensity = lerp(a[5], b[5], t);
  const az = lerp(2.3, 3.0, clamp(k, 0, 1)), el = lerp(1.0, 0.18, clamp(k, 0, 1)); sun.position.set(W / 2 + Math.cos(az) * Math.cos(el) * 70, Math.sin(el) * 70 + 4, H / 2 + Math.sin(az) * Math.cos(el) * 70); }

/* ───── 한 걸음 ───── */
const v3 = new THREE.Vector3();
function showTag(el, x, y, z, html) { if (!html) { el.style.display = 'none'; return; } const q = v3.set(x, y, z).project(cam); if (q.z > 1) { el.style.display = 'none'; return; } el.style.display = 'block'; el.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; el.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; if (el._h !== html) { el.innerHTML = html; el._h = html; } }
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  const lvl = S.mode === 'play' || S.mode === 'sail' ? -clamp(S.k, 0, 1) * 0.7 : 0; river.position.y = 0.05 + lvl;
  { const p = riverG.attributes.position; for (let i = 0; i < p.count; i++) { const x = riverBase[i * 3], z = riverBase[i * 3 + 2]; p.setY(i, Math.sin(x * 0.3 + S.t * 1.1) * 0.1 + Math.cos(z * 0.5 + S.t * 0.8) * 0.07); } p.needsUpdate = true; }
  [...ships, myShip].forEach((s, i) => { s.position.y = lvl + Math.sin(S.t * 1.3 + i) * 0.06; s.rotation.z = Math.sin(S.t * 0.9 + i) * 0.02; });
  riverBoats.position.y = lvl + Math.sin(S.t * 1.1) * 0.05;
  kilnGlow.material.opacity = 0.6 + Math.sin(S.t * 7) * 0.2; for (const s of kilnSmoke) { const k = (s.userData.k + S.t * 0.1) % 1; s.position.set(68 + Math.sin(k * 5) * 0.4, 3 + k * 7, 52.7); s.scale.setScalar(0.5 + k * 1.4); s.material.opacity = (1 - k) * 0.4 * clamp((cam.position.distanceTo(s.position) - 4) / 6, 0, 1); }
  bottleGlow.material.opacity = 0.5 + Math.sin(S.t * 3) * 0.2;
  for (const s of shards) if (s.t < 1.5) { s.t += dt; s.vy -= 9 * dt; s.m.position.x += s.vx * dt; s.m.position.y = Math.max(0.05, s.m.position.y + s.vy * dt); s.m.position.z += s.vz * dt; if (s.t >= 1.5) s.m.visible = false; }
  if (S.mode === 'title' || S.mode === 'intro') { if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.2) { S.mode = 'play'; SFX.bell(); say('상인 머리 위 그림이 바라는 물건이다 — 창고에서 집어 오자', null, 3.4); } } place(dt); return; }
  if (S.mode === 'sail') { S.endT += dt; [...ships, myShip].forEach((s, i) => { s.position.z -= dt * (1.2 + i * 0.2); s.userData.sail.scale.y = Math.min(1.3, 1 + S.endT * 0.1); }); lightFor(Math.min(1.1, Math.max(S.k, 0.85) + S.endT * 0.04)); if (S.endT > 5 && !S.shown) { S.shown = true; endScreen(); } place(dt); return; }
  if (S.mode !== 'play') return;

  /* 물때 */
  S.k = S.t / TIDE; lightFor(S.k); $('tide').querySelector('i').style.width = clamp(S.k, 0, 1) * 100 + '%'; tideFlag.position.y = lerp(5.5, 0.8, clamp(S.k, 0, 1));
  if (S.k > 0.8) say('물이 많이 빠졌다 — 곧 배가 떠난다!', 'late', 3);
  if (S.k >= 1) return finish(false);
  S.kilnT += dt;

  /* 나 — 청자를 들고 뛰면 깨진다 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 4.8 : 3.1) * (back ? 0.6 : 1); const [nx, nz] = collideRects(SOLID, S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); if (S.view !== 2) S.pdir = Math.atan2(iz, ix); S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; noise(0.05, 0.05, 300); } }
  if (S.carry === 'celadon' && S.running) { S.carry = null; S.broken++; SFX.crash(); for (const s of shards) { s.t = 0; s.vx = (rnd() - 0.5) * 4; s.vy = 2 + rnd() * 2; s.vz = (rnd() - 0.5) * 4; s.m.position.set(S.px, 1.4, S.pz); s.m.visible = true; } say('쨍그랑! 청자가 깨졌다 — 청자는 걸어서 날라야 한다', null, 3); hud(); }
  if (S.carry === 'celadon') say('청자를 들었다 — 뛰면 깨진다. 천천히', 'celwalk', 2.6);

  /* 상인: 기다림 띠 */
  S.mer.forEach((st, i) => { if (st.gone) return; st.pat -= dt / 50; if (st.pat <= 0) { st.pat = 1; st.wi++; SFX.no(); if (dist(S.px, S.pz, MER[i].x, 16) < 14) say(MER[i].name + '이 기다리다 지쳐 다른 것을 찾는다', null, 2); } });

  /* 가만히 서서: 창고 물건 · 은병 · 청자 · 상인에게 건네기 · 「고려」 · 저울 셈 */
  let job = null, need = 1, arg = null;
  PILES.forEach(([k, x, z], i) => { if (!job && !S.carry && dist(S.px, S.pz, x, z - 1.4) < 1.8) { job = 'pile'; need = 0.6; arg = k; } });
  if (!job && !S.carry && !S.bottleTaken && dist(S.px, S.pz, BOTTLE[0], BOTTLE[1] - 1.2) < 1.8) { job = 'bottle'; need = 0.8; }
  if (!job && !S.carry && dist(S.px, S.pz, KILN[0], KILN[1]) < 1.9 && S.kilnT > 20) { job = 'kiln'; need = 1.4; }
  MER.forEach((m, i) => { if (!job && !S.mer[i].gone && dist(S.px, S.pz, m.x, 16.2) < 1.7) { if (S.carry && EXP[S.carry]) { job = 'give'; need = 0.6; arg = i; } else if (!S.carry && m.k === 'arab' && !S.named) { job = 'name'; need = 1.3; arg = i; } } });
  const si = atScale(); if (!job && si >= 0 && S.mer[si].pan > 0 && S.t - S.mer[si].lastAdd > 0.2) { job = 'settle'; need = 1.3; arg = si; }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  if (job === 'settle' && S.t - S.mer[si].lastAdd < 0.25) S.workT = 0;
  overBar($('work'), cam, S.px, 2.6, S.pz, job && S.workT > 0.05 ? S.workT / need : null);
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'pile') { S.carry = arg; SFX.pick(); say(`${EXP[arg].i} ${EXP[arg].n} — 바라는 상인에게`, null, 2); }
    if (job === 'bottle') { S.carry = 'bottle'; S.bottleTaken = true; bottle.visible = false; bottleGlow.visible = false; SFX.pick(); say('은병 — 은 10닢 값. 아라비아 상인 저울에 올리면 큰 짐을 판다', null, 3.2); }
    if (job === 'kiln') { S.carry = 'celadon'; S.kilnT = 0; SFX.pick(); say('상감 청자 — 가장 큰 값을 받는다. 걸어서!', null, 2.6); }
    if (job === 'give') { const m = MER[arg], st = S.mer[arg], w = wantOf(arg);
      if (S.carry === w) { const pay = EXP[w].v + m.bonus; S.silver += pay; if (w === 'celadon') S.celadonOk++; S.carry = null; st.wi++; st.pat = 1; S.deals++; S.friends.add(m.k); SFX.coin(); SFX.deal(); ring(m.x, 14, 2.4, 0xffcf4d); say(`${m.name}이 ${josa(EXP[w].n, '을', '를')} 받고 은 ${pay}닢을 준다`, null, 2.4); }
      else { SFX.no(); say(`${m.name}은 ${josa(EXP[S.carry].n, '이', '가')} 아니라 ${EXP[w].i}${josa(EXP[w].n, '을', '를')} 바란다`, null, 2.4); } }
    if (job === 'name') { S.named = true; S.friends.add('arab'); SFX.deal(); say('"이 나라 이름은 「고려」요." — "코리아! 코리아!" 그가 따라 말한다', null, 3.4); }
    if (job === 'settle') settle(arg);
    hud(); }
  /* 산 물건을 내 배에 싣는다 */
  if (S.carry && IMP[S.carry] && dist(S.px, S.pz, GANG[0], GANG[1]) < 2.2) { const n = IMP[S.carry].slots || 1; for (let k = 0; k < n && S.slots.length < 5; k++) S.slots.push(S.carry); S.carry = null; SFX.load(); ring(GANG[0], GANG[1] - 2, 2.6, 0xffcf4d); hud(); say(S.slots.length >= 5 ? '다섯 칸이 다 찼다!' : `내 배에 실었다 — ${5 - S.slots.length}칸 남았다`, null, 1.8); if (S.slots.length >= 5) return finish(true); }
  if (S.carry && IMP[S.carry]) say('산 물건 — 부두 동쪽 끝 내 배로', 'toship', 2.4);
  place(dt);

  /* 조임 */
  const late = clamp((S.k - 0.65) * 2.8, 0, 1), impatient = Math.max(...S.mer.map((st) => (st.gone ? 0 : 1 - st.pat))) > 0.8 ? 0.35 : 0, fragile = S.carry === 'celadon' ? 0.3 : 0;
  const tension = Math.max(late, impatient, fragile); S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.4, tension); SFX.beat(0.06 + tension * 0.26); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${late > impatient ? '120,30,60' : '200,60,20'},${tension * 0.45})`;
  $('bAct').className = 'btn' + (atScale() >= 0 ? ' show' : '');
}
function place(dt) {
  pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving); pRing.position.set(S.px, 0.11, S.pz);
  carryM.visible = !!S.carry; if (S.carry) { const kind = S.carry === 'bottle' ? 1 : S.carry === 'celadon' ? 2 : 0; carryM.geometry = kind === 1 ? gCarryB : kind === 2 ? gCarryC : gCargo; carryM.scale.setScalar(kind ? 1 : 0.55); carryM.position.set(S.px, 2.08, S.pz); carryM.material.color.set(kind ? 0xffffff : (EXP[S.carry] || IMP[S.carry]).c); }
  for (const s of [...ships, myShip]) s.userData.plank.visible = S.mode !== 'sail';
  merMesh.forEach((p, i) => { p.rotation.y = Math.atan2(S.px - MER[i].x, S.pz - 13.6) * 0.6; walkAnim(p, 0, false); });
  scales.forEach((s, i) => { const st = S.mer[i], off = offerOf(i); const d = off ? clamp((st.pan - IMP[off].p) * 0.12, -0.35, 0.35) : 0; s.beam.rotation.z = lerp(s.beam.rotation.z, d, 0.15); s.pL.position.y = -0.3 - Math.sin(s.beam.rotation.z) * 0.6; s.pR.position.y = -0.3 + Math.sin(s.beam.rotation.z) * 0.6; });
  const play = S.mode === 'play';
  MER.forEach((m, i) => { const st = S.mer[i]; if (st.gone) { merTags[i].style.display = scaleTags[i].style.display = 'none'; return; } const d = dist(S.px, S.pz, m.x, 15);
    const w = wantOf(i), html = play && d < 22 ? `${EXP[w].i}<small>${m.k === 'arab' && !S.named && d < 6 ? ' 🗺️❓' : ''}</small><span class="wait"><i style="width:${st.pat * 100}%;background:${st.pat < 0.25 ? '#c0392b' : '#3aa860'}"></i></span>` : null; showTag(merTags[i], m.x, 2.9, 13.6, html);
    const off = offerOf(i), ds = dist(S.px, S.pz, m.x + 3.2, 16.5); showTag(scaleTags[i], m.x + 3.2, 1.3, 14.6, play && off && ds < 6 ? `⚖ ${IMP[off].i} <b>${IMP[off].p}</b>닢 · 올린 🪙 <b class="${st.pan === IMP[off].p ? 'ok' : st.pan > IMP[off].p ? 'no' : ''}">${st.pan}</b>${!misBought && ds < 3.2 ? `<small style="display:block">${ctl.isTouch ? '「은 올리기」' : '스페이스'} = 한 닢 · 값이 맞으면 가만히</small>` : ''}` : null); });
  PILES.forEach(([k, x, z], i) => showTag(pileTags[i], x, 1.8, z, play && dist(S.px, S.pz, x, z) < 8 ? EXP[k].i + (!misPicked && !S.carry && dist(S.px, S.pz, x, z) < 4 ? '<small> 가만히 서면 집는다</small>' : '') : null));
  showTag(tagKiln, KILN[0], 2.4, KILN[1] + 1.2, play && dist(S.px, S.pz, KILN[0], KILN[1]) < 9 ? (S.kilnT > 20 ? '🏺 <small>걸어서</small>' : '🔥⏳') : null);
  showTag(tagBottle, BOTTLE[0], 2.2, BOTTLE[1], play && !S.bottleTaken && dist(S.px, S.pz, BOTTLE[0], BOTTLE[1]) < 8 ? '⚱ <small>10닢</small>' : null);
  showTag(tagGang, GANG[0], 2.6, GANG[1] - 1.4, play && dist(S.px, S.pz, GANG[0], GANG[1]) < 12 ? `⛵ ${S.slots.length}/5` : null);
}
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(58, 34, e), lerp(9, 36, e), lerp(24, 44, e)); cam.lookAt(lerp(58, 34, e), lerp(2, 0, e), lerp(8, 18, e)); if (cam.fov !== 44) { cam.fov = 44; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'sail') { v3.set(56, 12, 30); cam.position.lerp(v3, 0.03); cam.lookAt(50, 2, 4); }
  else followCam(cam, S, { W, H, clampZ: [4, H - 6], map: { h: [96, 176], z: 6, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  edgeGoal($('goal'), cam, goalPos, S.mode === 'play', 0.8);
}

/* ───── 미션(11-18): 지금 할 일 하나 — 무엇을·어떻게·어디서. 흔적 할 일(청자 · 「고려」 · 은병)은 고르는 재미로 남겨 두고 미션에 넣지 않는다.
   마지막 미션 = 목표(내 배 다섯 칸). 상인 · 저울 꼬리표는 장면이 이미 띄우니 빛기둥은 처음 가는 자리에만. 미션은 S 를 읽기만 한다 ───── */
const misNear = (pts) => pts.filter(Boolean).sort((a, b) => dist(S.px, S.pz, a[0], a[1]) - dist(S.px, S.pz, b[0], b[1]))[0] || null;
const misPile = () => misNear(MER.map((m, i) => (!S.mer[i].gone && wantOf(i) !== 'celadon' ? PILES.find((q) => q[0] === wantOf(i)) : null)).map((q) => q && [q[1], q[2] - 1.4]));
mis = missions(scene, cam, [
  { t: '창고 앞 물건 하나 집기', how: '상인 머리 위 그림과 같은 물건 더미 앞에 가만히 서 있으면 든다', done: () => misPicked, at: misPile, tag: '🙌 여기 가만히 서서 집기' },
  { t: '바라는 상인에게 건네고 은 받기', how: '든 물건 그림이 머리 위에 뜬 상인 앞에 가만히 서기 — 기다림 띠가 다 줄기 전에', done: () => misSold,
    at: () => { const c = S.carry; if (c && EXP[c]) { const j = MER.findIndex((m, i) => !S.mer[i].gone && wantOf(i) === c); return j >= 0 ? [MER[j].x, 16.2] : null; } return S.carry ? null : misPile(); },
    tag: () => (S.carry && EXP[S.carry] ? '🪙 여기 서서 건네기' : '🙌 바라는 물건 집기') },
  { t: '저울에 은을 올려 바깥 물건 사기', how: (tc) => `${MER.filter((m, i) => !S.mer[i].gone && m.offers.length).map((m) => m.name.replace(' 상인', '')).join('·')} 상인 곁 저울 앞에서 ${tc ? '「은 올리기」' : '<kbd>스페이스</kbd>'}로 한 닢씩 — 값과 같아지면 가만히 서서 셈`, done: () => misBought,
    at: () => (S.carry && S.carry !== 'bottle' ? null : misNear(MER.map((m, i) => (!S.mer[i].gone && offerOf(i) ? [m.x + 3.2, 16.5] : null)))), tag: () => (MER.some((m) => dist(S.px, S.pz, m.x + 3.2, 16.5) < 5) ? '' : '⚖ 여기 서서 은 올리기') },
  { t: '산 물건을 내 배에 싣기', how: '들고서 부두 동쪽 끝 내 배 건널 널 앞으로 걸어가면 싣는다', done: () => S.slots.length >= 1, at: () => (S.carry && IMP[S.carry] ? GANG : null), tag: '⛵ 여기로 가면 싣는다' },
  { t: '물이 빠지기 전에 다섯 칸 채우기', how: '팔고 → 사고 → 싣기를 되풀이 — 물때 깃발이 다 내려가기 전에', n: () => [S.slots.length, 5], done: () => S.slots.length >= 5 },
], { allText: '🎉 내 배가 가득 찼다!' });
function misWatch() { if (S.mode !== 'play' && S.mode !== 'sail') return; const c = S.carry;
  if (c && EXP[c]) misPicked = true; if (c && IMP[c]) misBought = true; if (misPrevCarry && EXP[misPrevCarry] && !c && S.silver > misPrevSilver) misSold = true;
  misPrevCarry = c; misPrevSilver = S.silver; }

resetRound(true); place(0.016); misClear();
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.horn(); };
runLoop((dt) => { update(dt); misWatch(); mis.update(dt, S.mode === 'play' || (S.mode === 'sail' && S.endT < 2.4)); }, view, () => renderer.render(scene, cam));
window.__scene = { S, update, keys, ctl, act, settle, offerOf, wantOf, atScale,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { let stuck = 0; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz), ox = S.px, oz = S.pz; ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - ox, S.pz - oz) < 0.005) { if (++stuck > 45) break; } else stuck = 0; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  const: { MER, PILES, BOTTLE, KILN, GANG, EXP, IMP } };
