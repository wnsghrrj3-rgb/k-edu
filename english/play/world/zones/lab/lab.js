/* 마법 연구소 — 한 방, 네 자리(연구소 설계 v1 · 묶음 3-0 껍데기). 주인공은 몬스터 고고.
 * 이 파일은 껍데기다: 무대 · 방 · 물건 넷 · 고고 · 입력 · 자리 옮기기 · 부탁 · 배경 소리를 묶는 일만 한다. 놀이는 자리 파일(stations/)이 맡는다.
 *   ① size 커졌다 작아졌다(Big · Small) · ② float 둥둥 띄우기(Up · Down) · ③ potion 무지개 물약(Red · Blue · Yellow · Pink · Mix) · ④ frost 얼음과 불(Hot · Cold) — 자리마다 stations/<id>.js.
 *   ②③④의 파일과 모형은 그 자리에 처음 갈 때 받는다(빈 자리의 load). 물든 색과 온도의 겉(engine/skin_color.js · skin_temp.js)은 어느 자리에서나 보인다.
 * 자리를 바꾸면 페이지가 바뀌는 것이 아니라 방이 변신한다(engine/station.js). 물건과 고고는 크기 · 색 · 온도를 지닌 채 남는다.
 * 낱말 · 부탁 · 자리의 빛과 구도는 자료(data/lab.js ← 핸드오프 lab_v1.js)에서만 읽는다. 정답 · 점수 · 시간제한 · 설명 글 없음.
 * 확인용 주소: ?mute 소리 끔 · ?auto=명령,…  → 끝나면 제목에 상태를 적는다.
 *   공통 명령: go:자리 · set:물건:상태:값 · ask:번호(그 자리의 부탁을 바로) · touch:물건 · walk:x:z · step:초   /   자리 ①: lock:이름 · drag:크기 · release · tap:x:z */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStage, AUTO, clamp, rand } from '../../engine/stage.js?v=2';
import { sfx, chirp, tone, hiss, unlock, setMuted, isMuted, createBed } from '../../engine/sound.js?v=2';
import { createVoice } from '../../engine/voice.js?v=2';
import { createSparks } from '../../engine/fx.js?v=2';
import { createBrain } from '../../engine/brain.js?v=2';
import { createThing, stepThing, topOf, pickAt, actorTarget } from '../../engine/things.js?v=2';
import { createLearn } from '../../engine/learn.js?v=2';
import { runAuto } from '../../engine/auto.js?v=2';
import { createActor } from '../../engine/actor.js?v=2';
import { createAsk } from '../../engine/ask.js?v=3';
import { createStations } from '../../engine/station.js?v=2';
import { createColorSkin } from '../../engine/skin_color.js?v=1';
import { createTempSkin } from '../../engine/skin_temp.js?v=1';
import { LAB } from '../../data/lab.js?v=1';
import { createSize, T as SIZE_T } from './stations/size.js?v=1';

