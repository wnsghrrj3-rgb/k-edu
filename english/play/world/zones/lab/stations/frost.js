/* 마법 연구소 · 자리 ④ 얼음과 불 (Hot / Cold) — 연구소 설계 v1 · 9장(L1-3-4 · 묶음 3-3), 주인공은 몬스터 고고.
 * 아침. 실험대 바닥이 넓게 내려다보인다(미끄럼이 이 자리의 무대). 왼쪽 걸이에 눈구름, 오른쪽 걸이에 햇살 등과 작은 난로 — 왼쪽 = Cold · 오른쪽 = Hot(빛도 푸르고 주황이다).
 * 첫 손길(설계 v1.1 · 0장): 실험대가 반반이다 — 왼쪽 절반은 벌써 빙판, 오른쪽 절반은 햇살 아래 따뜻한 바닥. 물건을 누르면 반대편으로 쭉 미끄러져 가고, 닿은 쪽의 온도가 된다("Cold!" / "Hot!").
 *   고고가 먼저 해 보이고(first.show), 누를 것에 빛 고리가 뛴다(engine/first.js). 가만히 놓여 있던 것은 미지근한 채로 둔다 — 낱말은 보낸 것이 그쪽에 닿았을 때 난다. 아래의 손 셋은 둘째 층이다.
 * 손이 하는 일 셋:
 *   들고 머물기 — 눈구름 · 햇살 등을 무엇 위에 두면 그것이 서서히 차가워지고 뜨거워진다(큰 것은 천천히, 작은 것은 금방). 문턱을 넘는 순간 "Cold!" / "Hot!".
 *   쏟기 — 물 대접을 길게 누르거나 옆으로 기울이면 실험대에 웅덩이("Water."). 웅덩이를 얼리면 빙판("Ice."), 더 쬐면 김이 되어 사라진다.
 *   밀기 — 물건을 손으로 민다. 맨 실험대에서는 금방 서고 빙판에서는 끝까지 미끄러져 다른 것을 맞힌다.
 * 쉬운 길: 눈구름 · 햇살 등을 누르고(고르고) 대상을 누르면 그 위에 가서 머문다 · 대접을 길게 누르면 쏟아진다.
 * 고고: 추우면 파래져 덜덜 · 오래 대면 꽁 얼었다가 깨고 나와 재채기 / 더우면 부채질하다 대접에 풍덩 / 빙판에서 미끄러져 엉덩방아 → 한 번 넘어지면 다음부터는 지친다(고고도 배운다).
 * 낱말 · 부탁 · 수치는 자료(data/lab.js 의 stations.frost)에서만 읽는다. 온도는 물건에 남고(겉은 engine/skin_temp.js), 웅덩이 · 빙판 · 눈 · 팝콘은 자리를 떠날 때 걷는다.
 * 소리는 전부 합성(임시). 자동 확인 명령: spill · cold:대상:초 · hot:대상:초(대상 = 물건 이름 · gogo · puddle · bowl · corn · spot) · walk:gogo:puddle(또는 walk:x:z) · shove:물건:쪽 · drop:물건 · sit:gogo · dunk:물건 · dbg */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, rand } from '../../../engine/stage.js?v=2';
import { sfx, tone, hiss } from '../../../engine/sound.js?v=2';
import { stepThing, centerOf, topOf, pickAt, THING } from '../../../engine/things.js?v=2';
import { createTempSkin } from '../../../engine/skin_temp.js?v=1';
import { LAB } from '../../../data/lab.js?v=1';

// ───────────────────────── 수치(준호가 만져 보고 바꾼다) ─────────────────────────
export const T = {
  ...LAB.stations.frost.T,                   // 자료의 수치 그대로(PLACE · HOVER · PAD · RATE · COLD_AT · HOT_AT · REARM · FREEZE_* · BOWL · PUDDLE · *_SLIDE · SLIP_V · BALL · POPCORN · SNOW · STEAM_GONE · IDLE_PLAY)
  // ── 아래는 자료에 없어 여기 둔 것(끝 보고에 적었다)
  HALF: { X: 0.12, EDGE: 3.62, Z: 1.24 }, FLOW: 2.0, FLOW_TO: 0.85, FLOW_GOGO: 0.8,   // 반반(자료 halves — x < 0 차가운 쪽 · x > 0 뜨거운 쪽): 경계에서 이만큼 안쪽부터 · 바닥 겉의 끝 · 보낸 것의 온도가 그쪽으로 흘러가는 빠르기(÷ 크기)와 닿는 값 · 고고는 여기까지만(꽁 얼지 않는다)
  SEND_V: 4.6, RINK_GRIP: 1.2, RINK_BOOST: 1.5, OTHER_GAP: 0.6,   // 누르면 반대편으로 미끄러져 가는 빠르기 · 처음부터 깔린 빙판이 물건을 붙잡는 힘(웅덩이 빙판은 0) · 그 위에서 고고의 걸음이 밀리는 정도 · 방금 들은 낱말이라도 다른 물건이 내면 이만큼만 지나도 말한다(첫 누르기가 조용하지 않게)
  GOGO_HOME: [-0.78, 0.2],                              // 고고가 서는 자리 — 자료의 PLACE.gogo [0.1, 0.6] 은 대접 바로 앞이라 대접이 고고에게 가려 눌리지 않는다. 여기서만 옆으로(사과 곁 — 해 보이기가 바로 시작되게) 비켜 세웠다(끝 보고에 적음 · 자료를 고치면 이 줄을 지운다)
  HANG_Z: 0, HOOK: [3.55, -1.1], STOVE: [3.2, -0.86],   // 도구가 걸려 있는 깊이(PLACE.cloud · lamp 는 [x, 높이]로 읽었다) · 걸이 기둥 · 난로 자리
  HOLD_Y: 1.75, FOLLOW: 16, FLY: 6, TOOL_BACK: 0.35,         // 든 도구가 떠 있는 높이 · 손을 따라오는 빠르기 · 혼자 날아갈 때 빠르기 · 놓은 뒤 걸이로 돌아가기까지(초)
  GRAB_PX: 78, TAP_SEC: 0.3, TAP_PX: 14, DWELL: 0.12,   // 도구를 집었다고 보는 거리 · 이보다 짧고 덜 움직였으면 「누르기」 · 이만큼 머물러야 닿기 시작한다(지나가기만 할 때는 아무 일 없게)
  PARK: 5, ARM: 8,                                      // 쉬운 길: 대상 위에 머무는 시간 · 고른 채 아무것도 안 누르면 풀리는 시간
  EDGE: { X: 3.38, Z0: -1.0, Z1: 1.02 },                // 물건이 미끄러질 수 있는 범위(실험대 끝)
  GRIP: 6, COLD_GRIP: 0.2,                              // 맨 실험대가 물건을 붙잡는 힘(초당 줄어드는 빠르기) — BENCH_SLIDE 만으로는 「금방 서지」 않아서 · 언 물건은 이만큼만 붙잡힌다(얼음 사과는 멀리 간다)
  PUSH: 9, PUSH_MAX: 6.5, SHOVE_V: 4.4,                 // 손으로 밀 때 따라오는 빠르기 · 가장 빠른 빠르기 · 자동 확인에서 미는 빠르기
  WALL: 0.4, HIT_V: 0.8, HIT_GIVE: 0.8, HIT_KEEP: 0.3, SPIN: 10,   // 실험대 끝에서 튕기는 정도 · 이보다 세게 부딪혀야 「맞혔다」 · 맞은 쪽이 받는 몫 · 민 쪽에 남는 몫 · 빙글 도는 세기
  BOWL_HOP_V: 1.6, BOWL_HOP: [2.8, 3.0, 3.6],           // 이보다 빠르게 대접에 닿으면 폴짝 넘는다 · 넘을 때 빠르기 범위와 뛰는 힘
  TOSS: 4.4,                                            // 공을 누르면 이만큼 튀어 올랐다 떨어진다(떨어뜨려 보기)
  ICE_BOOST: 2, SLIP_PUSH: 1.2,                       // 빙판에서는 발이 밀려 걸음이 이만큼 빨라진다(그래서 SLIP_V 를 넘는다) · 미끄러질 때 더 밀리는 정도
  FREEZE_K: 1.1, PUDDLE_K: 1.5, MELT_AT: -0.3, REFILL: [0.9, 1.4],   // 대접 · 웅덩이가 어는(녹는) 빠르기(1/초) · 이보다 따뜻해지면 녹기 시작 · 쏟은 뒤 대접이 다시 차기까지(기다림, 차오름)
  SLOTS: { front: [0, 0.45], left: [-1.8, 0.55], right: [1.8, 0.55] },   // 웅덩이가 생기는 자리(대접에서)
  HOT_HOLD: 1.0, DIP_STAY: 2.0, SEAT: 0.475, SIT_STAY: 2.2,   // 고고가 가장 뜨거운 채 이만큼 있으면 달아난다 · 대접에 앉아 있는 시간 · 의자 앉는 높이 · 앉아 있는 시간
  POP_EVERY: 0.13, POP_KEEP: 3, CORN_BACK: 7,           // 옥수수가 터지는 사이 · 고고에게 던져 줄 알 수 · 접시가 다시 차기까지
  SPOT: [-1.75, 0.62], ROLL: 2.2, MELT: 1.5,            // 자동 확인의 빈 자리 · 눈 덩이를 굴리는 시간 · 눈이 녹는 시간
  FURN: 1.25, LIGHT: [30, 34],                          // 가구가 나오는 빠르기(1/초 — 0.8초) · 왼쪽 푸른 빛 · 오른쪽 주황 빛의 세기
  SHAKE: 0.05,
};
const COL = { snow: '#ffffff', frost: '#cfeaff', ember: '#ffb347', drop: '#8fd0f5', water: '#4aa8e6', waterHot: '#9adbe6', ice: '#dff3ff', pop: '#fff6e2' };
const LOOPS = new Set(['shiver', 'fan', 'skate', 'warm', 'rollSnow']);

