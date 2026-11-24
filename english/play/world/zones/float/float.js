/* 마법 연구소 · 둥둥 떠다니는 물건 (Up / Down) — 통합 설계서 §11 「중력 장치」(L1-3-3), 주인공은 몬스터 고고.
 * 하는 일은 하나: 대고 위로 끌어 올리면 둥실 떠서 머물고, 떠 있는 것을 아래로 끌어 내리거나 톡 치면 뚝 떨어진다(사과 · 공 · 의자 · 자동차 · 고고).
 * 실험대 오른쪽 「중력 장치」의 손잡이를 올리면 모든 것이 한꺼번에 떠오르고, 내리면 우수수 떨어진다.
 * 정답 · 점수 · 시간제한 · 설명 글 없음. 영어는 떠오르는 순간의 "Up!" · 떨어지는 순간의 "Down!" 과, 만졌을 때 나오는 그것의 이름.
 * 확인용 주소: ?mute 소리 끔 · ?auto=명령,…(lock:이름 · drag:위로(세계 길이):옆으로(픽셀) · release · tap:이름 · walk:x:z · step:초) → 끝나면 제목에 상태를 적는다.
 *   이름 = apple · ball · chair · car · gogo · machine */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStage, AUTO, clamp, rand } from '../../engine/stage.js?v=1';
import { sfx, chirp, tone, unlock, setMuted, isMuted } from '../../engine/sound.js?v=1';
import { createVoice } from '../../engine/voice.js?v=1';
import { createSparks } from '../../engine/fx.js?v=1';
import { createBrain } from '../../engine/brain.js?v=1';
import { createThing, stepThing, centerOf, topOf, pxRadius, pickAt } from '../../engine/things.js?v=1';
import { createLearn } from '../../engine/learn.js?v=1';
import { runAuto } from '../../engine/auto.js?v=1';
import { createActor } from '../../engine/actor.js?v=1';

// ───────────────────────── 수치(준호가 만져 보고 바꾼다) ─────────────────────────
const T = {
  UP_AT: 0.55,                               // 이 높이를 넘어 올라가는 순간 "Up!"
  PULL: 0.5,                                 // 떠 있는 것을 가장 높던 자리에서 이만큼 끌어 내리면 뚝 떨어진다("Down!")
  TOP: 2.05, HOVER_MIN: 1.15,                // 끌어 올릴 수 있는 끝 · 놓았을 때 머무는 가장 낮은 높이(고고 머리 위 — 밑에 서도 겹치지 않게)
  HOVER: { apple: 1.6, ball: 1.95, chair: 1.25, car: 1.75, gogo: 1.05 },   // 장치가 띄울 때의 높이
  FOLLOW: 20,                                // 든 것이 손을 따라오는 빠르기
  FLOAT_K: 26, FLOAT_C: 4.5, BOB: 0.07, SPIN: 0.5,   // 떠 있을 때: 제 높이로 돌아가는 용수철 · 까딱임 · 도는 빠르기
  GRAV: 14, REST: 1.2, BOUNCE: { apple: 0.3, ball: 0.8, chair: 0.26, car: 0.36 },   // 떨어지는 빠르기 · 이보다 느리면 멈춘다 · 튀는 정도
  FLICK: 3.4, BREAK_PAD: 60, DRIFT_DAMP: 0.3, HOME_PULL: 0.5,   // 옆으로 밀려 떠내려가는 빠르기 · 손이 옆으로 이만큼(픽셀) 벗어나면 밀린다 · 잦아듦 · 제자리로 끌림
  WALL: 3.75, WALL_R: 2.42,                  // 떠내려가다 통 부딪히는 자리(왼쪽 끝 · 오른쪽은 중력 장치)
  TAP_PX: 14, TAP_T: 0.4,                    // 이보다 덜 움직이고 빨리 떼면 「톡」
  BENCH: { X: 3.35, Z0: -0.95, Z1: 1.0 },    // 고고가 다니는 범위
  HOME: [-0.35, 0.4],                        // 고고가 서 있는 자리
  PLACE: { chair: [-2.75, -0.4], apple: [-1.5, -0.35], ball: [0.75, -0.3], car: [1.85, -0.3], machine: [3.05, -0.35] },
  MACHINE: { KNOB_Y: [0.3, 0.74], KNOB_Z: 0.6, ORB_Y: 1.42, ON_AT: 0.6, OFF_AT: 0.4, STAGGER: 0.14, R: 0.56 },   // 손잡이가 오르내리는 높이(make_float.py 와 맞춘다) · 켜지고 꺼지는 문턱 · 하나씩 떠오르는 사이
  WHEEL: { r: 0.13, x: 0.27, z: 0.215 },     // 자동차 바퀴(make_float.py 의 WHEEL)
  CAR: { V: 5.4, LANE: 0.8, END_L: -3.15, END_R: 2.2 },   // 떨어진 자동차가 달리는 빠르기 · 달리는 줄(실험대 앞쪽) · 돌아서는 끝
  SEAT: 0.3,                                 // 의자에 앉은 고고의 발바닥 높이(의자 바닥에서)
  FLUSTER: 1.3, SWIM_TILT: 0.85, SWIM_V: 1.0,   // 떠오른 고고가 허둥대는 시간 · 헤엄칠 때 몸을 눕히는 각(라디안) · 헤엄 빠르기
  SIT_STAY: 12, BITE_BACK: 14,               // 의자에 앉아 있는 시간 · 베어 문 사과가 다시 차오르기까지
  IDLE_POKE: 10, HINT: 2.8,                  // 가만두면 고고가 장치를 건드리기까지 · 물건이 「띄워 줘」 하고 들썩이는 사이
  SHAKE: 0.05,
  CAM: { AIM: [0, 1.3, 0], TILT: 17, FOV: 30, HALF_W: 4.05, MIN_DIST: 8.4 },
};
const NAME = { apple: 'Apple', ball: 'Ball', chair: 'Chair', car: 'Car', gogo: 'Gogo' }, R0 = { apple: [0.32, 0.6], chair: [0.36, 0.95], ball: [0.27, 0.54], car: [0.44, 0.5] };

