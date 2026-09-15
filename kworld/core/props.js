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
export function deer(big = true, seed = 1) {
  const g = new THREE.Group(); const fur = M(0x9a6b3c, { name: 'fur' }); const dark = M(0x3a2a1a);
  const s = big ? 1 : 0.7;
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
export const PROPS = { berryBush, rootPlant, stone, deer, track, person };
