/* 케이파크 · 마블런 — stage/cameras.js
 * 전경(궤도) / 추적 카메라. 마블캠은 M3.
 *
 * ── 카메라 설계 원칙 (v2, 실기기 피드백 반영) ──
 *  1. **사용자 시점을 빼앗지 않는다.**
 *     v1은 부품을 놓을 때마다 cam.position을 초기값으로 덮어써서, 돌려놓은 각도·줌이
 *     탭 한 번에 전부 날아갔다. v2는 카메라 위치를 직접 쓰지 않는다.
 *     오직 **바라보는 점(target)만 부드럽게 옮기고**, 카메라는 상대 오프셋을 그대로 유지한다.
 *     → 한 번 잡은 각도·거리가 건설 내내 살아 있다.
 *
 *  2. **평소에는 카메라가 스스로 움직이지 않는다.** (v2.1)
 *     v2는 부품을 놓을 때마다 시선을 프론티어로 옮겼다. 결과: 회전 축이 트랙 끝에 박혀
 *     모든 조작이 끝을 중심으로 돌았고, 사용자가 잡은 구도가 계속 흔들렸다.
 *     v2.1의 규칙은 하나다 — **새 부품이 화면 밖으로 나갔을 때만** 시선을 옮긴다.
 *     화면 안에 있는 동안 카메라는 완전히 사용자 것이다. (ensureVisible)
 *
 *  3. 수동 조작 버튼: 🎯 = 짓는 자리로, 🗺 = 트랙 전체 담기.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createCameras(renderer, center) {
  const cam = new THREE.PerspectiveCamera(50, 1, 0.01, 40);
  cam.position.set(center.x + 0.55, 0.5, center.z + 0.65);

  const orbit = new OrbitControls(cam, renderer.domElement);
  orbit.target.set(center.x, 0.08, center.z);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.055;
  orbit.rotateSpeed = 0.45;
  orbit.zoomSpeed = 0.5;
  orbit.panSpeed = 0.8;
  orbit.minDistance = 0.15;
  orbit.maxDistance = 6.0;        // 긴 트랙 전체를 잡을 수 있게 확장 (v1: 2.5)
  orbit.maxPolarAngle = Math.PI * 0.49;
  orbit.update();

  let mode = 'orbit';
  const followOffset = new THREE.Vector3(0.22, 0.16, 0.22);
  const tmpTarget = new THREE.Vector3();

  const desired = orbit.target.clone();

  /* 사용자가 pan하면 desired를 손 위치에 동기화 — 자동 글라이드가 손을 되감지 않게 */
  orbit.addEventListener('start', () => {
    const before = orbit.target.clone();
    const probe = () => { if (!orbit.target.equals(before)) desired.copy(orbit.target); };
    const off = () => {
      orbit.removeEventListener('change', probe);
      orbit.removeEventListener('end', off);
    };
    orbit.addEventListener('change', probe);
    orbit.addEventListener('end', off);
  });

  function setMode(m) {
    mode = m;
    orbit.enabled = m === 'orbit';
  }

  /* 바라볼 점 지정. 카메라 위치는 건드리지 않는다 (상대 오프셋 유지). */
  function focus(point, opts) {
    const o = opts || {};
    desired.set(point.x, point.y != null ? point.y : 0.08, point.z);
    if (o.snap) {
      const off = cam.position.clone().sub(orbit.target);
      orbit.target.copy(desired);
      cam.position.copy(desired).add(off);
      orbit.update();
    }
  }

  /* 🎯 짓는 자리로 되돌리기 */
  function recenter(point) {
    if (point) focus(point);
  }

  /* 지점이 화면 밖(또는 가장자리 바깥 margin)이면 그때만 시선을 옮긴다.
   * 화면 안에 있는 동안엔 절대 카메라를 움직이지 않는다 — 조작감 보존의 핵심. */
  const projTmp = new THREE.Vector3();
  function ensureVisible(point, margin) {
    const m = margin != null ? margin : 0.78;
    cam.updateMatrixWorld();
    projTmp.set(point.x, point.y != null ? point.y : 0.08, point.z).project(cam);
    const off = projTmp.z > 1 || projTmp.z < -1 || Math.abs(projTmp.x) > m || Math.abs(projTmp.y) > m;
    if (off) focus(point);
    return off;
  }

  function isLocked() { return false; }              // 호환 스텁
  function onLockChange(fn) { fn(false); }           // 호환 스텁

  /* 여러 점을 한 화면에 담는다 — 각도는 유지, 거리만 조절 */
  function frameAll(points) {
    if (!points || !points.length) return;
    const box = new THREE.Box3();
    for (const p of points) box.expandByPoint(tmpTarget.set(p.x, p.y, p.z));
    const c = box.getCenter(new THREE.Vector3());
    const radius = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 0.12);
    const dist = Math.min(Math.max(
      radius / Math.sin((cam.fov * Math.PI) / 360) * 1.25,
      orbit.minDistance), orbit.maxDistance);
    const dir = cam.position.clone().sub(orbit.target);
    if (dir.lengthSq() < 1e-8) dir.set(0.55, 0.42, 0.65);
    dir.normalize();
    desired.copy(c);
    orbit.target.copy(c);
    cam.position.copy(c).add(dir.multiplyScalar(dist));
    orbit.update();
  }

  function update(marblePos) {
    if (mode === 'orbit') {
      if (!orbit.target.equals(desired)) {
        const off = cam.position.clone().sub(orbit.target);
        orbit.target.lerp(desired, 0.12);
        if (orbit.target.distanceTo(desired) < 1e-4) orbit.target.copy(desired);
        cam.position.copy(orbit.target).add(off);
      }
      orbit.update();
    } else if (marblePos) {
      tmpTarget.set(marblePos.x, marblePos.y, marblePos.z);
      const want = tmpTarget.clone().add(followOffset);
      cam.position.lerp(want, 0.08);
      cam.lookAt(tmpTarget);
    }
  }

  /* 첫 진입·초기화에서만 각도까지 리셋한다 */
  function setCenter(center) {
    desired.set(center.x, 0.08, center.z);
    orbit.target.copy(desired);
    cam.position.set(center.x + 0.55, 0.5, center.z + 0.65);
    orbit.update();
  }

  function resize(w, h) {
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }

  return { cam, orbit, setMode, getMode: () => mode, update, resize,
           setCenter, focus, recenter, frameAll, ensureVisible, isLocked, onLockChange };
}
