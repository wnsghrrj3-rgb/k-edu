/* 케이월드 · 만세 전날 밤 — 개항~일제 한 장면(S09, 2026-11-17). 틀은 그믐밤과 같다(불빛 · 그늘 · 소리 · 새벽). 공통 부품 = ../scene/kit.js.
   목표는 하나(불 꺼진 다섯 집 — 받은 집은 창에 불이 켜진다)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 들키면 다음 밤은 순찰이 하나 늘고 등사기를 옮겨 다시 찍는다.
   등사기: 스페이스를 박자에 맞추면 한 묶음씩 찍힌다(품에 셋까지) — 찍을 때마다 소리가 샌다. 헌병 손전등 불빛 안에 들면 들킨다(그믐밤 순라꾼과 같은 들킴 띠).
   밀정(평복): 가까이서 오래 마주치면 뒤를 밟는다. 뒤가 밟힌 채 집에 가면 그 집은 불이 켜지지 않는다 — 골목을 돌아 보이지 않게 하거나 숨어서 따돌린다.
   실제 인물·지명은 넣지 않는다(「어느 읍내」). 끝 화면에 진압은 그리지 않는다.
   좌표: x 동쪽(+), z 남쪽(+). 서쪽 예배당, 북쪽 주재소, 남동쪽 장터. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, losRects, rayLenRects, gridPath, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, groundAt, runLoop } from '../scene/kit.js?v=1';

const W = 70, H = 50, BX = [1, 69], BZ = [1, 49], DAWN = 210;
const HOUSES = [[22, 12], [34, 20], [55, 14], [63, 30], [28, 45]];
const PRESSES = [[10, 41], [41, 47.4]], FLAGT = [[14, 41.6], [45.5, 47.4]], BELL = [56, 44.6], START = [8, 42.5];
const BLOCKS = [[12, 14], [44, 26], [20, 24], [50, 32], [40, 40], [66, 8], [8, 6], [14, 30.5]];
const HIDE = [[18, 33, 1.4], [31, 32, 1.4], [46, 16, 1.4], [59, 22, 1.4], [26, 6, 1.4], [35, 32.5, 1.3], [62, 41, 1.3], [17, 47, 1.3], [50, 49, 1.3]];   /* 순찰길에서 3m 넘게 떨어진 곳에만 */
for (const [x, z] of HOUSES) HIDE.push([x + 3.6, z + 3.8, 1.1]);   /* 집마다 문 곁 장독대 — 기다릴 곳 */
const LAMPS = [[42, 10, 7], [56, 39, 6], [30, 22, 4.5]];
const SOLID = [[3, 32, 12, 39, 5, 'church'], [36, 2, 48, 8, 3.5, 'police'], [50, 40.5, 54, 42, 2, 'stall'], [58, 40.5, 62, 42, 2, 'stall'], [55.6, 44.2, 56.4, 45, 4, 'bell']];
for (const [x, z] of HOUSES) SOLID.push([x - 2.5, z - 2, x + 2.5, z + 2, 2.8, 'house']);
for (const [x, z] of BLOCKS) SOLID.push([x - 3, z - 2, x + 3, z + 2, 2.8, 'block']);
const STONES0 = [[20, 38], [33, 15], [48, 36], [60, 18], [24, 30], [52, 46]];
const PATROLS0 = [[[28, 10.5], [52, 10.5], [52, 21.5], [28, 21.5]], [[45, 29.5], [67, 29.5], [67, 47], [45, 47]], [[23, 27.5], [40, 27.5], [40, 36.5], [23, 36.5]]];
const PATROL_EXTRA = [[[6, 10.5], [26, 10], [26, 18], [6, 18]], [[16, 44], [36, 44], [36, 48], [16, 48]]];
const SPY_W = [[26, 17], [46, 21.5], [38, 31], [56, 25.5], [30, 40], [47, 44.5], [18, 27]];
const TRIG = [{ s: '☰', c: 0 }, { s: '☵', c: 1 }, { s: '☲', c: 2 }, { s: '☷', c: 3 }];   /* 건(왼위) · 감(오른위) · 리(왼아래) · 곤(오른아래) */

