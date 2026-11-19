/* 시간 탐험대 · 조선 후기 「다섯 해」 — 큰 판(2026-11-19). 공통 부품 = ../scene/kit.js.
   준호(11-19): 「조선 후기에 부농이 생기잖아. 왜 부농이 된 거야? 모내기에 따른 것들도 있잖아. 역사 내용을 최대한 반영하고, 한 시대 안에서도 확장을 많이.
   맵을 진짜 크게, 실제 게임 수준으로, 긴장감 돌면서」.
   한 줄: 다섯 해 뒤, 우리 집은 어떤 집이 되어 있을까 — 부농 · 제 땅 짓는 집 · 남의 땅 짓는 집 · 고을을 떠난 집.
   한 해 = 네 철(봄 씨뿌리기/모내기 · 여름 김매기와 보 · 가을 거두고 팔고 세금 · 겨울 살림 정하기). 철마다 마감이 있다.
   역사: 모내기(품이 줄어 넓게 짓는다 · 가뭄에 약하다 → 보) · 넓게 짓기(남의 땅 빌려 짓기 — 반씩/정해진 만큼) · 팔려고 짓는 담배 · 장마다 다른 값 ·
         군포(갓난아기·죽은 사람 몫) · 이름 없는 임명장으로 양반 되기 · 땅을 잃고 떠나는 이웃(내가 넓힌 만큼 누군가는 잃는다).
   좌표: x 동쪽(+), z 남쪽(+). 서쪽 우리 마을 → 가운데 들 → 동쪽 읍내 → 고개 너머 이웃 고을 장. 남쪽 강과 포구. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, flatMaker, skyDome, ringsFx, people, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, edgeGoal, overBar, runLoop, loadArt, art, artInst, scatter, missions } from '../scene/kit.js?v=5';
await loadArt('people', 'nature', 'build', 'props', 'market', 'night');

const W = 380, H = 240;
const seed0 = +(new URLSearchParams(location.search).get('seed') || (Date.now() % 100000));
const SEASONS = ['봄', '여름', '가을', '겨울'], SLEN = [80, 84, 124, 52], YEARS = 5;
const HOME = [46, 150], GRAN = [53, 145], SEED = [50, 157], NURS = [37, 161], TOBS = [43, 165], DOOR = [44, 147];
const BO = [150, 47], LORD = [226, 66], TOWN = [250, 128], GWE = [271, 104], PAPER = [281, 110], OX = [263, 142], CLOTH = [240, 120];
const PASS = [302, 128], NEXT = [346, 128], PORT = [262, 207], PEDD = [62, 138];
/* 값 */
const YIELD = 8, FOOD = 8, CAP = 6, CAP_OX = 18, P_OX = 80, P_NB = 120, P_LORD = 160, P_PAPER = 200, HELP = 4, FIXED = 3;
const GUNPO = [15, 25, 35, 45, 45], GUNPO_WHY = ['장정 한 몫', '갓난아기 몫까지', '돌아가신 할아버지 몫까지', '달아난 이웃 몫까지', '달아난 이웃 몫까지'];

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xe4ecd8, 130, 400], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xeaf2ff, 0x8a8a5a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff2d6, intensity: 2.2, box: [64, 64], far: 230, pos: [HOME[0] - 40, 64, HOME[1] + 30], target: [HOME[0], 0, HOME[1]] });
addEventListener('resize', resize); resize();
const drnd = rng(18200), sky = skyDome(scene, drnd, { top: 0x6aa6e8, low: 0xeaf2e0, stars: 0 });
const flat = flatMaker(scene);
const skyMeshes = scene.children.filter((m) => m.geometry && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.radius >= 250);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);
const v3 = new THREE.Vector3(), _o = new THREE.Object3D(), _c = new THREE.Color();

/* 땅 · 길 · 개울 · 강 */
const groundM = flat(-260, -260, W + 260, H + 260, 0x8fbf5a, 0);
const road = (x0, z0, x1, z1) => flat(Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1), 0xd8c08a, 0.03);
road(40, 140.5, 96, 144.5); road(92, 30, 98, 200); road(96, 140.5, 214, 144.5); road(214, 126, 380, 131); road(210, 60, 216, 144.5); road(258, 131, 264, 208);
flat(86, 43, 244, 50, 0x4a9ad6, 0.04); flat(-260, 214, W + 260, H + 260, 0x3d8fd0, 0.05); flat(-260, 210, W + 260, 214.5, 0xe2d09a, 0.03);
/* 판 밖 세 겹: 언덕 · 먼 마을 · 산 능선 */
{ const hills = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 9, 5, 0, 6.2832, 0, 1.5708), new THREE.MeshLambertMaterial({ color: 0x6fae52, flatShading: true }), 40);
  for (let i = 0; i < 40; i++) { const k = i % 3; let x, z; if (k === 0) { x = -40 - drnd() * 90; z = drnd() * 240; } else if (k === 1) { x = drnd() * 400; z = -30 - drnd() * 90; } else { x = W + 30 + drnd() * 90; z = drnd() * 200; } _o.position.set(x, -1, z); _o.scale.set(22 + drnd() * 26, 6 + drnd() * 12, 22 + drnd() * 26); _o.rotation.set(0, 0, 0); _o.updateMatrix(); hills.setMatrixAt(i, _o.matrix); }
  hills.frustumCulled = false; scene.add(hills);
  const g = new THREE.ConeGeometry(1, 1, 5); g.translate(0, 0.5, 0);
  for (const [c, r0, n, h0] of [[0x8ea6b8, 300, 30, 34], [0xb7c6d6, 350, 22, 56]]) { const im = new THREE.InstancedMesh(g, new THREE.MeshLambertMaterial({ color: c, flatShading: true, fog: false }), n); for (let i = 0; i < n; i++) { const a = -3.4 + (i / (n - 1)) * 4.6 + drnd() * 0.05, r = r0 + drnd() * 18; _o.position.set(W / 2 + Math.cos(a) * r, -4, H / 2 + Math.sin(a) * r * 0.8); _o.scale.set(54 + drnd() * 30, h0 + drnd() * 30, 44 + drnd() * 20); _o.rotation.set(0, drnd() * 3, 0); _o.updateMatrix(); im.setMatrixAt(i, _o.matrix); } im.frustumCulled = false; scene.add(im); }
  artInst(scene, 'thatch_a', [[-30, 0, 60, 1.2, 1], [-44, 0, 74, 1.2, 0.4], [150, 0, -30, 1.2, 0], [170, 0, -40, 1.2, 2], [410, 0, 180, 1.2, 1]], { wall: 0xd9c6a2 }, { shadow: false }); }
/* 고개(이웃 고을 가는 길): 양쪽 언덕 사이 좁은 길 */
{ const hm = new THREE.MeshLambertMaterial({ color: 0x74a850, flatShading: true }); for (const [x, z, sx, sy, sz] of [[304, 86, 22, 16, 34], [304, 172, 22, 15, 36], [318, 60, 20, 12, 26], [316, 196, 18, 11, 22]]) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6, 0, 6.2832, 0, 1.5708), hm); m.position.set(x, -0.5, z); m.scale.set(sx, sy, sz); m.castShadow = true; scene.add(m); } }
const passGate = art('hongsal') || box(8, 5, 0.4, 0xb0302a); passGate.position.set(PASS[0], 0, PASS[1] + 0.5); passGate.rotation.y = Math.PI / 2; scene.add(passGate);
const passBar = box(0.5, 1.2, 9, 0x6a4a2a); at(passBar, PASS[0] - 2, 0.9, PASS[1] + 0.5); scene.add(passBar);
const portBar = box(9, 1.2, 0.5, 0x6a4a2a); at(portBar, 261, 0.9, 170); scene.add(portBar);

/* 집 · 읍내 · 장 */
const putArt = (n, x, z, ry = 0, s = 1, tint) => { const m = art(n, tint); if (!m) return null; m.position.set(x, 0, z); m.rotation.y = ry; m.scale.setScalar(s); scene.add(m); return m; };
putArt('thatch_a', HOME[0], HOME[1] - 6, 0, 1.15, { wall: 0xe0cda8 }); putArt('shed', GRAN[0] + 4, GRAN[1] - 4, 0, 1); putArt('ssaldok', GRAN[0], GRAN[1]); putArt('jangdok', 38, 150); putArt('jige', SEED[0] + 2.2, SEED[1]); putArt('sack', SEED[0], SEED[1]);
putArt('well', 58, 128); putArt('tree_big', 64, 122, 0, 1.3); putArt('jangseung', 90, 138); putArt('jangseung', 90, 148, 0.4); putArt('sotdae', 88, 152);
putArt('tile_a', LORD[0], LORD[1] - 8, 0, 1.3); putArt('tile_b', LORD[0] + 16, LORD[1] - 4, -1.57, 1.1); putArt('gate_house', LORD[0], LORD[1] + 2, 0, 1);
putArt('hall', 278, 94, 0, 1.25); putArt('gwe', GWE[0], GWE[1]); putArt('drum', GWE[0] - 5, GWE[1]); putArt('hongsal', 271, 114, 0, 0.9);
artInst(scene, 'stall', [[242, 0, 118, 1, 0], [250, 0, 116, 1, 0], [258, 0, 118, 1, 0], [242, 0, 138, 1, 3.14], [252, 0, 140, 1, 3.14]], {}, {});
artInst(scene, 'shop', [[234, 0, 128, 1, 1.57], [268, 0, 126, 1, -1.57]], {}, {}); putArt('goods_rice', 250, 117.5); putArt('goods_cloth', CLOTH[0] + 2, CLOTH[1] - 2); putArt('goods_tob', 258, 119.5); putArt('stage', 252, 152, 0, 1);
artInst(scene, 'thatch_b', [[232, 0, 150, 1, 0.3], [272, 0, 148, 1, -0.4], [284, 0, 130, 1, 1.2], [226, 0, 110, 1, 0.8], [290, 0, 150, 1, 0.2]], { wall: 0xd9c6a2 }, {});
artInst(scene, 'stall', [[340, 0, 120, 1, 0], [350, 0, 120, 1, 0], [346, 0, 138, 1, 3.14]], {}, {}); artInst(scene, 'thatch_a', [[334, 0, 108, 1, 0.5], [360, 0, 112, 1, -0.3], [362, 0, 140, 1, 0.9], [332, 0, 148, 1, 0.2]], { wall: 0xd2bc94 }, {}); putArt('goods_tob', 350, 121.5); putArt('goods_cloth', 340, 121.5);
putArt('dock', PORT[0], PORT[1] + 5); const ship = putArt('ferry', PORT[0] + 6, PORT[1] + 12, 0.3, 1.4); putArt('sack_pile', PORT[0] - 5, PORT[1] - 1); putArt('barrel', PORT[0] + 5, PORT[1] - 1);
scatter(scene, drnd, { area: [0, 20, 380, 212], n: 150, names: ['tree_a', 'tree_b', 'pine_a', 'bush', 'rock_a', 'pine_k', 'bush', 'tree_a'], avoid: (x, z) => (x > 96 && x < 222 && z > 40 && z < 200) || (x > 14 && x < 96 && z > 96 && z < 206) || (x > 216 && x < 296 && z > 52 && z < 212) || (x > 324 && x < 372 && z > 98 && z < 156) || Math.abs(z - 128.5) < 7 || Math.abs(z - 142.5) < 5, scale: [1.0, 1.7], minGap: 6, shadow: true });
artInst(scene, 'reed', Array.from({ length: 60 }, () => [90 + drnd() * 150, 0, 41 + drnd() * 2.5 + (drnd() < 0.5 ? 9 : 0), 1, drnd() * 6]), {}, { shadow: false });

/* ───── 논 열넷 + 밭 둘 ───── */
const COLX = [112, 138, 164, 190], ROWZ = [62, 92, 122, 152], PW = 22, PD = 26;
const OWN0 = [['lord', 'A', 'lord', 'B'], ['me', 'lord', 'C', 'lord'], ['A', 'me', 'lord', 'B'], ['lord', 'C', null, null]];
const WHO_COL = { me: 0xffcf4d, A: 0x4a8ad6, B: 0xd6564a, C: 0x4ab07a, lord: 0x3a3a44 }, WHO_NAME = { me: '우리', A: '김 서방', B: '박 서방', C: '최 서방', lord: '양반댁' };
const TUFTS = 88, tuftGeo = new THREE.ConeGeometry(0.5, 1, 5); tuftGeo.translate(0, 0.5, 0);
const plots = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const o = OWN0[r][c]; if (!o) continue; plots.push({ id: plots.length, r, c, x0: COLX[c], z0: ROWZ[r], cx: COLX[c] + PW / 2, cz: ROWZ[r] + PD / 2, wet: r < 2, owner0: o, kind: 'paddy' }); }
plots.push({ id: plots.length, x0: 16, z0: 178, cx: 24, cz: 185, w: 16, d: 14, owner0: 'me', kind: 'field', wet: false }, { id: plots.length + 1, x0: 38, z0: 182, cx: 46, cz: 189, w: 16, d: 14, owner0: 'lord', kind: 'field', wet: false });
const tuftIM = new THREE.InstancedMesh(tuftGeo, new THREE.MeshLambertMaterial({ flatShading: true }), plots.length * TUFTS); tuftIM.frustumCulled = false; tuftIM.castShadow = false; scene.add(tuftIM);
for (const p of plots) { p.w = p.w || PW; p.d = p.d || PD;
  p.soil = box(p.w, 0.14, p.d, 0x9a7a4e); p.soil.castShadow = false; p.soil.receiveShadow = true; at(p.soil, p.cx, 0.05, p.cz); scene.add(p.soil);
  for (const [dx, dz, w, d] of [[0, -p.d / 2, p.w + 1, 0.8], [0, p.d / 2, p.w + 1, 0.8], [-p.w / 2, 0, 0.8, p.d + 1], [p.w / 2, 0, 0.8, p.d + 1]]) { const b = box(w, 0.42, d, 0xb89a62); b.castShadow = false; at(b, p.cx + dx, 0.21, p.cz + dz); scene.add(b); }
  p.flag = new THREE.Group(); p.flag.add(at(cyl(0.07, 0.07, 3, 0x5a4630, 5), 0, 1.5, 0)); p.cloth = box(0.06, 0.7, 1.1, 0xffffff); p.cloth.castShadow = false; p.flag.add(at(p.cloth, 0, 2.6, 0.6)); p.flag.position.set(p.x0 + 1.2, 0, p.z0 + p.d - 1.2); scene.add(p.flag);
  p.sign = new THREE.Group(); p.sign.add(at(cyl(0.08, 0.08, 1.6, 0x6a4a2a, 5), 0, 0.8, 0), at(box(1.6, 0.9, 0.1, 0xf2e2b8), 0, 1.7, 0)); p.sign.position.set(p.cx, 0, p.z0 + p.d + 1.6); p.sign.visible = false; scene.add(p.sign);
  p.pos = Array.from({ length: TUFTS }, (_, i) => { const gx = i % 8, gz = Math.floor(i / 8); return { gx: p.x0 + 2 + gx * (p.w - 4) / 7, gz: p.z0 + 2 + gz * (p.d - 4) / 10, rx: p.x0 + 1.6 + drnd() * (p.w - 3.2), rz: p.z0 + 1.6 + drnd() * (p.d - 3.2), s: 0.8 + drnd() * 0.5 }; }); }
