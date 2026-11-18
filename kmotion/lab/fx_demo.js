// 케이모션 과학실 — 효과 살펴보기(fx.html): 구운 과학실(room.glb)에 진짜 기구(assets/props/*.glb)를 놓고 효과를 하나씩 켜고 끄며 본다
// 무대는 core/stage.js 와 같은 모양(scene·camera·renderer·BENCH_Y·benchRect·onTick·advance)의 작은 것. room=0 이면 회색 판 + 손으로 만든 그릇·장미.
// 사람 없이 찍기: fx.html?show=fog&boil=0.8&t=4  (t 초를 1/60 초씩 흘린 뒤 멈춘다 — 흘리는 동안은 그리지 않고, 멈춘 뒤 화면 갱신 때 몇 장 그린다)
//   show=fog|boil|level|pour|frost|shatter|glass|all (쉼표로 여럿) · boil · fill · flow · amount(서리) · wet(물기) · level(깨는 세기 1~3) · slow(깨짐 시간 배율)
//   obj=rose|ball(깨는 물체) · tilt(그릇·비커 기울기 도) · burst=1(마무리 구름, pre=앞서 흘릴 초) · carry=1(찬 물체 들고 가기) · liquid=water · shake=1(그릇 흔들기)
//   cam=wide|game|bowl|things|rose|ball|glass|dewar|edge · q=high|mid|low · post=1(후처리 묶음) · ui=0(조작판 숨김) · room=0(회색 판) · bench=1(한 장 그리는 시간을 콘솔에)
//   다 차려지면 window.__fxDone = true 와 'fx-ready' 신호. window.__demo 로 값 바꾸기·시간 흘리기(run)·처음으로(reset)를 스크립트에서 할 수 있다.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createFx, createQuality, createPost, makeRand } from './core/fx/index.js';

const Q = new URLSearchParams(location.search), $ = id => document.getElementById(id);
const num = (k, d) => { const v = parseFloat(Q.get(k)); return Number.isFinite(v) ? v : d; };
const ROOM = Q.get('room') !== '0', DEG = Math.PI / 180;

// ── 작은 무대
function makeStage(host){
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0f1113);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .5;
  const camera = new THREE.PerspectiveCamera(42, 16 / 9, .05, 30);
  const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x3a3836, .45); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe3c0, 2.4); sun.position.set(-3.2, 3.4, 1.2); sun.target.position.set(0, .8, 0); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera; sc.left = -1.6; sc.right = 1.6; sc.top = 1.4; sc.bottom = -1.0; sc.near = .5; sc.far = 12; sun.shadow.bias = -.0006; sun.shadow.normalBias = .01; scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xdfeaff, .45); fill.position.set(1.5, 3, 2); scene.add(fill);
  const ticks = []; let renderFn = () => renderer.render(scene, camera), hold = false, still = 0, last = performance.now(), ts = 1, slowLeft = 0;
  function resize(){ const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight; if (w < 2 || h < 2) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); still = 0; if (stage.onResize) stage.onResize(); }
  function step(dt, draw = true){ const k = slowLeft > 0 ? ts : 1; if (slowLeft > 0) slowLeft -= dt; for (const f of ticks) f(dt * k, dt); if (draw) renderFn(); }
  // 멈춘 뒤에는 몇 장만 그리고 쉰다
  function frame(now){ requestAnimationFrame(frame); const dt = Math.min(.05, (now - last) / 1000); last = now; if (stage.onFrame) stage.onFrame(now); if (hold) { if (still < 3) { still++; renderFn(); } return; } stage.fps = stage.fps * .95 + (1 / Math.max(dt, 1e-3)) * .05; step(dt); }
  const stage = { THREE, scene, camera, renderer, sun, hemi, fill, pmrem, BENCH_Y: .8, benchRect: null, fps: 60, onTick: f => ticks.push(f), resize,
    /** 시간을 손으로 흘린다(그리지 않는다 — 그림은 다음 화면 갱신 때 한 번) */
    advance(sec, fps = 60){ const dt = 1 / fps, n = Math.max(0, Math.round(sec * fps)); for (let k = 0; k < n; k++) step(dt, false); },
    slowMo(scale, sec){ ts = scale; slowLeft = sec; }, setRender(f){ renderFn = f || (() => renderer.render(scene, camera)); }, set hold(v){ hold = v; still = 0; }, get hold(){ return hold; }, redraw(){ still = 0; }, draw(){ renderFn(); },
    start(){ addEventListener('resize', resize); resize(); requestAnimationFrame(frame); } };
  return stage;
}

