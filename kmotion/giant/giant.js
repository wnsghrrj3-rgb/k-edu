// K-MOTION 거인 나라 탈출 · 맛보기
// 거인의 식탁 위를 달려 탈출한다. 위에서 떨어지는 것(그림자가 먼저 생김)과 앞에서 굴러오는 것을 몸으로 피한다.
// 몸 좌우 = 줄 바꾸기, 두 손 번쩍 = 뛰기. 단계가 오를수록 빨라지고 섞여 나온다.
// 그림: 블렌더(bpy)로 만든 물건 GLB(구운 질감) + 식탁 나뭇결 굽기 + 거인 부엌 파노라마(Cycles). 생성기 tools/giant_assets.py
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Character } from '../run/js/scene.js';
import { InputManager } from '../run/js/game.js';
import { KeyboardInput, MotionController } from '../run/js/input.js';
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
  { speed: 7.6, gap: 15, react: 2.4, roll: 6.0, pool: ['rollSmall', 'fallSmall', 'rollBig', 'fallMid', 'coin'] },
  { speed: 8.6, gap: 13.5, react: 2.15, roll: 7.0, pool: ['rollSmall', 'rollBig', 'fallMid', 'fallBig', 'coin', 'cutlery', 'double'] },
  { speed: 9.6, gap: 12, react: 1.95, roll: 7.5, pool: ['rollBig', 'fallMid', 'fallBig', 'coin', 'cutlery', 'double', 'peaRow', 'cross', 'cookieRoll'] },
  { speed: 10.6, gap: 11, react: 1.8, roll: 8.0, pool: ['rollBig', 'fallBig', 'coin', 'cutlery', 'double', 'peaRow', 'cross', 'cookieRoll', 'combo', 'combo'] },
];
const TIPS = [
  ['1단계', '그림자가 생기면 옆으로 피해요'],
  ['2단계', '큰 과일은 옆으로, 작은 건 뛰어넘어요'],
  ['3단계', '숟가락이 떨어지면 두 손 번쩍!'],
  ['4단계', '옆으로 굴러오는 구슬 조심!'],
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
const hemi = new THREE.HemisphereLight(0xfff1dc, 0x8a6446, .85); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 2.4); sun.position.set(-8, 22, -18); sun.castShadow = true;
sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048); Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 30, bottom: -30, near: 1, far: 90 });
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
  scene.background = t; scene.environment = t; scene.backgroundBlurriness = .04; scene.environmentIntensity = 1.0; scene.backgroundIntensity = .85;
  // 파노라마 가운데(블렌더 카메라 +y = 창 쪽)가 달리는 방향(-z)에 오도록 돌림
  const ry = Number(Q.get('bgrot') || Math.PI / 2); scene.backgroundRotation.set(0, ry, 0); scene.environmentRotation.set(0, ry, 0);
}

// 물건 원본(GLB) → 복제해 쓰는 틀
const PROTO = {};
async function loadProps(){
  const g = await new Promise((res, rej) => loader.load('./assets/props.glb?v=1', res, undefined, rej));
  for (const ch of [...g.scene.children]) {
    ch.position.set(0, 0, 0); ch.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material) { o.material.envMapIntensity = 1; if (o.material.transmission > 0) { o.material.transparent = true; o.material.opacity = .22; o.material.depthWrite = false; o.material.transmission = 0; o.material.roughness = .05; o.material.metalness = .1; } } } });
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
  o.fallT = 0; o.fallDur = Math.min(1.1, t * .55); o.wait = Math.max(.3, t - o.fallDur - .35); // 도착 0.35초 전에 쿵 — 그림자 보고 미리 비켜야 함 o.y = 34; o.vy = 0; o.landed = false; o.warnT = t;
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
function clearObs(){ for (const o of obs) { scene.remove(o.root); if (o.marker) scene.remove(o.marker); if (o.tag) scene.remove(o.tag); } obs.length = 0; }

