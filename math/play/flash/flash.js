/* 번쩍 틀 「번쩍 궤짝과 불꽃」(3D, T09) — 밤 부두의 궤짝 덧문이 번쩍 열렸다 닫힌다 → 본 것이 몇인지 단추 줄에서 바로 누른다. 맞으면 내 폭죽이 올라가 터지고, 연달아 맞히면 불꽃이 커진다.
 * 설계: 핸드오프 kedu/math-play-work/T09_번쩍_틀.md · 정본 kmotion/math-wizard/27_수학놀이터_내용지도와_틀_설계_v1.md(4 · 5절 · 5-5 · 5-9 · 5-10 · 5-11). 규칙 = ./rules.js · 복습 = ./review.js(화면 없음).
 * 두 가지로 열린다: ?cell=A04 = 낱칸 나들이(한눈에 알아보기) · ?today=1 = 「오늘의 번쩍」(통과한 낱칸들의 복습 — 하루 한 번 · 끝난 뒤에는 덤 한 판). 둘 다 없으면 고르는 화면으로.
 * A04: 걸음 ① 보고 누르기(덧문이 열린 채 · 단추 1 · 2 · 3) → 걸음 ② 번쩍(덧문이 탁 열렸다 닫힘 · 단추 1~5 · 깨끗할수록 짧아짐 · 통과는 여기서만).
 *   맞으면 폭죽이 올라가 터지고 덧문이 다시 열려 통 위에 수가 찍힌다 · 아니면 폭죽이 피식 · 덧문이 열린 채 통이 하나씩 톡톡 세어지고 누른 단추가 물러난다(가위표 없음).
 * 사건(rules.js events): 심지(시계 · 생각하는 동안에만) · 구석(한쪽에 몰림 · 덧문 한 짝) · 금빛 폭죽 · 두 빛깔 · 흩어진 넷 · 다섯(통과 뒤) · 불꽃 잇기. 사건은 수를 바꾸지 않는다. 복습에는 심지 · 금빛 · 불꽃 잇기만.
 * 누름에는 늘 답이 있다(5-11): 덧문이 열린 동안의 누름 = 물결 + 「닫히면 눌러 줘」 · 빈 곳 = 물결 + 고를 것들이 들썩 + 한 줄 · 바쁜 동안(불꽃 · 하나씩 세는 중) = 물결. 깨끗함에 세지 않는다.
 * 그림은 기성 3D 재료만(Quaternius CC0 — ./assets · 이름표는 ./art.js). 불꽃 · 번쩍 빛 · 심지의 불똥은 입자(Points)와 조명. 화면 위 표시(띠 · 단추 · 세는 수 · 팻말 · 구슬 · 등불)만 코드로. */
import { createStage, THREE, CALM, LITE, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=2';
import * as H from '../common/hint.js?v=5';
import { wallet, audio, tone, confetti, grew } from '../common/kit.js?v=8';
import { art } from '../common/art.js?v=11';
import * as E from '../common/ends.js?v=1';
import * as M from '../common/map.js?v=11';
import * as C from '../common/choose.js?v=4';
import * as TL from '../common/tell.js?v=2';
import * as NS from '../common/numsign.js?v=3';
import * as R from './rules.js?v=2';
import * as V from './review.js?v=3';
import { ASSETS, MODEL, SCENERY, NIGHT, WOOD, TINTS, GOLD, ROCKET, FIRE, SPARK, SMOKE, ICON } from './art.js?v=2';

// ── 내가 정한 수치(화면 · 움직임 — 준호가 보고 바꾼다). 문제 · 사건 · 시계 수치는 ./rules.js 의 T · 복습은 ./review.js 의 MOVE
const T = { DECK: .45, WALL: .42, OPEN: 1.72, OPEN_MS: 110, CLOSE_MS: 110, PULL_MS: 260,
  WIDE: { anne: [-2.3, .3], rocket: [2.2, .35], span: 3.7, el: 1.02, fov: 38 }, TALL: { anne: [-1.05, 1.62], rocket: [1.0, 1.55], span: 1.78, el: 1.08, fov: 46 },
  ROCKET_S: [.42, 1.2], ROCKET_BIG: 1.25, BURST_Y: [1.55, 2.05], FUSE_N: 18, FUSE_LEN: .75,
  COUNT_MS: 430, TELL_LEAD: 1600, GROUP_BOB: .5, STAMP_MS: 90, FIT_HOLD: 1300, MISS_HOLD: 1200, ROLL_MS: 420, ROLL_GAP: 300, ROLL_HOLD: 900, TELL_GRACE: 5, HINT_PICK_X: 1,
  PARTS: LITE ? 520 : 1500, BURST: [50, 80, 120, 170, 230], SPEED: [1.0, 1.3, 1.6, 1.9, 2.3], SKY_FULL: 5, BOTTOM_TALL: 74, BOTTOM_WIDE: 22 };
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const GO = '/math/play/go/';
const WANT = Q.get('cell'), TODAY = Q.has('today'), MODE = WANT && R.CELLS[WANT] ? 'cell' : TODAY ? 'today' : null;
if (!MODE) location.replace(GO);
const W2 = R.T.CRATE.W / 2, D2 = R.T.CRATE.D / 2;
const S = { ready: false, mode: MODE, cell: MODE === 'cell' ? WANT : null, oid: 0, busy: true, active: false, t: 0, phase: 'idle', p: null, step: 2, level: 0, ev: {}, board: null, fire: 0, streak: 0, peekLeft: 0, clock: 0, fuseOff: false,
  res: null, lastAct: 0, back: false, goldCarry: false, hist: {}, log: [], q: [], closed: false, done: null, tall: false, low: false, open: { L: 0, R: 0 }, shown: { L: false, R: false }, launched: [], best: 0, maxFire: 0, bonus: false, cells: [], starred: [], topUI: 0, handTo: null, gold: false };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [14, 46], shadow: { left: -6, right: 6, top: 5, bottom: -5 }, assets: ASSETS }), { scene, camera } = stage;
const K = {};
const NAMES = [...new Set([...Object.values(MODEL), ...SCENERY.map(s => s[0])])];
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const L = () => S.tall ? T.TALL : T.WIDE;
const snd = (...a) => { if (TL.on()) tone(...a); };   /* 터지는 소리는 작게 · 끄는 단추는 tell.js 의 것 하나로 같이 */

// ── 밤(달빛 · 등불) — 무대의 낮 빛깔을 밤으로
stage.paintSky(NIGHT.SKY); scene.fog.color.set(NIGHT.FOG); stage.sea.material.color.set(NIGHT.SEA); stage.deep.material.color.set(NIGHT.DEEP);
stage.hemi.color.set(NIGHT.HEMI[0]); stage.hemi.groundColor.set(NIGHT.HEMI[1]); stage.hemi.intensity = NIGHT.HEMI[2]; stage.sun.color.set(NIGHT.MOON[0]); stage.sun.intensity = NIGHT.MOON[1]; stage.sun.position.set(-6, 9, 4);
const lamp = new THREE.PointLight(NIGHT.LAMP[0], NIGHT.LAMP[1], NIGHT.LAMP[2], 1.6); scene.add(lamp);
const flashLight = new THREE.PointLight(NIGHT.FLASH[0], 0, NIGHT.FLASH[2], 1.4); flashLight.position.set(0, T.DECK + .95, 0); scene.add(flashLight);
const boomLight = new THREE.PointLight('#ffffff', 0, 9, 1.2); scene.add(boomLight);
const tipLight = new THREE.PointLight(SPARK, 0, 1.6, 2); scene.add(tipLight);

// ── 입자(불꽃 · 불똥 · 연기 · 꼬리) — 하나의 Points 에 정해진 수만
const P = { n: T.PARTS, pos: new Float32Array(T.PARTS * 3), col: new Float32Array(T.PARTS * 3), vel: new Float32Array(T.PARTS * 3), life: new Float32Array(T.PARTS), max: new Float32Array(T.PARTS), base: new Float32Array(T.PARTS * 3), drag: new Float32Array(T.PARTS), grav: new Float32Array(T.PARTS), next: 0 };
const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(P.pos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(P.col, 3));
const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();   /* 알갱이 하나의 둥근 빛(화면 위 빛 — 물체 아님) */
const pMat = new THREE.PointsMaterial({ size: .2, map: dotTex, alphaTest: .01, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false });
const points = new THREE.Points(pGeo, pMat); points.frustumCulled = false; scene.add(points); for (let i = 0; i < P.n; i++) P.pos[i * 3 + 1] = -50;
const tmpC = new THREE.Color();
function emit(x, y, z, vx, vy, vz, life, color, drag = 1.6, grav = 1.4){ const i = P.next; P.next = (P.next + 1) % P.n; P.pos.set([x, y, z], i * 3); P.vel.set([vx, vy, vz], i * 3); P.life[i] = life; P.max[i] = life; tmpC.set(color); P.base.set([tmpC.r, tmpC.g, tmpC.b], i * 3); P.drag[i] = drag; P.grav[i] = grav; }
function partsTick(dt){ for (let i = 0; i < P.n; i++) { if (P.life[i] <= 0) { if (P.col[i * 3] || P.col[i * 3 + 1] || P.col[i * 3 + 2]) { P.col.fill(0, i * 3, i * 3 + 3); P.pos[i * 3 + 1] = -50; } continue; }
    P.life[i] -= dt; const k = Math.max(0, P.life[i] / P.max[i]), d = Math.exp(-P.drag[i] * dt); for (let c = 0; c < 3; c++) { P.vel[i * 3 + c] *= d; P.pos[i * 3 + c] += P.vel[i * 3 + c] * dt; } P.vel[i * 3 + 1] -= P.grav[i] * dt;
    const f = Math.min(1, k * 1.6) * (k > .15 || Math.sin(P.life[i] * 60) > 0 ? 1 : .2); P.col[i * 3] = P.base[i * 3] * f; P.col[i * 3 + 1] = P.base[i * 3 + 1] * f; P.col[i * 3 + 2] = P.base[i * 3 + 2] * f; }
  pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true; }
