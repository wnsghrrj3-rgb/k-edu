// hq 스킨 — 배우. 캐릭터 = KayKit Mage GLB(CC0, 76 클립) · 슬라임 = 젤리 셰이더 · 수정·바위·상자·버섯 = Quaternius GLB(CC0)
// 판정 크기·시간은 시스템 값(스냅샷) 그대로 — 여기선 보이는 모습만. 클립은 anim.phase 로 재매핑(13 문서 4절) → 클립 길이를 바꿔도 손맛 불변
// GLB 가 없으면(로드 실패) proto 의 절차적 배우로 대체한다.
import * as THREE from 'three';
import * as P from '../proto/actors.js';
import { loadGLB, loadStatic } from './loader.js';
export const { WX, toon, textSprite, makeGoblin, poseGoblin, makeShieldGoblin, poseShieldGoblin, makeCrystalGolem, poseCrystalGolem, makeGolem, poseGolem, makeRock, makePuzzleProp, posePuzzleProp } = P;

// ── 에셋 준비(load 에서 한 번) — 실패한 것은 null 로 남고 proto 대체
export const A = { mage: null, crystal: [], rock: [], chest: null, chestOpen: null, mushroom: [], coin: null, star: null, ready: false };
export async function prepareActors(progress){
  const tasks = [
    loadGLB('Mage').then(g => { A.mage = g; }),
    ...['Crystal1', 'Crystal2', 'Crystal3'].map(n => loadStatic(n, { height: .9 }).then(d => d && A.crystal.push(d))),
    ...['Rock_Moss_1', 'Rock_Moss_2', 'Rock_Moss_4', 'Rock_Moss_6'].map(n => loadStatic(n, { height: 1 }).then(d => d && A.rock.push(d))),
    loadStatic('Chest_Closed', { height: .6 }).then(d => { A.chest = d; }), loadStatic('Chest_Open', { height: .75 }).then(d => { A.chestOpen = d; }),
    ...['Mushroom_1', 'Mushroom_3'].map(n => loadStatic(n, { height: .6 }).then(d => d && A.mushroom.push(d))),
    loadStatic('Coin', { height: .3 }).then(d => { A.coin = d; }), loadStatic('Star', { height: .4 }).then(d => { A.star = d; }),
  ]; let n = 0; await Promise.all(tasks.map(t => t.then(() => progress && progress(++n / tasks.length)))); A.ready = true;
}
const vcMat = (o = {}) => new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: .85, metalness: 0 }, o));
const crystalMat = (color = 0x7ae7ff, em = 0x1a6b8a) => new THREE.MeshPhysicalMaterial({ color, emissive: em, emissiveIntensity: 1.2, roughness: .15, metalness: 0, clearcoat: 1, clearcoatRoughness: .1, transparent: true, opacity: .92 });

// ── 마법사(03 문서 2절 표 → KayKit 클립). 하체 층·상체 층을 전신 클립 가중치로 섞는다(상체 동작이 있으면 그 클립이 몸 전체를 덮음 — 이동은 뿌리 위치로)
const CLIP = { idle: 'Idle', walk: 'Walking_A', run: 'Running_A', strafeL: 'Running_Strafe_Left', strafeR: 'Running_Strafe_Right', dodgeL: 'Dodge_Left', dodgeR: 'Dodge_Right', duck: 'Jump_Land',
  A07: 'Spellcast_Shoot', A08: 'Spellcast_Long', A09: 'Spellcast_Raise', A10: 'Spellcast_Shoot', A11: 'Blocking', A12: 'Hit_A', A13: 'Death_B', A14: 'Cheer', A15: 'Death_A', A16: 'PickUp', A17: 'Spellcast_Raise' };
