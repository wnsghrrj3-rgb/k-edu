/* 케이월드 · 안시성 — 삼국(고구려) 한 장면(2026-11-18). 공통 부품 = ../scene/kit.js.
   준호(11-18): 「성을 지켜라는 미션이 뭔지 모르겠다 · 긴장감 돌게 · 침략을 어떻게든 막아내는 전술」 → 실제 싸움 하나(645년 안시성)를 전술로 막는다.
   한 줄: 첫눈이 올 때까지 버틴다. 저 흙산이 성벽보다 높아지기 전에.
   세 막 — ① 들 비우기(볏가리를 성으로 들이거나 태운다 · 대군이 지평선에서 다가온다)
            ② 보고 막기(사다리 → 밀어 넘긴다 / 성문 부수는 수레 → 불화살 / 돌 날리는 기계에 무너진 성벽 → 나무 울짱)
            ③ 흙산(날마다 높아진다 → 성벽 위에 울짱을 올려 버틴다 → 비에 무너지면 달려 나가 꼭대기에 깃발)
   싸움 수위(준호 11-18): 화살·돌·불·넘어가는 사다리는 그린다 · 적 병사는 「쓰러지면서 사라진다」 · 피와 남는 몸은 그리지 않는다.
   좌표: x 동쪽(+), z 남쪽(+). 성벽은 동서로(z 50~53), 그 북쪽이 들(적), 남쪽이 성 안. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, flatMaker, skyDome, glowSprite, ringsFx, people, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, edgeGoal, overBar, runLoop, loadArt, art, artInst, artGeo, artGlowMat, scatter, missions } from '../scene/kit.js?v=5';
await loadArt('people', 'nature', 'build', 'props', 'fort');

const W = 120, H = 96;
const WX0 = 8, WX1 = 112, WZ0 = 50, WZ1 = 53, WH = 4.2, GATE_X = 60, TAKE = [60, 43.5];
const T1 = 62, T2 = 100, T3_RAIN = 52, T3_FALL = 62, TOTAL = T1 + T2 + T3_FALL + 24;
const STACKS0 = [[22, 36], [38, 26], [50, 16], [72, 14], [84, 28], [98, 38], [30, 14], [92, 18]];
const BRAZ = [40, 80], LOGS = [24, 72], MOUND_X = 92, MOUND_Z = 41;
const seed0 = +(new URLSearchParams(location.search).get('seed') || (Date.now() % 100000));

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xd6dde2, 100, 360], exposure: 1.05 });
const hemi = new THREE.HemisphereLight(0xdfeaff, 0x7a6a4a, 1.25); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff0d0, intensity: 2.2, box: [72, 60], far: 220, pos: [W / 2 - 50, 70, H / 2 + 40], target: [W / 2, 0, H / 2 - 6] });
addEventListener('resize', resize); resize();
const rnd = rng(20261118), drnd = rng(6450);
const sky = skyDome(scene, rnd, { top: 0x6aa0e0, low: 0xe6eef2, stars: 0 });
const flat = flatMaker(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);
const v3 = new THREE.Vector3(), _o = new THREE.Object3D();
const flames = (list) => { const gs = list.map(([x, y, z, s, ry]) => { _o.position.set(x, y, z); _o.rotation.set(0, ry || 0, 0); _o.scale.setScalar(s); _o.updateMatrix(); return artGeo('flame', {}, true).clone().applyMatrix4(_o.matrix); });
  let nv = 0, ni = 0; for (const g of gs) { nv += g.attributes.position.count; ni += g.index.count; } const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), C = new Float32Array(nv * 3), I = new Uint32Array(ni); let v = 0, i = 0;
  for (const g of gs) { P.set(g.attributes.position.array, v * 3); N.set(g.attributes.normal.array, v * 3); C.set(g.attributes.color.array, v * 3); const ix = g.index.array; for (let k = 0; k < ix.length; k++) I[i + k] = ix[k] + v; v += g.attributes.position.count; i += ix.length; }
  const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.BufferAttribute(P, 3)); o.setAttribute('normal', new THREE.BufferAttribute(N, 3)); o.setAttribute('color', new THREE.BufferAttribute(C, 3)); o.setIndex(new THREE.BufferAttribute(I, 1)); return new THREE.Mesh(o, artGlowMat); };

/* 땅: 들(가을) · 성 안 · 길 */
flat(-260, -260, W + 260, H + 200, 0xb9b06a, 0);
flat(WX0 + 1, WZ1, WX1 - 1, H + 6, 0x9a9274, 0.02);
flat(57, -40, 63, WZ0, 0xc9b98a, 0.03);
{ const patch = []; for (let i = 0; i < 150; i++) { const x = -20 + drnd() * 160, z = -30 + drnd() * 78; patch.push([x, 0, z, [1.2 + drnd() * 2.4, 1, 1 + drnd() * 2], drnd() * 6.28]); }
  artInst(scene, 'grass_a', patch, {}, { shadow: false });
  const stub = []; for (let z = 10; z < 46; z += 3.2) for (let x = 12; x < 110; x += 3.4) { if (Math.abs(x - 60) < 5) continue; if (drnd() < 0.45) stub.push([x + drnd() * 1.4, 0, z + drnd() * 1.2, 0.5 + drnd() * 0.3, drnd() * 6.28]); }
  artInst(scene, 'crop_gold', stub, {}, { shadow: false }); }
/* 성벽(돌) · 여장 · 치 · 문 */
{ const wa = [], wb = [], mer = [], L = WX1 - WX0, n = Math.round(L / 4), m = Math.round(L / 1.6);
  for (let i = 0; i < n; i++) { const a = WX0 + (i + 0.5) * L / n; (i % 2 ? wb : wa).push([a, 0, 51.5, [L / n / 4, WH / 4, 1], 0]); }
  for (let i = 0; i < m; i++) { const a = WX0 + (i + 0.5) * L / m; mer.push([a, WH - 0.02, WZ0 + 0.36, [L / m / 1.6, 1, 1], 0]); }
  artInst(scene, 'fwall_a', wa); artInst(scene, 'fwall_b', wb); artInst(scene, 'merlon', mer, {}, { shadow: false });
  artInst(scene, 'chi', [[WX0 - 0.4, 0, 50.6, 1, 0], [WX1 + 0.4, 0, 50.6, 1, 0], [34, 0, 49.6, [0.8, 1, 0.8], 0], [86, 0, 49.6, [0.8, 1, 0.8], 0]], {}, { shadow: false });
  const g = art('gate_n'); g.position.set(GATE_X, 0, WZ1); scene.add(g);
  for (const sx of [-1, 1]) { const w = box(2, WH + 1.2, 60, 0x8f8a7c); at(w, sx > 0 ? WX1 + 1 : WX0 - 1, (WH + 1.2) / 2 - 0.6, WZ1 + 28); w.castShadow = false; scene.add(w); } }
/* 성 안(꾸밈 — 못 간다): 집 · 우물 · 대장간 · 곳간 · 사람들 */
artInst(scene, 'watch_hut', [[20, 0, 60, 1, 0], [100, 0, 60, 1, 0]], {}, {});
artInst(scene, 'thatch_a', [[30, 0, 70, 1, 0.2], [48, 0, 76, 1, -0.3], [78, 0, 72, 1, 0.4], [92, 0, 78, 1, 0]], { wall: 0xd9c6a2 }, {});
artInst(scene, 'thatch_b', [[18, 0, 80, 1, 0.5], [66, 0, 82, 1, -0.2], [104, 0, 74, 1, 0.3]], { wall: 0xd2bc94 }, {});
{ const p = [['well_f', 44, 62], ['smithy', 74, 62], ['bugyeong', 60, 70], ['stone_pile', 52, 57], ['sack_pile', 66, 57], ['jangdok', 36, 58], ['firewood', 84, 57], ['drum', 57, 56]];
  for (const [n, x, z] of p) { const m = art(n); if (m) { m.position.set(x, 0, z); if (n === 'smithy' || n === 'bugyeong') m.rotation.y = Math.PI; scene.add(m); } } }
const towns = [[40, 60], [70, 66], [56, 62], [88, 64], [28, 64]].map(([x, z], i) => { const m = person({ shirt: [0xc8b08a, 0x9a8a68, 0xb89a70][i % 3], pants: 0x6a5034, hat: 'top', skin: 0xf0c48e }); m.position.set(x, 0, z); m.rotation.y = Math.PI; return m; });
/* 판 밖 세 겹: 솔숲과 바위 · 언덕과 적의 군막 · 먼 산 능선 두 겹 */
artInst(scene, 'hill_a', [[60, 0, -150, [120, 30, 40], 0.2], [-70, 0, -60, [60, 24, 60], 1.4], [200, 0, -40, [70, 28, 80], 2.6], [-80, 0, 70, [50, 18, 60], 4.0], [210, 0, 80, [60, 20, 60], 0.6]], {}, { shadow: false });
artInst(scene, 'hill_b', [[150, 0, -130, [80, 26, 40], 3.1], [-30, 0, -140, [70, 22, 36], 5.0], [60, 0, 190, [140, 26, 50], 1.0]], {}, { shadow: false });
{ const ridgeGeo = new THREE.ConeGeometry(1, 1, 5); ridgeGeo.translate(0, 0.5, 0);
  for (const [c, r0, n, h0] of [[0x8798ae, 250, 26, 34], [0xb3c0d2, 300, 20, 56]]) { const im = new THREE.InstancedMesh(ridgeGeo, new THREE.MeshLambertMaterial({ color: c, flatShading: true, fog: false }), n);
    for (let i = 0; i < n; i++) { const a = -3.5 + (i / (n - 1)) * 3.9 + drnd() * 0.05, r = r0 + drnd() * 18; _o.position.set(W / 2 + Math.cos(a) * r, -4, H / 2 + Math.sin(a) * r); _o.scale.set(50 + drnd() * 30, h0 + drnd() * 30, 40 + drnd() * 20); _o.rotation.set(0, drnd() * 3, 0); _o.updateMatrix(); im.setMatrixAt(i, _o.matrix); } im.frustumCulled = false; scene.add(im); } }
