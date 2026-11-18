/* 케이월드 장면 공통 부품(S00, 2026-11-17) — 그믐밤(night.js v2.1)에서 뽑음.
   장면마다 다른 것(무대·위협·할 일·끝 화면)은 장면 파일에 두고, 여기에는 어느 장면이나 같은 것만 둔다.
   화면 틀(아이디): #c 캔버스 · #say 한 줄 · #ov 덮개 · #goal 가장자리 빛 · #bView ⟲#bL ⟳#bR #rot 시점 · #stick #bRun 터치.
   좌표: x 동쪽(+), z 남쪽(+). 한 줄 가운데 슬래시 두 개 주석 금지(블록 주석만). */
import * as THREE from 'three';
import { GLTFLoader } from '/labs/vendor/three185/addons/loaders/GLTFLoader.js';

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
/* 땅 무늬(11-17): 얼룩과 잔점이 있는 밝기 무늬 한 장을 온 땅에 되풀이한다 — 민짜 색판이 흙·풀밭처럼 보이게. 좌표는 땅 위치를 따라서 판끼리 이어진다. */
let _gtex = null;
export function groundTex() { if (_gtex) return _gtex; const r = rng(77); _gtex = canvasTex(256, 256, (g) => { g.fillStyle = '#f0f0f0'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 90; i++) { const x = r() * 256, y = r() * 256, rad = 14 + r() * 40, d = r() < 0.5; for (const [ox, oy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) { const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad); gr.addColorStop(0, d ? 'rgba(150,150,150,.20)' : 'rgba(255,255,255,.30)'); gr.addColorStop(1, 'rgba(200,200,200,0)'); g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2); } }
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? 'rgba(120,120,120,.16)' : 'rgba(255,255,255,.22)'; g.fillRect(r() * 256, r() * 256, 1 + r() * 2.4, 1 + r() * 2.4); } });
  _gtex.wrapS = _gtex.wrapT = THREE.RepeatWrapping; _gtex.anisotropy = 4; return _gtex; }
export function flatMaker(scene) { return (x0, z0, x1, z1, c, y = 0.02) => { const ge = new THREE.BoxGeometry(x1 - x0, 0.1, z1 - z0), uv = ge.attributes.uv, ps = ge.attributes.position, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; for (let i = 0; i < uv.count; i++) uv.setXY(i, (ps.getX(i) + cx) / 14, (ps.getZ(i) + cz) / 14);
  const m = new THREE.Mesh(ge, M(c, { map: groundTex() })); m.position.set(cx, y - 0.05, cz); m.receiveShadow = true; scene.add(m); return m; }; }
/* 뿌리기: 풀·꽃·돌·나무를 한 넓이에 흩는다(이름마다 그리기 한 번). avoid(x, z) 가 참인 자리는 비운다. 돌려주는 값 = 놓인 자리들 [[x, z, 크기, 이름]] */
export function scatter(scene, rnd, { area, n, names, avoid = null, scale = [0.8, 1.25], tints = {}, y = 0, shadow = true, minGap = 0 }) {
  const by = {}, put = []; let tries = 0;
  while (put.length < n && tries++ < n * 12) { const x = area[0] + rnd() * (area[2] - area[0]), z = area[1] + rnd() * (area[3] - area[1]); if (avoid && avoid(x, z)) continue; if (minGap && put.some((p) => Math.abs(p[0] - x) < minGap && Math.abs(p[1] - z) < minGap)) continue;
    const nm = names[Math.floor(rnd() * names.length)], sc = scale[0] + rnd() * (scale[1] - scale[0]); (by[nm] = by[nm] || []).push([x, typeof y === 'function' ? y(x, z) : y, z, sc, rnd() * 6.28]); put.push([x, z, sc, nm]); }
  for (const nm in by) artInst(scene, nm, by[nm], tints, { shadow });
  return put;
}
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

/* ───── 블렌더로 직접 만든 모델(2026-11-17 준호 「디자인이 너무 단순하다」) ─────
   만드는 곳 = kworld/tools/blender/make_*.py → kworld/scene/assets/*.glb. 물체 하나 = 이름 하나.
   읽을 때 물체마다 조각을 한 덩이로 합치고(그리기 한 번), 재질 이름으로 색을 굽는다: tint_* 는 부르는 쪽이 정하고 나머지는 모델의 색.
   glow_* 재질은 스스로 빛나는 조각(창 불빛)으로 따로 둔다. 음영은 꼭짓점 색에 들어 있다. */
