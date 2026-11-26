// K-MOTION 거꾸로 나라 달리기 — 한 판 게임
// 앞으로 계속 달린다. 모든 조작은 거꾸로: 웅크리면 커지고 · 팔을 벌리면 작아지고 · 내 오른쪽 = 캐릭터 왼쪽.
// 장애물: 작은 구멍 벽(작게) · 수정 벽(크게, 와장창) · 높은 막대(크면 머리 쿵) · 바위(줄 바꾸기 / 크면 부숨)
// 뒤에서 거꾸로 회오리가 쫓아온다: 부딪히면 다가오고, 별·성공으로 멀어진다. 잡히면 한 판 끝.
import * as THREE from 'three';
import { World, TEX, makeIsland, makeTree, makeHouse, makeWaterfall } from './world.js';
import { Hero, starGeo } from './hero.js';
import { MotionInput } from './motion.js';
import { transform, ALL_OFF } from './reverse.js';
import { UpsideAudio, say as speak } from './audio.js';
import { picto } from './picto.js';

const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const store = { get(k, d){ try { return Object.assign(d, JSON.parse(localStorage.getItem(k) || '{}')); } catch (e) { return d; } }, set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
function std(color, o){ return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .55 }, o || {})); }

// ───────── 설정(기기에 기억, 영상·얼굴 저장 없음)
const autoLow = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
const S = store.get('kmupside.run', { diff: 'easy', sens: 1, input: 'camera', mirror: true, voice: true, bgm: true, quality: autoLow ? 'low' : 'high', best: 0 });
if (Q.has('kb') || Q.has('mouse') || Q.get('input') === 'keyboard') S.input = 'keyboard';
const save = () => store.set('kmupside.run', S);

// 난이도: 처음 속도·최고 속도·장애물 간격(초)·부딪힘 1번에 회오리가 다가오는 양
const LEVEL = { easy: { v0: 7.5, vMax: 15, gap0: 3.6, gapMin: 2.1, hit: .3, heal: .018 }, normal: { v0: 9, vMax: 19, gap0: 3.0, gapMin: 1.6, hit: .34, heal: .014 }, hard: { v0: 11, vMax: 23, gap0: 2.5, gapMin: 1.25, hit: .4, heal: .01 } };
const LANE = 2.3, SIZE = { small: .45, mid: 1, big: 2.1 };

// ───────── 바탕
const world = new World($('gl'), { low: S.quality === 'low' || Q.get('q') === 'low' });
const audio = new UpsideAudio(); audio.bgmOn = S.bgm; audio.voiceOn = S.voice;
const camCanvas = document.createElement('canvas'); camCanvas.width = 480; camCanvas.height = 360;
const motion = new MotionInput({ video: $('v'), canvas: camCanvas, settings: S });
const say = t => speak(t, audio, { rate: 1.1 });
let calibrated = false;
motion.onPreview = (fr, km) => { if (!camCanvas.isConnected) return; const ctx = fr.ctx; ctx.save(); if (!S.mirror) { ctx.translate(fr.W, 0); ctx.scale(-1, 1); }
  km.drawCamera(); if (fr.pose) km.drawSkeleton(fr.pose, km.POSE_BONES, 'rgba(255,211,90,.95)', 4); ctx.restore(); };
motion.on('calibrated', () => { if (state === 'calib') calibDone(); });
async function startInput(){ if (S.input === 'keyboard') { motion.startKeyboard(); chip(); return; }
  try { await motion.startCamera(); chip(); } catch (e) { console.warn('[upside] camera', e); chip('카메라를 켤 수 없어요 — ⌨️ 키보드로 해 볼 수 있어요'); } }
function chip(msg){ const c = $('camChip'); if (msg) { c.textContent = msg; c.className = 'chip'; return; } c.textContent = motion.mode === 'keyboard' ? '⌨️ 키보드 테스트' : motion.km ? '📷 카메라 켜짐' : '📷 카메라 준비 중'; c.className = motion.mode !== 'none' ? 'chip ok' : 'chip'; }
function mountCam(host){ if (!host) { camCanvas.remove(); return; } if (camCanvas.parentElement !== host) host.prepend(camCanvas); }

