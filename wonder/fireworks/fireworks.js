/* 케이원더 · 장면 1 불꽃놀이 공장 — 그림
 * 한 프레임: ① 불꽃 층(F): 지난 프레임을 흐리게 남기고(꼬리) 그 위에 별을 더함
 *            ② 본 장면(S): 하늘·도시·다리·강·연기·둑.  강은 지난 프레임의 완성 그림(C)을 뒤집어 비춘다
 *            ③ 합침(C = S + F) → 빛 번짐 → 색 보정
 * 좌표: three (X 오른쪽 · Y 위 · Z 앞[−Z 가 멀어지는 쪽]) · 1 = 1m · 눈 = (0, 1.6, 0)
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildBurst, soundDelay } from './logic.js';

const QUALITY = { high: { scale: 1, maxH: 1080, bloom: true, stars: 14000, smoke: 150, taps: 4 },
                  mid:  { scale: 1, maxH: 810,  bloom: true, stars: 9000,  smoke: 100, taps: 3 },
                  low:  { scale: 1, maxH: 600,  bloom: false, stars: 5000, smoke: 60,  taps: 2 } };
const WIND = new THREE.Vector3(2.2, 0, -.6);

export async function createFireworks(canvas, opt = {}) {
  const qp = new URLSearchParams(location.search);
  let qName = qp.get('q') || opt.quality || 'high';
  let Q = QUALITY[qName] || QUALITY.high;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!qp.get('shot') });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.autoClear = false;
  const HF = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(56, 16 / 9, .3, 6000);
  camera.position.set(0, 1.6, 0); camera.rotation.set(THREE.MathUtils.degToRad(11), 0, 0);
  camera.updateMatrixWorld();
  const L_MAIN = 0, L_OCC = 1, L_STAR = 2;

  // ── 번쩍 빛(가장 최근 불꽃 넷): 연기·강·도시가 이 색으로 물든다
  const FL = 4, flashes = Array.from({ length: FL }, () => ({ pos: new THREE.Vector3(0, -999, 0), col: new THREE.Color(0, 0, 0), i: 0, t: 0, life: 1, peak: 0 }));
  const uFlashPos = flashes.map(f => f.pos), uFlashCol = flashes.map(() => new THREE.Color(0, 0, 0));
  const uTime = { value: 0 };

  // ── 하늘
  const sky = new THREE.Mesh(new THREE.SphereGeometry(5000, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uTime, uFlashCol: { value: uFlashCol }, uFlashPos: { value: uFlashPos } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_Position.z = gl_Position.w; }`,
    fragmentShader: `
      varying vec3 vDir; uniform float uTime; uniform vec3 uFlashCol[${FL}]; uniform vec3 uFlashPos[${FL}];
      float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }
      void main(){
        vec3 d = normalize(vDir); float e = max(d.y, 0.);
        vec3 zen = vec3(.004,.007,.020), mid = vec3(.010,.018,.045), hor = vec3(.075,.050,.040);
        vec3 c = mix(mid, zen, smoothstep(.0,.75,e));
        c = mix(hor, c, smoothstep(-.02,.22,e));                       // 도시 불빛이 물들인 지평선
        // 별
        vec2 sp = vec2(atan(d.z,d.x), asin(clamp(d.y,-1.,1.)))*vec2(190.,190.);
        vec2 id = floor(sp), fr = fract(sp)-.5; float r = h21(id);
        float star = smoothstep(.985,1.,r) * smoothstep(.22,.0,length(fr - (vec2(h21(id+3.1),h21(id+7.7))-.5)*.6));
        star *= .55 + .45*sin(uTime*(1.5+r*4.) + r*60.);
        c += vec3(.9,.95,1.) * star * smoothstep(.04,.3,e) * (.25 + .9*h21(id+1.7));
        // 엷은 구름(불꽃 빛을 받는다)
        float cl = smoothstep(.52,.86, fbm(d.xz/(d.y+.28)*1.55 + vec2(uTime*.004, 0.))) * smoothstep(.02,.22,e) * (1.-smoothstep(.55,.9,e));
        vec3 lit = vec3(0.);
        for(int i=0;i<${FL};i++){ vec3 fd = normalize(uFlashPos[i]); lit += uFlashCol[i] * pow(max(dot(d, fd),0.), 5.); }
        c += cl * (vec3(.012,.011,.014) + lit*.03);
        c += lit * .0035;                                                // 하늘 전체가 살짝 밝아짐
        gl_FragColor = vec4(c, 1.);
      }` }));
  sky.frustumCulled = false; scene.add(sky);

  // ── 블렌더 강변
  const gltf = await new GLTFLoader().loadAsync(new URL('./assets/riverside.glb', import.meta.url).href);
  const world = gltf.scene; scene.add(world);
  const launch = [], lampPts = [];
  const cityMats = [];
  world.traverse(o => {
    if (o.name.startsWith('launch_')) launch.push(o.getWorldPosition(new THREE.Vector3()));
    if (o.name.startsWith('lamp_point')) lampPts.push(o.getWorldPosition(new THREE.Vector3()));
    if (!o.isMesh) return;
    o.frustumCulled = false;
    const n = o.name;
    if (/^(quay|railing|lamp_post|lamp_head)/.test(n)) o.layers.enable(L_OCC);          // 불꽃을 가리는 가까운 것
    if (n === 'city') { o.material.emissiveIntensity = 2.0; cityMats.push(o.material); }
    const mn = o.material.name || '';
    if (mn === 'light_cool') o.material.emissiveIntensity = 4.5; else if (mn === 'light_warm') o.material.emissiveIntensity = 7; else if (mn === 'light_red') o.material.emissiveIntensity = 3.0;
    else if (mn.startsWith('sign_')) o.material.emissiveIntensity = 1.6; else if (mn === 'lamp_glass') o.material.emissiveIntensity = 6;
    if (/^(city|far_bank|hills|bridge|barge)/.test(n)) { o.material.fog = false; }
  });
  launch.sort((a, b) => a.x - b.x);
  if (!launch.length) for (let i = 0; i < 5; i++) launch.push(new THREE.Vector3(-12 + i * 4.2, 3.8, -400));
  const hemi = new THREE.HemisphereLight(0x223355, 0x110c08, .35); scene.add(hemi);
  const flashLight = new THREE.DirectionalLight(0xffffff, 0); flashLight.position.set(0, 200, -400); scene.add(flashLight);
  for (const p of lampPts) { const l = new THREE.PointLight(0xffc98a, 46, 26, 1.8); l.position.copy(p); scene.add(l); }

  // ── 강
  const uPrev = { value: null }, uProjView = { value: new THREE.Matrix4() };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(9000, 3200).rotateX(-Math.PI / 2).translate(0, 0, -1606.6), new THREE.ShaderMaterial({
    uniforms: { tPrev: uPrev, uProjView, uCam: { value: camera.position }, uTime, uFlashCol: { value: uFlashCol }, uFlashPos: { value: uFlashPos } },
    defines: { TAPS: Q.taps },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      varying vec3 vW; uniform sampler2D tPrev; uniform mat4 uProjView; uniform vec3 uCam; uniform float uTime;
      uniform vec3 uFlashCol[${FL}]; uniform vec3 uFlashPos[${FL}];
      float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
      // 잔물결: 화면에서 보이는 크기가 고르도록 「방향·거리의 로그」 좌표에서 만든다(눈이 한자리에 있으니 가능)
      vec2 ripple(vec2 q, float t){
        vec2 a = q*vec2(1.0, 1.0) + vec2(t*.22, -t*.55), b = q*vec2(.37,.43) + vec2(-t*.10, -t*.21);
        float e = .22;
        vec2 g = vec2(vn(a+vec2(e,0.))-vn(a-vec2(e,0.)), vn(a+vec2(0.,e))-vn(a-vec2(0.,e)));
        g += 1.3*vec2(vn(b+vec2(e,0.))-vn(b-vec2(e,0.)), vn(b+vec2(0.,e))-vn(b-vec2(0.,e)));
        return g;
      }
      vec3 look(vec3 R){ vec4 cp = uProjView * vec4(uCam + R*3000., 1.); vec2 uv = cp.xy/cp.w*.5+.5; uv = clamp(uv, vec2(.002), vec2(.998)); return texture2D(tPrev, uv).rgb; }
      void main(){
        vec3 V = normalize(vW - uCam); float dist = length(vW.xz - uCam.xz);
        vec2 q = vec2(atan(vW.x, -vW.z)*70., log(dist)*26.);
        vec2 g = ripple(q, uTime);
        float near = smoothstep(500., 12., dist);
        vec3 R = vec3(V.x, -V.y, V.z);
        vec3 acc = vec3(0.); float wsum = 0.;
        for(int i=0;i<TAPS;i++){                                           // tPrev 는 이미 위아래로 번진 그림 — 여기서는 물결만큼만 흔든다
          float k = float(i)/float(TAPS-1);
          float lift = (abs(g.y)*.020 + k*.030) * (.4 + near*.8);
          vec3 Ri = normalize(R + vec3(g.x*.006*(.5+near) + (k-.5)*.004, lift, 0.));
          Ri.y = max(Ri.y, .003);
          float w = 1. - k*.5; acc += look(Ri)*w; wsum += w;
        }
        acc /= wsum;
        float fres = mix(.50, .97, pow(1. - clamp(-V.y, 0., 1.), 5.));
        vec3 deep = vec3(.003,.0055,.010);
        float shade = .78 + .22*smoothstep(-.6,.6,g.y);                   // 물결의 어두운 골
        vec3 c = deep + acc * fres * shade;
        gl_FragColor = vec4(c, 1.);
      }` }));
  water.frustumCulled = false; scene.add(water);

  // ── 별(불꽃 알갱이): CPU 에서 움직이고 점으로 그린다
  const MAXS = Q.stars;
  const P = { n: 0, px: new Float32Array(MAXS), py: new Float32Array(MAXS), pz: new Float32Array(MAXS), vx: new Float32Array(MAXS), vy: new Float32Array(MAXS), vz: new Float32Array(MAXS),
    r: new Float32Array(MAXS), g: new Float32Array(MAXS), b: new Float32Array(MAXS), r2: new Float32Array(MAXS), g2: new Float32Array(MAXS), b2: new Float32Array(MAXS),
    age: new Float32Array(MAXS), life: new Float32Array(MAXS), size: new Float32Array(MAXS), drag: new Float32Array(MAXS), grav: new Float32Array(MAXS), flag: new Uint8Array(MAXS), seed: new Float32Array(MAXS), lum: new Float32Array(MAXS) };
  const F_GLIT = 1, F_TAIL = 2, F_EMBER = 4, F_COMET = 8, F_FLASH = 16;
  const sGeo = new THREE.BufferGeometry();
  const aPos = new THREE.BufferAttribute(new Float32Array(MAXS * 3), 3), aCol = new THREE.BufferAttribute(new Float32Array(MAXS * 3), 3), aSize = new THREE.BufferAttribute(new Float32Array(MAXS), 1);
  for (const a of [aPos, aCol, aSize]) a.setUsage(THREE.DynamicDrawUsage);
  sGeo.setAttribute('position', aPos); sGeo.setAttribute('color', aCol); sGeo.setAttribute('aSize', aSize);
  const uPx = { value: 1 };
  const stars = new THREE.Points(sGeo, new THREE.ShaderMaterial({
    uniforms: { uPx }, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, transparent: true,
    vertexShader: `attribute float aSize; attribute vec3 color; varying vec3 vC; uniform float uPx;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mv;
        float s = aSize * uPx / max(-mv.z, 1.); float k = max(s, 1.6); vC = color * (s*s)/(k*k); gl_PointSize = k; }`,
    fragmentShader: `varying vec3 vC; void main(){ vec2 d = gl_PointCoord - .5; float r2 = dot(d,d)*4.; float a = exp(-r2*3.2) - .04; if(a <= 0.) discard; gl_FragColor = vec4(vC * a, 1.); }` }));
  stars.frustumCulled = false; stars.layers.set(L_STAR); scene.add(stars);

  function spawn(x, y, z, vx, vy, vz, c, c2, life, size, drag, grav, flag) {
    if (P.n >= MAXS) { if (flag & (F_EMBER)) return -1; // 꽉 차면 잔불부터 버린다
      let j = -1; for (let k = 0; k < 24; k++) { const q = (Math.random() * P.n) | 0; if (P.flag[q] & F_EMBER) { j = q; break; } } if (j < 0) return -1; P.n--; copy(P.n, j); }
    const i = P.n++;
    P.px[i] = x; P.py[i] = y; P.pz[i] = z; P.vx[i] = vx; P.vy[i] = vy; P.vz[i] = vz;
    P.r[i] = c[0]; P.g[i] = c[1]; P.b[i] = c[2]; const e = c2 || c; P.r2[i] = e[0]; P.g2[i] = e[1]; P.b2[i] = e[2];
    P.age[i] = 0; P.life[i] = life; P.size[i] = size; P.drag[i] = drag; P.grav[i] = grav; P.flag[i] = flag; P.seed[i] = Math.random(); P.lum[i] = 1;
    return i;
  }
  function copy(from, to) { if (from === to) return; for (const k of ['px', 'py', 'pz', 'vx', 'vy', 'vz', 'r', 'g', 'b', 'r2', 'g2', 'b2', 'age', 'life', 'size', 'drag', 'grav', 'flag', 'seed', 'lum']) P[k][to] = P[k][from]; }

  // ── 연기
  const MAXK = Q.smoke; const K = { n: 0, p: new Float32Array(MAXK * 3), v: new Float32Array(MAXK * 3), age: new Float32Array(MAXK), life: new Float32Array(MAXK), size: new Float32Array(MAXK), seed: new Float32Array(MAXK) };
  const kGeo = new THREE.BufferGeometry();
  const kPos = new THREE.BufferAttribute(new Float32Array(MAXK * 3), 3), kDat = new THREE.BufferAttribute(new Float32Array(MAXK * 3), 3);
  kPos.setUsage(THREE.DynamicDrawUsage); kDat.setUsage(THREE.DynamicDrawUsage); kGeo.setAttribute('position', kPos); kGeo.setAttribute('aDat', kDat);
  const smoke = new THREE.Points(kGeo, new THREE.ShaderMaterial({
    uniforms: { uPx, uFlashCol: { value: uFlashCol }, uFlashPos: { value: uFlashPos }, uTime }, transparent: true, depthWrite: false,
    vertexShader: `attribute vec3 aDat; varying vec3 vDat; varying vec3 vW; uniform float uPx;
      void main(){ vDat = aDat; vW = position; vec4 mv = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mv; gl_PointSize = min(aDat.x * uPx / max(-mv.z,1.), 900.); }`,
    fragmentShader: `varying vec3 vDat; varying vec3 vW; uniform vec3 uFlashCol[${FL}]; uniform vec3 uFlashPos[${FL}]; uniform float uTime;
      float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
      void main(){ vec2 d = gl_PointCoord - .5; float r = length(d)*2.;
        float n = vn(d*3.2 + vDat.z*37.) * .6 + vn(d*7.1 - vDat.z*11.) * .4;
        float a = smoothstep(1., .15, r + (n-.5)*.75) * vDat.y; if(a < .003) discard;
        vec3 lit = vec3(0.); for(int i=0;i<${FL};i++){ float dd = distance(vW, uFlashPos[i]); lit += uFlashCol[i] / (1. + dd*dd/(90.*90.)); }
        vec3 c = vec3(.014,.016,.024) + lit * .11 * (.5 + n*.7);
        gl_FragColor = vec4(c, a); }` }));
  smoke.frustumCulled = false; smoke.renderOrder = 5; scene.add(smoke);
  function puff(x, y, z, size, life) { if (K.n >= MAXK) { let o = 0; for (let i = 1; i < K.n; i++) if (K.age[i] / K.life[i] > K.age[o] / K.life[o]) o = i; kill(o); }
    const i = K.n++; K.p.set([x, y, z], i * 3); K.v.set([(Math.random() - .5) * 3, 1.5 + Math.random() * 2, (Math.random() - .5) * 3], i * 3); K.age[i] = 0; K.life[i] = life; K.size[i] = size; K.seed[i] = Math.random(); }
  function kill(i) { K.n--; if (i !== K.n) { for (let k = 0; k < 3; k++) { K.p[i * 3 + k] = K.p[K.n * 3 + k]; K.v[i * 3 + k] = K.v[K.n * 3 + k]; } K.age[i] = K.age[K.n]; K.life[i] = K.life[K.n]; K.size[i] = K.size[K.n]; K.seed[i] = K.seed[K.n]; } }

  // ── 쏘기
  const shells = [];           // 올라가는 중인 것
  const events = { onBurst: null, onLaunch: null, onBoom: null, onDud: null };
  let tubeNext = 0;
  function fire(shell, tube) {
    const spec = buildBurst(shell);
    const ti = tube ?? (tubeNext++ % launch.length), from = launch[ti].clone();
    const to = new THREE.Vector3(from.x + (Math.random() - .5) * 46 + (ti - 2) * 12, spec.apex + (Math.random() - .5) * 16, from.z + (Math.random() - .5) * 40);
    shells.push({ spec, shell, from, to, t: 0, T: spec.rise, wob: Math.random() * 6.28 });
    // 통에서 나오는 불빛과 연기
    for (let i = 0; i < 14; i++) spawn(from.x, from.y, from.z, (Math.random() - .5) * 5, 8 + Math.random() * 14, (Math.random() - .5) * 5, [1, .7, .3], [1, .25, .05], .35 + Math.random() * .3, 1.1, 2.5, 1, F_EMBER);
    puff(from.x, from.y + 2, from.z, 9, 6);
    events.onLaunch && events.onLaunch({ dist: from.distanceTo(camera.position), spec });
    return spec;
  }
  function addFlash(pos, col, peak, life) { let f = flashes[0]; for (const q of flashes) if (q.i < f.i) f = q; f.pos.copy(pos); f.col.setRGB(col[0], col[1], col[2]); f.peak = peak; f.t = 0; f.life = life; f.i = peak; }
  function burst(s) {
    const { spec, to } = s;
    if (spec.dud) {                                        // 불발: 꺼진 채 떨어져 풍덩
      s.fall = { v: new THREE.Vector3(WIND.x, 0, 0) }; events.onDud && events.onDud(); return; }
    let cr = 0, cg = 0, cb = 0;
    for (const st of spec.stars) {
      const d = st.dir, sp = st.speed;
      let fl = 0; if (st.glitter) fl |= F_GLIT; if (st.tail) fl |= F_TAIL;
      const i = spawn(to.x, to.y, to.z, d[0] * sp, d[1] * sp, d[2] * sp, st.color, st.color2, st.life, st.size, st.drag, st.grav, fl);
      if (i < 0) break; cr += st.color[0]; cg += st.color[1]; cb += st.color[2];
    }
    const n = spec.stars.length || 1, col = [cr / n, cg / n, cb / n];
    spawn(to.x, to.y, to.z, 0, 0, 0, [1, .96, .9], col, .13, 30, 0, 0, F_FLASH);        // 터지는 순간의 흰 번쩍
    addFlash(to, col, 7.5 * (spec.size === 'l' ? 1.5 : spec.size === 's' ? .7 : 1), SIZE_LIFE[spec.size] || 2.4);
    const R = spec.size === 'l' ? 70 : spec.size === 's' ? 34 : 50;
    for (let i = 0; i < (spec.size === 'l' ? 9 : 6); i++) { const a = Math.random() * 6.28, b = Math.acos(2 * Math.random() - 1), r = R * (.25 + Math.random() * .6);
      puff(to.x + Math.sin(b) * Math.cos(a) * r, to.y + Math.cos(b) * r, to.z + Math.sin(b) * Math.sin(a) * r, R * (1.1 + Math.random() * .9), 11 + Math.random() * 7); }
    const dist = to.distanceTo(camera.position);
    events.onBurst && events.onBurst({ spec, shell: s.shell, pos: to, dist, delay: soundDelay(dist) });
  }
  const SIZE_LIFE = { s: 1.9, m: 2.4, l: 3.0 };

  // ── 한 걸음(시간 dt)
  const tmpC = new THREE.Color();
  function step(dt) {
    uTime.value += dt;
    // 올라가는 껍질
    for (let i = shells.length - 1; i >= 0; i--) { const s = shells[i];
      if (s.fall) { s.fall.v.y -= 9.8 * dt; s.to.addScaledVector(s.fall.v, dt);
        if (s.to.y <= 0) { for (let k = 0; k < 10; k++) spawn(s.to.x, .3, s.to.z, (Math.random() - .5) * 8, 4 + Math.random() * 9, (Math.random() - .5) * 8, [.5, .6, .7], [.1, .12, .15], .5, 1.2, 1.5, 1, F_EMBER); events.onSplash && events.onSplash(); shells.splice(i, 1); }
        continue; }
      s.t += dt; const u = Math.min(1, s.t / s.T), e = 1 - (1 - u) * (1 - u);
      const x = s.from.x + (s.to.x - s.from.x) * u + Math.sin(s.wob + u * 9) * 1.2 * u, y = s.from.y + (s.to.y - s.from.y) * e, z = s.from.z + (s.to.z - s.from.z) * u;
      const vy = (s.to.y - s.from.y) * 2 * (1 - u) / s.T;
      if (!s.spec.dud || u < .96) {
        spawn(x, y, z, 0, vy, 0, [1.1, .82, .5], [1, .5, .2], .05, 2.1, 0, 0, F_COMET);
        const ne = Math.max(1, Math.round(dt * 90));
        for (let k = 0; k < ne; k++) spawn(x + (Math.random() - .5) * .8, y - Math.random() * vy * dt, z + (Math.random() - .5) * .8, (Math.random() - .5) * 2.4, -1 - Math.random() * 3, (Math.random() - .5) * 2.4, [1, .62, .25], [.6, .12, .02], .35 + Math.random() * .5, .95, 1.2, .5, F_EMBER);
      }
      if (u >= 1) { burst(s); if (!s.fall) shells.splice(i, 1); }
    }
    // 별
    const g = 9.8;
    for (let i = P.n - 1; i >= 0; i--) {
      const age = (P.age[i] += dt), life = P.life[i];
      if (age >= life) { P.n--; copy(P.n, i); continue; }
      const fl = P.flag[i], u = age / life;
      const dk = Math.exp(-P.drag[i] * dt);
      P.vx[i] = P.vx[i] * dk + WIND.x * (1 - dk) * .5; P.vy[i] = P.vy[i] * dk - g * P.grav[i] * dt; P.vz[i] *= dk;
      P.px[i] += P.vx[i] * dt; P.py[i] += P.vy[i] * dt; P.pz[i] += P.vz[i] * dt;
      if (P.py[i] < .2) { P.age[i] = life; continue; }
      let lum = 1 - u * u * u;                                                // 끝에서 사그라짐
      if (fl & F_FLASH) lum = (1 - u) * (1 - u);
      if (fl & F_GLIT) { const tw = Math.sin((age * (22 + P.seed[i] * 30) + P.seed[i] * 60)); lum *= u > .35 ? (tw > .55 ? 2.6 : .12) : 1; }
      P.lum[i] = lum;
      if ((fl & F_TAIL) && Math.random() < dt * 34) spawn(P.px[i], P.py[i], P.pz[i], P.vx[i] * .08, P.vy[i] * .08 - .6, P.vz[i] * .08, [P.r2[i] * .8, P.g2[i] * .62, P.b2[i] * .5], [.5, .12, .02], .55 + Math.random() * .9, P.size[i] * .62, .6, .16, F_EMBER);
      if ((fl & F_GLIT) && u > .5 && Math.random() < dt * 5) spawn(P.px[i], P.py[i], P.pz[i], (Math.random() - .5) * 6, (Math.random() - .5) * 6, (Math.random() - .5) * 6, [1.6, 1.5, 1.3], [1, .8, .5], .1 + Math.random() * .12, P.size[i] * 1.1, 3, .3, F_EMBER);
    }
    // 연기
    for (let i = K.n - 1; i >= 0; i--) { K.age[i] += dt; if (K.age[i] >= K.life[i]) { kill(i); continue; }
      const k = Math.exp(-.5 * dt); for (let a = 0; a < 3; a++) { K.v[i * 3 + a] *= k; K.p[i * 3 + a] += (K.v[i * 3 + a] + WIND.getComponent(a)) * dt; } }
    // 번쩍 빛
    let best = null;
    flashes.forEach((f, i) => { f.t += dt; const u = f.t / f.life;
      f.i = u >= 1 ? 0 : f.peak * (Math.exp(-f.t * 9) * 1.0 + .22 * (1 - u) * (1 - u));
      uFlashCol[i].copy(f.col).multiplyScalar(f.i); if (!best || f.i > best.i) best = f; });
    if (best) { flashLight.position.copy(best.pos); flashLight.color.copy(best.col).lerp(tmpC.set(0xffffff), .25); flashLight.intensity = best.i * .10; hemi.intensity = .35 + best.i * .025; }
  }

  function upload() {
    const pa = aPos.array, ca = aCol.array, sa = aSize.array;
    for (let i = 0; i < P.n; i++) { const u = P.age[i] / P.life[i], w = Math.min(1, u * 1.6), L = P.lum[i] * 1.55;
      pa[i * 3] = P.px[i]; pa[i * 3 + 1] = P.py[i]; pa[i * 3 + 2] = P.pz[i];
      ca[i * 3] = (P.r[i] + (P.r2[i] - P.r[i]) * w) * L; ca[i * 3 + 1] = (P.g[i] + (P.g2[i] - P.g[i]) * w) * L; ca[i * 3 + 2] = (P.b[i] + (P.b2[i] - P.b[i]) * w) * L;
      sa[i] = P.size[i]; }
    sGeo.setDrawRange(0, P.n); aPos.needsUpdate = aCol.needsUpdate = aSize.needsUpdate = true;
    const kp = kPos.array, kd = kDat.array;
    for (let i = 0; i < K.n; i++) { const u = K.age[i] / K.life[i]; kp.set(K.p.subarray(i * 3, i * 3 + 3), i * 3);
      kd[i * 3] = K.size[i] * (.55 + u * 1.3); kd[i * 3 + 1] = Math.min(1, u * 10) * (1 - u) * (1 - u) * .26; kd[i * 3 + 2] = K.seed[i]; }
    kGeo.setDrawRange(0, K.n); kPos.needsUpdate = kDat.needsUpdate = true;
  }

  // ── 그리는 길
  let rtF = [null, null], rtC = [null, null], rtS = null, fi = 0, W = 2, H = 2;
  const fadeQ = new FullScreenQuad(new THREE.ShaderMaterial({ uniforms: { t: { value: null }, k: { value: .85 } }, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform sampler2D t; uniform float k; void main(){ vec3 c = texture2D(t, vUv).rgb * k; c = max(c - .0012, 0.); gl_FragColor = vec4(c,1.); }` }));
  const addQ = new FullScreenQuad(new THREE.ShaderMaterial({ uniforms: { a: { value: null }, b: { value: null } }, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform sampler2D a; uniform sampler2D b; void main(){ gl_FragColor = vec4(texture2D(a,vUv).rgb + texture2D(b,vUv).rgb, 1.); }` }));
  const blurQ = new FullScreenQuad(new THREE.ShaderMaterial({ uniforms: { t: { value: null } }, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform sampler2D t;
      void main(){ vec3 c = vec3(0.); float ws = 0.;
        for(int i=-7;i<=7;i++){ float k = float(i)/7.; float w = exp(-k*k*2.2); c += texture2D(t, vec2(vUv.x, clamp(vUv.y + k*.075, 0., 1.))).rgb * w; ws += w; }
        gl_FragColor = vec4(c/ws, 1.); }` }));
  let rtR = null;
  const depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false });
  let frameDt = 1 / 60;
  class WonderPass extends Pass {
    constructor() { super(); this.needsSwap = false; }
    render(r, writeBuffer, readBuffer) {
      const cur = fi, prev = 1 - fi;
      // ① 불꽃 층
      r.setRenderTarget(rtF[cur]); r.setClearColor(0x000000, 1); r.clear(true, true, false);
      fadeQ.material.uniforms.t.value = rtF[prev].texture; fadeQ.material.uniforms.k.value = Math.pow(.80, frameDt * 60); fadeQ.render(r);
      r.clear(false, true, false);
      camera.layers.set(L_OCC); scene.overrideMaterial = depthOnly; const bg = scene.background; r.render(scene, camera); scene.overrideMaterial = null;
      camera.layers.set(L_STAR); r.render(scene, camera);
      // ② 본 장면
      camera.layers.set(L_MAIN); uPrev.value = rtR.texture;
      r.setRenderTarget(rtS); r.clear(true, true, false); r.render(scene, camera);
      // ③ 합침
      addQ.material.uniforms.a.value = rtS.texture; addQ.material.uniforms.b.value = rtF[cur].texture;
      r.setRenderTarget(rtC[cur]); addQ.render(r);
      r.setRenderTarget(readBuffer); addQ.render(r);
      blurQ.material.uniforms.t.value = rtC[cur].texture; r.setRenderTarget(rtR); blurQ.render(r);
      fi = prev;
    }
  }
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(2, 2, HF));
  const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), .5, .5, .92);
  composer.addPass(new WonderPass()); composer.addPass(bloom); composer.addPass(new OutputPass());

  function resize() {
    const cw = canvas.clientWidth || innerWidth, ch = canvas.clientHeight || innerHeight;
    const pr = Math.min(devicePixelRatio || 1, Q.maxH / ch, 2) * Q.scale;
    W = Math.max(2, Math.round(cw * pr)); H = Math.max(2, Math.round(ch * pr));
    renderer.setPixelRatio(1); renderer.setSize(W, H, false);
    camera.aspect = cw / ch;
    // 세로로 긴 화면에서는 화각을 넓혀 불꽃이 다 들어오게
    camera.fov = camera.aspect < 1.2 ? 74 : camera.aspect < 1.5 ? 62 : 56; camera.updateProjectionMatrix();
    for (const t of [...rtF, ...rtC, rtS, rtR]) t && t.dispose();
    rtF = [new THREE.WebGLRenderTarget(W, H, HF), new THREE.WebGLRenderTarget(W, H, HF)];
    rtC = [new THREE.WebGLRenderTarget(W, H, { ...HF, depthBuffer: false }), new THREE.WebGLRenderTarget(W, H, { ...HF, depthBuffer: false })];
    rtS = new THREE.WebGLRenderTarget(W, H, HF);
    rtR = new THREE.WebGLRenderTarget(Math.max(2, W >> 1), Math.max(2, H >> 2), { ...HF, depthBuffer: false });
    composer.setSize(W, H); bloom.enabled = Q.bloom;
    uPx.value = H / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    uProjView.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  }
  resize(); addEventListener('resize', resize);

  function render(dt) { frameDt = dt; upload(); composer.render(dt); }

  // ── 화질을 스스로 내림(처음 몇 초)
  let fpsAcc = 0, fpsN = 0, tuned = !!qp.get('q');
  function tune(dt) { if (tuned) return; fpsAcc += dt; fpsN++;
    if (fpsAcc > 3) { const fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0;
      if (fps < 27 && qName !== 'low') { qName = qName === 'high' ? 'mid' : 'low'; Q = { ...QUALITY[qName], stars: MAXS, smoke: MAXK }; water.material.defines.TAPS = Q.taps; water.material.needsUpdate = true; resize(); }
      else tuned = true; } }

  return { fire, step, render, tune, events, camera, launch, get count() { return P.n; }, get quality() { return qName; }, get busy() { return shells.length; }, size: () => [W, H] };
}
