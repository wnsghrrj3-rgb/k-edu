/* 케이월드 · 벽란도 — 고려 한 장면(S07, 2026-11-17). 본보기 = 그믐밤, 공통 부품 = ../scene/kit.js.
   목표는 하나(물이 빠지기 전 내 배 다섯 칸 — 부두 끝 물때 깃대가 다 내려가면 배가 떠난다)이고 늘 보인다 · 글 카드 없음 · 행동마다 바로 결과 · 물때를 놓치면 다음 판은 단골 상인 하나가 떠난다.
   흐름: 창고에서 내 물건(🌱인삼·📄종이·🖋️먹·🦪나전칠기)을 집어 → 상인 머리 위 그림(바라는 것·기다림 띠)에 맞게 건네면 은을 받는다 →
         상인 곁 저울 앞에서 스페이스로 은을 한 닢씩 올리고 가만히 서면 셈(모자라면 고개를 젓고 돌려줌 · 딱 맞으면 「딱이오」 · 넘치면 손해) → 산 물건을 내 배에 싣는다.
   청자(언덕 가마)는 걸어서 날라야 한다 — 들고 뛰면 깨진다. 아라비아 상인 곁에 빈손으로 서 있으면 「고려」를 알려 준다. 은병(10닢)으로 큰 짐(12)을 사면 두 칸.
   좌표: x 동쪽(+), z 남쪽(+). 강은 북쪽. */
import * as THREE from 'three';
import { $, clamp, lerp, dist, rng, stage, sunLight, M, box, cyl, at, flatMaker, skyDome, glowSprite, occluders, ringsFx, people, inRect, collideRects, tone, noise, resumeAudio, sayLine, overlay, controls, followCam, fadeOccluders, edgeGoal, overBar, runLoop } from '../scene/kit.js?v=1';

const W = 84, H = 60, BX = [4, 81], BZ = [12.2, 56], TIDE = 260;
const EXP = { ginseng: { i: '🌱', n: '인삼', v: 4, c: 0xd8c890 }, paper: { i: '📄', n: '종이', v: 2, c: 0xf6f2e6 }, ink: { i: '🖋️', n: '먹', v: 2, c: 0x2a2a2a }, najeon: { i: '🦪', n: '나전칠기', v: 3, c: 0x3a2a3a }, celadon: { i: '🏺', n: '청자', v: 6, c: 0x8ac8b0 } };
const IMP = { silk: { i: '🧣', n: '비단', p: 3, c: 0xc04a6a }, book: { i: '📚', n: '책', p: 2, c: 0x8a5a2a }, herb: { i: '🌿', n: '약재', p: 2, c: 0x6a9a4a }, tea: { i: '🍵', n: '차', p: 2, c: 0x4a7a3a }, spice: { i: '🫙', n: '향료', p: 3, c: 0xd88a3a }, big: { i: '📦', n: '큰 짐', p: 12, c: 0xb06a3a, slots: 2 } };
const MER = [
  { k: 'song', name: '송 상인', x: 18, shirt: 0x7a3a2a, hat: 'gat', wants: ['ginseng', 'paper', 'celadon', 'najeon', 'ink'], offers: ['silk', 'book', 'herb', 'tea'], bonus: 0 },
  { k: 'wae', name: '왜 상인', x: 38, shirt: 0x4a5a7a, hat: 'top', wants: ['najeon', 'ginseng', 'ink', 'paper'], offers: [], bonus: 1 },
  { k: 'arab', name: '아라비아 상인', x: 58, shirt: 0xe8e0d0, hat: 'satgat', wants: ['celadon', 'ginseng', 'najeon'], offers: ['spice'], bonus: 0 },
];
const MY_SHIP = 74, GANG = [74, 16.2], TIDEPOLE = [79.5, 13.4];
const PILES = [['ginseng', 8, 22.6], ['paper', 12.5, 22.6], ['ink', 17, 22.6], ['najeon', 21.5, 22.6]], BOTTLE = [26, 22.4], KILN = [68, 48.5];
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); return w + ((c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28) ? a : b); }; /* 받침 따라 을/를 */
const SOLID = [[5, 26, 24, 32, 3.4, 'store'], [64, 50.5, 72, 55, 3, 'kiln'], [30, 24, 34, 26.5, 2, 'stall'], [40, 24, 44, 26.5, 2, 'stall'], [50, 24, 54, 26.5, 2, 'stall']];
for (const m of MER) SOLID.push([m.x + 2.4, 13.5, m.x + 4, 15, 1, 'scale']);
const seed0 = +(new URLSearchParams(location.search).get('seed') || (Date.now() % 100000));

/* ───── 화면 ───── */
const { canvas, renderer, scene, cam, resize } = stage({ fog: [0xf2d6b0, 80, 230], exposure: 1.08 });
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x6a7a5a, 1.3); scene.add(hemi);
const sun = sunLight(scene, { color: 0xfff1d6, intensity: 2.1, box: [48, 36], far: 160, pos: [W / 2 - 34, 50, H / 2 + 30], target: [W / 2, 0, H / 2] });
addEventListener('resize', resize); resize();
const rnd = rng(20261123);
const sky = skyDome(scene, rnd, { top: 0x74aae8, low: 0xffe4bc });
const flat = flatMaker(scene);
const { occl, group } = occluders(scene);
const { person, walkAnim } = people(scene);
const { ring, update: ringsUpdate } = ringsFx(scene);

