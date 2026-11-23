/* 시간 탐험대 · 조선 후기 「다섯 해」 — 큰 판(2026-11-19). 공통 부품 = ../scene/kit.js.
   준호(11-19): 「조선 후기에 부농이 생기잖아. 왜 부농이 된 거야? 모내기에 따른 것들도 있잖아. 역사 내용을 최대한 반영하고, 한 시대 안에서도 확장을 많이.
   맵을 진짜 크게, 실제 게임 수준으로, 긴장감 돌면서」.
   한 줄: 다섯 해 뒤, 우리 집은 어떤 집이 되어 있을까 — 부농 · 제 땅 짓는 집 · 남의 땅 짓는 집 · 고을을 떠난 집.
   한 해 = 네 철(봄 씨뿌리기/모내기 · 여름 김매기와 보 · 가을 거두고 팔고 세금 · 겨울 살림 정하기). 철마다 마감이 있다.
   역사: 모내기(품이 줄어 넓게 짓는다 · 가뭄에 약하다 → 보) · 넓게 짓기(남의 땅 빌려 짓기 — 반씩/정해진 만큼) · 팔려고 짓는 담배 · 장마다 다른 값 ·
         군포(갓난아기·죽은 사람 몫) · 이름 없는 임명장으로 양반 되기 · 땅을 잃고 떠나는 이웃(내가 넓힌 만큼 누군가는 잃는다).
   좌표: x 동쪽(+), z 남쪽(+). 서쪽 우리 마을 → 가운데 들 → 동쪽 읍내 → 고개 너머 이웃 고을 장. 남쪽 강과 포구. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, flatMaker, skyDome, ringsFx, people, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, edgeGoal, overBar, runLoop, loadArt, art as kitArt, artGeo, artMat, artInst as kitInst, scatter, missions } from '../scene/kit.js?v=5';
await loadArt('people', 'nature', 'build', 'props', 'market', 'night', 'farm', 'farmset');   /* 개·닭·소·나무는 이제 구워 입힌 묶음(fbeasts·fyard) */   /* beasts = 움직이는 개·닭·소(tools/blender/make_beasts.py) */
import { beastKit } from './beasts.js?v=2';
import { makeLand, dikes, hAt, lineDist, STREAM } from './land.js?v=2';
import { airKit, sunAt } from './air.js?v=1';
import { BAKED, loadBaked, bakedMesh, bakedInst, tintMat, eachInst } from './models.js?v=2';
/* 구워 입힌 모델(블렌더 kw_bake — 이엉 결·나뭇결·돌·회벽 무늬와 구석 그늘): 같은 이름이 있으면 그것으로 갈아 끼운다 */
await loadBaked('fhouse', 'ftown', 'ffolk', 'fbeasts', 'fyard');
import { folkKit } from './folk.js?v=2';
const art = (n, tints, o) => (typeof n === 'string' && BAKED[n] ? bakedMesh(n, o) : kitArt(n, tints, o));
const artInst = (sc, n, list, tints, o) => (typeof n === 'string' && BAKED[n] ? bakedInst(sc, n, list, o) : kitInst(sc, n, list, tints, o));
/* 읽어 들인 farm = 모·벼·이삭·볏단·그루터기·콩(tools/blender/make_farm.py) */

const W = 380, H = 240;
const seed0 = +(new URLSearchParams(location.search).get('seed') || (Date.now() % 100000));
const SEASONS = ['봄', '여름', '가을', '겨울'], SLEN = [80, 96, 124, 52], YEARS = 5;
const HOME = [46, 150], GRAN = [53, 145], SEED = [50, 157], NURS = [37, 161], TOBS = [43, 165], DOOR = [44, 147];
const BO = [150, 47], LORD = [226, 66], TOWN = [250, 128], GWE = [271, 104], PAPER = [281, 110], OX = [263, 142], CLOTH = [240, 120];
const DUTY = [104, 142.5]; const TOWN_PTS = [[242, 119], [250, 117], [258, 119], [242, 137], [252, 139], [238, 128], [264, 127]], NEXT_PTS = [[340, 121], [350, 121], [346, 137]], PASS = [302, 128], NEXT = [346, 128], PORT = [262, 207], PEDD = [62, 138];
/* 값 */
const YIELD = 8, FOOD = 8, CAP = 6, CAP_OX = 18, P_OX = 80, P_NB = 120, P_LORD = 160, P_PAPER = 200, HELP = 4, FIXED = 3;
const GUNPO = [15, 25, 35, 45, 45], GUNPO_WHY = ['장정 한 몫', '갓난아기 몫까지', '돌아가신 할아버지 몫까지', '달아난 이웃 몫까지', '달아난 이웃 몫까지'];

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xe4ecd8, 130, 400], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xeaf2ff, 0x8a8a5a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff2d6, intensity: 2.2, box: [64, 64], far: 230, pos: [HOME[0] - 40, 64, HOME[1] + 30], target: [HOME[0], 0, HOME[1]] });
sun.shadow.radius = 3; sun.shadow.blurSamples = 12;   /* 그림자 가장자리를 부드럽게 */
addEventListener('resize', resize); resize();
const drnd = rng(18200), sky = skyDome(scene, drnd, { top: 0x6aa6e8, low: 0xeaf2e0, stars: 0 });
const flat = flatMaker(scene);
const skyMeshes = scene.children.filter((m) => m.geometry && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.radius >= 250);
const { walkAnim } = people(scene), { person } = folkKit(scene);   /* 사람 = 구워 입힌 모델(folk.js) · 걷기는 kit 그대로 */
const { ring, update: ringsUpdate } = ringsFx(scene);
const v3 = new THREE.Vector3(), _o = new THREE.Object3D(), _c = new THREE.Color();

/* 땅 · 길 · 개울 · 강 */
/* 땅은 land.js 한 장(굴곡 지형 + 칠한 무늬) — 길·마당은 판을 깔지 않고 무늬로 칠한다(가장자리가 칼로 자른 듯하지 않게) */
const ROADS = [], YARDS = [];
const road = (x0, z0, x1, z1) => ROADS.push([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)]);
road(40, 140.5, 96, 144.5); road(92, 30, 98, 200); road(96, 140.5, 214, 144.5); road(214, 126, 380, 131); road(210, 60, 216, 144.5); road(258, 131, 264, 208);
/* 판 밖 세 겹: 언덕 · 먼 마을 · 산 능선 */
/* 먼 산(준호 11-23 「배경도 실감 나게」): 능선 세 겹 — 가까울수록 짙고 멀수록 하늘빛에 묻힌다. 밑자락은 안개빛(골짜기 안개). 하늘 둥근 지붕 안쪽 */
const RIDGES = []; { const ridge = (r, h0, h1, col, seed, n = 128) => { const pos = [], colr = [], idx = [], c0 = new THREE.Color(col); let h = (h0 + h1) / 2;
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; h = clamp(h + (Math.sin(i * 0.9 + seed) * 0.6 + Math.sin(i * 0.23 + seed * 2) * 0.9 + (drnd() - 0.5) * 1.2) * (h1 - h0) * 0.12, h0, h1); const hh = i === n ? pos[4] : h;
      pos.push(190 + Math.cos(a) * r, -20, 110 + Math.sin(a) * r, 190 + Math.cos(a) * r, hh, 110 + Math.sin(a) * r); colr.push(1, 1, 1, 0, 0, 0); if (i < n) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false })); m.userData = { c0, r }; m.renderOrder = -1; scene.add(m); RIDGES.push(m); return m; };
  ridge(1000, 60, 170, 0xa8b8c4, 3); ridge(860, 40, 120, 0x8ea4a8, 7); ridge(720, 24, 80, 0x6f8c78, 11); }
/* 능선 빛: 철·하늘빛에 맞춰 — 멀수록 하늘(안개)빛, 밑자락은 안개 */
function paintRidges(haze) { RIDGES.forEach((m, k) => { const ca = m.geometry.attributes.color, top = m.userData.c0.clone().lerp(haze, [0.55, 0.38, 0.22][k]), bot = haze.clone(); for (let i = 0; i < ca.count; i += 2) { ca.setXYZ(i, bot.r, bot.g, bot.b); ca.setXYZ(i + 1, top.r, top.g, top.b); } ca.needsUpdate = true; }); }
paintRidges(new THREE.Color(0xdfe8e4));
{ artInst(scene, 'thatch_a', [[-30, 60, 1.2, 1], [-44, 74, 1.2, 0.4], [150, -30, 1.2, 0], [170, -40, 1.2, 2], [410, 180, 1.2, 1]].map(([x, z, k, r]) => [x, hAt(x, z) - 0.3, z, k, r]), { wall: 0xd9c6a2 }, { shadow: false }); }
/* 고개(이웃 고을 가는 길): 양쪽 언덕 사이 좁은 길 */
/* (고개 양쪽 언덕은 land.js 지형이 솟아서 만든다) */
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
/* 나무(준호 11-23 「좀 더 정교하게」): 고르게 흩던 것을 숲 덩이로 모아 심는다 — 소나무 숲(가지·솔잎 구름이 보이는 farmtree 모델), 느티나무·떨기 섞임,
   개울가엔 버드나무 줄, 놀이 넓이 밖 산비탈엔 숲(멀어서 가벼운 모델·그림자 없음). 잎이 따로인 나무는 철마다 물들고 겨울엔 잎이 진다(LEAFS). */
const treeAvoid = (x, z) => (x > 96 && x < 222 && z > 40 && z < 200) || (x > 14 && x < 96 && z > 96 && z < 206) || (x > 216 && x < 296 && z > 52 && z < 212) || (x > 324 && x < 372 && z > 98 && z < 156) || Math.abs(z - 128.5) < 7 || Math.abs(z - 142.5) < 5 || lineDist(x, z, STREAM)[0] < 6.5 || (Math.abs(x - 95) < 4);
const LEAFS = [], LITE = [];   /* LITE = 느린 기기에서 그림자를 끌 장식(나무·떨기) */
{ const T = { ft_pine: [], ft_pine2: [], zel: [], ft_bush: [], rock_a: [], wil: [] }, put = [];
  const ok = (x, z, gap) => !treeAvoid(x, z) && !put.some((q) => Math.abs(q[0] - x) < gap && Math.abs(q[1] - z) < gap);
  for (let c = 0; c < 17; c++) { const cx = 4 + drnd() * 372, cz = 20 + drnd() * 190, pineLand = cz < 60 || cx > 296 || cx < 14; let n = 3 + Math.floor(drnd() * 5);
    for (let i = 0; i < n * 3 && n > 0; i++) { const a = drnd() * 6.28, r = Math.sqrt(drnd()) * 11, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (!ok(x, z, 3.6)) continue; n--; put.push([x, z]);
      const k = drnd(), nm = pineLand ? (k < 0.45 ? 'ft_pine' : k < 0.8 ? 'ft_pine2' : k < 0.92 ? 'ft_bush' : 'rock_a') : (k < 0.3 ? 'ft_pine' : k < 0.5 ? 'zel' : k < 0.62 ? 'ft_pine2' : k < 0.86 ? 'ft_bush' : 'rock_a');
      T[nm].push([x, hAt(x, z) - 0.05, z, (nm === 'zel' ? 0.75 : nm === 'rock_a' ? 1.2 : 0.85) + drnd() * 0.4, drnd() * 6.28]); } }
  /* 개울가 버드나무: 물가를 따라 드문드문 */
  for (let x = 66; x < 250; x += 9 + drnd() * 12) { const z = drnd() < 0.5 ? 39.4 - drnd() * 1.5 : 53.6 + drnd() * 1.5; if ((Math.abs(x - 95) < 6) || Math.abs(x - 150) < 9 || Math.abs(x - 118) < 5 || (z > 52 && x > 104 && x < 216)) continue; T.wil.push([x, hAt(x, z), z, 0.85 + drnd() * 0.35, drnd() * 6.28]); }
  T.wil.push([60, 0, 126, 1, 0.4], [100, 0, 120, 0.95, 2]);
  for (const nm of ['ft_pine', 'ft_pine2', 'ft_bush', 'rock_a']) LITE.push(artInst(scene, nm, T[nm], {}, { shadow: true }));
  LITE.push(artInst(scene, 'ft_zel_trunk', T.zel, {}, { shadow: true })); const zl = artInst(scene, 'ft_zel_leaf', T.zel, {}, { shadow: true }); if (zl) LEAFS.push([zl, 'ft_zel_leaf', 'zel']); LITE.push(zl);
  LITE.push(artInst(scene, 'ft_wil_trunk', T.wil, {}, { shadow: true })); const wl = artInst(scene, 'ft_wil_leaf', T.wil, {}, { shadow: true }); if (wl) LEAFS.push([wl, 'ft_wil_leaf', 'wil']); LITE.push(wl);
  /* 판 밖 산비탈 숲: 언덕마다 덩이로 */
  const F = { pine_a: [], pine_b: [], tree_b: [] };
  for (let c = 0; c < 46; c++) { let cx, cz; const side = c % 4; if (side === 0) { cx = -150 + drnd() * 680; cz = -150 + drnd() * 150; } else if (side === 1) { cx = -200 + drnd() * 190; cz = drnd() * 260; } else if (side === 2) { cx = 392 + drnd() * 200; cz = drnd() * 260; } else { cx = -150 + drnd() * 680; cz = 292 + drnd() * 120; }
    const n = 5 + Math.floor(drnd() * 8); for (let i = 0; i < n; i++) { const a = drnd() * 6.28, r = Math.sqrt(drnd()) * 16, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; const k = drnd(), nm = k < 0.5 ? 'pine_a' : k < 0.8 ? 'pine_b' : 'tree_b'; F[nm].push([x, hAt(x, z) - 0.2, z, 1.4 + drnd() * 1.1, drnd() * 6.28]); } }
  for (const nm in F) artInst(scene, nm, F[nm], { leaf: 0x4e7a3a, bark: 0x5a4636 }, { shadow: false }); }
artInst(scene, 'reed', Array.from({ length: 110 }, () => { const x = 70 + drnd() * 180, z = 40.4 + drnd() * 2.6 + (drnd() < 0.5 ? 9.2 : 0); return [x, hAt(x, z), z, 0.8 + drnd() * 0.6, drnd() * 6]; }), {}, { shadow: false });

/* ───── 고을 꾸미기(준호 11-23 「블렌더로 디자인 해 보자」) — farmset.glb(tools/blender/make_farmset.py).
   집마다 마당(흙바닥·돌담·싸리울·사립문·장독대·텃밭·외양간·감나무), 마을 어귀 정자나무와 평상·서낭당, 개울에 섶다리와 물레방아,
   읍내에 주막·차일 가게·관아 담과 삼문·방 붙이는 판. 낮은 담(돌담·싸리울)은 넘어간다(느려짐), 관아·양반댁 높은 담은 막힌다(WALLS) — 문으로 다닌다. 놀이 규칙은 그대로. ───── */
const WALLS = [], _runs = {};
function wallRun(name, x0, z0, x1, z1, block = true) { const along = Math.abs(x1 - x0) >= Math.abs(z1 - z0), L = along ? Math.abs(x1 - x0) : Math.abs(z1 - z0), n = Math.max(1, Math.round(L / 4)), k = L / (n * 4);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; (_runs[name] = _runs[name] || []).push([lerp(x0, x1, t), 0, lerp(z0, z1, t), along ? [k, 1, 1] : [k, 1, 1], along ? 0 : Math.PI / 2]); }
  if (block) WALLS.push([Math.min(x0, x1) - (along ? 0 : 0.45), Math.max(x0, x1) + (along ? 0 : 0.45), Math.min(z0, z1) - (along ? 0.45 : 0), Math.max(z0, z1) + (along ? 0.45 : 0), name !== 'gwana_dam']); }   /* 다섯째 = 낮은 담(넘어간다 — 느려질 뿐 막히지 않는다) */