const CHAR = { luna: { tint: 0x9b7bff, tip: 0xffd45c, hat: 0x2b2f6b }, tori: { tint: 0x6bbf59, tip: 0xffb347, hat: 0x8a5a2b }, haru: { tint: 0x6ec6ff, tip: 0xf4f8ff, hat: 0x3a86c8 } };
export function makePlayer(id = 'luna'){
  if (!A.mage) { const g = P.makePlayer(id); g.userData.proto = true; return g; }
  const c = CHAR[id] || CHAR.luna, g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  // SkinnedMesh.clone 은 스켈레톤을 공유해 깨지므로 원본 scene 을 직접 쓴다(한 번에 한 명 — makePlayer 는 캐릭터 바꿀 때만 다시 불림)
  const scene = A.mage.scene; if (scene.parent) scene.parent.remove(scene);
  scene.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(scene); const h0 = Math.max(.01, bb.max.y - bb.min.y), s = 1.45 / h0;   // 키 1.45m(1학년 눈높이 캐릭터, 03 문서)
  scene.scale.setScalar(s); scene.position.y = -bb.min.y * s; body.add(scene);
  const mats = []; let tipBone = null, handR = null;
  scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false; if (o.material && !mats.includes(o.material)) mats.push(o.material); }
    if (o.isBone || o.isObject3D) { const n = (o.name || '').toLowerCase(); if (/^handslot\.?r$|^handslot_r$/.test(n)) handR = o; else if (!handR && /^hand\.?r$/.test(n)) handR = o; } });
  for (const m of mats) { m.roughness = .9; m.metalness = 0; if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.minFilter = THREE.LinearMipmapLinearFilter; } }
  // 무기 변형 메시(KayKit 은 지팡이·완드·책을 전부 싣고 옴) — 2H_Staff 만 남김
  for (const nm of ['Spellbook', 'Spellbook_open', '1H_Wand']) { const o = scene.getObjectByName(nm); if (o) o.visible = false; }
  // 지팡이 끝(소켓): 2H_Staff 메시의 원점에서 먼 끝 → tipWorld 가 쓰는 자리(발사·충전 구슬·지팡이 빛). 없으면 오른손, 그것도 없으면 몸 앞 고정
  const staffM = scene.getObjectByName('2H_Staff'); const tipHold = new THREE.Group();
  if (staffM && staffM.geometry) { staffM.geometry.computeBoundingBox(); const b = staffM.geometry.boundingBox, mn = b.min, mx = b.max; const ax = ['x', 'y', 'z'].reduce((a, k) => mx[k] - mn[k] > mx[a] - mn[a] ? k : a, 'x');
    const far = Math.abs(mx[ax]) > Math.abs(mn[ax]) ? mx[ax] : mn[ax]; const c = { x: (mn.x + mx.x) / 2, y: (mn.y + mx.y) / 2, z: (mn.z + mx.z) / 2 }; c[ax] = far; staffM.add(tipHold); tipHold.position.set(c.x, c.y, c.z); }
  else if (handR) { handR.add(tipHold); tipHold.position.set(0, 0, .55 / s); } else { tipHold.position.set(-.3, 1.15, .45); body.add(tipHold); }
  const tip = new THREE.Group(); tipHold.add(tip); const tipGem = new THREE.Mesh(new THREE.OctahedronGeometry(tipHold.parent !== body ? .11 / s : .1, 0), new THREE.MeshBasicMaterial({ color: c.tip })); tip.add(tipGem);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(tipHold.parent !== body ? .35 / s : .35, 20, 14), new THREE.MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false })); orb.visible = false; tip.add(orb);
  const orbL = new THREE.PointLight(0xff9a4d, 0, 5, 2); tip.add(orbL);
  const shield = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 20), new THREE.MeshPhysicalMaterial({ color: 0xb28cff, transparent: true, opacity: .2, roughness: .1, transmission: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); shield.position.y = .75; shield.visible = false; g.add(shield);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.42, .5, 40), new THREE.MeshBasicMaterial({ color: c.tint, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = .02; g.add(ring);
  const aura = new THREE.Mesh(new THREE.SphereGeometry(.8, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffd45c, transparent: true, opacity: .14, blending: THREE.AdditiveBlending, depthWrite: false })); aura.position.y = .7; aura.visible = false; g.add(aura);
  const auraRing = new THREE.Mesh(new THREE.RingGeometry(.55, .7, 40), new THREE.MeshBasicMaterial({ color: 0xffd45c, transparent: true, opacity: .7, side: THREE.DoubleSide, depthWrite: false })); auraRing.rotation.x = -Math.PI / 2; auraRing.position.y = .03; auraRing.visible = false; g.add(auraRing);
  // 믹서 — 모든 클립을 올려 두고 가중치만 바꾼다. 시간은 매 프레임 phase 로 직접 놓는다(결정적)
  const mixer = new THREE.AnimationMixer(scene), acts = {}; for (const cl of A.mage.animations) { const a = mixer.clipAction(cl); a.enabled = true; a.setEffectiveWeight(0); a.play(); acts[cl.name] = a; }
  g.userData = { body, shield, orb, orbL, tip, ring, aura, auraRing, mats, flash: 0, mixer, acts, cur: null, w: new Map(), scale: s, tint: c.tint };
  return g;
}
const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
function want(P_, rail){
  const a = P_.anim, up = a.upper, lo = a.lower, vx = P_.vel[0];
  // 상체 1회 동작은 전신 클립이 덮는다(A09 충전·A11 막기는 유지)
  if (up && CLIP[up]) { const T = up === 'A09' ? Math.min(1, a.upperPhase) * .9 : up === 'A11' ? .5 : a.upperPhase; return { clip: CLIP[up], ph: T, hold: up === 'A09' || up === 'A11' }; }
  if (lo === 'A05') return { clip: vx < 0 ? CLIP.dodgeR : CLIP.dodgeL, ph: a.phase };   // 계약 +X = 화면 오른쪽, 스킨은 x 를 뒤집어 그림
  if (lo === 'A06') return { clip: CLIP.duck, ph: .06, hold: true };
  if (lo === 'A12') return { clip: CLIP.A12, ph: a.phase }; if (lo === 'A13') return { clip: CLIP.A13, ph: a.phase * .6 };
  if (lo === 'A14') return { clip: CLIP.A14, ph: a.phase, hold: true }; if (lo === 'A15') return { clip: CLIP.A15, ph: Math.min(1, a.phase), hold: true };
  if (rail && rail.phase === 'go' && rail.speed > .5) return { clip: CLIP.run, ph: (a.phase + (performance.now() / 1000 * rail.speed / 3.8) % 1) % 1, loop: true, railRun: true };
  if (lo === 'A04') return { clip: Math.abs(vx) > 2.6 ? (vx < 0 ? CLIP.strafeR : CLIP.strafeL) : CLIP.walk, ph: a.phase, loop: true };
  return { clip: CLIP.idle, ph: a.phase, loop: true };
}
export function posePlayer(g, P_, dt, timing, rail){
  if (g.userData.proto) return P.posePlayer(g, P_, dt, timing);
  const u = g.userData, t = performance.now() / 1000; g.position.set(WX(P_.pos[0]), P_.pos[1], P_.pos[2]);
  const W = want(P_, rail), act = u.acts[W.clip] || u.acts[CLIP.idle]; if (!act) return;
  // 가중치 교차(0.08초) — 1회 동작은 더 빠르게
  const fast = W.clip !== CLIP.idle && !W.loop; const k = 1 - Math.exp(-dt / (fast ? .04 : .09));
  for (const [name, a] of Object.entries(u.acts)) { const target = name === W.clip ? 1 : 0, w = (u.w.get(name) || 0) + (target - (u.w.get(name) || 0)) * k; if (w < .002 && target === 0) { u.w.delete(name); a.setEffectiveWeight(0); continue; } u.w.set(name, w); a.setEffectiveWeight(w);
    if (name === W.clip) { const dur = a.getClip().duration; let tm = W.railRun ? (W.ph % 1) * dur : W.loop ? (W.ph % 1) * dur : Math.min(dur - .001, W.ph * dur); if (W.hold) tm = Math.min(dur - .001, W.ph * dur); a.time = tm; } }
  u.mixer.update(0);
  // 몸 기울임(옆걸음·회피) — 뿌리에 살짝
  const lean = P_.anim.lower === 'A05' ? Math.sign(P_.vel[0] || 1) * .25 : P_.anim.lower === 'A04' ? Math.sign(P_.vel[0]) * .08 : 0; u.body.rotation.z += (lean - u.body.rotation.z) * Math.min(1, dt * 10);
  u.body.scale.y += ((P_.anim.lower === 'A06' ? .8 : 1) - u.body.scale.y) * Math.min(1, dt * 12);
  u.orb.visible = !!P_.charging; u.orbL.intensity = P_.charging ? 1.5 + P_.charging.ratio * 4 : 0; if (P_.charging) { u.orb.scale.setScalar(.2 + P_.charging.ratio * .9 + Math.sin(t * 22) * .05); const sp = P_.charging.spell; u.orb.material.color.setHex(sp === 'ice' ? 0x8fe8ff : sp === 'lightning' ? 0xfff27a : sp === 'meteor' ? 0xffb46b : sp === 'shield' ? 0xb28cff : 0xff8a3d); u.orbL.color.copy(u.orb.material.color); }
  u.tip.rotation.y += dt * 2.5;
  u.flash = Math.max(0, u.flash - dt * 4); const fl = u.flash > 0 ? .9 : 0; for (const m of u.mats) m.emissive && m.emissive.setRGB(fl, fl * .12, fl * .12);
  g.visible = !(P_.invuln && Math.floor(t * 18) % 2 === 0 && P_.anim.lower !== 'A05');
  u.aura.visible = u.auraRing.visible = !!P_.empowered; if (P_.empowered) { u.aura.material.opacity = .1 + .07 * Math.sin(t * 7); u.auraRing.rotation.z += dt * 1.5; const kk = P_.empowerT != null ? P_.empowerT : 1; u.auraRing.scale.setScalar(.8 + .4 * kk); }
}
export function tipWorld(g, out){ return g.userData.proto ? P.tipWorld(g, out) : g.userData.tip.getWorldPosition(out); }

