/* 줄 세우기 틀 「배 기차 떠나보내기」(3D, T06) — 긴 선착장에 숫자 팻말을 단 나룻배들이 한 줄로 묶여 있는데 군데군데가 비었다(빈 자리 = 부표).
 * 먼바다에서 뒤섞여 들어오는 배를 빈 자리에 끼우고 종을 치면, 앞 배가 줄을 당기며 앞에서부터 하나씩 세어 나간다. 차례가 맞으면 뱃고동이 울리고 배 기차가 떠난다.
 * 설계: 핸드오프 kedu/math-play-work/T06_줄세우기_틀.md · 정본 kmotion/math-wizard/27_수학놀이터_내용지도와_틀_설계_v1.md(4 · 5절 · 5-9 · 5-10 · 5-11). 규칙 = ./rules.js(화면 없음).
 * 한 나들이 = 낱칸 하나(A08 수의 순서 · A09 거꾸로 세기) · 판 = 문제 셋 · 나들이 = 판 셋. 손: 떠 있는 배를 끌어 부표에 놓는다(「배 누르고 → 부표 누르기」도 같음 · common/drag.js).
 *   끼운 배를 누르면 고리가 풀려 물로 돌아간다(깨끗함 그대로). 종(앞 배)을 눌러야 판정한다 — 세어 나가다 틀린 배는 고리가 툭 풀리고, 빈 자리에서는 부표가 까딱(「여기!」).
 * 걸음 ① 자리 보고 끼우기(부표에 흐린 숫자 · 같은 수의 자리에만 걸림 · 끼우면 앞에서부터 그 배까지 세어 줌) → 걸음 ② 차례 생각해 끼우기(어느 자리에나 걸림 · 종을 쳐야 세어 나감).
 * 사건(rules.js events): 팽팽해지는 밧줄(시계 · 생각하는 동안에만) · 섞는 물결 · 떠내려가는 배 · 깜짝 짐 · 안개 낀 줄(통과 뒤) · 뱃노래. 사건은 줄의 수를 바꾸지 않는다.
 * 누름에는 늘 답이 있다(5-11). 소리는 common/tell.js — 없으면 조용히 넘어간다(세어 나가기는 팻말 반짝임만으로도 읽힌다). 그림은 기성 3D 재료만(./assets · 이름표 ./art.js) — 코드로 그린 것은 밧줄(화면 위 선) · 숫자 팻말(화면 위 그림)뿐. */
import { createStage, THREE, CALM, sleep } from '../common/stage3d.js?v=2';
import { clone as cloneRig } from 'three/addons/utils/SkeletonUtils.js';
import * as A from '../common/ask.js?v=2';
import * as H from '../common/hint.js?v=5';
import { wallet, audio, tone, confetti, grew } from '../common/kit.js?v=8';
import { art } from '../common/art.js?v=9';
import * as E from '../common/ends.js?v=1';
import * as M from '../common/map.js?v=7';
import * as TL from '../common/tell.js?v=2';
import * as NS from '../common/numsign.js?v=3';
import * as DG from '../common/drag.js?v=4';
import { sino } from '../common/say.js?v=3';
import * as R from './rules.js?v=2';
import { ASSETS, MODEL, SCENERY, SCENERY_NAMES, LEAD_TINT, GLOW, ICON } from './art.js?v=1';

// ── 내가 정한 수치(화면 · 움직임 — 준호가 보고 바꾼다). 문제 · 사건 · 시계 수치는 ./rules.js 의 T
const T = { WATER: .0, DECK: .36, BOAT_L: .9, LEAD_L: 1.75, BUOY_L: .46, BELL_H: .42, HENRY_H: .82, CRATE: .3, BOW: 1, LEAD_BOW: -1, GAP0: 1.47,
  WIDE: { P: 1.0, lead: -5.75, lz: .5, dockZ: 2.6, dockW: 1.05, fz: -1.7, fw: 7.6, num: 68, fov: 34, elev: 1.1, tilt: .9 },
  TALL: { P: 1.0, lx: -1.25, lead: -5.05, dockX: -2.25, dockW: .9, fx: [.8, 2.05], fz0: -3.7, fdz: 2.0, num: 50, fov: 46, elev: 1.35, tilt: .22 },
  ENTER_MS: 950, ENTER_GAP: 170, HOOK_MS: 380, BACK_MS: 520, LINE_IN_MS: 750, DEPART_MS: 2600, SHUFFLE_MS: 750, HINT_SWAP: 1.4, TELL_GRACE: 4,
  LIFT: .2, SLACK: .2, PULL: .55, BELL_HIT: 56, NUM_LOW: 50, LOW_FZ: -2.5 };
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const GO = '/math/play/go/';
const WANT = Q.get('cell'), GO_NOW = !WANT || !R.CELLS[WANT];   /* ?cell= 없이 열리면 모형을 불러오기 전에 고르는 화면으로 */
if (GO_NOW) location.replace(GO);
const S = { ready: false, busy: true, active: false, t: 0, oid: 0, cell: null, p: null, res: null, step: 2, ev: {}, ctx: {}, board: null, clock: 0, streak: 0, closed: false, lastAct: 0, back: false, surpriseCarry: false, hist: {}, log: [],
  tall: false, low: false, boats: [], buoys: [], fill: [], today: [], told: {}, hinting: false, hintAt: 0, hintPhase: 0, call: -1, departing: false, drift: null, driftAt: Infinity, shufT: 0, shuffleN: 0, leaveS: 22, horned: false, ends: [] };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 170, fog: [20, 70], shadow: { left: -9, right: 9, top: 7, bottom: -6 }, assets: ASSETS }), { scene, camera } = stage;
const K = {};
const NAMES = [...new Set([...Object.values(MODEL), ...SCENERY_NAMES])];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L = () => S.tall ? T.TALL : T.WIDE;
const easeOut = t => 1 - (1 - t) ** 3;

// ── 놓기: 모형을 길이 len 으로(긴 가로 축을 z 로 돌려) · 바닥 가운데에
function fitLen(g, len, sink = 0){ const o = cloneRig(g.scene); o.updateMatrixWorld(true); let b = new THREE.Box3().setFromObject(o), s0 = b.getSize(V(0, 0, 0)); const w = new THREE.Group(), inner = new THREE.Group(); inner.add(o);
  if (s0.x > s0.z) inner.rotation.y = Math.PI / 2; w.add(inner); w.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(w); s0 = b.getSize(V(0, 0, 0)); inner.scale.multiplyScalar(len / Math.max(.0001, s0.z)); w.updateMatrixWorld(true);
  b = new THREE.Box3().setFromObject(w); const c = b.getCenter(V(0, 0, 0)); inner.position.sub(V(c.x, b.min.y + (b.max.y - b.min.y) * sink, c.z)); stage.shadows(w); return w; }
/** 통을 눕혀(높이 축을 z 로) 길이 len · 물에 sink 만큼 잠기게. */
function lying(g, len, sink){ const o = g.scene.clone(), inner = new THREE.Group(), w = new THREE.Group(); inner.add(o); inner.rotation.x = Math.PI / 2; w.add(inner); w.updateMatrixWorld(true); let b = new THREE.Box3().setFromObject(w); inner.scale.multiplyScalar(len / Math.max(.0001, b.max.z - b.min.z)); w.updateMatrixWorld(true);
  b = new THREE.Box3().setFromObject(w); const c = b.getCenter(V(0, 0, 0)); inner.position.sub(V(c.x, b.min.y + (b.max.y - b.min.y) * sink, c.z)); stage.shadows(w); return w; }
/** 키 h 로 맞춰 바닥 가운데에(사람 · 종 · 상자). */
function fitH(g, h, ry = 0){ const o = cloneRig(g.scene); o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o), s = h / Math.max(.0001, b.max.y - b.min.y); o.scale.multiplyScalar(s); o.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(o), c = b2.getCenter(V(0, 0, 0)); o.position.sub(V(c.x, b2.min.y, c.z)); const w = new THREE.Group(); w.add(o); w.rotation.y = ry; stage.shadows(w); return w; }
const sizeOf = o => { o.updateMatrixWorld(true); return new THREE.Box3().setFromObject(o).getSize(V(0, 0, 0)); };
const rigH = rig => { rig.scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(rig.scene); return Math.max(.0001, b.max.y - b.min.y); };

// ── 짓기
let lead = null, bell = null, henry = null; const docks = { WIDE: null, TALL: null }, scen = { WIDE: [], TALL: [] };
async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); }));
  /* 끄는 배(앞 배) — 몸통에 빛깔 · 종을 갑판에 */
  lead = { g: new THREE.Group(), body: fitLen(K[MODEL.lead], T.LEAD_L, .28) }; lead.g.add(lead.body); lead.body.rotation.y = T.LEAD_BOW < 0 ? Math.PI : 0; lead.body.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.lerp(new THREE.Color(LEAD_TINT), .28); } }); scene.add(lead.g);
  { const top = new THREE.Box3().setFromObject(lead.body).max.y; bell = fitH(K[MODEL.bell], T.BELL_H); bell.position.set(0, Math.max(.18, top * .55), 0); lead.g.add(bell); }
  /* 칸 배(나룻배) 열여섯 · 부표 아홉 */
  for (let k = 0; k < 16; k++) S.boats.push(boatObj(k));
  for (let i = 0; i < 9; i++) S.buoys.push(buoyObj(i));
  /* 헨리(종 치는 이) */
  { const rig = K[MODEL.keeper]; henry = stage.person(rig, { scale: T.HENRY_H / rigH(rig) }); actPlay(henry, 'Idle'); }
  /* 선착장 · 둘레(가로 · 세로 따로 짓고 화면에 맞는 쪽만 보인다) */
  for (const kind of ['WIDE', 'TALL']) { docks[kind] = dockRow(kind); for (const s of SCENERY[kind]) { const o = stage.put(K[s[0]], s[1], s[2], s[3], s[4], s[5]); o.visible = false; scen[kind].push(o); } }
  stage.onResize = aim; stage.resize();
  const c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); coinsDraw(); wallet.onChange(() => coinsDraw());
  for (const id of ['bellring', 'fog', 'wave']) { const d = document.createElement('div'); d.id = id; document.body.appendChild(d); }
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
  TL.button(on => { S.log.push({ sound: on }); });
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true;
  outing(WANT); }
