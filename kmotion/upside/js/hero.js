// K-MOTION 거꾸로 나라 · 탐험대원 캐릭터(3D 관절형)
// 모자·스카프·배낭(빛나는 마법 수정) 차림의 꼬마 탐험대원. 어깨·팔꿈치·고개·몸통·다리 관절을 따로 움직인다.
// 학생 포즈로 팔 관절을 직접 돌리는 「조종」과, 걷기·환호·어지러움 같은 「자동 동작」을 부드럽게 섞는다.
import * as THREE from 'three';

const C = { skin: 0xffcfae, cheek: 0xff8f86, hair: 0x5a3420, jacket: 0x23b5a6, jacket2: 0x168d82, pants: 0x3d4f8f, boot: 0x7a4a2a, hat: 0xf6c443, band: 0xe8505b, scarf: 0xff7a45, pack: 0xc98a3c, crystal: 0x8fe8ff };
const lerp = (a, b, k) => a + (b - a) * k;
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const angDamp = (a, b, k, dt) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * (1 - Math.exp(-k * dt)); };

function mat(color, o){ return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .62, metalness: 0 }, o || {})); }
function mesh(geo, m, parent, pos, scl){ const x = new THREE.Mesh(geo, m); if (pos) x.position.set(...pos); if (scl) x.scale.set(...scl); x.castShadow = true; x.receiveShadow = false; if (parent) parent.add(x); return x; }
function limb(r, len, m, parent){ const g = new THREE.Group(); const c = mesh(new THREE.CapsuleGeometry(r, len, 6, 14), m, g, [0, -len / 2 - r * .3, 0]); g.userData.len = len; parent.add(g); return g; }