const loader = new GLTFLoader(), load = url => loader.loadAsync(url).then(g => g.scene);

// ── 방: 구운 room.glb(조명 없이 그림만) + env.webp(기구에 비치는 방) + 햇빛 방향·상판 네모(room.json)
async function loadRoom(stage){
  const base = './assets/room/', info = await (await fetch(base + 'room.json')).json(), room = await load(base + 'room.glb'), { scene, sun } = stage;
  const baked = new Map();
  room.traverse(o => { if (!o.isMesh) return; const m = o.material, n = (m && m.name) || '';
    if (n.startsWith('baked')) { if (!baked.has(m)) { const b = new THREE.MeshBasicMaterial({ map: m.map || m.emissiveMap, toneMapped: false }); b.name = n; baked.set(m, b); } o.material = baked.get(m); }
    else if (n.startsWith('glass')) { o.material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .06, metalness: 0, transparent: true, opacity: .16, envMapIntensity: 1.2, depthWrite: false }); o.renderOrder = 2; }
    o.castShadow = false; o.receiveShadow = false; });
  scene.add(room);
  const r = info.benchTop, catcher = new THREE.Mesh(new THREE.PlaneGeometry(r.xMax - r.xMin, r.zMax - r.zMin), new THREE.ShadowMaterial({ opacity: .38 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.set((r.xMin + r.xMax) / 2, r.y + .0015, (r.zMin + r.zMax) / 2); catcher.receiveShadow = true; scene.add(catcher);
  stage.BENCH_Y = r.y; stage.benchRect = r;
  const d = new THREE.Vector3().fromArray(info.sun.dir).normalize(); sun.color.setRGB(...info.sun.color); sun.intensity = info.sun.strength; sun.target.position.set(0, r.y, 0); sun.position.copy(sun.target.position).addScaledVector(d, -5);
  stage.fill.intensity = .2; stage.hemi.intensity = .25;
  const tex = await new THREE.TextureLoader().loadAsync(base + 'env.webp'); tex.mapping = THREE.EquirectangularReflectionMapping; tex.colorSpace = THREE.SRGBColorSpace;
  scene.environment = stage.pmrem.fromEquirectangular(tex).texture; scene.environmentIntensity = 1; tex.dispose();
  scene.background = new THREE.Color(0x0c0d0f); stage.roomInfo = info;
}
function greyRoom(stage){
  const M = (c, r = .8, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const box = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; stage.scene.add(o); return o; };
  const Y = stage.BENCH_Y; box(8, .02, 8, M(0x26282b, .9), 0, -.01, 0); box(8, 3.2, .1, M(0x2c2f33, .95), 0, 1.6, -1.25);
  box(2.6, Y - .04, .78, M(0x3a3d42, .8), 0, (Y - .04) / 2, 0); box(2.66, .04, .82, M(0x15171a, .42), 0, Y - .02, 0);   // 어두운 상판
}

// ── 기구(진짜 glb). 재질은 물체마다 복제해 둔다(서리가 다른 물체로 번지지 않게)
const own = root => { root.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.castShadow = o.receiveShadow = true; } }); return root; };
async function loadProps(){
  const P = './assets/props/', names = ['bowl', 'dewar', 'rose', 'rose_shards', 'ball', 'ball_shards', 'banana'];
  const got = await Promise.all(names.map(n => load(P + n + '.glb'))), M = {}; names.forEach((n, i) => { M[n] = got[i]; }); return M;
}

