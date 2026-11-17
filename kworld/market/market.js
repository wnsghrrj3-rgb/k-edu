/* 케이월드 · 장날 — 조선 후기 한 장면(S08, 2026-11-17). 본보기 = 그믐밤, 공통 부품 = ../scene/kit.js.
   목표는 하나(관아 북이 울리는 닷새째까지 세금 궤를 채우고 우리 집 쌀독도 남기기 — 화면 위 띠 둘)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 궤를 못 채우면 소를 끌려 보내고 다음 판 모내기가 빡빡하다.
   첫머리 모내기: 「심자!」에 맞춰 스페이스 여덟 번 — 맞춘 만큼 가을걷이가 는다. 끝나고 6초 안에 논 한쪽(담배 자리)에 서면 담배 한 뙈기(쌀 −3, 담배 +2).
   가을 닷새: 쌀을 지면 느리고 고개에서는 더 느리다(엽전은 무게가 없다). 장터 둘(우리 장 · 고개 너머 이웃 장)의 쌀·무명·담배 값이 다르고 날마다 바뀐다(장터 위 그림).
   관아에 갈 때마다 궤가 커진다(죽은 사람 몫·갓난아이 몫). 탈춤 날(사흘째) 우리 장 마당에서 구경하면 그날 값이 좋아진다.
   좌표: x 동쪽(+), z 남쪽(+). 서쪽 집과 논 → 가운데 우리 장(북쪽 관아) → 동쪽 고개 → 이웃 장. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, runLoop, loadArt, ART, art, artInst } from '../scene/kit.js?v=3';
await loadArt('people');   /* 블렌더로 만든 모델(사람·자연·집·소품) */

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
const seedlings = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.5, 0.08).translate(0, 0.25, 0), M(0x7ac04a), 160); seedlings.count = 0; scene.add(seedlings);
const golden = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.9, 0.1).translate(0, 0.45, 0), M(0xe8b84a), 360); golden.count = 0; scene.add(golden);
flat(3, 29, 93, 31.4, 0xd8c498, 0.03); flat(42.8, 10, 45.2, 30, 0xd8c498, 0.03); flat(36, 31, 52, 44, 0xd2c094, 0.03); flat(76, 31, 92, 40, 0xd2c094, 0.03); flat(8, 25, 24, 31, 0xd2c094, 0.03);
{ const g = new THREE.Group(); for (let k = 0; k < 13; k++) { const x = 60 + k, h = hillH(x + 0.5); g.add(at(box(1.02, Math.max(0.05, h), 14, k % 2 ? 0x8aaa4a : 0x7a9a3a), x + 0.5, Math.max(0.05, h) / 2, 30)); } g.traverse((o) => { if (o.isMesh) o.receiveShadow = true; }); scene.add(g); }
for (let k = 0; k < 30; k++) { const x = 58 + rnd() * 16, z = 20 + rnd() * 22; if (Math.abs(z - 30) < 2.6) continue; const t = new THREE.Group(); const s = 0.7 + rnd() * 0.5; t.add(at(cyl(0.2, 0.3, 2, 0x7a4f2b, 6), 0, 1, 0), at(box(2.2, 1.6, 2.2, 0x3a8a4a), 0, 2.6, 0)); t.position.set(x, hillH(x), z); t.scale.setScalar(s); t.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(t); }
for (let i = 0; i < 60; i++) { const t = box(0.8 + rnd(), 0.08, 0.6 + rnd(), rnd() > 0.5 ? 0xaad06a : 0x8ab84a); t.castShadow = false; at(t, 3 + rnd() * 90, 0.05, 4 + rnd() * 52); scene.add(t); }
/* 집 · 쌀독 · 관아 · 궤 · 장터 · 탈춤 마당 */
{ const P = [at(box(10, 1.8, 4.6, 0xf2e4c4), 13, 0.9, 22.5)], cols = [0xd9a53c, 0xe4b54c, 0xefc661]; for (let k = 0; k < 3; k++) P.push(at(box(12 - k * 2, 0.6, 6.4 - k * 1.6, cols[k]), 13, 2.1 + k * 0.55, 22.5)); P.push(at(box(1.2, 1.3, 0.12, 0x6a4226), 13, 0.65, 24.85)); group([7, 20, 19, 25], P); }
const jar = new THREE.Group(); jar.add(at(cyl(0.7, 0.5, 1.2, 0x7a4a2a, 10), 0, 0.6, 0), at(cyl(0.45, 0.45, 0.1, 0x5a3420, 10), 0, 1.22, 0)); const jarRice = at(cyl(0.62, 0.62, 0.1, 0xfff6dc, 10), 0, 0.3, 0); jar.add(jarRice); jar.position.set(JAR[0], 0, JAR[1]); jar.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(jar);
const jarGlow = glowSprite(scene, 'rgba(255,246,220,.8)', 'rgba(255,220,150,0)', 2.6); jarGlow.position.set(JAR[0], 1.6, JAR[1]);
const mkPad = (p, c) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(p[0], 0.07, p[1]); scene.add(m); return m; };
mkPad(JOUT, 0xffcf4d); mkPad(JIN, 0x7ac0ff);
const cow = new THREE.Group(); cow.add(at(box(1.8, 0.9, 0.8, 0x8a5a3a), 0, 1.1, 0), at(box(0.6, 0.6, 0.6, 0x8a5a3a), 1.1, 1.4, 0)); for (const [lx, lz] of [[0.6, 0.3], [0.6, -0.3], [-0.6, 0.3], [-0.6, -0.3]]) cow.add(at(box(0.18, 0.7, 0.18, 0x6a4a2a), lx, 0.35, lz)); cow.position.set(7, 0, 28); cow.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(cow);
{ const P = [at(box(16, 1, 7, 0xb8b0a0), 44, 0.5, 6.5), at(box(14, 3, 5.6, 0xf2e6d0), 44, 2.5, 6.5)]; for (let k = 0; k <= 5; k++) P.push(at(box(0.4, 3, 0.4, 0x8a2a1a), 37.5 + k * 2.6, 2.5, 9.3)); const r = box(17, 0.8, 8, 0x3a4a6a); at(r, 44, 4.4, 6.5); P.push(r); group([36, 3, 52, 10], P); }
const chest = new THREE.Group(); chest.add(at(box(1.8, 1, 1.2, 0x6a3a1a), 0, 0.5, 0), at(box(1.9, 0.2, 1.3, 0x4a2a10), 0, 1.05, 0)); const chestFill = at(box(1.6, 0.05, 1.0, 0xe8c050), 0, 0.2, 0); chest.add(chestFill); chest.position.set(GOV[0], 0, GOV[1] - 1.4); scene.add(chest);
const govDrum = new THREE.Group(); govDrum.add(at(cyl(0.8, 0.8, 1.2, 0xa8443a, 12), 0, 1.4, 0)); govDrum.children[0].rotation.z = Math.PI / 2; govDrum.add(at(box(0.15, 1.4, 0.15, 0x6a4526), -0.7, 0.7, 0), at(box(0.15, 1.4, 0.15, 0x6a4526), 0.7, 0.7, 0)); govDrum.position.set(49, 0, 11.5); scene.add(govDrum);
const officer = person({ shirt: 0x3a4a7a, pants: 0x2a2a3a, hat: 'gat', mood: 'stern' }); officer.position.set(46.4, 0, 11.2); officer.rotation.y = 0;
for (const m of MKT) { for (let i = 0; i < 3; i++) { const x = m.x - 4 + i * 4; scene.add(at(box(2, 0.9, 1.2, 0x9a7a50), x, 0.45, m.z - 1), at(box(2.6, 0.12, 2, 0xe8d0a0), x, 2.1, m.z - 1), at(cyl(0.05, 0.05, 2.1, 0x6a4526, 5), x - 1.1, 1.05, m.z - 1.8), at(cyl(0.05, 0.05, 2.1, 0x6a4526, 5), x + 1.1, 1.05, m.z - 1.8)); for (let k = 0; k < 3; k++) scene.add(at(box(0.5, 0.35, 0.5, GOODS[GKEYS[i]].c), x - 0.6 + k * 0.6, 1.08, m.z - 1)); }
  const pole = at(cyl(0.08, 0.08, 5, 0x6a4526, 6), m.x + 7, 2.5, m.z - 2); scene.add(pole); }
