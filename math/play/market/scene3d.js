/* 항구 장터 3D 무대(N05) — 가게 규칙·화면은 ../shop/shop.js 그대로(같은 지갑 가게 칸), 이 파일은 그 위에 3D 를 입힌다.
 * 선착장 장터 · 줄 선 손님(앤·헨리, 빛깔만 옅게) · 계산대(통을 줄지어) · 물건 더미(누르면 담김) · 계산대 위 바구니(누르면 뺌) · 굴러가는 물건(잡으면 그만, 놓쳐도 벌 없음).
 * 손님의 말풍선(주문 팻말)은 shop.js 의 .guest 를 사람 머리 위로 옮겨 쓴다. 물체는 모두 기성 재료(Quaternius Pirate Kit, CC0) — ../bridge/assets/ 를 같이 씀.
 * 물건 모습: 장작 = UI_Wood · 돌 = Environment_Rock_5 · 통 = Prop_Barrel · 물고기 통 = Prop_Bucket_Fishes(음식 꾸러미를 받으면 GOODS 표만 바꾼다). 빵집 물건은 모형이 없어 아래 칸(나무 상자 줄)에서만 담는다. */
import { createStage, THREE, sleep, CALM } from '../common/stage3d.js?v=2';
import { toast, tone, audio } from '../common/kit.js?v=8';
import * as M5 from './rules.js?v=3';
import * as H from '../common/hint.js?v=4';   /* 첫 판 한 줄 안내 · 손 그림 */

// ── 내가 정한 수치
const M = {
  FLOOR: .41,                       // 선착장 판자 윗면
  LINE_Z: -.7, SLOT: 1.55, EDGE: 3.5,          // 손님이 서는 줄(가운데부터 양옆으로)
  COUNTER_Z: 1.75, TOP: .83, BARREL: .62,       // 계산대(통 줄) · 윗면
  ROLL_MS: 3200,                    // 굴러가는 물건이 굴러 떨어지기까지(몇 초마다는 ./rules.js N5.ROLL)
  EDGE_Z: -2.5,                     // 선착장 뒤 끝(굴러간 물건이 바다에 빠지는 곳)
  WAIT_STOMP: .3,                   // 이보다 덜 남으면 손님이 발을 구른다(고개 젓기)
  FIT: 4.3,                         // 화면 폭에 늘 들어올 양끝(물고기 통 더미 바깥)
};
const GOODS = { apple: { m: 'UI_Wood', s: .62, h: .3 }, orange: { m: 'Environment_Rock_5', s: .48, h: .29 }, banana: { m: 'Prop_Barrel', s: .42, h: .28 }, grape: { m: 'Prop_Bucket_Fishes', s: .4, h: .27 } };
const PILE_X = { apple: -2.8, orange: -3.55, banana: 2.8, grape: 3.55, box: -2.8 }, PILE_DZ = { box: -.75 };   // 열 개들이 더미는 낱개 더미 바로 뒤
const TINTS = ['#ff8a8a', '#8ad0ff', '#ffd27a', '#9be39b', '#c9a2ff', '#ffb0d8', '#8ff0e0'];
const $ = id => document.getElementById(id);