// ───────────────────────── 무대 ─────────────────────────
const canvas = document.getElementById('c'), sndEl = document.getElementById('snd'); if (AUTO) document.body.classList.add('auto');
const stage = createStage({ canvas, sky: ['#e6dcf6', '#d6cbee', '#b9a8dc'], cam: T.CAM }), { scene, camera } = stage;
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshStandardMaterial({ color: '#b9a7e0', roughness: 1 })); wall.position.set(0, 3, -1.76); wall.receiveShadow = true; scene.add(wall);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 12).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#a996cf', roughness: 1 })); ground.position.set(0, -2.5, 2); ground.receiveShadow = true; scene.add(ground);
const loader = new GLTFLoader(), [lab, mine] = await Promise.all([loader.loadAsync(new URL('../../assets/lab.glb?v=1', import.meta.url).href), loader.loadAsync(new URL('../../assets/float.glb?v=1', import.meta.url).href)]), part = {};
for (const g of [lab, mine]) g.scene.traverse(o => { if (o.isMesh) { part[o.name] = o; o.castShadow = o.name !== 'room'; o.receiveShadow = true; } });
scene.add(part.room);
const gogo = await createActor(scene, { model: 'gogo' }), s = gogo.state;
gogo.root.traverse(o => { if (o.isMesh) o.receiveShadow = !o.name.startsWith('GogoEyes'); });
gogo.root.rotation.order = 'YXZ';                                                    // 헤엄칠 때 「보는 쪽으로」 몸을 눕히려고(먼저 돌아서고 그다음 눕는다)
gogo.place(T.HOME[0], T.HOME[1], 0); gogo.lookAt(camera.position);
const fx = createSparks(scene), learn = createLearn({ zone: 'world-lab', cell: 'L1-3-3' }), v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), vWord = new THREE.Vector3();
const voice = createVoice({ el: document.getElementById('word'), screenOf: stage.screenOf, onSaid: (w, by, name) => learn.note(w, { skill: name ? 'listen' : 'move', input: 'drag', game: 'up-down' }) });
const things = {}, seen = new Set(), wrap = a => Math.atan2(Math.sin(a), Math.cos(a)), ease = (k, dt) => 1 - Math.exp(-k * dt);
// 물건마다 덧붙이는 것: mode(ground 바닥 · held 손에 · float 떠 있음 · fall 떨어지는 중) · up("Up!" 을 말했나) · w(위아래 빠르기) · hy(머무는 높이) · spin(도는 각) · face(바닥에서 보는 쪽)
for (const name of ['chair', 'apple', 'ball', 'car']) { const [x, z] = T.PLACE[name];
  things[name] = Object.assign(createThing(scene, part[name], { name, x, z, r: R0[name][0], h: R0[name][1], ball: name === 'ball' }), { mode: 'ground', up: false, w: 0, hy: 0, ph: rand(0, 6), spin: 0, face: 0, bounces: 0, e: T.BOUNCE[name], pend: null, dropFrom: 0, bonked: false, tilt: 0 }); }
const { apple, ball, chair, car } = things, say = kind => chirp(kind, 1);
part.apple_bite.visible = false; apple.obj.add(part.apple_bite); apple.bitten = 0;                                    // 한 입 베어 문 사과(바꿔 보여 준다)
const wheels = [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz]) => { const w = part.wheel.clone(); w.position.set(sx * T.WHEEL.x, T.WHEEL.r, sz * T.WHEEL.z); car.obj.add(w); return w; });
const C = { run: 0, dir: -1, v: 0, roll: 0, puff: 0 };                                                               // 자동차: run 0 서 있음 · 1 달려감 · 2 돌아옴 · 3 제자리로
// 고고도 같은 꼴의 「몸」으로 다룬다(자리와 높이는 캐릭터의 것을 읽고 쓴다)
const G = { name: 'gogo', r: 0.36, h: 1.05, size: 1, state: 'home', mode: 'ground', up: false, w: 0, hy: 0, ph: 0, spin: 0, face: 0, vx: 0, bounces: 0, e: 0, pend: null, dropFrom: 0, home: null, ft: 0, tilt: 0, boinged: false, fromChair: false, wp: 0, tour: false,
  get x() { return s.pos.x; }, set x(v) { s.pos.x = v; }, get z() { return s.pos.z; }, get y() { return s.y; }, set y(v) { s.y = v; } };
const bodies = [...Object.values(things), G];
// 중력 장치
const [MX, MZ] = T.PLACE.machine, MACH = { name: 'machine', x: MX, z: MZ + 0.25, y: 0, r: 0.5, h: 1.3, size: 1, state: 'home' }, M = { on: false, k: 0, kv: 0, kTo: 0, glow: 0, t: 0 };
const machine = new THREE.Group(); machine.position.set(MX, 0, MZ); scene.add(machine); machine.add(part.machine);
for (const n of ['knob', 'orb']) { const m = part[n]; m.material = m.material.clone(); m.material.emissive = new THREE.Color(n === 'orb' ? '#ffd766' : '#ff8a5c'); m.material.emissiveIntensity = 0; machine.add(m); }
part.knob.position.set(0, T.MACHINE.KNOB_Y[0], T.MACHINE.KNOB_Z); part.orb.position.set(0, T.MACHINE.ORB_Y, 0); part.ring.position.copy(part.orb.position); machine.add(part.ring);
const orbLight = new THREE.PointLight('#ffd766', 0, 6, 1.6); orbLight.position.set(0, T.MACHINE.ORB_Y + 0.1, 0.3); machine.add(orbLight);
const orbPos = new THREE.Vector3(MX, T.MACHINE.ORB_Y + 0.15, MZ);
// 떠 있는 것 아래에 지는 작은 그림자(해 그림자는 높이 뜨면 실험대 밖으로 나가 버린다)
const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(58,36,92,.85)'); gr.addColorStop(0.6, 'rgba(58,36,92,.4)'); gr.addColorStop(1, 'rgba(58,36,92,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
for (const b of bodies) { b.blob = new THREE.Mesh(new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0 })); b.blob.renderOrder = 2; scene.add(b.blob); }
// 어지러울 때 머리 위를 도는 별 셋
const stars = new THREE.Group(); for (let i = 0; i < 3; i++) { const st = part.star.clone(); st.position.set(Math.cos(i * 2.094) * 0.4, 0, Math.sin(i * 2.094) * 0.4); stars.add(st); } stars.visible = false; scene.add(stars);

