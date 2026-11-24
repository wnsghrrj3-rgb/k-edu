/* 마법 연구소 · 얼음과 불의 실험실 (Hot / Cold) — 통합 설계서 「얼음과 불」(L1-3-4), 주인공은 몬스터 고고.
 * 하는 일은 하나: 실험대 양 끝의 마법 도구(얼음 수정 · 불꽃 등)를 집어서 무엇 위에 가져다 대고 있는다.
 *   대고 있는 동안 그것이 서서히 차가워지거나 뜨거워지고(놓으면 멈춘다), 문턱을 넘는 순간 "Cold!" / "Hot!".
 *   물그릇은 가장자리부터 얼어 얼음판이 되고 · 녹고 · 끓는다. 아이스크림은 녹아 흐르고 다시 선다. 옥수수는 팝콘이 된다.
 *   고고는 덜덜 떨다 얼음 덩어리에 갇히고, 땀을 흘리다 엉덩이에 불이 붙어 물그릇에 풍덩. 얼음판을 밟으면 주르륵 미끄러져 엉덩방아.
 * 정답 · 점수 · 시간제한 · 설명 글 없음. 영어는 그 순간의 "Cold!" / "Hot!" 과, 만졌을 때 나오는 그것의 이름(Ice · Fire · Water · Gogo …).
 * 확인용 주소: ?mute 소리 끔 · ?auto=명령,…
 *   hold:ice|fire 도구를 집는다 · to:대상:초 그 대상 위에 대고 있는다(pond · icecream · corn · gogo · ice · fire) · drop 놓는다
 *   lift:초 든 채로 위로 올린다 · tap:x:z 실험대를 누른다 · touch:대상 대상을 만진다 · step:초 → 끝나면 제목에 상태를 적는다. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStage, AUTO, clamp, rand } from '../../engine/stage.js?v=1';
import { sfx, chirp, tone, hiss, unlock, setMuted, isMuted } from '../../engine/sound.js?v=1';
import { createVoice } from '../../engine/voice.js?v=1';
import { createSparks } from '../../engine/fx.js?v=1';
import { createBrain } from '../../engine/brain.js?v=1';
import { createLearn } from '../../engine/learn.js?v=1';
import { runAuto } from '../../engine/auto.js?v=1';
import { createActor } from '../../engine/actor.js?v=1';

// ───────────────────────── 수치(준호가 만져 보고 바꾼다) ─────────────────────────
const T = {
  RATE: 0.55,                                // 대고 있으면 1초에 이만큼 차가워지거나 뜨거워진다(온도는 -1 ~ 1)
  AT: 0.6, REARM: 0.2,                       // "Cold!" · "Hot!" 문턱 · 다시 말하려면 문턱에서 이만큼 돌아와야 한다
  SETTLE_AFTER: 9, SETTLE: 0.05,             // 아이스크림 · 옥수수: 이만큼(초) 내버려 두면 천천히 제 온도로 돌아온다(1초에 이만큼)
  BENCH: { X: 3.0, Z0: -0.95, Z1: 0.7 },     // 고고가 다니는 범위(도구가 떠 있는 앞쪽은 비워 둔다)
  HOME: [-1.25, 0.4],                        // 고고가 서 있는 자리
  PLACE: { pond: [0.55, -0.35], icecream: [-2.35, -0.55], corn: [2.4, -0.55], jar: [3.2, 0.95] },
  TOOL: { Z: 1.2, TIP: [0, 0.62], MIN_Y: 0.98, MAX_Y: 3.6, REST_Y: 0.93,   // 든 도구가 떠 있는 깊이 · 손가락에서 수정까지 · 높이 범위 · 꽂이에 꽂힌 높이
    FOLLOW: 22, BACK: 0.5, GRAB_PX: 62,      // 손을 따라오는 빠르기 · 놓은 뒤 꽂이로 돌아가기까지(초) · 집었다고 보는 거리(픽셀)
    PAD: 16, HOVER: 0.8, REACH: 0.9, DWELL: 0.18,   // 대상의 가로 여유(픽셀) · 화면에서 대상 머리 위로 떠오르는 높이 · 떠오른 자리에서 이보다 높이 들면 닿지 않는다 · 이만큼 머물러야 닿기 시작한다(지나가기만 할 때는 아무 일 없게)
    CLASH_PX: 74 },                          // 두 도구가 이만큼 가까워지면 치이익
  POND: { R: 0.8, WATER_Y: 0.075, ICE_Y: 0.09, SIMMER: 0.35, COOL: 0.09, TOO_HOT: 0.45, KEEP: 0.15 },   // 물그릇: 안 반지름 · 물 높이 · 얼음 높이 · 불을 떼면 여기까지 식는다 · 식는 빠르기 · 이보다 뜨거우면 고고가 들어가지 않는다 · 그때 가장자리에서 떨어져 도는 거리
  SLIP: { V: 2.1, MIN_V: 0.3, SPIN: 0.95, PULL: 2.4, ICE_DRAG: 0.9, DRAG: 5 },              // 미끄러지는 빠르기 · 이보다 빨리 걸어야 미끄러진다 · 빙글 도는 시간 · 가운데로 끌리는 힘 · 얼음 위 · 실험대 위에서 잦아듦
  FROZEN: { STAY: 12, THAW: -0.5, TAP: 3 },  // 꽁꽁 언 채로 있는 시간 · 이 온도까지 데우면 녹는다 · 누를 때마다 줄어드는 시간
  FIRE: { HOPS: 3, HOP: 0.36, SOAK: 2.4 },   // 엉덩이에 불: 펄쩍 뛰는 횟수 · 한 번에 걸리는 시간 · 물에 앉아 있는 시간
  DRIFT: 0.09, NEAR_TOOL: 0.5,               // 고고의 몸이 제 온도로 돌아오는 빠르기 · 반대쪽 도구 곁에서는 이만큼 더 빨리
  IDLE_SHOW: 9, SNOW_FOR: 6, POP_N: 12, POP_STAY: 9,   // 가만두면 혼자 도구를 건드려 보기까지(초) · 눈이 내리는 시간 · 팝콘 알 수 · 팝콘이 남아 있는 시간
  SHAKE: 0.05,
  CAM: { AIM: [0, 1.15, 0], TILT: 17, FOV: 30, HALF_W: 4.05, MIN_DIST: 8.4 },
};
const COL = { cold: '#bfe9ff', frost: '#eaf7ff', mist: '#f2fbff', ember: '#ffb347', flame: '#ff8a2a', drop: '#9fd8f5', steam: '#ffffff', pink: '#f7a3bd' };

// ───────────────────────── 무대 ─────────────────────────
const canvas = document.getElementById('c'), sndEl = document.getElementById('snd'); if (AUTO) document.body.classList.add('auto');
const stage = createStage({ canvas, sky: ['#e6dcf6', '#d6cbee', '#b9a8dc'], cam: T.CAM }), { scene, camera } = stage;
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshStandardMaterial({ color: '#b9a7e0', roughness: 1 })); wall.position.set(0, 3, -1.76); wall.receiveShadow = true; scene.add(wall);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 12).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#a996cf', roughness: 1 })); ground.position.set(0, -2.5, 2); ground.receiveShadow = true; scene.add(ground);
const loader = new GLTFLoader(), part = {};
const [lab, mine] = await Promise.all([loader.loadAsync(new URL('../../assets/lab.glb?v=1', import.meta.url).href), loader.loadAsync(new URL('../../assets/icefire.glb?v=1', import.meta.url).href)]);
for (const g of [lab, mine]) g.scene.traverse(o => { if (o.isMesh) { part[o.name] = o; o.castShadow = o.name !== 'room'; o.receiveShadow = true; } });
scene.add(part.room);
const gogo = await createActor(scene, { model: 'gogo' }), s = gogo.state;
gogo.root.traverse(o => { if (o.isMesh) o.receiveShadow = !o.name.startsWith('GogoEyes'); });
gogo.place(T.HOME[0], T.HOME[1], 0); gogo.lookAt(camera.position);
const fx = createSparks(scene), learn = createLearn({ zone: 'world-lab', cell: 'L1-3-4' });
const v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), vD = new THREE.Vector3(), vWord = new THREE.Vector3(), wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const voice = createVoice({ el: document.getElementById('word'), screenOf: stage.screenOf, onSaid: (w, by, name) => learn.note(w, { skill: name ? 'listen' : 'move', input: 'drag', game: 'hot-cold' }) });
const seen = new Set(), say = kind => chirp(kind, 1);
const hemi = scene.children.find(o => o.isHemisphereLight);

/** 김 · 눈 · 물방울 — 부드러운 알갱이(밝은 벽 앞에서도 보이게 덧칠이 아니라 그냥 칠한다. 알갱이마다 크기와 투명도가 다르다).
 *  emit(자리, 색, 개수, 퍼짐, { v:[x,y,z](나가는 쪽), vr(제멋대로 퍼지는 빠르기), size, grow(1초에 커지는 크기), a(진하기), g(아래로 당기는 힘 · -면 떠오른다), life:[짧게, 길게] }) */
