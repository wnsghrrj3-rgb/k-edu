/* 마법 연구소 · 자리 ② 둥둥 띄우기 (Up / Down) — 통합 설계서 L1-3-3, 연구소 설계 v1 의 7장 · 묶음 3-1. 주인공은 몬스터 고고.
 * 하는 일: 방울병으로 씌우기 → 뜬 방울을 밀기 → 톡 터뜨리기(고고 · 사과 · 컵 · 의자 · 공).
 *   방울병을 집어 대상 위로 가져가면 방울이 부풀어 감싸고, 놓으면 떠오른다. 대상을 바로 눌러도 방울병이 날아와 씌운다(쉬운 길).
 *   뜬 방울은 손을 느리게 따라오고 놓으면 미끄러지듯 흘러간다. 짧게 톡 누르면 터져 떨어진다.
 * 영어는 대상의 바닥이 실험대에서 0.25 뜬 순간의 "Up!" 과 방울이 터져 떨어지기 시작하는 순간의 "Down!", 만졌을 때의 이름,
 *   방울 둘이 합쳐질 때 세 번에 한 번 "Pop!", 그리고 고고의 부탁 일곱("Apple, up!" …). 낱말 · 부탁 · 수치는 자료(data/lab.js 의 stations.float)에서만 읽는다.
 * 방울은 모형이 아니라 코드로 그린다(얇은 막 · 가장자리 무지갯빛 · 움직이는 반대쪽으로 늘어지는 꼬리 · 터질 때 물방울 여덟 알).
 * 물리는 손으로 짰다(라이브러리 없음): 방울 = 공 하나 · 떠오르는 힘과 공기 저항 · 공과 면의 부딪힘 · 세게 부딪히면 하나로 합쳐짐. 떨어진 것은 things.js 의 중력과 튐.
 * 무대 · 물건 · 고고 · 입력 · 부탁 · 배경 소리는 껍데기(lab.js)가 쥐고, 여기는 이 자리의 일만 한다. 소리는 전부 합성(임시)이다.
 * 첫 손길(설계 v1.1 · 0장 · 자료 stations.float.first): 들어가면 사과가 이미 방울에 담겨 떠 있고 작은 방울들이 떠다닌다 → 고고가 방울병을 불어 공을 띄운다("Up!")
 *   → 사과 방울이 아이 앞으로 흘러오고 빛 고리가 따라다닌다 → 방울을 누르면 퐁 "Down!", 실험대의 물건을 누르면 방울이 씌워져 "Up!"(누르기만으로 둘 다).
 *   「톡」과 「밀기」는 손이 움직인 거리로만 가른다(TAP_PX 안이면 얼마나 오래 눌렀든 톡 — 자료의 TAP_MS 는 쓰지 않는다. 천천히 누르는 1학년 때문).
 * 자동 확인 명령: wrap:이름[:near] · pop:이름 · fling:이름:이름(세게 끌어다 부딪침) · push:이름:이름(살살 끌어다 댐 — 방울이 아닌 것이면 그 위로) · window · bottle:이름(방울병을 끌어다 씌움) · lamp:번호 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, rand, Q } from '../../../engine/stage.js?v=2';
import { sfx, tone, hiss, chirp } from '../../../engine/sound.js?v=2';
import { stepThing, centerOf, topOf, pickAt, THING } from '../../../engine/things.js?v=2';

// ───────────────────────── 수치(자료에 없는 것만 — 방울의 수치는 자료 stations.float.T) ─────────────────────────
export const T = {
  HOME: [0, 0.05],                           // 고고가 서는 자리(가로 화면에서 발이 도구 그림에 가리지 않게 조금 뒤로)
  CEIL_PAD: 0.42, CEIL_MIN: 3.3, CEIL_K: 4,  // 「보이는 천장」 = 화면 맨 위에서 이만큼 아래(자료의 CEIL 을 넘지 않는다) · 가장 낮아도 이만큼 · 따라가는 빠르기
  BOTTLE: { at: [3.28, 0.92], z: 1.05, tip: [-0.16, 0.34], follow: 26, back: 0.45, over: [0.34, 0.42, 0.5], dwell: 0.12 },   // 방울병: 서 있는 자리(지팡이 꽂이 자리) · 든 깊이 · 손가락에서 병 바닥까지 · 따라오는 빠르기 · 돌아가기까지 · 날아가 머무는 자리(대상 위에서) · 대상 위에 이만큼(초) 머물러야 씌운다(지나가기만 한 것은 씌우지 않는다)
  LAMP: { xs: [-2.0, 0.9], z: -0.1, DROP: 1.07, BULB: 0.8, R: 0.3, K: 9, C: 0.8, REACH: 0.95, PULL: 9, NEAR: 0.25 },   // 등: 가로 자리 · 깊이 · 손잡이 고리까지 · 불빛 알까지 · 부딪히는 반지름 · 흔들림 용수철 · 고고 손이 닿는 높이(키의 배수) · 끌려가는 세기
  SHELF: { x: 2.72, y: 3.0, under: 1.25 },   // 높은 선반: 자리 · 천장에서 적어도 이만큼 아래
  WINDOW: { at: [-0.35, 2.55], z: -1.66, r: 0.87, open: 1.9, k: 6 },   // 둥근 창(방의 창과 같은 자리) · 창짝이 열리는 각 · 빠르기
  FURN: 1.25, FURN_UP: 3.6, FURN_DROP: 1.6, FURN_BACK: 0.75,   // 가구가 나오고 들어가는 빠르기(0.8초) · 들보가 올라가 숨는 높이 · 방울병이 내려가는 깊이 · 선반과 창짝이 벽 속으로 들어가는 깊이
  PICK_PAD: 14, EASY_BREAK: 70,              // 방울을 눌렀다고 보는 여유(픽셀) · 대상을 누른 채 이만큼 끌면 방울병을 든 것으로 본다
  WOB_K: 150, WOB_C: 7,                      // 방울이 출렁이는 용수철
  TAIL: 0.085, TAIL_MAX: 0.3,                // 움직일 때 반대쪽으로 늘어지는 정도(빠르기 1 에) · 끝
  HAND: 1.4,                                 // 손으로 민 뒤 이 시간(초) 안의 부딪힘만 합쳐지거나 더듬이에 터진다(저절로 떠오르다 붙는 것은 말랑하게 튕기기만)
  PAIR_K: 1.08, RING_K: 1.05,                // 합쳐진 방울의 크기(안의 것들을 나란히 놓은 반지름의 배수)
  EMPTY_R: 0.26, EMPTY_K: 0.4, EMPTY_TOP: 1.1,   // 고고가 분 빈 방울: 반지름 · 떠오르는 힘의 배수 · 천장에서 터지기까지(초)
  FROST_RISE: 1.3, FROST_SINK: 0.28,         // 언 것의 방울: 이만큼(초) 오르다가 이 빠르기로 가라앉는다
  HOT_K: 1.5, HOT_POP: 1.7,                  // 뜨거운 것의 방울: 떠오르는 힘의 배수 · 이만큼(초) 오르다 저절로 터진다
  SEAT: 0.475, RIDE_NEAR: 1.1, RIDE_WAIT: 1.5,   // 의자의 앉는 높이 · 고고가 이 거리 안에 있으면 올라탄다 · 방울이 고고를 기다려 주는 시간
  FLAIL: 0.8, GIGGLE: [1.4, 2.6],            // 뜨면 허우적거리는 시간 · 헤엄치며 깔깔거리는 사이
  DIZZY_GAP: 10, DIZZY_SEC: 3,               // 이 시간 안에 두 번 떨어지면 어지럽다 · 어지러운 시간
  TRAP: { pad: 0.36, fit: 0.9, walk: 1.7, lift: 2.5, depth: 0.55 },   // 컵이 고고 위로 떨어져 씌워지는 가로 여유 · 컵 안 반지름이 고고 머리의 이 배수는 돼야 · 허둥대는 시간 · 들고 나오는 때 · 컵 깊이(키의 배수)
  TOP_NEAR: 1.3, BIG_BOUNCE: 2.4,            // 공을 천장에서 이 거리 안까지 올렸다 터뜨리면 「천장까지」 · 「크게 튄다」고 보는 빠르기
  ANT_V: 0.35,                               // 뜬 고고를 밀어 이보다 빠르게(합쳐질 만큼은 아니게) 대면 더듬이가 남의 방울을 터뜨린다
  LOW: 1.45,                                 // 방울 바닥이 이보다 낮으면(고고 키의 배수) 더듬이로 건드려 본다
  HEAVY_FREE: 0.8,                           // 큰 것이 방울 둘로 HEAVY_TOP 보다 이만큼 더 오르면 「천장까지 간다」
  AUTO_FLING: 5, AUTO_PUSH: 1.2, AUTO_ABOVE: 0.7,   // 자동 확인: 세게 끄는 빠르기 · 살살 끄는 빠르기 · 방울이 아닌 것 위로 댈 때의 높이
  ALL_GAP: 2.6,                              // 다섯이 다 떴을 때의 "Up! Up! Up!" 은 마지막 "Up!" 뒤 이만큼(초) 지나서(같은 말을 2.5초 안에 되풀이하지 않게)
  PRE: { y: 1.9, k: 6, c: 4, hand: [-0.55, 1.5, 0.7], bob: 0.07 },   // 첫 손길 — 차려 놓은 사과 방울이 떠 있는 높이 · 그 자리에 머무는 용수철 · 해 보인 뒤 아이 앞으로 흘러오는 자리(x, y, z) · 둥실거림
  SHOT: 0.3, SHOW_BLOW: 0.38, SHOW_POP: 0.45,   // 해 보이기: 고고가 분 방울이 날아가는 시간 · 불기 시작해서 방울이 나오기까지 · 뛰어올라 터뜨리기까지
  OTHER_GAP: 0.6,                            // 다른 물건으로 같은 낱말을 내면 이만큼만 지나도 말한다(고고가 해 보인 직후 아이의 첫 누르기가 조용하지 않게 — 같은 물건이면 2.5초 그대로)
  DECOR: { n: 6, r: [0.06, 0.13], up: [0.12, 0.3], back: 2.5 },   // 꾸밈 방울(물건을 싣지 않는다 · 방울 한도에 넣지 않는다): 수 · 반지름 · 떠오르는 빠르기 · 터뜨린 뒤 다시 나오기까지
  SHAKE: 0.05,
};
const LITE = Q.has('lite');   // 느린 기기: 무지갯빛을 끈다(주소 꼬리 ?lite — 무대에 가벼운 판이 생기면 그것을 따른다)

// ───────────────────────── 방울 그리기(코드) ─────────────────────────
const BUBBLE_VERT = `
uniform float uTime, uWob; uniform vec3 uVel;
varying vec3 vN, vV, vW;
void main() {
  vec3 p = position, n = normal;
  // 겉이 잔잔히 일렁인다(부딪히면 크게)
  float w = sin(p.y * 4.0 + uTime * 5.0) * sin(p.x * 3.0 + uTime * 3.7) * 0.03 + sin(p.z * 5.0 - uTime * 4.3) * 0.018;
  p += n * w * (0.4 + uWob * 4.0);
  // 움직이는 반대쪽이 늘어진다(물방울 꼬리)
  float len = length(uVel);
  if (len > 0.0005) { vec3 d = uVel / len; float a = 0.5 - 0.5 * dot(n, d); p -= d * len * a * a; }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * n); vV = mv.xyz; vW = position;
  gl_Position = projectionMatrix * mv;
}`;
const BUBBLE_FRAG = `
uniform float uTime, uIris, uTintK, uFrost, uAlpha; uniform vec3 uTint;
varying vec3 vN, vV, vW;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 n = normalize(vN), v = normalize(-vV);
  float ndv = abs(dot(n, v)), fr = pow(1.0 - ndv, 2.0);
  // 얇은 막의 무지갯빛: 가장자리로 갈수록, 아래로 갈수록 두께가 달라 색이 돈다
  float th = fr * 1.9 + vW.y * 0.3 + sin(vW.x * 3.0 + uTime * 0.7) * 0.12 + uTime * 0.04;
  vec3 iris = 0.56 + 0.44 * cos(6.2832 * (th + vec3(0.0, 0.33, 0.67)));
  vec3 col = mix(vec3(0.93, 0.97, 1.0), iris, uIris * (0.35 + 0.55 * fr));
  col = mix(col, uTint, uTintK * 0.62);
  float a = 0.07 + fr * 0.78 + uTintK * 0.14;
  // 서리: 흰 알갱이가 낀다
  float fz = hash(floor(vW.xy * 15.0) + floor(vW.z * 15.0)); a += uFrost * (0.2 + 0.3 * step(0.72, fz)); col = mix(col, vec3(0.94, 0.98, 1.0), uFrost * 0.7);
  if (gl_FrontFacing) {
    // 창이 비친 흰 빛 둘(왼쪽 위 큰 것 · 오른쪽 아래 작은 것)
    float h1 = smoothstep(0.05, 0.0, length((n.xy - vec2(-0.56, 0.6)) * vec2(1.0, 1.6)) - 0.085), h2 = smoothstep(0.035, 0.0, length(n.xy - vec2(0.44, -0.52)) - 0.05);
    float h = max(h1, h2 * 0.75); col = mix(col, vec3(1.0), h); a = max(a, h * 0.9);
  } else a *= 0.4;
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uAlpha);
}`;

/** C = 껍데기가 넘기는 것(lab.js 의 C). 모형(assets/lab_float.glb)을 받고 자리를 돌려준다. */
export async function create(C) {
  const { stage, scene, camera, gogo, brain, things, GOGO, targets, fx, voice, seen, P, BENCH, LAB, name, say } = C, s = gogo.state;
  const D = LAB.stations.float.T, ME = LAB.stations.float, W_UP = LAB.words.up, W_DOWN = LAB.words.down, W_POP = LAB.words.pop, HEX = LAB.stations.potion.colors.hex, TEMP = LAB.stations.frost.T;
  const B = brain.B, { run, wait, until, walk, face } = brain, { cup, ball } = things, by = n => n === 'gogo' ? GOGO : things[n];
  const v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), vWord = new THREE.Vector3(), has = n => !!gogo.info[n], durOf = (n, d) => has(n) ? gogo.info[n].dur : d;
  const glb = await new GLTFLoader().loadAsync(new URL('../../../assets/lab_float.glb?v=1', import.meta.url).href), M = {};
  glb.scene.traverse(o => { if (o.isMesh) M[o.name] = o; });
  for (const k in M) { M[k].castShadow = k !== 'win_sky'; M[k].receiveShadow = true; }

  // ── 소리(전부 합성 · 임시 — 자료의 sounds: 방울 부풂 · 방울 퐁 · 말랑 부딪힘 · 바람 · 등 삐걱 · 쿵 납작)
  const snd = {
    inflate: () => { tone(280, 820, 0.3, { g: 0.07 }); hiss(0.3, { g: 0.03, f: 2400, q: 1.2 }); },
    pop: r => { tone(1500 / (0.6 + r), 380, 0.07, { type: 'triangle', g: 0.2 }); hiss(0.06, { g: 0.14, f: 4200, q: 0.8 }); },
    soft: () => tone(900, 600, 0.05, { type: 'triangle', g: 0.05 }),
    boing: v => tone(210, 300, 0.13, { g: 0.1 * clamp(v, 0.2, 1) }),
    merge: () => { tone(420, 240, 0.2, { g: 0.14 }); tone(600, 940, 0.14, { type: 'triangle', g: 0.1, at: 0.12 }); },
    wind: () => hiss(1.5, { g: 0.07, f: rand(420, 640), q: 0.5 }),
    creak: () => { tone(520, 470, 0.16, { type: 'sawtooth', g: 0.03 }); tone(455, 500, 0.18, { type: 'sawtooth', g: 0.025, at: 0.2 }); },
    splat: v => { sfx.splat(); sfx.thud(v); },
  };
  const hi = () => C.voiceK() * (1 + D.GOGO_VOICE * Math.max(0, s.y)), cry = kind => chirp(kind, hi());      // 고고의 목소리: 높이 1 오를 때마다 6% 높게
  const pitchOf = t => t === GOGO ? clamp(1.25 - (s.size - 1) * 0.9, 0.3, 2) * (1 + D.GOGO_VOICE * Math.max(0, s.y)) : undefined;

  // ───────────────────────── 방이 꺼내 놓는 것 ─────────────────────────
  const F = { here: false, vis: 0, ceil: D.CEIL, clock: 0 };                 // ceil = 보이는 천장(들보 아랫면)
  const beam = new THREE.Group(); beam.add(M.beam); scene.add(beam);
  const lamps = T.LAMP.xs.map((x, i) => {
    const g = new THREE.Group(), bulb = i ? M.lamp_bulb.clone() : M.lamp_bulb; g.add(i ? M.lamp.clone() : M.lamp); bulb.material = M.lamp_bulb.material.clone(); bulb.material.emissive = new THREE.Color('#ffc978'); bulb.material.emissiveIntensity = 0.9; bulb.castShadow = false; g.add(bulb);
    g.position.set(x, 0, 0); beam.add(g); return { g, bulb, x, ang: 0, av: 0, hung: false };
  });
  const lampAt = (L, d, out) => out.set(L.x + Math.sin(L.ang) * d, F.ceil - Math.cos(L.ang) * d, T.LAMP.z);      // 등의 고리에서 d 만큼 내려온 점(흔들린 채로)
  const shelf = M.shelf; scene.add(shelf);
  const win = new THREE.Group(), wx = T.WINDOW.at[0], wy = T.WINDOW.at[1]; win.add(M.win_sky, M.win_L, M.win_R); scene.add(win);
  M.win_sky.material = M.win_sky.material.clone(); M.win_sky.material.emissive = new THREE.Color('#bfe2ff'); M.win_sky.material.emissiveIntensity = 0.35;
  M.win_L.position.set(-T.WINDOW.r, 0, 0.03); M.win_R.position.set(T.WINDOW.r, 0, 0.03);
  const WN = { want: 0, k: 0, wind: 0, gust: 0 };
  const streaks = Array.from({ length: 6 }, (_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.022), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); m.userData = { u: i / 6, y: rand(-0.6, 0.6), w: rand(0.6, 1.3) }; m.renderOrder = 3; scene.add(m); return m; });
  // 방울병(지팡이 꽂이 자리에 선다)
  const bottleRest = new THREE.Vector3(T.BOTTLE.at[0], 0, T.BOTTLE.at[1]);
  const BT = { obj: M.bottle, state: 'rest', pos: bottleRest.clone(), to: bottleRest.clone(), back: 0, tilt: 0, on: null, puff: 0 }; scene.add(BT.obj);
  const heldPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -T.BOTTLE.z), ceilPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -T.LAMP.z), zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  // 아래 그림자(뜬 것이 어디 위에 있는지) · 어지러운 별
  const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(90,50,40,.8)'); gr.addColorStop(0.6, 'rgba(90,50,40,.35)'); gr.addColorStop(1, 'rgba(90,50,40,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const blobs = new Map(targets.map(t => { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0 })); m.renderOrder = 2; m.visible = false; scene.add(m); return [t, m]; }));
  const stars = new THREE.Group(); for (let i = 0; i < 3; i++) { const st = i ? M.star.clone() : M.star; st.castShadow = false; st.position.set(Math.cos(i * 2.094) * 0.4, 0, Math.sin(i * 2.094) * 0.4); stars.add(st); } stars.visible = false; scene.add(stars);
  // 터질 때 튀는 물방울(여덟 알씩)
  const DROPS = 48, dropMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: '#eef8ff', transparent: true, opacity: 0.85, depthWrite: false }), DROPS), drops = Array.from({ length: DROPS }, () => ({ life: 0, max: 1, p: new THREE.Vector3(), v: new THREE.Vector3(), r: 0.04 })), dm = new THREE.Matrix4(); let dropNext = 0;
  dropMesh.frustumCulled = false; dropMesh.renderOrder = 5; dropMesh.count = DROPS; scene.add(dropMesh);
  function burst(b) { for (let i = 0; i < 8; i++) { const q = drops[dropNext], a = i / 8 * Math.PI * 2 + rand(-0.2, 0.2); dropNext = (dropNext + 1) % DROPS; q.life = q.max = rand(0.35, 0.6); q.r = rand(0.03, 0.055) * clamp(b.R / 0.5, 0.7, 1.5); q.p.set(b.x + Math.cos(a) * b.R * 0.9, b.y + Math.sin(a) * b.R * 0.9, b.z + rand(-0.1, 0.1)); q.v.set(Math.cos(a) * rand(1.6, 2.8) + b.vx * 0.5, Math.sin(a) * rand(1.6, 2.8) + 1.2, rand(-0.4, 0.4)); } }
  function stepDrops(dt) { for (let i = 0; i < DROPS; i++) { const q = drops[i]; if (q.life > 0) { q.life -= dt; q.v.y -= 7 * dt; q.p.addScaledVector(q.v, dt); } const k = q.life > 0 ? q.r * Math.min(1, q.life / q.max * 2.5) : 0; dm.makeScale(k, k, k).setPosition(q.p); dropMesh.setMatrixAt(i, dm); } dropMesh.instanceMatrix.needsUpdate = true; }

  // ───────────────────────── 방울 ─────────────────────────
  const geo = new THREE.SphereGeometry(1, 40, 26), bubbles = [], of = new Map(), falls = new Map(), drift = new Map(), upSaid = new Set();      // of = 물건 → 그것을 싣고 있는 방울 · falls = 터져 떨어지는 중인 물건
  const pool = Array.from({ length: D.MAX_BUBBLES }, () => {
    const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: BUBBLE_VERT, fragmentShader: BUBBLE_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uWob: { value: 0 }, uVel: { value: new THREE.Vector3() }, uIris: { value: LITE ? 0 : 1 }, uTint: { value: new THREE.Color('#ffffff') }, uTintK: { value: 0 }, uFrost: { value: 0 }, uAlpha: { value: 1 } } }));
    m.visible = false; m.frustumCulled = false; m.renderOrder = 4; m.userData.on = false; scene.add(m); return m;
  });
  // 꾸밈 방울(첫 손길의 「이미 벌어진 일」 — 작은 방울들이 둥실 떠다닌다. 물건을 싣지 않고 부딪히지도 않는다. 눌러 터뜨릴 수는 있다 — 낱말은 없다)
  const mkFilm = () => new THREE.ShaderMaterial({ vertexShader: BUBBLE_VERT, fragmentShader: BUBBLE_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uTime: { value: 0 }, uWob: { value: 0 }, uVel: { value: new THREE.Vector3() }, uIris: { value: LITE ? 0 : 1 }, uTint: { value: new THREE.Color('#ffffff') }, uTintK: { value: 0 }, uFrost: { value: 0 }, uAlpha: { value: 1 } } });
  const decoMat = mkFilm(), decoGeo = new THREE.SphereGeometry(1, 20, 14), deco = Array.from({ length: T.DECOR.n }, (_, i) => { const m = new THREE.Mesh(decoGeo, decoMat); m.visible = false; m.renderOrder = 3; scene.add(m); return { m, x: 0, y: 0, z: 0, r: 0.1, v: 0.2, ph: i * 1.7, k: 0, wait: i * 0.25, first: true }; });
  const shotMesh = new THREE.Mesh(decoGeo, decoMat); shotMesh.visible = false; shotMesh.renderOrder = 4; scene.add(shotMesh);
  function stepDeco(dt) {
    const on = F.here && !C.nofirst; decoMat.uniforms.uTime.value = F.clock;
    for (const d of deco) {
      if (d.wait > 0 || !on) { d.wait -= dt; d.k = Math.max(0, d.k - dt * 5); if (d.wait <= 0 && on) { d.r = rand(...T.DECOR.r); d.v = rand(...T.DECOR.up); d.x = rand(-3.4, 3.4); d.z = rand(-0.9, 0.7); d.y = d.first ? rand(0.5, F.ceil - 0.5) : 0.15; d.first = false; d.k = 0; } }
      else { d.k = Math.min(1, d.k + dt * 2.5); d.y += d.v * dt; d.x += Math.sin(F.clock * 0.7 + d.ph) * 0.12 * dt + (WN.wind > 0 && WN.k > 0.6 ? D.WIND * 0.6 * dt : 0); if (d.y > F.ceil - d.r - 0.05 || Math.abs(d.x) > D.WALL_X) d.wait = rand(0.3, 1.5); }
      d.m.visible = d.k > 0.02; d.m.position.set(d.x, d.y, d.z); d.m.scale.setScalar(d.r * d.k);
    }
  }
  // 첫 손길의 상태: b = 차려 놓은 방울(사과) · hand = 해 보인 뒤(아이 앞으로 흘러온다) · shot = 고고가 분 방울이 날아가는 중 · t = 고고가 띄워 보인 물건 · done = 해 보이기에서 낱말까지 나왔다
  const PRE = { b: null, hand: false, shot: null, t: null, done: false, showing: false, tok: null, gen: 0, lastBy: {} }, vRing = new THREE.Vector3();
  const gapFor = (w, t) => { const g = PRE.lastBy[w] && PRE.lastBy[w] !== t.name ? T.OTHER_GAP : undefined; PRE.lastBy[w] = t.name; return g; };
  const half = t => (t.ball ? t.r : t.h * 0.5) * t.size, big = t => Math.max(t.r, t.h * 0.5) * t.size;      // 바닥에서 가운데까지 · 안에 들어가는 반지름
  const baseY = t => t === GOGO ? s.y : t.y, holds = (b, t) => b.items.some(i => i.t === t);
  const free = () => !of.has(GOGO) && !G.fall && G.splat <= 0 && G.dizzy <= 0 && !TR.on && !G.ride && B.where === 'bench' && !B.hop;      // 고고가 실험대에 멀쩡히 서 있는가
  const canWrap = t => !of.has(t) && bubbles.length < D.MAX_BUBBLES && F.here && (t === GOGO ? free() : (t.state === 'home' || t.state === 'up' || t.state === 'down') && t.y < 0.3 && !falls.has(t));
  function newBubble(x, y, z, R) {
    const mesh = pool.find(m => !m.userData.on); if (!mesh || bubbles.length >= D.MAX_BUBBLES) return null; mesh.userData.on = true;
    const b = { mesh, items: [], x, y, z, ax: x, vx: 0, vy: 0, R, Rto: R, R0: R, k: 0, mode: 'wrap', held: false, grab: false, hand: 99, lifts: 1, wob: 0, wobV: 0, age: 0, air: 0, hang: null, hangCool: 0, wait: 0, ride: false, empty: false, hot: 0, top: 0, tintK: 0, frost: 0, tail: new THREE.Vector3(), saidHeavy: false };
    bubbles.push(b); return b;
  }
  /** 방울 안의 것들을 놓는 자리(가운데에서 얼마나 떨어져 있나)와 방울의 크기를 정한다. 하나면 가운데, 둘이면 나란히, 셋부터는 둥글게. 의자에 탄 고고는 의자 위에. */
  function lay(b) {
    const it = b.items, n = it.length; if (!n) { b.Rto = b.R0; return; }
    if (b.ride) { const ch = it.find(i => i.t.name === 'chair'), g = it.find(i => i.t === GOGO);
      if (ch && g && n === 2) { const H = T.SEAT * ch.t.size + GOGO.h * s.size; ch.tox = g.tox = 0; ch.toy = -H / 2 + half(ch.t); g.toy = -H / 2 + T.SEAT * ch.t.size + GOGO.h * s.size / 2; b.Rto = Math.max(H / 2, big(ch.t)) * 1.12; return; } b.ride = false; }
    if (n === 1) { it[0].tox = it[0].toy = 0; b.Rto = big(it[0].t) * D.BUBBLE_R; return; }
    if (n === 2) { const r0 = big(it[0].t), r1 = big(it[1].t); it[0].tox = -r1; it[1].tox = r0; it[0].toy = it[1].toy = 0; b.Rto = (r0 + r1) * T.PAIR_K; return; }
    const rm = Math.max(...it.map(i => big(i.t))), ring = rm / Math.sin(Math.PI / n); it.forEach((i, k) => { const a = Math.PI / 2 + k / n * Math.PI * 2; i.tox = Math.cos(a) * ring; i.toy = Math.sin(a) * ring; }); b.Rto = (ring + rm) * T.RING_K;
  }
  const floorOf = b => b.items.length ? Math.max(...b.items.map(i => half(i.t) - i.oy)) : b.R;      // 안의 것이 실험대에 닿는 방울 가운데 높이
  /** 방울이 안의 것들을 싣고 다닌다(물건의 자리는 방울이 정한다). */
  function carry(b, dt) {
    for (const i of b.items) {
      const k = Math.min(1, 8 * dt); i.ox += (i.tox - i.ox) * k; i.oy += (i.toy - i.oy) * k; const t = i.t, cx = b.x + i.ox, cy = b.y + i.oy;
      if (t === GOGO) { s.pos.x = cx; s.pos.z = b.z; s.y = Math.max(0, cy - GOGO.h * s.size / 2); s.target = null; }
      else { t.x = cx; t.z = b.z; t.y = Math.max(0, cy - half(t)); t.vy = 0; t.floor = t.y; t.vx = 0; }
    }
  }
  const bump = (b, v) => { b.wobV += clamp(v, 0, 3) * 1.5 + 0.4; for (const i of b.items) if (i.t !== GOGO) { i.t.tvx += rand(-2, 2) * v; i.t.tvz += rand(-2, 2) * v; } if (v > 0.45) snd.boing(v / 2); };

  /** 방울을 씌운다. held = 손이 아직 그 위에 있다(놓아야 떠오른다). */
  function wrap(t, held) {
    if (!canWrap(t)) return null; const c = centerOf(t, v3), b = newBubble(c.x, c.y, t.z, big(t) * D.BUBBLE_R); if (!b) return null;
    b.items.push({ t, ox: 0, oy: 0, tox: 0, toy: 0 }); b.held = held; of.set(t, b); snd.inflate(); B.idle = 0; BT.puff = 0.5;
    if (t === GOGO) { brain.stop(); gogo.stop(); s.target = null; G.air = 0; gogo.setMood('wow', 0.8); gogo.lookAt(camera.position); cry('wow'); }
    else { t.state = 'bubble'; t.vx = 0; t.tvx += rand(-2, 2); if (t.name === 'chair') tryRide(b, t); }
    return b;
  }
  /** 고고 곁의 의자를 띄우면 고고가 올라탄다(방울이 잠깐 기다려 준다). */
  function tryRide(b, ch) {
    if (!free() || s.size > ch.size * 1.3 || Math.hypot(s.pos.x - ch.x, s.pos.z - ch.z) > T.RIDE_NEAR * Math.max(1, s.size)) return;
    b.wait = T.RIDE_WAIT; G.ride = b; brain.stop(); gogo.stop(); brain.hop(ch.x, ch.z, T.SEAT * ch.size, 'air', 0.5); cry('joy');
  }
  function launch(b) { b.mode = 'float'; b.vy = 0.25; b.air = 0; b.wobV += 1.5; if (holds(b, GOGO)) { brain.stop(); B.where = 'air'; G.air = 0; } }
  /** 고고가 분 빈 방울. */
  function blowOne(x, y, z) { const b = newBubble(x, y, z, T.EMPTY_R); if (!b) return null; b.empty = true; b.mode = 'float'; b.k = 0.15; b.vx = rand(-0.5, 0.5); b.vy = 0.5; snd.inflate(); return b; }
  /** 방울이 터진다. 안의 것은 떨어지고 "Down!"(떴던 것만 · 조용히 터질 때는 말하지 않는다). o = { quiet:자리를 떠날 때, steam:뜨거워서 저절로 } */
  function pop(b, o = {}) {
    const i = bubbles.indexOf(b); if (i < 0) return; bubbles.splice(i, 1); b.mesh.visible = false; b.mesh.userData.on = false; if (H.b === b) H.b = null; if (H.w === b) H.w = null; if (G.ride === b) G.ride = null; if (b.hang) b.hang.hung = false; if (PRE.b === b) PRE.b = null;
    if (o.quiet) snd.soft(); else { burst(b); snd.pop(b.R); fx.spark(v3.set(b.x, b.y, b.z), o.steam ? '#fff0e0' : '#ffffff', o.steam ? 14 : 5, b.R * 0.6, 1.1, { up: !!o.steam }); }
    let said = false;
    for (const it of b.items) {
      const t = it.t, was = t.lift === 'bubble'; of.delete(t); upSaid.delete(t); t.lift = 'bench';
      if (t === GOGO) { if (s.y > 0.02) { G.fall = true; G.vy = Math.min(b.vy, 0); G.fvx = b.ride ? (s.pos.x > 0 ? -0.9 : 0.9) : b.vx * 0.4; } else B.where = 'bench'; }
      else {
        t.state = t === cup ? 'up' : 'home'; t.floor = 0; t.tvx += rand(-3, 3);
        if (t.y > 0) { t.vy = Math.min(b.vy, 0) - 0.01; falls.set(t, { h: t.y, n: 0 }); if (t.ball) { t.vx = b.vx * 0.5; t.home.x = clamp(t.x + b.vx * 0.5, -BENCH.X, BENCH.X); } else drift.set(t, b.vx * 0.5); }
        if (t.ball && t.y > 1.2 && free() && !o.quiet) t.home.x = clamp(s.pos.x + (t.x >= s.pos.x ? 1 : -1) * (0.36 * s.size + t.r * t.size + 0.14), -BENCH.X, BENCH.X);      // 튕겨 온 공은 고고 곁으로 굴러온다(고고가 받아 낸다)
      }
      if (was && !o.quiet && !said) said = voice.word(W_DOWN.text + '!', () => topOf(t, vWord), { by: t.name, cls: W_DOWN.cls, pitch: pitchOf(t), gap: gapFor('down', t) }) || true;
    }
  }
  /** 두 방울이 하나로 합쳐져 둘을 같이 싣는다. */
  function merge(a, b) {
    if (a.R < b.R) [a, b] = [b, a]; const wa = a.R ** 3, wb = b.R ** 3, w = wa + wb, items = [...a.items, ...b.items].sort((p, q) => (p.t === GOGO ? s.pos.x : p.t.x) - (q.t === GOGO ? s.pos.x : q.t.x));
    for (const it of items) { const src = a.items.includes(it) ? a : b; it.ox += src.x - (a.x * wa + b.x * wb) / w; it.oy += src.y - (a.y * wa + b.y * wb) / w; if (it.t !== GOGO) of.set(it.t, a); else of.set(GOGO, a); }
    a.x = (a.x * wa + b.x * wb) / w; a.y = (a.y * wa + b.y * wb) / w; a.z = (a.z * wa + b.z * wb) / w; a.vx = (a.vx * wa + b.vx * wb) / w; a.vy = (a.vy * wa + b.vy * wb) / w;
    a.items = items; a.lifts += b.lifts; a.empty = a.empty && b.empty; a.grab = a.grab || b.grab; a.hand = Math.min(a.hand, b.hand); a.ride = false; a.hot = 0; a.wobV += 4; a.hang = null; if (b.hang) b.hang.hung = false;
    b.items = []; if (PRE.b === a || PRE.b === b) { a.pre = null; PRE.b = null; } const i = bubbles.indexOf(b); bubbles.splice(i, 1); b.mesh.visible = false; b.mesh.userData.on = false; if (H.b === b) H.b = a;
    snd.merge(); fx.spark(v3.set(a.x, a.y, a.z), '#ffffff', 10, a.R * 0.7, 1.2); A.merges++;
    if (items.length >= 2) seen.add('merge');
    if (A.merges % 3 === 1) voice.word(W_POP.text + '!', () => vWord.set(a.x, a.y + a.R, a.z), { by: 'bubble' });      // 세 번에 한 번
    if (free()) { gogo.setMood('wow', 1.2); cry('wow'); }
  }

  // ───────────────────────── 고고 ─────────────────────────
  const G = { air: 0, fall: false, vy: 0, fvx: 0, splat: 0, lastFall: -99, dizzyNext: false, dizzy: 0, ride: null, hung: false, hangT: 0, giggle: 1, watch: null, watchT: 0 };
  const A = { merges: 0, allUp: false, allT: -1, lastUp: -99, wasHeavy: new Set() };
  const TR = { on: false, aim: false, k: 0, t: 0, side: 1 };      // 컵에 갇힘
  const LOOPS = ['flail', 'swim', 'hang'];
  /** 되풀이 동작을 건다(없으면 끈다). 한 번짜리 동작(기뻐 뛰기 · 조르기의 답)이 도는 중이면 끝나기를 기다린다. 클립이 아직 없으면 덧자세로 때운다. */
  function loop(nm) {
    if (s.act && !s.act.loop) return; const cur = s.act ? s.act.name : null;
    if (!nm || !has(nm)) { if (cur && (LOOPS.includes(cur) || (nm && cur === 'ask'))) s.act = null; }
    else if (cur !== nm) gogo.act(nm);
    gogo.pose('fluster', nm === 'flail' && !has('flail') ? 1 : nm === 'swim' && !has('swim') ? 0.45 : 0); gogo.pose('reach', nm === 'hang' && !has('hang') ? 1 : 0);
  }
  const approach = async (tok, t) => { const side = s.pos.x >= t.x ? 1 : -1; await walk(tok, t.x + side * (t.r * t.size + 0.4 * s.size + 0.14), t.z + 0.45); await face(tok, Math.atan2(t.x - s.pos.x, t.z - s.pos.z)); };
  /** 물건이 뜨면 그 밑으로 가서 폴짝폴짝 뛰어 잡으려 한다. 낮게 떠 있는 방울은 더듬이로 건드려 본다. */
  async function reachFor(tok, t) {
    await wait(tok, 0.3); let b = of.get(t); if (!b) return; G.watch = t; G.watchT = 6;
    await walk(tok, b.x + rand(-0.12, 0.12), b.z + 0.42); await face(tok, 0);
    for (let i = 0; i < 2 && (b = of.get(t)); i++) {
      const low = b.y - b.R < T.LOW * s.size; gogo.act(has('reachJump') ? 'reachJump' : 'jump', { mood: 'wow' }); cry('want'); seen.add('reach'); await wait(tok, durOf('reachJump', 0.85) * 0.5);
      if (low && of.get(t) === b && Math.abs(b.x - s.pos.x) < b.R + 0.3) { b.wobV += 3; b.vy += 0.7; b.vx += (b.x >= s.pos.x ? 0.3 : -0.3); snd.boing(0.6); seen.add('antTouch'); gogo.setMood('joy', 0.9); }
      await wait(tok, durOf('reachJump', 0.85) * 0.5 + 0.35);
    }
    G.watch = null; gogo.setMood('smile', 1); gogo.lookAt(camera.position);
  }
  /** 떨어진 물건에 다가가 쓰다듬는다. 튕겨 온 공은 두 손으로 받아 낸다. */
  async function pat(tok, t, caught) {
    await wait(tok, 0.35); if (of.has(t) || t.state === 'roll' || t.state === 'fall') return;
    if (t.ball) await until(tok, () => t.y < 0.25 && Math.abs(t.vx) < 0.6, 5);
    await approach(tok, t); gogo.lookAt(centerOf(t, v3));
    if (caught) { gogo.pose('reach', 1); t.vx = 0; t.home.x = t.x; gogo.setMood('joy', 1); cry('joy'); seen.add('ballCatch'); await wait(tok, 0.6); gogo.pose('reach', 0); }
    if (has('pat')) gogo.act('pat', { mood: 'smile' }); else gogo.pose('poke', 1);
    cry('hm'); seen.add('pat'); await wait(tok, 0.35); t.tvz += 3; await wait(tok, 0.3); t.tvz -= 3; await wait(tok, durOf('pat', 0.9) - 0.6); gogo.pose('poke', 0);
    gogo.setMood('smile', 1.2); gogo.lookAt(camera.position); await face(tok, 0);
  }
  /** 심심하면 혼자 방울을 불고 쫓아다닌다(낱말은 없다 — 소리와 몸짓만). */
  async function blow(tok) {
    await face(tok, 0); gogo.lookAt(camera.position); if (has('blow')) gogo.act('blow'); gogo.setMood('blowing', 1.3); await wait(tok, durOf('blow', 1.4) * 0.55);
    const b = blowOne(s.pos.x + 0.12 * s.size, s.y + 0.78 * s.size, s.pos.z + 0.3 * s.size); if (!b) return; seen.add('blow'); await wait(tok, durOf('blow', 1.4) * 0.45); gogo.setMood('joy', 1.2); cry('joy');
    for (let i = 0; i < 3 && bubbles.includes(b); i++) { gogo.lookAt(v3.set(b.x, b.y, b.z)); await walk(tok, b.x, b.z + 0.1); if (!bubbles.includes(b)) break; gogo.lookAt(v3.set(b.x, b.y, b.z)); gogo.act(has('reachJump') ? 'reachJump' : 'jump', { mood: 'joy' }); await wait(tok, durOf('reachJump', 0.85) + 0.2); }
    gogo.lookAt(camera.position); await face(tok, 0);
  }
  /** 다섯이 다 떴다: "Up! Up! Up!" 하고 등이 흔들린다. */
  function allUpNow() {
    seen.add('allUp'); voice.word(`${W_UP.text}! ${W_UP.text}! ${W_UP.text}!`, () => vWord.set(s.pos.x, s.y + 1.1 * s.size, s.pos.z), { by: 'gogo', cls: W_UP.cls, quiet: true, show: 1.6, pitch: pitchOf(GOGO) });
    for (const L of lamps) L.av += (Math.random() < 0.5 ? -1 : 1) * 2.6; snd.creak(); sfx.spark(true); cry('joy'); gogo.setMood('joy', 2);
    for (const b of bubbles) { b.wobV += 3; fx.spark(v3.set(b.x, b.y + b.R, b.z), '#fff3b0', 6, 0.3, 1.2); }
  }
  function land() {
    s.y = 0; G.fall = false; B.where = 'bench'; s.pos.x = clamp(s.pos.x, -BENCH.X, BENCH.X); s.pos.z = clamp(s.pos.z, BENCH.Z0, BENCH.Z1); gogo.pose('fluster', 0);
    if (has('splat')) gogo.act('splat', { lock: true, mood: 'wow' }); else gogo.act('fall', { lock: true, mood: 'wow' });      // 쿵 납작 → 출렁 → 일어섬
    G.splat = durOf('splat', gogo.info.fall.dur); snd.splat(s.size); stage.shake(T.SHAKE * s.size); fx.spark(v3.set(s.pos.x, 0.05, s.pos.z), '#f7ebd5', 8, 0.35, 0.8); cry('oops'); seen.add('splat');
    G.dizzyNext = F.clock - G.lastFall < T.DIZZY_GAP; G.lastFall = F.clock;
  }
  function stepGogo(dt) {
    const b = of.get(GOGO), gs = s.size;
    if (G.ride) { const rb = G.ride; if (!bubbles.includes(rb) || rb.mode !== 'wrap') G.ride = null; else if (!B.hop) { rb.items.push({ t: GOGO, ox: s.pos.x - rb.x, oy: s.y + GOGO.h * gs / 2 - rb.y, tox: 0, toy: 0 }); of.set(GOGO, rb); rb.ride = true; rb.wait = 0; G.ride = null; G.air = 0; gogo.setMood('joy', 1.5); gogo.lookAt(camera.position); } }
    if (b) {
      s.target = null; s.faceTo = null; s.heading += Math.atan2(Math.sin(-s.heading), Math.cos(-s.heading)) * Math.min(1, 6 * dt);      // 아이 쪽을 본다
      if (b.mode === 'wrap') loop(null);
      else {
        G.air += dt; B.where = 'air'; const hang = b.hang && G.hung;
        loop(hang ? 'hang' : b.ride ? null : G.air < T.FLAIL ? 'flail' : 'swim');
        if (!(s.act && !s.act.loop)) gogo.setMood(hang ? (Math.sin(F.clock * 1.7) > 0.3 ? 'fluster' : 'wow') : G.air < T.FLAIL && !b.ride ? 'fluster' : 'joy', 0.3);
        gogo.pose('sway', hang && !has('hang') ? 1 : 0);
        if (!hang && G.air > T.FLAIL && (G.giggle -= dt) <= 0) { G.giggle = rand(...T.GIGGLE); cry('giggle'); }      // 깔깔
      }
    } else if (G.fall) {
      G.vy -= THING.GRAVITY * dt; s.y += G.vy * dt; s.pos.x = clamp(s.pos.x + G.fvx * dt, -BENCH.X, BENCH.X); s.target = null; loop('flail'); if (!(s.act && !s.act.loop)) gogo.setMood('wow', 0.2);
      if (s.y <= 0) land();
    } else if (G.splat > 0) {
      if ((G.splat -= dt) <= 0 && G.dizzyNext) { G.dizzyNext = false; G.lastFall = -99; G.dizzy = T.DIZZY_SEC; seen.add('dizzyFall'); cry('dizzy'); }      // 연달아 두 번 떨어졌다
    } else if (B.where === 'air' && !B.hop && !G.ride && !TR.on) { G.fall = true; G.vy = 0; G.fvx = 0; }      // 올라타려던 의자를 놓쳤다
    else loop(null);
    if (G.dizzy > 0) { G.dizzy -= dt; gogo.setMood('dizzy', 0.3); gogo.pose('sway', G.dizzy > 0 ? 1 : 0); stars.visible = G.dizzy > 0; stars.position.set(s.pos.x, s.y + 1.22 * gs, s.pos.z); stars.rotation.y = F.clock * 5; for (const st of stars.children) st.rotation.y = -F.clock * 5 + 0.3; if (G.dizzy <= 0) gogo.setMood('smile', 1); }
    // 눈길: 방울병을 따라가고, 뜬 것을 올려다본다
    if (free() && !C.ask.active) { if (BT.state === 'held' || BT.state === 'fly') gogo.lookAt(v3.copy(BT.pos).setY(BT.pos.y + 0.4)); else if (G.watch && (G.watchT -= dt) > 0 && of.has(G.watch)) { const wb = of.get(G.watch); gogo.lookAt(v3.set(wb.x, wb.y, wb.z)); } else if (G.watch) { G.watch = null; if (!B.tok) gogo.lookAt(camera.position); } }
    // 컵에 갇힘: 허둥대다 두 손으로 들고 나온다(때는 step 이 잰다 — 하던 일이 끊겨도 컵이 붙은 채 남지 않게)
    TR.k += ((TR.on || TR.aim ? 1 : 0) - TR.k) * Math.min(1, 12 * dt);
    if (TR.on) {
      const was = TR.t; TR.t += dt; const cs = cup.size, up = clamp((TR.t - T.TRAP.walk) / (T.TRAP.lift - T.TRAP.walk), 0, 1);
      if (was < 0.25 && TR.t >= 0.25) gogo.goTo(clamp(s.pos.x + TR.side * 0.7, -BENCH.X, BENCH.X), s.pos.z); if (was < 0.95 && TR.t >= 0.95) gogo.goTo(clamp(s.pos.x - TR.side * 0.9, -BENCH.X, BENCH.X), s.pos.z);
      if (was < T.TRAP.walk && TR.t >= T.TRAP.walk) { gogo.stop(); s.faceTo = 0; cry('hm'); }
      gogo.pose('fluster', TR.t < T.TRAP.walk ? 1 : 0); gogo.pose('reach', TR.t >= T.TRAP.walk ? 1 : 0); gogo.setMood(TR.t < T.TRAP.walk ? 'fluster' : 'smile', 0.3);
      cup.state = 'trap'; cup.x = s.pos.x; cup.z = s.pos.z; cup.y = Math.max(0, GOGO.h * gs - T.TRAP.depth * cs + 0.04) + up * up * 0.45 * cs; cup.vy = 0; cup.floor = cup.y; cup.tvx += Math.sin(TR.t * 19) * 14 * dt;
      if (TR.t >= T.TRAP.lift) { TR.on = false; cup.state = 'up'; cup.floor = 0; cup.vy = 3.4; cup.y += 0.01; drift.set(cup, TR.side * 1.5); falls.set(cup, { h: 0, n: 0 }); gogo.pose('reach', 0); gogo.act('jump', { mood: 'joy' }); cry('joy'); sfx.pop(); gogo.lookAt(camera.position); }
    }
  }
  // 컵이 갇히는 동안 뒤집힌다(크기의 버릇 — 쓰러짐 — 은 size.js 의 것을 그대로 부른다)
  const cupPose0 = cup.pose; cup.pose = ob => { if (TR.k < 0.002) return cupPose0(ob); ob.rotation.set(Math.PI * TR.k + cup.tx * 0.1, 0, cup.tz * 0.1); ob.position.y += cup.h * cup.size * TR.k; };
  // 공이 크게 튀는 횟수를 센다(천장에서 떨어뜨리면 크게 세 번)
  const ballBounce0 = ball.onBounce; ball.onBounce = v => { if (ballBounce0) ballBounce0(v); const f = falls.get(ball); if (f && v > T.BIG_BOUNCE && ++f.n === D.TOP_BALL_BOUNCES && f.top) { seen.add('topBounce'); if (free()) { gogo.setMood('wow', 1.2); cry('wow'); } } };

  // ───────────────────────── 창과 바람 ─────────────────────────
  function toggleWindow() { WN.want = WN.want ? 0 : 1; WN.wind = WN.want ? D.WIND_SEC : 0; WN.gust = 0; snd.creak(); B.idle = 0; C.ask.act(); if (free() && !B.tok) { gogo.lookAt(v3.set(wx, wy, T.WINDOW.z)); gogo.setMood('wow', 0.9); } }
  function stepWindow(dt) {
    WN.k += (WN.want - WN.k) * Math.min(1, T.WINDOW.k * dt); M.win_L.rotation.y = -WN.k * T.WINDOW.open; M.win_R.rotation.y = WN.k * T.WINDOW.open;
    const on = WN.wind > 0 && WN.k > 0.6;
    if (on) {
      WN.wind -= dt; if ((WN.gust -= dt) <= 0) { WN.gust = 0.75; snd.wind(); for (const t of Object.values(things)) if (!of.has(t) && t.y === 0) t.tvz += rand(1, 3); }
      for (const L of lamps) L.av += 1.4 * dt; if (bubbles.some(b => b.items.length && b.mode === 'float' && b.vx > D.WIND * 0.6)) seen.add('wind');
      if (free() && !B.tok) { gogo.pose('lean', -0.6); gogo.setMood('fluster', 0.3); }
      if (WN.wind <= 0) { WN.want = 0; snd.creak(); gogo.pose('lean', 0); }
    }
    for (const m of streaks) { const u = m.userData; if (on || m.material.opacity > 0.01) { u.u = (u.u + dt * 0.55 * u.w) % 1; m.position.set(wx + 0.3 + u.u * 4.6, wy + u.y + Math.sin(u.u * 9 + u.w * 5) * 0.16, -0.9 + u.u * 0.9); m.material.opacity += ((on ? 0.55 * Math.sin(u.u * Math.PI) : 0) - m.material.opacity) * Math.min(1, 8 * dt); m.visible = true; } else m.visible = false; }
    return on;
  }

  // ───────────────────────── 손(방울병 · 밀기 · 톡) ─────────────────────────
  const H = { b: null, t: 0, moved: 0, x0: 0, y0: 0, ox: 0, oy: 0, drag: false, w: null, over: null, overT: 0 };      // b = 손이 쥔 방울 · w = 방울병이 지금 씌우고 있는 방울
  function pickBubble(x, y) {
    let best = null, bd = 1e9;
    for (const b of bubbles) { if (b.mode !== 'float') continue; const c = stage.screenOf(v3.set(b.x, b.y, b.z)), cx = c.x, cy = c.y, e = stage.screenOf(v3.set(b.x + b.R, b.y, b.z)), d = Math.hypot(cx - x, cy - y) / (Math.abs(e.x - cx) + T.PICK_PAD); if (d < 1 && d < bd) { bd = d; best = b; } }
    return best;
  }
  const fingerOn = (z, out) => { zPlane.constant = -z; return stage.worldOn(zPlane, P.x, P.y, out); };
  function grab(b, x, y) { H.b = b; H.t = 0; H.moved = 0; H.x0 = x; H.y0 = y; H.drag = false; P.mode = 'bubble'; b.grab = true; b.wobV += 2.4; sfx.tick(); B.idle = 0; if (fingerOn(b.z, v3)) { H.ox = b.x - v3.x; H.oy = b.y - v3.y; } else H.ox = H.oy = 0; }
  /** 손을 뗐다: 거의 안 움직였으면(TAP_PX 안 — 얼마나 오래 눌렀든) 「톡」(터진다), 움직였으면 「밀기」(미끄러지듯 흘러간다). */
  function letGo() { const b = H.b; H.b = null; if (!b || !bubbles.includes(b)) return; b.grab = false; if (!H.drag) tapPop(b); else { b.hand = 0; C.ask.act(); } }
  function tapPop(b) { pop(b); C.ask.act(); B.idle = 0; }
  /** 대상을 바로 눌렀다: 방울병이 날아와 씌운다(쉬운 길). */
  function pressThing(t) { name(t); sfx.tick(); B.idle = 0; if (!canWrap(t)) { if (t !== GOGO) t.tvx += rand(-3, 3); return; } BT.state = 'fly'; BT.on = t; H.w = wrap(t, true); P.mode = 'easy'; }
  function onDown(e) {
    endPre(); const x = e.clientX, y = e.clientY, b = pickBubble(x, y); H.x0 = x; H.y0 = y; H.moved = 0;
    if (b) return grab(b, x, y);
    for (const d of deco) { if (d.k < 0.5) continue; const c = stage.screenOf(v3.set(d.x, d.y, d.z)), cx = c.x, cy = c.y, e2 = stage.screenOf(v3.set(d.x + d.r, d.y, d.z)); if (Math.hypot(cx - x, cy - y) < Math.abs(e2.x - cx) + 16) { burst({ x: d.x, y: d.y, z: d.z, R: d.r * 1.6, vx: 0 }); snd.pop(d.r); d.wait = T.DECOR.back; d.k = 0; B.idle = 0; return; } }      // 꾸밈 방울도 누르면 퐁(낱말은 없다)
    const tip = stage.screenOf(v3.copy(BT.pos).setY(BT.pos.y + 0.3));
    if (BT.state !== 'held' && Math.hypot(tip.x - x, tip.y - y) < 64) { BT.state = 'held'; P.mode = 'bottle'; sfx.grab(); B.idle = 0; return; }      // 방울병을 집는다
    const t = pickAt(stage, targets.filter(q => !of.has(q)), x, y); if (t) return pressThing(t);
    for (const L of lamps) { const c = stage.screenOf(lampAt(L, T.LAMP.BULB, v3)); if (Math.hypot(c.x - x, c.y - y) < 46) { L.av += (x >= c.x ? -1 : 1) * 2.8; snd.creak(); B.idle = 0; return; } }      // 등을 치면 흔들린다
    const wc = stage.screenOf(v3.set(wx, wy, T.WINDOW.z)), wcx = wc.x, wcy = wc.y, we = stage.screenOf(v3.set(wx + T.WINDOW.r, wy, T.WINDOW.z)); if (Math.hypot(wcx - x, wcy - y) < Math.abs(we.x - wcx)) return toggleWindow();
    P.mode = 'walk'; if (free() && stage.worldOn(C.benchPlane, x, y, v3) && Math.abs(v3.x) < BENCH.EDGE && v3.z > -1.3 && v3.z < 1.3) C.tapBench(v3.x, v3.z);
  }
  function onMove(e) {
    H.moved = Math.max(H.moved, Math.hypot(e.clientX - H.x0, e.clientY - H.y0));
    if (P.mode === 'easy' && H.moved > T.EASY_BREAK) { P.mode = 'bottle'; BT.state = 'held'; }      // 누른 채 끌면 방울병을 든 것이다
    else if (P.mode === 'walk' && s.target && free() && stage.worldOn(C.benchPlane, e.clientX, e.clientY, v3)) gogo.goTo(clamp(v3.x, -BENCH.X, BENCH.X), clamp(v3.z, BENCH.Z0, BENCH.Z1));
  }
  function onUp() {
    if (P.mode === 'bubble') letGo();
    else if (P.mode === 'bottle' || P.mode === 'easy') { if (H.w) { H.w.held = false; H.w = null; C.ask.act(); } BT.state = 'back'; BT.back = T.BOTTLE.back; BT.on = null; }
  }
  function stepHand(dt) {
    // 쥔 방울: 손을 느리게 따라온다
    const b = H.b;
    if (b && P.mode === 'bubble') {
      H.t += dt; if (!H.drag && H.moved > D.TAP_PX) { H.drag = true; if (b.hang) { b.hang.hung = false; b.hang.av += 1.5; b.hang = null; b.hangCool = 1.2; G.hung = false; } }
      if (H.drag && fingerOn(b.z, v3)) { const k = 1 - Math.exp(-D.PUSH * dt), nx = b.x + (v3.x + H.ox - b.x) * k, ny = b.y + (v3.y + H.oy - b.y) * k; b.vx += ((nx - b.x) / dt - b.vx) * 0.5; b.vy += ((ny - b.y) / dt - b.vy) * 0.5; b.x = nx; b.y = ny; b.hand = 0; }
      else { b.vx *= 0.8; b.vy *= 0.8; }
    }
    // 방울병: 든 동안에는 손가락 위에 떠서 따라오고, 대상 위에 오면 방울을 씌운다. 쉬운 길에서는 대상 위로 날아간다
    if (BT.state === 'held' && stage.worldOn(heldPlane, P.x, P.y, v3)) {
      BT.to.set(v3.x + T.BOTTLE.tip[0], Math.max(0.05, v3.y + T.BOTTLE.tip[1]), T.BOTTLE.z);
      if (P.mode === 'bottle') { const tp = stage.screenOf(v3.copy(BT.pos).setY(BT.pos.y + 0.2)), tpx = tp.x, tpy = tp.y, list = targets.filter(q => !of.has(q) || of.get(q) === H.w), t = pickAt(stage, list, P.x, P.y) || pickAt(stage, list, tpx, tpy);
        if (H.w && !(t && holds(H.w, t))) { H.w.held = false; H.w = null; C.ask.act(); }
        if (t && !of.has(t) && canWrap(t)) { H.overT = H.over === t ? H.overT + dt : 0; H.over = t; if (H.overT >= T.BOTTLE.dwell) { name(t); H.w = wrap(t, true); } } else H.over = null; }
    } else if (BT.state === 'fly' && BT.on) { const t = BT.on; topOf(t, v3); BT.to.set(v3.x + T.BOTTLE.over[0], v3.y + T.BOTTLE.over[1], t.z + T.BOTTLE.over[2]); }
    else if (BT.state === 'back' && (BT.back -= dt) <= 0) { BT.to.copy(bottleRest); if (BT.pos.distanceTo(bottleRest) < 0.03) BT.state = 'rest'; }
    const kb = 1 - Math.exp(-(BT.state === 'held' ? T.BOTTLE.follow : 9) * dt), dx = (BT.to.x - BT.pos.x) * kb; BT.pos.lerp(BT.to, kb); BT.puff = Math.max(0, BT.puff - dt);
    BT.tilt += ((BT.state === 'demo' ? 0.4 : BT.state === 'held' || BT.state === 'fly' ? 0.5 + BT.puff * 0.8 : 0) - dx * 4 - BT.tilt) * Math.min(1, 12 * dt);
    BT.obj.position.copy(BT.pos); BT.obj.rotation.set(0, 0, BT.tilt); if (BT.state === 'rest') BT.obj.rotation.z = Math.sin(F.clock * 2.2) * 0.04;
    if (BT.puff > 0 && Math.random() < dt * 40) fx.spark(v3.set(BT.pos.x - 0.25, BT.pos.y + 0.7, BT.pos.z), '#ffffff', 1, 0.08, 0.5);
  }

  // ───────────────────────── 매 장면 ─────────────────────────
  function stepBubbles(dt, windOn) {
    const ceil = F.ceil, merges = [], pops = [];
    for (const b of bubbles) {
      b.age += dt; b.hand += dt; b.hangCool -= dt; lay(b); b.R += (b.Rto - b.R) * Math.min(1, 10 * dt); b.R0 = b.empty ? T.EMPTY_R : b.R0;
      b.wobV += (-T.WOB_K * b.wob - T.WOB_C * b.wobV) * dt; b.wob = clamp(b.wob + b.wobV * dt, -0.22, 0.22);
      if (b.mode === 'wrap') {      // 부풀어 감싼다 → 손을 놓으면(그리고 올라탈 고고가 다 올라오면) 떠오른다
        b.k = Math.min(1, b.k + dt / D.WRAP); if (b.wait > 0) b.wait -= dt; const t0 = b.items[0].t; if (b.items.length === 1) { b.x = t0 === GOGO ? s.pos.x : t0.x; b.z = t0 === GOGO ? s.pos.z : t0.z; }
        b.y = floorOf(b); if (b.items.length > 1) carry(b, dt); else if (t0 === GOGO) s.target = null;
        if (b.k >= 1 && !b.held && b.wait <= 0) launch(b); continue;
      }
      b.k = Math.min(1, b.k + dt / D.WRAP); b.air += dt;
      const it = b.items, heavy = it.filter(i => i.t.size >= D.HEAVY_AT).length, light = it.length > 0 && it.every(i => i.t.size <= D.LIGHT_AT), cold = it.some(i => i.t.temp <= TEMP.COLD_AT), hot = it.some(i => i.t.temp >= TEMP.HOT_AT), yMin = floorOf(b);
      let f = D.BUOY * (b.empty ? T.EMPTY_K : light ? D.LIGHT_K : 1);
      if (heavy >= b.lifts) { f = D.BUOY * clamp((yMin + D.HEAVY_TOP - b.y) / 0.3, -1, 1); A.wasHeavy.add(b); }      // 큰 것은 무겁다: 방울 하나로는 조금만 뜬다
      else if (heavy && A.wasHeavy.has(b) && b.y - yMin > D.HEAVY_TOP + T.HEAVY_FREE) seen.add('heavyNeedsTwo');      // 방울을 하나 더 합쳐 주니 올라간다
      if (cold && b.air > T.FROST_RISE) { f = -T.FROST_SINK * D.DRAG; if (b.y <= yMin + 0.02) seen.add('frostSink'); }      // 언 것의 방울은 서리가 끼어 천천히 가라앉는다
      if (hot) { f *= T.HOT_K; if ((b.hot += dt) > T.HOT_POP) { pops.push([b, { steam: true }]); seen.add('hotPop'); } }      // 뜨거운 것의 방울은 빨리 오르다 김에 저절로 퐁
      const tint = it.find(i => i.t.color && i.t.color !== 'own' && HEX[i.t.color]); b.tintK += ((tint ? 1 : 0) - b.tintK) * Math.min(1, 5 * dt); if (tint) { b.mesh.material.uniforms.uTint.value.set(HEX[tint.t.color]); seen.add('colorBubble'); }
      b.frost += ((cold ? 1 : 0) - b.frost) * Math.min(1, 2 * dt);
      const me = it.length === 1 && it[0].t === GOGO;
      // 고고가 천장 가까이 오르면 등에 매달린다
      if (me && !b.hang && !b.grab && b.hangCool <= 0 && heavy < b.lifts && s.y + T.LAMP.REACH * s.size >= ceil - T.LAMP.DROP - 0.12) { b.hang = lamps.reduce((p, q) => Math.abs(q.x - b.x) < Math.abs(p.x - b.x) ? q : p); G.hung = false; }
      if (b.grab) { /* 손이 쥐고 있다 — stepHand 가 옮긴다 */ }
      else if (b.pre && heavy < b.lifts) {      // 첫 손길: 차려 놓은 방울은 허공에 둥실 머물다가, 고고가 해 보인 뒤 아이 앞으로 천천히 흘러온다
        const q = b.pre, h = PRE.hand, tx = h ? T.PRE.hand[0] : q.x, ty = Math.min((h ? T.PRE.hand[1] : T.PRE.y) + yMin - half(it[0].t), ceil - b.R - 0.2) + Math.sin(F.clock * 1.6) * T.PRE.bob, tz = h ? T.PRE.hand[2] : q.z, kk = h ? T.PRE.k * 0.35 : T.PRE.k;
        b.vx += ((tx - b.x) * kk - b.vx * T.PRE.c) * dt; b.vy += ((ty - b.y) * kk - b.vy * T.PRE.c) * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += (tz - b.z) * Math.min(1, (h ? 0.9 : 3) * dt);
      }
      else if (b.hang) {
        const L = b.hang, r = lampAt(L, T.LAMP.DROP, v3), tx = r.x, ty = r.y - T.LAMP.REACH * s.size + GOGO.h * s.size / 2, pull = T.LAMP.PULL;
        b.vx = clamp(b.vx + ((tx - b.x) * pull - b.vx * 5.5) * dt, -2.2, 2.2); b.vy = clamp(b.vy + ((ty - b.y) * pull - b.vy * 5.5) * dt, -2.2, 2.2); b.x += b.vx * dt; b.y += b.vy * dt;
        if (!G.hung && Math.hypot(tx - b.x, ty - b.y) < T.LAMP.NEAR) { G.hung = true; G.hangT = 0; L.hung = true; L.av += (b.vx >= 0 ? 1 : -1) * 1.6; snd.creak(); seen.add('lampHang'); cry('wow'); }
        if (G.hung) { G.hangT += dt; L.av += Math.sin(G.hangT * 2.3) * 2.2 * dt; if (Math.sin(G.hangT * 0.9) > 0.995) { L.av += rand(-1, 1) * 1.8; snd.creak(); cry('oops'); } }      // 놓칠 듯 흔들린다
      } else {
        b.vy += (f - D.DRAG * b.vy) * dt; b.vx *= D.GLIDE ** dt; if (windOn) b.vx += (D.WIND - b.vx) * Math.min(1, 2.2 * dt);
        b.x += b.vx * dt; b.y += b.vy * dt;
      }
      // 벽 · 천장 · 실험대 — 말랑하게 튕긴다
      if (b.x - b.R < -D.WALL_X) { b.x = -D.WALL_X + b.R; if (b.vx < 0) { bump(b, -b.vx); b.vx *= -D.SOFT; } } else if (b.x + b.R > D.WALL_X) { b.x = D.WALL_X - b.R; if (b.vx > 0) { bump(b, b.vx); b.vx *= -D.SOFT; } }
      if (b.y + b.R > ceil) { b.y = ceil - b.R; if (b.vy > 0) { if (b.vy > 0.3) bump(b, b.vy); b.vy = b.vy > 0.3 ? -b.vy * D.SOFT : 0; } b.top += dt; if (b.empty && b.top > T.EMPTY_TOP) pops.push([b, {}]); }
      if (b.y < yMin) { b.y = yMin; if (b.vy < 0) b.vy *= -D.SOFT * 0.5; }
      // 등
      if (!me) for (const L of lamps) { const c = lampAt(L, T.LAMP.BULB, v3), dx = b.x - c.x, dy = b.y - c.y, d = Math.hypot(dx, dy) || 0.001, need = b.R + T.LAMP.R; if (d >= need) continue;
        const nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny; b.x += nx * (need - d); b.y += ny * (need - d); if (vn < 0) { b.vx -= (1 + D.SOFT) * vn * nx; b.vy -= (1 + D.SOFT) * vn * ny; L.av += vn * nx * 1.4; bump(b, -vn); if (vn < -0.5) snd.creak(); } }
    }
    // 방울끼리: 세게 부딪히면 합쳐지고, 뜬 고고를 밀어 대면 더듬이가 남의 방울을 터뜨리고, 아니면 말랑하게 튕긴다
    for (let i = 0; i < bubbles.length; i++) for (let j = i + 1; j < bubbles.length; j++) {
      const a = bubbles[i], b = bubbles[j]; if (a.mode !== 'float' || b.mode !== 'float') continue; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.001, need = a.R + b.R; if (d >= need) continue;
      const nx = dx / d, ny = dy / d, closing = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny, hand = a.grab || b.grab || a.hand < T.HAND || b.hand < T.HAND, ga = holds(a, GOGO), gb = holds(b, GOGO);
      if (hand && closing > D.MERGE_V && !merges.some(m => m.includes(a) || m.includes(b))) { merges.push([a, b]); continue; }
      if (hand && closing > T.ANT_V && ga !== gb && !pops.some(p => p[0] === a || p[0] === b)) { pops.push([ga ? b : a, { ant: true }]); continue; }
      const ka = a.grab || a.hang ? 0 : 1, kb = b.grab || b.hang ? 0 : 1, ks = ka + kb || 1, over = need - d; a.x -= nx * over * ka / ks; a.y -= ny * over * ka / ks; b.x += nx * over * kb / ks; b.y += ny * over * kb / ks;
      if (closing > 0) { const jv = (1 + D.SOFT) * closing / ks; a.vx -= jv * nx * ka; a.vy -= jv * ny * ka; b.vx += jv * nx * kb; b.vy += jv * ny * kb; if (closing > 0.25) { bump(a, closing); bump(b, closing * 0.5); } }
    }
    for (const [a, b] of merges) if (bubbles.includes(a) && bubbles.includes(b)) merge(a, b);
    for (const [b, o] of pops) if (bubbles.includes(b)) { pop(b, o); if (o.ant) { seen.add('antPop'); gogo.act('surprise', { mood: 'wow' }); cry('wow'); } }
    // 싣고 다니기 · "Up!" · 그리기
    for (const b of bubbles) {
      if (b.mode === 'float') { carry(b, dt); for (const i of b.items) if (!upSaid.has(i.t) && baseY(i.t) >= D.UP_AT) upNow(b, i.t); }
      const m = b.mesh, u = m.material.uniforms, e = b.k, back = 1 + 2.2 * (e - 1) ** 3 + 1.2 * (e - 1) ** 2, R = b.R * (0.15 + 0.85 * back);
      m.visible = true; m.position.set(b.x, b.y, b.z); m.scale.set(R * (1 + b.wob * 0.5), R * (1 - b.wob), R * (1 + b.wob * 0.5));
      b.tail.x += (clamp(b.vx * T.TAIL, -T.TAIL_MAX, T.TAIL_MAX) - b.tail.x) * Math.min(1, 9 * dt); b.tail.y += (clamp(b.vy * T.TAIL, -T.TAIL_MAX, T.TAIL_MAX) - b.tail.y) * Math.min(1, 9 * dt);
      u.uTime.value = F.clock + b.R0 * 7; u.uWob.value = Math.abs(b.wob); u.uVel.value.copy(b.tail); u.uTintK.value = b.tintK; u.uFrost.value = b.frost;
    }
  }
  /** 대상의 바닥이 실험대에서 0.25 뜬 순간: "Up!" */
  function upNow(b, t) {
    upSaid.add(t); t.lift = 'bubble'; if (voice.word(W_UP.text + '!', () => topOf(t, vWord), { by: t.name, cls: W_UP.cls, pitch: pitchOf(t), gap: gapFor('up', t) })) A.lastUp = F.clock; fx.spark(topOf(t, v3), '#fff3b0', 10, 0.25 * t.size, 1.3); sfx.spark(true);
    if (b.ride && t.name === 'chair') seen.add('chairRide');
    if (t !== GOGO && free() && PRE.t !== t) run(tok => reachFor(tok, t));      // 고고가 해 보이려고 띄운 것은 쫓아가지 않는다
    const n = targets.filter(q => q.lift === 'bubble').length; if (n >= D.ALL_UP && !A.allUp) { A.allUp = true; A.allT = Math.max(0.9, T.ALL_GAP - (F.clock - A.lastUp)); }      // 방금 난 "Up!" 과 겹치지 않게 조금 있다가
  }
  function step(dt) {
    const keep = THING.BOUNCE, list = Object.values(things);
    stepHand(dt); const windOn = WN.wind > 0 && WN.k > 0.6; stepBubbles(dt, windOn);
    // 컵이 고고 위로 떨어지는가(뒤집히며 씌워진다)
    const cf = falls.get(cup), over = !!cf && cf.h > 0.5 && cup.vy < 0 && cup.y > 0.2 && free() && Math.abs(cup.x - s.pos.x) < T.TRAP.pad && 0.33 * cup.size >= 0.3 * s.size * T.TRAP.fit;
    TR.aim = over; if (over) { cup.z += (s.pos.z - cup.z) * Math.min(1, 10 * dt); cup.x += (s.pos.x - cup.x) * Math.min(1, 6 * dt); drift.delete(cup);
      if (cup.y <= GOGO.h * s.size - T.TRAP.depth * cup.size + 0.1) { TR.on = true; TR.t = 0; TR.side = s.pos.x > 0.5 ? -1 : 1; falls.delete(cup); brain.stop(); gogo.stop(); seen.add('cupTrap'); sfx.clink(); sfx.thud(0.5); cry('oops'); gogo.setMood('wow', 0.5); } }
    for (const t of list) { t.lit = false; THING.BOUNCE = t.ball ? D.FALL_BOUNCE.ball : D.FALL_BOUNCE.other; stepThing(t, dt); }
    THING.BOUNCE = keep;
    // 터져 떨어지는 것: 흐르던 쪽으로 조금 더 가고, 내려앉으면 고고가 다가와 쓰다듬는다
    for (const [t, f] of falls) {
      if (f.top === undefined) f.top = f.h >= F.ceil - 2 * t.r * t.size - T.TOP_NEAR; const d = drift.get(t); if (d) { t.x = clamp(t.x + d * dt, -BENCH.EDGE + 0.3, BENCH.EDGE - 0.3); drift.set(t, d * 0.6 ** dt); }
      if (t.y === 0 && t.vy === 0) { falls.delete(t); drift.delete(t); if (f.h > 0.4) { fx.spark(v3.set(t.x, 0.05, t.z), '#f7ebd5', 5, 0.25, 0.6); if (free() && !C.ask.active) run(tok => pat(tok, t, t.ball && f.h > 1.2)); } }
    }
    stepGogo(dt);
    // 첫 손길: 고고가 분 방울이 물건으로 날아가 씌운다 · 해 보이던 일이 끊겼으면 방울병을 돌려보낸다
    if (PRE.shot) { const q = PRE.shot; q.k += dt / T.SHOT; const c = centerOf(q.t, v3), e = clamp(q.k, 0, 1); shotMesh.visible = true; shotMesh.position.lerpVectors(q.from, c, e); shotMesh.position.y += Math.sin(e * Math.PI) * 0.25; shotMesh.scale.setScalar(0.1 + 0.16 * e);
      if (q.k >= 1) { PRE.shot = null; shotMesh.visible = false; PRE.t = q.t; if (!wrap(q.t, false)) PRE.t = null; } } else shotMesh.visible = false;
    if (PRE.showing && PRE.tok && B.tok !== PRE.tok) { PRE.showing = false; PRE.shot = null; if (BT.state === 'demo') { BT.state = 'back'; BT.back = 0.1; } }
    if (A.allUp && targets.filter(q => q.lift === 'bubble').length < D.ALL_UP) A.allUp = false; if (A.allT > 0 && (A.allT -= dt) <= 0) allUpNow();
    for (const b of A.wasHeavy) if (!bubbles.includes(b)) A.wasHeavy.delete(b);
    // 실험대 위: 고고는 물건을 비켜 가고, 포개져 내려앉은 물건은 옆으로 밀려난다
    if (free()) for (const t of list) {
      if (t.y > 0.3 || t.state === 'fall' || of.has(t)) continue; const dx = s.pos.x - t.x, dz = s.pos.z - t.z, dd = Math.hypot(dx, dz) || 0.001, need = 0.3 * s.size + t.r * t.size * 0.85;
      if (dd < need) { if (t.ball) t.vx -= dx / dd * 3 * dt * 8; s.pos.x += dx / dd * (need - dd); s.pos.z = clamp(s.pos.z + dz / dd * (need - dd), BENCH.Z0, BENCH.Z1); }
    }
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j]; if (of.has(a) || of.has(b) || a.y > 0.05 || b.y > 0.05 || a.state === 'trap' || b.state === 'trap') continue; const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 0.001, need = (a.r * a.size + b.r * b.size) * 0.95; if (d >= need) continue;
      const mv = (need - d) * Math.min(1, 7 * dt) / 2, sx = dx >= 0 ? 1 : -1; a.x -= sx * mv; b.x += sx * mv; if (a.ball) a.home.x = a.x; if (b.ball) b.home.x = b.x;
    }
    for (const t of list) { const lim = BENCH.EDGE - t.r * t.size - 0.08; if (of.has(t) || t.y > 0.05 || !(t.state === 'home' || t.state === 'up') || Math.abs(t.x) <= lim || (t.ball && t.big)) continue; t.x += (Math.sign(t.x) * lim - t.x) * Math.min(1, 6 * dt); if (t.ball) t.home.x = t.x; }      // 실험대 끝에 걸쳐 내려앉은 것은 안으로 밀려 들어온다
    // 아래 그림자
    for (const [t, m] of blobs) { const y = baseY(t), k = clamp(y / 0.4, 0, 1), far = clamp(y / F.ceil, 0, 1), rr = (t.r || 0.36) * t.size * (1.5 - 0.5 * far); m.visible = k > 0.01; m.position.set(t.x, 0.012, t.z); m.scale.set(rr, 1, rr * 0.8); m.material.opacity = k * (0.5 - 0.25 * far); }
    // 심심하면 혼자 방울을 분다(조르는 중에는 하지 않는다)
    if (free() && !B.tok && !P.down && !s.moving && !s.act && !C.ask.active && !C.moving()) { B.idle += dt; if (B.idle > D.IDLE_BLOW) run(blow); } else if (P.down || s.moving) B.idle = 0;
  }
  /** 이 자리에 없을 때도 도는 일: 들보와 등이 천장에서 내려오고 올라가고, 선반과 창짝이 벽에서 나오고 들어가고, 방울병이 실험대에서 솟고 내려간다(0.8초). */
  function bg(dt) {
    F.clock += dt; const to = F.here ? 1 : 0; if (F.vis !== to) F.vis += clamp(to - F.vis, -T.FURN * dt, T.FURN * dt); const e = F.vis * F.vis * (3 - 2 * F.vis), on = F.vis > 0.02;
    if (F.here && stage.worldOn(ceilPlane, innerWidth / 2, 0, v3)) F.ceil += (clamp(v3.y - T.CEIL_PAD, T.CEIL_MIN, D.CEIL) - F.ceil) * Math.min(1, T.CEIL_K * dt);      // 보이는 천장: 화면 맨 위 바로 아래(화면 비율마다 다르다)
    beam.visible = shelf.visible = win.visible = BT.obj.visible = on; if (!on && !F.here) { stepDrops(dt); stepDeco(dt); return; }
    beam.position.set(0, F.ceil + (1 - e) * T.FURN_UP, T.LAMP.z);
    for (const L of lamps) { L.av += (-T.LAMP.K * L.ang - T.LAMP.C * (L.hung ? 2.2 : 1) * L.av) * dt; L.ang = clamp(L.ang + L.av * dt, -0.9, 0.9); L.g.rotation.z = L.ang; L.bulb.material.emissiveIntensity = 0.85 + 0.12 * Math.sin(F.clock * 3 + L.x); }
    shelf.position.set(T.SHELF.x, Math.min(T.SHELF.y, F.ceil - T.SHELF.under), -1.75 - (1 - e) * T.FURN_BACK);
    win.position.set(wx, wy, T.WINDOW.z - (1 - e) * T.FURN_BACK * 0.6);
    const d = (1 - e) * T.FURN_DROP; if (!F.here || BT.state === 'rest') { BT.pos.set(bottleRest.x, -d, bottleRest.z); BT.to.copy(BT.pos); BT.obj.position.copy(BT.pos); }
    if (!F.here) { stepWindow(dt); BT.obj.rotation.set(0, 0, 0); }
    stepDrops(dt); stepDeco(dt);
  }
  function stepAll(dt) { stepWindow(dt); step(dt); }

  /** 자리를 떠난다: 방울은 조용히 터져 내려오고("Down!" 은 말하지 않는다 — 아이가 한 일이 아니다), 떠 있던 고고는 내려온 뒤에 걷는다. */
  function leave() {
    endPre(); F.here = false; P.mode = null; H.b = null; H.w = null; BT.state = 'rest'; BT.on = null; WN.want = 0; WN.wind = 0; G.ride = null; G.watch = null; A.allT = -1; A.allUp = false;
    for (const b of [...bubbles]) pop(b, { quiet: true });
    if (TR.on) { TR.on = false; cup.state = 'up'; cup.floor = 0; cup.vy = 2; cup.y += 0.01; } TR.aim = false; TR.k = 0;
    falls.clear(); drift.clear(); upSaid.clear(); for (const [, m] of blobs) m.visible = false; stars.visible = false; G.dizzy = 0; G.splat = 0; G.dizzyNext = false; G.hung = false;
    for (const k of ['fluster', 'reach', 'sway', 'lean', 'poke']) gogo.pose(k, 0); if (s.act && s.act.loop) s.act = null;
    const up = G.fall || s.y > 0.02; G.fall = false;
    if (up) { brain.stop(); brain.hop(clamp(s.pos.x, -BENCH.X, BENCH.X), clamp(s.pos.z, BENCH.Z0, BENCH.Z1), 0, 'bench', 0.4 + 0.08 * s.y); } else if (!B.hop) B.where = 'bench';
    for (const t of targets) t.lift = 'bench';
  }

  // ───────────────────────── 첫 손길(설계 0장 · 자료 first) ─────────────────────────
  const ORDER = ['apple', 'ball', 'cup', 'chair'], place = { chair: [-2.55, -0.45], apple: [-1.2, -0.35], cup: [1.15, -0.35], ball: [2.45, -0.15], gogo: T.HOME };
  /** F1 이미 벌어진 일: 사과가 방울에 담겨 허공에 떠 있다(사과를 못 쓰면 다음 것). 아이가 바꿔 놓은 크기 · 색 · 온도는 건드리지 않는다. 낱말은 내지 않는다(아이가 한 일이 아니다). */
  function setup() {
    PRE.hand = false; PRE.done = false; PRE.t = null; PRE.lastBy = {}; if (PRE.b || bubbles.some(b => b.items.length)) return;
    const t = ORDER.map(k => things[k]).find(canWrap); if (!t) return; const c = centerOf(t, v3), b = newBubble(c.x, c.y, t.z, big(t) * D.BUBBLE_R); if (!b) return;
    b.items.push({ t, ox: 0, oy: 0, tox: 0, toy: 0 }); of.set(t, b); t.state = 'bubble'; t.vx = 0; b.mode = 'float'; b.k = 0.25; b.pre = { x: place[t.name][0], z: place[t.name][1] }; upSaid.add(t); t.lift = 'bubble'; PRE.b = b; snd.inflate();
  }
  /** 아이가 화면을 건드렸다(또는 자동 확인 명령이 시작됐다): 차려 놓은 장면과 해 보이기는 그 자리에서 아이의 것이 된다 — 머물던 방울은 제 힘으로 떠오르고, 고고는 하던 시늉을 그만둔다. */
  function endPre() {
    if (PRE.b) { PRE.b.pre = null; PRE.b = null; } PRE.hand = false; PRE.shot = null; shotMesh.visible = false;
    if (PRE.showing) { PRE.showing = false; PRE.gen++; brain.stop(); if (s.act && s.act.name === 'blow') s.act = null; gogo.lookAt(camera.position); }
    if (BT.state === 'demo') { BT.state = 'back'; BT.back = 0.1; }
  }
  const ringAt = () => { const b = PRE.b && bubbles.includes(PRE.b) ? PRE.b : bubbles.filter(q => q.mode === 'float' && q.items.length && !holds(q, GOGO) && !(PRE.t && holds(q, PRE.t) && PRE.showing)).sort((p, q) => p.y - q.y)[0]; return b ? { b } : { t: ORDER.map(k => things[k]).find(q => canWrap(q)) }; };
  const first = {
    /** F2 해 보이기: 고고가 방울병을 불어 실험대의 물건 하나를 띄운다 → "Up!". n 이 커지면 다른 것으로, 띄우기와 터뜨리기("Down!")를 번갈아. 걷지 않는다(들어가서 3초 안에 낱말이 나오게). */
    show(n) {
      PRE.done = false; const gen = ++PRE.gen, ringB = ringAt().b, up = bubbles.filter(b => b.mode === 'float' && b.items.length && !holds(b, GOGO) && b !== ringB), bench = ['ball', 'cup', 'chair', 'apple'].map(k => things[k]).filter(canWrap);
      const popIt = (n % 2 === 1 || !bench.length) && up.length ? up[0] : null, t = popIt ? null : bench[(n >> 1) % (bench.length || 1)]; if (!popIt && !t) { PRE.done = true; return; }
      PRE.showing = true; PRE.tok = null;
      run(async tok => {
        PRE.tok = tok; s.target = null;
        if (popIt) {      // 뛰어올라 톡 터뜨린다
          gogo.lookAt(v3.set(popIt.x, popIt.y, popIt.z)); gogo.act(has('reachJump') ? 'reachJump' : 'jump', { mood: 'wow' }); cry('want'); await wait(tok, T.SHOW_POP);
          if (gen === PRE.gen && bubbles.includes(popIt)) pop(popIt); PRE.done = true; gogo.setMood('joy', 1); await wait(tok, 0.5);
        } else {          // 방울병이 고고 앞으로 날아오고, 고고가 불면 방울이 물건으로 날아가 씌운다
          gogo.lookAt(centerOf(t, v3)); if (has('blow')) gogo.act('blow'); gogo.setMood('blowing', 1); BT.state = 'demo'; BT.to.set(s.pos.x + (t.x >= s.pos.x ? 0.4 : -0.4) * s.size, 0.5 * s.size, s.pos.z + 0.3); BT.puff = 0.6; snd.inflate();
          await wait(tok, T.SHOW_BLOW); PRE.shot = { t, k: 0, from: BT.pos.clone().setY(BT.pos.y + 0.7) }; await until(tok, () => !PRE.shot, 1.2);
          await until(tok, () => upSaid.has(t) || !of.has(t), 2.5); PRE.done = true; BT.state = 'back'; BT.back = 0.15; gogo.setMood('joy', 1.2); cry('joy'); gogo.lookAt(camera.position); await wait(tok, 0.4);
        }
        PRE.showing = false; PRE.hand = true;      // F3 내밀기: 차려 놓은 방울이 아이 앞으로 흘러온다
      });
    },
    ready: () => PRE.done,
    /** F3 빛 고리: 떠 있는 사과 방울(터졌으면 가장 낮게 뜬 방울, 그것도 없으면 실험대의 물건). 고리가 방울을 따라다닌다. */
    ring() { const q = ringAt(); return q.b ? vRing.set(q.b.x, q.b.y, q.b.z) : q.t ? centerOf(q.t, vRing) : null; },
    r() { const q = ringAt(); return q.b ? q.b.R + 0.1 : q.t ? big(q.t) + 0.14 : 0.4; },
  };

  // ───────────────────────── 자동 확인(진짜 입력과 같은 함수를 부른다) ─────────────────────────
  const press = (x, y) => { endPre(); P.down = true; P.x = x; P.y = y; C.ask.touch(); }, lift = () => { P.down = false; onUp(); P.mode = null; };
  /** 방울 a 를 손으로 끌어 b 쪽으로 가져간다(b 가 방울 안에 없으면 그 위로). speed = 손이 가는 빠르기 · settle = 닿으면 잠깐 멈췄다 놓는다 */
  async function dragTo(ta, tb, speed, tick, settle) {
    endPre(); let ba = of.get(ta); if (!ba || !tb) return; for (let i = 0; i < 150 && ba.mode === 'wrap'; i++) await tick(); if (!bubbles.includes(ba)) return;
    const c = stage.screenOf(v3.set(ba.x, ba.y, ba.z)); press(c.x, c.y); H.x0 = c.x; H.y0 = c.y; grab(ba, c.x, c.y); H.ox = H.oy = 0; H.moved = 99; let hx = ba.x, hy = ba.y; const was = of.get(tb);
    for (let i = 0; i < 480; i++) {
      ba = of.get(ta); const bb = of.get(tb); if (!ba || ba === bb || (was && !bb)) break;      // 합쳐졌거나 터졌다
      const gx = bb ? bb.x : tb.x, gy = bb ? bb.y : topOf(tb, v3).y + ba.R + T.AUTO_ABOVE, d = Math.hypot(gx - hx, gy - hy); if (!bb && d < 0.04) break;
      const st = Math.min(d, speed / 60); hx += (gx - hx) / (d || 1) * st; hy += (gy - hy) / (d || 1) * st; const p = stage.screenOf(v3.set(hx, hy, ba.z)); P.x = p.x; P.y = p.y; await tick();
    }
    if (settle) for (let i = 0; i < 16; i++) await tick();
    lift();
  }
  const auto = {
    wrap: async (a, b, tick) => {
      endPre(); const t = by(a); if (!t || of.has(t)) return; C.ask.touch();      // 차려 놓은 장면에서 이미 떠 있으면 그대로 둔다
      if (b === 'near') { C.tapBench(t.x + 0.72, t.z + 0.4); for (let i = 0; i < 600 && (brain.busy || s.moving); i++) await tick(); }      // 고고를 그 곁에 세운 뒤에
      const c = stage.screenOf(centerOf(t, v3)); press(c.x, c.y); H.x0 = c.x; H.y0 = c.y; H.moved = 0; pressThing(t); for (let i = 0; i < 5; i++) await tick(); lift();
      for (let i = 0; i < 200 && of.has(t) && of.get(t).mode === 'wrap'; i++) await tick();
    },
    bottle: async (a, b, tick) => {      // 방울병을 집어 대상 위로 끌어다 놓는다
      const t = by(a), c0 = stage.screenOf(v3.copy(BT.pos).setY(BT.pos.y + 0.3)), x0 = c0.x, y0 = c0.y; press(x0, y0); onDown({ clientX: x0, clientY: y0 }); const c1 = stage.screenOf(centerOf(t, v3)), x1 = c1.x, y1 = c1.y;
      for (let i = 1; i <= 40; i++) { P.x = x0 + (x1 - x0) * i / 40; P.y = y0 + (y1 - y0) * i / 40; onMove({ clientX: P.x, clientY: P.y }); await tick(); }
      for (let i = 0; i < 30; i++) await tick(); lift(); for (let i = 0; i < 30; i++) await tick();
    },
    pop: a => { endPre(); const b = of.get(by(a)); if (b && b.mode === 'float') { C.ask.touch(); tapPop(b); } },
    fling: (a, b, tick) => dragTo(by(a), by(b), T.AUTO_FLING, tick, false),
    push: (a, b, tick) => dragTo(by(a), by(b), T.AUTO_PUSH, tick, true),
    window: () => { endPre(); C.ask.touch(); toggleWindow(); },
    lamp: a => { const L = lamps[+a || 0]; L.av += 2.8; snd.creak(); },
    blow: () => { B.idle = D.IDLE_BLOW + 1; },
  };

  return {
    id: 'float', title: ME.title, T: { ...D, ...T }, asks: ME.asks, place,
    step: stepAll, bg, onDown, onMove, onUp, leave,
    first,
    enter() { F.here = true; B.idle = 0; G.lastFall = -99; if (!C.nofirst) setup(); },
    /** 조르면 안 되는 때: 방울에 떠 있는 중(등에 매달려 있을 때는 조를 수 있다 — "Gogo, down!") · 떨어지는 중 · 어지러운 중 · 컵에 갇힌 중 · 방울병이 씌우는 중. */
    busy: () => (!free() && !(of.has(GOGO) && of.get(GOGO).hang && G.hung)) || !!H.w || !!H.b,
    /** 몸으로 흉내: Up = 위를 올려다보며 두 팔을 뻗어 폴짝 · Down = 몸을 숙여 바닥을 내려다본다. */
    mime(word, on) {
      if (!on) { gogo.pose('reach', 0); gogo.pose('hands', 0); gogo.pose('lean', 0); gogo.lookAt(camera.position); return; }
      if (word === 'up') { gogo.pose('reach', 1); gogo.pose('lean', -0.7); gogo.lookAt(v3.set(s.pos.x, s.y + 4, s.pos.z + 0.6)); gogo.act(has('reachJump') ? 'reachJump' : 'jump', { mood: 'wow' }); cry('wow'); }
      else { gogo.pose('hands', 1); gogo.pose('lean', 1); gogo.lookAt(v3.set(s.pos.x, 0, s.pos.z + 0.8)); gogo.setMood('smile', 4); cry('hm'); }
    },
    summary: () => ({ float: { bubbles: bubbles.map(b => b.items.map(i => i.t.name).join('+') + (b.empty ? 'o' : '') + ' y' + b.y.toFixed(1) + (b.hang ? ' hang' : '')), ceil: +F.ceil.toFixed(2), window: +WN.k.toFixed(2), bottle: BT.state, gogo: of.has(GOGO) ? 'bubble' : G.fall ? 'fall' : G.splat > 0 ? 'splat' : TR.on ? 'trap' : 'bench' } }),
    auto, bubbles, lamps, F, G,
  };
}
