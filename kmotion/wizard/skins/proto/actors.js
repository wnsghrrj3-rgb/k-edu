// proto 스킨 — 절차적 배우(캐릭터·슬라임·수정). 판정 크기는 시스템 값이고, 여기선 보이는 모습만
// 좌표: 계약은 +X = 화면 오른쪽. Three(오른손 좌표계)에서 +Z 를 바라보면 화면 오른쪽이 −X 라서 스킨은 x 를 뒤집어 놓는다(WX)
export const WX = x => -x;
import * as THREE from 'three';
const grad = (() => { const d = new Uint8Array([70, 150, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
export const toon = (color, extra = {}) => new THREE.MeshToonMaterial(Object.assign({ color, gradientMap: grad }, extra));
const outlineMat = new THREE.MeshBasicMaterial({ color: 0x14121f, side: THREE.BackSide });
function withOutline(mesh, k = 1.06){ const o = new THREE.Mesh(mesh.geometry, outlineMat); o.scale.setScalar(k); mesh.add(o); return mesh; }
export function textSprite(text, { size = 128, color = '#fff', stroke = '#1b1630', font = '900 88px Pretendard, system-ui, sans-serif', scale = .5 } = {}){
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  const draw = s => { g.clearRect(0, 0, size, size); g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 12; g.strokeStyle = stroke; g.strokeText(s, size / 2, size / 2 + 4); g.fillStyle = color; g.fillText(s, size / 2, size / 2 + 4); };
  draw(text); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); sp.scale.setScalar(scale); sp.renderOrder = 10;
  sp.userData.set = s => { draw(s); tex.needsUpdate = true; }; return sp;
}
const CHAR = { luna: { main: 0x2b2f6b, sub: 0xffd45c, tip: 'star' }, tori: { main: 0x8a5a2b, sub: 0x6bbf59, tip: 'acorn' }, haru: { main: 0x6ec6ff, sub: 0xf4f8ff, tip: 'ring' } };
export function makePlayer(id = 'luna'){
  const c = CHAR[id] || CHAR.luna, g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const skin = toon(0xffd9b8), main = toon(c.main), sub = toon(c.sub);
  const robe = withOutline(new THREE.Mesh(new THREE.ConeGeometry(.36, .78, 18), main)); robe.position.y = .42; robe.castShadow = true; body.add(robe);
  const head = withOutline(new THREE.Mesh(new THREE.SphereGeometry(.26, 22, 16), skin)); head.position.y = .98; head.castShadow = true; body.add(head);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x1b1630 }); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), eyeM); e.position.set(s * .09, 1.0, .23); body.add(e); }
  const hat = withOutline(new THREE.Mesh(id === 'tori' ? new THREE.SphereGeometry(.28, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2) : new THREE.ConeGeometry(.3, id === 'luna' ? .55 : .3, 18), id === 'tori' ? sub : main));
  hat.position.y = id === 'tori' ? 1.08 : 1.28; hat.castShadow = true; body.add(hat);
  const brim = new THREE.Mesh(new THREE.TorusGeometry(.29, .04, 6, 24), sub); brim.rotation.x = Math.PI / 2; brim.position.y = 1.08; body.add(brim);
  // 팔: 어깨 피벗(오른팔에 지팡이). 캐릭터는 카메라를 등지고 적(+Z)을 봄 → 오른팔은 화면 오른쪽(+X)
  const arm = side => { const piv = new THREE.Group(); piv.position.set(side * .27, .72, 0); const a = new THREE.Mesh(new THREE.CapsuleGeometry(.06, .3, 4, 8), main); a.position.y = -.2; piv.add(a);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.065, 10, 8), skin); hand.position.y = -.4; piv.add(hand); body.add(piv); return piv; };
  const armL = arm(1), armR = arm(-1);   // 앞(+Z)을 보는 몸의 오른쪽 = −X = 화면 오른쪽
  const staff = new THREE.Group(); const rod = new THREE.Mesh(new THREE.CylinderGeometry(.025, .03, .95, 8), toon(0x7a5230)); rod.position.y = .1; staff.add(rod);
  const tip = new THREE.Mesh(c.tip === 'ring' ? new THREE.TorusGeometry(.09, .03, 8, 16) : c.tip === 'acorn' ? new THREE.SphereGeometry(.08, 10, 8) : new THREE.OctahedronGeometry(.1), new THREE.MeshBasicMaterial({ color: c.sub }));
  tip.position.y = .62; staff.add(tip); staff.position.set(0, -.42, 0); staff.rotation.x = -.3; armR.add(staff);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.35, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })); orb.visible = false; tip.add(orb);
  const shield = new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 16), new THREE.MeshBasicMaterial({ color: 0xb28cff, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false })); shield.position.y = .7; shield.visible = false; g.add(shield);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.42, .5, 32), new THREE.MeshBasicMaterial({ color: c.sub, transparent: true, opacity: .55, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = .02; g.add(ring);
  g.userData = { body, head, armL, armR, staff, tip, orb, shield, robe, mats: [main, skin, sub], flash: 0 };
  g.rotation.y = 0; return g;
}
const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
const lerpA = (o, k, v) => o + (v - o) * k;
export function posePlayer(g, P, dt, timing){
  const u = g.userData, a = P.anim, k = 1 - Math.exp(-dt / .05), t = performance.now() / 1000;
  g.position.set(WX(P.pos[0]), P.pos[1], P.pos[2]);
  // 하체 층
  let bob = Math.sin(t * 2.6) * .015, lean = 0, sy = 1, tilt = 0, yUp = 0;
  if (a.lower === 'A04') { bob = Math.abs(Math.sin(a.phase * Math.PI * 2)) * .06; lean = Math.sign(P.vel[0]) * .14; }
  if (a.lower === 'A06') { sy = .72; }
  if (a.lower === 'A05') { lean = Math.sign(P.vel[0] || 1) * .35; }
  if (a.lower === 'A12') { tilt = -.35 * (1 - a.phase); }
  if (a.lower === 'A14') { yUp = Math.sin(Math.min(1, a.phase * 2) * Math.PI) * .5; }
  if (a.lower === 'A15') { tilt = -1.2 * ease(a.phase * 1.5); sy = 1 - .2 * ease(a.phase); }
  u.body.position.y = lerpA(u.body.position.y, k, bob + yUp); u.body.scale.y = lerpA(u.body.scale.y, k, sy); u.body.rotation.z = lerpA(u.body.rotation.z, k, lean); u.body.rotation.x = lerpA(u.body.rotation.x, k, tilt);
  // 상체 층 — 시간은 시스템(anim-timing.json) 마커에 맞춤(13 문서 4절)
  let rR = { x: .2, z: -.15 }, rL = { x: .1, z: .2 }; const up = a.upper, ph = a.upperPhase;
  if (up === 'A07' || up === 'A08') { const T = timing[up], f = T.marks.fire / T.duration; const kk = ph < f ? ease(ph / f) : 1 - ease((ph - f) / (1 - f)); rR = { x: -1.5 * kk + .2 * (1 - kk), z: -.15 }; }
  if (up === 'A09') { rR = { x: -2.9, z: .35 }; rL = { x: -2.9, z: -.35 }; }
  if (up === 'A10') { const f = timing.A10.marks.fire / timing.A10.duration, kk = ph < f ? ph / f : 1; rR = { x: -2.9 + 1.6 * ease(kk), z: .2 }; rL = { x: -2.9 + 1.6 * ease(kk), z: -.2 }; }
  if (up === 'A11') { rR = { x: -1.2, z: .9 }; rL = { x: -1.2, z: -.9 }; }
  if (a.lower === 'A14') { rR = { x: -2.8, z: -.3 }; rL = { x: -2.8, z: .3 }; }
  const kk = 1 - Math.exp(-dt / (up ? .03 : .12));
  u.armR.rotation.x = lerpA(u.armR.rotation.x, kk, rR.x); u.armR.rotation.z = lerpA(u.armR.rotation.z, kk, rR.z); u.armL.rotation.x = lerpA(u.armL.rotation.x, kk, rL.x); u.armL.rotation.z = lerpA(u.armL.rotation.z, kk, rL.z);
  u.orb.visible = !!P.charging; if (P.charging) u.orb.scale.setScalar(.15 + P.charging.ratio * .85 + Math.sin(t * 20) * .05);
  u.shield.visible = P.blocking; u.tip.rotation.y += dt * 2;
  u.flash = Math.max(0, u.flash - dt * 4); const fl = u.flash > 0 ? 1 : 0; for (const m of u.mats) m.emissive && m.emissive.setRGB(fl * .8, fl * .1, fl * .1);
  g.visible = !(P.invuln && Math.floor(t * 18) % 2 === 0 && a.lower !== 'A05');
}
export function tipWorld(g, out){ return g.userData.tip.getWorldPosition(out); }

export function makeSlime(e){
  const g = new THREE.Group(); const hue = new THREE.Color().setHSL((parseInt(e.label || '1', 10) * .11) % 1, .65, .6);
  const jelly = new THREE.Mesh(new THREE.SphereGeometry(.45, 24, 16), new THREE.MeshToonMaterial({ color: hue, gradientMap: grad, transparent: true, opacity: .82 })); jelly.position.y = .4; jelly.scale.set(1, .85, 1); jelly.castShadow = true; g.add(jelly);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.16, 0), new THREE.MeshBasicMaterial({ color: 0xfff3c4 })); core.position.y = .38; g.add(core);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x1b1630 }); for (const s of [-1, 1]) { const ey = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), eyeM); ey.position.set(s * .14, .52, .37); g.add(ey); }
  const num = textSprite(e.label || '', { scale: .55 }); num.position.y = 1.15; g.add(num);
  const bar = new THREE.Group(); const bg = new THREE.Mesh(new THREE.PlaneGeometry(.7, .08), new THREE.MeshBasicMaterial({ color: 0x1b1630, depthTest: false, transparent: true, opacity: .7 })); const fg = new THREE.Mesh(new THREE.PlaneGeometry(.7, .08), new THREE.MeshBasicMaterial({ color: 0x5cf29a, depthTest: false }));
  fg.position.z = .001; bg.renderOrder = fg.renderOrder = 11; bar.add(bg, fg); bar.position.y = .92; g.add(bar);
  g.userData = { jelly, core, num, bar, fg, flash: 0, mat: jelly.material, hue, lunge: 0 };
  return g;
}
export function poseSlime(g, e, dt, cam, gameT){
  const u = g.userData, t = performance.now() / 1000; g.position.set(WX(e.pos[0]), 0, e.pos[2]); g.rotation.y = -e.yaw;
  let sx = 1, sy = .85, y = .4, op = .82, sc = 1;
  if (e.state === 'spawn') { sc = Math.min(1, e.stateT / .6); y = .4 * sc; }
  else if (e.state === 'chase' || e.state === 'recover') { const b = Math.abs(Math.sin(t * 6 + e.uid)); y = .4 + b * .12; sy = .85 + b * .1; sx = 1 - b * .05; }
  else if (e.state === 'windup' && e.telegraph) { const k = Math.min(1, (gameT - e.telegraph.t0) / (e.telegraph.t1 - e.telegraph.t0)); sy = .85 - k * .25; sx = 1 + k * .18; }
  else if (e.state === 'attack') { sy = 1.05; sx = .9; }
  else if (e.state === 'hurt') { sx = 1.15; sy = .7; }
  else if (e.state === 'dead') { sc = Math.max(0, 1 - e.stateT / .6); g.rotation.y += e.stateT * 12; op = .5; }
  g.scale.setScalar(sc); u.jelly.scale.set(sx, sy, sx); u.jelly.position.y = y; u.core.position.y = y; u.core.rotation.y += dt * 2;
  u.flash = Math.max(0, u.flash - dt * 6); const red = e.state === 'windup' ? (Math.sin(t * 18) * .5 + .5) * .5 : 0;
  u.mat.color.copy(u.hue).lerp(new THREE.Color(1, 1, 1), u.flash).lerp(new THREE.Color(1, .2, .2), red); u.mat.opacity = op;
  u.fg.scale.x = Math.max(.001, e.hp / e.hpMax); u.fg.position.x = -.35 * (1 - u.fg.scale.x); u.bar.quaternion.copy(cam.quaternion); u.bar.visible = e.hp < e.hpMax && e.state !== 'dead';
  if (u.num.userData.text !== e.label) { u.num.userData.text = e.label; u.num.userData.set(e.label || ''); }
}
export function makeCrystal(){
  const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.OctahedronGeometry(.42, 0), new THREE.MeshToonMaterial({ color: 0x7ae7ff, gradientMap: grad, emissive: 0x1a6b8a })); m.scale.y = 1.35; g.add(m);
  const q = textSprite('?', { scale: .5, color: '#fffbe0' }); q.position.y = 0; g.add(q);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1.5, 40), new THREE.MeshBasicMaterial({ color: 0x7ae7ff, transparent: true, opacity: .0, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; g.add(ring);
  g.userData = { m, q, ring }; return g;
}
export function poseCrystal(g, c, dt){ const u = g.userData, t = performance.now() / 1000; g.position.set(WX(c.pos[0]), c.pos[1] + Math.sin(t * 2 + c.uid) * .15, c.pos[2]); u.m.rotation.y += dt * 1.2;
  u.ring.position.y = -g.position.y + .03; u.ring.material.opacity = c.near ? .35 + Math.sin(t * 8) * .15 : .08; const s = c.near ? 1.15 : 1; u.m.scale.set(s, 1.35 * s, s); }

// ── 보스 「숫자 골렘」(06 문서 5절) — 바위 덩어리 + 몸에 박힌 숫자 돌 + 균열 빛. 보호막 칸 = 둘레를 도는 룬 판
export function makeGolem(){
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const rock = toon(0x8a8f9c), dark = toon(0x5d6270), glowM = new THREE.MeshBasicMaterial({ color: 0xff8a3d });
  const blob = (r, x, y, z, m = rock, d = 0) => { const s = withOutline(new THREE.Mesh(new THREE.DodecahedronGeometry(r, d), m), 1.04); s.position.set(x, y, z); s.castShadow = true; return s; };
  const torso = blob(.95, 0, 1.75, 0); torso.scale.set(1.15, 1, .85); body.add(torso);
  const belly = blob(.6, 0, 1.2, .25, dark); body.add(belly);
  const head = blob(.45, 0, 2.75, .1); body.add(head);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0xffd45c }); const eyes = []; for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 6), eyeM); e.position.set(s * .17, 2.8, .48); body.add(e); eyes.push(e); }
  const cracks = []; for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(.05, .3 + (i % 3) * .12, .05), glowM); c.position.set(Math.sin(i * 2.1) * .7, 1.4 + (i % 4) * .25, .78 - Math.abs(Math.sin(i * 2.1)) * .25); c.rotation.z = Math.sin(i * 1.7) * .8; body.add(c); cracks.push(c); }
  const nums = []; for (const [x, y] of [[-.45, 1.95], [.45, 1.95], [0, 1.55]]) { const st = blob(.2, x, y, .82, toon(0xd9cdb4)); body.add(st); const n = textSprite(String(1 + nums.length * 3), { scale: .38, color: '#3a2a10', stroke: '#fff4d6' }); n.position.set(x, y, 1.05); body.add(n); nums.push(st, n); }
  const arm = side => { const piv = new THREE.Group(); piv.position.set(side * 1.15, 2.15, 0); const up = blob(.38, 0, -.4, 0); piv.add(up); const fist = blob(.5, 0, -1.15, .1, dark); piv.add(fist); body.add(piv); piv.userData.fist = fist; return piv; };
  const armL = arm(1), armR = arm(-1);
  const leg = side => { const l = blob(.42, side * .5, .45, 0, dark); l.scale.y = 1.2; body.add(l); return l; };
  const legL = leg(1), legR = leg(-1);
  const shield = new THREE.Group(); g.add(shield); const plates = [];
  for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.OctahedronGeometry(.35, 0), new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: .9 })); p.scale.set(1, 1.4, .3); shield.add(p); plates.push(p); }
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(2.0, 28, 18), new THREE.MeshBasicMaterial({ color: 0x7ae7ff, transparent: true, opacity: .14, blending: THREE.AdditiveBlending, depthWrite: false })); bubble.position.y = 1.5; shield.add(bubble);
  const lock = textSprite('🔒', { scale: .7 }); lock.position.y = 3.6; shield.add(lock);
  g.userData = { body, head, armL, armR, legL, legR, cracks, glowM, eyes, rock, dark, shield, plates, bubble, flash: 0, mats: [rock, dark], lunge: 0 };
  return g;
}
export function poseGolem(g, b, dt, gameT){
  const u = g.userData, t = performance.now() / 1000, k = 1 - Math.exp(-dt / .08);
  g.position.set(WX(b.pos[0]), 0, b.pos[2]); g.rotation.y = -b.yaw;
  let aL = -.15, aR = -.15, lean = 0, sink = 0, sc = 1, legSw = 0;
  const tg = b.telegraphs[0], wk = tg ? Math.max(0, Math.min(1, (gameT - tg.t0) / Math.max(.01, tg.t1 - tg.t0))) : 0;
  if (b.state === 'chase') { legSw = Math.sin(t * 5) * .35; aL = -.15 + Math.sin(t * 5) * .2; aR = -.15 - Math.sin(t * 5) * .2; }
  if (b.state === 'windup' || b.state === 'attack') {
    const hit = b.state === 'attack';
    if (b.attack === 'slam') { aR = hit ? .3 : -2.8 * wk; aL = hit ? .3 : -2.8 * wk; lean = hit ? .45 : -.15 * wk; }
    else if (b.attack === 'charge') { lean = hit ? .55 : .35 * wk; aL = aR = hit ? -1.4 : -.6 * wk; sink = .2 * wk; }
    else if (b.attack === 'rocks') { aR = hit ? -.5 : -2.6 * wk; aL = -.4; lean = -.1 * wk; }
    else if (b.attack === 'quake') { aL = aR = hit ? .2 : -3.0 * wk; sink = hit ? -.1 : .1 * wk; }
  }
  if (b.state === 'kneel') { sink = .7; lean = .5; aL = aR = .4; }
  if (b.state === 'phase') { lean = Math.sin(t * 30) * .05; sink = .2; }
  if (b.state === 'intro') { sc = Math.min(1, .3 + b.stateT / 1.2); sink = (1 - Math.min(1, b.stateT / 1.2)) * 2.5; }
  if (b.state === 'dead') { sc = Math.max(.01, 1 - b.stateT / 1.2); lean = Math.min(1.4, b.stateT * 1.5); }
  const L = (o, v) => o + (v - o) * k;
  u.armL.rotation.x = L(u.armL.rotation.x, aL); u.armR.rotation.x = L(u.armR.rotation.x, aR); u.body.rotation.x = L(u.body.rotation.x, lean); u.body.position.y = L(u.body.position.y, -sink);
  u.legL.rotation.x = legSw; u.legR.rotation.x = -legSw; g.scale.setScalar(sc);
  // 페이즈 색: 2페이즈부터 달아오름 · 약점 시간엔 흰빛 깜빡
  const heat = b.phase >= 1 ? .35 + b.phase * .15 : 0, pulse = .5 + .5 * Math.sin(t * (b.state === 'windup' ? 14 : 3));
  u.glowM.color.setRGB(1, .55 - heat * .4 * pulse, .24 - heat * .2); for (const c of u.cracks) c.scale.y = 1 + heat * pulse;
  u.flash = Math.max(0, u.flash - dt * 5); const wf = b.weak > 0 ? (Math.sin(t * 10) * .5 + .5) * .35 : 0, fl = Math.max(u.flash, wf);
  for (const m of u.mats) m.emissive && m.emissive.setRGB(fl * .9 + heat * .25, fl * .7, fl * .5);
  for (const e of u.eyes) e.material.color.setHex(b.state === 'windup' ? 0xff3048 : b.state === 'kneel' ? 0x6b7280 : 0xffd45c);
  // 보호막 칸
  u.shield.visible = b.shield > 0 && b.state !== 'dead'; u.bubble.material.opacity = .1 + .05 * Math.sin(t * 3);
  u.plates.forEach((p, i) => { p.visible = i < b.shield; const a = t * .9 + i * Math.PI * 2 / Math.max(1, b.shieldMax); p.position.set(Math.cos(a) * 2.1, 1.6 + Math.sin(t * 2 + i) * .2, Math.sin(a) * 2.1); p.rotation.y = -a; });
}
export function makeRock(label){ const g = new THREE.Group(); const r = new THREE.Mesh(new THREE.DodecahedronGeometry(.55, 0), toon(0xbfae8c)); r.castShadow = true; g.add(r);
  const n = textSprite(label || '?', { scale: .5, color: '#3a2a10', stroke: '#fff4d6' }); n.position.y = .1; g.add(n); g.userData = { r }; return g; }