const yard = (x0, z0, x1, z1, c) => YARDS.push([x0, z0, x1, z1, c]);
const SEASON_LEAF = [], SEASON_FRUIT = [];
function gam(x, z, s = 1, ry = 0) { const a = putArt('gam_trunk', x, z, ry, s), b = putArt('gam_leaf', x, z, ry, s), c = putArt('gam_fruit', x, z, ry, s); if (b) LEAFS.push([b, 'gam_leaf', 'gam']); if (c) SEASON_FRUIT.push(c); }
/* 우리 집 */
yard(33, 136, 61, 162); wallRun('dam_stone', 33, 136, 61, 136); wallRun('dam_stone2', 33, 136, 33, 160); wallRun('ul_ssari', 61, 136, 61, 139.5); wallRun('ul_ssari', 61, 149, 61, 157);
putArt('sarip', 61, 147.6, Math.PI / 2); putArt('jangdokdae', 37.5, 139.5, 0); putArt('oeyanggan', 57, 153.5, -Math.PI / 2); putArt('namutdan', 42, 137.4, 0); putArt('teotbat', 57, 167, 0, 0.9); gam(36, 157.5, 1.05, 1);
/* 김 서방네 · 박 서방네(넉넉하다) · 최 서방네(빠듯하다) */
yard(19, 105, 41, 124); wallRun('dam_stone', 19, 105, 41, 105); wallRun('ul_ssari', 19, 105, 19, 121); putArt('jangdokdae', 23, 109, 0, 0.9); putArt('teotbat', 24, 129, 0, 0.85); gam(38.5, 108, 0.95, 2); putArt('namutdan', 36, 106.4, 0);
yard(60, 95, 86, 114); wallRun('dam_stone2', 60, 95, 86, 95); wallRun('dam_stone', 60, 95, 60, 111); wallRun('dam_stone', 86, 95, 86, 107); putArt('jangdokdae', 64, 99, 0, 1.1); putArt('oeyanggan', 81.5, 100, 0); gam(63, 110, 1.15, 0.5); gam(83, 110.5, 0.9, 3); putArt('namutdan', 70, 96.4, 0); putArt('namutdan', 73.5, 96.4, 0); putArt('teotbat', 66, 119, 0, 0.9);
yard(73, 145, 91, 162, 0xc4ac7c); wallRun('ul_ssari', 73, 145, 73, 159); wallRun('ul_ssari', 73, 145, 81, 145); putArt('teotbat', 86, 166, 0, 0.7); putArt('namutdan', 76, 146.4, 0);
/* 마을 어귀: 정자나무와 평상 · 서낭당 */
{ const a = putArt('jeongja_trunk', 82, 128), b = putArt('jeongja_leaf', 82, 128); if (b) LEAFS.push([b, 'jeongja_leaf', 'zel']); putArt('pyeongsang', 85.5, 130.5, 0.3); putArt('pyeongsang', 79, 131.5, -0.4); putArt('seonang', 101.5, 151, 1.2); }
/* 개울: 섶다리(큰길이 건너는 곳) · 물레방아 */
putArt('seopdari', 95, 46.5, Math.PI / 2); putArt('mulle_house', 118, 41.4, 0); const mulleWheel = putArt('mulle_wheel', 118, 41.4); if (mulleWheel) mulleWheel.position.set(118, 1.05, 43.0);   /* 바퀴 아래가 개울물에 잠기게 */
{ const d = putArt('didimdol', 176, 46.5, Math.PI / 2, 1.6); if (d) { d.position.y = -0.3; d.scale.set(1.6, 4, 1.6); } }
/* 읍내: 장터 바닥 · 주막 · 차일 가게 · 관아 담과 삼문 · 방 */
yard(232, 112, 270, 146, 0xd2bc8c); putArt('jumak', 224, 139.5, Math.PI); putArt('chail_w', 264, 139, Math.PI); putArt('chail_b', 236, 138.5, Math.PI); putArt('chail_b', 264.5, 118, 0); putArt('chail_w', 236, 118.5, 0);
yard(261, 84, 295, 112, 0xd8c8a0); wallRun('gwana_dam', 261, 112, 267, 112); wallRun('gwana_dam', 275, 112, 295, 112); wallRun('gwana_dam', 295, 84, 295, 112); wallRun('gwana_dam', 261, 84, 261, 112); wallRun('gwana_dam', 261, 84, 295, 84);
putArt('sammun', 271, 112, 0); putArt('bang_pan', 263.5, 116.5, Math.PI);
/* 양반댁 담 */
wallRun('gwana_dam', 208, 46, 244, 46); wallRun('gwana_dam', 244, 46, 244, 68); wallRun('gwana_dam', 208, 46, 208, 68); wallRun('gwana_dam', 208, 68, 220, 68); wallRun('gwana_dam', 232, 68, 244, 68); yard(208, 46, 244, 68, 0xd8c8a0); gam(240, 63, 1.2, 1); gam(212, 50, 1.1, 4);
for (const k in _runs) artInst(scene, k, _runs[k], {}, {});
/* 풀 포기와 들꽃: 길가 · 담 밑 · 논두렁 */
{ const P = [], F = []; for (let i = 0; i < 520; i++) { const x = 10 + drnd() * 360, z = 34 + drnd() * 174; if (WALLS.some((w) => x > w[0] - 1 && x < w[1] + 1 && z > w[2] - 1 && z < w[3] + 1)) continue; if (x > 110 && x < 214 && z > 60 && z < 180) { const gx = (x - 112) % 26, gz = (z - 62) % 30; if (gx < 22.6 && gz < 26.6) continue; } if ((Math.abs(z - 142.5) < 2.4 && x > 40 && x < 214) || (Math.abs(z - 128.5) < 3 && x > 214) || (Math.abs(x - 95) < 3.4) || (z > 43 && z < 50 && x > 86 && x < 244)) continue; (i % 6 ? P : F).push([x, 0, z, 0.8 + drnd() * 0.9, drnd() * 6]); }
  artInst(scene, 'pul', P, {}, { shadow: false }); artInst(scene, 'deulkkot', F, {}, { shadow: false }); }
/* 길잡이가 담을 돌아가게: 관아 안팎이 갈리면 삼문을 먼저 가리킨다 */
const BLOCKS = [[261, 295, 84, 112], [208, 244, 46, 68]];   /* 높은 담으로 두른 곳: 관아 · 양반댁 */
const inGwana = (x, z) => x > 261.4 && x < 294.6 && z > 84.4 && z < 111.6;   /* 담 안쪽만(담 두께에 선 것을 안으로 보면 길잡이가 담 모서리에 걸렸다) */
function segHits(ax, az, bx, bz, r, pad) { const x0 = r[0] - pad, x1 = r[1] + pad, z0 = r[2] - pad, z1 = r[3] + pad; let t0 = 0, t1 = 1; const dx = bx - ax, dz = bz - az;
  for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dz, az - z0], [dz, z1 - az]]) { if (p === 0) { if (q < 0) return false; } else { const t = q / p; if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; } } } return t0 < t1; }
function routeTo(p) { if (!p) return p; const a = inGwana(S.px, S.pz), b = inGwana(p[0], p[1]), atGate = Math.abs(S.px - 271) < 2.4 && S.pz > 106 && S.pz < 119;   /* 안팎이 갈리면 삼문 안쪽 앞(271,108)과 바깥 앞(271,116)을 거쳐 간다 — 담 모서리로 곧장 가다 막히던 것 */
  if (a && !b) return atGate ? [271, 116.5] : [271, 108]; if (!a && b) { if (atGate) return S.pz > 110.4 ? [271, 107.5] : p; p = [271, 116]; }
  for (const r of BLOCKS) { if (!segHits(S.px, S.pz, p[0], p[1], r, 0.8)) continue; let best = null, bd = 1e9; for (const c of [[r[0] - 2.5, r[2] - 2.5], [r[1] + 2.5, r[2] - 2.5], [r[0] - 2.5, r[3] + 2.5], [r[1] + 2.5, r[3] + 2.5]]) { if (dist(S.px, S.pz, c[0], c[1]) < 1.6 || segHits(S.px, S.pz, c[0], c[1], r, 0.6)) continue; const d = dist(S.px, S.pz, c[0], c[1]) + dist(c[0], c[1], p[0], p[1]) + (segHits(c[0], c[1], p[0], p[1], r, 0.8) ? 400 : 0); if (d < bd) { bd = d; best = c; } } if (best) return best; }
  return p; }
/* 철마다 잎: 봄 연두 · 여름 짙은 초록(모델 색) · 가을 단풍(느티 붉은 갈색 · 감 주황 · 버들 노랑) · 겨울 잎 짐 */
const LEAF_T = { zel: [{ leaf: 0x80c04c, leafd: 0x62a03c, leafl: 0xa4d468 }, {}, { leaf: 0xc8702c, leafd: 0xa25424, leafl: 0xe0a040 }], gam: [{ leaf: 0x7ab84a, leafd: 0x5c9a3a, leafl: 0x9ccc60 }, {}, { leaf: 0xd4642a, leafd: 0xb04a22, leafl: 0xe89a3a }], wil: [{ wil: 0xb4d868, wild: 0x94bc50 }, {}, { wil: 0xdccc58, wild: 0xc0aa44 }] };
let leafSn = -1;
const LEAF_C = { zel: [0x90cc5a, 0x5e9e42, 0xc8702c], gam: [0x86c654, 0x5c9c3e, 0xd4642a], wil: [0xb6da6a, 0x8ebe50, 0xdccc58] };   /* 구워 입힌 나무: 흰 바탕 잎에 철 색을 곱한다 */
function leafSeason(sn) { if (sn === leafSn) return; leafSn = sn; for (const [m, nm, k] of LEAFS) { m.visible = sn !== 3; if (sn < 3) { if (BAKED[nm]) { const mt = tintMat(BAKED[nm].mat, LEAF_C[k][sn]); eachInst(m, (q) => { q.material = mt; }); } else { const g = artGeo(nm, LEAF_T[k][sn]); if (g) m.geometry = g; } } } }
function dressTick() { const sn = S.season; leafSeason(sn); for (const m of SEASON_LEAF) m.visible = sn !== 3; for (const m of SEASON_FRUIT) m.visible = sn === 2; if (mulleWheel) mulleWheel.rotation.z = -S.t * 0.9; }

/* ───── 논 열넷 + 밭 둘 ───── */
const COLX = [112, 138, 164, 190], ROWZ = [62, 92, 122, 152], PW = 22, PD = 26;
const OWN0 = [['lord', 'A', 'lord', 'B'], ['me', 'lord', 'C', 'lord'], ['A', 'me', 'lord', 'B'], ['lord', 'C', null, null]];
const WHO_COL = { me: 0xffcf4d, A: 0x4a8ad6, B: 0xd6564a, C: 0x4ab07a, lord: 0x3a3a44 }, WHO_NAME = { me: '우리', A: '김 서방', B: '박 서방', C: '최 서방', lord: '양반댁' };
const TUFTS = 88;   /* 한 배미에 88그루 — 한 그루 = 포기 넷(블렌더 모델) */
const plots = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const o = OWN0[r][c]; if (!o) continue; plots.push({ id: plots.length, r, c, x0: COLX[c], z0: ROWZ[r], cx: COLX[c] + PW / 2, cz: ROWZ[r] + PD / 2, wet: r < 2, owner0: o, kind: 'paddy' }); }
plots.push({ id: plots.length, x0: 16, z0: 178, cx: 24, cz: 185, w: 16, d: 14, owner0: 'me', kind: 'field', wet: false }, { id: plots.length + 1, x0: 38, z0: 182, cx: 46, cz: 189, w: 16, d: 14, owner0: 'lord', kind: 'field', wet: false });
/* 논에 서는 것(준호 11-20 「벼가 뿔 모양이다」 → 원뿔 대신 블렌더 모델): 자람새마다 한 겹씩, 그 철에 그 모습인 그루만 그린다(그리기 한 번씩) */
const STAGES = ['rice_young', 'rice_grow', 'rice_ripe', 'rice_dead', 'rice_stub', 'tob_plant', 'bean'], stIM = {};
for (const n of STAGES) { const im = new THREE.InstancedMesh(artGeo(n), artMat, plots.length * TUFTS); im.count = 0; im.frustumCulled = false; im.castShadow = false; im.receiveShadow = true; scene.add(im); stIM[n] = im; }
const SHEAF_N = 10, sheafIM = new THREE.InstancedMesh(artGeo('rice_sheaf'), artMat, plots.length * SHEAF_N); sheafIM.count = 0; sheafIM.frustumCulled = false; sheafIM.castShadow = true; scene.add(sheafIM);
let plotDirty = true;
for (const p of plots) { p.w = p.w || PW; p.d = p.d || PD;
  p.soil = box(p.w, 0.14, p.d, 0x9a7a4e); p.soil.castShadow = false; p.soil.receiveShadow = true; at(p.soil, p.cx, 0.05, p.cz); scene.add(p.soil);
  p.flag = new THREE.Group(); p.flag.add(at(cyl(0.07, 0.07, 3, 0x5a4630, 5), 0, 1.5, 0)); p.cloth = box(0.06, 0.7, 1.1, 0xffffff); p.cloth.castShadow = false; p.flag.add(at(p.cloth, 0, 2.6, 0.6)); p.flag.position.set(p.x0 + 1.2, 0, p.z0 + p.d - 1.2); scene.add(p.flag);
  p.sign = new THREE.Group(); p.sign.add(at(cyl(0.08, 0.08, 1.6, 0x6a4a2a, 5), 0, 0.8, 0), at(box(1.6, 0.9, 0.1, 0xf2e2b8), 0, 1.7, 0)); p.sign.position.set(p.cx, 0, p.z0 + p.d + 1.6); p.sign.visible = false; scene.add(p.sign);
  p.pos = Array.from({ length: TUFTS }, (_, i) => { const gx = i % 8, gz = Math.floor(i / 8); return { gx: p.x0 + 2 + gx * (p.w - 4) / 7, gz: p.z0 + 2 + gz * (p.d - 4) / 10, rx: p.x0 + 1.6 + drnd() * (p.w - 3.2), rz: p.z0 + 1.6 + drnd() * (p.d - 3.2), s: 0.8 + drnd() * 0.5, ry: drnd() * 6.28 }; }); }
/* 땅 · 물 · 논두렁(land.js) */
const land = makeLand(scene, { roads: ROADS, yards: YARDS, plotsRects: plots.map((p) => [p.x0, p.z0, p.x0 + p.w, p.z0 + p.d]) }), groundM = land.ground;
const dikeM = dikes(scene, plots.map((p) => [p.x0, p.z0, p.x0 + p.w, p.z0 + p.d]));
/* 물 댄 논: 하늘이 비치는 물낯(논마다 한 장 — 물을 댔을 때만) */
const paddyW = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), land.wPaddy, plots.length); paddyW.count = 0; paddyW.frustumCulled = false; paddyW.renderOrder = 2; scene.add(paddyW);
const waterSky = new THREE.Color(0xcfe2f0);
/* 이 배미가 지금 어떤 모습인가 → [모델, 높이 배율, 너비 배율] */
function plotStage(p) { if (p.sow === 'none' && !p.stub) return null; const g = clamp(p.grow, 0.12, 1), wb = p.weedBad ? 0.8 : 1;
  if (p.cut) return ['rice_stub', 1, 1];
  if (p.sow === 'tob') return ['tob_plant', (0.35 + 0.75 * g) * wb, 0.55 + 0.5 * g];
  if (p.sow === 'bean') return ['bean', (0.5 + 0.6 * g) * wb, 0.8 + 0.3 * g];
  if (p.dead) return ['rice_dead', 1, 1.15];
  if (p.ripe) return ['rice_ripe', wb, 1.3];
  if (g < 0.4) return ['rice_young', 0.55 + g * 1.2, 0.8 + g];
  return ['rice_grow', (0.45 + 0.55 * g) * wb, 0.95 + 0.35 * g]; }
function flushPlots() { if (!plotDirty) return; plotDirty = false; const cnt = {}; for (const n in stIM) cnt[n] = 0; let sc = 0;
  for (const p of plots) { const st = plotStage(p); if (!st) continue; const im = stIM[st[0]]; if (!im) continue; const neat = p.sow === 'mo' || p.sow === 'tob';
    for (let i = 0; i < TUFTS; i++) { const q = p.pos[i]; _o.position.set(neat ? q.gx : q.rx, 0.08, neat ? q.gz : q.rz); _o.scale.set(q.s * st[2], q.s * st[1], q.s * st[2]); _o.rotation.set(0, q.ry, 0); _o.updateMatrix(); im.setMatrixAt(cnt[st[0]]++, _o.matrix); }
    /* 벤 논에는 볏단을 두 줄로 세워 말린다 */
    if (p.cut && p.kind === 'paddy' && !p.dead && p.sow !== 'tob' && p.sow !== 'bean') for (let k = 0; k < SHEAF_N; k++) { const q = p.pos[(k * 37 + p.id * 11) % TUFTS]; _o.position.set(p.x0 + 3 + (k % 5) * (p.w - 6) / 4 + (q.s - 1) * 1.5, 0.08, p.z0 + (k < 5 ? p.d * 0.33 : p.d * 0.68) + (q.s - 1) * 2); _o.scale.setScalar(1.1 + (q.s - 1) * 0.4); _o.rotation.set(0, q.ry, 0); _o.updateMatrix(); sheafIM.setMatrixAt(sc++, _o.matrix); } }
  for (const n in stIM) { stIM[n].count = cnt[n]; stIM[n].instanceMatrix.needsUpdate = true; } sheafIM.count = sc; sheafIM.instanceMatrix.needsUpdate = true;
  let wc = 0; for (const p of plots) if (p.flood) { _o.position.set(p.cx, 0.17, p.cz); _o.scale.set(p.w - 0.2, 1, p.d - 0.2); _o.rotation.set(0, 0, 0); _o.updateMatrix(); paddyW.setMatrixAt(wc++, _o.matrix); } paddyW.count = wc; paddyW.instanceMatrix.needsUpdate = true; }
function drawPlot(p) { plotDirty = true;
  p.flood = p.kind !== 'field' && p.sow !== 'none' && !p.cut && S.season <= 1 && !(S.drought && !(p.wet && S.bo >= 6) && S.season >= 1);   /* 물 댄 논 → 물낯을 띄운다 */
  p.soil.material.color.set(S.season === 3 ? 0xdfe3e4 : p.kind === 'field' ? 0x8a6a44 : p.flood ? 0x5a4a34 : S.drought && S.season >= 1 && !(p.wet && S.bo >= 6) ? 0xb39a66 : 0x8a6c44);
  p.cloth.material.color.set(WHO_COL[p.farmer] || 0x888888); p.flag.visible = !!p.farmer; }
