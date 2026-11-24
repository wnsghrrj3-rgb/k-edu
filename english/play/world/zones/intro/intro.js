/* 첫 접속 · 문 뒤에 누가 있을까? — 통합 설계서 §8 EPISODE 0 (L1-1-1 · L1-1-2). 조림이 대신 몬스터 고고(2026-11-24 준호).
 * 흐름(정해진 답은 없고, 해 보면 다음이 열린다): 숲속의 문 → 문을 누르면 고고가 나온다 → 공을 던지면 물어 온다 → 공이 상자 뒤로 굴러간다 →
 *   상자를 열면 지팡이가 나온다(커졌다 작아졌다) → 고고를 따라 길 끝의 마을이 보인다 → 집을 누르면 그 놀이로 들어간다.
 * 회원가입 · 긴 설명 · 이름 입력 · 권한 요구 없음. 오른쪽 아래 「마을 →」로 언제든 건너뛴다. 주소에 ?village 를 붙이면 바로 마을(놀이에서 돌아올 때).
 * 영어: Open! · Hello! · Happy! · Ball · Go! · Big! · Small! · Let's go!
 * 확인용 주소: ?mute · ?auto=명령,…(door · pet · throw:가로_세로 · chest · lock:gogo|ball · drag:크기 · release · skip · step:초) → 끝나면 제목에 상태. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStage, AUTO, Q, clamp, rand } from '../../engine/stage.js?v=1';
import { sfx, chirp, tone, unlock, setMuted, isMuted } from '../../engine/sound.js?v=1';
import { createVoice } from '../../engine/voice.js?v=1';
import { createSparks } from '../../engine/fx.js?v=1';
import { createBrain } from '../../engine/brain.js?v=1';
import { createLearn } from '../../engine/learn.js?v=1';
import { runAuto } from '../../engine/auto.js?v=1';
import { createActor } from '../../engine/actor.js?v=1';

// ───────────────────────── 수치(준호가 만져 보고 바꾼다) ─────────────────────────
const T = {
  DOOR: { X: -2.7, Y: 0.7, Z: 0.34, R: 0.62, OPEN: -1.85, KNOCK: 2.6 },     // 문 가운데 · 높이 · 깊이 · 반지름 · 열린 각 · 안에서 두드리는 사이(초)
  HOME: [-0.7, 0.9],                      // 고고가 아이 앞에 서는 자리
  BALL: { Z: 0.85, R: 0.25, GRAVITY: 13, BOUNCE: 0.55, ROLL: 1.1, THROW: 0.9, THROW_MAX: 10, GO_SPEED: 2.2 },   // 공이 움직이는 면 · 반지름 · … · 이보다 세게 던지면 "Go!"
  CHEST: { X: 3.0, Z: 0.2, OPEN: -1.9 },  // 상자 자리 · 뚜껑이 열린 각
  FETCH_TO_CHEST: 2,                      // 이만큼 물어 온 뒤에는 공이 상자 뒤로 굴러간다
  SIZE_MIN: 0.45, SIZE_MAX: 1.8, BIG_AT: 1.35, SMALL_AT: 0.7, REARM: 0.12, DRAG_FULL: 0.42,
  GO_AFTER: 3.5,                          // Big 과 Small 을 다 듣고 손을 뗀 뒤 길을 떠나기까지(초)
  NUDGE: 8,                               // 가만두면 고고가 귀띔하기까지(초)
  VIEW: { door: [-2.7, 1.0, 2.5], meet: [-0.9, 1.05, 3.7], chest: [0.4, 1.05, 4.5], village: [8.3, 3.1, 3.6] },   // 장면마다 카메라가 보는 곳(가로, 높이)과 반 너비
  PLACE: { lab: [6.5, 3.5, -4.9, '../lab/'], restaurant: [8.2, 3.0, -4.6, '../restaurant/'], burger: [10.1, 3.1, -5.0, '../burger/'] },   // 마을의 집: 자리와 들어가는 주소
  PICK_PX: 70, FOLLOW: 26, LIFT_PX: 30,
  CAM: { AIM: [0, 1.05, 0], TILT: 13, FOV: 30, HALF_W: 4.5, MIN_DIST: 8.6 },
};

// ───────────────────────── 무대 ─────────────────────────
const canvas = document.getElementById('c'), sndEl = document.getElementById('snd'), skipEl = document.getElementById('skip'); if (AUTO) document.body.classList.add('auto');
const stage = createStage({ canvas, sky: ['#8fd0f2', '#cdebf7', '#eef8ea'], cam: T.CAM, hemi: ['#eaf6ff', '#8fbf7a', 0.95], sun: { power: 2.6, pos: [-4, 9, 7], box: [-12, 12, 9, -7] } }), { scene, camera } = stage;
stage.focus(...T.VIEW.door, true);
const pack = await new GLTFLoader().loadAsync(new URL('../../assets/forest.glb?v=1', import.meta.url).href), lab = await new GLTFLoader().loadAsync(new URL('../../assets/lab.glb?v=1', import.meta.url).href), part = {};
for (const g of [pack, lab]) g.scene.traverse(o => { if (o.isMesh) { part[o.name] = o; o.castShadow = o.name !== 'glade'; o.receiveShadow = true; } });
scene.add(part.glade, part.village);
const door = part.door; door.position.set(T.DOOR.X - T.DOOR.R, T.DOOR.Y, T.DOOR.Z); scene.add(door);
const chest = part.chest; chest.position.set(T.CHEST.X, 0, T.CHEST.Z); scene.add(chest); const lid = part.chest_lid; lid.position.set(T.CHEST.X, 0.46, T.CHEST.Z - 0.31); scene.add(lid);
const ballObj = part.redball; ballObj.visible = false; scene.add(ballObj);
const wandObj = part.wand; wandObj.material = wandObj.material.clone(); wandObj.material.emissive = new THREE.Color('#ffd766'); wandObj.material.emissiveIntensity = 0.3; wandObj.visible = false; scene.add(wandObj);
const gogo = await createActor(scene, { model: 'gogo' }), s = gogo.state; gogo.root.traverse(o => { if (o.isMesh) o.receiveShadow = !o.name.startsWith('GogoEyes'); });
gogo.place(T.DOOR.X, -0.9, 0); gogo.root.visible = false;
const fx = createSparks(scene, 300), learn = createLearn({ zone: 'world-intro', cell: 'L1-1-1' }), v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), vWord = new THREE.Vector3(), seen = new Set();
const voice = createVoice({ el: document.getElementById('word'), screenOf: stage.screenOf, onSaid: (w, by, name) => learn.note(w, { skill: name ? 'listen' : 'move', input: 'drag', game: 'episode0' }) });
const brain = createBrain(gogo, { bounds: { X: 4.6, Z0: 0.3, Z1: 1.35 }, onEnd: () => { if (!W.lock) gogo.lookAt(camera.position); } }), { run, wait, until, walk, face } = brain;
const say = kind => chirp(kind, s.size ** -0.9), head = () => vWord.set(s.pos.x, s.y + 1.15 * s.size, s.pos.z), pitch = () => clamp(1.25 - (s.size - 1) * 0.9, 0.3, 2), shout = (w, cls) => voice.word(w, head, { cls: cls || 'shout', by: 'gogo', pitch: pitch() });
const G = { phase: 'door', clock: 0, knock: 1.2, doorA: 0, doorTo: 0, doorWob: 0, lidA: 0, lidTo: 0, fetches: 0, idle: 0, heardBig: false, heardSmall: false, goIn: -1, lastTo: 1, dir: 0, dirT: 0 };
const ball = { x: 0, y: T.BALL.R, vx: 0, vy: 0, rot: 0, state: 'hidden', size: 1, to: 1, v: 0, big: false, small: false, thrown: false, rest: 0, name: 'ball', get r() { return T.BALL.R * this.size; } };
const W = { state: 'hidden', pos: new THREE.Vector3(T.CHEST.X, 0.5, 0.75), to: new THREE.Vector3(T.CHEST.X - 0.5, 1.45, 0.95), rest: new THREE.Vector3(T.CHEST.X - 0.5, 1.45, 0.95), lock: null, anchorY: 0, s0: 1, tilt: 0.12 };
const GOGO = { name: 'gogo', big: false, small: false, get size() { return s.size; }, get to() { return s.sizeTo; }, set to(v) { gogo.setSize(v); } };
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -T.BALL.Z), groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

// ───────────────────────── 이야기의 걸음 ─────────────────────────
function openDoor() {
  if (G.phase !== 'door') return; G.phase = 'meet'; G.doorTo = T.DOOR.OPEN; sfx.door(); seen.add('door'); voice.word('Open!', () => vWord.set(T.DOOR.X, 1.75, 0.4), { cls: 'shout', by: 'door' });
  fx.spark(v3.set(T.DOOR.X, T.DOOR.Y, 0.3), '#ffe9a8', 26, 0.5, 1.6); stage.focus(...T.VIEW.meet);
  run(async tok => {
    await wait(tok, 0.45); gogo.root.visible = true; gogo.place(T.DOOR.X, 0.2, 0); gogo.setMood('wow', 0.8); say('wow'); brain.hop(T.DOOR.X + 0.5, 1.1, 0, 'ground', 0.6); await until(tok, () => !brain.B.hop);
    await walk(tok, T.HOME[0], T.HOME[1]); await face(tok, 0); gogo.act('surprise', { mood: 'joy' }); shout('Hello!'); say('joy'); seen.add('hello'); await wait(tok, 1.3);
    ball.state = 'fly'; ball.x = T.DOOR.X + 0.2; ball.y = 0.5; ball.vx = 3.2; ball.vy = 2.2; ballObj.visible = true; sfx.pop(); gogo.lookAt(v3.set(0.5, 0.3, T.BALL.Z)); gogo.setMood('smile', 1.5); G.phase = 'play'; G.idle = 0;   // 공이 문에서 굴러 나온다
  });
}
/** 공이 멈추면 고고가 달려가 물어 온다. 몇 번 물어 온 뒤에는 공을 상자 뒤로 굴려 버린다. */
function fetch() {
  run(async tok => {
    gogo.setMood('joy', 1.2); say('joy'); await walk(tok, clamp(ball.x - 0.35, -4.4, 4.4), 0.95); if (ball.state !== 'free') return; ball.state = 'carried'; sfx.grab(); await wait(tok, 0.2);
    await walk(tok, T.HOME[0], T.HOME[1]); await face(tok, 0); G.fetches++; seen.add('fetch'); const away = G.fetches >= T.FETCH_TO_CHEST && G.phase === 'play';
    gogo.act('jump', { mood: 'joy' }); say('yum'); await wait(tok, 0.3); ball.state = 'fly'; ball.thrown = false; ball.x = s.pos.x + 0.3; ball.y = 0.7 * s.size; ball.vx = away ? 5.4 : 1.4; ball.vy = away ? 3.6 : 3.2; sfx.whoosh(); await wait(tok, 0.7);
    if (away) { G.phase = 'chest'; seen.add('lost'); await until(tok, () => ball.state === 'lost', 4); gogo.setMood('wow', 1); say('hm'); stage.focus(...T.VIEW.chest); await walk(tok, T.CHEST.X - 1.0, 0.95); await face(tok, Math.atan2(T.CHEST.X - s.pos.x, T.CHEST.Z - s.pos.z)); gogo.pose('poke', 1); gogo.lookAt(v3.set(T.CHEST.X, 0.4, T.CHEST.Z)); await wait(tok, 1.4); gogo.pose('poke', 0); }
  });
}
function openChest() {
  if (G.phase !== 'chest' || G.lidTo) return; G.lidTo = T.CHEST.OPEN; sfx.door(); seen.add('chest'); voice.word('Open!', () => vWord.set(T.CHEST.X, 1.2, T.CHEST.Z), { cls: 'shout', by: 'chest', gap: 0.5 }); fx.spark(v3.set(T.CHEST.X, 0.6, T.CHEST.Z), '#ffe9a8', 30, 0.4, 1.8); G.phase = 'wand';
  W.state = 'rest'; wandObj.visible = true; W.pos.set(T.CHEST.X, 0.5, T.CHEST.Z + 0.2); ball.state = 'fly'; ball.thrown = false; ballObj.visible = true; ball.x = T.CHEST.X - 0.2; ball.y = 0.7; ball.vx = -2.6; ball.vy = 4.2; sfx.spark(false);
  run(async tok => { gogo.act('surprise', { mood: 'wow' }); say('wow'); gogo.lookAt(W.rest); await wait(tok, 1.1); await walk(tok, 0.9, 0.9); await face(tok, 0); });
}
/** 길을 떠난다: 고고가 길머리로 달려가 "Let's go!" — 카메라가 언덕 위 마을로 옮겨 간다. */
function letsGo() {
  if (G.phase === 'village' || G.phase === 'go') return; if (G.phase === 'door') { G.doorTo = T.DOOR.OPEN; gogo.root.visible = true; gogo.place(T.HOME[0], T.HOME[1], 0); }
  G.phase = 'go'; release(true); W.state = W.state === 'hidden' ? 'hidden' : 'rest'; gogo.setSize(1); skipEl.style.display = 'none';
  run(async tok => { gogo.act('jump', { mood: 'joy' }); shout("Let's go!"); say('joy'); seen.add('go'); await wait(tok, 0.9); stage.focus(...T.VIEW.village); G.phase = 'village'; await walk(tok, 4.3, 0.95); await face(tok, 0.5); gogo.act('jump', { mood: 'joy' }); await wait(tok, 0.9); await face(tok, 0); });   // 외치고 → 카메라가 마을로 → 고고는 길머리로 달려간다
}
function pet() { if (brain.busy && s.act) return; seen.add('pet'); shout('Happy!', 'yum'); run(async tok => { gogo.act('jump', { mood: 'joy' }); say('joy'); s.sizeV += 1.0; fx.spark(head(), '#ffc4d6', 8, 0.25, 0.9); await wait(tok, 0.9); }); }

