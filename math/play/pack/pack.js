/* 포장 틀 「열 개 한 판」(3D, T10) — 부두의 굴림대로 자루가 줄줄이 밀려와 판에 놓인다. 열 개가 찼을 때 판을 누르면 「착」 하고 울타리 테가 둘러져 한 판(10개씩 묶음)이 된다.
 * 손이 다르다: 세계가 먼저 흐르고(자루가 밀려온다), 나는 차는 것을 지켜보다가 딱 열이 됐을 때 한 번 누른다. 아홉에서 누르면 덜컹 · 넘겨 누르면 넘친 것이 굴러 나온다 · 묶고 남은 것이 낱개다.
 * 설계: 핸드오프 kedu/math-play-work/T10_포장_틀.md · 정본 kmotion/math-wizard/27_수학놀이터_내용지도와_틀_설계_v1.md(4 · 5절 · 5-9 · 5-10 · 5-11). 규칙 = ./rules.js(화면 없음 · 흐름의 상태 기계까지).
 * 한 나들이 = 낱칸 하나(C01 10 알기 · C04 십몇) · 판 = 문제 셋 · 나들이 = 판 셋.
 *   C01 ① 칸 금(흐린 자루) · 판 위 수 팻말이 오름 · 열이면 판이 들썩 ② 칸 금 · 수 없음 · 들썩임 없음 — 착이 곧 답(카드 없음 · 찍힌 10 = 가득 찬 열 칸 + 10).
 *   C04 자루 N(11~19) → 첫 판이 열에서 찬다 → 착 → 묶은 판이 옆으로 · 새 판에 낱개 → 굴림대가 비면 창고 문이 닫힘 → 「10개씩 묶음 1개와 낱개 r개는 ?」 ① 묶음 그림 카드 ② 숫자 카드.
 * 자루가 놓이는 때는 rules.js feed/step 의 시계 — 이 화면은 performance.now() 의 실제 흐른 시간으로 시계를 민다(프레임이 떨어지면 그림이 건너뛴다 · 놓이는 때는 밀리지 않는다).
 * 사건(rules.js events): 올라가는 돛(C04 · 고르는 동안에만) · 구르는 자루 · 바짝 붙은 둘 · 금빛 자루 · 덮인 판(통과 뒤) · 착착. 사건은 수를 바꾸지 않는다.
 * 누름에는 늘 답이 있다(5-11). 소리는 common/tell.js — 없으면 조용히 넘어간다. 그림은 기성 3D 재료만(./assets · 이름표 ./art.js) — 화면 위 표시(띠 · 카드 · 수 팻말 · 찍힌 수 · 구슬 · 등불)만 코드로. */
import { createStage, THREE, CALM, LITE, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=2';
import * as C from '../common/choose.js?v=6';
import * as H from '../common/hint.js?v=5';
import { wallet, audio, tone, confetti, grew } from '../common/kit.js?v=8';
import { art } from '../common/art.js?v=11';
import * as E from '../common/ends.js?v=2';
import * as M from '../common/map.js?v=13';
import * as TL from '../common/tell.js?v=2';
import * as R from './rules.js?v=3';
import { nextHere, href as goHref } from '../go/next.js?v=1';
import { ASSETS, MODEL, SCENERY, SCENERY_NAMES, WOOD, GOLD, GHOST, ICON } from './art.js?v=1';

// ── 내가 정한 수치(화면 · 움직임 — 준호가 보고 바꾼다). 문제 · 사건 · 시계 수치는 ./rules.js 의 T
const T = { DECK: .45, P: .46, BAG: .38, PAD: .16, BELT_LEN: 3.6, BELT_S: 4.0, BELT_Y: .3, SP_MIN: .4, FLY_MS: 380, FLY_S: .38, SMOOTH: 10, BIG: 1.15, CAP: 150, PILE_MAX: 9, PILE_S: .36,
  PACK_MS: 950, EARLY_MS: 950, SLIDE_MS: 650, READ_MS: 2300, HOP_MS: 420, CARD_GUARD: 300, TELL_GRACE: 4, BLINK_MS: 900,
  WIDE: { fov: 34, el: .92, belt: 3.6, board: [.25, -.2, 0], beltEnd: [-1.18, -.2], dir: [1, 0], seats: [[1.95, -.45], [1.95, .05]], packed: [-1.15, 1.35, 0], pair: [[-1.33, 1.35, 0], [1.33, 1.35, 0]], ship: [3.85, -1.15, -Math.PI / 2 + .35], henry: [-.5, -1.45], enter: [3.7, -.2], fit: [[-6.0, -.9], [-6.0, .55], [4.3, -1.6], [2.5, 2.05], [-2.5, 2.05]], fit01: [[-6.0, -.9], [-6.0, .55], [4.3, -1.6], [2.5, 1.0], [-2.5, 1.0]] },
  TALL: { fov: 44, el: .95, belt: 2.7, board: [-.12, .25, -Math.PI / 2], beltEnd: [-.12, -1.2], dir: [0, 1], seats: [[.95, 1.05], [.95, 1.52]], packed: [-1.5, .25, -Math.PI / 2], pair: [[-.66, .25, -Math.PI / 2], [.66, .25, -Math.PI / 2]], ship: [2.25, -2.4, -Math.PI / 2 + .15], henry: [-1.3, -2.0], enter: [2.6, .25], fit: [[-2.15, -4.2], [1.2, -4.2], [-2.15, 1.75], [1.4, 1.75], [2.55, -2.4]], fit01: [[-1.45, -4.2], [1.2, -4.2], [-1.45, 1.75], [1.4, 1.75], [2.55, -2.4]] } };
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const GO = '/math/play/go/';
const WANT = Q.get('cell'), GO_NOW = !WANT || !R.CELLS[WANT];   /* ?cell= 없이 열리면 모형을 불러오기 전에 고르는 화면으로 */
if (GO_NOW) location.replace(GO);
const S = { ready: false, oid: 0, cell: WANT, p: null, W: null, fd: null, res: null, step: 2, ev: {}, ctx: {}, board: null, phase: 'idle', busy: true, active: false, hold: false, done: null,
  t: 0, lastNow: 0, lastAct: 0, streak: 0, back: false, goldCarry: false, hist: {}, carry: {}, log: [], q: [], tall: false, low: false, sail: 0, sailOn: false, bell: false, told: false, tellOn: false,
  bags: new Map(), boards: [], cur: null, packedB: null, pile: [], icons: [], cardT0: 0, slowMs: 0, said: [], handTo: null, rollerA: 0, wob: 0, firstPlaced: false };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [18, 56], shadow: { left: -7, right: 7, top: 6, bottom: -6 }, assets: ASSETS }), { scene, camera } = stage;
const K = {};
const NAMES = [...new Set([...Object.values(MODEL), ...SCENERY_NAMES])];
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const L = () => S.tall ? T.TALL : T.WIDE;
const snd = (...a) => { if (TL.on()) tone(...a); };   /* 효과음도 소리 단추(tell.js) 하나로 같이 끈다 */
const say = text => { S.said.push(text); TL.say(text); };
const henry = (name, ms = 1500) => { if (!S.henry) return; stage.play(S.henry, name, true); clearTimeout(S.henryT); S.henryT = setTimeout(() => stage.play(S.henry, 'Idle'), ms); };

// ── 짓기
let BAGH = .3, bagIM = null, ghostIM = null, DK = null;
const mats = {};
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpS = new THREE.Vector3(), tmpC = new THREE.Color(), ONE = new THREE.Color('#ffffff');
function sizeOf(o){ const b = new THREE.Box3().setFromObject(o); return { s: b.getSize(V3()), b }; }
/** 판 하나(판자 · 울타리 테 넷 · 덮개). 로컬: 다섯 칸이 x 를 따라 · 두 줄이 z(rs = 첫 줄이 앞(-1)인가 뒤(+1)인가). */
function makeBoard(){ const g = new THREE.Group(), W = 5 * T.P + 2 * T.PAD, D = 2 * T.P + 2 * T.PAD, pw = DK.pwid, n = Math.max(2, Math.round(D / pw)), st = D / n;
  for (let k = 0; k < n; k++) { const m = new THREE.Mesh(DK.planks[k % DK.planks.length], mats.board); m.rotation.y = Math.PI / 2; m.scale.set(st / pw * 1.03, .7, W / DK.plen); m.position.set(0, .03, -D / 2 + st * (k + .5)); m.castShadow = !LITE; m.receiveShadow = true; g.add(m); }
  const fence = [], fs = sizeOf(K[MODEL.fence].scene), fl = Math.max(fs.s.x, fs.s.z), alongX = fs.s.x >= fs.s.z;
  for (const [len, x, z, ry] of [[W, 0, -D / 2, 0], [W, 0, D / 2, 0], [D, -W / 2, 0, Math.PI / 2], [D, W / 2, 0, Math.PI / 2]]) { const f = K[MODEL.fence].scene.clone(), h = new THREE.Group(); f.rotation.y = alongX ? 0 : Math.PI / 2; const b = sizeOf(f); f.position.set(-(b.b.min.x + b.b.max.x) / 2, -b.b.min.y, -(b.b.min.z + b.b.max.z) / 2); h.add(f);
    h.scale.set(len / fl * 1.02, .34 / fs.s.y, 1); h.rotation.y = ry; h.position.set(x, .05, z); h.visible = false; h.userData.base = { x, z, ry }; f.traverse(m => { if (m.isMesh) { m.castShadow = !LITE; } }); g.add(h); fence.push(h); }
  const cover = new THREE.Group(); for (let k = 0; k < n; k++) { const m = new THREE.Mesh(DK.planks[(k + 2) % DK.planks.length], mats.cover); m.rotation.y = Math.PI / 2; m.scale.set(st / pw * 1.05, .8, (W + .08) / DK.plen); m.position.set(0, 0, -D / 2 + st * (k + .5)); m.castShadow = !LITE; cover.add(m); } cover.position.y = BAGH + .1; cover.visible = false; g.add(cover);
  scene.add(g); return { g, fence, cover, W, D, rs: 1, bob: 0, bobT: 0, covered: false, packed: false, at: null, go: null, sc: 1 }; }
