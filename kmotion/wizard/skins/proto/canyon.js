// proto 스킨 — v3.3 월드 3 「측정의 협곡」 지형(09 문서 5절 W3 2·3·4행: 절벽 · 출렁다리 · 톱니 기계 · 물레방아 · 붉은 흙 · 폭포 흰 물 · 황혼 주황 · 폭포 입자 · 톱니 회전 · 모래 바람).
// 배경만 — 판정·스냅샷과 무관. temple.js 와 같은 틀: env.js 의 숲 자리(전투장 둘레 |x| ≥ 6, 뒤 z ≥ 17 / 길 모드는 rail.dist 로 흘림)를 협곡 것으로 바꿔 끼운다.
// 켜고 끄기는 env.setWorld('canyon') 하나. 17 문서 2절 「안 들어감 → 2차 ④ 협곡 지형」.
import * as THREE from 'three';
import { toon } from './actors.js';
const COL = { rock: 0xb8623a, rock2: 0x9c4e2e, rock3: 0xd8864f, rock4: 0x7a3a22, sand: 0xe0a068, wood: 0x8a5a33, wood2: 0x6b4426, rope: 0xd9c18a, iron: 0x5a4a44, iron2: 0x7a6a5e, water: 0xeaf6ff, mist: 0xffffff };
function rng(seed){ let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function dirtBase(g, w, h, r){ g.fillStyle = '#b8623a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2200; i++) { g.fillStyle = `hsl(${14 + r() * 12},${50 + r() * 20}%,${34 + r() * 18}%)`; g.fillRect(r() * w, r() * h, 2 + r() * 4, 2 + r() * 4); }
  g.strokeStyle = 'rgba(70,30,15,.35)'; for (let i = 0; i < 70; i++) { g.lineWidth = 1 + r() * 1.5; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (r() - .5) * 70; y += (r() - .5) * 70; g.lineTo(x, y); } g.stroke(); } }
/** 바닥 타일: 붉은 흙 + 마른 금(갈라짐) + 잔돌 */
export function canyonGroundTex(){ const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = rng(41); dirtBase(g, 512, 512, r);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(${150 + r() * 60},${90 + r() * 40},${60 + r() * 30},.6)`; g.beginPath(); g.arc(r() * 512, r() * 512, 1.5 + r() * 3, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 12); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
/** 전투장 원판: 모래 바닥 + 돌 테두리 두 겹(측정 눈금처럼 짧은 금이 돌아감) */
export function canyonArenaTex(){ const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = rng(43);
  const gr = g.createRadialGradient(256, 256, 40, 256, 256, 256); gr.addColorStop(0, 'rgba(230,180,120,1)'); gr.addColorStop(.72, 'rgba(214,160,104,.95)'); gr.addColorStop(1, 'rgba(200,140,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 700; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 210; g.fillStyle = `rgba(${150 + r() * 70},${100 + r() * 50},${60 + r() * 30},.4)`; g.fillRect(256 + Math.cos(a) * d, 256 + Math.sin(a) * d, 1 + r() * 3, 1 + r() * 3); }
  g.lineWidth = 7; g.strokeStyle = 'rgba(122,58,34,.75)'; g.beginPath(); g.arc(256, 256, 198, 0, 7); g.stroke(); g.lineWidth = 3; g.strokeStyle = 'rgba(122,58,34,.45)'; g.beginPath(); g.arc(256, 256, 150, 0, 7); g.stroke();
  g.strokeStyle = 'rgba(90,40,20,.6)'; g.lineWidth = 3; for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, L = i % 6 ? 10 : 20; g.beginPath(); g.moveTo(256 + Math.cos(a) * 198, 256 + Math.sin(a) * 198); g.lineTo(256 + Math.cos(a) * (198 - L), 256 + Math.sin(a) * (198 - L)); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
/** 길 띠: 모래 길 + 양 가장자리 잔돌 + 가끔 널빤지 건널목 — 세로 4번 반복 */
export function canyonRoadTex(){ const c = document.createElement('canvas'); c.width = 128; c.height = 512; const g = c.getContext('2d'), r = rng(47);
  g.fillStyle = '#e0a068'; g.fillRect(0, 0, 128, 512); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${170 + r() * 60},${110 + r() * 50},${70 + r() * 30},.5)`; g.fillRect(r() * 128, r() * 512, 1 + r() * 3, 1 + r() * 3); }
  for (let i = 0; i < 90; i++) { const x = r() < .5 ? r() * 12 : 116 + r() * 12; g.fillStyle = `rgba(${120 + r() * 50},${60 + r() * 30},${35 + r() * 20},.8)`; g.beginPath(); g.arc(x, r() * 512, 2 + r() * 3, 0, 7); g.fill(); }
  for (const y of [120, 376]) { for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? '#8a5a33' : '#9a6a3d'; g.fillRect(8, y + k * 9, 112, 7); } g.fillStyle = 'rgba(60,30,15,.5)'; g.fillRect(8, y - 2, 112, 2); g.fillRect(8, y + 45, 112, 2); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 4); t.colorSpace = THREE.SRGBColorSpace; return t; }

