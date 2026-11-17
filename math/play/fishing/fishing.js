/* 낚시 섬(3D, N03) — 해가 지기 전에 통 셋을 딱 채워 배에 싣는다. 설계: 핸드오프 kedu/math-play-work/N03_낚시섬.md · 기준 N00.
 * 물고기 등에 수(작은 수는 점, 큰 수는 숫자)가 떠 있고, 통 팻말에 남은 칸 수가 있다. 물고기를 누르면 줄이 날아가 끌어올려 지금 통에 넣는다.
 * 딱 맞으면 띠의 식이 「= 6」으로 닫히고 통이 배에 실린다 · 넘치면 통이 기우뚱, 물고기가 도로 뛰어든다(통은 그대로) · 모자라면 팻말의 수가 줄 뿐.
 * 셋을 다 실으면 「오늘 낚은 물고기는 모두 몇 마리?」 6 + 9 + 7 = ? — 아닌 수는 물러나기만, 맞는 수를 누르면 배가 장터로 떠난다.
 * 섞는 것(./rules.js 표): 해넘이(늘, 생각하는 동안에만 해가 진다) · 도둑 배(갈매기 자리 — 갈매기 모형이 없어 Pirate Kit 작은 배로, 눌러 쫓음) ·
 *   빠른 떼 · 황금 물고기(남은 만큼 딱) · 복어(+1 부풂) · 게(모형이 오면) · 큰 물고기(세 번 당김) · 불꽃(넘침 없이 연달아 닫으면 줄이 빨라지고 음이 오름).
 * 늦으면(해가 지면) 다 찬 통만 싣고 떠난다 — 표시·벌 없이 새 판. 다 실은 판 수로만 걸음이 오른다.
 * 그림은 기성 3D 재료만(Quaternius Pirate Kit, CC0 — ../bridge/assets). 물고기는 고른 꾸러미가 오기 전까지 「물고기 양동이」 모형의 물고기 조각을 떼어 쓴다. */
import { createStage, THREE, LOOK, CALM, sleep } from '../common/stage3d.js?v=1';
import * as A from '../common/ask.js?v=1';
import * as R from './rules.js?v=1';
import { wallet, audio, tone } from '../common/kit.js?v=5';
import * as L from '../common/loop.js?v=1';   /* N04: 실은 통의 물고기는 장터 생선 진열대로 */

// ── 내가 정한 수치(준호가 보고 바꾼다)
const T = { DECK: .45, TUB_X: [-2.7, -1.65, -.6], TUB_Z: 1.9, TUB_S: 1.3, BOAT: [2.35, 0, 1.25], BOAT_S: .48, ANNE: [.55, 1.7],
  SEA: { x: [-5.5, 5.5], z: [-5.8, -2.1] }, FISH_S: 1.35, IN_TUB_S: .58, SPEED: [.55, 1.05], FLY_MS: 650, PICK_PX: 75,
  DUSK: { SUNSET: ['#f08a5d', '#f6b98b', '#ffe0b0'], NIGHT: ['#283057', '#6a4f7d', '#c9806c'], SEA_DUSK: 0x1e5c86 },
  BEAT: .72, SCATTER: 1.8, THIEF_SPEED: .9, LINE_FAST: .1 };
