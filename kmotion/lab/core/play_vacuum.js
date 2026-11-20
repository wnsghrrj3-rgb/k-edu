// 케이모션 과학실 — 실험 2 「공기를 빼면」(진공 종) 그림 판 놀이: 구운 방 + 기구(GLB 또는 대신 모형) + 손 모델 + 실험 논리(session_vacuum) + 효과 + 소리
// 화면은 결과를 스스로 정하지 않는다: 손 동작을 「뜻이 있는 사건」으로 바꿔 session 에 보내고, 돌아온 효과 목록과 session.view() 만 그린다.
// 영하 196도에서 배운 것(11-18 준호 「장미가 그릇에 안 담겨」「손 잡는 게 너무 예민」): 정밀하게 겨누는 동작을 만들지 않는다.
//   가까이 가져가면 붙고(놓거나 잠깐 머물면), 펌프는 손잡이를 쥐고 위아래 크게, 밸브는 쥐고 있으면 천천히 열린다.
// 매 프레임 도는 곳에서는 새 물체를 만들지 않는다(_ 로 시작하는 임시 그릇을 다시 쓴다).
import * as THREE from 'three';
import { createSession } from '../sim/session_vacuum.js';
import { makeItem, restQuat, pivotForRest, makeHand, loadPropAssets } from './items.js';
import { loadVacuumAssets, partOf } from './vac_items.js';
import { createFxBridge } from './fxbridge.js';
import { createCards } from './cards.js?v=4';
import { createNote } from './note.js?v=2';
import { createVacSound } from './vac_sound.js';
import { makePumpStroke, followK, lostAction, LOST_ASK_MS, clamp } from './hands.js?v=2';

const DEG = Math.PI / 180;

// ── 손 도움(ASSIST): 아이 손·카메라 떨림·터치·마우스를 너그럽게 받는 숫자는 전부 여기. 실기기에서 해 보고 여기만 고친다.
//    단위: 「화면」 = 화면 높이에 대한 비율, s = 초, m = 미터.
//    지키는 것: 버튼이 손 동작을 대신하지 않는다 · 손을 놓쳐도 아무것도 깨지지 않는다 · 겨눌 일이 없다(가까이 = 붙음).
export const ASSIST = {
  grab: .12,          // 집기: 손에서 이 반경(화면) 안의 가장 가까운 기구가 밝아지고, 쥐면 잡힌다
  camGrab: 1.2,       // 카메라 손은 집기 반경을 이 배로(영하 196도와 같은 값 — 1.4 는 지나가다 엉뚱한 것을 집었음)
  grabKeep: 1.4,      // 밝아진 것은 다른 것이 이 배 더 가까워야 바뀐다(두 기구 사이에서 깜빡이지 않게)
  grabLate: .35,      // 손을 먼저 쥐고 다가와도 이 시간(s) 안에 반경에 들면 잡는다
  releaseCam: .14,    // 카메라 손: 이 시간(s) 넘게 펴져야 놓는다(쥔 손 인식이 한두 장 끊겨도 안 떨어뜨림)
  pumpGrab: .2,       // 펌프 손잡이 집기 반경(화면) — 크게. 쥐고 있는 동안은 손이 옆으로 흘러가도 놓치지 않는다
  pumpGain: 1,        // 손 높이 → 손잡이 높이(1 = 1:1). 손잡이 끝까지 = 화면 높이의 약 20%
  pumpFollow: 25,     // 손잡이가 손을 따라가는 빠르기(1/s)
  pumpMinAmp: .15,    // 한 번으로 세는 가장 작은 왕복(손잡이 길이의 비율)
  pumpFull: .7,       // 이만큼(손잡이 길이의 비율) 내려 누르면 세기 1
  pumpFall: .8,       // 놓은 손잡이가 바닥으로 내려가는 빠르기(손잡이 길이/s)
  valveGrab: .13,     // 밸브 손잡이 집기 반경(화면)
  valveRate: .35,     // 쥐고 있는 동안 열리는 빠르기(1/s) — 3초쯤이면 다 열림
  valveClose: 2.5,    // 반 넘게 열린 밸브를 쥐면 이 빠르기(1/s)로 잠근다
  valveSend: .04,     // 열림이 이만큼 바뀔 때마다 session 에 보낸다
  yankSpeed: 1.8,     // 쥔 채 손이 이 빠르기(화면/s, yankWin 동안 평균) 넘게 휙 → 확 열기(공기가 한꺼번에)
  yankWin: .12,       // s
  yankArm: .2,        // 쥐고 이 시간(s) 뒤부터 휙을 본다(다가오며 쥐는 움직임을 휙으로 읽지 않게)
  bellGrab: .15,      // 받침판 위 종 손잡이 집기 반경(화면)
  bellRise: .05,      // 종 손잡이를 쥐고 손을 이만큼(화면) 올리면 「들어 올림」
  plateSnap: .2,      // 든 시료·종의 바닥이 받침판 가운데에서 이 거리(화면) 안이면 받침판에 놓인다(놓거나 머물면)
  hoverSnap: .5,      // …그 안에 이 시간(s) 머물면 손을 펴지 않아도 놓인다
  shieldSnap: .24,    // 방호판을 받침판 앞자리에서 이 거리(화면) 안에 놓거나 머물면 그 자리에 선다
  snapBench: .22,     // 실험대 자리 찾는 반경(화면)
  snapShelf: .16,     // 선반 칸 찾는 반경(화면)
  cardsAfter: .4,     // 예상 카드는 손이 기구를 놓고 이 시간(s) 뒤에 뜬다
  cardsGrace: 1,      // 카드가 뜨고 이 시간(s) 동안은 테두리가 차오르지 않는다(종을 덮던 손이 가운데 카드 밑에 그대로 있어 저절로 골라지지 않게). 손이 한 번(6%) 움직여야 하는 것은 cards.js 그대로
  plateGap: .06,      // 받침판 위 둘·셋: 가운데에서 좌우로 이만큼(m) 벌려 놓는다(촛불과 흡착판이 겹치지 않게)
  tubeStill: .6,      // 낙하 통: 든 손이 이보다 느리게(화면/s, 카메라 떨림 ±1.5% 는 0.4 쯤) …
  tubeHold: .8,       // …이 시간(s) 가만히 있으면 저절로 뒤집혀 깃털과 쇠구슬이 떨어진다(휙 내리치는 정밀한 동작 대신)
  tubeMove: 1,        // 한 번 뒤집은 뒤에는 손이 이보다 빠르게(화면/s) 한 번 움직여야 다시 뒤집힌다
  retryDwell: 1,      // 「다시 차리기」 단추: 카메라 손을 이 시간(s) 대고 있으면 눌린다(터치·마우스는 바로)
  retryAfter: .6,     // 엎어짐·쏟아짐·실패가 생기고 이 시간(s) 뒤에 단추가 나온다
  smallItem: .16,     // 이보다 작은(가장 긴 변, m) 것을 들면 손이 작아지고 비켜서 반투명해진다(든 것이 보이게)
  handFade: .4,       // …그때 손 불투명도
  handShrink: .78,    // …그때 손 크기
  cutUp: .1, cutUpT: .3,      // 손을 화면 위 이 높이보다 올려 이 시간(s) → 컷 A(선반)
  cutDown: .72, cutDownT: .45, // 손이 모두 이 높이보다 아래로 이 시간(s) → 컷 B(실험대)
};

// 실험대 배치(m, 실험대 위). 받침판 가운데 · 펌프 왼쪽(호스로 이어짐) · 방호판은 오른쪽 끝에 옆으로 세워 둠
const LAYOUT = { plate: [.02, -.06, 0, 1], pump: [-.42, -.2, .25, .8], shieldPark: [.8, -.3, -.9], shieldFront: [.02, .22, 0] };
const BENCH_SPOTS = [['bench_L1', -.68, .02], ['bench_F1', -.40, .2], ['bench_R1', .40, .10], ['bench_F2', .42, .22]];
// 받침판 위 자리: 몇 개 놓였나에 따라 다시 벌려 놓는다(1 = 가운데 · 2 = 좌우 · 3 = 좌우 + 앞). 단위 = ASSIST.plateGap 배
const PLATE_LAYOUT = { 0: [], 1: [[0, 0]], 2: [[-1, 0], [1.08, 0]], 3: [[-1.08, .45], [1.08, .45], [0, -.9]] };   // 셋이면 가장 큰 것(부푸는 풍선 등)이 뒤로
const PLATE_YAW = { suction: Math.PI / 2, candle: Math.PI / 2 };   // 흡착판 받침은 옆으로 길다 → 앞뒤로 돌려 놓는다
// 선반 칸 [칸, 좌우, 앞뒤, 돌림] — 맨 아래 단(컷 B 에서도 보임)에 첫 의뢰 것과 종 둘, 둘째 단에 ②·③ 것, 위 단에 자유 실험
const SHELF = { bell: ['shelf_3_3', 0, 0, 0], bell_cracked: ['shelf_3_2', 0, 0, .4], marshmallow: ['shelf_3_4', 0, 0, 0], balloon_s: ['shelf_3_5', 0, 0, 0], droptube: ['shelf_3_1', 0, 0, 0],
  clock: ['shelf_2_3', 0, 0, .25], candle: ['shelf_2_4', 0, 0, 0], suction: ['shelf_2_5', 0, 0, -.2], beaker_water: ['shelf_2_1', 0, 0, 0], foam: ['shelf_2_2', 0, 0, 0],
  chips: ['shelf_1_2', 0, 0, .3], sponge: ['shelf_1_3', 0, 0, 0] };
const WEIGHT = { bell: 1.3, bell_cracked: 1.3, shield: 1.6, beaker_water: 1.1 };
// 부풂(view().objects[id].size) → 보이는 크기. grow = 모양 키, lin = 가로 배율, liny = 세로 배율
const VIS = {
  marshmallow: { mesh: 'marsh', grow: 'puffed', shrink: 'shrunk', lin: s => s },
  balloon_s: { mesh: 'balloon', grow: 'inflated', lin: s => 1 + Math.max(0, s - 1) / .8 * 2.1 },           // 1.8 = 종 벽에 닿음
  foam: { mesh: 'blob', grow: 'puffed', lin: s => 1 + Math.max(0, s - 1) / 5 * 1.55, liny: s => 1 + Math.max(0, s - 1) / 5 * 4.2, low: s => Math.max(.4, s) },
  chips: { mesh: 'bag', grow: 'puffed', lin: s => 1 + Math.max(0, s - 1) * .15 },
  sponge: { mesh: 'sponge_body', grow: 'foamy', lin: s => s },
};
const BIG_FX = new Set(['marshDouble', 'clockSilent', 'waterBoil', 'balloonWall', 'foamFill', 'crackBurst', 'chipsBurst', 'dropTogether']);

