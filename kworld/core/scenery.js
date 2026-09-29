// 케이히스토리 엔진 · scenery.js — 「멀리·가까이 보이는 것」만: 원경 산 실루엣 3겹 · 바람 타는 풀 · 하늘의 새 · 햇빛 속 꽃가루. 규칙은 모른다.
//  world.scenery 가 있을 때만 켜진다(코어는 시대 이름을 모른다). 무거운 후처리 없이 그리기 4번(산 3 + 풀 1)과 점 둘로 끝난다 — 프레임을 떨어뜨리지 않는 층.
import * as THREE from 'three';

const NOISE = /* glsl */`
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float a = .5, s = 0.; for (int k = 0; k < 4; k++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
`;
const h2 = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };

/** 원경 산 — 카메라를 따라다니는 띠 셋. 안개 너머라 fog 는 끄고, 매 프레임 안개 색에 섞어 밤에도 어울리게 한다. */
export function addFarMountains(e, opts = {}) {
  const rings = opts.rings || [
    { r: 175, h: 34, color: 0x5f7a8c, mix: 0.42, seed: 3.1, freq: 2.2 },
    { r: 225, h: 52, color: 0x54708a, mix: 0.62, seed: 7.7, freq: 1.7 },
    { r: 285, h: 74, color: 0x4d6a86, mix: 0.78, seed: 12.3, freq: 1.3 },
  ];
  const group = new THREE.Group(); group.name = 'far-mountains';
  const uFog = { value: new THREE.Color(0xdfe3d6) }, uTime = { value: 0 };
  rings.forEach((R, idx) => {
    const seg = 160, pos = [], uv = [], idxs = [];
    for (let i = 0; i <= seg; i++) {
      const a = i / seg * Math.PI * 2, x = Math.cos(a) * R.r, z = Math.sin(a) * R.r;
      pos.push(x, -12, z, x, 1, z); uv.push(i / seg, 0, i / seg, 1);
      if (i < seg) { const b = i * 2; idxs.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idxs);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uFog, uTime, uColor: { value: new THREE.Color(R.color) }, uMix: { value: R.mix }, uH: { value: R.h }, uSeed: { value: R.seed }, uFreq: { value: R.freq }, uSnow: { value: opts.snow ?? 0 } },
      side: THREE.DoubleSide, depthWrite: false, fog: false, transparent: true,
      vertexShader: /* glsl */`
        uniform float uH, uSeed, uFreq; varying float vY; varying float vSky; varying vec2 vUv; ${NOISE}
        void main(){
          vUv = uv; float a = uv.x * 6.28318;
          // 능선: 각도로 이어지는 잡음(이음매 없이 — 원 위의 점으로 샘플)
          vec2 c = vec2(cos(a), sin(a)) * uFreq + uSeed;
          float n = fbm(c * 1.7) * 0.75 + fbm(c * 5.3) * 0.25;
          float ridge = pow(n, 1.35) * uH;
          vec3 p = position; if (uv.y > 0.5) p.y = ridge; vY = p.y / max(uH, 1.0); vSky = uv.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uFog, uColor; uniform float uMix, uSnow; varying float vY; varying float vSky; varying vec2 vUv;
        void main(){
          // 아래는 안개에 잠기고 위로 갈수록 산 색이 드러난다. 먼 띠일수록 안개에 더 섞인다.
          float haze = uMix + (1.0 - uMix) * smoothstep(0.9, 0.05, vY);
          vec3 col = mix(uColor, uFog, haze);
          col = mix(col, vec3(0.97, 0.98, 1.0), uSnow * smoothstep(0.55, 0.95, vY) * (1.0 - uMix * 0.6));
          float a = 1.0 - smoothstep(0.985, 1.0, vSky);   // 능선 끝은 살짝 부드럽게
          gl_FragColor = vec4(col, a);
        }`,
    });
    const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = -900 + idx; m.name = 'far-mountain-' + idx; group.add(m);
  });
  e.scene.add(group);
  e.onFrame.push((dt) => { uTime.value += dt; group.position.set(e.camera.position.x, opts.baseY ?? -2, e.camera.position.z); if (e.scene.fog) uFog.value.copy(e.scene.fog.color); });
  return group;
}

