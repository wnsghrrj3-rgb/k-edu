// K-MOTION 거인 나라 탈출 · 맛보기
// 거인의 식탁 위를 달려 탈출한다. 위에서 떨어지는 것(그림자가 먼저 생김)과 앞에서 굴러오는 것을 몸으로 피한다.
// 몸 좌우 = 줄 바꾸기, 두 손 번쩍 = 뛰기. 단계가 오를수록 빨라지고 섞여 나온다.
// 그림: 블렌더(bpy)로 만든 물건 GLB(구운 질감) + 식탁 나뭇결 굽기 + 거인 부엌 파노라마(Cycles). 생성기 tools/giant_assets.py
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Character } from '../run/js/scene.js';
import { AudioManager } from '../run/js/audio.js';

const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
const Q = new URLSearchParams(location.search);
const DEV = Q.has('dev');
const LOW = Q.get('q') === 'low' || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 && Q.get('q') !== 'high');
const LANES = [-2.3, 0, 2.3];
const LEVEL_LEN = 230;           // 단계마다 달리는 거리
const LEVELS = [                  // 단계가 오를수록: 빠르게 · 촘촘하게 · 반응 시간 짧게 · 새 위험 추가
  { speed: 6.5, gap: 17, react: 2.7, roll: 5.0, pool: ['rollSmall', 'fallSmall'] },
  { speed: 7.6, gap: 15, react: 2.4, roll: 6.0, pool: ['rollSmall', 'fallSmall', 'rollBig', 'fallMid', 'coin', 'follow', 'follow'] },
  { speed: 8.6, gap: 13.5, react: 2.15, roll: 7.0, chase: .42, pool: ['rollSmall', 'rollBig', 'fallMid', 'fallBig', 'coin', 'cutlery', 'double', 'follow', 'zig', 'weave', 'milk'] },
  { speed: 9.6, gap: 12, react: 1.95, roll: 7.5, chase: .55, pool: ['rollBig', 'fallMid', 'fallBig', 'coin', 'cutlery', 'double', 'peaRow', 'cross', 'cookieRoll', 'follow', 'zig', 'weave', 'milk'] },
  { speed: 10.6, gap: 11, react: 1.8, roll: 8.0, chase: .7, pool: ['rollBig', 'fallBig', 'coin', 'cutlery', 'double', 'peaRow', 'cross', 'cookieRoll', 'combo', 'follow', 'zig', 'zig', 'weave', 'milk'] },
];
// 선생님 설정: 난이도 · 시작 단계 · 하트 · 수박 추격 (기기에 기억)
const DIFF = {
  easy0: { name: '아주 쉬움', speed: .7, gap: 1.5, react: .8, chase: .45 },
  easy:  { name: '쉬움', speed: .85, gap: 1.22, react: .4, chase: .7 },
  normal:{ name: '보통', speed: 1, gap: 1, react: 0, chase: 1 },
  hard:  { name: '어려움', speed: 1.15, gap: .88, react: -.15, chase: 1.25 },
};
const SET = Object.assign({ players: 1, diff: 'normal', start: 1, hearts: 3, chase: true }, (() => { try { return JSON.parse(localStorage.getItem('kmgiant.set') || '{}'); } catch (e) { return {}; } })());
SET.hearts = 3; // 목숨은 늘 3개(한 판 전체)
function saveSet(){ try { localStorage.setItem('kmgiant.set', JSON.stringify(SET)); } catch (e) {} }
function eff(L){ const b = LEVELS[L], d = DIFF[SET.diff] || DIFF.normal;
  return Object.assign({}, b, { speed: b.speed * d.speed, gap: b.gap * d.gap, react: Math.max(1.4, b.react + d.react), roll: b.roll * d.speed, chase: SET.chase && b.chase ? b.chase * d.chase : 0 }); }
const TIPS = [
  ['1단계', '그림자가 생기면 옆으로 피해요'],
  ['2단계', '그림자가 나를 따라와요! 계속 움직여요'],
  ['3단계', '뒤에서 수박이 굴러와요! 잘 피하면 멀어져요'],
  ['4단계', '옆으로 굴러오는 구슬, 우유 물결 조심!'],
  ['마지막 단계', '문이 보여요, 끝까지 달려요!'],
];

// ───────── 소리: 숲 소리 대신 거인 부엌(벽시계 째깍·냉장고 웅웅) + 떨어짐·쿵·쨍그랑
class GiantAudio extends AudioManager {
  whoosh(){ if (!this.ac) return; this.noise(.7, { g: .09, hp: 400, lp: 2600, q: 3 }); this.tone(900, .6, { type: 'sine', g: .04, slide: 300 }); }
  thud(big){ this.noise(big ? .5 : .25, { g: big ? .35 : .18, hp: 40, lp: big ? 380 : 900 }); this.tone(big ? 90 : 220, big ? .45 : .18, { type: 'sine', g: big ? .3 : .14, slide: big ? 40 : 110 }); }
  clink(){ [2100, 2830, 3540].forEach((f, i) => this.tone(f, .5 + i * .1, { type: 'sine', g: .05, delay: i * .03 })); this.tone(1240, .25, { type: 'triangle', g: .05, delay: .09 }); }
  bounce(){ this.tone(260, .12, { type: 'triangle', g: .1, slide: 520 }); }
  roll(){ this.noise(.9, { g: .07, hp: 60, lp: 320, q: 4 }); }
  boom(){ this.tone(48, .9, { type: 'sine', g: .45, slide: 28 }); this.noise(.6, { g: .25, hp: 20, lp: 160 }); }
  chime(type){ const f = type === 'heart' ? [660, 880, 1320] : type === 'candy' ? [784, 988, 1175] : [1047, 1319, 1568, 2093]; f.forEach((x, i) => this.tone(x, .35, { type: 'triangle', g: .09, delay: i * .06 })); }
  heart(k){ this.tone(62, .16, { type: 'sine', g: .22 + k * .2, slide: 45 }); this.tone(58, .14, { type: 'sine', g: .16 + k * .15, slide: 42, delay: .2 }); }
  glug(){ [0, .13, .26, .39].forEach((d, i) => this.tone(330 - i * 40, .12, { type: 'sine', g: .08, slide: 180 - i * 20, delay: d })); this.noise(.8, { g: .05, hp: 300, lp: 1200, delay: .1 }); }
  sting(){ [0, .09, .18].forEach((d, i) => this.tone([392, 466, 554][i], .35, { type: 'sawtooth', g: .05, delay: d })); }
  rumbleOn(){ if (!this.ac || this.rmb) return; const n = this.ac.sampleRate * 2 | 0, b = this.ac.createBuffer(1, n, this.ac.sampleRate), d = b.getChannelData(0); let v = 0; for (let i = 0; i < n; i++) { v = v * .985 + (Math.random() * 2 - 1) * .015; d[i] = v * 8; }
    const src = this.ac.createBufferSource(); src.buffer = b; src.loop = true; const lp = this.ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180; const g = this.ac.createGain(); g.gain.value = 0;
    const o = this.ac.createOscillator(); o.frequency.value = 38; const og = this.ac.createGain(); og.gain.value = 0; o.connect(og).connect(this.master); o.start();
    src.connect(lp).connect(g).connect(this.master); src.start(); this.rmb = { src, g, o, og }; }
  rumbleLevel(k){ if (!this.rmb) return; const t = this.ac.currentTime; this.rmb.g.gain.setTargetAtTime(k * .5, t, .1); this.rmb.og.gain.setTargetAtTime(k * .18, t, .1); }
  rumbleOff(){ if (!this.rmb) return; const r = this.rmb; r.g.gain.setTargetAtTime(0, this.ac.currentTime, .3); r.og.gain.setTargetAtTime(0, this.ac.currentTime, .3); setTimeout(() => { try { r.src.stop(); r.o.stop(); } catch (e) {} }, 1500); this.rmb = null; }
  startAmbient(){ if (!this.ac || this.ambient) return;
    const o = this.ac.createOscillator(), g = this.ac.createGain(), lp = this.ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 55; lp.type = 'lowpass'; lp.frequency.value = 140; g.gain.value = .025; o.connect(lp).connect(g).connect(this.master); o.start();
    let k = 0; const tick = setInterval(() => { if (!this.muted) this.tone(k++ % 2 ? 1900 : 1600, .04, { type: 'square', g: .025 }); }, 1000);
    this.ambient = { o, g, tick }; }
  stopAmbient(){ if (!this.ambient) return; clearInterval(this.ambient.tick); try { this.ambient.o.stop(); } catch (e) {} this.ambient = null; }
}
function say(text){ try { const s = window.speechSynthesis; if (!s) return; s.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = 1.02; u.pitch = 1.1; const v = s.getVoices().find(v => /ko/i.test(v.lang)); if (v) u.voice = v; s.speak(u); } catch (e) {} }

// ───────── 장면
const renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: !LOW, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(LOW ? 1 : 1.5, devicePixelRatio));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const FOG = new THREE.Color(0xc9b49a); scene.fog = new THREE.Fog(FOG, 70, 230);
const camera = new THREE.PerspectiveCamera(60, 16 / 9, .1, 600);
const camPos = new THREE.Vector3(0, 2.6, 6.5), camLook = new THREE.Vector3(0, 1.2, -10);
let shake = 0;
function resize(){ const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 1.2 ? 72 : 60; camera.updateProjectionMatrix(); }
resize(); addEventListener('resize', resize);

