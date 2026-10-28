// hq 스킨 — 「마법의 숲」 배경(2-2절). 판정과 무관한 배경만. 전투장 폭 = arenaHalfX 4m(+여유), 길 폭 ±2.6
// 나무·덤불·풀·꽃·바위 = Quaternius Ultimate Nature Pack GLB(CC0) 인스턴싱 · 지형은 길·전투장 밖에서만 솟음 · 빛줄기·반딧불·낙엽·고대 유적·마법 수정
// 좌표는 Three 그대로(배경이라 좌우 대칭 — WX 필요 없음). GLB 가 없으면 proto 의 절차적 숲으로 대체(buildForest 가 proto 것을 돌려줌)
import * as THREE from 'three';
import { buildForest as protoForest } from '../proto/env.js';
import { toon, textSprite } from '../proto/actors.js';
import { loadStatic, instanced, relay, stylized } from './loader.js';
function rng(seed){ let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ── 에셋 묶음(load 에서 한 번)
export const E = { trees: [], pines: [], birch: [], bush: [], grass: [], flowers: null, rocks: [], stump: null, mush: [], crystal: [], ready: false, ok: false };
export async function prepareEnv(progress){
  const want = [
    ['trees', 'CommonTree_1', 6.5], ['trees', 'CommonTree_2', 7], ['trees', 'CommonTree_3', 5.5], ['trees', 'CommonTree_5', 6], ['pines', 'PineTree_1', 8], ['pines', 'PineTree_3', 9], ['birch', 'BirchTree_1', 6], ['birch', 'BirchTree_4', 7],
    ['bush', 'Bush_1', .9], ['bush', 'Bush_2', .8], ['bush', 'BushBerries_1', .9], ['grass', 'Grass', .45], ['grass', 'Grass_2', .4], ['flowers', 'Flowers', .35], ['rocks', 'Rock_1', .5], ['rocks', 'Rock_4', .7], ['rocks', 'Rock_Moss_2', .6], ['rocks', 'Rock_Moss_4', .8],
    ['stump', 'TreeStump_Moss', .5], ['mush', 'Mushroom_1', .4], ['mush', 'Mushroom_3', .5], ['crystal', 'Crystal2', 1.2], ['crystal', 'Crystal5', .8] ];
  let n = 0; await Promise.all(want.map(([k, name, h]) => loadStatic(name, { height: h }).then(d => { if (d) { if (Array.isArray(E[k])) E[k].push(d); else E[k] = d; } progress && progress(++n / want.length); })));
  E.ready = true; E.ok = E.trees.length > 0 && E.grass.length > 0;
}

function grassTex(){ const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'), r = rng(7);
  g.fillStyle = '#4e8a36'; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 9000; i++) { const x = r() * 1024, y = r() * 1024, l = 30 + r() * 22; g.fillStyle = `hsl(${88 + r() * 30},${38 + r() * 20}%,${l}%)`; g.beginPath(); g.ellipse(x, y, 3 + r() * 9, 2 + r() * 4, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 2400; i++) { const x = r() * 1024, y = r() * 1024; g.strokeStyle = `hsla(${95 + r() * 25},55%,${40 + r() * 25}%,.55)`; g.lineWidth = 1 + r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y - 4 - r() * 10); g.stroke(); }
  for (let i = 0; i < 260; i++) { g.fillStyle = r() < .5 ? '#f6e07a' : r() < .5 ? '#ffffff' : '#ffb0c8'; g.beginPath(); g.arc(r() * 1024, r() * 1024, 1.2 + r() * 1.6, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(18, 18); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function arenaTex(){ const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'), r = rng(11);
  const gr = g.createRadialGradient(512, 512, 120, 512, 512, 512); gr.addColorStop(0, 'rgba(150,118,80,1)'); gr.addColorStop(.7, 'rgba(136,106,70,.96)'); gr.addColorStop(1, 'rgba(120,96,64,0)'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 420, x = 512 + Math.cos(a) * d, y = 512 + Math.sin(a) * d; g.fillStyle = `rgba(${80 + r() * 70},${60 + r() * 45},${40 + r() * 30},.5)`; g.beginPath(); g.ellipse(x, y, 1 + r() * 5, 1 + r() * 3, r() * 3, 0, 7); g.fill(); }
  // 마법진: 두 고리 + 룬 점 + 별
  g.strokeStyle = 'rgba(190,160,255,.55)'; g.lineWidth = 9; g.beginPath(); g.arc(512, 512, 300, 0, 7); g.stroke(); g.lineWidth = 4; g.beginPath(); g.arc(512, 512, 270, 0, 7); g.stroke();
  g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 4 / 5; g.lineTo(512 + Math.cos(a) * 270, 512 + Math.sin(a) * 270); } g.closePath(); g.lineWidth = 5; g.stroke();
  g.fillStyle = 'rgba(220,200,255,.7)'; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.beginPath(); g.arc(512 + Math.cos(a) * 285, 512 + Math.sin(a) * 285, 5, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function roadTex(){ const c = document.createElement('canvas'); c.width = 256; c.height = 1024; const g = c.getContext('2d'), q = rng(5);
  g.fillStyle = '#8f6f4c'; g.fillRect(0, 0, 256, 1024);
  for (let i = 0; i < 2400; i++) { g.fillStyle = `rgba(${100 + q() * 70},${75 + q() * 45},${48 + q() * 30},.55)`; g.beginPath(); g.ellipse(q() * 256, q() * 1024, 1 + q() * 4, 1 + q() * 3, q() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(${150 + q() * 60},${140 + q() * 50},${125 + q() * 40},.75)`; g.beginPath(); g.ellipse(40 + q() * 176, q() * 1024, 3 + q() * 5, 2 + q() * 4, q() * 3, 0, 7); g.fill(); }   // 자갈
  g.fillStyle = 'rgba(78,138,54,.7)'; for (let i = 0; i < 160; i++) { const x = q() < .5 ? q() * 34 : 222 + q() * 34; g.beginPath(); g.ellipse(x, q() * 1024, 4 + q() * 9, 3 + q() * 5, q() * 3, 0, 7); g.fill(); }   // 길가 풀
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 4); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function dotTex(){ const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,250,200,.8)'); gr.addColorStop(1, 'rgba(255,240,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function leafTex(){ const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); g.fillStyle = '#9fd07a'; g.beginPath(); g.ellipse(16, 16, 13, 7, .7, 0, 7); g.fill(); g.strokeStyle = '#4e8a36'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(5, 24); g.lineTo(27, 8); g.stroke(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

// 지형 높이: 길·전투장(|x| < 5.5)은 0, 옆으로 갈수록 언덕(길 모드에서도 지형은 고정 — 흘러가는 나무는 relay 때 hill 로 높이를 맞춘다)
function hill(x, z){ const k = smooth(5.5, 10, Math.abs(x)); if (k <= 0) return 0;
  const n = Math.sin(x * .21) * Math.cos(z * .17) * 1.3 + Math.sin(x * .07 + z * .11) * 2.2 + Math.sin(x * .5 + 1.3) * Math.sin(z * .43) * .5; return Math.max(0, n + 1.8) * k; }

export function buildForest(scene, { arenaZ = 9 } = {}){
  if (!E.ok) { const f = protoForest(scene, { arenaZ }); f.hq = false; return f; }
  const root = new THREE.Group(); scene.add(root); const r = rng(42), dummy = new THREE.Object3D(), pick = arr => arr[Math.floor(r() * arr.length)];
  // ── 하늘 돔(안개 영향 없음) — 위 푸른 하늘, 지평선 따뜻한 빛
  const sky = new THREE.Mesh(new THREE.SphereGeometry(95, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x6fb6f0) }, mid: { value: new THREE.Color(0xcfe9f7) }, hor: { value: new THREE.Color(0xfbe7c2) }, dark: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 hor; uniform float dark; varying vec3 vP; void main(){ float h = clamp(vP.y, 0.0, 1.0); vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.7, h)); c = mix(c, vec3(0.07, 0.05, 0.15), dark); gl_FragColor = vec4(c, 1.0); }' }));
  sky.position.y = -5; root.add(sky);
  // ── 지형(언덕은 길·전투장 밖) + 잔디 텍스처 + 정점색(움푹한 곳 어둡게)
  const gg = new THREE.PlaneGeometry(170, 170, 110, 110); gg.rotateX(-Math.PI / 2); gg.translate(0, 0, 20);
  { const p = gg.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(); for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = hill(x, z); p.setY(i, h); c.setHSL(.27 + (r() - .5) * .02, .45, .5 + Math.min(.12, h * .03) - (Math.abs(x) < 5.5 ? .04 : 0)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } gg.setAttribute('color', new THREE.BufferAttribute(col, 3)); gg.computeVertexNormals(); }
  const gTex = grassTex(); const ground = new THREE.Mesh(gg, new THREE.MeshStandardMaterial({ map: gTex, vertexColors: true, roughness: 1, metalness: 0 })); ground.receiveShadow = true; root.add(ground);
  // ── 전투장 바닥(흙 + 마법진) + 빛나는 룬 고리
  const arena = new THREE.Mesh(new THREE.PlaneGeometry(16, 22), new THREE.MeshStandardMaterial({ map: arenaTex(), transparent: true, depthWrite: false, roughness: 1 })); arena.rotation.x = -Math.PI / 2; arena.position.set(0, .012, arenaZ - 3); arena.receiveShadow = true; root.add(arena);
  const rune = new THREE.Mesh(new THREE.RingGeometry(4.55, 4.75, 72), new THREE.MeshBasicMaterial({ color: 0xb28cff, transparent: true, opacity: .35, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); rune.rotation.x = -Math.PI / 2; rune.position.set(0, .03, arenaZ - 3); rune.scale.set(1, 22 / 16 * .97, 1); root.add(rune);
  // ── 숲(전투장 모드): 양옆·뒤 — 카메라 앞(z < −4)은 비움. 종류를 섞고 크기·기울기 다르게, 언덕 높이에 얹음
  const place = (n, test, minD) => { const out = []; let guard = 0; while (out.length < n && guard++ < 9000) { const x = (r() * 2 - 1) * 46, z = -10 + r() * 70; if (!test(x, z)) continue; if (out.some(s => Math.hypot(s[0] - x, s[1] - z) < minD)) continue; out.push([x, z, .8 + r() * .6, r(), hill(x, z)]); } return out; };
  const treeOk = (x, z) => !(Math.abs(x) < 6.8 && z < 17) && !(z < -3 && Math.abs(x) < 12) && !(z > 17 && Math.abs(x) < 4.5 && z < 24);
  const tSpots = place(150, treeOk, 2.4);
  const treeMat = stylized({ wind: .9 }), pineMat = stylized({ wind: .55 }), bushMat = stylized({ wind: 1.4, roughness: 1 }), grassMat = stylized({ wind: 2.6, roughness: 1 }), rockMat = stylized({ roughness: 1 }), mushMat = stylized({ roughness: .8 }), crystalMat = stylized({ emissive: 0x7ae7ff, emissiveIntensity: .9, roughness: .2 });
  const winds = [treeMat, pineMat, bushMat, grassMat];
  const tilt = (d, s) => { d.rotation.x = (s[3] - .5) * .08; d.rotation.z = (s[3] * 7 % 1 - .5) * .08; };
  const byKind = (spots, defs) => defs.map((def, i) => spots.filter((s, j) => j % defs.length === i));
  const arenaMeshes = [];
  const addSet = (spots, defs, mat, f) => byKind(spots, defs).forEach((list, i) => { if (!list.length) return; const m = instanced(defs[i], mat, list, f); m.castShadow = true; m.receiveShadow = true; root.add(m); arenaMeshes.push(m); });
  const tTrees = tSpots.filter(s => s[3] < .55), tPines = tSpots.filter(s => s[3] >= .55 && s[3] < .82), tBirch = tSpots.filter(s => s[3] >= .82);
  addSet(tTrees, E.trees, treeMat, tilt); if (E.pines.length) addSet(tPines, E.pines, pineMat, tilt); if (E.birch.length) addSet(tBirch, E.birch, treeMat, tilt);
  const edgeOk = (x, z) => Math.abs(x) >= 5.6 && Math.abs(x) < 16 && z > -4 && z < 26 && !(z < -2 && Math.abs(x) < 9);
  if (E.bush.length) addSet(place(70, edgeOk, 1.1), E.bush, bushMat, (d, s) => d.scale.set(s[2] * 1.2, s[2], s[2] * 1.1));
  addSet(place(340, (x, z) => Math.abs(x) >= 4.9 && Math.abs(x) < 24 && z > -6 && z < 30, .55), E.grass, grassMat, (d, s) => d.scale.setScalar(.9 + s[3] * .9));
  if (E.flowers) addSet(place(90, (x, z) => Math.abs(x) >= 5 && Math.abs(x) < 18 && z > -4 && z < 26, 1.0), [E.flowers], grassMat, (d, s) => d.scale.setScalar(.8 + s[3] * .6));
  if (E.rocks.length) addSet(place(36, edgeOk, 1.6), E.rocks, rockMat, (d, s) => d.scale.set(s[2] * 1.3, s[2], s[2] * 1.1));
  if (E.mush.length) addSet(place(26, (x, z) => Math.abs(x) >= 5.4 && Math.abs(x) < 10 && z > -2 && z < 22, 1.3), E.mush, mushMat, null);
  if (E.stump) addSet(place(7, (x, z) => Math.abs(x) >= 7 && Math.abs(x) < 14 && z > 0 && z < 22, 4), [E.stump], rockMat, null);
  // 고대 유적: 전투장 둘레에 기울어진 돌기둥 8 + 무너진 토막, 마법 수정 무리 4(점광 4·LOW 2)
  const stoneG = new THREE.CylinderGeometry(.42, .55, 3.6, 7); stoneG.translate(0, 1.8, 0); const stoneC = new THREE.Color(0x9a9aa6), col = new Float32Array(stoneG.attributes.position.count * 3); for (let i = 0; i < col.length; i += 3) { const k = .85 + Math.random() * .3; col[i] = stoneC.r * k; col[i + 1] = stoneC.g * k; col[i + 2] = stoneC.b * k * 1.05; } stoneG.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pillars = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + .35, R = 6.2 + (i % 2) * .6; const x = Math.cos(a) * R, z = arenaZ - 3 + Math.sin(a) * R * 1.3; if (z < -2.5) continue; pillars.push([x, z, .8 + r() * .5, r(), hill(x, z)]); }
  const pillarM = instanced({ geo: stoneG }, stylized({ roughness: 1 }), pillars, (d, s) => { d.rotation.x = (s[3] - .5) * .5; d.rotation.z = (s[3] * 3 % 1 - .5) * .4; d.scale.set(s[2], s[2] * (.6 + s[3]), s[2]); }); pillarM.castShadow = pillarM.receiveShadow = true; root.add(pillarM); arenaMeshes.push(pillarM);
  const cLights = []; if (E.crystal.length) { const cs = []; for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 1.1, R = 5.6; const bx = Math.cos(a) * R, bz = arenaZ - 3 + Math.sin(a) * R * 1.3; if (bz < -2) continue; for (let j = 0; j < 5; j++) cs.push([bx + Math.sin(j * 2.4) * .45, bz + Math.cos(j * 2.4) * .45, .5 + r() * .7, r(), hill(bx, bz)]);
      const l = new THREE.PointLight(0x7ae7ff, 1.4, 7, 1.8); l.position.set(bx, 1.0, bz); root.add(l); cLights.push(l); }
    addSet(cs, E.crystal, crystalMat, (d, s) => { d.rotation.x = (s[3] - .5) * .9; d.rotation.z = (s[3] * 5 % 1 - .5) * .9; }); }
  // 먼 산 세 겹(안개 색에 묻힘)
  for (const [z, c, hgt] of [[70, 0x8fb4cf, 16], [58, 0x79a394, 11], [48, 0x5f8a6b, 7]]) { const g = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 6), new THREE.MeshBasicMaterial({ color: c, fog: true })); for (let i = 0; i < 11; i++) { const m = g.clone(); m.scale.set(9 + r() * 12, hgt * (.6 + r() * .7), 7); m.position.set(-70 + i * 14 + r() * 7, hgt * .1, z + r() * 8); root.add(m); } }
  // 빛줄기(나무 사이로 들어오는 빛): 기울어진 긴 판 10장, 가산 혼합, 천천히 숨쉼
  const shafts = []; const shaftMat = () => new THREE.MeshBasicMaterial({ color: 0xfff1c4, transparent: true, opacity: .07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.6 + r() * 1.4, 14), shaftMat()); m.position.set((r() * 2 - 1) * 9, 6, 2 + r() * 16); m.rotation.set(.0, (r() - .5) * .6, .32 + r() * .12); m.userData.ph = r() * 7; root.add(m); shafts.push(m); }
  // 반딧불·마법 입자(점) + 낙엽
  const dot = dotTex(), fireN = 140, fp = new Float32Array(fireN * 3), seeds = []; for (let i = 0; i < fireN; i++) seeds.push([(r() * 2 - 1) * 12, .3 + r() * 3, -4 + r() * 26, r() * 7, r()]);
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3)); const flies = new THREE.Points(fg, new THREE.PointsMaterial({ map: dot, color: 0xfff6b0, size: .22, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })); flies.frustumCulled = false; root.add(flies);
  const leafN = 70, lp = new Float32Array(leafN * 3), ls = []; for (let i = 0; i < leafN; i++) ls.push([(r() * 2 - 1) * 10, r() * 8, -2 + r() * 22, r() * 7, .3 + r() * .5]);
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3)); const leaves = new THREE.Points(lg, new THREE.PointsMaterial({ map: leafTex(), size: .18, transparent: true, opacity: .9, depthWrite: false, alphaTest: .2 })); leaves.frustumCulled = false; root.add(leaves);
  // ── 길 모드: 길 띠 2장 + 나무·덤불·풀·꽃·바위를 rail.dist 로 흘림(두 장 돌려쓰기, z −12~52)
  const rail = new THREE.Group(); rail.visible = false; root.add(rail); const RL = 64, rr = rng(77);
  const rTex = roadTex(); const roads = [0, 1].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(7.6, RL), new THREE.MeshStandardMaterial({ map: rTex, roughness: 1 })); m.rotation.x = -Math.PI / 2; m.position.set(0, .012, i * RL); m.receiveShadow = true; rail.add(m); return m; });
  const rList = (n, xo, xr, min, pad) => { const out = []; for (let i = 0; i < n; i++) { const side = i % 2 ? 1 : -1; out.push([side * (xo + rr() * xr), (i / n) * RL + rr() * pad, min + rr() * .7, rr()]); } return out; };
  const rMeshes = [];
  const addRail = (list, defs, mat, f) => byKind(list, defs).forEach((l, i) => { if (!l.length) return; const m = instanced(defs[i], mat, l, (d, s) => { d.position.y = s[4] || 0; f && f(d, s); }); m.castShadow = true; m.receiveShadow = true; rail.add(m); rMeshes.push(m); });
  const rT = rList(60, 4.8, 5.2, .8, 1.0); addRail(rT.filter(s => s[3] < .5), E.trees, treeMat, tilt); if (E.pines.length) addRail(rT.filter(s => s[3] >= .5 && s[3] < .8), E.pines, pineMat, tilt); if (E.birch.length) addRail(rT.filter(s => s[3] >= .8), E.birch, treeMat, tilt);
  if (E.bush.length) addRail(rList(44, 3.9, 1.4, .5, 1.4), E.bush, bushMat, (d, s) => d.scale.set(s[2] * 1.2, s[2], s[2] * 1.1));
  addRail(rList(150, 3.3, 5, .7, .4), E.grass, grassMat, null); if (E.flowers) addRail(rList(36, 3.6, 2.4, .7, 1.6), [E.flowers], grassMat, null);
  if (E.rocks.length) addRail(rList(22, 4.2, 2.2, .6, 2.6), E.rocks, rockMat, (d, s) => d.scale.set(s[2] * 1.2, s[2] * .9, s[2]));
  if (E.mush.length) addRail(rList(14, 3.6, 1.2, .5, 4), E.mush, mushMat, null);
  const wrapZ = (z0, dist) => (((z0 - dist) % RL) + RL) % RL - 12;
  function layRail(dist){ for (const m of rMeshes) relay(m, dummy, s => { const z = wrapZ(s[1], dist); return [s[0], hill(s[0], z), z]; }); roads.forEach((m, i) => { m.position.z = wrapZ(i * RL + RL / 2, dist); }); gTex.offset.y = -dist / (170 / 18); }
  layRail(0);
  // ── 동굴(1-3): 바위 기둥·종유석(절차) + 벽 수정 무리(GLB, 발광) + 점광 6(LOW 2). 길이면 흘리고 전투장이면 둘레 고정
  const cave = new THREE.Group(); cave.visible = false; root.add(cave); const cr = rng(303);
  const pillarG = new THREE.CylinderGeometry(.7, 1.3, 9, 7); pillarG.translate(0, 4.5, 0); const stalG = new THREE.ConeGeometry(.45, 2.4, 6); stalG.rotateX(Math.PI); stalG.translate(0, 7.2, 0);
  const caveRock = toon(0x2b2350), caveRock2 = toon(0x3a3060), shardMat = E.crystal.length ? stylized({ emissive: 0x5ef2c8, emissiveIntensity: 1.1, roughness: .2 }) : null; const shardDef = E.crystal[0] || { geo: (() => { const g = new THREE.OctahedronGeometry(.22, 0); g.scale(.55, 2.4, .55); g.translate(0, .45, 0); return g; })() }, shardM = shardMat || new THREE.MeshBasicMaterial({ color: 0x5ef2c8 });
  const cp = []; for (let i = 0; i < 26; i++) { const side = i % 2 ? 1 : -1; cp.push([side * (4.4 + cr() * 3.8), (i / 26) * RL + cr() * 1.5, .8 + cr() * .6, cr()]); }
  const cs = []; for (let i = 0; i < 18; i++) { const side = i % 2 ? 1 : -1, base = [side * (3.7 + cr() * .8), (i / 18) * RL + cr() * 2]; for (let j = 0; j < 10; j++) cs.push([base[0] + Math.sin(j * 2.4) * .35, base[1] + Math.cos(j * 2.4) * .35, .5 + cr() * .6, cr(), side]); }
  const ctilt = (d, s) => { d.rotation.set(Math.sin(s[3] * 9) * .35, s[3] * 9, -s[4] * (.2 + s[3] * .4)); };
  const caveRailM = [[pillarG, caveRock, cp, null], [stalG, caveRock2, cp, null], [shardDef.geo, shardM, cs, ctilt]].map(([g, m, list, f]) => { const im = instanced({ geo: g }, m, list, f); cave.add(im); return im; });
  const caveArena = new THREE.Group(); root.add(caveArena); caveArena.visible = false; const ap = [], as = [];
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; const R = 9 + cr() * 3; const x = Math.cos(a) * R, z = arenaZ - 2 + Math.sin(a) * R * 1.2; if (z < -3 && Math.abs(x) < 8) continue; ap.push([x, z, .9 + cr() * .6, cr()]); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + .2, R = 6.6 + cr() * 1.2, bx = Math.cos(a) * R, bz = arenaZ - 2 + Math.sin(a) * R; if (bz < -2 && Math.abs(bx) < 7) continue; for (let j = 0; j < 10; j++) as.push([bx + Math.sin(j * 2.4) * .4, bz + Math.cos(j * 2.4) * .4, .5 + cr() * .7, cr(), bx > 0 ? 1 : -1]); }
  [[pillarG, caveRock, ap, null], [stalG, caveRock2, ap, null], [shardDef.geo, shardM, as, ctilt]].forEach(([g, m, list, f]) => caveArena.add(instanced({ geo: g }, m, list, f)));
  const caveLights = []; for (let i = 0; i < 6; i++) { const l = new THREE.PointLight(0x5ef2c8, 0, 9, 1.6); l.position.y = 1.2; l.visible = false; root.add(l); caveLights.push(l); }
  const lightRail = i => cs[(i * 3 % 18) * 10], lightArena = i => as[(i * 2 % 12) * 10] || as[0];
  const mounts = root.children.filter(c => c.isMesh && c.material && c.material.isMeshBasicMaterial && c.geometry.type === 'ConeGeometry');
  const groundCol = ground.material.color.clone(), roadCol = roads[0].material.color.clone(); let dark = false, lightsN = 6, mode = 'arena', lastDist = -1;
  function layCave(dist){ for (const m of caveRailM) relay(m, dummy, s => [s[0], 0, wrapZ(s[1], dist)]); }
  function placeLights(dist){ caveLights.forEach((l, i) => { const on = dark && i < lightsN; l.visible = on; l.intensity = on ? 2.4 : 0; if (!on) return; const s = mode === 'rail' ? lightRail(i) : lightArena(i); l.position.set(s[0] * .92, 1.2, mode === 'rail' ? wrapZ(s[1], dist) : s[1]); }); }
  const arenaOnly = [arena, rune, ...arenaMeshes]; const forestBits = [...arenaMeshes, ...rMeshes, ...mounts, ...shafts, leaves];
  // ── 고대 나무 심장(1-보스): 큰 나무 GLB ×6 + 뿌리 + 보라 심장 구슬 + 숫자 무늬(정답에 빛남). 처음 켤 때만 만든다
  let heart = null, heartOn = false, heartPulse = 0; const digits = [];
  function buildHeart(){ const g = new THREE.Group(); const def = E.trees[1] || E.trees[0]; const big = new THREE.Mesh(def.geo, stylized({ wind: .25 })); big.scale.setScalar(16 / def.h); big.castShadow = true; g.add(big); winds.push(big.material);
    const rootsG = new THREE.CylinderGeometry(.5, .9, 3.2, 6); for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(rootsG, toon(0x4f3622)); const a = i / 7 * Math.PI * 2; m.position.set(Math.cos(a) * 2.6, .9, Math.sin(a) * 2.6); m.rotation.z = Math.cos(a) * .9; m.rotation.x = -Math.sin(a) * .9; g.add(m); }
    const core = new THREE.Mesh(new THREE.SphereGeometry(.9, 24, 16), new THREE.MeshBasicMaterial({ color: 0x9b6bff })); core.position.set(0, 5.2, 2.6); g.add(core); const coreL = new THREE.PointLight(0x9b6bff, 1.8, 20, 2); coreL.position.copy(core.position); g.add(coreL);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xb28cff, transparent: true, opacity: .6, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(4.5); halo.position.copy(core.position); g.add(halo);
    for (let i = 1; i <= 9; i++) { const sp = textSprite(String(i), { scale: 1.1, color: '#ffe7a3', stroke: '#3a2a10' }); const a = (i - 5) * .42, y = 2.4 + (i % 3) * 1.6 + Math.floor((i - 1) / 3) * 2.2; sp.position.set(Math.sin(a) * 2.6, y, Math.cos(a) * 2.6 + .2); sp.material.depthTest = true; sp.material.opacity = .55; g.add(sp); digits.push(sp); }
    g.userData = { core, coreL, halo }; g.visible = false; root.add(g); return g; }
  let t = 0;
  return {
    hq: true,
    setMode(m, rl){ if (m !== mode) { mode = m; rail.visible = m === 'rail'; for (const o of arenaOnly) o.visible = m !== 'rail'; lastDist = -1; this.setDark(dark, true); }
      if (m === 'rail' && rl && rl.dist !== lastDist) { layRail(rl.dist); if (dark) { layCave(rl.dist); placeLights(rl.dist); } lastDist = rl.dist; } if (m !== 'rail') gTex.offset.y = 0; },
    setDark(on, force){ if (on === dark && !force) return; dark = !!on;
      cave.visible = dark && mode === 'rail'; caveArena.visible = dark && mode !== 'rail'; for (const m of rMeshes) m.visible = !dark; for (const m of arenaMeshes) m.visible = !dark && mode !== 'rail'; for (const m of mounts) m.visible = !dark; for (const s of shafts) s.visible = !dark; leaves.visible = !dark; for (const l of cLights) l.visible = !dark && mode !== 'rail';
      ground.material.color.copy(groundCol).multiplyScalar(dark ? .22 : 1); if (dark) ground.material.color.lerp(new THREE.Color(0x2b2350), .4); for (const rd of roads) rd.material.color.copy(roadCol).multiplyScalar(dark ? .4 : 1); arena.material.opacity = dark ? .55 : 1; rune.visible = !dark && mode !== 'rail'; sky.material.uniforms.dark.value = dark ? 1 : 0;
      if (dark) layCave(Math.max(0, lastDist)); placeLights(Math.max(0, lastDist)); },
    setHeart(on){ on = !!on; if (on && !heart) heart = buildHeart(); if (!heart) return; heartOn = on; heart.visible = on; if (on) heart.position.set(0, 0, mode === 'rail' ? 40 : 22); },
    pulseDigits(){ heartPulse = 1; },
    update(dt){ t += dt; for (const m of winds) m.userData.time.value = t;
      if (heartOn && heart) { heartPulse = Math.max(0, heartPulse - dt * .8); const k = .55 + .45 * heartPulse + Math.sin(t * 2) * .08; for (const d of digits) d.material.opacity = Math.min(1, k); const u = heart.userData; u.core.scale.setScalar(1 + Math.sin(t * 3) * .08 + heartPulse * .3); u.coreL.intensity = 1.8 + heartPulse * 3; u.halo.scale.setScalar(4.5 + Math.sin(t * 3) * .4 + heartPulse * 2); heart.position.z = mode === 'rail' ? 40 : 22; }
      for (let i = 0; i < fireN; i++) { const s = seeds[i]; fp[i * 3] = s[0] + Math.sin(t * .4 + s[3]) * .9; fp[i * 3 + 1] = s[1] + Math.sin(t * .9 + s[3] * 2) * .35; fp[i * 3 + 2] = s[2] + Math.cos(t * .3 + s[3]) * .9; } fg.attributes.position.needsUpdate = true; flies.material.opacity = .7 + .3 * Math.sin(t * 2.2);
      if (leaves.visible) { for (let i = 0; i < leafN; i++) { const s = ls[i]; s[1] -= dt * s[4]; if (s[1] < 0) s[1] = 8 + Math.random() * 2; lp[i * 3] = s[0] + Math.sin(t * 1.1 + s[3]) * .8; lp[i * 3 + 1] = s[1]; lp[i * 3 + 2] = s[2] + Math.cos(t * .7 + s[3]) * .4; } lg.attributes.position.needsUpdate = true; }
      for (const s of shafts) s.material.opacity = .05 + .035 * (Math.sin(t * .5 + s.userData.ph) * .5 + .5);
      rune.material.opacity = .28 + .12 * Math.sin(t * 1.6); for (const l of cLights) l.intensity = 1.1 + .4 * Math.sin(t * 2 + l.position.x); },
    setQuality(q){ lightsN = q === 'low' ? 2 : 6; placeLights(Math.max(0, lastDist)); flies.visible = q !== 'low'; leaves.visible = q !== 'low' && !dark; for (const s of shafts) s.visible = q === 'high' && !dark; for (const l of cLights) l.visible = q !== 'low' && !dark && mode !== 'rail';
      arenaMeshes.forEach(m => { m.castShadow = q === 'high' || (q === 'medium' && m.count < 80); }); rMeshes.forEach(m => { m.castShadow = q !== 'low' && m.count < 80; }); ground.material.map.anisotropy = q === 'high' ? 8 : 2; },
    dispose(){ scene.remove(root); },
  };
}