/** 풀 — 카메라 둘레 격자에 심는 인스턴스 풀 포기(십자 판 둘). 자리는 격자 칸 해시로 정해 걸어도 튀지 않는다. 물가·가파른 곳·길(스플랫 trampled)엔 안 난다. */
export function addGrass(e, opts = {}, quality = 'high') {
  const count = opts.count ?? ({ high: 2600, mid: 1500, low: 700 }[quality] || 1500);
  const R = opts.radius ?? 34, waterY = opts.waterY ?? -0.5, shore = opts.shore ?? 1.0, maxSlope = opts.slope ?? 0.55;
  const avoid = (opts.avoid || []).map(([x, z, r]) => ({ x, z, r }));
  // 잎 질감(캔버스): 아래 넓고 위 뾰족한 잎 셋
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128; const c = cv.getContext('2d');
  c.clearRect(0, 0, 64, 128);
  const blade = (x0, w, h, lean) => { c.beginPath(); c.moveTo(x0 - w, 128); c.quadraticCurveTo(x0 - w * 0.4 + lean * 0.5, 128 - h * 0.55, x0 + lean, 128 - h); c.quadraticCurveTo(x0 + w * 0.4 + lean * 0.5, 128 - h * 0.55, x0 + w, 128); c.closePath(); c.fillStyle = '#fff'; c.fill(); };
  blade(32, 5, 122, -4); blade(20, 4, 92, -10); blade(45, 4, 100, 8);
  const tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4;
  // 십자 판 둘, 밑동이 원점
  const geo = new THREE.BufferGeometry(); const P = [], U = [], I = [];
  [0, Math.PI / 2].forEach((ang, q) => { const cx = Math.cos(ang) * 0.5, cz = Math.sin(ang) * 0.5; const b = q * 4;
    P.push(-cx, 0, -cz, cx, 0, cz, cx, 1, cz, -cx, 1, -cz); U.push(0, 0, 1, 0, 1, 1, 0, 1); I.push(b, b + 1, b + 2, b, b + 2, b + 3); });
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); geo.setIndex(I);
  const seed = new Float32Array(count); for (let i = 0; i < count; i++) seed[i] = Math.random();
  geo.setAttribute('seed', new THREE.InstancedBufferAttribute(seed, 1));
  const u = { uTime: { value: 0 }, uMap: { value: tex }, uCam: { value: new THREE.Vector3() }, uR: { value: R }, uLight: { value: 1 }, uSunC: { value: new THREE.Color(0xffd9a0) }, uBase: { value: new THREE.Color(opts.base ?? 0x4d6b2a) }, uTip: { value: new THREE.Color(opts.tip ?? 0xb8c96a) }, uDry: { value: new THREE.Color(opts.dry ?? 0xc8b66a) }, fogColor: { value: new THREE.Color() }, fogNear: { value: 1 }, fogFar: { value: 100 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.DoubleSide, transparent: false, alphaTest: 0.5, fog: true,
    vertexShader: /* glsl */`
      uniform float uTime, uR; uniform vec3 uCam; attribute float seed; varying vec2 vUv; varying float vFade; varying float vSeed; varying float vDist; ${NOISE}
      void main(){
        vUv = uv; vSeed = seed;
        vec4 w = instanceMatrix * vec4(position, 1.0);
        // 바람: 잎 끝만, 자리마다 다르게 · 손이 스치듯 큰 물결 + 잔떨림
        float sway = (sin(uTime * 1.3 + w.x * 0.35 + w.z * 0.27) * 0.5 + sin(uTime * 2.7 + seed * 12.0) * 0.18 + 0.12) * uv.y * uv.y;
        w.x += sway * 0.32; w.z += sway * 0.14 * sin(seed * 7.0);
        float d = distance(w.xz, uCam.xz); vDist = d; vFade = 1.0 - smoothstep(uR * 0.72, uR * 0.98, d);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap; uniform float uLight; uniform vec3 uSunC, uBase, uTip, uDry, fogColor; uniform float fogNear, fogFar; varying vec2 vUv; varying float vFade; varying float vSeed; varying float vDist;
      void main(){
        float a = texture2D(uMap, vUv).a; if (a < 0.5 || vFade < 0.02) discard;
        // 멀어질수록 성기게(픽셀 단위 디더로 사라진다 — 갑자기 튀지 않음)
        float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453); if (dither > vFade) discard;
        vec3 col = mix(uBase, uTip, vUv.y * vUv.y); col = mix(col, uDry, smoothstep(0.55, 0.95, vSeed) * 0.6);
        col *= (0.55 + 0.45 * vUv.y) * mix(vec3(0.35, 0.4, 0.55), uSunC * 1.05 + 0.15, uLight);   // 밤엔 푸르게 가라앉는다
        float f = smoothstep(fogNear, fogFar, vDist); col = mix(col, fogColor, f);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count); mesh.name = 'meadow-grass'; mesh.frustumCulled = false; mesh.receiveShadow = false; mesh.castShadow = false; e.scene.add(mesh);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), T = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  const side = Math.ceil(Math.sqrt(count)), step = (R * 2) / side; let lastX = 1e9, lastZ = 1e9;
  const tooSteep = (x, z) => { const y = e.groundY(x, z); return Math.abs(e.groundY(x + 0.8, z) - y) > maxSlope * 0.8 || Math.abs(e.groundY(x, z + 0.8) - y) > maxSlope * 0.8; };
  const scatter = (cx, cz) => {
    const gx0 = Math.floor((cx - R) / step), gz0 = Math.floor((cz - R) / step); let n = 0;
    for (let j = 0; j < side && n < count; j++) for (let i = 0; i < side && n < count; i++) {
      const gx = gx0 + i, gz = gz0 + j; const r1 = h2(gx * 1.3, gz * 0.7), r2 = h2(gx * 0.4, gz * 1.9), r3 = h2(gx + 5.5, gz - 2.5);
      const x = (gx + r1) * step, z = (gz + r2) * step; if (Math.abs(x) > e.hm?.ext - 2 || Math.abs(z) > e.hm?.ext - 2) continue;
      const y = e.groundY(x, z); if (y < waterY + shore) continue; if (tooSteep(x, z)) continue;
      let skip = false; for (const a of avoid) if (Math.hypot(a.x - x, a.z - z) < a.r) { skip = true; break; } if (skip) continue;
      if (r3 < (opts.thin ?? 0.12)) continue;   // 군데군데 빈자리
      const sc = 0.55 + r3 * 0.9; S.set(sc * (0.8 + r1 * 0.5), sc, sc * (0.8 + r2 * 0.5)); Q.setFromAxisAngle(Y, r1 * 6.283); T.set(x, y - 0.05, z);
      M.compose(T, Q, S); mesh.setMatrixAt(n++, M);
    }
    mesh.count = n; mesh.userData.fullCount = n; mesh.instanceMatrix.needsUpdate = true;
  };
  e.onFrame.push((dt) => {
    u.uTime.value += dt; const cp = e.camera.position; u.uCam.value.copy(cp);
    if (Math.hypot(cp.x - lastX, cp.z - lastZ) > R * 0.28) { lastX = cp.x; lastZ = cp.z; scatter(cp.x, cp.z); }
    u.uLight.value = Math.max(0.06, Math.min(1, e.sun.intensity / 2.35)); u.uSunC.value.copy(e.sun.color);
    if (e.scene.fog) { u.fogColor.value.copy(e.scene.fog.color); u.fogNear.value = e.scene.fog.near; u.fogFar.value = e.scene.fog.far; }
  });
  return mesh;
}

/** 새 — 높이 나는 작은 무리(날개 두 삼각형). 카메라를 느슨하게 따라 큰 원을 돈다. 해가 지면 사라진다. */
export function addBirds(e, opts = {}) {
  const n = opts.count ?? 11; const P = new Float32Array(n * 6 * 3), B = new Float32Array(n * 6), W = new Float32Array(n * 6 * 2);
  for (let i = 0; i < n; i++) for (let k = 0; k < 6; k++) { B[i * 6 + k] = i; const side = k < 3 ? -1 : 1, v = k % 3; const w = [[0, 0], [side, 0.35], [side * 0.55, -0.05]][v];
    W[(i * 6 + k) * 2] = w[0]; W[(i * 6 + k) * 2 + 1] = w[1]; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('bird', new THREE.BufferAttribute(B, 1)); g.setAttribute('wing', new THREE.BufferAttribute(W, 2));
  const u = { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uAlpha: { value: 1 }, uH: { value: opts.height ?? 46 }, uR: { value: opts.radius ?? 70 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.DoubleSide, transparent: true, depthWrite: false, fog: false,
    vertexShader: /* glsl */`
      uniform float uTime, uH, uR; uniform vec3 uCam; attribute float bird; attribute vec2 wing; varying float vA;
      void main(){
        float ph = bird * 0.618; float t = uTime * 0.11 + bird * 0.07;
        // 무리 중심이 큰 원을 돌고, 새마다 조금씩 앞뒤·위아래로 어긋난다
        vec3 c = vec3(cos(t) * uR, uH + sin(t * 1.7 + ph * 6.0) * 4.0 + bird * 0.6, sin(t) * uR * 0.75);
        c.xz += uCam.xz * 0.35; c += vec3(sin(ph * 9.0) * 6.0, 0.0, cos(ph * 7.0) * 6.0);
        vec3 fwd = normalize(vec3(-sin(t), 0.0, cos(t) * 0.75)); vec3 right = normalize(cross(vec3(0,1,0), fwd));
        float flap = sin(uTime * (7.0 + ph) + ph * 20.0);
        vec3 p = c + right * wing.x * 0.9 + vec3(0.0, wing.y * flap * 0.9, 0.0) + fwd * wing.y * 0.4;
        vA = 1.0;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`uniform float uAlpha; void main(){ gl_FragColor = vec4(0.09, 0.1, 0.12, 0.85 * uAlpha); }`,
  });
  const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.name = 'birds'; e.scene.add(m);
  e.onFrame.push((dt) => { u.uTime.value += dt; u.uCam.value.copy(e.camera.position); u.uAlpha.value = Math.max(0, Math.min(1, (e.sun.intensity - 0.4) / 1.2)); });
  return m;
}

