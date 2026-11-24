/* 고고 — 모형(assets/gogo.glb · tools/make_gogo.py · make_gogo_clips.py 로 빚음)을 읽고 움직인다.
 * loadGogo()   모형 + 얼굴 다루기(눈 크기 · 눈꺼풀 · 눈길 · 소용돌이 · 입 모양 키). 1단계 보기(look.html)가 쓴다.
 * createGogo() 그 위에 움직임: 동작 클립 섞기 · 걸음과 이동 빠르기 맞추기 · 돌아서기 · 눈길 · 눈 깜박임 · 더듬이와 꼬리 출렁임 · 크기 용수철.
 * 몸은 클립이, 얼굴 · 더듬이 · 꼬리는 코드가 맡는다. 돌림은 모두 「고고 기준 축」(x = 고고의 왼쪽, y = 위, z = 앞)의 도. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ───────────────────────── 수치 ─────────────────────────
// 표정(눈꺼풀은 도 — lidU +면 감기고 -면 더 뜬다 · lidD +면 아래 눈꺼풀이 올라온다). 눈동자 크기(pupil)는 1.1 을 넘기지 않는다(눈꺼풀을 뚫고 나온다)
export const FACE = {
  idle:    { eye: 1.00, lidU: 0,   lidD: 0,  pupil: 1.00, swirl: 0, mouth: {} },
  smile:   { eye: 1.00, lidU: 0,   lidD: 34, pupil: 1.04, swirl: 0, mouth: { smile: 1 } },
  wow:     { eye: 1.17, lidU: -30, lidD: -8, pupil: 0.78, swirl: 0, mouth: { oh: 1 } },
  joy:     { eye: 1.03, lidU: 2,   lidD: 98, pupil: 1.00, swirl: 0, mouth: { open: 1 } },
  dizzy:   { eye: 1.06, lidU: 30,  lidD: 24, pupil: 0.00, swirl: 1, mouth: { wavy: 1 } },
  fluster: { eye: 1.10, lidU: -22, lidD: 0,  pupil: 0.84, swirl: 0, mouth: { worry: 1 } },
};
export const BLINK = { lidU: 102, lidD: 44 };   // 눈을 감은 값(위 눈꺼풀이 내려오고 아래가 마중 나와, 짙은 눈금이 ◡ 로 남는다)
export const GAZE = { YAW: 24, PITCH: 17, IN: 3, IN_SMALL: 14 };   // 눈길이 끝까지 갔을 때 눈동자가 도는 각(도) · 두 눈동자를 안쪽으로 모으는 각 · 눈동자가 작아질수록 더 모으는 각(사시처럼 보이지 않게)
export const MOVE = {
  SMALL: 0.7, BIG: 1.35,                         // 몸 크기가 이보다 작으면 종종걸음, 이보다 크면 묵직한 걸음
  TURN: { walk: 300, heavy: 135, scurry: 640 },  // 돌아서는 빠르기(도/초)
  TURN_FIRST: 70,                                // 이 각(도)보다 크게 틀어져 있으면 제자리에서 먼저 돌아선다
  TURN_STEP: 0.8,                                // 제자리에서 돌 때 발을 구르는 빠르기(걸음 클립의 배속)
  HURRY: { walk: 1.7, heavy: 1.0, scurry: 1.45 }, // 멀리 갈 때 걸음을 재촉하는 배속(발 구르기와 나아가기가 같이 빨라진다)
  HURRY_FROM: 1.0, HURRY_FULL: 2.2,              // 이 거리부터 재촉하기 시작해 이 거리에서 다 재촉한다(몸 크기 1일 때)
  ACCEL: 9,                                      // 걸음 빠르기가 붙고 줄어드는 정도(1/초)
  ARRIVE: 0.06,                                  // 다 왔다고 보는 거리(몸 크기 1일 때)
  SLOW: 0.45,                                    // 이 거리 안에서는 느려진다(몸 크기 1일 때)
  FADE: 9,                                       // 동작이 섞이는 빠르기(1/초 — 클수록 빨리 바뀐다)
  SIZE_K: 110, SIZE_C: 9, SIZE_JELLY: 0.10,      // 크기 용수철: 세기 · 잦아듦 · 커지고 작아질 때 길쭉 · 납작해지는 정도
  ANT_K: 70, ANT_C: 5.5, ANT_PUSH: 260,          // 더듬이 용수철: 세기 · 잦아듦 · 몸이 움직일 때 밀리는 정도
  FACE: 13, LOOK: 12,                            // 표정 · 눈길이 따라가는 빠르기(1/초)
  HEAD_SHARE: 0.5, HEAD_MAX: 42,                 // 눈길 가운데 머리가 맡는 몫 · 머리가 돌아가는 끝(도)
  BLINK_EVERY: [2.2, 5.2], BLINK_TIME: 0.17,     // 눈 깜박임 사이(초) · 한 번에 걸리는 시간
  LOOK_AFTER: [5, 9],                            // 가만히 두면 두리번거리기까지(초)
  POSE: 10,                                      // 덧자세(손 내려다보기 · 허둥대기 · 찔러 보기 · 비틀거림)가 들고 나는 빠르기(1/초)
};
const MOUTHS = ['smile', 'open', 'oh', 'wavy', 'worry'];
const BODY = /^(hips|belly|head|arm_|fore_|hand_|leg_|foot_)/;   // 클립이 다루는 뼈(나머지는 코드가 맡는다)
const D = Math.PI / 180, AXES = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
const VER = 3;

// ───────────────────────── 모형 + 얼굴 ─────────────────────────
export async function loadGogo(url = new URL(`./assets/gogo.glb?v=${VER}`, import.meta.url).href) {
  const gltf = await new GLTFLoader().loadAsync(url), root = gltf.scene, bones = {}, rest = {}, meshes = {};
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (o.isBone) bones[o.name] = o;
    if (o.isMesh) { meshes[o.name] = o; o.castShadow = true; o.frustumCulled = false; }   // 뼈로 크기가 바뀌므로 화면 밖 판정을 끈다
  });
  for (const [name, b] of Object.entries(bones)) {
    const inv = b.getWorldQuaternion(new THREE.Quaternion()).invert(), ax = {};
    for (const k in AXES) ax[k] = AXES[k].clone().applyQuaternion(inv);
    rest[name] = { q: b.quaternion.clone(), s: b.scale.clone(), p: b.position.clone(), ax };
  }
  const mouth = Object.values(meshes).find(m => m.morphTargetDictionary), q = new THREE.Quaternion(), q2 = new THREE.Quaternion();
  /** 뼈를 쉬는 자세에서 x·y·z 축(고고 기준)으로 돌린다(도). */
  function turn(name, x = 0, y = 0, z = 0) {
    const b = bones[name], r = rest[name]; q.copy(r.q);
    if (y) q.multiply(q2.setFromAxisAngle(r.ax.y, y * D));
    if (x) q.multiply(q2.setFromAxisAngle(r.ax.x, x * D));
    if (z) q.multiply(q2.setFromAxisAngle(r.ax.z, z * D));
    b.quaternion.copy(q); return b;
  }
  /** 클립이 잡아 놓은 자세 위에 덧돌린다. 덧돌린 것은 다음 장면 앞에 unnudge() 로 되돌려야 한다
   *  (클립은 값이 바뀐 뼈만 다시 쓰기 때문에, 되돌리지 않으면 가만히 있는 뼈에 장면마다 덧쌓인다). */
  const kept = new Map();
  function unnudge() { for (const [b, k] of kept) if (k.on) { b.quaternion.copy(k.q); k.on = false; } }
  function nudge(name, x = 0, y = 0, z = 0) {
    const b = bones[name], r = rest[name]; let k = kept.get(b); if (!k) kept.set(b, k = { q: new THREE.Quaternion(), on: false });
    if (!k.on) { k.q.copy(b.quaternion); k.on = true; }
    if (y) b.quaternion.multiply(q2.setFromAxisAngle(r.ax.y, y * D));
    if (x) b.quaternion.multiply(q2.setFromAxisAngle(r.ax.x, x * D));
    if (z) b.quaternion.multiply(q2.setFromAxisAngle(r.ax.z, z * D));
  }
  const size = (name, x, y = x, z = x) => { const r = rest[name]; bones[name].scale.set(r.s.x * x, r.s.y * y, r.s.z * z); };
  const face = { ...FACE.idle, mouth: {}, look: new THREE.Vector2(), spin: 0 };
  /** 얼굴 값을 그대로 입힌다. f = FACE 의 한 줄과 같은 모양 + look{x,y}(-1~1) + spin(도) */
  function setFace(f) {
    Object.assign(face, f);
    for (const n of ['L', 'R']) {
      size('eye_' + n, face.eye);
      turn('lidU_' + n, face.lidU); turn('lidD_' + n, -face.lidD);
      const p = Math.max(face.pupil, 0.001), sink = face.pupil < 0.25 ? 0.3 : 1;        // 눈동자를 숨길 때는 흰자 속으로
      turn('pupil_' + n, -face.look.y * GAZE.PITCH, face.look.x * GAZE.YAW + (n === 'L' ? -1 : 1) * (GAZE.IN + GAZE.IN_SMALL * Math.max(0, 1 - face.pupil))); size('pupil_' + n, p * sink, sink, p * sink);
      turn('swirl_' + n, 0, 0, (n === 'L' ? 1 : -1) * face.spin); size('swirl_' + n, 0.9 + 1.32 * face.swirl);
    }
    if (mouth) for (const k of MOUTHS) mouth.morphTargetInfluences[mouth.morphTargetDictionary[k]] = (face.mouth && face.mouth[k]) || 0;
  }
  /** 모든 뼈를 쉬는 자세로. */
  function resetPose() { for (const [n, b] of Object.entries(bones)) { const r = rest[n]; b.quaternion.copy(r.q); b.scale.copy(r.s); b.position.copy(r.p); } }
  setFace(FACE.idle);
  return { root, bones, rest, meshes, mouth, animations: gltf.animations, turn, nudge, unnudge, size, setFace, resetPose, face };
}

