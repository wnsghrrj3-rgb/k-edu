// K-MOTION POSE HERO · SceneManager / CharacterManager / AnimationManager / EffectManager (Three.js r185, 에셋 0 — 전부 절차적 스타일라이즈드)
// 캐릭터는 거울: 학생의 왼팔 = 화면 왼쪽(−x) 팔. rig 값(도)을 방향 벡터로 바꿔 관절에 입힌다(오일러 순서 문제 없음).
import * as THREE from 'three';
const DEG = Math.PI / 180, V = (x, y, z) => new THREE.Vector3(x, y, z), DOWN = V(0, -1, 0);
const rnd = (a, b) => a + Math.random() * (b - a);
let gradTex = null;
function toon(color, extra = {}){ if (!gradTex) { const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 230, 230, 230, 255, 255, 255, 255, 255]); gradTex = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); gradTex.minFilter = gradTex.magFilter = THREE.NearestFilter; gradTex.needsUpdate = true; }
  return new THREE.MeshToonMaterial(Object.assign({ color, gradientMap: gradTex }, extra)); }
function capsule(r, len, mat, seg = 10){ const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 5, seg), mat); m.castShadow = true; return m; }
// 관절: group 원점 = 관절, 메쉬는 -y 로 늘어뜨림. dir(월드 방향 벡터)로 향하게 한다.
class Joint { constructor(parent, pos, r, len, mat, tipR){ this.g = new THREE.Group(); this.g.position.copy(pos); parent.add(this.g); this.len = len;
    const m = capsule(r, len, mat); m.position.y = -len / 2; this.g.add(m); this.ball = new THREE.Mesh(new THREE.SphereGeometry(r * 1.15, 12, 10), mat); this.g.add(this.ball);
    if (tipR) { this.tip = new THREE.Mesh(new THREE.SphereGeometry(tipR, 12, 10), mat); this.tip.position.y = -len - r * .3; this.tip.castShadow = true; this.g.add(this.tip); }
    this.dir = DOWN.clone(); this.cur = DOWN.clone(); this.q = new THREE.Quaternion(); this.qp = new THREE.Quaternion(); }
  get tipPos(){ return this.g.localToWorld(V(0, -this.len, 0)); }
  // 월드 방향 → 로컬 쿼터니언(부모 회전 제거)
  apply(k){ this.cur.lerp(this.dir, k).normalize(); this.q.setFromUnitVectors(DOWN, this.cur); this.g.parent.getWorldQuaternion(this.qp); this.g.quaternion.copy(this.qp.invert().multiply(this.q)); }
}
const SKIN = 0xffd3b0, SUIT = 0x3b5bff, SUIT2 = 0xff4d6d, GLOVE = 0xffd23f, BOOT = 0xff4d6d, HAIR = 0x2b1d3a;

