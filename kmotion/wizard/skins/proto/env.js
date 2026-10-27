// proto 스킨 — 숲 전투장 바닥·둘레(⑥). 판정과 무관한 배경만. 전투장 폭 = 스테이지 arenaHalfX 4m(+여유), 적은 z 0.5~16
// 좌표는 Three 그대로(배경이라 좌우 대칭 — WX 필요 없음). InstancedMesh 로 그리기 호출 적게
import * as THREE from 'three';
import { toon } from './actors.js';
function rng(seed){ let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function groundTex(){ const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#5f9a3e'; g.fillRect(0, 0, 512, 512); const r = rng(7);
  for (let i = 0; i < 2600; i++) { const x = r() * 512, y = r() * 512, l = 38 + r() * 18; g.fillStyle = `hsl(${92 + r() * 22},${40 + r() * 15}%,${l}%)`; g.fillRect(x, y, 2 + r() * 3, 2 + r() * 5); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 14); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function arenaTex(){ const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = rng(11);
  const gr = g.createRadialGradient(256, 256, 60, 256, 256, 256); gr.addColorStop(0, 'rgba(176,138,92,1)'); gr.addColorStop(.72, 'rgba(160,124,82,.95)'); gr.addColorStop(1, 'rgba(150,118,80,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 200, x = 256 + Math.cos(a) * d, y = 256 + Math.sin(a) * d; g.fillStyle = `rgba(${90 + r() * 60},${70 + r() * 40},${45 + r() * 30},.45)`; g.beginPath(); g.arc(x, y, 1 + r() * 3, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(255,240,200,.18)'; g.lineWidth = 5; g.beginPath(); g.arc(256, 256, 150, 0, 7); g.stroke();   // 바닥 마법진 흔적
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

export function buildForest(scene, { arenaZ = 9 } = {}){
  const root = new THREE.Group(); scene.add(root); const r = rng(42), dummy = new THREE.Object3D();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshLambertMaterial({ map: groundTex() })); ground.rotation.x = -Math.PI / 2; ground.position.z = 20; ground.receiveShadow = true; root.add(ground);
  const arena = new THREE.Mesh(new THREE.PlaneGeometry(15, 22), new THREE.MeshLambertMaterial({ map: arenaTex(), transparent: true, depthWrite: false })); arena.rotation.x = -Math.PI / 2; arena.position.set(0, .01, arenaZ - 3); arena.receiveShadow = true; root.add(arena);
  // 나무 자리: 전투장 양옆(|x| ≥ 6.5)과 뒤(z ≥ 17) — 카메라 앞(z < -4)은 비움
  const spots = []; let guard = 0; while (spots.length < 170 && guard++ < 4000) { const x = (r() * 2 - 1) * 34, z = -6 + r() * 52; if (Math.abs(x) < 6.5 && z < 17) continue; if (z < -3 && Math.abs(x) < 12) continue; if (spots.some(s => Math.hypot(s[0] - x, s[1] - z) < 1.7)) continue; spots.push([x, z, .8 + r() * .7, r()]); }
  const pine = spots.filter(s => s[3] < .6), leaf = spots.filter(s => s[3] >= .6);
  const trunkG = new THREE.CylinderGeometry(.16, .24, 1.6, 7); trunkG.translate(0, .8, 0);
  const pineG = new THREE.ConeGeometry(1.25, 3.4, 8); pineG.translate(0, 3.0, 0); const pine2 = new THREE.ConeGeometry(.95, 2.4, 8); pine2.translate(0, 4.3, 0);
  const leafG = new THREE.IcosahedronGeometry(1.5, 1); leafG.translate(0, 3.0, 0);
  const inst = (geo, mat, list, f) => { const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((s, i) => { dummy.position.set(s[0], 0, s[1]); dummy.rotation.set(0, s[3] * 9, 0); dummy.scale.setScalar(s[2]); f && f(dummy, s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.castShadow = true; m.receiveShadow = true; root.add(m); return m; };
  const meshes = [inst(trunkG, toon(0x6b4a2e), spots), inst(pineG, toon(0x2f6b3a), pine), inst(pine2, toon(0x3b8045), pine), inst(leafG, toon(0x5aa03c), leaf, (d, s) => d.scale.set(s[2], s[2] * (.9 + s[3] * .3), s[2]))];
  // 활엽수 색 섞기
  const lc = new THREE.Color(); leaf.forEach((s, i) => { lc.setHSL(.24 + s[3] * .08, .5, .38 + (s[3] - .6) * .4); meshes[3].setColorAt(i, lc); }); if (meshes[3].instanceColor) meshes[3].instanceColor.needsUpdate = true;
  // 덤불·바위·버섯(전투장 가장자리)
  const edge = []; guard = 0; while (edge.length < 70 && guard++ < 3000) { const x = (r() * 2 - 1) * 9, z = -2 + r() * 22; if (Math.abs(x) < 5.4) continue; edge.push([x, z, .5 + r() * .6, r()]); }
  const bushG = new THREE.IcosahedronGeometry(.6, 0); bushG.translate(0, .35, 0); meshes.push(inst(bushG, toon(0x4c8c36), edge.filter(e => e[3] < .55), (d, s) => d.scale.set(s[2] * 1.3, s[2], s[2] * 1.1)));
  const rockG = new THREE.DodecahedronGeometry(.45, 0); rockG.translate(0, .2, 0); meshes.push(inst(rockG, toon(0x8b8f99), edge.filter(e => e[3] >= .55 && e[3] < .85), (d, s) => d.scale.set(s[2] * 1.4, s[2] * .8, s[2])));
  const capG = new THREE.SphereGeometry(.22, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2); capG.translate(0, .28, 0); meshes.push(inst(capG, toon(0xe5533d), edge.filter(e => e[3] >= .85)));
  const stemG = new THREE.CylinderGeometry(.06, .08, .3, 6); stemG.translate(0, .15, 0); meshes.push(inst(stemG, toon(0xfff3dc), edge.filter(e => e[3] >= .85)));
  // 먼 산 두 겹
  for (const [z, col, hgt] of [[60, 0x7fa9c4, 14], [48, 0x6b9a86, 9]]) { const g = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 5), new THREE.MeshBasicMaterial({ color: col, fog: true }));
    for (let i = 0; i < 9; i++) { const m = g.clone(); m.scale.set(10 + r() * 10, hgt * (.6 + r() * .6), 6); m.position.set(-60 + i * 15 + r() * 6, 0, z + r() * 6); root.add(m); } }
  // 빛줄기 + 반딧불(떠다니는 점)
  const fireN = 80, fp = new Float32Array(fireN * 3), seeds = []; for (let i = 0; i < fireN; i++) { seeds.push([(r() * 2 - 1) * 10, .4 + r() * 2.5, -1 + r() * 20, r() * 7]); }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  const flies = new THREE.Points(fg, new THREE.PointsMaterial({ color: 0xfff6b0, size: .09, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false })); flies.frustumCulled = false; root.add(flies);
  let t = 0;
  return {
    update(dt){ t += dt; for (let i = 0; i < fireN; i++) { const s = seeds[i]; fp[i * 3] = s[0] + Math.sin(t * .4 + s[3]) * .8; fp[i * 3 + 1] = s[1] + Math.sin(t * .9 + s[3] * 2) * .3; fp[i * 3 + 2] = s[2] + Math.cos(t * .3 + s[3]) * .8; } fg.attributes.position.needsUpdate = true; },
    setQuality(q){ flies.visible = q !== 'low'; meshes.forEach(m => { m.castShadow = q === 'high' || (q === 'medium' && m.count < 140); }); },
    dispose(){ scene.remove(root); },
  };
}
