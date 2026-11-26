/* 세기 틀 「물고기 세어 담기」(3D, T03) — 얕은 바다에서 헤엄치는 물고기를 하나씩 짚어 통에 담고, 모두 몇 마리인지 답한다.
 * 설계: 핸드오프 kedu/math-play-work/T03_세기_틀.md · 정본 kmotion/math-wizard/27_수학놀이터_내용지도와_틀_설계_v1.md(4 · 5절 · 5-9 · 5-10 · 5-11). 규칙 = ./rules.js(화면 없음).
 * 한 나들이 = 낱칸 하나(A01 · A06) · 판 = 문제 셋(구슬) · 나들이 = 판 셋(등불). 짚는 손이 곧 세기 — 담긴 물고기는 다시 꺼낼 수 없다.
 * 걸음 ① 따라 세기(낱칸의 첫 판 · 막히면 한 판 다시): 담을 때마다 통 위의 점과 수가 하나씩 오르고, 바다가 비면 저절로 닫힘.
 * 걸음 ② 세고 답하기(통과는 여기서만): 수는 오르지 않는다 → 다 담았다고 생각하면 「다 담았어요」(종)를 아이가 스스로 →
 *   남았으면 숨은 물고기가 고개를 내밀고 「나도!」 · 다 담았으면 「물고기는 모두 ?마리」 + 점 카드 셋 → 아니면 통의 물고기가 하나씩 튀어 오르며 세어지고 그 수가 물러난다.
 * 사건(rules.js events): 썰물(시계 · 생각하는 동안에만) · 숨는 물고기(알맹이) · 빠른 물고기 · 깜짝 물고기 · 뚜껑 덮인 통(통과 뒤) · 물장구. 사건은 수를 바꾸지 않는다.
 * 누름에는 늘 답이 있다(5-11): 빈 곳을 눌러도 물결 + 손이 다음에 누를 곳 + 한 줄 안내 — 깨끗함에 세지 않는다.
 * 그림은 기성 3D 재료만(Quaternius CC0 — ./assets · 이름표는 ./art.js). 화면 위 표시(띠 · 통 위의 수 · 점 카드 · 「나도!」 · 구슬 · 등불)만 코드로. */
import { createStage, THREE, CALM, sleep } from '../common/stage3d.js?v=2';
import * as A from '../common/ask.js?v=2';
import * as H from '../common/hint.js?v=5';
import { wallet, audio, tone, confetti, grew } from '../common/kit.js?v=8';
import { art } from '../common/art.js?v=8';
import * as E from '../common/ends.js?v=1';
import * as M from '../common/map.js?v=12';
import * as C from '../common/choose.js?v=5';
import { UNIT } from '../common/say.js?v=5';
import * as B from '../common/barrel.js?v=1';
import * as R from './rules.js?v=1';
import { ASSETS, MODEL, fishModel, SCENERY, DONE, GLOW, SAND, ICON } from './art.js?v=2';

// ── 내가 정한 수치(화면 · 움직임 — 준호가 보고 바꾼다). 문제 · 사건 · 시계 수치는 ./rules.js 의 T
const T = { DECK: .45, DZ: 1.95,
  WIDE: { tub: [-.2, 1.72], lid: [.72, 1.86], bell: [1.5, 1.5], anne: [-1.5, 1.72], boat: [3.72, .95], boatRy: 0 },
  TALL: { tub: [-.05, 1.62], lid: [1.62, 2.0], bell: [.98, 1.5], anne: [-1.05, 1.55], boat: [1.95, 2.85], boatRy: Math.PI / 2, sea: { x: [-1.65, 1.65], z: [-3.2, .4] } },
  TUB_S: 1.55, TUB_BIG: 1.18, BOAT_S: .85, ON_BOAT_S: .55, FISH_S: .85, FISH_Y: .03, IN_TUB: { s: .46, r: [.04, .23], y: .8 }, ROCK_S: 1.15, WEED_S: 1.15,
  FLY_MS: 520, ENTER_MS: 1300, SEP: .75, AVOID: .85, WANDER: 1.3, FRONT: .99, TELL_GRACE: 5, NADO_MS: 1500, NADO_BUSY: 400, COUNT_MS: 430, SHOW_MS: 700, CLOSE_MS: 600, LEAVE_MS: 1600, ARRIVE_MS: 1300,
  DONE_PX: 70, BELL_S: .9, BELL_TILT: [-.5, -.8], EBB: { op: [.92, .42], drop: .16 }, HIDE: { rock: .64, weed: .62, back: .12, down: .04 } };
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const GO = '/math/play/go/';
const WANT = Q.get('cell'), GO_NOW = !WANT || !R.CELLS[WANT];   /* ?cell= 없이 열리면 모형을 불러오기 전에 고르는 화면으로(검수 10) */
if (GO_NOW) location.replace(GO);
const S = { ready: false, busy: true, active: false, t: 0, oid: 0, cell: null, p: null, res: null, step: 2, ev: {}, board: null, clock: 0, streak: 0, closed: false, choose: null, lastAct: 0, back: false, surpriseCarry: false, hist: {}, log: [],
  fish: [], sea: null, sc: null, spots: [], tub: null, lid: null, lidOn: false, tally: 0, flying: 0, asked: false, tall: false, boatLoad: [], outFish: [], nado: [], L: T.WIDE };

const stage = createStage({ canvas: $('c'), seaX: 0, seaW: 160, fog: [18, 62], shadow: { left: -7, right: 7, top: 5, bottom: -6 }, assets: ASSETS }), { scene, camera } = stage;
const K = {};
const NAMES = [...new Set([MODEL.tub, MODEL.keeper, MODEL.net, MODEL.dock, MODEL.pole, MODEL.boat, MODEL.rock, MODEL.weed, MODEL.weed2, ...(MODEL.bell ? [MODEL.bell] : []), ...R.FISH.map(fishModel), ...SCENERY.map(s => s[0])])];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const pick = a => a[Math.floor(Math.random() * a.length)];
const L = () => S.tall ? T.TALL : T.WIDE;
const seaBox = () => S.tall ? T.TALL.sea : R.T.SEA;