// ───────── 길·풍경(러닝머신 방식: 캐릭터는 제자리, 세상이 다가온다)
const ROAD_LEN = 12, ROAD_N = 13;
let roads = [], scenery = [], decoT = 0;
function buildRunway(){
  world.clearTheme(); world.themeName = 'runway';
  world.setSky(0x3b2f9a, 0xff9ccf, 0xffd9a8, .45, 0xf6b8d8); world.scene.fog.near = 45; world.scene.fog.far = 135; world.hemi.intensity = 1.05; world.sun.intensity = 2.4; world.sunOff.set(6, 16, 10);
  const T = world.theme; roads = []; scenery = [];
  const roadM = std(0xffffff, { map: TEX.tile, roughness: .5 }); TEX.tile.repeat.set(2, 3);
  const edgeM = std(0xffd35a, { emissive: 0xffa520, emissiveIntensity: .6, metalness: .4 });
  for (let i = 0; i < ROAD_N; i++) { const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(LANE * 3 + 1.2, .5, ROAD_LEN), roadM); top.position.y = -.25; top.receiveShadow = true; g.add(top);
    for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(.25, .3, ROAD_LEN), edgeM); e.position.set(sx * (LANE * 1.5 + .55), .05, 0); g.add(e); }
    for (const lx of [-.5, .5]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.07, .02, ROAD_LEN * .8), std(0xffffff, { emissive: 0xffffff, emissiveIntensity: .4, transparent: true, opacity: .5 })); l.position.set(lx * LANE, .01, 0); g.add(l); }
    const under = new THREE.Mesh(new THREE.ConeGeometry(4.6, 6, 7, 2), std(0x9a7563, { flatShading: true, roughness: .9 })); under.rotation.x = Math.PI; under.position.y = -3.5; under.scale.z = 1.4; g.add(under);
    if (i % 2 === 0) for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(.32, 0), std(sx > 0 ? 0x9fe9ff : 0xe2b0ff, { emissive: sx > 0 ? 0x40c8ff : 0xb050ff, emissiveIntensity: 1.2 })); c.position.set(sx * (LANE * 1.5 + .55), .7, 0); c.scale.y = 1.8; g.add(c); }
    g.position.z = 10 - i * ROAD_LEN; T.add(g); roads.push(g); }
  // 양옆 풍경: 떠 있는 섬·거꾸로 매달린 나무와 집·위로 흐르는 폭포 (깊이 여러 층)
  for (let i = 0; i < 26; i++) { const g = new THREE.Group(); const side = i % 2 ? 1 : -1, far = Math.random();
    const isl = makeIsland(rnd(1.4, 3.4) * (1 + far), { depth: rnd(1.1, 1.8) }); g.add(isl);
    const r = Math.random(); if (r < .35) { const t = makeTree(rnd(.8, 1.4), null, true); t.position.y = -rnd(1.5, 2.6); g.add(t); }
    else if (r < .6) { const h = makeHouse(rnd(.9, 1.4), null, true); h.position.y = -rnd(1.6, 2.4); g.add(h); }
    else if (r < .8) { const t = makeTree(rnd(.8, 1.3)); t.position.y = .1; g.add(t); }
    else { const wf = makeWaterfall(1.1, 9); wf.position.y = 4.5; g.add(wf); g.userData.wf = wf; }
    g.position.set(side * rnd(8.5, 13 + far * 22), rnd(-3, 8) + far * 5, -rnd(0, ROAD_N * ROAD_LEN)); g.rotation.y = rnd(0, 6); g.userData.par = .55 + (1 - far) * .45; T.add(g); scenery.push(g); }
  world.addClouds(10, 20, -60); world.addBalloons();
  // 속도선
  const sl = new THREE.BufferGeometry(), N = 90, P = new Float32Array(N * 6); sl.setAttribute('position', new THREE.BufferAttribute(P, 3));
  for (let i = 0; i < N; i++) resetStreak(P, i, true);
  streaks = new THREE.LineSegments(sl, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); streaks.frustumCulled = false; T.add(streaks);
}
let streaks = null;
function resetStreak(P, i, init){ const a = Math.random() * Math.PI * 2, r = rnd(4, 10), x = Math.cos(a) * r, y = 2 + Math.sin(a) * r * .6, z = init ? -rnd(0, 80) : -80 - rnd(0, 10); P.set([x, y, z, x, y, z + 2.5], i * 6); }
function scrollWorld(dz, dt, t){
  for (const g of roads) { g.position.z += dz; if (g.position.z > 10 + ROAD_LEN) g.position.z -= ROAD_N * ROAD_LEN; }
  for (const g of scenery) { g.position.z += dz * g.userData.par; if (g.position.z > 20) { g.position.z -= ROAD_N * ROAD_LEN + 20; g.position.x = Math.sign(g.position.x) * rnd(8.5, 30); } if (g.userData.wf) g.userData.wf.material.uniforms.t.value = t; }
  if (streaks) { const P = streaks.geometry.attributes.position.array; for (let i = 0; i < P.length / 6; i++) { P[i * 6 + 2] += dz * 2.2; P[i * 6 + 5] += dz * 2.2; if (P[i * 6 + 2] > 8) resetStreak(P, i); } streaks.geometry.attributes.position.needsUpdate = true; }
}