// 빛: 앞쪽 창에서 들어오는 햇빛(역광) + 실내 반사광
const hemi = new THREE.HemisphereLight(0xfff1dc, 0x8a6446, .5); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe6c4, 4.6); sun.position.set(-8, 22, -18); sun.castShadow = true;
sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048); Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 34, bottom: -34, near: 1, far: 110 });
sun.shadow.bias = -.0006; sun.shadow.normalBias = .03; scene.add(sun); scene.add(sun.target);

const loader = new GLTFLoader(), tl = new THREE.TextureLoader();
const loadTex = (url, srgb) => new Promise(res => tl.load(url, t => { if (srgb) t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, () => res(null)));

// 식탁 상판: 구운 나뭇결(36×60 한 장)을 길이 방향으로 거울 반복
let table = null;
async function buildTable(){
  const [c, n, r] = await Promise.all([loadTex('./assets/tex/table_color.jpg', true), loadTex('./assets/tex/table_normal.jpg'), loadTex('./assets/tex/table_rough.jpg')]);
  const REP = 8, W = 36, Lh = 60;
  for (const t of [c, n, r]) if (t) { t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.MirroredRepeatWrapping; t.repeat.set(1, REP); t.anisotropy = renderer.capabilities.getMaxAnisotropy(); }
  const mat = new THREE.MeshStandardMaterial({ map: c, normalMap: n, roughnessMap: r, roughness: 1, metalness: 0, envMapIntensity: .7 });
  if (n) mat.normalScale.set(.8, .8);
  table = new THREE.Group();
  const top = new THREE.Mesh(new THREE.PlaneGeometry(W, Lh * REP), mat); top.rotation.x = -Math.PI / 2; top.receiveShadow = true; table.add(top);
  const apron = new THREE.Mesh(new THREE.BoxGeometry(W + .6, 1.6, Lh * REP), new THREE.MeshStandardMaterial({ color: 0x6e4527, roughness: .6 })); apron.position.y = -.82; table.add(apron);
  scene.add(table);
}

// 거인 부엌 파노라마 → 배경 + 반사(환경광)
async function buildBackground(){
  const t = await loadTex('./assets/tex/kitchen_pano.jpg', true); if (!t) { scene.background = FOG; return; }
  t.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = t; scene.environment = t; scene.backgroundBlurriness = .04; scene.environmentIntensity = .7; scene.backgroundIntensity = .85;
  // 파노라마 가운데(블렌더 카메라 +y = 창 쪽)가 달리는 방향(-z)에 오도록 돌림
  const ry = Number(Q.get('bgrot') || Math.PI / 2); scene.backgroundRotation.set(0, ry, 0); scene.environmentRotation.set(0, ry, 0);
}

// 물건 원본(GLB) → 복제해 쓰는 틀
const PROTO = {};
async function loadProps(){
  const g = await new Promise((res, rej) => loader.load('./assets/props.glb?v=3', res, undefined, rej));
  for (const ch of [...g.scene.children]) {
    ch.position.set(0, 0, 0); ch.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material) { o.material.envMapIntensity = 1; if (o.material.transmission > 0) { o.material.transparent = true; o.material.opacity = o.material.name === 'jelly' ? .82 : .22; o.material.depthWrite = false; o.material.transmission = 0; o.material.roughness = .05; o.material.metalness = .1; } } } });
    const box = new THREE.Box3().setFromObject(ch), size = box.getSize(new THREE.Vector3());
    PROTO[ch.name] = { obj: ch, size };
  }
}
function clone(name){ const p = PROTO[name]; return p ? p.obj.clone(true) : new THREE.Mesh(new THREE.SphereGeometry(.5), new THREE.MeshStandardMaterial({ color: 0xff00ff })); }
const sizeOf = name => (PROTO[name] && PROTO[name].size) || new THREE.Vector3(1, 1, 1);

// ───────── 식탁 풍경(옆): 접시·컵·빵·치즈·잼·소금통·수저·냅킨. 지나가면 앞으로 다시 놓음
const scenery = [];
const SCENE_SET = ['plate', 'mug', 'glass', 'bread', 'cheese', 'jar', 'shaker', 'napkin', 'fork', 'spoon', 'knife', 'mug', 'plate', 'apple', 'orange'];
function placeScenery(it, z){
  const side = Math.random() < .5 ? -1 : 1, near = Math.random() < .35;
  it.x = side * (near ? rnd(5.2, 7.5) : rnd(8, 16.5)); it.z = z; it.ry = rnd(0, Math.PI * 2);
  const s = sizeOf(it.name); if (near && (s.x > 6 || s.z > 6)) it.x = side * (4.4 + Math.max(s.x, s.z) / 2 + rnd(0, 1.5));
  if (Math.abs(it.x) + Math.max(s.x, s.z) / 2 > 17.6) it.x = side * (17.4 - Math.max(s.x, s.z) / 2);
  it.obj.position.set(it.x, 0, z); it.obj.rotation.y = it.ry; it.hop = 0;
}
function buildScenery(){
  for (let i = 0; i < (LOW ? 26 : 38); i++) { const name = SCENE_SET[i % SCENE_SET.length]; const obj = clone(name); scene.add(obj); const it = { name, obj }; placeScenery(it, -i * 9 - rnd(0, 6) + 10); scenery.push(it); }
}
// 부스러기(크기 단서): 빵가루·설탕 알갱이 인스턴스
let crumbs = null; const crumbData = [];
function buildCrumbs(){
  const n = LOW ? 160 : 320, geo = new THREE.DodecahedronGeometry(.07, 0), mat = new THREE.MeshStandardMaterial({ color: 0xd9b27a, roughness: .9 });
  crumbs = new THREE.InstancedMesh(geo, mat, n); crumbs.receiveShadow = true; crumbs.castShadow = !LOW; crumbs.frustumCulled = false; scene.add(crumbs);
  const c = new THREE.Color(), cols = [0xd9b27a, 0xb98446, 0xf5f0e6, 0x8a5a2b];
  for (let i = 0; i < n; i++) { crumbData.push({ x: rnd(-17, 17), z: rnd(-200, 20), s: rnd(.4, 2.2), r: rnd(0, 6) }); crumbs.setColorAt(i, c.setHex(pick(cols))); }
  updCrumbs(0, true);
}
const dummy = new THREE.Object3D();
function updCrumbs(pz, all){ let dirty = all; crumbData.forEach((d, i) => { if (all || d.z > pz + 20) { if (!all) d.z -= 220; d.x = rnd(-17, 17); dummy.position.set(d.x, .03 * d.s, d.z); dummy.rotation.set(d.r, d.r * 2, 0); dummy.scale.setScalar(d.s); dummy.updateMatrix(); crumbs.setMatrixAt(i, dummy.matrix); dirty = true; } }); if (dirty) crumbs.instanceMatrix.needsUpdate = true; }