const SMALL_ROLL = ['pea', 'grape', 'marble'], SMALL_FALL = ['sugar', 'button'], MID_FALL = ['tomato', 'cookie'], BIG_FALL = ['apple', 'orange'], BIG_ROLL = ['orange', 'apple'];
function otherLanes(l){ return [0, 1, 2].filter(x => x !== l); }
function pattern(kind, L, pz){
  const lane = Math.random() * 3 | 0, lv = LEVELS[L];
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
    case 'combo': { // 굴러오는 큰 것 + 다른 줄에 떨어지는 것: 남은 한 줄을 찾아야 함
      const [a, b] = otherLanes(lane); spawnRoll(pick(BIG_ROLL), a, pz, lv.roll * .8); spawnFall(pick(MID_FALL), b, pz, game.speed, lv.react + .5, { spinFall: true }); break; }
  }
}

// ───────── 게임 상태
const input = new InputManager();
const keys = new KeyboardInput(input);
const audio = new GiantAudio();
const kid = new Character(); scene.add(kid.root);
const player = { lane: 1, x: 0, z: 0, y: 0, vy: 0, air: false, inv: 0, lanePush: 0, stepT: 0 };
const game = { state: 'idle', level: 0, levelD: 0, speed: 6, nextSpawn: 30, life: 3, dodges: 0, hits: 0, combo: 0, maxCombo: 0, boomT: 9, breather: 0, pauseReason: '' };
let motion = null, motionReady = false, calibrating = false, mode = localStorage.getItem('kmgiant.mode') || 'camera';

input.on('MOVE_LEFT', () => move(-1)); input.on('MOVE_RIGHT', () => move(1)); input.on('JUMP', jump);
input.on('PAUSE', () => { if (game.state === 'play') pause('manual'); else if (game.state === 'pause') resume(); });
input.on('PAUSE_LOST', () => { if (game.state === 'play') pause('lost'); });
input.on('RESUME', () => { if (game.state === 'pause' && game.pauseReason === 'lost') resume(); });
function move(d){ if (game.state !== 'play') return; const n = Math.max(0, Math.min(2, player.lane + d)); if (n !== player.lane) { player.lane = n; audio.lane(); } }
function jump(){ if (game.state !== 'play' || player.air) return; player.air = true; player.vy = 8.6; kid.set('jump'); audio.jump(); }

function pop(text, cls){ const d = document.createElement('div'); d.className = 'pop ' + (cls || ''); d.textContent = text; $('pops').appendChild(d); setTimeout(() => d.remove(), 1000); }
let bannerT = null;
function banner(big, small, ms = 2200){ const b = $('banner'); b.innerHTML = big + (small ? `<small>${small}</small>` : ''); b.classList.remove('hidden'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.add('hidden'), ms); }
function hud(){
  $('hLevel').textContent = game.level + 1;
  $('hLife').innerHTML = '❤'.repeat(Math.max(0, game.life)) + '<span style="opacity:.25">' + '❤'.repeat(Math.max(0, 3 - game.life)) + '</span>';
  const p = Math.min(1, (game.level + game.levelD / LEVEL_LEN) / LEVELS.length) * 100; $('hProg').style.width = p + '%'; $('hKid').style.left = p + '%';
}
function startLevel(L, again){
  game.level = L; game.levelD = 0; game.speed = LEVELS[L].speed; game.nextSpawn = player.z - 26; game.breather = 1.6; game.life = 3; hud();
  const [t, tip] = TIPS[L]; banner(again ? '다시 한 번!' : t, tip, 2600); say((again ? '다시 한 번! ' : t + '. ') + tip);
}
function hit(o){
  if (player.inv > 0) return; o.hit = true; game.hits++; (game.hitLog = game.hitLog || []).push(o.name + ':' + o.kind + (o.landed === false ? ':falling' : '') + ':L' + (game.level + 1)); game.combo = 0; game.life--; player.inv = 1.4; shake = 1;
  audio.hit(); kid.set('hit'); $('flash').classList.add('on'); setTimeout(() => $('flash').classList.remove('on'), 90);
  pop(pick(['앗!', '아야!', '으앗!']), 'red'); hud();
  if (game.life <= 0) { // 1학년: 처음부터가 아니라 이 단계부터 다시
    game.state = 'retry'; game.retryT = 1.3;
  }
}
function dodge(o){ game.dodges++; game.combo++; game.maxCombo = Math.max(game.maxCombo, game.combo); audio.dodge(game.combo);
  if (game.combo >= 3 && game.combo % 5 === 0) { pop(`${game.combo}번 연속!`, 'gold'); audio.combo(); } else if (Math.random() < .55) pop(pick(['휙!', '좋아!', '피했다!', '잘했어!']), 'green'); }
