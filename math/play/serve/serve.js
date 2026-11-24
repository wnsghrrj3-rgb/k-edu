/* 담아 주기 틀 「손님에게 담아 주기」(3D, T04) — 손님이 수를 말하면(말 + 점 무늬) 그만큼 바구니에 담아 종으로 건넨다. 아무것도 안 담는 것이 0.
 * 설계: 핸드오프 kedu/math-play-work/T04_담아주기_틀.md · 정본 kmotion/math-wizard/27_수학놀이터_내용지도와_틀_설계_v1.md(4 · 5절 · 5-9 · 5-10 · 5-11). 규칙 = ./rules.js(화면 없음).
 * 한 나들이 = 낱칸 하나(A02 · A05) · 판 = 문제 셋 · 나들이 = 판 셋. 손: 진열대 물건을 누르면 바구니로 · 바구니 물건을 누르면 진열대로(고칠 수 있다) · 종 = 「여기요」(아이가 「이만큼이면 됐다」를 정한다).
 * 걸음 ① 맞춰 담기(바구니에 주문만큼 흐린 자리) → 걸음 ② 세어 담기(자리 없음 · 점 무늬는 잠깐 보였다가 「…」 — 누르면 다시 봄, 벌 없음).
 *   딱 맞으면 손님이 춤추고 · 모자라면 하나씩 세어 보고 「더 줘」 · 많으면 주문만큼 세고 남은 것을 돌려보냄. A05: 0 주문(빈 바구니 · 미리 든 것은 꺼내야) · 「접시에 몇 개 남았지?」(점 카드 · 0 은 빈 점 판).
 * 사건(rules.js events): 기다리는 줄(시계 · 생각하는 동안에만) · 급한 손님 · 굴러가는 물건 · 깜짝 손님 · 작은 목소리(통과 뒤 · 소리가 날 때만) · 단골. 사건은 주문을 바꾸지 않는다.
 * 누름에는 늘 답이 있다(5-11). 소리는 common/tell.js — 없으면 조용히 넘어간다. 그림은 기성 3D 재료만(./assets · 이름표 ./art.js). */
import { createStage, THREE, CALM, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=2';
import * as H from '../common/hint.js?v=5';
import { wallet, audio, tone, confetti, grew } from '../common/kit.js?v=8';
import { art } from '../common/art.js?v=9';
import * as E from '../common/ends.js?v=1';
import * as M from '../common/map.js?v=7';
import * as C from '../common/choose.js?v=2';
import * as TL from '../common/tell.js?v=2';
import * as B from '../common/barrel.js?v=1';
import { word, eulW } from '../common/say.js?v=3';
import * as R from './rules.js?v=1';
import { ASSETS, MODEL, GOODS_S, SCENERY, TINTS, CAPTAIN, GLOW, ICON } from './art.js?v=1';

// ── 내가 정한 수치(화면 · 움직임 — 준호가 보고 바꾼다). 문제 · 사건 · 시계 수치는 ./rules.js 의 T
const T = { DECK: .45, CZ: 1.3, BARREL_S: .62,
  WIDE: { shelf: { x0: -2.55, dx: .42, z: [1.12, 1.5] }, basket: [.55, 1.3], plate: [-.45, 1.3], bell: [1.75, 1.3], front: [.55, -.15], queue: [[2.1, -.95], [3.35, -1.5]], enter: [6.5, -2.2], exit: [-6.5, -2.2], counter: [-2.9, 2.2] },
  TALL: { shelf: { x0: -1.62, dx: .33, z: [1.1, 1.46] }, basket: [.52, 1.3], plate: [-.15, 1.3], bell: [1.42, 1.32], front: [.4, -.2], queue: [[1.25, -1.0], [1.95, -1.6]], enter: [4, -2.4], exit: [-4, -2.4], counter: [-1.9, 1.85] },
  BASKET: { s: 1.95, sy: .5 }, PLATE_S: 1.35, GUEST_S: .62, BELL_S: .85, BELL_TILT: [-.5, -.8], GOOD_PX: 46, BELL_PX: 70, FLY_MS: 380, WALK: 2.4, COUNT_MS: 420, EAT_MS: 850, ROLL_S: 3.2, ROLL_AT: [2, 5],
  FRONT: [.93, .86], SAY_GRACE: 2, TELL_GRACE: 5, SHOW_MS: 700 };
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const GO = '/math/play/go/';
const WANT = Q.get('cell'), GO_NOW = !WANT || !R.CELLS[WANT];   /* ?cell= 없이 열리면 모형을 불러오기 전에 고르는 화면으로 */
if (GO_NOW) location.replace(GO);
const S = { ready: false, busy: true, active: false, t: 0, oid: 0, cell: null, p: null, res: null, step: 2, ev: {}, board: null, clock: 0, streak: 0, closed: false, choose: null, lastAct: 0, back: false, surpriseCarry: false, hist: {}, log: [],
  shelf: [], basket: [], plate: [], guests: [], guest: null, tall: false, seen: true, peekUntil: 0, peeked: false, noPeek: 0, roll: null, rollAt: Infinity, outGuests: 0, ghosts: [], hintF: null };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [18, 62], shadow: { left: -7, right: 7, top: 5, bottom: -5 }, assets: ASSETS }), { scene, camera } = stage;
const K = {};
const NAMES = [...new Set([MODEL.goods, MODEL.barrel, MODEL.bell, MODEL.dock, MODEL.pole, ...MODEL.guests, ...SCENERY.map(s => s[0])])];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L = () => S.tall ? T.TALL : T.WIDE;
let BK = null, TOP = .9, GOOD_H = .3, GHOST = null;

