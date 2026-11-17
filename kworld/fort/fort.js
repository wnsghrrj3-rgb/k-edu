/* 케이월드 · 성을 지켜라 — 삼국·가야 한 장면(S05, 2026-11-17). 본보기 = 그믐밤, 공통 부품 = ../scene/kit.js.
   목표는 하나(성벽 위 깃발 셋 — 새벽까지 하나라도 서 있으면 지킨 것)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 뚫리면 다음 판은 성벽이 낮다.
   구간(서·가운데·동)마다 띠가 차오른다. 화살이 떨어지면 두 배로, 지붕에 불이 붙거나 성벽이 무너지면 더 빨리. 다 차면 그 깃발이 꺾인다.
   무엇이 모자란지는 깃발 위 그림에 늘 뜬다(🏹 남은 화살 · 🔥 → 💧 · 🧱). 한 번에 하나씩 들고 뛰어 나른다.
   좌표: x 동쪽(+), z 남쪽(+). 북쪽 성벽(z=10) 너머에 적. 남쪽 문 밖 들에 남은 사람들. 첫 판은 고구려 산성(나라는 나중에 고를 자리만 둔다). */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, gridPath, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, groundAt, runLoop } from '../scene/kit.js?v=1';

const W = 80, H = 66, BX = [10, 70], BZ = [12, 62], NIGHT = 240;
const NATION = { name: '고구려', flag: 0xc0302a };
const SEC_X = [20, 40, 60], STA = SEC_X.map((x) => [x, 13.6]), FLAG = SEC_X.map((x) => [x, 9.6]);
const HUT = [[14, 17], [46, 17], [66, 17]];
const WELL = [28, 23], SMITHY = [54, 23], STONES = [40, 22], BEACON = [66, 47], GRANARY = [40, 41], HELPER0 = [40, 32];
const FIELD_PEOPLE = [[28, 59.5], [35, 61], [46, 60], [53, 59]];
const SOLID = [[8, 8, 72, 11, 4, 'wallN'], [8, 53, 37, 55, 3.4, 'wallS'], [43, 53, 72, 55, 3.4, 'wallS'], [7, 8, 9, 55, 3.4, 'wallW'], [71, 8, 73, 55, 3.4, 'wallE'],
  [26.6, 21.6, 29.4, 24.4, 1, 'well'], [50, 25.5, 58, 30, 3, 'smithy'], [36, 38, 44, 44, 3, 'granary'], [63.5, 49, 68.5, 53, 2, 'beacon'], [37.5, 20.5, 42.5, 23.5, 1.2, 'stones']];
for (const [x, z] of HUT) SOLID.push([x - 2, z - 1.5, x + 2, z + 1.5, 2.4, 'hut']);
const seed0 = +(new URLSearchParams(location.search).get('seed') || (Date.now() % 100000));