// ───────────────────────── 고고의 머리(하고 싶은 일) ─────────────────────────
const L = { watch: null, watchT: 0, fallT: -1, stars: 0, hint: 0, carHop: 0 };
const brain = createBrain(gogo, { bounds: T.BENCH, onEnd: () => { if (L.watchT <= 0 && !H.b) gogo.lookAt(camera.position); }, onLand: () => sfx.thud(0.6) });
const B = brain.B, { run, wait, until, walk, face, hop } = brain; B.where = 'bench';      // bench 실험대 위 · air 공중(뛰는 중 · 떠 있음) · chair 떠 있는 의자 위
const free = () => G.mode === 'ground' && B.where === 'bench' && !B.hop && L.fallT < 0;   // 고고가 제 발로 서 있다(새 일을 시켜도 된다)
const name = b => voice.word(NAME[b.name], () => topOf(b, vWord), { name: true, by: b.name });
const watch = (b, secs) => { L.watch = b; L.watchT = secs; };
async function toBench(tok) {
  if (B.hop) await until(tok, () => !B.hop); if (B.where !== 'chair') return;
  hop(clamp(chair.x + 0.75, -T.BENCH.X, T.BENCH.X), 0.45, 0, 'bench'); await until(tok, () => !B.hop);
}
/** 물건이 떠올라 머물면: 그 밑으로 가서 올려다보고 닿으려고 폴짝거린다. 의자면 뛰어올라 앉는다. */
async function under(tok, b) {
  if (B.where === 'chair') { watch(b, 2.5); gogo.setMood('wow', 1.2); say('wow'); return; }
  if (b === chair) return sit(tok);
  watch(b, 30); gogo.setMood('wow', 1.2); say('wow'); await wait(tok, 0.35);
  await walk(tok, b.x, b.z + 0.32); await face(tok, 0); if (b.mode !== 'float') return;
  for (let i = 0; i < 2; i++) { gogo.act('jump', { mood: 'want' }); say('want'); await wait(tok, 1.0); if (b.mode !== 'float') return; }
  gogo.setMood('smile', 2);
}
async function sit(tok) {
  watch(chair, 3); gogo.setMood('wow', 1); say('wow'); await walk(tok, chair.x + 0.7, chair.z + 0.5); await wait(tok, 0.3); if (chair.mode !== 'float') return;
  hop(chair.x, chair.z + 0.02, chair.y + T.SEAT, 'chair', 0.6); await until(tok, () => !B.hop); if (B.where !== 'chair') return;
  seen.add('chairSit'); chair.w -= 1.4; gogo.setMood('joy', 1.6); say('joy'); gogo.lookAt(camera.position); L.watchT = 0; await wait(tok, T.SIT_STAY); await toBench(tok);
}
/** 머리에 맞았다: 별이 돌고 비틀거린다. 사과였으면 정신을 차리고 한 입 문다. */
async function bonked(tok, b) {
  L.stars = 2.6; gogo.setMood('dizzy', 2.6); gogo.pose('sway', 1); say('dizzy'); await wait(tok, 2.6); gogo.pose('sway', 0); gogo.setMood('smile', 0.8); await wait(tok, 0.4);
  if (b !== apple || apple.mode !== 'ground' || apple.bitten > 0) return;
  const side = s.pos.x >= apple.x ? 1 : -1; watch(apple, 4); await walk(tok, apple.x + side * 0.7, apple.z + 0.08); await face(tok, Math.atan2(apple.x - s.pos.x, apple.z - s.pos.z));
  if (apple.mode !== 'ground') return; gogo.pose('lean', 1); gogo.setMood('want', 0.5); await wait(tok, 0.4);
  apple.bitten = T.BITE_BACK; seen.add('appleBite'); sfx.munch(4); fx.spark(centerOf(apple, v3), '#fbf3df', 10, 0.15, 1.2); apple.tvx += 4;
  for (let i = 0; i < 4; i++) { gogo.setMood(i % 2 ? 'chewB' : 'chewA', 0.3); await wait(tok, 0.17); }
  gogo.pose('lean', 0); gogo.setMood('joy', 1.4); say('yum'); await walk(tok, apple.x + side * 0.95, 0.45); await face(tok, 0);      // 베어 문 자리가 보이게 비켜선다
}
/** 심심하면 혼자 중력 장치의 손잡이를 올렸다 내렸다 해 본다(글 없는 안내). */
async function demo(tok) {
  await toBench(tok); await walk(tok, MX - 0.82, MZ + 0.95); await face(tok, Math.atan2(MX - s.pos.x, MZ + T.MACHINE.KNOB_Z - s.pos.z));
  gogo.lookAt(v3.set(MX, 0.6, MZ + T.MACHINE.KNOB_Z)); gogo.pose('poke', 1); await wait(tok, 0.4);
  seen.add('demo'); if (M.on) machineOff(); else machineOn(true); M.kTo = M.on ? 1 : 0; await wait(tok, 0.5); gogo.pose('poke', 0);
  gogo.lookAt(v3.set(0, 2.2, 0)); gogo.setMood(M.on ? 'wow' : 'smile', 1.8); say(M.on ? 'wow' : 'joy'); await wait(tok, 1.6); await walk(tok, rand(-0.8, 0.9), rand(0.35, 0.6)); await face(tok, 0);
}
function fallNow() { gogo.act('fall', { lock: true }); gogo.setMood('wow', 0.5); L.fallT = 0; say('oops'); }