export class Hero {
  constructor(opts = {}){
    this.ghost = !!opts.ghost;
    const g = this.root = new THREE.Group(); g.name = 'hero';
    const body = this.body = new THREE.Group(); g.add(body);
    const hips = this.hips = new THREE.Group(); hips.position.y = .58; body.add(hips);
    const M = this.M = { skin: mat(C.skin, { roughness: .55 }), cheek: mat(C.cheek, { roughness: 1 }), hair: mat(C.hair, { roughness: .85 }), jacket: mat(C.jacket, { roughness: .7 }), jacket2: mat(C.jacket2),
      pants: mat(C.pants, { roughness: .8 }), boot: mat(C.boot, { roughness: .55 }), hat: mat(C.hat, { roughness: .5 }), band: mat(C.band), scarf: mat(C.scarf, { roughness: .8 }), pack: mat(C.pack, { roughness: .7 }),
      crystal: mat(C.crystal, { emissive: 0x3fd0ff, emissiveIntensity: 1.6, roughness: .15, metalness: .1 }), dark: mat(0x1d1a22, { roughness: .3 }), white: mat(0xffffff, { roughness: .2 }), gold: mat(0xffd35a, { metalness: .6, roughness: .3, emissive: 0x6b4a00, emissiveIntensity: .4 }) };
    // 몸통(재킷)
    const torso = mesh(new THREE.CapsuleGeometry(.26, .26, 8, 18), M.jacket, hips, [0, .3, 0], [1.08, 1, .86]);
    mesh(new THREE.CylinderGeometry(.285, .3, .07, 24), M.boot, hips, [0, .12, 0], [1.05, 1, .88]); // 허리띠
    mesh(new THREE.BoxGeometry(.08, .06, .04), M.gold, hips, [0, .12, .26]);
    for (let i = 0; i < 2; i++) mesh(new THREE.SphereGeometry(.025, 10, 8), M.gold, hips, [0, .26 + i * .1, .245]);
    mesh(new THREE.CapsuleGeometry(.25, .06, 6, 16), M.pants, hips, [0, .02, 0], [1.06, .9, .86]);
    // 배낭 + 마법 수정(뒷모습에서 잘 보이게)
    const pack = this.pack = new THREE.Group(); pack.position.set(0, .32, -.25); hips.add(pack);
    mesh(new THREE.BoxGeometry(.4, .42, .2, 2, 2, 2), M.pack, pack); mesh(new THREE.BoxGeometry(.42, .14, .22), mat(0xa86f2c), pack, [0, .16, 0]);
    mesh(new THREE.BoxGeometry(.24, .14, .06), mat(0xa86f2c), pack, [0, -.07, -.12]);
    const cry = this.crystal = mesh(new THREE.OctahedronGeometry(.11, 0), M.crystal, pack, [0, .34, -.02], [1, 1.6, 1]);
    this.crystalLight = new THREE.PointLight(0x7fdcff, this.ghost ? 0 : 1.2, 2.2, 2); this.crystalLight.position.set(0, .35, -.1); pack.add(this.crystalLight);
    // 스카프
    const scarf = this.scarf = new THREE.Group(); scarf.position.set(0, .56, 0); hips.add(scarf);
    mesh(new THREE.TorusGeometry(.2, .065, 10, 24), M.scarf, scarf, [0, 0, 0]).rotation.x = Math.PI / 2;
    this.tail = []; let parent = scarf; for (let i = 0; i < 3; i++) { const s = new THREE.Group(); s.position.set(i ? 0 : .1, i ? -.12 : -.02, i ? -.01 : -.2); parent.add(s); mesh(new THREE.BoxGeometry(.12, .14, .03), M.scarf, s, [0, -.06, 0]); this.tail.push(s); parent = s; }
    // 머리(크게 — 아이 비율)
    const head = this.head = new THREE.Group(); head.position.y = .62; hips.add(head);
    mesh(new THREE.SphereGeometry(.4, 32, 24), M.skin, head, [0, .36, 0], [1, .96, .95]);
    const hairCap = mesh(new THREE.SphereGeometry(.415, 32, 20, 0, Math.PI * 2, 0, Math.PI * .52), M.hair, head, [0, .38, -.02]); hairCap.rotation.x = -.32;
    for (const sx of [-1, 1]) mesh(new THREE.SphereGeometry(.14, 14, 10), M.hair, head, [sx * .3, .3, -.12], [1, 1.3, 1]);
    mesh(new THREE.SphereGeometry(.17, 16, 12), M.hair, head, [0, .32, -.3], [1.6, 1.2, .8]); // 뒷머리
    for (const sx of [-1, 1]) mesh(new THREE.SphereGeometry(.075, 12, 10), M.skin, head, [sx * .395, .33, 0], [.6, 1, .8]); // 귀
    // 얼굴
    const face = this.faceG = new THREE.Group(); face.position.set(0, .34, .33); head.add(face);
    this.eyes = []; for (const sx of [-1, 1]) { const e = new THREE.Group(); e.position.set(sx * .14, .02, .02); face.add(e);
      mesh(new THREE.SphereGeometry(.085, 16, 12), M.white, e, [0, 0, 0], [1, 1.15, .5]);
      mesh(new THREE.SphereGeometry(.058, 16, 12), M.dark, e, [0, -.005, .03], [1, 1.15, .5]);
      mesh(new THREE.SphereGeometry(.02, 8, 6), M.white, e, [.022, .03, .06]);
      const brow = mesh(new THREE.BoxGeometry(.1, .022, .02), M.hair, e, [0, .12, .03]); e.userData.brow = brow; this.eyes.push(e); }
    for (const sx of [-1, 1]) mesh(new THREE.SphereGeometry(.06, 12, 8), M.cheek, face, [sx * .24, -.1, -.02], [1, .55, .4]);
    mesh(new THREE.SphereGeometry(.035, 10, 8), M.skin, face, [0, -.05, .04]); // 코
    const smile = this.smile = mesh(new THREE.TorusGeometry(.07, .016, 8, 20, Math.PI), M.dark, face, [0, -.13, .01]); smile.rotation.z = Math.PI;
    const open = this.mouthOpen = mesh(new THREE.SphereGeometry(.06, 14, 10), mat(0x9a2d3a), face, [0, -.15, 0], [1, .9, .4]); open.visible = false;
    // 탐험 모자
    const hat = this.hat = new THREE.Group(); hat.position.set(0, .66, -.02); hat.rotation.x = -.12; head.add(hat);
    mesh(new THREE.CylinderGeometry(.56, .58, .04, 32), M.hat, hat, [0, 0, 0]);
    mesh(new THREE.CylinderGeometry(.3, .36, .26, 28), M.hat, hat, [0, .14, 0]);
    mesh(new THREE.CylinderGeometry(.362, .362, .07, 28), M.band, hat, [0, .05, 0]);
    const star = mesh(starGeo(.08, .035, .03), M.gold, hat, [0, .07, .36]);
    star.rotation.x = 0; this.star = star;
    // 팔: 어깨 → 위팔 → 팔꿈치 → 아래팔 → 장갑
    this.arm = {}; for (const [k, sx] of [['L', -1], ['R', 1]]) {
      const sh = new THREE.Group(); sh.position.set(sx * .34, .46, 0); hips.add(sh);
      mesh(new THREE.SphereGeometry(.105, 14, 10), M.jacket, sh);
      const up = limb(.085, .17, M.jacket, sh);
      const el = new THREE.Group(); el.position.y = -.3; up.add(el); mesh(new THREE.SphereGeometry(.08, 12, 8), M.jacket2, el);
      const fo = limb(.075, .15, M.jacket2, el);
      mesh(new THREE.TorusGeometry(.075, .025, 8, 16), M.jacket, fo, [0, -.22, 0]).rotation.x = Math.PI / 2;
      const hand = mesh(new THREE.SphereGeometry(.095, 16, 12), M.skin, fo, [0, -.32, 0], [1, 1.1, .9]);
      mesh(new THREE.SphereGeometry(.04, 10, 8), M.skin, hand, [sx * -.07, .03, .03]); // 엄지
      this.arm[k] = { sh, up, el, fo, hand, sx };
    }
    // 다리
    this.leg = {}; for (const [k, sx] of [['L', -1], ['R', 1]]) {
      const hp = new THREE.Group(); hp.position.set(sx * .13, 0, 0); hips.add(hp);
      const th = limb(.1, .14, M.pants, hp);
      const kn = new THREE.Group(); kn.position.y = -.27; th.add(kn);
      const sn = limb(.09, .08, M.pants, kn);
      const boot = mesh(new THREE.CapsuleGeometry(.11, .1, 6, 12), M.boot, sn, [0, -.2, .05], [1, .8, 1.25]); boot.rotation.x = Math.PI / 2;
      mesh(new THREE.CylinderGeometry(.11, .11, .06, 14), mat(0x5c361d), sn, [0, -.14, 0]);
      this.leg[k] = { hp, th, kn, sn };
    }
    if (this.ghost) this.root.traverse(o => { if (o.isMesh) { o.material = new THREE.MeshStandardMaterial({ color: 0xbff4ff, emissive: 0x58c8ff, emissiveIntensity: .9, transparent: true, opacity: .55, depthWrite: false, roughness: .3 }); o.castShadow = false; } });
    // 상태
    this.state = 'idle'; this.t = 0; this.stateT = 0; this.phase = 0;
    this.yaw = Math.PI; this.yawT = Math.PI; this.facing = 'back'; this.scaleCur = 1; this.scaleT = 1; this.spin = 0; this.spinV = 0;
    this.drive = null; this.driveW = 0; this.tiltT = 0; this.tilt = 0;
    this.cur = this.zero(); this.mood = 'smile'; this.moodT = 0; this.blinkT = 2;
  }
  zero(){ return { lu: -.12, lf: .15, ru: .12, rf: -.15, lux: 0, rux: 0, lfx: -.3, rfx: -.3, lL: 0, lR: 0, kL: 0, kR: 0, hipY: 0, hipRX: 0, hipRZ: 0, headRX: 0, headRY: 0 }; }
  // 바라보는 방향: 'back' = 카메라 반대쪽(뒷모습), 'front' = 카메라 쪽, 'right'/'left' = 화면 기준 옆
  face(dir){ this.yawT = { back: Math.PI, front: 0, right: Math.PI / 2, left: -Math.PI / 2 }[dir] ?? Math.PI; this.facing = dir; return this; }
  faceNow(dir){ this.face(dir); this.yaw = this.yawT; this.root.rotation.y = this.yaw; return this; }
  set(state){ if (this.state !== state) { this.state = state; this.stateT = 0; } return this; }
  setMood(m, sec){ this.mood = m; this.moodT = sec || 0; return this; }
  setScale(s){ this.scaleT = s; return this; }
  // 화면 기준 팔 방향으로 조종(cmd.sl / cmd.sr = 화면 왼쪽·오른쪽 팔의 {u,f} 단위벡터, y 아래가 +)
  setDrive(cmd){ this.drive = cmd; return this; }
  spinOnce(){ this.spinV = Math.PI * 6; this.setMood('dizzy', 1.4); return this; }

