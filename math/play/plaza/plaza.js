/* 작은 광장 — 내 항구. 다리 길에서 데려온 주민이 걸어 다니고, 남은 나무(판자)가 더미로 쌓여 있다. 설계: 핸드오프 kedu/math-play-work/N02 2절.
 * 나무 더미 옆 판자 묶음(1·2·5장)을 끌어 지을 자리에 놓는다. 지을 자리 팻말의 수가 준다. 딱 채우면 지어진다(부서진 선착장 고치기 → 넓히기 → 통 창고 → …).
 * 넘치게 놓으면 남는 판자는 더미로 튀어 돌아간다(잃지 않는다). 지은 뒤 「나무가 몇 장 남았지?」 — 맞는 수를 누르면 더미 팻말이 그 수로 바뀐다.
 * 주민 하나가 다음에 지을 것에 드는 나무를 말풍선 그림으로 부탁한다. 시계 없음(쉬는 곳). 지도 조각 넷이면 먼 바다에 새 섬.
 * 무대 ../common/stage3d.js · 팻말·띠·끝의 셈 ../common/ask.js · 규칙 ./rules.js · 모형은 다리 길과 같은 꾸러미(../bridge/assets, Quaternius Pirate Kit CC0). */
import { createStage, THREE, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=1';
import * as R from './rules.js?v=2';
import { wallet, audio, tone, art } from '../common/kit.js?v=8';
import * as L from '../common/loop.js?v=2';
import * as H from '../common/hint.js?v=3';   /* 손 그림 길잡이(글 없음) */   /* N04 나루터: 배 셋 · 팻말(동전·생선·나무) · 주민 부탁 */

// ── 내가 정한 수치
const T = { RAFT_X: [-2.6, -1.3, .6], RAFT_Y: .2, RAFT_Z: 2.5, DECK: 1.0, PLANK_W: 1.3, PILE_MAX: 14, HOME_MAX: 6, WANDER: [3, 7], WALK: 1.2, PICK_PX: 80, DROP_PX: 150, PLANK_MS: 220, RISE_MS: 900,
  SPOT: { fix: [2, 0], dock: [4, 0], store: [-.3, -.82], stairs: [5.9, .2], pier: [1.0, -2.9], rowboat: [6.6, 2.0], wharf: [4.6, -2.9], hut: [-5.6, -1.2], tower: [-5.4, 1.9], light: [7.2, -2.6] },   // 지을 자리(x, z)
  PUT: { stairs: { ry: Math.PI / 2 }, pier: {}, rowboat: { float: -.12, ry: .5 }, wharf: {} },   // 더 지을 것 놓는 법(윗면을 선착장 높이에 · 배는 물에 띄움)
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
  for (const b of R.BUILDS) if (!M[b.model]) M[b.model] = await stage.load(b.model).catch(() => null);
  const have = new Set(Object.keys(M).filter(k => M[k])); S.have = have; dk = stage.dockKit(M.Environment_Dock);
  const put = stage.put, y0 = T.DECK - .49;
  // 내 섬과 선착장
  put(M.Environment_Cliff1, -6.6, 0, -2.8, 1.05, .4); put(M.Environment_PalmTree_1, -5.3, 1.9, -3.1, 1.0, .5); put(M.Environment_PalmTree_3, -7.6, 2.2, -1.2, .9, 2); put(M.Environment_Rock_2, -4.4, 0, 1.6, 1.3, .3); put(M.Environment_Rock_1, -5.2, 0, 2.8, 1.2); put(M.Environment_Rock_1, 6.8, 0, 2.6, 1.0, 1.2);
  put(M.Environment_Dock, -2, y0, 0); put(M.Environment_Dock, 0, y0, 0);
  S.boat = put(M.Ship_Small, 3.7, 0, 4.4, .45, 2.8);   /* 다리 길로 떠나는 배 */
  S.boatF = put(M.Ship_Small, -2.5, 0, 4.4, .45, .35); S.boatM = put(M.Ship_Small, .6, 0, 4.7, .45, 3.1); S.boatF.visible = S.boatM.visible = false;   /* 앞줄: 낚시 · 장터 · 다리 길 */   /* 낚시 섬 배 · 장터 배 */
  for (let i = 0; i < Math.min(4, BR.fish | 0); i++) put(M.Prop_Bucket_Fishes, -2.9 + i * .45, T.DECK, .9, .45, i);
  // 지은 것 · 부서진 선착장(아직 안 고쳤으면)
  for (const id of PL.built) showBuilt(id, false);
  if (!PL.built.includes('fix')) S.broken = put(M.Environment_Dock_Broken, T.SPOT.fix[0], y0, 0);
  if (PL.map >= 4) newIsland(false);
  // 나무 더미(판자) · 판자 묶음
  for (let i = 0; i < Math.min(BR.wood, T.PILE_MAX); i++) pileAdd();
  // 주민(데려온 수만큼, 여섯까지)
  for (let i = 0; i < Math.min(BR.saved, T.HOME_MAX); i++) { const p = stage.person([M.Characters_Anne, M.Characters_Henry][(i + 1) % 2], { tint: T.TINT[i % T.TINT.length] }); p.obj.position.set(-2.6 + (i % 3) * 1.1, standY(), i < 3 ? -.55 : .2); stage.face(p, 1); stage.play(p, 'Idle'); p.next = 1 + i; S.people.push(p); }
  S.signs = A.signs(5); S.signs.slice(2).forEach(e => e.classList.add('dock')); newBuild(); bundlesDraw(); mapDraw();
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
  else if (T.PUT[id]) { const P = T.PUT[id]; o = stage.put(M[R.BUILDS.find(b => b.id === id).model], x, 0, z, 1, P.ry || 0); const bb = new THREE.Box3().setFromObject(o); o.position.y += P.float != null ? P.float - bb.min.y : T.DECK - bb.max.y; }
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
  const blank = BR.saved === 0 && BR.wood === 0 && !(S.cur && S.cur.put);   /* 아무것도 없는 첫 화면에서는 팻말을 띄우지 않는다(배 하나와 손만) */
  if (S.cur && S.spot && !blank) A.signDraw(sp, stage.screenOf(new THREE.Vector3(S.spot.x, T.DECK + 1.5, S.spot.z)), S.cur.need - S.cur.put); else A.signDraw(sp, null);
  if (blank) A.signDraw(pl, null); else A.signDraw(pl, stage.screenOf(new THREE.Vector3(-2.55, T.DECK + 1.3 + Math.min(S.pile.length, T.PILE_MAX) / 2 * dk.plankH, -.15)), S.w0 > 0 || S.cur ? S.w0 : 0);
  /* 나루터 팻말: 장터 배 = 동전 · 낚시 배 = 생선 · 다리 길 배 = 나무 — 모자란 것이 깜빡인다(어디로 갈지) */
  const st = L.stock(), wt = L.wants(st, S.cur ? S.cur.need - S.cur.put : 0), at = (o, dy) => stage.screenOf(new THREE.Vector3(o.position.x, o.position.y + dy, o.position.z));
  /* 처음엔 다리 길 배 하나만. 장터 배는 화물 값이 필요해질 때(주민 둘) · 낚시 배는 장터를 해 본 뒤(또는 주민 셋)에 나타난다 — 한 번에 하나씩 */
  const SH = wallet.island('shop'), showM = st.people >= L.LOOP.CARGO_FROM || st.coins > 0, showF = showM && (st.people >= L.LOOP.CARGO_FROM + 1 || st.fish > 0 || st.tubs > 0 || ((SH.n5 && SH.n5.served) | 0) >= 3);
  for (const [o, on, key] of [[S.boatM, showM, 'M'], [S.boatF, showF, 'F']]) { if (!o) continue; if (on && !o.visible) { o.visible = true; if (!PL['seen' + key]) { PL['seen' + key] = 1; wallet.save(); o.scale.setScalar(.01);   /* 처음 나타날 때만 뿅 */ stage.tween(o.scale, { x: .45, y: .45, z: .45 }, 600); [523, 784, 1047].forEach((f, i) => tone(f, .14, 'triangle', .1, i * .08)); S.log.push({ boat: key }); } } else if (!on) o.visible = false; }
  [[S.signs[2], S.boatM, st.coins, 'coin', wt.coins, showM], [S.signs[3], S.boatF, st.fish, 'market.fish', wt.fish, showF], [S.signs[4], S.boat, st.wood, 'plaza.wood', wt.wood, st.people >= 1]].forEach(([e, o, n, icon, want, on]) => { if (!o || !on) { A.signDraw(e, null); return; } A.signDraw(e, at(o, 1.6), n, '', art(icon)); e.classList.toggle('want', !!want); });
  S.next = st.people < L.LOOP.CARGO_FROM ? S.boat : st.coins < 5 ? S.boatM : S.boat;   /* 손이 짚을 배: 처음 두 길은 다리 길 · 동전이 모자라면 장터 · 아니면 다리 길 */
  const rq = $('req'), q = L.todayRequest(), p2 = S.people[1] || null; if (q && p2 && !S.ask) { const pq = stage.screenOf(new THREE.Vector3(p2.obj.position.x, T.DECK + 1.75, p2.obj.position.z)); const wq = S.people[0] && S.cur ? stage.screenOf(new THREE.Vector3(S.people[0].obj.position.x, T.DECK + 1.75, S.people[0].obj.position.z)) : null; if (wq && Math.abs(wq.x - pq.x) < 95 && Math.abs(wq.y - pq.y) < 50) pq.x = wq.x + 95 < innerWidth - 45 ? wq.x + 95 : wq.x - 95; pq.x = Math.max(45, Math.min(innerWidth - 45, pq.x));   /* 겹치면 오른쪽 먼저, 화면 안으로 */   /* 두 말풍선이 겹치면 비킴 */
    rq.hidden = false; rq.style.left = pq.x + 'px'; rq.style.top = pq.y + 'px'; const v = `<span>${art('market.fish')}</span>${q.n}`; if (rq.dataset.v !== v) { rq.dataset.v = v; rq.innerHTML = v; } rq.classList.toggle('ready', st.fish >= q.n); } else rq.hidden = true;
  const ask = $('wish'), p = S.people[0]; if (p && S.cur && !S.ask && !blank) { const q = stage.screenOf(new THREE.Vector3(p.obj.position.x, T.DECK + 1.75, p.obj.position.z)); ask.hidden = false; ask.style.left = q.x + 'px'; ask.style.top = q.y + 'px'; ask.innerHTML = `<span>${art('plaza.wood')}</span>${S.cur.need}`; } else ask.hidden = true; }

// ── 손: 묶음 끌기 · 배 누르기(다리 길로)
const liftPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(T.DECK + .5)), hit = new THREE.Vector3();
canvas.addEventListener('pointerdown', e => { if (!S.ready || S.busy || S.ask) return; audio(); const ray = stage.pointerRay(e);
  if (ray.intersectObject(S.boat, true).length) { goBridge(); return; }
  if (S.boatF && S.boatF.visible && ray.intersectObject(S.boatF, true).length) { sail(S.boatF, '/math/play/fishing/'); return; } if (S.boatM && S.boatM.visible && ray.intersectObject(S.boatM, true).length) { sail(S.boatM, '/math/play/market/'); return; }
  const h = ray.intersectObjects(S.bundles.flatMap(b => b.planks), false)[0]; let b = h ? S.bundles.find(x => x.planks.includes(h.object)) : null;
  if (!b) { let best = 1e9; for (const x of S.bundles) { const q = stage.screenOf(x.group), d = Math.hypot(q.x - e.clientX, q.y - e.clientY); if (d < best) { best = d; b = x; } } if (best > T.PICK_PX) b = null; }
  if (!b) return; S.drag = { b, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); tone(520, .06, 'sine', .06); });