// ── 통 · 뚜껑: Prop_Barrel 을 조각으로(위 판자 넷 = 뚜껑 · 같은 판자를 바닥에 한 벌) — 안쪽 면이 보이게 양면
let TK = null;
const makeTub = () => B.makeTub(stage, THREE, TK, { s: T.TUB_S, layerY: T.IN_TUB.y }), makeLid = () => B.makeLid(stage, THREE, TK, T.TUB_S);   /* 통 · 뚜껑은 common/barrel.js(담아 주기 틀과 같이 씀) */
/** 뚜껑 자리: 통 위(덮음) 또는 통 옆에 기대 둠(닫을 때 덮는다). */
function lidPose(on){ const tb = S.tub.root, s = tb.scale.x; return on ? { x: tb.position.x, y: T.DECK + TK.h * T.TUB_S * s + .02, z: tb.position.z, rz: 0, rx: 0 } : { x: L().lid[0], y: T.DECK + .4 * s, z: L().lid[1], rz: -.12, rx: 1.05 }; }
function lidSet(on){ const q = lidPose(on); S.lid.position.set(q.x, q.y, q.z); S.lid.rotation.set(q.rx, 0, q.rz); S.lid.scale.setScalar(S.tub.root.scale.x); S.lidOn = on; S.tub.layer.visible = !on || !S.ev.lid; }
async function lidMove(on, ms = T.CLOSE_MS){ const q = lidPose(on), up = Math.max(S.lid.position.y, q.y) + .5; S.lidOn = on;
  await Promise.all([stage.tween(S.lid.position, { x: q.x, z: q.z }, ms, t => t), stage.tween(S.lid.position, { y: up }, ms * .45).then(() => stage.tween(S.lid.position, { y: q.y }, ms * .55)), stage.tween(S.lid.rotation, { x: q.rx, z: q.rz }, ms)]); }

// ── 물고기(Cute Fish Pack — 헤엄 움직임)
function fishObj(name, size){ const rig = K[fishModel(name)], p = stage.person(rig, { scale: 1 }); scene.remove(p.obj); const o = new THREE.Group(); o.add(p.obj); stage.play(p, 'Swimming_Normal'); if (p.act) p.act.time = Math.random() * 2;
  o.scale.setScalar(T.FISH_S * size); scene.add(o); return { o, p }; }
function dropFish(f){ if (f.p) stage.unperson(f.p); if (f.o.parent) f.o.parent.remove(f.o); }
function sparkle(f, on){ f.o.traverse(m => { if (m.isMesh) { if (!m.userData.own) { m.material = m.material.clone(); m.userData.own = true; } m.material.emissive = new THREE.Color(on ? GLOW : '#000000'); m.material.emissiveIntensity = on ? .6 : 0; } }); f.glow = on; }
const fLen = f => .8 * T.FISH_S * f.size;
/** 숨는 곳에서의 자리: 머리는 바위(해초) 뒤 · 꼬리만 옆으로 나온다. */
function hidePose(f, spot){ const s = S.spots[spot], side = f.o.position.x >= s[0] ? 1 : -1, r = spot === 0 ? T.HIDE.rock : T.HIDE.weed; return { x: s[0] + side * r, z: s[1] - T.HIDE.back, side, ry: Math.atan2(-side, 0), spot }; }
/** 누를 자리(화면): 헤엄치는 물고기 = 몸 · 숨은 물고기 = 꼬리. */
function fishScreen(f){ const o = f.o.position; if (f.st() === 'hide' && f.hp) return stage.screenOf(V(o.x + f.hp.side * fLen(f) * .42, o.y + .06, o.z)); return stage.screenOf(V(o.x, o.y + .08, o.z)); }
const inSea = () => S.fish.filter(f => ['swim', 'go', 'hide'].includes(f.st()));

// ── 짓기
const tubs = [];
async function build(){ await Promise.all(NAMES.map(async n => { K[n] = await stage.load(n); }));
  TK = B.barrelKit(stage, THREE, K[MODEL.tub]);
  const dk = stage.dockKit(K[MODEL.dock]), step = Math.abs(dk.plankAt[1].x - dk.plankAt[0].x) || .36;
  let i = 0; for (let x = -4.8; x <= 4.8; x += step, i++) { const m = new THREE.Mesh(dk.planks[i % dk.planks.length], dk.mat); m.position.set(x, T.DECK - dk.plankH / 2, T.DZ); scene.add(stage.shadows(m)); }
  for (let x = -4.2; x <= 4.4; x += 2.8) for (const z of [T.DZ - 1.15, T.DZ + 1.2]) stage.put(K[MODEL.pole], x, T.DECK - .8, z, 1, x);
  for (const s of SCENERY) stage.put(K[s[0]], s[1], s[2], s[3], s[4], s[5]);
  S.rock = stage.put(K[MODEL.rock], 0, -.22, 0, T.ROCK_S, .4); S.weed = new THREE.Group(); { const a = K[MODEL.weed].scene.clone(), b = K[MODEL.weed2].scene.clone(), c = K[MODEL.weed2].scene.clone(); a.position.y = -.28; b.position.set(.25, -.25, -.15); c.position.set(-.28, -.25, .05); c.rotation.y = 1.3; [a, b, c].forEach(x => S.weed.add(stage.shadows(x))); S.weed.scale.setScalar(T.WEED_S); scene.add(S.weed); }
  S.anne = stage.person(K[MODEL.keeper]); stage.play(S.anne, 'Idle'); setNet();
  S.boat = new THREE.Group(); { const b = K[MODEL.boat].scene.clone(); S.boat.add(stage.shadows(b)); S.boat.scale.setScalar(T.BOAT_S); scene.add(S.boat); }
  if (MODEL.bell) { S.bell = stage.put(K[MODEL.bell], 0, T.DECK, 0, T.BELL_S, 0); }
  stage.onResize = aim; stage.resize();
  let c = document.createElement('div'); c.id = 'coins'; document.body.appendChild(c); coinsDraw(); wallet.onChange(() => coinsDraw());
  if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
  const t = document.createElement('div'); t.id = 'tally'; t.hidden = true; document.body.appendChild(t);
  $('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 500); S.ready = true;
  outing(WANT); }
/** 앤의 뜰채: 손(무기 자리)에 낚싯대 모형을 쥐여 준다(낚시 섬과 같은 방식). */
function setNet(){ let slot = null; S.anne.obj.traverse(m => { if (/^Weapon_/.test(m.name) && !slot) slot = m; }); if (!slot) return; const rod = K[MODEL.net].scene.clone(); rod.position.copy(slot.position); rod.quaternion.copy(slot.quaternion); const ws = V(); slot.parent.getWorldScale(ws); rod.scale.setScalar(.62 / ws.x); slot.parent.add(stage.shadows(rod)); }
function coinsDraw(pop){ const c = $('coins'); if (!c) return; const v = `${art('coin')}<b>${wallet.coins()}</b>`; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v; if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } } }

// ── 카메라 · 자리(세로 화면은 바다를 세로로 길게)
function aim(w, h){ const tall = h > w * 1.05, was = S.tall; S.tall = tall; camera.fov = tall ? 50 : 40; const asp = w / h, half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * asp), span = tall ? 1.95 : 4.2, dist = tall ? span / Math.tan(half) : Math.max(5.6, span / Math.tan(half));
  camera.position.set(0, dist * (tall ? .93 : .85), (tall ? -1.2 : -.3) + dist * (tall ? .37 : .53)); camera.lookAt(0, 0, tall ? -1.2 : -.3);
  camera.clearViewOffset(); camera.aspect = asp; camera.updateProjectionMatrix(); camera.updateMatrixWorld(); const f = V(0, T.DECK, T.DZ + .55).project(camera), dy = h * T.FRONT - (1 - f.y) / 2 * h; camera.setViewOffset(w, h, 0, -dy, w, h);
  layout(); if (was !== tall && S.sc) reflow(); }
