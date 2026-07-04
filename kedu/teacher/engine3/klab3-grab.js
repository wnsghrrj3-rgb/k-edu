/* klab3-grab.js — 평면 구속 드래그 + 탭 판정 (여러 물체 등록형) */
import * as THREE from 'three';

export function makeGrab(renderer, camera, controls, planeY = 0) {
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
  const hit = new THREE.Vector3();
  const items = [];   // {proxy, target, clamp:{x:[..],z:[..]}, onMove, onTap, enabled()}
  let cur = null, downPos = null, moved = false;

  function toNDC(e) {
    ndc.x = (e.clientX / innerWidth) * 2 - 1;
    ndc.y = -(e.clientY / innerHeight) * 2 + 1;
  }
  function pickItem(e) {
    toNDC(e); ray.setFromCamera(ndc, camera);
    for (const it of items) {
      if (it.enabled && !it.enabled()) continue;
      if (!it.target.visible) continue;
      if (ray.intersectObject(it.proxy, true).length) return it;
    }
    return null;
  }

  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => {
    const it = pickItem(e);
    if (!it) return;
    cur = it; moved = false; downPos = { x: e.clientX, y: e.clientY };
    controls.enabled = false;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!cur) {
      el.style.cursor = pickItem(e) ? 'grab' : '';
      return;
    }
    if (downPos && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6) moved = true;
    if (cur.fixed) return;   // 탭 전용(드래그 안 됨)
    toNDC(e); ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) {
      const cl = cur.clamp || {};
      cur.target.position.x = THREE.MathUtils.clamp(hit.x, (cl.x || [-1.35, 1.35])[0], (cl.x || [-1.35, 1.35])[1]);
      cur.target.position.z = THREE.MathUtils.clamp(hit.z, (cl.z || [-0.6, 0.6])[0], (cl.z || [-0.6, 0.6])[1]);
      if (cur.onMove) cur.onMove(cur.target);
    }
  });
  function end() {
    if (!cur) return;
    const it = cur; cur = null;
    controls.enabled = true;
    if (!moved && it.onTap) it.onTap(it.target);
    else if (moved && it.onDrop) it.onDrop(it.target);
  }
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);

  return {
    add(item) { items.push(item); return item; },
    makeProxy(target, r = 0.15, h = 0.3, y = 0.12) {
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, h, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      p.position.y = y; target.add(p); return p;
    }
  };
}
