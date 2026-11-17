/* 케이월드 장면 공통 부품(S00, 2026-11-17) — 그믐밤(night.js v2.1)에서 뽑음.
   장면마다 다른 것(무대·위협·할 일·끝 화면)은 장면 파일에 두고, 여기에는 어느 장면이나 같은 것만 둔다.
   화면 틀(아이디): #c 캔버스 · #say 한 줄 · #ov 덮개 · #goal 가장자리 빛 · #bView ⟲#bL ⟳#bR #rot 시점 · #stick #bRun 터치.
   좌표: x 동쪽(+), z 남쪽(+). 한 줄 가운데 슬래시 두 개 주석 금지(블록 주석만). */
import * as THREE from 'three';

export const $ = (id) => document.getElementById(id);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
export const angDiff = (a, b) => { const d = a - b; return Math.atan2(Math.sin(d), Math.cos(d)); };
export function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ───── 화면 ───── */
export function stage({ fog = [0x16264c, 70, 190], exposure = 1.12, fov = 38 } = {}) {
  const canvas = $('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = exposure;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(fog[0], fog[1], fog[2]);
  const cam = new THREE.PerspectiveCamera(fov, 1, 0.5, 400);
  function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  return { canvas, renderer, scene, cam, resize };
}
/* 그림자를 드리우는 해·달 한 개(그림자 지도 2048 한 장) */
export function sunLight(scene, { color, intensity, box, far = 120, pos, target }) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.castShadow = true; l.shadow.mapSize.set(2048, 2048);
  Object.assign(l.shadow.camera, { left: -box[0], right: box[0], top: box[1], bottom: -box[1], near: 1, far });
  l.shadow.bias = -0.001; l.shadow.normalBias = 0.06;
  l.position.set(pos[0], pos[1], pos[2]); l.target.position.set(target[0], target[1], target[2]);
  scene.add(l, l.target); return l;
}

/* ───── 도형 · 재질(면이 적고 또렷한 색 — 수학 놀이터 섬 방식) ───── */
export const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0, flatShading: true, ...o });
export const box = (w, h, d, c, o) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c, o)); m.castShadow = m.receiveShadow = true; return m; };
export const cyl = (rt, rb, h, c, seg = 10, o) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), M(c, o)); m.castShadow = m.receiveShadow = true; return m; };
export const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
export function canvasTex(w, h, fn) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; }
export function flatMaker(scene) { return (x0, z0, x1, z1, c, y = 0.02) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.1, z1 - z0), M(c)); m.position.set((x0 + x1) / 2, y - 0.05, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m); return m; }; }
/* 하늘: 둥근 지붕(아래→위 두 빛) + 별(있으면) */
export function skyDome(scene, rnd, { top, low, stars = 0 }) {
  const skyMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false });
  const g = new THREE.SphereGeometry(300, 24, 12), col = [], T = new THREE.Color(top), L = new THREE.Color(low), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const t = clamp(p.getY(i) / 220, 0, 1), c = L.clone().lerp(T, t); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); scene.add(new THREE.Mesh(g, skyMat));
  /* 하늘빛 다시 칠하기(해 질 녘처럼 바뀌는 장면용) */
  const cT = new THREE.Color(), cL = new THREE.Color(), cc = new THREE.Color();
  function paint(top2, low2) { cT.set(top2); cL.set(low2); const ca = g.attributes.color; for (let i = 0; i < p.count; i++) { const t = clamp(p.getY(i) / 220, 0, 1); cc.copy(cL).lerp(cT, t); ca.setXYZ(i, cc.r, cc.g, cc.b); } ca.needsUpdate = true; }
  let starPts = null;
  if (stars) { const sp = []; for (let i = 0; i < stars; i++) { const a = rnd() * 6.28, e = 0.12 + rnd() * 1.3; sp.push(Math.cos(a) * Math.cos(e) * 280, Math.sin(e) * 280, Math.sin(a) * Math.cos(e) * 280); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); starPts = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 })); scene.add(starPts); }
  return { skyMat, stars: starPts, geo: g, paint };
}
/* 둥근 빛 무늬(불·등불 둘레) */
export function glowSprite(scene, inner = 'rgba(255,225,150,.95)', outer = 'rgba(255,170,60,0)', size = 8) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, inner); r.addColorStop(1, outer); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }), depthTest: false, transparent: true, blending: THREE.AdditiveBlending, fog: false }));
  s.scale.set(size, size, 1); scene.add(s); return s;
}
/* 아이를 가리는 집·나무: 묶음으로 두었다가 가까이 시점에서 비쳐 보이게 */
export function occluders(scene) {
  const occl = [];
  function group(r, parts) { const g = new THREE.Group(); for (const p of parts) g.add(p); scene.add(g); const mats = new Set(); g.traverse((o) => { if (o.isMesh) mats.add(o.material); }); occl.push({ g, r, mats: [...mats], a: 1 }); return g; }
  return { occl, group };
}
/* 퍼지는 고리(소리가 닿는 자리) */
export function ringsFx(scene) {
  const rings = [];
  function ring(x, z, r, col = 0xffffff) { const m = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.1, z); scene.add(m); rings.push({ m, r, t: 0 }); }
  function update(dt) { for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += dt * 1.6; const k = Math.min(1, r.t); r.m.scale.setScalar(Math.max(0.01, k * r.r)); r.m.material.opacity = 0.75 * (1 - k); if (k >= 1) { scene.remove(r.m); rings.splice(i, 1); } } }
  return { ring, update, rings };
}