// ───────── 장애물 모양
const OBS_INFO = {
  hole:    { need: 'small', label: '작게!',      em: '🐭', act: 'spread', tip: '작아지려면 팔을 크게 벌려요!' },
  crystal: { need: 'big',   label: '크게!',      em: '💪', act: 'crouch', tip: '커지려면 몸을 웅크려요!' },
  beam:    { need: 'notbig', label: '커지면 쿵!', em: '⚠️', act: 'stand', tip: '막대 밑은 크면 못 지나가요!' },
  rock:    { need: 'lane',  label: '피해요!',    em: '🪨', act: null, tip: '' },
};
function signSprite(text, color){ const c = document.createElement('canvas'); c.width = 512; c.height = 200; const g = c.getContext('2d'); g.fillStyle = color; g.strokeStyle = '#fff'; g.lineWidth = 12; g.beginPath(); g.roundRect(10, 10, 492, 180, 60); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.font = 'bold 110px Jua, Pretendard, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 106); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false })); s.scale.set(3.4, 1.33, 1); return s; }
function makeHoleWall(){ const W = LANE * 3 + 1.2, H = 3.6; const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H); sh.lineTo(-W / 2, H); sh.closePath();
  for (const lx of [-1, 0, 1]) { const h = new THREE.Path(), x = lx * LANE, w = .55, hh = .7; h.moveTo(x - w, 0); h.lineTo(x - w, hh); h.absarc(x, hh, w, Math.PI, 0, true); h.lineTo(x + w, 0); h.closePath(); sh.holes.push(h); }
  const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .7, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 2 }), std(0xb7a3d9, { map: TEX.brick, roughness: .8 })); m.position.z = -.35; m.castShadow = true; g.add(m);
  for (const lx of [-1, 0, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(.6, .06, 8, 24, Math.PI), std(0x9fe9ff, { emissive: 0x40c8ff, emissiveIntensity: 1.5 })); ring.position.set(lx * LANE, .7, .4); g.add(ring); }
  const s = signSprite('🐭 작게!', '#3aa0ff'); s.position.set(0, 4.6, 0); g.add(s); return g; }
function makeCrystalWall(){ const g = new THREE.Group(); const W = LANE * 3 + 1.2;
  const m = new THREE.Mesh(new THREE.BoxGeometry(W, 4.4, .5, 6, 4, 1), std(0x9fe9ff, { emissive: 0x3fb8ff, emissiveIntensity: .55, transparent: true, opacity: .62, roughness: .05, metalness: .3 })); m.position.y = 2.2; g.add(m);
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(rnd(.3, .6), 0), std(0xcff6ff, { emissive: 0x7fe0ff, emissiveIntensity: 1.1 })); c.position.set(rnd(-W / 2, W / 2), rnd(.3, 4.2), .3); c.scale.y = 1.7; g.add(c); }
  const s = signSprite('💪 크게!', '#ff7a45'); s.position.set(0, 5.4, 0); g.add(s); return g; }
function makeBeam(){ const g = new THREE.Group(); const W = LANE * 3 + 1.6;
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.18, .22, 3.2, 10), std(0x5b7be8)); p.position.set(sx * W / 2, 1.6, 0); p.castShadow = true; g.add(p); }
  const c = document.createElement('canvas'); c.width = 256; c.height = 32; const x = c.getContext('2d'); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#222' : '#ffd24a'; x.beginPath(); x.moveTo(i * 16, 32); x.lineTo(i * 16 + 16, 0); x.lineTo(i * 16 + 32, 0); x.lineTo(i * 16 + 16, 32); x.fill(); }
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(4, 1);
  const b = new THREE.Mesh(new THREE.BoxGeometry(W, .55, .55), std(0xffffff, { map: tx })); b.position.y = 2.65; b.castShadow = true; g.add(b);
  const s = signSprite('⚠️ 커지면 쿵!', '#e8505b'); s.position.set(0, 4.1, 0); s.scale.multiplyScalar(.85); g.add(s); return g; }
function makeRock(){ const g = new THREE.Group(); const r = new THREE.Mesh(new THREE.DodecahedronGeometry(.85, 0), std(0x8c7f9e, { flatShading: true, roughness: .9 })); r.position.y = .8; r.castShadow = true; g.add(r);
  const c = new THREE.Mesh(new THREE.OctahedronGeometry(.25, 0), std(0xe2b0ff, { emissive: 0xb050ff, emissiveIntensity: 1.2 })); c.position.set(.3, 1.55, .2); g.add(c); g.userData.spin = r; return g; }
function makeCoin(){ const m = new THREE.Mesh(starGeo(.34, .15, .1), std(0xffd35a, { emissive: 0xffb020, emissiveIntensity: .6, metalness: .6, roughness: .25 })); return m; }
function makeGem(){ const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.OctahedronGeometry(.42, 0), std(0xff5fd2, { emissive: 0xff40c0, emissiveIntensity: 1.2, roughness: .1 })); m.scale.y = 1.5; g.add(m);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.dot, color: 0xff7fe0, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false })); glow.scale.set(2.2, 2.2, 1); g.add(glow); return g; }

