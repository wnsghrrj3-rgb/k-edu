// proto 스킨 — v2.13 월드 2 「도형의 신전」 지형(09 문서 5절 2·3·4행: 기둥 · 기하 무늬 바닥 · 떠 있는 다면체 · 회전하는 고리 · 위에서 내리는 빛 · 대리석 흰·금·청록).
// 배경만 — 판정·스냅샷과 무관. env.js 의 숲과 같은 자리(전투장 둘레 |x| ≥ 6, 뒤 z ≥ 17 / 길 모드는 rail.dist 로 흘림)를 신전 것으로 바꿔 끼운다.
// 16 문서 2절: 스킨은 보이는 모습만. 신전 켜고 끄기는 env.setWorld('temple') 하나.
import * as THREE from 'three';
import { toon } from './actors.js';
const COL = { marble: 0xf3efe6, marble2: 0xe4ddd0, gold: 0xd9b45a, gold2: 0xf0d27a, teal: 0x5ef2c8, teal2: 0x9fe8d8, line: 0x1e3a46 };
function rng(seed){ let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function marbleBase(g, w, h, r){ g.fillStyle = '#ebe6da'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 180; i++) { g.strokeStyle = `rgba(${150 + r() * 40},${140 + r() * 40},${125 + r() * 40},${.12 + r() * .14})`; g.lineWidth = 1 + r() * 2; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (r() - .5) * 90; y += (r() - .5) * 90; g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${.1 + r() * .25})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); } }
const GOLD = 'rgba(214,176,84,.9)', GOLD_SOFT = 'rgba(214,176,84,.45)', TEAL = 'rgba(94,242,200,.55)';
function poly(g, cx, cy, R, n, rot = -Math.PI / 2){ g.beginPath(); for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2; i ? g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R) : g.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); } g.closePath(); }
/** 바닥 타일: 대리석 + 금선 격자, 칸마다 △·□·○ 가 번갈아 — 멀리 반복해도 어지럽지 않게 선은 가늘게 */
export function templeGroundTex(){ const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = rng(23); marbleBase(g, 512, 512, r);
  g.strokeStyle = GOLD_SOFT; g.lineWidth = 3; for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 256, 0); g.lineTo(i * 256, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * 256); g.lineTo(512, i * 256); g.stroke(); }
  const shapes = [3, 4, 0, 4]; let k = 0; for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { const cx = x * 256 + 128, cy = y * 256 + 128, n = shapes[k++]; g.strokeStyle = GOLD_SOFT; g.lineWidth = 4; if (n) { poly(g, cx, cy, 70, n, n === 4 ? Math.PI / 4 : -Math.PI / 2); } else { g.beginPath(); g.arc(cx, cy, 64, 0, 7); } g.stroke(); g.strokeStyle = 'rgba(94,242,200,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 10, 0, 7); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
/** 전투장 원판: 기하 마법진(원 3겹 + 삼각·사각·육각 겹침) — 숲의 흙 원판 자리 */
export function templeArenaTex(){ const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = rng(29);
  const gr = g.createRadialGradient(256, 256, 40, 256, 256, 256); gr.addColorStop(0, 'rgba(250,247,240,1)'); gr.addColorStop(.7, 'rgba(240,234,222,.95)'); gr.addColorStop(1, 'rgba(236,230,216,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 400; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 215; g.fillStyle = `rgba(200,190,170,${.15 + r() * .2})`; g.fillRect(256 + Math.cos(a) * d, 256 + Math.sin(a) * d, 1 + r() * 3, 1 + r() * 2); }
  g.lineWidth = 5; g.strokeStyle = GOLD; for (const R of [200, 150]) { g.beginPath(); g.arc(256, 256, R, 0, 7); g.stroke(); }
  g.lineWidth = 3; g.strokeStyle = GOLD_SOFT; poly(g, 256, 256, 190, 3); g.stroke(); poly(g, 256, 256, 190, 3, Math.PI / 2); g.stroke(); poly(g, 256, 256, 150, 4, Math.PI / 4); g.stroke(); poly(g, 256, 256, 110, 6); g.stroke();
  g.strokeStyle = TEAL; g.lineWidth = 4; g.beginPath(); g.arc(256, 256, 60, 0, 7); g.stroke(); g.beginPath(); g.arc(256, 256, 6, 0, 7); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
/** 길 띠: 대리석 판 + 양 가장자리 금선 + 가운데 △□○ 문장(紋章)이 번갈아 — 숲 흙길 자리, 세로 4번 반복 */
export function templeRoadTex(){ const c = document.createElement('canvas'); c.width = 128; c.height = 512; const g = c.getContext('2d'), r = rng(31); marbleBase(g, 128, 512, r);
  g.strokeStyle = 'rgba(200,190,170,.5)'; g.lineWidth = 2; for (let y = 0; y <= 512; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(128, y); g.stroke(); }
  g.strokeStyle = GOLD; g.lineWidth = 5; for (const x of [6, 122]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  g.strokeStyle = GOLD_SOFT; g.lineWidth = 3; [3, 4, 0, 6].forEach((n, i) => { const cy = i * 128 + 64; if (n) poly(g, 64, cy, 30, n, n === 4 ? Math.PI / 4 : -Math.PI / 2); else { g.beginPath(); g.arc(64, cy, 28, 0, 7); } g.stroke(); });
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 4); t.colorSpace = THREE.SRGBColorSpace; return t; }

/**
 * 신전 지형. root 에 전투장 묶음(arena)·길 묶음(rail)을 더하고 둘 다 숨긴 채 돌려준다 — 켜고 끄기는 env.js 가 refreshVis 로.
 * @param {THREE.Group} root  @param {{arenaZ:number, RL:number, wrapZ:(z:number,dist:number)=>number}} o
 */
export function buildTemple(root, { arenaZ = 9, RL = 64, wrapZ } = {}){
  const r = rng(1024), dummy = new THREE.Object3D();
  const marble = toon(COL.marble), marble2 = toon(COL.marble2), gold = toon(COL.gold), teal = toon(COL.teal), teal2 = toon(COL.teal2);
  // ── 기둥(받침 + 세로 홈 몸통 + 금 머리): 전투장 양옆 두 줄 + 뒤 열주(한 단 높게). 카메라 앞(z < −3)은 비움
  const baseG = new THREE.BoxGeometry(1.1, .3, 1.1); baseG.translate(0, .15, 0);
  const shaftG = new THREE.CylinderGeometry(.34, .4, 5.0, 12); shaftG.translate(0, 2.8, 0);
  const capG = new THREE.BoxGeometry(1.0, .34, 1.0); capG.translate(0, 5.47, 0);
  const ringG = new THREE.TorusGeometry(.42, .06, 6, 14); ringG.rotateX(Math.PI / 2); ringG.translate(0, 5.25, 0);
  const pillars = []; for (let i = 0; i < 7; i++) for (const side of [-1, 1]) { pillars.push([side * 6.3, -1.5 + i * 3.3, 1, r()]); } for (let i = 0; i < 5; i++) for (const side of [-1, 1]) { pillars.push([side * 9.6, .2 + i * 4.4, .9, r()]); }
  const back = []; for (let i = -2; i <= 2; i++) back.push([i * 3.2, 19.6, 1.35, r()]);
  const inst = (geo, mat, list, parent, f) => { const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((s, i) => { dummy.position.set(s[0], 0, s[1]); dummy.rotation.set(0, 0, 0); dummy.scale.set(s[2], s[2], s[2]); f && f(dummy, s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const arena = new THREE.Group(); arena.visible = false; root.add(arena);
  const all = [...pillars, ...back];
  const colMeshes = [inst(baseG, marble2, all, arena), inst(shaftG, marble, all, arena), inst(capG, gold, all, arena), inst(ringG, gold, all, arena)];
  // 뒤 열주 위 인방(가로보)과 삼각 박공 — 「신전」 윤곽
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(15.2, .55, 1.2), marble2); lintel.position.set(0, 7.55, 19.6); lintel.castShadow = true; arena.add(lintel);
  const pedG = new THREE.CylinderGeometry(0, 7.0, 2.2, 3, 1); pedG.rotateY(Math.PI / 6); const ped = new THREE.Mesh(pedG, marble); ped.scale.set(1.1, 1, .18); ped.position.set(0, 8.9, 19.6); arena.add(ped);
  const eye = new THREE.Mesh(new THREE.OctahedronGeometry(.55, 0), new THREE.MeshBasicMaterial({ color: COL.teal })); eye.position.set(0, 8.7, 19.0); arena.add(eye);
  // 양옆 낮은 단(계단 두 겹) — 전투장 가장자리 경계가 눈에 보이게
  const stepG = new THREE.BoxGeometry(2.2, .22, 26); for (const side of [-1, 1]) { const s1 = new THREE.Mesh(stepG, marble2); s1.position.set(side * 5.2, .11, arenaZ - 1.5); s1.receiveShadow = true; arena.add(s1); const s2 = new THREE.Mesh(stepG, marble); s2.position.set(side * 6.0, .33, arenaZ - 1.5); s2.scale.x = .6; s2.receiveShadow = true; arena.add(s2); }
  // ── 떠 있는 다면체(청록·금) — 둘레 위 공중, 천천히 돌고 떠오름. 전투장 안(|x| < 5, z < 17)은 비움
  const polyG = [new THREE.OctahedronGeometry(.5, 0), new THREE.IcosahedronGeometry(.45, 0), new THREE.TetrahedronGeometry(.55, 0), new THREE.DodecahedronGeometry(.42, 0)];
  const fl = []; let guard = 0; while (fl.length < 28 && guard++ < 2000) { const x = (r() * 2 - 1) * 13, z = -2 + r() * 24; if (Math.abs(x) < 5.2 && z < 17.5) continue; fl.push([x, z, 2.6 + r() * 3.6, r(), fl.length % 4]); }
  const floaters = polyG.map((g, k) => { const list = fl.filter(s => s[4] === k); const m = new THREE.InstancedMesh(g, k % 2 ? gold : (k ? teal2 : teal), Math.max(1, list.length)); m.userData = { list }; m.count = list.length; m.castShadow = true; arena.add(m); return m; });
  // ── 회전하는 고리 3겹(금·청록) — 전투장 위 하늘, 기울어진 채 서로 다른 속도로
  const rings = [[4.2, COL.gold2, .22, .35], [5.8, COL.teal, -.16, -.3], [7.6, COL.gold, .1, .2]].map(([R, col, sp, tilt]) => { const m = new THREE.Mesh(new THREE.TorusGeometry(R, .07, 6, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .75 })); m.position.set(0, 9.5, arenaZ - 1); m.rotation.x = Math.PI / 2 + tilt; m.userData = { sp }; arena.add(m); return m; });
  // ── 위에서 내리는 빛줄기(09 문서 5절 3행) — 반투명 긴 판 6, 더하기 섞기
  const rayM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .11, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const rays = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1 + r() * .8, 16), rayM); m.position.set((r() * 2 - 1) * 4.5, 8, arenaZ - 4 + r() * 10); m.rotation.set(.18 + r() * .1, r() * Math.PI, (r() - .5) * .25); m.userData = { base: m.position.x, k: r() * 7 }; arena.add(m); rays.push(m); }
  // ── 먼 배경: 신전 단(층층이) + 먼 열주 그림자색 — 숲의 먼 산 자리
  const farM = new THREE.MeshBasicMaterial({ color: 0xcfd9d8, fog: true }), farM2 = new THREE.MeshBasicMaterial({ color: 0xbfcac9, fog: true });
  for (const [w, h, z, x] of [[60, 3, 36, 0], [44, 3, 40, 0], [30, 3, 44, 0], [10, 9, 45, 0], [8, 7, 43, -22], [8, 7, 43, 22]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 6), z > 42 ? farM2 : farM); m.position.set(x, h / 2 + (w < 20 ? 7 : 0), z); arena.add(m); }
  const farCol = new THREE.CylinderGeometry(.5, .6, 9, 7); farCol.translate(0, 4.5, 0); const fc = []; for (let i = -7; i <= 7; i++) fc.push([i * 3.6, 46, 1.2, 0]); inst(farCol, farM2, fc, arena);
  // ── 길 모드: 기둥 두 줄·떠 있는 다면체를 rail.dist 로 흘림(숲 나무 두 줄과 같은 꼴)
  const rail = new THREE.Group(); rail.visible = false; root.add(rail); const rr = rng(2048);
  const rp = []; for (let i = 0; i < 20; i++) { const side = i % 2 ? 1 : -1; rp.push([side * (5.0 + (i % 4 < 2 ? 0 : 3.2)), (i / 20) * RL + rr() * .4, .95 + rr() * .15, rr()]); }
  const railCols = [[baseG, marble2], [shaftG, marble], [capG, gold], [ringG, gold]].map(([g, m]) => { const im = new THREE.InstancedMesh(g, m, rp.length); im.userData = { list: rp }; im.castShadow = true; im.receiveShadow = true; rail.add(im); return im; });
  const rf = []; for (let i = 0; i < 24; i++) rf.push([(i % 2 ? 1 : -1) * (4.2 + rr() * 5), (i / 24) * RL + rr() * 2, 2.4 + rr() * 3.4, rr(), i % 4]);
  const railFloat = polyG.map((g, k) => { const list = rf.filter(s => s[4] === k); const im = new THREE.InstancedMesh(g, k % 2 ? gold : teal, Math.max(1, list.length)); im.count = list.length; im.userData = { list }; rail.add(im); return im; });
  const curbG = new THREE.BoxGeometry(.5, .18, RL); const curbs = [0, 1].flatMap(i => [-1, 1].map(side => { const m = new THREE.Mesh(curbG, gold); m.position.set(side * 3.75, .09, i * RL); m.receiveShadow = true; rail.add(m); return m; }));
  let t = 0, lastDist = 0;
  function setFloat(m, dist){ const { list } = m.userData; list.forEach((s, i) => { const z = dist == null ? s[1] : wrapZ(s[1], dist); dummy.position.set(s[0], s[2] + Math.sin(t * .7 + s[3] * 9) * .35, z); dummy.rotation.set(t * .3 + s[3], t * .45 + s[3] * 5, 0); dummy.scale.setScalar(.8 + s[3] * .6); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.instanceMatrix.needsUpdate = true; }
  return {
    arena, rail,
    layRail(dist){ lastDist = dist; for (const m of railCols) { const { list } = m.userData; list.forEach((s, i) => { dummy.position.set(s[0], 0, wrapZ(s[1], dist)); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(s[2]); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.instanceMatrix.needsUpdate = true; }
      curbs.forEach((m, i) => { m.position.z = wrapZ((i >> 1) * RL + RL / 2, dist); }); for (const m of railFloat) setFloat(m, dist); },
    update(dt){ t += dt; if (arena.visible) { for (const m of floaters) setFloat(m, null); rings.forEach(m => { m.rotation.z += dt * m.userData.sp; }); eye.rotation.y += dt * .8; for (const m of rays) { m.position.x = m.userData.base + Math.sin(t * .25 + m.userData.k) * .6; m.material.opacity = .09 + Math.sin(t * .5 + m.userData.k) * .03; } }
      if (rail.visible) { for (const m of railFloat) setFloat(m, lastDist); } },
    setQuality(q){ for (const m of [...colMeshes, ...railCols]) m.castShadow = q !== 'low'; for (const m of [...floaters, ...railFloat]) m.castShadow = q === 'high'; rays.forEach(m => { m.visible = q !== 'low'; }); },
  };
}
