/* 케이월드 · 피란길 — 대한민국 한 장면(S10 v2, 2026-11-17). 공통 부품 = ../scene/kit.js.
   판 모양이 다른 첫 장면: 네모 판이 아니라 한쪽(-z)으로만 가는 긴 띠(약 320). 뒤에서 「뒤 선」(S.backZ)이 따라 올라와 되돌아가지 못한다.
   구간 넷 — 고갯길(z 320→240, 폭 10 · 짐과 걸음) · 읍내(240→150, 폭 26 · 인파) · 강가 벌판과 강(150→50, 폭 60 · 건너는 길 셋) · 천막촌(50→0, 폭 20 · 마무리).
   목표 = 지평선의 천막촌 불빛(첫 화면부터 보이고 걸을수록 커진다). 식구 넷(나 · 동생 · 어머니 · 할머니)이 내 발자국을 따라 줄지어 온다 — 뛰면 할머니가 처지고, 끈이 끊어지면 그 자리에서 기다린다.
   군인과 싸움은 그리지 않는다. 뒤쪽 하늘의 불빛과 낮은 소리만. 쓰러진 사람도 그리지 않는다(버려진 짐과 수레까지).
   그림(2026-11-17): 상자 대신 블렌더로 만든 모델 — 공통 묶음(people · nature · build · props)과 이 장면 묶음(refuge.glb ← tools/blender/make_refuge.py, 이름이 rf_ 로 시작). 놀이(규칙 · 수치 · 막는 네모 · 난수 차례)는 그대로다.
   좌표: x 동쪽(+), z 남쪽(+) — 화면 아래(z 큰 쪽)에서 위(z 작은 쪽)로 걷는다. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, canvasTex, glowSprite, people, collideRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, edgeGoal, overBar, runLoop, backdrop, groundTex, loadArt, ART, art, artInst, artGeo, artMat, missions } from '../scene/kit.js?v=5';
await loadArt('people', 'nature', 'build', 'props', 'refuge');   /* 블렌더로 만든 모델(사람·자연·집·소품) */

const W = 80, H = 320, START = [41, 316], RIVER = [72, 90], FORD = [12.5, 19.5], ICE = [56.5, 69.5], DOCK = [40, 92.6], DOCK_S = [40, 69.4], CAP = 4.5, BACK0 = 370, BACKV = 2.9;
const VIEWS_R = ['길 따라', '가까이', '어깨 너머', '지도'];
/* 판 폭: [z, x0, x1] 마디 — 사이는 부드럽게 잇는다 */
const KN = [[330, 37, 47], [292, 31, 41], [266, 36, 46], [246, 34, 44], [234, 27, 53], [158, 27, 53], [144, 10, 70], [56, 10, 70], [44, 30, 50], [-6, 30, 50]];
function edgeAt(z) { if (z >= KN[0][0]) return [KN[0][1], KN[0][2]]; for (let i = 0; i < KN.length - 1; i++) { const a = KN[i], b = KN[i + 1]; if (z <= a[0] && z >= b[0]) { const t = (a[0] - z) / (a[0] - b[0]), s = t * t * (3 - 2 * t); return [lerp(a[1], b[1], s), lerp(a[2], b[2], s)]; } } const l = KN[KN.length - 1]; return [l[1], l[2]]; }
const zoneAt = (z) => (z > 240 ? 'pass' : z > 150 ? 'town' : z > 50 ? 'river' : 'camp');
const ITEMS = { rice: { ic: '🌾', name: '쌀', w: 2, c: 0xe8dcb0 }, pot: { ic: '🍲', name: '솥', w: 1.5, c: 0x34343c }, quilt: { ic: '🛏️', name: '이불', w: 1.5, c: 0xc84a5a }, album: { ic: '🖼️', name: '사진첩', w: 0.5, c: 0x7a5a32 }, books: { ic: '📚', name: '책보', w: 0.5, c: 0x3a6ab0 } };
const YARD = [['rice', 37.6, 313], ['pot', 40.2, 311.4], ['quilt', 44.4, 313], ['album', 38.4, 308.8], ['books', 42.8, 309]];
const FAM0 = [{ id: 'bro', name: '동생', ic: '👦', sp: 6.0 }, { id: 'mom', name: '어머니', ic: '👩', sp: 5.6 }, { id: 'gma', name: '할머니', ic: '👵', sp: 4.3 }];
const KID = [50.6, 191], WALL = [28.7, 214], CLASS = [37.4, 29.5], TENT = [44.2, 10];
const FIRES = [[40.6, 251], [32.5, 223], [48.5, 169], [24, 126], [56, 104], [40, 38], [40, 21]];
const SOLID = [];

/* ───── 화면(해 질 녘 · 눈) ───── */
const { renderer, scene, cam, resize } = stage({ fog: [0x7d88a8, 60, 260], exposure: 1.05, fov: 45 });
const hemi = new THREE.HemisphereLight(0xa8b8e0, 0x56607a, 1.15); scene.add(hemi);
const sun = sunLight(scene, { color: 0xffa070, intensity: 1.1, box: [34, 34], far: 120, pos: [START[0] - 10, 22, START[1] + 30], target: [START[0], 0, START[1]] });
addEventListener('resize', resize); resize();
const LITE = matchMedia('(pointer: coarse)').matches && innerWidth < 500, rnd = rng((19501225 + (LITE ? 669 : 945) * 0x6D2B79F5) | 0);   /* 놀이의 난수 — 판 밖(backdrop)이 예전에 쓰던 만큼(945번 · 작은 화면 669번) 지난 자리에서 시작한다. 판 밖 그림이 난수를 더 쓰게 바뀌어도 놀이 배치(막는 네모 · 인파)는 그대로다 */
const BD = backdrop(scene, { rnd: rng(19501225), z0: 0, z1: 320, edge: edgeAt, field: (z) => z < 150, skip: (z) => z > 66 && z < 96, skyTop: 0x1d2a4c, skyLow: 0x7d88a8, backC: 0xd8542c, frontC: 0xffc070, lite: LITE });
const { person, walkAnim } = people(scene);
const dmy = new THREE.Object3D(), colr = new THREE.Color();
function inst(geo, color, list, shadow = true) { const m = new THREE.InstancedMesh(geo, M(color), Math.max(1, list.length)); list.forEach((t, i) => { dmy.position.set(t[0], t[1], t[2]); dmy.rotation.set(t[7] || 0, t[6] || 0, 0); dmy.scale.set(t[3], t[4], t[5]); dmy.updateMatrix(); m.setMatrixAt(i, dmy.matrix); if (t[8] != null) m.setColorAt(i, colr.set(t[8])); }); m.count = list.length; m.castShadow = shadow; m.receiveShadow = true; scene.add(m); return m; }
const B1 = new THREE.BoxGeometry(1, 1, 1);

/* 그림 도구: 같은 모델은 장면을 다 지은 뒤 구간(고갯길 · 읍내 · 강 · 천막촌)마다 한 번에 그린다(put → flush). 구간 묶음은 화면이나 그림자 틀 밖이면 통째로 걸러진다 — 긴 판이라 이게 크다.
   rv = 그림에만 쓰는 난수 — 놀이의 난수(rnd) 차례와 막는 네모(SOLID)는 예전 그대로다. */
const rv = rng(1950), PUT = {}, ZONE = { pass: [], town: [], river: [], camp: [] }, sm = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
function put(name, x, y, z, s = 1, r = 0, tints = null, shadow = true) { const k = name + '|' + (tints ? JSON.stringify(tints) : '') + '|' + (shadow ? 1 : 0) + zoneAt(z); (PUT[k] = PUT[k] || { name, tints: tints || {}, shadow, list: [] }).list.push([x, y, z, s, r]); }
function flush() { for (const k in PUT) { const p = PUT[k], m = artInst(scene, p.name, p.list, p.tints, { shadow: p.shadow }); delete PUT[k]; if (!m) continue; for (const q of [m, m.userData.glow]) if (q) { q.computeBoundingSphere(); q.frustumCulled = true; ZONE[zoneAt(p.list[0][2])].push(q); } } }
function one(name, x, y, z, s = 1, r = 0, tints = {}, o) { const m = art(name, tints, o); m.position.set(x, y, z); if (Array.isArray(s)) m.scale.set(s[0], s[1], s[2]); else m.scale.setScalar(s); m.rotation.y = r; scene.add(m); return m; }
const BAG = [0x8a4a3a, 0x3a5a8a, 0xc8a050, 0x6a6a7a, 0xe8e0d0];   /* 보따리 천 색 */
const crop = (p) => { if (p.userData.head && p.userData.tm) p.userData.head.geometry = artGeo(['head', 'hair_base'], p.userData.tm); return p; };   /* 짧게 깎은 머리(1950년 아이) — kit 의 맨머리는 상투라서 머리만 다시 굽는다 */
const mid = (z) => { const [a, b] = edgeAt(z); return (a + b) / 2 + Math.sin(z * 0.11) * 0.8; };   /* 다져진 길의 가운데 */

/* 땅: 판 밖 눈벌판 · 판 안 눈 · 밟혀 다져진 길 — 가장자리가 눈에 스며드는 띠 한 장(강가에서는 건너는 길 셋으로 갈린다) */
{ const tex = groundTex(), gnd = (z0, z1) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(1400, z1 - z0), M(0xdfe6f0, { map: tex })), uv = g.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 100, uv.getY(i) * (z1 - z0) / 14); g.rotation.x = -Math.PI / 2; g.position.set(40, -0.02, (z0 + z1) / 2); g.receiveShadow = true; scene.add(g); };
  gnd(-540, RIVER[0] + 0.1); gnd(RIVER[1] - 0.1, 860);   /* 강 자리는 비워 둔다 — 눈밭에 덮여 안 보이던 강물이 보인다 */
  const P = [], C = [], U = [], I = [], OUT = 0xdfe6f0, SN = 0xeef2f8, c2 = new THREE.Color(), mix = (a, b, t) => colr.set(a).lerp(c2.set(b), t).getHex();
  /* 띠: secs = [[z, x, 색, x, 색, …], …] — z 가 커지는 차례, x 가 커지는 차례 */
  const band = (secs, y) => { const base = P.length / 3, n = (secs[0].length - 1) / 2; secs.forEach((s, r) => { for (let k = 0; k < n; k++) { const x = s[1 + k * 2]; P.push(x, y, s[0]); U.push(x / 14, s[0] / 14); colr.set(s[2 + k * 2]); C.push(colr.r, colr.g, colr.b); } if (r) for (let k = 0; k < n - 1; k++) { const a = base + (r - 1) * n + k, b = a + n; I.push(a, b, a + 1, a + 1, b, b + 1); } }); };
  for (const [z0, z1] of [[-8, RIVER[0]], [RIVER[1], 332]]) { const strip = []; for (let z = z0; z <= z1; z += 2) { const [a, b] = edgeAt(z); strip.push([z, a - 0.9, OUT, a + 0.3, SN, b - 0.3, SN, b + 0.9, OUT]); } band(strip, 0.008); }
  const town = (z) => sm((244 - z) / 12) * sm((z - 150) / 10);
  const road = (z0, z1) => { const secs = []; for (let z = z0; z <= z1; z += 2) { const tw = town(z), c = mid(z), hw = lerp(z < 150 ? 1.5 : 1.8, 6, tw), l = hw * (0.92 + rv() * 0.16), r = hw * (0.92 + rv() * 0.16), f = 0.5 + hw * 0.14, pc = mix(0xc6c1b8, 0xa8a49c, tw), pe = mix(pc, SN, 0.4); secs.push([z, c - l - f, SN, c - l, pe, c - l * 0.45, pc, c + r * 0.45, pc, c + r, pe, c + r + f, SN]); } band(secs, 0.036); };
  const side = (z0, z1, x0, x1) => { const secs = [], pc = mix(0xc6c1b8, SN, 0.55); for (let z = z0; z <= z1 + 0.01; z += 2) { const c = lerp(x0, x1, sm((z - z0) / (z1 - z0))), l = 0.6 + rv() * 0.3, r = 0.6 + rv() * 0.3; secs.push([z, c - l - 0.9, SN, c - l, pc, c + r, pc, c + r + 0.9, SN]); } band(secs, 0.022); };
  road(-6, 67); road(95, 330); side(92, 148, 16, mid(148)); side(92, 148, 63, mid(148)); side(50, 71, mid(50), 16); side(50, 71, mid(50), 63);
  const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ge.setAttribute('normal', new THREE.Float32BufferAttribute(P.map((v, i) => (i % 3 === 1 ? 1 : 0)), 3)); ge.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); ge.setIndex(I);
  const m = new THREE.Mesh(ge, M(0xffffff, { vertexColors: true, map: tex })); m.receiveShadow = true; scene.add(m); }

