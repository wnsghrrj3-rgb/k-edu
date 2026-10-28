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
  // 강화(상황 B) 금빛 기운 — 발밑 금빛 고리 + 몸 둘레 입자 대신 얇은 금빛 구(가벼움)
  const aura = new THREE.Mesh(new THREE.SphereGeometry(.75, 18, 12), new THREE.MeshBasicMaterial({ color: 0xffd45c, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false })); aura.position.y = .65; aura.visible = false; g.add(aura);
  const auraRing = new THREE.Mesh(new THREE.RingGeometry(.55, .7, 32), new THREE.MeshBasicMaterial({ color: 0xffd45c, transparent: true, opacity: .7, side: THREE.DoubleSide, depthWrite: false })); auraRing.rotation.x = -Math.PI / 2; auraRing.position.y = .03; auraRing.visible = false; g.add(auraRing);
  g.userData = { body, head, armL, armR, staff, tip, orb, shield, robe, aura, auraRing, mats: [main, skin, sub], flash: 0 };
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
  u.tip.rotation.y += dt * 2;
  u.flash = Math.max(0, u.flash - dt * 4); const fl = u.flash > 0 ? 1 : 0; for (const m of u.mats) m.emissive && m.emissive.setRGB(fl * .8, fl * .1, fl * .1);
  g.visible = !(P.invuln && Math.floor(t * 18) % 2 === 0 && a.lower !== 'A05');
  u.aura.visible = u.auraRing.visible = !!P.empowered; if (P.empowered) { u.aura.material.opacity = .12 + .08 * Math.sin(t * 7); u.auraRing.rotation.z += dt * 1.5; const k = P.empowerT != null ? P.empowerT : 1; u.auraRing.scale.setScalar(.8 + .4 * k); }
}
export function tipWorld(g, out){ return g.userData.tip.getWorldPosition(out); }