// ───────────────────────── 뜨고 떨어지기 ─────────────────────────
function airGogo() { brain.stop(); gogo.stop(); B.hop = null; B.where = 'air'; s.busy = true; s.act = null; s.faceTo = null; L.fallT = -1; L.stars = 0; }
function sayUp(b) {
  b.up = true; voice.word('Up!', () => topOf(b, vWord), { by: b.name, cls: 'up', gap: 0.6 }); sfx.spark(true); fx.spark(centerOf(b, v3), '#ffe9a8', 16, 0.3, 1.5);
  if (b === G) { G.ft = 0; say('small'); } else if (free() && !B.tok) { gogo.setMood('wow', 0.8); say('wow'); }
}
/** 장치가 띄운다(손 없이 제 높이까지 둥실). */
function liftBy(b) {
  if (b === G) { if (!free()) return; airGogo(); G.ft = 0; say('small'); }
  if (b === car) C.run = 0;
  b.mode = 'float'; b.up = true; b.hy = T.HOVER[b.name] + rand(-0.08, 0.08); b.w = 2.2; b.bounces = 0; sfx.pop(); fx.spark(centerOf(b, v3), '#ffe9a8', 10, 0.25, 1.2);
}
/** 뚝 떨어진다. hard = 끌어 내려서(더 세게) · quiet = 말하지 않는다(장치가 한꺼번에 떨어뜨릴 때 · 머리에 맞아 덩달아). */
function drop(b, hard, quiet) {
  b.mode = 'fall'; b.up = false; b.bounces = 0; b.bonked = false; b.dropFrom = b.y; b.w = Math.min(b.w, hard ? -5 : -0.5); sfx.whoosh();
  if (!quiet) voice.word('Down!', () => topOf(b, vWord), { by: b.name, cls: 'down', gap: 0.6 });
  if (b === G) { G.boinged = false; gogo.setMood('wow', 1); say('oops'); }
  else { if (b === ball) b.vx += rand(-0.5, 0.5); watch(b, 3.5); if (b === chair && B.where === 'chair') throwOff(); }
}
function throwOff() { airGogo(); G.mode = 'fall'; G.up = false; G.w = Math.min(chair.w, 0) + 1.5; G.vx = chair.x < 1.4 ? 1.0 : -1.0; G.dropFrom = s.y; G.fromChair = true; G.boinged = true; gogo.setMood('wow', 1); say('oops'); }
/** 떨어지던 것이 고고 머리에 맞았다. */
function bonk(b) {
  b.bonked = true; seen.add('bonk'); b.w = b === ball ? 5 : 3.2; b.vx = (b.x < 0 ? 1 : -1) * 1.05;      // 실험대 가운데 쪽 빈자리로 튕긴다
  s.sizeV -= 3.2; sfx.bounce(1); sfx.thud(0.8); stage.shake(T.SHAKE * 0.7); fx.spark(v3.set(s.pos.x, s.y + 1.05, s.pos.z), '#fff0a0', 14, 0.15, 1.6);
  if (G.mode === 'float') drop(G, false, true); else if (free()) run(tok => bonked(tok, b));
}
function bounced(b, v) {                    // 바닥에 닿아 튀었다
  if (b === ball) sfx.bounce(v / 6); else sfx.thud(clamp(v / 5, 0.3, 1.2)); b.v -= v * 0.3; b.tvx += rand(-1, 1) * v * 0.5; fx.spark(v3.set(b.x, 0.05, b.z), '#f7ebd5', 5, 0.25, 0.6);
  if (v > 5 && b !== ball) stage.shake(T.SHAKE * 0.4);
  if (b === ball && b.bounces === 4 && b.dropFrom > 0.5) { seen.add('ballBounce'); if (free() && !B.tok) { gogo.act('jump', { mood: 'joy' }); say('joy'); } }
}
function landed(b, v) {                     // 바닥에 멈췄다
  if (b === G) {
    B.where = 'bench'; s.busy = false; G.vx = 0;
    if (G.dropFrom > 0.5) { seen.add(G.fromChair ? 'chairDrop' : 'plop'); fallNow(); sfx.thud(1.2); stage.shake(T.SHAKE); fx.spark(v3.set(s.pos.x, 0.05, s.pos.z), '#f7ebd5', 10, 0.35, 0.8);
      for (const t of Object.values(things)) if (t.mode === 'ground' && !(t === car && C.run)) { t.mode = 'fall'; t.w = 1.6; t.dropFrom = 0; } }      // 엉덩방아에 물건들이 들썩
    else { sfx.thud(0.5); gogo.setMood('smile', 1); gogo.lookAt(camera.position); }
    G.dropFrom = 0; G.fromChair = false; return;
  }
  if (v > 0.6) { sfx.thud(clamp(v / 6, 0.2, 0.8)); b.v -= v * 0.25; }
  if (b === car && b.dropFrom > 0.5) { C.run = 1; C.dir = car.x > -0.6 ? -1 : 1; watch(car, 5); if (free() && !B.tok) { gogo.setMood('wow', 1); say('wow'); } }
  b.dropFrom = 0;
}
function machineOn(byGogo) {
  M.on = true; voice.word('Up!', orbPos, { by: 'machine', cls: 'up', gap: 0.6 }); sfx.spark(true); tone(200, 640, 0.55, { type: 'triangle', g: 0.12 }); stage.shake(T.SHAKE * 0.5); fx.spark(orbPos, '#ffd766', 26, 0.3, 2.2);
  bodies.filter(b => (b.mode === 'ground' || b.mode === 'fall') && !(b === G && (byGogo || !free()))).sort((a, b) => b.x - a.x).forEach((b, i) => { b.pend = { t: 0.15 + i * T.MACHINE.STAGGER, up: true }; });   // 장치에서 가까운 것부터 하나씩
  seen.add('allUp'); if (free() && !B.tok) { gogo.setMood('wow', 1.2); gogo.lookAt(orbPos); }
}
function machineOff() {
  M.on = false; voice.word('Down!', orbPos, { by: 'machine', cls: 'down', gap: 0.6 }); tone(620, 150, 0.5, { type: 'triangle', g: 0.12 }); let n = 0;
  bodies.filter(b => b.mode === 'float').sort((a, b) => b.x - a.x).forEach((b, i) => { b.pend = { t: 0.1 + i * T.MACHINE.STAGGER, up: false }; n++; });
  for (const b of bodies) if (b.pend && b.pend.up) b.pend = null;
  if (n >= 3) seen.add('rain');
}

