/* 케이월드 · 장날 — 조선 후기 한 장면(S08, 2026-11-17). 본보기 = 그믐밤, 공통 부품 = ../scene/kit.js.
   목표는 하나(관아 북이 울리는 닷새째까지 세금 궤를 채우고 우리 집 쌀독도 남기기 — 화면 위 띠 둘)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 궤를 못 채우면 소를 끌려 보내고 다음 판 모내기가 빡빡하다.
   첫머리 모내기: 「심자!」에 맞춰 스페이스 여덟 번 — 맞춘 만큼 가을걷이가 는다. 끝나고 6초 안에 논 한쪽(담배 자리)에 서면 담배 한 뙈기(쌀 −3, 담배 +2).
   가을 닷새: 쌀을 지면 느리고 고개에서는 더 느리다(엽전은 무게가 없다). 장터 둘(우리 장 · 고개 너머 이웃 장)의 쌀·무명·담배 값이 다르고 날마다 바뀐다(장터 위 그림).
   관아에 갈 때마다 궤가 커진다(죽은 사람 몫·갓난아이 몫). 탈춤 날(사흘째) 우리 장 마당에서 구경하면 그날 값이 좋아진다.
   좌표: x 동쪽(+), z 남쪽(+). 서쪽 집과 논 → 가운데 우리 장(북쪽 관아) → 동쪽 고개 → 이웃 장. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, at, flatMaker, groundTex, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, runLoop, loadArt, ART, art, artOwn, artInst, artGeo, artMat, scatter, missions } from '../scene/kit.js?v=4';
await loadArt('people', 'nature', 'build', 'props', 'market');   /* 블렌더로 만든 모델(사람·자연·집·소품 + 이 장면만의 묶음 market.glb = tools/blender/make_market.py) */

const W = 96, H = 60, BX = [3, 93], BZ = [4, 56], DAYLEN = 40, DAYS = 5, FOOD = 5;
const HOME = [13, 25], JAR = [20.5, 28], JOUT = [18.9, 29.6], JIN = [22.1, 29.6], FIELD = [4, 36, 26, 54], TOB = [23.5, 51];
const MKT = [{ k: 'A', name: '우리 장', x: 44, z: 32 }, { k: 'B', name: '이웃 장', x: 84, z: 32 }];
const GOODS = { rice: { i: '🌾', n: '쌀', heavy: true, c: 0xe8dcc0 }, cloth: { i: '🧶', n: '무명', c: 0xf2f0e8 }, tob: { i: '🍂', n: '담배', c: 0x9a6a3a } };
const GKEYS = ['rice', 'cloth', 'tob'];
const BASE = { A: { rice: 1.5, cloth: 4.5, tob: 5 }, B: { rice: 3, cloth: 2.5, tob: 6.5 } };
const GOV = [44, 13], GOV_RICE = 1.5, MASK = [44, 40.5], PASS = [60, 72];
const SOLID = [[7, 20, 19, 25, 3, 'house'], [36, 3, 52, 10, 4, 'gov'], [40.5, 37.8, 47.5, 39.6, 1, 'stage']];
for (const m of MKT) for (let i = 0; i < 3; i++) SOLID.push([m.x - 5 + i * 4, m.z - 1.6, m.x - 3 + i * 4, m.z - 0.4, 1, 'stall']);
const seed0 = +(new URLSearchParams(location.search).get('seed') || (Date.now() % 100000));
const hillH = (x) => 3 * clamp(1 - Math.abs(x - 66) / 6, 0, 1);

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xf2d6b0, 90, 240], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x7a6a4a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff1d6, intensity: 2.1, box: [54, 36], far: 170, pos: [W / 2 - 34, 50, H / 2 + 30], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261124);
const sky = skyDome(scene, rnd, { top: 0x74aae8, low: 0xffe4bc });
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* 땅 · 논 · 길 · 고개 */
flat(-60, -40, W + 60, H + 40, 0x9ac25a, 0);
const paddy = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x0 = FIELD[0] + c * 7.4, z0 = FIELD[1] + r * 6; paddy.push(flat(x0, z0, x0 + 7, z0 + 5.6, 0x7ab0c8, 0.04)); }
/* 이웃 논(서쪽·남쪽, 거의 판 밖) — 우리 논과 같이 물빛·가을빛으로 바뀐다. farPad = 봄에는 먼저 심은 모, 가을에는 볏단을 세울 논 */
const farPad = []; for (let r = 0; r < 5; r++) for (let c = -3; c < 3; c++) { if (c >= 0 && r < 3) continue; const x0 = FIELD[0] + c * 7.4, z0 = FIELD[1] + r * 6; paddy.push(flat(x0, z0, x0 + 7, z0 + 5.6, 0x7ab0c8, 0.04)); if (c === -1 || (r === 3 && c >= 0)) farPad.push([x0, z0]); }
const crops = (nm, n, sh) => { const m = new THREE.InstancedMesh(artGeo(nm), artMat, n); m.count = 0; m.frustumCulled = false; m.castShadow = sh; m.receiveShadow = true; scene.add(m); return m; };
const seedlings = crops('crop_rice', 160, false), golden = crops('sheaf', 162, true);   /* 모(박자를 맞출 때마다 한 줄) · 가을걷이한 볏단(논마다 석 줄) */
const spring = new THREE.Group(), fall = new THREE.Group(); scene.add(spring, fall);   /* 철 따라 보이는 것: 봄 = 이웃 논의 모 · 가을 = 볏단·볏가리·가마니 */
flat(3, 29, 93, 31.4, 0xd8c498, 0.03); flat(42.8, 10, 45.2, 30, 0xd8c498, 0.03); flat(36, 31, 52, 44, 0xd2c094, 0.03); flat(76, 31, 92, 40, 0xd2c094, 0.03); flat(8, 25, 24, 31, 0xd2c094, 0.03);
/* 고개: 남북으로 뻗은 산줄기의 낮은 목. 판 안(z 2~58)에서는 hillH 그대로라 걷는 높이와 딱 맞고, 판 밖으로는 솔숲 산으로 솟는다. 길 띠는 흙빛. */
const ridge = (x, z) => { const o = z < 2 ? 2 - z : z > 58 ? z - 58 : 0; if (!o) return hillH(x); const k = clamp(o / 16, 0, 1), s = k * k * (3 - 2 * k); return (3 + (z < 2 ? 8.5 : 4) * s + Math.sin(x * 0.7 + z * 0.45) * 0.9 * s) * clamp(1 - Math.abs(x - 66 - Math.sin(z * 0.21) * 3 * s) / (6 + 8 * s), 0, 1); };
{ const xs = [], zs = [-40, -34, -28, -23, -18.5, -14.5, -11, -8, -5, -2, 0, 2, 4.25, 6.5, 8.75, 11, 13.25, 15.5, 17.75, 20, 22.25, 24.5, 26.75, 29, 31.4, 33.6, 35.8, 38, 40.2, 42.4, 44.6, 46.8, 49, 51.25, 53.5, 55.75, 58, 60, 62, 64, 66, 68.2, 70.5, 73, 76, 79.5, 83, 87.5, 92], P = [], C = [], U = [], c1 = new THREE.Color(), c2 = new THREE.Color(), hr = rng(661); for (let x = 48; x <= 84; x += 1.5) xs.push(x);
  const Y = (x, z) => { const h = ridge(x, z); return h > 0.001 ? h : -0.06; };
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) { const x0 = xs[i], x1 = xs[i + 1], z0 = zs[j], z1 = zs[j + 1], q = [[x0, z0], [x0, z1], [x1, z1], [x1, z0]].map(([x, z]) => [x, Y(x, z), z]); if (q.every((v) => v[1] < 0)) continue;
    const road = z0 > 28.9 && z1 < 31.5, hi = (q[0][1] + q[2][1]) / 2;
    for (const t of (i + j) % 2 ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 3], [1, 2, 3]]) { if (road) c1.set(0xd8c498).lerp(c2.set(0xc8b284), hr() * 0.5); else c1.set(0x8cb552).lerp(c2.set(hi > 4.5 ? 0x5a8446 : 0x7aa64a), hr() * (hi > 4.5 ? 1 : 0.55)); for (const k of t) { P.push(q[k][0], q[k][1], q[k][2]); C.push(c1.r, c1.g, c1.b); U.push(q[k][0] / 14, q[k][2] / 14); } } }
  const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ge.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); ge.computeVertexNormals();
  const m = new THREE.Mesh(ge, M(0xffffff, { vertexColors: true, map: groundTex() })); m.receiveShadow = true; scene.add(m); }
