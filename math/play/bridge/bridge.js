/* 다리 길 — 1학년 「10 만들기」. 설계: 핸드오프 kmotion/math-wizard/25_수학놀이터_네곳_설계_v1.md 3절 · 묶음 N01·N02.
 * 건너편 섬에서 누가 손을 흔든다. 앤은 판자 뗏목 넷을 끌고 끊어진 다리 셋을 이어 데리러 간다. 뗏목은 떠날 때 실은 것이 전부다.
 * 딱 맞으면 다리가 이어져 건넌다 · 넘치면 건너되 남는 판자는 물에 떨어져 사라진다 · 모자라면 놓은 판자는 남고 앤이 끝에서 고개를 젓는다.
 * 틈마다 빈 칸 수가 팻말에 적혀 있다. 셋을 다 이으면 「놓은 판자는 모두 몇 장?」 또는 「남은 나무는 몇 장?」을 고른다.
 * 흥미진진(N01·N02): 길마다 섞인다 — 시계(밀물 · 해적선 · 뒤에서 무너지는 다리) × 손(물살 · 상어) × 수(밤 다리: 팻말이 꺼지고 놓인 수만 · 쌍둥이 틈: 한 화면에 틈 둘) · 큰 길(틈 다섯).
 *   생각하는 동안에만 시계가 간다. 쉬어 가는 땅의 통에서는 덤 뗏목 · 물고기 · 지도 조각. 연달아 딱 맞추면 더 빨리 달린다. 늦으면 주민을 놓치고(벌·표시 없음) 새 길에서 다시 만난다.
 * 들어갈 뗏목이 없으면 낱 판자가 한 장씩 떠내려온다(막히지 않는다). 아껴 쓰고 남은 뗏목은 우리 선착장 나무 더미가 되어 광장으로 간다.
 * 가위표·정답 표시·점수·설명 글 없음. 무대는 ../common/stage3d.js, 팻말·띠·끝의 셈은 ../common/ask.js, 규칙은 ./rules.js.
 * 화면은 기성 3D 재료(Quaternius Pirate Kit, CC0)만 — 판자·받침·기둥은 선착장 모형을 조각으로 나눠 그대로 쓴다(assets/CREDITS.md). */
