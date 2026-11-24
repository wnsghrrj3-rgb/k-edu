/* 몬스터 식당 · 세상에서 가장 큰 햄버거 — 통합 설계서 §13 「햄버거」(L1-5-2).
 * 하는 일은 하나: 재료를 집어 도마 위에 실제로 쌓는다. 가운데가 어긋나면 미끄러지고 무너진다. 몬스터가 한입에 먹는다.
 * 정답 · 점수 · 시간제한 · 설명 글 없음. 영어는 집을 때 재료 이름(Bread · Meat · Cheese · Tomato · Lettuce), 몬스터의 "More!" · "Big!" · "Yummy!".
 * 확인용 주소: ?mute · ?auto=명령,…(put:재료:어긋남 · eat:몬스터 · step:초) → 끝나면 제목에 상태. */
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
  KIND: {   // 이름 · 모형 · 두께 · 너비 · 붙드는 힘(작을수록 미끄럽다) · 재료 자리(가로)
    bun: { name: 'Bread', mesh: 'bun_bottom', h: 0.17, w: 0.86, grip: 0.92, at: -3.75 }, meat: { name: 'Meat', mesh: 'patty', h: 0.13, w: 0.83, grip: 0.86, at: -2.6 },
    cheese: { name: 'Cheese', mesh: 'cheese', h: 0.045, w: 0.8, grip: 0.8, at: -1.5 }, tomato: { name: 'Tomato', mesh: 'tomato', h: 0.08, w: 0.77, grip: 0.55, at: 1.5 },
    lettuce: { name: 'Lettuce', mesh: 'lettuce', h: 0.06, w: 0.94, grip: 0.62, at: 2.6 }, top: { name: 'Bread', mesh: 'bun_top', h: 0.3, w: 0.87, grip: 0.9, at: 3.75 },
  },
  Z: 0.55, BOARD_W: 1.36, BOARD_H: 0.08,    // 재료가 움직이는 면의 깊이 · 도마 너비 · 두께
  SEAT: { momo: -2.2, toto: 2.2 }, ROW_Z: -0.5, STAND_Y: -0.15, SCALE: { momo: 1.12, toto: 1.0 }, PITCH: { momo: 0.78, toto: 1.14 },
  FOLLOW: 26, LIFT_PX: 30, THROW: 0.8, THROW_MAX: 9, GRAVITY: 13, PICK_PX: 64,
  LAND: 0.9,                                // 받치는 것과 이만큼(너비 합의 반의 비율) 겹쳐야 얹힌다
  SLIP: 0.05,                               // 미끄러운 재료 위에 얹히면 어긋난 쪽으로 더 밀리는 정도
  SWAY_K: 26, SWAY_C: 2.2, SWAY_PUSH: 1.6, SWAY_MAX: 0.3,   // 쌓은 것이 휘청이는 용수철: 세기 · 잦아듦 · 얹을 때 미는 힘 · 이보다 기울면 무너진다
  MORE_AT: 3, BIG_AT: 8,                    // 이만큼 쌓이면 "More!" · "Big!"
  SNEAK: 10,                                // 쌓아 두고 가만있으면 모모가 하나 집어 먹기까지(초)
  EAT_R: 0.34, RESPAWN: 0.5, LOOSE_FOR: 2.2,
  LIFT_FROM: 1.5, LIFT_K: 0.7,              // 이 높이를 넘으면 카메라가 따라 올라간다 · 그 정도
  CAM: { AIM: [0, 1.1, 0], TILT: 14, FOV: 30, HALF_W: 4.6, MIN_DIST: 9 },
};
const MNAME = { momo: 'Momo', toto: 'Toto' };