/* ───── 사람 — 섬과 같은 네모 사람 ───── */
export const faceTex = (skin, mood) => canvasTex(64, 64, (g) => { g.fillStyle = skin; g.fillRect(0, 0, 64, 64); g.fillStyle = '#2b2118'; g.fillRect(16, 26, 8, 9); g.fillRect(40, 26, 8, 9); if (mood === 'stern') { g.fillRect(12, 19, 14, 4); g.fillRect(38, 19, 14, 4); g.fillRect(22, 46, 20, 4); } else { g.fillRect(24, 46, 16, 4); } });
export function people(scene) {
  /* hat: 'guard'(전립) · 'gat'(갓) · 'satgat'(삿갓) · 'hair'(헝클어진 긴 머리) · 그 밖(상투). lantern: 오른손 초롱 · torch: 오른손 횃불 · spear: 왼손 창 */
  function person({ shirt, pants, hat, mood = 'soft', lantern = false, torch = false, spear = false, skin: skinC = 0xffd9a8, hairC = 0x2b2118 }) {
    const g = new THREE.Group(), skinHex = '#' + skinC.toString(16).padStart(6, '0'), skin = M(skinC), face = new THREE.MeshStandardMaterial({ map: faceTex(skinHex, mood), roughness: 0.85 });
    const legL = new THREE.Group(), legR = new THREE.Group(); legL.add(at(box(0.26, 0.62, 0.3, pants), 0, -0.31, 0)); legR.add(at(box(0.26, 0.62, 0.3, pants), 0, -0.31, 0)); legL.position.set(-0.17, 0.62, 0); legR.position.set(0.17, 0.62, 0);
    const body = at(box(0.7, 0.72, 0.42, shirt), 0, 0.98, 0), skirt = at(box(0.78, 0.22, 0.5, shirt), 0, 0.7, 0);
    const armL = new THREE.Group(), armR = new THREE.Group(); armL.add(at(box(0.2, 0.6, 0.24, shirt), 0, -0.26, 0)); armR.add(at(box(0.2, 0.6, 0.24, shirt), 0, -0.26, 0)); armL.position.set(-0.46, 1.28, 0); armR.position.set(0.46, 1.28, 0);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.58), [skin, skin, skin, skin, face, skin]); head.position.y = 1.66; head.castShadow = true;
    const top = new THREE.Group(); top.position.y = 0; g.add(legL, legR, body, skirt, armL, armR, head, top);
    if (hat === 'guard') { top.add(at(cyl(0.56, 0.6, 0.08, 0x1c1c26, 10), 0, 1.98, 0), at(cyl(0.24, 0.3, 0.36, 0x1c1c26, 8), 0, 2.18, 0), at(box(0.14, 0.14, 0.14, 0xe24a3a), 0, 2.42, 0)); }
    else if (hat === 'gat') { top.add(at(cyl(0.62, 0.62, 0.05, 0x1a1a1a, 12), 0, 1.98, 0), at(cyl(0.22, 0.26, 0.44, 0x1a1a1a, 8), 0, 2.2, 0)); }
    else if (hat === 'satgat') { const c = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.5, 8), M(0xd8b76a)); c.castShadow = true; top.add(at(c, 0, 2.18, 0)); }
    else if (hat === 'hair') { top.add(at(box(0.66, 0.24, 0.66, hairC), 0, 2.0, 0), at(box(0.66, 0.5, 0.16, hairC), 0, 1.72, -0.27), at(box(0.12, 0.36, 0.5, hairC), -0.32, 1.78, -0.04), at(box(0.12, 0.36, 0.5, hairC), 0.32, 1.78, -0.04)); }
    else { top.add(at(box(0.62, 0.2, 0.62, 0x2b2118), 0, 1.98, 0), at(box(0.2, 0.22, 0.2, 0x2b2118), 0, 2.16, -0.05)); }
    let flame = null;
    if (lantern) { armR.rotation.x = -1.1; const l = new THREE.Group(); l.add(at(cyl(0.03, 0.03, 0.9, 0x6a4526, 5), 0, 0, 0), at(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.3), new THREE.MeshBasicMaterial({ color: 0xffd27a })), 0, -0.5, 0)); l.rotation.x = Math.PI / 2; l.position.set(0.46, 1.1, 0.7); g.add(l); }
    if (torch) { armR.rotation.x = -2.4; const t = new THREE.Group(); t.add(at(cyl(0.05, 0.06, 1.1, 0x6a4526, 5), 0, 0, 0)); flame = new THREE.Group(); for (let k = 0; k < 3; k++) flame.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.16 - k * 0.04, 0.42 + k * 0.08, 5), new THREE.MeshBasicMaterial({ color: [0xff5a2a, 0xffa23a, 0xffe07a][k] })), 0, 0.66 + k * 0.04, 0)); t.add(flame); t.position.set(0.5, 2.0, 0.25); g.add(t); }
    if (spear) { const s = new THREE.Group(); s.add(at(cyl(0.04, 0.05, 2.6, 0x7a5230, 5), 0, 0, 0), at(new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 4), M(0x8d8d96)), 0, 1.44, 0)); s.position.set(-0.6, 1.25, 0.1); g.add(s); }
    g.userData = { legL, legR, armL, armR, body, skirt, lantern: lantern || torch, flame };
    scene.add(g); return g;
  }
  function walkAnim(g, phase, moving, limp = 0) { const u = g.userData, s = moving ? Math.sin(phase) : 0; u.legL.rotation.x = s * 0.7; u.legR.rotation.x = -s * (limp ? 0.25 : 0.7); u.armL.rotation.x = -s * 0.6; if (!u.lantern) u.armR.rotation.x = s * 0.6; }
  return { person, walkAnim };
}

