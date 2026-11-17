/* 보물 길(3D) — 광장 먼바다에 솟은 새 섬. 쪽지의 수만큼 판자를 걸어 보물 통을 찾는다. 규칙·사건 표 = ./rules.js · 기준 N00.
 * 판자 하나가 한 걸음. 앤 머리 위 쪽지 「→ 5」 → 다섯 걸음 앞 판자를 누르면 앤이 한 걸음씩 걸으며 쪽지가 걸음 수(1, 2, 3 …)로 바뀌고 밟은 판자가 빛난다.
 * 딱 맞으면 띠에 그 수가 모이고 다음 쪽지 · 아니면 고개를 젓고 쪽지를 받은 자리로 돌아온다(잃는 것 없음).
 * 쪽지를 다 따르면 「지금 몇째 판자지?」 5 + 3 = ? — 아닌 수는 물러나기만, 맞는 수를 누르면 판자에 그 수가 뜨고 옆에서 보물 통이 솟는다.
 * 시계 = 해적선(생각하는 동안에만 먼바다에서 다가온다 · 닿으면 이번 보물은 해적 차지 — 표시·벌 없이 새 판). ?calm = 해적선 없음.
 * 그림은 기성 3D 재료만(Quaternius Pirate Kit, CC0 — ../bridge/assets). 화면 위 표시(쪽지·팻말·띠)만 코드로. */
import { createStage, THREE, CALM, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=1';
import * as R from './rules.js?v=1';
import { wallet, audio, tone, art } from '../common/kit.js?v=8';
import * as L from '../common/loop.js?v=2';
import * as H from '../common/hint.js?v=3';

// ── 내가 정한 수치(준호가 보고 바꾼다)
const T = { DECK: .45, CELL: .56, PZ: 1.2, PLANK_Z: .62, STEP_MS: 330, BACK_MS: 150, PICK_PX: 46, PICK_Y: 120,
  SHIP: { from: [3.2, -17], to: [1.6, -2.7], s: .5 }, BEAT: .7, BARREL_S: .62, DRIFT: { s: .6, z: 2.6, speed: .75, px: 80 }, WOOD_GIFT: 2, PILE: { MAX: 9, S: .5, DX: .52, DY: .45, X: -3.15, Z: -.6 }, HINT_MS: [2600, 9000] };
const $ = id => document.getElementById(id);
const SAVE = wallet.island('treasure'); SAVE.found = Math.max(0, SAVE.found | 0);
const BR = wallet.island('bridge');
const S = { ready: false, busy: true, missing: false, r: null, ni: 0, pos: 0, at: 0, count: 0, walking: false, okFlash: 0, clock: 0, streak: 0, log: [], ask: null, t: 0, beat: 0, idle: 0, rid: 0, cells: [], poles: [], pile: [], barrels: [], drift: null, driftIn: -1, gain: null, final: null, signs: [] };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [18, 64], shadow: { left: -9, right: 9, top: 6, bottom: -6 }, assets: '../bridge/assets/' }), { scene, camera } = stage;
const K = {}, NAMES = ['Environment_Dock', 'Environment_Dock_Pole', 'Ship_Small', 'Characters_Anne', 'Environment_Cliff2', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_4', 'Prop_Barrel'];
const pier = new THREE.Group(); scene.add(pier);
const cx = i => pier.position.x + i * T.CELL;                     /* i째 판자의 x(0 = 섬 쪽 선착장 끝) */
const cellPos = (i, dy = 0, dz = 0) => new THREE.Vector3(cx(i), T.DECK + dy, T.PZ + dz);

// ── 무대 꾸리기: 섬(절벽·야자) · 선착장 · 판자 길 15칸(가까운 길은 10칸만 보임) · 5칸마다 밧줄 기둥
async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); }));
  const dk = stage.dockKit(K.Environment_Dock), step = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36;
  let k = 0; for (let x = -3.4; x <= .12; x += step, k++) { const m = new THREE.Mesh(dk.planks[k % dk.planks.length], dk.mat); m.position.set(x, T.DECK - dk.plankH / 2, T.PZ); pier.add(stage.shadows(m)); }
  for (let i = 1; i <= R.CELLS.FAR; i++) { const m = new THREE.Mesh(dk.planks[i % dk.planks.length], dk.mat.clone()); m.position.set(i * T.CELL, T.DECK - dk.plankH / 2, T.PZ); m.scale.z = T.PLANK_Z; pier.add(stage.shadows(m)); S.cells[i] = m; }
  const add = (rig, x, y, z, s = 1, ry = 0) => { const c = rig.scene.clone(); c.position.set(x, y, z); c.scale.setScalar(s); c.rotation.y = ry; pier.add(stage.shadows(c)); return c; };
  for (const x of [-3, -1.2]) for (const z of [T.PZ - 1.15, T.PZ + 1.2]) add(K.Environment_Dock_Pole, x, T.DECK - .8, z, 1, x);
  for (const n of [5, 10, 15]) S.poles[n] = [add(K.Environment_Dock_Pole, n * T.CELL, T.DECK - .8, T.PZ + .8, 1, n), add(K.Environment_Dock_Pole, n * T.CELL, T.DECK - .8, T.PZ - .8, 1, n + 1)];
  add(K.Environment_Cliff2, -5.2, 0, -4.6, .62, .4); add(K.Environment_PalmTree_1, -5.9, 1.95, -4.6, .8, .3); add(K.Environment_PalmTree_3, -4.2, 1.75, -4.2, .75, 2); add(K.Environment_Rock_1, -4.6, -.2, -.6, 1.1); add(K.Environment_Rock_4, -4.2, -.25, 3.0, .8, 1);
  stage.put(K.Environment_Rock_4, 9, -.2, -9, 1.2, 1);
  S.ship = stage.put(K.Ship_Small, 0, 0, T.SHIP.from[1], T.SHIP.s, 0);
  S.ship.visible = !CALM; S.anne = stage.person(K.Characters_Anne); S.anne.obj.rotation.y = 0; stage.play(S.anne, 'Idle');
  stage.onResize = () => aim(); stage.resize();
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 처음으로 돌아가요'; document.body.appendChild(n); }
  S.signs = A.signs(7 + 9 + 1); S.signs[16].classList.add('fs'); pileDraw(false); S.signs[0].classList.add('memo'); [1, 2, 3, 4].forEach(i => S.signs[i].classList.add('fs')); S.signs[6].classList.add('gain'); for (let i = 7; i < 16; i++) S.signs[i].classList.add('fs', 'learn');
  coinsDraw(); wallet.onChange(coinsDraw);
  await newRound(); $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true;
  if (SAVE.found < 2) H.tell('treasure', '쪽지의 수만큼 걸어갈 판자를 눌러요!'); }