// ───────────────────────── 손 ─────────────────────────
const P = { down: false, x: 0, y: 0, mode: null }, near = (p, x, y, r = T.PICK_PX) => { const c = stage.screenOf(p); return Math.hypot(c.x - x, c.y - y) < r; };
const ballPos = out => out.set(ball.x, ball.y, T.BALL.Z), gogoMid = out => out.set(s.pos.x, s.y + 0.55 * s.size, s.pos.z);
function lockOn(t, y) { W.lock = t; W.state = 'held'; W.anchorY = y; W.s0 = t.to; sfx.tick(); if (t === GOGO) { G.lastTo = t.to; G.dir = 0; brain.stop(); gogo.stop(); s.busy = true; voice.word('Gogo', head, { name: true, by: 'gogo' }); } else voice.word('Ball', () => vWord.set(ball.x, ball.y + ball.r + 0.15, T.BALL.Z), { name: true, by: 'ball' }); }
function dragBy(y) { const span = Math.log(T.SIZE_MAX / T.SIZE_MIN), raw = Math.log(W.s0) + (W.anchorY - y) / (innerHeight * T.DRAG_FULL) * span, ls = clamp(raw, Math.log(T.SIZE_MIN), Math.log(T.SIZE_MAX)); if (ls !== raw) { W.anchorY = y; W.s0 = Math.exp(ls); } const z = Math.exp(ls); if (Math.abs(z - W.lock.to) > 0.05) sfx.ping(z); W.lock.to = z; }
function release(quiet) {
  const t = W.lock; if (!t) return; W.lock = null; if (W.state === 'held') W.state = 'rest'; if (quiet) return; sfx.pop(); G.goIn = G.heardBig && G.heardSmall ? T.GO_AFTER : -1;
  if (t === GOGO) run(async tok => { if (s.sizeTo > T.BIG_AT) { gogo.setMood('joy', 1); say('big'); await walk(tok, s.pos.x > 0 ? -1.6 : 1.6, 0.95); await face(tok, 0); } else if (s.sizeTo < T.SMALL_AT) { gogo.setMood('fluster', 0.7); say('small'); await walk(tok, s.pos.x + 1.0, 1.1); await walk(tok, s.pos.x - 1.4, 0.8); await face(tok, 0); } else { gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); } });
}
canvas.addEventListener('pointerdown', e => {
  P.down = true; P.x = e.clientX; P.y = e.clientY; P.mode = null; G.idle = 0; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} unlock(); const x = e.clientX, y = e.clientY;
  if (G.phase === 'village') { for (const k in T.PLACE) { const p = T.PLACE[k]; if (near(v3.set(p[0], p[1], p[2]), x, y, 95)) { sfx.spark(false); location.href = new URL(p[3], location.href).href; return; } } return; }
  if (G.phase === 'door') { if (near(v3.set(T.DOOR.X, T.DOOR.Y, T.DOOR.Z), x, y, 150)) openDoor(); else G.doorWob = 1; return; }
  if (W.state !== 'hidden' && (W.state === 'rest' && near(v3.copy(W.pos).setY(W.pos.y - 0.3), x, y, 80))) { W.state = 'held'; P.mode = 'wand'; sfx.tick(); return; }
  const onBall = ball.state !== 'hidden' && ball.state !== 'lost' && ball.state !== 'carried' && near(ballPos(v3), x, y, T.PICK_PX * Math.max(1, ball.size)), onGogo = gogo.root.visible && near(gogoMid(v3), x, y, T.PICK_PX * 1.4 * s.size);
  if (W.state !== 'hidden' && (onBall || onGogo)) { P.mode = 'wand'; lockOn(onBall ? ball : GOGO, y); return; }          // 지팡이가 있으면 누른 것에 날아가 붙는다
  if (onBall) { P.mode = 'ball'; ball.state = 'held'; ball.vx = ball.vy = 0; sfx.grab(); voice.word('Ball', () => vWord.set(ball.x, ball.y + ball.r + 0.15, T.BALL.Z), { name: true, by: 'ball' }); if (!brain.B.hop) brain.stop(); return; }
  if (onGogo) { pet(); return; }
  if (G.phase === 'chest' && near(v3.set(T.CHEST.X, 0.35, T.CHEST.Z), x, y, 120)) { openChest(); return; }
  if (gogo.root.visible && G.phase !== 'go' && stage.worldOn(groundPlane, x, y, v3) && v3.z > -0.2 && v3.z < 2.2) run(async tok => { await walk(tok, v3.x, clamp(v3.z, 0.3, 1.35)); });   // 빈 땅을 누르면 고고가 걸어온다
});
canvas.addEventListener('pointermove', e => { P.x = e.clientX; P.y = e.clientY; if (!P.down) return; if (P.mode === 'wand') { if (W.lock) dragBy(e.clientY); else { const tip = stage.screenOf(W.pos); if (ball.state !== 'lost' && ball.state !== 'hidden' && near(ballPos(v3), tip.x, tip.y, 60)) lockOn(ball, e.clientY); else if (near(gogoMid(v3), tip.x, tip.y, 80 * s.size)) lockOn(GOGO, e.clientY); } } });
const up = () => { if (!P.down) return; P.down = false; if (P.mode === 'wand') { release(); if (W.state === 'held') W.state = 'rest'; }
  if (P.mode === 'ball' && ball.state === 'held') { ball.state = 'fly'; const sp = Math.hypot(ball.vx, ball.vy) * T.BALL.THROW, k = sp > T.BALL.THROW_MAX ? T.BALL.THROW_MAX / sp : 1; ball.vx *= T.BALL.THROW * k; ball.vy *= T.BALL.THROW * k; ball.thrown = true; ball.rest = 0;
    if (Math.hypot(ball.vx, ball.vy) > T.BALL.GO_SPEED) { sfx.whoosh(); voice.word('Go!', () => vWord.set(ball.x, ball.y + 0.5, T.BALL.Z), { cls: 'shout', by: 'ball' }); gogo.setMood('joy', 0.8); seen.add('throw'); } } P.mode = null; };
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
sndEl.classList.toggle('off', isMuted()); sndEl.addEventListener('click', () => { setMuted(!isMuted()); sndEl.classList.toggle('off', isMuted()); });
document.getElementById('again').addEventListener('click', () => voice.again()); skipEl.addEventListener('click', () => { unlock(); letsGo(); });