/** 판 로컬 칸 자리(칸 i = 왼쪽 위부터 · 윗줄 다섯 → 아랫줄 다섯). */
const slotLocal = (bd, i) => V3((i % 5 - 2) * T.P, .07, (Math.floor(i / 5) - .5) * T.P * bd.rs);
function build(){ return Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); })).then(() => {
  /* 자루(인스턴스 하나) — 모형의 마디 변환을 구워 넣고 · 바닥 가운데를 0 으로 · 위에서 본 큰 쪽이 BAG */
  let bm = null; K[MODEL.bag].scene.updateMatrixWorld(true); K[MODEL.bag].scene.traverse(m => { if (m.isMesh && !bm) bm = m; });
  const g = bm.geometry.clone(); g.applyMatrix4(bm.matrixWorld); g.computeBoundingBox(); { const bb = g.boundingBox, sz = bb.getSize(V3()), c = bb.getCenter(V3()); g.translate(-c.x, -bb.min.y, -c.z); const s = T.BAG / Math.max(sz.x, sz.z); g.scale(s, s, s); BAGH = sz.y * s; }
  mats.bag = bm.material; bagIM = new THREE.InstancedMesh(g, mats.bag, T.CAP); bagIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bagIM.castShadow = !LITE; bagIM.receiveShadow = true; bagIM.frustumCulled = false; for (let i = 0; i < T.CAP; i++) bagIM.setColorAt(i, ONE); bagIM.count = 0; scene.add(bagIM);
  mats.ghost = new THREE.MeshStandardMaterial({ color: GHOST, transparent: true, opacity: .3, depthWrite: false, roughness: .9 }); ghostIM = new THREE.InstancedMesh(g, mats.ghost, 12); ghostIM.frustumCulled = false; ghostIM.count = 0; ghostIM.renderOrder = 2; scene.add(ghostIM);
  DK = stage.dockKit(K[MODEL.dock]); { const g0 = DK.planks[0]; g0.computeBoundingBox(); const pb = g0.boundingBox; DK.plen = pb.max.z - pb.min.z; DK.pwid = pb.max.x - pb.min.x; DK.pth = pb.max.y - pb.min.y; }
  const wm = c => { const m = DK.mat.clone(); m.color.set(c); return m; }; mats.board = wm(WOOD.board); mats.cover = wm(WOOD.cover); mats.seat = wm(WOOD.seat); mats.rail = wm(WOOD.rail); mats.sail = wm(WOOD.sail); mats.sail.side = THREE.DoubleSide;
  /* 부두 바닥 두 벌(가로 · 세로 화면) */ S.floors = {}; for (const [kind, x0, x1, z0, z1] of [['WIDE', -6.8, 2.9, -2.9, 3.0], ['TALL', -2.6, 1.2, -5.4, 3.0]]) { const fg = new THREE.Group(); let i = 0; const n = Math.ceil((z1 - z0) / (DK.plen * .98)); for (let r = 0; r < n; r++) for (let x = x0; x <= x1; x += DK.pwid, i++) { const m = new THREE.Mesh(DK.planks[i % DK.planks.length], DK.mat); m.position.set(x, T.DECK - DK.pth / 2 - .01, z0 + DK.plen * .98 * (r + .5)); m.receiveShadow = true; fg.add(m); } scene.add(fg); S.floors[kind] = fg; }
  /* 꾸밈 두 벌 */ S.scen = {}; for (const kind of ['WIDE', 'TALL']) S.scen[kind] = SCENERY[kind].map(([n, x, y, z, s, ry]) => stage.put(K[n], x, y, z, s, ry));
  for (let k = 0; k < 12; k++) S.boards.push(makeBoard()); S.boards.forEach(b => { b.g.visible = false; });
  /* 넘침 자리 둘 */ S.seats = [0, 1].map(() => { const m = new THREE.Mesh(DK.planks[1], mats.seat); m.scale.set(.5 / DK.pwid, .7, .5 / DK.plen); m.receiveShadow = true; scene.add(m); return m; });
  /* 굴림대: 옆판 둘 + 눕힌 굴대 + 다리 · 로컬 x 0(창고) → BELT_LEN(판) */
  S.belt = new THREE.Group(); scene.add(S.belt); const ps = sizeOf(K[MODEL.pole].scene), ph = ps.s.y, pd = Math.max(ps.s.x, ps.s.z), by = T.DECK + T.BELT_Y;
  for (const z of [-.36, .36]) { const m = new THREE.Mesh(DK.planks[0], mats.rail); m.rotation.set(0, Math.PI / 2, Math.PI / 2); m.scale.set(.2 / DK.pwid, 1, (T.BELT_LEN + .5) / DK.plen); m.position.set(T.BELT_LEN / 2 - .1, by - .02, z); m.castShadow = !LITE; S.belt.add(m); }
  S.rollers = []; for (let x = .1; x <= T.BELT_LEN + .01; x += .4) { const h = new THREE.Group(), o = K[MODEL.pole].scene.clone(); o.position.y = -ph / 2; h.add(o); h.rotation.x = Math.PI / 2; h.scale.set(.15 / pd, .7 / ph, .15 / pd); h.position.set(x, by - .08, 0); S.belt.add(h); S.rollers.push(h); }
  for (const x of [.3, T.BELT_LEN / 2, T.BELT_LEN - .2]) for (const z of [-.36, .36]) { const o = K[MODEL.pole].scene.clone(); o.scale.set(.09 / pd, (T.BELT_Y + .05) / ph, .09 / pd); o.position.set(x, T.DECK - .02, z); S.belt.add(o); }
  /* 창고(지붕 아래에서 자루가 나온다) + 닫히는 판자 문 */ { const st = K[MODEL.store].scene.clone(), sz = sizeOf(st).s, k = 1.75 / sz.y; st.scale.setScalar(k); st.rotation.y = Math.PI / 2; const b2 = sizeOf(st).b; st.position.set(-.55 - (b2.min.x + b2.max.x) / 2, T.DECK - b2.min.y, -(b2.min.z + b2.max.z) / 2); stage.shadows(st); S.storeG = new THREE.Group(); S.storeG.add(st); scene.add(S.storeG); S.store = st; }
  S.shutter = new THREE.Group(); for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(DK.planks[k], mats.rail); m.rotation.set(0, 0, Math.PI / 2); m.scale.set(.32 / DK.pwid, 1, 1.0 / DK.plen); m.position.set(0, .18 + k * .3, 0); S.shutter.add(m); } S.shutter.position.set(-.05, by + 1.2, 0); S.storeG.add(S.shutter);
  /* 배 · 돛대 · 돛(판자 조각을 빛깔만 옅게 — 돛이 없는 모형) */ { const sh = K[MODEL.ship].scene.clone(), sz = sizeOf(sh).s, k = 2.4 / Math.max(sz.x, sz.z); sh.scale.setScalar(k); const b2 = sizeOf(sh).b; sh.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y - .35, -(b2.min.z + b2.max.z) / 2); stage.shadows(sh);
    S.ship = new THREE.Group(); S.ship.add(sh); scene.add(S.ship); S.deckY = (b2.max.y - b2.min.y) * .55 - .35; const mast = K[MODEL.pole].scene.clone(); mast.scale.set(.12 / pd, 2.1 / ph, .12 / pd); mast.position.set(0, S.deckY - .1, 0); S.ship.add(mast);
    S.sailObj = new THREE.Group(); for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(DK.planks[k], mats.sail); m.rotation.set(Math.PI / 2, 0, 0); m.scale.set(.42 / DK.pwid, .5, 1.1 / DK.plen); m.position.set((k - 1) * .4, 0, .02); S.sailObj.add(m); } S.sailObj.rotation.y = Math.PI / 2; S.ship.add(S.sailObj); S.pileG = new THREE.Group(); S.pileG.position.set(.15, S.deckY + .05, 0); S.ship.add(S.pileG); }
  S.henry = stage.person(K[MODEL.worker]); stage.play(S.henry, 'Idle');
  stage.onResize = aim; stage.resize();
  const c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); coinsDraw(); wallet.onChange(() => coinsDraw());
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
  CNT = document.createElement('div'); CNT.id = 'cnt'; document.body.appendChild(CNT); READ = document.createElement('div'); READ.id = 'readline'; document.body.appendChild(READ);
  STAMPS = [0, 1, 2].map(() => { const d = document.createElement('div'); d.className = 'stamp'; document.body.appendChild(d); return d; }); LABELS = Array.from({ length: 12 }, () => { const d = document.createElement('div'); d.className = 'cnt'; document.body.appendChild(d); return d; });
  TL.button();
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true; S.lastNow = performance.now();
  outing(S.cell); }); }
