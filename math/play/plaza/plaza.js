/* 작은 광장 — 내 항구. 다리 길에서 데려온 주민이 걸어 다니고, 남은 나무(판자)가 더미로 쌓여 있다. 설계: 핸드오프 kedu/math-play-work/N02 2절.
 * 나무 더미 옆 판자 묶음(1·2·5장)을 끌어 지을 자리에 놓는다. 지을 자리 팻말의 수가 준다. 딱 채우면 지어진다(부서진 선착장 고치기 → 넓히기 → 통 창고 → …).
 * 넘치게 놓으면 남는 판자는 더미로 튀어 돌아간다(잃지 않는다). 지은 뒤 「나무가 몇 장 남았지?」 — 맞는 수를 누르면 더미 팻말이 그 수로 바뀐다.
 * 주민 하나가 다음에 지을 것에 드는 나무를 말풍선 그림으로 부탁한다. 시계 없음(쉬는 곳). 지도 조각 넷이면 먼 바다에 새 섬.
 * 무대 ../common/stage3d.js · 팻말·띠·끝의 셈 ../common/ask.js · 규칙 ./rules.js · 모형은 다리 길과 같은 꾸러미(../bridge/assets, Quaternius Pirate Kit CC0). */
import { createStage, THREE, sleep } from '../common/stage3d.js?v=1';
import * as A from '../common/ask.js?v=1';
import * as R from './rules.js?v=1';
import { wallet, audio, tone, art } from '../common/kit.js?v=5';

// ── 내가 정한 수치
const T = { RAFT_X: [-2.6, -1.3, .6], RAFT_Y: .2, RAFT_Z: 2.5, DECK: 1.0, PLANK_W: 1.3, PILE_MAX: 14, HOME_MAX: 6, WANDER: [3, 7], WALK: 1.2, PICK_PX: 80, DROP_PX: 150, PLANK_MS: 220, RISE_MS: 900,
  SPOT: { fix: [2, 0], dock: [4, 0], store: [-.3, -.82], hut: [-5.6, -1.2], tower: [-5.4, 1.9], light: [7.2, -2.6] },   // 지을 자리(x, z)
  TINT: ['#ffd49a', '#a9dcff', '#c8f2ae', '#ffb9cf', '#dcc6ff', '#fff0a0'] };
const $ = id => document.getElementById(id), canvas = $('c');
const stage = createStage({ canvas, seaX: 0, seaW: 120, assets: '../bridge/assets/' }), { scene, camera } = stage;
const BR = wallet.island('bridge'), PL = wallet.island('plaza'); BR.wood = Math.max(0, BR.wood | 0); BR.saved = Math.max(0, BR.saved | 0); PL.built = Array.isArray(PL.built) ? PL.built : []; PL.map = Math.max(0, PL.map | 0);
const S = { ready: false, busy: true, drag: null, people: [], pile: [], bundles: [], spot: null, cur: null, w0: 0, placed: [], built: {}, ask: null, log: [], tweens: stage.tweens, t: 0 };
window.__plaza = { S, R, T, BR, PL, stage };

