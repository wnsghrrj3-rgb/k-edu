/* 커졌다 작아졌다 (Big / Small) — 영어 놀이터 시험판 3단계 「놀이」.
 * 정본: KEDU ENGLISH PLAYGROUND 통합 설계서 §1 · §11 마법 연구소(거대 조림이 → 몬스터 고고) · §21 · §30 · 11부.
 * 하는 일은 하나: 마법 지팡이를 대고 위로 끌면 커지고 아래로 끌면 작아진다(고고 · 사과 · 컵 · 의자 · 공).
 * 정답 · 점수 · 시간제한 · 설명 글 없음. 영어는 크기가 문턱을 넘는 순간의 "Big!" / "Small!" 과, 만졌을 때 나오는 그것의 이름(Apple · Cup · Chair · Ball).
 * 배운 기록은 어디에도 남기지 않는다(서버 · 기기 모두). 고고와 물건은 블렌더로 직접 빚은 모형(tools/make_*.py).
 * 확인용 주소: ?mute 소리 끔 · ?auto=명령,…(lock:이름 · drag:크기 · release · step:초 · tap:x:z) → 끝나면 제목에 상태를 적는다. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createGogo, MOVE } from './gogo.js?v=3';

// ───────────────────────── 수치(준호가 만져 보고 바꾼다) ─────────────────────────
const T = {
  SIZE_MIN: 0.45, SIZE_MAX: 1.8,            // 크기 범위
  BIG_AT: 1.35, SMALL_AT: 0.7, REARM: 0.12,  // "Big!" · "Small!" 문턱 · 다시 말하려면 문턱에서 이만큼 돌아와야 한다
  WORD_GAP: 2.5, WORD_SHOW: 1.15,            // 같은 말을 되풀이하지 않는 시간(초) · 낱말이 떠 있는 시간
  NAME_GAP: 0.8, NAME_SHOW: 1.0,             // 만졌을 때 나오는 이름(Apple · Cup · Chair · Ball · Gogo): 되풀이하지 않는 시간 · 떠 있는 시간
  DRAG_FULL: 0.42,                           // 화면 높이의 이만큼 끌면 가장 작은 크기에서 가장 큰 크기까지 간다
  SPRING_K: 110, SPRING_C: 9, JELLY: 0.10,   // 물건 크기 용수철: 세기 · 잦아듦 · 출렁일 때 길쭉 · 납작해지는 정도(고고는 gogo.js MOVE.SIZE_*)
  RELEASE_KICK: 1.6,                         // 놓는 순간 한 번 더 출렁이게 미는 힘
  WOB_K: 80, WOB_C: 6,                       // 물건이 건드려져 까딱이는 용수철
  BENCH: { X: 3.35, Z0: -0.95, Z1: 1.0, EDGE: 3.7 },   // 고고가 다니는 범위 · 실험대 끝
  HOME: [0, 0.3],                            // 고고가 서 있는 자리
  PLACE: { chair: [-2.55, -0.45], apple: [-1.2, -0.35], cup: [1.15, -0.35], ball: [2.45, -0.15], jar: [3.28, 0.92] },
  WAND_Z: 1.05, WAND_TIP: [-0.3, 0.72],      // 든 지팡이가 떠 있는 깊이 · 손가락에서 별까지(가로, 세로)
  WAND_FOLLOW: 26, WAND_BACK: 0.45,          // 지팡이가 손을 따라오는 빠르기 · 놓은 뒤 꽂이로 돌아가기까지(초)
  PICK_PAD: 26, BREAK_PAD: 110,              // 대상에 닿았다고 보는 여유(픽셀) · 옆으로 이만큼 벗어나면 풀린다
  FULL_BIG: 1.68, FULL_SMALL: 0.52, DIZZY_SWEEP: 1.6,   // 다 컸다 · 다 작아졌다고 보는 크기 · 한쪽 끝을 떠나 이 시간(초) 안에 반대쪽 끝에 닿으면 어지럽다
  IDLE_POKE: 10,                             // 가만두면 혼자 물건을 건드려 보기까지(초)
  CUP_STAY: 9, PERCH_STAY: 6, CUP_UP: 5,     // 컵 안에 · 사과 위에 머무는 시간 · 쓰러진 컵이 일어나기까지
  SHAKE: 0.05, GRAVITY: 14,
  CAM: { AIM: [0, 1.15, 0], TILT: 17, FOV: 30, HALF_W: 4.05, MIN_DIST: 8.4 },
};
const Q = new URLSearchParams(location.search); let MUTE = Q.has('mute') || Q.has('auto');
const clamp = (x, a, b) => Math.min(b, Math.max(a, x)), D = Math.PI / 180, rand = (a, b) => a + Math.random() * (b - a);

// ───────────────────────── 소리 ─────────────────────────
// 낱말 소리는 지금은 기기 음성(임시)이다 — 녹음한 목소리로 바꿀 자리. 효과음 · 고고 목소리는 그때그때 만들어 낸다(파일 없음).
let AC = null; const ac = () => MUTE ? null : (AC = AC || new (window.AudioContext || window.webkitAudioContext)());
function tone(f, f2, t, { type = 'sine', g = 0.16, at = 0 } = {}) {
  const a = ac(); if (!a) return; const o = a.createOscillator(), v = a.createGain(), n = a.currentTime + at;
  o.type = type; o.frequency.setValueAtTime(Math.max(20, f), n); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), n + t);
  v.gain.setValueAtTime(0.0001, n); v.gain.exponentialRampToValueAtTime(g, n + 0.014); v.gain.exponentialRampToValueAtTime(0.0001, n + t); o.connect(v).connect(a.destination); o.start(n); o.stop(n + t + 0.03);
}
const sfx = {
  thud: s => tone(95 / Math.sqrt(s), 38, 0.2, { g: 0.5 * clamp(s / 1.8, 0.15, 1) }), tick: () => tone(1500, 1100, 0.03, { g: 0.04 }), ping: s => tone(760 / s ** 0.8, 800 / s ** 0.8, 0.09, { g: 0.05 }),
  pop: () => tone(620, 300, 0.14, { type: 'triangle' }), clink: () => { tone(1900, 1500, 0.12, { type: 'triangle', g: 0.12 }); tone(2500, 2100, 0.09, { type: 'triangle', g: 0.07, at: 0.05 }); },
  bounce: v => tone(230, 110, 0.13, { g: 0.22 * clamp(v, 0.1, 1) }), spark: up => { for (let i = 0; i < 4; i++) tone((up ? 520 : 1300) * (up ? 1.26 : 0.8) ** i, (up ? 560 : 1250) * (up ? 1.26 : 0.8) ** i, 0.12, { type: 'triangle', g: 0.09, at: i * 0.06 }); },
};
/** 고고의 목소리(말이 아닌 소리). 몸이 크면 낮고 작으면 높다. */
function voice(kind) {
  const k = gogo.state.size ** -0.9, o = { type: 'triangle', g: 0.13 };
  if (kind === 'wow') tone(430 * k, 880 * k, 0.24, o); else if (kind === 'hm') tone(390 * k, 520 * k, 0.16, o);
  else if (kind === 'joy') { tone(560 * k, 760 * k, 0.11, o); tone(700 * k, 980 * k, 0.14, { ...o, at: 0.13 }); }
  else if (kind === 'oops') tone(700 * k, 260 * k, 0.3, o);
  else if (kind === 'dizzy') for (let i = 0; i < 4; i++) tone((640 - i * 70) * k, (520 - i * 70) * k, 0.2, { ...o, at: i * 0.21 });
  else if (kind === 'big') { tone(200 * k, 150 * k, 0.3, o); tone(170 * k, 120 * k, 0.34, { ...o, at: 0.3 }); }
  else if (kind === 'small') for (let i = 0; i < 3; i++) tone(820 * k, 1150 * k, 0.07, { ...o, at: i * 0.09 });
}
const saidAt = {}, said = [], NAME = { apple: 'Apple', cup: 'Cup', chair: 'Chair', ball: 'Ball', gogo: 'Gogo' };
/** 기기 음성(임시 — 녹음한 목소리로 바꿀 자리). 말하는 중이면 끊지 않고 바로 뒤에 한 마디만 줄 세운다("Apple" 다음에 "Big"). */
const talk = { busy: false, next: null, since: 0 };
function speak(text, pitch = 1.15, rate = 0.95) {
  if (MUTE || !('speechSynthesis' in window)) return;
  if (talk.busy && performance.now() - talk.since < 3000) { talk.next = [text, pitch, rate]; return; }
  const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.pitch = pitch; u.rate = rate; talk.busy = true; talk.since = performance.now();
  u.onend = u.onerror = () => { talk.busy = false; if (talk.next) { const n = talk.next; talk.next = null; speak(...n); } };
  speechSynthesis.speak(u);
}
/** 영어 한마디: 낱말이 대상 위에 뜨고 소리가 난다. 같은 말은 한동안 되풀이하지 않는다(Big! · Small! 은 T.WORD_GAP, 이름은 T.NAME_GAP). */
function word(t, w) {
  const name = !w.endsWith('!'); if (clock - (saidAt[w] ?? -99) < (name ? T.NAME_GAP : T.WORD_GAP)) return; saidAt[w] = clock; said.push(w + '@' + t.name);
  wordEl.textContent = w; wordEl.className = 'on ' + (w === 'Big!' ? 'big' : w === 'Small!' ? 'small' : 'name'); wordOf = t; wordT = name ? T.NAME_SHOW : T.WORD_SHOW;
  const gs = gogo.state.size, mine = t === GOGO && !name;                         // 고고가 커지고 작아질 때의 한마디는 고고 목소리(클수록 낮게)
  speak(w.replace('!', ''), mine ? clamp(1.25 - (gs - 1) * 0.9, 0.3, 2) : 1.15, mine && gs > 1.2 ? 0.8 : 0.95);
}