/* 보 · 물길 */
const boG = new THREE.Group(); for (let k = 0; k < 6; k++) { const s = box(3.2, 1.9 + (k % 2) * 0.3, 2.2, 0x8a8a84); at(s, BO[0] - 8 + k * 3.2, 0.25, BO[1]); s.visible = false; boG.add(s); } scene.add(boG);   /* 개울 바닥(-0.6)부터 쌓는다 */
/* 물길(보가 서면): 보 자리에서 갈라져 나와 논 위쪽을 따라 흐르는 좁은 도랑 — 예전엔 10칸 넓이라 개울이 두 배로 넓어진 것처럼 보였다 */
const canal = land.ribbon([[214, 55.1], [108, 55.1]], 1.5, 0.06); canal.visible = false; const canalHead = land.ribbon([[BO[0], 49.6], [BO[0], 55.1]], 1.4, 0.07); canalHead.visible = false; const canal2 = land.ribbon([[136, 55.6], [136, 120]], 1.4, 0.06); canal2.visible = false; const canal3 = land.ribbon([[188, 55.6], [188, 120]], 1.4, 0.06); canal3.visible = false;
/* 물꼬: 물길에서 물 댄 논으로 흘러드는 작은 터진 자리(보가 서면) */
const mulkko = []; for (const [x, z, ax] of [[134.6, 75, -1], [137.4, 75, 1], [134.6, 105, -1], [137.4, 105, 1], [186.6, 75, -1], [189.4, 75, 1], [186.6, 105, -1], [189.4, 105, 1]]) { const r = land.ribbon([[x - ax * 0.7, z], [x + ax * 1.2, z]], 0.8, 0.5, land.wCanal); r.visible = false; mulkko.push(r); }
/* 보에 물이 넘치는 모습: 보 아래(서쪽 — 개울은 서쪽으로 흐른다)에 흰 물보라 */
const boFoam = land.ribbon([[BO[0] - 1.5, 46.5], [BO[0] - 5.5, 46.5]], 7.4, -0.1, (() => { const m = land.waters[0].clone(); m.uniforms = THREE.UniformsUtils.clone(land.waters[0].uniforms); m.uniforms.uDeep.value.set(0xd8eef2); m.uniforms.uShallow.value.set(0xffffff); m.uniforms.uFlow.value = 2.6; land.waters.push(m); return m; })()); boFoam.visible = false;
const boPile = putArt('stone_pile', BO[0] + 14, BO[1] + 5) || putArt('rock_big', BO[0] + 14, BO[1] + 5);
/* 표시 고리(걸어가서 고르는 자리) */
const pads = {}; function pad(key, x, z, col = 0xffcf4d) { const m = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.7, 28), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.09, z); m.visible = false; scene.add(m); pads[key] = { m, x, z }; return pads[key]; }
pad('seed', ...SEED); pad('nurs', ...NURS, 0x7ad65a); pad('tobs', ...TOBS, 0x6a9a3a); pad('gran', ...GRAN); pad('granT', GRAN[0] + 4, GRAN[1] + 3, 0x6a9a3a); pad('door', ...DOOR, 0xffffff);
pad('bo', BO[0], BO[1] + 4, 0x7ac8ff); pad('town', ...TOWN); pad('next', ...NEXT); pad('port', ...PORT); pad('pedd', ...PEDD); pad('gwe', GWE[0], GWE[1] + 2.4, 0xff6a4a); pad('paper', ...PAPER, 0xc8a0ff);
pad('duty', ...DUTY, 0xff6a4a); pad('ox', ...OX); pad('cloth', ...CLOTH, 0x9ad0ff); pad('lordBuy', LORD[0], LORD[1] + 6, 0xc8a0ff); pad('work', LORD[0] - 8, LORD[1] + 6, 0xffffff);
const nurseryM = (() => { const g = new THREE.Group(); g.add(at(box(6, 0.12, 5, 0x6f8f9a), 0, 0.07, 0)); const im = new THREE.InstancedMesh(artGeo('rice_young'), artMat, 15); im.castShadow = false; for (let i = 0; i < 15; i++) { _o.position.set(-2.2 + (i % 5) * 1.1, 0.12, -1.6 + Math.floor(i / 5) * 1.6); _o.scale.set(0.42, 0.6, 0.42); _o.rotation.set(0, i * 1.7, 0); _o.updateMatrix(); im.setMatrixAt(i, _o.matrix); } g.add(im); g.userData.im = im; g.position.set(NURS[0], 0, NURS[1] + 4.6); scene.add(g); return g; })();   /* 못자리: 촘촘한 어린 모 */
/* 움직이는 짐승(beasts.js): 개 한 마리 · 닭 넷(흰 둘·누런 둘) · 소 셋(우리 소 · 읍내 소 장수의 둘) */
const BK = beastKit(scene), dogH = BK.herd('dog', 1), henW = BK.herd('hen', 2, { fur: 0xf4f0e6, tail: 0x3a3a34 }), henB = BK.herd('hen', 2, { fur: 0xc07c40, tail: 0x5a2c18 }), oxH = BK.herd('ox', 3);
const oxM = oxH.rigs[0].root; oxM.position.set(HOME[0] + 9, 0, HOME[1] + 2); oxM.rotation.y = 1.2; oxM.visible = false; const oxS = { x: HOME[0] + 9, z: HOME[1] + 2, face: 1.2, sp: 0, on: false, cx: 0, cz: 0 }; const cartM = putArt('cart', HOME[0] + 12, HOME[1] + 4, 1.2) || putArt('handcart', HOME[0] + 12, HOME[1] + 4); if (cartM) cartM.visible = false;
const cartLoad = cartM && art('sack_pile'); if (cartLoad) { cartLoad.position.set(0, 0.8, 0.1); cartLoad.scale.setScalar(0.75); cartLoad.visible = false; cartM.add(cartLoad); }   /* 소가 실어 가는 짐은 달구지 위에 */
oxH.rigs[1].root.position.set(OX[0] + 3, 0, OX[1] + 2); oxH.rigs[1].root.rotation.y = 0.6; oxH.rigs[2].root.position.set(OX[0] + 5.5, 0, OX[1] - 1); oxH.rigs[2].root.rotation.y = 2;
/* 지고 가는 것 */
const carryM = { seed: art('sack'), mo: art('mo_bundle'), tob: art('pk_tob') || art('bundle'), rice: art('pk_rice') || art('sack'), tobl: art('goods_tob') || art('bundle'), cloth: art('pk_cloth') || art('bundle'), stone: art('rock_a'), coin: art('coins') };
for (const k in carryM) if (carryM[k]) { carryM[k].visible = false; scene.add(carryM[k]); }
/* 눈 · 비 */
const wx = (() => { const N = 700, p = new Float32Array(N * 3); for (let i = 0; i < N; i++) { p[i * 3] = drnd() * 120 - 60; p[i * 3 + 1] = drnd() * 40; p[i * 3 + 2] = drnd() * 120 - 60; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.42, transparent: true, opacity: 0.9, depthWrite: false })); m.visible = false; m.frustumCulled = false; scene.add(m); return { m, p, N }; })();

/* ───── 사람들 ───── */
const { workPose, hipify, dogPose, henPose, oxPose } = BK;
const mkP = (o, sc) => { const m = hipify(person({ pants: 0xe8e2d2, skin: 0xf0c48e, ...o })); m.rotation.order = 'YXZ'; if (sc) m.scale.setScalar(sc); return m; };
const pMesh = mkP({ shirt: 0xf2ead8, hat: 'scarf' });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false, depthTest: false })); pRing.rotation.x = -Math.PI / 2; pRing.renderOrder = 5; scene.add(pRing);   /* 낮은 시점에서 집 뒤로 가도 발밑 고리는 보이게 */
const NB = { A: { name: '김 서방', home: [30, 118], col: 0x4a8ad6 }, B: { name: '박 서방', home: [72, 108], col: 0xd6564a }, C: { name: '최 서방', home: [82, 156], col: 0x4ab07a } };
for (const k in NB) { const n = NB[k]; n.k = k; n.mesh = mkP({ shirt: n.col, hat: k === 'B' ? 'paeraengi' : 'scarf' }); n.house = putArt(k === 'B' ? 'thatch_a' : 'thatch_b', n.home[0], n.home[1] - 5, 0, 1.05, { wall: 0xdcc8a2 }); n.x = n.home[0]; n.z = n.home[1]; n.tx = n.x; n.tz = n.z; n.wait = 0;
  n.sell = pad('sell' + k, n.home[0] - 3, n.home[1] + 3, 0xc8a0ff); n.help = pad('help' + k, n.home[0] + 3, n.home[1] + 3, 0x7ad65a); }
/* 굴뚝 연기(air.js): 초가 낮은 굴뚝 자리(모델 오른쪽 뒤) — 우리 집 · 이웃 셋 · 읍내 · 이웃 고을 · 산비탈 먼 마을 · 주막 아궁이 */
const air = airKit(scene);
{ const ch = (x, z, ry, sc, a, y0 = 0) => { const lx = (a ? 3.56 : 2.56) * sc, lz = -(a ? 0.9 : 0.8) * sc; return [x + lx * Math.cos(ry) + lz * Math.sin(ry), y0 + 1.6 * sc, z - lx * Math.sin(ry) + lz * Math.cos(ry), sc]; };
  air.chimneys([ch(HOME[0], HOME[1] - 6, 0, 1.15, true), ...Object.values(NB).map((n) => ch(n.home[0], n.home[1] - 5, 0, 1.05, n.k === 'B')), ch(232, 150, 0.3, 1, false), ch(272, 148, -0.4, 1, false), ch(226, 110, 0.8, 1, false), ch(334, 108, 0.5, 1, true), ch(362, 140, 0.9, 1, true),
    ...[[-30, 60, 1.2, 1], [-44, 74, 1.2, 0.4], [150, -30, 1.2, 0], [170, -40, 1.2, 2], [410, 180, 1.2, 1]].map(([x, z, k, r]) => ch(x, z, r, 1.2 * k, true, hAt(x, z) - 0.3)), [224 - 3.9, 0.9, 139.5 - 1.4, 0.8]]); }
const extras = [[LORD[0] + 4, LORD[1] + 7, { shirt: 0xdfe6f0, hat: 'gat' }, 0],   /* 양반: 대문 앞에서 길(남쪽)을 보고 섰다 → 다가가면 흘끗 보고 등을 돌린다 */ [GWE[0] + 2.4, GWE[1] - 1, { shirt: 0x3a4a7a, hat: 'gat' }, 3.14], [OX[0] + 1.6, OX[1] - 2, { shirt: 0xb08a5a, hat: 'paeraengi' }, 0], [247, 121, { shirt: 0xc8b08a, hat: 'scarf' }, 0], [256, 122, { shirt: 0x9a8a68, hat: 'paeraengi' }, 0.4], [244, 135, { shirt: 0xd0b890, hat: 'scarf' }, 3], [346, 123, { shirt: 0xb89a70, hat: 'paeraengi' }, 0], [352, 134, { shirt: 0xc8b08a, hat: 'scarf' }, 3], [PORT[0] - 3, PORT[1] + 1, { shirt: 0x6a7a8a, hat: 'paeraengi' }, 1.2]].map(([x, z, o, ry]) => { const m = mkP(o); m.position.set(x, 0, z); m.rotation.y = ry; walkAnim(m, 0, false); return m; });
const crowd = Array.from({ length: 7 }, (_, i) => ({ m: mkP({ shirt: [0xf2ead8, 0xd8c8a8, 0xc8d8e8, 0xe8d0c0][i % 4], hat: i % 3 ? 'scarf' : 'gat' }), a: i * 0.9, r: 7 + (i % 3) * 3, sp: 0.25 + (i % 4) * 0.06 }));
const peddler = mkP({ shirt: 0xb07a4a, hat: 'paeraengi' }); peddler.visible = false; const peddlerPack = art('bundle'); if (peddlerPack) { peddlerPack.visible = false; scene.add(peddlerPack); }
const ajeon = mkP({ shirt: 0x2a3a6a, hat: 'gat' }); ajeon.visible = false;
/* 아전 뒤에 포졸 둘(11-23: 멀리서 걸어오는 게 눈에 띄게) · 화면 밖에 있으면 가장자리에 붉은 알림 */
const pojol = [0, 1].map(() => { const m = mkP({ shirt: 0x2a2a30, pants: 0x3a3a40, hat: 'guard' }); m.visible = false; return m; });
const ajMark = document.createElement('div'); ajMark.id = 'ajm'; ajMark.style.cssText = 'position:fixed;transform:translate(-50%,-50%);background:rgba(150,30,20,.94);color:#fff;font-weight:900;font-size:16px;padding:6px 12px;border-radius:14px;white-space:nowrap;width:max-content;pointer-events:none;display:none;z-index:4;box-shadow:0 3px 0 rgba(0,0,0,.3);animation:pul .8s ease-in-out infinite'; document.body.appendChild(ajMark);
const servant = mkP({ shirt: 0xa89878, hat: 'scarf' }); servant.visible = false;
const tagBox = $('tags'), tags = Array.from({ length: 12 }, () => { const d = document.createElement('div'); d.className = 'tag'; d.innerHTML = '<span class="ic"></span>'; tagBox.appendChild(d); return d; });

/* ───── 사람들이 살아 있게(준호 11-23 「다른 캐릭터들도 각자 역할·움직임·반응 — 재밌는 반응도」)
   말풍선: 다가가면 돌아보고 한마디(처지·철·내 형편에 따라 다름) · 양반은 등을 돌림 · 부역엔 이웃도 나옴 · 쌀 꾸어 준 이웃은 품앗이를 옴 · 논을 사들인 이웃은 싸늘 · 개와 닭 */
const talkBox = $('tags'), talks = Array.from({ length: 7 }, () => { const d = document.createElement('div'); d.className = 'talk'; talkBox.appendChild(d); return d; }), TALKERS = [];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function talk(m, text, sec = 3.4, h = 3.3) { if (!m || !text) return; if (!TALKERS.includes(m)) TALKERS.push(m); m._talk = { text, t: sec, h }; if (dist(S.px, S.pz, m.position.x, m.position.z) < 30) tone(520 + Math.random() * 200, 700, 0.06, 'triangle', 0.05); }
const nbCount = (k) => plots.filter((p) => p.farmer === k && p.kind === 'paddy').length;
function nbLine(n) { const k = n.k, sn = S.season, my = paddies().length, his = nbCount(k);
  if (n.rel < 0) return pick(['…', '흥.', '내 논이 자네 논이 됐구먼. 잘 지으시오.', '대대로 짓던 논이었소.']);
  if (S.slow > 0) return pick(['아이고, 곤장 맞았다며? 엉덩이는 괜찮소?', '된장을 바르시오, 된장을.', '쯧쯧, 남 일 같지 않구먼.']);
  if (sn === 3 && n.trouble) return k === 'B' ? '올해는 나도 빠듯하네그려.' : pick(['…솥에 넣을 것이 없소. 염치없지만 쌀 좀 꾸어 주겠나.', '올겨울을 어찌 나나…']);
  if (n.rel > 0 && Math.random() < 0.5) return pick(['지난겨울 쌀, 잊지 않았소!', '자네 덕에 겨울을 났소. 품으로 갚으리다.']);
  if (S.yangban && Math.random() < 0.5) return pick(['어이쿠, 양반 나리 납시었소?', '나리, 어제까지 같이 김매던 사이 아니오. 허허.']);
  if (S.ox && Math.random() < 0.3) return pick(['소 좋네! 한번 쓰다듬어 봐도 되오?', '그 소, 하루만 빌려주면 안 되겠나?']);
  if (S.duty && S.duty.nbT > 0) return pick(['양반댁은 오늘도 아무도 안 나왔구먼.', '품삯도 없는 일, 얼른 끝내고 논에 가야 하는데.', '내 논 풀은 누가 매 주나…']);
  if (k === 'A') return pick(sn === 0 ? [n.method === 'mo' ? '나도 모내기를 해 보네. 허리는 아파도 풀이 덜 나!' : '올해도 볍씨나 뿌려야지. 모내기는 겁이 나서 원…', '봄볕이 좋소. 올해는 풍년이려나.'] : sn === 1 ? [S.drought ? '하늘도 무심하오. 비 한 방울을 안 주네.' : '김매다 허리가 부러지겠소.', S.bo >= 6 ? '자네가 쌓은 보 덕에 우리 논에도 물이 드오. 고맙소!' : '개울에 보라도 있으면 좋으련만.'] : sn === 2 ? ['올해 군포가 또 올랐다지? 우리 집 갓난쟁이도 군인이라오, 허허.', '아전 나리가 뜨기 전에 얼른 내야지.'] : ['긴 겨울이오. 새끼나 꼬아야지.', '내년엔 나도 못자리를 해 볼까…']);
  if (k === 'B') return pick([my > his ? '허, 자네가 나보다 넓게 짓다니… 내년엔 두고 보세.' : `자네 논이 몇 배미지? 나는 ${['영', '한', '두', '세', '네', '다섯', '여섯', '일곱'][his] || his} 배미일세. 세어 보게.`, sn === 0 ? '양반댁 논? 좋은 건 내가 먼저 찜했네!' : sn === 2 ? '쌀은 고개 너머가 값이 좋지. 아, 이건 비밀인데.' : sn === 3 ? '논 팔 사람 없나 둘러보는 중이네.' : '모내기를 하니 일손이 남아. 남는 손으로 논을 더 짓지!', '부지런한 놈이 땅을 갖는 걸세. 허허.']);
  return pick(sn === 0 ? ['모내기? 그거 하다 가물면 다 죽는다던데.', '씨 뿌리고 나면 낮잠이나 한숨 자야지.'] : sn === 1 ? ['잠깐 쉬는 중이오. 풀도 쉬어야 자라지.', S.drought ? '논바닥이 거북이 등짝 같소…' : '이놈의 풀은 뽑아도 뽑아도 나네.'] : sn === 2 ? ['아전 나리만 보면 다리가 후들거려.', '거둔 것의 반은 양반댁, 남은 건 관아… 내 몫은 어디 있나.'] : ['군불이나 때야지. 땔나무는 공짜니까.', '내년엔 좀 나아지려나.']); }