// ───────────────────────── 수치(방과 껍데기의 것 — 놀이의 수치는 자리 파일에) ─────────────────────────
const T = {
  BENCH: { X: 3.35, Z0: -0.95, Z1: 1.0, EDGE: 3.7 },   // 고고가 다니는 범위 · 실험대 끝
  CAM: { AIM: [0, 1.15, 0], TILT: 17, FOV: 30, HALF_W: 4.05, MIN_DIST: 8.4 },
  START: 'size',                                        // 마을에서 들어오면 언제나 ①에서 시작한다
  TEMP_BACK: LAB.thingState.temp.back,                  // 가만두면 미지근한 쪽으로 돌아가는 빠르기(1/초)
};
const R0 = { apple: [0.32, 0.6], cup: [0.385, 0.62], chair: [0.36, 0.95], ball: [0.27, 0.54] }, ST = LAB.stations, word = k => LAB.words[k].text;
// 도구 그림 넷(글 없음): 지팡이 · 방울 · 냄비 · 눈송이와 불꽃
const PICT = {
  size: '<svg viewBox="0 0 48 48"><path d="M13 39 30 20" stroke="#7a4a25" stroke-width="5" stroke-linecap="round"/><path d="m33 5 3.2 6.6 7.3 1-5.3 5.1 1.3 7.3L33 21.6 26.5 25l1.3-7.3-5.3-5.1 7.3-1z" fill="#ffd766" stroke="#b97c1e" stroke-width="2" stroke-linejoin="round"/></svg>',
  float: '<svg viewBox="0 0 48 48"><circle cx="24" cy="23" r="15" fill="#dff3ff" fill-opacity=".75" stroke="#6fb3d9" stroke-width="3"/><path d="M15 19c1.5-5 5-7.5 9-8" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><circle cx="38" cy="39" r="4" fill="#dff3ff" stroke="#6fb3d9" stroke-width="2.4"/></svg>',
  potion: '<svg viewBox="0 0 48 48"><circle cx="17" cy="9" r="3.4" fill="#c9a8ff"/><circle cx="28" cy="6" r="2.4" fill="#ffb0cf"/><circle cx="33" cy="13" r="2.8" fill="#9cd8ff"/><path d="M8 20h32c0 14-6 22-16 22S8 34 8 20z" fill="#5b4a7a" stroke="#3b2d57" stroke-width="2.6" stroke-linejoin="round"/><ellipse cx="24" cy="20" rx="16.5" ry="4.6" fill="#b58cf0" stroke="#3b2d57" stroke-width="2.6"/></svg>',
  frost: '<svg viewBox="0 0 48 48"><g stroke="#4e9be8" stroke-width="3.2" stroke-linecap="round"><path d="M14 8v24M3.6 14l20.8 12M3.6 26l20.8-12"/></g><path d="M35 44c-6 0-9.5-4-9.5-9 0-6 5-8 6-15 5 3.5 4.5 7.5 6.5 9.5 1-1.5 1.4-2.8 1.4-4.5 3.4 3.3 5.1 6.6 5.1 10 0 5-3.5 9-9.5 9z" fill="#ff9a4a" stroke="#d9601e" stroke-width="2.4" stroke-linejoin="round"/><path d="M35 41c-2.6 0-4.2-1.8-4.2-4 0-2.8 2.4-3.8 3.2-6.6 3.2 2.4 5.2 4.4 5.2 6.8 0 2.2-1.6 3.8-4.2 3.8z" fill="#ffe27a"/></svg>',
};

// ───────────────────────── 무대 · 방 · 물건 · 고고 ─────────────────────────
const canvas = document.getElementById('c'), sndEl = document.getElementById('snd'); if (AUTO) document.body.classList.add('auto');
const stage = createStage({ canvas, sky: ST.size.look.sky, cam: T.CAM }), { scene, camera } = stage;
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshStandardMaterial({ color: ST.size.look.wall, roughness: 1 })); wall.position.set(0, 3, -1.76); wall.receiveShadow = true; scene.add(wall);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 12).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#a996cf', roughness: 1 })); ground.position.set(0, -2.5, 2); ground.receiveShadow = true; scene.add(ground);
const lab = await new GLTFLoader().loadAsync(new URL('../../assets/lab.glb?v=1', import.meta.url).href), part = {};
lab.scene.traverse(o => { if (o.isMesh) { part[o.name] = o; o.castShadow = o.name !== 'room'; o.receiveShadow = true; } });
scene.add(part.room);
const gogo = await createActor(scene, { model: 'gogo' }), s = gogo.state;
gogo.root.traverse(o => { if (o.isMesh) o.receiveShadow = !o.name.startsWith('GogoEyes'); });
gogo.place(SIZE_T.HOME[0], SIZE_T.HOME[1], 0); gogo.lookAt(camera.position);
const fx = createSparks(scene), v3 = new THREE.Vector3(), vWord = new THREE.Vector3(), seen = new Set();
let here = T.START;                                                                    // 지금 자리(자리를 옮기면 onGo 가 바꾼다)
const learns = {}, learnAt = () => learns[ST[here].cell] || (learns[ST[here].cell] = createLearn({ zone: LAB.zone, cell: ST[here].cell }));
const learn = { note: (w, o) => learnAt().note(w, o), count: w => Object.values(learns).reduce((n, l) => n + l.count(w), 0), get log() { return Object.values(learns).flatMap(l => l.log); } };   // 낱말은 그것을 만난 자리(활동 번호)에 적는다
const voice = createVoice({ el: document.getElementById('word'), screenOf: stage.screenOf, onSaid: (w, who, isName) => learn.note(w, { skill: isName ? 'listen' : 'move', input: 'drag', game: here === 'size' ? 'big-small' : 'lab-' + here }) });
const things = {};
for (const n of ['chair', 'apple', 'cup', 'ball']) { const [x, z] = SIZE_T.PLACE[n]; things[n] = Object.assign(createThing(scene, part[n], { name: n, x, z, r: R0[n][0], h: R0[n][1], ball: n === 'ball', state: n === 'cup' ? 'up' : 'home' }), { big: false, small: false }); things[n].onBounce = v => sfx.bounce(v / 6); }
const GOGO = actorTarget(gogo, 'gogo'), targets = [GOGO, ...Object.values(things)], by = n => n === 'gogo' ? GOGO : things[n];
const voiceK = () => s.size ** -0.9, say = kind => chirp(kind, voiceK());      // 고고의 목소리: 클수록 낮다
const brain = createBrain(gogo, { bounds: T.BENCH, onEnd: () => { const W = size.W; if (!W.lock && W.state !== 'held') gogo.lookAt(camera.position); }, onLand: () => sfx.thud(s.size * 0.6) });
const B = brain.B, { run, until } = brain; B.where = 'bench';
const name = t => voice.word(word(t.name), () => topOf(t, vWord), { name: true, by: t.name });
const benchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), P = { down: false, x: 0, y: 0, mode: null };