/* 1 고갯길: 양쪽 눈 비탈(울퉁불퉁한 한 장) · 눈 쓴 소나무 · 바위 · 떠나는 집 · 서낭당 돌무더기 · 장승 */
const HP = [[0.2, 0], [1.6, 0.6], [3.4, 1.5], [5.8, 2.9], [8.6, 4.3], [12, 5.6], [16, 6.6], [21, 7.2], [28, 6.6], [38, 4.4], [52, 1.8], [70, -0.4]];   /* 비탈 옆모습: [길 가장자리에서 떨어진 거리, 높이] */
const hillH = (off) => { if (off <= HP[0][0]) return 0; for (let i = 0; i < HP.length - 1; i++) if (off <= HP[i + 1][0]) return lerp(HP[i][1], HP[i + 1][1], (off - HP[i][0]) / (HP[i + 1][0] - HP[i][0])); return HP[HP.length - 1][1]; };
const passFade = (z) => sm((z - 236) / 16) * sm((364 - z) / 16);
function hillY(x, z) { const [a, b] = edgeAt(Math.min(z, 330)); return hillH(x < a ? a - x : x > b ? x - b : 0) * passFade(z); }
{ const P = [], C = [], I = [], n = HP.length, cLo = new THREE.Color(0xeef3fa), cHi = new THREE.Color(0xc6d2e4);
  for (const side of [-1, 1]) { let r = 0; for (let z = 236; z <= 364; z += 3, r++) { const e = edgeAt(Math.min(z, 330))[side < 0 ? 0 : 1], f = passFade(z), base = P.length / 3;
      HP.forEach(([off, h], k) => { const j = k < 2 ? 0 : 1; P.push(e + side * (off + (rv() - 0.5) * 1.3 * j), k ? h * f * (1 + (rv() - 0.5) * 0.26 * j) + (rv() - 0.5) * 0.5 * j * f : -0.02, z + (rv() - 0.5) * 1.5 * j); colr.copy(cLo).lerp(cHi, clamp(h / 7, 0, 1)).multiplyScalar(0.96 + rv() * 0.08); C.push(colr.r, colr.g, colr.b); });
      if (r) for (let k = 0; k < n - 1; k++) { const a = base - n + k, b = base + k; if (side < 0) I.push(a, a + 1, b, a + 1, b + 1, b); else I.push(a, b, a + 1, a + 1, b, b + 1); } } }
  const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ge.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); ge.setIndex(I); ge.computeVertexNormals();
  const hill = new THREE.Mesh(ge, M(0xffffff, { vertexColors: true })); hill.receiveShadow = true; scene.add(hill);
  const pines = [], rocks = [];
  for (let z = 236; z < 340; z += 5) { const [a, b] = edgeAt(Math.min(z, 330)), fade = clamp((z - 236) / 14, 0, 1); if (fade <= 0) continue;
    for (const [side, e] of [[-1, a], [1, b]]) {
      for (let k = 0; k < 2; k++) { if (rnd() < 0.35) continue; const x = e + side * (5 + rnd() * 16), s = 0.8 + rnd() * 0.7, zz = z + rnd() * 4; rnd(); pines.push([x, zz, s]); }
      if (rnd() < 0.3) rocks.push([e + side * 0.9, 0.35, z + rnd() * 4, rnd() * 3]); } }
  pines.forEach(([x, z, s], i) => put(i % 4 === 3 ? 'pine_a' : i % 7 === 2 ? 'pine_b' : 'pine_snow', x, hillY(x, z) - 0.3, z, s * 0.95, rv() * 6.28));
  rocks.forEach((r, i) => put(i % 3 === 1 ? 'rock_b' : 'rock_a', r[0], 0.1, r[2], i % 3 === 1 ? 0.62 : 1.25, r[3]));
  for (const r of rocks) SOLID.push([r[0] - 0.6, r[2] - 0.5, r[0] + 0.6, r[2] + 0.5]);
  /* 비탈에 더 얹는 것(길 밖): 먼 소나무 · 앙상한 나무 · 바위 · 그루터기 · 통나무 */
  const slope = (off0, off1, z0 = 242, z1 = 350) => { const z = z0 + rv() * (z1 - z0), s = rv() < 0.5 ? -1 : 1, e = edgeAt(Math.min(z, 330))[s < 0 ? 0 : 1], x = e + s * (off0 + rv() * (off1 - off0)); return [x, hillY(x, z), z]; };
  for (let i = 0; i < 34; i++) { const [x, y, z] = slope(15, 46); put(i % 3 ? 'pine_snow' : 'pine_a', x, y - 0.3, z, 0.8 + rv() * 0.6, rv() * 6.28, null, false); }
  for (let i = 0; i < 14; i++) { const [x, y, z] = slope(2.4, 7, 244, 322); put('tree_bare_snow', x, y - 0.2, z, 0.9 + rv() * 0.4, rv() * 6.28); }
  for (let i = 0; i < 12; i++) { const [x, y, z] = slope(1.6, 9); put(i % 2 ? 'rock_b' : 'rock_a', x, y + 0.05, z, 0.8 + rv() * 0.7, rv() * 6.28); }
  for (let i = 0; i < 5; i++) { const [x, y, z] = slope(6, 15); put(i % 2 ? 'rock_big' : 'rock_tall', x, y + 0.2, z, 0.7 + rv() * 0.5, rv() * 6.28); }
  for (let i = 0; i < 7; i++) { const [x, y, z] = slope(1.3, 3.2, 246, 318); put('stump', x, y - 0.05, z, 0.9 + rv() * 0.4, rv() * 6.28); if (i % 2) put('log', x + 0.6, y + 0.1, z + 1.2, 0.8, rv() * 6.28); }
  /* 떠나는 집: 눈 쓴 초가(문이 길 쪽) · 돌담 · 장독대 · 장작 · 볏가리 */
  one('thatch_snow', 42, 0, 327, [1.19, 1.1, 1.11], Math.PI); SOLID.push([37, 324, 47, 331]);
  for (const z of [322.2, 318.3, 314.4]) for (const s of [-1, 1]) { const e = (q) => edgeAt(q)[s < 0 ? 0 : 1]; put('rf_doldam', e(z) + s * 0.45, 0, z, [1.0, 0.95, 1], -Math.atan2(4, e(z + 2) - e(z - 2))); }
  { const z = 317.4, x = edgeAt(z)[1] + 1.9; one('rf_jangdok', x, hillY(x, z) - 0.12, z, 0.85, -Math.PI / 2 - 0.2); const x2 = edgeAt(320.6)[0] - 1.5; put('firewood', x2, hillY(x2, 320.6) - 0.05, 320.6, 1.15, 0.4); put('firewood', x2 - 0.2, hillY(x2, 321.6) - 0.05, 321.7, 1.05, 0.3); put('straw_stack', 34.2, hillY(34.2, 326.5) - 0.2, 326.5, 0.9, 1); }
  /* 고갯마루의 서낭당 돌무더기와 솟대 · 고개 끝의 장승 한 쌍 */
  { const z = 268, x = edgeAt(z)[1] + 2.6; one('rf_cairn', x, hillY(x, z) - 0.15, z, 1.15, 0.6); put('sotdae', x + 1.7, hillY(x + 1.7, z - 1.4) - 0.2, z - 1.4, 1, 0.5); put('tree_bare_snow', x + 0.9, hillY(x + 0.9, z + 2.3) - 0.2, z + 2.3, 1.3, 2);
    for (const s of [-1, 1]) { const zj = 247.5, xj = edgeAt(zj)[s < 0 ? 0 : 1] + s * 1.25; put('jangseung', xj, hillY(xj, zj) - 0.1, zj, 1.05, s < 0 ? Math.PI / 2 - 0.3 : -Math.PI / 2 + 0.3); } } }

/* 2 읍내: 닫힌 가게 줄(단층 널문 · 이층 · 간판 벽 · 기와 · 초가) · 담과 그 안채 · 뒷골목 지붕 · 전봇대와 전깃줄 · 버려진 수레와 짐 */
const wallNote = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.8), new THREE.MeshStandardMaterial({ color: 0xf6f0dc, roughness: 1 }));
{ const lots = [];
  for (const side of [-1, 1]) { let z = 236; while (z > 156) { const len = 6 + rnd() * 4, cz = z - len / 2, e = side < 0 ? 27 : 53, wall = rnd() < 0.3 || (side < 0 && cz < 219 && cz > 209), L = { side, e, z, len, cz, wall, back: [] };
      if (wall) SOLID.push([e + side * 0.4 - 0.4, z - len, e + side * 0.4 + 0.4, z]);
      else { L.hgt = 2.8 + rnd() * 1.5; L.ci = Math.floor(rnd() * 3); SOLID.push([e + side * 0.1 - (side < 0 ? 6.4 : 0), z - len, e + side * 0.1 + (side > 0 ? 6.4 : 0), z]); }
      for (let k = 0; k < 2; k++) L.back.push([e + side * (11 + k * 7 + rnd() * 3), cz + rnd() * 3]);
      lots.push(L); z -= len; } }
  /* 가게 꼴: [모델, 지붕까지 친 너비, 앞벽까지 거리, 깊이 배율] */
  const KIND = { a: ['rf_shop_a', 7.8, 2.75, 1.08], b: ['rf_shop_b', 7.2, 2.75, 1.08], c: ['rf_shop_c', 6.5, 2.75, 1.08], t: ['tile_snow', 9.4, 3.1, 1.0], h: ['thatch_snow', 7.7, 2.62, 1.12] }, ORDER = 'acbhatcbahcbat';
  const TINT = [{ wall: 0xcdbb98, roof: 0x5c6470, cloth: 0x8a4a3a }, { wall: 0xb4a284, roof: 0x6e5c50, cloth: 0x3a566a }, { wall: 0xd8ccb4, roof: 0x4e586c, cloth: 0xa08a50 }];
  let j = 0;
  lots.forEach((L, i) => { const { side, e, cz, len } = L, r = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    if (L.wall) { const n = Math.max(1, Math.round(len / 4)), note = side < 0 && cz < 219 && cz > 209;
      for (let k = 0; k < n; k++) put('rf_wall', e + side * 0.4, 0, L.z - len * (k + 0.5) / n, [len / n / 4 + 0.004, note ? 1.25 : 1.06, 1], r, { wall: 0xb8a88c });
      put('rf_house', e + side * 5.6, 0, cz, [Math.min(1.6, (len + 1) / 5.9), 1.3, 1.45], r, { wall: 0xd8ccb4, roof: 0x4c586c }, false); put(i % 2 ? 'tree_bare_snow' : 'tree_bare', e + side * 2.1, 0, cz + len * 0.3, 1.25, rv() * 6.28); if (i % 2) put('rf_jangdok', e + side * 2.0, 0, cz - len * 0.25, 0.8, r, null, false); else put('jar_a', e + side * 1.9, 0, cz - len * 0.25, 0.9, 0, null, false); }
    else { let k = ORDER[j++ % ORDER.length]; if (k === 't' && len < 7.6) k = 'a'; if (k === 'b' && L.hgt < 3.1) k = 'c'; const [nm, w, front, sz] = KIND[k], shop = nm.startsWith('rf_');
      put(nm, e + side * (0.12 + front * sz), 0, cz, [(len - (shop ? 0.5 : 0.1)) / w, k === 'b' ? 0.94 + (L.hgt - 2.8) * 0.06 : 0.92 + (L.hgt - 2.8) * 0.14, sz], r, shop ? TINT[L.ci] : k === 'h' ? { wall: TINT[L.ci].wall } : null);
      if (k !== 'a') put('rf_drift_l', e - side * 0.12, 0, cz, [len / 7.6, 0.55, 0.5], r, null, false);
      if (rv() < 0.6) { const q = rv(), zz = cz + (rv() - 0.5) * (len - 2.4), x = e - side * 0.42; if (q < 0.4) put('bundle', x, 0, zz, 0.8 + rv() * 0.3, rv() * 6, { cloth: BAG[i % 5] }); else if (q < 0.6) put('rf_suitcase', x, 0, zz, 1, r + 0.2); else if (q < 0.8) put('jar_b', x, 0, zz, 1, 0); else put('sack', x, 0, zz, 1.1, r + rv()); } }
    L.back.forEach(([x, z], k) => put('rf_house', x + side * 1.2, 0, z, [0.95 + rv() * 0.3, 0.95 + rv() * 0.25, 0.95 + rv() * 0.3], r + (rv() < 0.35 ? Math.PI / 2 : 0), (i + k) % 3 ? { wall: 0xb9a888, roof: 0xb08a3e } : { wall: 0xd0c4aa, roof: 0x4c586c }, false));
    if (i % 3 === 0) put('tree_bare_snow', e + side * (15.5 + rv() * 2), 0, cz + 3, 1.2 + rv() * 0.4, rv() * 6.28, null, false); });
  /* 전봇대와 전깃줄(대 사이로 늘어진다) */
  const wires = []; for (let z = 232; z > 158; z -= 15) for (const x of [28.6, 51.4]) { put('power_pole', x, 0, z, 1, 0); SOLID.push([x - 0.2, z - 0.2, x + 0.2, z + 0.2]);
    if (z - 15 > 158) for (const dx of [-0.75, 0.75]) for (let k = 0; k < 4; k++) wires.push(x + dx, 6.05 - Math.sin(k / 4 * Math.PI) * 0.45, z - 15 * k / 4, x + dx, 6.05 - Math.sin((k + 1) / 4 * Math.PI) * 0.45, z - 15 * (k + 1) / 4); }
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(wires, 3)); scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x2a2a34 }))); }
  /* 버려진 수레: 리어카 셋 · 달구지 하나 — 실은 짐과 곁에 떨어진 짐 */
  const carts = [[30.4, 196], [50, 228], [49.8, 162], [30.6, 166]];
  carts.forEach(([x, z], i) => { SOLID.push([x - 0.9, z - 1.3, x + 0.9, z + 1.3]); const ox = i === 1, a = [0.18, Math.PI - 0.15, 2.95, -0.22][i], sc = ox ? 0.7 : 0.86, off = ox ? -0.62 : -0.42, bed = ox ? 0.58 : 0.5;
    const cx = x + Math.sin(a) * off, cz = z + Math.cos(a) * off, on = (nm, dx, dz, y, s, t) => put(nm, cx + dx * Math.cos(a) + dz * Math.sin(a), y, cz - dx * Math.sin(a) + dz * Math.cos(a), s, a + rv() * 0.6, t);
    put(ox ? 'cart' : 'handcart', cx, 0, cz, sc, a);
    on('bundle', -0.2, -0.45, bed, 0.9, { cloth: BAG[i] }); on('bundle', 0.24, 0.15, bed, 0.8, { cloth: BAG[(i + 2) % 5] }); if (i % 2) on('rf_quilt', 0, -0.1, bed + 0.5, 0.8, { cloth: 0xc84a5a }); else on('sack', 0, 0.5, bed + 0.05, 1.1);
    put('bundle', x + (i % 2 ? -0.6 : 0.6), 0, z + 1.0, 0.85, rv() * 6, { cloth: BAG[(i + 3) % 5] }); if (i !== 2) put('rf_suitcase', x - (i % 2 ? -0.5 : 0.5), 0, z - 1.05, 1, a + 1.2); });
  wallNote.position.set(26.88, 1.2, WALL[1]); wallNote.rotation.y = Math.PI / 2; wallNote.visible = false; scene.add(wallNote);
  one('rf_notes', 26.87, 0.1, WALL[1], 1.2, Math.PI / 2, {}, { shadow: false }); }