let CNT = null, READ = null, STAMPS = [], LABELS = [];
function coinsDraw(pop){ const c = $('coins'); if (!c) return; const v = `${art(ICON.coin)}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; } if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }

// ── 자리(가로 · 세로) · 카메라
const BL = () => L().belt;
const beltPt = d => { const l = L(); return V3(l.beltEnd[0] - l.dir[0] * d, T.DECK + T.BELT_Y, l.beltEnd[1] - l.dir[1] * d); };
const seatPt = i => { const s = L().seats[i]; return V3(s[0], T.DECK + .02, s[1]); };
function spot(name){ const l = L(); return name === 'board' ? l.board : name === 'packed' ? l.packed : name === 'pairL' ? l.pair[0] : name === 'pairR' ? l.pair[1] : name === 'enter' ? [l.enter[0], l.enter[1], l.board[2]] : l.board; }
/** 판을 그 자리에 놓는다(at = 이름 · 다시 놓을 때 화면 꼴이 바뀌어도 따라감). */
function boardTo(bd, at, ms = 0){ bd.at = at; const s = spot(at); bd.rs = S.tall ? -1 : 1; const to = { x: s[0], z: s[1], r: s[2] }; if (!ms) { bd.g.position.set(to.x, T.DECK, to.z); bd.g.rotation.y = to.r; bd.go = null; return Promise.resolve(); }
  return new Promise(res => { bd.go = { from: { x: bd.g.position.x, z: bd.g.position.z, r: bd.g.rotation.y }, to, t0: S.t, ms, res, name: at }; }); }
function layout(){ const l = L(); for (const k of ['WIDE', 'TALL']) { S.floors[k].visible = (k === 'TALL') === S.tall; S.scen[k].forEach(o => { o.visible = (k === 'TALL') === S.tall; }); }
  const e = beltPt(BL()); S.belt.position.set(e.x, 0, e.z); S.belt.rotation.y = -Math.atan2(l.dir[1], l.dir[0]); S.belt.scale.x = BL() / T.BELT_LEN; S.storeG.position.set(e.x, 0, e.z); S.storeG.rotation.y = S.belt.rotation.y;
  S.seats.forEach((m, i) => { const p = seatPt(i); m.position.set(p.x, T.DECK + .01, p.z); m.rotation.y = S.tall ? Math.PI / 2 : 0; });
  S.ship.position.set(l.ship[0], 0, l.ship[1]); S.ship.rotation.y = l.ship[2]; S.henry.obj.position.set(l.henry[0], T.DECK + .02, l.henry[1]); S.henry.obj.rotation.y = S.tall ? Math.PI * .85 : Math.PI * .15;
  for (const bd of S.boards) { if (bd.g.visible && bd.at && !bd.go && bd.at !== 'pile') boardTo(bd, bd.at); if (bd.go && bd.go.name) { const s2 = spot(bd.go.name); bd.go.to = { x: s2[0], z: s2[1], r: s2[2] }; bd.rs = S.tall ? -1 : 1; } } }   /* 화면을 돌리면 밀려가는 판도 새 자리로 */
function topUI(){ const ch = $('choose'), tr = $('tray'), on = tr && tr.classList.contains('on'); if (ch && ch.classList.contains('on')) return ch.getBoundingClientRect().bottom + 12;
  const tb = on ? tr.getBoundingClientRect().bottom : (S.low ? 46 : 112); return tb + (S.cell === 'C04' ? C.GAP + (S.low ? 96 : S.tall ? 108 : 136) : (S.low ? 34 : 50)) + 10; }   /* 카드 · 읽는 말 자리를 미리 비워 둔다(뜰 때 세계가 뛰지 않게) */
function aim(w = innerWidth, h = innerHeight){ const tall = h > w * 1.05; S.tall = tall; S.low = !tall && h < 560; const l = L(); camera.fov = l.fov; camera.aspect = w / h; layout();
  const top = topUI(), bot = h - (tall ? 70 : 18), mx = tall ? 10 : 24, fit = S.cell === 'C01' ? l.fit01 : l.fit, cx = fit.reduce((s, p) => s + p[0], 0) / fit.length, cz = fit.reduce((s, p) => s + p[1], 0) / fit.length; S.topUI = top;   /* C01 은 묶은 판 · 낱개 판 줄이 없어 그만큼 가깝게 */
  let dist = 9; for (let it = 0; it < 14; it++) { camera.position.set(cx, T.DECK + dist * Math.sin(l.el), cz + dist * Math.cos(l.el)); camera.lookAt(cx, T.DECK, cz); camera.clearViewOffset(); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const pts = fit.map(([x, z]) => V3(x, T.DECK + .2, z).project(camera)).map(v => ({ x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * h })), x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x)), y0 = Math.min(...pts.map(p => p.y)), y1 = Math.max(...pts.map(p => p.y));
    const k = Math.max((x1 - x0) / (w - 2 * mx), (y1 - y0) / Math.max(80, bot - top)); if (Math.abs(k - 1) > .02 && it < 13) { dist *= k; continue; }
    const dy = (top + bot) / 2 - (y0 + y1) / 2, dx = w / 2 - (x0 + x1) / 2; camera.setViewOffset(w, h, -dx, -dy, w, h); camera.updateProjectionMatrix(); break; }
  placeUI(); const tl = $('tell'); if (tl && tl.classList.contains('on')) tellPlace(); }
function reaim(){ if (Math.abs(topUI() - S.topUI) > 4) aim(); }

// ── 띠 · 읽는 말 · 수 팻말 · 찍힌 수(화면 위)
function bandParts(closed){ const p = S.p, W = S.W; if (!p) return []; return R.band(p, p.N != null ? { packs: W && W.packed ? W.packed : null, loose: W && W.packed ? (S.phase === 'ask' || S.phase === 'done' || closed ? R.loose(p) : W.board || null) : null } : {}); }   /* 착 바로 뒤(낱개가 아직 없음)는 0 이 아니라 빈 칸 */
function trayDraw(closed = false){ let t = $('tray'); if (!t) { A.trayClear(); t = $('tray'); } if (!S.p) { A.trayClear(); return; } const b = (v, c = '') => `<b class="${c}">${v}</b>`, w = s => `<i class="w">${s}</i>`, parts = bandParts(closed);
  const html = parts.map(x => x.w != null ? w(x.w) : x.n != null ? b(x.n) : x.hole != null ? (closed ? b(x.hole, 'done') : b('?', 'hole')) : x.box != null ? b(x.box, 'box') : b('', 'box empty')).join(''), skel = parts.map(x => x.box !== undefined ? 'box' : JSON.stringify(x)).join('|') + (closed ? '|c' : '');
  if (t.dataset.v !== html || !t.classList.contains('on')) { if (t.dataset.skel === skel && t.classList.contains('on')) { const bx = [...t.querySelectorAll('b.box')], vals = parts.filter(x => x.box !== undefined); bx.forEach((e, i) => { const v = vals[i] && vals[i].box != null ? String(vals[i].box) : ''; if (e.textContent !== v) { e.textContent = v; e.className = 'box' + (v ? '' : ' empty'); void e.offsetWidth; e.classList.add('tick'); } }); }   /* 차오르는 칸만 바꾼다(띠 전체가 다시 튀지 않게) */
    else t.innerHTML = html; t.dataset.v = html; t.dataset.skel = skel; }
  t.className = 'on'; C.ask(!closed && S.phase === 'ask'); trayFit(); S.trayText = R.bandText(parts, closed); }
function trayFit(){ const t = $('tray'); t.style.fontSize = ''; const room = innerWidth * .96; if (t.offsetWidth > room) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room / t.offsetWidth) + 'px'; }
function readShow(n){ READ.textContent = R.read(n); READ.classList.remove('on'); void READ.offsetWidth; READ.classList.add('on'); placeUI(); say(R.read(n).replace(' · ', ', ')); S.log.push({ read: R.read(n) }); }
function readHide(){ READ.classList.remove('on'); }
function placeUI(){ const t = $('tray'); if (READ && READ.classList.contains('on')) { const r = t && t.classList.contains('on') ? t.getBoundingClientRect() : { bottom: 60 }; READ.style.top = (r.bottom + 8) + 'px'; } if (S.choosingOn) C.place(); }
/** 판 위의 한 점(화면) — 판 뒤쪽 가장자리 위. */
function boardTop(bd, up = .55){ bd.g.updateMatrixWorld(); return stage.screenOf(bd.g.localToWorld(S.tall && bd.at !== 'pile' ? V3(-bd.W / 2 + .15, BAGH + up, 0) : V3(0, BAGH + up, -bd.D * .2))); }   /* 세로 화면의 판은 돌아 서 있어 위쪽 끝(로컬 −x)에 */
function cntDraw(){ const bd = S.cur, on = !!(bd && S.step === 1 && S.phase === 'flow' && S.W && !bd.covered && bd.at === 'board'); CNT.classList.toggle('on', on); if (!on) return; const n = S.W.board, v = `<b>${n}</b>${C.dotsHtml(10, n, 2)}`;
  if (CNT.dataset.v !== v) { CNT.dataset.v = v; CNT.innerHTML = v; CNT.classList.remove('tick'); void CNT.offsetWidth; CNT.classList.add('tick'); } CNT.classList.toggle('v', S.tall); const q = S.tall ? stage.screenOf(bd.g.localToWorld(V3(-bd.W * .18, BAGH + .2, -(bd.D / 2 + .62)))) : boardTop(bd, .5); CNT.style.left = q.x + 'px'; CNT.style.top = q.y + 'px'; }   /* 세로 화면: 판 오른쪽 옆(굴림대 끝을 가리지 않게) · 점은 판처럼 두 기둥 */
function stampAt(i, html, at, cls = ''){ const d = STAMPS[i], q = typeof at === 'function' ? at() : at; d._at = typeof at === 'function' ? at : null; d.className = 'stamp ' + cls + (S.tall && cls === 'ten' ? ' v' : ''); d.innerHTML = html; d.style.transition = 'none'; d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; void d.offsetWidth; d.style.transition = ''; d.classList.add('on'); return d; }   /* at = 화면 자리를 돌려주는 함수(화면을 돌리면 따라감) */
function stampsPlace(){ for (const d of STAMPS) if (d._at && d.classList.contains('on')) { const q = d._at(); d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; } }
function stampsOff(){ STAMPS.forEach(d => { d.className = 'stamp'; d.innerHTML = ''; d._at = null; }); LABELS.forEach(d => { d.className = 'cnt'; d._o = null; }); }

// ── 자루 그리기(인스턴스) — 자리는 상태에서 셈한다(굴림대 = 시계의 함수 · 판 = 판의 칸 · 나는 중 = 시간)
function bagRec(id, o = {}){ let b = S.bags.get(id); if (!b) { b = { id, st: 'q', p: null, rot: (Math.random() - .5) * .3, gold: false, bd: null, slot: -1, fly: null, tilt: 0, hop: 0, hide: false }; S.bags.set(id, b); } Object.assign(b, o); return b; }
const lastBig = () => !!(S.ctx && S.ctx.last);
function bagTarget(b, qi, dPrev){ const W = S.W;
  if (b.st === 'q' && W) { const q = W.queue[qi]; if (!q) return { pos: beltPt(BL() + 1), hide: true, d: dPrev }; const dT0 = q.t - W.clock;
    if (qi === 0 && dT0 <= T.FLY_S && W.over < R.T.OVER && S.cur) { const u = Math.max(0, Math.min(1, 1 - dT0 / T.FLY_S)), e = u * (2 - u), bd = S.cur; bd.g.updateMatrixWorld(); const to = W.board < 10 ? bd.g.localToWorld(slotLocal(bd, W.board)) : seatPt(Math.min(W.over, 1)), pos = beltPt(0).lerp(to, e); pos.y += Math.sin(u * Math.PI) * .35; return { pos, hide: false, d: 0, direct: true }; }   /* 앞 자루는 놓이기 FLY_S 앞부터 판(넘침 자리)으로 날아간다 */
    let dT = Math.max(0, dT0 - T.FLY_S); if (qi === 0 && q.hv) dT = Math.max(0, dT - q.hv); let d = Math.max(qi * T.SP_MIN, dT * BL() / T.BELT_S); if (dPrev != null) d = Math.max(d, dPrev + T.SP_MIN);
    const pos = beltPt(d); if (W.risk && W.risk.id === q.id) { const l = L(), k = Math.sin(S.t * 14) * .08 + .16; pos.x += -l.dir[1] * k; pos.z += l.dir[0] * k; } return { pos, hide: d > BL() + .25, d }; }
  if (b.st === 'home') return { pos: beltPt(BL() + .6), hide: !!b.p && b.p.distanceTo(beltPt(BL() + .6)) < .35 };
  if ((b.st === 'board') && b.bd) { b.bd.g.updateMatrixWorld(); return { pos: b.bd.g.localToWorld(slotLocal(b.bd, b.slot)), hide: b.bd.covered || !b.bd.g.visible, scale: b.bd.sc }; }
  if (b.st === 'seat') return { pos: seatPt(b.slot), hide: false };
  return { pos: b.p ? b.p.clone() : beltPt(BL()), hide: true }; }
function bagsTick(rdt){ if (!bagIM) return; const W = S.W; let k = 0, dPrev = null; const qi = new Map(); if (W) W.queue.forEach((q, i) => qi.set(q.id, i));
  const order = [...S.bags.values()].sort((a, b) => (qi.has(a.id) ? qi.get(a.id) : 1e3) - (qi.has(b.id) ? qi.get(b.id) : 1e3));
  for (const b of order) { let pos, hide = false, sc = 1, extraY = 0, tilt = b.tilt;
    if (b.fly) { const f = b.fly, u = Math.min(1, (S.t - f.t0) * 1000 / f.ms), e = u * (2 - u); pos = f.from.clone().lerp(f.to(), e); pos.y += Math.sin(u * Math.PI) * f.arc; if (u >= 1) { b.fly = null; if (f.done) f.done(); } }
    else if (b.fall) { const f = b.fall, u = Math.min(1, (S.t - f.t0) / f.s); const l = L(), side = V3(-l.dir[1], 0, l.dir[0]).multiplyScalar(.75); pos = f.from.clone(); if (u < .25) { const v = u / .25; pos.add(side.clone().multiplyScalar(v)); pos.y = T.DECK + T.BELT_Y * (1 - v * v); tilt = v * 1.4; } else { const v = (u - .25) / .75; pos.add(side); pos.lerp(beltPt(BL() + .3).add(side), v); pos.y = T.DECK + .02; tilt = 1.4 + v * 9; } hide = u >= 1; }
    else { const tg = bagTarget(b, qi.has(b.id) ? qi.get(b.id) : 0, dPrev); if (b.st === 'q' && qi.has(b.id)) dPrev = tg.d; hide = tg.hide; sc = tg.scale || 1; if (!b.p || b.snap || tg.direct) { b.p = tg.pos.clone(); b.snap = false; } else b.p.lerp(tg.pos, 1 - Math.exp(-rdt * T.SMOOTH)); pos = b.p; if (S.W && S.W.risk && b.st === 'q' && S.W.risk.id === b.id) tilt = Math.sin(S.t * 14) * .35; else if (b.st === 'q' && qi.get(b.id) === 0 && S.W && S.W.queue[0].hv && S.W.queue[0].t - S.W.clock < S.W.queue[0].hv + T.FLY_S && S.W.queue[0].t - S.W.clock > T.FLY_S) tilt = Math.sin(S.t * 9) * .18; }   /* 열째 뒤 한숨: 다음 자루가 굴림대 끝에서 흔들흔들 */
    if (b.fly || b.fall) b.p = pos.clone();
    if (hide || b.hide || k >= T.CAP) continue;
    if (b.hop) extraY += b.hop;
    const s = sc * (lastBig() ? T.BIG : 1); tmpE.set(tilt * .5, b.rot, tilt); tmpQ.setFromEuler(tmpE); tmpS.set(s, s, s);
    tmpM.compose(V3(pos.x, pos.y + extraY, pos.z), tmpQ, tmpS); bagIM.setMatrixAt(k, tmpM); tmpC.set(b.gold ? GOLD : '#ffffff'); bagIM.setColorAt(k, tmpC); b.k = k; k++; }
  bagIM.count = k; bagIM.instanceMatrix.needsUpdate = true; if (bagIM.instanceColor) bagIM.instanceColor.needsUpdate = true;
  /* 칸 금(걸음 ① · 흐린 자루) · 덜컹 뒤 빈 칸 깜박임 */ let g = 0; const bd = S.cur, blink = S.blinkT && S.t < S.blinkT ? Math.floor((S.blinkT - S.t) * 6) % 2 === 0 : false, grid = bd && bd.at === 'board' && !bd.covered && S.W && ((S.step === 1 && S.phase === 'flow') || blink);
  if (grid && bd.g.visible) { bd.g.updateMatrixWorld(); for (let i = S.W.board; i < 10 && g < 12; i++) { if (!blink && S.step !== 1) break; tmpQ.identity(); tmpS.set(1, 1, 1); tmpM.compose(bd.g.localToWorld(slotLocal(bd, i)), tmpQ, tmpS); ghostIM.setMatrixAt(g++, tmpM); } }
  ghostIM.count = g; ghostIM.instanceMatrix.needsUpdate = true; mats.ghost.opacity = blink ? .7 : .3; }

// ── 판의 움직임(밀려감 · 들썩 · 테)
function boardsTick(){ for (const bd of S.boards) { if (bd.go) { const f = bd.go, u = Math.min(1, (S.t - f.t0) * 1000 / f.ms), e = u < .5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2; bd.g.position.set(f.from.x + (f.to.x - f.from.x) * e, T.DECK, f.from.z + (f.to.z - f.from.z) * e); bd.g.rotation.y = f.from.r + (f.to.r - f.from.r) * e; if (u >= 1) { bd.go = null; f.res(); } }
    if (bd.bobT && S.t < bd.bobT) bd.g.position.y = T.DECK + Math.abs(Math.sin((bd.bobT - S.t) * 12)) * .06; else if (bd.at !== 'pile') bd.g.position.y = T.DECK; } }
/** 테가 둘러진다(착) — 조각 넷이 차례로 착착. */
function fenceStop(bd){ bd.fTok = (bd.fTok | 0) + 1; for (let i = stage.tweens.length - 1; i >= 0; i--) { const w = stage.tweens[i]; if (bd.fence.some(f => w.o === f.scale || w.o === f.rotation)) stage.tweens.splice(i, 1); } }
async function fenceUp(bd){ fenceStop(bd); bd.fence.forEach(f => { f.visible = true; f.scale.y = .01; f.rotation.z = 0; f.position.y = .05; }); const sy = bd.fence[0].userData.sy || (bd.fence[0].userData.sy = .34 / sizeOf(K[MODEL.fence].scene).s.y);
  for (let i = 0; i < 4; i++) { stage.tween(bd.fence[i].scale, { y: sy }, 160, t => 1 - (1 - t) ** 3); await sleep(55); } await sleep(140); }
/** 테가 둘러지려다 풀린다(덜컹). */
async function fenceFail(bd){ fenceStop(bd); const tok = bd.fTok, sy = bd.fence[0].userData.sy || (bd.fence[0].userData.sy = .34 / sizeOf(K[MODEL.fence].scene).s.y); bd.fence.forEach(f => { f.visible = true; f.scale.y = .01; f.rotation.z = 0; f.position.y = .05; });
  await Promise.all(bd.fence.map(f => stage.tween(f.scale, { y: sy * .7 }, 180))); if (bd.fTok !== tok) return; snd(150, .12, 'square', .06); snd(120, .14, 'square', .05, .12);
  await Promise.all(bd.fence.map((f, i) => stage.tween(f.rotation, { z: (i % 2 ? 1 : -1) * .35 }, 150))); if (bd.fTok !== tok) return; await Promise.all(bd.fence.map(f => stage.tween(f.scale, { y: .01 }, 260))); if (bd.fTok !== tok) return; bd.fence.forEach(f => { f.visible = false; f.rotation.z = 0; }); }
function boardReset(bd){ bd.fence.forEach(f => { f.visible = false; f.rotation.z = 0; }); bd.cover.visible = false; bd.cover.position.y = BAGH + .1; bd.covered = false; bd.packed = false; bd.sc = 1; bd.g.scale.setScalar(1); bd.g.visible = true; bd.bobT = 0; bd.go = null; }
const freeBoard = () => S.boards.find(b => !b.g.visible) || S.boards.find(b => b.at === 'pile');

// ── 한 문제
async function runProblem(p, ctx){ const my = S.oid; S.p = p; S.ctx = ctx; S.res = { early: 0, over: false, loose: 0, retreat: false, hinted: false, missed: false, pulls: 0, caught: 0, fell: 0, nudges: 0 }; S.phase = 'set'; S.busy = true; S.active = false; S.hold = true; S.firstPlaced = false; S.tellOn = false; S.handTo = null; S.sail = 0; S.sailOn = false; S.bell = false; S.blinkT = 0; S.handFn = null; S.earlyUntil = 0;
  C.hide(); S.choosingOn = false; stampsOff(); readHide(); H.hide();
  /* 앞 문제에 남은 것: 굴림대 자루는 창고로 · 판은 치움 */ for (const b of [...S.bags.values()]) if (!(b.bd && b.bd.at === 'pile')) S.bags.delete(b.id);
  for (const bd of S.boards) if (bd.g.visible && bd.at !== 'pile') bd.g.visible = false;
  const fd = R.feed(p, ctx.ev, Math.random, { board: ctx.b, calm: CALM, gold: ctx.gold, hand: ctx.hand }); if (S.forceFeed) { Object.assign(fd, S.forceFeed(fd, p) || {}); S.forceFeed = null; } S.fd = fd; S.W = R.world(p, fd);
  S.log.push({ start: R.key(p), cell: p.cell, step: S.step, n: fd.n, pre: fd.pre, total: fd.total, gap: fd.gap, feed: fd.bags.map(b => b.t), roll: !!fd.roll, gold: fd.bags.some(b => b.gold), pair: fd.bags.some(b => b.pair), cover: !!ctx.ev.cover, ev: Object.keys(ctx.ev).filter(k => ctx.ev[k] === true).join(' ') });
  const bd = freeBoard(); boardReset(bd); bd.rs = S.tall ? -1 : 1; S.cur = bd; S.packedB = null; boardTo(bd, 'enter'); for (let i = 0; i < fd.pre; i++) bagRec('p' + i, { st: 'board', bd, slot: i, snap: true });
  S.W.queue.forEach(q => bagRec(q.id, { st: 'q', gold: q.gold, snap: true }));
  shutter(true); sailSet(0); trayDraw(); E.marbles(ctx.j, 3, 0); reaim();
  await boardTo(bd, 'board', T.SLIDE_MS); if (S.oid !== my) return { abort: true };
  if (ctx.ev.cover) { if (fd.pre) { await sleep(1500); if (S.oid !== my) return { abort: true }; } bd.cover.visible = true; bd.cover.position.y = BAGH + .9; await stage.tween(bd.cover.position, { y: BAGH + .1 }, 380, t => t * t); bd.covered = true; snd(200, .08, 'triangle', .06); }   /* 덮인 판: 미리 놓인 것을 보여 준 뒤 덮는다(세어 둘 수 있게) */
  if (S.oid !== my) return { abort: true };
  S.phase = 'flow'; S.busy = false; S.active = true; S.hold = false; S.lastAct = S.t; S.lastNow = performance.now();
  const out = await new Promise(res => { S.done = res; }); S.active = false; S.done = null; S.hold = true; H.hide(); S.sailOn = false;
  const r = { ...S.res, clean: R.clean(S.res), out, cell: p.cell, key: R.key(p) }; S.log.push({ problem: r.key, ...r }); return r; }

/** 흐름의 일(rules.js step 이 돌려준 것)을 화면에. */
function onEvents(evs){ for (const e of evs) { S.log.push({ ev: e.type, at: e.at != null ? Math.round(e.at * 1000) / 1000 : Math.round(S.W.clock * 1000) / 1000, to: e.to, pulled: e.pulled || undefined, board: e.board, over: e.over });
  if (e.type === 'place') landBag(e);
  else if (e.type === 'block') { blockHint(); }
  else if (e.type === 'rollStart') { snd(300, .08, 'triangle', .05); }
  else if (e.type === 'rollFall') { const b = bagRec(e.id); b.fall = { from: b.p ? b.p.clone() : beltPt(1), t0: S.t, s: R.T.ROLL_BACK }; S.res.fell++; snd(240, .12, 'sine', .05, 0, 140); }
  else if (e.type === 'rollBack') { const b = bagRec(e.id); b.fall = null; b.st = 'q'; b.p = beltPt(BL() + .5); } } }
/** 자루 하나가 판(또는 넘침 자리)에 놓인다. */
function landBag(e){ const b = bagRec(e.id), bd = S.cur, from = b.p ? b.p.clone() : beltPt(0); b.fall = null;
  if (e.to === 'board') { b.st = 'board'; b.bd = bd; b.slot = e.slot; } else { b.st = 'seat'; b.slot = e.slot; b.bd = null; }
  const toFn = e.to === 'board' ? () => { bd.g.updateMatrixWorld(); return bd.g.localToWorld(slotLocal(bd, e.slot)); } : () => seatPt(e.slot);
  if (e.pulled) b.fly = { from, to: toFn, t0: S.t, ms: T.FLY_MS * 1.25, arc: .8, done: () => { b.snap = true; } }; else { b.fly = null; b.snap = true; }   /* 저절로 오는 자루는 놓이는 때 FLY_S 앞부터 날아와 그때 닿는다(판정과 그림이 같은 때) · 당긴 자루만 놓인 뒤 휙 */
  b.landWall = performance.now(); S.log.push({ land: e.id, wall: Math.round(b.landWall), at: e.at, pulled: !!e.pulled });
  const n = S.W.board; if (bd.covered) { bd.bobT = S.t + .25; snd(180, .06, 'triangle', .07); } else if (S.step === 1 && e.to === 'board') snd(330 * Math.pow(2, (n - 1) * 2 / 12), .09, 'triangle', .07); else snd(300, .06, 'triangle', .06);   /* 걸음 ① = 한 칸씩 오르는 음 · 걸음 ② · 덮인 판 = 같은 「툭」(음으로 세어지지 않게) */
  if (e.to === 'board' && n === 10 && S.step === 1 && !bd.covered) { bd.bobT = S.t + 1.4; snd(880, .12, 'triangle', .06, .15); }   /* 걸음 ① 만: 열이면 판이 들썩 · 반짝 */
  if (S.p.N != null && S.W.packed) trayDraw();
  if (!S.firstPlaced) { S.firstPlaced = true; firstTell(); } }
/** 첫 판 한 줄(깃발을 따기 전까지 나들이 첫 문제마다 · 첫 자루가 판에 놓인 뒤에). */
function firstTell(){ const c = S.ctx.tell; if (!c) return; if (H.tell(c.key, c.text, c.opt)) { S.tellOn = true; S.tellT = S.t; tellPlace(); S.lastAct = S.t + T.TELL_GRACE; } }
/** 넘침 자리가 다 찼다 — 굴림대가 멈추고 길잡이 손이 판을 짚는다(그 뒤에 누르면 깨끗하지 않음). */
function blockHint(){ if (S.phase !== 'flow') return; const q = boardCenter(); H.show(q.x, q.y); S.handTo = 'board'; S.handFn = () => boardCenter(); if (!S.res.hinted) { S.res.hinted = true; breakStreak('hint'); } S.log.push({ hand: 'board', hinted: true }); }

// ── 누르기(판 · 굴림대 자루 · 카드 · 빈 곳 — 모든 누름에 답이 있다)
const boardCenter = (bd = S.cur) => { bd.g.updateMatrixWorld(); return stage.screenOf(bd.g.localToWorld(V3(0, BAGH * .6, 0))); };
function quadOf(bd, m = .12){ bd.g.updateMatrixWorld(); return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => stage.screenOf(bd.g.localToWorld(V3(sx * (bd.W / 2 + m), BAGH * .5, sz * (bd.D / 2 + m))))); }
function inQuad(q, x, y){ let s = 0; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], c = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x); if (c !== 0) { if (s === 0) s = Math.sign(c); else if (Math.sign(c) !== s) return false; } } return true; }
/** 굴림대 위 자루의 화면 자리(보이는 것만). */
function beltBags(){ const W = S.W; if (!W) return []; return W.queue.map(q => S.bags.get(q.id)).filter((b, i) => b && b.p && !b.fly && !b.fall && b.st === 'q' && b.k != null && !(i === 0 && W.queue[0].t - W.clock <= T.FLY_S && W.over < R.T.OVER)).map(b => { const c = stage.screenOf(V3(b.p.x, b.p.y + BAGH * .5, b.p.z)), e = stage.screenOf(V3(b.p.x + T.BAG / 2, b.p.y + BAGH * .5, b.p.z)); return { id: b.id, x: c.x, y: c.y, r: Math.max(22, Math.hypot(e.x - c.x, e.y - c.y) * 1.5), risk: !!(W.risk && W.risk.id === b.id) }; }).filter(b => { const d = (beltPt(0).distanceTo(S.bags.get(b.id).p)); return d < BL() + .2; }); }
/** 누른 곳이 무엇인가(하네스 · 길잡이가 같이 씀): bag(굴림대 자루) · board(지금 판) · packed(묶은 판 · 표시) · seat · empty */
function hitAt(x, y){ if (S.cur && S.cur.g.visible && inQuad(quadOf(S.cur), x, y)) return { kind: 'board' };   /* 판 사각형 안이면 판 먼저(한숨 중인 자루가 판 가장자리 누름을 가로채지 않게) */
  const bb = beltBags().map(b => ({ ...b, d: Math.hypot(b.x - x, b.y - y) })).filter(b => b.d < b.r).sort((a, b) => (b.risk - a.risk) || a.d - b.d); if (bb.length) return { kind: 'bag', id: bb[0].id, risk: bb[0].risk };
  if (S.cur && S.cur.g.visible && inQuad(quadOf(S.cur), x, y)) return { kind: 'board' }; for (const bd of S.boards) if (bd !== S.cur && bd.g.visible && bd.at !== 'pile' && inQuad(quadOf(bd, .05), x, y)) return { kind: 'packed' };
  return { kind: 'empty' }; }
const canvas = $('c');
canvas.addEventListener('pointerdown', e => { audio(); if (!S.ready || E.homeOpen()) return; const x = e.clientX, y = e.clientY, hit = hitAt(x, y); S.log.push({ tap: hit.kind, phase: S.phase, busy: S.busy });
  if (S.tellOn && S.t - (S.tellT || 0) > 1.5) S.tellOn = false;
  if (!S.active || S.busy) { H.ripple(x, y); S.log.push({ ignored: S.active ? 'busy' : 'idle' }); if (S.active && S.busy) { if (H.tell('pack.busy', '잘 봐!', { times: 1e9, ms: 1400 })) tellPlace(); } return; }   /* 바쁜 동안(착 · 덜컹 · 굴러 나옴 · 이어 세는 중)에도 물결 */
  if (S.phase === 'flow' && hit.kind === 'board') { H.ripple(x, y); S.lastAct = S.t; pressBoard(); return; }
  if (S.phase === 'flow' && hit.kind === 'bag') { H.ripple(x, y); S.lastAct = S.t; tapBag(hit); return; }
  nudge(x, y, hit.kind); });
/** 판을 누른다(이 틀의 손 하나). */
async function pressBoard(){ const my = S.oid, W = S.W, how = R.judge(W), bd = S.cur; H.hide(); S.log.push({ press: how, board: W.board, over: W.over, clock: Math.round(W.clock * 1000) / 1000 });
  if (how === 'early' || how === 'loose') { if (how === 'early') S.res.early++; else S.res.loose++; breakStreak(how); S.busy = true; if (bd.covered) { stage.tween(bd.cover.position, { y: BAGH + .7 }, 160); bd.covered = false; }   /* 덮인 판은 잠깐 들쳐 보여 준다 */
    const last = [...S.bags.values()].filter(b => b.st === 'board' && b.bd === bd).sort((a, b) => b.slot - a.slot)[0]; if (last) { stage.tween(last, { tilt: .55 }, 160).then(() => stage.tween(last, { tilt: 0 }, 260)); }   /* 빈 자리로 자루 하나가 기우뚱 */
    S.blinkT = S.t + T.BLINK_MS / 1000; S.earlyUntil = S.t + T.EARLY_MS / 1000; S.earlyWall = performance.now(); S.earlyOid = my; fenceFail(bd); return; }   /* 덜컹의 바쁜 동안은 실제 시간으로 잰다(느린 기기에서 tween 이 늘어져도 길어지지 않게 · 그림은 그대로 흐름) */
  /* packed | over: 착 — 테가 둘러지고(넘친 것은 굴러 나와 굴림대 쪽으로) · 묶은 판에는 열 개 */
  if (how === 'over') { S.res.over = true; breakStreak('over'); }
  S.busy = true; S.hold = true; const seatBags = [...S.bags.values()].filter(b => b.st === 'seat').sort((a, b) => a.slot - b.slot); const r = R.press(W, 0);
  seatBags.forEach((b, i) => { S.bags.delete(b.id); const nid = W.queue[i] ? W.queue[i].id : b.id; b.id = nid; b.st = 'q'; b.fly = null; S.bags.set(nid, b); });   /* 넘친 자루는 그 그림 그대로 줄 맨 앞으로 굴러 돌아간다 */
  const cleanPack = !S.res.early && !S.res.over && !S.res.hinted && !S.res.loose; const pitch = 520 * Math.pow(2, Math.min(S.streak, 6) * 2 / 12);
  snd(pitch, .1, 'square', .06); snd(pitch * 1.5, .14, 'triangle', .07, .06); henry('Yes'); bd.packed = true; if (bd.covered) { stage.tween(bd.cover.position, { y: BAGH + 1.2 }, 380).then(() => { bd.cover.visible = false; }); bd.covered = false; }   /* 천이 걷히며 확인 */
  bd.bobT = S.t + .5; await fenceUp(bd); if (S.oid !== my) return; S.log.push({ packed: true, how, back: r.back, count: R.count(W), fence: bd.fence.filter(f => f.visible).length });
  if (cleanPack && S.ctx.gold && S.fd.bags.some(b => b.gold)) { wallet.earn(R.T.GOLD_COINS, 'pack'); confetti(10); coinsDraw(true); S.log.push({ goldOpen: true }); S.goldCarry = false; } else if (S.ctx.gold) S.goldCarry = true;
  if (S.p.k != null) { /* C01: 착이 곧 답 — 판 위에 10(가득 찬 열 칸 + 10) · 띠가 닫힘 · 「십 · 열」 */
    S.phase = 'done'; stampAt(0, `${C.dotsHtml(10, 10, 2)}<b>10</b>`, () => boardTop(bd, .75), 'ten');   /* 판 위(묶인 열이 그대로 보이게 판 뒤쪽 위에) */ S.stampOn = [0]; trayDraw(true); readShow(10); await sleep(T.READ_MS); if (S.oid !== my) return;
    for (const b of S.bags.values()) if (b.st === 'q') b.st = 'home'; shutter(true); stampsOff(); readHide(); await toPile(bd); if (S.oid !== my) return; S.icons.push(art(ICON.pack)); S.done && S.done('packed'); return; }
  /* C04: 묶은 판이 옆으로 밀려가 서고 새 판이 온다 */
  trayDraw(); const nb = freeBoard(); boardReset(nb); nb.rs = S.tall ? -1 : 1; boardTo(nb, 'enter'); S.packedB = bd; await Promise.all([boardTo(bd, 'packed', T.SLIDE_MS), boardTo(nb, 'board', T.SLIDE_MS)]); if (S.oid !== my) return;
  S.cur = nb; S.busy = false; S.hold = false; S.lastAct = S.t; S.lastNow = performance.now(); }
/** 굴림대의 자루를 누름: 구르는 자루면 잡아 제자리 · 아니면 맨 앞 자루를 당겨 바로 놓는다(넘침 자리가 다 찼으면 헛누름). */
function tapBag(hit){ const W = S.W; if (hit.risk && W.risk) { R.catchRoll(W); S.res.caught++; snd(600, .08, 'triangle', .06); S.log.push({ caught: hit.id }); return; }
  const e = R.pull(W); if (!e) { nudge(null, null, 'bag'); return; } S.res.pulls++; S.log.push({ pulled: e.id }); onEvents([e]); }
/** 헛누름: 물결 + 손이 다음 누를 곳(열이면 판 · 아니면 굴림대의 다음 자루 — 답을 일러 주지 않게) + 한 줄. 고르는 중이면 카드가 들썩(답은 짚지 않음). */
function nudge(x, y, kind){ if (x != null) H.ripple(x, y); S.res.nudges++; S.lastAct = S.t; snd(520, .07, 'triangle', .05); let to = null;
  if (S.phase === 'ask') { bob(); to = 'cards'; } else if (S.phase === 'flow') { if (S.W.board >= 10) { const q = boardCenter(); H.show(q.x, q.y); to = 'board'; if (!S.res.hinted) { S.res.hinted = true; breakStreak('hint'); } }   /* 열이 찼을 때 판을 짚는 것은 「지금이 열」이라는 답이 된다 — 깨끗하지 않음으로 센다 */
    else { const nb = beltBags()[0]; if (nb) { H.show(nb.x, nb.y); to = 'bag'; const id = nb.id; S.handFn = () => { const o = beltBags().find(x => x.id === id); return o ? { x: o.x, y: o.y } : null; }; } else { H.hide(); to = null; } } }   /* 굴림대에 보이는 자루가 없으면 손 없이 물결 + 한 줄(판은 열일 때만) */
  if (to === 'board') S.handFn = () => boardCenter(); if (to === 'cards' || !to) S.handFn = null;
  S.handTo = to; const t = nudgeText(); S.log.push({ nudge: kind, to, text: t }); if (H.tell('pack.nudge', t, { times: 1e9 })) tellPlace(); }
/** 헛누름 · 안내의 한 줄(꼴마다 — 그 꼴에서 실제로 일어나는 일만). */
function nudgeText(){ if (S.phase === 'ask') return ASK_LINE; if (S.p.k != null) return S.step === 1 ? FIRST.C01[1] : FIRST.C01[2]; return S.W.packed ? '남은 건 낱개야. 다 오면 수를 눌러 줘.' : FIRST.C04; }
function bob(){ const c = $('choose'); if (c && c.classList.contains('on')) c.querySelectorAll('button:not(.away)').forEach((b, i) => { b.classList.remove('bob'); void b.offsetWidth; b.style.animationDelay = (i * .05) + 's'; b.classList.add('bob'); }); }
function breakStreak(why){ if (S.streak) S.log.push({ streakBreak: why, was: S.streak }); S.streak = 0; }
/** 한 줄 안내 자리: 띠(와 카드) 바로 아래 · 판을 가리지 않게(가리면 아래쪽). */
function tellPlace(){ const tl = $('tell'); if (!tl) return; const top = S.choosingOn ? $('choose').getBoundingClientRect().bottom + 10 : ($('tray').classList.contains('on') ? $('tray').getBoundingClientRect().bottom + 10 : 70) + (READ.classList.contains('on') ? 48 : 0), hgt = tl.offsetHeight || 54;
  const q = S.cur ? quadOf(S.cur) : null, bTop = q ? Math.min(...q.map(v => v.y)) : innerHeight; if (S.low) { Object.assign(tl.style, { left: 'calc(10px + env(safe-area-inset-left,0px))', transform: 'none', maxWidth: '26vw', fontSize: '1rem', padding: '6px 12px', top: top + 'px', bottom: '' }); return; }
  Object.assign(tl.style, { left: '', transform: '', maxWidth: '', fontSize: '', padding: '' }); if (bTop - top >= hgt + 4) { tl.style.top = top + 'px'; tl.style.bottom = ''; } else { tl.style.top = 'auto'; tl.style.bottom = S.tall ? 'calc(124px + env(safe-area-inset-bottom,0px))' : 'calc(30px + env(safe-area-inset-bottom,0px))'; } }

// ── 묻기(C04): 굴림대가 비면 창고 문이 닫히고 → 묶은 판 · 낱개 판이 나란히 → 띠 + 수 셋
async function askNow(){ const my = S.oid; S.phase = 'ask'; S.busy = true; H.hide(); shutter(false); snd(200, .1, 'square', .05);
  await Promise.all([boardTo(S.packedB, 'pairL', T.SLIDE_MS), boardTo(S.cur, 'pairR', T.SLIDE_MS)]); if (S.oid !== my) return;
  trayDraw(); const list = S.forceCards || R.cards(S.p, S.step); S.forceCards = null; C.show(list, onPick, { tens: S.step === 1 }); S.choosingOn = true; S.cardT0 = S.t; reaim(); C.place(); C.ask(true);
  S.log.push({ ask: S.p.N, cards: list, tens: S.step === 1 }); S.busy = false; S.lastAct = S.t; S.sailOn = !!S.ctx.ev.sail && !CALM; S.sail = 0;
  if (S.ctx.askTell && H.tell(S.ctx.askTell.key, ASK_LINE, S.ctx.askTell.opt)) { S.tellOn = true; S.tellT = S.t; tellPlace(); S.lastAct = S.t + T.TELL_GRACE; } }
async function onPick(n, btn){ audio(); const r = btn.getBoundingClientRect(); if (!S.active || S.busy || S.phase !== 'ask' || S.t - S.cardT0 < T.CARD_GUARD / 1000) { H.ripple(r.left + r.width / 2, r.top + r.height / 2); S.log.push({ ignored: 'card' }); return; }   /* 새 카드 뒤 잠깐은 물결만(두 번 누름이 새 카드를 누르지 않게) */
  S.lastAct = S.t; H.hide(); S.log.push({ pick: n, right: n === S.p.N });
  if (n === S.p.N) { await fit(btn); return; }
  const my = S.oid; S.res.retreat = true; breakStreak('retreat'); S.busy = true; C.retreat(btn); await countThrough(); if (S.oid !== my) return; S.busy = false; S.lastAct = S.t; S.handTo = null; S.handFn = null; }   /* 물러난 뒤 길잡이 손이 HINT_AFTER 뒤에 다시 올 수 있게 */
/** 아니었을 때 · 놓쳤을 때의 세계의 답: 묶은 판이 통째로 「십」 하고 한 번 뛰고 · 낱개가 하나씩 이어 세어진다(십일 · 십이 · …). */
async function countThrough(){ const my = S.oid, pk = S.packedB, ls = [...S.bags.values()].filter(b => b.st === 'board' && b.bd === S.cur).sort((a, b) => a.slot - b.slot); LABELS.forEach(d => { d.className = 'cnt'; d._o = null; });
  label(0, '10', { bd: pk }, true); say(R.read(10).split(' · ')[0]); snd(392, .12, 'triangle', .07); pk.bobT = S.t + .45; await sleep(T.HOP_MS * 1.4); if (S.oid !== my) return;
  for (let i = 0; i < ls.length; i++) { const n = 11 + i; label(i + 1, String(n), { b: ls[i] }); ls[i].hop = 0; stage.tween(ls[i], { hop: .25 }, T.HOP_MS * .45, t => t * (2 - t)).then(() => stage.tween(ls[i], { hop: 0 }, T.HOP_MS * .55, t => t * t)); say(R.read(n).split(' · ')[0]); snd(392 * Math.pow(2, (i + 1) * 2 / 12), .1, 'triangle', .07); await sleep(T.HOP_MS); if (S.oid !== my) return; }
  S.log.push({ counted: 10 + ls.length }); await sleep(300); }
function label(i, text, at, ten){ const d = LABELS[i]; if (!d) return; d.textContent = text; d.className = 'cnt on' + (ten ? ' ten' : ''); d._o = at; labelPlace(d); }
function labelPlace(d){ const o = d._o; if (!o) return; let q; if (o.bd) q = boardTop(o.bd, .45); else if (o.b && o.b.p) q = stage.screenOf(V3(o.b.p.x, o.b.p.y + BAGH * (lastBig() ? T.BIG : 1) + .1 + (o.b.hop || 0), o.b.p.z)); if (!q) return; d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; }
/** 맞음: 묶은 판과 낱개 판 위에 1 과 r 이 찍히고 붙어서 N 이 된다 · 「십사 · 열넷」 · 배에 실린다. */
async function fit(btn){ const my = S.oid, p = S.p; S.busy = true; S.phase = 'done'; S.sailOn = false; btn.classList.add('bob'); setTimeout(() => { C.hide(); S.choosingOn = false; }, 380); henry('Yes');
  await joinStamps(); if (S.oid !== my) return; trayDraw(true); readShow(p.N); wallet.earn(R.T.COIN_PER, 'pack'); coinsDraw(true); await sleep(T.READ_MS); if (S.oid !== my) return;
  stampsOff(); readHide(); await Promise.all([toPile(S.packedB), toShip(S.cur)]); if (S.oid !== my) return; S.icons.push(art(ICON.pack)); S.done && S.done('fit'); }
async function joinStamps(){ const my = S.oid, p = S.p, pk = S.packedB, ls = S.cur, A1 = () => boardTop(pk, .35), B1 = () => boardTop(ls, .35); LABELS.forEach(d => { d.className = 'cnt'; d._o = null; });   /* 이어 세기 표를 먼저 끈다(찍힌 수와 겹치지 않게) */
  const d1 = stampAt(0, '<b>1</b>', A1), d2 = stampAt(1, `<b>${R.loose(p)}</b>`, B1); snd(660, .1, 'triangle', .06); await sleep(650); if (S.oid !== my) return;
  const mid = () => { const a = A1(), b = B1(); return { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 10 }; }, w1 = d1.offsetWidth, w2 = d2.offsetWidth; d1._at = () => { const m = mid(); return { x: m.x - w2 / 2 + 2, y: m.y }; }; d2._at = () => { const m = mid(); return { x: m.x + w1 / 2 - 2, y: m.y }; }; stampsPlace(); await sleep(650); if (S.oid !== my) return;
  stampsOff(); stampAt(2, `<b>${p.N}</b>`, mid, 'big'); snd(880, .14, 'triangle', .07); S.log.push({ joined: p.N }); }
/** 시계(돛)가 다 올라감 — 배가 그 판을 두고 떠난다(그 문제는 두 문제 뒤에 다시) · 답은 화면에 남는다. */
async function missNow(){ if (S.phase !== 'ask' || S.busy) return; const my = S.oid; S.busy = true; S.res.missed = true; breakStreak('miss'); S.sailOn = false; C.hide(); S.choosingOn = false; H.hide(); S.handTo = null; S.log.push({ missed: true }); snd(330, .3, 'sine', .07, 0, 200);
  await countThrough(); if (S.oid !== my) return; await joinStamps(); if (S.oid !== my) return; trayDraw(true); readShow(S.p.N); S.phase = 'done';
  const sx = S.ship.position.x; await stage.tween(S.ship.position, { x: sx + (S.tall ? 4 : 6) }, 1400, t => t * t); if (S.oid !== my) return; await sleep(500); stampsOff(); readHide(); S.ship.position.x = L().ship[0]; S.ship.position.z = L().ship[1]; S.done && S.done('missed'); }   /* 배는 그때의 화면 꼴 자리로 돌아온다 */

// ── 배 · 돛 · 쌓인 판 · 창고 문
function sailSet(v){ const k = Math.max(0, Math.min(1, v)); S.sailG = k; if (!S.sailObj) return; S.sailObj.scale.y = .12 + .88 * k; S.sailObj.position.y = S.deckY + .25 + .75 * k; }
function shutter(open){ if (!S.shutter) return; const by = T.DECK + T.BELT_Y; stage.tween(S.shutter.position, { y: open ? by + 1.25 : by - .12 }, 300); S.shutOpen = open; }
/** 묶은 판을 배에 쌓는다(오늘 묶은 판 · 착착이면 탑이 흔들). */
async function toPile(bd){ const i = S.pile.length; const wp = S.pileG.localToWorld(V3(0, 0, 0)); bd.at = 'pile'; await new Promise(res => { bd.go = { from: { x: bd.g.position.x, z: bd.g.position.z, r: bd.g.rotation.y }, to: { x: wp.x, z: wp.z, r: S.ship.rotation.y }, t0: S.t, ms: T.SLIDE_MS, res }; });
  S.pileG.attach(bd.g); bd.g.position.set(0, i * (BAGH * T.PILE_S + .08), 0); bd.g.rotation.set(0, (i % 2 ? .12 : -.1), 0); bd.g.scale.setScalar(T.PILE_S); bd.sc = T.PILE_S; S.pile.push(bd);
  while (S.pile.length > T.PILE_MAX) { const o = S.pile.shift(); for (const b of [...S.bags.values()]) if (b.bd === o) S.bags.delete(b.id); scene.attach(o.g); o.g.visible = false; o.at = null; } snd(400, .08, 'triangle', .05); }
/** 낱개 판은 배 안으로(낱개는 실려 들어간다). */
async function toShip(bd){ const wp = S.ship.localToWorld(V3(-.6, 0, 0)); bd.at = 'ship'; await new Promise(res => { bd.go = { from: { x: bd.g.position.x, z: bd.g.position.z, r: bd.g.rotation.y }, to: { x: wp.x, z: wp.z, r: bd.g.rotation.y }, t0: S.t, ms: T.SLIDE_MS, res }; }); bd.g.visible = false; for (const b of [...S.bags.values()]) if (b.bd === bd) S.bags.delete(b.id); }

// ── 시계(흐름 · 돛) · 길잡이 · 그림
stage.frame(() => { const now = performance.now(); let rdt = (now - (S.lastNow || now)) / 1000; S.lastNow = now; rdt = Math.max(0, Math.min(1, rdt)); S.t += rdt; if (!S.ready) return;
  if (S.slowMs) { const t0 = performance.now(); while (performance.now() - t0 < S.slowMs) { /* 하네스: 느린 기기 흉내(프레임을 떨어뜨린다) */ } }
  const tl = $('tell'), tellVis = !!(tl && tl.classList.contains('on')); if (!tellVis) S.tellOn = false;
  if (S.phase === 'flow' && S.W && !S.hold) { const rate = S.tellOn ? R.T.TELL_SLOW : 1; onEvents(R.step(S.W, rdt * rate)); if (S.p.N != null && S.W.packed && R.drained(S.W) && !S.busy) { askNow(); } }
  /* 돛: 고르는 동안에만(바쁜 동안 · 안내가 떠 있는 동안 멈춤) · 끝이 가까우면 뱃종 */
  if (S.phase === 'ask' && S.sailOn && !S.busy && !S.tellOn) { S.sail = Math.min(1, S.sail + rdt / R.sailS(S.ctx.b)); if (S.sail > .8 && !S.bell) { S.bell = true; snd(1180, .25, 'triangle', .06); snd(1180, .25, 'triangle', .05, .35); S.log.push({ bell: true }); } if (S.sail >= 1) missNow(); }
  sailSet(S.phase === 'ask' || S.phase === 'done' ? S.sail : 0);
  /* 길잡이 손(고르는 중): 가만히 있으면 HINT_AFTER 뒤 맞는 카드(뜨면 그 문제는 깨끗하지 않음) */
  if (S.phase === 'ask' && S.active && !S.busy && !S.tellOn) { const wait = R.T.HINT_AFTER * (M.stuck(M.get(S.cell)) >= 1 ? .5 : 1); if (S.t - S.lastAct > wait && S.handTo !== 'card') { const q = answerAt(); if (q) { H.show(q.x, q.y); S.handTo = 'card'; S.handFn = answerAt; S.res.hinted = true; breakStreak('hint'); S.log.push({ hinted: true, hand: 'card' }); } } }
  if (S.earlyUntil && S.t >= S.earlyUntil) { S.earlyUntil = 0; if (S.earlyOid === S.oid && S.phase === 'flow') { const bd = S.cur; if (S.ctx.ev.cover && S.W && !S.W.packed && bd) { stage.tween(bd.cover.position, { y: BAGH + .1 }, 200); bd.covered = true; } S.busy = false; S.lastAct = S.t; S.log.push({ earlyEnd: Math.round(performance.now() - S.earlyWall) }); } }
  /* 손이 판: 넘침 자리가 다 찼을 때(곧바로) · 열이 찼는데 더 올 자루가 없을 때(마지막으로 놓인 뒤 HINT_AFTER — 안 누르면 그대로 서 있지 않게) */
  if (S.phase === 'flow' && S.W && !S.busy && S.handTo !== 'board' && R.needHand(S.W)) blockHint();
  if (S.handFn && H.shown()) { const q = S.handFn(); if (q) H.show(q.x, q.y); }   /* 손은 짚은 것을 따라간다(움직이는 자루 · 화면을 돌릴 때) */
  /* 굴대가 돈다(흐르는 동안 · 착착이면 힘차게) · 쌓인 판 탑이 흔들(착착 셋부터) */
  const spin = S.phase === 'flow' && S.W && !S.W.blocked && !S.hold ? (1 + .5 * Math.min(S.streak, 3)) * (S.tellOn ? R.T.TELL_SLOW : 1) : 0; S.rollerA += rdt * spin * 9; if (S.rollers) for (const r of S.rollers) r.rotation.y = S.rollerA;
  S.wob = S.streak >= R.T.STREAK ? Math.sin(S.t * 6) * .06 : S.wob * Math.exp(-rdt * 4); if (S.pileG) { S.pileG.rotation.z = S.wob; S.pileG.rotation.x = S.wob * .5; }
  if (S.ship) S.ship.position.y = Math.sin(S.t * 1.3) * .03;
  boardsTick(); bagsTick(rdt); cntDraw(); stampsPlace(); for (const d of LABELS) if (d.classList.contains('on')) labelPlace(d); if (S.choosingOn) C.place(); });
/** 맞는 카드의 화면 자리(길잡이 손 · 하네스). */
function answerAt(){ const b = [...document.querySelectorAll('#choose.on button')].find(b => b.dataset.n === String(S.p.N)); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 10 }; }

// ── 나들이
const FIRST = { C01: { 1: '자루가 열 개가 되면 판을 눌러 묶어 줘.', 2: '세어 보다가 딱 열 개일 때 판을 눌러 줘.' }, C04: '열 개가 되면 판을 눌러 묶어 줘. 남은 건 낱개야.' };
const ASK_LINE = '한 판과 낱개를 보고 수를 눌러 줘.';
const TELLS = () => ({ times: M.passed(M.get(S.cell || '')) ? 2 : 1e9 });   /* 깃발을 따기 전에는 나들이 첫 문제마다(정본 5-11절) */
async function outing(id){ const my = ++S.oid; E.showBar(true); S.cell = id; S.streak = 0; S.goldCarry = false; S.icons = []; const day = M.dayKey(); let prevStep = 0;
  for (const bd of S.pile) { for (const b of [...S.bags.values()]) if (b.bd === bd) S.bags.delete(b.id); scene.attach(bd.g); bd.g.visible = false; bd.at = null; } S.pile = []; S.ship.position.set(L().ship[0], 0, L().ship[1]);
  let rec = M.get(id); S.back = M.stuckNow(rec) && !!rec.hand;
  let q = R.deal(id, S.hist[id] || [], Math.random, { small: M.stuck(rec) >= 1, carry: S.carry[id] }); S.carry[id] = []; S.q = q; E.lanterns(0); S.log.push({ outing: id, deal: q.map(R.key) });
  for (let b = 0; b < R.T.BOARDS; b++) { rec = M.get(id); const hand = !rec.hand || S.back;
    let ev = R.events(id, rec.evBoards, Math.random, { passed: M.passed(rec), calm: CALM, hand }); if (S.forceEv) { ev = { ...ev, ...S.forceEv }; S.forceEv = null; }
    const carried = S.goldCarry && !hand; if (carried) ev = { ...ev, roll: false, pair: false, cover: false, gold: true, carried: true };   /* 넘어온 금빛 자루 판에는 다른 사건을 붙이지 않는다(판마다 하나 · 돛은 시계라 그대로) */
    S.ev = ev; S.step = hand ? 1 : 2; const goldJ = !ev.gold ? -1 : ev.goldJ != null ? ev.goldJ : Math.floor(Math.random() * 3); S.board = { b, hand, ev }; S.log.push({ board: b, hand, ev: Object.keys(ev).filter(k => ev[k] === true).join(' ') });
    const results = []; E.marbles(0);
    for (let j = 0; j < R.T.PER_BOARD; j++) { const i = b * R.T.PER_BOARD + j; if (S.forceP && S.forceP.length) { const f = S.forceP.shift(); q[i] = R.make(id, f); } const p = q[i];
      const firstStep = b === 0 || (hand ? 1 : 2) !== prevStep, tellOk = j === 0 && firstStep, last = !hand && b === R.T.BOARDS - 1 && j === R.T.PER_BOARD - 1;   /* 큰 자루는 셋째 판이 걸음 ② 일 때만(막혀서 돌아온 걸음 ① 판은 빨라지지도 커지지도 않는다) */
      const r = await runProblem(p, { b, j, hand, ev, gold: j === goldJ, last, tell: tellOk ? { key: 'pack.' + id + '.' + (hand ? 1 : 2), text: id === 'C01' ? FIRST.C01[hand ? 1 : 2] : FIRST.C04, opt: TELLS() } : null, askTell: tellOk && id === 'C04' ? { key: 'pack.C04.ask', opt: TELLS() } : null });
      if (S.oid !== my || r.abort) return; results.push(r); E.marbles(j + 1);
      if (r.clean && !hand) { S.streak++; S.log.push({ streak: S.streak }); } else if (!r.clean) breakStreak('problem');
      if (!r.clean) { const rq = R.requeue(q, i); q = rq.q; if (rq.carry) S.carry[id].push(rq.carry); } S.q = q; }
    prevStep = hand ? 1 : 2;
    const before = rec; rec = M.record(rec, results, day, { counts: !hand, hand, ev: !hand && !ev.none && !ev.carried });   /* 금빛이 넘어온 판은 사건 차례를 세지 않는다(차례의 사건 하나를 건너뛰지 않게) */ if (hand) S.back = false; else if (M.stuckNow(rec)) S.back = true; M.put(id, rec); S.log.push({ boardEnd: b, clean: M.clean(results), rec: { ...rec } });
    await E.fly($('marbles'), $('coins'), art(ICON.coin), id === 'C01' ? results.filter(r => r.out === 'packed').length : 0); if (S.oid !== my) return; if (id === 'C01') { wallet.earn(results.length * R.T.COIN_PER, 'pack'); coinsDraw(true); }
    E.lanterns(b + 1); snd(660, .15, 'triangle', .1); snd(990, .2, 'triangle', .1, .12);
    if (!M.passed(before) && M.passed(rec)) { grew(art(ICON.flag) + ' 깃발을 땄어요!'); await sleep(2400); }
    if (S.oid !== my) return; await sleep(400); }
  S.hist[id] = q; await finale(); if (S.oid !== my) return;
  const nx = M.passed(M.get(id)) ? nextHere(id) : null; S.log.push({ homeNext: nx });   /* 「다음으로」 = 깃발을 땄고 같은 학년의 다음 낱칸이 있을 때만(go/next.js · T11 — C01 → C02 · C04 → D06) */
  const choice = await E.home({ items: S.icons.slice(), next: nx ? '다음으로' : '' }); if (S.oid !== my) return;
  if (choice === 'again') outing(id); else if (choice === 'next' && nx) location.href = goHref(nx); else location.href = GO; }
/** 나들이 끝: 오늘 묶은 판을 실은 배가 떠난다. */
async function finale(){ const my = S.oid; S.p = null; S.W = null; S.phase = 'idle'; A.trayClear(); C.hide(); S.choosingOn = false; stampsOff(); readHide(); for (const b of [...S.bags.values()]) if (!(b.bd && b.bd.at === 'pile')) S.bags.delete(b.id); for (const bd of S.boards) if (bd.at !== 'pile') bd.g.visible = false;
  stage.play(S.henry, 'Wave', true); sailSet(1); S.log.push({ finale: S.pile.length }); snd(523, .2, 'triangle', .06); snd(659, .2, 'triangle', .06, .2); snd(784, .3, 'triangle', .06, .4);
  const sx = S.ship.position.x; await stage.tween(S.ship.position, { x: sx + (S.tall ? 3 : 4.5) }, 2200, t => t * t); if (S.oid !== my) return; }
/** 하네스 · 교사용: 지금 나들이를 거둔다. */
function abort(){ S.oid++; S.active = false; if (S.done) { const d = S.done; S.done = null; d('abort'); } stage.tweens.length = 0; C.hide(); S.choosingOn = false; A.trayClear(); stampsOff(); if (READ) readHide(); S.busy = false; S.hold = true; S.phase = 'idle'; S.W = null; H.hide();
  for (const bd of S.boards) { if (bd.at === 'pile') scene.attach(bd.g); bd.g.visible = false; bd.at = null; bd.go = null; } S.pile = []; S.bags.clear(); S.handFn = null; S.earlyUntil = 0; if (S.ship) S.ship.position.set(L().ship[0], 0, L().ship[1]); }

window.__pack = { S, R, M, E, T, stage, wallet, outing, abort, hitAt, answerAt, boardCenter, boardTop, beltBags, beltEnd: () => stage.screenOf(beltPt(0)), count: () => S.W ? R.count(S.W) : null,
  boardQuad: () => S.cur ? quadOf(S.cur) : null, slow: ms => { S.slowMs = ms | 0; },
  shown: () => ({ bags: bagIM ? bagIM.count : 0, ghosts: ghostIM ? ghostIM.count : 0, fence: S.cur ? S.cur.fence.filter(f => f.visible).length : 0, covered: !!(S.cur && S.cur.covered) }),
  keyRects: () => [...document.querySelectorAll('#choose.on button, #tray.on, #marbles, #lanterns, #coins, .back, #snd, #tell.on, #readline.on, #cnt.on')].map(e => e.getBoundingClientRect()).filter(r => r.width) };
if (!GO_NOW) build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