// ───────────────────────── 무대 ─────────────────────────
const canvas = document.getElementById('c'), sndEl = document.getElementById('snd'); if (AUTO) document.body.classList.add('auto');
const stage = createStage({ canvas, sky: ['#fff0dc', '#ffe0c2', '#f6c9a2'], cam: T.CAM, hemi: ['#fff6ec', '#e6b98f', 0.7], exposure: 0.92 }), { scene, camera } = stage;
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshStandardMaterial({ color: '#ffc9a3', roughness: 1 })); wall.position.set(0, 8, -1.76); wall.receiveShadow = true; scene.add(wall);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 12).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#d99a6c', roughness: 1 })); ground.position.set(0, -2.5, 2); ground.receiveShadow = true; scene.add(ground);
const load = n => new GLTFLoader().loadAsync(new URL(`../../assets/${n}.glb?v=1`, import.meta.url).href), [kit, pack] = await Promise.all([load('food'), load('burger')]), part = {};
for (const g of [kit, pack]) g.scene.traverse(o => { if (o.isMesh) { part[o.name] = o; o.castShadow = o.name !== 'kitchen'; o.receiveShadow = true; } });
scene.add(part.kitchen); part.board.position.set(0, T.BOARD_H, T.Z); scene.add(part.board);
const fx = createSparks(scene, 260), learn = createLearn({ zone: 'world-restaurant', cell: 'L1-5-2' }), v3 = new THREE.Vector3(), vWord = new THREE.Vector3(), seen = new Set(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -T.Z);
const voice = createVoice({ el: document.getElementById('word'), screenOf: stage.screenOf, onSaid: (w, by, name) => learn.note(w, { skill: name ? 'listen' : 'move', input: 'drag', game: 'big-burger' }) });
const M = {};
for (const name of ['momo', 'toto']) {
  const actor = await createActor(scene, { model: name }), s = actor.state; actor.root.traverse(o => { if (o.isMesh) o.receiveShadow = !o.name.startsWith('GogoEyes'); });
  actor.place(T.SEAT[name], T.ROW_Z, 0); s.y = T.STAND_Y; s.size = s.sizeTo = T.SCALE[name]; actor.lookAt(camera.position);
  M[name] = { name, actor, s, brain: createBrain(actor), k: T.PITCH[name], mouth: new THREE.Vector3(), mp: new THREE.Vector3(), ate: 0 };
}
const monsters = Object.values(M), toto = M.toto, momo = M.momo, say = (m, kind) => chirp(kind, m.k * m.s.size ** -0.9), head = m => vWord.set(m.s.pos.x, m.s.y + 1.1 * m.s.size, m.s.pos.z);

