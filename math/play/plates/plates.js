/* 같은 접시 틀 「둘씩 한 접시」(3D, T11) — 부둣가 밥집. 주문 쪽지 셋이 줄에 한꺼번에 걸리고, 접시 더미를 누를 때마다 물고기가 같은 수씩 올라간 접시가 한 장씩 깔린다.
 * 손이 다르다: 낱개를 하나씩 세어 담지 않는다. 같은 묶음을 통째로 여러 번 놓는다 — 탁 · 탁 · 탁(같은 손을 되풀이) → 쫙(한꺼번에 세어짐).
 * 설계: 핸드오프 kedu/math-play-work/T11_같은접시_틀.md · 정본 kmotion/math-wizard/27_수학놀이터_내용지도와_틀_설계_v1.md(4 · 5절 · 5-9 · 5-10 · 5-11). 규칙 = ./rules.js(화면 없음).
 * 한 나들이 = 낱칸 하나(D06 짝수와 홀수 · J01 묶어 세기) · 판 = 문제 셋(쪽지 셋) · 나들이 = 판 셋.
 *   D06 ① 통에 2~10 → 둘씩 놓기 → 통이 비면 저절로 닫힘(남는 것 없으면 접시들이 반짝 · 하나가 혼자면 그 접시만 깜박) ② 통에 1~20 + 수 팻말 · 「14는 ?」 + 낱말 카드 둘 — 바로 고르거나 놓아 보다가 고름 → 쫙.
 *   J01 ① 흐린 접시 자리 · 뛰어 세는 수(2 · 4 · 6 · 8) · 다 차면 종이 흔들림 ② 자리 표시 없음 · 스스로 맞춰 놓고 종(모자람 · 많음) → 「2씩 4묶음은 ?」 수 셋 → 쫙(2 · 4 · 6 · 8 이 차례로 번쩍).
 * 사건(rules.js events): 쌓이는 주문(시계 · 생각하는 동안에만) · 미끄러지는 접시(J01) · 냄새 맡은 강아지 · 금테 쪽지 · 빈 접시 먼저(통과 뒤) · 척척. 사건은 수를 바꾸지 않는다.
 * 누름에는 늘 답이 있다(5-11). 소리는 common/tell.js — 없으면 조용히 넘어간다. 그림은 기성 3D 재료만(./assets · 이름표 ./art.js) — 화면 위 표시(띠 · 카드 · 쪽지 · 수 팻말 · 찍힌 수 · 구슬 · 등불)만 코드로. */
import { createStage, THREE, CALM, LITE, sleep } from '../common/stage3d.js?v=2';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as A from '../common/ask.js?v=2';
import * as C from '../common/choose.js?v=6';
import * as H from '../common/hint.js?v=5';
import { wallet, audio, tone, confetti, grew } from '../common/kit.js?v=8';
import { art } from '../common/art.js?v=11';
import * as E from '../common/ends.js?v=2';
import * as M from '../common/map.js?v=13';
import * as TL from '../common/tell.js?v=2';
import { UNIT } from '../common/say.js?v=6';
import { nextHere, href } from '../go/next.js?v=1';
import * as R from './rules.js?v=1';
import { ASSETS, MODEL, SCENERY, SCENERY_NAMES, WOOD, GHOST, GLOW, ICON } from './art.js?v=1';

// ── 내가 정한 수치(화면 · 움직임 — 준호가 보고 바꾼다). 문제 · 사건 · 시계 수치는 ./rules.js 의 T
const T = { DECK: .45, TOP_H: .42, PH: .05, PILE_N: 5, PILE_DY: .15, CAP: 64, SMOOTH: 11, PLACE_MS: 300, BACK_MS: 280, OUT_MS: 650, HANG_MS: 150, HOP_MS: 380, GLINT_MS: 1300, READ_MS: 1700, MISS_HOLD: 1600, NEAR_MS: 1300,
  TELL_GRACE: 4, BELL_WOB: 1.3, SLIDE_DIST: .62, BIG: 1.12, NOTES_H: { wide: 104, tall: 90, low: 70 },
  FISH: { 1: .3, 2: .25, 5: .17 }, OFF: { 2: [[0, -.13], [0, .13]], 5: [[-.15, -.12], [.15, -.12], [0, 0], [-.15, .12], [.15, .12]], 1: [[0, 0]] }, TUB_FISH: { wide: .25, tall: .2 },
  WIDE: { fov: 34, el: 1.06, sp: .76, pd: .64, area: [.55, 0], table: [-3.75, 3.6, -.85, .95], pile: [-2.05, 0, 1], bell: [3.05, 0, 1], tub: [-3.15, 0, 1], tubWD: [.95, 1.25], cook: [-1.85, -1.45], stand: [1.9, -2.9], dog: [3.2, -1.15], dogOut: [6.4, -1.15], counter: null,
    fit: [[-3.75, 0, -.9], [3.6, 0, -.9], [3.6, 0, 1.0], [-3.75, 0, 1.0], [-3.75, .6, -1.0]] },
  TALL: { fov: 44, el: 1.15, sp: .77, pd: .68, area: [0, -.05], table: [-2.03, 2.03, -.84, .8], pile: [-1.3, 1.5, 1], bell: [1.38, 1.5, 1], tub: [.02, 1.5, 1], tubWD: [1.12, .78], cook: [-1.6, -1.45], stand: [.4, -2.5], dog: [1.55, -1.3], dogOut: [3.8, -1.3], counter: [-2.03, 2.03, 1.06, 1.96],
    fit: [[-2.03, 0, -.86], [2.03, 0, -.86], [2.03, 0, 1.98], [-2.03, 0, 1.98]] } };
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const GO = '/math/play/go/';
const WANT = Q.get('cell'), GO_NOW = !WANT || !R.CELLS[WANT];   /* ?cell= 없이 열리면 모형을 불러오기 전에 고르는 화면으로 */
if (GO_NOW) location.replace(GO);
const S = { ready: false, oid: 0, cell: WANT, p: null, w: null, res: null, step: 2, ev: {}, ctx: {}, board: null, phase: 'idle', busy: true, active: false, done: null,
  t: 0, lastNow: 0, lastAct: 0, streak: 0, back: false, goldCarry: false, hist: {}, carry: {}, log: [], q: [], tall: false, low: false, tellOn: false, tellT: 0, handTo: null, handFn: null,
  pls: [], fish: [], ords: [], ord: 0, think: 0, dog: null, slide: null, cardT0: 0, icons: [], said: [], lid: false, bare: false, wobT: 0, choosingOn: false };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [18, 56], shadow: { left: -7, right: 7, top: 6, bottom: -6 }, assets: ASSETS }), { scene, camera } = stage;
const K = {};
const NAMES = [...new Set([...Object.values(MODEL), ...SCENERY_NAMES])];
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const L = () => S.tall ? T.TALL : T.WIDE;
const TOP = () => T.DECK + T.TOP_H;
const snd = (...a) => { if (TL.on()) tone(...a); };   /* 효과음도 소리 단추(tell.js) 하나로 같이 끈다 */
const say = text => { S.said.push(text); TL.say(text); };
const cook = (name, ms = 1500) => { if (!S.cook) return; stage.play(S.cook, name, true); clearTimeout(S.cookT); S.cookT = setTimeout(() => stage.play(S.cook, 'Idle'), ms); };

// ── 짓기
let DK = null, fishIM = null, PLATE = null, FISHG = null;
const mats = {};
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpS = new THREE.Vector3();
function sizeOf(o){ const b = new THREE.Box3().setFromObject(o); return { s: b.getSize(V3()), b }; }
/** 물고기 모형(뼈대 있는 모형)을 쉬는 꼴 그대로 한 덩이로 굳혀 옆으로 눕힌다 → 길이 1 이 x 를 따라 · 바닥이 0 · 재료마다 무리(groups). 인스턴스 하나로 여럿을 그린다. */
function bakeFish(rig){ const parts = new Map(), v = V3(0, 0, 0), n = V3(0, 0, 0), nm = new THREE.Matrix3(), list = []; rig.scene.updateMatrixWorld(true); let uvAll = true;
  rig.scene.traverse(m => { if (m.isMesh && m.geometry && m.geometry.attributes.position) { list.push(m); if (!m.geometry.attributes.uv) uvAll = false; } });
  for (const m of list) { if (m.isSkinnedMesh && m.skeleton) m.skeleton.update(); const g = m.geometry, pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, cnt = pos.count, P = new Float32Array(cnt * 3), N = new Float32Array(cnt * 3), U = new Float32Array(cnt * 2); nm.getNormalMatrix(m.matrixWorld);
    for (let i = 0; i < cnt; i++) { if (m.isSkinnedMesh) m.getVertexPosition(i, v); else v.fromBufferAttribute(pos, i); v.applyMatrix4(m.matrixWorld); P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z;
      if (nor) { n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize(); N[i * 3] = n.x; N[i * 3 + 1] = n.y; N[i * 3 + 2] = n.z; } if (uv) { U[i * 2] = uv.getX(i); U[i * 2 + 1] = uv.getY(i); } }   /* 쉬는 꼴 그대로(뼈대를 입힌 자리) · 정수로 눌러 담긴 자리값도 실수로 풀어 둔다 */
    let ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.BufferAttribute(P, 3)); if (nor) ng.setAttribute('normal', new THREE.BufferAttribute(N, 3)); if (uvAll && uv) ng.setAttribute('uv', new THREE.BufferAttribute(U, 2)); if (g.index) { ng.setIndex(Array.from(g.index.array)); ng = ng.toNonIndexed(); } if (!nor) ng.computeVertexNormals();
    const mat = Array.isArray(m.material) ? m.material[0] : m.material, k = mat.name || mat.uuid; if (!parts.has(k)) parts.set(k, { mat, geos: [] }); parts.get(k).geos.push(ng); }
  const keys = [...parts.keys()], merged = keys.map(k => mergeGeometries(parts.get(k).geos, false)), all = mergeGeometries(merged, true);
  all.computeBoundingBox(); let b = all.boundingBox, s = b.getSize(V3()), c = b.getCenter(V3()); all.translate(-c.x, -c.y, -c.z);
  if (s.x > s.z) all.rotateY(Math.PI / 2);   /* 길이를 z 로 */ all.rotateZ(Math.PI / 2); all.rotateY(Math.PI / 2);   /* 옆으로 눕히고 · 길이를 x 로 */
  all.computeBoundingBox(); b = all.boundingBox; s = b.getSize(V3()); c = b.getCenter(V3()); all.translate(-c.x, -b.min.y, -c.z); const k = 1 / Math.max(.001, s.x); all.scale(k, k, k); all.computeVertexNormals();   /* 낮은 면 모형 그대로 면마다 빛(뼈대 돌림이 빠진 옛 법선을 쓰지 않게) */
  const ms = keys.map(k2 => { const x = parts.get(k2).mat.clone(); if (!uvAll) x.map = null; x.side = THREE.DoubleSide; if (x.emissive && x.color) { x.emissive.copy(x.color); x.emissiveIntensity = .32; } return x; });   /* 작은 접시 위에서도 물고기 빛깔이 살게 조금 밝힘 */ return { geo: all, mats: ms, h: s.y * k, w: s.z * k }; }