// 수정 파편(재사용)
const shards = []; let shardM = null;
function shatter(z, color = 0x9fe9ff){ if (!shardM) shardM = std(0xcff6ff, { emissive: 0x7fe0ff, emissiveIntensity: .9, transparent: true, opacity: .9 });
  for (let i = 0; i < 26; i++) { let s = shards.find(q => !q.live); if (!s) { s = { m: new THREE.Mesh(new THREE.TetrahedronGeometry(rnd(.18, .4)), shardM), live: false }; shards.push(s); }
    world.dyn.add(s.m); s.live = true; s.t = 0; s.m.position.set(rnd(-4, 4), rnd(.3, 4), z); s.v = V3(rnd(-6, 6), rnd(2, 9), rnd(4, 14)); s.r = V3(rnd(-9, 9), rnd(-9, 9), rnd(-9, 9)); }
  world.burst(V3(0, 2, z), color, 120, 8, -6); }
function updateShards(dt){ for (const s of shards) if (s.live) { s.t += dt; s.v.y -= 22 * dt; s.m.position.addScaledVector(s.v, dt); s.m.rotation.x += s.r.x * dt; s.m.rotation.y += s.r.y * dt; if (s.t > 1.4) { s.live = false; world.dyn.remove(s.m); } } }

// ───────── 게임 상태
let state = 'loading', hero = null, G = null;
function newGame(){ const L = LEVEL[S.diff] || LEVEL.easy;
  return { L, t: 0, speed: L.v0, dist: 0, score: 0, coins: 0, combo: 0, best: 0, danger: 0, hits: 0, smash: 0, level: 1, lane: 0, hx: 0, size: 'mid', inv: 0, slow: 0, next: 2.5, obs: [], items: [], over: false, prompt: null, lastLevelT: 0, intro: {} }; }
function showScreen(id){ for (const s of ['scr-title', 'scr-calib', 'hud', 'scr-over', 'scr-set']) $(s).classList.toggle('hidden', s !== id); state = id.replace('scr-', ''); }

// 시작 화면: 캐릭터가 거꾸로 따라 하기(제자리 달리기)
function enterTitle(){ showScreen('scr-title'); vignette(0); buildRunway(); hero = new Hero(); hero.faceNow('front'); world.dyn.add(hero.root); hero.root.position.set(0, 0, 0);
  world.setCam(V3(-2.3, 2.2, 6.4), V3(-2.3, 1.6, 0), { snap: true, sway: .5 }); audio.play('title'); $('bestT').textContent = S.best ? `최고 기록 ${S.best}점` : '';
  $('titleSense').classList.toggle('hidden', motion.mode !== 'camera'); mountCam(motion.mode === 'camera' ? $('titleCam') : null); seg('inputSeg', S.input); chip(); }
function updateTitle(dt){ const f = motion.f, c = transform(f, { ...ALL_OFF, lr: true, arms: true, size: true, head: true });
  if (f.present) { hero.setDrive({ sl: c.sl, sr: c.sr, tilt: c.tilt }); hero.root.position.x = damp(hero.root.position.x, clamp(c.x, -1.5, 1.5) * 1.2, 6, dt); hero.setScale(c.size === 'big' ? 1.6 : c.size === 'small' ? .55 : 1); }
  else { hero.setDrive(null); hero.setScale(1); }
  hero.set('idle'); hero.update(dt); scrollWorld(dt * 2, dt, world.t); }

// 자세 보정(카메라일 때 학생마다 한 번)
function enterCalib(){ if (motion.mode !== 'camera' || calibrated) { startRun(); return; } showScreen('scr-calib'); mountCam($('calibCam')); motion.beginCalibration(); say('카메라 앞 가운데에 서서 차렷!'); }
function updateCalib(){ const p = motion.calibProgress(); $('ringFg').style.strokeDashoffset = 327 * (1 - p); $('calibMsg').innerHTML = !motion.km ? '카메라 켜는 중…' : !motion.pose ? '몸이 안 보여요<br>한 걸음 뒤로!' : p > 0 ? '좋아요! 그대로…' : '가운데에 서서 차렷!'; }
function calibDone(){ calibrated = true; audio.success(); setTimeout(startRun, 500); }
$('btnCalibSkip').onclick = () => { motion.calibrating = false; calibrated = true; startRun(); };

// ───────── 달리기
let countT = 0;
function startRun(){ showScreen('hud'); G = newGame(); buildRunway(); hero = new Hero(); hero.faceNow('back'); world.dyn.add(hero.root);
  world.setCam(V3(0, 3.4, 7.8), V3(0, 1.6, -6), { snap: true, sway: .25, follow: 6 });
  $('keyHelp').classList.toggle('hidden', motion.mode !== 'keyboard'); $('camWrap').classList.toggle('hidden', motion.mode !== 'camera'); mountCam(motion.mode === 'camera' ? $('camWrap') : null);
  countT = 3.99; vignette(0); audio.play('run'); say('준비!'); hud(); }