// ───────────────────────── 매 장면 ─────────────────────────
function crossing(t, where) {
  const z = t.size, o = { by: t.name, pitch: t === GOGO ? pitch() : undefined };
  if (!t.big && z > T.BIG_AT) { t.big = true; G.heardBig = true; voice.word('Big!', where, { ...o, cls: 'big' }); sfx.spark(false); fx.spark(where(), '#ffcc70', 16, 0.3, 1.5); } else if (t.big && z < T.BIG_AT - T.REARM) t.big = false;
  if (!t.small && z < T.SMALL_AT) { t.small = true; G.heardSmall = true; voice.word('Small!', where, { ...o, cls: 'small' }); sfx.spark(true); fx.spark(where(), '#83c9ea', 12, 0.2, 1.2); } else if (t.small && z > T.SMALL_AT + T.REARM) t.small = false;
}
function stepBall(dt) {
  const b = ball, R = b.r; b.v += (110 * (b.to - b.size) - 9 * b.v) * dt; b.size = Math.max(0.05, b.size + b.v * dt);
  if (b.state === 'held') { if (stage.worldOn(plane, P.x, P.y - T.LIFT_PX, v3)) { const k = 1 - Math.exp(-T.FOLLOW * dt), nx = b.x + (clamp(v3.x, -4.8, 4.8) - b.x) * k, ny = b.y + (Math.max(R, v3.y) - b.y) * k; b.vx += ((nx - b.x) / dt - b.vx) * 0.35; b.vy += ((ny - b.y) / dt - b.vy) * 0.35; b.x = nx; b.y = ny; } }
  else if (b.state === 'fly' || b.state === 'free') {
    b.vy -= T.BALL.GRAVITY * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot -= b.vx * dt / Math.max(R, 0.05);
    if (b.x < -4.9) { b.x = -4.9; b.vx = Math.abs(b.vx) * 0.5; } if (b.x > 4.7 && G.phase !== 'chest') { b.x = 4.7; b.vx = -Math.abs(b.vx) * 0.5; }
    if (b.y < R) { b.y = R; const hit = -b.vy; if (hit > 1.3) { b.vy = hit * T.BALL.BOUNCE; sfx.bounce(hit / 7); } else { b.vy = 0; b.vx *= Math.max(0, 1 - T.BALL.ROLL * dt); } }
    if (G.phase === 'chest' && b.x > T.CHEST.X - 0.2 && b.state === 'fly') { b.state = 'lost'; ballObj.visible = false; sfx.thud(0.6); fx.spark(v3.set(T.CHEST.X + 0.3, 0.3, T.CHEST.Z), '#f7ebd5', 8, 0.3, 0.7); return; }   // 상자 뒤로 굴러 들어갔다
    const still = b.y <= R + 0.001 && Math.abs(b.vx) < 0.25 && b.vy === 0;
    if (still && b.state === 'fly') { b.state = 'free'; b.vx = 0; if ((G.phase === 'play' || G.phase === 'wand') && b.thrown && !W.lock && !brain.B.hop) fetch(); b.thrown = false; }
  } else if (b.state === 'carried') { b.x = s.pos.x + Math.sin(s.heading) * 0.36 * s.size; b.y = s.y + 0.5 * s.size; b.rot = 0; }
  if (b.state !== 'hidden' && b.state !== 'lost') { ballObj.position.set(b.x, b.y, b.state === 'carried' ? s.pos.z + Math.cos(s.heading) * 0.36 * s.size : T.BALL.Z); ballObj.rotation.set(0, 0, b.rot); ballObj.scale.setScalar(b.size); crossing(b, () => vWord.set(b.x, b.y + R + 0.2, T.BALL.Z)); }
}
function step(dt) {
  const c = (G.clock += dt); brain.tick(dt);
  // 문: 안에서 누가 똑똑 두드린다(문이 들썩이고 틈으로 빛이 샌다). 누르면 열린다.
  if (G.phase === 'door' && (G.knock -= dt) <= 0) { G.knock = T.DOOR.KNOCK; G.doorWob = 1; sfx.thud(0.5); tone(260, 240, 0.08, { g: 0.1, at: 0.16 }); fx.spark(v3.set(T.DOOR.X + T.DOOR.R * 0.9, T.DOOR.Y, 0.2), '#ffe9a8', 5, 0.15, 0.6); }
  G.doorWob *= Math.exp(-5 * dt); G.doorA += (G.doorTo - G.doorA) * Math.min(1, 6 * dt); door.rotation.y = G.doorA + Math.sin(c * 30) * 0.05 * G.doorWob;
  G.lidA += (G.lidTo - G.lidA) * Math.min(1, 7 * dt); lid.rotation.x = G.lidA + (G.phase === 'chest' ? Math.sin(c * 5) * 0.03 : 0);
  if (G.phase === 'chest' && Math.random() < dt * 5) fx.spark(v3.set(T.CHEST.X + rand(-0.4, 0.4), 0.5, T.CHEST.Z + 0.3), '#ffe9a8', 1, 0.05, 0.4, { up: true });   // 상자가 반짝인다
  stepBall(dt);
  // 지팡이
  if (W.state !== 'hidden') {
    if (W.state === 'held' && stage.worldOn(plane, P.x, P.y, v3)) W.to.set(v3.x - 0.3, v3.y + 0.72, T.BALL.Z + 0.2); else if (W.state === 'rest') W.to.copy(W.rest);
    const kw = 1 - Math.exp(-(W.state === 'held' ? 26 : 6) * dt), dx = (W.to.x - W.pos.x) * kw; W.pos.lerp(W.to, kw); W.tilt += ((W.state === 'held' ? 0.42 : 0.12) - dx * 4 - W.tilt) * Math.min(1, 12 * dt);
    wandObj.position.copy(W.pos); if (W.state === 'rest') wandObj.position.y += Math.sin(c * 2.2) * 0.05; wandObj.rotation.set(0, c * (W.lock ? 5 : 1.2), 0); wandObj.rotation.z = W.tilt; wandObj.rotation.order = 'ZXY'; wandObj.material.emissiveIntensity = W.lock ? 0.9 : 0.35 + 0.2 * Math.sin(c * 3);
    if (Math.random() < dt * (W.lock ? 60 : 6)) fx.spark(W.pos, '#ffe9a8', 1, 0.12, 0.5);
    if (W.lock) { const to = W.lock === GOGO ? gogoMid(v3) : ballPos(v3), k = Math.random(); fx.spark(v3b.copy(W.pos).lerp(to, k), k < 0.5 ? '#ffd766' : '#c9b8ff', 1, 0.05, 0.3); }
  }
  crossing(GOGO, head);
  if (W.lock === GOGO) { const d = s.sizeTo - G.lastTo; G.lastTo = s.sizeTo; if (Math.abs(d) > 0.001) { G.dir = Math.sign(d); G.dirT = d > 0 ? 1.3 : 0.5; } else if ((G.dirT -= dt) <= 0) G.dir = 0;
    gogo.pose('hands', G.dir > 0 ? 1 : 0); gogo.pose('fluster', G.dir < 0 ? 1 : 0); if (G.dir > 0) gogo.setMood('wow', 0.4); else if (G.dir < 0) gogo.setMood('fluster', 0.4); gogo.lookAt(G.dir > 0 ? v3.set(s.pos.x, s.y + 0.5 * s.size, s.pos.z + 0.55 * s.size) : W.pos); }
  else if (W.state === 'held') gogo.lookAt(W.pos); else if (!brain.busy && (ball.state === 'held' || ball.state === 'fly')) gogo.lookAt(ballPos(v3));
  // 귀띔(재촉이 아니라 고고의 몸짓): 공을 가만두면 고고가 공을 톡 친다
  if (G.phase === 'play' && !brain.busy && ball.state === 'free' && !P.down) { if ((G.idle += dt) > T.NUDGE) { G.idle = 0; seen.add('nudge'); run(async tok => { await walk(tok, ball.x - 0.5, 0.95); await face(tok, Math.PI / 2); gogo.pose('poke', 1); await wait(tok, 0.3); ball.state = 'fly'; ball.vx = 1.6; ball.vy = 2.4; ball.thrown = false; sfx.bounce(0.4); await wait(tok, 0.4); gogo.pose('poke', 0); gogo.lookAt(camera.position); gogo.setMood('smile', 1.5); }); } }
  if (G.goIn > 0 && !W.lock && !P.down && (G.goIn -= dt) <= 0 && G.phase === 'wand') letsGo();
  if (G.phase === 'village' && Math.random() < dt * 9) { const k = Object.keys(T.PLACE)[Math.floor(Math.random() * 3)], p = T.PLACE[k]; fx.spark(v3.set(p[0], p[1] + 0.6, p[2]), '#ffe9a8', 1, 0.35, 0.5, { up: true }); }   // 마을의 집들이 반짝인다(누르면 들어간다)
  gogo.update(dt); voice.tick(dt); fx.tick(dt);
}
gogo.on('step', (side, gait) => { if (gait === 'scurry') sfx.tick(); else { sfx.thud(s.size); if (gait === 'heavy') stage.shake(0.04); } });

