// 케이히스토리 엔진 · engine.js — 장면/렌더/GLB/상호작용 대상. 시대 이름을 모른다.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';
import { applyAtmosphere } from './atmosphere.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

export class Engine {
  constructor(canvas, atmosphere) {
    this.canvas = canvas;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9ec8ef);
    this.scene.fog = new THREE.Fog(0xc9dcec, 55, 150);
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 400);
    this.scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x7a6a4a, 0.35));
    const sun = this.sun = new THREE.DirectionalLight(0xffe9c8, 2.4);
    sun.position.set(-34, 26, 30); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera; sc.left = -60; sc.right = 60; sc.top = 60; sc.bottom = -60; sc.near = 1; sc.far = 160; sun.shadow.bias = -0.0006;
    this.scene.add(sun); this.scene.add(sun.target);
    this.atmosphere = atmosphere;
    if (atmosphere === 'warm-daylight') applyAtmosphere(this);
    this.materials = new Map();
    this.colliders = [];          // Box3 (col_*)
    this.interactables = new Map(); // id -> { type, id, obj, box, kind }
    this.areas = new Map();       // id -> Vector3
    this.spawn = new THREE.Vector3(0, 1.55, 0);
    this.hm = null; // 높이맵 {ext,n,h[j][i]} — y = h(x,z)
    this.clock = new THREE.Clock();
    this.onFrame = [];
    addEventListener('resize', () => this.resize()); this.resize();
  }
  resize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix();
    if (this.composer) { this.composer.setSize(innerWidth, innerHeight); this.gtao?.setSize(innerWidth, innerHeight); }
  }
  /** 후처리(고사양만): 구석 어둠(GTAO) · 불빛 번짐(블룸) · 계단 제거(SMAA). 실패하면 조용히 기본 렌더로 */
  enablePost(opts = {}) {
    try {
      const r = this.renderer; r.shadowMap.type = THREE.VSMShadowMap; this.sun.shadow.radius = 4; this.sun.shadow.blurSamples = 8;
      const c = this.composer = new EffectComposer(r);
      c.addPass(new RenderPass(this.scene, this.camera));
      const g = this.gtao = new GTAOPass(this.scene, this.camera, innerWidth, innerHeight);
      g.output = GTAOPass.OUTPUT.Default; g.blendIntensity = 0.85;
      g.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
      g.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, rings: 2, samples: 8 });
      c.addPass(g);
      const b = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), opts.bloom ?? 0.22, 0.6, 0.92); c.addPass(b);
      c.addPass(new OutputPass());
      c.addPass(new SMAAPass());
      this.post = true;
    } catch (e) { console.warn('post off', e); this.composer = null; this.post = false; }
  }
  async loadHeight(url) { this.hm = await (await fetch(url)).json(); }
  /** 지형 높이(월드 y). Blender y = -three z */
  groundY(x, z) {
    const m = this.hm; if (!m) return 0;
    const by = -z; const fx = (x + m.ext) / (2 * m.ext) * (m.n - 1), fy = (by + m.ext) / (2 * m.ext) * (m.n - 1);
    const i = Math.max(0, Math.min(m.n - 2, Math.floor(fx))), j = Math.max(0, Math.min(m.n - 2, Math.floor(fy)));
    const tx = Math.max(0, Math.min(1, fx - i)), ty = Math.max(0, Math.min(1, fy - j)); const h = m.h;
    return (h[j][i] * (1 - tx) + h[j][i + 1] * tx) * (1 - ty) + (h[j + 1][i] * (1 - tx) + h[j + 1][i + 1] * tx) * ty;
  }
  loadSky(url) {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    new THREE.TextureLoader().load(url, (t) => {
      t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
      this.scene.environment = pmrem.fromEquirectangular(t).texture; this.scene.environmentIntensity = 0.85;
      if (!this.atmosphere) { this.scene.background = t; this.scene.backgroundBlurriness = 0.02; }
      if (this.atmosphere) t.dispose();
      pmrem.dispose();
    });
  }
  /** GLB를 읽어 정적 메시는 재질별로 합치고, ix_* 는 개별 오브젝트로 남긴다 */
  loadWorld(url, eye) {
    return new Promise((res, rej) => new GLTFLoader().load(url, (g) => {
      g.scene.updateMatrixWorld(true);
      const groups = new Map();
      g.scene.traverse((o) => {
        if (o.name === 'spawn') { this.spawn = o.getWorldPosition(new THREE.Vector3()); return; }
        if (o.name.startsWith('area_')) { this.areas.set(o.name.slice(5), o.getWorldPosition(new THREE.Vector3())); return; }
        if (o.userData.taken) return;
        if (o.name.startsWith('ix_')) {
          // 여러 재질이면 GLTFLoader 가 Group + 자식 메시로 준다 → 하나의 대상으로 묶는다
          const [, type, ...rest] = o.name.split('_'); const id = rest.join('_') || type;
          const grp = new THREE.Group(); const parts = o.isMesh ? [o] : o.children.filter((c) => c.isMesh);
          for (const c of parts) { c.userData.taken = true; const m = new THREE.Mesh(c.geometry, c.material); m.applyMatrix4(c.matrixWorld); m.castShadow = true; m.receiveShadow = true; m.material.side = THREE.DoubleSide; grp.add(m); }
          this.scene.add(grp);
          const box = new THREE.Box3().setFromObject(grp);
          this.interactables.set(o.name.slice(3), { type, id, obj: grp, box, center: box.getCenter(new THREE.Vector3()), uses: 0, state: null, name: o.name.slice(3) });
          return;
        }
        if (!o.isMesh) return;
        this.materials.set(o.material.name, o.material);
        if (this.skipDecor && /^(hill|col_cave_rock|moss|cave_mouth|hut_pole|col_trunk|root|branch|canopy|leaf|grassblade|grasscard|blades|flower)/.test(o.name)) return;
        if (o.name.startsWith('col_')) { const b = new THREE.Box3().setFromObject(o); b.expandByScalar(0.3); this.colliders.push(b); }
        let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        geo.applyMatrix4(o.matrixWorld);
        for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) geo.deleteAttribute(k);
        if (!geo.attributes.color) geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 4).fill(1), 4));
        if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
        const key = o.material.uuid;
        if (!groups.has(key)) groups.set(key, { mat: o.material, geos: [] });
        groups.get(key).geos.push(geo);
      });
      for (const { mat, geos } of groups.values()) {
        const merged = BGU.mergeGeometries(geos, false); if (!merged) continue;
        mat.side = THREE.DoubleSide; mat.envMapIntensity = 0.7; mat.vertexColors = true;
        if (mat.name === 'water') { mat.roughness = 0.08; mat.metalness = 0.15; mat.transparent = true; mat.opacity = 0.86; mat.envMapIntensity = 1.2; }
        if (mat.alphaTest > 0 || mat.name === 'grassblade' || mat.name === 'moss' || mat.name === 'grasscard') { mat.alphaTest = Math.max(mat.alphaTest, 0.45); mat.transparent = false; mat.depthWrite = true; }
        const m = new THREE.Mesh(merged, mat); m.castShadow = true; m.receiveShadow = true; this.scene.add(m);
      }
      res();
    }, undefined, rej));
  }
  removeInteractable(key) {
    const it = this.interactables.get(key); if (!it) return;
    this.scene.remove(it.obj); this.interactables.delete(key);
  }
  /** 시선 기준 가까운 대상: 카메라 앞 반경 안, 각도 안 */
  pickTarget(camera, maxDist = 3.2, origin = camera.position) {
    const dir = camera.getWorldDirection(new THREE.Vector3()); const pos = origin; let best = null, bestScore = 1e9;
    for (const it of this.interactables.values()) {
      const to = it.center.clone().sub(pos); const d = to.length(); if (d > maxDist + it.box.getSize(new THREE.Vector3()).length() * 0.5) continue;
      to.normalize(); const ang = Math.acos(THREE.MathUtils.clamp(to.dot(dir), -1, 1)); if (ang > 0.55) continue;
      const score = d + ang * 2; if (score < bestScore) { bestScore = score; best = it; }
    }
    return best;
  }
  collides(p, eye) {
    const gy = this.groundY(p.x, p.z);
    const b = new THREE.Box3(new THREE.Vector3(p.x - 0.3, gy + 0.25, p.z - 0.3), new THREE.Vector3(p.x + 0.3, gy + eye, p.z + 0.3));
    for (const c of this.colliders) if (c.intersectsBox(b)) return true;
    return false;
  }
  start() {
    const loop = () => {
      const dt = Math.min(this.clock.getDelta(), 0.05);
      for (const f of this.onFrame) f(dt);
      if (this.composer) this.composer.render(dt); else this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(loop);
    };
    loop();
  }
}