function spawn(){ const g = G, lv = g.level; const kinds = ['hole']; if (lv >= 2) kinds.push('crystal'); if (lv >= 3) kinds.push('rock', 'rock'); if (lv >= 4) kinds.push('beam');
  let k = pick(kinds); if (g.obs.length && g.obs[g.obs.length - 1].kind === k && Math.random() < .5) k = pick(kinds);
  if (!g.intro[k]) { g.intro[k] = true; k = k; }
  const Z = -95; let m;
  if (k === 'hole') m = makeHoleWall(); else if (k === 'crystal') m = makeCrystalWall(); else if (k === 'beam') m = makeBeam();
  if (k === 'rock') { const free = (Math.random() * 3 | 0) - 1; const lanes = [-1, 0, 1].filter(l => l !== free); const use = lv >= 5 ? lanes : [pick(lanes)];
    for (const l of use) { const r = makeRock(); r.position.set(l * LANE, 0, Z); world.dyn.add(r); g.obs.push({ kind: 'rock', m: r, lane: l, done: false }); }
    addCoins(Z + 14, free); }
  else { m.position.z = Z; world.dyn.add(m); g.obs.push({ kind: k, m, done: false }); addCoins(Z + 16, (Math.random() * 3 | 0) - 1); if (k === 'crystal' || (lv >= 2 && Math.random() < .4)) addGem(Z + 8, (Math.random() * 3 | 0) - 1); }
}
function addCoins(z, lane){ for (let i = 0; i < 5; i++) { const c = makeCoin(); c.position.set(lane * LANE, .9, z + i * 1.6); world.dyn.add(c); G.items.push({ kind: 'coin', m: c, lane }); } }
function addGem(z, lane){ const g = makeGem(); g.position.set(lane * LANE, 3.1, z); world.dyn.add(g); G.items.push({ kind: 'gem', m: g, lane }); }

function laneFrom(c){ const th = motion.diff.lateral * motion.sens, cur = G.lane; // 히스테리시스
  if (cur === 0) return c.x > th ? 1 : c.x < -th ? -1 : 0; if (cur === 1) return c.x < th * .55 ? (c.x < -th ? -1 : 0) : 1; return c.x > -th * .55 ? (c.x > th ? 1 : 0) : -1; }

