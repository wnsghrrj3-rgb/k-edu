// 케이히스토리 엔진 · beasts.js — 「짐승 층」. world.beasts 가 있으면 켜진다. 코어는 시대 이름을 모른다. (?beasts=0 끔)
//  · 위험층(danger.js)의 늑대는 「밤에 불 밖」이면 어디서나 눈 두 쌍으로 온다. 짐승 층은 **보인다** — 그 자리에서만(산길·깊은 숲·들) 호랑이·멧돼지가 실제로 서 있고, 다가오고, 달아난다.
//  · 호랑이(밤, 사람 사는 곳 밖 — world.beasts.tiger.areas): 풀 속에 줄무늬가 선다 → 천천히 7m 까지 다가와 돈다(으르렁) → **뛰면 덮친다**(쓰러짐 → 체크포인트) / 가만히 서서 마주 보면 돌아선다 / 걸어서 멀어지면 놓아준다 / 횃불·창·활은 더 빨리 물러서게 한다.
//  · 멧돼지(낮, 들·밭·숲 가장자리 — world.beasts.boar.areas): 코로 땅을 뒤지며 돌아다닌다 → 4m 안에 들면 멈춰 노려봄(물러서면 다시 뒤진다) → 3m 안이면 **받는다**(넘어져 먹을 것 하나 잃음, 흔적 없음) → 달아난다 / 횃불·창·활·도끼를 들고 있으면 먼저 달아난다.
//  · 곰(113, 낮·밤, 굴·깊은 산 — world.beasts.bear.areas, **겨울엔 안 나온다** — 겨울잠): 냄새를 따라 느릿느릿 와서 6m 에서 **일어선다**(으르렁) → 뛰면 쫓아와 덮친다 / 2.6m 안이면 앞발 / 가만히 서면 먹을 것 하나를 던져 주고(있으면) 그 사이 물러나게 된다·없으면 한참 노려보다 돌아선다 / 걸어서 14m 밖이면 놓아준다 / 불·횃불이면 안 온다.
//  · 발자국(113): 길 위의 일 가운데 beast 가 붙은 자국을 「따라가 보면」(then.lure) 그 자리 둘레에 그 짐승이 선다 — lure(kind, 자리). 호랑이는 발자국을 따라가면 낮에도 온다.
//  · 덮침·받힘·앞발엔 화면이 흔들리고 가장자리가 한 번 붉어진다(jolt — pulse 붉은 테 재사용).
//  · 모양은 GLB 없이 코드로(늑대 틀 그대로 — 몸통·머리·다리 넷·꼬리, 다리는 걸음 흔들림). 값·깃발엔 거의 손대지 않는다(beast:tiger:met·faced·boar:hit 정도). 한 번 만나면 cooldownSec 뒤에야 다시.
import * as THREE from 'three';
import { recordBeast } from './dogam.js';
const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.85, metalness: 0, flatShading: !!o.flat, name: o.name || '' });
const mesh = (parent, geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };

/** 줄무늬 질감(브라우저에서만) — 캔버스 없으면 그냥 주황 */
function stripeMat(base, dark) {
  const mat = M(base, { name: 'tiger_fur' }); if (typeof document === 'undefined' || typeof document.createElement !== 'function') return mat;
  try { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d'); if (!x) return mat; x.fillStyle = '#' + base.toString(16).padStart(6, '0'); x.fillRect(0, 0, 128, 64); x.fillStyle = '#' + dark.toString(16).padStart(6, '0'); for (let i = 0; i < 9; i++) { const px = 6 + i * 14 + (i % 2) * 3; x.beginPath(); x.moveTo(px, 0); x.lineTo(px + 5, 0); x.lineTo(px + 2, 64); x.lineTo(px - 3, 64); x.closePath(); x.fill(); } const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(2, 1); mat.map = tx; mat.color.set(0xffffff); } catch { /* 질감 없이 */ }
  return mat;
}
/** 짐승 모양 — 'tiger' | 'boar'. 늑대 틀(몸통 캡슐·머리·다리 넷·꼬리)에 종류별 색·비율. userData.legs 로 걸음 흔들림. 앞은 +x */
export function beastModel(kind) {
  const g = new THREE.Group(); const legs = [];
  if (kind === 'tiger') {
    const fur = stripeMat(0xd0872a, 0x241c15); const belly = M(0xf0e2c4, { name: 'belly' }); const dark = M(0x1e1813, { name: 'dark' });
    const body = mesh(g, new THREE.CapsuleGeometry(0.34, 1.35, 4, 10), fur, 0, 0.78, 0); body.rotation.z = Math.PI / 2;
    mesh(g, new THREE.CapsuleGeometry(0.22, 1.1, 3, 8), belly, 0, 0.6, 0).rotation.z = Math.PI / 2;
    const neck = mesh(g, new THREE.CylinderGeometry(0.2, 0.26, 0.5, 8), fur, 0.85, 0.86, 0); neck.rotation.z = -1.1;
    const head = mesh(g, new THREE.BoxGeometry(0.44, 0.36, 0.4), fur, 1.15, 0.92, 0); head.name = 'head';
    mesh(g, new THREE.BoxGeometry(0.2, 0.14, 0.26), belly, 1.37, 0.84, 0);   // 주둥이
    for (const z of [-0.14, 0.14]) { mesh(g, new THREE.ConeGeometry(0.07, 0.14, 5), dark, 1.08, 1.13, z); mesh(g, new THREE.SphereGeometry(0.04, 6, 5), M(0xf3d26a, { rough: 0.3, name: 'eye' }), 1.34, 0.98, z * 0.9); }
    for (const [x, z] of [[0.55, -0.2], [0.55, 0.2], [-0.5, -0.22], [-0.5, 0.22]]) { const l = mesh(g, new THREE.CylinderGeometry(0.09, 0.07, 0.82, 7), fur, x, 0.42, z); l.userData.base = 0.42; legs.push(l); }
    const tail = mesh(g, new THREE.CylinderGeometry(0.035, 0.06, 1.0, 6), fur, -1.25, 0.95, 0); tail.rotation.z = 1.25; tail.name = 'tail';
  } else if (kind === 'bear') {
    // 반달가슴곰 — 검은 털·가슴 흰 반달·둥근 귀. 몸은 rig(뒷다리 엉덩이를 축)에 달아 일어설 수 있게(rig.rotation.z)
    const fur = M(0x1c1814, { name: 'bear_fur' }); const moon = M(0xece6d6, { name: 'moon' }); const muzzle = M(0x6b5844, { name: 'muzzle' }); const rig = new THREE.Group(); rig.name = 'rig'; rig.position.set(-0.55, 0, 0); g.add(rig);
    const body = mesh(rig, new THREE.CapsuleGeometry(0.48, 0.95, 4, 10), fur, 0.6, 0.85, 0); body.rotation.z = Math.PI / 2;
    const chest = mesh(rig, new THREE.BoxGeometry(0.06, 0.16, 0.62), moon, 1.28, 0.95, 0); chest.name = 'moon';   // 가슴 반달
    const head = mesh(rig, new THREE.SphereGeometry(0.33, 10, 8), fur, 1.42, 1.08, 0); head.scale.set(1.1, 0.95, 1); head.name = 'head';
    mesh(rig, new THREE.BoxGeometry(0.26, 0.18, 0.22), muzzle, 1.72, 1.0, 0);
    mesh(rig, new THREE.SphereGeometry(0.05, 6, 5), M(0x0b0908, { rough: 0.3, name: 'nose' }), 1.86, 1.04, 0);
    for (const z of [-0.2, 0.2]) { mesh(rig, new THREE.SphereGeometry(0.1, 7, 6), fur, 1.36, 1.38, z); mesh(rig, new THREE.SphereGeometry(0.035, 6, 5), M(0x0b0908, { rough: 0.3, name: 'eye' }), 1.66, 1.16, z * 0.6); }
    for (const [x, z] of [[1.0, -0.26], [1.0, 0.26], [0.2, -0.28], [0.2, 0.28]]) { const l = mesh(rig, new THREE.CylinderGeometry(0.15, 0.12, 0.62, 8), fur, x, 0.31, z); l.userData.base = 0.31; legs.push(l); }
    const tail = mesh(rig, new THREE.SphereGeometry(0.09, 6, 5), fur, -0.1, 0.95, 0); tail.name = 'tail';
  } else {
    const fur = M(0x3a2a1e, { name: 'boar_fur' }); const dark = M(0x241a12, { name: 'dark' }); const tusk = M(0xe9e2cf, { rough: 0.4, name: 'tusk' });
    const body = mesh(g, new THREE.CapsuleGeometry(0.32, 0.8, 4, 10), fur, 0, 0.55, 0); body.rotation.z = Math.PI / 2;
    mesh(g, new THREE.BoxGeometry(0.9, 0.12, 0.22), dark, 0, 0.9, 0);   // 등 갈기
    const head = mesh(g, new THREE.ConeGeometry(0.3, 0.75, 8), fur, 0.75, 0.5, 0); head.rotation.z = -Math.PI / 2; head.name = 'head';
    mesh(g, new THREE.CylinderGeometry(0.1, 0.12, 0.1, 8), dark, 1.14, 0.45, 0).rotation.z = Math.PI / 2;   // 코
    for (const z of [-0.12, 0.12]) { const t = mesh(g, new THREE.ConeGeometry(0.03, 0.22, 5), tusk, 1.02, 0.4, z); t.rotation.set(0, 0, 0.5); mesh(g, new THREE.ConeGeometry(0.06, 0.12, 5), dark, 0.75, 0.78, z * 1.3); mesh(g, new THREE.SphereGeometry(0.03, 6, 5), M(0x120d0a, { rough: 0.3, name: 'eye' }), 0.98, 0.62, z * 1.4); }
    for (const [x, z] of [[0.38, -0.18], [0.38, 0.18], [-0.38, -0.2], [-0.38, 0.2]]) { const l = mesh(g, new THREE.CylinderGeometry(0.07, 0.06, 0.5, 6), dark, x, 0.25, z); l.userData.base = 0.25; legs.push(l); }
    const tail = mesh(g, new THREE.CylinderGeometry(0.02, 0.03, 0.35, 5), dark, -0.72, 0.72, 0); tail.rotation.z = 0.9; tail.name = 'tail';
  }
  g.userData.legs = legs; g.userData.kind = kind; g.userData.t = 0;
  return g;
}

const DEF = { bear: { r: 14, waitSec: 5, chance: 0.6, cooldownSec: 140, far: 20, rear: 6, swipeR: 2.6, stillSec: 7, feedSec: 4, leaveR: 14, speed: 1.0, charge: 8.5 }, tiger: { r: 16, waitSec: 5, chance: 0.75, cooldownSec: 150, far: 18, keep: 7, stillSec: 6, walkSec: 14, speed: 0.95, lunge: 9 }, boar: { r: 14, waitSec: 4, chance: 0.6, cooldownSec: 90, far: 14, alertR: 4.2, chargeR: 3.0, staySec: 90, speed: 0.6, charge: 7, flee: 6.5 } };
const KINDS = ['tiger', 'bear', 'boar'];
const WEAPON = ['spear', 'bow', 'axe', 'handaxe', 'sword', 'blade', 'gun'];

export class Beasts {
  constructor(g, cfg) {
    this.g = g; this.cfg = cfg || {}; this.cur = null; this.hold = { tiger: 0, boar: 0, bear: 0 }; this.cool = { tiger: 0, boar: 0, bear: 0 }; this.lured = null; this.jolts = 0; this.t = 0; this.prev = null; this.vel = 0; this.runT = 0; this.firstSeen = new Set();
    this.k = { tiger: { ...DEF.tiger, ...(cfg?.tiger || {}) }, boar: { ...DEF.boar, ...(cfg?.boar || {}) }, bear: { ...DEF.bear, ...(cfg?.bear || {}) } };
  }
  /** 다른 층이 보는 「짐승이 나와 있다」 — 위험층 늑대·길 위의 일은 그동안 쉰다 */
  get busy() { return !!this.cur; }
  /** 겨울 — 곰은 겨울잠(하늘 winter 또는 눈) */
  get winter() { const s = this.g.story; return !!(s && (s.skyName === 'winter' || s.snowOn)); }
  get night() { const s = this.g.story; return !!(s && (s.isNight != null ? s.isNight : (s.nightOn && s.skyName === 'night'))); }
  safe(p) { const d = this.g.danger; if (d?.hasTorch?.()) return true; const f = d?.firePos?.(); if (f && dist2(p, f) < (d.cfg?.nightRadius || 9)) return true; return (d?.cfg?.safe || []).some(([x, z, r]) => Math.hypot(p.x - x, p.z - z) < r); }
  weapon() { const g = this.g; return WEAPON.some((k) => g.has?.(k)) || !!g.danger?.hasTorch?.(); }
  /** 플레이어가 kind 의 자리(areas 중심 r 안)에 있나 → 그 자리 이름 */
  zoneOf(kind) { const g = this.g; const K = this.k[kind]; const p = g.p.pos; for (const name of K.areas || []) { const a = g.e.areas?.get(name); if (a && dist2(p, a) < (K.r || 16)) return name; } return null; }
  quiet() { const g = this.g; return !g.ui.isOpen?.() && !g.story?.cutsceneOn && !g.danger?.enc && !g.danger?.eyesOn && !g.danger?.collapsing && g.p?.enabled !== false && !g.restoring; }
  /** 플레이어에게서 far m 떨어진 땅 자리(깊은 물·건물 밖·땅 안) — 뒤쪽부터 */
  spot(far, front) {
    const g = this.g; const e = g.e; const p = g.p; const B = (g.world.bounds || 116) - 6; const hit = e.collides ? (x, z) => e.collides({ x, z }, 1.6) : () => false;
    for (const off of front ? [0, 0.6, -0.6, Math.PI / 2, -Math.PI / 2, Math.PI] : [Math.PI, Math.PI + 0.7, Math.PI - 0.7, Math.PI / 2, -Math.PI / 2, 0.5, -0.5]) { const yaw = p.yaw + off; for (const d of [far, far * 0.8, far * 1.2]) { const x = p.pos.x - Math.sin(yaw) * d, z = p.pos.z - Math.cos(yaw) * d; if (Math.abs(x) > B || Math.abs(z) > B) continue; const gy = e.groundY ? e.groundY(x, z) : 0; if (g.world.deepWater != null && gy < g.world.deepWater) continue; if (hit(x, z)) continue; return { x, z }; } }
    return null;
  }
  tick(dt) {
    const g = this.g; const p = g.p; if (!p?.pos || g.restoring) return;
    // 내 속도(달리기 판정 — player 에 run 깃발이 없어 자리 변화로)
    if (this.prev) { const v = dist2(p.pos, this.prev) / Math.max(dt, 1e-3); this.vel = this.vel * 0.6 + v * 0.4; } this.prev = { x: p.pos.x, z: p.pos.z };
    this.runT = this.vel > 5 ? this.runT + dt : 0;
    for (const k of KINDS) if (this.cool[k] > 0) this.cool[k] -= dt;
    if (this.cur) return this.tickCur(dt);
    this.t += dt; if (this.t < 0.5) return; const step = this.t; this.t = 0;
    if (!this.quiet()) return;
    if (this.lured && this.tickLure(step)) return;
    const night = this.night;
    for (const kind of KINDS) {
      const K = this.k[kind]; if (!K.areas?.length || this.cool[kind] > 0) { this.hold[kind] = 0; continue; }
      if (kind === 'tiger' ? (!night || this.safe(p.pos)) : kind === 'bear' ? (this.winter || this.safe(p.pos)) : night) { this.hold[kind] = 0; continue; }
      const zone = this.zoneOf(kind); if (!zone) { this.hold[kind] = Math.max(0, this.hold[kind] - step); continue; }
      this.hold[kind] += step; if (this.hold[kind] < K.waitSec) continue; this.hold[kind] = 0;
      if (Math.random() > (K.chance ?? 0.7)) { this.cool[kind] = 20; continue; }
      const at = this.spot(K.far); if (!at) { this.cool[kind] = 12; continue; }
      this.spawn(kind, at, zone); return;
    }
  }
  /** 발자국을 따라갔다 — 그 자리 둘레(24m 안)에 오래 있으면 그 짐승이 선다. 시대에 그 짐승이 없으면 아무 일 없음 */
  lure(kind, at) { const K = this.k[kind]; if (!K?.areas?.length || !at || this.cur) return false; this.lured = { kind, x: at.x, z: at.z, t: 0, hold: 0 }; this.g.flags?.add?.('beast:' + kind + ':lured'); return true; }
  tickLure(step) {
    const g = this.g; const L = this.lured; L.t += step; if (L.t > (this.k[L.kind].lureSec || 150)) { this.lured = null; return false; }
    if (dist2(g.p.pos, L) > 24) { L.hold = 0; return false; }
    if (L.kind === 'bear' && this.winter) { this.lured = null; g.ui.say(this.k.bear.winterSay || '…자국은 오래된 것이다. 곰은 벌써 굴에 들어 잠을 잔다.', 3600); return false; }
    if (this.safe(g.p.pos)) return false;
    L.hold += step; if (L.hold < 2.5) return false;
    const at = this.spot(this.k[L.kind].far * 0.8, true); if (!at) return false;
    this.lured = null; this.cool[L.kind] = 0; this.spawn(L.kind, at, 'trail'); this.cur.lured = true; g.flag?.('beast:' + L.kind + ':tracked'); return true;
  }
  /** 덮침·받힘·앞발 — 화면이 흔들리고 가장자리가 한 번 붉어진다 */
  jolt(power = 1) {
    const g = this.g; this.jolts++; const el = g.e.renderer?.domElement;
    try { if (el?.animate) { const a = Math.round(7 * power); el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${a}px,${-a * 0.6}px)` }, { transform: `translate(${-a}px,${a * 0.5}px)` }, { transform: `translate(${a * 0.5}px,${a * 0.4}px)` }, { transform: 'translate(0,0)' }], { duration: 380 + 120 * power }); }
      const fx = g.pulse?.fx; if (fx?.animate) fx.animate([{ opacity: Math.min(1, 0.55 + 0.35 * power) }, { opacity: 0 }], { duration: 700 }); } catch { /* 흔들림 없이 */ }
  }
  spawn(kind, at, zone) {
    const g = this.g; const e = g.e; const obj = beastModel(kind); obj.position.set(at.x, e.groundY ? e.groundY(at.x, at.z) : 0, at.z);   // 앞(+x)은 face() 가 맞춘다
    if (e.scene?.add) e.scene.add(obj);
    const K = this.k[kind]; this.cur = { kind, obj, zone, t: 0, mode: kind === 'tiger' ? 'stalk' : kind === 'bear' ? 'approach' : 'root', rearT: 0, still: 0, walk: 0, growl: 0, origin: { x: at.x, z: at.z }, goal: null, hit: false, seen: false };
    this.face(obj, g.p.pos); g.flag?.('beast:' + kind + ':near');
    if (kind === 'tiger') { g.sound?.play?.('tiger', 0.5); g.sound?.thump?.(0.3); g.ui.say(K.see || '…풀 속에 줄무늬. 호랑이다. 뛰지 마.', 4200); g.ui.setGoal?.('가만히. 마주 본다. 뛰지 않는다.'); }
    else if (kind === 'bear') { g.sound?.play?.('bear', 0.4); g.ui.say(K.see || '…나뭇가지 꺾이는 소리. 검고 큰 것. 곰이다. 뛰지 마.', 4200); g.ui.setGoal?.('뛰지 않는다. 가만히 — 또는 천천히 물러난다.'); }
    else { g.sound?.play?.('boar', 0.35); g.ui.say(K.see || '…코로 땅을 뒤지는 소리. 멧돼지다. 너무 가까이 가지 마.', 3800); }
    this.fact(kind);
  }
  /** 처음 본 종류엔 📜 한 줄(시대 데이터 fact 가 있으면 그것) — 판마다 한 번 */
  fact(kind) { const g = this.g; const K = this.k[kind]; if (this.firstSeen.has(kind) || g.flags.has('beast:' + kind + ':seen')) return; this.firstSeen.add(kind); g.flags.add('beast:' + kind + ':seen'); if (K.fact) setTimeout(() => { if (!g.ui.isOpen?.()) g.ui.say('📜 ' + K.fact, 6200); }, 4600); }
  /** 앞(+x)이 to 를 보게 */
  face(obj, to, lerp) { const yaw = Math.atan2(to.x - obj.position.x, to.z - obj.position.z) - Math.PI / 2; if (lerp == null) { obj.rotation.y = yaw; return; } let d = yaw - obj.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); obj.rotation.y += d * Math.min(1, lerp); }
  move(obj, to, speed, dt) { const d = dist2(obj.position, to); if (d < 1e-3) return d; const k = Math.min(d, speed * dt) / d; obj.position.x += (to.x - obj.position.x) * k; obj.position.z += (to.z - obj.position.z) * k; const e = this.g.e; if (e.groundY) obj.position.y = e.groundY(obj.position.x, obj.position.z); return d; }
  legs(obj, dt, pace) { obj.userData.t += dt * pace; const s = Math.sin(obj.userData.t); obj.userData.legs?.forEach((l, i) => { l.rotation.z = (i % 2 ? s : -s) * (pace > 0.2 ? 0.45 : 0); }); const tail = obj.getObjectByName?.('tail'); if (tail) tail.rotation.x = Math.sin(obj.userData.t * 0.7) * 0.4; }
  away(from, to, len) { const d = dist2(from, to) || 1; return { x: from.x + (from.x - to.x) / d * len, z: from.z + (from.z - to.z) / d * len }; }
  tickCur(dt) {
    const c = this.cur; c.t += dt; if (c.kind === 'tiger') this.tickTiger(c, dt); else if (c.kind === 'bear') this.tickBear(c, dt); else this.tickBoar(c, dt);
  }
  // ---------- 호랑이 ----------
  tickTiger(c, dt) {
    const g = this.g; const K = this.k.tiger; const p = g.p; const obj = c.obj; const d = dist2(obj.position, p.pos);
    if (c.mode === 'gone') return this.remove(c);
    if (c.mode === 'retreat') { this.face(obj, this.away(obj.position, p.pos, 30), 0.2); this.move(obj, this.away(obj.position, p.pos, 30), 3.2, dt); this.legs(obj, dt, 7); if (d > 26 || c.t > 40) this.end(c, c.how || 'faced'); return; }
    if (c.mode === 'lunge') { this.face(obj, p.pos, 0.5); this.move(obj, p.pos, K.lunge, dt); this.legs(obj, dt, 12); if (d < 1.3) { c.mode = 'gone'; this.jolt(1.3); g.flag?.('beast:tiger:caught'); this.rec('tiger', 'caught'); g.danger?.collapse?.('tiger', K.catchSay || '…뛰었다. 그게 더 빨랐다. 뒤에서 덮쳤다.'); } return; }
    // stalk: 7m 까지 다가와 돈다
    if ((!this.night && !c.lured) || this.safe(p.pos) || g.story?.cutsceneOn) { c.mode = 'retreat'; c.how = 'lit'; g.ui.say(K.lightSay || '…불빛을 보고 돌아선다.', 3200); g.ui.setGoal?.(''); return; }
    if (g.danger?.collapsing) return this.remove(c);
    c.growl += dt; if (c.growl > 5) { c.growl = 0; g.sound?.play?.('tiger', 0.35 + Math.max(0, 7 - d) * 0.03); }
    if (this.runT > 0.8 && d < 14) { c.mode = 'lunge'; g.sound?.play?.('tiger', 0.8); g.sound?.thump?.(0.5); g.ui.say('…뛰었다.', 1600); return; }
    if (p.moving) { c.still = 0; c.walk += dt; } else { if (d < 10) c.still += dt; c.walk = 0; }   // 마주 보기는 10m 안에서부터 센다
    const weapon = this.weapon();
    if (c.still > (weapon ? K.stillSec * 0.5 : K.stillSec)) { c.mode = 'retreat'; g.ui.say(weapon ? (K.weaponSay || '…창끝을 보고 멈칫한다. 돌아선다.') : (K.faceSay || '…눈을 피하지 않았다. 돌아선다. 숨을 쉰다.'), 4200); g.ui.setGoal?.(''); return; }
    if (c.walk > K.walkSec && d > 12) { c.mode = 'retreat'; c.how = 'walked'; g.ui.say(K.walkSay || '…걸어서 멀어졌다. 따라오지 않는다.', 3600); g.ui.setGoal?.(''); return; }
    if (d > K.keep) { this.face(obj, p.pos, 0.15); const sp = d > 11 ? K.speed * 2.6 : K.speed; this.move(obj, p.pos, sp, dt); this.legs(obj, dt, sp > 1.5 ? 6 : 3); }   // 멀면 낮게 빨리, 10m 안부터 천천히
    else { // 돈다 — 플레이어 둘레 keep 거리의 원, 눈은 늘 플레이어
      const ang = Math.atan2(obj.position.z - p.pos.z, obj.position.x - p.pos.x) + dt * 0.35; const to = { x: p.pos.x + Math.cos(ang) * K.keep, z: p.pos.z + Math.sin(ang) * K.keep }; this.move(obj, to, 1.2, dt); this.face(obj, p.pos, 0.3); this.legs(obj, dt, 3.5);
    }
    if (c.t > 120) this.end(c, 'passed');   // 너무 오래면 알아서 간다
  }
  // ---------- 곰 ----------
  tickBear(c, dt) {
    const g = this.g; const K = this.k.bear; const p = g.p; const obj = c.obj; const d = dist2(obj.position, p.pos); const rig = obj.getObjectByName?.('rig');
    const stand = (to, k) => { if (rig) rig.rotation.z += (to - rig.rotation.z) * Math.min(1, k * dt); };
    if (c.mode === 'gone') return this.remove(c);
    if (c.mode === 'leave') { stand(0, 4); const to = this.away(obj.position, p.pos, 30); this.face(obj, to, 0.2); this.move(obj, to, 2.6, dt); this.legs(obj, dt, 5); if (d > 28 || c.t > 50) this.end(c, c.how || 'faced'); return; }
    if (c.mode === 'charge') { stand(0, 8); this.face(obj, p.pos, 0.5); this.move(obj, p.pos, K.charge, dt); this.legs(obj, dt, 11); if (d < 1.4) this.maul(c, K.catchSay || '…뛰었다. 곰은 생각보다 훨씬 빨랐다. 뒤에서 덮쳤다.'); return; }
    if (c.mode === 'eat') { stand(0, 4); const head = obj.getObjectByName?.('head'); if (head) head.position.y = 0.85 + Math.sin(c.t * 4) * 0.04; c.eatT += dt; if (c.eatT > 6) { c.how = 'fed'; c.mode = 'leave'; } return; }
    if (g.danger?.collapsing) return this.remove(c);
    if (this.winter || this.safe(p.pos) || g.story?.cutsceneOn) { c.mode = 'leave'; c.how = this.winter ? 'winter' : 'lit'; g.ui.say(this.winter ? '…졸린 듯 돌아선다. 굴로 간다.' : (K.lightSay || '…불 냄새. 곰이 돌아선다.'), 3200); g.ui.setGoal?.(''); return; }
    if (this.runT > 0.8 && d < 16) { c.mode = 'charge'; g.sound?.play?.('bear', 0.9); g.sound?.thump?.(0.5); g.ui.say('…뛰었다. 곰이 네 발로 달려온다.', 1800); return; }
    if (d < K.swipeR) return this.maul(c, K.swipeSay || '…너무 가까이 갔다. 앞발이 날아왔다.');
    c.growl += dt;
    if (c.mode === 'approach') {
      if (d > K.rear) { this.face(obj, p.pos, 0.12); const sp = d > 12 ? K.speed * 2.2 : K.speed; if (Math.sin(c.t * 0.9) > -0.6) { this.move(obj, p.pos, sp, dt); this.legs(obj, dt, sp > 1.5 ? 5 : 2.6); } else this.legs(obj, dt, 0); if (c.growl > 6) { c.growl = 0; g.sound?.play?.('bear', 0.25); } if (c.t > 60) this.end(c, 'passed'); return; }   // 냄새 맡느라 멈칫멈칫
      c.mode = 'rear'; c.rearT = 0; c.still = 0; c.walk = 0; c.d0 = d; g.sound?.play?.('bear', 0.85); g.sound?.thump?.(0.4); g.ui.say(K.rearSay || '…곰이 뒷발로 일어선다. 사람보다 크다. 뛰지 마. 천천히.', 4400); g.flag?.('beast:bear:reared'); return;
    }
    // rear: 처음 2초는 일어서 있고, 그 뒤 네 발로 내려와 노려본다
    c.rearT += dt; stand(c.rearT < 2.2 ? 1.05 : 0, 3); this.face(obj, p.pos, 0.25); this.legs(obj, dt, 0);
    if (c.growl > 4) { c.growl = 0; g.sound?.play?.('bear', 0.3 + Math.max(0, 6 - d) * 0.05); }
    if (d > K.leaveR) { c.mode = 'leave'; c.how = 'walked'; g.ui.say(K.walkSay || '…천천히 물러났다. 곰은 따라오지 않는다.', 3600); g.ui.setGoal?.(''); return; }
    if (p.moving) { c.still = 0; return; }
    c.still += dt; const food = (g.danger?.cfg?.food || ['berry', 'root', 'meat', 'cooked', 'fish', 'shell']); const have = (g.inventory || []).filter((k) => food.includes(k));
    if (have.length && c.still > K.feedSec) {   // 먹을 것 하나를 던져 준다 — 곰은 그것을 먹고, 그 사이 물러난다
      const lost = have.find((k) => k === 'meat' || k === 'fish') || have[0]; g.take?.(lost); g.renderInv?.(); const name = g.world.items?.[lost]?.name || g.items?.items?.[lost]?.name || lost;
      c.mode = 'eat'; c.eatT = 0; g.flag?.('beast:bear:fed'); g.sound?.play?.('eat', 0.3); g.ui.say((K.feedSay || '…「{x}」을(를) 멀리 던졌다. 곰이 코를 박는다. 그 사이 천천히 물러난다.').replace('{x}', name), 4600); g.ui.setGoal?.(''); return;
    }
    if (!have.length && c.still > K.stillSec) { c.mode = 'leave'; c.how = 'faced'; g.ui.say(K.faceSay || '…한참 노려보다 네 발로 내려앉는다. 먹을 게 없다는 걸 안다. 돌아선다.', 4200); g.ui.setGoal?.(''); }
  }
  maul(c, line) { const g = this.g; c.mode = 'gone'; this.jolt(1.3); g.sound?.play?.('bear', 1); g.flag?.('beast:bear:caught'); this.rec('bear', 'caught'); g.danger?.collapse?.('bear', line); }
  // ---------- 멧돼지 ----------
  tickBoar(c, dt) {
    const g = this.g; const K = this.k.boar; const p = g.p; const obj = c.obj; const d = dist2(obj.position, p.pos);
    if (c.mode === 'gone') return this.remove(c);
    if (c.mode === 'flee') { const to = this.away(obj.position, p.pos, 30); this.face(obj, to, 0.3); this.move(obj, to, K.flee, dt); this.legs(obj, dt, 11); if (d > 28 || c.t > 60) this.end(c, c.hit ? 'hit' : 'fled'); return; }
    if (this.night || g.danger?.collapsing) return this.remove(c);
    if (d > 42 || c.t > K.staySec) return this.end(c, 'passed');
    c.growl += dt; if (c.growl > 7) { c.growl = 0; g.sound?.play?.('boar', 0.2 + Math.max(0, 10 - d) * 0.02); }
    if (c.mode === 'charge') {
      this.move(obj, c.goal, K.charge, dt); this.face(obj, c.goal, 0.4); this.legs(obj, dt, 12);
      if (d < 1.1 && !c.hit) { c.hit = true; this.hitPlayer(c); c.mode = 'flee'; return; }
      if (dist2(obj.position, c.goal) < 0.6) { c.mode = 'flee'; g.ui.say(K.missSay || '…스쳐 지나갔다. 그대로 달아난다.', 3000); }
      return;
    }
    if (d < 7 && this.weapon() && c.mode !== 'alert') { c.mode = 'flee'; g.ui.say(K.weaponSay || '…들고 있는 것을 보고 돌아서 달아난다.', 3200); return; }
    if (c.mode === 'alert') {
      this.face(obj, p.pos, 0.3); this.legs(obj, dt, 0); c.still += dt;
      if (d < K.chargeR || (c.still > 1.2 && d < K.alertR)) { c.mode = 'charge'; c.goal = { x: p.pos.x + (p.pos.x - obj.position.x) / (d || 1) * 2.5, z: p.pos.z + (p.pos.z - obj.position.z) / (d || 1) * 2.5 }; g.sound?.play?.('boar', 0.7); g.ui.say('…받는다!', 1400); return; }
      if (d > K.alertR + 1.5) { c.mode = 'root'; c.still = 0; c.goal = null; g.ui.say(K.calmSay || '…다시 코를 땅에 박는다.', 2600); }
      return;
    }
    // root: 자리 둘레 6m 안을 느릿느릿
    if (d < K.alertR) { c.mode = 'alert'; c.still = 0; g.sound?.play?.('boar', 0.5); g.ui.say(K.alertSay || '…고개를 들었다. 노려본다. 물러서.', 3200); return; }
    if (!c.goal || dist2(obj.position, c.goal) < 0.6) { const a = Math.random() * Math.PI * 2; const r = 2 + Math.random() * 5; c.goal = { x: c.origin.x + Math.cos(a) * r, z: c.origin.z + Math.sin(a) * r }; const gy = g.e.groundY ? g.e.groundY(c.goal.x, c.goal.z) : 0; if ((g.world.deepWater != null && gy < g.world.deepWater) || g.e.collides?.({ x: c.goal.x, z: c.goal.z }, 1)) c.goal = { ...c.origin }; }
    this.face(obj, c.goal, 0.1); this.move(obj, c.goal, K.speed, dt); this.legs(obj, dt, 2.2);
    const head = obj.getObjectByName?.('head'); if (head) head.rotation.z = -Math.PI / 2 + Math.sin(c.t * 1.8) * 0.12 - 0.15;
  }
  hitPlayer(c) {
    const g = this.g; const K = this.k.boar; g.sound?.play?.('hurt', 0.6); g.sound?.thump?.(0.6); this.jolt(0.9); g.flag?.('beast:boar:hit');
    const food = g.danger?.cfg?.food || ['berry', 'root', 'meat', 'cooked', 'fish', 'shell']; const have = g.inventory.filter((k) => food.includes(k)); const lost = have.length ? have[0] : null; if (lost) { g.take?.(lost); g.renderInv?.(); }
    const name = lost ? (g.world.items?.[lost]?.name || g.items?.items?.[lost]?.name || lost) : null;
    g.ui.say((K.hitSay || '…받혔다. 넘어진다. 멧돼지는 그대로 달아난다.') + (name ? ` 「${name}」이(가) 흩어졌다.` : ''), 4600);
    if (g.p) { g.p.enabled = false; setTimeout(() => { if (g.p && !g.ui.isOpen?.()) g.p.enabled = true; }, 1300); }
    g.spark?.checkTitles?.(); g.save?.touch?.();
  }
  rec(kind, how) { recordBeast(this.g.era, kind, how); }   // 짐승 도감(114) — 이 기기 kworld_beasts
  end(c, how) { const g = this.g; this.cool[c.kind] = this.k[c.kind].cooldownSec; this.rec(c.kind, how); g.flag?.('beast:' + c.kind + ':' + how); g.flags.add('beast:' + c.kind + ':met'); this.remove(c); }
  remove(c) { const e = this.g.e; if (c.obj && e.scene?.remove) e.scene.remove(c.obj); if (this.cur === c) this.cur = null; this.g.ui.setGoal?.(''); }
  snapshot() { return null; }   // 짐승은 저장하지 않는다 — 다시 들어오면 조용하다
}
