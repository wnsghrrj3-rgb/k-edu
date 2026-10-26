// K-MOTION MATH BATTLE · BattleEngine / MonsterManager / AnimationManager / EffectManager (Three.js r185, 절차적 모델)
import * as THREE from 'three';
const rnd = (a, b) => a + Math.random() * (b - a);
function jitter(geo, amt){ const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (1 + rnd(-amt, amt)), p.getY(i) * (1 + rnd(-amt, amt)), p.getZ(i) * (1 + rnd(-amt, amt))); geo.computeVertexNormals(); return geo; }
function tex(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const std = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .7, flatShading: true }, o));

export const MONSTERS = {
  slime:  { name: '숲의 슬라임', icon: '🟢', build: buildSlime, scale: 1, hpColor: '#7ee36a' },
  golem:  { name: '돌 골렘',     icon: '🪨', build: buildGolem, scale: 1, hpColor: '#c9b48a' },
  dragon: { name: '마법 드래곤', icon: '🐉', build: buildDragon, scale: 1.15, boss: true, hpColor: '#ff6fae' },
};

// ───────── 몬스터 모델 (각각 update(t, state) 로 자기 움직임)
function buildSlime(){
  const g = new THREE.Group(); const mat = std(0x6fd85a, { roughness: .35, transparent: true, opacity: .92, emissive: 0x1d4d12, emissiveIntensity: .35 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 28, 20), mat); body.scale.set(1.3, 1, 1.3); body.position.y = 1; body.castShadow = true; g.add(body);
  const core = new THREE.Mesh(new THREE.SphereGeometry(.45, 16, 12), std(0xb9ff9e, { emissive: 0x7bff5a, emissiveIntensity: .8, flatShading: false })); core.position.set(0, .95, -.2); body.add(core);
  const eyeW = std(0xffffff, { flatShading: false, roughness: .3 }), eyeB = std(0x1b1b1b, { flatShading: false, roughness: .3 });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 10), eyeW); e.position.set(s * .42, 1.25, .95); g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), eyeB); p.position.set(s * .44, 1.27, 1.14); g.add(p); }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(.22, .05, 8, 16, Math.PI), std(0x2a5a1e, { flatShading: false })); mouth.position.set(0, .85, 1.08); mouth.rotation.z = Math.PI; g.add(mouth);
  for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(rnd(.12, .22), 10, 8), mat); d.position.set(rnd(-1, 1), rnd(.5, 1.6), rnd(-.8, .5)); g.add(d); }
  g.userData.update = (t, st) => { const b = st === 'hit' ? .55 : 1 + Math.sin(t * 5) * .06; body.scale.set(1.3 * (2 - b) * .9 + .13, b, 1.3 * (2 - b) * .9 + .13); body.position.y = 1 - (1 - b) * .9; g.rotation.y = Math.sin(t * .8) * .2; };
  return g;
}
function buildGolem(){
  const g = new THREE.Group(); const rock = std(0x7d7a74, { roughness: 1 }), glow = std(0xff8c2a, { emissive: 0xff6a00, emissiveIntensity: 1.6, flatShading: false });
  const torso = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(1.1, 1), .18), rock); torso.position.y = 1.6; torso.scale.set(1.25, 1.05, .9); torso.castShadow = true; g.add(torso);
  const head = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(.55, 1), .2), rock); head.position.y = 2.95; head.castShadow = true; g.add(head);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(.18, .1, .12), glow); e.position.set(s * .22, 3.0, .5); g.add(e); }
  const arms = []; for (const s of [-1, 1]) { const a = new THREE.Group(); a.position.set(s * 1.45, 2.2, 0); const up = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(.42, 0), .2), rock); up.position.y = -.4; up.castShadow = true; a.add(up); const fist = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(.55, 1), .2), rock); fist.position.y = -1.25; fist.castShadow = true; a.add(fist); g.add(a); arms.push(a); }
  for (const s of [-1, 1]) { const l = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(.5, 0), .2), rock); l.position.set(s * .6, .45, 0); l.scale.set(1, .9, 1.1); l.castShadow = true; g.add(l); }
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(.06, rnd(.25, .6), .06), glow); c.position.set(rnd(-.9, .9), rnd(1.0, 2.3), .95); c.rotation.z = rnd(-.6, .6); g.add(c); }
  g.userData.update = (t, st) => { const br = Math.sin(t * 1.6) * .03; torso.scale.set(1.25 + br, 1.05 - br, .9); g.rotation.y = Math.sin(t * .5) * .12; arms[0].rotation.x = Math.sin(t * 1.6) * .12; arms[1].rotation.x = -Math.sin(t * 1.6) * .12; if (st === 'attack') { arms[0].rotation.x = -1.6; arms[1].rotation.x = -1.6; } glow.emissiveIntensity = 1.2 + Math.sin(t * 3) * .5; };
  return g;
}
function buildDragon(){
  const g = new THREE.Group(); const skin = std(0x7a3fe0, { roughness: .55 }), belly = std(0xf2d27a, { roughness: .6, flatShading: false }), wingM = std(0xc44fd6, { side: THREE.DoubleSide, transparent: true, opacity: .9, emissive: 0x5a1a7a, emissiveIntensity: .35 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.75, 1.6, 6, 14), skin); body.rotation.x = Math.PI / 2 - .25; body.position.set(0, 1.9, 0); body.castShadow = true; g.add(body);
  const bel = new THREE.Mesh(new THREE.CapsuleGeometry(.55, 1.4, 4, 12), belly); bel.position.set(0, -.12, .35); bel.rotation.x = Math.PI / 2 - .25; bel.scale.set(.9, 1, .6); bel.position.set(0, 1.75, .3); g.add(bel);
  const neck = new THREE.Group(); neck.position.set(0, 2.5, .9); g.add(neck);
  const n1 = new THREE.Mesh(new THREE.CapsuleGeometry(.38, .9, 4, 10), skin); n1.rotation.x = -.6; n1.position.set(0, .3, .25); n1.castShadow = true; neck.add(n1);
  const head = new THREE.Group(); head.position.set(0, .9, .55); neck.add(head);
  const skull = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(.5, 1), .08), skin); skull.scale.set(1, .85, 1.3); skull.castShadow = true; head.add(skull);
  const snout = new THREE.Mesh(new THREE.ConeGeometry(.3, .9, 8), skin); snout.rotation.x = Math.PI / 2; snout.position.set(0, -.08, .75); head.add(snout);
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(.1, .55, 6), belly); h.position.set(s * .3, .4, -.2); h.rotation.z = s * -.5; h.rotation.x = -.5; head.add(h); const e = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), std(0xffe066, { emissive: 0xffb300, emissiveIntensity: 1.2, flatShading: false })); e.position.set(s * .27, .12, .35); head.add(e); }
  const wings = []; for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(s * .55, 2.4, .1); const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(s * 2.6, 1.3); shape.lineTo(s * 3.3, .2); shape.lineTo(s * 2.4, -.6); shape.lineTo(s * 1.4, -1.2); shape.lineTo(0, -.6); const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), wingM); m.rotation.y = s * .2; w.add(m); const bone = new THREE.Mesh(new THREE.CylinderGeometry(.06, .1, 2.9, 6), skin); bone.rotation.z = s * -1.1; bone.position.set(s * 1.3, .65, 0); w.add(bone); g.add(w); wings.push(w); }
  const tail = []; let par = g, tz = -1.2, ty = 1.7; for (let i = 0; i < 5; i++) { const seg = new THREE.Mesh(new THREE.ConeGeometry(.42 - i * .07, .7, 8), skin); seg.rotation.x = Math.PI / 2; seg.position.set(0, ty, tz); g.add(seg); tail.push(seg); tz -= .55; ty -= .08; }
  const fire = new THREE.PointLight(0xff7a2a, 0, 6); fire.position.set(0, .2, 1.2); head.add(fire); g.userData.fire = fire;
  g.userData.update = (t, st) => { g.position.y = Math.sin(t * 1.4) * .18 + .2; const fl = Math.sin(t * 6) * .55; wings[0].rotation.z = fl; wings[1].rotation.z = -fl; neck.rotation.x = st === 'attack' ? .55 : Math.sin(t * 1.1) * .08; head.rotation.y = Math.sin(t * .7) * .25; tail.forEach((s, i) => { s.position.x = Math.sin(t * 2 + i * .7) * .18 * (i + 1) * .35; }); fire.intensity = st === 'attack' ? 6 : 0; };
  return g;
}

