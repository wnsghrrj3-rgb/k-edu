/* 케이원더 · 화산 탐방 ① 용암 동굴 — 그림
 * 장면 둘을 가지고 있다가 다이얼에 따라 하나를 그린다.
 *   안(in)  : 굴 안. 무인기 등불 · 벽의 가로줄 · 돌 고드름 · 멀리 뚫린 천장의 빛기둥. 다이얼을 되감으면 용암이 차오른다.
 *   밖(out) : 굴이 되기 전의 땅 위. 해 질 녘, 골을 따라 흐르는 용암 강 위로 검은 지붕이 덮여 간다.
 * 좌표: three (X 오른쪽 · Y 위 · Z 앞). 1 = 1m. 굴은 −Z 쪽으로 뻗고 조금씩 내려간다. 「굴 안 높이」 = y − slope × z.
 * 모형과 겉 그림은 wonder/blender/volcano_cave.py 가 만든다(assets/).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const QUALITY = {
  high: { maxH: 1080, bloom: true, shadow: 1024, aniso: 8, dust: 320 },
  mid:  { maxH: 810,  bloom: true, shadow: 512,  aniso: 4, dust: 220 },
  low:  { maxH: 600,  bloom: false, shadow: 0,   aniso: 2, dust: 120 },
};
const NOISE = /* glsl */`
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x), f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*vnoise(p); p=p*2.03+vec2(17.1,-9.3); a*=.5; } return s; }
`;
/* 흐르는 용암: 검은 껍질 판 사이로 틈만 빛난다. 가운데가 빠르고 뜨겁다. ac = 가운데에서 떨어진 정도(0~1), s = 흘러가는 쪽 거리 */
const LAVA = /* glsl */`
vec3 lavaGlow(float k){ k = clamp(k, 0., 1.4); return vec3(1.25, .30, .035)*k*k + vec3(.55, .42, .12)*pow(k, 6.); }
float lavaPlates(vec2 p){ float a = fbm(p), b = fbm(p*2.3 + 7.); return a*.7 + b*.3; }
/* crustEdge: 이 값보다 바깥(ac 가 큼)은 굳은 껍질 */
vec4 lavaSurf(float xs, float s, float t, float crustEdge, float calm){
  float ac = abs(xs);
  float sp = mix(1.5, .25, smoothstep(.2, 1., ac));                       // 가운데가 빠르다
  float ph = fract(t*.11), ph2 = fract(t*.11 + .5);                         // 무늬를 두 번 겹쳐 끝없이 늘어나지 않게
  vec2 q = vec2(xs*2.6 + 11., s*.42);
  float n1 = lavaPlates(q - vec2(0., sp*ph*9.)), n2 = lavaPlates(q + 3.7 - vec2(0., sp*ph2*9.));
  float n = mix(n1, n2, abs(ph*2. - 1.));
  float wob = (fbm(vec2(xs*2.4 + 9., s*.3)) - .5)*.5;
  float crust = smoothstep(crustEdge - .05, crustEdge + .05, ac + wob);    // 가장자리에서 자라 들어오는 지붕
  float skin = smoothstep(.44, .52, n + calm*.1 + .10*smoothstep(.5, 1.1, ac));   // 떠가는 얇은 껍질(가장자리일수록 많다)
  float crack = 1. - smoothstep(.0, .03, abs(n - .43));                    // 껍질 가장자리의 밝은 틈
  float hot = min(mix(.86 - .28*ac, .06, skin*.95) + crack*.2, 1.03);
  // 굳은 지붕: 거의 검고, 틈과 뚫린 창만 빛난다
  float sn = fbm(vec2(xs*4.2 + 2., s*.6)), sn2 = fbm(vec2(xs*7. - 3., s*1.1 + 5.));
  float seams = max(1. - smoothstep(.0, .03, abs(sn - .5)), .6*(1. - smoothstep(.0, .025, abs(sn2 - .47))))*smoothstep(1.25, .1, ac);
  float win = smoothstep(.69, .75, fbm(vec2(xs*1.3 + 5., s*.11 + 3.)))*smoothstep(.75, .25, ac);
  float edgeGlow = (1. - smoothstep(0., .12, abs(ac + wob - crustEdge)))*.8;
  float roofHot = max(seams*.5, win*.95);
  float k = mix(hot + edgeGlow*.3, roofHot, crust);
  return vec4(lavaGlow(k), crust*(1. - win));
}
`;