/* ───── 막는 것 · 길찾기 · 시야 (막는 것 = [x0,z0,x1,z1,높이,…]) ───── */
export const inRect = (x, z, r, pad = 0) => x > r[0] - pad && x < r[2] + pad && z > r[1] - pad && z < r[3] + pad;
export function collideRects(rects, x, z, r = 0.42) {
  for (const s of rects) { const cx = clamp(x, s[0], s[2]), cz = clamp(z, s[1], s[3]); const dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz); if (d < r) { if (d < 1e-4) { const l = x - s[0], rr = s[2] - x, t = z - s[1], b = s[3] - z, m = Math.min(l, rr, t, b); if (m === l) x = s[0] - r; else if (m === rr) x = s[2] + r; else if (m === t) z = s[1] - r; else z = s[3] + r; } else { x = cx + (dx / d) * r; z = cz + (dz / d) * r; } } }
  return [x, z];
}
export function clipRect(ax, az, dx, dz, r, max) { let t0 = 0, t1 = max; for (const [p, q] of [[-dx, ax - r[0]], [dx, r[2] - ax], [-dz, az - r[1]], [dz, r[3] - az]]) { if (p === 0) { if (q < 0) return -1; } else { const t = q / p; if (p < 0) { if (t > t1) return -1; if (t > t0) t0 = t; } else { if (t < t0) return -1; if (t < t1) t1 = t; } } } return t0; }
export function losRects(rects, ax, az, bx, bz) { for (const s of rects) if (clipRect(ax, az, bx - ax, bz - az, s, 1) >= 0) return false; return true; }
export function rayLenRects(rects, ax, az, dx, dz, max) { let best = max; for (const r of rects) { const t = clipRect(ax, az, dx, dz, r, max); if (t >= 0 && t < best) best = t; } return best; }
/* 칸 길찾기(너비 우선, 대각선은 모서리를 끊지 않게). grid[z*W+x] = 1 이면 막힘 */
export function gridPath(grid, W, H) {
  return function findPath(ax, az, bx, bz) {
    const s = clamp(az | 0, 0, H - 1) * W + clamp(ax | 0, 0, W - 1); let e = clamp(bz | 0, 0, H - 1) * W + clamp(bx | 0, 0, W - 1);
    if (grid[e]) { let best = -1, bd = 1e9; for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) { const x = (bx | 0) + dx, z = (bz | 0) + dz; if (x < 0 || z < 0 || x >= W || z >= H || grid[z * W + x]) continue; const d = dx * dx + dz * dz; if (d < bd) { bd = d; best = z * W + x; } } if (best < 0) return null; e = best; }
    const prev = new Int32Array(W * H).fill(-1), q = new Int32Array(W * H); let qh = 0, qt = 0; q[qt++] = s; prev[s] = s;
    const N = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    while (qh < qt) { const c = q[qh++]; if (c === e) break; const cx = c % W, cz = (c / W) | 0;
      for (const [dx, dz] of N) { const x = cx + dx, z = cz + dz; if (x < 0 || z < 0 || x >= W || z >= H) continue; const n = z * W + x; if (prev[n] >= 0 || grid[n]) continue; if (dx && dz && (grid[cz * W + x] || grid[z * W + cx])) continue; prev[n] = c; q[qt++] = n; } }
    if (prev[e] < 0) return null; const out = []; let c = e; while (c !== s) { out.push([(c % W) + 0.5, ((c / W) | 0) + 0.5]); c = prev[c]; } return out.reverse();
  };
}

