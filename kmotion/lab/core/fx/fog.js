// 케이모션 과학실 — 찬 질소 안개. 찬 기체라 **아래로 가라앉아** 상판을 타고 퍼지다 가장자리에서 폭포처럼 흘러내린다. 위로 올라가면 가짜다. (설계 6-3)
// 세 겹으로 만든다:
//   ① 융단 — 상판 위에 깔린 안개. 상판을 격자(64×20)로 나눠 짙기를 계산한다(짙은 곳에서 옅은 곳으로, 짙을수록 빨리 퍼짐 = 무거운 기체가 제 무게로 깔리는 모양).
//            그릴 때는 상판 위 얇은 판 세 겹(높이 0.8·2.8·5.2cm)에 그 짙기 + 흐르는 잡음 결. 조각 수백 장으로 깔 때보다 훨씬 이어져 보이고 겹쳐 그리는 넓이도 작다.
//   ② 폭포 — 융단이 가장자리 밖으로 밀려난 양만큼 상판 옆면을 타고 떨어지는 막(격자, 아래로 흐르며 옅어짐).
//   ③ 덩어리 — 부드러운 연기 조각(한 번에 그림): 그릇 가장자리에서 넘쳐 구르는 김, 들고 가는 찬 물체에서 흘러내리는 김, 마무리 구름.
// 그리는 법: 화면의 절반 크기 그림에 따로 그린 뒤 본 화면에 한 장으로 얹는다(겹쳐 그리는 값 1/4).
//   장면의 깊이만 작은 그림에 먼저 그리고(비치는 것은 FX_LAYER 층에 두어 뺀다) 안개는 그 깊이와 견주어 물체·상판에 부드럽게 묻힌다.
//   다 같은 흰빛이라 그리는 차례를 맞추지 않아도 겹친 결과가 같다(미리 곱한 알파).
// 시간은 update(dt) 로만 흐른다. 그림은 본 장면이 그려질 때 한 번만 다시 그린다(scene.onBeforeRender) → advance() 로 여러 걸음 흘려도 그리기는 한 번.
import * as THREE from 'three';

export const FX_LAYER = 20;      // 이 층의 물체는 안개 깊이 그림에서 빠진다(유리·액체·붓는 줄기처럼 비치는 것)
const MAX = 600;                 // 덩어리 조각 최대 장수
const GW = 64, GH = 20, CH = 24, DROP = .74;   // 융단 격자 · 폭포 격자(아래로 24칸 = 0.74m)
const KD = .055, NU = .0012, D_MAX = 1.25;     // 퍼지는 빠르기(짙기에 비례) · 바탕 퍼짐 · 짙기 한도

// ── 연기 조각 무늬 4장(2×2): R,G = 볼록한 결(빛 받는 방향), B,A = 짙기. 받아 오지 않고 여기서 만든다.
function makePuffAtlas(rand){
  const C = 128, S = C * 2, den = new Float32Array(S * S), data = new Uint8Array(S * S * 4);
  const G = 64, lat = new Float32Array(G * G * 4); for (let i = 0; i < lat.length; i++) lat[i] = rand();
  const vn = (x, y, o) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const at = (a, b) => lat[(((b % G) + G) % G * G + ((a % G) + G) % G) * 4 + o]; return (at(xi, yi) * (1 - sx) + at(xi + 1, yi) * sx) * (1 - sy) + (at(xi, yi + 1) * (1 - sx) + at(xi + 1, yi + 1) * sx) * sy; };
  for (let c = 0; c < 4; c++) {
    const ox = (c % 2) * C, oy = (c >> 1) * C, blobs = []; for (let k = 0; k < 5; k++) blobs.push([(rand() - .5) * .7, (rand() - .5) * .7, .34 + rand() * .3]);
    blobs.push([0, 0, .55]);
    const k0 = c < 2 ? .6 : .38, k1 = c < 2 ? .7 : 1.15, k2 = c < 2 ? .05 : .16;                     // 0·1 = 뭉게뭉게, 2·3 = 결이 더 풀린 것
    for (let y = 0; y < C; y++) for (let x = 0; x < C; x++) {
      const u = (x + .5) / C * 2 - 1, v = (y + .5) / C * 2 - 1, r = Math.hypot(u, v);
      let keep = 1; for (const [bx, by, br] of blobs) { const d = Math.hypot(u - bx, v - by) / br; if (d < 1) keep *= 1 - (1 - d * d) * (1 - d * d) * .8; } const b = 1 - keep;
      const n = vn(u * 3.1 + c * 9.7, v * 3.1 + 3.3, c) * .55 + vn(u * 7.3 + 1.7, v * 7.3 + c * 5.1, c) * .3 + vn(u * 15 + 4.1, v * 15, c) * .15;
      let d = b * (k0 + k1 * n) - k2; d *= Math.min(1, Math.max(0, (1 - r) / .4));                    // 가장자리는 반드시 0
      den[(oy + y) * S + ox + x] = Math.min(1, Math.max(0, d * 1.25));
    }
  }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, cx0 = Math.floor(x / C) * C, cy0 = Math.floor(y / C) * C;
    const g = (a, b) => den[Math.min(cy0 + C - 1, Math.max(cy0, b)) * S + Math.min(cx0 + C - 1, Math.max(cx0, a))];
    const dx = (g(x + 2, y) - g(x - 2, y)) * 2.2, dy = (g(x, y + 2) - g(x, y - 2)) * 2.2, l = Math.hypot(dx, dy, 1);
    data[i * 4] = Math.round((-dx / l * .5 + .5) * 255); data[i * 4 + 1] = Math.round((-dy / l * .5 + .5) * 255);
    const a = den[i], s = Math.pow(a, 1.15); data[i * 4 + 2] = data[i * 4 + 3] = Math.round(s * 255);
  }
  const t = new THREE.DataTexture(data, S, S, THREE.RGBAFormat); t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t;
}