import { createStage, THREE, LITE, CALM, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=1';
import * as R from './rules.js?v=6';
import { wallet, audio, tone, art } from '../common/kit.js?v=8';
import * as LP from '../common/loop.js?v=2';
import * as H from '../common/hint.js?v=3';   /* 첫 판 한 줄 안내 · 손 그림 */
const CARGO = !new URLSearchParams(location.search).has('free');   /* ?free = 화물 싣기 없이(옛 방식, 하네스용) */

// ── 내가 정한 수치(준호가 보고 바꾼다)
const T = { PICK_PX: 70, DECK: 1.0, SLOT: 0.4, PLANK_W: 1.3, RAFT_GAP: .36, RAFT_STAG: .16, RAFT_SPACE: .9, SLOTS_SHOWN: false,      // 뗏목 판자는 촘촘히·엇갈리게(세어야 한다)
  SEG: 8,      // 틈과 틈 사이(다리 4 + 땅 4) · 쌍둥이 틈은 가운데 땅이 없어 4
  WALK: 1.5, RUN: 4.4, STREAK_RUN: .14, STREAK_MAX: 4, TIDE: .9, HURRY: .6, BEAT: .7, DRIFT: .45, DRIFT_HZ: .8, SHIP_Z: -4.2, SHIP_S: 1.0, SHIP_RY: Math.PI,
  PLANK_MS: 240, RAFT_Z: 3.1, RAFT_Y: .2, DROP_X: [-0.7, 4.7], DROP_Z: 1.9, START_X: -1.25, END_X: 5.3,
  INTRO_HOLD: [1500, 700], INTRO_MS: [3400, 2200], SINGLE_MS: 1700, HINT_MS: 5000, LEARN: 2, LEARN_HINT_MS: 2200,   // 처음 두 주민을 데려올 때까지: 빈 칸·뗏목 장 수를 보여 주고 손이 빨리 뜬다
  HOME_MAX: 6, PILE_MAX: 12, GHOST: .5, LAND: '#a59a92',
  NIGHT: { HEMI: .32, SUN: .25, SKY: ['#0d1630', '#24345c', '#3b4f7a'], FOG: 0x1c2a48, GLOW: .55, LIGHT: 6 },   // 밤 다리: 빛의 세기 · 하늘 · 놓인 판자의 빛 · 등불 빛
  FALL_FROM: -6.5, TWIN_ZOOM: 1.32, BIG_ZOOM: 1.0, LONG_ZOOM: 1.5, PILLAR: .5,   // 스무 칸 다리: 카메라를 물리는 정도 · 가운데 돌기둥 자리(판자 칸 사이 너비)
                    // 무너지는 다리가 시작하는 곳 · 쌍둥이 틈일 때 카메라를 물리는 정도
  SHARK: { P: .6, SEC: 5.5, S: 1.3, Z: 4.4, R: 3.4, TAP_PX: 95 },   // 상어: 낱 판자를 노릴 확률 · 닿기까지(생각하는 시간, 초) · 크기 · 도는 자리
  TINT: ['#ffd49a', '#a9dcff', '#c8f2ae', '#ffb9cf', '#dcc6ff', '#fff0a0'] };   // 주민 빛깔(앤·헨리 모형에 번갈아)
const $ = id => document.getElementById(id), HOME = 2;
const EXTRA = ['Ship_Large', 'Fish_Shark'];   /* 있으면 쓰는 모형: 해적선(돛 달린 큰 배) · 상어 */

// ── 무대
const stage = createStage({ canvas: $('c'), seaX: 20, seaW: 200 }), { scene, camera, sea, sun, hemi } = stage;
const TIDE_DARK = new THREE.Color(0x14506e), DAY_FOG = scene.fog.color.clone(), NIGHT_FOG = new THREE.Color(T.NIGHT.FOG);
const cam = { x: HOME, y: 6, z: 10, lz: 1.4, zoom: 1, wide: 1 };
const load = stage.load, put = stage.put;

// ── 저장(지갑의 다리 칸): saved = 데려온 주민 수 · wood = 나무 더미의 판자 수 · fish = 물고기 양동이. 지도 조각은 광장 칸(map). 동의 전에는 화면이 열려 있는 동안만.
const SAVE = wallet.island('bridge'); SAVE.saved = Math.max(0, SAVE.saved | 0); SAVE.wood = Math.max(0, SAVE.wood | 0); SAVE.fish = Math.max(0, SAVE.fish | 0);
const PLAZA = wallet.island('plaza'); PLAZA.map = Math.max(0, PLAZA.map | 0);
const S = { voy: null, gi: 0, filled: 0, fill: [], gx: [], dest: 0, bridge: [], ghosts: [], rafts: [], busy: true, ready: false, intro: false, skip: false, drag: null, anne: null, guest: null, people: stage.people, home: [], pile: [], rigs: [], tweens: stage.tweens, t: 0, log: [], drops: 0, voyages: 0, ev: null, clock: 0, rise: 0, streak: 0, missing: false, barrels: [], loot: [], fish: 0, kit: null, chaser: null, buckets: [], course: null, crumble: [], front: -99, nightK: 0, loaded: 0, placed: 0, lost: 0, ask: null, signs: null, mapGot: 0 };
const ox = k => S.gx[k] != null ? S.gx[k] : k * T.SEG;
/* 틈 k 의 칸 수(10 · 스무 칸 다리 20)와 다리 길이(10칸 = 4, 20칸 = 8 + 돌기둥) */
const slotsOf = k => (S.voy && S.voy.gaps[k] && S.voy.gaps[k].slots) || R.SLOTS, span = k => slotsOf(k) > R.SLOTS ? R.SLOTS * 2 * T.SLOT + T.PILLAR : 4;
window.__bridge = { S, R, T, SAVE, ox, cam, sea, CALM };

let dk = null;   /* 선착장 조각(판자·받침·기둥) */
async function build(){
  const names = ['Environment_Dock', 'Characters_Anne', 'Characters_Henry', 'Environment_Cliff1', 'Environment_Cliff4', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_2', 'Environment_Rock_4', 'Prop_Barrel', 'Prop_Bucket_Fishes', 'Ship_Small', 'Environment_Rock_5'];
  const [dock, anne, henry, cliffL, cliffR, palm1, palm3, rock1, rock2, rock4, barrel, bucket, ship, pillar] = await Promise.all(names.map(load));
  const opt = n => load(n).catch(() => null), [shipL, shark] = await Promise.all(EXTRA.map(opt));   /* 꾸러미에서 더 꺼낼 것(내려받지 못했으면 없이 돎) */
  dk = stage.dockKit(dock); S.mat = dk.mat; S.plankGeo = dk.planks; S.plankH = dk.plankH;
  S.ghostMat = S.mat.clone(); S.ghostMat.transparent = true; S.ghostMat.opacity = T.GHOST; S.ghostMat.depthWrite = false; S.ghostMat.emissive = new THREE.Color('#ffffff'); S.ghostMat.emissiveIntensity = .3;
  S.glowMat = S.mat.clone(); S.glowMat.emissive = new THREE.Color('#ffc86a'); S.glowMat.emissiveIntensity = T.NIGHT.GLOW;
  S.landMat = S.mat.clone(); S.landMat.color.set(T.LAND);
  S.kit = { dock, barrel, bucket, ship, shipL, shark, rock1, rock2, rock4, palm1, palm3, cliffR, pillar };
  // 우리 섬(왼쪽) — 늘 그대로
  put(cliffL, -7.4, 0, -2.2, 1.0, .4); put(palm1, -5.8, 1.9, -2.6, 1.0, .5); put(rock2, -4.6, 0, 1.4, 1.3, .3); put(rock1, -5.4, 0, 2.8, 1.2); put(rock1, 1.6, 0, -3.6, 1.0, 2); put(ship, -8, 0, -17, .9, .5);
  S.chaser = put(shipL || ship, -6, 0, T.SHIP_Z, shipL ? .55 : T.SHIP_S, T.SHIP_RY); S.chaser.visible = false;
  if (shark) { const p = stage.person(shark, { scale: T.SHARK.S }); scene.remove(p.obj); p.obj.rotation.y = Math.PI / 2; const w = new THREE.Group(); w.add(p.obj); w.position.set(0, -.1, T.SHARK.Z); w.visible = false; scene.add(w); stage.play(p, 'Swimming_Normal'); S.shark = { o: w, mode: 'idle', k: 0, target: null, from: new THREE.Vector3(), cool: false }; }   /* 모형은 +z 를 봄 → 감싼 쪽이 +x */
  S.lamp = new THREE.PointLight(0xffc86a, 0, 9, 1.6); S.lamp.position.set(0, T.DECK + 1.6, .6); scene.add(S.lamp);
  for (let i = 0; i < Math.min(SAVE.fish, 4); i++) S.buckets.push(put(bucket, -5.4 + i * .5, T.DECK, .62, .5, i));
  // 사람: 앤(무기는 숨김) · 주민은 앤·헨리 모형에 번갈아 빛깔
  S.rigs = [anne, henry]; S.anne = stage.person(anne); S.anne.obj.position.set(T.START_X, standY(), 0); stage.face(S.anne, 1); stage.play(S.anne, 'Idle');
  for (let i = 0; i < Math.min(SAVE.saved, T.HOME_MAX); i++) { const p = resident(i); p.obj.position.copy(homeSpot(i)); stage.face(p, 1); stage.play(p, 'Idle'); S.home.push(p); }
  for (let i = 0; i < Math.min(SAVE.wood, T.PILE_MAX); i++) pileAdd(plank(i));
  stage.onResize = resize; stage.resize(); newVoyage(); $('loading').style.opacity = 0; setTimeout(() => $('loading').hidden = true, 500); S.ready = true;
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 처음으로 돌아가요'; document.body.appendChild(n); }
  intro(); }

// ── 사람
const standY = () => T.DECK + .18 * .62;
const resident = i => stage.person(S.rigs[(i + 1) % S.rigs.length], { tint: T.TINT[i % T.TINT.length] });
const runSpeed = () => T.RUN * (1 + T.STREAK_RUN * Math.min(S.streak, T.STREAK_MAX));
const go = (p, x, run = false) => stage.go(p, x, run ? runSpeed() : T.WALK, run);
const homeSpot = i => new THREE.Vector3(-2.3 - (i >> 1) * .62, standY(), i % 2 ? .55 : -.55);

// ── 판자
const slotX = (k, i) => ox(k) + T.SLOT / 2 + i * T.SLOT + (i >= R.SLOTS ? T.PILLAR : 0), plankY = () => T.DECK - S.plankH / 2;
function plank(i, mat = S.mat){ const m = new THREE.Mesh(S.plankGeo[Math.abs(i) % S.plankGeo.length], mat); m.scale.x = T.PLANK_W; m.castShadow = mat !== S.ghostMat; m.receiveShadow = true; m.userData.k = i; scene.add(m); return m; }
function pileAdd(p){ const i = S.pile.length; p.rotation.set(0, Math.PI / 2, 0); p.position.set(-4.3 + (i % 2) * .08, T.DECK + S.plankH * (Math.floor(i / 2) + .5), i % 2 ? .22 : -.22); p.scale.set(T.PLANK_W, 1, .5); S.pile.push(p); }

// ── 길(코스): 틈 자리 · 양쪽 땅(조각으로 지어 무너질 수 있게) · 쉬어 가는 바위 · 통 · 건너편 섬. 길마다 새로 짓는다(쌍둥이 틈 · 큰 길).
function layoutGaps(ev, longAt = -1){ const n = ev.gaps, gx = []; let x = 0, twinAt = -1; if (ev.twin) twinAt = Math.floor(Math.random() * (n - 1));
  for (let k = 0; k < n; k++) { gx.push(x); x += (k === twinAt ? 4 : T.SEG) + (k === longAt ? R.SLOTS * T.SLOT + T.PILLAR : 0); } return { gx, twinAt }; }
function landDock(g, cx){ const y0 = T.DECK - 0.49; for (const p of dk.frame) { const m = new THREE.Mesh(p.geo, S.landMat); m.position.set(cx, y0, 0); g.add(stage.shadows(m)); }
  dk.planks.forEach((geo, i) => { const m = new THREE.Mesh(geo, S.landMat); const c = dk.plankAt[i]; m.position.set(cx + c.x, y0 + c.y, c.z); m.castShadow = m.receiveShadow = true; g.add(m); S.crumble.push({ m, x: m.position.x }); }); }
function buildCourse(){ if (S.course) { scene.remove(S.course); } const g = new THREE.Group(); scene.add(g); S.course = g; S.crumble = []; const K = S.kit, n = S.gx.length, y0 = T.DECK - 0.49;
  const add = (o, x, y, z, s = 1, ry = 0) => { const c = o.scene.clone(); c.position.set(x, y, z); c.scale.setScalar(s); c.rotation.y = ry; g.add(stage.shadows(c)); return c; };
  landDock(g, -5); landDock(g, -3);
  for (let k = 0; k < n; k++) { const before = k === 0 || ox(k) - ox(k - 1) > span(k - 1), after = k === n - 1 || ox(k + 1) - ox(k) > span(k), L = span(k);
    if (before) landDock(g, ox(k) - 1); if (after) landDock(g, ox(k) + L + 1);
    const long = slotsOf(k) > R.SLOTS, half = R.SLOTS * T.SLOT + T.PILLAR;   /* 스무 칸: 받침 넷 + 가운데 돌기둥 */
    if (long) { const c = K.pillar.scene.clone(); c.position.set(ox(k) + R.SLOTS * T.SLOT + T.PILLAR / 2, .5, 0); c.scale.set(.95, 3, .95);   /* 돌기둥은 판자 위로 조금 솟아 열 칸과 열 칸을 가른다 */ g.add(stage.shadows(c)); }
    for (const cx of long ? [ox(k) + 1, ox(k) + 3, ox(k) + half + 1, ox(k) + half + 3] : [ox(k) + 1, ox(k) + 3]) for (const p of dk.frame) { const m = new THREE.Mesh(p.geo, S.mat); m.position.set(cx, y0, 0); g.add(stage.shadows(m)); }
    if (k < n - 1 && after) { const x = ox(k) + L + 2; add(K.rock2, x - .2, -.2, -2.3, 2.0, k * 1.3); add(K.rock4, x + 1.1, 0, -1.6, 1.5, 1 + k); add(k % 2 ? K.palm3 : K.palm1, x - .1, .9, -2.5, .8, k * 2); add(K.rock1, x + 3.6, 0, -3.9, 1.0, k + 2); } }
  const D = S.dest; landDock(g, D + 2.6); add(K.cliffR, D + 5.8, 0, -1.8, .82, -.6); add(K.palm3, D + 4.4, 2.6, -3.0, 1.0, 2.0); add(K.palm1, D + 6.2, 2.0, .6, .8, 1.2); add(K.rock4, D + 2.6, 0, 1.9, 1.4, 1); add(K.rock4, D + 3.8, 0, 4.4, 1.1, .7);
  add(K.barrel, D + 3.2, T.DECK, -.6, .7, .4); add(K.bucket, D + 3.3, T.DECK, .6, .6, -.8);
  for (const b of S.barrels) if (b) scene.remove(b); S.barrels = []; for (let k = 0; k < n - 1; k++) S.barrels.push(ox(k + 1) - ox(k) > span(k) ? put(K.barrel, ox(k) + span(k) + 2.2, T.DECK, -.6, .7, k + .4) : null); }

// ── 한 번의 길 차리기
const active = () => { const k = S.gi; return S.voy && k + 1 < S.voy.gaps.length && ox(k + 1) - ox(k) <= span(k) ? [k, k + 1] : [k]; };   /* 쌍둥이 틈이면 지금 틈 둘 */
function newVoyage(){ for (const b of S.bridge) for (const p of b) if (p) scene.remove(p); for (const g of S.ghosts) for (const p of g) if (p) scene.remove(p); for (const r of S.rafts) { for (const p of r.planks) scene.remove(p); scene.remove(r.group); }
  S.ev = R.event(SAVE.saved, Math.random, { shark: !!S.kit.shark });
  S.voy = R.voyage(Math.random, { first: SAVE.saved === 0 && S.voyages === 0, prev: S.voy && S.voy.gaps.length === S.ev.gaps ? S.voy : null, gaps: S.ev.gaps, long: S.ev.long, longAt: S.ev.long && SAVE.saved === R.MIX.FIRST.long ? 0 : undefined });
  const L = layoutGaps(S.ev, S.voy.long != null ? S.voy.long : -1); S.gx = L.gx; S.dest = ox(S.ev.gaps - 1) + span(S.ev.gaps - 1) + .4; S.voyages++; S.gi = 0; S.rafts = []; S.bridge = []; S.ghosts = [];
  const nN = S.ev.night; S.nightGaps = new Set(nN ? (SAVE.saved === R.MIX.FIRST.night ? [1] : S.voy.gaps.map((_, i) => i).sort(() => Math.random() - .5).slice(0, nN)) : []);
  buildCourse();
  S.voy.gaps.forEach((g, k) => { const N = slotsOf(k), b = Array(N).fill(null), gh = Array(N).fill(null);
    for (let i = 0; i < N; i++) { if (i < g.have) { b[i] = plank(i + k * 3); b[i].position.set(slotX(k, i), plankY(), 0); } else if (T.SLOTS_SHOWN || SAVE.saved < T.LEARN) { gh[i] = plank(i, S.ghostMat);   /* 처음 두 길은 빈 칸을 흐린 판자로 보여 준다 */ gh[i].position.set(slotX(k, i), plankY() - .01, 0); } } S.bridge.push(b); S.ghosts.push(gh); });
  S.fill = S.voy.gaps.map(g => g.have); S.filled = S.fill[0]; /* N04 화물 싣기: 데려온 주민이 둘이 되면 떠나기 전에 동전으로 판자를 싣는다(그 전 두 길은 뗏목을 선물로) */
  S.loading = CARGO && LP.cargoOn(); if (S.loading) S.voy.cargo = []; const help = LP.takeHelp(); if (help) { S.voy.cargo.push(help); S.log.push({ help }); }
  if (LP.has('stairs')) { const g = LP.GIVES.STAIRS_RAFT, n = g[0] + Math.floor(Math.random() * (g[1] - g[0] + 1)); S.voy.cargo.push(n); S.log.push({ stairs: n }); }   /* 광장의 계단: 길마다 덤 뗏목 */
  S.voy.cargo.forEach((n, j) => raft(n, j)); S.loaded = S.voy.cargo.reduce((a, b) => a + b, 0); S.placed = 0; S.lost = 0; layout(0);
  S.anne.obj.position.set(T.START_X, standY(), 0); S.anne.obj.visible = true; stage.face(S.anne, 1); stage.play(S.anne, 'Idle');
  if (S.guest) stage.unperson(S.guest); S.guest = resident(SAVE.saved); S.guest.obj.position.set(S.dest + 2.2, standY(), -.5); stage.face(S.guest, -1); stage.play(S.guest, 'Wave');
  for (const o of S.loot) scene.remove(o); S.loot = []; S.fish = 0; S.mapGot = 0;
  S.dropsV = 0;
  if (S.shark) { S.shark.mode = 'idle'; S.shark.target = null; S.shark.cool = false; }
  S.clock = 0; S.rise = 0; S.front = -99; S.missing = false; S.chaser.visible = S.ev.kind === 'ship' && !CALM; A.flames(S.streak);
  const nG = S.voy.gaps.reduce((a, g) => a + (g.slots > R.SLOTS ? 2 : 1), 0); S.signs = A.signs(nG + (SAVE.saved < T.LEARN ? 8 : 0)); S.raftSigns = S.signs.slice(nG); S.raftSigns.forEach(e => e.classList.add('rs')); S.signs = S.signs.slice(0, nG); A.trayClear(); S.ask = null; S.qkind = R.askKind(S.voyages);
  S.log.push({ voyage: S.voy.gaps.map(g => g.have), cargo: S.voy.cargo.slice(), ev: S.ev.kind + (S.ev.drift ? '+drift' : '') + (S.ev.night ? '+night' + S.ev.night : '') + (S.ev.twin ? '+twin' : '') + (S.ev.shark ? '+shark' : '') + (S.ev.big ? '+big' : '') + (S.voy.long != null ? '+long' : ''), night: [...S.nightGaps] }); }

// ── 수 팻말(틈마다 빈 칸 수, 놓을수록 준다) · 밤 다리는 팻말이 꺼지고 놓인 판자 쪽 기둥에 「놓인 수」만
const roomOf = k => slotsOf(k) - S.fill[k];
function signsDraw(){ if (!S.signs) return;
  /* 처음 두 길: 뗏목 위에 장 수(끌고 있는 뗏목도) */ if (S.raftSigns && S.raftSigns.length) { const rs = live(); S.raftSigns.forEach((e, i) => { const r = rs[i]; if (!r || S.ask || S.intro) { A.signDraw(e, null); return; } const q = stage.screenOf(r.group); A.signDraw(e, { x: q.x, y: q.y - 26 }, r.n); }); }
  let si = 0; S.voy.gaps.forEach((g, k) => { const e = S.signs[si++], room = roomOf(k), have = S.fill[k], done = k < S.gi && !active().includes(k);
  if (slotsOf(k) > R.SLOTS) { const e2 = S.signs[si++], [a, b] = R.tens(have, slotsOf(k)), y = T.DECK + .95, inS = v => { const q = stage.screenOf(v); q.x = Math.max(70, Math.min(innerWidth - 70, q.x)); return q; };   /* 팻말은 화면 안으로 당김 */   /* 스무 칸: 「10까지 3」 · 「그다음 10」 */
    if (done || !room) { A.signDraw(e, null); A.signDraw(e2, null); return; }
    A.signDraw(e, a ? inS(new THREE.Vector3((slotX(k, have) + slotX(k, R.SLOTS - 1)) / 2, y, 0)) : null, a, '', '10까지');
    A.signDraw(e2, inS(new THREE.Vector3((slotX(k, Math.max(R.SLOTS, have)) + slotX(k, slotsOf(k) - 1)) / 2, y, 0)), b, '', a ? '그다음' : '20까지'); return; }
  if (!room || done) { A.signDraw(e, null); return; }
  if (S.nightGaps.has(k)) { A.signDraw(e, stage.screenOf(new THREE.Vector3(ox(k) + Math.max(.4, have / 2 * T.SLOT), T.DECK + .95, 0)), have, 'night', '놓인'); return; }
  A.signDraw(e, stage.screenOf(new THREE.Vector3(ox(k) + (have + R.SLOTS) / 2 * T.SLOT, T.DECK + .95, 0)), room); }); }

function raft(n, j, single = false){ const g = new THREE.Group(); scene.add(g); const r = { n, group: g, home: new THREE.Vector3(0, T.RAFT_Y, T.RAFT_Z), planks: [], used: false, single, ph: j * 1.7 };
  for (let k = 0; k < n; k++) { const p = plank(k + j * 3); scene.remove(p); p.position.set((k - (n - 1) / 2) * T.RAFT_GAP, 0, (k % 2 ? 1 : -1) * T.RAFT_STAG * (n > 1 ? 1 : 0)); g.add(p); r.planks.push(p); } S.rafts.push(r); return r; }
const live = () => S.rafts.filter(r => !r.used);
const spanMid = () => { const a = active(), l = a[a.length - 1]; return (ox(a[0]) + ox(l) + span(l)) / 2; };
/** 남은 뗏목을 지금 틈 앞 물 위에 나란히 세운다(ms 가 있으면 물결을 타고 옮겨 간다). */
/* 전화기 세로에서 스무 칸 다리: 다리 전체 대신 지금 채우는 열 칸에 카메라를 맞춘다(첫 열 칸이 차면 다음 열 칸으로) */
const longTall = () => innerHeight > innerWidth && slotsOf(S.gi) > R.SLOTS && active().length === 1;
const longFocus = k => ox(k) + R.SLOTS * T.SLOT / 2 + (S.fill[k] >= R.SLOTS ? R.SLOTS * T.SLOT + T.PILLAR : 0);
const rowMid = () => longTall() ? longFocus(S.gi) : spanMid();
function layout(ms){ const rs = live(), w = rs.map(r => r.n * T.RAFT_GAP), all = w.reduce((a, b) => a + b, 0) + (rs.length - 1) * T.RAFT_SPACE, room = 2 * (cam.halfW || 5) * cam.wide * .92, jobs = [];
  /* 뗏목이 화면 폭보다 길면 두 줄(뒷줄은 조금 멀리) */
  let cut = rs.length; if (all > room && rs.length > 1) { let acc = 0; for (let i = 0; i < rs.length; i++) { acc += w[i] + T.RAFT_SPACE; if (acc >= all / 2) { cut = i + 1; break; } } }
  const rows = [[0, cut], [cut, rs.length]].filter(([a, b]) => b > a), place = [];
  rows.forEach(([a, b], ri) => { const tw = w.slice(a, b).reduce((p, q) => p + q, 0) + (b - a - 1) * T.RAFT_SPACE; let x = rowMid() - tw / 2; for (let i = a; i < b; i++) { place[i] = [x + w[i] / 2, rows.length > 1 && ri === 0 ? T.RAFT_Z - .75 : rows.length > 1 ? T.RAFT_Z + 1.15 : T.RAFT_Z];   /* 두 줄은 화면에서 겹치지 않게 넉넉히 */ x += w[i] + T.RAFT_SPACE; } });
  rs.forEach((r, i) => { r.home.set(place[i][0], T.RAFT_Y, place[i][1]); if (S.drag && S.drag.r === r) return; if (!ms) r.group.position.copy(r.home); else if (Math.abs(r.group.position.x - r.home.x) + Math.abs(r.group.position.z - r.home.z) > .02) jobs.push(stage.tween(r.group, { 'position.x': r.home.x, 'position.y': r.home.y, 'position.z': r.home.z }, ms)); }); return Promise.all(jobs); }
/** 들어갈 뗏목이 없으면 낱 판자 한 장이 떠내려온다(지금 열린 틈 가운데 하나라도 들어갈 뗏목이 있으면 오지 않는다). */
// ── 상어(N02): 물에 떨어진 판자를 물고 간다 · 가끔 떠내려오는 낱 판자를 노린다(눌러서 쫓음 — 두면 가져가고 새 낱 판자가 다시 온다)
function sharkBite(x){ const sh = S.shark; if (!sh || !S.ev.shark || sh.mode === 'bite') return; sh.mode = 'bite'; sh.target = null; S.log.push({ shark: 'bite' }); const o = sh.o; o.rotation.y = x > o.position.x ? 0 : Math.PI; stage.tween(o.position, { x, z: 1.4 }, 520).then(() => { tone(150, .18, 'square', .08); return sleep(380); }).then(() => { sh.mode = 'idle'; }); }
function sharkHunt(r){ const sh = S.shark; if (!sh || !S.ev.shark || CALM || sh.cool || sh.mode !== 'idle' || Math.random() > T.SHARK.P) return; sh.mode = 'hunt'; sh.target = r; sh.k = 0; sh.from.copy(sh.o.position); S.log.push({ shark: 'hunt' }); tone(110, .3, 'sawtooth', .05); }
function sharkShoo(){ const sh = S.shark; if (!sh || sh.mode !== 'hunt') return false; sh.mode = 'flee'; sh.target = null; sh.cool = true; S.log.push({ shark: 'shoo' }); tone(880, .1, 'square', .06); const o = sh.o; o.rotation.y = Math.PI; stage.tween(o.position, { x: o.position.x - 7, z: T.SHARK.Z + 1.2 }, 900).then(() => { sh.mode = 'idle'; }); return true; }
function sharkSteal(){ const sh = S.shark, r = sh.target; sh.target = null; sh.cool = true; sh.mode = 'flee'; if (r && !r.used) { r.used = true; scene.remove(r.group); S.lost += r.n; S.log.push({ shark: 'took', n: r.n }); tone(150, .25, 'square', .08); layout(400); }
  sh.o.rotation.y = 0; stage.tween(sh.o.position, { x: sh.o.position.x + 7, z: T.SHARK.Z + 1.2 }, 1000).then(() => { sh.mode = 'idle'; if (!S.busy && !S.missing) single(); }); }
function single(){ const rooms = active().map(roomOf).filter(Boolean); if (!rooms.length || live().some(r => rooms.some(m => r.n <= m))) return; const r = raft(1, S.rafts.length, true); S.loaded++; r.group.position.set(ox(S.gi) - 5.5, T.RAFT_Y, T.RAFT_Z + .5); S.log.push({ single: true, rooms, cargo: live().filter(x => x !== r).map(x => x.n) }); sharkHunt(r); return layout(T.SINGLE_MS); }

const wait = async ms => { for (let t = 0; t < ms && !S.skip; t += 50) await sleep(50); };
// ── 떠나는 장면: 건너편에서 누가 손을 흔든다 → 끊어진 다리를 따라 돌아와 앤 앞에 선다(화면을 누르면 건너뜀)
async function intro(){ S.busy = true; S.intro = true; S.skip = false; const f = S.voyages > 1 ? 1 : 0; cam.x = S.dest + .6; cam.wide = 1; await wait(T.INTRO_HOLD[f]); if (!S.skip) await stage.tween(cam, { x: camHome() }, T.INTRO_MS[f] * (S.ev.big ? 1.5 : 1)); cam.x = camHome(); cam.wide = camWide(); S.intro = false; if (SAVE.saved < 2 && !S.loading) H.tell('bridge', '빈 칸 수만큼 판자를 끌어다 놓아요!'); if (S.loading) { cargoOpen(); return; }   /* 화물 길: 틈 셋을 훑어 본 뒤에 화물 판이 열린다 */ S.busy = false; S.idle = S.t; single(); }
const camHome = () => longTall() ? longFocus(S.gi) : active().length > 1 || slotsOf(S.gi) > R.SLOTS ? spanMid() : ox(S.gi) + HOME;
const camWide = () => active().length > 1 ? T.TWIN_ZOOM : longTall() ? 1 : slotsOf(S.gi) > R.SLOTS ? T.LONG_ZOOM : 1;

// ── 뗏목을 틈에 놓았다(쌍둥이 틈이면 놓은 쪽 틈에)
async function drop(r, k = S.gi){ S.busy = true; S.drops++; S.dropsV = (S.dropsV | 0) + 1; hintOff(); audio(); const out = R.place(S.fill[k], r.n, slotsOf(k)), wp = new THREE.Vector3(); S.log.push({ gap: k, drop: r.n, kind: out.kind, single: r.single });
  r.used = true; const moved = r.planks.slice(), night = S.nightGaps.has(k);
  for (let j = 0; j < moved.length; j++) { const p = moved[j]; p.getWorldPosition(wp); r.group.remove(p); scene.add(p); p.position.copy(wp); p.rotation.set(0, 0, 0);
    if (j < out.put) { const i = S.fill[k] + j; S.bridge[k][i] = p; if (night) p.material = S.glowMat; if (S.ghosts[k][i]) { scene.remove(S.ghosts[k][i]); S.ghosts[k][i] = null; } await stage.tween(p, { 'position.x': slotX(k, i), 'position.y': plankY(), 'position.z': 0 }, T.PLANK_MS); tone(300 + i * 40, .09, 'triangle', .1); }
    else { S.lost++; if (j === out.put) sharkBite(slotX(k, slotsOf(k) - 1) + .8); await stage.tween(p, { 'position.x': slotX(k, slotsOf(k) - 1) + .6 + (j - out.put) * .3, 'position.y': T.DECK + .4, 'position.z': .2 }, T.PLANK_MS); stage.tween(p, { 'position.y': -1.4, 'position.z': 1.1, 'rotation.z': -1.4, 'rotation.x': .6 }, 900, t => t * t).then(() => scene.remove(p)); tone(180, .3, 'sine', .1, 0, 90); } }
  scene.remove(r.group); S.fill[k] = out.filled; S.placed += out.put; S.filled = S.fill[S.gi]; if (longTall() && Math.abs(cam.x - camHome()) > .1 && !out.done) stage.tween(cam, { x: camHome() }, 700); layout(500); if (S.missing) return out;
  if (S.shark) S.shark.cool = false; if (out.kind === 'fit') { S.streak++; S.clock = Math.max(0, S.clock - R.PRESS.BACK); stage.tween(cam, { zoom: .93 }, 120).then(() => stage.tween(cam, { zoom: 1 }, 260)); } else S.streak = 0; A.flames(S.streak);
  const startX = ox(S.gi) + T.START_X;
  if (!out.done) { await sleep(150); await go(S.anne, Math.max(startX, slotX(k, S.fill[k] - 1) - .05), true); stage.play(S.anne, 'No', true); tone(240, .25, 'sine', .08); await sleep(900); await go(S.anne, startX, true); stage.face(S.anne, 1); if (S.missing) return out; S.busy = false; S.idle = S.t; single(); return out; }
  // 열째 판자: 다리가 이어졌다 — 판자가 차례로 통 튄다
  S.bridge[k].forEach((p, i) => { setTimeout(() => { stage.tween(p, { 'position.y': plankY() + .1 }, 90).then(() => stage.tween(p, { 'position.y': plankY() }, 140)); tone((392 + i * 44) * (1 + .06 * Math.min(S.streak, T.STREAK_MAX)), .07, 'triangle', .07); }, i * 45); });
  A.trayAdd(S.voy.gaps[k].need); const act = active(); if (act.some(j => roomOf(j) > 0)) { await sleep(400); S.busy = false; S.idle = S.t; single(); return out; }   /* 쌍둥이 틈: 다른 쪽이 남았다 */
  const last = act[act.length - 1]; await sleep(500); await go(S.anne, ox(last) + span(last) + T.END_X - 4, true); if (S.missing) return out;
  if (last < S.voy.gaps.length - 1) { S.gi = last + 1; S.filled = S.fill[S.gi]; const w = camWide(), camMove = stage.tween(cam, { x: camHome(), wide: w }, 1300); await openBarrel(last); await Promise.all([camMove, layout(900), go(S.anne, ox(S.gi) + T.START_X, true)]); if (S.missing) return out; S.busy = false; S.idle = S.t; single(); return out; }
  await arrive(); return out; }

// ── 쉬어 가는 땅의 통: 뭐가 나올지 모른다(덤 뗏목 · 물고기 양동이 · 지도 조각)
async function openBarrel(k){ const b = S.barrels[k]; if (!b) return; S.barrels[k] = null; await go(S.anne, b.position.x - .55, true); const out = R.barrel(Math.random, { map: SAVE.saved >= 1 && PLAZA.map + S.mapGot < R.MAP.MAX }); S.log.push({ barrel: out.kind, n: out.n | 0 });
  tone(200, .08, 'square', .06); await stage.tween(b, { 'scale.x': .95, 'scale.y': .95, 'scale.z': .95, 'position.y': T.DECK + .35 }, 160); stage.tween(b, { 'scale.x': .01, 'scale.y': .01, 'scale.z': .01 }, 140).then(() => scene.remove(b)); [523, 784, 1047].forEach((f, i) => tone(f, .12, 'triangle', .1, i * .06));
  if (out.kind === 'raft') { const r = raft(out.n, S.rafts.length); S.loaded += out.n; r.group.position.set(b.position.x, T.DECK + .6, -.3); await sleep(250); }
  else if (out.kind === 'map') { S.mapGot++; mapPiece(stage.screenOf(b)); await sleep(600); }
  else { const o = put(S.kit.bucket, b.position.x, T.DECK, -.6, .01, .5); S.loot.push(o); S.fish++; await stage.tween(o, { 'scale.x': .62, 'scale.y': .62, 'scale.z': .62, 'position.y': T.DECK + .3 }, 220); await stage.tween(o, { 'position.y': T.DECK }, 160); } }
/** 지도 조각: 통에서 나와 오른쪽 위 지도 칸으로 날아간다(넷이면 광장에 새 섬). */
function mapPiece(at){ const box = $('map'), e = document.createElement('div'); e.className = 'piece fly'; e.innerHTML = art('map.piece'); e.style.left = at.x + 'px'; e.style.top = at.y + 'px'; document.body.appendChild(e); mapDraw(true);
  const b = box.getBoundingClientRect(); requestAnimationFrame(() => { e.style.transform = `translate(${b.left + b.width / 2 - at.x}px,${b.top + b.height / 2 - at.y}px) scale(.6)`; e.style.opacity = .2; }); setTimeout(() => e.remove(), 900); }
function mapDraw(show){ const box = $('map'), n = Math.min(R.MAP.MAX, PLAZA.map + S.mapGot); if (!show && !n) { box.hidden = true; return; } box.hidden = false; box.innerHTML = Array.from({ length: R.MAP.MAX }, (_, i) => `<u class="${i < n ? 'on' : ''}"></u>`).join(''); }

// ── 늦었다: 밀물이면 주민이 통을 타고 떠내려가고, 해적선이면 배가 태워 가고, 다리가 무너지면 건너편 주민이 돌아선다. 벌·표시 없이 새 길에서 다시 만난다.
async function miss(){ if (S.missing) return; S.missing = true; S.busy = true; S.streak = 0; A.flames(0); hintOff(); if (S.drag) { const r = S.drag.r; S.drag = null; stage.tween(r.group, { 'position.x': r.home.x, 'position.z': r.home.z }, 300); }
  if (S.ask) { S.ask.cancel(); S.ask = null; } S.log.push({ missed: S.ev.kind }); const g = S.guest, o = g.obj; tone(300, .5, 'sine', .1, 0, 140); stage.play(S.anne, 'No', true);
  if (S.ev.kind === 'fall') { S.front = S.anne.obj.position.x + .5; await sleep(600); }
  await stage.tween(cam, { x: S.dest + .6, wide: 1 }, 1100); stage.play(g, 'Wave');
  if (S.ev.kind === 'ship') { await stage.tween(S.chaser, { 'position.x': o.position.x + .3, 'position.z': -2.2 }, 900); await stage.tween(o, { 'position.y': standY() + .25, 'position.z': -2.0 }, 500); stage.tween(S.chaser, { 'position.x': S.dest + 16 }, 3000, t => t * t); await stage.tween(o, { 'position.x': S.dest + 15.7 }, 3000, t => t * t); }
  else if (S.ev.kind === 'fall') { await sleep(500); stage.play(g, 'No', true); await sleep(900); await go(g, S.dest + 7.5); }
  else { const b = put(S.kit.barrel, o.position.x, S.rise + .1, 1.6, .9, 0); S.loot.push(b); await stage.tween(o, { 'position.z': 1.6, 'position.y': S.rise + .75 }, 500); stage.tween(b, { 'position.x': S.dest + 14 }, 3200, t => t * t); await stage.tween(o, { 'position.x': S.dest + 14 }, 3200, t => t * t); }
  $('fade').style.opacity = 1; await sleep(480); S.tweens.length = 0; cam.zoom = 1; newVoyage(); mapDraw(); await sleep(80); $('fade').style.opacity = 0; intro(); }

// ── 건너편에 닿았다: 길 끝의 셈 → 주민과 함께 내가 놓은 다리를 달려 돌아온다 · 남은 뗏목은 나무 더미로
async function finalAsk(){ const left = live(); if (S.qkind === 'left') { const sum = R.leftover(S.loaded, S.placed, S.lost); A.trayClear(); A.trayAdd(S.loaded, '', '실은'); A.trayAdd(S.placed, '−', '놓은'); if (S.lost) A.trayAdd(S.lost, '−', '빠진'); left.forEach(r => r.planks.forEach(p => { p.material = S.glowMat; })); S.ask = A.ask({ sum, onPick, onWrong }); }
  else S.ask = A.ask({ ...R.total(S.voy), onPick, onWrong });
  const n = await S.ask.promise; S.ask = null; left.forEach(r => r.planks.forEach(p => { p.material = S.mat; })); return n; }
function onPick(n, right){ audio(); S.log.push({ pick: n, right }); }
function onWrong(){ stage.play(S.anne, 'No', true); tone(240, .25, 'sine', .08); setTimeout(() => { if (S.anne.act === S.anne.acts.No) stage.play(S.anne, 'Idle'); }, 1300); }
async function arrive(){ const g = S.guest; await finalAsk(); if (S.missing) return; S.busy = true; const left = live(); stage.play(S.anne, 'Yes', true); stage.play(g, 'Yes', true); tone(660, .12, 'triangle', .1); tone(880, .16, 'triangle', .1, .12); await sleep(1400);
  const spot = homeSpot(Math.min(S.home.length, T.HOME_MAX - 1)), ms = (S.anne.obj.position.x - T.START_X) / T.RUN * 1000;
  stage.tween(cam, { x: HOME - 3, wide: 1 }, ms, t => t); for (const r of left) stage.tween(r.group, { 'position.x': -4.2, 'position.z': 2.4 }, ms, t => t);
  setTimeout(() => go(g, spot.x, true).then(() => { stage.tween(g.obj, { 'position.z': spot.z }, 300); stage.face(g, 1); stage.play(g, 'Wave'); }), 350); await go(S.anne, T.START_X, true); stage.face(S.anne, 1);
  let wood = 0; for (const r of left) { r.used = true; for (const p of r.planks) { const wp = p.getWorldPosition(new THREE.Vector3()); r.group.remove(p); scene.add(p); p.position.copy(wp); wood++; if (S.pile.length < T.PILE_MAX) { const at = S.pile.length; pileAdd(p); const to = p.position.clone(); p.position.copy(wp); await stage.tween(p, { 'position.x': to.x, 'position.y': to.y, 'position.z': to.z }, 320); tone(260 + at * 30, .08, 'triangle', .09); } else scene.remove(p); } scene.remove(r.group); }
  SAVE.saved++; SAVE.wood += wood; SAVE.fish += S.fish; LP.bucketFish(S.fish); PLAZA.map = Math.min(R.MAP.MAX, PLAZA.map + S.mapGot); S.mapGot = 0; wallet.save(); S.log.push({ arrived: true, wood, saved: SAVE.saved, fish: S.fish, map: PLAZA.map });
  for (const o of S.loot.splice(0)) { scene.remove(o); if (S.buckets.length < 4) S.buckets.push(put(S.kit.bucket, -5.4 + S.buckets.length * .5, T.DECK, .62, .5, S.buckets.length)); }
  if (S.home.length >= T.HOME_MAX) stage.unperson(S.home.shift()); S.home.push(g); S.guest = null; S.home.forEach((p, i) => { const s = homeSpot(i); stage.tween(p.obj, { 'position.x': s.x, 'position.z': s.z }, 400); });
  await sleep(2200); $('fade').style.opacity = 1; await sleep(480); stage.play(S.home[S.home.length - 1], 'Idle'); newVoyage(); mapDraw(); await sleep(80); $('fade').style.opacity = 0; intro(); }

// ── 손 그림자: 맨 처음 길 첫 틈에서 손이 없으면, 뗏목에서 틈으로 한 번 지나간다(글 없음)
let hintEl = null; function hintOff(){ if (hintEl) { hintEl.remove(); hintEl = null; } }
function hint(){ if (hintEl || S.busy || S.drag || S.loading || SAVE.saved >= 2 || S.dropsV > 0 ||   /* 처음 두 주민을 데려올 때까지: 길마다 첫 뗏목을 놓기 전에 손이 한 번 지나간다 */ S.t - (S.idle || 0) < (SAVE.saved < T.LEARN ? T.LEARN_HINT_MS : T.HINT_MS) / 1000) return; const r = live().find(x => x.n === roomOf(S.gi)); if (!r) return;
  const a = stage.screenOf(r.group), b = stage.screenOf(window.__bridge.gap()); hintEl = document.createElement('div'); hintEl.id = 'hint'; hintEl.innerHTML = art('hint.hand'); hintEl.style.left = a.x + 'px'; hintEl.style.top = a.y + 'px'; document.body.appendChild(hintEl);
  requestAnimationFrame(() => { if (!hintEl) return; hintEl.style.opacity = 1; setTimeout(() => { if (hintEl) hintEl.style.transform = `translate(${b.x - a.x}px,${b.y - a.y}px)`; }, 350); }); setTimeout(() => { hintOff(); S.idle = S.t; }, 2600); }

// ── 화물 싣기(N04): 길의 틈 팻말 셋이 미리 보인다 · 판자 한 장 = 동전 하나 · 1~5장 묶음으로 싣는다 · 실은 뗏목을 누르면 내린다(동전 돌려받음) · 배를 누르면 떠난다
const cg = { el: null };
/** 틈마다 아직 모자란 판자 수(실은 뗏목을 실은 차례대로 앞 틈부터 채운다) → { rem:[…], cur(지금 채울 틈, 다 찼으면 -1) } */
function cargoLeft(){ const rem = S.voy.gaps.map(g => g.need); for (const r of live()) { const i = rem.findIndex(x => x > 0); if (i < 0) break; rem[i] = Math.max(0, rem[i] - r.n); } return { rem, cur: rem.findIndex(x => x > 0) }; }
function cargoOpen(){ if (wallet.coins() < LP.LOOP.PLANK && !live().length) H.tell('poor', '동전이 없어요. 장터에서 벌어 오면 판자를 실을 수 있어요!', { times: 4 }); else H.tell('cargo', '길에 놓을 판자를 동전으로 실어요!'); S.busy = true; S.loaded = live().reduce((a, r) => a + r.n, 0); cam.x = camHome(); cam.wide = 1; A.trayClear(); for (const r of live()) A.trayAdd(r.n, S.rafts.indexOf(r) ? '+' : '');
  if (!cg.el) { cg.el = document.createElement('div'); cg.el.id = 'cargo'; document.body.appendChild(cg.el); }
  const need = S.voy.gaps.map(g => g.need), coins = wallet.coins();
  const CL = cargoLeft();   /* 틈을 하나씩: 지금 채울 틈이 튀어 보이고, 실을수록 그 수가 줄고, 다 차면(판자 빛) 다음 틈으로 */
  cg.el.innerHTML = `<div class="need">${need.map((n, i) => `<b class="${CL.rem[i] === 0 ? 'done' : i === CL.cur ? 'cur' : ''}">${CL.rem[i] === 0 ? n : CL.rem[i]}</b>`).join('')}</div><div class="coins">${art('coin')}<b id="cgCoins">${coins}</b></div>` +
    `<div class="bund">${LP.LOOP.BUNDLES.map(n => `<button data-n="${n}" ${n > coins ? 'disabled' : ''}><span>${art('plaza.wood').repeat(1)}</span><b>${n}</b></button>`).join('')}</div><button class="go" id="cgGo">${art('deco.sailboat')}</button>` + (coins + S.loaded < need.reduce((a, b) => a + b, 0) ? `<a class="mk" id="cgMarket" href="/math/play/market/${location.search}">${art('coin')}<b>장터</b></a>` : '');
  cg.el.querySelectorAll('.bund button').forEach(b => b.onclick = () => cargoAdd(+b.dataset.n)); cg.el.querySelector('#cgGo').onclick = cargoGo; cg.el.querySelector('#cgGo').classList.toggle('ready', CL.cur < 0); cg.el.hidden = false; cg.el.classList.toggle('poor', coins < LP.LOOP.PLANK && !live().length); cg.el.classList.toggle('short', coins + S.loaded < need.reduce((a, b) => a + b, 0) && coins < LP.LOOP.BUNDLES[LP.LOOP.BUNDLES.length - 1]); }   /* 동전이 틈 합보다 모자라면 동전 칸이 깜빡임(장터로) */
function cargoAdd(n){ audio(); if (!LP.buyPlanks(n)) { tone(180, .12, 'sine', .07); return; } const r = raft(n, S.rafts.length); r.group.position.set(ox(0) - 4, T.RAFT_Y, T.RAFT_Z + .4); layout(400); tone(520 + n * 60, .08, 'square', .05); S.log.push({ cargo: n }); cargoOpen(); }
function cargoTap(e){ if (!S.loading) return; const ray = stage.pointerRay(e), rs = live(), h = ray.intersectObjects(rs.flatMap(r => r.planks), false)[0]; let r = h && rs.find(x => x.planks.includes(h.object));
  if (!r) { let best = 1e9; for (const x of rs) { const q = stage.screenOf(x.group), d = Math.hypot(q.x - e.clientX, q.y - e.clientY); if (d < best) { best = d; r = x; } } if (best > T.PICK_PX) r = null; }   /* 판자 사이를 눌러도 가장 가까운 뗏목 */
  if (!r || r.single) return;
  audio(); LP.refundPlanks(r.n); r.used = true; for (const p of r.planks) scene.remove(p); scene.remove(r.group); S.rafts = S.rafts.filter(x => x !== r); layout(300); tone(300, .08, 'sine', .06); S.log.push({ unload: r.n }); cargoOpen(); }
function cargoGo(){ audio();   /* 뗏목이 없어도 떠날 수 있다(판자는 길에서 한 장씩 떠내려온다 — 느리지만 막히지 않음) */ S.voy.cargo = live().map(r => r.n); S.loaded = S.voy.cargo.reduce((a, b) => a + b, 0); S.loading = false; cg.el.hidden = true; A.trayClear(); S.log.push({ depart: S.voy.cargo.slice(), need: S.voy.gaps.map(g => g.need) }); tone(392, .15, 'triangle', .1); tone(523, .2, 'triangle', .1, .15); layout(500); S.busy = false; S.idle = S.t; single(); }   /* 틈은 이미 봤으니 바로 시작 */

// ── 손으로 끌기
const liftPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(T.DECK + .45)), hit = new THREE.Vector3(), canvas = $('c');
canvas.addEventListener('pointerdown', e => { if (S.loading && !S.intro) { cargoTap(e); return; } if (S.intro) { S.skip = true; S.tweens.forEach(w => { if (w.o === cam) w.t = w.ms; }); return; } if (S.shark && S.shark.mode === 'hunt' && S.ready && !S.missing) { const q = stage.screenOf(S.shark.o); if (Math.hypot(q.x - e.clientX, q.y - e.clientY) < T.SHARK.TAP_PX) { audio(); sharkShoo(); return; } }
  if (S.busy || !S.ready || S.missing) return; audio(); hintOff(); const ray = stage.pointerRay(e), rs = live(), h = ray.intersectObjects(rs.flatMap(r => r.planks), false)[0];
  let r = h ? rs.find(x => x.planks.includes(h.object)) : null;
  if (!r) { let best = 1e9; for (const x of rs) { const q = stage.screenOf(x.group), d = Math.hypot(q.x - e.clientX, q.y - e.clientY); if (d < best) { best = d; r = x; } } if (best > T.PICK_PX) r = null; }   /* 판자 사이 틈을 눌러도 집힘 */
  if (!r || S.tweens.some(w => w.o === r.group)) return; S.drag = { r, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); tone(520, .06, 'sine', .06); });
canvas.addEventListener('pointermove', e => { if (!S.drag || e.pointerId !== S.drag.id) return; const ray = stage.pointerRay(e); if (ray.ray.intersectPlane(liftPlane, hit)) S.drag.r.group.position.set(hit.x, T.DECK + .45, hit.z); });
const end = e => { if (!S.drag || e.pointerId !== S.drag.id) return; const r = S.drag.r, p = r.group.position; S.drag = null; S.idle = S.t;
  const k = active().find(j => roomOf(j) > 0 && p.x - ox(j) > T.DROP_X[0] && p.x - ox(j) < T.DROP_X[1] + span(j) - 4);
  if (!S.busy && !S.missing && k != null && Math.abs(p.z) < T.DROP_Z) drop(r, k); else stage.tween(r.group, { 'position.x': r.home.x, 'position.y': r.home.y, 'position.z': r.home.z }, 420); };
canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

// ── 화면 크기 · 한 장면의 일
function resize(w, h){ const tall = h > w, asp = w / h, vfov = tall ? 50 : 40, half = Math.atan(Math.tan(vfov * Math.PI / 360) * asp), dist = Math.max(10.5, (tall ? 4.7 : 5.2) / Math.tan(half));   /* 다리와 뗏목(가로 약 10)이 늘 화면 안에 */
  camera.fov = vfov; cam.halfW = Math.tan(half) * dist * .9; cam.y = 1 + dist * (tall ? .42 : .5); cam.z = 1.4 + dist * .9; cam.lz = tall ? 1.8 : 1.4; }
const DAY = { hemi: hemi.intensity, sun: sun.intensity };
stage.frame((dt, t) => { S.t = t;
  // 시계: 아이가 생각하는 동안에만 간다(뗏목을 고르는 때 · 합을 고르는 때). 밀물은 물 높이로, 해적선은 배의 자리로, 무너지는 다리는 뒤에서 떨어지는 판자로 보인다.
  if (S.ready && S.ev && !CALM && !S.missing && !S.intro && (!S.busy || S.ask)) { S.clock = Math.min(1, S.clock + dt / S.ev.budget); if (S.clock >= 1) miss(); }
  if (S.ev && !CALM && !S.missing && S.guest) { if (S.clock > T.HURRY && S.guest.act === S.guest.acts.Wave) stage.play(S.guest, 'Jump'); if (S.clock > T.BEAT && !S.intro && (!S.busy || S.ask) && t - (S.beat || 0) > .25 + (1 - S.clock) * 2.2) { S.beat = t; tone(96, .09, 'sine', .16); tone(72, .12, 'sine', .12, .09); } }
  if (S.ev) { sea.material.color.setHex(0x2b9fd2).lerp(TIDE_DARK, S.ev.kind === 'tide' ? S.clock * .55 : 0); const rise = S.ev.kind === 'tide' ? S.clock * T.TIDE : 0; S.rise += (rise - S.rise) * Math.min(1, dt * 3); sea.position.y = S.rise;
    if (S.chaser.visible && !S.missing) { S.chaser.position.x = -7 + (S.dest + 9) * S.clock; S.chaser.position.y = Math.sin(t * 1.3) * .06; S.chaser.rotation.z = Math.sin(t * .9) * .03; }
    if (S.ev.kind === 'fall' && !CALM && !S.intro) { const ax = S.anne.obj.position.x; S.front = Math.max(S.front, T.FALL_FROM + (ax - .6 - T.FALL_FROM) * S.clock); crumble(); } }
  // 밤 다리: 지금 틈이 밤이면 하늘이 어두워지고 놓인 판자만 등불에 보인다
  const nightNow = S.ev && !S.intro && active().some(k => S.nightGaps && S.nightGaps.has(k)) ? 1 : 0; const nk = S.nightK + (nightNow - S.nightK) * Math.min(1, dt * 2.5);
  if (Math.abs(nk - S.nightK) > .002 || (nk > 0 && !S.nightPainted)) { S.nightK = nk; hemi.intensity = DAY.hemi + (T.NIGHT.HEMI - DAY.hemi) * nk; sun.intensity = DAY.sun + (T.NIGHT.SUN - DAY.sun) * nk; scene.fog.color.copy(DAY_FOG).lerp(NIGHT_FOG, nk); const mix = (a, b) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), nk).getHexString(); stage.paintSky([0, 1, 2].map(i => mix(['#5fb8ea', '#bfe6f5', '#e8f6fb'][i], T.NIGHT.SKY[i]))); S.lamp.intensity = T.NIGHT.LIGHT * nk; S.nightPainted = nk > .99; }
  if (nightNow) { const k = active().find(j => S.nightGaps.has(j)); S.lamp.position.x = ox(k) + Math.max(.4, S.fill[k] / 2 * T.SLOT); }
  for (const r of S.rafts) if (!r.used) { r.home.y = T.RAFT_Y + S.rise; if ((!S.drag || S.drag.r !== r) && !S.tweens.some(w => w.o === r.group)) { r.group.position.y = r.home.y + Math.sin(t * 1.6 + r.ph) * .05; r.group.rotation.z = Math.sin(t * 1.1 + r.ph) * .03; if (S.ev && S.ev.drift && !S.busy) r.group.position.x = r.home.x + Math.sin(t * T.DRIFT_HZ + r.ph) * T.DRIFT; } }
  const zoom = cam.zoom * cam.wide; camera.position.set(cam.x, cam.y * zoom, cam.z * zoom); camera.lookAt(cam.x, .7, cam.lz); sun.position.set(cam.x - 8, 11, 8); sun.target.position.set(cam.x, 0, 0);
  // 상어: 뗏목 앞바다를 돈다 · 낱 판자를 노릴 때는 생각하는 동안에만 다가온다
  const sh = S.shark; if (sh) { const on = !!(S.ev && S.ev.shark) && !S.intro && !S.loading && !S.missing; sh.o.visible = on; if (on) { const o = sh.o; o.position.y = S.rise - .1;
    if (sh.mode === 'idle') { const a = t * .45, nx = cam.x + Math.sin(a) * T.SHARK.R, nz = T.SHARK.Z + Math.cos(a) * .6, k = Math.min(1, dt * 2); if (Math.abs(nx - o.position.x) > .01) o.rotation.y = nx > o.position.x ? 0 : Math.PI; o.position.x += (nx - o.position.x) * k; o.position.z += (nz - o.position.z) * k; }
    else if (sh.mode === 'hunt') { const r = sh.target; if (!r || r.used || (S.drag && S.drag.r === r)) { sh.mode = 'idle'; sh.target = null; } else if (!S.busy) { sh.k += dt / T.SHARK.SEC; const g = r.group.position; o.position.x = sh.from.x + (g.x - sh.from.x) * sh.k; o.position.z = sh.from.z + (g.z + .25 - sh.from.z) * sh.k; o.rotation.y = g.x > o.position.x ? 0 : Math.PI; if (sh.k >= 1) sharkSteal(); } } } }
  if (S.ready) { hint(); signsDraw(); }
  /* 화물(주민 넷까지): 가만히 있으면 손이 지금 틈에 맞는 묶음을, 다 실었으면 배 단추를 짚는다 */ if (S.loading && !S.intro && cg.el && !cg.el.hidden && SAVE.saved < 4 && H.idle(4500)) { const CL = cargoLeft(), want = CL.cur >= 0 ? Math.min(CL.rem[CL.cur], 5) : 0; let b = want ? cg.el.querySelector(`.bund button[data-n="${want}"]:not(:disabled)`) : null; if (want && !b) b = [...cg.el.querySelectorAll('.bund button:not(:disabled)')].pop() || null; H.at(b || (live().length ? cg.el.querySelector('#cgGo') : null)); } });