const ACT = [
  { m: extras[0], r: 8, away: () => !S.yangban, line: () => (S.yangban ? pick(['…자네가 양반? 족보가 어디 있나, 족보가.', '돈 주고 산 갓이 머리에 맞던가?']) : paddies().some((p) => p.owner === 'lord') ? pick(['내 논 잘 짓고 있겠지? 반은 내 것이다.', '에헴. 올해 소출이 시원찮으면 논을 거둘 것이야.']) : pick(['에헴.', '어허, 길을 비켜라.', '부역? 그건 상것들 일이지.'])) },
  { m: extras[1], line: () => (S.yangban ? '나리, 군포는 면제이옵니다.' : S.debt > 0 ? '빚 문서는 잘 있다. 이자도 무럭무럭 자라고.' : pick(['세금은 가을에. 한 푼도 깎아 줄 수 없다.', '갓난아기 몫? 장부에 이름이 있으면 내는 것이다.', '억울하면 양반으로 태어나든가.'])) },
  { m: extras[2], line: () => (S.seizedOx && !S.ox ? '소를 뺏겼다고? 쯧쯧… 마침 한 마리 더 있는데.' : S.ox ? '그 녀석 잘 먹이고 있나? 내가 키운 소일세.' : pick([`소 한 마리 ${P_OX}냥! 이빨 좀 보게, 튼튼하지?`, '소가 있으면 달구지에 세 곱절을 싣는다네.', '겨울에 오게. 겨울에만 판다네.'])) },
  { m: extras[3], line: () => pick([`쌀 사려! 읍내 쌀은 ${price('town')}냥!`, '저울은 속이지 않소. …많이는.', '오늘 장은 사람이 많구먼.']) },
  { m: extras[4], line: () => pick(['담배 한 대 피워 보시게. 요즘 다들 이것만 찾아.', '담배 농사가 쌀농사보다 낫다는 사람도 있소.']) },
  { m: extras[5], line: () => pick(['엿 사시오, 엿! 가위 소리 들리오?', '울릉도 호박엿은 아니지만 달기는 다오.', '베 한 필 6냥. 고개 너머 가면 11냥 받는다던데, 내가 왜 이걸 말하나.']) },
  { m: extras[6], line: () => pick(['고개 넘어오느라 애썼소. 값은 잘 쳐 주리다.', '저 고개에 호랑이가 나온다던데, 못 봤소?']) },
  { m: extras[7], line: () => pick(['여긴 담배가 귀하오. 있으면 다 주시오!', '읍내보다 값이 좋지? 소문내지는 마시오.']) },
  { m: extras[8], line: () => (S.year < 3 ? '한양 배? 아직 물길이 안 열렸소.' : shipIn() ? '한양 가는 배요! 곧 닻을 올리니 서두르시오.' : pick(['배는 가을 한가운데 떠나오. 늦으면 헤엄쳐 오시게.', '한양 사람들은 쌀을 돈 주고 사 먹는다오. 신기하지?'])) },
  { m: peddler, line: () => pick(['방방곡곡 안 가 본 장이 없지. 아랫녘에선 다들 모를 옮겨 심더이다.', '값은 좀 싸게 쳐도, 내가 여기까지 걸어온 값이오.', '짚신이 한 달에 세 켤레씩 닳는다오.']) },
  { m: ajeon, r: 9, line: () => (S.taxPaid ? '흠, 냈군. 아쉽… 아니, 잘했다.' : '세금! 세금은 냈는가!') },
  { m: servant, line: () => pick(['주인어른, 김은 제가 매겠습니다.', '…저 논이 원래 제 논이었지요.']) }];
for (const a of ACT) { a.cool = 0; a.ry0 = a.m.rotation.y; }
/* 개 한 마리 · 닭 네 마리 */
const dog = { m: dogH.rigs[0].root, x: HOME[0] + 4, z: HOME[1] + 5, bark: 0, barkT: 0, sp: 0, idle: 0, sit: 0, lie: 0, face: 0 };
const hens = Array.from({ length: 4 }, (_, i) => { const r = (i % 2 ? henB : henW).rigs[i >> 1]; return { r, m: r.root, sp: 0, pk: 0, pkT: i * 1.3, x: HOME[0] + 8 + i * 1.6, z: HOME[1] + 9 + (i % 2) * 2, tx: HOME[0] + 9, tz: HOME[1] + 10, wait: i, run: 0, hx: HOME[0] + 9, hz: HOME[1] + 10 }; });
function actorsUpdate(dt) {
  for (const a of ACT) { a.cool -= dt; const m = a.m; if (!m.visible) continue; const d = dist(S.px, S.pz, m.position.x, m.position.z);
    if (a.chat > 0) { a.chat -= dt; if (m !== ajeon && m !== servant) { const to = -Math.atan2(S.pz - m.position.z, S.px - m.position.x) + Math.PI / 2 + (a.away && a.away() && a.chat < 2.7 ? Math.PI : 0);   /* 등 돌리기: 처음 0.7초는 흘끗 보고, 그다음 돌아선다 */ m.rotation.y += Math.atan2(Math.sin(to - m.rotation.y), Math.cos(to - m.rotation.y)) * Math.min(1, dt * 7); if (a.chat <= 0 && m !== peddler) a.back = 1; } }
    else if (a.back) { m.rotation.y += Math.atan2(Math.sin(a.ry0 - m.rotation.y), Math.cos(a.ry0 - m.rotation.y)) * Math.min(1, dt * 4); }
    if (d < (a.r || 5.5) && a.cool <= 0) { a.cool = 15; a.chat = 3.4; a.back = 0; talk(m, a.line()); } }
  for (const k in NB) { const n = NB[k]; n.cool = (n.cool || 0) - dt; if (n.gone) continue; if (dist(S.px, S.pz, n.x, n.z) < 6 && n.cool <= 0 && !(n.chatT > 0)) { n.cool = 16; n.chatT = 3.4; if (S.yangban && n.rel >= 0) n.bowT = 1.2; talk(n.mesh, nbLine(n)); } }
  /* 개: 마을 안에서는 내 뒤 오른쪽에 붙어 따라온다(바로 뒤면 가까이 시점에서 화면 밖으로 빠진다) */
  if (dog.m) { const inV = S.px < 108 && S.pz > 96, cx = Math.cos(S.pdir), sz = Math.sin(S.pdir), tx = inV ? S.px - cx * 2.1 - sz * 1.4 : HOME[0] + 4, tz = inV ? S.pz - sz * 2.1 + cx * 1.4 : HOME[1] + 5, d = dist(dog.x, dog.z, tx, tz), mv = d > 1.2;
    const x0 = dog.x, z0 = dog.z; let face = dog.face;
    if (mv) { const v = Math.min(9.5, 3 + d * 1.6); dog.x += (tx - dog.x) / d * v * dt; dog.z += (tz - dog.z) / d * v * dt; face = Math.atan2(tx - dog.x, tz - dog.z); }
    else if (inV) face = Math.atan2(S.px - dog.x, S.pz - dog.z) + (dog.sit > 0.5 ? 0 : 0.6);
    dog.sp += (Math.hypot(dog.x - x0, dog.z - z0) / Math.max(dt, 1e-3) - dog.sp) * Math.min(1, dt * 8); dog.idle = mv ? 0 : dog.idle + dt; dog.bark -= dt; dog.barkT -= dt;
    const ajNear = S.aj && !S.taxPaid && dist(dog.x, dog.z, S.aj.x, S.aj.z) < 34;
    if (ajNear && dog.bark <= 0) { dog.bark = 2.2; dog.barkT = 0.8; talk(dog.m, pick(['멍! 멍멍!', '으르르…', '멍!']), 1.4, 1.6); tone(420, 300, 0.09, 'square', 0.06); tone(440, 310, 0.09, 'square', 0.05, 0.14); }
    else if (inV && !mv && !S.moving && dog.bark <= 0 && Math.random() < dt * 0.05) { dog.bark = 6; if (Math.random() < 0.5) { dog.barkT = 0.4; talk(dog.m, pick(['멍?', '멍!']), 1.6, 1.6); } else talk(dog.m, pick(['헥헥', '(꼬리를 흔든다)']), 1.6, 1.6); }
    if (ajNear) face = Math.atan2(S.aj.x - dog.x, S.aj.z - dog.z);
    dog.face += Math.atan2(Math.sin(face - dog.face), Math.cos(face - dog.face)) * Math.min(1, dt * (mv ? 9 : 4));
    dog.sit += ((inV && dog.idle > 0.7 && !ajNear ? 1 : 0) - dog.sit) * Math.min(1, dt * 5); dog.lie += ((!inV && dog.idle > 2.5 ? 1 : 0) - dog.lie) * Math.min(1, dt * 2.5);
    const lk = inV && !mv ? Math.atan2(Math.sin(Math.atan2(S.px - dog.x, S.pz - dog.z) - dog.face), Math.cos(Math.atan2(S.px - dog.x, S.pz - dog.z) - dog.face)) : 0;
    dogPose(dogH.rigs[0], { sp: dog.sp, sit: dog.sit, lie: dog.lie, wag: ajNear ? 0.06 : inV && !mv ? (S.moving ? 0.5 : 0.75) : 0.3, tuck: ajNear && dog.barkT <= 0, bark: dog.barkT > 0 ? 1 : 0, look: clamp(lk, -0.9, 0.9), t: S.t, dt });
    dog.m.position.set(dog.x, 0, dog.z); dog.m.rotation.y = dog.face; }
  for (const h of hens) { const d = dist(S.px, S.pz, h.x, h.z); if (d < 3.6 && S.moving) { if (h.run <= 0) talk(h.m, pick(['꼬꼬댁!', '꼬꼬꼬!', '꼬끼오?!']), 1.2, 1.3); h.run = 1.2; const a = Math.atan2(h.z - S.pz, h.x - S.px) + (Math.random() - 0.5); h.tx = h.x + Math.cos(a) * 6; h.tz = h.z + Math.sin(a) * 6; }
    h.run -= dt; h.wait -= dt; if (h.run <= 0 && h.wait <= 0) { h.wait = 2 + Math.random() * 4; h.tx = h.hx + (Math.random() - 0.5) * 9; h.tz = h.hz + (Math.random() - 0.5) * 7; }
    const dd = dist(h.x, h.z, h.tx, h.tz), v = h.run > 0 ? 7 : 1.4, x0 = h.x, z0 = h.z; if (dd > 0.3) { h.x += (h.tx - h.x) / dd * v * dt; h.z += (h.tz - h.z) / dd * v * dt; const f = Math.atan2(h.tx - h.x, h.tz - h.z); h.m.rotation.y += Math.atan2(Math.sin(f - h.m.rotation.y), Math.cos(f - h.m.rotation.y)) * Math.min(1, dt * 12); }
    h.sp += (Math.hypot(h.x - x0, h.z - z0) / Math.max(dt, 1e-3) - h.sp) * Math.min(1, dt * 10);
    h.pkT -= dt; if (dd <= 0.3 && h.pkT <= 0) { h.pkT = 1.2 + Math.random() * 2.6; h.pkOn = 0.5 + Math.random() * 0.9; } h.pkOn = (h.pkOn || 0) - dt; h.pk += ((h.pkOn > 0 && dd <= 0.3 ? 1 : 0) - h.pk) * Math.min(1, dt * 10);
    henPose(h.r, { sp: h.sp, flee: h.run > 0 && dd > 0.3, peck: h.pk, t: S.t + h.hx * 0, dt }); h.m.position.set(h.x, 0, h.z); } }

/* ───── 소리 ───── */
const SFX = { pick: () => tone(660, 990, 0.12, 'triangle', 0.15), plant: () => { noise(0.06, 0.25, 900); tone(330, 440, 0.1, 'triangle', 0.08); }, coin: () => { tone(1320, 1760, 0.09, 'triangle', 0.14); tone(1760, 2100, 0.1, 'triangle', 0.1, 0.07); },
  drum: (v = 0.3) => { tone(70, 45, 0.5, 'sine', v); noise(0.18, v, 120); }, bad: () => { tone(300, 160, 0.5, 'sawtooth', 0.1); }, good: () => { [523, 659, 784].forEach((f, i) => tone(f, f, 0.3, 'triangle', 0.13, i * 0.1)); },
  season: () => { tone(392, 392, 0.3, 'sine', 0.12); tone(523, 523, 0.5, 'sine', 0.1, 0.2); }, cut: () => noise(0.12, 0.3, 1600), beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); }, win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.6, 'triangle', 0.16, i * 0.18)); }, sad: () => { tone(330, 220, 1.2, 'sine', 0.14); tone(262, 175, 1.4, 'sine', 0.1, 0.4); } };

let skyKey = '';
/* 하루(철 하나 = 아침부터 저녁): 해가 동쪽에서 남쪽 하늘을 지나 서쪽으로 · 아침 분홍빛 · 저녁 주황빛 노을 */
const DAY = { top: new THREE.Color(0x6aa6e8), low: new THREE.Color(0xeaf2e0), sunBase: 2.2, repaint: 0, hot: 0, sun: sunAt(0.3), warmC: new THREE.Color(0xffc890), t2: new THREE.Color(), l2: new THREE.Color() };
/* ───── 상태 ───── */
const S = { mode: 'title', view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, st: 0, year: 1, season: 0, px: HOME[0], pz: HOME[1] + 2, pdir: 0, moving: false, running: false, said: {}, sayT: 0,
  rice: 2, coin: 10, tob: 0, debt: 0, favor: 1, ox: false, yangban: false, knowMo: false, nursery: false, bo: 0, carry: null, taxDue: 0, taxPaid: false, drought: false, good: false,
  workT: 0, workKey: '', introT: 0, beatT: 0, stepT: 0, log: [], lost: [], gone: [], servant: null, labor: 0, soldY: 0, harvY: 0, lordY: 0, stats: { rented: 0, bought: 0, helped: 0, mo: 0, farMarket: 0 } };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say, ['위에서', '가까이', '어깨 너머', '지도', '높이서']);   /* 다섯째 「높이서」 = 예전 기본 시점(논이 한눈에) */
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 뛰기 단추 · 노란 고리나 논 안에 가만히 서면 그 일을 한다 · 「시점」 ⟲⟳';
let R = rng(seed0);
const mine = () => plots.filter((p) => p.farmer === 'me'), owned = () => plots.filter((p) => p.owner === 'me');
const cap = () => (S.ox ? CAP_OX : CAP), duro = () => (S.favor >= 3 ? 0.72 : 1) * (S.ox ? 0.8 : 1);
const shipIn = () => S.year >= 3 && S.season === 2 && S.st < SLEN[2] * 0.6;
const price = (where) => Math.round(([6, 5, 8, 6, 8][S.year - 1] || 6) * (where === 'next' ? 1.3 : where === 'port' ? 1.5 : where === 'pedd' ? 0.7 : 1));
const tobPrice = (where) => (where === 'next' ? 11 : where === 'port' ? 9 : where === 'pedd' ? 4 : 6);

function newGame() { R = rng(seed0 * 7 + 11);
  for (const p of plots) { p.owner = p.owner0; p.farmer = p.owner0 === 'lord' ? null : p.owner0; p.rent = null; resetPlot(p); }
  for (const k in NB) { const n = NB[k]; n.coin = k === 'B' ? 80 : 20; n.method = 'jik'; n.gone = false; n.trouble = false; n.rel = 0; n.helpY = 0; n.chatT = 0; n.cheer = 0; n.mesh.visible = true; if (n.house) n.house.visible = true; n.x = n.home[0]; n.z = n.home[1]; }
  Object.assign(S, { t: 0, st: 0, year: 1, season: 0, px: HOME[0], pz: HOME[1] + 2, rice: 2, coin: 10, tob: 0, debt: 0, favor: 1, ox: false, yangban: false, knowMo: false, nursery: false, bo: 0, carry: null, taxDue: 0, taxPaid: false, drought: false, good: false, workT: 0, log: [], lost: [], gone: [], goals: [], servant: null, labor: 0, nobi: false, fled: false, nobiNB: [], slow: 0, flogN: 0, dutyN: 0, seizedN: 0, seizedOx: false, hwan: 0, duty: null, aj: null, debtY: 0, seenTown: 0, clothY: 0, nextY: 0, portY: 0, tobY: 0, rentY: 0, boughtY: 0, stats: { rented: 0, bought: 0, helped: 0, mo: 0, farMarket: 0 } });
  S.droughtYears = R() < 0.5 ? [3, 5] : [3, 4]; S.goodYear = 2;
  boG.children.forEach((c) => (c.visible = false)); canal.visible = canalHead.visible = canal2.visible = canal3.visible = boFoam.visible = false; for (const m of mulkko) m.visible = false; if (oxM) oxM.visible = false; if (cartM) cartM.visible = false; servant.visible = false;
  if (mis) mis.reset(); startSeason(0, true); }
function resetPlot(p) { p.sow = 'none'; p.weed = 0; p.grow = 0; p.ripe = false; p.cut = false; p.dead = false; p.stub = false; p.weedBad = false; p.yield = 0; }