/* 먼 둔덕(판 밖 북쪽·옆) — 안개 너머 낮은 산 */
for (const [x, z, rx, h, rz, c] of [[-10, -36, 24, 9, 13, 0x7aa850], [20, -44, 28, 12, 14, 0x6f9c4c], [45, -38, 20, 8, 10, 0x7aa850], [94, -38, 26, 11, 13, 0x6f9c4c], [118, -14, 16, 9, 18, 0x7aa850], [-30, 14, 13, 8, 22, 0x6f9c4c], [122, 36, 13, 7, 24, 0x6f9c4c], [8, 96, 30, 6, 12, 0x7aa850], [96, 98, 28, 7, 12, 0x7aa850]]) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), M(c)); m.scale.set(rx, h, rz); m.position.set(x, -h * 0.22, z); m.rotation.y = x; scene.add(m); }
/* 꾸밈 도구: rd = 꾸밈만 쓰는 난수 · gy = 고개에서는 비탈 높이 · busy = 길·마당·논·집 자리(비워 둔다) · spots = 서로 떨어진 자리 고르기 · put = 이름 여럿을 번갈아 세우기 */
const rd = rng(8126), gy = (x, z) => Math.max(0, ridge(x, z) - 0.14);
const CLEAR = [[1, 28.3, 95, 32.1], [42, 9, 46, 30], [35.4, 30.4, 52.6, 44.6], [75.4, 30.4, 92.6, 40.6], [6, 18.6, 25, 31.6], [-19.2, 35.2, 26.6, 66.6], [23.5, -4, 56, 14.5]];
const HOUSES = [[8.5, -1, 0.15, 'thatch_b'], [19, -2.2, -0.1, 'thatch_a'], [-3.4, 11, Math.PI / 2, 'thatch_b'], [-4.2, 25.5, Math.PI / 2 - 0.12, 'thatch_a'], [79.5, -0.8, 0.1, 'thatch_b'], [89.5, -1.6, -0.12, 'thatch_a'], [98.6, 20, -Math.PI / 2, 'thatch_a'], [98, 32.5, -Math.PI / 2 + 0.1, 'thatch_b'], [99.2, 45, -Math.PI / 2 - 0.1, 'thatch_a'], [84, 61.5, Math.PI, 'thatch_b']];
const busy = (x, z, pad = 0) => CLEAR.some((r) => inRect(x, z, r, pad)) || SOLID.some((r) => inRect(x, z, r, 1 + pad)) || HOUSES.some((h) => Math.abs(h[0] - x) < 5 + pad && Math.abs(h[1] - z) < 5 + pad);
const inPlay = (x, z, pad = 0) => x > BX[0] - 1 - pad && x < BX[1] + 1 + pad && z > BZ[0] - 1 - pad && z < BZ[1] + 1 + pad;
const spots = (n, a, ok, gap = 3, sc = [0.85, 1.3]) => { const L = []; let t = 0; while (L.length < n && t++ < n * 40) { const x = a[0] + rd() * (a[2] - a[0]), z = a[1] + rd() * (a[3] - a[1]); if ((ok && !ok(x, z)) || busy(x, z, 0.6) || L.some((p) => Math.abs(p[0] - x) < gap && Math.abs(p[2] - z) < gap)) continue; L.push([x, gy(x, z), z, sc[0] + rd() * (sc[1] - sc[0]), rd() * 6.28]); } return L; };
const put = (names, L, far) => names.forEach((nm, k) => { const P = L.filter((_, i) => i % names.length === k), near = (t) => !far || inPlay(t[0], t[2], 6); artInst(scene, nm, P.filter(near)); artInst(scene, nm, P.filter((t) => !near(t)), {}, { shadow: false }); });   /* far = 판에서 먼 것은 그림자를 끈다(면 아끼기) */
const turn = (px, pz, r, lx, lz) => [px + lx * Math.cos(r) + lz * Math.sin(r), pz - lx * Math.sin(r) + lz * Math.cos(r)];
/* 고개의 솔숲: 길 북쪽은 키 큰 솔, 길 남쪽 가까이는 낮은 것만(아이를 가리지 않게), 고갯마루에는 서낭당 돌무더기와 서낭나무 */
put(['pine_a', 'pine_b', 'pine_a', 'tree_b'], spots(20, [58.6, 4.5, 73.4, 27], (x, z) => ridge(x, z) > 0.35 && Math.hypot(x - 66, z - 25.6) > 4.2, 2.3));
put(['pine_k', 'bush', 'stump', 'bush'], spots(9, [59.5, 33.4, 72.5, 42], (x, z) => ridge(x, z) > 0.35, 2.2, [0.7, 0.95]));
put(['pine_a', 'tree_a', 'pine_a'], spots(10, [58.6, 43.5, 73.4, 56], (x, z) => ridge(x, z) > 0.35, 2.6, [0.8, 1.1]));
put(['pine_b', 'pine_a', 'pine_a', 'tree_b', 'pine_b'], spots(26, [50, -30, 82, 1], (x, z) => ridge(x, z) > 1, 2.8, [0.9, 1.5]), true);
put(['pine_a', 'tree_a', 'pine_k'], spots(16, [52, 59.5, 80, 80], (x, z) => ridge(x, z) > 0.8, 2.8, [0.8, 1.15]), true);
artInst(scene, 'rock_b', [[63.2, gy(63.2, 27.9), 27.9, 0.9, 1], [69.6, gy(69.6, 28), 28, 0.75, 4], [61.3, gy(61.3, 32.9), 32.9, 0.6, 2.2], [70.8, gy(70.8, 33), 33, 0.7, 5], [67.6, gy(67.6, 36.5), 36.5, 0.9, 3], [64, gy(64, 22), 22, 1.1, 0.6]]);
artInst(scene, 'rock_tall', [[68.9, gy(68.9, 26.2), 26.2, 0.8, 0.4], [62.4, gy(62.4, 18), 18, 1, 2.6], [70.5, gy(70.5, 47), 47, 0.7, 1.2]]);
scene.add(at(art('cairn'), 65.6, 2.52, 27.3)); { const t = art('tree_big', { leaf: 0x4a8a44 }); t.position.set(66.8, 2.5, 24.6); t.rotation.y = 1.2; scene.add(t); }
/* 마을 어귀(고개 발치): 장승 한 쌍과 솟대 */
artInst(scene, 'jangseung', [[58.3, 0, 27.6, 1.05, 0.25], [58.5, 0, 32.9, 1, -0.2], [74.2, 0, 27.7, 1, -0.3]]);
artInst(scene, 'sotdae', [[57.2, 0, 27.2, 1, 0.4], [56.6, 0, 26.4, 0.86, 2.2], [74.9, 0, 26.9, 0.9, 1]]);
/* 판 밖 둘레: 이웃 초가(마을이 이어진다) · 숲 · 덤불 — 키 큰 것은 북쪽과 옆, 남쪽은 낮게 */
for (const [x, z, r, nm] of HOUSES) { const h = art(nm, { wall: 0xdccaa6 }); h.position.set(x, 0, z); h.rotation.y = r; scene.add(h); }
artInst(scene, 'fence', [[5, 0, 2.2, 1, 0], [8.1, 0, 2.2, 1, 0], [11.2, 0, 2.2, 1, 0], [16, 0, 1.4, 1, 0], [19.1, 0, 1.4, 1, 0], [22.2, 0, 1.4, 1, 0], [78, 0, 2.6, 1, 0], [81.1, 0, 2.6, 1, 0], [87, 0, 2, 1, 0], [90.1, 0, 2, 1, 0], [94.6, 0, 16.4, 1, Math.PI / 2], [94.6, 0, 23.6, 1, Math.PI / 2], [94.9, 0, 43.4, 1, Math.PI / 2], [94.9, 0, 49.6, 1, Math.PI / 2], [0.9, 0, 9.4, 1, Math.PI / 2], [0.9, 0, 12.5, 1, Math.PI / 2], [0.7, 0, 22, 1, Math.PI / 2]], {}, { shadow: false });
put(['pine_a', 'tree_a', 'pine_b', 'tree_b', 'tree_a', 'tree_big'], spots(34, [-16, -22, 112, 1.2], (x, z) => !(x > 49 && x < 83) && !(z > -6 && (x < 26 || x > 74) && x > -2 && x < 96), 3.4, [0.9, 1.4]), true);
put(['tree_a', 'pine_a', 'tree_b'], spots(12, [-18, 1.5, 0.6, 34], null, 3.4), true);
put(['tree_a', 'pine_a', 'tree_b', 'tree_big'], spots(16, [95.4, 2, 114, 60], null, 3.4), true);
put(['tree_a', 'bush', 'tree_a', 'pine_k'], spots(16, [28, 59, 114, 76], (x, z) => !(x > 50 && x < 82), 3.4, [0.8, 1.1]), true);
/* 판 안: 길·마당·논을 비우고 띄엄띄엄 — 나무는 길에서 먼 북쪽 풀밭에, 남쪽에는 낮은 나무만 */
artInst(scene, 'tree_a', [[28.6, 0, 12.4, 1.15, 0.5], [22.4, 0, 6.2, 1, 2.2], [53.2, 0, 18.4, 1.1, 4], [79, 0, 19.5, 1.1, 1.2], [30.4, 0, 47.2, 0.9, 3.3], [40.5, 0, 52.4, 0.85, 0.8], [80.5, 0, 48.6, 0.9, 5.2]]);
artInst(scene, 'tree_b', [[30.8, 0, 9.6, 1.05, 1.4], [55.6, 0, 21.2, 1, 0.3], [87.4, 0, 12.6, 1.1, 2.6], [50.8, 0, 50.4, 0.8, 1.9], [88.6, 0, 51.4, 0.82, 4.4]]);
artInst(scene, 'pine_k', [[34.2, 0, 17.4, 1.1, 0.4], [84.2, 0, 22.6, 1, 3.6], [6.2, 0, 8.4, 1.05, 5.5]]);
{ const t = art('tree_big'); t.position.set(1.4, 0, 16.6); t.rotation.y = 0.7; scene.add(t); }   /* 우리 집 뒤 느티나무(판 가장자리) */
artInst(scene, 'reed', [[27, 0, 37.2, 0.85, 0], [27.3, 0, 40.8, 0.7, 2], [26.9, 0, 45.4, 0.9, 4], [27.4, 0, 49.6, 0.75, 1], [27, 0, 53.4, 0.85, 3], [-19.6, 0, 40, 0.9, 1], [-19.4, 0, 52, 0.8, 5], [10, 0, 67, 0.8, 2], [22, 0, 67.2, 0.9, 4]], {}, { shadow: false });
scatter(scene, rd, { area: [-14, -12, 110, 72], n: 250, names: ['grass_a', 'grass_b', 'grass_a'], avoid: (x, z) => busy(x, z), scale: [1, 1.7], y: gy, shadow: false });
scatter(scene, rd, { area: [-6, -4, 102, 62], n: 70, names: ['flower_y', 'flower_w', 'flower_p'], avoid: (x, z) => busy(x, z), scale: [1.3, 2], y: gy, shadow: false });
scatter(scene, rd, { area: [-12, -10, 108, 70], n: 26, names: ['rock_a', 'rock_flat', 'rock_a'], avoid: (x, z) => busy(x, z, 1.2) || (inPlay(x, z) && inRect(x, z, [3, 25, 93, 38])), scale: [0.5, 1.05], y: gy, minGap: 4 });
scatter(scene, rd, { area: [-12, -10, 108, 70], n: 26, names: ['bush'], avoid: (x, z) => busy(x, z, 1.2) || (inPlay(x, z) && inRect(x, z, [3, 22, 93, 46])), scale: [0.7, 1.2], y: gy, minGap: 4 });
/* 철: 봄 = 이웃 논에 먼저 심은 모(줄 맞춰) · 가을 = 이웃 논의 볏단, 논 머리의 볏가리 */
artInst(spring, 'crop_rice', farPad.flatMap(([x0, z0]) => Array.from({ length: 28 }, (_, i) => [x0 + 0.7 + (i % 7) * 0.94, 0.04, z0 + 0.8 + Math.floor(i / 7) * 1.34, 1.1 + rd() * 0.25, rd() * 6.28])), {}, { shadow: false });
{ const r = art('motjul', {}, { shadow: false }); r.position.set(14.9, 0.04, 43.4); spring.add(r); }   /* 못줄 — 줄 맞춰 심는다 */
artInst(spring, 'crop_rice', Array.from({ length: 10 }, (_, i) => [5.2 + i * 2.2, 0.02, 41.8 + (i % 2) * 0.1, 1.1, i * 1.7]), {}, { shadow: false });   /* 논둑에 놓아 둔 모춤 */
artInst(fall, 'sheaf', farPad.flatMap(([x0, z0]) => Array.from({ length: 6 }, (_, i) => [x0 + 1.2 + (i % 3) * 2.3 + rd() * 0.4, 0.04, z0 + 1.6 + Math.floor(i / 3) * 2.4 + rd() * 0.4, 0.95 + rd() * 0.2, rd() * 6.28])), {}, { shadow: false });
artInst(fall, 'straw_stack', [[27.6, 0, 43.2, 1, 0.3], [5.2, 0, 24.6, 0.9, 1.2], [1.6, 0, 33.6, 1.05, 2]]);
artInst(fall, 'sack_pile', [[16.6, 0, 25.9, 0.9, 0.4]]); artInst(fall, 'scarecrow', [[11.2, 0, 41.8, 1, 0.3], [-3.6, 0, 47.8, 1, -0.4], [18.6, 0, 59.8, 1, 0.2]]);
/* 집 · 쌀독 · 관아 · 궤 · 장터 · 탈춤 마당 */
/* 우리 집: 초가 세 칸 + 헛간(막는 네모 [7,20,19,25] 안) · 뒤와 옆의 울타리 · 마당의 장독대·고추 멍석·닭 */
{ const h = artOwn('thatch_a', { wall: 0xf2e4c4 }); h.position.set(11.2, 0, 22); h.scale.setScalar(1.2); const sh = artOwn('shed'); sh.position.set(17.5, 0, 22.2); sh.scale.set(0.68, 0.8, 0.72); group([7, 20, 19, 25], [h, sh]); }
artInst(scene, 'firewood', [[17, 0, 22.9, 1, 0.1], [17.9, 0, 23, 0.9, 0.2]]); { const j = art('jige'); j.position.set(18.3, 0, 21.6); j.rotation.y = 0.5; scene.add(j); }
artInst(scene, 'fence', [[8.3, 0, 19.6, 1, 0], [11.4, 0, 19.6, 1, 0], [14.5, 0, 19.6, 1, 0], [17.6, 0, 19.6, 1, 0], [6.7, 0, 21.2, 1, Math.PI / 2], [6.7, 0, 24.3, 1, Math.PI / 2]], {}, { shadow: false });
{ const j = art('jangdok'); j.position.set(21.2, 0, 23.4); j.rotation.y = -0.12; scene.add(j); const m = art('meongseok', {}, { shadow: false }); m.position.set(11.6, 0.035, 27.3); m.rotation.y = 0.08; scene.add(m); const w = art('well'); w.position.set(29.6, 0, 25.4); w.rotation.y = 0.5; scene.add(w); }
artInst(scene, 'chicken', [[14.6, 0, 26.6, 1, 0.8], [15.5, 0, 27.3, 0.9, 3.6], [13.8, 0, 27.8, 1, 5.2]]); { const d = art('dog'); d.position.set(18.5, 0, 26.6); d.rotation.y = 0.9; scene.add(d); }
/* 쌀독: 넓적한 돌 위의 열린 독 — 쌀 더미(jarRice)가 독 안쪽 벽(JP = [높이, 안 반지름])을 따라 오르내린다 */
const JP = [[0.26, 0.3], [0.34, 0.5], [0.62, 0.63], [0.92, 0.65], [1.18, 0.56], [1.32, 0.47]], jarR = (y) => { for (let i = 0; i < JP.length - 1; i++) if (y <= JP[i + 1][0]) return lerp(JP[i][1], JP[i + 1][1], clamp((y - JP[i][0]) / (JP[i + 1][0] - JP[i][0]), 0, 1)) - 0.02; return 0.45; };
const jar = new THREE.Group(); jar.add(art('ssaldok')); const jarRice = art('rice_top', {}, { shadow: false }); jar.add(jarRice); jar.position.set(JAR[0], 0, JAR[1]); jar.rotation.y = 0.3; scene.add(jar);
const jarGlow = glowSprite(scene, 'rgba(255,246,220,.8)', 'rgba(255,220,150,0)', 2.6); jarGlow.position.set(JAR[0], 1.6, JAR[1]);
const mkPad = (p, c) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(p[0], 0.07, p[1]); scene.add(m); return m; };
mkPad(JOUT, 0xffcf4d); mkPad(JIN, 0x7ac0ff);
const cow = art('ox'); cow.position.set(7, 0, 28); cow.rotation.y = Math.PI / 2; scene.add(cow); { const t = art('trough'); t.position.set(9.4, 0, 26.9); t.rotation.y = 0.2; scene.add(t); }
/* 관아: 붉은 기둥 기와집(동헌) · 양옆 담과 뒤 곳간 · 앞길의 홍살문 · 깃발 · 세금 궤(엽전 더미 chestFill 이 차오른다) · 북 */
{ const h = artOwn('hall'); h.position.set(44, 0, 6); h.scale.set(1.08, 1, 1); group([36, 3, 52, 10], [h]); }
artInst(scene, 'wall_mud', [26.55, 30.65, 34.75, 53.25, 57.35].map((x) => [x, 0, 3, [1, 1.2, 1], 0]), { wall: 0xe2d4b6 });
artInst(scene, 'granary', [[29.6, 0, -1.8, 1, 0.06], [57.6, 0, -1.8, 1, -0.06]]);
scene.add(at(art('hongsal'), GOV[0], 0, 24));
artInst(scene, 'flag', [[37.3, 0, 10.7, 1.2, 0.2], [50.9, 0, 10.7, 1.2, -0.1]], { cloth: 0x2f4f96 });
const chest = new THREE.Group(); chest.add(art('gwe')); const chestFill = art('coins', {}, { shadow: false }); chest.add(chestFill); chest.position.set(GOV[0], 0, GOV[1] - 1.4); scene.add(chest);
const govDrum = art('drum'); govDrum.scale.setScalar(1.5); govDrum.position.set(49, 0, 11.5); govDrum.rotation.y = -0.15; scene.add(govDrum);
[[40.3, 10.9], [51.6, 11.9]].forEach(([x, z]) => { const g = person({ shirt: 0x3a4a7a, pants: 0x2a2a3a, hat: 'guard', mood: 'stern', spear: true }); g.position.set(x, 0, z); });
const officer = person({ shirt: 0x3a4a7a, pants: 0x2a2a3a, hat: 'gat', mood: 'stern' }); officer.position.set(46.4, 0, 11.2); officer.rotation.y = 0;
/* 장터: 천 지붕 좌판 셋(쌀 · 무명 · 담배 — 천 빛깔로 가린다)과 물건 · 옆의 가마니·광주리·옹기 · 장 깃발 */
const STALLC = [0xe9d9a6, 0xa9c0d8, 0xd29a6c];
GKEYS.forEach((g, i) => { artInst(scene, 'stall', MKT.map((m) => [m.x - 4 + i * 4, 0, m.z - 1.2, [0.74, 1, 1], 0]), { cloth: STALLC[i] }); artInst(scene, 'goods_' + g, MKT.map((m) => [m.x - 4 + i * 4, 0.8, m.z - 1, 1, 0]), {}, { shadow: false }); });
{ const rel = (list) => MKT.flatMap((m) => list.map(([dx, dz, s, r]) => [m.x + dx, 0, m.z + dz, s, r]));
  artInst(scene, 'sack_pile', rel([[-6.5, -1.5, 1, 0.3], [-2.1, -3.1, 0.8, 2]])); artInst(scene, 'sack', rel([[-6.3, -0.3, 1, 0.5], [-1.9, -2, 1, 1.3]]));
  artInst(scene, 'basket', rel([[-2, -1, 1, 0], [2.3, -1.4, 0.9, 1]])); artInst(scene, 'barrel', rel([[2, -2.7, 1, 0], [1.6, -0.8, 0.85, 1]]));
  artInst(scene, 'jar_a', rel([[5.6, -2.1, 0.9, 0], [6.9, -2.9, 1, 2]])); artInst(scene, 'jar_b', rel([[5.9, -1.1, 1, 0], [6.6, -0.6, 0.9, 1], [5.2, -0.5, 0.8, 3]])); artInst(scene, 'pot_plain', rel([[6.7, -1.6, 1, 0], [4.9, -1.3, 0.9, 2]]));
  artInst(scene, 'bundle', rel([[-5.5, -3, 1, 0.4], [3.1, -3.2, 0.9, 2]]), { cloth: 0x7a8fb0 }); }
