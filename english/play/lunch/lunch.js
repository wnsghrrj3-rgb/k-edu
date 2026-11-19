/* 점심 가게(3D) — 영어 놀이터 소리 공방 C01 「sh」 걸음을 긴장감 있는 한 판으로.
 * 부두의 가게. 간판에 shop 을 붙여 문을 열면 손님(동물)이 줄을 선다. 손님이 원하는 것을 찾아 누르면 대접 끝.
 *   한 판 = 세 마당: ① 듣고 찾기(손님 목소리만) ② 읽고 찾기(말풍선에 낱말만) ③ 말해서 찾기(낱말을 소리 내어 말하면 Sam 이 내놓음).
 *   긴장: 손님 머리 위 고리가 줄어든다(숫자 없음). 다 줄면 손님은 줄 맨 뒤로 갔다가 다시 온다(벌 없음).
 *         여우가 얼음 진열대의 생선을 노린다 — 누르면 도망. 늦으면 생선을 물고 가고, 배가 새 생선을 실어 올 때까지 생선 주문은 멈춘다.
 *   틀리게 누르면 그 물건만 흔들리고 손님이 한 번 더 말해 준다(고리는 그대로).
 * 낱말: 걸음 상세판 C01(handoff kedu/영어_플레이_한해길_상세_C_소리공방.md) — shop · ship · shed · shut · fish · dish · cash · wish.
 * 그림: 기성 3D 재료만 — Quaternius(CC0) · ./assets/CREDITS.md. 무대(하늘·바다·해·그림자)는 수학 놀이터의 stage3d 를 같이 쓴다.
 * 기록: 이 시안은 저장하지 않는다(증거·씨앗 연결은 본판에서). */
import { createStage, THREE, sleep } from '/math/play/common/stage3d.js?v=2';
import { clone as cloneRig } from 'three/addons/utils/SkeletonUtils.js';

// ── 내가 정한 수치(준호가 보고 바꾼다)
const T = { DECK: .45, ROW: [-.2, 1.8], X: [-8.5, 8.5], WIN: [1.0, 2.05], STAND: [1.75, 1.95], QX: [-1.35, -2.45, -3.55, -4.65], QZ: 2.3, ENTER: -8.2, EXIT: 8.4,
  WALK: 1.25, FOX_SPEED: .5, FOX_FROM: 8.2, FOX_Z: 1.05, PICK_PAD: 1.25,
  DUSK: ['#f08a5d', '#f6b98b', '#ffe0b0'] };
const WORDS = ['shop', 'ship', 'shed', 'shut', 'fish', 'dish', 'cash', 'wish'];
const LINE = { fish: 'Fish, please!', dish: 'A dish, please!', cash: 'Here is my cash!', ship: 'Look! A ship!', shed: 'Where is the shed?', shop: 'Is this the shop?', shut: 'Is the door shut?', wish: 'I have a wish!' };
const Q = new URLSearchParams(location.search);
const ROUNDS = [
  { mode: 'listen', ko: '듣고 찾아요', words: ['fish', 'dish', 'ship', 'cash', 'shed', 'wish'], pat: 19, gap: 5.5, fox: [2] },
  { mode: 'read', ko: '읽고 찾아요', words: ['dish', 'shop', 'fish', 'shut', 'wish', 'cash', 'ship'], pat: 14, gap: 3.8, fox: [1, 4] },
  { mode: 'speak', ko: '말해서 주문해요', words: ['fish', 'ship', 'dish', 'shop', 'cash'], pat: 26, gap: 6, fox: [3] }
];
if (Q.has('short')) ROUNDS.forEach(R => { R.words = R.words.slice(0, 2); R.fox = [1]; });   // 검사용 짧은 판
const MATH = 'math/play/bridge/assets/', OWN = 'english/play/lunch/assets/';   // 무대의 load 는 '/' 뒤에 붙인다
const ANIMALS = [{ n: 'ShibaInu', h: 1.05 }, { n: 'Husky', h: 1.12 }, { n: 'Alpaca', h: 1.6 }, { n: 'Deer', h: 1.5 }];
const $ = id => document.getElementById(id);

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [18, 60], shadow: { left: -9, right: 9, top: 7, bottom: -5 }, assets: '/' }), { scene, camera } = stage;
const K = {}, S = { round: -1, served: 0, queue: [], cur: null, spawned: 0, foxes: [], fox: null, fishGone: false, stars: 0, log: [], busy: true, starsBy: {}, t: 0, nextSpawn: 0, roundOn: false };
const targets = [];   // { word, obj, hit, react() }

