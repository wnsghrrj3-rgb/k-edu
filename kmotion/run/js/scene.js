// K-MOTION RUN · SceneManager / AnimationManager
// 숲속 환경(절차적 스타일라이즈드) · 캐릭터 · 효과. 월드는 고정, 플레이어가 -z 로 달린다.
import * as THREE from 'three';

export const LANES = [-2.3, 0, 2.3];
export const PATH_HALF = 5.2;          // 길 폭(장식 금지 구역)
const FAR = 230, BEHIND = 26;          // 장식 유지 구간(플레이어 기준 앞 230, 뒤 26)

// ───────── 작은 도우미
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
function hash(x, z){ const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z){ const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi, u = fx * fx * (3 - 2 * fx), w = fz * fz * (3 - 2 * fz);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1); return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w; }
function fbm(x, z){ return vnoise(x, z) * .6 + vnoise(x * 2.1 + 7, z * 2.1 + 3) * .3 + vnoise(x * 4.3 + 11, z * 4.3 + 5) * .1; }
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function jitterGeo(geo, amt){ const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { p.setXYZ(i, p.getX(i) * (1 + rnd(-amt, amt)), p.getY(i) * (1 + rnd(-amt, amt)), p.getZ(i) * (1 + rnd(-amt, amt))); } geo.computeVertexNormals(); return geo; }
function canvasTex(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

// ───────── 장식 인스턴스 풀 (재배치형)
class Scatter {
  constructor(scene, parts, count, place, opt = {}){
    this.count = count; this.place = place; this.items = []; this.meshes = []; this.opt = opt;
    for (const { geo, mat, shadow } of parts) { const m = new THREE.InstancedMesh(geo, mat, count); m.castShadow = !!shadow; m.receiveShadow = !!opt.receive; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); this.meshes.push(m); }
    this.dummy = new THREE.Object3D(); this.color = new THREE.Color();
  }
  fill(z0){ for (let i = 0; i < this.count; i++) { this.items[i] = { z: 0 }; this.put(i, rnd(z0 - FAR, z0 + BEHIND)); } this.meshes.forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }); }
  put(i, z){ const it = this.items[i]; it.z = z; this.place(it, z); this.dummy.position.set(it.x, it.y || 0, z); this.dummy.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0); this.dummy.scale.setScalar(it.s || 1); this.dummy.updateMatrix();
    this.meshes.forEach((m, k) => { m.setMatrixAt(i, this.dummy.matrix); if (it.colors && it.colors[k]) m.setColorAt(i, it.colors[k]); }); }
  update(pz){ let dirty = false; for (let i = 0; i < this.count; i++) { if (this.items[i].z > pz + BEHIND) { this.put(i, this.items[i].z - (FAR + BEHIND)); dirty = true; } }
    if (dirty) this.meshes.forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }); }
}