/* 3 강가 벌판과 강: 강물 · 언 강 · 끊어진 다리 아래 여울 · 나루 */
const iceM = new THREE.Mesh(new THREE.BoxGeometry(ICE[1] - ICE[0], 0.08, RIVER[1] - RIVER[0] + 0.6), new THREE.MeshStandardMaterial({ color: 0xd4e6f4, roughness: 0.3, metalness: 0.05, flatShading: true }));
const crackTex = canvasTex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.strokeStyle = 'rgba(30,50,80,.9)'; g.lineWidth = 2.4; for (let k = 0; k < 9; k++) { g.beginPath(); let x = 128, y = 128; g.moveTo(x, y); const a0 = k * 0.7; for (let s = 0; s < 7; s++) { x += Math.cos(a0 + Math.sin(s * 2.3 + k) * 0.6) * 18; y += Math.sin(a0 + Math.sin(s * 2.3 + k) * 0.6) * 18; g.lineTo(x, y); } g.stroke(); } });
const crackM = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, opacity: 0, depthWrite: false }));
const chunks = new THREE.Group();
const boat = new THREE.Group();
{ const water = new THREE.Mesh(new THREE.PlaneGeometry(1400, RIVER[1] - RIVER[0]), new THREE.MeshStandardMaterial({ color: 0x2a3e56, roughness: 0.25, metalness: 0.1 })); water.rotation.x = -Math.PI / 2; water.position.set(40, -0.05, (RIVER[0] + RIVER[1]) / 2); scene.add(water);
  const bank = []; for (let x = -100; x < 180; x += 6) { bank.push([x + 3, 0.12, RIVER[1] + 0.4, 6.2, 0.3, 1.2, 0, 0, 0xc8d2e0], [x + 3, 0.12, RIVER[0] - 0.4, 6.2, 0.3, 1.2, 0, 0, 0xc8d2e0]); }
  inst(B1, 0xffffff, bank, false);
  iceM.position.set((ICE[0] + ICE[1]) / 2, 0.0, (RIVER[0] + RIVER[1]) / 2); iceM.receiveShadow = true; scene.add(iceM);
  crackM.rotation.x = -Math.PI / 2; crackM.position.set(63, 0.07, 81); scene.add(crackM);
  { const fl = []; for (let k = 0; k < 9; k++) { const w = 2 + rnd() * 2, d = 1.6 + rnd() * 2, x = ICE[0] + 1.5 + rnd() * 10, z = RIVER[0] + 1.5 + rnd() * 15; fl.push([x, -0.07, z, [w / 2.2, 1, d / 1.74], rnd() * 3]); } chunks.add(artInst(scene, 'rf_floe', fl, {}, { shadow: false })); } chunks.visible = false; scene.add(chunks);
  /* 끊어진 다리(가운데 칸이 내려앉았다) · 아래 징검돌 */
  one('rf_bridge', 16, 0, 81);
  for (let z = 72.6; z < 90; z += 1.6) put('rock_flat', 16 + Math.sin(z) * 1.6, 0.07, z, [0.8, 0.45, 0.72], z);
  /* 나루: 양쪽 나루터 · 배 · 사공 */
  one('rf_dock', 40, 0, 92.6); one('rf_dock', 40, 0, 69.6, [1, 1, 0.8], Math.PI);
  { const bm = art('boat'); bm.rotation.y = Math.PI; bm.scale.set(1.15, 1, 1); bm.position.y = -0.28; boat.add(bm); } boat.position.set(40, 0, 87.6); scene.add(boat);
  const ferry = person({ shirt: 0x8a8070, pants: 0x5a5448, hat: 'satgat', mood: 'stern' }); ferry.position.set(-0.25, -0.04, 2.0); ferry.rotation.y = Math.PI; ferry.userData.armL.rotation.x = -0.7; ferry.userData.armR.rotation.x = -1.0; boat.add(ferry);
  put('sack', 41.7, 0.16, 94.4, 1, 0.3, null, false); put('bundle', 41.6, 0.16, 93.5, 0.8, 1, { cloth: BAG[1] }, false);
  /* 벌판: 앙상한 나무(눈 얹힌 것 · 맨 것) */
  let ti = 0; for (let i = 0; i < 26; i++) { const z = 98 + rnd() * 48, x = 12 + rnd() * 56; if (Math.abs(x - 40) < 6 || (z < 100 && x > 52)) continue; put(ti++ % 2 ? 'tree_bare' : 'tree_bare_snow', x, 0, z, 1.0 + rv() * 0.35, rv() * 6.28); SOLID.push([x - 0.3, z - 0.3, x + 0.3, z + 0.3]); if (rv() < 0.6) put('rf_drift', x + 0.3, 0, z + 0.2, [0.55, 0.8, 0.55], rv() * 6, null, false); }
  /* 강가: 마른 갈대와 돌(건너는 길 셋은 비운다) · 벌판의 낮은 눈 더미 · 판 밖 논의 볏가리와 나무 · 버려진 수레 */
  const lane = (x) => Math.abs(x - 16) < 5.6 || Math.abs(x - 40) < 4.2 || (x > 55 && x < 71);
  for (const [zb, s] of [[RIVER[1], 1], [RIVER[0], -1]]) for (let x = -14; x < 96; x += 4.1) { if (lane(x) || rv() < 0.3) continue; const n = rv() < 0.25 ? 2 : 1; for (let k = 0; k < n; k++) put('reed', x + rv() * 1.6, 0, zb + s * (rv() * 1.9 - 0.7), 0.85 + rv() * 0.5, rv() * 6.28, null, false); if (rv() < 0.3) put(rv() < 0.5 ? 'rock_a' : 'rock_flat', x + 1, 0.05, zb + s * (0.2 + rv()), 0.8 + rv() * 0.8, rv() * 6.28, null, false); }
  /* 강가의 살얼음(여울과 뱃길은 비운다) · 떠 있는 얼음 조각 · 물속 바위 */
  for (const [zb, s] of [[RIVER[1], -1], [RIVER[0], 1]]) for (let x = -46; x < 126; x += 3.3) { if (Math.abs(x - 16) < 4.8 || Math.abs(x - 40) < 2.8 || (x > ICE[0] - 0.4 && x < ICE[1] + 0.4)) continue; put('rf_floe', x + rv(), -0.115, zb + s * (0.8 + rv() * 1.4), [1.7 + rv() * 1.1, 0.7, 1.0 + rv() * 1.0], rv() * 6.28, null, false); if (rv() < 0.3) put('rf_floe', x + rv() * 2, -0.12, zb + s * (3.4 + rv() * 5), [0.6 + rv() * 0.9, 0.6, 0.6 + rv() * 0.7], rv() * 6.28, null, false); }
  for (const x of [ICE[0] - 1.1, ICE[1] + 1.2]) for (let z = RIVER[0] + 1.8; z < RIVER[1] - 1; z += 3.4) put('rf_floe', x + (rv() - 0.5) * 0.9, -0.115, z + rv(), [1.2 + rv() * 0.7, 0.7, 1.5 + rv() * 0.6], rv() * 6.28, null, false);
  for (let i = 0; i < 9; i++) { const x = rv() < 0.5 ? 21 + rv() * 14 : 44.5 + rv() * 10; put(i % 3 ? 'rock_b' : 'rock_big', x, -0.25, RIVER[0] + 2 + rv() * 14, i % 3 ? 0.7 + rv() * 0.5 : 0.45, rv() * 6.28, null, false); }
  for (let i = 0; i < 16; i++) { const z = 54 + rv() * 92, [a, b] = edgeAt(z), x = a + 2 + rv() * (b - a - 4); if ((z > 70 && z < 92) || Math.abs(x - mid(z)) < 3) continue; put('rf_drift', x, 0, z, [0.45 + rv() * 0.35, 0.85, 0.5 + rv() * 0.35], rv() * 6.28, null, false); }
  for (let i = 0; i < 26; i++) { const z = 52 + rv() * 98, s = i % 2 ? 1 : -1, x = edgeAt(z)[s < 0 ? 0 : 1] + s * (3 + rv() * 30); if (z > 68 && z < 94) continue; if (i % 3 === 0) put('rf_stack', x, 0, z, 0.9 + rv() * 0.4, rv() * 6.28, null, false); else put(i % 3 === 1 ? 'tree_bare' : 'tree_bare_snow', x, 0, z, 1.0 + rv() * 0.5, rv() * 6.28, null, false); }
  for (const [x, z, a] of [[72.6, 97.5, 0.7], [7.4, 103, -0.5]]) { put('handcart', x, 0, z, 0.86, a, null, false); put('bundle', x + 0.1, 0.5, z - 0.3, 0.9, 1, { cloth: BAG[0] }, false); put('bundle', x + 1.1, 0, z + 0.6, 0.8, 2, { cloth: BAG[2] }, false); put('rf_suitcase', x - 1.0, 0, z + 0.9, 1, a, null, false); } }