function createPuffs(n = 520) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 4), size = new Float32Array(n), pp = Array.from({ length: n }, () => ({ life: 0, max: 1, v: new THREE.Vector3(), g: 0, grow: 0, a: 1 })); let next = 0;
  const geo = new THREE.BufferGeometry(), c = new THREE.Color(), uK = { value: 400 };
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aCol', new THREE.BufferAttribute(col, 4)); geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uK },
    vertexShader: 'attribute vec4 aCol; attribute float aSize; varying vec4 vC; uniform float uK; void main(){ vC = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uK / -mv.z; }',
    fragmentShader: 'varying vec4 vC; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.3, d) * vC.a; if (a < 0.004) discard; gl_FragColor = vec4(vC.rgb, a); }' });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 5; scene.add(pts);
  function emit(p, color, count = 1, spread = 0.1, o = {}) {
    c.set(color).convertLinearToSRGB(); const v = o.v || [0, 0, 0], vr = o.vr ?? 0.3;
    for (let i = 0; i < count; i++) { const q = pp[next], j = next; next = (next + 1) % n; q.life = q.max = rand(...(o.life || [0.6, 1.1])); q.g = o.g ?? 0; q.grow = o.grow ?? 0; q.a = o.a ?? 0.8;
      pos[j * 3] = p.x + rand(-spread, spread); pos[j * 3 + 1] = p.y + rand(-spread, spread) * (o.flat ? 0.1 : 1); pos[j * 3 + 2] = p.z + rand(-spread, spread); size[j] = (o.size ?? 0.2) * rand(0.75, 1.25);
      q.v.set(v[0] + rand(-vr, vr), v[1] + rand(-vr, vr), v[2] + rand(-vr, vr)); col[j * 4] = c.r; col[j * 4 + 1] = c.g; col[j * 4 + 2] = c.b; col[j * 4 + 3] = 0; }
  }
  function tick(dt) {
    uK.value = stage.renderer.domElement.height * 0.5 * camera.projectionMatrix.elements[5];
    for (let i = 0; i < n; i++) { const q = pp[i]; if (q.life <= 0) { col[i * 4 + 3] = 0; continue; }
      q.life -= dt; pos[i * 3] += q.v.x * dt; pos[i * 3 + 1] += q.v.y * dt; pos[i * 3 + 2] += q.v.z * dt; q.v.y -= q.g * dt; size[i] += q.grow * dt;
      const k = Math.max(0, q.life / q.max); col[i * 4 + 3] = q.a * Math.min(1, (1 - k) * 7) * Math.min(1, k * 1.8); }
    geo.attributes.position.needsUpdate = geo.attributes.aCol.needsUpdate = geo.attributes.aSize.needsUpdate = true;
  }
  return { emit, tick };
}
const puffs = createPuffs();
const steam = (p, n = 1, spread = 0.2, up = 0.7, big = 1) => puffs.emit(p, COL.steam, n, spread, { v: [0, up, 0], vr: 0.25, size: 0.3 * big, grow: 0.45 * big, a: 0.62, g: -0.3, life: [0.9, 1.7] });
const mist = (p, n = 1, spread = 0.15) => puffs.emit(p, COL.mist, n, spread, { v: [0, -0.28, 0], vr: 0.1, size: 0.2, grow: 0.25, a: 0.6, life: [0.8, 1.4] });
const drops = (p, n = 8, sp = 2.4, color = COL.drop) => puffs.emit(p, color, n, 0.1, { v: [0, sp, 0], vr: sp * 0.55, size: 0.085, a: 0.95, g: 8, life: [0.45, 0.85] });
const embers = (p, n = 1, spread = 0.08) => puffs.emit(p, Math.random() < 0.5 ? COL.ember : COL.flame, n, spread, { v: [0, 0.9, 0], vr: 0.35, size: 0.06, a: 0.95, g: -0.6, life: [0.35, 0.8] });
const frost = (p, n = 10, spread = 0.3) => { fx.spark(p, COL.cold, n, spread, 1.1); puffs.emit(p, COL.frost, Math.ceil(n / 2), spread, { vr: 0.5, size: 0.07, a: 0.95, g: 1.2, life: [0.5, 1] }); };
const steamSound = (g = 0.1) => { hiss(0.6, { g, f: 4200, q: 0.7 }); sfx.fizz(); }, crack = () => { tone(1300, 420, 0.1, { type: 'square', g: 0.05 }); sfx.clink(); };

// ───────────────────────── 물건 ─────────────────────────
const own = m => { m.material = m.material.clone(); m.material.emissive = new THREE.Color('#000000'); return m; };
/** 온도에 따라 물든다: 차가우면 푸른 서리빛, 뜨거우면 주황빛. */
const cTint = new THREE.Color('#a8dcff'), hTint = new THREE.Color('#ff7a2a');
function tintBy(mats, temp) { for (const m of mats) { m.emissive.copy(temp < 0 ? cTint : hTint); m.emissiveIntensity = temp < 0 ? -temp * 0.42 : temp * 0.3; } }
const wob = (t, dt) => { t.tv += (-80 * t.tx - 6 * t.tv) * dt; t.tx += t.tv * dt; };
const base = (name, x, z, r, h) => ({ name, x, z, y: 0, r, h, temp: 0, cold: false, hot: false, gone: false, idle: 0, tx: 0, tv: 0 });

// ── 물그릇: 물(투명) · 얼음(가장자리부터 덮인다) · 끓는 방울 · 물결
const pond = Object.assign(base('pond', ...T.PLACE.pond, 0.88, 0.12), { k: 0, frozen: false, boilT: 0 });
{ const d = part.dish; d.position.set(pond.x, 0, pond.z); scene.add(d); }
const water = new THREE.Mesh(new THREE.CircleGeometry(0.815, 48), new THREE.MeshPhysicalMaterial({ color: '#2f9fe0', transparent: true, opacity: 0.86, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.7 }));
water.rotation.x = -Math.PI / 2; water.position.set(pond.x, T.POND.WATER_Y, pond.z); water.receiveShadow = true; scene.add(water);
const waterCold = new THREE.Color('#2f9fe0'), waterHot = new THREE.Color('#8fd9e4');
const iceU = { value: 0 }, ice = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#d9efff'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${110 + Math.random() * 50},${185 + Math.random() * 30},250,${0.14 + Math.random() * 0.18})`; x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, 12 + Math.random() * 34, 0, 7); x.fill(); }
  x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineCap = 'round';
  for (let i = 0; i < 22; i++) { x.lineWidth = 1 + Math.random() * 2.2; const a = Math.random() * 7, px = Math.random() * 256, py = Math.random() * 256, l = 14 + Math.random() * 40; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshPhysicalMaterial({ map, transparent: true, roughness: 0.2, clearcoat: 0.7, emissive: '#8fd0ff', emissiveIntensity: 0.1 });
  mat.onBeforeCompile = sh => {                // 얼음이 가장자리부터 안으로 덮인다(uK = 0 ~ 1). 끝은 들쭉날쭉하게
    sh.uniforms.uK = iceU; sh.vertexShader = 'varying vec2 vP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvP = position.xy;');
    sh.fragmentShader = 'uniform float uK;\nvarying vec2 vP;\n' + sh.fragmentShader.replace('#include <alphamap_fragment>',
      'float r_ = length(vP) / 0.82; float a_ = atan(vP.y, vP.x); float e_ = 1.04 - uK * 1.27 + min(1.0, uK * 4.0) * (0.05 * sin(a_ * 7.0) + 0.035 * sin(a_ * 13.0 + 1.7)); diffuseColor.a *= smoothstep(e_ - 0.015, e_ + 0.05, r_);');
  };
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.82, 64), mat); m.rotation.x = -Math.PI / 2; m.position.set(pond.x, T.POND.ICE_Y, pond.z); m.receiveShadow = true; m.visible = false; scene.add(m); return m;
})();
const bubbles = Array.from({ length: 9 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), new THREE.MeshPhysicalMaterial({ color: '#e8fbff', transparent: true, opacity: 0.75, roughness: 0.05, clearcoat: 1 })); m.visible = false; scene.add(m); return { m, t: 0, dur: 0.4, s: 1 }; });
const rings = Array.from({ length: 5 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 40), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); return { m, t: 1, size: 0.3 }; }); let ringN = 0;
/** 물결 하나(물일 때만). 그릇 밖으로 나가지 않게 가운데 쪽으로 당겨 그린다. */
function ripple(x, z, size = 0.32) {
  if (pond.k > 0.4) return; const r = rings[ringN++ % rings.length], dx = x - pond.x, dz = z - pond.z, d = Math.hypot(dx, dz) || 1, lim = Math.max(0, 0.78 - size) / d;
  r.t = 0; r.size = size; r.m.position.set(pond.x + dx * Math.min(1, lim), T.POND.WATER_Y + 0.004, pond.z + dz * Math.min(1, lim));
}
const pondTop = out => out.set(pond.x, 0.5, pond.z);