/* ───── 중간 저장(준호 11-19): 철이 바뀔 때마다 이 기기에 적어 둔다 → 첫 화면 「이어서 하기」 ───── */
const SAVE_KEY = 'kworld_farm_save_v1', S_KEYS = ['year', 'season', 'rice', 'coin', 'tob', 'debt', 'favor', 'ox', 'yangban', 'knowMo', 'nursery', 'bo', 'taxDue', 'taxPaid', 'drought', 'good', 'droughtYears', 'goodYear', 'log', 'lost', 'gone', 'servant', 'labor', 'soldY', 'harvY', 'lordY', 'stats', 'clothY', 'nextY', 'portY', 'tobY', 'rentY', 'boughtY', 'goals', 'taxOnTime', 'boY', 'oxY', 'ybY', 'tripY', 'seenTown', 'debtY', 'nobi', 'fled', 'nobiNB', 'slow', 'flogN', 'dutyN', 'seizedN', 'seizedOx', 'hwan'];
const P_KEYS = ['owner', 'farmer', 'rent', 'sow', 'weed', 'grow', 'ripe', 'cut', 'dead', 'stub', 'weedBad', 'yield', 'keep'];
function saveGame() { if (S.mode === 'title') return; try { const d = { v: 1, at: Date.now(), S: {}, plots: plots.map((p) => P_KEYS.map((k) => p[k])), nb: {} }; for (const k of S_KEYS) d.S[k] = S[k]; for (const k in NB) { const n = NB[k]; d.nb[k] = [n.coin, n.method, n.gone, n.trouble, n.rel || 0, n.helpY || 0]; } localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch (e) {} }
function readSave() { try { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return d && d.v === 1 && d.plots && d.plots.length === plots.length ? d : null; } catch (e) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
function loadGame(d) { newGame(); Object.assign(S, JSON.parse(JSON.stringify(d.S))); d.plots.forEach((a, i) => P_KEYS.forEach((k, j) => (plots[i][k] = a[j])));
  for (const k in NB) { const n = NB[k], a = d.nb[k]; if (!a) continue; [n.coin, n.method, n.gone, n.trouble] = a; n.rel = a[4] || 0; n.helpY = a[5] || 0; n.mesh.visible = !n.gone; n.x = n.home[0]; n.z = n.home[1]; n.wait = 0; }
  R = rng(seed0 * 7 + 11 + S.year * 10 + S.season); boG.children.forEach((c, i) => (c.visible = i < S.bo)); canal.visible = canalHead.visible = canal2.visible = canal3.visible = boFoam.visible = S.bo >= 6; for (const m of mulkko) m.visible = S.bo >= 6; if (oxM) oxM.visible = S.ox; if (cartM) cartM.visible = S.ox;
  S.st = 0; S.workT = 0; S.said = {}; S.carry = null; S.px = HOME[0]; S.pz = HOME[1] + 2; skyKey = ''; for (const p of plots) drawPlot(p); refreshTasks(); hud();
  say(`${S.year}번째 해 ${SEASONS[S.season]} — 이어서 한다`, null, 3.4); }

/* ───── 철 넘기기 ───── */
function startSeason(sn, first) { S.season = sn; S.st = 0; S.workT = 0; S.said = {}; SFX.season();
  if (sn === 0) { S.drought = S.droughtYears.includes(S.year); S.good = S.year === S.goodYear; S.taxPaid = false; S.taxOnTime = false; S.labor = 0; S.soldY = 0; S.harvY = 0; S.lordY = 0; S.tripY = 0; S.seenTown = S.seenTown || 0; S.clothY = 0; S.nextY = 0; S.portY = 0; S.tobY = 0; S.rentY = 0; S.boughtY = 0;
    for (const p of plots) { resetPlot(p); if (p.farmer && p.farmer !== 'me' && NB[p.farmer] && NB[p.farmer].gone) p.farmer = null; }
    /* 빌린 땅은 한 해 계약 — 봄마다 다시 */
    for (const p of plots) if (p.owner === 'lord') { if (p.farmer !== 'me' || !p.keep) { if (p.farmer === 'me') { /* 이어 짓기 */ p.keep = true; } } }
    if (S.year >= 2) for (const k in NB) { const n = NB[k]; if (k === 'B') n.method = 'mo'; if (k === 'A' && S.year >= 4) n.method = 'mo'; }
    if (S.hwan) say('봄 — 관아가 묵은 쌀을 억지로 꾸어 주고 갔다. 가을에 10냥을 더 내야 한다', 'hwan', 4.2);
    say(S.year === 1 ? '봄 — 볍씨 자루를 지고 깃발 노란 우리 논 둘에 뿌리자' : S.drought ? '봄 — 지난겨울 눈이 적었다. 올해는 가물겠다는 말이 돈다' : `${S.year}번째 해의 봄 — ${S.nursery ? '못자리의 모가 자랐다. 모를 지고 논으로' : '씨를 뿌릴 철'}`, null, 4.2); }
  S.duty = null; S.aj = null; ajeon.visible = false;
  if (sn === 0 && S.year >= 3 && !S.yangban) { S.hwan = 10; S.rice += 1; S.log.push('관아가 겨 섞인 묵은 쌀 1섬을 억지로 꾸어 주었다 — 가을에 10냥으로 갚아야 한다'); } else if (sn === 0) S.hwan = 0;
  if (sn === 1) { S.dutyAt = S.yangban ? 0 : 20 + R() * 16; for (const p of plots) if (p.sow !== 'none') p.grow = 0.45;
    if (S.drought) say(S.bo >= 6 ? '여름 — 가뭄이다! 하지만 보의 물이 개울가 논을 적신다' : '여름 — 가뭄이다! 논바닥이 갈라진다. 보가 없으면 옮겨 심은 모는 말라 죽는다', null, 4.4); else say('여름 — 김을 매자. 논 안에 가만히 서 있으면 맨다' + (S.bo < 6 ? ' · 개울에 보를 쌓아 두면 가뭄에 버틴다' : ''), null, 4); }
  if (sn === 2) { for (const p of plots) if (p.sow !== 'none') { grade(p); p.grow = 1; p.ripe = true; }
    S.boY = 0; S.injing = S.yangban ? 0 : 15 * S.gone.length; S.taxDue = (S.yangban ? 0 : GUNPO[S.year - 1]) + S.injing + (S.hwan || 0) + owned().filter((p) => p.kind === 'paddy').length * 5; S.taxPaid = S.taxDue === 0;
    say(`가을 — 거두자. 관아 북이 울리기 전에 낼 것 ${S.taxDue}냥${S.yangban ? '(양반이라 군포는 없다)' : ` (군포는 ${GUNPO_WHY[S.year - 1]}${S.injing ? ` · 떠난 이웃 몫 ${S.injing}냥도 남은 집이 문다` : ''}${S.hwan ? ' · 억지로 꾼 쌀 값 10냥' : ''})`}`, null, 5.5); }
  if (sn === 3) { for (const p of plots) if (p.sow !== 'none' && !p.cut) { p.dead = true; p.ripe = false; if (p.farmer === 'me') S.log.push('거두지 못한 논이 서리를 맞았다'); }
    settleTax(); neighborsYear(); if (S.year === 1 && !S.knowMo) { S.knowMo = true; }
    say(S.year === 1 ? '겨울 — 보부상 말로는 아랫녘에서는 모를 길러 옮겨 심는단다. 못자리(초록 고리)를 만들어 두자' : '겨울 — 남은 것으로 무엇을 할까. 소 · 논 · 임명장 · 이웃 돕기', null, 5); }
  for (const p of plots) drawPlot(p); refreshTasks(); hud(); saveGame(); }
/* 한 해 농사 등급(여름이 끝날 때): 김매기 · 가뭄 · 모내기 */
function grade(p) { if (p.sow === 'tob' || p.sow === 'bean') { p.yield = p.sow === 'tob' ? (p.weed >= 1 ? 5 : 3) : 3; return; }
  const mo = p.sow === 'mo', wf = mo ? [0.7, 1][Math.min(1, p.weed)] : [0.45, 0.75, 1][Math.min(2, p.weed)], watered = p.wet && S.bo >= 6;
  let y = YIELD * (mo ? 1.4 : 1) * wf; if (S.drought && !watered) y *= mo ? 0.3 : 0.75; if (S.good) y *= 1.2; p.weedBad = wf < 1; p.dead = S.drought && !watered && mo; p.yield = Math.round(y); }
/* 긴장(준호 11-20 「시간 안에 못 하면 곤장을 맞거나 가진 걸 뺏긴다 — 실제로 그랬고 불공평했다」)
   부역: 여름에 관아가 길 닦기에 불러낸다(양반은 안 나간다) · 아전: 가을에 세금을 안 낸 집으로 걸어온다 → 닿으면 소나 쌀을 헐값에 가져간다 · 곤장을 맞으면 한동안 느리다(때리는 모습은 없다) */
function flog(why, sec) { for (const k in NB) { const n = NB[k]; if (!n.gone && dist(S.px, S.pz, n.x, n.z) < 80) { n.chatT = 3; n.cool = 10; talk(n.mesh, n.rel < 0 ? '…쌤통이오.' : pick(['아이고, 저런…', '쯧쯧, 남 일 같지 않구먼.', '엉덩이에 된장을 바르시오.', '저 나리는 사람을 왜 저리 치나.'])); } } S.slow = Math.max(S.slow || 0, sec); S.flogN = (S.flogN || 0) + 1; SFX.drum(0.5); SFX.bad(); $('vig').style.transition = 'none'; $('vig').style.background = 'rgba(160,20,10,.45)'; setTimeout(() => { $('vig').style.transition = 'background 1.2s'; $('vig').style.background = 'transparent'; }, 60); say(why, null, 4.6); S.log.push(why); }
function seize() { let due = S.taxDue; const fromCoin = Math.min(S.coin, due); S.coin -= fromCoin; due -= fromCoin; let took = '';
  if (due > 0 && S.ox) { S.ox = false; if (oxM) oxM.visible = false; if (cartM) cartM.visible = false; due = 0; took = '소를 끌고 갔다'; S.seizedOx = true; }
  if (due > 0 && S.rice > 0) { const take = Math.min(S.rice, Math.ceil(due / 3)); S.rice -= take; due = Math.max(0, due - take * 3); took = `곳간에서 쌀 ${take}섬을 헐값(3냥씩)에 실어 갔다`; }
  if (due > 0) { S.debt += Math.round(due * 1.2); took += `${took ? ' · ' : ''}모자란 ${due}냥은 빚 문서가 되었다`; }
  S.taxPaid = true; S.seizedN = (S.seizedN || 0) + 1; flog(`아전이 들이닥쳤다 — ${took || '남은 엽전을 털어 갔다'}. 늦었다고 곤장까지 맞았다`, 34); hud(); }
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
  overlay(`<h1>빚 문서가 왔다</h1><p>빚이 <b>${S.debt}냥</b>으로 불었다. 내줄 논은 한 배미도 남지 않았다.</p><p style="text-align:left;line-height:1.7;background:rgba(255,255,255,.08);border-radius:10px;padding:10px 14px">양반댁 마름이 말한다.<br>「빚은 우리 댁에서 갚아 주마. 대신 <b>문서를 쓰고 우리 댁 노비가 되어라.</b> 굶지는 않을 게다.」<br><br>문서를 쓰면 식구는 굶지 않는다. 하지만 노비 신분은 <b>자식에게도 이어진다.</b><br>쓰지 않으려면 오늘 밤 고을을 떠나야 한다.</p><p><button id="flee" style="background:#5a6a8a;color:#fff">밤에 고을을 떠난다</button></p>`,
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
  if (S.yangban) why.push('이름 없는 임명장을 사서 양반이 되었다 — 군포를 내지 않는다.'); if (S.flogN) why.push(`곤장을 ${S.flogN}번 맞았다${S.seizedOx ? ' — 아전에게 소까지 뺏겼다' : S.seizedN ? ' — 아전에게 곳간을 털렸다' : ''}.`); if (S.dutyN) why.push(`품삯 없는 부역에 ${S.dutyN}번 나갔다${S.yangban ? '' : ' (양반댁은 한 번도 안 나왔다)'}.`); if (S.lost.length) why.push('빚 때문에 논을 잃었다.'); if (S.nobi) why.push(`${S.year}번째 해, 빚을 갚지 못하고 내줄 논도 없어 문서를 쓰고 양반댁 노비가 되었다.`); if (S.fled) why.push(`${S.year}번째 해, 빚을 갚지 못해 밤에 고을을 떠났다 — 떠돌며 품을 팔거나 화전을 일구게 된다.`); if (S.stats.bought) why.push(`어려운 이웃의 논을 ${S.stats.bought}배미 사들였다.`); if (S.stats.helped) why.push(`어려운 이웃에게 쌀을 ${S.stats.helped}번 꾸어 주었다.`);
  const goneN = S.gone.length;
  overlay(`<h1>${win ? '이겼다' : '졌다'} — ${names[r]}</h1><p style="font-size:30px;letter-spacing:6px;margin:2px 0">${'★'.repeat(r)}${'☆'.repeat(3 - r)}</p><p>${S.nobi || S.fled ? `${S.year}번째 해 겨울` : '다섯 해 뒤'}, 짓는 논 <b>${m}</b>배미 · 우리 논 <b>${o}</b>배미 · 곳간 ${S.rice}섬 · ${S.coin}냥${S.debt ? ` · 빚 ${S.debt}냥` : ''}${S.yangban ? ' · <b>양반</b>' : ''}</p>
    <div class="marks"><span class="${m >= 6 ? 'ok' : ''}">🌾 넓게 짓기 ${m}배미</span><span class="${S.bo >= 6 ? 'ok' : ''}">💧 보 ${S.bo >= 6 ? '쌓음' : '없음'}</span><span class="${S.ox ? 'ok' : ''}">🐂 소 ${S.ox ? '있음' : '없음'}</span><span class="${S.yangban ? 'ok' : ''}">📜 ${S.yangban ? '양반' : '상민'}</span></div>
    <p style="text-align:left;font-size:14px;line-height:1.6;background:rgba(255,255,255,.08);border-radius:10px;padding:8px 12px"><b>이렇게 된 까닭</b><br>· ${why.join('<br>· ')}</p>
    <p>⭐ 해마다의 목표 ${S.goals.map((g) => (g ? '✅' : '▫️')).join('')}</p><p class="keys">그사이 고을에서는 ${goneN ? `<b>${S.gone.join(', ')}</b>네가 땅을 잃었다${(S.nobiNB || []).length ? ` (${S.nobiNB.join(', ')}네는 양반댁 노비가 되었다)` : ''}.` : '아무도 땅을 잃지 않았다.'} 누군가 넓게 지을수록, 누군가는 지을 땅을 잃었다.</p>
    <div class="fact">📜 <b>모내기</b> — 모를 길러 옮겨 심으면 김매는 품이 크게 줄고 더 많이 거둔다. 가뭄에는 약해서 보와 저수지를 많이 만들었다.<br>📜 <b>넓게 짓기</b> — 품이 남자 남의 땅까지 빌려 넓게 짓는 집이 생겼고, 그 가운데 부농이 나왔다. 땅을 얻지 못한 사람들은 품을 팔거나 고을을 떠났다.<br>📜 <b>장과 돈</b> — 닷새마다 서는 장이 온 나라에 퍼졌고 엽전이 널리 쓰였다. 담배·목화처럼 팔려고 짓는 것도 늘었다.<br>📜 <b>빚과 노비</b> — 흉년과 빚에 몰려 스스로 몸을 팔아 노비가 되는 사람들이 있었다. 그때 쓴 문서를 자매문기라고 하는데, 조선 후기 것이 많이 남아 있다. 한편 돈을 내고 노비 신분에서 벗어나는 사람도 늘어, 노비는 전체로는 줄어 갔다.<br>📜 <b>불공평한 짐</b> — 길과 성을 고치는 부역은 품삯 없이 백성이 졌고, 양반은 빠졌다. 세금을 못 내면 매를 맞거나 소·솥 같은 살림을 빼앗겼고, 달아난 이웃 몫을 남은 집이 대신 물기도 했다. 관아가 곡식을 억지로 꾸어 주고 이자를 받는 일도 흔했다. 견디다 못한 농민들이 19세기에 곳곳에서 들고일어났다.<br>📜 <b>군포와 신분</b> — 갓난아기와 죽은 사람 몫까지 군포를 물렸다. 곡식이나 돈을 내고 이름 없는 임명장을 사서 양반이 되는 사람이 늘었다.</div>`,
    r < 3 ? '별 셋에 다시 도전' : '한 번 더', () => { newGame(); S.mode = 'play'; }); }

/* ───── HUD ───── */
function hud() { const m = mine().filter((p) => p.kind === 'paddy').length, o = owned().filter((p) => p.kind === 'paddy').length; S.stats.maxFarm = Math.max(S.stats.maxFarm || 0, m);
  $('hRice').textContent = `🌾 곳간 ${S.rice}섬${S.tob ? ` · 담배 ${S.tob}` : ''}`; $('hCoin').textContent = `🪙 ${S.coin}냥${S.debt ? ` (빚 ${S.debt})` : ''}`; $('hLand').textContent = `🚩 논 ${m}배미(내 것 ${o})${S.yangban ? ' · 양반' : ''}`;
  const c = S.carry; $('hCarry').textContent = (S.slow > 0 ? '🩹 곤장 맞음 · ' : '') + (!c ? '빈손' : c.k === 'seed' ? '볍씨 자루' : c.k === 'mo' ? '모 다발' : c.k === 'tob' ? '담배 모종' : c.k === 'rice' ? `${c.n ? `쌀 ${c.n}섬` : ''}${c.tob ? ` 담배 ${c.tob}단` : ''} 지고 있음` : c.k === 'tobl' ? `담배 ${c.n}단` : c.k === 'cloth' ? `베 ${c.n}필` : c.k === 'stone' ? '돌' : '');
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
    if (S.duty) add({ id: 'duty', req: true, t: '부역 — 관아가 부른 길 닦기', n: S.duty.done ? null : [Math.ceil(S.duty.left), 40], how: `마을 앞 큰길(장승 곁) 붉은 고리에 가만히 서기 · <b>${Math.ceil(S.duty.left)}초</b> 안에 못 가면 곤장을 맞고 벌금을 문다 · 품삯은 없고, 양반은 안 나간다`, gone: () => S.duty.miss, done: () => S.duty.done && !S.duty.miss, at: () => DUTY, tag: '⚠ 부역' });
    add({ id: 'wd1', req: true, t: '김매기', n: [G.filter((p) => p.weed >= 1).length, G.length], how: '벼가 자라는 우리 논 <b>안에</b> 가만히 서기', done: () => G.every((p) => p.weed >= 1), at: () => { const p = G.find((p) => p.weed < 1); return p ? [p.cx, p.cz] : null; }, tag: '🌿 김매기' });
    if (J.length) add({ id: 'wd2', req: true, t: '한여름 두 번째 김매기 (씨 뿌린 논)', n: [J.filter((p) => p.weed >= 2).length, J.length], how: half ? '씨를 뿌린 논은 한 번 더 — 모내기를 하면 이 일이 없다' : '한여름이 되면 한 번 더 매야 한다 — 그때까지 다른 일을', done: () => J.every((p) => p.weed >= 2), at: () => (half ? firstP((p) => p.sow === 'jik' && p.weed === 1) : null), wait: !half, tag: '🌿 한 번 더' });
    if (S.bo < 6 || S.boY) add({ id: 'bo', req: S.year <= 3, t: '개울에 보 쌓기 — 가뭄 대비', n: [Math.min(6, S.bo), 6], how: '북쪽 개울 파란 고리에 가만히 서기 · 다 쌓으면 개울가 논 여덟 배미에 물이 든다', done: () => S.bo >= 6, at: () => [BO[0], BO[1] + 4], tag: '💧 보 쌓기' });
    add({ id: 'lab', t: '양반댁에 품 팔기', n: [S.labor, 3], how: '양반댁 앞 흰 고리에 가만히 서기 — 한 번에 5냥', done: () => S.labor >= 3, at: () => [LORD[0] - 8, LORD[1] + 6], tag: '품 팔기 5냥' });
    if (S.year >= 2) add({ id: 'cloth', t: '베 장사 — 읍내에서 사서 고개 너머에 팔기', how: '읍내 6냥 → 고개 너머 11냥. 엽전이 있어야 살 수 있다', can: () => (c && c.k === 'cloth') || S.coin >= 6, done: () => S.clothY > 0, at: () => (c && c.k === 'cloth' ? NEXT : CLOTH), tag: () => (c && c.k === 'cloth' ? '🧵 여기서 팔기' : '🧵 베 사기') }); }
  if (sn === 2) { const G = mine().filter((p) => p.sow !== 'none'), firstG = () => { const p = G.find((p) => p.ripe && !p.cut); return p ? [p.cx, p.cz] : null; };
    const pr = `읍내 ${price('town')}냥${S.year >= 2 ? ` · 고개 너머 ${price('next')}냥` : ''}${shipIn() ? ` · 포구 ${price('port')}냥(배가 곧 떠난다)` : ''}${peddler.visible ? ` · 보부상 ${price('pedd')}냥(가깝다)` : ''}`;
    add({ id: 'cut', req: true, t: '거두기', n: [G.filter((p) => p.cut).length, G.length], how: '누렇게 익은 우리 논·밭 <b>안에</b> 가만히 서기', done: () => G.every((p) => p.cut), at: firstG, tag: '🌾 거두기' });
    add({ id: 'sell', req: true, t: '쌀을 지고 장에 가서 팔기', how: `곳간 고리에서 지고 장으로 — ${pr}`, done: () => S.tripY > 0 || (!canLoad() && !selling() && S.taxPaid), at: () => (selling() ? bestMarket() : canLoad() || S.rice > 0 ? GRAN : null), tag: () => (selling() ? '🪙 여기서 팔기' : '🌾 쌀 지기') });
    add({ id: 'tax', req: true, t: S.aj && !S.taxPaid ? `아전이 닿기 전에 세금 ${S.taxDue}냥 내기!` : `아전이 오기 전에 세금 ${S.taxDue}냥 내기`, n: S.coin < S.taxDue && !S.taxPaid ? [S.coin, S.taxDue] : null, how: (S.coin >= S.taxDue ? '읍내 북쪽 관아의 궤 앞 붉은 고리에 가만히 서기' : `엽전이 모자란다 — 쌀을 더 팔아 오자 (${pr})`) + (S.yangban ? '' : ` · 올해 군포는 ${GUNPO_WHY[S.year - 1]}`), done: () => S.taxPaid, at: () => (S.coin >= S.taxDue ? [GWE[0], GWE[1] + 2.4] : selling() ? bestMarket() : S.rice > 0 ? GRAN : null), tag: () => (S.coin >= S.taxDue ? '🥁 세금 내기' : selling() ? '🪙 여기서 팔기' : '🌾 쌀 지기') });
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
  if (sn >= 2 && c && c.k === 'cloth') L.unshift({ id: 'clothL', req: true, t: `지고 있는 베 ${c.n}필 팔기`, how: '고개 너머 장 고리에 서면 11냥씩 — 팔아야 곳간 쌀을 질 수 있다', done: () => !(S.carry && S.carry.k === 'cloth'), at: () => NEXT, tag: '🧵 베 팔기 11냥' });
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
/* 지금 하는 일 → 몸짓(beasts.js workPose) */
const jobKind = (k) => (!k ? null : /^(pm|pt|pb)/.test(k) ? 'plant' : /^pj/.test(k) ? 'sow' : /^wd/.test(k) ? 'weed' : /^cut/.test(k) ? 'cut' : /^(bo|duty|lab|nurs)/.test(k) ? 'dig' : null);
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
    if (S.bo < 6 && near([BO[0], BO[1] + 4], 2.4)) return { key: 'bo' + S.bo, need: 2.6, label: `보 쌓기 ${S.bo + 1}/6`, fn: () => { S.bo++; S.boY = 1; boG.children[S.bo - 1].visible = true; SFX.plant(); noise(0.2, 0.3, 200); if (S.bo >= 6) { canal.visible = canalHead.visible = canal2.visible = canal3.visible = boFoam.visible = true; for (const m of mulkko) m.visible = true; S.favor++; SFX.good(); ring(BO[0], BO[1], 16, 0x7ac8ff); for (const k in NB) { const n = NB[k]; if (n.gone) continue; n.hopT = 2.2; n.cool = 30; n.cheer = 26; n.cheerSaid = 0; talk(n.mesh, pick(['물이다! 물이 든다!', '보가 섰다! 고맙소!', '이제 가뭄도 무섭지 않소!']), 3.6); } say('보가 섰다! 개울가 논 여덟 배미는 가뭄에도 물이 든다 — 이웃들이 고마워한다', null, 4.2); for (const p of plots) drawPlot(p); } } };
    if (S.duty && !S.duty.done && near(DUTY, 2.6)) return { key: 'duty', need: 7, label: '부역 — 길 닦기', fn: () => { S.duty.done = true; S.dutyN = (S.dutyN || 0) + 1; SFX.plant(); say('부역을 마쳤다 — 품삯은 없다. 내 논일 할 시간만 줄었다', null, 3.6); } };
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
      if (near([n.sell.x, n.sell.z], 1.8)) { const p = plots.find((p) => p.owner === k); if (p) return { key: 'nbuy' + k, need: 1.4, label: `${n.name}네 논 사기 ${P_NB}냥`, fn: () => { if (S.coin >= P_NB) { S.coin -= P_NB; S.boughtY++; p.owner = 'me'; p.farmer = 'me'; p.rent = null; n.trouble = false; n.coin = 30; n.rel = -1; n.chatT = 4; n.cool = 12; talk(n.mesh, pick(['…잘 지으시오. 대대로 짓던 논이오.', '돈은 받았소만… 속이 쓰리구먼.']), 4); S.favor = Math.max(0, S.favor - 1); S.stats.bought++; SFX.coin(); ring(p.cx, p.cz, 10, 0xffcf4d); say(`${n.name}네 논을 샀다 — ${n.name}은 지을 땅이 한 배미 줄었다`, null, 3.6); drawPlot(p); } else { SFX.bad(); say(`엽전이 모자란다 (${S.coin}/${P_NB}냥)`, null, 2.2); S.workKey = 'x'; } } }; }
      if (near([n.help.x, n.help.z], 1.8)) return { key: 'nhelp' + k, need: 1.4, label: `쌀 ${HELP}섬 꾸어 주기`, fn: () => { if (S.rice >= HELP + FOOD) { S.rice -= HELP; n.coin = 15; n.trouble = false; n.rel = 1; n.chatT = 4; n.bowT = 2.4; n.cool = 12; talk(n.mesh, pick(['이 은혜는 꼭 갚으리다! 여름에 품으로 갚겠소.', '살았소… 자네 논 김은 내가 매 주리다.']), 4); S.favor++; S.stats.helped++; SFX.good(); ring(n.home[0], n.home[1], 5, 0x7ad65a); say(`${n.name}네에 쌀을 꾸어 주었다 — 이웃이 품으로 갚는다(일이 빨라진다)`, null, 3.6); } else { SFX.bad(); say('우리 먹을 것도 빠듯하다', null, 2.2); S.workKey = 'x'; } } }; } }
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
  }
  /* 베는 철과 상관없이 고개 너머에서 판다(11-20: 여름이 끝날 때 지고 있으면 가을에 곳간 쌀을 못 져 세금을 못 내던 것) */
  { if (c && c.k === 'cloth' && near(NEXT, 2.2)) { S.coin += c.n * 11; S.soldY += c.n * 5; S.carry = null; S.clothY++; SFX.coin(); ring(NEXT[0], NEXT[1], 4, 0xffcf4d); say(`베를 팔았다 — ${c.n * 5}냥이 남았다. 싼 데서 사서 비싼 데 파는 것`, null, 3.4); S.stats.farMarket++; } }
  if (sn >= 2) { if (!c && near(GRAN, 1.7) && (S.rice > FOOD || S.tob > 0 || (S.rice > 0 && !S.taxPaid && sn === 2))) { const n = S.rice > FOOD ? Math.min(cap(), S.rice - FOOD) : S.tob > 0 ? 0 : Math.min(cap(), S.rice), tb = S.tob; if (n > 0 && S.rice <= FOOD) say('먹을 쌀까지 진다 — 겨울에 쌀을 꾸어야 할지도 모른다', 'food', 3); S.rice -= n; S.tob = 0; S.carry = { k: 'rice', n, tob: tb }; SFX.pick(); say(`${n ? `쌀 ${n}섬` : ''}${n && tb ? '과 ' : ''}${tb ? `담배 ${tb}단` : ''}을 ${S.ox ? '달구지에 실었다' : '지게에 졌다'} — 장으로`, 'load', 2.6); }
    if (c && c.k === 'rice') for (const [w, at2] of [['town', TOWN], ['next', NEXT], ['port', PORT], ['pedd', PEDD]]) { if (w === 'pedd' && !peddler.visible) continue; if (w === 'next' && S.year < 2) continue; if (w === 'port' && (S.year < 3 || !shipIn())) continue;
      if (near(at2, 2.3)) { const tb = c.tob || 0, got = price(w) * c.n + tobPrice(w) * tb; S.coin += got; S.soldY += got; S.carry = null; SFX.coin(); ring(at2[0], at2[1], 4, 0xffcf4d); if (w === 'next' || w === 'port') S.stats.farMarket++; if (w === 'next') S.nextY++; if (w === 'port') S.portY++; if (tb) S.tobY++; S.tripY = (S.tripY || 0) + 1; say(`${c.n ? `쌀 ${c.n}섬(${price(w)}냥씩)` : ''}${c.n && tb ? ' · ' : ''}${tb ? `담배 ${tb}단(${tobPrice(w)}냥씩)` : ''}을 팔았다 — ${got}냥`, null, 3); break; } } }
  if (sn !== 0 && c && (c.k === 'seed' || c.k === 'mo' || c.k === 'tob')) S.carry = null; }