/** 톱니 기하: 원판 + 이 n 개를 한 BufferGeometry 로 합침(BufferGeometryUtils 없이 position·normal 이어 붙임) */
function gearGeo(R = 1, teeth = 8, thick = .3){ const parts = [new THREE.CylinderGeometry(R, R, thick, 16).toNonIndexed()];
  const hub = new THREE.CylinderGeometry(R * .22, R * .22, thick * 1.6, 10).toNonIndexed(); parts.push(hub);
  for (let i = 0; i < teeth; i++) { const t = new THREE.BoxGeometry(R * .55, thick, R * .34).toNonIndexed(); t.translate(R + R * .22, 0, 0); t.rotateY(i / teeth * Math.PI * 2); parts.push(t); }
  let n = 0; for (const p of parts) n += p.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  for (const p of parts) { pos.set(p.attributes.position.array, o); nor.set(p.attributes.normal.array, o); o += p.attributes.position.array.length; p.dispose(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.rotateX(Math.PI / 2); return g; }
/** 물레방아: 바퀴 테 + 살 + 날개 판 */
function waterWheel(R = 1.6){ const g = new THREE.Group(); const rim = new THREE.Mesh(new THREE.TorusGeometry(R, .12, 6, 20), toon(COL.wood2)); g.add(rim);
  const spokeG = new THREE.BoxGeometry(.12, R * 2, .12), padG = new THREE.BoxGeometry(.9, .55, .08); for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(spokeG, toon(COL.wood)); s.rotation.z = i / 6 * Math.PI; g.add(s); }
  for (let i = 0; i < 12; i++) { const p = new THREE.Mesh(padG, toon(COL.wood)); const a = i / 12 * Math.PI * 2; p.position.set(Math.cos(a) * R, Math.sin(a) * R, 0); p.rotation.z = a; g.add(p); } return g; }
/** 출렁다리: 양 끝 기둥 2쌍 + 늘어진 밧줄 2 + 널빤지 */
function ropeBridge(x0, x1, y, z, sag = 1.2, r = Math.random){ const g = new THREE.Group(); const wood = toon(COL.wood), rope = toon(COL.rope);
  const postG = new THREE.CylinderGeometry(.13, .16, 2.2, 7); for (const x of [x0, x1]) for (const dz of [-.6, .6]) { const p = new THREE.Mesh(postG, toon(COL.wood2)); p.position.set(x, y + 1.0, z + dz); p.castShadow = true; g.add(p); }
  const pts = n => { const a = []; for (let i = 0; i <= n; i++) { const k = i / n; a.push(new THREE.Vector3(x0 + (x1 - x0) * k, y - Math.sin(k * Math.PI) * sag, z)); } return a; };
  for (const dz of [-.6, .6]) for (const dy of [.95, 0]) { const c = new THREE.CatmullRomCurve3(pts(10).map(p => new THREE.Vector3(p.x, p.y + dy, p.z + dz))); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 14, .035, 5, false), rope); g.add(m); }
  const n = Math.max(3, Math.round(Math.abs(x1 - x0) / .55)), plankG = new THREE.BoxGeometry(.42, .07, 1.3), planks = new THREE.InstancedMesh(plankG, wood, n), d = new THREE.Object3D();
  for (let i = 0; i < n; i++) { const k = (i + .5) / n; d.position.set(x0 + (x1 - x0) * k, y - Math.sin(k * Math.PI) * sag + .04, z); d.rotation.set((r() - .5) * .12, 0, (r() - .5) * .08); d.updateMatrix(); planks.setMatrixAt(i, d.matrix); } planks.castShadow = true; g.add(planks);
  return g; }