// ── 회색 판일 때 손으로 만든 것들
const lathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
function buildBowl(fx){        // 이중벽 스테인리스 그릇(지름 25cm) + 안쪽 모양
  const g = new THREE.Group(), m = fx.glass.steel(null, { roughness: .4 });
  const shell = new THREE.Mesh(lathe([[0, 0], [.096, 0], [.103, .005], [.1255, .086], [.1275, .0905], [.1262, .0925], [.1232, .0915], [.1195, .087], [.099, .013], [.094, .0085], [0, .0085]], 56), m);
  shell.castShadow = shell.receiveShadow = true; g.add(shell);
  return { group: g, inner: { rBot: .0935, rTop: .1188, h: .078, y: .009, parent: g } };
}
function buildBeaker(){        // 두께 있는 유리 비커(재질 이름 머리말 glass_ → 등급별 유리로 갈아 끼운다)
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0xeaf4f1, roughness: .05 }); m.name = 'glass_beaker';
  const shell = new THREE.Mesh(lathe([[0, 0], [.033, 0], [.036, .003], [.036, .092], [.0378, .0955], [.0368, .0965], [.0348, .095], [.034, .091], [.034, .006], [.031, .003], [0, .003]], 40), m); g.add(shell);
  return { group: g, inner: { rBot: .0335, rTop: .0335, h: .086, y: .0035, parent: g } };
}

// ── 시작
const stage = makeStage($('app')); window.__fxStep = '방';
if (ROOM) { try { await loadRoom(stage); } catch (e) { console.error('방을 못 올림: ' + e.message); greyRoom(stage); } } else greyRoom(stage);
const props = ROOM ? await loadProps().catch(e => { console.error('기구를 못 올림: ' + e.message); return null; }) : null;
window.__fxStep = '효과'; const quality = createQuality({ renderer: stage.renderer });
const fx = createFx(stage, { tier: quality.tier });          // 상판 네모는 stage.benchRect(room.json)에서 읽는다
window.__fx = fx; window.__stage = stage;
const BENCH_Y = stage.BENCH_Y, scene = stage.scene;

const SHOWS = [['fog', '안개'], ['boil', '끓음'], ['level', '액면'], ['pour', '붓기'], ['frost', '서리'], ['shatter', '깨짐'], ['glass', '유리']];
const want = (Q.get('show') || 'all').split(','), S = {}; for (const [k] of SHOWS) S[k] = want.includes('all') || want.includes(k);
const only = want.length === 1 ? want[0] : null;
const P = { boil: num('boil', .55), fill: num('fill', .6), flow: num('flow', only === 'pour' ? .7 : (want.includes('all') ? .5 : 0)), frost: num('amount', S.frost ? .7 : (S.shatter ? .32 : 0)), wet: Q.has('wet') ? num('wet', 0) : null,
  water: Q.get('liquid') === 'water', carry: Q.get('carry') === '1', shake: Q.get('shake') === '1', tilt: num('tilt', 0) * DEG, obj: Q.get('obj') === 'ball' ? 'ball' : 'rose' };

// 그릇(실험대 가운데)
const BOWL_AT = new THREE.Vector3(0, BENCH_Y, .06);
let bowl;
if (props) { const g = own(props.bowl.clone()); fx.glass.applyToObject(g); bowl = { group: g, inner: g.getObjectByName('inner_volume') }; }
else bowl = buildBowl(fx);
bowl.group.position.copy(BOWL_AT); scene.add(bowl.group);
const vessel = fx.vessel(bowl.inner, { liquid: 'ln2' });

