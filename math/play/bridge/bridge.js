/* 다리 길 — 1학년 「10 만들기」. 설계: 핸드오프 kmotion/math-wizard/25_수학놀이터_네곳_설계_v1.md 3절(걸음 ①).
 * 건너편 섬에서 누가 손을 흔든다. 앤은 판자 뗏목 넷을 끌고 끊어진 다리 셋을 이어 데리러 간다. 뗏목은 떠날 때 실은 것이 전부다.
 * 딱 맞으면 다리가 이어져 건넌다 · 넘치면 건너되 남는 판자는 물에 떨어져 사라진다 · 모자라면 놓은 판자는 남고 앤이 끝에서 고개를 젓는다.
 * 틈마다 빈 칸 수가 팻말에 적혀 있다 — 그 수만큼 판자가 실린 뗏목을 세어서 고른다. 셋을 다 이으면 놓은 판자의 합(2 + 3 + 4 = ?)을 고른다(준호 2026-11-17).
 * 흥미진진(준호 2026-11-17): 길마다 사건이 섞인다 — 밀물(물이 차오름) · 해적선(먼저 닿으면 주민을 태워 감) · 물살(뗏목이 떠다님). 생각하는 동안에만 시계가 간다. 쉬어 가는 땅의 통에서는 덤 뗏목이나 물고기가 나온다. 연달아 딱 맞추면 더 빨리 달린다. 늦으면 주민을 놓치고(벌·표시 없음) 새 길에서 다시 만난다.
 * 들어갈 뗏목이 없으면 낱 판자가 한 장씩 떠내려온다(막히지 않는다). 아껴 쓰고 남은 뗏목은 우리 선착장 나무 더미가 된다.
 * 가위표·정답 표시·점수·설명 글 없음. 세계가 답한다. 숫자와 화물은 ./rules.js 가 매번 다르게 낸다.
 * 화면은 기성 3D 재료(Quaternius Pirate Kit, CC0)만 쓴다 — 판자·받침·기둥은 선착장 모형을 조각으로 나눠 그대로 쓴다(assets/CREDITS.md). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneRig } from 'three/addons/utils/SkeletonUtils.js';
import * as R from './rules.js?v=4';
import { wallet, audio, tone } from '../common/kit.js?v=3';

// ── 내가 정한 수치(준호가 보고 바꾼다)
const T = { PICK_PX: 70, DECK: 1.0, SLOT: 0.4, PLANK_W: 1.3, RAFT_GAP: .36, RAFT_STAG: .16, RAFT_SPACE: .9, SLOTS_SHOWN: false,      // 뗏목 판자는 촘촘히·엇갈리게(틈 너비와 눈으로 맞춰지지 않게 — 세어야 한다) · SLOTS_SHOWN: 빈 칸 자리를 보여 줄지(끄면 수 팻말만)
   SEG: 8,      // SEG: 틈과 틈 사이(다리 4 + 땅 4)
  WALK: 1.5, RUN: 4.4, STREAK_RUN: .14, STREAK_MAX: 4, TIDE: .9, HURRY: .6, BEAT: .7, DRIFT: .45, DRIFT_HZ: .8, SHIP_Z: -4.2, SHIP_S: 1.0, SHIP_RY: Math.PI,   // 연달아 딱 맞출 때마다 달리기가 빨라지는 몫 · 밀물이 끝까지 차오르는 높이 · 주민이 발을 구르기 시작하는 때 · 북소리가 시작되는 때(시계 0~1) · 물살에 떠다니는 폭과 빠르기 · 해적선 자리·크기·방향
  PLANK_MS: 240, RAFT_Z: 3.1, RAFT_Y: .2, DROP_X: [-0.7, 4.7], DROP_Z: 1.9, START_X: -1.25, END_X: 5.3,
  INTRO_HOLD: [1500, 700], INTRO_MS: [3400, 2200],                 // 떠나는 장면: 먼 섬에 머무는 시간 · 돌아오는 시간([맨 처음, 그 뒤])
  SINGLE_MS: 1700, HINT_MS: 5000, HOME_MAX: 6, PILE_MAX: 12,        // 낱 판자가 떠내려오는 시간 · 손 그림자까지 · 선착장에 서는 주민 수 · 나무 더미에 보이는 판자 수
  GHOST: .5, LAND: '#a59a92',                                       // 빈 칸 자리 그림자의 짙기 · 땅 쪽 선착장의 빛깔(내가 놓는 다리와 달라 보이게 어둡게)
  TINT: ['#ffd49a', '#a9dcff', '#c8f2ae', '#ffb9cf', '#dcc6ff', '#fff0a0'] };   // 데려온 주민의 빛깔(지금은 앤 모형에 빛깔만 입힘 — 주민 모형이 오면 바꾼다)
const $ = id => document.getElementById(id), sleep = ms => new Promise(r => setTimeout(r, ms)), ox = k => k * T.SEG, HOME = 2, DEST = ox(R.TUNE.GAPS - 1) + 4.4;

// ── 무대
const CALM = new URLSearchParams(location.search).has('calm');   /* ?calm = 시계 없이(밀물·해적선이 멈춤) — 느긋하게 하고 싶은 아이·하네스용 */
const LITE = new URLSearchParams(location.search).has('lite');   /* ?lite = 가벼운 화면(그림자·물결 끔, 낮은 해상도) — 느린 기기와 하네스용 */
const canvas = $('c'), renderer = new THREE.WebGLRenderer({ canvas, antialias: !LITE, powerPreference: 'high-performance' });
renderer.setPixelRatio(LITE ? .6 : Math.min(devicePixelRatio || 1, 1.75)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = !LITE; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xbfe6f5, 24, 70);
{ const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#5fb8ea'); g.addColorStop(.6, '#bfe6f5'); g.addColorStop(1, '#e8f6fb'); x.fillStyle = g; x.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x7aa37a, 1.25));
const sun = new THREE.DirectionalLight(0xfff1d8, 2.4); sun.castShadow = !LITE; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 8, bottom: -6, near: 1, far: 40 }); sun.shadow.bias = -.0008; sun.shadow.normalBias = .04; scene.add(sun, sun.target);
const seaG = new THREE.PlaneGeometry(140, 120, 70, 60).rotateX(-Math.PI / 2), sea = new THREE.Mesh(seaG, new THREE.MeshStandardMaterial({ color: 0x2b9fd2, roughness: .35, metalness: .05, transparent: true, opacity: .92, flatShading: true }));
sea.receiveShadow = true; sea.position.x = 10; scene.add(sea); const seaBase = seaG.attributes.position.array.slice();
const TIDE_DARK = new THREE.Color(0x14506e);
const deep = new THREE.Mesh(new THREE.PlaneGeometry(140, 120).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x0f6a9c })); deep.position.set(10, -1.6, 0); scene.add(deep);
const camera = new THREE.PerspectiveCamera(40, 1, .1, 200), cam = { x: HOME, y: 6, z: 10, lz: 1.4, zoom: 1 };

