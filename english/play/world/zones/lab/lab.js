/* 마법 연구소 · 커졌다 작아졌다 (Big / Small) — 통합 설계서 §11 「거대 조림이」(L1-3-1), 주인공은 몬스터 고고.
 * 하는 일은 하나: 마법 지팡이를 대고 위로 끌면 커지고 아래로 끌면 작아진다(고고 · 사과 · 컵 · 의자 · 공).
 * 정답 · 점수 · 시간제한 · 설명 글 없음. 영어는 크기가 문턱을 넘는 순간의 "Big!" / "Small!" 과, 만졌을 때 나오는 그것의 이름.
 * 시험판(english/play/lab/)을 공통 엔진(world/engine/) 위로 옮긴 본판이다 — 놀이는 같다.
 * 확인용 주소: ?mute 소리 끔 · ?auto=명령,…(lock:이름 · drag:크기 · release · step:초 · tap:x:z) → 끝나면 제목에 상태를 적는다. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStage, AUTO, clamp, rand } from '../../engine/stage.js?v=1';
import { sfx, chirp, unlock, setMuted, isMuted } from '../../engine/sound.js?v=1';
import { createVoice } from '../../engine/voice.js?v=1';
import { createSparks } from '../../engine/fx.js?v=1';
import { createBrain } from '../../engine/brain.js?v=1';
import { createThing, stepThing, centerOf, topOf, pxRadius, pickAt, actorTarget } from '../../engine/things.js?v=1';
import { createLearn } from '../../engine/learn.js?v=1';
import { runAuto } from '../../engine/auto.js?v=1';
import { createActor } from '../../engine/actor.js?v=1';

// ───────────────────────── 수치(준호가 만져 보고 바꾼다) ─────────────────────────
const T = {
  SIZE_MIN: 0.45, SIZE_MAX: 1.8,            // 크기 범위
  BIG_AT: 1.35, SMALL_AT: 0.7, REARM: 0.12,  // "Big!" · "Small!" 문턱 · 다시 말하려면 문턱에서 이만큼 돌아와야 한다
  DRAG_FULL: 0.42,                           // 화면 높이의 이만큼 끌면 가장 작은 크기에서 가장 큰 크기까지 간다
  RELEASE_KICK: 1.6,                         // 놓는 순간 한 번 더 출렁이게 미는 힘
  BENCH: { X: 3.35, Z0: -0.95, Z1: 1.0, EDGE: 3.7 },   // 고고가 다니는 범위 · 실험대 끝
  HOME: [0, 0.3],                            // 고고가 서 있는 자리
  PLACE: { chair: [-2.55, -0.45], apple: [-1.2, -0.35], cup: [1.15, -0.35], ball: [2.45, -0.15], jar: [3.28, 0.92] },
  WAND_Z: 1.05, WAND_TIP: [-0.3, 0.72],      // 든 지팡이가 떠 있는 깊이 · 손가락에서 별까지(가로, 세로)
  WAND_FOLLOW: 26, WAND_BACK: 0.45,          // 지팡이가 손을 따라오는 빠르기 · 놓은 뒤 꽂이로 돌아가기까지(초)
  BREAK_PAD: 110,                            // 옆으로 이만큼(픽셀) 벗어나면 풀린다
  FULL_BIG: 1.68, FULL_SMALL: 0.52, DIZZY_SWEEP: 1.6,   // 다 컸다 · 다 작아졌다고 보는 크기 · 한쪽 끝을 떠나 이 시간(초) 안에 반대쪽 끝에 닿으면 어지럽다
  IDLE_POKE: 10,                             // 가만두면 혼자 물건을 건드려 보기까지(초)
  CUP_STAY: 9, PERCH_STAY: 6, CUP_UP: 5,     // 컵 안에 · 사과 위에 머무는 시간 · 쓰러진 컵이 일어나기까지
  SHAKE: 0.05,
  CAM: { AIM: [0, 1.15, 0], TILT: 17, FOV: 30, HALF_W: 4.05, MIN_DIST: 8.4 },
};
const NAME = { apple: 'Apple', cup: 'Cup', chair: 'Chair', ball: 'Ball', gogo: 'Gogo' }, R0 = { apple: [0.32, 0.6], cup: [0.385, 0.62], chair: [0.36, 0.95], ball: [0.27, 0.54] };

// ───────────────────────── 무대 ─────────────────────────
const canvas = document.getElementById('c'), sndEl = document.getElementById('snd'); if (AUTO) document.body.classList.add('auto');
const stage = createStage({ canvas, sky: ['#e6dcf6', '#d6cbee', '#b9a8dc'], cam: T.CAM }), { scene, camera } = stage;
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshStandardMaterial({ color: '#b9a7e0', roughness: 1 })); wall.position.set(0, 3, -1.76); wall.receiveShadow = true; scene.add(wall);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 12).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#a996cf', roughness: 1 })); ground.position.set(0, -2.5, 2); ground.receiveShadow = true; scene.add(ground);
const lab = await new GLTFLoader().loadAsync(new URL('../../assets/lab.glb?v=1', import.meta.url).href), part = {};
lab.scene.traverse(o => { if (o.isMesh) { part[o.name] = o; o.castShadow = o.name !== 'room'; o.receiveShadow = true; } });
scene.add(part.room);
const gogo = await createActor(scene, { model: 'gogo' }), s = gogo.state;
gogo.root.traverse(o => { if (o.isMesh) o.receiveShadow = !o.name.startsWith('GogoEyes'); });
gogo.place(T.HOME[0], T.HOME[1], 0); gogo.lookAt(camera.position);
const fx = createSparks(scene), learn = createLearn({ zone: 'world-lab', cell: 'L1-3-1' }), v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), vWord = new THREE.Vector3();
const voice = createVoice({ el: document.getElementById('word'), screenOf: stage.screenOf, onSaid: (w, by, name) => learn.note(w, { skill: name ? 'listen' : 'move', input: 'drag', game: 'big-small' }) });
const things = {}, seen = new Set();
for (const name of ['chair', 'apple', 'cup', 'ball']) { const [x, z] = T.PLACE[name]; things[name] = Object.assign(createThing(scene, part[name], { name, x, z, r: R0[name][0], h: R0[name][1], ball: name === 'ball', state: name === 'cup' ? 'up' : 'home' }), { big: false, small: false }); things[name].onBounce = v => sfx.bounce(v / 6); }
const GOGO = actorTarget(gogo, 'gogo'), targets = [GOGO, ...Object.values(things)], cup = things.cup, apple = things.apple, ball = things.ball;
const jar = part.jar; jar.position.set(T.PLACE.jar[0], 0, T.PLACE.jar[1]); scene.add(jar);
const wandRest = new THREE.Vector3(T.PLACE.jar[0] - 0.05, 0.9, T.PLACE.jar[1]);
const W = { obj: part.wand, state: 'rest', pos: wandRest.clone(), to: wandRest.clone(), lock: null, anchorY: 0, s0: 1, back: 0, tilt: 0.12, lastPing: 1 };
W.obj.material = W.obj.material.clone(); W.obj.material.emissive = new THREE.Color('#ffd766'); W.obj.material.emissiveIntensity = 0.25; scene.add(W.obj);
const voiceK = () => s.size ** -0.9, say = kind => chirp(kind, voiceK());      // 고고의 목소리: 클수록 낮다

// ───────────────────────── 고고의 머리(하고 싶은 일) ─────────────────────────
const brain = createBrain(gogo, { bounds: T.BENCH, onEnd: () => { if (!W.lock && W.state !== 'held') gogo.lookAt(camera.position); }, onLand: () => sfx.thud(s.size * 0.6) });
const B = brain.B, { run, wait, until, walk, face, hop } = brain; B.where = 'bench';
const L = { lastTo: 1, tBig: -99, tSmall: -99, dizzy: false, fallT: -1, dir: 0, dirT: 0, watch: 0 };
const cupY = () => Math.max(0.07 * cup.size, cup.h * cup.size + 0.03 - 0.74 * s.size);      // 컵 안에서 눈이 테두리 위로 나오는 높이
async function toBench(tok) {
  if (B.hop) await until(tok, () => !B.hop); if (B.where === 'bench') return;
  const t = B.where === 'cup' ? cup : apple; hop(t.x + 0.25, clamp(t.z + t.r * t.size + 0.42 * s.size + 0.15, T.BENCH.Z0, T.BENCH.Z1), 0, 'bench'); await until(tok, () => !B.hop);
}
async function approach(tok, t) { const side = s.pos.x >= t.x ? 1 : -1; await walk(tok, t.x + side * (t.r * t.size + 0.4 * s.size + 0.14), t.z + 0.5); await face(tok, Math.atan2(t.x - s.pos.x, t.z - s.pos.z)); }
function nudge(t, hard = 1) { t.tvx += rand(-1, 1) * 3 * hard; t.tvz += (Math.random() < 0.5 ? -1 : 1) * 5 * hard; if (t.ball) t.vx += (Math.random() < 0.5 ? -1 : 1) * 0.8 * hard; if (t === cup) sfx.clink(); else sfx.tick(); }
function fallNow() { gogo.act('fall', { lock: true }); gogo.setMood('wow', 0.5); L.fallT = 0; say('oops'); }
const name = t => voice.word(NAME[t.name], () => topOf(t, vWord), { name: true, by: t.name });

/** 고고를 놓은 뒤: 크면 쿵쿵 걷고, 작으면 종종거리다 컵에 들어가고, 끝에서 끝으로 갔으면 어지럽다. */
async function afterSelf(tok) {
  if (L.dizzy) { L.dizzy = false; seen.add('dizzy'); gogo.setMood('dizzy', 3.2); gogo.pose('sway', 1); say('dizzy'); await wait(tok, 3); gogo.pose('sway', 0); gogo.setMood('smile', 1.2); await wait(tok, 0.8); }
  if (B.where !== 'bench') { if (B.where === 'cup') await wait(tok, T.CUP_STAY); await toBench(tok); return; }
  if (s.sizeTo > T.BIG_AT) { gogo.setMood('joy', 1); say('big'); await wait(tok, 0.5); const x = s.pos.x > 0 ? -1.7 : 1.7; await walk(tok, x, 0.6); await wait(tok, 0.3); await walk(tok, -x * 0.35, 0.5); gogo.setMood('smile', 1.5); await face(tok, 0); }
  else if (s.sizeTo < T.SMALL_AT) { gogo.setMood('fluster', 0.7); say('small'); await walk(tok, s.pos.x + (s.pos.x > 0.4 ? -0.9 : 0.9), 0.65); await intoCup(tok); }
  else { gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); }
}
async function intoCup(tok) {
  if (cup.state !== 'up' || cup.size < 0.8 || s.sizeTo * 0.36 > cup.size * 0.31) { await face(tok, 0); return; }
  await walk(tok, cup.x - 0.1, cup.z + cup.r * cup.size + 0.34); hop(cup.x, cup.z, cupY(), 'cup'); await until(tok, () => !B.hop);
  seen.add('cupHide'); gogo.act('peek', { mood: 'smile' }); say('joy'); sfx.clink(); await wait(tok, T.CUP_STAY); await toBench(tok);
}
/** 물건을 놓은 뒤: 다가가서 올려다보거나 내려다본다. 큰 사과에는 올라타고, 작은 의자에는 앉으려다 넘어진다. */
async function afterThing(tok, t) {
  await toBench(tok);
  if (t.state === 'gone' || t.state === 'roll' || t.state === 'drop') return;
  if (t.size > T.BIG_AT) {
    await approach(tok, t); gogo.lookAt(topOf(t, v3)); gogo.setMood('wow', 1.6); say('wow'); await wait(tok, 1.2);
    if (t === apple && s.size < T.SMALL_AT) { hop(t.x, t.z, t.h * t.size * 0.93, 'apple', 0.7); await until(tok, () => !B.hop); seen.add('appleClimb'); gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); gogo.setMood('smile', T.PERCH_STAY); gogo.lookAt(camera.position); await wait(tok, T.PERCH_STAY); await toBench(tok); }
    else gogo.setMood('smile', 1);
  } else if (t.size < T.SMALL_AT) {
    await approach(tok, t); gogo.lookAt(centerOf(t, v3)); gogo.setMood('smile', 1.5); say('hm'); await wait(tok, 0.9);
    if (t.name === 'chair' && s.size >= T.SMALL_AT) { await walk(tok, t.x, t.z + t.r * t.size + 0.34 * s.size); await face(tok, 0); await wait(tok, 0.25); seen.add('sitFall'); fallNow(); t.vy = 2.2; nudge(t, 1.5); await wait(tok, 2.7); gogo.setMood('smile', 1.2); }
    else { gogo.pose('poke', 1); await wait(tok, 0.35); nudge(t); await wait(tok, 0.35); gogo.pose('poke', 0); }
  } else { gogo.lookAt(centerOf(t, v3)); gogo.setMood('smile', 0.9); await wait(tok, 0.8); }
}
/** 심심하면 혼자 물건 하나를 건드려 본다. */
async function poke(tok) {
  const pool = Object.values(things).filter(t => (t.state === 'home' || t.state === 'up') && t.size > 0.6 && t.size < 1.5); if (!pool.length) return;
  const t = pool[Math.floor(Math.random() * pool.length)]; await toBench(tok); await approach(tok, t); gogo.lookAt(centerOf(t, v3)); gogo.pose('poke', 1); await wait(tok, 0.35); nudge(t); seen.add('poke'); name(t); await wait(tok, 0.4); gogo.pose('poke', 0);
  gogo.setMood('smile', 1.2); await wait(tok, 0.7); await walk(tok, rand(-0.6, 0.7), rand(0.3, 0.6)); await face(tok, 0);
}
function topple(dir) { cup.state = 'down'; cup.dir = dir; cup.t = T.CUP_UP; cup.tvx += 4; sfx.clink(); seen.add('cupKnock'); gogo.setMood('wow', 1.1); say('wow'); stage.shake(T.SHAKE * 0.6); }