/* ───── 화면(밤) ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0x1a2448, 70, 200], exposure: 1.15 });
const hemi = new THREE.HemisphereLight(0x8aa4e0, 0x2a3a5a, 1.15); scene.add(hemi);
const moon = sunLight(scene, { color: 0xc8d8ff, intensity: 0.9, box: [44, 38], far: 160, pos: [W / 2 - 30, 50, H / 2 + 26], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261121);
const sky = skyDome(scene, rnd, { top: 0x0a1230, low: 0x2b4a86, stars: 380 });
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* 땅 · 성벽 · 성 안 */
flat(-60, -40, W + 60, H + 30, 0x4a7a44, 0);
flat(9, 11, 71, 53, 0x8a8a6a, 0.02);
flat(37, 53, 43, 66, 0x9a8a6a, 0.03);
for (let i = 0; i < 70; i++) { const t = box(0.6 + rnd(), 0.08, 0.5 + rnd(), rnd() > 0.5 ? 0x7a7a5a : 0x9a9a7a); t.castShadow = false; at(t, 10 + rnd() * 60, 0.05, 12 + rnd() * 40); scene.add(t); }
for (let i = 0; i < 40; i++) { const t = box(1 + rnd() * 2, 0.1, 0.8 + rnd(), 0x6a8a4a); t.castShadow = false; at(t, -10 + rnd() * 100, 0.04, 56 + rnd() * 10); scene.add(t); }
const crenels = [];
function wall(x0, z0, x1, z1, h, north) { const w = x1 - x0, d = z1 - z0; scene.add(at(box(w, h, d, 0x9a948a), (x0 + x1) / 2, h / 2, (z0 + z1) / 2)); const n = Math.round(Math.max(w, d) / 1.6); for (let i = 0; i < n; i++) { const c = box(w > d ? 0.9 : w + 0.1, 0.8, w > d ? d + 0.1 : 0.9, 0xaaa49a); /* 가로 성벽은 x 로, 세로 성벽은 z 로 늘어선다 */ at(c, w > d ? x0 + (i + 0.5) * w / n : (x0 + x1) / 2, h + 0.4, w > d ? (z0 + z1) / 2 : z0 + (i + 0.5) * d / n); scene.add(c); if (north) crenels.push(c); } }
wall(8, 8, 72, 11, 4, true); wall(8, 53, 37, 55, 3.4); wall(43, 53, 72, 55, 3.4); wall(7, 8, 9, 55, 3.4); wall(71, 8, 73, 55, 3.4);
scene.add(at(box(4, 3.4, 0.4, 0x5a3a20), 40, 1.7, 11.2), at(box(1.2, 4.4, 1.4, 0x8a847a), 37.4, 2.2, 54), at(box(1.2, 4.4, 1.4, 0x8a847a), 42.6, 2.2, 54));
/* 성벽 위 걷는 길 · 계단(눈에만) */
for (const x of SEC_X) scene.add(at(box(3, 0.3, 2.4, 0x7a746a), x, 0.15, 12.6));
scene.add(at(cyl(1.2, 1.3, 1, 0x9a948a, 12), WELL[0], 0.5, WELL[1]), at(cyl(0.95, 0.95, 0.06, 0x3a7ac0, 12), WELL[0], 0.98, WELL[1]));
{ const P = [at(box(8, 2.6, 4.5, 0x6a5a4a), 54, 1.3, 27.75)], r = box(9, 0.5, 5.5, 0x4a3a2a); at(r, 54, 2.85, 27.75); P.push(r); group([50, 25.5, 58, 30], P); }
const forge = glowSprite(scene, 'rgba(255,170,90,.95)', 'rgba(255,90,30,0)', 4); forge.position.set(SMITHY[0], 1.2, SMITHY[1] + 1.6);
const forgeL = new THREE.PointLight(0xff8a3a, 8, 14, 1.6); forgeL.position.set(SMITHY[0], 2, SMITHY[1] + 1.4); scene.add(forgeL);
{ const P = [at(box(8, 3, 6, 0xb8a078), 40, 1.5, 41)], r = new THREE.Mesh(new THREE.ConeGeometry(6, 2.2, 4), M(0x6a5a8a)); r.rotation.y = Math.PI / 4; r.position.set(40, 4.1, 41); P.push(r); group([36, 38, 44, 44], P); }
for (let k = 0; k < 14; k++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + rnd() * 0.3, 0), M(0xb0aaa0)); at(s, STONES[0] - 2 + (k % 5), 0.4 + Math.floor(k / 5) * 0.5, STONES[1] - 0.8 + (k % 3) * 0.7); s.castShadow = true; scene.add(s); }
scene.add(at(box(5, 2, 4, 0x8a847a), BEACON[0], 1, BEACON[1] + 4), at(cyl(1, 1.2, 1.4, 0x6a5a4a, 8), BEACON[0], 2.7, BEACON[1] + 4));
const beaconFire = new THREE.Group(); for (let k = 0; k < 3; k++) beaconFire.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.7 - k * 0.15, 1.6 + k * 0.4, 6), new THREE.MeshBasicMaterial({ color: [0xff5a2a, 0xffa23a, 0xffe07a][k] })), 0, 0.8 + k * 0.1, 0)); beaconFire.position.set(BEACON[0], 3.4, BEACON[1] + 4); beaconFire.visible = false; scene.add(beaconFire);
const beaconGlow = glowSprite(scene, 'rgba(255,190,90,.95)', 'rgba(255,110,30,0)', 9); beaconGlow.position.set(BEACON[0], 4.8, BEACON[1] + 4); beaconGlow.visible = false;
const farBeacons = [[110, -60], [140, -20], [170, 30]].map(([x, z]) => { const g = glowSprite(scene, 'rgba(255,180,80,.9)', 'rgba(255,100,30,0)', 10); g.position.set(x, 14, z); g.visible = false; return g; });
const huts = HUT.map(([x, z]) => { const P = [at(box(4, 1.8, 3, 0xb8a078), x, 0.9, z)], r = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 4), M(0x8a6a3a)); r.rotation.y = Math.PI / 4; r.position.set(x, 2.6, z); P.push(r); group([x - 2, z - 1.5, x + 2, z + 1.5], P);
  const f = new THREE.Group(); for (let k = 0; k < 3; k++) f.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.6 - k * 0.12, 1.2 + k * 0.3, 5), new THREE.MeshBasicMaterial({ color: [0xff5a2a, 0xffa23a, 0xffe07a][k] })), (k - 1) * 0.5, 0.6, 0)); f.position.set(x, 3.0, z); f.visible = false; scene.add(f);
  const l = new THREE.PointLight(0xff7a2a, 0, 12, 1.6); l.position.set(x, 3.4, z); scene.add(l); return { f, l }; });