// ── 재료 불러오기
const loader = new GLTFLoader(), load = n => loader.loadAsync(`./assets/${n}.glb`);
function shadows(o, cast = true){ o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = true; } }); return o; }
/** 선착장 모형을 이어진 조각으로 나눈다 → [{ geo, size, center, tris }] (위치가 같은 정점을 이어 봄). */
function pieces(mesh){ const g = mesh.geometry, pos = g.attributes.position, idx = g.index ? g.index.array : null, n = idx ? idx.length : pos.count, key = new Map(), rep = new Int32Array(pos.count);
  for (let i = 0; i < pos.count; i++) { const k = `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`; if (!key.has(k)) key.set(k, key.size); rep[i] = key.get(k); }
  const par = Array.from({ length: key.size }, (_, i) => i), find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }, at = t => idx ? idx[t] : t;
  for (let t = 0; t < n; t += 3) { const a = find(rep[at(t)]); par[find(rep[at(t + 1)])] = a; par[find(rep[at(t + 2)])] = a; }
  const groups = new Map(); for (let t = 0; t < n; t += 3) { const r = find(rep[at(t)]); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(t); }
  return [...groups.values()].map(ts => { const geo = new THREE.BufferGeometry(); for (const name of Object.keys(g.attributes)) { const src = g.attributes[name], arr = new Float32Array(ts.length * 3 * src.itemSize); let o = 0; for (const t of ts) for (let j = 0; j < 3; j++) { const v = at(t + j); for (let c = 0; c < src.itemSize; c++) arr[o++] = src.getComponent(v, c); } geo.setAttribute(name, new THREE.BufferAttribute(arr, src.itemSize)); }
    geo.computeBoundingBox(); const b = geo.boundingBox; return { geo, size: b.getSize(new THREE.Vector3()), center: b.getCenter(new THREE.Vector3()), tris: ts.length }; }); }

// ── 저장(지갑의 다리 칸): saved = 데려온 주민 수 · wood = 나무 더미의 판자 수. 동의 전에는 화면이 열려 있는 동안만 남는다(지갑이 알아서).
const SAVE = wallet.island('bridge'); SAVE.saved = Math.max(0, SAVE.saved | 0); SAVE.wood = Math.max(0, SAVE.wood | 0); SAVE.fish = Math.max(0, SAVE.fish | 0);
const S = { voy: null, gi: 0, filled: 0, bridge: [], ghosts: [], rafts: [], busy: true, ready: false, intro: false, skip: false, drag: null, anne: null, guest: null, people: [], home: [], pile: [], rig: null, mat: null, ghostMat: null, tweens: [], t: 0, plankGeo: [], plankH: .1, log: [], drops: 0, voyages: 0, ev: null, clock: 0, rise: 0, streak: 0, missing: false, barrels: [], loot: [], fish: 0, kit: null, chaser: null, buckets: [] };
window.__bridge = { S, R, T, SAVE, ox, cam, sea, CALM };