// ───────── 그림자 표시(떨어질 곳)
function radialTex(){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.6, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); }
const SHADOW_TEX = radialTex();
function makeMarker(){ const g = new THREE.Group();
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false, opacity: 0 })); sh.rotation.x = -Math.PI / 2; sh.position.y = .02; g.add(sh);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.74, 1, 48), new THREE.MeshBasicMaterial({ color: 0xff3b2f, transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide, fog: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = .03; g.add(ring);
  g.userData = { sh, ring }; scene.add(g); return g; }

// 다가오는 것 위에 뜨는 표지: 🙌 뛰어넘기 · ↔️ 옆으로 피하기 (1학년이 판단하기 쉽게)
function emojiTex(e, ring){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = ring; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.fill(); g.font = '64px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 64, 70); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const TAG_JUMP = new THREE.SpriteMaterial({ map: emojiTex('🙌', '#3ecf6b'), depthTest: false, transparent: true, fog: false });
const TAG_SIDE = new THREE.SpriteMaterial({ map: emojiTex('↔️', '#ff8a3d'), depthTest: false, transparent: true, fog: false });

// ───────── 장애물
// kind: fall(위에서) · roll(앞에서 굴러옴) · cross(옆에서 가로질러)
// jump=true 이면 뛰어넘을 수 있음(작은 것). 큰 것은 줄을 바꿔야 함.
const obs = [];
function spawnObj(name, opt){
  const s = sizeOf(name), root = new THREE.Group(), pivot = new THREE.Group(), mesh = clone(name);
  root.add(pivot); pivot.add(mesh);
  const o = Object.assign({ name, root, pivot, mesh, x: 0, z: 0, y: 0, vx: 0, vz: 0, hw: s.x / 2, hd: s.z / 2, h: s.y, r: s.y / 2, jump: false, passed: false, hit: false, kind: 'roll', spin: 0 }, opt);
  if (o.edge) { // 동전·쿠키: 세워서 굴림(납작한 원판을 세움)
    mesh.rotation.z = Math.PI / 2; const d = Math.max(s.x, s.z); o.r = d / 2; o.h = d; o.hw = s.y / 2 + .1; o.hd = d / 2; mesh.position.set(s.y / 2, -o.r, 0);
    pivot.position.y = o.r; o.spinAxis = 'x';
  } else if (o.across) { // 수저: 줄 셋을 가로지르게 눕힘 → 뛰어넘기
    mesh.rotation.y = Math.PI / 2; o.hw = s.z / 2; o.hd = s.x / 2 + .15; o.h = s.y; pivot.position.y = 0;
  } else { pivot.position.y = o.r; mesh.position.y = -o.r; o.spinAxis = o.kind === 'cross' ? 'z' : 'x'; }
  o.tag = new THREE.Sprite((o.jump ? TAG_JUMP : TAG_SIDE).clone()); o.tag.scale.setScalar(1.5); o.tag.material.opacity = 0; o.tag.renderOrder = 10; scene.add(o.tag);
  scene.add(root); obs.push(o); return o;
}
function spawnFall(name, lane, pz, speed, react, opt = {}){
  const o = spawnObj(name, Object.assign({ kind: 'fall', jump: !!opt.jump }, opt));
  const t = react, dist = speed * t; o.lane = lane; o.x = opt.across ? 0 : LANES[lane]; o.z = pz - dist;
  o.fallT = 0; o.fallDur = Math.min(1.1, t * .55); o.wait = Math.max(.3, t - o.fallDur - .35); /* 도착 0.35초 전에 쿵 — 그림자 보고 미리 비켜야 함 */ o.y = 34; o.vy = 0; o.landed = false; o.warnT = t;
  o.marker = makeMarker(); const ms = opt.across ? 1 : Math.max(o.hw, o.hd) * 2.4 + .8; o.marker.scale.set(opt.across ? 1 : ms, 1, opt.across ? 1 : ms);
  if (opt.across) { o.marker.userData.sh.scale.set(o.hw * 2.2, o.hd * 3, 1); o.marker.userData.ring.visible = false; }
  o.marker.position.set(o.x, 0, o.z); o.root.visible = false;
  if (opt.spinFall) o.spinFall = rnd(-3, 3);
  return o;
}
function spawnRoll(name, lane, pz, rollSpeed, opt = {}){
  const o = spawnObj(name, Object.assign({ kind: 'roll', jump: !!opt.jump }, opt));
  o.lane = lane; o.x = LANES[lane]; o.z = pz - 78; o.vz = rollSpeed; o.y = 0; return o;
}
function spawnCross(name, pz, speed, react, rollSpeed){
  const o = spawnObj(name, { kind: 'cross', jump: true }); const dir = Math.random() < .5 ? -1 : 1;
  const t = react + .6, zMeet = pz - speed * t; // t 초 뒤 가운데 줄(0)을 지나도록 출발점 계산
  o.vx = -dir * 3.2; o.x = dir * 3.2 * t; o.z = zMeet; o.vz = 0; return o;
}
// 우유 물결: 줄 셋을 덮는 하얀 물결이 밀려옴 → 두 손 번쩍
const MILK_MAT = new THREE.MeshPhysicalMaterial({ color: 0xfbf8f0, roughness: .12, clearcoat: 1, clearcoatRoughness: .08, sheen: .3 });
function spawnMilk(pz, rollSpeed){
  const root = new THREE.Group(), pivot = new THREE.Group(); root.add(pivot);
  const W = 9.5; // 쏟아진 우유: 울퉁불퉁한 가장자리의 얇은 웅덩이 + 앞쪽에 말려 오는 물마루
  const sh = new THREE.Shape(); const N = 40;
  for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, rx = W / 2 + Math.sin(a * 5) * .35, rz = 2.6 + Math.sin(a * 7 + 1) * .4; const x = Math.cos(a) * rx, z = Math.sin(a) * rz; i ? sh.lineTo(x, z) : sh.moveTo(x, z); }
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .1, bevelEnabled: true, bevelSize: .12, bevelThickness: .08, bevelSegments: 3 }), MILK_MAT); body.rotation.x = Math.PI / 2; body.position.set(0, .2, -1.6); pivot.add(body);
  for (let i = 0; i < 15; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(rnd(.32, .55), 16, 12), MILK_MAT); b.scale.set(1.6, .8, 1); b.position.set(-W / 2 + .5 + i * (W - 1) / 14, .3, .7 + rnd(-.25, .25)); pivot.add(b); }
  for (let i = 0; i < 10; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(rnd(.08, .16), 8, 6), MILK_MAT); d.position.set(rnd(-W / 2, W / 2), rnd(.6, 1.1), rnd(.6, 1.2)); d.userData.drop = rnd(0, 6); pivot.add(d); }
  pivot.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  const o = { name: 'milk', root, pivot, mesh: pivot, kind: 'roll', x: 0, z: pz - 78, y: 0, vx: 0, vz: rollSpeed * 1.05, hw: W / 2, hd: .9, h: .55, r: 0, jump: true, passed: false, hit: false, liquid: true };
  o.tag = new THREE.Sprite(TAG_JUMP.clone()); o.tag.scale.setScalar(1.5); o.tag.material.opacity = 0; o.tag.renderOrder = 10; scene.add(o.tag);
  scene.add(root); obs.push(o); audio.glug(); pop('우유가 쏟아졌어요!', 'gold'); return o;
}
// 예약 생성(게임 시간 기준) — 그림자가 따라오기·지그재그
function schedule(delay, fn){ game.queue.push({ at: game.time + delay, fn }); }
function clearObs(){ game.queue = []; clearItems(); for (const o of obs) { scene.remove(o.root); if (o.marker) scene.remove(o.marker); if (o.tag) scene.remove(o.tag); } obs.length = 0; }

const SMALL_ROLL = ['pea', 'grape', 'marble'], SMALL_FALL = ['sugar', 'button'], MID_FALL = ['tomato', 'cookie'], BIG_FALL = ['apple', 'orange'], BIG_ROLL = ['orange', 'apple'];
function otherLanes(l){ return [0, 1, 2].filter(x => x !== l); }
function pattern(kind, L, pz){
  const lane = Math.random() * 3 | 0, lv = eff(L);
  switch (kind) {
    case 'rollSmall': spawnRoll(pick(SMALL_ROLL), lane, pz, lv.roll, { jump: true }); break;
    case 'fallSmall': spawnFall(pick(SMALL_FALL), lane, pz, game.speed, lv.react, { jump: true, spinFall: true }); break;
    case 'rollBig': spawnRoll(pick(BIG_ROLL), lane, pz, lv.roll * .85); break;
    case 'fallMid': spawnFall(pick(MID_FALL), lane, pz, game.speed, lv.react, { spinFall: true }); break;
    case 'fallBig': spawnFall(pick(BIG_FALL), lane, pz, game.speed, lv.react, { spinFall: true, big: true }); break;
    case 'coin': spawnRoll('coin', lane, pz, lv.roll * 1.1, { edge: true }); break;
    case 'cookieRoll': spawnRoll('cookie', lane, pz, lv.roll * .9, { edge: true }); break;
    case 'cutlery': spawnFall(pick(['spoon', 'fork', 'knife']), 1, pz, game.speed, lv.react + .2, { across: true, jump: true, metal: true }); break;
    case 'double': { const [a, b] = otherLanes(lane); spawnFall(pick(MID_FALL), a, pz, game.speed, lv.react, { spinFall: true }); spawnFall(pick(BIG_FALL), b, pz, game.speed, lv.react, { spinFall: true, big: true }); break; }
    case 'peaRow': for (let l = 0; l < 3; l++) { const o = spawnRoll(l === 1 ? 'grape' : 'pea', l, pz, lv.roll, { jump: true }); o.z -= l === 1 ? 0 : .3; } break;
    case 'cross': spawnCross('marble', pz, game.speed, lv.react, lv.roll); break;
    case 'follow': // 그림자가 나를 따라온다: 지금 서 있는 줄에 연달아 떨어짐
      pop('그림자가 따라와요!', 'red'); audio.sting();
      for (let k = 0; k < 3; k++) schedule(k * 1.45, () => spawnFall(pick(MID_FALL), player.lane, player.z, game.speed, 1.6 + (L < 2 ? .25 : 0), { spinFall: true }));
      break;
    case 'zig': { // 두 줄을 막고 한 줄만 열림 — 열린 줄이 왼쪽·오른쪽 끝을 오감
      let open = player.lane === 0 ? 2 : 0;
      for (let k = 0; k < 3; k++) { const op = open; schedule(k * 1.95, () => { for (const l of [0, 1, 2]) if (l !== op) spawnFall(pick(MID_FALL), l, player.z, game.speed, lv.react + .25, { spinFall: true }); }); open = 2 - open; }
      break; }
    case 'weave': { const o = spawnRoll(pick(BIG_ROLL), lane, pz, lv.roll * .8); o.weave = true; break; }
    case 'milk': spawnMilk(pz, lv.roll); break;
    case 'combo': { // 굴러오는 큰 것 + 다른 줄에 떨어지는 것: 남은 한 줄을 찾아야 함
      const [a, b] = otherLanes(lane); spawnRoll(pick(BIG_ROLL), a, pz, lv.roll * .8); spawnFall(pick(MID_FALL), b, pz, game.speed, lv.react + .5, { spinFall: true }); break; }
  }
}