// ───────────────────────── 손 ─────────────────────────
const benchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), P = { down: false, x: 0, y: 0 };
const H = { b: null, ax: 0, ay: 0, y0: 0, ty: 0, peak: 0, ppu: 100, t0: 0, moved: 0, wasUp: false, k0: 0 };      // 지금 대고 있는 것과 그때의 자리
function lockOn(b, x, y) {
  H.b = b; H.ax = x; H.ay = y; H.t0 = clock; H.moved = 0; B.idle = 0; L.hint = 0;
  H.ppu = Math.max(20, Math.abs(stage.screenOf(v3.set(b.x, b.y + 1, b.z)).y - stage.screenOf(v3b.set(b.x, b.y, b.z)).y));        // 그 깊이에서 세계 길이 1 이 몇 픽셀인가(물건이 손가락을 그대로 따라오게)
  if (b === MACH) { H.k0 = M.kTo; sfx.tick(); return; }
  H.y0 = H.ty = H.peak = b.y; H.wasUp = b.up; b.pend = null; sfx.grab(); name(b);
  if (b === G) { if (free() || B.where !== 'air' || G.mode === 'ground') airGogo(); gogo.setMood('fluster', 0.6); } else if (b === car) C.run = 0;
  b.mode = 'held'; b.vx = 0;
}
function dragTo(x, y) {
  const b = H.b; if (!b) return; H.moved = Math.max(H.moved, Math.hypot(x - H.ax, y - H.ay));
  if (b === MACH) { M.kTo = clamp(H.k0 + (H.ay - y) / (H.ppu * (T.MACHINE.KNOB_Y[1] - T.MACHINE.KNOB_Y[0])), 0, 1); if (!M.on && M.kTo > T.MACHINE.ON_AT) machineOn(); else if (M.on && M.kTo < T.MACHINE.OFF_AT) machineOff(); return; }
  H.ty = clamp(H.y0 + (H.ay - y) / H.ppu, 0, T.TOP); H.peak = Math.max(H.peak, H.ty);
  if (b.up && (H.ty < H.peak - T.PULL || H.ty < 0.12)) { H.b = null; drop(b, true); return; }                                    // 끌어 내렸다 → 뚝
  const c = stage.screenOf(centerOf(b, v3)); if (Math.abs(x - c.x) > pxRadius(stage, b) + T.BREAK_PAD) { H.b = null; b.vx = Math.sign(x - c.x) * T.FLICK; settle(b); }   // 손을 옆으로 뺐다 → 밀려서 떠내려간다
}
/** 손에서 놓였다: 떠오른 것이면 그 높이에 머물고, 아니면 도로 내려앉는다. */
function settle(b) {
  if (b.up) { b.mode = 'float'; b.hy = clamp(b.y, T.HOVER_MIN, T.TOP); sfx.pop(); if (b !== G && free()) run(tok => under(tok, b)); else if (b !== G && B.where === 'chair' && b !== chair) watch(b, 2.5); }
  else { b.mode = 'fall'; b.dropFrom = 0; b.bounces = 0; if (b === G) G.boinged = true; }
}
function release() {
  const b = H.b; if (!b) return; H.b = null; const tap = H.moved < T.TAP_PX && clock - H.t0 < T.TAP_T;
  if (b === MACH) { if (tap) { if (M.on) machineOff(); else machineOn(); } M.kTo = M.on ? 1 : 0; sfx.tick(); return; }           // 톡 치면 올렸다 내렸다 · 끌다 놓으면 가까운 끝에 선다
  if (tap && H.wasUp) return drop(b, false);                                                                                     // 떠 있는 것을 톡 → 뚝
  if (tap && b === G) { if (G.y < 0.1) { G.mode = 'ground'; G.y = 0; G.w = 0; B.where = 'bench'; s.busy = false; gogo.act('jump', { mood: 'joy' }); say('joy'); return; } }
  else if (tap) { b.w = 3.2; b.tvz += rand(-3, 3); }                                                                             // 바닥에 있는 것을 톡 → 폴짝
  settle(b);
}
function tapBench(x, z) {
  if (!free()) return; x = clamp(x, -T.BENCH.X, T.BENCH.X); z = clamp(z, T.BENCH.Z0, T.BENCH.Z1); B.idle = 0;
  run(async tok => { gogo.lookAt(v3.set(x, 0, z)); gogo.goTo(x, z); await until(tok, () => !s.target, 12); });
}
const targets = [MACH, G, ...Object.values(things)];
canvas.addEventListener('pointerdown', e => {
  P.down = true; P.x = e.clientX; P.y = e.clientY; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} unlock();
  const t = pickAt(stage, targets, e.clientX, e.clientY);
  if (t) lockOn(t, e.clientX, e.clientY); else if (stage.worldOn(benchPlane, e.clientX, e.clientY, v3)) tapBench(v3.x, v3.z);
});
canvas.addEventListener('pointermove', e => { P.x = e.clientX; P.y = e.clientY; if (P.down) dragTo(e.clientX, e.clientY); });
const up = () => { if (!P.down) return; P.down = false; release(); };
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
sndEl.classList.toggle('off', isMuted()); sndEl.addEventListener('click', () => { setMuted(!isMuted()); sndEl.classList.toggle('off', isMuted()); });
document.getElementById('again').addEventListener('click', () => voice.again());