const mktFlags = MKT.map((m) => { const f = box(1.6, 1, 0.06, 0xc0302a); f.position.set(m.x + 7.85, 4.4, m.z - 2); scene.add(f); return f; });
scene.add(at(box(7, 0.4, 1.8, 0x9a7a50), MASK[0], 0.2, MASK[1] - 1.8));
const dancers = [0, 1].map((i) => { const m = person({ shirt: i ? 0xe8e0d0 : 0xc0302a, pants: 0x3a3a3a, hat: i ? 'gat' : 'top' }); m.position.set(MASK[0] - 1.2 + i * 2.4, 0.4, MASK[1] - 1.8); m.rotation.y = 0; m.visible = false; return m; });
const crowd = Array.from({ length: 8 }, (_, i) => { const m = person({ shirt: [0xb89a70, 0xa89070, 0xc0a880, 0x9a8a68][i % 4], pants: 0x6a5034, hat: 'top' }); m.position.set(MASK[0] - 4 + (i % 4) * 2.6, 0, MASK[1] + 1 + Math.floor(i / 4) * 1.4); m.rotation.y = Math.PI; m.visible = false; return m; });
const sellers = MKT.flatMap((m) => [0, 1, 2].map((i) => { const p = person({ shirt: [0x9a7a5a, 0x7a8a6a, 0x8a6a5a][i], pants: 0x5a4a3a, hat: 'top' }); p.position.set(m.x - 4 + i * 4, 0, m.z - 2.4); p.rotation.y = 0; return p; }));
const neighbors = [0, 1, 2, 3, 4].map((i) => { const m = person({ shirt: [0xd8c8a0, 0xc8b890, 0xd0c098, 0xc0b088, 0xd8c8a0][i], pants: 0x6a5a3a, hat: 'top' }); m.visible = false; return m; });
const tobPatch = flat(TOB[0] - 2, TOB[1] - 2, TOB[0] + 2, TOB[1] + 2, 0x6a5a2a, 0.06); tobPatch.visible = false;
const tobGlow = glowSprite(scene, 'rgba(255,240,180,.9)', 'rgba(255,200,90,0)', 3); tobGlow.position.set(TOB[0], 1.2, TOB[1]); tobGlow.visible = false;
const tobPlants = new THREE.Group(); for (let k = 0; k < 9; k++) tobPlants.add(at(box(0.5, 0.9, 0.5, 0x5a8a3a), TOB[0] - 1.2 + (k % 3) * 1.2, 0.45, TOB[1] - 1.2 + Math.floor(k / 3) * 1.2)); tobPlants.visible = false; scene.add(tobPlants);
/* 나 · 짐 */
const pMesh = person({ shirt: 0xe8e0c8, pants: 0x7a6a4a, hat: 'top' });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const packs = [0, 1, 2, 3].map(() => { const m = box(0.5, 0.42, 0.42, 0xffffff); m.visible = false; scene.add(m); return m; });
const tagBox = $('tags'); const mkTag = () => { const d = document.createElement('div'); d.className = 'tag'; tagBox.appendChild(d); return d; };
const mktTags = MKT.map(mkTag), stallTags = MKT.map(() => [0, 1, 2].map(mkTag)), tagGov = mkTag(), tagJar = mkTag(), tagMask = mkTag();

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
  S.prices = dayPrices(1); seedlings.count = 0; golden.count = 0; tobPatch.visible = tobGlow.visible = tobPlants.visible = false; cow.visible = S.cow; paddy.forEach((p) => p.material.color.set(0x7ab0c8));
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
  jarRice.scale.y = 1; jarRice.position.y = 0.15 + clamp(S.jar / 14, 0, 1) * 0.95; chestFill.position.y = 0.15 + clamp(S.paid / S.need, 0, 1) * 0.75;
  packs.forEach((m, i) => { const c = S.carry[i]; m.visible = !!c; if (c) m.material.color.set(GOODS[c].c); });
}