const $ = id => document.getElementById(id);
const SAVE = wallet.island('fishing'); SAVE.trips = Math.max(0, SAVE.trips | 0); SAVE.tubs = Math.max(0, SAVE.tubs | 0);
const S = { ready: false, busy: true, intro: false, missing: false, trip: null, ti: 0, left: 0, fill: [[], [], []], loaded: [], fish: [], tubs: [], tubFish: [[], [], []], clock: 0, streak: 0, overInTub: false, log: [], ask: null, thief: null, thiefIn: 0, schoolIn: 0, t: 0, beat: 0, scatter: 0, signs: [], id: 0 };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [16, 60], shadow: { left: -8, right: 8, top: 6, bottom: -6 }, assets: '../bridge/assets/' }), { scene, camera, sea, sun, hemi } = stage;
const K = {};
const NAMES = ['Environment_Dock', 'Prop_Bucket_Fishes', 'Ship_Small', 'Characters_Anne', 'Environment_Cliff1', 'Environment_Cliff4', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_4', 'Environment_Dock_Pole'];
const OPT = ['Characters_Crab'];   /* 있으면 쓰는 모형(게) — 없으면 게 사건은 건너뜀 */

// ── 모형 조각: 물고기 양동이 → 빈 통 + 물고기 넷(몸통과 가까운 지느러미를 한 마리로)
function bucketKit(g){ let mesh = null; g.scene.traverse(m => { if (m.isMesh && !mesh) mesh = m; }); const ps = stage.pieces(mesh), bodies = ps.filter(p => p.tris > 300);
  const owner = new Map(); for (const p of ps) { if (bodies.includes(p)) continue; const m = Math.max(p.size.x, p.size.y, p.size.z); if (m > .32 || p.tris > 200) continue; let best = null, d0 = .34; for (const b of bodies) { const d = p.center.distanceTo(b.center); if (d < d0) { d0 = d; best = b; } } if (best) owner.set(p, best); }
  const fishOf = bodies.map(b => [b, ...ps.filter(p => owner.get(p) === b)]), inFish = new Set(fishOf.flat());
  const uvx = p => { const uv = p.geo.attributes.uv; let u = 0; for (let k = 0; k < uv.count; k++) u += uv.getX(k); return u / uv.count; };   /* 아틀라스 자리: 통(나무·쇠)은 왼쪽, 물고기는 오른쪽 */
  const tub = new THREE.Group(); for (const p of ps) if (!inFish.has(p) && uvx(p) < .3) tub.add(stage.shadows(new THREE.Mesh(p.geo, mesh.material)));
  const fish = fishOf.map(parts => { const b = parts[0], inner = new THREE.Group(); for (const p of parts) { const geo = p.geo.clone(); geo.translate(-b.center.x, -b.center.y, -b.center.z); inner.add(new THREE.Mesh(geo, mesh.material)); }
    const sz = b.size; if (sz.z >= sz.x) inner.rotation.y = Math.PI / 2; const w = new THREE.Group(); w.add(inner); w.userData.len = Math.max(sz.x, sz.z); return w; });
  return { tub, fish, mat: mesh.material }; }
let KIT = null;
const tint = (o, color, glow = 0) => { o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.set(color); if (glow) { m.material.emissive = new THREE.Color(color); m.material.emissiveIntensity = glow; } } }); return o; };

// ── 무대 꾸리기
async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); })); await Promise.all(OPT.map(async n => { try { K[n] = await stage.load(n); } catch (_) { K[n] = null; } }));
  KIT = bucketKit(K.Prop_Bucket_Fishes); const dk = stage.dockKit(K.Environment_Dock), step = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36;
  // 선착장(판자 조각) · 기둥
  let i = 0; for (let x = -7.5; x <= 3.4; x += step, i++) { const m = new THREE.Mesh(dk.planks[i % dk.planks.length], dk.mat); m.position.set(x, T.DECK - dk.plankH / 2, T.TUB_Z); scene.add(stage.shadows(m)); }
  for (let x = -7; x <= 3.1; x += 2.5) for (const z of [T.TUB_Z - 1.15, T.TUB_Z + 1.2]) stage.put(K.Environment_Dock_Pole, x, T.DECK - .8, z, 1, x);
  stage.put(K.Environment_Cliff1, -11, 0, -4, 1.1, .5); stage.put(K.Environment_Cliff4, 12, 0, -9, 1.0, -.6); stage.put(K.Environment_PalmTree_3, -9.2, 1.4, -3.4, 1.0, .3); stage.put(K.Environment_PalmTree_1, 10.5, 1.0, -6.5, 1.0, 2); stage.put(K.Environment_Rock_4, 6.5, -.2, -8.5, 1.2, 1); stage.put(K.Environment_Rock_1, -6, -.2, -7.8, 1.1);
  S.boat = stage.put(K.Ship_Small, T.BOAT[0], T.BOAT[1], T.BOAT[2], T.BOAT_S, Math.PI / 2);
  S.anne = stage.person(K.Characters_Anne); S.anne.obj.position.set(T.ANNE[0], T.DECK + .02, T.ANNE[1]); S.anne.obj.rotation.y = Math.PI; stage.play(S.anne, 'Idle');
  stage.onResize = aim; stage.resize();
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 처음으로 돌아가요'; document.body.appendChild(n); }
  S.signs = A.signs(3 + 18); S.signs.forEach((e, k) => { if (k >= 3) e.classList.add('fs'); });
  newTrip(); $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true; intro(); }