// ── 아이스크림: 과자 · 덩이(녹으면 납작해진다) · 웅덩이
const ic = Object.assign(base('icecream', ...T.PLACE.icecream, 0.26, 0.93), { m: 0, pud: 0, licked: false, grp: new THREE.Group() });
ic.grp.position.set(ic.x, 0, ic.z); ic.grp.add(own(part.cone), own(part.scoop)); scene.add(ic.grp); own(part.puddle); part.puddle.position.set(ic.x, 0.004, ic.z); part.puddle.castShadow = false; part.puddle.visible = false; scene.add(part.puddle);
ic.mats = [part.cone.material, part.scoop.material];
// ── 옥수수와 팝콘
const corn = Object.assign(base('corn', ...T.PLACE.corn, 0.2, 0.7), { state: 'home', s: 1, sv: 0, t: 0, grp: new THREE.Group() });
corn.grp.position.set(corn.x, 0, corn.z); corn.grp.add(own(part.corn)); scene.add(corn.grp); corn.mats = [part.corn.material];
const pieces = Array.from({ length: T.POP_N }, () => { const m = part.popcorn.clone(); m.visible = false; scene.add(m); return { m, state: 'off', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, rz: 0, t: 0, s: 1 }; });

// ── 마법 도구 둘: 얼음 수정 · 불꽃 등(꽂이에 꽂혀 있다)
part.gem.material = new THREE.MeshPhysicalMaterial({ vertexColors: true, flatShading: true, roughness: 0.12, clearcoat: 1, emissive: '#5cbcff', emissiveIntensity: 0.4, envMapIntensity: 1.6 });
part.flame.material = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }); part.flame.castShadow = false; part.gem.castShadow = false;
function makeTool(kind, dir, name, handle, head, x) {
  const obj = new THREE.Group(), rest = new THREE.Vector3(x, T.TOOL.REST_Y, T.PLACE.jar[1]), jar = kind === 'ice' ? part.jar : part.jar.clone(), light = new THREE.PointLight(dir < 0 ? '#7cc6ff' : '#ff9a40', 0, 5, 1.4);
  obj.add(handle, head, light); scene.add(obj); jar.position.set(x, 0, T.PLACE.jar[1]); scene.add(jar);
  return { kind, dir, name, obj, head, rest, light, pos: rest.clone(), to: rest.clone(), state: 'rest', back: 0, tilt: 0, kick: 0, kv: 0, on: null, over: null, dwell: 0, puff: 1, hop: 0 };
}
const ICE = makeTool('ice', -1, 'Ice', part.icewand, part.gem, -T.PLACE.jar[0]), FIRE = makeTool('fire', 1, 'Fire', part.torch, part.flame, T.PLACE.jar[0]), tools = [ICE, FIRE];
ICE.other = FIRE; FIRE.other = ICE; ICE.hop = 2.5; FIRE.hop = 4.5;

// ── 고고(대상으로서) · 얼음 덩어리 · 엉덩이 불
const G = { name: 'gogo', r: 0.36, h: 1.05, temp: 0, cold: false, hot: false, gone: false, tx: 0, tv: 0, mode: 'free', t: 0, brr: 0, shakeT: 0, vx: 0, vz: 0, fell: false, h0: 0, turn: 0, bk: 0, bv: 0, jig: 0, jv: 0, fireK: 0, ouch: 0, fallT: -1,
  get x() { return s.pos.x; }, get z() { return s.pos.z; }, get y() { return s.y; } };
const block = part.iceblock; block.material = new THREE.MeshPhysicalMaterial({ color: '#cfeeff', transparent: true, opacity: 0.5, roughness: 0.05, clearcoat: 1, envMapIntensity: 2, depthWrite: false, emissive: '#7cc6ff', emissiveIntensity: 0.12 }); block.castShadow = false; block.receiveShadow = false; block.visible = false; block.renderOrder = 3; scene.add(block);
const butt = part.flame.clone(); butt.position.set(0, 0.42, -0.37); butt.visible = false; gogo.root.add(butt);
/** 도구가 그 대상 위에 떠 있을 높이(대상 꼭대기에서). 도구는 앞쪽에 떠 있으니, 카메라가 내려다보는 기울기만큼 더 올려야 화면에서 대상의 머리 위로 보인다. */
const hoverOf = t => (t === pond ? 0.75 : T.TOOL.HOVER) + (T.TOOL.Z - t.z) * (stage.camBase.y - 1.5) / (stage.camBase.z - T.TOOL.Z);
const targets = [G, pond, ic, corn], byName = { gogo: G, pond, icecream: ic, corn }, topY = t => t.y + t.h;
const centerOf = (t, out) => out.set(t.x, t.y + t.h * 0.5, t.z), topOf = (t, out) => { const w = tools.find(o => o.on === t); return w ? out.set(w.pos.x, w.pos.y + 0.4, w.pos.z) : t === pond ? pondTop(out) : out.set(t.x, t.y + t.h + 0.05, t.z); };   // 도구를 대고 있으면 낱말은 도구 위에(가리지 않게)
const nameOf = t => t === pond ? (pond.k > 0.85 ? 'Ice' : 'Water') : t === ic ? 'Ice cream' : t === corn ? 'Corn' : 'Gogo';

// ───────────────────────── 고고의 머리(하고 싶은 일) ─────────────────────────
const applied = t => tools.some(w => w.on === t), held = () => tools.find(w => w.state === 'held');
const brain = createBrain(gogo, { bounds: T.BENCH, poses: ['poke', 'sway', 'lean', 'reach'], onEnd: () => { if (!held()) gogo.lookAt(camera.position); }, onLand: () => { sfx.thud(0.6); if (G.mode === 'fire') stage.shake(T.SHAKE * 0.4); } });
const B = brain.B, { run, wait, until, walk, face, hop } = brain; B.where = 'bench';
const landed = async tok => { if (B.hop) await until(tok, () => !B.hop); };
function fallNow() { gogo.act('fall', { lock: true }); gogo.setMood('wow', 0.5); G.fallT = 0; say('oops'); }
const chew = async (tok, n = 3) => { for (let i = 0; i < n; i++) { gogo.setMood('chewA', 0.3); await wait(tok, 0.17); gogo.setMood('chewB', 0.3); await wait(tok, 0.17); } };