const stage = createStage({ canvas: $('c'), seaW: 160, fog: [18, 60], shadow: { left: -9, right: 9, top: 6, bottom: -4 }, assets: '../bridge/assets/' });
const { scene, camera, put, tween, person, unperson, play, go, screenOf, pointerRay } = stage;
const NAMES = ['Environment_Dock', 'Characters_Anne', 'Characters_Henry', 'Prop_Barrel', 'Prop_Bucket_Fishes', 'UI_Wood', 'Environment_Rock_5', 'Environment_Cliff2', 'Environment_Cliff4', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_4', 'Ship_Small', 'Environment_Dock_Pole'];
const K = {};
await Promise.all(NAMES.map(async n => { try { K[n] = await stage.load(n); } catch (_) { K[n] = null; } }));
const shop = await new Promise(res => { const t = setInterval(() => { if (window.__shop) { clearInterval(t); res(window.__shop); } }, 30); });
const S = shop.S;
const N5 = () => shop.SAVE.n5 || (shop.SAVE.n5 = M5.fresh());   /* 장터 걸음 칸(없으면 새로) */

// ── 카메라(전화기 세로는 더 물러나 넓게, 아래 판에 가리지 않게 장면을 위로)
/* 카메라: 계산대·더미 양끝(±M.FIT)이 늘 화면 폭에 들어오는 거리로 서고, 계산대 앞 끝이 아래 판 바로 위에 오도록 그림을 위아래로 옮긴다(아래 판 높이가 바뀌면 다시) */
let aimKey = '';
function aim(w = innerWidth, h = innerHeight){ const tall = h > w, asp = w / h; camera.fov = tall ? 50 : 40; camera.aspect = asp; camera.clearViewOffset();
  const half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * asp), dist = Math.max(8.4, M.FIT / Math.tan(half));
  camera.position.set(0, dist * (tall ? .82 : .42), M.COUNTER_Z + dist * (tall ? .62 : .9));   /* 세로 화면은 더 내려다봐서 줄·계산대 사이가 위아래로 벌어지게 */ camera.lookAt(0, 0, -.8); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const panel = document.querySelector('.inside'), top = panel ? panel.getBoundingClientRect().top : h * .7, p = new THREE.Vector3(0, M.TOP, M.COUNTER_Z + .5).project(camera), dy = (top - h * .04) - (1 - p.y) / 2 * h;
  camera.setViewOffset(w, h, 0, -dy, w, h); camera.updateProjectionMatrix(); aimKey = w + 'x' + h + ':' + Math.round(top); }
stage.onResize = aim; stage.resize();
stage.sun.position.set(-5, 10, 7); stage.sun.target.position.set(0, 0, 0);

// ── 장터 바닥·뒤 풍경
const add = (k, x, y, z, s = 1, ry = 0) => K[k] ? put(K[k], x, y, z, s, ry) : null;
// 바닥은 선착장 모형의 판자 조각만 이어 깐다(모형째 놓으면 귀퉁이 기둥이 장터 한가운데 솟는다 — 다리 길과 같은 방법)
const dk = K.Environment_Dock ? stage.dockKit(K.Environment_Dock) : null;
if (dk) { const step = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36; let i = 0; for (let x = -10.5; x <= 10.5; x += step, i++) for (const z of [-1.1, 1.55]) { const m = new THREE.Mesh(dk.planks[(i + (z > 0 ? 3 : 0)) % dk.planks.length], dk.mat); m.position.set(x, M.FLOOR - dk.plankH / 2, z); m.rotation.y = (i % 3 - 1) * .015; scene.add(stage.shadows(m)); } }
for (let x = -9; x <= 9.1; x += 3) for (const z of [-2.55, 2.95]) add('Environment_Dock_Pole', x, M.FLOOR - .75, z, 1, x);
add('Environment_Cliff2', -12, -.3, -10, 1.1, .4); add('Environment_Cliff4', 13, -.3, -11, 1.0, -.5);
add('Environment_PalmTree_3', -8.4, 0, -6.5, 1.1, .6); add('Environment_PalmTree_1', 9.4, 0, -7, 1.0, 2.2); add('Environment_Rock_1', -6.5, -.2, -4.6, 1.2); add('Environment_Rock_4', 7.2, -.2, -4.8, 1.1, 1);
const ship = add('Ship_Small', 6.5, 0, -12.5, 1.1, -1.2);
// 계산대: 통 셋을 다리로, 위에 판자를 가로로 깐다(물건 「통」과 헷갈리지 않게 판자 탁자로)
const counter = []; for (const x of [-1.25, 0, 1.25]) counter.push(add('Prop_Barrel', x, M.FLOOR, M.COUNTER_Z, M.BARREL, x * 2));
if (dk) { const w = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36; for (const xc of [-1.05, 1.05]) for (let r = 0; r < 3; r++) { const m = new THREE.Mesh(dk.planks[(r + (xc > 0 ? 2 : 0)) % dk.planks.length], dk.mat); m.rotation.y = Math.PI / 2; m.position.set(xc, M.FLOOR + .41 + dk.plankH / 2, M.COUNTER_Z + (r - 1) * w); scene.add(stage.shadows(m)); } M.TOP = M.FLOOR + .41 + dk.plankH; }