/* ───── 화면(밤) ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0x16264c, 70, 190], exposure: 1.12 });
const hemi = new THREE.HemisphereLight(0x9db8ff, 0x34507a, 1.2); scene.add(hemi);
const moon = sunLight(scene, { color: 0xd6e4ff, intensity: 0.55, box: [44, 34], pos: [W / 2 - 34, 32, H / 2 - 24], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261125);
const { skyMat } = skyDome(scene, rnd, { top: 0x0a1230, low: 0x2b4a86, stars: 380 });
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* 땅 · 길 · 집 */
flat(-40, -40, W + 40, H + 40, 0x4a6a4a, 0);
flat(0, 0, W, H, 0x8a7a64, 0.02);
for (let i = 0; i < 80; i++) { const t = box(0.6 + rnd(), 0.08, 0.5 + rnd(), rnd() > 0.5 ? 0x7a6a54 : 0x9a8a72); t.castShadow = false; at(t, 1 + rnd() * 68, 0.05, 1 + rnd() * 48); scene.add(t); }
function house([x0, z0, x1, z1, h], c = 0xb8a888, roof = 0x4a4a5a) { const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, P = [at(box(w, h * 0.7, d, c), cx, h * 0.35, cz)]; const r = box(w + 1, 0.7, d + 1, roof); at(r, cx, h * 0.7 + 0.35, cz); P.push(r); P.push(at(box(1, 1.4, 0.1, 0x3a2a1a), cx, 0.7, z1 + 0.05)); group([x0, z0, x1, z1], P); }
{ const [x0, z0, x1, z1, h] = SOLID[0]; const P = [at(box(x1 - x0, h * 0.7, z1 - z0, 0xc8b8a0), (x0 + x1) / 2, h * 0.35, (z0 + z1) / 2)]; const s = new THREE.Shape(); s.moveTo(-4.5, 0); s.lineTo(0, 2.6); s.lineTo(4.5, 0); s.closePath(); const r = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: x1 - x0 + 1, bevelEnabled: false }), M(0x5a4a5a)); r.rotation.y = Math.PI / 2; r.position.set(x0 - 0.5, h * 0.7, (z0 + z1) / 2); P.push(r); P.push(at(box(1.6, 3, 1.6, 0xc8b8a0), x0 + 1.6, h * 0.7 + 2.4, 35.5), at(box(0.2, 1.2, 0.2, 0xe8e0d0), x0 + 1.6, h * 0.7 + 4.5, 35.5), at(box(0.7, 0.2, 0.2, 0xe8e0d0), x0 + 1.6, h * 0.7 + 4.7, 35.5)); group([x0, z0, x1, z1], P); }
house(SOLID[1], 0x8a8a8a, 0x2a2a3a);
const houses = HOUSES.map(([x, z]) => { house([x - 2.5, z - 2, x + 2.5, z + 2, 2.8], 0xc8b898, 0x4a4a5a); const win = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.08), new THREE.MeshBasicMaterial({ color: 0x1a1a24 })); win.position.set(x + 1.4, 1.3, z + 2.06); scene.add(win); const g = glowSprite(scene, 'rgba(255,214,130,.95)', 'rgba(255,170,60,0)', 3.2); g.position.set(x + 1.4, 1.3, z + 2.3); g.visible = false; return { x, z, win, g, state: 'dark' }; });
for (const [x, z] of BLOCKS) house([x - 3, z - 2, x + 3, z + 2, 2.8], 0x9a8e7a, 0x3a3a48);
for (const s of SOLID.filter((s) => s[5] === 'stall')) scene.add(at(box(s[2] - s[0], 0.9, s[3] - s[1], 0x7a6040), (s[0] + s[2]) / 2, 0.45, (s[1] + s[3]) / 2), at(box(s[2] - s[0] + 0.5, 0.1, s[3] - s[1] + 1, 0xb8a888), (s[0] + s[2]) / 2, 2, (s[1] + s[3]) / 2));
const bellG = new THREE.Group(); bellG.add(at(cyl(0.12, 0.14, 4, 0x6a4526, 6), 0, 2, 0), at(box(1.6, 0.16, 0.16, 0x6a4526), 0, 3.9, 0)); const bellM = at(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.55, 0.8, 10), M(0xb08a40, { metalness: 0.5, roughness: 0.4 })), 0.5, 3.3, 0); bellG.add(bellM); const rope = at(box(0.05, 2.6, 0.05, 0xd8c090), 0.5, 1.6, 0); rope.visible = false; bellG.add(rope); bellG.position.set(BELL[0], 0, BELL[1]); scene.add(bellG);
const lampGlows = LAMPS.map(([x, z]) => { scene.add(at(cyl(0.08, 0.1, 3.2, 0x3a3a3a, 6), x, 1.6, z)); const g = glowSprite(scene, 'rgba(255,230,170,.9)', 'rgba(255,190,100,0)', 5); g.position.set(x, 3.3, z); const l = new THREE.PointLight(0xffd8a0, 9, 12, 1.6); l.position.set(x, 3.2, z); scene.add(l); return g; });
const hideMeshes = HIDE.map(([x, z, r], i) => { const g = new THREE.Group(); g.position.set(x, 0, z); if (i % 2 === 0) g.add(at(cyl(r * 0.6, r * 0.95, 1.3, 0x8a7a4a, 8), 0, 0.65, 0), at(cyl(r * 0.2, r * 0.66, 0.9, 0x9a8a5a, 8), 0, 1.75, 0)); else for (let k = 0; k < 4; k++) g.add(at(cyl(0.4, 0.32, 0.9, 0x5a3a2a, 8), Math.cos(k * 1.7) * 0.7, 0.45, Math.sin(k * 1.7) * 0.7)); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g; });
/* 지하 등사기 · 태극기 그리는 상 */
const pressM = new THREE.Group(); pressM.add(at(box(1.4, 0.8, 1, 0x3a3a3a), 0, 0.4, 0), at(cyl(0.18, 0.18, 1.2, 0x6a6a6a, 8), 0, 1, 0)); pressM.children[1].rotation.z = Math.PI / 2; const pressHatch = at(box(2.2, 0.1, 1.8, 0x5a3a20), 0, 0.05, 0); scene.add(pressM, pressHatch);
const pressGlow = glowSprite(scene, 'rgba(255,214,150,.8)', 'rgba(255,170,60,0)', 3);
const tableM = new THREE.Group(); tableM.add(at(box(1.4, 0.6, 0.9, 0x6a4526), 0, 0.3, 0), at(box(1.0, 0.04, 0.7, 0xffffff), 0, 0.62, 0)); scene.add(tableM);
/* 사람 */
const SKIN = 0xf0c48e;
const pMesh = person({ shirt: 0xe8e0d0, pants: 0x4a4a5a, hat: 'top', skin: SKIN });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const packM = box(0.5, 0.3, 0.4, 0xf6f2e6); packM.visible = false; scene.add(packM);
function mkCone(col) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(26 * 3), 3)); const idx = []; for (let i = 1; i < 25; i++) idx.push(0, i + 1, i); geo.setIndex(idx); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = 2; scene.add(m); return m; }
let guards = [];
function mkGuard(path) { const m = person({ shirt: 0x3a4a3a, pants: 0x2a2a2a, hat: 'guard', mood: 'stern', lantern: true, skin: SKIN }); const l = new THREE.PointLight(0xfff0c0, 9, 10, 1.6); scene.add(l); return { path, x: path[0][0], z: path[0][1], wp: 1, dir: 0, state: 'patrol', tx: 0, tz: 0, wait: 0, lost: 0, p: null, pi: 0, repath: 0, see: 0, mesh: m, light: l, cone: mkCone(0xfff0a0) }; }
const spy = { m: person({ shirt: 0x4a4a4a, pants: 0x2a2a2a, hat: 'gat', skin: SKIN }), x: SPY_W[0][0], z: SPY_W[0][1], wi: 1, sus: 0, tail: false, lostT: 0, dir: 0 };
const flying = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), M(0xd6dbe6, { emissive: 0x39404e })); flying.visible = false; scene.add(flying);
let stoneMeshes = [];
const crowd = [], flags = [];
for (let i = 0; i < 30; i++) { const m = person({ shirt: [0xe8e0d0, 0xd8d0c0, 0xc8c0b0, 0xf0e8d8][i % 4], pants: 0x4a4a5a, hat: i % 3 ? 'top' : 'gat', skin: SKIN }); m.position.set(50 + (i % 6) * 1.6, 0, 33 + Math.floor(i / 6) * 1.4); m.rotation.y = Math.PI; m.visible = false; crowd.push(m); const f = new THREE.Group(); f.add(at(cyl(0.03, 0.03, 1.6, 0x6a4526, 5), 0, 0.8, 0)); const cl = box(0.8, 0.55, 0.03, 0xffffff); cl.position.set(0.42, 1.35, 0); f.add(cl); const dot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), new THREE.MeshBasicMaterial({ color: 0xc0302a })); dot.position.set(0.42, 1.35, 0.02); f.add(dot); f.position.set(0.5, 0.9, 0); f.visible = false; m.add(f); flags.push(f); }