/* 땅 · 강 · 부두 · 창고 · 저잣거리 · 언덕 가마 */
flat(-60, 11, W + 60, H + 30, 0x8ab85a, 0);
const mud = flat(-60, 4, W + 60, 11.2, 0x9a8460, -0.1);
const riverG = new THREE.PlaneGeometry(W + 160, 60, 60, 10); riverG.rotateX(-Math.PI / 2);
const river = new THREE.Mesh(riverG, new THREE.MeshStandardMaterial({ color: 0x3a8ad8, roughness: 0.25, metalness: 0.15, flatShading: true })); river.position.set(W / 2, 0.05, -18); scene.add(river);
const riverBase = riverG.attributes.position.array.slice();
flat(-60, -60, W + 60, -46, 0x6a9a4a, 0.4);
flat(6, 11, 81, 15.2, 0x9a6a3a, 0.25);
for (let x = 8; x <= 80; x += 3) scene.add(at(cyl(0.2, 0.2, 2, 0x6a4526, 6), x, -0.6, 10.9));
flat(4, 15.2, 81, 22, 0xd8c8a0, 0.03); flat(26, 22, 58, 30, 0xd2c098, 0.03); flat(60, 30, 76, 56, 0xb8a878, 0.03);
for (let i = 0; i < 70; i++) { const t = box(0.6 + rnd(), 0.08, 0.5 + rnd(), rnd() > 0.5 ? 0x9ac86a : 0x7aa84a); t.castShadow = false; at(t, 4 + rnd() * 76, 0.05, 22 + rnd() * 33); scene.add(t); }
{ const P = [at(box(19, 3, 6, 0xd8c09a), 14.5, 1.5, 29)], r = box(20.5, 0.6, 7.5, 0x5a4a3a); at(r, 14.5, 3.3, 29); P.push(r); P.push(at(box(3, 2.2, 0.15, 0x5a3a1a), 14.5, 1.1, 25.9)); group([5, 26, 24, 32], P); }
for (const s of SOLID.filter((s) => s[5] === 'stall')) { scene.add(at(box(s[2] - s[0], 0.9, s[3] - s[1], 0x9a7a50), (s[0] + s[2]) / 2, 0.45, (s[1] + s[3]) / 2), at(box(s[2] - s[0] + 0.6, 0.12, s[3] - s[1] + 0.8, 0xe8d0a0), (s[0] + s[2]) / 2, 2.2, (s[1] + s[3]) / 2)); for (const dx of [s[0] + 0.1, s[2] - 0.1]) scene.add(at(cyl(0.06, 0.06, 2.2, 0x6a4526, 5), dx, 1.1, s[1] + 0.1)); }
{ const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), M(0x9a6a48)); m.scale.set(4.2, 2.6, 2.6); m.position.set(68, 1.2, 52.7); m.castShadow = true; scene.add(m); scene.add(at(box(1.2, 1.2, 0.2, 0x2a1a10), 68, 0.8, 50.1)); }
const kilnGlow = glowSprite(scene, 'rgba(255,180,100,.9)', 'rgba(255,100,40,0)', 3); kilnGlow.position.set(68, 1.2, 50);
const kilnSmoke = []; for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0xd8d4cc, transparent: true, opacity: 0.4, depthWrite: false })); s.userData.k = k / 5; scene.add(s); kilnSmoke.push(s); }
/* 배: 송 · 왜 · 아라비아 · 내 배 */
function ship(x, hull, sail, sailShape) { const g = new THREE.Group(); g.add(at(box(9, 1.4, 3.4, hull), 0, 0.6, 0), at(box(2.4, 1.2, 3, hull), 4.6, 1.2, 0), at(box(2.4, 1.2, 3, hull), -4.6, 1.2, 0), at(box(8.6, 0.12, 3, 0xb98a55), 0, 1.36, 0), at(cyl(0.12, 0.14, 7, 0x6a4526, 6), 0, 4.8, 0));
  const s = sailShape === 'tri' ? (() => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0, 5); sh.lineTo(3.6, 0); sh.closePath(); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), M(sail, { side: THREE.DoubleSide })); m.position.set(0.15, 2.4, 0); return m; })() : at(box(0.1, 4, 3.6, sail), 0.2, 4.4, 0);
  g.add(s); g.userData.sail = s; g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); g.position.set(x, 0, 6.6); scene.add(g); return g; }