// ───────────────────────── 무대 ─────────────────────────
const canvas = document.getElementById('c'), wordEl = document.getElementById('word'), sndEl = document.getElementById('snd');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: Q.has('auto') });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.98;
const scene = new THREE.Scene();
{ const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#e6dcf6'); gr.addColorStop(0.55, '#d6cbee'); gr.addColorStop(1, '#b9a8dc'); x.fillStyle = gr; x.fillRect(0, 0, 4, 256);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; scene.background = tx; }
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
scene.add(new THREE.HemisphereLight('#fff6ec', '#b9a2d6', 0.85));
const sun = new THREE.DirectionalLight('#fff1d6', 2.5); sun.position.set(-3.2, 7.5, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -5.5, right: 5.5, top: 5, bottom: -4, near: 1, far: 22 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4; scene.add(sun);
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshStandardMaterial({ color: '#b9a7e0', roughness: 1 })); wall.position.set(0, 3, -1.76); wall.receiveShadow = true; scene.add(wall);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 12).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#a996cf', roughness: 1 })); ground.position.set(0, -2.5, 2); ground.receiveShadow = true; scene.add(ground);
const camera = new THREE.PerspectiveCamera(T.CAM.FOV, 1, 0.1, 80), camBase = new THREE.Vector3();
function resize() {
  renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight;
  const dist = Math.max(T.CAM.MIN_DIST, T.CAM.HALF_W / (Math.tan(T.CAM.FOV * D / 2) * camera.aspect)), a = T.CAM.TILT * D;       // 실험대가 가로로 다 들어오게 물러난다
  camBase.set(T.CAM.AIM[0], T.CAM.AIM[1] + Math.sin(a) * dist, T.CAM.AIM[2] + Math.cos(a) * dist); camera.position.copy(camBase); camera.lookAt(...T.CAM.AIM); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  if (Q.has('auto') && ready) renderer.render(scene, camera);
}
let ready = false; addEventListener('resize', resize); resize();