// ── 마법 슬라임(06 문서 2절): 젤리 몸(투명·광택·안쪽 핵) + 정점 출렁임 셰이더 + 눈 + 입. 상태별 찌그러짐·늘어남은 poseSlime
const jellyGeo = new THREE.SphereGeometry(.45, 40, 28);
function jellyMat(hue, big){
  const m = new THREE.MeshPhysicalMaterial({ color: hue, roughness: .12, metalness: 0, clearcoat: 1, clearcoatRoughness: .08, transparent: true, opacity: .86, emissive: hue.clone().multiplyScalar(.25), side: THREE.FrontSide });
  m.userData.time = { value: 0 }; m.userData.wob = { value: 0 }; m.userData.seed = { value: Math.random() * 10 };
  m.onBeforeCompile = sh => { sh.uniforms.uTime = m.userData.time; sh.uniforms.uWob = m.userData.wob; sh.uniforms.uSeed = m.userData.seed;
    sh.vertexShader = 'uniform float uTime; uniform float uWob; uniform float uSeed;\n' + sh.vertexShader.replace('#include <begin_vertex>',
      `#include <begin_vertex>
      { float a = uTime * 7.0 + uSeed; float wob = (0.5 + uWob) * 0.045;
        float d = sin(position.y * 9.0 + a) * sin(position.x * 7.0 - a * 0.7) * sin(position.z * 8.0 + a * 1.3);
        transformed += normal * d * wob * (0.4 + position.y + 0.45); }`); };
  return m;
}
export function makeSlime(e){
  const g = new THREE.Group(); const big = e.kind === 'big-slime', mini = e.tags && e.tags.includes('mini');
  const hue = new THREE.Color().setHSL((parseInt(e.label || '1', 10) * .11) % 1, big ? .8 : .7, big ? .5 : mini ? .66 : .58);
  const mat = jellyMat(hue, big); const jelly = new THREE.Mesh(jellyGeo, mat); jelly.position.y = .4; jelly.scale.set(1, .85, 1); jelly.castShadow = true; g.add(jelly);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 1), new THREE.MeshBasicMaterial({ color: 0xfff3c4, transparent: true, opacity: .9 })); core.position.y = .36; g.add(core);
  const glow = new THREE.PointLight(hue, .6, 2.2, 2); glow.position.y = .4; g.add(glow);
  const eyeM = new THREE.MeshStandardMaterial({ color: 0x1b1630, roughness: .3 }), whiteM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .4 }); const eyes = [];
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.SphereGeometry(.085, 12, 10), whiteM); w.position.set(s * .15, .5, .36); w.scale.set(1, 1.2, .5); g.add(w); const p = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), eyeM); p.position.set(s * .15, .5, .41); g.add(p); const hl = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.position.set(s * .16, .53, .45); g.add(hl); eyes.push(w, p, hl); }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(.06, .015, 6, 12, Math.PI), eyeM); mouth.position.set(0, .4, .42); mouth.rotation.z = Math.PI; g.add(mouth);
  const spec = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55, depthWrite: false })); spec.position.set(-.18, .62, .22); spec.scale.set(1.4, .7, .5); g.add(spec);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.5, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = .015; g.add(shadow);
  const num = textSprite(e.label || '', { scale: .55 }); num.position.y = 1.15; g.add(num);
  const bar = new THREE.Group(); const bg = new THREE.Mesh(new THREE.PlaneGeometry(.7, .08), new THREE.MeshBasicMaterial({ color: 0x1b1630, depthTest: false, transparent: true, opacity: .7 })); const fg = new THREE.Mesh(new THREE.PlaneGeometry(.7, .08), new THREE.MeshBasicMaterial({ color: 0x5cf29a, depthTest: false }));
  fg.position.z = .001; bg.renderOrder = fg.renderOrder = 11; bar.add(bg, fg); bar.position.y = .92; g.add(bar);
  if (big) { const crown = new THREE.Mesh(new THREE.ConeGeometry(.13, .22, 5), new THREE.MeshStandardMaterial({ color: 0xffd45c, emissive: 0x7a5410, roughness: .3, metalness: .6 })); crown.position.set(0, .84, 0); g.add(crown); num.scale.setScalar(.7); }
  g.userData = { jelly, core, num, bar, fg, flash: 0, mat, hue, glow, eyes, mouth, spec, shadow, k: e.scale || 1, hop: 0, land: 0, lastState: e.state };
  return g;
}
export function poseSlime(g, e, dt, cam, gameT){
  const u = g.userData, t = performance.now() / 1000; g.position.set(WX(e.pos[0]), 0, e.pos[2]); g.rotation.y = -e.yaw;
  let sx = 1, sy = .85, y = .4, op = .86, sc = 1, wob = 0;
  if (e.state !== u.lastState) { if (e.state === 'attack') u.hop = 1; if (u.lastState === 'attack') u.land = 1; u.lastState = e.state; }
  u.hop = Math.max(0, u.hop - dt * 2.6); u.land = Math.max(0, u.land - dt * 5);
  if (e.state === 'spawn') { sc = ease(Math.min(1, e.stateT / .6)); y = .4 * sc; sy = .85 * (1 + (1 - sc) * .5); }
  else if (e.state === 'chase' || e.state === 'recover' || e.state === 'idle') { const b = Math.abs(Math.sin(t * 5.5 + e.uid)); y = .4 + b * .16; sy = .85 + b * .12 - (1 - b) * .05; sx = 1 - b * .07; wob = .3; }
  else if (e.state === 'windup' && e.telegraph) { const k = Math.min(1, (gameT - e.telegraph.t0) / (e.telegraph.t1 - e.telegraph.t0)); sy = .85 - k * .32; sx = 1 + k * .25; wob = k; y = .4 - k * .1; }
  else if (e.state === 'attack') { const h = Math.sin(u.hop * Math.PI); sy = 1.15 + h * .2; sx = .85; y = .4 + h * .6; wob = .8; }
  else if (e.state === 'hurt' || e.state === 'stagger') { sx = 1.2; sy = .66; wob = 1; }
  else if (e.state === 'dead') { sc = Math.max(0, 1 - e.stateT / .6); sy = .5; sx = 1.5; op = .5 * sc; }
  const land = Math.sin(u.land * Math.PI) * .25; sy -= land; sx += land * .6;
  g.scale.setScalar(sc * (e.scale || u.k || 1)); u.jelly.scale.set(sx, sy, sx); u.jelly.position.y = y; u.core.position.y = y; u.core.rotation.y += dt * 2; u.core.rotation.x += dt * 1.3;
  u.mat.userData.time.value = t; u.mat.userData.wob.value = wob;
  for (let i = 0; i < u.eyes.length; i++) { const m = u.eyes[i]; m.position.y = (i % 3 === 2 ? .53 : .5) * sy / .85 * (y / .4) + .02; } u.mouth.position.y = .4 * sy / .85 * (y / .4); u.mouth.scale.setScalar(e.state === 'windup' || e.state === 'attack' ? 1.8 : 1); u.spec.position.y = .62 * sy / .85 * (y / .4);
  u.flash = Math.max(0, u.flash - dt * 6); const red = e.state === 'windup' ? (Math.sin(t * 18) * .5 + .5) * .5 : 0;
  u.mat.color.copy(u.hue).lerp(new THREE.Color(1, 1, 1), u.flash).lerp(new THREE.Color(1, .25, .2), red); u.mat.emissive.copy(u.hue).multiplyScalar(.25 + u.flash * .8 + red * .6); u.mat.opacity = op; u.glow.intensity = (.5 + red * 1.5 + u.flash) * sc;
  u.shadow.scale.setScalar(sx * (1 - (y - .4) * .5)); u.shadow.material.opacity = .28 * sc;
  u.fg.scale.x = Math.max(.001, e.hp / e.hpMax); u.fg.position.x = -.35 * (1 - u.fg.scale.x); u.bar.quaternion.copy(cam.quaternion); u.bar.visible = e.hp < e.hpMax && e.state !== 'dead';
  if (u.num.userData.text !== e.label) { u.num.userData.text = e.label; u.num.userData.set(e.label || ''); }
}

