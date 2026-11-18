/* 케이월드 · 첫 겨울 — 신석기 한 장면(S02, 2026-11-17). 본보기 = 그믐밤, 공통 부품 = ../scene/kit.js.
   목표는 하나(우리 움집 앞 토기 셋 — 채울수록 밝아진다)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 첫눈까지 못 채우면 다음 해 밭이 작아진다.
   흐름: 밭에서 가만히 서면 이삭을 벤다(한 번에 셋까지) → 건조대에 널면 마른다 → 마른 이삭을 갈판에서 박자 맞춰 간다 → 토기에 붓는다.
   조여 오는 것: 철(잎 색·하늘, 끝에 첫눈) · 멧돼지(밭을 파헤침) · 비(덮지 않으면 널어 둔 이삭이 썩음) · 새 떼(널어 둔 이삭을 쪼아 먹음).
   좌표: x 동쪽(+), z 남쪽(+). 강은 남쪽(z 52~), 밭은 동쪽, 숲은 북쪽·동쪽. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, box, at, canvasTex, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, groundAt, runLoop, loadArt, ART, art, artOwn, artInst, artGeo, artMat, artGlowMat, missions } from '../scene/kit.js?v=4';
await loadArt('people', 'nature', 'winter');   /* 블렌더로 만든 모델 — winter = 이 장면에만 쓰는 것(움집·나무·조·토기·건조대·갈판·강가 살림·개·멧돼지·새 …, tools/blender/make_winter.py) */

const W = 80, H = 60;
const BX = [4, 76], BZ = [6, 50];
const SEASON = 320;

/* ───── 무대 ───── */
const OURS = [30, 19], HOUSES = [[30, 19, 3.3], [18.5, 14.5, 3.0], [42, 12.5, 3.0]];
const POTS = [[27.6, 25.2], [30, 25.6], [32.4, 25.2], [34.8, 24.6]];   /* 넷째는 구워야 생긴다 */
const RACK = [37.5, 28.5], MAT = [40.6, 28.8], GRIND = [24.6, 28.6], HEARTH = [20.5, 30.5], POTTER = [17.4, 33];
const CLAY = [16, 48.6], WEIGHTS = [33.5, 48.8], NET = [46, 49.4];
const FIELD = [47, 19, 69, 40], COLS = 6, ROWS = 4;
const FIELD_BY_YEAR = [24, 18, 13];
const BOAR0 = [76, 13], DOG0 = [9, 25];
const SOLID = [];
for (const [x, z, r] of HOUSES) SOLID.push([x - r * 0.8, z - r * 0.8, x + r * 0.8, z + r * 0.8, 3.4, 'house']);
SOLID.push([RACK[0] - 1.8, RACK[1] - 0.25, RACK[0] + 1.8, RACK[1] + 0.25, 1.6, 'rack']);
const TREES_IN = [[12, 40, 2.2], [36, 38, 2.4], [58, 46, 2.0], [8, 12, 2.4], [52, 10, 2.6], [70, 46, 2.2]];
for (const [x, z] of TREES_IN) SOLID.push([x - 0.5, z - 0.5, x + 0.5, z + 0.5, 3, 'tree']);

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xf2d9b0, 80, 220], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x6a7a3a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff1d6, intensity: 2.1, box: [48, 36], far: 160, pos: [W / 2 - 34, 50, H / 2 + 30], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261118);
const sky = skyDome(scene, rnd, { top: 0x78aee8, low: 0xffe6c0 });
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* 꾸밈 도구 — 꾸밈에는 rndA 만 쓴다. 놀이의 난수 rnd 는 예전과 똑같은 차례로 흘러가게 둔다(풀 자리 → 숲 자리 → 밭 자리 → 눈) */
const rndA = rng(1118);
const ownMat = () => artMat.clone();
const mesh = (name, mat = artMat, shadow = true) => { const m = new THREE.Mesh(artGeo(name), mat); m.castShadow = shadow; m.receiveShadow = true; return m; };
const put = (m, x, z, ry = 0, s = 1, y = 0) => { m.position.set(x, y, z); m.rotation.y = ry; m.scale.setScalar(s); scene.add(m); return m; };
const inst = (name, list, mat, shadow = false, tints = {}) => { const m = artInst(scene, name, list, tints, { shadow }); if (m && mat) m.material = mat; return m; };
const blank = (n) => Array.from({ length: n }, () => [0, -50, 0, 0.0001, 0]);
const popMat = (e) => { const m = artMat.clone(); m.emissive.set(e); return m; };   /* 집는 것이 눈에 띄게 살짝 빛나는 재질 */

/* 땅 — 철 따라 풀빛이 바래고, 첫눈에 하얘진다 */
const ground = flat(-60, -30, W + 60, H + 10, 0x86c25a, 0);
const groundC0 = new THREE.Color(0x86c25a), groundC1 = new THREE.Color(0xc8b26a), groundC2 = new THREE.Color(0xeef3f8);
const sand = flat(0, 46.5, W, 52.2, 0xe2cc98, 0.03);
flat(-60, 52, W + 60, H + 60, 0x3d8fd0, 0.05);
const soil = flat(44, 17, 72, 42, 0x9a7a4a, 0.03);                         /* 밭흙 */
const yard = flat(16, 22, 44, 36, 0xcdb27e, 0.035);                        /* 마을 마당 */
const whiten = [[sand, new THREE.Color(0xe2cc98)], [soil, new THREE.Color(0x9a7a4a)], [yard, new THREE.Color(0xcdb27e)]];
/* 풀밭 얼룩(예전 풀 자리 그대로) · 숲 바닥 얼룩 · 마당·밭·모래 가장자리를 삐뚤빼뚤하게 — 색은 철 따라 땅과 함께 바뀐다 */
const tuftPts = []; for (let i = 0; i < 110; i++) { const x = 4 + rnd() * 72, z = 6 + rnd() * 40; if (inRect(x, z, [43, 16, 73, 43]) || inRect(x, z, [15, 21, 45, 37])) continue; tuftPts.push([x, z, 0.8 + rnd() * 1.4, 0.8 + rnd() * 1.4]); }
const patchMatA = ownMat(), patchMatB = ownMat(), shadeMat = ownMat(), tuftMat = ownMat(), hillMat = ownMat(), tuftC0 = new THREE.Color(0x74b84e), tuftC1 = new THREE.Color(0xcdb561), hillC0 = new THREE.Color(0x6fa862), hillC1 = new THREE.Color(0xb89a58);
{ const A = [], B = [];
  tuftPts.forEach(([x, z, w, d], i) => (i % 2 ? A : B).push([x, (i % 2 ? 0.012 : 0.004) + (i % 3) * 0.002, z, [w * 0.8, 1, d * 0.8], rndA() * 6.28]));
  for (let i = 0; i < 46; i++) { const x = -24 + rndA() * 128, z = i % 3 ? -26 + rndA() * 31 : 4 + rndA() * 42; if (z > 5 && x > 2 && x < 78) continue; (i % 2 ? A : B).push([x, (i % 2 ? 0.012 : 0.004) + (i % 3) * 0.002, z, [1.6 + rndA() * 2.2, 1, 1.4 + rndA() * 1.8], rndA() * 6.28]); }
  inst('wblot', A, patchMatA); inst('wblot', B, patchMatB);
  const edge = (x0, z0, x1, z1, step, y, c0, sc = 1) => { const L = [], mt = ownMat(); const side = (ax, az, bx, bz) => { const n = Math.round(Math.hypot(bx - ax, bz - az) / step); for (let i = 0; i <= n; i++) { const t = (i + (rndA() - 0.5) * 0.6) / n; L.push([ax + (bx - ax) * t + (rndA() - 0.5) * 0.9, y + (L.length % 4) * 0.002, az + (bz - az) * t + (rndA() - 0.5) * 0.9, [(0.9 + rndA() * 0.9) * sc, 1, (0.8 + rndA() * 0.8) * sc], rndA() * 6.28]); } };
    side(x0, z0, x1, z0); side(x1, z0, x1, z1); side(x1, z1, x0, z1); side(x0, z1, x0, z0); inst('wblot', L, mt); whiten.push([{ material: mt }, new THREE.Color(c0).multiplyScalar(0.89)]); };
  edge(16, 22, 44, 36, 2.0, 0.021, 0xcdb27e); edge(44, 17, 72, 42, 2.2, 0.017, 0x9a7a4a);
  { const L = [], mt = ownMat(); for (let x = 0.5; x < 80; x += 1.9 + rndA() * 1.3) L.push([x, 0.02 + (L.length % 4) * 0.002, 46.2 + rndA() * 0.8, [1.3 + rndA() * 1.1, 1, 0.8 + rndA() * 0.7], (rndA() - 0.5) * 0.8]); inst('wblot', L, mt); whiten.push([{ material: mt }, new THREE.Color(0xe2cc98).multiplyScalar(0.89)]); }
  /* 오가며 다져진 길: 마당에서 밭으로 · 강가로 */
  { const L = [], mt = ownMat(); for (const [ax, az, bx, bz] of [[30, 36, 31, 46.4], [22, 36, 17, 46.4], [40, 35, 45, 46.4]]) for (let t = 0.06; t < 1; t += 0.13) L.push([ax + (bx - ax) * t + (rndA() - 0.5) * 0.7, 0.018 + (L.length % 4) * 0.002, az + (bz - az) * t, [0.8 + rndA() * 0.5, 1, 0.9 + rndA() * 0.6], rndA() * 6.28]); inst('wblot', L, mt); whiten.push([{ material: mt }, new THREE.Color(0xbfae78).multiplyScalar(0.89)]); }
  /* 마당: 밟혀 다져진 자리(조금 어둡게) · 볕에 마른 자리(조금 밝게) */
  for (const [k, n] of [[0.8, 13], [0.94, 8]]) { const L = [], mt = ownMat(); mt.polygonOffset = true; mt.polygonOffsetFactor = -2; mt.polygonOffsetUnits = -4; for (let i = 0; i < n; i++) L.push([18.5 + rndA() * 23, 0.037 + (L.length % 4) * 0.0015, 23.6 + rndA() * 10.6, [1.1 + rndA() * 1.6, 1, 0.9 + rndA() * 1.2], rndA() * 6.28]); inst('wblot', L, mt); whiten.push([{ material: mt }, new THREE.Color(0xcdb27e).multiplyScalar(k)]); } }
const riverG = new THREE.PlaneGeometry(W + 140, 40, 60, 10); riverG.rotateX(-Math.PI / 2);
const river = new THREE.Mesh(riverG, new THREE.MeshStandardMaterial({ color: 0x3a8ad8, roughness: 0.25, metalness: 0.15, flatShading: true })); river.position.set(W / 2, 0.02, 72); scene.add(river);
const riverBase = riverG.attributes.position.array.slice();
const farBank = flat(-60, 92, W + 60, 130, 0x6a9a4a, 0.3);
/* 먼 산 — 철 따라 빛이 바뀐다 */
inst('whill', [[4, 0, -70, [40, 30, 24], 0.3], [46, 0, -80, [46, 40, 26], 1.1], [96, 0, -66, [40, 30, 24], 2.0], [-58, 0, -30, [28, 22, 30], 0.7], [-72, 0, 30, [26, 20, 34], 1.9], [146, 0, -4, [30, 26, 34], 2.6], [152, 0, 56, [26, 18, 30], 0.2], [10, 0.3, 150, [44, 22, 22], 1.4], [78, 0.3, 156, [48, 26, 22], 2.9]], hillMat);

/* 움집: 둥글게 판 자리 위에 이엉 지붕(블렌더 모델 wpit — 문은 마당 쪽). 눈 덮개는 첫눈에 서서히 드러난다 */
const houseSnow = [];
HOUSES.forEach(([x, z, r], i) => { const s = (r / 3.3) * 0.93, ry = [0, 0.42, -0.4][i], m = artOwn('wpit'); m.position.set(x, 0, z); m.scale.setScalar(s); m.rotation.y = ry; if (i) m.material.color.setRGB(0.9, 0.88, 0.84);
  group([x - r, z - r, x + r, z + r], [m]); const rec = occl[occl.length - 1];
  const sn = mesh('wpit_snow', ownMat(), false); sn.material.transparent = true; sn.material.forceSinglePass = true; sn.material.opacity = 0; sn.visible = false; put(sn, x, z, ry, s); houseSnow.push({ m: sn, rec }); });
