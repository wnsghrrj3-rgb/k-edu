/* 배고픈 몬스터 — 영어 놀이터 「손맛 시험판」.
 * 정본: KEDU ENGLISH PLAYGROUND 통합 설계서 §13 몬스터 식당 「먹이 주기」(L1-5-1) · §21 애니메이션 시간 기준.
 * 하는 일은 하나: 음식을 집어 몬스터 입에 넣는다(끌어도 되고 던져도 된다). 맛마다 몬스터가 다르게 반응한다.
 * 정답 · 점수 · 시간제한 없음. 영어는 집을 때 음식 이름, 먹었을 때 맛 한마디.
 * 그림은 모두 코드로 빚은 임시 도형(모형 파일 없음). 저장 없음. */
import * as THREE from 'three';

// ── 수치(준호가 만져 보고 바꾼다)
const T = {
  COUNTER_Y: 0.9, PLANE_Z: 1.6, WALL_X: 3.9,
  MOUTH: new THREE.Vector2(0, 1.62), EAT_R: 0.5, WANT_R: 1.9,
  GRAVITY: 15, BOUNCE: 0.45, FOLLOW: 24, THROW: 1.0,
  HOME_X: [-3.15, -2.4, -1.7, 1.7, 2.4, 3.15],
};
const FOODS = [
  { kind: 'cake', name: 'Cake', taste: 'Yummy!' },
  { kind: 'lemon', name: 'Lemon', taste: 'Sour!' },
  { kind: 'pepper', name: 'Pepper', taste: 'Hot!' },
  { kind: 'icecream', name: 'Ice cream', taste: 'Cold!' },
  { kind: 'bread', name: 'Bread', taste: 'Mmm!' },
  { kind: 'milk', name: 'Milk', taste: 'Aah!' },
];
const PINK = new THREE.Color('#f48fb1');

// ── 무대
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#F7EBD5');
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
scene.add(new THREE.HemisphereLight('#fff6e6', '#d9b58a', 1.5));
const sun = new THREE.DirectionalLight('#fff1d6', 2.2);
sun.position.set(-3.5, 7, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -2, near: 1, far: 20 });
sun.shadow.bias = -0.002;
scene.add(sun);

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.65, ...o });
function mesh(geo, m, parent, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
  (parent || scene).add(o); return o;
}
// 부엌: 벽 · 둥근 창 · 선반 · 조리대
mesh(new THREE.PlaneGeometry(30, 14), mat('#F3DFC0'), null, 0, 5, -2.2).castShadow = false;
mesh(new THREE.CircleGeometry(1.25, 40), mat('#83C9EA', { roughness: 1 }), null, -3.6, 4.1, -2.15).castShadow = false;
mesh(new THREE.TorusGeometry(1.25, 0.12, 10, 40), mat('#b9853b'), null, -3.6, 4.1, -2.1);
mesh(new THREE.BoxGeometry(3.2, 0.14, 0.6), mat('#b9853b'), null, 3.4, 3.9, -1.9);
[['#F29A83', 2.3, 0.5], ['#78B985', 3.1, 0.7], ['#FFCC70', 3.8, 0.45], ['#9B8AD4', 4.5, 0.6]].forEach(([c, x, h]) =>
  mesh(new THREE.CylinderGeometry(0.22, 0.22, h, 20), mat(c), null, x, 3.97 + h / 2, -1.9));
mesh(new THREE.BoxGeometry(9.5, 0.16, 1.9), mat('#d9a066'), null, 0, T.COUNTER_Y - 0.08, 1.7);
mesh(new THREE.BoxGeometry(9.3, 3, 1.7), mat('#b97c48'), null, 0, T.COUNTER_Y - 1.66, 1.7);
mesh(new THREE.PlaneGeometry(60, 60), mat('#e6c79c'), null, 0, -0.75, 2).rotation.x = -Math.PI / 2;