scatter(scene, drnd, { area: [-70, -90, 190, 46], n: 70, names: ['pine_a', 'pine_b', 'tree_a', 'pine_b'], avoid: (x, z) => x > -6 && x < 126 && z > -34, scale: [1.2, 1.8], minGap: 3, shadow: false });
scatter(scene, drnd, { area: [-30, -10, 150, 46], n: 30, names: ['rock_a', 'rock_b', 'bush', 'rock_flat'], avoid: (x, z) => (x > 6 && x < 114) || Math.abs(x - 60) < 6, scale: [0.8, 1.4], minGap: 2, shadow: false });
const camp = new THREE.Group(); { const t = []; for (let i = 0; i < 14; i++) t.push([14 + (i % 7) * 15 + drnd() * 4, 0, -46 - Math.floor(i / 7) * 12 + drnd() * 3, 1.6, drnd() * 0.6]); const im = artInst(camp, 'tent', t, {}, { shadow: false }); } camp.visible = false; scene.add(camp);

/* ───── 적 병사(한 번에 그린다) — 쓰러지면서 사라진다 ───── */
function soldierGeo(body, helm, shield) { const parts = [[0.5, 0.62, 0.3, 0, 0.31, 0, 0x2e2a2a], [0.62, 0.7, 0.36, 0, 0.98, 0, body], [0.4, 0.4, 0.4, 0, 1.55, 0, 0xe8bf8e], [0.48, 0.2, 0.48, 0, 1.82, 0, helm], [0.1, 0.24, 0.1, 0, 2.02, 0, 0xb02a22], [0.08, 0.7, 0.62, -0.4, 1.0, 0.12, shield], [0.06, 2.3, 0.06, 0.4, 1.25, 0.1, 0x6a5234]];
  const P = [], N = [], C = [], col = new THREE.Color(); for (const [w, h, d, x, y, z, c] of parts) { const g = new THREE.BoxGeometry(w, h, d).toNonIndexed(); g.translate(x, y, z); col.set(c); const p = g.attributes.position.array, nn = g.attributes.normal.array; for (let i = 0; i < p.length; i += 3) { P.push(p[i], p[i + 1], p[i + 2]); N.push(nn[i], nn[i + 1], nn[i + 2]); C.push(col.r, col.g, col.b); } }
  const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); o.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return o; }
const NE = 150, foeIM = new THREE.InstancedMesh(soldierGeo(0x7a2a24, 0x3a3a44, 0x9a7a3a), new THREE.MeshLambertMaterial({ vertexColors: true }), NE); foeIM.frustumCulled = false; foeIM.castShadow = true; scene.add(foeIM);
const foes = Array.from({ length: NE }, () => ({ on: false, x: 0, y: 0, z: 0, dir: 0, st: 'off', t: 0, ph: 0 }));
function foeNew(x, z, y = 0) { const f = foes.find((f) => !f.on); if (!f) return null; Object.assign(f, { on: true, x, y, z, dir: Math.PI / 2, st: 'go', t: 0, ph: drnd() * 6, moving: true }); return f; }
function foeFall(f) { if (f && f.on && f.st !== 'fall') { f.st = 'fall'; f.t = 0; } }
const q0 = new THREE.Quaternion(), e0 = new THREE.Euler();
function foesDraw(dt) { let n = 0; for (const f of foes) { if (!f.on) continue; let s = 1, pitch = 0, y = f.y;
    if (f.st === 'fall') { f.t += dt; const a = clamp(f.t / 0.4, 0, 1), b = clamp((f.t - 0.4) / 0.5, 0, 1); pitch = -a * 1.45; s = 1 - b; y = f.y - b * 0.3; if (f.t > 0.9) { f.on = false; continue; } }
    else if (f.moving) y += Math.abs(Math.sin(S.t * 9 + f.ph)) * 0.12;
    e0.set(pitch, -f.dir + Math.PI / 2, 0, 'YXZ'); q0.setFromEuler(e0); _o.position.set(f.x, y, f.z); _o.quaternion.copy(q0); _o.scale.setScalar(s * 1.05); _o.updateMatrix(); foeIM.setMatrixAt(n++, _o.matrix); }
  foeIM.count = n; foeIM.instanceMatrix.needsUpdate = true; }
/* 먼 대군(판 밖 중간 겹 — 움직인다): 줄 맞춰 다가오고, 끝에는 물러간다 */
const NA = 260, armyIM = new THREE.InstancedMesh(soldierGeo(0x6a2620, 0x34343e, 0x8a6e34), new THREE.MeshLambertMaterial({ vertexColors: true }), NA); armyIM.frustumCulled = false; scene.add(armyIM);
const army = Array.from({ length: NA }, (_, i) => { const blk = Math.floor(i / 52), k = i % 52; return { x: 8 + blk * 24 + (k % 13) * 1.5, z: -Math.floor(k / 13) * 1.7, ph: drnd() * 6 }; });
const banners = [10, 34, 58, 82, 106].map((x) => { const g = new THREE.Group(); g.add(at(cyl(0.07, 0.07, 5, 0x4a3a2a, 5), 0, 2.5, 0), at(box(0.06, 1.6, 1.3, 0xb02a22), 0, 4.2, 0.7)); g.position.set(x + 9, 0, 0); scene.add(g); return g; });
function armyDraw() { const z0 = S.armyZ; let n = 0; for (const a of army) { _o.position.set(a.x, Math.abs(Math.sin(S.t * 7 + a.ph)) * (S.armyMove ? 0.1 : 0.02), z0 + a.z); _o.rotation.set(0, S.armyBack ? Math.PI : 0, 0); _o.scale.setScalar(1); _o.updateMatrix(); armyIM.setMatrixAt(n++, _o.matrix); } armyIM.instanceMatrix.needsUpdate = true; banners.forEach((b, i) => { b.position.z = z0 - 1 - (i % 2) * 3; b.rotation.y = Math.sin(S.t * 2 + i) * 0.15; }); }

