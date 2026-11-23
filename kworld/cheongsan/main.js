/* 시간 탐험대 · 「청산리 — 엿새」 장 엔진(2026-11-23, 설계 v2 ⑨ main.js)
   상태(띠 넷·꼬리표) · 장 넘기기 · 저장 · 끝 화면 · 새 조작 셋(엎드리기 C · 살피기 Space 꾹 · 신호 F) · 시점 · 작은 지도.
   장마다 다른 것(차례·판정·넘기는 값)은 ch0.js … 에. 장은 ctx 를 받아 { start, update, tasks, job, signal, tags, result } 를 돌려준다.
   기준: 「역사 요소 + 이기고 지는 긴장」. 나는 척후병 — 총을 겨눠 쏘는 조작은 없다(신호를 올리면 부대가 싸운다).
   싸움 수위: 적은 쓰러지면서 사라진다 · 피·남는 몸 없음 · 우리 편은 「다쳐서 뒤로 보냈다」로만.
   한 줄 가운데 슬래시 두 개 주석 금지(블록 주석만). */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, sayLine, controls, overBar, missions, loadArt, ART, art, artInst, tone, noise, resumeAudio, glowSprite, remember } from '../scene/kit.js';
import { EORANG, GAPSAN } from './map.js';
import { NODES } from './strat.js';
import { dressWorld, dressVillage } from './dress.js';
import { MAP_W, MAP_H, H, Hq, floorAt, mainD, losClear, slopeAt, ZONES, buildTerrain, farRing, plantForest, shadeForestFloor, mapImage, groundRing, groundFan } from './map.js';
import { makeArmy, makeFx, smokeColumn, path } from './enemy.js';
import { makePeople } from './people.js';
import ch0 from './ch0.js';
import ch1 from './ch1.js';
import ch2 from './ch2.js';
import ch3 from './ch3.js';
import ch4 from './ch4.js';
import ch5 from './ch5.js';
import ch6 from './ch6.js';

const Q = new URLSearchParams(location.search);
const MUTE = Q.get('mute') === '1', SEED = +(Q.get('seed') || 1920), LITE = Q.get('lite') === '1' || (navigator.hardwareConcurrency || 8) <= 4;
/* 장은 이야기 차례(0 앞날 · 1 백운평 · 2 완루구 · 3 천수평 · 4 어랑촌 · 5 쫓기는 길 · 6 고동하). 아직 없는 장은 null — 건너뛴다 */
const CHAPTERS = [ch0, ch1, ch2, ch3, ch4, ch5, ch6], TITLES = ['앞날 · 10월 20일', '첫날 · 10월 21일 백운평', '첫날 밤 · 완루구', '둘째 날 새벽 · 천수평', '둘째 날 · 어랑촌', '셋째~넷째 날 · 쫓기는 길', '닷새째 밤 · 고동하'], SAVE_KEY = 'kworld_cheongsan_save_v1';

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xd8d0bc, 120, 520], exposure: 1.05, fov: 40 });
cam.far = 1400; cam.updateProjectionMatrix();
const hemi = new THREE.HemisphereLight(0xeef0ff, 0x8a7a5a, 1.25); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff0d0, intensity: 2.3, box: [52, 52], far: 260, pos: [60, 90, 230], target: [100, 0, 170] });
addEventListener('resize', resize); resize();

/* 그림: 블렌더 모델(없으면 네모로 대신) */
try { await loadArt('people', 'nature', 'props'); } catch (e) { console.warn('art', e); }
try { await loadArt('cheongsan'); } catch (e) { console.warn('cheongsan art', e); }
try { await loadArt('cheongsan2'); } catch (e) { console.warn('cheongsan2 art', e); }   /* 블렌더 2차(11-23): 먼 산·바위벽·걷는 병사·야영 소품·옷차림 */

/* ───── 큰 지형 ───── */
const terrain = buildTerrain(scene, { cs: LITE ? 3 : 2.5 });
const sky = farRing(scene, 7);
const CLEAR = [[40, 150, 92, 194], [166, 173, 194, 198], [229, 126, 244, 140], [249, 130, 263, 144]];   /* 빈터 · 신호 자리에서 길까지 · 망바위 · 옆 바위 */   /* 빈터(야영지) — 나무를 두지 않는다 */
const NO_TREE = [];
const segDist = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz, t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / L2, 0, 1); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };
const godongClear = (x, z) => dist(x, z, 92, 290) < 33 || dist(x, z, 72, 276) < 6 || [3, 5, 7, 9].some((i) => dist(x, z, NODES[i][0], NODES[i][1] - 14) < 20) || (x > 222 && x < 262 && z > 318 && z < 348);   /* 장 5 사이 장면 자리 · 거짓 불 자리 */
const eorangClear = (x, z) => dist(x, z, EORANG.hq[0], EORANG.hq[1]) < 24 || EORANG.spurs.some(([a, b]) => segDist(x, z, a, b) < 9) || (x > 552 && x < 580 && z > 150 && z < 170);   /* 어랑촌 고지: 지휘소·능선 등성이·주먹밥 길 */   /* 장이 비워 둘 자리 [x, z, r] — 아래에서 장이 채운다 */
const forest = plantForest(scene, { seed: SEED, lite: LITE, avoid: (x, z) => CLEAR.some((r) => x > r[0] && x < r[2] && z > r[1] && z < r[3]) || NO_TREE.some((p) => dist(x, z, p[0], p[1]) < p[2]) || eorangClear(x, z) || godongClear(x, z) || [[110, 148, 0], [136, 148.5, 0], [222, 148, 0], [120, 192, 0], [176, 192, 0], [226, 192, 0], [236, 133, 0], [256, 137, 0], [248, 176, 0], [176, 189, 0]].some((p) => dist(x, z, p[0], p[1]) < 4.2) });
const treeAvoid = (x, z) => CLEAR.some((r) => x > r[0] && x < r[2] && z > r[1] && z < r[3]) || eorangClear(x, z) || godongClear(x, z) || dist(x, z, 440, 179) < 26 || dist(x, z, 437, 100) < 16 || (x > 322 && x < 370 && z > 176 && z < 204);
dressWorld({ scene, forest, lite: LITE, avoid: treeAvoid });
shadeForestFloor(terrain.mesh, forest.put);
/* 숲 그늘: 8 m 칸마다 나무 수(들킴이 덜 오른다) */
const FG = new Uint8Array(Math.ceil(MAP_W / 8) * Math.ceil(MAP_H / 8)); for (const [x, z] of forest.put) { const i = Math.floor(x / 8), j = Math.floor(z / 8); if (i >= 0 && j >= 0 && i < MAP_W / 8 && j < MAP_H / 8) FG[j * Math.ceil(MAP_W / 8) + i] = Math.min(255, FG[j * Math.ceil(MAP_W / 8) + i] + 1); }
const forestAt = (x, z) => { const i = Math.floor(x / 8), j = Math.floor(z / 8); return i >= 0 && j >= 0 && i < MAP_W / 8 && j < MAP_H / 8 ? FG[j * Math.ceil(MAP_W / 8) + i] : 0; };