export function makeSlime(e){
  const g = new THREE.Group(); const big = e.kind === 'big-slime', mini = e.tags && e.tags.includes('mini');
  const hue = new THREE.Color().setHSL((parseInt(e.label || '1', 10) * .11) % 1, big ? .75 : .65, big ? .5 : mini ? .68 : .6);
  const jelly = new THREE.Mesh(new THREE.SphereGeometry(.45, 24, 16), new THREE.MeshToonMaterial({ color: hue, gradientMap: grad, transparent: true, opacity: .82 })); jelly.position.y = .4; jelly.scale.set(1, .85, 1); jelly.castShadow = true; g.add(jelly);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.16, 0), new THREE.MeshBasicMaterial({ color: 0xfff3c4 })); core.position.y = .38; g.add(core);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x1b1630 }); for (const s of [-1, 1]) { const ey = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), eyeM); ey.position.set(s * .14, .52, .37); g.add(ey); }
  const num = textSprite(e.label || '', { scale: .55 }); num.position.y = 1.15; g.add(num);
  const bar = new THREE.Group(); const bg = new THREE.Mesh(new THREE.PlaneGeometry(.7, .08), new THREE.MeshBasicMaterial({ color: 0x1b1630, depthTest: false, transparent: true, opacity: .7 })); const fg = new THREE.Mesh(new THREE.PlaneGeometry(.7, .08), new THREE.MeshBasicMaterial({ color: 0x5cf29a, depthTest: false }));
  fg.position.z = .001; bg.renderOrder = fg.renderOrder = 11; bar.add(bg, fg); bar.position.y = .92; g.add(bar);
  if (big) { const crown = new THREE.Mesh(new THREE.ConeGeometry(.12, .2, 5), new THREE.MeshBasicMaterial({ color: 0xffd45c })); crown.position.set(0, .82, 0); g.add(crown); num.scale.setScalar(.7); }   // 큰 슬라임: 왕관 + 큰 숫자(가르기 전 n)
  g.userData = { jelly, core, num, bar, fg, flash: 0, mat: jelly.material, hue, lunge: 0, k: e.scale || 1 };
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
  g.scale.setScalar(sc * (e.scale || u.k || 1)); u.jelly.scale.set(sx, sy, sx); u.jelly.position.y = y; u.core.position.y = y; u.core.rotation.y += dt * 2;
  u.flash = Math.max(0, u.flash - dt * 6); const red = e.state === 'windup' ? (Math.sin(t * 18) * .5 + .5) * .5 : 0;
  u.mat.color.copy(u.hue).lerp(new THREE.Color(1, 1, 1), u.flash).lerp(new THREE.Color(1, .2, .2), red); u.mat.opacity = op;
  u.fg.scale.x = Math.max(.001, e.hp / e.hpMax); u.fg.position.x = -.35 * (1 - u.fg.scale.x); u.bar.quaternion.copy(cam.quaternion); u.bar.visible = e.hp < e.hpMax && e.state !== 'dead';
  if (u.num.userData.text !== e.label) { u.num.userData.text = e.label; u.num.userData.set(e.label || ''); }
}
// 수정: math(하늘색 「?」) · empower(금빛 큰 수정 「★」, 07 문서 상황 B — 남은 시간은 고리가 줄어듦)
export function makeCrystal(c = {}){
  const em = c.kind === 'empower', col = em ? 0xffd45c : 0x7ae7ff;
  const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.OctahedronGeometry(em ? .55 : .42, 0), new THREE.MeshToonMaterial({ color: col, gradientMap: grad, emissive: em ? 0x8a5a10 : 0x1a6b8a })); m.scale.y = 1.35; g.add(m);
  const q = textSprite(em ? '★' : '?', { scale: .5, color: em ? '#fff8d6' : '#fffbe0' }); q.position.y = 0; g.add(q);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1.5, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .0, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; g.add(ring);
  const life = em ? new THREE.Mesh(new THREE.RingGeometry(.62, .7, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })) : null; if (life) { life.rotation.x = -Math.PI / 2; g.add(life); }
  g.userData = { m, q, ring, life, em }; return g;
}
export function poseCrystal(g, c, dt){ const u = g.userData, t = performance.now() / 1000; g.position.set(WX(c.pos[0]), c.pos[1] + Math.sin(t * 2 + c.uid) * .15, c.pos[2]); u.m.rotation.y += dt * (u.em ? 2.2 : 1.2);
  u.ring.position.y = -g.position.y + .03; u.ring.material.opacity = c.near ? .35 + Math.sin(t * 8) * .15 : .08; const s = (c.near ? 1.15 : 1) * (u.em ? 1 + .05 * Math.sin(t * 6) : 1); u.m.scale.set(s, 1.35 * s, s);
  if (u.life) { u.life.position.y = -g.position.y + .04; const k = c.life != null ? c.life : 1; u.life.scale.setScalar(.6 + 1.3 * k); u.life.material.opacity = .5 + .4 * (k < .3 ? Math.sin(t * 10) * .5 + .5 : 1); } }