canvas.addEventListener('pointermove', e => { if (!S.drag || e.pointerId !== S.drag.id) return; const ray = stage.pointerRay(e); if (ray.ray.intersectPlane(liftPlane, hit)) S.drag.b.group.position.set(hit.x, T.DECK + .5, hit.z); });
const end = e => { if (!S.drag || e.pointerId !== S.drag.id) return; const b = S.drag.b; S.drag = null; const q = stage.screenOf(b.group), s = S.spot && stage.screenOf(S.spot);
  if (s && S.cur && Math.hypot(q.x - s.x, q.y - s.y) < T.DROP_PX) drop(b); else stage.tween(b.group, { 'position.x': b.home.x, 'position.y': b.home.y, 'position.z': b.home.z }, 380); };
canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
async function sail(b, href){ S.busy = true; S.log.push({ sail: href }); tone(660, .12, 'triangle', .1); stage.tween(b.position, { z: b.position.z + 4 }, 1100, t => t * t); await sleep(500); $('fade').style.opacity = 1; await sleep(600); location.href = href + location.search; }
/** 주민 부탁: 말풍선을 누르면 생선을 건넨다(모자라면 고개만 갸웃) → 그 주민이 다음 길에 짐(덤 뗏목)을 들고 따라온다 */
function giveReq(){ const p2 = S.people[1]; if (!p2 || S.busy) return; audio(); if (L.giveRequest()) { stage.play(p2, 'Yes', true); [660, 880, 1175].forEach((f, i) => tone(f, .12, 'triangle', .1, i * .07)); S.log.push({ req: 'given' }); } else { stage.play(p2, 'No', true); tone(240, .2, 'sine', .07); S.log.push({ req: 'short' }); } }
async function goBridge(){ S.busy = true; tone(660, .12, 'triangle', .1); stage.tween(S.boat.position, { x: S.boat.position.x - 6, z: S.boat.position.z + 3 }, 1100, t => t * t); await sleep(500); $('fade').style.opacity = 1; await sleep(600); location.href = '/math/play/bridge/' + location.search; }