function coinsDraw(){ let c = $('coins'); if (!c) { c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); } const v = `${art('coin')}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; } }

// ── 찾은 보물이 섬 선착장에 쌓인다(통 아홉까지 · 팻말에 찾은 수)
function pileDraw(pop = true){ const P = T.PILE, n = Math.min(SAVE.found, P.MAX); while (S.pile.length < n) { const k = S.pile.length, up = k >= 5, c = K.Prop_Barrel.scene.clone(); c.position.set(P.X + (up ? k - 5 + .5 : k) * P.DX, T.DECK + (up ? P.DY : 0), T.PZ + P.Z); c.rotation.y = k * 1.3; pier.add(stage.shadows(c)); S.pile.push(c);
    if (pop) { c.scale.setScalar(.01); stage.tween(c.scale, { x: P.S, y: P.S, z: P.S }, 450, t => 1 - (1 - t) ** 3); } else c.scale.setScalar(P.S); } }
// ── 카메라: 판자 길 전체가 화면 너비에 들어오게(세로 화면은 섬 쪽을 덜 보여 주고 판자를 크게)
function aim(){ const w = innerWidth, h = innerHeight, tall = h > w, n = S.r ? S.r.cells : R.CELLS.NEAR, xl = cx(0) - (tall ? 1.2 : 3.4), xr = cx(n) + (tall ? .6 : 1.5), mid = (xl + xr) / 2;
  camera.fov = tall ? 50 : 40; const half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * (w / h)), dist = Math.max(6.5, (xr - xl) / 2 / Math.tan(half));
  camera.position.set(mid, 1 + dist * (tall ? .5 : .42), T.PZ + dist * (tall ? .86 : .9)); camera.lookAt(mid, tall ? 1.2 : .9, T.PZ - .8); camera.updateProjectionMatrix(); S.mid = mid; }
/* 판자 길을 이번 판의 칸 수에 맞춘다(가운데가 x = 0 근처) */
function layout(){ const n = S.r.cells; pier.position.x = -n * T.CELL / 2 - (innerHeight > innerWidth ? .1 : -.7); for (let i = 1; i <= R.CELLS.FAR; i++) S.cells[i].visible = i <= n; S.poles[15].forEach(p => p.visible = n >= 15); aim(); }

// ── 한 판
function shipAt(k){ const a = T.SHIP.from, b = T.SHIP.to, e = k * k * (3 - 2 * k); S.ship.position.set(S.mid + a[0] + (b[0] - a[0]) * e, 0, a[1] + (b[1] - a[1]) * e); S.ship.rotation.y = 0; }
const mark = i => { const m = S.cells[i]; if (!m) return; m.material.emissive.set(0xffb52e); m.material.emissiveIntensity = .5; stage.tween(m.position, { y: T.DECK - .12 }, 70).then(() => stage.tween(m.position, { y: m.userData.y }, 140)); };
const unmark = () => { for (const m of S.cells) if (m) m.material.emissiveIntensity = 0; };
async function newRound(opt = {}){ const id = ++S.rid; S.busy = true; S.missing = false; A.trayClear(); for (const b of S.barrels) scene.remove(b); S.barrels = []; if (S.drift) { scene.remove(S.drift.obj); S.drift = null; } S.gain = null; S.final = null;
  const prev = S.r ? S.r.cells : 0; S.r = R.round(SAVE.found, Math.random, { far: innerWidth >= innerHeight, ...opt }); S.ni = 0; S.pos = S.r.start; S.count = 0; S.clock = 0; S.driftIn = S.r.drift ? 2 + Math.random() * 4 : -1; unmark();
  if (prev && prev !== S.r.cells) { $('fade').style.opacity = 1; await sleep(320); }
  if (prev === S.r.cells && S.at !== S.r.start) await stepTo(S.r.start, false); if (id !== S.rid) return;
  layout(); for (const m of S.cells) if (m) m.userData.y = m.position.y; S.at = S.r.start; S.anne.obj.position.set(cx(S.at), T.DECK + .02, T.PZ); S.anne.obj.rotation.y = 0; shipAt(0); $('fade').style.opacity = 0;
  if (S.r.start) A.trayAdd(S.r.start, '');
  S.log.push({ round: S.r.kind, cells: S.r.cells, start: S.r.start, notes: S.r.notes.map(q => q.dir * q.n), sum: S.r.sum, drift: S.r.drift, twin: S.r.twin }); S.idle = S.t; S.busy = false; }

/** 앤이 판자를 하나씩 밟아 target 까지 간다. count = 걸음을 세며(쪽지가 걸음 수로 · 밟은 판자가 빛남) → 걸은 수 */
async function stepTo(target, count = true){ if (target === S.at) return 0; const dir = target > S.at ? 1 : -1; stage.face(S.anne, dir); stage.play(S.anne, count ? 'Walk' : 'Run'); let k = 0;
  while (S.at !== target) { S.at += dir; k++; await stage.tween(S.anne.obj.position, { x: cx(S.at) }, count ? T.STEP_MS * R.pace(S.streak) : T.BACK_MS, t => t); if (count) { S.count = k; mark(S.at); tone(392 + k * 44 + S.streak * 30, .09, 'triangle', .11); } }
  stage.play(S.anne, 'Idle'); S.anne.obj.rotation.y = 0; return k; }

async function tap(i){ if (S.busy || S.ask || S.missing || !S.r || i === S.at || i < 1 || i > S.r.cells) return; S.busy = true; const id = S.rid, note = S.r.notes[S.ni], o = R.walk(S.pos, note, i); S.log.push({ tap: i, ok: o.ok, steps: o.steps, want: note.dir * note.n });
  S.count = 0; S.walking = true; await stepTo(i); if (id !== S.rid) return;
  if (!o.ok) { S.streak = 0; A.flames(0); stage.play(S.anne, 'No', true); tone(240, .25, 'sine', .08); await sleep(750); if (id !== S.rid) return; unmark(); S.walking = false; S.count = 0; await stepTo(S.pos, false); if (id !== S.rid) return; S.busy = false; S.idle = S.t; return; }
  S.streak++; A.flames(S.streak); S.okFlash = S.t + .55; A.trayAdd(note.n, S.ni === 0 && !S.r.start ? '' : note.dir > 0 ? '+' : '−'); S.pos = i; S.ni++; [523, 659, 784].forEach((f, k) => tone(f + S.streak * 20, .1, 'triangle', .1, k * .07)); await sleep(560); if (id !== S.rid) return; unmark(); S.walking = false; S.count = 0;
  if (S.ni < S.r.notes.length) { S.busy = false; S.idle = S.t; return; }
  await finish(id); }

// ── 끝의 셈 → 보물 통
function barrelAt(x, z){ const b = stage.put(K.Prop_Barrel, x, -1.3, z, T.BARREL_S, Math.random() * 3); S.barrels.push(b); stage.tween(b.position, { y: -.12 }, 700, t => 1 - (1 - t) ** 3); return b; }
async function finish(id){ S.ask = A.ask({ sum: S.r.sum, onPick: (n, right) => { audio(); S.log.push({ pick: n, right }); }, onWrong: () => tone(240, .25, 'sine', .08) }); await S.ask.promise; S.ask = null; if (id !== S.rid) return;
  S.final = { i: S.pos, n: S.r.sum }; const x = cx(S.pos); barrelAt(x - (S.r.twin ? .4 : 0), T.PZ + 1.4); if (S.r.twin) barrelAt(x + .4, T.PZ + 1.4); tone(196, .3, 'sine', .1, 0, 392); stage.play(S.anne, 'Yes', true); await sleep(800); if (id !== S.rid) return;
  const p = R.prize(Math.random, S.r.twin); wallet.earn(p.coins, 'treasure'); if (p.gift === 'fish') L.bucketFish(1); if (p.gift === 'wood') { BR.wood = Math.max(0, BR.wood | 0) + T.WOOD_GIFT; wallet.save(); }
  SAVE.found++; wallet.save(); pileDraw(); S.log.push({ found: SAVE.found, coins: p.coins, gift: p.gift });
  S.gain = `${art('coin')}+${p.coins}` + (p.gift === 'fish' ? ` ${art('market.fish')}+${L.LOOP.BUCKET_FISH}` : p.gift === 'wood' ? ` ${art('plaza.wood')}+${T.WOOD_GIFT}` : '');
  for (const b of S.barrels) stage.tween(b.position, { y: .25 }, 220).then(() => stage.tween(b.position, { y: -.12 }, 260)); [784, 988, 1175, 1568].forEach((f, k) => tone(f, .14, 'triangle', .11, k * .08)); stage.play(S.anne, 'Wave'); await sleep(1900); if (id !== S.rid) return;
  stage.play(S.anne, 'Idle'); await newRound(); }

// ── 놓침: 해적선이 닿았다 — 보물 통이 배 옆에 떠올라 해적이 가져간다. 표시·벌 없이 새 판(찾은 수는 그대로)
async function miss(){ if (S.missing || S.busy) return; S.missing = true; S.busy = true; const id = S.rid; S.streak = 0; A.flames(0); H.hide(); S.log.push({ missed: true }); tone(300, .5, 'sine', .1, 0, 140); stage.play(S.anne, 'No', true);
  const b = barrelAt(S.ship.position.x - 1.1, S.ship.position.z + .4); await sleep(900); stage.tween(b.scale, { x: .01, y: .01, z: .01 }, 400); S.ship.rotation.y = Math.PI / 2; await stage.tween(S.ship.position, { x: S.ship.position.x + 14 }, 1900, t => t * t); if (id !== S.rid) return; await newRound(); }

// ── 떠내려가는 통(손): 판자 길 앞을 지나간다. 눌러 건지면 덤 동전
function driftCome(){ const x0 = cx(S.r.cells) + 1.2, o = stage.put(K.Prop_Barrel, x0, -.16, T.DRIFT.z, T.DRIFT.s, 1); S.drift = { obj: o, got: false }; S.log.push({ drift: 'come' }); }
async function driftGrab(){ const d = S.drift; if (!d || d.got) return; d.got = true; const n = R.MIX.DRIFT_COINS[0] + Math.floor(Math.random() * (R.MIX.DRIFT_COINS[1] - R.MIX.DRIFT_COINS[0] + 1)); wallet.earn(n, 'treasure'); S.log.push({ drift: 'got', coins: n }); [880, 1175].forEach((f, k) => tone(f, .1, 'triangle', .1, k * .07));
  await stage.tween(d.obj.position, { y: .7 }, 200); await stage.tween(d.obj.scale, { x: .01, y: .01, z: .01 }, 260); scene.remove(d.obj); if (S.drift === d) S.drift = null; }

// ── 누르기: 떠내려가는 통 · 판자(누른 자리에서 가장 가까운 칸)
$('c').addEventListener('pointerdown', e => { if (!S.ready) return; audio();
  if (S.drift && !S.drift.got) { const q = stage.screenOf(S.drift.obj); if (Math.hypot(q.x - e.clientX, q.y - e.clientY) < T.DRIFT.px) { driftGrab(); return; } }
  if (S.busy || S.ask || S.missing) return; let best = 1e9, hit = 0; for (let i = 1; i <= S.r.cells; i++) { const q = stage.screenOf(cellPos(i)); if (Math.abs(q.y - e.clientY) > T.PICK_Y) continue; const d = Math.abs(q.x - e.clientX); if (d < best) { best = d; hit = i; } }
  if (hit && best < T.PICK_PX) tap(hit); });

// ── 매 장면: 시계(해적선) · 팻말 · 손 그림
const memoText = () => { const q = S.r.notes[Math.min(S.ni, S.r.notes.length - 1)]; return q.dir > 0 ? `→ ${q.n}` : `← ${q.n}`; };
stage.frame((dt, t) => { S.t = t; if (!S.ready || !S.r) return;
  const thinking = !S.busy && !S.ask && !S.missing;
  if (thinking && !CALM) { S.clock = Math.min(1, S.clock + dt / S.r.budget); if (S.clock >= 1) miss(); if (S.clock > T.BEAT && t - S.beat > .25 + (1 - S.clock) * 2.4) { S.beat = t; tone(96, .09, 'sine', .16); tone(72, .12, 'sine', .12, .09); } }
  if (!S.missing) { shipAt(S.clock); S.ship.position.y = Math.sin(t * 1.4) * .04; }
  if (thinking && S.driftIn > 0) { S.driftIn -= dt; if (S.driftIn <= 0 && !S.drift) driftCome(); }
  if (S.drift && !S.drift.got) { const o = S.drift.obj; o.position.x -= T.DRIFT.speed * dt; o.position.y = -.16 + Math.sin(t * 2.2) * .05; o.rotation.z = Math.sin(t * 1.6) * .12; if (o.position.x < cx(0) - 1.5) { scene.remove(o); S.drift = null; S.log.push({ drift: 'gone' }); } }
  for (const b of S.barrels) b.rotation.z = Math.sin(t * 1.8 + b.position.x) * .07;
  // 팻말
  const [memo, from, p5, p10, p15, fin, gain] = S.signs, so = stage.screenOf, head = so(new THREE.Vector3(S.anne.obj.position.x, T.DECK + 1.75, T.PZ)); head.x = Math.max(62, Math.min(innerWidth - 62, head.x));
  if (S.ask || S.final || S.missing) A.signDraw(memo, null); else { const ok = t < S.okFlash; A.signDraw(memo, head, S.walking && S.count ? String(S.count) : memoText()); memo.classList.toggle('count', S.walking && !ok); memo.classList.toggle('ok', ok); }
  if (S.r.start && !S.final) A.signDraw(from, so(cellPos(S.r.start, -.5, .75)), S.r.start); else A.signDraw(from, null);
  [[p5, 5], [p10, 10], [p15, 15]].forEach(([e, n]) => { if (n > S.r.cells || (S.final && S.final.i === n)) A.signDraw(e, null); else A.signDraw(e, so(cellPos(n, .62, -.8)), n); });
  if (S.final) { A.signDraw(fin, so(cellPos(S.final.i, 1.9)), S.final.n); fin.classList.add('done'); } else A.signDraw(fin, null);
  if (S.gain && S.barrels[0]) A.signDraw(gain, so(new THREE.Vector3(cx(S.pos), -1.05, T.PZ + 1.4)), S.gain); else A.signDraw(gain, null);
  if (SAVE.found > 0 && S.pile.length) A.signDraw(S.signs[16], so(new THREE.Vector3(cx(0) + T.PILE.X + T.PILE.DX * 2, T.DECK + 1.25, T.PZ + T.PILE.Z)), SAVE.found, '', art('market.barrel')); else A.signDraw(S.signs[16], null);
  /* 처음 두 보물까지: 쪽지 쪽 판자들에 걸음 수가 옅게 */
  const learn = SAVE.found < R.MIX.LEARN && thinking, q = S.r.notes[S.ni]; for (let k = 1; k <= 9; k++) { const e = S.signs[6 + k], i = q ? S.pos + q.dir * k : 0; if (learn && q && i >= 1 && i <= S.r.cells) A.signDraw(e, so(cellPos(i, -.32, .55)), k); else A.signDraw(e, null); }
  /* 손 그림: 처음 네 보물까지, 가만히 있으면 갈 판자를 짚는다 */
  if (thinking && q && SAVE.found < 4 && H.idle(T.HINT_MS[SAVE.found < R.MIX.LEARN ? 0 : 1]) && t - S.idle > 2) { const at = so(cellPos(S.pos + q.dir * q.n)); H.show(at.x, at.y + 6); } else if (!thinking && H.shown()) H.hide(); });

window.__treasure = { S, R, T, SAVE, stage, wallet, L, restart: (n, opt) => { SAVE.found = n; for (const c of S.pile) pier.remove(c); S.pile = []; pileDraw(false); S.streak = 0; A.flames(0); return newRound(opt); }, cellAt: i => stage.screenOf(cellPos(i)), tap, newRound, miss, driftCome, driftGrab, screenOf: stage.screenOf };
build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