// ── 물건 더미(누르면 하나 · 상자 더미는 열 개)
const pick = [];               // 누를 수 있는 것들(raycast)
const tag = (o, act) => { o.traverse(m => { m.userData.act = act; }); pick.push(o); return o; };
function good(k, s = 1){ const g = GOODS[k]; if (!g || !K[g.m]) return null; const o = K[g.m].scene.clone(); o.scale.setScalar(g.s * s); stage.shadows(o); return o; }
const piles = {};
function pileShape(n){ const at = [], rows = [4, 3, 2, 1]; let i = 0; for (let r = 0; r < rows.length && i < n; r++) for (let c = 0; c < rows[r] && i < n; c++, i++) at.push([(c - (rows[r] - 1) / 2) * .36, r * .26, (r % 2) * .05]); return at; }
function pile(k, box){ const key = box ? 'box' : k, old = piles[key]; if (old) { scene.remove(old.g); pick.splice(pick.indexOf(old.g), 1); }
  const g = new THREE.Group(), n = box ? 10 : 6; g.position.set(PILE_X[key], M.FLOOR, M.COUNTER_Z + .1 + (PILE_DZ[key] || 0)); scene.add(g);
  if (box) for (let i = 0; i < 10; i++) { const o = good(k, .62); if (o) { o.position.set(((i % 5) - 2) * .25, (i < 5 ? 0 : .2), i < 5 ? .12 : -.08); g.add(o); } }
  else for (const [x, y, z] of pileShape(n)) { const o = good(k); if (o) { o.position.set(x, y, z); o.rotation.y = Math.random() * 6; g.add(o); } }
  piles[key] = { g, k, box }; tag(g, { t: box ? 'box' : 'pile', k }); return g; }
function piles3(){ const o = shop.SAVE.owned, list = shop.goodsM().filter(k => GOODS[k] && (k !== 'grape' || shop.L.fish() > 0))   /* 생선이 없으면 물고기 통 더미도 없음 */, want = new Set(list.map(k => k)); const box = (o.box && GOODS[shop.R.STOCK[S.shop]]) ? shop.R.STOCK[S.shop] : null;
  for (const key of Object.keys(piles)) if ((key === 'box' ? !box || piles.box.k !== box : !want.has(key))) { scene.remove(piles[key].g); pick.splice(pick.indexOf(piles[key].g), 1); delete piles[key]; }
  for (const k of list) if (!piles[k]) pile(k); if (box && !piles.box) pile(box, true); }

// ── 계산대 위 바구니(S.basket 을 그대로 비춘다)
const basket = new THREE.Group(); scene.add(basket); let bKey = '';
const capOf = () => S.shop === 'bakery' ? shop.R.TUNE.BASKET_BIG : shop.R.basketCap(shop.SAVE.owned);
/* 바구니 칸 = 계산대 위 줄(한 줄에 열 칸 — 다섯씩 조금 띄움, 뒷줄부터). 열 개들이 상자는 다섯 칸 */
const SW = .4, ROW = 10, slotPos = i => { const r = Math.floor(i / ROW), c = i % ROW; return new THREE.Vector3(-2.05 + SW * (c + .5) + (c >= 5 ? .1 : 0), M.TOP + .02, M.COUNTER_Z - .34 + r * .34); };
/* 바구니 칸: 계산대 위 빈 칸을 점선 동그라미로(화면 위 표시) — 몇 칸 남았는지 보이게 */
const dots = document.createElement('div'); dots.id = 'slots'; document.body.appendChild(dots);
function drawSlots(){ const cap = capOf(), used = S.basket.reduce((a, b) => a + (b.n === 10 ? 5 : 1), 0), show = !S.payG && S.q.length > 0; while (dots.children.length < cap) dots.appendChild(document.createElement('i')); while (dots.children.length > cap) dots.lastChild.remove();
  [...dots.children].forEach((d, i) => { if (!show || i < used) { d.style.display = 'none'; return; } const v = slotPos(i), p = screenOf(v), q = screenOf(v.setX(v.x + SW)), w = Math.max(8, Math.min(24, (q.x - p.x) * .62)); d.style.display = 'block'; d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; d.style.width = d.style.height = w + 'px'; d.style.margin = -w / 2 + 'px 0 0 ' + -w / 2 + 'px'; d.style.borderWidth = (w < 14 ? 2 : 3) + 'px'; }); }