/** 문제 도중 화면을 돌렸다: 숨는 곳 · 숨은 자세 · 물고기 자리 · 안내 자리를 새 방향의 바다로(검수 9). */
function reflow(){ S.spots = S.sc.spots.map(s => S.tall ? toTall(s[0], s[1]) : s.slice()); spotsDraw(); const B = seaBox();
  for (const f of inSea()) { const o = f.o.position; if (f.hp) { f.hp = hidePose(f, f.hp.spot); o.x = f.hp.x; o.z = f.hp.z; f.o.rotation.y = f.hp.ry; } else { o.x = Math.min(B.x[1], Math.max(B.x[0], o.x)); o.z = Math.min(B.z[1], Math.max(B.z[0], o.z)); } if (f.go) f.go.hp = hidePose(f, f.go.hp.spot); }
  const tl = $('tell'); if (tl) { tl.style.top = ''; tl.style.bottom = ''; } tellLow(); }
function layout(){ const l = L(); S.anne.obj.position.set(l.anne[0], T.DECK + .02, l.anne[1]); S.anne.obj.rotation.y = Math.PI * .85;
  if (S.tub && !S.busy) { S.tub.root.position.set(l.tub[0], T.DECK, l.tub[1]); lidSet(S.lidOn); }
  if (!S.boatMoving) { S.boat.position.set(l.boat[0], 0, l.boat[1]); S.boat.rotation.y = l.boatRy; }
  if (S.bell) { S.bell.position.set(l.bell[0], T.DECK + .08, l.bell[1]); S.bell.rotation.x = T.BELL_TILT[S.tall ? 1 : 0]; }   /* 위에서 내려다보면 종이 동그라미로만 보여, 윗부분을 뒤로 눕혀 옆모습이 보이게 */ }
function spotsDraw(){ const [r, w] = S.spots; if (!r) return; S.rock.position.set(r[0], -.22, r[1]); S.weed.position.set(w[0], 0, w[1]); }
/** 세로 화면: 규칙의 바다(가로)를 세로 바다로 옮긴다(숨는 곳 · 처음 자리 · 들어오는 곳). */
function toTall(x, z){ const A0 = R.T.SEA, B = T.TALL.sea; return [B.x[0] + (x - A0.x[0]) / (A0.x[1] - A0.x[0]) * (B.x[1] - B.x[0]), B.z[0] + (z - A0.z[0]) / (A0.z[1] - A0.z[0]) * (B.z[1] - B.z[0])]; }

// ── 띠: 「물고기는 모두 ?마리」 → 닫히면 「물고기는 모두 4마리」(교과서 말 · 정본 5-9절)
function trayDraw(){ A.trayClear(); const t = $('tray'), p = S.p; if (!p) return; const n = S.closed ? `<b class="done">${p.N}</b>` : '<b class="hole">?</b>';
  t.innerHTML = `<i class="w">물고기는 모두</i>${n}<i class="w">${UNIT.fish}</i>`; t.className = 'on'; C.ask(!!S.choose); trayFit(); }
function trayFit(){ const t = $('tray'); t.style.fontSize = ''; const room = innerWidth * .96; if (t.offsetWidth > room) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room / t.offsetWidth) + 'px'; }

// ── 통 위의 수(점 무늬 + 숫자): 걸음 ① 은 담을 때마다 하나씩 · 걸음 ② 는 맞는 수를 고르거나 하나씩 세어 볼 때
function tallyShow(n, pop = true){ const e = $('tally'); S.tally = n; if (n <= 0) { e.hidden = true; return; } e.hidden = false; e.innerHTML = C.dotsHtml(Math.max(n, 1), n) + `<span>${n}</span>`; if (pop) { e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); } tallyPlace(); }
function tallyPlace(){ const e = $('tally'); if (e.hidden || !S.tub) return; const tb = S.tub.root, q = stage.screenOf(V(tb.position.x, T.DECK + TK.h * T.TUB_S * tb.scale.x + .55, tb.position.z)); e.style.left = q.x + 'px'; e.style.top = q.y + 'px'; }

// ── 점 카드 셋(띠 바로 아래 · 화면 가운데 위 · 크게 — common/choose.js 의 점 카드)
function chooseShow(list){ S.choose = { list }; const tl = $('tell'); if (tl) tl.classList.remove('on'); C.show(list, onPick, { dots: true }); C.ask(true); }
function chooseHide(){ C.hide(); S.choose = null; }
async function onPick(k, btn){ if (S.active && S.busy && S.choose) { const r = btn.getBoundingClientRect(); H.ripple(r.left + r.width / 2, r.top + r.height / 2); return; }   /* 세어 보는 동안 눌러도 물결(5-11 · 검수 6) */
  if (!S.active || S.busy || !S.choose) return; const my = S.oid; audio(); S.lastAct = S.t; H.hide(); const p = S.p, how = R.judge({ answer: p.N }, { type: 'pick', k }); S.log.push({ pick: k, how }); S.busy = true;
  if (S.lidOn) { S.tub.layer.visible = true; await lidMove(false); if (S.oid !== my) return; await sleep(250); }   /* 뚜껑 덮인 통: 고르면 뚜껑이 열리며 확인 */
  if (how === 'fit') { tone(880, .12, 'triangle', .1); tallyShow(p.N); chooseHide(); await sleep(T.SHOW_MS); if (S.oid !== my) return; await complete(); return; }
  S.res.retreat = true; await countUp(); if (S.oid !== my) return; C.retreat(btn); tone(240, .2, 'sine', .07); stage.play(S.anne, 'No', true); S.busy = false; S.lastAct = S.t; }
/** 아닌 수: 통의 물고기가 하나씩 톡톡 튀어 오르며 세어진다(수가 하나씩 오름) — 가위표 · 틀린 소리 없음. */
async function countUp(){ const my = S.oid, list = S.tub.fish.slice(); tallyShow(0);
  for (let k = 0; k < list.length; k++) { if (S.oid !== my) return; const f = list[k], y0 = f.o.position.y; tone(392 * Math.pow(2, k / 12 * 2), .1, 'triangle', .09); tallyShow(k + 1);
    await stage.tween(f.o.position, { y: y0 + .32 }, T.COUNT_MS * .45, t => t * (2 - t)); await stage.tween(f.o.position, { y: y0 }, T.COUNT_MS * .55, t => t * t); }
  await sleep(300); }

