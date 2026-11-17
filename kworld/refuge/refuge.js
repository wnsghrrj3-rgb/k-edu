/* 케이월드 · 피란길 — 대한민국 한 장면(S10 v2, 2026-11-17). 공통 부품 = ../scene/kit.js.
   판 모양이 다른 첫 장면: 네모 판이 아니라 한쪽(-z)으로만 가는 긴 띠(약 320). 뒤에서 「뒤 선」(S.backZ)이 따라 올라와 되돌아가지 못한다.
   구간 넷 — 고갯길(z 320→240, 폭 10 · 짐과 걸음) · 읍내(240→150, 폭 26 · 인파) · 강가 벌판과 강(150→50, 폭 60 · 건너는 길 셋) · 천막촌(50→0, 폭 20 · 마무리).
   목표 = 지평선의 천막촌 불빛(첫 화면부터 보이고 걸을수록 커진다). 식구 넷(나 · 동생 · 어머니 · 할머니)이 내 발자국을 따라 줄지어 온다 — 뛰면 할머니가 처지고, 끈이 끊어지면 그 자리에서 기다린다.
   군인과 싸움은 그리지 않는다. 뒤쪽 하늘의 불빛과 낮은 소리만. 쓰러진 사람도 그리지 않는다(버려진 짐과 수레까지).
   좌표: x 동쪽(+), z 남쪽(+) — 화면 아래(z 큰 쪽)에서 위(z 작은 쪽)로 걷는다. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, canvasTex, glowSprite, people, collideRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, edgeGoal, overBar, runLoop, backdrop } from '../scene/kit.js?v=2';

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
const rnd = rng(19501225);
const BD = backdrop(scene, { rnd, z0: 0, z1: 320, edge: edgeAt, field: (z) => z < 150, skip: (z) => z > 66 && z < 96, skyTop: 0x1d2a4c, skyLow: 0x7d88a8, backC: 0xd8542c, frontC: 0xffc070, lite: matchMedia('(pointer: coarse)').matches && innerWidth < 500 });
const { person, walkAnim } = people(scene);
const dmy = new THREE.Object3D(), colr = new THREE.Color();
function inst(geo, color, list, shadow = true) { const m = new THREE.InstancedMesh(geo, M(color), Math.max(1, list.length)); list.forEach((t, i) => { dmy.position.set(t[0], t[1], t[2]); dmy.rotation.set(t[7] || 0, t[6] || 0, 0); dmy.scale.set(t[3], t[4], t[5]); dmy.updateMatrix(); m.setMatrixAt(i, dmy.matrix); if (t[8] != null) m.setColorAt(i, colr.set(t[8])); }); m.count = list.length; m.castShadow = shadow; m.receiveShadow = true; scene.add(m); return m; }
const B1 = new THREE.BoxGeometry(1, 1, 1);

/* 땅: 판 밖 눈벌판 · 판 안 눈 · 밟혀 다져진 길 */
{ const g = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), M(0xdfe6f0)); g.rotation.x = -Math.PI / 2; g.position.set(40, -0.02, 160); g.receiveShadow = true; scene.add(g);
  const strip = [], path = []; for (let z = -6; z < 330; z += 4) { const [a, b] = edgeAt(z + 2), c = (a + b) / 2; strip.push([c, 0.0, z + 2, b - a, 0.02, 4.1, 0, 0, 0xeef2f8]); if (z < 66 || z > 96) path.push([c + Math.sin(z * 0.11) * 0.8, 0.02, z + 2, zoneAt(z) === 'town' ? 12 : zoneAt(z) === 'river' ? 3 : 3.6, 0.02, 4.2, 0, 0, zoneAt(z) === 'town' ? 0xa8a49c : 0xb8b2a6]); }
  inst(B1, 0xffffff, strip, false); inst(B1, 0xffffff, path, false); }