// ── 소리
const A = () => { try { window.PlayAudio && window.PlayAudio.unlock(); } catch (_) {} };
const sfx = n => { try { window.PlayAudio && window.PlayAudio.play(n); } catch (_) {} };
let actx = null; function tone(f, d = .3, type = 'sine', v = .15, at = 0){ try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + at; o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .03); g.gain.exponentialRampToValueAtTime(.001, t0 + d); o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + d + .05); } catch (_) {} }
const horn = () => { tone(110, 1.1, 'sawtooth', .07); tone(165, 1.1, 'triangle', .08); };
let VOICE = null; function pickVoice(){ try { const vs = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang)), pref = ['Google US English', 'Samantha', 'Aria', 'Jenny', 'Ava', 'Allison', 'Karen']; VOICE = pref.map(n => vs.find(v => v.name.includes(n))).find(Boolean) || vs.find(v => /en[-_]US/i.test(v.lang)) || vs[0] || null; } catch (_) {} }
try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch (_) {}
function say(text, rate = .9, pitch = 1.05){ return new Promise(res => { let done = false; const fin = () => { if (!done) { done = true; res(); } }; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; if (VOICE) u.voice = VOICE; u.rate = rate; u.pitch = pitch; u.onend = fin; u.onerror = fin; speechSynthesis.speak(u); } catch (_) {} setTimeout(fin, 700 + text.length * 95 / rate); }); }

// ── 놓기
function fit(g, h, x, y, z, ry = 0){ const o = cloneRig(g.scene);   /* 뼈가 있는 모형(물고기)도 제자리에 */ o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o), s = h / Math.max(.0001, b.max.y - b.min.y); o.scale.multiplyScalar(s); o.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(o), c = b2.getCenter(new THREE.Vector3()); o.position.sub(new THREE.Vector3(c.x, b2.min.y, c.z)); const w = new THREE.Group(); w.add(o); w.position.set(x, y, z); w.rotation.y = ry; scene.add(stage.shadows(w)); return w; }
const rigH = rig => { rig.scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(rig.scene); return Math.max(.0001, b.max.y - b.min.y); };
function canvasPlane(w, h, px = 256){ const cv = document.createElement('canvas'); cv.width = px * w / h | 0; cv.height = px; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: .8 })); m.castShadow = true; return { m, cv, x: cv.getContext('2d'), tex }; }
function hitBox(obj, pad = T.PICK_PAD){ obj.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(obj), sz = b.getSize(new THREE.Vector3()).multiplyScalar(pad), c = b.getCenter(new THREE.Vector3());
  const m = new THREE.Mesh(new THREE.BoxGeometry(Math.max(sz.x, .5), Math.max(sz.y, .5), Math.max(sz.z, .5)), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); m.position.copy(c); scene.add(m); return m; }
const addTarget = (word, obj, react, pad) => { const t = { word, obj, react, hit: hitBox(obj, pad) }; t.hit.userData.t = t; targets.push(t); return t; };

// ── 작은 움직임
const bounce = async (o, k = 1.18) => { const s = o.scale.x; await stage.tween(o, { 'scale.x': s * k, 'scale.y': s * k, 'scale.z': s * k }, 140); await stage.tween(o, { 'scale.x': s, 'scale.y': s, 'scale.z': s }, 220); };
const wiggle = async o => { const r = o.rotation.z; for (const d of [.12, -.12, .07, 0]) await stage.tween(o, { 'rotation.z': r + d }, 70); };
const hop = async (o, h = .35) => { const y = o.position.y; await stage.tween(o, { 'position.y': y + h }, 160); await stage.tween(o, { 'position.y': y }, 200, t => t * t); };

// ── 그림판: 간판 · 소원 판
const SIGN = { slots: [], lit: false };
function drawSign(){ const { x, cv } = SIGN.p, W = cv.width, H = cv.height; x.fillStyle = '#7a4b22'; x.fillRect(0, 0, W, H); x.fillStyle = '#9c6634'; x.fillRect(10, 10, W - 20, H - 20); x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 3; for (let y = 40; y < H; y += 46) { x.beginPath(); x.moveTo(12, y); x.lineTo(W - 12, y); x.stroke(); }
  const parts = ['sh', 'o', 'p'], wx = [W * .36, W * .585, W * .74]; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `700 ${H * .62}px Andika, Nunito, sans-serif`;
  parts.forEach((p, i) => { if (SIGN.slots[i]) { x.fillStyle = SIGN.lit ? '#fff3b0' : '#fff8ea'; if (SIGN.lit) { x.shadowColor = '#ffd34d'; x.shadowBlur = 22; } x.fillText(p, wx[i], H * .54); x.shadowBlur = 0; } else { x.strokeStyle = 'rgba(255,248,234,.55)'; x.setLineDash([12, 10]); x.lineWidth = 5; const w = i === 0 ? H * .9 : H * .5; x.strokeRect(wx[i] - w / 2, H * .2, w, H * .62); x.setLineDash([]); } });
  SIGN.p.tex.needsUpdate = true; }