const lab = await new GLTFLoader().loadAsync(new URL('./assets/lab.glb?v=1', import.meta.url).href), part = {};
lab.scene.traverse(o => { if (o.isMesh) { part[o.name] = o; o.castShadow = o.name !== 'room'; o.receiveShadow = true; } });
scene.add(part.room);
const gogo = await createGogo(scene);
gogo.root.traverse(o => { if (o.isMesh) o.receiveShadow = !o.name.startsWith('GogoEyes'); });
gogo.place(T.HOME[0], T.HOME[1], 0); gogo.lookAt(camera.position);

// 물건 넷: 크기 용수철 · 까딱임 · (공) 구르기 · (컵) 쓰러지기
const R0 = { apple: [0.32, 0.6], cup: [0.385, 0.62], chair: [0.36, 0.95], ball: [0.27, 0.54] }, things = {};
for (const name of ['chair', 'apple', 'cup', 'ball']) {
  const obj = new THREE.Group(), m = part[name]; m.material = m.material.clone(); m.material.emissive = new THREE.Color('#ffe9a8'); m.material.emissiveIntensity = 0; obj.add(m); scene.add(obj);
  const [x, z] = T.PLACE[name]; things[name] = { name, obj, mesh: m, x, z, home: { x, z }, r: R0[name][0], h: R0[name][1], size: 1, to: 1, v: 0, y: 0, vy: 0, tx: 0, tz: 0, tvx: 0, tvz: 0, vx: 0, roll: 0, lean: 0, state: name === 'cup' ? 'up' : 'home', t: 0, big: false, small: false };
}
const GOGO = { name: 'gogo', r: 0.36, h: 1.05, big: false, small: false, get size() { return gogo.state.size; }, get to() { return gogo.state.sizeTo; }, set to(v) { gogo.setSize(v); }, get x() { return gogo.state.pos.x; }, get z() { return gogo.state.pos.z; }, get y() { return gogo.state.y; } };
const targets = [GOGO, ...Object.values(things)];
const jar = part.jar; jar.position.set(T.PLACE.jar[0], 0, T.PLACE.jar[1]); scene.add(jar);
const wandRest = new THREE.Vector3(T.PLACE.jar[0] - 0.05, 0.9, T.PLACE.jar[1]);
const W = { obj: part.wand, state: 'rest', pos: wandRest.clone(), to: wandRest.clone(), lock: null, anchorY: 0, s0: 1, back: 0, tilt: 0.12, lastPing: 1 };
W.obj.material = W.obj.material.clone(); W.obj.material.emissive = new THREE.Color('#ffd766'); W.obj.material.emissiveIntensity = 0.25; scene.add(W.obj);