// ── 물건마다 다른 버릇: 큰 공은 굴러떨어지고, 컵은 쓰러졌다 일어난다
ball.live = dt => {
  const t = ball, rr = t.r * t.size; t.floor = t.state === 'fall' ? -2.5 : 0;
  if (t.state === 'home') { if (t.big && (t.t -= dt) <= 0) { t.state = 'roll'; seen.add('ballOff'); L.watch = 2.5; gogo.setMood('wow', 1.4); say('wow'); } else t.vx += (-(t.x - t.home.x) * 3 - t.vx * 1.6) * dt; }
  else if (t.state === 'roll') { t.vx += (t.x >= 0 ? 1 : -1) * 2.6 * dt; if (Math.abs(t.x) > T.BENCH.EDGE + rr * 0.3) { t.state = 'fall'; t.floor = -2.5; t.vy = 0.01; t.t = 2.6; } }
  else if (t.state === 'fall') { if ((t.t -= dt) <= 0) { t.state = 'drop'; t.floor = 0; t.size = t.to = 1; t.v = 0; t.big = false; t.x = t.home.x; t.vx = 0; t.y = 3.2; t.vy = -0.01; fx.spark(v3.set(t.home.x, 1, t.home.z), '#9b8ad4', 16, 0.3, 1.4); sfx.spark(true); } }
  else if (t.state === 'drop' && t.y === 0 && t.vy === 0) t.state = 'home';
  t.x += t.vx * dt; t.roll -= t.vx * dt / Math.max(rr, 0.05);
};
cup.live = dt => {
  const t = cup;
  if (t.state === 'down') { t.lean += (Math.PI / 2 * t.dir - t.lean) * Math.min(1, 9 * dt); if ((t.t -= dt) <= 0 && Math.hypot(s.pos.x - t.x, s.pos.z - t.z) > t.r * t.size + 0.5 * s.size) { t.state = 'up'; t.vy = 2.6; t.y = 0.01; sfx.pop(); } }
  else t.lean += (0 - t.lean) * Math.min(1, 10 * dt);
};
cup.pose = ob => { ob.rotation.set(cup.tx * 0.12, 0, cup.tz * 0.12 - cup.lean); if (Math.abs(cup.lean) > 0.01) ob.position.y += Math.sin(Math.abs(cup.lean)) * cup.r * cup.size * 0.9; };

