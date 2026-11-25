// K-MOTION 거꾸로 나라 · 3D 세계
// 하나의 렌더러 위에서 지역(테마)을 바꿔 끼운다: 시작(떠 있는 섬·뒤집힌 마을) · 거울의 방 · 중력의 숲 · 달리기 마을 · 크기 연구소 · 마법사의 성.
// 모든 모양은 코드로 짓는다(외부 유료 자산·API 없음). 여러 깊이의 층 + 카메라 흔들림 = 패럴랙스, 위로 오르는 반짝이·폭포 = 거꾸로 세계.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { starGeo } from './hero.js';

const rnd = (a, b) => a + Math.random() * (b - a);
let seed = 7; const srnd = (a, b) => { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

// ───────── 캔버스 질감
function canvasTex(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
export const TEX = {};
function makeTextures(){
  TEX.dot = canvasTex(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  TEX.spark = canvasTex(64, 64, (g) => { g.translate(32, 32); const r = g.createRadialGradient(0, 0, 0, 0, 0, 30); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.2, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); g.arc(0, 0, 30, 0, 7); g.fill();
    g.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(-3, 0); g.lineTo(0, -31); g.lineTo(3, 0); g.fill(); } });
  TEX.cloud = canvasTex(256, 128, (g) => { for (let i = 0; i < 14; i++) { const x = 40 + Math.random() * 176, y = 60 + Math.random() * 30, r = 22 + Math.random() * 30; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.6, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
  TEX.rune = canvasTex(512, 512, (g, w) => { g.translate(256, 256); g.strokeStyle = 'rgba(190,230,255,.95)'; g.lineWidth = 6; [240, 200, 120].forEach(r => { g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); });
    g.font = 'bold 34px serif'; g.fillStyle = 'rgba(200,240,255,.95)'; g.textAlign = 'center'; const sy = '☾✦◇☽✧△▽✶◈☆'; for (let i = 0; i < 20; i++) { g.save(); g.rotate(i / 20 * Math.PI * 2); g.fillText(sy[i % sy.length], 0, -212); g.restore(); }
    g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI * 2 * 2 + Math.PI / 2; const x = Math.cos(a) * 120, y = Math.sin(a) * 120; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); });
  TEX.tile = canvasTex(256, 256, (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#e9f1ff' : '#cfdcf7'; g.fillRect(x * 64, y * 64, 64, 64); } g.strokeStyle = 'rgba(120,140,190,.35)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); } });
  TEX.tile.wrapS = TEX.tile.wrapT = THREE.RepeatWrapping;
  TEX.road = canvasTex(256, 256, (g) => { g.fillStyle = '#5b5f73'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .06})`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } g.fillStyle = '#ffe28a'; g.fillRect(0, 122, 110, 12); });
  TEX.road.wrapS = TEX.road.wrapT = THREE.RepeatWrapping;
  TEX.grass = canvasTex(256, 256, (g) => { g.fillStyle = '#6fcf6a'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(40,140,60,.35)' : 'rgba(190,255,150,.3)'; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 4 + Math.random() * 4); } });
  TEX.grass.wrapS = TEX.grass.wrapT = THREE.RepeatWrapping;
  TEX.brick = canvasTex(256, 256, (g) => { g.fillStyle = '#b7a3d9'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(70,50,120,.35)'; g.lineWidth = 3; for (let y = 0; y < 8; y++) { g.beginPath(); g.moveTo(0, y * 32); g.lineTo(256, y * 32); g.stroke(); for (let x = 0; x < 5; x++) { const xx = x * 64 + (y % 2) * 32; g.beginPath(); g.moveTo(xx, y * 32); g.lineTo(xx, y * 32 + 32); g.stroke(); } } });
  TEX.brick.wrapS = TEX.brick.wrapT = THREE.RepeatWrapping;
}

// ───────── 공통 재료
const M = {};
function std(color, o){ return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .7 }, o || {})); }
function makeMats(){
  Object.assign(M, { rock: std(0xffffff, { flatShading: true, roughness: .9, vertexColors: true }), grass: std(0x7fd36d, { roughness: .85, map: null }), trunk: std(0x7b5233, { roughness: .9 }),
    leafA: std(0x6ccf72, { flatShading: true }), leafB: std(0xff9fc8, { flatShading: true }), leafC: std(0x9be37b, { flatShading: true }), leafD: std(0xffd36b, { flatShading: true }),
    gold: std(0xffcf4d, { metalness: .7, roughness: .3, emissive: 0x5a3c00, emissiveIntensity: .35 }), crystal: std(0x9fe9ff, { emissive: 0x40c8ff, emissiveIntensity: 1.2, roughness: .1, metalness: .2, transparent: true, opacity: .9 }),
    crystalP: std(0xe2b0ff, { emissive: 0xb050ff, emissiveIntensity: 1.1, roughness: .1, transparent: true, opacity: .9 }), win: std(0xfff0b0, { emissive: 0xffc860, emissiveIntensity: 1.3 }), dark: std(0x3a2a40) });
}

// 흐르는 물(위로!) 셰이더
function waterfallMat(){ return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { t: { value: 0 }, dir: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `varying vec2 vUv; uniform float t; uniform float dir;
    float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
    void main(){ vec2 uv = vUv; float y = uv.y - t * .9 * dir; float s = n(vec2(uv.x * 14., y * 3.)) * .6 + n(vec2(uv.x * 30., y * 7.)) * .4;
      float edge = smoothstep(0., .18, uv.x) * smoothstep(1., .82, uv.x);
      vec3 col = mix(vec3(.45,.8,1.), vec3(1.), smoothstep(.45, .9, s));
      float a = edge * (.55 + s * .45) * smoothstep(0., .06, uv.y) * smoothstep(1., .9, uv.y);
      gl_FragColor = vec4(col, a * .9); }` }); }

// 하늘 돔(그라데이션 + 희미한 별)
function skyMat(){ return new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, stars: { value: .3 }, t: { value: 0 } },
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform float stars; uniform float t;
    float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
    void main(){ float y = vP.y; vec3 c = y > 0. ? mix(mid, top, smoothstep(0., .75, y)) : mix(mid, bot, smoothstep(0., -.5, y));
      vec3 q = floor(vP * 220.); float s = step(.9975, h(q)) * smoothstep(.05, .6, y) * stars * (.6 + .4 * sin(t * 2. + h(q) * 30.));
      gl_FragColor = vec4(c + s, 1.); }` }); }

// ───────── 모양 짓기
function noiseGeo(geo, amt){ const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + (srnd(-1, 1)) * amt; p.setXYZ(i, v.x * k, v.y, v.z * k); } geo.computeVertexNormals(); return geo; }
function colorByY(geo, c1, c2){ const p = geo.attributes.position; geo.computeBoundingBox(); const b = geo.boundingBox; const cols = []; const a = new THREE.Color(c1), z = new THREE.Color(c2), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const k = (p.getY(i) - b.min.y) / (b.max.y - b.min.y || 1); c.copy(z).lerp(a, k); cols.push(c.r, c.g, c.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); return geo; }
export function makeTree(scale = 1, leaf, inverted){
  const g = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.09 * scale, .16 * scale, 1.1 * scale, 8), M.trunk); trunk.position.y = .55 * scale; trunk.castShadow = true; g.add(trunk);
  const lm = leaf || [M.leafA, M.leafB, M.leafC, M.leafD][srnd(0, 4) | 0];
  for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(srnd(.36, .55) * scale, 1), lm); s.position.set(srnd(-.35, .35) * scale, (1.15 + srnd(-.1, .45)) * scale, srnd(-.3, .3) * scale); s.castShadow = true; g.add(s); }
  if (inverted) g.rotation.z = Math.PI; return g;
}
export function makeHouse(scale = 1, color, inverted){
  const g = new THREE.Group(); const col = color || [0xffb4a2, 0xa0d8ff, 0xfff1a8, 0xc8b6ff, 0xb5f0c8][srnd(0, 5) | 0];
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2 * scale, 1 * scale, 1 * scale), std(col, { roughness: .8 })); body.position.y = .5 * scale; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.02 * scale, .75 * scale, 4), std([0xe8505b, 0x5b7be8, 0x9c5be8, 0xe88a3c][srnd(0, 4) | 0], { roughness: .6 })); roof.rotation.y = Math.PI / 4; roof.position.y = 1.37 * scale; roof.scale.set(1.15, 1, .95); roof.castShadow = true; g.add(roof);
  const ch = new THREE.Mesh(new THREE.BoxGeometry(.16 * scale, .4 * scale, .16 * scale), std(0x9b6b55)); ch.position.set(.32 * scale, 1.55 * scale, 0); g.add(ch);
  const door = new THREE.Mesh(new THREE.BoxGeometry(.28 * scale, .48 * scale, .04), std(0x7a4a2a)); door.position.set(0, .24 * scale, .51 * scale); g.add(door);
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(.22 * scale, .22 * scale, .04), M.win); w.position.set(sx * .36 * scale, .6 * scale, .51 * scale); g.add(w); }
  if (inverted) g.rotation.z = Math.PI; return g;
}
export function makeIsland(r = 2, opts = {}){
  const g = new THREE.Group();
  const rockG = colorByY(noiseGeo(new THREE.ConeGeometry(r, r * (opts.depth || 1.5), 9, 4), .18), 0xb08a6a, 0x5d4250); const rock = new THREE.Mesh(rockG, M.rock); rock.rotation.x = Math.PI; rock.position.y = -r * (opts.depth || 1.5) / 2 - .1; rock.castShadow = true; g.add(rock);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.02, r * .96, .32, 28), std(opts.grass || 0x86d96f, { roughness: .85 })); top.position.y = 0; top.receiveShadow = true; top.castShadow = true; g.add(top);
  if (opts.crystals !== false) for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(srnd(.12, .24) * r / 2, 0), i % 2 ? M.crystal : M.crystalP); const a = srnd(0, 6.28); c.position.set(Math.cos(a) * r * .55, -r * srnd(.4, 1), Math.sin(a) * r * .55); c.scale.y = 1.8; g.add(c); }
  return g;
}
export function makeWaterfall(w, h){ const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), waterfallMat()); m.renderOrder = 2; return m; }
export function makeWizard(){
  const g = new THREE.Group();
  const robe = new THREE.Mesh(new THREE.ConeGeometry(.75, 1.9, 24, 1, true), std(0x5a3bd1, { side: THREE.DoubleSide, roughness: .6 })); robe.position.y = .95; robe.castShadow = true; g.add(robe);
  for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(starGeo(.06, .025, .02), M.gold); const a = srnd(0, 6.28), y = srnd(.2, 1.5), rr = .75 * (1 - y / 1.9) + .01; s.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr); s.lookAt(Math.cos(a) * 3, y, Math.sin(a) * 3); g.add(s); }
  const head = new THREE.Mesh(new THREE.SphereGeometry(.32, 24, 18), std(0xffd2b0)); head.position.y = 2.05; g.add(head);
  const beard = new THREE.Mesh(new THREE.ConeGeometry(.3, .75, 18), std(0xf4f4f8, { roughness: 1 })); beard.position.set(0, 1.72, .12); beard.rotation.x = Math.PI; g.add(beard);
  for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), M.dark); e.position.set(sx * .11, 2.1, .28); g.add(e); const b = new THREE.Mesh(new THREE.BoxGeometry(.13, .04, .03), std(0xf4f4f8)); b.position.set(sx * .12, 2.2, .29); b.rotation.z = sx * -.2; g.add(b); }
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, .05, 28), std(0x4630b0)); brim.position.y = 2.3; g.add(brim);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(.42, 1.1, 24), std(0x4630b0)); hat.position.set(0, 2.85, -.05); hat.rotation.x = -.15; g.add(hat);
  const st = new THREE.Mesh(starGeo(.12, .05, .03), M.gold); st.position.set(0, 2.75, .36); g.add(st);
  const staff = new THREE.Group(); staff.position.set(.7, 1.1, .2); g.add(staff);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 2.2, 8), M.trunk); staff.add(pole);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.17, 20, 14), std(0xbff4ff, { emissive: 0x7fdcff, emissiveIntensity: 2 })); orb.position.y = 1.2; staff.add(orb);
  const ol = new THREE.PointLight(0x9fe6ff, 3, 6, 2); ol.position.y = 1.2; staff.add(ol);
  for (const sx of [-1, 1]) { const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.1, .5, 4, 10), std(0x5a3bd1)); arm.position.set(sx * .45, 1.4, .1); arm.rotation.z = sx * .7; g.add(arm); }
  g.userData = { staff, orb, head }; return g;
}