export class Character {
  constructor(scene, opt = {}){
    this.root = new THREE.Group(); scene.add(this.root); const r = this.root; this.scale = opt.scale || 1; r.scale.setScalar(this.scale);
    const suit = toon(opt.suit || SUIT), suit2 = toon(opt.suit2 || SUIT2), skin = toon(SKIN), glove = toon(opt.glove || GLOVE), boot = toon(opt.boot || BOOT);
    this.hips = new THREE.Group(); this.hips.position.y = 1.02; r.add(this.hips); this.hipsY = 1.02;
    const torso = capsule(.3, .5, suit, 14); torso.position.y = .42; torso.scale.set(1.15, 1, .78); this.hips.add(torso);
    const chest = capsule(.34, .18, suit, 14); chest.position.y = .62; chest.scale.set(1.2, .9, .8); this.hips.add(chest); this.chest = chest;
    const belt = new THREE.Mesh(new THREE.TorusGeometry(.31, .05, 8, 24), glove); belt.rotation.x = Math.PI / 2; belt.position.y = .1; belt.scale.set(1.1, 1, .8); this.hips.add(belt);
    const shorts = capsule(.3, .12, suit2, 14); shorts.position.y = .02; shorts.scale.set(1.12, .8, .8); this.hips.add(shorts);
    // 가슴 엠블럼(별)
    const star = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? .07 : .16; i ? star.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : star.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    const emblem = new THREE.Mesh(new THREE.ShapeGeometry(star), new THREE.MeshBasicMaterial({ color: opt.glove || GLOVE })); emblem.position.set(0, .62, .33); this.hips.add(emblem); this.emblem = emblem;
    // 망토
    const capeG = new THREE.PlaneGeometry(.78, 1.05, 6, 10); this.cape = new THREE.Mesh(capeG, new THREE.MeshToonMaterial({ color: opt.cape || SUIT2, gradientMap: gradTex, side: THREE.DoubleSide })); this.cape.position.set(0, .8, -.27); this.cape.castShadow = true; this.hips.add(this.cape); this.capeBase = capeG.attributes.position.array.slice();
    // 머리
    this.neck = new THREE.Group(); this.neck.position.y = .86; this.hips.add(this.neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.3, 20, 16), skin); head.position.y = .3; head.scale.set(1, 1.08, .95); head.castShadow = true; this.neck.add(head); this.head = head;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.31, 20, 16, 0, Math.PI * 2, 0, Math.PI * .5), toon(HAIR)); hair.position.y = .34; hair.scale.set(1.04, 1.04, 1); this.neck.add(hair);
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(.08, .28, 8), toon(HAIR)); tuft.position.set(.08, .66, .02); tuft.rotation.z = -.5; this.neck.add(tuft);
    const mask = new THREE.Mesh(new THREE.TorusGeometry(.29, .05, 8, 24, Math.PI), toon(opt.suit || SUIT)); mask.position.set(0, .33, .02); mask.rotation.set(Math.PI / 2, 0, 0); mask.scale.set(1, 1, .9); this.neck.add(mask);
    this.eyes = []; for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); e.position.set(sx * .11, .33, .25); e.scale.set(1, 1.3, .5); this.neck.add(e);
      const pu = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), new THREE.MeshBasicMaterial({ color: 0x1b1430 })); pu.position.set(sx * .11, .33, .29); this.neck.add(pu); this.eyes.push({ e, pu });
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), toon(0xff9aa8)); cheek.position.set(sx * .2, .24, .2); cheek.scale.set(1, .6, .5); this.neck.add(cheek); }
    this.mouth = new THREE.Mesh(new THREE.TorusGeometry(.07, .022, 6, 12, Math.PI), toon(0xc0392b)); this.mouth.position.set(0, .18, .27); this.mouth.rotation.set(0, 0, Math.PI); this.neck.add(this.mouth);
    // 팔(화면 왼쪽 = L = −x). 어깨 공
    this.arm = {}; for (const [k, sx] of [['L', -1], ['R', 1]]) { const sh = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 10), suit); sh.position.set(sx * .39, .7, 0); this.hips.add(sh);
      const up = new Joint(this.hips, V(sx * .42, .7, 0), .1, .4, suit); const fo = new Joint(up.g, V(0, -.4, 0), .085, .36, skin, .11); fo.tip.material = glove; fo.tip.scale.set(1.05, 1.1, 1); this.arm[k] = { up, fo, sx }; }
    // 다리
    this.leg = {}; for (const [k, sx] of [['L', -1], ['R', 1]]) { const th = new Joint(this.hips, V(sx * .17, 0, 0), .13, .42, suit2); const sh = new Joint(th.g, V(0, -.42, 0), .11, .4, suit); const bt = new THREE.Mesh(new THREE.BoxGeometry(.26, .16, .38), boot); bt.position.set(0, -.44, .06); bt.castShadow = true; sh.g.add(bt); this.leg[k] = { th, sh }; }
    this.rig = {}; this.target = {}; this.state = 'idle'; this.t = 0; this.k = .16; this.mood = 0; this.moodT = 0; this.face = 'smile'; this.bounce = 0; this.spin = 0;
    this.setRig({});
  }
  setRig(rig){ this.target = Object.assign({ raiseL: 8, raiseR: 8, fwdL: 0, fwdR: 0, elbowL: 10, elbowR: 10, crossL: 0, crossR: 0, hipL: 0, hipR: 0, lean: 0, squat: 0, chestUp: 0, tilt: 0 }, rig); }
  set(state){ if (this.state !== state) { this.state = state; this.t = 0; } }
  // 방향 벡터 계산: 위팔 = (sx·sinθ·cosφ, −cosθ, sinθ·sinφ), 아래팔 = 위팔을 굽힘 축 쪽으로 e° 회전
  armDirs(sx, raise, fwd, elbow, cross, hip){ const th = raise * DEG, ph = fwd * DEG, s = cross ? -sx : sx;
    const du = V(s * Math.sin(th) * Math.cos(ph), -Math.cos(th), Math.sin(th) * Math.sin(ph)).normalize();
    const b = hip ? V(-sx, -1, .4) : raise > 95 ? V(-sx, 0, .35) : V(-sx * (cross ? 1.2 : .35), -.15, 1); const bp = b.sub(du.clone().multiplyScalar(b.dot(du))).normalize();
    const e = elbow * DEG; const df = du.clone().multiplyScalar(Math.cos(e)).add(bp.multiplyScalar(Math.sin(e))).normalize(); return [du, df]; }
  update(dt, time){
    this.t += dt; const T = { ...this.target }; let hipDy = 0, hipRz = 0, headRz = 0, headRx = 0, k = this.k, chestS = 1;
    const st = this.state;
    if (st === 'idle') { T.raiseL += Math.sin(time * 1.6) * 3; T.raiseR += Math.sin(time * 1.6 + 1) * 3; hipDy = Math.sin(time * 2) * .012; }
    else if (st === 'success') { const u = Math.min(1, this.t / .7), j = Math.sin(u * Math.PI); hipDy = j * .32; T.raiseL = 160 + j * 20; T.raiseR = 160 + j * 20; T.elbowL = T.elbowR = 20; T.fwdL = T.fwdR = 10; T.squat = 0; T.lean = 0; k = .3; headRx = -.2 * j; if (this.t > .9) this.set('idle'); }
    else if (st === 'cheer') { const u = this.t; T.raiseL = 150 + Math.sin(u * 14) * 25; T.raiseR = 150 + Math.cos(u * 14) * 25; T.elbowL = T.elbowR = 30; hipDy = Math.abs(Math.sin(u * 7)) * .18; k = .35; if (this.t > 1.6) this.set('idle'); }
    else if (st === 'fail') { const u = Math.min(1, this.t / .6); T.raiseL = 40; T.raiseR = 40; T.fwdL = T.fwdR = 50; T.elbowL = T.elbowR = 100; headRz = .25 * Math.sin(u * Math.PI); T.squat = 0; if (this.t > .8) this.set('idle'); }
    else if (st === 'attack') { const u = Math.min(1, this.t / .5); T.raiseR = 95; T.fwdR = 85; T.elbowR = 10; T.raiseL = 60; T.fwdL = -20; T.elbowL = 90; hipDy = -.05; T.lean = 0; k = .4; chestS = 1 + .08 * Math.sin(u * Math.PI); if (this.t > .55) this.set('idle'); }
    else if (st === 'hurt') { const u = Math.min(1, this.t / .5); T.raiseL = T.raiseR = 70; T.fwdL = T.fwdR = 40; T.elbowL = T.elbowR = 60; hipRz = .15 * Math.sin(u * Math.PI); hipDy = -.08 * Math.sin(u * Math.PI); if (this.t > .6) this.set('idle'); }
    else if (st === 'pose') { hipDy = Math.sin(time * 2) * .006; }
    // 관절 적용
    for (const [kk, a] of Object.entries(this.arm)) { const [du, df] = this.armDirs(a.sx, T['raise' + kk], T['fwd' + kk], T['elbow' + kk], T['cross' + kk], T['hip' + kk]); a.up.dir.copy(du); a.fo.dir.copy(df); }
    const sq = T.squat; for (const l of Object.values(this.leg)) { const th = sq * 55 * DEG, shn = sq * 95 * DEG; l.th.dir.set(0, -Math.cos(th), Math.sin(th)); l.sh.dir.set(0, -Math.cos(th - shn), Math.sin(th - shn)); }
    this.hips.position.y += ((this.hipsY - sq * .34 + hipDy + (T.chestUp ? .02 : 0)) - this.hips.position.y) * .25;
    this.hips.rotation.z += ((-T.lean * DEG + hipRz) - this.hips.rotation.z) * .18; this.hips.rotation.x += ((sq * .25) - this.hips.rotation.x) * .2;
    this.neck.rotation.z += ((T.lean * .4 * DEG + headRz + T.tilt * DEG) - this.neck.rotation.z) * .2; this.neck.rotation.x += (headRx - this.neck.rotation.x) * .2;
    this.hips.updateMatrixWorld(); for (const a of Object.values(this.arm)) { a.up.apply(k); a.up.g.updateMatrixWorld(); a.fo.apply(k); } for (const l of Object.values(this.leg)) { l.th.apply(k); l.th.g.updateMatrixWorld(); l.sh.apply(k); }
    this.chest.scale.set(1.2 * chestS, .9, .8);
    // 표정
    const smile = this.face === 'smile' ? 1 : this.face === 'big' ? 1.6 : this.face === 'oh' ? -.6 : .6; this.mouth.scale.x += (Math.abs(smile) - this.mouth.scale.x) * .2; this.mouth.rotation.z += ((smile < 0 ? 0 : Math.PI) - this.mouth.rotation.z) * .25;
    const blink = (Math.sin(time * 1.3) > .985) ? .15 : 1; for (const e of this.eyes) { e.e.scale.y += (1.3 * blink - e.e.scale.y) * .5; e.pu.scale.setScalar(this.face === 'oh' ? 1.3 : 1); }
    // 망토 흔들림
    const pos = this.cape.geometry.attributes.position, base = this.capeBase; for (let i = 0; i < pos.count; i++) { const y = base[i * 3 + 1], x = base[i * 3]; const w = (0.525 - y) / 1.05; pos.array[i * 3 + 2] = -w * w * .35 + Math.sin(time * 3 + x * 4 + w * 5) * w * .06 - hipDy * w * .5; pos.array[i * 3] = x * (1 + w * .25); } pos.needsUpdate = true; this.cape.geometry.computeVertexNormals();
  }
  handPos(k){ return this.arm[k].fo.tipPos; }
}