function drawPlot(p) { const base = p.id * TUFTS, show = p.sow !== 'none' || p.stub, tob = p.sow === 'tob', bean = p.sow === 'bean';
  const g = p.cut ? 0.22 : clamp(p.grow, 0.12, 1), col = p.cut ? 0xc9a85a : p.dead ? 0xb09a5a : p.ripe ? (tob ? 0x6a9a3a : 0xe2b43a) : (p.grow < 0.4 ? 0x9ad65a : tob ? 0x4a8a3a : 0x5fae3c);
  for (let i = 0; i < TUFTS; i++) { const q = p.pos[i], neat = p.sow === 'mo' || tob; _o.position.set(neat ? q.gx : q.rx, 0.1, neat ? q.gz : q.rz); const s = show ? q.s * (tob ? 1.5 : 1) : 0; _o.scale.set(s * (tob ? 1.2 : 0.8), s * g * (tob ? 1.6 : 1.5) * (p.weedBad ? 0.75 : 1), s * (tob ? 1.2 : 0.8)); _o.rotation.set(0, i, 0); _o.updateMatrix(); tuftIM.setMatrixAt(base + i, _o.matrix); tuftIM.setColorAt(base + i, _c.set(col)); }
  tuftIM.instanceMatrix.needsUpdate = true; if (tuftIM.instanceColor) tuftIM.instanceColor.needsUpdate = true;
  p.soil.material.color.set(p.kind === 'field' ? 0x8a6a44 : (p.sow !== 'none' && !p.cut && !(S.drought && !(p.wet && S.bo >= 6) && S.season >= 1) ? 0x6f8f9a : S.drought && S.season >= 1 && !(p.wet && S.bo >= 6) ? 0xb39a66 : 0x9a7a4e));
  p.cloth.material.color.set(WHO_COL[p.farmer] || 0x888888); p.flag.visible = !!p.farmer; }
/* 보 · 물길 */
const boG = new THREE.Group(); for (let k = 0; k < 6; k++) { const s = box(3.2, 1.2 + (k % 2) * 0.3, 2.2, 0x8a8a84); at(s, BO[0] - 8 + k * 3.2, 0.6, BO[1]); s.visible = false; boG.add(s); } scene.add(boG);
const canal = flat(108, 50, 214, 60.5, 0x4a9ad6, 0.045); canal.visible = false; const canal2 = flat(134.6, 60, 137.4, 120, 0x4a9ad6, 0.045); canal2.visible = false; const canal3 = flat(186.6, 60, 189.4, 120, 0x4a9ad6, 0.045); canal3.visible = false;
const boPile = putArt('stone_pile', BO[0] + 14, BO[1] + 5) || putArt('rock_big', BO[0] + 14, BO[1] + 5);
/* 표시 고리(걸어가서 고르는 자리) */
const pads = {}; function pad(key, x, z, col = 0xffcf4d) { const m = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.7, 28), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.09, z); m.visible = false; scene.add(m); pads[key] = { m, x, z }; return pads[key]; }
pad('seed', ...SEED); pad('nurs', ...NURS, 0x7ad65a); pad('tobs', ...TOBS, 0x6a9a3a); pad('gran', ...GRAN); pad('granT', GRAN[0] + 4, GRAN[1] + 3, 0x6a9a3a); pad('door', ...DOOR, 0xffffff);
pad('bo', BO[0], BO[1] + 4, 0x7ac8ff); pad('town', ...TOWN); pad('next', ...NEXT); pad('port', ...PORT); pad('pedd', ...PEDD); pad('gwe', GWE[0], GWE[1] + 2.4, 0xff6a4a); pad('paper', ...PAPER, 0xc8a0ff);
pad('ox', ...OX); pad('cloth', ...CLOTH, 0x9ad0ff); pad('lordBuy', LORD[0], LORD[1] + 6, 0xc8a0ff); pad('work', LORD[0] - 8, LORD[1] + 6, 0xffffff);
const nurseryM = (() => { const g = new THREE.Group(); g.add(at(box(6, 0.12, 5, 0x6f8f9a), 0, 0.07, 0)); const im = new THREE.InstancedMesh(tuftGeo, new THREE.MeshLambertMaterial({ color: 0x9ad65a, flatShading: true }), 40); for (let i = 0; i < 40; i++) { _o.position.set(-2.6 + (i % 8) * 0.75, 0.1, -2 + Math.floor(i / 8)); _o.scale.set(0.4, 0.5, 0.4); _o.rotation.set(0, i, 0); _o.updateMatrix(); im.setMatrixAt(i, _o.matrix); } g.add(im); g.userData.im = im; g.position.set(NURS[0], 0, NURS[1] + 4.6); scene.add(g); return g; })();
const oxM = putArt('ox', HOME[0] + 9, HOME[1] + 2, 1.2); if (oxM) oxM.visible = false; const cartM = putArt('cart', HOME[0] + 12, HOME[1] + 4, 1.2) || putArt('handcart', HOME[0] + 12, HOME[1] + 4); if (cartM) cartM.visible = false;
putArt('ox', OX[0] + 3, OX[1] + 2, 0.6); putArt('ox', OX[0] + 5.5, OX[1] - 1, 2);
/* 지고 가는 것 */
const carryM = { seed: art('sack'), mo: (() => { const g = new THREE.Group(); for (let k = 0; k < 5; k++) { const c = new THREE.Mesh(tuftGeo, new THREE.MeshLambertMaterial({ color: 0x9ad65a })); c.scale.set(0.3, 0.7, 0.3); c.position.set((k - 2) * 0.22, 0, 0); g.add(c); } return g; })(), tob: art('pk_tob') || art('bundle'), rice: art('pk_rice') || art('sack'), tobl: art('goods_tob') || art('bundle'), cloth: art('pk_cloth') || art('bundle'), stone: art('rock_a'), coin: art('coins') };
for (const k in carryM) if (carryM[k]) { carryM[k].visible = false; scene.add(carryM[k]); }
/* 눈 · 비 */
const wx = (() => { const N = 700, p = new Float32Array(N * 3); for (let i = 0; i < N; i++) { p[i * 3] = drnd() * 120 - 60; p[i * 3 + 1] = drnd() * 40; p[i * 3 + 2] = drnd() * 120 - 60; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.34, transparent: true, opacity: 0.85, depthWrite: false })); m.visible = false; m.frustumCulled = false; scene.add(m); return { m, p, N }; })();

/* ───── 사람들 ───── */
const mkP = (o, sc) => { const m = person({ pants: 0xe8e2d2, skin: 0xf0c48e, ...o }); m.rotation.order = 'YXZ'; if (sc) m.scale.setScalar(sc); return m; };
const pMesh = mkP({ shirt: 0xf2ead8, hat: 'scarf' });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const NB = { A: { name: '김 서방', home: [30, 118], col: 0x4a8ad6 }, B: { name: '박 서방', home: [72, 108], col: 0xd6564a }, C: { name: '최 서방', home: [82, 156], col: 0x4ab07a } };
for (const k in NB) { const n = NB[k]; n.k = k; n.mesh = mkP({ shirt: n.col, hat: k === 'B' ? 'paeraengi' : 'scarf' }); n.house = putArt(k === 'B' ? 'thatch_a' : 'thatch_b', n.home[0], n.home[1] - 5, 0, 1.05, { wall: 0xdcc8a2 }); n.x = n.home[0]; n.z = n.home[1]; n.tx = n.x; n.tz = n.z; n.wait = 0;
  n.sell = pad('sell' + k, n.home[0] - 3, n.home[1] + 3, 0xc8a0ff); n.help = pad('help' + k, n.home[0] + 3, n.home[1] + 3, 0x7ad65a); }
const extras = [[LORD[0] + 4, LORD[1] + 7, { shirt: 0xdfe6f0, hat: 'gat' }, 3.4], [GWE[0] + 2.4, GWE[1] - 1, { shirt: 0x3a4a7a, hat: 'gat' }, 3.14], [OX[0] + 1.6, OX[1] - 2, { shirt: 0xb08a5a, hat: 'paeraengi' }, 0], [247, 121, { shirt: 0xc8b08a, hat: 'scarf' }, 0], [256, 122, { shirt: 0x9a8a68, hat: 'paeraengi' }, 0.4], [244, 135, { shirt: 0xd0b890, hat: 'scarf' }, 3], [346, 123, { shirt: 0xb89a70, hat: 'paeraengi' }, 0], [352, 134, { shirt: 0xc8b08a, hat: 'scarf' }, 3], [PORT[0] - 3, PORT[1] + 1, { shirt: 0x6a7a8a, hat: 'paeraengi' }, 1.2]].map(([x, z, o, ry]) => { const m = mkP(o); m.position.set(x, 0, z); m.rotation.y = ry; walkAnim(m, 0, false); return m; });
const crowd = Array.from({ length: 7 }, (_, i) => ({ m: mkP({ shirt: [0xf2ead8, 0xd8c8a8, 0xc8d8e8, 0xe8d0c0][i % 4], hat: i % 3 ? 'scarf' : 'gat' }), a: i * 0.9, r: 7 + (i % 3) * 3, sp: 0.25 + (i % 4) * 0.06 }));
const peddler = mkP({ shirt: 0xb07a4a, hat: 'paeraengi' }); peddler.visible = false; const peddlerPack = art('bundle'); if (peddlerPack) { peddlerPack.visible = false; scene.add(peddlerPack); }
const servant = mkP({ shirt: 0xa89878, hat: 'scarf' }); servant.visible = false;
const tagBox = $('tags'), tags = Array.from({ length: 12 }, () => { const d = document.createElement('div'); d.className = 'tag'; d.innerHTML = '<span class="ic"></span>'; tagBox.appendChild(d); return d; });

/* ───── 소리 ───── */
const SFX = { pick: () => tone(660, 990, 0.12, 'triangle', 0.15), plant: () => { noise(0.06, 0.25, 900); tone(330, 440, 0.1, 'triangle', 0.08); }, coin: () => { tone(1320, 1760, 0.09, 'triangle', 0.14); tone(1760, 2100, 0.1, 'triangle', 0.1, 0.07); },
  drum: (v = 0.3) => { tone(70, 45, 0.5, 'sine', v); noise(0.18, v, 120); }, bad: () => { tone(300, 160, 0.5, 'sawtooth', 0.1); }, good: () => { [523, 659, 784].forEach((f, i) => tone(f, f, 0.3, 'triangle', 0.13, i * 0.1)); },
  season: () => { tone(392, 392, 0.3, 'sine', 0.12); tone(523, 523, 0.5, 'sine', 0.1, 0.2); }, cut: () => noise(0.12, 0.3, 1600), beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); }, win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.6, 'triangle', 0.16, i * 0.18)); }, sad: () => { tone(330, 220, 1.2, 'sine', 0.14); tone(262, 175, 1.4, 'sine', 0.1, 0.4); } };

let skyKey = '';
/* ───── 상태 ───── */
const S = { mode: 'title', view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, st: 0, year: 1, season: 0, px: HOME[0], pz: HOME[1] + 2, pdir: 0, moving: false, running: false, said: {}, sayT: 0,
  rice: 2, coin: 10, tob: 0, debt: 0, favor: 1, ox: false, yangban: false, knowMo: false, nursery: false, bo: 0, carry: null, taxDue: 0, taxPaid: false, drought: false, good: false,
  workT: 0, workKey: '', introT: 0, beatT: 0, stepT: 0, log: [], lost: [], gone: [], servant: null, labor: 0, soldY: 0, harvY: 0, lordY: 0, stats: { rented: 0, bought: 0, helped: 0, mo: 0, farMarket: 0 } };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say);
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 뛰기 단추 · 노란 고리나 논 안에 가만히 서면 그 일을 한다 · 「시점」 ⟲⟳';
let R = rng(seed0);
const mine = () => plots.filter((p) => p.farmer === 'me'), owned = () => plots.filter((p) => p.owner === 'me');
const cap = () => (S.ox ? CAP_OX : CAP), duro = () => (S.favor >= 3 ? 0.72 : 1) * (S.ox ? 0.8 : 1);
const shipIn = () => S.year >= 3 && S.season === 2 && S.st < SLEN[2] * 0.6;
const price = (where) => Math.round(([6, 5, 8, 6, 8][S.year - 1] || 6) * (where === 'next' ? 1.3 : where === 'port' ? 1.5 : where === 'pedd' ? 0.7 : 1));
const tobPrice = (where) => (where === 'next' ? 11 : where === 'port' ? 9 : where === 'pedd' ? 4 : 6);