// ── 몬스터(Momo): 둥근 몸 · 눈 둘 · 입 · 뿔 · 팔
const M = { root: new THREE.Group(), body: null, eyes: [], pupils: [], mouth: null, tongue: null, arms: [], stache: null, cheeks: [] };
scene.add(M.root);
M.root.position.set(0, 0.35, 0);
const bodyMat = mat(PINK.clone(), { roughness: 0.55 });
M.body = mesh(new THREE.SphereGeometry(1.35, 48, 36), bodyMat, M.root, 0, 1.35, 0);
const belly = mesh(new THREE.SphereGeometry(0.95, 32, 24), mat('#ffd9e6'), M.body, 0, -0.45, 0.62);
belly.scale.set(1, 0.9, 0.6); belly.castShadow = false;
[-1, 1].forEach(s => {
  const horn = mesh(new THREE.ConeGeometry(0.17, 0.5, 16), mat('#fff3d6'), M.body, s * 0.55, 1.28, 0.1);
  horn.rotation.z = -s * 0.35;
  const eye = new THREE.Group(); eye.position.set(s * 0.46, 0.5, 1.13); M.body.add(eye);
  mesh(new THREE.SphereGeometry(0.31, 28, 20), mat('#ffffff', { roughness: 0.3 }), eye).castShadow = false;
  const pupil = mesh(new THREE.SphereGeometry(0.14, 20, 16), mat('#2b1b12', { roughness: 0.2 }), eye, 0, 0, 0.24);
  pupil.castShadow = false;
  M.eyes.push(eye); M.pupils.push(pupil);
  const cheek = mesh(new THREE.SphereGeometry(0.2, 20, 14), mat('#e8648f', { transparent: true, opacity: 0.55 }), M.body, s * 0.8, 0.0, 1.03);
  cheek.scale.set(1, 0.8, 0.35); cheek.lookAt(M.body.localToWorld(new THREE.Vector3(s * 1.6, 0, 2.06))); cheek.castShadow = false; M.cheeks.push(cheek);
  const arm = mesh(new THREE.SphereGeometry(0.3, 20, 16), bodyMat, M.body, s * 1.32, -0.25, 0.45);
  arm.scale.set(0.8, 1.15, 0.8); M.arms.push(arm);
});
M.mouth = mesh(new THREE.SphereGeometry(0.5, 32, 20), mat('#5a1f2d', { roughness: 0.9 }), M.body, 0, -0.13, 1.3);
M.mouth.castShadow = false;
M.tongue = mesh(new THREE.SphereGeometry(0.26, 20, 14), mat('#ff7f9f'), M.mouth, 0, -0.45, 0.25);
M.tongue.scale.set(1.2, 0.5, 0.6); M.tongue.castShadow = false;
M.stache = mesh(new THREE.TorusGeometry(0.3, 0.07, 8, 24, Math.PI), mat('#ffffff'), M.body, 0, 0.12, 1.33);
M.stache.rotation.z = Math.PI; M.stache.visible = false; M.stache.castShadow = false;

// 몬스터 상태: 목표 값을 정해 두면 매 프레임 출렁이며 따라간다
const st = {
  squash: 1, squashV: 0, lean: 0, leanV: 0, hop: 0, hopV: 0,
  open: 0.12, openT: 0.12, eye: 1, eyeT: 1, wide: 0,
  look: new THREE.Vector2(0, 0), lookT: new THREE.Vector2(0, 0),
  size: 1, sizeT: 1, shiver: 0, armUp: 0, armUpT: 0, tint: PINK.clone(), tintT: PINK.clone(),
  blink: 2, busy: 0, tok: 0, eaten: 0, lastTouch: 0, mood: 'idle',
};
const kick = (v = 2.5) => { st.squashV += v; };
const jump = (v = 5) => { if (st.hop <= 0.01) st.hopV = v; };