/* ───── 놓이는 것들 ───── */
const stacks = STACKS0.map(([x, z]) => { const m = art('straw_stack'); m.position.set(x, 0, z); m.scale.setScalar(1.25); scene.add(m); const f = flames([[0, 1.2, 0, 1.5, 0], [0.5, 0.8, 0.3, 1.1, 2], [-0.4, 0.9, -0.3, 1.2, 4]]); f.position.set(x, 0, z); f.visible = false; scene.add(f); return { x, z, m, f, st: 'field', bt: 0 }; });
const takers = [-1.6, 1.6].map((dx) => { const m = person({ shirt: 0x9a8a68, pants: 0x6a5034, hat: 'top', skin: 0xf0c48e }); m.position.set(TAKE[0] + dx, 0, TAKE[1] + 1.2); m.rotation.y = Math.PI; return m; });
const takePad = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.0, 32), new THREE.MeshBasicMaterial({ color: 0xffcf4d, transparent: true, opacity: 0.8, depthWrite: false })); takePad.rotation.x = -Math.PI / 2; takePad.position.set(TAKE[0], 0.08, TAKE[1]); scene.add(takePad);
const carryStack = art('straw_stack'); carryStack.scale.setScalar(0.55); carryStack.visible = false; scene.add(carryStack);
const carryLog = art('log'); carryLog.visible = false; scene.add(carryLog);
const carryFire = glowSprite(scene, 'rgba(255,200,110,.95)', 'rgba(255,110,30,0)', 2.4); carryFire.visible = false;
const brazG = BRAZ.map((x) => { const g = new THREE.Group(); g.add(at(cyl(0.5, 0.36, 0.7, 0x3a3a40, 8), 0, 0.35, 0)); const f = flames([[0, 0.6, 0, 0.9, 0], [0.15, 0.55, 0.1, 0.6, 2]]); g.add(f); g.position.set(x, WH, 52.4); scene.add(g); const l = new THREE.PointLight(0xff8a3a, 6, 10, 1.6); l.position.set(x, WH + 1.4, 52.4); scene.add(l); return g; });
LOGS.forEach((x) => { for (let k = 0; k < 4; k++) { const m = art('log'); m.position.set(x - 0.6 + (k % 2) * 0.5, WH + Math.floor(k / 2) * 0.32, 52.5); m.rotation.y = Math.PI / 2; m.scale.setScalar(0.8); scene.add(m); } });
const flag0 = (() => { const g = new THREE.Group(); g.add(art('flag_pole', { cloth: 0xc0302a })); const c = art('flag_cloth', { cloth: 0xc0302a }); c.position.set(0, 3.6, 0); g.add(c); g.position.set(GATE_X + 3.4, WH + 0.6, 51.5); g.userData.c = c; scene.add(g); return g; })();
const flagM = (() => { const g = new THREE.Group(); g.add(art('flag_pole', { cloth: 0xc0302a })); const c = art('flag_cloth', { cloth: 0xc0302a }); c.position.set(0, 3.6, 0); g.add(c); g.scale.setScalar(1.3); g.visible = false; g.userData.c = c; scene.add(g); return g; })();
const guards = [16, 30, 46, 54, 66, 76, 90, 104].map((x) => { const m = person({ shirt: 0x6a3a2a, pants: 0x3a2a24, hat: 'guard', mood: 'stern', skin: 0xf0c48e }); m.position.set(x, WH, 50.9); m.rotation.y = Math.PI; return { m, x, x0: x, z: 50.9 }; });
/* 사다리 · 수레 · 돌 날리는 기계 · 흙산 · 무너진 곳 */
const ladders = Array.from({ length: 6 }, () => { const g = art('ladder'); g.scale.set(1.2, 1.35, 1.2); g.visible = false; scene.add(g); return { g, on: false }; });
const ramG = (() => { const g = new THREE.Group(); g.add(at(box(2.6, 0.3, 4.4, 0x5a4630), 0, 0.7, 0), at(box(3.0, 0.2, 5.0, 0x6a5234), 0, 2.5, 0)); for (const sx of [-1.2, 1.2]) for (const sz of [-1.6, 1.6]) { g.add(at(box(0.16, 1.8, 0.16, 0x4a3a28), sx, 1.6, sz)); const w = cyl(0.55, 0.55, 0.24, 0x3a2e22, 10); w.rotation.z = Math.PI / 2; g.add(at(w, sx * 1.15, 0.55, sz)); }
  const lg = cyl(0.34, 0.34, 5.6, 0x7a5a36, 8); lg.rotation.x = Math.PI / 2; lg.position.set(0, 1.5, 0.6); g.add(lg); const hd = cyl(0.42, 0.3, 0.7, 0x44444c, 8); hd.rotation.x = Math.PI / 2; hd.position.set(0, 1.5, 3.6); g.add(hd); g.userData.log = lg; g.userData.head = hd;
  const f = flames([[0, 2.6, 0, 1.8, 0], [0.8, 2.5, 1.2, 1.3, 2], [-0.7, 2.5, -1.2, 1.4, 4]]); f.visible = false; g.add(f); g.userData.f = f; g.visible = false; scene.add(g); return g; })();
const cats = [[30, 14], [90, 14]].map(([x, z]) => { const g = new THREE.Group(); g.add(at(box(2.4, 0.3, 3.4, 0x5a4630), 0, 0.5, 0)); for (const sx of [-1, 1]) g.add(at(box(0.2, 3.2, 0.2, 0x4a3a28), sx, 2, 0)); const arm = box(0.2, 0.2, 5.4, 0x6a5234); arm.position.set(0, 3.4, 0); g.add(arm); g.userData.arm = arm; g.position.set(x, 0, z); g.visible = false; scene.add(g); return { g, x, z, cd: 0 }; });
const shots = Array.from({ length: 2 }, () => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), M(0x8a8a86)); m.visible = false; scene.add(m); const r = new THREE.Mesh(new THREE.RingGeometry(0.2, 2.3, 28), new THREE.MeshBasicMaterial({ color: 0xff4a2a, transparent: true, opacity: 0.5, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.visible = false; scene.add(r); return { m, r, t: 9 }; });
const breaches = Array.from({ length: 3 }, () => { const rb = art('rubble'); rb.visible = false; scene.add(rb); const gap = box(4.2, 1.3, 1.2, 0x4a463e); gap.visible = false; gap.castShadow = false; scene.add(gap); const pal = new THREE.Group(); for (let k = 0; k < 9; k++) pal.add(at(cyl(0.2, 0.2, 2 + (k % 2) * 0.3, 0x8a6a40, 6), -1.9 + k * 0.48, 1, 0)); pal.visible = false; scene.add(pal); return { on: false, fixed: false, x: 0, rb, gap, pal }; });
const moundM = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 9.5, 1, 12), M(0x8a6c46)); moundM.position.set(MOUND_X, 0, MOUND_Z); moundM.scale.y = 0.01; moundM.receiveShadow = true; scene.add(moundM);
const rampM = box(9, 0.6, 12, 0x86683f); rampM.visible = false; rampM.castShadow = false; scene.add(rampM);
const palUp = new THREE.Group(); for (let lv = 0; lv < 3; lv++) { const row = new THREE.Group(); for (let k = 0; k < 22; k++) row.add(at(cyl(0.2, 0.2, 0.95, 0x8a6a40, 6), -5.2 + k * 0.5, 0.45 + lv * 0.85, 0)); row.visible = false; palUp.add(row); } palUp.position.set(MOUND_X, WH + 0.9, 50.3); scene.add(palUp);
const volleys = Array.from({ length: 16 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.3), new THREE.MeshBasicMaterial({ color: 0xefe6cc })); m.visible = false; scene.add(m); return { m, t: 9 }; });
/* 비 · 눈 */
const wx = (() => { const N = 900, p = new Float32Array(N * 3); for (let i = 0; i < N; i++) { p[i * 3] = drnd() * 160 - 20; p[i * 3 + 1] = drnd() * 40; p[i * 3 + 2] = drnd() * 110 - 10; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfe0ff, size: 0.22, transparent: true, opacity: 0.8, depthWrite: false })); m.visible = false; m.frustumCulled = false; scene.add(m); return { m, p, N }; })();

/* 나 */
const pMesh = person({ shirt: 0x8a3a2a, pants: 0x3a2a24, hat: 'guard', skin: 0xf0c48e });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const tagBox = $('tags'), tags = Array.from({ length: 9 }, () => { const d = document.createElement('div'); d.className = 'tag'; d.innerHTML = '<span class="ic"></span><span class="fill"><i></i></span>'; tagBox.appendChild(d); return d; });

/* ───── 소리 ───── */
const SFX = {
  drum: (v = 0.25) => { tone(70, 45, 0.5, 'sine', v); noise(0.2, v, 120); },
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  drop: () => { tone(523, 784, 0.16, 'triangle', 0.14); noise(0.08, 0.2, 900); },
  volley: () => { for (let i = 0; i < 3; i++) noise(0.05, 0.1, 2400 + i * 300, i * 0.04); },
  fire: () => { for (let i = 0; i < 5; i++) noise(0.1, 0.18, 1200 + i * 200, i * 0.08); },
  crash: () => { noise(0.5, 0.5, 160); tone(90, 50, 0.6, 'sawtooth', 0.12); },
  thud: () => { noise(0.25, 0.45, 110); tone(64, 40, 0.3, 'sine', 0.2); },
  push: () => { tone(300, 120, 0.4, 'sawtooth', 0.12); noise(0.35, 0.35, 500, 0.15); },
  horn: () => { tone(150, 160, 1.6, 'sawtooth', 0.11); tone(225, 235, 1.6, 'sine', 0.08); },
  thunder: () => { noise(1.4, 0.6, 90); noise(0.5, 0.4, 260, 0.2); tone(50, 34, 1.2, 'sine', 0.18); },
  whoosh: () => noise(0.5, 0.2, 700),
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.6, 'triangle', 0.16, i * 0.18)); },
  sad: () => { tone(330, 220, 1.2, 'sine', 0.14); tone(262, 175, 1.4, 'sine', 0.1, 0.4); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', round: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, at: 0, act: 1, px: 60, pz: 40, py: 0, pdir: -Math.PI / 2, moving: false, running: false, said: {}, sayT: 0,
  hp: 7, hp0: 7, got: 0, burned: 0, carry: null, fireT: 0, pushed: 0, ramsBurned: 0, fixed: 0, flagUp: false, hitBy: 0,
  armyZ: -150, armyMove: true, armyBack: false, squads: [], ram: null, ramN: 0, gateHP: 6, spawnT: 0, shootT: 0, catT: 0,
  moundH: 0, pal: 0, overT: 0, ramp: false, rainK: 0, snow: false, assaultT: 0, plantT: 0, stun: 0, shake: 0, workT: 0, workKey: '', T2: T2, lossBy: {}, endT: 0, shown: false, introT: 0, beatT: 0, stepT: 0, vigor: 1 };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 가만히 서면 집고·쌓는다 · 「밀기」 단추로 사다리를 밀고 불화살을 쏜다 · 「시점」 ⟲⟳';
let R = rng(seed0);