// ───────── 상반신 전용 동작 인식 (한 명 · 두 명): 앉아서 어깨까지만 보여도 됨
// · 줄 바꾸기 = 어깨 가운데가 옆으로 기울어짐 · 뛰기 = 두 손 번쩍(손이 화면 위로 나가도 팔꿈치가 어깨 위면 인정) · 손 쭉 뻗기 = 손목이 어깨 높이에서 옆으로
// · 두 명: 카메라 화면 왼쪽 자리 = 1번, 오른쪽 자리 = 2번 (공용 엔진 duo)
class GiantMotion {
  constructor(n, cb){ this.n = n; this.cb = cb; this.active = false; this.paused = false; this.calib = null; this.cfg = { laneIn: .38, laneOut: .18, holdMs: 80, lostMs: 900 };
    this.st = Array.from({ length: n }, () => ({ base: null, zone: 'center', cand: 'center', since: 0, lastMove: 0, armsWas: false, reach: null, lostSince: 0 }));
    this.km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['pose'], poseConf: .35, activity: 'run', duo: n === 2 });
    this.km.onFrame = f => this.frame(f); this.km.on('error', e => this.cb.onStatus('bad', e.message)); }
  async start(){ await this.km.start(); this.started = true; }
  stop(){ try { this.km.stop(); } catch (e) {} this.started = false; }
  calibrate(seconds, onProgress){ return new Promise(res => { this.st.forEach(s => s.base = null); this.calib = { need: seconds * 1000, acc: 0, last: 0, sum: this.st.map(() => ({ x: 0, y: 0, sw: 0 })), n: 0, onProgress, res }; }); }
  read(p, f){ if (!p) return null; const L = p[11], R = p[12]; if (Math.min(L.v, R.v) < .45) return null;
    const sh = { x: (L.x + R.x) / 2, y: (L.y + R.y) / 2 }, sw = Math.max(30, Math.abs(L.x - R.x));
    const wl = p[15], wr = p[16], el = p[13], er = p[14];
    const wristUp = w => w.v > .35 && w.y < sh.y - sw * .3, elbowUp = e => e.v > .35 && e.y < sh.y - sw * .05, offTop = w => w.v < .35 || w.y < f.H * .04;
    const up = (w, e) => wristUp(w) || (elbowUp(e) && offTop(w)); const armsUp = up(wl, el) && up(wr, er);
    let reach = null; if (!armsUp) for (const w of [wl, wr]) { if (w.v < .4 || Math.abs(w.y - sh.y) > sw * 1.1) continue; if (w.x < sh.x - sw * 1.1) reach = 'left'; else if (w.x > sh.x + sw * 1.1) reach = 'right'; }
    return { sh, sw, armsUp, reach }; }
  frame(f){
    const km = this.km, ctx = f.ctx, now = f.t, poses = this.n === 2 ? (f.duo || [null, null]) : [f.pose];
    km.drawCamera(); const rs = poses.map(p => this.read(p, f)), COL = ['rgba(46,196,182,.95)', 'rgba(255,138,61,.95)'];
    if (this.n === 2) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(f.W / 2, 0); ctx.lineTo(f.W / 2, f.H); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center'; [0, 1].forEach(i => { ctx.fillStyle = COL[i]; ctx.fillText(i + 1, f.W * (i ? .75 : .25), 38); }); ctx.restore(); }
    poses.forEach((p, i) => { if (p) km.drawSkeleton(p, km.POSE_BONES, rs[i] ? COL[i] : 'rgba(255,90,95,.9)'); });
    const all = rs.every(Boolean), any = rs.some(Boolean);
    if (this.calib) { const c = this.calib; if (all) { const dt = c.last ? Math.min(100, now - c.last) : 0; c.acc += dt; rs.forEach((r, i) => { c.sum[i].x += r.sh.x; c.sum[i].y += r.sh.y; c.sum[i].sw += r.sw; }); c.n++; } c.last = now;
      c.onProgress(Math.min(1, c.acc / c.need), all, rs.map(Boolean));
      if (c.acc >= c.need) { this.st.forEach((s, i) => { s.base = { hx: c.sum[i].x / c.n, hy: c.sum[i].y / c.n, sw: c.sum[i].sw / c.n }; s.zone = s.cand = 'center'; s.armsWas = false; s.reach = null; }); this.calib = null; c.res(); }
      return; }
    // 아무도 안 보이면 잠깐 멈춤(둘이 할 땐 한 명만 보여도 계속)
    if (any) { this.lost = 0; if (this.paused) { this.paused = false; this.cb.onBack(); } } else { if (!this.lost) this.lost = now; if (this.active && !this.paused && now - this.lost > this.cfg.lostMs) { this.paused = true; this.cb.onLost(); } }
    this.cb.onStatus(all ? 'ok' : 'bad', all ? '보여요' : any ? '한 명이 안 보여요' : '안 보여요');
    if (!this.active) return;
    rs.forEach((r, i) => { const s = this.st[i]; if (!r || !s.base) { if (s.reach) { s.reach = null; this.cb.onReach(i, null); } return; }
      const dx = (r.sh.x - s.base.hx) / s.base.sw; let z = s.zone, C = this.cfg;
      if (z === 'center') { if (dx < -C.laneIn) z = 'left'; else if (dx > C.laneIn) z = 'right'; } else if (Math.abs(dx) < C.laneOut) z = 'center'; else if (z === 'left' && dx > C.laneIn) z = 'right'; else if (z === 'right' && dx < -C.laneIn) z = 'left';
      if (z !== s.cand) { s.cand = z; s.since = now; } else if (z !== s.zone && now - s.since >= C.holdMs) s.zone = z;
      const want = s.zone === 'left' ? 0 : s.zone === 'right' ? 2 : 1, lane = this.cb.getLane(i);
      if (want !== lane && now - s.lastMove > 160) { s.lastMove = now; this.cb.onMove(i, want < lane ? -1 : 1); }
      if (r.armsUp && !s.armsWas) this.cb.onJump(i); s.armsWas = r.armsUp;
      if (r.reach !== s.reach) { s.reach = r.reach; this.cb.onReach(i, r.reach); }
      if (DEV && i === 0) $('dev').textContent = `fps ${km.fps} dx ${dx.toFixed(2)} zone ${s.zone} arms ${r.armsUp} reach ${r.reach}`; });
  }
}

// ───────── 게임 상태
const audio = new GiantAudio();
// 플레이어: 한 명 또는 두 명. 둘이 할 땐 같은 식탁을 함께 달리고 점수·하트는 따로.
const P_COL = [0x2ec4b6, 0xff8a3d], P_CSS = ['#2ec4b6', '#ff8a3d'];
function numTex(n, col){ const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = col; g.beginPath(); g.arc(48, 48, 44, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 60px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, 48, 52); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function makePlayer(i){ const kid = new Character(); scene.add(kid.root);
  if (i) kid.root.traverse(o => { if (o.isMesh && o.material.color.getHex() === P_COL[0]) { o.material = o.material.clone(); o.material.color.setHex(P_COL[i]); } });
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: numTex(i + 1, P_CSS[i]), depthTest: false, transparent: true, fog: false })); tag.scale.setScalar(.55); tag.position.y = 2.25; tag.renderOrder = 12; kid.root.add(tag);
  return { i, kid, tag, on: i === 0, lane: 1, x: 0, y: 0, vy: 0, air: false, inv: 0, out: 0, lanePush: 0, reachSide: null, reachHold: 0, life: 3, score: 0, stars: 0, dodges: 0, hits: 0, combo: 0, maxCombo: 0 }; }
const players = [makePlayer(0), makePlayer(1)];
const act = () => players.filter(p => p.on), alive = () => { const a = players.filter(p => p.on && p.out <= 0); return a.length ? a : act(); }, two = () => players[1].on, ready = p => p.on && p.out <= 0;
// 화면·카메라·생성 기준이 되는 「무리」 위치(한 명이면 그 아이)
const player = { z: 0, stepT: 0,
  get x(){ const a = alive(); return a.reduce((s, p) => s + p.x, 0) / a.length; }, get y(){ return Math.max(...act().map(p => p.y)); },
  get lanePush(){ const a = alive(); return a.reduce((s, p) => s + p.lanePush, 0) / a.length; }, get lane(){ const a = act().filter(p => p.out <= 0); return (a.length ? pick(a) : players[0]).lane; },
  get air(){ return act().some(p => p.air); }, get inv(){ return Math.min(...act().map(p => p.inv)); } };
const game = { itemNext: 40, queue: [], time: 0, state: 'idle', level: 0, levelD: 0, speed: 6, nextSpawn: 30, boomT: 9, breather: 0, pauseReason: '' };
let motion = null, motionReady = false, calibrating = false, mode = localStorage.getItem('kmgiant.mode') || 'camera';

function move(p, d){ if (game.state !== 'play' || !ready(p)) return; const n = Math.max(0, Math.min(2, p.lane + d)); if (n !== p.lane) { p.lane = n; audio.lane(); } }
function jump(p){ if (game.state !== 'play' || !ready(p) || p.air) return; p.air = true; p.vy = 8.6; p.kid.set('jump'); audio.jump(); }
function reach(p, side, hold){ if (!p.on) return; p.reachSide = side; p.reachHold = side ? hold : 0; }
function togglePause(){ if (game.state === 'play') pause('manual'); else if (game.state === 'pause') resume(); }
// 키보드 — 혼자: ←→/A D · ↑/W/스페이스 뛰기 · Q E 손 뻗기 / 둘이: 1번 A D W Q E · 2번 ← → ↑ , .
addEventListener('keydown', e => { if (e.repeat) return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key, P1 = players[0], P2 = two() ? players[1] : players[0]; let used = true;
  if (k === 'a') move(P1, -1); else if (k === 'd') move(P1, 1); else if (k === 'w') jump(P1); else if (k === 'q') reach(P1, 'left', .6); else if (k === 'e') reach(P1, 'right', .6);
  else if (k === 'ArrowLeft') move(P2, -1); else if (k === 'ArrowRight') move(P2, 1); else if (k === 'ArrowUp') jump(P2); else if (k === ',') reach(P2, 'left', .6); else if (k === '.') reach(P2, 'right', .6);
  else if (k === ' ') jump(P1); else if (k === 'p' || k === 'Escape') togglePause(); else used = false;
  if (used && game.state !== 'idle') e.preventDefault(); });

