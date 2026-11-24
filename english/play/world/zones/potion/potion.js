/* 마법 연구소 · 무지개 마법 물약 (색 섞기) — 통합 설계서 §11 「무지개 물약」(L1-3-2), 주인공은 몬스터 고고.
 * 하는 일은 하나: 집어서 끌어다 놓는다. 물약 병(Red · Blue · Yellow)을 가마솥 위로 → 주르륵 부어지고 색이 섞인다.
 *   국자를 고고 · 사과 · 컵 · 의자 · 공 위로 → 그 색으로 물든다. 물 양동이를 그 위로 → 씻긴다(솥 위로 → 솥이 맑아진다).
 * 정답 · 점수 · 시간제한 · 설명 글 없음. 영어는 집을 때 그것의 이름(Red · Water · 국자는 뜬 물약의 색)과,
 *   두 색이 만나는 순간 · 물드는 순간의 색 한마디("Purple!" · "Orange!" · "Green!" · 세 색이면 "Brown!").
 * 놀이용 색 모형: 빨강+파랑=보라, 빨강+노랑=주황, 파랑+노랑=초록, 셋=갈색(양은 따지지 않는다 — 들어갔느냐만 본다).
 * 확인용 주소: ?mute 소리 끔 · ?auto=명령,…(grab:도구 · over:대상 · drop · tap:이름 · walk:x:z · to:가로:세로(화면 비율) · see:x:반너비(가까이 보기) · step:초) → 끝나면 제목에 상태를 적는다.
 *   도구 = red · blue · yellow · ladle · bucket / 대상 = pot · gogo · apple · cup · chair · ball */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStage, AUTO, clamp, rand } from '../../engine/stage.js?v=1';
import { sfx, chirp, tone, hiss, unlock, setMuted, isMuted } from '../../engine/sound.js?v=1';
import { createVoice } from '../../engine/voice.js?v=1';
import { createSparks } from '../../engine/fx.js?v=1';
import { createBrain } from '../../engine/brain.js?v=1';
import { createThing, stepThing, centerOf, topOf, pxRadius, pickAt, actorTarget } from '../../engine/things.js?v=1';
import { createLearn } from '../../engine/learn.js?v=1';
import { runAuto } from '../../engine/auto.js?v=1';
import { createActor } from '../../engine/actor.js?v=1';

// ───────────────────────── 수치(준호가 만져 보고 바꾼다) ─────────────────────────
const T = {
  BENCH: { X: 2.55, Z0: 0.15, Z1: 0.95 },    // 고고가 다니는 범위(뒷줄에는 물건이 서 있다)
  HOME: [0.92, 0.3],                         // 고고가 서 있는 자리
  PLACE: { chair: [-3.1, -0.6], red: [-2.42, -0.4], blue: [-1.83, -0.5], yellow: [-1.25, -0.38], pot: [-0.22, -0.45], apple: [1.78, -0.5], cup: [2.72, -0.5], ball: [3.15, 0.75], bucket: [-3.12, 0.72] },
  HOLD_Z: 0.35, FOLLOW: 24, BACK: 7,         // 든 것이 떠 있는 깊이 · 손을 따라오는 빠르기 · 제자리로 돌아가는 빠르기
  GRAB_PX: 78, COLUMN: 0.34,                 // 집는 여유(픽셀) · 대상 「위」로 치는 높이(화면 높이의 비율)
  POUR_TILT: 1.95, TILT_K: 9,                // 병이 기우는 각(라디안) · 기우는 빠르기
  BOTTLE_SEC: 1.6, REFILL_SEC: 0.8,          // 병 하나를 다 붓는 시간 · 바로 세우면 다시 차는 시간
  POUR_MIN: 0.3,                             // 이만큼(초) 부어야 그 색이 들어간 것으로 친다(스치기만 하면 안 섞인다)
  MERGE: 1.5,                                // 두 색이 따로 돌다가 한 색으로 합쳐지는 시간
  OVERFLOW: 5.0, AFTER_FLOW: 2.6,            // 이만큼(초) 부으면 넘친다 · 넘친 뒤 남는 양
  LEVEL: [0.47, 0.63],                        // 솥 물의 높이(처음 · 가득)
  FOAM_STAY: 11, FOAM_AT: [0.15, 0.62], FOAM_R: 0.72,   // 넘친 거품이 남아 있는 시간 · 자리(솥에서) · 반지름
  DWELL: 0.16,                               // 국자 · 양동이는 대상 위에 이만큼 머물러야 끼얹는다(스쳐 지나가면 안 끼얹는다)
  PAINT: 0.9,                                // 물약이 위에서 아래로 번지는 시간
  IDLE_POKE: 10,                             // 가만두면 고고가 혼자 해 보기까지(초)
  ROLL: 3.6, TRAIL_EVERY: 0.16,              // 공을 건드리면 구르는 빠르기 · 색 자국 사이
  RAINBOW_STAY: 7,
  SHAKE: 0.05,
  CAM: { AIM: [0, 1.15, 0], TILT: 17, FOV: 30, HALF_W: 4.05, MIN_DIST: 8.4 },
};
// 색(놀이용 모형). 기본 여섯 + Brown, 그리고 맑은 물.
const COL = { Water: '#bfe9f5', Red: '#ec4234', Blue: '#3a7be6', Yellow: '#ffd332', Purple: '#9354de', Orange: '#ff8a1f', Green: '#3dba58', Brown: '#8b5a33' };
const MIX = { '': 'Water', r: 'Red', b: 'Blue', y: 'Yellow', br: 'Purple', ry: 'Orange', by: 'Green', bry: 'Brown' }, INK = { red: 'Red', blue: 'Blue', yellow: 'Yellow' };
const NAME = { apple: 'Apple', cup: 'Cup', chair: 'Chair', ball: 'Ball', gogo: 'Gogo' }, R0 = { apple: [0.32, 0.6], cup: [0.385, 0.62], chair: [0.36, 0.95], ball: [0.27, 0.54] };
const C = Object.fromEntries(Object.entries(COL).map(([k, v]) => [k, new THREE.Color(v)])), cls = n => 'c-' + n.toLowerCase();

// ───────────────────────── 무대 ─────────────────────────
const canvas = document.getElementById('c'), sndEl = document.getElementById('snd'); if (AUTO) document.body.classList.add('auto');
const stage = createStage({ canvas, sky: ['#e6dcf6', '#d6cbee', '#b9a8dc'], cam: T.CAM }), { scene, camera } = stage; stage.renderer.localClippingEnabled = true;     // 병 속 물약을 수면에서 자른다
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshStandardMaterial({ color: '#b9a7e0', roughness: 1 })); wall.position.set(0, 3, -1.76); wall.receiveShadow = true; scene.add(wall);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 12).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#a996cf', roughness: 1 })); ground.position.set(0, -2.5, 2); ground.receiveShadow = true; scene.add(ground);
const loader = new GLTFLoader(), [lab, pack] = await Promise.all([loader.loadAsync(new URL('../../assets/lab.glb?v=1', import.meta.url).href), loader.loadAsync(new URL('../../assets/potion.glb?v=1', import.meta.url).href)]), part = {};
for (const g of [lab, pack]) g.scene.traverse(o => { if (o.isMesh) { part[o.name] = o; o.castShadow = o.name !== 'room'; o.receiveShadow = true; } });
scene.add(part.room);
const gogo = await createActor(scene, { model: 'gogo' }), s = gogo.state;
gogo.root.traverse(o => { if (o.isMesh) o.receiveShadow = !o.name.startsWith('GogoEyes'); });
gogo.place(T.HOME[0], T.HOME[1], 0); gogo.lookAt(camera.position);
const fx = createSparks(scene), learn = createLearn({ zone: 'world-lab', cell: 'L1-3-2' }), v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), vWord = new THREE.Vector3(), cTmp = new THREE.Color();
const voice = createVoice({ el: document.getElementById('word'), screenOf: stage.screenOf, onSaid: (w, by, name) => learn.note(w, { skill: name ? 'listen' : 'move', input: 'drag', game: 'rainbow-potion' }) });
const things = {}, seen = new Set(), errors = []; addEventListener('error', e => errors.push(String(e.message)));
for (const name of ['chair', 'apple', 'cup', 'ball']) { const [x, z] = T.PLACE[name]; things[name] = Object.assign(createThing(scene, part[name], { name, x, z, r: R0[name][0], h: R0[name][1], ball: name === 'ball' }), { dye: null }); things[name].onBounce = v => sfx.bounce(v / 6); }
part.cup.rotation.y = Math.PI;                                                    // 손잡이가 왼쪽으로(공에 가리지 않게)
const GOGO = actorTarget(gogo, 'gogo'), apple = things.apple, ball = things.ball;
const say = kind => chirp(kind, 1), bell = (k = 1) => { for (const [f, g, at] of [[1568, 0.13, 0], [2093, 0.1, 0.09], [3136, 0.05, 0.02]]) tone(f * k, f * k * 0.995, 0.9, { g, at }); };

