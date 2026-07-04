/* klab3-core.js — 케이랩 스튜디오 표준 v3 공용 코어 (과학실 검수 통과본 추출)
   렌더 표준: ACES + PMREM(RoomEnvironment) + PCFSoft + 다크 스튜디오 무대
   ⚠ 재질 규칙(함정 방지): 유리=블렌딩 / 액체=transmission — 임의 변경 금지 (설계서 §2-A) */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export { THREE };

/* ── 씬 부트 ── */
export function initScene(stage, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposure ?? 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  { // 스튜디오 배경 그라데이션 (토큰 §1)
    const c = document.createElement('canvas'); c.width = 4; c.height = 256;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#2b3340'); gr.addColorStop(0.55, '#1b2129'); gr.addColorStop(1, '#12161c');
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    const bg = new THREE.CanvasTexture(c); bg.colorSpace = THREE.SRGBColorSpace;
    scene.background = bg;
  }
  scene.fog = new THREE.Fog(0x161b22, opts.fogNear ?? 4.2, opts.fogFar ?? 9.5);

  const camera = new THREE.PerspectiveCamera(opts.fov ?? 40, innerWidth / innerHeight, 0.05, 30);
  camera.position.fromArray(opts.camPos ?? [0.95, 0.9, 1.6]);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.fromArray(opts.target ?? [0, 0.3, 0]);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = opts.minDist ?? 0.65;
  controls.maxDistance = opts.maxDist ?? 3.4;
  controls.maxPolarAngle = opts.maxPolar ?? 1.46;
  controls.enablePan = false;
  controls.update();

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const sun = new THREE.DirectionalLight(0xfff2e0, 2.6);
  sun.position.set(1.8, 3.4, 1.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -1.8; sun.shadow.camera.right = 1.8;
  sun.shadow.camera.top = 2.2; sun.shadow.camera.bottom = -0.6;
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 9;
  sun.shadow.bias = -0.0004; sun.shadow.radius = 5;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0x8fb4d8, 0x2b241c, 0.35));

  /* 품질 자동 (4초 FPS<38 → 저사양 프로필) */
  let frames = 0, fpsStart = performance.now(), checked = false;
  const lowCbs = [];
  function tickQuality() {
    frames++;
    if (checked) return;
    const now = performance.now();
    if (now - fpsStart > 4000) {
      checked = true;
      const fps = frames / ((now - fpsStart) / 1000);
      if (fps < 38) {
        renderer.setPixelRatio(1);
        sun.shadow.mapSize.set(1024, 1024);
        if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
        sun.shadow.radius = 3;
        lowCbs.forEach(f => { try { f(); } catch (e) {} });
      }
    }
  }
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  return { renderer, scene, camera, controls, sun,
           tickQuality, onLowQuality: f => lowCbs.push(f) };
}

/* ── 재질 프리셋 (설계서 §2-A 확정값) ── */
export function makeMaterials() {
  return {
    GLASS: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.03,
      transparent: true, opacity: 0.18, depthWrite: false,
      clearcoat: 1, clearcoatRoughness: 0.06,
      side: THREE.DoubleSide, envMapIntensity: 1.6
    }),
    METAL: new THREE.MeshStandardMaterial({ color: 0xb8bec6, metalness: 0.92, roughness: 0.32, envMapIntensity: 1.1 }),
    DARKMETAL: new THREE.MeshStandardMaterial({ color: 0x555b63, metalness: 0.85, roughness: 0.45 }),
    WOOD: new THREE.MeshStandardMaterial({ color: 0xC49A6C, roughness: 0.8 }),
    liquid(hex) {
      return new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0, roughness: 0.05,
        transmission: 1, thickness: 0.15, ior: 1.33,
        attenuationColor: new THREE.Color(hex), attenuationDistance: 0.16,
        envMapIntensity: 1.0
      });
    }
  };
}

/* ── 무대: 바닥 + 책상(에폭시 상판/원목 매트 선택) ── */
export function makeStage(scene, opts = {}) {
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(7, 48),
    new THREE.MeshStandardMaterial({ color: 0x6e747d, roughness: 0.95 })
  );
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.86;
  floor.receiveShadow = true; scene.add(floor);

  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  if (opts.deskStyle === 'wood') {
    g.fillStyle = '#8a6a45'; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 4) {
      const v = 118 + Math.sin(y * 0.7) * 14 + Math.random() * 10 | 0;
      g.fillStyle = `rgba(${v},${v * 0.75 | 0},${v * 0.5 | 0},0.5)`;
      g.fillRect(0, y, 256, 2 + Math.random() * 2);
    }
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(60,40,22,${Math.random() * 0.12})`;
      g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1);
    }
  } else { // epoxy (기본, 과학실)
    g.fillStyle = '#22262c'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) {
      const v = 30 + Math.random() * 26 | 0;
      g.fillStyle = `rgba(${v},${v + 3},${v + 7},${0.16 + Math.random() * 0.2})`;
      g.fillRect(Math.random() * 256, Math.random() * 256, 1.4, 1.4);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 2);

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.09, 1.7),
    new THREE.MeshStandardMaterial({
      map: tex, roughness: opts.deskStyle === 'wood' ? 0.6 : 0.34,
      metalness: 0.05, envMapIntensity: 0.7
    })
  );
  top.position.y = -0.045;
  top.receiveShadow = true; top.castShadow = true; scene.add(top);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.15, 0.76, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xE8E2D6, roughness: 0.8 })
  );
  body.position.y = -0.09 - 0.38;
  body.receiveShadow = true; body.castShadow = true; scene.add(body);
  return { benchY: 0, top };
}

/* ── 프로시저럴 텍스처 헬퍼 ── */
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function labelTexture(text, opts = {}) {
  return canvasTexture(opts.w ?? 256, opts.h ?? 128, (g, w, h) => {
    g.fillStyle = opts.bg ?? '#F6F1E7'; g.fillRect(0, 0, w, h);
    if (opts.frame !== false) {
      g.strokeStyle = opts.frameColor ?? '#B9522F'; g.lineWidth = 8;
      g.strokeRect(8, 8, w - 16, h - 16);
    }
    g.fillStyle = opts.ink ?? '#243043';
    g.font = `bold ${opts.size ?? 52}px sans-serif`;
    g.textAlign = 'center';
    g.fillText(text, w / 2, h / 2 + (opts.size ?? 52) * 0.36);
  });
}