export async function createPlay({ stage, input, audio, els, mode, Q }){
  const scene = stage.scene;
  const exp = await (await fetch('./exp/vacuum/exp.json', { cache: 'no-cache' })).json();
  const TX = exp.texts, UI = TX.ui || {}, defs = {}; for (const d of exp.items) defs[d.id] = d;
  const session = createSession(exp);
  let V = session.view();
  const ids = Object.keys(V.objects);
  const [VA, HA, bridge] = await Promise.all([loadVacuumAssets(ids), loadPropAssets(['hand_r', 'hand_l']), createFxBridge(stage, { off: Q.has('nofx') })]);
  const benchY = stage.BENCH_Y, BR = stage.benchRect || { xMin: -1.31, xMax: 1.05, zMin: -.39, zMax: .39 }, WORK_Z = stage.WORK_Z;
  const sound = createVacSound(audio);

  // 컷 B(이 실험): 받침판·종·펌프 손잡이 꼭대기까지 한눈에, 뒤로 맨 아래 선반
  stage.defineCut('B', [0, 1.36, .85], [-.05, 1.0, -.3], 48); stage.setCut('B', .01);
  { const sun = stage.sun, sc = sun.shadow.camera; sc.left = -2.3; sc.right = 2.3; sc.top = 2.3; sc.bottom = -1.7; sc.near = .5; sc.far = 12; sc.updateProjectionMatrix();
    const want = bridge.tier === 'high' ? 2048 : 1024; if (sun.shadow.mapSize.x !== want) { sun.shadow.mapSize.set(want, want); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } } sun.shadow.bias = -.0004; sun.shadow.normalBias = .015; }

  // ── 임시 그릇
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _q = new THREE.Quaternion(), _box = new THREE.Box3();
  const _s = { x: 0, y: 0, z: 0 }, _s2 = { x: 0, y: 0, z: 0 }, _low = { minY: 0, maxY: 0, cx: 0, cy: 0, cz: 0, rx: 0 };
  const corners = Array.from({ length: 8 }, () => new THREE.Vector3()), UP = new THREE.Vector3(0, 1, 0), AXZ = new THREE.Vector3(0, 0, 1);
  const aspect = () => stage.camera.aspect, sdist = (a, b) => Math.hypot((a.x - b.x) * aspect(), a.y - b.y);

  // ── 유리: 두꺼운 유리(종), 나머지는 기본 등급 유리
  function glassUp(root, thick){ try { if (thick && bridge.fx && bridge.fx.glass) { bridge.fx.glass.applyToObject(root, bridge.tier, { glass: { thickness: .014, attenuationDistance: .3, tint: 0xdcefe6, rim: .62, clear: .025, rimPower: 2.2 } }); return; } } catch (e) { console.warn('[lab vac] 두꺼운 유리 못 입힘', e); } bridge.glass(root); }

  // ── 고정 기구: 받침판·펌프(+ 호스)
  function fixture(id, L){ const g = new THREE.Group(); g.name = 'fix_' + id; const m = VA.glb[id].clone(true); m.traverse(o => { if (o.isMesh) { o.material = Array.isArray(o.material) ? o.material.map(x => x.clone()) : o.material.clone(); o.castShadow = true; o.receiveShadow = true; } });
    g.add(m); g.position.set(L[0], benchY, L[1]); g.rotation.y = L[2]; g.scale.setScalar(L[3] || 1); g.visible = false; scene.add(g); glassUp(g, false); g.updateMatrixWorld(true); return { id, root: g, model: m, E: n => m.getObjectByName(n) }; }
  const plate = fixture('plate', LAYOUT.plate), pump = fixture('pump', LAYOUT.pump);
  const needle = partOf(plate.model, 'needle'), knob = partOf(plate.model, 'valve_knob', [-.164, .048, .087]), seatE = partOf(plate.model, 'seat', [0, .03, 0]), bellSeatE = partOf(plate.model, 'bell_seat', [0, .034, 0]);
  const NX = Object.assign({ angleMin: -135, angleMax: 135 }, needle.userData || {}), KX = Object.assign({ turn: 180 }, knob.userData || {}), knobY0 = knob.rotation.y;
  const handle = partOf(pump.model, 'handle'), HX = Object.assign({ travel: .3 }, handle.userData || {}), handleY0 = handle.position.y;
  const gripA = partOf(handle, 'grip', [.085, .537, 0]), gripB = partOf(handle, 'grip_l', [-.085, .537, 0]);
  let hose = null;
  { const pa = partOf(pump.model, 'hose_port', [.13, .009, .181]).getWorldPosition(new THREE.Vector3()), pb = partOf(plate.model, 'hose_port', [-.13, .039, -.167]).getWorldPosition(new THREE.Vector3());
    const mid = pa.clone().lerp(pb, .5); mid.y = benchY + .006; const c = new THREE.CatmullRomCurve3([pa, pa.clone().lerp(mid, .5).setY(benchY + .01), mid, pb.clone().lerp(mid, .5).setY(benchY + .012), pb]);
    hose = new THREE.Mesh(new THREE.TubeGeometry(c, 40, .0065, 8, false), new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: .55 })); hose.castShadow = true; hose.visible = false; scene.add(hose); }

  // ── 자리: 실험대(앞뒤 두 줄) · 선반 칸 · 받침판 자리 셋 · 방호판(세워 둔 자리 / 받침판 앞)
  const spots = [];
  const addSpot = (name, kind, x, y, z) => { const s = { name, kind, pos: new THREE.Vector3(x, y, z), scr: { x: 0, y: 0, z: 0 } }; spots.push(s); return s; };
  for (const [n, x, z] of BENCH_SPOTS) addSpot(n, 'bench', x, benchY, z);
  for (const [n, o] of stage.slots) if (o.userData.kind === 'shelf') { o.getWorldPosition(_a); addSpot(n, 'shelf', _a.x, _a.y, _a.z); }
  plate.root.updateMatrixWorld(true); seatE.getWorldPosition(_a);
  const seat0 = _a.clone(), seatSpots = [0, 1, 2].map(k => addSpot('plate_' + k, 'plate', _a.x, _a.y, _a.z));
  let plateCount = 0;
  const bellSeat = bellSeatE.getWorldPosition(new THREE.Vector3());
  const parkSpot = addSpot('shield_park', 'park', LAYOUT.shieldPark[0], benchY, LAYOUT.shieldPark[1]), frontSpot = addSpot('shield_front', 'front', LAYOUT.shieldFront[0], benchY, LAYOUT.shieldFront[1]);
  const spotOf = new Map(spots.map(s => [s.name, s]));

  // ── 옮길 수 있는 기구(시료·종·방호판)
  const items = new Map();
  for (const id of ids) { const d = defs[id]; if (!d || d.role === 'fixture') continue;
    const it = makeItem(id, { id, role: d.role, weight: WEIGHT[id] || .8, mat: d.role === 'bell' || d.role === 'shield' ? 'glass' : 'plastic' }, VA.meta[id], VA.glb[id], stage);
    const L = SHELF[id]; it.home = id === 'shield' ? { slot: 'shield_park', dx: 0, dz: 0, yaw: LAYOUT.shieldPark[2] } : { slot: L ? L[0] : 'shelf_1_5', dx: L ? L[1] : 0, dz: L ? L[2] : 0, yaw: L ? L[3] : 0 };
    it.model.traverse(o => { if (o.isMesh && o.material && /^glass_crack/.test(o.material.name || '')) { o.material.name = o.material.name.replace(/^glass_/, 'mark_'); o.renderOrder = 4; } });   /* 금은 유리로 바꾸지 않는다(하얀 금이 보여야) */
    glassUp(it.root, d.role === 'bell');
    it.mats.length = 0; it.model.traverse(o => { if (!o.isMesh) return; for (const m of [].concat(o.material)) if (m.emissive) { if (!m.userData.em0) m.userData.em0 = m.emissive.clone(); if (!it.mats.includes(m)) it.mats.push(m); } });
    { const sz = it.box.getSize(new THREE.Vector3()); it.maxDim = Math.max(sz.x, sz.y, sz.z); }
    it.scale = 0; it.fadeTo = 0; it.wob = 0; it.flash = 0; it.emLast = -1; it.tilt = 0; it.zc = WORK_Z; it.slipT = 0;
    items.set(id, it); }
  const placeholders = [...VA.placeholder];
  if (placeholders.length) console.info('[lab vac] 대신 모형으로 선 기구:', placeholders.join(', '));

  // 시료마다 보이는 것(모양 키 크기 재기·자명종 망치·물·촛불·흡착판)
  const morphRatio = (mesh, idx) => { const g = mesh.geometry, p = g.attributes.position, ma = g.morphAttributes.position && g.morphAttributes.position[idx]; if (!p || !ma) return 1;
    const b0 = new THREE.Box3(), b1 = new THREE.Box3(), v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); b0.expandByPoint(v); if (g.morphTargetsRelative) { v.x += ma.getX(i); v.y += ma.getY(i); v.z += ma.getZ(i); } else v.fromBufferAttribute(ma, i); b1.expandByPoint(v); }
    const s0 = b0.getSize(new THREE.Vector3()), s1 = b1.getSize(v); return Math.max(s1.x / Math.max(1e-6, s0.x), s1.y / Math.max(1e-6, s0.y), s1.z / Math.max(1e-6, s0.z)); };
  const morphBox = (mesh, idx) => { const g = mesh.geometry, p = g.attributes.position, ma = idx >= 0 && g.morphAttributes.position ? g.morphAttributes.position[idx] : null, b = new THREE.Box3(), v = new THREE.Vector3(); if (!p) return null;
    for (let i = 0; i < p.count; i++) { if (ma && !g.morphTargetsRelative) v.fromBufferAttribute(ma, i); else { v.fromBufferAttribute(p, i); if (ma) { v.x += ma.getX(i); v.y += ma.getY(i); v.z += ma.getZ(i); } } b.expandByPoint(v); } return b; };
  for (const [id, it] of items) { const vis = VIS[id]; if (!vis) continue; const node = it.E(vis.mesh); if (!node) continue; let mesh = null; node.traverse(o => { if (!mesh && o.isMesh) mesh = o; });
    const dict = mesh && mesh.morphTargetDictionary, gi = dict && dict[vis.grow] != null ? dict[vis.grow] : -1, si = dict && vis.shrink && dict[vis.shrink] != null ? dict[vis.shrink] : -1;
    let minY = 0; if (mesh) { mesh.geometry.computeBoundingBox(); minY = mesh.geometry.boundingBox.min.y; }
    it.vis = { node, mesh, gi, si, gr: gi >= 0 ? morphRatio(mesh, gi) : 1, sr: si >= 0 ? morphRatio(mesh, si) : 1, y0: node.position.y, minY, shown: 1 };
    if (mesh) { it.vis.b0 = morphBox(mesh, -1); it.vis.bg = gi >= 0 ? morphBox(mesh, gi) : null; it.vis.bs = si >= 0 ? morphBox(mesh, si) : null; } }
  const clock = items.get('clock'), hammer = clock && clock.E('hammer'), hammerX = Object.assign({ amp: 14 }, (hammer && hammer.userData) || {});
  const beaker = items.get('beaker_water'), candle = items.get('candle'), suction = items.get('suction'), bellCr = items.get('bell_cracked'), shieldIt = items.get('shield'), droptube = items.get('droptube');
  let vessel = null, thermo = null, waterFill = .8;
  if (beaker) { const inner = beaker.E('inner_volume'); let ex = (beaker.meta.extras && beaker.meta.extras.inner && beaker.meta.extras.inner.rTop) ? beaker.meta.extras.inner : null;
    if (!ex && inner && inner.geometry) { inner.geometry.computeBoundingBox(); const bb = inner.geometry.boundingBox; ex = { rTop: (bb.max.x - bb.min.x) / 2, rBot: (bb.max.x - bb.min.x) / 2 * .97, h: bb.max.y - bb.min.y }; }
    waterFill = (ex && ex.fill) || .8;
    if (inner && ex) { try { vessel = bridge.vessel(inner, ex, inner.parent, { liquid: 'water' }); vessel.fill = waterFill; } catch (e) { console.warn('[lab vac] 물 효과 못 올림', e); vessel = null; } }
    thermo = beaker.E('thermo_column'); }
  const flameE = candle && partOf(candle.model, 'flame', [0, .066, 0]);
  const cupE = suction && suction.E('cup'), weightE = suction && suction.E('weight'), dropDist = (weightE && weightE.userData && weightE.userData.drop) || .0835, cupY0 = cupE ? cupE.position.y : 0, weightY0 = weightE ? weightE.position.y : 0;
  const crackBig = bellCr && bellCr.E('crack_big'), crackSmall = bellCr && (bellCr.E('crack') || bellCr.E('crack_fine'));
  // 촛불: 더해 그리는 작은 불꽃 둘(겉 주황 + 속 흰빛) · 연기: 미리 만든 회색 판 열둘이 위로 오르며 퍼진다
  const glowTex = (inner, outer) => { const c = document.createElement('canvas'); c.width = 32; c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(16, 40, 0, 16, 40, 26); r.addColorStop(0, inner); r.addColorStop(.45, outer); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,250,220,1)', 'rgba(255,150,40,.7)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); flame.visible = false; flame.renderOrder = 5; scene.add(flame);
  const smokeTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(235,235,240,.8)'); r.addColorStop(.5, 'rgba(215,215,222,.35)'); r.addColorStop(1, 'rgba(200,200,205,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const smoke = Array.from({ length: 12 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; s.userData = { life: 0, vx: 0 }; scene.add(s); return s; });
  let smokeLeft = 0;
  // 금 간 종이 터질 때의 조각(미리 만들어 둠)
  // 조각 14개: 두께 6mm 로 밀어낸 굽은 유리 조각(가장자리가 초록빛으로 빛나는 두꺼운 유리) — 수가 적고 커서 보인다
  const shardGroup = new THREE.Group(); const shardMat = new THREE.MeshPhysicalMaterial({ color: 0xcfeee0, roughness: .05, metalness: 0, transparent: true, opacity: .5, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: .05 });
  const shardEdge = new THREE.LineBasicMaterial({ color: 0xbff5da, transparent: true, opacity: .8 });
  { let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283 + rnd() * .3, y = .03 + rnd() * .24, w = .05 + rnd() * .045, hh = .05 + rnd() * .05;
      const sh = new THREE.Shape(); sh.moveTo(-w / 2, -hh / 2); sh.lineTo(w / 2 * (.6 + rnd() * .4), -hh / 2 * (.5 + rnd() * .5)); sh.lineTo(w / 2, hh / 2 * rnd()); sh.lineTo((rnd() - .5) * w * .6, hh / 2); sh.lineTo(-w / 2 * (.7 + rnd() * .3), hh / 2 * (rnd() - .3)); sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, { depth: .006, bevelEnabled: false }); g.translate(0, 0, -.003); g.computeVertexNormals();
      const m = new THREE.Mesh(g, shardMat); m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), shardEdge)); m.position.set(Math.sin(a) * .124, y, Math.cos(a) * .124); m.rotation.y = a; m.castShadow = true; shardGroup.add(m); } }
  const shardSets = [];

  // ── 손(GLB)
  const H3 = [HA.glb.hand_r ? makeHand(HA.glb.hand_r) : null, HA.glb.hand_l ? makeHand(HA.glb.hand_l) : null]; H3.forEach(h => { if (!h) return; scene.add(h.group); h.mats = []; h.model.traverse(o => { if (o.isMesh) for (const m of [].concat(o.material)) if (!h.mats.includes(m)) h.mats.push(m); }); h.fade = 1; h.size = 1; });
  // 작은 것을 든 손: 작아지고, 위·앞으로 비켜서고, 반투명 → 든 것이 가려지지 않는다(쥐는 느낌·판정은 그대로)
  function handLook(h3, fade, size, dt){ const k = Math.min(1, dt * 10); h3.fade += (fade - h3.fade) * k; h3.size += (size - h3.size) * k; h3.group.scale.setScalar(h3.size);
    const f = h3.fade > .985 ? 1 : h3.fade, tr = f < 1; for (const m of h3.mats) { if (m.transparent !== tr) { m.transparent = tr; m.depthWrite = !tr; m.needsUpdate = true; } m.opacity = f; } }
  const hs = [0, 1].map(i => ({ idx: i, held: null, ctl: null, hover: null, prevGrab: false, blockGrab: false, grabT: 0, lateTried: false, lostAt: null, openT: 0, hoverT: 0, target: null,
    pumpOff: 0, valveMode: 'open', valveT: 0, valveSent: 0, yanked: false, hx: new Float32Array(8), hy: new Float32Array(8), ht: new Float64Array(8), hk: 0, bellY0: 0, bellIt: null, slipT: 0, tubeStillT: 0, tubeArmed: true, po: 1, pp: 0, pg: 0, handPos: new THREE.Vector3() }));
  const stroke = makePumpStroke({ minAmp: ASSIST.pumpMinAmp, full: ASSIST.pumpFull });
  let pumpH = 0, pumpKick = 0, pShown = 1, valveShown = 0, valveOpen = 0, topTicked = false;

  // 놓을 자리 고리
  const ring = new THREE.Mesh(new THREE.RingGeometry(.06, .085, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.renderOrder = 3; scene.add(ring);

  // ── 화면 글자
  const tTag = document.createElement('div'); tTag.className = 'ttag'; tTag.style.display = 'none'; els.hud.appendChild(tTag);
  // 「다시 차리기」 단추: 엎어졌거나·쏟아졌거나·막 실패했을 때(자유 실험에서는 무엇이든 꺼내 놓았을 때)만 오른쪽 가운데에 나온다.
  // 카메라 손은 카드처럼 1초 대고 있으면 눌림(나올 때 손 밑에 있었으면 한 번 비켜났다 와야) · 터치·마우스는 바로
  const retryEl = document.createElement('button'); retryEl.className = 'retry'; retryEl.innerHTML = '<span class="ring"></span><span class="t"></span>'; retryEl.querySelector('.t').textContent = '↺ ' + (UI.reset || ''); retryEl.style.display = 'none'; els.hud.appendChild(retryEl);
  const retry = { on: false, prog: 0, wantT: 0, armed: [false, false], first: true, failAt: -1e9 };
  retryEl.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); if (retry.on) pressRetry(); });
  const noteEl = els.note, cards = createCards(els.hud), note = createNote(els.hud, UI);
  note.slots(exp.encyclopedia.map(e => ({ id: e.id, name: e.title })));
  if (els.bodySpot) els.bodySpot.classList.remove('show');
  let noteMain = '', noteSmall = '', notePersist = '', noteSmallLeft = 0;
  function renderNote(){ noteEl.innerHTML = ''; const m = document.createElement('span'); m.className = 'main'; m.textContent = noteMain; noteEl.appendChild(m);
    const s = noteSmall || notePersist; if (s) { const sm = document.createElement('small'); sm.textContent = s; noteEl.appendChild(sm); } noteEl.style.display = noteMain ? '' : 'none';
    noteEl.classList.remove('flip'); void noteEl.offsetWidth; noteEl.classList.add('flip'); }
  function noteSay(text, persist = false){ if (!text) return; if (persist) { if (notePersist === text && !noteSmall) return; notePersist = text; noteSmall = ''; } else { if (noteSmall === text) { noteSmallLeft = 4.5; return; } noteSmall = text; noteSmallLeft = 4.5; } renderNote(); }
  function say(text, it, cls = ''){ if (!text) return; let x = .5, y = .42; if (it) { lowOf(it, _low); _a.set(_low.cx, _low.maxY + .05, _low.cz); const p = stage.projectView(_a); x = clamp(p.x, .12, .88); y = clamp(p.y - .05, .16, .8); }
    const d = document.createElement('div'); d.className = 'say ' + cls; d.textContent = text; d.style.left = (x * 100) + '%'; d.style.top = (y * 100) + '%'; els.hud.appendChild(d); setTimeout(() => d.remove(), 2600); }

  // ── 물체 자리 셈
  function lowOf(it, out){ it.root.updateMatrixWorld(true); const m = it.root.matrixWorld, b = it.box; let i = 0;
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) corners[i++].set(x, y, z).applyMatrix4(m);
    let mnY = 1e9, mxY = -1e9, mnX = 1e9, mxX = -1e9, mnZ = 1e9, mxZ = -1e9; for (const c of corners) { if (c.y < mnY) mnY = c.y; if (c.y > mxY) mxY = c.y; if (c.x < mnX) mnX = c.x; if (c.x > mxX) mxX = c.x; if (c.z < mnZ) mnZ = c.z; if (c.z > mxZ) mxZ = c.z; }
    out.minY = mnY; out.maxY = mxY; out.cx = (mnX + mxX) / 2; out.cy = (mnY + mxY) / 2; out.cz = (mnZ + mxZ) / 2; out.rx = (mxX - mnX) / 2; return out; }
  const visible = it => it.root.visible && it.loc !== 'gone' && it.loc !== 'hidden';
  // 종 안에서 부푸는 것(풍선·거품·마시멜로)은 종 안쪽 벽과 천장을 넘지 않게 — 넘칠 만큼은 눌려서 납작해진다(벽에 닿은 모습)
  const _fb = new THREE.Box3(), _fc = new THREE.Box3(), _fv = new THREE.Vector3(), _fw = new THREE.Vector3(), _fm = new THREE.Matrix4();
  function meshBoxWorld(vis, out){ const m = vis.mesh, inf = m.morphTargetInfluences || []; const ig = vis.gi >= 0 ? inf[vis.gi] || 0 : 0, is = vis.si >= 0 ? inf[vis.si] || 0 : 0;
    _fc.copy(vis.b0); for (const k of ['min', 'max']) for (const ax of ['x', 'y', 'z']) { let v = vis.b0[k][ax]; if (vis.bg) v += (vis.bg[k][ax] - vis.b0[k][ax]) * ig; if (vis.bs) v += (vis.bs[k][ax] - vis.b0[k][ax]) * is; _fc[k][ax] = v; }
    out.makeEmpty(); for (let i = 0; i < 8; i++) { _fv.set(i & 1 ? _fc.max.x : _fc.min.x, i & 2 ? _fc.max.y : _fc.min.y, i & 4 ? _fc.max.z : _fc.min.z).applyMatrix4(m.matrixWorld); out.expandByPoint(_fv); } return out; }
  function fitInBell(it, vis, o, kx, ky){ const bell = V.bell && items.get(V.bell); if (!bell || !vis.mesh || !vis.b0 || o.loc !== 'plate' || it.held != null || it.tilt > .05) return;
    const IN = (bell.meta.extras && bell.meta.extras.inner) || { r: .1115, h: .2635 }, bs = bell.root.scale.x || 1, R = IN.r * bs - .006;
    bell.root.updateMatrixWorld(true); _fb.setFromObject(bell.model || bell.root); _fb.getCenter(_fw); const top = _fb.min.y + IN.h * bs - .006;
    for (let pass = 0; pass < 3; pass++) { it.root.updateMatrixWorld(true); meshBoxWorld(vis, _box);
      const cx = (_box.min.x + _box.max.x) / 2, cz = (_box.min.z + _box.max.z) / 2, rr = Math.max(_box.max.x - _box.min.x, _box.max.z - _box.min.z) / 2;
      vis.node.getWorldPosition(_fv); const d = Math.hypot(_fv.x - _fw.x, _fv.z - _fw.z), dc = Math.hypot(cx - _fw.x, cz - _fw.z);
      const fh = rr > 1e-4 && dc + rr > R ? Math.max(.2, (R - d) / Math.max(1e-4, rr + (dc - d))) : 1;
      const hgt = _box.max.y - _box.min.y, fv = hgt > 1e-4 && _box.max.y > top ? Math.max(.2, (top - _box.min.y) / hgt) : 1;
      if (fh >= .999 && fv >= .999) break;
      kx *= Math.min(1, fh); ky *= Math.min(1, fv); vis.node.scale.set(kx, ky, kx); vis.node.position.y = vis.y0 - vis.minY * (ky - 1) * .8; } }
  const overBench = (x, z) => x > BR.xMin + .02 && x < BR.xMax - .02 && z > BR.zMin - .05 && z < BR.zMax + .02;
  function slotTaken(name, except){ for (const it of items.values()) if (it !== except && it.slot === name && visible(it)) return true; return false; }
  const pumpGripWorld = out => { gripA.getWorldPosition(out); gripB.getWorldPosition(_d); return out.add(_d).multiplyScalar(.5); };

  // ── 움직임: 자리로 사뿐히(anim) · 나타남(scale)
  function animTo(it, pos, q, dur, arc = 0){ if (!it.anim) it.anim = { from: new THREE.Vector3(), to: new THREE.Vector3(), qf: new THREE.Quaternion(), qt: new THREE.Quaternion(), t: 0, dur, arc };
    const a = it.anim; a.from.copy(it.root.position); a.to.copy(pos); a.qf.copy(it.root.quaternion); a.qt.copy(q); a.t = 0; a.dur = dur; a.arc = arc; a.on = true; }
  function restAt(it, name, instant = false){ const sp = spotOf.get(name); if (!sp) return restAt(it, it.home.slot, instant);
    _a.copy(sp.pos); let yaw = 0; if (name === it.home.slot) { _a.x += it.home.dx; _a.z += it.home.dz; yaw = it.home.yaw; } else if (sp.kind === 'park') yaw = LAYOUT.shieldPark[2];
    if (sp.kind === 'plate') { if (it.role === 'bell') _a.copy(bellSeat); else yaw = PLATE_YAW[it.id] || 0; }
    const q = restQuat(it, 'shelf', yaw, _q); pivotForRest(it, _a, q, _b); it.slot = name; it.after = sp.kind === 'park' || sp.kind === 'front' ? 'bench' : sp.kind;
    if (instant) { it.root.position.copy(_b); it.root.quaternion.copy(q); it.loc = it.after; if (it.anim) it.anim.on = false; } else { animTo(it, _b, q, sp.kind === 'shelf' ? .45 : .2, sp.kind === 'shelf' ? .08 : 0); it.loc = 'anim'; } }
  const goHome = (it, instant) => restAt(it, it.home.slot, instant);
  function show(it, on){ it.fadeTo = on ? 1 : 0; if (on) { it.root.visible = true; if (it.scale < .02) it.scale = .02; } }

  // ── 빛남: 첫 의뢰에서 다음에 할 것 · 막혔을 때 짚어 줌
  let stepGlow = new Set();
  const flashes = new Map();
  function flash(list){ for (const id of list || []) flashes.set(id, 2.2); }
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,236,190,1)'); r.addColorStop(.35, 'rgba(255,214,140,.55)'); r.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const halos = new Map();
  function halo(id){ let h = halos.get(id); if (!h) { h = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false })); h.renderOrder = 1; h.visible = false; scene.add(h); halos.set(id, h); } return h; }
  const glowCol = new THREE.Color(1, .78, .42), _glowSet = new Set();
  function paintGlow(t, dt){
    for (const [id, left] of flashes) { if (left - dt <= 0) flashes.delete(id); else flashes.set(id, left - dt); }
    const want = _glowSet; want.clear(); for (const id of stepGlow) want.add(id); for (const id of flashes.keys()) want.add(id);
    for (const [id, h] of halos) if (!want.has(id)) h.visible = false;
    for (const id of want) { const g = flashes.has(id) ? .5 + .5 * Math.sin(t * 14) : .55 + .45 * Math.sin(t * 4.2), h = halo(id); let s = .16;
      if (id === 'pump') { if (!pump.root.visible) continue; pumpGripWorld(_a); s = .22; }
      else if (id === 'plate') { if (!plate.root.visible) continue; knob.getWorldPosition(_a); s = .12; }
      else { const it = items.get(id); if (!it || !visible(it) || it.held != null) { h.visible = false; continue; } lowOf(it, _low); _a.set(_low.cx, _low.cy, _low.cz - .06); s = Math.max(.14, (_low.maxY - _low.minY) * 1.5, _low.rx * 3.2); }
      h.position.copy(_a); h.scale.set(s, s, 1); h.material.opacity = .45 + g * .55; h.visible = true; }
    for (const it of items.values()) { const g = it.held == null && (hs[0].hover === it || hs[1].hover === it) ? .3 : 0, gq = Math.round(g * 40) / 40; if (gq === it.emLast) continue; it.emLast = gq;
      for (const m of it.mats) m.emissive.copy(m.userData.em0).lerp(glowCol, gq * .5); }
  }

  // ── 사건 보내기 + 효과 그리기
  let dirty = true, missionOver = false, causeQueue = null, pendingCards = null;
  function send(name, ...args){ const fx = session[name](...args); dirty = true; V = session.view(); apply(fx); return fx; }
  function apply(list){ for (const e of list) { try { onFx(e, list); } catch (err) { console.warn('[lab vac] 효과를 그리다 멈춤', e.type, err); } } }
  function onFx(e, batch){
    const it = e.id ? items.get(e.id) : null;
    switch (e.type) {
      case 'mission': missionOver = false; noteMain = e.note; noteSmall = ''; notePersist = e.pictures && e.pictures.length ? e.pictures.map(k => (defs[k] || {}).name).filter(Boolean).join(' · ') : ''; renderNote(); stepGlow = new Set(); clearShards(); break;
      case 'freePlay': noteMain = e.note; notePersist = e.text; noteSmall = ''; renderNote(); stepGlow = new Set(); break;
      case 'step': stepGlow = new Set(e.glow || []); break;
      case 'appear': e.ids.forEach((id, k) => { if (id === 'plate' || id === 'pump') { plate.root.visible = pump.root.visible = hose.visible = true; return; } const o = items.get(id); if (!o) return; goHome(o, true); o.scale = .02; o.appearDelay = k * .08; show(o, true); }); break;
      case 'restock': noteSay(e.text); for (const id of e.ids) { const o = items.get(id); if (o && o.loc === 'gone') { o.model.visible = true; if (crackBig && o === bellCr) crackBig.visible = false; goHome(o, true); o.scale = .02; show(o, true); } } break;
      case 'reset': noteSay(e.text); audio.ok(); for (const id of e.ids) { const o = items.get(id); if (o) { o.slot = null; goHome(o); o.tilt = 0; } } valveOpen = 0; retry.failAt = -1e9; break;
      case 'grab': audio.grab(it ? it.mat : 'glass'); break;
      case 'cover': audio.place('glass', .9); noteSay(e.text); break;
      case 'lift': audio.grab('glass'); break;
      case 'stuck': if (it) { it.wob = .7; sound.squeak(); say(e.text, it); } break;
      case 'pump': if (e.open) noteSay(e.text); sound.pump(e.open ? 1 : (e.p ?? V.p), e.strength); pumpKick = 1; break;
      case 'valve': break;
      case 'hiss': if (e.text) noteSay(e.text); if (e.fast) sound.rush(); break;
      case 'shield': noteSay(e.text); break;
      case 'blocked': if (!e.quiet) { noteSay(e.text); flash(e.glow); audio.clink(); } break;
      case 'hint': noteSay(e.text, true); flash(e.glow); break;
      case 'askPredict': if (!cards.open) pendingCards = { q: e.q, cards: e.cards, wait: 0 }; break;
      case 'predicted': audio.ok(); break;
      case 'accident': note.accident({ text: e.text, real: e.real, rule: e.rule, kind: e.show, first: e.first }); audio.alarm(); stage.shake(.6); break;
      case 'alarm': audio.alarm(); break;
      case 'lose': if (it) loseItem(it); noteSay(e.text); break;
      case 'missionFail': retry.failAt = stage.now(); break;
      case 'discover': note.find(e.id, e.title); audio.discover(); say(e.title, it || items.get(e.item), 'find'); break;
      case 'missionDone': missionOver = true; audio.ok(); cards.close(); stepGlow = new Set(); break;
      case 'cause': { const wow = batch.some(x => BIG_FX.has(x.outcome)); causeQueue = { text: e.text, left: wow ? 2.6 : .8 }; break; }
      case 'note': note.page(e.entry); break;
      case 'whyNot': note.whyAll(e.title, e.lines); break;
      case 'spill': noteSay(e.text); break;
      case 'connect': case 'detach': if (e.text) noteSay(e.text); break;
      case 'fixed': noteSay(e.text); break;
      case 'crack': crackFx(e, it); break;
      case 'whoosh': sound.rush(); stage.shake(.35); say(e.text, it); break;
      case 'suctionDrop': audio.thud(1); say(e.text, it, 'good'); break;
      case 'candleOut': smokeLeft = Math.max(smokeLeft, .9); say(e.text, it, 'good'); break;
      case 'smoke': smokeLeft = Math.max(smokeLeft, 3); say(e.text, it); break;
      case 'pop': audio.pop(false); stage.shake(.3); say(e.text, it, 'good'); break;
      case 'dropResult': if (droptube) droptube.dropAnim = { t: -.45, key: e.result, tBall: e.tBall || .45, tFeather: e.tFeather || 1.2 }; say(e.text, it, e.result === 'together' ? 'good' : ''); break;
      case 'shielded': say(e.text, shieldIt, 'good'); break;
      case 'crackHeld': say(e.text, it); break;
      default: if (e.text && e.outcome) { say(e.text, it, e.grade === 'fail' ? '' : 'good'); }
    }
    // 와! 하는 순간: 눈앞 컷(일어나는 일 가까이) · 자명종이 조용해지면 방 소리도 잠깐 멈춤
    if (e.outcome && BIG_FX.has(e.outcome) && it && e.outcome !== 'crackBurst') { lowOf(it, _low); stage.closeUp(new THREE.Vector3(_low.cx, (_low.minY + _low.maxY) / 2, _low.cz), 2.2); if (e.outcome === 'clockSilent') sound.hush(1.6, stage.now()); if (e.outcome === 'marshDouble' || e.outcome === 'waterBoil') stage.slowMo(.5, .5); }
  }
  function crackFx(e, it){ if (!it) return;
    if (e.stage === 1) { if (crackBig) crackBig.visible = true; sound.crack(false); it.wob = .8; stage.shake(.35); say(e.text, it); return; }
    // 안쪽으로 와르르: 미리 만든 조각을 종 자리에 놓고 흩뿌린다. 방호판이 서 있으면 조각이 덜 튄다
    sound.crack(true); audio.shatter(3); stage.shake(.9); say(e.text, it); it.model.visible = false;
    const root = shardGroup.clone(true); it.root.updateMatrixWorld(true); it.model.getWorldPosition(root.position); root.quaternion.copy(it.root.quaternion); scene.add(root); root.updateMatrixWorld(true);
    const point = it.model.getWorldPosition(new THREE.Vector3()); point.y += .15;
    try { const h = bridge.shatter(root.children.slice(), { point, strength: V.shield ? 1 : 3, benchY, radius: .13, tint: 0xdcefe6 }); shardSets.push(h); } catch (err) { console.warn('[lab vac] 조각', err); }
    root.removeFromParent(); stage.closeUp(point, 2.2); stage.slowMo(.4, .6); }
  function clearShards(){ for (const h of shardSets) { try { h && h.clear && h.clear(); } catch (_) {} } shardSets.length = 0; }
  function loseItem(it){ for (const st of hs) if (st.held === it) { st.held = null; ring.visible = false; } it.held = null; it.loc = 'gone'; it.slot = null; it.fadeTo = 0; if (it.anim) it.anim.on = false; }

  // ── 놓을 자리
  function nearestSpot(it, kinds){ lowOf(it, _low); _a.set(_low.cx, _low.minY, _low.cz); stage.projectTo(_a, _s); let best = null, bd = 1e9;
    for (const sp of spots) { if (!kinds.includes(sp.kind)) continue; const home = sp.name === it.home.slot; if (!home && slotTaken(sp.name, it)) continue;
      stage.projectTo(sp.pos, sp.scr); const d = sdist(_s, sp.scr), r = sp.kind === 'bench' ? ASSIST.snapBench : ASSIST.snapShelf; if (d < r && d < bd) { bd = d; best = sp; } }
    return best; }
  /** 받침판 위 시료를 개수에 맞게 다시 벌려 놓는다 */
  function layoutPlate(){ const on = []; for (const it of items.values()) if (visible(it) && it.held == null && /^plate_/.test(it.slot || '')) on.push(it);
    on.sort((a, b) => (a.plateOrder || 0) - (b.plateOrder || 0)); if (on.length === 3) { let big = 0; for (let k = 1; k < 3; k++) if (on[k].maxDim > on[big].maxDim) big = k; on.push(on.splice(big, 1)[0]); }
    const L = PLATE_LAYOUT[Math.min(3, on.length)];
    on.forEach((it, k) => { const sp = seatSpots[k]; sp.pos.set(seat0.x + L[k][0] * ASSIST.plateGap, seat0.y, seat0.z + L[k][1] * ASSIST.plateGap); it.slot = null; restAt(it, sp.name); }); }
  function freeSeat(it){ for (const sp of seatSpots) if (!slotTaken(sp.name, it)) return sp; return null; }
  /** 든 것이 지금 붙을 곳: { kind:'plate'|'front'|'spot'|'home', spot, d } */
  function targetOf(it){
    lowOf(it, _low); _a.set(_low.cx, _low.minY, _low.cz); stage.projectTo(_a, _s);
    if (it.role === 'shield') { stage.projectTo(frontSpot.pos, _s2); const d = sdist(_s, _s2); if (d < ASSIST.shieldSnap) return { kind: 'front', spot: frontSpot, d }; return { kind: 'home', spot: parkSpot, d: 9 }; }
    stage.projectTo(it.role === 'bell' ? bellSeat : seat0, _s2); const d = sdist(_s, _s2);
    if (it.noPlate && d > ASSIST.plateSnap * 1.3) it.noPlate = false;   /* 받침판에서 집어 든 것은 한 번 멀어진 뒤에야 「머물러 붙기」가 다시 켜진다(들자마자 도로 덮이지 않게). 손을 펴면 그 자리에 바로 놓인다(엎어진 것 다시 세우기) */
    if (d < ASSIST.plateSnap) { const noHover = !!it.noPlate; if (it.role === 'bell' && !V.bell) return { kind: 'plate', spot: seatSpots[0], d, noHover }; if (it.role !== 'bell' && !V.bell) { const sp = freeSeat(it); if (sp) return { kind: 'plate', spot: sp, d, noHover }; } }
    const sp = nearestSpot(it, ['bench', 'shelf']); if (sp) return { kind: 'spot', spot: sp, d: 0 };
    return { kind: 'home', spot: spotOf.get(it.home.slot), d: 9 }; }
  function benchFallback(it){ const sp = nearestSpot(it, ['bench']) || spots.find(s => s.kind === 'bench' && !slotTaken(s.name, it)); return sp ? sp.name : it.home.slot; }
  /** 놓기(손을 폈거나, 붙을 곳에 머물렀을 때) */
  function place(it, tgt){
    it.held = null; ring.visible = false;
    if (tgt.kind === 'plate') {
      if (it.role === 'bell') { const fx = send('place', it.id, 'plate'); if (fx.some(e => e.type === 'cover' && e.id === it.id)) { restAt(it, tgt.spot.name); it.slot = 'bell_on_plate'; return; } }
      else { const fx = send('place', it.id, tgt.spot.name); if (fx.some(e => (e.type === 'place' && e.id === it.id && e.where === 'plate') || (e.type === 'connect' && e.id === it.id))) { it.slot = tgt.spot.name; it.plateOrder = ++plateCount; layoutPlate(); return; } }
      const b = benchFallback(it); restAt(it, b); send('place', it.id, b); return; }
    if (it.role === 'shield') { if (tgt.kind === 'front') { restAt(it, 'shield_front'); send('shield', true); } else { restAt(it, 'shield_park'); send('shield', false); } return; }
    const name = tgt.spot ? tgt.spot.name : it.home.slot; restAt(it, name); send('place', it.id, name); }

  // ── 손 하나
  function handStep(i, dt, now){
    const H = input.hands[i], st = hs[i];
    // 손 자리 기록(밸브 「휙」 빠르기)
    st.hk = (st.hk + 1) % 8; st.hx[st.hk] = H.x; st.hy[st.hk] = H.y; st.ht[st.hk] = now;
    if (st.slipT > 0) st.slipT -= dt;
    // ① 기구를 들고 있음
    if (st.held) { const it = st.held;
      if (!H.present && H.src === 'cam') {            // 손을 놓침 — 0.4초 머묾 → 제자리로 사뿐히. 깨지지 않는다.
        if (st.lostAt == null) st.lostAt = now;
        if (lostAction(now - st.lostAt) === 'return') { st.held = null; it.held = null; ring.visible = false; st.lostAt = null; send('drop', it.id, 0, true); place(it, { kind: 'home', spot: spotOf.get(it.home.slot) }); }
        return; }
      st.lostAt = null;
      if (!H.grab) { st.openT += dt; if (H.src !== 'cam' || st.openT >= ASSIST.releaseCam) { st.openT = 0; st.held = null; const tgt = targetOf(it); place(it, tgt); return; } } else st.openT = 0;
      carry(it, st, H, dt);
      if (it.role === 'tube') { const j = (st.hk + 8 - 4) % 8, dtw = (now - st.ht[j]) / 1000, sp = dtw > .02 ? Math.hypot((H.x - st.hx[j]) * aspect(), H.y - st.hy[j]) / dtw : 0;   /* 낙하 통: 든 채 잠깐 가만히 = 저절로 뒤집혀 떨어뜨림(정밀한 휙 대신) */
        if (sp > ASSIST.tubeMove) st.tubeArmed = true; if (sp < ASSIST.tubeStill) st.tubeStillT += dt; else st.tubeStillT = 0;
        if (st.tubeArmed && st.tubeStillT >= ASSIST.tubeHold && !(it.dropAnim)) { st.tubeArmed = false; st.tubeStillT = 0; send('drop', it.id, 0, false); } }
      return; }
    // ② 펌프·밸브·종 손잡이를 쥐고 있음
    if (st.ctl) {
      if (!H.present) { if (H.src !== 'cam' || st.lostAt == null) st.lostAt = now; endCtl(st); return; }
      if (!H.grab) { st.openT += dt; if (H.src !== 'cam' || st.openT >= ASSIST.releaseCam) { st.openT = 0; endCtl(st); st.blockGrab = false; } return; } st.openT = 0;
      if (st.ctl === 'pump') pumpStep(st, H, dt);
      else if (st.ctl === 'valve') valveStep(st, H, dt, now);
      else if (st.ctl === 'bell') bellStep(st, H);
      return; }
    st.lostAt = null; const prevHover = st.hover; st.hover = null; st.hoverCtl = null;
    if (!H.present) { st.prevGrab = false; st.blockGrab = false; st.grabT = 0; return; }
    if (!H.grab) { st.blockGrab = false; st.grabT = 0; } else st.grabT += dt;
    // 집을 것 고르기: 반경으로 나눈 거리가 가장 작은 것(펌프·밸브·종 손잡이는 반경이 크다)
    const k = H.src === 'cam' ? ASSIST.camGrab : 1; let best = null, bs = 1, bctl = null, keep = 9;
    const consider = (target, ctl, wx, r) => { stage.projectTo(wx, _s); const sc = sdist(H, _s) / (r * k); if ((target === prevHover && ctl === st.prevCtl)) keep = sc; if (sc < bs) { bs = sc; best = target; bctl = ctl; } };
    if (pump.root.visible) consider(pump, 'pump', pumpGripWorld(_c), ASSIST.pumpGrab);
    if (plate.root.visible) consider(plate, 'valve', knob.getWorldPosition(_c), ASSIST.valveGrab);
    for (const it of items.values()) { if (!visible(it) || it.held != null || (it.anim && it.anim.on && it.anim.t < .6) || it.scale < .5) continue;
      if (V.bell === it.id) consider(it, 'bell', it.root.position, ASSIST.bellGrab); else consider(it, null, it.root.position, ASSIST.grab); }
    if (prevHover && keep < 1.2 && best !== prevHover && bs * ASSIST.grabKeep > keep) { best = prevHover; bctl = st.prevCtl; }
    st.hover = best; st.hoverCtl = bctl; st.prevCtl = bctl;
    const fresh = H.grab && !st.prevGrab, late = H.grab && st.grabT < ASSIST.grabLate && !st.lateTried; if (fresh) st.lateTried = false;
    if ((fresh || late) && !st.blockGrab && best) { st.lateTried = true; startGrab(st, H, best, bctl); }
    st.prevGrab = H.grab;
  }
  function startGrab(st, H, target, ctl){
    if (ctl === 'pump') { st.ctl = 'pump'; st.hover = null; if (V.valve > exp.vac.valveShut) send('valve', 0); const hh = handH(H); st.pumpOff = pumpH - hh * ASSIST.pumpGain; stroke.reset(); audio.grab('metal'); return; }
    if (ctl === 'valve') { st.ctl = 'valve'; st.hover = null; valveOpen = V.valve; st.valveMode = valveOpen > .5 ? 'close' : 'open'; st.valveT = 0; st.valveSent = valveOpen; st.yanked = false; audio.grab('plastic'); return; }
    if (ctl === 'bell') { st.ctl = 'bell'; st.hover = null; st.bellY0 = H.y; st.bellIt = target; audio.grab('glass'); return; }
    const it = target; const fx = send('grab', it.id);
    if (!fx.some(e => e.type === 'grab' && e.id === it.id)) { it.wob = .5; st.blockGrab = true; return; }
    it.noPlate = it.loc === 'plate' || (it.slot || '').startsWith('plate'); const wasOnPlate = (it.slot || '').startsWith('plate_'); st.held = it; it.held = st.idx; it.loc = 'hand'; it.slot = null; if (wasOnPlate) layoutPlate(); st.tubeStillT = 0; st.tubeArmed = true; if (it.anim) it.anim.on = false; it.zc = it.root.position.z; st.hover = null; st.hoverT = 0; st.target = null; it.tilt = 0;
  }
  function endCtl(st){ st.ctl = null; st.bellIt = null; }
  // 펌프: 손잡이 높이(0~1)를 화면 높이로 — 손잡이 바닥·꼭대기의 화면 자리 사이에서 손 높이를 읽는다(1:1)
  const pumpTop = new THREE.Vector3(), pumpBot = new THREE.Vector3();
  function pumpScreens(){ pumpGripWorld(_c); const travelW = HX.travel * LAYOUT.pump[3]; pumpBot.copy(_c); pumpBot.y -= pumpH * travelW; pumpTop.copy(pumpBot); pumpTop.y += travelW; }
  function handH(H){ pumpScreens(); stage.projectTo(pumpBot, _s); stage.projectTo(pumpTop, _s2); const span = _s.y - _s2.y; return span > 1e-4 ? (_s.y - H.y) / span : 0; }
  function pumpStep(st, H, dt){
    const raw = handH(H) * ASSIST.pumpGain + st.pumpOff;
    if (raw < 0) st.pumpOff -= raw; else if (raw > 1) st.pumpOff -= raw - 1;   /* 손이 바닥 아래·꼭대기 위로 더 가면 기준을 옮긴다 → 다음 왕복도 곧바로 손잡이가 움직인다(빈 구간 없음) */
    const want = clamp(raw, 0, 1);
    pumpH += (want - pumpH) * Math.min(1, dt * ASSIST.pumpFollow);
    if (pumpH > .95 && !topTicked) { topTicked = true; sound.tick(); } else if (pumpH < .8) topTicked = false;
    const r = stroke.update(pumpH); if (r) send('pump', r.strength); }
  function valveStep(st, H, dt, now){
    st.valveT += dt;
    if (!st.yanked && st.valveT > ASSIST.yankArm && st.valveMode === 'open') { const j = (st.hk + 8 - 4) % 8, dtw = (now - st.ht[j]) / 1000; if (dtw > .05 && dtw < ASSIST.yankWin * 2.5) { const sp = Math.hypot((H.x - st.hx[j]) * aspect(), H.y - st.hy[j]) / dtw; if (sp > ASSIST.yankSpeed) { st.yanked = true; valveOpen = 1; send('valve', 1, true); st.valveSent = 1; return; } } }
    if (st.valveMode === 'open') valveOpen = Math.min(1, valveOpen + ASSIST.valveRate * dt); else valveOpen = Math.max(0, valveOpen - ASSIST.valveClose * dt);
    if (Math.abs(valveOpen - st.valveSent) >= ASSIST.valveSend || (valveOpen === 0 && st.valveSent !== 0) || (valveOpen === 1 && st.valveSent !== 1)) { st.valveSent = valveOpen; send('valve', valveOpen, false); } }
  function bellStep(st, H){ const it = st.bellIt; if (!it || V.bell !== it.id) { endCtl(st); return; }
    if (st.bellY0 - H.y > ASSIST.bellRise) { const fx = send('grab', it.id);
      if (fx.some(e => e.type === 'lift' && e.id === it.id)) { endCtl(st); it.noPlate = true; st.held = it; it.held = st.idx; it.loc = 'hand'; it.slot = null; if (it.anim) it.anim.on = false; it.zc = it.root.position.z; st.hoverT = 0; return; }
      endCtl(st); st.slipT = .45; st.blockGrab = true; } }   /* 안 들림: 손이 위로 미끄러져 빠진다(쥔 손을 한 번 펴야 다시 쥠) */

  function carry(it, st, H, dt){
    const tgt = targetOf(it); st.target = tgt;
    const zWant = tgt.kind === 'plate' ? tgt.spot.pos.z : tgt.kind === 'front' ? frontSpot.pos.z : WORK_Z;
    it.zc += (zWant - it.zc) * Math.min(1, dt * 6);
    stage.screenToPlane(H.x, H.y, it.zc, _a); it.root.position.lerp(_a, followK(dt, it.weight));
    it.root.quaternion.slerp(it.role === 'shield' ? _q.setFromAxisAngle(UP, tgt.kind === 'front' ? 0 : LAYOUT.shieldPark[2]) : _q.identity(), Math.min(1, dt * 10));
    lowOf(it, _low); if (overBench(_low.cx, _low.cz) && _low.minY < benchY + .002) it.root.position.y += benchY + .002 - _low.minY;
    // 붙을 곳 고리 + 받침판·방호판 자리에 머물면 손을 펴지 않아도 놓인다
    const sp = tgt.spot; if (sp && tgt.kind !== 'home') { ring.position.set(tgt.kind === 'plate' && it.role === 'bell' ? bellSeat.x : sp.pos.x, sp.pos.y + .004, tgt.kind === 'plate' && it.role === 'bell' ? bellSeat.z : sp.pos.z); ring.scale.setScalar(it.role === 'bell' ? 1.6 : it.role === 'shield' ? 2.4 : 1); ring.material.color.setHex(tgt.kind === 'plate' || tgt.kind === 'front' ? 0xffd27a : 0xffffff); ring.visible = true; } else ring.visible = false;
    if ((tgt.kind === 'plate' && !tgt.noHover) || tgt.kind === 'front') { st.hoverT += dt; if (st.hoverT >= ASSIST.hoverSnap) { st.hoverT = 0; st.held = null; st.blockGrab = true; place(it, tgt); } } else st.hoverT = 0;
  }

  // ── 컷: 손을 위로(선반) → A · 손이 내려와 있으면 → B(집)
  let hiT = 0, loT = 0;
  function cutRule(dt){ const cut = stage.cut; if (cut === 'C') return; const P = input.hands.filter(h => h.present); if (!P.length) { hiT = loT = 0; return; }
    const busy = hs.some(s => s.ctl);
    if (cut === 'B') { hiT = !busy && P.some(h => h.y < ASSIST.cutUp) ? hiT + dt : 0; if (hiT > ASSIST.cutUpT) { stage.setCut('A'); hiT = 0; } }
    else { loT = P.every(h => h.y > ASSIST.cutDown) ? loT + dt : 0; if (loT > ASSIST.cutDownT) { stage.setCut('B'); loT = 0; } } }

  // ── 매 프레임
  let viewT = 0, noHandSince = stage.now();
  const NOHAND = { present: false, x: -1, y: -1 }, freeHands = [NOHAND, NOHAND];
  function update(dt, rdt, now){
    const t = now / 1000;
    input.update(now);
    viewT += dt; if (dirty || viewT > .1) { V = session.view(); viewT = 0; dirty = false; }
    for (let i = 0; i < 2; i++) handStep(i, dt, now);
    if (!hs.some(s => s.ctl === 'pump')) { pumpH = Math.max(0, pumpH - ASSIST.pumpFall * dt); if (pumpH < .05) stroke.reset(); }
    if (!hs.some(s => s.ctl === 'valve')) valveOpen = V.valve;
    apply(session.tick(dt));
    // 고정 기구: 펌프 손잡이 · 바늘(떨림) · 밸브 손잡이
    handle.position.y = handleY0 + pumpH * HX.travel;
    pShown += (V.p - pShown) * Math.min(1, dt * 6); pumpKick = Math.max(0, pumpKick - dt * 3);
    needle.rotation.z = (NX.angleMin + (NX.angleMax - NX.angleMin) * (1 - pShown) + Math.sin(t * 37) * .7 + Math.sin(t * 61) * pumpKick * 4) * DEG;
    valveShown += (valveOpen - valveShown) * Math.min(1, dt * 10); knob.rotation.y = knobY0 + valveShown * KX.turn * DEG;
    // 기구
    for (const it of items.values()) {
      if (it.appearDelay > 0) it.appearDelay -= dt; else if (it.scale !== it.fadeTo) { it.scale += (it.fadeTo - it.scale) * Math.min(1, dt * 9); if (Math.abs(it.fadeTo - it.scale) < .01) { it.scale = it.fadeTo; if (it.scale === 0) it.root.visible = false; } }
      if (!it.root.visible) continue;
      it.root.scale.setScalar(Math.max(.001, it.scale));
      const a = it.anim; if (a && a.on) { a.t = Math.min(1, a.t + dt / a.dur); const k = 1 - Math.pow(1 - a.t, 3); it.root.position.lerpVectors(a.from, a.to, k); it.root.position.y += Math.sin(Math.PI * a.t) * a.arc; it.root.quaternion.slerpQuaternions(a.qf, a.qt, k);
        if (a.t >= 1) { a.on = false; it.loc = it.after || 'bench'; audio.place(it.mat, .5); } }
      const o = V.objects[it.id] || {};
      // 엎어짐(공기가 한꺼번에 들어옴) → 옆으로 눕는다, 다시 놓으면 선다
      const tiltW = o.knocked && it.held == null ? 1.25 : 0; it.tilt += (tiltW - it.tilt) * Math.min(1, dt * 8); it.model.rotation.z = it.tilt + (it.wob > 0 ? Math.sin(t * 34) * it.wob * .09 : 0); if (it.wob > 0) it.wob = Math.max(0, it.wob - dt * 2.2);
      // 부풂 · 쭈그러듦(모양 키 + 남은 만큼 크기)
      const vis = it.vis; if (vis && o.size != null) { const s = it.id === 'sponge' ? 1 : o.size; vis.shown += (s - vis.shown) * Math.min(1, dt * 5); const S = vis.shown, VI = VIS[it.id];
        let L = VI.lin(S), Ly = VI.liny ? VI.liny(S) : L;
        if (VI.low) { const lo = VI.low(S); if (S < 1) { L = lo; Ly = lo; } }
        let mg = 1; if (vis.mesh && vis.gi >= 0) { const inf = clamp((Math.max(L, Ly) - 1) / Math.max(1e-3, vis.gr - 1), 0, 1); vis.mesh.morphTargetInfluences[vis.gi] = it.id === 'sponge' ? (o.pressure < .3 ? 1 : 0) : inf; mg = it.id === 'sponge' ? 1 : 1 + (vis.gr - 1) * inf; }
        let ms = 1; if (vis.mesh && vis.si >= 0) { const inf = clamp((1 - L) / Math.max(1e-3, 1 - 1 / Math.max(1.01, vis.sr)), 0, 1); vis.mesh.morphTargetInfluences[vis.si] = inf; ms = 1 - (1 - 1 / Math.max(1.01, vis.sr)) * inf; }
        const kx = L / (mg * ms), ky = Ly / (mg * ms); vis.node.scale.set(kx, ky, kx); vis.node.position.y = vis.y0 - vis.minY * (ky - 1) * .8; fitInBell(it, vis, o, kx, ky); }
    }
    // 자명종: 망치가 떨고(선반에 있을 때만 쉼), 소리 크기 = view().sound
    const ringing = clock && visible(clock) && clock.loc !== 'shelf' && clock.loc !== 'anim' && V.sound != null;
    if (hammer) hammer.rotation.z = ringing ? ((Math.floor(t * 30) & 1) ? 1 : -1) * hammerX.amp * DEG * (.7 + .3 * Math.random()) : 0;
    const hissLv = V.sealed && V.valve > .02 ? clamp(V.valve * (1 - V.p) * 2.2, 0, 1) : 0;
    sound.update(ringing ? V.sound : null, ringing && V.plate.includes('clock') && !!V.bell, hissLv, now);
    // 물: 액면 · 끓음 · 온도계
    if (beaker && vessel) { const o = V.objects.beaker_water || {}; vessel.fill += ((o.empty ? 0 : waterFill) - vessel.fill) * Math.min(1, dt * 4); vessel.boil += ((o.boiling ? 1 : o.simmer ? .28 : 0) - vessel.boil) * Math.min(1, dt * 3); vessel.update(dt); if (visible(beaker) && o.boiling) audio.boil(.35); else audio.boil(0);
      if (thermo && o.T != null) { const tx = thermo.userData || {}; thermo.scale.y = tx.max != null ? (tx.min + (o.T - tx.tMin) / (tx.tMax - tx.tMin) * (tx.max - tx.min)) : clamp(o.T / 40, .06, 1); }
      // 온도 쪽지: 종 안 비커가 받침판 위에 있으면 숫자로(눈금 차이가 작아도 내려가는 것이 보이게)
      const showT = visible(beaker) && o.loc === 'plate' && o.T != null && stage.cut !== 'A'; tTag.style.display = showT ? '' : 'none';
      if (showT) { lowOf(beaker, _low); _a.set(_low.cx + .07, _low.maxY, _low.cz); const pp = stage.projectView(_a); tTag.style.left = (pp.x * 100) + '%'; tTag.style.top = (pp.y * 100) + '%'; const txt = o.T.toFixed(1) + '℃'; if (tTag.textContent !== txt) tTag.textContent = txt; tTag.classList.toggle('boil', !!o.boiling); } }
    // 촛불
    if (candle && flameE) { const o = V.objects.candle || {}, f = visible(candle) && o.lit !== false ? (o.flame ?? 1) : 0; flame.visible = f > .02 && candle.scale > .5; if (flame.visible) { flameE.getWorldPosition(_a); const fl = .85 + .15 * Math.sin(t * 23) * Math.sin(t * 7.1); flame.position.set(_a.x, _a.y + .012 * f, _a.z); flame.scale.set(.022 * (.5 + .5 * f) * fl, .05 * f * fl, 1); } }
    if (smokeLeft > 0 && candle && flameE) { smokeLeft -= dt; const sp = smoke.find(s => !s.visible); if (sp && Math.random() < dt * 14) { flameE.getWorldPosition(sp.position); sp.userData.life = 0; sp.userData.vx = (Math.random() - .5) * .02; sp.visible = true; } }
    for (const s of smoke) { if (!s.visible) continue; const u = s.userData; u.life += dt; s.position.y += dt * .06; s.position.x += u.vx * dt; const k = u.life / 2.4, sc = .03 + k * .13; s.scale.set(sc, sc, 1); s.material.opacity = .75 * (1 - k) * Math.min(1, u.life * 4); if (k >= 1) s.visible = false; }
    // 흡착판과 추
    if (suction && cupE && weightE) { const o = V.objects.suction || {}, want = o.stuck === false ? 1 : 0; suction.dropK = suction.dropK ?? 0; suction.dropV = suction.dropV ?? 0;
      if (want > suction.dropK) { suction.dropV += dt * 9.8 / dropDist * .5; suction.dropK = Math.min(1, suction.dropK + suction.dropV * dt); } else if (want < suction.dropK) { suction.dropK = 0; suction.dropV = 0; }
      cupE.position.y = cupY0 - suction.dropK * dropDist; weightE.position.y = weightY0 - suction.dropK * dropDist; }
    // 금 간 종의 큰 금
    if (crackBig) { const o = V.objects.bell_cracked || {}; crackBig.visible = (o.crackStage || 0) >= 1; if (crackSmall) crackSmall.visible = !crackBig.visible; }
    // 낙하 통(자유 실험)
    if (droptube && droptube.dropAnim) { const d = droptube.dropAnim; d.t += dt;
      // 먼저 쥔 점을 중심으로 한 바퀴 뒤집고(0.45초), 그다음 깃털과 쇠구슬이 위에서 떨어진다
      const spin = d.t < 0 ? (1 + d.t / .45) * Math.PI * 2 : 0; droptube.model.rotation.z = spin; droptube.model.position.copy(droptube.gripLocal).multiplyScalar(-1).applyAxisAngle(AXZ, spin);
      const fall = Math.max(0, d.t); const ex = droptube.meta.extras || {}, top = ex.top || (ex.droptube && ex.droptube.top) || droptube.model.userData.top || .24, ball = droptube.E('ball'), fe = droptube.E('feather');
      if (ball) { if (ball.userData.y0 == null) ball.userData.y0 = ball.position.y; ball.position.y = ball.userData.y0 + Math.max(0, top - ball.userData.y0) * Math.max(0, 1 - Math.pow(fall / d.tBall, 2)); }
      if (fe) { if (fe.userData.y0 == null) fe.userData.y0 = fe.position.y; fe.position.y = fe.userData.y0 + Math.max(0, top - fe.userData.y0) * Math.max(0, 1 - Math.pow(fall / d.tFeather, 2)); }
      if (d.t > Math.max(d.tBall, d.tFeather) + 1) droptube.dropAnim = null; }
    paintGlow(t, rdt);
    // 손 모델
    for (let i = 0; i < 2; i++) { const h3 = H3[i]; if (!h3) continue; const H = input.hands[i], st = hs[i];
      const vis = (H.present || (st.held && st.lostAt != null)) && stage.cut !== 'C'; h3.group.visible = !!vis; if (!vis) continue;
      const small = st.held && st.held.maxDim < ASSIST.smallItem;
      if (st.held) _a.copy(st.held.root.position).add(small ? _b.set(.035, .045, .05) : _b.set(0, 0, .02));
      else if (st.ctl === 'pump') pumpGripWorld(_a).add(_b.set(0, 0, .03));
      else if (st.ctl === 'valve') knob.getWorldPosition(_a).add(_b.set(0, .02, .03));
      else if (st.ctl === 'bell' && st.bellIt) _a.copy(st.bellIt.root.position).add(_b.set(0, 0, .03));
      else stage.screenToPlane(H.x, H.y, WORK_Z + .04, _a);
      if (st.slipT > 0) { _a.x += Math.sin(t * 70) * .006 * st.slipT; }                        /* 안 들리는 종에서 미끄러진 손: 떨며 위로 빠진다 */
      h3.group.position.lerp(_a, st.slipT > 0 ? .25 : (H.src === 'cam' ? .55 : 1));
      const holding = st.held || st.ctl, wantO = holding ? 0 : st.hover ? .25 : (H.grab ? 0 : .9), wantP = holding ? .15 : st.hover ? .7 : 0, wantG = holding ? 1 : (H.grab ? .8 : 0), k = Math.min(1, dt * 14);
      st.po += (wantO - st.po) * k; st.pp += (wantP - st.pp) * k; st.pg += (wantG - st.pg) * k; h3.pose(st.po, st.pp, st.pg); h3.group.rotation.set(-.12, 0, i ? .1 : -.1); handLook(h3, small ? ASSIST.handFade : 1, small ? ASSIST.handShrink : 1, dt); }
    if (input.hands.some(h => h.present)) noHandSince = now; if (els.askHands) els.askHands(input.mode === 'cam' && now - noHandSince > LOST_ASK_MS);
    // 예상 카드: 기구를 쥐고 있는 동안은 미뤘다가 놓고 cardsAfter 초 뒤에
    if (pendingCards) { const busy = hs.some(s => s.held || s.ctl); pendingCards.wait = busy ? 0 : pendingCards.wait + rdt;
      if (pendingCards.wait >= ASSIST.cardsAfter && !missionOver) { const p = pendingCards; pendingCards = null; cards.show(p.q, p.cards, k => send('predict', k), { grace: ASSIST.cardsGrace }); } }
    freeHands[0] = hs[0].held || hs[0].ctl ? NOHAND : input.hands[0]; freeHands[1] = hs[1].held || hs[1].ctl ? NOHAND : input.hands[1];
    cards.update(rdt, freeHands); note.update(rdt); retryStep(rdt);
    if (noteSmallLeft > 0) { noteSmallLeft -= rdt; if (noteSmallLeft <= 0) { noteSmall = ''; renderNote(); } }
    if (causeQueue) { causeQueue.left -= rdt; if (causeQueue.left <= 0) { const txt = causeQueue.text; causeQueue = null; note.cause(txt, { sec: 6.5, done: openBook }); } }
    bridge.update(dt); bridge.sample(performance.now());
    cutRule(rdt);
  }
  function retryWanted(){ if (missionOver || cards.open || note.isOpen || (V.phase !== 'do' && V.phase !== 'free')) return false; if (hs[0].held || hs[0].ctl || hs[1].held || hs[1].ctl) return false;
    const O = V.objects; for (const id in O) if (O[id].knocked) return true; if (O.beaker_water && O.beaker_water.available && O.beaker_water.empty) return true;
    if (stage.now() - retry.failAt < 15000) return true;
    if (V.phase === 'free') for (const id in O) { const o = O[id]; if (o.role !== 'fixture' && o.role !== 'shield' && o.available && !o.lost && o.loc !== 'shelf') return true; }
    return false; }
  function retryStep(rdt){ retry.wantT = retryWanted() ? retry.wantT + rdt : 0; const show = retry.wantT >= ASSIST.retryAfter;
    if (show !== retry.on) { retry.on = show; retryEl.style.display = show ? '' : 'none'; retry.prog = 0; retry.first = true; retry.armed[0] = retry.armed[1] = false; retryEl.style.setProperty('--p', '0'); }
    if (!show) return; const r = retryEl.getBoundingClientRect(), W = innerWidth, Hh = innerHeight; let over = false, seen = false;
    for (let k = 0; k < 2; k++) { const h = input.hands[k]; if (!h.present || h.src === 'mouse' || h.src === 'touch' || h.src === 'pen') continue; seen = true;
      const inside = h.x * W >= r.left && h.x * W <= r.right && h.y * Hh >= r.top && h.y * Hh <= r.bottom; if (retry.first) retry.armed[k] = !inside; else if (!inside) retry.armed[k] = true; if (inside && retry.armed[k]) over = true; }
    if (seen) retry.first = false;
    retry.prog = over ? Math.min(1, retry.prog + rdt / ASSIST.retryDwell) : Math.max(0, retry.prog - rdt * 2.5); retryEl.style.setProperty('--p', retry.prog.toFixed(3)); retryEl.classList.toggle('hot', over);
    if (retry.prog >= 1) pressRetry(); }
  function pressRetry(){ retry.on = false; retry.wantT = -1; retryEl.style.display = 'none'; retry.prog = 0; send('retry'); }
  function openBook(){ note.open({ autoClose: Q.has('fast') ? 6 : 9, then: () => { if (session.phase === 'cause') send('next'); } }); }

  // 처음: 모두 숨겨 두고 첫 의뢰를 연다 → appear 효과가 기구를 선반·실험대에 놓는다
  for (const it of items.values()) { goHome(it, true); it.root.visible = false; it.loc = 'hidden'; }
  apply(session.start());
  stage.onTick(update);

  // ── 자동 한 판·확인용 손잡이(화면 비율 좌표)
  const scr = v => { const p = stage.project(v); return { x: p.x, y: p.y }; };
  const api = {
    session, items, bridge, note, cards, hs, exp, spots, ASSIST, placeholders, sound, get view(){ return V; },
    screenOf(id, part = 'grip'){ if (id === 'pump') return scr(pumpGripWorld(_a)); if (id === 'valve') return scr(knob.getWorldPosition(_a)); if (id === 'needle') return scr(needle.getWorldPosition(_a));
      const it = items.get(id); if (!it) return null; if (part === 'grip') return scr(it.root.position); lowOf(it, _low); return scr(_a.set(_low.cx, part === 'low' ? _low.minY : part === 'top' ? _low.maxY : _low.cy, _low.cz)); },
    world(id){ const it = items.get(id); if (!it) return null; lowOf(it, _low); return new THREE.Vector3(_low.cx, _low.cy, _low.cz); },
    pumpScreen(){ pumpScreens(); return { bot: scr(pumpBot), top: scr(pumpTop), h: pumpH }; },
    fitCheck(id){ const it = items.get(id), vis = it && it.vis, bell = V.bell && items.get(V.bell); if (!vis || !vis.b0 || !bell) return null; const IN = (bell.meta.extras && bell.meta.extras.inner) || { r: .1115, h: .2635 };
      it.root.updateMatrixWorld(true); bell.root.updateMatrixWorld(true); const b = meshBoxWorld(vis, new THREE.Box3()), bb = new THREE.Box3().setFromObject(bell.model || bell.root), c = bb.getCenter(new THREE.Vector3());
      const rr = Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 2, dc = Math.hypot((b.min.x + b.max.x) / 2 - c.x, (b.min.z + b.max.z) / 2 - c.z);
      return { sideMm: Math.round((dc + rr - IN.r) * 1000), topMm: Math.round((b.max.y - (bb.min.y + IN.h)) * 1000), wMm: Math.round(rr * 2000), hMm: Math.round((b.max.y - b.min.y) * 1000) }; },
    seatScreen(){ return scr(seat0); }, retryScreen(){ if (!retry.on) return null; const r = retryEl.getBoundingClientRect(); return { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }; }, get retryOn(){ return retry.on; }, bellSeatScreen(){ return scr(bellSeat); }, frontScreen(){ return scr(frontSpot.pos); },
    spotScreen(name, dy = 0){ const sp = spotOf.get(name); return sp ? scr(_a.copy(sp.pos).add(_b.set(0, dy, 0))) : null; },
    heldBy(i){ return hs[i].held ? hs[i].held.id : hs[i].ctl; }, loc(id){ const it = items.get(id); return it ? it.loc : null; },
    get pumpH(){ return pumpH; }, get missionOver(){ return missionOver; }, get causeOn(){ return note.causeOn; }, get bookOpen(){ return note.isOpen; },
    debugItems(){ const out = []; for (const it of items.values()) { if (!visible(it)) continue; lowOf(it, _low); out.push(`${it.id}:${it.loc}${it.anim && it.anim.on ? '(anim)' : ''}:${_low.minY.toFixed(2)}`); } return out.join(' '); },
    debugWhy(){ const f = v => v == null ? '-' : (+v).toFixed(3); const H = input.hands[0], st = hs[0];
      return `컷${stage.cut}${stage.camMoving ? '(움직임)' : ''} 손(${f(H.x)},${f(H.y)},${H.grab ? '쥠' : '폄'}${H.present ? '' : ',없음'}) 쥔것:${st.held ? st.held.id : st.ctl || '-'} 밝음:${st.hover ? (st.hover.id || '') + '/' + (st.hoverCtl || '') : '-'} 붙을곳:${st.target ? st.target.kind + ':' + (st.target.spot ? st.target.spot.name : '') : '-'} p${f(V.p)} 종:${V.bell || '-'} 밸브${f(V.valve)} 받침판:${V.plate.join('+')} 예상:${V.mission ? V.mission.predicted : '-'} 단계:${V.phase} 펌프${f(pumpH)}`; },
  };
  return api;
}
