/* 「다섯 해」 빛과 공기(준호 11-23 「배경도 실감 나게」).
   · 굴뚝 연기: 집집이 낮은 굴뚝에서 피어오른다 — 아침·저녁(밥 짓는 때)과 겨울(군불)에 짙다. 점 하나에 크기·투명도를 따로(그리기 한 번).
   · 철 공기: 가을 낙엽(빙글 흔들리며 떨어짐) · 여름 아지랑이(땅에서 피어오르는 옅은 빛 알갱이 + 따뜻한 안개 — 화면을 일그러뜨리는 진짜 아지랑이는 크롬북에 무거워 대신)
     · 봄 꽃가루·나비 같은 하얀 점. 겨울 눈은 farm.js 의 눈발(wx)을 그대로 쓴다.
   · 해: 철 안에서 해가 동쪽에서 떠 남쪽 하늘을 지나 서쪽으로 — 아침은 분홍빛, 한낮 흰빛, 저녁은 주황빛·긴 그림자. */
import * as THREE from 'three';

const soft = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.5, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
const leafTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(16, 16, 13, 7, 0.6, 0, 6.3); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(6, 22); g.lineTo(26, 10); g.stroke(); return new THREE.CanvasTexture(c); })();

/* 점마다 크기·투명도·색 */
function puffMat(additive = false) {
  return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTex: { value: soft }, uScale: { value: 300 } }]),
    vertexShader: `attribute float aSize; attribute float aAlpha; attribute vec3 aCol; varying float vA; varying vec3 vC;
#include <fog_pars_vertex>
void main(){ vA = aAlpha; vC = aCol; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_PointSize = min(64.0, aSize * uScale / max(1.0, -mvPosition.z)); gl_Position = projectionMatrix * mvPosition;
#include <fog_vertex>
}`.replace('void main', 'uniform float uScale;\nvoid main'),
    fragmentShader: `uniform sampler2D uTex; varying float vA; varying vec3 vC;
#include <fog_pars_fragment>
void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(vC, t.a * vA); if (gl_FragColor.a < 0.01) discard;
#include <fog_fragment>
}` });
}
function pointsOf(n, mat) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(n), 1)); g.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(n), 1)); g.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3)); const p = new THREE.Points(g, mat); p.frustumCulled = false; return p; }