function pop(text, cls, p){ const d = document.createElement('div'); d.className = 'pop ' + (cls || ''); d.textContent = text; if (p && two()) { d.style.left = (p.i ? 1 : -1) * Math.min(260, innerWidth * .22) + 'px'; d.style.color = P_CSS[p.i]; } $('pops').appendChild(d); setTimeout(() => d.remove(), 1000); }
let bannerT = null;
function banner(big, small, ms = 2200){ const b = $('banner'); b.innerHTML = big + (small ? `<small>${small}</small>` : ''); b.classList.remove('hidden'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.add('hidden'), ms); }
const hearts = p => { const mx = SET.hearts || 0; return !mx ? '❤ ∞' : p.out > 0 ? '💫 끝' : '❤'.repeat(Math.max(0, p.life)) + '<span style="opacity:.25">' + '❤'.repeat(Math.max(0, mx - p.life)) + '</span>'; };
function hud(){
  $('hLevel').textContent = game.level + 1; const d = two();
  $('hud').classList.toggle('duo', d);
  if (d) players.forEach(p => { $('pScore' + p.i).textContent = p.score; $('pLife' + p.i).innerHTML = hearts(p); });
  else { const p = players[0]; $('hLife').innerHTML = hearts(p); $('hStar').textContent = p.stars; $('hScore').textContent = p.score; }
  const pr = Math.min(1, (game.level + game.levelD / LEVEL_LEN) / LEVELS.length) * 100; $('hProg').style.width = pr + '%'; $('hKid').style.left = pr + '%';
}
function addScore(p, n, label){ p.score += n; if (label) pop(`${label} +${n}`, 'gold', p); }
function startLevel(L, again){
  game.level = L; game.levelD = 0; game.speed = eff(L).speed; game.nextSpawn = player.z - 26; game.breather = 1.6; game.itemNext = game.levelD + (L === 0 && !again ? 34 : rnd(30, 50));
  if (game.fresh) act().forEach(p => { p.life = 3; p.out = 0; }); game.fresh = false; hud();   // 목숨 3개는 한 판 전체 — 단계가 바뀌어도 다시 차지 않음(하트 젤리로만 회복)
  const [t, tip] = TIPS[L]; banner(again ? '다시 한 번!' : t, tip, 2600); say((again ? '다시 한 번! ' : t + '. ') + tip);
  game.queue = []; if (eff(L).chase) { if (!chase.on) startChase(); else chase.D = Math.max(chase.D, again ? 22 : 16); } else stopChase();
}
function hit(o, p){
  if (p.inv > 0 || p.out > 0) return; p.hits++; p.combo = 0; if (SET.hearts) p.life--; p.inv = 1.4; shake = 1;
  (game.hitLog = game.hitLog || []).push(o.name + ':' + o.kind + ':L' + (game.level + 1));
  audio.hit(); p.kid.set('hit'); $('flash').classList.add('on'); setTimeout(() => $('flash').classList.remove('on'), 90);
  pop(pick(['앗!', '아야!', '으앗!']), 'red', p); if (chase.on && o.kind !== 'chase') chase.D -= two() ? 3.5 : 5.5;
  if (p.life <= 0) { p.out = 1e9; p.reachSide = null;   // 목숨 3개를 다 쓰면 끝. 둘이 할 땐 남은 친구가 계속 달림
    if (two() && act().some(q => q.out <= 0)) pop('💫 여기까지!', 'red', p); else gameOver(); }
  hud();
}
function dodge(o, p){ if (chase.on) chase.D = Math.min(30, chase.D + (o.jump ? 1.1 : 1.6) * (two() ? .6 : 1)); p.dodges++; p.combo++; p.maxCombo = Math.max(p.maxCombo, p.combo); audio.dodge(p.combo);
  p.score += 10 * Math.min(5, 1 + Math.floor(p.combo / 5));   // 연속으로 피할수록 한 번에 받는 점수가 커짐(최대 5배)
  if (p.combo >= 3 && p.combo % 5 === 0) { pop(`${p.combo}번 연속!`, 'gold', p); audio.combo(); } else if (Math.random() < (two() ? .3 : .55)) pop(pick(['휙!', '좋아!', '피했다!', '잘했어!']), 'green', p); }
function pause(reason){ game.state = 'pause'; game.pauseReason = reason; $('pause').classList.remove('hidden'); $('pauseTitle').textContent = reason === 'lost' ? '친구가 안 보여요' : '잠깐 멈춤'; $('pauseMsg').textContent = reason === 'lost' ? '카메라 앞으로 오면 이어서 해요' : '계속하기를 누르면 이어서 해요'; }
function resume(){ game.state = 'play'; $('pause').classList.add('hidden'); }
function bestKey(){ return `kmgiant.best.${SET.diff}.${two() ? 2 : 1}`; }
function win(){
  stopChase(true); game.state = 'win'; act().forEach(p => { if (p.out <= 0) { p.kid.set('win'); addScore(p, 300); } }); audio.win(); banner('탈출 성공!', '거인 나라를 빠져나왔어요', 2400); say('탈출 성공! 거인 나라를 빠져나왔어요');
  if (motion) motion.active = false; hud(); setTimeout(() => showResult(true), 2600);
}
function gameOver(){
  stopChase(); game.state = 'over'; if (motion) motion.active = false; hud(); banner('아쉬워요!', `${game.level + 1}단계까지 갔어요`, 2000); say(`아쉬워요! ${game.level + 1}단계까지 갔어요. 다시 해 봐요`);
  setTimeout(() => showResult(false), 2100);
}
function showResult(won){
  show('result'); const d = two(), A = players[0], B = players[1], total = act().reduce((s, p) => s + p.score, 0), dn = (DIFF[SET.diff] || DIFF.normal).name;
  let best = 0; try { best = +localStorage.getItem(bestKey()) || 0; if (total > best) localStorage.setItem(bestKey(), total); } catch (e) {}
  const hitsAll = act().reduce((s, p) => s + p.hits, 0) / act().length, st = !won ? 0 : hitsAll <= 0 ? 3 : hitsAll <= 1 ? 2 : 1; $('resStars').textContent = '⭐'.repeat(st) + '☆'.repeat(3 - st);
  $('resSolo').classList.toggle('hidden', d); $('resDuo').classList.toggle('hidden', !d);
  $('resBest').textContent = total > best ? `🎉 새 기록! (${dn})` : `최고 기록 ${best}점 (${dn})`;
  const head = won ? (d ? '함께 탈출!' : '탈출 성공!') : `${game.level + 1}단계까지 갔어요`;
  if (d) { $('resTitle').textContent = head + (A.score === B.score ? ' 비겼어요' : ` ${A.score > B.score ? 1 : 2}번 친구가 더 많이 모았어요`);
    players.forEach(p => { $('dScore' + p.i).textContent = p.score; $('dInfo' + p.i).textContent = `⭐ ${p.stars} · 피함 ${p.dodges} · 부딪힘 ${p.hits}`; $('dCard' + p.i).classList.toggle('win', p.score > players[1 - p.i].score); });
    $('dTotal').textContent = `둘이 합쳐 ${total}점`; }
  else { $('resTitle').textContent = head; $('rScore').textContent = A.score; $('rStar').textContent = A.stars; $('rDodge').textContent = A.dodges; $('rHit').textContent = A.hits; $('rCombo').textContent = A.maxCombo; }
}