const ships = [ship(18, 0x8a4a2a, 0xe8d0a0), ship(38, 0x5a4a3a, 0xf0e8d8), ship(58, 0x6a5040, 0xf6f0e0, 'tri')];
const myShip = ship(MY_SHIP, 0x7a5a3a, 0xd8c8b0);
const slotM = Array.from({ length: 5 }, (_, i) => { const m = box(1.2, 0.9, 1.2, 0xffffff); m.position.set(-3 + i * 1.5, 1.85, 0); m.visible = false; myShip.add(m); return m; });
/* 물때 깃대 */
scene.add(at(cyl(0.1, 0.12, 6, 0x6a4526, 6), TIDEPOLE[0], 3, TIDEPOLE[1]));
const tideFlag = box(1.4, 0.9, 0.06, 0x3a7ad8); tideFlag.position.set(TIDEPOLE[0] + 0.75, 5.5, TIDEPOLE[1]); scene.add(tideFlag);
const goalPos = new THREE.Vector3(GANG[0], 2.2, GANG[1] - 1);
/* 창고 앞 물건 더미 · 은병 · 저울 */
const piles = PILES.map(([k, x, z]) => { const g = new THREE.Group(); for (let n = 0; n < 5; n++) g.add(at(box(0.7, 0.5, 0.6, EXP[k].c), (n % 3) * 0.75 - 0.75, 0.25 + Math.floor(n / 3) * 0.5, 0)); g.position.set(x, 0, z); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g; });
const bottle = new THREE.Group(); bottle.add(at(cyl(0.3, 0.42, 0.7, 0xd8d8e0, 10, { metalness: 0.6, roughness: 0.3 }), 0, 0.85, 0), at(cyl(0.12, 0.18, 0.4, 0xd8d8e0, 8, { metalness: 0.6, roughness: 0.3 }), 0, 1.4, 0), at(box(1, 0.5, 0.8, 0x6a4526), 0, 0.25, 0)); bottle.position.set(BOTTLE[0], 0, BOTTLE[1]); scene.add(bottle);
const bottleGlow = glowSprite(scene, 'rgba(230,236,255,.85)', 'rgba(180,200,255,0)', 2.4); bottleGlow.position.set(BOTTLE[0], 1.3, BOTTLE[1]);
const scales = MER.map((m) => { const g = new THREE.Group(); g.add(at(box(1.6, 0.8, 1.2, 0x6a4526), 0, 0.4, 0), at(cyl(0.05, 0.05, 1, 0x8a7a5a, 5), 0, 1.3, 0)); const beam = new THREE.Group(); beam.position.y = 1.8; beam.add(at(box(1.4, 0.06, 0.06, 0x8a7a5a), 0, 0, 0)); const pL = at(cyl(0.3, 0.3, 0.05, 0xc8a050, 10), -0.65, -0.3, 0), pR = at(cyl(0.3, 0.3, 0.05, 0xc8a050, 10), 0.65, -0.3, 0); beam.add(pL, pR); g.add(beam); g.position.set(m.x + 3.2, 0.25, 14.2); scene.add(g); return { g, beam, pL, pR }; });
/* 사람 */
const SKIN = 0xf0c48e;
const pMesh = person({ shirt: 0x5a8a9a, pants: 0x4a5a5a, hat: 'gat', skin: SKIN });
const pRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.84, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing);
const carryM = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.5), M(0xffffff)); carryM.visible = false; scene.add(carryM);
const shards = Array.from({ length: 8 }, () => { const s = box(0.14, 0.05, 0.12, 0x8ac8b0); s.visible = false; scene.add(s); return { m: s, t: 9, vx: 0, vy: 0, vz: 0 }; });
const merMesh = MER.map((m) => { const p = person({ shirt: m.shirt, pants: 0x3a3a3a, hat: m.hat, skin: m.k === 'arab' ? 0xc89a6a : SKIN }); p.position.set(m.x, 0.25, 13.6); p.rotation.y = 0; return p; });
const potter = person({ shirt: 0x8a7a6a, pants: 0x5a4a3a, hat: 'top', skin: SKIN }); potter.position.set(70.4, 0, 48.6); potter.rotation.y = -Math.PI / 2;
const townsfolk = [[33, 28], [46, 27.5], [52, 28.4], [28, 19]].map(([x, z], i) => { const m = person({ shirt: [0xb89a70, 0xa89070, 0xc0a880, 0x9a8a68][i], pants: 0x6a5034, hat: 'top', skin: SKIN }); m.position.set(x, 0, z); m.rotation.y = i; return m; });
const tagBox = $('tags'); const mkTag = () => { const d = document.createElement('div'); d.className = 'tag'; tagBox.appendChild(d); return d; };
const merTags = MER.map(mkTag), scaleTags = MER.map(mkTag), pileTags = PILES.map(mkTag), tagKiln = mkTag(), tagBottle = mkTag(), tagGang = mkTag();