const mktFlags = MKT.map((m) => { const f = art('flag', { cloth: 0xc0302a }); f.scale.setScalar(1.25); f.position.set(m.x + 7, 0, m.z - 2); scene.add(f); return f; });
/* 장 가장자리: 짐 실은 달구지 · 길손의 말 · 고추 멍석 난전 */
{ const C = [[34.3, 37.2, 0.35], [94.9, 36.6, -0.2]]; artInst(scene, 'cart', C.map(([x, z, r]) => [x, 0, z, 1, r])); artInst(scene, 'sack', C.flatMap(([x, z, r]) => [[0, 0.81, -0.5, 0], [0.05, 0.81, 0.45, 0.1], [0, 1.2, 0, 0.05]].map(([lx, y, lz, a]) => { const p = turn(x, z, r, lx, lz); return [p[0], y, p[1], 1, r + Math.PI / 2 + a]; })));
  const h = art('horse'), hp = turn(C[1][0], C[1][1], C[1][2], 0, 2.6); h.position.set(hp[0], 0, hp[1]); h.rotation.y = C[1][2]; scene.add(h); const m = art('meongseok', {}, { shadow: false }); m.position.set(50.1, 0.035, 42.5); m.rotation.y = 0.06; scene.add(m); }   /* 말은 이웃 장 달구지의 채 사이에 선다 */