// 계산 고블린(06 문서 3절) — 초록 작은 몸 + 큰 귀 + 계산판(가슴). 조준 중엔 팔을 뒤로 젖히고, 던질 때 앞으로
export function makeGoblin(e){
  const g = new THREE.Group(); const green = toon(0x6fbf4a), dark = toon(0x3f7a2a), skin = toon(0x9bd36f);
  const body = new THREE.Group(); g.add(body);
  const torso = withOutline(new THREE.Mesh(new THREE.CapsuleGeometry(.2, .3, 4, 10), green)); torso.position.y = .5; torso.castShadow = true; body.add(torso);
  const head = withOutline(new THREE.Mesh(new THREE.SphereGeometry(.22, 16, 12), skin)); head.position.y = .9; head.castShadow = true; body.add(head);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(.08, .32, 6), skin); ear.position.set(s * .27, .98, 0); ear.rotation.z = s * -1.25; body.add(ear);
    const ey = new THREE.Mesh(new THREE.SphereGeometry(.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0x1b1630 })); ey.position.set(s * .08, .92, .2); body.add(ey); }
  const board = new THREE.Mesh(new THREE.BoxGeometry(.3, .22, .04), toon(0xf1e3bd)); board.position.set(0, .55, .22); body.add(board);
  const bt = textSprite('+', { scale: .22, color: '#2d2112', stroke: '#fff4d6' }); bt.position.set(0, .55, .26); body.add(bt);
  const arm = side => { const piv = new THREE.Group(); piv.position.set(side * .25, .68, 0); const a = new THREE.Mesh(new THREE.CapsuleGeometry(.05, .22, 4, 8), green); a.position.y = -.15; piv.add(a); body.add(piv); return piv; };
  const armL = arm(1), armR = arm(-1); const acorn = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), toon(0x9a6a3a)); acorn.position.y = -.32; armR.add(acorn);
  for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.06, .16, 4, 8), dark); leg.position.set(s * .1, .18, 0); body.add(leg); }
  const bar = new THREE.Group(); const bg = new THREE.Mesh(new THREE.PlaneGeometry(.7, .08), new THREE.MeshBasicMaterial({ color: 0x1b1630, depthTest: false, transparent: true, opacity: .7 })); const fg = new THREE.Mesh(new THREE.PlaneGeometry(.7, .08), new THREE.MeshBasicMaterial({ color: 0x5cf29a, depthTest: false }));
  fg.position.z = .001; bg.renderOrder = fg.renderOrder = 11; bar.add(bg, fg); bar.position.y = 1.28; g.add(bar);
  g.userData = { body, head, armL, armR, acorn, bar, fg, board, bt, flash: 0, mats: [green, skin, dark] };
  return g;
}
export function poseGoblin(g, e, dt, cam, gameT){
  const u = g.userData, t = performance.now() / 1000, k = 1 - Math.exp(-dt / .06); g.position.set(WX(e.pos[0]), 0, e.pos[2]); g.rotation.y = -e.yaw;
  let sc = 1, bob = 0, aR = -.3, aL = .2, lean = 0;
  if (e.state === 'spawn') sc = Math.min(1, e.stateT / .6);
  else if (e.state === 'chase' || e.state === 'recover') { bob = Math.abs(Math.sin(t * 9)) * .06; aL = Math.sin(t * 9) * .5; aR = -Math.sin(t * 9) * .5; }
  else if (e.state === 'windup' && e.telegraph) { const w = Math.min(1, (gameT - e.telegraph.t0) / Math.max(.01, e.telegraph.t1 - e.telegraph.t0)); aR = -.3 - 2.4 * w; lean = -.15 * w; }
  else if (e.state === 'attack') { aR = 1.2; lean = .25; }
  else if (e.state === 'hurt') { lean = -.3; }
  else if (e.state === 'dead') { sc = Math.max(0, 1 - e.stateT / .6); g.rotation.y += e.stateT * 12; }
  const L = (o, v) => o + (v - o) * k; u.body.position.y = L(u.body.position.y, bob); u.body.rotation.x = L(u.body.rotation.x, lean); u.armR.rotation.x = L(u.armR.rotation.x, aR); u.armL.rotation.x = L(u.armL.rotation.x, aL);
  u.acorn.visible = e.state !== 'attack' && e.state !== 'recover'; g.scale.setScalar(sc * (e.scale || 1));
  u.flash = Math.max(0, u.flash - dt * 6); const red = e.state === 'windup' ? (Math.sin(t * 18) * .5 + .5) * .6 : 0; for (const m of u.mats) m.emissive && m.emissive.setRGB(u.flash + red, u.flash * .9, u.flash * .9);
  u.fg.scale.x = Math.max(.001, e.hp / e.hpMax); u.fg.position.x = -.35 * (1 - u.fg.scale.x); u.bar.quaternion.copy(cam.quaternion); u.bar.visible = e.hp < e.hpMax && e.state !== 'dead';
}