/* ───── 하늘 ───── */
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); 
function lightFor() { const sn = S.season, d = S.drought && sn >= 1 && sn <= 2;
  const key = sn + '|' + d; if (key !== skyKey) { skyKey = key; const top = [0x6aa6e8, d ? 0x9ab0d0 : 0x5a9ae6, 0x6f9fe0, 0x9aa8ba][sn], low = [0xeaf2e0, d ? 0xf2e2b0 : 0xe6f0ea, 0xffe6b8, 0xe8ecf0][sn]; sky.paint(cT.set(top), cL.set(low)); scene.fog.color.set(low);
    groundM.material.color.set([0xffffff, d ? 0xf0dc98 : 0xe4f0d8, 0xf8e0a4, 0xffffff][sn]); land.setSeason(sn); dikeM.userData.snow(sn === 3); waterSky.copy(cL).lerp(cT, 0.35); paintRidges(cL.clone().lerp(cT, 0.15)); DAY.sunBase = [2.2, d ? 2.8 : 2.4, 2.0, 1.4][sn]; hemi.intensity = [1.3, 1.3, 1.2, 1.5][sn]; wx.m.visible = sn === 3; DAY.top.set(top); DAY.low.set(low); DAY.repaint = 0; air.setSeason(sn); DAY.hot = sn === 1 ? (d ? 1 : 0.6) : 0; } }