/* 먼 마을(갑산촌·어랑촌) — 지도에 보이는 큰 판의 나머지 */
const putArt = (n, x, z, ry = 0, s = 1, tints) => { const m = art(n, tints); if (!m || (m.isMesh && !m.geometry.attributes.position)) return null; m.position.set(x, Hq(x, z) - 0.1, z); m.rotation.y = ry; m.scale.setScalar(s); scene.add(m); return m; };
{ const r = rng(51), EOR = []; for (const [vx, vz, n] of [[566, 212, 12]]) for (let i = 0; i < n; i++) { const x = vx + (r() - 0.5) * 34, z = vz + (r() - 0.5) * 18, ry = (r() - 0.5) * 0.6; putArt(i === 4 && ART.cs_loghouse_c ? 'cs_loghouse_c' : i % 3 ? 'cs_loghouse' : 'cs_loghouse_b', x, z, ry); EOR.push([x, z, ry]); } dressVillage(putArt, EOR, { seed: 5 });
  GAPSAN.forEach(([x, z, ry], i) => { putArt(i === 8 && ART.cs_loghouse_c ? 'cs_loghouse_c' : i % 3 === 1 ? 'cs_loghouse_b' : 'cs_loghouse', x, z, ry); if (i % 2 === 0) putArt('cs_fence', x + 3.5, z + 3.2, ry + 0.2); }); dressVillage(putArt, GAPSAN, { seed: 3, well: [346, 188] }); }

/* ───── 군대 · 효과 · 사람 ───── */
const army = makeArmy(scene), fx = makeFx(scene, cam), ppl = makePeople(scene, { mute: MUTE, getS: () => S });   /* S 는 아래에서 만든다 — 한마디를 고를 때만 본다 */
const me = ppl.mk({ shirt: 0x5a5040, pants: 0x4a4a4e, hat: 'fur', rifle: false, pack: true, satchel: true, scarf: 0xb04a3a });   /* 척후: 붉은 목수건 · 옆 가방 */
const meRing = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.8, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false })); meRing.rotation.x = -Math.PI / 2; scene.add(meRing);

/* ───── 소리(?mute=1 이면 조용히) ───── */
const T = (...a) => { if (!MUTE) tone(...a); }, N = (...a) => { if (!MUTE) noise(...a); };
const SFX = {
  shot: (d = 1) => { N(0.09, 0.22 * d, 900 + Math.random() * 500); N(0.25, 0.08 * d, 220); },
  volley: (d = 1) => { for (let i = 0; i < 6; i++) N(0.12, 0.16 * d, 700 + Math.random() * 700, Math.random() * 0.35); N(0.6, 0.12 * d, 160); },
  boom: (d = 1) => { T(70, 28, 1.1, 'sine', 0.4 * d); N(0.9, 0.3 * d, 120); },
  far: () => { T(55, 30, 1.4, 'sine', 0.18); N(1.2, 0.08, 90); },
  drum: (v = 0.35) => { T(90, 50, 0.32, 'sine', v); N(0.08, v * 0.4, 200); },
  bugle: () => { [523, 659, 784, 1047].forEach((f, i) => T(f, f, 0.22, 'triangle', 0.16, i * 0.2)); },
  crow: () => { T(980, 620, 0.16, 'sawtooth', 0.06); T(940, 600, 0.18, 'sawtooth', 0.06, 0.24); },
  cough: () => { N(0.12, 0.25, 700); N(0.1, 0.2, 600, 0.22); },
  beat: (v) => { T(62, 44, 0.12, 'sine', v); T(58, 40, 0.12, 'sine', v * 0.7, 0.16); },
  step: () => N(0.05, 0.04, 300), rustle: () => N(0.1, 0.04, 1800),
  good: () => { T(660, 660, 0.12, 'triangle', 0.12); T(880, 880, 0.12, 'triangle', 0.12, 0.11); T(1320, 1320, 0.22, 'triangle', 0.1, 0.22); },
  bad: () => { T(300, 180, 0.4, 'square', 0.08); }, page: () => T(440, 660, 0.1, 'triangle', 0.1), flag: () => { N(0.3, 0.1, 2400); T(392, 392, 0.12, 'triangle', 0.1); } };

/* ───── 상태 ───── */
const BAND0 = { troop: 100, net: 10, ammo: 60, hunger: 20 };
/* 사람(다가가면 한마디)은 S 를 본다 — S 를 만든 뒤에 */
const S = { mode: 'title', view: 0, yaw: -Math.PI / 2, yawT: -Math.PI / 2, zoom: 1, camYaw: 0, t: 0, px: 64, pz: 172, pdir: 0, moving: false, running: false, said: {}, sayT: 0,
  crouch: false, scoping: false, scopeYaw: 0, scopePitch: 0, band: { ...BAND0 }, tags: {}, ch: 0, cht: 0, det: 0, detOn: false, workT: 0, workKey: '', jobLabel: '', camLift: 0, log: [], chLog: [], stepT: 0, beatT: 0, tension: 0, introT: 0 };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say);
let CH = null, TL = [], curTask = null, BASE = null;

/* ───── 띠 넷 ───── */
const BAND_EL = { troop: 'bTroop', net: 'bNet', ammo: 'bAmmo', hunger: 'bHung' }, BAND_NAME = { troop: '부대', net: '포위망', ammo: '탄약', hunger: '배고픔' };
function band(k, d, why, quiet) { if (!d) return; const v0 = S.band[k]; S.band[k] = clamp(Math.round((v0 + d) * 10) / 10, 0, 100); const real = S.band[k] - v0; if (!real) return;
  const bad = (k === 'troop' || k === 'ammo') ? real < 0 : real > 0; const e = $(BAND_EL[k]); if (bad && !quiet) { e.classList.remove('hit'); void e.offsetWidth; e.classList.add('hit'); }
  if (!quiet) popText(`${BAND_NAME[k]} ${real > 0 ? '+' : ''}${Math.round(real)}`, bad ? '#ff9a7a' : '#a8f0a0'); S.chLog.push({ k, d: real, why }); hud(); }
let popT = 0; function popText(t, col) { const p = $('pop'); p.textContent = t; p.style.color = col; p.style.transition = 'none'; p.style.top = '42%'; p.style.opacity = 1; void p.offsetWidth; p.style.transition = 'opacity .5s, top 1.2s'; p.style.top = '36%'; popT = 1.2; }
function hud() { for (const k in BAND_EL) { const e = $(BAND_EL[k]), v = Math.round(S.band[k]); e.querySelector('b').textContent = v; e.querySelector('u').style.width = v + '%'; } }