const doorLit = new THREE.Mesh(artGeo('wpit_glow', {}, true), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 })); put(doorLit, OURS[0], OURS[1], 0, 0.93); doorLit.visible = false;
const doorGlow = glowSprite(scene, 'rgba(255,200,120,.95)', 'rgba(255,140,50,0)', 3.4); doorGlow.position.set(OURS[0], 0.9, OURS[1] + 3.9); doorGlow.material.opacity = 0;
/* 숲(철 따라 잎 색이 바뀌고 떨어진다) — 줄기와 잎 덩이를 따로 그린다: 잎 덩이는 가지 끝마다 하나씩이고, 나무마다·덩이마다 물드는 때가 조금씩 다르다.
   소나무는 늘 푸르다(첫눈에 눈 얹힌 것으로 바뀐다). 가지 끝 자리 = make_winter.py 의 TIPS_A · TIPS_B (three: [x, y, z, 반지름]) */
const leafPal = [[0x55a650, 0xe6b43a, 0xd8642a, 0x8a6a4a], [0x479a4c, 0xe8922e, 0xc8402a, 0x7a4a3a], [0x6aaa44, 0xf0cc40, 0xd09a3a, 0x8f7248]].map((p) => p.map((c) => new THREE.Color(c)));
const TIPS = { a: [[0, 4.15, 0, 1.3], [1.2, 3.25, -0.25, 1.02], [-1.15, 3.35, 0.2, 1.08], [0.2, 3.55, -1.05, 0.92], [-0.15, 3.45, 1.1, 0.98]], b: [[0.05, 5.1, 0, 0.95], [0.62, 4.05, -0.15, 0.86], [-0.58, 4.3, 0.2, 0.82], [0.1, 3.35, 0.62, 0.8], [-0.12, 3.1, -0.58, 0.74]] };
const forest = (() => { const pts = []; for (let i = 0; i < 100; i++) { let x, z; const k = rnd(); if (k < 0.55) { x = rnd() * 80; z = -6 + rnd() * 11; } else { x = 74 + rnd() * 20; z = rnd() * 50; } pts.push([x, z, 0.8 + rnd() * 0.5, rnd()]); }
  for (let i = 0; i < 26; i++) pts.push([-30 + rnd() * 140, -40 + rnd() * 30, 1 + rnd() * 0.6, rnd()]);
  for (const [x, z, s] of TREES_IN) pts.push([x, z, s / 2.2, rnd()]);
  const T = pts.map(([x, z, s, r], i) => { const far = i >= 100 && i < 126, inn = i >= 126, u = rndA(); if (i < 100) { if (z > 3.4 && x < 74) z = 3.4 - (z - 3.4) * 1.4; if (x < 77.6 && z > 3.4) x = 77.6 + (77.6 - x) * 1.4; }   /* 걸어 다니는 곳 가장자리는 비운다 */
    return { x, z, s: s * (inn ? 1 : 1.08), r, far, inn, kind: inn ? (i % 2 ? 'b' : 'a') : far ? (u < 0.34 ? 'p' : 'a') : u < 0.27 ? 'p' : u < 0.72 ? 'a' : 'b', ry: rndA() * 6.28, pal: Math.floor(rndA() * 3), br: 0.86 + rndA() * 0.22 }; });
  const row = (t, k = 1) => [t.x, 0, t.z, t.s * k, t.ry], near = T.filter((t) => !t.far), band = near.filter((t) => !t.inn), inn = near.filter((t) => t.inn), far = T.filter((t) => t.far);
  /* 그림자: 볕이 남서쪽에서 들어 숲 띠의 그림자는 놀이판 바깥(북동쪽)으로 진다 — 안쪽 나무 여섯만 진짜 그림자를 드리우고, 숲 띠는 발밑에 어두운 얼룩을 깐다 */
  for (const k of ['a', 'b']) { inst('wtrunk_' + k, band.filter((t) => t.kind === k).map((t) => row(t))); inst('wtrunk_' + k, inn.filter((t) => t.kind === k).map((t) => row(t)), null, true); }
  inst('wtrunk_a', far.filter((t) => t.kind === 'a').map((t) => row(t)));
  inst('wblot', band.map((t) => [t.x + 0.6 * t.s, 0.02 + (t.x % 1) * 0.004, t.z - 0.7 * t.s, [(t.kind === 'p' ? 1.5 : 2.3) * t.s, 1, (t.kind === 'p' ? 1.3 : 1.9) * t.s], t.ry]), shadeMat);
  const pn = band.filter((t) => t.kind === 'p'), pf = far.filter((t) => t.kind === 'p'), pineMat = ownMat(), pines = [inst('pine_a', pn.filter((t, i) => i % 2 === 0).map((t) => row(t, 1.12)), pineMat), inst('pine_b', pn.filter((t, i) => i % 2).map((t) => row(t, 0.95)), pineMat), inst('pine_a', pf.map((t) => row(t, 1.2)), pineMat)]; pineMat.color.setRGB(1.35, 1.42, 1.3);   /* 위에서 볼 때 너무 검지 않게 */
  const pineSnow = inst('pine_snow', [...pn.map((t, i) => row(t, i % 2 ? 1.14 : 1.05)), ...pf.map((t) => row(t, 1.13))]); pineSnow.visible = false;
  const blobs = [], cnt = { a: 0, b: 0, f: 0, i: 0 };
  for (const t of T) { if (t.kind === 'p') continue; const tips = TIPS[t.kind], cs = Math.cos(t.ry), sn = Math.sin(t.ry);
    tips.forEach(([tx, ty, tz, tr], j) => { if (t.far && j > 2) return; const set = t.far ? 'f' : t.inn ? 'i' : j < 3 ? 'a' : 'b'; blobs.push({ t, set, j, i: cnt[set]++, x: t.x + (tx * cs + tz * sn) * t.s, y: ty * t.s, z: t.z + (-tx * sn + tz * cs) * t.s, R: tr * t.s * (t.far ? 1.2 : 1), ry: rndA() * 6.28, ph: rndA() }); }); }
  const IM = { a: inst('wblob_a', blank(cnt.a)), b: inst('wblob_b', blank(cnt.b)), f: inst('wblob_a', blank(cnt.f)), i: inst('wblob_a', blank(cnt.i), null, true) };
  const nb = blobs.filter((b) => (b.set === 'a' || b.set === 'i') && b.j < 2), caps = inst('wsnowcap', blank(nb.length)); caps.visible = false;
  const lt = near.filter((t) => t.kind !== 'p'), litter = inst('wleaves', blank(lt.length * 2)); const lpos = []; for (const t of lt) for (let k = 0; k < 2; k++) lpos.push([t, t.x + (rndA() - 0.5) * 3.2 * t.s, t.z + (rndA() - 0.5) * 3.2 * t.s, rndA() * 6.28, rndA()]);
  const o = new THREE.Object3D(), c = new THREE.Color();
  const leafTone = (t, ph, k, out) => { const kk = clamp(k * 3 - clamp(t.r + ph * 0.3 - 0.15, 0, 1.2) * 0.6, 0, 2.999), a = Math.floor(kk), P = leafPal[t.pal]; return out.copy(P[a]).lerp(P[a + 1], kk - a); };
  function paint(k, sn = 0) {
    for (const b of blobs) { const t = b.t, bare = clamp((k - 0.7 - t.r * 0.15) * 4, 0, 0.6 + b.ph * 0.32), sc = b.R * (1 - bare), im = IM[b.set];
      leafTone(t, b.ph, k, c).multiplyScalar(t.br * (0.92 + b.ph * 0.16));
      o.position.set(b.x, b.y - b.R * bare * 0.3, b.z); o.rotation.set(0, b.ry, 0); o.scale.setScalar(Math.max(0.001, sc)); o.updateMatrix(); im.setMatrixAt(b.i, o.matrix); im.setColorAt(b.i, c); }
    for (const k2 in IM) { IM[k2].instanceMatrix.needsUpdate = true; if (IM[k2].instanceColor) IM[k2].instanceColor.needsUpdate = true; }
    /* 떨어진 잎: 가을이 깊어지면 나무 밑에 깔리고, 눈에 덮인다 */
    lpos.forEach(([t, x, z, ry, ph], i) => { const a = clamp((k - 0.3 - ph * 0.25) * 4, 0, 1) * (1 - sn); leafTone(t, ph, Math.min(1, k + 0.12), c).multiplyScalar(0.9); o.position.set(x, 0.012 + (i % 5) * 0.002, z); o.rotation.set(0, ry, 0); o.scale.setScalar(Math.max(0.001, a * t.s * 1.5)); o.updateMatrix(); litter.setMatrixAt(i, o.matrix); litter.setColorAt(i, c); });
    litter.instanceMatrix.needsUpdate = true; if (litter.instanceColor) litter.instanceColor.needsUpdate = true; litter.visible = k > 0.3 && sn < 0.98;
    /* 눈: 가지 끝마다 눈 덩이 · 소나무는 눈 얹힌 것으로 */
    caps.visible = sn > 0.01; if (caps.visible) { nb.forEach((b, i) => { o.position.set(b.x, b.y - b.R * 0.12, b.z); o.rotation.set(0, b.ry, 0); o.scale.setScalar(Math.max(0.001, b.R * 1.15 * sn)); o.updateMatrix(); caps.setMatrixAt(i, o.matrix); }); caps.instanceMatrix.needsUpdate = true; }
    pineSnow.visible = sn > 0.5; for (const p of pines) if (p) p.visible = sn <= 0.5; }
  return { paint }; })();

/* 밭: 조 — 칸마다 이랑 셋에 포기 열다섯(익은 포기 · 벤 그루 · 파헤쳐진 자리를 인스턴스 한 묶음씩) */
const PW = (FIELD[2] - FIELD[0]) / COLS, PH = (FIELD[3] - FIELD[1]) / ROWS, PER = 10, NPL = 15, NRU = 5;
const patches = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const x0 = FIELD[0] + c * PW, z0 = FIELD[1] + r * PH; const sp = []; for (let k = 0; k < PER; k++) sp.push([x0 + 0.5 + rnd() * (PW - 1), z0 + 0.5 + rnd() * (PH - 1), rnd() * 6, 0.8 + rnd() * 0.5]); patches.push({ i: patches.length, c, r, x0, z0, x: x0 + PW / 2, z: z0 + PH / 2, st: 'ripe', sp, used: true }); }
const furrowMat = ownMat(); whiten.push([{ material: furrowMat }, new THREE.Color(0xa88652)]);
{ const F = []; for (const p of patches) { p.pl = []; for (let row = 0; row < 3; row++) { const fx = p.x0 + PW * (row + 0.5) / 3; F.push([fx, 0.03, p.z, [1.2, 1, PH - 0.7], 0]); for (let j = 0; j < 5; j++) p.pl.push([fx + (rndA() - 0.5) * 0.3, p.z0 + 0.62 + (PH - 1.24) * (j / 4) + (rndA() - 0.5) * 0.45, rndA() * 6.28, 0.85 + rndA() * 0.4]); } } inst('wfurrow', F, furrowMat); }
const NF = COLS * ROWS * NPL, milletIM = inst('wmillet', blank(NF)), stubIM = inst('wstubble', blank(NF)), ruinIM = inst('wruined', blank(COLS * ROWS * NRU));
const milletSh = inst('wmillet_sh', blank(NF), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide }), true);   /* 보이지 않고 그림자만 드리운다 */
const _o = new THREE.Object3D();
function drawPatch() { let nm = 0, ns = 0, nr = 0;
  for (const p of patches) { const st = p.used ? p.st : 'none'; if (st === 'none') continue;
    p.pl.forEach(([x, z, a, s], k) => { _o.position.set(x, 0.1, z); _o.rotation.set(0, a, 0);
      if (st === 'ripe') { _o.scale.setScalar(s); _o.updateMatrix(); milletIM.setMatrixAt(nm, _o.matrix); milletSh.setMatrixAt(nm++, _o.matrix); }
      else if (st === 'cut') { _o.scale.setScalar(0.9 + s * 0.3); _o.updateMatrix(); stubIM.setMatrixAt(ns++, _o.matrix); }
      else if (k % 3 === 1) { _o.position.y = 0.05; _o.scale.setScalar(0.95 + s * 0.3); _o.updateMatrix(); ruinIM.setMatrixAt(nr++, _o.matrix); } }); }
  milletIM.count = milletSh.count = nm; stubIM.count = ns; ruinIM.count = nr; for (const m of [milletIM, milletSh, stubIM, ruinIM]) m.instanceMatrix.needsUpdate = true; }