// ── 음식(임시 도형)
function makeFood(kind) {
  const g = new THREE.Group();
  const add = (geo, color, x = 0, y = 0, z = 0) => mesh(geo, mat(color), g, x, y, z);
  if (kind === 'cake') {
    add(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 28), '#f6dfb8', 0, -0.05);
    add(new THREE.CylinderGeometry(0.32, 0.32, 0.09, 28), '#ff9ebb', 0, 0.12);
    add(new THREE.SphereGeometry(0.09, 16, 12), '#e23b4e', 0, 0.24);
  } else if (kind === 'lemon') {
    const b = add(new THREE.SphereGeometry(0.25, 28, 20), '#ffd93b'); b.scale.set(1.3, 1, 1);
    add(new THREE.ConeGeometry(0.07, 0.12, 12), '#ffd93b', 0.34, 0, 0).rotation.z = -Math.PI / 2;
    add(new THREE.ConeGeometry(0.07, 0.12, 12), '#ffd93b', -0.34, 0, 0).rotation.z = Math.PI / 2;
  } else if (kind === 'pepper') {
    const b = add(new THREE.ConeGeometry(0.15, 0.6, 20), '#e02b20', 0, -0.03); b.rotation.z = Math.PI;
    add(new THREE.CylinderGeometry(0.035, 0.05, 0.16, 10), '#3f9b4b', 0, 0.33);
    g.rotation.z = 0.5;
  } else if (kind === 'icecream') {
    const c = add(new THREE.ConeGeometry(0.19, 0.46, 20), '#d9a05b', 0, -0.2); c.rotation.z = Math.PI;
    add(new THREE.SphereGeometry(0.22, 24, 18), '#a8ecd2', 0, 0.1);
    add(new THREE.SphereGeometry(0.17, 24, 18), '#ffb3cf', 0, 0.33);
  } else if (kind === 'bread') {
    const b = add(new THREE.SphereGeometry(0.27, 28, 20), '#d99a4e'); b.scale.set(1.45, 0.8, 0.95);
    [-0.16, 0, 0.16].forEach(x => { const s = add(new THREE.BoxGeometry(0.05, 0.03, 0.34), '#f3cf94', x, 0.2, 0); s.rotation.y = 0.5; });
  } else if (kind === 'milk') {
    add(new THREE.BoxGeometry(0.34, 0.44, 0.34), '#ffffff', 0, -0.06);
    add(new THREE.BoxGeometry(0.35, 0.14, 0.35), '#5aa9e6', 0, -0.1);
    const r = add(new THREE.ConeGeometry(0.245, 0.18, 4), '#ffffff', 0, 0.25); r.rotation.y = Math.PI / 4;
  }
  return g;
}
const foods = FOODS.map((f, i) => {
  const obj = makeFood(f.kind); scene.add(obj);
  const home = new THREE.Vector2(T.HOME_X[i], T.COUNTER_Y + 0.32);
  const baseRot = obj.rotation.z;
  obj.position.set(home.x, home.y, T.PLANE_Z);
  return { ...f, obj, home, baseRot, pos: home.clone(), vel: new THREE.Vector2(), state: 'home', rest: 0, pop: 1, popV: 0, spin: 0, wig: 0 };
});
const pickR = 0.55;

// ── 반짝이: 하트 · 김 · 불 · 눈 · 부스러기
const bits = [];
const bitGeo = new THREE.SphereGeometry(0.08, 10, 8);
function puff(kind, n, at) {
  const C = { heart: '#ff6f9c', steam: '#ffffff', fire: '#ff8a1e', snow: '#cfefff', crumb: '#e8c88a' }[kind];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(bitGeo, new THREE.MeshBasicMaterial({ color: C, transparent: true }));
    m.position.set(at.x + (Math.random() - 0.5) * 0.5, at.y + (Math.random() - 0.5) * 0.3, at.z);
    const b = { m, life: 0, max: 0.8 + Math.random() * 0.6, vx: (Math.random() - 0.5) * 2.4, vy: 1.2 + Math.random() * 2, g: -1, grow: 1 };
    if (kind === 'fire') { b.vx = (Math.random() - 0.5) * 1.5; b.vy = -0.4 + Math.random(); b.vz = 2.5 + Math.random() * 2; b.grow = 2.5; b.max = 0.5; }
    if (kind === 'steam') { b.vy = 1.5 + Math.random(); b.grow = 3; b.g = 0; }
    if (kind === 'snow') { b.vy = 0.5 + Math.random(); b.g = -3; }
    if (kind === 'crumb') { b.g = -9; b.max = 0.6; m.scale.setScalar(0.5); }
    if (kind === 'heart') { b.g = 0.5; b.grow = 1.6; }
    scene.add(m); bits.push(b);
  }
}