const WISH = { n: 0 };
function starPath(x, cx, cy, r, fill){ x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fillStyle = fill; x.fill(); }
function drawWish(){ const { x, cv } = WISH.p, W = cv.width, H = cv.height; x.fillStyle = '#5b3a1e'; x.fillRect(0, 0, W, H); x.fillStyle = '#f3e3c3'; x.fillRect(12, 12, W - 24, H - 24);
  const cols = 5, rows = 3; for (let i = 0; i < cols * rows; i++) { const cx = 12 + (W - 24) * ((i % cols) + .5) / cols, cy = 12 + (H - 24) * ((i / cols | 0) + .5) / rows; if (i < WISH.n) starPath(x, cx, cy, H * .11, i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#fbbf24' : '#f97316'); else { x.fillStyle = 'rgba(91,58,30,.18)'; x.beginPath(); x.arc(cx, cy, 5, 0, 7); x.fill(); } }
  WISH.p.tex.needsUpdate = true; }

// ── 무대 꾸리기
async function build(){
  const names = { dock: MATH + 'Environment_Dock', pole: MATH + 'Environment_Dock_Pole', ship: MATH + 'Ship_Small', henry: MATH + 'Characters_Henry', palm1: MATH + 'Environment_PalmTree_1', palm3: MATH + 'Environment_PalmTree_3', cliff: MATH + 'Environment_Cliff2', rock: MATH + 'Environment_Rock_2',
    koi: MATH + 'Fish_Koi', clown: MATH + 'Fish_Clownfish', tang: MATH + 'Fish_BlueTang', bucket: MATH + 'Prop_Bucket_Fishes', barrelP: MATH + 'Prop_Barrel',
    stand: OWN + 'MarketStand_1', stand2: OWN + 'MarketStand_2', crate: OWN + 'Crate', barrel: OWN + 'Barrel', bag: OWN + 'Bag', bags: OWN + 'Bags', house: OWN + 'House_1', door: OWN + 'Door_4', bell: OWN + 'Bell', fence: OWN + 'Fence', plate: OWN + 'Plate_1',
    tomato: OWN + 'Tomato_Harvested', carrot: OWN + 'Carrot_1', orange: OWN + 'Orange_Harvested', fox: OWN + 'Fox', ...Object.fromEntries(ANIMALS.map(a => [a.n, OWN + a.n])) };
  await Promise.all(Object.entries(names).map(async ([k, n]) => { try { K[k] = await stage.load(n); } catch (e) { K[k] = null; console.warn('모형 없음', n); } }));
  const D = T.DECK;
  // 선착장: 판자 두 줄 · 기둥
  const dk = stage.dockKit(K.dock), step = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36; let i = 0;
  for (const z of T.ROW) for (let x = T.X[0]; x <= T.X[1]; x += step, i++) { const m = new THREE.Mesh(dk.planks[i % dk.planks.length], dk.mat); m.position.set(x, D - dk.plankH / 2, z); scene.add(stage.shadows(m)); }
  for (let x = T.X[0] + .4; x <= T.X[1]; x += 2.6) for (const z of [T.ROW[0] - 1.1, T.ROW[1] + 1.15]) stage.put(K.pole, x, D - .8, z, 1, x);
  // 먼 풍경
  if (K.cliff) stage.put(K.cliff, -13, 0, -10, 1.2, .4); if (K.cliff) stage.put(K.cliff, 14, 0, -12, 1.1, 2.4);
  if (K.palm3) stage.put(K.palm3, -10.5, 1.2, -8.6, 1.0, .3); if (K.palm1) stage.put(K.palm1, 11.8, 1.2, -10.2, 1.0, 2); if (K.rock) stage.put(K.rock, 6.5, -.2, -6.5, 1.3, 1);

  // 가게(가운데): 장터 가판 + 간판
  S.stand = fit(K.stand, 2.7, T.WIN[0], D, -.35, Math.PI / 2);   // 이 꾸러미의 가판은 옆으로 서 있다 — 앞(차양)이 손님 쪽
  SIGN.p = canvasPlane(1.9, .52, 200); SIGN.p.m.position.set(T.WIN[0], D + 2.95, .32); scene.add(SIGN.p.m); drawSign();
  // 계산대 앞: 얼음 진열대(생선) · 접시 · 돈주머니
  S.ice = fit(K.crate, .62, T.WIN[0] - .85, D, .75, .1);
  const iceTop = new THREE.Mesh(new THREE.BoxGeometry(.8, .06, .6), new THREE.MeshStandardMaterial({ color: 0xdff4fb, roughness: .25, metalness: .05 })); iceTop.position.set(T.WIN[0] - .85, D + .65, .75); scene.add(stage.shadows(iceTop));
  S.fish = new THREE.Group(); S.fish.position.set(T.WIN[0] - .85, D + .68, .75); scene.add(S.fish);
  S.fishKids = []; [['koi', -.2, .05, 1.2], ['clown', .18, .08, 1.9], ['tang', 0, -.14, 1.6]].forEach(([k, x, z, ry]) => { if (!K[k]) return; const f = fit(K[k], .3, x, 0, z, ry); scene.remove(f); S.fish.add(f); S.fishKids.push(f); });
  addTarget('fish', S.fish, async () => { for (const f of S.fishKids) hop(f, .22); tone(520, .1, 'triangle', .1); await sleep(380); }, 1.9);
  S.barrel = fit(K.barrel, .62, T.WIN[0] + .2, D, .82, .3);
  S.dish = new THREE.Group(); S.dish.position.set(T.WIN[0] + .2, D + .64, .82); scene.add(S.dish);
  for (let k = 0; k < 4; k++) { const p = fit(K.plate, .04, 0, k * .045, 0, k * .7); scene.remove(p); p.scale.multiplyScalar(1); S.dish.add(p); }
  { const b = new THREE.Box3().setFromObject(S.dish), w = b.getSize(new THREE.Vector3()).x; if (w > 0 && w < .3) S.dish.scale.setScalar(.34 / w); }
  addTarget('dish', S.dish, async () => { bounce(S.dish, 1.25); [1320, 1560].forEach((f, k) => tone(f, .12, 'sine', .07, k * .08)); await sleep(380); }, 2.2);
  S.cash = fit(K.bags || K.bag, .42, T.WIN[0] + 1.05, D, .86, -.4);
  if (K.bell) S.bell = fit(K.bell, .3, T.WIN[0] + 1.6, D, .55, .3);
  addTarget('cash', S.cash, async () => { hop(S.cash, .25); [988, 1319].forEach((f, k) => tone(f, .25, 'triangle', .1, k * .1)); await sleep(400); }, 1.6);
  // 가게 안쪽 장식(글자 없음): 채소 · 바구니 통
  if (K.tomato) fit(K.tomato, .28, T.WIN[0] + .5, D + 1.0, -.35); if (K.orange) fit(K.orange, .26, T.WIN[0] - .45, D + 1.0, -.4);

  // 오른쪽: 소원 판(별이 하나씩 붙는다)
  const post = new THREE.Mesh(new THREE.BoxGeometry(.1, 1.5, .1), new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: .9 })); post.position.set(3.7, D + .75, .25); scene.add(stage.shadows(post));
  WISH.p = canvasPlane(1.25, .8, 220); WISH.g = new THREE.Group(); WISH.g.position.set(3.7, D + 1.5, .32); WISH.g.add(WISH.p.m); scene.add(WISH.g); drawWish();
  addTarget('wish', WISH.g, async () => { bounce(WISH.g, 1.12); [784, 988, 1175].forEach((f, k) => tone(f, .2, 'sine', .08, k * .07)); await sleep(400); }, 1.5);
  if (K.stand2) fit(K.stand2, 2.1, 5.6, D, -.6, -.35);

  // 왼쪽: 문(shut) · 창고(shed) · 배(ship)
  S.doorPivot = new THREE.Group(); S.doorPivot.position.set(-1.75, D, .35); scene.add(S.doorPivot);
  S.door = fit(K.door, 1.75, 0, 0, 0, 0); scene.remove(S.door); S.doorPivot.add(S.door);
  { const m = () => new THREE.Box3().setFromObject(S.door).getSize(new THREE.Vector3()); if (m().x < m().z) S.door.rotation.y = Math.PI / 2; S.door.position.x = m().x / 2; }   // 문짝이 손님 쪽을 보게, 경첩이 피벗에   // 경첩이 피벗에
  if (K.fence) { fit(K.fence, .7, -2.55, D, .35, 0); fit(K.fence, .7, -.3, D, .1, -.25); }
  addTarget('shut', S.doorPivot, async () => { await stage.tween(S.doorPivot.rotation, { y: 0 }, 220); tone(140, .18, 'square', .08); await sleep(350); if (S.doorOpen) await stage.tween(S.doorPivot.rotation, { y: -1.1 }, 420); }, 1.3);
  S.shed = fit(K.house, 2.3, -3.1, D, -.75, .25);
  addTarget('shed', S.shed, async () => { bounce(S.shed, 1.05); tone(220, .25, 'triangle', .1); tone(180, .3, 'triangle', .08, .12); await sleep(400); }, 1.0);
  S.ship = new THREE.Group(); S.ship.position.set(-6.0, 0, -2.6); scene.add(S.ship); const sh = stage.put(K.ship, 0, 0, 0, .62, Math.PI / 2.3); scene.remove(sh); S.ship.add(sh);
  addTarget('ship', S.ship, async () => { horn(); wiggle(S.ship); await sleep(600); }, 1.0);
  addTarget('shop', SIGN.p.m, async () => { SIGN.lit = true; drawSign(); bounce(SIGN.p.m, 1.1); tone(660, .15, 'triangle', .1); await sleep(450); }, 1.6);

  // Sam(가게 주인)
  S.sam = stage.person(K.henry, { scale: .62 }); S.sam.obj.position.set(T.WIN[0], D + .02, -.05); S.sam.obj.rotation.y = 0; stage.play(S.sam, 'Idle');
  stage.frame((dt, t) => { S.ship.position.y = Math.sin(t * 1.1) * .06 - .05; S.ship.rotation.z = Math.sin(t * .8) * .03; });
  stage.onResize = aim; stage.resize();
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500);
  S.busy = false; intro(); }

