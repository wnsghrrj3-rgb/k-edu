/* 몬스터 식당 · 배고픈 몬스터 — 통합 설계서 §13 「먹이 주기」(L1-5-1).
 * 하는 일은 하나: 음식을 집어 몬스터 입에 넣는다(끌어도 되고 던져도 된다). 맛마다, 몬스터마다 반응이 다르다.
 * 몬스터 넷: Momo 분홍 · 먹보 / Bobo 파랑 · 소심 / Gogo 초록 · 호기심 / Toto 노랑 · 장난꾸러기.
 * 정답 · 점수 · 시간제한 · 설명 글 없음. 영어는 집을 때 음식 이름, 먹었을 때 맛 한마디(Yummy! · Sour! · Hot!), 몬스터를 만지면 이름.
 * 확인용 주소: ?mute · ?auto=명령,…(feed:몬스터:음식 · drop:음식 · throw:음식:가로:세로 · tap:몬스터 · step:초) → 끝나면 제목에 상태. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStage, AUTO, clamp, rand } from '../../engine/stage.js?v=1';
import { sfx, chirp, tone, unlock, setMuted, isMuted } from '../../engine/sound.js?v=1';
import { createVoice } from '../../engine/voice.js?v=1';
import { createSparks } from '../../engine/fx.js?v=1';
import { createBrain } from '../../engine/brain.js?v=1';
import { createLearn } from '../../engine/learn.js?v=1';
import { runAuto } from '../../engine/auto.js?v=1';
import { createActor } from '../../engine/actor.js?v=1';

// ───────────────────────── 수치(준호가 만져 보고 바꾼다) ─────────────────────────
const T = {
  SEAT: { momo: -2.85, bobo: -0.95, gogo: 0.95, toto: 2.85 }, ROW_Z: -0.5, STAND_Y: -0.15,       // 몬스터 자리(가로) · 줄의 깊이 · 서 있는 단의 높이
  SCALE: { momo: 1.12, bobo: 0.92, gogo: 1.0, toto: 0.98 }, PITCH: { momo: 0.78, bobo: 1.3, gogo: 1.0, toto: 1.14 },   // 몸 크기 · 목소리 높낮이
  PLATE_X: [-3.3, -1.98, -0.66, 0.66, 1.98, 3.3], PLATE_Y: 0.03, PLATE_Z: 0.55,                    // 접시 자리
  PLANE: { N: [0, 0, 1], D: 0.55 },         // 음식이 떠다니는 면(접시 줄 위에 선 곧은 면): N·p = D
  FOLLOW: 26, LIFT_PX: 34,                  // 음식이 손을 따라오는 빠르기 · 손가락보다 이만큼 위에 뜬다
  THROW: 0.9, THROW_MAX: 11, GRAVITY: 13,   // 던질 때 손 빠르기를 얼마나 살리나 · 가장 빠른 던지기 · 떨어지는 빠르기
  BOUNCE: 0.42, WALL_X: 4.4,
  EAT_R: 0.3, WANT_R: 1.5, EAT_DWELL: 0.14, // 입에 들어갔다고 보는 거리 · 먹고 싶어 하기 시작하는 거리 · 든 음식은 입 앞에 이만큼(초) 머물러야 먹는다(스쳐 지나가면 안 먹는다)
  PICK_PX: 70,                              // 음식 · 몬스터를 집는 여유(픽셀)
  RESPAWN: 1.3, REST_BACK: 0.8,             // 먹힌 음식이 접시에 다시 나오기까지 · 떨어진 음식이 접시로 돌아가기까지(초)
  CRACK_V: 4.2,                             // 달걀이 이보다 빠르게 식탁에 부딪히면 깨진다
  HOT_FOR: 7, FIRE_AT: 0.7, FIRE_FOR: 1.1, FIRE_REACH: 1.0,   // 매운 기운이 가는 시간 · 불을 뿜기까지 · 뿜는 시간 · 불이 닿는 접시까지의 가로 거리
  FULL_AT: 6, FAT: 0.045,                   // 모모가 배부르다고 하는 개수 · 하나 먹을 때마다 통통해지는 정도
  NEGLECT: 16,                              // 다른 몬스터만 먹으면 이만큼(초) 뒤에 조른다
  CAM: { AIM: [0, 1.1, 0], TILT: 14, FOV: 30, HALF_W: 4.6, MIN_DIST: 9 },
};
const FOOD = {   // 이름 · 맛 · 반지름
  bread: { name: 'Bread', taste: 'yum', r: 0.2 }, milk: { name: 'Milk', taste: 'yum', r: 0.22, cool: true }, egg: { name: 'Egg', taste: 'yum', r: 0.17 },
  cake: { name: 'Cake', taste: 'yum', r: 0.17, best: true }, lemon: { name: 'Lemon', taste: 'sour', r: 0.17 }, pepper: { name: 'Pepper', taste: 'hot', r: 0.11 },
};
const SHOUT = { yum: 'Yummy!', sour: 'Sour!', hot: 'Hot!' }, CLS = { yum: 'yum', sour: 'sour', hot: 'hot' }, MNAME = { momo: 'Momo', bobo: 'Bobo', gogo: 'Gogo', toto: 'Toto' };

// ───────────────────────── 무대 ─────────────────────────
const canvas = document.getElementById('c'), sndEl = document.getElementById('snd'); if (AUTO) document.body.classList.add('auto');
const stage = createStage({ canvas, sky: ['#fff0dc', '#ffe0c2', '#f6c9a2'], cam: T.CAM, hemi: ['#fff6ec', '#e6b98f', 0.7], exposure: 0.92 }), { scene, camera } = stage;
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshStandardMaterial({ color: '#ffc9a3', roughness: 1 })); wall.position.set(0, 3, -1.76); wall.receiveShadow = true; scene.add(wall);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 12).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#d99a6c', roughness: 1 })); ground.position.set(0, -2.5, 2); ground.receiveShadow = true; scene.add(ground);
const pack = await new GLTFLoader().loadAsync(new URL('../../assets/food.glb?v=1', import.meta.url).href), part = {};
pack.scene.traverse(o => { if (o.isMesh) { part[o.name] = o; o.castShadow = o.name !== 'kitchen'; o.receiveShadow = true; } });
scene.add(part.kitchen);
const fx = createSparks(scene, 320), learn = createLearn({ zone: 'world-restaurant', cell: 'L1-5-1' }), v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), vWord = new THREE.Vector3(), seen = new Set(), errors = [];
const voice = createVoice({ el: document.getElementById('word'), screenOf: stage.screenOf, onSaid: (w, by, name) => learn.note(w, { skill: name ? 'listen' : 'move', input: 'drag', game: 'hungry-monster' }) });
const plane = new THREE.Plane(new THREE.Vector3(...T.PLANE.N), -T.PLANE.D), zOf = y => (T.PLANE.D - T.PLANE.N[1] * y) / T.PLANE.N[2];

// 몬스터 넷
const M = {};
for (const name of ['momo', 'bobo', 'gogo', 'toto']) {
  const actor = await createActor(scene, { model: name }), s = actor.state; actor.root.traverse(o => { if (o.isMesh) o.receiveShadow = !o.name.startsWith('GogoEyes'); });
  actor.place(T.SEAT[name], T.ROW_Z, 0); s.y = T.STAND_Y; s.size = s.sizeTo = T.SCALE[name]; actor.lookAt(camera.position);
  const brain = createBrain(actor, { bounds: { X: 4.3, Z0: T.ROW_Z, Z1: T.ROW_Z } });
  M[name] = { name, actor, s, brain, x: T.SEAT[name], k: T.PITCH[name], mem: {}, hot: 0, fire: -1, fed: 0, lastFed: 0, mouth: new THREE.Vector3(), mp: new THREE.Vector3(), eating: false, near: 0 };
}
const monsters = Object.values(M), say = (m, kind) => chirp(kind, m.k * m.s.size ** -0.9);
// 음식 여섯(접시 위)
const foods = Object.keys(FOOD).map((kind, i) => {
  const plate = part.plate.clone(); plate.position.set(T.PLATE_X[i], 0, T.PLATE_Z); scene.add(plate);
  const obj = new THREE.Group(), mesh = part[kind]; mesh.material = mesh.material.clone(); obj.add(mesh); scene.add(obj);
  const home = { x: T.PLATE_X[i], y: T.PLATE_Y + FOOD[kind].r + 0.03 };
  return { kind, ...FOOD[kind], obj, mesh, raw: mesh, home, x: home.x, y: home.y, vx: 0, vy: 0, state: 'home', rot: 0, spin: 0, pop: 1, popV: 0, t: 0, cooked: '', into: null, rest: 0 };
});
const friedMesh = part.egg_fried; friedMesh.material = friedMesh.material.clone();
const top = f => vWord.set(f.x, f.y + f.r + 0.12, zOf(f.y)), head = m => vWord.set(m.s.pos.x, m.s.y + 1.1 * m.s.size, m.s.pos.z);
function cook(f, how) {
  if (f.cooked) return; f.cooked = how; seen.add(how);
  if (how === 'fried') { f.obj.remove(f.mesh); f.mesh = friedMesh; f.obj.add(friedMesh); f.rot = 0; f.spin = 0; sfx.splat(); } else { f.mesh.material.color.set('#b98044'); sfx.fizz(); }
  f.popV = 5; fx.spark(v3.set(f.x, f.y, zOf(f.y)), how === 'fried' ? '#fff3c0' : '#ffb060', 12, 0.2, 1.2);
}
function respawn(f) { if (f.cooked === 'fried') { f.obj.remove(f.mesh); f.mesh = f.raw; f.obj.add(f.raw); } f.mesh.material.color.set('#ffffff'); f.cooked = ''; f.x = f.home.x; f.y = f.home.y; f.vx = f.vy = 0; f.rot = f.spin = 0; f.state = 'home'; f.pop = 0.01; f.popV = 6; f.obj.visible = true; sfx.pop(); }

// ───────────────────────── 몬스터가 하는 일 ─────────────────────────
/** 먹는다: 우물우물 씹고, 맛에 따라(그리고 성격에 따라) 반응한다. */
function eat(m, f) {
  f.state = 'eat'; f.into = m; f.t = 0; m.eating = true; m.fed++; m.lastFed = clock; for (const o of monsters) if (o !== m && clock - o.lastFed > T.NEGLECT * 0.5) o.waited = (o.waited || 0) + 1;
  const { actor, s, brain } = m, { wait, walk } = brain, taste = f.taste, known = m.mem[f.kind]; m.mem[f.kind] = taste;
  brain.run(async tok => {
    await wait(tok, 0.14);                                                             // 음식이 입에 들어오는 동안
    sfx.munch(3); for (let i = 0; i < 5; i++) { actor.setMood(i % 2 ? 'chewB' : 'chewA', 0.3); s.sizeV += (i % 2 ? -0.5 : 0.7); fx.spark(m.mouth, '#f3cf94', 2, 0.08, 0.7); await wait(tok, 0.15); }
    sfx.gulp(); m.eating = false;
    voice.word(SHOUT[taste], () => head(m), { cls: CLS[taste], by: m.name, pitch: clamp(1.15 * m.k, 0.3, 2) });
    if (f.cool && m.hot > 0) { m.hot = 0; m.fire = -1; seen.add('cool'); sfx.fizz(); fx.spark(head(m), '#ffffff', 16, 0.3, 1, { up: true }); actor.setMood('smile', 1.6); say(m, 'joy'); await wait(tok, 1.2); return; }
    if (taste === 'yum') {
      const hops = m.name === 'momo' ? 3 : f.best ? 2 : 1;                             // 모모는 맛있으면 통통 튄다
      if (f.best) for (const o of monsters) if (o !== m && !o.brain.busy) { o.actor.setMood('want', 1.4); o.actor.lookAt(head(m)); }   // 케이크는 모두가 부러워한다
      if (m.name === 'gogo' && !known) { actor.setMood('wow', 0.5); say(m, 'wow'); await wait(tok, 0.45); }   // 고고는 처음 먹는 것에 눈이 커진다
      for (let i = 0; i < hops; i++) { actor.act('jump', { mood: 'joy' }); say(m, 'yum'); await wait(tok, 0.8); }
      if (m.name === 'toto' && f.best) { actor.pose('reach', 1); for (let i = 0; i < 4; i++) { sfx.tick(); tone(900, 500, 0.05, { g: 0.12 }); await wait(tok, 0.16); } actor.pose('reach', 0); seen.add('clap'); }   // 토토는 큰 것에 손뼉
      if (m.name === 'momo') { s.sizeTo = T.SCALE.momo * (1 + T.FAT * Math.min(m.fed, T.FULL_AT)); if (m.fed >= T.FULL_AT) { seen.add('burp'); actor.setMood('smile', 3); actor.pose('sway', 1); tone(140, 70, 0.45, { type: 'sawtooth', g: 0.12 }); s.sizeV -= 1.2; await wait(tok, 2.6); actor.pose('sway', 0); m.fed = 0; s.sizeTo = T.SCALE.momo; } }
    } else if (taste === 'sour') {
      actor.setMood('sour', 1.7); actor.pose('fluster', 0.6); say(m, 'yuck'); s.sizeV -= 1.0; laugh(m); await wait(tok, 0.9); actor.pose('fluster', 0);
      if (m.name === 'bobo') { actor.pose('hands', 1); seen.add('hide'); await wait(tok, 1.6); actor.pose('hands', 0); }          // 보보는 얼굴을 가린다
      else if (m.name === 'toto') { actor.act('jump', { mood: 'joy' }); say(m, 'joy'); seen.add('likesSour'); await wait(tok, 0.8); }   // 토토는 신 것을 좋아한다
      else await wait(tok, 0.6);
    } else if (taste === 'hot') {
      m.hot = T.HOT_FOR; m.fire = T.FIRE_AT; actor.setMood('hot', 2.4); say(m, 'hot'); sfx.fizz(); laugh(m); actor.pose('fluster', 1);
      await wait(tok, T.FIRE_AT + T.FIRE_FOR);
      if (m.name === 'momo') { actor.pose('fluster', 0); actor.act('jump', { mood: 'joy' }); say(m, 'yum'); seen.add('eatsAnything'); await wait(tok, 0.8); }   // 모모는 매워도 맛있다
      else { await walk(tok, m.x + 0.75, T.ROW_Z); await walk(tok, m.x - 0.75, T.ROW_Z); await walk(tok, m.x, T.ROW_Z); actor.pose('fluster', 0); await brain.face(tok, 0); }
    }
  });
}
/** 누가 시거나 매워서 쩔쩔매면 토토가 깔깔 웃는다. */
function laugh(who) { const t = M.toto; if (who === t || t.brain.busy) return; seen.add('laugh'); t.actor.lookAt(head(who)); t.brain.run(async tok => { await t.brain.wait(tok, 0.35); t.actor.act('jump', { mood: 'joy' }); say(t, 'joy'); await t.brain.wait(tok, 0.9); }); }
/** 저만 못 먹으면 조른다. */
function ask(m) { seen.add('ask'); m.waited = 0; m.lastFed = clock - T.NEGLECT * 0.4; m.brain.run(async tok => { m.actor.setMood('want', 1.6); m.actor.pose('reach', 1); say(m, 'want'); m.actor.act('jump'); await m.brain.wait(tok, 1.1); m.actor.pose('reach', 0); m.actor.setMood('pout', 1.2); await m.brain.wait(tok, 0.8); }); }
/** 몬스터를 만지면 간지러워하며 이름이 나온다. */
function tickle(m) { voice.word(MNAME[m.name], () => head(m), { name: true, by: m.name }); if (m.brain.busy) return; m.brain.run(async tok => { m.actor.act('surprise', { mood: 'joy' }); say(m, 'joy'); m.s.sizeV += 1.2; await m.brain.wait(tok, 0.9); }); }