/* 4 천막촌: 천막 줄(맞배 천막 · 벽 선 천막 · 판잣집) · 길 밖으로 이어지는 천막들 · 천막 교실 · 우리 천막 */
const tentGlow = [], ourTent = new THREE.Group(), classTent = new THREE.Group();
{ const TK = { rf_tent: [0.98, 1.05, 0.92], rf_tent_b: [1.0, 1.02, 0.92], rf_shack: [1.1, 1.05, 0.97] }, TN = ['rf_tent', 'rf_tent_b', 'rf_tent', 'rf_shack']; let ti = 0;
  for (let z = 44; z > 2; z -= 6.5) for (const side of [-1, 1]) { const x = side < 0 ? 32.4 : 47.6; if (side < 0 && z < 36 && z > 22) continue; if (side > 0 && z < 14 && z > 4) continue; const nm = TN[(ti++ + Math.floor(rnd() * 3)) % 4]; put(nm, x, 0, z, TK[nm], side < 0 ? Math.PI / 2 : -Math.PI / 2); SOLID.push([x - 1.8, z - 2.2, x + 1.8, z + 2.2]); tentGlow.push([x - side * 1.9, 0.8, z]); }
  for (const [x, y, z] of tentGlow) { const g = glowSprite(scene, 'rgba(255,200,120,.5)', 'rgba(255,150,60,0)', 2.2); g.material.depthTest = true; g.position.set(x, y, z); }
  /* 길 밖의 천막들(못 가지만 보인다) — 줄 뒤로 세 겹, 길 끝 너머까지 · 사이사이 살림 */
  for (let z = 47; z > -30; z -= 6.2) for (const side of [-1, 1]) for (const off of [5.6, 11.6, 17.8]) { if (rv() < 0.16 || (off > 12 && rv() < 0.4)) continue; const far = off > 6, nm = far ? (rv() < 0.7 ? 'rf_tent_far' : 'rf_shack_far') : TN[Math.floor(rv() * 4)], x = (side < 0 ? 32.4 : 47.6) + side * (off + rv() * 1.2), zz = z + rv() * 2 - (far ? 3 : 0); if (zz > 44 && !far) continue;
      put(nm, x, 0, zz, far ? [1, 1 + rv() * 0.12, 0.95] : TK[nm], (side < 0 ? Math.PI / 2 : -Math.PI / 2) + (rv() - 0.5) * 0.5, null, false);
      const q = far ? 1 : rv(); if (q < 0.22) put('firewood', x - side * 2.6, 0, zz + 2.6, 1, rv() * 6, null, false); else if (q < 0.3) put('sack_pile', x - side * 2.5, 0, zz - 2.7, 0.8, rv() * 6, null, false); else if (q < 0.55) put('bundle', x - side * 2.4, 0, zz + 2.5, 0.9, rv() * 6, { cloth: BAG[Math.floor(rv() * 5)] }, false); else if (q < 0.7) put('jar_a', x - side * 2.5, 0, zz - 2.5, 0.8, 0, null, false); }
  for (const [x, z, a] of [[35.4, -12.5, 0.15], [44.8, -13.2, -0.2], [40.2, -19.5, 0], [30.5, -20, 0.3], [49.8, -21, -0.3]]) put(rv() < 0.6 ? 'rf_tent_far' : 'rf_shack_far', x, 0, z, 1, a, null, false);
  /* 천막 교실: 남쪽이 열린 큰 천막 — 안에 멍석 · 칠판 · 아이들 · 선생님 */
  classTent.add(art('rf_class')); classTent.position.set(33.8, 0, 29.5); scene.add(classTent); SOLID.push([31.2, 26.2, 36.4, 32.8]);
  const teacher = person({ shirt: 0x5a6a8a, pants: 0x3a3a48, hat: 'hair', hairC: 0x2b2118, style: 'coat' }); teacher.position.set(35.05, 0, 27.4); teacher.rotation.y = -0.25; teacher.userData.armR.rotation.x = -1.2;
  { const tg = art('rf_tent'); tg.rotation.y = -Math.PI / 2; tg.scale.set(1, 1.05, 0.84); ourTent.add(tg, at(art('rf_hearth'), -2.6, 0, 2.4)); } ourTent.position.set(47, 0, 10); scene.add(ourTent); SOLID.push([45.4, 7.8, 48.6, 12.2]);
  put('firewood', 45.0, 0, 7.4, 1, 0.4, null, false); put('sack', 45.3, 0, 12.7, 1.1, 1.2, null, false);
  const SIT = [{ hat: 'scarf' }, { hat: 'bun', chima: true, pants: 0x5a4a52 }, { hat: 'fedora' }, { hat: 'bun', chima: true, pants: 0x3a4a5a }, { hat: 'cap' }];
  const sit = [[38.6, 36.6], [41.6, 39.2], [41.2, 36.4], [38.4, 22.6], [41.7, 19.6]]; sit.forEach(([x, z], i) => { const p = person({ shirt: [0xd8d4c8, 0x6a6a72, 0x3a4660, 0x7a5a42, 0xc8c0b0][i], pants: 0x4a4a52, ...SIT[i] }); p.position.set(x, -0.35, z); p.scale.setScalar(0.9); p.lookAt(40, -0.35, z < 30 ? 21 : 38); p.userData.legL.rotation.x = p.userData.legR.rotation.x = -1.4; p.userData.armL.rotation.x = p.userData.armR.rotation.x = -1.1; });
  const kids = []; for (let k = 0; k < 4; k++) { const p = person({ shirt: [0xd8d4c8, 0x8a6a4a, 0x6a7a9a, 0xb8a888][k], pants: 0x4a4a52, hat: k % 2 ? 'braid' : undefined }); if (!(k % 2)) crop(p); p.scale.setScalar(0.62); p.position.set(32.6 + (k % 2) * 1.4, -0.2, 28 + Math.floor(k / 2) * 1.8); p.rotation.y = Math.PI; p.userData.legL.rotation.x = p.userData.legR.rotation.x = -1.4; kids.push(p); } }

/* 모닥불 — 돌 두른 장작 위에 불꽃 */
const fireFx = FIRES.map(([x, z], i) => { const g = new THREE.Group(); put('bonfire', x, 0, z, 1.05, i * 1.3); if (i % 2 === 0) put('firewood', x + (i % 4 ? 1.25 : -1.25), 0, z + 0.5, 0.8, i, null, false); const fl = []; for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.34 - k * 0.08, 0.9 - k * 0.15, 5), new THREE.MeshBasicMaterial({ color: [0xff5a2a, 0xffa23a, 0xffe07a][k] })); c.position.y = 0.5; g.add(c); fl.push(c); } g.position.set(x, 0, z); scene.add(g); const s = glowSprite(scene, 'rgba(255,190,110,.8)', 'rgba(255,140,50,0)', 5); s.material.depthTest = true; s.position.set(x, 1, z); const l = new THREE.PointLight(0xff9a4a, 6, 9, 1.6); l.position.set(x, 1.4, z); scene.add(l); SOLID.push([x - 0.7, z - 0.7, x + 0.7, z + 0.7]); return { g, fl, s, l, x, z }; });
flush();