// ── v1.6 고블린 방패병(06 문서 3절): 고블린 몸 + 앞 나무 방패(빈칸 식 글자) — 방패 up 이면 앞, 내리면 옆으로 처짐, 깨지면 조각나며 사라짐
export function makeShieldGoblin(e){
  const g = makeGoblin(e); const u = g.userData; u.board.visible = false; u.bt && (u.bt.visible = false);
  const pivot = new THREE.Group(); pivot.position.set(.3, .6, .18); u.body.add(pivot);
  const wood = toon(0x8a5a30), rim = toon(0x5a3a1c);
  const sh = withOutline(new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .07, 18), wood)); sh.rotation.x = Math.PI / 2; sh.castShadow = true; pivot.add(sh);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.4, .035, 8, 24), rim); pivot.add(ring); const boss = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), rim); boss.position.z = .05; pivot.add(boss);
  const eq = textSprite((e.shield && e.shield.eq) || '□+?=?', { scale: .34, color: '#fff4d6', stroke: '#3a2412' }); eq.position.z = .09; eq.position.y = .0; pivot.add(eq);
  const pieces = new THREE.Group(); pieces.visible = false; for (let i = 0; i < 6; i++) { const pc = new THREE.Mesh(new THREE.BoxGeometry(.18, .14, .05), wood); pc.position.set(Math.cos(i) * .2, Math.sin(i * 1.7) * .2, 0); pc.userData.v = [Math.cos(i * 1.3) * 2.2, 2 + Math.sin(i) * 1.5, Math.sin(i * .7) * 1.5]; pieces.add(pc); } pivot.add(pieces);
  const shBar = new THREE.Mesh(new THREE.PlaneGeometry(.7, .05), new THREE.MeshBasicMaterial({ color: 0xd9a35c, depthTest: false })); shBar.position.y = 1.36; shBar.renderOrder = 11; g.add(shBar);
  Object.assign(u, { shield: { pivot, sh, ring, eq, pieces, bar: shBar, broken: false, bt: 0 } }); return g;
}
export function poseShieldGoblin(g, e, dt, cam, gameT){
  poseGoblin(g, e, dt, cam, gameT); const u = g.userData, S = u.shield, st = e.shield, k = 1 - Math.exp(-dt / .08);
  if (!st) return; if (st.broken && !S.broken) { S.broken = true; S.pieces.visible = true; S.sh.visible = S.ring.visible = S.eq.visible = false; S.bt = 0; }
  if (S.broken) { S.bt += dt; for (const pc of S.pieces.children) { pc.position.x += pc.userData.v[0] * dt; pc.position.y += pc.userData.v[1] * dt; pc.position.z += pc.userData.v[2] * dt; pc.userData.v[1] -= 9 * dt; pc.rotation.x += dt * 7; pc.rotation.z += dt * 5; pc.scale.setScalar(Math.max(0, 1 - S.bt / .9)); } if (S.bt > 1) S.pieces.visible = false; S.bar.visible = false; return; }
  const up = st.up && e.state !== 'dead'; const want = up ? { x: .3, y: .6, z: .18, ry: 0, rx: 0 } : { x: .48, y: .45, z: 0, ry: 1.3, rx: .2 };
  S.pivot.position.x += (want.x - S.pivot.position.x) * k; S.pivot.position.y += (want.y - S.pivot.position.y) * k; S.pivot.position.z += (want.z - S.pivot.position.z) * k; S.pivot.rotation.y += (want.ry - S.pivot.rotation.y) * k; S.pivot.rotation.x += (want.rx - S.pivot.rotation.x) * k;
  S.eq.quaternion.copy(cam.quaternion); S.eq.visible = up; S.bar.scale.x = Math.max(.001, st.hp / st.hpMax); S.bar.position.x = -.35 * (1 - S.bar.scale.x); S.bar.quaternion.copy(cam.quaternion); S.bar.visible = st.hp < st.hpMax && e.state !== 'dead';
}

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