export const ART = {};
export const ARTV = 2;
export const artMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0, side: THREE.DoubleSide });
export const artGlowMat = new THREE.MeshBasicMaterial({ vertexColors: true });
const artLoaded = {}, _c = new THREE.Color();
export async function loadArt(...names) {
  const L = new GLTFLoader();
  await Promise.all(names.filter((n) => !artLoaded[n]).map(async (n) => {
    const g = await L.loadAsync(new URL(`./assets/${n}.glb?v=${ARTV}`, import.meta.url).href); artLoaded[n] = 1;
    for (const node of g.scene.children) { const ms = []; node.traverse((o) => { if (o.isMesh) ms.push(o); }); if (!ms.length) continue;
      let nv = 0, ni = 0; for (const m of ms) { nv += m.geometry.attributes.position.count; ni += m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count; }
      const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), shade = new Float32Array(nv), mid = new Uint8Array(nv), index = new Uint32Array(ni), pal = []; let v0 = 0, i0 = 0;
      for (const m of ms) { const ge = m.geometry, P = ge.attributes.position, N = ge.attributes.normal, C = ge.attributes.color, k = pal.length; pal.push({ name: m.material.name, r: m.material.color.r, g: m.material.color.g, b: m.material.color.b });
        for (let i = 0; i < P.count; i++) { pos[(v0 + i) * 3] = P.getX(i); pos[(v0 + i) * 3 + 1] = P.getY(i); pos[(v0 + i) * 3 + 2] = P.getZ(i); nor[(v0 + i) * 3] = N.getX(i); nor[(v0 + i) * 3 + 1] = N.getY(i); nor[(v0 + i) * 3 + 2] = N.getZ(i); shade[v0 + i] = C ? C.getX(i) : 1; mid[v0 + i] = k; }
        if (ge.index) for (let i = 0; i < ge.index.count; i++) index[i0 + i] = ge.index.getX(i) + v0; else for (let i = 0; i < P.count; i++) index[i0 + i] = v0 + i;
        v0 += P.count; i0 += ge.index ? ge.index.count : P.count; }
      ART[node.name] = { pos, nor, shade, mid, index, pal, pivot: node.position.clone(), cache: {} }; }
  }));
  return ART;
}
/* 이름(또는 이름 여럿)의 모양에 색을 구워 돌려준다. tints = { shirt: 0x…, … } — 같은 색 조합은 한 번만 만든다. glow 가 true 면 빛나는 조각만. */
export function artGeo(names, tints = {}, glow = false) {
  const list = Array.isArray(names) ? names : [names], key = list.join('+') + '|' + Object.keys(tints).sort().map((k) => k + ':' + (tints[k] && tints[k].isColor ? tints[k].getHex() : tints[k])).join(',') + (glow ? '|g' : '');
  const A0 = ART[list[0]]; if (!A0) return null; if (A0.cache[key]) return A0.cache[key];
  const P = [], N = [], C = [], I = []; let base = 0;
  for (const nm of list) { const A = ART[nm]; if (!A) continue; const cols = A.pal.map((m) => { if (m.name.startsWith('tint_')) { const t = tints[m.name.slice(5)]; if (t == null) return [m.r, m.g, m.b]; _c.set(t); return [_c.r, _c.g, _c.b]; } return [m.r, m.g, m.b]; }), isG = A.pal.map((m) => m.name.startsWith('glow'));
    const map = new Int32Array(A.shade.length).fill(-1); let n = 0;
    for (let i = 0; i < A.shade.length; i++) { if (isG[A.mid[i]] !== glow) continue; map[i] = base + n++; const c = cols[A.mid[i]], s = A.shade[i]; P.push(A.pos[i * 3], A.pos[i * 3 + 1], A.pos[i * 3 + 2]); N.push(A.nor[i * 3], A.nor[i * 3 + 1], A.nor[i * 3 + 2]); C.push(c[0] * s, c[1] * s, c[2] * s); }
    for (let i = 0; i < A.index.length; i += 3) { const a = map[A.index[i]], b = map[A.index[i + 1]], c = map[A.index[i + 2]]; if (a >= 0 && b >= 0 && c >= 0) I.push(a, b, c); }
    base += n; }
  let g = null; if (I.length) { g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setIndex(I); }
  A0.cache[key] = g; return g;
}
/* 모델 하나를 세운다(그림자 드리움). 빛나는 조각이 있으면 묶음으로 돌려준다. */
export function art(names, tints = {}, { shadow = true } = {}) {
  const g = artGeo(names, tints), gl = artGeo(names, tints, true), m = new THREE.Mesh(g || new THREE.BufferGeometry(), artMat); m.castShadow = shadow; m.receiveShadow = true;
  if (!gl) return m; const grp = new THREE.Group(); grp.add(m, new THREE.Mesh(gl, artGlowMat)); grp.userData.glow = grp.children[1]; return grp;
}
/* 제 재질을 따로 가진 모델 — 비쳐 보이게 할 집(occluders 묶음)이나 혼자 색·밝기를 바꿀 것에 쓴다(공통 재질을 건드리면 온 장면이 같이 바뀐다) */
export function artOwn(names, tints = {}, o = {}) { const m = art(names, tints, o); const t = m.isMesh ? m : m.children[0]; t.material = artMat.clone(); return m; }
/* 같은 모델 여럿(나무·바위·풀): list = [[x, y, z, 크기(수 또는 [sx, sy, sz]), 돌림y], …] */
const _d = new THREE.Object3D();
export function artInst(scene, names, list, tints = {}, { shadow = true } = {}) {
  const g = artGeo(names, tints); if (!g || !list.length) return null; const m = new THREE.InstancedMesh(g, artMat, list.length);
  list.forEach((t, i) => { _d.position.set(t[0], t[1], t[2]); const s = t[3] == null ? 1 : t[3]; if (Array.isArray(s)) _d.scale.set(s[0], s[1], s[2]); else _d.scale.setScalar(s); _d.rotation.set(0, t[4] || 0, 0); _d.updateMatrix(); m.setMatrixAt(i, _d.matrix); });
  m.castShadow = shadow; m.receiveShadow = true; m.frustumCulled = false; scene.add(m);
  const gl = artGeo(names, tints, true); if (gl) { const m2 = new THREE.InstancedMesh(gl, artGlowMat, list.length); for (let i = 0; i < list.length; i++) { m.getMatrixAt(i, _d.matrix); m2.setMatrixAt(i, _d.matrix); } m2.frustumCulled = false; scene.add(m2); m.userData.glow = m2; }
  return m;
}