// ── 수학 수정(GLB 크리스털 + 발광 + 점광)
export function makeCrystal(c = {}){
  if (!A.crystal.length) return P.makeCrystal(c);
  const em = c.kind === 'empower', col = em ? 0xffd45c : 0x7ae7ff, def = A.crystal[(c.uid || 0) % A.crystal.length];
  const g = new THREE.Group(); const m = new THREE.Mesh(def.geo, crystalMat(col, em ? 0x8a5a10 : 0x1a6b8a)); m.scale.setScalar(em ? 1.4 : 1.1); m.position.y = -.45; m.castShadow = true; g.add(m);
  const light = new THREE.PointLight(col, 1.2, 4.5, 2); g.add(light);
  const q = textSprite(em ? '★' : '?', { scale: .5, color: em ? '#fff8d6' : '#fffbe0' }); q.position.y = .15; g.add(q);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1.5, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; g.add(ring);
  const life = em ? new THREE.Mesh(new THREE.RingGeometry(.62, .7, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })) : null; if (life) { life.rotation.x = -Math.PI / 2; g.add(life); }
  g.userData = { m, q, ring, life, em, light, glb: true }; return g;
}
export function poseCrystal(g, c, dt){ if (!g.userData.glb) return P.poseCrystal(g, c, dt);
  const u = g.userData, t = performance.now() / 1000; g.position.set(WX(c.pos[0]), c.pos[1] + Math.sin(t * 2 + c.uid) * .15, c.pos[2]); u.m.rotation.y += dt * (u.em ? 2.2 : 1.2);
  u.ring.position.y = -g.position.y + .03; u.ring.material.opacity = c.near ? .35 + Math.sin(t * 8) * .15 : .08; const s = (c.near ? 1.25 : 1.1) * (u.em ? 1.3 + .05 * Math.sin(t * 6) : 1); u.m.scale.setScalar(s); u.light.intensity = c.near ? 2.2 + Math.sin(t * 8) * .6 : 1.0;
  if (u.life) { u.life.position.y = -g.position.y + .04; const k = c.life != null ? c.life : 1; u.life.scale.setScalar(.6 + 1.3 * k); u.life.material.opacity = .5 + .4 * (k < .3 ? Math.sin(t * 10) * .5 + .5 : 1); } }