// ───────────────────────── 손 ─────────────────────────
const P = { down: false, x: 0, y: 0, food: null, px: 0, py: 0 };
function foodAt(x, y) { let best = null, bd = T.PICK_PX; for (const f of foods) { if (f.state === 'eat' || f.state === 'gone') continue; const c = stage.screenOf(v3.set(f.x, f.y, zOf(f.y))), d = Math.hypot(c.x - x, c.y - y); if (d < bd) { bd = d; best = f; } } return best; }
function monsterAt(x, y) { let best = null, bd = 1e9; for (const m of monsters) { const c = stage.screenOf(v3.set(m.s.pos.x, m.s.y + 0.6 * m.s.size, m.s.pos.z)), d = Math.hypot(c.x - x, c.y - y); if (d < T.PICK_PX * 1.5 * m.s.size && d < bd) { bd = d; best = m; } } return best; }
function grab(f) { P.food = f; f.state = 'held'; f.vx = f.vy = 0; f.popV = 4; f.rest = 0; sfx.grab(); voice.word(f.name, () => top(f), { name: true, by: f.kind }); }
function letGo() { const f = P.food; if (!f) return; P.food = null; if (f.state !== 'held') return; f.state = 'fly'; const sp = Math.hypot(f.vx, f.vy) * T.THROW, k = sp > T.THROW_MAX ? T.THROW_MAX / sp : 1; f.vx *= T.THROW * k; f.vy *= T.THROW * k; f.spin = clamp(-f.vx * 1.6, -9, 9); if (Math.hypot(f.vx, f.vy) > 4) sfx.whoosh(); }
canvas.addEventListener('pointerdown', e => {
  P.down = true; P.x = e.clientX; P.y = e.clientY; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} unlock();
  const f = foodAt(e.clientX, e.clientY); if (f) { grab(f); return; } const m = monsterAt(e.clientX, e.clientY); if (m) tickle(m);
});
canvas.addEventListener('pointermove', e => { P.x = e.clientX; P.y = e.clientY; });
const up = () => { P.down = false; letGo(); }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
sndEl.classList.toggle('off', isMuted()); sndEl.addEventListener('click', () => { setMuted(!isMuted()); sndEl.classList.toggle('off', isMuted()); });
document.getElementById('again').addEventListener('click', () => voice.again());