// ───────── 긴장 장치: 느린 화면·심장·뒤돌아보기, 뒤에서 굴러오는 수박
const fx = { slow: 0, slowCool: 0, danger: 0, beatT: 0, pulse: 0, lookBack: 0 };
const chase = { on: false, D: 24, obj: null, x: 0, leave: 0 };
function startChase(){
  if (!chase.obj) { chase.obj = new THREE.Group(); const m = clone('watermelon'); const sz = sizeOf('watermelon'); chase.r = sz.y / 2; chase.rz = sz.z / 2; m.position.y = -chase.r; chase.spin = new THREE.Group(); chase.spin.position.y = chase.r; chase.spin.add(m); chase.obj.add(chase.spin); scene.add(chase.obj); }
  if (!chase.shade) { chase.shade = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false, opacity: 0 })); chase.shade.rotation.x = -Math.PI / 2; chase.shade.position.y = .025; scene.add(chase.shade); }
  chase.on = true; chase.D = 22; chase.leave = 0; chase.x = player.x; chase.obj.visible = true; $('chaseBox').classList.remove('hidden');
  audio.rumbleOn(); fx.lookBack = 2.2; game.breather = Math.max(game.breather, 3);
}
function stopChase(leave){ if (!chase.on) return; chase.on = false; if (chase.shade) chase.shade.material.opacity = 0; $('chaseBox').classList.add('hidden'); if (leave) chase.leave = 2.5; else { if (chase.obj) chase.obj.visible = false; audio.rumbleOff(); } }
function updateChase(dt){
  if (!chase.obj || (!chase.on && chase.leave <= 0)) return;
  const sp = game.state === 'play' ? game.speed : game.state === 'win' ? 2 : game.state === 'retry' ? 0 : game.speed * .5;
  if (chase.on && game.state === 'play' && fx.lookBack <= 0) {
    chase.D -= eff(game.level).chase * dt;
    if (chase.D <= 4.2) { // 꽉! — 수박에 따라잡힘
      chase.D = 17; pop('수박에 잡혔다!', 'red'); audio.thud(true); shake = 1.4; act().forEach(p => hit({ name: 'watermelon', kind: 'chase' }, p));
    }
    chase.D = Math.min(30, chase.D);
  }
  if (chase.leave > 0) { chase.leave -= dt; chase.x += (chase.x >= 0 ? 1 : -1) * 14 * dt; if (Math.abs(chase.x) > 18) chase.obj.position.y -= 14 * dt; if (chase.leave <= 0) { chase.obj.visible = false; audio.rumbleOff(); } }
  else chase.x += (player.x * .6 - chase.x) * (1 - Math.exp(-dt * 1.5));
  // 화면에선 카메라 바로 뒤까지만 다가옴(카메라를 덮지 않게) — 대신 커다란 그림자가 아이를 덮친다
  const vis = chase.leave > 0 ? chase.D : Math.max(chase.D, chase.rz + 8.6);
  chase.obj.position.set(chase.x, chase.leave > 0 ? chase.obj.position.y : 0, player.z + vis);
  chase.spin.rotation.x -= (sp + (chase.on ? eff(game.level).chase || 0 : 0)) * dt / chase.r;
  const near = chase.on ? Math.max(0, Math.min(1, (26 - chase.D) / 22)) : 0; audio.rumbleLevel(near);
  // 수박 그림자가 뒤에서 아이 발밑까지 기어 올라옴
  const close = chase.on ? Math.max(0, Math.min(1, (16 - chase.D) / 11)) : 0; chase.shade.material.opacity = close * .6; chase.shade.scale.set(9 + close * 3, 10 + close * 8, 1); chase.shade.position.set(chase.x, .025, player.z + 9 - close * 8);
  if (chase.on && chase.D < 9) shake = Math.max(shake, (9 - chase.D) / 9 * .5);
  const k = Math.max(0, Math.min(1, (chase.D - 4) / 22)); $('chaseFill').style.width = (k * 100) + '%';
  $('chaseBox').classList.toggle('hot', chase.D < 10);
}

