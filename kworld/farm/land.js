/* 「다섯 해」 땅과 물(준호 11-23 「배경도 실감 나게」) — 「납작한 판」을 없앤다.
   · 땅: 한 장의 굴곡 있는 지형(놀이 넓이 안은 평평 — 사람·집이 서는 자리, 밖은 언덕이 솟아 산으로). 개울·강 자리는 파여 둑이 생긴다.
   · 땅 무늬: 캔버스 한 장에 풀밭 얼룩·흙길(가장자리 흐림·바퀴 자국·가운데 풀)·마당·개울가 자갈·강가 모래를 칠하고, 고운 무늬(groundTex)를 겹친다.
     겨울은 눈 덮인 무늬로 바꾼다. 철마다 땅빛(material.color)은 farm.js 가 곱한다.
   · 물: 흐르는 물결·하늘이 비치는 물빛(내려다보는 각이 낮을수록 하늘빛)·물가는 옅게 — 한 셰이더로 개울·강·물길·논물을 그린다.
   · 논두렁: 둥근 흙 둔덕(위는 풀) — 논마다 상자 넷이던 것을 한 덩이로(그리기 한 번).
   좌표: x 동쪽, z 남쪽. 놀이 넓이 380×240. */
import * as THREE from 'three';
import { groundTex } from '../scene/kit.js?v=5';

const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
export const fbm = (x, z) => vnoise(x, z) * 0.55 + vnoise(x * 2.1 + 5.3, z * 2.1 + 1.7) * 0.3 + vnoise(x * 4.3 + 9.1, z * 4.3 + 3.3) * 0.15;
function segDist(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz; let t = l2 ? ((px - ax) * dx + (pz - az) * dz) / l2 : 0; t = Math.max(0, Math.min(1, t)); return [Math.hypot(px - ax - dx * t, pz - az - dz * t), t]; }
export function lineDist(px, pz, pts) { let best = 1e9, along = 0, acc = 0; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), [d, t] = segDist(px, pz, a[0], a[1], b[0], b[1]); if (d < best) { best = d; along = acc + t * L; } acc += L; } return [best, along]; }