// ───────────────────────── 매 장면 ─────────────────────────
let clock = 0;
function stepFood(f, dt) {
  const base = T.PLATE_Y + f.r + 0.02;
  if (f.state === 'held') {
    if (stage.worldOn(plane, P.x, P.y - T.LIFT_PX, v3)) { const k = 1 - Math.exp(-T.FOLLOW * dt), nx = f.x + (clamp(v3.x, -T.WALL_X, T.WALL_X) - f.x) * k, ny = f.y + (Math.max(base, v3.y) - f.y) * k;
      f.vx += ((nx - f.x) / dt - f.vx) * 0.35; f.vy += ((ny - f.y) / dt - f.vy) * 0.35; f.x = nx; f.y = ny; f.rot += (clamp(-f.vx * 0.06, -0.5, 0.5) - f.rot) * Math.min(1, 10 * dt); }
  } else if (f.state === 'fly') {
    f.vy -= T.GRAVITY * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.spin * dt;
    if (Math.abs(f.x) > T.WALL_X) { f.x = Math.sign(f.x) * T.WALL_X; f.vx *= -0.5; }
    if (f.y < base) { f.y = base; const hit = -f.vy;
      const crack = f.kind === 'egg' && !f.cooked && hit > T.CRACK_V; if (crack) { cook(f, 'fried'); f.vx = 0; f.spin = 0; }   // 달걀은 세게 떨어지면 깨져서 프라이가 된다(튀지 않고 퍼진다)
      if (hit > 1.4 && !crack) { f.vy = hit * T.BOUNCE; f.vx *= 0.72; f.spin *= 0.6; sfx.bounce(hit / 7); } else { f.vy = 0; f.vx *= Math.max(0, 1 - 6 * dt); f.spin *= Math.max(0, 1 - 6 * dt); if ((f.rest += dt) > T.REST_BACK) { f.state = 'back'; f.t = 0; f.fx = f.x; f.fy = f.y; } } }
  } else if (f.state === 'back') {                                                                  // 접시로 폴짝 돌아간다
    f.t += dt; const k = clamp(f.t / 0.4, 0, 1); f.x = f.fx + (f.home.x - f.fx) * k; f.y = f.fy + (f.home.y - f.fy) * k + 0.5 * 4 * k * (1 - k); f.rot *= 1 - k; if (k >= 1) { f.state = 'home'; f.rest = 0; }
  } else if (f.state === 'eat') {                                                                   // 입으로 빨려 들어간다
    f.t += dt; const k = clamp(f.t / 0.14, 0, 1), mo = f.into.mouth; f.obj.position.lerp(mo, k); f.obj.scale.setScalar(Math.max(0.01, 1 - k)); if (k >= 1) { f.state = 'gone'; f.obj.visible = false; f.t = T.RESPAWN; } return;
  } else if (f.state === 'gone') { if ((f.t -= dt) <= 0) respawn(f); return; }
  f.popV += (160 * (1 - f.pop) - 13 * f.popV) * dt; f.pop += f.popV * dt;
  const flat = f.cooked === 'fried'; f.obj.position.set(f.x, f.y - (flat ? f.r - 0.03 : 0), zOf(f.y)); f.obj.rotation.set(0, 0, flat ? 0 : f.rot); f.obj.scale.setScalar(Math.max(0.01, f.pop) * (f.state === 'held' ? 1.12 : 1));
}
function stepMonster(m, dt) {
  const { actor, s } = m, sz = s.size; if (!m.brain.B.hop) s.y = T.STAND_Y;
  m.mouth.set(s.pos.x, s.y + 0.6 * sz, s.pos.z + 0.31 * sz); const sc = stage.screenOf(m.mouth); stage.worldOn(plane, sc.x, sc.y, m.mp);   // 입이 화면에서 겹쳐 보이는 「기운 면」 위의 자리
  const f = foods.find(o => o.state === 'held' || (o.state === 'fly' && o.y > 0.5)); let near = 9;
  if (f) { near = Math.hypot(f.x - m.mp.x, f.y - m.mp.y); if (!m.brain.busy) actor.lookAt(v3.set(f.x, f.y, zOf(f.y))); }
  if (f && !m.eating && near < T.EAT_R * sz) { m.dwell = (m.dwell || 0) + dt; if ((f.state === 'fly' && (f.vy > -1.5 || Math.abs(f.vx) > 1.5)) || (f.state === 'held' && m.dwell >= T.EAT_DWELL)) { m.dwell = 0; eat(m, f); return; } } else m.dwell = 0;   // 던진 것은 받아먹고, 그냥 떨어지는 것은 받지 않는다
  if (f && !m.brain.busy && near < T.WANT_R) {                                    // 음식이 다가온다: 좋아하는 것이면 입을 벌리고, 싫었던 것이면 움찔한다
    const was = m.mem[f.kind], likes = m.name === 'momo' || was === undefined || was === 'yum' || (m.name === 'toto' && was === 'sour') || (f.cool && m.hot > 0), k = 1 - near / T.WANT_R;
    if (likes) { actor.setMood(m.name === 'gogo' && was === undefined ? 'wow' : 'want', 0.25); actor.pose('lean', 0.9 * k); actor.pose('reach', m.name === 'momo' ? k : 0); actor.pose('hands', 0); }
    else { actor.setMood('fluster', 0.25); actor.pose('lean', -0.8 * k); actor.pose('hands', m.name === 'bobo' ? 1 : 0); seen.add('flinch'); }
    m.near = 0.3;
  } else if (m.near > 0 && (m.near -= dt) <= 0 && !m.brain.busy) { actor.pose('lean', 0); actor.pose('reach', 0); actor.pose('hands', 0); actor.lookAt(camera.position); }
  // 매운 기운: 얼굴이 빨개지고 김이 나고, 잠깐 불을 뿜어 앞 접시의 음식을 익힌다
  if (m.hot > 0) { m.hot -= dt; actor.tint('#ff3a20', clamp(m.hot / T.HOT_FOR, 0, 1) * 0.6); if (Math.random() < dt * 14) fx.spark(head(m), '#ffffff', 1, 0.2, 0.5, { up: true }); if (m.hot <= 0) actor.tint('#ffffff', 0); }
  if (m.fire > -1) { m.fire -= dt; if (m.fire <= 0 && m.fire > -T.FIRE_FOR) { seen.add('fire'); for (let i = 0; i < 3; i++) { const k = Math.random(); fx.spark(v3.copy(m.mouth).lerp(v3b.set(s.pos.x, 0.25, T.PLATE_Z), k), k < 0.5 ? '#ffd24a' : '#ff7a2a', 1, 0.07 + 0.1 * k, 0.6); }
      for (const o of foods) if (o.state === 'home' && Math.abs(o.x - s.pos.x) < T.FIRE_REACH) { if (o.kind === 'bread') cook(o, 'toast'); else if (o.kind === 'egg') cook(o, 'fried'); } }
    if (m.fire <= -T.FIRE_FOR) m.fire = -1; }
  if (!m.brain.busy && !f && (m.waited || 0) >= 3 && clock - m.lastFed > T.NEGLECT) ask(m);
  m.brain.tick(dt); actor.update(dt);
}
function step(dt) { clock += dt; for (const f of foods) stepFood(f, dt); for (const m of monsters) stepMonster(m, dt); voice.tick(dt); fx.tick(dt); }
for (const m of monsters) m.actor.on('step', () => sfx.thud(m.s.size * 0.7));