// ───────────────────────── 손(지팡이) ─────────────────────────
const benchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), wandPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -T.WAND_Z), P = { down: false, x: 0, y: 0, mode: null };
function setTo(t, sz) { sz = clamp(sz, T.SIZE_MIN, T.SIZE_MAX); if (Math.abs(Math.log(sz / W.lastPing)) > 0.07) { W.lastPing = sz; sfx.ping(sz); } t.to = sz; }
function lockOn(t, y) { W.lock = t; W.anchorY = y; W.s0 = t.to; W.lastPing = t.to; B.idle = 0; sfx.tick(); name(t); if (t === GOGO) { L.lastTo = t.to; L.dir = 0; brain.stop(); gogo.stop(); s.busy = true; } }
function dragBy(y) {
  const t = W.lock, span = Math.log(T.SIZE_MAX / T.SIZE_MIN), raw = Math.log(W.s0) + (W.anchorY - y) / (innerHeight * T.DRAG_FULL) * span, ls = clamp(raw, Math.log(T.SIZE_MIN), Math.log(T.SIZE_MAX));
  if (ls !== raw) { W.anchorY = y; W.s0 = Math.exp(ls); }                         // 끝에 닿은 채 더 끌면 그 자리에서 다시 잰다(돌아서면 바로 반응)
  setTo(t, Math.exp(ls));
}
function release() {
  const t = W.lock; if (!t) return; W.lock = null; sfx.pop();
  if (t === GOGO) { s.sizeV += Math.sign(t.to - 1 || 1) * T.RELEASE_KICK * 0.5; run(afterSelf); } else { t.v += Math.sign(t.to - 1 || 1) * T.RELEASE_KICK; run(tok => afterThing(tok, t)); }
}
function tapBench(x, z) {
  x = clamp(x, -T.BENCH.X, T.BENCH.X); z = clamp(z, T.BENCH.Z0, T.BENCH.Z1); B.idle = 0;
  for (const t of Object.values(things)) { const d = Math.hypot(x - t.x, z - t.z), need = t.r * t.size + 0.3 * s.size; if (d < need) z = Math.min(T.BENCH.Z1, t.z + need); }    // 물건 속을 누르면 그 앞으로
  run(async tok => { await toBench(tok); gogo.lookAt(v3.set(x, 0, z)); gogo.goTo(x, z); await until(tok, () => !s.target, 12); });
}
canvas.addEventListener('pointerdown', e => {
  P.down = true; P.x = e.clientX; P.y = e.clientY; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} unlock();
  const tip = stage.screenOf(W.pos), t = pickAt(stage, targets, e.clientX, e.clientY);
  if (W.state !== 'held' && Math.hypot(tip.x - e.clientX, tip.y - e.clientY + 40) < 70) { W.state = 'held'; P.mode = 'wand'; sfx.tick(); B.idle = 0; }       // 지팡이를 집는다
  else if (t) { W.state = 'held'; P.mode = 'wand'; lockOn(t, e.clientY); }                                                                                   // 대상을 바로 누르면 지팡이가 날아온다
  else { P.mode = 'walk'; if (stage.worldOn(benchPlane, e.clientX, e.clientY, v3)) tapBench(v3.x, v3.z); }
});
canvas.addEventListener('pointermove', e => {
  P.x = e.clientX; P.y = e.clientY; if (!P.down) return;
  if (P.mode === 'wand') {
    if (W.lock) { dragBy(e.clientY); const c = stage.screenOf(centerOf(W.lock, v3)); if (Math.abs(c.x - e.clientX) > pxRadius(stage, W.lock) + T.BREAK_PAD || W.lock.state === 'gone') release(); }
    else { const tip = stage.screenOf(W.pos), t = pickAt(stage, targets, tip.x, tip.y) || pickAt(stage, targets, e.clientX, e.clientY); if (t) lockOn(t, e.clientY); }
  } else if (P.mode === 'walk' && stage.worldOn(benchPlane, e.clientX, e.clientY, v3) && s.target && B.where === 'bench') gogo.goTo(clamp(v3.x, -T.BENCH.X, T.BENCH.X), clamp(v3.z, T.BENCH.Z0, T.BENCH.Z1));
});
const up = () => { if (!P.down) return; P.down = false; if (P.mode === 'wand') { release(); W.state = 'back'; W.back = T.WAND_BACK; } P.mode = null; };
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
sndEl.classList.toggle('off', isMuted()); sndEl.addEventListener('click', () => { setMuted(!isMuted()); sndEl.classList.toggle('off', isMuted()); });
document.getElementById('again').addEventListener('click', () => voice.again());