/**
 * 협곡 지형. root 에 전투장 묶음(arena)·길 묶음(rail)을 더하고 둘 다 숨긴 채 돌려준다 — 켜고 끄기는 env.js 가 refreshVis 로.
 * @param {THREE.Group} root  @param {{arenaZ:number, RL:number, wrapZ:(z:number,dist:number)=>number}} o
 */
export function buildCanyon(root, { arenaZ = 9, RL = 64, wrapZ } = {}){
  const r = rng(3001), dummy = new THREE.Object3D(), lc = new THREE.Color();
  const rockM = toon(COL.rock), rockM2 = toon(COL.rock2), rockM3 = toon(COL.rock3), ironM = toon(COL.iron), ironM2 = toon(COL.iron2);
  const strata = [COL.rock, COL.rock2, COL.rock3, COL.rock4, COL.rock];
  // ── 절벽: 납작한 바위 판을 층층이 쌓음(지층 색 번갈아) — 전투장 양옆 |x| ≥ 6.5 · 뒤 z ≥ 18. 카메라 앞(z < −3)은 비움
  const slabG = new THREE.BoxGeometry(3.4, 1.0, 3.0); slabG.translate(0, .5, 0);
  const stacks = []; let guard = 0; while (stacks.length < 46 && guard++ < 3000) { const x = (r() * 2 - 1) * 20, z = -4 + r() * 30; if (Math.abs(x) < 6.8 && z < 18) continue; if (z < -2 && Math.abs(x) < 11) continue; if (stacks.some(s => Math.hypot(s[0] - x, s[1] - z) < 2.9)) continue; stacks.push([x, z, 3 + Math.floor(r() * 5) + (Math.abs(x) > 12 || z > 20 ? 3 : 0), r()]); }
  const slabs = []; for (const s of stacks) for (let k = 0; k < s[2]; k++) slabs.push([s[0] + Math.sin(s[3] * 9 + k) * .35, s[1] + Math.cos(s[3] * 7 + k) * .3, k, .85 + Math.sin(s[3] * 5 + k * 1.3) * .2, s[3] * 9 + k * .15, k % 5]);
  function slabMesh(list, parent, zOf){ const m = new THREE.InstancedMesh(slabG, rockM, list.length); list.forEach((s, i) => { dummy.position.set(s[0], s[2] * 1.0, zOf ? zOf(s) : s[1]); dummy.rotation.set(0, s[4], 0); dummy.scale.set(s[3], 1, s[3] * .95); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); lc.set(strata[s[5]]); lc.offsetHSL(0, 0, (Math.sin(s[4] * 3) * .04)); m.setColorAt(i, lc); }); if (m.instanceColor) m.instanceColor.needsUpdate = true; m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
  const arena = new THREE.Group(); arena.visible = false; root.add(arena);
  const arenaSlabs = slabMesh(slabs, arena);
  // ── 뒤 폭포: 절벽 사이 흰 물기둥(반투명 판 2겹) + 떨어지는 입자 + 아래 못·물안개
  const WF = { x: 0, z: 21.5, top: 9.5 };
  const waterM = new THREE.MeshBasicMaterial({ color: COL.water, transparent: true, opacity: .55, depthWrite: false, fog: true });
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(2.6, WF.top), waterM); fall.position.set(WF.x, WF.top / 2, WF.z - .2); arena.add(fall);
  const fall2 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, WF.top), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5, depthWrite: false, fog: true })); fall2.position.set(WF.x + .2, WF.top / 2, WF.z - .25); arena.add(fall2);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(3.2, 20), new THREE.MeshBasicMaterial({ color: 0x8fd4f0, transparent: true, opacity: .6, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(WF.x, .03, WF.z - 1.6); arena.add(pool);
  const mistM = new THREE.MeshBasicMaterial({ color: COL.mist, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: true });
  const mists = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2 + i, 1.6), mistM); m.position.set(WF.x + (i - 1) * .9, .9 + i * .4, WF.z - 2.2); m.userData = { k: r() * 7, base: m.position.x }; arena.add(m); mists.push(m); }
  const dropN = 160, dp = new Float32Array(dropN * 3), ds = []; for (let i = 0; i < dropN; i++) { ds.push([WF.x + (r() * 2 - 1) * 1.4, r() * WF.top, WF.z - .35 + (r() - .5) * .3, 2.6 + r() * 2.4]); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const drops = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffffff, size: .12, transparent: true, opacity: .85, depthWrite: false })); drops.frustumCulled = false; arena.add(drops);
  // ── 물레방아(폭포 옆, 폭포 쪽으로 돌아감) + 톱니 기계(옆 절벽 벽에 박힌 큰 톱니 3, 서로 맞물려 반대로 돎)
  const wheel = waterWheel(1.7); wheel.position.set(WF.x + 3.2, 1.9, WF.z - 1.2); arena.add(wheel);
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 1.6, 8), ironM); axle.rotation.x = Math.PI / 2; axle.position.copy(wheel.position); arena.add(axle);
  const gearBig = gearGeo(1.3, 10, .35), gearSmall = gearGeo(.75, 7, .3);
  const gears = [[-7.6, 4.2, 15.5, gearBig, .35, ironM], [-7.9, 6.3, 14.2, gearSmall, -.35 * 1.3 / .75, ironM2], [7.6, 3.6, 11.5, gearBig, -.28, ironM], [7.9, 5.6, 13.0, gearSmall, .28 * 1.3 / .75, ironM2]].map(([x, y, z, G, sp, M]) => { const m = new THREE.Mesh(G, M); m.position.set(x, y, z); m.rotation.y = Math.PI / 2; m.castShadow = true; m.userData = { sp }; arena.add(m); return m; });
  // ── 출렁다리: 전투장 위 하늘을 가로지름(양옆 절벽 꼭대기 사이) — 판정과 무관, y 7.4
  const bridge = ropeBridge(-7.2, 7.2, 7.4, arenaZ + 7, 1.3, r); arena.add(bridge);
  // ── 모래 바람: 낮게 흘러가는 모래 알갱이(Points) — 바람 방향 +x, 전투장 위 얇게
  const sandN = 90, sp = new Float32Array(sandN * 3), ss = []; for (let i = 0; i < sandN; i++) ss.push([(r() * 2 - 1) * 12, .2 + r() * 1.6, -3 + r() * 24, r() * 7, 1.5 + r() * 1.5]);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sand = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xf2c48a, size: .07, transparent: true, opacity: .7, depthWrite: false })); sand.frustumCulled = false; arena.add(sand);
  // ── 먼 배경: 평평한 메사(탁상 산) 두 겹 — 숲의 먼 산 자리, 황혼빛
  const farM = new THREE.MeshBasicMaterial({ color: 0xd98a5c, fog: true }), farM2 = new THREE.MeshBasicMaterial({ color: 0xc27048, fog: true });
  for (const [w, h, z, x] of [[26, 9, 50, -30], [18, 12, 52, -8], [22, 10, 54, 14], [28, 8, 50, 36], [14, 14, 44, -20], [12, 11, 46, 24]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(w * .42, w * .5, h, 6), z > 48 ? farM : farM2); m.position.set(x, h / 2, z); arena.add(m); }
  // ── 길 모드: 절벽 두 줄·톱니·가끔 출렁다리(머리 위)를 rail.dist 로 흘림(숲 나무 두 줄과 같은 꼴). 양 가장자리 돌 연석
  const rail = new THREE.Group(); rail.visible = false; root.add(rail); const rr = rng(3002);
  const rst = []; for (let i = 0; i < 34; i++) { const side = i % 2 ? 1 : -1; rst.push([side * (5.6 + (i % 4 < 2 ? 0 : 3.3)), (i / 34) * RL + rr() * 1.2, 2 + Math.floor(rr() * 4) + (i % 4 < 2 ? 0 : 2), rr()]); }
  const rslabs = []; for (const s of rst) for (let k = 0; k < s[2]; k++) rslabs.push([s[0] + Math.sin(s[3] * 9 + k) * .3, s[1], k, .85 + Math.sin(s[3] * 5 + k * 1.3) * .2, s[3] * 9 + k * .15, k % 5]);
  const railSlabs = slabMesh(rslabs, rail); railSlabs.userData = { list: rslabs };
  const curbG = new THREE.BoxGeometry(.55, .22, RL); const curbs = [0, 1].flatMap(i => [-1, 1].map(side => { const m = new THREE.Mesh(curbG, rockM2); m.position.set(side * 3.85, .11, i * RL); m.receiveShadow = true; rail.add(m); return m; }));
  const railGears = [[-6.1, 3.2, 12, gearBig, .4], [6.1, 2.6, 40, gearSmall, -.6], [-6.2, 2.4, 54, gearSmall, .55]].map(([x, y, z0, G, sp]) => { const m = new THREE.Mesh(G, ironM); m.position.set(x, y, z0); m.rotation.y = Math.PI / 2; m.castShadow = true; m.userData = { z0, sp }; rail.add(m); return m; });
  const railBridges = [ropeBridge(-6.0, 6.0, 6.2, 26, 1.1, rr), ropeBridge(-6.0, 6.0, 6.8, 58, 1.3, rr)]; railBridges.forEach((b, i) => { b.userData = { z0: i ? 58 : 26 }; rail.add(b); });
  // 길 옆 작은 폭포(한쪽 절벽에서) + 입자 — 길 z0 44 에 고정, dist 로 흘림
  const sideFall = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 5), waterM); sideFall.position.set(-5.3, 2.5, 44); sideFall.rotation.y = Math.PI / 2; sideFall.userData = { z0: 44 }; rail.add(sideFall);
  const rdN = 60, rdp = new Float32Array(rdN * 3), rds = []; for (let i = 0; i < rdN; i++) rds.push([-5.2 + (rr() - .5) * .4, rr() * 5, 44 + (rr() * 2 - 1) * .5, 2.4 + rr() * 2]);
  const rdg = new THREE.BufferGeometry(); rdg.setAttribute('position', new THREE.BufferAttribute(rdp, 3)); const railDrops = new THREE.Points(rdg, drops.material); railDrops.frustumCulled = false; rail.add(railDrops);
  let t = 0, lastDist = 0;
  return {
    arena, rail,
    layRail(dist){ lastDist = dist; const { list } = railSlabs.userData; list.forEach((s, i) => { dummy.position.set(s[0], s[2] * 1.0, wrapZ(s[1], dist)); dummy.rotation.set(0, s[4], 0); dummy.scale.set(s[3], 1, s[3] * .95); dummy.updateMatrix(); railSlabs.setMatrixAt(i, dummy.matrix); }); railSlabs.instanceMatrix.needsUpdate = true;
      curbs.forEach((m, i) => { m.position.z = wrapZ((i >> 1) * RL + RL / 2, dist); }); for (const m of railGears) m.position.z = wrapZ(m.userData.z0, dist); for (const b of railBridges) b.position.z = wrapZ(b.userData.z0, dist) - b.userData.z0; sideFall.position.z = wrapZ(sideFall.userData.z0, dist); },
    update(dt){ t += dt;
      if (arena.visible) { for (let i = 0; i < dropN; i++) { const s = ds[i]; s[1] -= s[3] * dt; if (s[1] < 0) s[1] += WF.top; dp[i * 3] = s[0] + Math.sin(t * 3 + i) * .05; dp[i * 3 + 1] = s[1]; dp[i * 3 + 2] = s[2]; } dg.attributes.position.needsUpdate = true;
        for (let i = 0; i < sandN; i++) { const s = ss[i]; s[0] += s[4] * dt; if (s[0] > 13) s[0] = -13; sp[i * 3] = s[0]; sp[i * 3 + 1] = s[1] + Math.sin(t * 2 + s[3]) * .15; sp[i * 3 + 2] = s[2] + Math.sin(t * .7 + s[3]) * .4; } sg.attributes.position.needsUpdate = true;
        wheel.rotation.z -= dt * .9; for (const g of gears) g.rotation.x += dt * g.userData.sp; for (const m of mists) { m.position.x = m.userData.base + Math.sin(t * .6 + m.userData.k) * .5; m.material.opacity = .16 + Math.sin(t * .9 + m.userData.k) * .06; } }
      if (rail.visible) { for (const g of railGears) g.rotation.x += dt * g.userData.sp; for (let i = 0; i < rdN; i++) { const s = rds[i]; s[1] -= s[3] * dt; if (s[1] < 0) s[1] += 5; rdp[i * 3] = s[0]; rdp[i * 3 + 1] = s[1]; rdp[i * 3 + 2] = wrapZ(s[2], lastDist); } rdg.attributes.position.needsUpdate = true; } },
    setQuality(q){ for (const m of [arenaSlabs, railSlabs]) m.castShadow = q !== 'low'; for (const m of [...gears, ...railGears]) m.castShadow = q === 'high'; drops.visible = sand.visible = railDrops.visible = q !== 'low'; mists.forEach(m => { m.visible = q !== 'low'; }); },
  };
}