// 보스: 떠다니는 그림자 왕(절차적)
export class Boss {
  constructor(scene){ this.root = new THREE.Group(); this.root.position.set(0, 1.9, -3.2); scene.add(this.root); const r = this.root;
    const body = toon(0x3a2a5f); this.body = new THREE.Mesh(new THREE.SphereGeometry(.95, 24, 18), body); this.body.castShadow = true; r.add(this.body);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(.55, .62, .3, 8, 1, true), toon(0xffc83f, { side: THREE.DoubleSide })); crown.position.y = .9; r.add(crown);
    for (let i = 0; i < 8; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(.1, .32, 6), toon(0xffc83f)); const a = i / 8 * Math.PI * 2; sp.position.set(Math.cos(a) * .58, 1.15, Math.sin(a) * .58); r.add(sp); }
    for (const sx of [-1, 1]) { const horn = new THREE.Mesh(new THREE.ConeGeometry(.16, .6, 8), toon(0x8d6cff)); horn.position.set(sx * .8, .55, 0); horn.rotation.z = -sx * .7; r.add(horn);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff3d6e })); eye.position.set(sx * .33, .18, .85); r.add(eye); const pu = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x1a0a2a })); pu.position.set(sx * .33, .18, .98); r.add(pu);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(.32, .07, .08), toon(0x1f1538)); brow.position.set(sx * .33, .38, .88); brow.rotation.z = sx * .35; r.add(brow); }
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(.3, .05, 6, 14, Math.PI), toon(0x1f1538)); mouth.position.set(0, -.25, .86); r.add(mouth); this.mouth = mouth;
    for (let i = 0; i < 5; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(.06, .18, 5), toon(0xffffff)); t.position.set(-.24 + i * .12, -.3, .9); t.rotation.x = Math.PI; r.add(t); }
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, .04, 8, 48), new THREE.MeshBasicMaterial({ color: 0xb388ff })); this.ring.rotation.x = Math.PI / 2 - .3; r.add(this.ring);
    this.orbs = []; for (let i = 0; i < 6; i++) { const o = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0x8d6cff })); r.add(o); this.orbs.push(o); }
    this.light = new THREE.PointLight(0xa070ff, 1.5, 7); this.light.position.set(0, 0, 1.5); r.add(this.light);
    this.state = 'idle'; this.t = 0; this.hp = 1; this.flash = 0; this.visible(false); }
  visible(v){ this.root.visible = v; }
  set(s){ this.state = s; this.t = 0; }
  update(dt, time){ this.t += dt; const r = this.root, st = this.state; let z = -3.2, y = 1.9, sc = 1, rz = 0;
    if (st === 'intro') { const u = Math.min(1, this.t / 1.4); y = 1.9 + (1 - u) * 3; sc = .3 + u * .7; if (this.t > 1.5) this.set('idle'); }
    else if (st === 'hit') { const u = Math.min(1, this.t / .4); z = -3.2 - Math.sin(u * Math.PI) * .9; sc = 1 - Math.sin(u * Math.PI) * .12; rz = Math.sin(u * 20) * .08 * (1 - u); if (this.t > .45) this.set('idle'); }
    else if (st === 'attack') { const u = Math.min(1, this.t / .9); z = -3.2 + Math.sin(u * Math.PI) * 2.4; y = 1.9 - Math.sin(u * Math.PI) * .6; sc = 1 + Math.sin(u * Math.PI) * .25; if (this.t > 1) this.set('idle'); }
    else if (st === 'die') { const u = Math.min(1, this.t / 1.6); sc = 1 - u; rz = u * 6; y = 1.9 + u * 1.2; if (u >= 1) this.visible(false); }
    else { y = 1.9 + Math.sin(time * 1.5) * .12; }
    r.position.y += (y - r.position.y) * .2; r.position.z += (z - r.position.z) * .3; r.scale.setScalar(r.scale.x + (sc - r.scale.x) * .3); r.rotation.z = rz;
    this.ring.rotation.z = time * .8; this.orbs.forEach((o, i) => { const a = time * 1.2 + i / 6 * Math.PI * 2; o.position.set(Math.cos(a) * 1.35, Math.sin(time * 2 + i) * .25, Math.sin(a) * 1.35 * .6); });
    this.flash = Math.max(0, this.flash - dt * 4); this.body.material.emissive.setRGB(this.flash, this.flash * .3, this.flash * .3); this.light.intensity = 1.5 + this.flash * 4 + (st === 'attack' ? 2 : 0); }
}

