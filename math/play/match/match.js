/* 짝 잇기 틀 「창고 문 열어 주기」(3D, T05) — 부두 창고의 문마다 숫자 문패 · 문 안에서 배고픈 동물이 기다린다. 물고기 쟁반에서 밧줄을 끌어 수가 같은 문에 걸면 문이 열린다.
 * 설계: 핸드오프 kedu/math-play-work/T05_짝잇기_틀.md · 정본 kmotion/math-wizard/27_수학놀이터_내용지도와_틀_설계_v1.md(4 · 5절 · 5-9 · 5-10 · 5-11). 규칙 = ./rules.js(화면 없음).
 * 한 나들이 = 낱칸 하나(A03 · A07) · 판 = 문제 셋 · 나들이 = 판 셋. 손: 쟁반을 끌어 문에 놓는다(밧줄 한 줄) — 「쟁반 누르고 → 문 누르기」도 똑같이(common/drag.js).
 *   (가) 쟁반 하나 · 문 셋: 물고기의 수와 같은 숫자 문 · (나) 문 하나 · 쟁반 셋: 문의 숫자만큼 있는 쟁반.
 * 걸음 ① 점 보고 잇기(문패 = 숫자 + 점 · (가) 만) → 걸음 ② 숫자만 보고 잇기(점은 맞히면 확인으로 · 아니면 도움으로 켜진다). 숫자 꼴 · 점 무늬는 common/numsign.js.
 *   맞는 문: 문이 활짝 · 동물이 나와 물고기를 하나씩 먹으며 문패의 점이 하나씩 · 띠 「물고기 3마리 · 3」 · 소리 「셋, 삼」.
 *   아닌 문(가): 문이 덜컹 · 그 문패 아래 점이 하나씩 켜지고 쟁반 물고기가 하나씩 톡톡 → 쟁반은 제자리로 · 그 문에 빗장(켜진 점은 남음). 아닌 쟁반(나): 점이 켜졌다가 꺼지고 그 쟁반은 물러남.
 * 사건(rules.js events): 닫히는 문(시계 · 생각하는 동안에만) · 빼꼼(답과 상관없는 문) · 뒤집힌 문패(눌러 돌려놓음) · 깜짝 쟁반 · 분필 문패(통과 뒤) · 문 여는 가락. 사건은 수를 바꾸지 않는다.
 * 누름에는 늘 답이 있다(5-11). 소리는 common/tell.js — 없으면 조용히 넘어간다. 그림은 기성 3D 재료만(./assets · 이름표 ./art.js) — 코드로 그린 것은 밧줄(화면 위 선) · 숫자 문패(화면 위 그림)뿐. */
import { createStage, THREE, CALM, sleep } from '../common/stage3d.js?v=2';
import { clone as cloneRig } from 'three/addons/utils/SkeletonUtils.js';
import * as A from '../common/ask.js?v=2';
import * as H from '../common/hint.js?v=5';
import { wallet, audio, tone, confetti, grew } from '../common/kit.js?v=8';
import { art } from '../common/art.js?v=9';
import * as E from '../common/ends.js?v=1';
import * as M from '../common/map.js?v=8';
import * as TL from '../common/tell.js?v=2';
import * as NS from '../common/numsign.js?v=3';
import * as DG from '../common/drag.js?v=4';
import { word, sino, UNIT } from '../common/say.js?v=4';
import * as R from './rules.js?v=2';
import { ASSETS, MODEL, ANIMALS, BIG, WATCHER, ANIMAL_H, FISH, FISH_ROWS, fishModel, SCENERY, GLOW, DOOR_TINT, BAR_TINT, ICON } from './art.js?v=2';

// ── 내가 정한 수치(화면 · 움직임 — 준호가 보고 바꾼다). 문제 · 사건 · 시계 수치는 ./rules.js 의 T
const T = { DECK: .45, BOOTH_H: 2.5, DOOR_H: 1.8, OPEN: 1.95, BIG: 1.2,
  WIDE: { U: 1, sq: 1, bx: [-2.95, 0, 2.95], bz: -1.5, plate: 2.0, gaPlate: 2.1, px: [-2.75, 0, 2.75], pz: 1.85, nz: [1.85, 1.85, 1.85], from: -8.5, seat: [4.4, .7], num: 96, fov: 38, front: .93 },
  TALL: { U: 1, sq: .62, bx: [-1.86, 0, 1.86], bz: -1.25, plate: 2.4, gaPlate: 3.1, px: [-1.3, 1.3, 0], pz: 2.9, nz: [1.95, 1.95, 4.0], from: -5.5, seat: [2.1, 1.0], num: 72, fov: 50, front: .8 },
  SLIDE_MS: 900, WALK: 1.6, COUNT_MS: 420, OPEN_MS: 520, RATTLE_MS: 420, SHOW_MS: 650, HINT_SWAP: 1.4, PLATE_PX: .5, TELL_GRACE: 4 };
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const GO = '/math/play/go/';
const WANT = Q.get('cell'), GO_NOW = !WANT || !R.CELLS[WANT];   /* ?cell= 없이 열리면 모형을 불러오기 전에 고르는 화면으로 */
if (GO_NOW) location.replace(GO);
const S = { ready: false, busy: true, active: false, t: 0, oid: 0, cell: null, p: null, res: null, step: 2, ev: {}, board: null, clock: 0, streak: 0, closed: false, lastAct: 0, back: false, surpriseCarry: false, hist: {}, log: [],
  tall: false, doors: [], plates: [], out: [], today: [], seen: true, hintAt: 0, hinting: false, link: null, flipK: -1, gone: [], told: {} };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [18, 62], shadow: { left: -8, right: 8, top: 6, bottom: -5 }, assets: ASSETS }), { scene, camera } = stage;
const K = {};
const NAMES = [...new Set([MODEL.stand, MODEL.door, MODEL.crate, MODEL.barrel, MODEL.bags, MODEL.bar, MODEL.plate, MODEL.dock, MODEL.pole, MODEL.jetty, ...ANIMALS, BIG, WATCHER, ...FISH.map(fishModel), ...SCENERY.map(s => s[0])])];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L = () => S.tall ? T.TALL : T.WIDE;

// ── 놓기(모형을 키 h 로 맞춰 바닥 가운데에)
function fit(g, h, ry = 0){ const o = cloneRig(g.scene); o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o), s = h / Math.max(.0001, b.max.y - b.min.y); o.scale.multiplyScalar(s); o.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(o), c = b2.getCenter(new THREE.Vector3()); o.position.sub(V(c.x, b2.min.y, c.z)); const w = new THREE.Group(); w.add(o); w.rotation.y = ry; stage.shadows(w); return w; }
const sizeOf = o => { o.updateMatrixWorld(true); return new THREE.Box3().setFromObject(o).getSize(V(0, 0, 0)); };
const rigH = rig => { rig.scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(rig.scene); return Math.max(.0001, b.max.y - b.min.y); };
const actOf = (p, base) => Object.keys(p.acts).find(k => k === base || k.endsWith('|' + base)) || null;
const play = (p, base, once) => { const n = actOf(p, base); if (n) stage.play(p, n, once); };