// ── 소리(합성음 · 음원 파일 없음) + 영어 목소리(기기 음성 · 임시)
let actx = null;
const ac = () => (actx = actx || new (window.AudioContext || window.webkitAudioContext)());
function tone(f, d = 0.15, type = 'sine', v = 0.15, at = 0, slide = 0) {
  try {
    const a = ac(), o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + at;
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t0 + d);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.001, t0 + d);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + d + 0.05);
  } catch (_) {}
}
function crunch(at = 0, v = 0.25) {
  try {
    const a = ac(), n = a.sampleRate * 0.09, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 900; s.buffer = buf; g.gain.value = v;
    s.connect(f).connect(g).connect(a.destination); s.start(a.currentTime + at);
  } catch (_) {}
}
const sPop = () => tone(520, 0.09, 'triangle', 0.14, 0, 380);
const sThud = v => tone(120, 0.12, 'sine', Math.min(0.25, 0.05 + v * 0.03), 0, -60);
const sGiggle = () => [660, 880, 740, 990].forEach((f, i) => tone(f, 0.09, 'triangle', 0.1, i * 0.07));
let VOICE = null;
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
    VOICE = ['Google US English', 'Samantha', 'Aria', 'Jenny', 'Ava'].map(n => vs.find(v => v.name.includes(n))).find(Boolean) || vs.find(v => /en[-_]US/i.test(v.lang)) || vs[0] || null;
  } catch (_) {}
}
try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch (_) {}
let lastSaid = '', lastSaidAt = 0;
function say(text, pitch = 1.1, rate = 0.9) {
  const now = performance.now();
  if (text === lastSaid && now - lastSaidAt < 2500) return;   // 같은 말 연달아 안 함
  lastSaid = text; lastSaidAt = now;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; if (VOICE) u.voice = VOICE; u.rate = rate; u.pitch = pitch;
    speechSynthesis.speak(u);
  } catch (_) {}
}
const wordEl = document.getElementById('word');
function showWord(text, color = '#fff') {
  wordEl.textContent = text; wordEl.style.color = color; wordEl.classList.add('on');
  clearTimeout(showWord.h); showWord.h = setTimeout(() => wordEl.classList.remove('on'), 1300);
}

// ── 시간: 프레임 시계에 맞춘 기다림(탭이 멈추면 같이 멈춘다)
const waits = [];
const wait = s => new Promise(r => waits.push({ t: s, r }));