/* ───── 소리 ───── */
const SFX = {
  pick: () => tone(660, 990, 0.12, 'triangle', 0.16),
  coin: () => { tone(1800, 2200, 0.08, 'square', 0.06); tone(2400, 2600, 0.1, 'triangle', 0.08, 0.05); },
  deal: () => { tone(523, 659, 0.16, 'triangle', 0.14); tone(784, 1047, 0.22, 'triangle', 0.14, 0.12); },
  no: () => { tone(300, 200, 0.3, 'sawtooth', 0.08); },
  crash: () => { for (let i = 0; i < 6; i++) noise(0.08, 0.35, 2800 + i * 400, i * 0.04); },
  load: () => { noise(0.2, 0.3, 300); tone(200, 160, 0.2, 'sine', 0.1); },
  bell: () => { tone(880, 870, 0.8, 'sine', 0.1); },
  horn: () => { tone(180, 190, 1.2, 'sawtooth', 0.09); tone(270, 280, 1.2, 'sine', 0.06); },
  beat: (v) => { tone(62, 40, 0.12, 'sine', v); tone(54, 36, 0.14, 'sine', v * 0.8, 0.16); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  sad: () => { tone(330, 220, 1.0, 'sine', 0.14); tone(262, 175, 1.2, 'sine', 0.1, 0.4); },
};

/* ───── 상태 ───── */
const S = { mode: 'title', round: 1, view: 0, yaw: 0, yawT: 0, zoom: 1, camYaw: -Math.PI / 2, t: 0, k: 0, px: 30, pz: 20, pdir: -Math.PI / 2, moving: false, running: false, said: {}, sayT: 0,
  silver: 2, carry: null, slots: [], deals: 0, celadonOk: 0, broken: 0, kilnT: 99, named: false, bottleUsed: false, bottleTaken: false, friends: new Set(), lost: 0, over: 0,
  mer: MER.map(() => ({ wi: 0, oi: 0, pat: 1, pan: 0, panBottle: false, lastAdd: -9, gone: false })), workT: 0, workKey: '', endT: 0, shown: false, introT: 0, beatT: 0, stepT: 0, goneK: null };
const { say, tick: sayTick } = sayLine(S);
const ctl = controls(S, say), keys = ctl.keys;
if (ctl.isTouch) $('keys').textContent = '왼쪽 동그라미로 걷기 · 「뛰기」(청자는 깨진다) · 가만히 서면 집고·건넨다 · 저울 앞에서 「은 올리기」 뒤 가만히 서면 셈 · 「시점」 ⟲⟳';
const offerOf = (i) => { const m = MER[i], st = S.mer[i]; if (!m.offers.length) return null; if (m.k === 'arab' && (st.panBottle || S.carry === 'bottle') && !S.bottleUsed) return 'big'; return m.offers[st.oi % m.offers.length]; };
const wantOf = (i) => MER[i].wants[S.mer[i].wi % MER[i].wants.length];

function resetRound(full) {
  if (full) { S.round = 1; S.goneK = null; }
  const r = rng(seed0 * 5 + S.round * 77);
  Object.assign(S, { t: 0, k: 0, px: 30, pz: 20, pdir: -Math.PI / 2, silver: 3, carry: null, slots: [], deals: 0, celadonOk: 0, broken: 0, kilnT: 99, named: false, bottleUsed: false, bottleTaken: false, friends: new Set(), lost: 0, over: 0, workT: 0, endT: 0, shown: false });
  S.mer = MER.map((m) => ({ wi: Math.floor(r() * m.wants.length), oi: Math.floor(r() * Math.max(1, m.offers.length)), pat: 1, pan: 0, panBottle: false, lastAdd: -9, gone: m.k === S.goneK }));
  merMesh.forEach((p, i) => (p.visible = !S.mer[i].gone)); bottle.visible = true; bottleGlow.visible = true; slotM.forEach((m) => (m.visible = false));
  ships.forEach((s, i) => { s.position.set(MER[i].x, 0, 6.6); s.rotation.y = 0; }); myShip.position.set(MY_SHIP, 0, 6.6);
  $('fade').style.opacity = 0; lightFor(0); hud();
}
function hud() {
  $('hSilver').textContent = '🪙 ' + S.silver;
  const c = S.carry, label = !c ? '손 비었음' : c === 'bottle' ? '⚱ 은병(10닢)' : EXP[c] ? EXP[c].i + ' ' + EXP[c].n : IMP[c].i + ' ' + IMP[c].n;
  $('hCarry').textContent = label + (c ? ' 들었음' : '');
  const sl = $('slots').children; for (let i = 0; i < 5; i++) { const s = S.slots[i]; sl[i].textContent = s ? IMP[s].i : ''; sl[i].className = s ? 'on' : ''; }
  $('tCel').className = S.celadonOk ? 'on' : ''; $('tName').className = S.named ? 'on' : ''; $('tBottle').className = S.bottleUsed ? 'on' : '';
  slotM.forEach((m, i) => { m.visible = !!S.slots[i]; if (S.slots[i]) m.material.color.set(IMP[S.slots[i]].c); });
}

/* ───── 저울: 스페이스 = 은 한 닢(은병을 들었으면 은병) ───── */
const atScale = () => MER.findIndex((m, i) => !S.mer[i].gone && dist(S.px, S.pz, m.x + 3.2, 16.5) < 1.6);
function act() {
  if (S.mode !== 'play') return;
  const i = atScale(); if (i < 0) return;
  const st = S.mer[i], off = offerOf(i);
  if (!off) return say(MER[i].name + '은 팔 물건이 없다 — 은만 준다', null, 2);
  if (S.carry && S.carry !== 'bottle') return say('먼저 들고 있는 것을 내려놓자(배·상인에게)', null, 1.8);
  if (S.carry === 'bottle') { S.carry = null; st.panBottle = true; st.pan += 10; st.lastAdd = S.t; SFX.coin(); SFX.coin(); hud(); say('은병을 저울에 올렸다 — 10닢', null, 1.8); return; }
  if (S.silver < 1) return say('은이 없다 — 내 물건을 상인에게 팔아 은을 받자', null, 2);
  S.silver--; st.pan++; st.lastAdd = S.t; SFX.coin(); hud();
}
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) act(); });
$('bAct').addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });
canvas.addEventListener('pointerdown', () => { if (S.mode === 'intro') S.introT = 99; });
function settle(i) { /* 가만히 서서 셈 */
  const st = S.mer[i], off = offerOf(i), price = IMP[off].p, pan = st.pan;
  if (pan < price) { S.silver += st.panBottle ? pan - 10 : pan; if (st.panBottle) S.carry = 'bottle'; st.pan = 0; st.panBottle = false; SFX.no(); say(`고개를 젓는다 — ${price}닢인데 ${pan}닢. 돌려받았다`, null, 2.6); hud(); return 'under'; }
  const extra = pan - price; S.carry = off; st.pan = 0; if (st.panBottle) { S.bottleUsed = true; st.panBottle = false; } if (off !== 'big') st.oi++; S.deals++; S.friends.add(MER[i].k); S.over += extra; SFX.deal();
  say(extra === 0 ? `딱 맞다! ${IMP[off].i} ${josa(IMP[off].n, '을', '를')} 샀다 — 내 배로` : `${josa(IMP[off].n, '을', '를')} 샀지만 ${extra}닢 더 줬다(손해)`, null, 2.6); hud(); return extra === 0 ? 'exact' : 'over';
}

