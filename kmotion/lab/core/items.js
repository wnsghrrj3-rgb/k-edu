// 케이모션 과학실 — 진짜 기구 올리기(블렌더 GLB): 선반 배치 · 놓인 자세 · 쥔 자세 · 빈 점 읽기 · 손 모델
// 코드는 빈 점 이름(grip·base·spout·tip·inner·top·nail)과 props.json 값만 본다. 좌표를 손으로 적는 것은 선반 칸 배치표뿐.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const BASE = './assets/props/';
const HIDE_NODES = ['inner_volume'];
const STAY_NODES = ['rack', 'holder', 'holder_marks'];

// 선반 칸 배치(3단 × 5칸, 1 = 위). 칸 높이: 3단(아래) 0.50 · 2단 0.40 · 1단 0.36 → 45cm 통은 3단에만.
// 맛보기 기구는 3단(컷 B 에서도 보이는 단), 보호 장비와 의뢰 1 은 2단, 바나나·공·자유 실험은 1단(위).
// [칸, 좌우 어긋남(m), 앞뒤 어긋남(m), 돌림(rad)]
export const SHELF_LAYOUT = {
  dewar: ['shelf_3_1', 0, 0, 0], bowl: ['shelf_3_2', 0, 0, 0], tongs: ['shelf_3_3', 0, 0, 0], rose: ['shelf_3_4', 0, -.02, .3], mallet: ['shelf_3_5', 0, 0, -.5],
  visor: ['shelf_2_1', 0, -.02, 0], gloves: ['shelf_2_2', 0, 0, .25], balloon: ['shelf_2_3', 0, -.02, .4], bottle: ['shelf_2_4', 0, 0, 0], kettle: ['shelf_2_5', 0, 0, .5],
  banana_1: ['shelf_1_1', -.11, .02, .2], banana_2: ['shelf_1_1', .0, -.03, -.1], banana_3: ['shelf_1_1', .11, .03, .15],
  woodblock: ['shelf_1_2', 0, 0, .1], ball_1: ['shelf_1_3', -.07, .03, 0], ball_2: ['shelf_1_3', .07, .03, 0],
  tangerine: ['shelf_1_4', -.11, .02, 0], egg: ['shelf_1_4', .0, .03, .4], lettuce: ['shelf_1_4', .1, -.03, .7],
  papercup: ['shelf_1_5', -.12, .02, 0], rubberband: ['shelf_1_5', -.02, .05, .2], bubblewand: ['shelf_1_5', .1, -.02, 0], eraser: ['shelf_1_5', .02, -.07, .3],
};
// 실험대에 놓일 때의 자세(눕는 것들). [눕힘(z축), 돌림(y축)]. 쥐면 곧게 선다.
const LIE = { rose: [-Math.PI / 2 + .12, -.35], tongs: [-Math.PI / 2, .25], mallet: [Math.PI / 2, -.3] };
// 집게로 집을 때 꽃·잎 쪽(tip 빈 점)을 아래로 매다는 것(꽃을 먼저 넣는다)
export const FLIP_IN_TONGS = new Set(['rose', 'lettuce']);

const loader = new GLTFLoader();
export async function loadPropAssets(names){
  const meta = await (await fetch(BASE + 'props.json', { cache: 'no-cache' })).json();
  // 한꺼번에 스무 개 넘게 받으면 작은 서버·느린 학교 망에서 몇 개가 끊긴다 → 네 개씩, 끊기면 세 번까지 다시
  const glb = {}, queue = names.filter(n => meta.props[n]), sleep = ms => new Promise(r => setTimeout(r, ms));
  async function one(n){ for (let k = 0; k < 4; k++) { try { glb[n] = (await loader.loadAsync(BASE + meta.props[n].file)).scene; return; } catch (e) { if (k === 3) console.warn('[lab] 기구를 못 올림', n, e); else await sleep(250 * (k + 1)); } } }
  await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await one(queue.shift()); }));
  return { meta: meta.props, glb };
}

/** 모델 하나 복제 — 재질도 물체마다 따로(서리·빛남이 다른 물체로 번지지 않게) */
export function cloneOwn(src){ const r = src.clone(true); r.traverse(o => { if (o.isMesh) { o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone(); o.castShadow = true; o.receiveShadow = true; } }); return r; }

const corners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
/** 이 회전(q)으로 놓았을 때 쥐는 점(피벗)에서 본 바닥 높이·가운데 */
function extentFor(box, q, out){ let i = 0; for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners[i++].set(x, y, z).applyQuaternion(q);
  let mnY = 1e9, mxY = -1e9, mnX = 1e9, mxX = -1e9, mnZ = 1e9, mxZ = -1e9; for (const c of corners) { mnY = Math.min(mnY, c.y); mxY = Math.max(mxY, c.y); mnX = Math.min(mnX, c.x); mxX = Math.max(mxX, c.x); mnZ = Math.min(mnZ, c.z); mxZ = Math.max(mxZ, c.z); }
  out.minY = mnY; out.maxY = mxY; out.cx = (mnX + mxX) / 2; out.cz = (mnZ + mxZ) / 2; out.rx = (mxX - mnX) / 2; out.rz = (mxZ - mnZ) / 2; return out; }