// ── 누르기(물고기 · 「다 담았어요」 · 빈 곳 — 모든 누름에 답이 있다)
const canvas = $('c');
function fishUnder(x, y){ let best = null, d0 = R.T.TAP_R; for (const f of inSea()) { const q = fishScreen(f), d = Math.hypot(q.x - x, q.y - y); if (d < d0) { d0 = d; best = f; } } return best; }
function doneScreen(){ if (S.bell) return stage.screenOf(S.bell.position.clone().add(V(0, .45, 0))); return stage.screenOf(S.lid.position.clone().add(V(0, S.lidOn ? .05 : 0, 0))); }
function onDone(x, y){ const q = doneScreen(); return Math.hypot(q.x - x, q.y - y) < T.DONE_PX; }
canvas.addEventListener('pointerdown', e => { audio(); if (!S.ready || E.homeOpen()) return; S.lastAct = S.t; H.hide(); const x = e.clientX, y = e.clientY;
  if (!S.active || S.busy) { S.log.push({ ignored: S.active ? 'busy' : 'idle' }); H.ripple(x, y); return; }   /* 바쁜 동안에도 물결은 뜬다(5-11) */
  if (S.choose) { nudge(x, y); return; }   /* 고르는 중: 카드가 들썩 */
  const f = fishUnder(x, y); if (f) { scoop(f); return; }
  if (onDone(x, y)) { pressDone(); return; }
  nudge(x, y); });
/** 헛누름: 물결(물만 튐 · 벌 없음) + 손이 다음에 누를 곳을 바로 짚고 + 한 줄 안내를 다시(카드가 떠 있으면 카드가 들썩). 깨끗함에는 세지 않는다 — 답이 아니라 「어디를 누르는지」만 알려 준다. */
function nudge(x, y){ H.ripple(x, y); splash(x, y, 4); S.log.push({ nudge: true }); tone(520, .07, 'triangle', .05);
  if (S.choose) { const c = $('choose'); if (c.animate) c.animate([{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.1)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 450 }); return; }
  const q = nextAt(x, y, true); if (q) handAt(q); if (H.tell('count.nudge', FIRST[S.step], { times: 1e9 })) tellLow(); }
/** 손을 띄운다 — 물고기를 짚으면 그 물고기를 따라간다(검수 4). */
function handAt(q){ S.handF = q.f || null; H.show(q.x, q.y); }
/** 한 줄 안내를 화면 아래(선착장 위)로 — 띠 바로 아래에 두면 셀 물고기를 가린다. */
function tellLow(){ const tl = $('tell'); if (!tl) return; if (S.tall) { tl.style.bottom = ''; return; } tl.style.top = 'auto'; tl.style.bottom = 'calc(40px + env(safe-area-inset-bottom,0px))'; }
/** 물고기를 짚었다: 앤의 뜰채가 떠서 통에 담는다(누른 자리에서 통까지 날아감 · 통에 「퐁」). */
async function scoop(f){ const my = S.oid; if (!R.scoop(S.sea, f.i)) return; S.lastAct = S.t; S.flying++; f.go = null; S.log.push({ scoop: f.i, left: R.left(S.sea) }); stage.play(S.anne, 'Sword', true);
  const up = 1 + .06 * Math.min(S.streak, 3); tone(520 * up, .08, 'sine', .08, 0, 900 * up);
  const tb = S.tub, lay = tb.layer, to = lay.localToWorld(V(0, 0, 0)), from = f.o.position.clone(), ms = T.FLY_MS, s1 = T.IN_TUB.s * f.size;
  f.o.rotation.set(0, f.o.rotation.y, 0); if (f.p && f.p.acts.Out_Of_Water) stage.play(f.p, 'Out_Of_Water');
  await Promise.all([stage.tween(f.o.position, { x: to.x, z: to.z }, ms, t => t), stage.tween(f.o.position, { y: Math.max(from.y, to.y) + 1.1 }, ms * .5, t => t * (2 - t)).then(() => stage.tween(f.o.position, { y: to.y }, ms * .5, t => t * t)), stage.tween(f.o.scale, { x: s1, y: s1, z: s1 }, ms)]);
  S.flying--; if (S.oid !== my) return; R.land(S.sea, f.i); lay.attach(f.o); f.o.position.set(0, 0, 0); f.o.scale.setScalar(s1 / tb.root.scale.x); if (f.p) stage.play(f.p, 'Swimming_Normal');
  f.tub = { a: Math.random() * Math.PI * 2, r: T.IN_TUB.r[0] + Math.random() * (T.IN_TUB.r[1] - T.IN_TUB.r[0]), w: (Math.random() < .5 ? -1 : 1) * (.8 + Math.random() * .8) }; tb.fish.push(f);
  const n = tb.fish.length; tone(330 * Math.pow(2, (n - 1) * 2 / 12), .12, 'triangle', .1); splashAt(to, 3);   /* 퐁 — 음이 한 칸씩 오른다 */
  if (S.step === 1) tallyShow(n);
  if (S.pendingDone && !S.flying && S.step === 2 && S.active && !S.busy) { S.pendingDone = false; pressDone(); return; }
  if (R.left(S.sea) === 0 && !S.flying && S.step === 1 && S.active && !S.closed) await complete(); }
/** 「다 담았어요」(종). 남았으면 「나도!」(깨끗하지 않음) · 다 담았으면 띠 「?」 + 점 카드 셋. */
async function pressDone(){ const my = S.oid; S.lastAct = S.t; doneWobble();
  if (S.step === 1 || S.asked) { nudge(...(q => [q.x, q.y])(doneScreen())); return; }   /* 걸음 ① 은 바다가 비면 저절로 닫힌다 — 손이 물고기를 짚어 준다 */
  if (S.flying) { S.pendingDone = true; return; }   /* 날아가는 중에 눌렀다 — 내려앉으면 이어서(검수 6) */
  const how = R.judge({ left: R.left(S.sea) }, { type: 'bell' }); S.log.push({ bell: how, left: R.left(S.sea) });
  if (how === 'early') { S.res.early = true; S.busy = true; tone(196, .18, 'sine', .08); const ids = R.peek(S.sea); for (const i of ids) { const f = S.fish[i]; f.go = null; if (f.hp) { f.hp = null; f.heading = Math.atan2(0, 1) + (Math.random() - .5); } nadoShow(f); jump(f); }
    await sleep(T.NADO_BUSY); if (S.oid !== my) return; S.busy = false; S.lastAct = S.t; return; }   /* 말풍선은 1.5초 남지만 바쁜 것은 잠깐만 — 고개 내민 물고기를 바로 누를 수 있게(검수 7) */
  S.asked = true; ring(); chooseShow(R.picksFor(S.cell, S.p)); tone(880, .1, 'triangle', .08); }
function doneWobble(){ if (S.bell) { const o = S.bell; if (stage.tweens.some(w => w.o === o.rotation)) return; stage.tween(o.rotation, { z: .28 }, 110).then(() => stage.tween(o.rotation, { z: -.22 }, 150)).then(() => stage.tween(o.rotation, { z: .1 }, 130)).then(() => stage.tween(o.rotation, { z: 0 }, 150)); return; }   /* 종이 흔들림(남았으면 소리는 안 남) */
  const o = S.lid, r0 = lidPose(S.lidOn).rx; if (stage.tweens.some(w => w.o === o.rotation)) return; stage.tween(o.rotation, { x: r0 + .18 }, 90).then(() => stage.tween(o.rotation, { x: r0 - .12 }, 120)).then(() => stage.tween(o.rotation, { x: r0 }, 150)); }