// ── 덩어리 조각(카메라를 보는 판)
const PUFF_VS = /* glsl */`
attribute vec4 iPos;   // 자리 xyz · 크기(m)
attribute vec4 iPar;   // 돌림 · 짙기 · 세로 늘임 · 무늬 번호
uniform float uTan, uMaxFrac; uniform vec2 uNearFade;
varying vec2 vUv; varying vec2 vRot; varying vec3 vAux;   // 짙기 · 무늬 · 거리
varying float vSoft;
void main(){
  vec4 mv = viewMatrix * vec4(iPos.xyz, 1.0);
  float dist = -mv.z;
  float size = min(iPos.w, uMaxFrac * max(dist, 0.0) * uTan);         // 화면 차지 한도(겹쳐 그리는 넓이를 묶는다)
  float a = iPar.y * smoothstep(uNearFade.x, uNearFade.y, dist);       // 카메라 코앞은 옅게
  if (a < 0.004 || dist < 0.03) size = 0.0;
  float c = cos(iPar.x), s = sin(iPar.x);
  vec2 q = vec2(c * position.x - s * position.y, s * position.x + c * position.y);
  q.y *= iPar.z;
  mv.xy += q * size;
  vUv = position.xy + 0.5; vRot = vec2(c, s); vAux = vec3(a, iPar.w, dist); vSoft = max(size * 0.3, 0.01);
  gl_Position = projectionMatrix * mv;
}`;
const PUFF_FS = /* glsl */`
#include <packing>
uniform sampler2D uTex, uDepth; uniform vec2 uRes; uniform float uNear, uFar; uniform vec3 uLightV;
varying vec2 vUv; varying vec2 vRot; varying vec3 vAux; varying float vSoft;
void main(){
  float ci = floor(vAux.y + 0.5); vec2 cell = vec2(mod(ci, 2.0), floor(ci * 0.5 + 0.01));
  vec4 t = texture2D(uTex, (clamp(vUv, 0.004, 0.996) + cell) * 0.5);
  float d = texture2D(uDepth, gl_FragCoord.xy / uRes).x;
  float sceneZ = -perspectiveDepthToViewZ(d, uNear, uFar);
  float soft = clamp((sceneZ - vAux.z) / vSoft, 0.0, 1.0);             // 물체·상판에 닿는 곳은 부드럽게 묻힌다
  float a = t.b * vAux.x * soft;
  if (a < 0.002) discard;
  vec2 n = t.rg * 2.0 - 1.0; n = vec2(vRot.x * n.x - vRot.y * n.y, vRot.y * n.x + vRot.x * n.y);
  float lit = clamp(0.76 + 0.24 * dot(n, uLightV.xy) + 0.14 * t.b, 0.0, 1.0);   // 볼록한 결에 창 쪽 빛
  gl_FragColor = vec4(lit * a, a, a, a);
}`;

// ── 융단·폭포(짙기 격자를 읽는 얇은 판)
const SHEET_VS = /* glsl */`
uniform vec3 uO, uA, uB;            // 판의 한 귀퉁이 · 가로 벡터 · 세로 벡터(세계 좌표)
uniform vec4 uUv;                   // 안개가 있는 칸만 그린다: 시작(u,v) · 크기(u,v)
varying vec2 vUv; varying vec3 vW; varying float vDist;
void main(){
  vec2 st = uUv.xy + uv * uUv.zw;
  vec3 wp = uO + uA * st.x + uB * st.y; vec4 mv = viewMatrix * vec4(wp, 1.0);
  vUv = st; vW = wp; vDist = -mv.z; gl_Position = projectionMatrix * mv;
}`;
const SHEET_FS = /* glsl */`
#include <packing>
uniform sampler2D uDen, uFxNoise, uDepth; uniform vec2 uRes, uTexel; uniform float uNear, uFar, uTime;
uniform vec4 uL;                    // 문턱 · 짙기 곱 · 밝기 · 결 씨앗
uniform vec3 uLightW; uniform vec3 uHoles[4]; uniform vec2 uHoleB[4]; uniform float uBenchY;   // 그릇 자리: 가운데 xz · 가장자리 반지름 / 바닥 반지름 · 가장자리 높이
varying vec2 vUv; varying vec3 vW; varying float vDist;
float fxHole(vec2 p, vec3 h, vec2 hb){ float r = mix(hb.x, h.z, clamp((vW.y - uBenchY) / max(hb.y, 0.001), 0.0, 1.0)); return smoothstep(r * 0.98, r * 1.1 + 0.004, distance(p, h.xy)); }
void main(){
  float d = texture2D(uDen, vUv).r * ${D_MAX.toFixed(2)};
#ifdef CURTAIN
  // 폭포: 아래로 길게 흐르는 결
  vec2 np = vec2(dot(vW.xz, vec2(1.0)) * 1.1 + uL.w, vW.y * 0.42 + uTime * 0.2);
  float n = texture2D(uFxNoise, np).r * 0.6 + texture2D(uFxNoise, np * vec2(2.3, 1.6) + vec2(0.31, uTime * 0.13)).r * 0.4;
  float brk = smoothstep(0.0, 0.4, vUv.y);                                 // 턱 바로 아래는 한 장으로 이어져 넘치고, 내려갈수록 가닥으로 갈라진다
  float e = d * mix(1.5, 0.45 + 1.6 * n, brk) - uL.x * (1.0 - n) * brk;
  e *= smoothstep(0.0, 0.05, vUv.y) * (1.0 - 0.55 * smoothstep(0.35, 1.0, vUv.y));   // 가장자리 턱에서 말려 내려와 · 아래로 갈수록 흩어져 옅다
  float glow = 0.56 + 0.44 * n;
#else
  // 융단: 잡음 두 겹이 천천히 엇갈려 흐르며 가장자리를 실처럼 풀어 놓는다
  vec2 wp = vW.xz;
  float n = texture2D(uFxNoise, wp * 0.9 + vec2(uTime * 0.021, uTime * 0.013) + uL.w).r * 0.6 + texture2D(uFxNoise, wp * 2.3 - vec2(uTime * 0.034, uTime * 0.019) + uL.w * 1.7).r * 0.4;
  float e = d * (0.45 + 1.1 * n) - uL.x - 0.3 * (1.0 - n) * (1.0 - smoothstep(0.0, 0.9, d));
  e *= fxHole(wp, uHoles[0], uHoleB[0]) * fxHole(wp, uHoles[1], uHoleB[1]) * fxHole(wp, uHoles[2], uHoleB[2]) * fxHole(wp, uHoles[3], uHoleB[3]);                    // 그릇 자리는 비운다(반복문 없이)
  // 짙기의 기울기 = 볼록한 결 → 창 쪽이 밝다
  float d0 = d / ${D_MAX.toFixed(2)}; vec2 g = vec2(texture2D(uDen, vUv + vec2(uTexel.x * 1.5, 0.0)).r - d0, texture2D(uDen, vUv + vec2(0.0, uTexel.y * 1.5)).r - d0) * 1.4;
  float n2 = texture2D(uFxNoise, wp * 5.1 + vec2(uTime * 0.05, -uTime * 0.04) + uL.w * 2.3).r;
  float glow = 0.5 + 0.6 * (n - 0.5) + 0.5 * (n2 - 0.5) - dot(g, uLightW.xz) * 2.2;
  e *= 0.8 + 0.4 * n2;
  { vec2 bq = min(vUv, 1.0 - vUv); e *= smoothstep(0.0, 0.012, bq.x) * smoothstep(0.0, 0.035, bq.y); }   // 가장자리 턱에서는 폭포에 넘겨준다
#endif
  float sceneZ = -perspectiveDepthToViewZ(texture2D(uDepth, gl_FragCoord.xy / uRes).x, uNear, uFar);
  float soft = clamp((sceneZ - vDist) / 0.02, 0.0, 1.0);
  float a = (1.0 - exp(-max(e, 0.0) * uL.y)) * soft;
  if (a < 0.003) discard;                                                   // 버리기는 무늬를 다 읽은 뒤 맨 끝에서 한 번만
  float lit = clamp(uL.z + 0.55 * (glow - 0.5), 0.0, 1.0);
  gl_FragColor = vec4(lit * a, a, a, a);
}`;
const COMP_VS = /* glsl */`attribute vec2 aClip; varying vec2 vUv; void main(){ vUv = aClip * 0.5 + 0.5; gl_Position = vec4(aClip, 0.0, 1.0); }`;
const COMP_FS = /* glsl */`
uniform sampler2D uFog; uniform vec3 uLit, uShade; uniform float uWhite, uTime; varying vec2 vUv;
void main(){
  vec4 f = texture2D(uFog, vUv);
  float a = clamp(f.a, 0.0, 1.0), b = a > 0.001 ? clamp(f.r / a, 0.0, 1.0) : 0.0;
  vec3 col = mix(uShade, uLit, b);
  // 마무리 구름: 화면을 잠깐 하얗게(아래쪽이 먼저 짙어진다)
  float w = clamp(uWhite * (1.25 - 0.5 * vUv.y + 0.12 * sin(vUv.x * 9.0 + uTime * 1.3) * sin(vUv.y * 7.0 - uTime)), 0.0, 1.0);
  float A = a + w * (1.0 - a);
  col = A > 0.001 ? (col * a + uLit * 0.97 * w * (1.0 - a)) / A : col;
  gl_FragColor = vec4(col, A);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor.rgb *= A;
}`;