/* ───── 소리 ───── */
const SFX = {
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  press: () => { noise(0.12, 0.35, 600); tone(180, 140, 0.12, 'square', 0.06); },
  miss: () => tone(260, 180, 0.2, 'sawtooth', 0.06),
  tick: () => tone(1400, 1400, 0.04, 'square', 0.03),
  whistle: () => { tone(2100, 2500, 0.28, 'square', 0.12); tone(2500, 2000, 0.3, 'square', 0.12, 0.3); },
  huh: () => tone(300, 420, 0.18, 'sawtooth', 0.07),
  clack: () => { noise(0.07, 0.5, 2400); noise(0.05, 0.3, 1800, 0.12); },
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  done: () => { tone(523, 523, 0.14, 'triangle', 0.16); tone(784, 784, 0.22, 'triangle', 0.16, 0.14); },
  bad: () => { tone(330, 200, 0.5, 'sawtooth', 0.08); },
  step: () => noise(0.05, 0.12, 300),
  caught: () => tone(220, 70, 0.7, 'sawtooth', 0.2),
  bell: () => { for (let i = 0; i < 4; i++) { tone(880, 870, 1.2, 'sine', 0.12, i * 0.7); tone(1320, 1310, 0.8, 'sine', 0.05, i * 0.7); } },
  rooster: () => { tone(700, 1100, 0.25, 'sawtooth', 0.12); tone(1100, 900, 0.2, 'sawtooth', 0.12, 0.25); tone(900, 1300, 0.5, 'sawtooth', 0.12, 0.45); },
  cheer: () => { for (let i = 0; i < 10; i++) noise(0.3, 0.12, 500 + i * 80, i * 0.15); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', night: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, dawn: 0, px: START[0], pz: START[1], pdir: -Math.PI / 2, moving: false, running: false, hidden: false, inLamp: false, said: {}, sayT: 0,
  pack: 0, printed: 0, press: 0, kPhase: 0, kTick: false, flagStep: 0, flagScore: 0, flagCur: 0, flagT: 0, flagDone: false, bell: false, stones: 2, fly: null, meter: 0, alert: false, seen: false, caughtN: 0,
  workT: 0, workKey: '', endT: 0, shown: false, introT: 0, beatT: 0, stepT: 0, roosted: false, ground: [] };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 「뛰기」는 소리 · 땅을 누르면 돌 던지기 · 등사기 앞에서 「찍기」 · 집 문 앞에 가만히 서면 건넨다 · 「시점」 ⟲⟳';
const allSolid = SOLID;
const grid = new Uint8Array(W * H); for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { const cx = x + 0.5, cz = z + 0.5; let b = false; for (const s of SOLID) if (inRect(cx, cz, s, 0.55)) b = true; grid[z * W + x] = b ? 1 : 0; }
const findPath = gridPath(grid, W, H);
const los = (ax, az, bx, bz) => losRects(SOLID, ax, az, bx, bz);
const rayLen = (ax, az, dx, dz, max) => rayLenRects(SOLID, ax, az, dx, dz, max);

function resetNight(keepLit) {
  for (const g of guards) { scene.remove(g.mesh, g.cone, g.light); } guards = PATROLS0.concat(PATROL_EXTRA.slice(0, S.night - 1)).map(mkGuard);
  S.press = S.night > 1 ? 1 : 0;
  Object.assign(S, { t: 0, dawn: 0, px: S.press ? PRESSES[1][0] - 2 : START[0], pz: S.press ? PRESSES[1][1] : START[1], pdir: -Math.PI / 2, pack: 0, kPhase: 0, flagStep: 0, flagScore: keepLit ? S.flagScore : 0, flagDone: keepLit ? S.flagDone : false, stones: 2, fly: null, meter: 0, alert: false, workT: 0, endT: 0, shown: false, roosted: false });
  houses.forEach((h) => { if (!keepLit || h.state !== 'lit') { h.state = 'dark'; } h.g.visible = h.state === 'lit'; h.win.material.color.set(h.state === 'lit' ? 0xffd27a : 0x1a1a24); });
  Object.assign(spy, { x: SPY_W[0][0], z: SPY_W[0][1], wi: 1, sus: 0, tail: false, lostT: 0 });
  const P = PRESSES[S.press], T = FLAGT[S.press]; pressM.position.set(P[0], 0, P[1] - 0.9); pressHatch.position.set(P[0], 0.05, P[1] - 0.9); pressGlow.position.set(P[0], 1.3, P[1] - 0.9); tableM.position.set(T[0], 0, T[1] - 0.8);
  for (const m of stoneMeshes) scene.remove(m); stoneMeshes = []; S.ground = STONES0.map(([x, z]) => { const m = new THREE.Mesh(flying.geometry, flying.material); m.position.set(x, 0.2, z); scene.add(m); stoneMeshes.push(m); return { x, z, m, on: true }; });
  crowd.forEach((m) => (m.visible = false)); $('fade').style.opacity = 0;
  if (!S.flagDone) for (let c = 0; c < 4; c++) { $('k' + c).className = 'k'; $('k' + c).textContent = ''; }
  hud();
}
function hud() {
  $('hPack').textContent = '📜 ' + S.pack + '/3'; $('hStone').textContent = '🪨 ' + S.stones; $('tail').style.display = spy.tail ? '' : 'none';
  const hs = $('houses').children; houses.forEach((h, i) => { hs[i].className = h.state === 'lit' ? 'on' : h.state === 'bad' ? 'bad' : ''; hs[i].textContent = h.state === 'bad' ? '✘' : '🏠'; });
  $('tPrint').className = S.printed ? 'on' : ''; $('tFlag').className = S.flagDone ? 'on' : ''; $('tFlag').textContent = S.flagDone ? `🇰🇷 태극기 괘 ${S.flagScore}/4 바르게` : '🇰🇷 태극기 바르게 그리기'; $('tBell').className = S.bell ? 'on' : '';
}

/* ───── 입력: 스페이스 = 등사기 찍기 / 태극기 괘 놓기 ───── */
const atPress = () => dist(S.px, S.pz, PRESSES[S.press][0], PRESSES[S.press][1]) < 1.8;
const atTable = () => !S.flagDone && dist(S.px, S.pz, FLAGT[S.press][0], FLAGT[S.press][1]) < 1.6;
function act() {
  if (S.mode !== 'play') return;
  if (atTable()) { const tgt = TRIG[S.flagStep].c, ok = S.flagCur === tgt; if (ok) { S.flagScore++; SFX.done(); } else SFX.miss(); $('k' + tgt).textContent = TRIG[S.flagStep].s; $('k' + tgt).className = 'k ok'; S.flagStep++; if (S.flagStep >= 4) { S.flagDone = true; say(`태극기를 다 그렸다 — 괘 ${S.flagScore}/4 제자리`, null, 2.6); hud(); } else say(ok ? '제자리다' : '자리가 어긋났다', null, 1); return; }
  if (atPress()) { if (S.pack >= 3) return say('품이 가득 찼다(셋) — 돌리고 오자', null, 1.8); const ok = Math.abs(S.kPhase - 0.9) < 0.14; makeNoise(PRESSES[S.press][0], PRESSES[S.press][1], 9, false); if (ok) { S.pack++; S.printed++; SFX.press(); say(S.pack >= 3 ? '세 묶음 — 품이 찼다' : '철컥 — 한 묶음 찍혔다', null, 1.2); hud(); } else { SFX.miss(); say('박자가 어긋났다 — 종이가 구겨졌다', null, 1.2); } }
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) act(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });
canvas.addEventListener('pointerdown', (e) => { if (S.mode === 'intro') { S.introT = 99; return; } if (S.mode !== 'play' || S.fly || S.stones < 1) return; const hit = groundAt(cam, e.clientX, e.clientY); if (!hit) return;
  let [tx, tz] = hit; const d = dist(S.px, S.pz, tx, tz); if (d < 1.2) return; if (d > 15) { tx = S.px + ((tx - S.px) / d) * 15; tz = S.pz + ((tz - S.pz) / d) * 15; }
  S.stones--; hud(); S.fly = { x0: S.px, z0: S.pz, x1: clamp(tx, 1, W - 1), z1: clamp(tz, 1, H - 1), t: 0 }; flying.visible = true; });