// ───────── 효과 (스프라이트 풀)
class Sparks { constructor(scene, map, n){ this.pool = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.visible = false; scene.add(s); this.pool.push({ s, life: 0, v: new THREE.Vector3(), max: 1 }); } }
  burst(p, n, color, opt = {}){ let c = 0; for (const q of this.pool) { if (q.life > 0) continue; q.life = q.max = opt.life || .6; q.s.visible = true; q.s.position.copy(p); q.v.set(rnd(-1, 1), rnd(-.3, 1.2), rnd(-1, 1)).multiplyScalar(opt.speed || 3); q.s.material.color.set(color); q.s.scale.setScalar(opt.size || .35); q.grav = opt.grav == null ? 4 : opt.grav; if (++c >= n) break; } }
  update(dt){ for (const q of this.pool) { if (q.life <= 0) continue; q.life -= dt; q.s.position.addScaledVector(q.v, dt); q.v.y -= q.grav * dt; q.s.material.opacity = Math.min(1, q.life / q.max * 1.4); if (q.life <= 0) q.s.visible = false; } } }

export class BattleEngine {
  constructor(canvas, quality = 'high'){
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); r.setPixelRatio(Math.min(quality === 'low' ? 1 : 1.5, devicePixelRatio)); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1; r.outputColorSpace = THREE.SRGBColorSpace;
    const sc = this.scene = new THREE.Scene(); sc.background = new THREE.Color(0x120a2c); sc.fog = new THREE.FogExp2(0x120a2c, .045);
    this.camera = new THREE.PerspectiveCamera(50, 16 / 9, .1, 120); this.camBase = new THREE.Vector3(0, 2.6, 7.2); this.camera.position.copy(this.camBase); this.camera.lookAt(0, 1.8, 0); this.shake = 0; this.t = 0;
    this.glow = tex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 1, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
    this.buildArena(quality); this.sparks = new Sparks(sc, this.glow, 90); this.monster = null; this.mState = 'idle'; this.stateT = 0; this.bolts = [];
    this.resize(); addEventListener('resize', () => this.resize());
  }
  resize(){ const w = innerWidth, h = innerHeight; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.fov = w / h < 1.2 ? 64 : 50; this.camera.updateProjectionMatrix(); }
  buildArena(q){
    const sc = this.scene; sc.add(new THREE.HemisphereLight(0xb8a4ff, 0x1a0f3a, .7)); const key = new THREE.DirectionalLight(0xfff0e0, 1.6); key.position.set(5, 9, 6); key.castShadow = true; key.shadow.mapSize.set(q === 'low' ? 1024 : 2048, q === 'low' ? 1024 : 2048); Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 }); key.shadow.bias = -.0006; sc.add(key);
    const pl1 = new THREE.PointLight(0x7c5cff, 18, 20); pl1.position.set(-5, 3, 2); sc.add(pl1); const pl2 = new THREE.PointLight(0x5ef2c8, 12, 20); pl2.position.set(5, 3, 2); sc.add(pl2); this.pl = [pl1, pl2];
    this.bossLight = new THREE.PointLight(0xff3d6e, 0, 18); this.bossLight.position.set(0, 4, -2); sc.add(this.bossLight);
    // 바닥: 돌 원판 + 룬 링
    const floorTex = tex(512, 512, (c, w, h) => { c.fillStyle = '#2a2240'; c.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${60 + Math.random() * 40 | 0},${50 + Math.random() * 30 | 0},${90 + Math.random() * 40 | 0},.6)`; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, rnd(4, 26), 0, 7); c.fill(); } c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; for (let i = 0; i < 40; i++) { c.beginPath(); c.moveTo(Math.random() * w, Math.random() * h); c.lineTo(Math.random() * w, Math.random() * h); c.stroke(); } });
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(3, 3);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 48), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .9 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; sc.add(floor);
    const runeTex = tex(512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#b89cff'; c.lineWidth = 10; c.beginPath(); c.arc(256, 256, 230, 0, 7); c.stroke(); c.lineWidth = 4; c.beginPath(); c.arc(256, 256, 200, 0, 7); c.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.save(); c.translate(256 + Math.cos(a) * 215, 256 + Math.sin(a) * 215); c.rotate(a); c.fillStyle = '#dcd2ff'; c.fillRect(-6, -6, 12, 12); c.restore(); } c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c[i ? 'lineTo' : 'moveTo'](256 + Math.cos(a) * 190, 256 + Math.sin(a) * 190); } c.closePath(); c.stroke(); });
    this.rune = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: runeTex, transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false })); this.rune.rotation.x = -Math.PI / 2; this.rune.position.y = .02; sc.add(this.rune);
    // 기둥·수정
    const pillarM = std(0x3b3160, { roughness: .85 }), crystalM = std(0x9b7bff, { emissive: 0x7c5cff, emissiveIntensity: .9, flatShading: true, transparent: true, opacity: .9 }); this.crystals = [];
    for (let i = 0; i < 8; i++) { const a = Math.PI * .15 + i / 7 * Math.PI * .7 + Math.PI; const r = 10; const p = new THREE.Mesh(new THREE.CylinderGeometry(.5, .7, rnd(4, 7), 7), pillarM); p.position.set(Math.cos(a) * r, p.geometry.parameters.height / 2, Math.sin(a) * r); p.castShadow = true; sc.add(p);
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(rnd(.4, .7), 0), crystalM); cr.position.set(p.position.x, p.geometry.parameters.height + .6, p.position.z); sc.add(cr); this.crystals.push(cr); }
    for (let i = 0; i < 24; i++) { const a = rnd(Math.PI * .9, Math.PI * 2.1); const r = rnd(6, 13); const rk = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(rnd(.3, 1.1), 0), .25), std(0x463a6a, { roughness: 1 })); rk.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); rk.castShadow = true; sc.add(rk); }
    // 배경 산·하늘 입자
    const mtn = std(0x1f1740, { roughness: 1 }); for (let i = 0; i < 14; i++) { const a = Math.PI * .95 + i / 13 * Math.PI * 1.1; const m = new THREE.Mesh(jitter(new THREE.ConeGeometry(rnd(6, 12), rnd(10, 22), 6), .12), mtn); m.position.set(Math.cos(a) * 34, -2, Math.sin(a) * 34); sc.add(m); }
    const n = 320, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rnd(-16, 16); pos[i * 3 + 1] = rnd(.3, 9); pos[i * 3 + 2] = rnd(-14, 6); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); this.motes = new THREE.Points(pg, new THREE.PointsMaterial({ map: this.glow, size: .22, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xc9b8ff })); sc.add(this.motes);
    this.appearRing = new THREE.Mesh(new THREE.RingGeometry(.2, 2.6, 48), new THREE.MeshBasicMaterial({ color: 0xb89cff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); this.appearRing.rotation.x = -Math.PI / 2; this.appearRing.position.y = .05; sc.add(this.appearRing);
  }
  // ── 몬스터 관리
  spawn(key){ this.despawn(); const def = MONSTERS[key]; const m = def.build(); m.scale.setScalar(.01); m.position.set(0, 0, -.5); this.scene.add(m); this.monster = m; this.mDef = def; this.mKey = key; this.mState = 'appear'; this.stateT = 0; this.appearRing.material.opacity = .9; this.appearRing.scale.setScalar(.1); this.bossLight.intensity = def.boss ? 10 : 0; this.sparks.burst(new THREE.Vector3(0, 1, 0), 30, def.boss ? 0xff6fae : 0xb89cff, { speed: 4, size: .4, grav: 1 }); }
  despawn(){ if (this.monster) { this.scene.remove(this.monster); this.monster = null; } }
  setState(s){ this.mState = s; this.stateT = 0; }
  flash(on){ if (!this.monster) return; this.monster.traverse(o => { if (o.isMesh && o.material.emissive) { if (on) { o.userData.em = o.userData.em || o.material.emissive.getHex(); o.userData.ei = o.userData.ei == null ? o.material.emissiveIntensity : o.userData.ei; o.material.emissive.setHex(0xff2040); o.material.emissiveIntensity = 1.2; } else if (o.userData.em != null) { o.material.emissive.setHex(o.userData.em); o.material.emissiveIntensity = o.userData.ei; } } }); }
  // ── 마법 공격: 화면 아래에서 몬스터로 날아가는 구슬
  cast(ok, from = 1, onArrive){ const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: ok ? 0x9ff6dd : 0x8a8a9a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); b.scale.setScalar(ok ? 1.1 : .7); const x0 = (from - 1) * 2.2; b.position.set(x0, .6, 5.5); this.scene.add(b); const light = new THREE.PointLight(ok ? 0x5ef2c8 : 0x888888, 8, 8); b.add(light); this.bolts.push({ s: b, t: 0, ok, x0, dur: .5, onArrive }); }
  hit(){ this.setState('hit'); this.flash(true); this.shake = .6; this.sparks.burst(new THREE.Vector3(0, 1.8, .6), 26, 0x5ef2c8, { speed: 5, size: .35 }); this.sparks.burst(new THREE.Vector3(0, 1.8, .6), 12, 0xffd166, { speed: 3, size: .5, life: .8 }); }
  attack(){ this.setState('attack'); setTimeout(() => { this.shake = 1; }, 380); }
  die(){ this.setState('die'); this.sparks.burst(new THREE.Vector3(0, 1.6, 0), 60, 0xffd166, { speed: 6, size: .45, life: 1.1, grav: 2 }); this.sparks.burst(new THREE.Vector3(0, 1.6, 0), 30, 0xff6fae, { speed: 4, size: .3, life: 1.3, grav: 1 }); }
  update(dt){ this.t += dt; this.stateT += dt; const t = this.t;
    this.rune.rotation.z = t * .12; this.rune.material.opacity = .55 + Math.sin(t * 2) * .2; this.crystals.forEach((c, i) => { c.rotation.y = t * .6 + i; c.position.y += Math.sin(t * 1.5 + i) * .002; }); this.pl[0].intensity = 16 + Math.sin(t * 2.3) * 4; this.pl[1].intensity = 11 + Math.cos(t * 1.7) * 3; if (this.bossLight.intensity > 0) this.bossLight.intensity = 8 + Math.sin(t * 4) * 4;
    const p = this.motes.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) + dt * .25; if (y > 9) y = .3; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(t + i) * dt * .15); } p.needsUpdate = true;
    const m = this.monster; if (m) { const st = this.stateT, base = this.mDef.scale;
      if (this.mState === 'appear') { const u = Math.min(1, st / .9); const e = 1 - Math.pow(1 - u, 3); m.scale.setScalar(base * (e * 1.15 - Math.sin(u * Math.PI) * .15)); m.position.y = -2.2 * (1 - e); this.appearRing.scale.setScalar(.1 + e * 1.2); this.appearRing.material.opacity = (1 - u) * .9; if (u >= 1) this.setState('idle'); }
      else if (this.mState === 'hit') { const u = Math.min(1, st / .35); m.position.z = -.5 - Math.sin(u * Math.PI) * 1.2; m.rotation.z = Math.sin(u * Math.PI * 2) * .12; m.scale.setScalar(base); if (st > .12) this.flash(false); if (u >= 1) { m.position.z = -.5; m.rotation.z = 0; this.setState('idle'); } }
      else if (this.mState === 'attack') { const u = Math.min(1, st / .8); const k = Math.sin(u * Math.PI); m.position.z = -.5 + k * 2.6; m.position.y = (this.mKey === 'golem' ? k * 1.4 : 0); m.scale.setScalar(base * (1 + k * .1)); if (u >= 1) { m.position.set(0, 0, -.5); this.setState('idle'); } }
      else if (this.mState === 'die') { const u = Math.min(1, st / .9); m.scale.setScalar(base * (1 - u) * (1 + Math.sin(u * 12) * .15)); m.rotation.y += dt * 10 * u; m.position.y = u * 1.5; if (u >= 1) this.despawn(); }
      else { m.scale.setScalar(base); }
      if (m.userData.update) m.userData.update(t, this.mState); }
    for (const b of this.bolts) { b.t += dt; const u = Math.min(1, b.t / b.dur); const e = u * u; b.s.position.set(b.x0 * (1 - e), .6 + Math.sin(u * Math.PI) * 2.2 + e * 1.2, 5.5 - e * 5.4); b.s.scale.setScalar((b.ok ? 1.1 : .7) * (1 + Math.sin(u * 20) * .08)); if (u > .1 && Math.random() < .6) this.sparks.burst(b.s.position, 1, b.ok ? 0x9ff6dd : 0x777788, { speed: .6, size: .22, life: .35, grav: 0 }); if (u >= 1) { this.scene.remove(b.s); b.done = true; if (b.onArrive) b.onArrive(); } }
    this.bolts = this.bolts.filter(b => !b.done); this.sparks.update(dt);
    this.shake = Math.max(0, this.shake - dt * 2.5); const s = this.shake * this.shake * .25; this.camera.position.set(this.camBase.x + rnd(-s, s) + Math.sin(t * .4) * .25, this.camBase.y + rnd(-s, s) + Math.sin(t * .6) * .1, this.camBase.z); this.camera.lookAt(0, 1.8, 0);
  }
  render(){ this.renderer.render(this.scene, this.camera); }
}