const under = (o, set) => { for (let p = o; p; p = p.parent) if (set.has(p)) return true; return false; };

/**
 * 기구 하나 = { id, kind, def(exp 항목), meta(props.json), root(피벗 = 쥐는 점), model, gripLocal, box(피벗 기준), mats, stays, … }
 * root 의 원점이 쥐는 점이라 기울이기·흔들기가 손에서 돈다.
 * 선반에 남는 받침(집게 rack·장미 holder)은 처음에는 모델에 붙어 있다가 처음 들어 올릴 때 detachStays() 로 선반에 남긴다.
 */
export function makeItem(id, def, meta, src, stage){
  const kind = def.id, root = new THREE.Group(); root.name = 'item_' + id;
  const model = cloneOwn(src); root.add(model);
  const E = n => model.getObjectByName(n);
  const gripE = E('grip'), gripLocal = gripE ? gripE.position.clone() : new THREE.Vector3();
  model.position.copy(gripLocal).multiplyScalar(-1);
  for (const n of HIDE_NODES) { const o = E(n); if (o) o.visible = false; }
  const stays = []; for (const n of STAY_NODES) { const o = E(n); if (o) stays.push(o); }
  const staySet = new Set(stays);
  const box = new THREE.Box3(); model.updateMatrixWorld(true); root.updateMatrixWorld(true);
  model.traverse(o => { if (o.isMesh && o.visible && !under(o, staySet)) { o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); box.union(b); } });
  if (box.isEmpty()) box.set(new THREE.Vector3(-.03, -.03, -.03), new THREE.Vector3(.03, .03, .03));
  const mats = []; model.traverse(o => { if (o.isMesh && !under(o, staySet)) for (const m of [].concat(o.material)) { if (m.emissive) { m.userData.em0 = m.emissive.clone(); mats.push(m); } } });
  const it = { id, kind, def, meta, root, model, gripLocal, box, mats, stays, staySet, E,
    role: def.role, weight: def.weight || 1, mat: def.mat || meta.sound || 'glass',
    loc: 'hidden', slot: null, held: null, clampedBy: null, anim: null, fall: null, angle: 0, glow: 0, flash: 0, hover: 0, zc: null,
    rest: { q: new THREE.Quaternion(), pos: new THREE.Vector3() }, home: null, fade: 0, staysDetached: false,
    detachStays(scene){ if (it.staysDetached) return; it.staysDetached = true; root.updateMatrixWorld(true); for (const s of stays) scene.attach(s); } };
  root.visible = false; stage.scene.add(root);
  return it;
}

const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
/** 놓인 자세의 회전: 선반 = 곧게(+돌림), 실험대 = 눕는 것은 눕힘 */
export function restQuat(it, where, yaw = 0, out = new THREE.Quaternion()){
  const lie = where === 'bench' ? LIE[it.kind] : null;
  qa.setFromAxisAngle(Y, lie ? lie[1] : yaw); if (lie) { qb.setFromAxisAngle(Z, lie[0]); out.copy(qa).multiply(qb); } else out.copy(qa); return out;
}
const ext = {};
/** 바닥 점 p(상판·선반 위)에 이 회전으로 놓을 때 피벗 자리 */
export function pivotForRest(it, p, q, out = new THREE.Vector3()){ extentFor(it.box, q, ext); return out.set(p.x - ext.cx, p.y - ext.minY + .001, p.z - ext.cz); }
/** 지금 회전에서 피벗 기준 바닥 높이(물체 가장 아래) */
export function bottomOffset(it, q){ extentFor(it.box, q, ext); return ext.minY; }
export function extentOf(it, q, out = {}){ return extentFor(it.box, q, out); }

// ── 손 모델(GLB): 니트릴 ↔ 극저온 장갑 두 메시, 모양 키 open/pinch/grip 을 섞는다. 손등이 카메라를 본다(손바닥 = -z).
export function makeHand(src){
  const g = new THREE.Group(); const model = cloneOwn(src); g.add(model);
  const gripE = model.getObjectByName('grip'), gripLocal = gripE ? gripE.position.clone() : new THREE.Vector3(0, .05, -.026);
  model.position.copy(gripLocal).multiplyScalar(-1);
  const nit = model.getObjectByName('hand_nitrile'), cryo = model.getObjectByName('hand_cryo');
  const meshes = []; for (const m of [nit, cryo]) if (m) m.traverse(o => { if (o.isMesh && o.morphTargetDictionary) meshes.push(o); });
  if (cryo) cryo.visible = false;
  model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false; } });
  g.visible = false;
  const idx = meshes.map(o => o.morphTargetDictionary);
  return { group: g, model, nit, cryo, gripLocal,
    pose(open, pinch, grip){ for (let k = 0; k < meshes.length; k++) { const d = idx[k], inf = meshes[k].morphTargetInfluences; if (d.open != null) inf[d.open] = open; if (d.pinch != null) inf[d.pinch] = pinch; if (d.grip != null) inf[d.grip] = grip; } },
    gloves(on){ if (nit) nit.visible = !on; if (cryo) cryo.visible = !!on; } };
}