/** 뒤에서 무너지는 다리: 앞줄(front)보다 뒤에 있는 판자가 한 장씩 떨어진다. */
function crumble(){ const fall = m => { m.userData.fallen = true; stage.tween(m.position, { y: -1.6 }, 900, t => t * t).then(() => { m.visible = false; }); stage.tween(m.rotation, { z: (Math.random() - .5) * 1.6 }, 900); };
  let n = 0; for (const c of S.crumble) if (!c.m.userData.fallen && c.x < S.front && n < 2) { fall(c.m); n++; }
  for (const b of S.bridge) for (const p of b) if (p && !p.userData.fallen && p.position.x < S.front && p.position.x < S.anne.obj.position.x - .6 && n < 2) { fall(p); n++; }
  if (n) tone(140 + Math.random() * 40, .12, 'sine', .07, 0, 80); }

// 하네스용: 화면 좌표 · 지금 틈의 첫 빈 칸 위
window.__bridge.screenOf = stage.screenOf;
window.__bridge.gap = (k = S.gi) => new THREE.Vector3(slotX(k, Math.min(slotsOf(k) - 1, S.fill[k])), T.DECK + .45, 0);
window.__bridge.slotsOf = slotsOf; window.__bridge.single = single; window.__bridge.cargoAdd = cargoAdd; window.__bridge.cargoGo = cargoGo; window.__bridge.L = LP; window.__bridge.span = span;
window.__bridge.live = live; window.__bridge.active = active; window.__bridge.stage = stage;
window.__bridge.restart = () => { S.tweens.length = 0; cam.zoom = 1; newVoyage(); mapDraw(); return intro(); };   /* 하네스용: 데려온 수를 바꾼 뒤 길을 새로 */
build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