/* ───── 끝 ───── */
function finish(full) { S.mode = 'sail'; S.endT = 0; S.endFull = full; SFX.horn(); say(full ? '내 배가 가득 찼다 — 돛을 올린다!' : '물이 빠졌다 — 배들이 떠난다', null, 2.8); }
function endScreen() {
  const n = S.slots.length, full = S.endFull;
  const marks = `<div class="marks"><span class="${S.deals ? 'ok' : ''}">⚖ 마친 거래 ${S.deals}</span><span class="${S.celadonOk ? 'ok' : ''}">🏺 온전한 청자 ${S.celadonOk}${S.broken ? ` · 깨짐 ${S.broken}` : ''}</span><span class="${S.silver ? 'ok' : ''}">🪙 남은 은 ${S.silver}</span><span class="${S.friends.size ? 'ok' : ''}">🌏 사귄 상인 ${S.friends.size}${S.named ? ' · 「코리아」' : ''}</span></div>`;
  const facts = `<div class="fact">📜 <b>벽란도</b> — 고려 서울 개경에서 가까운 예성강 나루로, 여러 나라 배가 드나든 큰 무역항이었다.<br>📜 <b>오간 물건</b> — 고려는 인삼·종이·먹·나전칠기를 내보내고, 비단·책·약재·차를 들여왔다.<br>📜 <b>아라비아 상인</b> — 먼 서쪽 상인들도 향료와 산호를 싣고 왔다. 「코리아」라는 이름이 이때 퍼졌다.<br>📜 <b>청자</b> — 고려 사람들은 흙에 무늬를 파고 다른 흙을 메워 굽는 상감 청자를 만들었다.</div>`;
  if (full) overlay(`<h1>돛을 올린다</h1><p>노을 속에 배들이 돛을 올린다. 내 배에는 ${S.slots.map((s) => IMP[s].i).join(' ')} 이 실렸다.${S.named ? ' 아라비아 배에서 누군가 「코리아!」 하고 손을 흔든다.' : ''}</p>${marks}<p class="keys">이 나루에서 고려의 이름이 먼 바다 건너까지 실려 갔다.</p>${facts}`, '한 번 더', () => { resetRound(true); S.mode = 'play'; });
  else { const leave = MER.find((m) => m.k !== 'arab' && m.k !== S.goneK) || MER[1];
    overlay(`<h1>물이 빠졌다</h1><p>빈 칸 ${5 - n}개를 남긴 채 배가 떠났다.${n === 0 ? ' 내 배는 텅 비었다.' : ''}</p>${marks}<p>다음 물때 — 단골이던 <b>${leave.name}</b>이 다른 가게로 갔다.</p><p class="keys">${S.round + 1}번째 물때 · 깃발은 다시 오른다.</p>`, '다음 물때', () => { S.round++; S.goneK = leave.k; resetRound(false); S.mode = 'play'; say(leave.name + '이 떠났다 — 남은 상인과 거래하자', null, 3); }); }
}

/* ───── 하늘 ───── */
const SKY = [[0, 0x74aae8, 0xffe4bc, 0xfff1d6, 2.1, 1.3], [0.6, 0x7aa0d8, 0xffd0a0, 0xffe0b0, 1.9, 1.2], [0.85, 0x6a6aa8, 0xff9a5a, 0xffa060, 1.5, 1.0], [1.0, 0x4a4a88, 0xe8706a, 0xff8a60, 1.1, 0.8], [1.2, 0x2a2a5a, 0xc0506a, 0xff8050, 0.7, 0.6]];
const cT = new THREE.Color(), cL = new THREE.Color(), tc = new THREE.Color(); let lastSky = -1;
function lightFor(k) { let a = SKY[0], b = SKY[SKY.length - 1]; for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = clamp((k - a[0]) / ((b[0] - a[0]) || 1), 0, 1); cT.set(a[1]).lerp(tc.set(b[1]), t); cL.set(a[2]).lerp(tc.set(b[2]), t);
  if (Math.abs(k - lastSky) > 0.004) { sky.paint(cT, cL); lastSky = k; } scene.fog.color.copy(cL); sun.color.set(a[3]).lerp(tc.set(b[3]), t); sun.intensity = lerp(a[4], b[4], t); hemi.intensity = lerp(a[5], b[5], t);
  const az = lerp(2.3, 3.0, clamp(k, 0, 1)), el = lerp(1.0, 0.18, clamp(k, 0, 1)); sun.position.set(W / 2 + Math.cos(az) * Math.cos(el) * 70, Math.sin(el) * 70 + 4, H / 2 + Math.sin(az) * Math.cos(el) * 70); }

