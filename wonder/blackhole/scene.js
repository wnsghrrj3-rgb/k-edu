/* 케이원더 · 장면 4 블랙홀 — 창밖 그림
 * 화면의 점 하나하나에서 빛을 거꾸로 쏘아, 블랙홀 둘레에서 휘는 길을 따라간다(슈바르츠실트 빛의 길).
 *   · 검은 원 안으로 들어가면 검정  · 원반(y=0 판)을 지날 때마다 원반 빛을 얹음(그래서 뒤쪽 원반이 위아래로 접혀 보인다)
 *   · 빠져나가면 그 방향의 별 하늘  · 던진 것(별·행성·우주선)도 같은 길 위에서 만나므로 블랙홀 뒤로 가면 휘어 보인다
 * 길이 1 = 검은 원 반지름. 블랙홀은 (0,0,0), 원반은 xz 판, 눈은 (D·cos e, D·sin e, 0).  논리(logic.js)의 (x, y) → 여기 (x, 0, −y).
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { DISK_IN, DISK_OUT } from './logic.js';

const QUALITY = { high: { steps: 120, k: .085, maxH: 900,  bloom: true },
                  mid:  { steps: 84,  k: .115, maxH: 660,  bloom: true },
                  low:  { steps: 56,  k: .16,  maxH: 450,  bloom: false } };
const NOBJ = 3, ELEV = THREE.MathUtils.degToRad(6.2), FOVY = 50, BH_UP = .19;   // BH_UP: 블랙홀을 화면 가운데보다 위(창 가운데)에 둠

const FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform vec3 uCam; uniform mat3 uBasis; uniform vec2 uTan; uniform float uTime, uSkyRot, uFlare, uShift;
uniform vec4 uHot; uniform sampler2D tSky; uniform vec4 uHid;
uniform int uObjN; uniform vec4 uObjA[${NOBJ}]; uniform vec4 uObjB[${NOBJ}]; uniform vec4 uObjC[${NOBJ}]; uniform vec4 uObjD[${NOBJ}];
const float PI = 3.14159265, R_IN = ${DISK_IN.toFixed(1)}, R_OUT = ${DISK_OUT.toFixed(1)};

float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*vn(p); p = p*2.03 + 7.1; a*=.5; } return s; }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

vec3 stars(vec3 d, float n, float thr, float tw){
  vec2 sp = vec2(atan(d.z,d.x), asin(clamp(d.y,-1.,1.)))*n; vec2 id = floor(sp), fr = fract(sp)-.5; float r = h21(id);
  vec2 off = (vec2(h21(id+3.1),h21(id+7.7))-.5)*.7; float m = smoothstep(.20,.0,length(fr-off));
  float b = smoothstep(thr,1.,r); b *= b; float t = h21(id+9.3);
  vec3 c = t < .2 ? vec3(1.,.72,.5) : t > .82 ? vec3(.65,.8,1.) : vec3(1.);
  return c * m * b * (tw + (1.-tw)*sin(uTime*(1.+r*3.)+r*40.));
}
vec3 sky(vec3 d){
  d.xz = rot(uSkyRot) * d.xz;
  vec2 uv = vec2(atan(d.z,d.x)/(2.*PI)+.5, asin(clamp(d.y,-1.,1.))/PI+.5);
  vec3 c = texture2D(tSky, uv).rgb; c = c*c*1.05;
  c += stars(d, 60., .955, .85)*2.6 + stars(d.zyx, 150., .975, .9)*1.1;
  return c;
}
vec3 hidden(vec3 d){                                             // 블랙홀 뒤의 밝은 별 하나(빛이 휘어 둘·고리로 보인다)
  if(uHid.w <= 0.) return vec3(0.);
  float c = dot(normalize(d), uHid.xyz); float a = acos(clamp(c,-1.,1.));
  return vec3(.75,.88,1.) * uHid.w * (exp(-a*a*26000.)*30. + exp(-a*a*2600.)*1.5);
}
vec3 heat(float t){                                              // 온도 → 빛깔(붉음 → 주황 → 흰 푸름)
  vec3 c = mix(vec3(1.,.16,.02), vec3(1.,.50,.14), smoothstep(.15,.45,t));
  c = mix(c, vec3(1.,.83,.60), smoothstep(.42,.75,t)); return mix(c, vec3(.82,.90,1.), smoothstep(.8,1.25,t));
}
vec4 disk(vec3 q, vec3 rd){
  float r = length(q.xz); if(r < R_IN*.92 || r > R_OUT) return vec4(0.);
  float phi = atan(q.z, q.x), om = 1.9*pow(r,-1.5);
  const float T = 16.; float t1 = mod(uTime, T), t2 = mod(uTime + T*.5, T), w = abs(t1/T*2.-1.);
  float n1 = fbm(rot(om*t1)*q.xz*.85 + 3.), n2 = fbm(rot(om*t2)*q.xz*.85 + 11.);
  float n = mix(n1, n2, w);
  float rings = .65 + .35*vn(vec2(r*5.5, 2.)) + .25*vn(vec2(r*17., 9.));
  float tt = pow(R_IN/r, .75);
  float v = sqrt(.5/r); vec3 vd = vec3(-sin(phi), 0., cos(phi))*v;         // 원반은 반시계로 돈다
  float dop = sqrt(1.-v*v)/(1. - dot(vd, -rd));                               // 다가오는 쪽이 더 밝고 푸르다
  float g = sqrt(max(1.-1./r, 0.));
  float hot = uHot.z * exp(-pow((r-uHot.y)/.9, 2.)) * exp(-pow(atan(sin(phi-uHot.x), cos(phi-uHot.x))/.55, 2.));
  float bright = pow(tt, 3.1) * (.22 + 1.5*n*n) * rings * pow(dop, 2.5) * g * (1. + uFlare*.8) + hot*2.5;
  float edge = smoothstep(R_IN*.92, R_IN*1.12, r) * smoothstep(R_OUT, R_OUT*.62, r);
  vec3 col = heat(tt*dop*g*1.2 + hot*.4) * bright * 2.5 * edge;
  float a = clamp((.5 + .75*n) * rings, 0., 1.) * edge * .93;
  return vec4(col, a);
}
float capsule(vec3 p, vec3 c, vec3 ax, float R, out vec3 nrm){
  float L2 = dot(ax,ax); float t = L2 > 1e-6 ? clamp(dot(p-c, ax)/L2, -1., 1.) : 0.; vec3 q = c + ax*t; vec3 dv = p - q; float d = length(dv); nrm = dv/max(d,1e-5); return d - R;
}
vec3 shade(int k, vec3 p, vec3 n, vec3 rd){
  float type = uObjB[k].w; vec3 base = uObjC[k].rgb; float fade = uObjC[k].w; vec3 c0 = uObjA[k].xyz;
  if(type < 1.5){ float mu = max(dot(n, -rd), 0.); float gran = .8 + .4*vn(n.xy*9. + n.z*5. + uTime*.3); return base * (1.2 + 2.6*mu) * gran * fade; }   // 별
  vec3 L = normalize(-c0 + vec3(0., .6, 0.)); float df = max(dot(n, L), 0.); float rim = pow(1.-max(dot(n,-rd),0.), 3.);
  float lr = length(c0); float lit = 26./(lr*lr + 6.);                         // 원반 빛은 가까울수록 세다
  if(type < 2.5){                                                              // 행성: 띠무늬와 얇은 대기
    float band = vn(vec2(n.y*5.5 + .6*vn(n.xz*4.), 1.)); vec3 alb = mix(base*.55, base*1.25, band) * (.75 + .5*vn(n.xz*7. + n.y*3.));
    return (alb * (df*lit*vec3(1.,.74,.48) + .012) + vec3(.35,.55,1.)*rim*.06*(df+.15)*lit) * fade + uObjD[k].rgb * (.4 + .6*rim);
  }
  float blink = step(.82, fract(uTime*1.3)) * step(.55, n.y);                   // 우주선·탐사선: 쇠붙이와 깜박이는 등
  return (base * (df*lit*vec3(1.,.78,.55)*1.3 + .03) + vec3(.2,.9,1.)*rim*.25 + vec3(1.,.2,.1)*blink*2.) * fade + uObjD[k].rgb;
}
void main(){
  vec2 ndc = vUv*2.-1.;
  vec3 rd = normalize(uBasis * vec3(ndc.x*uTan.x, ndc.y*uTan.y, -1.));
  vec3 p = uCam, v = rd; vec3 cr = cross(p, v); float h2 = dot(cr, cr), b = sqrt(h2);
  vec3 col = vec3(0.); float trans = 1.; bool dead = false;
  if(b > 17. && uObjN == 0){                                                   // 멀리 지나는 빛: 살짝만 휜다(계산을 아낀다)
    float al = 2./b + 2.945/(b*b); vec3 pc = p - v*dot(p,v); vec3 tb = -normalize(pc);
    float along = dot(-p, v); if(along < 0.) al *= .5*(1. + along/length(p));
    v = normalize(v*cos(al) + tb*sin(al));
  } else {
    for(int i=0;i<STEPS;i++){
      float r2 = dot(p,p), r = sqrt(r2);
      if(r < 1.005){ dead = true; break; }
      float dt = clamp((r - .82)*STEPK, .022, 4.);
      for(int k=0;k<${NOBJ};k++){ if(k >= uObjN) break; if(uObjB[k].w < .5) continue;
        vec3 n; float d = capsule(p, uObjA[k].xyz, uObjB[k].xyz, uObjA[k].w, n);
        if(d < .004){ col += trans * shade(k, p, n, normalize(v)); trans = 0.; break; }
        if(uObjB[k].w < 1.5){ float gl = uObjA[k].w/(d + uObjA[k].w*.6); col += trans * uObjC[k].rgb * uObjC[k].w * gl*gl*gl*gl * dt * .45 / max(uObjA[k].w, .15); }   // 별의 빛무리
        dt = min(dt, max(d*.85, .02));
      }
      if(trans < .01) break;
      vec3 acc = -1.5*h2*p/(r2*r2*r);
      v += acc*dt; vec3 np = p + v*dt;
      if(p.y*np.y < 0.){ float f = p.y/(p.y-np.y); vec4 dk = disk(mix(p,np,f), normalize(v)); col += trans*dk.rgb; trans *= 1.-dk.a; }
      p = np;
      if(r > 46. && dot(p,v) > 0.) break;
    }
  }
  if(!dead && trans > .01){ vec3 dir = normalize(v); col += trans * (sky(dir) + hidden(dir)); }
  // 붉어진 화면(가까이 갈수록) 대신: 검은 원 둘레의 아주 엷은 빛무리
  col = min(col, vec3(4.5));                                                  // 너무 센 빛이 검은 원 안까지 번지지 않게
  gl_FragColor = vec4(col, 1.);
}`;

export async function createBlackhole(canvas, opt = {}) {
  const qp = new URLSearchParams(location.search);
  let qName = qp.get('q') || 'high', Q = QUALITY[qName] || QUALITY.high;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!qp.get('shot') });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  const tSky = await new THREE.TextureLoader().loadAsync(new URL('./assets/sky.jpg', import.meta.url).href);
  tSky.wrapS = THREE.RepeatWrapping; tSky.minFilter = THREE.LinearFilter; tSky.generateMipmaps = false;

  const U = {
    uCam: { value: new THREE.Vector3() }, uBasis: { value: new THREE.Matrix3() }, uTan: { value: new THREE.Vector2() },
    uTime: { value: 0 }, uSkyRot: { value: 0 }, uFlare: { value: 0 }, uShift: { value: 0 }, uHot: { value: new THREE.Vector4(0, 5, 0, 0) },
    tSky: { value: tSky }, uHid: { value: new THREE.Vector4(0, 0, -1, 0) }, uObjN: { value: 0 },
    uObjA: { value: Array.from({ length: NOBJ }, () => new THREE.Vector4()) }, uObjB: { value: Array.from({ length: NOBJ }, () => new THREE.Vector4()) },
    uObjC: { value: Array.from({ length: NOBJ }, () => new THREE.Vector4()) }, uObjD: { value: Array.from({ length: NOBJ }, () => new THREE.Vector4()) },
  };
  const mk = () => new THREE.ShaderMaterial({ uniforms: U, defines: { STEPS: Q.steps, STEPK: Q.k.toFixed(3) }, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`, fragmentShader: FRAG });
  const quad = new FullScreenQuad(mk());
  class TracePass extends Pass { constructor() { super(); this.needsSwap = false; } render(r, w, read) { r.setRenderTarget(read); quad.render(r); } }
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType }));
  const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), .26, .3, 1.25);
  composer.addPass(new TracePass()); composer.addPass(bloom); composer.addPass(new OutputPass());

  // ── 눈(우주선)
  let dist = 20, W = 2, H = 2, tanY = Math.tan(THREE.MathUtils.degToRad(FOVY / 2)), focalPx = 1, bhPx = [0, 0];
  const cam = new THREE.Vector3(), fwd = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3();
  function placeCamera() {
    cam.set(dist * Math.cos(ELEV), dist * Math.sin(ELEV), 0);
    const toBH = cam.clone().multiplyScalar(-1).normalize(); right.set(0, 0, -1);
    const up0 = new THREE.Vector3().crossVectors(right, toBH).normalize();
    const pitch = Math.atan(BH_UP * tanY);                                        // 블랙홀이 화면 가운데보다 위에 오도록 눈을 살짝 숙임
    fwd.copy(toBH).multiplyScalar(Math.cos(pitch)).addScaledVector(up0, -Math.sin(pitch)).normalize();
    up.crossVectors(right, fwd).normalize();
    U.uCam.value.copy(cam); U.uBasis.value.set(right.x, up.x, -fwd.x, right.y, up.y, -fwd.y, right.z, up.z, -fwd.z);
  }
  function resize() {
    const cw = canvas.clientWidth || innerWidth, ch = canvas.clientHeight || innerHeight, a = cw / ch;
    const pr = Math.min(devicePixelRatio || 1, Q.maxH / ch, 2);
    W = Math.max(2, Math.round(cw * pr)); H = Math.max(2, Math.round(ch * pr));
    renderer.setPixelRatio(1); renderer.setSize(W, H, false); composer.setSize(W, H); bloom.enabled = Q.bloom;
    tanY = Math.tan(THREE.MathUtils.degToRad(FOVY / 2)) * (a > 16 / 9 ? (16 / 9) / a : 1);   // 조종석 그림(16:9, 가득 채움)과 같은 눈금
    U.uTan.value.set(tanY * a, tanY); focalPx = (ch / 2) / tanY; bhPx = [cw / 2, ch / 2 - BH_UP * ch / 2];
    placeCamera();
  }
  resize(); addEventListener('resize', resize);

  // ── 던진 것들
  const objs = [];                         // { kind, pos:Vector3, axis:Vector3, radius, color:[r,g,b], fade, glow:[r,g,b] }
  const TYPE = { star: 1, planet: 2, ship: 3, probe: 3 };
  function syncObjs() {
    const n = Math.min(objs.length, NOBJ); U.uObjN.value = n;
    for (let i = 0; i < NOBJ; i++) { const o = objs[i];
      if (!o || i >= n) { U.uObjB.value[i].set(0, 0, 0, 0); continue; }
      const near = THREE.MathUtils.smoothstep(o.pos.distanceTo(cam), 1.2, 6.5);     // 막 던졌을 때 눈앞에서 너무 크게 보이지 않게
      U.uObjA.value[i].set(o.pos.x, o.pos.y, o.pos.z, Math.max(.02, o.radius * near));
      U.uObjB.value[i].set(o.axis.x, o.axis.y, o.axis.z, TYPE[o.kind] || 3);
      U.uObjC.value[i].set(o.color[0], o.color[1], o.color[2], o.fade);
      const g = o.glow || [0, 0, 0]; U.uObjD.value[i].set(g[0], g[1], g[2], 0);
    }
  }

  let last = 0;
  function render(dt) { U.uTime.value += dt; U.uSkyRot.value += dt * .0085; U.uFlare.value *= Math.exp(-dt * .5); U.uHot.value.z *= Math.exp(-dt * .28);
    U.uHot.value.x += dt * 1.9 * Math.pow(Math.max(U.uHot.value.y, 3), -1.5); syncObjs(); composer.render(dt); }

  let acc = 0, nfr = 0, tuned = !!qp.get('q');
  function tune(dt) { if (tuned) return; acc += dt; nfr++;
    if (acc > 2.5) { const fps = nfr / acc; acc = 0; nfr = 0;
      if (fps < 26 && qName !== 'low') { qName = qName === 'high' ? 'mid' : 'low'; Q = QUALITY[qName]; quad.material.dispose(); quad.material = mk(); resize(); } else tuned = true; } }

  return {
    render, tune, objs, U,
    setDist(d) { dist = d; placeCamera(); }, get dist() { return dist; },
    /** 논리 좌표 (x, y) → 그림 좌표 */
    world: (x, y, out = new THREE.Vector3()) => out.set(x, 0, -y),
    flare(angle, r, amt = 1) { U.uFlare.value = Math.min(2.5, U.uFlare.value + amt); U.uHot.value.set(angle, r, 1.6 * amt, 0); },
    /** 블랙홀 뒤의 별: beta(블랙홀에서 비켜난 각), dir(화면에서의 방향), bright */
    hidden(beta, dir, bright) { if (!(bright > 0)) { U.uHid.value.w = 0; return; }
      const back = cam.clone().multiplyScalar(-1).normalize(), up0 = new THREE.Vector3().crossVectors(right, back).normalize();
      const d = back.clone().addScaledVector(right, Math.tan(beta) * Math.cos(dir)).addScaledVector(up0, Math.tan(beta) * Math.sin(dir)).normalize();
      const c = Math.cos(-U.uSkyRot.value * 0), s = 0; U.uHid.value.set(d.x * c - d.z * s, d.y, d.x * s + d.z * c, bright); },
    /** 화면의 한 점(css px) → 블랙홀 가운데에서 잰 각 [x, y](라디안, 오른쪽·위가 +) */
    tapAngle(px, py) { return [Math.atan((px - bhPx[0]) / focalPx), Math.atan((bhPx[1] - py) / focalPx)]; },
    get quality() { return qName; }, size: () => [W, H], bhPx: () => bhPx, focal: () => focalPx,
  };
}
