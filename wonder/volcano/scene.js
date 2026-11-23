/* 케이원더 · 장면 8 「화산이 만든 땅」 — 그림
 * terrain.js 의 값을 읽어 그리기만 한다(땅을 바꾸지 않는다).
 * 한 프레임: ① 물에 비칠 그림(눈을 수면 아래로 뒤집어 반 크기로) ② 본 장면 → 빛 번짐 → 색 보정
 * 좌표: three (X 오른쪽 · Y 위 · Z 앞) · 1 = 100m · 바다 = y 0 · 격자 x → X, 격자 y → Z, 섬 가운데가 원점
 * 땅: 격자 값을 그림 두 장에 담아(높이·녹은 두께·뜨거움·끈적임 / 밝은 돌·부스러기·나이·빛) 정점 셰이더가 높이만큼 올린다.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { KIND } from './terrain.js';

export const QUALITY = {
  high: { maxH: 1080, bloom: true, seg: 2, shadow: 14, puffs: 520, sparks: 5000, refl: .5 },
  mid:  { maxH: 810,  bloom: true, seg: 1.5, shadow: 8, puffs: 380, sparks: 3500, refl: .5 },
  low:  { maxH: 600,  bloom: false, seg: 1, shadow: 0, puffs: 240, sparks: 2000, refl: .34 },
};
const SUN = new THREE.Vector3(-0.40, 0.062, -0.915).normalize();          // 해가 있는 쪽(수평선 바로 위)
const WINDV = new THREE.Vector3(0.94, 0, 0.34);
const GRAV = 0.55;                                                       // 불똥이 떨어지는 빠르기(게임 값 — 느려야 커 보인다)

const NOISE = /* glsl */`
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x), f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*vnoise(p); p=p*2.03+vec2(17.1,-9.3); a*=.5; } return s; }
float fbm3(vec2 p){ float a=.5, s=0.; for(int i=0;i<3;i++){ s+=a*vnoise(p); p=p*2.03+vec2(17.1,-9.3); a*=.5; } return s; }
`;
const SKY = /* glsl */`
uniform vec3 uSun; uniform float uTime;
vec3 skyBase(vec3 d){
  float el = max(d.y, 0.), az = dot(normalize(d.xz+1e-5), normalize(uSun.xz));
  float near = pow(max(az*.5+.5, 0.), 3.);
  vec3 hz = mix(vec3(.12,.085,.15), vec3(.58,.20,.05), near);              // 수평선
  vec3 mid = mix(vec3(.040,.048,.125), vec3(.22,.095,.12), near*.8);        // 조금 위
  vec3 zen = vec3(.007,.013,.045);
  vec3 c = mix(hz, mid, smoothstep(0., .16, el));
  c = mix(c, zen, smoothstep(.10, .75, el));
  float sd = max(dot(d, uSun), 0.);
  c += vec3(1.,.45,.12) * (pow(sd, 22.)*.2 + pow(sd, 260.)*.9);           // 해 둘레의 빛
  return c;
}
`;
const BIC = /* glsl */`
uniform sampler2D tA, tB, tG; uniform float uN, uExt, uCell, uHS;
vec2 gridTc(vec2 xz){ return ((xz/uExt + .5)*(uN-1.) + .5)/uN; }
#ifdef SMOOTH
vec4 bic(sampler2D t, vec2 tc){
  vec2 st = tc*uN - .5, f = fract(st), i = floor(st);
  vec2 f2 = f*f, f3 = f2*f;
  vec2 w0 = (1.-f)*(1.-f)*(1.-f)/6., w1 = (4.-6.*f2+3.*f3)/6., w2 = (1.+3.*f+3.*f2-3.*f3)/6., w3 = f3/6.;
  vec2 g0 = w0+w1, g1 = w2+w3, h0 = (w1/g0 - .5 + i)/uN, h1 = (w3/g1 + 1.5 + i)/uN;
  return g0.y*(g0.x*textureLod(t, vec2(h0.x,h0.y), 0.) + g1.x*textureLod(t, vec2(h1.x,h0.y), 0.)) + g1.y*(g0.x*textureLod(t, vec2(h0.x,h1.y), 0.) + g1.x*textureLod(t, vec2(h1.x,h1.y), 0.));
}
#else
vec4 bic(sampler2D t, vec2 tc){ return textureLod(t, tc, 0.); }
#endif
`;