// ───────────────────────── 매 장면 ─────────────────────────
let clock = 0;
function crossing(t) {
  const sz = t.size, mine = t === GOGO, o = { by: t.name, pitch: mine ? clamp(1.25 - (sz - 1) * 0.9, 0.3, 2) : undefined, rate: mine && sz > 1.2 ? 0.8 : undefined };   // 고고의 한마디는 고고 목소리(클수록 낮게)
  if (!t.big && sz > T.BIG_AT) { t.big = true; voice.word('Big!', () => topOf(t, vWord), { ...o, cls: 'big' }); sfx.spark(false); fx.spark(topOf(t, v3), '#ffcc70', 18, 0.3 * sz, 1.6); if (t === ball) t.t = 0.5; } else if (t.big && sz < T.BIG_AT - T.REARM) t.big = false;
  if (!t.small && sz < T.SMALL_AT) { t.small = true; voice.word('Small!', () => topOf(t, vWord), { ...o, cls: 'small' }); sfx.spark(true); fx.spark(topOf(t, v3), '#83c9ea', 14, 0.2, 1.2); } else if (t.small && sz > T.SMALL_AT + T.REARM) t.small = false;
}
function step(dt) {
  clock += dt; const gs = s.size; brain.tick(dt);
  // 지팡이: 든 동안에는 손가락 위쪽에 별이 오게 따라온다. 놓으면 잠깐 있다가 꽂이로 돌아간다.
  if (W.state === 'held' && stage.worldOn(wandPlane, P.x, P.y, v3)) W.to.set(v3.x + T.WAND_TIP[0], v3.y + T.WAND_TIP[1], T.WAND_Z);
  else if (W.state === 'back' && (W.back -= dt) <= 0) { W.to.copy(wandRest); if (W.pos.distanceTo(wandRest) < 0.03) W.state = 'rest'; }
  const kw = 1 - Math.exp(-(W.state === 'held' ? T.WAND_FOLLOW : 7) * dt), dx = (W.to.x - W.pos.x) * kw; W.pos.lerp(W.to, kw);
  W.tilt += ((W.state === 'held' ? 0.42 : 0.12) - dx * 4 - W.tilt) * Math.min(1, 12 * dt); W.obj.position.copy(W.pos); W.obj.rotation.set(0, clock * (W.lock ? 5 : 1.2), 0); W.obj.rotation.z = W.tilt; W.obj.rotation.order = 'ZXY';
  if (W.state === 'rest') W.obj.position.y += Math.sin(clock * 2.2) * 0.035;
  W.obj.material.emissiveIntensity = W.lock ? 0.9 : 0.3 + 0.2 * Math.sin(clock * 3);
  if (Math.random() < dt * (W.lock ? 60 : W.state === 'rest' ? 3 : 10)) fx.spark(W.pos, '#ffe9a8', 1, 0.12, 0.5);
  if (W.lock) { const c = centerOf(W.lock, v3), k = Math.random(); fx.spark(v3b.copy(W.pos).lerp(c, k), k < 0.5 ? '#ffd766' : '#c9b8ff', 1, 0.05, 0.3); if (W.lock.state === 'gone' || W.lock.state === 'fall') release(); }

  for (const t of Object.values(things)) { t.lit = W.lock === t; stepThing(t, dt); crossing(t); }
  crossing(GOGO);

  // 지팡이가 고고에게 닿아 있는 동안: 커지면 놀라서 제 손을 내려다보고, 작아지면 허둥댄다
  if (W.lock === GOGO) {
    const d = s.sizeTo - L.lastTo; L.lastTo = s.sizeTo;                                // 손이 끄는 쪽(용수철이 출렁이는 것은 치지 않는다)
    if (Math.abs(d) > 0.001) { L.dir = Math.sign(d); L.dirT = d > 0 ? 1.3 : 0.5; } else if ((L.dirT -= dt) <= 0) L.dir = 0;   // 커진 뒤에는 한동안 손을 들여다본다
    gogo.pose('hands', L.dir > 0 ? 1 : 0); gogo.pose('fluster', L.dir < 0 ? 1 : 0); if (L.dir > 0) gogo.setMood('wow', 0.4); else if (L.dir < 0) gogo.setMood('fluster', 0.4);
    if (L.dir > 0) gogo.lookAt(v3.set(s.pos.x + Math.sin(s.heading) * 0.55 * gs, s.y + 0.5 * gs, s.pos.z + Math.cos(s.heading) * 0.55 * gs)); else gogo.lookAt(W.pos);
  } else if (W.state === 'held') gogo.lookAt(W.pos);                                    // 지팡이를 눈으로 따라간다
  else if (L.watch > 0) { L.watch -= dt; gogo.lookAt(centerOf(ball, v3)); if (L.watch <= 0 && !B.tok) gogo.lookAt(camera.position); }
  // 끝에서 끝으로: 다 키웠다가 단숨에 다 줄이면(또는 그 반대) 어지럽다. tBig · tSmall = 그 끝에 마지막으로 있던 때
  if (gs > T.FULL_BIG) { if (clock - L.tSmall < T.DIZZY_SWEEP) { L.dizzy = true; L.tSmall = -99; } L.tBig = clock; }
  if (gs < T.FULL_SMALL) { if (clock - L.tBig < T.DIZZY_SWEEP) { L.dizzy = true; L.tBig = -99; } L.tSmall = clock; }
  if (L.fallT >= 0) { const was = L.fallT; L.fallT += dt; if (was < 0.5 && L.fallT >= 0.5) { gogo.setMood('dizzy', 1.5); sfx.thud(gs); stage.shake(T.SHAKE * gs * 0.5); } if (L.fallT > 2.5) L.fallT = -1; }

  // 컵 안 · 사과 위
  if (B.where === 'cup') { s.pos.x = cup.x; s.pos.z = cup.z; s.y = cupY(); s.target = null;
    if (cup.state !== 'up' || cup.size < 0.75 || s.sizeTo * 0.36 > cup.size * 0.34) { const grew = s.sizeTo * 0.36 > cup.size * 0.34; seen.add('cupPop'); run(async tok => { await toBench(tok); if (grew && cup.state === 'up') topple(-1); gogo.setMood('wow', 1); if (W.lock !== GOGO) await afterSelf(tok); }); if (W.lock === GOGO) s.busy = true; } }
  if (B.where === 'apple') { s.pos.x = apple.x; s.pos.z = apple.z; s.y = apple.h * apple.size * 0.93; s.target = null; if (apple.size < T.BIG_AT - 0.2 || s.sizeTo > 0.95) run(async tok => { await toBench(tok); gogo.setMood('wow', 0.8); }); }
  // 부딪힘: 큰 고고가 걷다가 컵을 쓰러뜨린다 · 공은 차이고 · 사과와 의자는 비켜 간다
  if (B.where === 'bench' && !B.hop) for (const t of Object.values(things)) {
    if (t.y > 0.3 || t.state === 'fall' || t.state === 'gone') continue; const ddx = s.pos.x - t.x, ddz = s.pos.z - t.z, d = Math.hypot(ddx, ddz) || 0.001, need = (t === cup && gs > T.BIG_AT ? 0.42 : 0.3) * gs + t.r * t.size * 0.85;   // 큰 고고는 컵 곁을 지나기만 해도 건드린다
    if (d >= need) continue;
    if (t === cup && t.state === 'up' && gs > T.BIG_AT && s.v > 0.05) topple(ddx > 0 ? 1 : -1); else if (t.ball) t.vx -= ddx / d * 3 * dt * 8;
    if (!(t === cup && t.state === 'down')) { s.pos.x += ddx / d * (need - d); s.pos.z = clamp(s.pos.z + ddz / d * (need - d), T.BENCH.Z0, T.BENCH.Z1); }
  }
  // 심심하면 혼자 건드려 본다
  if (!B.tok && !W.lock && W.state !== 'held' && !s.moving && !s.act && B.where === 'bench') { B.idle += dt; if (B.idle > T.IDLE_POKE) run(poke); } else if (W.lock || s.moving) B.idle = 0;

  gogo.update(dt); voice.tick(dt); fx.tick(dt);
}
// 발소리: 클수록 묵직하고, 큰 고고가 걸으면 실험대가 흔들려 물건이 들썩인다
gogo.on('step', (side, gait) => {
  const gs = s.size; if (gait === 'scurry') { sfx.tick(); return; } sfx.thud(gs);
  if (gait === 'heavy') { stage.shake(T.SHAKE * gs / 1.8); for (const t of Object.values(things)) if (t.y === 0 && t.state !== 'down') { t.vy = 0.9; t.y = 0.001; t.tvz += rand(-2, 2); } fx.spark(v3.set(s.pos.x, 0.05, s.pos.z), '#f7ebd5', 5, 0.3, 0.6); }
});

