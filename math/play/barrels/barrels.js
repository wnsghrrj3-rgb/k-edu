/* 통 부두(3D) — 열 개 묶음(깔판)과 낱개 통을 배 팻말의 수만큼 싣는다(십과 몇). 규칙·사건 표 = ./rules.js · 기준 N00.
 * 깔판(팻말 「10」)을 누르면 통 열 개가, 낱개 통을 누르면 하나가 배로 날아가 실리고 배 팻말의 수가 준다. 띠에는 「30 + 4」처럼 실은 것이 모인다.
 * 남은 수보다 큰 묶음은 도로 튕겨 온다(잃는 것 없음). 딱 맞으면 「30 + 4 = ?」 — 아닌 수는 물러나기만, 맞는 수를 누르면 배가 떠나고 동전을 받는다.
 * 시계 = 배가 부두에서 떠밀려 간다(생각하는 동안에만 · 다 멀어지면 이번 배는 그냥 떠남 — 표시·벌 없이 새 배). ?calm = 떠밀리지 않음.
 * 그림은 기성 3D 재료만(Quaternius Pirate Kit, CC0 — ../bridge/assets). 화면 위 표시(팻말·띠)만 코드로. */
import { createStage, THREE, CALM, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=1';
import * as R from './rules.js?v=1';
import { wallet, audio, tone, art } from '../common/kit.js?v=8';
import * as H from '../common/hint.js?v=3';

// ── 내가 정한 수치(준호가 보고 바꾼다)
const T = { DECK: .45, PZ: 1.2, PAL_X: [-5.0, -2.85], ONES_X: -.85, MAN_X: .55, SHIP: { x: 2.75, z: 1.35, s: .5, drift: 2.6 }, BAR_S: .34, BAR_D: .37, ONE_S: .4, ONE_D: .47,
  FLY_MS: 520, PICK_PX: 120, BEAT: .7, ROLL: { s: .4, z: 2.0, from: -5.6, to: 1.9, sec: 6, px: 80 }, HINT_MS: [2600, 9000] };
const $ = id => document.getElementById(id);
const SAVE = wallet.island('barrels'); SAVE.shipped = Math.max(0, SAVE.shipped | 0);
const S = { ready: false, busy: true, missing: false, o: null, left: 0, t: 0, n1: 0, clock: 0, streak: 0, clean: true, log: [], ask: null, time: 0, beat: 0, idle: 0, rid: 0, pals: [], ones: [], roll: null, rollIn: -1, gain: null, signs: [], first: true };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [18, 64], shadow: { left: -9, right: 9, top: 6, bottom: -6 }, assets: '../bridge/assets/' }), { scene, camera } = stage;
const K = {}, NAMES = ['Environment_Dock', 'Environment_Dock_Pole', 'Ship_Small', 'Characters_Henry', 'Environment_Cliff1', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_4', 'Prop_Barrel'];
let dk = null;
const barrel = s => { const c = K.Prop_Barrel.scene.clone(); c.scale.setScalar(s); return stage.shadows(c); };
/** 깔판 하나: 판자 둘 위에 통 열 개(다섯씩 두 줄 — 세어 볼 수 있게) */
function pallet(){ const g = new THREE.Group(); for (const dz of [-.19, .19]) { const m = new THREE.Mesh(dk.planks[0], dk.mat); m.rotation.y = Math.PI / 2; m.scale.set(1, 1, 1); m.position.set(0, dk.plankH / 2, dz); g.add(stage.shadows(m)); }
  for (let k = 0; k < 10; k++) { const b = barrel(T.BAR_S); b.position.set((k % 5 - 2) * T.BAR_D, dk.plankH, (k < 5 ? -.19 : .19)); b.rotation.y = k; g.add(b); } return g; }
const palHome = i => new THREE.Vector3(T.PAL_X[i], T.DECK, T.PZ);
const oneHome = k => new THREE.Vector3(T.ONES_X + (k % 3 - 1) * T.ONE_D, T.DECK, T.PZ + (Math.floor(k / 3) - 1) * T.ONE_D);
const shipX = () => T.SHIP.x + S.clock * T.SHIP.drift;

async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); })); dk = stage.dockKit(K.Environment_Dock); const step = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36;
  let i = 0; for (let x = -7.6; x <= 1.35; x += step, i++) { const m = new THREE.Mesh(dk.planks[i % dk.planks.length], dk.mat); m.position.set(x, T.DECK - dk.plankH / 2, T.PZ); scene.add(stage.shadows(m)); }
  for (let x = -7; x <= 1.3; x += 2.7) for (const z of [T.PZ - 1.15, T.PZ + 1.2]) stage.put(K.Environment_Dock_Pole, x, T.DECK - .8, z, 1, x);
  stage.put(K.Environment_Cliff1, -11, 0, -4, 1.1, .5); stage.put(K.Environment_PalmTree_3, -9.2, 1.4, -3.4, 1.0, .3); stage.put(K.Environment_Rock_4, 7.5, -.2, -8.5, 1.2, 1); stage.put(K.Environment_Rock_1, -5, -.2, -6.8, 1.1); stage.put(K.Environment_PalmTree_1, -10.4, 1.2, -5.2, .9, 2);
  S.ship = stage.put(K.Ship_Small, T.SHIP.x + 12, 0, T.SHIP.z, T.SHIP.s, Math.PI / 2);
  S.man = stage.person(K.Characters_Henry); S.man.obj.position.set(T.MAN_X, T.DECK + .02, T.PZ - .1); S.man.obj.rotation.y = 0; stage.play(S.man, 'Idle');
  for (let k = 0; k < T.PAL_X.length; k++) { const g = pallet(); g.position.copy(palHome(k)); scene.add(g); S.pals[k] = g; }
  onesFill(false);
  stage.onResize = aim; stage.resize();
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 처음으로 돌아가요'; document.body.appendChild(n); }
  S.signs = A.signs(4); S.signs[0].classList.add('ship'); S.signs[1].classList.add('fs'); S.signs[2].classList.add('fs'); S.signs[3].classList.add('gain');
  coinsDraw(); wallet.onChange(coinsDraw);
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true; if (SAVE.shipped < 2) H.tell('barrels', '배 팻말의 수만큼 통을 실어요! 묶음 하나는 열 개예요'); await newShip(); }
function coinsDraw(){ let c = $('coins'); if (!c) { c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); } const v = `${art('coin')}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; } }
function onesFill(pop = true){ for (let k = S.ones.length; k < R.MIX.ONES; k++) { const b = barrel(T.ONE_S); b.position.copy(oneHome(k)); scene.add(b); S.ones.push(b); if (pop) { b.scale.setScalar(.01); stage.tween(b.scale, { x: T.ONE_S, y: T.ONE_S, z: T.ONE_S }, 320); } } }

// ── 카메라: 깔판 둘 · 낱개 · 일꾼 · 배가 한 화면에(세로 화면은 좁혀서 크게)
function aim(){ const w = innerWidth, h = innerHeight, tall = h > w, xl = tall ? -6.1 : -6.9, xr = tall ? 4.5 : 6.2, mid = (xl + xr) / 2;
  camera.fov = tall ? 50 : 40; const half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * (w / h)), dist = Math.max(6.5, (xr - xl) / 2 / Math.tan(half));
  camera.position.set(mid, 1 + dist * (tall ? .5 : .42), T.PZ + dist * (tall ? .86 : .9)); camera.lookAt(mid, tall ? 1.2 : .9, T.PZ - .8); camera.updateProjectionMatrix(); }

// ── 배 한 척
function trayDraw(){ A.trayClear(); R.parts(S.t, S.n1).forEach((v, k) => { if (v) A.trayAdd(v, k ? '+' : ''); }); }
async function newShip(opt = {}){ const id = ++S.rid; S.busy = true; S.missing = false; A.trayClear(); S.gain = null; if (S.roll) { scene.remove(S.roll.obj); S.roll = null; }
  S.o = R.order(SAVE.shipped, Math.random, opt); S.left = S.o.n; S.t = 0; S.n1 = 0; S.clock = 0; S.clean = true; S.first = true; S.rollIn = S.o.roll ? 2 + Math.random() * 4 : -1;
  S.ship.rotation.set(0, Math.PI / 2, 0); S.ship.position.set(T.SHIP.x + 12, 0, T.SHIP.z); S.log.push({ ship: S.o.n, kind: S.o.kind, show: S.o.show, roll: S.o.roll });
  await stage.tween(S.ship.position, { x: T.SHIP.x }, 1100, t => 1 - (1 - t) ** 3); if (id !== S.rid) return; tone(330, .12, 'triangle', .08); S.idle = S.time; S.busy = false; }

/** 물건 o 를 배로 던져 싣는다(포물선) */
async function fly(o, ms){ const x0 = o.position.x, y0 = o.position.y, z0 = o.position.z, to = new THREE.Vector3(shipX() - .2, .55, T.SHIP.z), p = { k: 0 }; const tw = stage.tween(p, { k: 1 }, ms, t => t); const f = () => { o.position.set(x0 + (to.x - x0) * p.k, y0 + (to.y - y0) * p.k + Math.sin(p.k * Math.PI) * 1.5, z0 + (to.z - z0) * p.k); if (p.k < 1) requestAnimationFrame(f); }; f(); await tw; await stage.tween(o.scale, { x: .01, y: .01, z: .01 }, 120); scene.remove(o); }
const bob = () => stage.tween(S.ship.position, { y: -.09 }, 90).then(() => stage.tween(S.ship.position, { y: 0 }, 200));

async function tapLoad(k, i = 0){ if (S.busy || S.ask || S.missing || !S.o) return; S.busy = true; const id = S.rid, r = R.load(S.left, k), ms = T.FLY_MS * R.pace(S.streak); S.log.push({ load: k, out: r.kind, left: r.left }); stage.play(S.man, 'Punch', true);
  if (r.kind === 'over') { /* 남은 수보다 큰 묶음: 반쯤 갔다가 도로 튕겨 온다 */ S.streak = 0; S.clean = false; A.flames(0); const g = S.pals[i], h = palHome(i); tone(240, .25, 'sine', .08); await stage.tween(g.position, { x: h.x + 1.1, y: h.y + .7 }, 200); await stage.tween(g.position, { x: h.x, y: h.y }, 320, t => 1 - (1 - t) ** 2); stage.play(S.man, 'No', true); if (id !== S.rid) return; S.busy = false; S.idle = S.time; return; }
  tone(k === 10 ? 392 + S.t * 40 + S.streak * 30 : 660 + S.n1 * 30 + S.streak * 30, .1, 'triangle', .11);
  if (k === 10) { const g = S.pals[i]; S.pals[i] = pallet(); S.pals[i].position.copy(palHome(i)); S.pals[i].position.y = -1.2; scene.add(S.pals[i]); stage.tween(S.pals[i].position, { y: T.DECK }, 520, t => 1 - (1 - t) ** 3); await fly(g, ms * 1.15); S.t++; }
  else { const b = S.ones.pop(); await fly(b, ms * .8); S.n1++; if (!S.ones.length) onesFill(); }
  if (id !== S.rid) return; S.left = r.left; S.first = false; bob(); trayDraw(); stage.play(S.man, 'Idle');
  if (r.kind !== 'fit') { S.busy = false; S.idle = S.time; return; }
  await finish(id); }

// ── 끝의 셈 → 배가 떠난다
async function finish(id){ [523, 659, 784].forEach((f, k) => tone(f, .1, 'triangle', .1, k * .07)); S.ask = A.ask({ sum: S.o.n, onPick: (n, right) => { audio(); S.log.push({ pick: n, right }); }, onWrong: () => tone(240, .25, 'sine', .08) }); await S.ask.promise; S.ask = null; if (id !== S.rid) return;
  if (S.clean) S.streak++; else S.streak = 0; A.flames(S.streak); wallet.earn(S.o.coins, 'barrels'); SAVE.shipped++; wallet.save(); S.log.push({ shipped: SAVE.shipped, coins: S.o.coins }); S.gain = `${art('coin')}+${S.o.coins}`;
  [784, 988, 1175, 1568].forEach((f, k) => tone(f, .14, 'triangle', .11, k * .08)); stage.play(S.man, 'Wave'); await sleep(700); await stage.tween(S.ship.position, { x: S.ship.position.x + 13 }, 1700, t => t * t); if (id !== S.rid) return; stage.play(S.man, 'Idle'); await newShip(); }

// ── 놓침: 배가 다 떠밀려 갔다 — 실은 것만 싣고 떠난다. 표시·벌 없이 새 배(보낸 배 수는 그대로)
async function miss(){ if (S.missing || S.busy) return; S.missing = true; S.busy = true; const id = S.rid; S.streak = 0; A.flames(0); H.hide(); S.log.push({ missed: true }); tone(300, .5, 'sine', .1, 0, 140); stage.play(S.man, 'No', true); await stage.tween(S.ship.position, { x: S.ship.position.x + 12 }, 1900, t => t * t); if (id !== S.rid) return; await newShip(); }

// ── 굴러가는 통(손): 부두 앞쪽을 굴러 바다로 간다. 눌러 잡으면 덤 동전
function rollCome(){ const o = barrel(T.ROLL.s); o.rotation.x = Math.PI / 2; o.position.set(T.ROLL.from, T.DECK + .16, T.PZ + .8); scene.add(o); S.roll = { obj: o, got: false }; S.log.push({ roll: 'come' }); }
async function rollGrab(){ const d = S.roll; if (!d || d.got) return; d.got = true; wallet.earn(R.MIX.ROLL_COINS, 'barrels'); S.log.push({ roll: 'got', coins: R.MIX.ROLL_COINS }); [880, 1175].forEach((f, k) => tone(f, .1, 'triangle', .1, k * .07)); await stage.tween(d.obj.position, { y: T.DECK + 1 }, 200); await stage.tween(d.obj.scale, { x: .01, y: .01, z: .01 }, 260); scene.remove(d.obj); if (S.roll === d) S.roll = null; }

// ── 누르기: 굴러가는 통 · 깔판(어느 것이든 열 개) · 낱개 통(어느 것이든 하나)
const zones = () => [[10, 0, stage.screenOf(palHome(0).setY(T.DECK + .3))], [10, 1, stage.screenOf(palHome(1).setY(T.DECK + .3))], [1, 0, stage.screenOf(new THREE.Vector3(T.ONES_X, T.DECK + .25, T.PZ))]];
$('c').addEventListener('pointerdown', e => { if (!S.ready) return; audio();
  if (S.roll && !S.roll.got) { const q = stage.screenOf(S.roll.obj); if (Math.hypot(q.x - e.clientX, q.y - e.clientY) < T.ROLL.px) { rollGrab(); return; } }
  if (S.busy || S.ask || S.missing) return; let best = T.PICK_PX * Math.min(1, innerWidth / 700 + .25), hit = null; for (const z of zones()) { const d = Math.hypot(z[2].x - e.clientX, z[2].y - e.clientY); if (d < best) { best = d; hit = z; } }
  if (hit) tapLoad(hit[0], hit[1]); });

// ── 매 장면: 시계(배가 떠밀림) · 팻말 · 손 그림
stage.frame((dt, t) => { S.time = t; if (!S.ready || !S.o) return;
  const thinking = !S.busy && !S.ask && !S.missing;
  if (thinking && !CALM) { S.clock = Math.min(1, S.clock + dt / S.o.budget); S.ship.position.x = shipX(); if (S.clock >= 1) miss(); if (S.clock > T.BEAT && t - S.beat > .25 + (1 - S.clock) * 2.4) { S.beat = t; tone(96, .09, 'sine', .16); tone(72, .12, 'sine', .12, .09); } }
  if (!S.missing) S.ship.rotation.z = Math.sin(t * 1.3) * .025;
  if (thinking && S.rollIn > 0) { S.rollIn -= dt; if (S.rollIn <= 0 && !S.roll) rollCome(); }
  if (S.roll && !S.roll.got) { const o = S.roll.obj, v = (T.ROLL.to - T.ROLL.from) / T.ROLL.sec; o.position.x += v * dt; o.rotation.z -= v * dt / .16; if (o.position.x > T.ROLL.to) { S.roll.got = true; const d = S.roll; S.log.push({ roll: 'gone' }); stage.tween(o.position, { x: o.position.x + .8, y: -.4 }, 400).then(() => { scene.remove(o); if (S.roll === d) S.roll = null; }); } }
  const [ship, p0, p1, gain] = S.signs, so = stage.screenOf, sp = so(new THREE.Vector3(S.ship.position.x, 2.15, T.SHIP.z)); sp.x = Math.min(innerWidth - 56, sp.x);
  const arriving = S.busy && S.first && S.ship.position.x > T.SHIP.x + 3; if (S.gain || arriving || (S.missing && S.ship.position.x > T.SHIP.x + 6)) A.signDraw(ship, null); else { A.signDraw(ship, sp, S.first ? S.o.show : String(S.left)); ship.classList.toggle('expr', S.first && S.o.show.length > 2); ship.classList.toggle('done', S.left === 0); }
  [p0, p1].forEach((e, i) => A.signDraw(e, so(new THREE.Vector3(S.pals[i].position.x, S.pals[i].position.y + .78, T.PZ - .2)), 10));
  if (S.gain) A.signDraw(gain, { x: Math.min(innerWidth - 70, so(new THREE.Vector3(T.SHIP.x, 2.1, T.SHIP.z)).x), y: sp.y }, S.gain); else A.signDraw(gain, null);
  /* 손 그림: 처음 세 척까지, 가만히 있으면 지금 실을 것(남은 수가 10 이상이면 깔판, 아니면 낱개)을 짚는다 */
  if (thinking && SAVE.shipped < 3 && H.idle(T.HINT_MS[SAVE.shipped < 1 ? 0 : 1]) && t - S.idle > 2) { const z = zones()[S.left >= 10 ? 1 : 2][2]; H.show(z.x, z.y + 10); } else if (!thinking && H.shown()) H.hide(); });

window.__barrels = { S, R, T, SAVE, stage, wallet, zones, tapLoad, newShip, miss, rollCome, rollGrab, screenOf: stage.screenOf, restart: (n, opt) => { SAVE.shipped = n; return newShip(opt); } };
build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