function newGame() { R = rng(seed0 * 7 + 11);
  for (const p of plots) { p.owner = p.owner0; p.farmer = p.owner0 === 'lord' ? null : p.owner0; p.rent = null; resetPlot(p); }
  for (const k in NB) { const n = NB[k]; n.coin = k === 'B' ? 80 : 20; n.method = 'jik'; n.gone = false; n.trouble = false; n.mesh.visible = true; if (n.house) n.house.visible = true; n.x = n.home[0]; n.z = n.home[1]; }
  Object.assign(S, { t: 0, st: 0, year: 1, season: 0, px: HOME[0], pz: HOME[1] + 2, rice: 2, coin: 10, tob: 0, debt: 0, favor: 1, ox: false, yangban: false, knowMo: false, nursery: false, bo: 0, carry: null, taxDue: 0, taxPaid: false, drought: false, good: false, workT: 0, log: [], lost: [], gone: [], goals: [], servant: null, labor: 0, nobi: false, fled: false, nobiNB: [], debtY: 0, seenTown: 0, clothY: 0, nextY: 0, portY: 0, tobY: 0, rentY: 0, boughtY: 0, stats: { rented: 0, bought: 0, helped: 0, mo: 0, farMarket: 0 } });
  S.droughtYears = R() < 0.5 ? [3, 5] : [3, 4]; S.goodYear = 2;
  boG.children.forEach((c) => (c.visible = false)); canal.visible = canal2.visible = canal3.visible = false; if (oxM) oxM.visible = false; if (cartM) cartM.visible = false; servant.visible = false;
  if (mis) mis.reset(); startSeason(0, true); }
function resetPlot(p) { p.sow = 'none'; p.weed = 0; p.grow = 0; p.ripe = false; p.cut = false; p.dead = false; p.stub = false; p.weedBad = false; p.yield = 0; }