async function build(){
  const [dock, anne, cliffL, cliffR, palm1, palm3, rock1, rock2, rock4, barrel, bucket, ship] = await Promise.all(['Environment_Dock', 'Characters_Anne', 'Environment_Cliff1', 'Environment_Cliff4', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_2', 'Environment_Rock_4', 'Prop_Barrel', 'Prop_Bucket_Fishes', 'Ship_Small'].map(load));
  let dockMesh = null; dock.scene.traverse(m => { if (m.isMesh && !dockMesh) dockMesh = m; }); S.mat = dockMesh.material; const ps = pieces(dockMesh), y0 = T.DECK - 0.49;
  S.ghostMat = S.mat.clone(); S.ghostMat.transparent = true; S.ghostMat.opacity = T.GHOST; S.ghostMat.depthWrite = false; S.ghostMat.emissive = new THREE.Color('#ffffff'); S.ghostMat.emissiveIntensity = .3;
  const planks = ps.filter(p => p.size.z > 1.9 && p.size.y < .15 && p.size.x < .4), frame = ps.filter(p => !planks.includes(p));
  S.plankGeo = planks.map(p => { const g = p.geo.clone(); g.translate(-p.center.x, -p.center.y, -p.center.z); return g; }); S.plankH = planks[0].size.y;
  const put = (o, x, y, z, s = 1, ry = 0) => { const c = o.scene.clone(); c.position.set(x, y, z); c.scale.setScalar(s); c.rotation.y = ry; scene.add(shadows(c)); return c; };
  // 땅: 우리 선착장(둘) · 틈마다 양쪽 선착장 · 건너편 섬 앞 선착장 / 틈: 판자를 뺀 받침·기둥 둘(칸 열 개)
  const lands = [-5, -3]; for (let k = 0; k < R.TUNE.GAPS; k++) lands.push(ox(k) - 1, ox(k) + 5); lands.push(DEST + 2.6);
  const landMat = S.mat.clone(); landMat.color.set(T.LAND); for (const cx of lands) put(dock, cx, y0, 0).traverse(m => { if (m.isMesh) m.material = landMat; });
  for (let k = 0; k < R.TUNE.GAPS; k++) for (const cx of [ox(k) + 1, ox(k) + 3]) for (const p of frame) { const m = new THREE.Mesh(p.geo, S.mat); m.position.set(cx, y0, 0); scene.add(shadows(m)); }
  // 우리 섬(왼쪽) · 쉬어 가는 바위(틈 사이) · 건너편 섬(오른쪽)
  put(cliffL, -7.4, 0, -2.2, 1.0, .4); put(palm1, -5.8, 1.9, -2.6, 1.0, .5); put(rock2, -4.6, 0, 1.4, 1.3, .3); put(rock1, -5.4, 0, 2.8, 1.2); put(rock1, 1.6, 0, -3.6, 1.0, 2);
  for (let k = 0; k < R.TUNE.GAPS - 1; k++) { const x = ox(k) + 6; put(rock2, x - .2, -.2, -2.3, 2.0, k * 1.3); put(rock4, x + 1.1, 0, -1.6, 1.5, 1 + k); put(k % 2 ? palm3 : palm1, x - .1, .9, -2.5, .8, k * 2); put(rock1, x + 3.6, 0, -3.9, 1.0, k + 2); }
  put(cliffR, DEST + 5.8, 0, -1.8, .82, -.6); put(palm3, DEST + 4.4, 2.6, -3.0, 1.0, 2.0); put(palm1, DEST + 6.2, 2.0, .6, .8, 1.2); put(rock4, DEST + 2.6, 0, 1.9, 1.4, 1); put(rock4, DEST + 3.8, 0, 4.4, 1.1, .7);
  put(barrel, DEST + 3.2, T.DECK, -.6, .7, .4); put(bucket, DEST + 3.3, T.DECK, .6, .6, -.8); put(ship, -8, 0, -17, .9, .5);
  S.kit = { barrel, bucket, ship, put }; S.chaser = put(ship, -6, 0, T.SHIP_Z, T.SHIP_S, T.SHIP_RY); S.chaser.visible = false;
  for (let i = 0; i < Math.min(SAVE.fish, 4); i++) S.buckets.push(put(bucket, -5.4 + i * .5, T.DECK, .62, .5, i));
  // 사람: 앤(무기는 숨김) · 주민은 같은 모형에 빛깔만 입힘
  S.rig = anne; S.anne = person(null); S.anne.obj.position.set(T.START_X, standY(), 0); face(S.anne, 1); play(S.anne, 'Idle');
  for (let i = 0; i < Math.min(SAVE.saved, T.HOME_MAX); i++) { const p = person(T.TINT[i % T.TINT.length]); p.obj.position.copy(homeSpot(i)); face(p, 1); play(p, 'Idle'); S.home.push(p); }
  for (let i = 0; i < Math.min(SAVE.wood, T.PILE_MAX); i++) pileAdd(plank(i));
  resize(); newVoyage(); $('loading').style.opacity = 0; setTimeout(() => $('loading').hidden = true, 500); S.ready = true;
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 처음으로 돌아가요'; document.body.appendChild(n); }
  intro(); }

// ── 사람
const standY = () => T.DECK + .18 * .62;
function person(tint){ const obj = cloneRig(S.rig.scene); obj.traverse(m => { if (/^Weapon_/.test(m.name)) m.visible = false; if (tint && m.isMesh) { m.material = m.material.clone(); m.material.color.set(tint); } }); obj.scale.setScalar(.62); scene.add(shadows(obj));
  const mixer = new THREE.AnimationMixer(obj), acts = {}; for (const clip of S.rig.animations) acts[clip.name] = mixer.clipAction(clip); const p = { obj, mixer, acts, act: null }; S.people.push(p); return p; }
function unperson(p){ scene.remove(p.obj); S.people.splice(S.people.indexOf(p), 1); }
function play(p, name, once = false){ const next = p.acts[name]; if (!next || p.act === next) return; next.reset(); next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); next.clampWhenFinished = once; next.play(); if (p.act) p.act.crossFadeTo(next, .25, false); p.act = next; }
const face = (p, dir) => { p.obj.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; };
const runSpeed = () => T.RUN * (1 + T.STREAK_RUN * Math.min(S.streak, T.STREAK_MAX));
async function go(p, x, run = false){ const o = p.obj; if (Math.abs(x - o.position.x) < .02) return; face(p, x - o.position.x); play(p, run ? 'Run' : 'Walk'); await tween(o, { 'position.x': x }, Math.abs(x - o.position.x) / (run ? runSpeed() : T.WALK) * 1000, t => t); play(p, 'Idle'); }
const homeSpot = i => new THREE.Vector3(-2.3 - (i >> 1) * .62, standY(), i % 2 ? .55 : -.55);

// ── 판자
const slotX = (k, i) => ox(k) + T.SLOT / 2 + i * T.SLOT, plankY = () => T.DECK - S.plankH / 2;
function plank(i, mat = S.mat){ const m = new THREE.Mesh(S.plankGeo[Math.abs(i) % S.plankGeo.length], mat); m.scale.x = T.PLANK_W; m.castShadow = mat === S.mat; m.receiveShadow = mat === S.mat; m.userData.k = i; scene.add(m); return m; }
function pileAdd(p){ const i = S.pile.length; p.rotation.set(0, Math.PI / 2, 0); p.position.set(-4.3 + (i % 2) * .08, T.DECK + S.plankH * (Math.floor(i / 2) + .5), i % 2 ? .22 : -.22); p.scale.set(T.PLANK_W, 1, .5); S.pile.push(p); }

// ── 한 번의 길 차리기: 틈 셋에 놓인 판자와 빈 칸 자리 · 물 위의 내 뗏목 넷 · 건너편에서 기다리는 주민
function newVoyage(){ for (const b of S.bridge) for (const p of b) if (p) scene.remove(p); for (const g of S.ghosts) for (const p of g) if (p) scene.remove(p); for (const r of S.rafts) { for (const p of r.planks) scene.remove(p); scene.remove(r.group); }
  S.voy = R.voyage(Math.random, { first: SAVE.saved === 0 && S.voyages === 0, prev: S.voy }); S.voyages++; S.gi = 0; S.rafts = []; S.bridge = []; S.ghosts = [];
  S.voy.gaps.forEach((g, k) => { const b = Array(R.SLOTS).fill(null), gh = Array(R.SLOTS).fill(null);
    for (let i = 0; i < R.SLOTS; i++) { if (i < g.have) { b[i] = plank(i + k * 3); b[i].position.set(slotX(k, i), plankY(), 0); } else if (T.SLOTS_SHOWN) { gh[i] = plank(i, S.ghostMat); gh[i].position.set(slotX(k, i), plankY() - .01, 0); } } S.bridge.push(b); S.ghosts.push(gh); });
  S.filled = S.voy.gaps[0].have; S.voy.cargo.forEach((n, j) => raft(n, j)); layout(0);
  S.anne.obj.position.set(T.START_X, standY(), 0); face(S.anne, 1); play(S.anne, 'Idle');
  if (S.guest) unperson(S.guest); S.guest = person(T.TINT[SAVE.saved % T.TINT.length]); S.guest.obj.position.set(DEST + 2.2, standY(), -.5); face(S.guest, -1); play(S.guest, 'Wave');
  for (const b of S.barrels) if (b) scene.remove(b); for (const o of S.loot) scene.remove(o); S.loot = []; S.fish = 0; S.barrels = []; for (let k = 0; k < R.TUNE.GAPS - 1; k++) S.barrels.push(S.kit.put(S.kit.barrel, ox(k) + 6.2, T.DECK, -.6, .7, k + .4));
  S.ev = R.event(SAVE.saved); S.clock = 0; S.rise = 0; S.missing = false; S.chaser.visible = S.ev.kind === 'ship' && !CALM; flames();
  signs(); $('tray').innerHTML = ''; $('tray').className = ''; $('pick').innerHTML = ''; $('pick').className = '';
  S.log.push({ voyage: S.voy.gaps.map(g => g.have), cargo: S.voy.cargo.slice(), ev: S.ev.kind + (S.ev.drift ? '+drift' : '') }); }
// ── 수 팻말: 틈마다 빈 칸 수가 떠 있다(놓을수록 준다). 다 이은 틈의 수는 위쪽 띠로 올라가 모인다(2 + 3 + 4)
function signs(){ document.querySelectorAll('.sign').forEach(e => e.remove()); S.signs = S.voy.gaps.map(() => { const e = document.createElement('div'); e.className = 'sign'; document.body.appendChild(e); return e; }); }
const roomOf = k => k < S.gi ? 0 : R.SLOTS - (k === S.gi ? S.filled : S.voy.gaps[k].have);
function signsDraw(){ if (!S.signs) return; S.signs.forEach((e, k) => { const room = roomOf(k), have = R.SLOTS - room; if (!room) { e.style.display = 'none'; return; } const q = window.__bridge.screenOf(new THREE.Vector3(ox(k) + (have + R.SLOTS) / 2 * T.SLOT, T.DECK + .95, 0));
  if (q.x < -40 || q.x > innerWidth + 40) { e.style.display = 'none'; return; } e.style.display = ''; e.style.left = q.x + 'px'; e.style.top = q.y + 'px'; if (e.textContent !== String(room)) { e.textContent = room; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); } }); }