/* ───── 사람 — 블렌더 모델(people.glb)이 있으면 그것으로, 없으면 예전 네모 사람 ───── */
export const faceTex = (skin, mood) => canvasTex(64, 64, (g) => { g.fillStyle = skin; g.fillRect(0, 0, 64, 64); g.fillStyle = '#2b2118'; g.fillRect(16, 26, 8, 9); g.fillRect(40, 26, 8, 9); if (mood === 'stern') { g.fillRect(12, 19, 14, 4); g.fillRect(38, 19, 14, 4); g.fillRect(22, 46, 20, 4); } else { g.fillRect(24, 46, 16, 4); } });
export function people(scene) {
  /* hat: 'guard'(전립) · 'gat'(갓) · 'satgat'(삿갓) · 'hair'(헝클어진 긴 머리) · 그 밖(상투). lantern: 오른손 초롱 · torch: 오른손 횃불 · spear: 왼손 창 */
  /* 블렌더 사람: 머리(얼굴·머리칼·쓰개) · 몸통(저고리·자락) · 팔 둘 · 다리 둘 = 그리기 여섯 번. 옷 색은 꼭짓점 색에 굽는다.
     hat 에 더 쓸 수 있는 것: 'scarf'(머릿수건) · 'paeraengi'(패랭이) · 'braid'(댕기 머리) · 'bun'(쪽머리) · 'wild'(헝클어진 머리) · 'cap'(챙 모자, pants 색) · 'fedora'(중절모, pants 색) · 'boktu'(복두 — 신라·고려 벼슬아치) · 'band'(상투에 머리띠, pants 색 — 고조선·삼국 우두머리) · 'crop'(짧은 머리 — 근현대).
     chima: true 면 긴 치마(pants 색). style: 'hide' 면 선사 시대 가죽옷(깃 없음 · 맨팔 · 맨다리 · 가죽신), 'coat' 면 근대 단추 옷(제복·교복). */
  function personArt({ shirt, pants, hat, mood = 'soft', lantern = false, torch = false, spear = false, skin: skinC = 0xffd9a8, hairC = 0x2b2118, chima = false, style = null }) {
    const g = new THREE.Group(), tm = { skin: skinC, shirt, pants, hair: hairC }, hide = style === 'hide';
    const HAT = { guard: ['hair_base', 'hat_guard'], gat: ['hair_base', 'hat_gat'], satgat: ['hair_base', 'hat_satgat'], hair: ['hair_base', 'hair_fall'], scarf: ['hair_base', 'hat_scarf'], paeraengi: ['hair_base', 'hat_paeraengi'], braid: ['hair_base', 'hair_braid'], bun: ['hair_base', 'hair_bun'], wild: ['hair_wild'], cap: ['hair_base', 'hat_cap'], fedora: ['hair_base', 'hat_fedora'], boktu: ['hair_base', 'hat_boktu'], band: ['hair_base', 'hair_knot', 'hat_band'], crop: ['hair_base'] };
    const headN = ['head', ...(HAT[hat] || (hide ? ['hair_wild'] : ['hair_base', 'hair_knot'])), ...(mood === 'stern' ? ['brow_stern'] : [])], bodyN = hide ? ['torso_hide', 'skirt_hide'] : [style === 'coat' ? 'torso_coat' : 'torso', chima ? 'chima' : 'skirt'], sfx = hide ? '_bare' : '';
    const mk = (names) => { const m = new THREE.Mesh(artGeo(names, tm), artMat); m.castShadow = true; m.receiveShadow = true; return m; };
    const head = mk(headN), body = mk(bodyN), limbs = {};
    for (const n of ['legL', 'legR', 'armL', 'armR']) { const p = new THREE.Group(); p.position.copy(ART[n].pivot); p.add(mk(n + sfx)); limbs[n] = p; }
    if (chima) { limbs.legL.visible = limbs.legR.visible = false; }
    g.add(limbs.legL, limbs.legR, body, limbs.armL, limbs.armR, head);
    const retint = () => { head.geometry = artGeo(headN, tm); body.geometry = artGeo(bodyN, tm); for (const n in limbs) limbs[n].children[0].geometry = artGeo(n + sfx, tm); };
    const proxy = (k) => ({ material: { color: { set(c) { tm[k] = new THREE.Color().set(c).getHex(); retint(); } } } });
    let flame = null; const { armR } = limbs;
    if (lantern) { armR.rotation.x = -1.1; const l = new THREE.Group(); l.add(at(cyl(0.03, 0.03, 0.9, 0x6a4526, 5), 0, 0, 0), at(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.3), new THREE.MeshBasicMaterial({ color: 0xffd27a })), 0, -0.5, 0)); l.rotation.x = Math.PI / 2; l.position.set(0.46, 1.1, 0.7); g.add(l); }
    if (torch) { armR.rotation.x = -2.4; const t = new THREE.Group(); t.add(at(cyl(0.05, 0.06, 1.1, 0x6a4526, 5), 0, 0, 0)); flame = new THREE.Group(); for (let k = 0; k < 3; k++) flame.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.16 - k * 0.04, 0.42 + k * 0.08, 5), new THREE.MeshBasicMaterial({ color: [0xff5a2a, 0xffa23a, 0xffe07a][k] })), 0, 0.66 + k * 0.04, 0)); t.add(flame); t.position.set(0.5, 2.0, 0.25); g.add(t); }
    if (spear) { const s = new THREE.Group(); s.add(at(cyl(0.04, 0.05, 2.6, 0x7a5230, 5), 0, 0, 0), at(new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 4), M(0x8d8d96)), 0, 1.44, 0)); s.position.set(-0.6, 1.25, 0.1); g.add(s); }
    g.userData = { legL: limbs.legL, legR: limbs.legR, armL: limbs.armL, armR, body: proxy('shirt'), skirt: proxy('shirt'), head, lantern: lantern || torch, flame, retint, tm };
    scene.add(g); return g;
  }
  function person(o) { return ART.head ? personArt(o) : personBox(o); }
  function personBox({ shirt, pants, hat, mood = 'soft', lantern = false, torch = false, spear = false, skin: skinC = 0xffd9a8, hairC = 0x2b2118 }) {
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
export function overlay(html, btn, fn) { const o = $('ov'); o.firstElementChild.innerHTML = html + `<button id="go">${btn}</button>`; o.style.display = 'flex'; if (html.includes('class="marks"')) remember(o.firstElementChild); $('go').onclick = () => { resumeAudio(); o.style.display = 'none'; fn(); }; }
/* 족보 잇기(S11): 끝 화면의 「남긴 흔적」을 한 줄로 남긴다 — 저장은 /kedu_scope.js 를 따른다(계정별, 동의 없으면 기기에도 안 남음) */
export const TRAIL_KEY = 'kworld_scene_trail';
export function remember(box) {
  try { const id = location.pathname.split('/').filter(Boolean).pop() || 'scene', title = (document.title.split('—')[0] || id).trim(), head = (box.querySelector('h1') || {}).textContent || '';
    const marks = [...box.querySelectorAll('.marks span')].map((e) => ({ t: e.textContent.trim(), ok: e.classList.contains('ok') }));
    const list = JSON.parse(localStorage.getItem(TRAIL_KEY) || '[]'); list.push({ id, title, head, at: new Date().toISOString(), marks }); while (list.length > 300) list.shift(); localStorage.setItem(TRAIL_KEY, JSON.stringify(list)); } catch (e) { /* 저장 못 해도 판은 그대로 */ }
}

/* ───── 조작: 방향키/WASD · Shift 뛰기 · V 시점 · Q/E 돌려 보기 · 휠 당겨 보기 / 터치: 왼쪽 막대 + 오른쪽 단추 ───── */
export const VIEWS = ['위에서', '가까이', '어깨 너머', '지도'];
export function controls(S, say, views = VIEWS) {
  const ctl = { keys: {}, sx: 0, sz: 0, run: false, isTouch: false };
  const keys = ctl.keys;
  ctl.toggleView = () => { S.view = (S.view + 1) % views.length; S.camYaw = S.pdir; $('bView').textContent = '👁 ' + views[S.view]; $('rot').style.display = S.view < 2 ? '' : 'none'; say(S.view === 2 ? '어깨 너머 — 좌우로 몸을 틀고, 앞뒤로 걷는다' : S.view === 3 ? '지도처럼 한눈에 본다' : views[S.view] + ' 본다', null, 1.8); };
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
  else if (S.view === 3) { setFov(cam, mp.fov || 38); const hh = tall ? mp.h[1] : mp.h[0]; cam.position.lerp(v3.set(W / 2, hh, H / 2 + mp.z), 0.1); cam.lookAt(W / 2, 0, H / 2 + mp.look); }
  else { const d = S.yawT - S.yaw; S.yaw += d * 0.14; const a = S.yaw, near = S.view === 1; setFov(cam, near ? 52 : 38);
    const hh = (near ? (tall ? nh[1] : nh[0]) : (tall ? fh[1] : fh[0])) * S.zoom, bk = (near ? (tall ? nb[1] : nb[0]) : (tall ? fb[1] : fb[0])) * S.zoom, ahead = near ? 3.5 : 5;
    if (!near && o.farFov) setFov(cam, o.farFov);
    const tx = clamp(S.px - Math.sin(a) * ahead, cx[0], cx[1]), tz = clamp(S.pz - Math.cos(a) * ahead, cz[0], cz[1]);
    cam.position.lerp(v3.set(tx + Math.sin(a) * bk, hh, tz + Math.cos(a) * bk), near ? 0.1 : 0.08);
    /* 길 따라(lookY 가 있으면): 땅 대신 앞쪽 먼 곳을 바라봐 화면 위에 지평선·하늘이 걸린다 */
    if (!near && o.lookY != null) { const af = o.aheadFar || 12; cam.lookAt(cam.position.x - Math.sin(a) * (bk + af - ahead), o.lookY, cam.position.z - Math.cos(a) * (bk + af - ahead)); }
    else cam.lookAt(cam.position.x - Math.sin(a) * bk, near ? 1.2 : 0, cam.position.z - Math.cos(a) * bk); }
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

/* ───── 판 밖 세 겹(못 가지만 보이는 세상, S10 에서 처음) — 그림자 없음 · 충돌 없음 · 면 적게 ─────
   edge(z) → 그 z 에서 판의 [x0, x1] · field(z) → 논둑을 둘 곳인지 · skip(z) → 아무것도 두지 않을 곳(강 따위).
   가까운 겹(가장자리~30): 논둑 · 전봇대 줄 · 버려진 수레·보따리 · 언 개울. 중간 겹(30~120): 언덕 · 지붕 · 연기 · 멀리 피란민 줄.
   먼 겹: 산 능선 두 겹 + 하늘(카메라를 따라다녀서 늘 멀리 있다). 뒤쪽(+z) 하늘은 붉게 — paintSky(k) 로 짙어진다. lite 면 움직이는 점을 뺀다. */
export function backdrop(scene, o) {
  const { rnd, z0 = 0, z1 = 320, edge, field = () => true, skip = () => false, skyTop = 0x1d2a4c, skyLow = 0x8f9ab8, backC = 0xd8542c, frontC = 0xffc070, ridgeC = [0x4e5a7a, 0x66729a], lite = false, houses = ['thatch_snow', 'tile_snow'], trees = ['pine_snow', 'tree_bare_snow', 'pine_snow'] } = o;   /* houses·trees = 블렌더 모델 이름(읽어 두었으면 그것으로, 아니면 예전 상자) */
  const d = new THREE.Object3D(), col = new THREE.Color(), lam = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
  function inst(geo, mat, list) { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)); list.forEach((t, i) => { d.position.set(t[0], t[1], t[2]); d.rotation.set(0, t[6] || 0, 0); d.scale.set(t[3], t[4], t[5]); d.updateMatrix(); m.setMatrixAt(i, d.matrix); if (t[7] != null) m.setColorAt(i, col.set(t[7])); }); m.count = list.length; m.frustumCulled = false; scene.add(m); return m; }
  const ex = (z, side) => { const e = edge(clamp(z, z0, z1)); return side < 0 ? e[0] : e[1]; };
  /* 가까운 겹 */
  const dikes = [], poles = [], wires = [], carts = [], wheels = [], bundles = [], ice = [];
  for (let z = z0 - 48; z <= z1 + 48; z += 8) { if (skip(z)) continue;
    for (const side of [-1, 1]) { const e = ex(z, side);
      if (field(z)) { dikes.push([e + side * 17, 0.22, z, 26, 0.44, 0.7, 0]); for (const off of [9, 19]) dikes.push([e + side * off, 0.22, z + 4, 0.7, 0.44, 8, 0]); } } }
  let prev = null; const wy = ART.power_pole ? 5.95 : 5.4;
  for (let z = z0 - 48; z <= z1 + 48; z += 14) { if (skip(z)) { prev = null; continue; } const x = ex(z, -1) - 5; poles.push([x, 3, z, 1, 1, 1, 0]); if (prev) wires.push(prev[0] + 0.7, wy, prev[1], x + 0.7, wy, z, prev[0] - 0.4, wy, prev[1], x - 0.4, wy, z); prev = [x, z]; }
  for (let i = 0; i < 18; i++) { const z = z0 + rnd() * (z1 - z0); if (skip(z)) continue; const side = rnd() < 0.5 ? -1 : 1, x = ex(z, side) + side * (3 + rnd() * 11), a = rnd() * 6.28;
    if (i % 2) { carts.push([x, 0.75, z, 1, 1, 1, a]); for (const s of [-1, 1]) wheels.push([x + Math.cos(a) * 0.78 * s, 0.55, z - Math.sin(a) * 0.78 * s, 1, 1, 1, a]); }
    for (let k = 0; k < 2 + (i % 3); k++) bundles.push([x + rnd() * 2 - 1, 0.25, z + rnd() * 2 - 1, 0.5 + rnd() * 0.4, 0.5, 0.5 + rnd() * 0.3, rnd() * 3, [0x8a4a3a, 0x3a5a8a, 0xc8a050, 0x6a6a7a][k % 4]]); }
  for (let z = z0 - 48; z <= z1 + 48; z += 6) { if (skip(z)) continue; const w = Math.sin(z * 0.045) * 5, w2 = Math.sin((z + 6) * 0.045) * 5; ice.push([ex(z, 1) + 24 + (w + w2) / 2, 0.03, z + 3, 2.6, 0.06, 6.6, Math.atan2(w2 - w, 6)]); }
  inst(new THREE.BoxGeometry(1, 1, 1), lam(0xd2dbe8), dikes);
  if (ART.power_pole) artInst(scene, 'power_pole', poles.map((q) => [q[0], 0, q[2], 1, 0]), {}, { shadow: false });
  else { inst(new THREE.CylinderGeometry(0.12, 0.16, 6, 5), lam(0x4a3a2c), poles); inst(new THREE.BoxGeometry(1.6, 0.12, 0.12), lam(0x4a3a2c), poles.map((q) => [q[0] + 0.15, 5.4, q[2], 1, 1, 1, 0])); }
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(wires, 3)); scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x2a2a34 }))); }
  if (ART.cart) artInst(scene, 'cart', carts.map((q, i) => [q[0], i % 3 === 0 ? -0.25 : 0, q[2], 1, q[6]]), {}, { shadow: false });
  else { inst(new THREE.BoxGeometry(1.4, 0.5, 2.2), lam(0x7a5a3a), carts); const wg = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 8); wg.rotateZ(Math.PI / 2); inst(wg, lam(0x5a4028), wheels); }
  if (ART.bundle) for (const bc of [0x8a4a3a, 0x3a5a8a, 0xc8a050, 0x6a6a7a]) artInst(scene, 'bundle', bundles.filter((q) => q[7] === bc).map((q) => [q[0], 0, q[2], 0.7 + q[3] * 0.5, q[6]]), { cloth: bc }, { shadow: false });
  else inst(new THREE.BoxGeometry(1, 1, 1), lam(0xffffff), bundles);
  inst(new THREE.BoxGeometry(1, 1, 1), lam(0xa9c3dc), ice);
  /* 중간 겹 */
  const hills = [], walls = [], roofs = [], villages = [];
  for (let i = 0; i < 22; i++) { const z = z0 - 60 + rnd() * (z1 - z0 + 120), side = i % 2 ? 1 : -1, x = ex(z, side) + side * (45 + rnd() * 70); hills.push([x, -1, z, 18 + rnd() * 22, 4 + rnd() * 9, 18 + rnd() * 22, 0, [0xd8e0ec, 0xc8d2e2, 0xe2e8f2][i % 3]]); }
  for (let v = 0; v < 4; v++) { const z = z0 + 30 + v * (z1 - z0 - 60) / 3 + rnd() * 20, side = v % 2 ? 1 : -1; if (skip(z)) continue; const vx = ex(z, side) + side * (34 + rnd() * 14); villages.push([vx, z]);
    for (let k = 0; k < 4; k++) { const x = vx + (rnd() - 0.5) * 16, zz = z + (rnd() - 0.5) * 14, a = rnd() < 0.5 ? 0 : Math.PI / 2, tile = (v + k) % 3 === 0; walls.push([x, 1.2, zz, 5, 2.4, 3.6, a, tile ? 0xc8b8a0 : 0xa89070]); roofs.push([x, 3.2, zz, 4.1, 1.8, 3.2, a + Math.PI / 4, tile ? 0x4e586c : 0xe6ebf2]); } }
  inst(new THREE.SphereGeometry(1, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), lam(0xffffff), hills);
  if (ART[houses[0]]) houses.forEach((hn, k) => artInst(scene, hn, walls.filter((q, i) => i % houses.length === k).map((q) => [q[0], 0, q[2], 1, q[6]]), {}, { shadow: false }));
  else { inst(new THREE.BoxGeometry(1, 1, 1), lam(0xffffff), walls); inst(new THREE.ConeGeometry(1, 1, 4), lam(0xffffff), roofs); }
  /* 중간 겹 나무: 마을 둘레와 언덕 사이 */
  if (ART[trees[0]]) { const tl = trees.map(() => []); for (let i = 0; i < 70; i++) { const z = z0 - 50 + rnd() * (z1 - z0 + 100); if (skip(z)) continue; const side = rnd() < 0.5 ? -1 : 1, x = ex(z, side) + side * (24 + rnd() * rnd() * 80); tl[i % trees.length].push([x, 0, z, 0.9 + rnd() * 0.9, rnd() * 6.28]); } trees.forEach((tn, k) => artInst(scene, tn, tl[k], {}, { shadow: false })); }
  const smoke = [];
  if (villages.length) { const [vx, vz] = villages[0], tex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(120,124,140,.7)'); r.addColorStop(1, 'rgba(120,124,140,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
    for (let k = 0; k < 7; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); s.userData.k = k / 7; s.position.set(vx, 4, vz); scene.add(s); smoke.push(s); } }
  /* 멀리 다른 피란민 줄 — 작은 점들이 같은 쪽(-z)으로 천천히 */
  const walkers = [];
  if (!lite) for (const [side, off] of [[-1, 72], [1, 88]]) for (let i = 0; i < 46; i++) walkers.push({ side, off: off + (rnd() - 0.5) * 3, z: z0 - 40 + rnd() * (z1 - z0 + 80), v: 0.6 + rnd() * 0.35 });
  const wm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 1.5, 0.6), lam(0x343a4e), Math.max(1, walkers.length)); wm.count = walkers.length; wm.frustumCulled = false; scene.add(wm);
  /* 먼 겹: 하늘과 능선 — 카메라를 따라다닌다 */
  const far = new THREE.Group(); scene.add(far);
  const sg = new THREE.SphereGeometry(380, 32, 14), sp = sg.attributes.position, sc = new Float32Array(sp.count * 3); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
  const sky = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -2; far.add(sky);
  const cT = new THREE.Color(skyTop), cL = new THREE.Color(skyLow), cB = new THREE.Color(backC), cF = new THREE.Color(frontC), cc = new THREE.Color();
  function paintSky(k) { for (let i = 0; i < sp.count; i++) { const y = sp.getY(i) / 380, z = sp.getZ(i) / 380, t = clamp(y / 0.6, 0, 1); cc.copy(cL).lerp(cT, Math.pow(t, 0.7)); const back = Math.pow(Math.max(0, z), 1.6) * Math.pow(1 - clamp(y / 0.45, 0, 1), 1.4) * k; cc.lerp(cB, clamp(back, 0, 0.92)); const front = Math.pow(Math.max(0, -z), 4) * Math.pow(1 - clamp(y / 0.12, 0, 1), 2) * 0.35; cc.lerp(cF, front); sc[i * 3] = cc.r; sc[i * 3 + 1] = cc.g; sc[i * 3 + 2] = cc.b; } sg.attributes.color.needsUpdate = true; }
  paintSky(0.4);
  function ridge(r, hmin, hmax, c, seed) { const N = 96, hs = []; let h = (hmin + hmax) / 2; for (let i = 0; i < N; i++) { h = clamp(h + (Math.sin(i * 1.7 + seed) + (rnd() - 0.5) * 1.6) * (hmax - hmin) * 0.18, hmin, hmax); hs.push(h); }
    const pos = [], idx = []; for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI * 2, hh = hs[i % N]; pos.push(Math.cos(a) * r, -8, Math.sin(a) * r, Math.cos(a) * r, hh, Math.sin(a) * r); if (i < N) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, fog: false, depthWrite: false })); m.renderOrder = -1; far.add(m); return m; }
  const ridges = [ridge(352, 14, 46, ridgeC[1], 1), ridge(318, 6, 30, ridgeC[0], 4)];
  let tk = 0;
  function update(dt, cam) {
    tk += dt; far.position.set(cam.position.x, 0, cam.position.z);
    for (let i = 0; i < walkers.length; i++) { const w = walkers[i]; w.z -= w.v * dt; if (w.z < z0 - 50) w.z = z1 + 50; d.position.set(ex(w.z, w.side) + w.side * w.off, 0.75 + Math.abs(Math.sin(tk * 3 + i)) * 0.08, w.z); d.rotation.set(0, 0, 0); d.scale.set(1, 1, 1); d.updateMatrix(); wm.setMatrixAt(i, d.matrix); }
    if (walkers.length) wm.instanceMatrix.needsUpdate = true;
    for (const s of smoke) { const k = (s.userData.k + tk * 0.06) % 1; s.position.y = 4 + k * 22; s.position.x = villages[0][0] + k * k * 8; s.scale.setScalar(2 + k * 7); s.material.opacity = 0.75 * (1 - k); }
  }
  return { update, paintSky, far, ridges, sky, walkers };
}