// ───────── 캐릭터 (절차적 스타일라이즈드 + 포즈 블렌딩)
const SKIN = 0xf2c9a4, HAIR = 0x3a2418, SHIRT = 0x2ec4b6, PANTS = 0x264653, SHOE = 0xf4f1de, SHOE2 = 0xe76f51;
function limb(r, len, color){ const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 10), new THREE.MeshStandardMaterial({ color, roughness: .8 })); m.position.y = -len / 2 - r * .2; m.castShadow = true; g.add(m); return g; }
export class Character {
  constructor(){
    const g = this.root = new THREE.Group();
    const hips = this.hips = new THREE.Group(); hips.position.y = 0.98; g.add(hips);
    // 몸통
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.24, .38, 6, 12), new THREE.MeshStandardMaterial({ color: SHIRT, roughness: .75 })); torso.position.y = .33; torso.scale.set(1.05, 1, .8); torso.castShadow = true; hips.add(torso);
    const shorts = new THREE.Mesh(new THREE.CapsuleGeometry(.25, .12, 4, 12), new THREE.MeshStandardMaterial({ color: PANTS, roughness: .9 })); shorts.position.y = .02; shorts.scale.set(1.05, .8, .8); hips.add(shorts);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(.34, .36, .16), new THREE.MeshStandardMaterial({ color: 0xe9c46a, roughness: .8 })); pack.position.set(0, .34, -.24); pack.castShadow = true; hips.add(pack);
    // 머리
    const head = this.head = new THREE.Group(); head.position.y = .72; hips.add(head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(.27, 20, 16), new THREE.MeshStandardMaterial({ color: SKIN, roughness: .7 })); skull.position.y = .22; skull.castShadow = true; head.add(skull);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.285, 20, 16, 0, Math.PI * 2, 0, Math.PI * .55), new THREE.MeshStandardMaterial({ color: HAIR, roughness: .9 })); hair.position.y = .25; hair.rotation.x = -.25; head.add(hair);
    const eyeM = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: .4 });
    for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), eyeM); e.position.set(sx * .1, .22, -.24); head.add(e);
      const ch = new THREE.Mesh(new THREE.SphereGeometry(.04, 8, 6), new THREE.MeshStandardMaterial({ color: 0xf29e8e, roughness: 1 })); ch.position.set(sx * .17, .14, -.2); ch.scale.set(1, .6, .5); head.add(ch); }
    // 팔
    this.armL = limb(.07, .26, SHIRT); this.armL.position.set(-.3, .56, 0); hips.add(this.armL);
    this.armR = limb(.07, .26, SHIRT); this.armR.position.set(.3, .56, 0); hips.add(this.armR);
    this.foreL = limb(.06, .25, SKIN); this.foreL.position.y = -.3; this.armL.add(this.foreL);
    this.foreR = limb(.06, .25, SKIN); this.foreR.position.y = -.3; this.armR.add(this.foreR);
    // 다리
    this.legL = limb(.095, .34, PANTS); this.legL.position.set(-.14, 0, 0); hips.add(this.legL);
    this.legR = limb(.095, .34, PANTS); this.legR.position.set(.14, 0, 0); hips.add(this.legR);
    this.shinL = limb(.08, .34, SKIN); this.shinL.position.y = -.4; this.legL.add(this.shinL);
    this.shinR = limb(.08, .34, SKIN); this.shinR.position.y = -.4; this.legR.add(this.shinR);
    for (const s of [this.shinL, this.shinR]) { const shoe = new THREE.Mesh(new THREE.BoxGeometry(.19, .12, .32), new THREE.MeshStandardMaterial({ color: SHOE, roughness: .6 })); shoe.position.set(0, -.5, -.05); shoe.castShadow = true; s.add(shoe);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(.2, .05, .33), new THREE.MeshStandardMaterial({ color: SHOE2, roughness: .6 })); stripe.position.set(0, -.47, -.05); s.add(stripe); }
    g.traverse(o => { if (o.isMesh) o.userData.baseColor = o.material.color.clone(); });
    this.pose = this.zeroPose(); this.cur = this.zeroPose(); this.phase = 0; this.state = 'run'; this.t = 0;
  }
  zeroPose(){ return { hipY: 0, hipRX: 0, hipRZ: 0, hipRY: 0, headRX: 0, aL: 0, aR: 0, aLz: 0, aRz: 0, fL: 0, fR: 0, lL: 0, lR: 0, sL: 0, sR: 0 }; }
  set(state){ if (this.state !== state) { this.state = state; this.t = 0; } }
  flash(on){ this.root.traverse(o => { if (o.isMesh) { o.material.emissive.setHex(on ? 0xff2222 : 0); o.material.emissiveIntensity = on ? .9 : 0; } }); }
  // 상태별 목표 포즈 → 부드럽게 블렌딩(순간 자세 변화 없음)
  update(dt, speedNorm, airY, lanePush){
    this.t += dt; const P = this.pose; const z = this.zeroPose(); Object.assign(P, z);
    const st = this.state; let k = 14;
    if (st === 'run' || st === 'hit') {
      this.phase += dt * (9 + speedNorm * 5); const s = Math.sin(this.phase), c = Math.cos(this.phase);
      P.lL = s * .95; P.lR = -s * .95; P.sL = Math.max(0, -c) * 1.4 + .2; P.sR = Math.max(0, c) * 1.4 + .2;
      P.aL = -s * .8; P.aR = s * .8; P.fL = -1.1; P.fR = -1.1; P.aLz = .12; P.aRz = -.12;
      P.hipY = Math.abs(c) * .05 + .02; P.hipRX = .18; P.headRX = -.1; P.hipRY = -s * .07;
      if (st === 'hit') { const u = Math.min(1, this.t / .45); P.hipRX = -.35 * (1 - u); P.aL = P.aR = -1.3 * (1 - u) + P.aL * u; P.headRX = .3 * (1 - u); k = 18; if (this.t > .45) this.set('run'); }
    } else if (st === 'jump') {
      const up = airY > .05; P.lL = up ? -.9 : -.3; P.lR = up ? -.5 : -.2; P.sL = up ? 1.6 : .8; P.sR = up ? 1.2 : .8;
      P.aL = -2.6; P.aR = -2.6; P.aLz = .35; P.aRz = -.35; P.fL = -.3; P.fR = -.3; P.hipRX = .05; P.headRX = -.15; k = 12;
    } else if (st === 'land') {
      const u = Math.min(1, this.t / .22); P.hipY = -.16 * (1 - u); P.lL = -.9 * (1 - u); P.lR = -.9 * (1 - u); P.sL = 1.6 * (1 - u) + .2; P.sR = 1.6 * (1 - u) + .2; P.aL = -.6; P.aR = -.6; P.hipRX = .25; k = 22; if (this.t > .22) this.set('run');
    } else if (st === 'slide') {
      P.hipY = -.52; P.hipRX = -1.15; P.lL = -1.35; P.lR = -1.05; P.sL = .3; P.sR = .6; P.aL = -2.2; P.aR = .4; P.aLz = .3; P.aRz = -.5; P.fL = -.2; P.fR = -.9; P.headRX = .9; k = 16;
    } else if (st === 'win') {
      const b = Math.abs(Math.sin(this.t * 6)); P.hipY = b * .25; P.aL = -2.9; P.aR = -2.9; P.aLz = .4; P.aRz = -.4; P.fL = P.fR = -.4; P.lL = -b * .5; P.lR = -b * .5; P.sL = P.sR = b * .8; P.hipRY = Math.sin(this.t * 3) * .4; k = 10;
    }
    P.hipRZ = lanePush * -.22; P.hipRY += lanePush * -.25;
    const C = this.cur, a = 1 - Math.exp(-dt * k); for (const key in C) C[key] += (P[key] - C[key]) * a;
    this.hips.position.y = .98 + C.hipY; this.hips.rotation.set(C.hipRX, C.hipRY, C.hipRZ); this.head.rotation.x = C.headRX;
    this.armL.rotation.set(C.aL, 0, C.aLz); this.armR.rotation.set(C.aR, 0, C.aRz); this.foreL.rotation.x = C.fL; this.foreR.rotation.x = C.fR;
    this.legL.rotation.x = C.lL; this.legR.rotation.x = C.lR; this.shinL.rotation.x = C.sL; this.shinR.rotation.x = C.sR;
  }
}

