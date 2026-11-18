// 케이모션 과학실 — 그림 판 놀이(조립): 구운 방 + 진짜 기구(GLB) + 손 모델 + 실험 논리(session) + 효과(fx 다리) + 쪽지·카드·까닭·노트
// 화면은 결과를 스스로 정하지 않는다: 손 동작을 「뜻이 있는 사건」으로 바꿔 session 에 보내고, 돌아온 효과 목록과 session.view() 만 그린다.
// 동사 여덟 개(집기·옮기기·놓기·기울여 붓기·담그기·내리치기·쓰기 + 감싸기)만 쓴다. 버튼이 손 동작을 대신하지 않는다.
// 매 프레임 도는 곳(update 안)에서는 새 물체를 만들지 않는다 — 아래 _ 로 시작하는 임시 그릇을 다시 쓴다.
import * as THREE from 'three';
import { createSession } from '../sim/session.js';
import { kindOf } from '../sim/thermal.js';
import { loadPropAssets, makeItem, restQuat, pivotForRest, makeHand, cloneOwn, SHELF_LAYOUT, FLIP_IN_TONGS } from './items.js';
import { createFxBridge } from './fxbridge.js';
import { createCards } from './cards.js';
import { createNote } from './note.js';
import { makeStrike, wrapDeg, followK, lostAction, inZone, BODY_ZONE, WEAR_LOST_Y, LOST_ASK_MS, GRAB_RADIUS, clamp } from './hands.js';

const DEG = Math.PI / 180, G = 9.8;

// ── 손 도움(ASSIST): 아이 손·카메라 떨림(초당 30장, 가끔 끊김)·터치·마우스를 너그럽게 받는 숫자는 전부 여기.
//    실기기(크롬북)에서 해 보고 여기만 고친다. 단위: 「화면」 = 화면 높이에 대한 비율, m = 미터, s = 초.
//    지키는 것: 버튼이 손 동작을 대신하지 않는다 · 손목 각도·내리치는 빠르기는 1:1 · 손을 놓쳐도 아무것도 깨지지 않는다
//    · 자석은 성공 쪽으로만 끈다(맨손을 질소 쪽으로 끄는 일은 없다).
export const ASSIST = {
  grab: .11,            // 집기: 손에서 이 반경(화면) 안의 가장 가까운 기구가 밝아지고, 쥐면 잡힌다
  camGrab: 1.2,         // 카메라 손은 집기 반경을 이 배로(손 위치가 떨리고 깊이를 모르니 조금 넉넉히 — 1.4 는 지나가다 엉뚱한 것을 집어 「예민」했음)
  wearDwell: .3,        // 장비(보안면·장갑)를 들고 「내 몸」 자리에 이 시간(s) 머물면 손을 펴지 않아도 쓴다
  wearPull: .8,         // 카메라 손: 장비를 쥔 손이 쥘 때 크기의 이 배 아래로 작아지면(= 내 몸 쪽으로 당김) 쓴다
  wearPullT: .15,       // …그 상태가 이 시간(s) 이어지면
  handDipFrom: .12,     // 장갑 낀 손으로 든 시료: 손이 그릇 테두리 위 이만큼(m) 아래로 오면 액면 아래로 끌어 준다(손을 이보다 들면 꺼냄)
  grabKeep: 1.4,        // 밝아진 기구는 다른 기구가 이 배 더 가까워야 바뀐다(두 기구 사이에서 깜빡이지 않게)
  grabLate: .35,        // 손을 먼저 쥐고 다가와도 이 시간(s) 안에 기구가 반경에 들면 잡는다
  releaseCam: .14,      // 카메라 손: 손이 이 시간(s) 넘게 펴져 있어야 놓는다(쥔 손 인식이 한두 장 끊겨도 안 떨어뜨림)
  clamp: .075,          // 집게 끝이 시료 몸통(화면에 비친 네모)에서 이 거리(화면) 안이면 문다
  clampAbove: .06,      // 실험대 위 시료는 집게 끝이 시료 윗면 + 이만큼(m) 아래로 내려와야 문다
  clampPull: .2,        // 이 안이면 집게 끝이 시료 쪽으로 끌려간다(화면)
  clampPullMax: .09,    // 끌림 최대(m)
  clampStem: .4,        // 꽃을 거꾸로 물 때 줄기 끝에서 꽃 쪽으로 이만큼(0~1) 올라온 자리를 문다(너무 길게 늘어지면 컷 B 에서 그릇 밖으로 못 꺼냄)
  clampStill: .45,      // …그리고 그동안 끝이 이보다 느려야(화면/s) — 큰 풍선을 가로질러 지나가며 물지 않게
  clampDwell: .15,      // 집게 끝이 시료 곁에 이 시간(s) 머물러야 문다(옆을 스치기만 하면 안 묾)
  clampAgain: 1.8,      // 내려놓은 시료를 같은 집게가 다시 물기까지(s)
  bowlPull: 1.8,        // 집게에 문 시료가 그릇 입구 위(가운데에서 그릇 반지름 × 이만큼 안, 테두리 위 25cm 안)면 가운데로 끌린다
  bowlPullMax: .14,     // m
  dipPullFrom: .03,     // 문 시료 바닥이 그릇 테두리 + 이만큼(m) 아래로 오면 액면 아래로 끌려 들어간다
  dipPullDepth: .025,   // 액면 아래 이만큼(m)까지
  dipPullMax: .09,      // 아래로 끌림 최대(m)
  dipHold: .3,          // 집게 끝이 테두리 + 이만큼(m) 아래에 있는 동안은 잠긴 채로(그 위로 올리면 꺼냄)
  dipIn: .006,          // 담금: 시료 바닥이 액면보다 이만큼(m) 아래로 가면 「담갔다」
  dipOut: .025,         // 꺼냄: 액면보다 이만큼(m) 위로 나오면 「꺼냈다」(사이에서는 그대로 → 깜빡임 없음)
  liftRaise: .12,       // …또는 담글 때보다 집게 끝을 이만큼(m) 더 들어 올리면 꺼낸 것(큰 풍선은 컷 B 에서 액면 위로 다 못 들어 올리니까). 다시 담그려면 그 높이 가까이 내려야
  dipBlock: 1.2,        // 막힌 담그기(예상 먼저 등)를 다시 보내기까지(s)
  setDown: .03,         // 집게에 문 시료의 바닥이 상판 위 이만큼(m) 안으로 오면 내려놓는다
  setDownReach: .2,     // 문 시료 바닥이 상판 위 이만큼(m) 안으로 오면 깊이가 손이 가리키는 상판 자리를 따라간다(뒷줄 자리에도 내려놓게)
  armLift: .06,         // …단, 물고 나서 한 번은 상판 위 이만큼(m) 넘게 들어 올린 뒤에만(물자마자 내려놓이지 않게)
  snapBench: .24,       // 놓기: 실험대 자리를 찾는 반경(화면)
  snapShelf: .15,       // 놓기: 선반 칸을 찾는 반경(화면)
  strikeAim: .07,       // 망치 머리가 대상 너비 + 이만큼(m) 안이면 그 대상을 친다
  strikePull: .12,      // 쥔 망치 머리가 대상 위 이만큼(m, 옆으로) 안이면 대상 위로 끌린다
  strikePullMax: .07,   // 그 끌림 최대(m)
  strikeKeep: .35,      // 내리치는 사이 대상을 이 시간(s) 기억(휙 내리는 동안 잠깐 벗어나도)
  pourPull: 3,          // 붓기: 줄기가 그릇 반지름 × 이만큼 안에 떨어지면 그릇 쪽으로 끌린다
  pourPullMax: .16,     // m
  pourHyst: 7,          // 붓기 멈춤 = 시작 각도 − 이만큼(°)
  pourFull: 95,         // 이 각도(°)에서 가장 세게
  pourRate: .62,        // 다 기울였을 때 초당 붓는 양(통 한 통 = 2.5, 그릇 = 1)
  waterRate: .35,
  pourSend: .1,         // 붓는 양을 session 에 보내는 간격(s)
  cup: .16,             // 감싸기: 두 손이 풍선 가운데에서 이 거리(화면) 안
  cupHold: .35,         // 이 시간(s) 감싸고 있으면 「감쌌다」
  cardsAfterPour: .4,   // 예상 카드는 붓는 통을 내려놓고(또는 붓기를 멈추고) 이 시간(s) 뒤에 뜬다
  pull: 7,              // 자석이 따라붙는 빠르기(1/s)
};
const POUR_RATE = ASSIST.pourRate, POUR_FULL = ASSIST.pourFull, POUR_HYST = ASSIST.pourHyst, POUR_SEND = ASSIST.pourSend, WATER_RATE = ASSIST.waterRate;
const SNAP_BENCH = ASSIST.snapBench, SNAP_SHELF = ASSIST.snapShelf, CUP_R = ASSIST.cup, CUP_HOLD = ASSIST.cupHold;
const SHARDS = { rose: ['rose_shards', 'head', .04, 0x8e1022], ball: ['ball_shards', null, .03, 0xc8452a], balloon: ['balloon_shreds', null, .1, 0xb3121b] };
const WOW = new Set(['shatter', 'pop', 'tear']);

