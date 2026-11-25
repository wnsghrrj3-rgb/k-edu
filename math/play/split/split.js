/* 가르기 틀 「두 배에 나눠 싣기」(3D, T01) — 선착장의 짐을 두 배에 나눠 실어 보낸다(가르기) · 두 배가 싣고 온 짐을 창고에 모은다(모으기).
 * 설계: 핸드오프 kedu/math-play-work/T01_가르기_틀.md · 정본 kmotion/math-wizard/27_수학놀이터_내용지도와_틀_설계_v1.md(4 · 5 · 6절). 규칙 = ./rules.js(화면 없음).
 * 한 나들이 = 낱칸 하나(B01~B05) · 판 = 문제 셋(구슬) · 나들이 = 판 셋(등불). 덧셈식 · 뺄셈식 · 합 고르기는 없다 — 띠는 교과서 말 「5를 가르면 2와 3」 「2와 3을 모으면 5」.
 * 걸음 ① 손으로(낱칸의 첫 판 · 막히면 한 판 다시) → 걸음 ② 먼저 고르기(통과는 여기서만 센다). 틀린 표시 없음 — 짐이 남거나 칸이 빈 것이 보이고, 그 수가 물러난다.
 * 사건(rules.js events): 닻을 올리는 배(시계 · 생각하는 동안에만) · 파도(짐이 굴러감) · 깜짝 짐 · 안개(통과 뒤) · 뱃고동(깨끗한 문제가 이어지면). 사건은 수를 바꾸지 않는다.
 * 그림은 기성 3D 재료만(Quaternius Pirate Kit, CC0 — ./assets · 이름표는 ./art.js). 화면 위 표시(팻말 · 띠 · 수 셋 · 구슬 · 등불 · 안개)만 코드로. */
import { createStage, THREE, CALM, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=2';
import * as H from '../common/hint.js?v=5';
import { wallet, audio, tone, confetti, grew } from '../common/kit.js?v=8';
import { art } from '../common/art.js?v=8';
import * as E from '../common/ends.js?v=1';
import * as M from '../common/map.js?v=11';
import * as C from '../common/choose.js?v=4';
import { wa, eul, garu, moeu } from '../common/say.js?v=4';
import * as R from './rules.js?v=3';
import { ASSETS, MODEL, SCENERY, BOATS, GLOW, ICON } from './art.js?v=1';

// ── 내가 정한 수치(화면 · 움직임 — 준호가 보고 바꾼다). 문제 · 사건 · 시계 수치는 ./rules.js 의 T
const T = { DECK: .45, DZ: 1.95, CARGO: { dx: .58, z: [1.62, 2.26], s: .5 }, WARE: { dx: .52, z: [1.6, 2.2], s: .46 },
  SHIP: { s: .62, sTall: .74, x: 2.25, z: -.7, xTall: 1.12, zTall: -1.45 }, SLOT: { x: [-.78, -.26, .26, .78], z: [.34, -.3], s: .62 }, SLOT10: { x: [-.8, -.4, 0, .4, .8], z: [.34, -.3], s: .5 },
  PILE: { x: [2.0, 2.42], z: [1.6, 2.0, 2.4], s: .42, up: .38 }, KEEPER_X: 2.75, KEEPER_X_FILL: 3.1, PALLET: { x: 1.5, z: [1.22, 2.62], dy: .035, dark: .6 }, FAR: { x: 3.7, z: -1.9, xTall: 1.12, zTall: -3.3 }, SAIL_MS: 900,
  FLY_MS: 380, ARRIVE_MS: 1500, LEAVE_MS: 1800, SHOW_MS: 1400, LAST_BIG: 1.18, DRAG_PX: 12, PICK_PX: 46, ONBOAT_PX: 24, BOAT_PX: 95, ANCHOR_DROP: .5, FRONT: .8, TELL_GRACE: 5 };
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const GO = '/math/play/go/';
const GO_NOW = !(Q.get('cell') && R.CELLS[Q.get('cell')]); if (GO_NOW) location.replace(GO);   /* ?cell= 없이 열리면 모형을 불러오기 전에 고르는 화면으로 */
const S = { ready: false, busy: true, active: false, gate: false, t: 0, oid: 0, cell: null, kind: null, p: null, res: null, step: 2, ev: {}, board: null, clock: 0, streak: 0, closed: false,
  ways: [], hit: -1, cargo: [], ware: [], overs: [], picks: [], pile: [], far: false, sel: null, drag: null, wave: null, choose: null, fog: false, lastAct: 0, back: false, surpriseCarry: false, hist: {}, log: [], signs: [], tall: false, coinsShown: 0 };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [18, 62], shadow: { left: -7, right: 7, top: 5, bottom: -5 }, assets: ASSETS }), { scene, camera } = stage;
const K = {};
const NAMES = [...new Set([MODEL.boat, MODEL.cargo, MODEL.dock, MODEL.pole, MODEL.keeper, MODEL.wood, ...SCENERY.map(s => s[0])])];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const shipS = () => S.tall ? T.SHIP.sTall : T.SHIP.s;   /* 세로 화면은 배를 조금 크게(실린 짐이 보이게) */
const pick = a => a[Math.floor(Math.random() * a.length)];

// ── 배: Ship_Small 을 조각으로 나눠 몸통만 빛깔을 입히고(돛이 없는 모형) · 옆구리 장식 통은 빼고(세어 볼 짐과 헷갈림) · 닻은 따로(시계)
let KIT = null;
function shipKit(g){ g.scene.updateMatrixWorld(true); let mesh = null; g.scene.traverse(m => { if (m.isMesh && !mesh) mesh = m; });
  const ps = stage.pieces(mesh).map(p => { p.geo.applyMatrix4(mesh.matrixWorld); p.geo.computeBoundingBox(); p.center = p.geo.boundingBox.getCenter(V()); p.size = p.geo.boundingBox.getSize(V()); return p; });
  const hull = ps.reduce((a, b) => b.tris > a.tris ? b : a), anchor = ps.filter(p => p !== hull).reduce((a, b) => b.tris > a.tris ? b : a);
  const side = p => p !== hull && p !== anchor && Math.abs(p.center.z) > 1.0;
  /* 짐 칸의 높이: 몸통을 위에서 내려 비춰 갑판에 닿는 자리 */
  const probe = new THREE.Mesh(hull.geo, new THREE.MeshBasicMaterial()), ray = new THREE.Raycaster();
  const slotsOf = L => { const out = []; for (const z of L.z) for (const x of L.x) { ray.set(V(x, 5, z), V(0, -1, 0)); const h = ray.intersectObject(probe); out.push({ x, y: h.length ? h[0].point.y : .7, z }); } return out; };
  return { hull, anchor, rest: ps.filter(p => p !== hull && p !== anchor && !side(p)), mat: mesh.material, slots: { 8: slotsOf(T.SLOT), 10: slotsOf(T.SLOT10) }, cx: -hull.center.x }; }   /* 배 칸: 넷씩 두 줄(B) · 다섯씩 두 줄 = 열 칸(C — 10 까지) */
function makeShip(side){ const o = new THREE.Group(), inner = new THREE.Group(); o.add(inner); inner.position.x = KIT.cx;
  const tint = KIT.mat.clone(); tint.color.set(BOATS[side].tint).lerp(new THREE.Color('#ffffff'), .42); tint.emissive = new THREE.Color(BOATS[side].tint); tint.emissiveIntensity = .22;   /* 나무 무늬가 어두워 빛깔이 묻히지 않게 */
  inner.add(stage.shadows(new THREE.Mesh(KIT.hull.geo, tint))); for (const p of KIT.rest) inner.add(stage.shadows(new THREE.Mesh(p.geo, KIT.mat)));
  const anchor = new THREE.Group(); anchor.add(stage.shadows(new THREE.Mesh(KIT.anchor.geo, KIT.mat))); inner.add(anchor);
  const ghostSets = {}; for (const n of [8, 10]) ghostSets[n] = KIT.slots[n].map(s => { const g = ghostBarrel(); g.position.set(s.x, s.y, s.z); g.scale.setScalar(n === 10 ? T.SLOT10.s : T.SLOT.s); g.visible = false; inner.add(g); return g; });
  o.scale.setScalar(shipS()); scene.add(o); return { side, obj: o, inner, anchor, ghostSets, ghosts: ghostSets[8], load: [], slots: KIT.slots[8], slotS: T.SLOT.s }; }