function resetRound(full) {
  if (full) { S.round = 1; S.hp0 = 7; if (mis) mis.reset(); }
  R = rng(seed0 * 3 + S.round * 97);
  for (const f of foes) f.on = false; for (const l of ladders) { l.on = false; l.g.visible = false; }
  Object.assign(S, { t: 0, at: 0, act: 1, px: 60, pz: 40, py: 0, pdir: -Math.PI / 2, hp: S.hp0, got: 0, burned: 0, carry: null, fireT: 0, pushed: 0, ramsBurned: 0, fixed: 0, flagUp: false,
    armyZ: -150, armyMove: true, armyBack: false, squads: [], ram: null, ramN: 0, gateHP: 6, spawnT: 6, shootT: 0, catT: 8, moundH: 0, pal: 0, overT: 0, ramp: false, rainK: 0, snow: false, assaultT: 0, plantT: 0, stun: 0, shake: 0, workT: 0, endT: 0, shown: false, vigor: 1, moundFoes: null, T2: T2, lossBy: {}, hitBy: 0 });
  stacks.forEach((s) => { s.st = 'field'; s.m.visible = true; s.f.visible = false; s.bt = 0; s.m.scale.setScalar(1.25); });
  breaches.forEach((b) => { b.on = b.fixed = false; b.rb.visible = b.gap.visible = b.pal.visible = false; });
  cats.forEach((c) => { c.g.visible = false; c.cd = 0; }); shots.forEach((s) => { s.m.visible = s.r.visible = false; s.t = 9; });
  ramG.visible = false; ramG.userData.f.visible = false; moundM.scale.y = 0.01; moundM.scale.x = moundM.scale.z = 1; moundM.position.set(MOUND_X, 0, MOUND_Z); rampM.visible = false; palUp.children.forEach((r) => (r.visible = false));
  flagM.visible = false; camp.visible = false; wx.m.visible = false; takePad.visible = true; takers.forEach((t) => (t.visible = true));
  guards.forEach((g) => { g.x = g.x0; g.z = 50.9; g.m.position.set(g.x, WH, g.z); g.m.rotation.y = Math.PI; });
  $('fade').style.opacity = 0; lightFor(); hud();
}
function hud() {
  $('hHp').textContent = '🛡 버팀 ' + '●'.repeat(Math.max(0, S.hp)) + '○'.repeat(Math.max(0, S.hp0 - S.hp));
  $('hCarry').textContent = S.carry === 'stack' ? '🌾 볏가리 들었음' : S.carry === 'log' ? '🪵 통나무 들었음' : S.fireT > 0 ? '🔥 불화살 준비' : '손 비었음';
  $('tField').className = S.got + S.burned >= 6 ? 'on' : ''; $('tField').textContent = `🌾 들 비우기 ${S.got + S.burned}/8 (들임 ${S.got})`;
  $('tFix').className = S.fixed ? 'on' : ''; $('tFlag').className = S.flagUp ? 'on' : '';
  $('tGoal').textContent = S.act === 1 ? '🌾 대군이 닿기 전에 들을 비운다' : S.act === 2 ? '🛡 무엇이 오는지 보고 막는다' : S.ramp ? '🚩 지금이다 — 흙산 꼭대기에 깃발을!' : '⛰ 흙산이 성벽을 넘지 못하게';
  { const all = S.T2 + T3_FALL, used = S.act === 1 ? 0 : S.act === 2 ? S.at : S.T2 + Math.min(S.at, T3_FALL), sup = S.act === 1 ? clamp(1 - (S.got + S.burned) * 0.03 + stacks.filter((s) => s.st === 'taken').length * 0.05, 0, 1.2) / 1.2 : clamp(1 - used / all, 0, 1) * (1 - (S.got + S.burned) * 0.03 + (S.left || 0) * 0.05) / 1.2; S.supply = S.flagUp ? 0 : sup; $('night').querySelector('i').style.width = clamp(S.supply, 0, 1) * 100 + '%'; }
}
function hurt(n, why, by) { if (S.mode !== 'play') return; S.lossBy[by] = (S.lossBy[by] || 0) + n; S.hp -= n; S.hitBy++; S.shake = 1; SFX.crash(); say(why, null, 2.6); hud(); if (S.hp <= 0) finish(false); }

/* ───── 막 넘기기 ───── */
function toAct(n) {
  S.act = n; S.at = 0; S.workT = 0;
  if (n === 2) { S.carry = null; S.px = clamp(S.px, 14, 106); S.pz = 51.5; S.py = WH; takePad.visible = false; takers.forEach((t) => (t.visible = false)); camp.visible = true; S.armyMove = false;
    const left = stacks.filter((s) => s.st === 'field' || s.st === 'taken').length; S.vigor = 1 + left * 0.03; S.T2 = T2 - 3 * (S.got + S.burned) + 5 * left; S.left = left; stacks.forEach((s) => { if (s.st === 'field') s.st = 'taken'; });
    SFX.horn(); SFX.drum(0.4); say(left ? `성문이 닫혔다 — 들에 남긴 볏가리 ${left}개만큼 적이 오래 버틴다` : '성문이 닫혔다 — 들이 비었다. 적의 군량은 오래 못 간다', null, 3.8); S.spawnT = 5; S.shootT = 2; S.catT = 26; }
  if (n === 3) { say('적이 성벽 앞에 흙산을 쌓는다! — 통나무로 울짱을 올려 버티자', null, 4); SFX.horn(); S.spawnT = 14; }
  hud();
}

/* ───── 입력: 밀기 · 쏘기 · 태우기 ───── */
const onWall = () => S.act >= 2 && S.pz > 50;
function act() {
  if (S.mode !== 'play' || S.stun > 0) return;
  if (S.act === 1) { const s = stacks.find((s) => s.st === 'field' && dist(S.px, S.pz, s.x, s.z) < 2.6); if (s && S.carry !== 'stack') { s.st = 'burn'; s.f.visible = true; S.burned++; SFX.fire(); ring(s.x, s.z, 3.5, 0xff8a3a); say('볏가리를 태웠다 — 적의 군량이 준다', 'burn1', 2.2); hud(); } return; }
  /* 사다리 밀기 */
  const sq = S.squads.find((q) => q.st === 'climb' && Math.abs(q.x - S.px) < 2.4);
  if (sq && onWall()) { pushLadder(sq); return; }
  /* 불화살 */
  if (S.ram && S.ram.st !== 'burn' && Math.abs(S.px - GATE_X) < 7 && onWall()) { if (S.fireT > 0) burnRam(); else say('불이 없다 — 성벽 위 화로를 지나오자', 'nofire', 2.2); return; }
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); act(); } });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });
canvas.addEventListener('pointerdown', () => { if (S.mode === 'intro') S.introT = 99; });

function pushLadder(q) { q.st = 'pushed'; q.t = 0; S.pushed++; SFX.push(); ring(q.x, 51, 3, 0xffcf4d); for (const f of q.men) foeFall(f); say(['사다리를 밀어 넘겼다!', '넘어간다!', '또 하나!'][S.pushed % 3], null, 1.4); }
function burnRam() { const r = S.ram; r.st = 'burn'; r.t = 0; S.ramsBurned++; S.fireT = 0; ramG.userData.f.visible = true; SFX.fire(); SFX.volley(); for (let k = 0; k < 5; k++) shoot(GATE_X + (k - 2) * 0.8, r.z, true); for (const f of r.men) foeFall(f); say('불화살! — 성문 부수는 수레가 탄다', null, 2.2); hud(); }
function shoot(x0, zt, fire, xt = x0) { const v = volleys.find((v) => v.t >= 1); if (!v) return; v.t = 0; v.x0 = x0; v.x1 = xt; v.z1 = zt; v.m.visible = true; v.m.material.color.set(fire ? 0xff9a3a : 0xefe6cc); }

/* ───── 적의 수 ───── */
function spawnLadder() { const ld = ladders.find((l) => !l.on); if (!ld) return; let x = 0; for (let k = 0; k < 12; k++) { x = clamp(S.px + (R() < 0.5 ? -1 : 1) * (10 + R() * 28), 14, 106); if (Math.abs(x - GATE_X) > 8 && !S.squads.some((q) => Math.abs(q.x - x) < 7) && !(S.act === 3 && Math.abs(x - MOUND_X) < 12)) break; }
  ld.on = true; const men = []; for (let k = 0; k < 5; k++) men.push(foeNew(x - 1.6 + (k % 3) * 1.6, 2 - Math.floor(k / 3) * 1.6)); S.squads.push({ x, z: 2, st: 'run', t: 0, climb: 0, men: men.filter(Boolean), ld }); }