function aim(w, h){ const a = w / h;   /* 가로: 부두 전체 · 세로(태블릿 세워 들기): 창고~소원 판만 꽉 차게, 화각을 넓혀 */
  if (a >= 1) { const wide = Math.min(1, a / 1.5), d = 9.4 / Math.max(.5, wide); camera.fov = 34; camera.position.set(-.1, 4.3 + (1 - wide) * 2.4, d * .98); camera.lookAt(.15, 1.15, .2); }
  else { camera.fov = 50; const d = 4.3 / (Math.tan(25 * Math.PI / 180) * a); camera.position.set(.3, 3.2 + d * .32, d * .92); camera.lookAt(.3, 1.2, .4); } }

// ── 사람(동물) 걷기
const actOf = (p, base) => Object.keys(p.acts).find(k => k === base || k.endsWith('|' + base)) || null;
const play = (p, base, once) => { const n = actOf(p, base); if (n) stage.play(p, n, once); };
async function walk(p, x, z, speed = T.WALK){ const o = p.obj, dx = x - o.position.x, dz = z - o.position.z, d = Math.hypot(dx, dz); if (d < .03) return; o.rotation.y = Math.atan2(dx, dz); play(p, p.fast ? 'Gallop' : 'Walk'); await stage.tween(o.position, { x, z }, d / speed * 1000, t => t); play(p, 'Idle'); }
const faceTo = (p, x, z) => { p.obj.rotation.y = Math.atan2(x - p.obj.position.x, z - p.obj.position.z); };