function trayAdd(n){ const t = $('tray'); if (t.children.length) { const p = document.createElement('i'); p.textContent = '+'; t.appendChild(p); } const b = document.createElement('b'); b.textContent = n; t.appendChild(b); t.className = 'on'; }
/** 길 끝: 놓은 판자의 합을 고른다. 아닌 수를 누르면 그 수가 물러날 뿐(표시·감점 없음), 맞는 수를 누를 때까지. */
function ask(){ return new Promise(res => { const q = R.total(S.voy), t = $('tray'), pk = $('pick'); S.ask = q; const eq = document.createElement('i'); eq.textContent = '='; const hole = document.createElement('b'); hole.className = 'hole'; hole.textContent = '?'; t.append(eq, hole); pk.innerHTML = ''; pk.className = 'on';
  q.picks.forEach(n => { const b = document.createElement('button'); b.textContent = n; b.dataset.n = n; b.onclick = () => { audio(); S.log.push({ pick: n, right: n === q.sum });
    if (n !== q.sum) { b.disabled = true; b.classList.add('away'); play(S.anne, 'No', true); tone(240, .25, 'sine', .08); setTimeout(() => { if (S.anne.act === S.anne.acts.No) play(S.anne, 'Idle'); }, 1300); return; }
    pk.className = ''; hole.textContent = n; hole.className = 'done'; S.ask = null; res(n); }; pk.appendChild(b); }); }); }