/* 지평선의 천막촌 불빛 — 목표(언제나 보인다) */
const campGlow = []; for (let k = 0; k < 9; k++) { const s = glowSprite(scene, 'rgba(255,190,110,.9)', 'rgba(255,150,60,0)', 5 + rnd() * 3); s.position.set(31 + rnd() * 18, 2 + rnd() * 3, 3 + rnd() * 40); campGlow.push(s); }
const horizon = glowSprite(scene, 'rgba(255,190,110,.55)', 'rgba(255,140,60,0)', 70); horizon.position.set(40, 6, 4);
/* 뒤 선: 붉은 하늘 기운의 벽(아래가 짙다) */
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(700, 46), new THREE.MeshBasicMaterial({ map: canvasTex(8, 128, (g) => { const r = g.createLinearGradient(0, 0, 0, 128); r.addColorStop(0, 'rgba(255,90,40,0)'); r.addColorStop(0.55, 'rgba(255,100,40,.28)'); r.addColorStop(1, 'rgba(255,70,30,.75)'); g.fillStyle = r; g.fillRect(0, 0, 8, 128); }), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
backWall.position.set(40, 23, BACK0); scene.add(backWall);
const backGround = new THREE.Mesh(new THREE.PlaneGeometry(700, 400), new THREE.MeshBasicMaterial({ color: 0x5a1a10, transparent: true, opacity: 0.45, depthWrite: false })); backGround.rotation.x = -Math.PI / 2; scene.add(backGround);
/* 눈 */
const snowN = 700, snowG = new THREE.BufferGeometry(), snowP = new Float32Array(snowN * 3); for (let i = 0; i < snowN; i++) { snowP[i * 3] = (rnd() - 0.5) * 80; snowP[i * 3 + 1] = rnd() * 26; snowP[i * 3 + 2] = (rnd() - 0.5) * 80; }
snowG.setAttribute('position', new THREE.BufferAttribute(snowP, 3)); const snow = new THREE.Points(snowG, new THREE.PointsMaterial({ color: 0xffffff, size: 0.16, transparent: true, opacity: 0.85, depthWrite: false })); snow.frustumCulled = false; scene.add(snow);

/* ───── 사람: 나 · 식구 · 아이 · 인파 ───── */
const pMesh = person({ shirt: 0x3a4a6a, pants: 0x2a2a34, hat: 'cap' }); pMesh.scale.setScalar(0.86);
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.78, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const packG = new THREE.Group(); scene.add(packG); const PACK_H = { rice: 0.3, pot: 0.29, quilt: 0.29, album: 0.11, books: 0.24 };   /* 등에 쌓일 때 한 짐의 높이 */
const famLook = { bro: { shirt: 0x8a6a4a, pants: 0x3a3a44, s: 0.68 }, mom: { shirt: 0xd8d0c0, pants: 0x6a5a5a, hat: 'bun', chima: true, s: 0.95 }, gma: { shirt: 0xe8e2d4, pants: 0xb8b0a0, hat: 'bun', hairC: 0xc4c4c4, chima: true, s: 0.9 }, kid: { shirt: 0xc87a4a, pants: 0x4a3a3a, s: 0.6 } };
const ropeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
function makeMember(f) { const L = famLook[f.id], m = person({ shirt: L.shirt, pants: L.pants, hat: L.hat, hairC: L.hairC, chima: L.chima }); if (!L.hat) crop(m); m.scale.setScalar(L.s); if (f.id === 'mom') m.add(at(art('bundle', { cloth: 0x3a5a8a }), 0, 1.9, 0.02));   /* 어머니는 보따리를 머리에 인다 */ if (f.id === 'gma') m.rotation.order = 'YXZ'; const rope = new THREE.Mesh(B1, ropeMat.clone()); scene.add(rope); return { ...f, mesh: m, rope, state: 'with', s: 0, x: 0, z: 0, ox: 0, oz: 0, dir: 0, moving: false }; }
const fam = FAM0.map(makeMember);
const kid = makeMember({ id: 'kid', name: '아이', ic: '🧒', sp: 5.0 }); kid.state = 'wait';
/* 인파 — 모델 셋(몸 · 머리와 손 · 등짐 보따리) 한 묶음. 옷과 보따리 색은 사람마다 입힌다. 걸음마다 고치는 것은 예전과 같이 자리뿐. */
const CN = 110, crowd = [];
const cBody = new THREE.InstancedMesh(artGeo('rf_cbody'), artMat, CN), cHead = new THREE.InstancedMesh(artGeo('rf_chead'), artMat, CN), cPack = new THREE.InstancedMesh(artGeo('rf_cpack'), artMat, CN);
for (const m of [cBody, cHead, cPack]) { m.castShadow = true; m.frustumCulled = false; scene.add(m); } cPack.castShadow = false;   /* 보따리 그림자는 몸 그림자에 묻힌다 */
for (let i = 0; i < CN; i++) { crowd.push({ x: 0, z: 0, v: 1.5 + rnd() * 0.9, ph: rnd() * 6, lat: rnd() * 6, on: false }); cBody.setColorAt(i, colr.set([0xd8d4c8, 0x6a6a72, 0x3a4660, 0x7a5a42, 0xc8c0b0, 0x5a4a3a][i % 6])); cPack.setColorAt(i, colr.set([0x8a4a3a, 0x3a5a8a, 0xc8a050, 0x6a6a7a, 0xe8e0d0][i % 5])); }

/* ───── 상태 ───── */
const S = { mode: 'title', t: 0, px: START[0], pz: START[1], pdir: -Math.PI / 2, view: 0, yaw: 0, yawT: 0, camYaw: 0, zoom: 1, said: {}, sayT: 0,
  backZ: BACK0, pack: [], cold: 0, crack: 0, iceBroken: false, note: false, noteT: 0, child: false, cls: 0, clsT: 0, tries: 0, callT: 0, ps: 0, moving: false, running: false, workKey: null, workT: 0, boat: null, ended: false, endT: 0, shown: false, stepT: 0, rumbleT: 2, cryT: 0, introT: 0, maxGap: 0, lostN: 0, breaks: 0, maxCrack: 0 };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say, VIEWS_R), keys = ctl.keys;
const ground = YARD.map(([id, x, z]) => ({ id, x, z, on: true, mesh: null }));
const ITEM_ART = { rice: ['sack', 1.3, 0.4], pot: ['rf_pot', 0.85, 0], quilt: ['rf_quilt', 1, 0.3], album: ['rf_album', 1.25, -0.4], books: ['rf_books', 1.15, 0.5] };   /* 짐 모델: [이름, 크기, 돌림] */
const itemArt = (id, s = 1) => { const [nm, k, r] = ITEM_ART[id], g = art(nm, { cloth: ITEMS[id].c }); g.scale.setScalar(k * s); g.rotation.y = r; return g; };
const itemMesh = (id) => { const g = itemArt(id); scene.add(g); return g; };
for (const it of ground) { it.mesh = itemMesh(it.id); it.mesh.position.set(it.x, 0, it.z); }

/* 머리 위 그림 */
const tags = [];
function tag(html, x, y, z, show, cls = '') { const el = document.createElement('div'); el.className = 'tag ' + cls; el.innerHTML = html; $('tags').appendChild(el); const t = { el, x, y, z, show, range: 30 }; tags.push(t); return t; }
for (const it of ground) it.tag = tag(`${ITEMS[it.id].ic} ${ITEMS[it.id].name}<small>무게 ${ITEMS[it.id].w}</small>`, it.x, 1.4, it.z, () => it.on, '');
const kidTag = tag('😢 엄마…', KID[0], 1.8, KID[1], () => kid.state === 'wait', 'warn');
const wallTag = tag('📝 쪽지<small>스페이스로 붙이기</small>', WALL[0] - 0.6, 2.6, WALL[1], () => !S.note);
const dockTag = tag('⛵ 나룻배<small>삯 = 🌾 쌀 한 자루</small>', DOCK[0], 2.4, DOCK[1], () => !S.boat && S.pz > RIVER[1] - 2);
const iceTag = tag('❄ 언 강<small>뛰면 금이 간다</small>', 63, 1.6, 92, () => !S.iceBroken && S.pz > RIVER[1] - 2);
const fordTag = tag('🌉 끊어진 다리 아래<small>멀리 돌지만 안전</small>', 16, 4.6, 91, () => S.pz > RIVER[1] - 2);
const classTag = tag('🎒 천막 교실', CLASS[0] + 0.4, 3.6, CLASS[1], () => S.cls < 2);
const tentTag = tag('🏕 우리 천막', TENT[0] + 2.4, 3, TENT[1], () => S.pz < 50);
tags.forEach((t) => (t.range = 34)); dockTag.range = iceTag.range = fordTag.range = 70;
for (const f of [...fam, kid]) f.tag = tag(`❗ ${f.name}`, 0, 2.6, 0, () => f.state === 'lost', 'lost');

/* ───── 소리 ───── */
const SFX = { step: () => noise(0.06, 0.05, 1600), pick: () => { tone(520, 780, 0.12, 'triangle', 0.16); tone(780, 1040, 0.12, 'triangle', 0.12, 0.09); }, drop: () => tone(300, 160, 0.18, 'triangle', 0.16), call: () => { tone(620, 520, 0.22, 'sine', 0.18); tone(620, 500, 0.3, 'sine', 0.16, 0.26); }, rope: () => { noise(0.12, 0.25, 2400); tone(400, 120, 0.3, 'square', 0.08); }, rumble: (v) => { noise(1.2, v, 70); tone(48, 30, 1.1, 'sine', v * 0.8); }, cry: () => { tone(880, 760, 0.3, 'sine', 0.06); tone(820, 700, 0.35, 'sine', 0.05, 0.34); }, crack: () => { noise(0.08, 0.35, 3200); tone(1800, 600, 0.12, 'square', 0.05); }, breakIce: () => { noise(0.8, 0.45, 900); tone(200, 60, 0.6, 'sawtooth', 0.1); }, oar: () => noise(0.25, 0.08, 500), done: () => { tone(660, 990, 0.16, 'triangle', 0.18); tone(990, 1320, 0.2, 'triangle', 0.14, 0.12); }, bad: () => tone(220, 150, 0.3, 'square', 0.1), fire: () => noise(0.05, 0.05, 2600) };

/* ───── 발자국 줄(식구는 내가 걸은 길을 그대로 따라온다) ───── */
let trail = [];
function seedTrail(x, z, dx = 0, dz = 1) { trail = []; S.ps = 8; for (let k = 0; k <= 16; k++) { const s = k * 0.5; trail.push({ x: x + dx * (8 - s), z: z + dz * (8 - s), s }); } }
function trailAt(s) { if (s <= trail[0].s) return trail[0]; let lo = 0, hi = trail.length - 1; if (s >= trail[hi].s) return trail[hi]; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (trail[mid].s <= s) lo = mid; else hi = mid; } const a = trail[lo], b = trail[hi], t = (s - a.s) / (b.s - a.s || 1); return { x: lerp(a.x, b.x, t), z: lerp(a.z, b.z, t) }; }
function pushTrail() { const l = trail[trail.length - 1], d = dist(l.x, l.z, S.px, S.pz); if (d > 0.25) { S.ps = l.s + d; trail.push({ x: S.px, z: S.pz, s: S.ps }); let mn = S.ps; for (const f of chain()) mn = Math.min(mn, f.s); if (trail.length > 400 && trail[40].s < mn - 4) trail.splice(0, 40); } }
const chain = () => { const c = []; if (kid.state === 'with') c.push(kid); for (const f of fam) if (f.state === 'with') c.push(f); return c; };
/* 식구 다시 줄 세우기(부르기 · 다시 만남): 지금 자리에서 줄 자리로 미끄러지듯 */
function repack() { let prev = S.ps; for (const f of chain()) { const want = prev - 1.3, p = trailAt(want); f.ox = f.x - p.x; f.oz = f.z - p.z; f.s = want; prev = want; } }
function placeChainAt(x, z, dx, dz) { seedTrail(x, z, dx, dz); for (const f of chain()) { f.x = x; f.z = z; } repack(); }

/* ───── 화면 위 ───── */
function hud() {
  $('pack').innerHTML = S.pack.length ? S.pack.map((id, i) => `<span data-i="${i}" title="내려놓기">${ITEMS[id].ic}</span>`).join('') : '<span style="cursor:default;background:none">없음</span>';
  $('fam').innerHTML = '<span class="with">🧑</span>' + [...fam, ...(S.child || kid.state !== 'wait' ? [kid] : [])].map((f) => `<span class="${f.state === 'with' ? 'with' : f.state}">${f.state === 'class' ? '🎒' : f.state === 'gone' ? '✕' : f.ic}</span>`).join('');
  $('tKid').className = S.child ? 'on' : ''; $('tNote').className = S.note ? 'on' : ''; $('tClass').className = S.cls === 2 ? 'on' : '';
  $('tKid').textContent = S.child ? '🧒 아이를 데려간다' : '🧒 길 잃은 아이 데려가기'; $('tNote').textContent = S.note ? '📝 쪽지를 붙였다' : '📝 담벼락에 쪽지 붙이기'; $('tClass').textContent = S.cls === 2 ? '🎒 동생이 천막 교실에 앉았다' : '🎒 동생을 천막 교실로';
}
$('pack').addEventListener('pointerdown', (e) => { const i = e.target.dataset && e.target.dataset.i; if (i != null) { e.stopPropagation(); dropItem(+i); } });
const weight = () => S.pack.reduce((a, id) => a + ITEMS[id].w, 0);
function dropItem(i = S.pack.length - 1, silent) { if (S.mode !== 'play' || i < 0 || i >= S.pack.length) return null; const id = S.pack.splice(i, 1)[0], it = { id, x: S.px + 0.8, z: S.pz + 0.6, on: true, mesh: itemMesh(id) }; it.mesh.position.set(it.x, 0, it.z); it.tag = tag(`${ITEMS[id].ic} ${ITEMS[id].name}`, it.x, 1.3, it.z, () => it.on); ground.push(it); if (!silent) { SFX.drop(); say(`${ITEMS[id].name}을(를) 내려놓았다 — 몸이 가볍다`, null, 2); } hud(); return id; }

/* ───── 손: 부르기 · 쪽지 붙이기 ───── */
const atWall = () => !S.note && zoneAt(S.pz) === 'town' && dist(S.px, S.pz, WALL[0], WALL[1]) < 1.8;
function act() {
  if (S.mode !== 'play' || S.boat) return;
  if (atWall()) { if (S.noteT <= 0) { S.noteT = 0.001; say('쪽지를 붙인다 — 「우리는 남쪽으로 간다」', null, 2.6); } return; }
  if (S.callT > 0) return;
  S.callT = 1.1; SFX.call(); let back = 0;
  for (const f of [...fam, kid]) if (f.state === 'lost' && dist(f.x, f.z, S.px, S.pz) < 12) { f.state = 'with'; back++; }
  repack(); hud();
  say(back ? '불렀다 — 놓친 식구가 달려와 손을 잡는다' : '불렀다 — 식구가 곁으로 모인다', null, 2);
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) act(); if (e.code === 'KeyX' && !e.repeat) dropItem(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });

/* ───── 한 판 다시 · 처음부터 ───── */
function resetAll() {
  for (const it of ground) { it.on = false; if (it.mesh) it.mesh.visible = false; }
  ground.length = 0; for (const [id, x, z] of YARD) { const it = { id, x, z, on: true, mesh: itemMesh(id) }; it.mesh.position.set(x, 0, z); it.tag = tag(`${ITEMS[id].ic} ${ITEMS[id].name}<small>무게 ${ITEMS[id].w}</small>`, x, 1.4, z, () => it.on); ground.push(it); }
  Object.assign(S, { px: START[0], pz: START[1], pdir: -Math.PI / 2, backZ: BACK0, pack: [], cold: 0, crack: 0, iceBroken: false, note: false, noteT: 0, child: false, cls: 0, clsT: 0, tries: 0, callT: 0, boat: null, ended: false, endT: 0, shown: false, maxGap: 0, lostN: 0, breaks: 0, maxCrack: 0, yaw: 0, yawT: 0 });
  for (const f of fam) { f.state = 'with'; f.mesh.visible = true; } kid.state = 'wait'; kid.x = KID[0]; kid.z = KID[1];
  wallNote.visible = false; iceM.visible = true; chunks.visible = false; crackM.material.opacity = 0; boat.position.set(40, 0, 87.6);
  placeChainAt(S.px, S.pz, 0, 1); for (const f of chain()) { const p = trailAt(f.s); f.x = p.x; f.z = p.z; f.ox = f.oz = 0; }
  for (const c of crowd) c.on = false;
  hud();
}
function caught() {
  if (S.mode !== 'play') return; S.mode = 'over'; SFX.rumble(0.5); S.tries++;
  setTimeout(() => overlay(`<h1>길이 막혔다</h1><p>뒤쪽 붉은 하늘이 따라잡았다. 다른 길을 찾아야 한다.</p><p>강가에서 다시 걷는다 — 서두르다 <b>짐 하나</b>를 잃었다.</p>`, '강가에서 다시', () => {
    const lost = S.pack.length ? S.pack.pop() : null; S.backZ = 176; S.px = 40; S.pz = 142; S.cold = Math.min(S.cold, 0.3); S.crack = 0; S.callT = 0; S.noteT = 0;
    for (const f of [...fam, kid]) if (f.state === 'lost' && f.z > S.backZ - 1) { f.state = 'gone'; f.mesh.visible = false; }
    placeChainAt(S.px, S.pz, 0, 1); for (const f of chain()) { const p = trailAt(f.s); f.x = p.x; f.z = p.z; f.ox = f.oz = 0; }
    for (const c of crowd) c.on = false;
    hud(); S.mode = 'play'; say(lost ? `${ITEMS[lost].name}을(를) 잃었다 — 강을 건너야 한다` : '강가 — 강을 건너야 한다', null, 3); }), 600);
}

