// 케이히스토리 엔진 · visuals.js — 하늘·빛·물·공기 같은 「보이는 것」만. 규칙은 모른다.
import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const NOISE = /* glsl */`
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float a = .5, s = 0.; for (int k = 0; k < 5; k++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
`;

/** 절차 하늘 돔: 해·지평선 안개·천천히 흐르는 구름. 카메라를 따라다니고 안개 색을 자기 지평선 색으로 맞춘다. */
export function addSkyDome(e, opts = {}) {
  const sunDir = e.sun.position.clone().normalize();
  const u = {
    uTime: { value: 0 }, uSun: { value: sunDir },
    uZenith: { value: new THREE.Color(opts.zenith ?? 0x3f7fb8) },
    uHorizon: { value: new THREE.Color(opts.horizon ?? 0xd9dfd6) },
    uHaze: { value: new THREE.Color(opts.haze ?? 0xf1e2c0) },
    uSunColor: { value: new THREE.Color(0xfff0cf) },
    uCloud: { value: opts.cloud ?? 0.55 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    vertexShader: /* glsl */`varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }`,
    fragmentShader: /* glsl */`
      precision highp float; varying vec3 vDir;
      uniform float uTime, uCloud; uniform vec3 uSun, uZenith, uHorizon, uHaze, uSunColor;
      ${NOISE}
      void main(){
        vec3 d = normalize(vDir); float y = clamp(d.y, -0.2, 1.0);
        float t = pow(max(y, 0.0), 0.55);
        vec3 col = mix(uHorizon, uZenith, t);
        // 낮은 곳: 따뜻한 안개띠(해 방향이 더 진하다)
        float sunSide = pow(max(dot(normalize(vec3(d.x, 0., d.z)), normalize(vec3(uSun.x, 0., uSun.z))), 0.0), 2.0);
        col = mix(col, uHaze, smoothstep(0.35, 0.0, y) * (0.55 + 0.35 * sunSide));
        // 해: 원반 + 넓은 광륜
        float sd = max(dot(d, uSun), 0.0);
        col += uSunColor * (pow(sd, 900.0) * 3.0 + pow(sd, 32.0) * 0.35 + pow(sd, 6.0) * 0.08);
        // 구름: 지평선 근처가 두껍고 천정은 맑다
        if (y > 0.02) {
          vec2 p = d.xz / (y + 0.18) * 1.6 + vec2(uTime * 0.006, uTime * 0.002);
          float n = fbm(p); float cov = smoothstep(0.52, 0.72, n) * uCloud * smoothstep(0.0, 0.25, y) * smoothstep(0.95, 0.35, y);
          float lit = 0.75 + 0.35 * pow(sd, 3.0);
          vec3 cloud = mix(vec3(0.82, 0.86, 0.92), vec3(1.0, 0.97, 0.9), lit);
          col = mix(col, cloud * lit, cov);
        }
        // 땅 밑은 지평선 색으로 덮는다(지형이 가린다)
        col = mix(uHorizon, col, smoothstep(-0.2, 0.0, d.y));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(300, 40, 24), mat);
  dome.frustumCulled = false; dome.renderOrder = -1000; dome.name = 'skydome';
  e.scene.add(dome); e.scene.background = null; e.skyDome = dome;
  if (e.scene.fog) e.scene.fog.color.copy(u.uHorizon.value).lerp(u.uHaze.value, 0.35);
  e.onFrame.push((dt) => { u.uTime.value += dt; dome.position.copy(e.camera.position); u.uSun.value.copy(e.sun.position).sub(e.sun.target.position).normalize(); });
  return dome;
}

/** 햇빛 속 먼지·꽃가루: 카메라 주위 상자 안에서 떠다니고, 벗어나면 반대편으로 되감긴다. */
export function addMotes(e, count = 360, range = 22) {
  const pos = new Float32Array(count * 3), seed = new Float32Array(count);
  for (let i = 0; i < count; i++) { pos[i * 3] = (Math.random() - .5) * range * 2; pos[i * 3 + 1] = Math.random() * 9; pos[i * 3 + 2] = (Math.random() - .5) * range * 2; seed[i] = Math.random(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const u = { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uRange: { value: range }, uPR: { value: Math.min(devicePixelRatio, 2) } };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: /* glsl */`
      uniform float uTime, uRange, uPR; uniform vec3 uCam; attribute float seed; varying float vA;
      void main(){
        vec3 p = position + vec3(sin(uTime * .3 + seed * 6.28) * .6, sin(uTime * .5 + seed * 12.0) * .35 + fract(seed * 7.0 + uTime * .02) * 0.0, cos(uTime * .25 + seed * 9.0) * .6);
        // 카메라 기준 되감기
        vec3 rel = mod(p - uCam + uRange, uRange * 2.0) - uRange; rel.y = mod(p.y, 9.0);
        vec3 w = uCam + rel; w.y = uCam.y - 3.0 + rel.y;
        vec4 mv = modelViewMatrix * vec4(w, 1.0);
        float d = -mv.z; vA = smoothstep(uRange, uRange * .35, d) * (0.35 + 0.65 * seed) * smoothstep(0.6, 3.0, d);
        gl_PointSize = (2.2 + seed * 3.5) * uPR * (18.0 / max(d, 1.0));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying float vA;
      void main(){ vec2 c = gl_PointCoord - .5; float r = length(c); if (r > .5) discard; float a = smoothstep(.5, .1, r) * vA * .55; gl_FragColor = vec4(1.0, .93, .78, a); }`,
  });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.name = 'motes'; e.scene.add(pts);
  e.onFrame.push((dt) => { u.uTime.value += dt; u.uCam.value.copy(e.camera.position); });
  return pts;
}

/** 물: 잔물결(정점)과 흐르는 노멀맵. 시대 landscape 가 이미 노멀맵을 얹었으면 그건 그대로 둔다. */
export function enhanceWater(e) {
  const water = e.materials?.get('water'); if (!water) return;
  const time = { value: 0 };
  if (!water.normalMap) {
    const n = 64, data = new Uint8Array(n * n * 4);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const i = (y * n + x) * 4, u = x / n * Math.PI * 2, v = y / n * Math.PI * 2; data[i] = 128 + Math.sin(u * 3 + Math.sin(v * 2)) * 26; data[i + 1] = 128 + Math.cos(v * 4 + u) * 22; data[i + 2] = 250; data[i + 3] = 255; }
    const t = new THREE.DataTexture(data, n, n); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = t.minFilter = THREE.LinearFilter; t.repeat.set(14, 14); t.needsUpdate = true;
    water.normalMap = t; water.normalScale.set(.3, .3);
    e.onFrame.push((dt) => { t.offset.x = (t.offset.x + dt * .015) % 1; t.offset.y = (t.offset.y + dt * .008) % 1; });
  }
  water.roughness = Math.min(water.roughness, 0.14); water.metalness = 0.05; water.envMapIntensity = 1.4; water.transparent = true; water.opacity = Math.min(water.opacity, 0.84);
  const prev = water.onBeforeCompile;
  water.onBeforeCompile = (s, r) => {
    prev?.(s, r); s.uniforms.uWTime = time;
    s.vertexShader = 'uniform float uWTime;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      transformed.y += sin(uWTime * 1.1 + position.x * 0.9 + position.z * 0.6) * 0.035 + sin(uWTime * 1.7 + position.z * 1.6) * 0.02;`);
  };
  water.customProgramCacheKey = () => 'kworld-water-v1'; water.needsUpdate = true;
  e.onFrame.push((dt) => { time.value += dt; });
}

/** 색 보정 패스: 대비·채도, 그림자는 차갑게·밝은 곳은 따뜻하게, 비네트, 아주 옅은 필름 알갱이 */
export function makeGradePass() {
  const pass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uStrength: { value: 1 } },
    vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform sampler2D tDiffuse; uniform float uTime, uStrength; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec3 c = texture2D(tDiffuse, vUv).rgb;
        float l = dot(c, vec3(.299, .587, .114));
        // 스플릿 톤: 어두운 곳 푸르게, 밝은 곳 노을빛으로
        c += (vec3(-0.02, 0.0, 0.045) * (1.0 - l) + vec3(0.04, 0.02, -0.02) * l) * uStrength;
        // 채도·대비
        c = mix(vec3(l), c, 1.0 + 0.14 * uStrength);
        c = (c - 0.5) * (1.0 + 0.08 * uStrength) + 0.5;
        // 비네트
        vec2 q = vUv - .5; float v = 1.0 - dot(q, q) * 0.9; c *= mix(1.0, clamp(v, 0.0, 1.0), 0.55 * uStrength);
        // 알갱이
        c += (hash(vUv * 1024.0 + fract(uTime)) - 0.5) * 0.018 * uStrength;
        gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
      }`,
  });
  return pass;
}

/** 표면 텍스처: GLB 재질 이름 → tex/<set> (albedo·normal·rough). UV 는 월드 좌표 상자 투영으로 새로 만든다(절차 GLB 는 UV 가 없다). */
const _texCache = new Map();
function loadSet(name, tile) {
  const key = name + ':' + tile; if (_texCache.has(key)) return _texCache.get(key);
  const L = new THREE.TextureLoader(); const mk = (f, srgb) => { const t = L.load(`/kworld/tex/${name}_${f}`); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const set = { map: mk('albedo.jpg', true), normalMap: mk('normal.jpg'), roughnessMap: mk('rough.jpg'), tile };
  _texCache.set(key, set); return set;
}
export function boxProjectUV(geo, tile) {
  const p = geo.attributes.position, n = geo.attributes.normal; const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i += 3) {
    let ax = 0, ay = 0, az = 0; for (let k = 0; k < 3; k++) { ax += Math.abs(n.getX(i + k)); ay += Math.abs(n.getY(i + k)); az += Math.abs(n.getZ(i + k)); }
    for (let k = 0; k < 3; k++) { const x = p.getX(i + k), y = p.getY(i + k), z = p.getZ(i + k); let u, v;
      if (ay >= ax && ay >= az) { u = x; v = z; } else if (ax >= az) { u = z; v = y; } else { u = x; v = y; }
      uv[(i + k) * 2] = u / tile; uv[(i + k) * 2 + 1] = v / tile; }
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
/** surfaces: { 재질이름: { set: 'rock', tile: 2.5, tint: 0.2 } } — tint 는 원래 색을 얼마나 남길지(0=텍스처 그대로) */
export function applySurfaces(e, surfaces) {
  e.scene.traverse((o) => {
    if (!o.isMesh || !o.material?.name) return; const cfg = surfaces[o.material.name]; if (!cfg) return;
    const m = o.material; if (m.userData.surfaced) return; m.userData.surfaced = true;
    const s = loadSet(cfg.set, cfg.tile ?? 2.5);
    m.map = s.map; m.normalMap = s.normalMap; m.roughnessMap = s.roughnessMap; m.roughness = 1; m.metalness = 0;
    m.normalScale = new THREE.Vector2(cfg.normal ?? 0.9, cfg.normal ?? 0.9);
    m.color.lerp(new THREE.Color(0xffffff), 1 - (cfg.tint ?? 0.25)); m.vertexColors = !!o.geometry.attributes.color; m.needsUpdate = true;
    if (o.geometry.index) o.geometry = o.geometry.toNonIndexed();
    if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
    boxProjectUV(o.geometry, cfg.tile ?? 2.5);
  });
}
