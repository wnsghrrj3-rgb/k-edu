/* 나룻배 나루(3D) — 같은 수씩 묶어 세기(뛰어 세기 → 곱셈의 기초). 규칙·사건 표 = ./rules.js · 기준 N00.
 * 부두 앞 물에 나룻배가 줄지어 매여 있고, 배마다 통이 같은 수씩 실려 있다(팻말 「3」). 나룻배를 누르면 큰 배 옆으로 가서 통을 올려 준다.
 * 채우기: 큰 배 팻말(남은 수)이 3씩 준다 — 12 → 9 → 6 → 3 → 0. 세기: 큰 배 팻말이 3, 6, 9, 12 로 오른다.
 * 끝의 셈: 「3 + 3 + 3 + 3 = ?」(묶음 말을 배운 뒤 배가 많으면 「3씩 5번 = ?」) — 고를 수는 한 묶음 앞뒤(9 · 12 · 15). 맞는 수를 누르면 큰 배가 떠나고 동전.
 * 시계 = 밀물(큰 배가 부두에서 떠밀려 감 · 생각하는 동안에만). ?calm = 떠밀리지 않음.
 * 그림은 기성 3D 재료만(Quaternius Pirate Kit · Cute Fish Pack, CC0 — ../bridge/assets). 화면 위 표시(팻말·띠)만 코드로. */