// ───────────────────────── 움직임 ─────────────────────────
const clamp = (x, a, b) => Math.min(b, Math.max(a, x)), wrap = a => Math.atan2(Math.sin(a), Math.cos(a)), toward = (k, dt) => 1 - Math.exp(-k * dt);
const rnd = ([a, b]) => a + Math.random() * (b - a);

/** 고고를 장면에 세운다. 돌려주는 것의 update(dt) 를 매 장면 부른다. */
export async function createGogo(scene) {
  const g = await loadGogo(), info = await (await fetch(new URL(`./assets/gogo_clips.json?v=${VER}`, import.meta.url))).json();
  scene.add(g.root);
  const mixer = new THREE.AnimationMixer(g.root), acts = {}, w = {};
  for (const clip of g.animations) {
    clip.tracks = clip.tracks.filter(t => BODY.test(t.name));
    const a = mixer.clipAction(clip), loop = info[clip.name].loop; acts[clip.name] = a; w[clip.name] = 0;
    a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce); a.clampWhenFinished = !loop; a.setEffectiveWeight(0); if (loop) a.play();
  }
  w.idle = 1;
  const S = {
    pos: new THREE.Vector3(), heading: 0, v: 0, target: null, faceTo: null,          // 자리 · 보는 쪽(0 = +z) · 지금 빠르기 · 갈 곳 · 돌아설 쪽
    size: 1, sizeTo: 1, sizeV: 0,                                                      // 몸 크기(용수철)
    act: null,                                                                         // 하고 있는 한 번짜리 동작 { name, t, dur, lock }
    mood: 'idle', moodFor: 0, f: { ...FACE.idle, mouth: {} }, spin: 0,                 // 표정
    lookAt: null, yaw: 0, pitch: 0,                                                    // 눈길
    blinkIn: rnd(MOVE.BLINK_EVERY), blink: 0, idle: 0, lookIn: rnd(MOVE.LOOK_AFTER),
    ant: { L: [0, 0, 0, 0], R: [0, 0, 0, 0], T: [0, 0, 0, 0] }, hp: new THREE.Vector3(), hv: new THREE.Vector3(), first: true,
    gaitPhase: 0, moving: false, y: 0, busy: false, clock: 0,                          // y = 바닥에서 뜬 높이 · busy = 놀이가 시키는 일을 하는 중(혼자 두리번거리지 않는다)
    over: { hands: 0, fluster: 0, poke: 0, sway: 0 }, ov: { hands: 0, fluster: 0, poke: 0, sway: 0 },   // 덧자세: 바라는 값 · 지금 값
  }, on = { step: [], arrive: [], actEnd: [] }, tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const gait = () => S.size < MOVE.SMALL ? 'scurry' : S.size > MOVE.BIG ? 'heavy' : 'walk';
  const emit = (k, ...a) => on[k].forEach(f => f(...a));

  /** 한 번짜리 동작(surprise · jump · fall · look · peek). lock = 끝날 때까지 걸음을 미룬다(넘어짐). */
  function act(name, { lock = false, mood = null, hold = 0 } = {}) {
    const a = acts[name]; if (!a) return;
    a.reset(); a.time = 0; a.setEffectiveWeight(w[name]); a.play();
    S.act = { name, t: 0, dur: info[name].dur + hold, lock, loop: info[name].loop }; S.idle = 0;
    if (mood) setMood(mood, info[name].dur + hold);
  }
  function setMood(name, secs = 0) { S.mood = name; S.moodFor = secs; }
  const api = {
    ...g, info, acts, mixer, weights: w, state: S, gait, act, setMood,
    on: (k, f) => on[k].push(f),
    /** 그 자리로 걸어간다(돌아서고 → 걷는다). 넘어져 있는 동안에는 일어난 뒤에 간다. */
    goTo(x, z) { S.target = new THREE.Vector3(x, 0, z); S.faceTo = null; S.idle = 0; if (S.act && !S.act.lock) S.act = null; },
    stop() { S.target = null; },
    /** 제자리에서 돌아선다(도 — 왼쪽이 +). */
    turnBy(deg) { S.faceTo = wrap((S.faceTo ?? S.heading) + deg * D); S.target = null; S.idle = 0; if (S.act && !S.act.lock) S.act = null; },
    setSize(s) { S.sizeTo = s; S.idle = 0; },
    /** 바라볼 곳(세계 좌표). null 이면 앞을 본다. */
    lookAt(v) { S.lookAt = v ? (S.lookAt || new THREE.Vector3()).copy(v) : null; },
    place(x, z, heading = S.heading) { S.pos.set(x, 0, z); S.heading = heading; },
    /** 덧자세를 켜고 끈다(0~1): hands 제 손 내려다보기 · fluster 허둥대기 · poke 찔러 보기 · sway 비틀거림. 클립 위에 얹힌다. */
    pose(name, v) { S.over[name] = v; },
    update,
  };

  function update(dt) {
    dt = Math.min(dt, 0.05); if (dt <= 0) return;
    // 1) 크기 — 용수철로 따라가고, 바뀌는 동안은 길쭉 · 납작하게 출렁인다
    S.sizeV += (MOVE.SIZE_K * (S.sizeTo - S.size) - MOVE.SIZE_C * S.sizeV) * dt; S.size = Math.max(0.05, S.size + S.sizeV * dt);
    const jelly = clamp(S.sizeV / Math.max(S.size, 0.2) * MOVE.SIZE_JELLY, -0.22, 0.22);
    g.root.scale.set(S.size * (1 - jelly * 0.5), S.size * (1 + jelly), S.size * (1 - jelly * 0.5));

    // 2) 한 번짜리 동작의 때
    if (S.act) { S.act.t += dt; if (!S.act.loop && S.act.t >= S.act.dur - 0.12) { const n = S.act.name; S.act = null; emit('actEnd', n); } }
    const locked = S.act && S.act.lock;

    // 3) 걸음: 돌아서기 → 나아가기. 걸음 클립의 배속을 실제 빠르기에 맞춘다(발이 미끄러지지 않게)
    const gn = gait(), gi = info[gn], vmax = gi.stride / gi.dur * S.size; let vWant = 0, turning = false, want = null, dist = 0;
    if (!locked) {
      if (S.target) {
        tmp.subVectors(S.target, S.pos); tmp.y = 0; dist = tmp.length();
        if (dist < MOVE.ARRIVE * S.size) { S.target = null; emit('arrive'); } else want = Math.atan2(tmp.x, tmp.z);
      } else if (S.faceTo !== null) { want = S.faceTo; if (Math.abs(wrap(want - S.heading)) < 1.5 * D) { S.faceTo = null; want = null; } }
      if (want !== null) {
        const err = wrap(want - S.heading), step = MOVE.TURN[gn] * D * dt; S.heading = wrap(S.heading + clamp(err, -step, step));
        turning = Math.abs(err) > 4 * D;
        if (S.target) vWant = (Math.abs(err) < MOVE.TURN_FIRST * D ? Math.cos(err) ** 2 : 0) * vmax * clamp(dist / (MOVE.SLOW * S.size) + 0.3, 0, 1)
          * (1 + (MOVE.HURRY[gn] - 1) * clamp((dist / S.size - MOVE.HURRY_FROM) / (MOVE.HURRY_FULL - MOVE.HURRY_FROM), 0, 1));
      }
    }
    S.v += (vWant - S.v) * toward(MOVE.ACCEL, dt); if (vWant === 0 && S.v < vmax * 0.02) S.v = 0;
    if (S.v > 0) { const d = Math.min(S.v * dt, S.target ? dist : S.v * dt); S.pos.x += Math.sin(S.heading) * d; S.pos.z += Math.cos(S.heading) * d; }
    S.moving = S.v > 0 || turning;
    const rate = S.v / vmax, stepping = turning && rate < MOVE.TURN_STEP;
    for (const n of ['walk', 'heavy', 'scurry']) acts[n].timeScale = n === gn ? (stepping ? MOVE.TURN_STEP : rate) : 1;
    const ga = acts[gn], ph = (ga.time / gi.dur) % 1;                                        // 발이 닿는 때를 알린다(쿵쿵 소리 · 흔들림은 듣는 쪽이)
    if (w[gn] > 0.5 && ((S.gaitPhase < 0.5 && ph >= 0.5) || (S.gaitPhase > 0.5 && ph < 0.5))) emit('step', ph < 0.5 ? 'L' : 'R', gn);
    S.gaitPhase = ph;
    g.root.position.copy(S.pos); g.root.position.y = S.y; g.root.rotation.y = S.heading;

    // 4) 동작 섞기: 저마다 바라는 무게로 부드럽게 옮기고 합이 1 이 되게 한다
    const go = S.moving ? (stepping ? 1 : clamp(rate / 0.3, 0, 1)) : 0, k = toward(MOVE.FADE, dt); let sum = 0;
    for (const n in w) {
      let to = 0;
      if (S.act) to = n === S.act.name ? 1 : 0; else if (n === gn) to = go; else if (n === 'idle') to = 1 - go;
      w[n] += (to - w[n]) * k; if (w[n] < 0.001 && to === 0) w[n] = 0; sum += w[n];
    }
    for (const n in w) acts[n].setEffectiveWeight(sum > 0 ? w[n] / sum : 0);
    g.unnudge(); mixer.update(dt);
    S.clock += dt; const ko = toward(MOVE.POSE, dt), o = S.ov; for (const n in o) o[n] += (S.over[n] - o[n]) * ko;
    if (o.hands > 0.01) {                                                                    // 제 손을 내려다본다: 두 팔을 앞으로 모으고 고개를 숙인다
      for (const [n, sd] of [['L', 1], ['R', -1]]) { g.nudge('arm_' + n, -12 * o.hands, -sd * 60 * o.hands, sd * 12 * o.hands); g.nudge('fore_' + n, -38 * o.hands, -sd * 30 * o.hands); }
      g.nudge('head', 4 * o.hands); g.nudge('belly', 3 * o.hands);
    }
    if (o.fluster > 0.01) {                                                                  // 허둥댄다: 두 팔을 번갈아 휘젓고 몸을 좌우로 튼다
      const a = Math.sin(S.clock * 24), b = Math.sin(S.clock * 13);
      g.nudge('arm_L', 0, 0, (56 + 28 * a) * o.fluster); g.nudge('arm_R', 0, 0, -(56 - 28 * a) * o.fluster); g.nudge('belly', 0, 11 * b * o.fluster, 4 * a * o.fluster); g.nudge('head', 0, -9 * b * o.fluster);
    }
    if (o.poke > 0.01) { g.nudge('arm_R', -80 * o.poke, 0, -4 * o.poke); g.nudge('fore_R', 12 * o.poke); g.nudge('belly', 7 * o.poke, 9 * o.poke); }   // 오른손을 뻗어 찔러 본다
    if (o.sway > 0.01) { const a = Math.sin(S.clock * 3.1), b = Math.cos(S.clock * 2.3); g.nudge('hips', 4 * b * o.sway, 0, 9 * a * o.sway); g.nudge('head', 0, 0, -7 * a * o.sway); }   // 비틀거린다

    // 5) 가만히 있으면 혼자 두리번거린다
    if (!S.moving && !S.act && !S.target && !S.busy) { S.idle += dt; if (S.idle > S.lookIn) { act('look'); S.lookIn = rnd(MOVE.LOOK_AFTER); } } else if (S.moving) S.idle = 0;

    // 6) 눈길: 눈동자가 먼저 가고 머리가 얼마쯤 따라간다
    let yawTo = 0, pitchTo = 0;
    if (S.lookAt && !(S.act && (S.act.name === 'fall' || S.act.name === 'look'))) {
      tmp.copy(S.lookAt); g.root.worldToLocal(tmp); const flat = Math.hypot(tmp.x, tmp.z);
      if (flat > 0.25 || Math.abs(tmp.y - 0.78) > 0.25) { yawTo = clamp(Math.atan2(tmp.x, tmp.z) / D, -95, 95); pitchTo = clamp(Math.atan2(tmp.y - 0.78, flat) / D, -50, 50); }
    }
    const kl = toward(MOVE.LOOK, dt); S.yaw += (yawTo - S.yaw) * kl; S.pitch += (pitchTo - S.pitch) * kl;
    const hy = clamp(S.yaw * MOVE.HEAD_SHARE, -MOVE.HEAD_MAX, MOVE.HEAD_MAX), hp = clamp(S.pitch * MOVE.HEAD_SHARE, -20, 20);
    g.nudge('head', -hp, hy * 0.75); g.nudge('belly', 0, hy * 0.25);
    const look = new THREE.Vector2(clamp((S.yaw - hy) / GAZE.YAW, -1, 1), clamp((S.pitch - hp) / GAZE.PITCH, -1, 1));

    // 7) 표정: 값마다 부드럽게 옮기고, 눈 깜박임을 얹는다
    if (S.moodFor > 0) { S.moodFor -= dt; if (S.moodFor <= 0) S.mood = 'idle'; }
    const to = FACE[S.mood] || FACE.idle, kf = toward(MOVE.FACE, dt), f = S.f;
    for (const key of ['eye', 'lidU', 'lidD', 'pupil', 'swirl']) f[key] += (to[key] - f[key]) * kf;
    for (const m of MOUTHS) f.mouth[m] = (f.mouth[m] || 0) + (((to.mouth && to.mouth[m]) || 0) - (f.mouth[m] || 0)) * kf;
    S.spin = (S.spin + (f.swirl > 0.05 ? 420 * dt : 0)) % 360;
    S.blinkIn -= dt; if (S.blinkIn <= 0 && S.blink <= 0) { S.blink = MOVE.BLINK_TIME; S.blinkIn = rnd(MOVE.BLINK_EVERY); }
    let shut = 0; if (S.blink > 0) { S.blink -= dt; shut = f.swirl > 0.3 ? 0 : Math.sin(Math.PI * clamp(1 - S.blink / MOVE.BLINK_TIME, 0, 1)); }
    g.setFace({ eye: f.eye, pupil: f.pupil, swirl: f.swirl, mouth: f.mouth, look, spin: S.spin,
      lidU: f.lidU + (BLINK.lidU - f.lidU) * shut, lidD: f.lidD + (Math.max(BLINK.lidD, f.lidD) - f.lidD) * shut });

    // 8) 더듬이 · 꼬리: 머리가 움직이는 대로 뒤늦게 따라와 출렁인다
    g.root.updateMatrixWorld(true); g.bones.head.getWorldPosition(tmp);
    if (S.first) { S.hp.copy(tmp); S.first = false; }
    tmp2.subVectors(tmp, S.hp).divideScalar(dt * Math.max(S.size, 0.2)); S.hp.copy(tmp);            // 머리 빠르기(몸 크기로 나눔)
    const acc = tmp.subVectors(tmp2, S.hv).divideScalar(dt); S.hv.copy(tmp2);                         // 머리가 받는 힘
    const ca = Math.cos(-S.heading), sa = Math.sin(-S.heading), ax = clamp(acc.x * ca + acc.z * sa, -40, 40), az = clamp(-acc.x * sa + acc.z * ca, -40, 40), ay = clamp(acc.y, -40, 40);
    for (const n of ['L', 'R', 'T']) {
      const a = S.ant[n], out = n === 'L' ? -1 : n === 'R' ? 1 : 0, push = MOVE.ANT_PUSH * dt * D;
      a[2] += (-MOVE.ANT_K * a[0] - MOVE.ANT_C * a[2]) * dt - az * push; a[3] += (-MOVE.ANT_K * a[1] - MOVE.ANT_C * a[3]) * dt + (ax + out * ay * 0.6) * push;
      a[0] = clamp(a[0] + a[2] * dt, -1.1, 1.1); a[1] = clamp(a[1] + a[3] * dt, -1.1, 1.1);
      if (n === 'T') g.turn('tail', a[0] / D * 0.7, a[1] / D * 0.9);
      else { g.turn('ant1_' + n, a[0] / D * 0.55, 0, a[1] / D * 0.55); g.turn('ant2_' + n, a[0] / D * 0.9, 0, a[1] / D * 0.9); }
    }
  }
  update(1 / 60);
  return api;
}