export async function createCave(canvas, opt = {}) {
  const qp = new URLSearchParams(location.search), shot = !!qp.get('shot');
  let qName = QUALITY[opt.quality] ? opt.quality : 'high', Q = QUALITY[qName];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: shot });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = Q.shadow > 0; renderer.shadowMap.type = THREE.PCFShadowMap;

  const base = new URL('./assets/', import.meta.url).href;
  const tl = new THREE.TextureLoader();
  const tex = (name, srgb) => new Promise((ok, no) => tl.load(base + name, t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = Q.aniso; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; ok(t); }, undefined, no));
  const [gltf, C, tN, tM, tR] = await Promise.all([new GLTFLoader().loadAsync(base + 'cave.glb'), fetch(base + 'cave.json').then(r => r.json()), tex('basalt_n.jpg'), tex('basalt_m.jpg'), tex('ropy_n.jpg')]);
  const SL = C.slope;
  const at = (arr, s) => { const f = Math.min(arr.length - 1.001, Math.max(0, (s - C.s0) / C.ds)), i = Math.floor(f); return arr[i] + (arr[i + 1] - arr[i]) * (f - i); };
  const cxAt = s => at(C.cx, s), floorY = s => -SL * s;

  // ── 함께 쓰는 값
  const U = {
    uTime: { value: 0 }, uLava: { value: -1 }, uHeat: { value: 0 }, uSlope: { value: SL }, uDay: { value: 1 }, uH1: { value: C.h1 }, uH2: { value: C.h2 },
    uHole: { value: new THREE.Vector3(C.hole.x, 0, -C.hole.s) }, uGrow: { value: 1 }, uDrip: { value: 0 }, uOpen: { value: 0 }, uCrust: { value: 1 },
    tM: { value: tM }, tRopy: { value: tR }, uLampP: { value: new THREE.Vector3() }, uLampD: { value: new THREE.Vector3(0, 0, -1) }, uLamp: { value: 1 },
  };

  /* 돌 겉: three 의 표준 재질에 굴의 것을 끼운다(젖은 반들거림 · 벽의 잔 가로줄 · 밧줄 바닥 · 용암 빛 · 햇빛 닿는 곳의 이끼) */
  function rock(kind) {
    const uv = kind === 'tube' || kind === 'shaft' || kind === 'ground';
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, vertexColors: kind === 'tube' || kind === 'stal' || kind === 'ground',
      normalMap: uv ? tN : null, normalScale: new THREE.Vector2(1.2, 1.2), side: kind === 'ground' || kind === 'rubble' || kind === 'stal' ? THREE.FrontSide : THREE.DoubleSide, flatShading: kind === 'rubble' });
    m.defines = { ['ROCK_' + kind.toUpperCase()]: 1 }; if (uv) m.defines.ROCK_UV = 1;
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos; uniform float uGrow;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef ROCK_STAL\n transformed.y += (1. - uGrow)*color.r*color.g;\n#endif')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvWPos = (modelMatrix*vec4(transformed, 1.)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vWPos; uniform sampler2D tM, tRopy; uniform float uTime, uLava, uHeat, uSlope, uDay, uH1, uH2, uDrip, uOpen; uniform vec3 uHole;
${NOISE}`)
        .replace('#include <clipping_planes_pars_fragment>', `#include <clipping_planes_pars_fragment>