/** 불꽃 한 송이: level 1~5 = 크기(알갱이 수 · 퍼지는 빠르기) · gold = 금빛. */
function burst(x, y, z, level = 1, gold = false){ const L5 = Math.max(1, Math.min(R.T.FIRE_MAX, level)), n = Math.round(T.BURST[L5 - 1] * (LITE ? .55 : 1)), sp = T.SPEED[L5 - 1] * (gold ? 1.15 : 1), cols = gold ? [GOLD, '#fff2b0', GOLD] : [FIRE[(L5 + S.launched.length) % FIRE.length], FIRE[(L5 + 2) % FIRE.length], '#ffffff'];
  for (let k = 0; k < n; k++) { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u), s = sp * (.75 + Math.random() * .35); emit(x, y, z, r * Math.cos(a) * s, u * s + .2, r * Math.sin(a) * s, 1.1 + Math.random() * .5 + L5 * .08, cols[k % cols.length], 1.5, .9); }
  boomLight.position.set(x, y, z); boomLight.color.set(gold ? GOLD : cols[0]); boomLight.intensity = 4 + L5 * 2; S.log.push({ burst: L5, gold }); }
function puff(x, y, z, n = 18){ for (let k = 0; k < n; k++) emit(x + (Math.random() - .5) * .1, y, z + (Math.random() - .5) * .1, (Math.random() - .5) * .35, .25 + Math.random() * .35, (Math.random() - .5) * .35, .8 + Math.random() * .5, SMOKE, 1.2, -.05); }

// ── 짓기
let BK = null;   /* 통 모형 크기(위에서 본 지름 · 높이) */
const mats = {};
const tint = (m, c, k = .35) => { const x = m.clone(); x.color.set(c).lerp(new THREE.Color('#ffffff'), k); return x; };
function barrelMesh(){ const o = K[MODEL.barrel].scene.clone(); o.traverse(m => { if (m.isMesh) { m.castShadow = !LITE; m.receiveShadow = true; m.userData.base = m.material; } }); scene.add(o); o.visible = false; return o; }
function paint(o, mat){ o.traverse(m => { if (m.isMesh) m.material = mat || m.userData.base; }); }
const POOL = [], GHOSTS = [], COVERS = [];
async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); }));
  { const b = new THREE.Box3().setFromObject(K[MODEL.barrel].scene), s = b.getSize(V3()); BK = { d: Math.max(s.x, s.z), h: s.y }; }
  let bm = null; K[MODEL.barrel].scene.traverse(m => { if (m.isMesh && !bm) bm = m.material; }); mats.tA = tint(bm, TINTS[0]); mats.tB = tint(bm, TINTS[1]); mats.rocket = tint(bm, ROCKET, .25); mats.gold = tint(bm, GOLD, .2); mats.gold.emissive = new THREE.Color(GOLD); mats.gold.emissiveIntensity = .55;
  mats.ghost = new THREE.MeshStandardMaterial({ color: '#fff4d6', transparent: true, opacity: .26, depthWrite: false, roughness: .8 });
  const dk = stage.dockKit(K[MODEL.dock]), pw = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36, g0 = dk.planks[0]; g0.computeBoundingBox(); const pb = g0.boundingBox, plen = pb.max.z - pb.min.z, pwid = pb.max.x - pb.min.x, pth = pb.max.y - pb.min.y;
  const wm = c => { const m = dk.mat.clone(); m.color.set(c); return m; }, floorM = wm(WOOD.floor), wallM = wm(WOOD.wall), doorM = wm(WOOD.door), coverM = wm(WOOD.cover), palM = dk.mat.clone(); palM.color.multiplyScalar(WOOD.pallet);
  const plank = (k, mat) => new THREE.Mesh(dk.planks[k % dk.planks.length], mat);
  /* 부두 바닥(밤) */ let i = 0; for (const z of [-1.85, .15, 2.15]) for (let x = -6.2; x <= 6.2; x += pw, i++) { const m = plank(i, dk.mat); m.position.set(x, T.DECK - pth / 2 - .01, z); scene.add(stage.shadows(m)); }
  for (let x = -5.6; x <= 5.8; x += 2.8) for (const z of [-2.9, 3.2]) stage.put(K[MODEL.pole], x, T.DECK - .8, z, 1, x);
  { const pr = K[MODEL.pier].scene.clone(), b = new THREE.Box3().setFromObject(pr), s = b.getSize(V3()), k = 2.2 / Math.max(.01, s.x); pr.scale.setScalar(k); pr.rotation.y = 0; pr.position.set(4.4, T.DECK - s.y * k * .5, -9); scene.add(stage.shadows(pr)); }
  for (const s of SCENERY) stage.put(K[s[0]], s[1], s[2], s[3], s[4], s[5]);
  /* 궤짝: 바닥 · 벽 넷 · 덧문 두 짝(경첩은 바깥 가장자리) · 칸막이 · 열 칸 깔판 */
  S.crate = new THREE.Group(); scene.add(S.crate); const fy = T.DECK + .02;
  { const n = Math.ceil(R.T.CRATE.W / pw) + 1, st = (R.T.CRATE.W + .1) / n; for (let k = 0; k < n; k++) { const m = plank(k, floorM); m.scale.set(st / pwid * 1.04, 1, (R.T.CRATE.D + .12) / plen); m.position.set(-W2 - .05 + st * (k + .5), fy, 0); S.crate.add(stage.shadows(m)); } }
  const wall = (len, x, z, along) => { const m = plank(0, wallM); if (along === 'x') m.rotation.set(0, Math.PI / 2, Math.PI / 2); else m.rotation.set(0, 0, Math.PI / 2); m.scale.set(T.WALL / pwid, 1.4, len / plen); m.position.set(x, fy + T.WALL / 2, z); S.crate.add(stage.shadows(m)); return m; };
  wall(R.T.CRATE.W + .34, 0, -D2 - .08, 'x'); wall(R.T.CRATE.W + .34, 0, D2 + .08, 'x'); wall(R.T.CRATE.D + .1, -W2 - .08, 0, 'z'); wall(R.T.CRATE.D + .1, W2 + .08, 0, 'z');
  S.dividers = [0, 1, 2].map(() => { const m = plank(1, wallM); m.rotation.set(0, 0, Math.PI / 2); m.scale.set(T.WALL * .62 / pwid, .8, (R.T.CRATE.D) / plen); m.position.y = fy + T.WALL * .31; m.visible = false; S.crate.add(stage.shadows(m)); return m; });
  const door = side => { const g = new THREE.Group(), n = 4, st = (W2 + .08) / n; g.position.set(side * (W2 + .08), fy + T.WALL + pth / 2 + .01, 0); for (let k = 0; k < n; k++) { const m = plank(k + (side > 0 ? 2 : 0), doorM); m.scale.set(st / pwid * 1.12, 1, (R.T.CRATE.D + .22) / plen); m.position.set(-side * st * (k + .5), 0, 0); g.add(stage.shadows(m)); } S.crate.add(g); return g; };
  S.doorL = door(-1); S.doorR = door(1);
  /* 칸 금(닫힌 덧문 위 — 셋째 칸으로 나뉠 때 칸막이 머리가 보이게 · 덧문과 같이 젖혀진다) */ const seamM = wm(WOOD.seam); seamM.emissive = new THREE.Color(WOOD.seam); seamM.emissiveIntensity = .35; S.seams = [[S.doorL, -1], [S.doorR, 1]].map(([dg, sx]) => { const m = plank(2, seamM); m.scale.set(.1 / pwid, .7, (R.T.CRATE.D + .2) / plen); m.position.set(sx * R.T.CRATE.W / 6 - sx * (W2 + .08), pth * .75, 0); m.visible = false; dg.add(m); return m; });
  S.pallet = new THREE.Group(); { const n = 7, st = 2.5 / n; for (let k = 0; k < n; k++) { const m = plank(k, palM); m.scale.set(st / pwid * 1.04, .35, .98 / plen); m.position.set(-1.25 + st * (k + .5), fy + pth / 2 + .004, 0); S.pallet.add(m); } } S.pallet.visible = false; S.crate.add(S.pallet);
  for (let k = 0; k < 30; k++) POOL.push(barrelMesh());
  for (let k = 0; k < 10; k++) { const g = K[MODEL.barrel].scene.clone(); g.traverse(m => { if (m.isMesh) { m.material = mats.ghost; m.castShadow = false; m.renderOrder = 2; } }); g.visible = false; scene.add(g); GHOSTS.push(g); }
  for (let k = 0; k < 10; k++) { const c = plank(k, coverM); c.visible = false; scene.add(stage.shadows(c)); COVERS.push(c); }
  S.plank = { pw, pwid, plen, pth };
  /* 앤 · 폭죽 · 심지 */
  S.anne = stage.person(K[MODEL.keeper]); stage.play(S.anne, 'Idle');
  S.rocket = barrelMesh(); S.rocket.visible = true;
  S.fuse = makeFuse();
  stage.onResize = aim; stage.resize();
  let c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); coinsDraw(); wallet.onChange(() => coinsDraw());
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
  CNT = Array.from({ length: 30 }, () => { const d = document.createElement('div'); d.className = 'cnt'; document.body.appendChild(d); return d; });
  GSUM = Array.from({ length: 3 }, () => { const d = document.createElement('div'); d.className = 'gsum'; document.body.appendChild(d); return d; });
  SIGNS = Array.from({ length: 3 }, () => { const d = document.createElement('div'); d.className = 'fsign'; document.body.appendChild(d); return d; });
  DOORNUM = document.createElement('div'); DOORNUM.id = 'doornum'; document.body.appendChild(DOORNUM);
  TL.button();
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true;
  start(); }