// ── 먹기와 맛 반응
function resetFace() {
  st.eyeT = 1; st.wide = 0; st.shiver = 0; st.armUpT = 0; st.tintT.copy(PINK); st.openT = 0.12; st.mood = 'idle';
}
async function eat(food) {
  if (food.state === 'eaten') return;
  food.state = 'eaten';
  const tok = ++st.tok; st.busy = 1; resetFace(); st.mood = 'eat'; st.lastTouch = clock;
  // 덥석: 입으로 빨려 들어가며 작아진다
  st.openT = 1; st.leanV += (food.pos.x - T.MOUTH.x) * 3; kick(-3);
  food.suck = 1;
  await wait(0.12); if (tok !== st.tok) return;
  food.obj.visible = false;
  for (let i = 0; i < 3; i++) {                       // 냠 냠 냠
    st.openT = 0.05; kick(2.2); crunch(0, 0.22); puff('crumb', 3, mouthWorld());
    await wait(0.13); if (tok !== st.tok) return;
    st.openT = 0.5; await wait(0.11); if (tok !== st.tok) return;
  }
  st.openT = 0.12; tone(180, 0.12, 'sine', 0.2, 0, -90);  // 꿀꺽
  st.eaten++; st.sizeT = Math.min(1.22, 1 + st.eaten * 0.045);
  setTimeout(() => respawn(food), 900);
  await wait(0.18); if (tok !== st.tok) return;
  await REACT[food.kind](tok, food);
  if (tok !== st.tok) return;
  resetFace(); st.busy = 0;
  if (st.eaten >= 5) burp();
}
const REACT = {
  async cake(tok, f) {                                 // 맛있다: 통통 튀고 하트
    showWord(f.taste, '#ff7aa8'); say(f.taste, 1.4); st.eyeT = 0.32; st.openT = 0.75; st.armUpT = 1; st.mood = 'happy';
    for (let i = 0; i < 3; i++) { jump(5.2); tone(660 + i * 160, 0.14, 'triangle', 0.13); puff('heart', 4, headWorld()); await wait(0.42); if (tok !== st.tok) return; }
  },
  async lemon(tok, f) {                                // 시다: 눈 질끈, 오그라들며 부르르
    showWord(f.taste, '#ffe04a'); say(f.taste, 1.6, 1.0); st.eyeT = 0.06; st.openT = 0.03; st.shiver = 1; st.mood = 'sour';
    st.tintT.set('#e9c46a'); kick(-5); tone(900, 0.5, 'sawtooth', 0.06, 0, -500);
    await wait(1.0); if (tok !== st.tok) return;
    st.shiver = 0; st.eyeT = 1.25; st.wide = 1; st.openT = 0.6; kick(4); tone(500, 0.2, 'triangle', 0.12, 0, 300);   // 푸하
    await wait(0.5);
  },
  async pepper(tok, f) {                               // 맵다: 빨개지고 김 나고 불 뿜기
    st.eyeT = 1.3; st.wide = 1; st.mood = 'hot'; st.tintT.set('#e53a2b'); tone(300, 0.6, 'sawtooth', 0.05, 0, 600);
    await wait(0.45); if (tok !== st.tok) return;
    showWord(f.taste, '#ff5a2a'); say(f.taste, 1.5, 1.05); st.openT = 1; st.armUpT = 1;
    for (let i = 0; i < 6; i++) { jump(3.6); puff('fire', 5, mouthWorld()); puff('steam', 2, headWorld()); tone(140 + Math.random() * 60, 0.16, 'sawtooth', 0.09); await wait(0.24); if (tok !== st.tok) return; }
    st.openT = 0.7; st.eyeT = 0.8; st.tintT.copy(PINK);                         // 헥헥
    for (let i = 0; i < 3; i++) { kick(1.6); tone(420, 0.08, 'sine', 0.06); await wait(0.22); if (tok !== st.tok) return; }
  },
  async icecream(tok, f) {                             // 차갑다: 파래지고 덜덜
    showWord(f.taste, '#8fd8ff'); say(f.taste, 1.3, 0.85); st.tintT.set('#8fc9f0'); st.shiver = 0.7; st.eyeT = 0.5; st.openT = 0.2; st.mood = 'cold';
    for (let i = 0; i < 5; i++) { puff('snow', 3, headWorld()); tone(1400 + i * 120, 0.08, 'sine', 0.05); await wait(0.24); if (tok !== st.tok) return; }
    st.shiver = 0; st.tintT.copy(PINK); kick(3); await wait(0.3);
  },
  async bread(tok, f) {                                // 든든하다: 볼 가득 오물오물
    showWord(f.taste, '#ffd38a'); say(f.taste, 0.9, 0.8); st.eyeT = 0.4; st.mood = 'happy';
    for (let i = 0; i < 4; i++) { st.openT = i % 2 ? 0.25 : 0.05; kick(1.8); crunch(0, 0.12); await wait(0.2); if (tok !== st.tok) return; }
    jump(3.5); puff('heart', 3, headWorld()); await wait(0.4);
  },
  async milk(tok, f) {                                 // 꿀꺽꿀꺽, 우유 수염
    st.eyeT = 0.3; st.mood = 'happy';
    for (let i = 0; i < 3; i++) { kick(-2); tone(220 - i * 20, 0.1, 'sine', 0.16, 0, -80); await wait(0.2); if (tok !== st.tok) return; }
    M.stache.visible = true; showWord(f.taste, '#ffffff'); say(f.taste, 1.0, 0.75); st.openT = 0.7; st.eyeT = 1; jump(3);
    await wait(0.8); setTimeout(() => { M.stache.visible = false; }, 3500);
  },
};
async function burp() {                                // 다섯 번 먹으면 끄윽 — 다시 홀쭉
  const tok = ++st.tok; st.busy = 1; st.mood = 'burp';
  st.eyeT = 0.5; kick(-4); await wait(0.5); if (tok !== st.tok) return;
  st.openT = 1; st.eyeT = 1.3; st.wide = 1; kick(6); tone(95, 0.7, 'sawtooth', 0.14, 0, -45);
  showWord('Oops!', '#b9f08a'); say('Oops! Excuse me!', 1.2); puff('steam', 6, mouthWorld());
  st.eaten = 0; st.sizeT = 1;
  await wait(0.9); if (tok !== st.tok) return;
  resetFace(); st.busy = 0;
}
function poke() {                                      // 몸을 누르면 간지럼
  st.lastTouch = clock; kick(4.5); sGiggle();
  if (!st.busy) { st.eyeT = 0.3; st.openT = 0.6; setTimeout(() => { if (!st.busy) resetFace(); }, 500); }
}
function respawn(food) {
  food.state = 'home'; food.pos.copy(food.home); food.vel.set(0, 0); food.suck = 0; food.spin = 0;
  food.obj.visible = true; food.pop = 0.01; food.popV = 9; sPop();
}
const mouthWorld = () => new THREE.Vector3(st.lean * 0.9, 0.35 + (1.22 + st.hop) * st.size, 1.45);
const headWorld = () => new THREE.Vector3(st.lean * 1.4, 0.35 + (2.9 + st.hop) * st.size, 0.6);