// ── 길 위 물건: 바위·상자·버섯 = GLB, 반딧불 = 빛 + 점광, 가지 = proto
const rockMat = vcMat(), chestMat = vcMat({ roughness: .6 }), mushMat = vcMat({ roughness: .7 });
export function makeObstacle(o){
  if (o.kind === 'rock' && A.rock.length) { const def = A.rock[o.uid % A.rock.length], g = new THREE.Group(); g.userData = { kind: 'rock', t: Math.random() * 7, glb: true };
    const m = new THREE.Mesh(def.geo, rockMat); const sx = o.r * 2 / Math.max(.3, def.r * 2); m.scale.set(sx, o.h / def.h, sx * .9); m.rotation.y = o.uid; m.castShadow = true; m.receiveShadow = true; g.add(m); return g; }
  if (o.kind === 'chest' && A.chest) { const g = new THREE.Group(); g.userData = { kind: 'chest', t: Math.random() * 7, glb: true };
    const closed = new THREE.Mesh(A.chest.geo, chestMat), open = new THREE.Mesh(A.chestOpen ? A.chestOpen.geo : A.chest.geo, chestMat); closed.castShadow = open.castShadow = true; open.visible = false; closed.rotation.y = open.rotation.y = Math.PI; g.add(closed, open);
    const light = new THREE.PointLight(0xffd45c, .9, 3.5, 2); light.position.y = .6; g.add(light); const ring = new THREE.Mesh(new THREE.RingGeometry(.8, 1.1, 40), new THREE.MeshBasicMaterial({ color: 0xffd45c, transparent: true, opacity: .4, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = .02; g.add(ring);
    const coins = new THREE.Group(); coins.visible = false; if (A.coin) for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(A.coin.geo, new THREE.MeshStandardMaterial({ vertexColors: true, metalness: .7, roughness: .3, emissive: 0x4a3410 })); c.position.set((i - 2.5) * .12, .5, 0); c.rotation.x = Math.PI / 2; coins.add(c); } g.add(coins);
    Object.assign(g.userData, { closed, open, ring, light, coins, openK: 0 }); return g; }
  if (o.kind === 'mushroom' && A.mushroom.length) { const def = A.mushroom[o.uid % A.mushroom.length], g = new THREE.Group(); g.userData = { kind: 'mushroom', t: Math.random() * 7, glb: true, sq: 0 };
    const m = new THREE.Mesh(def.geo, mushMat); const s = o.r * 2 / Math.max(.3, def.r * 2); m.scale.set(s, s, s); m.castShadow = true; g.add(m); g.userData.cap = m; g.userData.s = s;
    const ring = new THREE.Mesh(new THREE.RingGeometry(o.r * .9, o.r * 1.15, 32), new THREE.MeshBasicMaterial({ color: 0xffc8b0, transparent: true, opacity: .3, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = .02; g.add(ring); g.userData.ring = ring; return g; }
  if (o.kind === 'firefly') { const g = P.makeObstacle(o); const l = new THREE.PointLight(0xfff1a8, .8, 3, 2); g.add(l); g.userData.light = l; g.userData.glb = true; return g; }
  return P.makeObstacle(o);
}
export function poseObstacle(g, o, dt, gameT){
  const u = g.userData; if (!u.glb) return P.poseObstacle(g, o, dt, gameT);
  u.t += dt; g.position.set(WX(o.pos[0]), o.pos[1] || 0, o.pos[2]);
  if (o.lit === false) { g.visible = false; return; } if (o.kind !== 'firefly') g.visible = true;
  if (o.kind === 'firefly') { P.poseObstacle(g, o, dt, gameT); if (u.light) u.light.intensity = g.visible ? .5 + .5 * Math.sin(u.t * 6) : 0; }
  else if (o.kind === 'chest') { u.ring.rotation.z += dt; u.ring.material.opacity = .25 + .2 * Math.sin(u.t * 4); u.light.intensity = .6 + .4 * Math.sin(u.t * 3);
    if (o.state === 'taken') { u.openK = Math.min(1, u.openK + dt * 3); u.closed.visible = false; u.open.visible = true; u.coins.visible = true; u.coins.position.y = u.openK * .8; u.coins.rotation.y += dt * 2; u.coins.children.forEach((c, i) => { c.position.y = Math.sin(u.openK * Math.PI) * (.3 + i * .08); }); u.ring.material.opacity *= (1 - u.openK); } }
  else if (o.kind === 'mushroom') { const breathe = 1 + Math.sin(u.t * 2.2) * .03; if (o.state === 'bounced') u.sq = Math.min(u.sq + dt * 6, 1); const sqz = u.sq ? Math.sin(u.sq * Math.PI) * .35 : 0; const s = u.s; u.cap.scale.set(s * breathe * (1 + sqz * .5), s * breathe * (1 - sqz), s * breathe * (1 + sqz * .5)); u.ring.material.opacity = o.state === 'ahead' ? .25 + .15 * Math.sin(u.t * 4) : 0; }
  else if (o.kind === 'rock' && o.state === 'hit') g.position.y = -.08;
}