// ───────────────────────── 자리 ─────────────────────────
const C = { stage, scene, camera, part, gogo, brain, things, GOGO, targets, fx, voice, seen, P, BENCH: T.BENCH, LAB, name, say, benchPlane, toBench: async () => {}, tapBench, ask: null, wall, learn, by, R0, voiceK, touch: t => touch(t), moving: () => stations.moving, now: () => here };
/** 빈 실험대를 누르면 고고가 그리로 걸어간다(어느 자리에서나). */
function tapBench(x, z) {
  x = clamp(x, -T.BENCH.X, T.BENCH.X); z = clamp(z, T.BENCH.Z0, T.BENCH.Z1); B.idle = 0;
  for (const t of Object.values(things)) { const d = Math.hypot(x - t.x, z - t.z), need = t.r * t.size + 0.3 * s.size; if (d < need) z = Math.min(T.BENCH.Z1, t.z + need); }    // 물건 속을 누르면 그 앞으로
  run(async tok => { await C.toBench(tok); gogo.lookAt(v3.set(x, 0, z)); gogo.goTo(x, z); await until(tok, () => !s.target, 12); });
}
/** 만지면 이름이 나오고 까딱인다. */
function touch(t) { name(t); sfx.tick(); B.idle = 0; if (t === GOGO) { if (!brain.busy) { gogo.act('jump', { mood: 'joy' }); say('joy'); } } else { t.tvx += rand(-1, 1) * 3; t.tvz += (Math.random() < 0.5 ? -1 : 1) * 4; if (t.y === 0 && (t.state === 'home' || t.state === 'up')) { t.vy = 1.4; t.y = 0.001; } } }
/** 아직 놀이가 없는 자리(②③④): 방의 빛과 구도만 바뀐다. 물건을 만지면 이름이 나오고 까딱이며, 빈 곳을 누르면 고고가 걸어간다. */
function emptyStation(id) {
  const d = ST[id], place = d.T && d.T.PLACE ? Object.fromEntries(Object.entries(d.T.PLACE).filter(([k]) => by(k))) : { ...size.place };
  return { id, title: d.title, asks: [], place, busy: () => true, mime() {}, summary: () => ({}), auto: {},
    /** 처음 갈 때 그 자리의 파일(stations/<id>.js — create(C) 가 모형까지 받아 자리를 돌려준다)을 받아 이 빈 자리에 끼운다. 파일이 없으면 빈 자리로 남는다. */
    async load() { try { const m = await import(`./stations/${id}.js?v=1`), st = await m.create(C); Object.assign(all[id], st, { id }); adapt(all[id]); } catch (e) { console.error('자리를 받지 못함: ' + id, e); brain.errors.push('load ' + id + ': ' + (e && e.message || e)); } },
    step(dt) {
      for (const t of Object.values(things)) { t.lit = false; stepThing(t, dt); }
      size.perch();
      if (B.where === 'bench' && !B.hop) for (const t of Object.values(things)) {                       // 물건을 비켜 간다
        if (t.y > 0.3 || t.state === 'fall') continue; const dx = s.pos.x - t.x, dz = s.pos.z - t.z, dd = Math.hypot(dx, dz) || 0.001, need = 0.3 * s.size + t.r * t.size * 0.85;
        if (dd < need) { if (t.ball) t.vx -= dx / dd * 3 * dt * 8; s.pos.x += dx / dd * (need - dd); s.pos.z = clamp(s.pos.z + dz / dd * (need - dd), T.BENCH.Z0, T.BENCH.Z1); }
      }
    },
    onDown(e) { const t = pickAt(stage, targets, e.clientX, e.clientY); if (t) touch(t); else if (stage.worldOn(benchPlane, e.clientX, e.clientY, v3)) tapBench(v3.x, v3.z); }, onMove() {}, onUp() {},
  };
}
const colorSkin = createColorSkin(C), tempSkin = createTempSkin(C);                                                  // 물든 색을 겉에 입힌다(어느 자리에서나 보인다)
const size = createSize(C), all = { size };
for (const id of ['float', 'potion', 'frost']) all[id] = emptyStation(id);
const stations = createStations({
  stage, wall, stations: all, first: T.START, things: Object.values(things), tray: document.getElementById('tray'), pictures: PICT, sfx,
  looks: Object.fromEntries(Object.keys(all).map(id => [id, ST[id].look])), cams: Object.fromEntries(Object.keys(all).map(id => [id, ST[id].cam])),
  walk: (x, z) => { run(async tok => { await C.toBench(tok); await brain.walk(tok, x, z); await brain.face(tok, 0); gogo.lookAt(camera.position); }); },
  onGo: id => { here = id; bed.set(id); ask.touch(); },
});

