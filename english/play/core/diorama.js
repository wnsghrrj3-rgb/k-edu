/* ============================================================
 * 영어 놀이터 — 입체 키트(diorama) (W15 · 설계 v2 §7 · 한 해 길 §7)
 *   입체 방(디오라마)이 같이 쓰는 것을 한 곳에. 빈터 시험판(glade.html)·몸 장면(glade-shake.html)에서 뽑아 냈다 — 뒤 걸음의 방은 이 위에 물건과 장면만 얹는다.
 *   ES 모듈(엔진 = 레포 안 labs/vendor/three185 — 페이지의 importmap 이 'three' 를 가리킨다). 색은 전부 토큰(ui/tokens.css)에서 — 코드에 색 값 0.
 *
 *   const K = createKit({ canvas, sky? })     렌더러 · 장면 · 정사영 카메라 · 재질 · 도형 도우미 · 글자판 · 트윈 · 후처리 · 품질 3단 · 화면 자리
 *   K.eye(conf)                              눈(카메라) — 물건 쪽으로 살며시 다가가기(focus) · 끌면 조금 돎 · 세로 화면 맞춤 · 가만히 있으면 아주 조금 흔들림
 *   K.light(preset, o)                       빛 벌 — 'morning' · 'day' · 'afternoon' · 'evening' · 'lamp'(해 · 하늘빛 · 채움빛 · 햇살 · 빛 먼지)
 *   K.particles(n)                           알갱이 한 벌 — 빛 튐 · 잎 · 꽃잎(한 번에 그린다)
 *   K.quality                                'high' | 'mid' | 'low' — 처음 2초 동안 빠르기를 보고 저절로 내린다 · ?q=low 는 처음부터 low
 *   K.lighten(on)                            몸 장면처럼 손이 바쁜 동안 화면 효과를 던다(그늘 계산 · 빛 번짐 · 햇살 · 그림자 덜 자주)
 *   K.ambience()                             바탕 소리 한 겹(합성 — 바람 · 가끔 새) · 효과음 설정(PlayAudio)을 따른다
 *   K.render(dt) · K.screenOf(obj, dy) · K.toPlane(x, y, plane) · K.pick(e, objs, accept)
 * ============================================================ */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
export { THREE };

/* ── 상수는 여기 한 곳 ── */
export const KIT = {
  quality: { checkSec: 2, mid: 40, low: 24 },                /* 처음 이만큼 재 보고 · 초당 장 수가 이보다 적으면 한 단씩 내린다 */
  shadowEvery: 2,                                            /* 덜어 낸 동안 그림자는 이만큼의 장면마다 한 번 */
  light: {
    /* [하늘빛, 땅빛, 세기] · 해 [빛, 세기, 자리] · 채움빛 [빛, 세기] · 햇살·먼지 빛 */
    morning:   { hemi: [['stage-soft', 'a-fish', 0.2], ['a-leaf', 'a-wood', 0.5], 0.62], sun: ['warm-soft', 3.3, [-13, 12, 7]], fill: [['stage-soft', 'a-fish', 0.3], 0.5], glow: 'warm-soft', sky: [['stage-soft', 'a-fish', 0.12], 'warm-soft', 'bg'] },
    day:       { hemi: [['stage-soft', 'a-fish', 0.35], ['a-leaf', 'a-wood', 0.4], 0.75], sun: ['surface', 3.0, [-6, 16, 6]], fill: [['stage-soft', 'a-fish', 0.3], 0.6], glow: 'surface', sky: [['stage-soft', 'a-fish', 0.3], 'stage-soft', 'bg'] },
    afternoon: { hemi: [['warm-soft', 'stage-soft', 0.4], ['a-leaf', 'a-wood', 0.6], 0.6], sun: ['warm', 2.8, [12, 9, 6]], fill: [['stage-soft', 'a-fish', 0.2], 0.45], glow: 'warm', sky: [['warm-soft', 'stage-soft', 0.4], 'warm-soft', 'bg'] },
    evening:   { hemi: [['a-plum', 'stage-soft', 0.5], ['a-wood', 'ink', 0.3], 0.5], sun: ['warm', 2.2, [14, 5, 4]], fill: [['a-plum', 'a-fish', 0.4], 0.45], glow: 'warm', sky: [['a-plum', 'warm-soft', 0.5], 'warm-soft', 'bg'] },
    lamp:      { hemi: [['a-plum', 'ink', 0.4], ['a-wood', 'ink', 0.5], 0.35], sun: ['warm', 1.4, [-8, 10, 6]], fill: [['warm', 'a-plum', 0.4], 0.4], glow: 'warm', sky: [['ink-2', 'a-plum', 0.5], 'a-plum', 'ink-2'] }
  },
  amb: { vol: 0.035, birdEvery: [6, 12] }                    /* 바탕 소리 크기 · 새 소리 사이(초) */
};