// ── 손님 줄
let kindI = 0;
function spawn(word){ const a = ANIMALS[kindI++ % ANIMALS.length], rig = K[a.n]; if (!rig) return null; const p = stage.person(rig, { scale: a.h / rigH(rig) }); p.obj.position.set(T.ENTER, T.DECK + .01, T.QZ); play(p, 'Idle');
  const c = { p, word, kind: a.n, pat: 1, tries: 0, state: 'queue', id: S.spawned }; S.queue.push(c); layout(); return c; }
function layout(){ S.queue.forEach((c, k) => { const x = T.QX[Math.min(k, T.QX.length - 1)] - Math.max(0, k - T.QX.length + 1) * 1.1; if (!c.walking || c.tx !== x) { c.tx = x; c.walking = true; walk(c.p, x, T.QZ).then(() => { c.walking = false; if (S.queue[0] === c && !S.cur) toWindow(); else faceTo(c.p, x + 1, T.QZ); }); } }); }
async function toWindow(){ if (S.cur || !S.queue.length || !S.roundOn) return; const c = S.queue.shift(); S.cur = c; c.state = 'walk'; layout();
  await walk(c.p, T.STAND[0], T.STAND[1]); faceTo(c.p, T.WIN[0] - .9, -.6); /* 비스듬히 서서 계산대를 본다(얼굴이 보이게) */ c.state = 'ask'; c.pat = 1; c.tries = 0; await ask(c); }