/* 개울: 북동쪽 산골에서 나와 서쪽으로 흐르다 마을 위에서 북서쪽 골짜기로 — 놀이 넓이 안(86~244)은 예전 그 자리(z 43~50) */
export const STREAM = [[352, -40], [318, -6], [282, 24], [256, 42], [244, 46.5], [86, 46.5], [70, 40], [52, 24], [30, 4], [4, -26]];
const RIVER_Z0 = 211, RIVER_Z1 = 282;
const FLAT = [[256, 80, 299, 116], [226, 108, 276, 152], [204, 42, 248, 72], [326, 100, 374, 158], [244, 196, 280, 212], [6, 30, 296, 211], [290, 124, 386, 133]];
export function hAt(x, z) {
  let h = 0;
  /* 놀이 넓이 밖: 멀어질수록 언덕이 솟는다(북·서·동) · 강 건너(남) */
  const ox = Math.max(-6 - x, x - 386, 0), oz = Math.max(18 - z, 0), out = Math.hypot(ox, oz);
  if (out > 0) h += (1 - Math.exp(-out / 38)) * (10 + 22 * fbm(x * 0.011 + 3, z * 0.011)) + Math.min(out, 30) * 0.04 * fbm(x * 0.06, z * 0.06) * 6;
  if (z > RIVER_Z1 + 6) h += (1 - Math.exp(-(z - RIVER_Z1 - 6) / 34)) * (9 + 14 * fbm(x * 0.013, z * 0.013 + 7));
  /* 고개(이웃 고을 가는 길) 양쪽 언덕 — 예전 공 둘 자리 */
  const g = (cx, cz, rx, rz, hh) => hh * Math.exp(-(((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2));
  h += g(312, 80, 13, 28, 15) + g(312, 178, 13, 28, 14) + g(326, 56, 15, 18, 9) + g(322, 200, 14, 16, 8);
  h *= 1 - 0.85 * Math.exp(-(((z - 128.5) / 6.5) ** 2)) * ss(270, 290, x);   /* 고갯길은 낮게 */
  /* 사람 사는 자리(관아·읍내·양반댁·이웃 고을·포구)는 평평하게 — 가장자리 8칸에 걸쳐 언덕이 내려앉는다 */
  if (h > 0) { let m = 0; for (const r of FLAT) { const dx = Math.max(r[0] - x, x - r[2], 0), dz = Math.max(r[1] - z, z - r[3], 0); m = Math.max(m, 1 - ss(0, 9, Math.hypot(dx, dz))); } h *= 1 - m; }
  /* 개울 · 강 바닥 */
  const [sd] = lineDist(x, z, STREAM); if (sd < 6) h = Math.min(h, 0) - 0.62 * ss(4.6, 2.4, sd);
  if (z > RIVER_Z0 - 1) h = Math.min(h, 0) - 1.3 * ss(RIVER_Z0 - 1, RIVER_Z0 + 5, z) * (1 - ss(RIVER_Z1 - 4, RIVER_Z1 + 4, z));
  return h;
}

/* ───── 물 셰이더: 흐름(u 방향) · 물가(v 가 0·1 쪽) 옅게 · 하늘빛 비침 · 반짝임 ───── */
export function waterMat({ deep = 0x2e6a86, shallow = 0x7ab8c4, sky = 0xcfe2f0, flow = 1, scale = 1, alpha = 1, still = false } = {}) {
  const u = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uDeep: { value: new THREE.Color(deep) }, uShallow: { value: new THREE.Color(shallow) }, uSky: { value: new THREE.Color(sky) }, uFlow: { value: flow }, uScale: { value: scale }, uAlpha: { value: alpha }, uSun: { value: new THREE.Vector3(-0.5, 0.8, 0.4).normalize() } }]);
  return new THREE.ShaderMaterial({ uniforms: u, fog: true, transparent: alpha < 1, depthWrite: alpha >= 1,
    vertexShader: `varying vec2 vUv; varying vec3 vW;
#include <fog_pars_vertex>
      void main(){ vUv = uv; vec4 p = vec4(position,1.0);
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
        #endif
        vec4 w = modelMatrix * p; vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
#include <fog_vertex>
}`,
    fragmentShader: `uniform float uT, uFlow, uScale, uAlpha; uniform vec3 uDeep, uShallow, uSky, uSun; varying vec2 vUv; varying vec3 vW;
#include <fog_pars_fragment>
      float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y); }
      void main(){
        vec2 q = vec2(vUv.x * uScale, vUv.y);
        float t = uT * uFlow;
        ${still ? 'vec2 fl = vW.xz * 0.35 + vec2(t*0.05, t*0.03);' : 'vec2 fl = vec2(q.x*0.9 - t*1.2, q.y*3.0);'}
        float r = n2(fl*1.3) * 0.6 + n2(fl*3.1 + 7.0) * 0.4;
        float edge = ${still ? '0.0' : 'smoothstep(0.32, 0.0, min(vUv.y, 1.0 - vUv.y))'};
        vec3 base = mix(uDeep, uShallow, clamp(edge * 0.9 + r * 0.18, 0.0, 1.0));
        vec3 V = normalize(cameraPosition - vW);
        vec3 N = normalize(vec3((n2(fl*2.0)-0.5)*0.35, 1.0, (n2(fl*2.0+3.7)-0.5)*0.35));
        float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
        vec3 col = mix(base, uSky, clamp(${still ? '0.42' : '0.18'} + fres * 0.85, 0.0, ${still ? '0.82' : '0.9'}));
        ${still ? 'col *= 0.94 + 0.16 * n2(vW.xz * 0.045 + vec2(uT * 0.01, 0.0));' : ''}
        float lines = ${still ? '0.0' : 'smoothstep(0.78, 0.96, n2(vec2(q.x*1.6 - t*2.2, q.y*9.0 + sin(q.x*0.7)*2.0)))'};
        col += vec3(0.85, 0.92, 1.0) * lines * 0.22;
        vec3 H = normalize(uSun + V); float sp = pow(max(dot(N, H), 0.0), 90.0);
        col += vec3(1.0, 0.96, 0.85) * sp * 0.9;
        col = mix(col, vec3(0.92, 0.95, 0.94), edge * edge * ${still ? '0.0' : '0.45'} * (0.6 + 0.4 * n2(fl*4.0)));
        gl_FragColor = vec4(col, uAlpha);
#include <fog_fragment>
      }` });
}
/* 띠 물(개울·물길): pts 를 따라 너비 w 의 띠 — uv.x = 흐른 거리, uv.y = 0~1(가로) */
export function ribbon(pts, w, y, mat, step = 2) {
  const P = [], UV = [], I = []; let acc = 0, n = 0;
  const dense = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / step)); for (let j = 0; j < k; j++) dense.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]); } dense.push(pts[pts.length - 1]);
  for (let i = 0; i < dense.length; i++) { const p = dense[i], q = dense[Math.min(dense.length - 1, i + 1)], o = dense[Math.max(0, i - 1)], dx = q[0] - o[0], dz = q[1] - o[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
    if (i) acc += Math.hypot(p[0] - dense[i - 1][0], p[1] - dense[i - 1][1]);
    const ww = typeof w === 'function' ? w(p[0], p[1]) : w;
    P.push(p[0] + nx * ww / 2, y, p[1] + nz * ww / 2, p[0] - nx * ww / 2, y, p[1] - nz * ww / 2); UV.push(acc / 4, 0, acc / 4, 1);
    if (i) { const b = (i - 1) * 2; I.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); } n++; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(I); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = false; return m;
}