// 반짝이
const NP = 240, pPos = new Float32Array(NP * 3), pCol = new Float32Array(NP * 3), pp = Array.from({ length: NP }, () => ({ life: 0, max: 1, v: new THREE.Vector3(), c: new THREE.Color() })); let pNext = 0;
const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
{ const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#fff'); gr.addColorStop(0.35, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.2, map: new THREE.CanvasTexture(c), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); pts.frustumCulled = false; scene.add(pts); }
function spark(p, color, n = 1, spread = 0.2, speed = 1) {
  for (let i = 0; i < n; i++) { const q = pp[pNext], j = pNext * 3; pNext = (pNext + 1) % NP; q.life = q.max = rand(0.4, 0.9); q.c.set(color);
    pPos[j] = p.x + rand(-spread, spread); pPos[j + 1] = p.y + rand(-spread, spread); pPos[j + 2] = p.z + rand(-spread, spread); q.v.set(rand(-1, 1), rand(0.2, 1.4), rand(-1, 1)).multiplyScalar(speed); }
}

// ───────────────────────── 손(지팡이) ─────────────────────────
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), benchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), wandPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -T.WAND_Z);
const P = { down: false, x: 0, y: 0, mode: null };
const centerOf = (t, out) => out.set(t.x, t.y + (t.name === 'ball' ? t.r : t.h * 0.5) * t.size, t.z);
const topOf = (t, out) => out.set(t.x, t.y + (t.name === 'ball' ? t.r * 2 : t.h) * t.size, t.z);
function screenOf(p) { v3b.copy(p).project(camera); return { x: (v3b.x + 1) / 2 * innerWidth, y: (1 - v3b.y) / 2 * innerHeight }; }
function pxRadius(t) { const c = screenOf(centerOf(t, v3)), e = screenOf(v3.set(t.x + Math.max(t.r, t.h * 0.5) * t.size, t.y + t.h * 0.5 * t.size, t.z)); return Math.abs(e.x - c.x) + T.PICK_PAD; }
function pickAt(x, y) { let best = null, bd = 1e9; for (const t of targets) { if (t.state === 'gone') continue; const c = screenOf(centerOf(t, v3)), d = Math.hypot(c.x - x, c.y - y) / pxRadius(t); if (d < 1 && d < bd) { bd = d; best = t; } } return best; }
function worldOn(plane, x, y, out) { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(plane, out); }
function setTo(t, s) { s = clamp(s, T.SIZE_MIN, T.SIZE_MAX); if (Math.abs(Math.log(s / W.lastPing)) > 0.07) { W.lastPing = s; sfx.ping(s); } t.to = s; }
function lockOn(t, y) { W.lock = t; W.anchorY = y; W.s0 = t.to; W.lastPing = t.to; B.idle = 0; sfx.tick(); word(t, NAME[t.name]); if (t === GOGO) { B.lastTo = t.to; B.dir = 0; stopScript(); gogo.stop(); gogo.state.busy = true; } }
function dragBy(y) {
  const t = W.lock, span = Math.log(T.SIZE_MAX / T.SIZE_MIN), raw = Math.log(W.s0) + (W.anchorY - y) / (innerHeight * T.DRAG_FULL) * span, ls = clamp(raw, Math.log(T.SIZE_MIN), Math.log(T.SIZE_MAX));
  if (ls !== raw) { W.anchorY = y; W.s0 = Math.exp(ls); }                         // 끝에 닿은 채 더 끌면 그 자리에서 다시 잰다(돌아서면 바로 반응)
  setTo(t, Math.exp(ls));
}
function release() {
  const t = W.lock; if (!t) return; W.lock = null; sfx.pop();
  if (t === GOGO) { gogo.state.sizeV += Math.sign(t.to - 1 || 1) * T.RELEASE_KICK * 0.5; run(afterSelf); } else { t.v += Math.sign(t.to - 1 || 1) * T.RELEASE_KICK; run(tok => afterThing(tok, t)); }
}
function tapBench(x, z) {
  x = clamp(x, -T.BENCH.X, T.BENCH.X); z = clamp(z, T.BENCH.Z0, T.BENCH.Z1); B.idle = 0;
  for (const t of Object.values(things)) { const d = Math.hypot(x - t.x, z - t.z), need = t.r * t.size + 0.3 * gogo.state.size; if (d < need) z = Math.min(T.BENCH.Z1, t.z + need); }    // 물건 속을 누르면 그 앞으로
  run(async tok => { await toBench(tok); gogo.lookAt(v3.set(x, 0, z)); gogo.goTo(x, z); await until(tok, () => !gogo.state.target, 12); });
}
canvas.addEventListener('pointerdown', e => {
  P.down = true; P.x = e.clientX; P.y = e.clientY; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} ac();
  const tip = screenOf(W.pos), t = pickAt(e.clientX, e.clientY);
  if (W.state !== 'held' && Math.hypot(tip.x - e.clientX, tip.y - e.clientY + 40) < 70) { W.state = 'held'; P.mode = 'wand'; sfx.tick(); B.idle = 0; }       // 지팡이를 집는다
  else if (t) { W.state = 'held'; P.mode = 'wand'; lockOn(t, e.clientY); }                                                                                   // 대상을 바로 누르면 지팡이가 날아온다
  else { P.mode = 'walk'; if (worldOn(benchPlane, e.clientX, e.clientY, v3)) tapBench(v3.x, v3.z); }
});
canvas.addEventListener('pointermove', e => {
  P.x = e.clientX; P.y = e.clientY; if (!P.down) return;
  if (P.mode === 'wand') {
    if (W.lock) { dragBy(e.clientY); const c = screenOf(centerOf(W.lock, v3)); if (Math.abs(c.x - e.clientX) > pxRadius(W.lock) + T.BREAK_PAD || W.lock.state === 'gone') release(); }
    else { const tip = screenOf(W.pos), t = pickAt(tip.x, tip.y) || pickAt(e.clientX, e.clientY); if (t) lockOn(t, e.clientY); }
  } else if (P.mode === 'walk' && worldOn(benchPlane, e.clientX, e.clientY, v3) && gogo.state.target && B.where === 'bench') gogo.goTo(clamp(v3.x, -T.BENCH.X, T.BENCH.X), clamp(v3.z, T.BENCH.Z0, T.BENCH.Z1));
});
const up = () => { if (!P.down) return; P.down = false; if (P.mode === 'wand') { release(); W.state = 'back'; W.back = T.WAND_BACK; } P.mode = null; };
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
sndEl.classList.toggle('off', MUTE); sndEl.addEventListener('click', () => { MUTE = !MUTE; sndEl.classList.toggle('off', MUTE); if (MUTE && 'speechSynthesis' in window) { speechSynthesis.cancel(); talk.busy = false; talk.next = null; } });

// ───────────────────────── 고고의 머리(하고 싶은 일) ─────────────────────────
const CANCEL = Symbol('cancel'), timers = [], conds = [], seen = new Set(), errors = [];
const B = { lastTo: 1, tok: null, where: 'bench', hop: null, idle: 0, tBig: -99, tSmall: -99, dizzy: false, fallT: -1, dir: 0, dirT: 0, watch: 0 };
function calm() { for (const k of ['hands', 'fluster', 'poke', 'sway']) gogo.pose(k, 0); }
function stopScript() { if (B.tok) { B.tok.dead = true; B.tok.wake.splice(0).forEach(f => f()); B.tok = null; } calm(); gogo.state.busy = false; }
/** 고고가 할 일 하나를 시작한다(하던 일은 그만둔다). 일은 중간에 언제든 끊길 수 있다. */
function run(fn) {
  stopScript(); const tok = { dead: false, wake: [] }; B.tok = tok; gogo.state.busy = true; B.idle = 0;
  Promise.resolve().then(() => fn(tok)).catch(e => { if (e !== CANCEL) { console.error(e); errors.push(String(e)); } })
    .finally(() => { if (B.tok === tok) { B.tok = null; gogo.state.busy = false; calm(); B.idle = 0; if (!W.lock && W.state !== 'held') gogo.lookAt(camera.position); } });
}
const alive = tok => { if (tok.dead) throw CANCEL; };
const wait = (tok, s) => new Promise(res => { timers.push({ t: s, res }); tok.wake.push(res); }).then(() => alive(tok));
const until = (tok, cond, max = 9) => new Promise(res => { conds.push({ cond, t: max, res }); tok.wake.push(res); }).then(() => alive(tok));
const walk = async (tok, x, z) => { gogo.goTo(clamp(x, -T.BENCH.X, T.BENCH.X), clamp(z, T.BENCH.Z0, T.BENCH.Z1)); await until(tok, () => !gogo.state.target, 10); };
const face = async (tok, a) => { gogo.state.faceTo = a; await until(tok, () => gogo.state.faceTo === null, 2.5); };
const cupY = () => Math.max(0.07 * things.cup.size, things.cup.h * things.cup.size + 0.03 - 0.74 * gogo.state.size);      // 컵 안에서 눈이 테두리 위로 나오는 높이
/** 폴짝 뛰어 옮겨 간다(컵 안 · 사과 위 · 실험대). 뛰는 동안은 장면마다 자리를 옮긴다. */
function hop(x, z, y, where, dur = 0.55) {
  const s = gogo.state; s.act = null; s.target = null; s.faceTo = Math.atan2(x - s.pos.x, z - s.pos.z) || 0; gogo.act('jump');
  B.hop = { x0: s.pos.x, z0: s.pos.z, y0: s.y, x, z, y, t: -0.2, dur, where, apex: 0.45 * Math.max(s.size, 0.6) + Math.max(0, y - s.y) * 0.5 }; B.where = 'air';
}
async function toBench(tok) {
  if (B.hop) await until(tok, () => !B.hop); if (B.where === 'bench') return;
  const t = B.where === 'cup' ? things.cup : things.apple; hop(t.x + 0.25, clamp(t.z + t.r * t.size + 0.42 * gogo.state.size + 0.15, T.BENCH.Z0, T.BENCH.Z1), 0, 'bench'); await until(tok, () => !B.hop);
}
async function approach(tok, t) {
  const s = gogo.state, side = s.pos.x >= t.x ? 1 : -1; await walk(tok, t.x + side * (t.r * t.size + 0.4 * s.size + 0.14), t.z + 0.5); await face(tok, Math.atan2(t.x - s.pos.x, t.z - s.pos.z));
}
function nudge(t, hard = 1) { t.tvx += rand(-1, 1) * 3 * hard; t.tvz += (Math.random() < 0.5 ? -1 : 1) * 5 * hard; if (t.name === 'ball') t.vx += (Math.random() < 0.5 ? -1 : 1) * 0.8 * hard; if (t.name === 'cup') sfx.clink(); else sfx.tick(); }
function fallNow() { gogo.act('fall', { lock: true }); gogo.setMood('wow', 0.5); B.fallT = 0; voice('oops'); }