// 듀어병: 붓기 때는 그릇 위에서 기울이고, 아니면 뒤쪽에 서 있다. 주둥이 끝(spout 빈 점 + 테두리) → 붓는 줄기의 시작
let dewar = null, dewarLevel = null; const spoutTip = new THREE.Vector3(-.172, 1.062, .06), spoutDir = new THREE.Vector3(1, -.3, 0), lip = new THREE.Vector3(), tmp = new THREE.Vector3();
if (props) { dewar = own(props.dewar.clone()); fx.glass.applyToObject(dewar); scene.add(dewar);
  const iv = dewar.getObjectByName('inner_volume'); dewarLevel = iv ? fx.newLevel(iv, { liquid: 'ln2', fill: .5 }) : null;
  const sp = dewar.getObjectByName('spout'), rim = 0.042; lip.copy(sp ? sp.position : new THREE.Vector3(0, .419, 0)).add(new THREE.Vector3(rim, 0, 0)); }
function placeDewar(pouring){
  if (!dewar) return;
  const cap = dewar.getObjectByName('stopper'); if (cap) cap.visible = !pouring;               // 부을 때는 마개를 연다
  if (pouring) { const a = 104 * DEG; dewar.rotation.set(0, 0, -a);
    tmp.copy(lip).applyEuler(dewar.rotation);                        // 회전만 한 상태의 주둥이 자리
    dewar.position.set(BOWL_AT.x - .1, BENCH_Y + .2, BOWL_AT.z).sub(tmp);   // 주둥이가 그릇 왼쪽 가장자리 위 20cm 에 오게
    dewar.updateMatrixWorld(true); spoutTip.copy(lip).applyMatrix4(dewar.matrixWorld); spoutDir.set(Math.sin(a), Math.cos(a), 0); }
  else { dewar.rotation.set(0, .4, 0); dewar.position.set(-.42, BENCH_Y, -.2); dewar.updateMatrixWorld(true); }
}
// 회색 판의 주둥이 표시
const spout = props ? null : new THREE.Mesh(new THREE.CylinderGeometry(.016, .02, .09, 20, 1, true), fx.glass.steel(null, { roughness: .35 }));
if (spout) { spout.material.side = THREE.DoubleSide; spout.position.set(-.215, 1.075, .06); spout.rotation.z = -1.25; spout.castShadow = true; scene.add(spout); }

// 물체: 바나나·고무공·장미(깨는 물체는 장미 또는 고무공)
const banana = props ? own(props.banana.clone()) : new THREE.Mesh(new THREE.CapsuleGeometry(.017, .16, 6, 16), new THREE.MeshStandardMaterial({ color: 0xe0bd2f, roughness: .55 }));
banana.position.set(-.52, BENCH_Y + (props ? 0 : .017), .16); banana.rotation.set(0, .5, props ? 0 : Math.PI / 2); scene.add(banana);
const ballHome = new THREE.Vector3(-.3, BENCH_Y, .24);
const ball = props ? own(props.ball.clone()) : new THREE.Mesh(new THREE.SphereGeometry(.03, 32, 20), new THREE.MeshStandardMaterial({ color: 0xd4472a, roughness: .45 }));
if (!props) ballHome.y += .03; ball.position.copy(ballHome); scene.add(ball);