export function airKit(scene) {
  /* ── 굴뚝 연기 ── */
  const SRC = [], PER = 9; let smoke = null;
  function chimneys(list) { for (const q of list) SRC.push({ x: q[0], y: q[1], z: q[2], s: q[3] || 1, ph: Math.random() * 10 }); smoke = pointsOf(SRC.length * PER, puffMat()); scene.add(smoke); }
  /* ── 철 알갱이(낙엽·아지랑이·꽃가루) — 나를 따라다니는 상자 안에서 ── */
  const NL = 260, leaves = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ map: leafTex, vertexColors: true, size: 0.95, transparent: true, alphaTest: 0.3, depthWrite: false }));
  { const P = new Float32Array(NL * 3), C = new Float32Array(NL * 3), cs = [0xd8642a, 0xe8a03a, 0xc8482a, 0xd8b84a, 0xa86a2a].map((h) => new THREE.Color(h)); for (let i = 0; i < NL; i++) { P[i * 3] = Math.random() * 54 - 27; P[i * 3 + 1] = Math.random() * 16; P[i * 3 + 2] = Math.random() * 54 - 27; const c = cs[i % cs.length]; C[i * 3] = c.r; C[i * 3 + 1] = c.g; C[i * 3 + 2] = c.b; }
    leaves.geometry.setAttribute('position', new THREE.BufferAttribute(P, 3)); leaves.geometry.setAttribute('color', new THREE.BufferAttribute(C, 3)); leaves.frustumCulled = false; leaves.visible = false; scene.add(leaves); }
  const NM = 220, motes = pointsOf(NM, puffMat(true)); motes.visible = false; scene.add(motes);
  { const P = motes.geometry.attributes.position.array; for (let i = 0; i < NM; i++) { P[i * 3] = Math.random() * 80 - 40; P[i * 3 + 1] = Math.random() * 3; P[i * 3 + 2] = Math.random() * 80 - 40; } }
  let season = 0;
  function setSeason(sn) { season = sn; leaves.visible = sn === 2; motes.visible = sn === 0 || sn === 1; const C = motes.geometry.attributes.aCol; for (let i = 0; i < NM; i++) { if (sn === 1) C.setXYZ(i, 1.0, 0.92, 0.7); else C.setXYZ(i, 1, 1, 0.95); } C.needsUpdate = true; }

  /* day = 0(아침) ~ 1(저녁) · px, pz = 나 · wind = 바람(연기·낙엽이 쏠리는 쪽) */
  function update(dt, t, day, px, pz) {
    const cook = 0.35 + 0.65 * (1 - Math.sin(Math.PI * day)) + (season === 3 ? 0.5 : 0), wx = 0.9, wz = -0.35;
    if (smoke) { const P = smoke.geometry.attributes.position, A = smoke.geometry.attributes.aAlpha, Z = smoke.geometry.attributes.aSize, C = smoke.geometry.attributes.aCol;
      for (let s = 0; s < SRC.length; s++) { const q = SRC[s], near = Math.hypot(q.x - px, q.z - pz) < 140;
        for (let k = 0; k < PER; k++) { const i = s * PER + k, a = ((t * 0.075 * (0.8 + 0.2 * q.s) + q.ph + k / PER) % 1), h = a * 9 * q.s;
          P.setXYZ(i, q.x + wx * a * a * 6 * q.s + Math.sin(t * 0.9 + k + q.ph) * 0.35 * a, q.y + h, q.z + wz * a * a * 6 * q.s);
          Z.setX(i, (0.9 + a * 4.2) * q.s); A.setX(i, near ? Math.min(1, a * 6) * (1 - a) * 0.55 * Math.min(1.2, cook) : 0); const g = 0.86 + a * 0.1; C.setXYZ(i, g, g, g * 1.02); } }
      P.needsUpdate = A.needsUpdate = Z.needsUpdate = C.needsUpdate = true; }
    if (leaves.visible) { leaves.position.set(px, 0, pz); const P = leaves.geometry.attributes.position.array; for (let i = 0; i < NL; i++) { P[i * 3 + 1] -= dt * (0.9 + (i % 5) * 0.18); P[i * 3] += (Math.sin(t * 1.7 + i) * 0.9 + wx * 0.6) * dt; P[i * 3 + 2] += (Math.cos(t * 1.3 + i * 0.7) * 0.6 + wz * 0.6) * dt; if (P[i * 3 + 1] < 0.05) { P[i * 3 + 1] = 12 + Math.random() * 6; P[i * 3] = Math.random() * 54 - 27; P[i * 3 + 2] = Math.random() * 54 - 27; } } leaves.geometry.attributes.position.needsUpdate = true; }
    if (motes.visible) { motes.position.set(px, 0, pz); const P = motes.geometry.attributes.position.array, A = motes.geometry.attributes.aAlpha, Z = motes.geometry.attributes.aSize, hot = season === 1 ? Math.sin(Math.PI * day) : 0.4;
      for (let i = 0; i < NM; i++) { P[i * 3 + 1] += dt * (season === 1 ? 0.5 : 0.15) * (0.6 + (i % 7) * 0.1); P[i * 3] += Math.sin(t * 0.8 + i) * dt * 0.4; if (P[i * 3 + 1] > 4) { P[i * 3 + 1] = 0.1; P[i * 3] = Math.random() * 80 - 40; P[i * 3 + 2] = Math.random() * 80 - 40; }
        const y = P[i * 3 + 1]; A.setX(i, Math.sin(Math.min(1, y / 4) * Math.PI) * (season === 1 ? 0.16 + 0.2 * hot : 0.22) * (0.5 + 0.5 * Math.sin(t * 2 + i))); Z.setX(i, season === 1 ? 0.5 + (i % 3) * 0.3 : 0.18); }
      motes.geometry.attributes.position.needsUpdate = A.needsUpdate = Z.needsUpdate = true; }
  }
  return { chimneys, update, setSeason, smoke: () => smoke, leaves, motes };
}

/* 해의 자리·빛깔: day 0~1 → { dir(해 쪽 단위 벡터), col, k(세기 배율), warm(노을 정도) } */
const _c0 = new THREE.Color(0xfff2dc), _cm = new THREE.Color(0xffd2b0), _ce = new THREE.Color(0xffa860), _d = new THREE.Vector3();
export function sunAt(day, out = { dir: new THREE.Vector3(), col: new THREE.Color(), k: 1, warm: 0 }) {
  const up = Math.sin(Math.PI * (0.08 + 0.84 * day)), az = Math.PI * (0.08 + 0.84 * day);
  _d.set(Math.cos(az), 0.28 + 0.9 * up, 0.55).normalize(); out.dir.copy(_d);
  const warm = Math.pow(1 - up, 1.6); out.warm = warm; out.col.copy(_c0).lerp(day < 0.5 ? _cm : _ce, warm); out.k = 0.72 + 0.28 * up; return out;
}