function updateRun(dt){
  const g = G, f = motion.f, H = hero;
  // 카메라 밖이면 잠깐 멈춤
  if (motion.mode === 'camera' && !f.present) { awayT += dt; if (awayT > 1.2) { $('away').classList.remove('hidden'); H.update(dt * .2); return; } } else { awayT = 0; $('away').classList.add('hidden'); }
  const c = transform(f, { ...ALL_OFF, lr: true, size: true });
  // 크기(거꾸로): 웅크림 → 커짐, 펼침 → 작아짐
  const ns = c.size === 'big' ? 'big' : c.size === 'small' ? 'small' : 'mid';
  if (ns !== g.size) { if (SIZE[ns] > SIZE[g.size]) audio.grow(); else audio.shrink(); world.burst(V3(g.hx, 1, 0), ns === 'big' ? 0xff9a5a : 0x7fd0ff, 25, 3); g.size = ns; }
  H.setScale(SIZE[g.size]);
  const lane = laneFrom(c); if (lane !== g.lane) { g.lane = lane; audio.whoosh(); }
  g.hx = damp(g.hx, g.lane * LANE, 11, dt); H.root.position.x = g.hx; H.root.rotation.z = (g.lane * LANE - g.hx) * -.06;
  // 카운트다운
  if (countT > 0) { const n = Math.ceil(countT); countT -= dt; const m = Math.ceil(countT); $('count').textContent = countT > 0 ? m : '출발!'; $('count').classList.remove('hidden'); if (m !== n) { if (countT > 0) { audio.tick(); say(String(m)); } else { audio.fanfare(); say('출발!'); setTimeout(() => $('count').classList.add('hidden'), 700); } }
    H.set('idle'); H.update(dt); camFollow(dt); return; }
  // 속도·레벨
  g.t += dt; const lvNow = Math.min(6, 1 + Math.floor(g.t / 22)); if (lvNow > g.level) { g.level = lvNow; toast(`레벨 ${g.level}! 더 빨라져요`, 'lv'); audio.alarm(); say('레벨 ' + g.level + '! 더 빨라져요!'); if (g.level === 2) setTimeout(() => toast('💪 수정 벽 등장! 크게 부숴요', 'lv'), 1600); if (g.level === 3) setTimeout(() => toast('🪨 바위 등장! 옆으로 피해요', 'lv'), 1600); if (g.level === 4) setTimeout(() => toast('⚠️ 높은 막대 등장! 커지면 쿵', 'lv'), 1600); }
  const target = Math.min(g.L.vMax, g.L.v0 + g.t * .09); g.slow = Math.max(0, g.slow - dt);
  g.speed = damp(g.speed, target * (g.slow > 0 ? .45 : 1), g.slow > 0 ? 8 : 1.5, dt);
  const dz = g.speed * dt; g.dist += dz; g.score += dz * .5 * (1 + Math.min(g.combo, 20) * .05);
  scrollWorld(dz, dt, world.t); streaks.material.opacity = clamp((g.speed - 10) / 14, 0, .55);
  // 생성
  g.next -= dt; if (g.next <= 0) { spawn(); const gap = Math.max(g.L.gapMin, g.L.gap0 - (g.level - 1) * .32); g.next = gap * rnd(.9, 1.15); }
  // 장애물 판정(캐릭터 z=0 을 지나는 순간 한 번)
  g.inv -= dt; let soon = null;
  for (const o of g.obs) { const z0 = o.m.position.z; o.m.position.z += dz; const z1 = o.m.position.z;
    if (o.m.userData.spin) o.m.userData.spin.rotation.x -= dz * .6;
    if (!o.done && z1 < 0 && z1 > -g.speed * 3.4 && (!soon || z1 > soon.m.position.z) && o.kind !== 'rock') soon = o;
    if (!o.done && z0 < -.2 && z1 >= -.2) { o.done = true; judge(o); } }
  g.obs = g.obs.filter(o => { if (o.m.position.z > 14) { world.dyn.remove(o.m); return false; } return true; });
  // 별·보석
  const top = SIZE[g.size] * 1.8;
  for (const it of g.items) { it.m.position.z += dz; it.m.rotation.y += dt * 4;
    if (!it.got && Math.abs(it.m.position.z) < .9 && Math.abs(it.m.position.x - g.hx) < 1.1) { const reach = it.kind === 'gem' ? top > 2.8 : true;
      if (reach) { it.got = true; world.dyn.remove(it.m); if (it.kind === 'coin') { g.coins++; g.score += 10; audio.coin(g.coins); world.burst(it.m.position, 0xffd35a, 8, 2.5); }
        else { g.score += 60; g.danger = Math.max(0, g.danger - .12); audio.starGet(4); world.burst(it.m.position, 0xff7fe0, 50, 5); world.ring(it.m.position, 0xff9fc8, 1.4); toast('💎 +60', 'good'); } } } }
  g.items = g.items.filter(it => { if (it.got) return false; if (it.m.position.z > 14) { world.dyn.remove(it.m); return false; } return true; });
  updateShards(dt);
  // 다가오는 장애물 알림(쉬움·보통은 내가 할 동작 그림까지)
  setPrompt(soon);
  // 회오리(위험도)
  g.danger = Math.max(0, g.danger - g.L.heal * dt); vignette(g.danger);
  if (g.over) return;
  H.set(g.speed > 13 ? 'run' : 'walk'); H.update(dt);
  camFollow(dt); hud();
}
let awayT = 0;
function camFollow(dt){ const s = hero ? hero.scaleCur : 1, g = G; const sp = g ? clamp((g.speed - 8) / 14, 0, 1) : 0;
  world.setCam(V3((g ? g.hx : 0) * .55, 2.2 + s * 2.1, 6.4 + s * 1.9 + sp * 1.2), V3((g ? g.hx : 0) * .7, .9 + s * .35, -9), { sway: .2, follow: 5 });
  world.camera.fov = damp(world.camera.fov, 52 + sp * 14, 3, dt); world.camera.updateProjectionMatrix(); }

function judge(o){ const g = G, sz = g.size; let ok = true, msg = '';
  if (o.kind === 'hole') { ok = sz === 'small'; if (ok) { msg = pick(['쏙!', '쏘옥!', '작게 통과!']); audio.squeak(); world.burst(V3(g.hx, .6, -.5), 0x7fd0ff, 40, 4); } }
  if (o.kind === 'crystal') { ok = sz === 'big'; if (ok) { msg = pick(['와장창!', '쾅! 부쉈다!', '거인 펀치!']); audio.smash(); shatter(-.3); world.kick(.5); world.dyn.remove(o.m); g.smash++; g.score += 40; } }
  if (o.kind === 'beam') { ok = sz !== 'big'; if (ok) { msg = pick(['휴~ 통과!', '아슬아슬!']); audio.whoosh(); } }
  if (o.kind === 'rock') { if (o.lane !== g.lane) return; if (sz === 'big') { ok = true; msg = '바위 깨기!'; audio.smash(); world.burst(V3(o.lane * LANE, 1, 0), 0xb8a8d8, 60, 6, -8); world.kick(.3); world.dyn.remove(o.m); g.score += 25; } else ok = false; }
  if (ok) { g.combo++; g.score += 20 * (1 + Math.min(g.combo, 20) * .1); g.danger = Math.max(0, g.danger - .05); g.best = Math.max(g.best, g.combo);
    toast(msg + (g.combo >= 3 ? `  콤보 ${g.combo}` : ''), 'good'); if (g.combo % 5 === 0) { audio.success(); say('콤보 ' + g.combo + '!'); hero.setMood('cheer', 1); } }
  else crash(o);
}
function crash(o){ const g = G; if (g.inv > 0) return; g.inv = 1.1; g.hits++; g.combo = 0; g.slow = .9; g.danger = Math.min(1, g.danger + g.L.hit);
  audio.bonk(); audio.boing(); world.kick(.55); hero.setMood('dizzy', 1.4); hero.spinOnce(); flash();
  const why = o.kind === 'hole' ? '쿵! 작아져야 해요 (팔 벌리기)' : o.kind === 'crystal' ? '쿵! 커져야 부숴요 (웅크리기)' : o.kind === 'beam' ? '머리 쿵! 크면 못 지나가요' : '쿵! 바위를 피해요';
  toast(why, 'bad'); if (o.kind === 'crystal' || o.kind === 'hole') { if (o.kind === 'crystal') shatter(-.3, 0xff9aa8); world.dyn.remove(o.m); }
  if (g.danger >= 1) { gameOver(); return; }
  if (g.danger > .6) { audio.alarm(); say('회오리가 바짝 따라와요!'); } }