/** 도구를 뗀 뒤: 추우면 불꽃 등으로 가서 손을 쬐고, 더우면 얼음 수정 곁에서 식힌다. */
async function afterGogo(tok) {
  await landed(tok); const coldNow = G.temp < -0.3, w = coldNow ? FIRE : G.temp > 0.3 ? ICE : null;
  if (!w) { gogo.setMood('smile', 1); await face(tok, 0); return; }
  say(coldNow ? 'brr' : 'hot'); await wait(tok, 0.7);
  if (w.state !== 'rest') { await face(tok, 0); return; }
  const side = w.dir; await walk(tok, w.rest.x - side * 0.85, 0.55); await face(tok, side * Math.PI / 2); gogo.lookAt(w.pos); gogo.pose('reach', 1); gogo.setMood('smile', 4);
  await until(tok, () => Math.abs(G.temp) < 0.06, 5); seen.add(coldNow ? 'warmUp' : 'coolDown'); gogo.pose('reach', 0); gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9);
  await walk(tok, ...T.HOME); await face(tok, 0);
}
/** 꽁꽁: 얼음 덩어리 속에 갇혀 눈만 굴린다. */
function freeze() {
  G.mode = 'frozen'; G.t = T.FROZEN.STAY; G.temp = -1; brain.stop(); gogo.stop(); s.busy = true; s.act = null; s.faceTo = null; gogo.mixer.timeScale = 0; seen.add('frozen');
  G.bk = 0.35; G.bv = 5; crack(); stage.shake(T.SHAKE); frost(v3.set(s.pos.x, s.y + 0.7, s.pos.z), 22, 0.5); mist(v3, 8, 0.5);
}
function thaw() {
  if (G.mode !== 'frozen') return; G.mode = 'free'; G.temp = -0.25; gogo.mixer.timeScale = 1; G.shakeT = 1.0; seen.add('thaw'); crack(); sfx.pop();
  drops(v3.set(s.pos.x, s.y + 0.7, s.pos.z), 26, 2.6); frost(v3, 14, 0.5);
  run(async tok => { gogo.setMood('wow', 0.9); say('wow'); await wait(tok, 1.0); gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); await face(tok, 0); });
}
/** 엉덩이에 불: 펄쩍펄쩍 뛰어다니다 물그릇에 풍덩. */
function ignite() { G.mode = 'fire'; G.temp = 1; seen.add('buttFire'); sfx.spark(false); run(fireRun); }
async function fireRun(tok) {
  gogo.setMood('hot', 9); say('hot'); gogo.act('surprise'); await wait(tok, 0.5);
  for (let i = 0; i < T.FIRE.HOPS; i++) {
    let x = rand(-1.9, -0.5), z = rand(0.05, 0.55); if (Math.abs(x - s.pos.x) < 0.7) x = x > -1.3 ? x - 0.8 : x + 0.8;
    hop(x, z, 0, 'bench', T.FIRE.HOP); if (i % 2 === 0) say('hot'); await until(tok, () => !B.hop); gogo.setMood('hot', 9);
  }
  hop(pond.x, pond.z, 0, 'bench', 0.62); await until(tok, () => !B.hop); splash();
}
function splash() {
  const p = v3.set(pond.x, 0.15, pond.z); seen.add('splash'); G.mode = 'soak'; G.t = T.FIRE.SOAK; G.temp = 0.1; s.faceTo = 0;
  if (pond.temp < -0.3) { crack(); frost(p, 16, 0.6); } if (pond.temp < -0.3 || pond.temp > T.POND.TOO_HOT) pond.temp = 0.1;       // 얼음판이면 불에 녹아 풍덩, 끓는 물이면 식는다
  drops(p, 34, 3.4); steam(v3b.set(pond.x, 0.2, pond.z - 0.35), 16, 0.45, 0.9, 1.3); steamSound(0.14); sfx.splat(); stage.shake(T.SHAKE * 1.3); pond.k = Math.min(pond.k, 0.3); ripple(pond.x, pond.z, 0.7);
  gogo.setMood('joy', T.FIRE.SOAK); gogo.pose('sway', 0.5); say('joy');
}
/** 불붙은 엉덩이에 얼음 수정을 대면 그 자리에서 꺼진다. */
function douse() {
  G.mode = 'free'; G.temp = 0.25; seen.add('douse'); steam(v3.set(s.pos.x, s.y + 0.4, s.pos.z), 12, 0.3, 0.9); steamSound();
  run(async tok => { await landed(tok); gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); await face(tok, 0); });
}
/** 얼음판: 주르륵 미끄러져 빙글 돌다 엉덩방아. */
function slipStart() {
  G.mode = 'slip'; G.t = 0; G.fell = false; G.h0 = s.heading; G.turn = Math.PI * 4 + wrap(1.1 - s.heading); G.vx = Math.sin(s.heading) * T.SLIP.V; G.vz = Math.cos(s.heading) * T.SLIP.V;
  brain.stop(); gogo.stop(); s.busy = true; s.faceTo = null; s.act = null; seen.add('slip'); say('wow'); gogo.setMood('wow', 1.2); tone(1250, 330, 0.75, { g: 0.09 }); hiss(0.6, { g: 0.05, f: 2600, q: 3 });
}
function slipStep(dt, inPond) {
  G.t += dt; s.target = null; s.busy = true;
  if (!G.fell) {
    const k = clamp(G.t / T.SLIP.SPIN, 0, 1); s.heading = wrap(G.h0 + G.turn * (1 - (1 - k) ** 2));
    if (inPond) { G.vx += (pond.x - s.pos.x) * T.SLIP.PULL * dt; G.vz += (pond.z - s.pos.z) * T.SLIP.PULL * dt; if (Math.random() < dt * 40) frost(v3.set(s.pos.x, T.POND.ICE_Y + 0.03, s.pos.z), 2, 0.15); }
    if (k >= 1) { G.fell = true; fallNow(); }
  }
  const f = Math.exp(-(inPond && pond.k > 0.5 ? T.SLIP.ICE_DRAG : T.SLIP.DRAG) * dt); G.vx *= f; G.vz *= f;
  s.pos.x = clamp(s.pos.x + G.vx * dt, -T.BENCH.X, T.BENCH.X); s.pos.z = clamp(s.pos.z + G.vz * dt, T.BENCH.Z0, T.BENCH.Z1);
  if (G.fell && Math.hypot(G.vx, G.vz) < 0.15) { G.mode = 'free'; s.busy = false; B.idle = 0; if (!held()) gogo.lookAt(camera.position); }       // 다 미끄러졌다(일어나는 것은 넘어지는 동작이 맡는다 — 그사이 누른 곳은 일어난 뒤에 간다)
}
/** 녹은 아이스크림을 핥는다. */
async function lick(tok) {
  await landed(tok); gogo.lookAt(centerOf(ic, v3)); gogo.setMood('wow', 0.8); say('wow'); await wait(tok, 0.7);
  await walk(tok, ic.x + 0.9, ic.z + 0.2); await face(tok, Math.atan2(-0.9, 0.3)); if (ic.m < 0.6) return;
  gogo.lookAt(v3.set(ic.x, 0, ic.z + 0.25)); gogo.pose('lean', 1); gogo.setMood('want', 0.6); await wait(tok, 0.5); if (ic.m < 0.6) return;
  seen.add('lick'); ic.licked = true; sfx.gulp(); await chew(tok, 4); sfx.gulp(); say('yum'); gogo.pose('lean', 0); gogo.setMood('joy', 1.2); await wait(tok, 0.9); await face(tok, 0);
}
/** 팝콘이 튀면 놀랐다가 두 알 주워 먹는다. */
async function popTask(tok) {
  await landed(tok); gogo.lookAt(centerOf(corn, v3)); gogo.act('surprise', { mood: 'wow' }); say('wow'); await wait(tok, 1.5);
  for (let n = 0; n < 2; n++) {
    let k = null, bd = 1e9; for (const p of pieces) { const d = Math.hypot(p.x - s.pos.x, p.z - s.pos.z); if (p.state === 'rest' && Math.abs(p.x) < T.BENCH.X && p.z < T.BENCH.Z1 + 0.5 && Math.hypot(p.x - pond.x, p.z - pond.z) > 1.25 && d < bd) { bd = d; k = p; } }
    if (!k) break; const side = s.pos.x <= k.x ? -1 : 1; await walk(tok, k.x + side * 0.5, k.z - 0.05); await face(tok, Math.atan2(k.x - s.pos.x, k.z - s.pos.z));
    gogo.lookAt(v3.set(k.x, 0.1, k.z)); gogo.pose('lean', 1); gogo.setMood('want', 0.6); await wait(tok, 0.4); gogo.pose('lean', 0); if (k.state !== 'rest') continue;
    k.state = 'eaten'; k.t = 0; seen.add('popcornEat'); voice.word('Popcorn', () => vWord.set(s.pos.x, s.y + 1.15, s.pos.z), { name: true, by: 'popcorn' }); sfx.munch(2); await chew(tok, 2); say('yum'); gogo.setMood('joy', 0.7); await wait(tok, 0.4);
  }
  await face(tok, 0);
}
/** 눈이 내리면 올려다보고 입을 벌려 받아먹는다. */
async function snowTask(tok) {
  await landed(tok); gogo.lookAt(v3.set(s.pos.x, 3.5, s.pos.z + 1)); gogo.setMood('wow', 1.2); say('wow'); await wait(tok, 1.2);
  gogo.setMood('want', 1.6); await wait(tok, 1.6); gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); await face(tok, 0);
}
/** 심심하면 혼자 도구 하나를 건드려 본다(글 없는 안내): 수정을 찌르면 오싹, 등을 찌르면 앗 뜨거. */
let showN = 0;
async function show(tok) {
  const w = tools[showN++ % 2]; if (w.state !== 'rest') return;
  await walk(tok, w.rest.x - w.dir * 0.8, 0.55); await face(tok, w.dir * Math.PI / 2); gogo.lookAt(w.pos); gogo.pose('poke', 1); await wait(tok, 0.4);
  poke(w); seen.add('show'); voice.word(w.name, () => vWord.copy(w.pos).setY(w.pos.y + 0.45), { name: true, by: w.kind }); G.temp = clamp(G.temp + w.dir * 0.48, -0.55, 0.55); say(w.dir < 0 ? 'brr' : 'hot'); gogo.setMood(w.dir < 0 ? 'fluster' : 'hot', 1.2);
  await wait(tok, 0.5); gogo.pose('poke', 0); await wait(tok, 1.3); await walk(tok, rand(-1.6, -0.9), rand(0.2, 0.5)); await face(tok, 0);
}
function poke(w) { w.kv += 9 * (Math.random() < 0.5 ? -1 : 1); w.puff = 1.5; if (w.dir < 0) { mist(w.pos, 6, 0.2); frost(w.pos, 8, 0.25); sfx.clink(); } else { embers(w.pos, 10, 0.15); sfx.spark(false); } }