function ring(){ if (S.bell) { [1046, 1318].forEach((f, i) => tone(f, .5, 'sine', .1, i * .12)); } else tone(660, .12, 'triangle', .1); }
function jump(f){ const y0 = T.FISH_Y; stage.tween(f.o.position, { y: y0 + .45 }, 220, t => t * (2 - t)).then(() => stage.tween(f.o.position, { y: y0 }, 260, t => t * t)); }
/** 「나도!」: 남은 물고기 머리 위에 말풍선 + 물방울(그 물고기를 따라다님). */
function nadoShow(f){ const d = document.createElement('div'); d.className = 'nado'; d.innerHTML = '<b>나도!</b><span></span><span></span>'; document.body.appendChild(d); const n = { d, f, until: S.t + T.NADO_MS / 1000 + .4 }; S.nado.push(n); nadoPlace(n); tone(740, .1, 'sine', .07, .1); }
function nadoPlace(n){ const q = stage.screenOf(n.f.o.position.clone().add(V(0, .55, 0))), tr = $('tray'), top = tr && tr.classList.contains('on') ? tr.getBoundingClientRect().bottom + 70 : 0, below = q.y < top;   /* 띠에 닿으면 물고기 아래에 */
  n.d.style.left = q.x + 'px'; n.d.style.top = (below ? stage.screenOf(n.f.o.position).y + 30 : q.y) + 'px'; n.d.style.transform = below ? 'translate(-50%,0)' : ''; }
/** 물 튐(화면 위 표시 — 물방울 몇 개가 튀었다 떨어짐). */
function splash(x, y, n = 6, big = 1){ for (let k = 0; k < n; k++) { const s = document.createElement('div'); s.className = 'spray'; s.style.left = x + 'px'; s.style.top = y + 'px'; document.body.appendChild(s); const a = Math.random() * Math.PI * 2, r = (24 + Math.random() * 30) * big;
    requestAnimationFrame(() => { s.style.transform = `translate(${Math.cos(a) * r}px,${Math.sin(a) * r - 20 * big}px) scale(${.5 + Math.random() * .6})`; s.style.opacity = 0; }); setTimeout(() => s.remove(), 850); } }
const splashAt = (v, n, big) => { const q = stage.screenOf(v); splash(q.x, q.y, n, big); };

// ── 한 문제의 시작 · 끝
function clearAll(){ for (const f of S.fish) { if (!S.tub || !S.tub.fish.includes(f)) dropFish(f); } S.fish = []; S.nado.forEach(n => n.d.remove()); S.nado = []; chooseHide(); tallyShow(0); S.flying = 0; }
function newTub(big){ if (S.tub && !tubs.includes(S.tub)) { S.tub.fish.forEach(dropFish); S.tub.root.parent && S.tub.root.parent.remove(S.tub.root); S.lid && S.lid.parent && S.lid.parent.remove(S.lid); }
  S.tub = makeTub(); S.lid = makeLid(); const l = L(), s = big ? T.TUB_BIG : 1; S.tub.root.position.set(l.tub[0], T.DECK, l.tub[1]); S.tub.root.scale.setScalar(s); lidSet(!!S.ev.lid); }
async function tubPop(){ const r = S.tub.root, s = r.scale.x; r.scale.setScalar(.01); S.lid.visible = false; await stage.tween(r.scale, { x: s, y: s, z: s }, 260, t => 1 - (1 - t) ** 3); S.lid.visible = true; }
async function runProblem(p, ctx){ const my = S.oid; clearAll(); S.sea = null; S.pendingDone = false; S.handF = null; if (S.forceN && S.forceN.length) p = R.make(S.forceN.shift()); S.p = p; S.step = ctx.step; S.ev = ctx.ev; S.lastQ = ctx.last; S.res = { early: false, retreat: false, hinted: false, missed: false }; S.closed = false; S.asked = false; S.clock = 0; S.streakBreak = false; S.busy = true; S.L = L();
  const hides = ctx.step === 2 ? R.hidesFor(S.cell, p.N, S.ev, Math.random) : 0, sc = R.scene(p.N, Math.random, { hides, fast: ctx.fast, surprise: ctx.surprise }); S.sc = sc;
  S.spots = sc.spots.map(s => S.tall ? toTall(s[0], s[1]) : s.slice()); spotsDraw(); ebbDraw(0);
  newTub(ctx.last); trayDraw(); E.marbles(ctx.j, 3, 0); await tubPop(); if (S.oid !== my) return { abort: true };
  const fast = 1 - R.T.SPLASH_FAST * Math.min(S.streak, 3), ms = T.ENTER_MS * fast;
  S.fish = sc.fish.map(d => { const { o, p: pp } = fishObj(d.model, d.size), [x, z] = S.tall ? toTall(d.x, d.z) : [d.x, d.z], [fx, fz] = S.tall ? [Math.sign(d.from[0]) * (T.TALL.sea.x[1] + 1.8), z] : d.from, f = { ...d, o, p: pp, heading: d.heading, sp: d.speed, turnAt: 0, go: null, hp: null };
    f.st = () => S.sea ? S.sea.fish[d.i].st : 'swim'; o.position.set(fx, T.FISH_Y, fz); f.home = [x, z]; if (d.surprise) sparkle(f, true); return f; });
  tone(262 * (1 + .1 * Math.min(S.streak, 3)), .3, 'sine', .06); if (S.streak) splash(innerWidth / 2, innerHeight * .45, 4 + 2 * Math.min(S.streak, 3), 1.4);
  await Promise.all(S.fish.map(f => sleep(f.delay * 1000).then(() => { f.o.rotation.y = Math.atan2(f.home[0] - f.o.position.x, f.home[1] - f.o.position.z); return stage.tween(f.o.position, { x: f.home[0], z: f.home[1] }, ms, t => 1 - (1 - t) ** 3); })));
  if (S.oid !== my) return { abort: true };
  S.sea = R.sea(sc); S.log.push({ start: p.N, step: S.step, hides, ev: Object.keys(S.ev).filter(k => S.ev[k] === true).join(' ') });
  const told = ctx.j === 0 && ctx.firstStep && H.tell('count.' + S.step, FIRST[S.step], TELLS()); if (told) tellLow();   /* 세로 화면은 띠 아래(선착장 위에 두면 통 · 뚜껑을 가린다) */   /* 물고기가 다 들어온 뒤에 띄운다(5-11) · 바다(셀 물고기)를 가리지 않게 선착장 위에 */
  S.active = true; S.busy = false; S.lastAct = S.t + (told ? T.TELL_GRACE : 0);
  const out = await new Promise(res => { S.done = res; }); S.active = false; S.done = null; chooseHide(); H.hide();
  const r = { ...S.res, clean: R.clean(S.res), out, p }; S.log.push({ problem: R.key(p), N: p.N, step: S.step, ...r, p: undefined }); return r; }
