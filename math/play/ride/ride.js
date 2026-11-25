/* 타고 내리기 틀 「들락날락 동물 집」(3D, T08) — 풀밭의 집 한 채에 동물들이 들어가는 것을 지켜본 뒤, 본 것을 말과 식으로 적고, 문을 두드려 연다.
 * 집 안은 가려져 있다 — 문이 열려 동물들이 한 줄로 나와 설 때 내가 적은 것이 맞았는지 눈으로 확인된다. 동물에는 손을 대지 않는다(손은 적기와 문 열기뿐).
 * 설계: 핸드오프 kedu/math-play-work/T08_타고내리기_틀.md · 정본 kmotion/math-wizard/27_수학놀이터_내용지도와_틀_설계_v1.md(4 · 5절 · 5-9 · 5-10 · 5-11). 규칙 = ./rules.js(화면 없음).
 * 한 나들이 = 낱칸 하나(B06 덧셈 이야기 · B07 덧셈식 읽고 쓰기 · B08 덧셈 합 5까지 · B09 합 9까지) · 판 = 문제 셋 · 나들이 = 판 셋.
 *   B06 ① 따라 말하기(띠가 저절로 적힘 → 문 → 세어서 「모두 ?마리」) ② 이야기 채우기(빈칸 둘 → 문 → 세어서) — `+` `=` 는 한 번도 없다.
 *   B07 문이 저절로 열려 모두 나와 선다 ① 수 놓기(□ + □ = □) ② 식 짓기(빈 다섯 칸 · 딱지 통) → 종. 맞으면 읽는 말.
 *   B08 · B09 식은 저절로 적힌다 ① 창으로 보기 ② 덧문 닫힘 — 수 카드 → 문패 → 문. 걸음 ② 판의 셋째 문제는 「식 먼저」.
 * 장면(들어감)과 마당 줄(나옴)은 시계 하나에 딸린 자리 셈이다(tween 을 걸지 않는다) — 다시 보기 · 건너뛰기 · 화면 돌리기가 어느 때 와도 동물이 제자리에 있고, 수가 늘 a + b 다.
 * 사건(rules.js events): 해 질 녘(시계 · 적는 동안에만) · 우르르 · 바람 · 방울 단 손님 · 닫힌 덧문/식 먼저(통과 뒤) · 신바람. 사건은 수를 바꾸지 않는다.
 * 누름에는 늘 답이 있다(5-11). 소리는 common/tell.js — 없으면 조용히 넘어간다. 그림은 기성 3D 재료만(./assets · 이름표 ./art.js) — 코드로 그린 것은 땅(풀밭 평면)뿐이고, 문패 · 발자국 · 세는 수 · 해는 화면 위 그림. */
import { createStage, THREE, CALM, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=2';
import * as C from '../common/choose.js?v=3';
import * as H from '../common/hint.js?v=5';
import { wallet, audio, tone, confetti, grew } from '../common/kit.js?v=8';
import { art } from '../common/art.js?v=10';
import * as E from '../common/ends.js?v=1';
import * as M from '../common/map.js?v=8';
import * as TL from '../common/tell.js?v=2';
import * as NS from '../common/numsign.js?v=3';
import * as R from './rules.js?v=2';
import { ASSETS, MODEL, ANIMALS, ANIMAL, SCENERY, SCENERY_NAMES, GRASS, GLOW, DOOR_TINT, DARK, SHUTTER_TINT, LAMP, DAY, DUSK, ICON } from './art.js?v=2';

// ── 내가 정한 수치(화면 · 움직임 — 준호가 보고 바꾼다). 문제 · 사건 · 시계 수치는 ./rules.js 의 T
const T = { HS: 1.3, WALL_Z: .85, DOOR_W: .5, DOOR_H: .78, DOOR_Y: .17, WIN_W: 1.86, WIN_H: .86, WIN_Y: 1.5, CELL: .36,
  COL: .5, GAP: .28, CL_DX: .4, LANE_Z: .85, DF_Z: .85, DI: [0, .17, -.3],
  BELL: [1.0, .3], BELL_H: .42, STUMP_H: .26, PLATE: [.9, 1.16, .3], PAW: [-.9, .64, .2], STAMP: [2.1, 0, 1.9], FENCE_H: .5,
  OUT_GAP: .22, OUT_WALK: .8, HOP_GAP: .42, HOP_S: .38, HOP_Y: .3, RE_DX: 1.15, RE_S: 2.1, SPIN_S: .8, REG_S: .9, BIG: 1.12, DOOR_OPEN: 105, WIN_OPEN: 100,
  /* 화면 꼴마다: 마당 두 줄의 z · 양쪽 무리의 자리 [첫 칸 x, 윗줄 z, 아랫줄 z] · 들어올 x 너비(span) · 문패 크기 · 세는 수 크기 */
  WIDE: { fov: 34, elev: .58, plate: 60, cnt: 1.2, an: 1.1, rows: [1.7, 2.7], clL: [-2.45, 1.7, 2.7], clR: [.85, 1.7, 2.7], span: 2.75 },
  TALL: { fov: 44, elev: .66, plate: 46, cnt: 1.05, an: 1.42, rows: [1.75, 2.8], clL: [-1.78, 1.45, 2.15], clR: [.18, 3.0, 3.7], span: 2.02 },
  LOW: { fov: 30, elev: .44, plate: 40, cnt: .8, an: 1.3, rows: [1.7, 2.65], clL: [-2.45, 1.7, 2.65], clR: [.85, 1.7, 2.65], span: 2.75 },
  TELL_GRACE: 4, CLOSE_MS: 1500, READ_MS: 2600 };
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const GO = '/math/play/go/';
const WANT = Q.get('cell'), GO_NOW = !WANT || !R.CELLS[WANT];   /* ?cell= 없이 열리면 모형을 불러오기 전에 고르는 화면으로 */
if (GO_NOW) location.replace(GO);
const S = { ready: false, busy: true, active: false, t: 0, oid: 0, cell: null, p: null, res: null, step: 2, ev: {}, ctx: {}, board: null, clock: 0, duskS: 16, streak: 0, closed: false, lastAct: 0, back: false, surpriseCarry: false, hist: {}, log: [],
  tall: false, low: false, small: false, phase: 'idle', w: [], btn: [], gone: {}, cards: {}, f: {}, upto: 0, outside: false, played: false, first: false, blind: false, replaying: false, bellI: -1, wind: null, windDone: true, windAt: Infinity, big: 1, kind: null, lastKind: null,
  v: { mode: 'none', t: 0 }, door: { want: false, wig: false, ang: 0 }, win: { open: false, ang: 0 }, today: [], hinting: false, hintAt: 0, told: {}, readK: 0, laneX: 6, dusk: 0 };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 60, fog: [26, 80], shadow: { left: -9, right: 9, top: 8, bottom: -6 }, assets: ASSETS }), { scene, camera } = stage;
const K = {};
const NAMES = [...new Set([...Object.values(MODEL), ...SCENERY_NAMES])];
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const L = () => (S.tall ? T.TALL : S.low ? T.LOW : T.WIDE);
const mode = () => (S.p ? R.CELLS[S.p.cell].mode : S.cell ? R.CELLS[S.cell].mode : 'sum');
const lerp = (a, b, u) => a + (b - a) * u, clamp01 = u => Math.max(0, Math.min(1, u));

// ── 놓기
/** 키 h 로 맞춰 바닥 가운데에. */
function fitH(g, h, ry = 0){ const o = g.scene.clone(); o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o), s = h / Math.max(.0001, b.max.y - b.min.y); o.scale.multiplyScalar(s); o.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(o), c = b2.getCenter(V()); o.position.sub(V(c.x, b2.min.y, c.z)); const w = new THREE.Group(); w.add(o); w.rotation.y = ry; stage.shadows(w); return w; }
/** 모형을 w × h × d 로 맞춰 가운데에(문짝 · 납작하게 누른 상자 판). tint 를 주면 빛깔을 입힌다(k = 섞는 몫). */
function fitBox(g, w, h, d, tint = null, k = 1){ const o = g.scene.clone(), wrap = new THREE.Group(); wrap.add(o); wrap.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(wrap), s = b.getSize(V()); o.scale.set(w / Math.max(.0001, s.x), h / Math.max(.0001, s.y), d / Math.max(.0001, s.z)); wrap.updateMatrixWorld(true);
  const c = new THREE.Box3().setFromObject(wrap).getCenter(V()); o.position.sub(c); const mats = []; o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); if (tint) m.material.color.lerp(new THREE.Color(tint), k); mats.push(m.material); } }); stage.shadows(wrap); wrap.userData.mats = mats; return wrap; }
const rigH = rig => { rig.scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(rig.scene); return Math.max(.0001, b.max.y - b.min.y); };
const actOf = (p, base) => Object.keys(p.acts).find(k => k === base || k.endsWith('|' + base)) || null;
const actPlay = (p, base, once) => { const n = actOf(p, base); if (n) stage.play(p, n, once); };

