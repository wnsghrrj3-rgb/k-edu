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
  // ── v1.5 길 모드(27 문서 ②): 길 띠 + 나무 두 줄을 rail.dist 로 흘림. 두 장 돌려쓰기 — 전투장 원판·둘레 장식·고정 숲은 숨김
  const rail = new THREE.Group(); rail.visible = false; root.add(rail);
  const RL = 64;   // 돌려쓰는 한 장 길이(m), z −12 ~ 52 를 덮음
  const roadTex = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 512; const g = c.getContext('2d'), q = rng(5); g.fillStyle = '#9c7b55'; g.fillRect(0, 0, 128, 512);
    for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${110 + q() * 60},${85 + q() * 40},${55 + q() * 30},.5)`; g.beginPath(); g.arc(q() * 128, q() * 512, 1 + q() * 3, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(95,154,62,.55)'; for (let i = 0; i < 60; i++) { const x = q() < .5 ? q() * 14 : 114 + q() * 14; g.fillRect(x, q() * 512, 3 + q() * 6, 2 + q() * 4); }
    const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(1, 4); tx.colorSpace = THREE.SRGBColorSpace; return tx; })();
  const roads = [0, 1].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(7.2, RL), new THREE.MeshLambertMaterial({ map: roadTex })); m.rotation.x = -Math.PI / 2; m.position.set(0, .012, i * RL); m.receiveShadow = true; rail.add(m); return m; });
  // 나무 두 줄(좌우 |x| 4.6~9), 줄마다 침엽·활엽 섞어 — 인스턴스 z 를 매 프레임 갱신
  const rr = rng(77), rs = []; for (let i = 0; i < 64; i++) { const side = i % 2 ? 1 : -1; rs.push([side * (4.6 + rr() * 4.4), (i / 64) * RL + rr() * .6, .75 + rr() * .7, rr()]); }
  const rPine = rs.filter(s => s[3] < .55), rLeaf = rs.filter(s => s[3] >= .55);
  const rMeshes = [[trunkG, toon(0x6b4a2e), rs, null], [pineG, toon(0x2f6b3a), rPine, null], [pine2, toon(0x3b8045), rPine, null], [leafG, toon(0x5aa03c), rLeaf, (d, s) => d.scale.set(s[2], s[2] * (.9 + s[3] * .3), s[2])]]
    .map(([g, m, list, f]) => { const im = new THREE.InstancedMesh(g, m, list.length); im.castShadow = true; im.receiveShadow = true; im.userData = { list, f }; rail.add(im); return im; });
  rLeaf.forEach((s, i) => { lc.setHSL(.24 + s[3] * .08, .5, .38 + (s[3] - .55) * .4); rMeshes[3].setColorAt(i, lc); }); if (rMeshes[3].instanceColor) rMeshes[3].instanceColor.needsUpdate = true;
  const rb = []; for (let i = 0; i < 40; i++) rb.push([(i % 2 ? 1 : -1) * (3.9 + rr() * 1.2), (i / 40) * RL + rr() * 1.2, .4 + rr() * .5, rr()]);
  rMeshes.push(Object.assign(new THREE.InstancedMesh(bushG, toon(0x4c8c36), rb.length), { userData: { list: rb, f: (d, s) => d.scale.set(s[2] * 1.3, s[2], s[2] * 1.1) } })); rail.add(rMeshes[4]);
  const wrapZ = (z0, dist) => (((z0 - dist) % RL) + RL) % RL - 12;
  function layRail(dist){ for (const m of rMeshes) { const { list, f } = m.userData; list.forEach((s, i) => { dummy.position.set(s[0], 0, wrapZ(s[1], dist)); dummy.rotation.set(0, s[3] * 9, 0); dummy.scale.setScalar(s[2]); f && f(dummy, s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.instanceMatrix.needsUpdate = true; }
    roads.forEach((m, i) => { m.position.z = wrapZ(i * RL + RL / 2, dist); }); }
  layRail(0);
  // ── v1.7 동굴(1-3 반딧불 동굴, 09 문서 3행 「남보라 #2B2350 + 수정 청록 #5EF2C8 발광 · 수정 점광원 6(LOW 2)」): 바위 기둥·벽 수정 무리(10개씩 묶음 모양)
  //   길 모드면 rail.dist 로 흘리고, 전투장이면 둘레에 고정. 어두울 때 나무·덤불·먼 산·잔디색을 숨기거나 바꿈
  const cave = new THREE.Group(); cave.visible = false; root.add(cave); const cr = rng(303);
  const pillarG = new THREE.CylinderGeometry(.7, 1.3, 9, 7); pillarG.translate(0, 4.5, 0); const stalG = new THREE.ConeGeometry(.45, 2.4, 6); stalG.rotateX(Math.PI); stalG.translate(0, 7.2, 0);
  const shardG = new THREE.OctahedronGeometry(.22, 0); shardG.scale(.55, 2.4, .55); shardG.translate(0, .45, 0);
  const caveRock = toon(0x2b2350), caveRock2 = toon(0x3a3060), shardM = new THREE.MeshBasicMaterial({ color: 0x5ef2c8 });
  const cp = []; for (let i = 0; i < 26; i++) { const side = i % 2 ? 1 : -1; cp.push([side * (4.4 + cr() * 3.8), (i / 26) * RL + cr() * 1.5, .8 + cr() * .6, cr()]); }
  const cs = []; for (let i = 0; i < 18; i++) { const side = i % 2 ? 1 : -1, base = [side * (3.7 + cr() * .8), (i / 18) * RL + cr() * 2]; for (let j = 0; j < 10; j++) cs.push([base[0] + Math.sin(j * 2.4) * .35, base[1] + Math.cos(j * 2.4) * .35, .6 + cr() * .7, cr(), side]); }
  const tilt = (d, s) => { d.rotation.set(Math.sin(s[3] * 9) * .35, s[3] * 9, -s[4] * (.2 + s[3] * .4)); };
  const caveRailM = [[pillarG, caveRock, cp, null], [stalG, caveRock2, cp, null], [shardG, shardM, cs, tilt]].map(([g, m, list, f]) => { const im = new THREE.InstancedMesh(g, m, list.length); im.userData = { list, f }; cave.add(im); return im; });
  const caveArena = new THREE.Group(); root.add(caveArena); caveArena.visible = false; const ap = [], as = [];
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; const R = 9 + cr() * 3; const x = Math.cos(a) * R, z = arenaZ - 2 + Math.sin(a) * R * 1.2; if (z < -3 && Math.abs(x) < 8) continue; ap.push([x, z, .9 + cr() * .6, cr()]); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + .2, R = 6.6 + cr() * 1.2, bx = Math.cos(a) * R, bz = arenaZ - 2 + Math.sin(a) * R; if (bz < -2 && Math.abs(bx) < 7) continue; for (let j = 0; j < 10; j++) as.push([bx + Math.sin(j * 2.4) * .4, bz + Math.cos(j * 2.4) * .4, .6 + cr() * .8, cr(), bx > 0 ? 1 : -1]); }
  const caveArenaM = [[pillarG, caveRock, ap, null], [stalG, caveRock2, ap, null], [shardG, shardM, as, tilt]].map(([g, m, list, f]) => { const im = new THREE.InstancedMesh(g, m, list.length); list.forEach((s, i) => { dummy.position.set(s[0], 0, s[1]); dummy.rotation.set(0, s[3] * 9, 0); dummy.scale.setScalar(s[2]); f && f(dummy, s); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); }); caveArena.add(im); return im; });
  // 수정 점광원 6(LOW 2) — 길에선 벽 수정 무리 자리와 함께 흐르고, 전투장에선 둘레 무리 자리에
  const caveLights = []; for (let i = 0; i < 6; i++) { const l = new THREE.PointLight(0x5ef2c8, 0, 9, 1.6); l.position.y = 1.2; l.visible = false; root.add(l); caveLights.push(l); }
  const lightRail = i => cs[(i * 3 % 18) * 10], lightArena = i => as[(i * 2 % 12) * 10] || as[0];
  const arenaTrees = meshes.slice(0, 5), mounts = root.children.filter(c => c.isMesh && c.material && c.material.isMeshBasicMaterial && c.geometry.type === 'ConeGeometry');
  const groundCol = ground.material.color.clone(), roadCol = roads[0].material.color.clone(); let dark = false, lightsN = 6;
  function layCave(dist){ for (const m of caveRailM) { const { list, f } = m.userData; list.forEach((s, i) => { dummy.position.set(s[0], 0, wrapZ(s[1], dist)); dummy.rotation.set(0, s[3] * 9, 0); dummy.scale.setScalar(s[2]); f && f(dummy, s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.instanceMatrix.needsUpdate = true; } }
  function placeLights(dist){ caveLights.forEach((l, i) => { const on = dark && i < lightsN; l.visible = on; l.intensity = on ? 2.2 : 0; if (!on) return; const s = mode === 'rail' ? lightRail(i) : lightArena(i); l.position.set(s[0] * .92, 1.2, mode === 'rail' ? wrapZ(s[1], dist) : s[1]); }); }
  const arenaOnly = [arena, ...meshes]; let mode = 'arena', lastDist = -1;
  let t = 0;
  return {
    /** mode 'arena'|'rail' + rail 스냅샷(world.rail) — 길이면 바닥·나무를 dist 로 흘린다 */
    setMode(m, r){ if (m !== mode) { mode = m; rail.visible = m === 'rail'; for (const o of arenaOnly) o.visible = m !== 'rail'; lastDist = -1; this.setDark(dark, true); }
      if (m === 'rail' && r && r.dist !== lastDist) { layRail(r.dist); if (dark) { layCave(r.dist); placeLights(r.dist); } lastDist = r.dist; } },
    /** v1.7 동굴 켜기/끄기 — 나무·덤불·먼 산 숨김, 바닥 남보라, 바위 기둥·수정 무리·점광원. 조명·안개는 index.js 가 맞춤 */
    setDark(on, force){ if (on === dark && !force) return; dark = !!on;
      cave.visible = dark && mode === 'rail'; caveArena.visible = dark && mode !== 'rail'; for (const m of rMeshes) m.visible = !dark; for (const m of arenaTrees) m.visible = !dark && mode !== 'rail'; for (const m of mounts) m.visible = !dark;
      ground.material.color.copy(groundCol).multiplyScalar(dark ? .28 : 1); if (dark) ground.material.color.lerp(new THREE.Color(0x2b2350), .35); for (const rd of roads) { rd.material.color.copy(roadCol).multiplyScalar(dark ? .45 : 1); } arena.material.opacity = dark ? .55 : 1;
      if (dark) { layCave(Math.max(0, lastDist)); } placeLights(Math.max(0, lastDist)); },
    update(dt){ t += dt; for (let i = 0; i < fireN; i++) { const s = seeds[i]; fp[i * 3] = s[0] + Math.sin(t * .4 + s[3]) * .8; fp[i * 3 + 1] = s[1] + Math.sin(t * .9 + s[3] * 2) * .3; fp[i * 3 + 2] = s[2] + Math.cos(t * .3 + s[3]) * .8; } fg.attributes.position.needsUpdate = true; },
    setQuality(q){ lightsN = q === 'low' ? 2 : 6; placeLights(Math.max(0, lastDist)); flies.visible = q !== 'low'; meshes.forEach(m => { m.castShadow = q === 'high' || (q === 'medium' && m.count < 140); }); rMeshes.forEach(m => { m.castShadow = q !== 'low'; }); },
    dispose(){ scene.remove(root); },
  };
}