/* 1 고갯길: 양쪽 눈 비탈(세 층) · 소나무 · 바위 · 떠나는 집 */
{ const ter = [], pines = [], caps = [], rocks = [];
  for (let z = 236; z < 340; z += 5) { const [a, b] = edgeAt(Math.min(z, 330)), fade = clamp((z - 236) / 14, 0, 1); if (fade <= 0) continue;
    for (const [side, e] of [[-1, a], [1, b]]) { [[1.6, 0.9 * fade], [4.4, 2.4 * fade], [8.2, 4.4 * fade], [13, 6.4 * fade]].forEach(([off, h], k) => ter.push([e + side * (off + 1.4), h / 2, z, 2.9 + k * 0.8, h, 5.4, 0, 0, [0xeaf0f8, 0xe0e8f2, 0xd6dfec, 0xccd6e6][k]]));
      for (let k = 0; k < 2; k++) { if (rnd() < 0.35) continue; const x = e + side * (5 + rnd() * 16), y = x * side - e * side > 9 ? 4.4 : 2.4, s = 0.8 + rnd() * 0.7; pines.push([x, y + 1.6 * s, z + rnd() * 4, 1.5 * s, 3.4 * s, 1.5 * s, 0, 0, 0x2e4a3e]); caps.push([x, y + 3.1 * s, z + rnd() * 0.1 + 0, 0.9 * s, 1.2 * s, 0.9 * s, 0, 0, 0xf4f8fc]); }
      if (rnd() < 0.3) rocks.push([e + side * 0.9, 0.35, z + rnd() * 4, 1.2, 0.7, 1.0, rnd() * 3, 0, 0x6a6e7a]); } }
  inst(B1, 0xffffff, ter); inst(new THREE.ConeGeometry(1, 1, 6), 0xffffff, pines); inst(new THREE.ConeGeometry(1, 1, 6), 0xffffff, caps, false); inst(new THREE.DodecahedronGeometry(0.6), 0xffffff, rocks);
  for (const r of rocks) SOLID.push([r[0] - 0.6, r[2] - 0.5, r[0] + 0.6, r[2] + 0.5]);
  const house = new THREE.Group(); house.add(at(box(9, 2.6, 5.5, 0xb8a888), 0, 1.3, 0), at(box(9.8, 0.4, 6.4, 0xeef2f8), 0, 3.6, 0)); const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.4, 1.6, 4, 1), M(0xe8eef6)); roof.rotation.y = Math.PI / 4; roof.scale.set(1.45, 1, 0.85); roof.position.y = 3.3; roof.castShadow = true; house.add(roof, at(box(1.4, 1.9, 0.1, 0x3a2a1a), 0, 0.95, -2.8), at(box(1.2, 0.8, 0.1, 0xffc870), -2.8, 1.6, -2.8)); house.position.set(42, 0, 327); scene.add(house); SOLID.push([37, 324, 47, 331]);
  scene.add(at(box(0.4, 1.2, 9, 0x8a7a64), 36, 0.6, 320), at(box(0.4, 1.2, 9, 0x8a7a64), 47.6, 0.6, 320)); }