/* ───── 땅 ───── */
export function makeLand(scene, { roads = [], yards = [], plotsRects = [], fields = [] } = {}) {
  /* 무늬 캔버스: x -40~420, z 0~250 */
  const TX0 = -40, TZ0 = 0, TW = 460, TH = 250, PX = 3.2, CW = Math.round(TW * PX), CH = Math.round(TH * PX);
  const cx = (x) => (x - TX0) * PX, cz = (z) => (z - TZ0) * PX;
  function paint(winter) {
    const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const g = cv.getContext('2d', { willReadFrequently: true });   /* CPU 캔버스: 작은 점 수천 개를 바로 칠한다 */ let s = 9;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const C = winter ? { grass: '#e8ecee', g1: 'rgba(205,214,222,.55)', g2: 'rgba(255,255,255,.6)', g3: 'rgba(190,198,204,.4)', dirt: '#cfc6b4', rut: 'rgba(130,112,86,.55)', yard: '#dcd6c8', bank: '#c8c2b4', sand: '#e2ddd0', tuft: 'rgba(150,160,150,.5)' }
      : { grass: '#86b552', g1: 'rgba(70,120,40,.35)', g2: 'rgba(180,200,90,.30)', g3: 'rgba(200,180,90,.28)', dirt: '#c9ab76', rut: 'rgba(120,92,56,.55)', yard: '#c8b083', bank: '#9c9070', sand: '#dccb98', tuft: 'rgba(60,110,40,.55)' };
    g.fillStyle = C.grass; g.fillRect(0, 0, CW, CH);
    /* 흐린 겹: 날카롭게 그린 뒤 한 장을 한 번만 흐려 얹는다(점마다 흐림을 걸면 아주 느리다) */
    const lay = document.createElement('canvas'); lay.width = CW; lay.height = CH; const lg = lay.getContext('2d', { willReadFrequently: true }), sm = document.createElement('canvas'), sg = sm.getContext('2d', { willReadFrequently: true });
    const blurLayer = (px, fn) => { lg.clearRect(0, 0, CW, CH); fn(lg); const k = Math.max(2, px * 1.6); sm.width = Math.ceil(CW / k); sm.height = Math.ceil(CH / k); sg.imageSmoothingQuality = 'high'; sg.drawImage(lay, 0, 0, sm.width, sm.height); g.imageSmoothingQuality = 'high'; g.drawImage(sm, 0, 0, CW, CH); };   /* 줄였다 늘려서 흐림(캔버스 filter 는 느린 기기에서 아주 느리다) */
    /* 풀밭 얼룩: 짙은 풀 · 연둣빛 · 마른 풀 */
    for (let i = 0; i < 520; i++) { const x = rnd() * CW, y = rnd() * CH, r = (8 + rnd() * 40) * PX; const gr = g.createRadialGradient(x, y, 0, x, y, r); const c = [C.g1, C.g2, C.g3][i % 3]; gr.addColorStop(0, c); gr.addColorStop(1, c.replace(/[\d.]+\)$/, '0)')); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
    for (let i = 0; i < 14000; i++) { g.fillStyle = rnd() < 0.5 ? (winter ? 'rgba(170,180,186,.25)' : 'rgba(50,90,30,.22)') : (winter ? 'rgba(255,255,255,.5)' : 'rgba(200,220,120,.18)'); g.fillRect(rnd() * CW, rnd() * CH, 1 + rnd() * 2, 1 + rnd() * 2); }
    /* 개울가 자갈·진흙 · 강가 모래 */
    const strokeLine = (pts, w, style, blur = 0) => blurLayer(blur, (q) => { q.strokeStyle = style; q.lineWidth = w * PX; q.lineCap = 'round'; q.lineJoin = 'round'; q.beginPath(); pts.forEach((p, i) => (i ? q.lineTo(cx(p[0]), cz(p[1])) : q.moveTo(cx(p[0]), cz(p[1])))); q.stroke(); });
    strokeLine(STREAM, 14, C.bank, 6); strokeLine(STREAM, 11, winter ? '#b8b4aa' : '#8a8064', 3);
    for (let i = 0; i < 2600; i++) { const t = rnd(), k = Math.floor(t * (STREAM.length - 1)), f = t * (STREAM.length - 1) - k, a = STREAM[k], b = STREAM[k + 1], px = a[0] + (b[0] - a[0]) * f, pz = a[1] + (b[1] - a[1]) * f, off = (rnd() - 0.5) * 12; const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); g.fillStyle = ['#b8b0a0', '#8f887a', '#d2ccbe', '#6f6a60'][i % 4]; const r = (0.12 + rnd() * 0.3) * PX; g.beginPath(); g.ellipse(cx(px - dz / l * off), cz(pz + dx / l * off), r, r * 0.7, rnd() * 3, 0, 6.3); g.fill(); }
    { blurLayer(5, (q) => { q.fillStyle = C.sand; q.fillRect(0, cz(RIVER_Z0 - 4), CW, (RIVER_Z1 - RIVER_Z0 + 8) * PX); }); for (let i = 0; i < 2500; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(150,130,90,.25)' : 'rgba(255,250,230,.35)'; g.fillRect(rnd() * CW, cz(RIVER_Z0 - 4 + rnd() * 9), 1 + rnd() * 2, 1 + rnd() * 2); } }
    /* 마당(가장자리 흐림 + 다져진 흙 얼룩) */
    blurLayer(4, (q) => { for (const [x0, z0, x1, z1, c] of yards) { q.fillStyle = c && !winter ? '#' + c.toString(16).padStart(6, '0') : C.yard; const pad = 0.6; q.beginPath(); q.roundRect(cx(x0 - pad), cz(z0 - pad), (x1 - x0 + pad * 2) * PX, (z1 - z0 + pad * 2) * PX, 3 * PX); q.fill(); } });
    for (const [x0, z0, x1, z1] of yards) {
      for (let i = 0; i < (x1 - x0) * (z1 - z0) * 0.9; i++) { const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0), r = (0.3 + rnd() * 1.4) * PX; g.fillStyle = rnd() < 0.5 ? 'rgba(120,96,60,.12)' : 'rgba(255,240,210,.14)'; g.beginPath(); g.arc(cx(x), cz(z), r, 0, 6.3); g.fill(); } }
    /* 흙길: 너울대는 가장자리 · 바퀴 자국 둘 · 넓은 길은 가운데 풀 줄 · 길가 풀 포기 */
    for (const [x0, z0, x1, z1] of roads) { const along = x1 - x0 >= z1 - z0, w = along ? z1 - z0 : x1 - x0, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, L = along ? x1 - x0 : z1 - z0;
      const at = (t, off) => (along ? [x0 + t * L, mz + off] : [mx + off, z0 + t * L]);
      const n = Math.ceil(L * 1.5); blurLayer(3, (q) => { q.fillStyle = C.dirt; for (let i = 0; i <= n; i++) { const t = i / n, [px, pz] = at(t, (vn(t * L * 0.08) - 0.5) * w * 0.25), r = (w / 2 + 0.5 + (vn(t * L * 0.21 + 3) - 0.5) * 1.6) * PX; q.beginPath(); q.arc(cx(px), cz(pz), r, 0, 6.3); q.fill(); } });
      for (let i = 0; i < L * w * 1.2; i++) { const [px, pz] = at(rnd(), (rnd() - 0.5) * w); g.fillStyle = rnd() < 0.5 ? 'rgba(110,84,50,.16)' : 'rgba(250,236,200,.2)'; g.fillRect(cx(px), cz(pz), (0.3 + rnd() * 0.6) * PX, (0.3 + rnd() * 0.6) * PX); }
      if (w >= 3.5) for (const off of [-w * 0.24, w * 0.24]) { g.save(); g.strokeStyle = C.rut; g.lineWidth = 0.42 * PX; g.beginPath(); for (let i = 0; i <= n; i++) { const t = i / n, [px, pz] = at(t, off + (vn(t * L * 0.05 + off) - 0.5) * 0.5); i ? g.lineTo(cx(px), cz(pz)) : g.moveTo(cx(px), cz(pz)); } g.stroke(); g.restore(); }
      if (w >= 4) blurLayer(1.5, (q) => { for (let i = 0; i < L * 2.2; i++) { const t = rnd(), k = vn(t * L * 0.15 + 11); if (k < 0.42) continue; const [px, pz] = at(t, (rnd() - 0.5) * 0.5); q.fillStyle = winter ? 'rgba(240,244,246,.5)' : `rgba(100,145,64,${(0.18 + (k - 0.42) * 0.9).toFixed(2)})`; q.beginPath(); q.ellipse(cx(px), cz(pz), (0.3 + rnd() * 0.5) * PX, (0.2 + rnd() * 0.3) * PX, rnd() * 3, 0, 6.3); q.fill(); } });
      for (let i = 0; i < L * 1.6; i++) { const side = rnd() < 0.5 ? -1 : 1, [px, pz] = at(rnd(), side * (w / 2 + 0.3 + rnd() * 0.8)); g.fillStyle = C.tuft; g.beginPath(); g.arc(cx(px), cz(pz), (0.25 + rnd() * 0.45) * PX, 0, 6.3); g.fill(); } }
    /* 논·밭 아래: 진흙(논두렁 둔덕이 덮는다) */
    blurLayer(2, (q) => { q.fillStyle = winter ? '#d0ccc0' : '#8a7448'; for (const [x0, z0, x1, z1] of plotsRects) q.fillRect(cx(x0 - 0.8), cz(z0 - 0.8), (x1 - x0 + 1.6) * PX, (z1 - z0 + 1.6) * PX); });
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
    function vn(x) { return vnoise(x, 0.5); }
  }
  const _t0 = performance.now(), texSummer = paint(false), _t1 = performance.now(); let texWinter = null;   /* 겨울 무늬는 겨울이 올 때 칠한다 */
  /* 격자: 놀이 넓이 안은 촘촘(개울·강가는 더) · 밖은 성기게 */
  const xs = [], zs = [];
  for (let x = -260; x < -40; x += 12) xs.push(x); for (let x = -40; x < 420; x += 4) xs.push(x); for (let x = 420; x <= 640; x += 12) xs.push(x);
  for (let z = -240; z < 0; z += 12) zs.push(z); for (let z = 0; z < 250; z += (z > 30 && z < 62) || (z > 200 && z < 226) ? 1.5 : 4) zs.push(z); for (let z = 250; z <= 460; z += 10) zs.push(z);
  const NX = xs.length, NZ = zs.length, P = new Float32Array(NX * NZ * 3), UV = new Float32Array(NX * NZ * 2), UD = new Float32Array(NX * NZ * 2), CO = new Float32Array(NX * NZ * 3), I = [];
  const cc = new THREE.Color();
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const k = j * NX + i, x = xs[i], z = zs[j], h = hAt(x, z); P[k * 3] = x; P[k * 3 + 1] = h; P[k * 3 + 2] = z; UV[k * 2] = (x - TX0) / TW; UV[k * 2 + 1] = 1 - (z - TZ0) / TH; UD[k * 2] = x / 14; UD[k * 2 + 1] = z / 14;
    /* 언덕 높이에 따라 빛깔: 낮은 들은 무늬 그대로, 높은 산비탈은 짙은 숲빛·바위빛 */
    const hh = Math.max(0, h), f = fbm(x * 0.05, z * 0.05); cc.setRGB(1, 1, 1); if (hh > 1.5) { const k2 = ss(1.5, 14, hh); cc.lerp(new THREE.Color(0.62 + f * 0.1, 0.78 + f * 0.08, 0.6), k2); if (hh > 16) cc.lerp(new THREE.Color(0.8, 0.8, 0.74), ss(16, 30, hh) * 0.6 * f); }
    if (h < -0.05) cc.multiplyScalar(1 - Math.min(0.35, -h * 0.4)); CO[k * 3] = cc.r; CO[k * 3 + 1] = cc.g; CO[k * 3 + 2] = cc.b; }
  for (let j = 0; j < NZ - 1; j++) for (let i = 0; i < NX - 1; i++) { const a = j * NX + i, b = a + 1, c = a + NX, d = c + 1; I.push(a, c, b, b, c, d); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(UV, 2)); geo.setAttribute('uvd', new THREE.BufferAttribute(UD, 2)); geo.setAttribute('color', new THREE.BufferAttribute(CO, 3)); geo.setIndex(I); geo.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({ map: texSummer, vertexColors: true });
  mat.onBeforeCompile = (sh) => { sh.uniforms.detailMap = { value: groundTex() };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 uvd; varying vec2 vUvd;').replace('#include <uv_vertex>', '#include <uv_vertex>\nvUvd = uvd;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D detailMap; varying vec2 vUvd;').replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= texture2D(detailMap, vUvd).rgb * 1.08 * (0.94 + 0.12 * texture2D(detailMap, vUvd * 0.13).r);'); };
  const ground = new THREE.Mesh(geo, mat); ground.receiveShadow = true; scene.add(ground);
  window.__landMs = [Math.round(_t1 - _t0), Math.round(performance.now() - _t1)];   /* 무늬 칠하기 · 지형 만들기 걸린 시간(재기용) */
  /* 먼 바닥(지형 밖) — 안개 속으로 */
  const far = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshBasicMaterial({ color: 0x8aa874 })); far.rotation.x = -Math.PI / 2; far.position.set(190, -6, 120); scene.add(far);

  /* 물 */
  const waters = [];
  const wStream = waterMat({ flow: 1, scale: 1 }); waters.push(wStream);
  const stream = ribbon(STREAM, (x, z) => (x > 84 && x < 246 ? 7.6 : 6.2 + Math.sin(x * 0.1) * 0.6), -0.16, wStream, 2); scene.add(stream);
  const wRiver = waterMat({ deep: 0x2a5f7e, shallow: 0x6aa8bc, flow: 0.35, scale: 1 }); waters.push(wRiver);
  const river = ribbon([[-300, (RIVER_Z0 + RIVER_Z1) / 2 + 2], [700, (RIVER_Z0 + RIVER_Z1) / 2 + 2]], RIVER_Z1 - RIVER_Z0 + 2, -0.22, wRiver, 20); scene.add(river);
  const wCanal = waterMat({ deep: 0x3a7a8e, shallow: 0x84c0c8, flow: 1.6, scale: 2 }); waters.push(wCanal);
  const wPaddy = waterMat({ deep: 0x5a7270, shallow: 0x7a948e, sky: 0xd4e6f2, still: true, alpha: 0.84 }); waters.push(wPaddy);
  function update(t, skyCol) { for (const w of waters) { w.uniforms.uT.value = t; if (skyCol) w.uniforms.uSky.value.copy(skyCol); } }
  function setSeason(sn) { if (sn === 3 && !texWinter) texWinter = paint(true); mat.map = sn === 3 ? texWinter : texSummer; mat.needsUpdate = true; }
  return { hAt, ground, mat, update, setSeason, waters, wCanal, wPaddy, stream, river, ribbon: (pts, w, y, m) => { const r = ribbon(pts, w, y, m || wCanal); scene.add(r); return r; } };
}