function gameOver(){ const g = G; if (g.over) return; g.over = true; vignette(1); audio.stopMusic(); audio.boing(); world.kick(.8); say('회오리에 잡혔어요! 다시 도전해 볼까요?');
  const score = Math.round(g.score), isBest = score > (S.best || 0); if (isBest) { S.best = score; save(); }
  setTimeout(() => { showScreen('scr-over'); $('ovScore').textContent = score; $('ovBest').textContent = isBest ? '🎉 새 최고 기록!' : `최고 기록 ${S.best}점`;
    $('ovStats').innerHTML = `<span>🏃 ${Math.round(g.dist)}m</span><span>⭐ 별 ${g.coins}</span><span>💥 부순 벽 ${g.smash}</span><span>🔥 최고 콤보 ${g.best}</span><span>🌀 레벨 ${g.level}</span>`;
    $('ovQ').textContent = pick(['평소와 반대로 움직이니 어떤 느낌이 들었나요?', '커지려면 웅크려야 했어요. 왜 헷갈렸을까요?', '여러분이 새로운 거꾸로 마법을 만든다면 무엇을 만들고 싶나요?', '우리 학교가 거꾸로 나라가 된다면 어떤 일이 생길까요?']); }, 900); }

// ───────── 화면 조각
let promptKey = '';
function setPrompt(o){ const el = $('prompt'); const key = o ? o.kind + (o.m.id) : '';
  if (!o) { if (promptKey) { el.classList.add('hidden'); promptKey = ''; } return; }
  const info = OBS_INFO[o.kind], done = o.kind === 'hole' ? G.size === 'small' : o.kind === 'crystal' ? G.size === 'big' : G.size !== 'big';
  el.classList.toggle('ok', done);
  if (key !== promptKey) { promptKey = key; el.classList.remove('hidden');
    el.innerHTML = `<div class="pbig">${info.em} ${info.label}</div>${S.diff !== 'hard' && info.act ? `<div class="pact">${picto(info.act, { size: 96, label: false })}<span>${info.tip}</span></div>` : ''}`;
    if (S.diff === 'easy' && !G.said?.[o.kind]) { G.said = G.said || {}; G.said[o.kind] = (G.said[o.kind] || 0) + 1; if (G.said[o.kind] <= 3) say(info.tip); } else say(info.label.replace('!', '')); } }
