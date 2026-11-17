/* ============================================================
 * 모형 부품 (모형 설계 v1 · WG0)
 *   const set = await loadModels(K, ['PineTree_Snow_1', …])   → { 이름: 본(本) }  — 못 불러온 것 · 늦은 것은 빠진다(G3: 없어도 돈다)
 *   const m = modelOf(K, set.PineTree_Snow_1, { h: 4.2, tones: { leaf, rock }, rot })   → THREE.Group(바닥이 y = 0, 키 h — 납작한 것은 s = 가장 긴 쪽의 길이)
 *   모형은 꼴만 쓴다 — 재질 이름을 색 토큰으로 바꿔 입힌다(content/models/kit.js 의 표). 파일에 든 색 값은 읽지 않는다.
 *   본은 키 1 · 바닥 0 · 가운데로 맞춰 간직한다(파일마다 크기 단위가 달라도 같은 셈).
 *   색은 토큰으로만. 상수는 kit.js 의 MODEL_CONF 한 곳.
 * ============================================================ */
import { MODEL_CONF, MODELS, toneOf } from '../content/models/kit.js';

const cache = new Map();      /* 이름 → Promise(본 | null) */
let loaderP = null;
const loader = () => loaderP || (loaderP = import('three/addons/loaders/GLTFLoader.js').then(m => new m.GLTFLoader()));

/* 받은 장면을 본으로 — 키 1 · 바닥 0 · 가운데 */
export function normalize(THREE, scene){
  scene.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(scene), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3()), h = size.y || 1;
  const inner = new THREE.Group(), proto = new THREE.Group(); scene.position.sub(new THREE.Vector3(c.x, box.min.y, c.z)); inner.add(scene); inner.scale.setScalar(1 / h); proto.add(inner);
  let tris = 0; proto.traverse(m => { if (m.isMesh) tris += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3; });
  proto.userData = { w: size.x / h, d: size.z / h, tris }; return proto;
}

export function loadOne(K, name, base = MODEL_CONF.base){
  if (!MODELS[name]) return Promise.resolve(null);
  if (!cache.has(name)) cache.set(name, loader().then(L => L.loadAsync(base + name + '.glb')).then(g => normalize(K.THREE, g.scene)).catch(() => null));
  return cache.get(name);
}

/* 여러 개를 한꺼번에 — waitMs 안에 온 것만 돌려준다(늦은 것은 다음 걸음에서 쓰인다) */
export function loadModels(K, names, o = {}){
  const out = {}, list = [...new Set(names || [])].slice(0, MODEL_CONF.perStep); if (!list.length) return Promise.resolve(out);
  const all = Promise.all(list.map(n => loadOne(K, n, o.base).then(p => { if (p) out[n] = p; }))), late = new Promise(r => setTimeout(r, o.waitMs == null ? MODEL_CONF.waitMs : o.waitMs));
  return Promise.race([all, late]).then(() => out, () => out);
}

/* 색 하나 — 토큰 이름 | [색, 색, 섞는 양](안에 또 섞은 것이 와도 된다) */
const colorOf = (K, v) => (Array.isArray(v) ? K.mix(colorOf(K, v[0]), colorOf(K, v[1]), v[2]) : typeof v === 'string' ? K.C(v) : v);

/* 본 하나를 세운다 — 재질은 토큰 색으로(같은 색은 한 재질을 나눠 쓴다) */
export function modelOf(K, proto, o = {}){
  const g = proto.clone(true), mats = K.__modelMats || (K.__modelMats = new Map()), u = proto.userData, h = o.h || (o.s ? o.s / Math.max(1, u.w, u.d) : 1);      /* h = 키 · s = 가장 긴 쪽의 길이(납작한 것 — 그루터기 · 통나무 · 연잎) */
  g.traverse(m => { if (!m.isMesh) return; const one = mt => { const t = toneOf(mt.name, o.tones) || 'a-wood', key = JSON.stringify(t); if (!mats.has(key)) mats.set(key, K.M(colorOf(K, t), { roughness: 0.9, flatShading: true })); return mats.get(key); };
    m.material = Array.isArray(m.material) ? m.material.map(one) : one(m.material); m.castShadow = o.shadow !== false; m.receiveShadow = true; });
  g.scale.setScalar(h); if (o.rot) g.rotation.y = o.rot; g.userData = { model: true, h, w: proto.userData.w * h, d: proto.userData.d * h, tris: proto.userData.tris }; return g;
}