/* ───── 인파 ───── */
function stepCrowd(dt) {
  const active = S.pz < 252 && S.pz > 60 ? (zoneAt(S.pz) === 'town' || S.pz > 236 ? CN : 46) : 0;
  for (let i = 0; i < CN; i++) { const c = crowd[i];
    if (i >= active) { c.on = false; continue; }
    if (!c.on || c.z < Math.max(RIVER[1] + 1, S.pz - 42)) {
      let z = S.pz + 10 + rnd() * 34; if (S.pz > 238) z = 150 + rnd() * 88; if (z > 238) z = 160 + rnd() * 78; z = Math.min(z, S.backZ - 2); if (z < RIVER[1] + 2) { c.on = false; continue; }
      const [a, b] = edgeAt(z); c.x = a + 1 + rnd() * (b - a - 2); c.z = z; c.on = true; c.tx = [16, 40, 40, 40, 63][i % 5]; }
    const [a, b] = edgeAt(c.z); let vx = Math.sin(S.t * 0.4 + c.lat) * 0.35;
    if (c.z < 150) vx += clamp((c.tx - c.x) * 0.08, -0.8, 0.8);
    c.x = clamp(c.x + vx * dt, a + 0.6, b - 0.6); c.z -= c.v * dt; }
  let n = 0; for (let i = 0; i < CN; i++) { const c = crowd[i]; if (!c.on) continue; const bob = Math.abs(Math.sin(S.t * 6 + c.ph)) * 0.06;
    dmy.rotation.set(0, 0, 0); dmy.scale.set(1, 1, 1); dmy.position.set(c.x, 0.95 + bob, c.z); dmy.updateMatrix(); cBody.setMatrixAt(n, dmy.matrix); dmy.position.set(c.x, 1.8 + bob, c.z); dmy.updateMatrix(); cHead.setMatrixAt(n, dmy.matrix); dmy.position.set(c.x, 1.3 + bob, c.z + 0.42); dmy.updateMatrix(); cPack.setMatrixAt(n, dmy.matrix); n++; }
  for (const m of [cBody, cHead, cPack]) { m.count = n; m.instanceMatrix.needsUpdate = true; }
}
function crowdNear(x, z, r) { for (const c of crowd) if (c.on && Math.abs(c.x - x) < r && Math.abs(c.z - z) < r && dist(c.x, c.z, x, z) < r) return c; return null; }

/* ───── 움직임 막기: 판 가장자리 · 강 · 뒤 선 ───── */
function blocked(x, z) {
  const [a, b] = edgeAt(z); if (x < a + 0.5 || x > b - 0.5) return true;
  if (z > RIVER[0] && z < RIVER[1]) { if (x > FORD[0] && x < FORD[1]) return false; if (!S.iceBroken && x > ICE[0] && x < ICE[1]) return false; return true; }
  return false;
}
function moveP(nx, nz) {
  if (!blocked(nx, nz)) { [nx, nz] = collideRects(SOLID, nx, nz, 0.42); if (!blocked(nx, nz)) { S.px = nx; S.pz = nz; return; } }
  if (!blocked(nx, S.pz)) { const [x2] = collideRects(SOLID, nx, S.pz, 0.42); if (!blocked(x2, S.pz)) S.px = x2; }
  if (!blocked(S.px, nz)) { const [, z2] = collideRects(SOLID, S.px, nz, 0.42); if (!blocked(S.px, z2)) S.pz = z2; }
  if (blocked(S.px, S.pz)) { const [a, b] = edgeAt(S.pz); S.px = clamp(S.px, a + 0.55, b - 0.55); }
}

/* ───── 한 걸음 ───── */
function update(dt) {
  S.t += dt; sayTick(dt); BD.update(dt, cam);
  for (const f of fireFx) { f.fl.forEach((c, k) => { c.scale.y = 1 + Math.sin(S.t * 13 + k * 2 + f.x) * 0.2; }); f.s.material.opacity = 0.75 + Math.sin(S.t * 9 + f.z) * 0.15; f.l.intensity = 5.5 + Math.sin(S.t * 11 + f.x) * 1.2; }
  campGlow.forEach((g, i) => { const d = dist(g.position.x, g.position.z, S.px, S.pz); g.material.opacity = clamp((d - 30) / 110, 0.08, 0.7) + Math.sin(S.t * 2 + i) * 0.08; }); horizon.material.opacity = clamp((S.pz - 60) / 160, 0, 0.8);
  { const p = snowG.attributes.position.array, cx = S.px, cz = S.pz - 10; for (let i = 0; i < snowN; i++) { p[i * 3 + 1] -= dt * 2.2; p[i * 3] += Math.sin(S.t + i) * dt * 0.4; if (p[i * 3 + 1] < 0) p[i * 3 + 1] += 26; } snow.position.set(cx, 0, cz); snowG.attributes.position.needsUpdate = true; }
  if (S.mode === 'title' || S.mode === 'intro') { if (S.mode === 'intro') { S.introT += dt; if (S.introT > 3.8) { S.mode = 'play'; say('집 앞 짐 위에 서서 가져갈 것을 고르자 — 다 들 수는 없다', null, 3.4); } } placeAll(dt); return; }
  if (S.mode === 'evening') { S.endT += dt; placeAll(dt); stepEvening(dt); if (S.endT > 5.5 && !S.shown) { S.shown = true; endScreen(); } return; }
  if (S.mode !== 'play') { placeAll(dt); return; }

  /* 뒤 선 */
  const gap = S.backZ - S.pz, crossed = S.pz < RIVER[0];
  if (!crossed && S.backZ > RIVER[1] + 6) S.backZ -= (BACKV + Math.max(0, gap - 45) * 0.06) * dt;
  S.maxGap = Math.max(S.maxGap, gap);
  if (!S.boat && S.backZ - S.pz < 1.0) return caught();
  const close = crossed ? 0 : clamp(1 - (gap - 8) / 40, 0, 1);

  /* 나 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz), frozen = S.callT > 0 || S.noteT > 0 || !!S.boat;
  S.moving = il > 0.15 && !frozen; S.running = S.moving && ctl.running();
  const onIce = !S.iceBroken && S.pz > RIVER[0] && S.pz < RIVER[1] && S.px > ICE[0] && S.px < ICE[1], wading = S.pz > RIVER[0] && S.pz < RIVER[1] && S.px > FORD[0] && S.px < FORD[1];
  const w = weight(), loadF = 1 - 0.1 * w, coldF = S.cold > 0.55 ? lerp(1, 0.6, (S.cold - 0.55) / 0.45) : 1, push = crowdNear(S.px, S.pz, 0.8);
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 6.6 : 4.2) * loadF * coldF * (push ? 0.6 : 1) * (wading ? 0.45 : 1) * (back ? 0.6 : 1);
    const oz = S.pz; moveP(S.px + ix * sp * dt, S.pz + iz * sp * dt); S.pz = Math.min(S.pz, Math.max(oz, S.backZ - 1.2)); S.pz = Math.max(S.pz, 1.2);
    if (S.view !== 2) S.pdir = Math.atan2(iz, ix);
    S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.4; SFX.step(); } }
  if (push && !frozen) { const dx = S.px - push.x, dz = S.pz - push.z, l = Math.hypot(dx, dz) || 1; moveP(S.px + (dx / l) * 1.2 * dt, S.pz + (dz / l) * 0.4 * dt); }
  pushTrail();
  if (S.callT > 0) S.callT -= dt;

  /* 추위 */
  const nearFire = fireFx.some((f) => dist(f.x, f.z, S.px, S.pz) < 3.4);
  if (nearFire) { S.cold = Math.max(0, S.cold - dt * 0.3); if (S.cold > 0.05) say('모닥불 — 언 손을 녹인다. 그동안 뒤쪽이 다가온다', 'fire', 2.6); }
  else S.cold = Math.min(1, S.cold + dt * ((zoneAt(S.pz) === 'river' ? 1 / 95 : 1 / 135) + (wading ? 0.05 : 0)));
  if (S.cold > 0.5) say('손발이 언다 — 걸음이 굳는다. 모닥불 곁에서 잠깐 녹이자', 'cold', 3);

  /* 식구 따라오기 */
  let prev = S.ps, lead = null;
  for (const f of chain()) {
    const crowded = zoneAt(f.z) !== 'pass' && crowdNear(f.x, f.z, 0.95), want = prev - 1.3, spd = S.callT > 0 ? 14 : f.sp * coldF * (crowded ? 0.3 : 1);
    if (f.s < want) f.s = Math.min(want, f.s + spd * dt);
    const p = trailAt(f.s); f.ox *= Math.exp(-dt * 4); f.oz *= Math.exp(-dt * 4);
    const nx = p.x + f.ox, nz = p.z + f.oz; f.moving = dist(nx, nz, f.x, f.z) > 0.01; if (f.moving) f.dir = Math.atan2(nz - f.z, nx - f.x); f.x = nx; f.z = nz;
    if (f.z > S.backZ - 0.8) { f.s = Math.min(want, f.s + 3 * dt); }
    if (prev - f.s > 6.8 && !S.boat && S.callT <= 0) { breakAt(f); break; }
    prev = f.s; lead = f; }
  for (const f of [...fam, kid]) if (f.state === 'lost' && f.z > S.backZ - 0.5) { f.state = 'gone'; f.mesh.visible = false; SFX.bad(); say(`${f.name}… 뒤쪽 불빛 너머로 보이지 않게 되었다`, null, 3.2); hud(); }
  for (const f of [...fam, kid]) if (f.state === 'lost' && dist(f.x, f.z, S.px, S.pz) < 1.7) { f.state = 'with'; SFX.pick(); repack(); hud(); say(`${f.name} 손을 다시 잡았다`, null, 2); }

  /* 가만히 서서: 짐 집기 · 아이 · 나룻배 · 교실 · 우리 천막 */
  let job = null, need = 1, arg = null;
  for (const it of ground) if (!job && it.on && dist(S.px, S.pz, it.x, it.z) < 1.0) { job = 'pick'; need = 0.5; arg = it; }
  if (!job && kid.state === 'wait' && dist(S.px, S.pz, KID[0], KID[1]) < 1.7) { job = 'kid'; need = 0.8; }
  if (!job && !S.boat && dist(S.px, S.pz, DOCK[0], DOCK[1]) < 1.9) { job = 'dock'; need = 0.8; }
  const bro = fam[0];
  if (!job && S.cls === 0 && bro.state === 'with' && dist(S.px, S.pz, CLASS[0], CLASS[1]) < 1.9) { job = 'class'; need = S.pack.includes('books') ? 0.6 : 2.6; }
  if (!job && S.pz < 30 && dist(S.px, S.pz, TENT[0], TENT[1]) < 1.9) { job = 'tent'; need = 1.2; }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  if (job === 'class' && !S.pack.includes('books')) say('선생님이 석판을 찾아 준다 — 잠깐 기다리자', 'slate', 2.4);
  overBar($('work'), cam, S.px, 2.5, S.pz, job && S.workT > 0.05 ? S.workT / need : S.noteT > 0 ? S.noteT / 2.5 : null);
  if (job && S.workT >= need) { S.workT = 0; S.workKey = null;
    if (job === 'pick') { const it = arg, wt = ITEMS[it.id].w; if (w + wt > CAP) { SFX.bad(); say(`더는 못 든다(${w}/${CAP}) — 짐 그림을 누르거나 X 로 하나 내려놓자`, null, 2.8); S.workT = -1.2; } else { it.on = false; it.mesh.visible = false; S.pack.push(it.id); SFX.pick(); say(`${ITEMS[it.id].ic} ${ITEMS[it.id].name}을(를) 졌다 — 짐 ${w + wt}/${CAP}${w + wt >= 3 ? ' · 무겁다, 걸음이 느려진다' : ''}`, null, 2.4); hud(); } }
    if (job === 'kid') { const d = S.pack.length ? dropItem(S.pack.length - 1, true) : null; kid.state = 'with'; S.child = true; kid.x = KID[0]; kid.z = KID[1]; repack(); SFX.done(); say(d ? `${ITEMS[d].name}을(를) 내려놓고 아이 손을 잡았다 — 줄이 다섯이 되었다` : '아이 손을 잡았다 — 줄이 다섯이 되었다', null, 3); hud(); }
    if (job === 'dock') { if (S.pack.includes('rice')) { S.pack.splice(S.pack.indexOf('rice'), 1); S.boat = { t: 0, who: chain() }; SFX.done(); say('쌀 한 자루를 삯으로 냈다 — 배가 강을 건넌다', null, 2.6); hud(); } else { SFX.bad(); say('사공이 고개를 젓는다 — 삯(쌀)이 없으면 못 탄다. 언 강이나 끊어진 다리 아래로', null, 3.2); S.workT = -2; } }
    if (job === 'class') { bro.state = 'class'; S.cls = 2; SFX.done(); say(S.pack.includes('books') ? '책보를 펴고 바로 앉았다 — 천막 교실에서 공부가 시작된다' : '석판을 받아 앉았다 — 천막 교실에서 공부가 시작된다', null, 3); hud(); }
    if (job === 'tent') return evening(); }
  /* 쪽지 붙이기 */
  if (S.noteT > 0) { if (il > 0.3) { S.noteT = 0; say('쪽지를 다 못 붙였다', null, 1.4); } else { S.noteT += dt; if (S.noteT >= 2.5) { S.noteT = 0; S.note = true; wallNote.visible = true; SFX.done(); say('「우리는 남쪽으로 간다」 — 아버지가 이 길을 지나면 볼 것이다', null, 3.2); hud(); } } }
  if (atWall()) say('담벼락 — 스페이스로 쪽지를 붙이자(붙이는 동안 뒤쪽이 다가온다)', 'wall', 3);
  $('bAct').textContent = atWall() ? '붙이기' : '부르기';

  /* 강 */
  if (S.boat) stepBoat(dt);
  if (onIce) { const add = S.running ? 0.75 : 0.012 + 0.03 * w; S.crack = Math.min(1, S.crack + dt * (add + chain().filter((f) => f.z > RIVER[0] && f.z < RIVER[1]).length * 0.008)); say('언 강 — 뛰지 말고 천천히', 'ice', 2.4); if (S.running) say('얼음에 금이 간다! 걸어야 한다', 'icerun', 2.4); }
  else S.crack = Math.max(0, S.crack - dt * 0.04);
  S.maxCrack = Math.max(S.maxCrack, S.crack);
  if (Math.floor(S.crack * 5) > Math.floor((S.crackPrev || 0) * 5)) SFX.crack(); S.crackPrev = S.crack;
  crackM.material.opacity = S.crack; crackM.position.set(clamp(S.px, ICE[0] + 3, ICE[1] - 3), 0.07, clamp(S.pz, RIVER[0] + 3, RIVER[1] - 3)); crackM.scale.setScalar(0.6 + S.crack);
  if (S.crack >= 1 && !S.iceBroken) breakIce();
  if (S.pz < 140 && S.pz > RIVER[1]) say('강 — 나룻배(쌀이 삯) · 언 강(걸어서) · 끊어진 다리 아래(멀리)', 'river', 3.4);
  if (wading) say('여울 — 물이 차다. 천천히 건넌다', 'ford', 2.4);
  if (S.pz < 50) say('천막촌 — 우리 천막을 찾자. 동생은 천막 교실로', 'camp', 3);
  if (zoneAt(S.pz) === 'town') say('사람이 많다 — 식구가 처지면 스페이스로 부르자', 'town', 3);
  if (kid.state === 'wait' && dist(S.px, S.pz, KID[0], KID[1]) < 22) { S.cryT -= dt; if (S.cryT <= 0) { S.cryT = 2.6; SFX.cry(); } if (dist(S.px, S.pz, KID[0], KID[1]) < 9) say('혼자 우는 아이 — 데려가려면 짐 하나를 내려놓아야 한다', 'kid', 3); }

  stepCrowd(dt);
  /* 조임: 뒤쪽 하늘 · 소리 · 그림자 · 서리 */
  S.rumbleT -= dt; if (!crossed && S.rumbleT <= 0) { S.rumbleT = lerp(5, 1.3, close) + rnd(); SFX.rumble(0.08 + close * 0.3); }
  BD.paintSky(0.35 + close * 0.65);
  $('gap').querySelector('i').style.width = (crossed ? 100 : clamp((gap - 1) / 60, 0, 1) * 100) + '%';
  $('redge').style.opacity = close * close; $('frost').style.opacity = S.cold * 0.9; $('hCold').querySelector('i').style.width = S.cold * 100 + '%';
  $('vig').style.boxShadow = `inset 0 0 ${120 + close * 120}px ${30 + close * 60}px rgba(200,40,20,${close > 0.6 ? (close - 0.6) * 1.2 : 0})`;
  placeAll(dt);
}
function breakAt(f) { const c = chain(), i = c.indexOf(f); for (let k = i; k < c.length; k++) { c[k].state = 'lost'; c[k].ox = c[k].oz = 0; } S.breaks++; SFX.rope(); say(`${f.name} 손을 놓쳤다! — 돌아가 손을 잡거나 스페이스로 부르자`, null, 3); hud(); }
function breakIce() { S.iceBroken = true; SFX.breakIce(); iceM.visible = false; chunks.visible = true; crackM.material.opacity = 0; S.px = clamp(S.px, ICE[0] + 1, ICE[1] - 1); S.pz = RIVER[1] + 1.4; S.cold = Math.min(1, S.cold + 0.4); placeChainAt(S.px, S.pz, 0, 1); for (const f of [...fam, kid]) if (f.state === 'lost' && f.z < RIVER[1] && f.z > RIVER[0]) { f.z = RIVER[1] + 2; f.x = S.px + 1; } say('얼음이 갈라졌다 — 물에 젖은 채 뭍으로 물러났다. 이 길은 끝났다', null, 3.4); }
function stepBoat(dt) { const b = S.boat; b.t += dt; const k = clamp((b.t - 0.6) / 3.6, 0, 1), e = k * k * (3 - 2 * k), bz = lerp(RIVER[1] - 2.4, RIVER[0] + 2.4, e); boat.position.z = bz; if (Math.floor(b.t * 1.4) !== Math.floor((b.t - dt) * 1.4)) SFX.oar();
  S.px = 40 - 0.5; S.pz = bz - 1.2; b.who.forEach((f, i) => { f.x = 40 + (i % 2 ? 0.6 : -0.6); f.z = bz + 0.2 + Math.floor(i / 2) * 1.0; f.ox = f.oz = 0; });
  if (b.t > 4.6) { S.boat = null; S.px = DOCK_S[0]; S.pz = DOCK_S[1]; const who = b.who; placeChainAt(S.px, S.pz, 0, 1); for (const f of who) { const p = trailAt(f.s); f.ox = (40 + 0.5) - p.x; f.oz = (bz + 1) - p.z; } say('건넜다 — 천막촌 불빛이 가깝다', null, 2.4); } }

