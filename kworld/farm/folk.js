/* 「다섯 해」 사람 — 구워 입힌 모델(ffolk.glb, tools/blender/make_ffolk.py). 준호 11-23 「블렌더로 해서 좀 더 제대로」.
   조각(머리·몸통·팔 둘·다리 둘)의 돌림 중심이 kit 의 사람과 같아 walkAnim·몸짓(beasts.js workPose)이 그대로 돈다.
   쓰개·수염은 머리와 한 덩이로 합친다(그리기 한 번). 옷 색은 구운 흰 무명 위에 사람마다 곱한다 — 꼭짓점 가리개 tmask(R 저고리 · G 바지). */
import * as THREE from 'three';
import { mergeGeometries } from '/labs/vendor/three185/addons/utils/BufferGeometryUtils.js';
import { BAKED, tintMat } from './models.js?v=2';

const HATS = { scarf: 'hat_scarf', gat: 'hat_gat', paeraengi: 'hat_paeraengi', guard: 'hat_guard' };
export function folkKit(scene) {
  const heads = {};
  const headGeo = (hat, beard) => { const k = hat + (beard ? '+b' : ''); if (!heads[k]) heads[k] = mergeGeometries([BAKED.folk_head.geo, BAKED[HATS[hat] || 'hat_knot'].geo, ...(beard ? [BAKED.folk_beard.geo] : [])]); return heads[k]; };
  const matOf = (shirt, pants) => tintMat(BAKED.folk_head.mat, shirt, pants);
  /* o = { shirt, pants, hat: 'scarf'|'gat'|'paeraengi'|'guard'|그 밖(맨상투), beard } — 갓 쓴 이는 수염을 기른다 */
  function person({ shirt = 0xf2ead8, pants = 0xe8e2d2, hat = null, beard = null } = {}) {
    const g = new THREE.Group(), mat = matOf(shirt, pants), mk = (geo) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; };
    const head = mk(headGeo(hat, beard == null ? hat === 'gat' : beard)), body = mk(BAKED.folk_body.geo), limbs = {};
    for (const n of ['legL', 'legR', 'armL', 'armR']) { const p = new THREE.Group(), B = BAKED['folk_' + n]; p.position.copy(B.pivot); p.add(mk(B.geo)); limbs[n] = p; }
    g.add(limbs.legL, limbs.legR, body, limbs.armL, limbs.armR, head);
    g.userData = { legL: limbs.legL, legR: limbs.legR, armL: limbs.armL, armR: limbs.armR, head, lantern: false };
    scene.add(g); return g;
  }
  return { person };
}