// ── 말풍선
const ICON = { ear: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  mic: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  hand: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11.5v-2a1.5 1.5 0 0 1 3 0V12M14 10.5a1.5 1.5 0 0 1 3 0V12M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.3 15a1.5 1.5 0 0 1 2.4-1.8L8 15"/></svg>' };
const sh = w => w.replace('sh', '<u>sh</u>');
function bubble(c){ const m = ROUNDS[S.round].mode, el = $('bubIn');
  if (m === 'listen') el.innerHTML = `<button id="bAgain" aria-label="다시 듣기">${ICON.ear}</button>`;
  else if (m === 'read' || c.assist) el.innerHTML = `<b>${sh(c.word)}</b>`;
  else el.innerHTML = `<b>${sh(c.word)}</b><div class="row"><button id="bMic" aria-label="말하기">${ICON.mic}</button></div>`;
  const again = $('bAgain'); if (again) again.onpointerdown = e => { e.stopPropagation(); A(); voice(c, .75); };
  const mic = $('bMic'); if (mic) mic.onpointerdown = e => { e.stopPropagation(); A(); listen(c); };
  $('bub').classList.add('on'); }
const unbubble = () => $('bub').classList.remove('on');
function voice(c, rate = .88){ const W = c.word[0].toUpperCase() + c.word.slice(1); return say(`${W}. ${LINE[c.word]}`, rate, c.kind === 'Alpaca' ? .85 : 1.15); }
async function ask(c){ bubble(c); sfx('enter'); const m = ROUNDS[S.round].mode; c.paused = true; if (m === 'listen') await voice(c); else await sleep(250); c.paused = false; }

// ── 말하기 마당: 들으면 Sam 이 내놓는다. 두 번 안 되면 본보기를 들려주고 눌러서도 되게(도움 받음)
async function listen(c){ if (c.listening || S.cur !== c) return; const P = window.PlaySpeech; if (!P || !P.available()) { c.assist = true; bubble(c); return; }
  c.listening = true; c.paused = true; const mic = $('bMic'); if (mic) mic.classList.add('hot');
  const r = await P.tryOnce(c.word, { others: WORDS.filter(w => w !== c.word), timeout: 5000 }); c.listening = false; c.paused = false; if (S.cur !== c) return;
  const m2 = $('bMic'); if (m2) m2.classList.remove('hot');
  if (r.ok) { S.log.push({ say: c.word, ok: 1, tries: c.tries + 1 }); const t = targets.find(t => t.word === c.word); await say(c.word[0].toUpperCase() + c.word.slice(1) + '!', .9, .95); stage.play(S.sam, 'Yes', true); return serve(c, t, true); }
  c.tries++; S.log.push({ say: c.word, ok: 0, heard: r.heard || r.error || '' }); $('bub').classList.add('shake'); setTimeout(() => $('bub').classList.remove('shake'), 400); sfx('soft');
  c.paused = true; await say(c.word, .6, 1.05); c.paused = false;
  if (c.tries >= 2 || (r.error && /not-allowed|unavailable|audio-capture|service/.test(r.error))) { c.assist = true; bubble(c); banner('눌러서 줘도 돼요', 1600); } }

// ── 누르기
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
$('c').addEventListener('pointerdown', e => { A(); if (S.busy) return; const b = $('c').getBoundingClientRect(); ndc.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(ndc, camera);
  if (S.fox && !S.fox.fled) { const fh = ray.intersectObject(S.fox.hit, false); if (fh.length) return shoo(); }
  const hits = ray.intersectObjects(targets.map(t => t.hit), false); if (!hits.length) return; tap(hits[0].object.userData.t); });
async function tap(t){ const c = S.cur;
  if (!c || c.state !== 'ask' || !S.roundOn) { t.react(); return; }
  const m = ROUNDS[S.round].mode; if (m === 'speak' && !c.assist) { t.react(); return; }   // 말하기 마당은 말로 — 눌러 보는 건 물건만 움직인다
  if (t.word === 'fish' && S.fishGone) { wiggle(S.ice); sfx('soft'); return; }
  if (t.word === c.word) return serve(c, t, false);
  c.miss = (c.miss || 0) + 1; S.log.push({ want: c.word, tap: t.word }); wiggle(t.obj); sfx('soft'); $('bub').classList.add('shake'); setTimeout(() => $('bub').classList.remove('shake'), 400);
  if (m === 'listen') { c.paused = true; await voice(c, .7); c.paused = false; } }
async function serve(c, t, spoke){ c.state = 'done'; unbubble(); sfx('ok'); if (t) await t.react(); say(c.word, .9, 1.0); play(c.p, 'Eating'); if (c.kind === 'ShibaInu' || c.kind === 'Husky') play(c.p, 'Jump_ToIdle', true);
  flyStar(c); S.served++; S.log.push({ served: c.word, mode: ROUNDS[S.round].mode, miss: c.miss || 0, spoke: !!spoke, assist: !!c.assist }); (S.starsBy[c.word] = (S.starsBy[c.word] || 0) + 1);
  await sleep(900); S.cur = null; c.p.fast = false; walk(c.p, T.EXIT, T.QZ + .4).then(() => stage.unperson(c.p));
  const R = ROUNDS[S.round]; if (R.fox.includes(S.served - S.roundBase)) foxIn();
  if (S.served - S.roundBase >= R.words.length) return endRound();
  toWindow(); }
async function giveUp(c){ c.state = 'leave'; unbubble(); sfx('soft'); play(c.p, 'Idle_HitReact_Left', true); S.log.push({ late: c.word }); await sleep(600); S.cur = null; c.pat = 1; c.miss = 0; c.state = 'queue'; c.p.fast = true; S.queue.push(c); layout(); setTimeout(() => { c.p.fast = false; }, 2500); toWindow(); }

// ── 별: 대접하면 손님 말풍선 자리에서 소원 판으로 날아가 붙는다(숫자 없음)
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill="#fbbf24" stroke="#b45309" stroke-width="1.2" stroke-linejoin="round"/></svg>';
function flyStar(c){ const from = stage.screenOf(new THREE.Vector3(c.p.obj.position.x, T.DECK + 1.6, c.p.obj.position.z)), to = stage.screenOf(WISH.g), el = document.createElement('div'); el.className = 'star'; el.innerHTML = STAR; el.style.left = from.x + 'px'; el.style.top = from.y + 'px'; document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = `translate(${to.x - from.x}px,${to.y - from.y}px) scale(.7)`; }));
  setTimeout(() => { el.remove(); WISH.n = Math.min(15, WISH.n + 1); drawWish(); bounce(WISH.g, 1.08); tone(1175, .18, 'sine', .08); }, 720); }