function raft(n, j, single = false){ const g = new THREE.Group(); scene.add(g); const r = { n, group: g, home: new THREE.Vector3(0, T.RAFT_Y, T.RAFT_Z), planks: [], used: false, single, ph: j * 1.7 };
  for (let k = 0; k < n; k++) { const p = plank(k + j * 3); scene.remove(p); p.position.set((k - (n - 1) / 2) * T.RAFT_GAP, 0, (k % 2 ? 1 : -1) * T.RAFT_STAG * (n > 1 ? 1 : 0)); g.add(p); r.planks.push(p); } S.rafts.push(r); return r; }
const live = () => S.rafts.filter(r => !r.used);
/** 남은 뗏목을 지금 틈 앞 물 위에 나란히 세운다(ms 가 있으면 물결을 타고 옮겨 간다). */
function layout(ms){ const rs = live(), w = rs.map(r => r.n * T.RAFT_GAP), total = w.reduce((a, b) => a + b, 0) + (rs.length - 1) * T.RAFT_SPACE; let x = ox(S.gi) + 2 - total / 2; const jobs = [];
  rs.forEach((r, i) => { r.home.set(x + w[i] / 2, T.RAFT_Y, T.RAFT_Z); x += w[i] + T.RAFT_SPACE; if (S.drag && S.drag.r === r) return; if (!ms) r.group.position.copy(r.home); else if (Math.abs(r.group.position.x - r.home.x) + Math.abs(r.group.position.z - r.home.z) > .02) jobs.push(tween(r.group, { 'position.x': r.home.x, 'position.y': r.home.y, 'position.z': r.home.z }, ms)); }); return Promise.all(jobs); }
/** 들어갈 뗏목이 없으면 낱 판자 한 장이 떠내려온다. */
function single(){ if (!R.needSingle(S.filled, live().map(r => r.n))) return; const r = raft(1, S.rafts.length, true); r.group.position.set(ox(S.gi) - 5.5, T.RAFT_Y, T.RAFT_Z + .5); S.log.push({ single: true }); return layout(T.SINGLE_MS); }

// ── 움직임(작은 tween)
function tween(o, to, ms, ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2){ return new Promise(res => { const from = {}; for (const k in to) from[k] = k.split('.').reduce((a, b) => a[b], o); S.tweens.push({ o, to, from, ms: Math.max(1, ms), t: 0, ease, res }); }); }
function setPath(o, k, v){ const ks = k.split('.'), last = ks.pop(); ks.reduce((a, b) => a[b], o)[last] = v; }
const wait = async ms => { for (let t = 0; t < ms && !S.skip; t += 50) await sleep(50); };

// ── 떠나는 장면: 건너편에서 누가 손을 흔든다 → 끊어진 다리를 따라 돌아와 앤 앞에 선다(화면을 누르면 건너뜀)
async function intro(){ S.busy = true; S.intro = true; S.skip = false; const f = S.voyages > 1 ? 1 : 0; cam.x = DEST + .6; await wait(T.INTRO_HOLD[f]); if (!S.skip) await tween(cam, { x: HOME }, T.INTRO_MS[f]); cam.x = HOME; S.intro = false; S.busy = false; S.idle = S.t; single(); }