/** 접시 모형 한 장(지름 1 · 바닥 0 · 빛깔은 따로 — 반짝임 · 흐린 자리). */
function plateMesh(mat){ const o = K[MODEL.plate].scene.clone(), sz = sizeOf(o), k = 1 / Math.max(sz.s.x, sz.s.z); o.scale.multiplyScalar(k); const b2 = sizeOf(o).b; o.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2); const g = new THREE.Group(); g.add(o);
  o.traverse(m => { if (m.isMesh) { m.material = mat || m.material.clone(); m.castShadow = !LITE; m.receiveShadow = true; } }); scene.add(g); return g; }
function planks(group, x0, x1, z0, z1, y, mat, th = .7){ const W = x1 - x0, D = z1 - z0, n = Math.max(2, Math.round(D / DK.pwid)), st = D / n; for (let k = 0; k < n; k++) { const m = new THREE.Mesh(DK.planks[k % DK.planks.length], mat); m.rotation.y = Math.PI / 2; m.scale.set(st / DK.pwid * 1.03, th, W / DK.plen); m.position.set((x0 + x1) / 2, y, z0 + st * (k + .5)); m.castShadow = !LITE; m.receiveShadow = true; group.add(m); } }
function wallPlank(group, len, x, z, along, h, y, mat){ const m = new THREE.Mesh(DK.planks[1], mat); if (along === 'x') m.rotation.set(0, Math.PI / 2, Math.PI / 2); else m.rotation.set(0, 0, Math.PI / 2); m.scale.set(h / DK.pwid, 1.2, len / DK.plen); m.position.set(x, y + h / 2, z); m.castShadow = !LITE; group.add(m); return m; }
/** 탁자(윗판 + 앞판 + 다리) 한 벌. */
function table(x0, x1, z0, z1){ const g = new THREE.Group(); planks(g, x0, x1, z0, z1, TOP() - DK.pth / 2, mats.top); wallPlank(g, x1 - x0, (x0 + x1) / 2, z1 + .02, 'x', T.TOP_H - .02, T.DECK, mats.skirt);
  const ps = sizeOf(K[MODEL.pole].scene), ph = ps.s.y, pd = Math.max(ps.s.x, ps.s.z); for (const x of [x0 + .15, x1 - .15]) { const o = K[MODEL.pole].scene.clone(); o.scale.set(.12 / pd, T.TOP_H / ph, .12 / pd); o.position.set(x, T.DECK, z0 + .15); g.add(stage.shadows(o)); } scene.add(g); return g; }
function build(){ return Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); })).then(() => {
  DK = stage.dockKit(K[MODEL.dock]); { const g0 = DK.planks[0]; g0.computeBoundingBox(); const pb = g0.boundingBox; DK.plen = pb.max.z - pb.min.z; DK.pwid = pb.max.x - pb.min.x; DK.pth = pb.max.y - pb.min.y; }
  const wm = c => { const m = DK.mat.clone(); m.color.set(c); return m; }; mats.top = wm(WOOD.top); mats.skirt = wm(WOOD.skirt); mats.tub = wm(WOOD.tub); mats.lid = wm(WOOD.lid);
  mats.ghost = new THREE.MeshStandardMaterial({ color: GHOST, transparent: true, opacity: .32, depthWrite: false, roughness: .9 });
  /* 부두 바닥 두 벌(가로 · 세로 화면) */ S.floors = {}; for (const [kind, x0, x1, z0, z1] of [['WIDE', -7, 6.6, -3.2, 3.4], ['TALL', -3, 3, -4.5, 3.6]]) { const fg = new THREE.Group(); let i = 0; const n = Math.ceil((z1 - z0) / (DK.plen * .98)); for (let r = 0; r < n; r++) for (let x = x0; x <= x1; x += DK.pwid, i++) { const m = new THREE.Mesh(DK.planks[i % DK.planks.length], DK.mat); m.position.set(x, T.DECK - DK.pth / 2 - .01, z0 + DK.plen * .98 * (r + .5)); m.receiveShadow = true; fg.add(m); } scene.add(fg); S.floors[kind] = fg; }
  S.scen = {}; for (const kind of ['WIDE', 'TALL']) S.scen[kind] = SCENERY[kind].map(([n, x, y, z, s, ry]) => stage.put(K[n], x, y, z, s, ry));
  /* 탁자 두 벌(세로 화면은 앞에 작은 탁자 하나 더 — 더미 · 통 · 종) */ S.tables = {}; for (const kind of ['WIDE', 'TALL']) { const l = T[kind], tb = [table(...l.table)]; if (l.counter) tb.push(table(...l.counter)); S.tables[kind] = tb; }
  /* 밥집(탁자 뒤 지붕) */ { const st = K[MODEL.stand].scene.clone(), sz = sizeOf(st).s, k = 2.3 / sz.y; st.scale.setScalar(k); const b2 = sizeOf(st).b; st.position.set(-(b2.min.x + b2.max.x) / 2, T.DECK - b2.min.y, -(b2.min.z + b2.max.z) / 2); stage.shadows(st); S.stand = new THREE.Group(); S.stand.add(st); scene.add(S.stand); S.standW = b2.max.x - b2.min.x; }
  /* 접시: 깔리는 접시 열둘 · 더미 · 흐린 자리 열 */ PLATE = []; for (let k = 0; k < 12; k++) { const g = plateMesh(); g.visible = false; PLATE.push(g); }
  S.pile = new THREE.Group(); for (let k = 0; k < T.PILE_N; k++) { const g = plateMesh(); scene.remove(g); g.position.y = k * T.PILE_DY; g.rotation.set((k % 2 ? .07 : -.05), k * .7, (k % 2 ? -.06 : .05)); g.position.x = (k % 2 ? .04 : -.04);   /* 살짝 어긋나게 쌓아 접시 테가 보이게 */ S.pile.add(g); } scene.add(S.pile);
  S.ghosts = Array.from({ length: 10 }, () => { const g = plateMesh(mats.ghost); g.visible = false; g.traverse(m => { if (m.isMesh) { m.castShadow = false; m.renderOrder = 2; } }); return g; });
  /* 물고기(인스턴스 하나) */ FISHG = bakeFish(K[MODEL.fish]); fishIM = new THREE.InstancedMesh(FISHG.geo, FISHG.mats, T.CAP); fishIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); fishIM.castShadow = !LITE; fishIM.receiveShadow = true; fishIM.frustumCulled = false; fishIM.count = 0; scene.add(fishIM);
  /* 함지(D06 의 통 — 판자 바닥 + 낮은 벽 넷) · 뚜껑 */ S.tub = new THREE.Group(); scene.add(S.tub); S.lidG = new THREE.Group(); S.tub.add(S.lidG); tubBuild();
  /* 물고기 통(J01 — 꾸밈) · 종 */ { const o = K[MODEL.bucket].scene.clone(), sz = sizeOf(o).s, k = .55 / sz.y; o.scale.setScalar(k); const b2 = sizeOf(o).b; o.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2); S.bucket = new THREE.Group(); S.bucket.add(stage.shadows(o)); scene.add(S.bucket); }
  { const o = K[MODEL.bell].scene.clone(), sz = sizeOf(o).s, k = .5 / sz.y; o.scale.setScalar(k); const b2 = sizeOf(o).b; o.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2); S.bell = new THREE.Group(); S.bellIn = new THREE.Group(); S.bellIn.add(stage.shadows(o)); S.bell.add(S.bellIn); scene.add(S.bell); }
  S.cook = stage.person(K[MODEL.cook]); stage.play(S.cook, 'Idle');
  { const dz = sizeOf(K[MODEL.dog].scene).s; S.dogP = stage.person(K[MODEL.dog], { scale: .62 / Math.max(.01, dz.y) }); S.dogP.obj.visible = false; S.dogActs = Object.keys(S.dogP.acts); }
  stage.onResize = aim; stage.resize();
  const c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); coinsDraw(); wallet.onChange(() => coinsDraw());
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
  ORD = document.createElement('div'); ORD.id = 'orders'; document.body.appendChild(ORD); ORD.addEventListener('pointerdown', onNote);
  SIGN = document.createElement('div'); SIGN.id = 'tubsign'; document.body.appendChild(SIGN); LABS = Array.from({ length: 12 }, () => { const d = document.createElement('div'); d.className = 'lab'; document.body.appendChild(d); return d; });
  TL.button();
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true; S.lastNow = performance.now();
  outing(S.cell); }); }