/* ───── 헌병(그믐밤 순라꾼과 같은 들킴) ───── */
function makeNoise(x, z, r, strong) { ring(x, z, r, strong ? 0xff8a5a : 0xffffff); for (const g of guards) { if (g.state === 'chase') continue; if (dist(g.x, g.z, x, z) <= r) { g.state = 'look'; g.tx = x; g.tz = z; g.p = null; g.wait = 2.6; SFX.huh(); } } }
function alertAll() { if (S.alert) return; S.alert = true; S.seen = true; SFX.whistle(); for (const g of guards) if (dist(g.x, g.z, S.px, S.pz) < 30) { g.state = 'chase'; g.p = null; g.lost = 0; g.tx = S.px; g.tz = S.pz; } say('호루라기! — 들켰다, 숨어!', null, 1.9); }
function drawCone(cone, x, z, dir, range, half, g) { const p = cone.geometry.attributes.position; p.setXYZ(0, x, 0.09, z); for (let i = 0; i <= 24; i++) { const a = dir - half + (i / 24) * half * 2, cx = Math.cos(a), cz = Math.sin(a), l = rayLen(x, z, cx, cz, range); p.setXYZ(i + 1, x + cx * l, 0.09, z + cz * l); } p.needsUpdate = true;
  const m = cone.material; m.opacity = g.state === 'chase' ? 0.36 : g.see ? 0.4 : 0.22; m.color.set(g.state === 'chase' || g.see ? 0xff5a3c : g.state === 'look' ? 0xffe27a : 0xfff0a0); }