/** 고고를 놓은 뒤: 크면 쿵쿵 걷고, 작으면 종종거리다 컵에 들어가고, 끝에서 끝으로 갔으면 어지럽다. */
async function afterSelf(tok) {
  const s = gogo.state;
  if (B.dizzy) { B.dizzy = false; seen.add('dizzy'); gogo.setMood('dizzy', 3.2); gogo.pose('sway', 1); voice('dizzy'); await wait(tok, 3); gogo.pose('sway', 0); gogo.setMood('smile', 1.2); await wait(tok, 0.8); }
  if (B.where !== 'bench') { if (B.where === 'cup') await wait(tok, T.CUP_STAY); await toBench(tok); return; }
  if (s.sizeTo > T.BIG_AT) { gogo.setMood('joy', 1); voice('big'); await wait(tok, 0.5); const x = s.pos.x > 0 ? -1.7 : 1.7; await walk(tok, x, 0.6); await wait(tok, 0.3); await walk(tok, -x * 0.35, 0.5); gogo.setMood('smile', 1.5); await face(tok, 0); }
  else if (s.sizeTo < T.SMALL_AT) { gogo.setMood('fluster', 0.7); voice('small'); await walk(tok, s.pos.x + (s.pos.x > 0.4 ? -0.9 : 0.9), 0.65); await intoCup(tok); }
  else { gogo.act('jump', { mood: 'joy' }); voice('joy'); await wait(tok, 0.9); }
}
async function intoCup(tok) {
  const c = things.cup, s = gogo.state; if (c.state !== 'up' || c.size < 0.8 || s.sizeTo * 0.36 > c.size * 0.31) { await face(tok, 0); return; }
  await walk(tok, c.x - 0.1, c.z + c.r * c.size + 0.34); hop(c.x, c.z, cupY(), 'cup'); await until(tok, () => !B.hop);
  seen.add('cupHide'); gogo.act('peek', { mood: 'smile' }); voice('joy'); sfx.clink(); await wait(tok, T.CUP_STAY); await toBench(tok);
}
/** 물건을 놓은 뒤: 다가가서 올려다보거나 내려다본다. 큰 사과에는 올라타고, 작은 의자에는 앉으려다 넘어진다. */
async function afterThing(tok, t) {
  const s = gogo.state; await toBench(tok);
  if (t.state === 'gone' || t.state === 'roll' || t.state === 'drop') return;
  if (t.size > T.BIG_AT) {
    await approach(tok, t); gogo.lookAt(topOf(t, v3)); gogo.setMood('wow', 1.6); voice('wow'); await wait(tok, 1.2);
    if (t.name === 'apple' && s.size < T.SMALL_AT) { hop(t.x, t.z, t.h * t.size * 0.93, 'apple', 0.7); await until(tok, () => !B.hop); seen.add('appleClimb'); gogo.act('jump', { mood: 'joy' }); voice('joy'); await wait(tok, 0.9); gogo.setMood('smile', T.PERCH_STAY); gogo.lookAt(camera.position); await wait(tok, T.PERCH_STAY); await toBench(tok); }
    else gogo.setMood('smile', 1);
  } else if (t.size < T.SMALL_AT) {
    await approach(tok, t); gogo.lookAt(centerOf(t, v3)); gogo.setMood('smile', 1.5); voice('hm'); await wait(tok, 0.9);
    if (t.name === 'chair' && s.size >= T.SMALL_AT) {
      await walk(tok, t.x, t.z + t.r * t.size + 0.34 * s.size); await face(tok, 0); await wait(tok, 0.25); seen.add('sitFall'); fallNow(); t.vy = 2.2; nudge(t, 1.5); await wait(tok, 2.7); gogo.setMood('smile', 1.2);
    } else { gogo.pose('poke', 1); await wait(tok, 0.35); nudge(t); await wait(tok, 0.35); gogo.pose('poke', 0); }
  } else { gogo.lookAt(centerOf(t, v3)); gogo.setMood('smile', 0.9); await wait(tok, 0.8); }
}
/** 심심하면 혼자 물건 하나를 건드려 본다. */
async function poke(tok) {
  const pool = Object.values(things).filter(t => (t.state === 'home' || t.state === 'up') && t.size > 0.6 && t.size < 1.5); if (!pool.length) return;
  const t = pool[Math.floor(Math.random() * pool.length)]; await toBench(tok); await approach(tok, t); gogo.lookAt(centerOf(t, v3)); gogo.pose('poke', 1); await wait(tok, 0.35); nudge(t); seen.add('poke'); word(t, NAME[t.name]); await wait(tok, 0.4); gogo.pose('poke', 0);
  gogo.setMood('smile', 1.2); await wait(tok, 0.7); await walk(tok, rand(-0.6, 0.7), rand(0.3, 0.6)); await face(tok, 0);
}

