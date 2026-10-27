// proto 스킨 — 이펙트(예고 바닥·탄·폭발·입자·숫자). 크기·시간은 스냅샷 값 그대로(13 문서 5-4)
import * as THREE from 'three';
import { WX, textSprite } from './actors.js';
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

export function makeProjectile(p){ if (p.kind === 'acorn') return makeAcorn(p); const g = new THREE.Group(); const fire = p.kind === 'fireball'; const col = fire ? 0xff8a3d : 0xffe27a;
  const core = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({ color: fire ? 0xffd27a : 0xffffff })); core.scale.setScalar(p.r * .7); g.add(core);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), add(col, .55)); glow.scale.setScalar(p.r * 1.6); g.add(glow);
  const trailN = fire ? 14 : 8, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trailN * 3), 3));
  const trail = new THREE.Points(geo, new THREE.PointsMaterial({ color: col, size: fire ? .35 : .18, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false })); trail.frustumCulled = false;
  g.userData = { trail, hist: [], n: trailN }; return { g, trail }; }
// 계산 고블린 도토리: 갈색 알 + 모자 + 식 「a+b」 라벨(스냅샷 projectile.label) — 꼬리 없음
function makeAcorn(p){ const g = new THREE.Group(); const nut = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), new THREE.MeshToonMaterial({ color: 0xb07a3c })); nut.scale.set(p.r * 1.2, p.r * 1.5, p.r * 1.2); g.add(nut);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshToonMaterial({ color: 0x5c3a1a })); cap.scale.set(p.r * 1.3, p.r * .9, p.r * 1.3); cap.position.y = p.r * .6; g.add(cap);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3)); const trail = new THREE.Points(geo, new THREE.PointsMaterial({ size: .01, transparent: true, opacity: 0 })); trail.frustumCulled = false;
  g.userData = { trail, hist: [], n: 1, nut, label: null }; return { g, trail }; }
export function poseProjectile(o, p){ o.g.position.set(WX(p.pos[0]), p.pos[1], p.pos[2]); const u = o.g.userData; if (p.kind === 'acorn') { u.nut.rotation.x += .25; u.nut.rotation.z += .1; if (p.label && !u.label) { u.label = textSprite(p.label, { scale: .62, color: '#fff4d6', stroke: '#3a2a10' }); u.label.position.y = .45; o.g.add(u.label); } return; }
  u.hist.unshift([WX(p.pos[0]), p.pos[1], p.pos[2]]); if (u.hist.length > u.n) u.hist.pop();
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

// ── v1.1 마법: 얼음 폭풍 원 · 번개 사슬 · 별똥(그림자→낙하) · 비전 방패는 actors 의 shield 구 재사용
export function makeIce(){ const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x9be7ff, transparent: true, opacity: .4, depthWrite: false })); disc.rotation.x = -Math.PI / 2; disc.position.y = .03; g.add(disc);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 48), add(0xe8fbff, .8)); ring.rotation.x = -Math.PI / 2; ring.position.y = .05; g.add(ring);
  const n = 60, geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), seed = []; for (let i = 0; i < n; i++) seed.push([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random()]);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const flakes = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: .14, transparent: true, opacity: .9, depthWrite: false })); flakes.frustumCulled = false; g.add(flakes);
  g.userData = { disc, ring, flakes, pos, seed, n }; return g; }
export function poseIce(g, a, gameT){ const u = g.userData, k = Math.max(0, Math.min(1, (gameT - a.t0) / Math.max(.01, a.t1 - a.t0))), grow = Math.min(1, (gameT - a.t0) / .3);
  g.position.set(WX(a.pos[0]), 0, a.pos[2]); u.disc.scale.setScalar(a.radius * grow); u.ring.scale.setScalar(a.radius * grow); u.disc.material.opacity = .45 * (1 - k * .7);
  for (let i = 0; i < u.n; i++) { const s = u.seed[i], f = ((gameT * .8 + s[2]) % 1); u.pos[i * 3] = s[0] * a.radius * .9; u.pos[i * 3 + 1] = 3.5 * (1 - f); u.pos[i * 3 + 2] = s[1] * a.radius * .9; } u.flakes.geometry.attributes.position.needsUpdate = true; }
export function makeBolt(points){ const pts = points.map(p => new THREE.Vector3(WX(p[0]), p[1], p[2])), geo = new THREE.BufferGeometry(); const N = (pts.length - 1) * 12 + 1; geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xfff27a, transparent: true, opacity: 1 })); line.frustumCulled = false; line.userData = { pts, N, born: performance.now() }; return line; }
export function poseBolt(line){ const u = line.userData, a = line.geometry.attributes.position, age = (performance.now() - u.born) / 1000; let k = 0;
  for (let s = 0; s < u.pts.length - 1; s++) for (let j = 0; j < 12; j++) { const t = j / 12, p = u.pts[s].clone().lerp(u.pts[s + 1], t), jit = j === 0 ? 0 : .35; a.setXYZ(k++, p.x + (Math.random() - .5) * jit, p.y + (Math.random() - .5) * jit, p.z + (Math.random() - .5) * jit); }
  const L = u.pts[u.pts.length - 1]; a.setXYZ(k, L.x, L.y, L.z); a.needsUpdate = true; line.material.opacity = Math.floor(age / .06) % 2 ? .35 : 1; return age < .35; }
export function makeMeteor(){ const g = new THREE.Group();
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x2a0a0a, transparent: true, opacity: .35, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = .03; g.add(shadow);
  const edge = new THREE.Mesh(new THREE.RingGeometry(.96, 1, 64), new THREE.MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: .9, depthWrite: false })); edge.rotation.x = -Math.PI / 2; edge.position.y = .04; g.add(edge);
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), new THREE.MeshBasicMaterial({ color: 0xffb46b })); const glow = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 12), add(0xff6a2a, .5)); rock.add(glow); g.add(rock);
  g.userData = { shadow, edge, rock }; return g; }
export function poseMeteor(g, a, gameT){ const u = g.userData, fall = a.t1 - a.t0, k = Math.max(0, Math.min(1, (gameT - a.t0) / Math.max(.01, fall)));
  g.position.set(WX(a.pos[0]), 0, a.pos[2]); u.shadow.scale.setScalar(a.radius * (.3 + .7 * k)); u.edge.scale.setScalar(a.radius); u.rock.position.set(-6 * (1 - k), 22 * (1 - k * k) + 1, -4 * (1 - k)); u.rock.visible = k < 1; u.rock.rotation.x += .1; }