// ───────────────────────── 매 장면 ─────────────────────────
let clock = 0;
function stepBody(b, dt) {
  if (b.pend && (b.pend.t -= dt) <= 0) { const upw = b.pend.up; b.pend = null; if (upw) { if (b.mode === 'ground' || b.mode === 'fall') liftBy(b); } else if (b.mode === 'float') drop(b, false, true); }
  const wl = -T.WALL + b.r, wr = T.WALL_R - b.r;
  if (b.mode === 'held') {
    const ny = b.y + (H.ty - b.y) * ease(T.FOLLOW, dt); b.w = clamp((ny - b.y) / dt, -12, 12); b.y = ny; b.spin += T.SPIN * 0.4 * dt; if (!b.up && b.y > T.UP_AT) sayUp(b);
  } else if (b.mode === 'float') {
    b.ph += dt; b.w += (T.FLOAT_K * (b.hy + Math.sin(b.ph * 1.7) * T.BOB - b.y) - T.FLOAT_C * b.w) * dt; b.y += b.w * dt; if (b === chair && B.where === 'chair') b.spin += wrap(Math.sin(b.ph * 0.6) * 0.5 - b.spin) * ease(2.5, dt); else if (b !== G) b.spin += T.SPIN * dt;      // 고고가 앉으면 얼굴이 보이게 앞을 보고 살랑거린다
   
    b.vx *= Math.exp(-(Math.abs(b.vx) > 0.8 ? T.DRIFT_DAMP : 0.9) * dt); if (b.home && Math.abs(b.vx) <= 0.8) b.vx += (b.home.x - b.x) * T.HOME_PULL * dt; b.x += b.vx * dt;
    if (b.x < wl || b.x > wr) {                                                                // 벽(오른쪽은 장치)에 통
      if (Math.abs(b.vx) > 0.5) { seen.add('drift'); sfx.bounce(0.7); if (b.x > wr) sfx.clink(); stage.shake(T.SHAKE * 0.3); fx.spark(v3.set(b.x + Math.sign(b.vx) * b.r, b.y + b.h * 0.5, b.z), '#fff0a0', 10, 0.15, 1.4); if (b !== G) { b.tvz += b.vx * 3; b.v -= 2; } else s.sizeV -= 2; }
      b.x = clamp(b.x, wl, wr); b.vx *= -0.6;
    }
    if (Math.random() < dt * 7) fx.spark(v3.set(b.x + rand(-b.r, b.r), b.y - 0.02, b.z + rand(-0.2, 0.2)), Math.random() < 0.5 ? '#ffe9a8' : '#c9b8ff', 1, 0.03, 0.22, { life: [0.5, 1.0] });   // 살랑이는 반짝이
  } else if (b.mode === 'fall') {
    b.w -= T.GRAV * dt; b.y += b.w * dt; b.x = clamp(b.x + b.vx * dt, wl, wr); const top = s.y + 0.95;
    if (b !== G && b.w < 0 && !b.bonked && b.dropFrom > top + 0.05 && b.y < top && b.y > top - 0.45 && (free() || G.mode === 'float') && Math.abs(b.x - s.pos.x) < 0.3 + b.r * 0.6 && Math.abs(b.z - s.pos.z) < 0.8) bonk(b);
    if (b === G && b.w < 0 && !G.boinged && G.dropFrom > 0.6 && ball.mode === 'ground' && b.y < 0.5 && Math.abs(b.x - ball.x) < 0.5 && Math.abs(b.z - ball.z) < 0.95) {      // 공 위에 떨어지면 통 튀어 오른다
      G.boinged = true; seen.add('boing'); b.w = 6.2; b.vx = (b.x >= ball.x ? 1 : -1) * 1.1; ball.v -= 5; ball.tvx += 4; sfx.bounce(1); tone(260, 520, 0.18, { type: 'triangle', g: 0.14 }); gogo.setMood('joy', 0.9); say('joy'); }
    if (b.y <= 0) { const v = -b.w; b.y = 0; if (v > T.REST && b.e > 0) { b.w = v * b.e; b.bounces++; bounced(b, v); } else { b.w = 0; b.mode = 'ground'; landed(b, v); } }
  } else if (b !== G && !(b === car && C.run)) { const dx = (b.home.x - b.x) * ease(2.5, dt); b.x += dx; b.vx = 0; if (b.ball) b.roll -= dx / b.r; }      // 바닥에서는 슬슬 제자리로
  if (b !== G) { if (b.mode === 'fall' || b.mode === 'ground') b.spin += wrap(b.face - b.spin) * ease(9, dt); if (b.ball && b.mode !== 'ground') b.roll -= (b.vx * dt) / b.r + b.w * dt * 0.4;
    b.tilt += ((b.mode === 'float' || b.mode === 'held' ? 1 : 0) - b.tilt) * ease(5, dt); }
  // 아래 그림자: 떠 있을수록 작고 옅다
  const k = clamp(b.y / 0.4, 0, 1), far = clamp(b.y / T.TOP, 0, 1), rr = b.r * (1.5 - 0.5 * far); b.blob.position.set(b.x, 0.012, b.z); b.blob.scale.set(rr, 1, rr * 0.8); b.blob.material.opacity = k * (0.62 - 0.3 * far);
}
for (const t of Object.values(things)) t.pose = ob => { const a = t.tilt * 0.13; ob.rotation.set(t.tx * 0.1 + Math.sin(t.ph * 1.3) * a, t.spin, (t.ball ? t.roll : t.tz * 0.1) + Math.cos(t.ph * 1.1) * a); };
function stepCar(dt) {
  const t = car, moving = C.run === 1 || C.run === 2; let vTo = 0;
  if (C.run === 1) { vTo = C.dir * T.CAR.V; t.face = C.dir < 0 ? 0 : Math.PI; if ((C.dir < 0 && t.x < T.CAR.END_L) || (C.dir > 0 && t.x > T.CAR.END_R)) { C.run = 2; seen.add('carRun'); sfx.tick(); } }
  else if (C.run === 2) { const d = t.home.x - t.x; t.face = d < 0 ? 0 : Math.PI; vTo = clamp(d * 3, -T.CAR.V * 0.7, T.CAR.V * 0.7); if (Math.abs(d) < 0.06 && Math.abs(C.v) < 0.5) { C.run = 3; t.face = 0; } }
  else if (C.run === 3) { if (Math.abs(t.z - t.home.z) < 0.02 && Math.abs(wrap(t.spin)) < 0.05) C.run = 0; }
  C.v += (vTo - C.v) * ease(C.run === 1 ? 5 : 4, dt); if (!moving) C.v = 0;
  if (C.run) { t.x += C.v * dt; t.z += ((moving ? T.CAR.LANE : t.home.z) - t.z) * ease(moving ? 6 : 3, dt); C.roll += C.v * dt / T.WHEEL.r;
    if (Math.abs(C.v) > 1.5 && (C.puff -= dt) <= 0) { C.puff = 0.07; fx.spark(v3.set(t.x - Math.sign(C.v) * 0.45, 0.08, t.z), '#f7ebd5', 1, 0.05, 0.5); tone(120 + Math.abs(C.v) * 18, 100, 0.07, { type: 'sawtooth', g: 0.025 }); }
    if (free() && Math.abs(C.v) > 2 && Math.abs(t.x + C.v * 0.12 - s.pos.x) < 0.55 && s.pos.z > t.z - 0.75 && (L.carHop -= dt) <= 0) { L.carHop = 0.9; seen.add('carJump'); hop(s.pos.x, Math.min(s.pos.z, 0.2), 0, 'bench', 0.55); gogo.setMood('wow', 0.8); say('wow'); } }      // 달려오는 차를 폴짝 넘는다
  else { t.z += (t.home.z - t.z) * ease(3, dt); if (t.mode === 'float' || t.mode === 'held') C.roll += 3 * dt; else if (t.mode === 'ground') C.roll += (t.x - (C.px ?? t.x)) / T.WHEEL.r; }
  C.px = t.x; for (const w of wheels) w.rotation.z = C.roll;       // 앞(-x)으로 갈 때 바퀴 위쪽이 앞으로 넘어간다
}
function stepMachine(dt) {
  M.kv += (180 * (M.kTo - M.k) - 16 * M.kv) * dt; M.k = clamp(M.k + M.kv * dt, -0.05, 1.05); M.t += dt; M.glow += ((M.on ? 1 : 0) - M.glow) * ease(6, dt);
  const ky = T.MACHINE.KNOB_Y; part.knob.position.y = ky[0] + (ky[1] - ky[0]) * M.k;
  const invite = !M.on && H.b !== MACH ? 0.25 + 0.25 * Math.sin(clock * 3.2) : 0.1; part.knob.material.emissiveIntensity += ((H.b === MACH ? 0.6 : invite) - part.knob.material.emissiveIntensity) * ease(10, dt);      // 손잡이가 숨 쉬듯 빛난다(여기를 만져 봐)
  part.orb.material.emissiveIntensity = 0.12 + M.glow * (1.5 + 0.3 * Math.sin(clock * 9)); orbLight.intensity = M.glow * 7; part.orb.scale.setScalar(1 + M.glow * (0.12 + 0.04 * Math.sin(clock * 9)));
  part.ring.rotation.set(0.5 + 0.2 * Math.sin(M.t * 0.7), M.t * (0.6 + M.glow * 5), 0.25); part.ring.scale.setScalar(1 + M.glow * 0.25);
  if (M.on && Math.random() < dt * 14) fx.spark(v3.set(MX + rand(-0.3, 0.3), T.MACHINE.ORB_Y, MZ + rand(-0.2, 0.3)), '#ffd766', 1, 0.05, 0.5, { up: true, life: [0.5, 1.1] });
}
function stepGogo(dt) {
  const air = G.mode !== 'ground', swim = G.mode === 'float' && G.ft > T.FLUSTER, allUp = Object.values(things).every(t => t.mode === 'float');
  if (air) { s.target = null; s.busy = true; if (G.mode === 'float') G.ft += dt; }
  gogo.pose('fluster', air && !swim ? 1 : 0);
  if (air && !swim) gogo.setMood(G.mode === 'fall' ? 'wow' : 'fluster', 0.3);
  if (swim) {
    gogo.setMood('joy', 0.3); let hd = Math.sin(G.ft * 0.55) * 0.9;
    if (allUp) {                                                                              // 전부 떠 있다 → 물건 사이를 누비며 헤엄친다(앞으로 · 뒤로 번갈아 지나간다)
      if (!G.tour) { G.tour = true; G.wp = 0; seen.add('swim'); say('joy'); }
      const ts = Object.values(things).sort((a, b) => a.x - b.x), n = ts.length, i = G.wp % (2 * n), t = ts[i < n ? i : 2 * n - 1 - i], front = (i < n ? i : i + 1) % 2 === 0;
      const tx = clamp(t.x, -T.WALL + 0.5, T.WALL_R - 0.5), tz = t.z + (front ? 0.9 : -0.72), dx = tx - s.pos.x, dz = tz - s.pos.z, d = Math.hypot(dx, dz);
      if (d < 0.15) G.wp++; else { const v = Math.min(T.SWIM_V, d * 2 + 0.2) * dt / d; s.pos.x += dx * v; s.pos.z += dz * v; hd = Math.sign(dx) * Math.min(1.05, Math.abs(dx) * 1.6); }
      G.hy += (clamp(t.y + (front ? -0.15 : 0.25), 0.8, 1.6) - G.hy) * ease(1.2, dt);
    } else { G.tour = false; s.pos.z += (clamp(s.pos.z, 0.1, 0.7) - s.pos.z) * ease(1.5, dt); }
    s.heading += wrap(hd - s.heading) * ease(3, dt);
  } else { G.tour = false; if (air) s.heading += wrap(0 - s.heading) * ease(6, dt); }
  G.tilt += ((swim ? 1 : 0) - G.tilt) * ease(4, dt);
  // 떠 있는 의자 위: 의자가 가는 대로 간다. 의자가 떨어지면 같이 떨어진다
  if (B.where === 'chair') { if (chair.mode === 'fall' || chair.mode === 'ground') throwOff(); else { s.pos.x = chair.x; s.pos.z = chair.z + 0.02; s.y = chair.y + T.SEAT; s.heading = wrap(chair.spin); s.target = null; s.faceTo = null; } }
  // 눈길: 손에 든 것 → 지켜보는 것
  if (H.b && H.b !== G) gogo.lookAt(H.b === MACH ? v3.set(MX, 0.6, MZ + 0.6) : centerOf(H.b, v3));
  else if (L.watchT > 0) { L.watchT -= dt; if (L.watch.mode === 'ground' && L.watch !== car) L.watchT = Math.min(L.watchT, 0.8); gogo.lookAt(centerOf(L.watch, v3)); if (L.watchT <= 0 && !B.tok) gogo.lookAt(camera.position); }
  if (L.fallT >= 0) { const was = L.fallT; L.fallT += dt; if (was < 0.5 && L.fallT >= 0.5) gogo.setMood('dizzy', 1.4); if (L.fallT > 2.5) { L.fallT = -1; gogo.setMood('smile', 1); } }
  // 바닥의 물건 · 장치와 겹치지 않게 비켜난다. 공은 차인다
  if (free()) for (const t of [...Object.values(things), MACH]) {
    if (t !== MACH && (t.mode !== 'ground' || (t === car && C.run))) continue; const tz = t === MACH ? MZ : t.z, ddx = s.pos.x - t.x, ddz = s.pos.z - tz, d = Math.hypot(ddx, ddz) || 0.001, need = 0.3 + (t === MACH ? T.MACHINE.R : t.r * 0.85);
    if (d >= need) continue; if (t.ball) { t.x -= ddx / d * 1.2 * dt; t.roll += ddx / d * 1.2 * dt / t.r; }
    s.pos.x = clamp(s.pos.x + ddx / d * (need - d), -T.BENCH.X, T.BENCH.X); s.pos.z = clamp(s.pos.z + ddz / d * (need - d), T.BENCH.Z0, T.BENCH.Z1);
  }
}
/** 캐릭터가 제 자세를 잡은 뒤에 덧입힌다: 헤엄(몸을 눕히고 팔다리를 젓는다) · 의자에 앉기(다리를 앞으로) · 별. 덧돌린 뼈는 다음 장면의 update 가 되돌린다. */
function poseGogo(dt) {
  const k = G.tilt, root = gogo.root, th = k * T.SWIM_TILT, c = 0.5 * s.size;
  root.rotation.x = th; root.rotation.z = k * Math.sin(G.ft * 2.2) * 0.12;
  if (k > 0.01) { root.position.y += c * (1 - Math.cos(th)) + 0.1 * k; root.position.x -= Math.sin(s.heading) * c * Math.sin(th); root.position.z -= Math.cos(s.heading) * c * Math.sin(th);      // 발이 아니라 몸 가운데를 축으로 눕는다
    const a = Math.sin(G.ft * 5.5); gogo.nudge('arm_L', (-70 + 50 * a) * k, 0, 24 * k); gogo.nudge('arm_R', (-70 - 50 * a) * k, 0, -24 * k); gogo.nudge('leg_L', 30 * a * k); gogo.nudge('leg_R', -30 * a * k); gogo.nudge('head', -34 * k); }
  if (B.where === 'chair') { const a = Math.sin(clock * 3) * 12; gogo.nudge('leg_L', -72 + a); gogo.nudge('leg_R', -72 - a); }
  if (L.stars > 0) { L.stars -= dt; stars.visible = L.stars > 0; stars.position.set(s.pos.x, s.y + 1.22 * s.size, s.pos.z); stars.rotation.y = clock * 5; for (const st of stars.children) st.rotation.y = -clock * 5 + 0.3; } else stars.visible = false;
}
function step(dt) {
  clock += dt; brain.tick(dt);
  for (const b of bodies) stepBody(b, dt);
  stepCar(dt); stepMachine(dt);
  for (const t of Object.values(things)) { t.lit = H.b === t; t.floor = t.y; t.vy = 0; stepThing(t, dt); }      // 높이는 여기서 다룬다(엔진의 중력은 쉬게 한다)
  if (apple.bitten > 0) { apple.bitten -= dt; if (apple.bitten <= 0) { fx.spark(centerOf(apple, v3), '#ffb0a0', 12, 0.25, 1.2); sfx.pop(); apple.v += 3; } }      // 베어 문 자리가 뽁 하고 다시 차오른다
  apple.mesh.visible = apple.bitten <= 0; part.apple_bite.visible = apple.bitten > 0;
  stepGogo(dt);
  // 아무것도 안 떠 있으면 물건이 번갈아 들썩인다(나를 띄워 줘) · 한참 가만두면 고고가 장치를 건드린다
  const calm = !H.b && bodies.every(b => b.mode === 'ground') && !C.run;
  if (calm && (L.hint += dt) > T.HINT) { L.hint = 0; const t = Object.values(things)[Math.floor(Math.random() * 4)]; t.mode = 'fall'; t.w = 1.5; t.dropFrom = 0; fx.spark(topOf(t, v3), '#ffe9a8', 4, 0.15, 0.4, { up: true }); }
  if (!B.tok && !H.b && free() && !s.moving && !s.act && !C.run) { B.idle += dt; if (B.idle > T.IDLE_POKE) run(demo); } else if (H.b || s.moving || !free()) B.idle = 0;
  gogo.update(dt); poseGogo(dt); voice.tick(dt); fx.tick(dt);
}
gogo.on('step', () => sfx.thud(0.5));