/* 건조대 · 널어 둔 이삭 단 · 거적 · 갈판과 갈돌 · 화덕 · 빚는 자리 */
put(art('wrack'), RACK[0], RACK[1]);
const rackSlots = [0, 1, 2, 3].map((k) => { const m = mesh('wsheaf', ownMat()); put(m, RACK[0] - 1.2 + k * 0.8, RACK[1], k % 2 ? 0.14 : -0.1, 1, 1.5); m.visible = false; return m; });
const mat = put(art('wmatcover'), RACK[0], RACK[1]); mat.visible = false;
const matPile = put(art('wmatpile'), MAT[0], MAT[1], 0.25);
const grindStone = new THREE.Group(); grindStone.add(art('wquern')); const roller = art('wroller'); roller.position.set(0, 0.34, 0); grindStone.add(roller); grindStone.position.set(GRIND[0], 0, GRIND[1]); scene.add(grindStone);
put(art('whearth'), HEARTH[0], HEARTH[1], 0.4);
const fire = new THREE.Mesh(artGeo('wflame', {}, true), artGlowMat); fire.position.set(HEARTH[0], 0.1, HEARTH[1]); scene.add(fire);
const fireL = new THREE.PointLight(0xff8a3a, 8, 14, 1.6); fireL.position.set(HEARTH[0], 1.6, HEARTH[1]); scene.add(fireL);
const fireGlow = glowSprite(scene, 'rgba(255,200,120,.85)', 'rgba(255,120,40,0)', 4.4); fireGlow.position.set(HEARTH[0], 1.0, HEARTH[1]);
const smoke = []; for (let k = 0; k < 9; k++) { const s = new THREE.Mesh(artGeo('wpuff'), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, transparent: true, opacity: 0, depthWrite: false })); s.userData = { k: (k % 5) / 5, house: k >= 5 }; s.visible = false; scene.add(s); smoke.push(s); }
const potterMat = put(art('wpotter'), POTTER[0], POTTER[1], -0.2);
/* 빗살무늬토기: 뾰족한 밑을 흙에 꽂아 세운다 · 아가리 띠의 빗금과 몸통의 생선뼈 무늬 */
const fillMat = ownMat(); fillMat.emissive.set(0x6a4a00);
function potMesh() { const g = new THREE.Group(), body = mesh('wpot', ownMat()), fill = mesh('wfill', fillMat, false); fill.visible = false; g.add(body, fill); g.userData = { fill, body }; scene.add(g); return g; }
const pots = POTS.map(([x, z], i) => { const m = potMesh(); m.position.set(x, 0, z); m.rotation.y = i * 1.3; const gl = glowSprite(scene, 'rgba(255,224,140,.95)', 'rgba(255,170,60,0)', 3); gl.position.set(x, 1.2, z); gl.material.opacity = 0; const stand = put(art('wpotstand'), x, z, i * 0.8); return { m, gl, stand, n: 0, on: i < 3 }; });
const newPot = potMesh(); newPot.visible = false; const potRaw = new THREE.Color().setRGB(0.74, 0.95, 1.38), potFired = new THREE.Color(1, 1, 1);
const goalPos = new THREE.Vector3(30, 1.4, 25.4);
/* 강가: 진흙 캐는 자리 · 그물추 · 그물 더미와 말뚝 · 물에 친 그물(뜸 일곱) · 튀는 물고기 */
const clayMound = put(art('wclay'), CLAY[0], CLAY[1], 0.5);
const weights = put(mesh('wweights', popMat(0x2a2620)), WEIGHTS[0], WEIGHTS[1], 0.3, 1.15);
const netHeap = put(art('wnetheap'), NET[0] + 0.3, NET[1] + 1.5, -0.3);
const netFloats = new THREE.Group(), floats = []; for (let k = 0; k < 7; k++) { const f = mesh('wfloat', artMat, false); f.position.set(k * 1.1 - 3.3, 0.18, 0); f.rotation.y = k * 0.7; netFloats.add(f); floats.push(f); }
for (const sx of [-4.0, 4.0]) { const st = mesh('wstake', artMat, false); st.position.set(sx, -0.5, 0); st.rotation.y = sx; netFloats.add(st); }
netFloats.add(at(box(8, 0.03, 0.05, 0x9a8256), 0, 0.14, 0)); netFloats.position.set(NET[0], 0, NET[1] + 5.5); netFloats.visible = false; scene.add(netFloats);
const netPole = put(art('wstake'), NET[0] - 3.8, NET[1] + 2.4, 1.0);
const fishJump = mesh('wfish', artMat, false); fishJump.rotation.x = -0.9; fishJump.scale.setScalar(1.3); fishJump.visible = false; scene.add(fishJump);
/* 강가 살림: 통나무배 · 물고기 말리는 대(그물로 건지면 더 걸린다) · 조개더미 */
inst('wcanoe', [[26.5, 0, 51.5, 1, 1.42], [63, -0.12, 52.6, 1, 1.75]], null, true);
put(art('wfishrack'), 39.2, 51.15, 0.06); const fishRow = put(art('wfishrow'), 39.2, 51.15, 0.06); fishRow.visible = false;
put(art('wshells'), 8.6, 51.2, 0.3, 0.85);
/* 마을 살림: 저장 구덩이 · 연장 · 장작 · 토기 · 앉는 통나무 */
put(art('wstorepit'), 12.4, 21.2, 0.7); put(art('wtools'), 45.4, 18.2, -0.6);
inst('firewood', [[22.6, 0, 16.2, 1.1, 0.5], [38.0, 0, 14.4, 1.0, -0.6], [34.6, 0, 21.2, 1.1, 2.1]], null, true);
inst('wpot', [[15.2, 0, 17.9, 0.82, 0.3], [46.0, 0, 14.2, 0.9, 1.1], [25.6, 0, 21.9, 0.86, 2.0]], null, true); inst('wbowl', [[16.2, 0, 18.3, 0.8, 0], [25.0, 0, 22.9, 0.9, 1], [46.9, 0, 15.1, 0.75, 2], [18.6, 0, 34.3, 0.7, 3]]);
inst('wpotstand', [[15.2, 0, 17.9, 0.85, 0], [46.0, 0, 14.2, 0.9, 1], [25.6, 0, 21.9, 0.9, 2]]);
inst('log', [[18.4, 0, 28.9, 0.85, 0.5], [23.0, 0, 32.9, 0.8, -0.7]], null, true);
/* 풀섶 · 들국화 · 억새 · 갈대 · 돌 · 덤불 — 길·마당·밭·일하는 자리는 비운다 */
const snowHide = [];
{ const KEEP = [[...RACK, 3], [...MAT, 2], [...GRIND, 2.4], [...HEARTH, 2.6], [...POTTER, 2.2], [...CLAY, 2.2], [...WEIGHTS, 1.8], [...NET, 2.4], [30, 25.2, 4.5], [30, 32, 2], ...HOUSES.map(([x, z, r]) => [x, z, r + 1.6]), ...TREES_IN.map(([x, z]) => [x, z, 1.2])];
  const busy = (x, z, pad = 0) => inRect(x, z, [43 - pad, 16 - pad, 73 + pad, 43 + pad]) || inRect(x, z, [15 - pad, 21 - pad, 45 + pad, 37 + pad]) || z > 46.2 || KEEP.some(([a, b, r]) => dist(x, z, a, b) < r + pad);
  const G = []; for (let t = 0; t < 900 && G.length < 150; t++) { const x = 3 + rndA() * 75, z = 4 + rndA() * 43; if (busy(x, z, 0.3)) continue; G.push([x, 0, z, 1.2 + rndA() * 1.2, rndA() * 6.28]); }
  for (let i = 0; i < 56; i++) { const x = -14 + rndA() * 110, z = -12 + rndA() * 16; if (z > 4 && x > 3 && x < 77) continue; G.push([x, 0, z, 1.4 + rndA() * 1.4, rndA() * 6.28]); }
  snowHide.push(inst('wtuft', G, tuftMat));   /* 풀섶·들꽃은 눈에 덮인다 */
  const F = { flower_w: [], flower_p: [], flower_y: [] }, fn = Object.keys(F);
  for (let cI = 0; cI < 15; cI++) { const cx = 5 + rndA() * 70, cz = 7 + rndA() * 38; for (let k = 0; k < 6; k++) { const x = cx + (rndA() - 0.5) * 4, z = cz + (rndA() - 0.5) * 3.4; if (!busy(x, z, 0.4)) F[fn[cI % 3]].push([x, 0, z, 1.5 + rndA() * 0.9, rndA() * 6.28]); } }
  for (const n of fn) { const m = inst(n, F[n]); if (m) snowHide.push(m); }
  /* 억새: 강가 모래 끝 · 밭둑 · 숲 가장자리 */
  const P = []; const clump = (cx, cz, n, sp = 1.6) => { for (let k = 0; k < n; k++) P.push([cx + (rndA() - 0.5) * sp, 0, cz + (rndA() - 0.5) * sp * 0.6, 0.85 + rndA() * 0.5, rndA() * 6.28]); };
  for (const [x, z, n] of [[6, 45.6, 4], [21.5, 45.9, 3], [26, 45.7, 3], [38, 45.9, 3], [52, 45.4, 4], [64, 45.8, 3], [74, 45.2, 4], [73.6, 30, 3], [73.8, 21, 3], [58, 15.4, 3], [66, 15.6, 3], [49, 43.6, 2], [70, 43.8, 3], [5.2, 34, 3], [4.8, 20, 3], [11, 7.2, 3], [36, 6.8, 3], [61, 6.6, 3], [3, 51.2, 3], [14, 51.6, 2], [47.6, 51.7, 2], [56, 51.5, 4], [71, 51.4, 4], [77.8, 49.5, 3]]) clump(x, z, n);
  inst('wpampas', P, null, false);
  const R = []; for (let cI = 0; cI < 12; cI++) { const cx = -8 + rndA() * 96, cz = 52.6 + rndA() * 1.3; if (Math.abs(cx - NET[0]) < 5.5) continue; for (let k = 0; k < 3; k++) R.push([cx + (rndA() - 0.5) * 1.8, 0, cz + (rndA() - 0.5), 0.6 + rndA() * 0.3, rndA() * 6.28]); } inst('reed', R);
  const RK = { rock_a: [], rock_b: [], rock_flat: [] }; for (let i = 0; i < 16; i++) { const x = -6 + rndA() * 92, z = 52.5 + rndA() * 2.2; if (Math.abs(x - NET[0]) < 5.5 && z > 53) continue; const n = ['rock_a', 'rock_b', 'rock_flat', 'rock_a'][i % 4]; RK[n].push([x, -0.08, z, 0.6 + rndA() * 0.6, rndA() * 6.28]); }
  for (let i = 0; i < 14; i++) { const x = 4 + rndA() * 72, z = 6 + rndA() * 39; if (busy(x, z, 0.8)) continue; RK.rock_a.push([x, 0, z, 0.3 + rndA() * 0.35, rndA() * 6.28]); }
  for (const [x, z, s] of [[2.2, 9, 1.0], [1.4, 27, 0.8], [78.6, 8, 0.9], [79, 36, 1.0], [24, 3.6, 0.8], [47, 3.4, 0.9]]) RK.rock_b.push([x, 0, z, s, rndA() * 6.28]);
  for (const n in RK) inst(n, RK[n], null, true);
  const BU = [[], []]; for (let i = 0; i < 26; i++) { const e = i % 3 === 0, x = e ? 77.8 + rndA() * 5 : -2 + rndA() * 80, z = e ? 4 + rndA() * 44 : -1 + rndA() * 5.6; if (!e && x < 4.5 && z > 4) continue; BU[i % 2].push([x, 0, z, 0.9 + rndA() * 0.6, rndA() * 6.28]); }
  for (let i = 0; i < 9; i++) BU[i % 2].push([-1 + rndA() * 4.4, 0, 6 + rndA() * 44, 0.9 + rndA() * 0.6, rndA() * 6.28]);
  inst('bush', BU[0], null, false, { leaf: 0x4a8440 }); inst('bush', BU[1], null, false, { leaf: 0xb8742e });
  inst('stump', [[2.6, 0, 14.5, 1.1, 0], [79, 0, 22.5, 1.0, 1], [15, 0, 3.8, 1.2, 2], [55.5, 0, 3.9, 1.0, 3]], null, true); inst('log', [[1.8, 0, 40.5, 1, 1.3], [66, 0, 3.2, 1.0, 0.2]], null, true); }