// 깨지는 물체: 통짜(보이는 것) + 미리 쪼갠 조각 묶음(같은 좌표틀: 장미는 head 노드, 공은 공 뿌리)
const ROSE_AT = new THREE.Vector3(.34, BENCH_Y, .2), BALL_AT = new THREE.Vector3(.36, BENCH_Y, .18);
let target = null, broken = false;
const shardFrost = {};                                               // 조각 묶음 원본에 한 번만 서리를 덧대 둔다(복제본이 재질을 나눠 쓴다)
function makeTarget(kind){
  if (!props) return makeGreyRose();
  const t = { kind, group: null, whole: null, frame: null, shardsSrc: kind === 'rose' ? props.rose_shards : props.ball_shards, frost: null, point: new THREE.Vector3(), radius: kind === 'rose' ? .04 : .03, tint: kind === 'rose' ? 0x8e1022 : 0xc8452a };
  if (kind === 'rose') {                                             // 장미를 실험대에 눕힌다(꽂이는 뺀다)
    const g = own(props.rose.clone()); for (const n of ['holder', 'holder_marks']) { const o = g.getObjectByName(n); if (o) o.visible = false; }
    const pivot = new THREE.Group(); pivot.add(g); g.rotation.z = -Math.PI / 2 + .1; pivot.rotation.y = Math.PI - .5; pivot.position.copy(ROSE_AT); scene.add(pivot); pivot.updateMatrixWorld(true);
    const bb = new THREE.Box3(); g.traverse(o => { if (o.isMesh && o.visible) bb.expandByObject(o); }); pivot.position.y += BENCH_Y - bb.min.y + .001; pivot.updateMatrixWorld(true);
    t.group = pivot; t.whole = g.getObjectByName('head'); t.frame = t.whole;
    const hp = t.whole.getWorldPosition(new THREE.Vector3()); pivot.position.x += ROSE_AT.x - hp.x; pivot.position.z += ROSE_AT.z - hp.z; pivot.updateMatrixWorld(true);   // 꽃송이가 ROSE_AT 에 오게
  } else { const g = own(props.ball.clone()); g.position.copy(BALL_AT); scene.add(g); g.updateMatrixWorld(true); t.group = g; t.whole = g; t.frame = g; }
  if (!shardFrost[kind]) { t.shardsSrc.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); shardFrost[kind] = fx.frost.apply(t.shardsSrc, { sparkle: 1.4, darken: kind === 'rose' ? .6 : .28 }); }
  t.frost = [fx.frost.apply(t.group, { darken: kind === 'rose' ? .6 : .28 }), shardFrost[kind]];
  return t;
}
function makeGreyRose(){      // 회색 판: 공 하나를 쪼갠 듯한 조각으로 대신(진짜 조각 묶음은 room=1 에서)
  const R = makeRand(31), group = new THREE.Group(), shards = [], mat = new THREE.MeshStandardMaterial({ color: 0xab1429, roughness: .6, side: THREE.DoubleSide });
  for (let k = 0; k < 30; k++) { const geo = new THREE.TetrahedronGeometry(.008 + R() * .01); const m = new THREE.Mesh(geo, mat); m.position.set((R() - .5) * .05, .025 + (R() - .5) * .04, (R() - .5) * .05); group.add(m); shards.push(m); }
  group.position.copy(ROSE_AT); scene.add(group); group.updateMatrixWorld(true);
  return { kind: 'rose', group, whole: group, frame: null, shards, frost: [fx.frost.apply(group)], point: new THREE.Vector3(), radius: .04, tint: 0xab1429 };
}
function placeTarget(){
  if (target) { fx.shatter.clear(); target.group.removeFromParent(); for (const f of target.frost) if (f !== shardFrost[target.kind]) f.remove(); }
  target = makeTarget(P.obj); broken = false;
}
placeTarget();
const frosts = [fx.frost.apply(banana), fx.frost.apply(ball)];
const trail = fx.fog ? fx.fog.trail(ball, { radius: .035 }) : null;
// 유리 비커 + 물(기구 glb 에 비커가 없어 손으로 만든다)
const beaker = buildBeaker(); beaker.group.position.set(.78, BENCH_Y, .04); scene.add(beaker.group); fx.glass.applyToObject(beaker.group);
const water = fx.newLevel(beaker.inner, { liquid: 'water', fill: .62 });

// 카메라
const CAMS = { wide: ['넓게', [.55, 1.45, 1.5], [0, .72, .05], 44], game: ['놀이 화면(컷 B)', [0, 1.48, .92], [0, .84, -.3], 57], bowl: ['그릇 가까이', [.14, 1.1, .5], [0, .84, .06], 40],
  things: ['물체 가까이', [-.38, 1.02, .66], [-.42, .82, .2], 32], rose: ['장미 가까이', [.46, .98, .56], [.34, .83, .2], 30], ball: ['공 가까이', [.46, .93, .44], [.36, .82, .18], 30],
  glass: ['유리 가까이', [.88, .98, .5], [.78, .85, .04], 30], dewar: ['붓기 옆', [.22, 1.16, .9], [-.06, .93, .06], 40], edge: ['상판 앞 가장자리', [.75, .95, 1.25], [0, .62, .3], 46] };