/* ───── 한 걸음 ───── */
const v3 = new THREE.Vector3();
function showTag(el, x, y, z, html) { if (!html) { el.style.display = 'none'; return; } const q = v3.set(x, y, z).project(cam); if (q.z > 1) { el.style.display = 'none'; return; } el.style.display = 'block'; el.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; el.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; if (el._h !== html) { el.innerHTML = html; el._h = html; } }
function update(dt) {
  S.t += dt; sayTick(dt); ringsUpdate(dt);
  const lvl = S.mode === 'play' || S.mode === 'sail' ? -clamp(S.k, 0, 1) * 0.7 : 0; river.position.y = 0.05 + lvl;
  { const p = riverG.attributes.position; for (let i = 0; i < p.count; i++) { const x = riverBase[i * 3], z = riverBase[i * 3 + 2]; p.setY(i, Math.sin(x * 0.3 + S.t * 1.1) * 0.1 + Math.cos(z * 0.5 + S.t * 0.8) * 0.07); } p.needsUpdate = true; }
  [...ships, myShip].forEach((s, i) => { s.position.y = lvl + Math.sin(S.t * 1.3 + i) * 0.06; s.rotation.z = Math.sin(S.t * 0.9 + i) * 0.02; });
  kilnGlow.material.opacity = 0.6 + Math.sin(S.t * 7) * 0.2; for (const s of kilnSmoke) { const k = (s.userData.k + S.t * 0.1) % 1; s.position.set(68 + Math.sin(k * 5) * 0.4, 3 + k * 7, 52.7); s.scale.setScalar(0.5 + k * 1.4); s.material.opacity = (1 - k) * 0.4; }
  bottleGlow.material.opacity = 0.5 + Math.sin(S.t * 3) * 0.2;
  for (const s of shards) if (s.t < 1.5) { s.t += dt; s.vy -= 9 * dt; s.m.position.x += s.vx * dt; s.m.position.y = Math.max(0.05, s.m.position.y + s.vy * dt); s.m.position.z += s.vz * dt; if (s.t >= 1.5) s.m.visible = false; }
  if (S.mode === 'title' || S.mode === 'intro') { if (S.mode === 'intro') { S.introT += dt; if (S.introT > 4.2) { S.mode = 'play'; SFX.bell(); say('상인 머리 위 그림이 바라는 물건이다 — 창고에서 집어 오자', null, 3.4); } } place(dt); return; }
  if (S.mode === 'sail') { S.endT += dt; [...ships, myShip].forEach((s, i) => { s.position.z -= dt * (1.2 + i * 0.2); s.userData.sail.scale.y = Math.min(1.3, 1 + S.endT * 0.1); }); lightFor(Math.min(1.1, Math.max(S.k, 0.85) + S.endT * 0.04)); if (S.endT > 5 && !S.shown) { S.shown = true; endScreen(); } place(dt); return; }
  if (S.mode !== 'play') return;

  /* 물때 */
  S.k = S.t / TIDE; lightFor(S.k); $('tide').querySelector('i').style.width = clamp(S.k, 0, 1) * 100 + '%'; tideFlag.position.y = lerp(5.5, 0.8, clamp(S.k, 0, 1));
  if (S.k > 0.8) say('물이 많이 빠졌다 — 곧 배가 떠난다!', 'late', 3);
  if (S.k >= 1) return finish(false);
  S.kilnT += dt;

  /* 나 — 청자를 들고 뛰면 깨진다 */
  let { ix, iz, back } = ctl.read(dt);
  const il = Math.hypot(ix, iz); S.moving = il > 0.15; S.running = S.moving && ctl.running();
  if (S.moving) { ix /= Math.max(1, il); iz /= Math.max(1, il); const sp = (S.running ? 4.8 : 3.1) * (back ? 0.6 : 1); const [nx, nz] = collideRects(SOLID, S.px + ix * sp * dt, S.pz + iz * sp * dt, 0.42); S.px = clamp(nx, BX[0], BX[1]); S.pz = clamp(nz, BZ[0], BZ[1]); if (S.view !== 2) S.pdir = Math.atan2(iz, ix); S.stepT -= dt * (S.running ? 2 : 1); if (S.stepT <= 0) { S.stepT = 0.42; noise(0.05, 0.05, 300); } }
  if (S.carry === 'celadon' && S.running) { S.carry = null; S.broken++; SFX.crash(); for (const s of shards) { s.t = 0; s.vx = (rnd() - 0.5) * 4; s.vy = 2 + rnd() * 2; s.vz = (rnd() - 0.5) * 4; s.m.position.set(S.px, 1.4, S.pz); s.m.visible = true; } say('쨍그랑! 청자가 깨졌다 — 청자는 걸어서 날라야 한다', null, 3); hud(); }
  if (S.carry === 'celadon') say('청자를 들었다 — 뛰면 깨진다. 천천히', 'celwalk', 2.6);

  /* 상인: 기다림 띠 */
  S.mer.forEach((st, i) => { if (st.gone) return; st.pat -= dt / 50; if (st.pat <= 0) { st.pat = 1; st.wi++; SFX.no(); if (dist(S.px, S.pz, MER[i].x, 16) < 14) say(MER[i].name + '이 기다리다 지쳐 다른 것을 찾는다', null, 2); } });

  /* 가만히 서서: 창고 물건 · 은병 · 청자 · 상인에게 건네기 · 「고려」 · 저울 셈 */
  let job = null, need = 1, arg = null;
  PILES.forEach(([k, x, z], i) => { if (!job && !S.carry && dist(S.px, S.pz, x, z - 1.4) < 1.8) { job = 'pile'; need = 0.6; arg = k; } });
  if (!job && !S.carry && !S.bottleTaken && dist(S.px, S.pz, BOTTLE[0], BOTTLE[1] - 1.2) < 1.8) { job = 'bottle'; need = 0.8; }
  if (!job && !S.carry && dist(S.px, S.pz, KILN[0], KILN[1]) < 1.9 && S.kilnT > 20) { job = 'kiln'; need = 1.4; }
  MER.forEach((m, i) => { if (!job && !S.mer[i].gone && dist(S.px, S.pz, m.x, 16.2) < 1.7) { if (S.carry && EXP[S.carry]) { job = 'give'; need = 0.6; arg = i; } else if (!S.carry && m.k === 'arab' && !S.named) { job = 'name'; need = 1.3; arg = i; } } });
  const si = atScale(); if (!job && si >= 0 && S.mer[si].pan > 0 && S.t - S.mer[si].lastAdd > 0.2) { job = 'settle'; need = 1.3; arg = si; }
  if (job && job === S.workKey && !S.moving) S.workT += dt; else { S.workT = job && !S.moving ? dt : 0; S.workKey = job; }
  if (job === 'settle' && S.t - S.mer[si].lastAdd < 0.25) S.workT = 0;
  overBar($('work'), cam, S.px, 2.6, S.pz, job && S.workT > 0.05 ? S.workT / need : null);
  if (job && S.workT >= need) { S.workT = 0;
    if (job === 'pile') { S.carry = arg; SFX.pick(); say(`${EXP[arg].i} ${EXP[arg].n} — 바라는 상인에게`, null, 2); }
    if (job === 'bottle') { S.carry = 'bottle'; S.bottleTaken = true; bottle.visible = false; bottleGlow.visible = false; SFX.pick(); say('은병 — 은 10닢 값. 아라비아 상인 저울에 올리면 큰 짐을 판다', null, 3.2); }
    if (job === 'kiln') { S.carry = 'celadon'; S.kilnT = 0; SFX.pick(); say('상감 청자 — 가장 큰 값을 받는다. 걸어서!', null, 2.6); }
    if (job === 'give') { const m = MER[arg], st = S.mer[arg], w = wantOf(arg);
      if (S.carry === w) { const pay = EXP[w].v + m.bonus; S.silver += pay; if (w === 'celadon') S.celadonOk++; S.carry = null; st.wi++; st.pat = 1; S.deals++; S.friends.add(m.k); SFX.coin(); SFX.deal(); ring(m.x, 14, 2.4, 0xffcf4d); say(`${m.name}이 ${josa(EXP[w].n, '을', '를')} 받고 은 ${pay}닢을 준다`, null, 2.4); }
      else { SFX.no(); say(`${m.name}은 ${josa(EXP[S.carry].n, '이', '가')} 아니라 ${EXP[w].i}${josa(EXP[w].n, '을', '를')} 바란다`, null, 2.4); } }
    if (job === 'name') { S.named = true; S.friends.add('arab'); SFX.deal(); say('"이 나라 이름은 「고려」요." — "코리아! 코리아!" 그가 따라 말한다', null, 3.4); }
    if (job === 'settle') settle(arg);
    hud(); }
  /* 산 물건을 내 배에 싣는다 */
  if (S.carry && IMP[S.carry] && dist(S.px, S.pz, GANG[0], GANG[1]) < 2.2) { const n = IMP[S.carry].slots || 1; for (let k = 0; k < n && S.slots.length < 5; k++) S.slots.push(S.carry); S.carry = null; SFX.load(); ring(GANG[0], GANG[1] - 2, 2.6, 0xffcf4d); hud(); say(S.slots.length >= 5 ? '다섯 칸이 다 찼다!' : `내 배에 실었다 — ${5 - S.slots.length}칸 남았다`, null, 1.8); if (S.slots.length >= 5) return finish(true); }
  if (S.carry && IMP[S.carry]) say('산 물건 — 부두 동쪽 끝 내 배로', 'toship', 2.4);
  place(dt);

  /* 조임 */
  const late = clamp((S.k - 0.65) * 2.8, 0, 1), impatient = Math.max(...S.mer.map((st) => (st.gone ? 0 : 1 - st.pat))) > 0.8 ? 0.35 : 0, fragile = S.carry === 'celadon' ? 0.3 : 0;
  const tension = Math.max(late, impatient, fragile); S.beatT -= dt; if (tension > 0.15 && S.beatT <= 0) { S.beatT = lerp(1.1, 0.4, tension); SFX.beat(0.06 + tension * 0.26); }
  $('vig').style.boxShadow = `inset 0 0 ${120 + tension * 120}px ${30 + tension * 70}px rgba(${late > impatient ? '120,30,60' : '200,60,20'},${tension * 0.45})`;
  $('bAct').className = 'btn' + (atScale() >= 0 ? ' show' : '');
}
function place(dt) {
  pMesh.position.set(S.px, 0, S.pz); pMesh.rotation.y = -S.pdir + Math.PI / 2; walkAnim(pMesh, S.t * (S.running ? 16 : 10), S.moving); pRing.position.set(S.px, 0.11, S.pz);
  carryM.visible = !!S.carry; if (S.carry) { carryM.position.set(S.px, 1.95, S.pz); carryM.material.color.set(S.carry === 'bottle' ? 0xd8d8e0 : (EXP[S.carry] || IMP[S.carry]).c); }
  merMesh.forEach((p, i) => { p.rotation.y = Math.atan2(S.px - MER[i].x, S.pz - 13.6) * 0.6; walkAnim(p, 0, false); });
  scales.forEach((s, i) => { const st = S.mer[i], off = offerOf(i); const d = off ? clamp((st.pan - IMP[off].p) * 0.12, -0.35, 0.35) : 0; s.beam.rotation.z = lerp(s.beam.rotation.z, d, 0.15); s.pL.position.y = -0.3 - Math.sin(s.beam.rotation.z) * 0.6; s.pR.position.y = -0.3 + Math.sin(s.beam.rotation.z) * 0.6; });
  const play = S.mode === 'play';
  MER.forEach((m, i) => { const st = S.mer[i]; if (st.gone) { merTags[i].style.display = scaleTags[i].style.display = 'none'; return; } const d = dist(S.px, S.pz, m.x, 15);
    const w = wantOf(i), html = play && d < 22 ? `${EXP[w].i}<small>${m.k === 'arab' && !S.named && d < 6 ? ' 🗺️❓' : ''}</small><span class="wait"><i style="width:${st.pat * 100}%;background:${st.pat < 0.25 ? '#c0392b' : '#3aa860'}"></i></span>` : null; showTag(merTags[i], m.x, 2.9, 13.6, html);
    const off = offerOf(i), ds = dist(S.px, S.pz, m.x + 3.2, 16.5); showTag(scaleTags[i], m.x + 3.2, 1.3, 14.6, play && off && ds < 6 ? `⚖ ${IMP[off].i} <b>${IMP[off].p}</b>닢 · 올린 🪙 <b class="${st.pan === IMP[off].p ? 'ok' : st.pan > IMP[off].p ? 'no' : ''}">${st.pan}</b>` : null); });
  PILES.forEach(([k, x, z], i) => showTag(pileTags[i], x, 1.8, z, play && dist(S.px, S.pz, x, z) < 8 ? EXP[k].i : null));
  showTag(tagKiln, KILN[0], 2.4, KILN[1] + 1.2, play && dist(S.px, S.pz, KILN[0], KILN[1]) < 9 ? (S.kilnT > 20 ? '🏺 <small>걸어서</small>' : '🔥⏳') : null);
  showTag(tagBottle, BOTTLE[0], 2.2, BOTTLE[1], play && !S.bottleTaken && dist(S.px, S.pz, BOTTLE[0], BOTTLE[1]) < 8 ? '⚱ <small>10닢</small>' : null);
  showTag(tagGang, GANG[0], 2.6, GANG[1] - 1.4, play && dist(S.px, S.pz, GANG[0], GANG[1]) < 12 ? `⛵ ${S.slots.length}/5` : null);
}
function view() {
  if (S.mode === 'title' || S.mode === 'intro') { const k = S.mode === 'intro' ? clamp(S.introT / 3.6, 0, 1) : 0, e = k * k * (3 - 2 * k);
    cam.position.set(lerp(58, 34, e), lerp(9, 36, e), lerp(24, 44, e)); cam.lookAt(lerp(58, 34, e), lerp(2, 0, e), lerp(8, 18, e)); if (cam.fov !== 44) { cam.fov = 44; cam.updateProjectionMatrix(); } }
  else if (S.mode === 'sail') { v3.set(56, 12, 30); cam.position.lerp(v3, 0.03); cam.lookAt(50, 2, 4); }
  else followCam(cam, S, { W, H, clampZ: [4, H - 6], map: { h: [96, 176], z: 6, look: -2 } });
  fadeOccluders(occl, cam, S, S.mode === 'play');
  edgeGoal($('goal'), cam, goalPos, S.mode === 'play', 0.8);
}

