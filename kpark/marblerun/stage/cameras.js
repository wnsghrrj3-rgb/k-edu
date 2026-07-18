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
 *  2. **시선은 "짓고 있는 끝"을 따라간다.**
 *     v1의 타겟은 전체 부품의 무게중심이었다. 트랙이 길어질수록 시선은 한복판에 묶이고
 *     정작 다음 부품을 놓는 프론티어는 화면 밖으로 밀려났다.
 *     v2는 프론티어를 따라간다. 트랙이 어디로 뻗든 시선이 같이 간다.
 *
 *  3. **직접 옮기면 따라가기를 멈춘다.**
 *     손으로 화면을 끌어 옮기면(pan) 자동 추종을 잠근다. 자동 카메라가 손을 이겨버리면
 *     "화면이 안 움직인다"가 된다. 잠금은 🎯 버튼으로 언제든 푼다.
 *     회전·줌은 타겟을 안 건드리므로 잠그지 않는다 — 마음껏 돌려도 추종은 살아 있다.
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
  let userPanned = false;
  const lockListeners = [];
  const emitLock = () => lockListeners.forEach(fn => fn(userPanned));

  /* pan 조작만 잠금으로 취급한다 (회전·줌은 타겟을 안 옮긴다) */
  orbit.addEventListener('start', () => {
    const before = orbit.target.clone();
    let panned = false;
    const probe = () => { if (!orbit.target.equals(before)) panned = true; };
    const off = () => {
      orbit.removeEventListener('change', probe);
      orbit.removeEventListener('end', off);
      if (panned) {
        desired.copy(orbit.target);
        if (!userPanned) { userPanned = true; emitLock(); }
      }
    };
    orbit.addEventListener('change', probe);
    orbit.addEventListener('end', off);
  });

  function setMode(m) {
    mode = m;
    orbit.enabled = m === 'orbit';
  }

  /* 바라볼 점 지정. 카메라 위치는 건드리지 않는다. */
  function focus(point, opts) {
    const o = opts || {};
    if (userPanned && !o.force) return;
    desired.set(point.x, point.y != null ? point.y : 0.08, point.z);
    if (o.snap) {
      const off = cam.position.clone().sub(orbit.target);
      orbit.target.copy(desired);
      cam.position.copy(desired).add(off);
      orbit.update();
    }
  }

  /* 🎯 잠금 해제 + 되돌리기 */
  function recenter(point) {
    userPanned = false;
    emitLock();
    if (point) focus(point, { force: true });
  }

  function isLocked() { return userPanned; }
  function onLockChange(fn) { lockListeners.push(fn); fn(userPanned); }

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
    userPanned = false;
    emitLock();
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
    userPanned = false;
    emitLock();
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
           setCenter, focus, recenter, frameAll, isLocked, onLockChange };
}