// ───────────────────────── 부탁 · 배경 소리 ─────────────────────────
/** 생각 방울에 넣을 작은 모형: 물건은 그 모형을 제 색으로, 고고는 동글한 얼굴로. 상태(크기 · 색 · 온도)는 보여 주지 않는다 — 어떻게는 귀로 알아들어야 한다. */
function mini(n) {
  if (n !== 'gogo') { const m = things[n].mesh.clone(); m.material = part[n].material; m.geometry = colorSkin.plain(n) || m.geometry; m.castShadow = m.receiveShadow = false; m.position.set(0, 0, 0); m.rotation.set(0, 0.4, 0); return m; }
  const g = new THREE.Group(), mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }), ball = (r, c, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), mat(c)); m.position.set(x, y, z); g.add(m); return m; };
  ball(0.5, '#8fd68a', 0, 0, 0).scale.set(1, 1.08, 0.9); ball(0.3, '#f4efdc', 0, -0.2, 0.3).scale.set(1, 0.9, 0.5);
  for (const sx of [-1, 1]) { ball(0.17, '#ffffff', sx * 0.2, 0.12, 0.38); ball(0.085, '#2a1a3a', sx * 0.2, 0.12, 0.52); ball(0.07, '#f1e7a8', sx * 0.3, 0.86, 0); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.36), mat('#6fbf6a')); a.position.set(sx * 0.25, 0.66, 0); a.rotation.z = -sx * 0.25; g.add(a); }
  return g;
}
function adapt(st) { const own = st.mini; Object.assign(st, { moving: () => stations.moving, mini: n => (own && own(n)) || (by(n) ? mini(n) : null),
  read: st.read || ((n, k) => { const t = by(n); return !t ? undefined : k === 'size' ? t.size : t[k]; }),
  top: st.top || ((n, out) => by(n) ? topOf(by(n), out) : out.set(s.pos.x, 1.2, s.pos.z)),
  wiggle: st.wiggle || (n => { const t = things[n]; if (t) { t.tvx += rand(-1, 1) * 3; t.tvz += (Math.random() < 0.5 ? -1 : 1) * 6; if (t.y === 0) { t.vy = 1.6; t.y = 0.001; } } else if (n === 'gogo' && !brain.busy) gogo.setMood('wow', 0.8); }) }); }
for (const id in all) adapt(all[id]);
const ask = createAsk({ scene, stage, actor: gogo, brain, voice, learn, cfg: LAB.ask, words: LAB.words, states: LAB.thingState, muted: isMuted, holding: () => P.down, voiceK });
C.ask = ask;
// 배경 소리(임시 · 합성): 바탕 = 느린 종 다섯 음(자리 ①은 이것뿐). 그 위에 자리마다 한 겹 — ② 높고 성긴 풍경 · ③ 낮은 보글거림과 종 · ④ 바람과 타닥타닥(왼쪽 · 오른쪽은 아직 가르지 않았다)
const bed = createBed({
  float: (dt, w, m) => { if ((m.t -= dt) <= 0) { m.t = rand(1.6, 4.2); const f = [1568, 1760, 2093, 2349, 2637][Math.floor(Math.random() * 5)]; tone(f, f * 0.995, 1.6, { g: 0.02 * w, bus: true }); if (Math.random() < 0.4) tone(f * 1.5, f * 1.49, 1.1, { g: 0.012 * w, at: 0.18, bus: true }); } },
  potion: (dt, w, m) => { if ((m.t -= dt) <= 0) { m.t = rand(0.35, 1.1); tone(rand(110, 170), rand(180, 240), 0.11, { g: 0.045 * w, bus: true }); hiss(0.12, { g: 0.02 * w, f: 320, q: 1.2, bus: true }); } if ((m.b = (m.b ?? 3) - dt) <= 0) { m.b = rand(4, 7); tone(196, 196, 2.6, { g: 0.03 * w, bus: true }); } },
  frost: (dt, w, m) => { if ((m.t -= dt) <= 0) { m.t = rand(1.8, 3.4); hiss(1.6, { g: 0.03 * w, f: rand(380, 620), q: 0.5, bus: true }); } if ((m.c = (m.c ?? 0.5) - dt) <= 0) { m.c = rand(0.12, 0.7); hiss(0.03, { g: 0.05 * w, f: rand(1800, 3200), q: 3, bus: true }); } },
});
bed.set(T.START);