let toastTO = 0;
function toast(t, kind){ const el = $('toast'); el.textContent = t; el.className = 'toast show ' + (kind || ''); clearTimeout(toastTO); toastTO = setTimeout(() => el.className = 'toast', 1300); }
function flash(){ const f = $('hitflash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
function vignette(d){ const v = $('storm'); v.style.opacity = clamp(d * 1.1, 0, 1); v.classList.toggle('pulse', d > .6); }
function hud(){ const g = G; $('score').textContent = Math.round(g.score); $('dist').textContent = Math.round(g.dist) + 'm'; $('combo').textContent = g.combo >= 2 ? `🔥 ${g.combo}` : ''; $('lv').textContent = 'Lv ' + g.level;
  $('dangerFill').style.width = (100 - g.danger * 100) + '%'; $('dangerFill').className = g.danger > .6 ? 'hot' : '';
  const sz = { small: '🐭 작아요', mid: '🧒 보통', big: '💪 커요' }[g.size]; if ($('sizeNow').textContent !== sz) { $('sizeNow').textContent = sz; $('sizeNow').className = 'sz ' + g.size; }
  sense(); }
function sense(){ const f = motion.f, st = $('camSt'); if (st) { if (motion.mode !== 'camera') st.textContent = ''; else if (f.present) { st.textContent = '✓ 몸을 찾았어요'; st.className = 'camst ok'; } else { st.textContent = '몸이 안 보여요'; st.className = 'camst no'; } }
  const on = { crouch: f.crouchOn, spread: f.spreadOn }; document.querySelectorAll('#acts i[data-a]').forEach(i => { const k = i.dataset.a; if (k === 'pos') { const th = motion.diff.lateral * motion.sens, b = i.querySelectorAll('b'); b[0].classList.toggle('on', f.x < -th); b[1].classList.toggle('on', f.x > th); i.querySelector('span').style.transform = `translateX(${clamp(f.x, -2, 2) * 8}px)`; } else i.classList.toggle('on', !!on[k]); }); }

// ───────── 버튼·설정
function seg(id, v){ document.querySelectorAll('#' + id + ' button').forEach(b => b.classList.toggle('on', b.dataset.v === String(v))); }
function bindSeg(id, key, conv, after){ document.querySelectorAll('#' + id + ' button').forEach(b => b.onclick = () => { S[key] = conv(b.dataset.v); save(); seg(id, S[key]); after && after(); }); }
document.addEventListener('click', e => { if (e.target.closest('button')) { audio.ensure(); audio.click(); } }, true);
$('btnGo').onclick = () => { audio.ensure(); enterCalib(); };
$('btnAgain').onclick = () => startRun();
$('btnHome').onclick = () => enterTitle();
$('btnSet').onclick = () => { showScreen('scr-set'); refreshSet(); };
$('btnSetClose').onclick = () => enterTitle();
$('btnPause').onclick = () => togglePause();
$('btnQuit').onclick = () => { paused = false; $('pause').classList.add('hidden'); enterTitle(); };
$('btnResume').onclick = () => togglePause();
let paused = false; function togglePause(){ if (state !== 'hud') return; paused = !paused; $('pause').classList.toggle('hidden', !paused); }
addEventListener('keydown', e => { if (e.key === 'Escape') togglePause(); if (e.key === 'Enter' && state === 'title') $('btnGo').click(); if (e.key === 'Enter' && state === 'over') $('btnAgain').click(); });
document.querySelectorAll('#inputSeg button').forEach(b => b.onclick = () => { S.input = b.dataset.v; save(); calibrated = false; startInput().then(enterTitle); });
function refreshSet(){ seg('sDiff', S.diff); seg('sInput', S.input); seg('sMirror', S.mirror); seg('sVoice', S.voice); seg('sBgm', S.bgm); seg('sQuality', S.quality); $('sSens').value = S.sens; $('sSensV').textContent = Math.round(S.sens * 100) + '%'; }
const bool = v => v === 'true';
bindSeg('sDiff', 'diff', String); bindSeg('sMirror', 'mirror', bool); bindSeg('sVoice', 'voice', bool, () => audio.voiceOn = S.voice); bindSeg('sBgm', 'bgm', bool, () => { audio.ensure(); audio.setBgm(S.bgm); });
bindSeg('sInput', 'input', String, () => { calibrated = false; startInput(); }); bindSeg('sQuality', 'quality', String, () => setTimeout(() => location.reload(), 200));
$('sSens').oninput = () => { S.sens = +$('sSens').value; $('sSensV').textContent = Math.round(S.sens * 100) + '%'; save(); };
$('btnCamRange').onclick = async () => { if (S.input !== 'camera') { S.input = 'camera'; save(); seg('sInput', 'camera'); } if (!motion.km) await startInput(); if (motion.km) motion.km.openRangeUI(() => { calibrated = false; }); };
$('btnRecalib').onclick = () => { motion.resetStudent(); calibrated = false; $('btnRecalib').textContent = '다음 시작 때 다시 맞춰요 ✓'; };
$('btnNext').onclick = () => { motion.resetStudent(); calibrated = false; enterCalib(); }; // 다음 친구
const full = () => { const d = document; if (!d.fullscreenElement) d.documentElement.requestFullscreen?.().catch(() => {}); else d.exitFullscreen?.(); };
['btnFull1', 'btnFull2'].forEach(id => $(id).onclick = full);
addEventListener('pagehide', () => { motion.destroy(); audio.stopMusic(); });

// ───────── 루프
let last = performance.now();
function loop(now){ requestAnimationFrame(loop); const dt = Math.min(Q.has('test') ? .1 : .05, (now - last) / 1000); last = now;
  motion.update(dt);
  if (state === 'title') { updateTitle(dt); sense(); } else if (state === 'calib') updateCalib(); else if (state === 'hud' && !paused && G && !G.over) updateRun(dt); else if (state === 'over' && hero) { hero.set('idle'); hero.update(dt); }
  world.update(dt); }
window.__km = { get state(){ return state; }, get G(){ return G; }, motion, world, S, startRun, enterTitle };
enterTitle(); startInput().then(() => { if (state === 'title') { $('titleSense').classList.toggle('hidden', motion.mode !== 'camera'); mountCam(motion.mode === 'camera' ? $('titleCam') : null); } });
requestAnimationFrame(loop);
setTimeout(() => { $('loading').style.transition = 'opacity .5s'; $('loading').style.opacity = 0; setTimeout(() => $('loading').classList.add('hidden'), 550); }, 400);