let camName = Q.get('cam') || (only ? ({ fog: 'wide', boil: 'bowl', level: 'bowl', pour: 'dewar', frost: 'things', shatter: P.obj === 'ball' ? 'ball' : 'rose', glass: 'glass' })[only] : 'wide') || 'wide';
function setCam(name){ const c = CAMS[name] || CAMS.wide; camName = name; const look = new THREE.Vector3().fromArray(c[2]), pos = new THREE.Vector3().fromArray(c[1]);
  if ((name === 'rose' || name === 'ball') && target) { const b = new THREE.Box3().setFromObject(target.whole), m = b.getCenter(new THREE.Vector3()); pos.sub(look).add(m); look.copy(m); }   // 깨는 물체를 가운데에
  stage.camera.position.copy(pos); stage.camera.fov = c[3]; stage.camera.updateProjectionMatrix(); stage.camera.lookAt(look); stage.redraw(); }
setCam(camName);

// 깨기·구름
function hit(level){ if (broken) placeTarget(); broken = true; const t = target; t.group.updateMatrixWorld(true);
  fx.shatter.timeScale = Q.has('slow') ? num('slow', .35) : 1; if ($('cSlow').checked && !Q.has('t')) stage.slowMo(.35, level === 3 ? .7 : .4);
  let shards;
  if (t.frame) { const root = t.shardsSrc.clone(); t.frame.parent.add(root); root.position.copy(t.frame.position); root.quaternion.copy(t.frame.quaternion); root.scale.copy(t.frame.scale); root.updateMatrixWorld(true);
    shards = []; root.traverse(o => { if (o.isMesh) shards.push(o); }); t.whole.visible = false; t.extra = root; }   // 조각 묶음은 뿌리 아래 한 겹 더 있다 → 메시를 하나하나
  else { shards = t.shards.slice(); }
  const bb = new THREE.Box3(); for (const s of shards) bb.expandByObject(s); bb.getCenter(t.point); t.point.y = bb.max.y;     // 위에서 내리친다: 맞은 자리 = 윗면 가운데
  fx.shatter.burst(shards, { point: t.point, strength: level, radius: t.radius, tint: t.tint });
  if (t.extra) t.extra.removeFromParent(); }
function burst(){ if (fx.fog) fx.fog.burst(vessel.level.rimCenter, 1, { radius: vessel.level.rimRadius }); }

