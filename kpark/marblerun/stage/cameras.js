/* 케이파크 · 마블런 — stage/cameras.js
 * 전경(궤도) / 추적 카메라. 마블캠은 M3.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createCameras(renderer, center) {
  const cam = new THREE.PerspectiveCamera(50, 1, 0.01, 20);
  cam.position.set(center.x + 0.55, 0.5, center.z + 0.65);

  const orbit = new OrbitControls(cam, renderer.domElement);
  orbit.target.set(center.x, 0.08, center.z);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.08;
  orbit.minDistance = 0.15;
  orbit.maxDistance = 2.5;
  orbit.maxPolarAngle = Math.PI * 0.49;
  orbit.update();

  let mode = 'orbit'; // 'orbit' | 'follow'
  const followOffset = new THREE.Vector3(0.22, 0.16, 0.22);
  const tmpTarget = new THREE.Vector3();

  function setMode(m) {
    mode = m;
    orbit.enabled = m === 'orbit';
  }

  function update(marblePos) {
    if (mode === 'orbit') {
      orbit.update();
    } else if (marblePos) {
      tmpTarget.set(marblePos.x, marblePos.y, marblePos.z);
      const want = tmpTarget.clone().add(followOffset);
      cam.position.lerp(want, 0.08);
      cam.lookAt(tmpTarget);
    }
  }

  function resize(w, h) {
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }

  return { cam, setMode, getMode: () => mode, update, resize };
}