/* 2 읍내: 닫힌 가게 줄 · 담벼락 · 전봇대 · 수레 */
const wallNote = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1), new THREE.MeshStandardMaterial({ color: 0xf6f0dc, roughness: 1 }));
{ const walls = [], shut = [], roofs = [], snowR = [], back = [];
  for (const side of [-1, 1]) { let z = 236; while (z > 156) { const len = 6 + rnd() * 4, cz = z - len / 2, e = side < 0 ? 27 : 53, wall = rnd() < 0.3 || (side < 0 && cz < 219 && cz > 209);
      if (wall) { walls.push([e + side * 0.4, 0.85, cz, 0.6, 1.7, len, 0, 0, 0x9a8e7a]); SOLID.push([e + side * 0.4 - 0.4, z - len, e + side * 0.4 + 0.4, z]); }
      else { const hgt = 2.8 + rnd() * 1.5, d = 6; walls.push([e + side * (d / 2 + 0.2), hgt / 2, cz, d, hgt, len - 0.4, 0, 0, [0xb8a888, 0xa89878, 0xc8bca4][Math.floor(rnd() * 3)]]); shut.push([e + side * 0.18, 1.1, cz, 0.1, 1.9, len - 1.6, 0, 0, 0x4a3a2a]); roofs.push([e + side * (d / 2 + 0.2), hgt + 0.25, cz, d + 1, 0.5, len, 0, 0, 0x4e586c]); snowR.push([e + side * (d / 2 + 0.2), hgt + 0.55, cz, d + 0.6, 0.18, len - 0.4, 0, 0, 0xf2f6fa]); SOLID.push([e + side * 0.1 - (side < 0 ? 6.4 : 0), z - len, e + side * 0.1 + (side > 0 ? 6.4 : 0), z]); }
      for (let k = 0; k < 2; k++) back.push([e + side * (11 + k * 7 + rnd() * 3), 1.6, cz + rnd() * 3, 5, 3.2, len - 1, 0, 0, 0xa89878]);
      z -= len; } }
  inst(B1, 0xffffff, walls); inst(B1, 0xffffff, shut); inst(B1, 0xffffff, roofs); inst(B1, 0xffffff, snowR, false); inst(B1, 0xffffff, back);
  const poles = []; for (let z = 232; z > 158; z -= 15) for (const x of [28.6, 51.4]) { poles.push([x, 3, z, 0.24, 6, 0.24, 0, 0, 0x4a3a2c]); SOLID.push([x - 0.2, z - 0.2, x + 0.2, z + 0.2]); }
  inst(B1, 0xffffff, poles);
  const carts = [[30.4, 196], [50, 228], [49.8, 162], [30.6, 166]]; for (const [x, z] of carts) { scene.add(at(box(1.6, 0.6, 2.4, 0x7a5a3a), x, 0.8, z), at(box(1.1, 0.6, 1, 0x8a4a3a), x, 1.4, z + 0.3)); SOLID.push([x - 0.9, z - 1.3, x + 0.9, z + 1.3]); }
  wallNote.position.set(27.62, 1.5, WALL[1]); wallNote.rotation.y = Math.PI / 2; wallNote.visible = false; scene.add(wallNote); }

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
  for (let k = 0; k < 9; k++) { const c = box(2 + rnd() * 2, 0.2, 1.6 + rnd() * 2, 0xd4e6f4); c.position.set(ICE[0] + 1.5 + rnd() * 10, 0.02, RIVER[0] + 1.5 + rnd() * 15); c.rotation.y = rnd() * 3; chunks.add(c); } chunks.visible = false; scene.add(chunks);
  /* 끊어진 다리: 기둥 · 양쪽에서 나온 다리 끝 · 아래 징검돌 */
  for (const z of [76, 86]) for (const x of [13.6, 18.4]) scene.add(at(box(1, 3.4, 1, 0x7a7a82), x, 1.7, z));
  scene.add(at(box(6.4, 0.5, 7, 0x8a8a92), 16, 3.6, 87), at(box(6.4, 0.5, 6.2, 0x8a8a92), 16, 3.6, 75.6), at(box(1.2, 0.5, 1.4, 0x8a8a92), 14, 3.4, 83.2), at(box(1.4, 0.5, 1.2, 0x8a8a92), 17.6, 3.3, 79.2));
  const stones = []; for (let z = 72.6; z < 90; z += 1.6) stones.push([16 + Math.sin(z) * 1.6, 0.06, z, 1.4, 0.24, 1.1, z, 0, 0x8a8e98]); inst(new THREE.CylinderGeometry(0.6, 0.7, 1, 6), 0xffffff, stones);
  /* 나루: 양쪽 나루터 · 배 · 사공 */
  scene.add(at(box(4, 0.3, 5, 0x6a4a2a), 40, 0.18, 92.6), at(box(4, 0.3, 4, 0x6a4a2a), 40, 0.18, 69.6));
  boat.add(at(box(2.6, 0.6, 5.4, 0x5a3a20), 0, 0.2, 0), at(box(2.2, 0.2, 4.8, 0x7a5a38), 0, 0.42, 0)); boat.position.set(40, 0, 87.6); scene.add(boat);
  const ferry = person({ shirt: 0x8a8070, pants: 0x5a5448, hat: 'satgat', mood: 'stern' }); ferry.position.set(0.6, 0.45, 2); ferry.rotation.y = Math.PI; boat.add(ferry);
  const oar = at(box(0.12, 0.12, 3.4, 0x6a4a2a), 1.2, 1.1, 2.6); oar.rotation.x = 0.4; boat.add(oar);
  /* 벌판: 앙상한 나무 */
  const trunks = [], twig = []; for (let i = 0; i < 26; i++) { const z = 98 + rnd() * 48, x = 12 + rnd() * 56; if (Math.abs(x - 40) < 6 || (z < 100 && x > 52)) continue; trunks.push([x, 1.8, z, 0.3, 3.6, 0.3, 0, 0, 0x4a3a30]); twig.push([x + 0.5, 3.2, z, 0.12, 1.6, 0.12, 0, 0.7, 0x4a3a30], [x - 0.5, 2.8, z, 0.12, 1.4, 0.12, 0, -0.7, 0x4a3a30]); SOLID.push([x - 0.3, z - 0.3, x + 0.3, z + 0.3]); }
  inst(B1, 0xffffff, trunks); inst(B1, 0xffffff, twig); }