export function createKit(o = {}){
  const LOW = o.low != null ? o.low : /[?&]q=low/.test(location.search);
  /* ── 토큰 → 색 ── */
  const CS = getComputedStyle(document.body);
  const C = n => new THREE.Color(CS.getPropertyValue('--' + n).trim());
  const hex = n => '#' + C(n).getHexString();
  const mix = (a, b, t) => (typeof a === 'string' ? C(a) : a.clone()).lerp(typeof b === 'string' ? C(b) : b, t);
  const hexOf = c => '#' + c.getHexString();
  const tone = v => Array.isArray(v) ? mix(v[0], v[1], v[2]) : C(v);
  const RNG = seed => { let k = seed; return () => { k = (k * 16807) % 2147483647; return k / 2147483647; }; };

  /* ── 렌더러 · 장면 ── */
  const cv = o.canvas;
  const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(devicePixelRatio, LOW ? 1 : 2));
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = 1.0;
  const S = new THREE.Scene();
  const M = (c, op = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: typeof c === 'string' ? C(c) : c, roughness: 0.7, metalness: 0 }, op));
  function canvasTex(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
  function mesh(g, mat, x = 0, y = 0, z = 0){ const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
  function ball(r, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1){ const m = mesh(new THREE.SphereGeometry(r, 24, 18), mat, x, y, z); m.scale.set(sx, sy, sz); return m; }
  function rshape(w, h, r){ const s = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2);
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function rbox(w, h, d, r, mat){
    const b = Math.min(0.06, d / 4), g = new THREE.ExtrudeGeometry(rshape(w, h, r), { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 10 });
    g.translate(0, 0, -(d - 2 * b) / 2); const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
  }
  function flat(shape, mat, y){ const m = new THREE.Mesh(new THREE.ShapeGeometry(shape, 32), mat); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; return m; }
  function oval(cx, cz, rx, rz){ const s = new THREE.Shape(); s.absellipse(cx, -cz, rx, rz, 0, Math.PI * 2); return s; }
  /* 부드러운 얼룩(가장자리가 번지는 타원) — 바닥 그림에 쓴다 */
  function soft(g, x, y, rx, ry, col, alpha, feather, n = 7){ g.fillStyle = col; const a = 1 - Math.pow(1 - alpha, 1 / n); for (let k = 0; k < n; k++) { g.globalAlpha = a; g.beginPath(); g.ellipse(x, y, rx + feather * (1 - k / (n - 1)), ry + feather * (1 - k / (n - 1)), 0, 0, 7); g.fill(); } g.globalAlpha = 1; }
  /* 가운데가 진하고 가장자리로 사라지는 점(밝은 자리 · 그림자 · 햇살) */
  function glowTex(n, pow){ return canvasTex(n, n, (g, w) => { g.clearRect(0, 0, w, w); g.fillStyle = hex('surface'); const k = 22; for (let i = 0; i < k; i++) { g.globalAlpha = Math.pow((i + 1) / k, pow) * 0.16; g.beginPath(); g.arc(w / 2, w / 2, w / 2 * (1 - i / k), 0, 7); g.fill(); } g.globalAlpha = 1; }); }
  /* 글자 판 — 글자 자료(content/letters.js)의 획을 그린다(아이가 쓰는 모양 그대로) */
  function letterTex(ch, ink, bg){
    return canvasTex(160, 160, (g, w, h) => { g.clearRect(0, 0, w, h); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
      const G = (window.PLAY_LETTERS && PLAY_LETTERS.glyphs[ch]) || []; g.strokeStyle = ink; g.lineWidth = 21; g.lineCap = g.lineJoin = 'round';
      G.forEach(st => { g.beginPath(); st.forEach((p, i) => { const x = w / 2 + (p[0] - 0.5) * w * 0.82, y = h / 2 + (p[1] - 0.55) * h * 1.12; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke(); }); });
  }
  const FX = [];                                    /* 그늘 계산(AO)에서는 빼는 것들 — 빛 · 알갱이 · 물무늬 */
  const fx = m => { FX.push(m); m.castShadow = m.receiveShadow = false; return m; };
  function skyTex(stops){ return canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, hexOf(tone(stops[0]))); gr.addColorStop(0.55, hexOf(tone(stops[1]))); gr.addColorStop(1, hexOf(tone(stops[2]))); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); }
  S.background = skyTex(o.sky || KIT.light.morning.sky);
  const pm = new THREE.PMREMGenerator(R); S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; S.environmentIntensity = 0.3;
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 140);

  /* ── 트윈 ── */
  const tweens = [];
  function tween(dur, fn, ease = t => 1 - Math.pow(1 - t, 3)){ return new Promise(r => tweens.push({ t0: performance.now(), dur, fn, ease, r })); }
  function runTweens(now){ for (let i = tweens.length - 1; i >= 0; i--) { const k = tweens[i], p = Math.min(1, (now - k.t0) / k.dur); k.fn(k.ease(p)); if (p >= 1) { tweens.splice(i, 1); k.r(); } } }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const soon = (p, ms) => Promise.race([p || Promise.resolve(), new Promise(r => setTimeout(r, ms))]);

  /* ── 후처리 — 닿는 곳 그늘(AO) + 빛 번짐 ── */
  const rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
  const comp = new EffectComposer(R, rt); comp.addPass(new RenderPass(S, cam));
  let ao = null; if (!LOW) try { ao = new GTAOPass(S, cam, 1, 1); ao.blendIntensity = 0.85; comp.addPass(ao);
    const ov = ao._overrideVisibility; if (ov) ao._overrideVisibility = function(){ ov.call(this); FX.forEach(m => { if (m.visible) { m.visible = false; this._visibilityCache.push(m); } }); };
  } catch (e) { ao = null; }
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.2, 0.6, 0.95); if (!LOW) comp.addPass(bloom);
  comp.addPass(new OutputPass());

  /* ── 크기 — 페이지가 view(a) 로 「보이는 반 높이」를 정한다 ── */
  const sizers = [];
  function resize(){
    const w = innerWidth, h = innerHeight; if (!w || !h) return;                     /* 화면이 잠깐 0 일 때는 건너뛴다 */
    const a = w / h, view = K.view(a);
    cam.left = -view * a; cam.right = view * a; cam.top = view; cam.bottom = -view; cam.updateProjectionMatrix();
    R.setSize(w, h, false); comp.setPixelRatio(R.getPixelRatio()); comp.setSize(w, h); bloom.resolution.set(w, h); if (ao) ao.setSize(w, h);
    sizers.forEach(f => f(a, w, h));
  }

  /* ── 품질 3단 · 덜어 내기 ── */
  let quality = LOW ? 'low' : 'high', light = false, fpsT = 0, fpsN = 0, checked = LOW, frameN = 0;
  const extras = [];                                   /* 햇살 · 먼지처럼 품질이 낮으면 감추는 것 */
  function apply(){
    const full = quality === 'high' && !light, mid = quality !== 'low' && !light;
    if (ao) ao.enabled = full; bloom.enabled = mid; extras.forEach(m => { m.visible = mid; });
    R.setPixelRatio(Math.min(devicePixelRatio, quality === 'high' && !light ? 2 : 1));
    if (K.sun) { K.sun.shadow.autoUpdate = !light; K.sun.shadow.needsUpdate = true; }
    resize();
  }
  function setQuality(q){ quality = q; apply(); }
  function lighten(on){ light = !!on; apply(); }
  function render(rawDt){
    if (light && ++frameN % KIT.shadowEvery === 0 && K.sun) K.sun.shadow.needsUpdate = true;
    comp.render();
    if (!checked) { fpsN++; fpsT += Math.min(rawDt, 0.25); if (fpsT > KIT.quality.checkSec) { checked = true; const f = fpsN / fpsT; if (f < KIT.quality.low) setQuality('low'); else if (f < KIT.quality.mid) setQuality('mid'); } }   /* 느린 기기면 가볍게 */
  }

  /* ── 화면 자리 ── */
  const v3 = new THREE.Vector3(), ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function screenOf(obj, dy = 0){ if (obj.isVector3) v3.copy(obj); else obj.getWorldPosition(v3); v3.y += dy; v3.project(cam); return [(v3.x + 1) / 2 * innerWidth, (1 - v3.y) / 2 * innerHeight]; }
  function toPlane(sx, sy, plane){ ndc.set(sx / innerWidth * 2 - 1, -(sy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam); return ray.ray.intersectPlane(plane, v3) ? { x: v3.x, y: v3.y, z: v3.z } : null; }
  /* 누른 자리의 물건 — accept(o) 가 참인 조상까지 올라간다 */
  function pick(e, objs, accept){ ndc.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1); ray.setFromCamera(ndc, cam); const hit = ray.intersectObjects(objs, true)[0]; if (!hit) return null; let m = hit.object; while (m && !accept(m)) m = m.parent; return m || null; }
  const ppu = () => innerHeight / (2 * cam.top / cam.zoom);     /* 한 단위가 화면 몇 점 */

  const K = {
    THREE, LOW, C, hex, mix, hexOf, tone, RNG, R, S, M, canvasTex, mesh, ball, rshape, rbox, flat, oval, soft, glowTex, letterTex, FX, fx, cam, comp,
    get ao(){ return ao; }, bloom, tween, tweens, runTweens, wait, soon, screenOf, toPlane, pick, ppu, resize, render, setQuality, lighten,
    get quality(){ return quality; }, get light(){ return light; },
    view: a => Math.max(6.6, 9.9 / a),
    onResize: f => { sizers.push(f); },
    extra: m => { extras.push(m); m.visible = quality !== 'low' && !light; return m; },
    sun: null,
    eye: c => eye(K, c), light: (p, op) => lights(K, p, op), particles: n => particles(K, n), ambience: () => ambience(K)
  };
  addEventListener('resize', resize);
  return K;
}