/* ───── 돌림 고리: 30분의 1초 걸음, 시험용 고리(window.__scene)에서 쓴다 ───── */
export function runLoop(update, view, render) {
  let last = performance.now();
  function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); view(); render(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
}

/* ───── 미션(11-18 준호 「어떻게 뭘 하는지 · 미션이 있으면 좋겠다」) ─────
   지금 할 일 하나를 「미션 2/5」 로 크게: 무엇을(t) · 어떻게(how — 키, 터치면 다른 글) · 어디서(at → 빛기둥·꼬리표·화면 밖이면 가장자리 화살표).
   done() 이 참이 되면 「미션 완료!」 가 터지고 다음 미션으로. 뒤 미션을 먼저 해 두었으면 그 미션에 왔을 때 곧바로 지나간다.
   목표·흔적 줄(#todo)은 그대로 두고 카드 아래로 내린다. 놀이 규칙은 건드리지 않는다(S 를 읽기만 한다).
   list = [{ t: '굴림대를 돌 앞에', how: (touch) => touch ? '「들기」 누르기' : '<kbd>E</kbd> 들기', done: () => bool, at: () => [x, z] 또는 [x, y, z] 또는 null, n: () => [지금, 다] 또는 null, tag: '🪵 이것을 들어', tagY: 2.4 }] */