// ── 화면 · 한 장면의 일
function resize(w, h){ const tall = h > w, asp = w / h, vfov = tall ? 50 : 40, half = Math.atan(Math.tan(vfov * Math.PI / 360) * asp), dist = Math.max(10, (tall ? 4.6 : 6.6) / Math.tan(half)); camera.fov = vfov;
  /* 세로 화면: 배 셋·선착장이 화면 폭에 들어오는 거리로 더 내려다보고, 앞줄 배가 화면 아래쪽(86%)에 오게 그림을 옮긴다 */
  S.cam = tall ? { y: 1 + dist * .78, z: 2 + dist * .62 } : { y: 1 + dist * .5, z: 1 + dist * .9 }; camera.clearViewOffset(); camera.aspect = asp; camera.position.set(.6, S.cam.y, S.cam.z); camera.lookAt(.6, .6, .4); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  if (tall) { const p = new THREE.Vector3(.6, 0, 4.6).project(camera), dy = h * .86 - (1 - p.y) / 2 * h; camera.setViewOffset(w, h, 0, -dy, w, h); } }
stage.frame((dt, t) => { S.t = t; if (!S.cam) return; camera.position.set(.6, S.cam.y, S.cam.z); camera.lookAt(.6, .6, .4); stage.sun.position.set(-7, 11, 8); stage.sun.target.position.set(.6, 0, 0);
  if (S.boat) { S.boat.position.y = Math.sin(t * 1.3) * .05; S.boat.rotation.z = Math.sin(t * .9) * .03; }
  for (const b of S.bundles) if ((!S.drag || S.drag.b !== b) && !stage.tweens.some(w => w.o === b.group)) { b.group.position.y = b.home.y + Math.sin(t * 1.6 + b.ph) * .05; b.group.rotation.z = Math.sin(t * 1.1 + b.ph) * .03; }
  // 주민이 선착장 위를 거닌다(놀이가 아니라 살아 있는 느낌)
  for (const p of S.people) if (!S.busy && !S.ask && t > p.next && !stage.tweens.some(w => w.o === p.obj)) { p.next = t + T.WANDER[0] + Math.random() * (T.WANDER[1] - T.WANDER[0]); const x = -2.8 + Math.random() * (PL.built.includes('dock') ? 6 : PL.built.includes('fix') ? 4 : 3.4); stage.go(p, x, T.WALK).then(() => stage.play(p, Math.random() < .3 ? 'Wave' : 'Idle')); }
  if (S.ready) { signsDraw(); guide(); } });