/* ── 눈(카메라) — 물건 쪽으로 살며시 다가갔다가 돌아온다 · 끌면 조금 돈다 ── */
function eye(K, c){
  const { THREE, cam } = K;
  const homeT = new THREE.Vector3(0, 1.0, -0.2), target = homeT.clone();
  let yaw = c.yaw, pitch = c.pitch, zoom = c.far != null ? c.far : 1, drift = 0, drag = null, still = false;
  const goal = { obj: null, zoom, w: 1, nx: 0, ny: 0, dy: 1 };
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vR = new THREE.Vector3(), vU = new THREE.Vector3();
  function place(){ const d = c.dist, y = yaw + drift; cam.position.set(target.x + Math.sin(y) * Math.cos(pitch) * d, target.y + Math.sin(pitch) * d, target.z + Math.cos(y) * Math.cos(pitch) * d); cam.lookAt(target); cam.updateMatrixWorld(); }
  /* obj 를 화면의 (nx, ny) 자리(-1~1)에 오게 · w 는 그쪽으로 쏠리는 정도 · obj 가 없으면 제자리로 */
  function focus(obj, z = 1, w = 1, nx = 0, ny = -0.12, dy = 1){ goal.obj = obj || null; goal.zoom = obj ? z : 1; goal.w = w; goal.nx = nx; goal.ny = ny; goal.dy = dy; }
  function step(dt, t){
    if (!drag && !still) drift = Math.sin(t * 0.22) * (c.drift || 0);
    const k = 1 - Math.exp(-dt * (c.ease || 3));
    zoom += (goal.zoom - zoom) * k;
    if (goal.obj) { goal.obj.getWorldPosition(vA); vA.y += goal.dy; vB.lerpVectors(homeT, vA, goal.w); vR.setFromMatrixColumn(cam.matrixWorld, 0); vU.setFromMatrixColumn(cam.matrixWorld, 1);
      vB.addScaledVector(vR, -goal.nx * cam.right / zoom).addScaledVector(vU, -goal.ny * cam.top / zoom); }
    else vB.copy(homeT);
    target.lerp(vB, k); cam.zoom = zoom; cam.updateProjectionMatrix(); place();
  }
  /* 끌면 조금 돈다 · 끌지 않고 뗀 것은 누르기(onTap) */
  function attach(el, onTap){
    let yaw0 = yaw, pitch0 = pitch;
    el.addEventListener('pointerdown', e => { if (still) { drag = { x: e.clientX, y: e.clientY, moved: false, fixed: true }; return; } drag = { x: e.clientX, y: e.clientY, moved: false }; yaw0 = yaw; pitch0 = pitch; });
    addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 8) drag.moved = true; if (!drag.moved || drag.fixed) return;
      yaw = Math.max(c.yawMin, Math.min(c.yawMax, yaw0 - dx * 0.003)); pitch = Math.max(c.pitchMin, Math.min(c.pitchMax, pitch0 + dy * 0.0025)); place(); });
    addEventListener('pointerup', e => { const d = drag; drag = null; if (d && !d.moved && e.target === el && onTap) onTap(e); });
    addEventListener('pointercancel', () => { drag = null; });
  }
  /* 가만히 — 몸 장면처럼 화면 자리가 손과 어긋나면 안 될 때(흔들림 0 · 끌어도 안 돎) */
  function hold(on){ still = !!on; if (still) { drift = 0; place(); } }
  K.onResize(a => { if (c.home) c.home(homeT, a); if (!goal.obj) target.copy(homeT); place(); });
  return { homeT, target, goal, focus, step, place, attach, hold, get yaw(){ return yaw; }, get pitch(){ return pitch; }, get zoom(){ return zoom; }, get dragging(){ return !!drag; } };
}