export class Effects {
  constructor(scene){ this.scene = scene; this.pool = []; const tex = Effects.tex();
    for (let i = 0; i < 160; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.visible = false; s.life = 0; scene.add(s); this.pool.push(s); }
    this.shots = []; }
  static tex(){ const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; }
  burst(p, n, { colors = [0xffd23f, 0xff4d6d, 0x4de1ff, 0x7cff6b], speed = 2.2, size = .22, life = .8, up = 1.2, grav = 3 } = {}){ let c = 0; for (const s of this.pool) { if (s.life > 0) continue; s.life = s.max = life * rnd(.7, 1.2); s.visible = true; s.position.copy(p); s.material.color.set(colors[(Math.random() * colors.length) | 0]); const a = Math.random() * Math.PI * 2, sp = speed * rnd(.4, 1); s.vx = Math.cos(a) * sp; s.vz = Math.sin(a) * sp * .6; s.vy = rnd(.3, 1) * up * speed; s.grav = grav; s.scale.setScalar(size * rnd(.7, 1.4)); s.material.opacity = 1; if (++c >= n) break; } }
  confetti(n = 60){ for (let i = 0; i < n; i++) this.burst(V(rnd(-2.5, 2.5), rnd(2.5, 4), rnd(-1, 1)), 1, { speed: .6, up: .2, grav: 1.2, life: 2.2, size: .14 }); }
  shoot(from, to, big, onHit){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.pool[0].material.map, color: big ? 0xffd23f : 0x4de1ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.position.copy(from); s.scale.setScalar(big ? .9 : .5); this.scene.add(s); const l = new THREE.PointLight(big ? 0xffd23f : 0x4de1ff, 2, 4); s.add(l); this.shots.push({ s, from: from.clone(), to: to.clone(), t: 0, big, onHit }); }
  update(dt){ for (const s of this.pool) { if (s.life <= 0) continue; s.life -= dt; if (s.life <= 0) { s.visible = false; continue; } s.vy -= s.grav * dt; s.position.x += s.vx * dt; s.position.y += s.vy * dt; s.position.z += s.vz * dt; s.material.opacity = Math.min(1, s.life / s.max * 1.6); }
    for (let i = this.shots.length - 1; i >= 0; i--) { const sh = this.shots[i]; sh.t += dt / .45; const u = Math.min(1, sh.t); sh.s.position.lerpVectors(sh.from, sh.to, u); sh.s.position.y += Math.sin(u * Math.PI) * .8; if (Math.random() < .8) this.burst(sh.s.position, 1, { speed: .3, up: .2, grav: 0, life: .35, size: sh.big ? .3 : .18, colors: [sh.big ? 0xffd23f : 0x4de1ff] });
      if (u >= 1) { this.scene.remove(sh.s); sh.s.material.dispose(); this.shots.splice(i, 1); sh.onHit && sh.onHit(); } } }
}