// 재료: 자리마다 하나씩 놓여 있고, 집어 가면 새로 나온다
const pieces = [], stack = [], BASE = T.BOARD_H, sway = { a: 0, v: 0 }; let clock = 0, touched = 0;
function spawn(kind) {
  const K = T.KIND[kind], obj = part[K.mesh].clone(); scene.add(obj); const dish = part.plate.clone(); if (!spawn.dish) spawn.dish = {}; if (!spawn.dish[kind]) { dish.position.set(K.at, 0, T.Z); dish.scale.setScalar(1.15); scene.add(dish); spawn.dish[kind] = dish; }
  const p = { kind, K, obj, x: K.at, y: 0.09 + K.h / 2, a: 0, vx: 0, vy: 0, va: 0, state: 'tray', pop: 0.01, popV: 6, t: 0, sx: 0, into: null }; pieces.push(p); return p;
}
for (const k in T.KIND) spawn(k);
const topY = () => BASE + stack.reduce((a, p) => a + p.K.h, 0), top = p => vWord.set(p.x, p.y + p.K.h / 2 + 0.16, T.Z);
/** 무너진다: from 번째부터 위의 것이 dir 쪽으로 쏟아진다. */
function topple(from, dir) {
  const fall = stack.splice(from); if (!fall.length) return; seen.add('topple'); sfx.splat(); stage.shake(0.04); sway.v += dir * 1.5;
  fall.forEach((p, i) => { p.state = 'loose'; p.vx = dir * (1.2 + rand(0, 1.6) + 0.22 * i); p.vy = rand(0.8, 2.6); p.va = -dir * rand(2, 6); p.t = T.LOOSE_FOR; });
  for (const m of monsters) if (!m.brain.busy) m.brain.run(async tok => { m.actor.setMood('wow', 0.8); say(m, 'wow'); m.actor.act('surprise'); await m.brain.wait(tok, 0.9); if (m === toto) { m.actor.act('jump', { mood: 'joy' }); say(m, 'joy'); await m.brain.wait(tok, 0.8); } });
}
/** 쌓인 것이 버티는지 본다: 어느 층이든 그 위의 무게 가운데가 받침 밖으로 나가면 거기서부터 무너진다. */
function settle() {
  for (let i = -1; i < stack.length - 1; i++) {
    let m = 0, c = 0; for (let j = i + 1; j < stack.length; j++) { const w = stack[j].K.w * stack[j].K.h; m += w; c += stack[j].sx * w; } c /= m;
    const center = i < 0 ? 0 : stack[i].sx, half = (i < 0 ? T.BOARD_W / 2 : stack[i].K.w / 2 * stack[i].K.grip);
    if (Math.abs(c - center) > half) { topple(i + 1, Math.sign(c - center)); return false; }
  }
  return true;
}
function land(p) {
  const under = stack[stack.length - 1], ux = under ? under.sx : 0; p.state = 'stack'; p.sx = p.x; if (under) p.sx += Math.sign(p.x - ux || 1) * T.SLIP * (1 - under.K.grip) * 4 * Math.min(1, Math.abs(p.x - ux) / 0.2);   // 미끄러운 것 위에서는 더 밀린다
  stack.push(p); p.popV = -3; sway.v += (p.sx - ux) * T.SWAY_PUSH * (1 + stack.length * 0.12); sfx.bounce(0.5); touched = clock; fx.spark(v3.set(p.x, p.y, T.Z), '#fff3c0', 4, 0.2, 0.6);
  if (!settle()) return; const n = stack.length;
  if (n >= T.BIG_AT && !land.big) { land.big = true; seen.add('big'); voice.word('Big!', () => head(toto), { cls: 'big', by: 'toto', pitch: clamp(1.15 * toto.k, 0.3, 2) }); cheer(toto, 3); }
  else if (n >= T.MORE_AT && p.kind !== 'top') { if (voice.word('More!', () => head(toto), { cls: 'shout', by: 'toto', pitch: clamp(1.15 * toto.k, 0.3, 2) })) cheer(toto, 1); }
  if (p.kind === 'top' && n >= 3) gulp(toto, 0.9);                                    // 뚜껑 빵을 덮으면 토토가 한입에
}
function cheer(m, claps) { if (m.brain.busy) return; m.brain.run(async tok => { m.actor.setMood('want', 1.2); m.actor.pose('reach', 1); for (let i = 0; i < claps * 2; i++) { tone(900, 500, 0.05, { g: 0.1 }); await m.brain.wait(tok, 0.16); } m.actor.pose('reach', 0); say(m, 'want'); await m.brain.wait(tok, 0.3); }); }
/** 한입에: 위에서부터 하나씩 입으로 빨려 들어간다. 먹은 만큼 잠깐 통통해진다. */
function gulp(m, after = 0) {
  if (!stack.length || m.gulping) return; m.gulping = true; seen.add('gulp'); land.big = false;
  m.brain.run(async tok => {
    await m.brain.wait(tok, after); m.actor.setMood('want', 9); m.actor.pose('lean', 1); say(m, 'want'); await m.brain.wait(tok, 0.35);
    while (stack.length) { const p = stack.pop(); p.state = 'eat'; p.into = m; p.t = 0; m.ate++; m.s.sizeTo = Math.min(T.SCALE[m.name] * 1.5, m.s.sizeTo + 0.035); m.s.sizeV += 0.5; sfx.munch(1); await m.brain.wait(tok, 0.13); }
    m.actor.pose('lean', 0); for (let i = 0; i < 4; i++) { m.actor.setMood(i % 2 ? 'chewB' : 'chewA', 0.3); await m.brain.wait(tok, 0.15); } sfx.gulp();
    voice.word('Yummy!', () => head(m), { cls: 'yum', by: m.name, pitch: clamp(1.15 * m.k, 0.3, 2) }); m.actor.act('jump', { mood: 'joy' }); say(m, 'yum'); await m.brain.wait(tok, 0.9);
    tone(140, 70, 0.45, { type: 'sawtooth', g: 0.12 }); m.s.sizeV -= 1.2; m.actor.setMood('smile', 1.5); await m.brain.wait(tok, 1.2); m.s.sizeTo = T.SCALE[m.name]; m.gulping = false; touched = clock;
  });
}
/** 가만두면 모모가 맨 위의 것을 슬쩍 집어 먹는다. */
function sneak() { const p = stack.pop(); if (!p) return; seen.add('sneak'); touched = clock; momo.brain.run(async tok => { momo.actor.pose('reach', 1); momo.actor.setMood('want', 0.6); await momo.brain.wait(tok, 0.3); p.state = 'eat'; p.into = momo; p.t = 0; sfx.munch(2); await momo.brain.wait(tok, 0.5); momo.actor.pose('reach', 0);
  voice.word('Yummy!', () => head(momo), { cls: 'yum', by: 'momo', pitch: clamp(1.15 * momo.k, 0.3, 2) }); momo.actor.act('jump', { mood: 'joy' }); say(momo, 'yum'); if (!toto.brain.busy) { toto.actor.setMood('pout', 1.6); toto.actor.lookAt(head(momo)); } await momo.brain.wait(tok, 0.9); }); }