// ── 짓기: 바닥 · 창고 칸 셋(가판대 + 문짝 + 상자 · 통 · 자루) · 둘레
async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); }));
  const dk = stage.dockKit(K[MODEL.dock]), step = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36;
  for (const z of [-3.6, -1.6, .4, 2.4, 4.4]) { let i = 0; for (let x = -7.2; x <= 7.2; x += step, i++) { const m = new THREE.Mesh(dk.planks[i % dk.planks.length], dk.mat); m.position.set(x, T.DECK - dk.plankH / 2, z); scene.add(stage.shadows(m)); } }
  for (let x = -6.6; x <= 6.8; x += 2.6) stage.put(K[MODEL.pole], x, T.DECK - .8, 5.55, 1, x);
  for (const s of SCENERY) stage.put(K[s[0]], s[1], s[2], s[3], s[4], s[5]);
  { const j = stage.put(K[MODEL.jetty], 8.6, 0, 5.2, 1.1, Math.PI / 2); const b = new THREE.Box3().setFromObject(j); j.position.y += T.DECK - .02 - (b.min.y + (b.max.y - b.min.y) * .32); }
  for (let k = 0; k < 3; k++) S.doors.push(booth(k));
  for (let k = 0; k < 3; k++) S.plates.push(plateObj(k));
  stage.onResize = aim; stage.resize();
  const c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); coinsDraw(); wallet.onChange(() => coinsDraw());
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
  TL.button(on => { S.log.push({ sound: on }); });
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true;
  outing(WANT); }