// ── 여우(생선 도둑)
function foxIn(){ if (!K.fox || S.fox || S.fishGone) return; const p = stage.person(K.fox, { scale: .85 / rigH(K.fox) }); p.obj.position.set(T.FOX_FROM, T.DECK + .01, T.FOX_Z); const hit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 1.0), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); scene.add(hit);
  S.fox = { p, hit, fled: false }; faceTo(p, 0, T.FOX_Z); play(p, 'Walk'); S.log.push({ fox: 'in' }); tone(330, .12, 'triangle', .08); tone(294, .16, 'triangle', .08, .14);
  const tx = S.ice.position.x + .55; stage.tween(p.obj.position, { x: tx }, (T.FOX_FROM - tx) / T.FOX_SPEED * 1000, t => t).then(() => { if (S.fox && S.fox.p === p && !S.fox.fled) steal(); }); }
async function shoo(){ const f = S.fox; if (!f || f.fled) return; f.fled = true; S.log.push({ fox: 'shoo' }); stage.tweens.splice(0, stage.tweens.length, ...stage.tweens.filter(w => w.o !== f.p.obj.position));
  say('Shoo! Shoo!', 1.0, 1.0); stage.play(S.sam, 'Wave', true); play(f.p, 'Gallop'); faceTo(f.p, 20, T.FOX_Z); sfx('pop');
  await stage.tween(f.p.obj.position, { x: T.FOX_FROM + 3 }, 1400, t => t); stage.unperson(f.p); scene.remove(f.hit); S.fox = null; }
async function steal(){ const f = S.fox; f.fled = true; S.fishGone = true; S.log.push({ fox: 'stole' }); play(f.p, 'Eating'); await sleep(500); S.fish.visible = false; tone(196, .3, 'sine', .1); stage.play(S.sam, 'No', true); say('Oh no! My fish!', .95, .95);
  play(f.p, 'Gallop'); faceTo(f.p, 20, T.FOX_Z); await stage.tween(f.p.obj.position, { x: T.FOX_FROM + 3 }, 1600, t => t); stage.unperson(f.p); scene.remove(f.hit); S.fox = null;
  // 배가 새 생선을 싣고 온다
  await sleep(1200); horn(); banner('배가 생선을 싣고 와요', 1500); await stage.tween(S.ship.position, { x: -3.6, z: -2.3 }, 1800); await sleep(500); S.fish.visible = true; S.fishGone = false; bounce(S.fish, 1.3); sfx('tray'); await stage.tween(S.ship.position, { x: -6.0, z: -2.6 }, 2200); }

// ── 마당 흐름
function banner(t, ms = 1800){ const b = $('banner'); b.textContent = t; b.classList.add('on'); clearTimeout(banner.h); banner.h = setTimeout(() => b.classList.remove('on'), ms); }
function dots(){ [...$('dots').children].forEach((d, k) => { d.className = k < S.round ? 'done' : k === S.round ? 'on' : ''; }); }
async function startRound(r){ S.round = r; S.roundBase = S.served; S.spawned = 0; S.roundOn = true; dots(); const R = ROUNDS[r]; banner(R.ko, 2000); await sleep(600); S.nextSpawn = 0; }
async function endRound(){ S.roundOn = false; sfx('done'); stage.play(S.sam, 'Yes', true); await sleep(1400);
  if (S.round + 1 < ROUNDS.length) { if (S.round === 0) await say('Good job! Now, read!', .95, .95); if (S.round === 1) await say('Great! Now, you say it!', .95, .95); startRound(S.round + 1); } else finish(); }