// ── 짓기
let field = null, houseG = null, doorPivot = null, bellG = null, bellIn = null; const shutters = [], lampMats = [], scen = { WIDE: [], TALL: [] }, AN = [], CNT = [], GRP = [];
async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); }));
  stage.sea.visible = false; stage.deep.visible = false; stage.renderer.localClippingEnabled = true;   /* 뭍이다 — 바다 평면은 쓰지 않는다 */
  field = new THREE.Mesh(new THREE.PlaneGeometry(240, 160).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: GRASS, roughness: .95, flatShading: true })); field.receiveShadow = true; scene.add(field);
  /* 집: 박공 앞면(벽)이 z = 0 에 오게 · 앞벽 아래 가운데가 무리의 원점(마지막 문제에 커져도 벽은 제자리) */
  houseG = new THREE.Group(); scene.add(houseG); { const hm = K[MODEL.house].scene.clone(); hm.scale.setScalar(T.HS); hm.position.z = -T.WALL_Z * T.HS; hm.traverse(m => { if (m.isMesh && /window/i.test(m.material.name || '')) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(LAMP); m.material.emissiveIntensity = 0; lampMats.push(m.material); } }); houseG.add(stage.shadows(hm)); }
  { const dark = fitBox(K[MODEL.panel], T.DOOR_W + .06, T.DOOR_H + .05, .04, DARK, .92); dark.position.set(0, T.DOOR_Y + T.DOOR_H / 2, .07); houseG.add(dark);   /* 문 안의 어둠 */
    doorPivot = new THREE.Group(); doorPivot.position.set(-T.DOOR_W / 2, T.DOOR_Y, .12); const door = fitBox(K[MODEL.door], T.DOOR_W, T.DOOR_H, .06, DOOR_TINT, .45); door.position.set(T.DOOR_W / 2, T.DOOR_H / 2, 0); doorPivot.add(door); houseG.add(doorPivot); }
  { const dark = fitBox(K[MODEL.panel], T.WIN_W, T.WIN_H, .04, DARK, .92); dark.position.set(0, T.WIN_Y + T.WIN_H / 2, .08); houseG.add(dark);   /* 창 안의 어둠 · 덧문 둘 */
    for (const sd of [-1, 1]) { const pv = new THREE.Group(); pv.position.set(sd * T.WIN_W / 2, T.WIN_Y + T.WIN_H / 2, .14); const sh = fitBox(K[MODEL.panel], T.WIN_W / 2 + .01, T.WIN_H + .02, .05, SHUTTER_TINT, .5); sh.position.x = -sd * T.WIN_W / 4; pv.add(sh); for (const m of sh.userData.mats) { m.emissive = new THREE.Color(LAMP); m.emissiveIntensity = 0; lampMats.push(m); } houseG.add(pv); shutters.push({ pv, sd }); } }
  /* 종(B07 — 그루터기 위) · 울타리 */
  bellG = new THREE.Group(); { const st = fitH(K[MODEL.stump], T.STUMP_H); bellIn = fitH(K[MODEL.bell], T.BELL_H); bellIn.position.y = T.STUMP_H - .03; bellG.add(st, bellIn); } bellG.position.set(T.BELL[0], 0, T.BELL[1]); bellG.visible = false; scene.add(bellG);
  { const f0 = fitH(K[MODEL.fence], T.FENCE_H), fw = new THREE.Box3().setFromObject(f0).getSize(V()).x; for (const sd of [-1, 1]) for (let k = 0; k < 5; k++) { const f = fitH(K[MODEL.fence], T.FENCE_H); f.position.set(sd * (1.42 * T.HS * .78 + fw / 2 + k * fw), 0, -.4); scene.add(f); } }
  for (const kd of ['WIDE', 'TALL']) for (const [n, x, z, h, ry] of SCENERY[kd]) { const o = fitH(K[n], h, ry); o.position.set(x, 0, z); o.visible = false; scene.add(o); scen[kd].push(o); }
  /* 화면 위 그림: 동전 · 문패 · 발자국 · 세는 수 · 무리 이름표 · 찍힌 수 · 방울 · 해 · 저녁 빛 · 읽는 말 */
  const c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); coinsDraw(); wallet.onChange(() => coinsDraw());
  for (const id of ['plate', 'paw', 'stamp', 'sun', 'veil', 'readline', 'jingle']) { const d = document.createElement('div'); d.id = id; document.body.appendChild(d); }
  $('plate').className = 'off'; $('plate').appendChild(NS.numsign(1, { px: 60, compact: true, back: true })); $('paw').className = 'off'; $('paw').innerHTML = art(ICON.paw); $('stamp').appendChild(NS.numsign(1, { px: 60, compact: true })); $('sun').innerHTML = art(ICON.sun); $('jingle').className = 'jingle'; $('jingle').innerHTML = art(ICON.bell);
  for (let k = 0; k < 9; k++) { const d = document.createElement('div'); d.className = 'cnt'; document.body.appendChild(d); CNT.push(d); }
  for (let k = 0; k < 3; k++) { const d = document.createElement('div'); d.className = 'grp' + (k === 2 ? ' all' : ''); document.body.appendChild(d); GRP.push(d); }
  A.trayClear(); $('tray').addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('b.fill'); if (b) { e.stopPropagation(); audio(); onCell(+b.dataset.k); } });
  stage.sun.position.set(4, 9, 6); stage.onResize = aim; stage.resize();
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
  TL.button(on => { S.log.push({ sound: on }); });
  await herd(S.forceKind || ANIMALS[0]);
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true;
  outing(WANT); }