// ── 문턱을 넘는 순간
function crossing(t) {
  const o = { by: t.name, gap: 0.7, pitch: t === G ? 1.3 : undefined };
  if (!t.cold && t.temp <= -T.AT) { t.cold = true; voice.word('Cold!', () => topOf(t, vWord), { ...o, cls: 'cold' }); sfx.spark(true); frost(topOf(t, v3), 16, t === pond ? 0.7 : 0.3); onCross(t, -1); } else if (t.cold && t.temp > -T.AT + T.REARM) t.cold = false;
  if (!t.hot && t.temp >= T.AT) { t.hot = true; voice.word('Hot!', () => topOf(t, vWord), { ...o, cls: 'hot' }); sfx.spark(false); fx.spark(topOf(t, v3), '#ffb060', 16, 0.3, 1.5); onCross(t, 1); } else if (t.hot && t.temp < T.AT - T.REARM) t.hot = false;
}
const freeNow = () => G.mode === 'free' && !applied(G);
function onCross(t, dir) {
  if (t === G) { say(dir < 0 ? 'brr' : 'hot'); return; }
  if (t === pond && dir < 0) crack();
  if (t === corn && dir > 0) { popCorn(); return; }
  if (t === ic && dir > 0) { if (freeNow()) run(lick); return; }
  if (freeNow() && !B.tok) { gogo.lookAt(centerOf(t, v3)); gogo.setMood('wow', 1.1); say('wow'); }
}
function popCorn() {
  corn.state = 'popped'; corn.gone = true; corn.t = 1.2; seen.add('popcorn'); stage.shake(T.SHAKE * 0.7);
  pieces.forEach((p, i) => { p.state = 'wait'; p.t = i * 0.045; p.s = 0; p.m.visible = false; });
  if (freeNow()) run(popTask);
}
function snow() {
  if (R.snow > 0) return; R.snow = T.SNOW_FOR; seen.add('snow'); sfx.spark(true); steam(pondTop(v3), 14, 0.5, 1.6, 1.2);
  voice.word('Snow', () => vWord.set(pond.x, 2.0, pond.z), { name: true, by: 'snow' }); if (freeNow()) run(snowTask);
}
/** 얼음 수정과 불꽃이 만나면 치이익 — 김 구름이 터진다. */
function clash(w) {
  const o = w.other, m = v3.copy(w.pos).lerp(o.pos, 0.5); seen.add('clash'); steam(m, 30, 0.35, 0.7, 1.6); drops(m, 14, 2.2, COL.steam); steamSound(0.16); stage.shake(T.SHAKE * 1.6);
  o.kv += 12 * w.dir; w.pos.x -= Math.sign(o.pos.x - w.pos.x || 1) * 0.55; w.pos.y += 0.25; w.puff = o.puff = 0.35;
  if (freeNow()) run(async tok => { await landed(tok); gogo.lookAt(m); gogo.act('surprise', { mood: 'wow' }); say('wow'); await wait(tok, 1.3); await face(tok, 0); });
}

// ───────────────────────── 손(집어서 가져다 대기) ─────────────────────────
const benchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), toolPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -T.TOOL.Z), P = { down: false, x: 0, y: 0, mode: null, tool: null, armed: true };
/** 화면의 (x, y) 가까이에 있는 도구(수정 · 불꽃에서 자루 끝까지를 잡을 수 있다). */
function toolAt(x, y) {
  let best = null, bd = T.TOOL.GRAB_PX;
  for (const w of tools) { if (w.state === 'held') continue; const a = stage.screenOf(w.pos), b = stage.screenOf(v3.copy(w.pos).setY(w.pos.y - 0.8)), k = clamp(((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / ((b.x - a.x) ** 2 + (b.y - a.y) ** 2 || 1), 0, 1), d = Math.hypot(a.x + (b.x - a.x) * k - x, a.y + (b.y - a.y) * k - y); if (d < bd) { bd = d; best = w; } }
  return best;
}
/** 화면의 (x, y) 에 있는 대상(만져서 이름을 들을 때). */
function pick(x, y) {
  let best = null, bd = 1;
  for (const t of targets) { if (t.gone) continue; const c = stage.screenOf(centerOf(t, v3)), e = stage.screenOf(v3.set(t.x + t.r, t.y + t.h * 0.5, t.z)), u = stage.screenOf(t === pond ? v3.set(t.x, t.y, t.z - t.r) : v3.set(t.x, t.y + t.h, t.z));
    const d = Math.hypot((x - c.x) / (Math.abs(e.x - c.x) + 14), (y - c.y) / (Math.abs(u.y - c.y) + 14)) * (t === G ? 0.75 : 1); if (d < bd) { bd = d; best = t; } }
  return best;
}
function grab(w) { if (P.tool) letGo(); P.tool = w; P.mode = 'tool'; w.state = 'held'; w.over = null; w.dwell = 0; B.idle = 0; P.armed = true; sfx.grab(); voice.word(w.name, () => vWord.copy(w.pos).setY(w.pos.y + 0.45), { name: true, by: w.kind }); }
function letGo() { const w = P.tool; if (!w) return; P.tool = null; stopApply(w); w.over = null; w.state = 'back'; w.back = T.TOOL.BACK; sfx.pop(); }
function startApply(w, t) {
  w.on = t; sfx.tick(); B.idle = 0;
  if (t === G && G.mode === 'free') { brain.stop(); gogo.stop(); s.busy = true; }
  if (t === pond && w.dir < 0 && pond.temp >= T.AT - 0.03) snow();              // 끓는 물에 얼음 수정 → 김이 눈이 되어 내린다
}
function stopApply(w) { const t = w.on; if (!t) return; w.on = null; if (t === G && G.mode === 'free' && !applied(G)) run(afterGogo); }
function heatGogo(dir, dt) {
  if (G.mode === 'frozen') { if (dir > 0 && (G.temp += T.RATE * 1.2 * dt) > T.FROZEN.THAW) thaw(); }
  else if (G.mode === 'fire') { if (dir < 0 && (G.temp -= T.RATE * 2 * dt) < 0.5) douse(); }
  else if (G.mode === 'free') { G.temp = clamp(G.temp + dir * T.RATE * dt, -1, 1); s.busy = true; s.target = null; if (G.temp <= -1) freeze(); else if (G.temp >= 1) ignite(); }
}
/** 대고 있는 동안: 온도가 움직이고, 도구에서 대상으로 김(불티)이 흘러간다. */
function apply(w, t, dt) {
  if (t === G) heatGogo(w.dir, dt); else if (!t.gone) { t.temp = clamp(t.temp + w.dir * T.RATE * dt, -1, 1); t.idle = 0; }
  const to = t === pond ? v3b.set(clamp(w.pos.x, pond.x - 0.5, pond.x + 0.5), 0.12, pond.z + 0.15) : v3b.set(t.x, topY(t) - 0.12, t.z), k = Math.random(), d = vD.copy(to).sub(w.pos), len = d.length() || 1;
  if (Math.random() < dt * 46) { const p = v3.copy(w.pos).addScaledVector(d, k * 0.6); d.multiplyScalar(2.6 / len);
    if (w.dir < 0) puffs.emit(p, COL.mist, 1, 0.07, { v: [d.x, d.y, d.z], vr: 0.2, size: 0.17, grow: 0.3, a: 0.7, life: [0.3, 0.5] }); else puffs.emit(p, Math.random() < 0.5 ? COL.ember : COL.flame, 1, 0.07, { v: [d.x, d.y, d.z], vr: 0.3, size: 0.075, a: 0.95, life: [0.3, 0.5] }); }
  if (Math.random() < dt * 9) { if (w.dir < 0) { fx.spark(to, COL.cold, 1, t.r * 0.7, 0.5); tone(rand(2300, 3300), 1900, 0.03, { type: 'triangle', g: 0.025 }); } else { fx.spark(to, '#ffb060', 1, t.r * 0.7, 0.7); hiss(0.07, { g: 0.025, f: 3200 }); } }
}
function touch(t) {
  B.idle = 0; t.tv += 6; sfx.tick(); voice.word(nameOf(t), () => topOf(t, vWord), { name: true, by: t.name });
  if (t === pond) { if (pond.k > 0.5) sfx.clink(); else { ripple(pond.x, pond.z, 0.5); sfx.gulp(); } }
  if (t === G) { if (G.mode === 'frozen') jiggle(); else if (freeNow() && !B.hop) run(async tok => { gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); }); }
}
function jiggle() { G.jv += 7 * (Math.random() < 0.5 ? -1 : 1); G.t -= T.FROZEN.TAP; say('brr'); sfx.clink(); frost(v3.set(s.pos.x, s.y + 1.2, s.pos.z), 5, 0.4); }   // 언 고고를 누르면 덜컹 — 얼음이 조금씩 빨리 녹는다
function tapBench(x, z) {
  x = clamp(x, -T.BENCH.X, T.BENCH.X); z = clamp(z, T.BENCH.Z0, T.BENCH.Z1); B.idle = 0;
  if (G.mode === 'frozen') { jiggle(); return; } if (G.mode === 'fire' || G.mode === 'slip') return;         // 불붙어 뛰는 중 · 미끄러지는 중에는 제 발로 못 간다(도구는 언제든 통한다)
  if (G.mode === 'soak') G.mode = 'free';
  for (const t of [ic, corn]) { const d = Math.hypot(x - t.x, z - t.z), need = t.r + 0.34; if (!t.gone && d < need) z = Math.min(T.BENCH.Z1, t.z + need); }      // 물건 속을 누르면 그 앞으로
  run(async tok => { await landed(tok); gogo.lookAt(v3.set(x, 0, z)); gogo.goTo(x, z); await until(tok, () => !s.target, 12); });
}
canvas.addEventListener('pointerdown', e => {
  P.down = true; P.x = e.clientX; P.y = e.clientY; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} unlock();
  const w = toolAt(e.clientX, e.clientY); if (w) { grab(w); return; }
  const t = pick(e.clientX, e.clientY); if (t) touch(t);
  if (t && t !== pond) { P.mode = null; return; }                                  // 물그릇은 이름도 듣고, 고고도 그리로 걸어간다(얼음판이면 미끄러진다)
  P.mode = 'walk'; if (stage.worldOn(benchPlane, e.clientX, e.clientY, v3)) tapBench(v3.x, v3.z);
});
canvas.addEventListener('pointermove', e => {
  P.x = e.clientX; P.y = e.clientY;
  if (P.down && P.mode === 'walk' && G.mode === 'free' && s.target && stage.worldOn(benchPlane, e.clientX, e.clientY, v3)) gogo.goTo(clamp(v3.x, -T.BENCH.X, T.BENCH.X), clamp(v3.z, T.BENCH.Z0, T.BENCH.Z1));
});
const up = () => { if (!P.down) return; P.down = false; if (P.mode === 'tool') letGo(); P.mode = null; };
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
sndEl.classList.toggle('off', isMuted()); sndEl.addEventListener('click', () => { setMuted(!isMuted()); sndEl.classList.toggle('off', isMuted()); });
document.getElementById('again').addEventListener('click', () => voice.again());

