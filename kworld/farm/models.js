/* 「다섯 해」 구워 입힌 모델(준호 11-23 「블렌더로 해서 좀 더 제대로」) 읽기.
   tools/blender/kw_bake.py 가 절차 재질(이엉 결·나뭇결·돌·회벽·기와…)과 구석 그늘을 무늬 한 장에 구워 넣은 glb — 묶음마다 재질 하나.
   kit 의 art()/artInst() 는 색을 꼭짓점에 굽는 민짜 모델용이라, 이름이 BAKED 에 있으면 farm.js 가 여기 것으로 갈아 끼운다(이름·크기는 예전 모델과 같다).
   BAKED[이름] = { geo, mat, pivot(돌림 중심 — 조각 모델용) } */
import * as THREE from 'three';
import { GLTFLoader } from '/labs/vendor/three185/addons/loaders/GLTFLoader.js';

export const BAKED = {};
const BV = 4;
export async function loadBaked(...names) {
  const L = new GLTFLoader();
  await Promise.all(names.map(async (n) => {
    const g = await L.loadAsync(new URL(`../scene/assets/${n}.glb?v=${BV}`, import.meta.url).href); let mat = null;
    for (const node of g.scene.children) { let mesh = null; node.traverse((o) => { if (o.isMesh && !mesh) mesh = o; }); if (!mesh) continue;
      if (!mat) { const src = mesh.material; mat = new THREE.MeshStandardMaterial({ map: src.map, normalMap: src.normalMap || null, roughness: 0.9, metalness: 0 }); if (mat.map) mat.map.anisotropy = 4; mat.name = n; }
      const ge = mesh.geometry; if (ge.attributes.color) { ge.setAttribute('tmask', ge.attributes.color); ge.deleteAttribute('color'); }   /* 꼭짓점 색 = 옷 색 가리개(folk.js) — 그대로 두면 무늬에 곱해진다 */
      BAKED[node.name] = { geo: ge, mat, pivot: node.position.clone(), set: n }; }
  }));
  return BAKED;
}
export function bakedMesh(name, { shadow = true } = {}) { const B = BAKED[name], m = new THREE.Mesh(B.geo, B.mat); m.castShadow = shadow; m.receiveShadow = true; return m; }
const _d = new THREE.Object3D();
/* list = [[x, y, z, 크기(수 또는 [sx, sy, sz]), 돌림y], …] — kit artInst 와 같은 꼴.
   온 고을에 흩어진 것(담·나무·집)은 80칸 네모마다 한 묶음으로 나눠 화면(과 그림자 상자) 밖 묶음은 그리지 않는다 — 한 덩이로 두면 늘 전부 그려졌다.
   돌려주는 것 = 묶음들을 담은 Group(하나뿐이어도). 재질·그림자를 바꿀 때는 eachInst(m, fn) 으로. */
export function bakedInst(scene, name, list, { shadow = true } = {}) {
  const B = BAKED[name]; if (!B || !list.length) return null; const cells = {}, grp = new THREE.Group();
  for (const t of list) { const k = Math.floor(t[0] / 80) + ',' + Math.floor(t[2] / 80); (cells[k] = cells[k] || []).push(t); }
  for (const k in cells) { const L = cells[k], m = new THREE.InstancedMesh(B.geo, B.mat, L.length);
    L.forEach((t, i) => { _d.position.set(t[0], t[1], t[2]); const s = t[3] == null ? 1 : t[3]; if (Array.isArray(s)) _d.scale.set(s[0], s[1], s[2]); else _d.scale.setScalar(s); _d.rotation.set(0, t[4] || 0, 0); _d.updateMatrix(); m.setMatrixAt(i, _d.matrix); });
    m.castShadow = shadow; m.receiveShadow = true; m.computeBoundingSphere(); m.frustumCulled = true; grp.add(m); }
  scene.add(grp); return grp;
}
export const eachInst = (m, fn) => { if (!m) return; if (m.isGroup) m.children.forEach(fn); else fn(m); };
/* 색 곱하기 재질: 구운 흰 바탕(무명·깃털) 위에 가리개 tmask(R·G·B — 사람은 저고리·바지·머리칼) 자리만 색을 곱한다 — 무늬·그늘은 구운 그대로, 프로그램은 같이 쓴다 */
const _tm = {};
export function tintMat(base, colA = 0xffffff, colB = 0xffffff, colC = 0xffffff) { const k = base.name + '|' + colA + '|' + colB + '|' + colC; if (_tm[k]) return _tm[k]; const m = base.clone(), a = new THREE.Color(colA), b = new THREE.Color(colB), c = new THREE.Color(colC);
  m.onBeforeCompile = (sh) => { sh.uniforms.uTintA = { value: a }; sh.uniforms.uTintB = { value: b }; sh.uniforms.uTintC = { value: c };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 tmask; varying vec3 vTmask;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvTmask = tmask;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uTintA; uniform vec3 uTintB; uniform vec3 uTintC; varying vec3 vTmask;').replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= mix(vec3(1.0), uTintA, vTmask.r) * mix(vec3(1.0), uTintB, vTmask.g) * mix(vec3(1.0), uTintC, vTmask.b);'); };
  m.customProgramCacheKey = () => 'baked-tint3'; _tm[k] = m; return m; }