// ───────────────────────── 매 장면 ─────────────────────────
let clock = 0, wordT = 0, wordOf = null, shake = 0;
function crossing(t) {
  const s = t.size;
  if (!t.big && s > T.BIG_AT) { t.big = true; word(t, 'Big!'); sfx.spark(false); spark(topOf(t, v3), '#ffcc70', 18, 0.3 * s, 1.6); if (t.name === 'ball') t.t = 0.5; } else if (t.big && s < T.BIG_AT - T.REARM) t.big = false;
  if (!t.small && s < T.SMALL_AT) { t.small = true; word(t, 'Small!'); sfx.spark(true); spark(topOf(t, v3), '#83c9ea', 14, 0.2, 1.2); } else if (t.small && s > T.SMALL_AT + T.REARM) t.small = false;
}
function stepThing(t, dt) {
  t.v += (T.SPRING_K * (t.to - t.size) - T.SPRING_C * t.v) * dt; t.size = Math.max(0.05, t.size + t.v * dt); crossing(t);
  t.tvx += (-T.WOB_K * t.tx - T.WOB_C * t.tvx) * dt; t.tvz += (-T.WOB_K * t.tz - T.WOB_C * t.tvz) * dt; t.tx += t.tvx * dt; t.tz += t.tvz * dt;
  if (t.y > 0 || t.vy !== 0) { t.vy -= T.GRAVITY * dt; t.y += t.vy * dt; const floor = (t.state === 'fall') ? -2.5 : 0; if (t.y < floor) { t.y = floor; if (Math.abs(t.vy) > 1.2) sfx.bounce(Math.abs(t.vy) / 6); t.vy = Math.abs(t.vy) > 1.2 ? -t.vy * 0.45 : 0; } }
  if (t.name === 'ball') {
    const rr = t.r * t.size;
    if (t.state === 'home') { if (t.big && (t.t -= dt) <= 0) { t.state = 'roll'; seen.add('ballOff'); B.watch = 2.5; gogo.setMood('wow', 1.4); voice('wow'); } else t.vx += (-(t.x - t.home.x) * 3 - t.vx * 1.6) * dt; }
    else if (t.state === 'roll') { t.vx += (t.x >= 0 ? 1 : -1) * 2.6 * dt; if (Math.abs(t.x) > T.BENCH.EDGE + rr * 0.3) { t.state = 'fall'; t.vy = 0.01; t.t = 2.6; } }    // 큰 공은 실험대 끝으로 굴러가 떨어진다
    else if (t.state === 'fall') { if ((t.t -= dt) <= 0) { t.state = 'drop'; t.size = t.to = 1; t.v = 0; t.big = false; t.x = t.home.x; t.vx = 0; t.y = 3.2; t.vy = -0.01; spark(v3.set(t.home.x, 1, t.home.z), '#9b8ad4', 16, 0.3, 1.4); sfx.spark(true); } }
    else if (t.state === 'drop' && t.y === 0 && t.vy === 0) t.state = 'home';
    t.x += t.vx * dt; t.roll -= t.vx * dt / Math.max(rr, 0.05);
  }
  if (t.name === 'cup') {
    if (t.state === 'down') { t.lean += (Math.PI / 2 * t.dir - t.lean) * Math.min(1, 9 * dt); if ((t.t -= dt) <= 0 && Math.hypot(gogo.state.pos.x - t.x, gogo.state.pos.z - t.z) > t.r * t.size + 0.5 * gogo.state.size) { t.state = 'up'; t.vy = 2.6; t.y = 0.01; sfx.pop(); } }
    else t.lean += (0 - t.lean) * Math.min(1, 10 * dt);
  }
  const j = clamp(t.v / Math.max(t.size, 0.2) * T.JELLY, -0.22, 0.22), o = t.obj;
  o.scale.set(t.size * (1 - j * 0.5), t.size * (1 + j), t.size * (1 - j * 0.5)); o.position.set(t.x, t.y + (t.name === 'ball' ? t.r * t.size : 0), t.z);
  if (t.name === 'ball') o.rotation.set(t.tx * 0.2, 0, t.roll); else if (t.name === 'cup') { o.rotation.set(t.tx * 0.12, 0, t.tz * 0.12 - t.lean); if (Math.abs(t.lean) > 0.01) o.position.y += Math.sin(Math.abs(t.lean)) * t.r * t.size * 0.9; } else o.rotation.set(t.tx * 0.1, 0, t.tz * 0.1);
  t.mesh.material.emissiveIntensity += ((W.lock === t ? 0.22 + 0.08 * Math.sin(clock * 9) : 0) - t.mesh.material.emissiveIntensity) * Math.min(1, 12 * dt);
}
function topple(c, dir) { c.state = 'down'; c.dir = dir; c.t = T.CUP_UP; c.tvx += 4; sfx.clink(); seen.add('cupKnock'); gogo.setMood('wow', 1.1); voice('wow'); shake = Math.max(shake, T.SHAKE * 0.6); }