// ───────────────────────── 손 ─────────────────────────
const P = { down: false, x: 0, y: 0, piece: null };
function pieceAt(x, y) { let best = null, bd = T.PICK_PX; for (const p of pieces) { if (p.state === 'eat' || (p.state === 'stack' && p !== stack[stack.length - 1])) continue; const c = stage.screenOf(v3.set(p.x, p.y, T.Z)), d = Math.hypot(c.x - x, c.y - y); if (d < bd) { bd = d; best = p; } } return best; }   // 쌓인 것은 맨 위만 집을 수 있다
function monsterAt(x, y) { for (const m of monsters) { const c = stage.screenOf(v3.set(m.s.pos.x, m.s.y + 0.6 * m.s.size, m.s.pos.z)); if (Math.hypot(c.x - x, c.y - y) < T.PICK_PX * 1.5 * m.s.size) return m; } return null; }
function grab(p) { if (p.state === 'tray') { p.left = T.RESPAWN; } else if (p.state === 'stack') stack.pop(); P.piece = p; p.state = 'held'; p.vx = p.vy = p.va = 0; p.popV = 4; touched = clock; sfx.grab(); voice.word(p.K.name, () => top(p), { name: true, by: p.kind }); }
function letGo() { const p = P.piece; if (!p) return; P.piece = null; if (p.state !== 'held') return; p.state = 'fly'; const sp = Math.hypot(p.vx, p.vy) * T.THROW, k = sp > T.THROW_MAX ? T.THROW_MAX / sp : 1; p.vx *= T.THROW * k; p.vy *= T.THROW * k; p.va = clamp(-p.vx * 1.2, -6, 6) * (Math.abs(p.vx) > 2 ? 1 : 0); }
function tapMonster(m) { if (stack.length && !m.gulping) { gulp(m); return; } voice.word(MNAME[m.name], () => head(m), { name: true, by: m.name }); if (!m.brain.busy) m.brain.run(async tok => { m.actor.act('surprise', { mood: 'joy' }); say(m, 'joy'); await m.brain.wait(tok, 0.9); }); }
canvas.addEventListener('pointerdown', e => { P.down = true; P.x = e.clientX; P.y = e.clientY; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} unlock(); const p = pieceAt(e.clientX, e.clientY); if (p) { grab(p); return; } const m = monsterAt(e.clientX, e.clientY); if (m) tapMonster(m); });
canvas.addEventListener('pointermove', e => { P.x = e.clientX; P.y = e.clientY; });
const up = () => { P.down = false; letGo(); }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
sndEl.classList.toggle('off', isMuted()); sndEl.addEventListener('click', () => { setMuted(!isMuted()); sndEl.classList.toggle('off', isMuted()); });
document.getElementById('again').addEventListener('click', () => voice.again());