// ── 카메라: 선착장(통 셋·배)이 화면 폭에 들어오고, 위로 앞바다가 보이게
function aim(w, h){ const tall = h > w, asp = w / h; S.fk = tall ? 1.45 : 1;   /* 세로 화면은 물고기를 크게 */ camera.fov = tall ? 50 : 42; const half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * asp), dist = Math.max(7.5, (tall ? 3.6 : 4.4) / Math.tan(half));
  camera.position.set(-.2, dist * (tall ? .72 : .56), T.TUB_Z + dist * (tall ? .7 : .8)); camera.lookAt(-.2, 0, -2.6);   /* 수평선(노을)이 위쪽에 보이게 */
  /* 선착장이 화면 아래쪽(아래에서 14%)에 오게 그림을 위아래로 옮긴다 — 위로 앞바다가 넓게 */
  camera.clearViewOffset(); camera.aspect = asp; camera.updateProjectionMatrix(); camera.updateMatrixWorld(); const p = new THREE.Vector3(-.2, T.DECK, T.TUB_Z + .6).project(camera), dy = h * .86 - (1 - p.y) / 2 * h; camera.setViewOffset(w, h, 0, -dy, w, h); }

// ── 한 판
function newTrip(){ for (const f of S.fish) scene.remove(f.obj); S.fish = []; for (const t of S.tubs) scene.remove(t); for (const fl of S.tubFish) for (const o of fl) scene.remove(o); if (S.thief) { scene.remove(S.thief.obj); S.thief = null; }
  S.trip = R.trip(SAVE.trips, Math.random, { prev: S.trip, no: OPT.filter(n => !K[n]).map(() => 'crab') }); S.ti = 0; S.fill = [[], [], []]; S.tubFish = [[], [], []]; S.loaded = []; S.left = S.trip.tubs[0]; S.clock = 0; S.missing = false; S.overInTub = false;
  S.tubs = T.TUB_X.map(x => { const t = KIT.tub.clone(); t.position.set(x, T.DECK, T.TUB_Z); t.scale.setScalar(T.TUB_S); scene.add(t); return t; });
  S.thiefIn = R.MIX.GULL.every[0]; S.schoolIn = 6 + Math.random() * 6; dusk(0); A.trayClear(); A.flames(S.streak); S.ask = null;
  while (S.fish.length < S.trip.n) addFish(true);
  S.log.push({ trip: S.trip.tubs.slice(), ev: Object.keys(S.trip.ev).join('+'), step: S.trip.step }); }

// ── 화면 가장자리(그 깊이 z 에서 화면 끝이 되는 x) — 물고기는 화면 안에서 돌아선다
const _v = new THREE.Vector3(); function edgeX(z, side){ _v.set(0, .04, z).project(camera); const a = _v.x; _v.set(1, .04, z).project(camera); const b = _v.x - a; return b ? (side * .96 - a) / b : side * 5; }
// ── 물고기
function fishModel(kind, v){ const proto = KIT.fish[(v + S.id) % KIT.fish.length], o = proto.clone(true); o.traverse(m => { if (m.isMesh) m.castShadow = true; });
  if (kind === 'gold') tint(o, '#ffcf3a', .55); else if (kind === 'puffer') { tint(o, '#f3e3a2'); o.scale.set(1, 1.35, 1.25); } else if (kind === 'big') o.userData.big = true;
  const s = T.FISH_S * (S.fk || 1) * (kind === 'big' ? 1.7 : .8 + Math.min(v, 9) * .06); o.scale.multiplyScalar(s); scene.add(o); return o; }
function addFish(first = false, forced = null){ const t = S.trip, spec = forced || R.spawn(S.left, t, S.fish, Math.random, { filled: S.fill[S.ti] && S.fill[S.ti].length > 0 }), dir = Math.random() < .5 ? 1 : -1;
  const f = { id: ++S.id, kind: spec.kind, v: spec.v, dir, x: 0, z: T.SEA.z[0] + Math.random() * (T.SEA.z[1] - T.SEA.z[0]),
    sp: (T.SPEED[0] + Math.random() * (T.SPEED[1] - T.SPEED[0])) * (forced && forced.fast ? 3.2 : 1), ph: Math.random() * 6, pulls: 0, caught: false, fast: !!(forced && forced.fast) };
  const l = edgeX(f.z, -1), r = edgeX(f.z, 1); f.x = first ? l + .5 + Math.random() * (r - l - 1) : dir > 0 ? l - .8 : r + .8;
  f.obj = fishModel(f.kind, f.v); f.obj.userData.fish = f; S.fish.push(f); return f; }