/* 논두렁: 둥근 흙 둔덕(위는 풀빛) — 사각형마다 네 변, 한 덩이로. rects = [[x0, z0, x1, z1], …] */
export function dikes(scene, rects, { w = 1.1, h = 0.4 } = {}) {
  const prof = [[-0.5, 0], [-0.4, 0.5], [-0.28, 0.9], [-0.1, 1], [0.1, 1], [0.28, 0.9], [0.4, 0.5], [0.5, 0]];
  const P = [], C = [], I = []; let base = 0; const earth = new THREE.Color(0x9a7c52), top = new THREE.Color(0x8a9c56), cc = new THREE.Color();
  for (const [x0, z0, x1, z1] of rects) for (const [ax, az, bx, bz] of [[x0 - w / 2, z0, x1 + w / 2, z0], [x0 - w / 2, z1, x1 + w / 2, z1], [x0, z0 + w / 2, x0, z1 - w / 2], [x1, z0 + w / 2, x1, z1 - w / 2]]) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.ceil(L / 3)), dx = (bx - ax) / L, dz = (bz - az) / L, nx = -dz, nz = dx;
    for (let i = 0; i <= n; i++) { const t = i / n, px = ax + (bx - ax) * t, pz = az + (bz - az) * t, wob = Math.sin(px * 0.9 + pz * 1.3) * 0.08, hh = h * (0.9 + 0.2 * hash(Math.round(px), Math.round(pz)));
      for (const [u, v] of prof) { P.push(px + nx * u * w * (1 + wob), v * hh, pz + nz * u * w * (1 + wob)); cc.copy(earth).lerp(top, ss(0.6, 0.95, v) * (0.55 + 0.45 * hash(Math.round(px * 1.7), Math.round(pz * 1.7) + u))); const j = 0.88 + 0.24 * hash(px * 3 + u, pz * 3); C.push(cc.r * j, cc.g * j, cc.b * j); } }
    for (let i = 0; i < n; i++) for (let k = 0; k < prof.length - 1; k++) { const a = base + i * prof.length + k, b = a + 1, c = a + prof.length, d = c + 1; I.push(a, b, c, b, d, c); }
    base += (n + 1) * prof.length; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeVertexNormals();
  const col0 = Float32Array.from(C), mat = new THREE.MeshLambertMaterial({ vertexColors: true }); const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.castShadow = true; scene.add(m);
  /* 겨울엔 위가 눈 */
  m.userData.snow = (on) => { const ca = g.attributes.color; for (let i = 0; i < ca.count; i++) { const y = P[i * 3 + 1] / h; const k = on ? ss(0.35, 0.8, y) : 0; ca.setXYZ(i, col0[i * 3] + (0.93 - col0[i * 3]) * k, col0[i * 3 + 1] + (0.95 - col0[i * 3 + 1]) * k, col0[i * 3 + 2] + (0.97 - col0[i * 3 + 2]) * k); } ca.needsUpdate = true; };
  return m;
}