// ── 물들이기: 꼭짓점 색을 위에서 아래로 덧칠한다(틈새 그늘 · 밝고 어두움은 남긴다). keep = 물들지 않는 곳을 가리는 함수(고고의 배 · 볼)
function mkPaint(meshes, y0, y1, keep) {
  const parts = meshes.map(m => {
    const g = m.geometry, src = g.attributes.color, pos = g.attributes.position, n = src.count, orig = new Float32Array(n * 3), w = new Float32Array(n), yn = new Float32Array(n); let sum = 0, cnt = 0;
    for (let i = 0; i < n; i++) { const r = src.getX(i), gg = src.getY(i), b = src.getZ(i); orig.set([r, gg, b], i * 3); w[i] = keep ? keep(r, gg, b) : 1; yn[i] = clamp((pos.getY(i) - y0) / (y1 - y0), 0, 1); if (w[i] > 0.5) { sum += 0.2126 * r + 0.7152 * gg + 0.0722 * b; cnt++; } }
    const attr = new THREE.BufferAttribute(Float32Array.from(orig), 3); g.setAttribute('color', attr);
    return { attr, orig, w, yn, avg: sum / Math.max(cnt, 1), base: Float32Array.from(orig), tgt: Float32Array.from(orig) };
  });
  return { parts, p: 1 };
}
/** color = 물들일 색(THREE.Color) 또는 null(씻어서 제 색으로). */
function paint(pt, color) {
  for (const q of pt.parts) { q.base.set(q.attr.array);
    for (let i = 0, n = q.w.length; i < n; i++) { const j = i * 3, o = q.orig;
      if (!color) { q.tgt[j] = o[j]; q.tgt[j + 1] = o[j + 1]; q.tgt[j + 2] = o[j + 2]; continue; }
      const sh = clamp((0.2126 * o[j] + 0.7152 * o[j + 1] + 0.0722 * o[j + 2]) / q.avg, 0.42, 1.3), w = q.w[i];
      q.tgt[j] = o[j] + (color.r * sh - o[j]) * w; q.tgt[j + 1] = o[j + 1] + (color.g * sh - o[j + 1]) * w; q.tgt[j + 2] = o[j + 2] + (color.b * sh - o[j + 2]) * w; } }
  pt.p = 0;
}
function stepPaint(pt, dt) {
  if (pt.p >= 1) return; pt.p = Math.min(1, pt.p + dt / T.PAINT);
  for (const q of pt.parts) { const a = q.attr.array; for (let i = 0, n = q.w.length; i < n; i++) { const k = clamp((pt.p * 1.4 - (1 - q.yn[i])) / 0.4, 0, 1), j = i * 3; a[j] = q.base[j] + (q.tgt[j] - q.base[j]) * k; a[j + 1] = q.base[j + 1] + (q.tgt[j + 1] - q.base[j + 1]) * k; a[j + 2] = q.base[j + 2] + (q.tgt[j + 2] - q.base[j + 2]) * k; } q.attr.needsUpdate = true; }
}
for (const t of Object.values(things)) { t.mesh.geometry.computeBoundingBox(); const b = t.mesh.geometry.boundingBox; t.paint = mkPaint([t.mesh], b.min.y, b.max.y); }
const skins = []; gogo.root.traverse(o => { if (o.isMesh && o.material && o.material.name === 'gogo_skin') skins.push(o); });
const G = { dye: null, paint: mkPaint(skins, 0, 1.05, (r, g, b) => clamp((g - Math.max(r, b)) / 0.1, 0, 1)), shake: 0, shakeNow: 0, shakeCol: C.Water, splat: false, tilt: 0, tiltNow: 0, nose: 0, noseNow: 0, shiver: 0, self: 0, steam: 0, steamCol: C.Orange, flash: 0, flashCol: C.Red, watch: 0 };

// ── 작은 것들의 무리: 방울(떨어지는 물약) · 김과 연기 · 실험대의 색 자국
const DROPS = 90, dropMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ roughness: 0.18 }), DROPS), drops = Array.from({ length: DROPS }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: 0.03, floor: 0, mark: null })), m4 = new THREE.Matrix4(); let dropNext = 0;
dropMesh.frustumCulled = false; dropMesh.castShadow = true; scene.add(dropMesh); for (let i = 0; i < DROPS; i++) { dropMesh.setMatrixAt(i, m4.makeScale(0, 0, 0)); dropMesh.setColorAt(i, C.Water); }
/** 방울 하나: 자리 · 빠르기 · 색 · 닿으면 사라지는 높이. mark = 실험대에 닿으면 남기는 자국의 색. */
function drop(p, vx, vy, vz, color, floor = 0, r = 0.035, mark = null) { const d = drops[dropNext]; dropMesh.setColorAt(dropNext, color); dropMesh.instanceColor.needsUpdate = true; dropNext = (dropNext + 1) % DROPS; d.life = 2; d.p.copy(p); d.v.set(vx, vy, vz); d.r = r * rand(0.7, 1.2); d.floor = floor; d.mark = mark; }
const PUFFS = 30, puffGeo = new THREE.SphereGeometry(1, 14, 10), puffs = Array.from({ length: PUFFS }, () => { const m = new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); m.visible = false; m.renderOrder = 3; scene.add(m); return { m, life: 0, max: 1, v: new THREE.Vector3(), r0: 0.1, r1: 0.3, a: 0.5 }; }); let puffNext = 0;
/** 김 · 연기 한 덩이: 자리 · 색 · 처음 크기 → 끝 크기 · 사는 시간 · 짙기 · 빠르기 */
function puff(p, color, r0, r1, life, a = 0.5, vx = 0, vy = 0.5, vz = 0) { const q = puffs[puffNext]; puffNext = (puffNext + 1) % PUFFS; q.m.position.copy(p); q.m.material.color.copy(color); q.life = q.max = life; q.r0 = r0; q.r1 = r1; q.a = a; q.v.set(vx, vy, vz); q.m.visible = true; }
const MARKS = 46, markGeo = new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), marks = Array.from({ length: MARKS }, (_, i) => { const m = new THREE.Mesh(markGeo, new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, roughness: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); m.position.y = 0.004 + i * 0.0002; m.visible = false; m.receiveShadow = true; scene.add(m); return { m, life: 0, max: 1 }; }); let markNext = 0;
/** 실험대에 남는 색 자국(천천히 스러진다). */
function mark(x, z, color, r = 0.08, life = 9) { if (Math.abs(x) > 3.6 || Math.abs(z) > 1.2) return; const q = marks[markNext]; markNext = (markNext + 1) % MARKS; q.m.position.x = x; q.m.position.z = z; q.m.scale.set(r * rand(0.8, 1.3), 1, r * rand(0.8, 1.3)); q.m.material.color.copy(color); q.life = q.max = life; q.m.visible = true; }
function stepBits(dt) {
  for (let i = 0; i < DROPS; i++) { const d = drops[i]; if (d.life <= 0) continue; d.life -= dt; d.v.y -= 9 * dt; d.p.addScaledVector(d.v, dt);
    if (d.p.y < d.floor || d.life <= 0) { d.life = 0; if (d.mark && d.floor <= 0.01) mark(d.p.x, d.p.z, d.mark, rand(0.05, 0.11), 8); dropMesh.setMatrixAt(i, m4.makeScale(0, 0, 0)); } else { const st = 1 + Math.min(1.2, Math.abs(d.v.y) * 0.12); dropMesh.setMatrixAt(i, m4.makeScale(d.r, d.r * st, d.r).setPosition(d.p)); } }
  dropMesh.instanceMatrix.needsUpdate = true;
  for (const q of puffs) { if (q.life <= 0) continue; q.life -= dt; const k = 1 - Math.max(0, q.life / q.max); q.m.position.addScaledVector(q.v, dt); q.v.multiplyScalar(Math.exp(-1.6 * dt)); q.m.scale.setScalar(q.r0 + (q.r1 - q.r0) * (1 - (1 - k) ** 2)); q.m.material.opacity = q.a * Math.min(1, k * 8) * (1 - k) ** 1.2; if (q.life <= 0) q.m.visible = false; }
  for (const q of marks) { if (q.life <= 0) continue; q.life -= dt; q.m.material.opacity = 0.92 * clamp(q.life / 2.5, 0, 1); if (q.life <= 0) q.m.visible = false; }
}