/* ───── 사령관 명령 · 장 첫 장면 ───── */
let cmdT = 0; function cmd(who, text, sec = 3.6) { const e = $('cmd'); e.innerHTML = `<small>${who}</small>${text}`; e.style.opacity = 1; cmdT = sec; SFX.drum(0.4); }
let cardT = 0; function card(a, b, sec = 3.2) { const e = $('card'); e.querySelector('b').textContent = a; e.querySelector('span').textContent = b; e.style.opacity = 1; cardT = sec; }

/* ───── 땅 고리(가만히 서는 자리) ───── */
const pads = {};
function pad(key, x, z, col = 0xffcf4d, r = 1.7) { if (pads[key]) { scene.remove(pads[key].m); } const m = groundRing(scene, x, z, r - 0.4, r, col, 0.85); m.visible = false; pads[key] = { m, x, z, r }; return pads[key]; }
function clearPads() { for (const k in pads) { scene.remove(pads[k].m); delete pads[k]; } }

/* ───── 꼬리표 ───── */
const tagBox = $('tags'), tags = Array.from({ length: 16 }, () => { const d = document.createElement('div'); d.className = 'tag'; tagBox.appendChild(d); return d; });
let ti = 0; const v3 = new THREE.Vector3();
function put(x, y, z, html, cls = '') { const d = tags[ti]; if (!d) return false; const q = v3.set(x, y, z).project(cam); if (q.z > 1 || Math.abs(q.x) > 1.05 || Math.abs(q.y) > 1.05) return false; ti++; d.style.display = 'block'; d.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; d.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; const c = 'tag' + (cls ? ' ' + cls : ''); if (d.className !== c) d.className = c; if (d._h !== html) { d.innerHTML = html; d._h = html; } return true; }

/* ───── 고르기 판(단추 둘~셋 · 숫자 키 1·2·3) ───── */
let choiceFns = null;
function choose(q, opts) { const e = $('choice'); e.innerHTML = `<div class="q">${q}</div>` + opts.map((o, i) => `<button class="${i ? 'b2' : ''}" data-i="${i}" ${o.off ? 'disabled' : ''}>${i + 1}. ${o.t}${o.s ? `<small>${o.s}</small>` : ''}</button>`).join(''); e.style.display = 'flex'; choiceFns = opts;
  e.querySelectorAll('button').forEach((b) => b.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); pick(+b.dataset.i); })); }
function pick(i) { if (!choiceFns || !choiceFns[i] || choiceFns[i].off) return; const f = choiceFns[i].fn; closeChoice(); SFX.page(); f(); }
function closeChoice() { $('choice').style.display = 'none'; $('choice').innerHTML = ''; choiceFns = null; }

/* ───── 새 조작 셋 ───── */
function setCrouch(v) { S.crouch = v; $('bCrouch').classList.toggle('on', v); $('kC').classList.toggle('on', v); SFX.rustle(); if (v) say('엎드렸다 — 들킴이 거의 안 오른다. 느리게 기어간다', 'crouch1', 2.6); }
function setScope(v) { if (S.mode !== 'play' && v) return; if (v === S.scoping) return; S.scoping = v; $('bLook').classList.toggle('on', v); $('kS').classList.toggle('on', v); $('scope').style.display = v ? 'block' : 'none'; $('scopeT').style.display = v ? 'block' : 'none';
  if (v) { S.scopeYaw = S.view === 2 ? S.pdir2 || 0 : S.yaw + Math.PI; S.scopePitch = -0.04; S.scopeT0 = S.t; say('살피는 중 — ←→ 로 둘러보기, 손을 떼면 그만', 'scope1', 2.4); } }
function doSignal() { if (S.mode !== 'play' || !CH) return; if (CH.signal && CH.signal()) { SFX.flag(); return; } say('신호는 깃발 자리(붉은 고리)에서만 올린다', null, 2.2); }
addEventListener('keydown', (e) => { if (e.repeat) return; if (e.code === 'KeyC') setCrouch(!S.crouch); if (e.code === 'Space') setScope(true); if (e.code === 'KeyF') doSignal(); if (/^Digit[1-4]$/.test(e.code) && choiceFns) pick(+e.code.slice(5) - 1); });
addEventListener('keyup', (e) => { if (e.code === 'Space') setScope(false); });
addEventListener('blur', () => setScope(false));
$('bCrouch').addEventListener('pointerdown', (e) => { e.stopPropagation(); setCrouch(!S.crouch); });
$('bLook').addEventListener('pointerdown', (e) => { e.stopPropagation(); setScope(true); }); for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) $('bLook').addEventListener(ev, () => setScope(false));
$('bFlag').addEventListener('pointerdown', (e) => { e.stopPropagation(); doSignal(); });

/* ───── 살피기: 보이는 것 = 장이 내놓은 것(연기·적 무리·사람) ─────
   목표 { id, x, y, z, ok(eye) → 보이나, label() → 꼬리표, need 초, onSeen(), seen } — 망원경 가운데 둘레에 need 초 들어 있으면 「봤다」. */
let targets = [];
const eye = new THREE.Vector3();
function scopeUpdate(dt) {
  const keys = ctl.keys; const ix = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0) + ctl.sx, iy = (keys.ArrowUp || keys.KeyW ? 1 : 0) - (keys.ArrowDown || keys.KeyS ? 1 : 0) - ctl.sz;
  S.scopeYaw -= ix * 1.1 * dt; S.scopePitch = clamp(S.scopePitch + iy * 0.6 * dt, -0.5, 0.35);
  const lines = [];
  for (const g of targets) { if (g.off && g.off()) continue; const d = dist(eye.x, eye.z, g.x, g.z), brg = Math.atan2(g.x - eye.x, g.z - eye.z), dif = Math.atan2(Math.sin(brg - S.scopeYaw), Math.cos(brg - S.scopeYaw)), inView = Math.abs(dif) < 0.17;   /* 위아래는 맞추지 않아도 된다 — 좌우로 가운데에 들면 본 것 */
    const vis = inView && d < (g.range || 460) && (!g.ok || g.ok(eye));
    if (vis) { g.t = (g.t || 0) + dt; if (!g.seen && g.t >= (g.need || 0.6)) { g.seen = true; if (g.onSeen) g.onSeen(); SFX.page(); } if (g.label) put(g.x, g.y + (g.labelY || 3), g.z, g.label(), g.seen ? (g.cls || 'seen') : ''); if (g.seen && g.line) lines.push(g.line()); }
    else g.t = Math.max(0, (g.t || 0) - dt * 2); }
  $('scopeT').innerHTML = lines.length ? lines.slice(0, 3).join('<br>') : '← → 로 둘러보기 · 높은 곳에 오르면 더 멀리 보인다';
}