const fishText = f => f.kind === 'gold' ? '?' : f.v <= 5 ? '●'.repeat(f.v) : String(f.v);

// ── 누르기: 물고기(줄) · 도둑 배(쫓기)
const canvas = $('c');
canvas.addEventListener('pointerdown', e => { if (!S.ready) return; audio(); if (S.intro) { S.skip = true; return; } if (S.missing || S.ask) return;
  if (S.thief && !S.thief.away) { const q = stage.screenOf(S.thief.obj); if (Math.hypot(q.x - e.clientX, q.y - e.clientY) < 90) { shoo(); return; } }
  if (S.busy) return; const ray = stage.pointerRay(e), live = S.fish.filter(f => !f.caught), hit = ray.intersectObjects(live.map(f => f.obj), true)[0];
  let f = null; if (hit) { let o = hit.object; while (o && !o.userData.fish) o = o.parent; f = o && o.userData.fish; }
  if (!f) { let best = 1e9; for (const x of live) { const q = stage.screenOf(x.obj), d = Math.hypot(q.x - e.clientX, q.y - e.clientY); if (d < best) { best = d; f = x; } } if (best > T.PICK_PX) f = null; }
  if (f) hook(f); });

function lineTo(f){ const a = stage.screenOf(new THREE.Vector3(T.ANNE[0] - .15, T.DECK + 1.3, T.ANNE[1] - .2)), b = stage.screenOf(f.obj), l = $('line'), len = Math.hypot(b.x - a.x, b.y - a.y);
  Object.assign(l.style, { left: a.x + 'px', top: a.y + 'px', height: len + 'px', transform: `rotate(${Math.atan2(a.x - b.x, b.y - a.y)}rad)`, opacity: 1 }); clearTimeout(lineTo.t); lineTo.t = setTimeout(() => l.style.opacity = 0, 420); }
const flyMs = () => T.FLY_MS * (1 - T.LINE_FAST * Math.min(S.streak, R.MIX.STREAK_MAX));
async function hook(f){ if (S.hooking) return; S.hooking = true; try { await hook1(f); } finally { S.hooking = false; } }
async function hook1(f){ S.busy = true; lineTo(f); stage.play(S.anne, 'Sword', true); tone(520 + S.streak * 60, .1, 'sine', .1, 0, 1040);
  if (f.kind === 'big' && ++f.pulls < R.MIX.BIG_TAPS) { const k = f.pulls / R.MIX.BIG_TAPS; await stage.tween(f.obj.position, { z: f.z + (T.SEA.z[1] - f.z) * k * .6 }, 260); f.z = f.obj.position.z; tone(300 + f.pulls * 80, .12, 'square', .06); S.log.push({ pull: f.pulls }); S.busy = false; return; }
  const o = R.land(S.left, f), tub = S.tubs[S.ti], at = tub.position.clone(); at.y += .9; f.caught = true; S.log.push({ fish: f.v, kind: f.kind, out: o.kind, left: S.left });
  await stage.tween(f.obj.position, { x: at.x, y: at.y + 1.2, z: at.z }, flyMs() * .65, t => t * (2 - t)); await stage.tween(f.obj.position, { y: at.y }, flyMs() * .35, t => t * t);
  if (o.kind === 'over') { S.overInTub = true; S.streak = 0; A.flames(0); wobble(tub); tone(220, .25, 'sine', .1, 0, 140); S.scatter = T.SCATTER;
    await stage.tween(f.obj.position, { x: f.x, y: .05, z: f.z }, 700, t => t); f.caught = false; f.dir *= -1; f.sp *= 1.5; stage.play(S.anne, 'No', true); S.busy = false; return; }
  // 통에 들어감
  scene.remove(f.obj); S.fish = S.fish.filter(x => x !== f); S.fill[S.ti].push(o.w); putInTub(S.ti, f, o.w); S.left = o.left; A.trayAdd(o.w, S.fill[S.ti].length > 1 ? '+' : '', f.kind === 'puffer' ? '부풂' : f.kind === 'gold' ? '황금' : '');
  tone(700 + S.fill[S.ti].reduce((a, b) => a + b, 0) * 25, .08, 'square', .06); if (f.kind === 'puffer') { tone(880, .2, 'sine', .08, 0, 1320); }
  if (o.kind === 'fit') { await closeTub(); return; }
  topUp(); S.busy = false; }