function coinsDraw(pop){ const c = $('coins'); if (!c) return; const v = `${art(ICON.coin)}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; } if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }
const actOf = (p, base) => Object.keys(p.acts).find(k => k === base || k.endsWith('|' + base)) || null;
const actPlay = (p, base, once) => { const n = actOf(p, base); if (n) stage.play(p, n, once); };

/** 칸 배 하나: 나룻배(모형) + 숫자 팻말(화면 위 그림). inner 는 물결에 까딱이는 몫(제자리 높이는 g 가 쥔다 — 연달아 눌러도 뜨지 않게). */
function boatObj(k){ const g = new THREE.Group(), inner = new THREE.Group(), body = fitLen(K[MODEL.boat], T.BOAT_L, .1); body.rotation.y = T.BOW < 0 ? Math.PI : 0; inner.add(body); g.add(inner); g.visible = false; scene.add(g);
  const wrap = document.createElement('div'); wrap.className = 'bsign off'; const cv = NS.numsign(1, { px: 64, compact: true }); wrap.appendChild(cv); document.body.appendChild(wrap);
  return { k, g, inner, body, wrap, cv, n: 0, role: 'off', slot: -1, given: false, spot: -1, home: V(0, 0, 0), crate: null, dragging: false, drifting: false, bob: false, snap: false }; }
/** 부표: 통(Prop_Barrel)을 눕혀 띄움 · 걸음 ① 은 흐린 숫자(자리 표시). */
function buoyObj(i){ const g = new THREE.Group(), body = lying(K[MODEL.buoy], T.BUOY_L, .45); g.add(body); g.visible = false; scene.add(g);
  const wrap = document.createElement('div'); wrap.className = 'bsign off'; const cv = NS.numsign(1, { px: 64, compact: true, ghost: true }); wrap.appendChild(cv); document.body.appendChild(wrap);
  return { i, g, body, wrap, cv, n: 0, on: false, ghost: false, wob: false }; }
/** 선착장 한 줄: Env2_Dock_Long 을 이어 붙이고 끝에 계단 · 말뚝. kind = WIDE(가로 — 화면 아래를 따라) | TALL(세로 — 왼쪽 가장자리를 따라) */
function dockRow(kind){ const l = T[kind], grp = new THREE.Group(); grp.visible = false; scene.add(grp);
  const tile = fitLen(K[MODEL.dock], 1, 0), s = sizeOf(tile), k = l.dockW / Math.max(.01, s.x), len = s.z * k;
  const along = kind === 'WIDE' ? [-11, 11] : [-8, 8];
  for (let a = along[0]; a <= along[1]; a += len) { const t = fitLen(K[MODEL.dock], len, 0); const b = new THREE.Box3().setFromObject(t), h = b.max.y - b.min.y; t.position.y = T.DECK - h * .32; place(t, kind, a); grp.add(t); }
  const st = fitLen(K[MODEL.stairs], len * .7, 0); { const b = new THREE.Box3().setFromObject(st); st.position.y = T.DECK - (b.max.y - b.min.y) * .3; } place(st, kind, along[1] + len * .6); grp.add(st);
  for (let a = along[0]; a <= along[1]; a += 2.4) { const p = K[MODEL.pole].scene.clone(); p.scale.setScalar(.8); p.position.y = T.DECK - .7; place(p, kind, a, -l.dockW / 2 - .05); grp.add(stage.shadows(p)); }
  function place(o, kd, a, side = 0){ if (kd === 'WIDE') { o.rotation.y = Math.PI / 2; o.position.x = a; o.position.z = l.dockZ - side; } else { o.position.z = a; o.position.x = l.dockX + side; } }   /* 말뚝은 줄에서 먼 쪽 가장자리 */
  return grp; }

// ── 자리
const dirV = () => S.tall ? V(0, 0, 1) : V(1, 0, 0);   /* 줄의 뒤쪽(앞 배에서 멀어지는 쪽) */
const lineYaw = () => S.tall ? 0 : Math.PI / 2;           /* 배의 앞(이물)이 앞 배 쪽을 본다 */
const leadHome = () => { const l = L(); return S.tall ? V(l.lx, T.WATER, l.lead) : V(l.lead, T.WATER, l.lz); };
const slotPos = i => { const l = L(), h = leadHome(), d = dirV(); return h.clone().add(d.multiplyScalar(T.GAP0 + i * l.P)); };
/** 떠 있는 배 자리 n 개: 가로 = 줄 위쪽 물 한가운데 한 줄(번갈아 앞뒤로) · 전화기 세로 = 오른쪽 물 두 줄. */
function spots(n){ const l = L(), out = [];
  if (!S.tall) { const w = Math.min(l.fw + (S.low ? 1.6 : 0), n * (S.low ? 1.7 : 1.5)), fz = S.low ? T.LOW_FZ : l.fz; for (let k = 0; k < n; k++) out.push(V(S.cx - w / 2 + w * (k + .5) / n, T.WATER, fz + (S.low ? 0 : n > 3 ? (k % 2 ? .16 : -.2) : (k % 2 ? .1 : -.1)))); return out; }   /* 낮은 가로 화면은 한 줄로 · 조금 더 뒤에(줄 팻말과 겹치지 않게) */
  for (let k = 0; k < n; k++) { const col = k % 2, row = Math.floor(k / 2); out.push(V(l.fx[col], T.WATER, l.fz0 + row * l.fdz + (col ? .5 : 0))); } return out; }

// ── 카메라: 줄 · 떠 있는 배 · 선착장이 다 들어오게(팻말 몫까지) · 맨 위는 띠 바로 아래
function aim(w, h){ const tall = h > w * 1.05, was = S.tall; S.tall = tall; S.low = !tall && h < 560; const l = L(); camera.fov = l.fov; camera.aspect = w / h;
  for (const kd of ['WIDE', 'TALL']) { const on = (kd === 'TALL') === tall; if (docks[kd]) docks[kd].visible = on; scen[kd].forEach(o => { o.visible = on; }); }
  const h0 = leadHome(), e8 = slotPos(8), d = dirV();
  S.cx = S.tall ? 0 : ((h0.x - T.LEAD_L / 2) + (e8.x + T.BOAT_L / 2)) / 2;
  layout(was !== tall);
  const sh = NS.size(numPx(), true).h, tb = trayBottom(), top = tb + 8, bottom = h - (tall ? 16 : S.low ? 30 : 10), mx = tall ? 6 : 14;
  /* 지킬 점들: [점, 위 몫 px, 아래 몫 px, 왼 몫, 오른 몫] */
  const pts = tall ? [[V(l.lx, .5, l.lead - T.LEAD_L / 2 - .1), 6, 0, 0, 0], [V(l.lx, 0, e8.z + T.BOAT_L / 2 + .15), 0, 6, 0, 0], [V(l.dockX - l.dockW / 2, T.DECK, 0), 0, 0, 2, 0], [V(l.fx[1] + .3, 0, l.fz0), 0, 0, 0, NS.size(numPx(), true).w / 2 + 4], [V(l.fx[0], .3, l.fz0), sh + 8, 0, 0, 0]]
    : [[V(h0.x - T.LEAD_L / 2 - .1, 0, l.lz), 0, 0, 4, 0], [V(e8.x + T.BOAT_L / 2 + .1, 0, l.lz), 0, 0, 0, 4], [V(S.cx, .3, (S.low ? T.LOW_FZ : l.fz) - .35), sh + 10, 0, 0, 0], S.low ? [V(S.cx, 0, l.lz + .35), 0, 4, 0, 0] : [V(S.cx, T.DECK, l.dockZ + l.dockW / 2 + .1), 0, 6, 0, 0], [V(h0.x, S.low ? .3 : 1.0, S.low ? l.lz : l.dockZ), 8, 0, 0, 0]];   /* 낮은 가로 화면은 선착장 앞끝까지 넣지 않는다 */
  const tz = tall ? (l.lead + e8.z) / 2 : S.low ? (T.LOW_FZ + l.lz) / 2 : (l.fz + l.dockZ) / 2, tx = S.cx; let dist = tall ? 9 : 8;
  const box = () => { let a = 1e9, b = -1e9, c = 1e9, e = -1e9; for (const [p, pt, pb, pl, pr] of pts) { const q = p.clone().project(camera), x = (q.x + 1) / 2 * w, y = (1 - q.y) / 2 * h; a = Math.min(a, x - pl); b = Math.max(b, x + pr); c = Math.min(c, y - pt); e = Math.max(e, y + pb); } return { l: a, r: b, t: c, b: e }; };
  for (let k = 0; k < 60; k++) { camera.position.set(tx, dist * l.elev, tz + dist * l.tilt); camera.lookAt(tx, 0, tz); camera.clearViewOffset(); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const bx = box(); if (bx.r - bx.l <= w - 2 * mx && bx.b - bx.t <= bottom - top) break; dist *= 1.04; }
  const bx = box(), dx = (bx.l + bx.r) / 2 - w / 2, dy = top - bx.t; camera.setViewOffset(w, h, dx, -dy, w, h); camera.updateProjectionMatrix(); camera.updateMatrixWorld();   /* 가로는 가운데로 · 맨 위는 띠 바로 아래로 */
  S.pitch = pitchPx(); S.boats.forEach(signDraw); S.buoys.forEach(buoySign); if (S.ready) setTimeout(tellPlace, 80); }   /* 화면을 돌리면 한 줄 안내도 새 자리로(팻말이 한 장면 뒤에 옮겨진 다음) */
function trayBottom(){ const t = $('tray'), r = t && t.classList.contains('on') ? t.getBoundingClientRect() : null; return r && r.height ? r.bottom : (S.tall ? 104 : 116); }
/** 화면이 바뀌면 자리를 새로(움직이는 중이면 끝난 뒤 맞춤). */
function layout(flip){ const yaw = lineYaw(); placeLead(); placeHenry();
  const sp = spots(S.nSpots || floats().length);
  for (const b of S.boats) { if (b.role === 'off') continue; if (!b.given && sp[b.spot]) b.home = sp[b.spot];   /* 떠 있던 배의 집(끼운 배도 — 빼면 새 집으로) */
    if (b.role === 'line') { b.g.rotation.y = yaw; if (S.departing) continue; const to = slotPos(b.slot); if (moving(b.g.position)) b.snap = true; else b.g.position.set(to.x, T.WATER, to.z); continue; }
    if (flip) b.g.rotation.y = yaw + (b.k % 3 - 1) * .12; if (b.dragging || b.drifting) continue; if (moving(b.g.position)) b.snap = true; else b.g.position.set(b.home.x, T.WATER, b.home.z); }
  for (const u of S.buoys) { if (!u.on) continue; const to = slotPos(u.i); u.g.rotation.y = yaw; if (moving(u.g.position)) u.snap = true; else u.g.position.set(to.x, T.WATER, to.z); } }   /* 부표도 움직이는 중(줄 들어옴 · 돌아옴)이면 끝난 뒤 새 자리로 */
const moving = o => stage.tweens.some(w => w.o === o);
function placeLead(){ if (!lead || S.departing) return; const h = leadHome(); lead.g.rotation.y = lineYaw(); lead.g.position.set(h.x, h.y, h.z); }
function placeHenry(){ if (!henry) return; const l = L(), h = leadHome(); if (S.tall) { henry.obj.position.set(l.dockX + .05, T.DECK, h.z + .15); henry.obj.rotation.y = Math.PI / 2 - .5; } else { henry.obj.position.set(h.x + .35, T.DECK, l.dockZ - .1); henry.obj.rotation.y = -.25; } }

// ── 팻말(화면 위 그림 — 배를 따라다닌다)
const numPx = () => S.tall ? T.TALL.num : S.low ? T.NUM_LOW : T.WIDE.num;
/** 줄의 팻말(전화기 세로): 칸 사이보다 크지 않게 — 390×844 는 50 그대로 · 높이가 낮은 전화기만 줄어든다(아홉 칸이 한 화면에 들어오는 것이 먼저). */
const linePx = () => S.tall && S.pitch ? Math.max(32, Math.min(T.TALL.num, Math.floor(S.pitch / 1.18))) : numPx();
function signDraw(b){ if (b.role === 'off') { b.wrap.classList.add('off'); return; } NS.paint(b.cv, b.n, { px: b.role === 'line' ? linePx() : numPx(), compact: true }); b.wrap.classList.remove('off'); b.wrap.classList.toggle('side', S.tall && b.role === 'line'); }
function buoySign(u){ const on = u.on && u.ghost; u.wrap.classList.toggle('off', !on); if (on) { NS.paint(u.cv, u.n, { px: linePx(), compact: true, ghost: true }); u.wrap.classList.toggle('side', S.tall); } }
const anchorOf = (o, side) => side ? o.position.clone().add(V(.24, .22, 0)) : o.position.clone().add(V(0, .3, 0));
function signPlace(wrap, o, side){ if (wrap.classList.contains('off')) return; const q = stage.screenOf(anchorOf(o, side)); wrap.style.left = q.x + 'px'; wrap.style.top = q.y + 'px'; }
const rectOf = el => (el && !el.classList.contains('off') ? el.getBoundingClientRect() : null);
const BOB_MS = { here: 1600, go: 1300 };   /* 부표 「여기!」 세 번 · 섞는 물결 띠가 화면을 다 지나가기까지 */
function bobEl(el, cls = 'bob'){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); clearTimeout(el._bobT); el._bobT = setTimeout(() => el.classList.remove(cls), BOB_MS[cls] || 500); }

// ── 배 · 부표 · 종
const floats = () => S.boats.filter(b => b.role === 'float');
const lineBoats = () => S.boats.filter(b => b.role === 'line');
const boatAt = i => S.boats.find(b => b.role === 'line' && b.slot === i) || null;
const freeBoat = () => S.boats.find(b => b.role === 'off');
const full = () => !!S.p && S.p.holes.every(i => S.fill[i] != null);
const bellPos = () => bell ? bell.getWorldPosition(V(0, 0, 0)).add(V(0, T.BELL_H * .5, 0)) : null;
const bellAt = () => { const p = bellPos(); return p ? stage.screenOf(p) : null; };
const boatScreen = b => stage.screenOf(b.g.position.clone().add(V(0, .12, 0)));
/** 배 한 척의 화면 길이(px). */
const boatPx = b => { const d = dirV(), c = b.g.position, a = stage.screenOf(c.clone().addScaledVector(d, -T.BOAT_L / 2)), e = stage.screenOf(c.clone().addScaledVector(d, T.BOAT_L / 2)); return Math.hypot(a.x - e.x, a.y - e.y); };
/** 배를 집는 타원: 배와 그 팻말을 함께(팻말을 눌러도 배가 집힌다). */
function boatHit(b){ const c = boatScreen(b), r = rectOf(b.wrap), hl = Math.max(26, boatPx(b) / 2 + 6); if (!r) return { x: c.x, y: c.y, rx: hl, ry: 30 };
  const top = Math.min(r.top, c.y - 18), bot = Math.max(c.y + 22, r.bottom), left = Math.min(r.left, c.x - hl), right = Math.max(r.right, c.x + hl); return { x: (left + right) / 2, y: (top + bot) / 2, rx: (right - left) / 2 + 4, ry: (bot - top) / 2 + 4 }; }
function bobBoat(b){ if (b.bob) return; b.bob = true; stage.tween(b.inner.position, { y: .16 }, 130).then(() => stage.tween(b.inner.position, { y: 0 }, 170)).then(() => { b.bob = false; b.inner.position.y = 0; }); bobEl(b.wrap); }
function bellWobble(){ if (!bell || moving(bell.rotation)) return; stage.tween(bell.rotation, { z: .32 }, 110).then(() => stage.tween(bell.rotation, { z: -.26 }, 150)).then(() => stage.tween(bell.rotation, { z: .12 }, 130)).then(() => stage.tween(bell.rotation, { z: 0 }, 150)); }
function buoyWob(u, n = 3){ if (u.wob) return Promise.resolve(); u.wob = true; let ch = Promise.resolve(); for (let k = 0; k < n; k++) ch = ch.then(() => stage.tween(u.g.rotation, { z: .38 }, 150)).then(() => stage.tween(u.g.rotation, { z: -.38 }, 200)).then(() => stage.tween(u.g.rotation, { z: 0 }, 150));
  return ch.then(() => { u.wob = false; u.g.rotation.z = 0; }); }

// ── 띠 · 소리
function trayDraw(){ A.trayClear(); const t = $('tray'), p = S.p; if (!p) return; const text = S.closed ? p.run.join(', ') : R.CELLS[p.cell].dir > 0 ? '빈 곳에 알맞은 수를 놓아요' : `${p.run[0]}부터 거꾸로 세어요`;
  const shown = !S.closed && S.fogOn && p.cell === 'A09' ? '거꾸로 세어요' : text;   /* A09 안개: 띠가 시작 수를 말하지 않음 — 떠날 때 안개가 걷히며 줄의 수가 드러남 */
  t.innerHTML = `<i class="w"${S.closed ? ' style="color:#ffd34d"' : ''}>${shown}</i>`; t.className = 'on'; const room = innerWidth * .96; t.style.fontSize = ''; if (t.offsetWidth > room) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room / t.offsetWidth) + 'px'; }
function firstLine(){ const p = S.p; if (!p) return ''; if (S.step === 1) return '떠 있는 배를 끌어서 같은 수의 빈 자리에 끼워 줘.'; return R.CELLS[p.cell].dir > 0 ? '떠 있는 배를 끌어서 빈 자리에 끼우고, 다 되면 종을 눌러 줘.' : '거꾸로 세는 줄이야. 배를 끌어서 차례로 끼우고 종을 눌러 줘.'; }
const hornShort = () => { tone(165, .2, 'sawtooth', .06); tone(165, .2, 'sawtooth', .06, .32); };
const hornLong = () => { tone(131, 1.5, 'sawtooth', .07, 0, 123); tone(196, 1.5, 'triangle', .04); };
const ding = () => [1046, 1318].forEach((f, i) => tone(f, .5, 'sine', .1, i * .12));
const click = () => { tone(1100, .05, 'square', .05); tone(1500, .04, 'square', .04, .05); };
/** 한 줄 안내 자리: 팻말 · 배 · 종 · 띠를 가리지 않는 곳(가로 = 아래 가운데 쪽 · 세로 = 오른쪽 아래 쪽). */
function tellPlace(){ const tl = $('tell'); if (!tl || !tl.classList.contains('on')) return; const w = innerWidth, h = innerHeight;
  let maxW = S.low ? Math.max(170, w * .26) : Math.min(w * .92, 560); if (S.tall) { let lr = 0; for (const b of lineBoats()) { const r = rectOf(b.wrap); if (r) lr = Math.max(lr, r.right); } for (const u of S.buoys) { const r = rectOf(u.wrap); if (r) lr = Math.max(lr, r.right); } maxW = Math.max(170, w - Math.max(lr, w * .3) - 14); }
  Object.assign(tl.style, { maxWidth: maxW + 'px', fontSize: S.tall || S.low ? '1.02rem' : '', bottom: 'auto', transform: 'none' }); const tw = tl.offsetWidth, th = tl.offsetHeight, keys = keyRects(), tb = trayBottom();
  const pref = S.tall ? { x: w - tw - 10, y: h - th - 90 } : { x: (w - tw) / 2, y: h - th - 40 }; let best = null, s0 = Infinity;
  for (let y = Math.min(tb + 6, 58); y <= h - th - 6; y += 10) for (let x = 6; x <= w - tw - 6; x += 12) { let ov = 0; for (const r of keys) { const ix = Math.max(0, Math.min(x + tw, r.right) - Math.max(x, r.left)), iy = Math.max(0, Math.min(y + th, r.bottom) - Math.max(y, r.top)); ov += ix * iy; }
    const sc = ov * 50 + Math.hypot(x - pref.x, y - pref.y); if (sc < s0) { s0 = sc; best = { x, y }; } }
  if (best) Object.assign(tl.style, { left: best.x + 'px', top: best.y + 'px' }); S.log.push({ tellAt: best }); }
/** 가리면 안 되는 것들의 화면 네모. */
function keyRects(){ const out = []; const add = r => { if (r && r.width > 0) out.push(r); };
  for (const b of S.boats) if (b.role !== 'off') { add(rectOf(b.wrap)); const c = boatScreen(b), hl = boatPx(b) / 2 + 8; out.push({ left: c.x - hl, right: c.x + hl, top: c.y - 22, bottom: c.y + 22 }); if (b.role === 'float') { const q = boatHit(b); out.push({ left: q.x - q.rx, right: q.x + q.rx, top: q.y - q.ry, bottom: q.y + q.ry }); } }
  for (const u of S.buoys) if (u.on) { add(rectOf(u.wrap)); const c = stage.screenOf(u.g.position); out.push({ left: c.x - 30, right: c.x + 30, top: c.y - 26, bottom: c.y + 26 }); }
  const bp = bellAt(); if (bp) out.push({ left: bp.x - 50, right: bp.x + 50, top: bp.y - 50, bottom: bp.y + 50 });
  for (const id of ['tray', 'marbles', 'lanterns', 'coins', 'snd', 'note']) { const e = $(id); if (e && getComputedStyle(e).display !== 'none') add(e.getBoundingClientRect()); } add(document.querySelector('.back') && document.querySelector('.back').getBoundingClientRect());
  return out; }

// ── 끌어 놓기(common/drag.js): 집는 것 = 떠 있는 배 · 놓을 곳 = 빈 자리(부표)
const canvas = $('c');
const sources = () => { if (!S.p) return []; return floats().filter(b => b.g.visible).map(b => ({ id: b.k, ...boatHit(b) })); };
const targets = () => { if (!S.p) return []; const out = []; for (const i of S.p.holes) { if (S.fill[i] != null) continue; const u = S.buoys[i], c = stage.screenOf(u.g.position), r = rectOf(u.wrap), half = Math.max(30, pitchPx() * .46);
    const rect = S.tall ? { left: c.x - half, right: Math.max(c.x + half, r ? r.right : 0), top: c.y - half, bottom: c.y + half } : { left: c.x - half, right: c.x + half, top: Math.min(c.y - half, r ? r.top : 1e9), bottom: c.y + half * .8 }; out.push({ id: i, x: c.x, y: c.y, rect }); }
  return out; };
/** 줄 칸 사이(px) — 전화기 세로는 56 이상. */
const pitchPx = () => { const a = stage.screenOf(slotPos(3)), b = stage.screenOf(slotPos(4)); return Math.hypot(a.x - b.x, a.y - b.y); };
/** 종 누르는 반경: 56px · 맨 앞 칸과 가까운 화면(작은 전화기)에서는 맨 앞 칸을 덮지 않게 줄어든다. */
const bellR = () => { const bp = bellAt(); if (!bp) return T.BELL_HIT; const s0 = stage.screenOf(slotPos(0)); return Math.max(26, Math.min(T.BELL_HIT, Math.hypot(s0.x - bp.x, s0.y - bp.y) - pitchPx() * .5)); };
const hitD = (h, x, y) => Math.hypot((x - h.x) / h.rx, (y - h.y) / h.ry);
/** 끼운 배(뺄 수 있는 것) — 떠 있는 배의 집는 곳과 겹치면 더 가까운 쪽(떠 있는 배가 더 가까우면 빼지 않는다). */
const placedAt = (x, y) => { let best = null, d0 = 1; for (const b of lineBoats()) { if (b.given) continue; const d = hitD(boatHit(b), x, y); if (d <= d0) { d0 = d; best = b; } } if (!best) return null;
  for (const f of floats()) if (f.g.visible && hitD(boatHit(f), x, y) < d0) return null; return best; };
const DRAG = DG.drag(canvas, { R: () => R.T.SNAP_R, sources, targets,
  claim: ({ x, y, armed }) => { if (armed != null && targets().some(t => t.rect && x >= t.rect.left && x <= t.rect.right && y >= t.rect.top && y <= t.rect.bottom)) return false;   /* 든 채 놓을 곳(부표 네모) 누름은 끼우기가 먼저(종 · 끼운 배보다) */
    const b = placedAt(x, y); if (b) { audio(); touch(); H.ripple(x, y); unhook(b); return true; }   /* 끼운 배를 누르면 고리가 풀려 물로(깨끗함 그대로) — 종보다 먼저 */
    const bp = bellAt(); if (bp && Math.hypot(x - bp.x, y - bp.y) <= bellR()) { audio(); touch(); H.ripple(x, y); if (DRAG.armed() != null) DRAG.disarm(); ring(); return true; }   /* 종 = 「다 채웠어요 · 떠나요」 */
    return false; },
  enabled: () => S.ready && S.active && !S.busy && !S.closed && !E.homeOpen(),
  onBusy: ({ x, y }) => { audio(); S.lastAct = S.t; H.ripple(x, y); S.log.push({ ignored: S.active ? 'busy' : 'idle' }); },
  onArm: id => { audio(); touch(); const b = S.boats[id]; clearArmed(); S.log.push({ arm: id, n: b.n }); if (b.drifting) catchDrift(b); bobBoat(b); b.wrap.classList.add('armed'); tone(600, .07, 'triangle', .06); bobTargets(); },
  onDisarm: id => { const b = S.boats[id]; if (b) b.wrap.classList.remove('armed'); },
  onDragStart: id => { audio(); touch(); const b = S.boats[id]; S.log.push({ dragStart: id, n: b.n }); if (b.drifting) catchDrift(b, true); b.dragging = true; b.grab = null; stopTweens(b.g.position); tone(520, .06, 'triangle', .05); },
  onMove: (id, x, y) => { const b = S.boats[id]; if (!b || !b.dragging) return; if (!b.grab) { const c = boatScreen(b); b.grab = { x: c.x - x, y: c.y - y }; } const w = waterAt(x + b.grab.x, y + b.grab.y); if (w) b.g.position.set(w.x, T.LIFT, w.z); },
  onHover: id => { if (id != null) { const u = S.buoys[id]; if (u) { buoyWob(u, 1); bobEl(u.wrap); } } },
  onCancel: (id, at) => { touch(); const b = S.boats[id]; S.log.push({ cancel: id }); if (at) H.ripple(at.x, at.y); tone(300, .1, 'sine', .05); if (b) { b.dragging = false; goHomeBoat(b); } },
  onTap: ({ x, y, target, armed }) => { audio(); touch(); tapOther(x, y, target, armed); },
  onDrop: ({ from, to, how }) => { audio(); touch(); const b = S.boats[from]; if (b) b.dragging = false; hook(from, to, how); } });
function touch(){ S.lastAct = S.t; H.hide(); S.hinting = false; }
/** 「든」 빛을 모두 끈다(다른 배를 들거나 · 놓침 · 문제가 바뀔 때). */
function clearArmed(){ for (const b of S.boats) b.wrap.classList.remove('armed'); }
const waterAt = (x, y) => { const r = stage.pointerRay({ clientX: x, clientY: y }), o = V(0, 0, 0); return r.ray.intersectPlane(new THREE.Plane(V(0, 1, 0), -T.LIFT), o) ? o : null; };
function stopTweens(o){ for (let i = stage.tweens.length - 1; i >= 0; i--) { const w = stage.tweens[i]; if (w.o === o) { stage.tweens.splice(i, 1); w.res(); } } }
function goHomeBoat(b, ms = T.BACK_MS){ const h = b.home; return stage.tween(b.g.position, { x: h.x, y: T.WATER, z: h.z }, ms, easeOut).then(() => { if (b.role === 'float' && !b.dragging && !b.drifting) b.g.position.set(b.home.x, T.WATER, b.home.z); }); }
/** 둘째로 누를 곳 들썩(답은 짚지 않는다): 빈 부표들. */
function bobTargets(){ let n = 0; for (const i of S.p ? S.p.holes : []) { if (S.fill[i] != null) continue; const u = S.buoys[i]; buoyWob(u, 1); if (u.ghost) bobEl(u.wrap); n++; } S.log.push({ bob: n }); }
/** 배 · 부표 · 종이 아닌 곳의 누름(5-11): 물결 + 다음에 누를 곳 + 한 줄 안내. 들고 있으면 빈 부표가 들썩. 다 찼으면 손이 종을 · 아니면 떠 있는 배들이 들썩하고 손이 그 아래(한 척을 짚지 않음 — 답을 짚지 않게). */
function tapOther(x, y, target, armed){ H.ripple(x, y); tone(520, .07, 'triangle', .05);
  if (armed != null) { S.log.push({ nudge: true, armed: true, target }); bobTargets(); return; }
  const p = S.p; if (!p) return; const done = full(); S.log.push({ nudge: true, target, to: done ? 'bell' : 'boats' });
  if (done) { const bp = bellAt(); if (bp) H.show(bp.x, bp.y + 24); bellWobble(); }
  else { const fl = floats().filter(b => b.g.visible); fl.forEach(bobBoat); if (fl.length) { const hs = fl.map(boatHit), left = Math.min(...hs.map(q => q.x - q.rx)), top = Math.min(...hs.map(q => q.y - q.ry)), cy = hs.reduce((a, q) => a + q.y, 0) / hs.length, cx = hs.reduce((a, q) => a + q.x, 0) / hs.length;
      const at = S.tall ? { x: cx, y: Math.max(trayBottom() + 4, top - 58) } : { x: Math.max(30, left - 36), y: cy - 10 }; S.log.push({ nudgeHand: at }); H.show(at.x, at.y); } }   /* 손은 배 무리 바깥(가로 = 왼쪽 끝 바깥 · 세로 = 위 바깥) — 한 척을 짚는 것처럼 보이지 않게 */
  if (H.tell('line.nudge', firstLine(), { times: 1e9 })) tellPlace(); }

// ── 끼우기 · 빼기
async function hook(k, slot, how){ const p = S.p, b = S.boats[k], my = S.oid; if (!p || !S.active || S.busy || !b || b.role !== 'float') return;
  const verdict = R.snap({ p, fill: S.fill }, b.n, slot, S.step === 1); S.log.push({ hook: { n: b.n, slot }, verdict, by: how, step: S.step }); S.busy = true; H.hide(); b.wrap.classList.remove('armed'); stopTweens(b.g.position); stopTweens(b.g.rotation); if (b.drifting) endDrift(b);   /* 돌아가던 · 섞이던 · 떠내려가던 움직임을 끊고 옮긴다 */
  if (verdict === 'back') { const to = slotPos(slot), mid = b.g.position.clone().lerp(to, .7); await stage.tween(b.g.position, { x: mid.x, y: T.WATER, z: mid.z }, 260, easeOut); if (S.oid !== my) return; tone(300, .12, 'sine', .07); tone(220, .16, 'sine', .06, .1); bobEl(b.wrap, 'shake');
    await goHomeBoat(b, T.BACK_MS); if (S.oid !== my) return; S.log.push({ back: b.n, slot }); S.busy = false; S.lastAct = S.t; return; }   /* 걸음 ①: 아닌 자리 — 고리가 안 걸리고 물로 미끄러져 돌아감(바로 답한다 · 벌 없음) */
  b.role = 'line'; b.slot = slot; S.fill[slot] = b.n; signDraw(b); const to = slotPos(slot);
  await Promise.all([stage.tween(b.g.position, { x: to.x, y: T.WATER, z: to.z }, T.HOOK_MS, easeOut), stage.tween(b.g.rotation, { y: lineYaw() }, T.HOOK_MS)]); if (S.oid !== my) return;
  { const at = slotPos(b.slot); S.log.push({ hooked: b.n, at: Math.hypot(b.g.position.x - at.x, b.g.position.z - at.z) < .05 }); }
  buoyAway(slot); click();
  if (S.step === 1) { await countUp(slot); if (S.oid !== my) return; }   /* 걸음 ①: 끼우는 그 자리에서 앞에서부터 그 배까지 한 번 세어짐 */
  S.busy = false; S.lastAct = S.t; if (full()) { bellWobble(); S.log.push({ full: true }); } }
async function unhook(b){ if (!S.p || !S.active || S.busy || S.closed || b.role !== 'line' || b.given) return; const my = S.oid, i = b.slot; S.busy = true; S.log.push({ unhook: { n: b.n, slot: i } }); tone(420, .08, 'triangle', .06); tone(300, .1, 'triangle', .05, .07);
  S.fill[i] = null; b.role = 'float'; b.slot = -1; signDraw(b); buoyBack(i); await goHomeBoat(b, T.BACK_MS * .8); if (S.oid !== my) return; S.busy = false; S.lastAct = S.t; }
/** 부표가 배 뒤로 물러남(자리를 비켜 줌) · 돌아옴. */
function buoyAway(i){ const u = S.buoys[i]; if (!u.on) return; u.on = false; buoySign(u); const back = S.tall ? V(.5, 0, 0) : V(0, 0, -.5); stage.tween(u.g.position, { x: u.g.position.x + back.x, z: u.g.position.z + back.z }, 260).then(() => { if (!u.on) u.g.visible = false; }); }
function buoyBack(i){ const u = S.buoys[i], to = slotPos(i); u.on = true; u.g.visible = true; u.g.position.set(to.x + (S.tall ? .5 : 0), T.WATER, to.z + (S.tall ? 0 : -.5)); stage.tween(u.g.position, { x: to.x, z: to.z }, 260); buoySign(u); }
/** 걸음 ①: 앞에서부터 upto 자리까지 팻말이 반짝 + 「삼, 사, 오」. */
async function countUp(upto){ const p = S.p, my = S.oid, seq = []; for (let i = 0; i <= upto; i++) seq.push(p.run[i]); TL.say(seq.map(sino).join(', ')); S.log.push({ countUp: seq.join() });
  for (let i = 0; i <= upto; i++) { if (S.oid !== my) return; const el = slotSign(i); if (el) bobEl(el, 'lit'); tone(R.NOTE[p.run[i]], .16, 'triangle', .09); await sleep(R.T.CALL_GAP * 600); } }
const slotSign = i => { const b = boatAt(i); if (b) return b.wrap; const u = S.buoys[i]; return u && u.on && u.ghost ? u.wrap : null; };

// ── 종 → 세어 나가기
async function ring(){ const p = S.p, my = S.oid; if (!p || !S.active || S.busy || S.closed) return; S.busy = true; H.hide(); bellWobble(); ding(); actPlay(henry, 'Punch', true); setTimeout(() => { if (S.oid === my) actPlay(henry, 'Idle'); }, 900);
  const j = R.judge({ p, fill: S.fill }); S.log.push({ bell: j.depart ? 'depart' : j.slip ? 'slip' : 'gap', upto: j.upto, slip: j.slip, gap: j.gap, fill: S.fill.map(x => x == null ? '_' : x).join(''), step: S.step });
  await sleep(380); if (S.oid !== my) return;
  await callOut(j.upto); if (S.oid !== my) return;
  if (j.depart) { await depart(); return; }
  if (j.slip) { S.res.slipped = true; tone(110, .2, 'square', .07); const bs = j.slip.map(boatAt).filter(Boolean); bs.forEach(b => bobEl(b.wrap, 'shake')); await sleep(300); if (S.oid !== my) return; await Promise.all(bs.map(b => slipOff(b))); S.log.push({ slipped: j.slip.join() }); }
  else { S.res.gapped = true; const u = S.buoys[j.gap]; tone(660, .08, 'triangle', .08); tone(660, .08, 'triangle', .08, .2); bobEl(u.wrap, 'here'); await buoyWob(u, 3); S.log.push({ gapped: j.gap }); }
  S.streak = 0; S.call = -1; if (S.oid !== my) return; S.busy = false; S.lastAct = S.t; }
/** 앞에서부터 한 척씩: 밧줄이 팽팽해지며 팻말이 반짝 · 수를 읽는 소리(「삼, 사, 오」 · 음이 한 칸씩 — 거꾸로 줄은 내린다). upto 칸까지. */
async function callOut(upto){ const p = S.p, my = S.oid, list = R.callout(p.run, upto), gap = R.T.CALL_GAP * 1000 * (1 - .15 * Math.min(S.streak, 3)); S.call = 0;   /* 뱃노래: 깨끗한 문제가 이어지면 박자가 빨라짐 */
  if (list.length) TL.say(list.map(c => sino(c.n)).join(', '));
  for (const c of list) { if (S.oid !== my) return; S.call = c.at + 1; const el = slotSign(c.at) || (boatAt(c.at) && boatAt(c.at).wrap); if (el) bobEl(el, 'lit'); tone(c.f, .2, 'triangle', .1); tug(); S.log.push({ call: c.n }); await sleep(gap); }
  S.log.push({ called: list.map(c => c.n).join() }); }
/** 앞 배가 줄을 당김(살짝 앞으로). */
function tug(){ if (!lead || moving(lead.g.position)) return; const d = dirV(), p0 = lead.g.position.clone(); stage.tween(lead.g.position, { x: p0.x - d.x * .14, z: p0.z - d.z * .14 }, 120).then(() => stage.tween(lead.g.position, { x: p0.x, z: p0.z }, 200)); }
/** 틀린 배: 고리가 툭 풀려 물로 돌아감(가위표 · 빨간 테두리 없음). */
async function slipOff(b){ const i = b.slot; S.fill[i] = null; b.role = 'float'; b.slot = -1; signDraw(b); buoyBack(i); await stage.tween(b.inner.position, { y: .25 }, 140); b.inner.position.y = 0; await goHomeBoat(b, T.BACK_MS * 1.1); }

// ── 떠남 · 놓침
async function depart(){ const p = S.p, my = S.oid; if (S.closed) return; S.closed = true; S.departing = true; S.call = p.run.length; trayDraw(); hornLong(); actPlay(henry, 'Wave'); fogOff(); $('bellring').classList.remove('on');
  const cleanNow = R.clean(S.res), crateB = S.boats.find(b => b.crate && b.role === 'line');
  if (S.step === 2) { if (cleanNow) { S.streak++; if (S.streak % R.T.STREAK === 0) { confetti(20); [1800, 2300].forEach((f, i) => tone(f, .12, 'sine', .05, .3 + i * .18, f * 1.3)); S.log.push({ song: S.streak }); } } else S.streak = 0; }   /* 뱃노래: 셋 이어지면 갈매기 소리 · 물보라 */
  if (crateB) { if (cleanNow) { stage.tween(crateB.crate.position, { y: crateB.crate.position.y + .35 }, 260).then(() => stage.tween(crateB.crate.scale, { x: .01, y: .01, z: .01 }, 260)); confetti(12); tone(1319, .2, 'triangle', .1); wallet.earn(R.T.SURPRISE_COINS, 'line'); S.surpriseCarry = false; S.log.push({ surpriseOpen: true }); } else S.surpriseCarry = true; }
  if (!S.res.missed) { wallet.earn(R.T.COIN_PER, 'line'); coinsDraw(true); } S.today.push(p.run.length);   /* 동전은 아이가 떠나보낸 문제만 */
  floats().forEach((b, k) => setTimeout(() => bobBoat(b), k * 120));   /* 남은 배는 까딱이며 배웅 */
  const d = dirV(), objs = [lead.g, ...lineBoats().map(b => b.g)]; S.log.push({ depart: p.run.join(''), clean: cleanNow });
  await sleep(350); if (S.oid !== my) return;
  await Promise.all(objs.map(o => stage.tween(o.position, { x: o.position.x - d.x * 17, z: o.position.z - d.z * 17 }, T.DEPART_MS, t => t * t))); if (S.oid !== my) return;
  await Promise.all(floats().map(b => stage.tween(b.g.position, S.tall ? { x: b.g.position.x + 6 } : { z: b.g.position.z - 8 }, 700, t => t * t))); if (S.oid !== my) return;
  S.done && S.done(S.res.missed ? 'missed' : 'sent'); }
/** 밧줄이 다 팽팽해졌다 — 떠 있던 맞는 배들이 스스로 들어와 끼워지고(하나씩 수가 읽힘) 떠난다(답은 보이지만 깨끗하지 않음 · 두 문제 뒤에 다시). */
async function miss(){ if (!S.active || S.busy || S.closed) return; const p = S.p, my = S.oid; S.busy = true; S.res.missed = true; S.streak = 0; DRAG.cancel(); DG.line('drag', null); clearArmed(); H.hide(); S.log.push({ missed: true });
  for (const b of S.boats) if (b.role === 'float' && b.dragging) { b.dragging = false; goHomeBoat(b); }
  const wrong = p.holes.filter(i => S.fill[i] != null && S.fill[i] !== p.run[i]).map(boatAt).filter(Boolean); await Promise.all(wrong.map(slipOff)); if (S.oid !== my) return;
  const auto = []; for (const i of p.holes) { if (S.fill[i] === p.run[i]) continue; const b = floats().find(x => x.n === p.run[i]); if (!b) continue; if (b.drifting) endDrift(b);
    stopTweens(b.g.position); stopTweens(b.g.rotation); b.role = 'line'; b.slot = i; S.fill[i] = b.n; signDraw(b); const to = slotPos(i); await Promise.all([stage.tween(b.g.position, { x: to.x, y: T.WATER, z: to.z }, T.HOOK_MS * 1.3, easeOut), stage.tween(b.g.rotation, { y: lineYaw() }, T.HOOK_MS)]); if (S.oid !== my) return;
    buoyAway(i); click(); bobEl(b.wrap, 'lit'); tone(R.NOTE[b.n], .2, 'triangle', .1); TL.say(sino(b.n)); auto.push(b.n); await sleep(380); if (S.oid !== my) return; }
  S.log.push({ autoFill: auto.join(), settled: lineBoats().every(b => { const at = slotPos(b.slot); return Math.hypot(b.g.position.x - at.x, b.g.position.z - at.z) < .05 && Math.abs(b.g.position.y - T.WATER) < .02; }) }); await depart(); }

// ── 사건: 떠내려가는 배 · 섞는 물결 · 안개
function startDrift(){ const fl = floats().filter(b => !b.dragging && b.g.visible && DRAG.armed() !== b.k); if (!fl.length) return; const b = fl[Math.floor(Math.random() * fl.length)], c = boatScreen(b), side = S.tall ? 1 : (c.x < innerWidth / 2 ? -1 : 1);
  b.drifting = true; S.drift = { b, side, t: 0, back: false }; S.log.push({ drift: b.n }); tone(300, .3, 'sine', .04, 0, 200); }
function driftStep(dt){ const D = S.drift; if (!D) return; const b = D.b; if (!b.drifting || b.role !== 'float') { S.drift = null; return; }
  driftMin(b); const ax = 'x', speed = (S.tall ? 4.2 : 9) / R.T.DRIFT_S; if (!D.back) { b.g.position[ax] += D.side * speed * dt; const q = boatScreen(b); if (q.x < -80 || q.x > innerWidth + 80) { D.back = true; b.g.position[ax] = S.tall ? b.home[ax] + 4.5 : b.home[ax] - D.side * 10;   /* 세로는 오른쪽으로 나가 오른쪽에서 돌아옴(선착장 · 줄을 가로지르지 않게) */ S.log.push({ driftOut: b.n }); } }   /* 나갔다가 반대쪽에서 다시 들어온다(떠 있는 배의 수는 그대로) */
  else { const to = b.home[ax], d0 = to - b.g.position[ax], st = Math.sign(d0) * speed * 1.4 * dt; if (Math.abs(d0) <= Math.abs(st)) { b.g.position[ax] = to; endDrift(b); S.log.push({ driftBack: b.n }); } else b.g.position[ax] += st; } }
function driftMin(b){ if (S.tall) S.driftMinX = Math.min(S.driftMinX == null ? 1e9 : S.driftMinX, b.g.position.x); }
function endDrift(b){ b.drifting = false; if (S.drift && S.drift.b === b) S.drift = null; }
/** 떠내려가는 배를 눌러 잡음 → 제자리로(깨끗함 그대로). */
function catchDrift(b, keep){ endDrift(b); S.log.push({ caught: b.n }); tone(880, .08, 'triangle', .07); if (!keep) goHomeBoat(b, 420); }
function shuffleWave(){ const fl = floats().filter(b => !b.dragging && !b.drifting); if (fl.length < 2) return; S.shuffleN++; const ids = fl.map(b => b.spot), nw = R.reshuffle(ids), moved = nw.filter((x, k) => x !== ids[k]).length; fl.forEach((b, k) => { b.spot = nw[k]; });
  const sp = spots(S.nSpots); const before = floats().map(b => b.n).sort().join(); fl.forEach(b => { b.home = sp[b.spot]; stage.tween(b.g.position, { x: b.home.x, z: b.home.z }, T.SHUFFLE_MS); });
  const wv = $('wave'), fr = floats().map(boatScreen), ys = fr.map(q => q.y); wv.style.top = (Math.min(...ys) - 60) + 'px'; wv.style.height = (Math.max(...ys) - Math.min(...ys) + 120) + 'px'; bobEl(wv, 'go'); tone(180, .7, 'sine', .05, 0, 90);
  S.log.push({ shuffle: S.shuffleN, same: floats().map(b => b.n).sort().join() === before, moved, wave: wv.classList.contains('go') }); }
function fogOn(){ const f = $('fog'); f.classList.add('on'); S.fogOn = true; S.log.push({ fog: S.p.cell }); }
function fogOff(){ const f = $('fog'); f.classList.remove('on', 'peek', 'thick'); S.fogOn = false; }
function fogPlace(t){ if (!S.fogOn || !S.p) return; const f = $('fog'), p = S.p; let r;
  if (p.cell === 'A08') { const a = stage.screenOf(slotPos(1)), b = stage.screenOf(slotPos(p.run.length - 2)), half = pitchPx() * .62, sh = NS.size(numPx(), true).h; r = S.tall ? { l: a.x - half, t: a.y - half, w: half * 2 + sh * 1.2, h: b.y - a.y + half * 2 } : { l: a.x - half, t: a.y - sh - half * .9, w: b.x - a.x + half * 2, h: sh + half * 1.9 }; }
  else { const b0 = boatAt(0), sr = b0 && rectOf(b0.wrap); if (!sr) return; f.classList.add('thick');   /* A09 안개만 팻말 위 층(짙게) — A08 안개는 팻말 아래 층(아이가 끼운 배의 팻말을 덮지 않음) */ r = { l: sr.left - 18, t: sr.top - 16, w: sr.width + 36, h: sr.height + 32 }; f.classList.toggle('peek', (t % 4.2) < 1.1); }   /* A09: 맨 앞 팻말이 안개에 가렸다가 잠깐씩만 보인다 */
  Object.assign(f.style, { left: r.l + 'px', top: r.t + 'px', width: r.w + 'px', height: r.h + 'px' }); }

// ── 한 문제의 시작 · 끝
function resetScene(){ for (const b of S.boats) { stopTweens(b.g.position); stopTweens(b.g.rotation); b.role = 'off'; b.slot = -1; b.given = false; b.dragging = false; b.drifting = false; b.snap = false; b.g.visible = false; b.wrap.classList.add('off'); b.wrap.classList.remove('armed', 'lit'); b.bob = false; b.inner.position.y = 0; stopTweens(b.inner.position); if (b.crate) { b.inner.remove(b.crate); b.crate = null; } }
  for (const u of S.buoys) { stopTweens(u.g.position); stopTweens(u.g.rotation); u.wob = false; u.snap = false; u.on = false; u.ghost = false; u.g.visible = false; u.g.rotation.z = 0; buoySign(u); }
  S.drift = null; S.departing = false; fogOff(); $('bellring').classList.remove('on'); if (lead) { stopTweens(lead.g.position); placeLead(); } }
async function runProblem(p, ctx){ const my = S.oid;
  S.p = p; S.step = ctx.step; S.ev = ctx.ev; S.ctx = ctx; S.res = { slipped: false, gapped: false, hinted: false, missed: false }; S.closed = false; S.clock = 0; S.busy = true; S.hinting = false; S.call = -1; S.horned = false;
  S.fill = Array(p.run.length).fill(null); S.leaveS = R.leaveS(S.cell, ctx.board, ctx.last); S.shufT = 0; S.shuffleN = 0; S.driftAt = Infinity; DRAG.cancel(); DG.line('drag', null); resetScene(); clearArmed(); actPlay(henry, 'Idle');
  /* 줄: 앞 배 · 주어진 배 · 빈 자리 부표(걸음 ① 은 흐린 숫자) */
  const yaw = lineYaw(), given = [];
  for (let i = 0; i < p.run.length; i++) { const to = slotPos(i);
    if (p.holes.includes(i)) { const u = S.buoys[i]; u.on = true; u.ghost = S.step === 1; u.n = p.run[i]; u.g.visible = true; u.g.rotation.y = yaw; u.g.position.copy(to); buoySign(u); }
    else { const b = freeBoat(); b.role = 'line'; b.given = true; b.slot = i; b.n = p.run[i]; b.g.visible = true; b.g.rotation.y = yaw; b.g.position.copy(to); signDraw(b); given.push(b); } }
  if (ctx.surprise && given.length) { const b = given[Math.floor(Math.random() * given.length)], c = fitH(K[MODEL.crate], T.CRATE); c.position.set(0, .1, 0); c.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(GLOW); m.material.emissiveIntensity = .4; } }); b.inner.add(c); b.crate = c; S.log.push({ crate: b.n }); }   /* 깜짝 짐: 덮개 씌운 상자(금빛) */
  /* 떠 있는 배: 들어오는 차례 = loose · 자리는 뒤섞어(왼쪽부터 답 차례가 되지 않게) */
  const fl = p.loose.map(n => { const b = freeBoat(); b.role = 'float'; b.n = n; b.given = false; b.slot = -1; signDraw(b); return b; }), sp = spots(fl.length), order = R.seats(p); S.nSpots = fl.length;   /* 자리 수는 문제 동안 그대로(끼워서 줄어도 빈 자리는 그 배의 집) */
  fl.forEach((b, k) => { b.spot = order[k]; b.home = sp[b.spot]; b.g.rotation.y = yaw + (b.k % 3 - 1) * .12; });
  trayDraw(); E.marbles(ctx.j, 3, 0); H.hide(); aim(innerWidth, innerHeight);
  /* 줄이 들어와 서고 · 배들이 먼바다에서 뒤섞여 들어온다 */
  const d = dirV(), lineObjs = [lead.g, ...given.map(b => b.g), ...p.holes.map(i => S.buoys[i].g)]; lineObjs.forEach(o => { o.position.addScaledVector(d, 4); });
  tone(262, .3, 'sine', .06); await Promise.all(lineObjs.map(o => stage.tween(o.position, { x: o.position.x - d.x * 4, z: o.position.z - d.z * 4 }, T.LINE_IN_MS, easeOut))); if (S.oid !== my) return { abort: true };
  placeLead(); const gap = T.ENTER_GAP * (1 - .15 * Math.min(S.streak, 3));   /* 뱃노래: 더 힘차게 들어온다 */
  await Promise.all(fl.map((b, k) => { b.g.visible = true; const h = b.home; b.g.position.set(h.x + (S.tall ? 5 : 0), T.WATER, h.z - (S.tall ? 0 : 8)); return sleep(k * gap).then(() => stage.tween(b.g.position, { x: h.x, z: h.z }, T.ENTER_MS * (1 - .12 * Math.min(S.streak, 3)), easeOut)); })); if (S.oid !== my) return { abort: true };
  fl.forEach(b => b.g.position.set(b.home.x, T.WATER, b.home.z));
  S.log.push({ start: p.run.join(''), holes: p.holes.join(), loose: p.loose.join(), step: S.step, ev: Object.keys(S.ev).filter(k => S.ev[k] === true).join(' '), last: !!ctx.last, fog: !!ctx.fog, retry: !!p.retry });
  if (ctx.fog && S.step === 2) { fogOn(); trayDraw(); }
  const told = (ctx.j === 0 && ctx.firstStep) ? H.tell('line.' + S.cell + S.step, firstLine(), TELLS()) : false; if (told) { tellPlace(); S.log.push({ told: firstLine() }); }
  S.driftAt = ctx.drift && S.step === 2 && !CALM ? S.t + 1.5 + Math.random() * 2.5 : Infinity;
  S.active = true; S.busy = false; S.lastAct = S.t + (told ? T.TELL_GRACE : 0);
  const out = await new Promise(res => { S.done = res; }); S.active = false; S.done = null; H.hide(); DRAG.cancel(); if (out === 'abort' || S.oid !== my) return { abort: true };
  const r = { ...S.res, clean: R.clean(S.res), out }; S.log.push({ problem: p.run.join(''), holes: p.holes.join(), step: S.step, ...r }); return r; }

// ── 나들이(판 셋) · 판(문제 셋)
const TELLS = () => ({ times: M.passed(M.get(S.cell || '')) ? 2 : 1e9 });
/** 하네스용: 문제를 정해 줌 — { start, len, holes } 또는 { run, holes, loose }. */
function forced(id, f, base){ if (f.run) { const p = { cell: id, run: f.run.slice(), holes: f.holes.slice(), last: !!base.last }; p.loose = f.loose ? f.loose.slice() : R.loose(p); return p; } if (f.start != null) return R.make(id, f.start, f.len, f.holes, Math.random, base.last ? { last: true, full: f.len === 9 } : {}); return { ...base, ...f }; }
async function outing(id){ const my = ++S.oid; E.showBar(true); S.cell = id; S.streak = 0; S.today = []; S.told = {}; clearEnd(); const day = M.dayKey(); let prevStep = 0;
  let rec = M.get(id); S.back = M.stuckNow(rec) && !!rec.hand;
  let q = R.deal(id, S.hist[id] || [], Math.random, { small: M.stuck(rec) >= 1 }); if (S.forceP) { S.forceP.forEach((f, k) => { if (q[k] && f) q[k] = forced(id, f, q[k]); }); S.forceP = null; }
  S.q = q; E.lanterns(0); S.log.push({ outing: id, deal: q.map(p => p.run.join('') + '/' + p.holes.join('')) });
  const b0 = S.startBoard | 0; S.startBoard = 0;   /* 하네스용: 셋째 판부터 */
  for (let b = b0; b < R.T.BOARDS; b++) { rec = M.get(id); const hand = !rec.hand || S.back;
    let ev = R.events(rec.evBoards, Math.random, { passed: M.passed(rec), calm: CALM, hand }); if (S.forceEv) { ev = { ...ev, ...S.forceEv }; S.forceEv = null; }
    if (hand) { q = R.handFix(q, b * R.T.PER_BOARD); S.q = q; }   /* 걸음 ① 판은 빈 자리 하나~둘(A08) */
    const carried = S.surpriseCarry && !hand; if (carried) ev.surprise = true;   /* 못 연 깜짝 짐은 다음 판 첫 문제에 다시 */
    const pick = on => (on ? (ev.at != null ? ev.at : Math.floor(Math.random() * 3)) : -1);
    const surpJ = carried ? 0 : pick(ev.surprise), driftJ = pick(ev.drift), shufJ = pick(ev.shuffle), fogJ = pick(ev.fog);
    if (fogJ >= 0 && q[b * 3 + fogJ]) { q[b * 3 + fogJ] = R.fogFix(q[b * 3 + fogJ]); S.q = q; }   /* 안개(A08): 양 끝만 보이고 가운데가 다 빈다 — 수는 그대로 */
    S.board = { b, hand, ev }; S.log.push({ board: b, hand, leaveS: R.leaveS(id, b, false), ev: Object.keys(ev).filter(k => ev[k] === true).join(' ') });
    const results = []; E.marbles(0);
    for (let j = 0; j < R.T.PER_BOARD; j++) { const i = b * R.T.PER_BOARD + j, last = i === R.T.PER_BOARD * R.T.BOARDS - 1;
      const r = await runProblem(q[i], { step: hand ? 1 : 2, ev, board: b, j, last, surprise: j === surpJ, drift: j === driftJ, shuffle: j === shufJ, fog: j === fogJ, firstStep: b === b0 || (hand ? 1 : 2) !== prevStep });
      if (S.oid !== my || r.abort) return; results.push(r); E.marbles(j + 1); if (!r.clean) q = R.requeue(q, i); S.q = q; }
    prevStep = hand ? 1 : 2;
    const before = rec; rec = M.record(rec, results, day, { counts: !hand, hand, ev: !hand && !ev.none }); if (hand) S.back = false; else if (M.stuckNow(rec)) S.back = true; M.put(id, rec); S.log.push({ boardEnd: b, clean: M.clean(results), rec: { ...rec } });
    await E.fly($('marbles'), $('coins'), art(ICON.coin), results.filter(r => r.out === 'sent').length); if (S.oid !== my) return; E.lanterns(b + 1); tone(660, .15, 'triangle', .1); tone(990, .2, 'triangle', .1, .12);
    if (!M.passed(before) && M.passed(rec)) { grew(art(ICON.flag) + ' 깃발을 땄어요!'); await sleep(2400); } else if (!M.kept(before) && M.kept(rec)) { grew(art(ICON.star) + ' 깃발에 별이 붙었어요!'); await sleep(2400); }
    if (S.oid !== my) return; await sleep(300); if (S.oid !== my) return; }
  S.hist[id] = q; await endScene(id, my); if (S.oid !== my) return;
  const nums = R.CELLS[id].dir > 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [9, 8, 7, 6, 5, 4, 3, 2, 1], items = nums.map((n, k) => `<b class="ns" style="--k:${k};display:inline-block"><img class="ns" alt="" src="${NS.numsign(n, { px: 40, compact: true }).toDataURL()}"></b>`);
  const choice = await E.home({ items }); if (S.oid !== my) return;
  if (choice === 'again') outing(id); else location.href = GO; }
/** 나들이 끝 장면: 오늘 떠난 배 기차들이 먼바다에 줄지어 가고 · 뱃고동이 한 번 · 선착장에서 헨리가 손을 흔든다. */
async function endScene(id, my){ S.p = null; A.trayClear(); resetScene(); clearEnd(); if (lead) lead.g.visible = false;
  const n = Math.max(1, Math.min(9, S.today.length)), d = dirV(), lanes = S.tall ? [.15, 1.2, 2.25] : [-.9, -2.2, -3.5], sc = S.tall ? .7 : .62;
  for (let k = 0; k < n; k++) { const g = new THREE.Group(), ld = fitLen(K[MODEL.lead], T.LEAD_L, .28); ld.rotation.y = T.LEAD_BOW < 0 ? Math.PI : 0; g.add(ld); const cars = Math.min(5, Math.max(3, (S.today[k] || 5) - 2));
    for (let c = 0; c < cars; c++) { const bt = fitLen(K[MODEL.boat], T.BOAT_L, .1); bt.rotation.y = T.BOW < 0 ? Math.PI : 0; bt.position.z = T.GAP0 + c; g.add(bt); }
    g.rotation.y = lineYaw(); g.scale.setScalar(sc); const lane = lanes[k % 3], back = (S.tall ? 2 : 3) + (k / 3 | 0) * 6.5 + (k % 3) * 1.4;   /* 떠날 때와 같은 쪽(앞 배 쪽)으로 줄지어 간다 · 칸 배가 뒤를 따른다 */
    if (S.tall) g.position.set(lane, T.WATER, back - 1); else g.position.set(back - 4, T.WATER, lane); scene.add(g); S.ends.push(g);
    stage.tween(g.position, S.tall ? { z: g.position.z - 22 } : { x: g.position.x - 26 }, 12000 + k * 300, t => t); }
  actPlay(henry, 'Wave'); hornLong(); S.log.push({ endScene: n }); confetti(14); [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, 'triangle', .1, .5 + i * .12)); await sleep(1400); }
function clearEnd(){ for (const g of S.ends) scene.remove(g); S.ends = []; if (lead) lead.g.visible = true; }
/** 하네스 · 교사용: 지금 나들이를 거둔다. */
function abort(){ S.oid++; S.active = false; if (S.done) { const d = S.done; S.done = null; d('abort'); } stage.tweens.length = 0; DRAG.cancel(); DG.line('drag', null); A.trayClear(); resetScene(); clearEnd(); S.p = null; S.busy = false; TL.stop(); H.hide(); ropeClear();
  const hm = document.getElementById('home'); if (hm) hm.classList.remove('on'); }

// ── 밧줄(화면 위 선): 앞 배 고물 → 칸마다(배는 이물 · 고물 · 부표는 가운데) — 늘어짐 = 시계 · 세어진 칸까지는 팽팽
let ropeN = 0;
function ropeClear(){ for (let j = 0; j < ropeN; j++) DG.line('rope' + j, null); ropeN = 0; }
function drawRope(){ const p = S.p; if (!p || !lead || !lead.g.visible) { ropeClear(); return; } const d = dirV(), y = .16, ends = [];
  const lp = lead.g.position.clone(); ends.push([null, lp.clone().addScaledVector(d, T.LEAD_L * .46).setY(y)]);
  for (let i = 0; i < p.run.length; i++) { const b = boatAt(i); if (b) { const c = b.g.position; ends.push([c.clone().addScaledVector(d, -T.BOAT_L * .44).setY(y), c.clone().addScaledVector(d, T.BOAT_L * .44).setY(y)]); }
    else { const u = S.buoys[i]; if (!u.on && !u.g.visible) continue; const c = u.g.position; ends.push([c.clone().addScaledVector(d, -T.BUOY_L * .3).setY(y), c.clone().addScaledVector(d, T.BUOY_L * .3).setY(y)]); } }
  const slack = T.SLACK * (1 - .9 * S.clock) * (S.tall ? -1 : 1); let j = 0;
  for (let k = 1; k < ends.length; k++, j++) { const a = stage.screenOf(ends[k - 1][1]), b = stage.screenOf(ends[k][0]), taut = S.departing || S.call >= k; DG.line('rope' + j, a, b, { sag: taut ? 0 : slack }); }
  for (let q = j; q < ropeN; q++) DG.line('rope' + q, null); ropeN = j; }

// ── 한 장면의 일
stage.frame((dt, t) => { S.t = t; if (!S.ready) return;
  const thinking = S.active && !S.busy && !S.closed;
  /* 팽팽해지는 밧줄: 생각하는 동안에만 · 앞 배가 조금씩 앞으로 · 끝이 가까우면 뱃고동 짧게 두 번 */
  if (thinking && S.ev.leave && S.step === 2 && !CALM) { S.clock = Math.min(1, S.clock + dt / S.leaveS); if (S.clock > .85 && !S.horned) { S.horned = true; hornShort(); S.log.push({ horn2: true }); } if (S.clock >= 1) miss(); }
  if (lead && !S.departing && !moving(lead.g.position)) { const h = leadHome(), d = dirV(); lead.g.position.set(h.x - d.x * T.PULL * S.clock, h.y, h.z - d.z * T.PULL * S.clock); }
  for (const b of S.boats) if (b.role !== 'off' && !b.bob) b.inner.position.y = b.dragging ? 0 : Math.sin(t * 1.4 + b.k * 1.7) * .02;
  for (const u of S.buoys) if (u.snap && !moving(u.g.position)) { u.snap = false; if (u.on) { const to = slotPos(u.i); u.g.position.set(to.x, T.WATER, to.z); } }
  for (const b of S.boats) if (b.snap && !moving(b.g.position)) { b.snap = false; if (b.role === 'line' && !S.departing) { const to = slotPos(b.slot); b.g.position.set(to.x, T.WATER, to.z); } else if (b.role === 'float' && !b.dragging && !b.drifting) b.g.position.set(b.home.x, T.WATER, b.home.z); }
  if (thinking && t > S.driftAt) { S.driftAt = Infinity; startDrift(); }
  if (thinking) driftStep(dt);
  if (thinking && S.ctx.shuffle && S.step === 2 && !CALM) { S.shufT += dt; if (S.shufT >= R.T.SHUFFLE_S && S.shuffleN < R.T.SHUFFLE_MAX && !DRAG.dragging()) { S.shufT = 0; shuffleWave(); } }
  for (const b of S.boats) signPlace(b.wrap, b.g, S.tall && b.role === 'line'); for (const u of S.buoys) signPlace(u.wrap, u.g, S.tall);
  drawRope(); fogPlace(t);
  { const r = $('bellring'), bp = bellAt(); if (r && bp) { r.style.left = bp.x + 'px'; r.style.top = bp.y + 'px'; r.classList.toggle('on', !!(thinking && full())); } }   /* 다 차면 종이 빛나며 부른다 */
  /* 길잡이 손: 가만히 있으면 다음에 끼울 배 → 그 자리 → (다 차면) 종. 뜨면 그 문제는 깨끗하지 않음 */
  const wait = R.T.HINT_AFTER * (M.stuck(M.get(S.cell || '')) >= 1 ? .5 : 1);
  if (thinking && t - S.lastAct > wait && !S.hinting && !DRAG.dragging()) { S.hinting = true; S.hintAt = t; S.hintPhase = 0; S.res.hinted = true; S.log.push({ hinted: true }); hintShow(); }
  if (S.hinting && thinking && t - S.hintAt > T.HINT_SWAP) { S.hintAt = t; S.hintPhase ^= 1; hintShow(); }
  if (!thinking && S.hinting) { S.hinting = false; H.hide(); } });
/** 길잡이(답까지): 앞에서부터 첫 「아직 맞지 않은」 빈 자리 — 틀린 배가 있으면 그 배(눌러 빼기) · 비었으면 맞는 배 → 그 자리 · 다 맞으면 종. */
function hintTarget(){ const p = S.p; for (const i of p.holes) { const v = S.fill[i]; if (v === p.run[i]) continue; if (v != null) return [boatScreen(boatAt(i))]; const fb = floats().find(x => x.n === p.run[i]); if (!fb) { const wb = lineBoats().find(x => !x.given && x.n === p.run[i]); if (wb) return [boatScreen(wb)]; }   /* 맞는 배가 뒤 칸에 잘못 끼워져 있으면 그 배(눌러 빼기)부터 */ return [fb ? boatScreen(fb) : null, stage.screenOf(slotPos(i))].filter(Boolean); }
  const bp = bellAt(); return bp ? [{ x: bp.x, y: bp.y + 20 }] : []; }
function hintShow(){ if (!S.p) return; const ts = hintTarget(); if (!ts.length) return; const q = ts[S.hintPhase % ts.length]; S.log.push({ hintAt: ts.length > 1 && S.hintPhase ? 'slot' : 'first' }); H.show(q.x, q.y); }

window.__line = { S, R, M, E, T, TL, NS, DG, stage, wallet, outing, abort, ring, hook, unhook, endScene: () => endScene(S.cell, S.oid), targets, sources, pitchPx,
  /** 하네스: 떠 있는 배(수 n)의 집는 자리 · 줄 칸 i 의 화면 자리 · 종 */
  floatAt: n => { const b = floats().find(x => x.n === n); return b ? boatHit(b) : null; }, slotAt: i => stage.screenOf(slotPos(i)), bellAt, boatAtSlot: i => { const b = boatAt(i); return b ? boatHit(b) : null; },
  floatNums: () => floats().map(b => b.n), floatK: n => { const b = floats().find(x => x.n === n); return b ? b.k : -1; },
  /** 하네스: 보이는 팻말 전부 { n, role, slot, ghost, px, lit } · 배 길이(px) · 떠 있는 배의 화면 네모 */
  signs: () => [...S.boats.filter(b => b.role !== 'off').map(b => ({ n: b.n, role: b.role, slot: b.slot, given: b.given, ghost: false, px: +b.cv.dataset.numpx, w: b.cv.width, side: b.wrap.classList.contains('side'), crate: !!b.crate })), ...S.buoys.filter(u => u.on && u.ghost).map(u => ({ n: u.n, role: 'buoy', slot: u.i, ghost: true, px: +u.cv.dataset.numpx }))],
  boatPx: () => Math.min(...S.boats.filter(b => b.role !== 'off').map(boatPx)), floatRects: () => floats().map(b => { const h = boatHit(b); return { left: h.x - h.rx, right: h.x + h.rx, top: h.y - h.ry, bottom: h.y + h.ry, n: b.n }; }),
  homes: () => floats().map(b => ({ n: b.n, ok: Math.hypot(b.g.position.x - b.home.x, b.g.position.z - b.home.z) < .02 })), boatY: () => S.boats.filter(b => b.role !== 'off').map(b => +b.g.position.y.toFixed(3)),
  showRadius: on => DG.showRadius(on ? targets() : null, R.T.SNAP_R), docks, lead: () => lead, bell: () => bell, sizeOf, ropes: () => document.querySelectorAll('#dragsvg g[data-id^="rope"]').length, keyRects, bellR, shuffleWave,
  armedN: () => document.querySelectorAll('.bsign.armed').length, buoysOk: () => S.buoys.filter(u => u.on).every(u => { const to = slotPos(u.i); return Math.hypot(u.g.position.x - to.x, u.g.position.z - to.z) < .02; }),
  leadPoint: () => { if (!lead) return null; const d = dirV(), bp = bellAt(); for (const k of [.62, -.62, .45, -.45, .8, -.8]) { const w = lead.g.position.clone().addScaledVector(d, k).setY(.25), q = stage.screenOf(w); if (!bp || Math.hypot(q.x - bp.x, q.y - bp.y) > bellR() + 8) return { ...q, far: true }; } return null; } };
if (!GO_NOW) build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