function step(dt) {
  clock += dt; const s = gogo.state, gs = s.size;
  for (let i = timers.length - 1; i >= 0; i--) if ((timers[i].t -= dt) <= 0) timers.splice(i, 1)[0].res();
  for (let i = conds.length - 1; i >= 0; i--) { const c = conds[i]; if ((c.t -= dt) <= 0 || c.cond()) { conds.splice(i, 1); c.res(); } }

  // 지팡이: 든 동안에는 손가락 위쪽에 별이 오게 따라온다. 놓으면 잠깐 있다가 꽂이로 돌아간다.
  if (W.state === 'held' && worldOn(wandPlane, P.x, P.y, v3)) W.to.set(v3.x + T.WAND_TIP[0], v3.y + T.WAND_TIP[1], T.WAND_Z);
  else if (W.state === 'back' && (W.back -= dt) <= 0) { W.to.copy(wandRest); if (W.pos.distanceTo(wandRest) < 0.03) W.state = 'rest'; }
  const kw = 1 - Math.exp(-(W.state === 'held' ? T.WAND_FOLLOW : 7) * dt), dx = (W.to.x - W.pos.x) * kw; W.pos.lerp(W.to, kw);
  W.tilt += ((W.state === 'held' ? 0.42 : 0.12) - dx * 4 - W.tilt) * Math.min(1, 12 * dt); W.obj.position.copy(W.pos); W.obj.rotation.set(0, clock * (W.lock ? 5 : 1.2), 0); W.obj.rotation.z = W.tilt; W.obj.rotation.order = 'ZXY';
  if (W.state === 'rest') W.obj.position.y += Math.sin(clock * 2.2) * 0.035;
  W.obj.material.emissiveIntensity = W.lock ? 0.9 : 0.3 + 0.2 * Math.sin(clock * 3);
  if (Math.random() < dt * (W.lock ? 60 : W.state === 'rest' ? 3 : 10)) spark(W.pos, '#ffe9a8', 1, 0.12, 0.5);
  if (W.lock) { const c = centerOf(W.lock, v3), k = Math.random(); spark(v3b.copy(W.pos).lerp(c, k), k < 0.5 ? '#ffd766' : '#c9b8ff', 1, 0.05, 0.3); if (W.lock.state === 'gone' || W.lock.state === 'fall') release(); }

  for (const t of Object.values(things)) stepThing(t, dt);
  crossing(GOGO);

  // 지팡이가 고고에게 닿아 있는 동안: 커지면 놀라서 제 손을 내려다보고, 작아지면 허둥댄다
  if (W.lock === GOGO) {
    const d = s.sizeTo - B.lastTo; B.lastTo = s.sizeTo;                                // 손이 끄는 쪽(용수철이 출렁이는 것은 치지 않는다)
    if (Math.abs(d) > 0.001) { B.dir = Math.sign(d); B.dirT = d > 0 ? 1.3 : 0.5; } else if ((B.dirT -= dt) <= 0) B.dir = 0;   // 커진 뒤에는 한동안 손을 들여다본다
    gogo.pose('hands', B.dir > 0 ? 1 : 0); gogo.pose('fluster', B.dir < 0 ? 1 : 0); if (B.dir > 0) gogo.setMood('wow', 0.4); else if (B.dir < 0) gogo.setMood('fluster', 0.4);
    if (B.dir > 0) gogo.lookAt(v3.set(s.pos.x + Math.sin(s.heading) * 0.55 * gs, s.y + 0.5 * gs, s.pos.z + Math.cos(s.heading) * 0.55 * gs)); else gogo.lookAt(W.pos);
  } else if (W.state === 'held') gogo.lookAt(W.pos);                                    // 지팡이를 눈으로 따라간다
  else if (B.watch > 0) { B.watch -= dt; gogo.lookAt(centerOf(things.ball, v3)); if (B.watch <= 0 && !B.tok) gogo.lookAt(camera.position); }
  // 끝에서 끝으로: 다 키웠다가 단숨에 다 줄이면(또는 그 반대) 어지럽다. tBig · tSmall = 그 끝에 마지막으로 있던 때
  if (gs > T.FULL_BIG) { if (clock - B.tSmall < T.DIZZY_SWEEP) { B.dizzy = true; B.tSmall = -99; } B.tBig = clock; }
  if (gs < T.FULL_SMALL) { if (clock - B.tBig < T.DIZZY_SWEEP) { B.dizzy = true; B.tBig = -99; } B.tSmall = clock; }
  if (B.fallT >= 0) { const was = B.fallT; B.fallT += dt; if (was < 0.5 && B.fallT >= 0.5) { gogo.setMood('dizzy', 1.5); sfx.thud(gs); shake = Math.max(shake, T.SHAKE * gs * 0.5); } if (B.fallT > 2.5) B.fallT = -1; }

  // 뛰어 옮겨 가기 · 컵 안 · 사과 위
  if (B.hop) { const h = B.hop; h.t += dt; const k = clamp(h.t / h.dur, 0, 1); s.pos.x = h.x0 + (h.x - h.x0) * k; s.pos.z = h.z0 + (h.z - h.z0) * k; s.y = h.y0 + (h.y - h.y0) * k + h.apex * 4 * k * (1 - k);
    if (k >= 1) { B.where = h.where; B.hop = null; s.y = h.y; sfx.thud(gs * 0.6); s.faceTo = 0; } }                       // 내려앉으면 아이 쪽을 본다
  const cup = things.cup, apple = things.apple;
  if (B.where === 'cup') { s.pos.x = cup.x; s.pos.z = cup.z; s.y = cupY(); s.target = null;
    if (cup.state !== 'up' || cup.size < 0.75 || s.sizeTo * 0.36 > cup.size * 0.34) { const grew = s.sizeTo * 0.36 > cup.size * 0.34; seen.add('cupPop'); run(async tok => { await toBench(tok); if (grew && cup.state === 'up') topple(cup, -1); gogo.setMood('wow', 1); if (W.lock !== GOGO) await afterSelf(tok); }); if (W.lock === GOGO) gogo.state.busy = true; } }
  if (B.where === 'apple') { s.pos.x = apple.x; s.pos.z = apple.z; s.y = apple.h * apple.size * 0.93; s.target = null; if (apple.size < T.BIG_AT - 0.2 || s.sizeTo > 0.95) run(async tok => { await toBench(tok); gogo.setMood('wow', 0.8); }); }
  // 부딪힘: 큰 고고가 걷다가 컵을 쓰러뜨린다 · 공은 차이고 · 사과와 의자는 비켜 간다
  if (B.where === 'bench' && !B.hop) for (const t of Object.values(things)) {
    if (t.y > 0.3 || t.state === 'fall' || t.state === 'gone') continue; const ddx = s.pos.x - t.x, ddz = s.pos.z - t.z, d = Math.hypot(ddx, ddz) || 0.001, need = (t.name === 'cup' && gs > T.BIG_AT ? 0.42 : 0.3) * gs + t.r * t.size * 0.85;   // 큰 고고는 컵 곁을 지나기만 해도 건드린다
    if (d >= need) continue;
    if (t.name === 'cup' && t.state === 'up' && gs > T.BIG_AT && s.v > 0.05) topple(t, ddx > 0 ? 1 : -1);
    else if (t.name === 'ball') { t.vx -= ddx / d * 3 * dt * 8; }
    if (!(t.name === 'cup' && t.state === 'down')) { s.pos.x += ddx / d * (need - d); s.pos.z = clamp(s.pos.z + ddz / d * (need - d), T.BENCH.Z0, T.BENCH.Z1); }
  }
  // 심심하면 혼자 건드려 본다
  if (!B.tok && !W.lock && W.state !== 'held' && !s.moving && !s.act && B.where === 'bench') { B.idle += dt; if (B.idle > T.IDLE_POKE) run(poke); } else if (W.lock || s.moving) B.idle = 0;

  gogo.update(dt);
  // 낱말 · 반짝이 · 흔들림
  if (wordT > 0) { wordT -= dt; const p = screenOf(topOf(wordOf, v3)); wordEl.style.left = clamp(p.x, 90, innerWidth - 90) + 'px'; wordEl.style.top = Math.max(70, p.y - 46) + 'px'; if (wordT <= 0) wordEl.className = ''; }
  for (let i = 0; i < NP; i++) { const q = pp[i], j = i * 3; if (q.life <= 0) { pCol[j] = pCol[j + 1] = pCol[j + 2] = 0; continue; } q.life -= dt; pPos[j] += q.v.x * dt; pPos[j + 1] += q.v.y * dt; pPos[j + 2] += q.v.z * dt; q.v.y -= 1.2 * dt; const a = Math.max(0, q.life / q.max); pCol[j] = q.c.r * a; pCol[j + 1] = q.c.g * a; pCol[j + 2] = q.c.b * a; }
  pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
  shake *= Math.exp(-9 * dt); camera.position.set(camBase.x + rand(-1, 1) * shake, camBase.y + rand(-1, 1) * shake, camBase.z);
}
// 발소리: 클수록 묵직하고, 큰 고고가 걸으면 실험대가 흔들려 물건이 들썩인다
gogo.on('step', (side, gait) => {
  const gs = gogo.state.size; if (gait === 'scurry') { sfx.tick(); return; } sfx.thud(gs);
  if (gait === 'heavy') { shake = Math.max(shake, T.SHAKE * gs / 1.8); for (const t of Object.values(things)) if (t.y === 0 && t.state !== 'down') { t.vy = 0.9; t.y = 0.001; t.tvz += rand(-2, 2); } spark(v3.set(gogo.state.pos.x, 0.05, gogo.state.pos.z), '#f7ebd5', 5, 0.3, 0.6); }
});