// ── 매 걸음
let simT = 0;
stage.onTick(dt => {
  simT += dt;
  const tilt = P.tilt;
  if (P.shake) { bowl.group.position.x = BOWL_AT.x + Math.sin(simT * 7) * .03 * Math.min(1, simT); bowl.group.rotation.z = Math.sin(simT * 7 + 1) * .08; } else { bowl.group.position.x = BOWL_AT.x; bowl.group.rotation.z = tilt * .5; }
  bowl.group.position.y = BENCH_Y + (tilt ? Math.abs(Math.sin(tilt * .5)) * .12 : 0);
  beaker.group.rotation.z = tilt; beaker.group.position.y = BENCH_Y + (tilt ? Math.abs(Math.sin(tilt)) * .04 : 0);
  const pouring = S.pour && P.flow > .01;
  placeDewar(pouring); if (dewar) dewar.visible = S.pour || S.level || only === null || want.includes('all');
  if (dewarLevel) { dewarLevel.fill = .55; dewarLevel.boil = .2; }
  fx.pour.setFlow(spoutTip, spoutDir, pouring ? P.flow : 0, P.water ? 'water' : 'ln2'); if (spout) spout.visible = S.pour;
  const hitBowl = fx.pour.landed && fx.pour.vessel === vessel.receiver;
  vessel.fill = S.level || S.boil || S.pour || S.fog ? P.fill : 0;
  vessel.boil = S.boil || S.fog ? Math.min(1, P.boil + (hitBowl ? .25 * P.flow : 0)) : (hitBowl && !P.water ? .35 + .5 * P.flow : 0);   // 부으면 닿는 대로 끓는다
  vessel.fogBoil = S.fog ? Math.min(1, P.boil + (hitBowl && !P.water ? .2 * P.flow : 0)) : 0;
  for (const f of frosts) { f.amount = S.frost ? P.frost : 0; if (P.wet != null) { f.autoWet = false; f.wet = P.wet; } }
  for (const f of target.frost) { f.amount = S.frost || S.shatter ? P.frost : 0; if (P.wet != null) { f.autoWet = false; f.wet = P.wet; } }
  if (P.carry) { const k = simT * .7; ball.position.set(-.3 + Math.sin(k) * .28, BENCH_Y + .26 + Math.sin(k * 2.3) * .05, .2 + Math.cos(k) * .06); } else ball.position.copy(ballHome);
  if (trail) trail.rate = P.carry && S.fog ? 1 : 0;
  beaker.group.visible = S.glass;
  target.group.visible = (S.frost || S.shatter) && !(broken && target.group === target.whole);   // 공은 통짜가 곧 뿌리 — 깬 뒤 다시 보이지 않게 banana.visible = S.frost; ball.visible = S.frost || P.carry;
  fx.update(dt);
  if (!S.glass) water.mesh.visible = false; else water.fill = P.fill;
});

// ── 화면 조작
function ui(){
  const shows = $('shows'); SHOWS.forEach(([k, label], i) => { const l = document.createElement('label'); l.innerHTML = `<input type="checkbox" ${S[k] ? 'checked' : ''}>${i + 1} ${label}`; l.firstChild.onchange = e => { S[k] = e.target.checked; }; l.dataset.k = k; shows.appendChild(l); });
  const slider = (id, out, key) => { const el = $(id), o = $(out); el.value = P[key]; o.textContent = (+P[key]).toFixed(2); el.oninput = () => { P[key] = +el.value; o.textContent = P[key].toFixed(2); }; };
  slider('sBoil', 'vBoil', 'boil'); slider('sFill', 'vFill', 'fill'); slider('sFlow', 'vFlow', 'flow'); slider('sFrost', 'vFrost', 'frost');
  const check = (id, key) => { const el = $(id); el.checked = !!P[key]; el.onchange = () => { P[key] = el.checked; }; }; check('cWater', 'water'); check('cCarry', 'carry'); check('cShake', 'shake');
  $('bBurst').onclick = burst; $('bDip').onclick = () => vessel.splash(null, 1.2);
  $('bHit1').onclick = () => hit(1); $('bHit2').onclick = () => hit(2); $('bHit3').onclick = () => hit(3); $('bReset').onclick = placeTarget;
  $('bObj').onclick = () => { P.obj = P.obj === 'rose' ? 'ball' : 'rose'; placeTarget(); $('bObj').textContent = P.obj === 'rose' ? '공으로' : '장미로'; };
  $('bObj').textContent = P.obj === 'rose' ? '공으로' : '장미로';
  const sc = $('selCam'); for (const k in CAMS) { const o = document.createElement('option'); o.value = k; o.textContent = CAMS[k][0]; sc.appendChild(o); } sc.value = camName; sc.onchange = () => setCam(sc.value);
  const st = $('selTier'); [['high', '화질 상'], ['mid', '화질 중'], ['low', '화질 하']].forEach(([k, t]) => { const o = document.createElement('option'); o.value = k; o.textContent = t; st.appendChild(o); }); st.value = quality.tier; st.onchange = () => quality.set(st.value);
  addEventListener('keydown', e => { const k = e.key.toLowerCase(); if (k >= '1' && k <= '7') { const key = SHOWS[+k - 1][0]; S[key] = !S[key]; shows.children[+k - 1].firstChild.checked = S[key]; }
    if (k === 'z') hit(1); if (k === 'x') hit(2); if (k === 'c') hit(3); if (k === 'r') placeTarget(); if (k === 'b') burst(); });
  document.querySelector('#panel .key').textContent = '글쇠: 1~7 효과 켜고 끄기 · Z X C = 톡 · 탁 · 쾅 · R = 다시 놓기 · B = 구름';
  if (Q.get('ui') === '0') { $('panel').classList.add('hide'); $('stat').classList.add('hide'); }
}
ui();