// ───────── 손 뻗어 잡는 것: ⭐ 별(모으기) · 🍬 사탕(수박을 멀리) · ❤ 하트 젤리(하트 +1)
const items = [];
function haloTex(){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 2, 64, 64, 62); gr.addColorStop(0, 'rgba(255,240,170,.95)'); gr.addColorStop(.35, 'rgba(255,210,90,.45)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); }
const HALO = new THREE.SpriteMaterial({ map: haloTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
const TAG_L = new THREE.SpriteMaterial({ map: emojiTex('👈', '#3aa0ff'), depthTest: false, transparent: true, fog: false });
const TAG_R = new THREE.SpriteMaterial({ map: emojiTex('👉', '#3aa0ff'), depthTest: false, transparent: true, fog: false });
function spawnItem(type, side){
  const root = new THREE.Group(), m = clone(type), sz = sizeOf(type); m.position.y = -sz.y / 2; const spin = new THREE.Group(); spin.add(m); root.add(spin);
  const k = type === 'star' ? 1.6 : type === 'heart' ? 1.5 : 1.7; spin.scale.setScalar(k); // 잘 보이게 조금 크게
  const halo = new THREE.Sprite(HALO.clone()); halo.scale.setScalar(3.4); root.add(halo);
  const it = { type, side, root, spin, halo, x: side === 'left' ? -3.9 : 3.9, y: 1.9, z: player.z - 62, got: false, t: 0 };
  it.tag = new THREE.Sprite((side === 'left' ? TAG_L : TAG_R).clone()); it.tag.scale.setScalar(1.5); it.tag.material.opacity = 0; it.tag.renderOrder = 11; scene.add(it.tag);
  root.position.set(it.x, it.y, it.z); scene.add(root); items.push(it); return it;
}
function clearItems(){ for (const it of items) { scene.remove(it.root); scene.remove(it.tag); } items.length = 0; }
function collect(it, p){
  it.got = true; it.by = p; it.t = 0; audio.chime(it.type);
  if (it.type === 'heart') { if (SET.hearts) p.life = Math.min(SET.hearts, p.life + 1); addScore(p, 30, '❤ 하트'); }
  else if (it.type === 'candy') { if (chase.on) chase.D = Math.min(30, chase.D + 9); addScore(p, 30, chase.on ? '🍬 수박 멀리!' : '🍬 사탕'); }
  else { p.stars++; addScore(p, 50, '⭐ 별'); }
  hud();
}
function updateItems(dt){
  if (game.state === 'play' && game.levelD > game.itemNext && game.levelD < LEVEL_LEN - 20) {
    game.itemNext = game.levelD + rnd(38, 62) / (DIFF[SET.diff] || DIFF.normal).speed;
    const r = Math.random(), type = (act().some(q => q.out <= 0 && q.life < 3) && r < .3) ? 'heart' : (chase.on && r < .45) ? 'candy' : 'star';
    const side = Math.random() < .5 ? 'left' : 'right'; spawnItem(type, side);
    if (!game.taughtReach) { game.taughtReach = true; banner(side === 'left' ? '👈 왼쪽으로 손을 쭉!' : '손을 쭉! 오른쪽 👉', '반짝이는 별이 오면 손을 뻗어 잡아요', 2600); say('반짝이는 별이 오면 손을 쭉 뻗어서 잡아요'); }
  }
  for (const p of act()) if (p.reachHold > 0 && p.reachHold < 50) { p.reachHold -= dt; if (p.reachHold <= 0) p.reachSide = null; }
  const now = performance.now();
  for (let i = items.length - 1; i >= 0; i--) { const it = items[i];
    if (!it.got) {
      it.spin.rotation.y += dt * 2.4; it.root.position.y = it.y + Math.sin(now / 300 + i) * .15; it.halo.material.opacity = .7 + Math.sin(now / 150) * .25;
      const d = player.z - it.z;
      it.tag.material.opacity += ((d > 2 && d < 28 ? 1 : 0) - it.tag.material.opacity) * Math.min(1, dt * 8); it.tag.position.set(it.x, it.y + 1.9, it.z);
      if (game.state === 'play' && Math.abs(d) < 2.0) { const c = act().filter(q => ready(q) && q.reachSide === it.side).sort((a, b) => Math.abs(it.x - a.x) - Math.abs(it.x - b.x) + (Math.random() - .5) * .9); if (c.length) collect(it, c[0]); }
      if (d < -3) { it.got = true; it.missed = true; it.t = 0; }
    } else { // 잡으면 손 쪽으로 빨려 들어가며 작아짐 / 놓치면 흐려짐
      it.t += dt; it.tag.material.opacity = 0;
      if (!it.missed) { it.root.position.lerp(new THREE.Vector3(it.by.x + (it.side === 'left' ? -1 : 1) * .9, it.by.y + 1.3, player.z), Math.min(1, dt * 12)); it.root.scale.setScalar(Math.max(.01, 1 - it.t * 2.2)); }
      else it.root.scale.setScalar(Math.max(.01, 1 - it.t * 2));
      if (it.t > .5) { scene.remove(it.root); scene.remove(it.tag); items.splice(i, 1); }
    }
  }
}

// ───────── 한 프레임
function update(dt){
  const playing = game.state === 'play' || game.state === 'retry';
  const speed = game.state === 'play' ? game.speed : game.state === 'idle' ? 3 : game.state === 'win' ? 2 : game.state === 'over' ? 1 : 0;
  // 플레이어
  if (game.state !== 'pause') {
    player.z -= speed * dt; const off = two() ? .42 : 0;
    for (const p of act()) { const tx = LANES[p.lane] + (p.i ? off : -off), dx = tx - p.x; p.x += dx * (1 - Math.exp(-dt * 11)); p.lanePush = Math.max(-1, Math.min(1, dx * .9));
      if (p.air) { p.y += p.vy * dt; p.vy -= 22 * dt; if (p.y <= 0) { p.y = 0; p.air = false; p.kid.set('land'); audio.land(); } }
      if (p.inv > 0) p.inv -= dt;
    }
    player.stepT += speed * dt; if (player.stepT > 2.2 && game.state === 'play') { player.stepT = 0; audio.step(); }
  }
  if (game.state === 'retry') { game.retryT -= dt; if (game.retryT <= 0) { clearObs(); game.state = 'play'; startLevel(game.level, true); } }
  if (game.state === 'play' && game.levelD + speed * dt >= LEVEL_LEN && game.levelD < LEVEL_LEN) act().forEach(p => addScore(p, 100, '단계 통과'));
  if (game.state === 'play') {
    game.levelD += speed * dt; if (game.breather > 0) game.breather -= dt;
    // 거인의 발소리: 가끔 쿵 — 식탁이 흔들리고 물건들이 들썩
    game.boomT -= dt; if (game.boomT <= 0) { game.boomT = rnd(8, 13) - game.level; audio.boom(); shake = Math.max(shake, .8); for (const s of scenery) s.hop = rnd(.15, .35); }
    // 생성: 단계 끝나기 조금 전엔 멈춤(숨 돌리기)
    const lv = eff(game.level);
    if (game.breather <= 0 && !game.queue.length && game.levelD < LEVEL_LEN - 30 && player.z < game.nextSpawn) { pattern(pick(lv.pool), game.level, player.z); game.nextSpawn = player.z - lv.gap * rnd(.85, 1.2); }
    if (game.levelD >= LEVEL_LEN && !obs.some(o => !o.passed)) {
      if (game.level + 1 >= LEVELS.length) win(); else { audio.combo(); startLevel(game.level + 1); }
    }
    hud();
  }
  // 장애물
  for (const o of obs) {
    if (game.state === 'pause') break;
    if (o.kind === 'fall') {
      if (o.wait > 0) { o.wait -= dt; }
      else if (!o.landed) { if (!o.root.visible) { o.root.visible = true; audio.whoosh(); }
        o.vy -= 60 * dt; o.y += o.vy * dt; if (o.spinFall) o.pivot.rotation.z += o.spinFall * dt;
        if (o.y <= 0) { o.y = 0; o.landed = true; o.bounce = o.jump ? .9 : (o.big ? .6 : .5); o.vy = 0; o.pivot.rotation.z = 0;
          if (o.metal) audio.clink(); else audio.thud(!!o.big || !o.jump); if (o.big || o.metal) shake = Math.max(shake, .55); } }
      else if (o.bounce > 0) { o.vy = o.vy || o.bounce * 6; o.y += o.vy * dt; o.vy -= 40 * dt; if (o.y <= 0) { o.y = 0; o.bounce *= .4; o.vy = o.bounce > .12 ? o.bounce * 6 : 0; if (o.vy) audio.bounce(); else o.bounce = 0; } }
      // 그림자: 떨어질수록 진해지고 커짐
      if (o.marker) { const total = o.warnT, left = Math.max(0, o.wait) + (o.landed ? 0 : Math.max(0, o.y / 34) * o.fallDur), u = 1 - Math.min(1, left / total);
        const { sh, ring } = o.marker.userData; sh.material.opacity = o.landed ? Math.max(0, sh.material.opacity - dt * 3) : .45 + u * .55; const k = .55 + u * .45; sh.scale.set(k * (o.across ? o.hw * 2.2 : 1), k * (o.across ? o.hd * 3 : 1), 1);
        ring.material.opacity = o.landed ? 0 : (.6 + .4 * Math.sin(performance.now() / 80)) * (.6 + u * .4); ring.scale.setScalar(1.15 - u * .2); }
    } else if (o.kind === 'roll') {
      o.z += o.vz * dt; if (!o.liquid) o.pivot.rotation.x += o.vz * dt / Math.max(.2, o.r); else o.pivot.position.y = Math.sin(performance.now() / 120) * .04;
      if (o.weave) { const d = player.z - o.z; // 흔들흔들하다가 내 줄 쪽으로 휜다
        if (!o.weaved && d < 46) o.root.rotation.z = Math.sin(performance.now() / 70) * .12;
        if (!o.weaved && d < 32) { o.weaved = true; o.root.rotation.z = 0; const pl = player.lane; o.tx = LANES[pl !== o.lane ? pl : (pl === 1 ? pick([0, 2]) : 1)]; o.lane = LANES.indexOf(o.tx); audio.sting(); }
        if (o.weaved) o.x += (o.tx - o.x) * (1 - Math.exp(-dt * 3.2)); }
      if (!o.rolled && o.z > player.z - 60) { o.rolled = true; audio.roll(); }
    } else if (o.kind === 'cross') {
      o.x += o.vx * dt; o.pivot.rotation.z -= o.vx * dt / Math.max(.2, o.r);
    }
    o.root.position.set(o.x, o.y, o.z);
    if (o.tag) { const d = player.z - o.z, show = !o.passed && !o.hit && d > 2 && d < 30 && (o.kind !== 'fall' || o.landed || o.wait <= 0 || d < 22);
      o.tag.material.opacity += ((show ? 1 : 0) - o.tag.material.opacity) * Math.min(1, dt * 8);
      o.tag.position.set(o.across ? player.x : o.x, (o.kind === 'fall' && !o.landed ? Math.min(o.y, 0) : o.y) + Math.max(o.h, .8) + .9 + Math.sin(performance.now() / 160) * .12, o.z); }
    // 부딪힘: 줄(x) 겹침 + 앞뒤(z) 겹침 + 높이(뛰면 작은 것은 넘음)
    if (playing && !o.passed && o.root.visible) for (const p of act()) { const bit = 1 << p.i; if ((o.hitMask | 0) & bit || p.out > 0) continue;
      const ox = Math.abs(o.x - p.x) < o.hw * .82 + .3, oz = Math.abs(o.z - player.z) < o.hd * .82 + .25; // 둥근 물건이라 상자보다 조금 너그럽게
      const clear = p.y > o.h * .8 + o.y; const underFall = o.kind === 'fall' && !o.landed && o.y < 1.7;
      if (ox && oz && (underFall || (!clear && o.y < .9)) && p.inv <= 0) { o.hitMask = (o.hitMask | 0) | bit; hit(o, p); } }
    o.hit = act().every(p => (o.hitMask | 0) & (1 << p.i));
    if (!o.passed && o.z - o.hd > player.z + .6) { o.passed = true; if (game.state === 'play') for (const p of act()) { if ((o.hitMask | 0) & (1 << p.i) || p.out > 0 || Math.abs(o.x - p.x) > 3.4) continue; dodge(o, p);
      const close = (!o.jump && Math.abs(o.x - p.x) < o.hw + 1.3) || (o.jump && p.air && Math.abs(o.x - p.x) < o.hw + .4);
      if (close) { addScore(p, 20); if (fx.slowCool <= 0) { fx.slow = .5; fx.slowCool = 2.5; chase.D += .8; pop(o.jump ? '훌쩍! +20' : '아슬아슬! +20', 'gold', p); audio.whoosh(); } } } hud(); }
  }
  for (let i = obs.length - 1; i >= 0; i--) { const o = obs[i]; if (o.z > player.z + 18 || Math.abs(o.x) > 20) { scene.remove(o.root); if (o.marker) scene.remove(o.marker); if (o.tag) scene.remove(o.tag); obs.splice(i, 1); } }
  // 풍경 재배치·들썩
  for (const s of scenery) { if (s.z > player.z + 22) placeScenery(s, s.z - (LOW ? 26 : 38) * 9); if (s.hop > 0) { s.hop = Math.max(0, s.hop - dt * 1.4); s.obj.position.y = Math.abs(Math.sin(s.hop * 18)) * s.hop * .6; } }
  if (crumbs) updCrumbs(player.z);
  if (table) table.position.z = Math.round(player.z / 120) * 120;
  // 캐릭터
  for (const p of players) { const kid = p.kid; kid.root.visible = p.on; if (!p.on) continue; p.tag.visible = two();
    if (kid.state === 'jump' && !p.air) kid.set('land');
    if (game.state === 'idle' || game.state === 'play' || game.state === 'retry') { if (!['jump', 'land', 'hit', 'run'].includes(kid.state)) kid.set('run'); }
    kid.root.position.set(p.x, p.y, player.z); kid.root.visible = p.out <= 0 && !(p.inv > .3 && Math.floor(performance.now() / 90) % 2 === 0);
    kid.update(dt, game.state === 'play' ? (game.speed - 6) / 5 : .1, p.y, p.lanePush);
    if (p.reachSide === 'right') { kid.armR.rotation.set(0, 0, 1.45); kid.foreR.rotation.x = 0; }
    if (p.reachSide === 'left') { kid.armL.rotation.set(0, 0, -1.45); kid.foreL.rotation.x = 0; } }
  // 예약 생성
  if (game.state === 'play') { game.time += dt; for (let i = game.queue.length - 1; i >= 0; i--) if (game.time >= game.queue[i].at) { const q = game.queue.splice(i, 1)[0]; q.fn(); } }
  updateChase(dt); updateItems(dt);
  // 위험할수록 심장 소리·붉은 테두리
  let danger = 0;
  if (game.state === 'play') { for (const o of obs) { if (o.passed || o.hit || o.jump) continue; const d = player.z - o.z; if (d > 0 && d < 15 && act().some(q => Math.abs(o.x - q.x) < o.hw + .5)) danger = Math.max(danger, 1 - d / 15); }
    if (chase.on) danger = Math.max(danger, Math.min(1, Math.max(0, (13 - chase.D) / 9))); }
  fx.danger += (danger - fx.danger) * Math.min(1, dt * 6);
  fx.beatT -= dt; if (fx.danger > .18 && fx.beatT <= 0) { fx.beatT = 1.0 - fx.danger * .55; audio.heart(fx.danger); fx.pulse = 1; }
  fx.pulse = Math.max(0, fx.pulse - dt * 2.5); $('vig').style.opacity = Math.min(1, fx.danger * .55 + fx.pulse * fx.danger * .45).toFixed(3);
  // 해·그림자 따라가기
  // 해는 뒤쪽 위에서(뒤에서 굴러오는 수박의 그림자가 앞으로 길게 드리워짐)
  sun.position.set(player.x - 8, 11, player.z + 26); sun.target.position.set(player.x, 0, player.z - 3);
  // 카메라: 낮게(작아진 눈높이) 따라감
  const tgt = new THREE.Vector3(player.x * .55, 2.5 + player.y * .35, player.z + 6.4);
  camPos.lerp(tgt, 1 - Math.exp(-dt * 6)); camLook.lerp(new THREE.Vector3(player.x * .3, 1.5 + player.y * .25, player.z - 12), 1 - Math.exp(-dt * 8));
  shake = Math.max(0, shake - dt * 1.8); const sh = shake * shake * .32;
  camera.position.copy(camPos).add(new THREE.Vector3(rnd(-sh, sh), rnd(-sh, sh), 0)); camera.lookAt(camLook);
  camera.rotateZ(-player.lanePush * .07); // 옆으로 비킬 때 화면도 기울어짐
  const baseFov = innerWidth / innerHeight < 1.2 ? 72 : 60, wantFov = baseFov + (game.state === 'play' ? (game.speed - 6.5) * 1.4 + fx.danger * 5 : 0);
  // 뒤돌아보기 연출(수박 등장): 아이 앞에서 뒤쪽을 봄
  if (fx.lookBack > 0) { fx.lookBack -= dt; const k = Math.min(1, Math.min(fx.lookBack, 2.2 - fx.lookBack) * 2.5);
    const bp = new THREE.Vector3(player.x + 2.5, 2.2, player.z - 7), bl = new THREE.Vector3(player.x, 2.5, player.z + 12);
    camera.position.lerp(bp, k); const look = camLook.clone().lerp(bl, k); camera.lookAt(look); }
  camera.fov += (wantFov - camera.fov) * Math.min(1, dt * 3); camera.updateProjectionMatrix();
}

// ───────── 화면 흐름
function show(name){ for (const k of ['start', 'calib', 'result']) $('scr-' + k).classList.toggle('hidden', k !== name); $('hud').classList.toggle('hidden', name !== 'hud'); }
function setupSettings(){
  const box = $('setBox'), sum = () => { $('setSum').textContent = `${SET.start}단계부터 · 수박 ${SET.chase ? '켬' : '끔'}`; };
  const bind = (id, key, conv) => { const el = $(id); el.querySelectorAll('button').forEach(b => { b.classList.toggle('on', String(SET[key]) === b.dataset.v); b.onclick = () => { el.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); SET[key] = conv(b.dataset.v); saveSet(); sum(); }; }); };
  bind('playSeg', 'players', v => +v); bind('setDiff', 'diff', v => v); bind('setStart', 'start', v => +v); bind('setChase', 'chase', v => v === 'true');
  $('btnSet').onclick = () => box.classList.toggle('hidden'); $('btnSetClose').onclick = () => box.classList.add('hidden'); sum();
}
setupSettings();
const seg = $('modeSeg'); seg.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === mode); b.onclick = () => { seg.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); mode = b.dataset.v; localStorage.setItem('kmgiant.mode', mode); }; });
function camStatus(kind, text){ const c = $('camBox'); c.classList.toggle('ok', kind === 'ok'); c.classList.toggle('bad', kind !== 'ok'); $('camSt').textContent = text; }
let calibCopy = null;
function copyCalib(on){ if (calibCopy) cancelAnimationFrame(calibCopy); calibCopy = null; if (!on) return; const src = $('c'), dst = $('calibView'); dst.width = src.width; dst.height = src.height; const ctx = dst.getContext('2d'); const loop = () => { ctx.drawImage(src, 0, 0); calibCopy = requestAnimationFrame(loop); }; loop(); }
async function startFlow(){
  audio.ensure(); audio.startAmbient();
  if (mode === 'camera') {
    show('calib'); calibrating = true;
    try {
      const n = SET.players === 2 ? 2 : 1;
      if (motion && motion.n !== n) { motion.stop(); motion = null; motionReady = false; }   // 인원이 바뀌면 인식기를 새로
      if (!motion) motion = new GiantMotion(n, { getLane: i => players[i].lane, onMove: (i, d) => move(players[i], d), onJump: i => jump(players[i]), onReach: (i, side) => reach(players[i], side, 99),
        onLost: () => { if (game.state === 'play') pause('lost'); }, onBack: () => { if (game.state === 'pause' && game.pauseReason === 'lost') resume(); }, onStatus: camStatus });
      $('calibTitle').textContent = n === 2 ? '둘이 나란히 앉아요 — 왼쪽이 1번, 오른쪽이 2번' : '카메라 앞에 앉아요 — 어깨까지만 보이면 돼요';
      if (!motion.started) { $('calibMsg').textContent = '카메라를 켜는 중…'; await motion.start(); }
      motionReady = true; copyCalib(true);
      await motion.calibrate(3, (p, vis, each) => { $('ringFg').style.strokeDashoffset = 327 * (1 - p); $('calibNum').textContent = Math.max(1, Math.ceil(3 - p * 3));
        $('calibMsg').textContent = vis ? (p < .99 ? '좋아요! 그대로 있어요' : '준비 완료!') : n === 2 ? (each[0] || each[1] ? `${each[0] ? 2 : 1}번 친구가 안 보여요` : '두 친구 모두 머리와 어깨가 보이게') : '머리와 어깨가 보이게 가운데에'; });
      if (!calibrating) return; copyCalib(false); $('camBox').classList.remove('off');
    } catch (e) { $('calibMsg').textContent = '카메라를 쓸 수 없어요 → 키보드로 해요'; await new Promise(r => setTimeout(r, 1800)); if (!calibrating) return; mode = 'keyboard'; $('camBox').classList.add('off'); }
    calibrating = false;
  } else $('camBox').classList.add('off');
  begin();
}
function begin(){
  show('hud'); $('pause').classList.add('hidden'); clearObs();
  stopChase(); Object.assign(game, { queue: [], time: 0, state: 'play', boomT: 6, fresh: true, hitLog: [], taughtReach: false }); players[1].on = SET.players === 2;
  players.forEach(p => { Object.assign(p, { lane: 1, x: 0, y: 0, vy: 0, air: false, inv: 0, out: 0, reachSide: null, reachHold: 0, score: 0, stars: 0, dodges: 0, hits: 0, combo: 0, maxCombo: 0 }); p.kid.set('run'); });
  if (motion && motionReady && mode === 'camera') { motion.active = true; motion.paused = false; }
  startLevel(Math.max(0, Math.min(4, (SET.start || 1) - 1)));
}
function toStart(){ stopChase(); calibrating = false; copyCalib(false); clearObs(); game.state = 'idle'; if (motion) motion.active = false; $('pause').classList.add('hidden'); show('start'); try { speechSynthesis.cancel(); } catch (e) {} }
$('btnStart').onclick = startFlow; $('btnCalibCancel').onclick = toStart; $('btnHome').onclick = toStart; $('btnQuit').onclick = toStart; $('btnResume').onclick = resume;
$('btnRetry').onclick = () => { audio.ensure(); if (mode === 'camera' && motionReady && motion && motion.n === (SET.players === 2 ? 2 : 1)) { $('camBox').classList.remove('off'); begin(); } else startFlow(); };
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'play') pause('manual'); });
addEventListener('keydown', e => { if (e.key === 'Enter' && !$('scr-start').classList.contains('hidden')) startFlow(); if (e.key === 'm' || e.key === 'M') audio.setMuted(!audio.muted); });
if (DEV) $('dev').classList.remove('hidden');