// ── 짓기: 가게 바닥 · 진열대(통 줄 + 판자 윗판) · 바구니 · 종
async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); }));
  BK = B.barrelKit(stage, THREE, K[MODEL.barrel]);
  const dk = stage.dockKit(K[MODEL.dock]), step = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36;
  for (const z of [-1.0, 1.0, 3.0]) { let i = 0; for (let x = -5.6; x <= 5.6; x += step, i++) { const m = new THREE.Mesh(dk.planks[i % dk.planks.length], dk.mat); m.position.set(x, T.DECK - dk.plankH / 2, z); scene.add(stage.shadows(m)); } }
  for (let x = -4.2; x <= 4.4; x += 2.8) stage.put(K[MODEL.pole], x, T.DECK - .8, -2.15, 1, x);
  for (const s of SCENERY) stage.put(K[s[0]], s[1], s[2], s[3], s[4], s[5]);
  S.counter = new THREE.Group(); scene.add(S.counter); S.plankKit = dk;
  { const g = K[MODEL.goods].scene; g.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(g); GOOD_H = (bb.max.y - bb.min.y) * GOODS_S; }
  GHOST = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: .4, depthWrite: false, roughness: .6 });
  S.basketObj = B.makeTub(stage, THREE, BK, { s: T.BASKET.s, sy: T.BASKET.sy, layerY: .12 });
  S.plateObj = B.makeLid(stage, THREE, BK, T.PLATE_S); S.plateObj.visible = false;
  S.bell = stage.put(K[MODEL.bell], 0, 0, 0, T.BELL_S, 0);
  stage.onResize = aim; stage.resize();
  let c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); coinsDraw(); wallet.onChange(() => coinsDraw());
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
  const t = document.createElement('div'); t.id = 'tally'; t.hidden = true; document.body.appendChild(t);
  const o = document.createElement('div'); o.className = 'order'; o.id = 'order'; o.hidden = true; document.body.appendChild(o); o.addEventListener('click', e => { e.stopPropagation(); bubbleTap(); }); o.addEventListener('pointerdown', e => e.stopPropagation());
  TL.button(on => { S.log.push({ sound: on }); if (!on && S.ev && S.ev.quiet) { S.ev.quiet = false; if (S.active && S.p && S.p.kind === 'give') { bubble('dots'); trayDraw(); } } });   /* 소리를 끄면 작은 목소리는 그만 — 점 무늬로 */
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true;
  outing(WANT); }