scene.add(at(art('stage'), MASK[0], 0, MASK[1] - 1.8));
const dancers = [0, 1].map((i) => { const m = person({ shirt: i ? 0xe8e0d0 : 0xc0302a, pants: 0x3a3a3a, hat: i ? 'gat' : 'top' }); m.position.set(MASK[0] - 1.2 + i * 2.4, 0.4, MASK[1] - 1.8); m.rotation.y = 0; m.visible = false; return m; });
/* 차림(조선 후기): 농민 = 상투·머릿수건 · 아낙 = 쪽머리에 긴 치마 · 장꾼 = 패랭이 */
const WOMAN = { hat: 'bun', chima: true }, FOLK = [{ hat: 'top' }, { hat: 'scarf' }, { ...WOMAN, pants: 0x5a6a8a }, { hat: 'paeraengi' }, { hat: 'scarf' }, { ...WOMAN, pants: 0x8a5a52 }, { hat: 'top' }, { hat: 'paeraengi' }];
const crowd = Array.from({ length: 8 }, (_, i) => { const m = person({ shirt: [0xb89a70, 0xa89070, 0xc0a880, 0x9a8a68][i % 4], pants: 0x6a5034, ...FOLK[i] }); m.position.set(MASK[0] - 4 + (i % 4) * 2.6, 0, MASK[1] + 1 + Math.floor(i / 4) * 1.4); m.rotation.y = Math.PI; m.visible = false; return m; });
const sellers = MKT.flatMap((m) => [0, 1, 2].map((i) => { const p = person({ shirt: [0x9a7a5a, 0x7a8a6a, 0x8a6a5a][i], pants: 0x5a4a3a, ...(i === 1 ? WOMAN : { hat: 'paeraengi' }) }); p.position.set(m.x - 4 + i * 4, 0, m.z - 2.4); p.rotation.y = 0; return p; }));
MKT.forEach((m, i) => { const p = person({ shirt: i ? 0xa8946c : 0x8f8468, pants: 0x5a4a3a, hat: i ? 'scarf' : 'paeraengi' }); p.position.set(m.x + 6.1, 0, m.z - 3.2); p.rotation.y = -0.3; });   /* 옹기 장수 */
const neighbors = [0, 1, 2, 3, 4].map((i) => { const m = person({ shirt: [0xd8c8a0, 0xc8b890, 0xd0c098, 0xc0b088, 0xd8c8a0][i], pants: 0x6a5a3a, ...[{ hat: 'top' }, { hat: 'scarf' }, { hat: 'top' }, WOMAN, { hat: 'scarf' }][i] }); m.visible = false; return m; });
const tobPatch = flat(TOB[0] - 2, TOB[1] - 2, TOB[0] + 2, TOB[1] + 2, 0x6a5a2a, 0.06); tobPatch.visible = false;
const tobGlow = glowSprite(scene, 'rgba(255,240,180,.9)', 'rgba(255,200,90,0)', 3); tobGlow.position.set(TOB[0], 1.2, TOB[1]); tobGlow.visible = false;
const tobPlants = new THREE.Group(); artInst(tobPlants, 'tob_plant', Array.from({ length: 12 }, (_, k) => [TOB[0] - 1.35 + (k % 4) * 0.9 + rd() * 0.2, 0.04, TOB[1] - 1.1 + Math.floor(k / 4) * 1.1 + rd() * 0.2, 1.2 + rd() * 0.25, rd() * 6.28])); tobPlants.visible = false; scene.add(tobPlants);
/* 나 · 짐 */
const pMesh = person({ shirt: 0xe8e0c8, pants: 0x7a6a4a, hat: 'top' });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
/* 등짐: 지게에 얹은 쌀섬 · 무명 필 · 담뱃잎 묶음(무엇을 졌는지 모양으로 보인다) */
const PKG = { rice: artGeo('pk_rice'), cloth: artGeo('pk_cloth'), tob: artGeo('pk_tob') };
const packs = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(PKG.rice, artMat); m.castShadow = true; m.visible = false; scene.add(m); return m; });
const jige = art('jige'); jige.scale.setScalar(0.9); jige.visible = false; scene.add(jige);
const tagBox = $('tags'); const mkTag = () => { const d = document.createElement('div'); d.className = 'tag'; tagBox.appendChild(d); return d; };
const mktTags = MKT.map(mkTag), stallTags = MKT.map(() => [0, 1, 2].map(mkTag)), tagGov = mkTag(), tagJar = mkTag(), tagMask = mkTag(), tagTob = mkTag();

