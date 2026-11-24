/* 공통 엔진 · 반짝이 — 빛 알갱이(마법 · 먼지 · 김 · 부스러기). 한 번에 그리는 점 무리 하나. */
import * as THREE from 'three';
import { rand } from './stage.js';

/** scene 에 알갱이 n 개짜리 무리를 만든다. spark(자리, 색, 개수, 퍼짐, 빠르기, { up:떠오름, life:[짧게, 길게] }) · tick(dt) */
export function createSparks(scene, n = 260) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), pp = Array.from({ length: n }, () => ({ life: 0, max: 1, g: 1.2, v: new THREE.Vector3(), c: new THREE.Color() })); let next = 0;
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, '#fff'); gr.addColorStop(0.35, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.2, map: new THREE.CanvasTexture(c), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); pts.frustumCulled = false; scene.add(pts);
  function spark(p, color, count = 1, spread = 0.2, speed = 1, o = {}) {
    for (let i = 0; i < count; i++) { const q = pp[next], j = next * 3; next = (next + 1) % n; q.life = q.max = rand(...(o.life || [0.4, 0.9])); q.c.set(color); q.g = o.up ? -0.6 : 1.2;
      pos[j] = p.x + rand(-spread, spread); pos[j + 1] = p.y + rand(-spread, spread); pos[j + 2] = p.z + rand(-spread, spread); q.v.set(rand(-1, 1), rand(0.2, 1.4), rand(-1, 1)).multiplyScalar(speed); }
  }
  function tick(dt) {
    for (let i = 0; i < n; i++) { const q = pp[i], j = i * 3; if (q.life <= 0) { col[j] = col[j + 1] = col[j + 2] = 0; continue; }
      q.life -= dt; pos[j] += q.v.x * dt; pos[j + 1] += q.v.y * dt; pos[j + 2] += q.v.z * dt; q.v.y -= q.g * dt; const a = Math.max(0, q.life / q.max); col[j] = q.c.r * a; col[j + 1] = q.c.g * a; col[j + 2] = q.c.b * a; }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
  }
  return { spark, tick, points: pts };
}