/* ───── 모내기: 「심자!」에 맞춰 ───── */
const PLANT_P = () => (S.cow ? 1.0 : 0.85), PLANT_W = () => (S.cow ? 0.18 : 0.12);
function act() {
  if (S.mode !== 'plant' || S.beats >= 8) return;
  if (S.pressed) return; S.pressed = 1; const off = Math.min(S.bPh, 1 - S.bPh) * PLANT_P();
  if (off <= PLANT_W()) { S.hits++; SFX.plant(); const k = seedlings.count; for (let j = 0; j < 6 && seedlings.count < 160; j++) { _o.position.set(6 + (k / 6 % 8) * 2.3 + j * 0.3, 0, 44 + (j % 2) * 0.4); _o.updateMatrix(); seedlings.setMatrixAt(seedlings.count++, _o.matrix); } seedlings.instanceMatrix.needsUpdate = true; $('chant').textContent = '심자!'; }
  else { SFX.miss(); say('박자가 어긋났다 — 줄이 삐뚤어진다', null, 1.2); }
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) act(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });
canvas.addEventListener('pointerdown', () => { if (S.mode === 'intro') S.introT = 99; });
function startAutumn() {
  S.harvest = 7 + S.hits; let rice = S.harvest; S.carry = []; if (S.tob) { rice -= 3; S.carry = ['tob', 'tob']; tobPlants.visible = true; }
  S.jar = rice; S.mode = 'fadeA'; S.endT = 0; $('fade').style.opacity = 1;
}
function autumnNow() { golden.count = 0; for (let i = 0; i < 360; i++) { const p = paddy[i % 9]; _o.position.set(FIELD[0] + (i % 9 % 3) * 7.4 + 0.4 + rnd() * 6.2, 0, FIELD[1] + Math.floor(i % 9 / 3) * 6 + 0.4 + rnd() * 4.8); _o.updateMatrix(); golden.setMatrixAt(golden.count++, _o.matrix); } golden.instanceMatrix.needsUpdate = true; seedlings.count = 0; paddy.forEach((p) => p.material.color.set(0x9a8a5a)); neighbors.forEach((m) => (m.visible = false));
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
  if (r !== 'cow') overlay(`<h1>${head}</h1><p>${story}</p>${marks}${extra}<p class="keys">같은 마을에서도 누구는 땅을 늘리고, 누구는 땅을 잃었다.</p>${facts}`, '이듬해 한 번 더', () => { resetRound(false); S.mode = 'title'; begin(); });
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
  packs.forEach((m, i) => m.position.set(S.px - Math.cos(S.pdir) * 0.45, y + 1.0 + i * 0.4, S.pz - Math.sin(S.pdir) * 0.45));
  if (S.mode === 'plant' && S.beats < 8) { pMesh.position.set(14, 0, 44); pMesh.rotation.y = Math.PI; pMesh.rotation.x = Math.max(0, 0.6 - S.bPh * 2) * 0.6; pRing.position.set(14, 0.11, 44); } else pMesh.rotation.x = 0;
  $('bAct').style.display = ctl.isTouch && S.mode === 'plant' && S.beats < 8 ? 'flex' : 'none';
  const play = S.mode === 'play';
  MKT.forEach((m, mi) => { showTag(mktTags[mi], m.x, 4.2, m.z - 2, play && dist(S.px, S.pz, m.x, m.z) < 26 ? `${m.name}${m.k === 'A' && S.day === S.maskDay ? ' 🎭' : ''}<br>${GKEYS.map((g) => `${GOODS[g].i}<b>${sellP(m.k, g)}</b>`).join(' ')}` : null);
    GKEYS.forEach((g, i) => { const sx = m.x - 4 + i * 4, d = dist(S.px, S.pz, sx, m.z + 0.6); showTag(stallTags[mi][i], sx, 2.6, m.z - 1, play && d < 3.2 ? (S.carry.includes(g) ? `${GOODS[g].i} 팔면 <b class="up">+${sellP(m.k, g)}</b>` : `${GOODS[g].i} 사면 <b class="dn">−${buyP(m.k, g)}</b>`) : null); }); });
  showTag(tagGov, GOV[0], 3.2, GOV[1] - 1.4, play && dist(S.px, S.pz, GOV[0], GOV[1]) < 12 ? `🧰 ${Math.floor(S.paid)}/${S.need}냥 <small>(쌀은 한 섬 ${GOV_RICE}냥)</small>` : null);
  showTag(tagJar, JAR[0], 2.4, JAR[1], play && dist(S.px, S.pz, JAR[0], JAR[1]) < 9 ? `🟡⬆꺼내기 · 🏺 <b>${S.jar}</b>섬 · 붓기⬇🔵` : null);
  showTag(tagMask, MASK[0], 3.4, MASK[1] - 1.8, play && S.day === S.maskDay && !S.maskSeen && dist(S.px, S.pz, MASK[0], MASK[1]) < 14 ? '🎭 구경' : null);
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

resetRound(true); place();
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; begin(); SFX.song(); };
runLoop(update, view, () => renderer.render(scene, cam));
window.__scene = { S, update, keys, ctl, act, sellP, buyP, nRice,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 160) { let t = 0; for (const [x, z] of pts) { let stuck = 0; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz), ox = S.px, oz = S.pz; ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - ox, S.pz - oz) < 0.003) { if (++stuck > 45) break; } else stuck = 0; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  plant(hits, tob) { /* 시험용: 모내기를 정한 만큼 맞추고 담배 여부 */ let h = 0; for (let g = 0; g < 30 * 14 && S.mode === 'plant' && S.beats < 8; g++) { update(1 / 60); if (h < hits && !S.pressed && Math.abs(S.bPh - 0) < 0.02) { act(); h++; } } if (tob) { S.px = TOB[0]; S.pz = TOB[1]; } for (let g = 0; g < 30 * 9 && S.mode === 'plant'; g++) { ctl.sx = ctl.sz = 0; update(1 / 30); } for (let g = 0; g < 80 && S.mode !== 'play'; g++) { update(1 / 30); } },
  const: { JAR, JOUT, JIN, MKT, GOV, MASK, TOB, PASS, FOOD } };