// ───────── 시작
let last = performance.now(), fpsA = 0, fpsN = 0;
function loop(now){
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  fx.slowCool -= dt; let ts = 1; if (fx.slow > 0) { fx.slow -= dt; ts = .32; }
  update(dt * ts); renderer.render(scene, camera);
  if (DEV && !motion) { fpsA += dt; fpsN++; if (fpsA > .5) { $('dev').textContent = `fps ${Math.round(fpsN / fpsA)} obs ${obs.length} calls ${renderer.info.render.calls} tri ${renderer.info.render.triangles}`; fpsA = 0; fpsN = 0; } }
  requestAnimationFrame(loop);
}
(async () => {
  const bar = (p, t) => { $('loadBar').style.width = p * 100 + '%'; if (t) $('loadTxt').textContent = t; };
  try {
    bar(.15, '거인의 부엌을 펼치는 중…'); await buildBackground();
    bar(.4, '식탁을 차리는 중…'); await buildTable();
    bar(.65, '물건을 올려놓는 중…'); await loadProps(); buildScenery(); buildCrumbs();
  } catch (e) { console.error(e); $('loadTxt').textContent = '불러오기 실패: ' + e.message; }
  bar(1, '준비 완료'); setTimeout(() => $('loading').classList.add('off'), 250);
  show('start'); requestAnimationFrame(loop);
  // 자동 시험용: ?auto=1 이면 키보드 모드로 바로 시작(확인 촬영용)
  if (Q.has('auto')) { mode = 'keyboard'; if (Q.get('players')) SET.players = +Q.get('players'); begin(); if (Q.get('level')) { clearObs(); startLevel(+Q.get('level') - 1); } }
  window.__giant = { items, spawnItem, game, player, players, obs, scene, camera, renderer, startLevel, pattern, update, move, jump, reach, LANES, chase, fx, SET };
})();