// ── 손: 집기 · 끌기 · 던지기
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -T.PLANE_Z), hit = new THREE.Vector3();
const hand = { food: null, target: new THREE.Vector2(), id: null, hist: [] };
function toPlane(e) {
  const b = canvas.getBoundingClientRect();
  ndc.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.ray.intersectPlane(plane, hit) ? new THREE.Vector2(hit.x, hit.y) : null;
}
canvas.addEventListener('pointerdown', e => {
  try { ac().resume(); } catch (_) {}
  const p = toPlane(e); if (!p) return;
  let best = null, bd = pickR;
  for (const f of foods) { if (f.state === 'eaten') continue; const d = f.pos.distanceTo(p); if (d < bd) { bd = d; best = f; } }
  if (best) {
    hand.food = best; hand.id = e.pointerId; hand.target.copy(p); hand.hist = [];
    best.state = 'held'; best.popV += 7; best.vel.set(0, 0); sPop(); say(best.name, 1.1); st.lastTouch = clock;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    return;
  }
  if (ray.intersectObject(M.body, false).length) poke();
});
canvas.addEventListener('pointermove', e => {
  if (!hand.food || e.pointerId !== hand.id) return;
  const p = toPlane(e); if (!p) return;
  hand.target.copy(p);
  hand.hist.push({ x: p.x, y: p.y, t: performance.now() }); if (hand.hist.length > 6) hand.hist.shift();
});
function release(e) {
  const f = hand.food; if (!f || e.pointerId !== hand.id) return;
  hand.food = null;
  if (f.state !== 'held') return;
  const h = hand.hist; f.vel.set(0, 0);
  if (h.length >= 2) {                                 // 놓는 순간의 손 빠르기가 던지는 힘
    const a = h[0], b = h[h.length - 1], dt = Math.max(0.016, (b.t - a.t) / 1000);
    if (performance.now() - b.t < 120) f.vel.set((b.x - a.x) / dt, (b.y - a.y) / dt).multiplyScalar(T.THROW).clampLength(0, 16);
  }
  f.state = 'fly'; f.rest = 0; f.spin = -f.vel.x * 1.2;
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);