/** 꽃가루·먼지 — 후처리 없이도 도는 가벼운 점(더하기 섞기 없음). 낮에만 보인다. */
export function addPollen(e, count = 140, range = 13) {
  const pos = new Float32Array(count * 3), seed = new Float32Array(count);
  for (let i = 0; i < count; i++) { pos[i * 3] = (Math.random() - .5) * range * 2; pos[i * 3 + 1] = Math.random() * 6; pos[i * 3 + 2] = (Math.random() - .5) * range * 2; seed[i] = Math.random(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const u = { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uRange: { value: range }, uPR: { value: Math.min(devicePixelRatio, 2) }, uAlpha: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, fog: false,
    vertexShader: /* glsl */`
      uniform float uTime, uRange, uPR; uniform vec3 uCam; attribute float seed; varying float vA;
      void main(){
        vec3 p = position + vec3(sin(uTime * .25 + seed * 6.28) * .8, sin(uTime * .4 + seed * 12.0) * .3 - uTime * 0.08 * (0.5 + seed), cos(uTime * .2 + seed * 9.0) * .8);
        vec3 rel = mod(p - uCam + uRange, uRange * 2.0) - uRange; rel.y = mod(p.y, 6.0);
        vec3 w = uCam + rel; w.y = uCam.y - 2.0 + rel.y;
        vec4 mv = modelViewMatrix * vec4(w, 1.0); float d = -mv.z;
        vA = smoothstep(uRange, uRange * .4, d) * (0.3 + 0.7 * seed) * smoothstep(0.5, 2.5, d);
        gl_PointSize = (1.6 + seed * 2.4) * uPR * (14.0 / max(d, 1.0)); gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`varying float vA; uniform float uAlpha; void main(){ vec2 c = gl_PointCoord - .5; float r = length(c); if (r > .5) discard; gl_FragColor = vec4(1.0, .95, .8, smoothstep(.5, .15, r) * vA * .5 * uAlpha); }`,
  });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.name = 'pollen'; e.scene.add(pts);
  e.onFrame.push((dt) => { u.uTime.value += dt; u.uCam.value.copy(e.camera.position); u.uAlpha.value = Math.max(0, Math.min(1, (e.sun.intensity - 0.3) / 1.2)); });
  return pts;
}

/** 손맛 — 걷는 동안 아주 옅게 흔들리는 카메라 롤(놀이기구 아님, 숨 쉬는 정도) */
export function addHandFeel(e, player) {
  let t = 0;
  e.onFrame.push((dt) => { if (e.cameraOverride) return; t += dt; const mv = player?.moving ? 1 : 0.35; e.camera.rotation.z += Math.sin(t * 1.9) * 0.0016 * mv + Math.sin(t * 0.7) * 0.0009; });
}

/** world.scenery = { mountains:{…}|true, grass:{…}|true, birds:true, pollen:true, handFeel:true } */
export function addScenery(e, cfg, quality = 'high', player = null) {
  if (!cfg) return;
  const o = (v) => (v === true ? {} : v);
  if (cfg.mountains) addFarMountains(e, o(cfg.mountains));
  if (cfg.grass && quality !== 'low') addGrass(e, o(cfg.grass), quality);
  if (cfg.birds) addBirds(e, o(cfg.birds));
  if (cfg.pollen) addPollen(e);
  if (cfg.handFeel && player) addHandFeel(e, player);
}
