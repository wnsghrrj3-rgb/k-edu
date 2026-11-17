// 케이모션 과학실 — 무대: 방·카메라 레일·컷·자리(빈 점)·화면↔작업 평면
// L00/L01: 회색 판(상자·원통). L02 에서 room.glb 로 갈아 끼우고 자리 이름(shelf_*, bench_*)은 GLB 빈 점에서 읽는다.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const BENCH_Y = 0.80;          // 실험대 높이 80cm (1 단위 = 1m)
const SHELF_Z = -0.86;         // 기구장 선반 앞뒤 자리
export const WORK_Z = 0.03;    // 작업 평면(실험대 위 세로 평면) — 쥔 물체는 이 깊이에서 움직인다

// 컷: 카메라 레일 위 세 자리 (A 기본 = 선반+실험대, B 실험 = 실험대 가까이, C 눈앞 = 일어나는 일 가까이)
const CUTS = {
  A: { pos: new THREE.Vector3(0, 1.42, 1.05), look: new THREE.Vector3(0, 0.98, -0.70), fov: 56 },
  B: { pos: new THREE.Vector3(0, 1.32, 0.92), look: new THREE.Vector3(0, 0.86, -0.30), fov: 56 },
};

export function createStage(host, opt = {}){
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opt.capture });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement); renderer.domElement.id = 'gl';

  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9aa0a6);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(CUTS.A.fov, 16 / 9, 0.05, 30);
  camera.position.copy(CUTS.A.pos); camera.lookAt(CUTS.A.look);

  // 빛: 왼쪽 창의 오후 햇빛(따뜻·비스듬) + 형광등 채움빛(푸르스름)
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x55504a, 0.75));
  const sun = new THREE.DirectionalLight(0xffe3c0, 2.2); sun.position.set(-3.2, 3.4, 1.2); sun.target.position.set(0, BENCH_Y, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = -1.6; sc.right = 1.6; sc.top = 1.4; sc.bottom = -1.0; sc.near = 1; sc.far = 9; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xdfeaff, 0.5); fill.position.set(1.5, 3, 2); scene.add(fill);

  // ── 회색 방 (만지지 않는 것)
  const room = new THREE.Group(); room.name = 'room'; scene.add(room);
  const mat = (c, r = .8, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const box = (w, h, d, m, x, y, z, name) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; if (name) o.name = name; room.add(o); return o; };
  box(8, .02, 8, mat(0x8b8e92), 0, -.01, 0, 'floor');
  box(8, 3.2, .1, mat(0xc9ccd0), 0, 1.6, -1.25, 'wall_back');
  box(.1, 3.2, 6, mat(0xc4c7cb), -2.4, 1.6, 0, 'wall_left');
  box(.1, 3.2, 6, mat(0xc4c7cb), 2.4, 1.6, 0, 'wall_right');
  box(.02, 1.3, 1.9, new THREE.MeshBasicMaterial({ color: 0xf4f1e8 }), -2.34, 1.65, .1, 'window');           // 창(밝은 판)
  box(2.6, BENCH_Y - .04, .78, mat(0x6d7075), 0, (BENCH_Y - .04) / 2, 0, 'bench_body');
  box(2.66, .04, .82, mat(0x2a2c2f, .55), 0, BENCH_Y - .02, 0, 'bench_top');                                   // 검은 상판
  // 기구장(유리문 열림) — 3단 선반
  const cab = mat(0x9da1a6), CW = 1.9, CY0 = .92, CY1 = 2.08;
  box(CW, CY1 - CY0, .04, cab, 0, (CY0 + CY1) / 2, SHELF_Z - .19, 'cab_back');
  box(.04, CY1 - CY0, .4, cab, -CW / 2, (CY0 + CY1) / 2, SHELF_Z, 'cab_l'); box(.04, CY1 - CY0, .4, cab, CW / 2, (CY0 + CY1) / 2, SHELF_Z, 'cab_r');
  box(CW, .04, .4, cab, 0, CY1, SHELF_Z, 'cab_top'); box(CW, CY0, .4, mat(0x878b90), 0, CY0 / 2, SHELF_Z, 'cab_base');
  const SHELF_Y = [1.76, 1.40, 1.03];                                                                             // 1단(위)·2단·3단
  const lip = mat(0xe4e6e9, .6);
  SHELF_Y.forEach((y, i) => { box(CW - .04, .03, .38, cab, 0, y - .015, SHELF_Z, 'shelf_board_' + (i + 1)); box(CW - .04, .036, .012, lip, 0, y - .018, SHELF_Z + .19, 'shelf_lip_' + (i + 1)); });   // 앞 테두리(눈높이 선반이 보이게)

  // ── 자리(빈 점). L02 부터는 room.glb 의 같은 이름 빈 점에서 읽는다.
  const slots = new Map();
  const addSlot = (name, x, y, z, kind) => { const o = new THREE.Object3D(); o.name = name; o.position.set(x, y, z); o.userData.kind = kind; room.add(o); slots.set(name, o); };
  SHELF_Y.forEach((y, t) => [-.6, 0, .6].forEach((x, s) => addSlot(`shelf_${t + 1}_${s + 1}`, x, y, SHELF_Z + .02, 'shelf')));
  ['a', 'b', 'c', 'd'].forEach((k, i) => addSlot('bench_' + k, -.51 + i * .34, BENCH_Y, .02, 'bench'));
  addSlot('fix_left', -.84, BENCH_Y, .0, 'fixture'); addSlot('fix_right', .84, BENCH_Y, -.04, 'fixture');

  // ── 카메라 레일
  const cam = { from: null, to: CUTS.A, t: 1, dur: .8, name: 'A', look: CUTS.A.look.clone(), shake: 0, cOverride: null };
  // 손 좌표용 카메라: A·B 만 따라가고 눈앞 컷(C)·흔들림은 모른다 → 카메라가 가까이 가도 쥔 물체가 미끄러지지 않는다
  const ctrl = new THREE.PerspectiveCamera(CUTS.A.fov, 16 / 9, 0.05, 30); ctrl.position.copy(CUTS.A.pos); ctrl.lookAt(CUTS.A.look);
  const cr = { from: null, to: CUTS.A, t: 1, dur: .8, look: CUTS.A.look.clone() };
  function ctrlTo(to, dur){ cr.from = { pos: ctrl.position.clone(), look: cr.look.clone(), fov: ctrl.fov }; cr.to = to; cr.t = 0; cr.dur = dur; }
  function setCut(name, dur){ const to = CUTS[name] || name; if (cam.name === name && !cam.cOverride) return; cam.from = { pos: camera.position.clone(), look: cam.look.clone(), fov: camera.fov }; cam.to = to; cam.t = 0; cam.dur = dur == null ? .8 : dur; cam.name = typeof name === 'string' ? name : 'C'; if (CUTS[name] && cr.to !== CUTS[name]) ctrlTo(CUTS[name], cam.dur); }
  // 눈앞 컷: 대상 자리를 가까이 보고 hold 초 뒤 이전 컷으로
  function closeUp(target, hold = 1.8){ const back = cam.name === 'C' ? (cam.back || 'B') : cam.name; const look = target.clone(); const pos = look.clone().add(new THREE.Vector3(.08, .22, .55));
    setCut({ pos, look, fov: 34 }, .35); cam.name = 'C'; cam.back = back; cam.cLeft = hold; }   // 무대 시간으로 센다(느린 동작·손으로 흘린 시간에도 맞게)
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function stepCamera(dt){
    if (cam.cLeft > 0) { cam.cLeft -= dt; if (cam.cLeft <= 0) setCut(cam.back || 'B', .7); }
    if (cam.t < 1) { cam.t = Math.min(1, cam.t + dt / cam.dur); const k = ease(cam.t);
      camera.position.lerpVectors(cam.from.pos, cam.to.pos, k); cam.look.lerpVectors(cam.from.look, cam.to.look, k); camera.fov = cam.from.fov + (cam.to.fov - cam.from.fov) * k; camera.updateProjectionMatrix(); }
    camera.lookAt(cam.look);
    if (cr.t < 1) { cr.t = Math.min(1, cr.t + dt / cr.dur); const k = ease(cr.t); ctrl.position.lerpVectors(cr.from.pos, cr.to.pos, k); cr.look.lerpVectors(cr.from.look, cr.to.look, k); ctrl.fov = cr.from.fov + (cr.to.fov - cr.from.fov) * k; ctrl.updateProjectionMatrix(); } ctrl.lookAt(cr.look);
    if (cam.shake > 0) { cam.shake = Math.max(0, cam.shake - dt * 2.5); const s = cam.shake * cam.shake * .012; camera.position.x += (Math.random() - .5) * s; camera.position.y += (Math.random() - .5) * s; }
  }

  // ── 화면 비율(0~1, 위=0) ↔ 세계
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -WORK_Z), hit = new THREE.Vector3();
  function screenToPlane(x, y, z = WORK_Z, out = new THREE.Vector3()){ ndc.set(x * 2 - 1, -(y * 2 - 1)); ray.setFromCamera(ndc, ctrl); plane.constant = -z; return ray.ray.intersectPlane(plane, out) ? out : out.set(0, 1, z); }
  const pv = new THREE.Vector3();
  function projectView(v){ pv.copy(v).project(camera); return { x: (pv.x + 1) / 2, y: (1 - pv.y) / 2, z: pv.z }; }   // 지금 보이는 화면 기준(떠오르는 글자)
  function project(v){ pv.copy(v).project(ctrl); return { x: (pv.x + 1) / 2, y: (1 - pv.y) / 2, z: pv.z }; }

  // ── 크기·그리기
  function resize(){ const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight; if (w < 2 || h < 2) return; /* 숨은 창(0×0)에서는 비율을 지키려고 그대로 둔다 */ renderer.setSize(w, h, false); camera.aspect = ctrl.aspect = w / h; camera.updateProjectionMatrix(); ctrl.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();
  const ticks = []; let last = performance.now(), timeScale = 1, slowUntil = 0;
  function step(dt, now, draw = true){ const ts = now < slowUntil ? timeScale : 1; stepCamera(dt); for (const f of ticks) f(dt * ts, dt, now); if (draw) renderer.render(scene, camera); }
  function frame(now){ requestAnimationFrame(frame); if (window.__pause) { last = now; return; } let dt = Math.min(.05, (now - last) / 1000); last = now; stage.fps = stage.fps * .95 + (1 / Math.max(dt, 1e-3)) * .05; step(dt, now); }
  requestAnimationFrame(frame);
  // 화면이 숨겨져 rAF 가 멈춘 미리보기·자동 시험용: 시간을 손으로 흘린다 (window.__pause = true 와 같이)
  let manualNow = 0;
  function advance(sec, fps = 30){ const dt = 1 / fps, n = Math.max(1, Math.round(sec * fps)); if (!manualNow) manualNow = performance.now(); for (let k = 0; k < n; k++) { manualNow += dt * 1000; step(dt, manualNow, k === n - 1); } }   // 그리기는 마지막 장만(긴 묶음에서 GPU 가 끊기지 않게)

  // ── 그림 판 방 올리기: 블렌더에서 구운 room.glb(+ room.json·env.webp). 없으면 회색 판 그대로.
  //    구운 재질(baked_*)은 조명 계산 없이 그림만 붙인다. 자리(빈 점)·컷·햇빛 방향은 블렌더 장면에서 온 값을 쓴다.
  async function loadRoom(base = './assets/room/'){
    let info; try { const r = await fetch(base + 'room.json', { cache: 'no-cache' }); if (!r.ok) return false; info = await r.json(); } catch (_) { return false; }
    const gltf = await new GLTFLoader().loadAsync(base + (info.file || 'room.glb'));
    const baked = new Map(), V = a => new THREE.Vector3(a[0], a[1], a[2]);
    gltf.scene.traverse(o => { if (!o.isMesh) return; const m = o.material, n = (m && m.name) || '';
      if (n.startsWith('baked')) { if (!baked.has(m)) { const b = new THREE.MeshBasicMaterial({ map: m.map || m.emissiveMap, toneMapped: false }); b.name = n; baked.set(m, b); } o.material = baked.get(m); o.castShadow = o.receiveShadow = false; }
      else if (n.startsWith('glass')) { o.material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .06, metalness: 0, transparent: true, opacity: .16, envMapIntensity: 1.2, depthWrite: false }); o.material.name = n; o.renderOrder = 2; } });
    for (const c of [...room.children]) if (c.isMesh) room.remove(c);                       // 회색 벽·실험대·기구장을 걷어 낸다
    for (const o of slots.values()) room.remove(o); slots.clear();
    room.add(gltf.scene); gltf.scene.updateMatrixWorld(true);
    const kindOf = n => n.startsWith('shelf_') ? 'shelf' : n.startsWith('bench_') ? 'bench' : n.startsWith('fix_') ? 'fixture' : n.startsWith('wear_') ? 'wear' : null;
    gltf.scene.traverse(o => { const k = kindOf(o.name || ''); if (k && !o.isMesh) { o.userData.kind = k; slots.set(o.name, o); } });
    // 살아 있는 기구가 구운 실험대·선반에 드리우는 그림자(그림자만 받는 투명 판)
    const catcher = (r, y) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(r.xMax - r.xMin, r.zMax - r.zMin), new THREE.ShadowMaterial({ opacity: info.shadowOpacity || .38 })); g.rotation.x = -Math.PI / 2; g.position.set((r.xMin + r.xMax) / 2, y + .0015, (r.zMin + r.zMax) / 2); g.receiveShadow = true; g.name = 'shadow_catcher'; room.add(g); };
    if (info.benchTop) { catcher(info.benchTop, info.benchTop.y); stage.BENCH_Y = info.benchTop.y; stage.benchRect = info.benchTop; }
    for (const sh of info.shelves || []) catcher(sh, sh.y);
    if (info.sun) { const d = V(info.sun.dir).normalize(), c = info.sun.color || [1, .9, .75]; sun.color.setRGB(c[0], c[1], c[2]); sun.intensity = info.sun.strength || 2.2; sun.target.position.set(0, stage.BENCH_Y, 0); sun.position.copy(sun.target.position).addScaledVector(d, -5); }
    for (const k of ['A', 'B']) { const c = info.cuts && info.cuts[k]; if (c) { CUTS[k].pos.copy(V(c.pos)); CUTS[k].look.copy(V(c.look)); CUTS[k].fov = c.fov; } }
    for (const cm of [camera, ctrl]) { cm.position.copy(CUTS.A.pos); cm.fov = CUTS.A.fov; cm.updateProjectionMatrix(); cm.lookAt(CUTS.A.look); } cam.look.copy(CUTS.A.look); cr.look.copy(CUTS.A.look); cam.t = cr.t = 1; cam.name = 'A'; cam.to = cr.to = CUTS.A;
    try { const tex = await new THREE.TextureLoader().loadAsync(base + (info.env || 'env.webp')); tex.mapping = THREE.EquirectangularReflectionMapping; tex.colorSpace = THREE.SRGBColorSpace; scene.environment = pmrem.fromEquirectangular(tex).texture; scene.environmentIntensity = info.envIntensity || 1; tex.dispose(); } catch (_) {}
    scene.background = new THREE.Color(0x0c0d0f); stage.roomInfo = info; stage.pictured = true; return true;
  }

  const stage = { THREE, scene, camera, renderer, room, slots, sun, BENCH_Y, WORK_Z, fps: 60, loadRoom, pictured: false,
    setCut, closeUp, get cut(){ return cam.name; }, shake(v = 1){ cam.shake = Math.max(cam.shake, v); },
    slowMo(scale, sec){ timeScale = scale; slowUntil = performance.now() + sec * 1000; },
    screenToPlane, project, projectView, onTick: f => ticks.push(f), resize, advance, now: () => window.__pause && manualNow ? manualNow : performance.now() };
  return stage;
}