/* 4 천막촌: 천막 줄 · 천막 교실 · 우리 천막 */
const tentGlow = [], ourTent = new THREE.Group(), classTent = new THREE.Group();
{ const tents = [], prism = new THREE.CylinderGeometry(1, 1, 1, 3); prism.rotateZ(Math.PI / 2);
  for (let z = 44; z > 2; z -= 6.5) for (const side of [-1, 1]) { const x = side < 0 ? 32.4 : 47.6; if (side < 0 && z < 36 && z > 22) continue; if (side > 0 && z < 14 && z > 4) continue; tents.push([x, 1.0, z, 3.6, 1.6, 2.3, Math.PI / 2, 0, [0xc8c0a8, 0xb8b098, 0xd2ccb8][Math.floor(rnd() * 3)]]); SOLID.push([x - 1.8, z - 2.2, x + 1.8, z + 2.2]); tentGlow.push([x - side * 1.9, 0.8, z]); }
  inst(prism, 0xffffff, tents);
  for (const [x, y, z] of tentGlow) { const g = glowSprite(scene, 'rgba(255,200,120,.5)', 'rgba(255,150,60,0)', 2.2); g.material.depthTest = true; g.position.set(x, y, z); }
  classTent.add(at(box(5, 2.6, 6.4, 0xd8d2bc), 0, 1.3, 0)); const cr = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 3), M(0xc8c0a8)); cr.rotation.set(0, 0, Math.PI / 2); cr.rotation.y = Math.PI / 2; cr.scale.set(1.2, 6.6, 3.2); cr.position.y = 3.2; cr.castShadow = true; classTent.add(cr, at(box(0.1, 1.4, 2.2, 0x2a3a2a), 2.52, 1.4, -1.2), at(box(0.1, 1.9, 1.4, 0x5a3a20), 2.52, 0.95, 1.6)); classTent.position.set(33.8, 0, 29.5); scene.add(classTent); SOLID.push([31.2, 26.2, 36.4, 32.8]);
  const teacher = person({ shirt: 0x5a6a8a, pants: 0x3a3a48, hat: 'hair', hairC: 0x2b2118 }); teacher.position.set(36.6, 0, 27.2); teacher.rotation.y = Math.PI / 2;
  const tg = new THREE.Mesh(prism, M(0xb8b098)); tg.rotation.y = Math.PI / 2; tg.scale.set(3.2, 1.5, 2.1); tg.position.y = 0.9; tg.castShadow = true; ourTent.add(tg, at(cyl(0.5, 0.6, 0.25, 0x5a4a3a, 8), -2.6, 0.12, 2.4)); ourTent.position.set(47, 0, 10); scene.add(ourTent); SOLID.push([45.4, 7.8, 48.6, 12.2]);
  const sit = [[38.6, 36.6], [41.6, 39.2], [41.2, 36.4], [38.4, 22.6], [41.7, 19.6]]; sit.forEach(([x, z], i) => { const p = person({ shirt: [0xd8d4c8, 0x6a6a72, 0x3a4660, 0x7a5a42, 0xc8c0b0][i], pants: 0x4a4a52, hat: i % 2 ? 'hair' : undefined }); p.position.set(x, -0.35, z); p.scale.setScalar(0.9); p.lookAt(40, -0.35, z < 30 ? 21 : 38); p.userData.legL.rotation.x = p.userData.legR.rotation.x = -1.4; });
  const kids = []; for (let k = 0; k < 4; k++) { const p = person({ shirt: [0xd8d4c8, 0x8a6a4a, 0x6a7a9a, 0xb8a888][k], pants: 0x4a4a52 }); p.scale.setScalar(0.62); p.position.set(32.6 + (k % 2) * 1.4, -0.2, 28 + Math.floor(k / 2) * 1.8); p.rotation.y = Math.PI / 2; p.userData.legL.rotation.x = p.userData.legR.rotation.x = -1.4; kids.push(p); } }