/** 배 칸 바꾸기(배가 비었을 때만 — 문제를 시작할 때). */
function setSlots(n){ for (const sh of Object.values(ships)) { if (sh.slots === KIT.slots[n]) continue; sh.ghosts.forEach(g => { g.visible = false; }); sh.slots = KIT.slots[n]; sh.ghosts = sh.ghostSets[n]; sh.slotS = n === 10 ? T.SLOT10.s : T.SLOT.s; } }
const slotN = () => (R.CELLS[S.cell] || {}).slots || 8;
let GHOST = null;
function ghostBarrel(){ const g = K[MODEL.cargo].scene.clone(); g.traverse(m => { if (m.isMesh) { m.material = GHOST; m.castShadow = false; m.renderOrder = 2; } }); return g; }
function barrelObj(){ const b = K[MODEL.cargo].scene.clone(); b.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); } }); return stage.shadows(b); }
function sparkle(o, on){ o.traverse(m => { if (m.isMesh) { m.material.emissive = new THREE.Color(on ? GLOW : '#000000'); m.material.emissiveIntensity = on ? .6 : 0; } }); o.userData.sparkle = on; }

const ships = {};
async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); }));
  GHOST = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: .45, depthWrite: false, roughness: .6 });
  KIT = shipKit(K[MODEL.boat]); Object.assign(ships, { red: makeShip('red'), blue: makeShip('blue') });
  const dk = stage.dockKit(K[MODEL.dock]), step = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36;
  let i = 0; for (let x = -4.6; x <= 4.6; x += step, i++) { const m = new THREE.Mesh(dk.planks[i % dk.planks.length], dk.mat); m.position.set(x, T.DECK - dk.plankH / 2, T.DZ); scene.add(stage.shadows(m)); }
  for (let x = -4.2; x <= 4.4; x += 2.8) for (const z of [T.DZ - 1.15, T.DZ + 1.2]) stage.put(K[MODEL.pole], x, T.DECK - .8, z, 1, x);
  for (const s of SCENERY) stage.put(K[s[0]], s[1], s[2], s[3], s[4], s[5]);
  S.keeper = stage.person(K[MODEL.keeper]); S.keeper.obj.position.set(2.75, T.DECK + .02, T.DZ + .25); S.keeper.obj.rotation.y = -Math.PI / 2; stage.play(S.keeper, 'Idle'); S.keeper.obj.visible = false;
  S.woodPile = [0, 1, 2].map(k => stage.put(K[MODEL.wood], 3.2 + (k % 2) * .3, T.DECK + .12 + (k > 1 ? .2 : 0), T.DZ - .6 + (k === 1 ? .1 : 0), .9, k)); S.woodPile.forEach(w => { w.visible = false; });
  S.wghost = GHOST.clone(); S.wghost.emissive = new THREE.Color('#ffd34d'); S.wghost.emissiveIntensity = 0;   /* 창고 빈 칸(10 모으기 ②에서 빛남) */
  S.wareGhosts = Array.from({ length: 10 }, (_, k) => { const g = ghostBarrel(); g.traverse(m => { if (m.isMesh) m.material = S.wghost; }); g.scale.setScalar(T.WARE.s); g.visible = false; scene.add(g); return g; });
  S.dockGhosts = Array.from({ length: 10 }, () => { const g = ghostBarrel(); g.scale.setScalar(T.CARGO.s); g.visible = false; scene.add(g); return g; });
  /* 열 칸 틀의 깔판: 선착장 판자 조각을 가로로 깔고 조금 어둡게(열 칸이 한 덩이로 보이게) */
  { const pm = dk.mat.clone(); pm.color.multiplyScalar(T.PALLET.dark); S.pallet = new THREE.Group(); const g0 = dk.planks[0]; g0.computeBoundingBox(); const bb = g0.boundingBox, len = bb.max.z - bb.min.z || 1, cz = (bb.max.z + bb.min.z) / 2, depth = T.PALLET.z[1] - T.PALLET.z[0];
    let k = 0; for (let x = -T.PALLET.x; x <= T.PALLET.x + .001; x += step, k++) { const m = new THREE.Mesh(dk.planks[k % dk.planks.length], pm); m.scale.z = depth / len; m.position.set(x, T.DECK - dk.plankH / 2 + T.PALLET.dy, (T.PALLET.z[0] + T.PALLET.z[1]) / 2 - cz * m.scale.z); m.receiveShadow = true; S.pallet.add(m); }
    S.pallet.visible = false; scene.add(S.pallet); }
  stage.onResize = aim; stage.resize();
  S.signs = A.signs(3); S.signs[0].classList.add('red'); S.signs[1].classList.add('blue');
  let c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); coinsDraw(); wallet.onChange(() => coinsDraw());
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
  layoutShips(true); $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true;
  const want = Q.get('cell'); if (want && R.CELLS[want]) outing(want); else location.replace(GO); }   /* ?cell= 없이 열리면 고르는 화면으로(T03 — 들머리를 /math/play/go/ 로 옮김) */