resetRound(true); place(0.016);
$('go').onclick = () => { resumeAudio(); $('ov').style.display = 'none'; S.mode = 'intro'; S.introT = 0; SFX.horn(); };
runLoop(update, view, () => renderer.render(scene, cam));
window.__scene = { S, update, keys, ctl, act, settle, offerOf, wantOf, atScale,
  go() { $('go').click(); S.introT = 99; update(0.01); }, tp(x, z) { S.px = x; S.pz = z; }, view(n) { S.view = n; },
  step(sec) { for (let i = 0; i < sec * 30; i++) update(1 / 30); },
  stand(sec) { ctl.sx = ctl.sz = 0; for (let i = 0; i < sec * 30 && S.mode === 'play'; i++) update(1 / 30); },
  walk(pts, run, maxSec = 120) { let t = 0; for (const [x, z] of pts) { let stuck = 0; while (S.mode === 'play' && Math.hypot(x - S.px, z - S.pz) > 0.5 && t < maxSec) { const l = Math.hypot(x - S.px, z - S.pz), ox = S.px, oz = S.pz; ctl.sx = (x - S.px) / l; ctl.sz = (z - S.pz) / l; ctl.run = !!run; update(1 / 30); t += 1 / 30; if (Math.hypot(S.px - ox, S.pz - oz) < 0.005) { if (++stuck > 45) break; } else stuck = 0; } } ctl.sx = ctl.sz = 0; ctl.run = false; return { t: +t.toFixed(1), mode: S.mode }; },
  const: { MER, PILES, BOTTLE, KILN, GANG, EXP, IMP } };