function spawnRam() { S.ramN++; const men = []; for (const [dx, dz] of [[-1.9, -1], [1.9, -1], [-1.9, 1.4], [1.9, 1.4]]) men.push(foeNew(GATE_X + dx, 2 + dz)); S.ram = { z: 2, st: 'roll', t: 0, hitT: 0, men: men.filter(Boolean), off: [[-1.9, -1], [1.9, -1], [-1.9, 1.4], [1.9, 1.4]] }; ramG.visible = true; ramG.userData.f.visible = false; ramG.position.set(GATE_X, 0, 2); ramG.scale.setScalar(1); SFX.horn(); say('성문 부수는 수레가 온다! — 화로를 지나 불을 붙이고 문 위에서 쏘자', 'ram' + S.ramN, 3.6); }
function fireCat(c) { const s = shots.find((s) => s.t >= 1) ; if (!s) return; const b = breaches.filter((b) => b.on && !b.fixed).length; let x = clamp(S.px + (R() - 0.5) * 22, 14, 106); if (Math.abs(x - GATE_X) < 5) x += 9; s.t = 0; s.x0 = c.x; s.z0 = c.z; s.x1 = x; s.mk = b < 2; s.r.visible = true; s.r.position.set(x, WH + 0.06, 51.5); s.m.visible = true; SFX.whoosh(); c.g.userData.arm.rotation.x = -0.9; }
function landShot(s) { SFX.thud(); S.shake = Math.max(S.shake, 0.7); ring(s.x1, 51.5, 4, 0xd0c8b8); if (Math.abs(S.px - s.x1) < 2.4 && onWall()) { S.stun = 1.4; say('돌에 스쳤다 — 붉은 고리에서는 비켜서자', null, 2); }
  if (s.mk && !breaches.some((b) => b.on && !b.fixed && Math.abs(b.x - s.x1) < 6)) { const b = breaches.find((b) => !b.on || b.fixed); if (b) { b.on = true; b.fixed = false; b.x = s.x1; b.rb.position.set(b.x, WH, 50.6); b.rb.visible = true; b.gap.position.set(b.x, WH + 0.5, 50.36); b.gap.visible = true; b.pal.visible = false; SFX.crash(); say('성벽이 무너졌다! — 통나무를 가져와 그 자리에 가만히 서서 울짱을 세우자', 'breach', 3.6); } } }

/* ───── 끝 ───── */
function finish(win) { S.mode = win ? 'dawn' : 'fall'; S.endT = 0; S.endWin = win; overBar($('work'), cam, 0, 0, 0, null); $('bAct').style.display = 'none'; SFX[win ? 'win' : 'sad'](); if (win) { S.snow = true; S.armyBack = true; S.armyMove = true; for (const f of foes) foeFall(f); } }
function endScreen() {
  const win = S.endWin, cleared = S.got + S.burned, stars = win ? (S.hp >= 5 ? 3 : S.hp >= 3 ? 2 : 1) : 0;
  const marks = `<div class="marks"><span class="${cleared >= 6 ? 'ok' : ''}">🌾 비운 들 ${cleared}/8</span><span class="${S.pushed ? 'ok' : ''}">🪜 밀어 넘긴 사다리 ${S.pushed}</span><span class="${S.fixed ? 'ok' : ''}">🪵 메운 성벽 ${S.fixed}</span><span class="${S.flagUp ? 'ok' : ''}">🚩 ${S.flagUp ? '흙산의 깃발' : '흙산 못 차지함'}</span></div>`;
  /* 까닭: 이기고 진 것이 무엇 때문이었나(역사의 전술과 이어서) */
  const why = [];
  why.push(cleared >= 6 ? '들을 비워 둔 덕에 적의 군량이 일찍 떨어졌다.' : `들에 볏가리 ${8 - cleared}개를 남겨 적이 그만큼 오래 버텼다.`);
  const worst = Object.entries(S.lossBy).sort((a, b) => b[1] - a[1])[0];
  if (worst) why.push({ ladder: '사다리를 제때 밀지 못해 성벽을 여러 번 내줬다.', gate: '성문 부수는 수레를 불화살로 막지 못했다.', mound: '흙산이 성벽보다 높아지도록 울짱을 올리지 못했다.', slow: '흙산이 무너졌을 때 머뭇거렸다.' }[worst[0]]);
  else why.push('사다리도 수레도 흙산도 하나도 넘어오지 못했다.');
  const whyHtml = `<p style="text-align:left;font-size:14px;line-height:1.6;background:rgba(255,255,255,.08);border-radius:10px;padding:8px 12px"><b>${win ? '이긴' : '진'} 까닭</b><br>· ${why.join('<br>· ')}</p>`;
  if (win) overlay(`<h1>이겼다 — 안시성을 지켰다</h1><p style="font-size:30px;letter-spacing:6px;margin:2px 0">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</p><p>남은 버팀 <b>${S.hp}</b> / ${S.hp0}. 흙산 꼭대기에 고구려 깃발이 섰고, 군량이 떨어진 대군은 첫눈 속에 물러간다.</p>${marks}${whyHtml}
      <p class="keys">역사 속 안시성도 이겼다 — 석 달 가까이 버텨 대군을 돌려보냈다.${stars < 3 ? ' 버팀을 다섯 넘게 남기면 별 셋.' : ''}</p>
      <div class="fact">📜 <b>안시성 싸움(645년)</b> — 당나라 임금이 큰 군사를 이끌고 고구려에 쳐들어왔다. 안시성 사람들은 여러 달을 버텨 물리쳤다.<br>📜 <b>들 비우기</b> — 고구려는 싸움이 나면 들의 곡식을 거두거나 태우고 산성에 들어가 지켰다. 먼 길을 온 군대는 먹을 것이 떨어진다.<br>📜 <b>흙산</b> — 당군은 두 달 가까이 걸려 성벽보다 높은 흙산을 쌓았다. 그 흙산이 무너지자 고구려군이 달려 나가 차지했다.<br>📜 <b>성주의 이름</b> — 안시성을 지킨 성주의 이름은 그때 기록에 남아 있지 않다. 「양만춘」이라는 이름은 훨씬 뒷날의 책에 나온다.</div>`,
      stars < 3 ? '별 셋에 다시 도전' : '한 번 더', () => { resetRound(true); S.mode = 'play'; });
  else overlay(`<h1>졌다 — 성벽을 내줬다</h1><p>적의 군량이 <b>${Math.round(clamp(S.supply, 0, 1) * 100)}%</b> 남았을 때 버팀이 다했다. 사람들을 데리고 안쪽 성벽으로 물러났다.</p>${marks}${whyHtml}
      <p class="keys">역사 속 안시성은 끝까지 버텨 이겼다. 다시 해 보자 — ${S.round + 1}번째 싸움.</p>`,
      '다시 싸운다', () => { S.round++; S.hp0 = Math.max(6, S.hp0 - 1); resetRound(false); S.mode = 'play'; say('대군이 다시 온다 — 들부터 비우자', null, 3); });
}

/* ───── 하늘: 가을 낮 → 흐림 → 비 → 눈 ───── */
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); let lastSky = -1;
function lightFor() { const k = clamp(S.t / TOTAL, 0, 1), storm = clamp(S.rainK, 0, 1), snow = S.snow ? clamp(S.endT / 4, 0, 1) : 0;
  cT.set(0x6aa0e0).lerp(tc.set(0x8a93a4), clamp(k * 1.1, 0, 1)).lerp(tc.set(0x4a5260), storm * 0.8).lerp(tc.set(0xaab4c4), snow);
  cL.set(0xe6eef2).lerp(tc.set(0xd8cdb8), clamp(k * 1.2, 0, 1)).lerp(tc.set(0x7f8894), storm * 0.8).lerp(tc.set(0xe4e8ee), snow);
  const key = k + storm * 3 + snow * 7; if (Math.abs(key - lastSky) > 0.004) { sky.paint(cT, cL); lastSky = key; } scene.fog.color.copy(cL);
  sun.intensity = lerp(2.2, 1.3, k) * (1 - storm * 0.55); hemi.intensity = lerp(1.25, 1.0, k) * (1 - storm * 0.25) + snow * 0.3; }