/* ── 빛 벌 ── */
function lights(K, preset = 'morning', op = {}){
  const { THREE, S, C, tone, canvasTex, hex, fx, LOW } = K, P = KIT.light[preset] || KIT.light.morning;
  const hemi = new THREE.HemisphereLight(tone(P.hemi[0]), tone(P.hemi[1]), P.hemi[2]); S.add(hemi);
  const sun = new THREE.DirectionalLight(C(P.sun[0]), P.sun[1]); sun.position.set(...P.sun[2]); sun.target.position.set(0, 0, 0); S.add(sun, sun.target);
  const sc = op.shadow || { left: -12, right: 12, top: 10, bottom: -10 };
  sun.castShadow = true; sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048); Object.assign(sun.shadow.camera, sc, { near: 1, far: 50 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; sun.shadow.radius = 5;
  const fill = new THREE.DirectionalLight(tone(P.fill[0]), P.fill[1]); fill.position.set(9, 8, 10); S.add(fill);
  K.sun = sun;
  /* 나무 사이로 드는 햇살 — 눈이 보는 쪽을 향한 판 */
  const shafts = [];
  if (!LOW && op.shafts) { const tex = canvasTex(32, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = hex('surface'); for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { const u = Math.sin(x / w * Math.PI), v = Math.sin(y / h * Math.PI); g.globalAlpha = u * u * v; g.fillRect(x, y, 2, 2); } g.globalAlpha = 1; });
    const d = new THREE.Vector3(...P.sun[2]).negate().normalize(), up = d.clone().negate(), v = op.view || [0.2, 0.6], view = new THREE.Vector3(Math.sin(v[0]) * Math.cos(v[1]), Math.sin(v[1]), Math.cos(v[0]) * Math.cos(v[1])), zz = view.clone().addScaledVector(up, -view.dot(up)).normalize(), xx = new THREE.Vector3().crossVectors(up, zz);
    op.shafts.forEach((a, i) => { const m = fx(new THREE.Mesh(new THREE.PlaneGeometry(a[3], 10), new THREE.MeshBasicMaterial({ map: tex, color: C(P.glow), transparent: true, opacity: a[4], blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }))); m.matrixAutoUpdate = false; m.matrix.makeBasis(xx, up, zz).setPosition(a[0], a[1], a[2]); m.matrixWorldNeedsUpdate = true; m.userData = { o: a[4], k: i * 2.1 }; S.add(K.extra(m)); shafts.push(m); }); }
  /* 햇살 속 먼지(빛 알갱이) */
  const box = op.dust || [16, 4, 10], dN = LOW ? Math.round(box[0] * 2) : Math.round(box[0] * 5), dp = new Float32Array(dN * 3);
  for (let i = 0; i < dN; i++) { dp[i * 3] = -box[0] / 2 + Math.random() * box[0]; dp[i * 3 + 1] = 0.5 + Math.random() * box[1]; dp[i * 3 + 2] = -box[2] / 2 + Math.random() * box[2]; }
  const dustG = new THREE.BufferGeometry(); dustG.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dustG, new THREE.PointsMaterial({ color: C(P.glow), size: 0.07, transparent: true, opacity: 0.85, depthWrite: false })); S.add(K.extra(dust));
  function step(dt, t){
    shafts.forEach(m => { m.material.opacity = m.userData.o * (0.75 + Math.sin(t * 0.5 + m.userData.k) * 0.25); });
    if (dust.visible) { const pa = dust.geometry.attributes.position; for (let i = 0; i < dN; i++) { pa.array[i * 3 + 1] += dt * 0.07; pa.array[i * 3] += Math.sin(t * 0.5 + i) * dt * 0.05; if (pa.array[i * 3 + 1] > box[1] + 0.6) pa.array[i * 3 + 1] = 0.4; } pa.needsUpdate = true; }
  }
  return { hemi, sun, fill, shafts, dust, step };
}