/** 해냈다: 띠가 닫히고 뚜껑이 덮이고 통이 나룻배에 실린다(깜짝 물고기는 깨끗할 때만 덤). */
async function complete(){ if (!S.active || S.closed) return; const my = S.oid; S.busy = true; S.closed = true; trayDraw(); if (S.step === 1) tallyShow(S.p.N, false); const cleanNow = R.clean(S.res);
  [523, 659, 784].forEach((f, i) => tone(f * (1 + .06 * Math.min(S.streak, 3)), .12, 'triangle', .1, i * .07)); stage.play(S.anne, 'Yes', true);
  if (S.step === 2) { if (cleanNow) { S.streak++; if (S.streak % R.T.STREAK === 0) { const q = stage.screenOf(S.tub.root.position.clone().add(V(0, 1, 0))); splash(q.x, q.y, 16, 2.2); [784, 988, 1175, 1568].forEach((f, i) => tone(f, .18, 'triangle', .1, .25 + i * .09)); S.log.push({ splash: S.streak }); } } else S.streak = 0; }
  const sf = S.tub.fish.find(f => f.surprise);
  if (sf) { if (cleanNow) { await sleep(300); if (S.oid !== my) return; sparkle(sf, false); confetti(12); tone(1319, .2, 'triangle', .1); wallet.earn(R.T.SURPRISE_COINS, 'count'); coinsDraw(true); S.surpriseCarry = false; S.log.push({ surpriseOpen: true }); } else S.surpriseCarry = true; }
  wallet.earn(R.T.COIN_PER, 'count'); coinsDraw(true); S.outFish.push(...S.tub.fish.map(f => f.model));
  await sleep(500); if (S.oid !== my) return; if (!S.lidOn) await lidMove(true); if (S.oid !== my) return; await sleep(250); if (S.oid !== my) return; tallyShow(0); await toBoat(); if (S.oid !== my) return; S.done && S.done('sent'); }
/** 통(뚜껑째)을 나룻배에 싣는다 — 판 하나에 셋. */
async function toBoat(){ const tb = S.tub, lid = S.lid, k = S.boatLoad.length, slot = S.boat.localToWorld(V(0, .32, (k - 1) * .62)), s = T.ON_BOAT_S, ly = slot.y + TK.h * T.TUB_S * s + .02;
  tubs.push(tb); S.boatLoad.push({ tb, lid }); tone(440, .12, 'triangle', .08);
  const arc = (o, y) => Promise.all([stage.tween(o.position, { x: slot.x, z: slot.z }, 700, t => t), stage.tween(o.position, { y: y + 1 }, 330, t => t * (2 - t)).then(() => stage.tween(o.position, { y }, 370, t => t * t)), stage.tween(o.scale, { x: s, y: s, z: s }, 700)]);
  await Promise.all([arc(tb.root, slot.y), arc(lid, ly)]);
  S.boat.attach(tb.root); S.boat.attach(lid); tone(330, .1, 'sine', .07); tb.fish.forEach(dropFish); tb.fish = []; }   /* 뚜껑이 덮였으니 통 속 물고기는 거둔다(움직임 수를 줄임 · 검수 15) */
/** 썰물이 다 빠졌다: 남은 물고기가 먼바다로 — 담은 만큼만 싣고, 그 문제는 문제 둘 뒤에 다시(표시 · 벌 없음). */
async function miss(){ if (!S.active || S.busy) return; const my = S.oid; S.busy = true; S.res.missed = true; S.streak = 0; chooseHide(); S.log.push({ missed: true, left: R.left(S.sea) });
  [880, 880, 880].forEach((f, i) => tone(f, .25, 'sine', .08, i * .35)); if (S.fish.some(f => f.surprise)) S.surpriseCarry = true; const ids = R.flee(S.sea);
  await Promise.all(ids.map(i => { const f = S.fish[i]; f.go = null; f.o.rotation.y = Math.PI; return stage.tween(f.o.position, { z: f.o.position.z - 7, y: -.4 }, 1400, t => t * t); }));
  if (S.oid !== my) return; ids.forEach(i => { S.fish[i].o.visible = false; }); if (!S.lidOn) await lidMove(true); if (S.oid !== my) return; await toBoat(); ebbDraw(0); S.done && S.done('missed'); }

// ── 나룻배: 판이 시작될 때 들어오고, 통 셋을 싣고 떠난다
async function boatArrive(){ const l = L(); S.boatMoving = true; S.boat.position.set(l.boat[0] + 7, 0, l.boat[1] - 1.5); S.boat.rotation.y = l.boatRy; await stage.tween(S.boat.position, { x: l.boat[0], z: l.boat[1] }, T.ARRIVE_MS, t => 1 - (1 - t) ** 3); S.boatMoving = false; }
async function boatLeave(){ S.boatMoving = true; tone(392, .2, 'triangle', .08); tone(523, .3, 'triangle', .08, .18); await stage.tween(S.boat.position, { x: S.boat.position.x + 8, z: S.boat.position.z - 3 }, T.LEAVE_MS, t => t * t);
  for (const b of S.boatLoad) { b.tb.fish.forEach(dropFish); S.boat.remove(b.tb.root); S.boat.remove(b.lid); const i = tubs.indexOf(b.tb); if (i >= 0) tubs.splice(i, 1); } S.boatLoad = []; S.boatMoving = false; }

// ── 썰물: 물이 조금씩 빠진다(바다가 옅어지고 바닥 모래가 드러남) — 생각하는 동안에만
const DEEP0 = new THREE.Color(stage.deep.material.color.getHex()), SAND_C = new THREE.Color(SAND);
function ebbDraw(k){ stage.sea.material.opacity = T.EBB.op[0] + (T.EBB.op[1] - T.EBB.op[0]) * k; stage.sea.position.y = -T.EBB.drop * k; stage.deep.material.color.copy(DEEP0).lerp(SAND_C, Math.min(1, k * 1.15)); stage.deep.position.y = -1.6 + 1.2 * k; }