function coinsDraw(pop){ const c = $('coins'); if (!c) return; const v = `${art('coin')}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } } }
/** 진열대: 통 줄 위에 판자 윗판(가로로 깜) — 화면 방향이 바뀌면 다시 짓는다. */
function counterBuild(){ const g = S.counter; while (g.children.length) g.remove(g.children[0]); const [x0, x1] = L().counter, dk = S.plankKit, bh = .66 * T.BARREL_S;
  for (let x = x0 + .3; x <= x1 - .2; x += .78) { const b = K[MODEL.barrel].scene.clone(); b.position.set(x, T.DECK, T.CZ); b.scale.setScalar(T.BARREL_S); g.add(stage.shadows(b)); }
  const g0 = dk.planks[0]; g0.computeBoundingBox(); const len = g0.boundingBox.max.z - g0.boundingBox.min.z || 2, w = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36;
  for (let z = T.CZ - .42; z <= T.CZ + .43; z += w) for (let x = x0; x < x1 - .01; x += len) { const m = new THREE.Mesh(dk.planks[Math.floor((x - x0) / len + z * 7) % dk.planks.length], dk.mat); m.rotation.y = Math.PI / 2; const k = Math.min(1, (x1 - x) / len); m.scale.z = k; m.position.set(x + len * k / 2, T.DECK + bh + dk.plankH / 2, z); g.add(stage.shadows(m)); }
  TOP = T.DECK + bh + dk.plankH; }

// ── 카메라 · 자리
function aim(w, h){ const tall = h > w * 1.05, was = S.tall; S.tall = tall; camera.fov = tall ? 50 : 40; const asp = w / h, half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * asp), span = tall ? 2.1 : 4.2, dist = tall ? span / Math.tan(half) : Math.max(6, span / Math.tan(half));
  camera.position.set(0, dist * (tall ? .92 : .76), .5 + dist * (tall ? .42 : .64)); camera.lookAt(0, .6, .5);
  camera.clearViewOffset(); camera.aspect = asp; camera.updateProjectionMatrix(); camera.updateMatrixWorld(); const f = V(0, T.DECK, T.CZ + .7).project(camera), dy = h * T.FRONT[tall ? 1 : 0] - (1 - f.y) / 2 * h; camera.setViewOffset(w, h, 0, -dy, w, h);
  if (was !== tall || !S.laid) layout(); }
function layout(){ S.laid = true; counterBuild(); const l = L();
  S.basketObj.root.position.set(l.basket[0], TOP, l.basket[1]); S.plateObj.position.set(l.plate[0], TOP + .02, l.plate[1]);
  S.bell.position.set(l.bell[0], TOP, l.bell[1]); S.bell.rotation.x = T.BELL_TILT[S.tall ? 1 : 0];
  S.shelf.forEach(g => { if (g.where === 'shelf' && !g.flying) g.o.position.copy(shelfPos(g.spot)); }); S.basket.forEach((g, k) => { if (!g.flying) g.o.position.copy(basketPos(g.bspot)); }); ghostsDraw();
  S.plate.forEach((g, k) => { if (!stage.tweens.some(w => w.o === g.o.position)) g.o.position.copy(platePos(k, S.plate.length)); });
  S.guests.forEach(gu => { if (gu.moving) return; const at = gu === S.guest ? l.front : (S.queue || []).includes(gu) ? l.queue[Math.min((S.queue || []).indexOf(gu), 1)] : gu.at; gu.at = at; gu.obj.position.set(at[0], T.DECK, at[1]); }); }   /* 손님은 구실(앞 · 줄)대로 다시 놓는다 */

// ── 자리: 진열대(다섯씩 두 줄 · 열 자리) · 바구니(바닥 일곱 + 위 셋 — 줄 맞추지 않되 겹치지 않음) · 접시(셋까지 한 줄)
const shelfPos = k => { const sh = L().shelf; return V(sh.x0 + (k % 5) * sh.dx, TOP, sh.z[Math.floor(k / 5)]); };
const BSPOT = (() => { const out = [[0, 0, 0]]; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + .3; out.push([Math.cos(a) * .36, 0, Math.sin(a) * .3]); } for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 1; out.push([Math.cos(a) * .2, 1, Math.sin(a) * .18]); } return out; })();
const basketPos = k => { const b = L().basket, s = BSPOT[k] || [0, 2, 0], tall = S.tall ? .86 : 1; return V(b[0] + s[0] * tall, TOP + .05 + s[1] * GOOD_H * .9, b[1] + s[2] * tall); };
const platePos = (k, n) => { const p = L().plate; return V(p[0] + (k - (n - 1) / 2) * .3, TOP + .06, p[1]); };
function goodObj(){ const o = K[MODEL.goods].scene.clone(); o.scale.setScalar(GOODS_S); scene.add(stage.shadows(o)); return o; }
function ghostObj(){ const o = K[MODEL.goods].scene.clone(); o.scale.setScalar(GOODS_S); o.traverse(m => { if (m.isMesh) { m.material = GHOST; m.castShadow = false; } }); scene.add(o); return o; }
/** 바구니의 흐린 자리(걸음 ① — 주문만큼): 아직 안 찬 자리만 보인다. */
function ghostsDraw(){ const n = S.p && S.step === 1 && S.p.kind === 'give' ? S.p.n : 0; while (S.ghosts.length < n) S.ghosts.push(ghostObj()); S.ghosts.forEach((g, k) => { g.visible = k < n && !S.basket.some(b => b.bspot === k); if (g.visible) g.position.copy(basketPos(k)); }); }
const freeB = () => { for (let k = 0; k < BSPOT.length; k++) if (!S.basket.some(g => g.bspot === k)) return k; return BSPOT.length - 1; };
const freeShelf = () => { for (let k = 0; k < R.T.SPOTS; k++) if (!S.shelf.some(g => g.where === 'shelf' && g.spot === k)) return k; return 0; };

async function flyTo(o, to, ms = T.FLY_MS){ const up = Math.max(o.position.y, to.y) + .55;
  await Promise.all([stage.tween(o.position, { x: to.x, z: to.z }, ms, t => t), stage.tween(o.position, { y: up }, ms * .45, t => t * (2 - t)).then(() => stage.tween(o.position, { y: to.y }, ms * .55, t => t * t))]); }
/** 진열대 → 바구니(빈 자리 하나) */
async function toBasket(g){ g.where = 'basket'; g.bspot = freeB(); S.basket.push(g); ghostsDraw(); g.flying = true; tone(560 + S.basket.length * 40 * (1 + .06 * Math.min(S.streak, 3)), .07, 'square', .05); await flyTo(g.o, basketPos(g.bspot)); g.flying = false; }
/** 바구니 → 진열대(빈 자리로) */
async function toShelf(g, ms){ const i = S.basket.indexOf(g); if (i >= 0) S.basket.splice(i, 1); g.where = 'shelf'; g.spot = freeShelf(); g.bspot = -1; ghostsDraw(); g.flying = true; tone(380, .07, 'triangle', .05); await flyTo(g.o, shelfPos(g.spot), ms); g.flying = false; }

// ── 손님(Henry · Anne 빛깔만 옅게 · 마지막 손님은 짙은 선장 · 깜짝 손님은 반짝)
function makeGuest(k, opt = {}){ const rig = K[MODEL.guests[k % MODEL.guests.length]], tint = opt.captain ? CAPTAIN.tint : TINTS[(k * 3 + S.outGuests) % TINTS.length], p = stage.person(rig, { tint, scale: T.GUEST_S });
  if (opt.captain) p.obj.scale.setScalar(T.GUEST_S * CAPTAIN.scale); stage.play(p, 'Idle'); const gu = { ...p, at: L().enter, captain: !!opt.captain, glow: false }; p.obj.position.set(L().enter[0], T.DECK, L().enter[1]); S.guests.push(gu); return gu; }
function glowGuest(gu, on){ gu.obj.traverse(m => { if (m.isMesh) { if (!m.userData.own) { m.material = m.material.clone(); m.userData.own = true; } m.material.emissive = new THREE.Color(on ? GLOW : '#000000'); m.material.emissiveIntensity = on ? .45 : 0; } }); gu.glow = on; }
async function walk(gu, to, fast = 1){ gu.moving = true; const o = gu.obj, d = Math.hypot(to[0] - o.position.x, to[1] - o.position.z); o.rotation.y = Math.atan2(to[0] - o.position.x, to[1] - o.position.z); stage.play(gu, fast > 1.4 ? 'Run' : 'Walk');
  await stage.tween(o.position, { x: to[0], z: to[1] }, d / (T.WALK * fast) * 1000, t => t); gu.at = to; o.rotation.y = 0; stage.play(gu, 'Idle'); gu.moving = false; }
function dropGuest(gu){ stage.unperson(gu); const i = S.guests.indexOf(gu); if (i >= 0) S.guests.splice(i, 1); }
const headAt = gu => stage.screenOf(gu.obj.position.clone().add(V(0, (gu.captain ? 1.45 : 1.12), 0)));

// ── 말풍선 · 띠 · 소리
function phrase(p){ if (p.kind === 'left') return '접시에 몇 개 남았지?'; return p.n === 0 ? '하나도 안 주셔도 돼요' : `${word(p.n)} 주세요`; }
/** 말풍선: 점 무늬(다섯씩 한 줄 · 0 은 빈 점 판) / 「…」(걸음 ② 에서 가려짐 · 작은 목소리) / 「더 줘」 */
function bubble(mode){ const o = $('order'), p = S.p; if (!p || !S.guest || mode === 'off') { o.hidden = true; S.bubble = 'off'; return; } S.bubble = mode; o.hidden = false;
  const v = mode === 'dots' ? C.dotsHtml(Math.max(1, p.n), p.n) : mode === 'more' ? '더 줘!' : mode === 'no' ? '아니요' : '…'; if (o.dataset.v !== v) { o.dataset.v = v; o.innerHTML = v; o.classList.remove('pop'); void o.offsetWidth; o.classList.add('pop'); } bubblePlace(); }
function bubblePlace(){ const o = $('order'); if (o.hidden || !S.guest) return; const q = headAt(S.guest); o.style.left = q.x + 'px'; o.style.top = q.y + 'px'; }
/** 말풍선을 누름: 다시 듣고 · 가려진 점 무늬를 다시 본다(깨끗함 그대로 — 다만 「안 보고 해내기」 덤은 끊김). */
function bubbleTap(){ audio(); S.lastAct = S.t; H.hide(); const o = $('order'), r = o.getBoundingClientRect(); H.ripple(r.left + r.width / 2, r.top + r.height / 2); o.classList.remove('pop'); void o.offsetWidth; o.classList.add('pop');   /* 누르면 늘 톡(5-11) */
  if (!S.active || S.busy || S.closed || !S.p || S.p.kind !== 'give') return;
  const said = TL.say(phrase(S.p)); S.log.push({ bubble: S.bubble, said });
  if (S.ev.quiet && S.step === 2 && said && TL.voiced()) { bubble('hidden'); return; }   /* 작은 목소리: 말로만(소리가 안 나면 점 무늬를 보인다) */
  if (S.bubble === 'hidden') { S.peeked = true; S.peekUntil = S.t + R.T.PEEK_S; bubble('dots'); } }
function trayDraw(){ A.trayClear(); const t = $('tray'), p = S.p; if (!p) return; let h;
  if (p.kind === 'left') h = `<i class="w">접시에</i>${S.closed ? `<b class="done">${p.n}</b>` : '<b class="hole">?</b>'}<i class="w">개 남았어요</i>`;
  else if (p.n === 0) h = S.closed ? `<i class="w">하나도 없어요.</i><b class="done">0</b>` : `<i class="w">하나도 안 주셔도 돼요</i>`;
  else if (S.ev && S.ev.quiet && S.step === 2 && !S.closed && S.bubble !== 'dots') h = `<i class="w">… 주세요</i>`;   /* 작은 목소리: 글로도 안 보임 */
  else h = S.closed ? `<i class="w">${word(p.n)}${eulW(word(p.n))} 줬어요</i>` : `<i class="w">${word(p.n)} 주세요</i>`;
  t.innerHTML = h; t.className = 'on'; C.ask(!!S.choose); const room = innerWidth * .96; t.style.fontSize = ''; if (t.offsetWidth > room) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room / t.offsetWidth) + 'px'; }
/** 바구니 · 접시 위의 수(0 이 찍힘 · 남은 수) */
function tallyShow(n, at){ const e = $('tally'); if (n == null) { e.hidden = true; S.tallyAt = null; return; } S.tallyAt = at; e.hidden = false; e.innerHTML = (n > 0 ? C.dotsHtml(n, n) : '') + `<span>${n}</span>`; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); tallyPlace(); }
function tallyPlace(){ const e = $('tally'); if (e.hidden || !S.tallyAt) return; const q = stage.screenOf(S.tallyAt); e.style.left = q.x + 'px'; e.style.top = q.y + 'px'; }

// ── 점 카드(남은 수 — 0 은 빈 점 판 + 0)
function chooseShow(list){ S.choose = { list }; const tl = $('tell'); if (tl) tl.classList.remove('on'); C.show(list, onPick, { dots: true }); C.ask(true); }
function chooseHide(){ C.hide(); S.choose = null; }
async function onPick(k, btn){ if (S.active && S.busy && S.choose) { const r = btn.getBoundingClientRect(); H.ripple(r.left + r.width / 2, r.top + r.height / 2); return; }
  if (!S.active || S.busy || !S.choose) return; const my = S.oid; audio(); S.lastAct = S.t; H.hide(); const p = S.p, how = R.judge({ pick: k, answer: p.n }); S.log.push({ pick: k, how }); S.busy = true;
  if (how === 'fit') { tone(880, .12, 'triangle', .1); tallyShow(p.n, V(L().plate[0], TOP + .8, L().plate[1])); chooseHide(); await sleep(T.SHOW_MS); if (S.oid !== my) return; await complete(); return; }
  S.res.retreat = true; await plateShow(); if (S.oid !== my) return; C.retreat(btn); tone(240, .2, 'sine', .07); S.busy = false; S.lastAct = S.t; }
/** 아닌 수: 접시를 가까이 보여 주고 낱낱이 짚는다(없으면 아무것도 안 짚음). */
async function plateShow(){ const my = S.oid, po = S.plateObj.position, y0 = po.y, z0 = po.z, list = S.plate.slice(); await Promise.all([stage.tween(po, { y: y0 + .35, z: z0 + .35 }, 300), ...list.map(g => stage.tween(g.o.position, { y: g.o.position.y + .35, z: g.o.position.z + .35 }, 300))]);
  for (let k = 0; k < list.length; k++) { if (S.oid !== my) return; const g = list[k], yy = g.o.position.y; tone(392 * Math.pow(2, k / 6), .1, 'triangle', .09); await stage.tween(g.o.position, { y: yy + .25 }, T.COUNT_MS * .45, t => t * (2 - t)); await stage.tween(g.o.position, { y: yy }, T.COUNT_MS * .55, t => t * t); }
  if (!list.length) await sleep(500); await Promise.all([stage.tween(po, { y: y0, z: z0 }, 300), ...list.map(g => stage.tween(g.o.position, { y: g.o.position.y - .35, z: g.o.position.z - .35 }, 300))]); }

// ── 누르기
const canvas = $('c');
function goodPx(){ const a = stage.screenOf(shelfPos(0)), b = stage.screenOf(shelfPos(1)); return Math.min(T.GOOD_PX, Math.max(22, Math.hypot(a.x - b.x, a.y - b.y) * .62)); }   /* 좁은 화면은 이웃 물건을 잘못 집지 않게 반경을 줄임 */
function goodUnder(x, y, skip){ let best = null, d0 = goodPx(); for (const g of [...S.shelf.filter(g => g.where === 'shelf'), ...S.basket]) { if (g.flying || g === skip) continue; const q = stage.screenOf(g.o.position.clone().add(V(0, GOOD_H / 2, 0))), d = Math.hypot(q.x - x, q.y - y); if (d < d0) { d0 = d; best = g; } } return best; }
const bellScreen = () => stage.screenOf(S.bell.position.clone().add(V(0, .4, 0)));
canvas.addEventListener('pointerdown', e => { audio(); if (!S.ready || E.homeOpen()) return; if (!S.gestured) { S.gestured = true; if (S.active && S.p && S.p.kind === 'give' && !S.closed) TL.say(phrase(S.p)); }   /* 기기가 누르기 전의 말하기를 막았으면 첫 누름에 다시 */ S.lastAct = S.t; H.hide(); const x = e.clientX, y = e.clientY;
  if (!S.active || S.busy) { S.log.push({ ignored: S.active ? 'busy' : 'idle' }); H.ripple(x, y); return; }
  if (S.choose) { nudge(x, y); return; }
  if (S.lastTap && Math.hypot(S.lastTap.x - x, S.lastTap.y - y) < 30 && performance.now() - S.lastTap.ms < 300) { H.ripple(x, y); return; }   /* 같은 자리 두 번 누름은 하나만(옆 물건이 딸려 오지 않게) */
  S.lastTap = { x, y, ms: performance.now() };
  if (S.roll && S.roll.rolling) { const q = stage.screenOf(S.roll.g.o), d = Math.hypot(q.x - x, q.y - y), g0 = goodUnder(x, y, S.roll.g), dg = g0 ? Math.hypot(...(v => [v.x - x, v.y - y])(stage.screenOf(g0.o.position.clone().add(V(0, GOOD_H / 2, 0))))) : 1e9; if (d < 70 && d <= dg) { catchRoll(); return; } }
  if (S.p.kind === 'give') { const g = goodUnder(x, y); if (g) { if (g.where === 'shelf') { if (S.roll && S.roll.g === g) { H.ripple(x, y); bob(g); return; } toBasket(g); } else toShelf(g); S.log.push({ move: g.where, n: S.basket.length }); return; }
    if (Math.hypot(...(q => [q.x - x, q.y - y])(bellScreen())) < T.BELL_PX) { ringBell(); return; } }
  nudge(x, y); });
/** 헛누름(5-11): 물결 + 손이 누를 곳(답이 아니라 「어디를」) + 한 줄 안내 다시 · 카드가 떠 있으면 카드가 들썩. */
function nudge(x, y){ H.ripple(x, y); S.log.push({ nudge: true }); tone(520, .07, 'triangle', .05);
  if (S.choose) { const c = $('choose'); if (c.animate) c.animate([{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.1)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 450 }); return; }
  const p = S.p; let q = null; if (p.kind === 'give') { if (p.n > 0 && !S.basket.length) { const g = S.shelf.find(x => x.where === 'shelf' && !x.flying); if (g) q = stage.screenOf(g.o.position.clone().add(V(0, GOOD_H / 2, 0))); } else q = bellScreen(); }   /* 바구니가 비었으면 물건 · 아니면 종(맞는지는 종이 알려 준다) */
  if (q) H.show(q.x, q.y); if (H.tell('serve.nudge', firstLine(), { times: 1e9 })) tellLow(); }
function tellUnderCards(){ const tl = $('tell'), c = $('choose'); if (!tl || !c) return; const r = c.getBoundingClientRect(); tl.style.bottom = ''; tl.style.top = (r.bottom + 14) + 'px'; }   /* 남은 수: 카드를 가리지 않게 카드 아래 */
function tellLow(){ const tl = $('tell'); if (!tl) return; if (S.tall) { tl.style.bottom = ''; return; } tl.style.top = 'auto'; tl.style.bottom = 'calc(40px + env(safe-area-inset-bottom,0px))'; }
/** 종 = 「여기요」: 바구니를 건넨다 → 딱 맞음 · 모자람(「더 줘」) · 많음(돌려보냄). 0 주문에 무언가 담겼으면 고개를 젓고 돌려보냄. */
async function ringBell(){ const my = S.oid; S.lastAct = S.t; bellSwing(); const p = S.p; if (S.basket.some(g => g.flying)) { S.pendingBell = true; return; }
  const n = S.basket.length, how = R.judge(n, p.n); S.log.push({ bell: how, n, order: p.n }); S.busy = true; [784, 1046].forEach((f, i) => tone(f * (1 + .06 * Math.min(S.streak, 3)), .3, 'sine', .08, i * .1));
  if (S.ev.quiet || S.bubble === 'hidden') bubble('dots');   /* 작은 목소리 · 가려진 주문: 건넨 뒤에 점 무늬가 뜨며 확인 */
  if (how === 'fit') { await complete(); return; }
  if (how === 'short') { S.res.short = true; S.clock = Math.min(S.clock, .5); await guestCounts(S.basket.slice()); if (S.oid !== my) return; bubble('more'); stage.play(S.guest, 'Wave'); tone(330, .15, 'triangle', .08); await sleep(1000); if (S.oid !== my) return; bubble(S.step === 2 && !S.ev.quiet && !S.peeked && S.t > S.peekUntil ? 'hidden' : 'dots'); stage.play(S.guest, 'Idle'); S.busy = false; S.lastAct = S.t; return; }
  S.res.over = true; if (p.n === 0) { stage.play(S.guest, 'No', true); bubble('no'); await sleep(500); } else await guestCounts(S.basket.slice(0, p.n));
  if (S.oid !== my) return; for (const g of S.basket.slice(p.n).reverse()) { await toShelf(g, T.FLY_MS * 1.2); if (S.oid !== my) return; await sleep(80); }
  bubble('dots'); await complete(); }
/** 손님이 바구니를 들여다보며 하나씩 짚어 센다(물건이 하나씩 톡). */
async function guestCounts(list){ const my = S.oid; for (let k = 0; k < list.length; k++) { if (S.oid !== my) return; const g = list[k], y0 = g.o.position.y; tone(392 * Math.pow(2, k / 6), .1, 'triangle', .09); await stage.tween(g.o.position, { y: y0 + .25 }, T.COUNT_MS * .45, t => t * (2 - t)); await stage.tween(g.o.position, { y: y0 }, T.COUNT_MS * .55, t => t * t); } if (!list.length) await sleep(400); }
function bob(g){ const y0 = g.o.position.y; stage.tween(g.o.position, { y: y0 + .15 }, 120).then(() => stage.tween(g.o.position, { y: y0 }, 150)); }
function bellSwing(){ const o = S.bell; if (stage.tweens.some(w => w.o === o.rotation)) return; stage.tween(o.rotation, { z: .28 }, 110).then(() => stage.tween(o.rotation, { z: -.22 }, 150)).then(() => stage.tween(o.rotation, { z: .1 }, 130)).then(() => stage.tween(o.rotation, { z: 0 }, 150)); }

// ── 굴러가는 물건: 진열대의 하나가 앞 끝으로 굴러 떨어지려 함 → 눌러 잡는다(놓치면 떨어졌다가 굴러 돌아옴 — 개수 그대로)
function rollStart(){ const c = S.shelf.filter(g => g.where === 'shelf' && !g.flying); if (!c.length || !S.active) return; const g = c[Math.floor(Math.random() * c.length)]; S.roll = { g, t0: S.t, rolling: true, home: g.o.position.clone() }; S.log.push({ roll: 'start' }); tone(180, .4, 'sine', .07, 0, 120); }
function catchRoll(){ const r = S.roll; if (!r) return; r.rolling = false; S.log.push({ roll: 'caught' }); tone(740, .1, 'triangle', .08); r.g.o.rotation.x = 0; flyTo(r.g.o, shelfPos(r.g.spot), 260).then(() => { if (S.roll === r) S.roll = null; }); }
async function rollFall(){ const r = S.roll; r.rolling = false; S.log.push({ roll: 'fell' }); tone(200, .3, 'sine', .08, 0, 90); await stage.tween(r.g.o.position, { y: T.DECK, z: T.CZ + .75 }, 380); await sleep(1300); if (S.roll !== r) return; r.g.o.rotation.x = 0; await flyTo(r.g.o, shelfPos(r.g.spot), 520); if (S.roll === r) S.roll = null; }

// ── 한 문제의 시작 · 끝
function clearGoods(){ for (const g of [...S.shelf, ...S.plate]) g.o.parent && g.o.parent.remove(g.o); S.shelf = []; S.basket = []; S.plate = []; S.ghosts.forEach(o => { o.visible = false; }); S.roll = null; }
function firstLine(){ const p = S.p; if (!p) return ''; if (p.kind === 'left') return '접시에 몇 개 남았을까? 카드를 눌러 줘.'; if (p.n === 0) return '하나도 안 줘도 될 때는 빈 바구니 그대로 종을 눌러 줘.'; return '손님이 말한 만큼 물건을 눌러 담고 종을 눌러 줘.'; }
async function runProblem(p, ctx){ const my = S.oid; if (S.forceP && S.forceP.length) p = S.forceP.shift();   /* 하네스용: 문제를 정해 줌 */
  chooseHide(); tallyShow(null); clearGoods(); S.p = p; S.step = ctx.step; S.ev = ctx.ev; S.res = { short: false, over: false, retreat: false, hinted: false, missed: false }; S.closed = false; S.clock = 0; S.busy = true; S.peeked = false; S.peekUntil = 0; S.pendingBell = false;
  const fast = 1 + R.T.REGULAR_FAST * Math.min(S.streak, 3) * 2 + (ctx.hurry ? .8 : 0);
  S.basketObj.root.visible = p.kind === 'give'; S.plateObj.visible = p.kind === 'left';
  if (p.kind === 'give') { for (let k = 0; k < R.shelfN(); k++) { const o = goodObj(), g = { o, where: 'shelf', spot: k, bspot: -1 }; o.position.copy(shelfPos(k)); o.rotation.y = (k % 3) * .3; S.shelf.push(g); }
    for (let k = 0; k < p.pre; k++) { const o = goodObj(), g = { o, where: 'basket', spot: -1, bspot: k, pre: true }; o.position.copy(basketPos(k)); S.shelf.push(g); S.basket.push(g); } }
  else { for (let k = 0; k < p.start; k++) { const o = goodObj(), g = { o, where: 'plate' }; o.position.copy(platePos(k, p.start)); S.plate.push(g); } }
  ghostsDraw(); trayDraw(); bubble('off'); E.marbles(ctx.j, 3, 0);
  /* 손님 들어옴(줄의 맨 앞이 앞자리로) */
  const gu = S.queue.shift(); S.guest = gu; if (ctx.surprise) glowGuest(gu, true); tone(262 * fast, .3, 'sine', .06);
  await Promise.all([walk(gu, L().front, fast), ...S.queue.map((q, k) => walk(q, L().queue[k], fast))]); if (S.oid !== my) return { abort: true };
  if (p.kind === 'give') { TL.say(phrase(p)); bubble(S.ev.quiet && S.step === 2 ? 'hidden' : 'dots'); if (S.step === 2 && !S.ev.quiet) S.peekUntil = S.t + R.T.PEEK_S; }
  else { /* 손님이 접시의 것을 하나씩 먹는다 */ for (let k = 0; k < R.eats(p); k++) { await sleep(T.EAT_MS * .5); if (S.oid !== my) return { abort: true }; const g = S.plate.pop(); tone(300 + k * 60, .12, 'triangle', .08); stage.play(gu, 'Yes', true); await flyTo(g.o, gu.obj.position.clone().add(V(0, 1, .1)), 360); await stage.tween(g.o.scale, { x: .01, y: .01, z: .01 }, 180); g.o.parent && g.o.parent.remove(g.o); }
    S.plate.forEach((g, k) => flyTo(g.o, platePos(k, S.plate.length), 240)); await sleep(400); if (S.oid !== my) return { abort: true }; TL.say(phrase(p)); chooseShow(R.cards(p.n)); }
  S.log.push({ start: R.key(p), step: S.step, pre: p.pre || 0, ev: Object.keys(S.ev).filter(k => S.ev[k] === true).join(' ') });
  const firstLeft = p.kind === 'left' && !S.leftTold; if (firstLeft) S.leftTold = true;
  const told = ((ctx.j === 0 && ctx.firstStep) || firstLeft) && H.tell('serve.' + S.cell + p.kind, firstLine(), TELLS()); if (told) { if (S.choose) tellUnderCards(); else tellLow(); }
  if (ctx.roll) S.rollAt = S.t + T.ROLL_AT[0] + Math.random() * (T.ROLL_AT[1] - T.ROLL_AT[0]); else S.rollAt = Infinity;
  S.active = true; S.busy = false; S.lastAct = S.t + (told ? T.TELL_GRACE : T.SAY_GRACE);   /* 주문을 듣는 동안은 길잡이 손 시계를 늦춘다 */
  const out = await new Promise(res => { S.done = res; }); S.active = false; S.done = null; chooseHide(); H.hide();
  const r = { ...S.res, clean: R.clean(S.res), out, p }; S.log.push({ problem: R.key(p), kind: p.kind, n: p.n, step: S.step, ...r, p: undefined }); return r; }
/** 해냈다: 띠가 닫히고 · 손님이 춤추고 동전을 놓고 감(0 이면 바구니 위에 0 이 찍힘) · 깜짝 손님은 깨끗할 때만 덤. */
async function complete(){ if (!S.active || S.closed) return; const my = S.oid; S.busy = true; S.closed = true; trayDraw(); const p = S.p, cleanNow = R.clean(S.res), gu = S.guest;
  if (S.roll) { const r = S.roll; r.rolling = false; S.roll = null; for (let k = stage.tweens.length - 1; k >= 0; k--) if (stage.tweens[k].o === r.g.o.position) stage.tweens.splice(k, 1); r.g.o.rotation.x = 0; r.g.o.position.copy(shelfPos(r.g.spot)); }
  [523, 659, 784].forEach((f, i) => tone(f * (1 + .06 * Math.min(S.streak, 3)), .12, 'triangle', .1, i * .07));
  if (p.kind === 'give' && p.n === 0) tallyShow(0, S.basketObj.root.position.clone().add(V(0, .75, 0)));
  if (S.step === 2) { if (cleanNow) { S.streak++; if (S.streak % R.T.STREAK === 0) { confetti(18); S.queue.forEach(q => stage.play(q, 'Yes', true)); [784, 988, 1175, 1568].forEach((f, i) => tone(f, .18, 'triangle', .1, .25 + i * .09)); S.log.push({ clap: S.streak }); }
      if (p.kind === 'give' && p.n > 0 && !S.peeked && !S.ev.quiet) { S.noPeek++; if (S.noPeek % R.T.NOPEEK_RUN === 0) { wallet.earn(R.T.NOPEEK_COINS, 'serve'); S.log.push({ nopeek: S.noPeek }); } } else if (S.peeked) S.noPeek = 0; } else { S.streak = 0; S.noPeek = 0; } }
  stage.play(gu, 'Jump', true); if (gu.glow) { if (cleanNow) { await sleep(300); if (S.oid !== my) return; glowGuest(gu, false); confetti(12); tone(1319, .2, 'triangle', .1); wallet.earn(R.T.SURPRISE_COINS, 'serve'); S.surpriseCarry = false; S.log.push({ surpriseOpen: true }); } else S.surpriseCarry = true; }
  wallet.earn(R.T.COIN_PER, 'serve'); coinsDraw(true); S.outGuests++;
  await sleep(700); if (S.oid !== my) return;
  if (p.kind === 'give') for (const g of S.basket.slice()) { flyTo(g.o, gu.obj.position.clone().add(V(0, .9, 0)), 400).then(() => { g.o.visible = false; }); }   /* 바구니의 것을 손님에게 */
  await sleep(450); if (S.oid !== my) return; bubble('off'); tallyShow(null); await walk(gu, L().exit, 1.3); if (S.oid !== my) return; dropGuest(gu); S.guest = null; S.done && S.done('sent'); }
/** 기다리다 손님이 그냥 간다 — 그 주문은 문제 둘 뒤에 다른 손님이 다시(표시 · 벌 없음). */
async function miss(){ if (!S.active || S.busy) return; const my = S.oid; S.busy = true; S.res.missed = true; S.streak = 0; chooseHide(); S.log.push({ missed: true }); [880, 660].forEach((f, i) => tone(f, .3, 'sine', .08, i * .3));
  if (S.guest && S.guest.glow) S.surpriseCarry = true; const gu = S.guest; bubble('off'); stage.play(gu, 'No', true); await sleep(400); if (S.oid !== my) return;
  for (const g of S.basket.slice()) if (!g.pre) toShelf(g, 300); await walk(gu, L().exit, 1.1); if (S.oid !== my) return; dropGuest(gu); S.guest = null; S.done && S.done('missed'); }

// ── 나들이(판 셋) · 판(문제 셋)
const TELLS = () => ({ times: M.passed(M.get(S.cell || '')) ? 2 : 1e9 });
async function outing(id){ const my = ++S.oid; E.showBar(true); S.cell = id; S.streak = 0; S.noPeek = 0; S.outGuests = 0; S.leftTold = false; const day = M.dayKey(); let prevStep = 0;
  let rec = M.get(id); S.back = M.stuckNow(rec) && !!rec.hand;
  let q = R.deal(id, S.hist[id] || [], Math.random, { small: M.stuck(rec) >= 1 }); S.q = q; E.lanterns(0); S.log.push({ outing: id, deal: q.map(R.key) });
  for (let b = 0; b < R.T.BOARDS; b++) { rec = M.get(id); const hand = !rec.hand || S.back;
    let ev = R.events(rec.evBoards, Math.random, { passed: M.passed(rec), calm: CALM, hand, voiced: TL.voiced() }); if (S.forceEv) { ev = { ...ev, ...S.forceEv }; S.forceEv = null; } if (S.surpriseCarry && !hand) ev.surprise = true;
    if (hand) { q = R.handFix(q, b * R.T.PER_BOARD); S.q = q; }   /* 걸음 ① 판은 주문만 */
    const surpJ = !ev.surprise ? -1 : ev.surpJ != null ? ev.surpJ : Math.floor(Math.random() * 3), rollJ = !ev.roll ? -1 : Math.floor(Math.random() * 3), hurryJ = !ev.hurry ? -1 : Math.floor(Math.random() * 3);
    S.board = { b, hand, ev }; S.log.push({ board: b, hand, ev: Object.keys(ev).filter(k => ev[k] === true).join(' ') });
    S.queue = [0, 1, 2].map(j => makeGuest(b * 3 + j, { captain: b === R.T.BOARDS - 1 && j === R.T.PER_BOARD - 1 })); S.queue.forEach((g, k) => { if (k) { g.obj.position.set(L().queue[Math.min(k - 1, 1)][0] + 2, T.DECK, L().queue[Math.min(k - 1, 1)][1]); } });
    await Promise.all(S.queue.slice(1).map((g, k) => walk(g, L().queue[k]))); if (S.oid !== my) return;
    const results = []; E.marbles(0);
    for (let j = 0; j < R.T.PER_BOARD; j++) { const i = b * R.T.PER_BOARD + j, r = await runProblem(q[i], { step: hand ? 1 : 2, ev: { ...ev, hurry: j === hurryJ, wait: ev.wait || j === hurryJ }, board: b, j, surprise: j === surpJ, roll: j === rollJ, hurry: j === hurryJ, firstStep: b === 0 || (hand ? 1 : 2) !== prevStep });
      if (S.oid !== my || r.abort) return; results.push(r); E.marbles(j + 1); if (!r.clean) q = R.requeue(q, i); S.q = q; }
    prevStep = hand ? 1 : 2;
    const before = rec; rec = M.record(rec, results, day, { counts: !hand, hand, ev: !hand && !ev.none }); if (hand) S.back = false; else if (M.stuckNow(rec)) S.back = true; M.put(id, rec); S.log.push({ boardEnd: b, clean: M.clean(results), rec: { ...rec } });
    await E.fly($('marbles'), $('coins'), art('coin'), results.filter(r => r.out === 'sent').length); if (S.oid !== my) return; E.lanterns(b + 1); tone(660, .15, 'triangle', .1); tone(990, .2, 'triangle', .1, .12);
    if (!M.passed(before) && M.passed(rec)) { grew(art(ICON.flag) + ' 깃발을 땄어요!'); await sleep(2400); } else if (!M.kept(before) && M.kept(rec)) { grew(art(ICON.star) + ' 깃발에 별이 붙었어요!'); await sleep(2400); }
    if (S.oid !== my) return; await sleep(400); if (S.oid !== my) return; }
  S.hist[id] = q; S.p = null; A.trayClear(); clearGoods(); S.basketObj.root.visible = true; S.plateObj.visible = false; bubble('off');
  const items = Array.from({ length: S.outGuests }, (_, k) => art(ICON.guests[k % ICON.guests.length])); const choice = await E.home({ items }); if (S.oid !== my) return;
  if (choice === 'again') outing(id); else location.href = GO; }
/** 하네스 · 교사용: 지금 나들이를 거둔다. */
function abort(){ S.oid++; S.active = false; if (S.done) { const d = S.done; S.done = null; d('abort'); } stage.tweens.length = 0; chooseHide(); tallyShow(null); clearGoods(); bubble('off'); for (const g of S.guests.slice()) dropGuest(g); S.queue = []; S.guest = null; S.busy = false; S.pendingBell = false; TL.stop(); H.hide(); const hm = document.getElementById('home'); if (hm) hm.classList.remove('on'); S.plateObj.position.set(L().plate[0], TOP + .02, L().plate[1]); }

// ── 한 장면의 일
stage.frame((dt, t) => { S.t = t; if (!S.ready) return; tallyPlace(); bubblePlace(); if (S.choose) C.place();
  if (S.active && !S.busy && S.bubble === 'dots' && S.step === 2 && S.p && S.p.kind === 'give' && !S.closed && S.peekUntil && t > S.peekUntil) bubble('hidden');   /* 걸음 ②: 점 무늬는 잠깐만 */
  if (S.pendingBell && S.active && !S.busy && !S.basket.some(g => g.flying)) { S.pendingBell = false; ringBell(); }
  const thinking = S.active && !S.busy && !S.closed && !S.pendingBell;
  if (thinking && S.step === 1 && S.p && S.p.kind === 'give' && S.p.n > 0 && S.basket.length === S.p.n && !S.basket.some(g => g.flying) && t - (S.wob || 0) > 1.3) { S.wob = t; bellSwing(); }   /* 걸음 ①: 자리가 다 차면 종이 흔들린다(깨끗함에 안 셈) */
  /* 기다리는 줄: 생각하는 동안에만 · 뒤 손님이 발을 구르고 지금 손님 말풍선이 흔들림 · 끝이 가까우면 문 종소리 */
  if (thinking && S.ev.wait && S.step === 2 && !CALM && !S.choose) {   /* 카드를 고르는 동안은 기다려 준다(길잡이 손보다 먼저 가 버리지 않게) */ S.clock = Math.min(1, S.clock + dt / R.waitS(S.board ? S.board.b : 0, S.ev.hurry));
    if (S.clock > .5 && t - (S.stomp || 0) > 1.6 - S.clock) { S.stomp = t; const q = S.queue[0]; if (q) stage.play(q, 'No', true); const o = $('order'); o.classList.remove('shake'); void o.offsetWidth; o.classList.add('shake'); }
    if (S.clock > .8 && t - (S.chime || 0) > .3 + (1 - S.clock) * 2.2) { S.chime = t; tone(1046, .12, 'sine', .07); }
    if (S.clock >= 1) miss(); }
  if (thinking && S.rollAt < t && !S.roll) { S.rollAt = Infinity; rollStart(); }
  const r = S.roll; if (r && r.rolling) { const k = (t - r.t0) / T.ROLL_S; r.g.o.position.set(r.home.x + Math.sin(k * 9) * .05, TOP, r.home.z + (T.CZ + .45 - r.home.z) * Math.min(1, k)); r.g.o.rotation.x = k * 6; if (k >= 1 && S.active) rollFall(); }
  /* 길잡이 손: 가만히 있으면 다음에 누를 곳(뜨면 그 문제는 깨끗하지 않음) */
  const wait = S.choose ? R.T.HINT_PICK : R.T.HINT_AFTER * (M.stuck(M.get(S.cell || '')) >= 1 ? .5 : 1);
  if (thinking && t - S.lastAct > wait && !H.shown()) { const q = hintAt(); if (q) { H.show(q.x, q.y); S.res.hinted = true; S.log.push({ hinted: true }); } } });
/** 길잡이(답까지): 모자라면 진열대의 물건 · 많으면 바구니의 물건 · 딱이면 종 · 카드면 맞는 카드. */
function hintAt(){ const p = S.p; if (!p) return null; if (S.choose) { const b = $('choose').querySelector(`button[data-n="${p.n}"]`); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 10 }; }
  if (p.kind !== 'give') return null; const n = S.basket.length, at = g => stage.screenOf(g.o.position.clone().add(V(0, GOOD_H / 2, 0)));
  if (n < p.n) { const g = S.shelf.find(x => x.where === 'shelf' && !x.flying && !(S.roll && S.roll.g === x)); return g ? at(g) : null; } if (n > p.n) return at(S.basket[S.basket.length - 1]); return bellScreen(); }

window.__serve = { S, R, M, E, T, TL, stage, wallet, outing, abort, ringBell,
  shelfAt: () => { const g = S.shelf.find(x => x.where === 'shelf' && !x.flying && !(S.roll && S.roll.g === x)); return g ? stage.screenOf(g.o.position.clone().add(V(0, GOOD_H / 2, 0))) : null; },
  basketAt: k => { const g = S.basket[k == null ? S.basket.length - 1 : k]; return g ? stage.screenOf(g.o.position.clone().add(V(0, GOOD_H / 2, 0))) : null; },
  bellAt: () => bellScreen(), bubbleAt: () => { const r = $('order').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, nB: () => S.basket.length, nShelf: () => S.shelf.filter(g => g.where === 'shelf').length, nPlate: () => S.plate.length };
if (!GO_NOW) build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
