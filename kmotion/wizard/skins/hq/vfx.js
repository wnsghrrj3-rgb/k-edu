// hq 스킨 — 마법 이펙트(2-5절). 예고 바닥(계약 필수)·입자 풀·도토리·별똥은 proto 그대로, 탄·폭발·얼음·번개는 여기서 새로 그린다
// 크기(반지름)·시간은 스냅샷 값 그대로(13 문서 5-4) — 여기선 보이는 모습만
import * as THREE from 'three';
import * as V from '../proto/vfx.js';
import { WX } from '../proto/actors.js';
import { A } from './actors.js';
export const { makeTelegraph, poseTelegraph, Sparks, makeTelegraphLine, poseTelegraphLine, makeTelegraphRing, poseTelegraphRing, makeMeteor, poseMeteor } = V;
const add = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.75)'); gr.addColorStop(.6, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t; })();
export const glowSprite = (color, scale = 1, opacity = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(scale); return s; };
const SPELL = { bolt: { core: 0xffffff, glow: 0xffe27a, light: 0xffe9a0, trail: 0xffd45c, n: 10, size: .22 }, fireball: { core: 0xfff0b0, glow: 0xff7a2a, light: 0xff8a3d, trail: 0xff5a1a, n: 18, size: .42 } };

// ── 탄(마법탄·불꽃탄): 핵 + 가산 글로우 스프라이트 + 점광 + 리본 꼬리(두 겹 점) + 화염은 흔들리는 혀
export function makeProjectile(p){ if (p.kind === 'acorn') return V.makeProjectile(p);
  const S = SPELL[p.kind] || SPELL.bolt, g = new THREE.Group(), fire = p.kind === 'fireball';
  const core = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: S.core })); core.scale.setScalar(p.r * (fire ? .75 : .6)); g.add(core);
  const glow = glowSprite(S.glow, p.r * (fire ? 7 : 5), .95); g.add(glow); const glow2 = glowSprite(0xffffff, p.r * (fire ? 3 : 2.2), .6); g.add(glow2);
  const light = new THREE.PointLight(S.light, fire ? 3.2 : 1.6, fire ? 7 : 4, 2); g.add(light);
  let tongues = null; if (fire) { tongues = new THREE.Group(); for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(p.r * .55, p.r * 2.2, 7), add(i % 2 ? 0xffb347 : 0xff5a1a, .8)); m.rotation.x = Math.PI / 2; m.position.z = -p.r * 1.2; m.userData.ph = i * 1.3; tongues.add(m); } g.add(tongues); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(S.n * 3), 3)); const trail = new THREE.Points(geo, new THREE.PointsMaterial({ map: glowTex, color: S.trail, size: S.size, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false })); trail.frustumCulled = false;
  g.userData = { trail, hist: [], n: S.n, core, glow, glow2, light, tongues, t: Math.random() * 7 }; return { g, trail }; }
export function poseProjectile(o, p){ if (p.kind === 'acorn') return V.poseProjectile(o, p);
  const u = o.g.userData, t = performance.now() / 1000; o.g.position.set(WX(p.pos[0]), p.pos[1], p.pos[2]);
  const v = p.vel; if (v && (v[0] || v[2])) o.g.rotation.y = Math.atan2(-v[0], v[2]);   // 꼬리는 뒤(−Z)
  u.core.scale.setScalar(p.r * (p.kind === 'fireball' ? .75 : .6) * (1 + .12 * Math.sin(t * 40))); u.glow.material.opacity = .8 + .2 * Math.sin(t * 30); u.light.intensity = (p.kind === 'fireball' ? 3.2 : 1.6) * (.85 + .15 * Math.sin(t * 25));
  if (u.tongues) u.tongues.children.forEach((m, i) => { m.scale.set(1, 1 + .5 * Math.sin(t * 18 + m.userData.ph), 1); m.rotation.z = Math.sin(t * 9 + m.userData.ph) * .5; m.position.x = Math.sin(t * 12 + m.userData.ph) * p.r * .3; m.position.y = Math.cos(t * 11 + m.userData.ph) * p.r * .3; });
  u.hist.unshift([WX(p.pos[0]), p.pos[1], p.pos[2]]); if (u.hist.length > u.n) u.hist.pop();
  const a = o.trail.geometry.attributes.position; for (let i = 0; i < u.n; i++) { const h = u.hist[Math.min(i, u.hist.length - 1)]; a.setXYZ(i, h[0] + (Math.random() - .5) * .05 * i, h[1] + (Math.random() - .5) * .05 * i + i * .01, h[2]); } a.needsUpdate = true; }

// ── 폭발: 불덩이 + 충격파 고리(바닥) + 연기 구 + 섬광(점광) — index 가 k(0~1) 로 scale·opacity 를 다루므로 .material 을 같은 식으로 둔다
export function makeBlast(color){ const g = new THREE.Group();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), add(color, .7)); g.add(ball);
  const inner = new THREE.Mesh(new THREE.SphereGeometry(.55, 18, 12), add(0xfff3c4, .9)); g.add(inner);
  const wave = new THREE.Mesh(new THREE.RingGeometry(.86, 1, 64), add(0xffd0a0, .9)); wave.rotation.x = -Math.PI / 2; wave.position.y = .04; g.add(wave);
  const smoke = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({ color: 0x3a2a28, transparent: true, opacity: .35, depthWrite: false })); smoke.scale.setScalar(.8); g.add(smoke);
  const light = new THREE.PointLight(color, 8, 9, 2); light.position.y = .6; g.add(light); const flash = glowSprite(color, 3.2, .9); flash.position.y = .5; g.add(flash);
  g.material = ball.material; g.userData = { ball, inner, wave, smoke, light, flash, blast: true }; return g; }