// ───────────────────────── 매 장면 ─────────────────────────
let clock = 0;
const R = { m: 0, snow: 0, sun: stage.sun.color.clone(), wall: wall.material.color.clone(), hemi: hemi.color.clone(), cSun: new THREE.Color('#a9cdff'), cWall: new THREE.Color('#9fb2ea'), hSun: new THREE.Color('#ffb877'), hWall: new THREE.Color('#d9a3c4') };
function stepTool(w, dt) {
  const isHeld = w.state === 'held';
  if (isHeld) {
    if (stage.worldOn(toolPlane, P.x, P.y, v3)) w.to.set(clamp(v3.x + T.TOOL.TIP[0], -3.75, 3.75), clamp(v3.y + T.TOOL.TIP[1], T.TOOL.MIN_Y, T.TOOL.MAX_Y), T.TOOL.Z);
    // 무엇 위에 떠 있나(화면에서 가로로 겹치는 것) — 그 머리 위로 떠올라, 대상을 가리지 않고 내려다보며 쏟는다
    const sx = stage.screenOf(w.pos).x; let best = null, bd = 1;
    for (const t of targets) { if (t.gone) continue; const c = stage.screenOf(centerOf(t, v3)), e = stage.screenOf(v3.set(t.x + t.r, t.y + t.h * 0.5, t.z)), d = Math.abs(sx - c.x) / (Math.abs(e.x - c.x) + T.TOOL.PAD) * (t === G ? 0.7 : 1) / (t === w.over ? 1.2 : 1); if (d < bd) { bd = d; best = t; } }
    if (best !== w.over) { w.over = best; w.dwell = 0; }
    if (best) { w.to.y = Math.max(w.to.y, topY(best) + hoverOf(best)); w.dwell += dt; }
    const can = best && w.dwell >= T.TOOL.DWELL && w.pos.y < topY(best) + hoverOf(best) + T.TOOL.REACH ? best : null;
    if (can !== w.on) { stopApply(w); if (can) startApply(w, can); }
    if (w.on) apply(w, w.on, dt);
    const a = stage.screenOf(w.pos), b = stage.screenOf(w.other.pos), d = Math.hypot(a.x - b.x, a.y - b.y);
    if (P.armed && d < T.TOOL.CLASH_PX && w.other.state === 'rest') { P.armed = false; clash(w); } else if (d > T.TOOL.CLASH_PX * 2.2) P.armed = true;
  } else if (w.state === 'back' && (w.back -= dt) <= 0) { w.to.copy(w.rest); if (w.pos.distanceTo(w.rest) < 0.03) w.state = 'rest'; }
  const kw = 1 - Math.exp(-(isHeld ? T.TOOL.FOLLOW : 7) * dt), dx = (w.to.x - w.pos.x) * kw; w.pos.lerp(w.to, kw);
  w.kv += (-90 * w.kick - 7 * w.kv) * dt; w.kick += w.kv * dt; w.tilt += (-dx * 4 - w.tilt) * Math.min(1, 12 * dt); w.puff += (1 - w.puff) * Math.min(1, 5 * dt);
  // 꽂혀 있을 때: 둥실거리고, 가끔 까딱 뛰어 「나를 집어 봐」 한다
  let bob = 0; if (w.state === 'rest') { bob = Math.sin(clock * 2.2 + w.dir) * 0.03; if ((w.hop -= dt) <= 0) { w.hop = rand(3.5, 5.5); w.kv += 5 * w.dir; w.puff = 1.35; if (w.dir < 0) frost(w.pos, 4, 0.2); else embers(w.pos, 5, 0.12); } }
  w.obj.position.set(w.pos.x, w.pos.y + bob + Math.abs(w.kick) * 0.25, w.pos.z); w.obj.rotation.z = w.tilt + w.kick * 0.25;
  const on = w.on ? 1 : 0, pu = w.puff * (1 + on * 0.25);
  if (w.dir < 0) { w.head.rotation.z = clock * (on ? 5 : 0.7); w.head.scale.setScalar(pu * (1 + 0.04 * Math.sin(clock * 5))); w.head.material.emissiveIntensity = 0.4 + on * 0.5 + 0.12 * Math.sin(clock * 3);
    if (Math.random() < dt * (isHeld ? 14 : 5)) mist(v3.set(w.pos.x, w.pos.y - 0.1, w.pos.z), 1, 0.14); if (Math.random() < dt * 4) fx.spark(w.pos, COL.cold, 1, 0.25, 0.3); }
  else { const f = 0.1 * Math.sin(clock * 11) + 0.06 * Math.sin(clock * 17.3 + 1); w.head.scale.set(pu * (1 - f * 0.5), pu * (1 + f + on * 0.15), pu * (1 - f * 0.5)); w.head.rotation.z = 0.09 * Math.sin(clock * 5.3) - w.tilt * 1.5 - w.kick * 0.3; w.head.position.y = (pu * (1 + f) - 1) * 0.15;
    if (Math.random() < dt * (isHeld ? 12 : 4)) embers(v3.set(w.pos.x, w.pos.y + 0.25, w.pos.z), 1, 0.07); }
  w.light.intensity += ((isHeld ? 7 + on * 6 : 2.2) * (w.dir > 0 ? 1 + 0.15 * Math.sin(clock * 13) : 1) - w.light.intensity) * Math.min(1, 6 * dt);
}
function stepPond(dt) {
  const p = pond, R0 = T.POND.R; wob(p, dt);
  if (!applied(p) && p.temp > T.POND.SIMMER) p.temp = Math.max(T.POND.SIMMER, p.temp - T.POND.COOL * dt);
  p.k += (clamp((-p.temp - 0.1) / 0.5, 0, 1) - p.k) * Math.min(1, 6 * dt); p.frozen = p.k > 0.85; iceU.value = p.k; ice.visible = p.k > 0.01; crossing(p);
  const hot = clamp((p.temp - 0.1) / 0.5, 0, 1), boil = clamp((p.temp - T.POND.TOO_HOT) / 0.3, 0, 1);
  water.material.color.copy(waterCold).lerp(waterHot, hot); water.position.y = T.POND.WATER_Y + Math.sin(clock * 2) * 0.003 + p.tx * 0.01;
  const spot = () => { const a = Math.random() * 7, r = Math.sqrt(Math.random()) * (R0 - 0.12); return v3.set(p.x + Math.cos(a) * r, T.POND.WATER_Y + 0.02, p.z + Math.sin(a) * r); };
  if (boil > 0) {                                                                    // 보글보글: 방울이 올라와 터지고 김이 오른다
    for (const b of bubbles) if (b.t <= 0 && Math.random() < dt * boil * 5) { b.t = b.dur = rand(0.25, 0.5); b.s = rand(0.6, 1.5); b.m.position.copy(spot()); b.m.visible = true; }
    if (Math.random() < dt * boil * 16) steam(spot(), 1, 0.05, 0.75); if (Math.random() < dt * boil * 7) tone(rand(150, 300), 90, 0.07, { g: 0.045 });
  } else if (hot > 0.3 && Math.random() < dt * hot * 4) steam(spot(), 1, 0.05, 0.5, 0.7);
  for (const b of bubbles) if (b.t > 0) { b.t -= dt; const k = 1 - b.t / b.dur; b.m.scale.setScalar(b.s * Math.sin(k * Math.PI / 2)); if (b.t <= 0) { b.m.visible = false; puffs.emit(b.m.position, COL.steam, 1, 0.02, { v: [0, 0.6, 0], size: 0.1, grow: 0.3, a: 0.6, life: [0.3, 0.5] }); } }
  if (p.k > 0.05 && p.k < 0.98 && Math.random() < dt * 14) { const a = Math.random() * 7, r = R0 * (1 - p.k * 0.95); fx.spark(v3.set(p.x + Math.cos(a) * r, 0.1, p.z + Math.sin(a) * r), COL.cold, 1, 0.03, 0.4); }   // 얼어 들어가는 끝이 반짝인다
  if (p.frozen && Math.random() < dt * 1.5) mist(spot(), 1, 0.1);
  for (const r of rings) { if (r.t >= 1) { r.m.visible = false; continue; } r.t += dt / 0.7; r.m.visible = true; r.m.scale.setScalar(r.size * (0.25 + 0.75 * r.t)); r.m.material.opacity = (1 - r.t) * 0.75; }
}
/** 내버려 두면 천천히 제 온도로. */
function settle(t, dt) { if (applied(t)) { t.idle = 0; return; } if ((t.idle += dt) > T.SETTLE_AFTER) t.temp -= Math.sign(t.temp) * Math.min(Math.abs(t.temp), T.SETTLE * dt); }
function stepIce(dt) {
  const c = ic, sc = part.scoop; settle(c, dt); wob(c, dt); const was = c.m; c.m += (clamp((c.temp - 0.15) / 0.45, 0, 1) - c.m) * Math.min(1, 3.5 * dt);
  if (c.m < 0.15) c.licked = false; c.pud += ((c.licked ? 0 : c.m) - c.pud) * Math.min(1, (c.licked ? 1.6 : 3) * dt);
  const cold = clamp(-c.temp, 0, 1), m = c.m, drip = m > 0.05 && m < 0.97 ? Math.sin(clock * 9) * 0.03 : 0;
  sc.scale.set(1 + 0.3 * m + 0.05 * cold, (1 - 0.6 * m) * (1 + 0.1 * cold) + drip, 1 + 0.3 * m + 0.05 * cold); sc.position.y = 0.5 - 0.27 * m;      // 녹으면 과자 위로 흘러내려 덮는다 sc.rotation.z = c.tx * 0.2;
  c.grp.rotation.z = c.tx * 0.08; part.puddle.visible = c.pud > 0.02; part.puddle.scale.set(0.25 + 0.75 * c.pud, c.pud, 0.25 + 0.75 * c.pud);
  if (m > was + 0.0005 && Math.random() < dt * 16) drops(v3.set(c.x + rand(-0.2, 0.2), 0.5, c.z + 0.15), 1, 0.2, COL.pink);
  if (cold > 0.5 && Math.random() < dt * 3) fx.spark(v3.set(c.x, 0.75, c.z), COL.cold, 1, 0.22, 0.3);
  tintBy(c.mats, c.temp); crossing(c);
}
function stepCorn(dt) {
  const c = corn; wob(c, dt);
  if (c.state === 'home') { settle(c, dt); const q = clamp((c.temp - 0.2) / 0.4, 0, 1); if (q > 0 && Math.random() < dt * q * 16) { c.tv += rand(-1, 1) * 7 * q; tone(rand(500, 900), 300, 0.03, { g: 0.03 * q }); } tintBy(c.mats, c.temp); crossing(c); }      // 달아오르면 달달 떤다
  else if (!pieces.some(p => p.state !== 'off') && (c.t -= dt) <= 0) { c.state = 'home'; c.gone = false; c.temp = 0; c.hot = false; c.idle = 0; c.sv = 4; sfx.pop(); fx.spark(v3.set(c.x, 0.4, c.z), '#ffe9a8', 14, 0.25, 1.3); tintBy(c.mats, 0); }   // 팝콘이 다 사라지면 새 옥수수가 뿅
  c.sv += (120 * ((c.state === 'home' ? 1 : 0) - c.s) - 11 * c.sv) * dt; c.s = Math.max(0, c.s + c.sv * dt); c.grp.visible = c.s > 0.02; c.grp.scale.setScalar(Math.max(0.02, c.s)); c.grp.rotation.z = c.tx * 0.14;
  for (const p of pieces) {
    if (p.state === 'off') continue;
    if (p.state === 'wait') { if ((p.t -= dt) > 0) continue; p.state = 'fly'; p.x = c.x; p.y = 0.45; p.z = c.z; p.vx = rand(-3.3, 0.7); p.vy = rand(3.6, 6.4); p.vz = rand(-0.3, 1.5); p.s = 1; p.m.visible = true; tone(rand(600, 1100), 280, 0.05, { type: 'triangle', g: 0.1 }); fx.spark(v3.set(c.x, 0.5, c.z), '#fff6e2', 2, 0.15, 1.5); }
    if (p.state === 'fly') { const fl = Math.hypot(p.x - pond.x, p.z - pond.z) < T.POND.R ? 0.14 : 0.07; p.vy -= 14 * dt; p.x = clamp(p.x + p.vx * dt, -3.5, 3.5); p.y += p.vy * dt; p.z = clamp(p.z + p.vz * dt, -1.1, 1.15); p.rx += p.vz * 6 * dt; p.rz -= p.vx * 6 * dt;
      if (p.y < fl) { p.y = fl; if (p.vy < -1.6) { p.vy *= -0.42; p.vx *= 0.6; p.vz *= 0.6; sfx.tick(); } else { p.state = 'rest'; p.t = T.POP_STAY + rand(0, 1.5); } } }
    else if (p.state === 'rest') { if ((p.t -= dt) <= 0) p.s -= dt * 3; if (p.s <= 0) p.state = 'off'; }
    else if (p.state === 'eaten') { p.t += dt; const k = Math.min(1, p.t / 0.22); p.x += (s.pos.x + Math.sin(s.heading) * 0.3 - p.x) * k; p.y += (s.y + 0.55 - p.y) * k; p.z += (s.pos.z + Math.cos(s.heading) * 0.3 - p.z) * k; p.s = 1 - k; if (k >= 1) p.state = 'off'; }
    p.m.visible = p.state !== 'off'; p.m.position.set(p.x, p.y, p.z); p.m.rotation.set(p.rx, 0, p.rz); p.m.scale.setScalar(Math.max(0.01, p.s));
  }
}
function stepGogo(dt) {
  const on = applied(G), dx = s.pos.x - pond.x, dz = s.pos.z - pond.z, dP = Math.hypot(dx, dz) || 0.001, inPond = dP < T.POND.R - 0.06, onBench = B.where === 'bench' && !B.hop;
  wob(G, dt); G.ouch -= dt;
  if (G.mode === 'frozen') {
    s.target = null; s.busy = true; gogo.setMood('fluster', 0.3); gogo.lookAt(v3.set(s.pos.x + Math.cos(clock * 3.4) * 1.5, s.y + 0.8 + Math.sin(clock * 3.4) * 0.9, s.pos.z + 2.2));   // 눈만 굴린다
    if (!on && (G.t -= dt) <= 0) thaw(); else if (on && G.t < 1) G.t = 1;
  } else if (G.mode === 'slip') slipStep(dt, inPond);
  else if (G.mode === 'soak') { s.pos.x += (pond.x - s.pos.x) * Math.min(1, 8 * dt); s.pos.z += (pond.z - s.pos.z) * Math.min(1, 8 * dt); if (Math.random() < dt * 9) steam(v3.set(s.pos.x, 0.2, s.pos.z - 0.2), 1, 0.2, 0.7, 0.8);
    if ((G.t -= dt) <= 0) { G.mode = 'free'; gogo.pose('sway', 0); run(async tok => { await walk(tok, ...T.HOME); await face(tok, 0); }); } }
  else if (G.mode === 'fire') { if (Math.random() < dt * 30) embers(v3.set(s.pos.x - Math.sin(s.heading) * 0.36, s.y + 0.5, s.pos.z - Math.cos(s.heading) * 0.36), 1, 0.1); if (!B.tok && !B.hop) G.mode = 'free'; }
  else {
    if (!on) { let k = T.DRIFT; for (const w of tools) if (w.state === 'rest' && Math.sign(G.temp) === -w.dir && Math.hypot(s.pos.x - w.rest.x, s.pos.z - w.rest.z) < 1.2) k += T.NEAR_TOOL; G.temp -= Math.sign(G.temp) * Math.min(Math.abs(G.temp), k * dt); }
    if (onBench) {
      if (pond.frozen && inPond && s.v > T.SLIP.MIN_V) slipStart();
      else if (pond.temp > T.POND.TOO_HOT && dP < T.POND.R + T.POND.KEEP) {                 // 끓는 물에는 들어가지 않는다: 가장자리를 돌아간다(안에 있었으면 얼른 나온다)
        const push = Math.min(T.POND.R + T.POND.KEEP - dP, 3.5 * dt); s.pos.x += dx / dP * push; s.pos.z = clamp(s.pos.z + dz / dP * push, T.BENCH.Z0, T.BENCH.Z1);
        if (s.target) { if (Math.hypot(s.target.x - pond.x, s.target.z - pond.z) < T.POND.R + T.POND.KEEP) s.target = null; else { const sd = Math.sign(-dz * (s.target.x - s.pos.x) + dx * (s.target.z - s.pos.z)) || 1; s.pos.x += -dz / dP * sd * 1.1 * dt; s.pos.z = clamp(s.pos.z + dx / dP * sd * 1.1 * dt, T.BENCH.Z0, T.BENCH.Z1); } }
        if (G.ouch <= 0 && (s.moving || inPond)) { G.ouch = 1.6; say('hot'); gogo.setMood('hot', 0.8); }
      }
      for (const t of [ic, corn]) { if (t.gone) continue; const ex = s.pos.x - t.x, ez = s.pos.z - t.z, d = Math.hypot(ex, ez) || 0.001, need = 0.3 + t.r * 0.85; if (d < need) { s.pos.x += ex / d * (need - d); s.pos.z = clamp(s.pos.z + ez / d * (need - d), T.BENCH.Z0, T.BENCH.Z1); } }
    }
  }
  if (onBench) s.y += ((dP < T.POND.R && pond.k > 0.5 ? T.POND.ICE_Y : 0) - s.y) * Math.min(1, 14 * dt);
  if (G.mode === 'free' || G.mode === 'frozen') crossing(G);
  const kc = clamp(-G.temp, 0, 1), kh = clamp(G.temp, 0, 1), shiver = kc > 0.2 && G.mode === 'free';
  if (kc > 0.02) gogo.tint('#2f9bff', kc * 0.55); else if (kh > 0.02) gogo.tint('#ff3a20', kh * 0.6); else gogo.tint('#ffffff', 0);
  gogo.pose('hands', shiver ? Math.min(1, kc * 1.3) : 0); gogo.pose('fluster', G.mode === 'slip' && !G.fell ? 1 : G.mode === 'free' && kh > T.AT && on ? 0.8 : 0);
  if (shiver) { if (kc > 0.45 && !B.tok) gogo.setMood('fluster', 0.3); if ((G.brr -= dt) <= 0) { G.brr = 1.1; say('brr'); mist(v3.set(s.pos.x + Math.sin(s.heading) * 0.35, s.y + 0.62, s.pos.z + Math.cos(s.heading) * 0.35), 2, 0.05); } }
  if (kh > 0.25 && G.mode === 'free') { if (kh > 0.45 && !B.tok) gogo.setMood('hot', 0.3); if (Math.random() < dt * kh * 12) puffs.emit(v3.set(s.pos.x + rand(-0.3, 0.3), s.y + 0.95, s.pos.z + 0.2), COL.drop, 1, 0.04, { v: [rand(-0.5, 0.5), 0.6, 0.2], size: 0.07, a: 0.95, g: 5, life: [0.4, 0.7] }); }   // 땀
  if (G.fallT >= 0) { const was = G.fallT; G.fallT += dt; if (was < 0.5 && G.fallT >= 0.5) { gogo.setMood('dizzy', 1.6); sfx.thud(1.3); stage.shake(T.SHAKE * 1.2); if (inPond) frost(v3.set(s.pos.x, 0.15, s.pos.z), 12, 0.4); } if (G.fallT > 2.5) G.fallT = -1; }
  const h = held(); if (h && G.mode !== 'frozen' && !B.tok) gogo.lookAt(h.pos);        // 든 도구를 눈으로 따라간다
}
/** 고고를 다 움직인 뒤에 얹는 것: 덜덜 떨림 · 푸르르 털기 · 얼음 덩어리 · 엉덩이 불. */
function postGogo(dt) {
  const r = gogo.root, kc = clamp(-G.temp, 0, 1);
  if (kc > 0.2 && G.mode === 'free') r.position.x += Math.sin(clock * 62) * 0.024 * kc;
  if (G.shakeT > 0) { G.shakeT -= dt; r.rotation.y += Math.sin(clock * 40) * 0.55 * Math.min(1, G.shakeT * 2); if (Math.random() < dt * 40) drops(v3.set(s.pos.x, s.y + 0.7, s.pos.z), 1, 1.6); }
  G.bv += (130 * ((G.mode === 'frozen' ? 1 : 0) - G.bk) - 12 * G.bv) * dt; G.bk = Math.max(0, G.bk + G.bv * dt); G.jv += (-90 * G.jig - 6 * G.jv) * dt; G.jig += G.jv * dt;
  block.visible = G.bk > 0.03; if (block.visible) { block.position.set(s.pos.x, s.y, s.pos.z); block.scale.set(G.bk, 0.6 + 0.4 * G.bk, G.bk); block.rotation.z = G.jig * 0.22; if (G.mode === 'frozen') { r.rotation.z = G.jig * 0.22; if (Math.random() < dt * 3) mist(v3.set(s.pos.x + rand(-0.5, 0.5), s.y + 1.2, s.pos.z + 0.4), 1, 0.1); } }
  if (G.mode !== 'frozen') r.rotation.z = 0;
  G.fireK += ((G.mode === 'fire' ? 1 : 0) - G.fireK) * Math.min(1, 10 * dt); butt.visible = G.fireK > 0.05;
  if (butt.visible) { const f = 0.12 * Math.sin(clock * 13) + 0.07 * Math.sin(clock * 19); butt.scale.set(1.5 * G.fireK * (1 - f * 0.5), 1.5 * G.fireK * (1 + f), 1.5 * G.fireK); butt.rotation.y = -s.heading; }   // 불꽃의 눈은 늘 아이 쪽을 본다
}
function stepRoom(dt) {
  const h = held(), to = h ? h.dir * (h.on ? 1 : 0.55) : 0; R.m += (to - R.m) * Math.min(1, 3 * dt); const a = Math.abs(R.m) * 0.75, c = R.m < 0;      // 방의 빛이 든 도구 쪽으로 물든다
  stage.sun.color.copy(R.sun).lerp(c ? R.cSun : R.hSun, a); wall.material.color.copy(R.wall).lerp(c ? R.cWall : R.hWall, a * 0.8); hemi.color.copy(R.hemi).lerp(c ? R.cSun : R.hSun, a * 0.5);
  if (R.snow > 0) { R.snow -= dt; for (let i = 0; i < 2; i++) if (Math.random() < dt * 34) puffs.emit(v3.set(rand(-3.8, 3.8), rand(2.9, 3.6), rand(-1.3, 1.4)), COL.steam, 1, 0, { v: [rand(-0.2, 0.2), -0.95, 0], vr: 0.12, size: rand(0.07, 0.13), a: 0.95, life: [3.2, 4] }); }
}
function step(dt) {
  clock += dt; brain.tick(dt);
  for (const w of tools) stepTool(w, dt);
  stepPond(dt); stepIce(dt); stepCorn(dt); stepGogo(dt); stepRoom(dt);
  // 심심하면 혼자 도구를 건드려 본다
  if (!B.tok && !held() && !s.moving && !s.act && G.mode === 'free' && Math.abs(G.temp) < 0.2) { const was = B.idle; B.idle += dt; for (const [at, w] of [[2, ICE], [3.8, null], [4.6, FIRE], [6.4, null]]) if (was < at && B.idle >= at) gogo.lookAt(w ? w.pos : camera.position);      // 먼저 두 도구를 번갈아 쳐다본다
    if (B.idle > T.IDLE_SHOW) run(show); } else if (held() || s.moving) B.idle = 0;
  gogo.update(dt); postGogo(dt); voice.tick(dt); fx.tick(dt); puffs.tick(dt);
}
// 발소리 — 물에서는 첨벙, 얼음 위에서는 딱
gogo.on('step', () => {
  const d = Math.hypot(s.pos.x - pond.x, s.pos.z - pond.z);
  if (d < T.POND.R && !pond.frozen && B.where === 'bench') { seen.add('wade'); ripple(s.pos.x, s.pos.z, 0.3); drops(v3.set(s.pos.x, 0.1, s.pos.z), 4, 1.3); hiss(0.1, { g: 0.07, f: 1400, q: 0.8 }); } else sfx.thud(0.9);
});