function stepGuard(g, dt) {
  const lit = S.inLamp && !S.hidden, range = 9.5 * (lit ? 1.5 : 1), half = 0.5 * (lit ? 1.2 : 1);
  const d = dist(g.x, g.z, S.px, S.pz); let sees = false;
  if (d < range && S.mode === 'play') { let a = Math.atan2(S.pz - g.z, S.px - g.x) - g.dir; a = Math.atan2(Math.sin(a), Math.cos(a)); if ((Math.abs(a) < half || d < 1.5) && los(g.x, g.z, S.px, S.pz) && !(S.hidden && d > 1.7)) sees = true; }
  g.see = sees;
  if (sees && S.mode === 'play') { S.meter += dt / lerp(0.3, 1.1, clamp(d / range, 0, 1)); if (g.state !== 'chase' && S.meter > 0.35) { g.state = 'look'; g.tx = S.px; g.tz = S.pz; g.p = null; g.wait = 1.5; } }
  let sp = 1.7, tx, tz;
  if (g.state === 'chase') { sp = 3.8; if (sees) { g.tx = S.px; g.tz = S.pz; g.lost = 0; } else { g.lost += dt; if (g.lost > 4.5) { g.state = 'look'; g.wait = 3; g.p = null; } } tx = g.tx; tz = g.tz; if (d < 1.05 && S.mode === 'play' && !(S.hidden && !sees)) return caught(); }
  else if (g.state === 'look') { sp = 2.5; tx = g.tx; tz = g.tz; if (dist(g.x, g.z, tx, tz) < 1.3) { g.wait -= dt; g.dir += dt * 1.6; if (g.wait <= 0) { g.state = 'patrol'; g.p = null; } drawCone(g.cone, g.x, g.z, g.dir, range, half, g); placeG(g, false); return; } }
  else { g.wp %= g.path.length; const w = g.path[g.wp]; tx = w[0]; tz = w[1]; if (dist(g.x, g.z, tx, tz) < 0.7) { g.wp = (g.wp + 1) % g.path.length; g.p = null; } }
  g.repath -= dt; if (!g.p || g.repath <= 0) { g.p = findPath(g.x, g.z, tx, tz); g.pi = 0; g.repath = g.state === 'chase' ? 0.35 : 1.5; }
  let nx = tx, nz = tz; if (g.p && g.p.length) { while (g.pi < g.p.length - 1 && dist(g.x, g.z, g.p[g.pi][0], g.p[g.pi][1]) < 0.6) g.pi++; nx = g.p[g.pi][0]; nz = g.p[g.pi][1]; if (g.pi >= g.p.length - 1 && los(g.x, g.z, tx, tz)) { nx = tx; nz = tz; } }
  const dx = nx - g.x, dz = nz - g.z, l = Math.hypot(dx, dz); if (l > 0.05) { g.x += (dx / l) * sp * dt; g.z += (dz / l) * sp * dt; let da = Math.atan2(dz, dx) - g.dir; da = Math.atan2(Math.sin(da), Math.cos(da)); g.dir += clamp(da, -dt * 5, dt * 5); }
  if (g.state === 'patrol') g.dir += Math.sin(S.t * 0.9 + g.x) * dt * 0.5;
  drawCone(g.cone, g.x, g.z, g.dir, range, half, g); placeG(g, l > 0.05, sp);
}
function placeG(g, moving, sp = 2) { g.mesh.position.set(g.x, 0, g.z); g.mesh.rotation.y = -g.dir + Math.PI / 2; walkAnim(g.mesh, S.t * (4 + sp * 2.2) + g.x, moving); g.light.position.set(g.x + Math.cos(g.dir) * 0.8, 1.2, g.z + Math.sin(g.dir) * 0.8); }
/* 밀정: 가까이 오래 마주치면 뒤를 밟는다 */
function stepSpy(dt) {
  const d = dist(spy.x, spy.z, S.px, S.pz), see = d < 5 && los(spy.x, spy.z, S.px, S.pz) && !S.hidden;
  let tx, tz, sp;
  if (!spy.tail) { const w = SPY_W[spy.wi]; tx = w[0]; tz = w[1]; sp = 1.4; if (dist(spy.x, spy.z, tx, tz) < 0.8) spy.wi = (spy.wi + 1) % SPY_W.length;
    if (see && S.mode === 'play') { spy.sus += dt; if (spy.sus > 0.4) say('평복 차림의 사내가 이쪽을 본다 — 오래 마주치지 말자', 'spy1', 2.6); if (spy.sus > 2.2) { spy.tail = true; spy.lostT = 0; SFX.bad(); say('밀정이 뒤를 밟는다! — 이대로 집에 가면 그 집이 위험하다. 골목을 돌아 따돌리자', null, 3.4); hud(); } } else spy.sus = Math.max(0, spy.sus - dt * 0.5); }
  else { tx = S.px; tz = S.pz; sp = d > 6 ? 3.4 : 0; const seeT = los(spy.x, spy.z, S.px, S.pz) && !S.hidden && d < 16; if (!seeT) spy.lostT += dt; else spy.lostT = Math.max(0, spy.lostT - dt * 0.5);
    if (spy.lostT > (S.hidden ? 2 : 4)) { spy.tail = false; spy.sus = 0; SFX.done(); say('따돌렸다 — 밀정이 엉뚱한 골목으로 갔다', null, 2.4); hud(); } }
  if (!spy.path || (spy.repath -= dt) <= 0) { spy.path = findPath(spy.x, spy.z, tx, tz) || []; spy.pi = 0; spy.repath = 0.8; }
  let nx = tx, nz = tz; if (spy.path.length) { while (spy.pi < spy.path.length - 1 && dist(spy.x, spy.z, spy.path[spy.pi][0], spy.path[spy.pi][1]) < 0.6) spy.pi++; [nx, nz] = spy.path[spy.pi]; }
  const dx = nx - spy.x, dz = nz - spy.z, l = Math.hypot(dx, dz); if (l > 0.05 && sp > 0) { spy.x += dx / l * sp * dt; spy.z += dz / l * sp * dt; spy.dir = Math.atan2(dz, dx); }
  spy.m.position.set(spy.x, 0, spy.z); spy.m.rotation.y = -spy.dir + Math.PI / 2; walkAnim(spy.m, S.t * 9, l > 0.05 && sp > 0);
}