// ── 뗏목을 틈에 놓았다
async function drop(r){ S.busy = true; S.drops++; hintOff(); audio(); const k = S.gi, out = R.place(S.filled, r.n), wp = new THREE.Vector3(); S.log.push({ gap: k, drop: r.n, kind: out.kind, single: r.single });
  r.used = true; const moved = r.planks.slice();
  for (let j = 0; j < moved.length; j++) { const p = moved[j]; p.getWorldPosition(wp); r.group.remove(p); scene.add(p); p.position.copy(wp); p.rotation.set(0, 0, 0);
    if (j < out.put) { const i = S.filled + j; S.bridge[k][i] = p; if (S.ghosts[k][i]) { scene.remove(S.ghosts[k][i]); S.ghosts[k][i] = null; } await tween(p, { 'position.x': slotX(k, i), 'position.y': plankY(), 'position.z': 0 }, T.PLANK_MS); tone(300 + i * 40, .09, 'triangle', .1); }
    else { await tween(p, { 'position.x': slotX(k, R.SLOTS - 1) + .6 + (j - out.put) * .3, 'position.y': T.DECK + .4, 'position.z': .2 }, T.PLANK_MS); tween(p, { 'position.y': -1.4, 'position.z': 1.1, 'rotation.z': -1.4, 'rotation.x': .6 }, 900, t => t * t).then(() => scene.remove(p)); tone(180, .3, 'sine', .1, 0, 90); } }
  scene.remove(r.group); S.filled = out.filled; layout(500); if (S.missing) return out;
  if (out.kind === 'fit') { S.streak++; S.clock = Math.max(0, S.clock - R.PRESS.BACK); tween(cam, { zoom: .93 }, 120).then(() => tween(cam, { zoom: 1 }, 260)); } else S.streak = 0; flames();
  if (!out.done) { await sleep(150); await go(S.anne, Math.max(ox(k) + T.START_X, slotX(k, S.filled - 1) - .05), true); play(S.anne, 'No', true); tone(240, .25, 'sine', .08); await sleep(900); await go(S.anne, ox(k) + T.START_X, true); face(S.anne, 1); if (S.missing) return out; S.busy = false; S.idle = S.t; single(); return out; }
  // 열째 판자: 다리가 이어졌다 — 판자가 차례로 통 튄다
  S.bridge[k].forEach((p, i) => { setTimeout(() => { tween(p, { 'position.y': plankY() + .1 }, 90).then(() => tween(p, { 'position.y': plankY() }, 140)); tone((392 + i * 44) * (1 + .06 * Math.min(S.streak, T.STREAK_MAX)), .07, 'triangle', .07); }, i * 45); });
  trayAdd(S.voy.gaps[k].need); await sleep(500); await go(S.anne, ox(k) + T.END_X, true); if (S.missing) return out;
  if (k < R.TUNE.GAPS - 1) { S.gi = k + 1; S.filled = S.voy.gaps[S.gi].have; const camMove = tween(cam, { x: ox(S.gi) + 2 }, 1300); await openBarrel(k); await Promise.all([camMove, layout(900), go(S.anne, ox(S.gi) + T.START_X, true)]); if (S.missing) return out; S.busy = false; S.idle = S.t; single(); return out; }
  await arrive(); return out; }

// ── 쉬어 가는 땅의 통: 뭐가 나올지 모른다(덤 뗏목 · 물고기 양동이)
async function openBarrel(k){ const b = S.barrels[k]; if (!b) return; S.barrels[k] = null; await go(S.anne, b.position.x - .55, true); const out = R.barrel(); S.log.push({ barrel: out.kind, n: out.n | 0 });
  tone(200, .08, 'square', .06); await tween(b, { 'scale.x': .95, 'scale.y': .95, 'scale.z': .95, 'position.y': T.DECK + .35 }, 160); tween(b, { 'scale.x': .01, 'scale.y': .01, 'scale.z': .01 }, 140).then(() => scene.remove(b)); [523, 784, 1047].forEach((f, i) => tone(f, .12, 'triangle', .1, i * .06));
  if (out.kind === 'raft') { const r = raft(out.n, S.rafts.length); r.group.position.set(b.position.x, T.DECK + .6, -.3); await sleep(250); }
  else { const o = S.kit.put(S.kit.bucket, b.position.x, T.DECK, -.6, .01, .5); S.loot.push(o); S.fish++; await tween(o, { 'scale.x': .62, 'scale.y': .62, 'scale.z': .62, 'position.y': T.DECK + .3 }, 220); await tween(o, { 'position.y': T.DECK }, 160); } }
// ── 불꽃: 연달아 딱 맞춘 수만큼(글 없음)
function flames(){ const e = $('streak'); e.textContent = S.streak > 1 ? '🔥'.repeat(Math.min(S.streak, 6)) : ''; }
// ── 늦었다: 밀물이면 주민이 통을 타고 떠내려가고, 해적선이면 배가 태워 간다. 벌·표시 없이 새 길에서 다시 만난다.
async function miss(){ if (S.missing) return; S.missing = true; S.busy = true; S.streak = 0; flames(); hintOff(); if (S.drag) { const r = S.drag.r; S.drag = null; tween(r.group, { 'position.x': r.home.x, 'position.z': r.home.z }, 300); }
  S.ask = null; $('pick').className = ''; S.log.push({ missed: S.ev.kind }); const g = S.guest, o = g.obj; tone(300, .5, 'sine', .1, 0, 140); play(S.anne, 'No', true); await tween(cam, { x: DEST + .6 }, 1100); play(g, 'Wave');
  if (S.ev.kind === 'ship') { await tween(S.chaser, { 'position.x': o.position.x + .3, 'position.z': -2.2 }, 900); await tween(o, { 'position.y': standY() + .25, 'position.z': -2.0 }, 500); tween(S.chaser, { 'position.x': DEST + 16 }, 3000, t => t * t); await tween(o, { 'position.x': DEST + 15.7 }, 3000, t => t * t); }
  else { const b = S.kit.put(S.kit.barrel, o.position.x, S.rise + .1, 1.6, .9, 0); S.loot.push(b); await tween(o, { 'position.z': 1.6, 'position.y': S.rise + .75 }, 500); tween(b, { 'position.x': DEST + 14 }, 3200, t => t * t); await tween(o, { 'position.x': DEST + 14 }, 3200, t => t * t); }
  $('fade').style.opacity = 1; await sleep(480); S.tweens.length = 0; cam.zoom = 1; newVoyage(); await sleep(80); $('fade').style.opacity = 0; intro(); }

