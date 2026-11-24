/* 견주기 틀 「저울에 올려 보기」(3D, T07) — 장터 마당의 시소 저울 앞에 숫자 꼬리표가 달린 자루가 놓여 있다. 손님이 「더 큰 수는?」 하고 물으면 자루 하나를 찍는다.
 * 자루들이 저울에 올라가 속의 상자가 하나씩 짝지어 쏟아지고, 큰 쪽으로 저울이 쿵 기운다. 맞게 찍었으면 손님이 그 자루를 싣고 간다.
 * 설계: 핸드오프 kedu/math-play-work/T07_견주기_틀.md · 정본 kmotion/math-wizard/27_수학놀이터_내용지도와_틀_설계_v1.md(4 · 5절 · 5-9 · 5-10 · 5-11). 규칙 = ./rules.js(화면 없음).
 * 한 나들이 = 낱칸 하나(A13 두 수 비교 · A14 세 수 비교) · 판 = 문제 셋 · 나들이 = 판 셋. 손: 자루를 누른다 — 그것뿐(끌지 않는다 · 종도 없다 · 한 문제 = 한 번 찍기).
 * 걸음 ① 올려 보고 고르기(누른 자루가 저울에 올라감 · 다 올린 뒤 손님이 물음 · 통과에 안 셈) → 걸음 ② 먼저 찍고 올려 보기(손님이 바로 물음 · 누른 자루가 내 답 → 저울이 확인).
 * 물음은 손님으로 갈린다: 「더 큰 · 가장 큰」 = 헨리(큰 배 · 굵은 목소리) · 「더 작은 · 가장 작은」 = 앤(작은 나룻배 · 「내 배는 작아」). 말풍선과 띠는 같은 말이다.
 * 사건(rules.js events): 새는 모래 자루(시계 · 생각하는 동안에만) · 가려진 자루 · 자루 노리는 여우 · 깜짝 자루 · 뚱뚱한 자루(통과 뒤) · 쿵쿵 가락. 사건은 수를 바꾸지 않는다.
 * 누름에는 늘 답이 있다(5-11). 소리는 common/tell.js — 없으면 조용히 넘어간다(물음은 띠 + 손님으로 읽힌다). 그림은 기성 3D 재료만(./assets · 이름표 ./art.js) — 코드로 그린 것은 땅(풀밭 평면 — 바다 평면과 같은 무대 바닥)뿐이고, 꼬리표 · 천 · 모래 알갱이 · 깃발은 화면 위 그림. */
import { createStage, THREE, CALM, sleep } from '../common/stage3d.js?v=2';
import { clone as cloneRig } from 'three/addons/utils/SkeletonUtils.js';
import * as A from '../common/ask.js?v=2';
import * as H from '../common/hint.js?v=5';
import { wallet, audio, tone, confetti, grew } from '../common/kit.js?v=8';
import { art } from '../common/art.js?v=9';
import * as E from '../common/ends.js?v=1';
import * as M from '../common/map.js?v=7';
import * as TL from '../common/tell.js?v=2';
import * as NS from '../common/numsign.js?v=3';
import { eun } from '../common/say.js?v=3';
import * as R from './rules.js?v=1';
import { ASSETS, MODEL, WATCHERS, SCENERY, SCENERY_NAMES, GRASS, GLOW, ICON } from './art.js?v=1';

// ── 내가 정한 수치(화면 · 움직임 — 준호가 보고 바꾼다). 문제 · 사건 · 시계 수치는 ./rules.js 의 T
const T = { PIV_L: .9, BEAM_L: 3.25, BEAM_T: .19, HALF: 1.27, TILT: .2, TILT1: .065, PAN_D: 1.48, PED_H: 1.3, PED_Z: -1.7, SACK_W: .74, SACK_H: .3, SIDE_H: .36, SIDE_Z: 2.25, SIDE_X: 1.27, BOX: .18, BOX_DX: .215, BOX_Z: [.15, -.1],
  SACK_SPOT: [.33, -.4], GUEST_H: .95, FOX_H: .62, WATCH_H: .8, BOAT: { henry: 2.2, anne: 1.25 }, BIG: 1.35,
  WIDE: { guest: [2.75, .85], sand: [-2.75, .45], shore: 3.95, moor: { henry: [4.95, -.35], anne: [4.75, 1.15] }, fox: [-8.5, -2.0], watch: [[-4.3, 1.9, .9], [-5.3, -1.4, 2.2], [2.4, -3.0, -1.6]], fov: 34, elev: .85, tilt: 1.0, num: 96 },
  TALL: { guest: [1.5, 3.65], sand: [-1.55, 3.45], shore: 2.45, moor: { henry: [3.4, 3.0], anne: [3.25, 4.3] }, fox: [-5.5, -2.0], watch: [[-.2, 4.2, .4], [2.3, -3.6, 2.2], [-2.3, -3.4, -1.6]], fov: 46, elev: 1.25, tilt: .78, num: 74, num3: 66 },
  LOW: null, LOW_NUM: 50, HOP_MS: 380, DROP_MS: 360, BOAT_MS: 900, WALK_MS: 750, LOAD_MS: 650, SIDE_MS: 520, BACK_MS: 520, POUR1: .7, TELL_GRACE: 4, STOMP_AT: .82 };
T.LOW = { ...T.WIDE, elev: .5, fov: 30 };   /* 낮은 가로(전화기를 눕힘): 조금 더 앞에서 본다(세로 몫을 아낀다) */
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const GO = '/math/play/go/';
const WANT = Q.get('cell'), GO_NOW = !WANT || !R.CELLS[WANT];   /* ?cell= 없이 열리면 모형을 불러오기 전에 고르는 화면으로 */
if (GO_NOW) location.replace(GO);
const S = { ready: false, busy: true, active: false, t: 0, oid: 0, cell: null, p: null, res: null, step: 2, ev: {}, ctx: {}, board: null, clock: 0, sandS: 12, streak: 0, closed: false, lastAct: 0, back: false, surpriseCarry: false, hist: {}, log: [],
  tall: false, low: false, phase: 'idle', out: [], cover: -1, revealing: false, revealT: 0, fox: null, foxAt: Infinity, stompAt: 0, who: null, today: [], hinting: false, hintAt: 0, asked: {} };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 170, fog: [22, 70], shadow: { left: -8, right: 8, top: 6, bottom: -5 }, assets: ASSETS }), { scene, camera } = stage;
const K = {};
const NAMES = [...new Set([...Object.values(MODEL), ...WATCHERS, ...SCENERY_NAMES])];
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const L = () => S.tall ? T.TALL : S.low ? T.LOW : T.WIDE;
const easeOut = t => 1 - (1 - t) ** 3, easeIn = t => t * t * t;
const easeBack = t => { const c = 2.1; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };   /* 쿵 — 넘었다가 돌아와 멎는다 */
const K3 = () => (S.p ? S.p.nums.length : 2);

// ── 놓기
/** 키 h 로 맞춰 바닥 가운데에(사람이 아닌 것). */
function fitH(g, h, ry = 0){ const o = cloneRig(g.scene); o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o), s = h / Math.max(.0001, b.max.y - b.min.y); o.scale.multiplyScalar(s); o.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(o), c = b2.getCenter(V()); o.position.sub(V(c.x, b2.min.y, c.z)); const w = new THREE.Group(); w.add(o); w.rotation.y = ry; stage.shadows(w); return w; }
/** 긴 가로 축을 z 로 돌려 길이 len(배). */
function fitLen(g, len, sink = 0){ const o = cloneRig(g.scene); o.updateMatrixWorld(true); let b = new THREE.Box3().setFromObject(o), s0 = b.getSize(V()); const w = new THREE.Group(), inner = new THREE.Group(); inner.add(o);
  if (s0.x > s0.z) inner.rotation.y = Math.PI / 2; w.add(inner); w.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(w); s0 = b.getSize(V()); inner.scale.multiplyScalar(len / Math.max(.0001, s0.z)); w.updateMatrixWorld(true);
  b = new THREE.Box3().setFromObject(w); const c = b.getCenter(V()); inner.position.sub(V(c.x, b.min.y + (b.max.y - b.min.y) * sink, c.z)); stage.shadows(w); return w; }
/** 판자: 기둥(세운 모형)을 눕혀 x 축으로 길이 len · 굵기 th. */
function plank(g, len, th){ const o = g.scene.clone(), inner = new THREE.Group(), w = new THREE.Group(); inner.add(o); inner.rotation.z = Math.PI / 2; w.add(inner); w.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(w), s = b.getSize(V());
  inner.scale.set(th / Math.max(.0001, s.y), len / Math.max(.0001, s.x), th / Math.max(.0001, s.z)); w.updateMatrixWorld(true); const b2 = new THREE.Box3().setFromObject(w), c = b2.getCenter(V()); inner.position.sub(c); stage.shadows(w); return w; }
/** 통을 눕혀(높이 축을 z 로) 길이 len · 땅에 앉게. */
function lying(g, len){ const o = g.scene.clone(), inner = new THREE.Group(), w = new THREE.Group(); inner.add(o); inner.rotation.x = Math.PI / 2; w.add(inner); w.updateMatrixWorld(true); let b = new THREE.Box3().setFromObject(w); inner.scale.multiplyScalar(len / Math.max(.0001, b.max.z - b.min.z)); w.updateMatrixWorld(true);
  b = new THREE.Box3().setFromObject(w); const c = b.getCenter(V()); inner.position.sub(V(c.x, b.min.y, c.z)); stage.shadows(w); return w; }
/** 너비 wd 로 맞춰(자루 — 누운 자루라 너비로 잰다). */
function fitW(g, wd){ const o = g.scene.clone(); o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o), s = wd / Math.max(.0001, b.max.x - b.min.x); o.scale.multiplyScalar(s); o.updateMatrixWorld(true); const b2 = new THREE.Box3().setFromObject(o), c = b2.getCenter(V()); o.position.sub(V(c.x, b2.min.y, c.z)); const w = new THREE.Group(); w.add(o); stage.shadows(w); return w; }
const rigH = rig => { rig.scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(rig.scene); return Math.max(.0001, b.max.y - b.min.y); };
const actOf = (p, base) => Object.keys(p.acts).find(k => k === base || k.endsWith('|' + base)) || null;
const actPlay = (p, base, once) => { const n = actOf(p, base); if (n) stage.play(p, n, once); };
const glowMats = o => { const ms = []; o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(GLOW); m.material.emissiveIntensity = 0; ms.push(m.material); } }); return ms; };

