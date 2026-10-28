// hq 스킨 — GLB 로더(13 문서 5절 GLB 규격). 에셋은 skins/hq/assets/ (출처·라이선스 = assets/LICENSES.md)
// 규칙: 로드 실패는 throw 하지 않고 null → 호출한 쪽이 proto 대체물(절차적)을 쓴다. 엔진·sim import 0.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const cache = new Map(); let loader = null;
export function setBase(base){ cache.set('__base', base); }
const base = () => cache.get('__base') || 'assets/';

/** GLB 한 개 → gltf(scene·animations). 실패 시 null */
export async function loadGLB(name){
  if (cache.has(name)) return cache.get(name);
  const p = (async () => { try { loader = loader || new GLTFLoader(); const g = await loader.loadAsync(base() + name + '.glb'); return g; }
    catch (e) { console.warn('[hq] GLB 실패', name, e && e.message); return null; } })();
  cache.set(name, p); return p;
}

/** 정적 소품(Quaternius 나무·바위·버섯 등): 재질 색을 정점색으로 구워 지오메트리 하나로 합침 → 인스턴싱 1 드로우콜.
 *  height = 목표 높이(m, 바닥 y=0). 반환 { geo, h, r } 또는 null */
export async function loadStatic(name, { height = 1, emissive = null } = {}){
  const key = 'S:' + name + ':' + height; if (cache.has(key)) return cache.get(key);
  const p = (async () => { const g = await loadGLB(name); if (!g) return null;
    const parts = []; g.scene.updateMatrixWorld(true);
    g.scene.traverse(o => { if (!o.isMesh || !o.geometry.attributes.position) return;
      const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld); for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
      if (!geo.attributes.normal) geo.computeVertexNormals();
      const n = geo.attributes.position.count, col = new Float32Array(n * 3); const mats = Array.isArray(o.material) ? o.material : [o.material];
      const groups = geo.groups && geo.groups.length ? geo.groups : [{ start: 0, count: geo.index ? geo.index.count : n, materialIndex: 0 }];
      // 그룹(재질)별 색 — 인덱스 지오메트리면 그룹이 가리키는 정점에 칠함
      const c = new THREE.Color(); const idx = geo.index ? geo.index.array : null;
      for (const gr of groups) { const m = mats[gr.materialIndex] || mats[0]; c.copy(m && m.color ? m.color : new THREE.Color(0xffffff));
        for (let i = gr.start; i < gr.start + gr.count; i++) { const v = idx ? idx[i] : i; col[v * 3] = c.r; col[v * 3 + 1] = c.g; col[v * 3 + 2] = c.b; } }
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.clearGroups(); parts.push(geo.toNonIndexed ? geo.toNonIndexed() : geo); });
    if (!parts.length) return null;
    const merged = parts.length === 1 ? parts[0] : mergeGeometries(parts, false); if (!merged) return null;
    merged.computeBoundingBox(); const bb = merged.boundingBox, h0 = Math.max(.001, bb.max.y - bb.min.y), s = height / h0;
    merged.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); merged.scale(s, s, s); merged.computeBoundingBox(); merged.computeBoundingSphere();
    const b2 = merged.boundingBox; merged.userData.shared = true;
    return { geo: merged, h: height, r: Math.max(b2.max.x - b2.min.x, b2.max.z - b2.min.z) / 2, emissive }; })();
  cache.set(key, p); return p;
}

/** 여러 자리에 같은 소품 → InstancedMesh. list = [[x, z, scale, rot, (y)]...], f(dummy, s) 로 자세 보정 */
export function instanced(def, mat, list, f){
  const m = new THREE.InstancedMesh(def.geo, mat, Math.max(1, list.length)), d = new THREE.Object3D();
  list.forEach((s, i) => { d.position.set(s[0], s[4] || 0, s[1]); d.rotation.set(0, (s[3] || 0) * 9, 0); d.scale.setScalar(s[2] || 1); f && f(d, s); d.updateMatrix(); m.setMatrixAt(i, d.matrix); });
  m.count = list.length; m.instanceMatrix.needsUpdate = true; m.userData = { list, f }; return m;
}
export function relay(m, dummy, posOf){ const { list, f } = m.userData; list.forEach((s, i) => { const p = posOf(s); dummy.position.set(p[0], p[1] || 0, p[2]); dummy.rotation.set(0, (s[3] || 0) * 9, 0); dummy.scale.setScalar(s[2] || 1); f && f(dummy, s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.instanceMatrix.needsUpdate = true; }

/** 스타일라이즈드 정점색 재질 + 바람 흔들림(wind > 0 이면 높이에 비례해 정점이 흔들림 — 나무·풀) */
export function stylized({ wind = 0, emissive = 0x000000, emissiveIntensity = 0, roughness = .9, flat = false } = {}){
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness, metalness: 0, emissive, emissiveIntensity, flatShading: flat });
  mat.userData.time = { value: 0 };
  if (wind > 0) mat.onBeforeCompile = sh => { sh.uniforms.uTime = mat.userData.time; sh.uniforms.uWind = { value: wind };
    sh.vertexShader = 'uniform float uTime; uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>',
      `#include <begin_vertex>
      { vec4 wp = modelMatrix * vec4(position, 1.0);
        #ifdef USE_INSTANCING
        wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        #endif
        float hgt = max(0.0, position.y); float ph = wp.x * 0.35 + wp.z * 0.27 + uTime * 1.3;
        float sway = (sin(ph) * 0.6 + sin(ph * 2.3 + 1.7) * 0.4) * uWind * hgt * hgt * 0.06;
        transformed.x += sway; transformed.z += sway * 0.6; }`); };
  return mat;
}