async function finish(){ S.round = 3; dots(); $('banner').classList.remove('on'); clearTimeout(banner.h); stage.paintSky(T.DUSK); stage.sun.intensity = 1.5; stage.play(S.sam, 'Wave'); await say('Thank you! See you!', .9, .95);
  $('endStars').innerHTML = Array.from({ length: S.served }, () => STAR).join(''); $('endWords').innerHTML = WORDS.filter(w => S.starsBy[w]).map(sh).join(' · '); $('end').hidden = false; S.log.push({ end: S.served }); }
stage.frame((dt) => { if (!S.roundOn) return; const R = ROUNDS[S.round];
  S.nextSpawn -= dt; if (S.spawned < R.words.length && S.nextSpawn <= 0 && S.queue.length < 4) { spawn(R.words[S.spawned++]); S.nextSpawn = R.gap * (1 - .35 * S.spawned / R.words.length); }
  const c = S.cur; if (c && c.state === 'ask') { const hold = c.paused || (c.word === 'fish' && S.fishGone); if (!hold) c.pat -= dt / R.pat; const k = Math.max(0, c.pat), arc = $('ringArc'); arc.setAttribute('stroke-dashoffset', String(339.3 * (1 - k))); arc.setAttribute('stroke', k > .5 ? '#3c9a6e' : k > .25 ? '#e0a020' : '#e0503a');
    const s = stage.screenOf(new THREE.Vector3(c.p.obj.position.x, T.DECK + 1.15 + (c.kind === 'Alpaca' || c.kind === 'Deer' ? .45 : 0), c.p.obj.position.z)), bub = $('bub'); bub.style.left = s.x + 'px'; bub.style.top = s.y + 'px'; if (c.pat <= 0) giveUp(c); }
  if (S.fox && !S.fox.fled) S.fox.hit.position.set(S.fox.p.obj.position.x, T.DECK + .45, S.fox.p.obj.position.z); });

// ── 시작: 간판에 shop 을 붙이면 문이 열린다(sh 는 밧줄로 묶인 한 덩이)
async function intro(){ S.doorOpen = false; S.doorPivot.rotation.y = 0; await sleep(500); stage.play(S.sam, 'Wave', true);
  const tiles = $('tiles'), parts = ['sh', 'o', 'p']; let next = 0; tiles.innerHTML = ''; tiles.hidden = false;
  const order = Q.has('fixed') ? parts : parts.slice().sort(() => Math.random() - .5);
  for (const p of order) { const d = document.createElement('div'); d.className = 'tile' + (p === 'sh' ? ' pair' : ''); d.innerHTML = p === 'sh' ? '<span>s</span><span>h</span>' : p; d.dataset.p = p; tiles.appendChild(d); drag(d); }
  banner('간판을 채워요', 2200); say('Oh! The shop is shut!', .9, .95);
  function drag(d){ let sx = 0, sy = 0, on = false; d.addEventListener('pointerdown', e => { A(); e.preventDefault(); e.stopPropagation(); on = true; sx = e.clientX; sy = e.clientY; d.classList.add('drag'); try { d.setPointerCapture(e.pointerId); } catch (_) {} });
    d.addEventListener('pointermove', e => { if (!on) return; d.style.transform = `translate(${e.clientX - sx}px,${e.clientY - sy}px)`; });
    const up = e => { if (!on) return; on = false; d.classList.remove('drag'); const moved = Math.hypot(e.clientX - sx, e.clientY - sy), sign = stage.screenOf(SIGN.p.m), near = Math.hypot(e.clientX - sign.x, e.clientY - sign.y) < Math.max(160, innerWidth * .2);
      d.style.transform = ''; if (moved > 20 && !near) return; place(d); };
    d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up); }
  async function place(d){ const p = d.dataset.p; if (p !== parts[next]) { d.classList.add('bad'); sfx('soft'); setTimeout(() => d.classList.remove('bad'), 400); S.log.push({ sign: 'wrong', p }); return; }
    SIGN.slots[next++] = true; d.remove(); drawSign(); bounce(SIGN.p.m, 1.06); sfx('pop'); if (p === 'sh') say('shh', .8, 1.0);
    if (next === parts.length) { tiles.hidden = true; SIGN.lit = true; drawSign(); sfx('done'); await say('shop!', .85, 1.0); await stage.tween(S.doorPivot.rotation, { y: -1.1 }, 700); S.doorOpen = true; stage.play(S.sam, 'Yes', true); await say('This is my shop!', .9, .95); S.log.push({ sign: 'done' }); startRound(0); } } }

$('again').onclick = () => location.reload();
window.__lunch = { S, K, THREE, scene, stage, ROUNDS, targets, tap: w => tap(targets.find(t => t.word === w)), say, listen: () => S.cur && listen(S.cur), shoo };   // 검사·시연용
build().catch(e => { console.error(e); $('loading').textContent = '불러오지 못했어요 — 새로고침해 주세요'; });