// ───────────────────────── 돌리기 ─────────────────────────
const summary = () => ({ gogo: { x: +s.pos.x.toFixed(2), z: +s.pos.z.toFixed(2), y: +s.y.toFixed(2), mode: G.mode, where: B.where, up: G.up, mood: s.mood, act: s.act ? s.act.name : '' },
  things: Object.fromEntries(Object.values(things).map(t => [t.name, t.mode + (t.up ? ' up' : '') + ' x' + t.x.toFixed(1) + ' y' + t.y.toFixed(2)])), machine: M.on ? 'on' : 'off', car: C.run, bitten: apple.bitten > 0, held: H.b ? H.b.name : '',
  said: voice.said, seen: [...seen], learned: learn.log.length, errors: brain.errors });
const by = n => n === 'gogo' ? G : n === 'machine' ? MACH : things[n];
window.__float = { T, gogo, things, G, M, C, H, B, L, step, summary, lockOn, dragTo, release, tapBench, camera, stage, at: n => { const c = stage.screenOf(centerOf(by(n), v3)); return [c.x, c.y]; } };
if (AUTO) runAuto(stage, { step, summary, commands: {
  lock: a => { const c = stage.screenOf(centerOf(by(a), v3)); P.down = true; P.x = c.x; P.y = c.y; lockOn(by(a), c.x, c.y); },
  drag: async (a, b, tick) => { const x0 = P.x, y0 = P.y, dy = -(+a) * H.ppu, dx = +(b || 0); for (let i = 1; i <= 24 && H.b; i++) { P.x = x0 + dx * i / 24; P.y = y0 + dy * i / 24; dragTo(P.x, P.y); await tick(); } },
  release: () => { P.down = false; release(); },
  tap: async (a, b, tick) => { const c = stage.screenOf(centerOf(by(a), v3)); P.x = c.x; P.y = c.y; lockOn(by(a), c.x, c.y); for (let i = 0; i < 3; i++) await tick(); release(); },
  walk: (a, b) => tapBench(+a, +b),
} }); else { stage.play(step); document.title = 'READY ' + document.title; }