/* 깃발 · 성벽 밖 사다리·흙더미·횃불 */
const flags = FLAG.map(([x, z]) => { const g = new THREE.Group(); g.add(at(cyl(0.08, 0.1, 4.2, 0x6a4526, 6), 0, 2.1, 0)); const cloth = box(1.8, 1.1, 0.06, NATION.flag); cloth.position.set(0.95, 3.6, 0); g.add(cloth); g.position.set(x, 4.8, z); scene.add(g); g.userData.cloth = cloth; return g; });
const ladders = SEC_X.map((x) => Array.from({ length: 5 }, (_, k) => { const g = new THREE.Group(); g.add(at(box(0.14, 5, 0.14, 0x8a6a40), -0.45, 2.5, 0), at(box(0.14, 5, 0.14, 0x8a6a40), 0.45, 2.5, 0)); for (let r = 0; r < 5; r++) g.add(at(box(0.9, 0.08, 0.08, 0x8a6a40), 0, 0.6 + r * 0.95, 0)); g.position.set(x - 7 + k * 3.4, 0, 7.2); g.rotation.x = -0.32; g.visible = false; scene.add(g); return g; }));
const mounds = SEC_X.map((x) => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), M(0x6a5a3a)); m.scale.set(8, 0.01, 2.6); m.position.set(x, 0, 6.6); m.castShadow = true; scene.add(m); return m; });
const enemyLights = Array.from({ length: 18 }, (_, i) => { const g = glowSprite(scene, 'rgba(255,170,80,.9)', 'rgba(255,90,30,0)', 2.2); g.userData = { sec: i % 3, a: rnd() * 6, r: 3 + rnd() * 7 }; return g; });
const volleys = Array.from({ length: 12 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.2), new THREE.MeshBasicMaterial({ color: 0xe8dcc0 })); m.visible = false; scene.add(m); return { m, t: 9 }; });

/* 사람 */
const SKIN = 0xf0c48e;
const pMesh = person({ shirt: 0x8a3a2a, pants: 0x3a2a24, hat: 'guard', skin: SKIN });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const carryM = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.5), M(0xd8c090)); carryM.visible = false; scene.add(carryM);
const guards = SEC_X.map((x) => [x - 1.2, x + 1.2].map((gx) => { const m = person({ shirt: 0x6a3a2a, pants: 0x3a2a24, hat: 'guard', mood: 'stern', skin: SKIN }); m.position.set(gx, 4.0, 9.6); m.rotation.y = Math.PI; return m; }));
const helpers = [], fieldPeople = [];
function mkHelper(x, z, kind) { const m = person({ shirt: kind === 'field' ? 0xc8b08a : 0x9a8a68, pants: 0x6a5034, hat: 'top', skin: SKIN }); return { m, x, z, sec: -1, follow: false, inside: kind !== 'field', dir: 0 }; }
const tagBox = $('tags'); const secTags = SEC_X.map(() => { const d = document.createElement('div'); d.className = 'tag'; d.innerHTML = '<span class="ic"></span><span class="fill"><i></i></span>'; tagBox.appendChild(d); return d; });

/* ───── 소리 ───── */
const SFX = {
  drum: (v = 0.25) => { tone(70, 45, 0.5, 'sine', v); noise(0.2, v, 120); },
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  drop: () => { tone(523, 784, 0.16, 'triangle', 0.14); noise(0.08, 0.2, 900); },
  volley: () => { for (let i = 0; i < 4; i++) noise(0.06, 0.12, 2400 + i * 300, i * 0.04); },
  fire: () => { for (let i = 0; i < 5; i++) noise(0.1, 0.18, 1200 + i * 200, i * 0.08); },
  splash: () => noise(0.25, 0.3, 1400),
  crash: () => { noise(0.5, 0.5, 160); tone(90, 50, 0.6, 'sawtooth', 0.12); },
  brk: () => { tone(220, 90, 0.8, 'sawtooth', 0.16); noise(0.4, 0.3, 300); },
  horn: () => { tone(180, 190, 1.4, 'sawtooth', 0.1); tone(270, 280, 1.4, 'sine', 0.07); },
  tick: () => tone(1400, 1400, 0.04, 'square', 0.03),
  pump: () => { noise(0.25, 0.3, 300); tone(90, 60, 0.25, 'sine', 0.12); },
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.6, 'triangle', 0.16, i * 0.18)); },
  sad: () => { tone(330, 220, 1.2, 'sine', 0.14); tone(262, 175, 1.4, 'sine', 0.1, 0.4); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', round: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, k: 0, px: 40, pz: 30, pdir: -Math.PI / 2, moving: false, running: false, said: {}, sayT: 0,
  fill: [0, 0, 0], arrows: [3, 3, 3], fire: [false, false, false], breach: [false, false, false], lost: [false, false, false], carry: null, beacon: false, bellows: 0, forged: false, kPhase: 0, kTick: false, rescued: 0,
  focus: 0, events: [], dawn: NIGHT, low: 1, workT: 0, workKey: '', endT: 0, shown: false, introT: 0, beatT: 0, stepT: 0, delivered: 0 };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 가만히 서면 집고·쌓는다 · 깃발 아래로 가져가면 놓는다 · 땅을 누르면 도울 사람을 보낸다 · 「시점」 ⟲⟳';
const grid = new Uint8Array(W * H); for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { const cx = x + 0.5, cz = z + 0.5; let b = cx < BX[0] || cx > BX[1] || cz < BZ[0] || cz > BZ[1]; for (const s of SOLID) if (inRect(cx, cz, s, 0.7)) b = true; grid[z * W + x] = b ? 1 : 0; }
const findPath = gridPath(grid, W, H);