export class SceneManager {
  constructor(canvas, quality = 'high'){
    this.canvas = canvas; this.quality = quality; const low = quality === 'low';
    const R = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, alpha: false, powerPreference: 'high-performance' }); R.setPixelRatio(Math.min(low ? 1 : 1.5, devicePixelRatio)); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.ACESFilmicToneMapping; R.outputColorSpace = THREE.SRGBColorSpace;
    const S = this.scene = new THREE.Scene(); S.background = new THREE.Color(0x1a1040); S.fog = new THREE.Fog(0x1a1040, 9, 20);
    this.camera = new THREE.PerspectiveCamera(38, 1, .1, 60); this.camera.position.set(0, 1.9, 6.2); this.camera.lookAt(0, 1.25, 0); this.camBase = this.camera.position.clone(); this.shake = 0;
    S.add(new THREE.HemisphereLight(0xb9c8ff, 0x3a1f5f, .9)); const key = new THREE.DirectionalLight(0xfff4e0, 1.6); key.position.set(3, 6, 4); key.castShadow = true; key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048); key.shadow.camera.left = key.shadow.camera.bottom = -5; key.shadow.camera.right = key.shadow.camera.top = 5; key.shadow.camera.far = 20; key.shadow.bias = -.0005; S.add(key);
    this.rimL = new THREE.PointLight(0xff4d9d, 1.8, 12); this.rimL.position.set(-4, 3, -1); S.add(this.rimL); this.rimR = new THREE.PointLight(0x4de1ff, 1.8, 12); this.rimR.position.set(4, 3, -1); S.add(this.rimR);
    // 무대
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, .3, 48), toon(0x2a1f5a)); stage.position.y = -.15; stage.receiveShadow = true; S.add(stage);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.62, .06, 8, 64), new THREE.MeshBasicMaterial({ color: 0x8d6cff })); ring.rotation.x = Math.PI / 2; ring.position.y = .02; S.add(ring); this.ring = ring;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 48), new THREE.MeshStandardMaterial({ color: 0x120a2e, roughness: .9 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.3; floor.receiveShadow = true; S.add(floor);
    const grid = new THREE.GridHelper(28, 28, 0x5b3fb0, 0x3a2a7a); grid.position.y = -.29; grid.material.transparent = true; grid.material.opacity = .35; S.add(grid);
    // 배경 장식: 떠다니는 네온 고리·삼각형·구
    this.deco = []; const geos = [new THREE.TorusGeometry(.5, .05, 8, 32), new THREE.OctahedronGeometry(.4), new THREE.TorusKnotGeometry(.28, .09, 48, 8), new THREE.IcosahedronGeometry(.35)]; const cols = [0xff4d9d, 0x4de1ff, 0xffd23f, 0x7cff6b, 0xb388ff];
    for (let i = 0; i < (low ? 10 : 18); i++) { const m = new THREE.Mesh(geos[i % geos.length], new THREE.MeshBasicMaterial({ color: cols[i % cols.length], wireframe: i % 3 === 0, transparent: true, opacity: .55 })); const a = i / 18 * Math.PI * 2; m.position.set(Math.cos(a) * rnd(4.5, 8), rnd(.5, 5.5), Math.sin(a) * rnd(2, 6) - 4); m.userData = { a, r: Math.hypot(m.position.x, m.position.z + 4), y: m.position.y, s: rnd(.3, .9) }; S.add(m); this.deco.push(m); }
    // 조명 빔
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.ConeGeometry(1.1, 7, 16, 1, true), new THREE.MeshBasicMaterial({ color: cols[i], transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false })); b.position.set(-4.5 + i * 3, 3.5, -3.5); b.rotation.x = .3; b.userData = { i }; S.add(b); this.deco.push(b); }
    this.character = new Character(S); this.boss = new Boss(S); this.fx = new Effects(S); this.time = 0; this.beat = 0;
    this.resize(); addEventListener('resize', () => this.resize());
  }
  resize(){ const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); const wide = w / h; this.camera.position.z = wide > 1.5 ? 6.2 : 6.2 + (1.5 - wide) * 4; this.camBase.copy(this.camera.position); }
  pulse(){ this.beat = 1; }
  render(dt){ this.time += dt; const t = this.time; this.character.update(dt, t); this.boss.update(dt, t); this.fx.update(dt);
    for (const m of this.deco) { const u = m.userData; if (u.i !== undefined) { m.rotation.z = Math.sin(t * .4 + u.i) * .25; m.material.opacity = .05 + .04 * Math.sin(t * 2 + u.i) + this.beat * .05; } else { const a = u.a + t * .08 * u.s; m.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * u.s * 2) * .3, Math.sin(a) * u.r * .55 - 4); m.rotation.x += dt * u.s; m.rotation.y += dt * u.s * .7; } }
    this.beat = Math.max(0, this.beat - dt * 3); this.ring.material.color.setHSL((t * .1) % 1, .8, .6 + this.beat * .3); this.rimL.intensity = 1.8 + this.beat * 2; this.rimR.intensity = 1.8 + this.beat * 2;
    this.shake = Math.max(0, this.shake - dt * 2.5); const s = this.shake * .12; this.camera.position.set(this.camBase.x + (Math.random() - .5) * s, this.camBase.y + (Math.random() - .5) * s, this.camBase.z); this.camera.lookAt(0, 1.25, 0);
    this.renderer.render(this.scene, this.camera); }
}