// ── v1.5 길 위 물건(rail.js 가 내는 obstacles): 바위·가지·반딧불·상자. 크기(r·h)는 스냅샷 값 그대로(판정 = 시스템)
const stoneMat = toon(0x8b8f99), woodMat = toon(0x6b4a2e), leafMat = toon(0x4f9a3a), chestMat = toon(0xb0783a), goldMat = toon(0xffd45c, { emissive: 0x6a4a10 });
export function makeObstacle(o){
  const g = new THREE.Group(); g.userData = { kind: o.kind, t: Math.random() * 7 };
  if (o.kind === 'rock') { const m = withOutline(new THREE.Mesh(new THREE.DodecahedronGeometry(o.r, 0), stoneMat)); m.scale.set(1, o.h / o.r * .55, .9); m.position.y = o.r * .5; m.rotation.y = o.uid; m.castShadow = true; g.add(m);
    const moss = new THREE.Mesh(new THREE.SphereGeometry(o.r * .5, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), leafMat); moss.position.set(o.r * .2, o.h * .62, o.r * .1); g.add(moss); }
  else if (o.kind === 'branch') { const w = o.r * 2 + 1.5; const b = withOutline(new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, w, 7), woodMat)); b.rotation.z = Math.PI / 2; b.position.y = o.h + .1; b.castShadow = true; g.add(b);
    for (let i = -2; i <= 2; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 0), leafMat); l.position.set(i * w / 5, o.h + .35 + (i % 2) * .15, .1); l.scale.set(1.3, .7, 1); g.add(l); }
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.14, .2, o.h + .3, 6), woodMat); post.position.set(-w / 2, (o.h + .3) / 2, 0); g.add(post); const post2 = post.clone(); post2.position.x = w / 2; g.add(post2); }
  else if (o.kind === 'mushroom') { const cap = toon(0xe8584a), spot = toon(0xfff4d6), stem = toon(0xf0e2c4); const st = withOutline(new THREE.Mesh(new THREE.CylinderGeometry(.28, .36, .4, 10), stem)); st.position.y = .2; g.add(st);
    const cp = withOutline(new THREE.Mesh(new THREE.SphereGeometry(o.r * .95, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), cap)); cp.scale.y = .55; cp.position.y = .38; cp.castShadow = true; g.add(cp); g.userData.cap = cp;
    for (let i = 0; i < 5; i++) { const sp = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), spot); const a = i * 1.26 + o.uid; sp.position.set(Math.cos(a) * o.r * .55, .38 + .3 * Math.sin(i * .9 + 1) + .05, Math.sin(a) * o.r * .55); cp.add(sp); }
    const ring = new THREE.Mesh(new THREE.RingGeometry(o.r * .9, o.r * 1.15, 28), new THREE.MeshBasicMaterial({ color: 0xffc8b0, transparent: true, opacity: .3, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = .02; g.add(ring); g.userData.ring = ring; g.userData.sq = 0; }
  else if (o.kind === 'firefly') { const s = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xfff1a8, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(.55); g.add(s);
    const core = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); g.add(core); const halo = new THREE.Mesh(new THREE.RingGeometry(.5, .75, 28), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: .35, side: THREE.DoubleSide, depthWrite: false })); halo.rotation.x = -Math.PI / 2; halo.position.y = -(o.pos ? o.pos[1] : 1.2) + .02; g.add(halo); g.userData.halo = halo; }
  else if (o.kind === 'chest') { const box = withOutline(new THREE.Mesh(new THREE.BoxGeometry(.9, .55, .6), chestMat)); box.position.y = .28; box.castShadow = true; g.add(box); const lid = withOutline(new THREE.Mesh(new THREE.BoxGeometry(.92, .3, .62), chestMat)); lid.position.set(0, .7, 0); g.add(lid); g.userData.lid = lid;
    const lock = new THREE.Mesh(new THREE.BoxGeometry(.2, .2, .1), goldMat); lock.position.set(0, .5, .33); g.add(lock); const ring = new THREE.Mesh(new THREE.RingGeometry(.8, 1.1, 32), new THREE.MeshBasicMaterial({ color: 0xffd45c, transparent: true, opacity: .4, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = .02; g.add(ring); g.userData.ring = ring; }
  return g;
}
export function poseObstacle(g, o, dt, gameT){
  const u = g.userData; u.t += dt; g.position.set(WX(o.pos[0]), o.pos[1] || 0, o.pos[2]);
  if (o.kind === 'firefly') { g.position.y += Math.sin(u.t * 3) * .12; g.children[0].material.opacity = .6 + .4 * Math.sin(u.t * 6); g.visible = o.state !== 'taken'; }
  else if (o.kind === 'chest') { u.ring.rotation.z += dt; u.ring.material.opacity = .25 + .2 * Math.sin(u.t * 4); if (o.state === 'taken') { u.lid.rotation.x = Math.max(-1.2, u.lid.rotation.x - dt * 6); u.lid.position.z = -.25; } }
  else if (o.kind === 'mushroom') { const breathe = 1 + Math.sin(u.t * 2.2) * .03; if (o.state === 'bounced') { u.sq = Math.min(u.sq + dt * 6, 1); } const sqz = u.sq ? Math.sin(u.sq * Math.PI) * .35 : 0; u.cap.scale.set(breathe * (1 + sqz * .5), .55 * breathe * (1 - sqz), breathe * (1 + sqz * .5)); u.ring.material.opacity = o.state === 'ahead' ? .25 + .15 * Math.sin(u.t * 4) : 0; }
  else if (o.kind === 'rock' && o.state === 'hit') g.position.y = -.08;
  else if (o.kind === 'branch' && o.state === 'hit') g.rotation.z = Math.sin(u.t * 14) * .04;
}
// 퍼즐 돌(number-bridge·rule-stones) · 문(size-gate) — 멈춘 길 앞 바닥에 세움. 고르는 자리는 화면 UI(targets rect)라 여기 돌은 그림만
export function makePuzzleProp(pz){
  const g = new THREE.Group(); g.userData = { kind: pz.type, items: [] }; let u;
  if (pz.stones) { pz.stones.forEach((s, i) => { const st = withOutline(new THREE.Mesh(new THREE.CylinderGeometry(.75, .9, .5, 9), stoneMat)); st.position.set(WX((i - 1) * 2.0), .25, 7 + (i === 1 ? .8 : 0)); st.castShadow = true; g.add(st);
      const n = textSprite(String(s.num), { scale: .6, color: '#fff7d6' }); n.position.set(st.position.x, 1.0, st.position.z); g.add(n); g.userData.items.push({ st, n }); });
    if (pz.type === 'number-bridge') { const water = new THREE.Mesh(new THREE.PlaneGeometry(9, 4), new THREE.MeshBasicMaterial({ color: 0x4f9fd6, transparent: true, opacity: .55 })); water.rotation.x = -Math.PI / 2; water.position.set(0, .03, 7.6); g.add(water);
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.4, .2, 4.2), woodMat); bridge.position.set(0, -.6, 7.6); bridge.visible = false; g.add(bridge); g.userData.bridge = bridge; }
    if (pz.type === 'mushroom-add' && pz.mush) { const capM = toon(0xe8584a), spotM = toon(0xfff4d6), stemM = toon(0xf0e2c4);   // 버섯 두 송이(점 a·b) + 문 3개(돌 대신 문 모양)
      [[-2.2, pz.mush.a], [2.2, pz.mush.b]].forEach(([x, n]) => { const grp = new THREE.Group(); const st = withOutline(new THREE.Mesh(new THREE.CylinderGeometry(.3, .4, .9, 10), stemM)); st.position.y = .45; grp.add(st);
        const cp = withOutline(new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), capM)); cp.scale.y = .6; cp.position.y = .85; cp.castShadow = true; grp.add(cp);
        for (let i = 0; i < n; i++) { const sp = new THREE.Mesh(new THREE.SphereGeometry(.15, 10, 8), spotM); const a = -Math.PI * .15 + i * (Math.PI * 1.3 / Math.max(1, n - 1)) - Math.PI * .65 + Math.PI * .5; sp.position.set(Math.cos(a) * .62, .95 + .25 * Math.sin(i * 1.1 + .5), .78); grp.add(sp); }
        grp.position.set(WX(x), 0, 3.8); g.add(grp); });
      u = g.userData; u.items.forEach((it, i) => { it.st.geometry.dispose(); it.st.geometry = new THREE.BoxGeometry(1.3, 2.0, .3); it.st.position.y = 1.0; it.n.position.y = 2.35; const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.3, .2), woodMat); frame.position.set(it.st.position.x, 1.15, it.st.position.z - .12); g.add(frame); }); }
    if (pz.type === 'rule-stones' && pz.seq) pz.seq.forEach((v, i) => { const st = new THREE.Mesh(new THREE.CylinderGeometry(.5, .6, .35, 9), stoneMat); st.position.set(WX(-2.4 + i * 1.6), .17, 3.2 + i * .3); g.add(st); const n = textSprite(String(v), { scale: .45, color: '#dfe7ff' }); n.position.set(st.position.x, .75, st.position.z); g.add(n); }); }
  if (pz.gate) { for (const [side, num] of [['L', pz.gate.left], ['R', pz.gate.right]]) { const x = WX(side === 'L' ? -1.7 : 1.7); const arch = new THREE.Group();
      for (const dx of [-1, 1]) { const p = withOutline(new THREE.Mesh(new THREE.CylinderGeometry(.22, .28, 3.2, 7), stoneMat)); p.position.set(dx * 1.0, 1.6, 0); p.castShadow = true; arch.add(p); }
      const top = withOutline(new THREE.Mesh(new THREE.BoxGeometry(2.5, .5, .5), stoneMat)); top.position.y = 3.3; arch.add(top); const n = textSprite(String(num), { scale: .9, color: '#fff7d6' }); n.position.y = 2.1; arch.add(n);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 3.0), new THREE.MeshBasicMaterial({ color: 0x5cf29a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); glow.position.y = 1.6; arch.add(glow);
      arch.position.set(x, 0, 8); g.add(arch); g.userData.items.push({ side, arch, glow }); } }
  return g;
}
export function posePuzzleProp(g, pz, dt){
  const u = g.userData; if (!u) return;
  const door = u.kind === 'mushroom-add', baseY = door ? 1.0 : .25, nOff = door ? 1.35 : .75;   // v1.6 버섯 문은 문 판(높이 1.0) — 오답이면 살짝 내려앉음
  if (pz.stones) u.items.forEach((it, i) => { const s = pz.stones[i]; if (!s) return; const lit = s.lit || s.answer; it.st.material = lit ? (s.answer ? goldMat : toon(0x9fe8ff)) : (door ? woodMat : stoneMat); const sink = s.wrong ? -.35 : 0; it.st.position.y += (baseY + sink - it.st.position.y) * Math.min(1, dt * 6); it.n.position.y = it.st.position.y + nOff; });
  if (u.bridge) { u.bridge.visible = pz.state === 'right' || pz.state === 'reveal'; u.bridge.position.y += (.1 - u.bridge.position.y) * Math.min(1, dt * 3); }
  if (pz.gate) u.items.forEach(it => { const on = pz.gate.lane === it.side, ans = pz.gate.answer === it.side, wrong = pz.state === 'wrong' && pz.gate.picked === it.side; it.glow.material.color.setHex(wrong ? 0xff5c6e : ans ? 0x5cf29a : 0xfff1a8); it.glow.material.opacity += ((wrong ? .5 : ans ? .45 : on ? .25 : 0) - it.glow.material.opacity) * Math.min(1, dt * 8); });
}