/* 모닥불 */
const fireFx = FIRES.map(([x, z]) => { const g = new THREE.Group(); g.add(at(box(1.4, 0.2, 0.3, 0x4a3420), 0, 0.12, 0), at(box(0.3, 0.2, 1.4, 0x4a3420), 0, 0.14, 0)); const fl = []; for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.34 - k * 0.08, 0.9 - k * 0.15, 5), new THREE.MeshBasicMaterial({ color: [0xff5a2a, 0xffa23a, 0xffe07a][k] })); c.position.y = 0.5; g.add(c); fl.push(c); } g.position.set(x, 0, z); scene.add(g); const s = glowSprite(scene, 'rgba(255,190,110,.9)', 'rgba(255,140,50,0)', 7); s.position.set(x, 1, z); const l = new THREE.PointLight(0xff9a4a, 6, 9, 1.6); l.position.set(x, 1.4, z); scene.add(l); SOLID.push([x - 0.7, z - 0.7, x + 0.7, z + 0.7]); return { g, fl, s, l, x, z }; });

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
const pMesh = person({ shirt: 0x3a4a6a, pants: 0x2a2a34, hat: undefined }); pMesh.scale.setScalar(0.86);
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.78, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const packG = new THREE.Group(); scene.add(packG);
const famLook = { bro: { shirt: 0x8a6a4a, pants: 0x3a3a44, s: 0.68 }, mom: { shirt: 0xd8d0c0, pants: 0x6a5a5a, hat: 'hair', s: 0.95 }, gma: { shirt: 0xe8e2d4, pants: 0xb8b0a0, hat: 'hair', hairC: 0xc4c4c4, s: 0.9 }, kid: { shirt: 0xc87a4a, pants: 0x4a3a3a, s: 0.6 } };
const ropeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
function makeMember(f) { const L = famLook[f.id], m = person({ shirt: L.shirt, pants: L.pants, hat: L.hat, hairC: L.hairC }); m.scale.setScalar(L.s); if (f.id === 'mom') m.add(at(box(0.8, 0.4, 0.6, 0x3a5a8a), 0, 2.2, 0)); if (f.id === 'gma') m.rotation.order = 'YXZ'; const rope = new THREE.Mesh(B1, ropeMat.clone()); scene.add(rope); return { ...f, mesh: m, rope, state: 'with', s: 0, x: 0, z: 0, ox: 0, oz: 0, dir: 0, moving: false }; }
const fam = FAM0.map(makeMember);
const kid = makeMember({ id: 'kid', name: '아이', ic: '🧒', sp: 5.0 }); kid.state = 'wait';
/* 인파 — 상자 셋(몸 · 머리 · 등짐) 한 묶음 */
const CN = 110, crowd = [];
const cBody = new THREE.InstancedMesh(new THREE.BoxGeometry(0.66, 1.2, 0.46), M(0xffffff), CN), cHead = new THREE.InstancedMesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), M(0x2b2118), CN), cPack = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 0.6, 0.4), M(0xffffff), CN);
for (const m of [cBody, cHead, cPack]) { m.castShadow = true; m.frustumCulled = false; scene.add(m); }
for (let i = 0; i < CN; i++) { crowd.push({ x: 0, z: 0, v: 1.5 + rnd() * 0.9, ph: rnd() * 6, lat: rnd() * 6, on: false }); cBody.setColorAt(i, colr.set([0xd8d4c8, 0x6a6a72, 0x3a4660, 0x7a5a42, 0xc8c0b0, 0x5a4a3a][i % 6])); cPack.setColorAt(i, colr.set([0x8a4a3a, 0x3a5a8a, 0xc8a050, 0x6a6a7a, 0xe8e0d0][i % 5])); }