function drawBasket(){ const key = S.basket.map(b => b.k + b.n).join(',') + '|' + capOf(); if (key === bKey) return; bKey = key; pick.splice(0, pick.length, ...pick.filter(o => o.parent !== basket)); basket.clear();
  let at = 0; S.basket.forEach((b, i) => { const g = new THREE.Group(), n = b.n === 10 ? 5 : 1;
    if (b.n === 10) for (let j = 0; j < 10; j++) { const o = good(b.k, .62); if (o) { o.position.set(((j % 5) - 2) * .25, j < 5 ? 0 : .2, j < 5 ? .1 : -.1); g.add(o); } }
    else { const o = good(b.k, .9); if (o) g.add(o); }
    const c = new THREE.Vector3(); for (let j = 0; j < n; j++) c.add(slotPos(at + j)); g.position.copy(c.divideScalar(n)); g.scale.setScalar(.2); basket.add(g); tween(g, { 'scale.x': 1, 'scale.y': 1, 'scale.z': 1 }, 220); at += n; tag(g, { t: 'basket', i }); }); }

// ── 손님
const crowd = new Map();        // g.id → { g, p, slot, gone }
const hash = s => [...String(s)].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7);
/* 줄이 길어지면(장날) 간격을 좁혀 모두 화면 안에 — 바깥 끝은 ±M.EDGE 까지 */
let gapNow = M.SLOT; const gapFor = n => n <= 5 ? M.SLOT : Math.min(M.SLOT, M.EDGE / Math.ceil((n - 1) / 2));
function slotX(i){ return i === 0 ? 0 : (i % 2 ? -1 : 1) * Math.ceil(i / 2) * gapNow; }
function freeSlot(){ const used = new Set([...crowd.values()].filter(c => !c.gone).map(c => c.slot)); for (let i = 0; ; i++) if (!used.has(i)) return i; }
async function arrive(g){ const rig = K[hash(g.face) % 2 ? 'Characters_Henry' : 'Characters_Anne']; if (!rig) return; const p = person(rig, { tint: TINTS[Math.abs(hash(g.face)) % TINTS.length], scale: .62 }), slot = freeSlot(), c = { g, p, slot, gone: false, mood: '' };
  p.obj.position.set(11, M.FLOOR, M.LINE_Z); crowd.set(g.id, c); tag(p.obj, { t: 'guest', id: g.id });
  if (g.surprise && K.Prop_Barrel) { const b = K.Prop_Barrel.scene.clone(); b.scale.setScalar(.9); b.position.set(0, 1.85, .1); p.obj.add(stage.shadows(b)); c.carry = b; }
  c.walk = true; await go(p, slotX(slot), CALM ? 6 : g.kind === 'hurry' ? 5.2 : 3.4, true); c.walk = false; if (!c.gone) { p.obj.rotation.y = 0; play(p, 'Idle'); } }
/** 간격이 바뀌면 서 있던 손님이 제자리로 몇 걸음 옮긴다. */
async function shuffle(c){ c.walk = true; await go(c.p, slotX(c.slot), 2.4, false); c.walk = false; if (!c.gone) { c.p.obj.rotation.y = 0; play(c.p, c.mood === 'stomp' ? 'No' : 'Idle'); } }
async function depart(c, happy){ c.gone = true; const p = c.p; if (c.carry) { tween(c.carry.position, { y: 3.4 }, 500); setTimeout(() => c.carry && (c.carry.visible = false), 520); }
  if (happy) { play(p, 'Yes', true); await sleep(800); } else { play(p, 'No', true); await sleep(700); }
  await go(p, happy ? -11.5 : 11.5, 3.6, false); unperson(p); pick.splice(pick.indexOf(p.obj), 1); crowd.delete(c.g.id); }