// ── 건너편에 닿았다: 주민과 함께 내가 놓은 다리 셋을 달려 돌아온다 · 남은 뗏목은 나무 더미로
async function arrive(){ const g = S.guest, left = live(); await ask(); if (S.missing) return; S.busy = true; play(S.anne, 'Yes', true); play(g, 'Yes', true); tone(660, .12, 'triangle', .1); tone(880, .16, 'triangle', .1, .12); await sleep(1400);
  const spot = homeSpot(Math.min(S.home.length, T.HOME_MAX - 1)), ms = (S.anne.obj.position.x - T.START_X) / T.RUN * 1000;
  tween(cam, { x: HOME - 3 }, ms, t => t); for (const r of left) tween(r.group, { 'position.x': -4.2, 'position.z': 2.4 }, ms, t => t);
  setTimeout(() => go(g, spot.x, true).then(() => { tween(g.obj, { 'position.z': spot.z }, 300); face(g, 1); play(g, 'Wave'); }), 350); await go(S.anne, T.START_X, true); face(S.anne, 1);
  let wood = 0; for (const r of left) { r.used = true; for (const p of r.planks) { const wp = p.getWorldPosition(new THREE.Vector3()); r.group.remove(p); scene.add(p); p.position.copy(wp); wood++; if (S.pile.length < T.PILE_MAX) { const at = S.pile.length; pileAdd(p); const to = p.position.clone(); p.position.copy(wp); await tween(p, { 'position.x': to.x, 'position.y': to.y, 'position.z': to.z }, 320); tone(260 + at * 30, .08, 'triangle', .09); } else scene.remove(p); } scene.remove(r.group); }
  SAVE.saved++; SAVE.wood += wood; SAVE.fish += S.fish; wallet.save(); S.log.push({ arrived: true, wood, saved: SAVE.saved, fish: S.fish });
  for (const o of S.loot.splice(0)) { scene.remove(o); if (S.buckets.length < 4) S.buckets.push(S.kit.put(S.kit.bucket, -5.4 + S.buckets.length * .5, T.DECK, .62, .5, S.buckets.length)); }
  if (S.home.length >= T.HOME_MAX) unperson(S.home.shift()); S.home.push(g); S.guest = null; S.home.forEach((p, i) => { const s = homeSpot(i); tween(p.obj, { 'position.x': s.x, 'position.z': s.z }, 400); });
  await sleep(2200); $('fade').style.opacity = 1; await sleep(480); play(S.home[S.home.length - 1], 'Idle'); newVoyage(); await sleep(80); $('fade').style.opacity = 0; intro(); }

// ── 손 그림자: 맨 처음 길 첫 틈에서 손이 없으면, 뗏목에서 틈으로 한 번 지나간다(글 없음)
let hintEl = null; function hintOff(){ if (hintEl) { hintEl.remove(); hintEl = null; } }
function hint(){ if (hintEl || S.busy || S.drag || SAVE.saved > 0 || S.voyages > 1 || S.drops > 0 || S.t - (S.idle || 0) < T.HINT_MS / 1000) return; const r = live().find(x => x.n === R.SLOTS - S.filled); if (!r) return;
  const a = window.__bridge.screenOf(r.group), b = window.__bridge.screenOf(window.__bridge.gap()); hintEl = document.createElement('div'); hintEl.id = 'hint'; hintEl.textContent = '👆'; hintEl.style.left = a.x + 'px'; hintEl.style.top = a.y + 'px'; document.body.appendChild(hintEl);
  requestAnimationFrame(() => { if (!hintEl) return; hintEl.style.opacity = 1; setTimeout(() => { if (hintEl) hintEl.style.transform = `translate(${b.x - a.x}px,${b.y - a.y}px)`; }, 350); }); setTimeout(() => { hintOff(); S.idle = S.t; }, 2600); }

// ── 손으로 끌기
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), liftPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(T.DECK + .45)), hit = new THREE.Vector3();
function pointer(e){ const b = canvas.getBoundingClientRect(); ndc.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(ndc, camera); }
canvas.addEventListener('pointerdown', e => { if (S.intro) { S.skip = true; S.tweens.forEach(w => { if (w.o === cam) w.t = w.ms; }); return; } if (S.busy || !S.ready || S.missing) return; audio(); hintOff(); pointer(e); const rs = live(), h = ray.intersectObjects(rs.flatMap(r => r.planks), false)[0];
  let r = h ? rs.find(x => x.planks.includes(h.object)) : null;
  if (!r) { let best = 1e9; for (const x of rs) { const q = window.__bridge.screenOf(x.group), d = Math.hypot(q.x - e.clientX, q.y - e.clientY); if (d < best) { best = d; r = x; } } if (best > T.PICK_PX) r = null; }   /* 판자 사이 틈을 눌러도 집힘 */
  if (!r || S.tweens.some(w => w.o === r.group)) return; S.drag = { r, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); tone(520, .06, 'sine', .06); });