function resetRound(full) {
  if (full) { S.round = 1; S.low = 1; }
  const r = rng(seed0 * 3 + S.round * 97);
  const pickSec = () => Math.floor(r() * 3);
  S.events = [{ t: 55, kind: 'fire', sec: pickSec() }, { t: 95, kind: 'breach', sec: pickSec() }, { t: 125, kind: 'fire', sec: pickSec() }, { t: 165, kind: 'breach', sec: pickSec() }, { t: 195, kind: 'fire', sec: pickSec() }];
  Object.assign(S, { t: 0, k: 0, px: 40, pz: 30, pdir: -Math.PI / 2, fill: [0, 0, 0], arrows: [4, 4, 4], arrT: [0, 0, 0], fire: [false, false, false], breach: [false, false, false], lost: [false, false, false], carry: null, beacon: false, bellows: 0, forged: false, rescued: 0, focus: pickSec(), focusT: 0, dawn: NIGHT, workT: 0, endT: 0, shown: false, delivered: 0 });
  for (const h of helpers) scene.remove(h.m); helpers.length = 0; for (const f of fieldPeople) scene.remove(f.m); fieldPeople.length = 0;
  helpers.push(mkHelper(HELPER0[0], HELPER0[1], 'castle')); for (const [x, z] of FIELD_PEOPLE) fieldPeople.push(mkHelper(x, z, 'field'));
  flags.forEach((f) => { f.rotation.z = 0; f.visible = true; }); huts.forEach((h) => { h.f.visible = false; h.l.intensity = 0; }); crenels.forEach((c) => (c.visible = true));
  beaconFire.visible = beaconGlow.visible = false; farBeacons.forEach((g) => (g.visible = false)); $('fade').style.opacity = 0; lightFor(0); hud();
}
function hud() {
  const ic = { arrows: '🏹 화살', water: '💧 물동이', stone: '🧱 성돌' }; $('hCarry').textContent = S.carry ? ic[S.carry] + ' 들었음' : '손 비었음';
  const idle = helpers.filter((h) => h.sec < 0).length; $('hHelp').textContent = `🙋 도울 사람 ${helpers.length}` + (helpers.length ? ` (쉬는 ${idle})` : '');
  $('tBeacon').className = S.beacon ? 'on' : ''; $('tForge').className = S.forged ? 'on' : ''; $('tPeople').className = S.rescued >= 4 ? 'on' : ''; $('tPeople').textContent = `🏠 들에 남은 사람 들이기 ${S.rescued}/4`;
  $('night').querySelector('i').style.width = clamp(S.t / S.dawn, 0, 1) * 100 + '%';
}

/* ───── 입력 ───── */
const secOf = (x) => (x < 30 ? 0 : x < 50 ? 1 : 2);
canvas.addEventListener('pointerdown', (e) => { if (S.mode === 'intro') { S.introT = 99; return; } if (S.mode !== 'play') return; const hit = groundAt(cam, e.clientX, e.clientY); if (hit) sendHelper(secOf(hit[0])); });
function sendHelper(sec) {
  if (S.lost[sec]) return say('그 깃발은 이미 꺾였다', null, 1.6);
  const h = helpers.filter((h) => h.sec !== sec).sort((a, b) => (a.sec < 0 ? 0 : 1) - (b.sec < 0 ? 0 : 1) || dist(a.x, a.z, STA[sec][0], STA[sec][1]) - dist(b.x, b.z, STA[sec][0], STA[sec][1]))[0];
  if (!h) return say(helpers.length ? '도울 사람이 다 거기 있다' : '도울 사람이 없다 — 들에 남은 사람을 들이자', null, 2);
  h.sec = sec; h.path = null; SFX.pick(); ring(STA[sec][0], STA[sec][1] + 1.5, 2.5, 0xffcf4d); say(['서쪽', '가운데', '동쪽'][sec] + ' 성벽으로 한 사람 보냈다 — 띠가 더디게 찬다', null, 2.2); hud();
}
function act() {
  if (S.mode !== 'play') return;
  if (!S.forged && dist(S.px, S.pz, SMITHY[0], SMITHY[1]) < 2.6) { const ok = Math.abs(S.kPhase - 0.9) < 0.14; if (ok) { S.bellows++; SFX.pump(); ring(SMITHY[0], SMITHY[1], 2, 0xffa040); forge.scale.setScalar(4 + S.bellows); if (S.bellows >= 4) { S.forged = true; SFX.drop(); hud(); say('풀무질 끝 — 화살이 빨리, 한 다발에 넷씩 나온다', null, 3); } else say(['훅—', '훅— 불이 세진다', '훅— 한 번 더'][S.bellows - 1], null, 1.2); } else { SFX.tick(); say('박자가 어긋났다 — 고리가 닿을 때', null, 1.4); } }
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) act(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });

/* ───── 끝 ───── */
function finish(win) { S.mode = win ? 'dawn' : 'fall'; S.endT = 0; S.endWin = win; SFX[win ? 'win' : 'sad'](); say(win ? (S.beacon ? '구원군이다! — 적이 물러간다' : '날이 샌다 — 적이 물러간다') : '깃발이 다 꺾였다 — 성을 비운다', null, 3); }
function endScreen() {
  const win = S.endWin, left = S.lost.filter((l) => !l).length;
  const marks = `<div class="marks"><span class="${left ? 'ok' : ''}">🚩 남은 깃발 ${left}/3</span><span class="${S.beacon ? 'ok' : ''}">🔥 ${S.beacon ? '봉수 올림' : '봉수 없음'}</span><span class="${S.forged ? 'ok' : ''}">⚒ ${S.forged ? '풀무질' : '대장간 그대로'}</span><span class="${S.rescued ? 'ok' : ''}">🏠 들인 사람 ${S.rescued}</span></div>`;
  if (win) overlay(`<h1>새벽</h1><p>동이 튼다. 성벽 위 깃발 ${left}개가 아직 서 있고, 적의 불빛이 멀리 물러간다.${S.beacon ? ' 봉수를 보고 온 구원군이 산 아래에 닿았다.' : ''}</p>${marks}
      <p class="keys">들을 비우고 성에 들어가 버틴다. 이 땅 사람들이 오래 써 온 방법이다.</p>
      <div class="fact">📜 <b>산성</b> — 고구려·백제·신라·가야는 험한 산에 성을 쌓고, 싸움이 나면 들을 비우고 들어가 지켰다.<br>📜 <b>쇠</b> — 쇠로 만든 무기와 갑옷이 싸움을 바꿨다. 가야는 쇠가 많이 나 이웃에 팔았다.<br>📜 <b>봉수</b> — 낮에는 연기, 밤에는 불로 먼 곳에 위급을 알렸다.<br>📜 <b>한강</b> — 세 나라는 땅이 기름지고 뱃길이 좋은 한강을 차지하려고 오래 다퉜다.</div>`,
      '한 번 더', () => { resetRound(true); S.mode = 'play'; });
  else overlay(`<h1>성을 비웠다</h1><p>깃발 셋이 다 꺾였다. 사람들을 데리고 산 위 성으로 물러났다.</p>${marks}
      <p>다음 싸움 — 무너진 데를 다 못 고쳐 <b>성벽이 낮다</b>. 띠가 더 빨리 찬다.</p><p class="keys">${S.round + 1}번째 밤 · 깃발은 다시 선다.</p>`,
      '다시 성벽으로', () => { S.round++; S.low *= 1.15; resetRound(false); S.mode = 'play'; say('성벽이 낮아졌다 — 화살이 떨어지기 전에 날라 두자', null, 3); });
}

/* ───── 하늘(밤 → 새벽) ───── */
const SKY = [[0, 0x0a1230, 0x2b4a86, 0xc8d8ff, 0.9, 1.15], [0.7, 0x0c1438, 0x2a3a78, 0xc8d8ff, 0.85, 1.1], [0.9, 0x1a2458, 0x6a5a98, 0xe8d0c0, 0.9, 1.15], [1.0, 0x3a5a9a, 0xffb07a, 0xffd0a0, 1.4, 1.3], [1.2, 0x6aa0e0, 0xffe0b8, 0xfff0d0, 2.0, 1.4]];
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); let lastSky = -1;
function lightFor(k) { let a = SKY[0], b = SKY[SKY.length - 1]; for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = clamp((k - a[0]) / ((b[0] - a[0]) || 1), 0, 1); cT.set(a[1]).lerp(tc.set(b[1]), t); cL.set(a[2]).lerp(tc.set(b[2]), t);
  if (Math.abs(k - lastSky) > 0.004) { sky.paint(cT, cL); lastSky = k; } scene.fog.color.copy(cL); moon.color.set(a[3]).lerp(tc.set(b[3]), t); moon.intensity = lerp(a[4], b[4], t); hemi.intensity = lerp(a[5], b[5], t); }

