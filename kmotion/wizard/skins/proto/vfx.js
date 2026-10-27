// proto 스킨 — 이펙트(예고 바닥·탄·폭발·입자·숫자). 크기·시간은 스냅샷 값 그대로(13 문서 5-4)
import * as THREE from 'three';
import { WX } from './actors.js';
const add = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
const hatchTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = 'rgba(255,60,80,.35)'; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = 'rgba(255,230,230,.55)'; g.lineWidth = 7; for (let i = -64; i < 128; i += 18) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t; })();
export function makeTelegraph(){ const g = new THREE.Group();
  const area = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ map: hatchTex, transparent: true, depthWrite: false })); area.rotation.x = -Math.PI / 2; g.add(area);
  const fill = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0xff3048, transparent: true, opacity: .45, depthWrite: false })); fill.rotation.x = -Math.PI / 2; fill.position.y = .005; g.add(fill);
  const edge = new THREE.Mesh(new THREE.RingGeometry(.94, 1, 48), new THREE.MeshBasicMaterial({ color: 0xff5c6e, transparent: true, opacity: .95, depthWrite: false })); edge.rotation.x = -Math.PI / 2; edge.position.y = .01; g.add(edge);
  g.userData = { fill, area }; g.renderOrder = 2; return g; }
export function poseTelegraph(g, tg, gameT){ const r = tg.size[0], k = Math.max(0, Math.min(1, (gameT - tg.t0) / (tg.t1 - tg.t0))); g.position.set(WX(tg.center[0]), .03, tg.center[2]); g.scale.setScalar(r);
  g.userData.fill.scale.setScalar(Math.max(.01, k)); g.userData.area.material.map.offset.x = performance.now() / 4000; }

export function makeProjectile(p){ const g = new THREE.Group(); const fire = p.kind === 'fireball'; const col = fire ? 0xff8a3d : 0xffe27a;
  const core = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({ color: fire ? 0xffd27a : 0xffffff })); core.scale.setScalar(p.r * .7); g.add(core);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), add(col, .55)); glow.scale.setScalar(p.r * 1.6); g.add(glow);
  const trailN = fire ? 14 : 8, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trailN * 3), 3));
  const trail = new THREE.Points(geo, new THREE.PointsMaterial({ color: col, size: fire ? .35 : .18, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false })); trail.frustumCulled = false;
  g.userData = { trail, hist: [], n: trailN }; return { g, trail }; }
export function poseProjectile(o, p){ o.g.position.set(WX(p.pos[0]), p.pos[1], p.pos[2]); const u = o.g.userData; u.hist.unshift([WX(p.pos[0]), p.pos[1], p.pos[2]]); if (u.hist.length > u.n) u.hist.pop();
  const a = o.trail.geometry.attributes.position; for (let i = 0; i < u.n; i++) { const h = u.hist[Math.min(i, u.hist.length - 1)]; a.setXYZ(i, h[0], h[1], h[2]); } a.needsUpdate = true; }

// 입자 풀(크기 고정·재사용) — 품질 배율로 개수만 줄고 판정은 그대로
export class Sparks { constructor(scene, n = 600){ this.n = n; this.p = []; const geo = new THREE.BufferGeometry(); this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: .16, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); this.pts.frustumCulled = false; scene.add(this.pts); this.mul = 1; }
  burst(pos, color, count, speed = 3, up = 2){ const c = new THREE.Color(color); count = Math.round(count * this.mul);
    for (let i = 0; i < count; i++) { if (this.p.length >= this.n) this.p.shift(); const a = Math.random() * Math.PI * 2, s = speed * (.4 + Math.random() * .6);
      this.p.push({ x: WX(pos[0]), y: pos[1], z: pos[2], vx: Math.cos(a) * s, vy: up * (.5 + Math.random()), vz: Math.sin(a) * s, life: .5 + Math.random() * .4, c }); } }
  update(dt){ let i = 0; this.p = this.p.filter(q => (q.life -= dt) > 0); for (const q of this.p) { q.vy -= 6 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; if (q.y < .02) { q.y = .02; q.vy *= -.3; }
      this.pos[i * 3] = q.x; this.pos[i * 3 + 1] = q.y; this.pos[i * 3 + 2] = q.z; const f = Math.min(1, q.life * 2); this.col[i * 3] = q.c.r * f; this.col[i * 3 + 1] = q.c.g * f; this.col[i * 3 + 2] = q.c.b * f; i++; }
    for (; i < this.n; i++) { this.pos[i * 3 + 1] = -99; } this.pts.geometry.attributes.position.needsUpdate = true; this.pts.geometry.attributes.color.needsUpdate = true; } }

export function makeBlast(color){ const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), add(color, .7)); return m; }

// ── 보스 예고: line(돌진 띠) · ring(땅 흔들기 — 숙여서 피함). circle 은 makeTelegraph 재사용
export function makeTelegraphLine(){ const g = new THREE.Group();
  const area = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: hatchTex, transparent: true, depthWrite: false })); area.rotation.x = -Math.PI / 2; g.add(area);
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xff3048, transparent: true, opacity: .45, depthWrite: false })); fill.rotation.x = -Math.PI / 2; fill.position.y = .005; g.add(fill);
  const arrows = []; for (let i = 0; i < 4; i++) { const a = new THREE.Mesh(new THREE.ConeGeometry(.35, .6, 3), new THREE.MeshBasicMaterial({ color: 0xffe0e4, transparent: true, opacity: .8, depthWrite: false })); a.rotation.x = Math.PI / 2; a.position.y = .03; g.add(a); arrows.push(a); }
  g.userData = { area, fill, arrows }; return g; }
export function poseTelegraphLine(g, tg, gameT){ const [w, len] = tg.size, k = Math.max(0, Math.min(1, (gameT - tg.t0) / (tg.t1 - tg.t0))), u = g.userData;
  g.position.set(WX(tg.center[0]), .03, tg.center[2]); g.rotation.y = -tg.yaw; u.area.scale.set(w, len, 1); u.fill.scale.set(w, Math.max(.01, len * k), 1); u.fill.position.z = -len / 2 * (1 - k);
  u.arrows.forEach((a, i) => { a.position.z = -len / 2 + ((i / 4 + performance.now() / 1500) % 1) * len; }); }
export function makeTelegraphRing(){ const g = new THREE.Group();
  const waves = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(.92, 1, 64), new THREE.MeshBasicMaterial({ color: 0xff5c6e, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = .04; g.add(m); waves.push(m); }
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshBasicMaterial({ color: 0xff3048, transparent: true, opacity: .18, depthWrite: false })); floor.rotation.x = -Math.PI / 2; floor.position.y = .02; g.add(floor);
  g.userData = { waves, floor }; return g; }
export function poseTelegraphRing(g, tg, gameT){ const R = tg.size[0], k = Math.max(0, Math.min(1, (gameT - tg.t0) / (tg.t1 - tg.t0))), u = g.userData; g.position.set(WX(tg.center[0]), 0, tg.center[2]);
  u.floor.scale.setScalar(R); u.floor.material.opacity = .1 + .25 * k; u.waves.forEach((w, i) => { const f = ((performance.now() / 700 + i / 3) % 1); w.scale.setScalar(.5 + f * R); w.material.opacity = (1 - f) * (.4 + .6 * k); }); }
