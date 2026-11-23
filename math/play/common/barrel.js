/* 수학 놀이터 「통 · 뚜껑」 부품 — Pirate Kit Prop_Barrel 을 조각으로 나눠 속이 보이는 통과 뚜껑으로(T03 세기 틀에서 옮김 · T04 담아 주기 틀의 바구니 · 접시가 같이 씀).
 * 위 판자 넷 = 뚜껑 · 같은 판자를 바닥에 한 벌 · 안쪽 면이 보이게 양면. 새로 그린 도형 없음(모형 조각 그대로). */
/** 통 모형 → 조각 꾸러미 { body, lid, mat, inner, lc(뚜껑 가운데), h(통 높이), r }. */
export function barrelKit(stage, THREE, g){ const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z); g.scene.updateMatrixWorld(true); let mesh = null; g.scene.traverse(m => { if (m.isMesh && !mesh) mesh = m; });
  const ps = stage.pieces(mesh).map(p => { p.geo.applyMatrix4(mesh.matrixWorld); p.geo.computeBoundingBox(); p.center = p.geo.boundingBox.getCenter(V()); p.size = p.geo.boundingBox.getSize(V()); return p; });
  const top = Math.max(...ps.map(p => p.center.y)), lid = ps.filter(p => p.size.y < .05 && p.center.y > top - .05), body = ps.filter(p => !lid.includes(p));
  const box = new THREE.Box3(); lid.forEach(p => box.union(p.geo.boundingBox)); const inner = mesh.material.clone(); inner.side = THREE.DoubleSide;
  return { body, lid, mat: mesh.material, inner, lc: box.getCenter(V()), h: box.max.y, r: Math.max(...body.map(p => Math.hypot(p.center.x, p.center.z))) }; }
/** 속이 보이는 통: { root, body, layer(속에 담긴 것을 붙일 자리 — 크기를 늘리지 않음) }. s = 크기 · sy = 높이만 따로(바구니처럼 납작하게) · layerY = 통 높이에서 속 자리의 몫. */
export function makeTub(stage, THREE, kit, { s = 1, sy = s, layerY = .8 } = {}){ const root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.scale.set(s, sy, s);
  for (const p of kit.body) body.add(stage.shadows(new THREE.Mesh(p.geo, kit.inner)));
  for (const p of kit.lid) { const m = new THREE.Mesh(p.geo, kit.mat); m.position.y = -kit.lc.y + .03; body.add(stage.shadows(m)); }   /* 바닥 */
  const layer = new THREE.Group(); layer.position.y = kit.h * sy * layerY; root.add(layer); stage.scene.add(root); return { root, body, layer, fish: [] }; }
/** 뚜껑(판자 넷 원판) — 가운데가 원점. 접시로도 쓴다. */
export function makeLid(stage, THREE, kit, s = 1){ const root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.scale.setScalar(s);
  for (const p of kit.lid) { const m = new THREE.Mesh(p.geo, kit.mat); m.position.set(-kit.lc.x, -kit.lc.y, -kit.lc.z); g.add(stage.shadows(m)); }
  stage.scene.add(root); return root; }