// ── 짓기
let pivot = null, beam = null, field = null, sandPole = null, sandBag = null, fox = null, dock = null; const peds = [], stands = [], plates = [], sacks = [], BOX = [], watchers = [], scen = { WIDE: [], TALL: [] }, guests = {}, boats = {};
let PIV_Y = .7;
async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); }));
  /* 땅(풀밭) — 바다 평면과 같은 무대 바닥(물은 손님 배가 닿는 오른쪽 끝에만) */
  field = new THREE.Mesh(new THREE.PlaneGeometry(220, 140).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: GRASS, roughness: .95, flatShading: true })); field.receiveShadow = true; field.position.y = .02; scene.add(field);
  /* 시소 저울: 받침(통 눕힘) · 판자(기둥 눕힘) */
  pivot = lying(K[MODEL.pivot], T.PIV_L); scene.add(pivot); PIV_Y = new THREE.Box3().setFromObject(pivot).max.y + T.BEAM_T / 2 - .03;
  beam = new THREE.Group(); beam.position.set(0, PIV_Y, 0); beam.add(plank(K[MODEL.beam], T.BEAM_L, T.BEAM_T)); scene.add(beam);
  for (let k = 0; k < 3; k++) { const o = fitH(K[MODEL.stand], T.PED_H); o.visible = false; scene.add(o); peds.push(o); }
  for (const sd of ['L', 'R']) { const o = fitH(K[MODEL.side], T.SIDE_H, sd === 'L' ? .4 : 2); o.position.set((sd === 'L' ? -1 : 1) * T.SIDE_X, 0, T.SIDE_Z); o.visible = false; scene.add(o); stands.push(o); }
  for (let k = 0; k < 3; k++) plates.push(plateObj(k));
  for (let k = 0; k < 3; k++) sacks.push(sackObj(k));
  for (let k = 0; k < 30; k++) BOX.push(boxObj());
  /* 손님 · 배 */
  for (const who of ['henry', 'anne']) { const rig = K[MODEL[who]]; const p = stage.person(rig, { scale: T.GUEST_H / rigH(rig) }); p.obj.visible = false; actPlay(p, 'Idle'); guests[who] = p;
    const g = new THREE.Group(), body = fitLen(K[who === 'henry' ? MODEL.ship : MODEL.rowboat], T.BOAT[who], .12); g.add(body); const load = fitH(K[MODEL.load], .5); load.position.set(0, who === 'henry' ? .55 : .22, 0); load.visible = false; g.add(load); g.visible = false; scene.add(g); boats[who] = { g, body, load, n: 0 }; }
  dock = fitLen(K[MODEL.dock], 1.25, 0); dock.rotation.y = -Math.PI / 2; scene.add(dock);
  /* 모래 자루(시계): 말뚝에 건 자루 — 위를 축으로 홀쭉해진다 */
  sandPole = fitH(K[MODEL.pole], 1.75); scene.add(sandPole); sandBag = new THREE.Group(); { const b = fitW(K[MODEL.sack], .46), w = new THREE.Group(); b.rotation.z = Math.PI / 2; w.add(b); w.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(w), c = bb.getCenter(V()); b.position.sub(V(c.x, bb.max.y, c.z)); sandBag.add(w); }   /* 자루를 세워 위 끝을 말뚝에 매단다 */ scene.add(sandBag); sandPole.visible = sandBag.visible = false;
  /* 여우 · 구경꾼 */
  fox = stage.person(K[MODEL.fox], { scale: T.FOX_H / rigH(K[MODEL.fox]) }); fox.obj.visible = false;
  for (const n of WATCHERS) { const p = stage.person(K[n], { scale: T.WATCH_H / rigH(K[n]) }); actPlay(p, 'Idle'); watchers.push(p); }
  /* 마당 꾸밈(가로 · 세로 따로 짓고 화면에 맞는 쪽만) */
  for (const kd of ['WIDE', 'TALL']) for (const [n, x, z, h, ry] of SCENERY[kd]) { const o = fitH(K[n], h, ry); o.position.set(x, 0, z); o.visible = false; scene.add(o); scen[kd].push(o); }
  const c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); coinsDraw(); wallet.onChange(() => coinsDraw());
  for (const id of ['cloth', 'bubble', 'sand']) { const d = document.createElement('div'); d.id = id; document.body.appendChild(d); } $('bubble').hidden = true; $('sand').innerHTML = '<i></i><i></i><i></i><i></i>';
  stage.onResize = aim; stage.resize();
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
  TL.button(on => { S.log.push({ sound: on }); });
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true;
  outing(WANT); }