// ───────────────────────── 매 장면 ─────────────────────────
function stepPiece(p, dt) {
  const K = p.K, floor = 0.02 + K.h / 2;
  if (p.left > 0 && (p.left -= dt) <= 0) { spawn(p.kind); sfx.pop(); }
  if (p.state === 'held') {
    if (stage.worldOn(plane, P.x, P.y - T.LIFT_PX, v3)) { const k = 1 - Math.exp(-T.FOLLOW * dt), nx = p.x + (clamp(v3.x, -4.5, 4.5) - p.x) * k, ny = p.y + (Math.max(floor, v3.y) - p.y) * k; p.vx += ((nx - p.x) / dt - p.vx) * 0.35; p.vy += ((ny - p.y) / dt - p.vy) * 0.35; p.x = nx; p.y = ny; p.a += (clamp(-p.vx * 0.05, -0.4, 0.4) - p.a) * Math.min(1, 10 * dt); }
  } else if (p.state === 'fly' || p.state === 'loose') {
    p.vy -= T.GRAVITY * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
    if (p.state === 'fly' && p.vy <= 0) {                                              // 내려오다가 받침(맨 위 재료나 도마)에 얹힌다
      const under = stack[stack.length - 1], ux = under ? under.sx : 0, uw = under ? under.K.w : T.BOARD_W, ty = topY();
      if (p.y - K.h / 2 <= ty && p.y > ty - 0.25 && Math.abs(p.x - ux) < (uw + K.w) / 2 * T.LAND * (under ? 1 : 0.75)) { p.y = ty + K.h / 2; p.a = 0; p.vx = p.vy = p.va = 0; land(p); return draw(p, dt); }
    }
    if (p.y < floor) { p.y = floor; const hit = -p.vy; if (hit > 1.6) { p.vy = hit * 0.35; p.vx *= 0.7; sfx.bounce(hit / 8); } else { p.vy = 0; p.vx *= Math.max(0, 1 - (p.kind === 'tomato' ? 1.2 : 5) * dt); p.va = p.kind === 'tomato' ? -p.vx / 0.38 : p.va * Math.max(0, 1 - 8 * dt); if (p.state === 'fly') { p.state = 'loose'; p.t = T.LOOSE_FOR; } } }   // 토마토는 데굴데굴 굴러간다
    if (p.state === 'loose') { for (const m of monsters) if (!m.gulping && Math.hypot(p.x - m.mp.x, p.y - m.mp.y) < T.EAT_R * m.s.size && p.y > 0.3) { p.state = 'eat'; p.into = m; p.t = 0; seen.add('catch'); sfx.munch(1); m.actor.setMood('joy', 0.8); return draw(p, dt); }   // 쏟아지는 것을 받아먹는다
      if ((p.t -= dt) <= 0 || Math.abs(p.x) > 5.2) { p.state = 'eat'; p.into = null; p.t = 0; } }
  } else if (p.state === 'stack') { const i = stack.indexOf(p); let y = BASE; for (let j = 0; j < i; j++) y += stack[j].K.h; p.y = y + K.h / 2; p.x = p.sx + sway.a * (p.y - BASE); p.a = -sway.a * 0.9; }
  else if (p.state === 'eat') { p.t += dt; const k = clamp(p.t / 0.16, 0, 1); if (p.into) p.obj.position.lerp(p.into.mouth, k); p.obj.scale.setScalar(Math.max(0.01, 1 - k)); if (k >= 1) { scene.remove(p.obj); pieces.splice(pieces.indexOf(p), 1); } return; }
  draw(p, dt);
}
function draw(p, dt) { p.popV += (160 * (1 - p.pop) - 13 * p.popV) * dt; p.pop += p.popV * dt; p.obj.position.set(p.x, p.y, T.Z); p.obj.rotation.set(0, p.kind === 'cheese' ? 0.6 : 0, p.a); p.obj.scale.setScalar(Math.max(0.01, p.pop) * (p.state === 'held' ? 1.08 : 1)); }
function step(dt) {
  clock += dt;
  sway.v += (-T.SWAY_K * sway.a - T.SWAY_C * sway.v) * dt; sway.a += sway.v * dt;                 // 쌓은 것이 휘청인다 — 너무 기울면 위쪽이 쏟아진다
  if (Math.abs(sway.a) > T.SWAY_MAX / Math.max(1, stack.length / 5) && stack.length >= 3) { topple(Math.ceil(stack.length / 3), Math.sign(sway.a)); sway.v *= 0.3; }
  for (const p of [...pieces]) stepPiece(p, dt);
  for (const m of monsters) { const { actor, s } = m; s.y = T.STAND_Y; m.mouth.set(s.pos.x, s.y + 0.6 * s.size, s.pos.z + 0.31 * s.size); const sc = stage.screenOf(m.mouth); stage.worldOn(plane, sc.x, sc.y, m.mp);
    if (!m.brain.busy) actor.lookAt(P.piece ? v3.set(P.piece.x, P.piece.y, T.Z) : stack.length ? v3.set(stack[stack.length - 1].x, topY(), T.Z) : camera.position);
    m.brain.tick(dt); actor.update(dt); }
  if (stack.length && !P.piece && !momo.brain.busy && !toto.gulping && clock - touched > T.SNEAK) sneak();
  stage.st.lift = Math.max(0, topY() - T.LIFT_FROM) * T.LIFT_K; voice.tick(dt); fx.tick(dt);
}