// ── 나들이(판 셋) · 판(문제 셋)
const TELLS = () => ({ times: M.passed(M.get(S.cell || '')) ? 2 : 1e9 });   /* 깃발을 따기 전에는 나들이 첫 문제마다 한 줄 안내(정본 5-11절) */
const FIRST = { 1: '물고기를 하나씩 눌러 통에 담아 줘.', 2: `물고기를 다 담았으면 ${DONE.name}${DONE.eul} 눌러 줘. 모두 몇 마리일까?` };
async function outing(id){ const my = ++S.oid; E.showBar(true); S.cell = id; S.streak = 0; S.outFish = []; S.surpriseCarry = false; const day = M.dayKey(); let prevStep = 0;
  let rec = M.get(id); S.back = M.stuckNow(rec) && !!rec.hand;   /* 막혀서 걸음 ① 로 돌아갈 판이 「한 번 더」에서 사라지지 않게(검수 13) */
  let q = R.deal(id, S.hist[id] || [], Math.random, { small: M.stuck(rec) >= 1 }); S.q = q; E.lanterns(0); S.log.push({ outing: id, deal: q.map(R.key) });
  for (let b = 0; b < R.T.BOARDS; b++) { rec = M.get(id); const hand = !rec.hand || S.back;
    let ev = R.events(rec.evBoards, Math.random, { passed: M.passed(rec), calm: CALM, hand }); if (S.forceEv) { ev = { ...ev, ...S.forceEv }; S.forceEv = null; } if (S.surpriseCarry && !hand) ev.surprise = true;
    const surpJ = !ev.surprise ? -1 : ev.surpJ != null ? ev.surpJ : Math.floor(Math.random() * 3); S.board = { b, hand, ev }; S.log.push({ board: b, hand, ev: Object.keys(ev).filter(k => ev[k] === true).join(' ') });
    const results = []; E.marbles(0); await boatArrive(); if (S.oid !== my) return;
    for (let j = 0; j < R.T.PER_BOARD; j++) { const i = b * R.T.PER_BOARD + j, r = await runProblem(q[i], { step: hand ? 1 : 2, ev, board: b, j, last: b === R.T.BOARDS - 1 && j === R.T.PER_BOARD - 1, fast: ev.fast && j !== surpJ, surprise: j === surpJ, firstStep: b === 0 || (hand ? 1 : 2) !== prevStep });
      if (S.oid !== my || r.abort) return; results.push(r); E.marbles(j + 1); if (!r.clean) q = R.requeue(q, i); S.q = q; }
    prevStep = hand ? 1 : 2;
    const before = rec; rec = M.record(rec, results, day, { counts: !hand, hand, ev: !hand && !ev.none }); if (hand) S.back = false; else if (M.stuckNow(rec)) S.back = true; M.put(id, rec); S.log.push({ boardEnd: b, clean: M.clean(results), rec: { ...rec } });
    await boatLeave(); if (S.oid !== my) return;
    await E.fly($('marbles'), $('coins'), art('coin'), results.filter(r => r.out === 'sent').length); if (S.oid !== my) return; E.lanterns(b + 1); tone(660, .15, 'triangle', .1); tone(990, .2, 'triangle', .1, .12);
    if (!M.passed(before) && M.passed(rec)) { grew(art(ICON.flag) + ' 깃발을 땄어요!'); await sleep(2400); } else if (!M.kept(before) && M.kept(rec)) { grew(art(ICON.star) + ' 깃발에 별이 붙었어요!'); await sleep(2400); }
    if (S.oid !== my) return; await sleep(400); }
  S.hist[id] = q; S.p = null; A.trayClear(); clearAll(); if (S.tub && !tubs.includes(S.tub)) { S.tub.root.visible = false; S.lid.visible = false; }
  const items = S.outFish.map(n => art(ICON.fish(n))); const choice = await E.home({ items }); if (S.oid !== my) return;
  if (choice === 'again') outing(id); else location.href = GO; }
/** 하네스 · 교사용: 지금 나들이를 거둔다. */
function abort(){ S.oid++; S.active = false; if (S.done) { const d = S.done; S.done = null; d('abort'); } stage.tweens.length = 0; clearAll();
  for (const b of S.boatLoad) { b.tb.fish.forEach(dropFish); b.tb.root.parent && b.tb.root.parent.remove(b.tb.root); b.lid.parent && b.lid.parent.remove(b.lid); } S.boatLoad = []; tubs.length = 0;   /* 배에 실린 통 · 날던 통도 치운다(검수 12) */ S.busy = false; S.boatMoving = false; ebbDraw(0); layout(); }

// ── 한 장면의 일
stage.frame((dt, t) => { S.t = t; if (!S.ready) return; tallyPlace(); if (S.choose) C.place();
  for (let k = S.nado.length - 1; k >= 0; k--) { const n = S.nado[k]; if (t > n.until) { n.d.remove(); S.nado.splice(k, 1); } else nadoPlace(n); }
  if (S.sea && S.active) for (const e of R.tick(S.sea, dt, pickHider)) seaEvent(e);
  swim(dt, t); tubSwim(dt, t);
  for (const f of S.fish) if (f.glow) f.o.traverse(m => { if (m.isMesh) m.material.emissiveIntensity = .35 + Math.sin(t * 6) * .3; });
  const thinking = S.active && !S.busy && !S.closed;
  const hidden = S.sea && S.sea.fish.some(f => f.st === 'hide' || f.st === 'go'); if (thinking && hidden) S.lastAct = Math.max(S.lastAct, t - .2);   /* 숨은 물고기를 기다리는 동안은 길잡이 손이 뜨지 않는다(기다림은 깨끗함 그대로) */
  /* 썰물: 생각하는 동안에만 · 바다에 물고기가 남아 있는 동안만 · 끝이 가까우면 「다 담았어요」가 흔들림 */
  if (thinking && S.ev.ebb && S.step === 2 && !CALM && !S.choose && S.sea && S.sea.fish.some(f => f.st === 'swim' || f.st === 'go')) {   /* 숨은 물고기만 남아 기다리는 동안은 쉰다(검수 8) */ S.clock = Math.min(1, S.clock + dt / R.ebbS(S.board ? S.board.b : 0, S.cell)); ebbDraw(S.clock);
    if (S.clock > .78 && t - (S.bell2 || 0) > .3 + (1 - S.clock) * 2.2) { S.bell2 = t; tone(1046, .12, 'sine', .07); doneWobble(); }
    if (S.clock >= 1) miss(); }
  /* 길잡이 손: 가만히 있으면 다음에 누를 곳(뜨면 그 문제는 깨끗하지 않음) */
  const wait = S.choose ? R.T.HINT_PICK : R.T.HINT_AFTER * (M.stuck(M.get(S.cell || '')) >= 1 ? .5 : 1);   /* 점 카드를 세어 고르는 동안은 길게(검수 2) */
  if (thinking && t - S.lastAct > wait && !H.shown()) { const q = S.choose ? cardAt() : nextAt(); if (q) { handAt(q); S.res.hinted = true; S.log.push({ hinted: true }); } }
  if (H.shown() && S.handF) { const f = S.handF; if (['swim', 'go', 'hide'].includes(f.st())) { const q = fishScreen(f); H.show(q.x, q.y); } else { S.handF = null; const q = S.active && !S.choose ? nextAt() : null; if (q && q.f) handAt(q); else H.hide(); } } });