/* ───── 상태 ───── */
const S = { mode: 'title', t: 0, px: START[0], pz: START[1], pdir: -Math.PI / 2, view: 0, yaw: 0, yawT: 0, camYaw: 0, zoom: 1, said: {}, sayT: 0,
  backZ: BACK0, pack: [], cold: 0, crack: 0, iceBroken: false, note: false, noteT: 0, child: false, cls: 0, clsT: 0, tries: 0, callT: 0, ps: 0, moving: false, running: false, workKey: null, workT: 0, boat: null, ended: false, endT: 0, shown: false, stepT: 0, rumbleT: 2, cryT: 0, introT: 0, maxGap: 0, lostN: 0, breaks: 0, maxCrack: 0 };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say, VIEWS_R), keys = ctl.keys;
const ground = YARD.map(([id, x, z]) => ({ id, x, z, on: true, mesh: null }));
const itemMesh = (id) => { const g = new THREE.Group(), c = ITEMS[id].c; if (id === 'rice') g.add(at(box(0.7, 0.8, 0.5, c), 0, 0.4, 0)); else if (id === 'pot') g.add(at(cyl(0.45, 0.32, 0.45, c, 10), 0, 0.25, 0), at(box(0.6, 0.06, 0.06, c), 0, 0.5, 0)); else if (id === 'quilt') g.add(at(box(1, 0.45, 0.7, c), 0, 0.23, 0)); else if (id === 'album') g.add(at(box(0.5, 0.12, 0.4, c), 0, 0.08, 0)); else g.add(at(box(0.55, 0.3, 0.45, c), 0, 0.15, 0)); scene.add(g); return g; };
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
const seats = [[43.2, 12.2], [45.4, 13.6], [42.6, 10.6], [44.8, 14.6], [46.6, 13]];
const emptyMat = []; for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.9), new THREE.MeshStandardMaterial({ color: 0x8a6a4a, transparent: true, opacity: 0.6 })); m.visible = false; scene.add(m); emptyMat.push(m); }
function evening() {
  S.mode = 'evening'; S.endT = 0; SFX.done(); S.ended = true;
  const pot = S.pack.includes('pot'), quilt = S.pack.includes('quilt');
  evSmoke.forEach((s) => (s.visible = pot)); potFire.visible = pot; quiltGlow.visible = quilt;
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
    '한 번 더', () => { evSmoke.forEach((s) => (s.visible = false)); potFire.visible = quiltGlow.visible = false; emptyMat.forEach((m) => (m.visible = false)); for (const f of [...fam, kid]) f.seated = false; hemi.intensity = 1.15; sun.intensity = 1.1; resetAll(); S.mode = 'play'; });
}