/* ───── 들킴 · 새벽 ───── */
function caught() {
  if (S.mode !== 'play') return; S.mode = 'over'; SFX.caught(); S.caughtN++;
  setTimeout(() => overlay(`<h1>끌려갔다</h1><p>헌병에게 붙잡혔다.</p><p>다음 밤 — <b>순찰이 하나 늘었고</b>, 등사기를 <b>다른 집 지하로 옮겨</b> 다시 찍어야 한다. 불이 켜진 집은 그대로다.</p><p class="keys">${S.night + 1}번째 밤 · 새벽 장은 아직 오지 않았다.</p>`, '다시 지하로', () => { S.night++; resetNight(true); S.mode = 'play'; say('등사기를 옮겼다 — 다시 찍자', null, 2.6); }), 700);
}
function morning() {
  S.mode = 'morning'; S.endT = 0; SFX.rooster(); const lit = houses.filter((h) => h.state === 'lit').length; S.lit = lit;
  const n = Math.min(30, lit * 6), nf = Math.round(n * (S.flagDone ? (1 + S.flagScore) / 5 : 0.2)); crowd.forEach((m, i) => (m.visible = i < n)); flags.forEach((f, i) => (f.visible = i < nf));
  if (S.bell) setTimeout(SFX.bell, 600); setTimeout(SFX.cheer, 1600);
  say(lit ? '날이 밝았다 — 장터로 사람들이 모인다' : '날이 밝았다…', null, 3);
}
function endScreen() {
  const lit = S.lit;
  const marks = `<div class="marks"><span class="${lit ? 'ok' : ''}">🏠 불 켜진 집 ${lit}/5</span><span class="${S.flagDone && S.flagScore >= 3 ? 'ok' : ''}">🇰🇷 ${S.flagDone ? `바른 괘 ${S.flagScore}/4` : '태극기 못 그림'}</span><span class="${S.bell ? 'ok' : ''}">🔔 ${S.bell ? '종이 울렸다' : '종 없음'}</span><span class="${S.seen || S.caughtN ? '' : 'ok'}">👁 ${S.caughtN ? `끌려간 밤 ${S.caughtN}` : S.seen ? '들킨 적 있음' : '들키지 않음'}</span></div>`;
  const story = lit >= 5 ? `아침 장터. 다섯 집 사람들이 ${S.bell ? '종소리에 맞춰 한꺼번에' : ''} 모여들고, 품에서 꺼낸 태극기가 하나둘 오른다.` : lit ? `아침 장터. 불이 켜졌던 ${lit}집 사람들이 모였다.` : '아침 장터는 여느 날과 같았다.';
  overlay(`<h1>그날 아침</h1><p>${story}</p>${marks}<p class="keys">그날, 온 나라 장터에서 같은 소리가 났다.</p>
    <div class="fact">📜 <b>3·1 운동</b> — 1919년 3월, 나라를 되찾자는 만세 소리가 온 나라로 번졌다. 학생, 농민, 상인이 함께했다.<br>📜 <b>준비한 사람들</b> — 선언서를 몰래 찍고 태극기를 그려 집집이 돌린 사람들이 있었다.<br>📜 <b>총칼 앞에서</b> — 일제는 총칼로 막았고 많은 사람이 다치고 잡혀갔다. 그래도 만세는 여러 달 이어졌다.<br>📜 <b>임시 정부</b> — 이 일 뒤 나라 밖 상하이에 대한민국 임시 정부가 세워졌다.</div>`,
    '한 번 더', () => { S.night = 1; S.caughtN = 0; S.seen = false; S.printed = 0; S.bell = false; rope.visible = false; resetNight(false); S.mode = 'play'; });
}