// ───────────────────────── 가마솥 ─────────────────────────
const POT = { name: 'pot', x: T.PLACE.pot[0], z: T.PLACE.pot[1], y: 0, r: 0.56, h: 0.69, size: 1, state: 'home',          // 「대상」 꼴(things.js 의 pickAt · topOf 가 읽는다)
  has: new Set(), amt: { r: 0, b: 0, y: 0 }, color: 'Water', poured: 0, level: 0, boil: 0, pourT: 9, streak: C.Water.clone(), k: 0, bubT: 0, steamT: 0, jolt: 0, joltV: 0, made: new Set() };
const potObj = new THREE.Group(); potObj.add(part.cauldron); potObj.position.set(POT.x, 0, POT.z); scene.add(potObj);
// 솥의 물: 납작한 판이 아니라 일렁이는 면. 두 색(uA 바탕 · uB 들어온 색)이 소용돌이로 따로 돌다가 한 색으로 합쳐진다.
const liq = new THREE.Mesh(new THREE.LatheGeometry(Array.from({ length: 12 }, (_, i) => new THREE.Vector2(i / 11, 0)), 44), new THREE.ShaderMaterial({ side: THREE.DoubleSide,
  uniforms: { uA: { value: C.Water.clone() }, uB: { value: C.Water.clone() }, uK: { value: 0 }, uT: { value: 0 }, uBoil: { value: 0 } },
  vertexShader: `uniform float uT, uBoil; varying vec2 vP;
    void main() { vP = position.xz; vec3 p = position; float r = length(vP);
      p.y += (sin(r * 13.0 - uT * 3.0) * 0.012 + sin(p.x * 9.0 + uT * 2.3) * sin(p.z * 8.0 - uT * 1.7) * 0.016) * (1.0 + uBoil * 2.2) * smoothstep(1.0, 0.75, r);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
  fragmentShader: `uniform vec3 uA, uB; uniform float uT, uK, uBoil; varying vec2 vP;
    void main() { float r = length(vP), a = atan(vP.y, vP.x);
      float sw = sin(a * 2.0 + r * 7.0 - uT * 1.7) * 0.5 + 0.5 + 0.22 * sin(a * 5.0 - r * 11.0 + uT * 2.6);            // 두 갈래 소용돌이 + 잔물결
      vec3 c = mix(uA, uB, smoothstep(1.0 - uK - 0.14, 1.0 - uK + 0.14, sw) * step(0.001, uK));
      c *= 0.8 + 0.32 * r * r;                                                                                     // 가운데가 깊다
      c += smoothstep(0.8, 1.0, sin(a * 3.0 + r * 9.0 - uT * 1.2)) * 0.1 * (1.0 + uBoil);                          // 돌아가는 빛 띠
      c += pow(max(0.0, 1.0 - length(vP - vec2(-0.3, -0.42)) * 2.4), 2.0) * 0.4;                                   // 창에서 든 빛
      gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }` }));
potObj.add(liq);
const bubMat = new THREE.MeshStandardMaterial({ roughness: 0.12, transparent: true, opacity: 0.85 }), bubs = Array.from({ length: 12 }, () => { const m = new THREE.Mesh(puffGeo, bubMat); m.visible = false; potObj.add(m); return { m, t: 0, dur: 1, r: 0.05 }; });
const levelY = () => T.LEVEL[0] + (T.LEVEL[1] - T.LEVEL[0]) * POT.level, potTop = out => out.set(POT.x, 0.95, POT.z), potMouth = out => out.set(POT.x, levelY() + 0.05, POT.z);
const mixName = () => MIX[[...POT.has].sort().join('')];
// 넘친 거품(실험대 위에 퍼졌다가 스러진다) · 무지개
const foam = { t: 0, k: 0, g: new THREE.Group(), mat: new THREE.MeshStandardMaterial({ roughness: 0.35 }), x: POT.x + T.FOAM_AT[0], z: POT.z + T.FOAM_AT[1] + 0.45 };
{ const d = new THREE.Mesh(new THREE.CircleGeometry(1, 30).rotateX(-Math.PI / 2), foam.mat); d.position.y = 0.012; d.receiveShadow = true; foam.g.add(d);
  for (let i = 0; i < 11; i++) { const a = i * 2.4, rr = 0.25 + (i * 0.37 % 0.6), b = new THREE.Mesh(puffGeo, foam.mat); b.position.set(Math.cos(a) * rr, 0.02, Math.sin(a) * rr * 0.8); b.scale.set(0.24 - i * 0.011, 0.2 - i * 0.008, 0.3 - i * 0.012); b.castShadow = true; foam.g.add(b); }
  foam.g.position.set(foam.x, 0, foam.z); foam.g.scale.setScalar(0.001); foam.g.visible = false; scene.add(foam.g); }
const bow = { t: 0, k: 0, v: 0, g: new THREE.Group() };
['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'].forEach((n, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(1.62 - i * 0.1, 0.055, 8, 48, Math.PI), new THREE.MeshBasicMaterial({ color: COL[n], transparent: true, opacity: 0.92 })); bow.g.add(m); });
bow.g.position.set(POT.x, 0.55, POT.z - 0.55); bow.g.visible = false; scene.add(bow.g);

/** 솥에 색을 붓는다(병이 기울어 있는 동안 장면마다). */
function pourIn(ink, dt) {
  const key = ink[0].toLowerCase(); POT.amt[key] += dt; POT.poured += dt; POT.pourT = 0; POT.streak.copy(C[ink]); POT.k = Math.min(0.5, POT.k + dt * 1.4); POT.boil = Math.max(POT.boil, 0.35);
  if (!POT.has.has(key) && POT.amt[key] >= T.POUR_MIN) { POT.has.add(key); mixed(); }
  if (POT.poured > T.OVERFLOW) overflow();
}
/** 새 색이 들어간 순간. 두 색이 만나면 보글보글 + 종소리 + 색 이름, 세 색이면 펑. */
function mixed() {
  const n = POT.has.size, name = mixName(); POT.color = name; POT.boil = n === 1 ? 0.8 : 2; POT.joltV += 2.2; sfx.fizz();
  if (n === 1) { fx.spark(potMouth(v3), COL[name], 10, 0.3, 1.2); return; }
  voice.word(name + '!', () => potTop(vWord), { cls: 'shout ' + cls(name), by: 'pot' }); POT.made.add(name);
  if (n === 2) { bell(); fx.spark(potTop(v3), COL[name], 26, 0.35, 2); fx.spark(v3, '#fff6c8', 12, 0.4, 1.4); run(mixJoy);
    if (['Purple', 'Orange', 'Green'].every(c => POT.made.has(c))) { POT.made.clear(); bow.t = T.RAINBOW_STAY; bow.v = 3; seen.add('rainbow'); for (let i = 0; i < 5; i++) tone(784 * 1.189 ** i, 784 * 1.189 ** i, 0.5, { g: 0.09, at: 0.5 + i * 0.11 }); } }
  else { seen.add('poof'); stage.shake(T.SHAKE * 1.6); tone(120, 40, 0.5, { g: 0.4 }); hiss(0.5, { g: 0.2, f: 500, q: 0.5 });                    // 펑 — 연기 구름
    for (let i = 0; i < 14; i++) puff(v3.set(POT.x + rand(-0.3, 0.3), 0.7 + rand(0, 0.3), POT.z + rand(-0.1, 0.3)), cTmp.set(i % 3 ? '#8a7a70' : '#b59a84'), 0.15, rand(0.4, 0.75), rand(1.4, 2.6), 0.75, rand(-1.4, 1.4), rand(0.5, 2.2), rand(-0.2, 0.8));
    run(yuck); }
}
function overflow() {
  POT.poured = T.AFTER_FLOW; seen.add('overflow'); foam.t = T.FOAM_STAY; foam.g.visible = true; foam.mat.color.copy(C[POT.color]).lerp(cTmp.set('#ffffff'), 0.3); sfx.splat(); hiss(0.6, { g: 0.08, f: 3000 }); stage.shake(T.SHAKE * 0.5); POT.joltV += 3;
  for (let i = 0; i < 16; i++) drop(v3.set(POT.x + rand(-0.4, 0.5), 0.7, POT.z + 0.45), rand(-0.5, 0.7), rand(0.5, 1.6), rand(0.4, 1.3), cTmp.copy(C[POT.color]).lerp(v3c, 0.5), 0, 0.05);
  if (!s.act) run(async tok => { gogo.lookAt(v3.set(foam.x, 0, foam.z)); gogo.act('surprise', { mood: 'wow' }); say('wow'); await wait(tok, 0.9); await walk(tok, foam.x + (s.pos.x > foam.x ? 0.15 : -0.15), T.BENCH.Z0 + 0.25); });   // 구경하러 왔다가 미끄러진다
}
const v3c = new THREE.Color('#ffffff');
/** 물을 부으면 솥이 맑아진다. */
function clearPot() { const was = POT.color; POT.has.clear(); POT.amt.r = POT.amt.b = POT.amt.y = 0; POT.poured = 0; POT.color = 'Water'; POT.streak.copy(C.Water); POT.k = 0.5; POT.pourT = 0; POT.boil = 1; POT.joltV += 2; sfx.fizz(); if (was !== 'Water') { seen.add('clear'); for (let i = 0; i < 6; i++) puff(v3.set(POT.x + rand(-0.3, 0.3), 0.75, POT.z + rand(-0.2, 0.2)), v3c, 0.08, rand(0.2, 0.34), rand(0.9, 1.6), 0.6, rand(-0.3, 0.3), rand(0.6, 1.2), 0); } }
function stepPot(dt) {
  const u = liq.material.uniforms, tgt = C[POT.color], ka = 1 - Math.exp(-dt * 3 / T.MERGE); POT.pourT += dt;
  u.uA.value.lerp(tgt, ka); u.uB.value.lerp(POT.pourT < 0.25 ? POT.streak : tgt, 1 - Math.exp(-dt * (POT.pourT < 0.25 ? 10 : 3 / T.MERGE)));               // 붓는 동안에는 들어온 색이 따로 돈다 → 그치면 합쳐진다
  if (POT.pourT > T.MERGE * 1.3) POT.k = Math.max(0, POT.k - dt * 0.5); u.uK.value = POT.k; u.uT.value = clock; POT.boil = Math.max(0, POT.boil - dt * 0.55); u.uBoil.value = POT.boil;
  POT.level += (clamp(POT.poured / T.OVERFLOW, 0, 1) - POT.level) * Math.min(1, 4 * dt); const y = levelY(), rr = 0.525 - 0.055 * POT.level; liq.position.y = y; liq.scale.set(rr, 1, rr);
  POT.joltV += (-90 * POT.jolt - 7 * POT.joltV) * dt; POT.jolt += POT.joltV * dt; potObj.scale.set(1 - POT.jolt * 0.05, 1 + POT.jolt * 0.07, 1 - POT.jolt * 0.05);          // 솥이 출렁
  // 거품: 올라와 부풀다가 터진다(끓을수록 많이)
  bubMat.color.copy(u.uA.value).lerp(v3c, 0.35); POT.bubT -= dt * (0.9 + POT.boil * 9);
  if (POT.bubT <= 0) { POT.bubT = rand(0.5, 1.2); const b = bubs.find(q => q.t <= 0); if (b) { const a = rand(0, 6.28), d = Math.sqrt(Math.random()) * rr * 0.8; b.m.position.set(Math.cos(a) * d, y, Math.sin(a) * d); b.t = b.dur = rand(0.5, 1.1) / (1 + POT.boil * 0.5); b.r = rand(0.035, 0.075) * (1 + POT.boil * 0.35); b.m.visible = true; } }
  for (const b of bubs) { if (b.t <= 0) continue; b.t -= dt; const k = 1 - b.t / b.dur; b.m.position.y = y + b.r * 0.2 * k; b.m.scale.setScalar(b.r * (0.2 + 0.8 * Math.sin(k * 1.57)));
    if (b.t <= 0) { b.m.visible = false; fx.spark(v3.copy(b.m.position).add(potObj.position), cTmp.copy(bubMat.color), 2, 0.03, 0.5); if (POT.boil > 0.3 && Math.random() < 0.5) tone(rand(500, 900), rand(900, 1400), 0.05, { g: 0.03 }); } }
  // 김이 그 색으로 오른다
  if ((POT.steamT -= dt * (1 + POT.boil * 3)) <= 0) { POT.steamT = rand(0.35, 0.6); puff(v3.set(POT.x + rand(-0.3, 0.3), y + 0.1, POT.z + rand(-0.2, 0.2)), cTmp.copy(u.uA.value).lerp(v3c, 0.45), 0.05, rand(0.14, 0.24), rand(1.4, 2.2), 0.42, rand(-0.08, 0.08), rand(0.35, 0.6), 0); }
  // 넘친 거품 · 무지개
  if (foam.g.visible) { foam.t -= dt; foam.k += ((foam.t > 0 ? 1 : 0) - foam.k) * Math.min(1, (foam.t > 0 ? 3.5 : 2) * dt); foam.g.scale.set(Math.max(0.001, foam.k) * T.FOAM_R, 0.4 + 0.6 * foam.k, Math.max(0.001, foam.k) * T.FOAM_R * 0.62); if (foam.t <= 0 && foam.k < 0.02) foam.g.visible = false; }
  if (bow.t > 0 || bow.k > 0.01) { bow.t -= dt; bow.v += (60 * ((bow.t > 0 ? 1 : 0) - bow.k) - 9 * bow.v) * dt; bow.k = Math.max(0, bow.k + bow.v * dt); bow.g.visible = bow.k > 0.01; bow.g.scale.setScalar(Math.max(0.001, bow.k)); if (bow.t > 0 && Math.random() < dt * 14) fx.spark(v3.set(POT.x + rand(-1.6, 1.6), rand(0.8, 2.1), POT.z - 0.5), '#fff6c8', 1, 0.05, 0.4); }
}

// ───────────────────────── 손에 드는 것: 물약 병 셋 · 국자 · 물 양동이 ─────────────────────────
const tools = {}, holdPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -T.HOLD_Z), benchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function mkTool(name, kind, obj, home, o) { obj.position.copy(home); scene.add(obj); return tools[name] = { name, kind, obj, home, pos: home.clone(), to: home.clone(), z: home.z, state: 'rest', tilt: 0, tiltTo: 0, dir: 1, fill: 1, hover: null, dwell: 0, armed: true, pourT: 0, load: null, wob: 0, wobV: 0, slosh: 0, sloshV: 0, lastX: home.x, glug: 0, upT: 0, leanK: 1, ...o }; }
const glassMat = new THREE.MeshPhysicalMaterial({ color: '#e4f6ff', transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 2.2 });
for (const ink of ['red', 'blue', 'yellow']) {
  const g = new THREE.Group(), glass = part['glass_' + ink], lq = part['liq_' + ink], cap = part['cap_' + ink], plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0); lq.geometry.computeBoundingBox();
  glass.material = glassMat; glass.castShadow = false; glass.renderOrder = 2; lq.material = new THREE.MeshStandardMaterial({ color: COL[INK[ink]], roughness: 0.22, emissive: COL[INK[ink]], emissiveIntensity: 0.06, side: THREE.DoubleSide, clippingPlanes: [plane], clipShadows: true });
  g.add(lq, glass, cap); const h = lq.geometry.boundingBox.max.y; mkTool(ink, 'bottle', g, new THREE.Vector3(T.PLACE[ink][0], 0, T.PLACE[ink][1]), { ink: INK[ink], plane, lh: h, reach: h + 0.1, rim: 0, off: [0, 0.1], gap: 0.3, grab: [[0, 0.4]], word: INK[ink] });
}
{ const g = new THREE.Group(), disc = new THREE.Mesh(new THREE.CircleGeometry(0.118, 20).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: COL.Water, roughness: 0.15, emissive: COL.Water, emissiveIntensity: 0.2 })); disc.position.y = -0.004; g.add(part.ladle, disc);
  mkTool('ladle', 'ladle', g, new THREE.Vector3(POT.x + 0.1, T.LEVEL[0], POT.z + 0.02), { disc, load: 'Water', reach: 0, rim: -0.13, off: [-0.3, -0.72], gap: 0.3, grab: [[0.283, 0.74], [0.21, 0.42]], lean: -0.35 }); }
{ const g = new THREE.Group(), disc = new THREE.Mesh(new THREE.CircleGeometry(0.218, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: COL.Water, roughness: 0.1, emissive: COL.Water, emissiveIntensity: 0.25 })); disc.position.y = 0.3; g.add(part.bucket, disc);
  mkTool('bucket', 'bucket', g, new THREE.Vector3(T.PLACE.bucket[0], 0, T.PLACE.bucket[1]), { disc, reach: 0.36, rim: 0.24, off: [0, 0.1], gap: 0.3, grab: [[0, 0.25], [0, 0.52]], word: 'Water' }); }
const vFrom = new THREE.Vector3(), TOOLS = Object.values(tools), ladle = tools.ladle, targets = [GOGO, ...Object.values(things)];
const rot = t => (t.lean || 0) * t.leanK + (t.kind === 'ladle' ? t.tilt : -t.dir * t.tilt) + t.wob;                         // 그 도구가 기운 각(z 축)
const local = (t, x, y, out) => { const a = rot(t); return out.set(t.pos.x + x * Math.cos(a) - y * Math.sin(a), t.pos.y + x * Math.sin(a) + y * Math.cos(a), t.pos.z); };
const mouthOf = (t, out) => local(t, t.kind === 'ladle' ? t.rim : t.dir * t.rim, t.reach, out);
/** 든 것이 어느 대상 「위」에 있나(화면에서 본다 — 깊이가 달라도 위에 겹쳐 보이면 위다). base = 손이 가리키는, 도구의 밑 자리. */
function hoverOf(tool, base) {
  const p = stage.screenOf(base), list = tool.kind === 'bottle' ? [POT] : [POT, ...targets]; let best = null, bd = 1e9;
  for (const t of list) { const c = stage.screenOf(topOf(t, v3)), r = pxRadius(stage, t), dx = Math.abs(c.x - p.x); if (dx < r * 0.85 && p.y < c.y + r && p.y > c.y - innerHeight * T.COLUMN && dx < bd) { bd = dx; best = t; } }
  return best;
}
function grab(tool) {
  P.tool = tool; tool.state = 'held'; tool.hover = null; tool.dwell = 0; tool.armed = true; tool.wobV += 3; B.idle = 0; sfx.grab();
  if (tool.kind === 'ladle') { if (tool.pos.distanceTo(tool.home) < 0.3) scoop(tool); if (tool.load) voice.word(tool.load, () => local(tool, 0, 0.25, vWord), { name: true, cls: 'name ' + cls(tool.load), by: 'ladle' }); }
  else voice.word(tool.word, () => local(tool, 0, tool.reach + 0.2, vWord), { name: true, cls: 'name ' + cls(tool.word), by: tool.name });
}
function scoop(tool) { tool.load = POT.color; tool.disc.material.color.copy(C[tool.load]); tool.disc.material.emissive.copy(C[tool.load]); sfx.gulp(); POT.joltV += 1; }
function release() { const tool = P.tool; if (!tool) return; P.tool = null; tool.state = 'back'; tool.hover = null; tool.tiltTo = 0; tool.pourT = 0; sfx.pop(); if (!B.tok) gogo.lookAt(camera.position); }
/** 끼얹는다: 물약이면 그 색으로 물들고(그 순간 색 이름 한마디), 물이면 씻긴다. */
function splash(t, name, from) {
  const top = topOf(t, v3b), col = C[name]; sfx.splat(); for (let i = 0; i < 12; i++) drop(v3.set(from.x + rand(-0.06, 0.06), from.y, t.z + rand(-0.05, 0.05)), rand(-0.5, 0.5), rand(-0.5, 0.6), rand(-0.3, 0.3), col, Math.max(0, top.y - 0.2), 0.045);
  fx.spark(top, COL[name], 14, 0.25, 1.4);
  if (name === 'Water') { voice.word('Water!', () => topOf(t, vWord), { cls: 'shout c-water', by: t.name }); wash(t); return; }
  voice.word(name + '!', () => topOf(t, vWord), { cls: 'shout ' + cls(name), by: t.name, gap: 0.5 });        // 솥이 방금 같은 색을 외쳤어도 물드는 순간에는 다시 말한다
  if (t === GOGO) { G.dye = name; paint(G.paint, col); s.sizeV += 1.6; run(tok => dyed(tok, name)); }
  else { t.dye = name; paint(t.paint, col); t.v += 2.4; t.tvx += rand(-3, 3); run(tok => lookThing(tok, t, name)); }
}
function wash(t) {
  if (t === POT) return clearPot();
  for (let i = 0; i < 8; i++) drop(topOf(t, v3), rand(-1.2, 1.2), rand(0.6, 1.8), rand(-0.4, 0.8), C.Water, 0, 0.035);
  if (t === GOGO) { const was = G.dye; G.dye = null; paint(G.paint, null); s.sizeV -= 1.4; run(tok => shower(tok, was)); }
  else { if (t.dye) { t.dye = null; paint(t.paint, null); } t.v -= 2; t.tvz += rand(-3, 3); }
}
function stepTools(dt) {
  for (const t of TOOLS) {
    const held = t.state === 'held'; let pouring = false;
    if (t.kind === 'ladle') t.home.set(POT.x + 0.1 + Math.cos(clock * 1.3) * 0.07, levelY() - 0.03, POT.z + 0.02 + Math.sin(clock * 1.3) * 0.06);      // 꽂힌 국자는 혼자 천천히 젓는다
    if (held) {
      holdPlane.constant = -t.z; if (!stage.worldOn(holdPlane, P.x, P.y, v3)) v3.copy(t.pos);
      const base = v3b.set(v3.x + t.off[0], v3.y + t.off[1], t.z), hv = hoverOf(t, base); if (hv !== t.hover) { t.hover = hv; t.dwell = 0; t.armed = true; if (hv === GOGO && !B.tok) { gogo.setMood('wow', 0.8); say('hm'); } }
      t.z += ((hv ? hv.z + (hv === POT ? 0 : 0.04) : T.HOLD_Z) - t.z) * Math.min(1, 9 * dt); if (hv) t.dwell += dt;
      const minY = hv ? topOf(hv, v3).y + t.gap : 0.06; let bx = base.x, by = Math.max(base.y, minY);
      if (t.kind === 'bottle') {
        if (t.tilt < 0.25 && hv) t.dir = base.x <= POT.x + 0.05 ? 1 : -1;
        if (t.fill <= 0) t.empty = true; else if (t.fill >= 1) t.empty = false;                                                    // 다 부으면 바로 서서 다시 찰 때까지 기다린다
        const want = hv === POT && !t.empty; t.tiltTo = want ? T.POUR_TILT : 0; pouring = want && t.tilt > T.POUR_TILT * 0.72;
        if (pouring) { t.fill = Math.max(0, t.fill - dt / T.BOTTLE_SEC); t.upT = 0; pourIn(t.ink, dt); if (!B.tok && G.watch <= 0) { G.watch = 6; run(watchPot); } }
        bx -= t.dir * t.reach * Math.sin(t.tilt) * 0.85;                                                                          // 병 입이 손가락 위에 오게 몸을 비킨다
      } else if (t.kind === 'ladle') {
        if (hv === POT && !t.load) { by = levelY() + 0.02; if (Math.abs(t.pos.y - by) < 0.06 && t.dwell > T.DWELL) scoop(t); }          // 솥에 담가 다시 뜬다
        else if (hv && hv !== POT && t.load && t.dwell > T.DWELL) t.pourT = 0.55;
        if (t.pourT > 0) { t.pourT -= dt; t.tiltTo = 1.35; if (t.load && t.tilt > 0.9 && t.hover && t.hover !== POT) { const n = t.load; t.load = null; splash(t.hover, n, mouthOf(t, vFrom)); } } else t.tiltTo = 0;
        if (hv && hv !== POT) bx += 0.13;                                                                                         // 바가지 입(왼쪽으로 기운다)이 대상 위에 오게
      } else {
        if (hv && t.armed && t.dwell > T.DWELL) { t.armed = false; t.done = false; t.pourT = 0.85; t.dir = 1; }
        if (t.pourT > 0) { t.pourT -= dt; t.tiltTo = 1.75; pouring = t.tilt > 1.1; if (pouring && !t.done && t.hover) { t.done = true; hiss(0.5, { g: 0.1, f: 2400, q: 0.6 }); wash(t.hover); } } else { t.tiltTo = 0; t.done = false; }
        bx -= t.dir * (t.reach * Math.sin(t.tilt) + t.rim * Math.cos(t.tilt)) * 0.9;
      }
      t.to.set(bx, by, t.z);
      for (const o of targets) if (o !== GOGO) o.lit = o.lit || (hv === o && t.kind !== 'bottle');
    } else { t.tiltTo = 0; t.to.copy(t.home); t.z = t.home.z; if (t.state === 'back' && t.pos.distanceTo(t.home) < 0.03) { t.state = 'rest'; if (t.kind === 'ladle') scoop(t); else sfx.tick(); } }
    const k = 1 - Math.exp(-(held ? T.FOLLOW : T.BACK) * dt); t.pos.lerp(t.to, k); t.tilt += (t.tiltTo - t.tilt) * Math.min(1, T.TILT_K * dt); t.leanK += ((t.state === 'rest' ? 1 : 0.3) - t.leanK) * Math.min(1, 8 * dt);
    // 까딱임 · 찰랑임(옆으로 움직이면 속의 물약이 뒤늦게 따라온다)
    const vx = (t.pos.x - t.lastX) / dt; t.lastX = t.pos.x; t.wobV += (-70 * t.wob - 7 * t.wobV) * dt; t.wob += t.wobV * dt; t.sloshV += (-55 * t.slosh - 5 * t.sloshV - vx * 6 - t.wobV * 2) * dt; t.slosh = clamp(t.slosh + t.sloshV * dt, -0.5, 0.5);
    t.obj.position.copy(t.pos); t.obj.rotation.z = rot(t); if (t.state === 'rest' && t.kind !== 'ladle') t.obj.position.y += Math.max(0, Math.sin(clock * 2.2 + t.home.x * 2.5)) ** 8 * 0.07;        // 차례로 폴짝 — 「나를 집어 봐」
    if (t.kind === 'bottle') {
      if (!pouring && t.tilt < 0.4 && (t.upT += dt) > (held ? 0.3 : 0.1) && t.fill < 1) { t.fill = Math.min(1, t.fill + dt / T.REFILL_SEC); if (Math.random() < dt * 20) fx.spark(local(t, 0, t.lh * t.fill, v3), COL[t.ink], 1, 0.06, 0.4); }   // 세우면 다시 찬다(마법 병)
      const a = rot(t), ca = Math.cos(a), sa = Math.abs(Math.sin(a)), lo = t.pos.y + Math.min(0, t.lh * ca) - 0.26 * sa, hi = t.pos.y + Math.max(0.02, t.lh * ca) + 0.26 * sa, lv = lo + (hi - lo) * (0.06 + 0.8 * t.fill) * (pouring ? 1.25 : 1);
      t.plane.normal.set(Math.sin(t.slosh * 0.5), -Math.cos(t.slosh * 0.5), 0); t.plane.constant = -t.plane.normal.dot(v3.set(t.pos.x - Math.sin(a) * t.lh * 0.5, lv, t.pos.z));
      if (pouring) { const m = mouthOf(t, v3); for (let i = 0; i < 2; i++) drop(m, t.dir * rand(0.1, 0.5), rand(-0.6, 0), rand(-0.05, 0.05), C[t.ink], levelY(), 0.04); if ((t.glug -= dt) <= 0) { t.glug = 0.17; tone(rand(260, 340), rand(160, 210), 0.09, { g: 0.1 }); } }
    } else if (t.kind === 'ladle') { const sc = t.load ? 1 : 0.001; t.disc.scale.x += (sc - t.disc.scale.x) * Math.min(1, 14 * dt); t.disc.scale.z = t.disc.scale.x; t.disc.visible = t.disc.scale.x > 0.02; }
    else if (pouring) { const m = mouthOf(t, v3); for (let i = 0; i < 3; i++) drop(m, t.dir * rand(0.1, 0.6), rand(-0.5, 0.2), rand(-0.12, 0.12), C.Water, t.hover ? Math.max(0, topOf(t.hover, v3b).y - 0.25) : 0, 0.045); }
  }
}

// ───────────────────────── 고고의 머리(하고 싶은 일) ─────────────────────────
const brain = createBrain(gogo, { bounds: T.BENCH, onEnd: () => { G.tilt = G.nose = G.shake = G.shiver = 0; if (!P.tool) gogo.lookAt(camera.position); }, onLand: () => sfx.thud(0.6) });
const B = brain.B, { wait, until, walk, face, hop } = brain; B.where = 'bench';
const run = fn => { G.tilt = G.nose = G.shake = G.shiver = G.steam = 0; brain.run(fn); };                                                // 새 일을 시작하면 하던 몸짓도 그 자리에서 그친다
const L = { fallT: -1, slide: 0, slipCool: 0 };
const toward = t => clamp(Math.atan2(t.x - s.pos.x, t.z - s.pos.z), -0.75, 0.75);                                               // 그쪽으로 돌아서되 얼굴은 아이에게 보이게
const mouth = out => out.set(s.pos.x + Math.sin(s.heading) * 0.42, s.y + 0.6, s.pos.z + Math.cos(s.heading) * 0.42);
const name = t => voice.word(NAME[t.name], () => topOf(t, vWord), { name: true, by: t.name });
/** 푸르르 턴다: 몸을 흔들고 방울이 사방으로 튄다. splat = 실험대에 자국을 남긴다(흙탕). */
async function shakeOff(tok, color, splat = false) { G.shakeCol = color; G.splat = splat; G.shake = 1; say('brr'); hiss(0.5, { g: 0.07, f: 1500, q: 0.7 }); await wait(tok, 1.05); G.shake = 0; }
async function shower(tok, was) { gogo.setMood('fluster', 0.7); gogo.act('surprise'); await wait(tok, 0.5); seen.add('shake'); await shakeOff(tok, C.Water); gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); gogo.setMood('smile', 1.2); }
// 물든 고고: 색마다 다른 짓
const REACT = {
  async Green(tok) { seen.add('frog'); gogo.setMood('joy', 3);                                                                             // 개구리처럼 폴짝폴짝
    for (let i = 0, d = s.pos.x > 0.3 ? -1 : 1; i < 3; i++) { if (Math.abs(s.pos.x + d * 0.75) > T.BENCH.X) d = -d; hop(s.pos.x + d * 0.75, 0.55, 0, 'bench', 0.42); tone(170, 250, 0.09, { type: 'square', g: 0.06 }); tone(190, 290, 0.12, { type: 'square', g: 0.06, at: 0.12 }); await until(tok, () => !B.hop); s.sizeV -= 2.2; await wait(tok, 0.16); } },
  async Purple(tok) { seen.add('strut'); gogo.setMood('smile', 5); gogo.pose('lean', -0.9); say('big'); const x = s.pos.x > 0.4 ? -1.5 : 1.9; await walk(tok, x, 0.6); await wait(tok, 0.25); await walk(tok, T.HOME[0], 0.5); gogo.pose('lean', 0); await face(tok, 0); },   // 으스대며 걷는다
  async Orange(tok) { seen.add('warm'); gogo.setMood('joy', 2.6); gogo.pose('sway', 1); say('yum'); G.steamCol = C.Orange; G.steam = 2.4; await wait(tok, 2.5); gogo.pose('sway', 0); },                              // 따뜻해서 흐뭇
  async Red(tok) { seen.add('hot'); gogo.setMood('hot', 2.6); gogo.pose('fluster', 1); say('hot'); G.steamCol = C.Red; G.steam = 2.4; const x = s.pos.x; await walk(tok, x + 0.8, s.pos.z); await walk(tok, x - 0.8, s.pos.z); await walk(tok, x, s.pos.z); gogo.pose('fluster', 0); await face(tok, 0); },   // 앗 뜨거
  async Blue(tok) { seen.add('brr'); gogo.setMood('fluster', 2.4); gogo.pose('hands', 0.7); G.shiver = 1; for (let i = 0; i < 3; i++) { say('brr'); await wait(tok, 0.75); } G.shiver = 0; gogo.pose('hands', 0); },                                          // 덜덜 떤다
  async Yellow(tok) { seen.add('shine'); G.flashCol = C.Yellow; for (let i = 0; i < 2; i++) { gogo.act('jump', { mood: 'joy' }); say('joy'); G.flash = 1; fx.spark(v3.set(s.pos.x, 0.7, s.pos.z), '#fff2a0', 22, 0.4, 2.2); sfx.spark(false); await wait(tok, 0.85); } },                       // 별처럼 반짝
  async Brown(tok) { seen.add('mud'); gogo.setMood('sour', 1.6); say('yuck'); await wait(tok, 0.6); await shakeOff(tok, C.Brown, true); gogo.setMood('fluster', 0.8); await wait(tok, 0.5); },                    // 흙탕 — 몸을 털어 방울이 튄다
};
async function dyed(tok, n) { gogo.stop(); await face(tok, 0); gogo.pose('hands', 1); gogo.setMood('wow', 1.3); say('wow'); G.self = 1.2; await wait(tok, 1.2); gogo.pose('hands', 0); await REACT[n](tok); gogo.setMood('smile', 1.5); await goHome(tok); }   // 제 몸을 내려다보고 놀란 뒤
/** 물건이 물들면 다가가서 본다. 파란 사과에는 고개를 갸웃한다. */
async function lookThing(tok, t, n) {
  const side = t.x > s.pos.x ? -1 : 1, odd = t === apple && n === 'Blue'; gogo.lookAt(centerOf(t, v3)); gogo.setMood('wow', 1); say('wow'); await wait(tok, 0.5);
  await walk(tok, t.x + side * 0.75, t === ball ? T.BENCH.Z0 : 0.2); await face(tok, toward(t)); gogo.lookAt(centerOf(t, v3));
  if (odd) { seen.add('blueApple'); gogo.setMood('idle'); G.tilt = 1; say('hm'); await wait(tok, 1.3); G.tilt = -1; say('hm'); await wait(tok, 1.1); G.tilt = 0; gogo.pose('poke', 1); await wait(tok, 0.35); t.tvx += 4; sfx.tick(); await wait(tok, 0.4); gogo.pose('poke', 0); gogo.setMood('fluster', 0.8); }
  else { gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); }
  gogo.setMood('smile', 1.2); await goHome(tok);
}
async function goHome(tok) { if (Math.abs(s.pos.x - T.HOME[0]) > 0.5) await walk(tok, T.HOME[0] + rand(-0.15, 0.15), T.HOME[1] + rand(-0.05, 0.2)); await face(tok, 0); }   // 물건을 가리지 않게 제자리로
async function mixJoy(tok) { gogo.lookAt(potTop(v3)); gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); gogo.setMood('smile', 1.5); await wait(tok, 0.8); }
async function yuck(tok) { gogo.lookAt(potTop(v3)); gogo.act('surprise', { mood: 'wow' }); say('oops'); await wait(tok, 0.8); await face(tok, 0.2); G.nose = 1; gogo.setMood('sour', 2.6); gogo.pose('lean', -0.7); say('yuck'); await wait(tok, 2.6); G.nose = 0; gogo.pose('lean', 0); }   // 으, 냄새
async function watchPot(tok) { await walk(tok, POT.x + 1.02, T.BENCH.Z0); await face(tok, toward(POT)); gogo.pose('lean', 0.7); gogo.setMood('wow', 2); await wait(tok, 2.4); gogo.pose('lean', 0); }
/** 가만두면: 솥이 맑으면 병을 톡 건드려 보고(무엇을 집을지 보여 준다), 물약이 있으면 몰래 맛보다가 그 색 딸꾹질을 한다. */
async function idle(tok) {
  if (POT.color === 'Water') { const t = tools[['red', 'blue', 'yellow'][Math.floor(Math.random() * 3)]]; await walk(tok, Math.min(-0.9, t.home.x + 0.62), 0.2); await face(tok, toward(t.home)); gogo.lookAt(local(t, 0, 0.3, v3)); gogo.pose('poke', 1); await wait(tok, 0.35);
    t.wobV += 5; sfx.clink(); seen.add('poke'); voice.word(t.word, () => local(t, 0, t.reach + 0.2, vWord), { name: true, cls: 'name ' + cls(t.word), by: t.name }); await wait(tok, 0.5); gogo.pose('poke', 0); gogo.lookAt(potTop(v3)); gogo.setMood('smile', 1.4); await wait(tok, 1.2); }
  else { const n = POT.color; await walk(tok, POT.x + 0.98, T.BENCH.Z0); await face(tok, toward(POT)); gogo.lookAt(potMouth(v3)); gogo.pose('lean', 1); gogo.pose('poke', 1); await wait(tok, 0.7); sfx.gulp(); POT.joltV += 1.5; gogo.pose('poke', 0); gogo.pose('lean', 0); gogo.setMood('smile', 0.8); await wait(tok, 0.7); await face(tok, 0);
    seen.add('hiccup'); G.flashCol = C[n]; for (let i = 0; i < 3; i++) { gogo.setMood('wow', 0.35); s.sizeV += 2.6; G.flash = 1; tone(520, 980, 0.07, { type: 'triangle', g: 0.14 }); for (let j = 0; j < 3; j++) puff(mouth(v3), C[n], 0.025, rand(0.05, 0.09), rand(0.9, 1.5), 0.9, rand(-0.5, 0.5), rand(0.9, 1.6), rand(0.3, 0.8)); await wait(tok, 0.7); } gogo.setMood('joy', 1); say('joy'); await wait(tok, 0.8); }
  await goHome(tok);
}
function slip() { seen.add('slip'); L.slipCool = 4; L.slide = (s.pos.x > foam.x ? 1 : -1) * 1.8; run(async tok => { gogo.act('fall', { lock: true }); gogo.setMood('wow', 0.5); L.fallT = 0; say('oops'); await wait(tok, 2.7); gogo.setMood('smile', 1.2); }); }
function tickle() { name(GOGO); if (B.tok || s.act) return; run(async tok => { gogo.act('surprise', { mood: 'joy' }); say('joy'); s.sizeV += 1.2; await wait(tok, 0.9); }); }

// ── 공: 건드리면 굴러갔다 돌아온다. 물든 공은 지나간 자리에 색 자국을 남긴다
ball.trail = 0;
ball.live = dt => { const t = ball; t.vx += (-(t.x - t.home.x) * 2.4 - t.vx * 1.0) * dt; if (Math.abs(t.vx) < 0.02 && Math.abs(t.x - t.home.x) < 0.01) t.vx = 0;
  if (Math.abs(t.x - s.pos.x) < 0.55 && Math.abs(t.z - s.pos.z) < 0.5 && t.vx < 0 && s.y < 0.3) { t.vx = Math.abs(t.vx) * 0.8; sfx.bounce(0.5); gogo.setMood('wow', 0.6); }           // 고고에게 부딪히면 되돌아간다
  t.x += t.vx * dt; t.roll -= t.vx * dt / (t.r * t.size); if (t.x > 3.3) { t.x = 3.3; t.vx = -Math.abs(t.vx) * 0.4; } else if (t.x < -2.4) { t.x = -2.4; t.vx = Math.abs(t.vx) * 0.6; }   // 실험대 밖으로는 나가지 않는다
  if (t.dye && Math.abs(t.vx) > 0.25 && (t.trail -= Math.abs(t.vx) * dt) <= 0) { t.trail = T.TRAIL_EVERY; mark(t.x, t.z + rand(-0.03, 0.03), C[t.dye], 0.11, 10); seen.add('ballTrail'); } };

// ───────────────────────── 손 ─────────────────────────
const P = { down: false, x: 0, y: 0, tool: null, id: null };
function tapBench(x, z) { x = clamp(x, -T.BENCH.X, T.BENCH.X); z = clamp(z, T.BENCH.Z0, T.BENCH.Z1); B.idle = 0; run(async tok => { gogo.lookAt(v3.set(x, 0, z)); gogo.goTo(x, z); await until(tok, () => !s.target, 12); }); }
function down(x, y) {
  P.down = true; P.x = x; P.y = y; unlock(); B.idle = 0; let best = null, bd = T.GRAB_PX;
  for (const t of TOOLS) for (const [gx, gy] of t.grab) { const c = stage.screenOf(local(t, gx, gy, v3)), d = Math.hypot(c.x - x, c.y - y); if (d < bd) { bd = d; best = t; } }
  if (best) return grab(best);
  const t = pickAt(stage, [...targets, POT], x, y);
  if (t === GOGO) tickle();
  else if (t === POT) { voice.word(POT.color, () => potTop(vWord), { name: true, cls: 'name ' + cls(POT.color), by: 'pot' }); POT.boil = Math.max(POT.boil, 1); POT.joltV += 2.5; sfx.tick(); }
  else if (t) { name(t); t.tvx += rand(-4, 4); t.v += 1.5; sfx.tick(); if (t === ball) { t.vx = Math.max(-T.ROLL * 1.5, t.vx - T.ROLL); sfx.whoosh(); } }
  else if (stage.worldOn(benchPlane, x, y, v3) && Math.abs(v3.x) < 3.7 && Math.abs(v3.z) < 1.3) tapBench(v3.x, v3.z);
}
const move = (x, y) => { P.x = x; P.y = y; };
function up() { if (!P.down) return; P.down = false; release(); }
canvas.addEventListener('pointerdown', e => { if (P.down) return; P.id = e.pointerId; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} down(e.clientX, e.clientY); });
canvas.addEventListener('pointermove', e => { if (P.down && e.pointerId === P.id) move(e.clientX, e.clientY); });
const onUp = e => { if (e.pointerId === P.id) up(); }; canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
sndEl.classList.toggle('off', isMuted()); sndEl.addEventListener('click', () => { setMuted(!isMuted()); sndEl.classList.toggle('off', isMuted()); });
document.getElementById('again').addEventListener('click', () => voice.again());

// ───────────────────────── 매 장면 ─────────────────────────
let clock = 0;
function step(dt) {
  clock += dt; brain.tick(dt);
  for (const t of Object.values(things)) t.lit = false;
  stepTools(dt); stepPot(dt);
  for (const t of Object.values(things)) { stepThing(t, dt); stepPaint(t.paint, dt); }
  stepPaint(G.paint, dt);

  // 고고의 눈길: 든 것을 따라가고, 제 몸이 물들면 내려다본다
  if (G.self > 0) { G.self -= dt; gogo.lookAt(v3.set(s.pos.x + Math.sin(s.heading) * 0.55, s.y + 0.5, s.pos.z + Math.cos(s.heading) * 0.55)); }
  else if (P.tool && !B.tok) gogo.lookAt(P.tool.pos);
  else if (!B.tok && B.idle > 3 && B.idle < 7) gogo.lookAt(B.idle < 6.6 ? local(tools[['red', 'blue', 'yellow'][Math.floor(clock / 1.3) % 3]], 0, 0.4, v3) : camera.position);   // 심심해지면 병들을 흘끔흘끔 본다(무엇을 집을지 눈으로 알려 준다)
  G.watch -= dt; L.slipCool -= dt;
  // 넘친 거품을 밟으면 미끄러진다
  if (foam.t > 0.5 && foam.k > 0.7 && L.slipCool <= 0 && s.v > 0.1 && Math.hypot((s.pos.x - foam.x) / T.FOAM_R, (s.pos.z - foam.z) / (T.FOAM_R * 0.62)) < 0.95) slip();
  if (L.fallT >= 0) { const was = L.fallT; L.fallT += dt; s.pos.x = clamp(s.pos.x + L.slide * dt, -T.BENCH.X, T.BENCH.X); L.slide *= Math.exp(-2.2 * dt); if (was < 0.5 && L.fallT >= 0.5) { gogo.setMood('dizzy', 1.5); sfx.thud(1); stage.shake(T.SHAKE * 0.6); fx.spark(v3.set(s.pos.x, 0.1, s.pos.z), '#ffffff', 10, 0.3, 1); } if (L.fallT > 2.5) L.fallT = -1; }
  // 털기 · 김 · 번쩍임
  if (G.shake > 0 && Math.random() < dt * 40) { const a = rand(0, 6.28); drop(v3.set(s.pos.x + Math.cos(a) * 0.3, s.y + rand(0.3, 0.9), s.pos.z + Math.sin(a) * 0.3), Math.cos(a) * rand(1, 2.4), rand(0.5, 2), Math.sin(a) * rand(0.5, 1.4), G.shakeCol, 0, 0.04, G.splat ? G.shakeCol : null); }
  if (G.steam > 0) { G.steam -= dt; if (Math.random() < dt * 9) puff(v3.set(s.pos.x + rand(-0.25, 0.25), s.y + rand(0.8, 1.1), s.pos.z), cTmp.copy(G.steamCol).lerp(v3c, 0.55), 0.04, rand(0.1, 0.17), rand(0.8, 1.3), 0.5, rand(-0.1, 0.1), rand(0.5, 0.9), 0); }
  G.flash = Math.max(0, G.flash - dt * 2.2); gogo.tint(G.flashCol, G.flash * 0.55);
  // 심심하면 혼자 해 본다
  if (!B.tok && !P.tool && !s.moving && !(s.act && s.act.lock)) { B.idle += dt; if (B.idle > T.IDLE_POKE) run(idle); } else if (P.tool || s.moving) B.idle = 0;

  gogo.update(dt);
  // 클립 위에 덧얹는 몸짓(다음 장면에 엔진이 되돌린다): 털기 · 덜덜 · 갸웃 · 냄새 쫓기
  const k = Math.min(1, 10 * dt); G.shakeNow += (G.shake - G.shakeNow) * k; G.tiltNow += (G.tilt - G.tiltNow) * Math.min(1, 6 * dt); G.noseNow += (G.nose - G.noseNow) * k;
  if (G.shakeNow > 0.01) { gogo.root.rotation.y += Math.sin(clock * 38) * 0.42 * G.shakeNow; gogo.nudge('head', 0, Math.sin(clock * 38 + 1) * 14 * G.shakeNow); }
  if (G.shiver > 0) { gogo.root.position.x += Math.sin(clock * 58) * 0.014; gogo.root.rotation.z = Math.sin(clock * 47) * 0.03; } else gogo.root.rotation.z = 0;
  if (Math.abs(G.tiltNow) > 0.01) { gogo.nudge('head', 0, 0, 20 * G.tiltNow); gogo.nudge('belly', 0, 0, 5 * G.tiltNow); }
  if (G.noseNow > 0.01) { gogo.nudge('arm_R', -30 * G.noseNow, 0, -(40 + 26 * Math.sin(clock * 15 + 2)) * G.noseNow); gogo.nudge('arm_L', -30 * G.noseNow, 0, (40 + 26 * Math.sin(clock * 15)) * G.noseNow); gogo.nudge('head', -10 * G.noseNow, 14 * Math.sin(clock * 7) * G.noseNow); }   // 으, 냄새 — 눈을 질끈 감고 고개를 돌리며 두 손을 휘휘 젓는다(팔이 짧아 코에는 닿지 않는다)
  voice.tick(dt); fx.tick(dt); stepBits(dt);
}
gogo.on('step', (side, gait) => { sfx.thud(0.7); if (s.over.lean < -0.5) fx.spark(v3.set(s.pos.x, 0.05, s.pos.z), COL.Purple, 4, 0.2, 0.7); if (G.dye === 'Brown' && Math.random() < 0.7) mark(s.pos.x + rand(-0.12, 0.12), s.pos.z + rand(-0.08, 0.08), C.Brown, 0.07, 7); });   // 으스대는 걸음에는 반짝이 · 흙빛이면 발자국

// ───────────────────────── 돌리기 ─────────────────────────
const summary = () => ({ pot: POT.color + ' ' + POT.poured.toFixed(1) + ' lv' + POT.level.toFixed(2), gogo: { x: +s.pos.x.toFixed(2), z: +s.pos.z.toFixed(2), y: +s.y.toFixed(2), dye: G.dye || '', mood: s.mood, act: s.act ? s.act.name : '' },
  things: Object.fromEntries(Object.values(things).map(t => [t.name, (t.dye || '-') + ' x' + t.x.toFixed(1)])), tools: Object.fromEntries(TOOLS.map(t => [t.name, t.state + (t.kind === 'bottle' ? ' ' + t.fill.toFixed(2) : t.kind === 'ladle' ? ' ' + (t.load || '-') : '')])),
  foam: +foam.t.toFixed(1), said: voice.said, seen: [...seen], learned: learn.log.length, errors: [...brain.errors, ...errors] });
const by = n => n === 'gogo' ? GOGO : n === 'pot' ? POT : things[n];
/** 확인용: 그 이름이 화면 어디인가(도구는 집는 자리). */
const at = n => { const c = stage.screenOf(tools[n] ? local(tools[n], ...tools[n].grab[0], v3) : centerOf(by(n), v3)); return [c.x, c.y]; };
/** 확인용: 든 것을 그 대상 위로 가져가려면 손가락이 화면 어디에 있어야 하나. */
const above = n => { const t = by(n), tool = P.tool, top = topOf(t, v3); const c = stage.screenOf(v3.set(t.x - tool.off[0], top.y + tool.gap + 0.12 - tool.off[1], t.z)); return [c.x, c.y]; };
window.__potion = { T, gogo, things, tools, POT, G, B, P, step, summary, down, move, up, at, above, camera, stage, seen };
const glide = async (x, y, tick, n = 14) => { const x0 = P.x, y0 = P.y; for (let i = 1; i <= n; i++) { move(x0 + (x - x0) * i / n, y0 + (y - y0) * i / n); await tick(); } };
if (AUTO) runAuto(stage, { step, summary, commands: {
  grab: a => down(...at(a)),
  over: async (a, b, tick) => { await glide(...above(a), tick); await glide(...above(a), tick, 6); },       // 깊이가 대상 쪽으로 옮겨 가는 동안 한 번 더 맞춘다
  to: (a, b, tick) => glide(innerWidth * +a, innerHeight * +b, tick),
  drop: () => up(),
  see: (a, b) => stage.focus(+a, 0.7, +b || 1.3, true),                                        // 확인용: 가까이 본다(가로 자리 · 반 너비)
  tap: async (a, b, tick) => { down(...at(a)); await tick(); up(); },
  walk: async (a, b, tick) => { const c = stage.screenOf(v3.set(+a, 0, +b)); down(c.x, c.y); await tick(); up(); },
} }); else { stage.play(step); document.title = 'READY ' + document.title; }