// ───────────────────────── 돌리기 ─────────────────────────
const summary = () => ({ gogo: { size: +gogo.state.size.toFixed(2), x: +gogo.state.pos.x.toFixed(2), z: +gogo.state.pos.z.toFixed(2), y: +gogo.state.y.toFixed(2), where: B.where, mood: gogo.state.mood, act: gogo.state.act ? gogo.state.act.name : '', gait: gogo.gait() },
  things: Object.fromEntries(Object.values(things).map(t => [t.name, t.size.toFixed(2) + ' ' + t.state + ' x' + t.x.toFixed(1) + ' y' + t.y.toFixed(1)])), said, seen: [...seen], wand: W.state, errors });
window.__lab = { T, gogo, things, W, B, step, summary, lockOn, setTo, release, tapBench, GOGO, camera,
  at: n => { const c = screenOf(n === 'wand' ? W.pos : centerOf(n === 'gogo' ? GOGO : things[n], v3)); return [c.x, c.y + (n === 'wand' ? 40 : 0)]; } };   // 확인용: 화면에서의 자리
ready = true;
if (Q.has('auto')) {                                       // 머리 없는 브라우저용: 정해 둔 차례대로 놀아 보고 상태를 제목에 적는다
  document.getElementById('back').style.display = sndEl.style.display = Q.has('ui') ? '' : 'none';
  const tick = async () => { step(1 / 60); for (let i = 0; i < 8; i++) await null; }, by = n => n === 'gogo' ? GOGO : things[n];
  for (let i = 0; i < 30; i++) await tick();
  for (const cmd of Q.get('auto').split(',')) {
    const [k, a, b] = cmd.split(':');
    if (k === 'lock') { const t = by(a), c = screenOf(centerOf(t, v3)); P.x = c.x; P.y = c.y; P.down = true; P.mode = 'wand'; W.state = 'held'; lockOn(t, c.y); }
    else if (k === 'drag') { const s0 = W.lock.to; for (let i = 1; i <= 36; i++) { setTo(W.lock, s0 + (+a - s0) * i / 36); P.y -= (+a - s0) * 3; await tick(); } }
    else if (k === 'release') { P.down = false; P.mode = null; release(); W.state = 'back'; W.back = T.WAND_BACK; }
    else if (k === 'tap') tapBench(+a, +b);
    else if (k === 'step') for (let i = 0; i < +a * 60; i++) await tick();
  }
  renderer.render(scene, camera); document.title = 'READY ' + JSON.stringify(summary());
} else {
  let last = performance.now();
  renderer.setAnimationLoop(now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; step(dt); renderer.render(scene, camera); });
  document.title = 'READY ' + document.title;
}