function putInTub(k, f, w){ const n = S.tubFish[k].length, o = fishModel(f.kind, f.v); o.scale.multiplyScalar(T.IN_TUB_S / T.FISH_S / (S.fk || 1)); const a = n * 2.4, r = .1 + (n % 4) * .05; o.position.set(S.tubs[k].position.x + Math.cos(a) * r, T.DECK + .64 + Math.floor(n / 4) * .06, T.TUB_Z + Math.sin(a) * r); o.rotation.set(-.3, a, 0);
  if (f.kind === 'puffer') stage.tween(o.scale, { y: o.scale.y * 1.35, z: o.scale.z * 1.25 }, 300); S.tubFish[k].push(o); }
function wobble(tub){ stage.tween(tub.rotation, { z: .28 }, 120).then(() => stage.tween(tub.rotation, { z: -.2 }, 160)).then(() => stage.tween(tub.rotation, { z: 0 }, 200)); }
function topUp(){ while (S.fish.filter(f => !f.fast).length < S.trip.n) addFish(false); }

// ── 통이 딱 찼다: 띠의 식이 닫히고 배에 실린다
async function closeTub(){ const k = S.ti, cap = S.trip.tubs[k]; A.trayAdd(cap, '=', ''); S.loaded.push(cap); if (!S.overInTub) S.streak++; else S.streak = 0; S.overInTub = false; A.flames(S.streak);
  [523, 659, 784].forEach((f, i) => tone(f * (1 + .06 * Math.min(S.streak, R.MIX.STREAK_MAX)), .12, 'triangle', .1, i * .07)); stage.play(S.anne, 'Yes', true); S.log.push({ closed: cap, streak: S.streak });
  await sleep(900); const tub = S.tubs[k], spot = new THREE.Vector3(T.BOAT[0] - .35 + k * .35, .45, T.BOAT[2]); const items = [tub, ...S.tubFish[k]], d = spot.clone().sub(tub.position);
  await Promise.all(items.map(o => stage.tween(o.position, { x: o.position.x + d.x, y: o.position.y + d.y + .4, z: o.position.z + d.z }, 700))); items.forEach(o => stage.tween(o.position, { y: o.position.y - .4 }, 200)); items.forEach(o => o.scale.multiplyScalar(.7));
  A.trayClear(); if (S.loaded.length >= 3) { await finish(); return; }
  S.ti++; S.left = S.trip.tubs[S.ti]; topUp(); S.busy = false; S.idle = S.t; }

// ── 끝의 셈 · 배가 떠난다
async function askTotal(){ A.trayClear(); S.loaded.forEach((n, i) => A.trayAdd(n, i ? '+' : '')); const q = R.total(S.loaded); S.ask = A.ask({ sum: q.sum, picks: q.picks, onPick: (n, right) => { audio(); S.log.push({ pick: n, right }); }, onWrong: () => { stage.play(S.anne, 'No', true); tone(240, .25, 'sine', .08); } }); const n = await S.ask.promise; S.ask = null; return n; }
async function finish(){ S.busy = true; await askTotal(); SAVE.trips++; SAVE.tubs += 3; L.landFish(S.loaded); wallet.save(); S.log.push({ done: true, trips: SAVE.trips }); await sail(); }
async function sail(){ tone(392, .2, 'triangle', .1); tone(523, .3, 'triangle', .1, .2); const go = [S.boat, ...S.tubs.filter((t, k) => k < S.loaded.length), ...S.tubFish.slice(0, S.loaded.length).flat()];
  await Promise.all(go.map(o => stage.tween(o.position, { x: o.position.x + 14 }, 2600, t => t * t))); $('fade').style.opacity = 1; await sleep(480); stage.tweens.length = 0;
  S.boat.position.set(T.BOAT[0], T.BOAT[1], T.BOAT[2]); newTrip(); await sleep(80); $('fade').style.opacity = 0; intro(); }
// 해가 졌다: 다 찬 통만 싣고 떠난다(표시·벌 없음)
async function miss(){ if (S.missing) return; S.missing = true; S.busy = true; S.streak = 0; A.flames(0); S.log.push({ missed: true, loaded: S.loaded.length }); if (S.thief) shoo(); tone(300, .5, 'sine', .1, 0, 140); stage.play(S.anne, 'No', true);
  SAVE.tubs += S.loaded.length; if (S.loaded.length) L.landFish(S.loaded); wallet.save(); for (let k = S.loaded.length; k < 3; k++) { stage.tween(S.tubs[k].scale, { x: .01, y: .01, z: .01 }, 600); for (const o of S.tubFish[k]) stage.tween(o.scale, { x: .01, y: .01, z: .01 }, 600); }
  if (S.loaded.length >= 2) { S.missing = false; await askTotal(); S.missing = true; } await sail(); }

