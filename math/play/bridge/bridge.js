/* 다리 놓기 — 1학년 「10 만들기」 한 판.
 * 끊어진 다리에 판자 칸이 열 개. 물 위에 판자 뗏목 셋이 떠 있다. 하나를 손으로 끌어 틈에 놓는다.
 * 딱 맞으면 다리가 이어져 앤이 건너간다 · 넘치면 남은 판자가 물에 떨어진다 · 모자라면 틈이 남아 앤이 한 발 내밀었다 물러서고 판자는 다시 떠오른다.
 * 가위표·정답 표시·점수·동전 없음. 세계가 답한다. 숫자와 묶음은 ./rules.js 가 매번 다르게 낸다.
 * 화면은 기성 3D 재료(Quaternius Pirate Kit, CC0)만 쓴다 — 판자·받침·기둥은 선착장 모형을 조각으로 나눠 그대로 쓴다(assets/CREDITS.md). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as R from './rules.js?v=1';
import { audio, tone } from '../common/kit.js?v=3';

// ── 내가 정한 수치(준호가 보고 바꾼다)
const T = { PICK_PX: 70, DECK: 1.0, SLOT: 0.4, PLANK_W: 1.3, RAFT_GAP: .42, GAP_X: 0, WALK: 1.5, PLANK_MS: 260, OVER_CROSS: true,   // OVER_CROSS: 넘쳐도 다리가 다 차면 건너간다(준호 말씀 그대로). false 면 넘칠 때 건너지 않음
  RAFT_Z: 3.1, RAFT_Y: .2, RAFT_X: [-1.0, 2.0, 5.0], DROP_X: [-0.7, 4.7], DROP_Z: 1.9, START_X: -1.25, END_X: 5.3 };
const $ = id => document.getElementById(id), sleep = ms => new Promise(r => setTimeout(r, ms));

// ── 무대
const canvas = $('c'), renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xbfe6f5, 22, 60);
{ const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#5fb8ea'); g.addColorStop(.6, '#bfe6f5'); g.addColorStop(1, '#e8f6fb'); x.fillStyle = g; x.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x7aa37a, 1.25));
const sun = new THREE.DirectionalLight(0xfff1d8, 2.4); sun.position.set(-6, 11, 8); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -9, right: 11, top: 8, bottom: -6, near: 1, far: 40 }); sun.shadow.bias = -.0008; sun.shadow.normalBias = .04; sun.target.position.set(2, 0, 0); scene.add(sun, sun.target);
const seaG = new THREE.PlaneGeometry(120, 120, 60, 60).rotateX(-Math.PI / 2), sea = new THREE.Mesh(seaG, new THREE.MeshStandardMaterial({ color: 0x2b9fd2, roughness: .35, metalness: .05, transparent: true, opacity: .92, flatShading: true }));
sea.receiveShadow = true; scene.add(sea); const seaBase = seaG.attributes.position.array.slice();
const deep = new THREE.Mesh(new THREE.PlaneGeometry(120, 120).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x0f6a9c })); deep.position.y = -1.6; scene.add(deep);
const camera = new THREE.PerspectiveCamera(40, 1, .1, 200);

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

const S = { round: null, slots: [], rafts: [], busy: true, ready: false, drag: null, anne: null, mixer: null, acts: {}, act: null, planks: [], mat: null, tweens: [], t: 0, plankGeo: [], log: [] };
window.__bridge = { S, R, T };

async function build(){
  const [dock, anne, cliffL, cliffR, palm1, palm3, rock1, rock2, rock4, barrel, bucket, ship] = await Promise.all(['Environment_Dock', 'Characters_Anne', 'Environment_Cliff1', 'Environment_Cliff4', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_2', 'Environment_Rock_4', 'Prop_Barrel', 'Prop_Bucket_Fishes', 'Ship_Small'].map(load));
  let dockMesh = null; dock.scene.traverse(m => { if (m.isMesh && !dockMesh) dockMesh = m; }); S.mat = dockMesh.material; const ps = pieces(dockMesh), y0 = T.DECK - 0.49;
  const planks = ps.filter(p => p.size.z > 1.9 && p.size.y < .15 && p.size.x < .4), frame = ps.filter(p => !planks.includes(p));
  S.plankGeo = planks.map(p => { const g = p.geo.clone(); g.translate(-p.center.x, -p.center.y, -p.center.z); return g; }); S.plankH = planks[0].size.y;
  // 양쪽 땅: 온전한 선착장 · 가운데: 판자를 뺀 받침·기둥 둘(칸 열 개)
  for (const cx of [T.START_X + .25, T.END_X - .3]) { const d = dock.scene.clone(); d.position.set(cx, y0, 0); scene.add(shadows(d)); }
  for (const cx of [1, 3]) for (const p of frame) { const m = new THREE.Mesh(p.geo, S.mat); m.position.set(cx, y0, 0); scene.add(shadows(m)); }
  // 섬·바위·나무·소품
  const put = (o, x, y, z, s = 1, ry = 0) => { const c = o.scene.clone(); c.position.set(x, y, z); c.scale.setScalar(s); c.rotation.y = ry; scene.add(shadows(c)); return c; };
  put(cliffL, -6.2, 0, -2.2, 1.0, .4); put(cliffR, 10.2, 0, -1.8, .82, -.6); put(palm1, -4.6, 1.9, -2.6, 1.0, .5); put(palm3, 8.8, 2.6, -3.0, 1.0, 2.0); put(palm1, 10.6, 2.0, .6, .8, 1.2);
  put(rock2, -3.4, 0, 1.2, 1.3, .3); put(rock1, -4.2, 0, 2.6, 1.2); put(rock4, 7.0, 0, 1.6, 1.4, 1); put(rock1, 1.6, 0, -3.6, 1.0, 2); put(rock4, 8.2, 0, 4.4, 1.1, .7);
  put(barrel, T.END_X + .5, T.DECK, -.6, .7, .4); put(bucket, T.END_X - .2, T.DECK, .55, .6, -.8); put(ship, -6, 0, -17, .9, .5);
  // 앤(무기는 숨김) · 걷기·기다리기·응·아니
  const a = anne.scene; a.traverse(m => { if (/^Weapon_/.test(m.name)) m.visible = false; }); a.scale.setScalar(.62); a.position.set(T.START_X, T.DECK + .18 * .62, 0); a.rotation.y = Math.PI / 2; scene.add(shadows(a)); S.anne = a;
  S.mixer = new THREE.AnimationMixer(a); for (const clip of anne.animations) S.acts[clip.name] = S.mixer.clipAction(clip); play('Idle');
  newRound(true); resize(); $('loading').style.opacity = 0; setTimeout(() => $('loading').hidden = true, 500); S.ready = true; S.busy = false; }

function play(name, once = false){ const next = S.acts[name]; if (!next || S.act === next) return; next.reset(); next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); next.clampWhenFinished = once; next.play(); if (S.act) S.act.crossFadeTo(next, .25, false); S.act = next; }
const slotX = i => T.GAP_X + T.SLOT / 2 + i * T.SLOT, plankY = () => T.DECK - S.plankH / 2;
function plank(i){ const m = new THREE.Mesh(S.plankGeo[i % S.plankGeo.length], S.mat); m.scale.x = T.PLANK_W; m.castShadow = m.receiveShadow = true; m.userData.k = i; scene.add(m); return m; }

// ── 한 판 차리기: 다리에 놓인 판자 · 물 위 뗏목 셋
function newRound(first){ for (const s of S.slots) if (s) scene.remove(s); for (const r of S.rafts) { for (const p of r.planks) scene.remove(p); scene.remove(r.group); }
  S.round = R.round(Math.random, S.round); S.slots = Array(R.SLOTS).fill(null); S.rafts = [];
  for (let i = 0; i < S.round.have; i++) { const p = plank(i); p.position.set(slotX(i), plankY(), 0); S.slots[i] = p; }
  S.round.bundles.forEach((n, j) => { const g = new THREE.Group(), home = new THREE.Vector3(T.RAFT_X[j], T.RAFT_Y, T.RAFT_Z); g.position.copy(home); scene.add(g); const r = { n, group: g, home, planks: [], used: false, ph: j * 1.7 };
    for (let k = 0; k < n; k++) { const p = plank(k + j * 3); scene.remove(p); p.position.set((k - (n - 1) / 2) * T.RAFT_GAP, 0, 0); g.add(p); r.planks.push(p); } S.rafts.push(r); });
  S.anne.position.x = T.START_X; S.anne.rotation.y = Math.PI / 2; play('Idle'); S.log.push({ have: S.round.have, bundles: S.round.bundles.slice() }); }

// ── 움직임(작은 tween)
function tween(o, to, ms, ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2){ return new Promise(res => { const from = {}; for (const k in to) from[k] = k.split('.').reduce((a, b) => a[b], o); S.tweens.push({ o, to, from, ms, t: 0, ease, res }); }); }
function setPath(o, k, v){ const ks = k.split('.'), last = ks.pop(); ks.reduce((a, b) => a[b], o)[last] = v; }
async function walkTo(x){ const a = S.anne; a.rotation.y = x > a.position.x ? Math.PI / 2 : -Math.PI / 2; play('Walk'); await tween(a, { 'position.x': x }, Math.abs(x - a.position.x) / T.WALK * 1000, t => t); play('Idle'); }

// ── 뗏목을 틈에 놓았다
async function drop(r){ S.busy = true; audio(); const out = R.drop(S.round, r.n), room = R.SLOTS - S.round.have; S.log.push({ drop: r.n, kind: out.kind });
  const wp = new THREE.Vector3(), moved = [];
  for (let k = 0; k < r.planks.length; k++) { const p = r.planks[k]; p.getWorldPosition(wp); r.group.remove(p); scene.add(p); p.position.copy(wp); moved.push(p);
    if (k < room) { const i = S.round.have + k; S.slots[i] = p; await tween(p, { 'position.x': slotX(i), 'position.y': plankY(), 'position.z': 0, 'rotation.z': 0 }, T.PLANK_MS); tone(300 + i * 40, .09, 'triangle', .1); }
    else { await tween(p, { 'position.x': slotX(R.SLOTS - 1) + .6 + (k - room) * .3, 'position.y': T.DECK + .4, 'position.z': .2 }, T.PLANK_MS); tween(p, { 'position.y': -1.4, 'rotation.z': -1.4, 'rotation.x': .6 }, 900, t => t * t).then(() => scene.remove(p)); tone(180, .3, 'sine', .1, 0, 90); } }
  r.used = true; scene.remove(r.group);
  if (out.kind === 'short') { const edge = slotX(S.round.have + r.n - 1) + .05; await sleep(250); await walkTo(Math.max(T.START_X, edge - .1)); play('No', true); tone(240, .25, 'sine', .08); await sleep(1400); await walkTo(T.START_X);
    // 놓았던 판자가 다시 뗏목이 되어 떠오른다
    const g = new THREE.Group(); g.position.copy(r.home); scene.add(g); r.group = g; r.used = false;
    await Promise.all(moved.map((p, k) => { const i = S.round.have + k; S.slots[i] = null; return tween(p, { 'position.x': r.home.x + (k - (r.n - 1) / 2) * T.RAFT_GAP, 'position.y': r.home.y, 'position.z': r.home.z }, 520).then(() => { scene.remove(p); g.add(p); p.position.set((k - (r.n - 1) / 2) * T.RAFT_GAP, 0, 0); }); }));
    S.anne.rotation.y = Math.PI / 2; S.busy = false; return out; }
  if (out.kind === 'over' && !T.OVER_CROSS) { await sleep(900); S.busy = false; return out; }
  await sleep(300); await walkTo(T.END_X); play('Yes', true); tone(660, .12, 'triangle', .1); tone(880, .16, 'triangle', .1, .12); await sleep(1500);
  $('fade').style.opacity = 1; await sleep(480); newRound(); await sleep(80); $('fade').style.opacity = 0; await sleep(300); S.busy = false; return out; }

// ── 손으로 끌기
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), liftPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(T.DECK + .45)), hit = new THREE.Vector3();
function pointer(e){ const b = canvas.getBoundingClientRect(); ndc.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(ndc, camera); }
canvas.addEventListener('pointerdown', e => { if (S.busy || !S.ready) return; audio(); pointer(e); const live = S.rafts.filter(r => !r.used), h = ray.intersectObjects(live.flatMap(r => r.planks), false)[0];
  let r = h ? live.find(x => x.planks.includes(h.object)) : null;
  if (!r) { let best = 1e9; for (const x of live) { const q = window.__bridge.screenOf(x.group), d = Math.hypot(q.x - e.clientX, q.y - e.clientY); if (d < best) { best = d; r = x; } } if (best > T.PICK_PX) r = null; }   /* 판자 사이 틈을 눌러도 집힘 */
  if (!r) return; S.drag = { r, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); tone(520, .06, 'sine', .06); });