// ───────────────────────── 돌리기 ─────────────────────────
const f2 = x => +x.toFixed(2);
const summary = () => ({ gogo: { x: f2(s.pos.x), z: f2(s.pos.z), y: f2(s.y), mode: G.mode, temp: f2(G.temp), mood: s.mood, act: s.act ? s.act.name : '', where: B.where, busy: !!B.tok },
  pond: f2(pond.temp) + ' k' + f2(pond.k), icecream: f2(ic.temp) + ' m' + f2(ic.m) + ' p' + f2(ic.pud), corn: f2(corn.temp) + ' ' + corn.state + ' ' + pieces.filter(p => p.state !== 'off').length,
  tools: tools.map(w => w.kind + ':' + w.state + (w.on ? '>' + w.on.name : '')).join(' '), said: voice.said, seen: [...seen], learned: learn.log.length, errors: brain.errors });
/** 확인용: 손가락을 「그 대상 위에 도구가 오는 자리」로 옮긴다(진짜 손처럼 P 만 움직인다). */
function aim(name) {
  const w = P.tool; if (!w) return; let p;
  if (name === 'ice' || name === 'fire') p = v3b.copy((name === 'ice' ? ICE : FIRE).pos);
  else { const t = byName[name], c = stage.screenOf(centerOf(t, v3)); stage.worldOn(toolPlane, c.x, c.y, v3b); p = v3b.setY(T.TOOL.MIN_Y); }
  const q = stage.screenOf(v3.set(p.x - T.TOOL.TIP[0], p.y - T.TOOL.TIP[1], T.TOOL.Z)); P.x = q.x; P.y = q.y;
}
window.__icefire = { T, gogo, G, pond, ic, corn, pieces, tools, B, P, step, summary, grab, letGo, touch, tapBench, aim, stage, camera };
if (AUTO) runAuto(stage, { step, summary, commands: {
  hold: a => { const w = a === 'ice' ? ICE : FIRE, c = stage.screenOf(w.pos); P.x = c.x; P.y = c.y + 30; P.down = true; grab(w); },
  to: async (a, b, tick) => { for (let i = 0; i < (+b || 1) * 60; i++) { aim(a); await tick(); } },
  lift: async (a, b, tick) => { for (let i = 0; i < (+a || 0.5) * 60; i++) { P.y -= 6; await tick(); } },
  drop: () => { P.down = false; letGo(); P.mode = null; },
  tap: (a, b) => tapBench(+a, +b), touch: a => touch(byName[a]),
} }); else { stage.play(step); document.title = 'READY ' + document.title; }