/* 눈 더미: 첫눈에 땅에서 솟는다 */
const drifts = (() => { const L = []; for (let t = 0; t < 400 && L.length < 34; t++) { const x = 2 + rndA() * 78, z = 3 + rndA() * 46; if (inRect(x, z, [20, 23, 42, 35]) || HOUSES.some(([a, b, r]) => dist(x, z, a, b) < r + 1.5)) continue; L.push([x, 0.02, z, [1 + rndA() * 1.6, 0.8 + rndA() * 0.9, 0.9 + rndA() * 1.3], rndA() * 6.28]); } const m = inst('wdrift', L); m.visible = false; return m; })();

/* 사람 · 개 · 멧돼지 · 새 */
const SKIN = 0xf0c48e, NEO = { style: 'hide', skin: SKIN };
const pMesh = person({ shirt: 0xc9a66e, pants: 0x7a5a3a, hat: 'hair', ...NEO });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const carryG = new THREE.Group(); scene.add(carryG);
const CARRY = { ear: artGeo('wc_sheaf'), dry: artGeo('wc_sheaf'), grain: artGeo('wc_grain'), clay: artGeo('wc_clay') }, CARRY_C = { ear: 0x9cc25a, dry: 0xe8b84a, grain: 0xffffff, clay: 0xffffff };
const carryMeshes = [0, 1, 2].map((k) => { const m = new THREE.Mesh(CARRY.ear, ownMat()); m.castShadow = true; m.visible = false; carryG.add(m); return m; });
const villagers = [[22.5, 31, 0.9], [44, 16.5, -2.2], [14, 18, 0.4]].map(([x, z, r], i) => { const m = person({ shirt: [0xb89462, 0xa8926a, 0xc49c66][i], pants: 0x6a4a2a, hat: ['bun', 'wild', 'hair'][i], ...NEO, hairC: i === 1 ? 0x4a3020 : 0x2b2118 }); m.position.set(x, 0, z); m.rotation.y = r; return { m, x, z, hx: x, hz: z }; });
/* 짐승: 몸통 + 다리 넷(돌림 중심 = 엉덩이) — 머리가 +z. 다리는 앞뒤로 흔든다(대각선끼리 짝) */
function beast(pre, extra = []) { const g = new THREE.Group(), u = { legs: [] }; g.rotation.order = 'YXZ';
  const part = (n) => { const P = new THREE.Group(); P.position.copy(ART[n].pivot); P.add(mesh(n)); g.add(P); return P; };
  part(pre + '_body'); for (const n of ['legFL', 'legFR', 'legBL', 'legBR']) u.legs.push(part(pre + '_' + n)); for (const n of extra) u[n] = part(pre + '_' + n);
  g.userData = u; scene.add(g); return g; }
const dogM = beast('wdog', ['tail']); dogM.scale.setScalar(0.95);
const dogTail = dogM.userData.tail;
const boarM = beast('wboar'); boarM.scale.setScalar(0.86); boarM.visible = false;
const birds = Array.from({ length: 7 }, (_, i) => { const g = new THREE.Group(); for (const n of ['wbird', 'wbird_wingL', 'wbird_wingR']) { const P = new THREE.Group(); P.position.copy(ART[n].pivot); P.add(mesh(n)); g.add(P); } g.scale.setScalar(1.15 + (i % 3) * 0.1); g.visible = false; scene.add(g); return g; });
const snow = (() => { const N = 900, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = rnd() * (W + 40) - 20; pos[i * 3 + 1] = rnd() * 30; pos[i * 3 + 2] = rnd() * (H + 30) - 10; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.36, transparent: true, opacity: 0, depthWrite: false, map: canvasTex(32, 32, (g) => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.55, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); }) })); pts.frustumCulled = false; scene.add(pts); return { pts, pos, N }; })();