/* ───── 소리(파일 없이 그 자리에서 만든다) ───── */
let AC = null;
export function audio() { if (!AC) try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* 소리 없이 */ } return AC; }
export function resumeAudio() { audio(); if (AC && AC.state === 'suspended') AC.resume(); }
export function tone(f0, f1, dur, type = 'sine', vol = 0.2, when = 0) { const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + when; o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05); }
export function noise(dur, vol = 0.2, freq = 900, when = 0) { const a = audio(); if (!a) return; const n = a.sampleRate * dur, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol; s.connect(f).connect(g).connect(a.destination); s.start(a.currentTime + when); }

/* ───── 말 한 줄 · 덮개 ───── */
export function sayLine(S) {
  function say(text, key, sec = 2.6) { if (key) { if (S.said[key]) return; S.said[key] = 1; } const e = $('say'); e.textContent = text; e.style.opacity = 1; S.sayT = sec; }
  function tick(dt) { if (S.sayT > 0) { S.sayT -= dt; if (S.sayT <= 0) $('say').style.opacity = 0; } }
  return { say, tick };
}
export function overlay(html, btn, fn) { const o = $('ov'); o.firstElementChild.innerHTML = html + `<button id="go">${btn}</button>`; o.style.display = 'flex'; $('go').onclick = () => { resumeAudio(); o.style.display = 'none'; fn(); }; }