function coinsDraw(pop){ const c = $('coins'); if (!c) return; const v = `${art(ICON.coin)}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; } if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }

/** 접시: Plate_1(크게) — 저울 양 끝(L · R)에 앉거나 옆 받침대(SL · SR)로 내려와 앉는다. 늘 평평하다(기운 저울에서도 상자가 미끄러지지 않게). */
function plateObj(i){ const g = new THREE.Group(), body = fitLen(K[MODEL.pan], T.PAN_D, 0), load = new THREE.Group(); const sz = new THREE.Box3().setFromObject(body).getSize(V()); if (sz.x < T.PAN_D * .9) body.scale.x *= T.PAN_D / Math.max(.01, sz.x);
  g.add(body, load); g.visible = false; scene.add(g); const top = new THREE.Box3().setFromObject(body).max.y; return { i, g, body, load, top, mats: glowMats(body), at: 'hide', side: 'L', sack: null, owner: null, boxes: [], glow: false }; }
/** 자루: Bag(크기는 모두 같다) + 숫자 꼬리표(화면 위 그림 · 숫자만). inner = 까딱 · 넘어짐 몫. */
function sackObj(k){ const g = new THREE.Group(), inner = new THREE.Group(), body = fitW(K[MODEL.sack], T.SACK_W); inner.add(body); g.add(inner); g.visible = false; scene.add(g);
  const wrap = document.createElement('div'); wrap.className = 'tag off'; const cv = NS.numsign(1, { px: 96, compact: true }); wrap.appendChild(cv); document.body.appendChild(wrap);
  return { k, g, inner, body, wrap, cv, mats: glowMats(body), n: 0, seat: k, where: 'off', plate: null, poured: 0, fat: false, gift: false, bob: false }; }
function boxObj(){ const o = fitH(K[MODEL.box], T.BOX); o.visible = false; return { o, mats: glowMats(o), used: false, glow: false, owner: null }; }

// ── 자리(저울 둘레의 자리는 가로 · 세로가 같다 — 화면을 돌려도 움직이는 물체가 새 자리로 그대로 간다)
const seatX = (k, n = K3()) => (n === 3 ? [-T.HALF, 0, T.HALF][k] : [-T.HALF, T.HALF][k]);
const pedTop = k => V(seatX(k), T.PED_H, T.PED_Z);
const standTop = sd => V((sd === 'L' ? -1 : 1) * T.SIDE_X, T.SIDE_H, T.SIDE_Z);
function seatPos(sd, ang = beam.rotation.z){ const x = (sd === 'L' ? -1 : 1) * T.HALF, y = T.BEAM_T / 2 - .02; return V(x * Math.cos(ang) - y * Math.sin(ang), PIV_Y + x * Math.sin(ang) + y * Math.cos(ang), 0); }
const plateAt = sd => plates.find(p => p.at === sd) || null;
const moving = o => stage.tweens.some(w => w.o === o);
function stopTweens(o){ for (let i = stage.tweens.length - 1; i >= 0; i--) { const w = stage.tweens[i]; if (w.o === o) { stage.tweens.splice(i, 1); w.res(); } } }
/** 상자 k 의 자리(접시 위 · 다섯씩 한 줄 · 두 접시가 같은 줄로 마주 본다 — 첫 상자가 가운데 쪽). */
const boxLocal = (pl, k) => { const c = k % 5, r = Math.floor(k / 5); return V((pl.side === 'L' ? 2 - c : c - 2) * T.BOX_DX, pl.top, T.BOX_Z[r]); };
const sackLocal = pl => V((pl.side === 'L' ? -1 : 1) * T.SACK_SPOT[0], pl.top, T.SACK_SPOT[1]);
function placeWorld(){ const l = L(); for (const kd of ['WIDE', 'TALL']) scen[kd].forEach(o => { o.visible = (kd === 'TALL') === S.tall; });
  field.position.x = l.shore - 110; stage.sea.position.x = l.shore + 85 - .6; stage.deep.position.x = stage.sea.position.x;   /* 물은 오른쪽 끝에만(바다 평면을 땅 밖으로) */ dock.position.set(l.shore + .35, -.3, S.tall ? l.moor.henry[1] - 1.1 : -1.55);
  sandPole.position.set(l.sand[0], 0, l.sand[1]); sandBag.position.set(l.sand[0] + .2, 1.5, l.sand[1] + .14);
  watchers.forEach((p, k) => { if (moving(p.obj.position)) return; const w = l.watch[k]; p.obj.position.set(w[0], 0, w[1]); p.obj.rotation.y = w[2]; });
  for (const who of ['henry', 'anne']) { const b = boats[who], m = l.moor[who]; if (moving(b.g.position)) b.snap = true; else if (b.g.visible) b.g.position.set(m[0], 0, m[1]); b.g.rotation.y = Math.PI; const gp = guests[who]; if (gp.obj.visible && !S.ending) { if (moving(gp.obj.position)) gp.snap = true; else gp.obj.position.set(l.guest[0], 0, l.guest[1]); } } }

// ── 카메라: 꼬리표 · 저울 · 옆 받침대 · 손님 · 모래 자루가 다 들어오게 · 맨 위는 띠 바로 아래
const tagPx = () => S.tall ? (K3() === 3 ? T.TALL.num3 : T.TALL.num) : S.low ? T.LOW_NUM : T.WIDE.num;
const trayRoom = () => S.tall ? 100 : S.low ? 52 : 124;
function aim(w, h){ const tall = h > w * 1.05; S.tall = tall; S.low = !tall && h < 560; const l = L(); camera.fov = l.fov; camera.aspect = w / h; placeWorld();
  const z = NS.size(tagPx(), true), top = trayRoom() + 6, bottom = h - (tall ? 14 : S.low ? 30 : 12), mx = tall ? 6 : 14, sk = T.PED_H + T.SACK_H * 1.05, gw = l.guest, sd = l.sand;
  const pts = [[V(-T.HALF, sk, T.PED_Z), z.h + 8, 0, z.w / 2 + 4, 0], [V(T.HALF, sk, T.PED_Z), z.h + 8, 0, 0, z.w / 2 + 4], [V(-T.HALF - T.PAN_D / 2 - .1, PIV_Y, 0), 0, 0, 4, 0], [V(T.HALF + T.PAN_D / 2 + .1, PIV_Y, 0), 0, 0, 0, 4],
    [V(-T.SIDE_X, 0, K3() === 3 ? T.SIDE_Z + .75 : .9), 0, 6, 0, 0], [V(gw[0] + .3, 0, gw[1] + .3), 0, 4, 0, 4], ...(tall ? [] : [[V(l.moor.henry[0] + .4, .4, l.moor.henry[1]), 0, 0, 0, 4]]), [V(gw[0], T.GUEST_H, gw[1]), tall ? 4 : 64, 0, 0, 0], [V(sd[0] - .3, 1.8, sd[1]), 4, 0, 4, 0], [V(sd[0], 0, sd[1] + .3), 0, 4, 0, 0]];
  const tz = tall ? (T.PED_Z + gw[1]) / 2 : (T.PED_Z + (K3() === 3 ? T.SIDE_Z : .9)) / 2, tx = tall ? 0 : (sd[0] + gw[0]) / 2; let dist = tall ? 9 : 8;
  const box = () => { let a = 1e9, b = -1e9, c = 1e9, e = -1e9; for (const [p, pt, pb, pl, pr] of pts) { const q = p.clone().project(camera), x = (q.x + 1) / 2 * w, y = (1 - q.y) / 2 * h; a = Math.min(a, x - pl); b = Math.max(b, x + pr); c = Math.min(c, y - pt); e = Math.max(e, y + pb); } return { l: a, r: b, t: c, b: e }; };
  for (let k = 0; k < 70; k++) { camera.position.set(tx, dist * l.elev, tz + dist * l.tilt); camera.lookAt(tx, 0, tz); camera.clearViewOffset(); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const bx = box(); if (bx.r - bx.l <= w - 2 * mx && bx.b - bx.t <= bottom - top) break; dist *= 1.04; }
  const bx = box(), dx = (bx.l + bx.r) / 2 - w / 2, dy = top - bx.t + Math.max(0, (bottom - top) - (bx.b - bx.t)) * .35;   /* 남는 세로는 조금 아래로 나눠 둔다 */ camera.setViewOffset(w, h, dx, -dy, w, h); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  sacks.forEach(tagPaint); $('bubble').hidden = S.tall || !S.bubble; if (S.ready) setTimeout(tellPlace, 80); }

// ── 꼬리표 · 천 · 말풍선 · 모래 · 깃발(화면 위 그림)
function tagPaint(s){ if (s.where === 'off') { s.wrap.classList.add('off'); return; } NS.paint(s.cv, s.n, { px: tagPx(), compact: true }); s.wrap.classList.remove('off'); }
const sackTop = s => s.g.getWorldPosition(V()).add(V(0, T.SACK_H * s.g.scale.y * (s.inner.rotation.z ? .55 : 1) + .06, 0));
function tagPlace(s){ if (s.wrap.classList.contains('off')) return; const q = stage.screenOf(sackTop(s)); s.wrap.style.left = q.x + 'px'; s.wrap.style.top = q.y + 'px'; }
/** 접시에 내려온 자루의 꼬리표가 뒤 받침대에서 기다리는 자루의 꼬리표와 겹치면 바깥쪽으로 비켜 선다(숫자가 가려지지 않게). */
function tagsApart(){ const up = live().filter(s => s.where === 'plate' && !s.wrap.classList.contains('off')), wait = live().filter(s => (s.where === 'ped' || s.where === 'out' || s.where === 'rolling') && !s.wrap.classList.contains('off'));
  for (const a of up) { const ra = a.wrap.getBoundingClientRect(); let dx = 0; const out = a.plate && a.plate.at.endsWith('L') ? -1 : 1;
    for (const b of wait) { const rb = b.wrap.getBoundingClientRect(); if (ra.right <= rb.left || ra.left >= rb.right || ra.bottom <= rb.top || ra.top >= rb.bottom) continue; dx = out < 0 ? Math.min(dx, rb.left - ra.right - 6) : Math.max(dx, rb.right - ra.left + 6); }
    if (dx) { const half = ra.width / 2, x = Math.max(4 + half, Math.min(innerWidth - 4 - half, ra.left + half + dx)); a.wrap.style.left = x + 'px'; } } }
const rectOf = el => (el && !el.classList.contains('off') && !el.hidden ? el.getBoundingClientRect() : null);
function bobEl(el, cls = 'bob', ms = 480){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); clearTimeout(el._bobT); el._bobT = setTimeout(() => el.classList.remove(cls), ms); }
function clothPlace(){ const c = $('cloth'); if (!c.classList.contains('on') || S.cover < 0) return; const r = rectOf(sacks[S.cover].wrap); if (!r) return; Object.assign(c.style, { left: (r.left - 6) + 'px', top: (r.top - 4) + 'px', width: (r.width + 12) + 'px', height: (r.height + 8) + 'px' }); }
const headAt = who => stage.screenOf(guests[who].obj.position.clone().add(V(0, T.GUEST_H + .12, 0)));
function bubble(text){ const b = $('bubble'); S.bubble = text || null; if (!text) { b.hidden = true; return; } if (b.textContent !== text) b.textContent = text; b.hidden = S.tall; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); bubblePlace(); }
function bubblePlace(){ const b = $('bubble'); if (b.hidden || !S.who) return; const q = headAt(S.who); b.style.left = Math.min(innerWidth - b.offsetWidth / 2 - 6, q.x) + 'px'; b.style.top = q.y + 'px'; }
function sandDraw(run){ const d = $('sand'); const on = !!(run && sandBag.visible); d.classList.toggle('on', on); const k = Math.min(1, S.clock); sandBag.scale.set(1 - .55 * k, 1 - .3 * k, 1 - .55 * k);
  if (on) { const q = stage.screenOf(sandBag.position.clone().add(V(0, -.46 * sandBag.scale.y, 0))); d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; } }
let flagEl = null, flagFor = null;
function flagOn(s){ flagOff(); flagEl = document.createElement('div'); flagEl.className = 'flagpin'; flagEl.innerHTML = art(ICON.flag); document.body.appendChild(flagEl); flagFor = s; flagPlace(); }
function flagOff(){ if (flagEl) flagEl.remove(); flagEl = null; flagFor = null; }
function flagPlace(){ if (!flagEl || !flagFor) return; const r = rectOf(flagFor.wrap); if (r) { flagEl.style.left = (r.right + 14) + 'px'; flagEl.style.top = (r.top + r.height * .6) + 'px'; } }
function puff(){ const q = stage.screenOf(V(0, .05, .4)); for (let i = 0; i < 12; i++) { const d = document.createElement('div'), a = Math.PI + Math.random() * Math.PI, r = 40 + Math.random() * 70; d.className = 'puff'; d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; d.style.setProperty('--dx', Math.cos(a) * r + 'px'); d.style.setProperty('--dy', Math.sin(a) * r * .6 + 'px'); d.style.setProperty('--r', (Math.random() * 360) + 'deg'); document.body.appendChild(d); setTimeout(() => d.remove(), 950); } }

// ── 띠 · 소리 · 한 줄 안내
const VOICE = { henry: { pitch: .75, rate: .88 }, anne: { pitch: 1.4, rate: .95 } };
const spoken = p => (R.CELLS[p.cell].k === 2 ? '더 ' : '가장 ') + (p.ask === 'big' ? '큰 수!' : '작은 수!');
function trayDraw(){ A.trayClear(); const t = $('tray'), p = S.p; if (!p || S.phase === 'weigh') return; const text = S.closed ? R.closing(p, eun) : R.question(p);
  t.innerHTML = `<i class="w"${S.closed ? ' style="color:#ffd34d"' : ''}>${text}</i>`; t.className = 'on'; const room = innerWidth * .96; t.style.fontSize = ''; if (t.offsetWidth > room) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room / t.offsetWidth) + 'px'; }
function askLine(p){ const k2 = R.CELLS[p.cell].k === 2, w = (k2 ? '더 ' : '가장 ') + (p.ask === 'big' ? '큰' : '작은'); return S.step === 2 && k2 ? `${w} 수의 자루를 눌러 줘. 저울이 알려 줄 거야.` : `${w} 수의 자루를 눌러 줘.`; }
function firstLine(){ const p = S.p; if (!p) return ''; return S.phase === 'weigh' ? '자루를 눌러 저울에 올려 봐.' : askLine(p); }
const tick = () => tone(1300 + Math.random() * 200, .04, 'square', .035);
const thump = () => { tone(140, .14, 'sine', .09, 0, 80); };
/** 한 줄 안내 자리: 꼬리표 · 자루 · 저울 · 손님 · 띠를 가리지 않는 곳. */
function tellPlace(){ const tl = $('tell'); if (!tl || !tl.classList.contains('on')) return; const w = innerWidth, h = innerHeight;
  Object.assign(tl.style, { maxWidth: (S.low ? Math.max(180, w * .3) : Math.min(w * .92, 560)) + 'px', fontSize: S.tall || S.low ? '1.02rem' : '', bottom: 'auto', transform: 'none' }); const tw = tl.offsetWidth, th = tl.offsetHeight, keys = keyRects();
  const pref = S.tall ? { x: (w - tw) / 2, y: h - th - 70 } : { x: (w - tw) / 2, y: h - th - 34 }; let best = null, s0 = Infinity;
  for (let y = 56; y <= h - th - 6; y += 10) for (let x = 6; x <= w - tw - 6; x += 12) { let ov = 0; for (const r of keys) { const ix = Math.max(0, Math.min(x + tw, r.right) - Math.max(x, r.left)), iy = Math.max(0, Math.min(y + th, r.bottom) - Math.max(y, r.top)); ov += ix * iy; }
    const sc = ov * 50 + Math.hypot(x - pref.x, y - pref.y); if (sc < s0) { s0 = sc; best = { x, y }; } }
  if (best) Object.assign(tl.style, { left: best.x + 'px', top: best.y + 'px' }); S.log.push({ tellAt: best }); }
/** 가리면 안 되는 것들의 화면 네모. */
function keyRects(){ const out = []; const add = r => { if (r && r.width > 0) out.push(r); };
  for (const s of sacks) if (s.where !== 'off' && s.g.visible) { add(rectOf(s.wrap)); add(rect3(s.g)); }
  for (const pl of plates) if (pl.at !== 'hide') add(rect3(pl.g));
  add(rect3(beam)); add(rect3(pivot)); if (S.who) add(rect3(guests[S.who].obj, 1.1)); if (fox.obj.visible) add(rect3(fox.obj)); if (sandPole.visible) add(rect3(sandPole));
  for (const id of ['tray', 'marbles', 'lanterns', 'coins', 'snd', 'note', 'bubble', 'cloth']) { const e = $(id); if (e && !e.hidden && getComputedStyle(e).display !== 'none' && (id !== 'cloth' || e.classList.contains('on'))) add(e.getBoundingClientRect()); } add(document.querySelector('.back') && document.querySelector('.back').getBoundingClientRect());
  return out; }
/** 3D 물체의 화면 네모(꼭짓점 여덟). */
function rect3(o, grow = 1){ if (!o || !o.visible) return null; o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); if (b.isEmpty()) return null; if (grow !== 1) { const c = b.getCenter(V()), s = b.getSize(V()).multiplyScalar(grow / 2); b.min.copy(c).sub(s); b.max.copy(c).add(s); }
  let l = 1e9, r = -1e9, t = 1e9, bt = -1e9; for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) { const q = stage.screenOf(V(x, y, z)); l = Math.min(l, q.x); r = Math.max(r, q.x); t = Math.min(t, q.y); bt = Math.max(bt, q.y); }
  return { left: l, right: r, top: t, bottom: bt, width: r - l, height: bt - t }; }
const uni = rs => { rs = rs.filter(Boolean); if (!rs.length) return null; const o = { left: Math.min(...rs.map(r => r.left)), right: Math.max(...rs.map(r => r.right)), top: Math.min(...rs.map(r => r.top)), bottom: Math.max(...rs.map(r => r.bottom)) }; o.width = o.right - o.left; o.height = o.bottom - o.top; return o; };

// ── 누르기: 자루가 먼저(여우가 물고 가는 자루 · 여우는 쫓기) → 손님 → 그 밖(저울 · 빈 곳) — 누름에는 늘 답이 있다(5-11)
const canvas = $('c');
const live = () => sacks.slice(0, K3()).filter(s => s.where !== 'off');
/** 자루를 누르는 곳: 자루 + 꼬리표(+ 올라가 있는 접시와 상자). 겹치면 가운데가 가까운 쪽. */
function sackHit(s){ const r = uni([rectOf(s.wrap), rect3(s.g), s.plate ? rect3(s.plate.g) : null]); if (!r) return null; return { left: r.left - 6, right: r.right + 6, top: r.top - 6, bottom: r.bottom + 6, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 }; }
function hitAt(x, y){ const inR = (r, pad = 0) => r && x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
  if (S.fox && S.fox.s && S.fox.phase !== 'flee' && inR(rect3(fox.obj, 1.15), 10)) return { kind: 'fox' };
  let best = null, d0 = Infinity; for (const s of live()) { const r = sackHit(s); if (inR(r)) { const d = Math.hypot(x - r.x, y - r.y); if (d < d0) { d0 = d; best = s; } } } if (best) return { kind: 'sack', s: best };
  if (S.who && guests[S.who].obj.visible && (inR(rect3(guests[S.who].obj, 1.15), 8) || inR(rectOf($('bubble'))))) return { kind: 'guest' };
  return { kind: 'other', what: inR(uni([rect3(beam), rect3(pivot), ...plates.filter(p => p.at !== 'hide').map(p => rect3(p.g))])) ? 'scale' : 'empty' }; }
canvas.addEventListener('pointerdown', e => { if (!S.ready || e.button > 0) return; audio(); const x = e.clientX, y = e.clientY; if (!S.active || E.homeOpen()) { H.ripple(x, y); S.log.push({ ignored: 'idle' }); return; }
  const hit = hitAt(x, y); if (S.busy || S.closed) { H.ripple(x, y); S.log.push({ ignored: 'busy', hit: hit.kind }); return; }
  touch(); H.ripple(x, y); S.log.push({ tap: hit.kind, what: hit.what, n: hit.s ? hit.s.n : null });
  if (hit.kind === 'fox') { chase(); return; } if (hit.kind === 'sack') { onSack(hit.s, x, y); return; } if (hit.kind === 'guest') { guestTap(); nudge(x, y, 'guest'); return; } nudge(x, y, hit.what); });
function touch(){ S.lastAct = S.t; H.hide(); S.hinting = false; }
function onSack(s, x, y){ if (S.fox && S.fox.s === s) { chase(); return; } if (s.where === 'out' || s.where === 'rolling') { nudge(x, y, s.where); return; }
  if (S.phase === 'weigh') { if (s.where === 'ped') putOn1(s); else nudge(x, y, 'up'); return; } pick(s); }
/** 자루가 아닌 곳의 누름(5-11): 물결 + 다음에 누를 곳 + 한 줄 안내. 고르는 중이면 고를 자루들이 들썩(손은 답을 짚지 않는다) · 올려 보는 중이면 손이 다음에 올릴 자루를. */
function nudge(x, y, what){ tone(520, .07, 'triangle', .05); const ls = live().filter(s => s.where !== 'out'); S.log.push({ nudge: true, what, phase: S.phase });
  if (S.phase === 'weigh') { const nx = ls.filter(s => s.where === 'ped'); nx.forEach(bobSack); if (nx[0]) { const r = rectOf(nx[0].wrap) || sackHit(nx[0]); H.show((r.left + r.right) / 2, r.bottom + 4); S.log.push({ nudgeHand: nx[0].seat }); } }
  else { ls.forEach(bobSack); S.log.push({ bob: ls.length }); }
  if (H.tell('weigh.nudge', firstLine(), { times: 1e9 })) tellPlace(); }
function bobSack(s){ bobEl(s.wrap); if (s.bob) return; s.bob = true; stage.tween(s.inner.position, { y: .14 }, 130).then(() => stage.tween(s.inner.position, { y: 0 }, 170)).then(() => { s.bob = false; s.inner.position.y = 0; }); }
/** 손님을 누르면 물음을 다시 말한다(구경 중이면 손만 흔든다). */
function guestTap(){ const g = guests[S.who]; actPlay(g, 'Wave', true); setTimeout(() => actPlay(g, 'Idle'), 900); if (S.phase === 'ask' && S.p) { const said = TL.say(spoken(S.p), VOICE[S.who]); bubble(R.question(S.p)); S.log.push({ reask: said }); } }

// ── 상자 · 자루 · 접시 움직임
function takeBox(){ const b = BOX.find(x => !x.used) || boxObj(); if (!BOX.includes(b)) BOX.push(b); b.used = true; b.glow = false; b.o.visible = true; b.o.scale.setScalar(1); return b; }
function freeBox(b){ stopTweens(b.o.position); stopTweens(b.o.scale); if (b.o.parent) b.o.parent.remove(b.o); b.used = false; b.glow = false; b.owner = null; b.o.visible = false; }
/** 자루에서 상자 하나가 접시로(타닥). */
function boxOut(s, pl){ const b = takeBox(), k = pl.boxes.length; b.owner = s; pl.load.add(b.o); const from = pl.load.worldToLocal(sackTop(s)), to = boxLocal(pl, k); b.o.position.copy(from); pl.boxes.push(b); s.poured++;
  const mid = from.clone().lerp(to, .5); mid.y = Math.max(from.y, to.y) + .25; stage.tween(b.o.position, { x: mid.x, y: mid.y, z: mid.z }, 110, easeOut).then(() => stage.tween(b.o.position, { x: to.x, y: to.y, z: to.z }, 130, easeIn)).then(() => { if (b.used && b.o.parent === pl.load) b.o.position.copy(boxLocal(pl, pl.boxes.indexOf(b))); }); tick(); }
/** 자루가 접시로 내려간다(꼬리표도 따라가 접시에 꽂힌다) · 뚱뚱한 자루는 바람이 빠진다. */
async function hopTo(s, pl, ms = T.HOP_MS){ const my = S.oid; stopTweens(s.g.position); stopTweens(s.g.scale); pl.load.attach(s.g); s.where = 'plate'; s.plate = pl; pl.sack = s; pl.owner = s; const to = sackLocal(pl), from = s.g.position.clone(), mid = from.clone().lerp(to, .5); mid.y = Math.max(from.y, to.y) + .5;
  if (s.fat) { s.fat = false; stage.tween(s.g.scale, { x: 1, y: 1, z: 1 }, ms * 1.4); tone(700, .3, 'sine', .05, 0, 300); S.log.push({ deflate: s.n }); }
  await stage.tween(s.g.position, { x: mid.x, y: mid.y, z: mid.z }, ms * .5, easeOut); if (S.oid !== my) return; await stage.tween(s.g.position, { x: to.x, y: to.y, z: to.z }, ms * .5, easeIn); if (S.oid !== my) return; s.g.position.copy(sackLocal(pl)); thump(); }
async function pourOne(s){ const my = S.oid; while (s.poured < s.n) { boxOut(s, s.plate); await sleep(R.T.POUR_GAP * 1000 * T.POUR1); if (S.oid !== my) return; } empty(s); await sleep(260); }
/** 다 쏟은 자루는 홀쭉해진다(꼬리표도 조금 내려옴 — 뒤 받침대의 꼬리표와 겹치지 않게). */
const empty = s => { stopTweens(s.g.scale); stage.tween(s.g.scale, { y: .5 }, 220); };
/** 둘이 함께 — 한 쌍씩 번갈아(왼 · 오 · 왼 · 오 … 짝이 떨어진 쪽은 혼자 더). */
async function pourPair(a, b){ const my = S.oid, seq = R.pour(a.n, b.n, a.poured, b.poured); S.log.push({ pour: seq.join('') });
  for (const sd of seq) { const s = sd === 'L' ? a : b; boxOut(s, s.plate); await sleep(R.T.POUR_GAP * 1000); if (S.oid !== my) return; } empty(a); empty(b); await sleep(300); }
/** 쿵: 큰 쪽으로 기운다(k = 한쪽만 올렸을 때 조금). 깨끗한 문제가 이어지면 소리가 묵직해지고 풀이 흩날린다. */
async function thud(dir, k = 1){ const my = S.oid, to = (dir === 'left' ? 1 : -1) * (k === 1 ? T.TILT : T.TILT1); S.log.push({ thud: dir, k }); stopTweens(beam.rotation);
  const pr = stage.tween(beam.rotation, { z: to }, R.T.TILT_S * 1000 * (k === 1 ? 1 : .6), easeBack);
  setTimeout(() => { if (S.oid !== my) return; const g = .11 + .035 * Math.min(S.streak, 3); tone(92, .4, 'sine', g, 0, 42); tone(58, .32, 'triangle', g * .8); if (k === 1 && S.streak > 0) puff(); }, R.T.TILT_S * 1000 * .25);
  await pr; }
async function level(ms = 500){ stopTweens(beam.rotation); await stage.tween(beam.rotation, { z: 0 }, ms, easeOut); }
/** 접시가 옆 받침대로 내려와 앉는다(상자는 줄 맞춘 채 그대로). */
async function toStand(pl){ const sd = pl.at; pl.at = 'S' + sd; const to = standTop(sd), from = pl.g.position.clone(), mid = from.clone().lerp(to, .5); mid.y = Math.max(from.y, to.y) + .35; S.log.push({ stand: pl.sack ? pl.sack.n : null, side: sd });
  await stage.tween(pl.g.position, { x: mid.x, y: mid.y, z: mid.z }, T.SIDE_MS * .45, easeOut); await stage.tween(pl.g.position, { x: to.x, y: to.y, z: to.z }, T.SIDE_MS * .55, easeIn); pl.g.position.copy(standTop(sd)); thump(); }
/** 빈 접시가 저울 sd 자리에 새로 놓인다. */
async function spareTo(sd){ let pl = plates.find(p => p.at === 'hide'); if (!pl) return plateAt(sd); clearPlate(pl); pl.at = sd; pl.side = sd; pl.g.visible = true; pl.g.position.copy(seatPos(sd)); pl.g.scale.setScalar(.01); await stage.tween(pl.g.scale, { x: 1, y: 1, z: 1 }, 220, easeOut); return pl; }
async function hidePlate(pl){ await stage.tween(pl.g.scale, { x: .01, y: .01, z: .01 }, 180); clearPlate(pl); pl.at = 'hide'; pl.g.visible = false; pl.g.scale.setScalar(1); }
function clearPlate(pl){ for (const b of pl.boxes) freeBox(b); pl.boxes = []; pl.sack = null; pl.owner = null; pl.glow = false; }
/** 옆 받침대의 접시를 저울 sd 자리로(자리의 빈 접시는 치운다) — 상자 줄은 그 자리 쪽으로 다시 맞춘다. */
async function backTo(pl, sd){ const e = plateAt(sd); if (e && e !== pl) await hidePlate(e); pl.at = sd; const to = seatPos(sd); await stage.tween(pl.g.position, { x: to.x, y: to.y, z: to.z }, T.SIDE_MS, easeOut); if (pl.side !== sd) { pl.side = sd; pl.boxes.forEach((b, k) => stage.tween(b.o.position, boxLocal(pl, k), 200)); if (pl.sack) stage.tween(pl.sack.g.position, sackLocal(pl), 200); await sleep(220); } }
/** 자루를 저울 sd 자리로(받침대에서 내려오거나 · 옆 받침대에서 돌아오거나) — 아직 안 쏟은 상자는 쏟는다. */
async function bringTo(s, sd){ if (s.plate && s.plate.at === sd) { if (s.poured < s.n) await pourOne(s); return; }
  if (s.plate && s.plate.at.startsWith('S')) { await backTo(s.plate, sd); return; }
  let pl = plateAt(sd); if (!pl || (pl.sack && pl.sack !== s) || (pl.owner && pl.owner !== s)) { if (pl) await toStand(pl); pl = await spareTo(sd); }
  await hopTo(s, pl); if (s.poured < s.n) await pourOne(s); }
/** 상자들이 자루 속으로 들어간다(물러나거나 실어 갈 때). */
async function gather(s){ const pl = s.plate; if (!pl) return; const mine = pl.boxes.filter(b => b.owner === s), at = sackLocal(pl).add(V(0, .25, 0)); await Promise.all(mine.map((b, k) => sleep(k * 25).then(() => Promise.all([stage.tween(b.o.position, { x: at.x, y: at.y, z: at.z }, 220), stage.tween(b.o.scale, { x: .05, y: .05, z: .05 }, 220)]))));
  mine.forEach(freeBox); pl.boxes = pl.boxes.filter(b => !mine.includes(b)); }
/** 찍은 자루가 접시에서 미끄러져 물러난다(받침대로 돌아가 넘어져 있다 · 가위표 · 빨간 테두리 없음). */
async function retreat(s){ const my = S.oid; S.log.push({ retreat: s.n }); stopTweens(s.g.position); stopTweens(s.g.scale); tone(300, .14, 'sine', .07); tone(220, .2, 'sine', .06, .12); await gather(s); if (S.oid !== my) return; const pl = s.plate; if (pl) { pl.sack = null; pl.owner = null; } s.plate = null; s.where = 'out'; stage.tween(s.g.scale, { x: 1, y: 1, z: 1 }, 200);
  scene.attach(s.g); const to = pedTop(s.seat), from = s.g.position.clone(), mid = from.clone().lerp(to, .5); mid.y += .45; stage.tween(s.inner.rotation, { z: s.seat === 0 ? .95 : -.95 }, T.BACK_MS); s.wrap.classList.add('dim');
  await stage.tween(s.g.position, { x: mid.x, y: mid.y, z: mid.z }, T.BACK_MS * .5, easeOut); await stage.tween(s.g.position, { x: to.x, y: to.y, z: to.z }, T.BACK_MS * .5, easeIn); }
/** 손님이 그 자루를 싣는다(상자가 자루로 들어가고 자루가 배로 날아간다). */
async function load(s){ const my = S.oid, who = S.who, bt = boats[who]; stopTweens(s.g.position); await gather(s); if (S.oid !== my) return; if (s.plate) { s.plate.sack = null; s.plate.owner = null; } s.plate = null; s.where = 'gone'; scene.attach(s.g); stage.tween(s.g.scale, { x: 1, y: 1, z: 1 }, 200);
  actPlay(guests[who], 'Yes', true); setTimeout(() => { if (S.oid === my) actPlay(guests[who], 'Idle'); }, 1000); tone(660, .1, 'triangle', .08); tone(880, .12, 'triangle', .08, .1);
  const to = bt.g.visible ? bt.g.position.clone().add(V(0, .7, 0)) : guests[who].obj.position.clone().add(V(1.5, .8, 0)), from = s.g.position.clone(), mid = from.clone().lerp(to, .5); mid.y = Math.max(from.y, to.y) + 1.1;
  await stage.tween(s.g.position, { x: mid.x, y: mid.y, z: mid.z }, T.LOAD_MS * .5, easeOut); await stage.tween(s.g.position, { x: to.x, y: to.y, z: to.z }, T.LOAD_MS * .5, easeIn); if (S.oid !== my) return;
  s.g.visible = false; s.wrap.classList.add('off'); bt.n++; bt.load.visible = true; bt.load.scale.setScalar(.75 + .1 * Math.min(bt.n, 5)); thump(); S.log.push({ loaded: s.n, who }); }

// ── 손님 · 배
async function boatIn(who, big){ const b = boats[who], m = L().moor[who], my = S.oid; b.snap = false; stopTweens(b.g.position); b.g.scale.setScalar(big ? T.BIG : 1); b.g.visible = true; b.g.position.set(m[0] + 7, 0, m[1]); b.g.rotation.y = Math.PI; tone(196, .4, 'sine', .04);
  await stage.tween(b.g.position, { x: m[0] }, T.BOAT_MS, easeOut); if (S.oid !== my) return; if (b.snap) { b.snap = false; const m2 = L().moor[who]; b.g.position.set(m2[0], 0, m2[1]); } }
async function boatOut(who){ const b = boats[who]; stopTweens(b.g.position); await stage.tween(b.g.position, { x: b.g.position.x + 8 }, T.BOAT_MS * .9, easeIn); b.g.visible = false; b.n = 0; b.load.visible = false; }
async function walk(p, to, ms){ stopTweens(p.obj.position); const d = Math.atan2(to.x - p.obj.position.x, to.z - p.obj.position.z); p.obj.rotation.y = d; actPlay(p, 'Walk'); await stage.tween(p.obj.position, { x: to.x, z: to.z }, ms, t => t); actPlay(p, 'Idle'); }
async function guestCome(who, big){ const my = S.oid, g = guests[who], l = L(); await boatIn(who, big); if (S.oid !== my) return; g.snap = false; g.obj.visible = true; g.obj.position.set(l.shore + .1, 0, l.moor[who][1] * .5 + l.guest[1] * .5); await walk(g, V(l.guest[0], 0, l.guest[1]), T.WALK_MS); if (S.oid !== my) return;
  g.obj.rotation.y = -Math.PI / 2 + (S.tall ? -.5 : .15); if (g.snap) { g.snap = false; g.obj.position.set(L().guest[0], 0, L().guest[1]); } }
async function guestLeave(who){ const g = guests[who], l = L(); if (g.obj.visible) { await walk(g, V(l.shore + .1, 0, g.obj.position.z), T.WALK_MS * .8); g.obj.visible = false; } await boatOut(who); }
/** 이 문제의 손님(큰 = 헨리 · 작은 = 앤). 같은 손님이면 그대로 · 마지막 문제는 가장 큰 배로. */
async function ensureGuest(who, big){ const old = S.who; if (old === who && !big) return; S.who = who; bubble(null);
  if (old === who) { await boatOut(who); await boatIn(who, true); return; }
  await Promise.all([old ? guestLeave(old) : Promise.resolve(), guestCome(who, big)]); }
function stomp(){ const g = guests[S.who]; if (!g) return; actPlay(g, 'Jump', true); setTimeout(() => { if (S.active) actPlay(g, 'Idle'); }, 700); S.log.push({ stomp: true }); }

// ── 가려진 자루 · 여우
function startReveal(){ const s = sacks[S.cover], pl = plateAt(S.cover === 0 ? 'L' : 'R'); pl.owner = s; S.revealing = true; S.revealT = S.t + R.T.REVEAL_GAP; $('cloth').className = 'on'; S.log.push({ cover: s.n, seat: s.seat }); }
function revealStep(){ const s = sacks[S.cover], pl = plateAt(S.cover === 0 ? 'L' : 'R'); if (!pl) { stopReveal(); return; } if (s.poured < s.n) { boxOut(s, pl); S.log.push({ revealed: s.poured }); S.revealT = S.t + R.T.REVEAL_GAP; return; } stopReveal(); }
function stopReveal(){ if (!S.revealing && !$('cloth').classList.contains('on')) return; S.revealing = false; const c = $('cloth'); if (c.classList.contains('on')) { c.classList.add('lift'); setTimeout(() => { c.className = ''; }, 460); S.log.push({ uncover: S.cover >= 0 ? sacks[S.cover].poured : -1 }); } }
function foxStart(){ const p = S.p; let s = sacks[R.foxAt(p)]; if (s.where !== 'ped' || s.seat === S.cover) s = live().find(x => x.where === 'ped' && x.seat !== S.cover); if (!s) return;
  const f = L().fox, top = pedTop(s.seat); fox.obj.visible = true; fox.obj.position.set(f[0], 0, f[1]); S.fox = { s, phase: 'come', t: 0, to: V(top.x - .55, 0, top.z - .25) }; actPlay(fox, 'Walk'); S.log.push({ fox: s.n, seat: s.seat }); tone(330, .2, 'triangle', .04); }
function foxStep(dt){ const F = S.fox; if (!F) return; const o = fox.obj;
  if (F.phase === 'come') { const d = F.to.clone().sub(o.position); d.y = 0; const len = d.length(), st = 1.9 * dt; o.rotation.y = Math.atan2(d.x, d.z); if (len <= st) { o.position.copy(F.to); F.phase = 'bite'; F.t = 0; actPlay(fox, 'Eating'); } else o.position.addScaledVector(d.normalize(), st); }
  else if (F.phase === 'bite') { F.t += dt; if (F.t > .5 && S.active && !S.busy) { F.phase = 'drag'; F.t = 0; F.s.where = 'fox'; scene.attach(F.s.g); actPlay(fox, 'Walk'); o.rotation.y = -Math.PI / 2; S.log.push({ foxDrag: F.s.n }); } }
  else if (F.phase === 'drag') { F.t += dt; o.position.x -= .42 * dt; F.s.g.position.set(o.position.x - .42, T.PED_H + (.02 - T.PED_H) * Math.min(1, F.t / .35), o.position.z + .08);   /* 받침대에서 끌어 내린다 */ F.s.inner.rotation.z = .6; if (F.t >= R.T.FOX_S) foxDrop(false); }
  else if (F.phase === 'flee') { o.position.x -= (F.fast ? 5.5 : 1.8) * dt; o.rotation.y = -Math.PI / 2; if (o.position.x < -11) { o.visible = false; S.fox = null; } } }
function chase(){ const F = S.fox; if (!F || !F.s) return; S.log.push({ chased: F.s.n }); tone(880, .08, 'triangle', .07); tone(1100, .08, 'triangle', .06, .08); foxDrop(true); }
/** 여우가 놓고 간다(쫓겼거나 · 시간이 다 됐거나) → 자루가 제자리로 굴러온다. 수는 그대로. */
function foxDrop(fast){ const F = S.fox; if (!F || !F.s) return Promise.resolve(); const s = F.s; F.s = null; F.phase = 'flee'; F.fast = fast; actPlay(fox, fast ? 'Gallop' : 'Walk'); S.log.push({ foxDrop: s.n, fast }); if (s.where !== 'fox') return Promise.resolve();
  s.where = 'rolling'; const to = pedTop(s.seat); return F.back = Promise.all([stage.tween(s.g.position, { x: to.x, y: to.y, z: to.z }, 700, easeOut), stage.tween(s.inner.rotation, { z: 0 }, 700)]).then(() => { if (s.where === 'rolling') { s.where = 'ped'; s.g.position.copy(pedTop(s.seat)); s.inner.rotation.z = 0; S.log.push({ rolledBack: s.n }); } }); }
async function foxOff(){ if (S.fox && S.fox.s) await foxDrop(true); const s = live().find(x => x.where === 'rolling'); if (s) await sleep(720); }

// ── 걸음 ①: 올려 보기
/** 자루가 갈 저울 자리: 바로 아래 접시가 비었으면 그쪽 · 아니면 다른 쪽(가운데 자루는 빈 쪽). */
function sideFor(s){ const k = K3(), pref = s.seat === 0 ? 'L' : s.seat === k - 1 ? 'R' : 'L', free = sd => { const pl = plateAt(sd); return !pl || (!pl.sack && (!pl.owner || pl.owner === s)); };
  return free(pref) ? pref : free(pref === 'L' ? 'R' : 'L') ? (pref === 'L' ? 'R' : 'L') : pref; }
async function putOn1(s){ const my = S.oid; S.busy = true; H.hide(); S.log.push({ put: s.n, seat: s.seat });
  const sd = sideFor(s); await bringTo(s, sd); if (S.oid !== my) return;
  const on = ['L', 'R'].map(plateAt).map(pl => pl && pl.sack).filter(Boolean);
  if (on.length === 1) await thud(on[0].plate.at === 'L' ? 'left' : 'right', .4);   /* 하나만 올리면 그쪽으로 조금 */
  else { const a = plateAt('L').sack, b = plateAt('R').sack; await thud(R.tilt(a.n, b.n)); if (S.oid !== my) return; glowExtras(a, b);
    if (live().some(x => x.where === 'ped')) { await sleep(900); if (S.oid !== my) return; const light = a.n < b.n ? a : b; glowOff(); await toStand(light.plate); if (S.oid !== my) return; await spareTo(light === a ? 'L' : 'R'); await thud(light === a ? 'right' : 'left', .4); } }   /* A14: 가벼운 쪽이 접시째 옆 받침대로 */
  if (S.oid !== my) return;
  if (!live().some(x => x.where === 'ped')) { await sleep(800); if (S.oid !== my) return; askNow(); }
  S.busy = false; S.lastAct = S.t; }
function glowExtras(a, b){ const big = a.n > b.n ? a : b, m = Math.min(a.n, b.n); big.plate.boxes.forEach((x, k) => { x.glow = k >= m; }); S.log.push({ extra: Math.abs(a.n - b.n) }); }
function glowOff(){ for (const b of BOX) b.glow = false; for (const pl of plates) pl.glow = false; }

// ── 손님이 묻는다 · 고르기
function askNow(){ const p = S.p, who = S.who; S.phase = 'ask'; trayDraw(); bubble(R.question(p)); const said = TL.say((who === 'anne' ? '내 배는 작아. ' : '') + spoken(p), VOICE[who]); actPlay(guests[who], 'Wave', true); setTimeout(() => { if (S.p === p) actPlay(guests[who], 'Idle'); }, 900);
  S.log.push({ ask: p.ask, said }); const key = S.cell + S.step + p.ask; if (!S.asked[key]) {   /* 나들이에서 그 물음이 처음 나올 때(깃발을 따기 전까지 나들이마다) */ S.asked[key] = 1; if (H.tell('weigh.' + key, askLine(p), TELLS())) { tellPlace(); S.log.push({ told: askLine(p) }); S.lastAct = S.t + T.TELL_GRACE; } } }
function pick(s){ S.log.push({ pick: s.n, seat: s.seat, step: S.step, hinted: S.res.hinted }); if (S.step === 1) pick1(s); else if (K3() === 2) confirm2(s); else confirm3(s); }
/** 걸음 ①: 다 올려 본 뒤 고른다 — 아니면 저울이 한 번 더 까딱이며 맞는 쪽 접시가 빛나고 손님이 그 자루를 가리켜 싣는다(깨끗하지 않음). */
async function pick1(s){ const my = S.oid, p = S.p; S.busy = true; H.hide(); glowOff(); const j = R.judge(p, s.seat); S.log.push({ judge: j });
  if (j === 'fit') { flagOn(s); tone(1046, .2, 'triangle', .1); await finish(s); return; }
  S.res.retreat = true; const ans = sacks[p.answer]; bobEl(s.wrap); const a0 = beam.rotation.z; await stage.tween(beam.rotation, { z: a0 * 1.5 }, 160); await stage.tween(beam.rotation, { z: a0 }, 260); if (S.oid !== my) return;
  if (ans.plate) ans.plate.glow = true; actPlay(guests[S.who], 'Punch', true); await sleep(1100); if (S.oid !== my) return; glowOff(); await finish(ans); }
/** 걸음 ② A13: 두 자루가 함께 내려가 한 쌍씩 번갈아 쏟아지고 → 쿵. 맞으면 깃발 · 아니면 찍은 자루가 물러나고 남은 자루를 손님이 싣는다(다시 고르게 하지 않는다). */
async function confirm2(s){ const my = S.oid, p = S.p, a = sacks[0], b = sacks[1]; S.busy = true; H.hide(); stopReveal(); bobSack(s); s.wrap.classList.add('lit'); await foxOff(); if (S.oid !== my) return;
  await Promise.all([hopTo(a, plateAt('L')), hopTo(b, plateAt('R'))]); if (S.oid !== my) return; await pourPair(a, b); if (S.oid !== my) return;
  await thud(R.tilt(a.n, b.n)); if (S.oid !== my) return; s.wrap.classList.remove('lit'); const j = R.judge(p, s.seat); S.log.push({ judge: j });
  if (j === 'fit') { flagOn(s); tone(1046, .2, 'triangle', .1); await sleep(350); if (S.oid !== my) return; await finish(s); return; }
  S.res.retreat = true; await sleep(250); await retreat(s); if (S.oid !== my) return; await sleep(200); await finish(s === a ? b : a); }
/** 걸음 ② A14: 찍은 자루가 한 접시에 · 나머지가 차례로 맞은편에 — 쿵, 쿵 두 번. 한 번이라도 지면 찍은 자루가 물러나고 남은 둘 가운데서 다시 찍는다(쏟아진 상자는 보인 채로). */
async function confirm3(s){ const my = S.oid, p = S.p; S.busy = true; H.hide(); stopReveal(); bobSack(s); s.wrap.classList.add('lit'); await foxOff(); if (S.oid !== my) return;
  const sd = s.plate && (s.plate.at === 'L' || s.plate.at === 'R') ? s.plate.at : sideFor(s), other = sd === 'L' ? 'R' : 'L'; await bringTo(s, sd); if (S.oid !== my) return;
  const cov = S.cover >= 0 && sacks[S.cover].plate && sacks[S.cover].where === 'plate' ? S.cover : -1, list = R.bouts(p, s.seat, cov, S.out); S.log.push({ bouts: list.map(x => x.vs + (x.win ? '+' : '-')).join(' ') });
  for (let i = 0; i < list.length; i++) { const o = sacks[list[i].vs]; await bringTo(o, other); if (S.oid !== my) return; const l = plateAt('L').sack, r = plateAt('R').sack; await thud(R.tilt(l.n, r.n)); if (S.oid !== my) return; S.log.push({ bout: [s.n, o.n], win: list[i].win });
    if (!list[i].win) { s.wrap.classList.remove('lit'); S.res.retreat = true; await sleep(300); await retreat(s); if (S.oid !== my) return; S.out.push(s.seat); const left = live().filter(x => x.where !== 'out');
      if (left.length === 1) { await sleep(200); await finish(left[0]); return; }
      S.busy = false; S.lastAct = S.t; S.log.push({ again: left.map(x => x.n).join() }); return; }
    if (i < list.length - 1) { await sleep(450); if (S.oid !== my) return; await toStand(o.plate); if (S.oid !== my) return; } }
  s.wrap.classList.remove('lit'); flagOn(s); tone(1046, .2, 'triangle', .1); await sleep(350); if (S.oid !== my) return; await finish(s); }
/** 문제를 닫는다: 띠가 닫히고(「7은 5보다 큽니다」) 손님이 그 자루를 싣는다. */
async function finish(ans){ const my = S.oid, p = S.p; if (S.closed) return; S.closed = true; S.busy = true; H.hide(); stopReveal(); bubble(null); trayDraw(); TL.say(R.closing(p, eun));
  const cleanNow = R.clean(S.res); if (S.step === 2) { if (cleanNow) { S.streak++; if (S.streak % R.T.STREAK === 0) { watchers.forEach((w, k) => setTimeout(() => { actPlay(w, 'Jump', true); setTimeout(() => actPlay(w, 'Idle'), 900); }, k * 120)); confetti(16); S.log.push({ hop: S.streak }); } } else S.streak = 0; }   /* 쿵쿵 가락: 셋 이어지면 마당의 동물들이 폴짝 */
  if (S.ctx.surprise) { if (cleanNow && !S.res.missed) { wallet.earn(R.T.SURPRISE_COINS, 'weigh'); confetti(10); tone(1319, .2, 'triangle', .1); S.surpriseCarry = false; S.log.push({ surpriseOpen: true }); } else S.surpriseCarry = true; }
  if (!S.res.missed) { wallet.earn(R.T.COIN_PER, 'weigh'); coinsDraw(true); }   /* 동전은 아이가 찍은 문제만 */
  S.today.push(p.nums[p.answer]); await sleep(500); if (S.oid !== my) return; await load(ans); if (S.oid !== my) return; await sleep(450); if (S.oid !== my) return; flagOff();
  S.log.push({ closed: R.closing(p, eun), clean: cleanNow }); S.done && S.done(S.res.missed ? 'missed' : 'sent'); }
/** 모래가 다 샜다 — 손님이 「내가 올려 볼게」 하고 스스로 저울에 올려 보고(쿵 · 답이 보임) 싣고 간다(깨끗하지 않음 · 두 문제 뒤에 다시). */
async function miss(){ if (!S.active || S.busy || S.closed) return; const my = S.oid, p = S.p; S.busy = true; S.res.missed = true; S.streak = 0; H.hide(); S.log.push({ missed: true }); stopReveal(); await foxOff(); if (S.oid !== my) return;
  bubble('내가 올려 볼게'); TL.say('내가 올려 볼게', VOICE[S.who]); actPlay(guests[S.who], 'Wave', true);
  await homeAll(); if (S.oid !== my) return;   /* 올려 본 것은 받침대로 돌려놓고 처음부터 */
  const ans = sacks[p.answer];
  if (K3() === 2) { const a = sacks[0], b = sacks[1]; await Promise.all([hopTo(a, plateAt('L')), hopTo(b, plateAt('R'))]); if (S.oid !== my) return; await pourPair(a, b); if (S.oid !== my) return; await thud(R.tilt(a.n, b.n)); }
  else { const sd = ans.plate && (ans.plate.at === 'L' || ans.plate.at === 'R') ? ans.plate.at : sideFor(ans), other = sd === 'L' ? 'R' : 'L'; await bringTo(ans, sd); if (S.oid !== my) return;
    const rest = live().filter(x => x !== ans && x.where !== 'out'); for (let i = 0; i < rest.length; i++) { await bringTo(rest[i], other); if (S.oid !== my) return; await thud(R.tilt(plateAt('L').sack.n, plateAt('R').sack.n)); if (S.oid !== my) return; if (i < rest.length - 1) { await sleep(350); await toStand(rest[i].plate); if (S.oid !== my) return; } } }
  S.log.push({ autoWeigh: true }); await sleep(400); if (S.oid !== my) return; S.busy = false; S.closed = false; await finish(ans); }

/** 올려 본 자루를 모두 받침대로(상자는 자루 속으로) · 접시는 저울 양 끝에 하나씩 · 판자는 평평하게(손님이 처음부터 올려 볼 때). 물러난 자루는 그대로. */
async function homeAll(){ const my = S.oid; await Promise.all(live().filter(s => s.where === 'plate').map(async s => { await gather(s); if (S.oid !== my) return; if (s.plate) { s.plate.sack = null; s.plate.owner = null; } s.plate = null; scene.attach(s.g); s.where = 'ped'; s.poured = 0; const to = pedTop(s.seat); await stage.tween(s.g.position, { x: to.x, y: to.y, z: to.z }, 380, easeOut); s.g.position.copy(pedTop(s.seat)); }));
  if (S.oid !== my) return; for (const pl of plates) { clearPlate(pl); pl.at = 'hide'; pl.g.visible = false; } for (const s of live()) s.poured = s.where === 'ped' ? 0 : s.poured;
  for (const [i, sd] of [[0, 'L'], [1, 'R']]) { const pl = plates[i]; pl.at = sd; pl.side = sd; pl.g.visible = true; pl.g.scale.setScalar(1); pl.g.position.copy(seatPos(sd, 0)); } await level(300); }

// ── 한 문제의 시작 · 끝
function resetScene(){ for (const pl of plates) { stopTweens(pl.g.position); stopTweens(pl.g.scale); clearPlate(pl); pl.at = 'hide'; pl.g.visible = false; pl.g.scale.setScalar(1); }
  for (const b of BOX) if (b.used) freeBox(b);
  for (const s of sacks) { stopTweens(s.g.position); stopTweens(s.g.scale); stopTweens(s.inner.position); stopTweens(s.inner.rotation); scene.attach(s.g); s.where = 'off'; s.plate = null; s.poured = 0; s.fat = false; s.gift = false; s.bob = false; s.g.visible = false; s.g.scale.setScalar(1); s.inner.position.set(0, 0, 0); s.inner.rotation.set(0, 0, 0); s.mats.forEach(m => { m.emissiveIntensity = 0; }); s.wrap.className = 'tag off'; }
  stopTweens(beam.rotation); beam.rotation.z = 0; S.revealing = false; $('cloth').className = ''; flagOff(); glowOff();
  if (S.fox) { if (S.fox.s) S.fox.s = null; S.fox = null; } fox.obj.visible = false; S.foxAt = Infinity; sandPole.visible = sandBag.visible = false; sandBag.scale.setScalar(1); $('sand').classList.remove('on'); }
async function runProblem(p, ctx){ const my = S.oid;
  S.p = p; S.step = ctx.step; S.ev = ctx.ev; S.ctx = ctx; S.res = { retreat: false, hinted: false, missed: false }; S.closed = false; S.clock = 0; S.busy = true; S.hinting = false; S.out = []; S.stompAt = 0;
  S.sandS = R.sandS(S.cell, ctx.board); S.phase = ctx.step === 1 ? 'weigh' : 'ask'; S.cover = ctx.cover && ctx.step === 2 && !CALM ? R.coverAt(p) : -1; resetScene(); A.trayClear(); H.hide();
  const k = p.nums.length; peds.forEach((o, i) => { o.visible = i < k; o.position.set(i < k ? seatX(i, k) : 0, 0, T.PED_Z); }); stands.forEach(o => { o.visible = k === 3; });
  for (const [i, sd] of [[0, 'L'], [1, 'R']]) { const pl = plates[i]; pl.at = sd; pl.side = sd; pl.g.visible = true; pl.g.position.copy(seatPos(sd)); }
  const gift = ctx.surprise ? R.surpriseAt(p) : -1, fat = ctx.fat ? R.fatAt(p) : -1;
  p.nums.forEach((n, i) => { const s = sacks[i]; s.n = n; s.seat = i; s.where = 'ped'; s.g.visible = true; s.fat = i === fat; s.gift = i === gift; s.g.scale.setScalar(s.fat ? R.T.FAT_X : 1); s.mats.forEach(m => { m.emissiveIntensity = s.gift ? .45 : 0; }); s.g.position.copy(pedTop(i)).add(V(0, 2.4, 0)); tagPaint(s); });
  if (fat >= 0) S.log.push({ fat: p.nums[fat] }); if (gift >= 0) S.log.push({ gift: p.nums[gift] });
  if (ctx.ev.sand && ctx.step === 2 && !CALM) { sandPole.visible = sandBag.visible = true; }
  E.marbles(ctx.j, 3, 0); aim(innerWidth, innerHeight);
  await ensureGuest(p.ask === 'big' ? 'henry' : 'anne', !!ctx.last); if (S.oid !== my) return { abort: true };
  if (S.cover >= 0) $('cloth').className = 'on';
  await Promise.all(p.nums.map((_, i) => sleep(i * 90).then(() => stage.tween(sacks[i].g.position, { y: T.PED_H }, T.DROP_MS, easeIn)).then(() => { if (S.oid === my) { sacks[i].g.position.copy(pedTop(i)); thump(); } }))); if (S.oid !== my) return { abort: true };
  S.log.push({ start: p.nums.join(''), ask: p.ask, answer: p.answer, step: S.step, ev: Object.keys(S.ev).filter(x => S.ev[x] === true).join(' '), last: !!ctx.last, retry: !!p.retry, cover: S.cover, fat, gift, who: S.who });
  let told = false; if (S.step === 1) { if (ctx.j === 0 && ctx.firstStep) { told = H.tell('weigh.' + S.cell + '1', firstLine(), TELLS()); if (told) { tellPlace(); S.log.push({ told: firstLine() }); } } }
  else { askNow(); told = $('tell') && $('tell').classList.contains('on'); }
  if (S.cover >= 0) startReveal();
  S.foxAt = ctx.fox && S.step === 2 && !CALM ? S.t + 1.5 + Math.random() * 2.5 : Infinity;
  S.active = true; S.busy = false; S.lastAct = S.t + (told ? T.TELL_GRACE : 0);
  const out = await new Promise(res => { S.done = res; }); S.active = false; S.done = null; H.hide(); if (out === 'abort' || S.oid !== my) return { abort: true };
  const r = { ...S.res, clean: R.clean(S.res), out }; S.log.push({ problem: p.nums.join(''), ask: p.ask, step: S.step, ...r });
  await Promise.all([...live().filter(s => s.g.visible).map(s => stage.tween(s.g.scale, { x: .01, y: .01, z: .01 }, 220)), ...BOX.filter(b => b.used).map(b => stage.tween(b.o.scale, { x: .01, y: .01, z: .01 }, 220))]); if (S.oid !== my) return { abort: true }; await level(300); return r; }

// ── 나들이(판 셋) · 판(문제 셋)
const TELLS = () => ({ times: M.passed(M.get(S.cell || '')) ? 2 : 1e9 });
/** 하네스용: 문제를 정해 줌 — { nums, ask }. */
function forced(id, f){ const nums = f.nums.slice(), set = nums.slice().sort((a, b) => a - b); return { cell: id, nums, ask: f.ask, answer: R.answerOf({ nums, ask: f.ask }), set, key: set.join(','), retry: false }; }
async function outing(id){ const my = ++S.oid; E.showBar(true); S.cell = id; S.streak = 0; S.today = []; S.asked = {}; clearEnd(); const day = M.dayKey(); let prevStep = 0;
  let rec = M.get(id); S.back = M.stuckNow(rec) && !!rec.hand;
  let q = R.deal(id, S.hist[id] || [], Math.random, { small: M.stuck(rec) >= 1, first: rec.lastAsk === 'big' ? 'small' : 'big' }); if (S.forceP) { S.forceP.forEach((f, k) => { if (q[k] && f) q[k] = forced(id, f); }); S.forceP = null; }
  S.q = q; E.lanterns(0); S.log.push({ outing: id, deal: q.map(p => p.nums.join('') + p.ask[0]) });
  const b0 = S.startBoard | 0; S.startBoard = 0;   /* 하네스용: 셋째 판부터 */
  for (let b = b0; b < R.T.BOARDS; b++) { rec = M.get(id); const hand = !rec.hand || S.back;
    let ev = R.events(rec.evBoards, Math.random, { passed: M.passed(rec), calm: CALM, hand }); if (S.forceEv) { ev = { ...ev, ...S.forceEv }; S.forceEv = null; }
    if (hand) { q = R.handFix(q, b * R.T.PER_BOARD); S.q = q; }
    if (S.surpriseCarry && !hand) ev.surprise = true;
    const pickJ = on => (on ? (ev.at != null ? ev.at : Math.floor(Math.random() * 3)) : -1), coverJ = pickJ(ev.cover), foxJ = pickJ(ev.fox), surpJ = pickJ(ev.surprise), fatJ = pickJ(ev.fat);
    const askOf = q.slice(b * 3, b * 3 + 3).map(x => x.ask), pattern = askOf.every(a => a === 'big') ? 'big' : askOf.every(a => a === 'small') ? 'small' : 'mixed';
    S.board = { b, hand, ev }; S.log.push({ board: b, hand, sandS: R.sandS(id, b), asks: askOf.join(), ev: Object.keys(ev).filter(x => ev[x] === true).join(' ') });
    const results = []; E.marbles(0);
    for (let j = 0; j < R.T.PER_BOARD; j++) { const i = b * R.T.PER_BOARD + j, last = i === R.T.PER_BOARD * R.T.BOARDS - 1;
      const r = await runProblem(q[i], { step: hand ? 1 : 2, ev, board: b, j, last, cover: j === coverJ, fox: j === foxJ, surprise: j === surpJ, fat: j === fatJ, firstStep: b === b0 || (hand ? 1 : 2) !== prevStep });
      if (S.oid !== my || r.abort) return; results.push(r); E.marbles(j + 1); if (!r.clean) q = R.requeue(q, i); S.q = q; }
    prevStep = hand ? 1 : 2;
    const before = rec; rec = M.record(rec, results, day, { counts: !hand, hand, ev: !hand && !ev.none }); if (!hand) rec.lastAsk = pattern; if (hand) S.back = false; else if (M.stuckNow(rec)) S.back = true; M.put(id, rec); S.log.push({ boardEnd: b, clean: M.clean(results), rec: { ...rec } });
    await E.fly($('marbles'), $('coins'), art(ICON.coin), results.filter(r => r.out === 'sent').length); if (S.oid !== my) return; E.lanterns(b + 1); tone(660, .15, 'triangle', .1); tone(990, .2, 'triangle', .1, .12);
    if (!M.passed(before) && M.passed(rec)) { grew(art(ICON.flag) + ' 깃발을 땄어요!'); await sleep(2400); } else if (!M.kept(before) && M.kept(rec)) { grew(art(ICON.star) + ' 깃발에 별이 붙었어요!'); await sleep(2400); }
    if (S.oid !== my) return; await sleep(300); if (S.oid !== my) return; }
  S.hist[id] = q; await endScene(id, my); if (S.oid !== my) return;
  const items = S.today.map((n, k) => `<b class="ns" style="--k:${k};display:inline-block"><img class="ns" alt="" src="${NS.numsign(n, { px: 40, compact: true }).toDataURL()}"></b>`);
  const choice = await E.home({ items }); if (S.oid !== my) return;
  if (choice === 'again') outing(id); else location.href = GO; }
/** 나들이 끝 장면: 헨리의 큰 배와 앤의 나룻배에 오늘 실은 자루가 쌓여 있고 · 빈 저울이 한 번 까딱인 뒤 평평하게 선다. */
async function endScene(id, my){ S.p = null; A.trayClear(); resetScene(); bubble(null); S.ending = true; H.hide(); { const tl = $('tell'); if (tl) tl.classList.remove('on'); } for (const [i, sd] of [[0, 'L'], [1, 'R']]) { const pl = plates[i]; pl.at = sd; pl.side = sd; pl.g.visible = true; pl.g.position.copy(seatPos(sd, 0)); }   /* 빈 저울(빈 접시 둘) */ const l = L(), n = Math.max(1, S.today.length), hn = S.log.filter(x => x.loaded != null && x.who === 'henry').length, an = S.log.filter(x => x.loaded != null && x.who === 'anne').length;
  for (const who of ['henry', 'anne']) { const b = boats[who], m = l.moor[who]; stopTweens(b.g.position); b.g.visible = true; b.g.scale.setScalar(who === 'henry' ? T.BIG : 1); b.g.position.set(m[0], 0, m[1]); b.g.rotation.y = Math.PI; b.n = who === 'henry' ? Math.max(1, hn) : Math.max(1, an); b.load.visible = true; b.load.scale.setScalar(.8 + .12 * Math.min(b.n, 5));
    const g = guests[who]; stopTweens(g.obj.position); g.obj.visible = true; g.obj.position.set(l.guest[0] + (who === 'anne' ? .1 : -.4), 0, l.guest[1] + (who === 'anne' ? .75 : -.35)); g.obj.rotation.y = -Math.PI / 2 + .4; actPlay(g, 'Wave'); }
  S.who = null; await stage.tween(beam.rotation, { z: .12 }, 250); await stage.tween(beam.rotation, { z: -.08 }, 250); await stage.tween(beam.rotation, { z: 0 }, 300, easeOut);
  S.log.push({ endScene: n, henry: hn, anne: an }); confetti(14); [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, 'triangle', .1, .2 + i * .12)); await sleep(1400); }
function clearEnd(){ S.ending = false; for (const who of ['henry', 'anne']) { const b = boats[who], g = guests[who]; if (!b || !g) continue; stopTweens(b.g.position); b.g.visible = false; b.n = 0; b.load.visible = false; stopTweens(g.obj.position); g.obj.visible = false; actPlay(g, 'Idle'); } S.who = null; }
/** 하네스 · 교사용: 지금 나들이를 거둔다. */
function abort(){ S.oid++; S.active = false; if (S.done) { const d = S.done; S.done = null; d('abort'); } stage.tweens.length = 0; A.trayClear(); resetScene(); clearEnd(); bubble(null); S.p = null; S.busy = false; TL.stop(); H.hide(); S.phase = 'idle';
  const hm = document.getElementById('home'); if (hm) hm.classList.remove('on'); }

// ── 한 장면의 일
stage.frame((dt, t) => { S.t = t; if (!S.ready) return;
  const thinking = S.active && !S.busy && !S.closed;
  for (const pl of plates) if ((pl.at === 'L' || pl.at === 'R') && !moving(pl.g.position)) pl.g.position.copy(seatPos(pl.at));   /* 접시는 판자 끝을 따라 오르내리되 늘 평평하다 */
  const pulse = .3 + .3 * Math.sin(t * 7); for (const b of BOX) if (b.used) b.mats.forEach(m => { m.emissiveIntensity = b.glow ? pulse : 0; }); for (const pl of plates) pl.mats.forEach(m => { m.emissiveIntensity = pl.glow ? pulse + .2 : 0; });
  for (const s of sacks) if (s.gift && s.where !== 'off') s.mats.forEach(m => { m.emissiveIntensity = .35 + .2 * Math.sin(t * 4); });
  if (S.revealing && S.active && !S.busy && !S.closed && t >= S.revealT) revealStep();
  /* 새는 모래 자루: 생각하는 동안에만(저울이 움직이는 동안 · 가려진 자루가 나오는 동안은 멈춤) · 끝이 가까우면 손님이 발을 구른다 */
  const sandRun = thinking && S.ev.sand && S.step === 2 && !CALM && !S.revealing;
  if (sandRun) { S.clock = Math.min(1, S.clock + dt / S.sandS); if (S.clock > T.STOMP_AT && t > S.stompAt) { S.stompAt = t + 1.3; stomp(); } if (S.clock >= 1) miss(); }
  sandDraw(sandRun);
  if (thinking && t > S.foxAt) { S.foxAt = Infinity; foxStart(); } foxStep(dt);
  for (const s of sacks) tagPlace(s); tagsApart(); clothPlace(); bubblePlace(); flagPlace();
  /* 길잡이 손: 가만히 있으면 — 고르는 중이면 맞는 자루(뜨면 그 문제는 깨끗하지 않음) · 올려 보는 중이면 다음에 올릴 자루 */
  const wait = R.T.HINT_AFTER * (M.stuck(M.get(S.cell || '')) >= 1 ? .5 : 1);
  if (thinking && t - S.lastAct > wait && !S.hinting) { S.hinting = true; S.hintAt = t; if (S.phase === 'ask') { S.res.hinted = true; S.log.push({ hinted: true }); } hintShow(); }
  if (S.hinting && thinking && t - S.hintAt > 1.2) { S.hintAt = t; hintShow(); }
  if (!thinking && S.hinting) { S.hinting = false; H.hide(); } });
function hintShow(){ if (!S.p) return; const s = S.phase === 'ask' ? sacks[S.p.answer] : live().find(x => x.where === 'ped'); if (!s) return; const r = sackHit(s); if (!r) return; S.log.push({ hintAt: s.seat }); H.show(r.x, r.bottom - 8); }

window.__weigh = { S, R, M, E, T, TL, NS, stage, wallet, K, fitH, outing, abort, endScene: () => endScene(S.cell, S.oid), keyRects, hitAt, miss,
  /** 하네스: 자루 k 의 누르는 곳(가운데) · 꼬리표 네모 · 손님 · 여우 · 저울 */
  sackAt: k => { const r = sackHit(sacks[k]); return r && { x: r.x, y: r.y, left: r.left, right: r.right, top: r.top, bottom: r.bottom }; }, tagAt: k => { const r = rectOf(sacks[k].wrap); return r && { x: r.left + r.width / 2, y: r.top + r.height / 2, left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width }; },
  guestAt: () => { const r = S.who && rect3(guests[S.who].obj); return r && { x: (r.left + r.right) / 2, y: r.top + r.height * .45, ...r }; }, foxAt: () => { const r = fox.obj.visible ? rect3(fox.obj) : null; return r && { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 }; },
  scaleAt: () => { const q = stage.screenOf(V(0, PIV_Y * .5, .2)); return q; }, beamEndAt: sd => stage.screenOf(seatPos(sd).add(V(0, -.02, 0))),
  /** 하네스: 꼬리표 [{ n, seat, px, dim, where, w }] · 접시 [{ at, n(상자 수), sack(그 자루의 수), own }] · 판자 각도 · 상자끼리 겹침 */
  signs: () => sacks.filter(s => s.where !== 'off' && !s.wrap.classList.contains('off')).map(s => ({ n: s.n, seat: s.seat, px: +s.cv.dataset.numpx, dim: s.wrap.classList.contains('dim'), where: s.where, w: s.cv.width / Math.min(2, devicePixelRatio || 1), fat: s.fat, gift: s.gift, scale: +s.g.scale.x.toFixed(2) })),
  plates: () => plates.filter(p => p.at !== 'hide').map(p => ({ at: p.at, n: p.boxes.length, sack: p.sack ? p.sack.n : null, own: p.boxes.every(b => !p.sack || b.owner === p.sack) })), angle: () => beam.rotation.z,
  boxGap: () => { let g = 9; for (const p of plates) { if (p.at === 'hide') continue; const ws = p.boxes.map(b => b.o.getWorldPosition(V())); for (let i = 0; i < ws.length; i++) for (let j = i + 1; j < ws.length; j++) g = Math.min(g, Math.hypot(ws[i].x - ws[j].x, ws[i].z - ws[j].z)); } return g; },
  boxLevel: () => plates.filter(p => p.at !== 'hide' && p.boxes.length).every(p => { const ys = p.boxes.map(b => b.o.getWorldPosition(V()).y); return Math.max(...ys) - Math.min(...ys) < .02; }),
  sackXs: () => live().map(s => ({ seat: s.seat, x: stage.screenOf(s.g.getWorldPosition(V())).x })), who: () => S.who, guestVisible: w => guests[w].obj.visible, boatN: w => boats[w].n, sandScale: () => sandBag.scale.x, sandOn: () => sandBag.visible, foxState: () => S.fox && { phase: S.fox.phase, n: S.fox.s ? S.fox.s.n : null }, chase,
  sackWhere: () => live().map(s => s.where), boatScale: w => boats[w].g.scale.x,
  /** 하네스: 모든 물체가 제자리인가(저울 위 접시 = 판자 끝 · 옆 받침대 접시 = 받침대 위 · 접시 위 자루 = 자루 자리 · 받침대 자루 = 받침대 위) */
  posOk: () => { const bad = []; for (const pl of plates) { if (pl.at === 'hide') continue; const w = pl.g.position, to = pl.at.length === 1 ? seatPos(pl.at) : standTop(pl.at.slice(1)); if (w.distanceTo(to) > .02) bad.push('plate' + pl.at); if (pl.sack && pl.sack.g.position.distanceTo(sackLocal(pl)) > .02) bad.push('sack' + pl.sack.n); pl.boxes.forEach((b, k) => { if (b.o.position.distanceTo(boxLocal(pl, k)) > .02) bad.push('box' + pl.at + k); }); }
    for (const s of live()) if (s.where === 'ped' && s.g.position.distanceTo(pedTop(s.seat)) > .02) bad.push('ped' + s.n); if (S.who) { const g = guests[S.who].obj.position, l = L(); if (Math.hypot(g.x - l.guest[0], g.z - l.guest[1]) > .05) bad.push('guest'); } return bad; }, sackPos: k => { const s = sacks[k], to = pedTop(s.seat), w = s.g.getWorldPosition(V()); return Math.hypot(w.x - to.x, w.z - to.z); } };
if (!GO_NOW) build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