// ───────────────────────── 돌리기 ─────────────────────────
const summary = () => ({ phase: G.phase, places: Object.fromEntries(Object.entries(T.PLACE).map(([k, p]) => { const c = stage.screenOf(v3.set(p[0], p[1], p[2])); return [k, Math.round(c.x / innerWidth * 100) + '%,' + Math.round(c.y / innerHeight * 100) + '%']; })), gogo: { size: +s.size.toFixed(2), x: +s.pos.x.toFixed(2), z: +s.pos.z.toFixed(2), mood: s.mood, shown: gogo.root.visible }, ball: `${ball.state} x${ball.x.toFixed(1)} size${ball.size.toFixed(2)}`, fetches: G.fetches, wand: W.state, said: voice.said, seen: [...seen], learned: learn.log.length, errors: brain.errors });
window.__lab = { T, G, gogo, ball, W, step, summary, stage, openDoor, openChest, letsGo, pet };
if (Q.has('village')) { G.phase = 'village'; G.doorTo = G.doorA = T.DOOR.OPEN; gogo.root.visible = true; gogo.place(4.3, 0.95, 0); gogo.lookAt(camera.position); skipEl.style.display = 'none'; stage.focus(...T.VIEW.village, true); }   // 놀이에서 돌아올 때는 바로 마을로
if (AUTO) runAuto(stage, { step, summary, settle: 20, commands: {
  door: () => openDoor(), pet: () => pet(), chest: () => openChest(), skip: () => letsGo(),
  throw: async (a, b, tick) => { for (let i = 0; i < 400 && (ball.state !== 'free' || brain.busy); i++) await tick(); const [vx, vy] = a.split('_').map(Number); ball.state = 'fly'; ball.vx = vx; ball.vy = vy; ball.y = 1; ball.thrown = true; seen.add('throw'); voice.word('Go!', () => vWord.set(ball.x, ball.y + 0.5, T.BALL.Z), { cls: 'shout', by: 'ball' }); },
  lock: a => { const t = a === 'ball' ? ball : GOGO; P.down = true; P.mode = 'wand'; const c = stage.screenOf(t === ball ? ballPos(v3) : gogoMid(v3)); P.x = c.x; P.y = c.y; lockOn(t, c.y); },
  drag: async (a, b, tick) => { const s0 = W.lock.to; for (let i = 1; i <= 36; i++) { W.lock.to = s0 + (+a - s0) * i / 36; await tick(); } },
  release: () => { P.down = false; P.mode = null; release(); },
} }); else { stage.play(step); document.title = 'READY ' + document.title; }