export async function createPlay({ stage, input, audio, els, mode, Q }){
  const THREE_ = THREE, scene = stage.scene;
  const exp = await (await fetch('./exp/ln2/exp.json', { cache: 'no-cache' })).json();
  const TX = exp.texts, UI = TX.ui || {}, defs = {}; for (const d of exp.items) defs[d.id] = d;
  const session = createSession(exp);
  let V = session.view();
  const ids = Object.keys(V.objects), kinds = [...new Set(ids.map(kindOf))];
  const assets = await loadPropAssets([...kinds, 'hand_r', 'hand_l', 'rose_shards', 'ball_shards', 'balloon_shreds']);
  const bridge = await createFxBridge(stage, { off: Q.has('nofx') });
  const benchY = stage.BENCH_Y, BR = stage.benchRect || { xMin: -1.31, xMax: 1.05, zMin: -.39, zMax: .39 };
  const WORK_Z = stage.WORK_Z;

  // ── 햇빛 그림자: 실험대 + 선반까지 덮게(등급 상이면 2048)
  { const sun = stage.sun, sc = sun.shadow.camera; sc.left = -2.3; sc.right = 2.3; sc.top = 2.3; sc.bottom = -1.7; sc.near = .5; sc.far = 12; sc.updateProjectionMatrix();
    const want = bridge.tier === 'high' ? 2048 : 1024; if (sun.shadow.mapSize.x !== want) { sun.shadow.mapSize.set(want, want); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } } sun.shadow.bias = -.0004; sun.shadow.normalBias = .015; }

  // ── 임시 그릇(매 프레임 다시 씀)
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _t = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
  const _s = { x: 0, y: 0, z: 0 }, _s2 = { x: 0, y: 0, z: 0 }, _low = { minY: 0, maxY: 0, cx: 0, cy: 0, cz: 0, rx: 0 }, _low2 = { minY: 0, maxY: 0, cx: 0, cy: 0, cz: 0, rx: 0 };
  const QFLIP = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
  const gloved = () => !!(V && V.worn && V.worn.gloves);
  const AXZ = new THREE.Vector3(0, 0, 1), UP = new THREE.Vector3(0, 1, 0), DOWN = new THREE.Vector3(0, -1, 0), QI = new THREE.Quaternion();
  const corners = Array.from({ length: 8 }, () => new THREE.Vector3());
  const aspect = () => stage.camera.aspect;
  const sdist = (a, b) => Math.hypot((a.x - b.x) * aspect(), a.y - b.y);

  // ── 자리: 실험대 앞줄(bench_a~f) + 뒷줄(뜨거운 판 자리는 뺌) · 선반 칸
  const spots = [];
  for (const k of 'abcdef') { const s = stage.slots.get('bench_' + k); if (s) spots.push({ name: 'bench_' + k, kind: 'bench', pos: s.getWorldPosition(new THREE.Vector3()), scr: { x: 0, y: 0 } }); }
  for (const k of 'abcd') { const s = stage.slots.get('bench_' + k); if (s) { const p = s.getWorldPosition(new THREE.Vector3()); p.z = -.2; spots.push({ name: 'bench_' + k + '2', kind: 'bench', pos: p, scr: { x: 0, y: 0 } }); } }
  for (const [n, o] of stage.slots) if (o.userData.kind === 'shelf') spots.push({ name: n, kind: 'shelf', pos: o.getWorldPosition(new THREE.Vector3()), scr: { x: 0, y: 0 } });
  const spotOf = new Map(spots.map(s => [s.name, s]));

  // ── 기구
  const items = new Map();
  for (const id of ids) { const kind = kindOf(id), src = assets.glb[kind]; if (!src || !defs[kind]) continue;
    const it = makeItem(id, defs[kind], assets.meta[kind], src, stage);
    const L = SHELF_LAYOUT[id] || SHELF_LAYOUT[kind] || ['shelf_1_5', 0, 0, 0]; it.home = { slot: L[0], dx: L[1], dz: L[2], yaw: L[3] };
    bridge.glass(it.root);
    // 유리·쇠 재질이 갈아 끼워졌으니 빛낼 재질 목록을 다시 모은다(받침은 빼고)
    it.mats.length = 0; it.model.traverse(o => { if (!o.isMesh) return; for (let p = o; p; p = p.parent) if (it.staySet.has(p)) return; for (const m of [].concat(o.material)) if (m.emissive) { if (!m.userData.em0) m.userData.em0 = m.emissive.clone(); if (!it.mats.includes(m)) it.mats.push(m); } });
    if (defs[kind].thermal) { const par = it.stays.map(s => s.parent); it.stays.forEach(s => s.removeFromParent()); it.frostH = bridge.frost(it.model); it.stays.forEach((s, k) => par[k].add(s)); }
    it.scale = 0; it.fadeTo = 0; it.wob = 0; it.squash = 0; it.dipBlockUntil = 0; it.noClampUntil = 0; it.noClampBy = null; it.clamp = null; it.clampQ = new THREE.Quaternion(); it.clampT = 1;
    it.clampFrom = new THREE.Vector3(); it.clampFromQ = new THREE.Quaternion(); it.emLast = -1; it.trail = null; it.inBowlIdx = 0; it.assist = new THREE.Vector3(); it.assistWant = new THREE.Vector3();
    items.set(id, it); }
  const bowl = items.get('bowl'), dewar = items.get('dewar'), bottle = items.get('bottle'), woodblock = items.get('woodblock');
  const bowlEx = (bowl.meta.extras && bowl.meta.extras.inner) || { rTop: .11, rBot: .06, h: .083 }, bowlInnerE = bowl.E('inner'), bowlH = bowl.meta.size ? bowl.meta.size[1] : .097;
  const innerMesh = bowl.E('inner_volume');
  const vessel = bridge.vessel(innerMesh, bowlEx, innerMesh ? innerMesh.parent : bowl.model, { liquid: 'ln2' });
  const nail = woodblock && woodblock.E('nail_mesh'), nailY0 = nail ? nail.position.y : 0, nailOut = (woodblock && woodblock.meta.extras && woodblock.meta.extras.nail) ? woodblock.meta.extras.nail.out : .05;
  // 깨진 조각 묶음: 원본에 서리를 한 번만 덧대 둔다(복제가 재질을 나눠 쓴다)
  const shardFrost = {}; for (const k in SHARDS) { const src = assets.glb[SHARDS[k][0]]; if (src) { src.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); shardFrost[k] = bridge.frost(src); } }
  const shardSets = [];

  // ── 손(GLB): 0 = 오른손 모델, 1 = 왼손 모델
  const H3 = [assets.glb.hand_r ? makeHand(assets.glb.hand_r) : null, assets.glb.hand_l ? makeHand(assets.glb.hand_l) : null];
  H3.forEach(h => { if (h) scene.add(h.group); });
  const hs = [0, 1].map(() => ({ held: null, prevGrab: false, lostAt: null, strike: makeStrike(), dir0: 0, tiltIn0: 0, hover: null, flowing: false, pourAcc: 0, pourT: 0, pourInto: null, blockGrab: false, po: 1, pp: 0, pg: 0, lean: 0 }));
  const worn = { visor: false, gloves: false };

  // 놓을 자리 그림자 고리
  const ring = new THREE.Mesh(new THREE.RingGeometry(.05, .075, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .4, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.renderOrder = 3; scene.add(ring);

  // ── 화면 글자: 쪽지(지금 할 일 하나) · 말풍선 · 카드 · 노트
  const noteEl = els.note, cards = createCards(els.hud), note = createNote(els.hud, UI);
  note.slots(exp.encyclopedia.map(e => ({ id: e.id, name: e.title })));
  if (els.bodySpot && UI.body) els.bodySpot.textContent = UI.body;
  let noteMain = '', noteSmall = '', notePersist = '', noteSmallLeft = 0;
  function renderNote(){ noteEl.innerHTML = ''; const m = document.createElement('span'); m.className = 'main'; m.textContent = noteMain; noteEl.appendChild(m);
    const s = noteSmall || notePersist; if (s) { const sm = document.createElement('small'); sm.textContent = s; noteEl.appendChild(sm); } noteEl.style.display = noteMain ? '' : 'none';
    noteEl.classList.remove('flip'); void noteEl.offsetWidth; noteEl.classList.add('flip'); }
  function noteSay(text, persist = false){ if (!text) return; if (persist) { notePersist = text; noteSmall = ''; } else { noteSmall = text; noteSmallLeft = 4.5; } renderNote(); }
  function say(text, it, cls = ''){ if (!text) return; let x = .5, y = .45; if (it) { lowOf(it, _low); _a.set(_low.cx, _low.maxY + .04, _low.cz); const p = stage.projectView(_a); x = clamp(p.x, .12, .88); y = clamp(p.y - .06, .14, .8); }
    const d = document.createElement('div'); d.className = 'say ' + cls; d.textContent = text; d.style.left = (x * 100) + '%'; d.style.top = (y * 100) + '%'; els.hud.appendChild(d); setTimeout(() => d.remove(), 2600); }

  // ── 물체 자리·모양 셈
  function lowOf(it, out){ it.root.updateMatrixWorld(true); const m = it.root.matrixWorld, b = it.box; let i = 0;
    const ms = it.model.scale, mp = it.model.position, sc = ms.x !== 1 || ms.y !== 1 || ms.z !== 1;   /* 풍선이 쪼그라들거나 뭉개져 모델 크기가 바뀌면 상자도 그만큼 */
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) { const c = corners[i++]; if (sc) c.set(mp.x + (x - mp.x) * ms.x, mp.y + (y - mp.y) * ms.y, mp.z + (z - mp.z) * ms.z); else c.set(x, y, z); c.applyMatrix4(m); }
    let mnY = 1e9, mxY = -1e9, mnX = 1e9, mxX = -1e9, mnZ = 1e9, mxZ = -1e9; for (const c of corners) { if (c.y < mnY) mnY = c.y; if (c.y > mxY) mxY = c.y; if (c.x < mnX) mnX = c.x; if (c.x > mxX) mxX = c.x; if (c.z < mnZ) mnZ = c.z; if (c.z > mxZ) mxZ = c.z; }
    out.minY = mnY; out.maxY = mxY; out.cx = (mnX + mxX) / 2; out.cy = (mnY + mxY) / 2; out.cz = (mnZ + mxZ) / 2; out.rx = (mxX - mnX) / 2; return out; }
  const emptyWorld = (it, name, out) => { const e = it.E(name); if (!e) return it.root.getWorldPosition(out); return e.getWorldPosition(out); };
  const visible = it => it.root.visible && it.loc !== 'gone' && it.loc !== 'worn' && it.loc !== 'hidden';
  const isSample = it => it.role === 'sample' || it.role === 'special';
  const isPourer = it => it.role === 'ln2source' || it.role === 'warmwater';
  const overBench = (x, z) => x > BR.xMin + .02 && x < BR.xMax - .02 && z > BR.zMin - .05 && z < BR.zMax + .02;
  function slotTaken(name, except){ for (const it of items.values()) if (it !== except && it.slot === name && visible(it)) return true; return false; }
  function freeSlot(it){ it.slot = null; }

  // ── 그릇 정보(매 프레임 한 번)
  const B = { on: false, c: new THREE.Vector3(), bottom: 0, rim: 0, surf: 0, rTop: bowlEx.rTop, surfR: bowlEx.rBot, ln2: 0, fill: 0 };
  function updateBowl(){ B.on = visible(bowl) && bowl.held == null && (bowl.loc === 'bench' || bowl.loc === 'anim'); emptyWorld(bowl, 'base', B.c);
    B.bottom = B.c.y + (bowlInnerE ? bowlInnerE.position.y : .0105); B.rim = B.c.y + bowlH; B.ln2 = V.bowl.ln2; B.fill = V.bowl.fill;
    B.surf = B.fill > .005 ? vessel.surfaceY() : B.bottom; const f = clamp((B.surf - B.bottom) / bowlEx.h, 0, 1); B.surfR = bowlEx.rBot + (bowlEx.rTop - bowlEx.rBot) * f; }

  // ── 움직임: 자리로 사뿐히(anim) · 떨어짐(fall) · 나타남/사라짐(scale)
  function animTo(it, pos, q, dur, arc = 0){ it.anim = { from: it.root.position.clone(), to: pos.clone(), qf: it.root.quaternion.clone(), qt: q.clone(), t: 0, dur, arc }; it.loc = 'anim'; }
  function restAt(it, name, instant = false){ const sp = spotOf.get(name); if (!sp) return goHome(it, instant);
    const where = sp.kind; _a.copy(sp.pos); let yaw = 0; if (name === it.home.slot) { _a.x += it.home.dx; _a.z += it.home.dz; yaw = it.home.yaw; }
    const q = restQuat(it, where, yaw, _q); pivotForRest(it, _a, q, _b); it.slot = name; it.after = where;
    if (instant) { it.root.position.copy(_b); it.root.quaternion.copy(q); it.loc = where; it.anim = null; } else animTo(it, _b, q, where === 'shelf' ? .5 : .18, where === 'shelf' ? .1 : 0); }
  function goHome(it, instant = false){ restAt(it, it.home.slot, instant); }
  function show(it, on){ it.fadeTo = on ? 1 : 0; if (on) { it.root.visible = true; if (it.scale < .02) it.scale = .02; } }

  // ── 그릇 안에 든 것: 바닥에 가라앉아 그릇을 따라간다
  function restInBowl(it){ const n = it.inBowlIdx || 0; lowOf(it, _low); const off = (n % 3) * .028 - .028;
    it.root.position.x += (B.c.x + off) - _low.cx; it.root.position.z += B.c.z - _low.cz; it.root.position.y += (B.bottom + .004) - _low.minY; }

  // ── 빛남: 첫 의뢰에서 다음에 집을 기구 · 막혔을 때 써야 할 장비 · 손이 다가감
  let stepGlow = new Set();
  function setGlow(list){ stepGlow = new Set(list || []); }
  function flash(list){ for (const id of list || []) { const it = items.get(id); if (it) it.flash = 2.2; } }
  const glowCol = new THREE.Color(1, .78, .42);
  // 은은한 빛무리(물체 뒤에 더해 그리는 둥근 빛) — 선반 그늘에서도 「다음에 집을 것」이 보이게
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,236,190,1)'); r.addColorStop(.35, 'rgba(255,214,140,.55)'); r.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  function paintGlow(it, t){ const step = stepGlow.has(it.id) && it.held == null && !it.clampedBy;
    const g = Math.max(step ? .55 + .45 * Math.sin(t * 4.2) : 0, it.flash > 0 ? .5 + .5 * Math.sin(t * 14) : 0, it.hover ? .3 : 0);
    const halo = step || it.flash > 0 ? g : 0;
    if (halo > .01 && !it.halo) { it.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false })); it.halo.renderOrder = 1; scene.add(it.halo); }
    if (it.halo) { it.halo.visible = halo > .01 && it.root.visible && it.loc !== 'worn' && it.loc !== 'gone'; if (it.halo.visible) { lowOf(it, _low2); const s = Math.max(.12, (_low2.maxY - _low2.minY) * 1.5, _low2.rx * 3.2); it.halo.position.set(_low2.cx, _low2.cy, _low2.cz - .06); it.halo.scale.set(s, s, 1); it.halo.material.opacity = .45 + halo * .55; } }
    const gq = Math.round(g * 40) / 40; if (gq === it.emLast) return; it.emLast = gq;
    for (const m of it.mats) { m.emissive.copy(m.userData.em0).lerp(glowCol, gq * .5); if (m.emissiveIntensity !== undefined) m.emissiveIntensity = 1; } }

  // ── 사건 보내기 + 효과 그리기
  let dirty = true, missionOver = false, bookNext = false;
  function send(name, ...args){ const fx = session[name](...args); dirty = true; apply(fx); return fx; }
  function apply(list){ for (const e of list) { try { onFx(e, list); } catch (err) { console.warn('[lab] 효과를 그리다 멈춤', e.type, err); } } }
  const SOUND = { petals: 'crackle', chip: 'crackle', crackle: 'crackle', dent: 'thud', wobble: null, boing: 'boing', thud: 'thud', tap: 'thud', clink: 'clink', clang: 'clang', flop: 'thud', crumble: 'crackle', beads: 'crackle',
    roll: 'thud', same: 'thud', shreds: 'crackle', bubbles: 'warm', warm: 'warm', icecoat: 'crackle', slosh: 'boing', peek: null, bounce: 'boing', place: null, nail: 'thud', squash: 'squash', crush: 'squash', snap: 'crackle', split: 'crackle', cloud: null };
  function onFx(e, batch){
    const it = e.id ? items.get(e.id) : null;
    switch (e.type) {
      case 'mission': { missionOver = false; noteMain = e.note; notePersist = ''; noteSmall = '';
        if (e.pictures && e.pictures.length) notePersist = e.pictures.map(k => (defs[k] || {}).name).filter(Boolean).join(' · ');
        renderNote(); clearShards(); setGlow([]); if (nail) nail.position.y = nailY0; break; }
      case 'freePlay': noteMain = e.note; notePersist = e.text; noteSmall = ''; renderNote(); setGlow([]); break;
      case 'step': setGlow(e.glow); break;
      case 'appear': e.ids.forEach((id, k) => { const o = items.get(id); if (!o) return; goHome(o, true); o.scale = .02; o.appearDelay = k * .08; show(o, true); }); break;
      case 'restock': noteSay(e.text); for (const id of e.ids) { const o = items.get(id); if (o) revive(o); } break;
      case 'gearOff': for (const id of e.ids) { const o = items.get(id); if (!o) continue; worn[id] = false; o.loc = 'shelf'; goHome(o, true); o.scale = .02; show(o, true); } wearVisual(); break;
      case 'wear': if (it) { worn[e.id] = true; it.loc = 'worn'; it.slot = null; show(it, false); audio.wear(); wearVisual(); } break;
      case 'unwear': if (it) { worn[e.id] = false; wearVisual(); } break;
      case 'grab': audio.grab(it ? it.mat : 'glass'); break;
      case 'place': break;
      case 'blocked': if (!e.quiet) { noteSay(e.text); flash(e.glow); audio.clink(); } break;
      case 'accident': note.accident({ text: e.text, real: e.real, rule: e.rule, kind: e.show, first: e.first }); audio.alarm(); if (e.show === 'frost') audio.freeze(); stage.shake(.5); break;
      case 'lose': if (it) loseItem(it); break;
      case 'askPredict': pendingCards = { q: e.q, cards: e.cards, wait: 0 }; break;   /* 붓는 통을 놓은 뒤에 띄운다(아래 update) */
      case 'predicted': audio.ok(); break;
      case 'hint': noteSay(e.text, true); break;
      case 'dip': if (it) { vessel.splash(_a.set(B.c.x, B.surf, B.c.z), 1.3); audio.sizzle(1); bridge.puff(B.c.x, B.surf + .02, B.c.z, 8, .07); } break;
      case 'boilUp': break;
      case 'state': if (it && e.name) say(e.name, it, 'state'); break;
      case 'lift': if (it) { audio.sizzle(.4); if (e.name) say(e.name, it, 'state'); } break;
      case 'frost': break;
      case 'spill': if (!e.splash) noteSay(e.text); else noteSay(e.text); break;
      case 'empty': case 'ln2Low': case 'shallow': case 'ln2Out': case 'refill': case 'demo': noteSay(e.text); break;
      case 'missionFail': if (e.continues === false) noteSay(e.text, true); break;
      case 'discover': note.find(e.id, e.title); audio.discover(); say(e.title, it || items.get(e.item), 'find'); break;
      case 'stamp': break;
      case 'missionDone': missionOver = true; audio.ok(); cards.close(); setGlow([]); break;
      case 'cause': if (batch.some(x => x.type === 'missionDone')) { const delay = batch.some(x => WOW.has(x.type)) ? 2.4 : .6; causeQueue = { text: e.text, left: delay }; } else note.cause(e.text, { sec: 6 }); break;
      case 'note': note.page(e.entry); break;
      case 'whyNot': note.whyAll(e.title, e.lines); break;
      case 'revive': audio.ok(); break;
      case 'cup': audio.warm(); break;
      case 'return': break;
      case 'nailReset': if (nail) nail.position.y = nailY0; break;
      case 'cloudStart': break;
      case 'pop': if (e.big && e.id === 'bottle') { bottlePop(); noteSay(e.text); break; } outcomeFx(e, it); break;
      case 'demoEnd': case 'cap': noteSay(e.text); break;
      case 'unlock': case 'touch': case 'ignored': case 'pour': break;
      default: outcomeFx(e, it);
    }
  }
  let causeQueue = null, pendingCards = null;
  function outcomeFx(e, it){
    if (e.outcome == null && !e.text) return;
    const lv = e.level || 2;
    if (e.type === 'shatter' && it) shatterItem(it, lv);
    else if ((e.type === 'pop' || e.type === 'tear') && it) shatterItem(it, 3);
    else if (it && (e.type === 'squash' || e.type === 'crush' || e.type === 'snap' || e.type === 'split')) { it.squash = .001; audio.squash(); stage.shake(.3); }
    else if (e.type === 'nail') { if (nail) nail.position.y = nailY0 - (e.depth || 0) * nailOut * .92; if (woodblock) woodblock.wob = .6; audio.thud(lv); stage.shake(.12 * lv); }
    else if (e.type === 'cloud') { bridge.cloud(_a.set(B.c.x, B.rim, B.c.z), e.size === 'big' ? 1.5 : .5, bowlEx.rTop); }
    else if (it) it.wob = 1;
    const snd = SOUND[e.type]; if (snd && audio[snd]) audio[snd](lv);
    if (e.text && e.type !== 'cloud') say(e.text, it, e.grade === 'success' ? 'good' : '');
    else if (e.text) say(e.text, null, 'good');
  }

  // ── 깨짐: 통짜를 미리 쪼갠 조각 묶음으로 바꿔 흩뿌린다 + 눈앞 컷 + 느린 동작
  function shatterItem(it, level){
    const S = SHARDS[it.kind]; const src = S && assets.glb[S[0]]; const frame = S ? (S[1] ? it.E(S[1]) : it.model) : null;
    lowOf(it, _low); const point = new THREE.Vector3(_low.cx, _low.maxY, _low.cz);
    if (src && frame) {
      if (shardFrost[it.kind]) shardFrost[it.kind].amount = Math.max(.35, it.frostH ? it.frostH.amount : 0);
      const root = src.clone(true); frame.updateWorldMatrix(true, false); frame.matrixWorld.decompose(root.position, root.quaternion, root.scale); scene.add(root); root.updateMatrixWorld(true);
      const holder = root.children.length === 1 && root.children[0].children.length ? root.children[0] : root;   /* GLB: Scene → 묶음 노드 → 조각들 */
      holder.updateMatrixWorld(true); const shards = holder.children.slice(); const bb = new THREE.Box3(); for (const s of shards) bb.expandByObject(s); bb.getCenter(point); point.y = bb.max.y;
      if (S[1]) frame.visible = false; else it.model.visible = false;
      const h = bridge.shatter(shards, { point, strength: level, benchY, radius: S[2], tint: S[3] }); root.removeFromParent(); shardSets.push(h);
    } else { it.squash = .001; }
    if (WOW.has('shatter')) { stage.closeUp(point, level === 3 ? 2.6 : 2.2); stage.slowMo(.35, .6); }
    stage.shake(.25 + level * .2); if (it.kind === 'balloon') audio.pop(); else audio.shatter(level);
  }
  function clearShards(){ for (const h of shardSets) { try { h && h.clear && h.clear(); } catch (_) {} } shardSets.length = 0; }
  function bottlePop(){ if (!bottle) return; const b = bottle.E('balloon_small'); if (b) b.visible = false; audio.pop(true); stage.shake(1); emptyWorld(bottle, 'spout', _a); stage.closeUp(_a.clone(), 2); stage.slowMo(.35, .5); }
  function loseItem(it){ unhold(it); if (it.clamp) unclampSpec(it.clamp); if (it.clampedBy) { const t = items.get(it.clampedBy); if (t) t.clamp = null; it.clampedBy = null; }
    it.loc = 'gone'; it.slot = null; it.fall = null; it.anim = null; it.fadeDelay = it.squash > 0 ? .7 : (it.model.visible ? .9 : 1.6); if (it.trail) it.trail.rate = 0; }
  function revive(it){ it.model.visible = true; const S = SHARDS[it.kind]; if (S && S[1]) { const f = it.E(S[1]); if (f) f.visible = true; }
    it.squash = 0; it.model.scale.set(1, 1, 1); if (it.frostH) it.frostH.amount = 0; it.loc = 'shelf'; goHome(it, true); it.scale = .02; show(it, true); it.fadeDelay = 0; }
  function unhold(it){ if (it.held == null) return; const st = hs[it.held]; st.held = null; it.held = null; ring.visible = false; stopPour(st); }
  function wearVisual(){ if (els.goggle) els.goggle.classList.toggle('on', !!worn.visor); for (const h of H3) if (h) h.gloves(!!worn.gloves); }

  // ── 집게: 끝에 시료를 물고, 담그고, 꺼내고, 실험대에 내려놓는다
  function clampSpec(tongs, spec){
    tongs.clamp = spec; spec.clampedBy = tongs.id; spec.detachStays(scene); if (spec.loc !== 'bowl') spec.loc = 'tongs'; freeSlot(spec); spec.anim = null; spec.fall = null;
    const tip = spec.E('tip'), flip = FLIP_IN_TONGS.has(spec.kind) && tip; spec.root.updateMatrixWorld(true);
    if (!spec.clampAttach) spec.clampAttach = new THREE.Vector3(); spec.clampFlip = !!flip;
    // 꽃(잎)은 줄기 끝(base)을 물고 꽃을 아래로 매단다 · 나머지는 쥐는 점을 물고 몸통이 아래로
    if (flip) { tip.getWorldPosition(_a); spec.root.worldToLocal(_a); _b.copy(spec.gripLocal).multiplyScalar(-1); spec.clampAttach.copy(_b).lerp(_a, ASSIST.clampStem); _a.sub(spec.clampAttach).applyQuaternion(spec.root.quaternion); _q.copy(spec.root.quaternion); }
    else { spec.clampAttach.set(0, 0, 0); spec.box.getCenter(_a); _q.copy(QI); }
    _b.copy(_a); if (_b.lengthSq() > 1e-4) { _b.normalize(); spec.clampQ.setFromUnitVectors(_b, DOWN); if (flip) spec.clampQ.multiply(_q); } else spec.clampQ.identity();
    spec.clampFrom.copy(spec.root.position); spec.clampFromQ.copy(spec.root.quaternion); spec.clampT = 0; spec.setDownArmed = false; spec.liftedHigh = false; spec.dipTipY = spec.loc === 'bowl' ? emptyWorld(tongs, 'tip', _d).y : null; audio.grab('metal');
  }
  function unclampSpec(spec){ const t = spec.clampedBy ? items.get(spec.clampedBy) : null; if (t) t.clamp = null; spec.clampedBy = null; spec.noClampUntil = stage.now() + ASSIST.clampAgain * 1000; spec.noClampBy = t ? t.id : null; spec.noClampHeld = true; if (t) t.noClampAllUntil = stage.now() + ASSIST.clampAgain * 1000; }
  function followClamp(tongs, dt){ const spec = tongs.clamp; if (!spec) return; emptyWorld(tongs, 'tip', _c);
    if (!spec.clampFlip) { const ms = spec.model.scale, mp = spec.model.position; spec.clampAttach.set(mp.x * (1 - ms.x), mp.y * (1 - ms.y), mp.z * (1 - ms.z)); }   /* 쪼그라든 풍선도 집게 끝에 붙어 있게(모델 크기가 쥐는 점이 아닌 곳을 중심으로 바뀌므로) */ _c.sub(_d.copy(spec.clampAttach).applyQuaternion(spec.clampQ));
    if (spec.clampT < 1) { spec.clampT = Math.min(1, spec.clampT + dt / .2); const k = 1 - Math.pow(1 - spec.clampT, 3); spec.root.position.lerpVectors(spec.clampFrom, _c, k); spec.root.quaternion.slerpQuaternions(spec.clampFromQ, spec.clampQ, k); }
    else { spec.root.position.copy(_c); spec.root.quaternion.copy(spec.clampQ); } }

  // ── 놓을 자리 찾기(화면에서 물체 바닥 가운데와 가장 가까운 빈 자리)
  function nearestSpot(it, benchOnly = false){
    lowOf(it, _low); _a.set(_low.cx, _low.minY, _low.cz); stage.projectTo(_a, _s); let best = null, bd = 1e9;
    for (const sp of spots) { if (benchOnly && sp.kind !== 'bench') continue; const home = sp.name === it.home.slot; if (!home && slotTaken(sp.name, it)) continue;
      stage.projectTo(sp.pos, sp.scr); const d = sdist(_s, sp.scr), r = sp.kind === 'bench' ? SNAP_BENCH : SNAP_SHELF; if (d < r && d < bd) { bd = d; best = sp; } }
    return best; }

  // ── 동작: 집기 · 놓기 · 떨어뜨리기
  function tryGrab(it, i, H){ const st = hs[i];
    if (it === bottle && V.bottle.ln2 > 0) { send('cap', it.id); st.blockGrab = true; return; }
    const fx = send('grab', it.id);
    if (!fx.some(e => e.type === 'grab' && e.id === it.id)) { it.wob = .5; st.blockGrab = true; return; }
    if (it.clampedBy) unclampSpec(it);
    st.held = it; it.held = i; it.loc = 'hand'; freeSlot(it); it.anim = null; it.fall = null; it.detachStays(scene); it.zc = WORK_Z; it.inBowlIdx = 0; it.assist.set(0, 0, 0); it.assistWant.set(0, 0, 0); st.hover = null;
    st.dir0 = H.dir; st.tiltIn0 = H.tiltIn; st.size0 = H.size || 0; st.pullT = 0; st.strike.reset(); st.flowing = false; st.pourAcc = 0; st.pourT = 0; it.angle = 0; }
  function stopPour(st){ if (st.flowing || st.pourAcc > 0) { if (st.pourAcc > 0 && st.held) send('pour', st.held.id, st.pourInto, st.pourAcc); } st.flowing = false; st.pourAcc = 0; st.pourT = 0; bridge.pour.setFlow(_t.set(0, 0, 0), UP, 0); audio.pour(0); }
  function release(it, i, H){ const st = hs[i]; stopPour(st); st.held = null; it.held = null; ring.visible = false;
    const spec = it.clamp;
    if (it.role === 'wear' && inZone(H, BODY_ZONE)) { const fx = send('wear', it.id); if (fx.some(e => e.type === 'wear')) return; }
    lowOf(it, _low);
    if (isSample(it) && B.on && Math.hypot(_low.cx - B.c.x, _low.cz - B.c.z) < B.surfR && _low.minY < B.rim + .05) {
      const fx = send('place', it.id, 'bowl'); if (fx.some(e => (e.type === 'dip' || e.type === 'shallow') && e.id === it.id)) { it.loc = 'bowl'; it.inBowlIdx = 1; return; }
      if (it.loc === 'gone') return; goHome(it); send('place', it.id, it.home.slot); return; }
    const h = _low.minY - benchY;
    if (isSample(it) && overBench(_low.cx, _low.cz) && h > exp.drop.minHeight) { startDrop(it, h); }
    else { const sp = nearestSpot(it); if (sp) { restAt(it, sp.name); send('place', it.id, sp.name); } else { goHome(it); send('place', it.id, it.home.slot); } }
    if (spec) { unclampSpec(spec); if (spec.loc === 'bowl') { spec.inBowlIdx = 1; } else { lowOf(spec, _low2); const hh = _low2.minY - benchY;
      if (overBench(_low2.cx, _low2.cz) && hh > exp.drop.minHeight) startDrop(spec, hh); else setDown(spec); } }
  }
  function setDown(spec){ const sp = nearestSpot(spec, true); if (sp) { restAt(spec, sp.name); send('place', spec.id, sp.name); } else { goHome(spec); send('place', spec.id, spec.home.slot); } }
  function startDrop(it, h){ const fx = session.drop(it.id, h); dirty = true; const out = fx.find(e => e.id === it.id && e.outcome);
    it.fall = { vy: 0, fx, landed: false, rebound: out && out.rebound ? out.rebound : 0, spin: (Math.random() - .5) * 6 }; it.loc = 'fall'; it.slot = null; }
  function stepFall(it, dt){ const f = it.fall; f.vy -= G * dt; it.root.position.y += f.vy * dt; if (!f.landed) it.root.rotateY(f.spin * dt);
    lowOf(it, _low); const ground = overBench(_low.cx, _low.cz) ? benchY : 0;
    if (_low.minY <= ground) { it.root.position.y += ground - _low.minY;
      if (!f.landed) { f.landed = true; apply(f.fx); if (it.loc === 'gone') { it.fall = null; return; } }
      if (f.rebound > .004) { f.vy = Math.sqrt(2 * G * f.rebound); f.rebound *= .4; audio.thud(1); }
      else { it.fall = null; it.loc = 'bench'; const sp = nearestSpot(it, true); if (sp) restAt(it, sp.name); else { const q = restQuat(it, 'bench', 0, _q); _a.set(_low.cx, benchY, clamp(_low.cz, BR.zMin + .05, BR.zMax - .05)); pivotForRest(it, _a, q, _b); animTo(it, _b, q, .2); it.after = 'bench'; } } } }

  // ── 매 프레임: 손 하나
  const cands = [];
  function handStep(i, dt, now){
    const H = input.hands[i], st = hs[i];
    if (st.held) { const it = st.held;
      if (!H.present && H.src === 'cam') {           // 손을 놓침 — 0.4초 머묾 → 제자리로 사뿐히. 깨지지 않는다.
        if (it.role === 'wear' && H.y >= WEAR_LOST_Y) { st.lostAt = null; release(it, i, { ...H, x: Math.min(.79, Math.max(.21, H.x)), y: .9 }); return; }   /* 장비를 들고 내 쪽(화면 아래)으로 당기다 카메라 밖으로 빠짐 = 쓰기 */
        if (st.lostAt == null) st.lostAt = now; stopPour(st); it.angle *= Math.max(0, 1 - dt * 8);
        if (lostAction(now - st.lostAt) === 'return') { st.held = null; it.held = null; ring.visible = false; st.lostAt = null; send('drop', it.id, 0, true); if (it.clamp) { const sp = it.clamp; unclampSpec(sp); if (sp.loc !== 'bowl') { goHome(sp); send('place', sp.id, sp.home.slot); } } goHome(it); send('place', it.id, it.home.slot); }
        return; }
      st.lostAt = null;
      if (it.role === 'wear' && H.src === 'cam' && st.size0 > 0 && H.size > 0 && H.size < st.size0 * ASSIST.wearPull) { st.pullT = (st.pullT || 0) + dt; if (st.pullT >= ASSIST.wearPullT) { st.pullT = 0; st.openT = 0; release(it, i, { ...H, x: Math.min(.79, Math.max(.21, H.x)), y: .9 }); return; } } else st.pullT = 0;   /* 장비를 들고 내 몸 쪽으로 당김(카메라에서 손이 작아짐) = 쓰기 */
      if (it.role === 'wear' && inZone(H, BODY_ZONE)) { st.wearT = (st.wearT || 0) + dt; if (st.wearT >= ASSIST.wearDwell) { st.wearT = 0; st.openT = 0; release(it, i, H); return; } } else st.wearT = 0;   /* 「내 몸」에 가져가 잠깐 머물면 쓴다(손을 안 펴도) */
      // 놓기: 카메라 손은 주먹이 releaseCam 초 넘게 풀려야 놓는다(인식이 한두 장 끊겨도 안 떨어뜨림) · 터치·마우스·자동은 바로
      if (!H.grab) { st.openT = (st.openT || 0) + dt; if (H.src !== 'cam' || st.openT >= ASSIST.releaseCam) { st.openT = 0; release(it, i, H); return; } } else st.openT = 0;
      carry(it, i, H, dt, now); return; }
    st.lostAt = null; const prevHover = st.hover; st.hover = null;
    if (!H.present) { st.prevGrab = false; st.blockGrab = false; st.grabT = 0; return; }
    if (!H.grab) { st.blockGrab = false; st.grabT = 0; } else st.grabT = (st.grabT || 0) + dt;
    // 집을 수 있는 것 중 가장 가까운 것(ASSIST.grab). 밝아진 것은 다른 것이 grabKeep 배 더 가까워야 바뀐다.
    const gR = ASSIST.grab * (H.src === 'cam' ? ASSIST.camGrab : 1); let best = null, bd = gR, keepD = 9;
    for (const it of items.values()) { if (!visible(it) || it.held != null || it.clampedBy || it.fall || it.loc === 'fall' || (it.anim && it.anim.t < .6) || it.scale < .5) continue;
      const gp = (it === bowl && B.on && B.ln2 > 0) ? _a.set(B.c.x, B.rim - .01, B.c.z + bowlEx.rTop) : it.root.position;   /* 질소가 든 그릇은 앞 테두리를 쥔다(가운데는 질소 속) */
      stage.projectTo(gp, _s); const d = sdist(H, _s); if (it === prevHover) keepD = d; if (d < bd) { bd = d; best = it; } }
    if (prevHover && keepD < gR * 1.2 && best !== prevHover && bd * ASSIST.grabKeep > keepD) best = prevHover;
    st.hover = best;
    const fresh = H.grab && !st.prevGrab, late = H.grab && st.grabT < ASSIST.grabLate && !st.lateTried;
    if (fresh) st.lateTried = false;
    if ((fresh || late) && !st.blockGrab) {
      // 빈 손을 질소 속으로: 사고(맨손) 또는 막힘(장갑) — 쥔 그 순간만(늦게 쥐기로는 사고를 내지 않는다)
      if (fresh && B.on && B.ln2 > 0 && (!best || best === bowl) && handInBowl(H)) { send('handIn', 'bowl', null); st.blockGrab = true; }
      else if (best) { st.lateTried = true; tryGrab(best, i, H); }
    }
    st.prevGrab = H.grab;
  }
  function handInBowl(H){ _a.set(B.c.x, B.surf, B.c.z); stage.projectTo(_a, _s); _a.x += B.surfR; stage.projectTo(_a, _s2); const rx = Math.abs(_s2.x - _s.x); return rx > 0 && Math.abs(H.x - _s.x) < rx * .7 && Math.abs(H.y - _s.y) < rx * aspect() * .35; }

  function carry(it, i, H, dt, now){
    const st = hs[i];
    // 그릇 가까이 오면 깊이를 그릇에 맞춘다(손에서는 깊이를 읽지 않는다 — 놓을 자리가 깊이를 정한다)
    let zWant = WORK_Z, nearB = false; if (B.on && it !== bowl) { _a.set(B.c.x, B.rim, B.c.z); stage.projectTo(_a, _s); nearB = sdist(H, _s) < .32; if (nearB) zWant = B.c.z; }
    // 집게에 문 시료를 실험대에 내려놓을 때: 손이 가리키는 상판 자리(문 시료 바닥 높이의 수평면과 시선이 만나는 곳)의 깊이로 → 뒷줄 자리에도 내려놓인다
    if (!nearB && it.kind === 'tongs' && it.clamp && it.clamp.loc !== 'bowl' && it.hang != null && it.specLow < benchY + ASSIST.setDownReach) { const yT = benchY + it.hang + .01; stage.screenToPlane(H.x, H.y, WORK_Z, _a); stage.screenToPlane(H.x, H.y, -.3, _b); const k = (yT - _a.y) / ((_b.y - _a.y) || 1e-6); if (k > 0 && k < 1.5) zWant = clamp(_a.z + (_b.z - _a.z) * k, BR.zMin + .06, BR.zMax - .06); }
    if (it.zc == null) it.zc = WORK_Z; it.zc += (zWant - it.zc) * Math.min(1, dt * 6);
    stage.screenToPlane(H.x, H.y, it.zc, _t);
    // 자석: 지난 프레임에 동작들(집게 물기·그릇 입구·망치 겨누기·붓기)이 정한 끌림으로 부드럽게 따라붙는다
    if (!Number.isFinite(it.assistWant.x + it.assistWant.y + it.assistWant.z)) it.assistWant.set(0, 0, 0); it.assist.lerp(it.assistWant, Math.min(1, dt * ASSIST.pull)); it.assistWant.set(0, 0, 0); _t.add(it.assist);
    it.root.position.lerp(_t, followK(dt, it.weight));
    // 자세: 쥐면 곧게 선다(붓는 통은 손목만큼 기울어짐)
    if (isPourer(it)) pourStep(it, st, H, dt);
    else { it.angle = 0; it.root.quaternion.slerp(it.kind === 'rose' && gloved() ? QFLIP : QI, Math.min(1, dt * 12)); }   /* 장갑 낀 손으로 든 장미는 줄기를 쥐고 꽃을 아래로(담그기 쉽게) */
    // 상판 밑으로 못 들어감
    lowOf(it, _low); if (overBench(_low.cx, _low.cz) && _low.minY < benchY + .001) it.root.position.y += benchY + .001 - _low.minY;
    if (it.kind === 'tongs') tongsStep(it, dt, now);
    else if (isSample(it)) handDipStep(it, now);
    if (it.kind === 'mallet' || (isSample(it) && it.kind !== 'balloon')) strikeStep(it, st, H, now);
    if (it === bowl) { const v = it.prevX == null ? 0 : (it.root.position.x - it.prevX) / Math.max(dt, 1e-3); it.prevX = it.root.position.x; if (Math.abs(v) > .6 && vessel.real) vessel.splash(null, .25); }
    // 놓을 자리 그림자 고리
    const sp = it.role === 'wear' || stage.cut === 'C' || (hs[i].lastTgt && now - hs[i].lastTgtT < 500) ? null : nearestSpot(it); if (sp) { ring.position.set(sp.pos.x, sp.pos.y + .003, sp.pos.z); if (sp.name === it.home.slot) { ring.position.x += it.home.dx; ring.position.z += it.home.dz; } ring.visible = true; } else ring.visible = false;
  }

  // 기울여 붓기: 손목 각도 1:1 (카메라 = 손목 방향, 터치 = 다른 손가락 위아래 끌기·휠, 자동 = tilt)
  function pourStep(it, st, H, dt){
    let raw; if (H.src === 'cam') raw = -wrapDeg(H.dir - st.dir0);   /* 손을 시계 방향으로 돌리면 통도 시계 방향으로(11-18 준호 「손 모양과 다르게 기울어져」) */ else { raw = H.tiltIn - st.tiltIn0; const o = input.hands[1 - st.idx]; if (o && o.present && o.grab && !hs[1 - st.idx].held && o.dragDy) raw += o.dragDy * 260; }
    const want = Math.abs(raw) < 8 ? 0 : clamp(raw, -130, 130);
    it.angle += (want - it.angle) * Math.min(1, dt * 12);
    it.root.quaternion.setFromAxisAngle(AXZ, it.angle * DEG);
    const ln2 = it.role === 'ln2source', a = Math.abs(it.angle), start = ln2 ? V.dewar.pourStartDeg : 30;
    const okSide = ln2 || it.angle > 0;
    if (!st.flowing && a >= start && okSide) st.flowing = true; else if (st.flowing && (a < start - POUR_HYST || !okSide)) st.flowing = false;
    const has = ln2 ? V.dewar.ln2 > 1e-4 : true, flow = st.flowing && has ? clamp((a - (start - POUR_HYST)) / (POUR_FULL - (start - POUR_HYST)), .06, 1) : 0;
    const stopper = it.E('stopper'); if (stopper) stopper.visible = a < 10;
    if (!st.flowing) { if (st.pourAcc > 0) { send('pour', it.id, st.pourInto, st.pourAcc); st.pourAcc = 0; } bridge.pour.setFlow(_t, UP, 0); audio.pour(0); return; }
    // 주둥이 끝(기울어진 쪽 테두리)과 나가는 방향
    it.root.updateMatrixWorld(true); const sgn = it.angle >= 0 ? -1 : 1, th = it.angle * DEG;
    if (ln2) { const sp = it.E('spout'), rim = (it.meta.extras && it.meta.extras.spout && it.meta.extras.spout.rim) || .04; _a.copy(sp ? sp.position : _a.set(0, .42, 0)); _a.x += sgn * rim; _a.applyMatrix4(it.model.matrixWorld); _b.set(-Math.sin(th), Math.min(Math.cos(th), .25), 0).normalize(); }
    else { emptyWorld(it, 'spout', _a); _b.set(-1, .35, 0).applyAxisAngle(AXZ, th); _b.y = Math.min(_b.y, .2); _b.normalize(); }
    bridge.pour.setFlow(_a, _b, flow, ln2 ? 'ln2' : 'water'); audio.pour(flow);
    // 받는 것: 그릇 · 병(질소만) · 실험대 위 시료(물만)
    const sp = .22 + .7 * flow; let into = null;
    const landAt = y => { const vy = _b.y * sp, c = _a.y - y, d = vy * vy + 2 * G * c; if (d <= 0) return null; const t = (vy + Math.sqrt(d)) / G; _d.set(_a.x + _b.x * sp * t, y, _a.z + _b.z * sp * t); return _d; };
    if (B.on) { const p = landAt(Math.max(B.surf, B.bottom)); if (p) { const d = Math.hypot(p.x - B.c.x, p.z - B.c.z); if (d < B.rTop * .95) into = bowl.id;
      if (d < B.rTop * ASSIST.pourPull) { it.assistWant.x = clamp(it.assist.x + (B.c.x - p.x), -ASSIST.pourPullMax, ASSIST.pourPullMax); it.assistWant.z = clamp(it.assist.z + (B.c.z - p.z), -ASSIST.pourPullMax, ASSIST.pourPullMax); } } }   /* 그릇 입구가 줄기를 살짝 끌어당긴다(어린 손을 돕는 자석) */
    if (!into && ln2 && bottle && visible(bottle) && bottle.held == null) { emptyWorld(bottle, 'spout', _c); const p = landAt(_c.y); if (p && Math.hypot(p.x - _c.x, p.z - _c.z) < .04) into = bottle.id; }
    if (!into && !ln2) for (const o of items.values()) { if (!isSample(o) || !visible(o) || o.held != null || o.loc !== 'bench') continue; lowOf(o, _low); const p = landAt(_low.maxY); if (p && Math.hypot(p.x - _low.cx, p.z - _low.cz) < Math.max(.05, _low.rx)) { into = o.id; break; } }
    if (into !== st.pourInto && st.pourAcc > 0) { send('pour', it.id, st.pourInto, st.pourAcc); st.pourAcc = 0; st.pourT = 0; }
    st.pourInto = into; st.pourAcc += flow * (ln2 ? POUR_RATE : WATER_RATE) * dt; st.pourT += dt;
    if (st.pourT >= POUR_SEND) { send('pour', it.id, into, st.pourAcc); st.pourAcc = 0; st.pourT = 0; }
  }

  // 집게 끝(세계 점)에서 시료 몸통까지의 화면 거리: 시료 상자 여덟 꼭짓점을 화면에 비친 네모 밖으로 얼마나 떨어졌나(안이면 0)
  const _r = { x0: 0, y0: 0, x1: 0, y1: 0 };
  function screenRect(it, out){ lowOf(it, _low2); out.x0 = out.y0 = 9; out.x1 = out.y1 = -9; for (const c of corners) { stage.projectTo(c, _s); if (_s.x < out.x0) out.x0 = _s.x; if (_s.x > out.x1) out.x1 = _s.x; if (_s.y < out.y0) out.y0 = _s.y; if (_s.y > out.y1) out.y1 = _s.y; } return out; }
  function clampDist(tipW, spec){ stage.projectTo(tipW, _s2); const tx = _s2.x, ty = _s2.y; screenRect(spec, _r); const dx = Math.max(_r.x0 - tx, 0, tx - _r.x1) * aspect(), dy = Math.max(_r.y0 - ty, 0, ty - _r.y1); return Math.hypot(dx, dy); }
  const clampable = (tongs, o, now) => isSample(o) && visible(o) && o.held == null && !o.clampedBy && !o.fall && o.scale >= .5 && !(o.anim && o.anim.t < .8) && !(o.noClampBy === tongs.id && (o.noClampHeld || now < o.noClampUntil));
  function tongsStep(tongs, dt, now){
    emptyWorld(tongs, 'tip', _c); const tipY = _c.y, handTip = tipY - tongs.assist.y;   /* handTip: 자석이 끌어내린 만큼을 뺀, 아이 손이 정한 높이 */
    if (!tongs.clamp) {                            // 끝이 시료 몸통에 닿으면 문다 · 가까우면 집게 끝이 시료 쪽으로 끌린다
      let best = null, bd = ASSIST.clampPull, bScore = 9, second = 9;
      for (const o of items.values()) { if (o.noClampBy === tongs.id && o.noClampHeld && isSample(o) && visible(o) && clampDist(_c, o) > ASSIST.clamp * 2) o.noClampHeld = false;   /* 끝이 한 번 멀어져야 다시 문다 */
        if (!clampable(tongs, o, now)) continue; lowOf(o, _low2);
        if (Math.abs(_low2.cz - _c.z) < .25 && (_c.y > _low2.maxY + ASSIST.clampAbove || _c.y < _low2.minY - .03)) continue;   /* 실험대 위의 것은 끝이 그 높이에 와야 문다(위로 지나가기만 해서는 안 문다) */
        const d = clampDist(_c, o); if (d >= ASSIST.clampPull) continue; stage.projectTo(o.root.position, _s); const g = sdist(_s2, _s);   /* 몸통까지 거리 + 쥐는 점까지 거리의 반: 큰 풍선 옆의 바나나도 바나나를 문다 */
        const score = d + g * .5; if (score < bScore) { second = bScore; bScore = score; bd = d; best = o; } else if (score < second) second = score; }
      // 지나가기만 해서는 안 문다: 끝이 같은 시료 곁에 clampDwell 초 머물러야 · 막 내려놓은 집게는 clampAgain 초 동안 아무것도 안 문다
      stage.projectTo(_c, _s); const tipSpeed = tongs.prevTipX == null || !(dt > 0) ? 0 : Math.hypot((_s.x - tongs.prevTipX) * aspect(), _s.y - tongs.prevTipY) / dt; tongs.prevTipX = _s.x; tongs.prevTipY = _s.y;
      if (best && bd < ASSIST.clamp && tipSpeed < ASSIST.clampStill && now >= (tongs.noClampAllUntil || 0)) { tongs.dwellT = tongs.dwellOn === best ? (tongs.dwellT || 0) + dt : 0; tongs.dwellOn = best; if (tongs.dwellT >= ASSIST.clampDwell) { tongs.dwellT = 0; tongs.dwellOn = null; clampSpec(tongs, best); tongs.assistWant.set(0, 0, 0); return; } } else { tongs.dwellT = 0; tongs.dwellOn = null; }
      if (best && bScore < second * .6) { lowOf(best, _low2); tongs.assistWant.set(clamp(_low2.cx - _c.x, -ASSIST.clampPullMax, ASSIST.clampPullMax), clamp(_low2.cy - _c.y, -ASSIST.clampPullMax, ASSIST.clampPullMax), 0); }
      return; }
    const spec = tongs.clamp; followClamp(tongs, dt); if (spec.clampT < 1) return;
    lowOf(spec, _low); tongs.hang = tipY - _low.minY; tongs.specLow = _low.minY;
    // 그릇 입구 자석: 문 시료가 그릇 위 가까이(화면) 오면 그릇 가운데로 끌린다 → 깊이·좌우를 정확히 맞추지 않아도 들어간다
    let nearBowl = false;
    if (B.on) { const dxz = Math.hypot(_low.cx - B.c.x, _low.cz - B.c.z);
      if (dxz < B.rTop * ASSIST.bowlPull && _low.minY < B.rim + .25) { nearBowl = true; const m = ASSIST.bowlPullMax; tongs.assistWant.set(clamp(tongs.assist.x + B.c.x - _low.cx, -m, m), 0, clamp(tongs.assist.z + B.c.z - _low.cz, -m, m));
        // 입구 안(테두리 아래)까지 오면 액면 아래로 끌려 들어가고, 손이 낮게 있는 동안은 잠긴 채로 — 깊이를 손으로 정확히 맞추지 않아도 된다
        if (B.ln2 > 0 && now >= spec.dipBlockUntil) { if (spec.loc !== 'bowl' && _low.minY < B.rim + ASSIST.dipPullFrom) tongs.assistWant.y = clamp(tongs.assist.y + (B.surf - ASSIST.dipPullDepth - _low.minY), -ASSIST.dipPullMax, 0);
          else if (spec.loc === 'bowl' && (spec.dipTipY == null ? tipY < B.rim + ASSIST.dipHold : handTip < spec.dipTipY + ASSIST.liftRaise * .5)) tongs.assistWant.y = tongs.assist.y; } } }
    const inside = B.on && Math.hypot(_low.cx - B.c.x, _low.cz - B.c.z) < B.surfR * .95;
    if (inside && _low.minY < B.bottom + .004) { tongs.root.position.y += B.bottom + .004 - _low.minY; followClamp(tongs, 0); lowOf(spec, _low); }
    // 문 시료는 상판을 뚫지 않는다 · 한 번 들어 올려야(상판 위 armLift) 「내려놓기」가 켜진다 → 물자마자 늘어진 꽃이 상판에 닿아 내려놓이는 일 없음
    if (!inside && overBench(_low.cx, _low.cz) && _low.minY < benchY + .002) { tongs.root.position.y += benchY + .002 - _low.minY; followClamp(tongs, 0); lowOf(spec, _low); }
    if (_low.minY > benchY + ASSIST.armLift) spec.setDownArmed = true;
    if (spec.liftedHigh && handTip < spec.dipTipY + .04) spec.liftedHigh = false;
    if (spec.loc !== 'bowl') {
      if (inside && B.ln2 > 0 && _low.minY < B.surf - ASSIST.dipIn && !(spec.liftedHigh && handTip > spec.dipTipY + .04)) {   /* 높이 든 채로는 다시 담그지 않는다(꺼냄·담금이 오가며 깜빡이지 않게) */
        if (now < spec.dipBlockUntil) pushAbove(tongs, spec);
        else { const fx = send('dip', spec.id, 'tongs'); if (fx.some(e => (e.type === 'dip' || e.type === 'shallow') && e.id === spec.id)) { spec.loc = 'bowl'; spec.dipTipY = handTip; } else { spec.dipBlockUntil = now + ASSIST.dipBlock * 1000; pushAbove(tongs, spec); } } }
      else if (!inside && !nearBowl && spec.setDownArmed && overBench(_low.cx, _low.cz) && _low.minY < benchY + ASSIST.setDown) { unclampSpec(spec); setDown(spec); }
    } else if (!inside || _low.minY > B.surf + ASSIST.dipOut || (spec.dipTipY != null && handTip > spec.dipTipY + ASSIST.liftRaise)) { spec.loc = 'tongs'; spec.liftedHigh = _low.minY <= B.surf + ASSIST.dipOut; spec.setDownArmed = true; send('lift', spec.id, 'tongs'); }   /* 큰 시료(풍선)는 집게를 그릇 위로 높이 들면 꺼낸 것 */
  }
  function pushAbove(holder, spec){ lowOf(spec, _low); const want = B.surf + .014; if (_low.minY < want) { holder.root.position.y += want - _low.minY; if (holder.kind === 'tongs') followClamp(holder, 0); } }
  function handDipStep(it, now){
    if (!B.on || !(B.ln2 > 0)) { if (it.handDipped) { it.handDipped = false; send('lift', it.id, 'tongs'); } return; } lowOf(it, _low);
    // 장갑 낀 손(11-18 준호 「장미를 그릇에 놓는 게 너무 어렵다」): 손에 든 채 담그고 꺼낸다 — 실제 시연처럼 줄기를 쥐고 꽃만. 맨손은 아래 옛 길(사고).
    if (gloved()) { const dh = Math.hypot(_low.cx - B.c.x, _low.cz - B.c.z), handLow = _low.minY - it.assist.y;
      if (dh < B.surfR * ASSIST.bowlPull && handLow < B.rim + ASSIST.handDipFrom) {   /* 그릇 입구 위: 가운데로, 그리고 액면 아래로 끌어 줌 */
        it.assistWant.x = clamp(it.assist.x + (B.c.x - _low.cx), -ASSIST.bowlPullMax, ASSIST.bowlPullMax);
        if (now >= (it.dipBlockUntil || 0)) it.assistWant.y = clamp(it.assist.y + (B.surf - ASSIST.dipPullDepth - _low.minY), -ASSIST.dipPullMax - ASSIST.handDipFrom, 0); }
      if (!it.handDipped && dh < B.surfR * .95 && _low.minY < B.surf - ASSIST.dipIn) {
        if (now < (it.dipBlockUntil || 0)) { pushAbove(it, it); return; }
        const fx = send('dip', it.id, 'tongs'); if (fx.some(e => (e.type === 'dip' || e.type === 'shallow') && e.id === it.id)) it.handDipped = true; else { it.dipBlockUntil = now + ASSIST.dipBlock * 1000; pushAbove(it, it); } }
      else if (it.handDipped && (_low.minY > B.surf + ASSIST.dipOut || dh > B.surfR)) { it.handDipped = false; send('lift', it.id, 'tongs'); }
      return; }
    if (Math.hypot(_low.cx - B.c.x, _low.cz - B.c.z) < B.surfR * .9 && _low.minY < B.surf - .012) {
      if (now < it.dipBlockUntil) { pushAbove(it, it); return; }
      const st = hs[it.held], fx = send('dip', it.id, 'hand');
      if (fx.some(e => (e.type === 'dip' || e.type === 'shallow') && e.id === it.id)) { st.held = null; it.held = null; it.loc = 'bowl'; it.inBowlIdx = 1; ring.visible = false; }
      else { it.dipBlockUntil = now + 1200; pushAbove(it, it); } } }

  // 내리치기: 쥔 망치(또는 언 바나나)를 대상 위에서 아래로 휙. 세기 = 최근 150ms 손 속도(톡·탁·쾅)
  function strikeTarget(tool, tip){ let best = null, bd = 1e9;
    const soft = tool.kind !== 'mallet';
    for (const o of items.values()) { if (o === tool || !visible(o) || o.held != null || o.loc === 'shelf' || o.loc === 'fall' || o.anim) continue;
      if (o.clamp === tool || (soft && (o.role === 'tool' || o.role === 'ln2source' || o.role === 'warmwater' || o.role === 'vessel'))) continue;   /* 망치가 아닌 것(언 바나나)으로는 기구를 치지 않는다 */ lowOf(o, _low2); const dx = Math.abs(tip.x - _low2.cx), rx = Math.max(.04, _low2.rx) + ASSIST.strikeAim;
      if (dx < rx && Math.abs(tip.z - _low2.cz) < .25 && tip.y < _low2.maxY + .16 && tip.y > _low2.minY - .03) { const d = dx + Math.max(0, tip.y - _low2.maxY) * .5; if (d < bd) { bd = d; best = o; } } }
    return best; }
  // 겨누기 자석: 실험대 위의 가장 가까운 대상(옆으로 strikePull 안) 위로 망치 머리가 끌린다
  function aimTarget(tool, tip){ let best = null, bd = ASSIST.strikePull;
    for (const o of items.values()) { if (o === tool || !visible(o) || o.held != null || o.loc === 'shelf' || o.loc === 'fall' || o.anim || o.clamp === tool || o === bowl || o.role === 'ln2source' || o.role === 'warmwater' || (tool.kind !== 'mallet' && o.role === 'tool')) continue;
      lowOf(o, _low2); if (tip.y > _low2.maxY + .3 || tip.y < _low2.minY - .03) continue; const d = Math.abs(tip.x - _low2.cx); if (d < bd) { bd = d; best = o; } }
    return best; }
  function strikeStep(tool, st, H, now){
    const tip = tool.E('tip') ? emptyWorld(tool, 'tip', _c) : (lowOf(tool, _low), _c.set(_low.cx, _low.minY, _low.cz));
    const aim = aimTarget(tool, tip); if (aim) { lowOf(aim, _low2); const m = ASSIST.strikePullMax; tool.assistWant.set(clamp(tool.assist.x + _low2.cx - tip.x, -m, m), 0, clamp(tool.assist.z + _low2.cz - tip.z, -m, m)); }
    // 맞는 물체를 뚫고 들어가지 않게
    let tgt = strikeTarget(tool, tip);
    if (tgt) { st.lastTgt = tgt; st.lastTgtT = now; lowOf(tgt, _low2); if (tip.y < _low2.maxY) tool.root.position.y += _low2.maxY - tip.y; }
    const r = st.strike.update(now, H.y); if (!r) return;
    if (!tgt && st.lastTgt && now - st.lastTgtT < ASSIST.strikeKeep * 1000 && visible(st.lastTgt)) tgt = st.lastTgt;   /* 휙 내리는 사이 잠깐 벗어나도 겨누던 대상을 친다 */
    if (tgt) { st.lastTgt = null; send('strike', tgt.id, r.level, tool.id); stage.shake([0, .12, .3, .55][r.level]); if (r.level >= 2) tgt.wob = Math.max(tgt.wob, .5); }
    else if (overBench(tip.x, tip.z) && tip.y < benchY + .05) { audio.thud(r.level); stage.shake(.1 * r.level); }
    else if (tool.kind === 'mallet') audio.whoosh();
  }

  // 감싸기: 두 손이 풍선 둘레에
  let cupId = null, cupT = 0;
  function cupStep(dt){ const A = input.hands[0], Bh = input.hands[1]; let found = null;
    if (A.present && Bh.present) for (const o of items.values()) { if (o.kind !== 'balloon' || !visible(o) || o.clampedBy || o.loc === 'bowl') continue;
      if ((hs[0].held && hs[0].held !== o) || (hs[1].held && hs[1].held !== o)) continue;   /* 터치: 첫 손가락이 풍선을 쥐었어도 둘째 손가락이 오면 감싸기 */
      lowOf(o, _low); _a.set(_low.cx, _low.cy, _low.cz); stage.projectTo(_a, _s); if (sdist(A, _s) < CUP_R && sdist(Bh, _s) < CUP_R) { found = o; break; } }
    if (found) { cupT += dt; if (cupId !== found.id && cupT > CUP_HOLD) { cupId = found.id; send('cup', found.id, true); } }
    else { cupT = 0; if (cupId) { const id = cupId; cupId = null; send('cup', id, false); } } }

  // ── 컷: 손을 선반 높이로 올리면 A, 그릇이 실험대에 오고 손이 내려와 있으면 B — 아이가 카메라를 조작하지 않는다
  let hiT = 0, loT = 0;
  function cutRule(dt){ const cut = stage.cut; if (cut === 'C') return; const P = input.hands.filter(h => h.present);
    if (cut === 'B') { const holding = hs[0].held || hs[1].held; hiT = !holding && P.some(h => h.y < .08) ? hiT + dt : 0;   /* 기구를 든 채로는 A 로 가지 않는다(집게·통을 높이 들어도 실험 컷 그대로) */ if (hiT > .35) { stage.setCut('A'); hiT = 0; } }
    else { const low = P.every(h => h.y > .74), ready = bowl.loc === 'bench' || (bowl.loc === 'anim' && bowl.after === 'bench'); loT = ready && low ? loT + dt : 0; if (loT > .5) { stage.setCut('B'); loT = 0; } } }

  // ── 매 프레임
  let viewT = 0, noHandSince = stage.now(), lastTime = 0;
  const NOHAND = { present: false, x: -1, y: -1 }, freeHands = [NOHAND, NOHAND];
  hs.forEach((s, i) => { s.idx = i; });
  function update(dt, rdt, now){
    const t = now / 1000; lastTime = t;
    input.update(now);
    viewT += dt; if (dirty || viewT > .1) { V = session.view(); viewT = 0; dirty = false; }
    updateBowl();
    for (let i = 0; i < 2; i++) handStep(i, dt, now);
    cupStep(dt);
    // 기구 상태
    for (const it of items.values()) {
      if (it.appearDelay > 0) { it.appearDelay -= dt; } else if (it.scale !== it.fadeTo && !(it.fadeDelay > 0)) { it.scale += (it.fadeTo - it.scale) * Math.min(1, dt * 9); if (Math.abs(it.fadeTo - it.scale) < .01) { it.scale = it.fadeTo; if (it.scale === 0) it.root.visible = false; } }
      if (it.fadeDelay > 0) { it.fadeDelay -= dt; if (it.fadeDelay <= 0) { it.fadeTo = 0; } }
      if (!it.root.visible || it.loc === 'worn' || it.loc === 'gone') { if (it.halo) it.halo.visible = false; if (!it.root.visible) continue; }
      it.root.scale.setScalar(Math.max(.001, it.scale));
      if (it.anim) { const a = it.anim; a.t = Math.min(1, a.t + dt / a.dur); const k = 1 - Math.pow(1 - a.t, 3); it.root.position.lerpVectors(a.from, a.to, k); it.root.position.y += Math.sin(Math.PI * a.t) * a.arc; it.root.quaternion.slerpQuaternions(a.qf, a.qt, k);
        if (a.t >= 1) { it.anim = null; it.loc = it.after || 'bench'; audio.place(it.mat, .6); } }
      else if (it.fall) stepFall(it, dt);
      else if (it.loc === 'bowl' && !it.clampedBy && it.held == null) { if (B.on || bowl.held != null) restInBowl(it); }
      if (it.kind === 'tongs' && it.clamp && it.held == null) followClamp(it, dt);
      // 흔들림·뭉개짐
      if (it.wob > 0) { it.wob = Math.max(0, it.wob - dt * 2.2); it.model.rotation.z = Math.sin(t * 34) * it.wob * .09; } else if (it.model.rotation.z) it.model.rotation.z = 0;
      if (it.squash > 0 && it.squash < 1) { it.squash = Math.min(1, it.squash + dt * 5); const k = it.squash; it.model.scale.set(1 + k * .35, 1 - k * .6, 1 + k * .35); }
      if (it.flash > 0) it.flash -= rdt;
      it.hover = it.held == null && (hs[0].hover === it || hs[1].hover === it) ? 1 : 0;   /* 쥔 것은 밝히지 않는다(쥔 통이 허옇게 바래던 것) */
      paintGlow(it, t);
      // 서리 = view().objects[id].frost (질소 속에서는 0, 꺼내면 핀다)
      const o = V.objects[it.id];
      if (it.frostH && o) { const want = o.frost || 0; it.frostH.amount += (want - it.frostH.amount) * Math.min(1, dt * 2.5);
        const cold = o.Ts != null ? clamp((-o.Ts - 20) / 120, 0, 1) : 0;
        if (cold > .15 && !it.trail && it.loc !== 'bowl') it.trail = bridge.trail(it.root, Math.max(.025, it.box.max.x - it.box.min.x) * .4);
        if (it.trail) it.trail.rate = it.loc === 'bowl' || it.loc === 'gone' ? 0 : cold; }
      if (it.kind === 'balloon' && o && o.volume != null) { const vol = clamp(o.volume, .04, 1), m = it.E('balloon_mesh'); if (m && m.morphTargetDictionary) { const k = m.morphTargetDictionary.shrunk; if (k != null) m.morphTargetInfluences[k] = clamp((1 - vol) / .9, 0, 1); } it.model.scale.setScalar(.72 + .28 * Math.cbrt(vol)); }
    }
    if (bottle) { const bm = bottle.E('balloon_small'); if (bm && bm.morphTargetDictionary && bm.morphTargetDictionary.inflated != null) bm.morphTargetInfluences[bm.morphTargetDictionary.inflated] = clamp(V.bottle.size / exp.bottle.popAt, 0, 1); }
    // 그릇: 액면 = 남은 질소, 끓음 = boil 하나
    vessel.fill += (clamp(V.bowl.fill, 0, 1) - vessel.fill) * Math.min(1, dt * 5);
    const pourIn = hs.some(s => s.flowing && s.pourInto === 'bowl') ? .25 : 0;
    vessel.boil += (clamp(Math.pow(Math.max(0, V.boil) / 1.3, .8) + pourIn, 0, 1) - vessel.boil) * Math.min(1, dt * 4);
    vessel.update(dt);
    audio.boil(V.bowl.ln2 > 0 ? clamp(V.boil / 1.4, 0, 1) : 0);
    apply(session.tick(dt));
    // 손 모델
    for (let i = 0; i < 2; i++) { const h3 = H3[i]; if (!h3) continue; const H = input.hands[i], st = hs[i];
      const vis = (H.present || (st.held && st.lostAt != null)) && stage.cut !== 'C'; h3.group.visible = !!vis; if (!vis) continue;   /* 눈앞 컷에서는 손을 감춘다(일어나는 일을 가리지 않게) */
      if (st.held) { _a.copy(st.held.root.position); _a.z += .015; h3.group.position.lerp(_a, .7); }
      else { stage.screenToPlane(H.x, H.y, WORK_Z + .04, _a); h3.group.position.lerp(_a, H.src === 'cam' ? .55 : 1); }
      const wantO = st.held ? 0 : st.hover ? .25 : (H.grab ? 0 : .9), wantP = st.held ? .15 : st.hover ? .7 : 0, wantG = st.held ? 1 : (H.grab ? .8 : 0), k = Math.min(1, dt * 14);
      st.po += (wantO - st.po) * k; st.pp += (wantP - st.pp) * k; st.pg += (wantG - st.pg) * k; h3.pose(st.po, st.pp, st.pg);
      const lean = (st.held && isPourer(st.held) ? st.held.angle * DEG : 0) + (i ? .1 : -.1); st.lean += (lean - st.lean) * k; h3.group.rotation.set(-.12, 0, st.lean); }
    if (input.hands.some(h => h.present)) noHandSince = now; if (els.askHands) els.askHands(input.mode === 'cam' && now - noHandSince > LOST_ASK_MS);
    // 「내 몸」 자리
    const holdingWear = hs.some(s => s.held && s.held.role === 'wear');
    if (els.bodySpot) { els.bodySpot.classList.toggle('show', holdingWear); els.bodySpot.classList.toggle('hot', holdingWear && input.hands.some(h => h.present && inZone(h, BODY_ZONE))); }
    // 예상 카드: 붓는 통을 쥐고 있는 동안은 미뤘다가, 내려놓고 cardsAfterPour 초 뒤에 띄운다(행동과 다투지 않게)
    if (pendingCards) { const pouring = (hs[0].held && isPourer(hs[0].held)) || (hs[1].held && isPourer(hs[1].held)); pendingCards.wait = pouring ? 0 : pendingCards.wait + rdt;
      if (pendingCards.wait >= ASSIST.cardsAfterPour && !missionOver) { const p = pendingCards; pendingCards = null; cards.show(p.q, p.cards, i => send('predict', i)); } }
    freeHands[0] = hs[0].held && isPourer(hs[0].held) ? NOHAND : input.hands[0]; freeHands[1] = hs[1].held && isPourer(hs[1].held) ? NOHAND : input.hands[1];   /* 붓는 손은 카드를 고르지 않는다 */
    cards.update(rdt, freeHands); note.update(rdt);
    if (noteSmallLeft > 0) { noteSmallLeft -= rdt; if (noteSmallLeft <= 0) { noteSmall = ''; renderNote(); } }
    if (causeQueue) { causeQueue.left -= rdt; if (causeQueue.left <= 0) { const txt = causeQueue.text; causeQueue = null; note.cause(txt, { sec: 6.5, done: openBook }); } }
    bridge.update(dt); bridge.sample(performance.now());
    cutRule(rdt);
  }
  function openBook(){ note.open({ autoClose: Q.has('fast') ? 6 : 9, then: () => { if (session.phase === 'cause') send('next'); } }); }

  // 처음: 선반을 비워 두고(모두 숨김) 첫 의뢰를 연다 → appear 효과가 기구를 선반에 놓는다
  for (const it of items.values()) { goHome(it, true); it.root.visible = false; it.loc = 'hidden'; }
  apply(session.start());
  stage.onTick(update);

  // ── 자동 한 판·확인용 손잡이(화면 비율 좌표를 돌려준다)
  const scr = v => { const p = stage.project(v); return { x: p.x, y: p.y }; };
  const api = {
    session, items, bridge, note, cards, vessel, hs, get view(){ return V; }, get bowlInfo(){ return B; }, exp, spots,
    screenOf(id, part = 'grip'){ const it = items.get(id); if (!it) return null; if (part === 'grip') return scr(it.root.position); if (part === 'low') { lowOf(it, _low); return scr(_a.set(_low.cx, _low.minY, _low.cz)); } if (part === 'top') { lowOf(it, _low); return scr(_a.set(_low.cx, _low.maxY, _low.cz)); } if (part === 'center') { lowOf(it, _low); return scr(_a.set(_low.cx, _low.cy, _low.cz)); } return scr(emptyWorld(it, part, _a)); },
    world(id, part = 'grip'){ const it = items.get(id); if (!it) return null; if (part === 'low' || part === 'top' || part === 'center') { lowOf(it, _low); return new THREE.Vector3(_low.cx, part === 'low' ? _low.minY : part === 'top' ? _low.maxY : _low.cy, _low.cz); } return emptyWorld(it, part, new THREE.Vector3()).clone(); },
    spotScreen(name, dy = 0){ const sp = spotOf.get(name); return sp ? scr(_a.copy(sp.pos).add(_b.set(0, dy, 0))) : null; },
    worldScreen(x, y, z){ return scr(_a.set(x, y, z)); },
    heldBy(i){ return hs[i].held ? hs[i].held.id : null; }, clampOf(id){ const it = items.get(id); return it && it.clamp ? it.clamp.id : null; },
    loc(id){ const it = items.get(id); return it ? it.loc : null; },
    get missionOver(){ return missionOver; }, get causeOn(){ return note.causeOn; }, get bookOpen(){ return note.isOpen; },
    /** 보이는 기구마다 「이름:자리:바닥 높이」 — 공중에 뜬 것을 찾는 데 쓴다 */
    debugItems(){ const out = []; for (const it of items.values()) { if (!visible(it)) continue; lowOf(it, _low); out.push(`${it.id}:${it.loc}${it.anim ? '(anim)' : ''}${it.fall ? '(fall)' : ''}:${_low.minY.toFixed(2)}`); } return out.join(' '); },
    /** 자동 한 판이 기다리다 넘쳤을 때 남기는 한 줄: 컷·쥔 것·집게 끝과 가장 가까운 시료 거리 */
    debugWhy(){ const f = v => v == null ? '-' : (+v).toFixed(3); const H = input.hands[0]; let s = `컷${stage.cut}${stage.camMoving ? '(움직임)' : ''} 손(${f(H.x)},${f(H.y)},${H.grab ? '쥠' : '폄'}${H.present ? '' : ',없음'}) 쥔것:${hs[0].held ? hs[0].held.id : '-'}`;
      const tg = items.get('tongs'); if (tg) { emptyWorld(tg, 'tip', _c); const tp = stage.project(_c); s += ` 집게끝(${f(tp.x)},${f(tp.y)}) 물림:${tg.clamp ? tg.clamp.id : '-'}`;
        let bd = 9, bid = '-'; for (const o of items.values()) { if (!isSample(o) || !visible(o)) continue; const d = clampDist(_c, o); if (d < bd) { bd = d; bid = o.id + ':' + o.loc; } } s += ` 가까운시료:${bid}@${f(bd)}`; }
      if (tg && tg.clamp) { const sp = tg.clamp; lowOf(sp, _low); s += ` 시료바닥${f(_low.minY)} 액면${f(B.surf)} 테두리${f(B.rim)} 가로거리${f(Math.hypot(_low.cx - B.c.x, _low.cz - B.c.z))}/${f(B.surfR)} 막힘${sp.dipBlockUntil > stage.now() ? 'Y' : 'N'} 높이꺼냄${sp.liftedHigh ? 'Y' : 'N'} 끌림${f(tg.assist.x)},${f(tg.assist.z)} zc${f(tg.zc)}`; }
      s += ` 그릇:${B.on ? 'on' : 'off'}(${f(B.c.x)},${f(B.c.z)}) 채움${f(V.bowl.fill)} 예상:${V.mission ? V.mission.predicted : '-'} 단계:${V.phase}`; return s; },
  };
  return api;
}