// ───────────────────────── 돌리기 ─────────────────────────
const summary = () => ({ monsters: Object.fromEntries(monsters.map(m => [m.name, `${m.s.mood}${m.s.act ? '/' + m.s.act.name : ''} fed${m.fed} hot${m.hot > 0 ? 1 : 0} size${m.s.size.toFixed(2)} x${m.s.pos.x.toFixed(1)}`])),
  foods: Object.fromEntries(foods.map(f => [f.kind, f.state + (f.cooked ? ':' + f.cooked : '')])), said: voice.said, seen: [...seen], learned: learn.log.length, errors: [...errors, ...monsters.flatMap(m => m.brain.errors)] });
const foodOf = k => foods.find(f => f.kind === k), put = (x, y) => { const c = stage.screenOf(v3.set(x, y, zOf(y))); P.x = c.x; P.y = c.y + T.LIFT_PX; };
window.__lab = { T, M, foods, step, summary, stage, grab, letGo, P };
if (AUTO) runAuto(stage, { step, summary, commands: {
  feed: async (a, b, tick) => { const m = M[a], f = foodOf(b), HI = 2.3; for (let i = 0; i < 120 && f.state !== 'home'; i++) await tick(); grab(f);       // 다른 입을 스치지 않게 머리 위로 들어 옮긴 뒤 내린다
    for (let i = 1; i <= 10; i++) { put(f.home.x, f.home.y + (HI - f.home.y) * i / 10); await tick(); } for (let i = 1; i <= 14; i++) { put(f.home.x + (m.mp.x - f.home.x) * i / 14, HI); await tick(); }
    for (let i = 1; i <= 14 && f.state === 'held'; i++) { put(m.mp.x, HI + (m.mp.y - HI) * i / 14); await tick(); } for (let i = 0; i < 12 && f.state === 'held'; i++) await tick(); letGo(); },
  drop: async (a, b, tick) => { const f = foodOf(a); grab(f); for (let i = 1; i <= 20; i++) { put(f.home.x, f.home.y + 2.0 * i / 20); await tick(); } for (let i = 0; i < 10; i++) await tick(); f.vx = f.vy = 0; letGo(); },
  throw: async (a, b, tick) => { const f = foodOf(a); grab(f); for (let i = 0; i < 6; i++) await tick(); const [vx, vy] = b.split('_').map(Number); f.vx = vx / T.THROW; f.vy = vy / T.THROW; letGo(); },
  tap: a => tickle(M[a]),
} }); else { stage.play(step); document.title = 'READY ' + document.title; }