let CNT = [], GSUM = [], SIGNS = [], DOORNUM = null;
function coinsDraw(pop){ const c = $('coins'); if (!c) return; const v = `${art(ICON.coin)}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } } }

// ── 카메라 · 자리(궤짝은 띠 · 단추 줄 아래 · 화면 가운데 · 세로 화면은 앤과 폭죽이 궤짝 앞줄로)
function topUI(){ const ch = $('choose'), tr = $('tray'); if (ch && ch.classList.contains('on')) return ch.getBoundingClientRect().bottom + 14; const tb = tr && tr.classList.contains('on') ? tr.getBoundingClientRect().bottom : (S.low ? 50 : 112); return tb + C.GAP + (S.low ? 86 : S.tall ? 98 : 118) + 14; }
function aim(w = innerWidth, h = innerHeight){ const tall = h > w * 1.05; S.tall = tall; S.low = !tall && h < 560; const l = L(); camera.fov = l.fov; const asp = w / h, half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * asp);
  const top = topUI(), bot = h - (tall ? T.BOTTOM_TALL : T.BOTTOM_WIDE); S.topUI = top;
  let dist = Math.max(tall ? 0 : 4.6, l.span / Math.tan(half));
  for (let it = 0; it < 6; it++) { camera.position.set(0, T.DECK + dist * Math.sin(l.el), dist * Math.cos(l.el) + (tall ? .35 : .1)); camera.lookAt(0, T.DECK, tall ? .35 : .1); camera.clearViewOffset(); camera.aspect = asp; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const far = V3(0, T.DECK + T.WALL + .3, -D2 - .15).project(camera), near = V3(0, T.DECK, tall ? D2 + 1.0 : D2 + .35).project(camera), yF = (1 - far.y) / 2 * h, yN = (1 - near.y) / 2 * h;
    if (yN - yF > (bot - top) && it < 5) { dist *= (yN - yF) / Math.max(60, bot - top) * 1.02; continue; }
    const dy = (top + bot) / 2 - (yF + yN) / 2; camera.setViewOffset(w, h, 0, -dy, w, h); break; }
  layout(); const tl = $('tell'); if (tl && tl.classList.contains('on')) tellPlace(); }   /* 화면을 돌리면 한 줄 안내 자리도 새로(소리 단추에 가리지 않게) */
function layout(){ const l = L(); if (S.anne) { S.anne.obj.position.set(l.anne[0], T.DECK + .02, l.anne[1]); S.anne.obj.rotation.y = S.tall ? Math.PI * .8 : Math.PI * .62; lamp.position.set(l.anne[0] - .2, T.DECK + 1.5, l.anne[1] + .4); }
  if (S.rocket && !S.flying) rocketPlace(); if (S.fuse) fuseDraw(); }
function reaim(){ const t = topUI(); if (Math.abs(t - S.topUI) > 4) aim(); }

// ── 폭죽 · 심지
function rocketPlace(){ const l = L(), s = S.rocketBig ? T.ROCKET_BIG : 1; S.rocket.position.set(l.rocket[0], T.DECK, l.rocket[1]); S.rocket.scale.set(T.ROCKET_S[0] * s, T.ROCKET_S[1] * s, T.ROCKET_S[0] * s); S.rocket.rotation.set(0, 0, 0); }
function makeFuse(){ const n = T.FUSE_N, pos = new Float32Array(n * 3), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = new THREE.PointsMaterial({ color: '#3a2a18', size: .07, sizeAttenuation: true }); const o = new THREE.Points(g, m); o.frustumCulled = false; scene.add(o); return { o, g, pos, n }; }
/** 심지의 자리: 폭죽 밑(0)에서 바깥 끝(1)까지 휘어진 줄 · 탄 만큼(바깥 끝부터) 사라진다. */
function fusePt(t){ const l = L(), x0 = l.rocket[0], z0 = l.rocket[1], dir = S.tall ? -1 : 1; return V3(x0 - .12 - T.FUSE_LEN * .55 * t * (S.tall ? -.2 : 1), T.DECK + .03, z0 + .14 + Math.sin(t * Math.PI * .9) * .22 * dir + t * T.FUSE_LEN * (S.tall ? .5 : .25)); }
function fuseDraw(){ const f = S.fuse; for (let k = 0; k < f.n; k++) { const p = fusePt(k / (f.n - 1)); f.pos.set([p.x, p.y, p.z], k * 3); } f.g.attributes.position.needsUpdate = true; const on = S.fuseShown && !S.flying; f.o.visible = on; const left = 1 - S.clock; f.g.setDrawRange(0, on ? Math.max(1, Math.ceil(left * (f.n - 1)) + 1) : 0); }

// ── 덧문(두 짝이 따로) · 번쩍 빛 · 문이 닫힌 쪽의 통은 숨긴다(잔상 없음)
function doorTick(){ S.doorL.rotation.z = S.open.L * T.OPEN; S.doorR.rotation.z = -S.open.R * T.OPEN; const lit = Math.max(S.open.L, S.open.R); flashLight.intensity = lit > .02 ? NIGHT.FLASH[1] * Math.min(1, lit * 1.4) : 0;
  const vis = side => S.open[side] > .04; for (const o of S.inCrate) { const side = o.position.x < 0 ? 'L' : 'R'; o.visible = vis(side) && !o.userData.off; }
  S.shown.L = vis('L'); S.shown.R = vis('R'); }
async function doors(want, ms){ const tw = []; for (const side of ['L', 'R']) { if (want[side] == null) continue; const to = want[side] ? 1 : 0; if (Math.abs(S.open[side] - to) < .001) continue; tw.push(stage.tween(S.open, { [side]: to }, ms != null ? ms : to ? T.OPEN_MS : T.CLOSE_MS, t => t)); }
  if (tw.length && want.L !== false && want.R !== false) snd(420, .05, 'square', .04); await Promise.all(tw); doorTick(); if (!want.L && !want.R) snd(180, .06, 'square', .05); }
const allOpen = () => doors({ L: true, R: true }), allClosed = () => doors({ L: false, R: false });

// ── 궤짝 안 채우기(통 · 열 칸 · 칸막이 · 팻말)
S.inCrate = [];
function clearCrate(){ for (const o of [...POOL, ...GHOSTS, ...COVERS]) { o.visible = false; o.userData.off = false; o.userData.gi = -1; o.userData.k = -1; } S.inCrate = []; S.items = []; S.pallet.visible = false; S.dividers.forEach(d => { d.visible = false; });
  CNT.forEach(d => { d.classList.remove('on', 'all'); d.dataset.i = ''; }); GSUM.forEach(d => d.classList.remove('on', 'away')); SIGNS.forEach(d => { d.classList.remove('on'); d.innerHTML = ''; }); if (DOORNUM) DOORNUM.classList.remove('on'); }
const fy = () => T.DECK + .02 + (S.plank ? S.plank.pth / 2 : .05) + .004;   /* 궤짝 바닥 판자 윗면 */
function placeBarrel(o, x, z, r, mat){ const s = (2 * r) / BK.d; o.scale.set(s, s * .85, s); o.position.set(x, fy(), z); o.rotation.set(0, Math.random() * Math.PI * 2, 0); paint(o, mat); o.userData.r = r; o.userData.home = { x, z }; S.inCrate.push(o); return o; }
/** 문제의 그림 → 궤짝 안. spec = { groups: [{ n, pts, r, region }], ten, signs, tint } */
function fill(spec){ clearCrate(); let k = 0; S.items = [];
  const regs = spec.groups.map(g => g.region); const thirds = regs.some(r => /^c/.test(r)), halves = regs.some(r => /^h/.test(r)) || (regs.includes('L') && regs.includes('R'));
  S.seams.forEach(m => { m.visible = thirds; });
  if (thirds) [-1, 1].forEach((sx, i) => { const d = S.dividers[i]; d.visible = true; d.position.x = sx * R.T.CRATE.W / 6; }); else if (halves) { S.dividers[0].visible = true; S.dividers[0].position.x = 0; }
  spec.groups.forEach((g, gi) => { const pts = g.pts || R.fives(g.n, R.region(g.region), g.r); pts.forEach((p, j) => { const o = POOL[k++]; const mat = spec.tint ? (j % 2 ? mats.tA : mats.tB) : null; placeBarrel(o, p.x, p.z, g.r, mat); o.userData.gi = gi; o.userData.k = j; S.items.push(o); }); });
  if (spec.ten) { S.pallet.visible = true; const sl = R.tenSlots(); sl.forEach((p, j) => { const g = GHOSTS[j]; const s = (2 * R.T.R) / BK.d; g.scale.set(s, s * .85, s); g.position.set(p.x, fy(), p.z); g.userData.slot = j; S.inCrate.push(g); });
    for (let j = 0; j < (spec.ten.full ? 10 : spec.ten.a); j++) { const o = POOL[k++]; placeBarrel(o, sl[j].x, sl[j].z, R.T.R); o.userData.gi = j < spec.ten.a ? 0 : 1; o.userData.k = j; o.userData.slot = j; S.items.push(o); } }
  doorTick(); }
/** C03: 오른쪽 b 칸을 작은 덧문(판자)으로 가린다 · 걷는다. */
function covers(b, on){ const sl = R.tenSlots(), st = S.plank, a = 10 - b; COVERS.forEach(c => { c.visible = false; c.userData.off = true; }); for (const o of S.items) if (o.userData.slot != null) o.userData.off = false; if (!on) { S.inCrate = S.inCrate.filter(o => !COVERS.includes(o)); doorTick(); return; }
  for (let j = a; j < 10; j++) { const c = COVERS[j - a], p = sl[j]; c.scale.set(.46 / st.pwid, 1, .46 / st.plen); c.position.set(p.x, fy() + BK.h * (2 * R.T.R / BK.d) * .85 + .04, p.z); c.userData.off = false; if (!S.inCrate.includes(c)) S.inCrate.push(c); }
  for (const o of S.items) if (o.userData.slot >= a) o.userData.off = true; doorTick(); }
const worldOf = o => o.position.clone();
const topOf = o => V3(o.position.x, o.position.y + BK.h * o.scale.y + .05, o.position.z);

// ── 띠 · 고르기
function trayDraw(closed = false){ A.trayClear(); const t = $('tray'), p = S.p; if (!p) return; const b = (v, c = '') => `<b class="${c}">${v}</b>`, w = s => `<i class="w">${s}</i>`;
  t.innerHTML = (closed && p.closedBand ? p.closedBand : p.band).map(x => V.partWord(x, closed) != null ? w(V.partWord(x, closed)) : x.hole != null ? (closed ? b(x.hole, 'done') : b('?', 'hole')) : x.n != null ? b(x.n) : x.dots != null ? `<b class="dotsb">${C.dotsHtml(x.dots)}</b>` : `<i class="op">${x.op}</i>`).join('');
  t.className = 'on' + (p.band.length > 6 ? ' story' : '') + (p.band.length === 1 && p.band[0].n != null ? ' num1' : ''); C.ask(!closed && !!S.choosing); trayFit(); }
function trayFit(){ const t = $('tray'); if (t.classList.contains('story')) return; t.style.fontSize = ''; const room = innerWidth * .96; if (t.offsetWidth > room) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room / t.offsetWidth) + 'px'; }
/** 고를 것: row = 단추 줄(점 + 숫자 · 자리 고정) · num = 수 셋 · eq = 식 카드 셋 · group · side = 궤짝 안의 칸을 누른다(단추 없음). */
function chooseShow(){ const p = S.p; S.choosing = p.form; if (p.form === 'group' || p.form === 'side') { C.hide(); return; }
  C.show(p.opts, onPick, { row: p.form === 'row' }); const c = $('choose'); if (p.form === 'eq') c.classList.add('eq'); holdLook(); C.ask(true); }
function holdLook(){ const c = $('choose'); if (c) c.classList.toggle('hold', S.phase === 'show' || S.phase === 'set'); }
function chooseHide(){ C.hide(); S.choosing = null; }

// ── 한 문제
const isPeekable = () => S.mode === 'cell' ? S.step === 2 : V.canPeek(S.p);
function lookOf(){ return S.mode === 'cell' ? (S.step === 1 ? 'stay' : 'flash') : S.p.look; }
function showMs(){ const p = S.p; if (S.mode === 'cell') return R.showTime(CALM ? 0 : S.level) * 1000; const base = p.show || 1.4; return (S.bonus && !CALM ? Math.max(R.T.SHOW_MIN, base * Math.pow(R.T.SHOW_STEP, S.level)) : base) * 1000; }
/** 보여 주기(덧문의 박자) — 번쩍(낱칸 · 복습) · 두 짝 차례로 · 번쩍 → 왼짝 · 열 칸 가림 · 숫자 → 머묾 · 닫힌 채. 끝나면 생각하는 차례(phase think). */
async function present(again = false){ const my = S.oid, look = lookOf(), ms = showMs(), side = S.cornerSide; S.phase = 'show'; holdLook();
  const pull = () => { stage.play(S.anne, 'Sword', true); snd(300, .05, 'triangle', .04); return sleep(again ? 60 : T.PULL_MS); };
  const flash = async want => { await pull(); if (S.oid !== my) return; await doors(want); if (S.oid !== my) return; const t0 = performance.now(); S.log.push({ open: Object.keys(want).filter(k => want[k]).join(''), ms: Math.round(ms) }); await sleep(ms); while (S.holdShow && S.oid === my) await sleep(50);   /* holdShow = 하네스가 열린 동안을 붙잡아 둘 때만 */ if (S.oid !== my) return; await allClosed(); S.log.push({ shut: Math.round(performance.now() - t0) }); };
  if (look === 'flash') await flash(side ? { [side]: true } : { L: true, R: true });
  else if (look === 'flashLR') { await flash({ L: true }); if (S.oid !== my) return; await sleep(180); await flash({ R: true }); }
  else if (look === 'flashLeft') { await flash({ L: true, R: true }); if (S.oid !== my) return; await sleep(220); await doors({ L: true }); }
  else if (look === 'flashCover') { if (again) covers(S.p.ten.cover, false); await flash({ L: true, R: true }); if (S.oid !== my) return; covers(S.p.ten.cover, true); await sleep(160); await allOpen(); }
  else if (look === 'numStay') { if (!again) { DOORNUM.innerHTML = ''; DOORNUM.appendChild(NS.numsign(S.p.doorNum, { px: S.tall ? 96 : 120, compact: true })); DOORNUM.classList.add('on'); doorNumPlace(); snd(660, .08, 'triangle', .06); await sleep(ms); if (S.oid !== my) return; DOORNUM.classList.remove('on'); } await pull(); await allOpen(); }
  else if (look === 'stay') { await pull(); if (S.oid !== my) return; if (S.p && S.p.roll) await rollIn(); else await allOpen(); }
  else if (look === 'blind') { /* 닫힌 채 — 식 먼저 */ }
  while (S.holdShow && S.oid === my) await sleep(50);   /* holdShow = 하네스가 「보여 주는 중」을 붙잡아 둘 때만 */
  if (S.oid !== my) return; S.phase = 'think'; S.thinkT0 = S.t; holdLook(); }
/** B06: 왼짝 a 가 머문 뒤 오른짝으로 b 가 굴러 들어온다(덧문은 열린 채). */
async function rollIn(){ const my = S.oid, both = S.p.roll === 'merge', right = S.items.filter(o => o.userData.gi === 1 || (both && o.userData.gi === 0)); right.forEach(o => { o.userData.off = true; }); await allOpen(); if (!both) await sleep(T.ROLL_HOLD); if (S.oid !== my) return;   /* 양쪽에서 모임(merge) = 왼쪽 무리는 왼쪽에서 · 오른쪽 무리는 오른쪽에서 번갈아 굴러 들어옴 */
  if (both) { const L0 = right.filter(o => o.userData.gi === 0), R0 = right.filter(o => o.userData.gi === 1); right.length = 0; for (let k = 0; k < Math.max(L0.length, R0.length); k++) { if (L0[k]) right.push(L0[k]); if (R0[k]) right.push(R0[k]); } }
  for (const o of right) { const h = o.userData.home, sx = o.userData.gi === 0 ? -1 : 1; o.position.set(sx * (W2 + .7), fy() + .45, h.z); o.userData.off = false; snd(500, .05, 'triangle', .05); stage.tween(o.position, { x: h.x }, T.ROLL_MS, t => 1 - (1 - t) ** 2); stage.tween(o.position, { y: fy() }, T.ROLL_MS, t => t * t); stage.tween(o.rotation, { z: o.rotation.z - 3 * sx }, T.ROLL_MS); await sleep(T.ROLL_GAP); if (S.oid !== my) return; }
  await sleep(T.ROLL_MS); right.forEach(o => { o.rotation.z = 0; }); }
function doorNumPlace(){ if (!DOORNUM || !DOORNUM.classList.contains('on')) return; const q = stage.screenOf(V3(0, T.DECK + T.WALL + .1, 0)); DOORNUM.style.left = q.x + 'px'; DOORNUM.style.top = q.y + 'px'; }

/** 문제 하나: 궤짝을 채우고 → 폭죽이 서고 → 보여 주고 → 누름을 기다린다. → 결과 { clean, retreat, hinted, missed, early, peeks } */
async function runProblem(p, ctx){ const my = S.oid; S.p = p; S.res = { retreat: false, hinted: false, missed: false, early: 0, peeks: 0, nudges: 0 }; S.closed = false; S.clock = 0; S.fuseOff = false; S.busy = true; S.phase = 'set'; S.handTo = null; S.cornerSide = ctx.corner || null; S.ctx = ctx;
  S.peekLeft = isPeekable() ? R.T.PEEK : 0; S.fuseS = ctx.fuseS; S.fuseShown = !!ctx.fuse; S.gold = !!ctx.gold; S.rocketBig = !!ctx.last; S.clockOn = false;
  CNT.forEach(d => d.classList.remove('on', 'all')); GSUM.forEach(d => d.classList.remove('on', 'away', 'all')); S.awayG = null; S.tellHold = false; if (S.open.L > .001 || S.open.R > .001) await allClosed(); if (S.oid !== my) return { abort: true };   /* 앞 문제의 덧문을 먼저 닫는다(새 통이 보이지 않게) */
  fill(ctx.spec); if (p.signs) signsDraw(false); trayDraw(); chooseShow(); E.marbles(ctx.j, ctx.of || 3, 0); reaim();
  await rocketPop(); if (S.oid !== my) return { abort: true };
  if (p.say) TL.say(p.say);
  S.active = true; S.busy = false; S.lastAct = S.t + 99;   /* 덧문이 열린 동안의 누름도 받는다(물결 + 「닫히면 눌러 줘」) */
  let told = false; const flashy = ['flash', 'flashLR', 'flashLeft', 'flashCover'].includes(lookOf());
  if (ctx.tell && flashy) { told = H.tell(ctx.tell.key, ctx.tell.text, ctx.tell.opt); if (told) { tellPlace(); S.tellHold = true; await sleep(T.TELL_LEAD); if (S.oid !== my) return { abort: true }; } }   /* 번쩍 꼴은 안내를 먼저 읽고 나서 연다(닫힌 뒤에 뜨면 읽는 동안 심지가 탄다) */
  await present(); if (S.oid !== my) return { abort: true };
  S.log.push({ start: p.key, cell: p.cell || S.cell, n: p.answer, step: S.step, look: lookOf(), show: Math.round(showMs()), ev: Object.keys(S.ev).filter(k => S.ev[k] === true).join(' ') });
  if (ctx.tell && !flashy) { told = H.tell(ctx.tell.key, ctx.tell.text, ctx.tell.opt); if (told) { tellPlace(); S.tellHold = true; } }
  S.groupBob = false; S.active = true; S.busy = false; S.lastAct = S.t + (told ? T.TELL_GRACE : 0); S.clockOn = true;
  const out = await new Promise(res => { S.done = res; }); S.active = false; S.done = null; S.clockOn = false; H.hide();
  const r = { ...S.res, clean: R.clean(S.res), out, cell: p.cell || S.cell, key: p.key }; S.log.push({ problem: p.key, cell: r.cell, ...r }); return r; }
/** 새 폭죽이 선다(금빛 · 마지막은 크게). */
async function rocketPop(){ S.flying = false; paint(S.rocket, S.gold ? mats.gold : mats.rocket); rocketPlace(); S.rocket.visible = true; const s = S.rocket.scale.clone(); S.rocket.scale.multiplyScalar(.01); fuseDraw(); await stage.tween(S.rocket.scale, { x: s.x, y: s.y, z: s.z }, 240, t => 1 - (1 - t) ** 3); }
/** 폭죽이 올라가 터진다 → 잠시 뒤 끝남. level = 불꽃 단계 · big = 하늘 가득. */
/** 하늘의 한 자리(가로 화면은 궤짝 둘레 · 세로 화면은 궤짝 위쪽 둘레) — 터지는 곳. */
const skyAt = () => S.tall ? V3((Math.random() - .5) * 2.6, T.DECK + 1.2 + Math.random() * .8, -.6 + Math.random() * 1.6) : V3((Math.random() < .5 ? -1 : 1) * (1.6 + Math.random() * 1.6), T.DECK + 1.1 + Math.random() * .9, -1.2 + Math.random() * 1.4);
async function launch(level, gold, big){ const my = S.oid, o = S.rocket, x = o.position.x - (S.tall ? .35 : .15), z = o.position.z - (S.tall ? .9 : .5), y1 = T.DECK + T.BURST_Y[0] + Math.random() * (T.BURST_Y[1] - T.BURST_Y[0]); S.flying = true; fuseDraw(); snd(380, .5, 'sawtooth', .025, 0, 900);
  const t0 = S.t; const trail = () => { if (!S.flying) return; emit(o.position.x, o.position.y, o.position.z, (Math.random() - .5) * .2, -.3, (Math.random() - .5) * .2, .45, SPARK, 2, .4); requestAnimationFrame(trail); }; trail();
  await Promise.all([stage.tween(o.position, { y: y1 }, 520, t => t * (2 - t)), stage.tween(o.position, { x, z }, 520, t => t)]); S.flying = false; o.visible = false; if (S.oid !== my) return;
  const col = gold ? GOLD : FIRE[S.launched.length % FIRE.length]; burst(x, y1, z, level, gold); S.launched.push({ level, gold, col });
  const f = 330 * Math.pow(2, (level - 1) * 2 / 12); snd(f * 2, .25, 'triangle', .06); snd(110, .3, 'sine', .07);
  if (big) { S.log.push({ skyFull: true }); for (let k = 1; k < T.SKY_FULL; k++) setTimeout(() => { if (S.oid !== my) return; const q = skyAt(); burst(q.x, q.y, q.z, Math.min(R.T.FIRE_MAX, level), gold); snd(f * 2 * (1 + k * .06), .2, 'triangle', .05); }, k * 160); }
  void t0; }
function fizzle(){ const o = S.rocket; puff(o.position.x, o.position.y + BK.h * o.scale.y, o.position.z); snd(220, .3, 'sine', .06, 0, 110); stage.tween(o.rotation, { z: .25 }, 220).then(() => stage.tween(o.rotation, { z: 0 }, 260)); S.fuseShown = false; fuseDraw(); }

// ── 누르기(단추 · 궤짝 · 칸 · 빈 곳 — 모든 누름에 답이 있다)
async function onPick(v, btn){ audio(); const r = btn.getBoundingClientRect(); if (!S.active || S.busy) { H.ripple(r.left + r.width / 2, r.top + r.height / 2); S.log.push({ ignored: 'busy' }); return; } S.lastAct = S.t; H.hide();
  if (S.phase !== 'think') { early(r.left + r.width / 2, r.top + r.height / 2); return; }
  await answer(v, btn); }
/** 덧문이 열린 동안의 누름: 물결 + 「닫히면 눌러 줘」(벌이 아니다 · 깨끗함 그대로). */
function early(x, y){ H.ripple(x, y); S.res.early++; const t = earlyText(); S.log.push({ early: true, text: t }); if (H.tell('flash.early', t, { times: 1e9, ms: 2200 })) tellPlace(); snd(520, .05, 'triangle', .04); }
/** 보여 주는 중의 누름에 띄울 글 — 덧문이 닫히는 꼴만 「닫히면」 · 열린 채 머무는 꼴은 「열리면」 · 굴러 들어오는 꼴은 「다 들어오면」. */
function earlyText(){ const look = lookOf(); if (S.p && S.p.roll) return '다 들어오면 눌러 줘.'; if (look === 'stay' || look === 'numStay') return '문이 열리면 눌러 줘.'; if (look === 'flashLeft' || look === 'flashCover') return '문이 다시 열리면 눌러 줘.'; return '닫히면 눌러 줘.'; }
async function answer(v, btn){ const my = S.oid, p = S.p, how = (S.mode === 'cell' ? R.judge(v, { n: p.answer }) : V.judge(v, p)); S.log.push({ pick: v, how }); S.busy = true; S.clockOn = false;
  if (how === 'fit') { await fit(btn); return; }
  S.res.retreat = true; S.fuseOff = true; S.peekLeft = 0; fizzle();   /* 아닌 수 뒤에는 덧문이 열린 채 — 궤짝 누름은 헛누름(한 번 더 보기 없음) */ stage.play(S.anne, 'No', true); if (btn) C.retreat(btn); else groupAway(v);
  await reveal(); if (S.oid !== my) return; bob(); S.busy = false; S.lastAct = S.t; S.clockOn = true; }
/** 맞음: 폭죽이 올라가 터지고 · 덧문이 열려 수가 찍히고 · 띠가 닫힌다. */
async function fit(btn){ const my = S.oid, p = S.p, cleanNow = R.clean(S.res); S.closed = true; S.phase = 'done'; stage.play(S.anne, 'Yes', true);
  if (cleanNow && countsStreak()) { S.fire = Math.min(R.T.FIRE_MAX, S.fire + 1); S.streak++; } else if (countsStreak()) { S.fire = 0; S.streak = 0; }
  const level = S.mode === 'cell' && S.step === 1 ? 1 : Math.max(1, S.fire) + (S.rocketBig ? 1 : 0), sky = countsStreak() && cleanNow && S.streak > 0 && S.streak % R.T.STREAK === 0, gold = S.gold && cleanNow; S.maxFire = Math.max(S.maxFire, Math.min(R.T.FIRE_MAX, level));
  launch(Math.min(R.T.FIRE_MAX, level), gold, sky || gold); if (S.gold && !cleanNow) S.goldCarry = true; else if (S.gold) S.goldCarry = false;
  if (btn) btn.classList.add('bob'); setTimeout(() => chooseHide(), 380); trayDraw(true);
  if (gold) { wallet.earn(R.T.GOLD_COINS, 'flash'); confetti(10); S.log.push({ goldOpen: true }); } wallet.earn(R.T.COIN_PER, 'flash'); coinsDraw(true);
  await confirmShow(); if (S.oid !== my) return; await sleep(T.FIT_HOLD); if (S.oid !== my) return; S.done && S.done('fit'); }
const countsStreak = () => !(S.mode === 'cell' && S.step === 1);
/** 맞은 뒤 확인: 덧문이 열리고 통 위에 수가 찍힌다(빨리 — 세어 보이는 것이 아니라 「봤지?」). */
async function confirmShow(){ const p = S.p, my = S.oid; if (p.cover || (p.ten && p.ten.cover)) covers(0, false); for (const o of S.items) o.userData.off = false; await allOpen(); if (S.oid !== my) return;
  if (p.form === 'side' || p.form === 'group') { sums(true); return; } if (p.signs) { signsDraw(true); return; }
  const list = (p.ten && !p.ten.full) || p.reveal === 'split' ? countList(true) : countList(); for (let k = 0; k < list.length; k++) { label(k, list[k], k + 1, k === list.length - 1); await sleep(T.STAMP_MS); if (S.oid !== my) return; } }
/** 아니었을 때의 세계의 답: 덧문이 열린 채 통이 하나씩 톡톡 세어진다(모으기 = 이어 세기 · 가르기 = 가려진 쪽 · 열 칸 = 빈 칸). */
async function reveal(){ const my = S.oid, p = S.p; CNT.forEach(d => d.classList.remove('on', 'all')); if (p.ten && p.ten.cover) covers(0, false); for (const o of S.items) o.userData.off = false; await allOpen(); if (S.oid !== my) return;
  if (p.signs) { SIGNS.forEach(d => { d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop'); }); await sleep(500); return; }
  if (p.form === 'side' || p.form === 'group') { for (let g = 0; g < p.groups.length; g++) { const list = S.items.filter(o => o.userData.gi === g); for (let k = 0; k < list.length; k++) { if (S.oid !== my) return; await hop(list[k], k + 1, k === list.length - 1); } sum(g, list.length); await sleep(240); } return; }
  const list = countList(true); S.log.push({ reveal: list.length }); for (let k = 0; k < list.length; k++) { if (S.oid !== my) return; await hop(list[k], k + 1, k === list.length - 1); } await sleep(250); }
/** 셀 차례: 열 칸 = 빈 칸(C02 — 답) · 가르기 = 가려진(오른) 쪽 · 그 밖은 모두(왼쪽 무리부터 이어서). */
function countList(wrong){ const p = S.p; if (p.ten && !p.ten.full) { return wrong ? GHOSTS.filter(g => g.userData.slot >= p.ten.a && g.visible) : S.items.slice(); }
  if (wrong && (p.reveal === 'split')) return S.items.filter(o => o.userData.gi === 1);
  return S.items.slice().sort((a, b) => (a.userData.gi - b.userData.gi) || (a.userData.k - b.userData.k)); }
async function hop(o, n, last){ const i = CNT.findIndex(d => !d.classList.contains('on')); if (i >= 0) label(i, o, n, last); snd(392 * Math.pow(2, (n - 1) / 12 * 2), .1, 'triangle', .07); const y0 = o.position.y; await stage.tween(o.position, { y: y0 + .22 }, T.COUNT_MS * .45, t => t * (2 - t)); await stage.tween(o.position, { y: y0 }, T.COUNT_MS * .55, t => t * t); }
function label(i, o, n, last){ const d = CNT[i]; if (!d) return; d.textContent = n; d.dataset.i = S.inCrate.indexOf(o); d.classList.remove('on'); void d.offsetWidth; d.classList.add('on'); d.classList.toggle('all', !!last); d._o = o; labelPlace(d); }
function labelPlace(d){ const o = d._o; if (!o) return; const q = stage.screenOf(topOf(o)); d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; }
/** 묶음 · 쪽의 수(칸 위). */
function sum(g, n, away){ const d = GSUM[g]; if (!d) return; d.textContent = n; d.classList.add('on'); d.classList.toggle('away', !!away); d._g = g; sumPlace(d); }
function sums(){ S.p.groups.forEach((gr, g) => { sum(g, gr.n, g !== S.p.answer); GSUM[g].classList.toggle('all', g === S.p.answer); }); }   /* 답 칸만 노랑 · 나머지는 흐리게(놓쳤을 때도 답이 보이게) */
function sumPlace(d){ const g = d._g, reg = R.region(S.p.groups[g].region), q = stage.screenOf(V3((reg.x0 + reg.x1) / 2, T.DECK + T.WALL + .12, D2 + .05)); d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; }
function groupAway(g){ const d = GSUM[g]; S.awayG = (S.awayG || new Set()).add(g); for (const o of S.items) if (o.userData.gi === g) stage.tween(o.position, { y: fy() - .04 }, 300); if (d) d.classList.add('away'); }
/** A08 · A09: 수 팻말 셋(가운데 하나가 빈 줄) — 맞으면 빈 팻말에 수가 들어간다. */
function signsDraw(filled){ const p = S.p; p.signs.forEach((s, k) => { const d = SIGNS[k], px = S.tall ? 46 : 58; d.innerHTML = ''; d.appendChild(NS.numsign(s.hole && !filled ? '?' : s.hole ? p.answer : +s.text, { px, compact: true, ghost: s.hole && !filled })); d.classList.add('on'); d._k = k; if (filled && s.hole) { d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop'); } signPlace(d); }); }
function signPlace(d){ const s = S.p && S.p.signs && S.p.signs[d._k]; if (!s) return; const q = stage.screenOf(V3(s.pt.x, T.DECK + BK.h * .5 + .1, s.pt.z)); d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; }
/** 고를 것들이 들썩(헛누름 · 아닌 것을 고른 뒤 — 답은 짚지 않는다). */
function bob(){ const c = $('choose'); if (c && c.classList.contains('on')) { c.querySelectorAll('button:not(.away)').forEach((b, i) => { b.classList.remove('bob'); void b.offsetWidth; b.style.animationDelay = (i * .05) + 's'; b.classList.add('bob'); }); return; }
  if (S.p && (S.p.form === 'group' || S.p.form === 'side')) for (const o of S.items) { if (S.awayG && S.awayG.has(o.userData.gi)) continue; const y0 = fy(); stage.tween(o.position, { y: y0 + .1 }, 160, t => t * (2 - t)).then(() => stage.tween(o.position, { y: y0 }, 200, t => t * t)); } }

// 화면 누름: 궤짝(한 번 더 · 칸 고르기) · 빈 곳
const canvas = $('c');
function quad(x0, x1, z0, z1, y){ return [V3(x0, y, z0), V3(x1, y, z0), V3(x1, y, z1), V3(x0, y, z1)].map(v => stage.screenOf(v)); }
function inQuad(q, x, y){ let s = 0; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], c = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x); if (c !== 0) { if (s === 0) s = Math.sign(c); else if (Math.sign(c) !== s) return false; } } return true; }
const crateQuad = () => quad(-W2 - .12, W2 + .12, -D2 - .12, D2 + .12, T.DECK + T.WALL * .7);
function groupAt(x, y){ if (!S.p || !(S.p.form === 'group' || S.p.form === 'side')) return -1; for (let g = 0; g < S.p.groups.length; g++) { const r = R.region(S.p.groups[g].region); if (inQuad(quad(r.x0 - .05, r.x1 + .05, r.z0 - .1, r.z1 + .1, T.DECK + T.WALL * .6), x, y)) return g; } return -1; }
/** 누른 곳이 무엇인가(하네스 · 길잡이가 같이 씀): group(칸 번호) · crate · empty */
function hitAt(x, y){ const g = groupAt(x, y); if (g >= 0) return { kind: 'group', g }; if (inQuad(crateQuad(), x, y)) return { kind: 'crate' }; return { kind: 'empty' }; }
canvas.addEventListener('pointerdown', e => { audio(); if (!S.ready || E.homeOpen()) return; S.lastAct = S.t; H.hide(); const x = e.clientX, y = e.clientY, hit = hitAt(x, y);
  if (!S.active || S.busy) { S.log.push({ ignored: S.active ? 'busy' : 'idle' }); H.ripple(x, y); return; }   /* 바쁜 동안(불꽃 · 하나씩 세는 중)에도 물결은 뜬다(5-11) */
  if (S.phase !== 'think') { early(x, y); return; }   /* 덧문이 열린 동안 */
  if (hit.kind === 'group' && !(S.awayG && S.awayG.has(hit.g))) { H.ripple(x, y); answer(hit.g, null); return; }
  if (hit.kind === 'crate' && S.peekLeft > 0 && isPeekable() && !S.closed) { H.ripple(x, y); peek(); return; }
  nudge(x, y); });
/** 한 번 더 보기(문제마다 한 번 · 보이는 시간은 같다 · 깨끗함 그대로 · 심지는 멈춘다). */
async function peek(){ const my = S.oid; S.peekLeft--; S.res.peeks++; S.clockOn = false; S.log.push({ peek: true }); await present(true); if (S.oid !== my) return; S.clockOn = true; S.lastAct = S.t; }   /* 다시 열린 동안의 누름 = 이른 누름(phase show) */
/** 헛누름: 물결 + 고를 것들이 들썩 + 한 줄 안내를 다시. 깨끗함에는 세지 않는다 — 답이 아니라 「어디를 누르는지」만. */
function nudge(x, y){ H.ripple(x, y); S.res.nudges++; S.log.push({ nudge: true }); snd(520, .07, 'triangle', .05); bob(); const t = nudgeText(); if (H.tell('flash.nudge', t, { times: 1e9 })) tellPlace(); }
function nudgeText(){ const p = S.p; if (S.mode === 'cell') return FIRST[S.step]; return todayLine(p); }
/** 복습의 한 줄 — 무엇을 누르는지부터(정본 5-11). 「한 번 더 보려면 궤짝을」은 한 번 더 볼 수 있는 꼴에만(묶음 · 쪽을 누르는 꼴에서는 궤짝 누름이 답이다). */
/** 안내가 같은 꼴(같은 한 줄)끼리 묶는 열쇠. */
function todayKind(p){ return p.form === 'group' || p.form === 'side' || p.form === 'eq' ? p.form : p.look === 'blind' || p.look === 'stay' ? p.look : V.canPeek(p) ? 'peek' : 'stay'; }
function todayLine(p){ if (p.form === 'group') return '알맞은 묶음을 궤짝에서 눌러 줘.'; if (p.form === 'side') return '잠깐 보고 알맞은 쪽을 궤짝에서 눌러 줘.'; if (p.form === 'eq') return '잠깐 보고 알맞은 식을 눌러 줘. 한 번 더 보려면 궤짝을 눌러.'; if (p.look === 'blind') return '식을 보고 알맞은 수를 눌러 줘.'; if (p.look === 'stay') return '잘 보고 알맞은 수를 눌러 줘.'; return V.canPeek(p) ? TODAY_LINE : '잘 보고 알맞은 수를 눌러 줘.'; }
/** 한 줄 안내 자리: 단추 줄 바로 아래에 자리가 있으면 그곳 · 없으면 아래쪽(소리 단추 · 동전 위) — 띠 · 단추 · 궤짝을 가리지 않게. */
function tellPlace(){ const tl = $('tell'); if (!tl) return; Object.assign(tl.style, S.low ? { left: 'calc(10px + env(safe-area-inset-left,0px))', transform: 'none', maxWidth: '24vw', fontSize: '1rem', padding: '6px 12px' } : { left: '', transform: '', maxWidth: '', fontSize: '', padding: '' });
  if (S.low) { tl.style.top = (topUI() - 4) + 'px'; tl.style.bottom = ''; return; }   /* 낮은 가로: 궤짝이 가운데를 다 쓰니 왼쪽 옆에 작게 */
  const top = topUI(), q = crateQuad(), crateTop = Math.min(...q.map(v => v.y)), hgt = tl.offsetHeight || 54;
  if (crateTop - top >= hgt + 6) { tl.style.top = (top - 6) + 'px'; tl.style.bottom = ''; } else { tl.style.top = 'auto'; tl.style.bottom = S.tall ? 'calc(120px + env(safe-area-inset-bottom,0px))' : 'calc(36px + env(safe-area-inset-bottom,0px))'; } }

// ── 심지 · 길잡이(한 장면의 일)
function miss(){ if (!S.active || S.busy) return; const my = S.oid; S.busy = true; S.res.missed = true; S.clockOn = false; S.log.push({ missed: true }); fizzle(); chooseHide(); if (S.gold) S.goldCarry = true; if (countsStreak()) { S.fire = 0; S.streak = 0; }   /* 놓치면 불꽃 잇기도 끊긴다(다음 불꽃은 1단계) */
  (async () => { await reveal(); if (S.oid !== my) return; S.closed = true; trayDraw(true); if (S.p.signs) signsDraw(true); if (S.p.form === 'side' || S.p.form === 'group') sums(); await sleep(T.MISS_HOLD); if (S.oid !== my) return; S.done && S.done('missed'); })(); }
stage.frame((dt, t) => { S.t = t; if (!S.ready) return; partsTick(dt); doorTick(); boomLight.intensity *= Math.exp(-dt * 5);
  for (const d of CNT) if (d.classList.contains('on')) labelPlace(d); for (const d of GSUM) if (d.classList.contains('on')) sumPlace(d); for (const d of SIGNS) if (d.classList.contains('on')) signPlace(d); doorNumPlace(); if (S.choosing) C.place();
  /* 심지: 덧문이 닫힌 뒤 · 생각하는 동안에만 · 끝이 가까우면 불똥이 튄다 */
  const thinking = S.active && !S.busy && S.phase === 'think' && !S.closed && S.clockOn;
  if (S.tellHold && !(document.getElementById('tell') && document.getElementById('tell').classList.contains('on'))) S.tellHold = false;   /* 첫 안내가 떠 있는 동안은 심지가 타지 않는다 */
  if (thinking && !S.groupBob && S.mode === 'today' && S.p && S.p.form === 'group' && t - (S.thinkT0 || t) > (S.p.fuse || 10) * T.GROUP_BOB) { S.groupBob = true; bob(); S.log.push({ groupBob: true }); }   /* 묶음 꼴: 심지 절반쯤 묶음들이 들썩(답은 안 짚음 — 단추가 없으니 누를 곳을 알려 줌) */
  if (thinking && S.ev.fuse && S.fuseShown && !S.fuseOff && !CALM && !S.tellHold) { S.clock = Math.min(1, S.clock + dt / S.fuseS); fuseDraw(); const tip = fusePt(1 - S.clock); tipLight.position.copy(tip).add(V3(0, .1, 0)); tipLight.intensity = 1.2 + Math.random() * .6;
    const n = S.clock > .75 ? 4 : 1; for (let k = 0; k < n; k++) emit(tip.x, tip.y + .02, tip.z, (Math.random() - .5) * (S.clock > .75 ? 1.6 : .5), .4 + Math.random() * (S.clock > .75 ? 1.2 : .4), (Math.random() - .5) * (S.clock > .75 ? 1.6 : .5), .35 + Math.random() * .3, SPARK, 1.4, 1.6);
    if (S.clock >= 1) miss(); } else tipLight.intensity = 0;
  /* 길잡이 손: 가만히 있으면 — (한 번 더 볼 수 있으면) 궤짝 → 맞는 단추(뜨면 그 문제는 깨끗하지 않음) */
  const wait = S.mode === 'cell' ? R.T.HINT_AFTER * (M.stuck(M.get(S.cell)) >= 1 ? .5 : 1) : (S.res && S.res.retreat ? R.T.HINT_AFTER : (S.p && S.p.hint) || R.T.HINT_AFTER);   /* 아닌 수를 고른 뒤에는(이미 세어 보여 줌) 6초 */   /* 복습은 낱칸마다(review.js hintS — 세는 꼴은 심지 끝까지 답을 짚지 않음) */
  if (thinking && t - S.lastAct > wait && (!H.shown() || S.handTo === 'crate')) { if (S.peekLeft > 0 && isPeekable() && S.handTo !== 'crate') { const q = crateQuad(), c = { x: q.reduce((s, v) => s + v.x, 0) / 4, y: q.reduce((s, v) => s + v.y, 0) / 4 }; H.show(c.x, c.y); S.handTo = 'crate'; S.lastAct = t; S.log.push({ hand: 'crate' }); }
    else { const q = answerAt(); if (q) { H.show(q.x, q.y); S.handTo = 'answer'; S.res.hinted = true; S.log.push({ hinted: true }); } } } });
/** 맞는 것의 화면 자리(길잡이 손 · 하네스). */
function answerAt(){ const p = S.p; if (!p) return null; if (p.form === 'group' || p.form === 'side') { const r = R.region(p.groups[p.answer].region), q = stage.screenOf(V3((r.x0 + r.x1) / 2, T.DECK + T.WALL * .6, (r.z0 + r.z1) / 2)); return q; }
  const b = [...document.querySelectorAll('#choose.on button')].find(b => b.dataset.n === String(p.answer)); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 10 }; }

// ── 나들이(A04) · 오늘의 번쩍(복습 · 덤 한 판)
const FIRST = { 1: '몇 개인지 보고 아래 수를 눌러 줘.', 2: '문이 닫히면 몇 개였는지 수를 눌러 줘.' };
const TODAY_LINE = '잠깐 보고 바로 눌러 줘. 한 번 더 보려면 궤짝을 눌러.';
const TELLS = () => ({ times: M.passed(M.get(S.cell || '')) ? 2 : 1e9 });   /* 깃발을 따기 전에는 나들이 첫 문제마다(정본 5-11절) */
function start(){ if (S.mode === 'cell') outing(S.cell); else today(); }
/** A04 문제 → 궤짝 그림(사건: 구석 · 두 빛깔 · 흩어진 넷 · 다섯). */
function a04Spec(p, ev){ let shape = p.shape, corner = null; if (ev.loose && (p.n === 4 || p.n === 5)) shape = R.LOOSE[p.n];
  let pts = null; if (ev.corner && !CALM) { corner = Math.random() < .5 ? 'L' : 'R'; pts = R.layout(p.n, shape, Math.random, { corner }); if (!pts) corner = null; }
  if (!pts) pts = R.layout(p.n, shape, Math.random) || R.layout(p.n, R.SHAPES[p.n][0], Math.random);
  return { spec: { groups: [{ n: p.n, r: R.T.R, pts, region: 'all' }], tint: !!ev.tint }, corner, shape }; }
async function outing(id){ const my = ++S.oid; E.showBar(true); S.mode = 'cell'; S.bonus = false; S.cell = id; S.fire = 0; S.streak = 0; S.launched = []; S.goldCarry = false; S.level = 0; S.maxFire = 0; const day = M.dayKey(); let prevStep = 0;
  let rec = M.get(id); S.back = M.stuckNow(rec) && !!rec.hand;
  let q = R.deal(id, S.hist[id] || [], Math.random, { small: M.stuck(rec) >= 1, hand: !rec.hand || S.back }); S.q = q; E.lanterns(0); S.log.push({ outing: id, deal: q.map(R.key) });
  for (let b = 0; b < R.T.BOARDS; b++) { rec = M.get(id); const hand = !rec.hand || S.back; if (hand && b > 0) { q = R.fixHand(q, b * R.T.PER_BOARD, id); S.q = q; } if (hand) S.level = 0;
    let ev = R.events(rec.evBoards, Math.random, { passed: M.passed(rec), calm: CALM, hand }); if (S.forceEv) { ev = { ...ev, ...S.forceEv }; S.forceEv = null; } if (S.goldCarry && !hand) ev = { ...ev, corner: false, tint: false, loose: false, gold: true };   /* 넘어온 금빛 폭죽 판에는 다른 사건을 붙이지 않는다(판마다 하나) */
    S.ev = ev; S.step = hand ? 1 : 2; const goldJ = !ev.gold ? -1 : ev.goldJ != null ? ev.goldJ : Math.floor(Math.random() * 3); S.board = { b, hand, ev }; S.log.push({ board: b, hand, ev: Object.keys(ev).filter(k => ev[k] === true).join(' ') });
    const results = []; E.marbles(0);
    for (let j = 0; j < R.T.PER_BOARD; j++) { const i = b * R.T.PER_BOARD + j; let p = q[i]; if (S.forceP && S.forceP.length) { const f = S.forceP.shift(); p = R.make(f.n, f.shape || R.SHAPES[f.n][0]); q[i] = p; }
      const sp = a04Spec(p, hand ? {} : ev), prob = { cell: id, key: R.key(p), answer: p.n, opts: R.buttons(id, hand ? 1 : 2), form: 'row', band: [{ w: '모두' }, { hole: p.n }, { w: '개' }], groups: sp.spec.groups, shape: sp.shape };
      const firstStep = b === 0 || (hand ? 1 : 2) !== prevStep, last = b === R.T.BOARDS - 1 && j === R.T.PER_BOARD - 1;
      const r = await runProblem(prob, { spec: sp.spec, corner: sp.corner, j, of: 3, fuse: !hand && ev.fuse && !CALM, fuseS: R.fuseS(b), gold: j === goldJ, last, tell: j === 0 && firstStep ? { key: 'flash.' + (hand ? 1 : 2), text: FIRST[hand ? 1 : 2], opt: TELLS() } : null });
      if (S.oid !== my || r.abort) return; results.push(r); E.marbles(j + 1); if (!hand && !CALM) S.level = R.step(S.level, r.clean); if (!r.clean) q = R.requeue(q, i); S.q = q; }
    prevStep = hand ? 1 : 2;
    const before = rec; rec = M.record(rec, results, day, { counts: !hand, hand, ev: !hand && !ev.none }); if (hand) S.back = false; else if (M.stuckNow(rec)) S.back = true; M.put(id, rec); S.log.push({ boardEnd: b, clean: M.clean(results), rec: { ...rec } });
    await E.fly($('marbles'), $('coins'), art(ICON.coin), results.filter(r => r.out === 'fit').length); if (S.oid !== my) return; E.lanterns(b + 1); snd(660, .15, 'triangle', .1); snd(990, .2, 'triangle', .1, .12);
    if (!M.passed(before) && M.passed(rec)) { grew(art(ICON.flag) + ' 깃발을 땄어요!'); await sleep(2400); }
    if (S.oid !== my) return; await sleep(400); }
  S.hist[id] = q; await finale(); if (S.oid !== my) return;
  const items = S.launched.map(f => art(f.gold ? ICON.spark : ICON.burst)); const choice = await E.home({ items }); if (S.oid !== my) return;
  if (choice === 'again') outing(id); else location.href = GO; }
/** 나들이 끝: 오늘 올린 불꽃이 한꺼번에 다시 터진다. */
async function finale(){ const my = S.oid; S.p = null; A.trayClear(); chooseHide(); clearCrate(); await allClosed(); S.rocket.visible = false; S.fuseShown = false; fuseDraw();
  S.launched.forEach((f, k) => setTimeout(() => { if (S.oid !== my) return; const q = skyAt(); burst(q.x, q.y, q.z, f.level, f.gold); snd(500 + k * 40, .2, 'triangle', .04); }, k * 120));
  S.log.push({ finale: S.launched.length }); stage.play(S.anne, 'Wave', true); await sleep(900 + S.launched.length * 120); }

/** 오늘의 번쩍: 더미에서 낱칸 셋까지 → 낱칸마다 문제 셋 → 판마다 한 문제씩. 끝나면 별(다른 날 · 셋 다 깨끗) · 하루 한 번 · 그 뒤 덤 한 판. */
async function today(){ const my = ++S.oid, day = M.dayKey(), m = M.all(), st = V.today(day), status = V.status(m, day, st); S.mode = 'today'; S.cell = null; if (status.look === 'off') { location.replace(GO); return; }
  S.bonus = status.look === 'done'; S.cells = V.pick(m, day); S.fire = 0; S.streak = 0; S.launched = []; S.goldCarry = false; S.level = 0; S.maxFire = 0; S.starred = []; E.showBar(true);
  let list = S.forceList ? S.forceList.map(x => ({ ...x })) : V.deal(S.cells, Math.random, { bonus: S.bonus }); S.forceList = null; S.q = list; const boards = Math.ceil(list.length / R.T.PER_BOARD); E.lanterns(0, boards);
  S.log.push({ today: S.cells.join(), bonus: S.bonus, deal: list.map(p => p.cell + ':' + p.key) }); S.ev = { fuse: !CALM, gold: false, streak: true };
  const results = [], seenKind = new Set();
  for (let b = 0; b < boards; b++) { const part = list.slice(b * R.T.PER_BOARD, (b + 1) * R.T.PER_BOARD); let goldJ = -1; if (S.goldCarry || Math.random() < R.T.GOLD_P) goldJ = Math.floor(Math.random() * part.length); if (S.forceGold != null) { goldJ = S.forceGold; S.forceGold = null; }
    S.board = { b }; E.marbles(0, part.length); S.step = 2;
    for (let j = 0; j < part.length; j++) { const p = part[j], spec = { groups: p.groups, ten: p.ten, tint: false };
      const r = await runProblem(p, { spec, j, of: part.length, fuse: !CALM, fuseS: p.fuse, gold: j === goldJ, last: b === boards - 1 && j === part.length - 1, tell: !seenKind.has(todayKind(p)) ? (seenKind.add(todayKind(p)), { key: 'flash.today.' + todayKind(p), text: todayLine(p), opt: {} }) : null });   /* 꼴마다 그 꼴이 처음 나오는 문제에(처음 두 번) — 묶음 꼴은 단추가 없어 첫 문제가 아니어도 안내가 있어야 */
      if (S.oid !== my || r.abort) return; results.push(r); E.marbles(j + 1, part.length); if (S.bonus && !CALM && ['flash', 'flashLR', 'flashLeft', 'flashCover'].includes(p.look)) S.level = R.step(S.level, r.clean); }
    await E.fly($('marbles'), $('coins'), art(ICON.coin), results.slice(-part.length).filter(r => r.out === 'fit').length);   /* 맞힌 문제의 동전만 */ if (S.oid !== my) return; E.lanterns(b + 1, boards); snd(660, .15, 'triangle', .1); snd(990, .2, 'triangle', .1, .12); await sleep(300); }
  /* 기록: 복습만(덤 한 판은 세지 않는다) · 하루 한 번 · 오늘 가장 큰 불꽃 */
  const st2 = V.today(day); if (!S.bonus) { const out = V.settle(M.all(), results, day, M.keep); for (const c of Object.keys(out.m)) M.put(c, out.m[c]); S.starred = out.starred; st2.done = true; st2.stars = out.starred.length; }
  st2.best = Math.max(st2.best | 0, S.maxFire); V.save(st2); S.log.push({ todayEnd: true, bonus: S.bonus, starred: S.starred.join(), best: st2.best });
  await finale(); if (S.oid !== my) return;
  const flags = S.starred.map(() => `<span class="fl">${art(ICON.flag)}<i>${art(ICON.star)}</i></span>`), items = [...flags, ...S.launched.map(f => art(f.gold ? ICON.spark : ICON.burst))];
  const choice = await E.home({ items, again: '덤 한 판' }); if (S.oid !== my) return;
  if (choice === 'again') today(); else location.href = GO; }
/** 하네스 · 교사용: 지금 나들이를 거둔다. */
function abort(){ S.oid++; S.active = false; if (S.done) { const d = S.done; S.done = null; d('abort'); } stage.tweens.length = 0; S.open.L = 0; S.open.R = 0; clearCrate(); chooseHide(); A.trayClear(); S.busy = false; S.flying = false; S.awayG = null; if (S.rocket) { S.rocket.visible = true; rocketPlace(); } S.fuseShown = false; fuseDraw(); doorTick(); }

window.__flash = { S, R, V, M, E, T, stage, wallet, outing, today, abort, hitAt, answerAt, burst, launch: (lv, g, big) => launch(lv, g, big), fuseAt: () => stage.screenOf(fusePt(1 - S.clock)),
  crateAt: () => { const q = crateQuad(); return { x: q.reduce((s, v) => s + v.x, 0) / 4, y: q.reduce((s, v) => s + v.y, 0) / 4, q }; },
  groupAt: g => { const r = R.region(S.p.groups[g].region); return stage.screenOf(V3((r.x0 + r.x1) / 2, T.DECK + T.WALL * .6, (r.z0 + r.z1) / 2)); },
  visible: () => S.inCrate.filter(o => o.visible && POOL.includes(o)).length, open: () => ({ ...S.open }), items: () => S.items.map(o => { const q = stage.screenOf(o.position); return { x: q.x, y: q.y, vis: o.visible, gi: o.userData.gi }; }),
  keyRects: () => [...document.querySelectorAll('#choose.on button, #tray.on, #marbles, #lanterns, #coins, .back, #snd, #tell.on')].map(e => e.getBoundingClientRect()).filter(r => r.width) };
if (MODE) build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
