/* 공통 엔진 · 무대 — 그리기 · 빛 · 그림자 · 카메라(화면 비율에 맞춰 물러남) · 흔들림 · 화면 자리 · 돌리기.
 * 구역 페이지는 createStage() 로 무대를 만들고, 매 장면의 일(step)을 stage.play(step) 에 넘긴다. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export { THREE };

export const Q = new URLSearchParams(location.search), D = Math.PI / 180;
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x)), rand = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
export const AUTO = Q.has('auto');                        // 머리 없는 브라우저로 정해 둔 차례를 돌리는 중

/** 무대를 만든다. o = { canvas, sky:[위, 가운데, 아래 색], cam:{ AIM, TILT(도), FOV, HALF_W(가로로 다 보여야 하는 반 너비), MIN_DIST },
 *  hemi:[하늘빛, 땅빛, 세기], sun:{ color, power, pos:[x,y,z], box:[left,right,top,bottom] }, exposure } */
export function createStage(o) {
  const canvas = o.canvas, renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: AUTO });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = o.exposure ?? 0.98;
  const scene = new THREE.Scene();
  { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256), sky = o.sky || ['#e6dcf6', '#d6cbee', '#b9a8dc'];
    gr.addColorStop(0, sky[0]); gr.addColorStop(0.55, sky[1]); gr.addColorStop(1, sky[2]); x.fillStyle = gr; x.fillRect(0, 0, 4, 256); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; scene.background = tx; }
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
  const h = o.hemi || ['#fff6ec', '#b9a2d6', 0.85]; scene.add(new THREE.HemisphereLight(h[0], h[1], h[2]));
  const su = o.sun || {}, sun = new THREE.DirectionalLight(su.color || '#fff1d6', su.power ?? 2.5), box = su.box || [-5.5, 5.5, 5, -4];
  sun.position.set(...(su.pos || [-3.2, 7.5, 6])); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: box[0], right: box[1], top: box[2], bottom: box[3], near: 1, far: 24 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4; scene.add(sun);
  const C = o.cam, camera = new THREE.PerspectiveCamera(C.FOV, 1, 0.1, 80), camBase = new THREE.Vector3(), aim = new THREE.Vector3(...C.AIM);
  const st = { shake: 0, ready: false, onResize: null, lift: 0, liftNow: 0, lifted: false };
  function resize() {
    renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight;
    const dist = Math.max(C.MIN_DIST, C.HALF_W / (Math.tan(C.FOV * D / 2) * camera.aspect)), a = C.TILT * D;       // 무대가 가로로 다 들어오게 물러난다
    camBase.set(aim.x, aim.y + Math.sin(a) * dist, aim.z + Math.cos(a) * dist); camera.position.copy(camBase); camera.lookAt(aim); camera.updateProjectionMatrix(); camera.updateMatrixWorld();   // 그리기 전에 눌러도 자리가 맞게
    if (st.onResize) st.onResize(); if (AUTO && st.ready) renderer.render(scene, camera);
  }
  addEventListener('resize', resize); resize();
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), tmp = new THREE.Vector3();
  /** 세계의 한 점이 화면 어디인가(픽셀). */
  const screenOf = p => { tmp.copy(p).project(camera); return { x: (tmp.x + 1) / 2 * innerWidth, y: (1 - tmp.y) / 2 * innerHeight }; };
  /** 화면의 한 점에서 나간 빛줄기가 평면과 만나는 자리. */
  const worldOn = (plane, x, y, out) => { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(plane, out); };
  const rayAt = (x, y) => { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.ray; };
  /** 매 장면 끝에 부른다: 흔들림이 잦아들고, 카메라가 st.lift(높이 쌓인 것을 따라 올라갈 만큼)를 부드럽게 따라간다. */
  const tick = dt => {
    st.shake *= Math.exp(-9 * dt); st.liftNow += (st.lift - st.liftNow) * (1 - Math.exp(-2.5 * dt)); const l = st.liftNow;
    camera.position.set(camBase.x + rand(-1, 1) * st.shake, camBase.y + l * 0.85 + rand(-1, 1) * st.shake, camBase.z + l * 1.5);
    if (l > 0.001 || st.lifted) { camera.lookAt(aim.x, aim.y + l * 0.55, aim.z); camera.updateMatrixWorld(); st.lifted = l > 0.001; }
  };
  const render = () => renderer.render(scene, camera);
  /** 돌리기 시작(자동 확인 중에는 돌리지 않는다 — auto.js 가 장면을 넘긴다). */
  function play(step) {
    st.ready = true; if (AUTO) return; let last = performance.now();
    renderer.setAnimationLoop(now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; step(dt); tick(dt); render(); });
  }
  return { THREE, canvas, renderer, scene, camera, camBase, aim, sun, st, resize, screenOf, worldOn, rayAt, tick, render, play, shake: a => { st.shake = Math.max(st.shake, a); } };
}