/* ───── 한 걸음 ───── */
const COL = [[224, 139.5, 4.2], [118, 40, 2.6], [82, 128, 1.3], [57, 153.8, 0.1], [HOME[0], HOME[1] - 6, 4.6], [LORD[0], LORD[1] - 8, 6.5], [278, 94, 7], [NB.A.home[0], NB.A.home[1] - 5, 4], [NB.B.home[0], NB.B.home[1] - 5, 4.2], [NB.C.home[0], NB.C.home[1] - 5, 4], [64, 122, 1.6], [304, 86, 21], [304, 172, 21]];
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  if (wx.m.visible) { wx.m.position.set(S.px, 0, S.pz); for (let i = 0; i < wx.N; i++) { wx.p[i * 3 + 1] -= 5 * dt; wx.p[i * 3] += Math.sin(S.t + i) * dt * 0.8; if (wx.p[i * 3 + 1] < 0) wx.p[i * 3 + 1] = 40; } wx.m.geometry.attributes.position.needsUpdate = true; }
  if (S.mode === 'intro') { S.introT += dt; if (S.introT > 5) { S.mode = 'play'; startSeason(0, true); } }
  if (S.mode !== 'play') { place(dt); return; }
  S.st += dt; lightFor();
  /* 철 마감 */
  if (S.st >= SLEN[S.season]) { if (S.season === 3) { endYear(); place(dt); return; } startSeason(S.season + 1); }
  if (S.season === 2) { const k = S.st / SLEN[2]; if (!S.taxPaid) { if (k > 0.6) say('둥 — 관아 북이 울린다. 낼 것을 못 내면 곳간을 헐값에 털린다', 'drum1', 3.4); if (k > 0.6 && !S.said.d1) { S.said.d1 = 1; SFX.drum(0.35); } if (k > 0.82 && !S.said.d2) { S.said.d2 = 1; SFX.drum(0.5); say('둥 둥 — 곧 마감이다!', null, 2.6); } } }
  if (S.slow > 0) S.slow -= dt;
  /* 부역(여름) */
  if (S.season === 1) { if (!S.duty && S.dutyAt && S.st >= S.dutyAt) { S.dutyAt = 0; S.duty = { left: 40, done: false, nbT: 50 }; SFX.drum(0.45); say('둥 — 관아에서 부역을 부른다! 마을 앞 큰길 닦기 — 늦으면 곤장이다 (양반댁은 아무도 안 나온다)', null, 5); }
    if (S.duty) S.duty.nbT -= dt;
    const d = S.duty; if (d && !d.done) { d.left -= dt; if (d.left <= 0) { d.done = true; d.miss = true; const fine = Math.min(S.coin, 10); S.coin -= fine; flog(`부역에 안 나왔다고 곤장을 맞았다${fine ? ` — 벌로 ${fine}냥도 뺏겼다` : ''}. 한동안 걸음이 느리다`, 40); } }
    if (S.drought && S.bo < 6 && S.st > SLEN[1] * 0.45) say('논바닥이 갈라진다 — 여름이 가기 전에 보를 못 쌓으면 옮겨 심은 모는 말라 죽는다', 'dry', 4);
    if (S.st > SLEN[1] * 0.68 && mine().some((p) => p.sow !== 'none' && p.weed < (p.sow === 'jik' ? 2 : 1))) say('풀이 벼를 덮는다! 여름이 가기 전에 못 매면 거둘 것이 크게 준다', 'weedy', 3.6); }
  /* 아전(가을): 세금을 안 낸 집으로 걸어온다 */
  if (S.season === 2) { const k = S.st / SLEN[2];
    if (!S.aj && !S.taxPaid && k > 0.56) { S.aj = { x: GWE[0], z: GWE[1] + 12 }; ajeon.visible = true; SFX.drum(0.4); say('아전이 관아를 나섰다 — 세금 안 낸 집으로 온다. 닿기 전에 내야 한다!', null, 4.4); }
    const a = S.aj; if (a) { const back = S.taxPaid, tx = back ? GWE[0] : DOOR[0] + 2, tz = back ? GWE[1] + 12 : DOOR[1] + 2, d = dist(a.x, a.z, tx, tz), leftT = Math.max(1, SLEN[2] * 0.94 - S.st), v = back ? 7 : Math.max(3.2, d / leftT);
      if (d > 1) { a.x += (tx - a.x) / d * v * dt; a.z += (tz - a.z) / d * v * dt; ajeon.rotation.y = -Math.atan2(tz - a.z, tx - a.x) + Math.PI / 2; walkAnim(ajeon, S.t * 10, true); } else if (back) { S.aj = null; ajeon.visible = false; } else seize();
      ajeon.position.set(a.x, 0, a.z); if (!back && !a.told && d < 70) { a.told = 1; SFX.drum(0.5); say('아전이 마을 어귀까지 왔다!', null, 3); } } }
  /* 자라기 */
  if (S.season <= 1) for (const p of plots) if (p.sow !== 'none') { const g0 = p.grow; p.grow = Math.min(S.season === 0 ? 0.42 : 0.95, p.grow + dt * 0.012); if (Math.floor(g0 * 12) !== Math.floor(p.grow * 12)) drawPlot(p); }
  if (S.season === 2 && S.year >= 3 && S.st > SLEN[2] * 0.6 && !S.said.ship) { S.said.ship = 1; say('포구의 한양 배가 닻을 올렸다 — 이제 읍내나 고개 너머 장으로', null, 3); }
  /* 보부상(가을 한가운데 마을에 온다 — 값은 싸지만 가깝다) */
  const pOn = S.season === 2 && S.st > 20 && S.st < 80; if (pOn !== peddler.visible) { peddler.visible = pOn; if (peddlerPack) peddlerPack.visible = pOn; if (pOn) { peddler.position.set(PEDD[0] + 2, 0, PEDD[1] - 2); peddler.rotation.y = 3.6; if (peddlerPack) peddlerPack.position.set(PEDD[0] + 3.4, 0, PEDD[1] - 1.4); say(`보부상이 마을에 왔다 — 쌀 ${price('pedd')}냥(읍내는 ${price('town')}냥). 가깝지만 싸다`, 'pedd', 4); } }
  /* 나 */
  let { ix, iz, back } = ctl.read(dt); const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const load = S.carry && (S.carry.k === 'rice' || S.carry.k === 'tobl' || S.carry.k === 'cloth');
    S.hopT = (S.hopT || 0) - dt; const sp = (S.running ? 8.6 : 5.2) * (S.hopT > 0 ? 0.5 : 1) * (S.slow > 0 ? 0.68 : 1) * (back ? 0.6 : 1) * (load ? (S.ox ? 0.86 : 0.8) : 1); let nx = clamp(S.px + ix * sp * dt, 8, 372), nz = clamp(S.pz + iz * sp * dt, 30, 211);
    if (S.year < 2 && nx > PASS[0] - 4) { nx = PASS[0] - 4; say('고갯길은 아직 눈사태로 막혀 있다 — 내년에 열린다', 'pass', 2.6); } if (S.year < 3 && nz > 168 && nx > 250 && nx < 272) { nz = 168; say('포구 가는 길 — 한양 배는 세 번째 해부터 들어온다', 'port', 2.6); }
    for (const [cx, cz, r] of COL) { const d = dist(nx, nz, cx, cz); if (d < r) { nx = cx + (nx - cx) / d * r; nz = cz + (nz - cz) / d * r; } }
    { const hit = (x, z) => WALLS.some((w) => !w[4] && x > w[0] && x < w[1] && z > w[2] && z < w[3]); if (WALLS.some((w) => w[4] && nx > w[0] && nx < w[1] && nz > w[2] && nz < w[3])) S.hopT = 0.22; if (hit(nx, nz) && !hit(S.px, S.pz)) { if (!hit(nx, S.pz)) nz = S.pz; else if (!hit(S.px, nz)) nx = S.px; else { nx = S.px; nz = S.pz; } } }
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
  if (S.servant && S.season === 1) { const p = mine().find((p) => p.sow !== 'none' && p.weed < (p.sow === 'jik' ? 2 : 1)); servant.visible = true; if (p) { const d = dist(servant.position.x, servant.position.z, p.cx, p.cz); if (d > 1) { servant.position.x += (p.cx - servant.position.x) / d * 4 * dt; servant.position.z += (p.cz - servant.position.z) / d * 4 * dt; walkAnim(servant, S.t * 10, true); workPose(servant, null, S.t, dt); } else { p.sv = (p.sv || 0) + dt; walkAnim(servant, 0, false); workPose(servant, 'weed', S.t, dt); if (p.sv > 6) { p.sv = 0; p.weed++; drawPlot(p); } } } }
  neighborsMove(dt); place(dt);
  if (popT2 > 0) { popT2 -= dt; if (popT2 <= 0) { const pop = document.getElementById('mpop') || document.querySelector('.mpop'); if (pop) pop.classList.remove('on'); } }
  if (Math.floor(S.st * 4) !== Math.floor((S.st - dt) * 4)) { refreshTasks(); hud(); }
  /* 조임: 철이 끝나 가는데 못 한 일 */
  const left = 1 - S.st / SLEN[S.season], mp = mine(), undone = S.season === 0 ? mp.some((p) => p.sow === 'none') : S.season === 2 ? (!S.taxPaid || mp.some((p) => p.ripe && !p.cut)) : S.season === 1 ? mp.some((p) => p.sow !== 'none' && p.weed < (p.sow === 'jik' ? 2 : 1)) : false;
  let tension = clamp(undone ? (0.35 - left) * 3 : 0, 0, 1); if (S.duty && !S.duty.done) tension = Math.max(tension, clamp(1 - S.duty.left / 40, 0.25, 1)); if (S.aj && !S.taxPaid) tension = Math.max(tension, clamp(1 - dist(S.aj.x, S.aj.z, DOOR[0], DOOR[1]) / 230, 0.3, 1));
  S.beatT -= dt; if (tension > 0.1 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.4, tension); SFX.beat(0.06 + tension * 0.26); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 60}px rgba(200,60,20,${tension * 0.4})`;
}
function neighborsMove(dt) { for (const k in NB) { const n = NB[k]; if (n.gone) continue; n.wait -= dt; n.hopT = (n.hopT || 0) - dt; n.bowT = (n.bowT || 0) - dt; const hop = n.hopT > 0 ? Math.abs(Math.sin(S.t * 11)) * 0.7 : 0;
    if (n.chatT > 0) { n.chatT -= dt; const to = -Math.atan2(S.pz - n.z, S.px - n.x) + Math.PI / 2 + (n.rel < 0 ? Math.PI : 0); n.mesh.rotation.y += Math.atan2(Math.sin(to - n.mesh.rotation.y), Math.cos(to - n.mesh.rotation.y)) * Math.min(1, dt * 7); n.mesh.position.set(n.x, hop, n.z); walkAnim(n.mesh, 0, false); workPose(n.mesh, n.bowT > 0 ? 'bow' : null, S.t, dt); continue; }
    n.cheer = (n.cheer || 0) - dt; let ov = null;
    if (n.cheer > 0 && n.rel >= 0) ov = [BO[0] + (k === 'A' ? -6 : k === 'B' ? 6 : -12), BO[1] + 5.6, 'cheer'];   /* 보가 서면 달려와 팔짝 */
    else if (S.duty && S.duty.nbT > 0) ov = [DUTY[0] + (k === 'A' ? -5 : k === 'B' ? 5 : 0.5), DUTY[1] + (k === 'C' ? 4.5 : -3.5), 'duty'];
    else if (S.season === 1 && n.rel > 0 && n.helpY !== S.year && S.st > 8) { const p = mine().find((p) => p.sow !== 'none' && p.weed < (p.sow === 'jik' ? 2 : 1)); if (p) ov = [p.cx + 4, p.cz + 3, 'help', p]; }
    if (ov) { n.tx = ov[0]; n.tz = ov[1]; n.wait = 1; n.p = null; }
    else if (n.wait <= 0) { const ps = plots.filter((p) => p.farmer === k); if (S.season === 3 || !ps.length) { n.tx = n.home[0] + 2; n.tz = n.home[1] + 2; n.wait = 6; } else { const p = ps[Math.floor(R() * ps.length)]; n.tx = p.x0 + 3 + R() * (p.w - 6); n.tz = p.z0 + 3 + R() * (p.d - 6); n.wait = 7 + R() * 5; n.p = p; } }
    const d = dist(n.x, n.z, n.tx, n.tz); let mv = false; if (d > 0.6) { const v = ov ? (ov[2] === 'cheer' ? 8.6 : 6.4) : 4.4; n.x += (n.tx - n.x) / d * v * dt; n.z += (n.tz - n.z) / d * v * dt; n.mesh.rotation.y = -Math.atan2(n.tz - n.z, n.tx - n.x) + Math.PI / 2; mv = true; }
    else if (ov && ov[2] === 'cheer') { n.hopT = Math.max(n.hopT, 0.3); if (!n.cheerSaid) { n.cheerSaid = 1; talk(n.mesh, { A: '물이 들어온다! 물이!', B: '허허, 이제 가뭄도 겁 안 나네!', C: '자네 덕일세! 얼쑤!' }[k], 3.4, k === 'B' ? 4.8 : 3.3); } n.cheer -= dt * 2; }
    else if (ov && ov[2] === 'help') { const p = ov[3]; if (!n.hw) talk(n.mesh, pick(['품앗이요! 지난겨울 쌀 값이오.', '자네 논 김은 내가 매 주리다!']), 5.6); n.hw = (n.hw || 0) + dt; if (n.hw > 5) { n.hw = 0; n.helpY = S.year; p.weed++; drawPlot(p); ring(p.cx, p.cz, 6, 0x7ad65a); SFX.good(); say(`${n.name}이 품앗이로 우리 논 김을 매 주고 갔다`, null, 3); hud(); } }
    else if (n.p && S.season < 3) { const p = n.p; if (S.season === 0 && p.sow === 'none' && S.st > 12) { p.sow = n.method; p.grow = n.method === 'mo' ? 0.3 : 0.15; drawPlot(p); } if (S.season === 1 && p.weed < 2) p.weed = 2; if (S.season === 2 && p.ripe && !p.cut && S.st > 18) { p.cut = true; p.ripe = false; p.stub = true; drawPlot(p); } }
    n.mesh.position.set(n.x, hop, n.z); walkAnim(n.mesh, S.t * 10 + n.x, mv); workPose(n.mesh, mv ? null : ov ? (ov[2] === 'duty' ? 'dig' : ov[2] === 'help' ? 'weed' : null) : S.season < 3 && n.p ? ['plant', 'weed', 'cut'][S.season] : null, S.t + n.x, dt); }
  for (const p of plots) { const n = NB[p.farmer]; if (!n || n.gone) continue; const ph = (p.id * 7) % 16; if (S.season === 0 && p.sow === 'none' && S.st > 14 + ph) { p.sow = n.method; p.grow = n.method === 'mo' ? 0.3 : 0.15; drawPlot(p); } if (S.season === 2 && p.ripe && !p.cut && S.st > 26 + ph * 2) { p.cut = true; p.ripe = false; p.stub = true; drawPlot(p); } }
  /* 박 서방: 봄에 양반댁 논을 노린다(내가 먼저 빌리면 다른 논으로) */
  const B = NB.B; if (!B.gone && S.season === 0 && S.year >= 2 && S.st > 26 && !S.said.brent) { S.said.brent = 1; const free = plots.filter((p) => p.owner === 'lord' && !p.farmer && p.kind === 'paddy'); if (free.length && plots.filter((p) => p.farmer === 'B').length < 6) { const p = free[0]; p.farmer = 'B'; drawPlot(p); ring(p.cx, p.cz, 10, 0xd6564a); say('박 서방이 양반댁 논 한 배미를 먼저 빌렸다!', null, 3); talk(B.mesh, '한발 늦었네, 허허!', 4); } }
  crowd.forEach((c, i) => { const P = i < 5 ? TOWN_PTS : NEXT_PTS; if (c.x === undefined) { const q = P[i % P.length]; c.x = q[0] + 2; c.z = q[1] + (q[1] < 130 ? 3 : -3); c.tx = c.x; c.tz = c.z; c.wait = i * 0.8; c.face = 0; }
    const d = dist(c.x, c.z, c.tx, c.tz); if (d > 0.5) { c.x += (c.tx - c.x) / d * 2.8 * dt; c.z += (c.tz - c.z) / d * 2.8 * dt; c.m.rotation.y = -Math.atan2(c.tz - c.z, c.tx - c.x) + Math.PI / 2; walkAnim(c.m, S.t * 8 + i, true); workPose(c.m, null, S.t, dt); }
    else { if (!c.at) { c.at = 1; c.m.rotation.y = c.face; if (Math.random() < 0.45 && dist(S.px, S.pz, c.x, c.z) < 40) talk(c.m, pick(['조금만 깎아 주시오!', '안 되오, 밑지는 장사요!', '이거 얼마요?', '어제보다 올랐네그려.', '덤으로 하나 더 주시오.', '아이고, 비싸다 비싸.', '구경만 하고 가오.', '우리 애가 엿을 좋아해서…']), 2.6); }
      walkAnim(c.m, 0, false); workPose(c.m, i % 2 && c.at ? 'haggle' : null, S.t + i, dt); c.wait -= dt; if (c.wait <= 0) { const q = P[Math.floor(Math.random() * P.length)]; c.tx = q[0] + (Math.random() - 0.5) * 4; c.tz = q[1] + (q[1] < 130 ? 2.6 : -2.6) + (Math.random() - 0.5); c.face = q[1] < 130 ? Math.PI : 0; c.wait = 3 + Math.random() * 5; c.at = 0; } }
    c.m.position.set(c.x, 0, c.z); }); actorsUpdate(dt); }
function place(dt) { flushPlots(); dressTick(); pMesh.position.set(S.px, S.hopT > 0 ? 0.55 + Math.sin(S.t * 14) * 0.12 : 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving); pMesh.rotation.x = 0; workPose(pMesh, !S.moving && S.workT > 0.1 ? jobKind(S.workKey) : null, S.t, dt || 0.016); pRing.position.set(S.px, S.view === 3 ? 0.6 : 0.11, S.pz); pRing.scale.setScalar(S.view === 3 ? Math.max(9, (S.mapH || 700) / 55) : 1); pMesh.scale.setScalar(S.view === 3 ? 5 : 1);
  for (const k in carryM) if (carryM[k]) carryM[k].visible = false; const c = S.carry; if (cartLoad) cartLoad.visible = oxS.on; if (c && carryM[c.k] && !oxS.on) { const m = carryM[c.k]; m.visible = true; m.position.set(S.px - Math.cos(S.pdir) * 0.5, 1.5, S.pz - Math.sin(S.pdir) * 0.5); m.rotation.y = pMesh.rotation.y; }
  /* 우리 소: 짐을 실으면 멍에를 메고 내 앞 오른쪽에서 걷고, 달구지는 소 뒤에 매달려 끌려온다(전엔 소·나·달구지가 한 줄로 붙어 미끄러졌다) */
  { const r0 = oxH.rigs[0], load = S.ox && c && (c.k === 'rice' || c.k === 'tobl' || c.k === 'cloth'), fx = Math.cos(S.pdir), fz = Math.sin(S.pdir), x0 = oxS.x, z0 = oxS.z;
    if (load) { const tx = S.px + fx * 1.9 - fz * 1.7, tz = S.pz + fz * 1.9 + fx * 1.7;
      if (!oxS.on) { oxS.on = true; oxS.x = tx; oxS.z = tz; oxS.face = Math.atan2(fx, fz); oxS.cx = tx - fx * 3.1; oxS.cz = tz - fz * 3.1; }
      oxS.x += (tx - oxS.x) * Math.min(1, (dt || 0.016) * 5); oxS.z += (tz - oxS.z) * Math.min(1, (dt || 0.016) * 5); }
    else if (oxS.on || !S.ox) { oxS.on = false; oxS.x = HOME[0] + 9; oxS.z = HOME[1] + 2; oxS.face = 1.2; oxS.cx = HOME[0] + 12; oxS.cz = HOME[1] + 4; oxS.sp = 0; }
    const v = Math.hypot(oxS.x - x0, oxS.z - z0) / Math.max(dt || 0.016, 1e-3); oxS.sp += (Math.min(v, 12) - oxS.sp) * Math.min(1, (dt || 0.016) * 6);
    if (oxS.on && v > 0.4) { const f = Math.atan2(oxS.x - x0, oxS.z - z0); oxS.face += Math.atan2(Math.sin(f - oxS.face), Math.cos(f - oxS.face)) * Math.min(1, (dt || 0.016) * 5); }
    oxM.position.set(oxS.x, 0, oxS.z); oxM.rotation.y = oxS.face; r0.yoke = oxS.on;
    if (cartM) { if (oxS.on) { const hx = oxS.x - Math.sin(oxS.face) * 0.2, hz = oxS.z - Math.cos(oxS.face) * 0.2, dx = hx - oxS.cx, dz = hz - oxS.cz, l = Math.hypot(dx, dz) || 1; oxS.cx = hx - dx / l * 3.05; oxS.cz = hz - dz / l * 3.05; cartM.position.set(oxS.cx, 0, oxS.cz); cartM.rotation.y = Math.atan2(dx, dz); } else { cartM.position.set(oxS.cx, 0, oxS.cz); cartM.rotation.y = 1.2; } }
    oxPose(r0, { sp: oxS.on ? oxS.sp : 0, t: S.t, dt: dt || 0.016 }); oxPose(oxH.rigs[1], { sp: 0, t: S.t, dt: dt || 0.016, look: Math.sin(S.t * 0.2) * 0.4 }); oxPose(oxH.rigs[2], { sp: 0, t: S.t + 3, dt: dt || 0.016 }); }
  nurseryM.userData.im.visible = S.nursery; nurseryM.visible = S.knowMo;
  passBar.visible = S.year < 2; portBar.visible = S.year < 3; if (ship) ship.visible = S.year >= 3 && (S.season !== 2 || shipIn());
  /* 고리 · 팻말 */
  const sn = S.season, play = S.mode === 'play', c2 = S.carry;
  pads.seed.m.visible = play && sn === 0; pads.nurs.m.visible = play && ((sn === 0 && S.nursery) || (sn === 3 && S.knowMo && !S.nursery)); pads.tobs.m.visible = play && sn === 0 && S.year >= 2;
  pads.gran.m.visible = play && sn >= 2 && !c2 && (S.rice > FOOD || S.tob > 0 || (S.rice > 0 && !S.taxPaid && sn === 2)); pads.granT.m.visible = false; pads.door.m.visible = play && S.st > 8;
  pads.bo.m.visible = play && sn === 1 && S.bo < 6; pads.work.m.visible = play && sn === 1 && S.labor < 3; pads.cloth.m.visible = play && sn === 1 && S.year >= 2 && !c2;
  const selling = play && c2 && c2.k === 'rice'; pads.town.m.visible = selling; pads.next.m.visible = (selling || (c2 && c2.k === 'cloth')) && S.year >= 2; pads.port.m.visible = selling && shipIn(); pads.pedd.m.visible = selling && peddler.visible;
  pads.gwe.m.visible = play && ((sn === 2 && !S.taxPaid) || (sn >= 2 && S.debt > 0 && S.coin > 0 && (S.taxPaid || sn === 3))); pads.duty.m.visible = play && !!S.duty && !S.duty.done; pads.ox.m.visible = play && sn === 3 && !S.ox; pads.paper.m.visible = play && sn === 3 && !S.yangban; pads.lordBuy.m.visible = play && sn === 3;
  for (const k in NB) { const n = NB[k], on = play && sn === 3 && n.trouble && !n.gone; n.sell.m.visible = on && plots.some((p) => p.owner === k); n.help.m.visible = on; }
  for (const p of plots) p.sign.visible = play && sn === 0 && p.owner === 'lord' && !p.farmer;
  for (const k in pads) if (pads[k].m.visible) pads[k].m.scale.setScalar(1 + Math.sin(S.t * 4) * 0.08);
  /* 꼬리표: 가까운 것만 */
  let ti = 0; const put = (x, y, z, html, hot) => { const d = tags[ti]; if (!d) return; const q = v3.set(x, y, z).project(cam); if (q.z > 1 || Math.abs(q.x) > 1.05 || Math.abs(q.y) > 1.05) return; ti++; d.style.display = 'block'; d.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; d.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; d.className = 'tag' + (hot ? ' hot' : ''); const ic = d.firstChild; if (ic._h !== html) { ic.innerHTML = html; ic._h = html; } };
  if (play) { const R2 = 46; if (S.view === 3) put(S.px, 4, S.pz, '📍 나');
    for (const p of plots) { if (dist(S.px, S.pz, p.cx, p.cz) > R2) continue; const who = p.farmer ? WHO_NAME[p.farmer] : '빈 논';
      if (sn === 0 && p.owner === 'lord' && !p.farmer) { put(p.cx - 3.4, 2.2, p.z0 + p.d + 3.4, '반씩'); put(p.cx + 3.4, 2.2, p.z0 + p.d + 3.4, `${FIXED}섬`); put(p.cx, 3.6, p.z0 + p.d + 1.6, '📜 양반댁 논 — 빌려줌'); }
      else if (p.farmer === 'me') { const t = sn === 0 ? (p.sow === 'none' ? (p.kind === 'field' ? '🌱 밭 — 담배나 콩' : '🌱 여기 심기') : p.sow === 'mo' ? '모내기 끝' : p.sow === 'jik' ? '씨 뿌림' : '심음') : sn === 1 ? (p.sow === 'none' ? '묵힌 땅' : p.weed >= (p.sow === 'jik' ? 2 : 1) ? '✓ 김맴' : (p.sow === 'jik' && p.weed === 1 && S.st <= SLEN[1] * 0.5 ? '한여름에 한 번 더' : '🌿 김매기')) : sn === 2 ? (p.cut ? '✓ 거둠' : p.ripe ? `🌾 거두기 (${p.yield}섬)` : p.dead ? '말라 죽음' : '') : (p.owner === 'me' ? '우리 논' : '빌린 논');
        if (t) put(p.cx, 3, p.cz, t, (sn === 0 && p.sow === 'none') || (sn === 2 && p.ripe && !p.cut)); }
      else if (dist(S.px, S.pz, p.cx, p.cz) < 20) put(p.cx, 2.6, p.cz, who + (p.owner === 'lord' && p.farmer ? ' (빌림)' : '')); }
    const ca = curTask && curTask.at ? curTask.at() : null;   /* 길잡이 꼬리표가 선 고리면 이름표는 고리 아래로 내려 겹치지 않게 */
    const lab = (key, txt, hot) => { const pd = pads[key]; if (!pd.m.visible || dist(S.px, S.pz, pd.x, pd.z) >= 60) return; const under = ca && dist(ca[0], ca[1], pd.x, pd.z) < 1.2; put(pd.x, under ? 0 : 2.4, pd.z + (under ? 3.4 : 0), txt, hot); };
    lab('seed', '볍씨 자루'); lab('nurs', sn === 0 ? '🌱 모 다발' : '🌱 못자리 만들기'); lab('tobs', '담배 모종'); lab('gran', S.rice > FOOD ? `🌾 쌀 지기 (${Math.min(cap(), S.rice - FOOD)}섬 · 먹을 ${FOOD}섬은 남김)${S.tob ? ' + 담배' : ''}` : S.tob ? '담배 지기' : '🌾 먹을 쌀까지 지기'); lab('granT', '담배 지기'); lab('bo', `💧 보 쌓기 ${S.bo}/6`, true); lab('work', '품 팔기 5냥'); lab('cloth', '🧵 베 6냥');
    const tb = c2 && c2.tob ? (w) => ` · 담배 ${tobPrice(w)}냥` : () => '', rp = (w) => (c2 && c2.k === 'rice' && !c2.n ? '' : `${tb('x') ? '쌀 ' : ''}${price(w)}냥`);
    lab('town', `읍내 장 ${rp('town')}${tb('town')}`); lab('next', c2 && c2.k === 'cloth' ? '베 11냥' : `고개 너머 장 ${rp('next')}${tb('next')}`); lab('port', `⛵ 한양 배(곧 떠난다) ${rp('port')}${tb('port')}`); lab('pedd', `보부상 ${rp('pedd')}${tb('pedd')}`);
    lab('duty', `⚠ 부역 — ${S.duty ? Math.ceil(S.duty.left) : 0}초 안에`, true); if (S.aj && !S.taxPaid) put(S.aj.x, 3.4, S.aj.z, '⚠ 아전 — 세금 독촉', true);
    lab('gwe', sn === 2 && !S.taxPaid ? `🥁 세금 ${S.taxDue}냥` : `빚 갚기 (남은 빚 ${S.debt}냥)`, true); lab('ox', `🐂 소 ${P_OX}냥`); lab('paper', `📜 임명장 ${P_PAPER}냥`); lab('lordBuy', `논 사기 ${P_LORD}냥`); lab('door', '철 넘기기');
    for (const k in NB) { const n = NB[k]; if (n.sell.m.visible) put(n.sell.x, 2.4, n.sell.z, `논 사기 ${P_NB}냥`); if (n.help.m.visible) put(n.help.x, 2.4, n.help.z, `쌀 ${HELP}섬 꾸어 주기`); if (!n.gone && n.trouble && sn === 3 && dist(S.px, S.pz, n.home[0], n.home[1]) < 60) put(n.home[0], 5, n.home[1] - 3, `🏚 ${n.name}네 — 먹을 것이 떨어졌다`, true); } }
  for (; ti < tags.length; ti++) tags[ti].style.display = 'none';
  { let bi = 0; for (const m of TALKERS) { const tk = m._talk; if (!tk || tk.t <= 0 || !m.visible) continue; tk.t -= dt || 0.016; const d = talks[bi]; if (!d) break; const q = v3.set(m.position.x, tk.h, m.position.z).project(cam); if (!play || q.z > 1 || Math.abs(q.x) > 1 || Math.abs(q.y) > 1 || dist(S.px, S.pz, m.position.x, m.position.z) > 60) continue; bi++; d.style.display = 'block'; d.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; d.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; d.style.opacity = Math.min(1, tk.t * 3); if (d._h !== tk.text) { d.textContent = tk.text; d._h = tk.text; } } for (; bi < talks.length; bi++) talks[bi].style.display = 'none'; }
  /* 아전 일행: 포졸 둘이 뒤따르고, 화면 밖이면 그쪽 가장자리에 「⚠ 아전」 */
  { const ry = ajeon.rotation.y, sx = Math.sin(ry), cz = Math.cos(ry);
    pojol.forEach((m, i) => { m.visible = ajeon.visible; if (!m.visible) return; const sd = i ? 1.3 : -1.3; m.position.set(ajeon.position.x - sx * 2 + cz * sd, 0, ajeon.position.z - cz * 2 - sx * sd); m.rotation.y = ry; walkAnim(m, S.t * 10 + i * 1.7, !!S.aj && play); });
    let show = false; if (play && S.aj && !S.taxPaid) { const q = v3.set(S.aj.x, 1.6, S.aj.z).project(cam), behind = q.z > 1;
      if (behind || Math.abs(q.x) > 0.94 || Math.abs(q.y) > 0.86) { let gx = behind ? -q.x : q.x, gy = behind ? -1 : q.y; const k = 1 / Math.max(Math.abs(gx) / 0.84, Math.abs(gy) / 0.74, 0.001); show = true;
        const t = `${gx < -0.3 ? '◀ ' : ''}⚠ 아전 · 우리 집까지 ${Math.round(dist(S.aj.x, S.aj.z, DOOR[0], DOOR[1]))}걸음${gx > 0.3 ? ' ▶' : Math.abs(gx) <= 0.3 ? (gy > 0 ? ' ▲' : ' ▼') : ''}`; if (ajMark._h !== t) { ajMark.textContent = t; ajMark._h = t; } ajMark.style.display = 'block';
        const hw = (ajMark.offsetWidth || 260) / 2 + 10, hh = (ajMark.offsetHeight || 34) / 2 + 10; ajMark.style.left = clamp(((gx * k + 1) / 2) * innerWidth, hw, innerWidth - hw) + 'px'; ajMark.style.top = clamp(((1 - gy * k) / 2) * innerHeight, hh + 60, innerHeight - hh - 60) + 'px'; } }
    ajMark.style.display = show ? 'block' : 'none'; }
  BK.flushAll(); land.update(S.t, waterSky); air.update(dt || 0.016, S.t, clamp(S.st / SLEN[S.season], 0, 1), S.px, S.pz);
  $('jobl').textContent = play ? (S.jobLabel || '') : ''; $('jobl').style.display = play && S.jobLabel ? 'block' : 'none';
}
const CAMV = { h: [24, 46], bk: [42, 76], fov: 32 };   /* 약 30° 내려다보기 — 예전 68° */
function view() {
  { const sc = innerHeight / (2 * Math.tan(cam.fov * Math.PI / 360)); const sm = air.smoke(); if (sm) sm.material.uniforms.uScale.value = sc; air.motes.material.uniforms.uScale.value = sc; }
  if (window.__camAt) { const c = window.__camAt; cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); if (cam.fov !== (c[6] || 40)) { cam.fov = c[6] || 40; cam.updateProjectionMatrix(); } return; }   /* 시험용(화면 찍기) */
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 4.4, 0, 1) : 0, e = k * k * (3 - 2 * k); cam.position.set(lerp(300, HOME[0] + 6, e), lerp(60, 26, e), lerp(190, HOME[1] + 36, e)); cam.lookAt(lerp(200, HOME[0], e), 2, lerp(110, HOME[1] - 10, e)); if (cam.fov !== 50) { cam.fov = 50; cam.updateProjectionMatrix(); } }
  else { /* 「기울어 보인다」(준호 11-20, 11-23 다시): 화각이 넓으면(46°·62°) 화면 가장자리의 논두렁·집·나무가 바깥으로 비스듬히 눕는다.
       위에서(기본) = 약 68° 내려다보기를 화각 24°로, 멀리서 — 보이는 넓이는 그대로. 지도(V 셋째) = 화각 22°로 아주 높이서 거의 바로 위(약 6°) — 온 고을이 화면에 꽉 차게 높이를 화면 비율로 셈 */
    let farC = 1400;   /* 먼 능선(720~1000)까지 */
    if (S.view === 3) { const fov = 22, t = Math.tan(fov * Math.PI / 360), h = Math.max(272 / (2 * t), 404 / (2 * t * cam.aspect)); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); } cam.position.lerp(v3.set(W / 2, h, H / 2 + 4 + h * 0.1), 0.12); cam.lookAt(W / 2, 0, H / 2 + 4); farC = h * 1.4; S.mapH = h; }
    const nearC = S.view === 3 ? Math.max(0.5, (S.mapH || 700) * 0.3) : 0.5; if (cam.near !== nearC) { cam.near = nearC; cam.updateProjectionMatrix(); }   /* 아주 높이서 볼 때 앞면 깊이를 넉넉히 — 강·모래톱이 줄무늬로 깜빡이던 것 */
    else followCam(cam, S, S.view === 4 ? { W, H, clampX: [-40, W + 40], clampZ: [0, H + 10], farH: [94, 118], farBk: [38, 48], farFov: 24 } : { W, H, clampX: [-40, W + 40], clampZ: [0, H + 10], farH: CAMV.h, farBk: CAMV.bk, farFov: CAMV.fov });   /* 11-23 준호 「좀 더 정교하게」: 기본은 비스듬히 낮게(집 옆면·처마·담 높이가 보이게) */
    if (cam.far !== farC) { cam.far = farC; cam.updateProjectionMatrix(); }
    for (const m of skyMeshes) m.scale.setScalar(S.view === 3 ? Math.max(8, farC / 280) : 4.2); scene.fog.near = S.view === 3 ? farC : 175; scene.fog.far = S.view === 3 ? farC * 1.6 : 470;
    const day = S.mode === 'play' || S.mode === 'hold' ? clamp(S.st / SLEN[S.season], 0, 1) : 0.3, sa = sunAt(day, DAY.sun), fx = Math.round(S.px / 4) * 4, fz = Math.round(S.pz / 4) * 4;
    sun.position.set(fx + sa.dir.x * 95, sa.dir.y * 95, fz + sa.dir.z * 95); sun.target.position.set(fx, 0, fz); sun.color.copy(sa.col); sun.intensity = DAY.sunBase * sa.k; for (const w of land.waters) w.uniforms.uSun.value.copy(sa.dir);
    DAY.repaint -= 1; if (DAY.repaint <= 0) { DAY.repaint = 12; const wm = sa.warm * (S.season === 3 ? 0.2 : 0.42); DAY.t2.copy(DAY.top).lerp(DAY.warmC, wm * 0.35); DAY.l2.copy(DAY.low).lerp(DAY.warmC, wm); sky.paint(DAY.t2, DAY.l2); scene.fog.color.copy(DAY.l2); }
    if (S.view !== 3) { scene.fog.near = 175 - DAY.hot * 45; scene.fog.far = 470 - DAY.hot * 80; } }
  edgeGoal($('goal'), cam, v3.set(0, 0, 0).clone(), false, 0.82);
}

/* ───── 미션 카드: 「지금 할 일」 하나를 kit 의 카드·빛기둥·화살표로 비춘다(목록은 위 tasks) ───── */
const proxy = { get t() { return curTask ? curTask.t : '철이 바뀌기를 기다린다'; }, how: () => (curTask ? curTask.how : '') + '<i hidden>' + (curTask ? curTask.id + S.season + S.year : '') + '</i>', n: () => (curTask && curTask.n ? TL.find((t) => t.id === curTask.id).n : null), done: () => false, at: () => (curTask ? routeTo(curTask.at()) : null), tag: () => { const g = curTask && curTask.tag; return typeof g === 'function' ? g() : g || '여기!'; } };
const mis = missions(scene, cam, [proxy], {});
function misHead() { if (innerWidth <= 640 && mis.card.style.display === 'none') { const td = $('todo'); if (td.style.top !== '134px') td.style.top = '134px'; }   /* 좁은 화면: 카드가 없을 때 kit 이 목록을 60px 로 올려 알약 줄을 덮던 것 */
  const h = mis.card.firstElementChild, req = TL.filter((t) => t.req), txt = `${S.year}번째 해 ${SEASONS[S.season]} · ${curTask && !curTask.req && curTask.id !== 'door' ? '골라서 할 일' : `꼭 할 일 ${req.filter((t) => t.ok).length}/${req.length}`}`; if (h.textContent !== txt) h.textContent = txt; }

newGame(); S.mode = 'title'; for (const p of plots) drawPlot(p); hud(); place(0.016);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.season(); };
{ const d = readSave(); if (d) { const b = document.createElement('button'); b.id = 'cont'; b.textContent = `이어서 하기 — ${d.S.year}번째 해 ${SEASONS[d.S.season]}`; b.style.marginRight = '10px'; $('go').parentNode.insertBefore(b, $('go')); $('go').textContent = '처음부터'; $('go').style.opacity = '.75';
    b.onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'play'; loadGame(d); SFX.season(); }; } }
canvas.addEventListener('pointerdown', () => { if (S.mode === 'intro') S.introT = 99; });
/* 느린 기기(크롬북)면 저절로 가볍게: 놀이 첫 4초의 한 장면이 평균 40ms 를 넘으면 나무 그림자 · 낙엽 · 빛 알갱이를 끈다(?lite=1 이면 처음부터) */
const PERF = { t: 0, n: 0, lite: false };
function goLite() { if (PERF.lite) return; PERF.lite = true; for (const m of LITE) eachInst(m, (q) => { q.castShadow = false; }); air.leaves.material.opacity = 0; air.motes.material.visible = false; sun.shadow.blurSamples = 4; }
if (new URLSearchParams(location.search).get('lite') === '1') goLite();
runLoop((dt) => { if (S.mode === 'play' && !PERF.lite && PERF.t < 4) { PERF.t += dt; PERF.n++; if (PERF.t >= 4 && PERF.t / PERF.n > 0.04) goLite(); } update(dt); mis.update(dt, S.mode === 'play'); misHead(); }, view, () => renderer.render(scene, cam));
window.__scene = { S, update, CAMV, scene, PERF, goLite, redraw() { for (const p of plots) drawPlot(p); }, beasts: { dog, hens, oxS, oxM, cartM }, ctl, plots, NB, mine, owned, job, price, rank, pads, shipIn, ACT, extras, get cur() { return curTask; }, guideAt() { return curTask ? routeTo(curTask.at()) : null; }, get TL() { return TL; }, saveGame, readSave, loadGame,
  go() { $('go').click(); S.introT = 99; update(0.01); }, snap(n = 240) { const m = S.mode; if (m === 'title' || m === 'intro') S.mode = 'hold'; for (let i = 0; i < n; i++) view(); S.mode = m; }, info() { renderer.render(scene, cam); const r = renderer.info.render; return { calls: r.calls, tris: r.triangles }; }, view(n) { S.view = n; }, step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  next() { const b = document.querySelector('#ov button'); if (b && $('ov').style.display !== 'none') b.click(); },
  const: { HOME, GRAN, SEED, NURS, TOBS, DOOR, BO, LORD, TOWN, GWE, PAPER, OX, CLOTH, NEXT, PORT, PEDD, SLEN, P_OX, P_NB, P_LORD, P_PAPER } };