// ───────── 세계
export class World {
  constructor(canvas, { low } = {}){
    this.low = !!low; makeTextures(); makeMats();
    const R = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(low ? 1 : 1.6, devicePixelRatio)); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.outputColorSpace = THREE.SRGBColorSpace;
    const S = this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(R); S.environment = pm.fromScene(new RoomEnvironment(), .04).texture; S.environmentIntensity = .45;
    this.camera = new THREE.PerspectiveCamera(50, 16 / 9, .1, 900);
    this.cam = { pos: new THREE.Vector3(0, 2.2, 8), look: new THREE.Vector3(0, 1.6, 0), sway: 1, follow: 5 };
    this.camPos = this.cam.pos.clone(); this.camLook = this.cam.look.clone(); this.shake = 0; this.swayX = 0;
    // 빛
    this.hemi = new THREE.HemisphereLight(0xfff2ff, 0x6a5a8a, .9); S.add(this.hemi);
    const sun = this.sun = new THREE.DirectionalLight(0xfff0d8, 2.4); this.sunOff = new THREE.Vector3(6, 14, 8); sun.position.copy(this.sunOff); sun.castShadow = true; sun.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 }); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03; S.add(sun); S.add(sun.target);
    // 하늘
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), skyMat()); S.add(this.sky);
    S.fog = new THREE.Fog(0xffffff, 40, 160);
    // 위로 오르는 반짝이(거꾸로 내리는 눈)
    this.rise = this.makeRise(low ? 260 : 520); S.add(this.rise);
    // 터지는 파티클 풀
    this.burstSys = this.makeBurst(900); S.add(this.burstSys.points);
    this.theme = new THREE.Group(); S.add(this.theme); this.dyn = new THREE.Group(); S.add(this.dyn);
    this.updaters = []; this.themeName = '';
    // 후처리(빛 번짐) — 저사양이면 끔
    if (!low) { this.composer = new EffectComposer(R); this.composer.addPass(new RenderPass(S, this.camera)); this.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), .45, .5, .82); this.composer.addPass(this.bloom); this.composer.addPass(new OutputPass()); }
    this.resize(); addEventListener('resize', () => this.resize());
    this.t = 0;
  }
  resize(){ const w = innerWidth, h = innerHeight; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.fov = w / h < 1.3 ? 62 : 50; this.camera.updateProjectionMatrix(); if (this.composer) this.composer.setSize(w, h); }
  makeRise(n){ const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), c = new Float32Array(n * 3); const cols = [0xffffff, 0xfff1a8, 0xa8e8ff, 0xffb8e6].map(x => new THREE.Color(x));
    for (let i = 0; i < n; i++) { p[i * 3] = rnd(-30, 30); p[i * 3 + 1] = rnd(-2, 22); p[i * 3 + 2] = rnd(-30, 8); const k = cols[i % 4]; c[i * 3] = k.r; c[i * 3 + 1] = k.g; c[i * 3 + 2] = k.b; }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const m = new THREE.PointsMaterial({ size: .16, map: TEX.spark, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .85 }); const pts = new THREE.Points(g, m); pts.frustumCulled = false; return pts; }
  makeBurst(n){ const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), c = new Float32Array(n * 3); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const m = new THREE.PointsMaterial({ size: .3, map: TEX.spark, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); const pts = new THREE.Points(g, m); pts.frustumCulled = false;
    const P = Array.from({ length: n }, () => ({ life: 0, v: new THREE.Vector3(), x: new THREE.Vector3(), col: new THREE.Color(), g: 0 })); for (let i = 0; i < n; i++) p[i * 3 + 1] = -999;
    return { points: pts, P, i: 0 }; }
  // 반짝 터짐: pos 에서 색 n 개
  burst(pos, color = 0xfff1a8, n = 40, speed = 4, gravity = -2){ const B = this.burstSys, col = new THREE.Color(color);
    for (let k = 0; k < n; k++) { const q = B.P[B.i]; B.i = (B.i + 1) % B.P.length; q.life = rnd(.6, 1.3); q.x.copy(pos); q.v.set(rnd(-1, 1), rnd(-.4, 1.2), rnd(-1, 1)).normalize().multiplyScalar(rnd(.3, 1) * speed); q.col.copy(col).offsetHSL(rnd(-.05, .05), 0, rnd(-.1, .15)); q.g = gravity; } }
  // 마법 고리(퍼지는 원)
  ring(pos, color = 0x9fe9ff, size = 2){ const m = new THREE.Mesh(new THREE.RingGeometry(.8, 1, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.copy(pos); m.lookAt(this.camera.position); this.scene.add(m); let t = 0; const up = dt => { t += dt; const s = .3 + t * size * 2; m.scale.set(s, s, s); m.material.opacity = Math.max(0, .9 - t * 1.4); if (t > .7) { this.scene.remove(m); m.geometry.dispose(); m.material.dispose(); return false; } return true; }; this.oneshots = (this.oneshots || []).concat(up); }
  setSky(top, mid, bot, stars = .3, fog){ const u = this.sky.material.uniforms; u.top.value.set(top); u.mid.value.set(mid); u.bot.value.set(bot); u.stars.value = stars; this.scene.fog.color.set(fog ?? mid); }
  clearTheme(){ const kill = g => { g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && !Object.values(M).includes(o.material)) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose && m.dispose()); } }); };
    for (const g of [this.theme, this.dyn]) { kill(g); while (g.children.length) g.remove(g.children[0]); } this.updaters = []; this.scene.fog.near = 40; this.scene.fog.far = 160; this.rise.visible = true; }
  onUpdate(fn){ this.updaters.push(fn); return fn; }
  setCam(pos, look, opts = {}){ this.cam.pos.copy(pos); this.cam.look.copy(look); Object.assign(this.cam, { sway: 1, follow: 5 }, opts); if (opts.snap) { this.camPos.copy(pos); this.camLook.copy(look); } }
  kick(a = .25){ this.shake = Math.max(this.shake, a); }

  setTheme(name, ...args){ seed = 7 + name.length * 13; this.clearTheme(); this.themeName = name; const fn = this['theme_' + name]; if (fn) fn.apply(this, args); return this; }

  // 시작 화면: 떠 있는 섬 + 위에 거꾸로 매달린 마을 + 위로 흐르는 폭포
  theme_title(){
    this.setSky(0x3b2f9a, 0xff9ccf, 0xffd9a8, .5, 0xf6b8d8); this.scene.fog.near = 30; this.scene.fog.far = 130;
    this.hemi.intensity = 1; this.sun.intensity = 2.4; this.sunOff.set(5, 14, 9);
    const T = this.theme;
    const main = makeIsland(3.2, { depth: 1.6 }); main.position.set(0, -.16, 0); T.add(main);
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + .3, tf = makeTree(srnd(.5, .75)); tf.position.set(Math.cos(a) * 2.5, 0, Math.sin(a) * 2.2 - .3); if (Math.abs(tf.position.x) > 1 || tf.position.z < 0) T.add(tf); }
    // 위쪽 거꾸로 마을 섬
    const top = new THREE.Group(); top.position.set(.5, 9.5, -7); T.add(top);
    const up = makeIsland(5, { depth: 1.2, grass: 0x9be37b }); up.rotation.z = Math.PI; top.add(up);
    for (let i = 0; i < 6; i++) { const h = makeHouse(srnd(.9, 1.3), null, true); h.position.set(-3.6 + i * 1.45, -.18, srnd(-1.5, 1.5)); h.rotation.y = srnd(-.4, .4); top.add(h); }
    for (let i = 0; i < 5; i++) { const t = makeTree(srnd(.7, 1), null, true); t.position.set(srnd(-4, 4), -.18, srnd(-3, 1)); top.add(t); }
    this.onUpdate((dt, t) => { top.position.y = 9.5 + Math.sin(t * .5) * .25; top.rotation.y = Math.sin(t * .2) * .05; });
    // 위로 흐르는 폭포 두 줄기
    for (const [x, z] of [[-4.2, -5], [5.5, -6]]) { const wf = makeWaterfall(1.2, 9); wf.position.set(x, 4.3, z); T.add(wf); this.onUpdate((dt, t) => wf.material.uniforms.t.value = t);
      const pool = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, .2, 20), std(0x7fd0ff, { roughness: .1, metalness: .2, emissive: 0x2a7fbf, emissiveIntensity: .4 })); pool.position.set(x, -.1, z); T.add(pool);
      const isl = makeIsland(1.4, { depth: 1.4 }); isl.position.set(x, -.3, z); T.add(isl); }
    // 떠다니는 작은 섬·바위(여러 깊이 = 패럴랙스)
    for (let i = 0; i < 14; i++) { const r = srnd(.5, 1.6), isl = makeIsland(r, { depth: srnd(1, 2) }); const z = srnd(-40, -6), x = srnd(-1, 1) * (12 + -z * .5); isl.position.set(x, srnd(-1, 12), z); isl.rotation.y = srnd(0, 6);
      if (srnd(0, 1) < .5) { const t = makeTree(r * .5, null, srnd(0, 1) < .5); if (t.rotation.z) t.position.y = -r * 1.4; isl.add(t); }
      if (srnd(0, 1) < .3) { const h = makeHouse(r * .5, null, true); h.position.y = -r * 1.3; isl.add(h); }
      T.add(isl); const ph = srnd(0, 6), sp = srnd(.3, .8), y0 = isl.position.y; this.onUpdate((dt, t) => { isl.position.y = y0 + Math.sin(t * sp + ph) * .3; isl.rotation.y += dt * .05; }); }
    this.addClouds(10, 18, -30); this.addBalloons();
    this.setCam(new THREE.Vector3(0, 2.3, 7.4), new THREE.Vector3(0, 2.4, 0), { snap: true });
  }
  addClouds(n, y, z){ for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.cloud, transparent: true, opacity: .85, depthWrite: false, fog: true })); const zz = z + srnd(-25, 10); s.position.set(srnd(-50, 50), y + srnd(-8, 8), zz); const k = srnd(8, 16); s.scale.set(k, k / 2, 1); this.theme.add(s);
    const sp = srnd(.2, .6); this.onUpdate(dt => { s.position.x += dt * sp; if (s.position.x > 60) s.position.x = -60; }); } }
  addBalloons(){ for (let i = 0; i < 5; i++) { const g = new THREE.Group(); const col = [0xff7aa8, 0xffd36b, 0x7fd0ff, 0xb59cff, 0x8fe88f][i]; const b = new THREE.Mesh(new THREE.SphereGeometry(.5, 20, 16), std(col, { roughness: .35 })); b.scale.y = 1.15; g.add(b);
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(.15, .12, .18, 10), std(0x9b6b33)); basket.position.y = -.85; g.add(basket); // 거꾸로 나라: 바구니가 위로 떨어지듯
    g.position.set(srnd(-14, 14), srnd(3, 12), srnd(-25, -8)); g.rotation.z = Math.PI; this.theme.add(g); const ph = srnd(0, 6), y0 = g.position.y; this.onUpdate((dt, t) => { g.position.y = y0 + Math.sin(t * .6 + ph) * .6; }); } }

  // 미션 1: 거꾸로 거울의 방
  theme_mirror(){
    this.setSky(0x1c1150, 0x5b3fa8, 0x2a1b5e, .8, 0x3d2a7a); this.scene.fog.near = 14; this.scene.fog.far = 60; this.hemi.intensity = .7; this.sun.intensity = 1.4; this.sunOff.set(3, 12, 6);
    const T = this.theme;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(16, 64), std(0x2a1d55, { metalness: .85, roughness: .18 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; T.add(floor);
    const rune = new THREE.Mesh(new THREE.CircleGeometry(2.4, 64), new THREE.MeshBasicMaterial({ map: TEX.rune, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: 0x9fe9ff })); rune.rotation.x = -Math.PI / 2; rune.position.y = .02; T.add(rune);
    this.onUpdate((dt) => rune.rotation.z -= dt * .3);
    // 거울 고리
    for (let i = 0; i < 9; i++) { const a = Math.PI + (i - 4) / 4 * 1.2; const m = this.makeMirror(i === 4 ? 1.6 : 1.1); m.position.set(Math.sin(a) * -7.5, 0, Math.cos(a) * 7.5 - 1); m.lookAt(0, m.position.y, 2); T.add(m);
      const ph = i; this.onUpdate((dt, t) => { m.userData.glass.material.emissiveIntensity = .35 + Math.sin(t * 1.5 + ph) * .15; }); }
    // 바닥에서 위로 자라는 거꾸로 샹들리에
    for (const x of [-4, 4]) { const ch = new THREE.Group(); ch.position.set(x, 0, -3); T.add(ch); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1.6, 8), M.gold); pole.position.y = .8; ch.add(pole);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.6, .05, 8, 24), M.gold); ring.rotation.x = Math.PI / 2; ring.position.y = 1.6; ch.add(ring);
      for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; const cd = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .25, 8), std(0xfff6e0)); cd.position.set(Math.cos(a) * .6, 1.45, Math.sin(a) * .6); ch.add(cd);
        const fl = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), std(0xffd27a, { emissive: 0xffa940, emissiveIntensity: 2.5 })); fl.position.set(Math.cos(a) * .6, 1.28, Math.sin(a) * .6); fl.scale.y = 1.6; ch.add(fl); } // 불꽃이 아래로!
      const pl = new THREE.PointLight(0xffb060, 3, 7, 2); pl.position.y = 1.3; ch.add(pl); }
    // 떠다니는 수정
    for (let i = 0; i < 12; i++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(srnd(.15, .35), 0), i % 2 ? M.crystal : M.crystalP); c.position.set(srnd(-8, 8), srnd(1.5, 6), srnd(-9, -2)); c.scale.y = 1.7; T.add(c);
      const ph = srnd(0, 6), y0 = c.position.y; this.onUpdate((dt, t) => { c.position.y = y0 + Math.sin(t + ph) * .3; c.rotation.y += dt; }); }
    this.setCam(new THREE.Vector3(0, 2.3, 6.6), new THREE.Vector3(0, 1.5, -1.5), { snap: true, sway: .5 });
  }
  makeMirror(s){ const g = new THREE.Group(); const H = 3.6 * s, W = 1.7 * s;
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(W, H), std(0xbfe8ff, { metalness: 1, roughness: .05, emissive: 0x5aa8ff, emissiveIntensity: .35 })); glass.position.y = H / 2 + .2; g.add(glass);
    const f = (w, h, x, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .14), M.gold); b.position.set(x, y, -.02); b.castShadow = true; g.add(b); };
    f(W + .3, .18, 0, .2); f(W + .3, .18, 0, H + .2); f(.18, H, -W / 2 - .06, H / 2 + .2); f(.18, H, W / 2 + .06, H / 2 + .2);
    const top = new THREE.Mesh(new THREE.OctahedronGeometry(.18 * s, 0), M.crystal); top.position.y = H + .5; g.add(top);
    g.userData.glass = glass; return g; }

  // 미션 2: 거꾸로 중력의 숲 (앞에서 보는 무대: x -5.5~5.5, y 0~5.6)
  theme_forest(){
    this.setSky(0x2f6fb8, 0x9be8d8, 0x2c5a4a, .15, 0x8fd8c0); this.scene.fog.near = 12; this.scene.fog.far = 55; this.hemi.intensity = 1; this.sun.intensity = 2; this.sunOff.set(-4, 12, 9);
    const T = this.theme, CEIL = 6.4;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), std(0x7fcf6d, { map: TEX.grass })); TEX.grass.repeat.set(12, 6); ground.rotation.x = -Math.PI / 2; ground.position.z = -8; ground.receiveShadow = true; T.add(ground);
    // 천장(뒤집힌 땅): 흙 + 풀
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(60, 1.2, 30), std(0x6a4a3a, { roughness: 1 })); ceil.position.set(0, CEIL + .6, -8); T.add(ceil);
    const cg = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), std(0x6fc76a, { map: TEX.grass })); cg.rotation.x = Math.PI / 2; cg.position.set(0, CEIL, -8); T.add(cg);
    // 천장에서 자라는 나무(여러 줄 = 깊이)
    for (let row = 0; row < 4; row++) for (let i = 0; i < 9; i++) { const z = -1.5 - row * 4 + srnd(-1, 1), x = -14 + i * 3.5 + srnd(-1, 1); if (row === 0 && Math.abs(x) < 6) continue;
      const tr = makeTree(srnd(.9, 1.5), null, true); tr.position.set(x, CEIL, z); T.add(tr); }
    // 짧게 매달린 가지(위쪽 경계 표시)
    for (let i = 0; i < 7; i++) { const tr = makeTree(srnd(.45, .6), null, true); tr.position.set(-6 + i * 2, CEIL, -1.2); T.add(tr); }
    // 바닥 풀·버섯·돌
    for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(.08, srnd(.2, .45), 5), std(0x4fb05a)); m.position.set(srnd(-12, 12), .1, srnd(-12, 1)); T.add(m); }
    for (let i = 0; i < 10; i++) { const sh = new THREE.Group(); const st = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, .3, 8), std(0xfff3e0)); st.position.y = .15; sh.add(st);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 8, 0, 6.28, 0, Math.PI / 2), std(i % 2 ? 0xff5f6d : 0xb27cff, { emissive: i % 2 ? 0x400008 : 0x300060 })); cap.position.y = .3; sh.add(cap);
      sh.position.set(srnd(-9, 9), 0, srnd(-8, -1.5)); if (i % 3 === 0) { sh.rotation.z = Math.PI; sh.position.y = CEIL; } T.add(sh); }
    // 위로 오르는 폭포(좌우)
    for (const x of [-7.2, 7.2]) { const wf = makeWaterfall(1.6, CEIL); wf.position.set(x, CEIL / 2, -2.5); T.add(wf); this.onUpdate((dt, t) => wf.material.uniforms.t.value = t);
      const pool = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, .12, 24), std(0x7fd0ff, { roughness: .05, emissive: 0x2a7fbf, emissiveIntensity: .5 })); pool.position.set(x, .05, -2.5); T.add(pool); }
    this.fireflies(40, -10, 0, 0, CEIL);
    this.setCam(new THREE.Vector3(0, 2.8, 12.5), new THREE.Vector3(0, 3.0, 0), { snap: true, sway: .6 });
  }
  fireflies(n, z0, z1, y0, y1){ const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3); const base = []; for (let i = 0; i < n; i++) { base.push([srnd(-11, 11), srnd(y0 + .3, y1 - .3), srnd(z0, z1), srnd(0, 6)]); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: .25, map: TEX.dot, color: 0xfff27a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); this.theme.add(pts);
    this.onUpdate((dt, t) => { base.forEach((b, i) => { p[i * 3] = b[0] + Math.sin(t * .7 + b[3]) * .6; p[i * 3 + 1] = b[1] + Math.sin(t * 1.1 + b[3] * 2) * .4; p[i * 3 + 2] = b[2]; }); g.attributes.position.needsUpdate = true; }); }

  // 미션 3: 거꾸로 달리기 마을 (옆에서 보는 길: x 0 → len)
  theme_town(len = 90){
    this.setSky(0x4a8fe8, 0xbfe6ff, 0xffe8c8, .05, 0xd8eaff); this.scene.fog.near = 25; this.scene.fog.far = 90; this.hemi.intensity = 1.05; this.sun.intensity = 2.6; this.sunOff.set(-6, 16, 10);
    const T = this.theme; this.townLen = len;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(len + 60, 3.2), std(0xffffff, { map: TEX.road, roughness: .9 })); TEX.road.repeat.set((len + 60) / 4, 1); road.rotation.x = -Math.PI / 2; road.position.set(len / 2, 0, -1.6); road.receiveShadow = true; T.add(road);
    const walk = new THREE.Mesh(new THREE.BoxGeometry(len + 60, .14, 2.2), std(0xe8dcc8)); walk.position.set(len / 2, .07, .9); walk.receiveShadow = true; T.add(walk);
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(len + 80, 44), std(0x8ad870, { map: TEX.grass })); grass.rotation.x = -Math.PI / 2; grass.position.set(len / 2, -.01, -12); grass.receiveShadow = true; T.add(grass);
    for (let x = -10; x < len + 20; x += srnd(3.4, 5)) { const h = makeHouse(srnd(1.3, 1.9)); h.position.set(x, 0, -5.2 + srnd(-.6, .6)); h.rotation.y = srnd(-.15, .15); T.add(h); }
    for (let x = -6; x < len + 20; x += srnd(6, 10)) { const h = makeHouse(srnd(1, 1.6), null, true); h.position.set(x, srnd(7, 9.5), -9 + srnd(-2, 2)); T.add(h); const ph = srnd(0, 6), y0 = h.position.y; this.onUpdate((dt, t) => h.position.y = y0 + Math.sin(t * .7 + ph) * .3); }
    for (let x = -4; x < len + 10; x += 7) { const l = this.lamp(); l.position.set(x, 0, .3 - 1.2); T.add(l); }
    for (let x = 2; x < len + 10; x += srnd(5, 9)) { const t = makeTree(srnd(.8, 1.2)); t.position.set(x, 0, -3.6); T.add(t); }
    // 거꾸로 도는 시계탑(도착 지점)
    const tower = new THREE.Group(); tower.position.set(len + 3, 0, -4); T.add(tower);
    const tb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7, 2.4), std(0xf2d7b6, { map: TEX.brick })); tb.position.y = 3.5; tb.castShadow = true; tower.add(tb);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 2.2, 4), std(0x5b7be8)); roof.rotation.y = Math.PI / 4; roof.position.y = 8.1; tower.add(roof);
    const face = new THREE.Mesh(new THREE.CircleGeometry(.9, 40), std(0xfffbf0, { emissive: 0xfff3c8, emissiveIntensity: .3 })); face.position.set(0, 5.6, 1.22); tower.add(face);
    const hand1 = new THREE.Mesh(new THREE.BoxGeometry(.08, .7, .03), M.dark), hand2 = new THREE.Mesh(new THREE.BoxGeometry(.1, .5, .03), M.dark); [hand1, hand2].forEach(h => { h.geometry.translate(0, h.geometry.parameters.height / 2, 0); h.position.set(0, 5.6, 1.25); tower.add(h); });
    this.onUpdate((dt) => { hand1.rotation.z += dt * 2.4; hand2.rotation.z += dt * .2; }); // 시계 반대 방향(거꾸로)
    // 뒤로 달리는 자동차
    for (let i = 0; i < 4; i++) { const car = this.car([0xff6b6b, 0x5bc0ff, 0xffd166, 0x9b8cff][i]); car.position.set(srnd(0, len), 0, -2.3); T.add(car); const sp = srnd(2.5, 4);
      this.onUpdate((dt) => { car.position.x -= dt * sp; car.userData.wheels.forEach(w => w.rotation.z += dt * sp * 2); if (car.position.x < -15) car.position.x = len + 15; }); }
    this.addClouds(8, 16, -30);
    this.setCam(new THREE.Vector3(2, 2.6, 9), new THREE.Vector3(2, 1.5, 0), { snap: true, sway: .4 });
  }
  lamp(){ const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, 3, 8), std(0x39405a, { metalness: .5 })); p.position.y = 1.5; g.add(p);
    const b = new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 10), std(0xfff2c0, { emissive: 0xffd27a, emissiveIntensity: 1.4 })); b.position.y = 3.1; g.add(b); return g; }
  car(col){ const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(2, .55, 1), std(col, { roughness: .35, metalness: .2 })); b.position.y = .55; b.castShadow = true; g.add(b);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.1, .45, .9), std(col, { roughness: .35 })); top.position.set(-.1, 1.02, 0); g.add(top);
    const gl = new THREE.Mesh(new THREE.BoxGeometry(1.12, .3, .92), std(0xbfe8ff, { metalness: .6, roughness: .1 })); gl.position.set(-.1, 1.04, 0); g.add(gl);
    const wheels = []; for (const x of [-.6, .6]) for (const z of [-.5, .5]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .15, 14), M.dark); w.rotation.x = Math.PI / 2; w.position.set(x, .25, z); g.add(w); wheels.push(w); }
    g.userData.wheels = wheels; return g; }

  // 미션 4: 거꾸로 크기 마법 연구소 (옆에서 보는 방: x 0 → len)
  theme_lab(len = 80){
    this.setSky(0x2c2a5a, 0x6c5fb8, 0x2c2a5a, .2, 0x5a4fa0); this.scene.fog.near = 20; this.scene.fog.far = 70; this.hemi.intensity = 1.1; this.sun.intensity = 1.8; this.sunOff.set(2, 14, 10); this.rise.visible = true;
    const T = this.theme; this.labLen = len;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(len + 40, 24), std(0xffffff, { map: TEX.tile, roughness: .4, metalness: .1 })); TEX.tile.repeat.set((len + 40) / 3, 8); floor.rotation.x = -Math.PI / 2; floor.position.set(len / 2, 0, 4); floor.receiveShadow = true; T.add(floor);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(len + 40, 12), std(0x8d7fd6, { roughness: .9 })); wall.position.set(len / 2, 6, -6); wall.receiveShadow = true; T.add(wall);
    // 선반·플라스크·거꾸로 도는 톱니
    const fcol = [0x7fffd4, 0xff7aa8, 0xffd36b, 0x8fb8ff, 0xc89bff];
    for (let x = -8; x < len + 12; x += 6) { const sh = new THREE.Mesh(new THREE.BoxGeometry(4, .15, .8), std(0x8a5a3a)); sh.position.set(x, 3.6, -5.5); T.add(sh); const sh2 = sh.clone(); sh2.position.y = 5.2; T.add(sh2);
      for (let k = 0; k < 4; k++) { const c = fcol[(k + x) & 3 | 0] || fcol[k]; const fl = this.flask(c, srnd(.6, 1.1)); fl.position.set(x - 1.5 + k, 3.68, -5.4); T.add(fl); const fl2 = this.flask(fcol[(k + 2) % 5], srnd(.5, .9)); fl2.position.set(x - 1.4 + k, 5.28, -5.4); T.add(fl2); } }
    for (let x = 4; x < len; x += 14) { const gear = this.gear(srnd(1, 1.6)); gear.position.set(x, 8, -5.7); T.add(gear); const sp = srnd(.3, .6) * (Math.random() < .5 ? -1 : 1); this.onUpdate(dt => gear.rotation.z -= dt * sp); }
    // 작은 것은 크게, 큰 것은 작게: 거대한 연필·지우개, 아주 작은 의자·책상
    for (let x = 10; x < len; x += 22) { const pen = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, 6, 6), std(0xffc93c)); body.rotation.z = Math.PI / 2; pen.add(body);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(.35, .9, 6), std(0xf5d6a8)); tip.rotation.z = -Math.PI / 2; tip.position.x = 3.45; pen.add(tip); pen.position.set(x, .35, -4.4); pen.rotation.y = .1; T.add(pen);
      const er = new THREE.Mesh(new THREE.BoxGeometry(1.6, .9, 1), std(0xff8fab)); er.position.set(x + 6, .45, -4.6); T.add(er);
      const chair = new THREE.Mesh(new THREE.BoxGeometry(.25, .25, .25), std(0x9b6b33)); chair.position.set(x + 9, .12, -3.4); T.add(chair); }
    this.setCam(new THREE.Vector3(2, 2.8, 9.5), new THREE.Vector3(2, 1.7, 0), { snap: true, sway: .4 });
  }
  flask(col, s){ const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.28 * s, 16, 12), std(col, { emissive: col, emissiveIntensity: .7, transparent: true, opacity: .85, roughness: .1 })); b.position.y = .28 * s; g.add(b);
    const n = new THREE.Mesh(new THREE.CylinderGeometry(.08 * s, .08 * s, .3 * s, 10), std(0xe8f8ff, { transparent: true, opacity: .6, roughness: .05 })); n.position.y = .62 * s; g.add(n); return g; }
  gear(r){ const s = new THREE.Shape(); const n = 12; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? r : r * 1.18; const a2 = a + Math.PI / (n * 2); s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); s.lineTo(Math.cos(a2) * rr, Math.sin(a2) * rr); }
    const h = new THREE.Path(); h.absarc(0, 0, r * .35, 0, Math.PI * 2, true); s.holes.push(h); const g = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .2, bevelEnabled: false }), std(0xd8b25a, { metalness: .6, roughness: .35 })); return g; }

  // 미션 5: 거꾸로 마법사의 성 (앞에서 보는 무대)
  theme_castle(){
    this.setSky(0x1a0f45, 0x7a3fb8, 0xff9a7a, .9, 0x5a2f8a); this.scene.fog.near = 18; this.scene.fog.far = 90; this.hemi.intensity = .8; this.sun.intensity = 1.6; this.sunOff.set(4, 14, 8);
    const T = this.theme, CEIL = 6.4;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 16), std(0x463a7a, { metalness: .4, roughness: .35 })); floor.rotation.x = -Math.PI / 2; floor.position.z = -4; floor.receiveShadow = true; T.add(floor);
    const rune = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), new THREE.MeshBasicMaterial({ map: TEX.rune, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: 0xd8b0ff })); rune.rotation.x = -Math.PI / 2; rune.position.set(0, .02, -.5); T.add(rune); this.onUpdate(dt => rune.rotation.z += dt * .25);
    this.castleRune = rune;
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.45, .55, CEIL + 1, 16), std(0xb9a8e8, { map: TEX.brick })); p.position.set(sx * (6.5 + i * .3), (CEIL + 1) / 2, -1.5 - i * 3.4); p.castShadow = true; T.add(p);
      const ban = new THREE.Mesh(new THREE.PlaneGeometry(1, 2.2), std(i % 2 ? 0xe8505b : 0x5b7be8, { side: THREE.DoubleSide })); ban.position.set(sx * (5.9 + i * .3), 3.4, -1.5 - i * 3.4); T.add(ban); }
    const wallG = this.castleWall = new THREE.Group(); T.add(wallG); const back = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), std(0x5b4a9a, { map: TEX.brick })); TEX.brick.repeat.set(8, 3); back.position.set(0, 3, -11); wallG.add(back);
    const crenel = []; for (let i = -7; i <= 7; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(1, .9, .6), std(0x5b4a9a, { map: TEX.brick })); c.position.set(i * 2, 7.9, -11); wallG.add(c); }
    // 창문 너머 거꾸로 된 성(엔딩에 바로 선다)
    const outside = this.outsideCastle = new THREE.Group(); outside.position.set(0, 17, -26); outside.rotation.z = Math.PI; outside.scale.setScalar(1.3); T.add(outside);
    for (let i = -2; i <= 2; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, 6 + Math.abs(i) * -1 + 2, 14), std(0xd8c8ff, { map: TEX.brick })); t.position.set(i * 3, 3, 0); outside.add(t);
      const r = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.4, 14), std(0xe8505b)); r.position.set(i * 3, 7.2 - Math.abs(i) * .5, 0); outside.add(r); }
    const wallC = new THREE.Mesh(new THREE.BoxGeometry(14, 3.5, 1.5), std(0xcbb8ff, { map: TEX.brick })); wallC.position.y = 1.75; outside.add(wallC);
    // 창문(뒤벽 구멍 대신 빛나는 아치)
    for (const x of [-4, 4]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.6), std(0x9fe9ff, { emissive: 0x6fb8ff, emissiveIntensity: .5, transparent: true, opacity: .35 })); w.position.set(x, 4.0, -10.9); wallG.add(w); }
    // 마법사(뒤쪽 공중 단상)
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.3, .9, .4, 24), std(0x8a74d8, { metalness: .3 })); plat.position.set(0, 2.6, -7.5); T.add(plat);
    const wiz = this.wizard = makeWizard(); wiz.position.set(0, 2.8, -7.5); T.add(wiz);
    this.onUpdate((dt, t) => { plat.position.y = 2.6 + Math.sin(t * .9) * .15; wiz.position.y = plat.position.y + .2; wiz.userData.staff.rotation.z = Math.sin(t * 1.2) * .1; });
    // 천장 보석 자리 + 떠다니는 별
    for (let i = 0; i < 16; i++) { const s = new THREE.Mesh(starGeo(.12, .05, .03), M.gold); s.position.set(srnd(-9, 9), srnd(1, 7), srnd(-10, -3)); T.add(s); const ph = srnd(0, 6), y0 = s.position.y; this.onUpdate((dt, t) => { s.position.y = y0 + Math.sin(t + ph) * .25; s.rotation.y += dt * 2; }); }
    this.setCam(new THREE.Vector3(0, 2.8, 12.5), new THREE.Vector3(0, 3.0, 0), { snap: true, sway: .5 });
  }

  update(dt){
    this.t += dt; const t = this.t;
    for (const f of this.updaters) f(dt, t);
    if (this.oneshots) this.oneshots = this.oneshots.filter(f => f(dt));
    this.sky.material.uniforms.t.value = t;
    // 반짝이: 위로 오르기
    const rp = this.rise.geometry.attributes.position, a = rp.array; for (let i = 0; i < rp.count; i++) { a[i * 3 + 1] += dt * (.25 + (i % 7) * .05); a[i * 3] += Math.sin(t + i) * dt * .1; if (a[i * 3 + 1] > 22) a[i * 3 + 1] = -2; } rp.needsUpdate = true;
    this.rise.position.set(this.camPos.x, 0, this.camPos.z - 8);
    // 터짐
    const B = this.burstSys, bp = B.points.geometry.attributes.position.array, bc = B.points.geometry.attributes.color.array;
    for (let i = 0; i < B.P.length; i++) { const q = B.P[i]; if (q.life > 0) { q.life -= dt; q.v.y += q.g * dt; q.v.multiplyScalar(1 - dt * .9); q.x.addScaledVector(q.v, dt); bp[i * 3] = q.x.x; bp[i * 3 + 1] = q.x.y; bp[i * 3 + 2] = q.x.z; const k = Math.min(1, q.life * 1.6); bc[i * 3] = q.col.r * k; bc[i * 3 + 1] = q.col.g * k; bc[i * 3 + 2] = q.col.b * k; } else bp[i * 3 + 1] = -999; }
    B.points.geometry.attributes.position.needsUpdate = true; B.points.geometry.attributes.color.needsUpdate = true;
    // 카메라: 부드럽게 따라가며 살짝 흔들림(패럴랙스)
    const c = this.cam, f = c.follow; this.camPos.x = damp(this.camPos.x, c.pos.x, f, dt); this.camPos.y = damp(this.camPos.y, c.pos.y, f, dt); this.camPos.z = damp(this.camPos.z, c.pos.z, f, dt);
    this.camLook.x = damp(this.camLook.x, c.look.x, f, dt); this.camLook.y = damp(this.camLook.y, c.look.y, f, dt); this.camLook.z = damp(this.camLook.z, c.look.z, f, dt);
    const sw = c.sway; this.shake = Math.max(0, this.shake - dt * 1.5); const sk = this.shake * this.shake;
    this.camera.position.set(this.camPos.x + Math.sin(t * .31) * .25 * sw + this.swayX * sw + rnd(-1, 1) * sk * .4, this.camPos.y + Math.sin(t * .23) * .12 * sw + rnd(-1, 1) * sk * .3, this.camPos.z);
    this.camera.lookAt(this.camLook);
    this.sun.target.position.copy(this.camLook); this.sun.position.copy(this.camLook).add(this.sunOff);
    if (this.composer) this.composer.render(); else this.renderer.render(this.scene, this.camera);
  }
}