/* ───── 저녁(끝) ───── */
const evSmoke = []; { const tex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(200,200,210,.8)'); r.addColorStop(1, 'rgba(200,200,210,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }); for (let k = 0; k < 8; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); s.visible = false; s.userData.k = k / 8; scene.add(s); evSmoke.push(s); } }
const quiltGlow = glowSprite(scene, 'rgba(255,210,140,.95)', 'rgba(255,150,60,0)', 6); quiltGlow.visible = false; quiltGlow.position.set(47, 1, 10);
const potFire = glowSprite(scene, 'rgba(255,170,90,.9)', 'rgba(255,120,40,0)', 3); potFire.visible = false; potFire.position.set(44.4, 0.5, 12.4);
const potMesh = art('rf_pot'); potMesh.position.set(44.4, 0.16, 12.4); potMesh.scale.setScalar(0.9); potMesh.visible = false; scene.add(potMesh);
const seats = [[43.2, 12.2], [45.4, 13.6], [42.6, 10.6], [44.8, 14.6], [46.6, 13]];
const emptyMat = []; for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.9), new THREE.MeshStandardMaterial({ color: 0x8a6a4a, transparent: true, opacity: 0.6 })); m.visible = false; scene.add(m); emptyMat.push(m); }
function evening() {
  S.mode = 'evening'; S.endT = 0; SFX.done(); S.ended = true;
  const pot = S.pack.includes('pot'), quilt = S.pack.includes('quilt');
  evSmoke.forEach((s) => (s.visible = pot)); potFire.visible = potMesh.visible = pot; quiltGlow.visible = quilt;
  S.px = seats[0][0]; S.pz = seats[0][1]; S.pdir = -Math.PI / 4; let k = 1, e = 0;
  for (const f of [...fam, kid]) { if (f === kid && !S.child) continue; if (f.state === 'with' || f.state === 'class') { const [x, z] = seats[k++]; f.state = f.state === 'class' ? 'class' : 'with'; f.x = x; f.z = z; f.ox = f.oz = 0; f.mesh.visible = true; f.seated = true; } else if (f !== kid) { const [x, z] = seats[k++] || [46, 15]; emptyMat[e].position.set(x, 0.03, z); emptyMat[e].visible = true; e++; } }
  say('천막촌에 저녁이 내린다', null, 3);
}
function stepEvening(dt) { const k = clamp(S.endT / 3, 0, 1); hemi.intensity = lerp(1.15, 0.7, k); sun.intensity = lerp(1.1, 0.25, k); BD.paintSky(0.25); evSmoke.forEach((s) => { const q = (s.userData.k + S.t * 0.12) % 1; s.position.set(44.4 + q * 1.6, 1 + q * 9, 12.4 - q); s.scale.setScalar(0.8 + q * 3); s.material.opacity = 0.8 * (1 - q); }); quiltGlow.material.opacity = 0.8 + Math.sin(S.t * 3) * 0.1; }
function endScreen() {
  const all = [...fam], home = all.filter((f) => f.state === 'with' || f.state === 'class').length, missing = all.filter((f) => !(f.state === 'with' || f.state === 'class')).map((f) => f.name);
  const pot = S.pack.includes('pot'), quilt = S.pack.includes('quilt');
  const story = `천막촌에 저녁이 내린다. ${pot ? '가져온 솥에서 밥 짓는 연기가 오른다.' : '솥이 없어 이웃 모닥불에 언 손을 녹인다.'} ${quilt ? '이불을 편 천막 안에 불빛이 번진다.' : ''} ${missing.length ? `${missing.join(', ')}의 자리는 비어 있다.` : '식구가 다 모였다.'}`;
  const marks = `<div class="marks"><span class="${home === 3 ? 'ok' : ''}">👨‍👩‍👧 함께 온 식구 ${home + 1}/4</span><span class="${S.child ? 'ok' : ''}">🧒 ${S.child ? '데려온 아이' : '아이를 못 데려옴'}</span><span class="${S.note ? 'ok' : ''}">📝 ${S.note ? '쪽지를 남김' : '쪽지 없음'}</span><span class="${S.cls === 2 ? 'ok' : ''}">🎒 ${S.cls === 2 ? '천막 교실' : '교실 못 감'}</span></div>`;
  overlay(`<h1>천막촌의 저녁</h1><p>${story}</p>${marks}<p class="keys">많은 사람이 이 길을 걸었고, 지금도 서로를 찾는 사람들이 있다.</p>
    <div class="fact">📜 <b>6·25 전쟁</b> — 1950년에 전쟁이 일어나 수많은 사람이 집을 떠나 남쪽으로 피란했다.<br>📜 <b>헤어진 식구</b> — 피란길에 흩어져 다시 만나지 못한 식구가 아주 많았다.<br>📜 <b>천막 교실</b> — 피란 간 곳에서도 천막을 치고 학교를 열어 아이들을 가르쳤다.<br>📜 <b>멈춘 전쟁</b> — 1953년에 싸움을 멈추기로 했고, 그때 그은 선이 지금도 남아 있다.</div>`,
    '한 번 더', () => { evSmoke.forEach((s) => (s.visible = false)); potFire.visible = potMesh.visible = quiltGlow.visible = false; emptyMat.forEach((m) => (m.visible = false)); for (const f of [...fam, kid]) f.seated = false; hemi.intensity = 1.15; sun.intensity = 1.1; resetAll(); misClear(); S.mode = 'play'; });
}

