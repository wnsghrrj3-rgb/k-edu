// 케이히스토리 엔진 · props.js — GLB 없이 scene.json 좌표에 놓는 절차 소품. 코어는 시대 이름을 모른다.
import * as THREE from 'three';
import { createAvatar } from './avatar.js';

const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.9, metalness: 0, flatShading: !!o.flat, name: o.name || '' });
const mesh = (parent, geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
const R = (seed) => { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };

/** 열매 덤불. kind 'dark' = 검은 열매(먹으면 안 되는), 'red' = 빨간 열매 */
export function berryBush(kind = 'dark', seed = 1) {
  const g = new THREE.Group(); const r = R(seed);
  const leaf = M(kind === 'dark' ? 0x2f4a2a : 0x3f6a33, { flat: true, name: 'leaf' });
  const berry = M(kind === 'dark' ? 0x1a1224 : 0xb7262a, { rough: 0.5, name: 'berry' });
  for (let i = 0; i < 5; i++) mesh(g, new THREE.IcosahedronGeometry(0.55, 1), leaf, (r() - .5) * 1.1, 0.45 + r() * 0.4, (r() - .5) * 1.1, 1, 0.8, 1);
  for (let i = 0; i < 14; i++) mesh(g, new THREE.SphereGeometry(0.06, 8, 6), berry, (r() - .5) * 1.4, 0.35 + r() * 0.75, (r() - .5) * 1.4);
  return g;
}
/** 먹을 수 있는 뿌리 식물 — 잎 몇 장 + 흙 위로 삐져나온 뿌리 */
export function rootPlant(seed = 1) {
  const g = new THREE.Group(); const r = R(seed);
  const leaf = M(0x6f8f3a, { flat: true, name: 'leaf' }); const root = M(0x8b6a3e, { name: 'root' });
  for (let i = 0; i < 6; i++) { const l = mesh(g, new THREE.ConeGeometry(0.09, 0.55, 5), leaf, 0, 0.28, 0); l.rotation.set(0.9, r() * 6.28, 0); l.rotateOnAxis(new THREE.Vector3(0, 1, 0), i); }
  mesh(g, new THREE.SphereGeometry(0.14, 8, 6), root, 0.05, 0.06, 0.02, 1, 0.6, 1.3);
  return g;
}
/** 돌 네 가지 — 둥근 / 잘 부서지는 / 단단한 / 날카롭게 깨지는 */
export function stone(kind = 'round', seed = 1) {
  const g = new THREE.Group();
  if (kind === 'round') mesh(g, new THREE.SphereGeometry(0.28, 12, 10), M(0x8a8a86, { rough: 0.7 }), 0, 0.22, 0, 1, 0.8, 1);
  else if (kind === 'soft') mesh(g, new THREE.DodecahedronGeometry(0.3, 0), M(0xc9b48a, { rough: 1, flat: true }), 0, 0.22, 0, 1.1, 0.7, 0.9);
  else if (kind === 'hard') mesh(g, new THREE.SphereGeometry(0.27, 10, 8), M(0x3b3d40, { rough: 0.55 }), 0, 0.2, 0, 1.15, 0.75, 1);
  else mesh(g, new THREE.OctahedronGeometry(0.3, 0), M(0x4a4038, { rough: 0.35, flat: true }), 0, 0.26, 0, 1, 1.1, 0.8).rotation.set(0.4, seed, 0.3);
  return g;
}
/** 사슴. big=true 면 어른 사슴(뿔) */
export function deer(kind = 'big', seed = 1) {
  const g = new THREE.Group(); const fur = M(0x9a6b3c, { name: 'fur' }); const dark = M(0x3a2a1a);
  const big = kind !== 'small'; const s = big ? 1 : 0.7;
  if (kind === 'down') { // 누운 사슴 — 사냥 뒤. 조용하다.
    mesh(g, new THREE.CapsuleGeometry(0.28, 0.9, 4, 8), fur, 0, 0.3, 0, 1, 1, 1).rotation.z = Math.PI / 2;
    const neck = mesh(g, new THREE.CylinderGeometry(0.12, 0.16, 0.6, 8), fur, 0.7, 0.22, 0.1); neck.rotation.z = Math.PI / 2 - 0.2;
    mesh(g, new THREE.BoxGeometry(0.34, 0.2, 0.18), fur, 1.05, 0.14, 0.2);
    for (const [x, z] of [[-.3, .3], [.3, .3], [-.35, -.1], [.35, -.1]]) { const l = mesh(g, new THREE.CylinderGeometry(0.05, 0.04, 0.85, 6), dark, x, 0.12, z + 0.35); l.rotation.x = Math.PI / 2 - 0.15; }
    for (const z of [-.06, .06]) { const a = mesh(g, new THREE.CylinderGeometry(0.02, 0.03, 0.45, 5), dark, 1.1, 0.18, z * 4 + 0.5); a.rotation.x = -1.3; }
    g.rotation.y = seed; return g;
  }
  mesh(g, new THREE.CapsuleGeometry(0.28, 0.9, 4, 8), fur, 0, 0.95 * s, 0, s, s, s).rotation.z = Math.PI / 2;
  const neck = mesh(g, new THREE.CylinderGeometry(0.12, 0.16, 0.6, 8), fur, 0.55 * s, 1.25 * s, 0, s, s, s); neck.rotation.z = -0.7;
  mesh(g, new THREE.BoxGeometry(0.34, 0.2, 0.18), fur, 0.8 * s, 1.52 * s, 0, s, s, s);
  for (const [x, z] of [[-.35, -.12], [-.35, .12], [.35, -.12], [.35, .12]]) mesh(g, new THREE.CylinderGeometry(0.05, 0.04, 0.85, 6), dark, x * s, 0.45 * s, z * s, s, s, s);
  if (big) for (const z of [-.1, .1]) { const a = mesh(g, new THREE.CylinderGeometry(0.02, 0.03, 0.45, 5), dark, 0.75 * s, 1.85 * s, z * 2.2, 1, 1, 1); a.rotation.z = -0.3; a.rotation.x = z * 4; }
  g.rotation.y = seed;
  return g;
}
/** 흔적 다섯 가지 — 발자국 / 배설물 / 부러진 가지 / 눌린 풀 / 털 */
export function track(kind = 'step', seed = 1) {
  const g = new THREE.Group(); const r = R(seed);
  if (kind === 'step') for (let i = 0; i < 4; i++) { const m = mesh(g, new THREE.CircleGeometry(0.11, 10), M(0x3f3126, { name: 'mark' }), (i % 2) * 0.35 - 0.17, 0.02, i * 0.45 - 0.7, 1, 1.5, 1); m.rotation.x = -Math.PI / 2; m.receiveShadow = false; }
  else if (kind === 'dung') for (let i = 0; i < 5; i++) mesh(g, new THREE.SphereGeometry(0.07, 7, 5), M(0x2d2418), (r() - .5) * 0.4, 0.06, (r() - .5) * 0.4);
  else if (kind === 'branch') { const b = mesh(g, new THREE.CylinderGeometry(0.04, 0.05, 0.9, 6), M(0x6b5238), 0, 0.12, 0); b.rotation.z = 1.2; b.rotation.y = 0.4; const c = mesh(g, new THREE.CylinderGeometry(0.03, 0.04, 0.5, 6), M(0x8a6a48), 0.45, 0.28, 0.2); c.rotation.z = 0.5; }
  else if (kind === 'grass') { const m = mesh(g, new THREE.CircleGeometry(0.75, 16), M(0x8a9a52, { name: 'flat' }), 0, 0.03, 0, 1.4, 1, 1); m.rotation.x = -Math.PI / 2; for (let i = 0; i < 8; i++) { const s = mesh(g, new THREE.BoxGeometry(0.05, 0.3, 0.02), M(0x7d8c46), (r() - .5) * 1.6, 0.06, (r() - .5) * 1.0); s.rotation.x = 1.3; s.rotation.y = r() * 3; } }
  else for (let i = 0; i < 6; i++) { const t = mesh(g, new THREE.ConeGeometry(0.03, 0.22, 4), M(0xc9a97a, { name: 'fur' }), (r() - .5) * 0.5, 0.1, (r() - .5) * 0.5); t.rotation.set(1.2 + r(), r() * 3, 0); }
  return g;
}
/** 사람. look: {cloth, hair} 색으로 구분 */
export function person(look = {}) {
  const a = createAvatar(false);
  a.traverse((m) => { if (!m.isMesh) return; const c = m.material.color.getHex(); if (c === 0x506a62 && look.cloth) m.material = M(look.cloth); if (c === 0x302d28 && look.hair) m.material = M(look.hair); });
  return a;
}
/** 숨을 자리 — 눌린 풀 한 자리(어디가 좋은 자리인지는 바람이 말해 준다) */
export function spot(kind = 'open', seed = 1) {
  const g = new THREE.Group(); const r = R(seed);
  const m = mesh(g, new THREE.CircleGeometry(0.9, 18), M(kind === 'rock' ? 0x6f6a5c : 0x8f9a55, { name: 'flat' }), 0, 0.03, 0, 1.3, 1, 1); m.rotation.x = -Math.PI / 2; m.receiveShadow = false;
  if (kind === 'rock') for (let i = 0; i < 3; i++) mesh(g, new THREE.DodecahedronGeometry(0.5 + r() * 0.3, 0), M(0x5d5750, { flat: true }), (r() - .5) * 1.4, 0.35, -0.9 - r() * 0.4, 1.3, 0.9, 1);
  else if (kind === 'reed') for (let i = 0; i < 10; i++) { const s = mesh(g, new THREE.BoxGeometry(0.05, 1.1, 0.02), M(0x9aa657), (r() - .5) * 2.0, 0.5, (r() - .5) * 1.6); s.rotation.y = r() * 3; s.rotation.z = (r() - .5) * 0.3; }
  return g;
}
/** 바람 — 잎이 한쪽으로 날린다. 냄새도 그쪽으로 간다. kind = 'z' (+z 쪽으로) 만 지금은 */
export function wind(kind = 'z', seed = 1) {
  const g = new THREE.Group(); const r = R(seed); const leaf = M(0xb9a24a, { name: 'leaf' }); leaf.side = THREE.DoubleSide;
  const leaves = [];
  for (let i = 0; i < 14; i++) { const l = mesh(g, new THREE.PlaneGeometry(0.16, 0.1), leaf, (r() - .5) * 6, 0.6 + r() * 1.6, (r() - .5) * 6); l.castShadow = false; l.userData.o = r() * 6.28; leaves.push(l); }
  g.userData.animate = (t) => { for (const l of leaves) { const k = ((t * 1.4 + l.userData.o) % 6.5); l.position.z = -3 + k; l.position.y = 0.6 + Math.sin(k * 2 + l.userData.o) * 0.5 + 0.8; l.rotation.set(Math.sin(t * 3 + l.userData.o), t * 2 + l.userData.o, 0); } };
  return g;
}
/** 나뭇가지 — dry 마른 것 / wet 물가의 축축한 것 */
export function stick(kind = 'dry', seed = 1) {
  const g = new THREE.Group(); const r = R(seed);
  const b = mesh(g, new THREE.CylinderGeometry(0.045, 0.06, 1.0 + r() * 0.4, 6), M(kind === 'wet' ? 0x3d3026 : 0x8a6a48, { rough: kind === 'wet' ? 0.5 : 1 }), 0, 0.06, 0); b.rotation.set(Math.PI / 2 * 0.98, 0, r() * 3);
  if (kind === 'wet') mesh(g, new THREE.CircleGeometry(0.45, 10), M(0x4a5a4a, { rough: 0.3 }), 0, 0.015, 0).rotation.x = -Math.PI / 2;
  return g;
}
/** 임시 거처 — 기둥 셋에 가죽을 걸었다 */
export function shelter(kind = 'hide', seed = 1) {
  const g = new THREE.Group(); const wood = M(0x6b5238); const hide = M(0x8a6a48, { rough: 0.95, name: 'hide' }); hide.side = THREE.DoubleSide;
  for (const [x, z, ry] of [[-0.9, 0.6, 0.4], [0.9, 0.6, -0.4], [0, -0.9, 0]]) { const p = mesh(g, new THREE.CylinderGeometry(0.05, 0.07, 2.4, 6), wood, x, 1.1, z); p.rotation.set(-z * 0.45, 0, x * 0.45); }
  const cloth = mesh(g, new THREE.ConeGeometry(1.35, 2.0, 7, 1, true), hide, 0, 1.0, 0); cloth.rotation.y = seed;
  return g;
}
export const PROPS = { shelter, berryBush, rootPlant, stone, deer, track, person, spot, wind, stick };