/* ───── 들킴 ───── */
function exposure() { let e = S.crouch ? (S.moving ? 0.1 : 0.04) : S.running ? 2.2 : S.moving ? 1.0 : 0.45; const up = Hq(S.px, S.pz) - floorAt(S.px, S.pz); if (!S.crouch && up > 14) e *= 1.4; const f = forestAt(S.px, S.pz); if (f >= 3) e *= 0.6; return e; }

/* ───── 작은 지도 ───── */
const mini = $('mini'), mg = mini.getContext('2d'), MIMG = mapImage(0.5);
const BR0 = [{ k: 'chase', name: '뒤쫓는 갈래', from: [640, 172] }, { k: 'north', name: '북쪽 갈래', from: [470, -20] }, { k: 'cav', name: '기병', from: [470, 380] }, { k: 'big', name: '큰 갈래', from: [700, 210] }, { k: 'south', name: '남쪽 갈래', from: [240, 400] }];
function drawMini() {
  const W = mini.width, Hh = mini.height, k = Math.min(W / MAP_W, Hh / MAP_H); mg.drawImage(MIMG, 0, 0, W, Hh);
  mg.font = 'bold 15px sans-serif'; mg.textAlign = 'center'; mg.lineWidth = 3;
  for (const z of ZONES) { if (z.id === 'baek' || CH?.zones?.includes(z.id)) { mg.strokeStyle = 'rgba(0,0,0,.7)'; mg.fillStyle = '#fff6d8'; mg.strokeText(z.name, z.x * k, z.z * k); mg.fillText(z.name, z.x * k, z.z * k); } }
  /* 적 다섯 갈래 — 포위망 띠만큼 우리 쪽으로. 살핀 갈래는 붉은 화살, 아닌 것은 흐린 연기 */
  const home = [S.px, S.pz], f = clamp(S.band.net / 100, 0, 1) * 0.85 + 0.1;
  for (const b of BR0) { const x = lerp(b.from[0], home[0], f), z = lerp(b.from[1], home[1], f), seen = S.tags['seen_' + b.k]; const a = Math.atan2(home[1] - z, home[0] - x);
    mg.save(); mg.translate(clamp(x, 6, MAP_W - 6) * k, clamp(z, 6, MAP_H - 6) * k); if (seen) { mg.rotate(a); mg.fillStyle = '#e0301e'; mg.strokeStyle = '#fff'; mg.lineWidth = 2; mg.beginPath(); mg.moveTo(12, 0); mg.lineTo(-8, -8); mg.lineTo(-4, 0); mg.lineTo(-8, 8); mg.closePath(); mg.fill(); mg.stroke(); } else { mg.fillStyle = 'rgba(120,110,100,.55)'; for (let i = 0; i < 3; i++) { mg.beginPath(); mg.arc(Math.sin(S.t + i) * 3, -i * 6, 6 + i * 2, 0, 6.28); mg.fill(); } } mg.restore(); }
  /* 지금 보이는 적 무리(살핀 것만) */
  for (const c of army.columns) { if (c.gone || !c.seen) continue; const p = army.center(c); if (!p) continue; mg.fillStyle = '#e0301e'; mg.strokeStyle = '#fff'; mg.lineWidth = 2; mg.beginPath(); mg.arc(p[0] * k, p[1] * k, 6, 0, 6.28); mg.fill(); mg.stroke(); }
  if (CH && CH.mini) CH.mini(mg, k);
  /* 나 */
  mg.save(); mg.translate(S.px * k, S.pz * k); mg.rotate(-me.rotation.y + Math.PI); mg.fillStyle = '#ffcf4d'; mg.strokeStyle = '#2a2410'; mg.lineWidth = 2; mg.beginPath(); mg.moveTo(0, -9); mg.lineTo(6, 6); mg.lineTo(0, 3); mg.lineTo(-6, 6); mg.closePath(); mg.fill(); mg.stroke(); mg.restore();
}

/* ───── 시점 ───── */
const look = new THREE.Vector3(), camGoal = new THREE.Vector3();
function view(dt = 1 / 30) {
  const py = Hq(S.px, S.pz);
  if (S.mode === 'title') { const a = S.t * 0.04; cam.position.set(150 + Math.cos(a) * 120, 70, 172 + Math.sin(a) * 90); cam.lookAt(150, 8, 168); setFov(46); return; }
  if (S.view !== 0 && S.view !== 1) setNear(0.5);
  if (S.scoping) { setFov(14); setNear(0.5); eye.set(S.px, py + (S.crouch ? 1.25 : 1.65), S.pz); cam.position.copy(eye); const cp = Math.cos(S.scopePitch); look.set(eye.x + Math.sin(S.scopeYaw) * cp * 50, eye.y + Math.sin(S.scopePitch) * 50, eye.z + Math.cos(S.scopeYaw) * cp * 50); cam.lookAt(look); return; }
  const cn = S.mode === 'play' && CH && CH.cine ? CH.cine() : null;   /* 큰 순간: 장이 시점을 잠깐 잡는다 */
  if (cn) { setFov(cn.fov || 42); setNear(0.5); camGoal.set(cn.pos[0], cn.pos[1], cn.pos[2]); cam.position.lerp(camGoal, 0.06); cam.lookAt(cn.look[0], cn.look[1], cn.look[2]); return; }
  if (S.view === 3) { const R = (CH && CH.region) || [0, 90, 300, 260], cx = (R[0] + R[2]) / 2, cz = (R[1] + R[3]) / 2, fov = 30, t = Math.tan(fov * Math.PI / 360), h = Math.max((R[3] - R[1]) / (2 * t), (R[2] - R[0]) / (2 * t * cam.aspect)) + 40; setFov(fov); camGoal.set(cx, h, cz + h * 0.12); cam.position.lerp(camGoal, 0.12); cam.lookAt(cx, 0, cz); return; }
  const d = S.yawT - S.yaw; S.yaw += d * 0.14; const a = S.yaw;
  const up = py - floorAt(S.px, S.pz), pull = clamp((up - 6) / 20, 0, 1) * (CH && CH.noPull ? 0 : 1), deep = forestAt(S.px, S.pz) >= 4 ? 1 : 0;
  let hh, bk, ahead, fov;
  if (S.view === 1) { hh = 8.5; bk = 11; ahead = 3; fov = 50; }
  else if (S.view === 2) { setFov(60); const fx = Math.sin(S.pdir2 || 0), fz = Math.cos(S.pdir2 || 0); camGoal.set(S.px - fx * 6.2, py + 3.4, S.pz - fz * 6.2); camGoal.y = Math.max(camGoal.y, Hq(camGoal.x, camGoal.z) + 1.5); cam.position.lerp(camGoal, 0.15); cam.lookAt(S.px + fx * 6, py + 1.4, S.pz + fz * 6); return; }
  else { hh = lerp(lerp(22, 17, deep), 46, pull); bk = lerp(lerp(25, 20, deep), 44, pull); ahead = lerp(5, 16, pull); fov = 40; }
  hh *= S.zoom; bk *= S.zoom; setFov(fov);
  const tx = S.px - Math.sin(a) * ahead, tz = S.pz - Math.cos(a) * ahead, ty = py + 1;
  camGoal.set(tx + Math.sin(a) * bk, ty + hh + S.camLift, tz + Math.cos(a) * bk);
  const gh = Hq(camGoal.x, camGoal.z) + 4; if (camGoal.y < gh) camGoal.y = gh;
  cam.position.lerp(camGoal, 0.1);
  /* 언덕이 나를 가리면 시점을 들어 올린다 */
  if (!losClear(cam.position.x, cam.position.y, cam.position.z, S.px, py + 1.2, S.pz, 3)) S.camLift = Math.min(40, S.camLift + dt * 30); else S.camLift = Math.max(0, S.camLift - dt * 8);
  const sh = fx.shake; look.set(tx + (Math.random() - 0.5) * sh, ty + (Math.random() - 0.5) * sh, tz); cam.lookAt(look);
  setNear(Math.max(0.5, cam.position.distanceTo(v3.set(S.px, py + 1, S.pz)) * 0.4));   /* 나와 시점 사이의 나무는 잘라 보이게 */
}
function setNear(n) { if (Math.abs(cam.near - n) > 0.3) { cam.near = n; cam.updateProjectionMatrix(); } }
function setFov(f) { if (cam.fov !== f) { cam.fov = f; cam.updateProjectionMatrix(); } }