canvas.addEventListener('pointermove', e => { if (!S.drag || e.pointerId !== S.drag.id) return; pointer(e); if (ray.ray.intersectPlane(liftPlane, hit)) { const g = S.drag.r.group; g.position.set(hit.x, T.DECK + .45, hit.z); } });
const end = e => { if (!S.drag || e.pointerId !== S.drag.id) return; const r = S.drag.r, p = r.group.position, x = p.x - ox(S.gi); S.drag = null; S.idle = S.t;
  if (!S.busy && !S.missing && x > T.DROP_X[0] && x < T.DROP_X[1] && Math.abs(p.z) < T.DROP_Z) drop(r); else tween(r.group, { 'position.x': r.home.x, 'position.y': r.home.y, 'position.z': r.home.z }, 420); };
canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

// ── 화면 크기 · 그리기
function resize(){ const w = innerWidth, h = innerHeight, tall = h > w; renderer.setSize(w, h, false); camera.aspect = w / h; const asp = w / h, vfov = tall ? 50 : 40, half = Math.atan(Math.tan(vfov * Math.PI / 360) * asp), dist = Math.max(10.5, (tall ? 4.7 : 5.2) / Math.tan(half));   /* 다리와 뗏목(가로 약 10)이 늘 화면 안에 */
  camera.fov = vfov; cam.y = 1 + dist * (tall ? .42 : .5); cam.z = 1.4 + dist * .9; cam.lz = tall ? 1.8 : 1.4; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
let last = performance.now(); function loop(now){ requestAnimationFrame(loop); const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now; S.t += dt; const t = S.t;
  const sp = seaG.attributes.position; if (!LITE) for (let i = 0; i < sp.count; i++) { const x = seaBase[i * 3], z = seaBase[i * 3 + 2]; sp.array[i * 3 + 1] = Math.sin(x * .45 + t * 1.2) * .05 + Math.cos(z * .5 + t * .9) * .05; } sp.needsUpdate = true;
  // 시계: 아이가 생각하는 동안에만 간다(뗏목을 고르는 때 · 합을 고르는 때). 밀물은 물 높이로, 해적선은 배의 자리로 보인다.
  if (S.ready && S.ev && !CALM && !S.missing && !S.intro && (!S.busy || S.ask)) { S.clock = Math.min(1, S.clock + dt / S.ev.budget); if (S.clock >= 1) miss(); }
  if (S.ev && !CALM && !S.missing && S.guest) { if (S.clock > T.HURRY && S.guest.act === S.guest.acts.Wave) play(S.guest, 'Jump'); if (S.clock > T.BEAT && !S.intro && (!S.busy || S.ask) && t - (S.beat || 0) > .25 + (1 - S.clock) * 2.2) { S.beat = t; tone(96, .09, 'sine', .16); tone(72, .12, 'sine', .12, .09); } }
  if (S.ev) { sea.material.color.setHex(0x2b9fd2).lerp(TIDE_DARK, S.ev.kind === 'tide' ? S.clock * .55 : 0); const rise = S.ev.kind === 'tide' ? S.clock * T.TIDE : 0; S.rise += (rise - S.rise) * Math.min(1, dt * 3); sea.position.y = S.rise; if (S.chaser.visible && !S.missing) { S.chaser.position.x = -7 + (DEST + 9) * S.clock; S.chaser.position.y = Math.sin(t * 1.3) * .06; S.chaser.rotation.z = Math.sin(t * .9) * .03; } }
  for (const r of S.rafts) if (!r.used) { r.home.y = T.RAFT_Y + S.rise; if ((!S.drag || S.drag.r !== r) && !S.tweens.some(w => w.o === r.group)) { r.group.position.y = r.home.y + Math.sin(t * 1.6 + r.ph) * .05; r.group.rotation.z = Math.sin(t * 1.1 + r.ph) * .03; if (S.ev && S.ev.drift && !S.busy) r.group.position.x = r.home.x + Math.sin(t * T.DRIFT_HZ + r.ph) * T.DRIFT; } }
  for (let i = S.tweens.length - 1; i >= 0; i--) { const w = S.tweens[i]; w.t += dt * 1000; const k = Math.min(1, w.t / w.ms), e = w.ease(k); for (const key in w.to) setPath(w.o, key, w.from[key] + (w.to[key] - w.from[key]) * e); if (k >= 1) { S.tweens.splice(i, 1); w.res(); } }
  for (const p of S.people) p.mixer.update(dt);
  camera.position.set(cam.x, cam.y * cam.zoom, cam.z * cam.zoom); camera.lookAt(cam.x, .7, cam.lz); sun.position.set(cam.x - 8, 11, 8); sun.target.position.set(cam.x, 0, 0);
  if (S.ready) { hint(); signsDraw(); } renderer.render(scene, camera); }
requestAnimationFrame(loop);
// 하네스용: 화면 좌표 · 지금 틈의 첫 빈 칸 위
window.__bridge.screenOf = obj => { const v = (obj.isVector3 ? obj.clone() : obj.getWorldPosition(new THREE.Vector3())).project(camera), b = canvas.getBoundingClientRect(); return { x: b.left + (v.x + 1) / 2 * b.width, y: b.top + (1 - v.y) / 2 * b.height }; };
window.__bridge.gap = () => new THREE.Vector3(slotX(S.gi, Math.min(R.SLOTS - 1, S.filled)), T.DECK + .45, 0);
window.__bridge.live = live;
build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