/**
 * const fog = createFog(ctx, { count, scale, light: Vector3(빛이 오는 쪽) })
 *   매 프레임: fog.update(dt)
 *   그릇 가장자리: const rim = fog.rim(center:Vector3|Object3D, radius, baseRadius);  rim.boil = 0~1 (끓는 세기)   ← 융단·폭포의 샘이기도 하다
 *   들고 가는 찬 물체: const tr = fog.trail(object3D, { radius });        tr.rate = 0~1 (차가울수록 큼)
 *   마무리 구름: fog.burst(center:Vector3, strength = 1)                   → fog.white (0~1, 화면 하얀 정도)
 *   낱장: fog.emit(x, y, z, vx, vy, vz, size0, size1, life, alpha) · 융단에 보태기: fog.add(x, z, amount, radius)
 */
export function createFog(ctx, opt = {}){
  const { scene, camera } = ctx, rand = ctx.rand, B = ctx.bench;
  let cap = Math.min(MAX, opt.count || ctx.q.fog), scale = opt.scale || ctx.q.fogScale;
  const F = n => new Float32Array(n);
  const px = F(MAX), py = F(MAX), pz = F(MAX), vx = F(MAX), vy = F(MAX), vz = F(MAX), age = F(MAX), life = F(MAX), s0 = F(MAX), s1 = F(MAX), al = F(MAX), rot = F(MAX), rotV = F(MAX),
    ox = F(MAX), oz = F(MAX), oR = F(MAX), oY = F(MAX), seed = F(MAX), sink = F(MAX), delay = F(MAX), str = F(MAX), cell = F(MAX), fed = new Uint8Array(MAX);

  // ── 그림 둘: 장면 깊이(작게) · 안개(작게)  + 본 장면에 얹는 한 장
  const depthTex = new THREE.DepthTexture(4, 4); depthTex.minFilter = depthTex.magFilter = THREE.NearestFilter;
  const depthRT = new THREE.WebGLRenderTarget(4, 4, { depthTexture: depthTex, depthBuffer: true, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const fogRT = new THREE.WebGLRenderTarget(4, 4, { depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const fogScene = new THREE.Scene(); fogScene.matrixWorldAutoUpdate = false;
  const blend = { depthTest: false, depthWrite: false, transparent: true, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor };
  const SH = { uDepth: { value: depthTex }, uRes: { value: new THREE.Vector2(4, 4) }, uNear: { value: .05 }, uFar: { value: 30 }, uTime: { value: 0 } };   // 모든 안개 재질이 같이 쓰는 값

  // ── ① 융단 ② 폭포: 짙기 격자
  const den = F(GW * GH), den2 = F(GW * GH), solid = new Uint8Array(GW * GH), outF = F(GW), outL = F(GH), outR = F(GH);
  const cF = F(GW * CH), cL = F(GH * CH), cR = F(GH * CH);
  const tex = (w, h) => { const t = new THREE.DataTexture(new Uint8Array(w * h), w, h, THREE.RedFormat); t.magFilter = t.minFilter = THREE.LinearFilter; t.needsUpdate = true; return t; };
  const tDen = tex(GW, GH), tF = tex(GW, CH), tL = tex(GH, CH), tR = tex(GH, CH);
  const lightW = (opt.light || new THREE.Vector3(-3.2, 3.4, 1.2)).clone().normalize();
  const holes = [0, 1, 2, 3].map(() => new THREE.Vector3(1e5, 1e5, 0)), holeB = [0, 1, 2, 3].map(() => new THREE.Vector2(0, 1));
  const sheetGeo = new THREE.PlaneGeometry(1, 1), sheets = [];
  function sheet(curtain, t, w, h, o, a, b, L){
    const m = new THREE.ShaderMaterial({ ...blend, side: THREE.DoubleSide, defines: curtain ? { CURTAIN: '' } : {}, vertexShader: SHEET_VS, fragmentShader: SHEET_FS,
      uniforms: { ...SH, uDen: { value: t }, uFxNoise: { value: ctx.noise }, uTexel: { value: new THREE.Vector2(1 / w, 1 / h) }, uO: { value: o }, uA: { value: a }, uB: { value: b }, uUv: { value: new THREE.Vector4(0, 0, 1, 1) }, uL: { value: L }, uLightW: { value: lightW }, uHoles: { value: holes }, uHoleB: { value: holeB }, uBenchY: { value: B.y } } });
    const s = new THREE.Mesh(sheetGeo, m); s.frustumCulled = false; s.visible = false; s.userData.curtain = curtain; s.userData.t = t; fogScene.add(s); sheets.push(s); return s;
  }
  const V = () => new THREE.Vector3();
  //                                                     문턱  짙기 곱  밝기  결 씨앗
  const sh0 = sheet(false, tDen, GW, GH, V(), V(), V(), new THREE.Vector4(0, 2.1, .46, .0));
  const sh1 = sheet(false, tDen, GW, GH, V(), V(), V(), new THREE.Vector4(.16, 2.0, .62, .37));
  const sh2 = sheet(false, tDen, GW, GH, V(), V(), V(), new THREE.Vector4(.4, 2.0, .8, .71));
  sh2.userData.extra = true;                                                                                          // 하 등급에서는 뺀다
  const cF0 = sheet(true, tF, GW, CH, V(), V(), V(), new THREE.Vector4(.1, 2.6, .6, .0));                            // 앞 가장자리
  const cF1 = sheet(true, tF, GW, CH, V(), V(), V(), new THREE.Vector4(.3, 2.2, .72, .43)); cF1.userData.extra = true;
  const cL0 = sheet(true, tL, GH, CH, V(), V(), V(), new THREE.Vector4(.1, 2.6, .6, .2));                            // 왼쪽
  const cR0 = sheet(true, tR, GH, CH, V(), V(), V(), new THREE.Vector4(.1, 2.6, .6, .6));                            // 오른쪽
  let bw = 1, bd = 1, cdx = 1, cdz = 1, carpetMass = 0, boost = 0;
  /** 상판 네모가 정해지거나 바뀌면 판 자리를 다시 놓는다(ctx.bench 를 읽는다) */
  function layout(){
    bw = B.x1 - B.x0; bd = B.z1 - B.z0; cdx = bw / GW; cdz = bd / GH;
    const put = (s, ox, oy, oz, ax, az, bx, by, bz) => { const u = s.material.uniforms; u.uO.value.set(ox, oy, oz); u.uA.value.set(ax, 0, az); u.uB.value.set(bx, by, bz); u.uBenchY.value = B.y; };
    put(sh0, B.x0, B.y + .008, B.z0, bw, 0, 0, 0, bd); put(sh1, B.x0, B.y + .028, B.z0, bw, 0, 0, 0, bd); put(sh2, B.x0, B.y + .052, B.z0, bw, 0, 0, 0, bd);
    const yT = B.y + .03, drop = Math.min(DROP, Math.max(.1, B.y - B.floorY - .02));
    const off = .03;                                                                                      // 상판 턱(두께·모서리 둥근 곳)보다 바깥에 — 붙이면 턱에 묻혀 빗살이 생긴다
    put(cF0, B.x0, yT, B.z1 + off, bw, 0, 0, -drop, 0); put(cF1, B.x0, yT, B.z1 + off + .035, bw, 0, 0, -drop, 0);
    put(cL0, B.x0 - off, yT, B.z0, 0, bd, 0, -drop, 0); put(cR0, B.x1 + off, yT, B.z0, 0, bd, 0, -drop, 0);
  }
  layout();
  // 안개가 있는 칸만큼만 그린다(겹쳐 그리는 넓이를 줄인다)
  function fit(t, u0, v0, u1, v1){ for (let k = 0; k < sheets.length; k++) if (sheets[k].userData.t === t) sheets[k].material.uniforms.uUv.value.set(u0, v0, Math.max(0, u1 - u0), Math.max(0, v1 - v0)); }
  /** 융단에 안개를 보탠다(상판 위 자리) */
  function add(x, z, amount, radius = .05){
    if (x < B.x0 || x > B.x1 || z < B.z0 || z > B.z1) return;
    const i0 = Math.max(0, Math.floor((x - radius - B.x0) / cdx)), i1 = Math.min(GW - 1, Math.floor((x + radius - B.x0) / cdx)), j0 = Math.max(0, Math.floor((z - radius - B.z0) / cdz)), j1 = Math.min(GH - 1, Math.floor((z + radius - B.z0) / cdz));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const a = j * GW + i; if (!solid[a]) den[a] = Math.min(D_MAX, den[a] + amount); }
    carpetMass += amount;
  }
  function stepCarpet(dt){
    // 그릇 자리(막힌 칸)와 샘: 그릇 둘레에서 끓는 만큼 솟는다
    solid.fill(0); let h = 0, src = 0;
    for (let k = 0; k < emitters.length; k++) { const e = emitters[k]; if (e.kind !== 0) continue;
      const onBench = Math.abs(e.center.y - B.y) < .3 && e.center.x > B.x0 && e.center.x < B.x1 && e.center.z > B.z0 && e.center.z < B.z1;
      const R = (e.baseRadius || e.radius * .8) * 1.07;                               // 상판에 닿는 자리의 반지름(그릇 바닥)
      if (h < 4) { holes[h].set(e.center.x, e.center.z, onBench ? e.radius * 1.07 : 0); holeB[h++].set(onBench ? R : 0, Math.max(.001, e.center.y - B.y)); }
      if (!onBench) continue;
      const b = e.on ? Math.min(1, Math.max(0, e.boil)) : 0, s = (2.6 * Math.pow(b, .9) + boost * 3) * dt;
      const i0 = Math.max(0, Math.floor((e.center.x - R - cdx * 2 - B.x0) / cdx)), i1 = Math.min(GW - 1, Math.ceil((e.center.x + R + cdx * 2 - B.x0) / cdx)), j0 = Math.max(0, Math.floor((e.center.z - R - cdz * 2 - B.z0) / cdz)), j1 = Math.min(GH - 1, Math.ceil((e.center.z + R + cdz * 2 - B.z0) / cdz));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const x = B.x0 + (i + .5) * cdx - e.center.x, z = B.z0 + (j + .5) * cdz - e.center.z, r = Math.sqrt(x * x + z * z), a = j * GW + i;
        if (r < R) { solid[a] = 1; den[a] = 0; }
        else if (r < R + cdx * 1.6 && s > 0) { const an = Math.atan2(z, x), w = .55 + .45 * Math.sin(an * 3 + time * 1.7 + k) * Math.sin(an * 5 - time * 1.1); den[a] = Math.min(D_MAX, den[a] + s * w); src += s; } }   // 둘레를 따라 고르지 않게(살아 있는 듯)
    }
    for (; h < 4; h++) { holes[h].set(1e5, 1e5, 0); holeB[h].set(0, 1); }
    if (boost > 0) boost = Math.max(0, boost - dt / 2.6);
    carpetMass += src; if (carpetMass < 1e-4) { for (const s of sheets) s.visible = false; return false; }
    // 퍼짐: 짙은 곳에서 옅은 곳으로, 짙을수록 빨리. 가장자리 밖은 비어 있어 끌려 나간다 → 폭포
    const steps = Math.max(1, Math.ceil(dt / .0055)), hh = dt / steps, kx = hh / (cdx * cdx), kz = hh / (cdz * cdz), dec = Math.exp(-.34 * hh);
    outF.fill(0); outL.fill(0); outR.fill(0);
    for (let s = 0; s < steps; s++) {
      den2.set(den);
      for (let j = 0; j < GH; j++) { const row = j * GW;
        for (let i = 0; i < GW; i++) { const a = row + i; if (solid[a]) continue; const da = den[a]; if (da < 1e-5 && (i + 1 >= GW || den[a + 1] < 1e-5) && (j + 1 >= GH || den[a + GW] < 1e-5)) continue;
          if (i + 1 < GW) { const b = a + 1; if (!solid[b]) { const f = (KD * .5 * (da + den[b]) + NU) * (da - den[b]) * kx; den2[a] -= f; den2[b] += f; } } else { const f = (KD * da + NU) * da * kx; den2[a] -= f; outR[j] += f; }
          if (i === 0) { const f = (KD * da + NU) * da * kx; den2[a] -= f; outL[j] += f; }
          if (j + 1 < GH) { const b = a + GW; if (!solid[b]) { const f = (KD * .5 * (da + den[b]) + NU) * (da - den[b]) * kz; den2[a] -= f; den2[b] += f; } } else { const f = (KD * da + NU) * da * kz; den2[a] -= f; outF[i] += f; }
          if (j === 0) den2[a] -= (KD * da + NU) * da * kz;                              // 뒤쪽 가장자리로도 빠진다(안 보이는 쪽)
        } }
      for (let a = 0; a < GW * GH; a++) { const v = den2[a] * dec; den[a] = v > D_MAX ? D_MAX : (v > .0015 ? v : 0); }   // 아주 옅어지면 0 으로(다 걷힌 뒤에는 안개 그리기를 통째로 쉰다)
    }
    // 폭포: 가장자리에서 밀려난 만큼 맨 윗줄에 들어와 아래로 흐르며 옅어진다
    const adv = Math.min(.9, .46 * dt / (DROP / CH)), cdec = Math.exp(-1.15 * dt); let cm = 0;
    cm += fall(cF, GW, outF, adv, cdec); cm += fall(cL, GH, outL, adv, cdec); cm += fall(cR, GH, outR, adv, cdec);
    // 그림으로 옮기기
    let m = 0, i0 = GW, i1 = -1, j0 = GH, j1 = -1; const dd = tDen.image.data, k8 = 255 / D_MAX;
    for (let j = 0, a = 0; j < GH; j++) for (let i = 0; i < GW; i++, a++) { const v = den[a]; m += v; dd[a] = v * k8; if (v > .004) { if (i < i0) i0 = i; if (i > i1) i1 = i; if (j < j0) j0 = j; if (j > j1) j1 = j; } }
    if (i1 >= 0) fit(tDen, Math.max(0, i0 - 1) / GW, Math.max(0, j0 - 1) / GH, Math.min(GW, i1 + 2) / GW, Math.min(GH, j1 + 2) / GH); else m = 0;
    carpetMass = m + cm; tDen.needsUpdate = true; tF.needsUpdate = true; tL.needsUpdate = true; tR.needsUpdate = true;
    for (const s of sheets) s.visible = (!s.userData.extra || cap > 150) && (s.userData.curtain ? cm > .02 : m > .02);
    return true;
  }
  function fall(c, w, feed, adv, dec){
    let sum = 0;
    for (let s = CH - 1; s >= 1; s--) { const r = s * w, p = r - w; for (let i = 0; i < w; i++) c[r + i] = (c[r + i] + (c[p + i] - c[r + i]) * adv) * dec; }
    for (let i = 0; i < w; i++) { const l = i > 0 ? feed[i - 1] : feed[i], r = i < w - 1 ? feed[i + 1] : feed[i]; c[i] = Math.min(D_MAX, (c[i] * (1 - adv)) * dec + (feed[i] * .5 + (l + r) * .25) * 1.6); }
    const t = c === cF ? tF : (c === cL ? tL : tR), data = t.image.data, k8 = 255 / D_MAX; let i0 = w, i1 = -1, r1 = 0;
    for (let r = 0, a = 0; r < CH; r++) for (let i = 0; i < w; i++, a++) { let v = c[a]; if (v < .0015) v = c[a] = 0; sum += v; data[a] = v > D_MAX ? 255 : v * k8; if (v > .004) { if (i < i0) i0 = i; if (i > i1) i1 = i; r1 = r; } }
    if (i1 >= 0) fit(t, Math.max(0, i0 - 1) / w, 0, Math.min(w, i1 + 2) / w, Math.min(CH, r1 + 2) / CH);
    return sum;
  }

  // ── ③ 덩어리 조각
  const geo = new THREE.InstancedBufferGeometry(); const quad = new THREE.PlaneGeometry(1, 1);
  geo.index = quad.index; geo.setAttribute('position', quad.attributes.position);
  const aPos = new THREE.InstancedBufferAttribute(F(MAX * 4), 4), aPar = new THREE.InstancedBufferAttribute(F(MAX * 4), 4); aPos.setUsage(THREE.DynamicDrawUsage); aPar.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('iPos', aPos); geo.setAttribute('iPar', aPar); geo.instanceCount = 0;
  const PU = { ...SH, uTex: { value: makePuffAtlas(rand) }, uTan: { value: 1 }, uMaxFrac: { value: opt.maxScreen || .9 }, uNearFade: { value: new THREE.Vector2(.18, .55) }, uLightV: { value: new THREE.Vector3(-.5, .6, .6) } };
  const puffMat = new THREE.ShaderMaterial({ ...blend, uniforms: PU, vertexShader: PUFF_VS, fragmentShader: PUFF_FS });
  const puffs = new THREE.Mesh(geo, puffMat); puffs.frustumCulled = false; puffs.renderOrder = 5; fogScene.add(puffs);
  const depthMat = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
  const CU = { uFog: { value: fogRT.texture }, uLit: { value: new THREE.Color(1.42, 1.46, 1.52) }, uShade: { value: new THREE.Color(.84, .89, .96) }, uWhite: { value: 0 }, uTime: SH.uTime };
  // 화면을 덮는 세모 하나. position 은 한 점에 모아 둔다 → 다른 재질로 덮어 그리는 패스(깊이·법선·그림자)에서는 넓이가 0 이라 아무것도 안 그려진다
  const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3)); tri.setAttribute('aClip', new THREE.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2));
  const comp = new THREE.Mesh(tri, new THREE.ShaderMaterial({ ...blend, uniforms: CU, vertexShader: COMP_VS, fragmentShader: COMP_FS }));
  comp.name = 'fx_fog'; comp.frustumCulled = false; comp.renderOrder = 9999; comp.layers.set(FX_LAYER); comp.visible = false; scene.add(comp);
  camera.layers.enable(FX_LAYER);

  // ── 본 장면이 그려지기 직전에 한 번: 깊이 → 안개
  const v2 = new THREE.Vector2(), col = new THREE.Color(), seen = new Float32Array(34);
  let dirty = false, busy = false;
  // 카메라·화면 크기가 지난번 그린 뒤로 바뀌었나(시간이 멈춰 있어도 카메라가 움직이면 다시 그려야 본 화면과 어긋나지 않는다)
  function moved(r, cam, rt, keep){ const a = cam.matrixWorld.elements, b = cam.projectionMatrix.elements, w = rt ? rt.width : r.getDrawingBufferSize(v2).x, h = rt ? rt.height : r.getDrawingBufferSize(v2).y; let ch = seen[32] !== w || seen[33] !== h;
    for (let i = 0; i < 16 && !ch; i++) ch = seen[i] !== Math.fround(a[i]) || seen[16 + i] !== Math.fround(b[i]);
    if (keep) { for (let i = 0; i < 16; i++) { seen[i] = a[i]; seen[16 + i] = b[i]; } seen[32] = w; seen[33] = h; } return ch; }
  function redraw(r, cam, rt){
    busy = true; moved(r, cam, rt, true);
    const w = rt ? rt.width : r.getDrawingBufferSize(v2).x, h = rt ? rt.height : r.getDrawingBufferSize(v2).y;
    const fw = Math.max(32, Math.round(w * scale)), fh = Math.max(32, Math.round(h * scale));
    if (depthRT.width !== fw || depthRT.height !== fh) { depthRT.setSize(fw, fh); fogRT.setSize(fw, fh); SH.uRes.value.set(fw, fh); }
    const pRT = r.getRenderTarget(), pAuto = r.autoClear, pSh = r.shadowMap.autoUpdate, pOv = scene.overrideMaterial, pBg = scene.background, pMask = cam.layers.mask, pA = r.getClearAlpha(); r.getClearColor(col);
    r.shadowMap.autoUpdate = false; scene.overrideMaterial = depthMat; scene.background = null; cam.layers.mask = pMask & ~(1 << FX_LAYER);
    r.autoClear = true; r.setClearColor(0x000000, 0); r.setRenderTarget(depthRT); r.render(scene, cam);
    scene.overrideMaterial = pOv; scene.background = pBg; cam.layers.mask = pMask;
    SH.uNear.value = cam.near; SH.uFar.value = cam.far; PU.uTan.value = 2 * Math.tan((cam.fov || 50) * Math.PI / 360);
    PU.uLightV.value.copy(lightW).transformDirection(cam.matrixWorldInverse);
    r.setRenderTarget(fogRT); r.render(fogScene, cam);
    r.setRenderTarget(pRT); r.setClearColor(col, pA); r.autoClear = pAuto; r.shadowMap.autoUpdate = pSh;
    busy = false; dirty = false;
  }
  const prevHook = scene.onBeforeRender;
  scene.onBeforeRender = function (r, s, cam, rt){ if (prevHook) prevHook.call(this, r, s, cam, rt); if (!busy && comp.visible && cam === camera && (dirty || moved(r, cam, rt, false))) redraw(r, cam, rt); };

  // ── 낱장 내기
  let cur = 0;
  function emit(x, y, z, ux, uy, uz, size0, size1, lifeSec, alpha){
    let i = -1; for (let k = 0; k < 12; k++) { const j = (cur + k) % cap; if (life[j] <= 0) { i = j; break; } }
    if (i < 0) i = cur % cap;                                              // 꽉 차면 가장 오래된 것을 덮는다
    cur = (i + 1) % cap;
    px[i] = x; py[i] = y; pz[i] = z; vx[i] = ux; vy[i] = uy; vz[i] = uz; age[i] = 0; life[i] = lifeSec; s0[i] = size0; s1[i] = size1; al[i] = alpha;
    rot[i] = rand() * 6.283; rotV[i] = (rand() - .5) * .5; ox[i] = x + (rand() - .5) * .02; oz[i] = z + (rand() - .5) * .02; oR[i] = 0; oY[i] = 0; seed[i] = rand() * 6.283; sink[i] = .9; delay[i] = 0; str[i] = 1; cell[i] = Math.floor(rand() * 4); fed[i] = 0;
    return i;
  }

  // ── 내뿜는 곳
  const emitters = [], tv = new THREE.Vector3();
  const posOf = (t, out) => t.isObject3D ? t.getWorldPosition(out) : out.copy(t);
  /** 그릇 가장자리(끓는 만큼 넘쳐흐른다). target = 가장자리 높이의 가운데 점(Vector3 또는 따라갈 Object3D) */
  function rim(target, radius = .12, baseRadius = 0){ const e = { kind: 0, target, radius, baseRadius /* 그릇 바닥 반지름(0 이면 가장자리의 0.8배로 본다) */, boil: 0, on: true, acc: 0, center: new THREE.Vector3() }; emitters.push(e); return e; }
  /** 들고 가는 찬 물체(아래로 흘러내린다) */
  function trail(target, o = {}){ const e = { kind: 1, target, radius: o.radius ?? .04, rate: 0, on: true, acc: 0, center: new THREE.Vector3(), prev: new THREE.Vector3(), has: false }; emitters.push(e); return e; }
  function remove(e){ const i = emitters.indexOf(e); if (i >= 0) emitters.splice(i, 1); }
  function stepEmitter(e, dt){
    posOf(e.target, e.center);
    if (e.kind === 0) {                                                    // 가장자리를 넘어 그릇 옆을 타고 구르는 김
      const b = Math.min(1, Math.max(0, e.boil)); if (!e.on || b <= .001) { e.acc = 0; return; }
      e.acc += dt * Math.min(cap, 300) * .13 * Math.pow(b, .8); const R = e.radius, k = R / .12;
      while (e.acc >= 1) { e.acc--;
        const a = rand() * 6.283, mound = rand() < (b - .45) * .35, rr = mound ? R * .8 * Math.sqrt(rand()) : R * (.8 + .28 * rand()), ca = Math.cos(a), sa = Math.sin(a), sp = (.07 + .13 * rand()) * (.5 + .7 * b);
        const i = emit(e.center.x + ca * rr, e.center.y + .008 + rand() * .02 * b, e.center.z + sa * rr, ca * sp, (.03 + .28 * rand()) * b, sa * sp,
          (.08 + .05 * rand()) * k, (.2 + .14 * rand()) * (.75 + .25 * k), 1.5 + 1.3 * rand(), (.24 + .16 * rand()) * (.5 + .5 * b));
        ox[i] = e.center.x; oz[i] = e.center.z; oR[i] = R * 1.03; oY[i] = e.center.y;
        if (mound) { life[i] = 1.0 + rand() * .8; al[i] *= .5; vx[i] *= .3; vz[i] *= .3; } }   // 세게 끓을 때 그릇 위에 잠깐 봉긋이 고이는 김
    } else {
      const r = Math.min(1, Math.max(0, e.rate));
      if (!e.has) { e.prev.copy(e.center); e.has = true; }
      const ux = (e.center.x - e.prev.x) / dt, uy = (e.center.y - e.prev.y) / dt, uz = (e.center.z - e.prev.z) / dt; e.prev.copy(e.center);
      if (!e.on || r <= .001) { e.acc = 0; return; }
      e.acc += dt * (8 + 46 * r) * Math.min(1, cap / 300 + .35);
      while (e.acc >= 1) { e.acc--;
        const a = rand() * 6.283, rr = e.radius * Math.sqrt(rand());
        const i = emit(e.center.x + Math.cos(a) * rr, e.center.y + (rand() - .6) * e.radius, e.center.z + Math.sin(a) * rr, ux * .25 + (rand() - .5) * .05, Math.min(0, uy * .2) - .06 - .1 * rand(), uz * .25 + (rand() - .5) * .05,
          .035 + .03 * rand(), .11 + .09 * rand(), 1.5 + 1.5 * rand(), (.16 + .14 * rand()) * (.5 + .5 * r));
        sink[i] = .75; }
    }
  }
  // ── 마무리 구름
  const bq = { left: 0, rateN: 0, acc: 0, c: new THREE.Vector3(), R: .12, s: 1, wt: -1 };
  /** 큰 구름: 솟아올라 카메라 쪽으로 밀려오고 화면이 잠깐 하얘진 뒤, 가라앉아 상판을 덮고 흘러내린다 */
  function burst(center, strength = 1, o = {}){ bq.c.copy(center); bq.R = o.radius ?? .12; bq.s = strength; bq.left = Math.round(cap * .72 * Math.min(1.2, strength)); bq.rateN = bq.left / 1.1; bq.acc = 0; bq.wt = 0; boost = Math.max(boost, strength); }
  function stepBurst(dt){
    if (bq.wt >= 0) { bq.wt += dt; const t = bq.wt, up = Math.min(1, Math.max(0, (t - .6) / .8)), dn = Math.min(1, Math.max(0, (t - 1.8) / 1.9));   // 구름이 먼저 솟아 밀려온 뒤에 화면이 하얘진다
      api.white = Math.min(1, bq.s) * .93 * (up * up * (3 - 2 * up)) * (1 - dn * dn * (3 - 2 * dn)); if (t > 3.75) { bq.wt = -1; api.white = 0; } }
    if (bq.left <= 0) return;
    bq.acc += bq.rateN * dt; tv.copy(camera.position).sub(bq.c); tv.y = 0; const cl = tv.length() || 1, cx = tv.x / cl, cz = tv.z / cl;
    while (bq.acc >= 1 && bq.left > 0) { bq.acc--; bq.left--;
      const a = rand() * 6.283, rr = bq.R * 1.2 * Math.sqrt(rand()), ca = Math.cos(a), sa = Math.sin(a), sp = (.25 + .7 * rand()) * bq.s, tow = (.2 + .9 * rand()) * bq.s;
      const i = emit(bq.c.x + ca * rr, bq.c.y + rand() * .06, bq.c.z + sa * rr, ca * sp + cx * tow, (.5 + 1.1 * rand()) * bq.s, sa * sp + cz * tow, .2 + .16 * rand(), .7 + .6 * rand(), 4.6 + 3.2 * rand(), .26 + .16 * rand());
      ox[i] = bq.c.x; oz[i] = bq.c.z; delay[i] = .25 + .5 * rand(); }
  }

  // ── 한 걸음
  let time = 0;
  function update(dt){
    if (!(dt > 0)) return; dt = Math.min(dt, .1); time += dt; dirty = true; SH.uTime.value = time;
    for (let k = 0; k < emitters.length; k++) stepEmitter(emitters[k], dt);
    stepBurst(dt);
    const P = aPos.array, Q = aPar.array, dH = Math.exp(-1.25 * dt), dV = Math.exp(-2.1 * dt), land = Math.min(1, dt * 11), sK = Math.min(1, dt * 4.5);
    let n = 0;
    for (let i = 0; i < cap; i++) {
      const L = life[i]; if (L <= 0) continue;
      const a = age[i] += dt; if (a >= L) { life[i] = 0; continue; }
      const k = a / L, sz = s0[i] + (s1[i] - s0[i]) * (1 - (1 - k) * (1 - k));
      let x = px[i], y = py[i], z = pz[i], ux = vx[i], uy = vy[i], uz = vz[i];
      const over = x > B.x0 && x < B.x1 && z > B.z0 && z < B.z1, gy = over ? B.y : B.floorY;
      let floor = gy + sz * .16; const dx = x - ox[i], dz = z - oz[i], d2 = dx * dx + dz * dz, onBowl = oR[i] > 0 && d2 < oR[i] * oR[i];
      if (onBowl) floor = Math.max(floor, oY[i] + sz * .1);                                   // 그릇 위에서는 가장자리 높이 아래로 못 내려간다(그릇 벽을 뚫지 않게)
      let want = 1;
      if (y <= floor + .012) {                                                                // 바닥을 탄다: 내려오던 힘이 옆으로 퍼짐
        const inv = 1 / Math.sqrt(d2 + 1e-5), ex = dx * inv, ez = dz * inv;
        if (uy < 0) { const cv = -uy * land * .85; ux += ex * cv; uz += ez * cv; uy += -uy * land; }
        const push = .19 * (1 - k * .6) * dt; ux += ex * push; uz += ez * push;
        ux += Math.sin(z * 9 + time * .8 + seed[i]) * .07 * dt; uz += Math.cos(x * 8 - time * .7 + seed[i] * 1.3) * .07 * dt;   // 굴러가는 결
        y += (floor - y) * Math.min(1, dt * 7); want = .55;
        if (over && !onBowl && !fed[i]) { fed[i] = 1; add(x, z, Math.min(.5, al[i] * sz * 9), sz * .4); }     // 상판에 닿으면 융단으로 스며든다
      } else {
        const sk = delay[i] > 0 ? Math.min(1, Math.max(0, (a - delay[i]) / .9)) : 1; uy -= sink[i] * sk * dt;
        if (!over && y < B.y + .04 && y > B.floorY + .25) {                                   // 가장자리를 넘어 떨어지는 중: 옆면을 타고 길게 흐른다
          want = 1 + Math.min(1.1, -uy * 2.6);
          const tx = Math.min(B.x1, Math.max(B.x0, x)), tz = Math.min(B.z1, Math.max(B.z0, z)), qx = x - tx, qz = z - tz, dist = Math.sqrt(qx * qx + qz * qz) + 1e-5, pull = (dist - sz * .28) * 2.4 * dt;
          ux -= qx / dist * pull; uz -= qz / dist * pull;
        }
      }
      ux *= dH; uz *= dH; uy *= dV; x += ux * dt; y += uy * dt; z += uz * dt;
      px[i] = x; py[i] = y; pz[i] = z; vx[i] = ux; vy[i] = uy; vz[i] = uz; rot[i] += rotV[i] * dt; str[i] += (want - str[i]) * sK;
      const fin = Math.min(1, a / .22), fo = k > .5 ? 1 - (k - .5) / .5 : 1, o4 = n * 4;
      P[o4] = x; P[o4 + 1] = y; P[o4 + 2] = z; P[o4 + 3] = sz; Q[o4] = rot[i]; Q[o4 + 1] = al[i] * fin * fo * fo * (3 - 2 * fo); Q[o4 + 2] = str[i]; Q[o4 + 3] = cell[i]; n++;
    }
    geo.instanceCount = n; aPos.needsUpdate = true; aPar.needsUpdate = true; aPos.clearUpdateRanges(); aPar.clearUpdateRanges(); if (n > 0) { aPos.addUpdateRange(0, n * 4); aPar.addUpdateRange(0, n * 4); }
    puffs.visible = n > 0;
    const carpet = stepCarpet(dt);
    CU.uWhite.value = api.white; comp.visible = n > 0 || carpet || api.white > .002; api.live = n;
  }

  const api = {
    update, emit, add, rim, trail, remove, burst, live: 0, white: 0, mesh: comp, layer: FX_LAYER,
    /** 안개 깊이 그림에서 뺄 물체(비치는 것). 안 빼면 그 뒤의 안개가 통째로 가려진다 */
    exclude(obj){ obj.traverse(o => o.layers.set(FX_LAYER)); return obj; },
    clear(){ life.fill(0); den.fill(0); cF.fill(0); cL.fill(0); cR.fill(0); carpetMass = 0; boost = 0; bq.left = 0; bq.wt = -1; api.white = 0; api.live = 0; geo.instanceCount = 0; comp.visible = false; for (const s of sheets) s.visible = false; dirty = true; },
    /** 등급이 바뀌면: 장수·안개 그림 크기 */
    setTier(q){ const c = Math.min(MAX, q.fog); if (c < cap) for (let i = c; i < cap; i++) life[i] = 0; cap = c; cur = 0; scale = q.fogScale; dirty = true; },
    /** ctx.bench(상판 네모)를 바꾼 뒤 부른다: 판 자리를 다시 놓고 깔린 안개를 비운다 */
    setBench(){ layout(); den.fill(0); cF.fill(0); cL.fill(0); cR.fill(0); carpetMass = 0; dirty = true; },
    setLight(dirFrom){ lightW.copy(dirFrom).normalize(); }, get count(){ return cap; }, get carpet(){ return carpetMass; },
    colors: CU,
    dispose(){ scene.onBeforeRender = prevHook; scene.remove(comp); depthRT.dispose(); fogRT.dispose(); geo.dispose(); puffMat.dispose(); comp.material.dispose(); PU.uTex.value.dispose(); for (const s of sheets) s.material.dispose(); sheetGeo.dispose(); tDen.dispose(); tF.dispose(); tL.dispose(); tR.dispose(); },
  };
  return api;
}