/* ───── 소리 ───── */
const SFX = {
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  coin: () => { tone(1800, 2200, 0.08, 'square', 0.05); tone(2400, 2600, 0.1, 'triangle', 0.07, 0.05); },
  thud: () => noise(0.12, 0.3, 260),
  drum: (v = 0.3) => { tone(70, 45, 0.6, 'sine', v); noise(0.25, v, 120); },
  plant: () => { noise(0.08, 0.25, 900); tone(520, 620, 0.1, 'triangle', 0.08); },
  miss: () => tone(260, 180, 0.2, 'sawtooth', 0.06),
  tick: () => tone(1400, 1400, 0.04, 'square', 0.03),
  song: () => { tone(392, 392, 0.2, 'triangle', 0.08); tone(440, 440, 0.2, 'triangle', 0.08, 0.22); },
  mask: () => { for (let i = 0; i < 6; i++) tone(500 + (i % 3) * 120, 500 + (i % 3) * 120, 0.12, 'square', 0.05, i * 0.16); },
  moo: () => { tone(160, 120, 0.8, 'sawtooth', 0.1); },
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  sad: () => { tone(330, 220, 1.0, 'sine', 0.14); tone(262, 175, 1.2, 'sine', 0.1, 0.4); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', round: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, day: 1, px: 14, pz: 46, pdir: -Math.PI / 2, moving: false, running: false, said: {}, sayT: 0,
  cow: true, beats: 0, hits: 0, bPh: 0.3, pressed: 0, plantT: 0, tob: false, harvest: 0, jar: 0, money: 0, carry: [], need: 14, paid: 0, visits: 0, inGov: false, outGovT: 99, coinDone: false, maskSeen: false, maskDay: 3,
  prices: null, lock: '', workT: 0, workKey: '', endT: 0, shown: false, introT: 0, beatT: 0, stepT: 0, sold: { A: 0, B: 0 } };
let mis = null;   /* 미션 카드(아래에서 만든다) */
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '먼저 모내기 — 「심자!」에 맞춰 「심기」 · 왼쪽 동그라미로 걷기 · 가만히 서면 꺼내고·팔고·사고·낸다 · 쌀을 지면 느리다 · 「시점」 ⟲⟳';
const _o = new THREE.Object3D();
function dayPrices(d) { const r = rng(seed0 * 11 + S.round * 7 + d * 131); const out = {}; for (const m of MKT) { out[m.k] = {}; for (const g of GKEYS) out[m.k][g] = Math.max(0.5, Math.round(BASE[m.k][g] * (0.8 + r() * 0.4) * 2) / 2); } return out; }
const sellP = (mk, g) => S.prices[mk][g] * (mk === 'A' && S.maskSeen && S.day === S.maskDay ? 1.25 : 1);
const buyP = (mk, g) => S.prices[mk][g] + 0.5;
const nRice = () => S.carry.filter((c) => c === 'rice').length;

function resetRound(full) {
  if (full) { S.round = 1; S.cow = true; }
  Object.assign(S, { mode: 'title', t: 0, day: 1, px: 14, pz: 46, pdir: -Math.PI / 2, beats: 0, hits: 0, bPh: 0.3, pressed: 0, plantT: 0, tob: false, harvest: 0, jar: 0, money: 0, carry: [], need: 16, paid: 0, visits: 0, inGov: false, outGovT: 99, coinDone: false, maskSeen: false, workT: 0, endT: 0, shown: false, sold: { A: 0, B: 0 } });
  S.prices = dayPrices(1); seedlings.count = 0; golden.count = 0; spring.visible = true; fall.visible = false; tobPatch.visible = tobGlow.visible = tobPlants.visible = false; cow.visible = S.cow; paddy.forEach((p) => p.material.color.set(0x7ab0c8));
  neighbors.forEach((m, i) => { m.visible = true; m.position.set(9 + i * 3, 0, 44); m.rotation.y = Math.PI; });
  $('fade').style.opacity = 0; lightFor(0); hud();
}
function hud() {
  const days = $('days').children; for (let i = 0; i < 5; i++) days[i].className = (i === 4 ? 'drum ' : '') + (i + 1 === S.day && S.mode === 'play' ? 'now' : i + 1 < S.day ? 'past' : '');
  $('mTax').querySelector('span').textContent = `${Math.floor(S.paid)}/${S.need}냥`; $('mTax').querySelector('i').style.width = clamp(S.paid / S.need, 0, 1) * 100 + '%';
  $('mJar').querySelector('span').textContent = `${S.jar}섬 (식구 ${FOOD})`; $('mJar').querySelector('i').style.width = clamp(S.jar / 14, 0, 1) * 100 + '%'; $('mJar').querySelector('s').style.left = (FOOD / 14) * 100 + '%';
  $('hMoney').textContent = '🪙 ' + S.money + '냥';
  const cnt = {}; for (const c of S.carry) cnt[c] = (cnt[c] || 0) + 1; $('hCarry').textContent = S.carry.length ? Object.entries(cnt).map(([k, n]) => GOODS[k].i + GOODS[k].n + ' ' + n).join(' · ') + ` (${S.carry.length}/4)` + (nRice() ? ' 🐢' : '') : '짐 없음 (0/4)';
  $('tCoin').className = S.coinDone ? 'on' : ''; $('tTob').className = S.tob ? 'on' : ''; $('tMask').className = S.maskSeen ? 'on' : '';
  { const y = 0.3 + clamp(S.jar / 14, 0, 1) * 0.98, r = jarR(y); jarRice.visible = S.jar > 0; jarRice.position.y = y; jarRice.scale.set(r, 1, r); } chestFill.visible = S.paid > 0; chestFill.position.y = 0.1 + clamp(S.paid / S.need, 0, 1) * 0.52;
  packs.forEach((m, i) => { const c = S.carry[i]; m.visible = !!c; if (c) m.geometry = PKG[c]; }); jige.visible = S.carry.length > 0;
}

/* ───── 모내기: 「심자!」에 맞춰 ───── */
const PLANT_P = () => (S.cow ? 1.0 : 0.85), PLANT_W = () => (S.cow ? 0.18 : 0.12);
function act() {
  if (S.mode !== 'plant' || S.beats >= 8) return;
  if (S.pressed) return; S.pressed = 1; const off = Math.min(S.bPh, 1 - S.bPh) * PLANT_P();
  if (off <= PLANT_W()) { S.hits++; SFX.plant(); const k = seedlings.count; for (let j = 0; j < 20 && seedlings.count < 160; j++) { _o.position.set(5 + (k / 20 % 8) * 2.55 + (j % 2) * 0.5, 0.04, 42.5 + Math.floor(j / 2) * 0.5 + (j % 2) * 0.2); _o.rotation.y = j * 1.3; _o.scale.setScalar(1.1); _o.updateMatrix(); seedlings.setMatrixAt(seedlings.count++, _o.matrix); } seedlings.instanceMatrix.needsUpdate = true; $('chant').textContent = '심자!'; }
  else { SFX.miss(); say('박자가 어긋났다 — 줄이 삐뚤어진다', null, 1.2); }
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) act(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });
canvas.addEventListener('pointerdown', () => { if (S.mode === 'intro') S.introT = 99; });
function startAutumn() {
  S.harvest = 7 + S.hits; let rice = S.harvest; S.carry = []; if (S.tob) { rice -= 3; S.carry = ['tob', 'tob']; tobPlants.visible = true; }
  S.jar = rice; S.mode = 'fadeA'; S.endT = 0; $('fade').style.opacity = 1;
}
function autumnNow() { golden.count = 0; for (let i = 0; i < 162; i++) { const p = i % 9, k = Math.floor(i / 9), x = FIELD[0] + (p % 3) * 7.4 + 0.75 + (k % 6) * 1.1 + rnd() * 0.24, z = FIELD[1] + Math.floor(p / 3) * 6 + 0.9 + Math.floor(k / 6) * 1.85 + rnd() * 0.24; if (S.tob && Math.abs(x - TOB[0]) < 2.4 && Math.abs(z - TOB[1]) < 2.4) continue; _o.position.set(x, 0.04, z); _o.rotation.y = rnd() * 6.28; _o.scale.setScalar(0.92 + rnd() * 0.2); _o.updateMatrix(); golden.setMatrixAt(golden.count++, _o.matrix); } golden.instanceMatrix.needsUpdate = true; seedlings.count = 0; spring.visible = false; fall.visible = true; paddy.forEach((p) => p.material.color.set(0x9a8a5a)); neighbors.forEach((m) => (m.visible = false));
    S.px = JAR[0]; S.pz = JAR[1] + 3.2; S.t = 0; S.day = 1; S.prices = dayPrices(1); S.mode = 'play'; $('fade').style.opacity = 0; hud(); say(`가을걷이 ${S.harvest}섬${S.tob ? ' (담배 두 짐)' : ''} — 닷새 뒤 관아 북이 울린다`, null, 3.6);
}