/* ───── 할 일 목록(다섯 해 방식: 꼭 할 일 / 골라서 할 일) ───── */
const doneSeen = {};
function refreshTasks() { TL = CH && CH.tasks ? CH.tasks() : []; for (const t of TL) { t.ok = t.done(); t.lost = !t.ok && t.gone && t.gone(); const key = S.ch + '|' + t.id; if (t.ok && doneSeen[key] === false) { const p = $('mpop'); if (p) { p.innerHTML = `✅ 해냈다!<small>${t.t}</small>`; p.classList.add('on'); setTimeout(() => p.classList.remove('on'), 1700); } SFX.good(); } doneSeen[key] = t.ok; }
  const live = (t) => !t.ok && !t.lost && !t.wait && (!t.can || t.can()) && t.at && t.at();
  curTask = TL.find((t) => t.req && live(t)) || TL.find((t) => !t.req && live(t)) || TL.find((t) => t.req && !t.ok && !t.lost && t.wait) || null; }
function drawTodo() { const el = $('todo'); if (!CH) { el.innerHTML = ''; return; } const req = TL.filter((t) => t.req), opt = TL.filter((t) => !t.req);
  const line = (t) => `<div class="${t.ok ? 'on' : t === curTask ? 'now' : t.lost ? 'on' : ''}">${t.ok ? '✅' : t === curTask ? '▶' : t.lost ? '✖' : t.req ? '⬜' : '◻'} ${t.t}${t.n && !t.ok ? ` ${t.n()[0]}/${t.n()[1]}` : ''}</div>`;
  const html = `<div class="main">⭐ ${CH.goal}</div>` + req.map(line).join('') + (opt.length ? `<div class="sub">골라서 할 일</div>` + opt.map(line).join('') : '');
  if (el._h !== html) { el.innerHTML = html; el._h = html; } }
const proxy = { get t() { return curTask ? curTask.t : (CH && CH.idle) || '기다린다'; }, how: () => (curTask ? (typeof curTask.how === 'function' ? curTask.how() : curTask.how) : '') + '<i hidden>' + (curTask ? curTask.id + S.ch : '') + '</i>', n: () => (curTask && curTask.n ? curTask.n() : null), done: () => false, at: () => (curTask && !S.scoping ? curTask.at() : null), tag: () => { const g = curTask && curTask.tag; return typeof g === 'function' ? g() : g || '여기!'; } };
const mis = missions(scene, cam, [proxy], { groundY: (x, z) => Hq(x, z), sound: !MUTE });
function misHead() { const h = mis.card.firstElementChild, req = TL.filter((t) => t.req), txt = CH ? `${CH.place} · ${curTask && !curTask.req ? '골라서 할 일' : `꼭 할 일 ${req.filter((t) => t.ok).length}/${req.length}`}` : ''; if (h.textContent !== txt) h.textContent = txt; }

/* ───── 장 넘기기 · 저장 ───── */
function ctxFor() { return { THREE, scene, cam, S, H: Hq, floorAt, mainD, losClear, slopeAt, forestAt, say, cmd, card, band, pad, pads, put, choose, closeChoice, SFX, army, fx, ppl, me, path, smokeColumn, groundRing, groundFan, art, artInst, putArt, ART, exposure, setCrouch, sky, sun, hemi, MUTE, NO_TREE,
  mapImg: MIMG, SEED, addTarget: (g) => { targets.push(g); return g; }, endChapter, choosing: () => !!choiceFns, get targets() { return targets; } }; }