let dk, M = {};
async function build(){
  const need = ['Environment_Dock', 'Environment_Dock_Broken', 'Environment_Dock_Pole', 'Characters_Anne', 'Characters_Henry', 'Environment_Cliff1', 'Environment_Cliff2', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_2', 'Prop_Barrel', 'Prop_Bucket_Fishes', 'Ship_Small'];
  const got = await Promise.all(need.map(n => stage.load(n))); need.forEach((n, i) => { M[n] = got[i]; });
  for (const b of R.BUILDS) if (b.opt && !M[b.model]) M[b.model] = await stage.load(b.model).catch(() => null);
  const have = new Set(Object.keys(M).filter(k => M[k])); S.have = have; dk = stage.dockKit(M.Environment_Dock);
  const put = stage.put, y0 = T.DECK - .49;
  // 내 섬과 선착장
  put(M.Environment_Cliff1, -6.6, 0, -2.8, 1.05, .4); put(M.Environment_PalmTree_1, -5.3, 1.9, -3.1, 1.0, .5); put(M.Environment_PalmTree_3, -7.6, 2.2, -1.2, .9, 2); put(M.Environment_Rock_2, -4.4, 0, 1.6, 1.3, .3); put(M.Environment_Rock_1, -5.2, 0, 2.8, 1.2); put(M.Environment_Rock_1, 6.8, 0, 2.6, 1.0, 1.2);
  put(M.Environment_Dock, -2, y0, 0); put(M.Environment_Dock, 0, y0, 0);
  S.boat = put(M.Ship_Small, 6.4, 0, 2.4, .55, 2.6);   /* 다리 길로 떠나는 배 */
  for (let i = 0; i < Math.min(4, BR.fish | 0); i++) put(M.Prop_Bucket_Fishes, -2.9 + i * .45, T.DECK, .9, .45, i);
  // 지은 것 · 부서진 선착장(아직 안 고쳤으면)
  for (const id of PL.built) showBuilt(id, false);
  if (!PL.built.includes('fix')) S.broken = put(M.Environment_Dock_Broken, T.SPOT.fix[0], y0, 0);
  if (PL.map >= 4) newIsland(false);
  // 나무 더미(판자) · 판자 묶음
  for (let i = 0; i < Math.min(BR.wood, T.PILE_MAX); i++) pileAdd();
  // 주민(데려온 수만큼, 여섯까지)
  for (let i = 0; i < Math.min(BR.saved, T.HOME_MAX); i++) { const p = stage.person([M.Characters_Anne, M.Characters_Henry][(i + 1) % 2], { tint: T.TINT[i % T.TINT.length] }); p.obj.position.set(-2.6 + (i % 3) * 1.1, standY(), i < 3 ? -.55 : .2); stage.face(p, 1); stage.play(p, 'Idle'); p.next = 1 + i; S.people.push(p); }
  S.signs = A.signs(2); newBuild(); bundlesDraw(); mapDraw();
  stage.onResize = resize; stage.resize(); $('loading').style.opacity = 0; setTimeout(() => $('loading').hidden = true, 500); S.ready = true; S.busy = false;
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 처음으로 돌아가요'; document.body.appendChild(n); } }
const standY = () => T.DECK + .18 * .62;

// ── 판자
const plankMesh = (i = 0) => { const m = new THREE.Mesh(dk.planks[i % dk.planks.length], dk.mat); m.scale.x = T.PLANK_W; m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
const pileSpot = i => new THREE.Vector3(-2.55 + (i % 2) * .09, T.DECK + dk.plankH * (Math.floor(i / 2) + .5), i % 2 ? .1 : -.42);
function pileAdd(){ const m = plankMesh(S.pile.length); m.rotation.y = Math.PI / 2; m.scale.set(T.PLANK_W, 1, .5); m.position.copy(pileSpot(S.pile.length)); S.pile.push(m); return m; }
function pileSync(){ while (S.pile.length > Math.min(BR.wood, T.PILE_MAX)) scene.remove(S.pile.pop()); while (S.pile.length < Math.min(BR.wood, T.PILE_MAX)) pileAdd(); }
/** 판자 묶음(1·2·5장): 더미 앞 선착장 끝에 나란히. 더미에 그만큼 없으면 그 묶음은 없다. */
function bundlesDraw(){ for (const b of S.bundles) scene.remove(b.group); S.bundles = []; const can = R.bundles(BR.wood); if (!S.cur) return;
  R.BUNDLES.forEach((n, j) => { if (!can.includes(n)) return; const g = new THREE.Group(), home = new THREE.Vector3(T.RAFT_X[j], T.RAFT_Y, T.RAFT_Z); g.position.copy(home); scene.add(g); const b = { n, group: g, home, planks: [], ph: j * 1.7 };
    for (let k = 0; k < n; k++) { const m = plankMesh(k + j); scene.remove(m); m.scale.z = .62; m.position.set((k - (n - 1) / 2) * .4, 0, 0); g.add(m); b.planks.push(m); } S.bundles.push(b); }); }   /* 다리 길 뗏목처럼 판자를 나란히(세어진다) */

// ── 지을 것
function newBuild(){ const b = R.next(PL.built, S.have); if (!b) { S.cur = null; return; }
  if (!PL.cur || PL.cur.id !== b.id) PL.cur = { id: b.id, need: R.needFor(b), put: 0 }; S.cur = PL.cur; S.w0 = BR.wood + S.cur.put; const [x, z] = T.SPOT[b.id]; S.spot = new THREE.Vector3(x, T.DECK, z);
  for (const m of S.placed) scene.remove(m); S.placed = []; for (let i = 0; i < S.cur.put; i++) S.placed.push(placedPlank(i));
  if (S.poles) S.poles.forEach(p => scene.remove(p)); S.poles = b.id === 'fix' ? [] : [[-.9, -.9], [.9, -.9], [-.9, .9], [.9, .9]].map(([dx, dz]) => stage.put(M.Environment_Dock_Pole, x + dx, .62, z + dz, .55));
  wallet.save(); A.trayClear(); }
function placedPlank(i){ const m = plankMesh(i); m.rotation.y = Math.PI / 2 * (Math.floor(i / 3) % 2); m.scale.set(T.PLANK_W, 1, .55); m.position.set(S.spot.x + (i % 3 - 1) * .45, T.DECK + .08 + Math.floor(i / 3) * dk.plankH, S.spot.z); return m; }
/** 지어졌다: 모형이 솟는다. */
function showBuilt(id, rise = true){ const [x, z] = T.SPOT[id], y0 = T.DECK - .49; let o;
  if (id === 'fix' || id === 'dock') o = stage.put(M.Environment_Dock, x, y0, z);
  else if (id === 'store') { o = new THREE.Group(); [[0, 0, 0], [.72, 0, 0], [.36, .62, 0]].forEach(([dx, dy]) => { const c = M.Prop_Barrel.scene.clone(); c.scale.setScalar(.7); c.position.set(dx - .36, dy, 0); o.add(c); }); o.position.set(x, T.DECK, z); scene.add(stage.shadows(o)); }
  else o = stage.put(M[R.BUILDS.find(b => b.id === id).model], x, id === 'light' ? 0 : 1.9, z, .6, .4);
  S.built[id] = o; if (rise) { const y = o.position.y; o.position.y = y - 3; stage.tween(o.position, { y }, T.RISE_MS, t => 1 - (1 - t) ** 3); } return o; }
function newIsland(rise = true){ const g = new THREE.Group(); [[M.Environment_Cliff2, 0, 0, 0, 1], [M.Environment_PalmTree_1, -1.5, 3.2, -.5, 1.1], [M.Environment_PalmTree_3, 1.8, 2.8, .4, 1]].forEach(([m, x, y, z, s]) => { const c = m.scene.clone(); c.position.set(x, y, z); c.scale.setScalar(s); g.add(c); }); g.position.set(12, rise ? -8 : 0, -20); scene.add(g); S.island = g; if (rise) stage.tween(g.position, { y: 0 }, 1800); }

// ── 판자 묶음을 지을 자리에 놓았다
async function drop(b){ S.busy = true; audio(); const left = S.cur.need - S.cur.put, out = R.place(left, b.n); S.log.push({ drop: b.n, put: out.put, back: out.back, left: out.left });
  const wp = new THREE.Vector3(); for (let k = 0; k < b.planks.length; k++) { const m = b.planks[k]; m.getWorldPosition(wp); b.group.remove(m); scene.add(m); m.position.copy(wp);
    if (k < out.put) { const i = S.cur.put; S.cur.put++; BR.wood--; const to = placedPlank(i); scene.remove(to); await stage.tween(m, { 'position.x': to.position.x, 'position.y': to.position.y, 'position.z': to.position.z, 'rotation.y': to.rotation.y, 'scale.z': .55 }, T.PLANK_MS); S.placed.push(m); tone(320 + i * 30, .08, 'triangle', .09); }
    else { await stage.tween(m, { 'position.y': T.DECK + 1.2 }, 160); await stage.tween(m, { 'position.x': -2.55, 'position.y': T.DECK + .5, 'position.z': -.2 }, 360); scene.remove(m); tone(250, .1, 'sine', .07); } }
  scene.remove(b.group); wallet.save(); pileSync(); bundlesDraw();
  if (!out.done) { S.busy = false; return out; }
  // 다 찼다 — 지어진다, 주민들이 달려와 손을 흔든다
  for (const m of S.placed) stage.tween(m.position, { y: m.position.y - .3 }, 300).then(() => scene.remove(m)); S.placed = [];
  if (S.cur.id === 'fix' && S.broken) { stage.tween(S.broken.position, { y: -3 }, 600).then(() => scene.remove(S.broken)); S.broken = null; }
  if (S.poles) { S.poles.forEach(p => scene.remove(p)); S.poles = []; }
  await sleep(250); showBuilt(S.cur.id); [523, 659, 784, 1047].forEach((f, i) => tone(f, .18, 'triangle', .12, i * .09));
  S.people.forEach((p, i) => setTimeout(() => stage.go(p, S.spot.x - .9 - (i % 3) * .5, 3.6, true).then(() => { stage.face(p, 1); stage.play(p, 'Wave'); }), i * 120));
  await sleep(T.RISE_MS + 200);
  // 끝의 셈: 나무가 몇 장 남았지?
  A.trayAdd(S.w0, '', '나무'); A.trayAdd(S.cur.need, '−', '쓴'); S.ask = A.ask({ sum: R.leftover(S.w0, S.cur.need), onPick: (n, right) => { audio(); S.log.push({ pick: n, right }); }, onWrong: () => tone(240, .25, 'sine', .08) });
  await S.ask.promise; S.ask = null; S.log.push({ built: S.cur.id });
  PL.built.push(S.cur.id); PL.cur = null; wallet.save(); S.w0 = BR.wood; tone(880, .12, 'triangle', .1); await sleep(900);
  S.people.forEach(p => stage.play(p, 'Idle')); newBuild(); bundlesDraw(); S.busy = false; return out; }

// ── 지도 조각(다리 길의 통에서): 넷이면 먼 바다에 새 섬
function mapDraw(){ const box = $('map'); box.hidden = !PL.map; box.innerHTML = Array.from({ length: 4 }, (_, i) => `<u class="${i < PL.map ? 'on' : ''}"></u>`).join(''); }

// ── 팻말: 지을 자리(드는 나무 남은 수) · 나무 더미(장 수) · 주민의 부탁 말풍선
function signsDraw(){ if (!S.signs) return; const [sp, pl] = S.signs;
  if (S.cur && S.spot) A.signDraw(sp, stage.screenOf(new THREE.Vector3(S.spot.x, T.DECK + 1.5, S.spot.z)), S.cur.need - S.cur.put); else A.signDraw(sp, null);
  A.signDraw(pl, stage.screenOf(new THREE.Vector3(-2.55, T.DECK + 1.3 + Math.min(S.pile.length, T.PILE_MAX) / 2 * dk.plankH, -.15)), S.w0 > 0 || S.cur ? S.w0 : 0);
  const ask = $('wish'), p = S.people[0]; if (p && S.cur && !S.ask) { const q = stage.screenOf(new THREE.Vector3(p.obj.position.x, T.DECK + 1.75, p.obj.position.z)); ask.hidden = false; ask.style.left = q.x + 'px'; ask.style.top = q.y + 'px'; ask.innerHTML = `<span>${art('plaza.wood')}</span>${S.cur.need}`; } else ask.hidden = true; }

// ── 손: 묶음 끌기 · 배 누르기(다리 길로)
const liftPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(T.DECK + .5)), hit = new THREE.Vector3();
canvas.addEventListener('pointerdown', e => { if (!S.ready || S.busy || S.ask) return; audio(); const ray = stage.pointerRay(e);
  if (ray.intersectObject(S.boat, true).length) { goBridge(); return; }
  const h = ray.intersectObjects(S.bundles.flatMap(b => b.planks), false)[0]; let b = h ? S.bundles.find(x => x.planks.includes(h.object)) : null;
  if (!b) { let best = 1e9; for (const x of S.bundles) { const q = stage.screenOf(x.group), d = Math.hypot(q.x - e.clientX, q.y - e.clientY); if (d < best) { best = d; b = x; } } if (best > T.PICK_PX) b = null; }
  if (!b) return; S.drag = { b, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); tone(520, .06, 'sine', .06); });
canvas.addEventListener('pointermove', e => { if (!S.drag || e.pointerId !== S.drag.id) return; const ray = stage.pointerRay(e); if (ray.ray.intersectPlane(liftPlane, hit)) S.drag.b.group.position.set(hit.x, T.DECK + .5, hit.z); });
const end = e => { if (!S.drag || e.pointerId !== S.drag.id) return; const b = S.drag.b; S.drag = null; const q = stage.screenOf(b.group), s = S.spot && stage.screenOf(S.spot);
  if (s && S.cur && Math.hypot(q.x - s.x, q.y - s.y) < T.DROP_PX) drop(b); else stage.tween(b.group, { 'position.x': b.home.x, 'position.y': b.home.y, 'position.z': b.home.z }, 380); };
canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
async function goBridge(){ S.busy = true; tone(660, .12, 'triangle', .1); stage.tween(S.boat.position, { x: S.boat.position.x - 6, z: S.boat.position.z + 3 }, 1100, t => t * t); await sleep(500); $('fade').style.opacity = 1; await sleep(600); location.href = '/math/play/bridge/' + location.search; }

// ── 화면 · 한 장면의 일
function resize(w, h){ const tall = h > w, asp = w / h, vfov = tall ? 50 : 40, half = Math.atan(Math.tan(vfov * Math.PI / 360) * asp), dist = Math.max(10, 6.6 / Math.tan(half)); camera.fov = vfov; S.cam = { y: 1 + dist * (tall ? .45 : .5), z: 1 + dist * .9 }; }
stage.frame((dt, t) => { S.t = t; if (!S.cam) return; camera.position.set(.6, S.cam.y, S.cam.z); camera.lookAt(.6, .6, .4); stage.sun.position.set(-7, 11, 8); stage.sun.target.position.set(.6, 0, 0);
  if (S.boat) { S.boat.position.y = Math.sin(t * 1.3) * .05; S.boat.rotation.z = Math.sin(t * .9) * .03; }
  for (const b of S.bundles) if ((!S.drag || S.drag.b !== b) && !stage.tweens.some(w => w.o === b.group)) { b.group.position.y = b.home.y + Math.sin(t * 1.6 + b.ph) * .05; b.group.rotation.z = Math.sin(t * 1.1 + b.ph) * .03; }
  // 주민이 선착장 위를 거닌다(놀이가 아니라 살아 있는 느낌)
  for (const p of S.people) if (!S.busy && !S.ask && t > p.next && !stage.tweens.some(w => w.o === p.obj)) { p.next = t + T.WANDER[0] + Math.random() * (T.WANDER[1] - T.WANDER[0]); const x = -2.8 + Math.random() * (PL.built.includes('dock') ? 6 : PL.built.includes('fix') ? 4 : 3.4); stage.go(p, x, T.WALK).then(() => stage.play(p, Math.random() < .3 ? 'Wave' : 'Idle')); }
  if (S.ready) signsDraw(); });
window.__plaza.screenOf = stage.screenOf;
build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