function sync(){ const live = new Set(S.q.map(g => g.id)), here = [...crowd.values()].filter(c => !c.gone), top = Math.max(S.q.length, ...here.map(c => c.slot + 1)); gapNow = gapFor(top);
  for (const c of here) if (!c.walk && Math.abs(c.p.obj.position.x - slotX(c.slot)) > .05) shuffle(c);
  for (const g of S.q) if (!crowd.has(g.id)) arrive(g);
  for (const c of crowd.values()) { const g = c.g, e = g.el;
    if (!c.gone && (!live.has(g.id) || g.leaving)) { depart(c, e.classList.contains('happy')); continue; }
    if (c.gone) { e.style.opacity = 0; continue; }
    const mood = e.classList.contains('happy') ? 'happy' : e.classList.contains('sad') ? 'sad' : (g.wait < M.WAIT_STOMP || g.kind === 'hurry') && S.payG !== g && !S.asking ? 'stomp' : '';   /* 급한 손님은 처음부터 발을 구른다 */
    if (mood !== c.mood) { c.mood = mood; const moving = c.p.act === c.p.acts.Run || c.p.act === c.p.acts.Walk; if (!moving) { if (mood === 'happy') play(c.p, 'Yes', true); else if (mood === 'sad') { play(c.p, 'No', true); setTimeout(() => { if (c.mood === 'sad' && !c.gone) play(c.p, 'Idle'); }, 900); } else if (mood === 'stomp') play(c.p, 'No'); else play(c.p, 'Idle'); } } }
  // 말풍선을 머리 위로
  for (const c of crowd.values()) { if (c.gone) continue; const s = screenOf(new THREE.Vector3(c.p.obj.position.x, M.FLOOR + 1.25 + (c.carry ? .7 : 0), c.p.obj.position.z)); const e = c.g.el; e.style.left = s.x + 'px'; e.style.top = s.y + 'px'; e.style.zIndex = S.sel === c.g ? 3 : 2; } }

// ── 굴러가는 물건: 가끔 더미 하나가 굴러간다 — 누르면 잡고(제자리), 놓치면 바다에 퐁(아무것도 잃지 않음)
let rollIn = Infinity, roll = null;   /* 처음엔 받은 손님 수로 정한 때(M5.rollDue), 본 뒤로는 M5.rollGap() 마다 */
function startRoll(){ const ks = Object.keys(piles).filter(k => k !== 'box'); if (!ks.length) return; const P = piles[ks[Math.floor(Math.random() * ks.length)]], src = P.g.children[P.g.children.length - 1]; if (!src) return;
  const o = good(P.k), from = new THREE.Vector3(); src.getWorldPosition(from); src.visible = false; o.position.copy(from); scene.add(o); const dir = from.x < 0 ? 1 : -1;
  roll = { o, src, k: P.k, t: 0, dir, x0: from.x }; tag(o, { t: 'roll' }); o.position.y = M.FLOOR + .15; tone(330, .2, 'triangle', .06, 0, 220); S.log.push({ roll: 'start' }); }
function endRoll(caught){ const r = roll; if (!r) return; roll = null; pick.splice(pick.indexOf(r.o), 1); S.log.push({ roll: caught ? 'caught' : 'miss' });
  if (caught) { audio(); tone(780, .1, 'square', .06); tone(1170, .14, 'square', .06, .08); toast('잡았다!', 900); const g = S.sel, want = g && !g.leaving && !S.payG ? (g.order[r.k] || 0) - shop.count(r.k) : 0; if (want > 0) shop.put(r.k, 1);   /* 지금 손님이 그 물건을 더 원하면 바구니로, 아니면 더미로 돌아감(주문을 흐트러뜨리지 않게) */ tween(r.o.position, { y: r.o.position.y + .8 }, 220).then(() => { scene.remove(r.o); r.src.visible = true; }); }
  else { tween(r.o.position, { y: -1.2, z: r.o.position.z - .7 }, 600, t => t * t).then(() => { scene.remove(r.o); setTimeout(() => r.src.visible = true, 1500); }); tone(200, .3, 'sine', .06, 0, 90); } }   /* 선착장 뒤 끝에서 바다로 퐁 */