#ifdef ROCK_UV
vec4 rockN(){
  vec4 a = texture2D(normalMap, vNormalMapUv);
  #ifdef ROCK_TUBE
  a = mix(a, texture2D(tRopy, vNormalMapUv*vec2(.5, 1.)), .7*smoothstep(.15, .85, vColor.r));
  #endif
  #ifdef ROCK_GROUND
  a = mix(a, texture2D(tRopy, vNormalMapUv*vec2(.3, .6) + .3), .28);
  #endif
  return a;
}
#endif`)
        .replace('#include <color_fragment>', `
  #ifdef ROCK_UV
  vec2 rUv = vNormalMapUv;
  #else
  vec2 rUv = vWPos.xz*.37 + vWPos.y*.21;
  #endif
  vec4 mm = texture2D(tM, rUv);
  #ifdef FLAT_SHADED
  float wNy0 = 0.;
  #else
  float wNy0 = inverseTransformDirection(normalize(vNormal), viewMatrix).y;
  #endif
  float hLoc = vWPos.y - uSlope*vWPos.z;
  vec3 alb = mix(vec3(.009, .009, .012), vec3(.031, .029, .031), mm.r);
  #ifndef ROCK_GROUND
  { float pa = fbm(vWPos.xz*.21 + vWPos.y*.33), dr = fbm(vec2(vWPos.x*.7 + vWPos.z*1.1, hLoc*.2));          // 녹슨 붉은 얼룩 · 흘러내린 허연 자국
    alb = mix(alb, alb*vec3(2.3, 1.15, .7) + vec3(.012, .004, 0.), smoothstep(.52, .72, pa)*(1. - .9*uHeat));   // 녹은 굴이 식은 뒤에 슨다
    alb += vec3(.03, .028, .024)*smoothstep(.56, .78, dr)*smoothstep(.4, .0, abs(wNy0))*step(1.2, hLoc); }
  #endif
  #ifdef ROCK_TUBE
  alb = mix(alb, alb*vec3(1.15, 1.05, .95) + .003, vColor.r*.7);                                  // 바닥은 조금 밝고 누렇다
  float lines = exp(-pow((hLoc - uH2)/.07, 2.)) + .8*exp(-pow((hLoc - uH1)/.05, 2.));           // 가로줄에 남은 허연 자국
  alb += vec3(.05, .045, .04)*lines*(.4 + .6*mm.b)*(1. - vColor.r);
  #endif
  #ifdef ROCK_GROUND
  alb = mix(vec3(.012, .012, .014), vec3(.05, .047, .05), mm.r);
  #endif
  #ifndef ROCK_GROUND
  float dayHere = uDay*smoothstep(6.5, 1.2, distance(vWPos.xz, uHole.xz));
  alb = mix(alb, vec3(.035, .075, .018) + .03*mm.r, dayHere*smoothstep(.42, .62, mm.b + .15*mm.r)*.85);   // 햇빛이 닿는 곳에만 이끼
  #endif
  diffuseColor.rgb = alb;`)
        .replace('#include <roughnessmap_fragment>', `float roughnessFactor = mix(.16, .66, mm.g);
  #ifdef ROCK_TUBE
  roughnessFactor = mix(roughnessFactor, mix(.5, .9, mm.g), vColor.r);
  #endif
  #ifdef ROCK_GROUND
  roughnessFactor = mix(.42, .97, mm.g);
  #endif
  #ifdef ROCK_STAL
  roughnessFactor = .22;
  #endif`)
        .replace('#include <normal_fragment_maps>', THREE.ShaderChunk.normal_fragment_maps.replaceAll('texture2D( normalMap, vNormalMapUv )', 'rockN()') + `
  vec3 wN = inverseTransformDirection(normal, viewMatrix);
  #ifdef ROCK_TUBE
  { float wall = (1. - smoothstep(.5, .8, abs(wN.y)))*(1. - vColor.r), below = 1. - smoothstep(uH2 + .15, uH2 + .6, hLoc);
    float st = cos(hLoc*52. + mm.b*6.)*.6 + cos(hLoc*19. + mm.r*5.)*.4;                          // 용암이 조금씩 내려가며 남긴 잔 가로줄
    wN = normalize(wN + vec3(0., st*.24*(.35 + mm.r)*wall*below, 0.)); normal = normalize((viewMatrix*vec4(wN, 0.)).xyz); }
  #endif`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
  {
    #ifdef ROCK_GROUND
    float ac = vColor.r*4.;                                                                       // 강 가운데에서 떨어진 정도(강 반너비 = 1)
    float irr = uOpen*(1.1*exp(-max(ac - 1., 0.)*.9) + .10)*(.5 + .5*clamp(wN.y, 0., 1.));
    totalEmissiveRadiance += diffuseColor.rgb*vec3(1., .30, .05)*irr*3.2;
    vec3 Vw = normalize(cameraPosition - vWPos), Rw = reflect(-Vw, wN);
    totalEmissiveRadiance += vec3(1., .32, .06)*uOpen*pow(1. - roughnessFactor, 2.)*exp(-max(ac - 1., 0.)*.5)*pow(clamp(1. - abs(Rw.y), 0., 1.), 3.)*.2;
    #else
    float above = hLoc - uLava, facing = clamp(.5 - .5*wN.y, 0., 1.);
    float irr = uHeat*(.22 + .78*facing)*(1.0*exp(-max(above, 0.)/1.3) + .30);                    // 아래에서 올라오는 용암 빛
    totalEmissiveRadiance += diffuseColor.rgb*vec3(1., .25, .035)*irr*.75;
    vec3 Vw = normalize(cameraPosition - vWPos), Rw = reflect(-Vw, wN);
    totalEmissiveRadiance += vec3(1., .33, .06)*uHeat*pow(clamp(-Rw.y, 0., 1.), 1.5)*pow(1. - roughnessFactor, 2.)*.15;   // 젖은 벽에 비친 용암
    float fresh = .22*uHeat*smoothstep(.4, 0., above)*step(-.05, above);                             // 막 드러난 벽은 아직 달아 있다
    totalEmissiveRadiance += vec3(1., .20, .03)*fresh*(.15 + 1.6*smoothstep(.4, .75, mm.b + .25*vnoise(vWPos.xz*3.)));
    #ifdef ROCK_STAL
    totalEmissiveRadiance += vec3(1.4, .42, .07)*uDrip*pow(vColor.r, 2.5)*2.2;                    // 녹아 떨어지는 끝
    #else
    totalEmissiveRadiance += vec3(1., .16, .02)*uDrip*smoothstep(.55, .95, -wN.y)*smoothstep(.30, .12, mm.r)*.9;   // 달아오른 천장의 틈
    #endif
    #endif
  }`);
    };
    return m;
  }

  // ── 안: 굴
  const inS = new THREE.Scene(); inS.fog = new THREE.FogExp2(0x000000, 0.013);
  const outS = new THREE.Scene(); outS.fog = new THREE.FogExp2(0x1c1014, 0.0075);
  const node = n => gltf.scene.getObjectByName(n);
  const parts = {};
  for (const n of ['tube', 'plug', 'shaft', 'stal', 'rubble', 'ground']) { const o = node(n); o.material = rock(n === 'plug' ? 'tube' : n); o.castShadow = n !== 'ground'; o.receiveShadow = true; o.frustumCulled = false; parts[n] = o; (n === 'ground' ? outS : inS).add(o); }
  parts.stal.castShadow = true;

  const camera = new THREE.PerspectiveCamera(62, 16 / 9, 0.08, 400);
  inS.add(camera); outS.add(new THREE.Object3D());
  // 무인기 등불: 눈 조금 아래 오른쪽에서 앞을 비춘다(그래야 턱과 고드름에 그림자가 진다)
  const lamp = new THREE.SpotLight(0xf6f1e8, 95, 0, 0.74, 0.65, 1.0); lamp.position.set(0.6, -0.3, 2.0); lamp.target.position.set(0.1, -0.75, -6);
  lamp.castShadow = Q.shadow > 0; lamp.shadow.mapSize.set(Q.shadow || 256, Q.shadow || 256); lamp.shadow.camera.near = 0.3; lamp.shadow.camera.far = 46; lamp.shadow.bias = -0.0006; lamp.shadow.normalBias = 0.012;
  const spill = new THREE.PointLight(0xffe8d0, 3, 14, 1.6); spill.position.set(0.3, -0.2, 0);
  camera.add(lamp, lamp.target, spill);
  // 뚫린 천장으로 드는 햇빛
  const holeP = new THREE.Vector3(C.hole.x, C.hole.top, -C.hole.s), holeFloor = floorY(C.hole.s);
  const day = new THREE.SpotLight(0xdcecff, 300, 0, 0.30, 0.55, 1.2); day.position.set(holeP.x + 0.8, holeP.y + 7, holeP.z - 1.2); day.target.position.set(holeP.x - 0.2, holeFloor, holeP.z + 0.3); inS.add(day, day.target);
  const bounce = new THREE.PointLight(0xcfe2f2, 12, 26, 1.7); bounce.position.set(holeP.x, holeFloor + 2.2, holeP.z); inS.add(bounce);          // 햇빛이 돌무더기에 닿아 둘레로 번진다
  const skyDisk = new THREE.Mesh(new THREE.CircleGeometry(3.4, 28), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 2.3, 2.6), fog: false })); skyDisk.rotation.x = Math.PI / 2; skyDisk.position.set(holeP.x, holeP.y - 0.05, holeP.z); inS.add(skyDisk);
  const shaftH = holeP.y - holeFloor;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 2.5, shaftH, 28, 1, true), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uDay: U.uDay, uTime: U.uTime },
    vertexShader: `varying vec3 vN, vV; varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix*vec4(position, 1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vN, vV; varying vec2 vUv; uniform float uDay, uTime; ${NOISE}
      void main(){ float thick = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);                  // 가운데가 두껍다
        float streak = .65 + .35*vnoise(vec2(vUv.x*26., uTime*.05)); float fall = mix(.25, 1., vUv.y)*smoothstep(0., .1, vUv.y);
        gl_FragColor = vec4(vec3(.72, .86, 1.)*thick*streak*fall*uDay*.115, 1.); }` }));
  beam.position.set(holeP.x - 0.1, holeFloor + shaftH / 2, holeP.z + 0.1); beam.rotation.z = 0.03; inS.add(beam);

  // 굴 안의 용암(다이얼을 되감으면 차오른다)
  function ribbon(s0, s1, ds, half, yLocal) {
    const pos = [], aux = [], idx = []; let r = 0;
    for (let s = s0; s <= s1 + 1e-6; s += ds, r++) { const hw = typeof half === 'function' ? half(s) : half, c = cxAt(Math.min(s, 62)) + (s > 62 ? (s - 62) * 0.5 : 0);
      for (const k of [-1, 0, 1]) { pos.push(c + k * hw, floorY(s) + yLocal, -s); aux.push(k, s); }
      if (r) { const a = (r - 1) * 3, b = r * 3; idx.push(a, b, a + 1, a + 1, b, b + 1, a + 1, b + 1, a + 2, a + 2, b + 1, b + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aux', new THREE.Float32BufferAttribute(aux, 2)); g.setIndex(idx); return g;
  }
  const lavaIn = new THREE.Mesh(ribbon(-14, 72, 1, 7.5, 0), new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uHeat: U.uHeat, uLava: U.uLava }, side: THREE.DoubleSide, fog: false,
    vertexShader: `attribute vec2 aux; varying vec2 vA; varying vec3 vW; void main(){ vA = aux; vec4 w = modelMatrix*vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec2 vA; varying vec3 vW; uniform float uTime, uHeat, uLava; ${NOISE}${LAVA}
      void main(){ vec4 l = lavaSurf(vA.x*1.55, vA.y, uTime, 1.02 - .1*smoothstep(1.5, 3.2, uLava), -.25);
        float far = exp(-length(vW - cameraPosition)*.012);
        gl_FragColor = vec4(l.rgb*uHeat*(.75 + .25*far)*.7, 1.); }` }));
  lavaIn.frustumCulled = false; inS.add(lavaIn);

  // 크기를 알 것: 어린이 키만 한 표지 막대(1m 30cm, 빨강·하양 10cm 띠)
  const pole = new THREE.Group();
  { const cv = document.createElement('canvas'); cv.width = 4; cv.height = 52; const g = cv.getContext('2d'); for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#e9e4da' : '#c9281c'; g.fillRect(0, i * 4, 4, 4); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter;
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.3, 10), new THREE.MeshStandardMaterial({ map: t, color: 0x5a5a5a, roughness: 0.6 })); stick.position.y = 0.65; stick.castShadow = true;
    const foot = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.07, 10), new THREE.MeshStandardMaterial({ color: 0x33363a, roughness: 0.6 })); foot.position.y = 0.035;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshStandardMaterial({ color: 0x6a5410, roughness: 0.4 })); cap.position.y = 1.32;
    pole.add(stick, foot, cap); const ps = 5.2; pole.position.set(cxAt(ps) + 1.9, floorY(ps) + 0.06, -ps); inS.add(pole); }

  // 등불에 비치는 먼지 · 용암 위로 오르는 불티
  const DN = Q.dust, dustG = new THREE.BufferGeometry(); { const p = new Float32Array(DN * 3), sd = new Float32Array(DN); for (let i = 0; i < DN; i++) { p[i * 3] = (Math.random() - .5) * 9; p[i * 3 + 1] = (Math.random() - .5) * 6; p[i * 3 + 2] = (Math.random() - .5) * 14; sd[i] = Math.random(); }
    dustG.setAttribute('position', new THREE.BufferAttribute(p, 3)); dustG.setAttribute('seed', new THREE.BufferAttribute(sd, 1)); }
  const dust = new THREE.Points(dustG, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uTime: U.uTime, uLampP: U.uLampP, uLampD: U.uLampD, uLamp: U.uLamp, uHeat: U.uHeat, uCam: { value: new THREE.Vector3() }, uPx: { value: 1 } },
    vertexShader: `attribute float seed; uniform float uTime, uLamp, uHeat, uPx; uniform vec3 uLampP, uLampD, uCam; varying vec3 vC;
      void main(){ vec3 p = position + vec3(sin(uTime*.21 + seed*40.)*.5, uTime*(.03 + .22*uHeat)*(.4 + seed) + sin(uTime*.17 + seed*17.)*.3, cos(uTime*.19 + seed*23.)*.5);
        p = mod(p + vec3(4.5, 3., 7.), vec3(9., 6., 14.)) - vec3(4.5, 3., 7.) + uCam;
        vec3 L = p - (uLampP - uLampD*2.); float d = length(L); float cone = smoothstep(.72, .96, dot(L/d, uLampD));
        vC = vec3(1., .93, .82)*.55*uLamp*cone*min(1., 6./(d*d)) + vec3(1., .35, .06)*uHeat*.22*step(.6, seed);
        vec4 mv = viewMatrix*vec4(p, 1.); gl_Position = projectionMatrix*mv; gl_PointSize = uPx*(.006 + .009*seed)/max(.5, -mv.z); }`,
    fragmentShader: `varying vec3 vC; void main(){ float r = length(gl_PointCoord - .5); gl_FragColor = vec4(vC*smoothstep(.5, .1, r), 1.); }` }));
  dust.frustumCulled = false; inS.add(dust);

  // 천장에서 떨어지는 녹은 돌 방울
  const tips = C.tips.map(t => new THREE.Vector3(t[0], t[2], -t[1])), ND = 46, dropP = new Float32Array(ND * 3), dropV = new Float32Array(ND), dropL = new Float32Array(ND).fill(-1);
  const dropG = new THREE.BufferGeometry(); dropG.setAttribute('position', new THREE.BufferAttribute(dropP, 3)); dropG.setAttribute('life', new THREE.BufferAttribute(dropL, 1));
  const drops = new THREE.Points(dropG, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uPx: { value: 1 } },
    vertexShader: `attribute float life; uniform float uPx; varying float vL; void main(){ vL = life; vec4 mv = viewMatrix*vec4(position, 1.); gl_Position = projectionMatrix*mv; gl_PointSize = life < 0. ? 0. : uPx*.034/max(2., -mv.z); }`,
    fragmentShader: `varying float vL; void main(){ if(vL < 0.) discard; vec2 q = gl_PointCoord - .5; float r = length(q*vec2(1.7, 1.)); gl_FragColor = vec4(vec3(2.6, 1.0, .25)*smoothstep(.5, .05, r), 1.); }` }));
  drops.frustumCulled = false; inS.add(drops);
  // 용암 면에 떨어진 자리의 잔 불빛
  const splash = new THREE.PointLight(0xff7a22, 0, 9, 1.8); inS.add(splash); let splashT = 0;

  // 주운 표본(돌 고드름 조각)이 떨어지는 모습
  const chip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0x1b1a1c, roughness: 0.25 })); chip.visible = false; chip.rotation.x = Math.PI; inS.add(chip); let chipV = 0, chipT = -1;

  // ── 밖: 굴이 되기 전의 땅 위
  const SUN = new THREE.Vector3(-0.42, 0.075, -0.90).normalize();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(380, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { uSun: { value: SUN }, uTime: U.uTime },
    vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position, 1.); }`,
    fragmentShader: `varying vec3 vD; uniform vec3 uSun; uniform float uTime; ${NOISE}
      void main(){ vec3 d = normalize(vD); float el = max(d.y, 0.), az = dot(normalize(d.xz + 1e-5), normalize(uSun.xz)), near = pow(max(az*.5 + .5, 0.), 3.);
        vec3 hz = mix(vec3(.13, .085, .14), vec3(.62, .22, .06), near), mid = mix(vec3(.045, .05, .12), vec3(.24, .10, .12), near*.8), zen = vec3(.008, .014, .045);
        vec3 c = mix(hz, mid, smoothstep(0., .16, el)); c = mix(c, zen, smoothstep(.10, .75, el));
        float sd = max(dot(d, uSun), 0.); c += vec3(1., .45, .12)*(pow(sd, 22.)*.14 + pow(sd, 300.)*.7);
        float band = fbm(vec2(az*3. + uTime*.004, el*26.)); c += vec3(.55, .2, .08)*smoothstep(.5, .75, band)*smoothstep(.22, .03, el)*near*.5;      // 엷은 구름 띠
        float st = step(.9975, hash(floor(d.xz/(d.y + .35)*90.))); c += st*smoothstep(.25, .6, el)*.6;                                              // 별 몇 개
        c = mix(c, vec3(.11, .065, .08), smoothstep(.03, -.06, d.y)); gl_FragColor = vec4(c, 1.); }` }));
  outS.add(sky);
  { const es = new THREE.Scene(); es.add(sky.clone()); const pm = new THREE.PMREMGenerator(renderer); outS.environment = pm.fromScene(es, 0, 1, 1000).texture; outS.environmentIntensity = 0.4; pm.dispose(); }   // 반들거리는 새 용암 땅에 저녁 하늘이 비친다
  const sun = new THREE.DirectionalLight(0xff9a55, .32); sun.position.copy(SUN).multiplyScalar(100); outS.add(sun, new THREE.HemisphereLight(0x39406a, 0x120a08, 0.55));
  const lavaOut = new THREE.Mesh(ribbon(-30, 150, 0.5, s => at(C.rw, Math.min(s, 70)) + 0.5, C.gl - 0.8), new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uCrust: U.uCrust, uSun: { value: SUN } }, fog: false, side: THREE.DoubleSide,
    vertexShader: `attribute vec2 aux; varying vec2 vA; varying vec3 vW; void main(){ vA = aux; vec4 w = modelMatrix*vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec2 vA; varying vec3 vW; uniform float uTime, uCrust; uniform vec3 uSun; ${NOISE}${LAVA}
      void main(){ vec4 l = lavaSurf(vA.x, vA.y, uTime, 1.08 - uCrust*1.42, (uCrust - .75)*1.6);
        vec3 V = normalize(cameraPosition - vW); float d = length(vW - cameraPosition);
        float rough = fbm(vec2(vA.x*5., vA.y*1.6)); vec3 n = normalize(vec3((rough - .5)*.5, 1., (fbm(vec2(vA.x*5. + 4., vA.y*1.6)) - .5)*.5));
        float spec = pow(max(dot(reflect(-V, n), uSun), 0.), 26.)*.3 + pow(1. - max(dot(V, n), 0.), 4.)*.10;                                     // 갓 굳은 지붕은 반들거린다
        vec3 roof = vec3(.014, .013, .016)*(.6 + rough) + vec3(1., .5, .22)*spec;
        vec3 c = l.rgb*.8 + roof*l.a; c = mix(vec3(.11, .065, .08), c, exp(-d*.0075));
        gl_FragColor = vec4(c, 1.); }` }));
  lavaOut.frustumCulled = false; outS.add(lavaOut);
  // 용암 강 위로 오르는 더운 김
  const NF = 44, fumeG = new THREE.BufferGeometry(); { const p = new Float32Array(NF * 3), sd = new Float32Array(NF); for (let i = 0; i < NF; i++) { const s = -8 + Math.random() * 110; p[i * 3] = cxAt(Math.min(s, 62)) + (s > 62 ? (s - 62) * .5 : 0) + (Math.random() - .5) * 4; p[i * 3 + 1] = floorY(s) + C.gl; p[i * 3 + 2] = -s; sd[i] = Math.random(); }
    fumeG.setAttribute('position', new THREE.BufferAttribute(p, 3)); fumeG.setAttribute('seed', new THREE.BufferAttribute(sd, 1)); }
  const fume = new THREE.Points(fumeG, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, uniforms: { uTime: U.uTime, uOpen: U.uOpen, uPx: { value: 1 } },
    vertexShader: `attribute float seed; uniform float uTime, uPx, uOpen; varying float vA; void main(){ float k = fract(uTime*(.035 + .03*seed) + seed*7.); vec3 p = position + vec3(k*k*5. + sin(seed*30. + uTime*.3)*.8, k*9., k*2.);
        vA = sin(k*3.1416)*(.02 + .05*uOpen); vec4 mv = viewMatrix*vec4(p, 1.); gl_Position = projectionMatrix*mv; gl_PointSize = uPx*(2.2 + 5.*k)/max(1., -mv.z); }`,
    fragmentShader: `varying float vA; void main(){ float r = length(gl_PointCoord - .5); gl_FragColor = vec4(vec3(.85, .34, .14), vA*smoothstep(.5, .0, r)); }` }));
  fume.frustumCulled = false; outS.add(fume);

  // ── 그리기
  const composer = new EffectComposer(renderer), pass = new RenderPass(inS, camera), bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.6, 0.9);
  composer.addPass(pass); composer.addPass(bloom); composer.addPass(new OutputPass());
  let W = 0, Hh = 0;
  function resize() {
    const cw = canvas.clientWidth || innerWidth, ch = canvas.clientHeight || innerHeight, k = Math.min(1, Q.maxH / ch) * Math.min(devicePixelRatio || 1, 1.5), w = Math.max(2, Math.round(cw * k)), h = Math.max(2, Math.round(ch * k));
    if (w === W && h === Hh) return; W = w; Hh = h; renderer.setPixelRatio(1); renderer.setSize(W, Hh, false); composer.setSize(W, Hh); bloom.enabled = Q.bloom;
    camera.aspect = cw / ch; camera.fov = cw / ch < 1 ? 82 : 62; camera.updateProjectionMatrix();
    const px = Hh / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))); dust.material.uniforms.uPx.value = px; drops.material.uniforms.uPx.value = px; fume.material.uniforms.uPx.value = px;
  }
  const look = { yaw: 0, pitch: 0 }, st = { cur: null, view: 'in' }; let lampOn = true, lampK = 1, time = 0;
  const fwd = new THREE.Vector3();
  function apply(s) {                                                         // 다이얼이 정한 것을 장면에 옮긴다
    st.cur = s; st.view = s.view;
    U.uLava.value = s.lava; U.uHeat.value = s.heat; U.uDay.value = s.day; U.uGrow.value = s.grow; U.uDrip.value = s.drip; U.uCrust.value = s.crust; U.uOpen.value = 1 - s.crust * 0.8;
    lavaIn.visible = s.lava > 0; lavaIn.position.y = s.lava;
    parts.plug.visible = !s.hole; parts.rubble.visible = parts.shaft.visible = skyDisk.visible = pole.visible = s.hole; beam.visible = s.day > 0.01; day.intensity = 300 * s.day; bounce.intensity = 12 * s.day;
  }
  function stepCam(dt) {
    const s = st.cur; if (!s) return;
    lampK += ((lampOn ? 1 : 0) - lampK) * Math.min(1, dt * 9); U.uLamp.value = lampK; const adapt = 1 - 0.55 * (s.view === 'in' ? s.heat : 0); lamp.intensity = 95 * lampK * adapt; spill.intensity = 1.2 * lampK * adapt;      // 용암이 밝으면 눈이 거기에 맞춰진다
    const bob = Math.sin(time * 1.3) * 0.035 + Math.sin(time * 0.53) * 0.03;
    if (s.view === 'in') { camera.position.set(cxAt(0) + 0.15 + Math.sin(time * 0.4) * 0.03, s.eye + bob, 0); camera.rotation.set(look.pitch - 0.03, look.yaw, 0, 'YXZ'); }
    else { const cs = -6; camera.position.set(cxAt(cs) - 7.5, floorY(cs) + C.gl + 3.3 + bob, -cs); camera.rotation.set(look.pitch * 0.6 - 0.27, look.yaw * 0.6 - 0.6, 0, 'YXZ'); }
    camera.updateMatrixWorld(); camera.getWorldDirection(fwd);
    U.uLampP.value.copy(camera.position); U.uLampD.value.copy(fwd); dust.material.uniforms.uCam.value.copy(camera.position).addScaledVector(fwd, 5);
  }
  function stepFx(dt) {
    const s = st.cur; if (!s || s.view !== 'in') return;
    // 방울: 천장 고드름 끝에서 떨어져 용암 면에 닿으면 사라진다
    const surf = z => SL * z + s.lava;
    for (let i = 0; i < ND; i++) {
      if (dropL[i] < 0) { if (s.drip > 0 && Math.random() < dt * s.drip * 0.55) { const t = tips[(Math.random() * tips.length) | 0]; dropP[i * 3] = t.x; dropP[i * 3 + 1] = t.y + (1 - s.grow) * 0.2; dropP[i * 3 + 2] = t.z; dropV[i] = 0; dropL[i] = 1; } continue; }
      dropV[i] += 9.8 * dt; dropP[i * 3 + 1] -= dropV[i] * dt;
      if (dropP[i * 3 + 1] < surf(dropP[i * 3 + 2])) { dropL[i] = -1; if (Math.abs(dropP[i * 3 + 2] - camera.position.z + 6) < 9) { splash.position.set(dropP[i * 3], surf(dropP[i * 3 + 2]) + 0.25, dropP[i * 3 + 2]); splashT = 1; } }
    }
    dropG.attributes.position.needsUpdate = dropG.attributes.life.needsUpdate = true;
    splashT = Math.max(0, splashT - dt * 4); splash.intensity = 30 * splashT * splashT;
    if (chipT >= 0) { chipT += dt; chipV += 9.8 * dt; chip.position.y -= chipV * dt; chip.rotation.z += dt * 5; if (chipT > 0.75) { chip.visible = false; chipT = -1; } }
  }
  function render(dt = 0) {
    time += dt; U.uTime.value = time; resize(); stepCam(dt); stepFx(dt);
    pass.scene = st.view === 'in' ? inS : outS; if (st.view === 'out') sky.position.copy(camera.position);
    composer.render();
  }
  // 천장을 톡 치면 돌 고드름 조각이 떨어진다. 돌려주는 값: 'ok' | 'hot'(아직 뜨거움) | null(천장이 아님)
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function tap(clientX, clientY) {
    const s = st.cur; if (!s || s.view !== 'in') return null;
    const r = canvas.getBoundingClientRect(); ndc.set((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); ray.far = 14;
    const hit = ray.intersectObjects([parts.stal, parts.tube], false)[0]; if (!hit) return null;
    const local = hit.point.y - SL * hit.point.z, isCeil = hit.object === parts.stal || local > at(C.ht, -hit.point.z) * 0.72; if (!isCeil) return null;
    if (s.heat > 0.05) return 'hot';
    chip.position.copy(hit.point); chip.position.y -= 0.1; chip.visible = true; chipV = 0; chipT = 0; return 'ok';
  }
  // 느리면 화질을 스스로 내린다
  let fpsAcc = 0, fpsN = 0, tuned = !!qp.get('q');
  function tune(dt) { if (tuned) return; fpsAcc += dt; fpsN++; if (fpsAcc < 3) return; const fps = fpsN / fpsAcc; fpsAcc = fpsN = 0;
    if (fps < 24 && qName !== 'low') { qName = qName === 'high' ? 'mid' : 'low'; Q = QUALITY[qName]; W = 0; renderer.shadowMap.enabled = Q.shadow > 0; lamp.castShadow = Q.shadow > 0; if (Q.shadow) { lamp.shadow.mapSize.set(Q.shadow, Q.shadow); lamp.shadow.map?.dispose(); lamp.shadow.map = null; }
      inS.traverse(o => { if (o.material) o.material.needsUpdate = true; }); try { localStorage.setItem('wonder_volcano_q', qName); } catch (e) {} } else tuned = true; }
  return { apply, render, tune, tap, look, camera, get quality() { return qName; }, get view() { return st.view; }, lamp(on) { lampOn = on; }, size: () => [W, Hh] };
}