const dist2 = (f, s) => (f.o.position.x - s[0]) ** 2 + (f.o.position.z - s[1]) ** 2;
/** 숨으러 갈 물고기: 그 숨는 곳에 가장 가까운 것(빠른 물고기도 숨을 수 있다). */
const pickHider = (c, spot) => c.slice().sort((a, b) => dist2(S.fish[a.i], S.spots[spot]) - dist2(S.fish[b.i], S.spots[spot]))[0];
/** 바다의 일: 숨으러 감 · 숨음(꼬리만) · 다시 나옴. */
function seaEvent(e){ const f = S.fish[e.i]; S.log.push({ sea: e.type, i: e.i, spot: e.spot });
  if (e.type === 'go') { const hp = hidePose(f, e.spot); f.go = { x0: f.o.position.x, z0: f.o.position.z, t0: S.t, hp }; }
  else if (e.type === 'hide') { const hp = f.go ? f.go.hp : hidePose(f, e.spot); f.go = null; f.hp = hp; f.o.position.set(hp.x, T.FISH_Y - T.HIDE.down, hp.z); f.o.rotation.y = hp.ry; }
  else if (e.type === 'out') { const s = S.spots[e.spot], side = f.hp ? f.hp.side : 1; f.hp = null; f.heading = side > 0 ? 0 : Math.PI; f.burst = 1.2; tone(600, .06, 'sine', .04); } }
/** 헤엄: 떠돌기 + 서로 밀어내기(겹쳐도 금방 갈라짐) + 숨는 곳 피하기 + 바다 안. 빠른 물고기는 휙휙 방향을 바꾼다. */
function swim(dt, t){ if (!S.sea) return; const B = seaBox(), list = S.fish.filter(f => { const st = f.st(); return st === 'swim' || st === 'go'; });
  for (const f of list) { const o = f.o.position;
    if (f.go) { const k = Math.min(1, (S.t - f.go.t0) / R.T.HIDE_SWIM), hp = f.go.hp; o.x = f.go.x0 + (hp.x - f.go.x0) * k; o.z = f.go.z0 + (hp.z - f.go.z0) * k; o.y = T.FISH_Y - T.HIDE.down * k; f.o.rotation.y = Math.atan2(hp.x - f.go.x0, hp.z - f.go.z0); continue; }
    if (f.fast && t > f.turnAt) { f.heading += (Math.random() < .5 ? -1 : 1) * (1.2 + Math.random()); f.turnAt = t + .55 + Math.random() * .5; }
    f.heading += (Math.random() - .5) * T.WANDER * dt * 2;
    let vx = Math.cos(f.heading) * f.sp, vz = Math.sin(f.heading) * f.sp * .7;
    for (const g of list) { if (g === f) continue; const dx = o.x - g.o.position.x, dz = o.z - g.o.position.z, d = Math.hypot(dx, dz); if (d < T.SEP && d > 1e-4) { const k = (T.SEP - d) / T.SEP * 1.6; vx += dx / d * k; vz += dz / d * k; } }
    for (const s of S.spots) { const dx = o.x - s[0], dz = o.z - s[1], d = Math.hypot(dx, dz); if (d < T.AVOID && d > 1e-4) { const k = (T.AVOID - d) / T.AVOID * 1.8; vx += dx / d * k; vz += dz / d * k; } }
    const m = .35; if (o.x < B.x[0] + m) vx += (B.x[0] + m - o.x) * 3; if (o.x > B.x[1] - m) vx -= (o.x - B.x[1] + m) * 3; if (o.z < B.z[0] + m) vz += (B.z[0] + m - o.z) * 3; if (o.z > B.z[1] - m) vz -= (o.z - B.z[1] + m) * 3;
    const boost = f.burst ? 1 + f.burst : 1; if (f.burst) f.burst = Math.max(0, f.burst - dt * 1.5);
    f.heading = Math.atan2(vz / .7, vx); o.x = Math.min(B.x[1], Math.max(B.x[0], o.x + vx * dt * boost)); o.z = Math.min(B.z[1], Math.max(B.z[0], o.z + vz * dt * boost)); o.y = T.FISH_Y + Math.sin(t * 2.2 + f.i) * .02;
    const want = Math.atan2(vx, vz); let d = want - f.o.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.o.rotation.y += d * Math.min(1, dt * 6); } }
/** 통 안: 담긴 물고기가 그 안에서 논다(줄 맞추지 않는다 — 줄을 맞추면 세지 않고 모양으로 안다). */
function tubSwim(dt){ const tb = S.tub; if (!tb) return; const R0 = T.IN_TUB.r[1];
  tb.fish.forEach((f, k) => { const u = f.tub; if (!u) return; u.a += u.w * dt * .9; u.r += (Math.random() - .5) * dt * .2; u.r = Math.min(R0, Math.max(T.IN_TUB.r[0], u.r));
    f.o.position.x = Math.cos(u.a) * u.r * T.TUB_S; f.o.position.z = Math.sin(u.a) * u.r * T.TUB_S; if (!stage.tweens.some(w => w.o === f.o.position)) f.o.position.y = Math.sin(S.t * 3 + k) * .015; f.o.rotation.y = Math.atan2(-Math.sin(u.a) * u.w, Math.cos(u.a) * u.w); }); }
/** 다음에 누를 곳: 가까운 물고기 → (숨은 것뿐이면) 꼬리 → (바다가 비면 · 걸음 ②) 「다 담았어요」. (x, y) 를 주면 그 자리에서 가까운 것. */
function nextAt(x = innerWidth / 2, y = innerHeight / 2, tap = false){ if (!S.sea) return null; const vis = inSea().filter(f => f.st() !== 'hide'), hid = inSea().filter(f => f.st() === 'hide'), list = vis.length ? vis : hid;
  if (hid.length && !vis.length && tap) return null;   /* 헛누름은 숨은 꼬리를 짚지 않는다 — 「빠뜨리지 않기」의 답이라서(검수 5) */
  if (list.length) { let best = null, d0 = 1e9; for (const f of list) { const q = fishScreen(f), d = Math.hypot(q.x - x, q.y - y); if (d < d0) { d0 = d; best = { ...q, f }; } } return best; }
  if (S.step === 2 && !S.asked && !S.flying) return doneScreen(); return null; }
function cardAt(){ const b = $('choose').querySelector(`button[data-n="${S.p.N}"]`); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 10 }; }

window.__count = { S, R, M, E, T, stage, wallet, outing, abort, pressDone, scoop, nudge,
  fishAt: i => fishScreen(S.fish[i]), doneAt: () => doneScreen(), tubAt: () => stage.screenOf(S.tub.root.position.clone().add(V(0, .6, 0))),
  inSea: () => inSea().map(f => ({ i: f.i, st: f.st() })), left: () => S.sea ? R.left(S.sea) : -1, inTub: () => S.tub ? S.tub.fish.length : 0, spots: () => S.spots.map(s => stage.screenOf(V(s[0], .1, s[1]))) };
if (!GO_NOW) build().catch(e => { $('loading').textContent = '불러오지 못했어요'; console.error(e); });