/** C = 껍데기가 넘기는 것(lab.js 의 C). 모형을 받고 자리를 돌려준다(처음 갈 때 한 번). */
export async function create(C) {
  const { stage, scene, camera, gogo, brain, things, GOGO, targets, fx, voice, seen, P, name, say } = C, s = gogo.state, B = brain.B, { run, wait, until, walk, face, hop } = brain;
  const DATA = LAB.stations.frost, word = k => LAB.words[k].text, W_COLD = LAB.words.cold, W_HOT = LAB.words.hot, BIG_AT = parseFloat(LAB.thingState.size.words.big.replace(/[^\d.]/g, '')), DUNK_SMALL = LAB.stations.potion.T.DUNK_SMALL, HEX = LAB.stations.potion.colors.hex;
  const gl = await new GLTFLoader().loadAsync(new URL('../../../assets/lab_frost.glb?v=1', import.meta.url).href), part = {};
  gl.scene.traverse(o => { if (o.isMesh) part[o.name] = o; }); for (const o of Object.values(part)) { o.castShadow = true; o.receiveShadow = true; o.removeFromParent(); }
  const ownSkin = !C.tempSkin, skin = createTempSkin(C), puffs = skin.puffs;      // 온도 겉: 껍데기가 이미 만들었으면 그것을 쓰고, 아니면 여기서 만들어 step 에서 임시로 돌린다
  const v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), vWord = new THREE.Vector3(), TH = Object.values(things), chair = things.chair, cup = things.cup, ball = things.ball;
  const L = { clock: 0, here: false, vis: 0, lastBy: {}, showTok: null, popSaid: false, bCold: false, bHot: false, sitTok: null, dipTok: null, catchTok: null, snowTok: null, idleN: 0 };
  const G = { mode: 'free', t: 0, under: null, fled: null, freezeT: 0, hotT: 0, learned: false, skating: false, vx: 0, vz: 0, thud: false, dur: 1.4, px: 0, pz: 0, tick: 0 };   // 고고의 사정

  // ── 소리(임시 · 합성): 쩍 얼음 · 치익 김 · 사락사락 눈 · 미끄덩 · 팡 옥수수 · 딱 언 공 · 뚝뚝 녹는 물
  const crack = () => { tone(1300, 420, 0.1, { type: 'square', g: 0.05 }); sfx.clink(); }, steamS = (g = 0.1) => { hiss(0.6, { g, f: 4200, q: 0.7 }); sfx.fizz(); };
  const snowS = () => hiss(0.05, { g: 0.02, f: rand(5200, 7000), q: 2 }), slipS = () => { tone(1250, 330, 0.6, { g: 0.09 }); hiss(0.5, { g: 0.05, f: 2600, q: 3 }); };
  const popS = () => { tone(rand(800, 1000), 1500, 0.05, { type: 'square', g: 0.07 }); hiss(0.04, { g: 0.1, f: 2500 }); }, clickS = () => { tone(2200, 1800, 0.03, { type: 'square', g: 0.09 }); tone(300, 200, 0.04, { g: 0.2 }); };
  const boingS = () => tone(180, 420, 0.22, { g: 0.2 }), dripS = () => tone(rand(900, 1400), 500, 0.05, { g: 0.04 });
  // ── 알갱이
  const flakes = (p, n = 1, spread = 0.25, down = 1.5) => puffs.emit(p, COL.snow, n, spread, { v: [0, -down, 0], vr: 0.18, size: 0.075, a: 0.95, life: [0.5, 0.8], flat: true });
  const drops = (p, n = 8, sp = 2.4, color = COL.drop) => puffs.emit(p, color, n, 0.1, { v: [0, sp, 0], vr: sp * 0.55, size: 0.085, a: 0.95, g: 8, life: [0.45, 0.85] });
  const frostBurst = (p, n = 12, spread = 0.3) => { fx.spark(p, COL.frost, n, spread, 1.1); puffs.emit(p, COL.snow, Math.ceil(n / 2), spread, { vr: 0.5, size: 0.07, a: 0.95, g: 1.2, life: [0.5, 1] }); };

  // ───────────────────────── 가구(실험대에서 솟고 걸이가 올라온다) ─────────────────────────
  const furn = [], rise = (obj, x, z, drop) => { obj.position.set(x, -drop, z); obj.visible = false; scene.add(obj); furn.push({ obj, drop }); return obj; };
  rise(part.hookL, -T.HOOK[0], T.HOOK[1], 2.7); rise(part.hookR, T.HOOK[0], T.HOOK[1], 2.7);
  const stove = rise(new THREE.Group().add(part.stove, part.stoveGlow), T.STOVE[0], T.STOVE[1], 1.2); part.stoveGlow.material = new THREE.MeshBasicMaterial({ color: '#ffb347', toneMapped: false }); part.stoveGlow.castShadow = false; part.stove.material = part.stove.material.clone(); part.stove.material.color.set('#6f6a80');      // 주황 빛에 씻겨 항아리처럼 보이지 않게 쇠빛을 눌러 둔다
  rise(part.hatch, T.PLACE.bowl[0], T.PLACE.bowl[1], 0.03); part.hatch.castShadow = false;
  // 푸른 눈빛(왼쪽)과 난로 빛(오른쪽) — 낱말의 뜻이 화면의 자리와 색으로도 읽힌다
  const lightL = new THREE.PointLight('#6fb6ff', 0, 9, 1.5), lightR = new THREE.PointLight('#ff9438', 0, 9, 1.5); lightL.position.set(-2.9, 2.1, 1.7); lightR.position.set(2.9, 1.9, 1.7); scene.add(lightL, lightR);

  // ── 물 대접: 물(쏟으면 비고 다시 찬다) · 언 얼음덩이(꺼낼 수 있다) · 물든 물
  const iceMat = () => new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.12, metalness: 0, emissive: '#8fd0ff', emissiveIntensity: 0.18, envMapIntensity: 1.6 });
  const bowl = { kind: 'bowl', name: 'bowl', x: T.PLACE.bowl[0], z: T.PLACE.bowl[1], r: T.BOWL.r, temp: 0, fCold: false, fHot: false, iceK: 0, isIce: false, fill: 1, refill: 0, tint: null, tintK: 0, lean: 0, dx: 0, dz: 1, wob: 0, wv: 0, quiet: false, grp: new THREE.Group() };
  const bowlWater = new THREE.Mesh(new THREE.CircleGeometry(0.445, 36).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: COL.water, transparent: true, opacity: 0.84, roughness: 0.06, envMapIntensity: 1.6 })); bowlWater.position.y = 0.2; bowlWater.receiveShadow = true;
  part.icecube.material = iceMat(); bowl.grp.add(part.bowl, bowlWater, part.icecube); rise(bowl.grp, bowl.x, bowl.z, 0.75);
  const cWater = new THREE.Color(COL.water), cHot = new THREE.Color(COL.waterHot), cTint = new THREE.Color(), cWhite = new THREE.Color('#ffffff'), cA = new THREE.Color();
  // ── 꺼낸 얼음덩이(미끄러지는 물건 하나)
  const lump = { kind: 'lump', name: 'ice', on: false, x: 0, z: 0, y: 0, r: 0.4, size: 1, temp: -1, fsx: 0, fsz: 0, fOver: 0, fVy: 0, fIce: false, fShoved: false, k: 0, melt: 0, hopT: -1, x0: 0, z0: 0, x1: 0, z1: 0, mesh: part.icecube.clone() };
  lump.mesh.material = iceMat(); lump.mesh.visible = false; scene.add(lump.mesh);
  // ── 웅덩이 셋까지: 물(투명한 파랑) 위로 얼음이 덮인다
  const iceMap = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#d9efff'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${110 + Math.random() * 50},${185 + Math.random() * 30},250,${0.14 + Math.random() * 0.18})`; x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, 12 + Math.random() * 34, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineCap = 'round';
    for (let i = 0; i < 22; i++) { x.lineWidth = 1 + Math.random() * 2.2; const a = Math.random() * 7, px = Math.random() * 256, py = Math.random() * 256, l = 14 + Math.random() * 40; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; return map;
  })();
  // ── 반반 바닥(첫 손길): 왼쪽 절반은 처음부터 빙판, 오른쪽 절반은 햇살에 데워진 나무 — 경계는 들쭉날쭉한 얼음 끝으로 한눈에 보인다
  const halfShape = sgn => { const sh = new THREE.Shape(), E = T.HALF.EDGE, Z = T.HALF.Z, n = 22; sh.moveTo(sgn * E, -Z); sh.lineTo(sgn * E, Z); for (let i = 0; i <= n; i++) { const z = Z - 2 * Z * i / n; sh.lineTo(sgn * (0.07 + 0.06 * Math.sin(z * 5.3) + 0.04 * Math.sin(z * 11 + 1.3)), z); } return new THREE.ShapeGeometry(sh).rotateX(Math.PI / 2); };
  const rinkMap = new THREE.CanvasTexture(iceMap.image); rinkMap.colorSpace = THREE.SRGBColorSpace; rinkMap.wrapS = rinkMap.wrapT = THREE.RepeatWrapping; rinkMap.repeat.set(0.42, 0.42);
  const rink = new THREE.Mesh(halfShape(-1), new THREE.MeshStandardMaterial({ map: rinkMap, transparent: true, opacity: 0, roughness: 0.2, emissive: '#8fd0ff', emissiveIntensity: 0.1, depthWrite: false, side: THREE.DoubleSide }));
  const warm = new THREE.Mesh(halfShape(1), new THREE.MeshBasicMaterial({ color: '#ff9a3c', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  rink.position.y = 0.004; warm.position.y = 0.004; rink.receiveShadow = true; rink.visible = warm.visible = false; scene.add(rink, warm);
  const blob = seed => { const g = new THREE.CircleGeometry(1, 44), p = g.attributes.position; for (let i = 1; i < p.count; i++) { const a = Math.atan2(p.getY(i), p.getX(i)), k = 1 + 0.07 * Math.sin(a * 3 + seed) + 0.05 * Math.sin(a * 5 + seed * 2.3) + 0.03 * Math.sin(a * 8 + seed * 4.1); p.setXY(i, p.getX(i) * k, p.getY(i) * k); } return g.rotateX(-Math.PI / 2); };
  const puddles = Array.from({ length: T.PUDDLE.max }, (_, i) => {
    const geo = blob(i * 1.7 + 0.4), water = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COL.water, transparent: true, opacity: 0.6, roughness: 0.05, envMapIntensity: 1.8, depthWrite: false })), ice = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: iceMap, transparent: true, opacity: 0, roughness: 0.22, emissive: '#8fd0ff', emissiveIntensity: 0.08, depthWrite: false }));
    water.receiveShadow = ice.receiveShadow = true; water.visible = ice.visible = false; water.renderOrder = 1; ice.renderOrder = 1; scene.add(water, ice);
    return { kind: 'puddle', name: 'puddle', i, on: false, gone: false, x: 0, z: 0, r: T.PUDDLE.r, k: 0, temp: 0, iceK: 0, isIce: false, heat: 0, born: 0, tint: null, water, ice };
  });
  // ── 옥수수 접시와 팝콘
  const corn = { kind: 'corn', name: 'corn', x: T.PLACE.corn[0], z: T.PLACE.corn[1], r: 0.34, temp: 0, state: 'full', t: 0, n: 0, keep: 0, keepT: 0, k: 1, kv: 0, wob: 0, wv: 0, grp: new THREE.Group() };
  corn.grp.add(part.plate, part.kernels); rise(corn.grp, corn.x, corn.z, 0.5);
  const pieces = Array.from({ length: T.POPCORN.n }, () => { const m = part.popcorn.clone(); m.visible = false; scene.add(m); return { m, st: 'off', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, rv: 0, k: 0, t: 0, dur: 0.5, x0: 0, y0: 0, z0: 0 }; }); let pieceN = 0;
  // ── 눈 더미 → 눈사람(한 번에 하나)
  const snow = { kind: 'snow', name: 'snow', state: 'none', x: 0, z: 0, r: T.SNOW.r, k: 0, roll: 0, man: 0, head: 0, melt: 0, wob: 0, wv: 0, grp: new THREE.Group(), pile: part.snowpile, body: part.snowball, headM: part.snowball.clone(), rollM: part.snowball.clone() };
  snow.headM.add(part.snowface); snow.grp.add(snow.pile, snow.body, snow.headM); snow.grp.visible = false; scene.add(snow.grp); snow.rollM.visible = false; scene.add(snow.rollM);
  const spot = { kind: 'spot', name: 'spot', x: 0, z: 0 };
  // ── 고고가 갇히는 얼음 조각 · 더듬이 끝 고드름 · 의자 고드름 · 컵에 담긴 물과 얼음
  const block = part.block; block.material = new THREE.MeshStandardMaterial({ color: '#cfeeff', transparent: true, opacity: 0.5, roughness: 0.06, envMapIntensity: 2, depthWrite: false, emissive: '#7cc6ff', emissiveIntensity: 0.14 }); block.castShadow = block.receiveShadow = false; block.visible = false; block.renderOrder = 3; scene.add(block);
  const blk = { on: false, k: 0, v: 0, jig: 0, jv: 0 };
  const cicleGeo = new THREE.ConeGeometry(0.03, 0.16, 6).rotateX(Math.PI).translate(0, -0.08, 0), cicleMat = new THREE.MeshStandardMaterial({ color: '#e6f6ff', roughness: 0.15, emissive: '#8fd0ff', emissiveIntensity: 0.25 }), cicle = () => { const m = new THREE.Mesh(cicleGeo, cicleMat); m.visible = false; return m; };
  const antC = [['ant2_L', cicle()], ['ant2_R', cicle()]]; for (const [, m] of antC) scene.add(m);
  const chairC = [[-0.2, 0.26, 1], [0.02, 0.28, 1.35], [0.21, 0.25, 0.8]].map(([x, z, k]) => { const m = cicle(); m.position.set(x, 0.385, z); m.userData.k = k; chair.obj.add(m); return m; });
  const cupWater = new THREE.Mesh(new THREE.CircleGeometry(0.345, 28).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: COL.water, transparent: true, opacity: 0.82, roughness: 0.06 })); cupWater.position.y = 0.5; cupWater.visible = false; cup.obj.add(cupWater);
  const cupIce = [[-0.1, 0.06, 0.4], [0.12, -0.08, -0.5]].map(([x, z, r]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.13, 0.15), cicleMat); m.position.set(x, 0.52, z); m.rotation.set(0.3, r, 0.2); m.visible = false; cup.obj.add(m); return m; });

  // ── 도구 둘: 눈구름(왼쪽 걸이) · 햇살 등(오른쪽 걸이)
  part.sun.material = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }); part.sun.castShadow = false; part.cloud.castShadow = false;
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.0, 20, 1, true).translate(0, -0.5, 0), new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); beam.position.y = -0.1;
  function makeTool(kind, dir, x, y, from, ...meshes) {
    const obj = new THREE.Group(); obj.add(...meshes); obj.visible = false; scene.add(obj); const rest = new THREE.Vector3(x, y, T.HANG_Z);
    return { kind, dir, obj, rest, from: new THREE.Vector3(...from), pos: rest.clone(), to: rest.clone(), state: 'rest', back: 0, aim: null, parkT: 0, armed: false, armT: 0, on: null, dwell: 0, tilt: 0, kick: 0, kv: 0, puff: 1 };
  }
  const CLOUD = makeTool('cloud', -1, ...T.PLACE.cloud, [-0.35, 2.6, -1.5], part.cloud), LAMP = makeTool('lamp', 1, ...T.PLACE.lamp, [T.PLACE.lamp[0], 4.8, T.HANG_Z], part.lamp, part.sun, beam), tools = [CLOUD, LAMP];
  CLOUD.other = LAMP; LAMP.other = CLOUD;

  // ───────────────────────── 대상 ─────────────────────────
  for (const t of [...TH, GOGO]) Object.assign(t, { fsx: 0, fsz: 0, fspin: 0, fspinV: 0, fIce: false, fShoved: false, fOver: 0, fCold: false, fHot: false, fVy: 0, fSend: null, fSent: false });
  const D = { t: null, ph: '', k: 0, x0: 0, z0: 0 };                                     // 대접에 담그는 중인 작은 물건
  const usable = t => (t.state === 'home' || t.state === 'up' || t.state === 'down') && D.t !== t;
  const headTop = out => out.set(s.pos.x, s.y + 1.1 * s.size, s.pos.z);
  const topY = t => t.kind === 'bowl' ? 0.3 : t.kind === 'corn' ? 0.14 : t.kind === 'puddle' || t.kind === 'spot' ? 0 : t.kind === 'snow' ? (snow.state === 'man' ? 0.95 : 0.3) : t.kind === 'lump' ? 0.4 : t === GOGO ? s.y + 1.05 * s.size : t.y + (t.ball ? t.r * 2 : t.h) * t.size;
  const topV = (t, out) => out.set(t.x, topY(t) + (t.kind ? 0.25 : 0), t.z);
  const valid = t => !!t && (t.kind === 'puddle' ? t.on && !t.gone : t.kind === 'snow' ? snow.state !== 'none' : t.kind === 'lump' ? lump.on : t.kind ? true : t === GOGO || usable(t));
  const hoverOf = (t, out) => t.kind === 'puddle' ? out.set(t.x - 0.55, 1.25, t.z + 0.35) : out.set(t.x, clamp(topY(t) + T.HOVER, 1.3, 3.0), t.z);
  const onPuddleIce = (x, z) => puddles.some(p => p.on && !p.gone && p.iceK > 0.6 && Math.hypot(p.x - x, p.z - z) < p.r * p.k * 0.95), onRink = (x, z) => L.vis > 0.6 && x < -0.03 && x > -T.HALF.EDGE;
  const onIce = (x, z) => onRink(x, z) || onPuddleIce(x, z);
  const inPuddle = (x, z) => puddles.find(p => p.on && !p.gone && p.k > 0.5 && Math.hypot(p.x - x, p.z - z) < p.r * p.k * 0.9);
  const applied = t => tools.some(w => w.on === t), gogoFree = () => G.mode === 'free' && !G.under && !B.hop;
  /** 그 자리(x, z) 아래에 있는 것: 가장 가까운 것 하나(고고 · 물건 · 대접 · 접시 · 얼음덩이 · 눈) → 없으면 웅덩이 → 없으면 빈 자리. */
  function under(x, z) {
    let best = null, bd = 1; const tryT = (t, r) => { const d = Math.hypot(t.x - x, t.z - z) / (T.PAD + r * 0.5); if (d < bd) { bd = d; best = t; } };
    if (!B.hop) tryT(GOGO, 0.36 * s.size); for (const t of TH) if (usable(t)) tryT(t, t.r * t.size);
    tryT(bowl, bowl.r); tryT(corn, corn.r); if (lump.on) tryT(lump, lump.r); if (snow.state !== 'none') tryT(snow, snow.r);
    if (best) return best; const p = inPuddle(x, z); if (p) return p;
    if (Math.abs(x) < T.EDGE.X && z > T.EDGE.Z0 && z < T.EDGE.Z1 + 0.15) { spot.x = x; spot.z = z; return spot; } return null;
  }

  // ───────────────────────── 문턱을 넘는 순간 ─────────────────────────
  function crossing(t, top) {
    const mine = t === GOGO, o = { by: t.name, pitch: mine ? clamp(1.25 - (s.size - 1) * 0.9, 0.3, 2) : undefined };
    const gapFor = w => { const g = L.lastBy[w] && L.lastBy[w] !== t.name ? T.OTHER_GAP : undefined; L.lastBy[w] = t.name; return g; };      // 고고가 해 보인 직후 아이가 다른 것으로 같은 낱말을 내면 곧바로 말한다
    if (!t.fCold && t.temp <= T.COLD_AT) { t.fCold = true; voice.word(W_COLD.text + '!', top, { ...o, cls: W_COLD.cls, gap: gapFor('cold') }); crack(); frostBurst(top(), 14, 0.3); if (first.t === t) first.done = true; onCross(t, -1); } else if (t.fCold && t.temp > T.COLD_AT + T.REARM) t.fCold = false;
    if (!t.fHot && t.temp >= T.HOT_AT) { t.fHot = true; voice.word(W_HOT.text + '!', top, { ...o, cls: W_HOT.cls, gap: gapFor('hot') }); if (first.t === t) first.done = true; sfx.spark(false); steamS(0.06); fx.spark(top(), '#ffb060', 14, 0.3, 1.5); onCross(t, 1); } else if (t.fHot && t.temp < T.HOT_AT - T.REARM) t.fHot = false;
  }
  function onCross(t, dir) {
    if (t === GOGO) { say(dir < 0 ? 'brr' : 'hot'); return; }
    if (!t.kind && dir < 0) seen.add(t.size >= BIG_AT ? 'bigSlow' : t.size <= 0.7 ? 'smallFast' : 'frosted');      // 큰 것은 서리가 천천히 올라 이제야 다 찼다 · 작은 것은 눈 깜짝할 새
    if (!gogoFree() || B.tok || C.ask.active) return;
    if (t === chair) run(sitTask); else if (t === cup && dir > 0) run(warmAtCup); else if (!t.kind && dir < 0) run(tok => touchCold(tok, t)); else { gogo.lookAt(topV(t, v3)); gogo.setMood('wow', 1.1); say('wow'); }
  }

  // ───────────────────────── 고고가 하고 싶은 일 ─────────────────────────
  /** 갈 곳이 물건 · 대접 속이면 그 바깥으로 민다(비켜 가느라 끝내 닿지 못하는 일이 없게). */
  function clear(x, z, skip) {
    for (let n = 0; n < 2; n++) { for (const t of TH) { if (t === skip || !usable(t)) continue; const dx = x - t.x, dz = z - t.z, d = Math.hypot(dx, dz) || 0.001, need = t.r * t.size * 0.85 + 0.38 * s.size; if (d < need) { x = t.x + dx / d * need; z = t.z + dz / d * need; } }
      const dx = x - bowl.x, dz = z - bowl.z, d = Math.hypot(dx, dz) || 0.001, need = bowl.r + 0.36 * s.size; if (d < need) { x = bowl.x + dx / d * need; z = bowl.z + dz / d * need; } }
    return [clamp(x, -C.BENCH.X, C.BENCH.X), clamp(z, C.BENCH.Z0, C.BENCH.Z1)];
  }
  const landed = async tok => { if (B.hop) await until(tok, () => !B.hop); };
  const loopOff = () => { if (s.act && LOOPS.has(s.act.name)) s.act = null; };
  async function approach(tok, t, gap = 0.14) { const side = s.pos.x >= t.x ? 1 : -1, r = t.kind ? t.r : t.r * t.size; await walk(tok, ...clear(t.x + side * (r + 0.4 * s.size + gap), t.z + 0.35, t)); await face(tok, Math.atan2(t.x - s.pos.x, t.z - s.pos.z)); }
  /** 도구를 뗀 뒤: 더우면 대접으로 뛰어들고, 추우면 덜덜 떤다(그러다 "Hot, please!" 를 조른다 — 부탁). */
  async function afterGogo(tok) {
    await landed(tok);
    if (GOGO.temp >= T.HOT_AT) return coolDip(tok);
    if (GOGO.temp <= T.COLD_AT) { say('brr'); gogo.act('shiver'); gogo.setMood('cold', 1.6); await wait(tok, 1.4); }
    else { gogo.setMood('smile', 1); await wait(tok, 0.4); }
    await face(tok, 0);
  }
  /** 더워서 부채질하다 물 대접에 풍덩 — 치익 김. */
  async function coolDip(tok) {
    await landed(tok); gogo.act('fan'); gogo.setMood('hot', 3); say('hot'); await wait(tok, 1.1); loopOff();
    if (bowl.temp > 0.45 || bowl.fill < 0.6) { gogo.act('fan'); gogo.setMood('hot', 2); await wait(tok, 2); loopOff(); GOGO.temp = Math.min(GOGO.temp, 0.5); await face(tok, 0); return; }   // 물이 뜨겁거나 비었으면 부채질만
    await walk(tok, bowl.x + 0.15, bowl.z + bowl.r + 0.5); hop(bowl.x, bowl.z, 0.06, 'bench', 0.5); await until(tok, () => !B.hop);
    L.dipTok = tok; seen.add('coolDip'); GOGO.temp = 0.05; GOGO.fHot = false; if (bowl.temp < T.MELT_AT) bowl.temp = 0; else bowl.temp = clamp(bowl.temp + 0.25, -1, 0.5);
    drops(v3.set(bowl.x, 0.25, bowl.z), 26, 3.2); puffs.steam(v3, 16, 0.4, 0.9, 1.3); steamS(0.14); sfx.splat(); stage.shake(T.SHAKE); bowl.wv += 9;
    gogo.setMood('joy', T.DIP_STAY); gogo.pose('sway', 0.5); say('joy'); await wait(tok, T.DIP_STAY); gogo.pose('sway', 0);
    L.dipTok = null; hop(bowl.x + 0.2, clamp(bowl.z + bowl.r + 0.55, C.BENCH.Z0, C.BENCH.Z1), 0, 'bench', 0.45); await until(tok, () => !B.hop); drops(v3.set(s.pos.x, 0.3, s.pos.z), 8, 1.6); await face(tok, 0);
  }
  /** 의자에 앉아 본다: 뜨거우면 벌떡 뛰어올라 엉덩이에 부채질, 차가우면 벌떡 일어나 덜덜. */
  async function sitTask(tok) {
    await landed(tok); const t = chair;
    if (!usable(t) || t.size < 0.75 || s.size > t.size * 1.25) { await approach(tok, t); gogo.lookAt(topOf(t, v3)); gogo.setMood('smile', 1); say('hm'); await wait(tok, 0.9); await face(tok, 0); return; }
    L.sitRun = tok; { const dx = s.pos.x - t.x, dz = Math.max(s.pos.z - t.z, 0.25), n = Math.hypot(dx, dz) || 1; if (n > 1.65) await walk(tok, ...clear(t.x + dx / n * 1.6, t.z + dz / n * 1.6, t)); }      // 멀리서 폴짝 뛰어 올라앉는다
    hop(t.x, t.z + 0.03, T.SEAT * t.size, 'bench', 0.6); await until(tok, () => !B.hop); L.sitTok = tok; t.tvz += 3;
    const hot = t.temp >= T.HOT_AT, cold = t.temp <= T.COLD_AT;
    if (hot || cold) {
      await wait(tok, 0.3); seen.add(hot ? 'hotSeat' : 'coldSeat'); say(hot ? 'hot' : 'brr'); gogo.setMood(hot ? 'hot' : 'cold', 2.4); stage.shake(T.SHAKE * 0.5); if (hot) { steamS(0.08); puffs.steam(v3.set(t.x, T.SEAT * t.size + 0.1, t.z + 0.1), 8, 0.2, 0.8); } else frostBurst(v3.set(t.x, T.SEAT * t.size + 0.1, t.z), 8, 0.2);
      GOGO.temp = clamp(GOGO.temp + (hot ? 0.3 : -0.3), -0.55, 0.55); L.sitTok = null; s.y += 0.001; hop(t.x + 0.15, clamp(t.z + 1.0, C.BENCH.Z0, C.BENCH.Z1), 0, 'bench', 0.7); B.hop.apex = 1.1 * s.size; await until(tok, () => !B.hop);
      if (hot) { await face(tok, Math.PI); gogo.act('fan'); for (let i = 0; i < 5; i++) { puffs.steam(v3.set(s.pos.x, 0.45 * s.size, s.pos.z + 0.3 * s.size), 2, 0.1, 0.6, 0.7); await wait(tok, 0.32); } loopOff(); }   // 돌아서서 엉덩이에 부채질
      else { gogo.act('shiver'); await wait(tok, 1.2); loopOff(); }
    } else { gogo.setMood('smile', T.SIT_STAY); gogo.pose('sway', 0.4); say('joy'); seen.add('sit'); await wait(tok, T.SIT_STAY); gogo.pose('sway', 0); L.sitTok = null; hop(t.x, clamp(t.z + 0.85, C.BENCH.Z0, C.BENCH.Z1), 0, 'bench', 0.4); await until(tok, () => !B.hop); }
    await face(tok, 0);
  }
  /** 언 물건을 만져 보고 손을 호호 분다. */
  async function touchCold(tok, t) {
    await landed(tok); gogo.lookAt(centerOf(t, v3)); gogo.setMood('wow', 0.8); say('wow'); await wait(tok, 0.5); await approach(tok, t); if (!usable(t)) return;
    gogo.pose('poke', 1); await wait(tok, 0.4); t.tvx += 4; sfx.clink(); gogo.pose('poke', 0); seen.add('coldTouch'); gogo.setMood('blowing', 1.3); gogo.pose('hands', 1); say('brr'); await wait(tok, 1.2); gogo.pose('hands', 0); await face(tok, 0);
  }
  /** 김 나는 컵에 손을 쬔다. */
  async function warmAtCup(tok) {
    await landed(tok); await approach(tok, cup, 0.2); if (cup.temp < T.HOT_AT - 0.2) return; gogo.lookAt(topOf(cup, v3)); gogo.act('warm'); gogo.pose('reach', gogo.info.warm ? 0 : 1); gogo.setMood('smile', 2.6); seen.add('warmCup');
    await wait(tok, 2.5); loopOff(); gogo.pose('reach', 0); GOGO.temp = clamp(GOGO.temp + 0.2, -1, 0.5); await face(tok, 0);
  }
  /** 팝콘이 튀면 달려가 입으로 받아먹는다(남겨 둔 알을 하나씩 던져 준다). */
  async function popTask(tok) {
    await landed(tok); L.catchTok = tok; gogo.lookAt(v3.set(corn.x, 0.6, corn.z)); gogo.act('surprise', { mood: 'wow' }); say('wow'); await wait(tok, 0.5);
    await walk(tok, ...clear(corn.x - 1.5, corn.z - 0.05)); await face(tok, Math.PI / 2);
    while (corn.keep > 0) {
      corn.keep--; const p = launch(true); gogo.lookAt(v3.set(corn.x, 1.6, corn.z)); gogo.act('catchMouth'); gogo.setMood('want', 0.7); await wait(tok, p.dur);
      p.st = 'off'; p.m.visible = false; seen.add('popcorn'); sfx.munch(1); gogo.setMood('chewA', 0.2); await wait(tok, 0.18); gogo.setMood('chewB', 0.25); await wait(tok, 0.25);
    }
    say('yum'); gogo.act('jump', { mood: 'joy' }); await wait(tok, 0.9); await face(tok, 0);
  }
  /** 눈 더미를 굴려 눈사람을 만든다. */
  async function snowmanTask(tok) {
    await landed(tok); if (snow.state !== 'pile' || snow.k < 1) return; gogo.lookAt(v3.set(snow.x, 0.2, snow.z)); gogo.setMood('wow', 0.8); say('wow'); await wait(tok, 0.5);
    const side = s.pos.x >= snow.x ? 1 : -1; await walk(tok, ...clear(snow.x + side * 0.8, snow.z + 0.08)); await face(tok, -side * Math.PI / 2); if (snow.state !== 'pile') return;
    L.snowTok = tok; snow.state = 'roll'; snow.roll = 0; gogo.act('rollSnow'); gogo.pose('lean', gogo.info.rollSnow ? 0 : 1); gogo.setMood('smile', T.ROLL);
    await until(tok, () => snow.roll >= 1, T.ROLL + 1); loopOff(); gogo.pose('lean', 0);
    snow.state = 'man'; snow.man = 0.01; snow.head = 0; L.snowTok = null; sfx.pop(); await wait(tok, 0.35); snow.head = 0.01; sfx.pop(); frostBurst(v3.set(snow.x, 0.8, snow.z), 10, 0.3); seen.add('snowman');
    gogo.lookAt(v3.set(snow.x, 0.7, snow.z)); gogo.act('cheer', { mood: 'joy' }); say('joy'); await wait(tok, 1.2); await face(tok, 0);
  }
  /** 가만두면 혼자 논다: 추우면 난로에 손을 쬐고, 빙판이 있으면 지치고, 눈 더미가 있으면 굴리고, 아니면 눈구름 밑에서 눈송이를 받아먹는다. 낱말은 내지 않는다. */
  async function idlePlay(tok) {
    const rink = puddles.find(p => p.on && !p.gone && p.isIce);
    if (GOGO.temp <= T.COLD_AT) { await walk(tok, T.STOVE[0] - 0.85, T.STOVE[1] + 0.6); await face(tok, Math.atan2(T.STOVE[0] - s.pos.x, T.STOVE[1] - s.pos.z)); gogo.act('warm'); gogo.pose('reach', gogo.info.warm ? 0 : 1); gogo.setMood('smile', 3); seen.add('stoveWarm'); L.warming = tok; await wait(tok, 3); loopOff(); gogo.pose('reach', 0); }
    else if (GOGO.temp >= T.HOT_AT) return coolDip(tok);
    else if (snow.state === 'pile' && snow.k >= 1) return snowmanTask(tok);
    else if (rink && L.idleN++ % 2 === 0) { seen.add('rinkPlay'); await crossRink(tok, rink); }
    else { await walk(tok, ...clear(CLOUD.rest.x + 0.75, 0.5)); await face(tok, 0); gogo.lookAt(CLOUD.pos); gogo.setMood('want', 2); CLOUD.kv += 6; seen.add('snowTongue'); for (let i = 0; i < 6; i++) { flakes(v3.set(s.pos.x + rand(-0.1, 0.1), 1.9, s.pos.z + 0.1), 2, 0.12, 1.1); snowS(); await wait(tok, 0.3); } say('joy'); gogo.act('jump', { mood: 'joy' }); await wait(tok, 0.9); }
    await walk(tok, ...clear(T.GOGO_HOME[0] + rand(-0.3, 0.3), T.GOGO_HOME[1])); await face(tok, 0);
  }
  /** 웅덩이를 가로질러 걷는다(빙판이면 미끄러진다 — 배운 뒤에는 지친다). */
  async function crossRink(tok, p) { await landed(tok); const z = clamp(p.z + 0.5, C.BENCH.Z0, C.BENCH.Z1), far = s.pos.x >= p.x ? -1 : 1; await walk(tok, ...clear(p.x + far * 1.35, z)); }

  // ── 꽁 얼기 · 깨고 나오기(나쁜 일이 아니다 — 가장 큰 볼거리다. 무섭지 않게: 눈은 굴리고, 금방 덜컹거리다 깨고 나와 재채기)
  function freeze() {
    G.mode = 'statue'; G.t = T.FREEZE_FREE; G.freezeT = 0; G.under = null; G.px = s.pos.x; G.pz = s.pos.z; brain.stop(); gogo.stop(); s.busy = true; s.act = null; s.faceTo = null; gogo.mixer.timeScale = 0; seen.add('frozen');
    blk.on = true; blk.v = 6; crack(); stage.shake(T.SHAKE); frostBurst(v3.set(s.pos.x, s.y + 0.7 * s.size, s.pos.z), 22, 0.5); gogo.setMood('fluster', 9); gogo.lookAt(camera.position);
  }
  function breakOut(quiet) {
    if (G.mode !== 'statue') return; G.mode = 'free'; gogo.mixer.timeScale = 1; blk.on = false; GOGO.temp = -0.2; GOGO.fCold = false; s.busy = false; B.idle = 0; gogo.setMood('idle', 0);
    crack(); sfx.pop(); drops(v3.set(s.pos.x, s.y + 0.7 * s.size, s.pos.z), 22, 2.6, COL.ice); frostBurst(v3, 16, 0.5); stage.shake(T.SHAKE * 0.8);
    if (!quiet) run(async tok => {
      gogo.setMood('wow', 0.5); gogo.act(gogo.info.sneeze ? 'sneeze' : 'surprise'); await wait(tok, 0.45);
      seen.add('statue'); say('oops'); hiss(0.25, { g: 0.12, f: 3000, q: 0.8 }); const hx = Math.sin(s.heading), hz = Math.cos(s.heading);      // 에취 — 눈송이를 뿜는다
      puffs.emit(v3.set(s.pos.x + hx * 0.35 * s.size, s.y + 0.75 * s.size, s.pos.z + hz * 0.35 * s.size), COL.snow, 18, 0.08, { v: [hx * 2.6, 0.5, hz * 2.6], vr: 0.7, size: 0.08, a: 0.95, g: 1.5, life: [0.5, 0.9] });
      await wait(tok, 0.7); gogo.setMood('joy', 1); gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); await face(tok, 0);
    });
  }
  function slipStart(v) {
    G.mode = 'slip'; G.t = 0; G.thud = false; const k = Math.max(v, 1.2) * T.SLIP_PUSH; G.vx = Math.sin(s.heading) * k; G.vz = Math.cos(s.heading) * k; G.dur = gogo.info.slip ? gogo.info.slip.dur : 2.5;
    brain.stop(); gogo.stop(); s.busy = true; s.faceTo = null; gogo.act(gogo.info.slip ? 'slip' : 'fall', { lock: true }); gogo.setMood('wow', 0.5); say('oops'); slipS(); seen.add('iceRink');
  }
  function slipStep(dt) {
    G.t += dt; s.target = null; s.busy = true; const ice = onIce(s.pos.x, s.pos.z), f = (ice ? T.ICE_SLIDE : T.BENCH_SLIDE) ** dt, sp = Math.hypot(G.vx, G.vz), g = ice ? 0 : Math.min(sp, T.GRIP * dt), k = sp > 0 ? f * (sp - g) / sp : 0; G.vx *= k; G.vz *= k;
    if (G.t > 0.45) { const q = Math.exp(-2.2 * dt); G.vx *= q; G.vz *= q; }                                    // 엉덩방아를 찧은 뒤에는 잦아든다
    s.pos.x = clamp(s.pos.x + G.vx * dt, -C.BENCH.X, C.BENCH.X); s.pos.z = clamp(s.pos.z + G.vz * dt, C.BENCH.Z0, C.BENCH.Z1);
    if (!G.thud && G.t >= 0.45) { G.thud = true; sfx.thud(s.size); stage.shake(T.SHAKE * s.size); gogo.setMood('dizzy', 0.9); frostBurst(v3.set(s.pos.x, 0.08, s.pos.z), 8, 0.3); }
    if (G.t >= G.dur) { G.mode = 'free'; G.learned = true; s.busy = false; B.idle = 0; gogo.setMood('smile', 1.2); gogo.lookAt(camera.position); }
  }

  // ───────────────────────── 물 · 얼음 · 김 ─────────────────────────
  const waterName = (t, ice) => voice.word(word(ice ? 'ice' : 'water'), () => topV(t, vWord), { name: true, by: t.name });
  /** 대접을 쏟는다(dir = front · left · right). 웅덩이는 셋까지 — 넘으면 가장 오래된 것이 마른다. */
  function spill(dir = 'front') {
    C.ask.act(); B.idle = 0; if (bowl.isIce || bowl.iceK > 0.3 || bowl.fill < 0.7 || !L.here) { bowl.wv += 7; sfx.clink(); return null; }
    const [ox, oz] = T.SLOTS[dir] || T.SLOTS.front, x = bowl.x + ox, z = bowl.z + oz; let p = puddles.find(q => q.on && !q.gone && Math.hypot(q.x - x, q.z - z) < 0.3);
    if (!p) { p = puddles.find(q => !q.on); if (!p) { const old = puddles.filter(q => !q.gone).sort((a, b) => a.born - b.born)[0]; if (old) old.gone = true; sfx.clink(); bowl.wv += 7; return null; } Object.assign(p, { on: true, gone: false, x, z, k: 0.02, iceK: 0, isIce: false, heat: 0, born: L.clock }); }
    p.temp = bowl.temp; p.tint = bowl.tint; p.fresh = true; bowl.fill = 0; bowl.refill = T.REFILL[0]; bowl.lean = 1; const n = Math.hypot(ox, oz) || 1; bowl.dx = ox / n; bowl.dz = oz / n;
    drops(v3.set(bowl.x + bowl.dx * 0.5, 0.2, bowl.z + bowl.dz * 0.5), 18, 1.6); sfx.splat(); hiss(0.4, { g: 0.07, f: 1400, q: 0.6 }); waterName(p, false); seen.add('spill');
    if (gogoFree() && !B.tok) { gogo.lookAt(v3.set(x, 0, z)); gogo.setMood('wow', 0.9); say('wow'); }
    return p;
  }
  /** 얼음덩이를 대접에서 꺼낸다(대접은 다시 찬다). */
  function takeOut() {
    if (!bowl.isIce) return; C.ask.act(); if (lump.on) frostBurst(v3.set(lump.x, 0.2, lump.z), 10, 0.3);
    Object.assign(lump, { on: true, temp: -1, melt: 0, k: 1, fsx: 0, fsz: 0, hopT: 0, x0: bowl.x, z0: bowl.z, x1: bowl.x + 0.15, z1: clamp(bowl.z + 0.95, T.EDGE.Z0, T.EDGE.Z1), x: bowl.x, z: bowl.z, y: 0.1 });
    lump.mesh.material.color.copy(bowl.tint ? cTint.set(HEX[bowl.tint] || '#ffffff') : cWhite); lump.tintName = bowl.tint;
    bowl.isIce = false; bowl.iceK = 0; bowl.temp = 0; bowl.fCold = false; bowl.fill = 0; bowl.refill = T.REFILL[0]; bowl.tint = null; bowl.tintK = 0; sfx.pop(); crack(); seen.add('iceOut');
  }
  /** 작은 물건을 대접에 담근다(물든 것이면 물이 그 색이 된다). */
  function dunk(t) {
    if (D.t || !usable(t) || t.to >= DUNK_SMALL || bowl.isIce || bowl.fill < 0.6) { if (t && usable(t)) { t.tvx += 4; sfx.tick(); } return false; }
    C.ask.act(); Object.assign(D, { t, ph: 'in', k: 0, x0: t.x, z0: t.z }); t.fsx = t.fsz = 0; sfx.pop(); return true;
  }
  function stepDunk(dt) {
    const t = D.t; if (!t) return; if (t.state === 'gone' || t.state === 'fall') { D.t = null; return; } D.k += dt; const arc = (k, ax, az, bx, bz, y0, y1) => { const e = clamp(k, 0, 1); t.x = ax + (bx - ax) * e; t.z = az + (bz - az) * e; t.y = y0 + (y1 - y0) * e + 0.9 * 4 * e * (1 - e); t.vy = 0; };
    if (D.ph === 'in') { arc(D.k / 0.45, D.x0, D.z0, bowl.x, bowl.z, 0, 0.12); if (D.k >= 0.45) { D.ph = 'soak'; D.k = 0; drops(v3.set(bowl.x, 0.25, bowl.z), 14, 2.2, t.color !== 'own' && HEX[t.color] ? HEX[t.color] : COL.drop); sfx.splat(); bowl.wv += 8; seen.add('dunk');
      if (t.color !== 'own' && HEX[t.color]) { bowl.tint = t.color; seen.add('colorWater'); } if (Math.abs(t.temp) > 0.3) { bowl.temp = clamp(bowl.temp + t.temp * 0.4, -1, 1); if (t.temp > 0) { steamS(0.08); puffs.steam(v3, 8, 0.3, 0.8); } t.temp *= 0.3; } } }
    else if (D.ph === 'soak') { t.x = bowl.x; t.z = bowl.z; t.y = 0.12 + Math.sin(D.k * 7) * 0.025; t.vy = 0; if (D.k >= 1.2 || bowl.temp <= T.COLD_AT) { D.ph = 'out'; D.k = 0; sfx.pop(); } }      // 물이 얼기 시작하면 퐁 튀어나온다
    else { arc(D.k / 0.45, bowl.x, bowl.z, D.x0, D.z0, 0.12, 0); if (D.k >= 0.45) { t.y = 0.001; t.vy = -0.5; D.t = null; drops(v3.set(t.x, 0.1, t.z), 5, 1.2); } }
    t.home.x = t.x; t.home.z = t.z; if (t.ball) t.vx = 0;
  }
  function stepWater(dt) {
    // 대접
    const b = bowl, heldOn = applied(b); if (!heldOn && b.temp) b.temp -= Math.sign(b.temp) * Math.min(Math.abs(b.temp), T.BACK * dt);
    crossing(b, () => topV(b, vWord));
    if (b.refill > 0) b.refill -= dt; else if (b.fill < 1) { b.fill = Math.min(1, b.fill + dt / T.REFILL[1]); if (b.fill >= 1) b.tint = b.tint && b.tintK > 0.5 ? b.tint : null; }
    const was = b.isIce; if (b.fill >= 1 && b.temp <= T.COLD_AT && !D.t) b.iceK = Math.min(1, b.iceK + T.FREEZE_K * dt); else if (b.temp > T.MELT_AT || b.fill < 1) { if (b.iceK > 0 && Math.random() < dt * 9) dripS(); b.iceK = Math.max(0, b.iceK - T.FREEZE_K * dt); }
    if (!was && b.iceK >= 1) { b.isIce = true; waterName(b, true); crack(); frostBurst(v3.set(b.x, 0.4, b.z), 14, 0.35); seen.add(b.tint ? 'colorIce' : 'bowlIce'); if (b.tint && gogoFree() && !B.tok) { gogo.lookAt(v3); gogo.setMood('wow', 1.2); say('wow'); } }
    else if (was && b.iceK <= 0) { b.isIce = false; if (!b.quiet) waterName(b, false); b.quiet = false; drops(v3.set(b.x, 0.3, b.z), 8, 1.4); }
    b.tintK += ((b.tint ? 1 : 0) - b.tintK) * Math.min(1, 3 * dt);
    if (b.temp > 0.45 && b.fill > 0.5 && Math.random() < dt * 8 * b.temp) puffs.steam(v3.set(b.x + rand(-0.3, 0.3), 0.3, b.z + rand(-0.3, 0.3)), 1, 0.05, 0.6);
    // 웅덩이
    for (const p of puddles) {
      if (!p.on) continue; const on = applied(p); if (!on && p.temp) p.temp -= Math.sign(p.temp) * Math.min(Math.abs(p.temp), T.BACK * dt);
      if (p.gone) { p.k -= dt * 2.5; if (p.k <= 0) { p.on = false; p.k = 0; } continue; } p.k += (1 - p.k) * Math.min(1, 5 * dt); p.fresh = false;
      const wasIce = p.isIce; if (p.temp <= T.COLD_AT) p.iceK = Math.min(1, p.iceK + T.PUDDLE_K * dt); else if (p.temp > T.MELT_AT) { if (p.iceK > 0 && Math.random() < dt * 9) dripS(); p.iceK = Math.max(0, p.iceK - T.PUDDLE_K * dt); }
      if (p.iceK > 0.02 && p.iceK < 0.98 && Math.random() < dt * 16) { const a = Math.random() * 7, r = p.r * (1 - p.iceK * 0.95); fx.spark(v3.set(p.x + Math.cos(a) * r, 0.05, p.z + Math.sin(a) * r), COL.frost, 1, 0.03, 0.4); }      // 얼어 들어가는 끝이 반짝인다
      if (!wasIce && p.iceK >= 1) { p.isIce = true; p.heat = 0; waterName(p, true); crack(); stage.shake(T.SHAKE * 0.4); seen.add('rink'); if (gogoFree() && !B.tok) { gogo.setMood('wow', 1); say('wow'); } }
      else if (wasIce && p.iceK <= 0) { p.isIce = false; waterName(p, false); }
      if (on && !p.isIce && p.iceK <= 0.05 && tools.some(w => w.on === p && w.dir > 0)) { p.heat += dt; if (Math.random() < dt * (6 + 10 * p.heat)) { const a = Math.random() * 7, r = Math.sqrt(Math.random()) * p.r * 0.8; puffs.steam(v3.set(p.x + Math.cos(a) * r, 0.05, p.z + Math.sin(a) * r), 1, 0.05, 0.7, 0.9); } if (Math.random() < dt * 5) hiss(0.08, { g: 0.03, f: 4200 });
        if (p.heat >= T.STEAM_GONE) { p.gone = true; seen.add('steamAway'); steamS(0.14); for (let i = 0; i < 5; i++) { const a = i * 1.3; puffs.steam(v3.set(p.x + Math.cos(a) * p.r * 0.5, 0.1, p.z + Math.sin(a) * p.r * 0.5), 4, 0.3, 1.0, 1.4); } if (gogoFree() && !B.tok) { gogo.lookAt(v3.set(p.x, 1.2, p.z)); gogo.setMood('wow', 1.2); say('wow'); } } }
      else if (!on) p.heat = Math.max(0, p.heat - dt * 0.3);
    }
    // 꺼낸 얼음덩이: 햇살 등에 녹아 웅덩이가 된다
    if (lump.on) {
      if (lump.hopT >= 0) { lump.hopT += dt; const e = clamp(lump.hopT / 0.45, 0, 1); lump.x = lump.x0 + (lump.x1 - lump.x0) * e; lump.z = lump.z0 + (lump.z1 - lump.z0) * e; lump.y = 0.1 * (1 - e) + 0.8 * 4 * e * (1 - e); if (e >= 1) { lump.hopT = -1; lump.y = 0; sfx.thud(0.5); } }
      if (lump.temp > T.MELT_AT) { lump.melt += dt / T.MELT; if (Math.random() < dt * 9) { dripS(); drops(v3.set(lump.x, 0.15, lump.z), 1, 0.6); }
        if (lump.melt >= 1) { lump.on = false; const p = puddles.find(q => !q.on); if (p) { Object.assign(p, { on: true, gone: false, x: lump.x, z: lump.z, k: 0.02, iceK: 0, isIce: false, heat: 0, born: L.clock, temp: 0, tint: lump.tintName || null, r: T.PUDDLE.r * 0.6 }); waterName(p, false); } seen.add('lumpMelt'); } }
    }
  }
  // ── 옥수수와 팝콘
  /** 한 알을 날린다. toMouth = 고고 입으로(받아먹는다). */
  function launch(toMouth) {
    const p = pieces[pieceN++ % pieces.length]; p.m.visible = true; p.k = 0.3; p.rx = rand(0, 6); p.rv = rand(-9, 9); p.x = corn.x + rand(-0.12, 0.12); p.y = 0.12; p.z = corn.z + rand(-0.12, 0.12); popS(); corn.wv += rand(-6, 6); fx.spark(v3.set(p.x, 0.2, p.z), COL.pop, 3, 0.05, 0.8);
    if (toMouth) { Object.assign(p, { st: 'catch', t: 0, dur: 0.7, x0: p.x, y0: p.y, z0: p.z }); return p; }
    p.st = 'fly'; p.vx = rand(-2.6, -0.2); p.vz = rand(-1.5, 0.15); p.vy = rand(3.4, 5.0); return p;
  }
  function stepCorn(dt) {
    const c = corn; if (!applied(c) && c.temp) c.temp -= Math.sign(c.temp) * Math.min(Math.abs(c.temp), 0.15 * dt);
    c.wv += (-90 * c.wob - 7 * c.wv) * dt; c.wob += c.wv * dt;
    if (c.state === 'full') { const q = clamp((c.temp - 0.15) / (T.POPCORN.at - 0.15), 0, 1); if (q > 0 && Math.random() < dt * q * 18) { c.wv += rand(-1, 1) * 6 * q; tone(rand(500, 900), 300, 0.03, { g: 0.03 * q }); }      // 달아오르면 달달 떤다 — 터질까 말까는 소리로 먼저
      if (c.temp >= T.POPCORN.at) { c.state = 'pop'; c.n = T.POPCORN.n - T.POP_KEEP; c.keep = T.POP_KEEP; c.keepT = 3.2; c.t = 0; stage.shake(T.SHAKE * 0.6); seen.add('pop');
        if (!L.popSaid) { L.popSaid = true; voice.word(word('pop') + '!', () => topV(c, vWord), { by: 'corn' }); } if (gogoFree() && !C.ask.active) run(popTask); } }
    else if (c.state === 'pop') {
      if (c.n > 0 && (c.t -= dt) <= 0) { c.t = T.POP_EVERY * rand(0.6, 1.5); c.n--; launch(false); }
      if (c.keep > 0 && !(L.catchTok && B.tok === L.catchTok) && (c.keepT -= dt) <= 0) { c.keepT = 0.2; c.keep--; launch(false); }      // 고고가 못 오면 남긴 알도 그냥 터진다
      if (c.n <= 0 && c.keep <= 0) { c.state = 'empty'; c.t = T.CORN_BACK; }
    } else if ((c.t -= dt) <= 0 && !applied(c)) { c.state = 'full'; c.temp = 0; c.kv = 5; sfx.pop(); }
    c.kv += (120 * ((c.state === 'full' ? 1 : 0) - c.k) - 12 * c.kv) * dt; c.k = Math.max(0, c.k + c.kv * dt);
    for (const p of pieces) {
      if (p.st === 'off') continue; p.k += (1 - p.k) * Math.min(1, 14 * dt);
      if (p.st === 'fly') { p.vy -= 12 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.rx += p.rv * dt; if (Math.abs(p.x) > T.EDGE.X) { p.x = Math.sign(p.x) * T.EDGE.X; p.vx *= -0.4; } if (p.z < T.EDGE.Z0 || p.z > T.EDGE.Z1) { p.z = clamp(p.z, T.EDGE.Z0, T.EDGE.Z1); p.vz *= -0.4; }
        if (p.y <= 0.08 && p.vy < 0) { p.y = 0.08; if (p.vy < -2) { p.vy *= -0.3; p.vx *= 0.5; p.vz *= 0.5; sfx.tick(); } else p.st = 'rest'; } }
      else if (p.st === 'catch') { p.t += dt; const e = clamp(p.t / p.dur, 0, 1), mx = s.pos.x + Math.sin(s.heading) * 0.3 * s.size, my = s.y + 0.86 * s.size, mz = s.pos.z + Math.cos(s.heading) * 0.3 * s.size; p.x = p.x0 + (mx - p.x0) * e; p.z = p.z0 + (mz - p.z0) * e; p.y = p.y0 + (my - p.y0) * e + 0.9 * 4 * e * (1 - e); p.rx += 9 * dt; if (e >= 1 && !(L.catchTok && B.tok === L.catchTok)) { p.st = 'fly'; p.vx = p.vz = 0; p.vy = 0; } }
      else if (p.st === 'away') { p.k -= dt * 6; if (p.k <= 0.05) { p.st = 'off'; p.m.visible = false; } }
    }
  }
  // ── 눈
  function snowAt(x, z, dt) {
    if (snow.state === 'none') { for (const t of TH) if (usable(t) && Math.hypot(t.x - x, t.z - z) < t.r * t.size + 0.4) return; Object.assign(snow, { state: 'pile', x, z, k: 0, melt: 0, roll: 0, man: 0, head: 0 }); return; }
    if (snow.state === 'pile' && snow.k < 1 && Math.hypot(snow.x - x, snow.z - z) < 0.6) { snow.k = Math.min(1, snow.k + dt / T.SNOW.hold); if (snow.k >= 1) { seen.add('snowPile'); sfx.pop(); snow.wv += 5; if (gogoFree() && !B.tok && !C.ask.active) run(snowmanTask); } }
  }
  function stepSnow(dt) {
    if (snow.state === 'none') return; snow.wv += (-90 * snow.wob - 8 * snow.wv) * dt; snow.wob += snow.wv * dt;
    if (snow.state === 'roll') { if (L.snowTok && B.tok === L.snowTok) snow.roll = Math.min(1, snow.roll + dt / T.ROLL); else { snow.state = 'pile'; snow.roll = 0; L.snowTok = null; } }      // 굴리다 끊기면 눈 더미로 돌아간다
    if (snow.state === 'man') { if (snow.man > 0) snow.man += (1 - snow.man) * Math.min(1, 9 * dt); if (snow.head > 0) snow.head += (1 - snow.head) * Math.min(1, 9 * dt); }
    if (snow.melt > 0 && !tools.some(w => w.dir > 0 && w.on === snow)) snow.melt = Math.max(0, snow.melt - dt * 0.2);
    if (snow.melt >= 1) { snow.state = 'none'; seen.add('snowMelt'); drops(v3.set(snow.x, 0.1, snow.z), 8, 1.2); }
  }

  // ───────────────────────── 도구(들고 머물기) ─────────────────────────
  function startApply(w, t) {
    sfx.tick(); B.idle = 0; C.ask.act();
    if (t === GOGO) { G.fled = null; if (G.mode === 'free') { brain.stop(); gogo.stop(); s.busy = true; G.under = w; } }
  }
  function stopApply(w, t) { if (t === GOGO) { const fled = G.fled === w; if (fled) G.fled = null; if (G.under === w) { G.under = null; if (G.mode === 'free' && !fled && !applied(GOGO)) run(afterGogo); } } }
  /** 머무는 동안: 온도가 움직인다. 큰 것은 느리고 작은 것은 빠르다(÷ 크기). */
  function apply(w, t, dt) {
    if (t.kind === 'spot') { if (snow.state !== 'none' && Math.hypot(snow.x - t.x, snow.z - t.z) < 0.6) t = snow; else { if (w.dir < 0) snowAt(t.x, t.z, dt); return; } }
    if (t.kind === 'snow') { if (w.dir < 0) snowAt(snow.x, snow.z, dt); else { snow.melt += dt / T.MELT; if (Math.random() < dt * 10) { dripS(); drops(v3.set(snow.x + rand(-0.2, 0.2), 0.15, snow.z + 0.2), 1, 0.5); } } return; }
    if (t === GOGO) { if (G.mode === 'statue') { if (w.dir > 0) G.t -= dt * 2; return; } if (G.mode !== 'free') return; }
    if (t.kind === 'corn' && corn.state !== 'full') return;
    t.temp = clamp(t.temp + w.dir * T.RATE / (t.kind ? 1 : Math.max(t.size, 0.3)) * dt, -1, 1);
  }
  function park(w, t, sec = T.PARK) { if (!valid(t)) return; if (w.other.state === 'park') unpark(w.other); w.state = 'park'; w.aim = t; w.parkT = sec; B.idle = 0; sfx.grab(); }
  function unpark(w) { if (w.state === 'park') { w.state = 'back'; w.back = 0; w.aim = null; w.armed = false; } }
  function arm(w, on) { w.armed = on; w.armT = T.ARM; if (on) { w.other.armed = false; if (w.other.state === 'park') unpark(w.other); w.kv += 7; sfx.spark(w.dir < 0); } }
  function stepTool(w, dt) {
    let on = null;
    if (w.state === 'held') {
      holdPlane.constant = -T.HOLD_Y; if (stage.worldOn(holdPlane, P.x, P.y, v3)) w.to.set(clamp(v3.x, -3.7, 3.7), T.HOLD_Y, clamp(v3.z, -1.05, 1.2));
      const t = under(w.pos.x, w.pos.z); if (t && t.kind !== 'spot' && t.kind !== 'puddle') w.to.y = clamp(topY(t) + T.HOVER, T.HOLD_Y, 3.0); if (t && w.pos.distanceTo(w.to) < 0.7) on = t;
    } else if (w.state === 'park') {
      if (!valid(w.aim) || (w.parkT -= dt) <= 0 || (w.aim === GOGO && G.fled === w)) unpark(w); else { hoverOf(w.aim, w.to); if (Math.hypot(w.pos.x - w.to.x, w.pos.z - w.to.z) < 0.3) on = w.aim; }
    } else if (w.state === 'back' && (w.back -= dt) <= 0) { w.to.copy(w.rest); if (w.pos.distanceTo(w.rest) < 0.04) w.state = 'rest'; }
    if (w.armed && w.state === 'rest' && (w.armT -= dt) <= 0) w.armed = false;
    if (on !== w.on) { const was = w.on; w.on = on; w.dwell = 0; if (was) stopApply(w, was); if (on) startApply(w, on); }
    if (w.on) { w.dwell += dt; if (w.dwell >= T.DWELL) apply(w, w.on, dt); }
    const kw = 1 - Math.exp(-(w.state === 'held' ? T.FOLLOW : T.FLY) * dt), dx = (w.to.x - w.pos.x) * kw; if (L.vis >= 1 || w.state !== 'rest') w.pos.lerp(w.to, kw);
    w.kv += (-90 * w.kick - 7 * w.kv) * dt; w.kick += w.kv * dt; w.tilt += (-dx * 3 - w.tilt) * Math.min(1, 10 * dt); w.puff += ((w.on ? 1.12 : 1) - w.puff) * Math.min(1, 6 * dt);
    // 눈이 내린다 · 햇살이 내리쬔다
    const act = w.on && w.dwell >= T.DWELL, busy = w.state === 'held' || w.state === 'park';
    if (w.dir < 0) { if (Math.random() < dt * (act ? 26 : busy ? 7 : 1.2)) flakes(v3.set(w.pos.x, w.pos.y - 0.2, w.pos.z), 1, 0.28, act ? 1.9 : 1.1); if (act && Math.random() < dt * 9) snowS(); }
    else if (act && Math.random() < dt * 7) { fx.spark(v3.set(w.pos.x, w.pos.y - 0.5, w.pos.z), '#ffc060', 1, 0.2, 0.5); if (Math.random() < 0.4) hiss(0.04, { g: 0.03, f: rand(1800, 3000), q: 3 }); }      // 타닥
  }

  // ───────────────────────── 손 ─────────────────────────
  const holdPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -T.HOLD_Y), H = { tool: null, thing: null, t0: 0, x0: 0, y0: 0, drag: false, spilled: false };
  const pxNear = (x, y, wx, wy, wz, r) => { const c = stage.screenOf(v3.set(wx, wy, wz)), e = stage.screenOf(v3b.set(wx + r, wy, wz)); return Math.hypot(c.x - x, (c.y - y) * 1.5) < Math.abs(e.x - c.x) + 10; };
  const toolAt = (x, y) => tools.find(w => { const c = stage.screenOf(w.pos); return Math.hypot(c.x - x, c.y - y) < T.GRAB_PX; });
  /** 화면의 그 자리에 있는 것(물건 · 고고 · 얼음덩이 · 대접 · 접시 · 눈 · 웅덩이 · 빈 실험대). */
  function pick(x, y) {
    const t = pickAt(stage, targets.filter(q => q === GOGO || usable(q)), x, y); if (t) return t;
    if (lump.on && pxNear(x, y, lump.x, 0.2, lump.z, 0.42)) return lump; if (pxNear(x, y, bowl.x, 0.15, bowl.z, 0.52)) return bowl; if (pxNear(x, y, corn.x, 0.05, corn.z, 0.36)) return corn;
    if (snow.state !== 'none' && pxNear(x, y, snow.x, 0.3, snow.z, 0.45)) return snow;
    if (!stage.worldOn(C.benchPlane, x, y, v3)) return null; const bx = v3.x, bz = v3.z, p = inPuddle(bx, bz); if (p) { p.px = bx; p.pz = bz; return p; }
    if (Math.abs(bx) > 3.7 || bz < -1.3 || bz > 1.3) return null; spot.x = clamp(bx, -T.EDGE.X, T.EDGE.X); spot.z = clamp(bz, T.EDGE.Z0, T.EDGE.Z1); return spot;
  }
  const armed = () => tools.find(w => w.armed);
  function onDown(e) {
    takeover(); const x = e.clientX, y = e.clientY; H.t0 = L.clock; H.x0 = x; H.y0 = y; H.drag = false; H.spilled = false; H.tool = H.thing = null; B.idle = 0;
    const w = toolAt(x, y); if (w) { H.tool = w; H.was = w.state; w.state = 'held'; w.aim = null; P.mode = 'tool'; sfx.grab(); w.kv += 4; return; }      // 도구를 집는다
    const t = pick(x, y), a = armed(); if (!t) return;
    if (a) { park(a, t); a.armT = T.ARM; if (!t.kind) name(t); return; }                                                                                  // 쉬운 길: 고른 도구가 그 위에 가서 머문다
    if (t === GOGO) { if (G.mode === 'statue') { name(GOGO); blk.jv += 8; G.t -= 0.4; sfx.clink(); } else { name(GOGO); sfx.tick(); C.ask.act(); goSide(); } return; }
    if (!t.kind) { name(t); sfx.tick(); t.tvx += rand(-1, 1) * 3; t.tvz += 3; H.thing = t; P.mode = 'push'; return; }
    if (t === lump) { waterName(lump, true); H.thing = lump; P.mode = 'push'; return; }
    if (t === bowl) { waterName(bowl, bowl.isIce); bowl.wv += 5; P.mode = 'bowl'; return; }
    if (t === corn) { corn.wv += 7; sfx.clink(); return; } if (t === snow) { snow.wv += 6; sfx.tick(); return; }
    if (t.kind === 'puddle') { waterName(t, t.isIce); if (t.isIce) sfx.clink(); else { drops(v3.set(t.px, 0.03, t.pz), 4, 1.0); sfx.gulp(); } P.mode = 'walk'; C.tapBench(t.px, t.pz); return; }   // 웅덩이는 이름도 듣고 고고도 그리로 간다(빙판이면 미끄러진다)
    if (G.mode === 'statue') { blk.jv += 8; G.t -= 0.4; sfx.clink(); return; } P.mode = 'walk'; C.tapBench(t.x, t.z);
  }
  function onMove(e) {
    if (!H.drag && Math.hypot(e.clientX - H.x0, e.clientY - H.y0) > T.TAP_PX) H.drag = true;
    if (P.mode === 'bowl' && !H.spilled && Math.abs(e.clientX - H.x0) > 44) { H.spilled = true; spill(e.clientX < H.x0 ? 'left' : 'right'); }      // 옆으로 기울이면 그쪽으로 쏟아진다
    else if (P.mode === 'walk' && G.mode === 'free' && s.target && stage.worldOn(C.benchPlane, e.clientX, e.clientY, v3)) gogo.goTo(clamp(v3.x, -C.BENCH.X, C.BENCH.X), clamp(v3.z, C.BENCH.Z0, C.BENCH.Z1));
  }
  function onUp() {
    const tap = !H.drag && L.clock - H.t0 < T.TAP_SEC;
    if (P.mode === 'tool' && H.tool) { const w = H.tool; if (tap) { C.ask.act(); if (w.armed || H.was === 'park') { arm(w, false); w.state = 'back'; w.back = 0; } else { arm(w, true); w.state = 'back'; w.back = 0; } } else { w.armed = false; w.state = 'back'; w.back = T.TOOL_BACK; sfx.pop(); } }
    else if (P.mode === 'push' && H.thing) { const t = H.thing; if (tap) tapThing(t); else if (Math.hypot(t.fsx, t.fsz) > 1) { t.fShoved = true; t.fIce = false; C.ask.act(); } }
    else if (P.mode === 'bowl' && tap && bowl.isIce) takeOut();
    H.tool = H.thing = null;
  }
  /** 물건을 톡 누르면 지금 있는 쪽의 반대편으로 쭉 미끄러져 간다(첫 손길 — 누르기만으로 Hot · Cold 가 다 나온다). 의자가 달아오르거나 얼면 고고가 스스로 앉으러 온다. */
  function tapThing(t) { if (t !== lump && send(t)) C.ask.act(); }
  function toss(t) { if (!usable(t) || t.y > 0.05) return; C.ask.act(); t.vy = T.TOSS; t.y = 0.001; t.fTossed = true; sfx.pop(); if (gogoFree() && !B.tok) gogo.lookAt(v3.set(t.x, 1, t.z)); }
  /** 그쪽 절반의 빈 자리(가장 가까운 것). */
  function freeSpot(to, t, same) {
    const wx = to * clamp(Math.abs(t.x) + (same ? 0.75 : 0), 1.15, 2.5); let best = null, bd = 1e9;
    for (const ax of [1.15, 1.85, 2.5]) for (const z of [-0.42, 0.32]) { const x = to * ax; if (Math.hypot(x - t.x, z - t.z) < 0.5) continue; let ok = Math.hypot(x - s.pos.x, z - s.pos.z) > 0.6 && Math.hypot(x - corn.x, z - corn.z) > 0.7 && Math.hypot(x - T.STOVE[0], z - T.STOVE[1]) > 0.75 && !(snow.state !== 'none' && Math.hypot(x - snow.x, z - snow.z) < 0.8) && !(lump.on && Math.hypot(x - lump.x, z - lump.z) < 0.8);
      for (const q of TH) if (q !== t && usable(q) && Math.hypot(x - q.x, z - q.z) < q.r * q.size + t.r * t.size + 0.12) ok = false; const d = Math.hypot(x - wx, z - t.z) + (ok ? 0 : 9); if (d < bd) { bd = d; best = [x, z]; } }
    return best;
  }
  /** 첫 손길: 물건을 반대편(to = -1 왼쪽 · 1 오른쪽 · 0 반대편)으로 쭉 미끄러뜨린다. 닿은 쪽의 온도가 된다 — 왼쪽이면 얼고 "Cold!", 오른쪽이면 데워져 "Hot!". */
  function send(t, to = 0) {
    if (!t || !usable(t) || t.y > 0.3) return false; const same = to && Math.sign(t.x) === to, side = to || (t.x < 0 ? 1 : -1), spot = freeSpot(side, t, same); if (!spot) return false;
    t.fSend = { x: spot[0], z: spot[1], t: 0 }; t.fSent = true; t.fShoved = true; t.fIce = t.x < 0 || side < 0; B.idle = 0; sfx.whoosh(); t.tvz += 4;
    if (t === ball) { t.vy = T.TOSS * 0.8; t.y = 0.001; t.fTossed = true; }                                    // 공은 통 튀며 건너간다(언 공은 딱 · 데운 공은 높이)
    return true;
  }
  /** 고고도 반대편으로 지쳐 간다 — 왼쪽에서는 떨고 오른쪽에서는 부채질(꽁 얼기까지는 가지 않는다). */
  function goSide() { if (!gogoFree()) return; const to = s.pos.x < 0 ? 1 : -1; GOGO.fSent = true; GOGO.fSide = to; say('joy'); run(async tok => { await landed(tok); await walk(tok, ...clear(to * 1.55, 0.62)); await face(tok, 0); }); }
  /** 손이 닿았다: 해 보이던 것 · 차려 놓은 장면은 그 자리에서 아이의 것으로 넘어간다. */
  function takeover() { if (L.showTok && B.tok === L.showTok) { brain.stop(); gogo.lookAt(camera.position); } L.showTok = null; }
  /** 그 쪽으로 민다(빠르기는 손이 정한다 — 자동 확인은 SHOVE_V). */
  function shove(t, dx, dz, v = T.SHOVE_V) { const n = Math.hypot(dx, dz) || 1; t.fsx = dx / n * v; t.fsz = dz / n * v; t.fShoved = true; t.fIce = false; C.ask.act(); sfx.whoosh(); B.idle = 0; }

  // ───────────────────────── 미끄러지기 ─────────────────────────
  const solids = [{ x: T.STOVE[0], z: T.STOVE[1], r: 0.3, on: () => true }, { x: corn.x, z: corn.z, r: 0.3, on: () => true }, { get x() { return snow.x; }, get z() { return snow.z; }, r: 0.4, on: () => snow.state !== 'none' && snow.k > 0.4 }];
  function slide(t, dt, pushing) {
    const rr = t.kind ? t.r : t.r * t.size * 0.85, air = t.y > 0.03;
    if (pushing && stage.worldOn(C.benchPlane, P.x, P.y, v3)) { let wx = (v3.x - t.x) * T.PUSH, wz = (v3.z - t.z) * T.PUSH; const n = Math.hypot(wx, wz); if (n > T.PUSH_MAX) { wx *= T.PUSH_MAX / n; wz *= T.PUSH_MAX / n; } const k = Math.min(1, 12 * dt); t.fsx += (wx - t.fsx) * k; t.fsz += (wz - t.fsz) * k; }
    if (t.fSend) {                                                                           // 반대편의 빈 자리로 쭉(끝에서 스르르 선다)
      const F = t.fSend, dx = F.x - t.x, dz = F.z - t.z, d = Math.hypot(dx, dz) || 0.001, v = Math.min(T.SEND_V, 0.9 + d * 4.2), k = Math.min(1, 10 * dt); F.t += dt;
      if (t.fOver <= 0 || air) { t.fsx += (dx / d * v - t.fsx) * k; t.fsz += (dz / d * v - t.fsz) * k; }
      if (d < 0.09 || F.t > 3.2) { t.fSend = null; t.fsx *= 0.3; t.fsz *= 0.3; t.fspinV += (Math.random() < 0.5 ? -1 : 1) * 3; }
    }
    let sp = Math.hypot(t.fsx, t.fsz); if (sp < 0.02 && !t.fSend) { t.fsx = t.fsz = 0; if (!pushing) { t.fIce = t.fShoved = false; } return; }
    const ice = onIce(t.x, t.z) || t.kind === 'lump'; if (ice && sp > 0.3 && !air) t.fIce = true;
    if (!pushing && !air && !t.fSend && sp > 0) { const hard = t.kind === 'lump' || onPuddleIce(t.x, t.z), f = (ice ? T.ICE_SLIDE : T.BENCH_SLIDE) ** dt, g = Math.min(sp, (hard ? 0 : ice ? T.RINK_GRIP : T.GRIP * (t.temp <= T.COLD_AT ? T.COLD_GRIP : 1)) * dt), k = f * (sp - g) / sp; t.fsx *= k; t.fsz *= k; }
    t.x += t.fsx * dt; t.z += t.fsz * dt; if (t.ball) t.roll -= t.fsx * dt / Math.max(t.r * t.size, 0.05);
    if (Math.abs(t.x) > T.EDGE.X - rr) { t.x = Math.sign(t.x) * (T.EDGE.X - rr); if (Math.abs(t.fsx) > 1) sfx.tick(); t.fsx *= -T.WALL; } if (t.z < T.EDGE.Z0 + rr * 0.5) { t.z = T.EDGE.Z0 + rr * 0.5; t.fsz *= -T.WALL; } else if (t.z > T.EDGE.Z1 - rr * 0.5) { t.z = T.EDGE.Z1 - rr * 0.5; t.fsz *= -T.WALL; }
    // 대접: 작은 것은 퐁당 빠지고, 빠르게 온 것은 폴짝 넘고, 느린 것은 톡 튕긴다
    t.fOver -= dt; const bx = t.x - bowl.x, bz = t.z - bowl.z, bd = Math.hypot(bx, bz) || 0.001, need = rr + bowl.r * 0.92;
    if (bd < need && t.fOver <= 0 && t.y < 0.25 && L.vis > 0.9) {
      const nx = bx / bd, nz = bz / bd, vn = t.fsx * nx + t.fsz * nz;
      if (!t.kind && !t.fSend && t.to < DUNK_SMALL && sp > 0.4 && dunk(t)) return;
      if (vn < 0 && sp > T.BOWL_HOP_V) { const v = clamp(sp, T.BOWL_HOP[0], T.BOWL_HOP[1]); t.fsx *= v / sp; t.fsz *= v / sp; if (t.kind) t.fVy = T.BOWL_HOP[2]; else { t.vy = T.BOWL_HOP[2]; t.y = 0.002; } t.fOver = 0.75; sfx.clink(); bowl.wv += 5; }
      else { t.x = bowl.x + nx * need; t.z = bowl.z + nz * need; if (vn < 0) { t.fsx -= 1.4 * vn * nx; t.fsz -= 1.4 * vn * nz; if (vn < -0.6) { sfx.clink(); bowl.wv += 4; } } }
    }
    for (const o of solids) { if (!o.on()) continue; const ox = t.x - o.x, oz = t.z - o.z, od = Math.hypot(ox, oz) || 0.001, nd = rr + o.r; if (od >= nd || t.y > 0.3) continue; const nx = ox / od, nz = oz / od, vn = t.fsx * nx + t.fsz * nz; t.x = o.x + nx * nd; t.z = o.z + nz * nd; if (vn < 0) { t.fsx -= 1.4 * vn * nx; t.fsz -= 1.4 * vn * nz; if (vn < -0.8) sfx.tick(); } }
    if (!t.kind) { t.home.x = t.x; t.home.z = t.z; }
  }
  /** 물건끼리 부딪힘: 세게 맞히면 맞은 쪽이 밀려 나가고 둘 다 빙글 돈다. */
  function collide() {
    const list = TH.filter(usable); if (lump.on && lump.hopT < 0) list.push(lump);
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j], ra = a.kind ? a.r : a.r * a.size * 0.85, rb = b.kind ? b.r : b.r * b.size * 0.85, dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 0.001; if (d >= ra + rb || Math.abs(a.y - b.y) > 0.4) continue;
      if (a.fSend || b.fSend) { const m = a.fSend ? a : b, o = m === a ? b : a; if (m.fOver <= 0 && m.y < 0.05 && !m.kind) { m.vy = T.BOWL_HOP[2]; m.y = 0.002; m.fOver = 0.7; sfx.pop(); if (!o.kind) o.tvx += 3; } continue; }      // 건너가는 것은 길을 막은 것을 폴짝 넘는다(남을 밀어내지 않는다)
      const nx = dx / d, nz = dz / d, vn = (a.fsx - b.fsx) * nx + (a.fsz - b.fsz) * nz, push = (ra + rb - d) / 2; a.x -= nx * push; a.z -= nz * push; b.x += nx * push; b.z += nz * push;
      if (vn <= 0) continue;
      const hard = vn > T.HIT_V, give = hard ? T.HIT_GIVE : 0.5, keep = hard ? T.HIT_KEEP : 0.5;
      a.fsx -= nx * vn * (1 - keep) + 0; a.fsz -= nz * vn * (1 - keep); b.fsx += nx * vn * give; b.fsz += nz * vn * give;
      if (hard) { const sgn = (nx * a.fsz - nz * a.fsx) >= 0 ? 1 : -1; if (!a.kind) { a.fspinV += T.SPIN * sgn; a.tvx += 4; } if (!b.kind) { b.fspinV -= T.SPIN * sgn; b.tvz += 4; } if (a === cup || b === cup) sfx.clink(); else sfx.thud(0.5); stage.shake(T.SHAKE * 0.3);
        if ((a.fIce || b.fIce) && (a.fShoved || b.fShoved)) { seen.add('curling'); if (gogoFree() && !B.tok) { gogo.lookAt(v3.set(b.x, 0.4, b.z)); gogo.act('surprise', { mood: 'wow' }); say('wow'); } } b.fIce = b.fIce || a.fIce; b.fShoved = true; }
    }
  }

  // ───────────────────────── 매 장면 ─────────────────────────
  function stepGogo(dt) {
    crossing(GOGO, () => headTop(vWord));
    if (G.mode === 'statue') {                                                              // 얼음 조각: 눈만 굴리다가 덜컹덜컹 — 금이 가며 깨고 나온다
      G.t -= dt; s.target = null; s.busy = true; s.pos.x = G.px; s.pos.z = G.pz; const near = 1 - clamp(G.t / T.FREEZE_FREE, 0, 1);
      if ((G.tick -= dt) <= 0) { G.tick = 0.42 - 0.3 * near; blk.jv += (Math.random() < 0.5 ? -1 : 1) * (3 + 8 * near); tone(900 + 900 * near, 500, 0.04, { type: 'square', g: 0.03 + 0.03 * near }); if (near > 0.4) fx.spark(v3.set(s.pos.x + rand(-0.3, 0.3), s.y + rand(0.3, 1.1) * s.size, s.pos.z + 0.45), '#ffffff', 2, 0.05, 0.6); }
      if (G.t <= 0) breakOut(false); return;
    }
    if (G.mode === 'slip') { slipStep(dt); return; }
    const seated = L.sitTok && B.tok === L.sitTok, dipped = L.dipTok && B.tok === L.dipTok;
    if (seated) { s.pos.x = chair.x; s.pos.z = chair.z + 0.03; s.y = T.SEAT * chair.size + chair.y; s.target = null; if (!usable(chair)) L.sitTok = null; }
    else if (dipped) { s.pos.x = bowl.x; s.pos.z = bowl.z; s.y = 0.06; s.target = null; }
    else { L.sitTok = L.dipTok = null; if (!B.hop && B.where === 'bench' && s.y > 0) s.y = Math.max(0, s.y - 5 * dt); }
    if (GOGO.fSent && !G.under && Math.abs(s.pos.x) > 0.9 && (s.pos.x < 0) === (GOGO.fSide < 0)) { const sd = s.pos.x < 0 ? -1 : 1, was = GOGO.temp; GOGO.temp = sd < 0 ? Math.max(Math.min(was, -T.FLOW_GOGO), was - T.FLOW * 0.7 * dt) : Math.min(Math.max(was, T.FLOW_GOGO), was + T.FLOW * 0.7 * dt); if (GOGO.temp === was) GOGO.fSent = false; }
    if (G.under) { s.busy = true; s.target = null; gogo.lookAt(G.under.pos); }
    else { const w = tools.find(q => q.state === 'held'); if (w && !brain.busy) gogo.lookAt(w.pos); }                                 // 든 도구를 눈으로 따라간다
    if (L.warming && B.tok === L.warming) GOGO.temp = Math.min(0, GOGO.temp + 0.3 * dt); else L.warming = null;
    // 꽁 얼까 말까: 가장 차가운 채로 FREEZE_HOLD 초 — 사락사락 소리가 먼저 빨라진다
    if (GOGO.temp <= -0.97) { G.freezeT += dt; if ((G.tick -= dt) <= 0) { G.tick = 0.3 - 0.2 * G.freezeT / T.FREEZE_HOLD; snowS(); tone(1600 + 700 * G.freezeT, 1200, 0.03, { type: 'triangle', g: 0.03 }); } if (G.freezeT >= T.FREEZE_HOLD) { freeze(); return; } } else G.freezeT = Math.max(0, G.freezeT - dt * 2);
    if (GOGO.temp >= 0.97 && G.under) { G.hotT += dt; if (G.hotT >= T.HOT_HOLD) { G.hotT = 0; G.fled = G.under; G.under = null; run(coolDip); } } else G.hotT = 0;      // 너무 뜨거우면 등 밑에서 달아난다
    // 떨기 · 부채질(가만히 있을 때)
    const cold = GOGO.fCold && GOGO.temp <= T.COLD_AT + 0.15, hot = GOGO.fHot && GOGO.temp >= T.HOT_AT - 0.15, still = (G.under || !brain.busy) && !s.moving && !B.hop, want = still ? (cold ? 'shiver' : hot ? 'fan' : null) : null;
    if (want) { if (!s.act) gogo.act(want); if (!C.ask.active) gogo.setMood(cold ? 'cold' : 'hot', 0.3); } else if (!brain.busy && s.act && (s.act.name === 'shiver' || s.act.name === 'fan')) s.act = null;
    // 빙판: 발이 밀려 빨라지고, 빠르면 미끄러진다. 한 번 넘어진 뒤에는 양팔을 벌리고 지친다
    if (B.where === 'bench' && !B.hop && s.y === 0) {
      const fresh = onPuddleIce(s.pos.x, s.pos.z);                                            // 처음부터 깔린 빙판은 늘 지친다. 막 언 웅덩이에서는 처음 한 번 미끄러진다
      if ((fresh || onRink(s.pos.x, s.pos.z)) && s.v > 0.05) {
        const bo = fresh ? T.ICE_BOOST : T.RINK_BOOST, eff = s.v * bo; s.pos.x = clamp(s.pos.x + Math.sin(s.heading) * s.v * (bo - 1) * dt, -C.BENCH.X, C.BENCH.X); s.pos.z = clamp(s.pos.z + Math.cos(s.heading) * s.v * (bo - 1) * dt, C.BENCH.Z0, C.BENCH.Z1);
        if (fresh && !G.learned) { if (eff > T.SLIP_V) { slipStart(eff); return; } } else { if (!s.act) { gogo.act('skate'); seen.add('skate'); } G.skating = true; if (Math.random() < dt * 14) fx.spark(v3.set(s.pos.x, 0.04, s.pos.z), COL.frost, 1, 0.1, 0.3); }
      } else if (G.skating) { G.skating = false; if (s.act && s.act.name === 'skate') s.act = null; }
      // 부딪힘: 물건 · 대접 · 난로 · 접시 · 눈을 비켜 간다. 빙판 위 물건은 툭 밀려 나간다
      const out = (ox, oz, need, t) => { const dx = s.pos.x - ox, dz = s.pos.z - oz, d = Math.hypot(dx, dz) || 0.001; if (d >= need) return; if (t && (onIce(t.x, t.z) || t.ball) && s.v > 0.1) { const kk = onPuddleIce(t.x, t.z) ? 14 : 6; t.fsx -= dx / d * kk * dt; t.fsz -= dz / d * kk * dt; } s.pos.x += dx / d * (need - d); s.pos.z = clamp(s.pos.z + dz / d * (need - d), C.BENCH.Z0, C.BENCH.Z1); };
      if (!seated && !dipped) { for (const t of TH) if (usable(t) && t.y < 0.3) out(t.x, t.z, 0.3 * s.size + t.r * t.size * 0.85, t); if (L.vis > 0.9) out(bowl.x, bowl.z, 0.28 * s.size + bowl.r); for (const o of solids) if (o.on()) out(o.x, o.z, 0.28 * s.size + o.r); if (lump.on) out(lump.x, lump.z, 0.3 * s.size + lump.r * 0.9, lump); }
    }
  }
  function step(dt) {
    L.clock += dt;
    for (const w of tools) stepTool(w, dt);
    if (P.mode === 'bowl' && P.down && !H.spilled) { bowl.lean = Math.min(0.6, (L.clock - H.t0) / T.BOWL.tilt * 0.6); bowl.dx = 0; bowl.dz = 1; if (L.clock - H.t0 >= T.BOWL.tilt) { H.spilled = true; spill('front'); } }      // 길게 누르면 기울다가 쏟아진다
    stepDunk(dt);
    const moving = C.moving();
    for (const t of TH) {
      t.lit = tools.some(w => w.on === t); const ok = usable(t) && !moving;
      if (ok) slide(t, dt, P.mode === 'push' && P.down && H.thing === t && H.drag); else if (!moving) t.fsx = t.fsz = 0;
      if (t.ball && t.state === 'home' && !moving) { t.home.x = t.x; t.vx = 0; }
      const vy0 = t.vy; stepThing(t, dt);
      if (t === ball && vy0 < -THING.REST && t.vy > 0) {                                     // 공이 바닥에 닿았다: 언 공은 딱 하고 안 튀고, 데운 공은 말랑하게 높이 튄다
        const k = t.temp <= T.COLD_AT ? T.BALL.cold : t.temp >= T.HOT_AT ? T.BALL.hot : T.BALL.rest; t.vy *= k / THING.BOUNCE;
        if (t.fTossed) { t.fTossed = false; if (k === T.BALL.cold) { L.bCold = true; clickS(); seen.add('ballClack'); } else if (k === T.BALL.hot) { L.bHot = true; boingS(); t.v += 5; seen.add('ballBoing'); } if (L.bCold && L.bHot) seen.add('bounceChange');
          if (k !== T.BALL.rest && gogoFree() && !B.tok) { gogo.lookAt(centerOf(t, v3)); gogo.setMood('wow', 1); say(k === T.BALL.cold ? 'hm' : 'wow'); } }
      }
      t.fspinV += (-(t.fspinV) * 2.2) * dt; t.fspin += t.fspinV * dt; if (Math.abs(t.fspinV) < 0.3) { const near = Math.round(t.fspin / (Math.PI * 2)) * Math.PI * 2; t.fspin += (near - t.fspin) * Math.min(1, 5 * dt); } t.obj.rotation.y = t.fspin;
      if (t.fSent && !t.lit && Math.abs(t.x) > T.HALF.X && (!t.fSend || (t.x < 0) === (t.fSend.x < 0))) { const sd = t.x < 0 ? -1 : 1, was = t.temp; t.temp = sd < 0 ? Math.max(Math.min(was, -T.FLOW_TO), was - T.FLOW / Math.max(t.size, 0.3) * dt) : Math.min(Math.max(was, T.FLOW_TO), was + T.FLOW / Math.max(t.size, 0.3) * dt); if (t.temp === was && !t.fSend) t.fSent = false; }   // 보낸 것은 닿은 쪽의 온도가 된다(가만히 놓여 있던 것은 미지근한 채로 둔다)
      crossing(t, () => topOf(t, vWord));
    }
    if (lump.on && lump.hopT < 0 && !moving) { slide(lump, dt, P.mode === 'push' && P.down && H.thing === lump && H.drag); if (lump.fVy || lump.y > 0) { lump.fVy -= THING.GRAVITY * dt; lump.y += lump.fVy * dt; if (lump.y <= 0) { lump.y = 0; lump.fVy = 0; } } }
    if (!moving) collide();
    stepWater(dt); stepCorn(dt); stepSnow(dt); stepGogo(dt);
    // 가만두면 혼자 논다(조르는 중 · 도구를 쓰는 중에는 하지 않는다)
    if (!B.tok && G.mode === 'free' && !G.under && !s.moving && !B.hop && !C.ask.active && !P.down && !tools.some(w => w.state !== 'rest' || w.armed) && !moving) { B.idle += dt; if (B.idle > T.IDLE_PLAY) run(idlePlay); } else if (s.moving || P.down) B.idle = 0;
  }
  /** 이 자리에 없을 때도 도는 일: 가구가 들어가고 나온다 · 빛 · 그리고 모든 모형을 상태에 맞춘다(떠난 뒤 걷히는 것들도 여기서 사그라든다). */
  function bg(dt) {
    if (ownSkin) skin.tick(dt);      // 임시: 껍데기가 온도 겉(createTempSkin)을 만들어 돌리기 전까지 여기서 돌린다 — 껍데기가 먼저 만들었으면 ownSkin = false 라 돌지 않는다
    const to = L.here ? 1 : 0; if (L.vis === to && !L.here && !L.left) return; L.vis += clamp(to - L.vis, -T.FURN * dt, T.FURN * dt); const e = L.vis * L.vis * (3 - 2 * L.vis), show = L.vis > 0.01, c = L.clock; if (!L.here) L.clock += dt;
    for (const f of furn) { f.obj.position.y = -(1 - e) * f.drop; f.obj.visible = show; }
    lightL.intensity = T.LIGHT[0] * e; lightR.intensity = T.LIGHT[1] * e * (1 + 0.1 * Math.sin(c * 13) + 0.06 * Math.sin(c * 7.3)); part.stoveGlow.material.color.setHSL(0.07 + 0.02 * Math.sin(c * 9), 1, 0.55 + 0.1 * Math.sin(c * 13));
    if (show && L.here && Math.random() < dt * 2) puffs.emit(v3.set(T.STOVE[0], 1.05, T.STOVE[1]), '#dcd6e8', 1, 0.03, { v: [0, 0.5, 0], vr: 0.08, size: 0.14, grow: 0.25, a: 0.4, g: -0.1, life: [0.8, 1.3] });
    // 반반 바닥: 빙판과 따뜻한 나무 — 눈구름 밑에는 눈이 내리고 햇살 쪽에는 아지랑이
    rink.visible = warm.visible = show; rink.material.opacity = 0.93 * e; warm.material.opacity = (0.27 + 0.03 * Math.sin(c * 2.3)) * e;
    if (L.here && L.vis >= 1) {
      if (CLOUD.state === 'rest' && Math.random() < dt * 9) puffs.emit(v3.set(CLOUD.pos.x + rand(-0.3, 0.3), CLOUD.pos.y - 0.2, CLOUD.pos.z + rand(-0.15, 0.15)), COL.snow, 1, 0.05, { v: [rand(0, 0.5), -1.3, rand(-0.2, 0.3)], vr: 0.12, size: 0.07, a: 0.95, life: [0.9, 1.25] });
      if (Math.random() < dt * 2.5) fx.spark(v3.set(rand(-3.3, -0.3), 0.03, rand(-1, 1.05)), COL.frost, 1, 0.02, 0.25);
      if (Math.random() < dt * 3) puffs.emit(v3.set(rand(0.5, 3.3), 0.05, rand(-0.9, 1.05)), '#ffdcae', 1, 0.05, { v: [0, 0.45, 0], vr: 0.06, size: 0.16, grow: 0.22, a: 0.3, g: -0.1, life: [0.9, 1.4] });
    }
    // 도구
    for (const w of tools) {
      if (w.state === 'rest' && L.vis < 1) { w.pos.lerpVectors(w.from, w.rest, e); w.to.copy(w.rest); }
      const bob = w.state === 'rest' ? Math.sin(c * 2 + w.dir) * 0.025 : 0, hopA = w.armed ? Math.abs(Math.sin(c * 5)) * 0.1 : 0; w.obj.visible = show; w.obj.position.set(w.pos.x, w.pos.y + bob + hopA + Math.abs(w.kick) * 0.2, w.pos.z); w.obj.rotation.z = w.tilt + w.kick * 0.25;
      const act = w.on && w.dwell >= T.DWELL ? 1 : 0, pu = w.puff * (w.armed ? 1.12 : 1) * (0.3 + 0.7 * e);
      if (w.dir < 0) w.obj.scale.set(pu * (1 + 0.04 * Math.sin(c * 3)), pu * (1 - 0.04 * Math.sin(c * 3) - act * 0.08 * Math.abs(Math.sin(c * 14))), pu);
      else { w.obj.scale.setScalar(pu); part.sun.scale.setScalar(1 + 0.05 * Math.sin(c * 6) + act * 0.12); beam.material.opacity += ((act ? (w.on === GOGO ? 0.04 : 0.13) : w.state !== 'rest' ? 0.06 : 0.05 * e) - beam.material.opacity) * Math.min(1, 8 * dt); beam.scale.y = Math.max(0.4, w.pos.y - 0.25); }
    }
    // 대접
    const b = bowl; b.wv += (-90 * b.wob - 7 * b.wv) * dt; b.wob += b.wv * dt; if (!(P.mode === 'bowl' && P.down && !H.spilled)) b.lean = Math.max(0, b.lean - dt * 1.6);
    b.grp.rotation.set(b.dz * b.lean * 0.9 + b.wob * 0.05, 0, -b.dx * b.lean * 0.9 + b.wob * 0.08); bowlWater.visible = b.fill > 0.03 && b.iceK < 0.97; bowlWater.position.y = 0.07 + 0.13 * b.fill; bowlWater.scale.setScalar(0.72 + 0.28 * b.fill);
    cA.copy(cWater).lerp(cHot, clamp(b.temp, 0, 1)); if (b.tint) cTint.set(HEX[b.tint] || COL.water); bowlWater.material.color.copy(cA).lerp(cTint, b.tintK * 0.85);
    part.icecube.visible = b.iceK > 0.02; part.icecube.scale.set(0.9 + 0.1 * b.iceK, Math.max(0.02, b.iceK), 0.9 + 0.1 * b.iceK); part.icecube.position.y = -0.03; part.icecube.material.color.copy(cWhite).lerp(cTint, b.tint ? 0.8 * b.tintK : 0);
    lump.mesh.visible = lump.on && show; if (lump.on) { const k = 1 - lump.melt; lump.mesh.position.set(lump.x, lump.y - 0.06 * k, lump.z); lump.mesh.scale.set(0.9 + 0.2 * (1 - k), Math.max(0.03, k), 0.9 + 0.2 * (1 - k)); }
    // 웅덩이
    for (const p of puddles) { const vis = p.on && p.k > 0.01; p.water.visible = vis && p.iceK < 0.99; p.ice.visible = vis && p.iceK > 0.01; if (!vis) continue; const r = p.r * p.k;
      p.water.position.set(p.x, 0.006 + p.i * 0.0015, p.z); p.ice.position.set(p.x, 0.011 + p.i * 0.0015, p.z); p.water.scale.set(r, 1, r); p.ice.scale.set(r, 1, r); p.ice.material.opacity = Math.min(1, p.iceK * 1.1) * 0.96;
      cA.copy(cWater).lerp(cHot, clamp(p.temp, 0, 1)); if (p.tint) cA.lerp(cTint.set(HEX[p.tint] || COL.water), 0.8); p.water.material.color.copy(cA); p.water.material.opacity = 0.6 * (1 - clamp(p.heat / T.STEAM_GONE, 0, 1) * 0.5); p.ice.material.color.copy(cWhite).lerp(p.tint ? cTint.set(HEX[p.tint] || '#ffffff') : cWhite, 0.6); }
    // 옥수수 · 팝콘
    corn.grp.rotation.z = corn.wob * 0.12; part.kernels.visible = corn.k > 0.03; part.kernels.scale.setScalar(Math.max(0.03, corn.k)); part.kernels.position.x = corn.wob * 0.02;
    for (const p of pieces) if (p.st !== 'off') { p.m.position.set(p.x, p.y, p.z); p.m.rotation.set(p.rx, p.rx * 0.7, 0); p.m.scale.setScalar(Math.max(0.05, p.k) * (show ? 1 : 0.001)); }
    // 눈
    const sn = snow; sn.grp.visible = sn.state !== 'none' && show; sn.rollM.visible = sn.state === 'roll' && show;
    if (sn.grp.visible) { const m = 1 - sn.melt; sn.grp.position.set(sn.x, 0, sn.z); sn.grp.rotation.z = sn.wob * 0.1; sn.grp.scale.set(1 + 0.25 * sn.melt, Math.max(0.03, m), 1 + 0.25 * sn.melt);
      const pk = sn.state === 'man' ? 0.35 : sn.k * (1 - 0.75 * sn.roll); sn.pile.scale.set(Math.max(0.03, 0.4 + 0.6 * pk), Math.max(0.03, pk), Math.max(0.03, 0.4 + 0.6 * pk));
      sn.body.visible = sn.headM.visible = sn.state === 'man'; sn.body.scale.setScalar(0.34 * Math.max(0.03, sn.man)); sn.body.position.y = 0.3; sn.headM.visible = sn.head > 0; sn.headM.scale.setScalar(0.22 * Math.max(0.03, sn.head)); sn.headM.position.y = 0.3 + 0.3 + 0.16 * sn.head; }
    if (sn.rollM.visible) { const r = 0.08 + 0.26 * sn.roll, d = (0.34 + r) * s.size; sn.rollM.position.set(s.pos.x + Math.sin(s.heading) * d, r, s.pos.z + Math.cos(s.heading) * d); sn.rollM.scale.setScalar(r); sn.rollM.rotation.x = c * 5; }
    // 얼음 조각 · 고드름 · 컵의 물
    blk.v += (130 * ((blk.on ? 1 : 0) - blk.k) - 14 * blk.v) * dt; blk.k = Math.max(0, blk.k + blk.v * dt); blk.jv += (-120 * blk.jig - 6 * blk.jv) * dt; blk.jig += blk.jv * dt; block.visible = blk.k > 0.02;
    if (block.visible) { block.position.set(s.pos.x, s.y, s.pos.z); block.scale.set(s.size * blk.k * 0.92, s.size * blk.k, s.size * blk.k * 0.92); block.rotation.z = blk.jig * 0.12; block.rotation.y = s.heading; }
    const cold = clamp((-GOGO.temp - 0.45) / 0.4, 0, 1);
    for (const [bn, m] of antC) { m.visible = cold > 0.02; if (!m.visible) continue; const bone = gogo.bones[bn]; bone.getWorldPosition(v3); v3b.set(0, 1, 0).transformDirection(bone.matrixWorld); m.position.copy(v3).addScaledVector(v3b, 0.12 * s.size); m.position.y -= 0.035 * s.size; m.scale.setScalar(s.size * cold * 0.9); }
    const cc = clamp((-chair.temp - 0.3) / 0.5, 0, 1); for (const m of chairC) { m.visible = cc > 0.02; m.scale.set(1.2, cc * m.userData.k * 1.3, 1.2); }
    cupWater.visible = show; cupWater.scale.setScalar(Math.max(0.01, e)); cupWater.material.color.copy(cWater).lerp(cHot, clamp(cup.temp, 0, 1)); const ck = clamp((-cup.temp - 0.3) / 0.4, 0, 1) * e;
    cupIce.forEach((m, i) => { m.visible = ck > 0.02; m.scale.setScalar(Math.max(0.02, ck)); m.position.y = 0.52 + Math.sin(c * 2.2 + i * 2) * 0.012; });
    // 떠난 뒤: 남은 것이 다 사그라들고 물건의 돌림이 풀리면 쉰다
    if (!L.here) { let left = L.vis > 0; for (const p of puddles) if (p.on) { p.k -= dt * 2.5; if (p.k <= 0) p.on = false; else left = true; } for (const t of TH) if (t.fspin) { const near = Math.round(t.fspin / (Math.PI * 2)) * Math.PI * 2; t.fspin += (near - t.fspin) * Math.min(1, 6 * dt); if (Math.abs(near - t.fspin) < 0.01) t.fspin = 0; else left = true; t.obj.rotation.y = t.fspin; } if (blk.k > 0.02) left = true; L.left = left; }
  }
  // 웅덩이를 밟으면 찰박
  gogo.on('step', () => { if (!L.here) return; const p = inPuddle(s.pos.x, s.pos.z); if (p && !p.isIce) { drops(v3.set(s.pos.x, 0.03, s.pos.z), 3, 0.9); hiss(0.05, { g: 0.05, f: 1500 }); } });

  // ───────────────────────── 첫 손길(engine/first.js 가 부른다) ─────────────────────────
  const vRing = new THREE.Vector3(), first = {
    t: null, last: null, done: false, ready: () => first.done,
    /** n 번째 해 보이기: 고고가 물건 하나를 밀어 보낸다. 처음은 곁의 사과를 왼쪽(빙판)으로 → "Cold!", 그 뒤로는 번갈아 — 왼쪽 것을 오른쪽으로("Hot!"), 오른쪽 것을 왼쪽으로("Cold!"). */
    show(n) {
      first.done = false; first.t = null; if (!gogoFree() || L.sitTok || L.dipTok || !L.here) { first.done = true; return; }
      const ringT = first.pick(), pool = [things.apple, chair, cup, ball].filter(q => usable(q) && q.y < 0.05 && !q.fSend); let t = null, to = 0;
      if (n === 0 && pool.includes(things.apple) && things.apple.x < 0 && things.apple.temp > T.COLD_AT) { t = things.apple; to = -1; }
      else { const rest = pool.filter(q => q !== ringT && q !== first.last); t = rest.find(q => (q.x < 0) === (n % 2 === 1)) || rest[0] || pool[0]; }
      if (!t) { first.done = true; return; } first.last = t;
      run(async tok => {
        L.showTok = tok; first.t = t; await landed(tok);
        if (Math.hypot(s.pos.x - t.x, s.pos.z - t.z) > t.r * t.size + 0.8) await approach(tok, t, 0.08); else { s.faceTo = Math.atan2(t.x - s.pos.x, t.z - s.pos.z); await wait(tok, 0.22); }
        gogo.lookAt(centerOf(t, v3)); gogo.pose('poke', 1); await wait(tok, 0.16); if (!send(t, to)) { first.done = true; gogo.pose('poke', 0); return; } say('hm'); seen.add('firstShow');
        await until(tok, () => first.done, 3.5); gogo.pose('poke', 0); gogo.setMood('joy', 0.8); await wait(tok, 0.5);
        const r = first.pick(); if (r) { gogo.lookAt(centerOf(r, v3)); s.faceTo = Math.atan2(r.x - s.pos.x, r.z - s.pos.z); gogo.pose('reach', 1); gogo.setMood('smile', 1.6); say('want'); await wait(tok, 1.3); gogo.pose('reach', 0); }   // 내밀기: 다음 것을(그리고 그것이 갈 쪽을) 가리킨다
        await face(tok, 0);
      });
    },
    pick: () => [ball, cup, chair, things.apple].find(q => usable(q) && q !== first.t && !q.fSend) || null,
    ring() { const t = first.pick(); return t ? centerOf(t, vRing) : null; },
    r() { const t = first.pick(); return t ? Math.max(t.r, t.h * 0.5) * t.size + 0.14 : 0.4; },
  };
  const by = n => n === 'gogo' ? GOGO : things[n];
  const resolve = a => a === 'bowl' ? bowl : a === 'corn' ? corn : a === 'puddle' ? puddles.filter(p => p.on && !p.gone).sort((p, q) => q.born - p.born)[0] : a === 'spot' ? Object.assign(spot, { x: T.SPOT[0], z: T.SPOT[1] }) : a === 'snow' ? snow : a === 'ice' ? lump : by(a);
  /** 자동 확인: 도구를 그 대상 위에 sec 초 머물게 한다(쉬운 길과 같은 함수). */
  async function hold(w, a, sec, tick) { takeover(); const t = resolve(a); if (!valid(t)) return; C.ask.touch(); park(w, t, 99); for (let i = 0; i < 150 && w.on !== t; i++) await tick(); for (let i = 0; i < sec * 60; i++) { if (w.state === 'park') w.parkT = 99; await tick(); } unpark(w); }
  function miniBowl() { const g = new THREE.Group(), m = part.bowl.clone(), w = new THREE.Mesh(bowlWater.geometry, new THREE.MeshStandardMaterial({ color: COL.water, roughness: 0.1 })); m.castShadow = m.receiveShadow = false; w.position.y = 0.2; g.add(m, w); g.rotation.x = 0.5; return g; }

  return {
    id: 'frost', title: DATA.title, T, L, G, first, asks: DATA.asks, place: { ...T.PLACE, gogo: T.GOGO_HOME }, tools, bowl, corn, puddles, snow, lump,
    step, bg, onDown, onMove, onUp,
    /** 들어온다: 가구가 나온다. 지닌 온도로 문턱 깃발을 맞춘다(들어오자마자 "Cold!" 를 외치지 않게). */
    enter() { L.here = true; L.left = true; B.idle = 0; L.lastBy = {}; first.t = first.last = null; first.done = false; for (const t of [...TH, GOGO]) { t.fCold = t.temp <= T.COLD_AT; t.fHot = t.temp >= T.HOT_AT; t.fsx = t.fsz = 0; t.fSend = null; t.fSent = false; } },
    /** 떠난다: 도구는 걸이로, 웅덩이 · 빙판 · 눈 · 팝콘 · 얼음덩이는 걷는다. 온도는 물건에 남는다. 언 고고는 깨고 나온 뒤에 걷는다. */
    leave() {
      L.here = false; L.left = true; L.showTok = null; P.mode = null; H.tool = H.thing = null; for (const w of tools) { const was = w.on; w.on = null; if (was) stopApply(w, was); w.state = 'rest'; w.aim = null; w.armed = false; w.pos.copy(w.rest); w.to.copy(w.rest); }
      if (G.mode === 'statue') breakOut(true); G.mode = 'free'; G.under = G.fled = null; G.skating = false; gogo.mixer.timeScale = 1; brain.stop(); loopOff(); L.sitTok = L.dipTok = L.catchTok = L.snowTok = L.warming = null;
      if (!B.hop && B.where === 'bench' && s.y > 0) hop(s.pos.x, clamp(s.pos.z + 0.7, C.BENCH.Z0, C.BENCH.Z1), 0, 'bench', 0.35);
      for (const p of puddles) if (p.on) p.gone = true; for (const p of pieces) if (p.st !== 'off') p.st = 'away'; snow.state = 'none'; lump.on = false; corn.state = 'full'; corn.temp = 0; corn.keep = corn.n = 0;
      if (D.t) { D.t.vy = 0; D.t = null; } for (const t of [...TH, GOGO]) { t.fsx = t.fsz = 0; t.fspinV = 0; t.lit = false; t.fSend = null; t.fSent = false; } bowl.lean = 0; bowl.fill = 1; bowl.refill = 0;
    },
    /** 조르면 안 되는 때: 얼어 있는 중 · 미끄러지는 중 · 뛰는 중 · 앉거나 대접에 있는 중 · 도구가 고고 위에 있는 중. */
    busy: () => G.mode !== 'free' || !!B.hop || !!G.under || !!L.sitTok || !!L.dipTok || tools.some(w => w.state === 'held'),
    /** 몸으로 흉내: Cold = 어깨를 움츠리고 덜덜 · Hot = 손부채질. */
    mime(w, on) { if (!on) { loopOff(); return; } if (w === 'cold') { gogo.act('shiver'); gogo.setMood('cold', 4); say('brr'); } else { gogo.act('fan'); gogo.setMood('hot', 4); say('hot'); } },
    read: (n, k) => { if (n === 'bowl') return k === 'temp' ? bowl.temp : undefined; const t = by(n); return !t ? undefined : k === 'size' ? t.size : t[k]; },
    top: (n, out) => n === 'bowl' ? out.set(bowl.x, 0.55, bowl.z) : by(n) ? topOf(by(n), out) : out.set(s.pos.x, 1.2, s.pos.z),
    mini: n => n === 'bowl' ? miniBowl() : null,
    wiggle(n) { const t = things[n]; if (n === 'bowl') bowl.wv += 9; else if (t) { t.tvx += rand(-1, 1) * 3; t.tvz += (Math.random() < 0.5 ? -1 : 1) * 6; if (t.y === 0) { t.vy = 1.6; t.y = 0.001; } } else if (n === 'gogo' && !brain.busy) gogo.setMood('wow', 0.8); },
    summary: () => ({ frost: { mode: G.mode, learned: G.learned, gtemp: +GOGO.temp.toFixed(2), bowl: bowl.temp.toFixed(2) + (bowl.isIce ? ' ice' : '') + (bowl.tint ? ' ' + bowl.tint : '') + ' f' + bowl.fill.toFixed(1), puddles: puddles.filter(p => p.on).map(p => p.x.toFixed(1) + ',' + p.z.toFixed(1) + ' t' + p.temp.toFixed(2) + (p.isIce ? ' ice' : '') + (p.gone ? ' gone' : '')), corn: corn.state + ' ' + corn.temp.toFixed(2), snow: snow.state + ' ' + snow.k.toFixed(2), lump: lump.on, tools: tools.map(w => w.kind + ':' + w.state + (w.armed ? '*' : '') + (w.on ? '>' + w.on.name : '')), pieces: pieces.filter(p => p.st !== 'off').length } }),
    auto: {
      spill: a => { takeover(); C.ask.touch(); spill(a || 'front'); },
      cold: (a, b, tick) => hold(CLOUD, a, +b || 1, tick), hot: (a, b, tick) => hold(LAMP, a, +b || 1, tick),
      walk: (a, b) => { takeover(); C.ask.touch(); if (a === 'gogo') { const p = resolve(b || 'puddle'); if (p && G.mode === 'free') run(tok => crossRink(tok, p)); } else C.tapBench(+a, +b); },
      shove: (a, b) => { takeover(); const t = by(a), o = by(b) || resolve(b); if (t && o && usable(t)) shove(t, o.x - t.x, o.z - t.z); },
      drop: a => { takeover(); toss(by(a)); }, sit: () => { takeover(); C.ask.touch(); if (G.mode === 'free' && !(L.sitRun && B.tok === L.sitRun)) run(sitTask); }, dunk: a => { takeover(); C.ask.touch(); dunk(by(a)); },
      send: (a, b) => { takeover(); C.ask.touch(); if (a === 'gogo') goSide(); else if (send(by(a), b === 'left' ? -1 : b === 'right' ? 1 : 0)) C.ask.act(); },
      arm: a => arm(a === 'lamp' ? LAMP : CLOUD, true), tap: (a, b) => { const c = a === 'cloud' || a === 'lamp' ? stage.screenOf((a === 'lamp' ? LAMP : CLOUD).pos) : stage.screenOf(topV(resolve(a), v3).setY(resolve(a).kind ? 0.1 : topY(resolve(a)) * 0.5)); P.x = c.x; P.y = c.y; P.down = true; C.ask.touch(); onDown({ clientX: c.x, clientY: c.y }); if (b !== 'hold') { P.down = false; onUp(); P.mode = null; } },
      move: async (a, b, tick) => { const t = resolve(a), c = stage.screenOf(v3.set(t.x, P.mode === 'tool' ? T.HOLD_Y : 0, t.z)), x0 = P.x, y0 = P.y, n = Math.max(1, Math.round((+b || 0.3) * 60)); for (let i = 1; i <= n; i++) { P.x = x0 + (c.x - x0) * i / n; P.y = y0 + (c.y - y0) * i / n; onMove({ clientX: P.x, clientY: P.y }); await tick(); } },
      up: () => { P.down = false; onUp(); P.mode = null; }, out: () => takeOut(),
      dbg: () => console.log('DBG ' + JSON.stringify({ seen: [...seen], said: voice.said, ...this_summary() })),
    },
  };
  function this_summary() { return { mode: G.mode, gogo: [s.pos.x.toFixed(2), s.pos.z.toFixed(2), s.y.toFixed(2), s.act ? s.act.name : '', s.mood], temps: Object.fromEntries(targets.map(t => [t.name, t.temp.toFixed(2)])), bowl: bowl.temp.toFixed(2) + (bowl.isIce ? ' ice' : '') + (bowl.tint || ''), puddles: puddles.filter(p => p.on).map(p => p.temp.toFixed(2) + (p.isIce ? 'ice' : '') + (p.gone ? 'gone' : '')), corn: corn.state, snow: snow.state + snow.k.toFixed(2), tools: tools.map(w => w.state + (w.on ? '>' + w.on.name : '')), errors: brain.errors }; }
}