/* ───── 한 걸음 ───── */
const skyA = new THREE.Color(), skyB = new THREE.Color(0x16264c), skyD = new THREE.Color(0xf0b890);
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  for (const h of houses) if (h.state === 'lit') h.g.material.opacity = 0.75 + Math.sin(S.t * 3 + h.x) * 0.15;
  pressGlow.material.opacity = 0.5 + Math.sin(S.t * 3) * 0.2; lampGlows.forEach((g, i) => (g.material.opacity = 0.8 + Math.sin(S.t * 2 + i) * 0.1));
  if (S.mode === 'title' || S.mode === 'intro') { if (S.mode === 'intro') { S.introT += dt; if (S.introT > 3.6) { S.mode = 'play'; say('헌병 손전등을 피해 — 불 꺼진 다섯 집으로', null, 3); } } for (const g of guards) stepGuard(g, dt); place(); return; }
  if (S.mode === 'morning') { S.endT += dt; const k = clamp(S.endT / 3, 0, 1); moon.intensity = lerp(0.55, 2.2, k); hemi.intensity = lerp(1.2, 1.6, k); skyA.copy(skyB).lerp(skyD, k); scene.fog.color.copy(skyA); skyMat.color.setScalar(1 + k * 2); flags.forEach((f, i) => { if (f.visible) f.position.y = 0.9 + Math.min(1, S.endT * 0.5) * 0.6 + Math.sin(S.t * 4 + i) * 0.05; }); crowd.forEach((m, i) => { if (m.visible) m.rotation.z = Math.sin(S.t * 3 + i) * 0.05; }); if (S.endT > 5 && !S.shown) { S.shown = true; endScreen(); } return; }
  if (S.mode !== 'play') return;

  /* 새벽 */
  S.dawn += dt; const dk = clamp(S.dawn / DAWN, 0, 1); $('dawn').querySelector('i').style.width = dk * 100 + '%';
  if (dk > 0.86 && !S.roosted) { S.roosted = true; SFX.rooster(); say('닭이 운다 — 곧 날이 샌다!', null, 2.8); }
  if (dk >= 1) return morning();
  moon.intensity = 0.55 + dk * 0.3; hemi.intensity = 1.2 + dk * dk * 1.0; skyA.copy(skyB).lerp(skyD, dk * dk * 0.7); scene.fog.color.copy(skyA); skyMat.color.setScalar(1 + dk * dk * 1.6);

  /* 나 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 4.7 : 3.0) * (back ? 0.6 : 1); const [nx, nz] = collideRects(SOLID, S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); if (S.view !== 2) S.pdir = Math.atan2(iz, ix);
    S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; if (S.running) { SFX.step(); makeNoise(S.px, S.pz, 7.5); } } }
  S.hidden = false; for (let i = 0; i < HIDE.length; i++) { const [hx, hz, r] = HIDE[i], d = dist(S.px, S.pz, hx, hz); if (d < r + 0.75 && !S.running) { S.hidden = true; say('숨었다 — 여기 있으면 안 보인다', 'hide', 2.4); } hideMeshes[i].scale.setScalar(d < r + 0.75 ? 1.08 : 1); }
  S.inLamp = LAMPS.some(([x, z, r]) => dist(S.px, S.pz, x, z) < r); if (S.inLamp && !S.hidden) say('등불 아래 — 멀리서도 보인다', 'lamp', 2.2);
  for (const g of S.ground) if (g.on && dist(S.px, S.pz, g.x, g.z) < 1) { g.on = false; g.m.visible = false; S.stones++; hud(); SFX.pick(); say('돌멩이 — 땅을 누르면 던져 헌병을 그쪽으로', 'stone', 2.6); }

  /* 가만히 서서: 집에 건네기 · 종 줄 */
  let job = null, need = 1, arg = null;
  houses.forEach((h, i) => { if (!job && h.state === 'dark' && S.pack > 0 && dist(S.px, S.pz, h.x, h.z + 2.7) < 1.6) { job = 'give'; need = 0.9; arg = i; } });
  if (!job && !S.bell && dist(S.px, S.pz, BELL[0], BELL[1] + 1.2) < 1.6) { job = 'bell'; need = 1.6; }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  overBar($('work'), cam, S.px, 2.6, S.pz, job && S.workT > 0.05 ? S.workT / need : null);
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'give') { const h = houses[arg]; S.pack--; if (spy.tail) { h.state = 'bad'; SFX.bad(); say('뒤를 밟힌 채 왔다 — 이 집은 위험해졌다. 불을 켜지 못한다', null, 3); } else { h.state = 'lit'; h.g.visible = true; h.win.material.color.set(0xffd27a); SFX.done(); ring(h.x, h.z + 2.6, 2.4, 0xffd27a); say(`창에 작은 불이 켜졌다 — ${houses.filter((x) => x.state === 'lit').length}/5`, null, 2); } }
    if (job === 'bell') { S.bell = true; rope.visible = true; SFX.pick(); say('장터 종에 줄을 걸어 두었다 — 아침에 울린다', null, 2.6); }
    hud(); }
  if (houses.every((h) => h.state === 'lit')) say('다섯 집에 다 불이 켜졌다 — 새벽까지 숨어 있자', 'all5', 3);
  /* 돌 */
  if (S.fly) { const f = S.fly; f.t += dt / 0.55; const k = Math.min(1, f.t); flying.position.set(lerp(f.x0, f.x1, k), 0.8 + Math.sin(k * Math.PI) * 3, lerp(f.z0, f.z1, k)); if (k >= 1) { flying.visible = false; SFX.clack(); makeNoise(f.x1, f.z1, 10.5); S.fly = null; } }
  /* 등사기 · 태극기 상 */
  const ap = atPress(), at2 = atTable(); $('bAct').textContent = at2 ? '놓기' : '찍기'; $('bAct').style.display = ctl.isTouch && (ap || at2) ? 'flex' : 'none';
  if (ap) { S.kPhase = (S.kPhase + dt / 1.0) % 1; if (S.kPhase > 0.88 && !S.kTick) { S.kTick = true; SFX.tick(); } if (S.kPhase < 0.5) S.kTick = false; say(ctl.isTouch ? '등사기 — 고리가 닿을 때 「찍기」. 찍을 때마다 소리가 샌다' : '등사기 — 고리가 닿을 때 스페이스. 찍을 때마다 소리가 샌다', 'press', 3.2); }
  if (at2) { S.flagT += dt; if (S.flagT > 0.55) { S.flagT = 0; S.flagCur = (S.flagCur + 1) % 4; SFX.tick(); } say(`태극기 — 노란 자리가 ${TRIG[S.flagStep].s} 의 제자리에 올 때 스페이스(건 왼위 · 감 오른위 · 리 왼아래 · 곤 오른아래)`, 'flag', 4); }

  /* 헌병 · 밀정 */
  const m0 = S.meter; for (const g of guards) { stepGuard(g, dt); if (S.mode !== 'play') return; }
  if (S.meter === m0) S.meter = Math.max(0, S.meter - dt * 0.45);
  if (S.meter >= 1) { S.meter = 1; alertAll(); }
  if (S.alert && !guards.some((g) => g.state === 'chase')) { S.alert = false; S.meter = 0.2; say('따돌렸다…', null, 1.6); }
  stepSpy(dt);
  place();

  /* 조임 */
  let nearest = 99; for (const g of guards) nearest = Math.min(nearest, dist(g.x, g.z, S.px, S.pz));
  const tension = clamp(Math.max(S.meter, S.alert ? 1 : 0, 1 - nearest / 9, spy.tail ? 0.5 : 0, dk > 0.8 ? (dk - 0.8) * 4 : 0), 0, 1);
  S.beatT -= dt; if (tension > 0.12 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.36, tension); SFX.beat(0.1 + tension * 0.35); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(200,20,20,${S.alert ? 0.5 : S.meter * 0.55 + (spy.tail ? 0.12 : 0)})`;
}
function place() {
  pMesh.position.set(S.px, S.hidden ? -0.35 : 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; pMesh.scale.y = S.hidden ? 0.75 : 1; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving);
  pRing.position.set(S.px, 0.11, S.pz); pRing.material.opacity = S.hidden ? 0.2 : 0.6; pRing.material.color.set(S.inLamp && !S.hidden ? 0xff6a4a : S.hidden ? 0x7fe0a0 : 0xffffff);
  packM.visible = S.pack > 0; packM.position.set(S.px, 1.05, S.pz); packM.scale.y = S.pack;
}
const v3 = new THREE.Vector3();
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.4, 0, 1) : 0, e = k * k * (3 - 2 * k); cam.position.set(lerp(30, START[0] + 8, e), lerp(10, 30, e), lerp(30, START[1] + 22, e)); cam.lookAt(lerp(30, START[0] + 6, e), 0, lerp(20, START[1] - 4, e)); cam.fov = 44; cam.updateProjectionMatrix(); }
  else if (S.mode === 'morning') { v3.set(56, 9, 50); cam.position.lerp(v3, 0.04); cam.lookAt(55, 1.5, 36); }
  else followCam(cam, S, { W, H, map: { h: [82, 150], z: 6, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  /* 가장 가까운 불 꺼진 집(품에 있으면) 또는 등사기 쪽 가장자리 빛 */
  let gp = null; if (S.pack > 0) { let bd = 1e9; for (const h of houses) if (h.state === 'dark') { const d = dist(S.px, S.pz, h.x, h.z); if (d < bd) { bd = d; gp = [h.x, h.z + 2]; } } } else gp = PRESSES[S.press];
  edgeGoal($('goal'), cam, v3.set(gp ? gp[0] : 0, 1.5, gp ? gp[1] : 0).clone(), S.mode === 'play' && !!gp, 0.8);
  overBar($('eye'), cam, S.px, 2.7, S.pz, S.mode === 'play' && S.meter > 0.02 ? S.meter : null);
  const kn = $('knap'); if (S.mode === 'play' && atPress()) { const q = v3.set(PRESSES[S.press][0], 0.8, PRESSES[S.press][1]).project(cam); kn.style.display = 'block'; kn.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; kn.style.top = ((1 - q.y) / 2) * innerHeight - 70 + 'px'; const r = Math.max(8, 84 - 62 * S.kPhase), i = kn.querySelector('i'); i.style.width = i.style.height = r + 'px'; i.style.borderColor = Math.abs(S.kPhase - 0.9) < 0.14 ? '#ffcf4d' : '#fff'; } else kn.style.display = 'none';
  const fp = $('flagpad'); if (S.mode === 'play' && atTable()) { const q = v3.set(FLAGT[S.press][0], 1, FLAGT[S.press][1]).project(cam); fp.style.display = 'block'; fp.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; fp.style.top = ((1 - q.y) / 2) * innerHeight - 90 + 'px'; for (let c = 0; c < 4; c++) { const el = $('k' + c); if (!el.classList.contains('ok')) { el.textContent = c === S.flagCur ? TRIG[S.flagStep].s : ''; el.className = 'k' + (c === S.flagCur ? ' cur' : ''); } } } else fp.style.display = 'none';
}

resetNight(false); place();
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; };
runLoop(update, view, () => renderer.render(scene, cam));
window.__scene = { S, get guards() { return guards; }, spy, houses, update, keys, ctl, act, findPath,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { let stuck = 0; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz), ox = S.px, oz = S.pz; ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - ox, S.pz - oz) < 0.005) { if (++stuck > 45) break; } else stuck = 0; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode, meter: +S.meter.toFixed(2) }; },
  print(n) { let k = 0; for (let g = 0; g < 600 && k < n && S.mode === 'play'; g++) { update(1 / 60); if (Math.abs(S.kPhase - 0.9) < 0.02 && atPress()) { act(); k++; update(1 / 30); } } return k; },
  const: { HOUSES, PRESSES, FLAGT, BELL, START, HIDE } };