function coinsDraw(pop){ const c = $('coins'); if (!c) return; const v = `${art(ICON.coin)}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; } if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }
/** 이 나들이의 동물 아홉 마리(한 종류). 앞 나들이의 동물은 거둔다. */
async function herd(kind){ if (S.kind === kind && AN.length) return; if (!K[kind]) K[kind] = await stage.load(kind); for (const an of AN) stage.unperson(an.p); AN.length = 0; const rig = K[kind], a = ANIMAL[kind], base = a.h / rigH(rig);
  for (let i = 0; i < 9; i++) { const p = stage.person(rig, { scale: base }), mats = [], clip = new THREE.Plane(V(0, 1, 0), 99);   /* 창에서는 제 줄 아래가 잘린다(그 밖에는 자르지 않는다) */ p.obj.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(GLOW); m.material.emissiveIntensity = 0; m.material.clippingPlanes = [clip]; mats.push(m.material); m.frustumCulled = false; } }); p.obj.visible = false; actPlay(p, 'Idle'); AN.push({ i, p, base, mats, a, clip, cut: -99, state: 'off', vis: false, head: false, pos: V(), sc: 1 }); }
  rig.scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(rig.scene); S.noseZ = b.max.z * base; S.kind = kind; }

// ── 자리(마당 · 길 · 문 · 창) — 화면 꼴과 상관없이 같다(화면을 돌려도 동물이 그대로 제자리다). 길의 시작만 화면 밖으로 맞춘다
/** 마당에 나와 서는 자리(정본 5-10절 — 다섯씩 한 줄 · 윗줄 다섯 + 아랫줄): 처음 무리와 온 무리 사이에 틈. */
function lineSpot(k, a){ const s = R.spot(k, a); return V((s.col - 2) * T.COL + (s.gap ? T.GAP : 0), 0, L().rows[s.row]); }
/** 양쪽에서 모일 때 서는 자리(왼쪽 무리 · 오른쪽 무리 — 저마다 다섯씩 한 줄). */
const sideSpot = (k, sd) => { const c = sd < 0 ? L().clL : L().clR; return V(c[0] + (k % 5) * T.CL_DX, 0, c[1 + Math.floor(k / 5)]); };
const DF = () => V(0, 0, T.DF_Z), DI = () => V(T.DI[0], T.DI[1] * S.big, T.DI[2]);
/** 창의 머리 자리(들어간 차례대로 · 윗줄 다섯 + 아랫줄) → 동물이 설 자리(머리만 벽 밖으로 나온다). */
function headSpot(rank, an){ const col = rank % 5, row = Math.floor(rank / 5), g = S.big, a = an.a, x = (col - 2) * T.CELL * g, top = (T.WIN_Y + T.WIN_H - row * T.WIN_H / 2) * g; an.cut = top - T.WIN_H / 2 * g + .015;   /* 제 줄의 아래 끝에서 잘린다(머리와 목만 보인다) */ return V(x, top - .03 - a.h * a.win, .1 + a.nose - S.noseZ * a.win); }
function startPt(x){ if (x.from === 'yard') return lineSpot(x.k, S.p.a); const sd = x.from === 'left' ? -1 : 1; if (x.stand != null) return V(sd * S.laneX, 0, sideSpot(x.k, sd).z);   /* 양쪽에서 모임: 제 줄 높이로 들어온다 */
  return V(sd * (S.laneX + (S.sc.rush ? x.k * .3 : 0)), 0, T.LANE_Z + (S.sc.rush ? ((x.k % 3) - 1) * .22 : 0)); }
const standPt = x => (x.from === 'yard' ? lineSpot(x.k, S.p.a) : sideSpot(x.k, x.from === 'left' ? -1 : 1));
/** 꺾은 길 위의 자리: pts 를 길이로 따라 u(0~1) 만큼. → { pos, dir } */
function along(pts, u){ let len = 0; const seg = []; for (let k = 1; k < pts.length; k++) { const d = pts[k].distanceTo(pts[k - 1]); seg.push(d); len += d; } let at = clamp01(u) * len; for (let k = 0; k < seg.length; k++) { if (at <= seg[k] || k === seg.length - 1) { const w = seg[k] > 0 ? clamp01(at / seg[k]) : 1; return { pos: pts[k].clone().lerp(pts[k + 1], w), dir: pts[k + 1].clone().sub(pts[k]) }; } at -= seg[k]; } return { pos: pts[0].clone(), dir: V(0, 0, 1) }; }
/** 장면의 때 t 에 i 번째 동물이 있는 곳(규칙의 stateAt 이 정한 「길 · 마당 · 집 안」 그대로). */
function scenePose(i, t, v){ const x = v.sc.list[i], state = R.stateAt(x, t), an = AN[i];
  if (state === 'in') return v.heads ? { state, vis: true, head: true, pos: headSpot(x.rank, an), face: 0, sc: an.a.win } : { state, vis: false };
  if (t < x.show) return { state, vis: false };
  if (x.stand != null && t < x.stand) { const r = along([startPt(x), standPt(x)], (t - x.show) / Math.max(.001, x.stand - x.show)); return { state, vis: true, pos: r.pos, dir: r.dir, moving: true }; }
  if (x.stand != null && t < x.go) return { state, vis: true, pos: standPt(x), face: 0 };
  const u = (t - x.go) / Math.max(.001, x.enter - x.go), r = along([x.stand != null ? standPt(x) : startPt(x), DF(), DI()], u); return { state, vis: true, pos: r.pos, dir: r.dir, moving: true, sc: u > .86 ? 1 - (u - .86) / .14 * .45 : 1 }; }
/** 문이 열린 뒤의 때 t 에 i 번째 동물이 있는 곳: 한 마리씩 나와 제 자리에 선다 · 폴짝(세어짐) · 비켰다 붙기(다시 보여 주기) · 한 바퀴(신바람). */
function outPose(i, t, v){ const e = i * T.OUT_GAP, an = AN[i], spot = lineSpot(i, v.a);
  if (t < e) return { state: 'in', vis: false };
  if (t < e + T.OUT_WALK) { const u = (t - e) / T.OUT_WALK, r = along([DI(), DF(), spot], u); return { state: 'out', vis: true, pos: r.pos, dir: r.dir, moving: true, sc: u < .14 ? .55 + u / .14 * .45 : 1 }; }
  const pos = spot.clone(); let face = 0;
  if (v.hop) { const u = (t - (v.hop.t0 + i * T.HOP_GAP)) / T.HOP_S; if (u > 0 && u < 1) pos.y = T.HOP_Y * Math.sin(Math.PI * u); }
  if (v.re) { const u = t - v.re.t0; if (i >= v.a) pos.x += T.RE_DX * (u < 0 ? 0 : u < .5 ? u / .5 : u < 1.3 ? 1 : u < 1.9 ? 1 - (u - 1.3) / .6 : 0); else if (u > 0 && u < .4) pos.y = .16 * Math.sin(Math.PI * u / .4); }
  if (v.spin) { const u = (t - v.spin.t0) / T.SPIN_S; if (u > 0 && u < 1) face = Math.PI * 2 * u; }
  if (v.reg) { const u = clamp01((t - v.reg.t0) / T.REG_S); if (u > 0) { const to = regSpot(i, v), e2 = u < .5 ? 2 * u * u : 1 - (2 - 2 * u) ** 2 / 2, y = pos.y; pos.copy(spot.clone().lerp(to, e2)); pos.y = y; if (u < 1) return { state: 'out', vis: true, pos, dir: to.clone().sub(spot), moving: true }; } }
  return { state: 'out', vis: true, pos, face }; }
/** B07 을 맞힌 뒤 「식의 수 아래로 가서 선다」: 식에 먼저 적힌 수의 무리가 왼쪽 · 다음 수의 무리가 오른쪽(무리마다 다섯씩 한 줄 — 양쪽에서 모일 때 서는 자리). */
const regFirst = (i, v) => { const inA = i < v.a; return v.reg.swap ? !inA : inA; };
function regSpot(i, v){ const inA = i < v.a; return sideSpot(inA ? i : i - v.a, regFirst(i, v) ? -1 : 1); }
function poseAll(){ const v = S.v;
  for (const an of AN) { let r = { state: 'off', vis: false };
    if (v.mode === 'scene' && an.i < v.sc.n) r = scenePose(an.i, v.t, v); else if (v.mode === 'out' && an.i < v.n) r = outPose(an.i, v.t, v); else if (v.mode === 'end' && an.i < v.n) r = { state: 'out', vis: true, pos: V((an.i - (v.n - 1) / 2) * (S.tall ? .44 : T.COL), 0, (L().rows[0] + L().rows[1]) / 2), face: 0 };
    const o = an.p.obj; an.state = r.state; an.vis = !!r.vis; an.head = !!r.head; o.visible = an.vis; if (!an.vis) continue;
    an.sc = (r.sc || 1) * (r.head ? 1 : L().an); an.clip.constant = r.head ? -an.cut : 99; o.position.copy(r.pos); an.pos.copy(r.pos); o.scale.setScalar(an.base * an.sc); o.rotation.y = r.dir ? Math.atan2(r.dir.x, r.dir.z) : (r.face || 0);
    actPlay(an.p, r.moving ? (v.gallop ? 'Gallop' : 'Walk') : 'Idle'); const glow = an.i === S.bellI && v.mode !== 'end' ? .35 + .25 * Math.sin(S.t * 6) : 0; for (const m of an.mats) m.emissiveIntensity = glow; } }
/** 지금 동물들이 있는 곳을 센다(하네스 · 기록): 집 안 · 마당 · 길 위 · 나와 선 것. */
function tally(){ const o = { in: 0, yard: 0, road: 0, out: 0, n: 0 }; for (const an of AN) if (an.state !== 'off') { o[an.state]++; o.n++; } return o; }
function placeWorld(){ for (const kd of ['WIDE', 'TALL']) scen[kd].forEach(o => { o.visible = (kd === 'TALL') === S.tall; }); houseG.scale.setScalar(S.big); }

// ── 카메라: 창 위 끝 · 마당 두 줄 · 양쪽 무리가 다 들어오게 · 맨 위는 띠와 카드 바로 아래(지붕은 카드 뒤로 가도 된다)
const room = () => { const m = mode(); return S.tall ? (m === 'story' ? 282 : 214) : S.low ? (m === 'story' ? 176 : 140) : 296; };
function aim(w = innerWidth, h = innerHeight){ const tall = h > w * 1.05; S.tall = tall; S.low = !tall && h < 560; S.small = Math.min(w, h) < 400; const l = L(), g = S.big; camera.fov = l.fov; camera.aspect = w / h; placeWorld();
  const top = room() + 6, bottom = h - (S.ending ? (tall ? 250 : S.low ? 150 : 230) : tall ? 44 : S.low ? 24 : 44),   /* 끝 장면: 아래의 「돌아가기」 몫을 비워 동물 줄이 보이게 */ mx = tall ? 4 : 14, wy = (T.WIN_Y + T.WIN_H) * g + .06, sp = l.span, z1 = Math.max(l.rows[1], l.clL[2], l.clR[2]) + .32, z0 = Math.min(l.rows[0], l.clL[1]);
  const pts = [[V(-1.0 * g, wy, .1), 0, 0, 6, 0], [V(1.0 * g, wy, .1), 0, 0, 0, 6], [V(-sp, 0, z1), 0, 30, 0, 0], [V(sp, 0, z1), 0, 30, 0, 0], [V(-sp, .75, z0), 0, 0, 2, 0], [V(sp, .75, z0), 0, 0, 0, 2]];
  const box = () => { let a = 1e9, b = -1e9, c = 1e9, e = -1e9; for (const [p, pt, pb, pl, pr] of pts) { const q = p.clone().project(camera), x = (q.x + 1) / 2 * w, y = (1 - q.y) / 2 * h; a = Math.min(a, x - pl); b = Math.max(b, x + pr); c = Math.min(c, y - pt); e = Math.max(e, y + pb); } return { l: a, r: b, t: c, b: e }; };
  let dist = 6; for (let k = 0; k < 90; k++) { camera.position.set(0, 1.0 + dist * l.elev, 1.0 + dist); camera.lookAt(0, 1.0, 1.0); camera.clearViewOffset(); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const bx = box(); if (bx.r - bx.l <= w - 2 * mx && bx.b - bx.t <= bottom - top) break; dist *= 1.035; }
  const bx = box(), dx = (bx.l + bx.r) / 2 - w / 2, dy = top - bx.t + Math.max(0, (bottom - top) - (bx.b - bx.t)) * .3; camera.setViewOffset(w, h, dx, -dy, w, h); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  { const a = stage.screenOf(V(0, 0, T.LANE_Z)).x, b = stage.screenOf(V(1, 0, T.LANE_Z)).x, ppu = Math.max(1, b - a); S.ppu = ppu; S.laneX = Math.max(l.span + .8, (w / 2) / ppu + .9); }
  platePaint(); $('paw').classList.toggle('small', tall || S.low); C.place(); if (S.ready) setTimeout(tellPlace, 80); }

// ── 화면 위 그림: 문패 · 발자국 · 세는 수 · 이름표 · 찍힌 수 · 방울 · 해
const hw = (x, y, z) => stage.screenOf(houseG.localToWorld(V(x, y, z)));
const rectOf = el => (el && !el.classList.contains('off') && !el.hidden && getComputedStyle(el).display !== 'none' ? el.getBoundingClientRect() : null);
function bobEl(el, cls = 'bob', ms = 480){ if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); clearTimeout(el._bobT); el._bobT = setTimeout(() => el.classList.remove(cls), ms); }
function platePaint(){ const pl = $('plate'); if (!pl) return; const n = S.w && mode() === 'sum' && !S.stamped ? S.w[0] : null; NS.paint(pl.firstChild, n == null ? 1 : n, { px: L().plate, compact: true, back: n == null }); pl.dataset.n = n == null ? '' : n; }
function plateShow(on){ const pl = $('plate'); pl.className = on ? '' : 'off'; if (on) platePaint(); }
function overlays(){ const v = S.v, pl = $('plate'), pw = $('paw');
  if (!pl.classList.contains('off')) { const q = hw(...T.PLATE); pl.style.left = q.x + 'px'; pl.style.top = q.y + 'px'; }
  if (!pw.classList.contains('off')) { const q = hw(...T.PAW); pw.style.left = q.x + 'px'; pw.style.top = q.y + 'px'; }
  /* 세는 수: 다시 보여 주는 장면(무리마다 1 부터) · 나와 서며 폴짝(1 부터 모두) */
  for (const an of AN) { const d = CNT[an.i]; let txt = null;
    if (an.vis && !an.head && v.mode === 'scene' && v.counts && an.i < v.sc.n) { const x = v.sc.list[an.i]; if (x.stand == null || v.t >= x.stand + x.k * .22) txt = x.k + 1; }
    else if (an.vis && v.mode === 'out' && v.hop && v.t >= v.hop.t0 + an.i * T.HOP_GAP) txt = an.i + 1;
    if (txt == null) { if (d.classList.contains('on')) d.classList.remove('on'); continue; }
    if (d.textContent !== String(txt)) d.textContent = txt; if (!d.classList.contains('on')) { d.classList.add('on'); if (v.mode === 'out') tone(520 + an.i * 55, .09, 'triangle', .08); } d.style.fontSize = L().cnt + 'rem';
    const below = S.low && v.mode === 'out' && an.i >= 5, q = stage.screenOf(below ? an.pos.clone().add(V(0, 0, .12)) : an.pos.clone().add(V(0, an.a.h * an.sc + .03, 0))); d.style.transform = below ? 'translate(-50%,2px)' : ''; d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; }   /* 낮은 가로는 줄 사이가 좁아 아랫줄의 수를 발 아래에(윗줄 수와 포개지지 않게) */
  { const j = $('jingle'), an = S.bellI >= 0 ? AN[S.bellI] : null; if (an && an.vis && v.mode !== 'end') { const q = stage.screenOf(an.pos.clone().add(V(0, an.head ? an.a.h * an.a.win * 1.02 : an.a.h * an.sc + .04, an.head ? .2 : 0))); j.style.left = q.x + 'px'; j.style.top = q.y + 'px'; j.classList.add('on'); } else j.classList.remove('on'); }
  if (S.labels) labelsPlace();
  /* 해 질 녘: 해가 왼쪽 가장자리를 따라 내려간다(숫자 · 눈금 없음) · 저녁 빛 */
  const sn = $('sun'), dk = S.dusk; if (sn.classList.contains('on')) { const y0 = room() + 26, y1 = Math.max(y0 + 40, stage.screenOf(V(0, 0, 0)).y); sn.style.top = lerp(y0, y1, dk) + 'px'; sn.style.opacity = dk > .93 ? Math.max(.15, 1 - (dk - .93) / .07) : 1; }
  $('veil').style.opacity = (dk * .22).toFixed(3); }
function labelsPlace(){ const p = S.p, v = S.v; if (!p || v.mode !== 'out') return;
  /* 무리 이름표: 무리가 서는 자리(다시 모인 자리 · 아니면 마당 줄)에서 실제로 선 범위의 가운데 · 그 무리 맨 아랫줄 아래 */
  const spotOf = i => (v.reg ? regSpot(i, v) : lineSpot(i, p.a)), all = Array.from({ length: p.a + p.b }, (_, i) => i), g1 = all.filter(i => (v.reg ? regFirst(i, v) : i < p.a)), g2 = all.filter(i => !g1.includes(i));
  const at = ks => { let l = 1e9, r = -1e9, y = -1e9; for (const k of ks) { const q = stage.screenOf(spotOf(k).add(V(0, 0, .16))); l = Math.min(l, q.x); r = Math.max(r, q.x); y = Math.max(y, q.y); } return { x: (l + r) / 2, y: y + 4 }; };
  const q1 = at(g1), q2 = at(g2); let x1 = q1.x, x2 = q2.x; const w1 = GRP[0].offsetWidth / 2 + 3, w2 = GRP[1].offsetWidth / 2 + 3; if (Math.abs(q1.y - q2.y) < GRP[0].offsetHeight + 4 && x2 - x1 < w1 + w2) { const m = (x1 + x2) / 2; x1 = m - (w1 + w2) / 2; x2 = m + (w1 + w2) / 2; }
  GRP[0].style.left = x1 + 'px'; GRP[0].style.top = q1.y + 'px'; GRP[1].style.left = x2 + 'px'; GRP[1].style.top = q2.y + 'px'; const yT = Math.max(q1.y, q2.y) + GRP[0].offsetHeight + 4; if (yT + GRP[2].offsetHeight > innerHeight - 34) { GRP[2].style.left = Math.min(innerWidth - GRP[2].offsetWidth / 2 - 4, x2 + w2 + GRP[2].offsetWidth / 2 + 6) + 'px'; GRP[2].style.top = q2.y + 'px'; }   /* 아래가 모자라면(낮은 가로) 「모두」 는 둘째 이름표 옆에 */
  else { GRP[2].style.left = (x1 + x2) / 2 + 'px'; GRP[2].style.top = yT + 'px'; } }
/** 이름표 셋: 식에 적힌 차례(먼저 적은 수 · 다음 수 · 모두). */
function labels(on){ S.labels = !!on; const p = S.p, v = S.v; GRP.forEach(g => g.classList.toggle('on', !!on)); if (on && p) { const sw = !!(v.reg && v.reg.swap); GRP[0].textContent = (sw ? p.b : p.a) + '마리'; GRP[1].textContent = (sw ? p.a : p.b) + '마리'; GRP[2].textContent = R.total(p); labelsPlace(); } }
/** 문패의 수가 마당에 찍힌다(B08 · B09 — 맞게 열었을 때). */
function stampGo(n){ const st = $('stamp'), pl = $('plate').getBoundingClientRect(); NS.paint(st.firstChild, n, { px: L().plate, compact: true }); st.style.transition = 'none'; st.style.left = (pl.left + pl.width / 2) + 'px'; st.style.top = (pl.top + pl.height / 2) + 'px'; st.className = 'on'; void st.offsetWidth; st.style.transition = ''; S.stamped = true; platePaint();   /* 수는 마당으로 옮겨 간다 — 문패는 빈 판(같은 수가 둘 보이지 않게) */
  const q = stage.screenOf(V(T.STAMP[0], .3, L().rows[0] + .2)); q.x = Math.min(q.x, innerWidth - L().plate * .62 - 4); st.style.left = q.x + 'px'; st.style.top = q.y + 'px'; setTimeout(() => { if (st.classList.contains('on')) { st.classList.add('hit'); tone(160, .16, 'sine', .12, 0, 90); } }, 560); S.log.push({ stamp: n }); }
function applyDusk(k){ if (S.duskShown != null && (k === S.duskShown || (Math.abs(k - S.duskShown) < .012 && k !== 0 && k !== 1))) return; S.duskShown = k; const mix = (a, b) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  stage.paintSky(DAY.SKY.map((c, i) => mix(c, DUSK.SKY[i]))); stage.sun.color.set(mix(DAY.SUN, DUSK.SUN)); stage.sun.intensity = lerp(DAY.I, DUSK.I, k); stage.hemi.intensity = lerp(DAY.HEMI, DUSK.HEMI, k); stage.sun.position.set(4 + 6 * k, 9 - 6.2 * k, 6);   /* 해가 기울면 집 그림자가 길어진다 */
  const lamp = k > .8 ? (k - .8) / .2 : 0; for (const m of lampMats) m.emissiveIntensity = lamp * .9; }

// ── 띠 · 읽는 말 · 한 줄 안내
const slotsOf = () => (S.blind && mode() === 'story' ? ['a', 'b', 'sum'] : ['a', 'b']);
const cellHtml = (v, o = {}) => { const mine = o.k != null && v != null && v !== '?' && !S.closed, hole = v == null || v === '?'; return `<b class="${hole ? 'hole' + (o.blank ? ' blank' : '') : mine ? 'fill' : S.closed ? 'done' : ''}${typeof v === 'string' && v !== '?' && !hole ? ' sym' : ''}"${o.k != null ? ` data-k="${o.k}"` : ''}>${hole ? '?' : v}</b>`; };
function strip(){ const t = $('tray'), p = S.p, m = mode(); if (!p || !t) return; let html = '';
  if (m === 'story') { const sl = slotsOf(); html = R.storyParts(p, S.f).map(x => `<span class="cl">${x.pre ? `<i>${x.pre}</i>` : ''}${cellHtml(x.v, { k: S.mine && S.mine[x.slot] ? sl.indexOf(x.slot) : null })}<i>${x.post}</i></span>`).join(' '); }
  else if (m === 'sum') { if (S.upto > 0) html = R.exprParts(p, { upto: S.upto, sum: S.closed ? p.sum : '?' }).map(x => (x.op ? `<i class="op">${x.op}</i>` : cellHtml(x.v))).join(''); }
  else if (S.cellsOn) { const w = S.w; html = w.length === 3 ? `${cellHtml(w[0], { k: 0, blank: true })}<i class="op">+</i>${cellHtml(w[1], { k: 1, blank: true })}<i class="op">=</i>${cellHtml(w[2], { k: 2, blank: true })}` : w.map((v, k) => cellHtml(v, { k, blank: true })).join(''); }
  if (t.dataset.h !== html) { t.dataset.h = html; t.innerHTML = html; } t.className = html ? 'on' + (m === 'story' ? ' story' : '') : ''; t.style.fontSize = ''; if (html && m !== 'story') { const room2 = innerWidth * .96; if (t.offsetWidth > room2) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room2 / t.offsetWidth) + 'px'; }
  C.ask(!S.closed && !S.busy && (S.phase === 'write' || S.phase === 'count')); C.place(); readPlace(); }
function readLine(text){ const r = $('readline'); if (!text) { r.className = ''; r.textContent = ''; return; } r.textContent = text; r.className = 'on'; readPlace(); }
function readPlace(){ const r = $('readline'), t = $('tray'); if (!r || !r.classList.contains('on')) return; r.style.top = (t.getBoundingClientRect().bottom + 10) + 'px'; }
function firstLine(){ const m = mode(); if (S.phase === 'door') return '문을 눌러 열어 봐. 모두 몇 마리일까?'; if (S.phase === 'count') return '모두 몇 마리일까? 세어서 수를 눌러 줘.';
  if (m === 'story') return '수를 눌러 빈칸을 채우고 문을 눌러 줘.'; if (m === 'write') return S.step === 1 ? '수 딱지를 눌러 빈칸을 채우고 종을 눌러 줘.' : '딱지를 차례로 눌러 식을 만들고 종을 눌러 줘.'; return '수를 고르고 문을 눌러 열어 봐.'; }
const WATCH = '잘 봐! 몇 마리가 들어갈까?', WAIT = '잘 봐!';
const knock = () => { tone(190, .07, 'square', .07); tone(170, .08, 'square', .07, .16); };
const ring = () => { tone(1568, .5, 'sine', .1); tone(2093, .4, 'sine', .05, .02); stage.tween(bellIn.rotation, { z: .35 }, 90).then(() => stage.tween(bellIn.rotation, { z: -.25 }, 150)).then(() => stage.tween(bellIn.rotation, { z: 0 }, 180)); };
function stopTweens(o){ for (let i = stage.tweens.length - 1; i >= 0; i--) { const w = stage.tweens[i]; if (w.o === o) { stage.tweens.splice(i, 1); w.res(); } } }
/** 한 줄 안내 자리: 띠 · 카드 · 집의 문과 창 · 문패 · 발자국 · 종 · 동물 · 위쪽 표시를 가리지 않는 곳. */
function tellPlace(){ const tl = $('tell'); if (!tl || !tl.classList.contains('on')) return; const w = innerWidth, h = innerHeight;
  Object.assign(tl.style, { maxWidth: (S.low ? Math.max(180, w * .3) : Math.min(w * .92, 760)) + 'px', fontSize: S.tall || S.low ? '1.02rem' : '', bottom: 'auto', transform: 'none' }); const tw = tl.offsetWidth, th = tl.offsetHeight, keys = keyRects();
  const pref = { x: (w - tw) / 2, y: h - th - (S.tall ? 70 : 34) }; let best = null, s0 = Infinity;
  for (let y = 56; y <= h - th - 6; y += 10) for (let x = 6; x <= w - tw - 6; x += 12) { let ov = 0; for (const r of keys) { const ix = Math.max(0, Math.min(x + tw, r.right) - Math.max(x, r.left)), iy = Math.max(0, Math.min(y + th, r.bottom) - Math.max(y, r.top)); ov += ix * iy; }
    const sc = ov * 50 + Math.hypot(x - pref.x, y - pref.y); if (sc < s0) { s0 = sc; best = { x, y }; } }
  if (best) Object.assign(tl.style, { left: best.x + 'px', top: best.y + 'px' }); S.log.push({ tellAt: best }); }
function tellOff(){ const tl = $('tell'); if (tl) tl.classList.remove('on'); }
function say1(key, text, opt){ if (H.tell(key, text, opt)) { tellPlace(); return true; } return false; }
/** 가리면 안 되는 것들의 화면 네모. */
function keyRects(){ const out = [], add = r => { if (r && r.width > 0) out.push(r); };
  for (const id of ['tray', 'choose', 'readline', 'plate', 'paw', 'stamp', 'marbles', 'lanterns', 'coins', 'snd', 'note']) { const e = $(id); if (e && getComputedStyle(e).display !== 'none' && !e.classList.contains('off')) add(e.getBoundingClientRect()); }
  add(document.querySelector('.back') && document.querySelector('.back').getBoundingClientRect()); add(doorRect()); add(winRect()); add(wallRect()); if (bellG.visible) add(rect3(bellG)); add(herdRect()); add(yardRect()); for (const g of GRP) if (g.classList.contains('on')) add(g.getBoundingClientRect()); return out; }
function rect3(o, grow = 1){ if (!o || !o.visible) return null; o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); if (b.isEmpty()) return null; if (grow !== 1) { const c = b.getCenter(V()), s = b.getSize(V()).multiplyScalar(grow / 2); b.min.copy(c).sub(s); b.max.copy(c).add(s); }
  let l = 1e9, r = -1e9, t = 1e9, bt = -1e9; for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) { const q = stage.screenOf(V(x, y, z)); l = Math.min(l, q.x); r = Math.max(r, q.x); t = Math.min(t, q.y); bt = Math.max(bt, q.y); }
  return { left: l, right: r, top: t, bottom: bt, width: r - l, height: bt - t }; }
const quad = pts => { const q = pts.map(p => hw(...p)), l = Math.min(...q.map(a => a.x)), r = Math.max(...q.map(a => a.x)), t = Math.min(...q.map(a => a.y)), b = Math.max(...q.map(a => a.y)); return { left: l, right: r, top: t, bottom: b, width: r - l, height: b - t, x: (l + r) / 2, y: (t + b) / 2 }; };
const doorRect = () => quad([[-T.DOOR_W / 2 - .04, T.DOOR_Y - .12, .12], [T.DOOR_W / 2 + .04, T.DOOR_Y - .12, .12], [-T.DOOR_W / 2 - .04, T.DOOR_Y + T.DOOR_H + .06, .12], [T.DOOR_W / 2 + .04, T.DOOR_Y + T.DOOR_H + .06, .12]]);
/** 집 앞벽(창 너비 · 창 위 끝 ~ 문 아래 끝) — 안내 글이 집을 가리지 않게. */
const wallRect = () => quad([[-T.WIN_W / 2 - .1, T.DOOR_Y - .12, .12], [T.WIN_W / 2 + .1, T.DOOR_Y - .12, .12], [-T.WIN_W / 2 - .1, T.WIN_Y + T.WIN_H + .1, .12], [T.WIN_W / 2 + .1, T.WIN_Y + T.WIN_H + .1, .12]]);
const winRect = () => quad([[-T.WIN_W / 2, T.WIN_Y, .12], [T.WIN_W / 2, T.WIN_Y, .12], [-T.WIN_W / 2, T.WIN_Y + T.WIN_H, .12], [T.WIN_W / 2, T.WIN_Y + T.WIN_H, .12]]);
/** 한 마리의 화면 네모(발 · 머리 끝 · 어깨 너비로 어림). */
function animalRect(an){ const hgt = an.a.h * an.sc, a = stage.screenOf(an.pos), b = stage.screenOf(an.pos.clone().add(V(0, hgt, 0))), wd = Math.abs(stage.screenOf(an.pos.clone().add(V(hgt * .3, 0, 0))).x - a.x); return { left: a.x - wd, right: a.x + wd, top: b.y, bottom: a.y, width: wd * 2, height: a.y - b.y }; }
/** 마당에 나와 서는 자리 전체(동물이 아직 없어도 비워 둔다 — 안내 글이 줄을 가리지 않게). */
function yardRect(){ const a = stage.screenOf(lineSpot(0, 9).add(V(-.3, .8, 0))), b = stage.screenOf(lineSpot(9, 5).add(V(.3, 0, .15))), c = stage.screenOf(lineSpot(5, 9).add(V(-.3, 0, .15))); return { left: Math.min(a.x, c.x), right: b.x, top: a.y, bottom: b.y, width: b.x - Math.min(a.x, c.x), height: b.y - a.y }; }
function herdRect(){ const rs = AN.filter(an => an.vis && !an.head).map(animalRect); if (!rs.length) return null; const o = { left: Math.min(...rs.map(r => r.left)), right: Math.max(...rs.map(r => r.right)), top: Math.min(...rs.map(r => r.top)), bottom: Math.max(...rs.map(r => r.bottom)) }; o.width = o.right - o.left; o.height = o.bottom - o.top; return o; }

// ── 누르기: 굴러가는 문패 → 문패 → 발자국 → 종 → 문 → 그 밖(창 · 빈 곳) — 누름에는 늘 답이 있다(5-11)
const canvas = $('c');
/** 문패의 화면 네모(바람에 굴러가면 굴러간 자리). */
const plateRect = () => (rectOf($('plate')) ? $('plate').firstChild.getBoundingClientRect() : null);
const windRect = () => (S.wind && S.wind.on ? (S.wind.el === $('plate') ? plateRect() : S.wind.el.getBoundingClientRect()) : null);
addEventListener('pointerdown', e => { if (S.ready && !E.homeOpen()) H.ripple(e.clientX, e.clientY); }, true);   /* 어디를 눌러도 물결(카드 · 띠 · 빈 곳 · 바쁜 동안) */
function hitAt(x, y){ const pad = S.small || S.low ? 4 : 9, inR = r => r && x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad, mid = r => Math.hypot(x - (r.left + r.right) / 2, y - (r.top + r.bottom) / 2);
  const c = []; { const r = plateRect(); if (r && mode() === 'sum') c.push(['plate', r]); } { const r = rectOf($('paw')); if (r) c.push(['paw', r]); } if (bellG.visible) c.push(['bell', rect3(bellG)]); c.push(['door', doorRect()]);
  const on = c.filter(([, r]) => inR(r)); if (on.length) { on.sort((a, b) => mid(a[1]) - mid(b[1])); return { kind: on[0][0] }; }   /* 겹치면 가운데가 가까운 쪽 */
  return { kind: inR(winRect()) ? 'window' : 'empty' }; }
canvas.addEventListener('pointerdown', e => { if (!S.ready || e.button > 0) return; audio(); const x = e.clientX, y = e.clientY; if (!S.active || E.homeOpen()) { S.log.push({ ignored: 'idle' }); return; }
  const hit = hitAt(x, y); if (S.busy || S.closed) { S.log.push({ ignored: 'busy', hit: hit.kind, phase: S.phase }); if (!S.closed) { if (say1('ride.watch', S.phase === 'watch' && S.v.mode === 'scene' ? WATCH : WAIT, { times: 1e9, ms: 2600 })) S.log.push({ watchTold: true }); } return; }
  touch(); S.log.push({ tap: hit.kind });
  if (hit.kind === 'plate') plateTap(); else if (hit.kind === 'paw') again(); else if (hit.kind === 'bell') submit('bell'); else if (hit.kind === 'door') submit('door'); else nudge(hit.kind); });
function touch(){ S.lastAct = S.t; H.hide(); S.hinting = false; }
const want = () => (mode() === 'write' ? 'bell' : 'door');
const cur = () => S.w.findIndex(v => v == null);
const filled = () => S.w.length > 0 && S.w.every(v => v != null);
const chooseBtns = () => [...document.querySelectorAll('#choose.on button')].filter(b => !b.classList.contains('away') && !b.classList.contains('gone'));
const wantAt = () => (want() === 'bell' ? (() => { const r = rect3(bellG); return r && { x: (r.left + r.right) / 2, y: r.bottom - 6 }; })() : (() => { const r = doorRect(); return { x: r.x, y: r.bottom - 4 }; })());
/** 뜻 없는 누름(5-11): 물결 + 다음에 누를 곳 + 한 줄 안내. 고르는 중이면 고를 카드(딱지)들이 들썩(손은 답을 짚지 않는다 — 카드 무리에는 손을 띄우지 않는다) · 다 적었으면 손이 문(종)을. */
function nudge(what){ tone(520, .07, 'triangle', .05); const o = { nudge: true, what, phase: S.phase }; let hand = null;
  if (S.wind && S.wind.on) { const r = windRect(); H.show(r.left + r.width / 2, r.bottom + 2); hand = 'wind'; }
  else if (S.phase === 'door' || (S.phase === 'write' && filled())) { const q = wantAt(); if (q) { H.show(q.x, q.y); hand = want(); } }
  else { const bs = chooseBtns(); bs.forEach(b => bobEl(b)); o.bob = bs.length; if (!bs.length && mode() === 'sum' && S.w[0] != null) bobEl($('plate')); }
  o.hand = hand; S.log.push(o); say1('ride.nudge', firstLine(), { times: 1e9 }); }

// ── 장면 · 마당 줄(시계)
/** 장면을 흘린다 → 끝나면(건너뛰어도) 풀리는 Promise. write = 띠가 장면을 따라 적힌다 · counts = 머리 위에 수가 오른다 · slow = 「식 먼저」의 빠른 장면을 보통 빠르기로. */
function showScene(o = {}){ skipScene(); const sc = S.sc; S.v = { mode: 'scene', sc, t: 0, run: true, speed: o.slow && sc.fast ? R.T.FAST : 1, heads: S.win.open, counts: !!o.counts, gallop: sc.rush || (S.streak > 0 && S.step === 2), write: !!o.write, mark: 0, ent: 0, replay: !!o.replay };
  S.log.push({ scene: sc.kind, n: sc.n, rush: sc.rush, fast: sc.fast, counts: !!o.counts, replay: !!o.replay, heads: S.win.open }); return new Promise(res => { S.v.res = res; }); }
function skipScene(){ const v = S.v; if (v.mode !== 'scene' || !v.run) return; v.t = v.sc.end; v.run = false; sceneMarks(v); poseAll(); const r = v.res; v.res = null; S.replaying = false; S.log.push({ sceneSkip: true }); if (r) r('skip'); }
function sceneMarks(v){ const sc = v.sc; while (v.ent < sc.n && v.t >= sc.list.slice().sort((a, b) => a.rank - b.rank)[v.ent].enter) { v.ent++; if (v.run) tone(440 + v.ent * 40, .08, 'triangle', .07); }
  if (!v.write) return; const p = S.p, m = mode();
  if (v.mark < 1 && v.t >= sc.tA) { v.mark = 1; if (m === 'story') { S.f = { a: p.a }; strip(); } else if (m === 'sum') { S.upto = 1; strip(); } }
  if (v.mark < 2 && v.t >= sc.tB) { v.mark = 2; if (m === 'story') { S.f = { a: p.a, b: p.b }; strip(); TL.say(R.story(p)); } else if (m === 'sum') { S.upto = 2; strip(); } }
  if (v.mark < 3 && v.t >= sc.end) { v.mark = 3; if (m === 'sum') { S.upto = 3; strip(); } } }
/** 문이 열리고 모두 나와 선다 → 다 서면(세어지면) 풀린다. hop = 한 마리씩 폴짝 뛰며 세어진다. */
function showOut(o = {}){ const p = S.p, n = p.a + p.b; S.door.want = true; S.door.wig = false; const k = Math.min(S.streak, 4); tone(330 * 2 ** (k / 6), .16, 'triangle', .09); tone(440 * 2 ** (k / 6), .2, 'triangle', .09, .12);
  const walk = (n - 1) * T.OUT_GAP + T.OUT_WALK; S.v = { mode: 'out', t: 0, n, a: p.a, run: true, hop: o.hop ? { t0: walk + .25 } : null, until: o.hop ? walk + .25 + (n - 1) * T.HOP_GAP + T.HOP_S + .5 : walk + .3, gallop: S.streak > 0 && S.step === 2 };
  S.log.push({ doorOpen: true, n, hop: !!o.hop }); return new Promise(res => { S.v.res = res; }); }
/** 나와 선 채로: 다시 폴짝 세기 · 장면을 다시 보여 주기(처음 무리가 서고 → 온 무리가 붙는다) · 한 바퀴. → 끝나면 풀린다 */
function outAct(kind){ const v = S.v; if (v.mode !== 'out') return Promise.resolve(); if (v.res) { const r = v.res; v.res = null; r('skip'); } v.hop = null; v.re = null;
  if (kind === 'hop') { v.hop = { t0: v.t + .15 }; v.until = v.t + .15 + (v.n - 1) * T.HOP_GAP + T.HOP_S + .5; } else if (kind === 're') { v.re = { t0: v.t + .1 }; v.until = v.t + T.RE_S; tone(392, .12, 'triangle', .07); tone(523, .14, 'triangle', .07, 1.35); } else { v.spin = { t0: v.t + .05 }; v.until = v.t + T.SPIN_S + .1; }
  v.run = true; S.log.push({ outAct: kind }); return new Promise(res => { v.res = res; }); }
/** 발자국: 장면을 한 번 더 본다(수는 띄우지 않는다 · 깨끗함 그대로 · 몇 번이든 · 손은 막지 않는다). 나와 선 뒤에는 마당에서 다시 보여 준다. */
function again(){ if (!S.played) { nudge('paw'); return; } bobEl($('paw')); tone(660, .08, 'triangle', .07); S.replays = (S.replays | 0) + 1; S.log.push({ again: S.replays, outside: S.outside }); const my = S.oid, p = S.p, rid = S.rid = (S.rid | 0) + 1, pr = S.outside ? outAct('re') : showScene({ replay: true, slow: true }); S.replaying = true;
  pr.then(() => { if (S.oid === my && S.p === p && S.rid === rid) { S.replaying = false; S.lastAct = S.t; } }); }

// ── 적기: 수 카드(B06 · B08 · B09) · 딱지(B07) · 문패
function showChoices(){ const p = S.p, m = mode();
  if (m === 'story') { const k = cur(); if (k < 0) { C.hide(); S.door.wig = true; strip(); return; } S.door.wig = false; const slot = slotsOf()[k]; S.cards[slot] = S.cards[slot] || R.cards(p, slot); C.show(S.cards[slot], onCard); S.slot = slot; for (const b of document.querySelectorAll('#choose button')) if (S.gone[slot].includes(+b.dataset.n)) C.retreat(b); }
  else if (m === 'sum') { S.cards.sum = S.cards.sum || R.cards(p, 'sum'); C.show(S.cards.sum, onCard); S.slot = 'sum'; }
  else { S.tiles = S.tiles || R.tiles(p, S.step); C.show(S.tiles, onTile, { tiles: true }); }
  strip(); if (S.ready) setTimeout(tellPlace, 30); }
function beginWrite(){ S.phase = 'write'; const m = mode();
  if (m === 'story') { const sl = slotsOf(); S.w = sl.map(() => null); S.mine = {}; S.f = {}; for (const s of sl) { S.f[s] = '?'; S.mine[s] = true; } }
  else if (m === 'sum') { S.w = [null]; S.upto = 3; plateShow(true); }
  else { S.w = Array(S.step === 1 ? 3 : 5).fill(null); S.cellsOn = true; }
  S.btn = []; $('paw').classList.toggle('off', !S.played); showChoices(); S.windAt = !S.windDone && m === 'write' ? S.t + 2 : Infinity; }
function onCard(n, btn){ if (!S.active || S.closed || !S.p) return; audio(); if (S.busy) { S.log.push({ ignored: 'busy', card: n }); say1('ride.watch', WAIT, { times: 1e9, ms: 2600 }); return; } touch(); const p = S.p, m = mode();
  if (S.phase === 'count') { S.log.push({ count: n, hinted: S.res.hinted }); if (n === p.sum) { S.f.sum = n; tone(880, .12, 'triangle', .09); close(); } else { C.retreat(btn); S.gone.sum.push(n); S.res.back = true; tone(440, .1, 'triangle', .05); S.log.push({ back: 'sum', n }); } return; }
  if (S.phase !== 'write') return;
  if (m === 'story') { const k = cur(); if (k < 0) return; const slot = slotsOf()[k]; S.w[k] = n; S.f[slot] = n; tone(700, .08, 'triangle', .08); S.log.push({ fill: slot, n, hinted: S.res.hinted }); showChoices(); return; }
  if (m === 'sum') hang(n, btn); }
/** 고른 수를 문패에 건다(문을 열기 전에는 바꿔 걸 수 있다 — 깨끗함 그대로). */
function hang(n, btn){ windOff(); if (S.btn[0] && S.btn[0] !== btn) C.give(S.btn[0]); S.w[0] = n; S.btn[0] = btn; C.take(btn); platePaint(); bobEl($('plate'), 'set'); S.door.wig = true; tone(700, .08, 'triangle', .08); S.log.push({ hang: n, hinted: S.res.hinted }); C.ask(false); if (!S.windDone) S.windAt = S.t + .7; }
function plateTap(){ if (S.wind && S.wind.on && S.wind.el === $('plate')) { windCatch(); return; } if (S.phase !== 'write' || S.w[0] == null) { nudge('plate'); return; }
  C.give(S.btn[0]); S.log.push({ unhang: S.w[0] }); S.w[0] = null; S.btn[0] = null; platePaint(); S.door.wig = false; tone(420, .08, 'triangle', .06); C.ask(true); }
function onTile(v, btn){ if (!S.active || S.closed || !S.p) return; audio(); if (S.wind && S.wind.on && S.wind.el === btn) { touch(); windCatch(); return; } if (S.busy) { S.log.push({ ignored: 'busy', tile: v }); say1('ride.watch', WAIT, { times: 1e9, ms: 2600 }); return; } if (S.phase !== 'write') return; touch();
  const k = cur(); if (k < 0) { nudge('full'); return; } S.w[k] = v; S.btn[k] = btn; flyTile(btn, k); C.take(btn); tone(typeof v === 'number' ? 700 : 560, .08, 'triangle', .08); S.log.push({ tile: v, k, hinted: S.res.hinted }); strip(); if (filled()) bellWig(); }
/** 딱지가 띠의 칸으로 날아간다(화면 꾸밈). */
function flyTile(btn, k){ const a = btn.getBoundingClientRect(), cell = document.querySelector(`#tray b[data-k="${k}"]`); if (!cell) return; const b = cell.getBoundingClientRect(), d = btn.cloneNode(true); Object.assign(d.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', margin: 0, zIndex: 8, pointerEvents: 'none', animation: 'none', transition: 'transform .22s ease-in,opacity .22s', fontFamily: 'inherit' }); d.className = btn.className + ' flying'; d.style.borderRadius = getComputedStyle(btn).borderRadius; d.style.border = getComputedStyle(btn).border; d.style.background = getComputedStyle(btn).backgroundColor; d.style.color = getComputedStyle(btn).color; d.style.fontWeight = 900; d.style.fontSize = getComputedStyle(btn).fontSize;
  document.body.appendChild(d); requestAnimationFrame(() => { d.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(${Math.max(.3, b.width / a.width)})`; d.style.opacity = .5; }); setTimeout(() => d.remove(), 260); }
const bellWig = () => { stopTweens(bellIn.rotation); stage.tween(bellIn.rotation, { z: .16 }, 110).then(() => stage.tween(bellIn.rotation, { z: -.12 }, 160)).then(() => stage.tween(bellIn.rotation, { z: 0 }, 140)); };
/** 채운 칸을 다시 누르면 돌아온다(고칠 수 있다 — 깨끗함 그대로). */
function onCell(k){ if (!S.active || S.closed || S.busy || S.phase !== 'write' || S.w[k] == null) return; touch(); const m = mode(); S.log.push({ unfill: k, v: S.w[k] }); tone(420, .08, 'triangle', .06);
  if (m === 'story') { const slot = slotsOf()[k]; S.w[k] = null; S.f[slot] = '?'; showChoices(); } else if (m === 'write') { if (S.btn[k]) C.give(S.btn[k]); S.w[k] = null; S.btn[k] = null; strip(); } }

// ── 바람(B07 딱지 하나 · B08 · B09 문패): 굴러간다 → 눌러 잡는다. 놓치면 굴러갔다가 제자리로 — 시간만 잃는다(수는 그대로)
function windGo(){ S.windAt = Infinity; if (S.windDone || S.busy || S.closed || S.phase !== 'write') return; let el = null; const m = mode();
  if (m === 'write') { const bs = chooseBtns().filter(b => !b.classList.contains('sym')); if (!bs.length) return; el = bs[Math.floor(Math.random() * bs.length)]; } else if (m === 'sum') { if (S.w[0] == null) return; el = $('plate'); } else return;
  S.windDone = true; const r = el.getBoundingClientRect(), right = m === 'sum' ? r.left + r.width / 2 >= doorRect().x : r.left + r.width / 2 < innerWidth / 2,   /* 문패는 문에서 먼 쪽으로 굴러간다(문 · 발자국을 덮지 않게) */ bx = m === 'sum' ? (right ? Math.min(170, innerWidth - r.right - 12) : -Math.min(170, r.left - 12)) : (right ? 1 : -1) * Math.round(r.width * .35), by = m === 'sum' ? 56 : Math.round(r.height + 24);   /* 딱지는 통 바로 아래 빈자리로(이웃 딱지 위에 포개지지 않게) */ el.style.setProperty('--bx', bx + 'px'); el.style.setProperty('--by', by + 'px'); el.classList.add('blown');
  S.wind = { on: true, el, until: S.t + R.T.WIND_S }; tone(900, .5, 'sine', .04, 0, 300); S.log.push({ wind: m === 'sum' ? 'plate' : +el.dataset.n }); }
function windCatch(){ if (!S.wind || !S.wind.on) return; tone(880, .08, 'triangle', .07); tone(1100, .08, 'triangle', .06, .08); S.log.push({ windCaught: true }); windOff(); }
function windOff(back){ const w = S.wind; if (!w) return; if (w.on) { w.on = false; w.el.classList.remove('blown'); if (back) S.log.push({ windBack: true }); S.lastAct = S.t; } S.wind = null; }

// ── 문(종)을 눌렀다 = 「다 적었어요, 열어 봐」. 문을 눌러야 판정한다 — 세계가 대신 열어 주지 않는다
function submit(kind){ if (!S.active || S.closed || S.busy || !S.p) return; if (kind !== want()) { nudge(kind); return; }
  if (S.phase === 'door') { knock(); openCount(); return; }
  if (S.phase !== 'write' || !filled() || (S.wind && S.wind.on && S.wind.el === $('plate'))) { nudge(kind); return; }
  if (kind === 'bell') ring(); else knock(); judgeNow(); }
/** B06 걸음 ①: 문이 열리고 모두 나와 선다 → 「모두 ?마리」 를 세어서 고른다. */
async function openCount(){ const my = S.oid; S.busy = true; S.phase = 'watch'; H.hide(); tellOff(); skipScene(); S.door.wig = false; S.log.push({ knock: true }); await showOut(); if (S.oid !== my) return; S.outside = true; countPhase(); }
function countPhase(){ S.phase = 'count'; S.f.sum = '?'; S.mine = {}; $('paw').classList.remove('off'); S.cards.sum = S.cards.sum || R.cards(S.p, 'sum'); C.show(S.cards.sum, onCard); S.slot = 'sum'; S.busy = false; S.lastAct = S.t; strip(); setTimeout(tellPlace, 30); }
async function judgeNow(){ const my = S.oid, p = S.p, m = mode(); S.busy = true; H.hide(); tellOff(); skipScene(); windOff(); S.door.wig = false; const w = S.w.slice(), j = R.judge(w, p); S.log.push({ judge: j.res, w: w.join(' '), at: j.at, hinted: S.res.hinted }); C.ask(false);
  if (m === 'story') { const sl = slotsOf();
    if (j.res === 'fit') { C.hide(); S.mine = {}; strip(); await showOut(); if (S.oid !== my) return; S.outside = true; if (sl.length === 3) { await close(); return; } countPhase(); return; }
    S.res.back = true; C.hide(); S.phase = 'watch'; tone(440, .1, 'triangle', .05); await showScene({ counts: true, replay: true, slow: true }); if (S.oid !== my) return;   /* 문이 열리는 대신 장면이 한 번 다시 흐른다(머리 위에 수가 오른다) */
    for (const k of j.bad) { S.gone[sl[k]].push(S.w[k]); S.log.push({ back: sl[k], n: S.w[k] }); S.w[k] = null; S.f[sl[k]] = '?'; } S.phase = 'write'; S.busy = false; S.lastAct = S.t; showChoices(); for (const k of j.bad) bobEl(document.querySelector(`#tray b.hole`), 'back'); return; }
  if (m === 'write') { if (!S.outside) { await showOut(); if (S.oid !== my) return; S.outside = true; }   /* 닫힌 채 적었으면 이제 연다 */
    if (j.res === 'fit') { await close(); return; }
    S.res.back = true; S.phase = 'watch'; await outAct('re'); if (S.oid !== my) return;   /* 동물들이 장면을 다시 보여 준다 */
    for (const k of j.bad) { if (S.btn[k]) C.give(S.btn[k]); S.log.push({ back: k, v: S.w[k] }); S.w[k] = null; S.btn[k] = null; } S.phase = 'write'; S.busy = false; S.lastAct = S.t; strip(); return; }
  const fit = j.res === 'fit'; S.phase = 'watch';
  if (!S.outside) { if (S.first && !S.played) { await showScene({}); if (S.oid !== my) return; S.played = true; await sleep(250); if (S.oid !== my) return; }   /* 식 먼저: 이제야 장면이 빠르게 흐른다 */
    await showOut({ hop: !fit }); if (S.oid !== my) return; S.outside = true; }
  else if (!fit) { await outAct('hop'); if (S.oid !== my) return; }
  if (fit) { S.door.want = true; stampGo(p.sum); await sleep(650); if (S.oid !== my) return; await close(); return; }
  S.res.back = true; const btn = S.btn[0], pl = $('plate'); pl.classList.add('away'); tone(440, .1, 'triangle', .05); S.log.push({ back: 'plate', n: S.w[0] }); await sleep(520); if (S.oid !== my) return;   /* 문패의 수가 물러난다 */
  if (btn) { C.give(btn); C.retreat(btn); } S.gone.sum.push(S.w[0]); S.w[0] = null; S.btn[0] = null; pl.classList.remove('away'); platePaint(); S.door.want = false; $('paw').classList.remove('off'); S.phase = 'write'; S.busy = false; S.lastAct = S.t; C.ask(true); }
/** 아이가 지은 식에서 먼저 적힌 더하는 수(`3 + 2 = 5` → 3 · `5 = 2 + 3` → 2 · 수 셋 [3, 2, 5] → 3). */
const firstAddend = w => (w.length === 5 ? (w[1] === '=' ? w[2] : w[0]) : w[0]);
/** 문제를 닫는다: 띠가 닫히고(「모두 5마리」 · 「3 + 2 = 5」 + 읽는 말) 소리로 읽어 준다. */
async function close(){ const my = S.oid, p = S.p, m = mode(); if (S.closed) return; S.closed = true; S.busy = true; S.phase = 'closed'; H.hide(); C.hide(); windOff(); skipScene(); S.door.wig = false; $('paw').classList.add('off');
  let said = '';
  if (m === 'story') { S.mine = {}; S.f = { a: p.a, b: p.b, sum: p.sum }; said = R.total(p); } else if (m === 'sum') { S.upto = 3; said = R.read(p, 0); readLine(said); } else { const w = S.w.slice(); said = R.read(p, S.readK++, w); S.cellsOn = true; readLine(said); if (S.v.mode === 'out') S.v.reg = { t0: S.v.t + .15, swap: firstAddend(w) !== p.a }; labels(true); }
  strip(); TL.say(said);
  const cleanNow = R.clean(S.res); if (S.step === 2) { if (cleanNow) { S.streak++; if (S.streak % R.T.STREAK === 0 && S.v.mode === 'out') { outAct('spin'); confetti(16); S.log.push({ spin: S.streak }); } } else S.streak = 0; }   /* 신바람: 셋 이어지면 나와 선 동물들이 한 바퀴 */
  if (S.bellI >= 0) { if (cleanNow) { wallet.earn(R.T.SURPRISE_COINS, 'ride'); confetti(10); tone(1319, .2, 'triangle', .1); S.surpriseCarry = false; const r = doorRect(), d = document.createElement('div'); Object.assign(d.style, { position: 'fixed', left: r.x + 'px', top: r.y + 'px', width: '2px', height: '2px' }); document.body.appendChild(d); E.fly(d, $('coins'), art(ICON.coin), R.T.SURPRISE_COINS).then(() => d.remove()); S.log.push({ surpriseOpen: true }); } else { S.surpriseCarry = true; S.log.push({ surpriseKept: true }); } }
  if (!S.res.missed) { wallet.earn(R.T.COIN_PER, 'ride'); coinsDraw(true); }   /* 동전은 아이가 연 문제만 */
  S.today.push(p.sum); S.log.push({ closed: said, clean: cleanNow, tally: tally() }); tone(1046, .2, 'triangle', .1);
  await sleep(m === 'write' ? T.READ_MS : T.CLOSE_MS); if (S.oid !== my) return; if (S.done) S.done(S.res.missed ? 'missed' : 'sent'); }
/** 해가 다 졌다 — 문이 저절로 열리고 모두 나와 선다(답이 보인다 · 띠가 저절로 적힌다). 깨끗하지 않음 · 동전 없음 · 두 문제 뒤에 다시. */
async function miss(){ if (!S.active || S.busy || S.closed) return; const my = S.oid, p = S.p, m = mode(); S.busy = true; S.res.missed = true; S.streak = 0; S.phase = 'watch'; H.hide(); tellOff(); skipScene(); windOff(); C.hide(); S.door.wig = false; S.log.push({ missed: true });
  if (m === 'sum') { for (const b of S.btn) if (b) C.give(b); S.w = [null]; platePaint(); } else if (m === 'write') { S.w = R.forms(p, S.w.length === 3 ? 3 : 5)[0].slice(); S.btn = []; } else { S.mine = {}; S.f = { a: p.a, b: p.b }; } strip();
  if (!S.outside) { if (S.first && !S.played) { await showScene({}); if (S.oid !== my) return; S.played = true; } await showOut(); if (S.oid !== my) return; S.outside = true; }
  S.log.push({ autoOpen: true, tally: tally() }); await sleep(300); if (S.oid !== my) return; await close(); }

// ── 한 문제의 시작 · 끝
function resetScene(){ S.v = { mode: 'none', t: 0 }; for (const an of AN) { an.p.obj.visible = false; an.state = 'off'; an.vis = false; an.head = false; for (const m of an.mats) m.emissiveIntensity = 0; } CNT.forEach(d => d.classList.remove('on')); labels(false); readLine(''); $('stamp').className = ''; $('jingle').classList.remove('on');
  windOff(); S.wind = null; S.windAt = Infinity; C.hide(); A.trayClear(); $('tray').dataset.h = ''; plateShow(false); $('plate').classList.remove('away', 'blown', 'set'); $('paw').classList.add('off'); S.door.want = false; S.door.wig = false; S.replaying = false; S.labels = false; S.stamped = false; S.cellsOn = false; S.upto = 0; S.f = {}; S.mine = {}; S.w = []; S.btn = []; S.tiles = null; S.cards = {}; S.gone = { a: [], b: [], sum: [] };
  stopTweens(bellIn.rotation); bellIn.rotation.z = 0; document.querySelectorAll('.flying').forEach(e => e.remove()); }
async function runProblem(p, ctx){ const my = S.oid, c = R.CELLS[p.cell], m = c.mode;
  S.p = p; S.step = ctx.step; S.ev = ctx.ev; S.ctx = ctx; S.res = { back: false, hinted: false, missed: false }; S.closed = false; S.clock = 0; S.busy = true; S.active = true; S.hinting = false; S.phase = 'watch'; S.outside = false; S.played = false; S.replays = 0; resetScene(); H.hide();
  S.first = R.exprFirst(p.cell, ctx.step, ctx.j, ctx.ev); S.blind = !!ctx.ev.blind && ctx.step === 2; S.duskS = R.duskS(p.cell, ctx.board); S.windDone = !(ctx.wind && ctx.step === 2 && !CALM && m !== 'story');
  S.sc = R.scene(p, { rush: !!ctx.rush && !CALM, fast: S.first }, Math.random); S.bellI = ctx.surprise ? R.bellAt(p) : -1; S.big = ctx.last ? T.BIG : 1; S.win.open = ctx.step === 1; bellG.visible = m === 'write'; $('sun').classList.toggle('on', !!ctx.ev.dusk && ctx.step === 2 && !CALM);
  E.marbles(ctx.j, 3, 0); aim(); poseAll();
  S.log.push({ start: p.key, kind: p.kind, step: S.step, ev: Object.keys(S.ev).filter(x => S.ev[x] === true).join(' '), last: !!ctx.last, retry: !!p.retry, first: S.first, blind: S.blind, bell: S.bellI, wind: !S.windDone, rush: S.sc.rush, big: S.big });
  if (S.first) { S.upto = 3; strip(); await sleep(350); if (S.oid !== my) return { abort: true }; }
  else { await sleep(250); if (S.oid !== my) return { abort: true }; await showScene({ write: m !== 'story' || ctx.step === 1 }); if (S.oid !== my) return { abort: true }; S.played = true;   /* 이야기 낱칸은 걸음 ① 만 띠가 저절로 적힌다(② · 닫힌 판에서 답을 미리 보이거나 읽어 주지 않게) */ await sleep(200); if (S.oid !== my) return { abort: true };
    if (m === 'write' && !S.blind) { await showOut(); if (S.oid !== my) return { abort: true }; S.outside = true; } }   /* B07: 문이 저절로 열려 모두 나와 선다(합이 보인다) */
  if (m === 'story' && ctx.step === 1) { S.phase = 'door'; S.door.wig = true; $('paw').classList.remove('off'); } else beginWrite();
  let told = false; if (ctx.j === 0 && ctx.firstStep) { told = say1('ride.' + S.cell + ctx.step, firstLine(), TELLS()); if (told) S.log.push({ told: firstLine() }); }   /* 장면이 끝나 손이 풀린 뒤에 */
  S.busy = false; S.lastAct = S.t + (told ? T.TELL_GRACE : 0); strip();
  const out = await new Promise(res => { S.done = res; }); S.active = false; S.done = null; H.hide(); if (out === 'abort' || S.oid !== my) return { abort: true };
  const r = { ...S.res, clean: R.clean(S.res), out, replays: S.replays }; S.log.push({ problem: p.key, kind: p.kind, step: S.step, ...r });
  S.door.want = false; await sleep(250); return S.oid !== my ? { abort: true } : r; }

// ── 나들이(판 셋) · 판(문제 셋)
const TELLS = () => ({ times: M.passed(M.get(S.cell || '')) ? 2 : 1e9 });
/** 하네스용: 문제를 정해 줌 — { a, b, kind }. */
const forced = (id, f) => ({ ...R.make(id, f.a, f.b, f.kind || 'join'), retry: false });
async function outing(id){ const my = ++S.oid; E.showBar(true); S.cell = id; S.streak = 0; S.today = []; S.readK = 0; clearEnd(); const day = M.dayKey(); let prevStep = 0;
  { const kinds = ANIMALS.filter(k => k !== S.lastKind), kind = S.forceKind || (S.lastKind ? kinds[Math.floor(Math.random() * kinds.length)] : ANIMALS[0]); S.forceKind = null; await herd(kind); if (S.oid !== my) return; S.lastKind = kind; }
  let rec = M.get(id); S.back = M.stuckNow(rec) && !!rec.hand;
  let q = R.deal(id, S.hist[id] || [], Math.random, { small: M.stuck(rec) >= 1 }); if (S.forceP) { S.forceP.forEach((f, k) => { if (q[k] && f) q[k] = forced(id, f); }); S.forceP = null; }
  S.q = q; E.lanterns(0); S.log.push({ outing: id, kind: S.kind, deal: q.map(p => p.key + p.kind[0]) });
  const b0 = S.startBoard | 0; S.startBoard = 0;   /* 하네스용: 셋째 판부터 */
  for (let b = b0; b < R.T.BOARDS; b++) { rec = M.get(id); const hand = !rec.hand || S.back;
    let ev = R.events(rec.evBoards, Math.random, { cell: id, passed: M.passed(rec), calm: CALM, hand, blindShown: !!rec.blindShown }); if (S.forceEv) { ev = { ...ev, ...S.forceEv }; S.forceEv = null; }
    if (S.surpriseCarry && !hand) ev.surprise = true;
    const pickJ = on => (on ? (ev.at != null ? ev.at : Math.floor(Math.random() * 3)) : -1), rushJ = pickJ(ev.rush), windJ = pickJ(ev.wind), surpJ = pickJ(ev.surprise);
    S.board = { b, hand, ev }; S.log.push({ board: b, hand, duskS: R.duskS(id, b), ev: Object.keys(ev).filter(x => ev[x] === true).join(' ') });
    const results = []; E.marbles(0);
    for (let j = 0; j < R.T.PER_BOARD; j++) { const i = b * R.T.PER_BOARD + j, last = i === R.T.PER_BOARD * R.T.BOARDS - 1;
      const r = await runProblem(q[i], { step: hand ? 1 : 2, ev, board: b, j, last, rush: j === rushJ, wind: j === windJ, surprise: j === surpJ, firstStep: b === b0 || (hand ? 1 : 2) !== prevStep });
      if (S.oid !== my || r.abort) return; results.push(r); E.marbles(j + 1); if (!r.clean) q = R.requeue(q, i); S.q = q; }
    prevStep = hand ? 1 : 2;
    const before = rec; rec = M.record(rec, results, day, { counts: !hand, hand, ev: !hand && !ev.none }); if (!hand && ev.intro === 'blind') rec.blindShown = 1; if (hand) S.back = false; else if (M.stuckNow(rec)) S.back = true; M.put(id, rec); S.log.push({ boardEnd: b, clean: M.clean(results), rec: { ...rec } });
    await E.fly($('marbles'), $('coins'), art(ICON.coin), results.filter(r => r.out === 'sent').length); if (S.oid !== my) return; E.lanterns(b + 1); tone(660, .15, 'triangle', .1); tone(990, .2, 'triangle', .1, .12);
    if (!M.passed(before) && M.passed(rec)) { grew(art(ICON.flag) + ' 깃발을 땄어요!'); await sleep(2400); } else if (!M.kept(before) && M.kept(rec)) { grew(art(ICON.star) + ' 깃발에 별이 붙었어요!'); await sleep(2400); }
    if (S.oid !== my) return; await sleep(300); if (S.oid !== my) return; }
  S.hist[id] = q; await endScene(my); if (S.oid !== my) return;
  const items = S.today.map((n, k) => `<b class="ns" style="--k:${k};display:inline-block"><img class="ns" alt="" src="${NS.numsign(n, { px: 40, compact: true }).toDataURL()}"></b>`);
  const choice = await E.home({ items }); if (S.oid !== my) return;
  if (choice === 'again') outing(id); else location.href = GO; }
/** 나들이 끝 장면: 해가 지고 창에 불이 켜진다 · 오늘 드나든 동물들이 마당에 한 줄로. */
async function endScene(my){ S.p = null; resetScene(); S.ending = true; S.big = 1; H.hide(); { const tl = $('tell'); if (tl) tl.classList.remove('on'); } bellG.visible = false; $('sun').classList.remove('on'); S.win.open = false; S.bellI = -1; S.clock = 0; S.duskTo = 1; aim(); S.v = { mode: 'end', t: 0, n: 9 }; poseAll();
  S.log.push({ endScene: S.today.length, kind: S.kind }); confetti(14); [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, 'triangle', .1, .2 + i * .12)); await sleep(1700); }
function clearEnd(){ S.ending = false; S.duskTo = null; S.dusk = 0; applyDusk(0); S.v = { mode: 'none', t: 0 }; }
/** 하네스 · 교사용: 지금 나들이를 거둔다(표시 · 세는 칸을 모두 처음으로). */
function abort(){ S.oid++; S.active = false; if (S.done) { const d = S.done; S.done = null; d('abort'); } if (S.v && S.v.res) { const r = S.v.res; S.v.res = null; r('abort'); } stage.tweens.length = 0; resetScene(); clearEnd(); S.p = null; S.busy = false; S.closed = false; S.clock = 0; S.streak = 0; S.outside = false; S.played = false; S.first = false; S.blind = false; S.bellI = -1; S.windDone = true; S.hinting = false; S.surpriseCarry = false; S.res = { back: false, hinted: false, missed: false }; S.big = 1; S.win.open = false; bellG.visible = false; $('sun').classList.remove('on'); TL.stop(); H.hide(); S.phase = 'idle'; { const tl = $('tell'); if (tl) tl.classList.remove('on'); }
  const hm = document.getElementById('home'); if (hm) hm.classList.remove('on'); if (S.ready) aim(); }

// ── 한 장면의 일
stage.frame((dt, t) => { S.t = t; if (!S.ready) return; const v = S.v;
  /* 장면 · 마당 줄의 시계 */
  if (v.mode === 'scene' && v.run) { v.t = Math.min(v.sc.end, v.t + dt * (v.speed || 1)); sceneMarks(v); if (v.t >= v.sc.end) { v.run = false; const r = v.res; v.res = null; if (r) r('end'); } }
  else if (v.mode === 'out') { v.t += dt; if (v.run && v.t >= v.until) { v.run = false; const r = v.res; v.res = null; if (r) r('end'); } }
  poseAll();
  /* 문 · 덧문 */
  { const d = S.door, sceneOpen = v.mode === 'scene' && v.sc.list.some(x => v.t > x.enter - .6 && v.t < x.enter + .22), outOpen = v.mode === 'out' && v.t < (v.n - 1) * T.OUT_GAP + T.OUT_WALK * .6, to = d.want || sceneOpen || outOpen ? T.DOOR_OPEN : 0; d.ang += (to - d.ang) * Math.min(1, dt * 9); const wig = d.wig && to === 0 && !S.busy ? 4 + 4 * Math.sin(t * 13) : 0; doorPivot.rotation.y = -(d.ang + wig) * Math.PI / 180; }
  { const w = S.win, to = w.open ? T.WIN_OPEN : 0; w.ang += (to - w.ang) * Math.min(1, dt * 7); for (const s of shutters) s.pv.rotation.y = s.sd * w.ang * Math.PI / 180; }
  /* 해 질 녘: 적는 동안에만 간다(장면이 흐르는 동안 · 다시 보는 동안 · 문이 열리는 동안은 멈춤) */
  const thinking = S.active && !S.busy && !S.closed && (S.phase === 'write' || S.phase === 'count' || S.phase === 'door');
  const duskRun = thinking && S.ev.dusk && S.step === 2 && !CALM && !S.replaying;
  if (duskRun) { S.clock = Math.min(1, S.clock + dt / S.duskS); if (S.clock >= 1) miss(); }
  { const to = S.duskTo != null ? S.duskTo : (S.ev.dusk && S.step === 2 && !CALM && S.active ? S.clock : 0); S.dusk += (to - S.dusk) * Math.min(1, dt * (S.duskTo != null ? 1.6 : 6)); if (Math.abs(to - S.dusk) < .002) S.dusk = to; applyDusk(S.dusk); }
  /* 바람 */
  if (thinking && t >= S.windAt) windGo(); if (S.wind && S.wind.on && t >= S.wind.until) windOff(true);
  overlays();
  /* 길잡이 손: 가만히 있으면 — 채울 칸의 맞는 카드(딱지) → 문(종). 답을 짚으면 그 문제는 깨끗하지 않음 */
  const wait = R.T.HINT_AFTER * (M.stuck(M.get(S.cell || '')) >= 1 ? .5 : 1);
  if (S.replaying || (S.wind && S.wind.on)) S.lastAct = Math.max(S.lastAct, t - .001);   /* 다시 보는 동안 · 바람이 부는 동안은 길잡이 시계도 멈춘다 */
  if (thinking && t - S.lastAct > wait && !S.hinting) { S.hinting = true; S.hintAt = t; hintShow(true); }
  else if (S.hinting && thinking && t - S.hintAt > 1.2) { S.hintAt = t; hintShow(false); }
  if (!thinking && S.hinting) { S.hinting = false; H.hide(); } });
/** 길잡이 손이 짚을 곳: 잘못 채운 칸(돌려놓게) → 다음 칸의 맞는 카드(딱지) → 문(종). → { x, y, ans } — ans = 답을 짚는가 */
function hintTarget(){ const p = S.p, m = mode(); if (!p) return null; const under = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - Math.min(14, r.height * .25) }; };
  if (S.phase === 'door') return { ...wantAt(), ans: false };
  const btnOf = v => chooseBtns().find(b => b.dataset.n === String(v));
  if (S.phase === 'count') { const q = under(btnOf(p.sum)); return q && { ...q, ans: true }; }
  if (m === 'sum') { if (S.w[0] == null) { const q = under(btnOf(p.sum)); return q && { ...q, ans: true }; } if (S.w[0] !== p.sum) { const q = under($('plate')); return q && { ...q, ans: true }; } return { ...wantAt(), ans: false }; }
  let f; if (m === 'story') f = [p.a, p.b, p.sum].slice(0, S.w.length); else { const fs = R.forms(p, S.w.length); let best = -1; for (const x of fs) { let k = 0; while (k < x.length && (S.w[k] == null || S.w[k] === x[k])) k++; if (k > best) { best = k; f = x; } } }
  const bad = S.w.findIndex((v, k) => v != null && v !== f[k]); if (bad >= 0) { const q = under(document.querySelector(`#tray b[data-k="${bad}"]`)); return q && { ...q, ans: true }; }
  const k = cur(); if (k >= 0) { const q = under(btnOf(f[k])); return q && { ...q, ans: true }; } return { ...wantAt(), ans: false }; }