// ───────── 먼지·반짝 효과 (스프라이트 풀)
class Puffs {
  constructor(scene, tex, n, color){ this.pool = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; scene.add(s); this.pool.push({ s, life: 0, vx: 0, vy: 0, vz: 0, max: 1, grow: 1 }); } }
  burst(x, y, z, n, opt = {}){ let c = 0; for (const p of this.pool) { if (p.life > 0) continue; p.life = p.max = opt.life || .6; p.s.visible = true; p.s.position.set(x + rnd(-.2, .2), y, z + rnd(-.2, .2)); p.vx = rnd(-1, 1) * (opt.spread || 1); p.vy = rnd(.5, 1.6) * (opt.up || 1); p.vz = rnd(-1, 1) * (opt.spread || 1) + (opt.vz || 0); p.s.scale.setScalar(opt.size || .5); p.grow = opt.grow || 2; p.s.material.opacity = opt.alpha || .55; if (++c >= n) break; } }
  update(dt){ for (const p of this.pool) { if (p.life <= 0) continue; p.life -= dt; const u = p.life / p.max; p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt; p.vy -= dt * .8; p.s.scale.addScalar(p.grow * dt); p.s.material.opacity = u * .55; if (p.life <= 0) p.s.visible = false; } }
}

export class SceneManager {
  constructor(canvas, quality = 'high'){
    this.quality = quality;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(quality === 'low' ? 1 : 1.5, devicePixelRatio)); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
    const sc = this.scene = new THREE.Scene(); sc.fog = new THREE.FogExp2(0xbfdcc9, 0.0062);
    this.camera = new THREE.PerspectiveCamera(58, 16 / 9, .2, 420);
    this.camPos = new THREE.Vector3(0, 3.4, 8); this.camLook = new THREE.Vector3(0, 1.3, -8); this.shake = 0; this.camKick = 0;
    this.time = 0; this.buildSky(); this.buildLights(); this.buildTextures(); this.buildGround(); this.buildForest(); this.buildExtras();
    this.character = new Character(); sc.add(this.character.root);
    this.puffs = new Puffs(sc, this.tex.puff, 40, 0xe8dcc0); this.sparks = new Puffs(sc, this.tex.spark, 30, 0xffe28a);
    this.resize(); addEventListener('resize', () => this.resize());
  }
  resize(){ const w = innerWidth, h = innerHeight; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.fov = w / h < 1.2 ? 70 : 58; this.camera.updateProjectionMatrix(); }

  buildSky(){
    const geo = new THREE.SphereGeometry(380, 24, 12);
    const mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color(0x5fa8e0) }, mid: { value: new THREE.Color(0xcfe9ff) }, bot: { value: new THREE.Color(0xe8f2d9) }, sun: { value: new THREE.Vector3(.35, .55, -.75).normalize() } },
      vertexShader: 'varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: 'uniform vec3 top,mid,bot,sun; varying vec3 vW; void main(){ float h = vW.y; vec3 c = h > 0. ? mix(mid, top, pow(h, .6)) : mix(mid, bot, -h*3.); float s = max(0., dot(vW, sun)); c += vec3(1.,.95,.8) * (pow(s, 180.) * 1.2 + pow(s, 8.) * .18); gl_FragColor = vec4(c, 1.); }' });
    this.sky = new THREE.Mesh(geo, mat); this.scene.add(this.sky);
  }
  buildLights(){
    const hemi = new THREE.HemisphereLight(0xdff3ff, 0x4a6a3a, .75); this.scene.add(hemi);
    const sun = this.sun = new THREE.DirectionalLight(0xfff2d6, 2.2); sun.position.set(14, 26, -22); sun.castShadow = true;
    const res = this.quality === 'low' ? 1024 : 2048; sun.shadow.mapSize.set(res, res); sun.shadow.camera.near = 1; sun.shadow.camera.far = 120;
    Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 30, bottom: -30 }); sun.shadow.bias = -0.0008; sun.shadow.normalBias = .03; sun.shadow.radius = 3;
    this.scene.add(sun); this.scene.add(sun.target); this.ambientFill = new THREE.AmbientLight(0x9fcfb0, .18); this.scene.add(this.ambientFill);
  }
  buildTextures(){
    this.tex = {};
    this.tex.puff = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.5, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    this.tex.spark = canvasTex(32, 32, (c, w, h) => { const g = c.createRadialGradient(16, 16, 1, 16, 16, 15); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,240,180,.9)'); g.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    this.tex.grass = canvasTex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 9; i++) { const x = 10 + i * 13 + rnd(-4, 4), hh = rnd(55, 118), bend = rnd(-18, 18); const g = c.createLinearGradient(0, h, 0, h - hh); g.addColorStop(0, '#2f7a3e'); g.addColorStop(1, '#8fd96a'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 4, h); c.quadraticCurveTo(x + bend, h - hh * .6, x + bend * 1.3, h - hh); c.quadraticCurveTo(x + bend + 2, h - hh * .5, x + 4, h); c.fill(); } });
    this.tex.fern = canvasTex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .42; c.save(); c.translate(64, 122); c.rotate(a); c.fillStyle = '#3b8f4a'; for (let j = 0; j < 9; j++) { const y = -10 - j * 11, s = 14 - j * 1.2; c.beginPath(); c.ellipse(-s * .6, y, s * .55, 4, 0, 0, Math.PI * 2); c.ellipse(s * .6, y, s * .55, 4, 0, 0, Math.PI * 2); c.fill(); } c.fillStyle = '#2b6b36'; c.fillRect(-1.5, -108, 3, 108); c.restore(); } });
    this.tex.leaf = canvasTex(32, 32, (c) => { c.clearRect(0, 0, 32, 32); c.fillStyle = '#e9b949'; c.beginPath(); c.ellipse(16, 16, 12, 6, .7, 0, Math.PI * 2); c.fill(); });
    this.tex.ray = canvasTex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,245,200,.55)'); g.addColorStop(1, 'rgba(255,245,200,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); const g2 = c.createLinearGradient(0, 0, w, 0); g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(.5, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)'); c.globalCompositeOperation = 'destination-out'; c.fillStyle = g2; c.fillRect(0, 0, w, h); });
  }
  buildGround(){
    const L = 260, W = 120; this.tiles = []; this.tileLen = L;
    const mk = () => { const geo = new THREE.PlaneGeometry(W, L, 60, 130); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, col = []; const c1 = new THREE.Color(0x6fae4a), c2 = new THREE.Color(0x3f7f3a), c3 = new THREE.Color(0x8a6f45);
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const off = smooth(PATH_HALF - .5, PATH_HALF + 6, Math.abs(x)); const hgt = (fbm(x * .08, z * .08) - .45) * 3.2 * off + Math.abs(x) * .04 * off; p.setY(i, hgt);
        const n = fbm(x * .25 + 3, z * .25); const c = new THREE.Color().copy(c1).lerp(c2, n); const edge = smooth(PATH_HALF - 1.2, PATH_HALF - 3.2, Math.abs(x)); c.lerp(c3, edge * (.35 + .5 * vnoise(x * .7, z * .7))); col.push(c.r, c.g, c.b); }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, flatShading: true })); m.receiveShadow = true; this.scene.add(m); return m; };
    for (let i = 0; i < 2; i++) { const m = mk(); m.position.z = -i * L; this.tiles.push(m); }
    // 흙길 디테일: 자갈·잔돌
    const pebble = jitterGeo(new THREE.DodecahedronGeometry(.09, 0), .3);
    this.pebbles = new Scatter(this.scene, [{ geo: pebble, mat: new THREE.MeshStandardMaterial({ color: 0x9c8b70, roughness: 1, flatShading: true }) }], 160, it => { it.x = rnd(-4.6, 4.6); it.y = .02; it.s = rnd(.5, 1.4); it.ry = rnd(0, 6); });
  }
  buildForest(){
    const sc = this.scene; const leafMat = c => new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true });
    const barkMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1, flatShading: true });
    const greens = [0x2f8f4e, 0x3aa35a, 0x4cb86a, 0x6cc46a, 0x2d7f58, 0x8bc34a].map(c => new THREE.Color(c));
    const autumn = [0xd98a2b, 0xe0a83a, 0xc4642c].map(c => new THREE.Color(c));
    // ① 침엽수: 줄기 + 3단 원뿔
    const pine = (() => { const trunk = new THREE.CylinderGeometry(.18, .32, 2.6, 7); trunk.translate(0, 1.3, 0); const cones = []; for (let i = 0; i < 3; i++) { const g = jitterGeo(new THREE.ConeGeometry(2.1 - i * .5, 2.6 - i * .2, 8), .08); g.translate(0, 2.6 + i * 1.5, 0); cones.push(g); } return { trunk, cone: mergeGeos(cones) }; })();
    this.pines = new Scatter(sc, [{ geo: pine.trunk, mat: barkMat, shadow: true }, { geo: pine.cone, mat: leafMat(0xffffff), shadow: this.quality !== 'low' }], 150,
      it => { const side = Math.random() < .5 ? -1 : 1; it.x = side * (PATH_HALF + 1.2 + Math.pow(Math.random(), 1.6) * 36); it.s = rnd(.9, 1.9); it.ry = rnd(0, 6); it.y = -.1; it.colors = [null, pick(greens)]; });
    // ② 활엽수: 굽은 줄기 + 둥근 잎 뭉치
    const broad = (() => { const trunk = new THREE.CylinderGeometry(.22, .4, 2.4, 7); trunk.translate(0, 1.2, 0); const blobs = []; for (let i = 0; i < 5; i++) { const g = jitterGeo(new THREE.IcosahedronGeometry(1.5 - (i === 0 ? 0 : .35), 1), .12); const a = i * 2.4; g.translate(i === 0 ? 0 : Math.cos(a) * 1.1, 3.1 + (i === 0 ? .4 : Math.sin(a * 2) * .5), i === 0 ? 0 : Math.sin(a) * 1.1); blobs.push(g); } return { trunk, blob: mergeGeos(blobs) }; })();
    this.broads = new Scatter(sc, [{ geo: broad.trunk, mat: barkMat, shadow: true }, { geo: broad.blob, mat: leafMat(0xffffff), shadow: this.quality !== 'low' }], 110,
      it => { const side = Math.random() < .5 ? -1 : 1; it.x = side * (PATH_HALF + 1.6 + Math.pow(Math.random(), 1.5) * 30); it.s = rnd(.8, 1.6); it.ry = rnd(0, 6); it.y = -.1; it.colors = [null, Math.random() < .18 ? pick(autumn) : pick(greens)]; });
    // ③ 바위
    const rockGeo = jitterGeo(new THREE.DodecahedronGeometry(1, 1), .25);
    this.rocks = new Scatter(sc, [{ geo: rockGeo, mat: new THREE.MeshStandardMaterial({ color: 0x8e8d87, roughness: .95, flatShading: true }), shadow: true }], 60,
      it => { const side = Math.random() < .5 ? -1 : 1; it.x = side * (PATH_HALF + .8 + Math.random() * 14); it.s = rnd(.35, 1.4); it.y = -it.s * .3; it.ry = rnd(0, 6); it.rx = rnd(-.3, .3); });
    // ④ 덤불
    const bush = mergeGeos([0, 1, 2].map(i => { const g = jitterGeo(new THREE.IcosahedronGeometry(.6, 1), .15); g.translate((i - 1) * .55, .35 + (i === 1 ? .2 : 0), rnd(-.2, .2)); return g; }));
    this.bushes = new Scatter(sc, [{ geo: bush, mat: leafMat(0xffffff), shadow: true }], 120, it => { const side = Math.random() < .5 ? -1 : 1; it.x = side * (PATH_HALF - .4 + Math.pow(Math.random(), 2) * 10); it.s = rnd(.6, 1.5); it.ry = rnd(0, 6); it.colors = [pick(greens)]; });
    // ⑤ 풀·고사리: 십자 평면 알파
    const cross = (w, h) => { const a = new THREE.PlaneGeometry(w, h); a.translate(0, h / 2, 0); const b = a.clone(); b.rotateY(Math.PI / 2); return mergeGeos([a, b]); };
    const grassMat = new THREE.MeshStandardMaterial({ map: this.tex.grass, alphaTest: .45, side: THREE.DoubleSide, roughness: 1 });
    this.grass = new Scatter(sc, [{ geo: cross(1.1, 1.1), mat: grassMat }], 420, it => { const side = Math.random() < .5 ? -1 : 1; it.x = side * (PATH_HALF - 1.3 + Math.pow(Math.random(), 2.2) * 14); it.s = rnd(.5, 1.2); it.ry = rnd(0, 6); });
    const fernMat = new THREE.MeshStandardMaterial({ map: this.tex.fern, alphaTest: .45, side: THREE.DoubleSide, roughness: 1 });
    this.ferns = new Scatter(sc, [{ geo: cross(1.4, 1.4), mat: fernMat }], 140, it => { const side = Math.random() < .5 ? -1 : 1; it.x = side * (PATH_HALF + .2 + Math.pow(Math.random(), 1.8) * 9); it.s = rnd(.6, 1.3); it.ry = rnd(0, 6); });
    // ⑥ 꽃
    const flower = (() => { const stem = new THREE.CylinderGeometry(.02, .02, .4, 4); stem.translate(0, .2, 0); const head = new THREE.SphereGeometry(.09, 6, 5); head.translate(0, .42, 0); return { stem, head }; })();
    this.flowers = new Scatter(sc, [{ geo: flower.stem, mat: leafMat(0x3f8f3a) }, { geo: flower.head, mat: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .6, emissive: 0x222222 }) }], 120,
      it => { const side = Math.random() < .5 ? -1 : 1; it.x = side * (PATH_HALF - 1 + Math.random() * 6); it.s = rnd(.8, 1.4); it.colors = [null, pick([0xffffff, 0xffd166, 0xff8fa3, 0xb49cff].map(c => new THREE.Color(c)))]; });
    // ⑦ 먼 산 (플레이어 따라옴)
    this.far = new THREE.Group(); sc.add(this.far);
    const mtnMat = new THREE.MeshStandardMaterial({ color: 0x6f9f7c, roughness: 1, flatShading: true });
    for (let i = 0; i < 14; i++) { const a = -Math.PI * .5 + (i / 13 - .5) * 1.9; const d = rnd(150, 210); const m = new THREE.Mesh(jitterGeo(new THREE.ConeGeometry(rnd(28, 60), rnd(40, 95), 7), .12), mtnMat); m.position.set(Math.cos(a) * d, -6, Math.sin(a) * d); m.rotation.y = rnd(0, 6); this.far.add(m); }
    const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x4f8f62, roughness: 1, flatShading: true });
    for (let i = 0; i < 22; i++) { const a = -Math.PI * .5 + (i / 21 - .5) * 2.4; const d = rnd(90, 130); const m = new THREE.Mesh(jitterGeo(new THREE.ConeGeometry(rnd(14, 26), rnd(18, 34), 6), .15), ridgeMat); m.position.set(Math.cos(a) * d, -3, Math.sin(a) * d); this.far.add(m); }
    // ⑧ 빛줄기 (가산 혼합)
    this.rays = []; const rayMat = new THREE.MeshBasicMaterial({ map: this.tex.ray, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(rnd(2, 4.5), 28), rayMat); m.position.set(rnd(-14, 14), 12, -rnd(10, 60)); m.rotation.z = -.35; m.rotation.y = rnd(-.4, .4); m.userData.base = m.position.clone(); this.far.add(m); this.rays.push(m); }
    // ⑨ 낙엽
    const n = 260, pos = new Float32Array(n * 3), spd = []; for (let i = 0; i < n; i++) { pos[i * 3] = rnd(-16, 16); pos[i * 3 + 1] = rnd(0, 12); pos[i * 3 + 2] = rnd(-70, 10); spd.push(rnd(.4, 1.2)); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); this.leafSpd = spd;
    this.leaves = new THREE.Points(lg, new THREE.PointsMaterial({ map: this.tex.leaf, size: .26, transparent: true, alphaTest: .3, depthWrite: false, color: 0xffd98a })); sc.add(this.leaves);
  }
  buildExtras(){ const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex.puff, color: 0xfff1c4, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); sunSprite.scale.setScalar(70); sunSprite.position.set(95, 150, -220); this.far.add(sunSprite); }

  fill(pz){ for (const s of [this.pines, this.broads, this.rocks, this.bushes, this.grass, this.ferns, this.flowers, this.pebbles]) s.fill(pz); }
  // 플레이어 위치·상태를 받아 카메라/장식/효과 갱신
  update(dt, player, game){
    this.time += dt; const pz = player.z, px = player.x;
    for (const s of [this.pines, this.broads, this.rocks, this.bushes, this.grass, this.ferns, this.flowers, this.pebbles]) s.update(pz);
    for (const t of this.tiles) { if (t.position.z - this.tileLen / 2 > pz + 30) t.position.z -= this.tileLen * 2; }
    this.far.position.z = pz - 20; this.sky.position.set(px, 0, pz); this.sun.position.set(px + 14, 26, pz - 22); this.sun.target.position.set(px, 0, pz - 6);
    for (let i = 0; i < this.rays.length; i++) { const m = this.rays[i]; m.material.opacity = .25 + Math.sin(this.time * .7 + i) * .1; m.rotation.z = -.35 + Math.sin(this.time * .3 + i * 2) * .04; }
    const p = this.leaves.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) - this.leafSpd[i] * dt, x = p.getX(i) + Math.sin(this.time * 1.3 + i) * dt * .6, z = p.getZ(i); if (y < -.5) { y = rnd(8, 13); x = rnd(-16, 16); z = pz - rnd(10, 70); } if (z > pz + 12) z = pz - rnd(30, 70); p.setXYZ(i, x, y, z); } p.needsUpdate = true;
    // 카메라: 뒤에서 부드럽게 추적, 점프·충돌 반응
    const speedK = game ? game.speedNorm : 0; const tgt = new THREE.Vector3(px * .55, 3.3 + player.y * .35 + this.camKick, pz + 8.2 - speedK * .9);
    this.camPos.lerp(tgt, 1 - Math.exp(-dt * 7)); this.camLook.lerp(new THREE.Vector3(px * .3, 1.3 + player.y * .3, pz - 9), 1 - Math.exp(-dt * 9));
    this.camKick *= Math.exp(-dt * 4); this.shake = Math.max(0, this.shake - dt * 2.2);
    const sh = this.shake * this.shake * .35; this.camera.position.copy(this.camPos).add(new THREE.Vector3(rnd(-sh, sh), rnd(-sh, sh), 0)); this.camera.lookAt(this.camLook); this.camera.fov += ((innerWidth / innerHeight < 1.2 ? 70 : 58) + speedK * 7 - this.camera.fov) * dt * 3; this.camera.updateProjectionMatrix();
    this.puffs.update(dt); this.sparks.update(dt);
  }
  dust(x, z, n = 8, opt){ this.puffs.burst(x, .1, z, n, Object.assign({ size: .45, grow: 2.2, up: .9, spread: 1.2, vz: 1.5 }, opt)); }
  sparkle(x, y, z, n = 10){ this.sparks.burst(x, y, z, n, { size: .25, grow: .4, up: 1.6, spread: 1.6, life: .5 }); }
  render(){ this.renderer.render(this.scene, this.camera); }
}

// 간단 지오메트리 합치기(같은 속성 구조, 색 없음)
function mergeGeos(geos){
  let pc = 0, ic = 0; for (const g of geos) { pc += g.attributes.position.count; ic += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(pc * 3), nor = new Float32Array(pc * 3), uv = new Float32Array(pc * 2), idx = []; let o = 0;
  for (const g of geos) { const gp = g.attributes.position, gn = g.attributes.normal, gu = g.attributes.uv; pos.set(gp.array, o * 3); if (gn) nor.set(gn.array, o * 3); if (gu) uv.set(gu.array, o * 2);
    if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.array[i] + o); else for (let i = 0; i < gp.count; i++) idx.push(i + o); o += gp.count; }
  const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); m.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); m.setIndex(idx); return m;
}