/* ───── 소리 ───── */
const SFX = {
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  cut: () => { noise(0.08, 0.3, 2400); noise(0.06, 0.2, 1800, 0.07); },
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  done: () => { tone(523, 523, 0.14, 'triangle', 0.16); tone(784, 784, 0.22, 'triangle', 0.16, 0.14); },
  grind: () => { noise(0.18, 0.35, 420); },
  thud: () => noise(0.1, 0.3, 260),
  tick: () => tone(1400, 1400, 0.04, 'square', 0.03),
  pour: () => { for (let i = 0; i < 5; i++) noise(0.05, 0.12, 3000 + i * 300, i * 0.05); tone(700, 900, 0.2, 'triangle', 0.08, 0.2); },
  shout: () => { tone(320, 420, 0.18, 'sawtooth', 0.14); tone(420, 300, 0.32, 'sawtooth', 0.12, 0.18); },
  grunt: () => { noise(0.2, 0.4, 220); tone(110, 80, 0.25, 'sawtooth', 0.1); },
  bark: () => { noise(0.13, 0.45, 700); noise(0.13, 0.45, 620, 0.2); },
  chirp: () => { for (let i = 0; i < 4; i++) tone(2400 + i * 200, 3000, 0.06, 'sine', 0.05, i * 0.09); },
  flap: () => { for (let i = 0; i < 6; i++) noise(0.04, 0.15, 900, i * 0.05); },
  rain: () => noise(0.9, 0.06, 5000),
  rot: () => tone(300, 160, 0.4, 'sawtooth', 0.08),
  splash: () => { noise(0.2, 0.3, 1200); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  snow: () => { [1047, 1319, 1568].forEach((f, i) => tone(f, f, 0.8, 'sine', 0.06, i * 0.3)); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', year: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, sea: 0, px: 30, pz: 32, pdir: -Math.PI / 2, moving: false, running: false, said: {}, sayT: 0,
  carry: [], rack: [], covered: false, potsFilled: 0, extra: 'none', strokes: 0, fireT: 0, dog: 'wild', dogX: DOG0[0], dogZ: DOG0[1], dogDir: 0, dogPh: 0, dogTX: 0, dogTZ: 0,
  net: 'none', netT: 0, fish: 0, boar: 'off', bx: BOAR0[0], bz: BOAR0[1], bDir: Math.PI, bT: 0, bPh: 0, bTarget: -1, bDig: 0, ruined: 0, bird: 'off', birdT: 0, birdX: 0, birdZ: 0, birdEat: 0, birdsEaten: 0,
  rain: 'none', rainT: 0, wetT: 0, rotted: 0, workT: 0, workKey: '', kPhase: 0, kTick: false, shoutCD: 0, beatT: 0, stepT: 0, matLock: false, endT: 0, shown: false, introT: 0, eaten: 0, harvested: 0, lostBoar: 0 };
let mis = null;   /* 미션 카드(아래에서 만든다) */
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 가만히 서면 베고·캐고·덮는다 · 「소리」(갈판·빚는 자리에서는 「치기」) · 땅을 누르면 개를 보낸다 · 「시점」 ⟲⟳';
const potsNeeded = () => 3;
const potCap = () => (S.extra === 'done' ? 4 : 3);

function hud() {
  const full = pots.slice(0, 3).filter((p) => p.n >= 3).length; const h = $('hPot'); h.textContent = '🏺 ' + full + ' / 3' + (S.extra === 'done' ? (pots[3].n >= 3 ? ' +1' : ' (+1)') : ''); h.className = 'pill' + (full ? ' got' : '');
  const icon = { ear: '🌾', dry: '🌾', grain: '🥣', clay: '🟤' }, cnt = {}; for (const c of S.carry) cnt[c] = (cnt[c] || 0) + 1;
  $('hCarry').textContent = S.carry.length ? Object.entries(cnt).map(([k, n]) => icon[k] + (k === 'ear' ? '이삭' : k === 'dry' ? '마른 이삭' : k === 'grain' ? '곡식' : '흙') + ' ' + n).join(' · ') + ` (${S.carry.length}/3)` : '손 비었음 (0/3)';
  const hc = $('hCover'); hc.style.display = S.covered ? '' : 'none'; hc.className = 'pill on';
  $('tPot').className = S.extra === 'done' ? 'on' : ''; $('tPot').textContent = S.extra === 'done' ? '🏺 빗살무늬토기 하나 더' : S.extra === 'firing' ? '🏺 화덕에서 굽는 중…' : '🏺 빗살무늬토기 굽기';
  $('tDog').className = S.dog === 'tame' ? 'on' : ''; $('tNet').className = S.fish ? 'on' : ''; $('tNet').textContent = S.fish ? '🐟 그물에 물고기' : S.net === 'set' ? '🐟 그물 쳐 둠 — 기다리기' : S.net === 'full' ? '🐟 그물을 걷자!' : '🐟 강에 그물 치기';
  carryMeshes.forEach((m, i) => { const c = S.carry[i]; m.visible = !!c; if (c) { m.geometry = CARRY[c]; m.material.color.set(CARRY_C[c]); } });
  rackSlots.forEach((m, i) => { const b = S.rack[i]; m.visible = !!b; if (b) m.material.color.set(b.dry >= 1 ? 0xe8b84a : new THREE.Color(0x9cc25a).lerp(new THREE.Color(0xe8b84a), b.dry).getHex()); });
  mat.visible = S.covered;
  pots.forEach((p, i) => { const f = p.m.userData.fill; p.m.visible = p.on; p.stand.visible = p.on; f.visible = p.n > 0; f.position.y = [0, 0.6, 0.84, 1.07][p.n] || 0; f.scale.setScalar([0.3, 0.31, 0.37, 0.42][p.n] || 0.3); p.m.userData.body.material.emissive.set(0x3a2200).multiplyScalar(p.n / 3); });
  fishRow.visible = !!S.fish; netHeap.visible = !(S.net === 'set' || S.net === 'full');
}
function resetYear() {
  const n = FIELD_BY_YEAR[Math.min(S.year - 1, FIELD_BY_YEAR.length - 1)];
  patches.slice().sort((a, b) => a.c - b.c || a.r - b.r).forEach((p, k) => { p.used = k < n; p.st = 'ripe'; }); /* 서쪽(마을 쪽) 칸부터 남긴다 */
  drawPatch();
  Object.assign(S, { t: 0, sea: 0, px: 30, pz: 32, pdir: -Math.PI / 2, carry: [], rack: [], covered: false, strokes: 0, net: 'none', netT: 0, fish: 0, boar: 'off', bx: BOAR0[0], bz: BOAR0[1], bT: 0, bTarget: -1, bDig: 0, ruined: 0, bird: 'off', birdT: 0, birdEat: 0, birdsEaten: 0, rain: 'none', rainT: 0, wetT: 0, rotted: 0, workT: 0, endT: 0, shown: false, eaten: 0, harvested: 0, lostBoar: 0, matLock: false });
  if (S.extra !== 'done') { S.extra = 'none'; newPot.visible = false; }
  pRing.visible = true; carryG.visible = true;
  pots.forEach((p, i) => { p.n = 0; p.on = i < 3 || S.extra === 'done'; p.gl.material.opacity = 0; p.gl.visible = true; p.m.position.set(POTS[i][0], 0, POTS[i][1]); });
  if (S.dog !== 'tame') { S.dogX = DOG0[0]; S.dogZ = DOG0[1]; } else { S.dogX = 31; S.dogZ = 33; }
  weights.visible = true; netFloats.visible = false; boarM.visible = false; birds.forEach((b) => (b.visible = false)); snow.pts.material.opacity = 0; doorGlow.material.opacity = 0; $('fade').style.opacity = 0; $('rain').style.opacity = 0;
  villagers.forEach((v) => { v.x = v.hx; v.z = v.hz; v.m.position.set(v.x, 0, v.z); });
  lightFor(0); hud();
}

/* ───── 입력 ───── */
function context() {
  if (S.carry.includes('dry') && dist(S.px, S.pz, GRIND[0], GRIND[1]) < 2.3) return 'grind';
  if (S.carry.includes('clay') && S.extra === 'none' && dist(S.px, S.pz, POTTER[0], POTTER[1]) < 2.2) return 'shape';
  return null;
}
function act() {
  if (S.mode !== 'play') return;
  const c = context(); if (c) return strike(c);
  if (S.shoutCD > 0) return; S.shoutCD = 1.2; SFX.shout(); ring(S.px, S.pz, 12, 0xffe2a0);
  let hit = false;
  if ((S.boar === 'come' || S.boar === 'dig') && dist(S.px, S.pz, S.bx, S.bz) < 11) { scareBoar('shout'); hit = true; }
  if (S.bird === 'eat' && dist(S.px, S.pz, RACK[0], RACK[1]) < 13) { scareBirds(); hit = true; }
  if (!hit) say('"훠이—!"', null, 1);
}
function strike(kind) {
  const ok = Math.abs(S.kPhase - 0.9) < 0.14;
  if (!ok) { SFX.thud(); say(kind === 'grind' ? '드륵 — 박자가 어긋났다. 고리가 작아질 때!' : '삐끗 — 고리가 작아질 때 긋자', null, 1.3); return; }
  if (kind === 'grind') { SFX.grind(); roller.position.x = roller.position.x > 0 ? -0.3 : 0.3; S.strokes++; ring(GRIND[0], GRIND[1], 1.8, 0xf2d06a);
    if (S.strokes >= 2) { S.strokes = 0; const i = S.carry.indexOf('dry'); S.carry[i] = 'grain'; SFX.done(); hud(); say(S.carry.includes('dry') ? '곡식 한 줌! — 하나 더 갈자' : '곡식 한 줌! — 토기에 붓자', null, 1.8); } else say('드르륵 — 한 번 더', null, 1); }
  else { SFX.cut(); S.strokes++; ring(POTTER[0], POTTER[1], 1.6, 0xd89a6a); newPot.visible = true; newPot.userData.body.material.color.copy(potRaw); newPot.position.set(POTTER[0], 0, POTTER[1]); newPot.scale.setScalar(0.4 + S.strokes * 0.2);
    if (S.strokes >= 3) { S.strokes = 0; S.carry.splice(S.carry.indexOf('clay'), 1); S.extra = 'firing'; S.fireT = 0; newPot.scale.setScalar(1); newPot.position.set(HEARTH[0], 0.1, HEARTH[1]); SFX.done(); hud(); say('빗금을 그은 토기를 화덕에 올렸다 — 구워지길 기다리자', null, 2.8); }
    else say(['빗금 하나 — 빗살 무늬', '빗금 둘'][S.strokes - 1], null, 1.2); }
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) act(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });
canvas.addEventListener('pointerdown', (e) => { if (S.mode === 'intro') { S.introT = 99; return; } if (S.mode !== 'play') return; const hit = groundAt(cam, e.clientX, e.clientY); if (!hit) return;
  if (S.dog !== 'tame') return say('개를 길들이면 누른 곳으로 보낸다', 'dogcmd', 2);
  S.dogTX = clamp(hit[0], BX[0], BX[1]); S.dogTZ = clamp(hit[1], BZ[0], BZ[1]); S.dogSent = 6; ring(S.dogTX, S.dogTZ, 2, 0xffcf4d); SFX.bark(); });

/* ───── 짐승 · 새 · 비 ───── */
function scareBoar(why) { if (S.boar !== 'come' && S.boar !== 'dig') return; S.boar = 'flee'; S.bT = 0; SFX.grunt(); say(why === 'dog' ? '컹컹! 개가 멧돼지를 숲으로 쫓았다' : '멧돼지가 꽁무니를 빼고 숲으로 달아났다', null, 2.4); }
function scareBirds() { if (S.bird !== 'eat' && S.bird !== 'come') return; S.bird = 'leave'; S.birdT = 0; SFX.flap(); say('새 떼가 푸드득 날아갔다', null, 1.6); }
function stepBoar(dt) {
  const due = SEASON * 0.12;
  if (S.boar === 'off') { if (S.t > due) { S.boar = 'come'; boarM.visible = true; S.bx = BOAR0[0]; S.bz = BOAR0[1]; SFX.grunt(); say('꿀꿀— 멧돼지가 숲에서 나와 밭으로 간다!', null, 3); } return; }
  if (S.boar === 'gone') { S.bT += dt; if (S.bT > 28) { S.boar = 'off'; } return; }
  let tx = S.bx, tz = S.bz, sp = 0;
  if (S.boar === 'flee') { tx = BOAR0[0] + 4; tz = BOAR0[1] - 4; sp = 6; S.bT += dt; if (dist(S.bx, S.bz, tx, tz) < 1.5 || S.bT > 7) { S.boar = 'gone'; S.bT = 0; boarM.visible = false; } }
  else {
    if (S.bTarget < 0 || patches[S.bTarget].st !== 'ripe' || !patches[S.bTarget].used) { let best = -1, bd = 1e9; for (const p of patches) if (p.used && p.st === 'ripe') { const d = dist(S.bx, S.bz, p.x, p.z); if (d < bd) { bd = d; best = p.i; } } S.bTarget = best; S.bDig = 0; }
    if (S.bTarget < 0) { S.boar = 'flee'; return; }
    const p = patches[S.bTarget]; tx = p.x; tz = p.z;
    if (dist(S.bx, S.bz, tx, tz) < 1.2) { S.boar = 'dig'; S.bDig += dt; sp = 0; if (S.bDig > 1.5) { p.st = 'ruined'; drawPatch(p); S.ruined++; S.bTarget = -1; SFX.grunt(); ring(p.x, p.z, 2.5, 0xa05030); say('멧돼지가 밭을 파헤친다! — 다가가 소리치자', 'boardig', 2.6); } }
    else { S.boar = 'come'; sp = 3.8; }
    if (dist(S.px, S.pz, S.bx, S.bz) < 4.5) scareBoar('near');
    if (S.dog === 'tame' && dist(S.dogX, S.dogZ, S.bx, S.bz) < 2.6) scareBoar('dog');
  }
  const dx = tx - S.bx, dz = tz - S.bz, l = Math.hypot(dx, dz);
  if (l > 0.1 && sp > 0) { const st = Math.min(l, sp * dt); S.bx += dx / l * st; S.bz += dz / l * st; S.bDir = Math.atan2(dz, dx); }
  S.bPh += dt * (sp > 0 ? 12 : 4); boarM.position.set(S.bx, S.boar === 'dig' ? Math.abs(Math.sin(S.bPh)) * 0.08 : 0, S.bz); boarM.rotation.y = -S.bDir + Math.PI / 2; boarM.rotation.x = S.boar === 'dig' ? 0.24 : 0;
  const u = boarM.userData, s = Math.sin(S.bPh) * (sp > 0 ? 0.7 : 0); u.legs[0].rotation.x = s; u.legs[3].rotation.x = s; u.legs[1].rotation.x = -s; u.legs[2].rotation.x = -s;
}
function stepDog(dt) {
  let tx = S.dogX, tz = S.dogZ, sp = 0;
  if (S.dog === 'wild') { S.dogWander = (S.dogWander || 0) + (rnd() - 0.5) * dt; tx = DOG0[0] + Math.cos(S.t * 0.2) * 3; tz = DOG0[1] + Math.sin(S.t * 0.27) * 4; sp = 1.2; const dp = dist(S.px, S.pz, S.dogX, S.dogZ); if (S.running && dp < 7) { tx = S.dogX + (S.dogX - S.px); tz = S.dogZ + (S.dogZ - S.pz); sp = 4; }
    else if (dp < 10 && S.carry.some((c) => c === 'ear' || c === 'dry')) { tx = S.px + 1.2; tz = S.pz + 0.6; sp = dp > 1.8 ? 2.8 : 0; say('들개가 이삭 냄새를 맡고 다가온다 — 가만히 서서 나눠 주자', 'dogsniff', 3); } }
  else {
    const boarOn = S.boar === 'come' || S.boar === 'dig';
    if (boarOn && dist(S.bx, S.bz, (FIELD[0] + FIELD[2]) / 2, (FIELD[1] + FIELD[3]) / 2) < 22) { tx = S.bx; tz = S.bz; sp = 6.2; if (!S.dogBarkT || S.t - S.dogBarkT > 1.6) { S.dogBarkT = S.t; SFX.bark(); } }
    else if (S.dogSent > 0) { S.dogSent -= dt; tx = S.dogTX; tz = S.dogTZ; sp = 5.5; if (S.bird === 'eat' && dist(S.dogX, S.dogZ, RACK[0], RACK[1]) < 4) scareBirds(); }
    else { const bx = -Math.cos(S.pdir), bz = -Math.sin(S.pdir); tx = S.px + bx * 1.8 + bz * 1.2; tz = S.pz + bz * 1.8 - bx * 1.2; sp = dist(S.dogX, S.dogZ, tx, tz) > 4 ? 4.2 : 2.8; if (dist(S.dogX, S.dogZ, tx, tz) < 0.8) sp = 0; }
  }
  const dx = tx - S.dogX, dz = tz - S.dogZ, l = Math.hypot(dx, dz);
  if (l > 0.15 && sp > 0) { const st = Math.min(l, sp * dt); let [nx, nz] = collideRects(SOLID, S.dogX + dx / l * st, S.dogZ + dz / l * st, 0.4); S.dogX = clamp(nx, BX[0], BX[1]); S.dogZ = clamp(nz, BZ[0], BZ[1]); S.dogDir = Math.atan2(dz, dx); }
  S.dogPh += dt * (sp > 0 && l > 0.15 ? 12 : 3); dogM.position.set(S.dogX, 0, S.dogZ); dogM.rotation.y = -S.dogDir + Math.PI / 2; dogTail.rotation.y = S.dog === 'tame' ? Math.sin(S.t * 14) * 0.6 : 0;
  const u = dogM.userData, s = Math.sin(S.dogPh) * (sp > 0 && l > 0.15 ? 0.7 : 0); u.legs[0].rotation.x = s; u.legs[3].rotation.x = s; u.legs[1].rotation.x = -s; u.legs[2].rotation.x = -s;
}
function stepBirds(dt) {
  const due = [0.22, 0.47, 0.72, 0.86].map((k) => k * SEASON);
  S.birdT += dt;
  if (S.bird === 'off') { if (due.some((d) => S.t > d && S.t - dt <= d) || (S.birdBack && S.t > S.birdBack)) { S.birdBack = 0; S.bird = 'come'; S.birdT = 0; S.birdX = -10; S.birdZ = 20; SFX.chirp(); birds.forEach((b) => (b.visible = true)); } else return; }
  let cx, cz, cy;
  if (S.bird === 'come') { const dx = RACK[0] - S.birdX, dz = RACK[1] - S.birdZ, l = Math.hypot(dx, dz); S.birdX += dx / l * Math.min(l, 9 * dt); S.birdZ += dz / l * Math.min(l, 9 * dt); cx = S.birdX; cz = S.birdZ; cy = 4 + l * 0.08;
    if (l < 0.6) { if (S.rack.length && !S.covered) { S.bird = 'eat'; S.birdT = 0; S.birdEat = 0; SFX.chirp(); say('짹짹— 새 떼가 널어 둔 이삭에 앉았다! 소리쳐 쫓자', 'birds', 2.8); } else { S.bird = 'leave'; S.birdT = 0; } } }
  else if (S.bird === 'eat') { cx = RACK[0]; cz = RACK[1]; cy = 1.7; S.birdEat += dt; if (S.covered || !S.rack.length) { S.bird = 'leave'; S.birdT = 0; }
    else if (S.birdEat > 3.4) { S.birdEat = 0; S.rack.pop(); S.birdsEaten++; SFX.chirp(); ring(RACK[0], RACK[1], 2, 0x7a7a8a); hud(); }
    if (dist(S.px, S.pz, RACK[0], RACK[1]) < 4.5) scareBirds(); }
  else if (S.bird === 'leave') { S.birdX += 10 * dt; S.birdZ -= 6 * dt; cx = S.birdX; cz = S.birdZ; cy = 3 + S.birdT * 3; if (S.birdT > 4) { S.bird = 'off'; S.birdBack = S.t + 30; birds.forEach((b) => (b.visible = false)); return; } }
  else return;
  birds.forEach((b, i) => { const a = S.t * (S.bird === 'eat' ? 0.6 : 3) + i * 0.9, r = S.bird === 'eat' ? 0.4 + (i % 3) * 0.45 : 1.2 + (i % 3) * 0.5; b.position.set(cx + Math.cos(a) * r, cy + (S.bird === 'eat' ? (i % 2) * 0.2 : Math.sin(a * 2) * 0.5), cz + Math.sin(a) * r * 0.5); b.rotation.y = -a; const fl = S.bird === 'eat' ? -1.25 : Math.sin(S.t * 30 + i) * 0.8; b.children[1].rotation.z = -fl; b.children[2].rotation.z = fl; b.rotation.x = S.bird === 'eat' ? 0.25 + Math.sin(S.t * 9 + i * 2) * 0.3 : 0; });
}
function stepRain(dt) {
  const due = [0.36, 0.66].map((k) => k * SEASON);
  if (S.rain === 'none') { if (due.some((d) => S.t > d && S.t - dt <= d)) { S.rain = 'warn'; S.rainT = 0; say('먹구름이 몰려온다 — 건조대에 거적을 덮자!', null, 3.2); } return; }
  S.rainT += dt;
  if (S.rain === 'warn' && S.rainT > 7) { S.rain = 'rain'; S.rainT = 0; $('rain').style.opacity = 1; }
  if (S.rain === 'rain') { if (S.rainT % 0.9 < dt) SFX.rain();
    if (!S.covered && S.rack.length) { S.wetT += dt; if (S.wetT > 2) { S.wetT = 0; S.rack.shift(); S.rotted++; SFX.rot(); ring(RACK[0], RACK[1], 2, 0x405060); hud(); say('젖은 이삭이 썩어 버린다! — 거적을 덮자', null, 2.2); } }
    if (S.rainT > 16) { S.rain = 'none'; S.rainT = 0; $('rain').style.opacity = 0; if (S.covered) say('비가 그쳤다 — 거적을 걷어야 다시 마른다', null, 2.8); } }
}

/* ───── 끝 ───── */
function finish(win) {
  S.mode = win ? 'win' : 'snow'; S.endT = 0; S.endWin = win; SFX[win ? 'win' : 'snow']();
  say(win ? '토기 셋이 가득! — 움집에 들이자' : '첫눈이 온다…', null, 2.6);
}
function endScreen() {
  const win = S.endWin, full = pots.filter((p) => p.on && p.n >= 3).length;
  const marks = `<div class="marks"><span class="${full >= 3 ? 'ok' : ''}">🌾 채운 토기 ${full}</span><span class="${S.extra === 'done' ? 'ok' : ''}">🏺 ${S.extra === 'done' ? '구운 토기' : '토기 못 구움'}</span><span class="${S.dog === 'tame' ? 'ok' : ''}">🐕 ${S.dog === 'tame' ? '개가 따른다' : '개는 숲에'}</span><span class="${S.fish ? 'ok' : ''}">🐟 ${S.fish ? '말린 물고기' : '물고기 없음'}</span></div>`;
  const lost = [S.ruined ? `멧돼지가 밭 ${S.ruined}칸을 파헤쳤다` : '', S.rotted ? `비에 이삭 ${S.rotted}단이 썩었다` : '', S.birdsEaten ? `새가 ${S.birdsEaten}단을 쪼아 먹었다` : ''].filter(Boolean).join(' · ');
  if (win) {
    overlay(`<h1>겨울 채비</h1><p>토기마다 곡식이 가득하다. 눈 내리는 밤, 움집 안 화덕이 따뜻하다.</p><p>${S.fish ? '그물로 건진 물고기도 말려 두었다.' : ''} ${S.dog === 'tame' ? '개가 문가에 웅크려 밤을 지킨다.' : ''}</p>${marks}${lost ? `<p class="keys">${lost}</p>` : ''}
      <p class="keys">이제 사람들은 떠나지 않는다. 봄에 다시 씨를 뿌릴 것이다.</p>
      <div class="fact">📜 <b>농사의 시작</b> — 조·피·수수 같은 잡곡을 기르기 시작했다. 사냥과 고기잡이도 여전히 중요했다.<br>📜 <b>간석기</b> — 돌을 갈아 만든 도구를 썼다. 갈돌과 갈판으로 곡식을 갈았다.<br>📜 <b>빗살무늬토기</b> — 흙으로 빚어 구운 그릇에 먹을 것을 담아 두고 익혔다.<br>📜 <b>머물러 사는 삶</b> — 강가나 바닷가에 움집을 짓고 마을을 이뤘다. 개와 돼지를 길렀다.</div>`,
      '한 번 더', () => { S.year = 1; S.extra = 'none'; S.dog = 'wild'; misClear(); resetYear(); S.mode = 'play'; });
  } else {
    const ny = S.year + 1;
    overlay(`<h1>첫눈</h1><p>토기를 다 채우지 못했다. 겨울은 났지만 <b>봄에 뿌릴 씨가 모자라다.</b></p>${lost ? `<p>${lost}.</p>` : ''}${marks}
      <p>이듬해 — <b>밭이 작아졌다</b>(${FIELD_BY_YEAR[Math.min(ny - 1, 2)]}칸).${S.extra === 'done' ? ' 구워 둔 토기는 그대로 있다.' : ''}${S.dog === 'tame' ? ' 개는 여전히 따른다.' : ''}</p>
      <p class="keys">${ny}번째 해 가을 · 토기는 아직 비어 있다.</p>`,
      '이듬해 가을', () => { S.year = ny; resetYear(); S.mode = 'play'; say('밭이 작아졌다 — 멧돼지와 비를 더 잘 막자', null, 3); });
  }
}

/* ───── 철 · 빛 ───── */
const SKY = [[0, 0x78aee8, 0xffe6c0, 0xfff1d6, 2.1, 1.3], [0.45, 0x7a9ed8, 0xffd8a0, 0xffe2b0, 1.9, 1.2], [0.75, 0x8a94b0, 0xe8c0a0, 0xf0d0b0, 1.4, 1.05], [0.93, 0x9aa2b4, 0xd8d4d0, 0xe8e8f0, 1.0, 1.0], [1.0, 0xa8b0c0, 0xe8ecf2, 0xf0f4ff, 0.8, 1.05], [1.3, 0x2a3050, 0x5a5a7a, 0x8a90c0, 0.25, 0.5]];
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); let lastSky = -1, lastLeaf = -1, snowK = 0;
function lightFor(k) {
  let a = SKY[0], b = SKY[SKY.length - 1]; for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = clamp((k - a[0]) / ((b[0] - a[0]) || 1), 0, 1);
  cT.set(a[1]).lerp(tc.set(b[1]), t); cL.set(a[2]).lerp(tc.set(b[2]), t);
  if (Math.abs(k - lastSky) > 0.004) { sky.paint(cT, cL); lastSky = k; }
  scene.fog.color.copy(cL); sun.color.set(a[3]).lerp(tc.set(b[3]), t); sun.intensity = lerp(a[4], b[4], t); hemi.intensity = lerp(a[5], b[5], t);
  const sn = clamp((k - 0.97) * 12, 0, 1); ground.material.color.copy(groundC0).lerp(groundC1, clamp(k * 1.3, 0, 1)).lerp(groundC2, sn);
  for (const [m, c0] of whiten) m.material.color.copy(c0).lerp(groundC2, sn * 0.85);
  /* 풀밭 얼룩 · 풀섶 · 먼 산 · 강 건너도 땅과 함께 바랜다. 첫눈: 눈 더미가 솟고 들꽃은 덮인다(지붕 눈은 view 에서) */
  snowK = sn; const gc = ground.material.color; patchMatA.color.copy(gc).multiplyScalar(0.98); patchMatB.color.copy(gc).multiplyScalar(0.78); shadeMat.color.copy(gc).multiplyScalar(0.6); farBank.material.color.copy(gc).multiplyScalar(0.8);
  tuftMat.color.copy(tuftC0).lerp(tuftC1, clamp(k * 1.4, 0, 1)).lerp(groundC2, sn * 0.92); hillMat.color.copy(hillC0).lerp(hillC1, clamp(k * 1.2, 0, 1)).lerp(groundC2, sn * 0.8);
  drifts.visible = sn > 0.01; drifts.scale.y = Math.max(0.001, sn); for (const m of snowHide) m.visible = sn < 0.6;
  if (Math.abs(k - lastLeaf) > (sn > 0 && sn < 1 ? 0.004 : 0.02)) { forest.paint(Math.min(k, 1), sn); lastLeaf = k; }
  snow.pts.material.opacity = clamp((k - 0.9) * 8, 0, 0.95);
}