  update(dt){
    this.t += dt; this.stateT += dt; const P = this.zero(), st = this.state;
    let k = 12;
    if (st === 'walk' || st === 'run') { const sp = st === 'run' ? 13 : 8.5; this.phase += dt * sp; const s = Math.sin(this.phase), c = Math.cos(this.phase);
      P.lL = s * .75; P.lR = -s * .75; P.kL = Math.max(0, -c) * 1.1; P.kR = Math.max(0, c) * 1.1; P.lux = -s * .7; P.rux = s * .7; P.lfx = -.7; P.rfx = -.7; P.hipY = Math.abs(c) * .05; P.hipRX = .1; }
    else if (st === 'idle') { const b = Math.sin(this.t * 2.2); P.hipY = b * .012; P.lu = -.14 - b * .03; P.ru = .14 + b * .03; P.headRX = Math.sin(this.t * 1.1) * .04; }
    else if (st === 'cheer') { const b = Math.abs(Math.sin(this.stateT * 7)); P.hipY = b * .22; P.lu = -2.6; P.ru = 2.6; P.lf = -.3; P.rf = .3; P.kL = P.kR = b * .7; P.lL = P.lR = -b * .35; P.headRX = -.2; k = 14; }
    else if (st === 'push') { P.hipRX = .45; P.lux = -1.4; P.rux = -1.4; P.lfx = -.2; P.rfx = -.2; this.phase += dt * 6; const s = Math.sin(this.phase); P.lL = s * .5 - .2; P.lR = -s * .5 - .2; P.kL = P.kR = .6; }
    else if (st === 'reach') { P.lu = -2.9; P.ru = 2.9; P.lf = 0; P.rf = 0; P.hipY = .06; P.headRX = -.35; }
    else if (st === 'float') { const b = Math.sin(this.t * 3); P.lu = -1.2 + b * .2; P.ru = 1.2 - b * .2; P.lL = -.3; P.lR = .2; P.kL = .6; P.kR = .3; P.hipY = b * .04; }
    else if (st === 'bonk') { const u = Math.min(1, this.stateT / .5); P.hipRX = -.4 * (1 - u); P.lu = -1.2 * (1 - u) - .12; P.ru = 1.2 * (1 - u) + .12; P.headRX = .3 * (1 - u); if (this.stateT > .6) this.set('idle'); }
    else if (st === 'sit') { P.lL = -1.4; P.lR = -1.4; P.kL = 1.4; P.kR = 1.4; P.hipY = -.25; }
    // 포즈 조종을 섞기(팔·고개). 옆모습일 땐 조종하지 않음
    const d = this.drive, wantDrive = d && (this.facing === 'back' || this.facing === 'front');
    this.driveW = damp(this.driveW, wantDrive ? 1 : 0, 8, dt);
    if (d && this.driveW > .01) { const sg = this.facing === 'front' ? 1 : -1, w = this.driveW;
      const ang = v => sg * Math.atan2(v.x, v.y);
      // 팔 L 은 로컬 -x 쪽. 앞모습(yaw 0)이면 화면 왼쪽, 뒷모습(yaw π)이면 화면 오른쪽에 온다
      const A = this.facing === 'front' ? { L: d.sl, R: d.sr } : { L: d.sr, R: d.sl };
      const lu = ang(A.L.u), lf = ang(A.L.f) - lu, ru = ang(A.R.u), rf = ang(A.R.f) - ru;
      P.lu = lerp(P.lu, lu, w); P.lf = lerp(P.lf, lf, w); P.ru = lerp(P.ru, ru, w); P.rf = lerp(P.rf, rf, w);
      P.lux = lerp(P.lux, 0, w); P.rux = lerp(P.rux, 0, w); P.lfx = lerp(P.lfx, -.15, w); P.rfx = lerp(P.rfx, -.15, w);
      if (d.tilt != null) this.tiltT = (this.facing === 'front' ? -1 : 1) * d.tilt * .45; }
    else this.tiltT = 0;
    const Cc = this.cur, a = 1 - Math.exp(-dt * k); for (const key in Cc) Cc[key] += (P[key] - Cc[key]) * a;
    // 적용
    const A = this.arm;
    A.L.up.rotation.set(Cc.lux, 0, Cc.lu); A.L.el.rotation.set(Cc.lfx, 0, Cc.lf);
    A.R.up.rotation.set(Cc.rux, 0, Cc.ru); A.R.el.rotation.set(Cc.rfx, 0, Cc.rf);
    this.leg.L.th.rotation.x = -Cc.lL; this.leg.R.th.rotation.x = -Cc.lR; this.leg.L.kn.rotation.x = Cc.kL; this.leg.R.kn.rotation.x = Cc.kR;
    this.hips.position.y = .58 + Cc.hipY; this.hips.rotation.x = Cc.hipRX;
    this.tilt = damp(this.tilt, this.tiltT, 10, dt);
    this.head.rotation.set(Cc.headRX, Cc.headRY, this.tilt);
    // 스카프 꼬리 흔들림
    this.tail.forEach((s, i) => { s.rotation.x = .25 + Math.sin(this.t * 4 + i) * .18 + (st === 'walk' || st === 'run' || st === 'float' ? .5 : 0); s.rotation.z = Math.sin(this.t * 3.1 + i * .7) * .15; });
    // 수정 반짝
    this.crystal.rotation.y += dt * 1.6; if (!this.ghost) this.crystalLight.intensity = 1 + Math.sin(this.t * 4) * .35; this.star.rotation.z = Math.sin(this.t * 2) * .2;
    // 방향·크기·회전
    this.yaw = angDamp(this.yaw, this.yawT, 7, dt);
    if (this.spinV > 0) { const s = Math.min(this.spinV, dt * 18); this.spin += s; this.spinV -= s; } else this.spin = angDamp(this.spin, 0, 8, dt);
    this.root.rotation.y = this.yaw + this.spin;
    const prev = this.scaleCur; this.scaleCur = damp(this.scaleCur, this.scaleT, 6, dt);
    const wob = Math.abs(this.scaleCur - prev) / Math.max(dt, 1e-3) * .04; // 크기 바뀔 때 말랑한 출렁임
    this.body.scale.set(this.scaleCur * (1 + wob), this.scaleCur * (1 - wob * .6), this.scaleCur * (1 + wob));
    // 표정
    if (this.moodT > 0) { this.moodT -= dt; if (this.moodT <= 0) this.mood = 'smile'; }
    this.blinkT -= dt; let blink = 1; if (this.blinkT < 0) { blink = Math.max(.1, Math.abs(this.blinkT + .08) / .08); if (this.blinkT < -.16) this.blinkT = 2 + Math.random() * 3; }
    const m = this.mood; this.smile.visible = m === 'smile' || m === 'proud'; this.mouthOpen.visible = m === 'wow' || m === 'dizzy' || m === 'cheer';
    this.mouthOpen.scale.set(1, m === 'cheer' ? 1.2 : .9, .4);
    this.eyes.forEach((e, i) => { const sy = m === 'dizzy' ? .35 + Math.abs(Math.sin(this.t * 12 + i)) * .5 : m === 'proud' ? .45 : 1; e.scale.set(1, sy * blink, 1);
      e.userData.brow.rotation.z = (m === 'wow' ? .25 : m === 'determined' ? -.3 : 0) * (i ? -1 : 1); e.userData.brow.position.y = m === 'wow' ? .15 : .12; });
  }
  // 팔꿈치(손) 위치 — 별 잡기 판정용(월드 좌표)
  handWorld(side, out){ const h = this.arm[side].hand; return h.getWorldPosition(out || new THREE.Vector3()); }
  dispose(){ this.root.traverse(o => { if (o.isMesh) { o.geometry.dispose(); } }); }
}

export function starGeo(R, r, depth){ const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? r : R; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: depth * .4, bevelSize: depth * .35, bevelSegments: 2 }); g.center(); return g; }