/* ───── 조작: 방향키/WASD · Shift 뛰기 · V 시점 · Q/E 돌려 보기 · 휠 당겨 보기 / 터치: 왼쪽 막대 + 오른쪽 단추 ───── */
export const VIEWS = ['위에서', '가까이', '어깨 너머', '지도'];
export function controls(S, say) {
  const ctl = { keys: {}, sx: 0, sz: 0, run: false, isTouch: false };
  const keys = ctl.keys;
  ctl.toggleView = () => { S.view = (S.view + 1) % VIEWS.length; S.camYaw = S.pdir; $('bView').textContent = '👁 ' + VIEWS[S.view]; $('rot').style.display = S.view < 2 ? '' : 'none'; say(S.view === 2 ? '어깨 너머 — 좌우로 몸을 틀고, 앞뒤로 걷는다' : S.view === 3 ? '지도처럼 한눈에 본다' : VIEWS[S.view] + ' 본다', null, 1.8); };
  ctl.turnView = (d) => { if (S.view > 1) return; S.yawT += d * Math.PI / 2; };
  ctl.yawNow = () => (S.view < 2 ? S.yaw : 0);
  addEventListener('keydown', (e) => { keys[e.code] = true; if (e.code === 'KeyV' && !e.repeat) ctl.toggleView(); if (e.code === 'KeyQ' && !e.repeat) ctl.turnView(-1); if (e.code === 'KeyE' && !e.repeat) ctl.turnView(1); if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', (e) => { keys[e.code] = false; });
  $('bView').addEventListener('pointerdown', (e) => { e.stopPropagation(); ctl.toggleView(); });
  $('bL').addEventListener('pointerdown', (e) => { e.stopPropagation(); ctl.turnView(-1); }); $('bR').addEventListener('pointerdown', (e) => { e.stopPropagation(); ctl.turnView(1); });
  addEventListener('wheel', (e) => { S.zoom = clamp(S.zoom + Math.sign(e.deltaY) * 0.1, 0.6, 1.5); }, { passive: true });
  ctl.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (ctl.isTouch) document.body.classList.add('touch');
  { const st = $('stick'), nub = st.firstElementChild; let id = null;
    const mv = (e) => { const r = st.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dz = e.clientY - (r.top + r.height / 2), l = Math.hypot(dx, dz), m = Math.min(l, 50); ctl.sx = l > 8 ? (dx / l) * (m / 50) : 0; ctl.sz = l > 8 ? (dz / l) * (m / 50) : 0; nub.style.transform = `translate(${(dx / (l || 1)) * m}px,${(dz / (l || 1)) * m}px)`; };
    st.addEventListener('pointerdown', (e) => { id = e.pointerId; st.setPointerCapture(id); mv(e); e.stopPropagation(); });
    st.addEventListener('pointermove', (e) => { if (e.pointerId === id) mv(e); });
    const up = (e) => { if (e.pointerId === id) { id = null; ctl.sx = ctl.sz = 0; nub.style.transform = ''; } }; st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
    const br = $('bRun'); br.addEventListener('pointerdown', (e) => { ctl.run = true; e.stopPropagation(); }); const ru = () => { ctl.run = false; }; br.addEventListener('pointerup', ru); br.addEventListener('pointercancel', ru); br.addEventListener('pointerleave', ru); }
  /* 보는 방향 기준 움직임(어깨 너머만 몸 틀기). 돌려주는 값: ix·iz(땅 위 방향), back(뒷걸음) */
  ctl.read = (dt) => {
    let ix = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0) + ctl.sx, iz = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0) + ctl.sz;
    let back = false; if (S.view === 2) { S.pdir += clamp(ix, -1, 1) * 2.6 * dt; const f = clamp(-iz, -1, 1); back = f < 0; ix = Math.cos(S.pdir) * f; iz = Math.sin(S.pdir) * f; } else { const a = ctl.yawNow(), wx = Math.cos(a) * ix + Math.sin(a) * iz, wz = -Math.sin(a) * ix + Math.cos(a) * iz; ix = wx; iz = wz; }
    return { ix, iz, back };
  };
  ctl.running = () => keys.ShiftLeft || keys.ShiftRight || ctl.run;
  return ctl;
}