// ───────────────────────── 돌리기 ─────────────────────────
const summary = () => ({ gogo: { size: +s.size.toFixed(2), x: +s.pos.x.toFixed(2), z: +s.pos.z.toFixed(2), y: +s.y.toFixed(2), where: B.where, mood: s.mood, act: s.act ? s.act.name : '', gait: gogo.gait() },
  things: Object.fromEntries(Object.values(things).map(t => [t.name, t.size.toFixed(2) + ' ' + t.state + ' x' + t.x.toFixed(1) + ' y' + t.y.toFixed(1)])), said: voice.said, seen: [...seen], wand: W.state, learned: learn.log.length, errors: brain.errors });
const by = n => n === 'gogo' ? GOGO : things[n];
window.__lab = { T, gogo, things, W, B, step, summary, lockOn, setTo, release, tapBench, GOGO, camera, stage,
  at: n => { const c = stage.screenOf(n === 'wand' ? W.pos : centerOf(by(n), v3)); return [c.x, c.y + (n === 'wand' ? 40 : 0)]; } };   // 확인용: 화면에서의 자리
if (AUTO) runAuto(stage, { step, summary, commands: {
  lock: a => { const t = by(a), c = stage.screenOf(centerOf(t, v3)); P.x = c.x; P.y = c.y; P.down = true; P.mode = 'wand'; W.state = 'held'; lockOn(t, c.y); },
  drag: async (a, b, tick) => { const s0 = W.lock.to; for (let i = 1; i <= 36; i++) { setTo(W.lock, s0 + (+a - s0) * i / 36); P.y -= (+a - s0) * 3; await tick(); } },
  release: () => { P.down = false; P.mode = null; release(); W.state = 'back'; W.back = T.WAND_BACK; },
  tap: (a, b) => tapBench(+a, +b),
} }); else { stage.play(step); document.title = 'READY ' + document.title; }