/* ───── 끝 ───── */
function finish() {
  S.mode = 'end'; S.endT = 0; SFX.drum(0.45); setTimeout(() => SFX.drum(0.45), 500); setTimeout(() => SFX.drum(0.45), 1000);
  const taxOk = S.paid >= S.need; S.result = !taxOk ? 'cow' : S.jar >= FOOD + 2 ? 'plenty' : S.jar >= FOOD ? 'barely' : 'labor';
  say('둥 둥 둥 — 관아 북이 울린다', null, 2.6); if (!taxOk) setTimeout(SFX.moo, 1600);
}
function endScreen() {
  const r = S.result, head = { plenty: '넉넉히 남겼다', barely: '겨우 넘겼다', labor: '품을 팔게 됐다', cow: '소를 끌려 보냈다' }[r];
  const story = { plenty: `궤를 다 채우고도 쌀독에 ${S.jar}섬이 남았다. 겨울이 든든하다.`, barely: `궤는 채웠고 쌀독에 ${S.jar}섬. 아껴 먹으면 봄까지 간다.`, labor: `궤는 채웠지만 쌀독에 ${S.jar}섬뿐 — <b>봄까지 남의 집 품을 팔아야 한다.</b>`, cow: `궤를 다 못 채웠다(${Math.floor(S.paid)}/${S.need}냥). 관아에서 <b>소를 끌어갔다.</b>` }[r];
  const marks = `<div class="marks"><span class="ok">🌾 걷은 쌀 ${S.harvest}섬</span><span class="${S.coinDone ? 'ok' : ''}">🪙 ${S.coinDone ? '엽전으로 바꿈' : '엽전 안 씀'}</span><span class="${S.tob ? 'ok' : ''}">🚬 ${S.tob ? '담배밭' : '담배 없음'}</span><span class="${S.maskSeen ? 'ok' : ''}">🎭 ${S.maskSeen ? '탈춤 구경' : '탈춤 못 봄'}</span></div>`;
  const extra = `<p class="keys">관아에 ${S.visits}번 갔고, 갈 때마다 궤가 커졌다(16 → ${S.need}냥).</p>`;
  const facts = `<div class="fact">📜 <b>모내기</b> — 모를 길러 옮겨 심는 방법이 퍼져 일손은 줄고 거두는 것은 늘었다. 넓게 짓는 사람과 땅을 잃는 사람이 갈렸다.<br>📜 <b>장과 돈</b> — 닷새마다 서는 장이 온 나라에 생기고, 상평통보라는 돈이 널리 쓰였다.<br>📜 <b>팔려고 짓는 농사</b> — 담배·인삼·목화처럼 팔기 위한 작물을 길렀다.<br>📜 <b>무거운 세금</b> — 세금이 제멋대로 얹혀 살기 어려워진 농민들이 여러 곳에서 들고일어났다.</div>`;
  if (r !== 'cow') overlay(`<h1>${head}</h1><p>${story}</p>${marks}${extra}<p class="keys">같은 마을에서도 누구는 땅을 늘리고, 누구는 땅을 잃었다.</p>${facts}`, '이듬해 한 번 더', () => { misClear(); resetRound(false); S.mode = 'title'; begin(); });
  else overlay(`<h1>${head}</h1><p>${story}</p>${marks}${extra}<p>이듬해 — <b>소가 없어</b> 모내기 박자가 빡빡하다.</p>`, '이듬해 모내기', () => { S.round++; S.cow = false; resetRound(false); begin(); });
}

/* ───── 하늘(하루씩 돈다) ───── */
const SKY = [[0, 0x8ab8e8, 0xffe8c0, 0xfff1d6, 2.0, 1.3], [0.5, 0x74aae8, 0xffe4bc, 0xfff1d6, 2.2, 1.35], [0.85, 0x6a7ab0, 0xffb07a, 0xffb878, 1.6, 1.05], [1.0, 0x3a3a78, 0xd8605a, 0xff8050, 0.9, 0.7]];
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); let lastSky = -1;
function lightFor(k) { let a = SKY[0], b = SKY[SKY.length - 1]; for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = clamp((k - a[0]) / ((b[0] - a[0]) || 1), 0, 1); cT.set(a[1]).lerp(tc.set(b[1]), t); cL.set(a[2]).lerp(tc.set(b[2]), t);
  if (Math.abs(k - lastSky) > 0.006) { sky.paint(cT, cL); lastSky = k; } scene.fog.color.copy(cL); sun.color.set(a[3]).lerp(tc.set(b[3]), t); sun.intensity = lerp(a[4], b[4], t); hemi.intensity = lerp(a[5], b[5], t);
  const az = lerp(-0.6, 3.6, clamp(k, 0, 1)), el = 0.25 + Math.sin(clamp(k, 0, 1) * Math.PI) * 0.8; sun.position.set(W / 2 + Math.cos(az) * Math.cos(el) * 70, Math.sin(el) * 70 + 4, H / 2 + Math.sin(az) * Math.cos(el) * 40 + 20); }