function coinsDraw(pop){ const c = $('coins'); if (!c) return; const v = `${art('coin')}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } } }

// ── 카메라 · 배 자리(세로 화면은 배를 세워 나란히)
function aim(w, h){ const tall = h > w * 1.05; S.tall = tall; camera.fov = tall ? 52 : 40; const asp = w / h, half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * asp), span = tall ? 2.55 : 4.5, dist = Math.max(6.2, span / Math.tan(half));
  camera.position.set(0, dist * (tall ? .74 : .6), T.DZ + dist * (tall ? .66 : .8)); camera.lookAt(0, .1, tall ? -.15 : .15);
  /* 선착장 앞 끝이 화면 아래에서 FRONT 쯤에 오게 그림을 위아래로 옮긴다(아래쪽 빈 물을 줄이고 수 셋 자리를 남김) */
  camera.clearViewOffset(); camera.aspect = asp; camera.updateProjectionMatrix(); camera.updateMatrixWorld(); const f = V(0, T.DECK, T.DZ + 1.0).project(camera), dy = h * T.FRONT - (1 - f.y) / 2 * h; camera.setViewOffset(w, h, 0, -dy, w, h); if (KIT) layoutShips(); }
function shipHome(side){ const k = side === 'red' ? -1 : 1; if (side === 'blue' && S.far) return S.tall ? { x: T.FAR.xTall, z: T.FAR.zTall, ry: Math.PI / 2 } : { x: T.FAR.x, z: T.FAR.z, ry: 0 };   /* 10 모으기 ②: 파란 배는 먼바다에서 기다린다 */
  return S.tall ? { x: k * T.SHIP.xTall, z: T.SHIP.zTall, ry: Math.PI / 2 } : { x: k * T.SHIP.x, z: T.SHIP.z, ry: 0 }; }
function layoutShips(force){ for (const side of ['red', 'blue']) { const sh = ships[side], h = shipHome(side); sh.obj.rotation.y = h.ry; if (force || !S.busy) { sh.obj.position.set(h.x, 0, h.z); sh.obj.scale.setScalar(shipS() * (S.lastQ && S.active ? T.LAST_BIG : 1)); } } }

// ── 선착장 자리 · 창고 자리(다섯씩 한 줄 · 여섯부터 둘째 줄)
function spot(i, n, C){ const row = i < 5 ? 0 : 1, inRow = row ? n - 5 : Math.min(5, n), col = row ? i - 5 : i; return V((col - (inRow - 1) / 2) * C.dx, T.DECK, C.z[row]); }
const dockPos = (i, n) => spot(i, n, T.CARGO);
const wareCap = () => (R.CELLS[S.cell] || {}).max > 5 ? 10 : 5;
const warePos = i => spot(i, wareCap(), T.WARE);
const slotWorld = (sh, k) => { const s = sh.slots[k]; return sh.inner.localToWorld(V(s.x, s.y, s.z)); };
const onBoat = sh => sh.load.length;
const dockLeft = () => S.cargo.filter(b => b.where === 'dock');
const ten = () => !!(R.CELLS[S.cell] || {}).slots;   /* 열 칸 틀 낱칸(C02 · C03) */
const PILE_AT = (() => { const P = T.PILE, out = []; for (const z of P.z) for (const x of P.x) out.push([x, 0, z]); for (const z of [(P.z[0] + P.z[1]) / 2, (P.z[1] + P.z[2]) / 2]) for (const x of P.x) out.push([x, 1, z]); out.push([(P.x[0] + P.x[1]) / 2, 2, P.z[1]]); return out; })();   /* 바닥 여섯 · 둘째 겹 넷 · 꼭대기 하나 = 열하나(더미로 보이게) */
const pilePos = i => { const [x, l, z] = PILE_AT[Math.min(i, PILE_AT.length - 1)]; return V(x, T.DECK + l * T.PILE.up, z); };   /* 선착장 옆 짐 더미(열 칸 틀 오른쪽 · 틀과 떨어져) · 넘친 짐도 여기 */
const anchorSh = () => S.p && S.p.kind === 'fill' ? ships.blue : ships.red;   /* 10 모으기의 닻 = 먼바다의 파란 배가 가 버리려 함 */
/** 선착장 열 칸 틀의 빈 칸(C03 — 짐이 실려 나간 자리에 흐린 통이 남는다) · 창고 빈 칸 빛남(C02 ② — 수 셋이 떠 있는 동안) */
function tenDraw(t){ const on = ten() && S.p && S.p.kind === 'split' && !S.fog && !S.gate; S.dockGhosts.forEach((g, i) => { const b = S.cargo[i]; g.visible = on && !!b && b.where !== 'dock'; if (g.visible) g.position.copy(dockPos(i, 10)); });
  S.pallet.visible = ten() && !!S.p && !S.gate && !(S.fog && S.p.kind === 'fill');
  const glow = !!S.choose && S.p && S.p.kind === 'fill' && !S.fog; S.wghost.emissiveIntensity = glow ? .55 + Math.sin(t * 5) * .3 : 0; }

// ── 짐 옮기기(세계 좌표로 날려서 · 배에 닿으면 배의 자식으로)
async function flyTo(o, to, scale, ms = T.FLY_MS){ const up = Math.max(o.position.y, to.y) + .6;
  await Promise.all([stage.tween(o.position, { x: to.x, z: to.z }, ms, t => t), stage.tween(o.position, { y: up }, ms * .45, t => t * (2 - t)).then(() => stage.tween(o.position, { y: to.y }, ms * .55, t => t * t)), stage.tween(o.scale, { x: scale, y: scale, z: scale }, ms)]); }
function toScene(o){ scene.attach(o); }
async function toShip(b, sh, ms){ toScene(b.o); b.o.visible = true; const k = sh.load.length; sh.load.push(b); b.where = sh.side; ghostsDraw(sh); await flyTo(b.o, slotWorld(sh, k), sh.slotS * sh.obj.scale.x, ms); if (b.where !== sh.side) return; sh.inner.attach(b.o); const s = sh.slots[sh.load.indexOf(b)]; b.o.position.set(s.x, s.y, s.z); b.o.scale.setScalar(sh.slotS); b.o.rotation.set(0, b.home, 0); }
function repack(sh){ sh.load.forEach((b, k) => { if (b.o.parent !== sh.inner) return; const s = sh.slots[k]; stage.tween(b.o.position, { x: s.x, y: s.y, z: s.z }, 160); }); ghostsDraw(sh); }
async function toDock(b, ms){ for (const sh of Object.values(ships)) { const k = sh.load.indexOf(b); if (k >= 0) { sh.load.splice(k, 1); repack(sh); } } toScene(b.o); b.where = 'dock'; await flyTo(b.o, dockPos(b.home, S.cargo.length), T.CARGO.s, ms); b.o.rotation.set(0, b.home, 0); }
async function toWare(b, ms){ for (const sh of Object.values(ships)) { const k = sh.load.indexOf(b); if (k >= 0) { sh.load.splice(k, 1); repack(sh); } } toScene(b.o); const k = S.ware.length; S.ware.push(b); b.where = 'ware'; wareGhostsDraw(); await flyTo(b.o, warePos(k), T.WARE.s, ms); if (S.fog && S.p && S.p.kind === 'fill' && b.where === 'ware') b.o.visible = false; }   /* 안개 판: 틀에 닿으면 가려짐 */
/** 짐들을 제 배(b.from)로 되돌린다(창고 · 틀 위에서). */
async function backToShip(list){ await Promise.all(list.map(b => { const k0 = S.ware.indexOf(b); if (k0 >= 0) S.ware.splice(k0, 1); const o0 = S.overs.indexOf(b); if (o0 >= 0) S.overs.splice(o0, 1); const sh = ships[b.from]; toScene(b.o); b.o.rotation.set(0, b.home, 0); const k = sh.load.length; sh.load.push(b); b.where = sh.side;
    return flyTo(b.o, slotWorld(sh, k), sh.slotS * sh.obj.scale.x).then(() => { if (b.where !== sh.side) return; sh.inner.attach(b.o); const s = sh.slots[sh.load.indexOf(b)]; b.o.position.set(s.x, s.y, s.z); b.o.scale.setScalar(sh.slotS); }); })); wareGhostsDraw(); }
const wareBack = () => backToShip(S.ware.slice());
/** 10 모으기: 열 칸에 들어가지 못한 짐 — 선착장 옆에 넘쳐 남는다(j 번째 자리) · 기우뚱. */
async function toOver(b, j){ for (const sh of Object.values(ships)) { const k = sh.load.indexOf(b); if (k >= 0) { sh.load.splice(k, 1); repack(sh); } } toScene(b.o); b.where = 'over'; S.overs.push(b);
  await flyTo(b.o, pilePos(j), T.PILE.s); tone(220, .2, 'sine', .08, 0, 140); await stage.tween(b.o.rotation, { z: .28 }, 140); await stage.tween(b.o.rotation, { z: -.22 }, 180); await stage.tween(b.o.rotation, { z: 0 }, 180); }
/** 10 모으기 ①: 선착장 옆 짐 더미(답 + FILL_EXTRA). */
function makePile(n){ S.pile = Array.from({ length: n }, (_, i) => { const o = barrelObj(); o.position.copy(pilePos(i)); o.scale.setScalar(T.PILE.s); o.rotation.y = i; scene.add(o); return { o, home: i, where: 'pile', from: 'pile' }; }); }
/** 10 모으기 ②: 파란 배가 먼바다 ↔ 선착장. */
async function sailBlue(inward){ S.far = !inward; const h = shipHome('blue'); await stage.tween(ships.blue.obj.position, { x: h.x, z: h.z }, T.SAIL_MS, t => 1 - (1 - t) ** 3); }
function emptyShip(sh){ for (const b of sh.load) b.o.parent && b.o.parent.remove(b.o); sh.load = []; ghostsDraw(sh); }
function wobble(sh){ S.did = true; const o = sh.obj; stage.tween(o.rotation, { z: .1 }, 110).then(() => stage.tween(o.rotation, { z: -.08 }, 150)).then(() => stage.tween(o.rotation, { z: 0 }, 200)); }
/** 넘침: 짐이 배까지 갔다가 기우뚱 — 선착장으로 튕겨 돌아온다. */
async function bounce(b, sh){ toScene(b.o); b.where = 'fly'; const k = Math.min(sh.load.length, sh.slots.length - 1); await flyTo(b.o, slotWorld(sh, k).add(V(0, .25, 0)), sh.slotS * sh.obj.scale.x, T.FLY_MS * .8); wobble(sh); tone(220, .22, 'sine', .1, 0, 140); await toDock(b, T.FLY_MS * 1.1); }
/** 빈 칸: 배에는 「보이는 칸」만큼 흐린 통 — 실린 칸은 가린다. */
function ghostsDraw(sh){ const n = sh.showSlots | 0; sh.ghosts.forEach((g, k) => { g.visible = k < n && k >= sh.load.length; }); }
function wareGhostsDraw(){ const n = S.wareShow | 0, hide = S.fog && S.p && S.p.kind === 'fill'; S.wareGhosts.forEach((g, k) => { g.visible = !hide && k < n && k >= S.ware.length; if (k < n) g.position.copy(warePos(k)); }); }

// ── 팻말(빨간 배 ● · 파란 배 ▲ · 선착장/창고)
function signsDraw(){ const sg = S.signs, p = S.p; if (!p || S.gate) { sg.forEach(e => A.signDraw(e, null)); return; }
  const at = (sh, dy = 1.25) => stage.screenOf(sh.obj.position.clone().add(V(0, dy * sh.obj.scale.x / T.SHIP.s, 0)));
  const red = p.kind === 'ways' ? onBoat(ships.red) : p.a, blue = p.kind === 'ways' ? onBoat(ships.blue) : p.kind === 'join' ? p.b : S.closed ? p.b : '?', inWareK = p.kind === 'join' || p.kind === 'fill';
  A.signDraw(sg[0], S.away ? null : at(ships.red), red, '', BOATS.red.mark); A.signDraw(sg[1], S.away ? null : at(ships.blue), blue, '', BOATS.blue.mark);
  sg[1].classList.toggle('ask', blue === '?' && !!S.choose && S.choose.side === 'blue'); sg[1].classList.toggle('done', (p.kind === 'split' || p.kind === 'fill') && S.closed);
  const dk = p.kind === 'join' ? (S.closed ? p.N : '?') : p.N, n = inWareK ? wareCap() : Math.max(1, S.cargo.length), first = inWareK ? warePos(0) : dockPos(0, n);   /* 10 모으기: 창고 팻말 = 10(채울 수) */
  A.signDraw(sg[2], stage.screenOf(V(first.x - .62, T.DECK + .55, (inWareK ? T.WARE : T.CARGO).z[0] + .05)), dk);
  sg[2].classList.toggle('ask', dk === '?' && !!S.choose && S.choose.side === 'ware'); sg[2].classList.toggle('done', inWareK && S.closed); }

// ── 띠: 교과서 말 그대로 — 가르기 「5를 가르면 2와 ?」 · 모으기 「1과 1을 모으면 ?」 · 10 모으기 「6과 ?를 모으면 10」 · 여러 가지로 「7을 가르면 2와5 · 3과4 · ?」(+ = → 은 쓰지 않는다)
function trayDraw(){ A.trayClear(); const t = $('tray'), p = S.p; if (!p || S.gate) return; const b = (v, c = '') => `<b class="${c}">${v}</b>`, w = s => `<i class="w">${s}</i>`; let h = '';
  if (p.kind === 'split') h = b(p.N) + w(garu(p.N)) + b(p.a, 'red') + w(wa(p.a)) + (S.closed ? b(p.b, 'blue done') : b('?', 'hole blue'));
  else if (p.kind === 'fill') h = b(p.a, 'red') + w(wa(p.a)) + (S.closed ? b(p.b, 'blue done') : b('?', 'hole blue')) + w(moeu(S.closed ? p.b : '?')) + b(p.N, S.closed ? 'done' : '');   /* 「6과 ?를 모으면 10」 → 닫히면 받침에 맞게 */
  else if (p.kind === 'join') h = b(p.a, 'red') + w(wa(p.a)) + b(p.b, 'blue') + w(moeu(p.b)) + (S.closed ? b(p.N, 'done') : b('?', 'hole'));
  else h = b(p.N) + w(garu(p.N)) + S.ways.map((x, k) => `<b class="way${S.hit === k ? ' hit' : ''}">${x[0]}${w(wa(x[0]))}${x[1]}</b>`).join('') + (S.ways.length < R.T.WAYS ? b('?', 'hole') : '');
  t.innerHTML = h; t.className = 'on'; holeAsk(); trayFit(); }
function trayFit(){ const t = $('tray'); t.style.fontSize = ''; const room = innerWidth * .96; if (t.offsetWidth > room) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room / t.offsetWidth) + 'px'; }   /* 좁은 화면에서 띠가 넘치면 글씨를 줄인다 */
const holeAsk = () => C.ask(!!S.choose);   /* 수 셋이 떠 있는 동안은 띠의 「?」 칸이 깜박인다 */

// ── 수 셋(띠 바로 아래 · 화면 가운데 위 · 크게): 맞으면 실림 · 아니면 짐이 남거나 칸이 빈 것이 보이고 그 수가 물러난다
function chooseShow(side, list){ S.choose = { side, list }; const tl = $('tell'); if (tl) tl.classList.remove('on'); C.show(list, onPick); }   /* 한 줄 안내가 남아 있으면 수 셋을 가리지 않게 걷는다 */   /* 공통 부품 common/choose.js(정본 5-9절) */
function chooseHide(){ C.hide(); S.choose = null; }
function choosePlace(){ if (S.choose) C.place(); }
async function onPick(k, btn){ if (!S.active || S.busy || !S.choose || S.acting) return; if (S.p.kind === 'split' && onBoat(ships.red) !== S.p.a) { chooseHide(); return; } const my = S.oid; audio(); S.lastAct = S.t; H.hide(); const p = S.p, ans = R.answerOf(p), how = R.judge({ answer: ans }, { type: 'pick', k }); S.log.push({ pick: k, how }); S.busy = true; fogOff(); if (S.wave) { const w = S.wave; w.rolling = false; S.wave = null; w.b.o.rotation.x = 0; w.b.o.position.copy(dockPos(w.b.home, S.cargo.length)); }   /* 굴러가던 짐은 제자리로(개수 그대로) */
  if (p.kind === 'split') { const sh = ships.blue, left = dockLeft(); sh.showSlots = k; ghostsDraw(sh); tone(520, .1, 'triangle', .1);
    const go = left.slice(0, k); await Promise.all(go.map((b, i) => sleep(i * 70).then(() => toShip(b, sh)))); await sleep(how === 'fit' ? 200 : T.SHOW_MS); if (S.oid !== my) return;
    if (how === 'fit') { chooseHide(); await complete(); return; }
    S.res.retreat = true; await Promise.all(go.map(b => toDock(b))); sh.showSlots = 0; ghostsDraw(sh); }
  else if (p.kind === 'fill') { const sh = ships.blue, room = wareCap() - S.ware.length; tone(520, .1, 'triangle', .1); emptyShip(sh); loadShip(sh, k); const go = sh.load.slice(); go.forEach(b => { b.from = 'blue'; });   /* 고른 수만큼 싣고 들어온다 */
    await sailBlue(true); if (S.oid !== my) return;
    for (let i = 0; i < go.length; i++) { await sleep(60); if (S.oid !== my) return; if (i < room) toWare(go[i]); else toOver(go[i], i - room); } await sleep(T.FLY_MS + (how === 'fit' ? 200 : T.SHOW_MS)); if (S.oid !== my) return;   /* 작으면 빈 칸이 남고 · 크면 넘친 짐이 선착장에 */
    if (how === 'fit') { chooseHide(); await complete(); return; }
    S.res.retreat = true; await backToShip(go); if (S.oid !== my) return; await sailBlue(false); if (S.oid !== my) return; emptyShip(sh); }
  else { S.wareShow = k; wareGhostsDraw(); tone(520, .1, 'triangle', .1); const go = [...ships.red.load, ...ships.blue.load].slice(0, k); go.forEach(b => { b.from = b.where; }); for (let i = 0; i < go.length; i++) { await sleep(60); if (S.oid !== my) return; toWare(go[i]); } await sleep(T.FLY_MS + (how === 'fit' ? 200 : T.SHOW_MS)); if (S.oid !== my) return;
    if (how === 'fit') { chooseHide(); await complete(); return; }
    S.res.retreat = true; await wareBack(); S.wareShow = 0; wareGhostsDraw(); }
  C.retreat(btn); tone(240, .2, 'sine', .07); stage.play(S.keeper, 'No', true); S.busy = false; S.lastAct = S.t; }

// ── 누르기 · 끌기
const canvas = $('c');
function nearest(list, x, y, max){ let best = null, d0 = max; for (const b of list) { const q = stage.screenOf(b.o), d = Math.hypot(q.x - x, q.y - y); if (d < d0) { d0 = d; best = b; } } return best; }
function boatUnder(e){ const ray = stage.pointerRay(e); for (const side of ['red', 'blue']) { if (ray.intersectObject(ships[side].obj, true).length) return side; }
  let best = null, d0 = T.BOAT_PX; for (const side of ['red', 'blue']) { const q = stage.screenOf(ships[side].obj.position.clone().add(V(0, .45, 0))), d = Math.hypot(q.x - e.clientX, q.y - e.clientY); if (d < d0) { d0 = d; best = side; } } return best; }
function inWare(e){ const a = stage.screenOf(warePos(0)), b = stage.screenOf(warePos(wareCap() - 1)); return e.clientX > Math.min(a.x, b.x) - 60 && e.clientX < Math.max(a.x, b.x) + 60 && e.clientY > Math.min(a.y, b.y) - 70 && e.clientY < Math.max(a.y, b.y) + 40; }
const loadable = () => dockLeft().filter(b => !(S.wave && S.wave.b === b));
function select(b){ S.did = true; if (S.sel && S.sel !== b) { const o = S.sel; S.sel = null; if (o.where === 'dock') stage.tween(o.o.position, { y: T.DECK }, 120); } S.sel = b; if (b) { stage.tween(b.o.position, { y: T.DECK + .28 }, 140); tone(660, .06, 'triangle', .06); } }
canvas.addEventListener('pointerdown', e => { audio(); if (!S.ready || S.gate || E.homeOpen()) return; S.lastAct = S.t; H.hide(); S.did = false; if (!S.active || S.busy) { S.log.push({ ignored: S.active ? 'busy' : 'idle' }); ripple(e.clientX, e.clientY); return; }
  if (S.wave && S.wave.rolling) { const q = stage.screenOf(S.wave.b.o); if (Math.hypot(q.x - e.clientX, q.y - e.clientY) < 70) { catchWave(); return; } }
  const p = S.p;
  if (p.kind === 'split' || p.kind === 'ways') { const b = nearest(loadable(), e.clientX, e.clientY, T.PICK_PX); if (b && !(S.fog && p.kind === 'split')) { S.drag = { b, x: e.clientX, y: e.clientY, moved: false }; S.did = true; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} return; } }
  tap(e); if (!S.did) nudge(e); });   /* 준호 2026-11-20 「뭘 눌러도 반응도 없고」 — 헛누름에도 세계가 답한다 */
canvas.addEventListener('pointermove', e => { const d = S.drag; if (!d) return; if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > T.DRAG_PX) { d.moved = true; if (S.sel && S.sel !== d.b) select(null); S.sel = null; }
  if (d.moved) { const ray = stage.pointerRay(e), hit = V(); if (ray.ray.intersectPlane(new THREE.Plane(V(0, 1, 0), -(T.DECK + .5)), hit)) { d.b.o.position.set(hit.x, T.DECK + .5, hit.z); } } });
canvas.addEventListener('pointercancel', () => { const d = S.drag; if (!d) return; S.drag = null; if (d.b.where === 'dock') toDock(d.b, 200); });
canvas.addEventListener('pointerup', e => { const d = S.drag; if (!d) return; S.drag = null; if (!S.active || S.busy) { if (d.moved) toDock(d.b, 200); return; }
  if (d.moved) { const side = boatUnder(e); if (side) act('load', d.b, side); else toDock(d.b, 220); return; }
  if (S.sel === d.b) { select(null); stage.tween(d.b.o.position, { y: T.DECK }, 120); } else { select(d.b); if (S.p && S.p.kind === 'split') { const q = hintAt(); if (q) H.show(q.x, q.y); } } });   /* 들린 짐 → 어느 배로 갈지 손이 바로 짚는다(길잡이로 세지 않음) */
/** 눌렀다(끌기가 아님): 배 · 배 위의 짐 · 창고 */
function tap(e){ const p = S.p, side = boatUnder(e);
  if (p.kind === 'fill') { const red = ships.red, x = e.clientX, y = e.clientY, nearPile = nearest(S.pile, x, y, T.PICK_PX * 1.4);   /* 10 모으기: 빨간 배 짐을 먼저 내리고(배 · 짐 · 창고를 눌러) → ① 짐 더미에서 빈 칸을 채운다 */
    if (onBoat(red)) { if (side === 'red' || inWare(e) || nearest(red.load, x, y, T.PICK_PX)) act('unload', red.load[red.load.length - 1]); else if (nearPile) popSign(0); return; }
    if (S.step === 1 && S.pile.length && (nearPile || inWare(e))) act('fillFrom', S.pile[S.pile.length - 1]); return; }   /* 늘 맨 위 짐부터(더미가 허공에 뜨지 않게) */
  if (p.kind === 'join') { if (S.step !== 1) return; const onB = [...ships.red.load, ...ships.blue.load], b = nearest(onB, e.clientX, e.clientY, T.PICK_PX); if (b) { act('unload', b); return; } if (side && onBoat(ships[side])) { act('unload', ships[side].load[ships[side].load.length - 1]); return; } if (inWare(e)) { const sh = onBoat(ships.red) ? ships.red : ships.blue; if (onBoat(sh)) act('unload', sh.load[sh.load.length - 1]); } return; }
  if (!side) return; const sh = ships[side];
  if (S.sel) { act('load', S.sel, side); return; }
  const mine = p.kind === 'split' && side === 'blue' && S.step === 2 ? [] : sh.load, back = nearest(mine, e.clientX, e.clientY, T.ONBOAT_PX);
  if (back) { act('back', back); return; }
  const next = loadable().sort((a, b) => b.home - a.home)[0]; if (next) act('load', next, side); else if (p.kind === 'ways' && onBoat(sh)) act('back', sh.load[sh.load.length - 1]); else wobble(sh); }   /* 여러 가지로: 선착장이 비었으면 배를 눌러 맨 위 짐을 내린다(옮겨 싣기) */

/** 손이 한 일 하나. load(짐 → 배) · back(배 → 선착장) · unload(배 → 창고) */
async function act(kind, b, side){ S.did = true; if (!S.active || S.busy || S.closed) return; S.acting = (S.acting | 0) + 1; try { await act1(kind, b, side); } finally { S.acting = Math.max(0, S.acting - 1); } }   /* 마지막 손이 문제를 끝내면 다음 문제가 시작된 뒤에 풀린다 · abort 가 0 으로 되돌려도 음수가 되지 않게 */
async function act1(kind, b, side){ const p = S.p; S.lastAct = S.t; if (S.sel === b) S.sel = null; S.log.push({ act: kind, side, red: onBoat(ships.red), blue: onBoat(ships.blue) });
  if (kind === 'fillFrom') { if (S.ware.length >= wareCap()) return; S.pile.splice(S.pile.indexOf(b), 1); tone(560 + S.ware.length * 30, .08, 'square', .05); await toWare(b); if (S.ware.length >= wareCap() && S.active) await complete(); return; }   /* 다 차는 순간 닫힘 — 넘칠 일이 없다 */
  if (kind === 'unload') { b.from = b.where; if (p.kind === 'fill' && S.ware.length >= wareCap()) return;
    tone(560 + S.ware.length * 30, .08, 'square', .05); await toWare(b);
    if (p.kind === 'fill') { if (!onBoat(ships.red) && S.step === 2 && !S.choose && S.active && !S.closed) { chooseShow('blue', S.picks); tone(880, .1, 'triangle', .08); if (S.ev.fog && !S.fog) fogOn(); } return; }   /* 빨간 배를 다 내리면 먼바다의 파란 배에게 「몇 개?」 */
    if (!onBoat(ships.red) && !onBoat(ships.blue) && S.active) await complete(); return; }
  if (kind === 'back') { if (S.choose && S.p.kind === 'split') chooseHide(); tone(380, .08, 'triangle', .06); await toDock(b); check(); return; }
  const sh = ships[side];
  if (p.kind === 'split') {
    if (side === 'red' && R.judge({ a: p.a, red: onBoat(sh) }, { type: 'load', boat: 'red' }) === 'over') { S.res.over = true; S.streakBreak = true; S.busy = true; await bounce(b, sh); S.busy = false; return; }
    if (side === 'blue') { if (S.step === 2) { stage.tween(b.o.position, { y: T.DECK }, 120); popSign(onBoat(ships.red) < p.a ? 0 : 1); return; } if (onBoat(sh) + 1 > p.b) { S.busy = true; await bounce(b, sh); S.busy = false; return; } } }
  if (p.kind === 'ways' && onBoat(sh) + 1 > p.N - 1) { S.busy = true; await bounce(b, sh); S.busy = false; return; }
  tone(600 + onBoat(sh) * 40, .07, 'square', .05); await toShip(b, sh); check(); }
/** 누른 자리에 물결(화면 위 표시). 아무 일도 안 일어나는 누름이 없게. */
/** 한 줄 안내를 화면 아래쪽으로 — 띠 바로 아래에 두면 배 팻말(「빨간 배는 팻말만큼」의 그 팻말)을 가린다. */
function tellLow(){ const tl = $('tell'); if (tl) { tl.style.top = 'auto'; tl.style.bottom = 'calc(54px + env(safe-area-inset-bottom,0px))'; } }
const ripple = H.ripple;   /* 물결은 common/hint.js 한 곳(세기 틀과 같이 씀) */
/** 헛누름: 물결 + (수 셋이 떠 있으면 수 셋이 들썩 · 아니면 손이 다음에 누를 곳을 짚고 한 줄 안내를 다시). 깨끗함에는 세지 않는다 — 답이 아니라 「어디를 누르는지」만 알려 준다. */
function nudge(e){ ripple(e.clientX, e.clientY); S.log.push({ nudge: true }); tone(520, .07, 'triangle', .05);
  if (S.choose) { const c = $('choose'); if (c.animate) c.animate([{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.12)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 450 }); return; }   /* 수 셋이 들썩 — 여기를 눌러야 한다 */
  const q = hintAt(); if (q) H.show(q.x, q.y);
  const k = S.p.kind === 'fill' && S.step === 2 ? 'fill2' : S.p.kind; if (FIRST[k]) { H.tell('split.nudge', FIRST[k], { times: 1e9 }); tellLow(); } }
function popSign(k){ S.did = true; const e = S.signs[k]; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); tone(330, .08, 'triangle', .06); }

/** 실린 수를 보고: 가르기 ① 다 실림 → 닫힘 · ② 빨간 배가 다 차면 수 셋 · 여러 가지로 다 실림 → 판정 */
async function check(){ const p = S.p; if (!S.active || S.busy) return;
  if (p.kind === 'split') { const r = onBoat(ships.red), bl = onBoat(ships.blue);
    if (S.step === 1) { if (r === p.a && bl === p.b) await complete(); return; }
    if (r === p.a && !S.choose) { chooseShow('blue', R.picksFor(S.cell, p)); tone(880, .1, 'triangle', .08); }
    else if (r !== p.a && S.choose) chooseHide(); return; }
  if (p.kind === 'ways' && !dockLeft().length) { const a = onBoat(ships.red), b = onBoat(ships.blue);
    if (R.judge({ ways: S.ways }, { type: 'send', a, b }) === 'same') { S.res.same = true; S.hit = S.ways.findIndex(w => w[0] === a && w[1] === b); trayDraw(); stage.play(S.keeper, 'No', true); tone(300, .2, 'sine', .07); S.log.push({ same: [a, b] }); setTimeout(() => { S.hit = -1; }, 1600); return; }
    S.ways.push([a, b]); S.hit = -1; trayDraw(); E.marbles(S.mi, 3, S.ways.length / R.T.WAYS); S.log.push({ way: [a, b] });
    if (S.ways.length >= R.T.WAYS) { await complete(); return; }
    S.busy = true; await leave(); refillDock(); await arrive(); S.clock = 0; S.busy = false; S.lastAct = S.t; } }   /* 보내기마다 닻을 다시 내린다 */

// ── 한 문제의 시작 · 끝
function clearAll(){ for (const b of [...S.cargo, ...S.ware, ...S.overs, ...S.pile]) b.o.parent && b.o.parent.remove(b.o); S.overs = []; S.pile = []; for (const sh of Object.values(ships)) { for (const b of sh.load) b.o.parent && b.o.parent.remove(b.o); sh.load = []; sh.showSlots = 0; ghostsDraw(sh); sh.anchor.position.y = 0; sh.obj.rotation.z = 0; }
  S.cargo = []; S.ware = []; S.wareShow = 0; wareGhostsDraw(); S.sel = null; S.drag = null; S.wave = null; chooseHide(); fogOff(); }
function refillDock(){ for (const b of S.cargo) if (b.where === 'gone' && b.o.parent) b.o.parent.remove(b.o); const n = S.p.N; S.cargo = Array.from({ length: n }, (_, i) => { const o = barrelObj(), at = dockPos(i, n); o.position.copy(at); o.scale.setScalar(T.CARGO.s); o.rotation.y = i; scene.add(o); return { o, home: i, where: 'dock' }; }); }
function loadShip(sh, n){ for (let k = 0; k < n; k++) { const o = barrelObj(), s = sh.slots[k]; o.position.set(s.x, s.y, s.z); o.scale.setScalar(sh.slotS); o.rotation.y = k; sh.inner.add(o); const b = { o, home: k, where: sh.side, from: sh.side }; sh.load.push(b); } }
/** 배 둘이 들어온다(뱃고동: 깨끗한 문제가 이어지면 더 빨리 · 음이 오름 · 나들이 마지막 문제는 배가 크다). */
async function arrive(){ const fast = 1 - R.T.HORN_FAST * Math.min(S.streak, 3), big = S.lastQ ? T.LAST_BIG : 1, ms = T.ARRIVE_MS * fast; S.away = false;
  for (const side of ['red', 'blue']) { const sh = ships[side], h = shipHome(side), k = side === 'red' ? -1 : 1; sh.obj.scale.setScalar(shipS() * big); sh.obj.rotation.set(0, h.ry, 0); sh.obj.position.set(h.x + k * 9, 0, h.z - 2); sh.anchor.position.y = -T.ANCHOR_DROP; }   /* 들어올 때는 닻을 내린 채(매어 둠) */
  tone(147 * (1 + .12 * Math.min(S.streak, 3)), .5, 'sawtooth', S.lastQ ? .09 : .05); tone(196 * (1 + .12 * Math.min(S.streak, 3)), .6, 'sine', S.lastQ ? .12 : .07, .05);
  await Promise.all(['red', 'blue'].map(side => { const h = shipHome(side); return stage.tween(ships[side].obj.position, { x: h.x, z: h.z }, ms, t => 1 - (1 - t) ** 3); })); }
/** 배 둘이 떠난다(나란히 · 실린 짐째). */
async function leave(){ S.away = true; tone(392, .2, 'triangle', .08); tone(523, .3, 'triangle', .08, .18); for (const sh of Object.values(ships)) stage.tween(sh.anchor.position, { y: 0 }, 500);
  await sleep(350); await Promise.all(Object.values(ships).map(sh => stage.tween(sh.obj.position, { z: sh.obj.position.z - 9 }, T.LEAVE_MS, t => t * t)));
  for (const sh of Object.values(ships)) { for (const b of sh.load) { b.where = 'gone'; b.o.parent && b.o.parent.remove(b.o); } sh.load = []; sh.showSlots = 0; ghostsDraw(sh); } }

async function runProblem(p, ctx){ const my = S.oid; clearAll(); S.p = p; S.step = ctx.step; S.ev = ctx.ev; S.lastQ = ctx.last; S.mi = ctx.j; S.res = { over: false, retreat: false, hinted: false, missed: false, same: false }; S.closed = false; S.ways = []; S.hit = -1; S.clock = 0; S.streakBreak = false; S.busy = true; setSlots(slotN()); S.picks = []; S.far = p.kind === 'fill' && ctx.step === 2;
  if (p.kind === 'join') { S.keeper.obj.visible = true; S.keeper.obj.position.x = T.KEEPER_X; S.woodPile.forEach(w => { w.visible = true; }); loadShip(ships.red, p.a); loadShip(ships.blue, p.b); S.wareShow = ctx.step === 1 ? wareCap() : 0; wareGhostsDraw(); }
  else if (p.kind === 'fill') { S.keeper.obj.visible = true; S.keeper.obj.position.x = T.KEEPER_X_FILL; S.woodPile.forEach(w => { w.visible = false; }); loadShip(ships.red, p.a); S.wareShow = wareCap(); wareGhostsDraw(); if (ctx.step === 1) makePile(R.pileN(p)); else S.picks = R.picksFor(S.cell, p); }   /* 열 칸 틀은 처음부터 다 보인다 · 짐 더미는 걸음 ①에만 */
  else { S.keeper.obj.visible = p.kind === 'ways'; S.keeper.obj.position.x = T.KEEPER_X; S.woodPile.forEach(w => { w.visible = false; }); refillDock(); if (p.kind === 'split') { ships.red.showSlots = p.a; ghostsDraw(ships.red); } }
  trayDraw(); E.marbles(ctx.j, 3, 0); await arrive(); if (S.oid !== my) return { abort: true };
  const told = ctx.board === 0 && ctx.j === 0 && (p.kind === 'fill' && ctx.step === 2 ? H.tell('split.fill2', FIRST.fill2, TELLS()) : H.tell('split.' + p.kind, FIRST[p.kind], TELLS())); if (told) tellLow();   /* 배가 다 들어온 뒤에 띄운다 — 느린 기기에서는 들어오는 동안 안내가 저절로 사라져 버렸다(2026-11-20) */
  if (ctx.surprise) { const pool = p.kind === 'join' ? [...ships.red.load, ...ships.blue.load] : p.kind === 'fill' ? (S.pile.length ? S.pile.slice(-p.b) : ships.red.load) : S.cargo, b = pick(pool); b.surprise = true; sparkle(b.o, true); S.log.push({ surprise: true }); }
  if (ctx.wave) S.waveAt = S.t + R.T.WAVE_AT[0] + Math.random() * (R.T.WAVE_AT[1] - R.T.WAVE_AT[0]); else S.waveAt = Infinity;
  if (S.ev.fog && S.step === 2 && p.kind !== 'fill') fogOn();   /* 10 모으기는 수 셋이 뜰 때 틀을 가린다 */
  if (p.kind === 'join' && S.step === 2) chooseShow('ware', R.picksFor(S.cell, p));
  S.active = true; S.busy = false; S.lastAct = S.t + (told ? T.TELL_GRACE : 0);   /* 한 줄 안내를 읽는 동안은 길잡이 손을 늦춘다 */
  const out = await new Promise(res => { S.done = res; }); S.active = false; S.done = null; chooseHide(); fogOff(); H.hide();
  const r = { ...S.res, clean: R.clean(S.res), out, p }; S.log.push({ problem: R.key(p), kind: p.kind, step: S.step, ...r, p: undefined }); return r; }
/** 해냈다: 띠가 닫히고 두 배가 나란히 떠난다(깜짝 짐은 깨끗할 때만 열림). */
async function complete(){ if (!S.active || S.closed) return; const my = S.oid; S.busy = true; S.closed = true; trayDraw(); const p = S.p, cleanNow = R.clean(S.res);
  [523, 659, 784].forEach((f, i) => tone(f * (1 + .06 * Math.min(S.streak, 3)), .12, 'triangle', .1, i * .07));
  if (cleanNow) { S.streak++; if (S.streak % R.T.STREAK === 0) { confetti(20); [784, 988, 1175, 1568].forEach((f, i) => tone(f, .18, 'triangle', .1, .25 + i * .09)); S.log.push({ horn: S.streak }); } } else S.streak = 0;
  const sb = [...S.cargo, ...ships.red.load, ...ships.blue.load, ...S.ware].find(b => b.surprise);
  if (sb) { if (cleanNow) { await sleep(300); sparkle(sb.o, false); confetti(12); tone(1319, .2, 'triangle', .1); wallet.earn(R.T.SURPRISE_COINS, 'split'); coinsDraw(true); S.surpriseCarry = false; S.log.push({ surpriseOpen: true }); } else S.surpriseCarry = true; }
  wallet.earn(R.T.COIN_PER, 'split'); coinsDraw(true); S.outSent.push(p.kind === 'fill' ? p.b : p.N);   /* 10 모으기는 아이가 보탠 짐만 */
  if (p.kind === 'join' || p.kind === 'fill') stage.play(S.keeper, 'Yes', true);
  await sleep(650); if (S.oid !== my) return; await leave(); if (S.oid !== my) return; S.done && S.done('sent'); }
/** 닻이 다 올랐다: 실린 만큼만 싣고 떠난다(표시 · 벌 없음) — 그 문제는 문제 둘 뒤에 다시. */
async function miss(){ if (!S.active || S.busy) return; S.busy = true; S.res.missed = true; S.streak = 0; chooseHide(); fogOff(); S.log.push({ missed: true });
  [880, 880, 880].forEach((f, i) => tone(f, .25, 'sine', .08, i * .35)); select(null);
  for (const b of dockLeft()) stage.tween(b.o.scale, { x: .01, y: .01, z: .01 }, 600); if (S.p.kind !== 'fill') for (const b of S.ware) stage.tween(b.o.scale, { x: .01, y: .01, z: .01 }, 600);   /* 10 모으기: 빈 칸이 남은 채 다음 문제 */
  await leave(); S.done && S.done('missed'); }

// ── 파도: 짐 하나가 굴러 물가로 → 눌러 잡는다(놓치면 물에 빠졌다가 떠올라 돌아옴 — 개수 그대로, 시간만 잃음)
function waveStart(){ const cand = loadable().filter(b => b !== S.sel && !(S.drag && S.drag.b === b)); if (!cand.length || !S.active) return; const b = pick(cand); S.wave = { b, t0: S.t, rolling: true }; S.log.push({ wave: 'roll' }); tone(180, .4, 'sine', .07, 0, 120); }
function catchWave(){ S.did = true; const w = S.wave; if (!w) return; w.rolling = false; S.log.push({ wave: 'caught' }); tone(740, .1, 'triangle', .08); w.b.o.rotation.x = 0; toDock(w.b, 260).then(() => { if (S.wave === w) S.wave = null; }); }
async function waveFall(){ const w = S.wave; w.rolling = false; S.log.push({ wave: 'fell' }); tone(200, .3, 'sine', .08, 0, 90); await stage.tween(w.b.o.position, { y: -.45, z: T.DZ + 1.6 }, 380); await sleep(1500); if (S.wave !== w || !S.active) return;
  w.b.o.rotation.x = 0; await stage.tween(w.b.o.position, { y: .05 }, 400); await toDock(w.b, 420); if (S.wave === w) S.wave = null; }

// ── 안개: 짐 더미(가르기) 또는 두 배의 짐(모으기)을 가린다 — 팻말의 수만 보인다. 고르면 걷힌다
function fogOn(){ S.fog = true; $('fog').classList.add('on'); if (S.p.kind === 'fill') { S.ware.forEach(b => { b.o.visible = false; }); wareGhostsDraw(); } else if (S.p.kind === 'join') for (const sh of Object.values(ships)) sh.load.forEach(b => { b.o.visible = false; }); else S.cargo.forEach(b => { b.o.visible = false; }); S.log.push({ fog: true }); }
function fogOff(){ if (!S.fog) return; S.fog = false; $('fog').classList.remove('on'); for (const sh of Object.values(ships)) sh.load.forEach(b => { b.o.visible = true; }); S.cargo.forEach(b => { b.o.visible = true; }); S.ware.forEach(b => { b.o.visible = true; }); wareGhostsDraw(); }
function fogPlace(){ const f = $('fog'); if (!S.p) return; let pts; if (S.p.kind === 'fill') pts = [warePos(0), warePos(4), warePos(9)].flatMap(v => [v.clone().add(V(-.45, 0, -.35)), v.clone().add(V(.45, .5, .35))]);
  else if (S.p.kind === 'join') pts = ['red', 'blue'].flatMap(s => [V(-1.3, .3, -.6), V(1.3, 1.1, .6)].map(v => ships[s].inner.localToWorld(v)));
  else { const n = S.p.N; pts = [dockPos(0, n), dockPos(Math.min(4, n - 1), n), dockPos(n - 1, n)].flatMap(v => [v.clone().add(V(-.45, 0, -.35)), v.clone().add(V(.45, .5, .35))]); }
  const q = pts.map(v => stage.screenOf(v)), x0 = Math.min(...q.map(v => v.x)) - 40, x1 = Math.max(...q.map(v => v.x)) + 40, y0 = Math.min(...q.map(v => v.y)) - 70, y1 = Math.max(...q.map(v => v.y)) + 45;
  Object.assign(f.style, { left: x0 + 'px', top: y0 + 'px', width: (x1 - x0) + 'px', height: (y1 - y0) + 'px' }); }

// ── 나들이(판 셋) · 판(문제 셋)
const TELLS = () => ({ times: M.passed(M.get(S.cell || '')) ? 2 : 1e9 });   /* 깃발을 따기 전에는 나들이 첫 문제마다 한 줄 안내(준호 2026-11-20) */
const FIRST = { split: '짐을 누르고 배를 눌러 실어 줘. 빨간 배는 팻말만큼!', join: '배에 실린 짐을 눌러 창고에 모아 줘.', fill: '빨간 배 짐을 내리고, 짐 더미로 열 칸을 꽉 채워 줘.', fill2: '빨간 배 짐을 내리고, 파란 배가 몇 개를 싣고 올지 골라 줘.', ways: '아까와 다르게 나눠 실어 봐.' };
async function outing(id){ const my = ++S.oid; S.gate = false; E.showBar(true); S.cell = id; S.kind = R.kindOf(id); S.streak = 0; S.outSent = []; S.back = false; S.surpriseCarry = false; const day = M.dayKey();
  let rec = M.get(id), q = R.deal(id, S.hist[id] || [], Math.random, { small: M.stuck(rec) >= 1 }); E.lanterns(0); S.log.push({ outing: id, deal: q.map(R.key) });
  for (let b = 0; b < R.T.BOARDS; b++) { rec = M.get(id); const hand = S.kind !== 'ways' && (!rec.hand || S.back);
    let ev = R.events(rec.evBoards, Math.random, { passed: M.passed(rec), calm: CALM, kind: S.kind, hand }); if (S.forceEv) { ev = { ...ev, ...S.forceEv }; S.forceEv = null; } if (S.surpriseCarry && !hand) ev.surprise = true;
    const waveJ = !ev.wave ? -1 : ev.waveJ != null ? ev.waveJ : Math.floor(Math.random() * 3), surpJ = !ev.surprise ? -1 : ev.surpJ != null ? ev.surpJ : Math.floor(Math.random() * 3); S.board = { b, hand, ev }; S.log.push({ board: b, hand, ev: Object.keys(ev).filter(k => ev[k] === true).join(' ') });
    const results = []; E.marbles(0);
    for (let j = 0; j < R.T.PER_BOARD; j++) { const i = b * R.T.PER_BOARD + j, r = await runProblem(q[i], { step: hand ? 1 : 2, ev, board: b, j, last: b === R.T.BOARDS - 1 && j === R.T.PER_BOARD - 1, wave: j === waveJ, surprise: j === surpJ });
      if (S.oid !== my || r.abort) return; results.push(r); E.marbles(j + 1); if (!r.clean) q = R.requeue(q, i); }
    const before = rec; rec = M.record(rec, results, day, { counts: !hand, hand, ev: !hand && !ev.none }); if (hand) S.back = false; else if (M.stuckNow(rec)) S.back = true; M.put(id, rec); S.log.push({ boardEnd: b, clean: M.clean(results), rec: { ...rec } });
    await E.fly($('marbles'), $('coins'), art('coin'), results.filter(r => r.out === 'sent').length); E.lanterns(b + 1); tone(660, .15, 'triangle', .1); tone(990, .2, 'triangle', .1, .12);
    if (!M.passed(before) && M.passed(rec)) { grew(art(ICON.flag) + ' 깃발을 땄어요!'); await sleep(2400); } else if (!M.kept(before) && M.kept(rec)) { grew(art(ICON.star) + ' 깃발에 별이 붙었어요!'); await sleep(2400); }
    if (S.oid !== my) return; await sleep(500); }
  S.hist[id] = q; S.p = null; signsDraw(); A.trayClear();
  const items = S.outSent.flatMap(n => Array(n).fill(art(ICON.cargo))); const choice = await E.home({ items }); if (S.oid !== my) return;
  if (choice === 'again') outing(id); else location.href = GO; }
/** 하네스 · 교사용: 지금 나들이를 거둔다. */
function abort(){ S.oid++; S.active = false; S.acting = 0; S.far = false; if (S.done) { const d = S.done; S.done = null; d('abort'); } stage.tweens.length = 0; clearAll(); for (const sh of Object.values(ships)) { sh.obj.position.y = 0; } layoutShips(true); S.busy = false; }

/** 고르는 화면으로(들머리는 /math/play/go/ 로 옮김 — T03). */
function gateShow(){ abort(); S.gate = true; location.href = GO; }

// ── 한 장면의 일
stage.frame((dt, t) => { S.t = t; if (!S.ready) return; signsDraw(); choosePlace(); tenDraw(t); if (S.fog) fogPlace();
  for (const sh of Object.values(ships)) { const urge = sh === anchorSh() && S.active && S.ev.anchor && S.step === 2 ? Math.max(0, S.clock - .6) / .4 : 0; sh.obj.position.y = Math.sin(t * (1.2 + urge * 5) + (sh.side === 'red' ? 0 : 1.7)) * (.04 + urge * .05); if (urge && !S.busy) sh.obj.rotation.z = Math.sin(t * 7) * .03 * urge; }   /* 닻이 거의 오르면 빨간 배가 떠나고 싶어 들썩인다 */
  for (const b of [...S.cargo, ...ships.red.load, ...ships.blue.load]) if (b.o.userData.sparkle) b.o.traverse(m => { if (m.isMesh) m.material.emissiveIntensity = .35 + Math.sin(t * 6) * .3; });
  const thinking = S.active && !S.busy && !S.acting && !S.gate;   /* 짐이 날아가는 동안은 시계도 쉰다 */
  /* 닻: 생각하는 동안에만 오른다 · 끝이 가까우면 종 */
  if (thinking && S.ev.anchor && S.step === 2 && !CALM) { S.clock = Math.min(1, S.clock + dt / R.anchorS(S.board ? S.board.b : 0, S.cell)); anchorSh().anchor.position.y = -T.ANCHOR_DROP * (1 - S.clock);
    if (S.clock > .78 && t - (S.bell || 0) > .3 + (1 - S.clock) * 2.2) { S.bell = t; tone(1046, .12, 'sine', .07); }
    if (S.clock >= 1) miss(); }
  /* 파도 */
  if (thinking && S.waveAt < t && !S.wave) { S.waveAt = Infinity; waveStart(); }
  const w = S.wave; if (w && w.rolling) { const k = (t - w.t0) / R.T.WAVE_S, home = dockPos(w.b.home, S.cargo.length); w.b.o.position.set(home.x + Math.sin(k * 9) * .08, T.DECK, home.z + (T.DZ + 1.05 - home.z) * Math.min(1, k)); w.b.o.rotation.x = k * 7; if (k >= 1 && S.active) waveFall(); }
  /* 길잡이 손: 가만히 있으면 다음에 누를 곳(뜨면 그 문제는 깨끗하지 않음) */
  const wait = R.T.HINT_AFTER * (M.stuck(M.get(S.cell || '')) >= 1 ? .5 : 1);
  if (thinking && t - S.lastAct > wait && !H.shown()) { const q = hintAt(); if (q) { H.show(q.x, q.y); S.res.hinted = true; S.log.push({ hinted: true }); } } });
function hintAt(){ const p = S.p; if (S.choose) { const ans = R.answerOf(p), b = $('choose').querySelector(`button[data-n="${ans}"]`); if (b) { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 10 }; } }
  if (p.kind === 'fill') { const b = ships.red.load[ships.red.load.length - 1] || S.pile[S.pile.length - 1]; return b ? stage.screenOf(b.o) : null; }
  if (p.kind === 'join') { const b = ships.red.load[0] || ships.blue.load[0]; return b ? stage.screenOf(b.o) : null; }
  if (S.sel || (S.fog && p.kind === 'split')) return stage.screenOf(ships[p.kind === 'split' && onBoat(ships.red) < p.a ? 'red' : 'blue'].obj.position.clone().add(V(0, .5, 0)));
  if (p.kind === 'ways' && !loadable().length) { const b = ships.red.load[ships.red.load.length - 1] || ships.blue.load[ships.blue.load.length - 1]; return b ? stage.screenOf(b.o) : null; }   /* 같은 방법: 실은 짐 하나를 옮기게 */
  const b = loadable()[0]; return b ? stage.screenOf(b.o) : null; }

window.__split = { S, R, M, E, T, stage, wallet, ships, outing, abort, gate: gateShow, act, onPick, check, boatUnder, tap,
  barrelAt: i => stage.screenOf(S.cargo[i].o), boatAt: side => stage.screenOf(ships[side].obj.position.clone().add(V(0, .45, 0))), boatTap: side => stage.screenOf(ships[side].inner.localToWorld(V(0, .3, 1.15))), wareAt: () => stage.screenOf(warePos(0)), pileAt: () => S.pile.length ? stage.screenOf(S.pile[S.pile.length - 1].o) : null, frameAt: k => stage.screenOf(warePos(k)),
  dock: () => S.cargo.map((b, i) => ({ i, where: b.where })).filter(x => x.where === 'dock').map(x => x.i), onBoat: side => onBoat(ships[side]) };
if (!GO_NOW) build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