canvas.addEventListener('pointermove', e => { if (!S.drag || e.pointerId !== S.drag.id) return; pointer(e); if (ray.ray.intersectPlane(liftPlane, hit)) { const g = S.drag.r.group; g.position.set(hit.x, T.DECK + .45, hit.z); } });
const end = e => { if (!S.drag || e.pointerId !== S.drag.id) return; const r = S.drag.r, p = r.group.position; S.drag = null;
  if (p.x > T.DROP_X[0] && p.x < T.DROP_X[1] && Math.abs(p.z) < T.DROP_Z) drop(r); else tween(r.group, { 'position.x': r.home.x, 'position.y': r.home.y, 'position.z': r.home.z }, 420); };
canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

// ── 화면 크기 · 그리기
function resize(){ const w = innerWidth, h = innerHeight, tall = h > w; renderer.setSize(w, h, false); camera.aspect = w / h; const asp = w / h, vfov = tall ? 50 : 40, half = Math.atan(Math.tan(vfov * Math.PI / 360) * asp), dist = Math.max(10.5, (tall ? 4.7 : 5.2) / Math.tan(half));   /* 다리와 뗏목(가로 약 10)이 늘 화면 안에 */
  camera.fov = vfov; camera.position.set(2, 1 + dist * (tall ? .42 : .5), 1.4 + dist * .9); camera.lookAt(2, .7, tall ? 1.8 : 1.4); camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
let last = performance.now(); function loop(now){ requestAnimationFrame(loop); const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now; S.t += dt; const t = S.t;
  const sp = seaG.attributes.position; for (let i = 0; i < sp.count; i++) { const x = seaBase[i * 3], z = seaBase[i * 3 + 2]; sp.array[i * 3 + 1] = Math.sin(x * .45 + t * 1.2) * .05 + Math.cos(z * .5 + t * .9) * .05; } sp.needsUpdate = true;
  for (const r of S.rafts) if (!r.used && (!S.drag || S.drag.r !== r) && !S.tweens.some(w => w.o === r.group)) { r.group.position.y = r.home.y + Math.sin(t * 1.6 + r.ph) * .05; r.group.rotation.z = Math.sin(t * 1.1 + r.ph) * .03; }
  for (let i = S.tweens.length - 1; i >= 0; i--) { const w = S.tweens[i]; w.t += dt * 1000; const k = Math.min(1, w.t / w.ms), e = w.ease(k); for (const key in w.to) setPath(w.o, key, w.from[key] + (w.to[key] - w.from[key]) * e); if (k >= 1) { S.tweens.splice(i, 1); w.res(); } }
  if (S.mixer) S.mixer.update(dt); renderer.render(scene, camera); }
requestAnimationFrame(loop);
// 하네스용: 화면 좌표
window.__bridge.screenOf = obj => { const v = (obj.isVector3 ? obj.clone() : obj.getWorldPosition(new THREE.Vector3())).project(camera), b = canvas.getBoundingClientRect(); return { x: b.left + (v.x + 1) / 2 * b.width, y: b.top + (1 - v.y) / 2 * b.height }; };
window.__bridge.gap = () => new THREE.Vector3(slotX(Math.min(R.SLOTS - 1, S.round.have + 1)), T.DECK + .45, 0);
build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