/* ───── 한 걸음 ───── */
const v3 = new THREE.Vector3();
function rateOf(i) {
  if (S.lost[i]) return 0;
  const base = lerp(1 / 240, 1 / 130, clamp(S.k, 0, 1)) * S.low;
  const nh = helpers.filter((h) => h.sec === i && dist(h.x, h.z, STA[i][0], STA[i][1]) < 3).length;
  return base * (S.focus === i ? 1.5 : 1) * (S.arrows[i] > 0 ? 1 : 2.0) * (S.fire[i] ? 1.5 : 1) * (S.breach[i] ? 1.8 : 1) * (1 - 0.25 * Math.min(nh, 2));
}
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  forge.material.opacity = 0.7 + Math.sin(S.t * 9) * 0.15; forgeL.intensity = 7 + Math.sin(S.t * 11) * 1.5;
  for (const g of enemyLights) { const u = g.userData; u.a += dt * 0.4; const x = SEC_X[u.sec] + Math.cos(u.a) * u.r, z = 2 - Math.abs(Math.sin(u.a)) * u.r * 0.6; g.position.set(x, 1.6, z); g.material.opacity = (S.mode === 'dawn' ? clamp(1 - S.endT / 3, 0, 1) : S.lost[u.sec] ? 0.4 : 0.9) * (0.75 + Math.sin(S.t * 7 + u.a) * 0.2); if (S.mode === 'dawn') g.position.z -= S.endT * 6; }
  for (const v of volleys) if (v.t < 1) { v.t += dt * 1.4; v.m.position.set(v.x0, 5 + Math.sin(v.t * Math.PI) * 3, lerp(9, -6, v.t)); v.m.rotation.x = -0.6 + v.t * 1.2; if (v.t >= 1) v.m.visible = false; }
  huts.forEach((h, i) => { h.f.visible = S.fire[i]; if (S.fire[i]) { h.f.scale.setScalar(0.9 + Math.sin(S.t * 13 + i) * 0.12); h.l.intensity = 14 + Math.sin(S.t * 17) * 3; } else h.l.intensity = 0; });
  if (beaconFire.visible) { beaconFire.scale.setScalar(0.9 + Math.sin(S.t * 11) * 0.1); beaconGlow.material.opacity = 0.75 + Math.sin(S.t * 5) * 0.2; }
  if (S.mode === 'title' || S.mode === 'intro') { if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.2) { S.mode = 'play'; SFX.drum(0.35); say('적이 성벽에 붙었다 — 깃발 위 그림을 보고 모자란 것을 나르자', null, 3.6); } } placeAll(dt); return; }
  if (S.mode === 'dawn' || S.mode === 'fall') { S.endT += dt; const kk = S.mode === 'dawn' ? Math.min(1.15, S.k + S.endT * 0.08) : S.k; lightFor(kk); if (S.endT > 5 && !S.shown) { S.shown = true; endScreen(); } placeAll(dt); return; }
  if (S.mode !== 'play') return;

  /* 밤 · 봉수 · 공세 */
  S.k = S.t / NIGHT; lightFor(S.k * (NIGHT / S.dawn)); hud();
  if (S.t >= S.dawn) return finish(true);
  S.focusT = (S.focusT || 0) + dt; if (S.focusT > 35) { S.focusT = 0; const alive = [0, 1, 2].filter((i) => !S.lost[i]); S.focus = alive[Math.floor(rng(seed0 + Math.floor(S.t))() * alive.length)] ?? 0; SFX.drum(0.3); say(['서쪽', '가운데', '동쪽'][S.focus] + ' 성벽에 적이 몰린다!', null, 2.2); }
  for (const e of S.events) if (!e.done && S.t >= e.t) { e.done = true; const i = S.lost[e.sec] ? [0, 1, 2].find((j) => !S.lost[j]) ?? e.sec : e.sec;
    if (e.kind === 'fire') { S.fire[i] = true; SFX.fire(); say(['서쪽', '가운데', '동쪽'][i] + ' 망루 지붕에 불화살! — 우물에서 물동이를', null, 3); }
    else { S.breach[i] = true; SFX.crash(); say(['서쪽', '가운데', '동쪽'][i] + ' 성벽이 무너졌다! — 성돌을 날라 쌓자', null, 3); } }
  /* 띠 */
  for (let i = 0; i < 3; i++) { if (S.lost[i]) continue;
    S.fill[i] = Math.min(1, S.fill[i] + rateOf(i) * dt);
    S.arrT = S.arrT || [0, 0, 0]; S.arrT[i] += dt; if (S.arrT[i] > 12 && S.arrows[i] > 0) { S.arrT[i] = 0; S.arrows[i]--; const v = volleys.find((v) => v.t >= 1); if (v) { v.t = 0; v.x0 = SEC_X[i] + (rnd() - 0.5) * 6; v.m.visible = true; } SFX.volley(); if (S.arrows[i] === 0) say(['서쪽', '가운데', '동쪽'][i] + ' 화살이 떨어졌다! — 대장간에서 화살 다발을', null, 2.8); }
    if (S.fill[i] >= 1) { S.lost[i] = true; S.fire[i] = false; S.breach[i] = false; flags[i].rotation.z = 1.3; SFX.brk(); say(['서쪽', '가운데', '동쪽'][i] + ' 깃발이 꺾였다!', null, 2.6); for (const h of helpers) if (h.sec === i) h.sec = -1; hud(); }
    ladders[i].forEach((l, k) => (l.visible = S.fill[i] > k * 0.18 + 0.05)); mounds[i].scale.y = Math.max(0.01, S.fill[i] * 2.2); mounds[i].position.y = S.fill[i] * 1.1; }
  if (S.lost.every(Boolean)) return finish(false);

  /* 나 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 4.9 : 3.2) * (back ? 0.6 : 1) * (S.carry === 'stone' ? 0.85 : 1); const [nx, nz] = collideRects(SOLID, S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); if (S.view !== 2) S.pdir = Math.atan2(iz, ix); S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; noise(0.05, 0.06, 300); } }

  /* 가만히 서서: 화살·물·돌 집기 · 무너진 곳 쌓기 · 봉수 */
  let job = null, need = 1;
  const nearSec = [0, 1, 2].find((i) => dist(S.px, S.pz, STA[i][0], STA[i][1] + 0.6) < 2.8);
  if (!S.carry && dist(S.px, S.pz, SMITHY[0], SMITHY[1]) < 2.6) { job = 'arrows'; need = S.forged ? 0.4 : 1.0; }
  if (!S.carry && dist(S.px, S.pz, WELL[0], WELL[1]) < 2.4) { job = 'water'; need = 0.7; }
  if (!S.carry && dist(S.px, S.pz, STONES[0], STONES[1] + 2) < 2.6) { job = 'stone'; need = 0.7; }
  if (S.carry === 'stone' && nearSec != null && S.breach[nearSec]) { job = 'repair'; need = 1.2; }
  if (!S.beacon && dist(S.px, S.pz, BEACON[0], BEACON[1]) < 2.4) { job = 'beacon'; need = 1.8; }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  overBar($('work'), cam, S.px, 2.6, S.pz, job && S.workT > 0.05 ? S.workT / need : null);
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'arrows' || job === 'water' || job === 'stone') { S.carry = job; SFX.pick(); say({ arrows: '화살 다발 — 화살이 모자란 깃발 아래로', water: '물동이 — 불붙은 망루로', stone: '성돌 — 무너진 성벽 아래에 가만히 서서 쌓는다' }[job], 'pick' + job, 2.6); }
    if (job === 'repair') { S.breach[nearSec] = false; S.carry = null; SFX.drop(); ring(STA[nearSec][0], STA[nearSec][1], 3, 0xffcf4d); say('성벽을 다시 쌓았다', null, 1.8); }
    if (job === 'beacon') { S.beacon = true; S.dawn = NIGHT * 0.82; beaconFire.visible = beaconGlow.visible = true; farBeacons.forEach((g) => (g.visible = true)); SFX.horn(); say('봉수가 올랐다! 먼 봉우리가 차례로 받는다 — 구원군이 새벽에 온다', null, 3.4); }
    hud(); }
  /* 들고 가면 놓는다: 화살은 깃발 아래 · 물은 불난 망루 */
  if (S.carry === 'arrows' && nearSec != null && !S.lost[nearSec]) { const add = S.forged ? 4 : 3; S.arrows[nearSec] = Math.min(6, S.arrows[nearSec] + add); S.fill[nearSec] = Math.max(0, S.fill[nearSec] - 0.12); S.carry = null; S.delivered++; SFX.drop(); ring(STA[nearSec][0], STA[nearSec][1], 2.6, 0xe8dcc0); say(`화살 ${add}다발을 올렸다`, null, 1.4); hud(); }
  if (S.carry === 'water') { const hi = HUT.findIndex(([x, z], i) => S.fire[i] && dist(S.px, S.pz, x, z + 2) < 2.8); if (hi >= 0) { S.fire[hi] = false; S.carry = null; SFX.splash(); ring(HUT[hi][0], HUT[hi][1], 3, 0x7ab0ff); say('불을 껐다', null, 1.4); hud(); } }
  if (S.carry === 'stone' && nearSec != null && !S.breach[nearSec] && !S.said['stoneNo' + nearSec]) say('여기는 무너지지 않았다 — 무너진 곳으로', 'stoneNo' + nearSec, 1.8);
  /* 들의 사람: 곁에 가면 따라온다 → 성 안에 들면 돕는다 */
  for (const f of fieldPeople) { if (!f.follow && !f.inside && dist(S.px, S.pz, f.x, f.z) < 2.4) { f.follow = true; SFX.pick(); say('들에 남은 사람 — 따라온다. 성 안으로!', 'field1', 2.4); } if (f.follow && f.z < 52 && !f.inside) { f.inside = true; f.follow = false; S.rescued++; helpers.push(f); f.sec = -1; f.hx = 40 + (S.rescued - 2) * 1.6; f.hz = 36; SFX.drop(); say(`성 안으로 들였다 — 도울 사람이 ${helpers.length}명`, null, 2); hud(); } }
  /* 대장간 풀무: 박자 고리 */
  const atForge = !S.forged && dist(S.px, S.pz, SMITHY[0], SMITHY[1]) < 2.6;
  if (atForge) { S.kPhase = (S.kPhase + dt / 1.0) % 1; if (S.kPhase > 0.88 && !S.kTick) { S.kTick = true; SFX.tick(); } if (S.kPhase < 0.5) S.kTick = false; say(ctl.isTouch ? '풀무 — 고리가 닿을 때 「밟기」 넷(가만히 서 있으면 화살도 집는다)' : '풀무 — 고리가 닿을 때 스페이스 넷(가만히 서 있으면 화살도 집는다)', 'forge', 3.4); }
  $('bAct').style.display = atForge && ctl.isTouch ? 'flex' : 'none';
  placeAll(dt);

  /* 조임 */
  const worst = Math.max(...S.fill.map((f, i) => (S.lost[i] ? 0 : f)));
  const tension = clamp(Math.max((worst - 0.55) * 2.2, S.fire.some(Boolean) ? 0.4 : 0, S.breach.some(Boolean) ? 0.45 : 0), 0, 1);
  S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.4, tension); SFX.beat(0.06 + tension * 0.28); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(200,40,20,${tension * 0.45})`;
}
function stepPerson(h, dt, tx, tz, sp) {
  const dx = tx - h.x, dz = tz - h.z, l = Math.hypot(dx, dz); h.moving = l > 0.4;
  if (h.moving) { if (!h.path || (h.repath -= dt) <= 0) { h.path = findPath(h.x, h.z, tx, tz) || []; h.pi = 0; h.repath = 1.2; } let nx = tx, nz = tz; if (h.path.length) { while (h.pi < h.path.length - 1 && dist(h.x, h.z, h.path[h.pi][0], h.path[h.pi][1]) < 0.7) h.pi++; [nx, nz] = h.path[h.pi]; if (l < 1.6) { nx = tx; nz = tz; } }
    const ex = nx - h.x, ez = nz - h.z, el = Math.hypot(ex, ez) || 1, st = Math.min(l, sp * dt); [h.x, h.z] = collideRects(SOLID, h.x + ex / el * st, h.z + ez / el * st, 0.4); h.dir = Math.atan2(ez, ex); }
  h.m.position.set(h.x, 0, h.z); h.m.rotation.y = -h.dir + Math.PI / 2; walkAnim(h.m, S.t * 10 + h.x, h.moving);
}
function placeAll(dt) {
  pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving); pRing.position.set(S.px, 0.11, S.pz);
  carryM.visible = !!S.carry; if (S.carry) { carryM.position.set(S.px, 1.9, S.pz); carryM.material.color.set(S.carry === 'arrows' ? 0xe8dcc0 : S.carry === 'water' ? 0x5a8ad8 : 0xb0aaa0); }
  for (const h of helpers) { if (h.sec >= 0) stepPerson(h, dt, STA[h.sec][0] + (helpers.indexOf(h) % 2 ? 1.4 : -1.4), STA[h.sec][1] + 1.2, 3.6); else stepPerson(h, dt, h.hx ?? HELPER0[0], h.hz ?? HELPER0[1], 3); }
  for (const f of fieldPeople) if (!f.inside) { if (f.follow) { const bx = -Math.cos(S.pdir), bz = -Math.sin(S.pdir); stepPerson(f, dt, S.px + bx * 1.6, S.pz + bz * 1.6, 3.8); } else { f.m.position.set(f.x, 0, f.z); walkAnim(f.m, 0, false); } }
  for (const g of guards.flat()) walkAnim(g, 0, false);
  /* 깃발 위 그림: 띠 · 남은 화살 · 불 · 무너짐 */
  secTags.forEach((d, i) => { const q = v3.set(SEC_X[i], 9.8, 9.6).project(cam); if (S.mode !== 'play' || q.z > 1) { d.style.display = 'none'; return; } d.style.display = 'block'; const tx = clamp(((q.x + 1) / 2) * innerWidth, 60, innerWidth - 60); d.style.left = tx + 'px'; d.style.top = clamp(((1 - q.y) / 2) * innerHeight, innerWidth < 640 ? 300 : tx < 290 ? 228 : 120, innerHeight - 160) + 'px'; /* 깃발이 화면 밖이어도 그림은 가장자리에 남는다 */
    d.className = 'tag' + (S.lost[i] ? ' lost' : '');
    const html = S.lost[i] ? '🏳️ 꺾임' : `<span class="${S.arrows[i] === 0 ? 'need' : ''}">🏹${S.arrows[i]}</span>${S.fire[i] ? ' <span class="need">🔥→💧</span>' : ''}${S.breach[i] ? ' <span class="need">🧱</span>' : ''}`;
    const ic = d.querySelector('.ic'); if (ic._h !== html) { ic.innerHTML = html; ic._h = html; } d.querySelector('.fill i').style.width = S.fill[i] * 100 + '%'; d.querySelector('.fill').style.display = S.lost[i] ? 'none' : ''; });
  flags.forEach((f, i) => { if (!S.lost[i]) f.userData.cloth.rotation.y = Math.sin(S.t * 3 + i) * 0.15; });
  crenels.forEach((c) => { const i = secOf(c.position.x); c.visible = !(S.breach[i] && Math.abs(c.position.x - SEC_X[i]) < 3.5); });
}
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(40, 40, e), lerp(14, 40, e), lerp(-14, 60, e)); cam.lookAt(lerp(40, 40, e), lerp(4, 0, e), lerp(10, 28, e)); if (cam.fov !== 44) { cam.fov = 44; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'dawn' || S.mode === 'fall') { v3.set(40, 16, 34); cam.position.lerp(v3, 0.03); cam.lookAt(40, 4, 6); }
  else followCam(cam, S, { W, H, clampZ: [4, H - 6], map: { h: [90, 170], z: 10, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  /* 가장 위급한 깃발을 가장자리 빛으로 */
  let wi = 0, wf = -1; for (let i = 0; i < 3; i++) if (!S.lost[i] && S.fill[i] > wf) { wf = S.fill[i]; wi = i; }
  edgeGoal($('goal'), cam, v3.set(SEC_X[wi], 9, 9.6).clone(), S.mode === 'play', 0.8);
  const kn = $('knap'); if (S.mode === 'play' && !S.forged && dist(S.px, S.pz, SMITHY[0], SMITHY[1]) < 2.6) { const q = v3.set(SMITHY[0], 0.8, SMITHY[1]).project(cam); kn.style.display = 'block'; kn.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; kn.style.top = ((1 - q.y) / 2) * innerHeight - 70 + 'px'; const r = Math.max(8, 84 - 62 * S.kPhase), i = kn.querySelector('i'); i.style.width = i.style.height = r + 'px'; i.style.borderColor = Math.abs(S.kPhase - 0.9) < 0.14 ? '#ffcf4d' : '#fff'; } else kn.style.display = 'none';
}

resetRound(true); placeAll(0.016);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.horn(); };
runLoop(update, view, () => renderer.render(scene, cam));
window.__scene = { S, helpers, fieldPeople, update, keys, ctl, act, sendHelper, rateOf,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { let stuck = 0; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz), ox = S.px, oz = S.pz; ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - ox, S.pz - oz) < 0.005) { if (++stuck > 30) break; } else stuck = 0; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  path: (ax, az, bx, bz) => findPath(ax, az, bx, bz),
  const: { STA, HUT, WELL, SMITHY, STONES, BEACON, FIELD_PEOPLE, SEC_X } };