// 등급: 내부 해상도·그림자·안개 장수·유리
let post = null;
async function applyTier(){ const s = quality.applyTo(stage); fx.setTier(quality.tier); for (const o of [beaker.group, bowl.group, dewar]) if (o) fx.glass.applyToObject(o); $('selTier').value = quality.tier;
  if (post) { post.dispose(); post = null; stage.setRender(null); }
  if (Q.get('post') === '1') { post = await createPost(stage.renderer, stage.scene, stage.camera, s); stage.setRender(post ? () => post.render() : null); } }
quality.onChange(applyTier); stage.onResize = () => { if (post) { const v = stage.renderer.getDrawingBufferSize(new THREE.Vector2()); post.setSize(v.x, v.y); } };
stage.onFrame = now => { if (!stage.hold) quality.sample(now); $('stat').textContent = `화질 ${quality.settings.label} · 초당 ${Math.round(stage.fps)}장 · 안개 ${fx.fog ? fx.fog.live : 0}장`; };

// 자동 확인용 손잡이: 값 바꾸기 · 처음으로 · 일으키기 · 시간 흘리기(그리지 않음) · 한 장 그리기
window.__demo = { P, S, CAMS, setCam, hit, burst, placeTarget, vessel, stage, quality,
  show(list){ const w = String(list).split(','); for (const [k] of SHOWS) S[k] = w.includes('all') || w.includes(k); },
  reset(){ if (fx.fog) fx.fog.clear(); placeTarget(); simT = 0; stage.hold = true; },
  run(sec){ stage.hold = true; stage.advance(sec); stage.draw(); } };

stage.start(); window.__fxStep = '등급';
await applyTier(); window.__fxStep = '흘리기';
// 사람 없이 찍기: 처음에 한 번 일으키고, t 초를 흘린 뒤 멈춘다
if (Q.get('burst') === '1') { stage.advance(Q.has('pre') ? num('pre', 2) : 0); burst(); }
if (Q.has('level') && S.shatter) hit(Math.min(3, Math.max(1, Math.round(num('level', 3)))));
if (Q.has('t')) { stage.advance(Math.max(0, num('t', 0))); stage.hold = true; }
if (Q.get('bench') === '1') {   // 한 장 그리는 데 걸리는 시간(이 기계의 그래픽 칩): 효과 켠 채 · 안개만 끈 채
  const gl = stage.renderer.getContext(), px = new Uint8Array(4), run = n => { const t0 = performance.now(); for (let i = 0; i < n; i++) { stage.advance(1 / 60); stage.draw(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } return (performance.now() - t0) / n; };
  run(20); const a = run(60), info = stage.renderer.info.render; const calls = info.calls, tris = info.triangles; fx.fog.mesh.visible = false; const keep = fx.fog.update; fx.fog.update = () => { }; const b = run(60); fx.fog.update = keep; fx.fog.update(1 / 60);   // 안개 그림을 다시 켠다(update 가 보이기를 정한다)
  console.log('BENCH 화질 ' + quality.settings.label + ' ' + stage.renderer.domElement.width + 'x' + stage.renderer.domElement.height + ' · 한 장 ' + a.toFixed(2) + 'ms(안개 끄면 ' + b.toFixed(2) + 'ms) · 그리는 묶음 ' + calls + ' · 삼각형 ' + tris + ' · 안개 조각 ' + fx.fog.live); }
window.__fxDone = true; dispatchEvent(new Event('fx-ready'));   // 사람 없이 찍는 쪽이 기다리는 신호