/* ───── 한 걸음 ───── */
const v3 = new THREE.Vector3();
function showTag(el, x, y, z, html) { if (!html) { el.style.display = 'none'; return; } const q = v3.set(x, y, z).project(cam); if (q.z > 1) { el.style.display = 'none'; return; } el.style.display = 'block'; el.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; el.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; if (el._h !== html) { el.innerHTML = html; el._h = html; } }
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  jarGlow.material.opacity = 0.5 + Math.sin(S.t * 3) * 0.2; tobGlow.material.opacity = 0.6 + Math.sin(S.t * 4) * 0.25;
  mktFlags.forEach((f, i) => (f.rotation.y = Math.sin(S.t * 3 + i) * 0.2));
  if (S.mode === 'title') { place(); return; }
  if (S.mode === 'intro') { S.introT += dt; if (S.introT > 3) { S.mode = 'plant'; S.bPh = 0.3; say('줄 맞춰 모를 심는다 — 「심자!」에 맞춰 스페이스', null, 3); } place(); return; }
  if (S.mode === 'plant') {
    const P = PLANT_P(), ph0 = S.bPh; if (S.beats < 8) { S.bPh = (S.bPh + dt / P) % 1; if (ph0 < 0.5 && S.bPh >= 0.5) { SFX.song(); $('chant').textContent = '어—'; } if (S.bPh < ph0) { SFX.tick(); } if (ph0 < 0.25 && S.bPh >= 0.25) { if (S.t > 1) S.beats++; S.pressed = 0; } }
    const bt = $('beat'); bt.style.display = S.beats < 8 ? 'flex' : 'none'; if (S.beats < 8) { const lane = bt.querySelector('.lane'), w = lane.clientWidth, ww = (PLANT_W() / P) * w, wn = bt.querySelector('.win'); bt.querySelector('.dot').style.left = ((S.bPh + 0.5) % 1) * w + 'px'; wn.style.left = (w / 2 - ww) + 'px'; wn.style.width = 2 * ww + 'px'; }
    neighbors.forEach((m, i) => { m.rotation.x = Math.max(0, 0.6 - S.bPh * 2) * 0.6; });
    if (S.beats >= 8) { if (!S.plantT) { S.plantT = 0.001; tobPatch.visible = tobGlow.visible = true; say(`모내기 끝 — ${S.hits}/8 줄이 곧다. 논 한쪽(빛나는 곳)에 서면 담배를 심는다`, null, 3.6); }
      S.plantT += dt; movePlayer(dt);
      if (!S.tob && dist(S.px, S.pz, TOB[0], TOB[1]) < 1.8 && !S.moving) { S.workT += dt; overBar($('work'), cam, S.px, 2.6, S.pz, S.workT / 1.2); if (S.workT > 1.2) { S.tob = true; S.workT = 0; tobPatch.visible = false; tobGlow.visible = false; tobPlants.visible = true; SFX.pick(); say('담배 한 뙈기 — 값은 좋지만 먹을 수는 없다', null, 2.6); } } else { S.workT = 0; overBar($('work'), cam, 0, 0, 0, null); }
      if (S.plantT > 7 || (S.tob && S.plantT > 2.5)) startAutumn(); }
    place(); return;
  }
  if (S.mode === 'fadeA') { S.endT += dt; if (S.endT > 1.3) autumnNow(); place(); return; }
  if (S.mode === 'end') { S.endT += dt; if (!S.result || S.result === 'cow') cow.position.x = lerp(cow.position.x, 40, dt * 0.3); if (S.endT > 3.5 && !S.shown) { S.shown = true; endScreen(); } place(); return; }
  if (S.mode !== 'play') return;

  /* 날짜 */
  const d = Math.min(DAYS, Math.floor(S.t / DAYLEN) + 1); if (d !== S.day) { S.day = d; S.prices = dayPrices(d); SFX.drum(0.2); say(d === DAYS ? '닷새째 — 저녁에 관아 북이 울린다!' : d === S.maskDay ? `${d}일째 — 우리 장 마당에서 탈춤이 열린다` : `${d}일째 — 장마다 값이 바뀌었다`, null, 2.8); hud(); }
  lightFor((S.t % DAYLEN) / DAYLEN); if (S.t >= DAYS * DAYLEN) return finish();
  dancers.forEach((m) => (m.visible = S.day === S.maskDay)); crowd.forEach((m) => (m.visible = S.day === S.maskDay)); if (S.day === S.maskDay) dancers.forEach((m, i) => { m.rotation.y = Math.sin(S.t * 3 + i) * 0.8; m.position.y = 0.4 + Math.abs(Math.sin(S.t * 5 + i)) * 0.3; });

  movePlayer(dt);
  /* 가만히 서서: 쌀독 · 장터 칸 · 관아 궤 · 탈춤 */
  let job = null, need = 1, arg = null;
  if (dist(S.px, S.pz, JIN[0], JIN[1]) < 1.1 && nRice()) { job = 'jarIn'; need = 0.4; }   /* 오른쪽 = 붓는 자리 */
  if (!job && dist(S.px, S.pz, JOUT[0], JOUT[1]) < 1.1 && S.jar > 0 && S.carry.length < 4) { job = 'jarOut'; need = 0.5; }   /* 왼쪽 = 꺼내는 자리 */
  let atStall = null;
  MKT.forEach((m) => GKEYS.forEach((g, i) => { const sx = m.x - 4 + i * 4, sz = m.z + 0.6; if (!job && dist(S.px, S.pz, sx, sz) < 1.5) { atStall = m.k + g;
    if (S.stallKey !== atStall) { S.stallKey = atStall; S.stallMode = S.carry.includes(g) ? 'sell' : 'buy'; }   /* 가판대에 선 순간 팔지 살지 정하고, 떠날 때까지 그대로 */
    if (S.stallMode === 'sell' && S.carry.includes(g)) { job = 'sell'; need = 0.45; arg = [m.k, g]; } else if (S.stallMode === 'buy' && S.money >= buyP(m.k, g) && S.carry.length < 4) { job = 'buy'; need = 0.6; arg = [m.k, g]; } } }));
  if (!atStall) S.stallKey = null;
  const atGov = dist(S.px, S.pz, GOV[0], GOV[1]) < 3.4;
  if (atGov && !S.inGov) { S.inGov = true; if (S.outGovT > 4) { S.visits++; S.need++; SFX.drum(0.25); say(S.visits % 2 ? '아전: "죽은 할아버지 몫도 내야지." — 궤가 1냥 커졌다' : '아전: "갓난아이 몫도 얹었네." — 궤가 1냥 커졌다', null, 3); hud(); } }
  if (!atGov && S.inGov) { S.inGov = false; S.outGovT = 0; } if (!atGov) S.outGovT += dt;
  if (!job && atGov && S.paid < S.need && (S.money > 0 || nRice())) { job = 'pay'; need = 0.3; }
  if (!job && S.day === S.maskDay && !S.maskSeen && dist(S.px, S.pz, MASK[0], MASK[1] + 1.4) < 2.4) { job = 'mask'; need = 2.6; }
  if (S.moving) S.lock = '';
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  overBar($('work'), cam, S.px, 2.6 + hillH(S.px), S.pz, job && S.workT > 0.05 ? S.workT / need : null);
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'jarIn') { S.carry.splice(S.carry.indexOf('rice'), 1); S.jar++; SFX.thud(); }
    if (job === 'jarOut') { S.jar--; S.carry.push('rice'); SFX.thud(); say('쌀 한 섬을 졌다 — 지면 느리다', 'jarOut', 2); }
    if (job === 'sell') { const [mk, g] = arg, p = sellP(mk, g); S.carry.splice(S.carry.indexOf(g), 1); S.money = Math.round((S.money + p) * 2) / 2; S.sold[mk]++; S.lock = mk + g; if (g === 'rice' && !S.coinDone) { S.coinDone = true; say('쌀을 상평통보로 바꿨다 — 엽전은 무게가 없다', null, 2.8); } SFX.coin(); }
    if (job === 'buy') { const [mk, g] = arg, p = buyP(mk, g); S.money = Math.round((S.money - p) * 2) / 2; S.carry.push(g); SFX.pick(); }
    if (job === 'pay') { const left = S.need - S.paid; if (S.money >= 1) { const x = Math.min(1, S.money, left); S.money = Math.round((S.money - x) * 2) / 2; S.paid += x; } else if (S.money > 0) { const x = Math.min(S.money, left); S.money -= x; S.paid += x; } else if (nRice()) { S.carry.splice(S.carry.indexOf('rice'), 1); S.paid += GOV_RICE; } SFX.coin(); if (S.paid >= S.need) say('궤를 다 채웠다! — 이제 쌀독을 지키자', null, 2.8); }
    if (job === 'mask') { S.maskSeen = true; SFX.mask(); say('양반을 놀리는 탈춤 — 장꾼들이 몰려 오늘 우리 장 값이 좋아졌다', null, 3.2); }
    hud(); }
  place();

  /* 조임 */
  const k = S.t / (DAYS * DAYLEN), late = clamp((k - 0.7) * 3.3, 0, 1), behind = S.paid < S.need ? clamp((k - 0.4) * 2 * (1 - S.paid / S.need), 0, 0.6) : 0;
  const tension = Math.max(late, behind); S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.4, tension); SFX.beat(0.06 + tension * 0.26); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(160,40,30,${tension * 0.45})`;
}
function movePlayer(dt) {
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const r = nRice(), onHill = S.px > PASS[0] && S.px < PASS[1];
    const sp = (S.running ? 4.7 : 3.1) * (back ? 0.6 : 1) * (1 - 0.2 * r) * (onHill && r ? 0.5 : 1);
    const [nx, nz] = collideRects(SOLID, S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); if (S.view !== 2) S.pdir = Math.atan2(iz, ix);
    if (onHill && r) say('쌀을 지고 고개를 넘자니 숨이 찬다 — 엽전이면 가볍다', 'hill', 2.6);
    S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; noise(0.05, 0.05 + r * 0.03, 300 - r * 40); } }
}
function place() {
  const y = hillH(S.px); pMesh.position.set(S.px, y, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10) * (1 - 0.15 * nRice()), S.moving); pMesh.rotation.z = nRice() && S.moving ? Math.sin(S.t * 6) * 0.05 : 0; pRing.position.set(S.px, y + 0.11, S.pz);
  packs.forEach((m, i) => { m.position.set(S.px - Math.cos(S.pdir) * 0.52, y + 1.0 + i * 0.4, S.pz - Math.sin(S.pdir) * 0.52); m.rotation.y = pMesh.rotation.y; }); jige.position.set(S.px - Math.cos(S.pdir) * 0.34, y + 0.34, S.pz - Math.sin(S.pdir) * 0.34); jige.rotation.y = pMesh.rotation.y + Math.PI;
  if (S.mode === 'plant' && S.beats < 8) { pMesh.position.set(14, 0, 44); pMesh.rotation.y = Math.PI; pMesh.rotation.x = Math.max(0, 0.6 - S.bPh * 2) * 0.6; pRing.position.set(14, 0.11, 44); } else pMesh.rotation.x = 0;
  $('bAct').style.display = ctl.isTouch && S.mode === 'plant' && S.beats < 8 ? 'flex' : 'none';
  const play = S.mode === 'play';
  MKT.forEach((m, mi) => { showTag(mktTags[mi], m.x, 4.2, m.z - 2, play && dist(S.px, S.pz, m.x, m.z) < 26 ? `${m.name}${m.k === 'A' && S.day === S.maskDay ? ' 🎭' : ''}<br>${GKEYS.map((g) => `${GOODS[g].i}<b>${sellP(m.k, g)}</b>`).join(' ')}` : null);
    GKEYS.forEach((g, i) => { const sx = m.x - 4 + i * 4, d = dist(S.px, S.pz, sx, m.z + 0.6); showTag(stallTags[mi][i], sx, 2.6, m.z - 1, play && d < 3.2 ? (S.carry.includes(g) ? `${GOODS[g].i} 팔면 <b class="up">+${sellP(m.k, g)}</b>` : `${GOODS[g].i} 사면 <b class="dn">−${buyP(m.k, g)}</b>`) : null); }); });
  showTag(tagGov, GOV[0], 3.2, GOV[1] - 1.4, play && dist(S.px, S.pz, GOV[0], GOV[1]) < 12 ? `🧰 ${Math.floor(S.paid)}/${S.need}냥 <small>(쌀은 한 섬 ${GOV_RICE}냥)</small>` : null);
  showTag(tagJar, JAR[0], 2.4, JAR[1], play && dist(S.px, S.pz, JAR[0], JAR[1]) < 9 ? `🟡⬆꺼내기 · 🏺 <b>${S.jar}</b>섬 · 붓기⬇🔵` : null);
  showTag(tagMask, MASK[0], 3.4, MASK[1] - 1.8, play && S.day === S.maskDay && !S.maskSeen && dist(S.px, S.pz, MASK[0], MASK[1]) < 14 ? '🎭 구경' : null);
  showTag(tagTob, TOB[0], 1.6, TOB[1], S.mode === 'plant' && S.beats >= 8 && !S.tob ? '🚬 여기 가만히 서면 담배 심기' : null);   /* 처음 보는 자리(11-18) — 모내기 뒤 몇 초만 */
}
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { cam.position.set(30, 18, 64); cam.lookAt(28, 0, 36); if (cam.fov !== 44) { cam.fov = 44; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'plant' && S.beats < 8) { v3.set(14, 9, 56); cam.position.lerp(v3, 0.08); cam.lookAt(14, 0, 43); if (cam.fov !== 44) { cam.fov = 44; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'end') { v3.set(44, 14, 30); cam.position.lerp(v3, 0.03); cam.lookAt(44, 2, 10); }
  else followCam(cam, S, { W, H, map: { h: [104, 190], z: 8, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  edgeGoal($('goal'), cam, v3.set(S.paid < S.need ? GOV[0] : JAR[0], 2, S.paid < S.need ? GOV[1] - 1.4 : JAR[1]).clone(), S.mode === 'play', 0.8);
}
function begin() { S.mode = 'intro'; S.introT = 0; }

/* ───── 미션(11-18): 지금 할 일 하나 — 무엇을·어떻게·어디서. 쌀독 자리·좌판·궤에는 장면의 꼬리표가 가까이 가면 뜨니, 빛기둥은 멀리 있을 때만 ───── */
let misTook = false, misTrade = false, misJar = 0, misRice = 0, misCnt = {}, misBought = {};
function misClear() { if (mis) mis.reset(); misTook = misTrade = false; misJar = misRice = 0; misCnt = {}; misBought = {}; }
const stallAt = (mk, g) => { const m = MKT.find((q) => q.k === mk); return [m.x - 4 + GKEYS.indexOf(g) * 4, m.z + 0.6]; };
const nearMkt = (k, r = 12) => MKT.some((m) => (!k || m.k === k) && dist(S.px, S.pz, m.x, m.z) < r);
const KEY = (tc, t) => (tc ? `「${t}」` : '<kbd>스페이스</kbd>');
mis = missions(scene, cam, [
  { t: '「심자!」에 맞춰 모 심기', how: (tc) => `흰 점이 노란 칸 한가운데 올 때 ${KEY(tc, '심기')} — 맞춘 만큼 가을걷이가 는다`, n: () => [S.hits, 3], done: () => S.hits >= 3 || S.beats >= 8 },
  { t: '쌀독에서 쌀 지기', how: '쌀독 왼쪽 노란 자리에 가만히 서면 한 섬씩 진다(넷까지) · 지면 느리다', done: () => misTook },
  { t: '장에서 팔기', how: '진 것을 들고 장터 좌판 앞에 가만히 서면 판다 — 좌판 위 그림이 값', done: () => S.sold.A + S.sold.B > 0,
    at: () => { const g = S.carry[0]; return g && !nearMkt() ? stallAt('A', g) : null; }, tag: () => (S.carry[0] ? `${GOODS[S.carry[0]].i} 우리 장 좌판 앞에 서기` : '') },
  { t: '관아 궤에 세금 내기', how: '엽전이나 쌀을 지고 관아(북쪽 홍살문 안) 궤 앞에 가만히 서면 낸다', done: () => S.paid > 0,
    at: () => ((S.money > 0 || nRice()) && dist(S.px, S.pz, GOV[0], GOV[1]) > 12 ? [GOV[0], GOV[1] + 0.5] : null), tag: '🧰 궤 앞에 서기' },
  { t: '고개 너머 이웃 장에서 팔기', how: '동쪽 고개를 넘어 이웃 장 좌판에 서기 — 쌀은 대개 이웃 장이 비싸다 · 쌀을 지면 고개가 느리다', done: () => S.sold.B > 0,
    at: () => (!nearMkt('B', 14) ? [MKT[1].x, MKT[1].z + 1] : null), tag: '⛰ 고개 너머 이웃 장' },
  { t: '싼 장에서 사서 비싼 장에 팔기', how: '엽전을 들고 좌판에 서면 산다 — 두 장의 값을 견주어 싼 데서 사서 비싼 데서 팔기', done: () => misTrade,
    at: () => { const g = S.carry.find((c) => misBought[c]); if (!g) return null; const k = misBought[g] === 'A' ? 'B' : 'A'; return nearMkt(k) ? null : stallAt(k, g); }, tag: () => { const g = S.carry.find((c) => misBought[c]); return g ? `${GOODS[g].i} ${misBought[g] === 'A' ? '이웃 장' : '우리 장'}에서 팔기` : ''; } },
  { t: '북이 울리기 전에 궤 채우기', how: '닷새째 저녁까지 궤를 다 채우기 · 관아에 갈 때마다 궤가 커지니 모아서 한 번에', n: () => [Math.floor(S.paid), S.need], done: () => S.paid >= S.need },
], { allText: '🎉 궤를 채웠다!', allHow: '이제 쌀독을 식구 몫(5섬) 넘게 지키자' });
function misWatch() { if (S.mode !== 'play') return; const r = nRice(); if (r > misRice && S.jar < misJar) misTook = true; misRice = r; misJar = S.jar;
  const cnt = {}; for (const c of S.carry) cnt[c] = (cnt[c] || 0) + 1;
  for (const g of GKEYS) { const a = misCnt[g] || 0, b = cnt[g] || 0, at = S.stallKey && S.stallKey.slice(1) === g ? S.stallKey[0] : null; if (at && b > a) misBought[g] = at; if (at && b < a && misBought[g] && misBought[g] !== at) misTrade = true; if (!b) delete misBought[g]; }
  misCnt = cnt; }

resetRound(true); place();
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; begin(); SFX.song(); };
runLoop((dt) => { update(dt); misWatch(); mis.update(dt, (S.mode === 'plant' && S.beats < 8) || S.mode === 'play' || (S.mode === 'end' && S.endT < 2)); }, view, () => renderer.render(scene, cam));
window.__scene = { S, update, keys, ctl, act, sellP, buyP, nRice,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 160) { let t = 0; for (const [x, z] of pts) { let stuck = 0; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz), ox = S.px, oz = S.pz; ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - ox, S.pz - oz) < 0.003) { if (++stuck > 45) break; } else stuck = 0; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  plant(hits, tob) { /* 시험용: 모내기를 정한 만큼 맞추고 담배 여부 */ let h = 0; for (let g = 0; g < 30 * 14 && S.mode === 'plant' && S.beats < 8; g++) { update(1 / 60); if (h < hits && !S.pressed && Math.abs(S.bPh - 0) < 0.02) { act(); h++; } } if (tob) { S.px = TOB[0]; S.pz = TOB[1]; } for (let g = 0; g < 30 * 9 && S.mode === 'plant'; g++) { ctl.sx = ctl.sz = 0; update(1 / 30); } for (let g = 0; g < 80 && S.mode !== 'play'; g++) { update(1 / 30); } },
  const: { JAR, JOUT, JIN, MKT, GOV, MASK, TOB, PASS, FOOD } };