function coinsDraw(pop){ const c = $('coins'); if (!c) return; const v = `${art(ICON.coin)}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; } if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }

/** 창고 칸 하나(칸 높이 BOOTH_H 를 1 로 지은 뒤 화면에 맞춰 키운다). 문짝은 경첩 쪽 축(pivot)을 돌린다(모형은 그대로). */
function booth(k){ const g = new THREE.Group(); scene.add(g); const body = new THREE.Group(); g.add(body);
  const stand = fit(K[MODEL.stand], T.BOOTH_H, Math.PI / 2); body.add(stand); const ss = sizeOf(stand), front = ss.z / 2 - .12;
  const door = fit(K[MODEL.door], T.DOOR_H); { const s0 = sizeOf(door); if (s0.x < s0.z) door.rotation.y = Math.PI / 2; } door.traverse(m => { if (m.isMesh && /wood/i.test(m.material.name || '')) { m.material = m.material.clone(); m.material.color.lerp(new THREE.Color(DOOR_TINT), .45); } }); const dw = sizeOf(door).x; door.position.x = dw / 2;
  const pivot = new THREE.Group(); pivot.position.set(-dw / 2, 0, front); pivot.add(door); g.add(pivot);
  const c = .56, props = [];
  for (const sx of [-1, 1]) { const cr = fit(K[MODEL.crate], c, k + sx * .3), bg = fit(K[MODEL.bags], c * .5, sx * 1.3), br = fit(K[MODEL.barrel], c * 1.2, k * 2 + sx), c2 = fit(K[MODEL.crate], c * .8, k * 3 - sx); g.add(cr, bg, br, c2); props.push({ sx, cr, bg, br, c2 }); }
  const bar = fit(K[MODEL.bar], .5); { const bs = sizeOf(bar); bar.scale.multiplyScalar((dw + .4) / Math.max(.01, bs.x)); bar.scale.y *= 1.8; bar.scale.z *= 2.5; } bar.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.set(BAR_TINT); m.material.emissive = new THREE.Color(BAR_TINT); m.material.emissiveIntensity = .25; } }); bar.position.set(0, T.DOOR_H * .38, front + .2); bar.visible = false; g.add(bar);   /* 빗장: 짙은 문 위에서도 보이게 밝고 굵게 */
  const wrap = document.createElement('div'); wrap.className = 'door-sign off'; wrap.innerHTML = '<div class="card"></div>'; const fr = NS.numsign(1, { px: 96 }), bk = NS.numsign(1, { px: 96, back: true }); fr.classList.add('fr'); bk.classList.add('bk'); wrap.firstChild.append(fr, bk); document.body.appendChild(wrap);
  return { k, g, body, stand, standW: ss.x, door, pivot, bar, front, dw, props, c, wrap, fr, bk, animal: null, kind: null, angle: 0, active: false, barred: false, n: 0, lit: 0, dots: false, face: 'book', flipped: false, flash: -1, big: false }; }
/** 창고 칸의 옆 짐(상자 · 자루 · 통): 칸 너비(sq = 가판대를 옆으로 줄인 몫 — 전화기 세로는 좁게)에 맞춰 문 양옆에 놓는다. 문짝 · 동물은 줄이지 않는다. */
function dress(d, sq){ d.body.scale.set(sq, 1, 1); const c = d.c, side = (d.standW * sq - d.dw) / 2 - .05, k = Math.min(1, side / (c * 1.05));
  for (const { sx, cr, bg, br, c2 } of d.props) { const x0 = sx * (d.dw / 2 + .04), cc = c * k;
    cr.scale.setScalar(cr.userData.s0 || (cr.userData.s0 = cr.scale.x)); cr.scale.multiplyScalar(k); cr.position.set(x0 + sx * cc / 2, 0, d.front - cc / 2 + .05);
    bg.scale.setScalar(bg.userData.s0 || (bg.userData.s0 = bg.scale.x)); bg.scale.multiplyScalar(k); bg.position.set(cr.position.x, cc, cr.position.z);
    br.visible = side > c * 1.9; br.position.set(x0 + sx * (c + c * .45), 0, d.front - c * .55);
    c2.visible = side > c * 2.2; c2.position.set(sx * (d.standW * sq / 2 - c * .45), 0, d.front - c * .9); } }
/** 쟁반 하나: 수레(상자를 눕혀 납작하게) + 접시(크게) + 물고기 자리. */
function plateObj(k){ const g = new THREE.Group(); scene.add(g); g.visible = false;
  const cart = fit(K[MODEL.crate], 1); cart.scale.multiply(V(1.12, .2, .86)); g.add(cart); const ch = sizeOf(cart).y;
  const pl = fit(K[MODEL.plate], .06); { const s0 = sizeOf(pl); pl.scale.multiplyScalar(1 / Math.max(.01, Math.max(s0.x, s0.z))); } pl.position.y = ch; g.add(pl);
  const fishG = new THREE.Group(); fishG.position.y = ch + .05; g.add(fishG);
  return { k, g, cart, pl, fishG, fish: [], n: 0, top: ch + .05, active: false, home: V(0, 0, 0), gone: false, glow: false }; }

// ── 카메라 · 자리
function aim(w, h){ const tall = h > w * 1.05, was = S.tall; S.tall = tall; S.low = !tall && h < 560;   /* 낮은 가로 화면(전화기를 눕힘) — 문패를 문 위쪽에 겹쳐 건다 */ const l = L(); camera.fov = l.fov; const asp = w / h, half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * asp), span = tall ? 2.95 : 6.2; let dist = Math.max(tall ? 7 : 9, span / Math.tan(half));
  if (was !== tall || !S.laid) layout();
  /* 문패의 못 자리를 띠 바로 아래에 · 쟁반 앞 끝이 화면 아래 여백 안에 들 때까지 조금씩 물러선다(낮은 가로 화면) */
  const low = (tall ? 160 : 34),   /* 전화기 세로는 쟁반 밑에 한 줄 안내 · 동전 · 소리 단추 자리 */ front = tall ? Math.max(l.pz + l.gaPlate / 2, ...l.nz.map(z => z + l.plate / 2)) : Math.max(l.pz + l.gaPlate / 2, l.nz[0] + l.plate / 2);
  for (let k = 0; k < 30; k++) { camera.position.set(0, dist * (tall ? .8 : .4), dist * (tall ? .78 : .95)); camera.lookAt(0, tall ? .6 : .9, tall ? .7 : 0);
    camera.clearViewOffset(); camera.aspect = asp; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const want = signTopWant() + NS.size(numPx()).h, q = signAnchor(S.doors[1]).project(camera), dy = want - (1 - q.y) / 2 * h; camera.setViewOffset(w, h, 0, -dy, w, h); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const f = V(0, T.DECK, front).project(camera), fy = (1 - f.y) / 2 * h; if (fy <= h - low) break; dist *= 1.07; }
  S.doors.forEach(signDraw); }
function signTopWant(){ const t = $('tray'), r = t && t.classList.contains('on') ? t.getBoundingClientRect() : null; return (r ? r.bottom : (S.tall ? 104 : 124)) + (S.tall ? 10 : 12); }
function layout(){ S.laid = true; const l = L();
  S.doors.forEach((d, k) => { d.g.position.set(l.bx[k], T.DECK, l.bz); d.g.scale.setScalar(l.U); dress(d, l.sq); });
  S.plates.forEach(p => { if (!p.active) return; p.home = plateHome(p.k); p.g.scale.setScalar(plateS()); if (p.away) return; if (stage.tweens.some(w => w.o === p.g.position)) p.snap = true; else p.g.position.set(p.home.x, T.DECK, p.home.z); });   /* 집은 늘 새로 · 움직이는 중이면 끝난 뒤 맞춤 */
  S.out.forEach((o, i) => { if (!o.moving) o.p.obj.position.copy(seatPos(i)); }); S.doors.forEach(signDraw); }
const plateHome = k => { const l = L(), p = S.p; return p && p.dir === 'ga' ? V(0, T.DECK, l.pz) : V(l.px[k], T.DECK, l.nz[k]); };   /* 전화기 세로의 (나) 는 둘 + 하나(세모) — 쟁반을 크게 */
const plateS = () => (S.p && S.p.dir === 'ga' ? L().gaPlate : L().plate);
/** 문패의 못 자리(문 위 · 창고 칸 앞 기둥) */
const signAnchor = d => d.g.localToWorld(V(0, S.low ? T.DOOR_H * .62 : T.DOOR_H + .06, d.front + .05));   /* 문패의 아래 끝 = 문 위(문패는 문 위 들보에 걸려 있다) */
const doorFront = d => d.g.localToWorld(V(0, 0, d.front + .95));
const doorMid = d => d.g.localToWorld(V(d.dw * .1, T.DOOR_H * .45, d.front + .05));
const handleAt = d => d.g.localToWorld(V(d.dw * .38, T.DOOR_H * .42, d.front + .1));
const seatPos = i => { const l = L(), side = i % 2 ? 1 : -1, row = Math.floor(i / 2); return V(side * (l.seat[0] + row * .55 * l.U), T.DECK, l.seat[1] - row * .5 * l.U); };

// ── 숫자 문패(화면 위 그림 — 못에 걸려 위아래가 늘 같다 · 뒤집힘은 세로 축으로만)
const numPx = () => S.tall ? L().num : Math.round(Math.min(L().num, Math.max(60, innerHeight * .16)));   /* 큰 문에서도 그대로(띠를 가리지 않게 — 큰 문은 빛으로) · 낮은 가로 화면은 줄임 */
function signDraw(d){ const px = numPx(d); NS.paint(d.fr, d.n, { px, dots: d.dots, lit: d.lit, face: d.face, flash: d.flash }); NS.paint(d.bk, d.n, { px, back: true }); d.wrap.classList.toggle('off', !d.active); d.wrap.classList.toggle('flip', d.flipped); d.wrap.classList.toggle('big', d.big); }
function signPlace(d){ if (!d.active) return; const q = stage.screenOf(signAnchor(d)); d.wrap.style.left = q.x + 'px'; d.wrap.style.top = q.y + 'px'; }
const signRect = d => d.active ? d.fr.getBoundingClientRect() : null;
function bobEl(el, cls = 'bob'){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 500); }

// ── 문 · 동물
function setDoor(d, ang){ d.angle = ang; d.pivot.rotation.y = -ang * Math.PI / 180; }
function animalIn(d, name){ animalOut(d); const rig = K[name], h = ANIMAL_H[name] * T.BOOTH_H, p = stage.person(rig, { scale: h / rigH(rig) }); scene.remove(p.obj); d.g.add(p.obj); p.obj.position.set(.12, 0, d.front - .62); p.obj.rotation.y = 0; play(p, 'Idle'); p.obj.traverse(m => { if (m.isMesh) m.frustumCulled = false; }); d.animal = p; d.kind = name; }
function animalOut(d){ if (d.animal) { stage.unperson(d.animal); d.animal.obj.parent && d.animal.obj.parent.remove(d.animal.obj); d.animal = null; d.kind = null; } }
async function walkTo(p, to, speed = T.WALK){ const o = p.obj, d = Math.hypot(to.x - o.position.x, to.z - o.position.z); if (d < .02) return; o.rotation.y = Math.atan2(to.x - o.position.x, to.z - o.position.z); play(p, 'Walk'); await stage.tween(o.position, { x: to.x, z: to.z }, d / speed * 1000, t => t); play(p, 'Idle'); }
async function rattle(d){ bobEl(d.wrap, 'rattle'); const a0 = d.angle; tone(150, .14, 'square', .07); tone(120, .16, 'square', .06, .14); for (const da of [-5, 4, -3, 0]) await stage.tween(d.pivot.rotation, { y: -(a0 + da) * Math.PI / 180 }, T.RATTLE_MS / 4); setDoor(d, a0); }

// ── 쟁반 · 물고기
/** 쟁반 위 물고기 한 마리: 옆으로 누워 있다(위에서 옆모습이 보여 세기 쉽다 · 차려 놓은 물고기). 몸 길이 L0. */
function fishObj(name, L0){ const o = cloneRig(K[fishModel(name)].scene); o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } }); const s0 = sizeOf(o), len = Math.max(s0.x, s0.z) || 1; o.scale.multiplyScalar(L0 / len);
  const lie = new THREE.Group(); lie.add(o); if (s0.x > s0.z) { lie.rotation.y = Math.PI / 2; lie.rotation.z = Math.PI / 2; lie.rotation.order = 'YZX'; } else lie.rotation.z = Math.PI / 2;   /* 몸 길이 축으로 눕힌다(모형마다 길이 축이 다르다) */ const b = new THREE.Box3().setFromObject(lie), c = b.getCenter(V(0, 0, 0)); o.position.sub(V(0, 0, 0)); lie.position.set(-c.x, -b.min.y, -c.z); const g = new THREE.Group(); g.add(lie); return g; }
function plateFill(pl, n, kind, rows){ pl.fishG.children.slice().forEach(c => pl.fishG.remove(c)); pl.fish = []; pl.n = n; const spots = R.layout(n, rows);
  spots.forEach(s => { const f = fishObj(kind, s.len); f.userData.s = s; f.position.set(s.x, 0, s.z); f.rotation.y = s.ry; pl.fishG.add(f); pl.fish.push(f); }); }
function plateGlow(pl, on){ pl.glow = on; pl.pl.traverse(m => { if (m.isMesh) { if (!m.userData.own) { m.material = m.material.clone(); m.userData.own = true; } m.material.emissive = new THREE.Color(on ? GLOW : '#000000'); m.material.emissiveIntensity = on ? .55 : 0; } }); }
const plateScreen = pl => stage.screenOf(pl.g.position.clone().add(V(0, pl.top * pl.g.scale.y, 0)));
/** 쟁반 집는 타원(보이는 너비 · 깊이 그대로 — 가운데 문 아래를 먹지 않게) */
const plateR = pl => { const w = pl.g.scale.x, c = pl.g.position, y = c.y + pl.top * w, a = stage.screenOf(V(c.x - w / 2, y, c.z)), b = stage.screenOf(V(c.x + w / 2, y, c.z)), f = stage.screenOf(V(c.x, y, c.z - w / 2)), n = stage.screenOf(V(c.x, y, c.z + w / 2)); return { rx: Math.max(30, Math.abs(b.x - a.x) / 2), ry: Math.max(26, Math.abs(n.y - f.y) / 2 + 12) }; };
const platePx = pl => { const w = pl.g.scale.x, a = stage.screenOf(pl.g.position.clone().add(V(-w / 2, pl.top * w, 0))), b = stage.screenOf(pl.g.position.clone().add(V(w / 2, pl.top * w, 0))); return Math.max(40, Math.hypot(a.x - b.x, a.y - b.y) * T.PLATE_PX); };
async function slideIn(list, fromX){ await Promise.all(list.map((pl, i) => { pl.g.visible = true; pl.g.position.set(fromX, T.DECK, pl.home.z); return sleep(i * 120).then(() => stage.tween(pl.g.position, { x: pl.home.x }, T.SLIDE_MS, t => 1 - (1 - t) ** 3)); })); }
async function slideOut(pl, toX){ const tok = pl.tok; await stage.tween(pl.g.position, { x: toX, z: pl.home.z }, T.SLIDE_MS * .8, t => t * t); if (pl.tok !== tok) return; pl.g.visible = false; pl.active = false; }   /* 그새 다음 문제가 이 쟁반을 다시 쓰면 건드리지 않는다 */
/** 그 물체에 걸린 움직임을 멈춘다(기다리던 쪽은 바로 끝남). */
function stopTweens(o){ for (let i = stage.tweens.length - 1; i >= 0; i--) { const w = stage.tweens[i]; if (w.o === o) { stage.tweens.splice(i, 1); w.res(); } } }
/** 물고기를 하나씩 톡톡 튀며 센다(소리 한 칸씩 오름). */
async function countFish(pl){ const my = S.oid; for (let k = 0; k < pl.fish.length; k++) { if (S.oid !== my) return; const f = pl.fish[k], y0 = f.position.y; tone(392 * Math.pow(2, k / 7), .1, 'triangle', .09); await stage.tween(f.position, { y: y0 + .22 }, T.COUNT_MS * .45, t => t * (2 - t)); await stage.tween(f.position, { y: y0 }, T.COUNT_MS * .55, t => t * t); } }

// ── 띠 · 소리
function trayDraw(){ A.trayClear(); const t = $('tray'), p = S.p; if (!p) return; let h;
  if (S.closed) h = `<i class="w">물고기 ${p.n}${UNIT.fish} ·</i><b class="done">${p.n}</b>`;
  else h = `<i class="w">${p.dir === 'ga' ? '물고기의 수와 같은 숫자는?' : '숫자만큼 있는 쟁반은?'}</i>`;
  t.innerHTML = h; t.className = 'on'; const room = innerWidth * .96; t.style.fontSize = ''; if (t.offsetWidth > room) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room / t.offsetWidth) + 'px'; }
const nameOf = n => `${word(n)}, ${sino(n)}`;   /* 「셋, 삼」 */
const countWords = n => Array.from({ length: n }, (_, i) => word(i + 1)).join(', ');   /* 「하나, 둘, 셋, 넷」 */
function firstLine(){ const p = S.p; if (!p) return ''; if (S.step === 1) return '쟁반을 끌어서 수가 같은 문에 놓아 줘.'; return p.dir === 'ga' ? '쟁반을 끌어서 물고기 수와 같은 숫자 문에 놓아 줘.' : '문의 숫자만큼 있는 쟁반을 끌어서 문에 놓아 줘.'; }
/** 한 줄 안내는 띠 · 문패를 가리지 않게 아래쪽에(쟁반 위) */
function tellLow(){ const tl = $('tell'); if (!tl) return;
  if (S.low) { const tr = $('tray').getBoundingClientRect(); Object.assign(tl.style, { left: '17%', maxWidth: '31vw', fontSize: '1rem', bottom: 'auto', top: Math.round(tr.bottom + 12) + 'px' }); return; }   /* 낮은 가로 화면: 왼쪽 하늘 자리에 작게(쟁반 · 문패를 가리지 않게) */
  Object.assign(tl.style, { left: '', maxWidth: '', fontSize: '' }); const h = tl.offsetHeight || 60, room = innerHeight - (S.tall ? 70 : 30);
  let y = 0; for (const pl of S.plates) if (pl.active && !pl.gone && pl.g.visible) { const w = pl.g.scale.x, q = stage.screenOf(V(pl.home.x, T.DECK, pl.home.z + w / 2)); y = Math.max(y, q.y); }
  tl.style.bottom = 'auto'; tl.style.top = Math.round(y && y + 10 + h <= room ? y + 10 : room - h) + 'px'; }   /* 쟁반 아래 끝 밑에(자리가 없으면 화면 아래) — 띠 · 문패 · 쟁반을 가리지 않게 */

// ── 끌어 놓기(common/drag.js): 집는 것 = 쟁반 · 놓을 곳 = 문(문패 포함)
const canvas = $('c');
const sources = () => { if (!S.p) return []; return S.plates.filter(pl => pl.active && !pl.gone && pl.g.visible).map(pl => ({ id: pl.k, ...plateScreen(pl), ...plateR(pl) })); };
const targets = () => { if (!S.p) return []; return S.doors.filter(d => d.active).map(d => { const m = stage.screenOf(doorMid(d)), top = stage.screenOf(d.g.localToWorld(V(0, T.DOOR_H, d.front))), bot = stage.screenOf(d.g.localToWorld(V(0, 0, d.front))), hw = Math.abs(stage.screenOf(d.g.localToWorld(V(d.dw / 2, T.DOOR_H / 2, d.front))).x - stage.screenOf(d.g.localToWorld(V(-d.dw / 2, T.DOOR_H / 2, d.front))).x) / 2 + 10, sr = signRect(d);
  const rect = { left: Math.min(m.x - hw, sr ? sr.left : 1e9), right: Math.max(m.x + hw, sr ? sr.right : -1e9), top: Math.min(top.y, sr ? sr.top : 1e9), bottom: bot.y }; return { id: d.k, x: m.x, y: m.y, rect }; }); };
const DRAG = DG.drag(canvas, { R: () => R.T.DROP_R, sources, targets,
  claim: ({ x, y }) => { for (const d of S.doors) { const r = d.flipped && signRect(d); if (r && x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8) { audio(); touch(); H.ripple(x, y); unflip(d); return true; } } return false; },   /* 뒤집힌 문패는 돌려놓기만(든 쟁반은 그대로 · 답으로 걸리지 않음) */
  enabled: () => S.ready && S.active && !S.busy && !S.closed && !E.homeOpen(),
  onBusy: ({ x, y }) => { audio(); S.lastAct = S.t; H.ripple(x, y); S.log.push({ ignored: S.active ? 'busy' : 'idle' }); },
  onArm: id => { audio(); touch(); const pl = S.plates[id]; S.log.push({ arm: id }); bobObj(pl.g); tone(600, .07, 'triangle', .06); bobTargets(); },
  onDragStart: id => { audio(); touch(); S.log.push({ dragStart: id }); tone(520, .06, 'triangle', .05); },
  onHover: id => { if (id != null) { const d = S.doors[id]; if (d) bobEl(d.wrap); } },
  onCancel: (id, at) => { touch(); S.log.push({ cancel: id }); if (at) H.ripple(at.x, at.y); tone(300, .1, 'sine', .05); },
  onTap: ({ x, y, target, armed }) => { audio(); touch(); tapOther(x, y, target, armed); },
  onDrop: ({ from, to, how }) => { audio(); touch(); link(from, to, how); } });
function touch(){ S.lastAct = S.t; H.hide(); S.hinting = false; if (!S.gestured) { S.gestured = true; } }
/** 쟁반 들썩 — 제자리 높이는 늘 바닥(T.DECK · 연달아 눌러도 떠 버리지 않게). */
function bobObj(o){ if (o.userData.bob) return; o.userData.bob = true; stage.tween(o.position, { y: T.DECK + .18 }, 130).then(() => stage.tween(o.position, { y: T.DECK }, 160)).then(() => { o.userData.bob = false; o.position.y = T.DECK; }); }
/** 둘째로 누를 곳 들썩(답은 짚지 않는다): (가) 빗장 없는 문 셋 · (나) 문 하나 */
function bobTargets(){ S.log.push({ bob: S.doors.filter(d => d.active && !d.barred).length }); for (const d of S.doors) if (d.active && !d.barred) { bobEl(d.wrap); if (!d.adding) { d.adding = true; stage.tween(d, { add: 7 }, 140).then(() => stage.tween(d, { add: 0 }, 180)).then(() => { d.adding = false; d.add = 0; }); } } }
/** 쟁반 · 문이 아닌 곳의 누름(5-11): 뒤집힌 문패면 돌려놓고 · 아니면 물결 + 손(쟁반) + 한 줄 안내. 들고 있으면 문이 들썩 · (나)에서는 쟁반 셋이 들썩(답은 짚지 않음). */
function tapOther(x, y, target, armed){ H.ripple(x, y);
  if (target != null) { const d = S.doors[target], r = signRect(d); if (d && d.flipped && r && x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8) { unflip(d); return; } }
  S.log.push({ nudge: true, target, armed: armed != null }); tone(520, .07, 'triangle', .05);
  if (armed != null) { bobTargets(); return; }
  const p = S.p; if (!p) return;
  if (p.dir === 'na') { for (const pl of S.plates) if (pl.active && !pl.gone) bobObj(pl.g); }
  else { const pl = S.plates.find(q => q.active && !q.gone); if (pl) { const q = plateScreen(pl); H.show(q.x, q.y); } }
  if (H.tell('match.nudge', firstLine(), { times: 1e9 })) tellLow(); }

// ── 밧줄: 쟁반 → 문 (판정)
async function link(from, to, how){ const p = S.p, my = S.oid; if (!p || !S.active || S.busy) return; const d = S.doors[to], pl = S.plates[from];
  if (!d || !pl) return;
  if (d.barred) { S.log.push({ barredTap: to }); H.ripple(stage.screenOf(doorMid(d)).x, stage.screenOf(doorMid(d)).y); await rattle(d); return; }   /* 빗장 걸린 문: 덜컹(벌 없음 · 깨끗함 그대로) */
  const at = p.dir === 'ga' ? to : from, how2 = R.judge(p, { at }); S.log.push({ link: { from, to }, how: how2, by: how }); S.busy = true; H.hide();
  S.link = { pl, d }; tone(700, .08, 'triangle', .07);
  if (how2 === 'fit') { await fitSeq(pl, d); return; }
  await offSeq(pl, d); if (S.oid !== my) return; S.busy = false; S.lastAct = S.t; }
/** 맞는 문: 쟁반이 줄을 타고 문 앞으로 · 문이 활짝 · 동물이 나와 하나씩 먹으며 문패의 점이 하나씩 · 띠 닫힘 · 「셋, 삼」 */
async function fitSeq(pl, d){ pl.away = true; const my = S.oid, p = S.p, cleanNow = R.clean(S.res), boost = S.step === 2 && cleanNow ? Math.min(S.streak, 3) : 0;
  const others = S.plates.filter(q => q.active && q !== pl && !q.gone); others.forEach(q => slideOut(q, L().from * -1));
  const to = doorFront(d); await stage.tween(pl.g.position, { x: to.x, z: to.z }, T.SLIDE_MS, t => t * (2 - t)); if (S.oid !== my) return; S.link = null; DG.line('link', null);
  for (const o of S.doors) if (o !== d && o.active && !o.barred) setDoor(o, Math.min(o.angle, 4));
  if (d.flipped) unflip(d); stopTweens(d.pivot.rotation); stopTweens(d); d.add = 0; d.adding = false; if (d.animal) stopTweens(d.animal.obj.position);   /* 뒤집힌 문패는 돌아오고 · 빼꼼 중이던 움직임은 멈춤 */
  tone(330 * (1 + .12 * boost), .25, 'sawtooth', .05); await stage.tween(d.pivot.rotation, { y: -(T.OPEN + .08 * boost) }, T.OPEN_MS * (1 - .15 * boost), t => 1 - (1 - t) ** 3); d.angle = (T.OPEN + .08 * boost) * 180 / Math.PI; if (S.oid !== my) return;
  if (d.face === 'chalk') { d.face = 'book'; signDraw(d); bobEl(d.wrap); }   /* 분필 문패: 맞히면 교과서 꼴로 바뀌며 확인 */
  const a = d.animal; if (a) { const w = d.g.worldToLocal(to.clone()); await walkTo(a, V(w.x, 0, w.z - .55), T.WALK * 1.4); if (S.oid !== my) return; a.obj.rotation.y = 0; play(a, 'Eating'); }
  /* 하나씩 먹는다 — 먹을 때마다 문패의 점이 하나씩(걸음 ① 은 이미 있는 점이 반짝 · 걸음 ② 는 켜짐) */
  d.dots = true; if (S.step === 2) d.lit = 0; const lit0 = d.lit;
  for (let k = 0; k < pl.fish.length; k++) { await sleep(R.T.EAT_GAP * 1000); if (S.oid !== my) return; const f = pl.fish[k]; stage.tween(f.scale, { x: .01, y: .01, z: .01 }, 200).then(() => { f.visible = false; });
    if (S.step === 2) d.lit = k + 1; d.flash = k; signDraw(d); tone(440 * Math.pow(2, (k + 2 * boost) / 8), .12, 'triangle', .1); }
  await sleep(300); if (S.oid !== my) return; d.flash = -1; d.lit = p.n; signDraw(d); S.log.push({ fitDots: { k: d.k, step: S.step, start: lit0, end: d.lit, n: d.n, dots: d.dots } });
  if (a) play(a, 'Idle');
  await complete(pl, d); }
/** 아닌 문(가) · 아닌 쟁반(나): 문이 덜컹 · 문패 아래 점이 하나씩(「하나, 둘, 셋, 넷」) · 쟁반의 물고기가 하나씩 톡톡 → (가) 쟁반은 제자리로 · 그 문에 빗장(점은 남음) / (나) 그 쟁반은 물러나고 점은 꺼짐 */
async function offSeq(pl, d){ pl.away = true; const my = S.oid, p = S.p, to = doorFront(d), mid = pl.home.clone().lerp(to, .45);
  await stage.tween(pl.g.position, { x: mid.x, z: mid.z }, T.SLIDE_MS * .55, t => t * (2 - t)); if (S.oid !== my) return;
  if (d.flipped) unflip(d); await rattle(d); if (S.oid !== my) return;
  const wasDots = d.dots, wasLit = d.lit; d.dots = true; TL.say(countWords(d.n));
  const seq = []; for (let k = 0; k < d.n; k++) { if (S.oid !== my) return; if (S.step === 2 || !wasDots) d.lit = k + 1; seq.push(d.lit); d.flash = k; signDraw(d); tone(523 * Math.pow(2, k / 8), .1, 'sine', .08); await sleep(R.T.EAT_GAP * 1000); }
  d.flash = -1; signDraw(d); const peak = d.lit; await sleep(200); if (S.oid !== my) return;
  await countFish(pl); if (S.oid !== my) return; await sleep(250);
  S.link = null; DG.line('link', null);
  if (p.dir === 'ga') { S.res.barred = true; const home = pl.home; await stage.tween(pl.g.position, { x: home.x, z: home.z }, T.SLIDE_MS * .6, t => t * (2 - t)); pl.away = false; pl.g.position.set(pl.home.x, T.DECK, pl.home.z); if (S.oid !== my) return;   /* 돌아갈 때 집을 다시 읽음(그새 화면을 돌렸을 수 있다) */ d.barred = true; d.bar.visible = true; setDoor(d, 0); tone(200, .12, 'square', .06); S.log.push({ barred: d.k }); }
  else { S.res.retreat = true; pl.gone = true; d.dots = wasDots; d.lit = wasLit; signDraw(d); await slideOut(pl, pl.home.x < 0 || (pl.home.x === 0 && Math.random() < .5) ? L().from : -L().from); S.log.push({ retreat: pl.k }); }
  S.log.push({ offDots: { k: d.k, step: S.step, dir: p.dir, before: { dots: wasDots, lit: wasLit }, peak, seq: seq.join(), after: { dots: d.dots, lit: d.lit, barred: d.barred }, n: d.n } }); S.streak = 0; }
/** 해냈다: 띠가 닫히고 · 「셋, 삼」 · 구슬 · 동전 · 동물은 부두에 앉고 · 쟁반은 수레가 싣고 감. */
async function complete(pl, d){ if (!S.active || S.closed) return; const my = S.oid, p = S.p, cleanNow = R.clean(S.res); S.closed = true; trayDraw(); TL.say(nameOf(p.n));
  [523, 659, 784].forEach((f, i) => tone(f * (1 + .06 * Math.min(S.streak, 3)), .12, 'triangle', .1, i * .07));
  if (S.step === 2) { if (cleanNow) { S.streak++; if (S.streak % R.T.STREAK === 0) { confetti(18); S.out.forEach(o => { play(o.p, 'Jump_ToIdle', true); play(o.p, 'Jump_toIdle', true); }); [784, 988, 1175, 1568].forEach((f, i) => tone(f, .18, 'triangle', .1, .25 + i * .09)); S.log.push({ tune: S.streak }); } } else S.streak = 0; }
  if (pl.glow) { if (cleanNow) { await sleep(300); if (S.oid !== my) return; plateGlow(pl, false); confetti(12); tone(1319, .2, 'triangle', .1); wallet.earn(R.T.SURPRISE_COINS, 'match'); S.surpriseCarry = false; S.log.push({ surpriseOpen: true }); } else S.surpriseCarry = true; }
  wallet.earn(R.T.COIN_PER, 'match'); coinsDraw(true);
  await sleep(T.SHOW_MS + 500); if (S.oid !== my) return;
  /* 동물은 부두에 나와 앉는다(판이 끝나면 집으로) */
  const a = d.animal; if (a) { d.animal = null; const wp = new THREE.Vector3(); a.obj.getWorldPosition(wp); d.g.remove(a.obj); scene.add(a.obj); a.obj.position.copy(wp); a.obj.scale.multiplyScalar(d.g.scale.x); const o = { p: a, kind: d.kind, moving: true }; S.out.push(o); S.today.push(d.kind);
    walkTo(a, seatPos(S.out.length - 1), T.WALK * 1.5).then(() => { o.moving = false; a.obj.rotation.y = Math.atan2(-a.obj.position.x, 4 - a.obj.position.z); play(a, 'Idle_2'); }); d.kind = null; }
  slideOut(pl, -L().from); await sleep(450); if (S.oid !== my) return; S.done && S.done('sent'); }
/** 문이 다 닫혔다 — 안에서 「쿨쿨」 · 쟁반은 수레가 도로 싣고 감(표시 · 벌 없음) · 그 문제는 두 문제 뒤에 다시. */
async function miss(){ if (!S.active || S.busy) return; const my = S.oid; S.busy = true; S.res.missed = true; S.streak = 0; DRAG.cancel(); S.log.push({ missed: true }); H.hide();
  for (const d of S.doors) if (d.active) { setDoor(d, 0); zz(d); } S.log.push({ zz: document.querySelectorAll('.zz').length }); tone(196, .4, 'sine', .07); tone(147, .5, 'sine', .06, .35);
  if (S.plates.some(pl => pl.glow)) S.surpriseCarry = true;
  await sleep(700); if (S.oid !== my) return; await Promise.all(S.plates.filter(pl => pl.active && !pl.gone).map(pl => slideOut(pl, L().from))); if (S.oid !== my) return; S.done && S.done('missed'); }
function zz(d){ const q = stage.screenOf(d.g.localToWorld(V(0, T.DOOR_H * .5, d.front + .1))), e = document.createElement('div'); e.className = 'zz'; e.textContent = '쿨쿨…'; e.style.left = q.x + 'px'; e.style.top = q.y + 'px'; document.body.appendChild(e); setTimeout(() => e.remove(), 1700); }
/** 뒤집힌 문패를 눌러 돌려놓는다(깨끗함 그대로). */
function unflip(d){ d.flipped = false; signDraw(d); tone(880, .08, 'triangle', .07); S.log.push({ unflip: d.k }); }
function flip(d){ if (!d.active || d.flipped) return; d.flipped = true; signDraw(d); tone(260, .3, 'sine', .05, 0, 520); S.log.push({ flip: d.k }); }
/** 빼꼼: 문 하나에서 코가 나왔다 들어간다(어느 문인지는 답과 상관없이). */
async function peek(d){ const a = d.animal; if (!a || !S.active) return; S.log.push({ peek: d.k }); const z0 = a.obj.position.z; tone(660, .1, 'triangle', .06); tone(990, .1, 'triangle', .05, .12); d.adding = true;
  await Promise.all([stage.tween(a.obj.position, { z: d.front - .1 }, 380), stage.tween(d, { add: 9 }, 380)]); await sleep(500);   /* 문 벌어짐은 덧값(add) — 닫히는 문 시계가 장면마다 각도를 써도 보인다 */
  await Promise.all([stage.tween(a.obj.position, { z: z0 }, 420), stage.tween(d, { add: 0 }, 420)]); d.adding = false; d.add = 0; }

// ── 한 문제의 시작 · 끝
function resetDoors(){ for (const d of S.doors) { stopTweens(d); d.add = 0; d.adding = false; d.active = false; d.barred = false; d.bar.visible = false; d.flipped = false; d.dots = false; d.lit = 0; d.flash = -1; d.face = 'book'; d.big = false; d.pivot.scale.setScalar(1); setDoor(d, 0); signDraw(d); } }
async function runProblem(p, ctx){ const my = S.oid;
  if (ctx.step === 1 && p.dir !== 'ga') p = { ...p, dir: 'ga' };
  S.p = p; S.step = ctx.step; S.ev = ctx.ev; S.res = { barred: false, retreat: false, hinted: false, missed: false }; S.closed = false; S.clock = 0; S.busy = true; S.link = null; S.hinting = false; DRAG.cancel(); DG.line('link', null);
  resetDoors(); const l = L(), big = ctx.big, kinds = ctx.kinds;
  const chalk = !!ctx.chalk && S.step === 2;
  if (p.dir === 'ga') S.doors.forEach((d, k) => { d.active = true; d.n = p.set[k]; d.dots = S.step === 1; d.lit = d.n; d.face = chalk ? 'chalk' : 'book'; d.big = big; animalIn(d, big ? BIG : kinds[k]); });
  else { const d = S.doors[1]; d.active = true; d.n = p.n; d.dots = false; d.face = chalk ? 'chalk' : 'book'; d.big = big; animalIn(d, big ? BIG : kinds[1]); S.doors[0].active = false; S.doors[2].active = false; animalOut(S.doors[0]); animalOut(S.doors[2]); }
  for (const d of S.doors) { if (d.big) d.pivot.scale.setScalar(T.BIG); setDoor(d, d.active ? R.T.AJAR : 0); signDraw(d); }
  /* 쟁반: (가) 하나 · (나) 셋 — 한 쟁반에는 한 종류 */
  const rows = R.CELLS[S.cell].rows, fk = (rows ? FISH_ROWS : FISH).slice().sort(() => Math.random() - .5);   /* 줄 놓는 낱칸은 밝은 물고기만(작아도 잘 보이게) */ S.plates.forEach(pl => { pl.tok = (pl.tok | 0) + 1; stopTweens(pl.g.position); pl.away = false; pl.snap = false; pl.g.userData.bob = false; pl.active = false; pl.gone = false; pl.g.visible = false; plateGlow(pl, false); });
  const list = p.dir === 'ga' ? [S.plates[1]] : S.plates.slice();
  list.forEach((pl, i) => { pl.active = true; pl.home = plateHome(pl.k); pl.g.scale.setScalar(plateS()); plateFill(pl, p.dir === 'ga' ? p.n : p.set[pl.k], fk[i % fk.length], rows); });
  if (ctx.surprise && p.dir === 'ga') plateGlow(S.plates[1], true);
  trayDraw(); E.marbles(ctx.j, 3, 0); H.hide();
  tone(262, .3, 'sine', .06); await slideIn(list, l.from); if (S.oid !== my) return { abort: true };
  S.log.push({ start: R.key(p), step: S.step, set: p.set.join(), seat: p.seat, ev: Object.keys(S.ev).filter(k => S.ev[k] === true).join(' '), big });
  const firstDir = !S.told[p.dir + S.step]; S.told[p.dir + S.step] = 1;
  const told = (ctx.j === 0 && ctx.firstStep) || firstDir ? H.tell('match.' + S.cell + S.step + p.dir, firstLine(), TELLS()) : false; if (told) { tellLow(); S.log.push({ told: firstLine() }); }
  S.flipAt = ctx.flip && S.step === 2 ? S.t + 1.6 + Math.random() * 2.2 : Infinity; S.flipK = ctx.flip ? R.flipAt(p) : -1;
  S.peekAt = ctx.peek && S.step === 2 ? S.t + 1.4 + Math.random() * 2.4 : Infinity; S.peekK = ctx.peek ? R.peekAt(p) : -1;
  S.active = true; S.busy = false; S.lastAct = S.t + (told ? T.TELL_GRACE : 0);
  const out = await new Promise(res => { S.done = res; }); S.active = false; S.done = null; H.hide(); DRAG.cancel(); if (out === 'abort' || S.oid !== my) return { abort: true };
  const r = { ...S.res, clean: R.clean(S.res), out }; S.log.push({ problem: R.key(p), n: p.n, dir: p.dir, step: S.step, set: p.set.join(), ...r }); return r; }

// ── 나들이(판 셋) · 판(문제 셋)
const TELLS = () => ({ times: M.passed(M.get(S.cell || '')) ? 2 : 1e9 });
async function outing(id){ const my = ++S.oid; E.showBar(true); S.cell = id; S.streak = 0; S.today = []; S.told = {}; clearOut(); const day = M.dayKey(); let prevStep = 0;
  let rec = M.get(id); S.back = M.stuckNow(rec) && !!rec.hand;
  let q = R.deal(id, S.hist[id] || [], Math.random, { small: M.stuck(rec) >= 1 }); if (S.forceP) { S.forceP.forEach((f, k) => { if (q[k]) q[k] = { ...q[k], ...f }; }); S.forceP = null; }   /* 하네스용: 앞 문제들을 정해 줌 */
  S.q = q; E.lanterns(0); S.log.push({ outing: id, deal: q.map(R.key) });
  const b0 = S.startBoard | 0; S.startBoard = 0;   /* 하네스용: 셋째 판부터 */
  for (let b = b0; b < R.T.BOARDS; b++) { rec = M.get(id); const hand = !rec.hand || S.back;
    let ev = R.events(rec.evBoards, Math.random, { passed: M.passed(rec), calm: CALM, hand }); if (S.forceEv) { ev = { ...ev, ...S.forceEv }; S.forceEv = null; }
    if (hand) { q = R.handFix(q, b * R.T.PER_BOARD); S.q = q; }   /* 걸음 ① 판은 (가) 만 */
    if (S.surpriseCarry && !hand) ev.surprise = true;
    const pick = (on, filt) => { if (!on) return -1; const js = [0, 1, 2].filter(j => filt ? filt(q[b * 3 + j]) : true); return js.length ? (ev.at != null && js.includes(ev.at) ? ev.at : js[Math.floor(Math.random() * js.length)]) : -1; };
    const surpJ = pick(ev.surprise, x => x && x.dir === 'ga'), peekJ = pick(ev.peek), flipJ = pick(ev.flip), chalkJ = pick(ev.chalk);
    if (ev.surprise && surpJ < 0) S.surpriseCarry = true;
    const kinds = ANIMALS.slice().sort(() => Math.random() - .5);
    S.board = { b, hand, ev }; S.log.push({ board: b, hand, closeS: R.closeS(id, b), ev: Object.keys(ev).filter(k => ev[k] === true).join(' ') });
    const results = []; E.marbles(0);
    for (let j = 0; j < R.T.PER_BOARD; j++) { const i = b * R.T.PER_BOARD + j, last = b === R.T.BOARDS - 1 && j === R.T.PER_BOARD - 1;
      const r = await runProblem(q[i], { step: hand ? 1 : 2, ev, board: b, j, kinds, big: last, surprise: j === surpJ, peek: j === peekJ, flip: j === flipJ, chalk: j === chalkJ, firstStep: b === 0 || (hand ? 1 : 2) !== prevStep });
      if (S.oid !== my || r.abort) return; results.push(r); E.marbles(j + 1); if (!r.clean) q = R.requeue(q, i); S.q = q; }
    prevStep = hand ? 1 : 2;
    const before = rec; rec = M.record(rec, results, day, { counts: !hand, hand, ev: !hand && !ev.none }); if (hand) S.back = false; else if (M.stuckNow(rec)) S.back = true; M.put(id, rec); S.log.push({ boardEnd: b, clean: M.clean(results), rec: { ...rec } });
    await E.fly($('marbles'), $('coins'), art(ICON.coin), results.filter(r => r.out === 'sent').length); if (S.oid !== my) return; E.lanterns(b + 1); tone(660, .15, 'triangle', .1); tone(990, .2, 'triangle', .1, .12);
    if (!M.passed(before) && M.passed(rec)) { grew(art(ICON.flag) + ' 깃발을 땄어요!'); await sleep(2400); } else if (!M.kept(before) && M.kept(rec)) { grew(art(ICON.star) + ' 깃발에 별이 붙었어요!'); await sleep(2400); }
    if (S.oid !== my) return; if (b < R.T.BOARDS - 1) await goHome(); if (S.oid !== my) return; await sleep(300); if (S.oid !== my) return; }
  S.hist[id] = q; await endScene(id, my); if (S.oid !== my) return;
  const nums = R.pool(id), items = nums.map((n, k) => `<b class="ns" style="--k:${k};display:inline-block"><img class="ns" alt="" src="${NS.numsign(n, { px: 44, dots: true }).toDataURL()}"></b>`);
  const choice = await E.home({ items }); if (S.oid !== my) return;
  if (choice === 'again') outing(id); else location.href = GO; }
/** 판이 끝나면 나와 있던 동물들은 집으로(오늘 나온 동물은 끝 장면에서 다시 한 줄로). */
async function goHome(){ const list = S.out.slice(); S.out = []; await Promise.all(list.map(o => { o.moving = true; return walkTo(o.p, V(o.p.obj.position.x < 0 ? -9 : 9, T.DECK, o.p.obj.position.z), T.WALK * 1.6).then(() => stage.unperson(o.p)); })); }
function clearOut(){ for (const o of S.out) stage.unperson(o.p); S.out = []; for (const o of S.gone) stage.unperson(o); S.gone = []; }
/** 나들이 끝 장면: 창고 문이 모두 열리고 · 오늘 나온 동물들이 부두에 한 줄로 앉아 있다(구경꾼 사슴). */
async function endScene(id, my){ S.p = null; A.trayClear(); resetDoors(); S.plates.forEach(pl => { pl.active = false; pl.g.visible = false; }); clearOut();
  for (const d of S.doors) { animalOut(d); stage.tween(d.pivot.rotation, { y: -T.OPEN }, 700, t => 1 - (1 - t) ** 3); }
  const l = L(), n = S.today.length, per = S.tall ? 5 : 9, rowsN = Math.max(1, Math.ceil(n / per)), gap = Math.min(1.0 * l.U, (S.tall ? 4.0 : 8.4) / Math.min(per, Math.max(1, n)));   /* 전화기 세로는 다섯씩 두 줄(겹치지 않게) */
  S.today.forEach((kind, i) => { const rig = K[kind], h = ANIMAL_H[kind] * T.BOOTH_H * l.U * (S.tall ? .7 : .85), p = stage.person(rig, { scale: h / rigH(rig) }), r = Math.floor(i / per), inRow = Math.min(per, n - r * per), c = i % per; p.obj.position.set((c - (inRow - 1) / 2) * gap, T.DECK, l.pz - .2 + (r - (rowsN - 1) / 2) * 1.1 * l.U); p.obj.rotation.y = 0; play(p, 'Idle_2'); S.gone.push(p); });
  { const rig = K[WATCHER], h = ANIMAL_H[WATCHER] * T.BOOTH_H * l.U, p = stage.person(rig, { scale: h / rigH(rig) }); p.obj.position.set(S.tall ? 1.9 : 4.6, T.DECK, l.bz + 1.6 * l.U); p.obj.rotation.y = -.7; play(p, 'Idle'); S.gone.push(p); }
  S.log.push({ endScene: n }); confetti(14); [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, 'triangle', .1, i * .12)); await sleep(900); }
/** 하네스 · 교사용: 지금 나들이를 거둔다. */
function abort(){ S.oid++; S.active = false; if (S.done) { const d = S.done; S.done = null; d('abort'); } stage.tweens.length = 0; DRAG.cancel(); DG.line('link', null); DG.line('drag', null); A.trayClear();
  S.plates.forEach(pl => { pl.active = false; pl.g.visible = false; plateGlow(pl, false); }); for (const d of S.doors) animalOut(d); resetDoors(); clearOut(); S.p = null; S.busy = false; TL.stop(); H.hide();
  const hm = document.getElementById('home'); if (hm) hm.classList.remove('on'); }

// ── 한 장면의 일
stage.frame((dt, t) => { S.t = t; if (!S.ready) return; for (const d of S.doors) signPlace(d);
  if (S.link) { DG.line('link', plateScreen(S.link.pl), stage.screenOf(handleAt(S.link.d))); }
  const thinking = S.active && !S.busy && !S.closed;
  /* 닫히는 문: 생각하는 동안에만 · 틈의 눈이 점점 가려짐 · 끝이 가까우면 경첩이 끼익 */
  if (thinking && S.ev.close && S.step === 2 && !CALM) { S.clock = Math.min(1, S.clock + dt / R.closeS(S.cell, S.board ? S.board.b : 0));
    if (S.clock > .78 && t - (S.creak || 0) > .35 + (1 - S.clock) * 2.4) { S.creak = t; tone(240 + S.clock * 120, .18, 'sawtooth', .025, 0, 180); }
    if (S.clock >= 1) miss(); }
  if (thinking) for (const d of S.doors) if (d.active && !d.barred) setDoor(d, (S.ev.close && S.step === 2 && !CALM ? R.T.AJAR * (1 - S.clock) : R.T.AJAR) + (d.add || 0));   /* 생각하는 동안 문 각도 = 열린 정도(시계) + 들썩 · 빼꼼 덧값 */
  for (const pl of S.plates) if (pl.snap && pl.active && !pl.away && !stage.tweens.some(w => w.o === pl.g.position)) { pl.snap = false; pl.g.position.set(pl.home.x, T.DECK, pl.home.z); }   /* 화면을 돌린 뒤 움직임이 끝나면 새 자리로 */
  if (thinking && t > S.flipAt) { S.flipAt = Infinity; const d = S.doors[S.flipK]; if (d) flip(d); }
  if (thinking && t > S.peekAt) { S.peekAt = Infinity; const d = S.doors[S.peekK]; if (d) peek(d); }
  /* 길잡이 손: 가만히 있으면 쟁반 → 맞는 문((나)는 맞는 쟁반 → 문). 뜨면 그 문제는 깨끗하지 않음 */
  const wait = R.T.HINT_AFTER * (M.stuck(M.get(S.cell || '')) >= 1 ? .5 : 1);
  if (thinking && t - S.lastAct > wait && !S.hinting && !DRAG.dragging()) { S.hinting = true; S.hintAt = t; S.hintPhase = 0; S.res.hinted = true; S.log.push({ hinted: true }); hintShow(); }
  if (S.hinting && thinking && t - S.hintAt > T.HINT_SWAP) { S.hintAt = t; S.hintPhase ^= 1; hintShow(); }
  if (!thinking && S.hinting) { S.hinting = false; H.hide(); } });
/** 길잡이(답까지): (가) 쟁반 → 맞는 문 · (나) 맞는 쟁반 → 문. */
function hintShow(){ const p = S.p; if (!p) return; const src = p.dir === 'ga' ? S.plates[1] : S.plates[p.seat], dst = p.dir === 'ga' ? S.doors[p.seat] : S.doors[1];
  const q = S.hintPhase ? stage.screenOf(doorMid(dst)) : plateScreen(src); H.show(q.x, q.y); }

window.__match = { S, R, M, E, T, TL, NS, DG, stage, wallet, outing, abort, link, endScene: () => endScene(S.cell, S.oid), gonePos: () => S.gone.map(p => [p.obj.position.x, p.obj.position.z]),
  plateAt: k => { const pl = S.plates[k == null ? S.plates.findIndex(q => q.active && !q.gone) : k]; return pl && pl.active ? plateScreen(pl) : null; },
  doorAt: k => { const d = S.doors[k]; return d && d.active ? stage.screenOf(doorMid(d)) : null; },
  signAt: k => { const r = signRect(S.doors[k]); return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height } : null; },
  /** 하네스: 쟁반 k 의 물고기 한 마리 화면 길이(가장 짧은 것) · 쟁반의 화면 네모 */
  fishPx: k => { const pl = S.plates[k]; if (!pl || !pl.fish.length) return 0; return Math.min(...pl.fish.map(f => { const q = f.userData.s, h = q.len / 2, a = stage.screenOf(pl.fishG.localToWorld(V(q.x - h, 0, q.z))), b = stage.screenOf(pl.fishG.localToWorld(V(q.x + h, 0, q.z))); return Math.hypot(a.x - b.x, a.y - b.y); })); },   /* 그 자리에서 옆으로 누운 몸 길이(방향에 따라 줄어 보이는 것은 빼고) */
  plateBox: k => { const pl = S.plates[k]; if (!pl || !pl.active) return null; const w = pl.g.scale.x, c = pl.g.position, pts = [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([u, v]) => stage.screenOf(V(c.x + u * w / 2, c.y + pl.top * w, c.z + v * w / 2))); return { left: Math.min(...pts.map(q => q.x)), right: Math.max(...pts.map(q => q.x)), top: Math.min(...pts.map(q => q.y)), bottom: Math.max(...pts.map(q => q.y)) }; },
  plateY: k => S.plates[k].g.position.y,
  targets, sources, showRadius: on => DG.showRadius(on ? targets() : null, R.T.DROP_R),
  nFish: k => S.plates[k].fish.filter(f => f.visible).length, signs: () => S.doors.map(d => ({ active: d.active, n: d.n, dots: d.dots, lit: d.lit, face: d.face, flipped: d.flipped, barred: d.barred, numpx: +d.fr.dataset.numpx, angle: d.angle, kind: d.kind, big: d.big })) };
if (!GO_NOW) build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