import { createStage, THREE, CALM, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=2';
import * as R from './rules.js?v=1';
import { wallet, audio, tone, art } from '../common/kit.js?v=8';
import * as H from '../common/hint.js?v=4';

// ── 내가 정한 수치(준호가 보고 바꾼다)
const T = { DECK: .45, PZ: .9, ROW_Z: 2.55, ROW_X: [-6.0, 1.6], BOAT_LEN: 1.25, BAR_S: .31, BAR_D: .23, MAN_X: 1.05,
  SHIP: { x: 3.3, z: 1.1, s: .5, drift: 2.4, side: [1.85, 2.45] }, GO_MS: 620, PICK_PX: 70, BEAT: .7,
  FISH: { s: 1.5, z: 3.5, from: -7.5, to: 6, sec: 7, px: 85, y: -.05 }, HINT_MS: [2600, 9000] };
const $ = id => document.getElementById(id);
const SAVE = wallet.island('rowboats'); SAVE.rounds = Math.max(0, SAVE.rounds | 0);
const S = { ready: false, busy: true, missing: false, r: null, left: 0, sent: 0, clock: 0, streak: 0, log: [], ask: null, time: 0, beat: 0, idle: 0, rid: 0, boats: [], fish: null, fishIn: -1, gain: null, signs: [], first: true };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [18, 64], shadow: { left: -9, right: 9, top: 6, bottom: -6 }, assets: '../bridge/assets/' }), { scene, camera } = stage;
const K = {}, NAMES = ['Environment_Dock', 'Environment_Dock_Pole', 'Ship_Small', 'Characters_Henry', 'Environment_Cliff4', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_4', 'Prop_Barrel', 'Prop_Rowboat', 'Fish_Clownfish', 'Fish_BlueTang', 'Fish_Koi'];
let boatK = 1, boatY = 0;
const shipX = () => T.SHIP.x + S.clock * T.SHIP.drift;
const SIGNS = 4, BOAT_SIGN = SIGNS;   /* 0 큰 배 · 1 늘 비움 · 2 덤 · 3 비움 · 4~ 나룻배 */

async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); })); const dk = stage.dockKit(K.Environment_Dock), step = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36;
  let i = 0; for (let x = -7.6; x <= 1.6; x += step, i++) { const m = new THREE.Mesh(dk.planks[i % dk.planks.length], dk.mat); m.position.set(x, T.DECK - dk.plankH / 2, T.PZ); scene.add(stage.shadows(m)); }
  for (let x = -7; x <= 1.6; x += 2.85) for (const z of [T.PZ - 1.15, T.PZ + 1.2]) stage.put(K.Environment_Dock_Pole, x, T.DECK - .8, z, 1, x);
  stage.put(K.Environment_Cliff4, -11, 0, -4.5, .9, .5); stage.put(K.Environment_PalmTree_3, -9.2, 1.4, -3.4, 1.0, .3); stage.put(K.Environment_PalmTree_1, -10.6, 1.2, -5.4, .9, 2); stage.put(K.Environment_Rock_4, 7.5, -.2, -8.5, 1.2, 1); stage.put(K.Environment_Rock_1, -4.4, -.2, -6.4, 1.1);
  /* 나룻배 크기: 모형을 재어 길이 BOAT_LEN 이 되게(배 바닥이 물에 살짝 잠기게) */
  const probe = K.Prop_Rowboat.scene.clone(), bb = new THREE.Box3().setFromObject(probe), sz = bb.getSize(new THREE.Vector3()); boatK = T.BOAT_LEN / Math.max(sz.x, sz.z); boatY = -bb.min.y * boatK - .05; S.boatAlongZ = sz.z > sz.x; S.boatH = sz.y * boatK;
  S.ship = stage.put(K.Ship_Small, T.SHIP.x + 12, 0, T.SHIP.z, T.SHIP.s, Math.PI / 2);
  S.man = stage.person(K.Characters_Henry); S.man.obj.position.set(T.MAN_X, T.DECK + .02, T.PZ - .1); S.man.obj.rotation.y = 0; stage.play(S.man, 'Idle');
  stage.onResize = aim; stage.resize();
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 처음으로 돌아가요'; document.body.appendChild(n); }
  S.signs = A.signs(SIGNS + 8); S.signs[0].classList.add('ship'); S.signs[2].classList.add('gain'); for (let k = BOAT_SIGN; k < S.signs.length; k++) S.signs[k].classList.add('fs');
  coinsDraw(); wallet.onChange(coinsDraw);
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true; if (SAVE.rounds < 2) H.tell('rowboats', '나룻배를 눌러 큰 배에 통을 실어요! 배마다 같은 수씩 있어요'); await newRound(); }
function coinsDraw(){ let c = $('coins'); if (!c) { c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); } const v = `${art('coin')}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; } }

// ── 카메라: 부두 · 나룻배 줄 · 큰 배가 한 화면에(세로 화면은 좁혀서 크게)
function aim(){ const w = innerWidth, h = innerHeight, tall = h > w, xl = tall ? -5.3 : -6.9, xr = tall ? 4.5 : 6.1, mid = (xl + xr) / 2;
  camera.fov = tall ? 50 : 40; const half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * (w / h)), dist = Math.max(6.5, (xr - xl) / 2 / Math.tan(half));
  camera.position.set(mid, 1 + dist * (tall ? .55 : .46), T.ROW_Z + dist * (tall ? .82 : .86)); camera.lookAt(mid, tall ? 1.0 : .7, T.PZ - .4); camera.updateProjectionMatrix(); }

// ── 나룻배 하나: 모형 + 통 g 개(다섯씩 두 줄 — 세어 볼 수 있게)
function rowboat(g, hidden){ const grp = new THREE.Group(), m = K.Prop_Rowboat.scene.clone(); m.scale.setScalar(boatK); m.position.y = boatY; if (S.boatAlongZ) m.rotation.y = Math.PI / 2; grp.add(stage.shadows(m));
  const cargo = new THREE.Group(); grp.add(cargo); const cols = Math.min(5, Math.ceil(g / 2)), rows = g > 5 ? 2 : g > 1 && g <= 4 ? 2 : 1; const per = Math.ceil(g / rows);
  for (let k = 0; k < g; k++) { const row = Math.floor(k / per), col = k % per, b = K.Prop_Barrel.scene.clone(); b.scale.setScalar(T.BAR_S); b.position.set((col - (per - 1) / 2) * T.BAR_D, boatY + S.boatH * .38, rows === 2 ? (row ? .12 : -.12) : 0); b.rotation.y = k; cargo.add(stage.shadows(b)); }
  cargo.visible = !hidden; grp.userData = { cargo, cols }; return grp; }
/* 나룻배 자리: 가로 화면은 한 줄 · 세로 화면은 좁혀서, 다섯 척 넘으면 두 줄(뒤 줄 먼저 → 앞 줄) */
function rowPos(i, n){ const tall = innerHeight > innerWidth, [a, b] = tall ? [-4.5, 1.4] : T.ROW_X, two = tall && n > 4, per = two ? Math.ceil(n / 2) : n, row = two && i >= per ? 1 : 0, j = row ? i - per : i, m = row ? n - per : per, gap = Math.min(1.45, (b - a) / Math.max(1, per - 1));
  return { x: m === 1 ? (a + b) / 2 : a + j * gap + (row ? gap / 2 : 0), z: T.ROW_Z + row * 1.9 }; }

// ── 한 판
function trayDraw(){ A.trayClear(); const r = S.r; if (!S.sent) return; if (r.word) { A.trayAdd(r.g, '', '씩'); A.trayAdd(S.sent, '', '번'); return; } for (let k = 0; k < S.sent; k++) A.trayAdd(r.g, k ? '+' : ''); }
async function newRound(opt = {}){ const id = ++S.rid; S.busy = true; S.missing = false; A.trayClear(); S.gain = null; if (S.fish) { stage.unperson(S.fish.p); S.fish = null; }
  for (const b of S.boats) scene.remove(b.obj); S.boats = [];
  S.r = R.round(SAVE.rounds, Math.random, opt); S.left = S.r.sum; S.sent = 0; S.clock = 0; S.first = true; S.fishIn = S.r.fish ? 2 + Math.random() * 4 : -1;
  for (let i = 0; i < S.r.boats; i++) { const o = rowboat(S.r.g, i === S.r.mystery); const rp = rowPos(i, S.r.boats); o.position.set(rp.x, 0, rp.z + 1.2); o.rotation.y = 0; scene.add(o); S.boats.push({ obj: o, i, hidden: i === S.r.mystery, gone: false, phase: i * .7, z: rp.z }); }
  S.ship.rotation.set(0, Math.PI / 2, 0); S.ship.position.set(T.SHIP.x + 12, 0, T.SHIP.z); S.log.push({ round: S.r.kind, g: S.r.g, k: S.r.k, sum: S.r.sum, boats: S.r.boats, mystery: S.r.mystery, word: S.r.word, fish: S.r.fish });
  S.boats.forEach((b, i) => stage.tween(b.obj.position, { z: b.z }, 600 + i * 70, t => 1 - (1 - t) ** 3));
  await stage.tween(S.ship.position, { x: T.SHIP.x }, 1100, t => 1 - (1 - t) ** 3); if (id !== S.rid) return; tone(330, .12, 'triangle', .08); S.idle = S.time; S.busy = false; }

/** 나룻배를 보낸다: 큰 배 옆으로 가서 통이 한 줄로 튀어 오르고, 빈 배는 물러나 사라진다 */
async function tap(i){ const b = S.boats[i]; if (!b || b.gone || S.busy || S.ask || S.missing || !S.r) return; S.busy = true; const id = S.rid, r = S.r;
  if (r.kind === 'fill') { const o = R.send(S.left, r.g); S.log.push({ send: i, out: o.kind, left: o.left }); if (o.kind === 'over') { S.busy = false; return; } }   /* 같은 수씩이라 넘치지 않는다(다 차면 바로 끝의 셈) */
  else S.log.push({ count: i, n: (S.sent + 1) * r.g });
  b.gone = true; stage.play(S.man, 'Wave', true); if (b.hidden) { b.hidden = false; b.obj.userData.cargo.visible = true; tone(880, .12, 'triangle', .1); await stage.tween(b.obj.userData.cargo.position, { y: .25 }, 160); await stage.tween(b.obj.userData.cargo.position, { y: 0 }, 180); if (id !== S.rid) return; }
  const ms = T.GO_MS * R.pace(S.streak), side = T.SHIP.side[S.sent % 2], tx = shipX() - side * .55 - .2, tz = T.SHIP.z + 1.15;
  await stage.tween(b.obj.position, { x: tx, z: tz }, ms, t => 1 - (1 - t) ** 2); if (id !== S.rid) return;
  /* 통이 하나씩 큰 배로 — 셈 소리가 하나씩 */
  const cargo = b.obj.userData.cargo, kids = [...cargo.children]; for (let k = 0; k < kids.length; k++) { const c = kids[k]; stage.tween(c.position, { y: c.position.y + 1.1, z: c.position.z - .9 }, 160).then(() => stage.tween(c.scale, { x: .01, y: .01, z: .01 }, 90)); tone(520 + k * 26, .05, 'triangle', .06); await sleep(Math.max(28, 90 * R.pace(S.streak) - kids.length * 4)); }
  S.sent++; if (r.kind === 'fill') S.left -= r.g; S.first = false; tone(r.kind === 'fill' ? 392 + S.sent * 50 : 392 + S.sent * 50, .12, 'triangle', .11, .05); stage.tween(S.ship.position, { y: -.08 }, 90).then(() => stage.tween(S.ship.position, { y: 0 }, 200)); trayDraw();
  stage.tween(b.obj.position, { x: tx + .6, z: tz + 1.6 }, 520).then(() => stage.tween(b.obj.scale, { x: .01, y: .01, z: .01 }, 260)).then(() => scene.remove(b.obj));
  await sleep(160); if (id !== S.rid) return; stage.play(S.man, 'Idle');
  const done = r.kind === 'fill' ? S.left === 0 : S.sent === r.k; if (!done) { S.busy = false; S.idle = S.time; return; }
  await finish(id); }

// ── 끝의 셈 → 큰 배가 떠난다
async function finish(id){ const r = S.r; [523, 659, 784].forEach((f, k) => tone(f, .1, 'triangle', .1, k * .07)); await sleep(300); if (id !== S.rid) return;
  S.ask = A.ask({ sum: r.sum, picks: R.picks(r.sum, r.g), onPick: (n, right) => { audio(); S.log.push({ pick: n, right }); }, onWrong: () => tone(240, .25, 'sine', .08) }); await S.ask.promise; S.ask = null; if (id !== S.rid) return;
  S.streak++; A.flames(S.streak); wallet.earn(r.coins, 'rowboats'); SAVE.rounds++; wallet.save(); S.log.push({ done: SAVE.rounds, coins: r.coins }); S.gain = `${art('coin')}+${r.coins}`;
  for (const b of S.boats) if (!b.gone) { b.gone = true; stage.tween(b.obj.position, { z: T.ROW_Z + 1.4 }, 600); }
  [784, 988, 1175, 1568].forEach((f, k) => tone(f, .14, 'triangle', .11, k * .08)); stage.play(S.man, 'Yes', true); await sleep(700); await stage.tween(S.ship.position, { x: S.ship.position.x + 13 }, 1700, t => t * t); if (id !== S.rid) return; stage.play(S.man, 'Idle'); await newRound(); }

// ── 놓침: 밀물에 큰 배가 다 떠밀려 갔다 — 표시·벌 없이 새 판(판 수는 그대로)
async function miss(){ if (S.missing || S.busy) return; S.missing = true; S.busy = true; const id = S.rid; S.streak = 0; A.flames(0); H.hide(); S.log.push({ missed: true }); tone(300, .5, 'sine', .1, 0, 140); stage.play(S.man, 'No', true); await stage.tween(S.ship.position, { x: S.ship.position.x + 12 }, 1900, t => t * t); if (id !== S.rid) return; await newRound(); }

// ── 지나가는 물고기(손): 나룻배 줄 앞을 헤엄쳐 간다. 눌러 잡으면 덤 동전
function fishCome(){ const rig = K[['Fish_Clownfish', 'Fish_BlueTang', 'Fish_Koi'][Math.floor(Math.random() * 3)]], p = stage.person(rig, { scale: T.FISH.s }); p.obj.position.set(T.FISH.from, T.FISH.y, T.FISH.z); p.obj.rotation.y = Math.PI / 2; const clip = Object.keys(p.acts).find(n => /Swim/.test(n)); if (clip) stage.play(p, clip); S.fish = { p, got: false }; S.log.push({ fish: 'come' }); }
async function fishGrab(){ const f = S.fish; if (!f || f.got) return; f.got = true; wallet.earn(R.MIX.FISH_COINS, 'rowboats'); S.log.push({ fish: 'got', coins: R.MIX.FISH_COINS }); [880, 1175].forEach((v, k) => tone(v, .1, 'triangle', .1, k * .07)); await stage.tween(f.p.obj.position, { y: .9 }, 220); await stage.tween(f.p.obj.scale, { x: .01, y: .01, z: .01 }, 240); stage.unperson(f.p); if (S.fish === f) S.fish = null; }

// ── 누르기: 물고기 · 나룻배(누른 자리에서 가장 가까운 배)
const fishAt = () => stage.screenOf(new THREE.Box3().setFromObject(S.fish.p.obj).getCenter(new THREE.Vector3()));   /* 모형 가운데(원점이 꼬리 쪽일 수 있어) */
const boatAt = b => stage.screenOf(new THREE.Vector3(b.obj.position.x, .25, b.obj.position.z));
$('c').addEventListener('pointerdown', e => { if (!S.ready) return; audio();
  if (S.fish && !S.fish.got) { const q = fishAt(); if (Math.hypot(q.x - e.clientX, q.y - e.clientY) < T.FISH.px) { fishGrab(); return; } }
  if (S.busy || S.ask || S.missing || !S.r) return; let best = T.PICK_PX, hit = -1; S.boats.forEach((b, i) => { if (b.gone) return; const q = boatAt(b), d = Math.hypot(q.x - e.clientX, (q.y - e.clientY) * .7); if (d < best) { best = d; hit = i; } });
  if (hit >= 0) tap(hit); });

// ── 매 장면: 시계(밀물) · 팻말 · 손 그림
stage.frame((dt, t) => { S.time = t; if (!S.ready || !S.r) return;
  const thinking = !S.busy && !S.ask && !S.missing;
  if (thinking && !CALM) { S.clock = Math.min(1, S.clock + dt / S.r.budget); S.ship.position.x = shipX(); if (S.clock >= 1) miss(); if (S.clock > T.BEAT && t - S.beat > .25 + (1 - S.clock) * 2.4) { S.beat = t; tone(96, .09, 'sine', .16); tone(72, .12, 'sine', .12, .09); } }
  if (!S.missing) S.ship.rotation.z = Math.sin(t * 1.3) * .025;
  for (const b of S.boats) if (!b.gone) { b.obj.position.y = Math.sin(t * 1.6 + b.phase) * .035; b.obj.rotation.z = Math.sin(t * 1.2 + b.phase) * .04; }
  if (thinking && S.fishIn > 0) { S.fishIn -= dt; if (S.fishIn <= 0 && !S.fish) fishCome(); }
  if (S.fish && !S.fish.got) { const o = S.fish.p.obj; o.position.x += (T.FISH.to - T.FISH.from) / T.FISH.sec * dt; o.position.y = T.FISH.y + Math.sin(t * 3) * .05; if (o.position.x > T.FISH.to) { const f = S.fish; f.got = true; S.log.push({ fish: 'gone' }); stage.unperson(f.p); S.fish = null; } }
  const so = stage.screenOf, ship = S.signs[0], sp = so(new THREE.Vector3(S.ship.position.x, 2.15, T.SHIP.z)); sp.x = Math.min(innerWidth - 56, sp.x);
  const arriving = S.busy && S.first && S.ship.position.x > T.SHIP.x + 3; if (S.gain || arriving || (S.missing && S.ship.position.x > T.SHIP.x + 6)) A.signDraw(ship, null);
  else { A.signDraw(ship, sp, S.r.kind === 'fill' ? String(S.left) : String(S.sent * S.r.g)); ship.classList.toggle('done', S.r.kind === 'fill' ? S.left === 0 : S.sent === S.r.k); }
  for (let k = 0; k < S.signs.length - BOAT_SIGN; k++) { const e = S.signs[BOAT_SIGN + k], b = S.boats[k]; if (!b || b.gone || S.ask) { A.signDraw(e, null); continue; } A.signDraw(e, so(new THREE.Vector3(b.obj.position.x, .62, b.obj.position.z)), b.hidden ? '?' : String(S.r.g)); e.classList.toggle('q', b.hidden); }
  A.signDraw(S.signs[1], null); A.signDraw(S.signs[3], null);
  if (S.gain) A.signDraw(S.signs[2], { x: Math.min(innerWidth - 70, so(new THREE.Vector3(T.SHIP.x, 2.1, T.SHIP.z)).x), y: sp.y }, S.gain); else A.signDraw(S.signs[2], null);
  /* 손 그림: 처음 세 판까지, 가만히 있으면 다음 나룻배를 짚는다 */
  const nb = S.boats.find(b => !b.gone); if (thinking && nb && SAVE.rounds < 3 && H.idle(T.HINT_MS[SAVE.rounds < 1 ? 0 : 1]) && t - S.idle > 2) { const q = boatAt(nb); H.show(q.x, q.y + 14); } else if (!thinking && H.shown()) H.hide(); });

window.__rowboats = { S, R, T, SAVE, stage, wallet, tap, newRound, miss, fishCome, fishGrab, boatAt: i => boatAt(S.boats[i]), fishAt, screenOf: stage.screenOf, restart: (n, opt) => { SAVE.rounds = n; return newRound(opt); } };
build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