// ───────────────────────── 손 ─────────────────────────
canvas.addEventListener('pointerdown', e => { P.down = true; P.x = e.clientX; P.y = e.clientY; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} unlock(); ask.touch(); stations.cur.onDown(e); });
canvas.addEventListener('pointermove', e => { P.x = e.clientX; P.y = e.clientY; if (!P.down) return; stations.cur.onMove(e); });
const up = () => { if (!P.down) return; P.down = false; stations.cur.onUp(); P.mode = null; };
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
sndEl.classList.toggle('off', isMuted()); sndEl.addEventListener('click', () => { setMuted(!isMuted()); sndEl.classList.toggle('off', isMuted()); });
document.getElementById('again').addEventListener('click', () => voice.again());

// ───────────────────────── 매 장면 ─────────────────────────
function step(dt) {
  brain.tick(dt);
  stations.cur.step(dt);
  for (const id in all) if (all[id].bg) all[id].bg(dt);
  for (const t of targets) if (t.temp) t.temp -= Math.sign(t.temp) * Math.min(Math.abs(t.temp), T.TEMP_BACK * dt);      // 온도는 아주 느리게 미지근한 쪽으로
  colorSkin.tick(dt); tempSkin.tick(dt);
  stations.tick(dt); ask.tick(dt, stations.cur); bed.tick(dt, voice.talking);
  gogo.update(dt); voice.tick(dt); fx.tick(dt);
}

// ───────────────────────── 돌리기 ─────────────────────────
const summary = () => ({ gogo: { size: +s.size.toFixed(2), x: +s.pos.x.toFixed(2), z: +s.pos.z.toFixed(2), y: +s.y.toFixed(2), where: B.where, mood: s.mood, act: s.act ? s.act.name : '', gait: gogo.gait() },
  things: Object.fromEntries(Object.values(things).map(t => [t.name, t.size.toFixed(2) + ' ' + t.state + ' x' + t.x.toFixed(1) + ' y' + t.y.toFixed(1)])), said: voice.said, seen: [...seen], ...size.summary(), learned: learn.log.length, errors: brain.errors, here: here === 'size' ? undefined : stations.cur.summary(),
  station: stations.now + (stations.moving ? '~' : ''), moves: stations.moves, look: stations.look(), state: Object.fromEntries(targets.map(t => [t.name, t.lift + ' ' + t.color + ' ' + (+t.temp).toFixed(2)])), ask: ask.summary(), recs: learn.log.filter(k => /independent|assisted/.test(k)), bed: { now: bed.now, level: +bed.level.toFixed(2), bells: bed.bells } });
window.__lab = { T, LAB, gogo, things, B, step, summary, stations, all, size, ask, bed, GOGO, camera, stage, tapBench, W: size.W, lockOn: size.lockOn, setTo: size.setTo, release: size.release, at: size.at };
const shared = {
  go: async (a, b, tick) => { stations.go(a); for (let i = 0; i < 400 && stations.loading; i++) await new Promise(r => setTimeout(r, 25)); await tick(); },
  set: (a, b, tick, c) => { const t = by(a), v = Number.isNaN(+c) ? c : +c; if (b === 'size') { t.to = v; if (t === GOGO) s.size = v; else t.size = v; } else t[b] = v; },
  ask: a => ask.force(stations.cur, +a || 0),
  touch: a => { ask.touch(); touch(by(a)); },
  walk: (a, b) => { ask.touch(); tapBench(+a, +b); },
};
if (AUTO) runAuto(stage, { step, summary, commands: new Proxy({}, { get: (_, k) => stations.cur.auto[k] || shared[k] }) }); else { stage.play(step); document.title = 'READY ' + document.title; }