// ── 매 프레임
let clock = 0, last = performance.now(), idleAt = 6;
function spring(x, v, target, k, c, dt) { const a = (target - x) * k - v * c; v += a * dt; return [x + v * dt, v]; }
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000); last = now; clock += dt;
  for (let i = waits.length - 1; i >= 0; i--) { waits[i].t -= dt; if (waits[i].t <= 0) { waits[i].r(); waits.splice(i, 1); } }

  // 음식
  const floor = T.COUNTER_Y + 0.3;
  let near = null, nearD = 9;
  for (const f of foods) {
    if (f.state === 'held') {
      const tx = THREE.MathUtils.clamp(hand.target.x, -T.WALL_X, T.WALL_X), ty = Math.max(floor, hand.target.y);
      const k = Math.min(1, dt * T.FOLLOW), ox = f.pos.x, oy = f.pos.y;
      f.pos.x += (tx - f.pos.x) * k; f.pos.y += (ty - f.pos.y) * k;
      f.vel.set((f.pos.x - ox) / dt, (f.pos.y - oy) / dt);
      f.obj.rotation.z = f.baseRot + THREE.MathUtils.clamp(-f.vel.x * 0.05, -0.6, 0.6);
    } else if (f.state === 'fly') {
      f.vel.y -= T.GRAVITY * dt; f.pos.addScaledVector(f.vel, dt); f.obj.rotation.z += f.spin * dt;
      if (Math.abs(f.pos.x) > T.WALL_X) { f.pos.x = Math.sign(f.pos.x) * T.WALL_X; f.vel.x *= -0.6; sThud(2); }
      if (f.pos.y < floor) {
        f.pos.y = floor;
        if (Math.abs(f.vel.y) > 1.2) { sThud(Math.abs(f.vel.y)); f.popV -= Math.abs(f.vel.y) * 0.8; }
        f.vel.y = -f.vel.y * T.BOUNCE; f.vel.x *= 0.72; f.spin *= 0.5;
        if (Math.abs(f.vel.y) < 1 && Math.abs(f.vel.x) < 0.4) { f.vel.set(0, 0); f.rest += dt; }
      }
      if (f.rest > 0) { f.rest += dt; if (f.rest > 1.1) { f.state = 'back'; f.backT = 0; f.from = f.pos.clone(); } }
    } else if (f.state === 'back') {                   // 제자리로 폴짝
      f.backT = Math.min(1, f.backT + dt * 2.4); const t = f.backT, e = t * t * (3 - 2 * t);
      f.pos.lerpVectors(f.from, f.home, e); f.pos.y += Math.sin(t * Math.PI) * 0.7;
      f.obj.rotation.z = f.baseRot + (1 - e) * (f.obj.rotation.z - f.baseRot);
      if (t >= 1) { f.state = 'home'; f.obj.rotation.z = f.baseRot; f.popV -= 3; }
    } else if (f.state === 'home') {
      f.wig = Math.max(0, f.wig - dt); f.obj.rotation.z = f.baseRot + Math.sin(clock * 22) * 0.18 * Math.min(1, f.wig * 2);
    }
    [f.pop, f.popV] = spring(f.pop, f.popV, 1, 260, 16, dt);
    const sc = Math.max(0.01, f.pop) * (f.suck ? 0.35 : 1);
    f.obj.scale.set(sc * (2 - Math.min(1.4, f.pop)), sc, sc);
    const mw = mouthWorld();
    if (f.suck) f.obj.position.lerp(mw, Math.min(1, dt * 30)); else f.obj.position.set(f.pos.x, f.pos.y, T.PLANE_Z);
    if (f.state === 'held' || f.state === 'fly') {
      const d = Math.hypot(f.pos.x - mw.x, f.pos.y - mw.y);
      if (d < nearD) { nearD = d; near = f; }
      if (d < T.EAT_R && st.mood !== 'sour') { if (hand.food === f) hand.food = null; eat(f); }
    }
  }

  // 몬스터: 눈은 가까운 음식을 따라가고, 다가오면 입을 벌리고 몸을 기울인다
  if (near) {
    st.lookT.set(THREE.MathUtils.clamp(near.pos.x * 0.35, -1, 1), THREE.MathUtils.clamp((near.pos.y - 2.2) * 0.5, -1, 1));
    if (!st.busy) {
      const want = THREE.MathUtils.clamp(1 - (nearD - T.EAT_R) / (T.WANT_R - T.EAT_R), 0, 1);
      st.openT = 0.12 + want * 0.85; st.armUpT = want > 0.3 ? 0.7 : 0; st.wide = want * 0.6;
    }
    st.leanV += (THREE.MathUtils.clamp(near.pos.x * 0.12, -0.35, 0.35) - st.lean) * 30 * dt;
  } else {
    if (!st.busy && st.mood === 'idle') { st.openT = 0.12; st.armUpT = 0; st.wide = 0; }
    st.lookT.multiplyScalar(1 - Math.min(1, dt * 2));
    if (!st.busy && clock - st.lastTouch > idleAt) {   // 심심하면 배가 꼬르륵, 음식 하나가 까딱
      st.lastTouch = clock; idleAt = 7 + Math.random() * 4;
      const f = foods.filter(x => x.state === 'home')[Math.floor(Math.random() * 6)];
      tone(70, 0.5, 'sawtooth', 0.08, 0, 25); kick(-2);
      if (f) { st.lookT.set(THREE.MathUtils.clamp(f.home.x * 0.35, -1, 1), -0.9); st.openT = 0.45; f.wig = 1; setTimeout(() => { if (!st.busy && !near) st.openT = 0.12; }, 900); }
    }
  }
  [st.squash, st.squashV] = spring(st.squash, st.squashV, 1, 190, 9, dt);
  [st.lean, st.leanV] = spring(st.lean, st.leanV, 0, 60, 9, dt);
  st.hopV -= 16 * dt; st.hop += st.hopV * dt;
  if (st.hop < 0) { if (st.hopV < -1.5) { kick(st.hopV * 0.9); sThud(-st.hopV); } st.hop = 0; st.hopV = 0; }
  const ease = Math.min(1, dt * 14);
  st.open += (st.openT - st.open) * Math.min(1, dt * 20);
  st.size += (st.sizeT - st.size) * Math.min(1, dt * 5);
  st.armUp += (st.armUpT - st.armUp) * ease;
  st.look.lerp(st.lookT, Math.min(1, dt * 10));
  st.tint.lerp(st.tintT, Math.min(1, dt * 5)); bodyMat.color.copy(st.tint);
  st.blink -= dt; let lid = st.eyeT;
  if (st.blink < 0.12) lid = Math.min(lid, 0.08); if (st.blink < 0) st.blink = 1.5 + Math.random() * 3;
  st.eye += (lid - st.eye) * Math.min(1, dt * 28);

  const breath = 1 + Math.sin(clock * 2.2) * 0.012, sq = THREE.MathUtils.clamp(st.squash, 0.6, 1.5) * breath, wide = 1 / Math.sqrt(sq);
  const shx = st.shiver ? Math.sin(clock * 70) * 0.035 * st.shiver : 0;
  M.root.position.set(shx, 0.35 + st.hop, 0);
  M.root.scale.set(st.size * wide, st.size * sq, st.size * wide);
  M.root.rotation.z = -st.lean * 0.5; M.root.rotation.x = st.open > 0.6 && near ? 0.08 : 0;
  M.eyes.forEach((e, i) => {
    e.scale.set(1 + st.wide * 0.18, Math.max(0.05, st.eye) * (1 + st.wide * 0.18), 1);
    M.pupils[i].position.set(st.look.x * 0.13, st.look.y * 0.12, 0.24);
    M.pupils[i].scale.setScalar(st.mood === 'hot' ? 0.6 : 1);
  });
  M.mouth.scale.set(0.75 + st.open * 0.35, 0.06 + st.open * 0.95, 0.3);
  M.tongue.visible = st.open > 0.45;
  M.arms.forEach((a, i) => { const s = i ? 1 : -1; a.position.y = -0.25 + st.armUp * 0.75 + Math.sin(clock * 9 + i) * 0.05 * st.armUp; a.position.x = s * (1.32 - st.armUp * 0.12); });
  M.cheeks.forEach(c => { c.material.opacity = st.mood === 'happy' ? 0.9 : 0.5; });

  // 반짝이
  for (let i = bits.length - 1; i >= 0; i--) {
    const b = bits[i]; b.life += dt; const t = b.life / b.max;
    if (t >= 1) { scene.remove(b.m); b.m.material.dispose(); bits.splice(i, 1); continue; }
    b.vy += b.g * dt; b.m.position.x += b.vx * dt; b.m.position.y += b.vy * dt; if (b.vz) b.m.position.z += b.vz * dt;
    b.m.scale.setScalar((b.m.userData.s || (b.m.userData.s = b.m.scale.x)) * (1 + (b.grow - 1) * t)); b.m.material.opacity = 1 - t * t;
  }
  // 맛 한마디는 몬스터 머리 위에
  const hw = headWorld().project(camera);
  wordEl.style.left = (hw.x * 0.5 + 0.5) * innerWidth + 'px';
  wordEl.style.top = Math.max(60, (-hw.y * 0.5 + 0.5) * innerHeight - 40) + 'px';

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
function resize() {
  const w = innerWidth, h = innerHeight, a = w / h;
  renderer.setSize(w, h, false); camera.aspect = a;
  const d = a >= 1.45 ? 9.2 : 9.2 * 1.45 / a;            // 좁은 화면에서는 물러나서 음식 여섯이 다 보이게
  camera.position.set(0, 2.9, d); camera.lookAt(0, 1.75, 0); camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();
requestAnimationFrame(frame);

window.__monster = { st, foods, proj: (x, y) => { const v = new THREE.Vector3(x, y, T.PLANE_Z).project(camera); return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight }; }, feed: k => { const f = foods.find(x => x.kind === k); f.pos.set(T.MOUTH.x, T.MOUTH.y); return eat(f); }, poke, T };   // 검사용