// ───────────────────────── 돌리기 ─────────────────────────
const summary = () => ({ stack: stack.map(p => p.kind + (p.sx >= 0 ? '+' : '') + p.sx.toFixed(2)), height: +topY().toFixed(2), sway: +sway.a.toFixed(2), pieces: pieces.length, monsters: Object.fromEntries(monsters.map(m => [m.name, `${m.s.mood} ate${m.ate} size${m.s.size.toFixed(2)}`])),
  said: voice.said, seen: [...seen], learned: learn.log.length, errors: monsters.flatMap(m => m.brain.errors) });
window.__lab = { T, M, pieces, stack, step, summary, stage, grab, letGo, P, sway };
const put = (x, y) => { const c = stage.screenOf(v3.set(x, y, T.Z)); P.x = c.x; P.y = c.y + T.LIFT_PX; };
if (AUTO) runAuto(stage, { step, summary, commands: {
  put: async (a, b, tick) => { let p; for (let i = 0; i < 90 && !(p = pieces.find(q => q.kind === a && q.state === 'tray' && q.pop > 0.8)); i++) await tick(); grab(p); const x1 = +(b || 0), y1 = topY() + 0.55;
    for (let i = 1; i <= 16; i++) { put(p.K.at + (x1 - p.K.at) * i / 16, 0.3 + (y1 + 0.5 - 0.3) * Math.sin(Math.PI / 2 * i / 16)); await tick(); } for (let i = 1; i <= 8; i++) { put(x1, y1 + 0.5 - 0.5 * i / 8); await tick(); } for (let i = 0; i < 8; i++) await tick(); p.vx = p.vy = 0; letGo(); for (let i = 0; i < 40; i++) await tick(); },
  eat: a => tapMonster(M[a]),
} }); else { stage.play(step); document.title = 'READY ' + document.title; }
