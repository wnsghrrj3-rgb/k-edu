/* 고고 — 모형(assets/gogo.glb · tools/make_gogo.py 로 빚음)을 읽고 얼굴을 다룬다.
 * 얼굴은 동작 클립이 아니라 코드가 맡는다: 눈 크기(eye_* 뼈 크기) · 눈꺼풀(lidU_* / lidD_* 뼈 돌림) · 눈길(pupil_* 뼈 돌림) ·
 * 어지러움 소용돌이(swirl_* 뼈) · 입(모양 키 smile · open · oh · wavy · worry).
 * 돌림은 모두 「고고가 서 있는 방향」 기준 축으로 준다(x = 고고의 왼쪽, y = 위, z = 앞) — 뼈가 어느 쪽으로 누워 있든 같다. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ── 수치: 표정(눈꺼풀은 도 — lidU +면 감기고 -면 더 뜬다 · lidD +면 아래 눈꺼풀이 올라온다)
export const FACE = {
  idle:  { eye: 1.00, lidU: 0,   lidD: 0,  pupil: 1.00, swirl: 0, mouth: {} },
  wow:   { eye: 1.17, lidU: -30, lidD: -8, pupil: 0.78, swirl: 0, mouth: { oh: 1 } },
  joy:   { eye: 1.03, lidU: 2,   lidD: 98, pupil: 1.00, swirl: 0, mouth: { open: 1 } },
  dizzy: { eye: 1.06, lidU: 30,  lidD: 24, pupil: 0.00, swirl: 1, mouth: { wavy: 1 } },
};
export const BLINK = { lidU: 102, lidD: 44 };  // 눈을 감은 값(위 눈꺼풀이 내려오고 아래가 마중 나와, 짙은 눈금이 ◡ 로 남는다). 눈동자 크기(pupil)는 1.1 을 넘기지 않는다(눈꺼풀을 뚫고 나온다)
export const GAZE = { YAW: 24, PITCH: 17 };  // 눈길이 끝까지 갔을 때의 각(도)
const MOUTHS = ['smile', 'open', 'oh', 'wavy', 'worry'];
const D = Math.PI / 180, AXES = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };

export async function loadGogo(url = new URL('./assets/gogo.glb?v=1', import.meta.url).href) {
  const gltf = await new GLTFLoader().loadAsync(url), root = gltf.scene, bones = {}, rest = {}, meshes = {};
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (o.isBone) bones[o.name] = o;
    if (o.isMesh) { meshes[o.name] = o; o.castShadow = true; o.frustumCulled = false; }   // 뼈로 크기가 바뀌므로 화면 밖 판정을 끈다
  });
  for (const [name, b] of Object.entries(bones)) {
    const inv = b.getWorldQuaternion(new THREE.Quaternion()).invert(), ax = {};
    for (const k in AXES) ax[k] = AXES[k].clone().applyQuaternion(inv);
    rest[name] = { q: b.quaternion.clone(), s: b.scale.clone(), p: b.position.clone(), ax };
  }
  const mouth = Object.values(meshes).find(m => m.morphTargetDictionary), q = new THREE.Quaternion(), q2 = new THREE.Quaternion();
  /** 뼈를 쉬는 자세에서 x·y·z 축(고고 기준)으로 돌린다(도). */
  function turn(name, x = 0, y = 0, z = 0) {
    const b = bones[name], r = rest[name]; q.copy(r.q);
    if (y) q.multiply(q2.setFromAxisAngle(r.ax.y, y * D));
    if (x) q.multiply(q2.setFromAxisAngle(r.ax.x, x * D));
    if (z) q.multiply(q2.setFromAxisAngle(r.ax.z, z * D));
    b.quaternion.copy(q); return b;
  }
  const size = (name, x, y = x, z = x) => { const r = rest[name]; bones[name].scale.set(r.s.x * x, r.s.y * y, r.s.z * z); };
  const face = { ...FACE.idle, mouth: {}, look: new THREE.Vector2(), spin: 0 };
  /** 얼굴 값을 그대로 입힌다(부드럽게 옮기는 일은 부르는 쪽이 한다). f = FACE 의 한 줄과 같은 모양 + look{x,y}(-1~1) + spin(도) */
  function setFace(f) {
    Object.assign(face, f);
    for (const n of ['L', 'R']) {
      size('eye_' + n, face.eye);
      turn('lidU_' + n, face.lidU); turn('lidD_' + n, -face.lidD);
      const p = Math.max(face.pupil, 0.001), sink = face.pupil < 0.25 ? 0.3 : 1;        // 눈동자를 숨길 때는 흰자 속으로
      turn('pupil_' + n, -face.look.y * GAZE.PITCH, face.look.x * GAZE.YAW); size('pupil_' + n, p * sink, sink, p * sink);
      turn('swirl_' + n, 0, 0, (n === 'L' ? 1 : -1) * face.spin); size('swirl_' + n, 0.9 + 1.32 * face.swirl);
    }
    if (mouth) for (const k of MOUTHS) mouth.morphTargetInfluences[mouth.morphTargetDictionary[k]] = (face.mouth && face.mouth[k]) || 0;
  }
  /** 모든 뼈를 쉬는 자세로. */
  function resetPose() { for (const [n, b] of Object.entries(bones)) { const r = rest[n]; b.quaternion.copy(r.q); b.scale.copy(r.s); b.position.copy(r.p); } }
  setFace(FACE.idle);
  return { root, bones, rest, meshes, mouth, animations: gltf.animations, turn, size, setFace, resetPose, face };
}