let ORD = null, SIGN = null, LABS = [];
function coinsDraw(pop){ const c = $('coins'); if (!c) return; const v = `${art(ICON.coin)}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; } if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }
/** 함지를 그 화면 꼴 크기로 다시 짓는다. */
function tubBuild(){ const [w, d] = L().tubWD; [...S.tub.children].forEach(o => { if (o !== S.lidG) S.tub.remove(o); }); [...S.lidG.children].forEach(o => S.lidG.remove(o));
  planks(S.tub, -w / 2, w / 2, -d / 2, d / 2, .02, mats.tub, .6); for (const [len, x, z, al] of [[w + .1, 0, -d / 2, 'x'], [w + .1, 0, d / 2, 'x'], [d, -w / 2, 0, 'z'], [d, w / 2, 0, 'z']]) wallPlank(S.tub, len, x, z, al, .13, 0, mats.tub);
  planks(S.lidG, -w / 2 - .04, w / 2 + .04, -d / 2 - .04, d / 2 + .04, 0, mats.lid, .8); S.lidG.position.y = .17; S.lidG.visible = false; S.tubWD = [w, d]; S.tubPts = null; }

// ── 자리(가로 · 세로) · 카메라
const at3 = (xz, y = TOP()) => V3(xz[0], y, xz[1]);
const spotOf = name => { const l = L(), s = l[name]; return V3(s[0], s[2] ? TOP() : T.DECK, s[1]); };
/** 탁자 위 칸 i 의 자리(다섯씩 한 줄 · 두 줄까지 · 첫 줄이 뒤). */
function slotPt(i){ const l = L(), a = l.area, s = R.slot(i); return V3(a[0] + (s.col - 2) * l.sp, TOP(), a[1] + (s.row - .5) * l.sp * .95); }
const pd = () => L().pd * (S.ctx && S.ctx.last ? T.BIG : 1);
function layout(){ const l = L(); for (const k of ['WIDE', 'TALL']) { const on = (k === 'TALL') === S.tall; S.floors[k].visible = on; S.scen[k].forEach(o => { o.visible = on; }); S.tables[k].forEach(o => { o.visible = on; }); }
  S.stand.position.set(l.stand[0], 0, l.stand[1]); S.stand.scale.setScalar(S.tall ? .62 : .72); const pp = spotOf('pile'); S.pile.position.copy(pp); S.pile.scale.setScalar(l.pd);
  if (!S.tubWD || S.tubWD[0] !== l.tubWD[0]) tubBuild(); const tp = spotOf('tub'); S.tub.position.copy(tp); S.bucket.position.copy(tp); const bp = spotOf('bell'); S.bell.position.copy(bp);
  S.cook.obj.position.set(l.cook[0], T.DECK + .02, l.cook[1]); S.cook.obj.rotation.y = S.tall ? Math.PI * .85 : Math.PI * .3;
  S.ghosts.forEach((g, i) => { g.position.copy(slotPt(i)); g.scale.setScalar(pd()); }); if (S.dog) dogPlace(); }
function topUI(){ const ch = $('choose'), tr = $('tray'), on = tr && tr.classList.contains('on'); if (ch && ch.classList.contains('on')) return ch.getBoundingClientRect().bottom + 8;
  const tb = on ? tr.getBoundingClientRect().bottom : (S.low ? 46 : S.tall ? 104 : 112); return tb + (S.low ? 6 : C.GAP + (S.tall ? 112 : 130)) + 6; }   /* 카드 자리를 미리 비워 둔다(뜰 때 세계가 뛰지 않게) */
const notesH = () => S.low ? T.NOTES_H.low : S.tall ? T.NOTES_H.tall : T.NOTES_H.wide;
function aim(w = innerWidth, h = innerHeight){ const tall = h > w * 1.05; S.tall = tall; S.low = !tall && h < 560; const l = L(); camera.fov = l.fov; camera.aspect = w / h; layout();
  const ui = topUI(), top = ui + notesH(), bot = h - (tall ? 118 : 20), mx = tall ? 10 : 24, fit = l.fit, cx = (l.table[0] + l.table[1]) / 2, cz = (fit.reduce((s, p) => s + p[2], 0)) / fit.length; S.topUI = ui;
  let dist = 9; for (let it = 0; it < 14; it++) { camera.position.set(cx, T.DECK + dist * Math.sin(l.el), cz + dist * Math.cos(l.el)); camera.lookAt(cx, T.DECK, cz); camera.clearViewOffset(); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const pts = fit.map(([x, y, z]) => V3(x, TOP() + y, z).project(camera)).map(v => ({ x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * h })), x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x)), y0 = Math.min(...pts.map(p => p.y)), y1 = Math.max(...pts.map(p => p.y));
    const k = Math.max((x1 - x0) / (w - 2 * mx), (y1 - y0) / Math.max(80, bot - top)); if (Math.abs(k - 1) > .02 && it < 13) { dist *= k; continue; }
    const dy = (top + bot) / 2 - (y0 + y1) / 2, dx = w / 2 - (x0 + x1) / 2; camera.setViewOffset(w, h, -dx, -dy, w, h); camera.updateProjectionMatrix(); break; }
  placeUI(); const tl = $('tell'); if (tl && tl.classList.contains('on')) tellPlace(); }
function reaim(){ if (Math.abs(topUI() - S.topUI) > 4) aim(); }
function placeUI(){ if (ORD) { ORD.style.left = (innerWidth / 2) + 'px'; ORD.style.top = (S.topUI + notesH() / 2) + 'px'; } if (S.choosingOn) C.place(); signPlace(); }

// ── 띠 · 쪽지 · 수 팻말 · 찍힌 수(화면 위)
function trayDraw(closed = false, run = null){ let t = $('tray'); if (!t) { A.trayClear(); t = $('tray'); } if (!S.p) { A.trayClear(); return; } const parts = R.band(S.p, run), b = (v, c = '') => `<b class="${c}">${v}</b>`, w = s => `<i class="w">${s}</i>`;
  const html = parts.map(x => x.n != null ? b(x.n) : x.w != null ? w(x.w) : closed ? b(x.hole, 'done') : x.run != null ? b(x.run, 'run') : b('?', 'hole')).join('');
  if (t.dataset.v !== html || !t.classList.contains('on')) { const same = t.dataset.skel === (closed ? 'c' : 'o') && t.classList.contains('on') && run != null; const rb = t.querySelector('b.run'); if (same && rb && !closed) { rb.textContent = run; rb.classList.remove('tick'); void rb.offsetWidth; rb.classList.add('tick'); } else t.innerHTML = html; t.dataset.v = html; t.dataset.skel = closed ? 'c' : 'o'; }   /* 뛰어 세는 수만 바꾼다(띠 전체가 다시 튀지 않게) */
  t.className = 'on'; C.ask(!closed && S.choosingOn); trayFit(); S.trayText = R.bandText(parts, closed); }
function trayFit(){ const t = $('tray'); t.style.fontSize = ''; const room = innerWidth * .96; if (t.offsetWidth > room) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room / t.offsetWidth) + 'px'; }
/** 쪽지 그림의 작은 접시(물고기 = 점 · 둘은 나란히 · 다섯은 주사위 꼴). */
const DICE = { 1: [[50, 50]], 2: [[34, 50], [66, 50]], 5: [[28, 30], [72, 30], [50, 50], [28, 70], [72, 70]] };
export const npHtml = (k, big = false) => `<span class="np${big ? ' big' : ''}">${(DICE[k] || []).map(([x, y]) => `<u style="left:${x}%;top:${y}%"></u>`).join('')}</span>`;
function noteHtml(o){ if (o.more) return npHtml(o.g || 2); const p = o.p; return p.N != null ? `<b class="num">${p.N}</b>${npHtml(2)}` : `${npHtml(p.g, true)}<span class="cnt2">${p.n}${UNIT.plate}</span>`; }
function notesDraw(){ const keep = new Set(S.ords.map(o => o.el).filter(Boolean)); [...ORD.children].forEach(e => { if (!keep.has(e)) e.remove(); });   /* 이미 걸린 쪽지는 그대로(새로 걸린 것만 들어오는 몸짓 — 줄 전체가 다시 깜박이지 않게) */
  S.ords.forEach((o, i) => { let d = o.el; if (!d) { d = document.createElement('div'); d.innerHTML = noteHtml(o); d._o = o; o.el = d; d.classList.add('in'); d.style.animationDelay = (o.delay || 0) + 's'; o.delay = 0; d.addEventListener('animationend', ev => { if (ev.animationName === 'ordin') d.classList.remove('in'); }); }
    const cls = 'ord' + (d.classList.contains('in') ? ' in' : '') + (i === 0 && !o.more ? ' cur' : '') + (o.gold ? ' gold' : '') + (o.more ? ' more' : ''); if (d.className !== cls && !d.classList.contains('wig')) d.className = cls; else if (d.classList.contains('wig')) { d.classList.toggle('cur', i === 0 && !o.more); }
    if (ORD.children[i] !== d) ORD.insertBefore(d, ORD.children[i] || null); }); ORD.classList.toggle('on', S.ords.length > 0); placeUI(); }
/** 판이 시작되면 쪽지 셋이 한꺼번에 걸린다. */
async function hangBoard(list, goldJ){ const my = S.oid; S.ords = list.map((p, j) => ({ p, gold: j === goldJ, delay: j * T.HANG_MS / 1000 })); notesDraw(); snd(520, .05, 'triangle', .04); snd(600, .05, 'triangle', .04, .15); snd(680, .05, 'triangle', .04, .3); await sleep(T.HANG_MS * list.length + 380); return S.oid === my; }
/** 맨 앞 쪽지가 떼어진다(끝낸 문제) · 쌓인 쪽지(시계의 그림)는 걷힌다. */
async function tearFront(){ const o = S.ords.find(x => !x.more); if (!o) return; o.el && o.el.classList.add('torn'); snd(700, .06, 'triangle', .05); await sleep(380); S.ords = S.ords.filter(x => x !== o && !x.more); notesDraw(); ORD.classList.remove('shake'); }
/** 맨 앞 쪽지가 바람에 넘어가 줄 맨 뒤에 다시 걸린다(놓침 · 두 문제 뒤에 다시). */
async function blowFront(){ const o = S.ords.find(x => !x.more); if (!o) return; o.el && o.el.classList.add('blow'); snd(260, .3, 'sine', .05, 0, 160); await sleep(450); S.ords = [...S.ords.filter(x => x !== o && !x.more), { ...o, gold: false, blown: true, el: null }]; notesDraw(); ORD.classList.remove('shake'); }
function signShow(on){ SIGN.classList.toggle('on', !!on); if (!on) return; SIGN.innerHTML = `<b>${S.p.N}</b>`; signPlace(); }   /* 수 팻말(나무 팻말 — 화면 위 그림 · 두 자리까지) */
function signPlace(){ if (!SIGN || !SIGN.classList.contains('on')) return; const [w, d] = S.tubWD, q = stage.screenOf(S.tub.position.clone().add(V3(S.tall ? w / 2 + .05 : 0, .25, S.tall ? 0 : -d / 2))); SIGN.style.left = (S.tall ? q.x + 30 : q.x) + 'px'; SIGN.style.top = q.y + 'px'; }
function labOn(i, text, pl, cls = ''){ const d = LABS[i]; if (!d) return; d.textContent = text; d.className = 'lab on ' + cls; d._pl = pl; labPlace(d); }
function labsOff(){ LABS.forEach(d => { d.className = 'lab'; d._pl = null; }); }
function labPlace(d){ const pl = d._pl; if (!pl || !pl.p) return; const q = stage.screenOf(pl.p.clone().add(V3(0, .22 + (pl.hop || 0), -pd() * .3))); d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; }

// ── 접시 · 물고기(자리는 상태에서 셈한다 — 접시 = 칸 · 물고기 = 접시 위 · 함지 속)
function tubPts(N){ const [w, d] = S.tubWD, L0 = S.tall ? T.TUB_FISH.tall : T.TUB_FISH.wide, out = []; let dmin = L0 * .95;
  for (let tries = 0; out.length < N && tries < 4000; tries++) { if (tries && tries % 600 === 0) dmin *= .9; const x = (Math.random() - .5) * (w - L0 - .1), z = (Math.random() - .5) * (d - L0 * .6 - .1); if (out.every(p => Math.hypot(p.x - x, (p.z - z) * 1.6) > dmin)) out.push({ x, z, ry: Math.random() * Math.PI * 2 }); }
  while (out.length < N) out.push({ x: (Math.random() - .5) * (w - .3), z: (Math.random() - .5) * (d - .2), ry: Math.random() * 6 }); return out; }   /* 통 속에서 줄 맞추지 않는다 */
function plateRec(i, k){ const o = PLATE.find(g => !S.pls.some(p => p.o === g) && !g.visible) || PLATE.find(g => !S.pls.some(p => p.o === g)); S.gone = (S.gone || []).filter(r => r.o !== o); o.visible = true; o.scale.setScalar(pd()); glowSet(o, 0);
  const rec = { o, k, p: S.pile.position.clone().add(V3(0, T.PILE_N * T.PILE_DY * L().pd, 0)), fly: null, hop: 0, slideK: 0, out: false, big: 1 }; return rec; }
function glowSet(o, v){ o.traverse(m => { if (m.isMesh && m.material && m.material !== mats.ghost) { m.material.emissive = m.material.emissive || new THREE.Color(); m.material.emissive.set(GLOW); m.material.emissiveIntensity = v; } }); }
/** 접시 한 장을 더미에서 칸 i 로(k 마리 · D06 은 함지의 물고기가 · J01 은 통에서 물고기가 날아와 앉는다). */
function addPlate(k){ const rec = plateRec(S.pls.length, k), ms = T.PLACE_MS * (1 - .12 * Math.min(S.streak, 3)); rec.fly = { from: rec.p.clone(), t0: S.t, ms }; S.pls.push(rec);
  if (S.p.N != null) { const tub = S.fish.filter(f => f.where === 'tub'); for (let j = 0; j < k; j++) { const f = tub[tub.length - 1 - j]; if (f) { f.where = 'plate'; f.pl = rec; f.j = j; } } }
  else if (!S.bare) for (let j = 0; j < k; j++) S.fish.push({ where: 'plate', pl: rec, j, p: S.bucket.position.clone().add(V3(0, .5, 0)) });
  return rec; }
/** 깔린 접시 i 를 더미로(D06 물고기는 함지로 · J01 물고기는 통으로). */
function backPlate(i){ const rec = S.pls[i]; if (!rec) return; S.pls.splice(i, 1); rec.out = 'pile'; rec.fly = { from: rec.p.clone(), t0: S.t, ms: T.BACK_MS, to: S.pile.position.clone().add(V3(0, T.PILE_N * T.PILE_DY * L().pd, 0)), done: () => { rec.o.visible = false; } }; S.gone = (S.gone || []).concat(rec);
  for (const f of S.fish) if (f.pl === rec) { if (S.p.N != null) { f.where = 'tub'; f.pl = null; } else { f.where = 'bucket'; f.pl = null; } } }
function plateTarget(rec, i){ if (rec.fly && rec.fly.to) return rec.fly.to; const s = slotPt(i); if (rec.slideK) { const l = L(), dir = S.tall ? V3(0, 0, 1) : V3(0, 0, 1); s.add(dir.multiplyScalar(rec.slideK * T.SLIDE_DIST)); void l; } return s; }
function platesTick(rdt){ const all = [...S.pls.map((r, i) => [r, i]), ...(S.gone || []).map(r => [r, -1])];
  for (const [rec, i] of all) { const to = i >= 0 ? plateTarget(rec, i) : (rec.fly && rec.fly.to) || rec.p.clone();
    if (rec.fly) { const f = rec.fly, u = Math.min(1, (S.t - f.t0) * 1000 / f.ms), e = u * (2 - u); rec.p = f.from.clone().lerp(to, e); rec.p.y += Math.sin(u * Math.PI) * .45; if (u >= 1) { rec.fly = null; if (f.done) f.done(); } }
    else if (rec.out === 'serve') { rec.p.x += rdt * 6; }
    else rec.p.lerp(to, 1 - Math.exp(-rdt * T.SMOOTH));
    rec.o.position.set(rec.p.x, rec.p.y + (rec.hop || 0), rec.p.z); rec.o.scale.setScalar(pd() * (rec.big || 1)); rec.o.rotation.y = rec.slideK ? Math.sin(S.t * 14) * .12 : 0; }
  if (S.gone) S.gone = S.gone.filter(r => { const keep = r.fly || (r.out === 'serve' && r.p.x < 9); if (!keep && r.out === 'serve') r.o.visible = false; return keep; }); }
/** 물고기 자리(접시 위 = 둘은 나란히 · 다섯은 주사위 꼴 · 하나는 가운데 / 함지 속 = 흩어짐 / 통으로 돌아감). */
function fishTarget(f){ if (f.where === 'plate' && f.pl) { const k = f.pl.k, off = (T.OFF[k] || T.OFF[2])[f.j] || [0, 0], s = pd() * (f.pl.big || 1) / .64; return { pos: f.pl.o.position.clone().add(V3(off[0] * s, T.PH * s + .005, off[1] * s)), L: T.FISH[k] * s, ry: 0 }; }
  if (f.where === 'tub') { if (!S.tubPts) S.tubPts = tubPts(S.p && S.p.N != null ? S.p.N : 20); const t = S.tubPts[f.tp % S.tubPts.length]; return { pos: S.tub.position.clone().add(V3(t.x, .07, t.z)), L: S.tall ? T.TUB_FISH.tall : T.TUB_FISH.wide, ry: t.ry, hide: S.lid }; }
  return { pos: S.bucket.position.clone().add(V3(0, .45, 0)), L: .12, ry: 0, hide: true }; }
function fishTick(rdt){ if (!fishIM) return; let k = 0; for (const f of S.fish) { const tg = fishTarget(f); if (!f.p) f.p = tg.pos.clone(); else f.p.lerp(tg.pos, 1 - Math.exp(-rdt * (f.where === 'plate' ? 14 : 9)));
    if (f.where === 'bucket' && f.p.distanceTo(tg.pos) < .15) { f.where = 'gone'; continue; } if (f.where === 'gone' || tg.hide || k >= T.CAP) continue;
    f.L = f.L == null ? tg.L : f.L + (tg.L - f.L) * (1 - Math.exp(-rdt * 10)); const ry = f.where === 'plate' ? (f.pl && f.pl.alone ? Math.sin(S.t * 3.2) * .55 : f.pl && f.pl.k === 5 ? .35 : 0) : tg.ry;   /* 혼자 남은 물고기는 옆 자리를 두리번 */ tmpE.set(0, ry, 0); tmpQ.setFromEuler(tmpE); tmpS.set(f.L, f.L, f.L);
    tmpM.compose(V3(f.p.x, f.p.y + (f.where === 'plate' && f.pl ? f.pl.hop || 0 : 0), f.p.z), tmpQ, tmpS); fishIM.setMatrixAt(k++, tmpM); }
  S.fish = S.fish.filter(f => f.where !== 'gone'); fishIM.count = k; fishIM.instanceMatrix.needsUpdate = true; }
function ghostsDraw(){ const n = S.p && S.p.n != null ? S.p.n : 0, guide = S.p && S.p.n != null && S.step === 1 && S.phase === 'place', blink = S.blinkT && S.t < S.blinkT, on = Math.floor((S.blinkT - S.t) * 5) % 2 === 0;
  S.ghosts.forEach((g, i) => { const show = (guide || (blink && on)) && i < n && i >= S.pls.length; g.visible = !!show; if (show) { g.position.copy(slotPt(i)); g.scale.setScalar(pd()); } }); mats.ghost.opacity = blink ? .62 : .32; }

// ── 한 문제
async function runProblem(p, ctx){ const my = S.oid; S.p = p; S.ctx = ctx; S.w = R.world(p); S.res = { short: 0, over: 0, retreat: false, hinted: false, missed: false, nudges: 0, caught: 0, dog: 0, slid: 0, placed: 0 }; S.phase = 'set'; S.busy = true; S.active = false;
  S.handTo = null; S.handFn = null; S.tellOn = false; S.ord = 0; S.think = 0; S.blinkT = 0; S.wobT = 0; S.bare = !!ctx.bare; S.lid = S.bare && p.N != null; S.w.lid = S.lid; S.added = 0; S.choosingOn = false; S.trayText = '';
  C.hide(); labsOff(); H.hide(); A.trayClear(); signShow(false); clearTable(); S.fish = [];
  const D = p.N != null; S.tub.visible = D; S.bucket.visible = !D; S.bell.visible = !D; S.lidG.visible = S.lid; S.lidG.position.y = .17; S.tubPts = null;
  if (D) { S.tubPts = tubPts(p.N); for (let k = 0; k < p.N; k++) S.fish.push({ where: 'tub', tp: k, p: null }); }
  layout(); reaim();
  S.dog = null; S.dogPlan = ctx.dogAt != null ? { at: ctx.dogAt } : null; S.slidePlan = ctx.slideAt != null ? { at: ctx.slideAt } : null;
  S.log.push({ start: R.key(p), cell: p.cell, step: S.step, n: p.N != null ? p.N : p.g * p.n, g: p.g, plates: p.n, bare: S.bare, gold: !!ctx.gold, ev: Object.keys(ctx.ev).filter(k => ctx.ev[k] === true).join(' ') });
  /* 띠 · 카드 · 수 팻말: D06 ① 띠만 · ② 띠 + 낱말 카드(처음부터) + 수 팻말 / J01 ① 띠(뛰어 세는 수가 「?」 칸에) · ② 띠 없음(종이 맞으면 띠 + 수 셋) */
  if (D) { trayDraw(); if (S.step === 2) { signShow(true); C.show(S.forceCards || R.cards(p), onPick, { words: true }); S.forceCards = null; S.choosingOn = true; S.cardT0 = S.t; C.place(); C.ask(true); } }
  else if (S.step === 1) trayDraw(false, null);
  reaim(); S.phase = 'place'; S.busy = false; S.active = true; S.lastAct = S.t; S.lastNow = performance.now();
  if (ctx.tell && H.tell(ctx.tell.key, S.lid ? LID_LINE : ctx.tell.text, ctx.tell.opt)) {   /* 뚜껑 문제면 그 꼴의 말(놓아 볼 수 없다) */ S.tellOn = true; S.tellT = S.t; tellPlace(); S.lastAct = S.t + T.TELL_GRACE; }   /* 쪽지가 다 걸린 뒤에 띄운다 */
  const out = await new Promise(res => { S.done = res; }); S.active = false; S.done = null; H.hide(); dogAway(true); slideEnd(false);
  const r = { ...S.res, clean: R.clean(S.res), out, cell: p.cell, key: R.key(p) }; S.log.push({ problem: r.key, ...r }); return r; }
function clearTable(){ for (const r of S.pls) { r.o.visible = false; } S.pls = []; for (const r of (S.gone || [])) r.o.visible = false; S.gone = []; PLATE.forEach(g => { g.visible = false; glowSet(g, 0); }); S.ghosts.forEach(g => { g.visible = false; }); }
/** 접시가 손님에게 나간다(오른쪽으로 밀려 나감). */
async function serveOut(){ for (const r of S.pls) { r.out = 'serve'; r.fly = null; S.gone.push(r); } for (const f of S.fish) if (f.where === 'tub') f.where = 'gone'; S.pls = []; await sleep(T.OUT_MS); }

// ── 누르기(접시 더미 · 깔린 접시 · 종 · 카드 · 쪽지 · 강아지 · 빈 곳 — 모든 누름에 답이 있다)
const pileAt = () => stage.screenOf(S.pile.position.clone().add(V3(0, T.PILE_N * T.PILE_DY * L().pd + .03, 0)));
const bellAt = () => stage.screenOf(S.bell.position.clone().add(V3(0, .28, 0)));
const plateAt = i => { const r = S.pls[i]; return r ? stage.screenOf(r.o.position.clone().add(V3(0, .05, 0))) : null; };
const tubAt = () => stage.screenOf(S.tub.position.clone().add(V3(0, .1, 0)));
const pxR = (pos, r) => { const a = stage.screenOf(pos.clone().add(V3(-r, 0, 0))), b = stage.screenOf(pos.clone().add(V3(r, 0, 0))); return Math.max(22, Math.hypot(a.x - b.x, a.y - b.y) / 2); };
function dogAt(){ if (!S.dog || !S.dogP.obj.visible) return null; return stage.screenOf(S.dogP.obj.position.clone().add(V3(0, .35, 0))); }
/** 누른 곳이 무엇인가(하네스 · 길잡이가 같이 씀): dog · plate(i) · pile · bell · tub · empty */
function hitAt(x, y){ const near = (q, r) => q && Math.hypot(q.x - x, q.y - y) < r;
  const dq = dogAt(); if (near(dq, pxR(S.dogP.obj.position, .4))) return { kind: 'dog' };
  let best = -1, bd = 1e9; S.pls.forEach((r, i) => { const q = stage.screenOf(r.o.position.clone().add(V3(0, .04, 0))), d = Math.hypot(q.x - x, q.y - y), rr = pxR(r.o.position, pd() * .5); if (d < rr && d < bd) { bd = d; best = i; } }); if (best >= 0) return { kind: 'plate', i: best, sliding: !!(S.slide && S.slide.rec === S.pls[best]) };
  if (near(pileAt(), pxR(S.pile.position, L().pd * .62))) return { kind: 'pile' };
  if (S.bell.visible && near(bellAt(), pxR(S.bell.position, .36))) return { kind: 'bell' };
  if (S.tub.visible || S.bucket.visible) { const [w, d] = S.tubWD, q = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => stage.screenOf(S.tub.position.clone().add(V3(sx * w / 2, .1, sz * d / 2)))); if (inQuad(q, x, y)) return { kind: 'tub' }; }
  return { kind: 'empty' }; }
function inQuad(q, x, y){ let s = 0; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], c = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x); if (c !== 0) { if (s === 0) s = Math.sign(c); else if (Math.sign(c) !== s) return false; } } return true; }
const canvas = $('c');
canvas.addEventListener('pointerdown', e => { audio(); if (!S.ready || E.homeOpen()) return; const x = e.clientX, y = e.clientY, hit = hitAt(x, y); S.log.push({ tap: hit.kind, phase: S.phase, busy: S.busy }); H.ripple(x, y);
  if (S.tellOn && S.t - (S.tellT || 0) > 1.5) S.tellOn = false;
  if (!S.active || S.busy) { S.log.push({ ignored: S.active ? 'busy' : 'idle' }); if (S.active && S.busy) { if (H.tell('plates.busy', '잘 봐!', { times: 1e9, ms: 1400 })) tellPlace(); } return; }   /* 바쁜 동안(쫙 깔리는 중 · 세어지는 중 · 쪽지가 넘어가는 중)에도 물결 */
  S.lastAct = S.t; S.handTo = null; S.handFn = null;
  if (hit.kind === 'dog') { dogAway(false); return; }
  if (hit.kind === 'plate' && hit.sliding) { slideEnd(true); return; }
  if (S.phase === 'place' && hit.kind === 'pile') { pressPile(); return; }
  if (S.phase === 'place' && hit.kind === 'plate' && !S.lid) { takeBack(hit.i); return; }
  if (S.phase === 'place' && hit.kind === 'bell' && S.p.n != null) { ringBell(); return; }
  nudge(hit.kind); });
/** 쪽지 누름: 맨 앞이면 헛누름(손이 다음 누를 곳) · 뒤에 걸린 것이면 그 쪽지가 까딱이고 손이 맨 앞 쪽지를 짚는다(「앞에서부터」). */
function onNote(e){ e.stopPropagation(); audio(); if (!S.ready || E.homeOpen()) return; H.ripple(e.clientX, e.clientY); const d = e.target.closest('.ord'); S.log.push({ tapNote: d ? S.ords.indexOf(d._o) : -1, busy: S.busy });
  if (!S.active || S.busy) { S.log.push({ ignored: S.active ? 'busy' : 'idle' }); if (S.active && S.busy) { if (H.tell('plates.busy', '잘 봐!', { times: 1e9, ms: 1400 })) tellPlace(); } return; }
  S.lastAct = S.t; const front = S.ords.find(o => !o.more); if (!d || d._o === front) { nudge('note'); return; }
  d.classList.remove('wig'); void d.offsetWidth; d.classList.add('wig'); S.res.nudges++; const fe = front && front.el; if (fe) { H.at(fe); S.handTo = 'note'; S.handFn = () => { const r = fe.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 6 }; }; }
  const t = '맨 앞 쪽지부터 해 줘.'; S.log.push({ nudge: 'backNote', to: 'note', text: t }); if (H.tell('plates.nudge', t, { times: 1e9 })) tellPlace(); snd(520, .07, 'triangle', .05); }
/** 접시 더미를 누름(이 틀의 손 하나). */
function pressPile(){ const w = S.w, p = S.p;
  if (p.N != null) { if (S.lid) { nudge('pile'); return; } if (w.tub <= 0) { nudge('pile'); return; } }
  else { if (S.step === 1 && w.plates.length >= p.n) { nudge('pile'); return; } if (w.plates.length >= R.T.PLATE_MAX) { nudge('pile'); return; } }
  const k = R.place(w); if (k == null) { nudge('pile'); return; } const rec = addPlate(k); S.res.placed++; const n = w.plates.length;
  const pitch = 330 * Math.pow(2, (n - 1) * 2 / 12) * (1 + .04 * Math.min(S.streak, 3)); snd(p.n != null || S.step === 1 ? pitch : 330, .09, 'triangle', .07); S.log.push({ place: k, plates: n, tub: w.tub, count: R.count(w) });   /* 놓을 때마다 음이 한 칸씩(D06 ② 는 같은 「툭」) */
  if (p.n != null && S.step === 1) { labOn(n - 1, String(n * p.g), rec); trayDraw(false, n * p.g); if (n === p.n) { S.wobT = S.t; bellWob(); } }   /* J01 ①: 뛰어 세는 수(2 · 4 · 6 · 8) — 접시 위와 띠의 「?」 칸 */
  if (p.N != null && k === 1) { rec.alone = true; }
  if (p.N != null && S.step === 1 && w.tub === 0) closeD06();   /* 통이 비면 저절로 닫힌다(묻지 않는다) */ }
/** 깔린 접시를 누름: 더미로 돌아간다(고칠 수 있다 — 깨끗함 그대로). */
function takeBack(i){ const w = S.w; R.remove(w, i); backPlate(i); snd(260, .07, 'triangle', .05); S.log.push({ back: i, plates: w.plates.length, tub: w.tub, count: R.count(w) });
  if (S.p.n != null && S.step === 1) { labsOff(); S.pls.forEach((r, j) => labOn(j, String((j + 1) * S.p.g), r)); trayDraw(false, S.pls.length ? S.pls.length * S.p.g : null); } }
/** 헛누름(5-11): 물결 + 손이 다음 누를 곳(접시 더미 · J01 ① 은 다 찼으면 종) + 한 줄. 고르는 중이면 카드가 들썩(답은 짚지 않음). 깨끗함에는 세지 않는다. */
function nudge(kind){ S.res.nudges++; snd(520, .07, 'triangle', .05); const to = nudgeTo(); S.handTo = to; if (to === 'cards') { bob(); H.hide(); S.handFn = null; } else { const f = to === 'bell' ? bellAt : pileAt; const q = f(); H.show(q.x, q.y); S.handFn = f; }
  const t = nudgeText(); S.log.push({ nudge: kind, to, text: t }); if (H.tell('plates.nudge', t, { times: 1e9 })) tellPlace(); }
function nudgeTo(){ const p = S.p, w = S.w; if (S.phase === 'ask') return 'cards'; if (p.N != null) { if (S.lid || w.tub <= 0) return 'cards'; return 'pile'; }
  if (S.step === 1 && w.plates.length >= p.n) return 'bell'; if (w.plates.length >= R.T.PLATE_MAX) return 'bell'; return 'pile'; }
/** 헛누름 · 안내의 한 줄(꼴마다 — 그 꼴에서 실제로 일어나는 일만 · 정한 것 표). */
function nudgeText(){ const p = S.p, w = S.w; if (S.phase === 'ask') return ASK_LINE;
  if (p.N != null) { if (S.lid) return LID_LINE; if (w.tub <= 0) return S.step === 2 ? PICK_LINE : FIRST.D06[1]; return FIRST.D06[S.step]; }
  if (S.step === 1 && w.plates.length >= p.n) return BELL_LINE; if (w.plates.length >= R.T.PLATE_MAX) return FULL_LINE; return FIRST.J01[S.step]; }
function bob(){ const c = $('choose'); if (c && c.classList.contains('on')) c.querySelectorAll('button:not(.away)').forEach((b, i) => { b.classList.remove('bob'); void b.offsetWidth; b.style.animationDelay = (i * .05) + 's'; b.classList.add('bob'); }); }
function breakStreak(why){ if (S.streak) S.log.push({ streakBreak: why, was: S.streak }); S.streak = 0; }
/** 한 줄 안내 자리: 쪽지 줄 바로 아래 · 탁자를 가리면 아래쪽(소리 단추 위). */
function tellPlace(){ const tl = $('tell'); if (!tl) return; const top = S.topUI + notesH() + 4, hgt = tl.offsetHeight || 54;
  if (S.low) { Object.assign(tl.style, { left: 'calc(10px + env(safe-area-inset-left,0px))', transform: 'none', maxWidth: '26vw', fontSize: '1rem', padding: '6px 12px', top: (S.topUI + 4) + 'px', bottom: '' }); return; }
  Object.assign(tl.style, { left: '', transform: '', maxWidth: '', fontSize: '', padding: '' }); const tb = Math.min(...[[0, -.85], [0, .0]].map(([x, z]) => stage.screenOf(V3(L().area[0] + x, TOP(), L().area[1] + z)).y)) - 30;
  if (tb - top >= hgt) { tl.style.top = top + 'px'; tl.style.bottom = ''; } else { tl.style.top = 'auto'; tl.style.bottom = S.tall ? 'calc(118px + env(safe-area-inset-bottom,0px))' : 'calc(26px + env(safe-area-inset-bottom,0px))'; } }

// ── D06: 고르기 · 쫙 · 닫힘
async function onPick(v, btn){ audio(); const r = btn.getBoundingClientRect(); H.ripple(r.left + r.width / 2, r.top + r.height / 2);
  if (!S.active || S.busy || !S.choosingOn || S.t - S.cardT0 < R.T.CARD_GUARD) { S.log.push({ ignored: 'card' }); if (S.active && S.busy && H.tell('plates.busy', '잘 봐!', { times: 1e9, ms: 1400 })) tellPlace(); return; }   /* 새 카드 뒤 잠깐은 물결만(두 번 누름이 새 카드를 누르지 않게) */
  S.lastAct = S.t; S.handTo = null; S.handFn = null; H.hide(); const how = R.judge(S.p, { type: 'card', v }, S.w); S.log.push({ pick: v, how });
  if (S.p.N != null) { const my = S.oid; S.busy = true; slideEnd(true); await fanD06(); if (S.oid !== my) return;
    if (how === 'fit') { btn.classList.add('bob'); await closeD06(true); return; }
    S.res.retreat = true; breakStreak('retreat'); C.retreat(btn); await nearLast(); if (S.oid !== my) return; S.busy = false; S.lastAct = S.t; return; }
  if (how === 'fit') { await fitJ01(btn); return; }
  const my = S.oid; S.res.retreat = true; breakStreak('retreat'); S.busy = true; C.retreat(btn); await skipHop(); if (S.oid !== my) return; S.busy = false; S.lastAct = S.t; S.handTo = null; S.handFn = null; }   /* 물러난 뒤 길잡이 손이 HINT_AFTER 뒤에 다시 올 수 있게 */
/** 쫙 — 뚜껑이 열리고 남은 물고기가 둘씩 한꺼번에 접시에 깔린다(D06). */
async function fanD06(){ const my = S.oid; if (S.lid) { S.lid = false; S.w.lid = false; stage.tween(S.lidG.position, { y: .9 }, 260).then(() => { S.lidG.visible = false; }); await sleep(280); if (S.oid !== my) return; }
  const w = S.w, n0 = w.plates.length; while (w.tub > 0 && w.plates.length < R.T.PLATE_MAX) { const k = R.place(w); const rec = addPlate(k); if (k === 1) rec.alone = true; snd(380 + w.plates.length * 30, .05, 'triangle', .05); await sleep(R.T.FAN_MS); if (S.oid !== my) return; }
  S.log.push({ fan: w.plates.length - n0, plates: w.plates.length, count: R.count(w) }); await sleep(T.PLACE_MS); }
/** 아니었을 때: 마지막 접시(혼자 남은 접시)가 가까이 보인다 — 둘이 나란한지 · 혼자인지. */
async function nearLast(){ const my = S.oid, i = Math.max(0, R.lone(S.w) >= 0 ? R.lone(S.w) : S.pls.length - 1), rec = S.pls[i]; if (!rec) return; S.log.push({ near: i, alone: R.lone(S.w) >= 0 }); snd(440, .12, 'triangle', .06);
  await stage.tween(rec, { big: 1.6, hop: .25 }, 280, t => t * (2 - t)); if (S.oid !== my) return; await sleep(T.NEAR_MS); if (S.oid !== my) return; await stage.tween(rec, { big: 1, hop: 0 }, 260); }
/** 닫힘(D06): 남는 것이 없으면 접시들이 일제히 반짝 · 하나가 혼자면 그 접시만 깜박 → 띠 「7은 홀수」 · 소리 → 쪽지가 떼어짐. */
async function closeD06(picked = false){ const my = S.oid, w = S.w, odd = w.N % 2 === 1, li = R.lone(w); S.busy = true; S.phase = 'done'; if (S.choosingOn) setTimeout(() => { C.hide(); S.choosingOn = false; }, 380);
  cook('Yes'); trayDraw(true); say(S.trayText); S.log.push({ close: odd ? 'odd' : 'even', lone: li, plates: w.plates.length, count: R.count(w) });
  const glint = odd ? [S.pls[li]].filter(Boolean) : S.pls.slice(); const t0 = S.t; while (S.t - t0 < T.GLINT_MS / 1000) { const on = odd ? Math.floor((S.t - t0) * 6) % 2 === 0 : true, v = odd ? (on ? 1.1 : 0) : Math.max(0, 1 - (S.t - t0) / (T.GLINT_MS / 1000)) * 1.2; glint.forEach(r => glowSet(r.o, v)); await sleep(30); if (S.oid !== my) return; }
  glint.forEach(r => glowSet(r.o, 0)); if (picked || S.step === 1) await finishProblem('fit'); }
/** 문제 끝(맞음): 동전 · 금테 · 척척 → 접시가 손님에게 나가고 쪽지가 떼어진다. */
async function finishProblem(out){ const my = S.oid, cleanNow = R.clean(S.res); wallet.earn(R.T.COIN_PER, 'plates'); coinsDraw(true);
  if (S.ctx.gold) { if (cleanNow) { wallet.earn(R.T.GOLD_COINS, 'plates'); confetti(10); coinsDraw(true); S.log.push({ goldOpen: true }); S.goldCarry = false; } else S.goldCarry = true; }
  if (cleanNow && S.step === 2) { S.streak++; S.log.push({ streak: S.streak }); if (S.streak % R.T.STREAK === 0) { confetti(8); cook('Yes'); [660, 880, 990].forEach((f, i) => snd(f, .08, 'square', .03, i * .09)); S.log.push({ clap: S.streak }); } } else if (!cleanNow) breakStreak('problem');
  S.icons.push(npHtml(S.p.N != null ? 2 : S.p.g)); await sleep(T.READ_MS); if (S.oid !== my) return; labsOff(); await Promise.all([serveOut(), tearFront()]); if (S.oid !== my) return; A.trayClear(); signShow(false); S.done && S.done(out); }

// ── J01: 종 · 고르기 · 쫙
function bellWob(){ const o = S.bellIn; if (stage.tweens.some(w => w.o === o.rotation)) return; stage.tween(o.rotation, { z: .28 }, 110).then(() => stage.tween(o.rotation, { z: -.22 }, 150)).then(() => stage.tween(o.rotation, { z: .1 }, 130)).then(() => stage.tween(o.rotation, { z: 0 }, 150)); }
async function ringBell(){ const my = S.oid, w = S.w, p = S.p, how = R.judge(p, { type: 'bell' }, w); bellWob(); [784, 1046].forEach((f, i) => snd(f * (1 + .06 * Math.min(S.streak, 3)), .3, 'sine', .08, i * .1)); S.log.push({ bell: how, plates: w.plates.length, want: p.n });
  if (how === 'short') { S.res.short++; breakStreak('short'); cook('Wave', 1400); S.blinkT = S.t + 2.4; const t = SHORT_LINE; if (H.tell('plates.short', t, { times: 1e9, ms: 2200 })) tellPlace(); return; }   /* 앤이 쪽지를 가리키고 빈 자리가 흐리게 뜬다 「더 놓아 줘」 */
  if (how === 'over') { S.res.over++; breakStreak('over'); S.busy = true; for (let i = w.plates.length - 1; i >= p.n; i--) { R.remove(w, i); backPlate(i); snd(300, .06, 'triangle', .05); await sleep(140); if (S.oid !== my) return; } await sleep(260); if (S.oid !== my) return; S.busy = false; S.lastAct = S.t; S.log.push({ overBack: w.plates.length }); return; }   /* 남는 접시가 더미로 돌아간다 */
  S.busy = true; slideEnd(true);
  if (S.step === 1) { S.phase = 'done'; trayDraw(true); say(S.trayText); cook('Yes'); S.pls.forEach((r, i) => labOn(i, String((i + 1) * p.g), r, i === p.n - 1 ? 'all' : '')); await finishProblem('fit'); return; }   /* 걸음 ①: 묻지 않는다 — 띠 「2씩 4묶음은 8」 */
  S.phase = 'ask'; trayDraw(); const list = S.forceCards || R.cards(p); S.forceCards = null; C.show(list, onPick); S.choosingOn = true; S.cardT0 = S.t; reaim(); C.place(); C.ask(true); S.log.push({ ask: p.g * p.n, cards: list }); S.busy = false; S.lastAct = S.t;
  if (S.ctx.askTell && H.tell(S.ctx.askTell.key, ASK_LINE, S.ctx.askTell.opt)) { S.tellOn = true; S.tellT = S.t; tellPlace(); S.lastAct = S.t + T.TELL_GRACE; } }
/** 맞음(J01): (빈 접시면 물고기가 먼저 올라오고) 접시가 차례로 번쩍 켜지며 2 · 4 · 6 · 8 → 띠가 닫히고 손님에게 나간다. */
async function fitJ01(btn){ const my = S.oid, p = S.p; S.busy = true; S.phase = 'done'; btn.classList.add('bob'); setTimeout(() => { C.hide(); S.choosingOn = false; }, 380); cook('Yes');
  if (S.bare) { S.bare = false; S.pls.forEach(rec => { for (let j = 0; j < rec.k; j++) S.fish.push({ where: 'plate', pl: rec, j, p: S.bucket.position.clone().add(V3(0, .5, 0)) }); }); await sleep(520); if (S.oid !== my) return; }   /* 빈 접시 먼저: 답한 뒤에 물고기가 올라온다 */
  await spreadJ01(true); if (S.oid !== my) return; trayDraw(true); say(S.trayText); await finishProblem('fit'); }
/** 쫙(J01): 접시가 차례로 FAN_MS 사이로 번쩍 켜지며 그 위에 g · 2g · …(척척이면 음이 높아진다). lit = 맞은 뒤(켜짐) · 아니면 톡 뛰며 뛰어 세기. */
async function spreadJ01(lit){ const my = S.oid, p = S.p, sp = R.spread(p); labsOff(); S.log.push({ spread: sp.nums.join(',') });
  for (let i = 0; i < S.pls.length && i < sp.nums.length; i++) { const rec = S.pls[i]; labOn(i, String(sp.nums[i]), rec, lit ? (i === sp.nums.length - 1 ? 'all lit' : 'lit') : (i === sp.nums.length - 1 ? 'all' : '')); if (lit) glowSet(rec.o, .9); snd(392 * Math.pow(2, i * 2 / 12) * (1 + .06 * Math.min(S.streak, 3)), .1, 'triangle', .07);
    stage.tween(rec, { hop: .18 }, R.T.FAN_MS * .9, t => t * (2 - t)).then(() => stage.tween(rec, { hop: 0 }, R.T.FAN_MS * 1.2, t => t * t)); await sleep(lit ? R.T.FAN_MS * 2 : T.HOP_MS); if (S.oid !== my) return; }
  await sleep(300); if (lit) S.pls.forEach(r => glowSet(r.o, 0)); }
/** 아니었을 때(J01): 접시가 한 장씩 톡 뛰며 뛰어 세어진다 → 고른 카드가 물러난다. */
async function skipHop(){ await spreadJ01(false); }

// ── 사건: 쌓이는 주문 · 미끄러지는 접시 · 강아지
function orderTick(rdt){ const ev = S.ev; if (!ev.order || CALM || S.step === 1) return; const thinking = S.active && !S.busy && (S.phase === 'place' || S.phase === 'ask'); if (!thinking) return;
  const rate = S.tellOn ? R.T.TELL_SLOW : 1, prev = S.ord; S.ord = Math.min(1, S.ord + rdt * rate / R.orderS(S.cell, S.ctx.b));
  for (const a of R.T.ORDER_ADD) if (prev < a && S.ord >= a) { S.ords.push({ more: true, g: S.p.g || 2 }); notesDraw(); snd(600, .05, 'triangle', .04); S.log.push({ orderAdd: S.ords.filter(o => o.more).length }); }   /* 줄 끝에 새 쪽지가 밀려 들어와 줄이 늘어진다 */
  if (prev < R.T.ORDER_SHAKE && S.ord >= R.T.ORDER_SHAKE) { ORD.classList.add('shake'); S.log.push({ orderShake: true }); }
  if (S.ord >= 1) missNow(); }
/** 놓침(쌓이는 주문이 다 참): 답을 보여 주고(쫙 · 띠가 닫힘 · 뛰어 센 수) 맨 앞 쪽지가 바람에 넘어가 줄 맨 뒤에 다시 걸린다. */
async function missNow(){ if (S.busy || !S.active) return; const my = S.oid, p = S.p, w = S.w; S.busy = true; S.res.missed = true; breakStreak('miss'); S.phase = 'done'; H.hide(); S.handTo = null; slideEnd(true); dogAway(true); C.hide(); S.choosingOn = false; S.log.push({ missed: true });
  if (p.N != null) { await fanD06(); if (S.oid !== my) return; trayDraw(true); const li = R.lone(w); if (li >= 0 && S.pls[li]) glowSet(S.pls[li].o, 1); else S.pls.forEach(r => glowSet(r.o, .8)); }
  else { while (w.plates.length > p.n) { const i = w.plates.length - 1; R.remove(w, i); backPlate(i); } while (w.plates.length < p.n) { R.place(w); addPlate(p.g); await sleep(R.T.FAN_MS); if (S.oid !== my) return; }
    if (S.bare) { S.bare = false; S.pls.forEach(rec => { for (let j = 0; j < rec.k; j++) S.fish.push({ where: 'plate', pl: rec, j, p: S.bucket.position.clone().add(V3(0, .5, 0)) }); }); }
    await sleep(T.PLACE_MS); if (S.oid !== my) return; S.pls.forEach((r, i) => labOn(i, String((i + 1) * p.g), r, i === p.n - 1 ? 'all' : '')); trayDraw(true); }
  say(S.trayText); await blowFront(); if (S.oid !== my) return; await sleep(T.MISS_HOLD); if (S.oid !== my) return;   /* 답이 화면에 남는다 */
  labsOff(); S.pls.forEach(r => glowSet(r.o, 0)); await serveOut(); if (S.oid !== my) return; A.trayClear(); signShow(false); S.done && S.done('missed'); }
function dogPlace(){ const l = L(), d = S.dog, k = d.k, x = l.dogOut[0] + (l.dog[0] - l.dogOut[0]) * k; S.dogP.obj.position.set(x, T.DECK, l.dog[1]); S.dogP.obj.rotation.y = l.dogOut[0] > l.dog[0] ? -Math.PI / 2 : Math.PI / 2; }   /* 들어오는 쪽에서 탁자 쪽으로 고개 */
const dogAct = re => S.dogActs.find(n => re.test(n));
function dogIn(){ S.dog = { k: 0, t0: S.t, out: false }; S.dogP.obj.visible = true; dogPlace(); stage.play(S.dogP, dogAct(/Walk$|Walk/) || S.dogActs[0]); stage.tween(S.dog, { k: 1 }, 700).then(() => { if (S.dog && !S.dog.out) stage.play(S.dogP, dogAct(/Eating|Idle_2_HeadLow|Idle/) || S.dogActs[0]); }); S.res.dog++; snd(500, .06, 'triangle', .04); S.log.push({ dog: 'in' }); }
/** 강아지가 물러난다: caught = 아이가 눌러서(꼬리를 흔들며) · 아니면 냄새만 맡고 간다(잃는 것 없음). */
function dogAway(quiet){ const d = S.dog; if (!d || d.out) return; d.out = true; if (!quiet) { S.res.caught++; snd(700, .08, 'triangle', .05); S.log.push({ dog: 'shoo' }); stage.play(S.dogP, dogAct(/Gallop$|Run|Gallop/) || S.dogActs[0]); } else S.log.push({ dog: 'away' });
  stage.tween(d, { k: 0 }, quiet ? 400 : 600).then(() => { if (S.dog === d) { S.dogP.obj.visible = false; S.dog = null; } }); }
/** 미끄러지는 접시(J01): 놓은 접시 하나가 탁자 끝으로 미끄러진다 → 눌러 잡는다 · 놓치면 앤이 받아 제자리에(접시 수 · 물고기 수 그대로). */
function slideStart(){ if (S.pls.length < 2) return false; const i = Math.floor(Math.random() * S.pls.length), rec = S.pls[i]; S.slide = { rec, t0: S.t }; S.res.slid++; snd(240, .2, 'sine', .04, 0, 180); S.log.push({ slide: i }); return true; }
function slideEnd(caught){ const s = S.slide; if (!s) return; S.slide = null; stage.tween(s.rec, { slideK: 0 }, 220); if (caught === true && S.active && !S.busy) { S.res.caught++; snd(620, .08, 'triangle', .06); S.log.push({ slideCaught: true }); } else if (caught === 'anne') { cook('Yes', 900); snd(440, .08, 'triangle', .05); S.log.push({ slideSaved: true }); } }

// ── 시계 · 길잡이 · 그림
stage.frame(() => { const now = performance.now(); let rdt = (now - (S.lastNow || now)) / 1000; S.lastNow = now; rdt = Math.max(0, Math.min(1, rdt)); S.t += rdt; if (!S.ready) return;
  const tl = $('tell'), tellVis = !!(tl && tl.classList.contains('on')); if (!tellVis) S.tellOn = false;
  const thinking = S.active && !S.busy && (S.phase === 'place' || S.phase === 'ask'); if (thinking) S.think += rdt * (S.tellOn ? R.T.TELL_SLOW : 1);
  orderTick(rdt);
  if (thinking && S.dogPlan && !S.dog && S.think > S.dogPlan.at) { S.dogPlan = null; S.ctx.dogFired = true; dogIn(); }
  if (S.dog && !S.dog.out && S.t - S.dog.t0 > R.T.DOG_S) dogAway(true);
  if (thinking && S.slidePlan && !S.slide && S.phase === 'place' && S.think > S.slidePlan.at && slideStart()) { S.slidePlan = null; S.ctx.slideFired = true; }
  if (S.slide) { const u = (S.t - S.slide.t0) / R.T.SLIDE_S; S.slide.rec.slideK = Math.min(1, u * 1.1); if (u >= 1) slideEnd('anne'); }
  /* J01 ①: 자리가 다 차면 종이 흔들린다 */ if (thinking && S.p && S.p.n != null && S.step === 1 && S.w.plates.length === S.p.n && S.t - S.wobT > T.BELL_WOB) { S.wobT = S.t; bellWob(); }
  /* 길잡이 손(가만히 있으면): D06 = 접시 더미만(카드는 들썩) · J01 ① = 더미 → 종 · J01 ② = 더미 → 종 → (많으면 끝 접시) · 고르는 중 = 맞는 카드. J01 ② 와 카드만 그 문제를 깨끗하지 않게 한다. */
  if (thinking && !S.tellOn && !S.handTo) { const wait = R.T.HINT_AFTER * (M.stuck(M.get(S.cell)) >= 1 ? .5 : 1); if (S.t - S.lastAct > wait) idleHand(); }
  if (S.handFn && H.shown()) { const q = S.handFn(); if (q) H.show(q.x, q.y); }   /* 손은 짚은 것을 따라간다(화면을 돌릴 때) */
  if (S.dog) dogPlace(); platesTick(rdt); fishTick(rdt); ghostsDraw(); for (const d of LABS) if (d.classList.contains('on')) labPlace(d); if (S.choosingOn) C.place(); signPlace(); });
function idleHand(){ const p = S.p, w = S.w; let to = null, fn = null, hint = false;
  if (S.phase === 'ask') { fn = answerAt; to = 'card'; hint = true; }
  else if (p.N != null) { if (S.lid || w.tub <= 0) { bob(); S.handTo = 'cards'; S.log.push({ hand: 'cards' }); return; } fn = pileAt; to = 'pile'; }
  else { const k = w.plates.length; if (k < p.n) { fn = pileAt; to = 'pile'; } else if (k === p.n) { fn = bellAt; to = 'bell'; } else { const i = k - 1; fn = () => plateAt(i); to = 'plate'; } hint = S.step === 2; }
  const q = fn && fn(); if (!q) return; H.show(q.x, q.y); S.handTo = to; S.handFn = fn; if (hint && !S.res.hinted) { S.res.hinted = true; breakStreak('hint'); } S.log.push({ hand: to, hinted: hint }); }
/** 맞는 카드의 화면 자리(길잡이 손 · 하네스). */
function answerAt(){ const a = R.answer(S.p), b = [...document.querySelectorAll('#choose.on button')].find(b => b.dataset.n === String(a)); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 10 }; }

// ── 나들이
const FIRST = { D06: { 1: '접시 더미를 눌러 물고기를 둘씩 놓아 줘.', 2: '짝수일까, 홀수일까? 접시 더미를 눌러 놓아 봐도 돼.' }, J01: { 1: '접시 더미를 눌러 쪽지만큼 접시를 놓아 줘.', 2: '쪽지만큼 접시를 놓고 종을 눌러 줘. 모두 몇 마리일까?' } };
const ASK_LINE = '모두 몇 마리일까? 수를 눌러 줘.', PICK_LINE = '다 놓았어. 짝수인지 홀수인지 눌러 줘.', LID_LINE = '통이 닫혀 있어. 수를 보고 짝수인지 홀수인지 눌러 줘.', BELL_LINE = '다 놓았으면 종을 눌러 줘.', FULL_LINE = '접시가 다 깔렸어. 종을 눌러 줘.', SHORT_LINE = '더 놓아 줘.';
const TELLS = () => ({ times: M.passed(M.get(S.cell || '')) ? 2 : 1e9 });   /* 깃발을 따기 전에는 나들이 첫 문제마다(정본 5-11절) */
async function outing(id){ const my = ++S.oid; E.showBar(true); S.cell = id; S.streak = 0; S.goldCarry = false; S.icons = []; const day = M.dayKey(); let prevStep = 0;
  stage.hemi.intensity = 1.25; let rec = M.get(id); S.back = M.stuckNow(rec) && !!rec.hand;
  const hand0 = !rec.hand || S.back; let q = S.forceQ ? S.forceQ.map(x => ({ ...x })) : R.deal(id, S.hist[id] || [], Math.random, { small: M.stuck(rec) >= 1, hand: [hand0, false, false], carry: S.carry[id] }); S.forceQ = null; S.carry[id] = []; S.q = q; E.lanterns(0); S.log.push({ outing: id, deal: q.map(R.key) });
  for (let b = 0; b < R.T.BOARDS; b++) { rec = M.get(id); const hand = !rec.hand || S.back; if (hand && b > 0 && id === 'D06') { q = fixHand(q, b * R.T.PER_BOARD); S.q = q; }
    let ev = R.events(id, rec.evBoards, Math.random, { passed: M.passed(rec), calm: CALM, hand }); if (S.forceEv) { ev = { ...ev, ...S.forceEv }; S.forceEv = null; } if (S.forceEvAll && !hand) ev = { ...ev, ...S.forceEvAll };   /* 하네스만(window.__plates) */
    const carried = S.goldCarry && !hand; if (carried) ev = { ...ev, slide: false, dog: false, bare: false, gold: true, carried: true };   /* 넘어온 금테 쪽지 판에는 다른 사건을 붙이지 않는다(판마다 하나 · 쌓이는 주문은 시계라 그대로) */
    S.ev = ev; S.step = hand ? 1 : 2; const pickJ = k => k != null ? k : Math.floor(Math.random() * 3), goldJ = ev.gold ? pickJ(ev.goldJ) : -1, bareJ = ev.bare ? pickJ(ev.bareJ) : -1, dogJ = ev.dog ? pickJ(ev.dogJ) : -1, slideJ = ev.slide ? pickJ(ev.slideJ) : -1;
    S.board = { b, hand, ev }; S.log.push({ board: b, hand, ev: Object.keys(ev).filter(k => ev[k] === true).join(' ') }); E.marbles(0);
    const list = q.slice(b * R.T.PER_BOARD, (b + 1) * R.T.PER_BOARD); if (!(await hangBoard(list, goldJ))) return;
    const results = []; let dogLeft = dogJ >= 0, slideLeft = slideJ >= 0;
    for (let j = 0; j < R.T.PER_BOARD; j++) { const i = b * R.T.PER_BOARD + j; if (S.forceP && S.forceP.length) { const f = S.forceP.shift(); q[i] = f.N != null ? R.make(id, f.N) : R.make(id, f.g, f.n); S.ords[0] && !S.ords[0].more && (S.ords[0].p = q[i]); notesDraw(); } const p = q[i];
      const firstStep = b === 0 || (hand ? 1 : 2) !== prevStep, tellOk = j === 0 && firstStep, last = !hand && b === R.T.BOARDS - 1 && j === R.T.PER_BOARD - 1;
      const ctx = { b, j, hand, ev, gold: j === goldJ, bare: j === bareJ, last, dogAt: dogLeft && j >= dogJ ? 1.2 + Math.random() * 2 : null, slideAt: slideLeft && j >= slideJ && p.n != null ? 2.5 + Math.random() * 2.5 : null,
        tell: tellOk ? { key: 'plates.' + id + '.' + (hand ? 1 : 2), text: FIRST[id][hand ? 1 : 2], opt: TELLS() } : null, askTell: tellOk && id === 'J01' && !hand ? { key: 'plates.J01.ask', opt: TELLS() } : null };
      const r = await runProblem(p, ctx); if (S.oid !== my || r.abort) return; if (ctx.dogFired) dogLeft = false; if (ctx.slideFired) slideLeft = false; results.push(r); E.marbles(j + 1);
      if (!r.clean) { const rq = R.requeue(q, i); q = rq.q; if (rq.carry) S.carry[id].push(rq.carry); } S.q = q; }
    prevStep = hand ? 1 : 2;
    const before = rec; rec = M.record(rec, results, day, { counts: !hand, hand, ev: !hand && !ev.none && !ev.carried }); if (hand) S.back = false; else if (M.stuckNow(rec)) S.back = true; M.put(id, rec); S.log.push({ boardEnd: b, clean: M.clean(results), rec: { ...rec } });
    ORD.classList.remove('on'); S.ords = []; notesDraw(); E.lanterns(b + 1); snd(660, .15, 'triangle', .1); snd(990, .2, 'triangle', .1, .12);
    if (!M.passed(before) && M.passed(rec)) { grew(art(ICON.flag) + ' 깃발을 땄어요!'); await sleep(2400); }
    if (S.oid !== my) return; await sleep(400); }
  S.hist[id] = q; await finale(); if (S.oid !== my) return;
  const nx = M.passed(M.get(id)) ? nextHere(id) : null; S.log.push({ homeNext: nx });   /* 「다음으로」는 같은 학년 안에서만(go/next.js) — D06 → J01 은 권하지 않는다 */
  const choice = await E.home({ items: S.icons.slice(), next: nx ? '다음으로' : '' }); if (S.oid !== my) return;
  if (choice === 'again') outing(id); else if (choice === 'next' && nx) location.href = href(nx); else location.href = GO; }
/** 막혀서 걸음 ① 로 돌아온 판(D06): 그 판의 수를 2~10 으로(짝 · 홀은 그대로 · 앞뒤와 같지 않게). */
function fixHand(q, st){ const out = q.slice(), [lo, hi] = R.CELLS.D06.hand; for (let k = st; k < st + R.T.PER_BOARD && k < out.length; k++) { const N = out[k].N; if (N >= lo && N <= hi) continue; const cand = []; for (let v = lo; v <= hi; v++) if (v % 2 === N % 2 && (!out[k - 1] || out[k - 1].N !== v) && (!out[k + 1] || out[k + 1].N !== v)) cand.push(v); out[k] = R.make('D06', cand[Math.floor(Math.random() * cand.length)]); } return out; }
/** 나들이 끝: 밥집 등이 꺼지고 오늘 낸 접시가 한 줄로. */
async function finale(){ const my = S.oid; S.p = null; S.phase = 'idle'; A.trayClear(); C.hide(); S.choosingOn = false; labsOff(); signShow(false); clearTable(); S.fish = []; ORD.classList.remove('on'); cook('Wave', 2000); S.log.push({ finale: S.icons.length });
  snd(523, .2, 'triangle', .06); snd(659, .2, 'triangle', .06, .2); snd(784, .3, 'triangle', .06, .4); await stage.tween(stage.hemi, { intensity: .7 }, 1200); if (S.oid !== my) return; }
/** 하네스 · 교사용: 지금 나들이를 거둔다. */
function abort(){ S.oid++; S.active = false; if (S.done) { const d = S.done; S.done = null; d('abort'); } stage.tweens.length = 0; C.hide(); S.choosingOn = false; A.trayClear(); labsOff(); signShow(false); S.busy = false; S.phase = 'idle'; H.hide(); clearTable(); S.fish = []; S.ords = []; if (ORD) notesDraw(); if (S.dogP) S.dogP.obj.visible = false; S.dog = null; S.slide = null; stage.hemi.intensity = 1.25; S.handTo = null; S.handFn = null; }

window.__plates = { S, R, M, E, T, stage, wallet, outing, abort, hitAt, pileAt, bellAt, plateAt, tubAt, dogAt, answerAt, nextHere,
  noteAt: k => { const o = S.ords[k], e = o && o.el; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
  count: () => S.w ? R.count(S.w) : null, shown: () => ({ fish: fishIM ? fishIM.count : 0, plates: S.pls.length, ghosts: S.ghosts.filter(g => g.visible).length, lid: !!(S.lidG && S.lidG.visible), dog: !!(S.dogP && S.dogP.obj.visible), notes: S.ords.length, more: S.ords.filter(o => o.more).length, shake: !!(ORD && ORD.classList.contains('shake')), fishLen: FISHG ? +(FISHG.w).toFixed(3) : 0 }),
  keyRects: () => [...document.querySelectorAll('#choose.on button, #tray.on, #marbles, #lanterns, #coins, .back, #snd, #tell.on, #orders.on, #tubsign.on, .lab.on')].map(e => e.getBoundingClientRect()).filter(r => r.width) };
if (!GO_NOW) build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