function pause(reason){ game.state = 'pause'; game.pauseReason = reason; $('pause').classList.remove('hidden'); $('pauseTitle').textContent = reason === 'lost' ? '친구가 안 보여요' : '잠깐 멈춤'; $('pauseMsg').textContent = reason === 'lost' ? '카메라 앞 가운데로 오면 이어서 해요' : '계속하기를 누르면 이어서 해요'; }
function resume(){ game.state = 'play'; $('pause').classList.add('hidden'); }
function win(){
  game.state = 'win'; kid.set('win'); audio.win(); banner('탈출 성공!', '거인 나라를 빠져나왔어요', 2400); say('탈출 성공! 거인 나라를 빠져나왔어요');
  if (motion) motion.active = false;
  setTimeout(() => { show('result'); const stars = game.hits <= 2 ? 3 : game.hits <= 6 ? 2 : 1; $('resStars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('rDodge').textContent = game.dodges; $('rHit').textContent = game.hits; $('rCombo').textContent = game.maxCombo; }, 2600);
}

// ───────── 한 프레임
function update(dt){
  const playing = game.state === 'play' || game.state === 'retry';
  const speed = game.state === 'play' ? game.speed : game.state === 'idle' ? 3 : game.state === 'win' ? 2 : 0;
  // 플레이어
  if (game.state !== 'pause') {
    player.z -= speed * dt; const tx = LANES[player.lane], dx = tx - player.x; player.x += dx * (1 - Math.exp(-dt * 11)); player.lanePush = Math.max(-1, Math.min(1, dx * .9));
    if (player.air) { player.y += player.vy * dt; player.vy -= 22 * dt; if (player.y <= 0) { player.y = 0; player.air = false; kid.set('land'); audio.land(); } }
    if (player.inv > 0) player.inv -= dt;
    player.stepT += speed * dt; if (player.stepT > 2.2 && !player.air && game.state === 'play') { player.stepT = 0; audio.step(); }
  }
  if (game.state === 'retry') { game.retryT -= dt; if (game.retryT <= 0) { clearObs(); game.state = 'play'; startLevel(game.level, true); } }
  if (game.state === 'play') {
    game.levelD += speed * dt; if (game.breather > 0) game.breather -= dt;
    // 거인의 발소리: 가끔 쿵 — 식탁이 흔들리고 물건들이 들썩
    game.boomT -= dt; if (game.boomT <= 0) { game.boomT = rnd(8, 13) - game.level; audio.boom(); shake = Math.max(shake, .8); for (const s of scenery) s.hop = rnd(.15, .35); }
    // 생성: 단계 끝나기 조금 전엔 멈춤(숨 돌리기)
    const lv = LEVELS[game.level];
    if (game.breather <= 0 && game.levelD < LEVEL_LEN - 30 && player.z < game.nextSpawn) { pattern(pick(lv.pool), game.level, player.z); game.nextSpawn = player.z - lv.gap * rnd(.85, 1.2); }
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
      o.z += o.vz * dt; o.pivot.rotation.x += o.vz * dt / Math.max(.2, o.r);
      if (!o.rolled && o.z > player.z - 60) { o.rolled = true; audio.roll(); }
    } else if (o.kind === 'cross') {
      o.x += o.vx * dt; o.pivot.rotation.z -= o.vx * dt / Math.max(.2, o.r);
    }
    o.root.position.set(o.x, o.y, o.z);
    if (o.tag) { const d = player.z - o.z, show = !o.passed && !o.hit && d > 2 && d < 30 && (o.kind !== 'fall' || o.landed || o.wait <= 0 || d < 22);
      o.tag.material.opacity += ((show ? 1 : 0) - o.tag.material.opacity) * Math.min(1, dt * 8);
      o.tag.position.set(o.across ? player.x : o.x, (o.kind === 'fall' && !o.landed ? Math.min(o.y, 0) : o.y) + Math.max(o.h, .8) + .9 + Math.sin(performance.now() / 160) * .12, o.z); }
    // 부딪힘: 줄(x) 겹침 + 앞뒤(z) 겹침 + 높이(뛰면 작은 것은 넘음)
    if (playing && !o.hit && !o.passed && o.root.visible) {
      const ox = Math.abs(o.x - player.x) < o.hw + .38, oz = Math.abs(o.z - player.z) < o.hd + .3;
      const clear = player.y > o.h * .8 + o.y; const underFall = o.kind === 'fall' && !o.landed && o.y < 1.7;
      if (ox && oz && (underFall || (!clear && o.y < .9))) hit(o);
    }
    if (!o.passed && o.z - o.hd > player.z + .6) { o.passed = true; if (!o.hit && Math.abs(o.x - player.x) < 3.4 && game.state === 'play') dodge(o); }
  }
  for (let i = obs.length - 1; i >= 0; i--) { const o = obs[i]; if (o.z > player.z + 18 || Math.abs(o.x) > 20) { scene.remove(o.root); if (o.marker) scene.remove(o.marker); if (o.tag) scene.remove(o.tag); obs.splice(i, 1); } }
  // 풍경 재배치·들썩
  for (const s of scenery) { if (s.z > player.z + 22) placeScenery(s, s.z - (LOW ? 26 : 38) * 9); if (s.hop > 0) { s.hop = Math.max(0, s.hop - dt * 1.4); s.obj.position.y = Math.abs(Math.sin(s.hop * 18)) * s.hop * .6; } }
  if (crumbs) updCrumbs(player.z);
  if (table) table.position.z = Math.round(player.z / 120) * 120;
  // 캐릭터
  if (kid.state === 'jump' && !player.air) kid.set('land');
  if (game.state === 'idle' || game.state === 'play' || game.state === 'retry') { if (!['jump', 'land', 'hit', 'run'].includes(kid.state)) kid.set('run'); }
  kid.root.position.set(player.x, player.y, player.z); kid.root.visible = !(player.inv > .3 && Math.floor(performance.now() / 90) % 2 === 0);
  kid.update(dt, game.state === 'play' ? (game.speed - 6) / 5 : .1, player.y, player.lanePush);
  // 해·그림자 따라가기
  sun.position.set(player.x - 14, 26, player.z - 7); sun.target.position.set(player.x, 0, player.z - 4);
  // 카메라: 낮게(작아진 눈높이) 따라감
  const tgt = new THREE.Vector3(player.x * .55, 2.5 + player.y * .35, player.z + 6.4);
  camPos.lerp(tgt, 1 - Math.exp(-dt * 6)); camLook.lerp(new THREE.Vector3(player.x * .3, 1.5 + player.y * .25, player.z - 12), 1 - Math.exp(-dt * 8));
  shake = Math.max(0, shake - dt * 1.8); const sh = shake * shake * .32;
  camera.position.copy(camPos).add(new THREE.Vector3(rnd(-sh, sh), rnd(-sh, sh), 0)); camera.lookAt(camLook);
}

// ───────── 화면 흐름
function show(name){ for (const k of ['start', 'calib', 'result']) $('scr-' + k).classList.toggle('hidden', k !== name); $('hud').classList.toggle('hidden', name !== 'hud'); }
const seg = $('modeSeg'); seg.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === mode); b.onclick = () => { seg.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); mode = b.dataset.v; localStorage.setItem('kmgiant.mode', mode); }; });
function camStatus(kind, text){ const c = $('camBox'); c.classList.toggle('ok', kind === 'ok'); c.classList.toggle('bad', kind !== 'ok'); $('camSt').textContent = text === 'PLAYER DETECTED' ? '보여요' : text === 'NO PLAYER' ? '안 보여요' : text; }
let calibCopy = null;
function copyCalib(on){ if (calibCopy) cancelAnimationFrame(calibCopy); calibCopy = null; if (!on) return; const src = $('c'), dst = $('calibView'); dst.width = src.width; dst.height = src.height; const ctx = dst.getContext('2d'); const loop = () => { ctx.drawImage(src, 0, 0); calibCopy = requestAnimationFrame(loop); }; loop(); }
async function startFlow(){
  audio.ensure(); audio.startAmbient();
  if (mode === 'camera') {
    show('calib'); calibrating = true;
    try {
      if (!motion) motion = new MotionController(input, { video: $('v'), canvas: $('c'), getLane: () => player.lane, onStatus: s => camStatus(s.kind === 'error' ? 'bad' : s.kind, s.text), onDebug: d => { if (DEV) $('dev').textContent = `fps ${d.fps} dx ${d.dx} drop ${d.drop} zone ${d.zone} arms ${d.armsUp}`; } });
      if (!motion.started) { $('calibMsg').textContent = '카메라를 켜는 중…'; await motion.start(); }
      motionReady = true; copyCalib(true);
      await motion.calibrate(3, (p, vis) => { $('ringFg').style.strokeDashoffset = 327 * (1 - p); $('calibNum').textContent = Math.max(1, Math.ceil(3 - p * 3)); $('calibMsg').textContent = vis ? (p < .99 ? '좋아요! 그대로 있어요' : '준비 완료!') : '머리와 어깨가 보이게 가운데에'; });
      if (!calibrating) return; copyCalib(false); $('camBox').classList.remove('off');
    } catch (e) { $('calibMsg').textContent = '카메라를 쓸 수 없어요 → 키보드로 해요'; await new Promise(r => setTimeout(r, 1800)); if (!calibrating) return; mode = 'keyboard'; $('camBox').classList.add('off'); }
    calibrating = false;
  } else $('camBox').classList.add('off');
  begin();
}
function begin(){
  show('hud'); $('pause').classList.add('hidden'); clearObs();
  Object.assign(game, { state: 'play', dodges: 0, hits: 0, combo: 0, maxCombo: 0, boomT: 6 }); player.lane = 1; player.inv = 0; player.y = 0; player.air = false; kid.set('run');
  if (motion && motionReady && mode === 'camera') { motion.active = true; motion.paused = false; }
  startLevel(0);
}
function toStart(){ calibrating = false; copyCalib(false); clearObs(); game.state = 'idle'; if (motion) motion.active = false; $('pause').classList.add('hidden'); show('start'); try { speechSynthesis.cancel(); } catch (e) {} }
$('btnStart').onclick = startFlow; $('btnCalibCancel').onclick = toStart; $('btnHome').onclick = toStart; $('btnQuit').onclick = toStart; $('btnResume').onclick = resume;
$('btnRetry').onclick = () => { audio.ensure(); if (mode === 'camera' && motionReady) { $('camBox').classList.remove('off'); begin(); } else startFlow(); };
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'play') pause('manual'); });
addEventListener('keydown', e => { if (e.key === 'Enter' && !$('scr-start').classList.contains('hidden')) startFlow(); if (e.key === 'm' || e.key === 'M') audio.setMuted(!audio.muted); });
if (DEV) $('dev').classList.remove('hidden');

// ───────── 시작
let last = performance.now(), fpsA = 0, fpsN = 0;
function loop(now){
  const dt = Math.min(.05, (now - last) / 1000); last = now; update(dt); renderer.render(scene, camera);
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
  if (Q.has('auto')) { mode = 'keyboard'; begin(); if (Q.get('level')) { clearObs(); startLevel(+Q.get('level') - 1); } }
  window.__giant = { game, player, obs, scene, camera, renderer, startLevel, pattern, update, move, jump, LANES };
})();