/* ───── 시점 넷(위에서·가까이·어깨 너머·지도) · 비쳐 보이기 · 가장자리 빛 ───── */
const v3 = new THREE.Vector3();
const setFov = (cam, f) => { if (cam.fov !== f) { cam.fov = f; cam.updateProjectionMatrix(); } };
export function followCam(cam, S, o) {
  const { W, H } = o, tall = cam.aspect < 1, cx = o.clampX || [6, W - 6], cz = o.clampZ || [2, H - 4], mp = o.map || { h: [82, 150], z: 10, look: -2.5 };
  const nh = o.nearH || [9.5, 13], nb = o.nearBk || [12.5, 16], fh = o.farH || [41, 58], fb = o.farBk || [27, 36];
  if (S.view === 2) { setFov(cam, 60); let d = S.pdir - S.camYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); S.camYaw += d * 0.12; const fx = Math.cos(S.camYaw), fz = Math.sin(S.camYaw); cam.position.lerp(v3.set(S.px - fx * 6.2, 3.6, S.pz - fz * 6.2), 0.14); cam.lookAt(S.px + fx * 5, 1.3, S.pz + fz * 5); }
  else if (S.view === 3) { setFov(cam, 38); const hh = tall ? mp.h[1] : mp.h[0]; cam.position.lerp(v3.set(W / 2, hh, H / 2 + mp.z), 0.1); cam.lookAt(W / 2, 0, H / 2 + mp.look); }
  else { const d = S.yawT - S.yaw; S.yaw += d * 0.14; const a = S.yaw, near = S.view === 1; setFov(cam, near ? 52 : 38);
    const hh = (near ? (tall ? nh[1] : nh[0]) : (tall ? fh[1] : fh[0])) * S.zoom, bk = (near ? (tall ? nb[1] : nb[0]) : (tall ? fb[1] : fb[0])) * S.zoom, ahead = near ? 3.5 : 5;
    const tx = clamp(S.px - Math.sin(a) * ahead, cx[0], cx[1]), tz = clamp(S.pz - Math.cos(a) * ahead, cz[0], cz[1]);
    cam.position.lerp(v3.set(tx + Math.sin(a) * bk, hh, tz + Math.cos(a) * bk), near ? 0.1 : 0.08); cam.lookAt(cam.position.x - Math.sin(a) * bk, near ? 1.2 : 0, cam.position.z - Math.cos(a) * bk); }
}
export function fadeOccluders(occl, cam, S, active) {
  const ccx = cam.position.x, ccz = cam.position.z, sx = S.px - ccx, sz = S.pz - ccz, sl = sx * sx + sz * sz || 1;
  for (const o of occl) { const ox = (o.r[0] + o.r[2]) / 2, oz = (o.r[1] + o.r[3]) / 2, t = ((ox - ccx) * sx + (oz - ccz) * sz) / sl, pd = Math.hypot(ccx + sx * t - ox, ccz + sz * t - oz), rad = Math.max(o.r[2] - o.r[0], o.r[3] - o.r[1]) / 2 + (S.view === 0 ? 0.2 : 1.3);
    const hide = S.view !== 3 && active && t > 0.03 && t < (S.view === 0 ? 0.985 : 1.0) && pd < rad && Math.hypot(ox - S.px, oz - S.pz) < (S.view === 0 ? 6 : 16), a = hide ? 0.22 : 1; if (Math.abs(o.a - a) > 0.01) { o.a = lerp(o.a, a, 0.2); for (const m of o.mats) { m.transparent = o.a < 0.98; m.opacity = o.a; m.depthWrite = o.a > 0.5; } } }
}
/* 목표가 화면 밖이면 가장자리에 빛 */
export function edgeGoal(el, cam, pos, active, edge = 0.88) {
  const p = v3.copy(pos).project(cam), behind = p.z > 1; if (active && (behind || Math.abs(p.x) > 0.96 || Math.abs(p.y) > 0.9)) { let gx = behind ? -p.x : p.x, gy = behind ? 1 : p.y; const k = edge / Math.max(Math.abs(gx), Math.abs(gy), 0.001); el.style.display = 'block'; el.style.left = ((gx * k + 1) / 2) * innerWidth + 'px'; el.style.top = ((1 - gy * k) / 2) * innerHeight + 'px'; } else el.style.display = 'none';
}
/* 머리 위 작은 띠(들킴·일하는 중) — k 가 null 이면 숨김 */
export function overBar(el, cam, x, y, z, k) {
  if (k == null) { el.style.display = 'none'; return; }
  const q = v3.set(x, y, z).project(cam); el.style.display = 'block'; el.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; el.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; el.firstElementChild.style.width = clamp(k, 0, 1) * 100 + '%';
}
/* 땅 누른 자리(화면 좌표 → 땅 위 x,z) */
const _ray = new THREE.Raycaster(), _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), _v2 = new THREE.Vector2(), _hit = new THREE.Vector3();
export function groundAt(cam, clientX, clientY) { _v2.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1); _ray.setFromCamera(_v2, cam); if (!_ray.ray.intersectPlane(_plane, _hit)) return null; return [_hit.x, _hit.z]; }

/* ───── 돌림 고리: 30분의 1초 걸음, 시험용 고리(window.__scene)에서 쓴다 ───── */
export function runLoop(update, view, render) {
  let last = performance.now();
  function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); view(); render(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
}