// ── 도둑 배(갈매기 자리): 통으로 다가와 오래 두면 한 마리 가져간다(팻말 +). 누르면 돌아간다.
function thiefCome(){ const x0 = edgeX(-2.5, 1) - .9, o = stage.put(K.Ship_Small, x0, 0, -2.5, .45, -Math.PI / 2); S.thief = { obj: o, t: 0, away: false, x0 };   /* 화면 오른쪽 끝 안쪽에서 나타남 */ S.log.push({ thief: 'come' }); tone(196, .25, 'square', .05); }
function shoo(){ const th = S.thief; if (!th || th.away) return; th.away = true; S.log.push({ thief: 'shoo' }); tone(880, .1, 'square', .06); stage.tween(th.obj.position, { x: 12, z: -6 }, 1400, t => t * t).then(() => { scene.remove(th.obj); if (S.thief === th) S.thief = null; }); S.thiefIn = R.MIX.GULL.every[0] + Math.random() * (R.MIX.GULL.every[1] - R.MIX.GULL.every[0]); }
function thiefTake(){ const th = S.thief, v = R.gullTake(S.fill[S.ti]); if (v) { const o = S.tubFish[S.ti].pop(); if (o) scene.remove(o); S.left += v; A.trayAdd(v, '−', '가져감'); tone(260, .3, 'sine', .08, 0, 150); } S.log.push({ thief: 'took', v }); shoo(); }