/* ── 알갱이 — 빛 튐 · 떨어지는 잎 · 꽃잎(한 번에 그린다) ── */
function particles(K, n){
  const { THREE, S, C, fx, LOW } = K, PN = n || (LOW ? 48 : 110), parts = [], dummy = new THREE.Object3D();
  const partM = fx(new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshBasicMaterial({ color: C('surface') }), PN));
  partM.frustumCulled = false; partM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); dummy.scale.setScalar(0); dummy.updateMatrix();
  for (let i = 0; i < PN; i++) { parts.push({ life: 0, age: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), g: 0, flat: false, size: 1, rot: 0, spin: 0, drag: 0 }); partM.setMatrixAt(i, dummy.matrix); partM.setColorAt(i, C('surface')); }
  S.add(partM); let partI = 0;
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vR = new THREE.Vector3();
  const SPARK = ['warm', 'a-gold', 'surface', 'warm-soft'];
  let floor = null;                                    /* [반너비, 반깊이] — 이 안에서는 땅(0.06)에 내려앉는다 */
  function spawn(p, v, life, tn, op = {}){ const q = parts[partI]; q.p.copy(p); q.v.copy(v); q.life = life; q.age = 0; q.g = op.g == null ? -9 : op.g; q.flat = !!op.flat; q.size = op.size || 1; q.drag = op.drag || 0; q.rot = Math.random() * 6; q.spin = (Math.random() - 0.5) * 8; partM.setColorAt(partI, typeof tn === 'string' ? C(tn) : tn); partM.instanceColor.needsUpdate = true; partI = (partI + 1) % PN; }
  function burst(obj, dy = 1, n = 12, tones = SPARK){ if (obj.isVector3) vA.copy(obj); else obj.getWorldPosition(vA); vA.y += dy; for (let i = 0; i < n; i++) { const a = Math.random() * 6.3, r = 1 + Math.random() * 1.8; spawn(vB.set(vA.x + Math.cos(a) * 0.3, vA.y + Math.random() * 0.4, vA.z + Math.sin(a) * 0.3), vR.set(Math.cos(a) * r, 2.6 + Math.random() * 2.6, Math.sin(a) * r), 0.8 + Math.random() * 0.5, tones[i % tones.length], { size: 0.7 + Math.random() * 0.7 }); } }
  function petals(n = 36, box = [14, 8]){ const tones = ['a-pink', 'surface', 'warm-soft', 'a-gold']; for (let i = 0; i < n; i++) spawn(vB.set((Math.random() - 0.5) * box[0], 4.5 + Math.random() * 3, (Math.random() - 0.5) * box[1]), vR.set((Math.random() - 0.5) * 0.6, -1.1 - Math.random() * 0.6, (Math.random() - 0.5) * 0.4), 5.5, tones[i % tones.length], { g: 0, flat: true, size: 1.2 }); }
  function step(dt){
    let any = false; for (let i = 0; i < PN; i++) { const q = parts[i]; if (q.life <= 0) continue; any = true; q.age += dt;
      if (q.age >= q.life) { q.life = 0; dummy.scale.setScalar(0); dummy.updateMatrix(); partM.setMatrixAt(i, dummy.matrix); continue; }
      q.v.y += q.g * dt; if (q.flat) { q.p.x += Math.sin(q.age * 2.4 + i) * dt * 0.7; q.p.z += Math.cos(q.age * 1.9 + i) * dt * 0.3; if (q.drag) q.v.x *= 1 - dt * q.drag; } q.p.addScaledVector(q.v, dt);
      if (floor && q.p.y < 0.06 && Math.abs(q.p.x) < floor[0] && Math.abs(q.p.z) < floor[1]) { q.p.y = 0.06; q.v.set(0, 0, 0); q.spin = 0; }
      q.rot += q.spin * dt; const s = q.size * Math.min(1, q.age / 0.08) * Math.min(1, (q.life - q.age) / 0.35);
      dummy.position.copy(q.p); if (q.flat) { dummy.rotation.set(Math.sin(q.rot) * 0.6, q.rot, 0.3); dummy.scale.set(s * 1.6, s * 0.22, s); } else { dummy.rotation.set(q.rot, q.rot * 0.7, 0); dummy.scale.setScalar(s); } dummy.updateMatrix(); partM.setMatrixAt(i, dummy.matrix); }
    if (any) partM.instanceMatrix.needsUpdate = true;
  }
  return { spawn, burst, petals, step, SPARK, floor: f => { floor = f; }, mesh: partM };
}