// ── 누르기
$('c').addEventListener('pointerdown', e => { if (roll) { const q = screenOf(roll.o); if (Math.hypot(q.x - e.clientX, q.y - e.clientY) < 75) { e.preventDefault(); endRoll(true); return; } }   /* 굴러가는 물건 근처를 누르면 그것부터 잡힌다(뒤의 손님·계산대에 가리지 않게) */
  const hit = pointerRay(e).intersectObjects(pick, true)[0]; if (!hit) return; const a = hit.object.userData.act; if (!a) return; e.preventDefault(); audio();
  if (a.t === 'pile') { shop.put(a.k, 1); bump(piles[a.k]); }
  else if (a.t === 'box') { shop.put(a.k, 10); bump(piles.box); }
  else if (a.t === 'basket') shop.unput(a.i);
  else if (a.t === 'guest') { const g = S.q.find(x => x.id === a.id); if (g) shop.select(g); }
  else if (a.t === 'roll') endRoll(true); });
function bump(P){ if (!P) return; const g = P.g; tween(g.scale, { y: .9 }, 70).then(() => tween(g.scale, { y: 1 }, 120)); }

// ── 매 장면
let t0 = 0;
let aimT = 0;
stage.frame((dt, t) => { if ((aimT += dt) > .4) { aimT = 0; const pn = document.querySelector('.inside'), k = innerWidth + 'x' + innerHeight + ':' + Math.round(pn ? pn.getBoundingClientRect().top : 0); if (k !== aimKey) aim(); } piles3(); drawBasket(); drawSlots(); sync(); if (ship) { ship.position.y = Math.sin(t * .8) * .06; ship.rotation.z = Math.sin(t * .6) * .03; }
  if (roll) { roll.t += dt * 1000; const k = roll.t / M.ROLL_MS; roll.o.position.x = roll.x0 + roll.dir * k * 1.6; roll.o.rotation.x -= dt * 7; roll.o.position.z = M.COUNTER_Z + .1 + (M.EDGE_Z - M.COUNTER_Z - .1) * k;   /* 손님 줄 사이를 지나 선착장 뒤 끝으로 */ if (k >= 1) endRoll(false); }
  else if (!CALM && S.q.length && !S.asking && !S.payG && !S.paused) { const n5 = N5(); if (rollIn === Infinity) { if (n5.seen.roll) rollIn = M5.rollGap(); else if (M5.rollDue(n5)) rollIn = 2.5; } else { rollIn -= dt; if (rollIn <= 0) { n5.seen.roll = true; shop.wallet.save(); rollIn = M5.rollGap(); startRoll(); } } }
  /* 첫 손님들: 가만히 있으면 손이 담을 물건 칸을, 다 담았으면 「여기요!」를 짚는다 */ if ((N5().served | 0) < 2 && !S.asking && !S.payG && !S.paused && !S.busy && S.sel && !S.sel.leaving && H.idle(4500)) { const g = S.sel, k = Object.keys(g.order).find(k => (g.order[k] || 0) > shop.count(k)); H.at(k ? document.querySelector(`#shelf .crate[data-k="${k}"]`) : shop.matches(g.order) ? $('give') : null); }
  t0 = t; });
$('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500);
if ((N5().served | 0) < 3) H.tell('market', '손님이 원하는 만큼 담아서 건네요!');
window.__market = { stage, crowd, piles, basket, pick, M, startRoll, endRoll, get roll(){ return roll; }, screenOf, GOODS };