/* ───── 한 걸음 ───── */
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  { const p = riverG.attributes.position; for (let i = 0; i < p.count; i++) { const x = riverBase[i * 3], z = riverBase[i * 3 + 2]; p.setY(i, Math.sin(x * 0.3 + S.t * 1.1) * 0.12 + Math.cos(z * 0.5 + S.t * 0.8) * 0.08); } p.needsUpdate = true; }
  fire.scale.setScalar(0.9 + Math.sin(S.t * 13) * 0.08); fire.rotation.y = S.t * 2; fireL.intensity = 8 * (0.85 + Math.sin(S.t * 21) * 0.15) * (0.5 + S.sea); fireGlow.material.opacity = (0.2 + 0.45 * clamp(S.sea, 0, 1)) * (1 + Math.sin(S.t * 17) * 0.12);
  for (const sm of smoke) { const u = sm.userData, on = !u.house || doorGlow.material.opacity > 0.05; sm.visible = on; if (!on) continue; const k = (S.t * (u.house ? 0.15 : 0.22) + u.k * (u.house ? 1.25 : 1)) % 1;
    sm.position.set((u.house ? OURS[0] : HEARTH[0]) + k * 1.5 + Math.sin(S.t * 0.9 + u.k * 9) * 0.3 * k, (u.house ? 3.8 : 0.9) + k * 3.4, (u.house ? OURS[1] : HEARTH[1]) - k * 0.5); sm.scale.setScalar(0.3 + k * 1.1); sm.material.opacity = Math.sin(Math.PI * k) * (u.house ? 0.5 : 0.32); }
  if (snow.pts.material.opacity > 0) { const p = snow.pos; for (let i = 0; i < snow.N; i++) { p[i * 3 + 1] -= dt * (1.4 + (i % 5) * 0.2); p[i * 3] += Math.sin(S.t + i) * dt * 0.3; if (p[i * 3 + 1] < 0) p[i * 3 + 1] += 30; } snow.pts.geometry.attributes.position.needsUpdate = true; }
  floats.forEach((f, i) => { f.position.y = 0.18 + Math.sin(S.t * 2 + i) * (S.net === 'full' ? 0.12 : 0.04); });
  if (S.mode === 'play') pots.forEach((p) => { p.gl.material.opacity = lerp(p.gl.material.opacity, p.on ? (p.n / 3) * 0.9 : 0, dt * 3); });
  if (S.extra === 'firing') { S.fireT += dt; newPot.userData.body.material.color.copy(potRaw).lerp(potFired, clamp(S.fireT / 18, 0, 1)); fire.scale.setScalar(1.4 + Math.sin(S.t * 13) * 0.1);
    if (S.fireT > 18 && S.mode === 'play') { S.extra = 'done'; newPot.visible = false; pots[3].on = true; SFX.done(); ring(POTS[3][0], POTS[3][1], 2.5, 0xffcf4d); hud(); say('토기가 구워졌다! — 움집 앞에 하나 더, 곡식을 더 담는다', null, 3); } }

  if (S.mode === 'title') return;
  if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.2) { S.mode = 'play'; say('첫눈 전에 — 움집 앞 토기 셋을 채우자', null, 3.2); } return; }
  if (S.mode === 'win' || S.mode === 'snow') {
    S.endT += dt; S.sea = Math.min(1.12, S.sea + dt * (S.mode === 'win' ? 0.06 : 0.03)); lightFor(S.sea);
    if (S.mode === 'win') { villagers.forEach((v, i) => { const p = pots[i % 3]; const tx = OURS[0] + (i - 1) * 0.9, tz = OURS[1] + 4.2; v.x = lerp(v.x, S.endT < 1.6 ? p.m.position.x : tx, dt * 2); v.z = lerp(v.z, S.endT < 1.6 ? p.m.position.z + 0.8 : tz, dt * 2); v.m.position.set(v.x, 0, v.z); walkAnim(v.m, S.t * 9, true); });
      if (S.endT > 1.6) pots.forEach((p, i) => { if (!p.on) return; p.m.position.x = lerp(p.m.position.x, OURS[0] + (i - 1.5) * 0.4, dt * 1.6); p.m.position.z = lerp(p.m.position.z, OURS[1] + 3.6, dt * 1.6); p.gl.position.copy(p.m.position).setY(1.2); p.gl.material.opacity = Math.min(p.gl.material.opacity, clamp(3 - S.endT, 0, 1) * 0.5); if (S.endT > 3) { p.m.visible = false; p.gl.visible = false; } }); }
    doorGlow.material.opacity = clamp((S.endT - 2.5) / 2, 0, 0.95);
    if (S.endT > 4.6 && S.endT - dt <= 4.6) $('fade').style.opacity = 1;
    if (S.endT > 6.0 && !S.camp) { S.camp = true; S.sea = 1.25; lightFor(1.25); $('fade').style.opacity = 0; S.px = OURS[0] + 1.8; S.pz = OURS[1] + 4.6; S.pdir = Math.PI / 2; pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = 0; walkAnim(pMesh, 0, false); pRing.visible = false; carryG.visible = false; if (S.dog === 'tame') { S.dogX = OURS[0] - 1.6; S.dogZ = OURS[1] + 4.4; S.dogDir = Math.PI / 2; dogM.position.set(S.dogX, 0, S.dogZ); dogM.rotation.y = -S.dogDir + Math.PI / 2; } }
    if (S.endT > 8.0 && !S.shown) { S.shown = true; endScreen(); }
    return;
  }
  if (S.mode !== 'play') return;
  S.camp = false;

  /* 철 */
  S.sea = S.t / SEASON; $('season').querySelector('i').style.width = clamp(S.sea, 0, 1) * 100 + '%'; lightFor(S.sea);
  if (S.sea > 0.86) say('바람이 차다 — 곧 첫눈이 온다!', 'late', 3);
  if (S.sea >= 1) return finish(false);
  S.shoutCD -= dt;

  /* 나 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 4.7 : 3.0) * (back ? 0.6 : 1) * (S.carry.length >= 3 ? 0.85 : 1); const [nx, nz] = collideRects(SOLID, S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); if (S.view !== 2) S.pdir = Math.atan2(iz, ix);
    S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; noise(0.05, S.running ? 0.12 : 0.05, 300); } }
  pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving);
  pRing.position.set(S.px, 0.11, S.pz);
  carryG.position.set(S.px - Math.cos(S.pdir) * 0.4, 0, S.pz - Math.sin(S.pdir) * 0.4); carryG.rotation.y = -S.pdir + Math.PI / 2; carryMeshes.forEach((m, i) => m.position.set((i - 1) * 0.36, 1.25 + (i % 2) * 0.1, -0.1));

  /* 가만히 서서 하는 일: 베기 · 덮기/걷기 · 흙 캐기 · 개에게 주기 · 그물 */
  let job = null, need = 1;
  const inPatch = patches.find((p) => p.used && p.st === 'ripe' && inRect(S.px, S.pz, [p.x0, p.z0, p.x0 + PW, p.z0 + PH]));
  if (inPatch && S.carry.length < 3) { job = 'cut'; need = 0.85; }
  else if (inPatch && S.carry.length >= 3) say('손이 가득 찼다 — 건조대에 널고 오자', 'full', 2.4);
  if (!job && dist(S.px, S.pz, MAT[0], MAT[1]) < 1.6 && !S.matLock) { job = 'mat'; need = 0.6; }
  if (dist(S.px, S.pz, MAT[0], MAT[1]) > 2.2) S.matLock = false;
  if (!job && dist(S.px, S.pz, CLAY[0], CLAY[1]) < 1.9 && S.carry.length < 3 && S.extra === 'none' && !S.carry.includes('clay')) { job = 'clay'; need = 1.0; }
  if (!job && S.dog === 'wild' && dist(S.px, S.pz, S.dogX, S.dogZ) < 2.8 && S.carry.some((c) => c === 'ear' || c === 'dry')) { job = 'dog'; need = 1.1; }
  if (!job && dist(S.px, S.pz, NET[0], NET[1]) < 2.0 && (S.net === 'weights' || S.net === 'full')) { job = S.net === 'weights' ? 'net' : 'fish'; need = 1.2; }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  overBar($('work'), cam, S.px, 2.6, S.pz, job && S.workT > 0.05 ? S.workT / need : null);
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'cut') { inPatch.st = 'cut'; drawPatch(inPatch); S.carry.push('ear'); S.harvested++; SFX.cut(); ring(inPatch.x, inPatch.z, 2, 0xe8b84a); say(S.carry.length >= 3 ? '이삭 셋 — 손이 가득! 건조대로' : '쓱— 이삭을 벴다', null, 1.6); }
    else if (job === 'mat') { S.covered = !S.covered; S.matLock = true; SFX.pick(); say(S.covered ? '거적을 덮었다 — 비도 새도 막는다. 덮인 동안은 더디게 마른다' : '거적을 걷었다 — 해에 빨리 마른다', null, 2.6); }
    else if (job === 'clay') { S.carry.push('clay'); SFX.pick(); say('강가 흙 한 덩이 — 빚는 자리(화덕 곁)로', null, 2.4); }
    else if (job === 'dog') { const i = S.carry.findIndex((c) => c === 'ear' || c === 'dry'); S.carry.splice(i, 1); S.dog = 'tame'; SFX.bark(); SFX.done(); ring(S.dogX, S.dogZ, 2.5, 0xffcf4d); say('이삭을 나눠 주었다 — 개가 꼬리를 흔들며 따라온다', null, 3); }
    else if (job === 'net') { S.net = 'set'; S.netT = 0; netFloats.visible = true; SFX.splash(); say('그물추를 단 그물을 쳤다 — 나중에 걷으러 오자', null, 2.6); }
    else if (job === 'fish') { S.net = 'done'; S.fish = 1; netFloats.visible = false; SFX.splash(); SFX.done(); say('그물 가득 물고기! — 말려서 겨울에 먹는다', null, 2.6); }
    hud(); }
  if (inPatch && S.carry.length < 3) say('조 이삭 — 가만히 서 있으면 벤다', 'cut1', 2.6);
  /* 걸어가면 되는 일: 널기 · 걷기 · 붓기 · 그물추 */
  const dR = dist(S.px, S.pz, RACK[0], RACK[1]);
  if (dR < 2.4) {
    let ch = false;
    /* 마른 것은 걷고 젖은 것은 그 자리에 넌다(손이 가득해도 바꿔 들 수 있게) */
    if (!S.covered) for (let i = 0; i < S.rack.length; i++) { const e = S.carry.indexOf('ear'); if (e < 0) break; if (S.rack[i].dry >= 1) { S.carry[e] = 'dry'; S.rack[i] = { dry: 0 }; ch = true; } }
    if (!S.covered) { for (let i = S.carry.length - 1; i >= 0; i--) if (S.carry[i] === 'ear' && S.rack.length < 4) { S.carry.splice(i, 1); S.rack.push({ dry: 0 }); ch = true; } }
    for (let i = S.rack.length - 1; i >= 0; i--) if (S.rack[i].dry >= 1 && S.carry.length < 3) { S.rack.splice(i, 1); S.carry.push('dry'); ch = true; }
    if (ch) { SFX.pick(); hud(); say(S.carry.includes('dry') ? '마른 이삭을 챙겼다 — 갈판으로' : '건조대에 널었다 — 해와 바람에 마른다', null, 2); }
    else if (S.covered && S.carry.includes('ear')) say('거적이 덮여 있다 — 곁의 거적 더미에 서면 걷는다', 'coveredrack', 2.6);
    else if (S.rack.length >= 4 && S.carry.includes('ear')) say('건조대가 꽉 찼다 — 마른 것부터 갈자', 'rackfull', 2.4);
  }
  if (S.carry.includes('grain') && dist(S.px, S.pz, goalPos.x, goalPos.z) < 3.4) {
    let poured = 0; for (let i = S.carry.length - 1; i >= 0; i--) if (S.carry[i] === 'grain') { const p = pots.find((p) => p.on && p.n < 3); if (!p) break; p.n++; S.carry.splice(i, 1); poured++; ring(p.m.position.x, p.m.position.z, 1.8, 0xffe08a); }
    if (poured) { SFX.pour(); hud(); const full = pots.slice(0, 3).filter((p) => p.n >= 3).length; say(full >= 3 ? '셋 다 찼다!' : `토기에 부었다 — ${3 - full}개 남았다`, null, 1.8); }
  }
  if (S.net === 'none' && dist(S.px, S.pz, WEIGHTS[0], WEIGHTS[1]) < 1.4) { S.net = 'weights'; weights.visible = false; SFX.pick(); hud(); say('그물추 — 강가 그물 자리에 서서 그물을 치자', null, 2.6); }
  if (S.net === 'set') { S.netT += dt; if (S.netT > 45) { S.net = 'full'; hud(); say('그물이 출렁인다 — 물고기가 들었다!', 'netfull', 2.4); } if (S.netT % 6 < dt) { fishJump.visible = true; fishJump.position.set(NET[0] + (rnd() - 0.5) * 6, 0.5, NET[1] + 5.5); } }
  if (fishJump.visible) { fishJump.position.y -= dt * 2; if (fishJump.position.y < 0) fishJump.visible = false; }
  /* 말리기 */
  if (S.rain !== 'rain') { let ch = false; for (const b of S.rack) if (b.dry < 1) { b.dry = Math.min(1, b.dry + dt / 20 * (S.covered ? 0.5 : 1)); /* 거적 아래서도 바람에 천천히 마른다 */ ch = true; if (b.dry >= 1) { SFX.pick(); say('이삭이 바싹 말랐다 — 건조대에서 챙기자', 'dry1', 2.4); } } if (ch && S.t % 0.5 < dt) hud(); }
  /* 박자 고리(갈판 · 빚는 자리) */
  const kc = context(); $('bAct').textContent = kc ? (kc === 'grind' ? '갈기' : '긋기') : '소리';
  if (kc) { S.kPhase = (S.kPhase + dt / 1.05) % 1; if (S.kPhase > 0.88 && !S.kTick) { S.kTick = true; SFX.tick(); } if (S.kPhase < 0.5) S.kTick = false;
    say(kc === 'grind' ? (ctl.isTouch ? '갈판 — 흰 고리가 노란 고리에 닿을 때 「갈기」' : '갈판 — 흰 고리가 노란 고리에 닿을 때 스페이스') : (ctl.isTouch ? '빚는 자리 — 고리가 닿을 때 「긋기」로 빗금' : '빚는 자리 — 고리가 닿을 때 스페이스로 빗금'), 'k' + kc, 3.2); }
  else if (S.carry.includes('dry') && dist(S.px, S.pz, GRIND[0], GRIND[1]) < 6) say('갈판 — 곁에 서면 간다', 'grindnear', 2.2);

  stepBoar(dt); stepDog(dt); stepBirds(dt); stepRain(dt);
  if (S.carry.length === 0 && S.t > 6) say('밭(동쪽)에서 이삭을 베어 오자', 'start', 2.8);
  if (pots.slice(0, 3).every((p) => p.n >= 3)) return finish(true);

  /* 조임 */
  const late = clamp((S.sea - 0.72) * 3.5, 0, 1), boarOn = S.boar === 'dig' ? 0.6 : S.boar === 'come' ? 0.35 : 0, wet = S.rain === 'rain' && !S.covered && S.rack.length ? 0.7 : S.rain === 'warn' ? 0.35 : 0, bird = S.bird === 'eat' ? 0.5 : 0;
  const tension = Math.max(late, boarOn, wet, bird);
  S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.4, tension); SFX.beat(0.08 + tension * 0.28); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${late >= Math.max(boarOn, wet, bird) ? '120,140,190' : '200,60,20'},${tension * 0.45})`;
}
const v3 = new THREE.Vector3();
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(30, 34, e), lerp(5.5, 38, e), lerp(33, 58, e)); cam.lookAt(lerp(30, 34, e), lerp(1.2, 0, e), lerp(25, 30, e)); if (cam.fov !== 44) { cam.fov = 44; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'win' || S.mode === 'snow') { if (S.camp) { cam.position.set(OURS[0] + 7, 4.2, OURS[1] + 13); cam.lookAt(OURS[0], 1.5, OURS[1]); } else { v3.set(OURS[0] + 3, 12, OURS[1] + 20); cam.position.lerp(v3, 0.04); cam.lookAt(OURS[0], 1, OURS[1] + 4); } }
  else followCam(cam, S, { W, H, map: { h: [86, 160], z: 10, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  for (const h of houseSnow) { h.m.visible = snowK > 0.01; h.m.material.opacity = snowK * h.rec.a; }
  doorLit.material.opacity = doorGlow.material.opacity; doorLit.visible = doorLit.material.opacity > 0.01; for (const p of pots) p.stand.visible = p.m.visible;   /* 움집에 들인 토기는 받침도 함께 치운다 */
  edgeGoal($('goal'), cam, goalPos, S.mode === 'play', 0.8);
  const kn = $('knap'), kc = S.mode === 'play' && context(); if (kc) { const p = kc === 'grind' ? GRIND : POTTER, q = v3.set(p[0], 0.5, p[1]).project(cam); kn.style.display = 'block'; kn.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; kn.style.top = ((1 - q.y) / 2) * innerHeight - 70 + 'px'; const r = Math.max(8, 84 - 62 * S.kPhase), i = kn.querySelector('i'); i.style.width = i.style.height = r + 'px'; i.style.borderColor = Math.abs(S.kPhase - 0.9) < 0.14 ? '#ffcf4d' : '#fff'; } else kn.style.display = 'none';
  guide(kc);
}

/* ───── 처음 하는 일 꼬리표(11-18, 고인돌처럼 — 보이기만 하고 놀이 숫자는 건드리지 않는다) ───── */
const tagEls = {}; function tagEl(k) { if (!tagEls[k]) { const e = document.createElement('div'); e.className = 'tag'; document.body.appendChild(e); tagEls[k] = e; } return tagEls[k]; }
const tv = new THREE.Vector3();
function showTag(k, html, on, x, y, z, dy = 0) { const e = tagEl(k); if (!on) { e.style.display = 'none'; return; } const q = tv.set(x, y, z).project(cam); if (q.z > 1 || Math.abs(q.x) > 1 || Math.abs(q.y) > 1) { e.style.display = 'none'; return; } if (e.innerHTML !== html) e.innerHTML = html; e.style.display = 'block'; const hw = e.offsetWidth / 2 + 6; e.style.left = clamp(((q.x + 1) / 2) * innerWidth, hw, innerWidth - hw) + 'px'; e.style.top = clamp(((1 - q.y) / 2) * innerHeight + dy, 150, innerHeight - 30) + 'px'; }
function guide(kc) {
  const play = S.mode === 'play', key = (t) => (ctl.isTouch ? `「${t}」` : '<b>스페이스</b>'), boarOn = S.boar === 'come' || S.boar === 'dig';
  showTag('boar', `🐗 다가가 ${key('소리')}로 쫓기`, play && boarOn && S.dog !== 'tame', S.bx, 2.2, S.bz);
  showTag('bird', `🐦 건조대로 가서 쫓기`, play && S.bird === 'eat', RACK[0], 3.4, RACK[1]);
  const wet = (S.rain === 'warn' || S.rain === 'rain') && S.rack.length && !S.covered, dryAgain = S.rain === 'none' && S.covered && S.rack.length;
  showTag('mat', wet ? '🟫 여기 서서 거적 덮기' : '🟫 여기 서서 거적 걷기', play && (wet || dryAgain) && !S.matLock, MAT[0], 1.6, MAT[1]);
  showTag('net', S.net === 'weights' ? '🕸 여기 서서 그물 치기' : '🐟 여기 서서 그물 걷기', play && (S.net === 'weights' || S.net === 'full'), NET[0], 1.8, NET[1]);
  showTag('clay', '🏺 여기 서서 빗금 긋기', play && S.carry.includes('clay') && S.extra === 'none' && !kc, POTTER[0], 1.6, POTTER[1]);
  showTag('dog', '🐕 곁에 가만히 서서 나눠 주기', play && S.dog === 'wild' && S.carry.some((c) => c === 'ear' || c === 'dry') && dist(S.px, S.pz, S.dogX, S.dogZ) < 10, S.dogX, 1.6, S.dogZ);
  /* 박자 고리: 처음 몇 번은 고리 아래에 키를 보여 준다 */
  const first = kc === 'grind' ? misGrinds < 2 : kc === 'shape', p = kc === 'grind' ? GRIND : POTTER, inWin = Math.abs(S.kPhase - 0.9) < 0.14;
  showTag('knap', inWin ? `지금! ${key(kc === 'grind' ? '갈기' : '긋기')}` : `흰 고리가 노란 고리에 닿을 때 ${key(kc === 'grind' ? '갈기' : '긋기')}`, play && !!kc && first, p[0], 0.5, p[1], -122);
}

/* ───── 미션(11-18): 지금 할 일 하나 — 무엇을·어떻게·어디서. 밭·건조대·갈판·토기에는 표시가 없어서 빛기둥을 세운다 ───── */
let misWet = 0, misG = 0, misHung = false, misDry = false, misGrain = false, misGrinds = 0;
function misClear() { if (mis) mis.reset(); misWet = misG = 0; misHung = misDry = misGrain = false; misGrinds = 0; }
const nearRipe = () => { let best = null, bd = 1e9; for (const p of patches) if (p.used && p.st === 'ripe') { const d = dist(p.x, p.z, S.px, S.pz); if (d < bd) { bd = d; best = p; } } return best; };
const inRipe = () => patches.some((p) => p.used && p.st === 'ripe' && inRect(S.px, S.pz, [p.x0, p.z0, p.x0 + PW, p.z0 + PH]));
const toField = () => { const p = nearRipe(); return p && !inRipe() && S.carry.length < 3 ? [p.x, p.z] : null; };
const filled = () => pots.slice(0, 3).reduce((a, p) => a + Math.min(3, p.n), 0);
mis = missions(scene, cam, [
  { t: '밭에서 조 이삭 베기', how: '동쪽 밭(익은 조) 안에 들어가 가만히 서 있으면 벤다', done: () => S.harvested >= 1, at: toField, tag: '🌾 들어가서 가만히 서기' },
  { t: '건조대에 이삭 널기', how: '이삭을 들고 건조대 곁으로 걸어가면 저절로 넌다', done: () => misHung,
    at: () => (S.covered ? [MAT[0], MAT[1]] : S.carry.includes('ear') ? [RACK[0], RACK[1] + 1.2] : toField()), tag: () => (S.covered ? '🟫 서서 거적 걷기' : S.carry.includes('ear') ? '🌾 곁으로 가면 널린다' : '🌾 이삭 베기') },
  { t: '마른 이삭 챙기기', how: '널어 둔 이삭이 노랗게 마르면 건조대 곁에 가서 챙긴다 · 마르는 동안 밭에서 더 베어 오자', done: () => misDry,
    at: () => (S.rack.some((b) => b.dry >= 1) ? [RACK[0], RACK[1] + 1.2] : toField() || [RACK[0], RACK[1] + 1.2]), tag: () => (S.rack.some((b) => b.dry >= 1) ? '🌾 마른 이삭 챙기기' : toField() ? '⏳ 마르는 동안 더 베기' : '⏳ 마르는 중') },
  { t: '갈판에서 곡식 갈기', how: (tc) => `마른 이삭을 들고 갈판 곁에 서서 흰 고리가 작아져 노란 고리에 닿을 때 ${tc ? '「갈기」' : '<kbd>스페이스</kbd>'} — 두 번에 한 줌`, done: () => misGrain,
    at: () => (S.carry.includes('dry') && context() !== 'grind' ? [GRIND[0], GRIND[1]] : null), tag: '🪨 여기 서서 갈기' },
  { t: '토기에 곡식 붓기', how: '곡식을 들고 움집 앞 토기 곁으로 걸어가면 붓는다', done: () => pots.some((p) => p.n > 0),
    at: () => (S.carry.includes('grain') ? [goalPos.x, goalPos.z] : null), tag: '🏺 곁으로 가면 붓는다' },
  { t: '첫눈 전에 토기 셋 가득', how: '베기 → 널기 → 마르면 챙기기 → 갈기 → 붓기를 되풀이 · 멧돼지·비·새 떼는 다가가서 막기', n: () => [filled(), 9], done: () => filled() >= 9 },
], { allText: '🎉 토기 셋이 가득 찼다!' });
function misWatch() { if (S.mode !== 'play') return; const w = S.rack.filter((b) => b.dry < 1).length; if (w > misWet) misHung = true; misWet = w;
  if (S.carry.includes('dry')) misDry = true; const g = S.carry.filter((c) => c === 'grain').length; if (g > misG) { misGrain = true; misGrinds++; } misG = g; }

resetYear(); stepDog(0.01);
pMesh.position.set(S.px, 0, S.pz); pRing.position.set(S.px, 0.11, S.pz);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.chirp(); };
runLoop((dt) => { update(dt); misWatch(); mis.update(dt, S.mode === 'play' || (S.mode === 'win' && S.endT < 2.4)); }, view, () => renderer.render(scene, cam));
window.__scene = { S, patches, pots, update, keys, ctl, act, strike, context,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz); ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  beat(n) { let k = 0; for (let g = 0; g < 400 && k < n && S.mode === 'play'; g++) { update(1 / 60); if (Math.abs(S.kPhase - 0.9) < 0.02 && context()) { strike(context()); k++; update(1 / 30); } } return k; },
  const: { RACK, MAT, GRIND, POTTER, CLAY, WEIGHTS, NET, FIELD, POTS, DOG0 } };