/* ── 바탕 소리 한 겹 — 바람(걸러 낸 잡음) · 가끔 새(짧은 지저귐). 파일 0 · 효과음 설정을 따른다 ── */
function ambience(K){
  let ctx = null, out = null, timer = 0, on = false;
  const enabled = () => !window.PlayAudio || window.PlayAudio.enabled();
  function bird(){ if (!ctx || !on || !enabled()) return; const t0 = ctx.currentTime, n = 2 + (Math.random() * 3 | 0), f = 2400 + Math.random() * 1200;
    for (let i = 0; i < n; i++) { const o = ctx.createOscillator(), g = ctx.createGain(), t = t0 + i * 0.12; o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.35, t + 0.06); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(KIT.amb.vol * 1.4, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.1); } }
  function loop(){ bird(); const r = KIT.amb.birdEvery; timer = setTimeout(loop, (r[0] + Math.random() * (r[1] - r[0])) * 1000); }
  return {
    start(){ if (on) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; try { ctx = ctx || new AC(); if (ctx.resume) ctx.resume(); } catch (e) { return; }
      on = true; out = ctx.createGain(); out.gain.value = enabled() ? 1 : 0; out.connect(ctx.destination);
      const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
      const src = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); src.buffer = buf; src.loop = true; lp.type = 'lowpass'; lp.frequency.value = 420; g.gain.value = KIT.amb.vol * 0.5; src.connect(lp); lp.connect(g); g.connect(out); src.start(); this._src = src;
      loop(); },
    mute(m){ if (out) out.gain.value = m || !enabled() ? 0 : 1; },
    stop(){ on = false; clearTimeout(timer); try { if (this._src) this._src.stop(); } catch (e) {} if (out) out.disconnect(); }
  };
}