/** 손 길잡이: 가만히 있으면(4초) — 나무 묶음이 있고 아직 처음 짓는 중이면 묶음에서 지을 자리로, 아니면 갈 배를 짚는다. 주민 다섯부터는 안 띄운다 */
function guide(){ if (!S.told && S.t > .8) { S.told = true; const got = L.boatCatch(); if (got) { H.tell('boatfish', `주민이 작은 배로 물고기 ${got}마리를 잡아 왔어요!`, { times: 9999 }); S.log.push({ boatCatch: got }); [523, 784].forEach((f, i) => tone(f, .14, 'triangle', .1, i * .1)); return; } const st = L.stock(); if (st.people === 0 && st.wood === 0) H.tell('plaza', '배를 타고 친구를 데리러 가요!'); else if (S.bundles.length && S.cur && !PL.built.length) H.tell('build', '나무를 끌어다 선착장을 고쳐요!'); else if (S.boatF && S.boatF.visible && st.fish < 1) H.tell('gofish', '물고기를 잡아 장터에 팔아요!'); else if (S.boatM && S.boatM.visible && st.coins < 5) H.tell('gomarket', '장터에서 동전을 벌어 와요!'); }
  if (S.busy || S.ask || S.drag || BR.saved >= 5 || !H.idle(4000)) { if (S.drag || S.busy) H.hide(); return; }
  const first = S.bundles.length && S.cur && S.spot && !PL.built.length; if (first) { const b = S.bundles.find(x => x.n <= S.cur.need - S.cur.put) || S.bundles[0], a = stage.screenOf(b.group), z = stage.screenOf(S.spot), k = (S.t % 3) / 3; H.show(k < .5 ? a.x : z.x, (k < .5 ? a.y : z.y) + 10); return; }
  const o = S.next; if (o && o.visible) { const q = stage.screenOf(o); H.show(q.x, q.y + 26); } }
window.__plaza.screenOf = stage.screenOf; window.__plaza.H = H; window.__plaza.L = L; window.__plaza.giveReq = giveReq;
$('req').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); giveReq(); });
build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