/* ───── 그리기 ───── */
const ropeV = new THREE.Vector3();
function placeAll(dt) {
  pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving);
  pRing.position.set(S.px, 0.06, S.pz); pRing.visible = S.mode === 'play';
  /* 등짐: 진 것만큼 쌓인다 */
  const pk = S.pack.join(); if (pk !== packG.userData.k) { packG.userData.k = pk; while (packG.children.length) { const c = packG.children[0]; packG.remove(c); c.geometry.dispose(); c.material.dispose(); }
    let y = 0.9; for (const id of S.pack) { const h = ITEMS[id].w * 0.18 + 0.08; packG.add(at(box(0.55, h, 0.32, ITEMS[id].c), 0, y + h / 2, 0.3)); y += h; } }
  packG.position.set(S.px, 0, S.pz); packG.rotation.y = -S.pdir + Math.PI / 2;
  let prevX = S.px, prevZ = S.pz, prevS = S.ps;
  for (const f of [...fam, kid]) {
    if (f.state === 'gone') { f.mesh.visible = false; f.rope.visible = false; continue; }
    if (f.state === 'class') { f.mesh.visible = !S.seated || f.seated; if (!f.seated) { f.mesh.position.set(33.4, -0.2, 31.4); f.mesh.rotation.y = Math.PI / 2; f.mesh.userData.legL.rotation.x = f.mesh.userData.legR.rotation.x = -1.4; } else { f.mesh.position.set(f.x, -0.25, f.z); f.mesh.lookAt(44.4, -0.25, 12.4); } f.rope.visible = false; continue; }
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
const v3 = new THREE.Vector3(), goalV = new THREE.Vector3();
function view() {
  scene.fog.far = S.view === 3 && S.mode === 'play' ? 900 : 260;
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k); cam.position.set(lerp(41, 41, e), lerp(30, 11, e), lerp(354, START[1] + 24, e)); cam.lookAt(lerp(40, 41, e), lerp(3, 4, e), lerp(0, START[1] - 11, e)); if (cam.fov !== 45) { cam.fov = 45; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'evening') { cam.position.lerp(v3.set(39, 6.5, 24), 0.04); cam.lookAt(45, 1.2, 11); }
  else followCam(cam, S, { W, H, clampX: [-200, 280], clampZ: [-40, 400], farH: [10, 13], farBk: [26, 29], farFov: 45, lookY: 4, aheadFar: 6, map: { h: [250, 330], z: 0, look: 0, fov: 70 } });
  /* 목표: 천막촌 불빛(천막촌 안에서는 우리 천막 · 교실) */
  if (S.pz < 50) goalV.set(S.cls === 0 && fam[0].state === 'with' ? CLASS[0] : TENT[0], 1.5, S.cls === 0 && fam[0].state === 'with' ? CLASS[1] : TENT[1]); else goalV.set(40, 3, 10);
  edgeGoal($('goal'), cam, goalV.clone(), S.mode === 'play', 0.82);
  BD.ridges.forEach((r) => (r.visible = S.view !== 3)); pRing.scale.setScalar(S.view === 3 ? 7 : 1);
  for (const t of tags) { const vis = S.mode === 'play' && S.view !== 3 && t.show() && dist(t.x, t.z, S.px, S.pz) < t.range; if (!vis) { t.el.style.display = 'none'; continue; } const q = v3.set(t.x, t.y, t.z).project(cam); if (q.z > 1 || Math.abs(q.x) > 1.1 || Math.abs(q.y) > 1.1) { t.el.style.display = 'none'; continue; } t.el.style.display = 'block'; t.el.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; t.el.style.top = clamp(((1 - q.y) / 2) * innerHeight, 120, innerHeight - 20) + 'px'; }
}

resetAll(); placeAll(0);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; };
runLoop(update, view, () => renderer.render(scene, cam));
window.__scene = { S, fam, kid, crowd, update, keys, ctl, act, dropItem, trail: () => trail, chain,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; placeChainAt(x, z, 0, 1); }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { let stuck = 0; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz), ox = S.px, oz = S.pz; ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - ox, S.pz - oz) < 0.003 && S.callT <= 0 && !S.boat && S.noteT <= 0) { if (++stuck > 45) break; } else stuck = 0; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode, gap: +(S.backZ - S.pz).toFixed(1) }; },
  const: { START, YARD, KID, WALL, CLASS, TENT, DOCK, DOCK_S, FORD, ICE, RIVER, FIRES, CAP, edgeAt } };