// ── 해넘이: 하늘 · 해 · 바다 빛
const DAY = { hemi: hemi.intensity, sun: sun.intensity, fog: scene.fog.color.clone() }, DAYSEA = new THREE.Color(LOOK.SEA), DUSKSEA = new THREE.Color(T.DUSK.SEA_DUSK);
function mixC(a, b, k){ return '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString(); }
function dusk(k){ const sky = k < .6 ? LOOK.SKY.map((c, i) => mixC(c, T.DUSK.SUNSET[i], k / .6)) : T.DUSK.SUNSET.map((c, i) => mixC(c, T.DUSK.NIGHT[i], (k - .6) / .4)); stage.paintSky(sky);
  sun.intensity = DAY.sun * (1 - .7 * k); hemi.intensity = DAY.hemi * (1 - .5 * k); sun.position.set(-8 + 4 * k, 11 - 9 * k, 6); sun.color.set(mixC('#fff1d8', '#ff9a5a', Math.min(1, k * 1.4))); sea.material.color.copy(DAYSEA).lerp(DUSKSEA, k * .8); scene.fog.color.set(k < .6 ? mixC('#' + DAY.fog.getHexString(), T.DUSK.SUNSET[2], k / .6) : mixC(T.DUSK.SUNSET[2], T.DUSK.NIGHT[2], (k - .6) / .4)); }

// ── 떠나는 장면: 통 셋의 팻말을 보여 주고(누르면 건너뜀)
async function intro(){ const my = S.introId = (S.introId | 0) + 1; S.intro = true; S.skip = false; S.busy = true; for (let t = 0; t < 1500 && !S.skip; t += 50) await sleep(50); if (S.introId !== my) return; S.intro = false; S.busy = false; S.idle = S.t; }   /* 표가 바뀌었으면(새 판·하네스 restart) 지난 장면은 손대지 않음 */

// ── 팻말: 통(남은 칸 · 지금 통은 크게) · 물고기 등의 수
function signsDraw(){ const sg = S.signs; S.tubs.forEach((t, k) => { const e = sg[k], done = k < S.loaded.length, cur = k === S.ti && !done;
    if (S.missing && !done) { A.signDraw(e, null); return; }
    const left = cur ? S.left : done ? 0 : S.trip.tubs[k]; e.classList.toggle('off', !cur && !done); e.classList.toggle('done', done); A.signDraw(e, stage.screenOf(new THREE.Vector3(t.position.x, t.position.y + 1.2, t.position.z + .2)), done ? '✓' : left); });
  const live = S.fish.filter(f => !f.caught); for (let i = 3; i < sg.length; i++) { const f = live[i - 3], e = sg[i]; if (!f || S.ask) { A.signDraw(e, null); continue; } e.classList.toggle('dots', f.v <= 5 && f.kind !== 'gold'); e.classList.toggle('gold', f.kind === 'gold');
    A.signDraw(e, stage.screenOf(new THREE.Vector3(f.obj.position.x, f.obj.position.y + .55 * (f.kind === 'big' ? 1.6 : 1), f.obj.position.z)), fishText(f)); } }

// ── 한 장면의 일
stage.frame((dt, t) => { S.t = t; if (!S.ready) return;
  const thinking = !S.intro && !S.missing && (!S.busy || S.ask);
  if (thinking && !CALM && !S.ask) { S.clock = Math.min(1, S.clock + dt / S.trip.budget); dusk(S.clock); if (S.clock >= 1) miss();
    if (S.clock > T.BEAT && t - S.beat > .25 + (1 - S.clock) * 2.4) { S.beat = t; tone(96, .09, 'sine', .16); tone(72, .12, 'sine', .12, .09); } }
  // 물고기가 헤엄친다(넘친 뒤엔 잠깐 흩어짐)
  S.scatter = Math.max(0, S.scatter - dt); const boost = 1 + S.scatter;
  for (const f of S.fish) { if (f.caught) continue; f.x += f.dir * f.sp * boost * dt; const o = f.obj; o.position.set(f.x, .04 + Math.sin(t * 2 + f.ph) * .05, f.z + Math.sin(t * .7 + f.ph) * .25); o.rotation.y = f.dir > 0 ? 0 : Math.PI; o.rotation.z = Math.sin(t * 6 + f.ph) * .12;
    const l = edgeX(f.z, -1) - .9, r = edgeX(f.z, 1) + .9; if (f.fast) { if ((f.dir > 0 && f.x > r + 2) || (f.dir < 0 && f.x < l - 2)) f.gone = true; }   /* 떼는 지나간 쪽 끝에서만 사라짐 */ else if ((f.x < l + 1.4 && f.dir < 0) || (f.x > r - 1.4 && f.dir > 0)) f.dir *= -1; }
  for (const f of S.fish.filter(f => f.gone)) scene.remove(f.obj); S.fish = S.fish.filter(f => !f.gone);
  if (!S.busy && !S.missing && S.left > 0) { const live = S.fish.filter(f => !f.caught); const u = R.unstick(S.left, S.trip, live); if (u != null) { const f = live.find(x => x.kind === 'plain') || live[0]; if (f) { f.kind = 'plain'; f.v = u; } } }
  // 빠른 떼
  if (S.trip.ev.school && thinking && !S.ask && (S.schoolIn -= dt) <= 0) { S.schoolIn = 14 + Math.random() * 10; const dir = Math.random() < .5 ? 1 : -1, z = -2 - Math.random() * 2.5; R.school(S.left, S.trip, Math.random).forEach((v, i) => { const f = addFish(false, { kind: 'plain', v, fast: true }); f.dir = dir; f.x = (dir > 0 ? edgeX(z, -1) - 1 : edgeX(z, 1) + 1) - dir * i * .9; f.z = z + (i % 2) * .5; }); S.log.push({ school: true }); tone(660, .08, 'triangle', .06); }
  // 도둑 배
  if (S.trip.ev.gull && thinking && !S.ask) { if (!S.thief && (S.thiefIn -= dt) <= 0 && S.fill[S.ti].length) thiefCome(); const th = S.thief; if (th && !th.away) { th.t += dt / R.MIX.GULL.land; const tub = S.tubs[S.ti]; th.obj.position.x = th.x0 + (tub.position.x + .3 - th.x0) * th.t; th.obj.position.z = -2.5 + (T.TUB_Z - 1.4 + 2.5) * th.t; th.obj.position.y = Math.sin(t * 1.4) * .05; if (th.t >= 1) thiefTake(); } }
  if (S.boat) { S.boat.position.y = Math.sin(t * 1.2) * .05; }
  signsDraw(); });

window.__fishing = { S, R, T, SAVE, stage, screenOf: stage.screenOf, hook: f => hook(f), shoo, thiefCome, addFish,
  restart: trips => { SAVE.trips = trips; S.introId = (S.introId | 0) + 1; stage.tweens.length = 0; newTrip(); S.busy = false; S.intro = false; } };
build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