export async function createScene(canvas, T, opt = {}) {
  const qp = new URLSearchParams(location.search);
  let qName = qp.get('q') || opt.quality || 'high', Q = QUALITY[qName] || QUALITY.high;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!qp.get('shot') });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  const gl = renderer.getContext();
  const floatLinear = !!gl.getExtension('OES_texture_float_linear');
  const HF = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 1, 9000);
  camera.layers.enable(1);
  const mirror = new THREE.PerspectiveCamera(38, 16 / 9, 1, 9000); mirror.matrixAutoUpdate = false; mirror.matrixWorldAutoUpdate = false;
  const FLIP = new THREE.Matrix4().makeScale(1, -1, 1);
  scene.add(new THREE.DirectionalLight(0xffa860, 2.6).translateOnAxis(SUN, 100), new THREE.HemisphereLight(0x6f7fc0, 0x241a20, 1.5));

  // ───────────── 격자 그림 두 장
  const N = T.N, n = N * N, EXT = (N - 1) * T.cell / 100, VE = 1.4, HS = VE / 100;   // 높이는 1.4배로 그린다(산 모양이 잘 보이게)
  const dataA = new Float32Array(n * 4), dataB = new Float32Array(n * 4);
  const mkTex = d => { const t = new THREE.DataTexture(floatLinear ? d : new Uint16Array(n * 4), N, N, THREE.RGBAFormat, floatLinear ? THREE.FloatType : THREE.HalfFloatType); t.minFilter = t.magFilter = THREE.LinearFilter; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.needsUpdate = true; return t; };
  const texA = mkTex(dataA), texB = mkTex(dataB);
  const GN = N >> 1, glowA = new Float32Array(GN * GN), glowB = new Float32Array(GN * GN), glowD = new Uint8Array(GN * GN);   // 용암 빛을 번지게 한 그림(둘레의 땅·물·연기를 비춘다)
  const texG = new THREE.DataTexture(glowD, GN, GN, THREE.RedFormat, THREE.UnsignedByteType); texG.minFilter = texG.magFilter = THREE.LinearFilter; texG.needsUpdate = true;
  const U = {                                                              // 모두가 같이 쓰는 값
    tA: { value: texA }, tB: { value: texB }, tG: { value: texG }, uN: { value: N }, uExt: { value: EXT }, uCell: { value: T.cell }, uHS: { value: HS },
    uSun: { value: SUN }, uTime: { value: 0 }, uRefl: { value: 0 }, uVent: { value: new THREE.Vector4(0, 0, 0, 0) },   // xyz 분출구, w 빛의 세기
    uFlash: { value: new THREE.Vector4(0, 0, 0, 0) }, uBoil: { value: new THREE.Vector3(0, 0, 0) }, tRefl: { value: null }, uRes: { value: new THREE.Vector2(2, 2) }, uPx: { value: 500 },
  };
  /** 땅의 값을 그림으로 옮긴다(계산 걸음 뒤마다) */
  function sync() {
    const { g, melt, heat, comp, kind, topTh, age } = T;
    for (let i = 0, o = 0; i < n; i++, o += 4) {
      const m = melt[i];
      dataA[o] = g[i] + m; dataA[o + 1] = m; dataA[o + 2] = m > 0 ? heat[i] : 0; dataA[o + 3] = comp[i];
      const k = kind[i];
      dataB[o] = k === KIND.TRACHYTE ? 1 : k === KIND.BASE ? .35 : 0;
      dataB[o + 1] = k === KIND.TEPHRA ? Math.min(1, topTh[i] / .8) : 0;
      dataB[o + 2] = Math.min(age[i], 60000);
      dataB[o + 3] = m > 0 ? heat[i] * Math.min(1, m / 1.2) : 0;
    }
    if (!floatLinear) { const a = texA.image.data, b = texB.image.data, h = THREE.DataUtils.toHalfFloat; for (let i = 0; i < n * 4; i++) { a[i] = h(dataA[i]); b[i] = h(Math.min(dataB[i], 60000)); } }
    for (let y = 0, q = 0; y < GN; y++) for (let x = 0; x < GN; x++, q++) { const o = ((y * 2) * N + x * 2) * 4 + 3; glowA[q] = (dataB[o] + dataB[o + 4] + dataB[o + N * 4] + dataB[o + N * 4 + 4]) * .25; }
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0, q = 0; y < GN; y++) for (let x = 0; x < GN; x++, q++) glowB[q] = (glowA[q] * 2 + glowA[x > 0 ? q - 1 : q] + glowA[x < GN - 1 ? q + 1 : q]) * .25;
      for (let y = 0, q = 0; y < GN; y++) for (let x = 0; x < GN; x++, q++) glowA[q] = (glowB[q] * 2 + glowB[y > 0 ? q - GN : q] + glowB[y < GN - 1 ? q + GN : q]) * .25;
    }
    for (let q = 0; q < GN * GN; q++) glowD[q] = Math.min(255, glowA[q] * 255);
    texA.needsUpdate = texB.needsUpdate = texG.needsUpdate = true;
  }

  // ───────────── 하늘
  const sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 48, 24), new THREE.ShaderMaterial({
    side: THREE.DoubleSide, depthWrite: false, depthTest: false, uniforms: U,
    vertexShader: `varying vec3 vD; void main(){ vD = position; vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; }`,
    fragmentShader: NOISE + SKY + /* glsl */`
      varying vec3 vD;
      void main(){
        vec3 d = normalize(vD); if (d.y < -.02) d.y = -.02;
        vec3 c = skyBase(d);
        float sd = dot(d, uSun);
        c += vec3(1.,.62,.28) * 14. * smoothstep(.99988, .99996, sd);        // 해
        float az = atan(d.x, -d.z), el = d.y;
        float near = pow(max(dot(normalize(d.xz), normalize(uSun.xz))*.5+.5, 0.), 2.);
        // 낮게 깔린 구름 띠: 해 쪽은 밑이 붉게 타고, 반대쪽은 잿빛 보라
        float band = smoothstep(.015,.06,el)*smoothstep(.34,.10,el);
        float cl = fbm(vec2(az*3.2 + uTime*.004, el*26.)) ; cl = smoothstep(.50,.72, cl + .10*fbm(vec2(az*11., el*70.)))*band;
        vec3 ccol = mix(vec3(.045,.04,.075), vec3(.85,.27,.09), near*smoothstep(.24,.03,el));
        c = mix(c, ccol, cl*.82);
        // 높은 새털구름
        float ci = fbm(vec2(az*2.1+3., el*9.+az*1.3)); ci = smoothstep(.56,.8,ci)*smoothstep(.16,.32,el)*smoothstep(.85,.45,el);
        c += vec3(.30,.13,.15)*ci*(.25+.7*near);
        // 별
        vec2 sp = vec2(az*90., el*140.); vec2 si = floor(sp); float sh = hash(si);
        float st = step(.985, sh)*smoothstep(.35,.0,length(fract(sp)-.5))*smoothstep(.22,.6,el)*(.6+.4*sin(uTime*2.+sh*90.));
        c += vec3(.8,.85,1.)*st*1.4*(1.-cl);
        gl_FragColor = vec4(c, 1.);
      }` }));
  sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);

  // ───────────── 땅
  let SEG = Math.round((N - 1) * Q.seg);
  const landGeo = () => new THREE.PlaneGeometry(EXT, EXT, SEG, SEG).rotateX(-Math.PI / 2);
  const landMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, uniforms: U, defines: { SMOOTH: 1, SHADOW: Q.shadow },
    vertexShader: BIC + /* glsl */`
      varying vec3 vW; varying vec2 vTc;
      void main(){ vTc = gridTc(position.xz); float h = bic(tA, vTc).r; vW = vec3(position.x, h*uHS, position.z); gl_Position = projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: NOISE + SKY + BIC + /* glsl */`
      varying vec3 vW; varying vec2 vTc;
      uniform float uRefl; uniform vec4 uVent, uFlash;
      float crust(vec2 p){ float r=0., a=.58; for(int i=0;i<3;i++){ float n=vnoise(p); r+=a*(1.-abs(2.*n-1.)); p=p*2.13+vec2(5.2,1.7); a*=.5; } return r; }
      void main(){
        if (uRefl > .5 && vW.y < 0.) discard;
        vec4 A = bic(tA, vTc), B = bic(tB, vTc);
        float e = .8/uN;
        float hx = bic(tA, vTc+vec2(e,0.)).r - bic(tA, vTc-vec2(e,0.)).r, hz = bic(tA, vTc+vec2(0.,e)).r - bic(tA, vTc-vec2(0.,e)).r;
        vec2 sl = vec2(hx, hz)/(1.6*uCell)*(uHS*100.);                     // 기울기(오르는 쪽)
        float steep = length(sl);
        vec2 up = sl/max(steep, 1e-4);
        float hm = vW.y/uHS, melt = A.g, heat = A.b, age = B.b, teph = B.g, lite = B.r;
        // 잔 무늬: 흘러내린 쪽으로 길게 늘인다
        vec2 p = vW.xz;
        vec2 ps = vec2(dot(p, up)*.9, dot(p, vec2(-up.y, up.x))*3.2);
        float nIso = fbm(p*3.1), nStr = fbm(ps*1.3 + 31.), nFine = fbm(p*13.);
        float streak = mix(nIso, nStr, .4*smoothstep(.02,.18,steep)*(1.-lite));        // 밝은 돌(돔)은 흐른 자국 없이 울퉁불퉁
        float d1 = .03;
        vec2 bump = vec2(fbm3((p+vec2(d1,0.))*5.) - fbm3((p-vec2(d1,0.))*5.), fbm3((p+vec2(0.,d1))*5.) - fbm3((p-vec2(0.,d1))*5.));
        float d2 = .12; bump += .8*vec2(fbm3((p+vec2(d2,0.))*1.3+9.) - fbm3((p-vec2(d2,0.))*1.3+9.), fbm3((p+vec2(0.,d2))*1.3+9.) - fbm3((p-vec2(0.,d2))*1.3+9.));   // 용암 자락만 한 굴곡
        float rough = mix(1.5, .45, teph);
        float gy1 = fbm3(vec2(dot(p, vec2(-up.y, up.x))*5.5 + .15, dot(p, up)*.45) + 4.) - fbm3(vec2(dot(p, vec2(-up.y, up.x))*5.5 - .15, dot(p, up)*.45) + 4.);
        bump += vec2(-up.y, up.x) * gy1 * 2.2 * teph * smoothstep(.2,.5,steep);
        vec3 Nn = normalize(vec3(-sl.x - bump.x*rough, 1., -sl.y - bump.y*rough));
        // 겉
        float old = smoothstep(40., 1500., age);
        vec3 basalt = mix(vec3(.010,.010,.012), vec3(.125,.112,.10), old);
        vec3 trach = mix(vec3(.05,.045,.042), vec3(.36,.32,.27), old*.8+.2);
        float across = dot(p, vec2(-up.y, up.x)), along = dot(p, up);
        float gully = fbm3(vec2(across*5.5, along*.45) + 4.) * smoothstep(.2,.5,steep);        // 비탈을 따라 팬 골
        vec3 ash = mix(vec3(.035,.028,.026), vec3(.20,.15,.11), smoothstep(100., 2200., age)) * (.85+.3*nFine);
        ash = mix(ash, vec3(.15,.045,.03), smoothstep(.45,.75,nIso)*.7*(1.-smoothstep(600.,4000.,age)*.6));   // 붉게 탄 부스러기
        ash *= 1. - .55*gully;
        float crag = fbm(p*7.3 + 11.);
        vec3 alb = mix(basalt * (.55 + .9*streak), trach * (.5 + 1.0*crag), lite);
        alb = mix(alb, ash, teph);
        // 풀: 오래된 땅의 낮고 완만한 곳부터 이끼 → 풀
        float low = smoothstep(900., 60., hm) * smoothstep(.85, .25, steep) * smoothstep(1.5, 9., hm);
        float veg = smoothstep(900., 3400., age + 1500.*(low-.55) + 1000.*(nIso-.5));
        float lush = smoothstep(2600., 7000., age + 2200.*(nStr-.5));
        vec3 green = mix(vec3(.10,.115,.03), vec3(.065,.20,.045), lush) * (.7+.6*nFine);
        alb = mix(alb, green, veg*low);
        float wet = smoothstep(3.2, .3, hm); alb *= mix(1., .45, wet);
        // 빛
        vec3 V = normalize(cameraPosition - vW);
        float ndl = max(dot(Nn, uSun), 0.);
        float sh = 1.;
        #if SHADOW > 0
        { vec3 q = vW; float stp = uExt/uN*1.3; for (int i = 0; i < SHADOW; i++) { q += uSun*stp; float hh = textureLod(tA, gridTc(q.xz), 0.).r*uHS; sh = min(sh, clamp((q.y - hh)*4. + 1., 0., 1.)); } }
        #endif
        vec3 sunCol = vec3(1.,.50,.20)*2.4;
        vec3 amb = mix(vec3(.15,.10,.11), vec3(.11,.13,.25), Nn.y*.5+.5) * 1.7 + skyBase(normalize(vec3(Nn.x, max(Nn.y,.05), Nn.z)))*.9;
        // 가까운 용암이 비추는 붉은 빛
        float gl = texture2D(tG, vW.xz/uExt + .5).r;
        vec3 toV = uVent.xyz - vW; float dv = length(toV);
        float ventL = uVent.w * max(dot(Nn, toV/dv)*.6+.4, 0.) / (1. + dv*dv*.02);
        vec3 fire = vec3(1.,.30,.05) * (gl*1.1 + ventL*.5);
        vec3 toF = uFlash.xyz - vW; float fl = uFlash.w / (1. + dot(toF,toF)*.004);
        float gloss = mix(mix(.26, .05, old), .03, teph) * (1.-veg*low) * (.4+1.2*nFine) + wet*.35;
        vec3 Hh = normalize(uSun + V);
        float spec = pow(max(dot(Nn, Hh), 0.), 60.) * gloss * 2.;
        vec3 R = reflect(-V, Nn); float fr = pow(1. - max(dot(Nn, V), 0.), 4.);
        vec3 col = alb * (sunCol*ndl*sh + amb + fire + vec3(.8,.85,1.)*fl) + sunCol*spec*sh + skyBase(R)*fr*gloss*.35;
        // 용암: 통째로 빛나지 않는다. 검은 껍질 사이의 틈과 흐르는 끝만 빛난다
        float m = smoothstep(.03, .45, melt);
        if (m > 0.001) {
          float spd = (.2 + heat) * clamp(steep*5., .12, 1.) * (1. - .8*A.a);
          float ph = fract(uTime*.22), ph2 = fract(uTime*.22 + .5);
          vec2 q = p*1.9;
          float c1 = crust(q + up*spd*ph*2.2), c2 = crust(q + up*spd*ph2*2.2 + 7.7);
          float cr = mix(c2, c1, abs(1.-2.*ph2));
          float r1 = crust(q*.42 + up*spd*ph*.9 + 3.), r2 = crust(q*.42 + up*spd*ph2*.9 + 9.4);       // 강 위에 떠가는 큰 껍질 판
          float raft = mix(r2, r1, abs(1.-2.*ph2));
          float hot = pow(clamp(heat, 0., 1.), 1.5) * smoothstep(.3, 5., melt);
          float core = smoothstep(2.6, 7.5, melt) * smoothstep(.35, .8, heat);        // 줄기의 한가운데
          float th = mix(mix(.955, .72, hot), .60, core);
          float cc = mix(cr, cr*.5 + raft*.55, core);
          float glow = smoothstep(th, th+.07, cc);
          float temp = heat*(.30 + .70*glow)*(.6 + .4*smoothstep(.3, 4., melt)) * (.55 + .5*smoothstep(th, 1.02, cc));   // 틈의 한가운데가 가장 뜨겁다
          vec3 em = vec3(1.,.04,.0)*smoothstep(.03,.28,temp)*.62 + vec3(1.,.20,.0)*smoothstep(.22,.55,temp)*.75 + vec3(1.,.50,.10)*smoothstep(.55,.9,temp)*.85;
          em *= glow;
          vec3 skin = vec3(.014,.012,.013)*(.6+.8*cr) * (sunCol*ndl*sh + amb) + sunCol*pow(max(dot(Nn, Hh), 0.), 40.)*.25*sh + skyBase(R)*fr*.15 + vec3(1.,.25,.03)*heat*.05;
          col = mix(col, skin + em, m);
        }
        // 갓 굳은 돌에 잠깐 남는 붉은 틈
        float after = exp(-age/26.) * (1.-m) * (1.-teph) * step(age, 200.);
        if (after > .01) { float cr = crust(p*1.9); col += vec3(1.,.10,.01) * smoothstep(.86,.97,cr) * after * 1.6; }
        float dist = length(cameraPosition - vW);
        col = mix(col, skyBase(normalize(vec3(-V.x, .02, -V.z)))*.8, 1. - exp(-dist/900.));
        gl_FragColor = vec4(col, 1.);
      }` });
  const land = new THREE.Mesh(landGeo(), landMat); land.frustumCulled = false; scene.add(land);

  // ───────────── 바다
  const seaMat = new THREE.ShaderMaterial({
    uniforms: U, defines: { SMOOTH: 1 },
    vertexShader: `varying vec3 vW; void main(){ vW = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: NOISE + SKY + BIC + /* glsl */`
      varying vec3 vW; uniform sampler2D tRefl; uniform vec2 uRes; uniform vec4 uVent; uniform vec3 uBoil;
      float wv(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*f*(f*(f*6.-15.)+10.); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x), f.y); }
      float wave(vec2 p){ p *= 2.3; vec2 q = vec2(dot(p, vec2(.94,.34)), dot(p, vec2(-.34,.94))*.42);                 // 바람 쪽으로 밀려가는 긴 물결
        return wv(q*1.05 + uTime*vec2(.30,.02))*.50 + wv(q*2.6 + vec2(3.1,7.7) + uTime*vec2(.48,-.06))*.27 + wv(q.yx*vec2(3.,4.6) + uTime*vec2(-.2,.6))*.10 + wv(p*.17 + uTime*.04)*.3; }
      void main(){
        vec2 p = vW.xz; vec3 Vv = cameraPosition - vW; float dist = length(Vv); vec3 V = Vv/dist;
        float k = 1./(1. + dist*.02);
        float e = .035; float w0 = wave(p);
        vec2 gr = vec2(wave(p+vec2(e,0.)) - w0, wave(p+vec2(0.,e)) - w0)/e;
        vec3 Nn = normalize(vec3(-gr.x*.16*k, 1., -gr.y*.16*k));
        // 깊이
        vec2 uv = p/uExt + .5; float inside = step(0., uv.x)*step(uv.x, 1.)*step(0., uv.y)*step(uv.y, 1.);
        vec2 tc = gridTc(p); vec4 A = bic(tA, tc);
        float depth = mix(400., -A.r, inside);
        float gl = texture2D(tG, clamp(uv, 0., 1.)).r*inside;
        float fres = .03 + .97*pow(1. - max(dot(Nn, V), 0.), 5.);
        vec2 suv = gl_FragCoord.xy/uRes, dv = vec2(Nn.x*.5, Nn.z*1.3)*k;
        vec3 refl = (texture2D(tRefl, clamp(suv + dv*.35, .002, .998)).rgb + texture2D(tRefl, clamp(suv + dv*.9 + vec2(0., .006*k), .002, .998)).rgb + texture2D(tRefl, clamp(suv - dv*.2 + vec2(0., .014*k), .002, .998)).rgb)*.3333;
        // 물빛: 깊으면 검푸르고, 얕으면 밝은 청록, 아주 얕으면 바닥이 비친다
        vec3 deep = vec3(.006,.018,.032), shal = vec3(.025,.22,.21), bed = vec3(.05,.085,.07);
        vec3 body = mix(deep, shal, exp(-max(depth,0.)/42.)); body = mix(body, bed, exp(-max(depth,0.)/5.)*.6);
        float bd = length(p - uBoil.xy);                                     // 바다 밑 분출: 수면이 부글거리며 물빛이 변한다
        float boil = uBoil.z * smoothstep(5.5, .4, bd + (fbm3(p*1.1 + uTime*.3)-.5)*3.);
        float murk = max(smoothstep(.03, .30, gl), boil*1.2);                // 용암이 닿은 둘레는 탁한 연두
        body = mix(body, mix(vec3(.09,.14,.06), vec3(.16,.26,.16), boil), min(murk, 1.)*mix(.5, .85, boil));
        
        // 물속에서 비치는 붉은 빛
        float under = A.g > .02 ? A.b*smoothstep(.02,.8,A.g) : 0.;
        vec3 glow = vec3(1.,.28,.04) * (under*exp(-max(depth,0.)/28.)*2.5 + gl*.3) * inside;
        vec3 Hh = normalize(uSun + V); float sp = pow(max(dot(Nn, Hh), 0.), 420.) * 4.;
        vec3 col = mix(body, refl, fres) + glow*(1.-fres*.5) + vec3(1.,.55,.22)*sp;
        vec3 toV = uVent.xyz - vW; col += vec3(1.,.30,.05) * uVent.w * .06 / (1. + dot(toV,toV)*.012);
        // 물가 거품 띠와 끓는 자리
        float shore = smoothstep(6.5, .3, depth) * inside;
        float lap = sin(depth*.9 - uTime*1.3 + fbm3(p*1.3)*7.)*.5+.5;
        float foam = shore * smoothstep(.35, .75, fbm3(p*5. + uTime*.15) + lap*.45*shore);
        foam = max(foam, smoothstep(.04,.35,gl) * smoothstep(60., 0., depth) * (.45 + .55*vnoise(p*9. + uTime*2.2)));
        foam = max(foam, uBoil.z * smoothstep(2.6, .2, bd) * smoothstep(.42, .7, vnoise(p*6. + uTime*vec2(1.7,-2.3)) + .35*sin(bd*5. - uTime*4.)));
        vec3 foamCol = vec3(.50,.47,.50) + vec3(1.,.45,.2)*.10 + vec3(1.,.3,.05)*gl*1.5;
        col += vec3(1.,.28,.04) * uBoil.z * smoothstep(2.2, 0., bd) * (.16 + .1*sin(uTime*5.3));
        col = mix(col, max(foamCol, col*1.12), clamp(foam, 0., 1.)*.9);
        col = mix(col, skyBase(normalize(vec3(-V.x, .012, -V.z))), 1. - exp(-dist/1500.));
        gl_FragColor = vec4(col, 1.);
      }` });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2), seaMat); sea.layers.set(1); sea.frustumCulled = false; scene.add(sea);

  // ───────────── 연기·재·김(네모 딱지를 눈 쪽으로 세움)
  const MAXK = 640, K = { n: 0, p: new Float32Array(MAXK * 3), v: new Float32Array(MAXK * 3), age: new Float32Array(MAXK), life: new Float32Array(MAXK), s0: new Float32Array(MAXK), s1: new Float32Array(MAXK), type: new Uint8Array(MAXK), seed: new Float32Array(MAXK), top: new Float32Array(MAXK), y0: new Float32Array(MAXK), a: new Float32Array(MAXK) };
  const kGeo = new THREE.InstancedBufferGeometry();
  kGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3)); kGeo.setIndex([0, 1, 2, 0, 2, 3]);
  const kPos = new THREE.InstancedBufferAttribute(new Float32Array(MAXK * 3), 3), kA = new THREE.InstancedBufferAttribute(new Float32Array(MAXK * 4), 4), kB = new THREE.InstancedBufferAttribute(new Float32Array(MAXK * 4), 4);
  for (const a of [kPos, kA, kB]) a.setUsage(THREE.DynamicDrawUsage);
  kGeo.setAttribute('iPos', kPos); kGeo.setAttribute('iA', kA); kGeo.setAttribute('iB', kB); kGeo.instanceCount = 0;
  const kMat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      attribute vec3 iPos; attribute vec4 iA, iB; varying vec2 vP; varying vec4 vA, vB; varying vec3 vC;
      void main(){ vP = position.xy; vA = iA; vB = iB; vC = iPos; float c = cos(iA.y), s = sin(iA.y);
        vec4 mv = viewMatrix*vec4(iPos,1.); mv.xy += mat2(c,-s,s,c)*position.xy*iA.x; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: NOISE + SKY + /* glsl */`
      varying vec2 vP; varying vec4 vA, vB; varying vec3 vC; uniform vec4 uVent, uFlash; uniform float uRefl;
      void main(){
        if (uRefl > .5 && vC.y < 0.) discard;
        float r2 = dot(vP, vP); if (r2 > 1.) discard; float r = sqrt(r2);
        float c = cos(vA.y), s = sin(vA.y); vec2 q = mat2(c,s,-s,c)*vP;
        float n = fbm3(q*1.5 + vB.x*37.) , n2 = vnoise(q*4.6 + vB.x*11.);
        float rr = r*(.62 + n*1.05);                                        // 가장자리가 동그랗게 보이지 않게 울퉁불퉁하게
        float fall = pow(max(1. - rr*rr, 0.), 1.4);
        float dens = fall * smoothstep(vA.w < .5 ? .08 : .2, vA.w < .5 ? .5 : .75, n2*.55 + fall*.6);
        if (dens < .01) discard;
        vec3 nv = normalize(vec3(vP*.75 + (vec2(n, n2)-.5)*.9, .75));
        vec3 nw = nv * mat3(viewMatrix);
        float type = vA.w;                                                 // 0 재 · 1 김 · 2 옅은 연기
        vec3 alb = type < .5 ? mix(vec3(.060,.052,.050), vec3(.17,.15,.14), vB.z) : type < 1.5 ? vec3(.60,.59,.60) : vec3(.34,.30,.30);
        vec3 sunCol = vec3(1.,.50,.20)*1.5;
        float ndl = max((dot(nw, uSun) + .35)/1.35, 0.);
        vec3 V = normalize(cameraPosition - vC);
        float rim = pow(max(dot(-V, uSun), 0.), 3.) * (1. - dens)*(1. - dens);   // 해를 등진 엷은 가장자리가 빛난다
        vec3 amb = mix(vec3(.15,.10,.11), vec3(.11,.13,.25), nw.y*.5+.5)*1.1;
        vec3 toV = uVent.xyz - vC; float dv = length(toV);
        float under = uVent.w * max(dot(nw, toV/dv)*.6+.5, 0.) / (1. + dv*dv*.016);
        vec3 toF = uFlash.xyz - vC; float fl = uFlash.w * 1.5 / (1. + dot(toF,toF)*.025);
        vec3 col = alb*(sunCol*(ndl + rim*(type < .5 ? .8 : 1.)) + amb + vec3(1.,.30,.05)*under*2.2 + vec3(.75,.82,1.)*fl);
        col += vec3(1.,.32,.04) * vB.w * (1.-r) * 2.5;                      // 갓 나온 재 속의 불빛
        col = mix(col, skyBase(normalize(vec3(-V.x, .03, -V.z)))*.8, 1. - exp(-length(cameraPosition - vC)/1200.));
        gl_FragColor = vec4(col, dens*vB.y);
      }` });
  const puffs = new THREE.Mesh(kGeo, kMat); puffs.frustumCulled = false; puffs.renderOrder = 5; scene.add(puffs);
  let maxK = Q.puffs;
  function puff(type, x, y, z, vx, vy, vz, s0, s1, life, alpha, top) {
    let i = K.n;
    if (i >= maxK) { i = 0; for (let j = 1; j < K.n; j++) if (K.age[j] / K.life[j] > K.age[i] / K.life[i]) i = j; } else K.n++;
    K.p[i * 3] = x; K.p[i * 3 + 1] = y; K.p[i * 3 + 2] = z; K.v[i * 3] = vx; K.v[i * 3 + 1] = vy; K.v[i * 3 + 2] = vz;
    K.age[i] = 0; K.life[i] = life; K.s0[i] = s0; K.s1[i] = s1; K.type[i] = type; K.seed[i] = Math.random(); K.top[i] = top || 0; K.y0[i] = y; K.a[i] = alpha;
  }
  function stepPuffs(dt) {
    for (let i = K.n - 1; i >= 0; i--) {
      K.age[i] += dt;
      if (K.age[i] >= K.life[i]) { K.n--; if (i !== K.n) { for (let k = 0; k < 3; k++) { K.p[i * 3 + k] = K.p[K.n * 3 + k]; K.v[i * 3 + k] = K.v[K.n * 3 + k]; } for (const k of ['age', 'life', 's0', 's1', 'type', 'seed', 'top', 'y0', 'a']) K[k][i] = K[k][K.n]; } continue; }
      const o = i * 3, top = K.top[i];
      if (top > 0) {                                                       // 재 기둥: 오를수록 느려지고, 꼭대기에서 옆으로 퍼져 바람에 실린다
        const f = Math.min(1, Math.max(0, (K.p[o + 1] - K.y0[i]) / (top - K.y0[i])));
        const rise = K.v[o + 1] * Math.pow(1 - f, .55) + .02;
        const sp = f > .72 ? (f - .72) / .28 : 0, sd = K.seed[i] * 6.283;
        K.p[o] += (K.v[o] * (1 - sp) + (Math.cos(sd) * 1.5 + WINDV.x * 1.3) * sp) * dt;
        K.p[o + 2] += (K.v[o + 2] * (1 - sp) + (Math.sin(sd) * 1.5 + WINDV.z * 1.3) * sp) * dt;
        K.p[o + 1] += rise * dt;
      } else {
        const drag = Math.exp(-dt * .35), lean = Math.min(1, K.age[i] * .25);
        K.v[o] = K.v[o] * drag + WINDV.x * .5 * lean * dt; K.v[o + 2] = K.v[o + 2] * drag + WINDV.z * .5 * lean * dt; K.v[o + 1] *= Math.exp(-dt * .12);
        K.p[o] += K.v[o] * dt; K.p[o + 1] += K.v[o + 1] * dt; K.p[o + 2] += K.v[o + 2] * dt;
      }
    }
  }
  const order = new Uint16Array(MAXK), depthK = new Float32Array(MAXK), fwd = new THREE.Vector3();
  function uploadPuffs() {
    camera.getWorldDirection(fwd); const c = camera.position;
    for (let i = 0; i < K.n; i++) { order[i] = i; depthK[i] = (K.p[i * 3] - c.x) * fwd.x + (K.p[i * 3 + 1] - c.y) * fwd.y + (K.p[i * 3 + 2] - c.z) * fwd.z; }
    const ord = Array.prototype.slice.call(order, 0, K.n).sort((a, b) => depthK[b] - depthK[a]);
    for (let q = 0; q < K.n; q++) {
      const i = ord[q], f = K.age[i] / K.life[i];
      kPos.array[q * 3] = K.p[i * 3]; kPos.array[q * 3 + 1] = K.p[i * 3 + 1]; kPos.array[q * 3 + 2] = K.p[i * 3 + 2];
      kA.array[q * 4] = K.s0[i] + (K.s1[i] - K.s0[i]) * Math.pow(f, .6); kA.array[q * 4 + 1] = K.seed[i] * 6.283 + K.age[i] * (K.seed[i] - .5) * .12; kA.array[q * 4 + 2] = f; kA.array[q * 4 + 3] = K.type[i];
      kB.array[q * 4] = K.seed[i]; kB.array[q * 4 + 1] = K.a[i] * Math.min(1, K.age[i] * 2.5) * Math.min(1, (1 - f) * 3.2); kB.array[q * 4 + 2] = Math.min(1, f * 1.6); kB.array[q * 4 + 3] = K.type[i] === 0 ? Math.max(0, 1 - K.age[i] * .9) : 0;
    }
    kGeo.instanceCount = K.n; kPos.needsUpdate = kA.needsUpdate = kB.needsUpdate = true;
  }

  // ───────────── 불똥(불 분수·튀는 용암)
  const MAXS = 6000, TRAIL = 3, P = { n: 0, p: new Float32Array(MAXS * 3), v: new Float32Array(MAXS * 3), age: new Float32Array(MAXS), life: new Float32Array(MAXS), size: new Float32Array(MAXS) };
  const sGeo = new THREE.BufferGeometry(), sPos = new THREE.BufferAttribute(new Float32Array(MAXS * TRAIL * 3), 3), sDat = new THREE.BufferAttribute(new Float32Array(MAXS * TRAIL * 2), 2);
  sPos.setUsage(THREE.DynamicDrawUsage); sDat.setUsage(THREE.DynamicDrawUsage); sGeo.setAttribute('position', sPos); sGeo.setAttribute('dat', sDat); sGeo.setDrawRange(0, 0);
  const sparks = new THREE.Points(sGeo, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec2 dat; varying vec2 vD; varying float vY; uniform float uPx; void main(){ vD = dat; vY = position.y; vec4 mv = viewMatrix*vec4(position,1.); gl_Position = projectionMatrix*mv; gl_PointSize = max(1.5, dat.y*uPx/-mv.z); }`,
    fragmentShader: `varying vec2 vD; varying float vY; uniform float uRefl; void main(){ if (uRefl > .5 && vY < 0.) discard; float r = length(gl_PointCoord-.5)*2.; float a = smoothstep(1., .1, r); float t = vD.x;
      vec3 c = vec3(1.,.80,.42)*smoothstep(.6,1.,t)*1.6 + vec3(1.,.34,.04)*smoothstep(.2,.7,t)*1.3 + vec3(.9,.06,.0)*smoothstep(0.,.3,t)*.6; gl_FragColor = vec4(c*a*.55, 1.); }` }));
  sparks.frustumCulled = false; sparks.renderOrder = 6; scene.add(sparks);
  let maxS = Q.sparks;
  function spark(x, y, z, vx, vy, vz, life, size) { if (P.n >= maxS) return; const i = P.n++, o = i * 3; P.p[o] = x; P.p[o + 1] = y; P.p[o + 2] = z; P.v[o] = vx; P.v[o + 1] = vy; P.v[o + 2] = vz; P.age[i] = 0; P.life[i] = life; P.size[i] = size; }
  const half = (N - 1) / 2, toCell = 100 / T.cell;
  /** 그 자리의 땅(녹은 것 포함) 높이, 그림 단위 */
  function groundAt(x, z) { const gx = Math.round(x * toCell + half), gy = Math.round(z * toCell + half); if (gx < 0 || gy < 0 || gx >= N || gy >= N) return -9; const i = gy * N + gx; return (T.g[i] + T.melt[i]) * HS; }
  function stepSparks(dt) {
    for (let i = P.n - 1; i >= 0; i--) {
      const o = i * 3; P.age[i] += dt; P.v[o + 1] -= GRAV * dt; const dr = Math.exp(-dt * .08); P.v[o] *= dr; P.v[o + 2] *= dr;
      P.p[o] += P.v[o] * dt; P.p[o + 1] += P.v[o + 1] * dt; P.p[o + 2] += P.v[o + 2] * dt;
      let dead = P.age[i] >= P.life[i];
      if (!dead && P.v[o + 1] < 0 && P.p[o + 1] < Math.max(groundAt(P.p[o], P.p[o + 2]), -.02)) { if (P.p[o + 1] > .02 && Math.random() < .25) { P.v[o + 1] *= -.22; P.v[o] *= .5; P.v[o + 2] *= .5; P.life[i] = Math.min(P.life[i], P.age[i] + 1.2); } else dead = true; }
      if (dead) { P.n--; if (i !== P.n) { for (let k = 0; k < 3; k++) { P.p[o + k] = P.p[P.n * 3 + k]; P.v[o + k] = P.v[P.n * 3 + k]; } P.age[i] = P.age[P.n]; P.life[i] = P.life[P.n]; P.size[i] = P.size[P.n]; } }
    }
  }
  function uploadSparks() {
    const a = sPos.array, d = sDat.array; let q = 0;
    for (let i = 0; i < P.n; i++) { const o = i * 3, t = Math.max(0, 1 - P.age[i] / P.life[i]);
      for (let k = 0; k < TRAIL; k++, q++) { const b = k * .09; a[q * 3] = P.p[o] - P.v[o] * b; a[q * 3 + 1] = P.p[o + 1] - P.v[o + 1] * b; a[q * 3 + 2] = P.p[o + 2] - P.v[o + 2] * b; d[q * 2] = t * (1 - k * .22); d[q * 2 + 1] = P.size[i] * (1 - k * .2); } }
    sGeo.setDrawRange(0, q); sPos.needsUpdate = sDat.needsUpdate = true;
  }

  // ───────────── 번개(재 기둥 속)
  const MAXB = 96, bGeo = new THREE.BufferGeometry(), bPos = new THREE.BufferAttribute(new Float32Array(MAXB * 6), 3); bPos.setUsage(THREE.DynamicDrawUsage); bGeo.setAttribute('position', bPos); bGeo.setDrawRange(0, 0);
  const bMat = new THREE.LineBasicMaterial({ color: new THREE.Color(7, 8, 12), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const bolts = new THREE.LineSegments(bGeo, bMat); bolts.frustumCulled = false; bolts.renderOrder = 7; scene.add(bolts);
  let boltT = 0;
  function bolt(cx, cy, cz, len) {
    const a = bPos.array; let q = 0; const seg = (x0, y0, z0, x1, y1, z1) => { if (q >= MAXB) return; for (const off of [0, .04]) { if (q >= MAXB) break; a.set([x0 + off, y0, z0, x1 + off, y1, z1], q * 6); q++; } };
    const walk = (x, y, z, dx, dy, dz, nseg, L, br) => { for (let s = 0; s < nseg; s++) { const nx = x + (dx + (Math.random() - .5) * 1.3) * L, ny = y + (dy + (Math.random() - .5) * 1.1) * L, nz = z + (dz + (Math.random() - .5) * 1.3) * L; seg(x, y, z, nx, ny, nz); if (br && Math.random() < .3) walk(nx, ny, nz, dx + (Math.random() - .5) * 1.5, dy - .3, dz + (Math.random() - .5) * 1.5, 3, L * .7, false); x = nx; y = ny; z = nz; } };
    const th = Math.random() * 6.283; walk(cx, cy, cz, Math.cos(th) * .5, -.75, Math.sin(th) * .5, 8, len / 8, true);
    bGeo.setDrawRange(0, q * 2); bPos.needsUpdate = true; boltT = .13 + Math.random() * .08; U.uFlash.value.set(cx, cy - len * .4, cz, 1);
  }

  // ───────────── 크기 견줌: 등대와 고깃배(블렌더 volcano_props.py → props.glb)
  const props = { house: null, boat: null, lamp: null, boatLamp: null, at: -1, y: 0, k: 0, wait: 2, phase: 0 };
  const PROP_SCALE = 0.01 * 1.7;                                           // 1m = 0.01 · 멀리서도 보이게 1.7배(닮게 만든 모형)
  const flareTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,240,200,.5)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const mkFlare = (col, s) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, color: col, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); m.scale.setScalar(s); m.renderOrder = 8; return m; };
  try {
    const gltf = await new GLTFLoader().loadAsync(new URL('./assets/props.glb', import.meta.url).href);
    gltf.scene.traverse(o => { if (o.isMesh) { o.material.side = THREE.DoubleSide; o.frustumCulled = false; } });
    for (const key of ['lighthouse', 'boat']) { const o = gltf.scene.getObjectByName(key); if (!o) continue; const gp = new THREE.Group(); o.position.set(0, 0, 0); gp.add(o); gp.scale.setScalar(PROP_SCALE); gp.visible = false; scene.add(gp); props[key === 'boat' ? 'boat' : 'house'] = gp; }
    if (props.house) { props.lamp = mkFlare(new THREE.Color(4, 3.2, 1.9), 1); scene.add(props.lamp); props.lamp.visible = false; }
    if (props.boat) { props.boatLamp = mkFlare(new THREE.Color(3, 2.2, 1.2), .3); scene.add(props.boatLamp); }
  } catch (e) { console.warn('props.glb 없음', e.message); }
  /** 등대는 섬이 물 위로 올라온 뒤, 식고 조용한 물가에 선다. 용암이 다가오면 자리를 비우고 새 물가를 찾는다 */
  function stepProps(dt) {
    props.phase += dt;
    const H = props.house;
    if (H) {
      if (props.at >= 0) {
        const i = props.at, x = i % N, y = (i / N) | 0; let hot = false;
        for (let dy = -2; dy <= 2 && !hot; dy++) for (let dx = -2; dx <= 2; dx++) { const j = (y + dy) * N + x + dx; if (T.melt[j] > .05) { hot = true; break; } }
        const gy = T.g[i]; if (hot || Math.abs(gy - props.y) > 14 || gy < T.sea + 2) { props.at = -1; props.wait = 3; }
        else { props.y += (gy - props.y) * Math.min(1, dt * 2); props.k = Math.min(1, props.k + dt * 1.2); }
      } else {
        props.k = Math.max(0, props.k - dt * 2.5);
        props.wait -= dt;
        if (props.wait <= 0 && props.k <= 0) {
          props.wait = 1.2; let best = -1, bs = -1e9; const ca = Math.atan2(camera.position.x, camera.position.z);
          for (let tries = 0; tries < 140; tries++) {
            const a = ca + (Math.random() - .5) * 2.4, c = Math.cos(a), s = Math.sin(a);
            for (let r = half - 2; r > 3; r -= 1) {                         // 바깥에서 안으로: 처음 만나는 뭍
              const x = Math.round(T.vent.x + s * r), y = Math.round(T.vent.y + c * r); if (x < 3 || y < 3 || x >= N - 3 || y >= N - 3) continue; const i = y * N + x;
              if (T.g[i] > T.sea + 4) { const j = Math.round(T.vent.y + c * (r - 1.5)) * N + Math.round(T.vent.x + s * (r - 1.5)); let ok = T.g[j] > T.sea + 6 && T.g[j] < T.sea + 90 && T.age[j] > 220 && r > 6;
                if (ok) for (let dy = -3; dy <= 3 && ok; dy++) for (let dx = -3; dx <= 3; dx++) if (T.melt[j + dy * N + dx] > .02) { ok = false; break; }
                if (ok) { const sc = T.age[j] * .002 + r * .2 - Math.abs(a - ca) * 3 - T.g[j] * .02; if (sc > bs) { bs = sc; best = j; } } break; }
            }
          }
          if (best >= 0) { props.at = best; props.y = T.g[best]; const x = best % N, y = (best / N) | 0; H.position.set((x - half) / toCell, props.y * HS, (y - half) / toCell); H.rotation.y = Math.random() * 6.28; }
        }
      }
      H.visible = props.k > 0.01; H.scale.setScalar(PROP_SCALE * (props.k * props.k * (3 - 2 * props.k)));
      if (props.at >= 0) H.position.y = props.y * HS;
      const beam = Math.pow(Math.max(0, Math.sin(props.phase * 1.25)), 24);
      props.lamp.visible = H.visible; props.lamp.position.set(H.position.x, H.position.y + 22.8 * PROP_SCALE * props.k, H.position.z); props.lamp.scale.setScalar((.22 + 1.5 * beam) * props.k * Math.max(.35, Math.min(1, camera.position.distanceTo(H.position) / 45)));
    }
    const Bt = props.boat;
    if (Bt) {                                                              // 고깃배는 섬 바깥을 천천히 돈다
      props.R = (props.R || 14) + (Math.min(64, cam.land + 7 + cam.dist * .09) - (props.R || 14)) * Math.min(1, dt * .25);   // 섬이 자라면 물러난다
      const R = props.R, a = .62 - props.phase * .004, x = Math.sin(a) * R, z = Math.cos(a) * R;
      const far = groundAt(x, z) < -.3; Bt.visible = far;
      Bt.position.set(x, .01 + Math.sin(props.phase * .9) * .012, z); Bt.rotation.set(Math.sin(props.phase * .7) * .04, a + Math.PI, Math.sin(props.phase * 1.1) * .05);
      props.boatLamp.visible = far; props.boatLamp.position.set(x, 5.3 * PROP_SCALE, z); props.boatLamp.scale.setScalar(.3 * Math.max(.3, Math.min(1, camera.position.distanceTo(Bt.position) / 40)));
    }
  }

  // ───────────── 분출을 그림으로: E = { mode, fountain 0~1, column 0~1, visc, gas, calm }
  const vent = new THREE.Vector3(); let glowL = 0, acc = { f: 0, c: 0, st: 0, fu: 0, sp: 0, bolt: 0 }, steamI = 0, colTop = 30, colLive = 0;
  function burst(power) {                                                 // 큰 폭발의 첫 순간
    for (let i = 0; i < 420 * power; i++) { const th = Math.random() * 6.283, sp = .5 + Math.random() * 2.6, up = 1.4 + Math.random() * 3.4; spark(vent.x, vent.y + .1, vent.z, Math.cos(th) * sp, up, Math.sin(th) * sp, 6 + Math.random() * 6, .09 + Math.random() * .16); }
    for (let i = 0; i < 46; i++) { const th = Math.random() * 6.283, r = Math.random(); puff(0, vent.x + Math.cos(th) * r, vent.y + Math.random() * 1.5, vent.z + Math.sin(th) * r, Math.cos(th) * (.6 + r * 1.6), 2.2 + Math.random() * 2.8, Math.sin(th) * (.6 + r * 1.6), 1.6, 7 + Math.random() * 4, 22 + Math.random() * 10, .95, vent.y + 14 + Math.random() * 16); }
    glowL = 9;
  }
  function stepFx(dt, E) {
    U.uTime.value += dt;
    const vx = T.vent.x, vy = T.vent.y, vi = Math.round(vy) * N + Math.round(vx);
    vent.set((vx - half) / toCell, Math.max((T.g[vi] + T.melt[vi]) * HS, 0), (vy - half) / toCell);
    const above = T.g[vi] + T.melt[vi] > T.sea - 3;
    // 불 분수
    const fo = E.fountain || 0;
    if (fo > .02 && above) { acc.f += dt * (90 + 230 * fo); const hgt = 1.4 + 5.2 * fo, v0 = Math.sqrt(2 * GRAV * hgt);
      while (acc.f >= 1) { acc.f--; const th = Math.random() * 6.283, sp = Math.pow(Math.random(), .7) * (.10 + .10 * fo) * v0, k = .45 + .55 * Math.random(); spark(vent.x + (Math.random() - .5) * .5, vent.y + .05, vent.z + (Math.random() - .5) * .5, Math.cos(th) * sp + WINDV.x * .1, v0 * k, Math.sin(th) * sp + WINDV.z * .1, 2 * v0 * k / GRAV + 1.5, .1 + Math.random() * .22); }
      acc.fu += dt * (2.2 + 2.5 * fo); while (acc.fu >= 1) { acc.fu--; puff(2, vent.x + (Math.random() - .5) * .8, vent.y + hgt * (.4 + Math.random() * .5), vent.z + (Math.random() - .5) * .8, WINDV.x * .5, .5 + Math.random() * .5, WINDV.z * .5, 1.2, 5 + Math.random() * 3, 12 + Math.random() * 6, .34); } }
    // 흐르거나 부푸는 동안: 분출구에서 가끔 튀는 용암과 옅은 연기
    if ((E.mode === 'flow' || E.mode === 'dome' || E.mode === 'building') && above) {
      const k = E.mode === 'flow' ? 1 : .35; acc.sp += dt * 26 * k; while (acc.sp >= 1) { acc.sp--; const th = Math.random() * 6.283, sp = Math.random() * .22; spark(vent.x + (Math.random() - .5) * .6, vent.y + .03, vent.z + (Math.random() - .5) * .6, Math.cos(th) * sp, .25 + Math.random() * .55, Math.sin(th) * sp, 2.5, .07 + Math.random() * .1); }
      acc.fu += dt * (E.mode === 'building' ? 1.6 : .8); while (acc.fu >= 1) { acc.fu--; puff(2, vent.x + (Math.random() - .5), vent.y + .2, vent.z + (Math.random() - .5), WINDV.x * .25, .35 + Math.random() * .3, WINDV.z * .25, .7, 3.5 + Math.random() * 2.5, 11 + Math.random() * 6, E.mode === 'building' ? .4 : .15); } }
    // 재 기둥: 아주 느리게 오르고 꼭대기가 옆으로 퍼진다
    const co = E.column || 0; colLive = co;
    if (co > .02) { colTop = vent.y + 16 + 9 * co; acc.c += dt * (8 + 8 * co);
      while (acc.c >= 1) { acc.c--; const th = Math.random() * 6.283, r = Math.random() * 1.1; puff(0, vent.x + Math.cos(th) * r, vent.y + .2, vent.z + Math.sin(th) * r, Math.cos(th) * .12, 1.9 + Math.random() * .9, Math.sin(th) * .12, 2.1, 8 + Math.random() * 4.5, 28 + Math.random() * 9, .97, colTop * (.82 + Math.random() * .22)); }
      acc.f += dt * 110 * co; while (acc.f >= 1) { acc.f--; const th = Math.random() * 6.283, sp = .3 + Math.random() * 1.5; spark(vent.x, vent.y + .1, vent.z, Math.cos(th) * sp, 1.0 + Math.random() * 2.2, Math.sin(th) * sp, 9, .07 + Math.random() * .1); }
      acc.bolt -= dt; if (acc.bolt <= 0) { acc.bolt = .35 + Math.random() * 1.3; let hi = vent.y + 6; for (let i = 0; i < K.n; i++) if (K.type[i] === 0 && K.p[i * 3 + 1] > hi) hi = K.p[i * 3 + 1]; const y = vent.y + 4 + Math.random() * Math.max(2, hi - vent.y - 5), sp = y > colTop * .7 ? 6 : 1.6; bolt(vent.x + (Math.random() - .5) * sp, y, vent.z + (Math.random() - .5) * sp, 5 + Math.random() * 7); } }
    // 용암이 바다에 닿는 자리의 김
    const B = T.box; acc.st = Math.min(2, acc.st + dt * 3.2);
    if (B.x1 >= B.x0) { const w = B.x1 - B.x0 + 1, h = B.y1 - B.y0 + 1, tries = Math.min(260, w * h); let found = 0;
      for (let q = 0; q < tries; q++) { steamI = (steamI + 7919) % (w * h); const x = B.x0 + steamI % w, y = B.y0 + ((steamI / w) | 0), i = y * N + x, m = T.melt[i];
        if (m > .5 && T.heat[i] > .2 && T.g[i] < T.sea + .5 && T.g[i] + m > T.sea - 26) { found++; if (acc.st >= 1 && Math.random() < .25) { acc.st--; const wx = (x - half) / toCell + (Math.random() - .5), wz = (y - half) / toCell + (Math.random() - .5); puff(1, wx, .12, wz, WINDV.x * .15, .45 + Math.random() * .4, WINDV.z * .15, .35, 1.3 + Math.random() * 1.3, 4.5 + Math.random() * 3, .36); if (Math.random() < .5) spark(wx, .05, wz, (Math.random() - .5) * .3, .3 + Math.random() * .5, (Math.random() - .5) * .3, 1.6, .07); } } }
    }
    // 바다 밑에서 뿜는 동안: 수면 위로 김과 물보라
    const boilWant = !above && E.mode !== 'rest' ? Math.min(1, .35 + (T.g[vi] + T.melt[vi] - T.sea + 60) / 60) : 0;
    U.uBoil.value.set(vent.x, vent.z, U.uBoil.value.z + (boilWant - U.uBoil.value.z) * Math.min(1, dt * 1.5));
    if (boilWant > 0) { acc.b = (acc.b || 0) + dt * (3 + 7 * boilWant);
      while (acc.b >= 1) { acc.b--; const th = Math.random() * 6.283, r = Math.random() * 1.6; puff(1, vent.x + Math.cos(th) * r, .1, vent.z + Math.sin(th) * r, WINDV.x * .12, .4 + Math.random() * .5, WINDV.z * .12, .3, 1.1 + Math.random() * 1.2, 3.5 + Math.random() * 3, .4);
        if (Math.random() < .5 * boilWant) for (let k = 0; k < 5; k++) spark(vent.x + Math.cos(th) * r * .5, .03, vent.z + Math.sin(th) * r * .5, (Math.random() - .5) * .25, .35 + Math.random() * .6, (Math.random() - .5) * .25, 1.4, .06); } }
    // 분출구의 빛
    const want = fo > .02 ? 1.6 + 2.4 * fo : co > .02 ? 2.5 + 2 * co : E.mode === 'flow' ? 1 : E.mode === 'dome' || E.mode === 'building' ? .6 : 0;
    glowL += (want - glowL) * Math.min(1, dt * 2.5); U.uVent.value.set(vent.x, vent.y + .6, vent.z, above ? glowL : glowL * .15);
    if (boltT > 0) { boltT -= dt; if (boltT <= 0) bGeo.setDrawRange(0, 0); }
    U.uFlash.value.w = boltT > 0 ? 1 : Math.max(0, U.uFlash.value.w - dt * 9);
    stepPuffs(dt); stepSparks(dt); stepProps(dt);
  }

  // ───────────── 눈: 비스듬히 내려다보는 한자리. 옆으로 끌면 섬 둘레를 돈다
  const cam = { az: opt.az ?? .0, el: .125, dist: 27, ty: 2.4, vel: 0, drift: .012, auto: true, land: 0, peak: 0, scan: 0, col: 0 };
  /** 눈을 조금씩 옮긴다(섬이 자라는 만큼 물러나고, 재 기둥이 서면 올려다본다) */
  function stepCam(dt) {
    cam.az += (cam.vel + cam.drift) * dt; cam.vel *= Math.exp(-dt * 2.2);
    if ((cam.scan -= dt) <= 0) { cam.scan = .4; let far = 0, pk = 0; const D = T.dep;                  // 섬이 얼마나 넓고 높은가
      for (let y = D.y0; y <= D.y1; y++) for (let x = D.x0; x <= D.x1; x++) { const h = T.g[y * N + x]; if (h > T.sea + 1) { const r = Math.hypot(x - T.vent.x, y - T.vent.y); if (r > far) far = r; if (h > pk) pk = h; } }
      cam.land = far / toCell; cam.peak = pk * HS; }
    let tall = 0; if (colLive > 0) for (let i = 0; i < K.n; i++) if (K.type[i] === 0 && K.a[i] > .9 && K.p[i * 3 + 1] > tall) tall = K.p[i * 3 + 1];   // 재 기둥의 키(가라앉으면 다시 다가간다)
    if (colLive > 0) tall = Math.max(tall, colTop * .8);
    cam.col += (Math.max(0, tall - cam.peak - 6) - cam.col) * Math.min(1, dt * (colLive > 0 ? 1.1 : .35));
    if (cam.auto) cam.dist += (Math.min(150, Math.max(27, 2.55 * cam.land + 3, 4.2 * cam.peak + 22) + cam.col * 2.3) - cam.dist) * Math.min(1, dt * (colLive > 0 ? .8 : .45));
    cam.ty += ((1.2 + cam.peak * .5 + cam.dist * .03 + cam.col * .40) - cam.ty) * Math.min(1, dt * .7);
  }
  function placeCamera() {
    const narrow = Math.max(1, 1.25 / camera.aspect);                    // 세로로 긴 화면에서는 물러나 섬이 다 들어오게
    const d = cam.dist * narrow, ce = Math.cos(cam.el);
    camera.position.set(Math.sin(cam.az) * d * ce, Math.sin(cam.el) * d + 1, Math.cos(cam.az) * d * ce);
    camera.lookAt(0, cam.ty + (narrow - 1) * 6, 0); camera.updateMatrixWorld();
    if (cam.look) { const [x, y, z, r] = cam.look; camera.position.set(x + Math.sin(cam.az) * r, y + r * .3, z + Math.cos(cam.az) * r); camera.lookAt(x, y, z); camera.updateMatrixWorld(); }   // 찍기용: 한 곳을 가까이
    sky.position.copy(camera.position);
  }

  // ───────────── 그리기
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(2, 2, HF));
  const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), .42, .5, .95);
  composer.addPass(new RenderPass(scene, camera)); composer.addPass(bloom); composer.addPass(new OutputPass());
  let rtRefl = null, W = 2, Hh = 2;
  function resize() {
    const cw = canvas.clientWidth || innerWidth, ch = canvas.clientHeight || innerHeight;
    const pr = Math.min(devicePixelRatio || 1, Q.maxH / ch, 2);
    W = Math.max(2, Math.round(cw * pr)); Hh = Math.max(2, Math.round(ch * pr));
    renderer.setPixelRatio(1); renderer.setSize(W, Hh, false);
    camera.aspect = mirror.aspect = cw / ch; camera.fov = mirror.fov = 38; camera.updateProjectionMatrix();
    if (rtRefl) rtRefl.dispose(); rtRefl = new THREE.WebGLRenderTarget(Math.max(2, Math.round(W * Q.refl)), Math.max(2, Math.round(Hh * Q.refl)), HF);
    composer.setSize(W, Hh); bloom.enabled = Q.bloom; U.uRes.value.set(W, Hh);
  }
  function applyQuality() {
    maxK = Q.puffs; maxS = Q.sparks;
    const seg = Math.round((N - 1) * Q.seg); if (seg !== SEG) { SEG = seg; land.geometry.dispose(); land.geometry = landGeo(); }
    landMat.defines.SHADOW = Q.shadow; if (qName === 'low') { delete landMat.defines.SMOOTH; delete seaMat.defines.SMOOTH; seaMat.needsUpdate = true; } landMat.needsUpdate = true;
    resize();
  }
  applyQuality(); addEventListener('resize', resize);
  function render(dt) {
    stepCam(dt || 0); placeCamera(); uploadPuffs(); uploadSparks();
    const px = Hh / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    // ① 물에 비칠 그림
    mirror.projectionMatrix.copy(camera.projectionMatrix); mirror.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    mirror.matrixWorld.multiplyMatrices(FLIP, camera.matrixWorld); mirror.matrixWorldInverse.copy(mirror.matrixWorld).invert();
    U.uRefl.value = 1; U.uPx.value = px * Q.refl; U.tRefl.value = null;
    renderer.setRenderTarget(rtRefl); renderer.clear(); renderer.render(scene, mirror);
    // ② 본 장면
    U.uRefl.value = 0; U.uPx.value = px; U.tRefl.value = rtRefl.texture; renderer.setRenderTarget(null);
    composer.render(dt);
  }
  // 화질을 스스로 내림(처음 몇 초)
  let fpsAcc = 0, fpsN = 0, tuned = !!qp.get('q');
  function tune(dt) { if (tuned) return; fpsAcc += dt; fpsN++;
    if (fpsAcc > 3) { const fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0;
      if (fps < 27 && qName !== 'low') { qName = qName === 'high' ? 'mid' : 'low'; Q = QUALITY[qName]; applyQuality(); try { localStorage.setItem('wonder_volcano_q', qName); } catch (e) {} }
      else tuned = true; } }
  function clearFx() { K.n = 0; P.n = 0; props.at = -1; props.k = 0; props.wait = 2; glowL = 0; bGeo.setDrawRange(0, 0); cam.land = cam.peak = cam.col = 0; cam.scan = 0; if (cam.auto) { cam.dist = 27; cam.ty = 2.4; } }

  sync();
  return { sync, stepFx, stepCam, render, tune, burst, clearFx, flashing: () => boltT > 0, cam, camera, get quality() { return qName; }, get counts() { return [K.n, P.n]; }, size: () => [W, Hh], vent, props };
}