/* ───── 한 걸음 ───── */
const moundTop = () => S.moundH, wallTopAt = () => WH + 0.9 + S.pal * 0.85;
function yAt(x, z) { if (S.act === 1) return 0; if (z >= 50.4) return WH; const k = clamp((50.4 - z) / (50.4 - MOUND_Z - 1), 0, 1); return lerp(WH - 0.4, S.moundH, k); }
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt); S.shake = Math.max(0, S.shake - dt * 1.8);
  flag0.userData.c.rotation.y = Math.sin(S.t * 3) * 0.18; if (flagM.visible) flagM.userData.c.rotation.y = Math.sin(S.t * 3.4) * 0.2;
  for (const v of volleys) if (v.t < 1) { v.t += dt * 1.6; const k = v.t; v.m.position.set(lerp(v.x0, v.x1, k), WH + 1 + Math.sin(k * Math.PI) * 4 - k * (WH + 0.4), lerp(50.4, v.z1, k)); v.m.rotation.x = -0.5 + k * 1.3; if (v.t >= 1) v.m.visible = false; }
  if (wx.m.visible) { const sp = S.snow ? 5 : 34; for (let i = 0; i < wx.N; i++) { wx.p[i * 3 + 1] -= sp * dt; if (S.snow) wx.p[i * 3] += Math.sin(S.t + i) * dt * 0.8; if (wx.p[i * 3 + 1] < 0) wx.p[i * 3 + 1] = 40; } wx.m.geometry.attributes.position.needsUpdate = true; }
  if (S.mode === 'title' || S.mode === 'intro') { S.armyZ = -150; if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.6) { S.mode = 'play'; S.t = 0; SFX.drum(0.35); say('대군이 온다 — 볏가리 곁에 가만히 서면 든다. 성문 앞 고리로 나르자', null, 4); } } placeAll(dt); return; }
  if (S.mode === 'dawn' || S.mode === 'fall') { S.endT += dt; if (S.mode === 'dawn') { S.armyZ -= dt * 5; wx.m.visible = true; wx.m.material.size = 0.34; wx.m.material.color.set(0xffffff); S.rainK = Math.max(0, S.rainK - dt * 0.3); } lightFor(); if (S.endT > 6 && !S.shown) { S.shown = true; endScreen(); } placeAll(dt); return; }
  if (S.mode !== 'play') return;
  S.at += dt; lightFor(); hud(); if (S.stun > 0) S.stun -= dt; if (S.fireT > 0) { S.fireT -= dt; if (S.fireT <= 0) hud(); }

  /* ── 1막: 들 비우기 ── */
  if (S.act === 1) {
    S.armyZ = lerp(-150, 22, clamp(S.at / T1, 0, 1)); const front = S.armyZ + 1;
    if (S.at > T1 * 0.55) say('대군이 가까워진다 — 못 들일 볏가리는 태우자' + (ctl.isTouch ? '(「태우기」)' : '(스페이스)'), 'near', 3.4);
    for (const s of stacks) if (s.st === 'burn') { s.bt += dt; s.m.scale.setScalar(Math.max(0.01, 1.25 * (1 - s.bt / 5))); s.f.scale.setScalar(0.9 + Math.sin(S.t * 13) * 0.15); if (s.bt > 5) { s.st = 'gone'; s.m.visible = s.f.visible = false; } }
    for (const s of stacks) if (s.st === 'field' && s.z < front + 2) { s.st = 'taken'; s.m.visible = false; ring(s.x, s.z, 3, 0xb02a22); say('볏가리 하나가 적의 손에 들어갔다 — 적의 군량이 는다', null, 2.2); }
    const done = stacks.every((s) => s.st !== 'field') && S.carry !== 'stack';
    if (S.at >= T1 || (done && dist(S.px, S.pz, TAKE[0], TAKE[1]) < 5) || S.pz < front + 3) { if (S.pz < front + 3) { S.carry = null; say('적이 코앞이다 — 겨우 성문으로 뛰어들었다', null, 2.6); } toAct(2); }
  }
  /* ── 2·3막: 사다리 · 수레 · 돌 · 활 ── */
  if (S.act >= 2) {
    const hard = clamp((S.act === 2 ? S.at / S.T2 : 1), 0, 1);
    S.spawnT -= dt; if (S.spawnT <= 0 && !S.ramp) { spawnLadder(); S.spawnT = (S.act === 3 ? 26 : lerp(18, 13, hard)) / S.vigor; }
    if (S.act === 2 && !S.ram && ((S.ramN === 0 && S.at > 30) || (S.ramN === 1 && S.at > S.T2 * 0.66))) spawnRam();
    if (S.act === 2 && S.at > 24) { cats.forEach((c) => (c.g.visible = true)); S.catT -= dt; if (S.catT <= 0) { S.catT = lerp(13, 10, hard); fireCat(cats[Math.floor(R() * 2)]); say('돌이 날아온다 — 붉은 고리에서 비켜서자', 'cat1', 3); } }
    for (const c of cats) c.g.userData.arm.rotation.x = lerp(c.g.userData.arm.rotation.x, 0.5, 0.05);
    for (const s of shots) if (s.t < 1) { s.t += dt / 2.3; const k = s.t; s.m.position.set(lerp(s.x0, s.x1, k), 3 + Math.sin(k * Math.PI) * 22 + k * (WH - 2), lerp(s.z0, 51.5, k)); s.m.rotation.x += dt * 5; s.r.scale.setScalar(0.4 + k * 0.6); s.r.material.opacity = 0.3 + k * 0.4; if (s.t >= 1) { s.m.visible = s.r.visible = false; landShot(s); } }
    /* 사다리 무리 */
    for (const q of S.squads) { q.t += dt; const alive = q.men.filter((f) => f.on && f.st !== 'fall');
      if (q.st === 'run') { q.z = Math.min(48.4, q.z + dt * 5.2 * S.vigor); q.men.forEach((f, k) => { if (f.on && f.st !== 'fall') { f.z = q.z - Math.floor(k / 3) * 1.6; f.moving = true; } });
        if (!alive.length) { q.st = 'dead'; q.ld.on = false; } else if (q.z >= 48.4) { q.st = 'climb'; q.climb = 0; q.ld.g.visible = true; q.ld.g.position.set(q.x, 0, 48.7); q.ld.g.rotation.set(0.3, 0, 0); SFX.thud(); } }
      else if (q.st === 'climb') { const br = breaches.some((b) => b.on && !b.fixed && Math.abs(b.x - q.x) < 6); q.climb += dt / (br ? 9 : 12) * S.vigor;
        alive.forEach((f, k) => { const c = clamp(q.climb * 1.25 - k * 0.14, 0, 1); f.x = q.x + (k % 2 ? 0.25 : -0.25); f.z = lerp(48.2, 49.9, c); f.y = c * (WH + 0.2); f.moving = c > 0 && c < 1; });
        if (q.climb >= 1) { q.st = 'over'; q.t = 0; for (const f of q.men) foeFall(f); hurt(1, '성벽을 넘어왔다! — 사다리 위에 서서 ' + (ctl.isTouch ? '「밀기」' : '스페이스'), 'ladder'); }
        if (!alive.length) { q.st = 'pushed'; q.t = 0; } }
      else if (q.st === 'pushed' || q.st === 'over') { q.ld.g.rotation.x = Math.max(-1.3, 0.3 - q.t * 2.6); if (q.t > 0.9) { q.ld.g.visible = false; q.ld.on = false; q.st = 'dead'; } } }
    S.squads = S.squads.filter((q) => q.st !== 'dead');
    /* 수레 */
    if (S.ram) { const r = S.ram; r.t += dt;
      if (r.st === 'roll') { r.z = Math.min(46, r.z + dt * 2.5 * S.vigor); if (r.z >= 46) { r.st = 'hit'; r.hitT = 1.2; say('수레가 성문을 친다!', null, 2); } }
      else if (r.st === 'hit') { r.hitT -= dt; ramG.userData.log.position.z = 0.6 + Math.max(0, Math.sin((2.2 - r.hitT) / 2.2 * Math.PI)) * 1.6; ramG.userData.head.position.z = ramG.userData.log.position.z + 3; if (r.hitT <= 0) { r.hitT = 2.4; S.gateHP--; SFX.thud(); S.shake = 0.6; ring(GATE_X, 49, 3, 0xff6a3a); if (S.gateHP <= 0) { hurt(2, '성문이 부서졌다! — 안에서 겨우 다시 막았다', 'gate'); r.st = 'burn'; r.t = 0; for (const f of r.men) foeFall(f); S.gateHP = 6; } } }
      else if (r.st === 'burn') { ramG.scale.setScalar(Math.max(0.01, 1 - r.t / 3.5)); ramG.userData.f.scale.setScalar(1 + Math.sin(S.t * 12) * 0.2); if (r.t > 3.5) { ramG.visible = false; S.ram = null; } }
      if (S.ram && r.st !== 'burn') { ramG.position.z = r.z; r.men.forEach((f, k) => { if (f.on && f.st !== 'fall') { f.z = r.z + r.off[k][1]; f.moving = r.st === 'roll'; } }); if (!r.men.some((f) => f.on && f.st !== 'fall')) r.st0 = 1; } }
    /* 성 위의 활: 다가오는 무리를 줄인다(들인 볏가리가 많을수록 자주) */
    S.shootT -= dt; if (S.shootT <= 0) { S.shootT = Math.max(1.5, 3.4 - S.got * 0.22); const tg = S.squads.filter((q) => q.st === 'run' && q.z > 14).sort((a, b) => b.z - a.z)[0];
      if (tg) { const f = tg.men.find((f) => f.on && f.st !== 'fall'); const g = guards.slice().sort((a, b) => Math.abs(a.x - tg.x) - Math.abs(b.x - tg.x))[0]; if (f && !breaches.some((b) => b.on && !b.fixed && Math.abs(b.x - g.x) < 5)) { shoot(g.x, f.z, false, f.x); SFX.volley(); const ff = f; setTimeoutS(0.6, () => foeFall(ff)); } } }
  }
  /* ── 3막: 흙산 ── */
  if (S.act === 2 && S.at >= S.T2) toAct(3);
  if (S.act === 3) {
    if (!S.ramp) { S.moundH = Math.min(9, S.moundH + dt * 0.115 * S.vigor); moundM.scale.y = Math.max(0.01, S.moundH); moundM.position.y = S.moundH / 2;
      if (!S.moundFoes) { S.moundFoes = []; for (let k = 0; k < 8; k++) { const f = foeNew(MOUND_X - 7 + k * 2, 30 - (k % 3) * 2); if (f) { f.k = k; S.moundFoes.push(f); } } }
      for (const f of S.moundFoes) if (f.on && f.st !== 'fall') { const c = (S.t * 0.16 + f.k / 8) % 1, up = c < 0.5 ? c * 2 : 2 - c * 2; f.x = MOUND_X - 6 + f.k * 1.6; f.z = lerp(22, MOUND_Z - 2, up); f.y = up > 0.8 ? S.moundH * (up - 0.8) * 5 * 0.9 : 0; f.dir = c < 0.5 ? Math.PI / 2 : -Math.PI / 2; f.moving = true; }
      if (S.moundH > wallTopAt()) { S.overT += dt; say('흙산이 성벽보다 높아졌다! — 통나무로 울짱을 더 올리자', 'over', 3); if (S.overT > 9) { S.overT = 0; hurt(1, '흙산 위에서 화살이 쏟아진다!', 'mound'); } } else S.overT = Math.max(0, S.overT - dt);
      if (S.at > T3_RAIN) { S.rainK = Math.min(1, S.rainK + dt * 0.25); if (!wx.m.visible) { wx.m.visible = true; wx.m.material.size = 0.2; wx.m.material.color.set(0xcfe0ff); SFX.thunder(); say('큰비가 온다…', null, 2.4); } }
      if (S.at > T3_FALL) collapse(); }
    else { /* 큰 순간: 무너진 흙산으로 달려 나간다 */
      S.assaultT += dt; guards.forEach((g, i) => { const tx = MOUND_X - 3 + (i % 4) * 2, tz = Math.max(MOUND_Z + 1.5 + Math.floor(i / 4) * 2.2, S.pz - 1 + Math.floor(i / 4) * 2); g.x += clamp(tx - g.x, -1, 1) * dt * 5.4; if (Math.abs(g.x - tx) < 3) g.z += clamp(tz - g.z, -1, 1) * dt * 4.2; });
      for (const f of S.moundFoes || []) if (f.on && f.st !== 'fall') { f.moving = false; if (dist(f.x, f.z, S.px, S.pz) < 3.4 || guards.some((g) => dist(f.x, f.z, g.x, g.z) < 2.2)) { foeFall(f); SFX.volley(); } }
      const top = dist(S.px, S.pz, MOUND_X, MOUND_Z + 0.5) < 2.6;
      if (top && !S.moving) { S.plantT += dt; if (S.plantT > 2.2) { S.flagUp = true; flagM.visible = true; flagM.position.set(MOUND_X, S.moundH, MOUND_Z); ring(MOUND_X, MOUND_Z, 8, 0xffcf4d); say('흙산 꼭대기에 깃발을 꽂았다!', null, 3); hud(); finish(true); } } else S.plantT = 0;
      if (S.assaultT > 22) { S.assaultT = 16; hurt(1, '머뭇거리는 사이 적이 흙산으로 몰려온다 — 꼭대기로!', 'slow'); } }
  }

  /* ── 나 ── */
  let { ix, iz, back } = ctl.read(dt); if (S.stun > 0) ix = iz = 0;
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 5.4 : 3.4) * (back ? 0.6 : 1) * (S.carry ? 0.85 : 1); let nx = S.px + ix * sp * dt, nz = S.pz + iz * sp * dt;
    if (S.act === 1) { nx = clamp(nx, 8, 112); nz = clamp(nz, 6, 48.4); }
    else { const onR = S.ramp && nx > 88 && nx < 96; nz = clamp(nz, onR ? MOUND_Z - 0.5 : 50.7, 52.3); if (nz < 50.6) nx = clamp(nx, 88.2, 95.8); nx = clamp(nx, 10, 110); }
    S.px = nx; S.pz = nz; if (S.view !== 2) S.pdir = Math.atan2(iz, ix); S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.4; noise(0.05, 0.06, 300); } }
  S.py = yAt(S.px, S.pz);

  /* 가만히 서서: 볏가리 들기 · 통나무 들기 · 울짱 세우기 */
  let job = null, need = 1, jb = null;
  if (S.act === 1) { if (!S.carry) { jb = stacks.find((s) => s.st === 'field' && dist(S.px, S.pz, s.x, s.z) < 2.4); if (jb) { job = 'stack'; need = 0.6; } }
    if (S.carry === 'stack' && dist(S.px, S.pz, TAKE[0], TAKE[1]) < 2.6) { S.carry = null; S.got++; SFX.drop(); ring(TAKE[0], TAKE[1], 3, 0xffcf4d); say(`볏가리를 들였다 — 적의 군량은 줄고, 성 위의 활은 더 자주 쏜다 (${S.got})`, null, 2); hud(); } }
  else if (onWall()) {
    for (const bx of BRAZ) if (Math.abs(S.px - bx) < 1.5 && S.fireT < 8 && S.carry !== 'log') { S.fireT = 16; SFX.fire(); say('화살에 불을 붙였다 — 성문 위에서 ' + (ctl.isTouch ? '「쏘기」' : '스페이스'), 'fire1', 2.6); hud(); }
    if (!S.carry) for (const lx of LOGS) if (Math.abs(S.px - lx) < 1.6) { job = 'log'; need = 0.5; }
    if (S.carry === 'log') { jb = breaches.find((b) => b.on && !b.fixed && Math.abs(b.x - S.px) < 2.4); if (jb) { job = 'fix'; need = 1.1; } else if (S.act === 3 && !S.ramp && Math.abs(S.px - MOUND_X) < 5.5 && S.pal < 3) { job = 'pal'; need = 0.9; } } }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  overBar($('work'), cam, S.px, S.py + 2.6, S.pz, job && S.workT > 0.05 ? S.workT / need : (S.ramp && S.plantT > 0.05 ? S.plantT / 2.2 : null));
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'stack') { jb.st = 'carried'; jb.m.visible = false; S.carry = 'stack'; SFX.pick(); say('볏가리 — 성문 앞 고리로', 'pick1', 2.2); }
    if (job === 'log') { S.carry = 'log'; SFX.pick(); say(S.act === 3 ? '통나무 — 흙산 앞 성벽이나 무너진 곳으로' : '통나무 — 무너진 성벽 자리에 가만히 서면 울짱을 세운다', 'log1', 2.6); }
    if (job === 'fix') { jb.fixed = true; jb.rb.visible = jb.gap.visible = false; jb.pal.position.set(jb.x, WH, 50.4); jb.pal.visible = true; S.carry = null; S.fixed++; SFX.drop(); ring(jb.x, 51.5, 3, 0xffcf4d); say('나무 울짱으로 무너진 곳을 메웠다', null, 2); }
    if (job === 'pal') { S.pal++; palUp.children[S.pal - 1].visible = true; S.carry = null; SFX.drop(); ring(MOUND_X, 51.5, 5, 0xffcf4d); say(`울짱을 올렸다 — 성벽이 ${S.pal}단 높아졌다`, null, 2); }
    hud(); }
  $('bAct').style.display = ctl.isTouch && S.mode === 'play' ? 'flex' : 'none'; $('bAct').textContent = S.act === 1 ? '태우기' : S.ram && Math.abs(S.px - GATE_X) < 7 ? '쏘기' : '밀기';
  placeAll(dt);

  /* 조임 */
  const climb = Math.max(0, ...S.squads.filter((q) => q.st === 'climb').map((q) => q.climb)), moundK = S.act === 3 && !S.ramp ? clamp((S.moundH - (wallTopAt() - 1.6)) / 1.6, 0, 1) : 0;
  const tension = clamp(Math.max(S.act === 1 ? clamp((S.at / T1 - 0.6) * 2.5, 0, 1) * 0.6 : 0, climb * 0.9, S.ram && S.ram.st === 'hit' ? 0.7 : 0, moundK * 0.8, S.ramp ? 0.75 : 0, S.hp <= 2 ? 0.5 : 0), 0, 1);
  S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.38, tension); SFX.beat(0.06 + tension * 0.28); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(200,40,20,${tension * 0.42})`;
}
const timers = []; function setTimeoutS(sec, fn) { timers.push({ t: S.t + sec, fn }); }
function collapse() { S.ramp = true; S.assaultT = 0; S.carry = null; S.workT = 0; S.moundH = WH + 0.3; moundM.scale.set(1.25, S.moundH, 1.15); moundM.position.set(MOUND_X, S.moundH / 2, MOUND_Z + 1.5);
  rampM.visible = true; rampM.position.set(MOUND_X, WH - 0.4, 46.6); rampM.rotation.x = 0; palUp.children.forEach((r) => (r.visible = false));
  for (const b of breaches) if (b.on && !b.fixed && Math.abs(b.x - MOUND_X) < 8) { b.fixed = true; b.rb.visible = b.gap.visible = false; }
  SFX.thunder(); SFX.crash(); S.shake = 1.6; ring(MOUND_X, 46, 14, 0xd8c8a0); for (const q of S.squads) { for (const f of q.men) foeFall(f); q.st = 'pushed'; q.t = 0; }
  say('흙산이 무너져 성벽에 기댔다! — 지금이다, 달려 나가 꼭대기에 깃발을!', null, 5); hud(); }

function placeAll(dt) {
  for (let i = timers.length - 1; i >= 0; i--) if (S.t >= timers[i].t) { timers[i].fn(); timers.splice(i, 1); }
  pMesh.position.set(S.px, S.py, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving); pRing.position.set(S.px, S.py + 0.11, S.pz);
  carryStack.visible = S.carry === 'stack'; carryLog.visible = S.carry === 'log'; carryFire.visible = S.fireT > 0 && S.mode === 'play';
  if (S.carry === 'stack') carryStack.position.set(S.px, S.py + 2.0, S.pz); if (S.carry === 'log') { carryLog.position.set(S.px, S.py + 2.1, S.pz); carryLog.rotation.y = pMesh.rotation.y; } if (carryFire.visible) carryFire.position.set(S.px + 0.5, S.py + 2.3, S.pz);
  for (const g of guards) { g.m.position.set(g.x, yAt(g.x, g.z), g.z); walkAnim(g.m, S.t * 12 + g.x0, S.ramp && S.mode === 'play'); }
  for (const t of [...takers, ...towns]) walkAnim(t, 0, false);
  foesDraw(dt || 0.016); armyDraw();
  /* 그림 꼬리표: 사다리(차오름) · 성문 · 흙산 */
  let ti = 0; const put = (x, y, z, html, k, need) => { const d = tags[ti++]; if (!d) return; const q = v3.set(x, y, z).project(cam); if (q.z > 1) { d.style.display = 'none'; return; } d.style.display = 'block'; d.style.left = clamp(((q.x + 1) / 2) * innerWidth, 50, innerWidth - 50) + 'px'; d.style.top = clamp(((1 - q.y) / 2) * innerHeight, 150, innerHeight - 150) + 'px'; d.className = 'tag' + (need ? ' hot' : ''); const ic = d.querySelector('.ic'); if (ic._h !== html) { ic.innerHTML = html; ic._h = html; } d.querySelector('.fill').style.display = k == null ? 'none' : ''; if (k != null) d.querySelector('.fill i').style.width = clamp(k, 0, 1) * 100 + '%'; };
  if (S.mode === 'play') { for (const q of S.squads) if (q.st === 'climb') put(q.x, WH + 3.4, 50, '🪜', q.climb, q.climb > 0.5);
    if (S.ram && S.ram.st !== 'burn') put(GATE_X, WH + 4.6, 50, S.ram.st === 'hit' ? `🚪 ${'▮'.repeat(S.gateHP)}` : '🔥 수레', S.ram.st === 'hit' ? null : S.ram.z / 46, S.ram.st === 'hit');
    for (const b of breaches) if (b.on && !b.fixed) put(b.x, WH + 3, 50.5, '🪵 무너짐', null, true);
    if (S.act === 3 && !S.ramp) put(MOUND_X, Math.max(S.moundH, WH) + 5.5, 46, `⛰ 흙산 ${S.moundH > wallTopAt() ? '넘었다!' : ''}`, S.moundH / wallTopAt(), S.moundH > wallTopAt() - 1);
    if (S.ramp) put(MOUND_X, S.moundH + 4.5, MOUND_Z, '🚩 여기!', null, true); }
  for (; ti < tags.length; ti++) tags[ti].style.display = 'none';
}
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 4, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(60, 60, e), lerp(9, 24, e), lerp(74, 72, e)); cam.lookAt(60, lerp(6, 3, e), lerp(30, 20, e)); if (cam.fov !== 50) { cam.fov = 50; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'dawn') { v3.set(MOUND_X - 16, 15, 66); cam.position.lerp(v3, 0.03); cam.lookAt(MOUND_X - 6, 4, 20); }
  else if (S.mode === 'fall') { v3.set(60, 22, 76); cam.position.lerp(v3, 0.03); cam.lookAt(60, 3, 40); }
  else { followCam(cam, S, { W, H, clampX: [-10, W + 10], clampZ: [0, H], farH: [25, 31], farBk: [30, 36], farFov: 50, lookY: 4, aheadFar: 24, nearH: [12, 15], nearBk: [15, 18], map: { h: [120, 190], z: 16, look: -2, fov: 50 } });
    if (S.shake > 0 && S.view !== 3) { cam.position.x += Math.sin(S.t * 47) * 0.2 * S.shake; cam.position.y += Math.sin(S.t * 61) * 0.15 * S.shake; } }
  /* 가장 급한 것 하나를 가장자리 빛으로 */
  let g = null; if (S.mode === 'play') { if (S.act === 1) g = S.carry === 'stack' ? [TAKE[0], 1, TAKE[1]] : null; else if (S.ramp) g = [MOUND_X, S.moundH + 1, MOUND_Z]; else { const q = S.squads.filter((q) => q.st === 'climb').sort((a, b) => b.climb - a.climb)[0]; if (S.ram && S.ram.st === 'hit') g = [GATE_X, WH + 1, 51]; else if (q) g = [q.x, WH + 1, 51]; else if (S.act === 3) g = [MOUND_X, WH + 1, 51]; } }
  edgeGoal($('goal'), cam, g ? v3.set(g[0], g[1], g[2]).clone() : v3.set(0, 0, 0).clone(), !!g, 0.82);
}

/* ───── 미션: 지금 할 일 하나 ───── */
const nearStack = () => stacks.filter((s) => s.st === 'field').sort((a, b) => dist(S.px, S.pz, a.x, a.z) - dist(S.px, S.pz, b.x, b.z))[0];
const mis = missions(scene, cam, [
  { t: '볏가리를 성문 앞으로 들이기', how: '볏가리 곁에 가만히 서면 든다 → 성문 앞 노란 고리까지', done: () => S.got >= 1 || S.act > 1, n: () => [S.got, 1], at: () => (S.act !== 1 ? null : S.carry === 'stack' ? TAKE : (nearStack() ? [nearStack().x, nearStack().z] : null)), tag: () => (S.carry === 'stack' ? '⬇ 여기로' : '🌾 가만히 서서 들기') },
  { t: '못 들일 볏가리는 태우기', how: (tc) => '멀리 있는 볏가리 곁에서 ' + (tc ? '「태우기」' : '<kbd>스페이스</kbd>') + ' — 적이 먹을 것을 남기지 않는다', done: () => S.burned >= 1 || S.act > 1, at: () => { const s = S.act === 1 && nearStack(); return s ? [s.x, s.z] : null; }, tag: '🔥 태우기' },
  { t: '사다리 밀어 넘기기', how: (tc) => '🪜 가 뜬 자리 성벽 위에 서서 ' + (tc ? '「밀기」' : '<kbd>스페이스</kbd>'), done: () => S.pushed >= 1, at: () => { const q = S.squads.filter((q) => q.st === 'climb').sort((a, b) => b.climb - a.climb)[0]; return q ? [q.x, 51.5] : null; }, tag: '🪜 밀기!' },
  { t: '불화살로 수레 태우기', how: (tc) => '화로(불)를 지나면 화살에 불이 붙는다 → 성문 위에서 ' + (tc ? '「쏘기」' : '<kbd>스페이스</kbd>'), done: () => S.ramsBurned >= 1, at: () => (S.ram && S.ram.st !== 'burn' ? (S.fireT > 0 ? [GATE_X, 51.5] : [BRAZ.slice().sort((a, b) => Math.abs(a - S.px) - Math.abs(b - S.px))[0], 51.5]) : null), tag: () => (S.fireT > 0 ? '🏹 여기서 쏘기' : '🔥 불 붙이기') },
  { t: '무너진 성벽을 울짱으로 메우기', how: '통나무 더미 곁에 가만히 서면 든다 → 🪵 무너진 자리에 가만히 서기', done: () => S.fixed >= 1, at: () => { const b = breaches.find((b) => b.on && !b.fixed); if (!b) return null; return S.carry === 'log' ? [b.x, 51.5] : [LOGS.slice().sort((a, c) => Math.abs(a - S.px) - Math.abs(c - S.px))[0], 51.5]; }, tag: () => (S.carry === 'log' ? '🪵 여기 가만히' : '🪵 통나무 들기') },
  { t: '흙산 꼭대기에 깃발 꽂기', how: '흙산이 무너지면 그 틈으로 달려 나가 꼭대기에 가만히 선다', done: () => S.flagUp, at: () => (S.ramp ? [MOUND_X, MOUND_Z + 0.5] : S.act === 3 ? (S.carry === 'log' ? [MOUND_X, 51.5] : S.pal < 3 ? [72, 51.5] : null) : null), tag: () => (S.ramp ? '🚩 꼭대기로!' : S.carry === 'log' ? '🪵 울짱 올리기' : '🪵 통나무 들기') },
], { allText: '🎉 안시성을 지켜 냈다!', groundY: (x, z) => yAt(x, z) });

resetRound(true); placeAll(0.016);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.horn(); };
runLoop((dt) => { update(dt); mis.update(dt, S.mode === 'play'); }, view, () => renderer.render(scene, cam));
window.__scene = { S, update, keys, ctl, act, stacks, breaches, foes, guards,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  walk(pts, run, maxSec = 60) { let t = 0; for (const [x, z] of pts) { let stuck = 0; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz), ox = S.px, oz = S.pz; ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - ox, S.pz - oz) < 0.005) { if (++stuck > 20) break; } else stuck = 0; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  const: { TAKE, BRAZ, LOGS, MOUND_X, MOUND_Z, GATE_X, T1, T2, T3_FALL } };