function startChapter(i, fromSave) {
  S.ch = i; S.cht = 0; S.det = 0; S.detOn = false; S.said = {}; S.chLog = []; S.workT = 0; S.workKey = ''; S.camLift = 0; S.view = 0; S.zoom = 1; setCrouch(false); setScope(false); closeChoice();
  army.reset(); ppl.clear(); clearPads(); targets = []; $('spot').style.display = 'none'; S.mode = 'play'; if (CH && CH.dispose) CH.dispose();
  /* 앞 장이 세운 것(천막·연기·고리·횃불)을 걷는다 — 처음 장을 열기 전의 무대만 남긴다. 빛·안개도 낮의 처음 값으로 */
  if (!BASE) BASE = new Set(scene.children); else for (const o of [...scene.children]) if (!BASE.has(o)) scene.remove(o);
  $('panel').style.display = 'none'; $('cmd').style.opacity = 0; cmdT = 0;
  S.frozen = false; scene.fog.color.set(0xd8d0bc); scene.fog.near = 120; scene.fog.far = 520; hemi.color.set(0xeef0ff); hemi.intensity = 1.25; sun.color.set(0xfff0d0); sun.intensity = 2.3; sky.paint(0x8fb4dc, 0xe8e2d4, 0xffe2b0);
  CH = CHAPTERS[i](ctxFor()); CH.start(fromSave);
  S.yaw = S.yawT = CH.yaw != null ? CH.yaw : -Math.PI / 2; $('time').firstChild.textContent = CH.when + ' ';
  card(CH.when, CH.place + ' — ' + CH.title, 3.6); refreshTasks(); hud(); place(0);
}
function saveGame(next) { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, ch: next, band: S.band, tags: S.tags, at: Date.now() })); } catch (e) { /* 저장 못 해도 판은 그대로 */ } }
function readSave() { try { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return d && d.v === 1 && d.ch >= 0 && d.band ? d : null; } catch (e) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 그대로 */ } }
let LAST = null;
/* ───── 끝 화면(설계 v2 ⑥) — 엿새가 끝났을 때 또는 졌을 때 ───── */
function showFinal(res) {
  const T = S.tags, B = S.band, lost = res.lose, closed = B.net >= 100, wiped = B.troop <= 0, clean = !T.trace_gapsan && T.warn_eorang !== 0 && !T.trace_shigu;
  const end = lost ? { s: 0, h: closed ? '골짜기가 닫혔다' : '더는 싸울 사람이 없다', sub: '졌다' } : B.troop >= 70 && clean ? { s: 3, h: '치고, 사라지고, 지켰다', sub: '★★★' } : B.troop >= 45 ? { s: 2, h: '빠져나왔다', sub: '★★' } : { s: 1, h: '흩어져서, 그래도 나왔다', sub: '★' };
  const why = [T.grade ? `백운평 자리 ${T.grade}등급` : null, T.caught != null ? `백운평에서 추격대 ${Math.round(T.caught * 100)}%를 가둠` : null, T.hongPow != null ? `홍범도 부대의 힘 ${T.hongPow}${T.msgOk === 0 ? ' · 전갈이 늦음' : ''}` : null,
    T.missed != null ? `천수평에서 놓친 기병 ${T.missed}` : null, T.eorangKept != null ? `어랑촌 능선 ${T.eorangKept}/3 지킴` : null, `포위망 ${Math.round(B.net)} · 부대 ${Math.round(B.troop)}`].filter(Boolean);
  const diary = [`20일 — 연기 ${T.smokes || 0}개를 세었다. 사령관은 「여기서 맞는다」고 했다.`, T.caught != null ? `21일 — 백운평. ${T.caught >= 0.95 ? '골짜기가 닫혔다. 모두 숨죽였다가 한꺼번에 쳤다.' : '꼬리가 빠져나가 본대가 일찍 왔다.'}` : null,
    T.eorangKept != null ? `22일 — 어랑촌 고지. ${T.eorangKept === 3 ? '해가 질 때까지 능선 셋을 지켰다.' : '능선이 무너져 흩어져 빠졌다.'}${T.hongCame ? ' 북쪽에서 다른 총소리 — 홍범도 부대였다.' : ''}` : null,
    T.escaped5 ? '23~24일 — 고동하를 따라 걸었다. 배가 고팠다.' : null, T.counter != null ? `26일 새벽 — ${T.counter ? '밤 기습을 되쳤다.' : '밤을 넘겼다.'} 숲 너머로 안도 가는 길이 열렸다.` : null].filter(Boolean);
  const vil = [['갑산촌', T.trace_gapsan == null ? null : T.trace_gapsan ? '흔적이 남았다. 뒤에 일본군이 그 마을을 뒤졌다는 소문이 들려왔다.' : '흔적을 지웠다. 주민들은 산으로 피해 있었다.'],
    ['어랑촌', T.warn_eorang == null ? null : T.warn_eorang ? '주민들에게 산으로 피하라 전했다.' : '주민들에게 알리지 못했다. 밥을 날라 준 그 마을이 마음에 걸린다.'],
    ['쉬구', T.trace_shigu == null ? null : T.trace_shigu ? '흔적이 남았다.' : '흔적을 지우고 떠났다.']].filter((v) => v[1]);
  const chs = TITLES.map((t, i) => `<button class="sec" data-ch="${i}" style="font-size:14px;padding:8px 12px;margin-top:8px">${t}</button>`).join('');
  const html = `<h1>${end.h}<small>${end.sub} · 청산리 — 엿새</small></h1><div class="bands">${['troop', 'net', 'ammo', 'hunger'].map((k) => `<span>${BAND_NAME[k]} <b>${Math.round(B[k])}</b></span>`).join('')}</div>
    <div class="marks">${why.map((w) => `<span class="ok">${w}</span>`).join('')}</div>
    <div class="why"><b>✍ 글 쓰는 이의 기록</b><ul>${diary.map((d) => `<li>${d}</li>`).join('')}</ul></div>
    ${vil.length ? `<div class="why"><b>🏠 마을 소식</b><ul>${vil.map((v) => `<li><b>${v[0]}</b> — ${v[1]}</li>`).join('')}</ul></div>` : ''}
    <div class="hist"><b>역사와 견주기</b><br>1920년 10월 21일부터 26일 무렵까지, 북로 군정서와 홍범도가 이끈 연합 부대가 청산리 일대(백운평·완루구·천수평·어랑촌·고동하 등)에서 열 번 남짓 싸워 크게 이겼다.<br>일본군 피해는 <b>기록마다 크게 다르다</b> — 임시 정부 쪽 기록은 천이백여 명이라 하고, 일본군 자기 기록은 훨씬 적다. 한 숫자로 못 박지 않는다.<br>그 뒤 일본군은 간도의 한인 마을들을 불태우고 많은 사람을 해쳤다(간도 참변). 독립군은 더 북쪽으로 옮겨 갔다 — 이긴 싸움 뒤에도 치른 값이 있었다.<br>싸운 사람들은 농사짓던 사람, 포수, 학생이었다. 총은 멀리서 사 왔고, 밥은 마을이 댔다.<br><small>지휘 계통을 두고 여러 주장이 있다 — 한두 사람이 아닌 「연합 부대」의 싸움이었다. 부대원 이름과 놀이 장치(흔적·거짓 불·고르는 길)는 꾸민 것이다.</small></div>
    <div class="row"><button id="go">처음부터 다시</button></div><div class="row" style="gap:6px"><span style="width:100%;font-size:14px;color:#c9b98a;margin-top:10px">장 골라서 다시</span>${chs}</div>`;
  const o = $('ov'); o.firstElementChild.innerHTML = html; o.style.display = 'flex'; remember(o.firstElementChild); clearSave(); S.mode = 'end';
  $('go').onclick = () => { resumeAudio(); o.style.display = 'none'; S.band = { ...BAND0 }; S.tags = {}; startChapter(0); };
  o.querySelectorAll('[data-ch]').forEach((b) => (b.onclick = () => { resumeAudio(); o.style.display = 'none'; const i = +b.dataset.ch; S.band = { ...BAND0, ...(PRESET[i] || {}) }; S.tags = { ...(PRESET_T[i] || {}) }; startChapter(i); }));
}
/* 장 골라서 할 때 처음 값(앞 장들을 보통으로 한 셈) */
const PRESET = [null, { net: 22, hunger: 42 }, { troop: 98, net: 22, hunger: 42, ammo: 52 }, { troop: 96, net: 34, hunger: 64, ammo: 52 }, { troop: 96, net: 34, hunger: 39, ammo: 82 }, { troop: 77, net: 46, hunger: 41, ammo: 40 }, { troop: 60, net: 66, hunger: 84, ammo: 40 }];
const PRESET_T = [null, { grade: 'B', pickN: 'ga', pickS: 'ra', smokeAll: 1 }, { grade: 'B' }, { msgOk: 1, hongPow: 70 }, { msgOk: 1, hongPow: 70, missed: 1, horse: 1 }, { seen_chase: 1, seen_big: 1 }, { seen_chase: 1, seen_big: 1, seen_north: 1 }];
function endChapter(res) {
  if (S.mode !== 'play') return; S.mode = 'result'; $('spot').style.display = 'none'; setScope(false); setCrouch(false); closeChoice(); $('det').style.display = 'none'; LAST = res;
  let next = S.ch + 1; while (next < CHAPTERS.length && !CHAPTERS[next]) next++; const more = next < CHAPTERS.length && !res.lose, skipped = more ? TITLES.slice(S.ch + 1, next) : [];
  /* 밤이 지난다: 하루가 가면 배고픔 +22 · 포위망 +12(설계 v2 1-1) — 다음 장이 있을 때만 */
  const b0 = { ...S.band }, night1 = more && !CH.sameDay; if (night1) { S.band.hunger = clamp(S.band.hunger + 22, 0, 100); S.band.net = clamp(S.band.net + 12, 0, 100); }
  saveGame(more ? next : 0); if (!more) S.tags.done1 = 1;
  const delta = (k) => { const d = Math.round(S.band[k] - res.b0[k]); return d ? `<b class="${((k === 'troop' || k === 'ammo') ? d < 0 : d > 0) ? 'dn' : 'up'}">${d > 0 ? '+' : ''}${d}</b>` : ''; };
  const bands = `<div class="bands">${['troop', 'net', 'ammo', 'hunger'].map((k) => `<span>${BAND_NAME[k]} ${Math.round(S.band[k])} ${delta(k)}</span>`).join('')}</div>`;
  const marks = res.marks ? `<div class="marks">${res.marks.map((m) => `<span class="${m.ok ? 'ok' : ''}">${m.ok ? '✔' : '✘'} ${m.t}</span>`).join('')}</div>` : '';
  const night = more && !night1 ? `<p style="font-size:15px;color:#c8d0e8">☀ 같은 날 — 곧바로 이어진다${res.night ? ' · ' + res.night : ''}</p>` : more ? `<p style="font-size:15px;color:#c8d0e8">🌙 밤이 지난다 — 배고픔 +${Math.round(S.band.hunger - b0.hunger)} · 포위망 +${Math.round(S.band.net - b0.net)}${res.night ? ' · ' + res.night : ''}${skipped.length ? `<br><small>(${skipped.join(' · ')} 장은 만드는 중이라 건너뛴다)</small>` : ''}</p>` : '';
  const html = `<h1>${res.head}<small>${CH.when} · ${CH.place}</small></h1>${marks}${bands}<ul class="why">${res.lines.map((l) => `<li>${l}</li>`).join('')}</ul>${night}${res.hist ? `<div class="hist">${res.hist}</div>` : ''}`;
  setTimeout(() => {
    const o = $('ov'); o.firstElementChild.innerHTML = html + `<div class="row">${more ? `<button id="go">다음 장 — ${TITLES[next]}</button>` : `<button id="go">엿새를 마치며 →</button><button id="re1" class="sec">이 장만 다시</button>`}</div>`;
    o.style.display = 'flex';
    $('go').onclick = () => { resumeAudio(); if (more) { o.style.display = 'none'; startChapter(next); } else showFinal(res); };
    const thisCh = S.ch; if ($('re1')) $('re1').onclick = () => { resumeAudio(); o.style.display = 'none'; S.band = { ...BAND0, ...(LAST.b0 || {}) }; startChapter(thisCh); };
  }, res.delay != null ? res.delay * 1000 : 1800);
}