function hintShow(first){ const q = hintTarget(); if (!q) return; if (q.ans && !S.res.hinted) { S.res.hinted = true; S.log.push({ hinted: true }); } if (first) S.log.push({ hintAt: q.ans ? 'answer' : want() }); H.show(q.x, q.y); }

window.__ride = { S, R, M, E, C, T, TL, NS, stage, wallet, K, AN, outing, abort, endScene: () => endScene(S.oid), keyRects, hitAt, miss, tally, aim, herd, skipScene,
  /** 하네스: 누르는 곳(가운데) */
  doorAt: () => { const r = doorRect(); return { x: r.x, y: r.y, ...r }; }, winAt: () => { const r = winRect(); return { x: r.x, y: r.y, ...r }; }, bellAt: () => { const r = bellG.visible ? rect3(bellG) : null; return r && { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2, ...r }; },
  pawAt: () => { const r = rectOf($('paw')); return r && { x: r.left + r.width / 2, y: r.top + r.height / 2, left: r.left, right: r.right, top: r.top, bottom: r.bottom }; }, plateAt: () => { const r = plateRect(); return r && { x: r.left + r.width / 2, y: r.top + r.height / 2, left: r.left, right: r.right, top: r.top, bottom: r.bottom, n: $('plate').dataset.n }; },
  /** 하네스: 동물들 [{ i, state, vis, head, x, y, h(화면 키 px) }] · 문 · 덧문 각도 · 저녁 */
  herdNow: () => AN.filter(an => an.state !== 'off').map(an => { const r = an.vis ? animalRect(an) : null, q = an.vis ? stage.screenOf(an.pos) : null; return { i: an.i, state: an.state, vis: an.vis, head: an.head, x: q && q.x, y: q && q.y, h: r && r.height, wx: an.pos.x, wy: an.pos.y, wz: an.pos.z, in: !!q && q.x > 0 && q.x < innerWidth && q.y > 0 && q.y < innerHeight }; }),
  doorAngle: () => S.door.ang, winAngle: () => S.win.ang, dusk: () => S.dusk, lamp: () => (lampMats[0] ? lampMats[0].emissiveIntensity : 0), bellOn: () => bellG.visible, big: () => houseG.scale.x, kind: () => S.kind,
  lineSpot: (k, a) => { const q = stage.screenOf(lineSpot(k, a)); return { x: q.x, y: q.y }; }, yardAt: () => yardRect(), firstLine, cnts: () => CNT.filter(d => d.classList.contains('on')).map(d => +d.textContent), grps: () => GRP.filter(g => g.classList.contains('on')).map(g => ({ t: g.textContent, r: g.getBoundingClientRect().toJSON() })), room };
if (!GO_NOW) build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