const MIS_CSS = `#mis{position:fixed;left:14px;top:60px;width:min(330px,calc(100vw - 28px));box-sizing:border-box;background:rgba(255,248,226,.96);color:#2a2410;border-radius:16px;padding:9px 14px 11px;box-shadow:0 4px 0 rgba(0,0,0,.28);pointer-events:none;border:3px solid #ffcf4d;transition:transform .25s}
#mis .mh{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:900;color:#a0700a;letter-spacing:.02em}
#mis .mh i{display:inline-block;width:9px;height:9px;border-radius:50%;background:#e6d9b0}#mis .mh i:first-of-type{margin-left:4px}#mis .mh i.ok{background:#3fb46a}#mis .mh i.now{background:#ffb020;box-shadow:0 0 0 3px rgba(255,176,32,.35)}
#mis .mt{font-size:19px;font-weight:900;margin:3px 0 2px;line-height:1.25}
#mis .mk{font-size:14px;font-weight:700;color:#5a4a20;line-height:1.4}
#mis .mk kbd{display:inline-block;background:#2a2410;color:#fff;border-radius:6px;padding:0 6px;font-family:inherit;font-size:13px;margin:0 1px;line-height:1.5}
#mis .mp{height:8px;border-radius:5px;background:#eadfbf;overflow:hidden;margin-top:6px;display:none}#mis .mp b{display:block;height:100%;width:0;background:#3fb46a;transition:width .3s}
#mis.bump{transform:scale(1.06)}#mis.all{border-color:#3fb46a;background:rgba(232,252,236,.96)}
.mtag{position:fixed;transform:translate(-50%,-100%);background:#ffcf4d;color:#3a2a00;font-weight:900;font-size:15px;border-radius:12px;padding:5px 10px;pointer-events:none;white-space:nowrap;box-shadow:0 3px 0 rgba(0,0,0,.3);display:none}
.mtag:after{content:'';position:absolute;left:50%;bottom:-7px;margin-left:-7px;border:7px solid transparent;border-bottom:0;border-top-color:#ffcf4d}
#marr{position:fixed;width:0;height:0;pointer-events:none;display:none}#marr b{position:absolute;left:-19px;top:-19px;width:38px;height:38px;border-radius:50%;background:#ffcf4d;box-shadow:0 3px 0 rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:22px;color:#3a2a00;font-weight:900}
#mpop{position:fixed;left:50%;top:30%;transform:translate(-50%,-50%) scale(.6);background:#3fb46a;color:#fff;font-weight:900;font-size:28px;border-radius:20px;padding:14px 28px;box-shadow:0 6px 0 #23824a;pointer-events:none;opacity:0;transition:all .3s cubic-bezier(.3,1.6,.5,1);text-align:center;white-space:nowrap}
#mpop small{display:block;font-size:16px;font-weight:800;opacity:.92;margin-top:3px}#mpop.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
@media (max-width:640px){#mis .mt{font-size:16px}#mis .mk{font-size:12.5px}#mpop{font-size:22px}}`;
export function missions(scene, cam, list, o = {}) {
  const isTouch = o.isTouch || (() => document.body.classList.contains('touch')), gy = o.groundY || (() => 0);
  if (!document.getElementById('misCss')) { const st = document.createElement('style'); st.id = 'misCss'; st.textContent = MIS_CSS; document.head.appendChild(st); }
  const mk = (tg, id, cls) => { const e = document.createElement(tg); if (id) e.id = id; if (cls) e.className = cls; document.body.appendChild(e); return e; };
  const card = mk('div', 'mis'), tag = mk('div', null, 'mtag'), arr = mk('div', 'marr'), pop = mk('div', 'mpop');
  card.innerHTML = '<div class="mh"></div><div class="mt"></div><div class="mk"></div><div class="mp"><b></b></div>'; arr.innerHTML = '<b>➜</b>';
  const [hEl, tEl, kEl, pEl] = card.children, todo = document.getElementById('todo');
  /* 빛기둥 + 땅 고리(더하기 섞기 — 밤 장면에서도 보인다) */
  const ptex = canvasTex(8, 128, (g) => { const r = g.createLinearGradient(0, 0, 0, 128); r.addColorStop(0, 'rgba(255,230,140,0)'); r.addColorStop(1, 'rgba(255,220,120,.9)'); g.fillStyle = r; g.fillRect(0, 0, 8, 128); });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 10, 16, 1, true), new THREE.MeshBasicMaterial({ map: ptex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.35, 32), new THREE.MeshBasicMaterial({ color: 0xffcf4d, transparent: true, opacity: 0.85, depthWrite: false })); ring.rotation.x = -Math.PI / 2;
  beam.visible = ring.visible = false; beam.renderOrder = ring.renderOrder = 5; scene.add(beam, ring);
  let idx = 0, t = 0, popT = 0, bumpT = 0, shownKey = '', lastTop = -1;
  const ok = list.map(() => false), v = new THREE.Vector3();
  const howOf = (m) => (typeof m.how === 'function' ? m.how(isTouch()) : m.how || '');
  function paint() {
    const all = idx >= list.length, m = list[Math.min(idx, list.length - 1)], n = !all && m.n ? m.n() : null, key = idx + '|' + (n ? n.join('/') : '') + '|' + isTouch() + '|' + (all ? '' : howOf(m));
    if (key !== shownKey) { shownKey = key;
      hEl.innerHTML = (all ? '미션 모두 끝!' : `미션 ${idx + 1}/${list.length}`) + list.map((_, i) => `<i class="${ok[i] ? 'ok' : i === idx ? 'now' : ''}"></i>`).join('');
      tEl.textContent = all ? (o.allText || '🎉 이제 목표까지 가 보자') : m.t + (n ? ` ${Math.min(n[0], n[1])}/${n[1]}` : '');
      kEl.innerHTML = all ? (o.allHow || '') : howOf(m); kEl.style.display = kEl.innerHTML ? '' : 'none';
      pEl.style.display = n ? 'block' : 'none'; if (n) pEl.firstElementChild.style.width = clamp(n[0] / n[1], 0, 1) * 100 + '%';
      card.classList.toggle('all', all); }
    if (todo) { const top = card.style.display === 'none' ? 60 : card.offsetTop + card.offsetHeight + 8; if (top !== lastTop) { lastTop = top; todo.style.top = top + 'px'; } }
  }
  function finish(i) { ok[i] = true; pop.innerHTML = `✅ 미션 완료!<small>${list[i].t}</small>`; pop.classList.add('on'); popT = 1.8; bumpT = 0.25; card.classList.add('bump');
    if (o.sound !== false) { tone(660, 660, 0.12, 'triangle', 0.12); tone(880, 880, 0.12, 'triangle', 0.12, 0.11); tone(1320, 1320, 0.22, 'triangle', 0.1, 0.22); } }
  function update(dt, active = true) {
    t += dt;
    card.style.display = active || popT > 0 ? '' : 'none';
    if (active) while (idx < list.length && list[idx].done()) { finish(idx); idx++; }
    paint();
    if (popT > 0) { popT -= dt; if (popT <= 0) pop.classList.remove('on'); }
    if (bumpT > 0) { bumpT -= dt; if (bumpT <= 0) card.classList.remove('bump'); }
    const m = list[idx], p = active && m && m.at ? m.at() : null;
    beam.visible = ring.visible = !!p; tag.style.display = 'none'; arr.style.display = 'none';
    if (!p) return;
    const x = p[0], z = p.length === 3 ? p[2] : p[1], y = p.length === 3 ? p[1] : gy(x, z), pulse = 0.5 + 0.5 * Math.sin(t * 4);
    beam.position.set(x, y + 5, z); beam.material.opacity = 0.5 + pulse * 0.35; ring.position.set(x, y + 0.08, z); ring.scale.setScalar(0.9 + pulse * 0.3);
    const q = v.set(x, y + (m.tagY || 2.4), z).project(cam), off = q.z > 1 || Math.abs(q.x) > 0.95 || Math.abs(q.y) > 0.9;
    const tg = typeof m.tag === 'function' ? m.tag() : m.tag; if (!off) { if (tg !== '') { tag.textContent = tg || '여기!'; tag.style.display = 'block'; tag.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; tag.style.top = clamp(((1 - q.y) / 2) * innerHeight, 150, innerHeight - 20) + 'px'; } }
    else { const gx = q.z > 1 ? -q.x : q.x, gyy = q.z > 1 ? -Math.abs(q.y) - 0.5 : q.y, k = 0.86 / Math.max(Math.abs(gx), Math.abs(gyy), 0.001); arr.style.display = 'block'; arr.style.left = ((gx * k + 1) / 2) * innerWidth + 'px'; arr.style.top = ((1 - gyy * k) / 2) * innerHeight + 'px'; arr.firstElementChild.style.transform = `rotate(${Math.atan2(-gyy, gx)}rad)`; }
  }
  function reset() { idx = 0; ok.fill(false); shownKey = ''; popT = 0; pop.classList.remove('on'); }
  return { update, reset, get idx() { return idx; }, get count() { return list.length; }, get all() { return idx >= list.length; }, ok, card };
}