/* ───── 한 걸음 ───── */
function update(dt) {
  S.t += dt; sayTick(dt); fx.update(dt);
  if (cmdT > 0) { cmdT -= dt; if (cmdT <= 0) $('cmd').style.opacity = 0; }
  if (cardT > 0) { cardT -= dt; if (cardT <= 0) $('card').style.opacity = 0; }
  if (popT > 0) { popT -= dt; if (popT <= 0) $('pop').style.opacity = 0; }
  if (S.mode !== 'play') { place(dt); return; }
  S.cht += dt;
  /* 나 */
  if (!S.scoping && !S.frozen) {
    let { ix, iz } = ctl.read(dt); const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && !S.crouch && ctl.running();
    if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il);
      const hung = S.band.hunger > 60 ? 0.85 : 1, sp = (S.crouch ? 1.9 : S.running ? 8.4 : 5.0) * hung;
      const nx = clamp(S.px + ix * sp * dt, 4, MAP_W - 4), nz = clamp(S.pz + iz * sp * dt, 4, MAP_H - 4), h0 = Hq(S.px, S.pz), h1 = Hq(nx, nz), stepL = Math.hypot(nx - S.px, nz - S.pz) || 1e-3, grade = (h1 - h0) / stepL;
      const block = (CH && CH.block && CH.block(nx, nz)) || grade > 1.7;   /* 바위벽처럼 가파르면 못 오른다 */
      if (!block) { const slow = grade > 0 ? 1 / (1 + grade * 1.3) : 1; S.px = lerp(S.px, nx, slow); S.pz = lerp(S.pz, nz, slow); } else say('너무 가파르다 — 돌아서 오르자', 'steep', 2);
      S.pdir2 = Math.atan2(ix, iz); S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = S.crouch ? 0.7 : 0.4; S.crouch ? SFX.rustle() : SFX.step(); } }
  } else S.moving = S.running = false;
  /* 장 */
  if (CH) CH.update(dt);
  if (S.mode !== 'play') { place(dt); return; }
  /* 가만히 서서 하는 일 */
  const j = !S.scoping && CH && CH.job ? CH.job() : null;
  if (j && j.key === S.workKey && !S.moving) S.workT += dt; else { S.workT = j && !S.moving ? dt : 0; S.workKey = j ? j.key : ''; }
  S.jobLabel = j ? (S.moving ? j.label + ' — 가만히 서기' : j.label) : '';
  overBar($('work'), cam, S.px, Hq(S.px, S.pz) + 2.6, S.pz, j && S.workT > 0.05 ? S.workT / j.need : null);
  if (j && S.workT >= j.need) { S.workT = 0; S.workKey = ''; j.fn(); refreshTasks(); }
  /* 배고픔 80 넘음: 부대 띠가 샌다(설계 1-1) */
  if (S.band.hunger > 80) { S.leakT = (S.leakT || 0) + dt; if (S.leakT > 60) { S.leakT = 0; band('troop', -1, '배고픔', true); } }
  /* 들킴 */
  const de = $('det'); de.style.display = S.detOn ? 'block' : 'none'; if (S.detOn) { de.querySelector('i').style.width = clamp(S.det, 0, 100) + '%'; de.className = S.det > 75 ? 'hot' : S.det > 50 ? 'warn' : ''; de.querySelector('.l').textContent = S.det >= 100 ? '! 들켰다' : S.det > 50 ? '? 적이 이쪽을 본다 — 엎드려!' : S.crouch ? '들킴 — 엎드려 있다' : '들킴'; }
  /* 심장 박자: 조임 */
  S.beatT -= dt; const ten = clamp(Math.max(S.tension, S.detOn ? S.det / 100 : 0), 0, 1); if (ten > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.42, ten); SFX.beat(0.05 + ten * 0.2); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + ten * 120}px ${30 + ten * 60}px rgba(170,30,20,${ten * 0.38})`;
  if (Math.floor(S.cht * 4) !== Math.floor((S.cht - dt) * 4)) refreshTasks();
  place(dt);
}
function place(dt) {
  const py = Hq(S.px, S.pz);
  me.position.set(S.px, py + (S.crouch ? 0.26 : 0), S.pz); me.rotation.y = S.scoping ? S.scopeYaw : S.pdir2 || 0; me.rotation.x = S.crouch ? 1.42 : 0; ppl.walkAnim(me, S.t * (S.running ? 16 : S.crouch ? 6 : 10), S.moving);
  if (me.userData.scope) me.userData.scope.visible = S.scoping; me.visible = !S.scoping;
  meRing.position.set(S.px, py + 0.15, S.pz); meRing.visible = S.mode === 'play' && S.view !== 3;
  ppl.update(dt, S.t, S.px, S.pz);
  /* 꼬리표 */
  ti = 0; const play = S.mode === 'play';
  if (play && CH && CH.tags && !S.scoping) CH.tags(put);
  if (play && S.view === 3) put(S.px, py + 4, S.pz, '📍 나');
  if (play && S.scoping) scopeUpdate(dt || 0);
  for (let i = ti; i < tags.length; i++) tags[i].style.display = 'none';
  ppl.drawTalk(cam, dt || 0.016, play && !S.scoping, S.px, S.pz);
  for (const k in pads) if (pads[k].m.visible) pads[k].m.material.opacity = 0.6 + 0.3 * Math.sin(S.t * 4);
  $('jobl').textContent = play ? S.jobLabel : ''; $('jobl').style.display = play && S.jobLabel ? 'block' : 'none';
  /* 해 · 그림자 */
  const fxp = Math.round(S.px / 6) * 6, fzp = Math.round(S.pz / 6) * 6; sun.position.set(fxp + (CH && CH.sunOff ? CH.sunOff[0] : -50), py + (CH && CH.sunOff ? CH.sunOff[1] : 80), fzp + (CH && CH.sunOff ? CH.sunOff[2] : 40)); sun.target.position.set(fxp, py, fzp);
  sky.update(cam); if (Math.floor(S.t * 4) !== Math.floor((S.t - (dt || 0.016)) * 4) || !dt) forest.lod(S.px, S.pz, S.scoping ? 2.4 : 1);
  if (play && CH) { const len = CH.len || 1, k = clamp(1 - S.cht / len, 0, 1); $('time').querySelector('i').style.width = (CH.timeK ? CH.timeK() : k) * 100 + '%'; }
}

/* ───── 첫 화면 ───── */
hud(); S.mode = 'title';
{ const d = readSave(); const row = document.querySelector('#ov .row');
  if (d) { const b = document.createElement('button'); b.id = 'cont'; b.textContent = `이어서 하기 — ${TITLES[d.ch] || '처음'}`; row.insertBefore(b, $('go')); $('go').textContent = '처음부터'; $('go').classList.add('sec');
    b.onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.band = { ...BAND0, ...d.band }; S.tags = { ...d.tags }; startChapter(CHAPTERS[d.ch] ? d.ch : 0, true); }; } }
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; const i = +(Q.get('ch') || 0); S.band = { ...BAND0, ...(PRESET[i] || {}) }; S.tags = { ...(PRESET_T[i] || {}) }; startChapter(i); };
canvas.addEventListener('pointerdown', () => { if (cardT > 0) { cardT = 0.01; } });

/* ───── 돌림 ───── */
let last = performance.now();
function frame(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; step(dt); requestAnimationFrame(frame); }
function step(dt) { update(dt); army.update(dt, S.t); view(dt); mis.update(dt, S.mode === 'play' && !S.scoping); misHead(); drawTodo(); if (Math.floor(S.t * 10) !== Math.floor((S.t - dt) * 10)) drawMini(); renderer.render(scene, cam); }
requestAnimationFrame(frame);

/* ───── 자동 판 고리(설계 ⑨): window.__scene ───── */
window.__scene = { S, ctl, army, fx, ppl, pads, forest, info: () => { renderer.render(scene, cam); const r = renderer.info.render; return { calls: r.calls, tris: r.triangles }; }, get CH() { return CH; }, get cur() { return curTask; }, get TL() { return TL; }, get targets() { return targets; }, get LAST() { return LAST; },
  go(ch = 0, band, tags) { $('ov').style.display = 'none'; S.band = { ...BAND0, ...(band || {}) }; S.tags = { ...(tags || {}) }; startChapter(ch); cardT = 0.01; },
  step(sec, dt = 1 / 30) { for (let i = 0; i < sec / dt; i++) { update(dt); army.update(dt, S.t); view(dt); mis.update(dt, S.mode === 'play'); } },
  frame(n = 1) { for (let i = 0; i < n; i++) step(1 / 30); },
  settle() { for (let i = 0; i < 60; i++) view(1 / 30); },
  next() { const b = document.querySelector('#ov #go'); if (b && $('ov').style.display !== 'none') b.click(); },
  key(code, down) { ctl.keys[code] = down; }, crouch: setCrouch, scope: setScope, signal: doSignal, pick, refreshTasks, saveGame, readSave, clearSave, H: Hq, losClear, exposure,
  view(n) { S.view = n; } };