/** index 가 scale·opacity 를 놓은 뒤 부른다 — k 로 파편 연출(고리는 밖으로, 연기는 위로, 섬광은 처음만) */
export function poseBlast(g, k, radius){ const u = g.userData; if (!u || !u.blast) return; const s = g.scale.x || 1;
  u.wave.scale.setScalar((.3 + 1.6 * k) * radius / s); u.wave.position.y = .04 / s; u.wave.material.opacity = (1 - k) * .9;
  u.smoke.scale.setScalar((.6 + .9 * k)); u.smoke.position.y = k * 1.2; u.smoke.material.opacity = .32 * (1 - k * k);
  u.inner.material.opacity = (1 - k) * .9; u.light.intensity = 8 * Math.max(0, 1 - k * 3); u.flash.material.opacity = Math.max(0, 1 - k * 4); u.flash.scale.setScalar((3.2 + k * 3) * radius / s); }

// ── 얼음 폭풍: 서리 원판 + 솟아오르는 얼음 결정(GLB Crystal, 없으면 팔면체) + 눈송이 + 푸른 점광
export function makeIce(){ const g = V.makeIce(); const def = A.crystal[1] || A.crystal[0]; const geo = def ? def.geo : (() => { const o = new THREE.OctahedronGeometry(.3, 0); o.scale(.6, 2.2, .6); o.translate(0, .33, 0); return o; })();
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xbff2ff, emissive: 0x2a9ad6, emissiveIntensity: .7, roughness: .1, metalness: 0, clearcoat: 1, transparent: true, opacity: .85 }); const shards = []; for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(geo, mat); const a = i / 9 * Math.PI * 2 + .3; m.userData = { a, rad: .45 + (i % 3) * .25, ph: i * .7 }; m.rotation.set((Math.random() - .5) * .6, a, (Math.random() - .5) * .6); g.add(m); shards.push(m); }
  const light = new THREE.PointLight(0x8fe8ff, 3, 10, 2); light.position.y = 1.2; g.add(light); const mist = glowSprite(0x9be7ff, 2, .5); mist.position.y = .5; g.add(mist);
  Object.assign(g.userData, { shards, light, mist, hq: true }); return g; }
export function poseIce(g, a, gameT){ V.poseIce(g, a, gameT); const u = g.userData; if (!u.hq) return; const k = Math.max(0, Math.min(1, (gameT - a.t0) / Math.max(.01, a.t1 - a.t0)));
  u.shards.forEach(m => { const rise = Math.min(1, Math.max(0, (k * 2.2 - m.userData.ph * .15))); const fall = Math.max(0, (k - .75) * 4); m.position.set(Math.cos(m.userData.a) * m.userData.rad * a.radius, rise * .9 - fall * 1.5 - .4, Math.sin(m.userData.a) * m.userData.rad * a.radius); m.scale.setScalar((.8 + (m.userData.ph % 1) * .6) * Math.max(.01, rise) * (1 - fall)); });
  u.light.intensity = 3 * (1 - k); u.mist.scale.setScalar(a.radius * 2 * (.6 + .4 * k)); u.mist.material.opacity = .5 * (1 - k); }

// ── 번개 사슬: 두꺼운 핵(여러 줄 겹침) + 가산 글로우 선 + 맞는 자리 섬광 스프라이트. 꺾인 선은 proto 와 같은 점 배치
export function makeBolt(points){ const g = new THREE.Group(); const lines = [V.makeBolt(points), V.makeBolt(points), V.makeBolt(points)]; lines[0].material.color.setHex(0xffffff); lines[1].material = new THREE.LineBasicMaterial({ color: 0xfff27a, transparent: true, opacity: .7, blending: THREE.AdditiveBlending }); lines[2].material = new THREE.LineBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: .5, blending: THREE.AdditiveBlending });
  for (const l of lines) g.add(l); const flashes = points.slice(1).map(p => { const s = glowSprite(0xfff8c0, 1.6, 1); s.position.set(WX(p[0]), p[1], p[2]); g.add(s); return s; });
  const light = new THREE.PointLight(0xfff27a, 6, 12, 2); const L = points[points.length - 1]; light.position.set(WX(L[0]), 1, L[2]); g.add(light);
  g.userData = { lines, flashes, light, born: performance.now() }; g.geometry = { dispose(){ for (const l of lines) l.geometry.dispose(); } }; return g; }
export function poseBolt(g){ const u = g.userData, age = (performance.now() - u.born) / 1000; let live = true; for (const l of u.lines) live = V.poseBolt(l) && live; u.flashes.forEach(s => { s.material.opacity = Math.max(0, 1 - age * 3); s.scale.setScalar(1.6 + age * 3); }); u.light.intensity = 6 * Math.max(0, 1 - age * 3); return live; }