/* ───── 중간 저장(준호 11-19): 철이 바뀔 때마다 이 기기에 적어 둔다 → 첫 화면 「이어서 하기」 ───── */
const SAVE_KEY = 'kworld_farm_save_v1', S_KEYS = ['year', 'season', 'rice', 'coin', 'tob', 'debt', 'favor', 'ox', 'yangban', 'knowMo', 'nursery', 'bo', 'taxDue', 'taxPaid', 'drought', 'good', 'droughtYears', 'goodYear', 'log', 'lost', 'gone', 'servant', 'labor', 'soldY', 'harvY', 'lordY', 'stats', 'clothY', 'nextY', 'portY', 'tobY', 'rentY', 'boughtY', 'goals', 'taxOnTime', 'boY', 'oxY', 'ybY', 'tripY', 'seenTown', 'debtY', 'nobi', 'fled', 'nobiNB'];
const P_KEYS = ['owner', 'farmer', 'rent', 'sow', 'weed', 'grow', 'ripe', 'cut', 'dead', 'stub', 'weedBad', 'yield', 'keep'];
function saveGame() { if (S.mode === 'title') return; try { const d = { v: 1, at: Date.now(), S: {}, plots: plots.map((p) => P_KEYS.map((k) => p[k])), nb: {} }; for (const k of S_KEYS) d.S[k] = S[k]; for (const k in NB) { const n = NB[k]; d.nb[k] = [n.coin, n.method, n.gone, n.trouble]; } localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch (e) {} }
function readSave() { try { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return d && d.v === 1 && d.plots && d.plots.length === plots.length ? d : null; } catch (e) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
function loadGame(d) { newGame(); Object.assign(S, JSON.parse(JSON.stringify(d.S))); d.plots.forEach((a, i) => P_KEYS.forEach((k, j) => (plots[i][k] = a[j])));
  for (const k in NB) { const n = NB[k], a = d.nb[k]; if (!a) continue; [n.coin, n.method, n.gone, n.trouble] = a; n.mesh.visible = !n.gone; n.x = n.home[0]; n.z = n.home[1]; n.wait = 0; }
  R = rng(seed0 * 7 + 11 + S.year * 10 + S.season); boG.children.forEach((c, i) => (c.visible = i < S.bo)); canal.visible = canal2.visible = canal3.visible = S.bo >= 6; if (oxM) oxM.visible = S.ox; if (cartM) cartM.visible = S.ox;
  S.st = 0; S.workT = 0; S.said = {}; S.carry = null; S.px = HOME[0]; S.pz = HOME[1] + 2; skyKey = ''; for (const p of plots) drawPlot(p); refreshTasks(); hud();
  say(`${S.year}번째 해 ${SEASONS[S.season]} — 이어서 한다`, null, 3.4); }

/* ───── 철 넘기기 ───── */
function startSeason(sn, first) { S.season = sn; S.st = 0; S.workT = 0; S.said = {}; SFX.season();
  if (sn === 0) { S.drought = S.droughtYears.includes(S.year); S.good = S.year === S.goodYear; S.taxPaid = false; S.taxOnTime = false; S.labor = 0; S.soldY = 0; S.harvY = 0; S.lordY = 0; S.tripY = 0; S.seenTown = S.seenTown || 0; S.clothY = 0; S.nextY = 0; S.portY = 0; S.tobY = 0; S.rentY = 0; S.boughtY = 0;
    for (const p of plots) { resetPlot(p); if (p.farmer && p.farmer !== 'me' && NB[p.farmer] && NB[p.farmer].gone) p.farmer = null; }
    /* 빌린 땅은 한 해 계약 — 봄마다 다시 */
    for (const p of plots) if (p.owner === 'lord') { if (p.farmer !== 'me' || !p.keep) { if (p.farmer === 'me') { /* 이어 짓기 */ p.keep = true; } } }
    if (S.year >= 2) for (const k in NB) { const n = NB[k]; if (k === 'B') n.method = 'mo'; if (k === 'A' && S.year >= 4) n.method = 'mo'; }
    say(S.year === 1 ? '봄 — 볍씨 자루를 지고 깃발 노란 우리 논 둘에 뿌리자' : S.drought ? '봄 — 지난겨울 눈이 적었다. 올해는 가물겠다는 말이 돈다' : `${S.year}번째 해의 봄 — ${S.nursery ? '못자리의 모가 자랐다. 모를 지고 논으로' : '씨를 뿌릴 철'}`, null, 4.2); }
  if (sn === 1) { for (const p of plots) if (p.sow !== 'none') p.grow = 0.45;
    if (S.drought) say(S.bo >= 6 ? '여름 — 가뭄이다! 하지만 보의 물이 개울가 논을 적신다' : '여름 — 가뭄이다! 논바닥이 갈라진다. 보가 없으면 옮겨 심은 모는 말라 죽는다', null, 4.4); else say('여름 — 김을 매자. 논 안에 가만히 서 있으면 맨다' + (S.bo < 6 ? ' · 개울에 보를 쌓아 두면 가뭄에 버틴다' : ''), null, 4); }
  if (sn === 2) { for (const p of plots) if (p.sow !== 'none') { grade(p); p.grow = 1; p.ripe = true; }
    S.boY = 0; S.taxDue = (S.yangban ? 0 : GUNPO[S.year - 1]) + owned().filter((p) => p.kind === 'paddy').length * 5; S.taxPaid = S.taxDue === 0;
    say(`가을 — 거두자. 관아 북이 울리기 전에 낼 것 ${S.taxDue}냥${S.yangban ? '(양반이라 군포는 없다)' : ` (군포는 ${GUNPO_WHY[S.year - 1]})`}`, null, 5); }
  if (sn === 3) { for (const p of plots) if (p.sow !== 'none' && !p.cut) { p.dead = true; p.ripe = false; if (p.farmer === 'me') S.log.push('거두지 못한 논이 서리를 맞았다'); }
    settleTax(); neighborsYear(); if (S.year === 1 && !S.knowMo) { S.knowMo = true; }
    say(S.year === 1 ? '겨울 — 보부상 말로는 아랫녘에서는 모를 길러 옮겨 심는단다. 못자리(초록 고리)를 만들어 두자' : '겨울 — 남은 것으로 무엇을 할까. 소 · 논 · 임명장 · 이웃 돕기', null, 5); }
  for (const p of plots) drawPlot(p); refreshTasks(); hud(); saveGame(); }
/* 한 해 농사 등급(여름이 끝날 때): 김매기 · 가뭄 · 모내기 */
function grade(p) { if (p.sow === 'tob' || p.sow === 'bean') { p.yield = p.sow === 'tob' ? (p.weed >= 1 ? 5 : 3) : 3; return; }
  const mo = p.sow === 'mo', wf = mo ? [0.7, 1][Math.min(1, p.weed)] : [0.45, 0.75, 1][Math.min(2, p.weed)], watered = p.wet && S.bo >= 6;
  let y = YIELD * (mo ? 1.4 : 1) * wf; if (S.drought && !watered) y *= mo ? 0.3 : 0.75; if (S.good) y *= 1.2; p.weedBad = wf < 1; p.dead = S.drought && !watered && mo; p.yield = Math.round(y); }
function settleTax() { if (S.taxPaid) return; let due = S.taxDue; const fromCoin = Math.min(S.coin, due); S.coin -= fromCoin; due -= fromCoin;
  if (due > 0 && S.rice > 0) { const needRice = Math.ceil(due / 3), take = Math.min(S.rice, needRice); S.rice -= take; due = Math.max(0, due - take * 3); S.log.push(`세금을 제때 못 내 관아가 곳간에서 쌀 ${take}섬을 헐값에 가져갔다`); }
  if (due > 0) { S.debt += Math.round(due * 1.2); S.log.push(`모자란 ${due}냥은 관아 빚(환곡)이 되었다`); } S.taxPaid = true; SFX.drum(0.4); }
/* 이웃들의 한 해(셈으로): 거둔 것 − 먹을 것 − 세금 → 모자라면 땅을 내놓는다 */
function neighborsYear() { for (const k in NB) { const n = NB[k]; if (n.gone) continue; let got = 0; for (const p of plots) if (p.farmer === k && p.kind === 'paddy') { const mo = n.method === 'mo', watered = p.wet && S.bo >= 6; let y = YIELD * (mo ? 1.4 : 1) * (k === 'C' ? 0.75 : k === 'A' ? 0.9 : 1); if (S.drought && !watered) y *= mo ? 0.3 : 0.75; if (S.good) y *= 1.2; if (p.owner === 'lord') y *= 0.5; got += y; }
    n.coin += Math.round((got - FOOD) * 6) - (GUNPO[S.year - 1] + 10); n.trouble = n.coin < 0; } }
function endYear() {
  /* 먹을 것 · 빚 · 겨울의 뒷일 */
  const ate = Math.min(S.rice, FOOD); S.rice -= ate; if (ate < FOOD) { const lack = FOOD - ate; S.debt += lack * 9; S.log.push(`먹을 쌀이 ${lack}섬 모자라 장리쌀을 꾸었다`); }
  for (const k in NB) { const n = NB[k]; if (n.gone || !n.trouble) continue; const own = plots.filter((p) => p.owner === k);
    if (own.length) { const p = own[0]; const b = NB.B; if (k !== 'B' && !b.gone && b.coin >= 60 && R() < 0.75) { p.owner = 'B'; b.coin -= 60; S.log.push(`${n.name}네 논 한 배미를 박 서방이 샀다`); } else { p.owner = 'lord'; S.log.push(`${n.name}네 논 한 배미가 양반댁으로 넘어갔다`); } p.farmer = k; n.coin = 10; n.trouble = false; }
    else { n.gone = true; n.mesh.visible = false; S.gone.push(n.name); for (const p of plots) if (p.farmer === k) p.farmer = null; const nobiN = k === 'A' || R() < 0.5; if (nobiN) { S.nobiNB = (S.nobiNB || []).concat(n.name); S.log.push(`빚을 못 갚은 ${n.name}네가 문서를 쓰고 양반댁 노비가 되었다`); } else S.log.push(`${n.name}네가 고을을 떠났다`); if (!S.servant && mine().length >= 5) { S.servant = n.name; S.gone.pop(); S.log.pop(); if (nobiN) S.nobiNB.pop(); S.log.push(`땅을 다 잃은 ${n.name}이 우리 집 머슴으로 들어왔다 — 김매기를 대신 한다`); } } }
  if (S.debt > 0) { S.debt = Math.round(S.debt * 1.3); if (S.debt >= 70) { const o = owned().find((p) => p.kind === 'paddy'); if (!o) { S.mode = 'ledger'; hud(); sellSelf(); return; } if (o) { o.owner = 'lord'; o.rent = 'half'; S.debt = Math.max(0, S.debt - 90); S.lost.push(S.year); S.log.push('빚 때문에 우리 논 한 배미가 양반댁으로 넘어갔다 — 이제 그 논은 반씩 나눠야 한다'); } } }
  /* 박 서방은 해마다 넓힌다 */
  const B = NB.B; if (!B.gone && S.year >= 2) { const free = plots.filter((p) => p.owner === 'lord' && !p.farmer && p.kind === 'paddy'); if (free.length && plots.filter((p) => p.farmer === 'B').length < 6) { free[0].farmer = 'B'; S.log.push('박 서방이 양반댁 논을 한 배미 더 빌렸다'); } }
  S.mode = 'ledger'; hud(); ledger(); }
/* 빚은 남았는데 내줄 논이 없다 — 조선 후기에는 빚과 굶주림에 몰려 스스로 몸을 팔아 노비가 되는 사람들이 있었다(자매, 그 문서가 자매문기) */
function sellSelf() { SFX.sad();
  overlay(`<h1>빚 문서가 왔다</h1><p>빚이 <b>${S.debt}냥</b>으로 불었다. 내줄 논은 한 배미도 남지 않았다.</p><p style="text-align:left;line-height:1.7;background:rgba(255,255,255,.08);border-radius:10px;padding:10px 14px">양반댁 마름이 말한다.<br>「빚은 우리 댁에서 갚아 주마. 대신 <b>문서를 쓰고 우리 댁 노비가 되어라.</b> 굶지는 않을 게다.」<br><br>문서를 쓰면 식구는 굶지 않는다. 하지만 노비의 신분은 <b>자식에게도 이어진다.</b><br>쓰지 않으려면 오늘 밤 고을을 떠나야 한다.</p><p><button id="flee" style="background:#5a6a8a;color:#fff">밤에 고을을 떠난다</button></p>`,
    '문서를 쓴다 — 양반댁 노비가 된다', () => { S.nobi = true; S.log = []; finish(); });
  const b = document.getElementById('flee'); if (b) b.onclick = () => { S.fled = true; S.log = []; finish(); }; }
function ledger() { const yg = YEAR_GOAL[S.year - 1], ygOk = !!yg.ok(); S.goals[S.year - 1] = ygOk; const m = mine().filter((p) => p.kind === 'paddy').length, o = owned().filter((p) => p.kind === 'paddy').length, last = S.year >= YEARS;
  const rows = [`🌾 거둔 쌀 <b>${S.harvY}</b>섬 (양반댁 몫으로 나간 것 ${S.lordY}섬)`, `🪙 판 돈 <b>${S.soldY}</b>냥 · 낸 세금 ${S.taxDue}냥`, `🏠 곳간 <b>${S.rice}</b>섬 · 엽전 <b>${S.coin}</b>냥${S.debt ? ` · <span style="color:#ff9a8a">빚 ${S.debt}냥</span>` : ''}`, `🚩 짓는 논 <b>${m}</b>배미 (우리 것 ${o})`];
  if (S.debt > 0) S.log.push(owned().some((p) => p.kind === 'paddy') ? `⚠ 빚 ${S.debt}냥 — 해를 넘길 때마다 불어난다. 70냥이 넘으면 논이 넘어간다` : `⚠ 빚 ${S.debt}냥 — 내줄 논이 없다. 70냥이 넘으면 몸을 팔거나 고을을 떠나야 한다`);
  const news = S.log.length ? S.log.map((l) => '· ' + l).join('<br>') : '· 별일 없는 한 해였다';
  const nb = Object.values(NB).map((n) => `<span class="${n.gone ? '' : 'ok'}">${n.name} ${n.gone ? (S.servant === n.name ? '우리 머슴' : (S.nobiNB || []).includes(n.name) ? '양반댁 노비' : '떠남') : '논 ' + plots.filter((p) => p.farmer === n.k && p.kind === 'paddy').length}</span>`).join('');
  overlay(`<h1>${S.year}번째 해가 저문다</h1><p style="text-align:left;line-height:1.8">${rows.join('<br>')}</p><p style="font-weight:800;color:${ygOk ? '#ffe08a' : '#ffb0a0'}">⭐ 올해의 목표 ${ygOk ? '이룸 ✅' : '못 이룸'} — ${yg.t}</p><div class="marks">${nb}</div><p style="text-align:left;font-size:14px;line-height:1.6;background:rgba(255,255,255,.08);border-radius:10px;padding:8px 12px"><b>올해 있었던 일</b><br>${news}</p>${last ? '' : `<p class="keys">다음 해의 목표 — <b>${YEAR_GOAL[S.year].t}</b><br>${S.droughtYears.includes(S.year + 1) ? '눈이 적게 왔다. 가물 것 같다.' : '눈이 넉넉히 왔다.'}${S.year === 1 ? ' 이웃 고을로 넘어가는 고갯길이 열린다.' : S.year === 2 ? ' 포구에 한양 가는 배가 들어온다.' : ''}</p>`}`,
    last ? '다섯 해가 지났다' : `${S.year + 1}번째 해 봄으로`, () => { S.log = []; if (last) { finish(); return; } S.year++; S.px = HOME[0]; S.pz = HOME[1] + 2; S.carry = null; S.mode = 'play'; startSeason(0); }); }
function rank() { if (S.nobi || S.fled) return 0; const m = mine().filter((p) => p.kind === 'paddy').length, o = owned().filter((p) => p.kind === 'paddy').length; if (S.debt >= 150 || (o === 0 && S.debt >= 60)) return 0; if ((o >= 4 || (m >= 6 && o >= 2)) && S.debt === 0) return 3; if (o >= 2 && S.debt < 60) return 2; if (m >= 1) return 1; return 0; }
function finish() { const r = rank(), names = [S.nobi ? '양반댁 노비가 된 집' : '고을을 떠난 집', '남의 땅을 짓는 집', '제 땅을 짓는 집', '부농'], win = r >= 2, m = mine().filter((p) => p.kind === 'paddy').length, o = owned().filter((p) => p.kind === 'paddy').length;
  S.mode = 'end'; clearSave(); SFX[win ? 'win' : 'sad']();
  const why = []; why.push(S.stats.mo ? `모내기로 품을 아껴 한 해에 많게는 논 ${S.stats.maxFarm || m}배미를 지었다.` : '끝까지 씨를 바로 뿌려 지었다 — 김매는 품이 많이 들어 넓게 짓지 못했다.');
  if (S.bo >= 6) why.push('보를 쌓아 가뭄에도 개울가 논이 버텼다.'); else if (S.droughtYears.length) why.push('보가 없어 가뭄 든 해에 크게 잃었다.');
  if (S.stats.rented) why.push(`양반댁 논을 ${S.stats.rented}번 빌려 지었다 — 넓게 짓기.`); if (S.stats.farMarket) why.push(`값 좋은 먼 장까지 ${S.stats.farMarket}번 지고 갔다.`); if (S.ox) why.push('소를 들여 한 번에 세 곱절을 날랐다.');
  if (S.yangban) why.push('이름 없는 임명장을 사서 양반이 되었다 — 군포를 내지 않는다.'); if (S.lost.length) why.push('빚 때문에 논을 잃었다.'); if (S.nobi) why.push(`${S.year}번째 해, 빚을 갚지 못하고 내줄 논도 없어 문서를 쓰고 양반댁 노비가 되었다.`); if (S.fled) why.push(`${S.year}번째 해, 빚을 갚지 못해 밤에 고을을 떠났다 — 떠돌며 품을 팔거나 화전을 일구게 된다.`); if (S.stats.bought) why.push(`어려운 이웃의 논을 ${S.stats.bought}배미 사들였다.`); if (S.stats.helped) why.push(`어려운 이웃에게 쌀을 ${S.stats.helped}번 꾸어 주었다.`);
  const goneN = S.gone.length;
  overlay(`<h1>${win ? '이겼다' : '졌다'} — ${names[r]}</h1><p style="font-size:30px;letter-spacing:6px;margin:2px 0">${'★'.repeat(r)}${'☆'.repeat(3 - r)}</p><p>${S.nobi || S.fled ? `${S.year}번째 해 겨울` : '다섯 해 뒤'}, 짓는 논 <b>${m}</b>배미 · 우리 논 <b>${o}</b>배미 · 곳간 ${S.rice}섬 · ${S.coin}냥${S.debt ? ` · 빚 ${S.debt}냥` : ''}${S.yangban ? ' · <b>양반</b>' : ''}</p>
    <div class="marks"><span class="${m >= 6 ? 'ok' : ''}">🌾 넓게 짓기 ${m}배미</span><span class="${S.bo >= 6 ? 'ok' : ''}">💧 보 ${S.bo >= 6 ? '쌓음' : '없음'}</span><span class="${S.ox ? 'ok' : ''}">🐂 소 ${S.ox ? '있음' : '없음'}</span><span class="${S.yangban ? 'ok' : ''}">📜 ${S.yangban ? '양반' : '상민'}</span></div>
    <p style="text-align:left;font-size:14px;line-height:1.6;background:rgba(255,255,255,.08);border-radius:10px;padding:8px 12px"><b>이렇게 된 까닭</b><br>· ${why.join('<br>· ')}</p>
    <p>⭐ 해마다의 목표 ${S.goals.map((g) => (g ? '✅' : '▫️')).join('')}</p><p class="keys">그사이 고을에서는 ${goneN ? `<b>${S.gone.join(', ')}</b>네가 땅을 잃었다${(S.nobiNB || []).length ? ` (${S.nobiNB.join(', ')}네는 양반댁 노비가 되었다)` : ''}.` : '아무도 땅을 잃지 않았다.'} 누군가 넓게 지을수록, 누군가는 지을 땅을 잃었다.</p>
    <div class="fact">📜 <b>모내기</b> — 모를 길러 옮겨 심으면 김매는 품이 크게 줄고 더 많이 거둔다. 가뭄에는 약해서 보와 저수지를 많이 만들었다.<br>📜 <b>넓게 짓기</b> — 품이 남자 남의 땅까지 빌려 넓게 짓는 집이 생겼고, 그 가운데 부농이 나왔다. 땅을 얻지 못한 사람들은 품을 팔거나 고을을 떠났다.<br>📜 <b>장과 돈</b> — 닷새마다 서는 장이 온 나라에 퍼졌고 엽전이 널리 쓰였다. 담배·목화처럼 팔려고 짓는 것도 늘었다.<br>📜 <b>빚과 종</b> — 흉년과 빚에 몰려 스스로 몸을 팔아 노비가 되는 사람들이 있었다. 그때 쓴 문서를 자매문기라고 하는데, 조선 후기 것이 많이 남아 있다. 한편 돈을 내고 노비 신분에서 벗어나는 사람도 늘어, 노비는 전체로는 줄어 갔다.<br>📜 <b>군포와 신분</b> — 갓난아기와 죽은 사람 몫까지 군포를 물렸다. 곡식이나 돈을 내고 이름 없는 임명장을 사서 양반이 되는 사람이 늘었다.</div>`,
    r < 3 ? '별 셋에 다시 도전' : '한 번 더', () => { newGame(); S.mode = 'play'; }); }

/* ───── HUD ───── */
function hud() { const m = mine().filter((p) => p.kind === 'paddy').length, o = owned().filter((p) => p.kind === 'paddy').length; S.stats.maxFarm = Math.max(S.stats.maxFarm || 0, m);
  $('hRice').textContent = `🌾 곳간 ${S.rice}섬${S.tob ? ` · 담배 ${S.tob}` : ''}`; $('hCoin').textContent = `🪙 ${S.coin}냥${S.debt ? ` (빚 ${S.debt})` : ''}`; $('hLand').textContent = `🚩 논 ${m}배미(내 것 ${o})${S.yangban ? ' · 양반' : ''}`;
  const c = S.carry; $('hCarry').textContent = !c ? '빈손' : c.k === 'seed' ? '볍씨 자루' : c.k === 'mo' ? '모 다발' : c.k === 'tob' ? '담배 모종' : c.k === 'rice' ? `${c.n ? `쌀 ${c.n}섬` : ''}${c.tob ? ` 담배 ${c.tob}단` : ''} 지고 있음` : c.k === 'tobl' ? `담배 ${c.n}단` : c.k === 'cloth' ? `베 ${c.n}필` : c.k === 'stone' ? '돌' : '';
  $('night').firstChild.textContent = `${S.year}번째 해 · ${SEASONS[S.season]} `; $('night').querySelector('i').style.width = clamp(1 - S.st / SLEN[S.season], 0, 1) * 100 + '%';
  drawTodo();
  $('nb').innerHTML = Object.values(NB).map((n) => `<span style="border-left:4px solid #${n.col.toString(16)}">${n.name} ${n.gone ? (S.servant === n.name ? '머슴' : (S.nobiNB || []).includes(n.name) ? '노비' : '떠남') : '논' + plots.filter((p) => p.farmer === n.k && p.kind === 'paddy').length + (n.trouble ? ' ⚠' : '')}</span>`).join(''); }

/* ───── 할 일(준호 11-19 「처음 몇 개 하고 나면 다음에 뭘 해야 할지 안 뜬다 · 미션을 더 다양하게」)
   다섯 해 내내, 철마다 「꼭 할 일」과 「골라서 할 일」이 목록으로 뜨고, 지금 할 일 하나에 빛기둥·화살표가 선다. 해마다 「올해의 목표」가 하나 있다. ───── */
const paddies = () => mine().filter((p) => p.kind === 'paddy'), myField = () => mine().find((p) => p.kind === 'field');
const YEAR_GOAL = [
  { t: '첫 농사 — 세금을 다 내고, 겨울에 못자리를 만든다', ok: () => S.taxOnTime && S.nursery },
  { t: '모내기로 논 세 배미 넘게 짓는다', ok: () => paddies().length >= 3 && S.stats.mo > 0 },
  { t: '가뭄을 넘긴다 — 보를 다 쌓고, 빚 없이', ok: () => S.bo >= 6 && S.debt === 0 },
  { t: '살림 넓히기 — 소를 들이거나 논을 산다', ok: () => S.ox || owned().filter((p) => p.kind === 'paddy').length >= 3 },
  { t: '부농까지 — 우리 논 네 배미(또는 짓는 논 여섯 · 우리 논 둘), 빚 없이', ok: () => rank() >= 3 }];
const bestFree = () => plots.filter((p) => p.owner === 'lord' && !p.farmer && p.kind === 'paddy').sort((a, b) => (b.wet - a.wet) || (a.cx - b.cx))[0];
const bestMarket = () => (shipIn() ? PORT : S.year >= 2 && S.season === 2 && SLEN[2] - S.st > 62 ? NEXT : TOWN);
const selling = () => S.carry && S.carry.k === 'rice', canLoad = () => S.rice > FOOD || S.tob > 0;
function tasks() { const sn = S.season, c = S.carry, P = paddies(), L = [], add = (o) => L.push(o), fld = myField();
  const firstP = (f) => { const p = P.find(f); return p ? [p.cx, p.cz] : null; };
  if (sn === 0) { const mo = S.nursery, want = mo ? 'mo' : 'seed', sown = P.filter((p) => p.sow !== 'none').length;
    if (S.year >= 2) add({ id: 'rent', req: S.year === 2, t: '양반댁 논 한 배미 빌리기', how: '팻말 앞 고리 둘 가운데 하나에 서기 — <b>반씩</b> 나누기 / 해마다 <b>3섬</b> 내기' + (S.bo >= 6 ? '' : ' · 개울가 논은 보가 서면 가뭄에 버틴다'), done: () => S.rentY > 0 || !bestFree(), at: () => { const p = bestFree(); return p ? [p.cx - 3.4, p.z0 + p.d + 3.4] : null; }, tag: '📜 빌리기' });
    add({ id: 'sow', req: true, t: mo ? '모를 지고 가 옮겨 심기' : '볍씨를 지고 가 뿌리기', n: [sown, P.length], how: mo ? '못자리(초록 고리)에서 모 다발 → 깃발 노란 논 <b>안에</b> 가만히 서기' : '집 앞 볍씨 자루 → 깃발 노란 논 <b>안에</b> 가만히 서기', done: () => P.every((p) => p.sow !== 'none'), at: () => (c && c.k === want ? firstP((p) => p.sow === 'none') : mo ? NURS : SEED), tag: () => (c && c.k === want ? '🌱 논 안에 가만히' : mo ? '🌱 모 다발' : '볍씨 자루') });
    if (S.year >= 2 && fld) add({ id: 'tob', t: '밭에 담배 심기 — 팔려고 짓는 것', how: '집 남쪽 담배 모종 → 밭 안에 가만히 서기. 가을에 고개 너머 장이 값이 좋다', done: () => fld.sow !== 'none', at: () => (c && c.k === 'tob' ? [fld.cx, fld.cz] : TOBS), tag: () => (c && c.k === 'tob' ? '밭 안에 가만히' : '담배 모종') }); }
  if (sn === 1) { const G = mine().filter((p) => p.sow !== 'none'), J = G.filter((p) => p.sow === 'jik'), half = S.st > SLEN[1] * 0.5;
    add({ id: 'wd1', req: true, t: '김매기', n: [G.filter((p) => p.weed >= 1).length, G.length], how: '벼가 자라는 우리 논 <b>안에</b> 가만히 서기', done: () => G.every((p) => p.weed >= 1), at: () => { const p = G.find((p) => p.weed < 1); return p ? [p.cx, p.cz] : null; }, tag: '🌿 김매기' });
    if (J.length) add({ id: 'wd2', req: true, t: '한여름 두 번째 김매기 (씨 뿌린 논)', n: [J.filter((p) => p.weed >= 2).length, J.length], how: half ? '씨를 뿌린 논은 한 번 더 — 모내기를 하면 이 일이 없다' : '한여름이 되면 한 번 더 매야 한다 — 그때까지 다른 일을', done: () => J.every((p) => p.weed >= 2), at: () => (half ? firstP((p) => p.sow === 'jik' && p.weed === 1) : null), wait: !half, tag: '🌿 한 번 더' });
    if (S.bo < 6 || S.boY) add({ id: 'bo', req: S.year <= 3, t: '개울에 보 쌓기 — 가뭄 대비', n: [Math.min(6, S.bo), 6], how: '북쪽 개울 파란 고리에 가만히 서기 · 다 쌓으면 개울가 논 여덟 배미에 물이 든다', done: () => S.bo >= 6, at: () => [BO[0], BO[1] + 4], tag: '💧 보 쌓기' });
    add({ id: 'lab', t: '양반댁에 품 팔기', n: [S.labor, 3], how: '양반댁 앞 흰 고리에 가만히 서기 — 한 번에 5냥', done: () => S.labor >= 3, at: () => [LORD[0] - 8, LORD[1] + 6], tag: '품 팔기 5냥' });
    if (S.year >= 2) add({ id: 'cloth', t: '베 장사 — 읍내에서 사서 고개 너머에 팔기', how: '읍내 6냥 → 고개 너머 11냥. 엽전이 있어야 살 수 있다', can: () => (c && c.k === 'cloth') || S.coin >= 6, done: () => S.clothY > 0, at: () => (c && c.k === 'cloth' ? NEXT : CLOTH), tag: () => (c && c.k === 'cloth' ? '🧵 여기서 팔기' : '🧵 베 사기') }); }
  if (sn === 2) { const G = mine().filter((p) => p.sow !== 'none'), firstG = () => { const p = G.find((p) => p.ripe && !p.cut); return p ? [p.cx, p.cz] : null; };
    const pr = `읍내 ${price('town')}냥${S.year >= 2 ? ` · 고개 너머 ${price('next')}냥` : ''}${shipIn() ? ` · 포구 ${price('port')}냥(배가 곧 떠난다)` : ''}${peddler.visible ? ` · 보부상 ${price('pedd')}냥(가깝다)` : ''}`;
    add({ id: 'cut', req: true, t: '거두기', n: [G.filter((p) => p.cut).length, G.length], how: '누렇게 익은 우리 논·밭 <b>안에</b> 가만히 서기', done: () => G.every((p) => p.cut), at: firstG, tag: '🌾 거두기' });
    add({ id: 'sell', req: true, t: '쌀을 지고 장에 가서 팔기', how: `곳간 고리에서 지고 장으로 — ${pr}`, done: () => S.tripY > 0 || (!canLoad() && !selling() && S.taxPaid), at: () => (selling() ? bestMarket() : canLoad() || S.rice > 0 ? GRAN : null), tag: () => (selling() ? '🪙 여기서 팔기' : '🌾 쌀 지기') });
    add({ id: 'tax', req: true, t: `북이 울리기 전에 세금 ${S.taxDue}냥 내기`, n: S.coin < S.taxDue && !S.taxPaid ? [S.coin, S.taxDue] : null, how: (S.coin >= S.taxDue ? '읍내 북쪽 관아의 궤 앞 붉은 고리에 가만히 서기' : `엽전이 모자란다 — 쌀을 더 팔아 오자 (${pr})`) + (S.yangban ? '' : ` · 올해 군포는 ${GUNPO_WHY[S.year - 1]}`), done: () => S.taxPaid, at: () => (S.coin >= S.taxDue ? [GWE[0], GWE[1] + 2.4] : selling() ? bestMarket() : S.rice > 0 ? GRAN : null), tag: () => (S.coin >= S.taxDue ? '🥁 세금 내기' : selling() ? '🪙 여기서 팔기' : '🌾 쌀 지기') });
    if (S.debt > 0 || S.debtY === S.year) add({ id: 'debt', req: true, t: '빚 갚기 — 해를 넘기면 불어난다', n: [0, S.debt], how: '세금을 낸 뒤 관아 궤 앞 고리에 가만히 서기 · 못 갚으면 논이 넘어가고, 논도 없으면 몸을 팔게 된다', can: () => S.taxPaid && S.coin > 0, done: () => S.debt === 0, at: () => [GWE[0], GWE[1] + 2.4], tag: '빚 갚기' });
    add({ id: 'more', t: '남는 쌀 더 팔아 겨울 밑천 만들기', how: `먹을 ${FOOD}섬은 곳간에 남는다 — ${pr}. 겨울에 소·논·임명장을 살 수 있다`, can: () => selling() || canLoad(), done: () => S.taxPaid && !canLoad() && !selling(), at: () => (selling() ? bestMarket() : GRAN), tag: () => (selling() ? '🪙 여기서 팔기' : '🌾 쌀 지기') });
    if (S.year >= 2) add({ id: 'next', soft: true, t: `고개 너머 장에 팔아 보기 (${price('next')}냥)`, how: '멀어서 한 번 다녀오면 철이 훌쩍 간다', done: () => S.nextY > 0, at: () => NEXT });
    if (S.year >= 3) add({ id: 'port', soft: true, t: `한양 배가 떠나기 전에 포구에 팔기 (${price('port')}냥)`, how: '가을 한가운데에 배가 떠난다', gone: () => !shipIn() && !S.portY, done: () => S.portY > 0, at: () => PORT });
    if (G.some((p) => p.sow === 'tob') || S.tobY) add({ id: 'tobs', soft: true, t: '담배 팔기 — 쌀과 같이 지고 간다', how: '고개 너머 장이 가장 비싸다', done: () => S.tobY > 0, at: () => GRAN }); }
  if (sn === 3) { if (S.knowMo) add({ id: 'nurs', req: true, t: '못자리 만들기 — 내년에 모내기', how: '집 남쪽 초록 고리에 가만히 서기. 모를 옮겨 심으면 김매기가 한 번으로 줄고 더 거둔다', done: () => S.nursery, at: () => NURS, tag: '🌱 못자리' });
    if (S.debt > 0 || S.debtY === S.year) add({ id: 'debt', req: true, t: '빚 갚기 — 해를 넘기면 불어난다', n: [0, S.debt], how: '읍내 관아 궤 앞 고리에 가만히 서기 · 못 갚으면 논이 넘어가고, 논도 없으면 몸을 팔게 된다', can: () => S.coin > 0, done: () => S.debt === 0, at: () => [GWE[0], GWE[1] + 2.4], tag: '빚 갚기' });
    if (!S.ox || S.oxY === S.year) add({ id: 'ox', t: `소 사기 ${P_OX}냥`, how: '읍내 소 장수 앞 고리 — 달구지로 한 번에 세 곱절을 싣고, 논일도 빨라진다', can: () => S.coin >= P_OX, done: () => S.ox, at: () => OX, tag: '🐂 소' });
    add({ id: 'land', t: `양반댁 논 사기 ${P_LORD}냥`, how: '양반댁 대문 앞 보라 고리 — 빌려 짓던 논부터 내 것이 된다(반을 안 내도 된다)', can: () => S.coin >= P_LORD && (S.ox || S.coin >= P_LORD + P_OX), done: () => S.boughtY > 0, at: () => [LORD[0], LORD[1] + 6], tag: '논 사기' });
    if (!S.yangban || S.ybY === S.year) add({ id: 'paper', t: `이름 없는 임명장 사기 ${P_PAPER}냥`, how: '관아 옆 보라 고리 — 양반이 되어 군포를 내지 않는다', can: () => S.coin >= P_PAPER && owned().filter((p) => p.kind === 'paddy').length >= 4, done: () => S.yangban, at: () => PAPER, tag: '📜 임명장' });
    add({ id: 'wsell', t: '남는 쌀 팔아 엽전 만들기', how: `곳간에서 지고 읍내로(${price('town')}냥) — 겨울에도 장은 선다`, can: () => selling() || canLoad(), done: () => !canLoad() && !selling(), at: () => (selling() ? TOWN : GRAN), tag: () => (selling() ? '🪙 여기서 팔기' : '🌾 쌀 지기') });
    for (const k in NB) { const n = NB[k]; if (n.gone || !(n.trouble || n['t' + S.year])) continue; n['t' + S.year] = 1; const has = plots.some((p) => p.owner === k);
      add({ id: 'nb' + k, soft: true, t: `❗ ${n.name}네가 어렵다 — ${has ? '논을 살까, ' : ''}쌀을 꾸어 줄까`, how: `${has ? `보라 고리: 논 사기 ${P_NB}냥 · ` : ''}초록 고리: 쌀 ${HELP}섬 꾸어 주기`, done: () => !n.trouble, at: () => [n.home[0], n.home[1] + 3] }); } }
  if (sn === 0 && S.year === 1) add({ id: 'tour', t: '읍내 장터까지 가 보기 — 고을 구경', how: '동쪽 큰길 끝. 가을에 쌀을 지고 올 길이다 · V 를 누르면 온 고을이 보인다', done: () => S.seenTown > 0, at: () => TOWN, tag: '읍내 장터' });
  return L; }
let TL = [], curTask = null; const DOOR_TASK = { id: 'door', t: '집에 들어가 철 넘기기', how: '할 일을 다 했으면 집 문 앞 흰 고리에 가만히 서기 — 기다려도 철은 넘어간다', at: () => DOOR, tag: '철 넘기기', done: () => false };
const doneSeen = {}; let popT2 = 0;
function refreshTasks() { TL = tasks(); for (const t of TL) { t.ok = t.done(); t.lost = !t.ok && t.gone && t.gone(); const key = S.year + '|' + S.season + '|' + t.id; if (t.ok && doneSeen[key] === false) { const pop = document.getElementById('mpop') || document.querySelector('.mpop'); if (pop) { pop.innerHTML = `✅ 해냈다!<small>${t.t}</small>`; pop.classList.add('on'); popT2 = 1.8; } tone(660, 660, 0.12, 'triangle', 0.12); tone(880, 880, 0.12, 'triangle', 0.12, 0.11); tone(1320, 1320, 0.22, 'triangle', 0.1, 0.22); } doneSeen[key] = t.ok; }
  const live = (t) => !t.ok && !t.lost && !t.wait && !t.soft && (!t.can || t.can()) && t.at();
  if (S.debt > 0) S.debtY = S.year;
  curTask = TL.find((t) => t.req && live(t)) || TL.find((t) => !t.req && live(t)) || (S.st > 8 ? DOOR_TASK : null); }
function drawTodo() { const el = $('todo'), g = YEAR_GOAL[S.year - 1], req = TL.filter((t) => t.req), opt = TL.filter((t) => !t.req);
  const line = (t) => `<div class="${t.ok ? 'on' : t === curTask ? 'now' : t.lost ? 'on' : ''}">${t.ok ? '✅' : t === curTask ? '▶' : t.lost ? '✖' : t.req ? '⬜' : '◻'} ${t.t}${t.n && !t.ok ? ` ${t.n[0]}/${t.n[1]}` : ''}</div>`;
  const html = `<div class="main">⭐ 올해의 목표 — ${g.t}</div>` + req.map(line).join('') + (opt.length ? `<div class="sub">골라서 할 일</div>` + opt.map(line).join('') : '');
  if (el._h !== html) { el.innerHTML = html; el._h = html; } }

/* ───── 가만히 서서 하는 일: 지금 자리에서 할 수 있는 일 하나 ───── */
const near = (a, r = 2.2) => dist(S.px, S.pz, a[0], a[1]) < r, inPlot = (p) => S.px > p.x0 + 1 && S.px < p.x0 + p.w - 1 && S.pz > p.z0 + 1 && S.pz < p.z0 + p.d - 1;
function job() { const sn = S.season, c = S.carry, D = duro();
  const here = plots.find(inPlot);
  if (sn === 0) {
    if (here && here.farmer === 'me' && here.sow === 'none') { if (here.kind === 'field') { if (c && c.k === 'tob') return { key: 'pt' + here.id, need: 2 * D, label: '담배 심기', fn: () => { here.sow = 'tob'; here.grow = 0.15; SFX.plant(); say('담배를 심었다 — 장에 내다 팔 것', 'tob1', 2.4); } }; if (c && c.k === 'seed') return { key: 'pb' + here.id, need: 2 * D, label: '콩 심기', fn: () => { here.sow = 'bean'; here.grow = 0.15; SFX.plant(); } }; return null; }
      if (c && c.k === 'mo') return { key: 'pm' + here.id, need: 3.2 * D, label: '모내기', fn: () => { here.sow = 'mo'; here.grow = 0.3; S.stats.mo++; SFX.plant(); ring(here.cx, here.cz, 8, 0x7ad65a); say('줄 맞춰 모를 옮겨 심었다 — 여름에 김을 한 번만 매면 된다', 'mo1', 3); } };
      if (c && c.k === 'seed') return { key: 'pj' + here.id, need: 1.5 * D, label: '볍씨 뿌리기', fn: () => { here.sow = 'jik'; here.grow = 0.15; SFX.plant(); ring(here.cx, here.cz, 8, 0xffcf4d); say('볍씨를 뿌렸다 — 여름에 김을 두 번 매야 한다', 'jik1', 3); } }; }
    for (const p of plots) if (p.owner === 'lord' && !p.farmer) { for (const [kind, dx] of [['half', -3.4], ['fixed', 3.4]]) if (dist(S.px, S.pz, p.cx + dx, p.z0 + p.d + 3.4) < 1.8) return { key: 'rent' + p.id + kind, need: 1, label: kind === 'half' ? '반씩 나누기로 빌리기' : `해마다 ${FIXED}섬 내기로 빌리기`, fn: () => { p.farmer = 'me'; p.rent = kind; S.stats.rented++; S.rentY++; SFX.good(); ring(p.cx, p.cz, 10, 0xffcf4d); say(kind === 'half' ? '양반댁 논을 빌렸다 — 거둔 것의 반을 낸다' : `양반댁 논을 빌렸다 — 풍년이든 흉년이든 ${FIXED}섬을 낸다`, null, 3); } }; }
  }
  if (sn === 1) {
    if (here && here.farmer === 'me' && here.sow !== 'none') { const max = here.sow === 'jik' ? 2 : 1, open = here.sow === 'jik' ? (S.st > SLEN[1] * 0.5 ? 2 : 1) : 1; if (here.weed < Math.min(max, open)) return { key: 'wd' + here.id + here.weed, need: (here.sow === 'jik' ? 3 : 2) * D, label: here.sow === 'jik' ? `김매기 ${here.weed + 1}/2` : '김매기', fn: () => { here.weed++; SFX.cut(); ring(here.cx, here.cz, 6, 0x7ad65a); if (here.sow === 'jik' && here.weed === 1) say('애벌매기 끝 — 한여름에 한 번 더 매야 한다', 'wd1', 3); } }; }
    if (S.bo < 6 && near([BO[0], BO[1] + 4], 2.4)) return { key: 'bo' + S.bo, need: 2.6, label: `보 쌓기 ${S.bo + 1}/6`, fn: () => { S.bo++; S.boY = 1; boG.children[S.bo - 1].visible = true; SFX.plant(); noise(0.2, 0.3, 200); if (S.bo >= 6) { canal.visible = canal2.visible = canal3.visible = true; S.favor++; SFX.good(); ring(BO[0], BO[1], 16, 0x7ac8ff); say('보가 섰다! 개울가 논 여덟 배미는 가뭄에도 물이 든다 — 이웃들이 고마워한다', null, 4.2); for (const p of plots) drawPlot(p); } } };
    if (S.labor < 3 && near([LORD[0] - 8, LORD[1] + 6])) return { key: 'lab' + S.labor, need: 3, label: '양반댁 품 팔기', fn: () => { S.labor++; S.coin += 5; SFX.coin(); say('하루 품을 팔아 5냥을 받았다', 'lab', 2.4); } };
  }
  if (sn === 2) { if (here && here.farmer === 'me' && here.ripe && !here.cut) return { key: 'cut' + here.id, need: 2.5 * D, label: '거두기', fn: () => harvest(here) };
    if (S.taxPaid && S.debt > 0 && S.coin > 0 && near([GWE[0], GWE[1] + 2.4], 2.4)) return payDebt();
    if (!S.taxPaid && near([GWE[0], GWE[1] + 2.4], 2.4)) return { key: 'tax', need: 1.2, label: `세금 ${S.taxDue}냥 내기`, fn: () => { if (S.coin >= S.taxDue) { S.coin -= S.taxDue; S.taxPaid = true; S.taxOnTime = true; SFX.coin(); SFX.drum(0.2); ring(GWE[0], GWE[1], 4, 0xffcf4d); say('낼 것을 다 냈다', null, 2.4); } else { SFX.bad(); say(`엽전이 모자란다 (${S.coin}/${S.taxDue}냥) — 쌀을 팔아 오자`, null, 2.6); S.workKey = 'x'; } } }; }
  if (sn === 3) {
    if (S.debt > 0 && S.coin > 0 && near([GWE[0], GWE[1] + 2.4], 2.4)) return payDebt();
    if (S.knowMo && !S.nursery && near(NURS)) return { key: 'nurs', need: 2.5, label: '못자리 만들기', fn: () => { S.nursery = true; SFX.good(); ring(NURS[0], NURS[1], 4, 0x7ad65a); say('못자리를 만들었다 — 봄에 모를 지고 나가 옮겨 심는다', null, 3.4); } };
    if (!S.ox && near(OX)) return { key: 'ox', need: 1.2, label: `소 사기 ${P_OX}냥`, fn: () => { if (S.coin >= P_OX) { S.coin -= P_OX; S.ox = true; S.oxY = S.year; if (oxM) oxM.visible = true; if (cartM) cartM.visible = true; SFX.good(); say('소를 샀다! 달구지로 한 번에 18섬을 싣고, 논일도 빨라진다', null, 3.6); } else { SFX.bad(); say(`엽전이 모자란다 (${S.coin}/${P_OX}냥)`, null, 2.2); S.workKey = 'x'; } } };
    if (!S.yangban && near(PAPER)) return { key: 'paper', need: 1.4, label: `이름 없는 임명장 ${P_PAPER}냥`, fn: () => { if (S.coin >= P_PAPER) { S.coin -= P_PAPER; S.yangban = true; S.ybY = S.year; SFX.good(); ring(PAPER[0], PAPER[1], 5, 0xc8a0ff); say('이름 칸이 빈 임명장을 샀다 — 이제 양반이다. 군포를 내지 않는다', null, 4); } else { SFX.bad(); say(`엽전이 모자란다 (${S.coin}/${P_PAPER}냥)`, null, 2.2); S.workKey = 'x'; } } };
    if (near([LORD[0], LORD[1] + 6])) { const p = plots.find((p) => p.owner === 'lord' && p.farmer === 'me' && p.kind === 'paddy') || plots.find((p) => p.owner === 'lord' && !p.farmer && p.kind === 'paddy'); if (p) return { key: 'lbuy' + p.id, need: 1.4, label: `양반댁 논 사기 ${P_LORD}냥`, fn: () => { if (S.coin >= P_LORD) { S.coin -= P_LORD; S.boughtY++; p.owner = 'me'; p.farmer = 'me'; p.rent = null; S.stats.boughtLord = (S.stats.boughtLord || 0) + 1; SFX.good(); ring(p.cx, p.cz, 10, 0xffcf4d); say('논 한 배미가 우리 것이 되었다', null, 3); drawPlot(p); } else { SFX.bad(); say(`엽전이 모자란다 (${S.coin}/${P_LORD}냥)`, null, 2.2); S.workKey = 'x'; } } }; }
    for (const k in NB) { const n = NB[k]; if (n.gone || !n.trouble) continue;
      if (near([n.sell.x, n.sell.z], 1.8)) { const p = plots.find((p) => p.owner === k); if (p) return { key: 'nbuy' + k, need: 1.4, label: `${n.name}네 논 사기 ${P_NB}냥`, fn: () => { if (S.coin >= P_NB) { S.coin -= P_NB; S.boughtY++; p.owner = 'me'; p.farmer = 'me'; p.rent = null; n.trouble = false; n.coin = 30; S.favor = Math.max(0, S.favor - 1); S.stats.bought++; SFX.coin(); ring(p.cx, p.cz, 10, 0xffcf4d); say(`${n.name}네 논을 샀다 — ${n.name}은 지을 땅이 한 배미 줄었다`, null, 3.6); drawPlot(p); } else { SFX.bad(); say(`엽전이 모자란다 (${S.coin}/${P_NB}냥)`, null, 2.2); S.workKey = 'x'; } } }; }
      if (near([n.help.x, n.help.z], 1.8)) return { key: 'nhelp' + k, need: 1.4, label: `쌀 ${HELP}섬 꾸어 주기`, fn: () => { if (S.rice >= HELP + FOOD) { S.rice -= HELP; n.coin = 15; n.trouble = false; S.favor++; S.stats.helped++; SFX.good(); ring(n.home[0], n.home[1], 5, 0x7ad65a); say(`${n.name}네에 쌀을 꾸어 주었다 — 이웃이 품으로 갚는다(일이 빨라진다)`, null, 3.6); } else { SFX.bad(); say('우리 먹을 것도 빠듯하다', null, 2.2); S.workKey = 'x'; } } }; } }
  if (near(DOOR, 1.6) && S.st > 8) return { key: 'door', need: 2.2, label: `집에 들어가 ${SEASONS[S.season]}을 넘긴다`, fn: () => { S.st = SLEN[S.season]; } };
  return null; }
function payDebt() { const pay = Math.min(S.coin, S.debt); return { key: 'debt' + S.debt, need: 1.2, label: `빚 ${pay}냥 갚기`, fn: () => { S.coin -= pay; S.debt -= pay; SFX.coin(); ring(GWE[0], GWE[1], 4, 0x7ad65a); say(S.debt ? `빚 ${pay}냥을 갚았다 — 아직 ${S.debt}냥 남았다` : '빚을 다 갚았다! 빚 문서를 돌려받았다', null, 3); } }; }
function harvest(p) { p.cut = true; p.ripe = false; p.stub = true; SFX.cut(); ring(p.cx, p.cz, 8, 0xe2b43a);
  if (p.sow === 'tob') { S.tob += p.yield; say(`담배 ${p.yield}단을 거뒀다 — 고개 너머 장이 값이 좋다`, null, 2.6); }
  else if (p.sow === 'bean') { S.rice += p.yield; S.harvY += p.yield; }
  else { let y = p.yield, lord = 0; if (p.owner === 'lord') { lord = p.rent === 'fixed' ? Math.min(y, FIXED) : Math.round(y / 2); y -= lord; } S.rice += y; S.harvY += y; S.lordY += lord; say(p.dead ? '말라 죽은 논 — 건질 것이 거의 없다' : `${y}섬을 곳간에 들였다${lord ? ` (양반댁 몫 ${lord}섬)` : ''}`, null, 2.4); }
  drawPlot(p); hud(); }
/* 닿으면 바로 되는 것: 들기 · 내려놓기 · 팔기 */
function touch() { const sn = S.season, c = S.carry;
  if (sn === 0) { if ((!c || c.k !== 'seed') && near(SEED, 1.7)) { S.carry = { k: 'seed' }; SFX.pick(); say('볍씨 자루를 졌다 — 논 안에 가만히 서면 뿌린다', 'seed', 2.6); }
    if (S.nursery && (!c || c.k !== 'mo') && near(NURS, 1.7)) { S.carry = { k: 'mo' }; SFX.pick(); say('모 다발을 졌다 — 논 안에 가만히 서면 옮겨 심는다', 'mo0', 2.6); }
    if (S.year >= 2 && (!c || c.k !== 'tob') && near(TOBS, 1.7)) { S.carry = { k: 'tob' }; SFX.pick(); say('담배 모종 — 밭에 심는다', 'tob0', 2.4); } }
  if (sn === 1) { if (S.bo < 6 && !c && boPile && near([BO[0] + 14, BO[1] + 5], 2.6)) { /* 돌은 보 자리 곁에 넉넉하다 — 따로 나르지 않는다 */ }
    if (S.year >= 2 && !c && near(CLOTH, 1.8) && S.coin >= 6) { const n = Math.min(cap(), Math.floor(S.coin / 6)); S.coin -= n * 6; S.carry = { k: 'cloth', n }; SFX.coin(); say(`베 ${n}필을 샀다 — 고개 너머 장에서는 11냥`, null, 3); }
    if (c && c.k === 'cloth' && near(NEXT, 2.2)) { S.coin += c.n * 11; S.soldY += c.n * 5; S.carry = null; S.clothY++; SFX.coin(); ring(NEXT[0], NEXT[1], 4, 0xffcf4d); say(`베를 팔았다 — ${c.n * 5}냥이 남았다. 싼 데서 사서 비싼 데 파는 것`, null, 3.4); S.stats.farMarket++; } }
  if (sn >= 2) { if (!c && near(GRAN, 1.7) && (S.rice > FOOD || S.tob > 0 || (S.rice > 0 && !S.taxPaid && sn === 2))) { const n = S.rice > FOOD ? Math.min(cap(), S.rice - FOOD) : S.tob > 0 ? 0 : Math.min(cap(), S.rice), tb = S.tob; if (n > 0 && S.rice <= FOOD) say('먹을 쌀까지 진다 — 겨울에 쌀을 꾸어야 할지도 모른다', 'food', 3); S.rice -= n; S.tob = 0; S.carry = { k: 'rice', n, tob: tb }; SFX.pick(); say(`${n ? `쌀 ${n}섬` : ''}${n && tb ? '과 ' : ''}${tb ? `담배 ${tb}단` : ''}을 ${S.ox ? '달구지에 실었다' : '지게에 졌다'} — 장으로`, 'load', 2.6); }
    if (c && c.k === 'rice') for (const [w, at2] of [['town', TOWN], ['next', NEXT], ['port', PORT], ['pedd', PEDD]]) { if (w === 'pedd' && !peddler.visible) continue; if (w === 'next' && S.year < 2) continue; if (w === 'port' && (S.year < 3 || !shipIn())) continue;
      if (near(at2, 2.3)) { const tb = c.tob || 0, got = price(w) * c.n + tobPrice(w) * tb; S.coin += got; S.soldY += got; S.carry = null; SFX.coin(); ring(at2[0], at2[1], 4, 0xffcf4d); if (w === 'next' || w === 'port') S.stats.farMarket++; if (w === 'next') S.nextY++; if (w === 'port') S.portY++; if (tb) S.tobY++; S.tripY = (S.tripY || 0) + 1; say(`${c.n ? `쌀 ${c.n}섬(${price(w)}냥씩)` : ''}${c.n && tb ? ' · ' : ''}${tb ? `담배 ${tb}단(${tobPrice(w)}냥씩)` : ''}을 팔았다 — ${got}냥`, null, 3); break; } } }
  if (sn !== 0 && c && (c.k === 'seed' || c.k === 'mo' || c.k === 'tob')) S.carry = null; }

/* ───── 하늘 ───── */
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); 
function lightFor() { const sn = S.season, d = S.drought && sn >= 1 && sn <= 2;
  const key = sn + '|' + d; if (key !== skyKey) { skyKey = key; const top = [0x6aa6e8, d ? 0x9ab0d0 : 0x5a9ae6, 0x6f9fe0, 0x9aa8ba][sn], low = [0xeaf2e0, d ? 0xf2e2b0 : 0xe6f0ea, 0xffe6b8, 0xe8ecf0][sn]; sky.paint(cT.set(top), cL.set(low)); scene.fog.color.set(low);
    groundM.material.color.set([0x8fbf5a, d ? 0xb8b060 : 0x7ab84a, 0xb8b25a, 0xe6e8e2][sn]); sun.intensity = [2.2, d ? 2.8 : 2.4, 2.0, 1.4][sn]; hemi.intensity = [1.3, 1.3, 1.2, 1.5][sn]; wx.m.visible = sn === 3; } }

/* ───── 한 걸음 ───── */
const COL = [[HOME[0], HOME[1] - 6, 4.6], [LORD[0], LORD[1] - 8, 6.5], [278, 94, 7], [NB.A.home[0], NB.A.home[1] - 5, 4], [NB.B.home[0], NB.B.home[1] - 5, 4.2], [NB.C.home[0], NB.C.home[1] - 5, 4], [64, 122, 1.6], [304, 86, 21], [304, 172, 21]];
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  if (wx.m.visible) { wx.m.position.set(S.px, 0, S.pz); for (let i = 0; i < wx.N; i++) { wx.p[i * 3 + 1] -= 5 * dt; wx.p[i * 3] += Math.sin(S.t + i) * dt * 0.8; if (wx.p[i * 3 + 1] < 0) wx.p[i * 3 + 1] = 40; } wx.m.geometry.attributes.position.needsUpdate = true; }
  if (S.mode === 'intro') { S.introT += dt; if (S.introT > 5) { S.mode = 'play'; startSeason(0, true); } }
  if (S.mode !== 'play') { place(dt); return; }
  S.st += dt; lightFor();
  /* 철 마감 */
  if (S.st >= SLEN[S.season]) { if (S.season === 3) { endYear(); place(dt); return; } startSeason(S.season + 1); }
  if (S.season === 2) { const k = S.st / SLEN[2]; if (!S.taxPaid) { if (k > 0.6) say('둥 — 관아 북이 울린다. 낼 것을 못 내면 곳간을 헐값에 털린다', 'drum1', 3.4); if (k > 0.6 && !S.said.d1) { S.said.d1 = 1; SFX.drum(0.35); } if (k > 0.82 && !S.said.d2) { S.said.d2 = 1; SFX.drum(0.5); say('둥 둥 — 곧 마감이다!', null, 2.6); } } }
  /* 자라기 */
  if (S.season <= 1) for (const p of plots) if (p.sow !== 'none') { const g0 = p.grow; p.grow = Math.min(S.season === 0 ? 0.42 : 0.95, p.grow + dt * 0.012); if (Math.floor(g0 * 12) !== Math.floor(p.grow * 12)) drawPlot(p); }
  if (S.season === 2 && S.year >= 3 && S.st > SLEN[2] * 0.6 && !S.said.ship) { S.said.ship = 1; say('포구의 한양 배가 닻을 올렸다 — 이제 읍내나 고개 너머 장으로', null, 3); }
  /* 보부상(가을 한가운데 마을에 온다 — 값은 싸지만 가깝다) */
  const pOn = S.season === 2 && S.st > 20 && S.st < 80; if (pOn !== peddler.visible) { peddler.visible = pOn; if (peddlerPack) peddlerPack.visible = pOn; if (pOn) { peddler.position.set(PEDD[0] + 2, 0, PEDD[1] - 2); peddler.rotation.y = 3.6; if (peddlerPack) peddlerPack.position.set(PEDD[0] + 3.4, 0, PEDD[1] - 1.4); say(`보부상이 마을에 왔다 — 쌀 ${price('pedd')}냥(읍내는 ${price('town')}냥). 가깝지만 싸다`, 'pedd', 4); } }
  /* 나 */
  let { ix, iz, back } = ctl.read(dt); const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const load = S.carry && (S.carry.k === 'rice' || S.carry.k === 'tobl' || S.carry.k === 'cloth');
    const sp = (S.running ? 8.6 : 5.2) * (back ? 0.6 : 1) * (load ? (S.ox ? 0.86 : 0.8) : 1); let nx = clamp(S.px + ix * sp * dt, 8, 372), nz = clamp(S.pz + iz * sp * dt, 30, 211);
    if (S.year < 2 && nx > PASS[0] - 4) { nx = PASS[0] - 4; say('고갯길은 아직 눈사태로 막혀 있다 — 내년에 열린다', 'pass', 2.6); } if (S.year < 3 && nz > 168 && nx > 250 && nx < 272) { nz = 168; say('포구 가는 길 — 한양 배는 세 번째 해부터 들어온다', 'port', 2.6); }
    for (const [cx, cz, r] of COL) { const d = dist(nx, nz, cx, cz); if (d < r) { nx = cx + (nx - cx) / d * r; nz = cz + (nz - cz) / d * r; } }
    if (nz > 41.5 && nz < 51.5 && nx > 86 && nx < 244 && Math.abs(nx - 95) > 3 && Math.abs(nx - BO[0]) > 10) nz = S.pz < 46 ? 41.5 : 51.5;
    S.px = nx; S.pz = nz; S.pdir = Math.atan2(iz, ix); S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.4; noise(0.05, 0.05, 300); } }
  S.backT = dist(S.px, S.pz, GRAN[0], GRAN[1]) > 6 ? 9 : (S.backT || 0); if (S.carry && S.carry.k === 'rice' && near(GRAN, 3)) S.backT = Math.max(0, (S.backT || 0));
  if (!S.seenTown && dist(S.px, S.pz, TOWN[0], TOWN[1]) < 14) { S.seenTown = 1; say('읍내 장터다 — 가을에 여기서 쌀을 판다. 북쪽이 관아', null, 3.4); }
  touch();
  const j = job(); if (j && j.key === S.workKey && !S.moving) S.workT += dt; else { S.workT = j && !S.moving ? dt : 0; S.workKey = j ? j.key : ''; }
  S.jobLabel = j && !S.moving ? j.label : j ? j.label + ' — 가만히 서기' : '';
  overBar($('work'), cam, S.px, 2.8, S.pz, j && S.workT > 0.05 ? S.workT / j.need : null);
  if (j && S.workT >= j.need) { S.workT = 0; S.workKey = ''; j.fn(); const h = plots.find(inPlot); if (h) drawPlot(h); hud(); }
  /* 머슴: 김매기를 대신 한다 */
  if (S.servant && S.season === 1) { const p = mine().find((p) => p.sow !== 'none' && p.weed < (p.sow === 'jik' ? 2 : 1)); servant.visible = true; if (p) { const d = dist(servant.position.x, servant.position.z, p.cx, p.cz); if (d > 1) { servant.position.x += (p.cx - servant.position.x) / d * 4 * dt; servant.position.z += (p.cz - servant.position.z) / d * 4 * dt; walkAnim(servant, S.t * 10, true); } else { p.sv = (p.sv || 0) + dt; walkAnim(servant, 0, false); servant.rotation.x = 0.25 + Math.sin(S.t * 5) * 0.2; if (p.sv > 6) { p.sv = 0; p.weed++; drawPlot(p); } } } }
  neighborsMove(dt); place(dt);
  if (popT2 > 0) { popT2 -= dt; if (popT2 <= 0) { const pop = document.getElementById('mpop') || document.querySelector('.mpop'); if (pop) pop.classList.remove('on'); } }
  if (Math.floor(S.st * 4) !== Math.floor((S.st - dt) * 4)) { refreshTasks(); hud(); }
  /* 조임: 철이 끝나 가는데 못 한 일 */
  const left = 1 - S.st / SLEN[S.season], mp = mine(), undone = S.season === 0 ? mp.some((p) => p.sow === 'none') : S.season === 2 ? (!S.taxPaid || mp.some((p) => p.ripe && !p.cut)) : S.season === 1 ? mp.some((p) => p.sow === 'jik' && p.weed < 2) : false;
  const tension = clamp(undone ? (0.35 - left) * 3 : 0, 0, 1);
  S.beatT -= dt; if (tension > 0.1 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.4, tension); SFX.beat(0.06 + tension * 0.26); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 60}px rgba(200,60,20,${tension * 0.4})`;
}
function neighborsMove(dt) { for (const k in NB) { const n = NB[k]; if (n.gone) continue; n.wait -= dt;
    if (n.wait <= 0) { const ps = plots.filter((p) => p.farmer === k); if (S.season === 3 || !ps.length) { n.tx = n.home[0] + 2; n.tz = n.home[1] + 2; n.wait = 6; } else { const p = ps[Math.floor(R() * ps.length)]; n.tx = p.x0 + 3 + R() * (p.w - 6); n.tz = p.z0 + 3 + R() * (p.d - 6); n.wait = 7 + R() * 5; n.p = p; } }
    const d = dist(n.x, n.z, n.tx, n.tz); let mv = false; if (d > 0.6) { n.x += (n.tx - n.x) / d * 4.4 * dt; n.z += (n.tz - n.z) / d * 4.4 * dt; n.mesh.rotation.y = -Math.atan2(n.tz - n.z, n.tx - n.x) + Math.PI / 2; mv = true; }
    else if (n.p && S.season < 3) { const p = n.p; if (S.season === 0 && p.sow === 'none' && S.st > 12) { p.sow = n.method; p.grow = n.method === 'mo' ? 0.3 : 0.15; drawPlot(p); } if (S.season === 1 && p.weed < 2) p.weed = 2; if (S.season === 2 && p.ripe && !p.cut && S.st > 18) { p.cut = true; p.ripe = false; p.stub = true; drawPlot(p); } }
    n.mesh.rotation.x = !mv && S.season < 3 && n.p ? 0.22 + Math.sin(S.t * 4.5 + n.x) * 0.2 : 0; n.mesh.position.set(n.x, 0, n.z); walkAnim(n.mesh, S.t * 10 + n.x, mv); }
  for (const p of plots) { const n = NB[p.farmer]; if (!n || n.gone) continue; const ph = (p.id * 7) % 16; if (S.season === 0 && p.sow === 'none' && S.st > 14 + ph) { p.sow = n.method; p.grow = n.method === 'mo' ? 0.3 : 0.15; drawPlot(p); } if (S.season === 2 && p.ripe && !p.cut && S.st > 26 + ph * 2) { p.cut = true; p.ripe = false; p.stub = true; drawPlot(p); } }
  /* 박 서방: 봄에 양반댁 논을 노린다(내가 먼저 빌리면 다른 논으로) */
  const B = NB.B; if (!B.gone && S.season === 0 && S.year >= 2 && S.st > 26 && !S.said.brent) { S.said.brent = 1; const free = plots.filter((p) => p.owner === 'lord' && !p.farmer && p.kind === 'paddy'); if (free.length && plots.filter((p) => p.farmer === 'B').length < 6) { const p = free[0]; p.farmer = 'B'; drawPlot(p); ring(p.cx, p.cz, 10, 0xd6564a); say('박 서방이 양반댁 논 한 배미를 먼저 빌렸다!', null, 3); } }
  crowd.forEach((c, i) => { const cx = i < 5 ? TOWN[0] : NEXT[0], cz = i < 5 ? TOWN[1] : NEXT[1]; c.a += dt * c.sp; const x = cx + Math.cos(c.a) * c.r, z = cz + Math.sin(c.a) * c.r * 0.7; c.m.position.set(x, 0, z); c.m.rotation.y = -(c.a + Math.PI / 2) + Math.PI / 2; walkAnim(c.m, S.t * 8 + i, true); }); }
function place(dt) { pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving); pMesh.rotation.x = !S.moving && S.workT > 0.1 ? 0.22 + Math.sin(S.t * 6) * 0.2 : 0; pRing.position.set(S.px, 0.11, S.pz); pRing.scale.setScalar(S.view === 3 ? 9 : 1); pMesh.scale.setScalar(S.view === 3 ? 4 : 1);
  for (const k in carryM) if (carryM[k]) carryM[k].visible = false; const c = S.carry; if (c && carryM[c.k]) { const m = carryM[c.k]; m.visible = true; m.position.set(S.px - Math.cos(S.pdir) * 0.5, 1.5, S.pz - Math.sin(S.pdir) * 0.5); m.rotation.y = pMesh.rotation.y; }
  if (S.ox && oxM && cartM) { const load = c && (c.k === 'rice' || c.k === 'tobl' || c.k === 'cloth'); if (load) { oxM.position.set(S.px + Math.cos(S.pdir) * 2.4, 0, S.pz + Math.sin(S.pdir) * 2.4); oxM.rotation.y = pMesh.rotation.y; cartM.position.set(S.px - Math.cos(S.pdir) * 2.6, 0, S.pz - Math.sin(S.pdir) * 2.6); cartM.rotation.y = pMesh.rotation.y; } else { oxM.position.set(HOME[0] + 9, 0, HOME[1] + 2); cartM.position.set(HOME[0] + 12, 0, HOME[1] + 4); } }
  nurseryM.userData.im.visible = S.nursery; nurseryM.visible = S.knowMo;
  passBar.visible = S.year < 2; portBar.visible = S.year < 3; if (ship) ship.visible = S.year >= 3 && (S.season !== 2 || shipIn());
  /* 고리 · 팻말 */
  const sn = S.season, play = S.mode === 'play', c2 = S.carry;
  pads.seed.m.visible = play && sn === 0; pads.nurs.m.visible = play && ((sn === 0 && S.nursery) || (sn === 3 && S.knowMo && !S.nursery)); pads.tobs.m.visible = play && sn === 0 && S.year >= 2;
  pads.gran.m.visible = play && sn >= 2 && !c2 && (S.rice > FOOD || S.tob > 0 || (S.rice > 0 && !S.taxPaid && sn === 2)); pads.granT.m.visible = false; pads.door.m.visible = play && S.st > 8;
  pads.bo.m.visible = play && sn === 1 && S.bo < 6; pads.work.m.visible = play && sn === 1 && S.labor < 3; pads.cloth.m.visible = play && sn === 1 && S.year >= 2 && !c2;
  const selling = play && c2 && c2.k === 'rice'; pads.town.m.visible = selling; pads.next.m.visible = (selling || (c2 && c2.k === 'cloth')) && S.year >= 2; pads.port.m.visible = selling && shipIn(); pads.pedd.m.visible = selling && peddler.visible;
  pads.gwe.m.visible = play && ((sn === 2 && !S.taxPaid) || (sn >= 2 && S.debt > 0 && S.coin > 0 && (S.taxPaid || sn === 3))); pads.ox.m.visible = play && sn === 3 && !S.ox; pads.paper.m.visible = play && sn === 3 && !S.yangban; pads.lordBuy.m.visible = play && sn === 3;
  for (const k in NB) { const n = NB[k], on = play && sn === 3 && n.trouble && !n.gone; n.sell.m.visible = on && plots.some((p) => p.owner === k); n.help.m.visible = on; }
  for (const p of plots) p.sign.visible = play && sn === 0 && p.owner === 'lord' && !p.farmer;
  for (const k in pads) if (pads[k].m.visible) pads[k].m.scale.setScalar(1 + Math.sin(S.t * 4) * 0.08);
  /* 꼬리표: 가까운 것만 */
  let ti = 0; const put = (x, y, z, html, hot) => { const d = tags[ti]; if (!d) return; const q = v3.set(x, y, z).project(cam); if (q.z > 1 || Math.abs(q.x) > 1.05 || Math.abs(q.y) > 1.05) return; ti++; d.style.display = 'block'; d.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; d.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; d.className = 'tag' + (hot ? ' hot' : ''); const ic = d.firstChild; if (ic._h !== html) { ic.innerHTML = html; ic._h = html; } };
  if (play) { const R2 = 46;
    for (const p of plots) { if (dist(S.px, S.pz, p.cx, p.cz) > R2) continue; const who = p.farmer ? WHO_NAME[p.farmer] : '빈 논';
      if (sn === 0 && p.owner === 'lord' && !p.farmer) { put(p.cx - 3.4, 2.2, p.z0 + p.d + 3.4, '반씩'); put(p.cx + 3.4, 2.2, p.z0 + p.d + 3.4, `${FIXED}섬`); put(p.cx, 3.6, p.z0 + p.d + 1.6, '📜 양반댁 논 — 빌려줌'); }
      else if (p.farmer === 'me') { const t = sn === 0 ? (p.sow === 'none' ? (p.kind === 'field' ? '🌱 밭 — 담배나 콩' : '🌱 여기 심기') : p.sow === 'mo' ? '모내기 끝' : p.sow === 'jik' ? '씨 뿌림' : '심음') : sn === 1 ? (p.sow === 'none' ? '묵힌 땅' : p.weed >= (p.sow === 'jik' ? 2 : 1) ? '✓ 김맴' : (p.sow === 'jik' && p.weed === 1 && S.st <= SLEN[1] * 0.5 ? '한여름에 한 번 더' : '🌿 김매기')) : sn === 2 ? (p.cut ? '✓ 거둠' : p.ripe ? `🌾 거두기 (${p.yield}섬)` : p.dead ? '말라 죽음' : '') : (p.owner === 'me' ? '우리 논' : '빌린 논');
        if (t) put(p.cx, 3, p.cz, t, (sn === 0 && p.sow === 'none') || (sn === 2 && p.ripe && !p.cut)); }
      else if (dist(S.px, S.pz, p.cx, p.cz) < 20) put(p.cx, 2.6, p.cz, who + (p.owner === 'lord' && p.farmer ? ' (빌림)' : '')); }
    const lab = (key, txt, hot) => { const pd = pads[key]; if (pd.m.visible && dist(S.px, S.pz, pd.x, pd.z) < 60) put(pd.x, 2.4, pd.z, txt, hot); };
    lab('seed', '볍씨 자루'); lab('nurs', sn === 0 ? '🌱 모 다발' : '🌱 못자리 만들기'); lab('tobs', '담배 모종'); lab('gran', S.rice > FOOD ? `🌾 쌀 지기 (${Math.min(cap(), S.rice - FOOD)}섬 · 먹을 ${FOOD}섬은 남김)${S.tob ? ' + 담배' : ''}` : S.tob ? '담배 지기' : '🌾 먹을 쌀까지 지기'); lab('granT', '담배 지기'); lab('bo', `💧 보 쌓기 ${S.bo}/6`, true); lab('work', '품 팔기 5냥'); lab('cloth', '🧵 베 6냥');
    lab('town', `읍내 장 ${price('town')}냥`); lab('next', c2 && c2.k === 'cloth' ? '베 11냥' : `고개 너머 장 ${price('next')}냥`); lab('port', `⛵ 한양 배(곧 떠난다) ${price('port')}냥`); lab('pedd', `보부상 ${price('pedd')}냥`);
    lab('gwe', sn === 2 && !S.taxPaid ? `🥁 세금 ${S.taxDue}냥` : `빚 갚기 (남은 빚 ${S.debt}냥)`, true); lab('ox', `🐂 소 ${P_OX}냥`); lab('paper', `📜 임명장 ${P_PAPER}냥`); lab('lordBuy', `논 사기 ${P_LORD}냥`); lab('door', '철 넘기기');
    for (const k in NB) { const n = NB[k]; if (n.sell.m.visible) put(n.sell.x, 2.4, n.sell.z, `논 사기 ${P_NB}냥`); if (n.help.m.visible) put(n.help.x, 2.4, n.help.z, `쌀 ${HELP}섬 꾸어 주기`); if (!n.gone && n.trouble && sn === 3 && dist(S.px, S.pz, n.home[0], n.home[1]) < 60) put(n.home[0], 5, n.home[1] - 3, `🏚 ${n.name}네 — 먹을 것이 떨어졌다`, true); } }
  for (; ti < tags.length; ti++) tags[ti].style.display = 'none';
  $('jobl').textContent = play ? (S.jobLabel || '') : ''; $('jobl').style.display = play && S.jobLabel ? 'block' : 'none';
}
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 4.4, 0, 1) : 0, e = k * k * (3 - 2 * k); cam.position.set(lerp(300, HOME[0] + 6, e), lerp(60, 26, e), lerp(190, HOME[1] + 36, e)); cam.lookAt(lerp(200, HOME[0], e), 2, lerp(110, HOME[1] - 10, e)); if (cam.fov !== 50) { cam.fov = 50; cam.updateProjectionMatrix(); } }
  else { followCam(cam, S, { W, H, clampX: [-40, W + 40], clampZ: [0, H + 10], farH: [24, 30], farBk: [36, 42], farFov: 46, lookY: 6, aheadFar: 18, map: { h: [200, 300], z: 30, look: -2, fov: 62 } });
    for (const m of skyMeshes) m.scale.setScalar(S.view === 3 ? 4 : 1.6); scene.fog.near = S.view === 3 ? 500 : 130; scene.fog.far = S.view === 3 ? 1200 : 400;
    const fx = Math.round(S.px / 4) * 4, fz = Math.round(S.pz / 4) * 4; sun.position.set(fx - 40, 64, fz + 30); sun.target.position.set(fx, 0, fz); }
  edgeGoal($('goal'), cam, v3.set(0, 0, 0).clone(), false, 0.82);
}

/* ───── 미션 카드: 「지금 할 일」 하나를 kit 의 카드·빛기둥·화살표로 비춘다(목록은 위 tasks) ───── */
const proxy = { get t() { return curTask ? curTask.t : '철이 바뀌기를 기다린다'; }, how: () => (curTask ? curTask.how : '') + '<i hidden>' + (curTask ? curTask.id + S.season + S.year : '') + '</i>', n: () => (curTask && curTask.n ? TL.find((t) => t.id === curTask.id).n : null), done: () => false, at: () => (curTask ? curTask.at() : null), tag: () => { const g = curTask && curTask.tag; return typeof g === 'function' ? g() : g || '여기!'; } };
const mis = missions(scene, cam, [proxy], {});
function misHead() { const h = mis.card.firstElementChild, req = TL.filter((t) => t.req), txt = `${S.year}번째 해 ${SEASONS[S.season]} · ${curTask && !curTask.req && curTask.id !== 'door' ? '골라서 할 일' : `꼭 할 일 ${req.filter((t) => t.ok).length}/${req.length}`}`; if (h.textContent !== txt) h.textContent = txt; }

newGame(); S.mode = 'title'; for (const p of plots) drawPlot(p); hud(); place(0.016);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.season(); };
{ const d = readSave(); if (d) { const b = document.createElement('button'); b.id = 'cont'; b.textContent = `이어서 하기 — ${d.S.year}번째 해 ${SEASONS[d.S.season]}`; b.style.marginRight = '10px'; $('go').parentNode.insertBefore(b, $('go')); $('go').textContent = '처음부터'; $('go').style.opacity = '.75';
    b.onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'play'; loadGame(d); SFX.season(); }; } }
canvas.addEventListener('pointerdown', () => { if (S.mode === 'intro') S.introT = 99; });
runLoop((dt) => { update(dt); mis.update(dt, S.mode === 'play'); misHead(); }, view, () => renderer.render(scene, cam));
window.__scene = { S, update, ctl, plots, NB, mine, owned, job, price, rank, pads, shipIn, get cur() { return curTask; }, get TL() { return TL; }, saveGame, readSave, loadGame,
  go() { $('go').click(); S.introT = 99; update(0.01); }, view(n) { S.view = n; }, step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  next() { const b = document.querySelector('#ov button'); if (b && $('ov').style.display !== 'none') b.click(); },
  const: { HOME, GRAN, SEED, NURS, TOBS, DOOR, BO, LORD, TOWN, GWE, PAPER, OX, CLOTH, NEXT, PORT, PEDD, SLEN, P_OX, P_NB, P_LORD, P_PAPER } };