/* ───── 그리기 ───── */
const ropeV = new THREE.Vector3();
function placeAll(dt) {
  pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving);
  pRing.position.set(S.px, 0.06, S.pz); pRing.visible = S.mode === 'play';
  /* 등짐: 진 것만큼 쌓인다 */
  const pk = S.pack.join(); if (pk !== packG.userData.k) { packG.userData.k = pk; while (packG.children.length) packG.remove(packG.children[0]);
    let y = 0.78; for (const id of S.pack) { const h = PACK_H[id]; packG.add(at(itemArt(id, 0.62), 0, y, -0.34)); y += h; } }
  packG.position.set(S.px, 0, S.pz); packG.rotation.y = -S.pdir + Math.PI / 2;
  let prevX = S.px, prevZ = S.pz, prevS = S.ps;
  for (const f of [...fam, kid]) {
    if (f.state === 'gone') { f.mesh.visible = false; f.rope.visible = false; continue; }
    if (f.state === 'class') { f.mesh.visible = !S.seated || f.seated; if (!f.seated) { f.mesh.position.set(33.4, -0.2, 31.4); f.mesh.rotation.y = Math.PI; f.mesh.userData.legL.rotation.x = f.mesh.userData.legR.rotation.x = -1.4; } else { f.mesh.position.set(f.x, -0.25, f.z); f.mesh.lookAt(44.4, -0.25, 12.4); } f.rope.visible = false; continue; }
    if (f === kid && kid.state === 'wait') { f.mesh.position.set(KID[0], 0, KID[1]); f.mesh.rotation.y = Math.PI / 2 + Math.sin(S.t * 2) * 0.2; f.mesh.userData.armL.rotation.x = f.mesh.userData.armR.rotation.x = -2.2; f.rope.visible = false; continue; }
    f.mesh.visible = true;
    if (f.seated) { f.mesh.position.set(f.x, -0.25, f.z); f.mesh.lookAt(44.4, -0.25, 12.4); f.mesh.userData.legL.rotation.x = f.mesh.userData.legR.rotation.x = -1.4; f.rope.visible = false; continue; }
    f.mesh.position.set(f.x, 0, f.z); f.mesh.rotation.y = -f.dir + Math.PI / 2; walkAnim(f.mesh, S.t * 10 + f.sp, f.moving);
    if (f.state === 'lost') { f.mesh.userData.armR.rotation.x = -2.6 + Math.sin(S.t * 8) * 0.3; f.rope.visible = false; f.tag.x = f.x; f.tag.z = f.z; continue; }
    f.mesh.userData.armR.rotation.x = -0.9;
    /* 머리 위 끈: 줄이 길어지면 가늘어지고 붉어진다 */
    const d = Math.max(0.1, dist(prevX, prevZ, f.x, f.z)), str = clamp((prevS - f.s - 1.3) / 5.5, 0, 1), th = lerp(0.1, 0.018, str);
    f.rope.visible = S.mode === 'play'; f.rope.position.set((prevX + f.x) / 2, 1.95, (prevZ + f.z) / 2); f.rope.scale.set(th, th, d); f.rope.lookAt(ropeV.set(f.x, 1.95, f.z)); f.rope.material.color.setRGB(1, 1 - str * 0.7, 1 - str * 0.8);
    prevX = f.x; prevZ = f.z; prevS = f.s; }
  /* 뒤 선 */
  backWall.position.z = S.backZ; backWall.material.opacity = cam.position.z > S.backZ ? 0.18 : 1; backGround.position.set(40, 0.04, S.backZ + 200);
  const close = S.mode === 'play' && S.pz > RIVER[0] ? clamp(1 - (S.backZ - S.pz - 8) / 40, 0, 1) : 0;
  sun.position.set(S.px - 10, lerp(22, 7, close), S.pz + 30); sun.target.position.set(S.px, 0, S.pz - 6); sun.color.setHSL(0.04, 0.9, lerp(0.7, 0.6, close));
  horizon.scale.setScalar(lerp(110, 40, clamp(S.pz / 320, 0, 1)));
}
const v3 = new THREE.Vector3(), goalV = new THREE.Vector3(), ZSPAN = { pass: [236, 364], town: [150, 240], river: [50, 150], camp: [-30, 50] };   /* 구간의 z 범위 */
function view() {
  scene.fog.far = S.view === 3 && S.mode === 'play' ? 900 : 260;
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k); cam.position.set(lerp(41, 41, e), lerp(30, 11, e), lerp(354, START[1] + 24, e)); cam.lookAt(lerp(40, 41, e), lerp(3, 4, e), lerp(0, START[1] - 11, e)); if (cam.fov !== 45) { cam.fov = 45; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'evening') { cam.position.lerp(v3.set(39, 6.5, 24), 0.04); cam.lookAt(45, 1.2, 11); }
  else followCam(cam, S, { W, H, clampX: [-200, 280], clampZ: [-40, 400], farH: [10, 13], farBk: [26, 29], farFov: 45, lookY: 4, aheadFar: 6, map: { h: [250, 330], z: 0, look: 0, fov: 70 } });
  /* 목표: 천막촌 불빛(천막촌 안에서는 우리 천막 · 교실) */
  if (S.pz < 50) goalV.set(S.cls === 0 && fam[0].state === 'with' ? CLASS[0] : TENT[0], 1.5, S.cls === 0 && fam[0].state === 'with' ? CLASS[1] : TENT[1]); else goalV.set(40, 3, 10);
  edgeGoal($('goal'), cam, goalV.clone(), S.mode === 'play', 0.82);
  BD.ridges.forEach((r) => (r.visible = S.view !== 3)); pRing.scale.setScalar(S.view === 3 ? 7 : 1);
  for (const k in ZONE) { const far = !(S.view === 3 && S.mode === 'play') && (cam.position.z - ZSPAN[k][1] > 275 || ZSPAN[k][0] - cam.position.z > 275); for (const m of ZONE[k]) m.visible = !far; }   /* 안개 끝(260)보다 먼 구간은 어차피 안 보인다 — 그리지 않는다. 지도 시점은 다 그린다. */
  for (const t of tags) { const vis = S.mode === 'play' && S.view !== 3 && t.show() && dist(t.x, t.z, S.px, S.pz) < t.range; if (!vis) { t.el.style.display = 'none'; continue; } const q = v3.set(t.x, t.y, t.z).project(cam); if (q.z > 1 || Math.abs(q.x) > 1.1 || Math.abs(q.y) > 1.1) { t.el.style.display = 'none'; continue; } t.el.style.display = 'block'; t.el.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; t.el.style.top = clamp(((1 - q.y) / 2) * innerHeight, 120, innerHeight - 20) + 'px'; }
}

/* ───── 미션(11-18 준호 「어떻게 뭘 하는지 · 미션이 있으면」): 지금 할 일 하나 — 무엇을·어떻게·어디서.
   짐·나루·언 강·여울·천막에는 장면의 꼬리표가 이미 있으니 빛기둥은 모닥불 미션에만. 흔적 할 일(아이·쪽지·교실)은 미션에 넣지 않는다.
   미션은 S 를 읽기만 하고, 「한 번이라도 했다」는 아래 작은 변수로 지켜본다(misWatch 는 돌림 고리에서만 — 시험용 update 와 놀이 숫자는 그대로) ───── */
let mis = null, misPicked = false, misCalled = false, misFireT = 0;
const CALLK = (tc) => (tc ? '「부르기」' : '<kbd>스페이스</kbd>');
const fireAhead = () => { let b = null, bd = 1e9; for (const f of fireFx) { if (f.z > S.pz + 4) continue; const d = dist(f.x, f.z, S.px, S.pz); if (d < bd) { bd = d; b = f; } } return b; };   /* 가장 가까운, 아직 지나지 않은 모닥불 */
mis = missions(scene, cam, [
  { t: '가져갈 짐 지기', how: `집 앞 짐 위에 가만히 서면 등에 진다 — 무게 ${CAP}까지 · 무거울수록 걸음이 느리다`, done: () => misPicked || S.pz < 296 },   /* 아무것도 안 지고 떠나도 고른 셈(집 앞은 다시 못 간다) */
  { t: '식구 불러 모으기', how: (tc) => `${CALLK(tc)}를 누르면 식구가 곁으로 모인다 — 머리 위 끈이 붉어지거나 식구를 놓쳤을 때`, done: () => misCalled },
  { t: '모닥불에 손 녹이기', how: '❄ 막대가 차면 걸음이 굳는다 — 모닥불 곁에 가만히 서서 녹이기(그동안 뒤쪽이 다가온다)', done: () => misFireT >= 1,
    at: () => { const f = fireAhead(); return f ? [f.x, f.z] : null; }, tag: '🔥 곁에 가만히 서서 손 녹이기', tagY: 2.2 },
  { t: '식구와 함께 읍내 빠져나가기', how: (tc) => `사람 사이에서 식구가 처지면 ${CALLK(tc)} · 놓친 식구는 돌아가 곁에 서면 손을 잡는다`, done: () => S.pz < 150 },
  { t: '강 건너기', how: '셋 중 하나로 — 나룻배(🌾 쌀을 지고 나루에 서기) · 언 강(뛰지 말고 걷기) · 다리 아래 여울(멀리)', done: () => S.pz < RIVER[0] },
  { t: '식구와 함께 우리 천막까지', how: '천막촌의 「🏕 우리 천막」 앞에 가만히 서기 — 놓친 식구가 있으면 먼저 부르기', done: () => S.mode === 'evening' },
], { allText: '🎉 천막촌에 닿았다!' });
function misWatch(dt) { if (S.mode !== 'play') return;
  if (S.pack.length) misPicked = true;
  if (S.callT > 0) misCalled = true;
  if (mis.idx >= 2 && !S.moving && fireFx.some((f) => dist(f.x, f.z, S.px, S.pz) < 3.4)) misFireT += dt; }   /* 모닥불 미션에 온 뒤, 곁에 멈춰 선 시간 */
function misClear() { mis.reset(); misPicked = misCalled = false; misFireT = 0; }
/* 처음 부를 때 · 끈이 붉어질 때: 처진 식구 머리 위에 「스페이스 = 부르기」(보이기만 한다 — 위치는 view 의 꼬리표 고리가 그린다) */
const callTag = tag(`📣 ${ctl.isTouch ? '「부르기」' : '스페이스'}<small>식구를 불러 모은다</small>`, 0, 3.4, 0, () => {
  if (!mis || S.boat || mis.idx > 3) return false; const ch = chain(); if (!ch.length) return false;
  let worst = 0, prev = S.ps, who = ch[ch.length - 1]; for (const f of ch) { if (prev - f.s > worst) { worst = prev - f.s; who = f; } prev = f.s; }
  if (mis.idx !== 1 && worst < 4.2) return false; if (mis.idx === 1) who = ch[ch.length - 1]; callTag.x = who.x; callTag.z = who.z; if (callTag.el.nextSibling) callTag.el.parentNode.appendChild(callTag.el); return true; });   /* 짐 꼬리표에 가리지 않게 맨 앞으로 */

resetAll(); placeAll(0);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; };
runLoop((dt) => { update(dt); misWatch(dt); mis.update(dt, S.mode === 'play' || (S.mode === 'evening' && S.endT < 2.4)); }, view, () => renderer.render(scene, cam));
window.__scene = { S, fam, kid, crowd, update, keys, ctl, act, dropItem, trail: () => trail, chain,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; placeChainAt(x, z, 0, 1); }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { let stuck = 0; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz), ox = S.px, oz = S.pz; ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - ox, S.pz - oz) < 0.003 && S.callT <= 0 && !S.boat && S.noteT <= 0) { if (++stuck > 45) break; } else stuck = 0; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode, gap: +(S.backZ - S.pz).toFixed(1) }; },
  const: { START, YARD, KID, WALL, CLASS, TENT, DOCK, DOCK_S, FORD, ICE, RIVER, FIRES, CAP, edgeAt } };
