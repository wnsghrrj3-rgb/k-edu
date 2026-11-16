/* ============================================================
 * 영어 놀이터 — 빈터 판형(rooms/glade) (W15 · 상세판 A §2 빈터 판형 · 키트 core/diorama.js 위에)
 *   글자 숲 걸음들의 바깥 무대 — 잘라 낸 땅(흙 · 흙 띠 · 풀 턱) · 풀밭 그림 · 풀잎 · 꽃 · 개울(물 · 돌 · 연잎 · 갈대 · 물무늬) · 뒤 숲 · 버섯 · 바위 · 열매 나무.
 *   판형은 여기 한 번만 짓고, 걸음의 방 파일은 물건과 가운데 장면만 얹는다(빈터 시험판 · 몸 장면이 같이 쓴다).
 *   const G = buildGlade(K, L)     L = 자리 · 수(아래 GLADE_DEFAULT 와 같은 모양 — 빈터 시험판의 값이 기본)
 *     G.group · G.freeAt(x, z) · G.ripple(x, z, max) · G.step(dt, t) · G.wind · G.waterTex · G.reeds · G.lilies · G.bushes
 *   const tr = fruitTree(K, { x, z, leaf, letter, fruitTone, apples })   — 글자 열매가 달린 나무(tr.userData = { crown, trunk, fruit, fruitHome })
 * ============================================================ */
export const GLADE_DEFAULT = {
  GW: 17, GD: 11.4,
  creek: { at: [0.8, -3.7], main: [2.85, 1.55], second: [-1.3, 1.3, 0.8], sand: [[0, 0, 3.25, 1.95], [0, -1.3, 1.75, 1.1]],
    stones: [[-0.9, 1.2, 0.42], [0.5, 1.5, 0.5], [1.9, 1.15, 0.4], [-2.6, 0.5, 0.36]],
    lilies: [[-1.7, 0.2, 0.36], [-1.1, -0.6, 0.28], [-2.0, -0.4, 0.22], [0.2, -1.6, 0.3]], lilyFlower: true,
    reeds: [[-2.7, -0.9, 1.2], [-2.45, -1.15, 0.95], [-2.9, -0.6, 0.85], [2.75, -1.0, 1.1], [2.5, -1.25, 0.9], [1.6, -2.15, 1.0]],
    free: [[0, 0, 3.3, 2.0], [0, -1.3, 1.8, 1.15]], rings: 5 },
  grass: 620, flowers: 54,
  blocks: [],                                  /* [x, z, r] — 풀 · 꽃이 피하는 자리(물건 자리) */
  road: { z: 4.3, halfW: 4, halfD: 0.75, stones: 7 },   /* 앞 흙길(글자 길이 놓일 자리) · 디딤돌 */
  paint: null,                                 /* (g, P) — 풀밭 그림에 그 방의 얼룩을 더 그린다(햇볕 자리 · 밟힌 자리 · 오솔길) */
  bushes: [[-7.6, -4.6, 1.25], [-2.7, -5.0, 1.05], [3.5, -5.1, 1.05], [7.6, -4.6, 1.3], [-8.0, -1.6, 0.9, 1], [8.1, -1.5, 0.85, 1]],
  mushrooms: [[-6.9, 2.9, 1], [-6.4, 3.3, 0.7], [1.2, 3.2, 0.8], [-1.2, -0.3, 0.6], [7.2, -0.9, 0.9], [-7.4, -3.0, 0.8]],
  rocks: [[-7.5, 0.6, 0.42], [-7.4, 4.1, 0.36], [-4.9, 4.3, 0.3], [4.4, -1.7, 0.28]]
};

export function buildGlade(K, L0){
  const L = Object.assign({}, GLADE_DEFAULT, L0 || {}), CR = Object.assign({}, GLADE_DEFAULT.creek, (L0 || {}).creek || {});
  const { THREE, M, C, hex, mix, hexOf, RNG, canvasTex, mesh, ball, rbox, rshape, flat, oval, soft, glowTex, fx, LOW } = K;
  const glade = new THREE.Group(), GW = L.GW, GD = L.GD, CK = CR.at;
  /* 잘라 낸 땅 + 땅 아래의 옅은 그림자(떠 있는 느낌) */
  { const soil = rbox(GW, GD, 1.0, 1.6, M(mix('a-wood', 'ink', 0.2), { roughness: 0.95 })); soil.rotation.x = -Math.PI / 2; soil.position.y = -0.66; glade.add(soil);
    const band = rbox(GW + 0.04, GD + 0.04, 0.14, 1.62, M(mix('stage-2', 'a-wood', 0.35), { roughness: 1 })); band.rotation.x = -Math.PI / 2; band.position.y = -0.34; glade.add(band);
    const lip = rbox(GW + 0.2, GD + 0.2, 0.22, 1.7, M(mix('stage', 'stage-deep', 0.45), { roughness: 1 })); lip.rotation.x = -Math.PI / 2; lip.position.y = -0.112; glade.add(lip);
    const sh = fx(new THREE.Mesh(new THREE.PlaneGeometry(GW * 1.5, GD * 1.6), new THREE.MeshBasicMaterial({ map: glowTex(128, 1.6), color: C('ink'), transparent: true, opacity: 0.5, depthWrite: false }))); sh.rotation.x = -Math.PI / 2; sh.position.set(0.4, -1.5, 0.6); glade.add(sh); }
  /* 풀밭 그림 */
  const TW = 1024, TH = Math.round(1024 * GD / GW), gx = x => (x / GW + 0.5) * TW, gz = z => (z / GD + 0.5) * TH, gs = TW / GW;
  { const grassBase = mix(mix('stage', 'a-leaf', 0.5), 'warm-soft', 0.2), dirt = hexOf(mix('stage-2-soft', 'stage-2', 0.35)), sand = hexOf(mix('a-cream', 'stage-2-soft', 0.4));
    const tex = canvasTex(TW, TH, (g, w, h) => { const rnd = RNG(5); g.fillStyle = hexOf(grassBase); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 130; i++) { g.globalAlpha = 0.05 + rnd() * 0.09; g.fillStyle = i % 3 ? hex('stage-deep') : hex('warm-soft'); g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 26 + rnd() * 80, 14 + rnd() * 36, rnd() * 3, 0, 7); g.fill(); } g.globalAlpha = 1;
      (CR.sand || []).forEach(s => soft(g, gx(CK[0] + s[0]), gz(CK[1] + s[1]), s[2] * gs, s[3] * gs, sand, 0.96, (s[1] ? 0.3 : 0.35) * gs));                    /* 개울가 모래 */
      if (L.paint) L.paint(g, { gx, gz, gs, soft, hex, dirt, sand });
      g.fillStyle = hex('stage-deep'); for (let i = 0; i < 520; i++) { g.globalAlpha = 0.22 + rnd() * 0.25; g.fillRect(rnd() * w, rnd() * h, 2, 4 + rnd() * 6); } g.globalAlpha = 1; });
    tex.repeat.set(1 / GW, 1 / GD); tex.offset.set(0.5, 0.5);
    glade.add(flat(rshape(GW - 0.16, GD - 0.16, 1.52), M(C('surface'), { map: tex, roughness: 0.96 }), 0.004)); }
  /* 어디에 무엇이 있나 — 풀 · 꽃이 물건 자리와 물 · 길을 피해서 난다 */
  function freeAt(x, z){
    if (Math.abs(x) > GW / 2 - 0.45 || Math.abs(z) > GD / 2 - 0.45) return false;
    const cx = Math.abs(x) - (GW / 2 - 1.6), cz = Math.abs(z) - (GD / 2 - 1.6); if (cx > 0 && cz > 0 && cx * cx + cz * cz > 1.2 * 1.2) return false;
    for (const f of CR.free || []) { const e = (x - CK[0] - f[0]) / f[2], d = (z - CK[1] - f[1]) / f[3]; if (e * e + d * d < 1) return false; }
    if (L.road && Math.abs(x) < L.road.halfW && Math.abs(z - L.road.z) < L.road.halfD) return false;
    return !L.blocks.some(b => (x - b[0]) * (x - b[0]) + (z - b[1]) * (z - b[1]) < b[2] * b[2]);
  }
  /* 풀잎 — 한 번에 그리는 수백 포기. 바람에 끝이 흔들린다 */
  const wind = { value: 0 }, dummy = new THREE.Object3D();
  { const N = LOW ? Math.round(L.grass * 0.33) : L.grass, geo = new THREE.ConeGeometry(0.04, 0.22, 4, 1); geo.translate(0, 0.11, 0);
    const mat = M(C('surface'), { roughness: 1 });
    mat.onBeforeCompile = sh => { sh.uniforms.uT = wind; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef USE_INSTANCING\n transformed.x += sin(uT * 1.7 + instanceMatrix[3][0] * 1.7 + instanceMatrix[3][2] * 1.3) * 0.28 * position.y;\n#endif'); };
    const im = new THREE.InstancedMesh(geo, mat, N), rnd = RNG(11), base = mix(mix('stage', 'a-leaf', 0.5), 'warm-soft', 0.2), tones = [mix(base, 'stage-deep', 0.3), mix(base, 'stage', 0.5), mix(base, 'warm-soft', 0.25), mix(base, 'a-leaf', 0.6)];
    let n = 0, guard = 0; while (n < N && guard++ < N * 12) { const cl = rnd() < 0.7, bx = (rnd() - 0.5) * GW, bz = (rnd() - 0.5) * GD; const k = cl ? 3 : 1;
      for (let j = 0; j < k && n < N; j++) { const x = bx + (rnd() - 0.5) * 0.3, z = bz + (rnd() - 0.5) * 0.3; if (!freeAt(x, z)) continue;
        dummy.position.set(x, 0, z); dummy.rotation.set((rnd() - 0.5) * 0.3, rnd() * 6.3, (rnd() - 0.5) * 0.5); const s = 0.7 + rnd() * 0.8; dummy.scale.set(s, s * (0.8 + rnd() * 0.6), s); dummy.updateMatrix();
        im.setMatrixAt(n, dummy.matrix); im.setColorAt(n, tones[(rnd() * tones.length) | 0]); n++; } }
    im.count = n; im.receiveShadow = true; im.castShadow = false; glade.add(im); }
  /* 꽃 — 무리 지어 핀다 */
  { const N = LOW ? Math.round(L.flowers / 3) : L.flowers, rnd = RNG(23), stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.014, 0.018, 0.3, 5), M('a-leaf'), N), heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 10, 8), M(C('surface'), { roughness: 0.6 }), N), cores = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), M('warm', { roughness: 0.5 }), N);
    const tones = [C('surface'), C('a-pink'), C('warm-soft'), mix('a-plum', 'surface', 0.45), C('a-gold')];
    let n = 0, guard = 0; while (n < N && guard++ < 400) { const bx = (rnd() - 0.5) * GW, bz = (rnd() - 0.5) * GD, tn = tones[(rnd() * tones.length) | 0];
      for (let j = 0; j < 5 && n < N; j++) { const x = bx + (rnd() - 0.5) * 0.9, z = bz + (rnd() - 0.5) * 0.7; if (!freeAt(x, z)) continue; const h = 0.2 + rnd() * 0.16, s = 0.8 + rnd() * 0.5;
        dummy.rotation.set(0, 0, 0); dummy.scale.set(1, h / 0.3, 1); dummy.position.set(x, h / 2, z); dummy.updateMatrix(); stems.setMatrixAt(n, dummy.matrix);
        dummy.scale.set(s, s * 0.42, s); dummy.position.set(x, h, z); dummy.updateMatrix(); heads.setMatrixAt(n, dummy.matrix); heads.setColorAt(n, tn);
        dummy.scale.set(s, s, s); dummy.position.set(x, h + 0.035, z); dummy.updateMatrix(); cores.setMatrixAt(n, dummy.matrix); n++; } }
    [stems, heads, cores].forEach(m => { m.count = n; m.castShadow = false; m.receiveShadow = true; glade.add(m); }); }
  /* 앞 흙길의 디딤돌 */
  if (L.road && L.road.stones) for (let i = 0; i < L.road.stones; i++) glade.add(ball(0.2, M(mix(mix('a-steel', 'stage-2', 0.45), 'ink', 0.12), { roughness: 0.9 }), -3 + i * 1 + (i % 2) * 0.2, 0.02, L.road.z + ((i * 7) % 5 - 2) * 0.1, 1.2, 0.22, 0.9));
  /* 개울 — 물은 천천히 흐르고 물무늬가 퍼진다 */
  const waterTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = hexOf(mix('a-fish', 'stage-soft', 0.3)); g.fillRect(0, 0, w, h); const rnd = RNG(3); g.strokeStyle = hex('surface'); g.lineCap = 'round';
    for (let i = 0; i < 26; i++) { g.globalAlpha = 0.1 + rnd() * 0.16; g.lineWidth = 2 + rnd() * 3; const x = rnd() * w, y = rnd() * h, l = 18 + rnd() * 40; for (const of of [-w, 0, w]) { g.beginPath(); g.moveTo(x + of, y); g.quadraticCurveTo(x + of + l / 2, y - 5, x + of + l, y); g.stroke(); } } g.globalAlpha = 1; });
  waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping; waterTex.repeat.set(0.22, 0.22);
  const water = M(C('surface'), { map: waterTex, roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.94 });
  const lilies = [], reeds = [], rings = [];
  { glade.add(flat(oval(CK[0], CK[1], CR.main[0], CR.main[1]), water, 0.03)); if (CR.second) glade.add(flat(oval(CK[0], CK[1] + CR.second[0], CR.second[1], CR.second[2]), water, 0.03));
    CR.stones.forEach(a => glade.add(ball(a[2], M(mix('a-steel', 'ink', 0.08), { roughness: 0.65 }), CK[0] + a[0], 0.07, CK[1] + a[1], 1.25, 0.34, 1)));
    CR.lilies.forEach((a, i) => { const p = new THREE.Mesh(new THREE.CircleGeometry(a[2], 22, 0.35, 5.6), M(mix('a-leaf', 'stage', 0.5), { roughness: 0.6, side: THREE.DoubleSide })); p.rotation.x = -Math.PI / 2; p.rotation.z = i * 1.9; p.position.set(CK[0] + a[0], 0.05, CK[1] + a[1]); p.receiveShadow = true; glade.add(p); lilies.push(p);
      if (i === 0 && CR.lilyFlower) { const f = new THREE.Group(); f.position.set(CK[0] + a[0] + 0.05, 0.08, CK[1] + a[1] - 0.04); for (let k = 0; k < 6; k++) { const pt = ball(0.08, M('a-pink', { roughness: 0.6 }), Math.cos(k * 1.047) * 0.07, 0.03, Math.sin(k * 1.047) * 0.07, 1, 0.55, 0.6); pt.rotation.y = -k * 1.047; f.add(pt); } f.add(ball(0.05, M('warm'), 0, 0.06, 0)); glade.add(f); } });
    CR.reeds.forEach((a, i) => { const r = new THREE.Group(); r.position.set(CK[0] + a[0], 0, CK[1] + a[1]); r.add(mesh(new THREE.CylinderGeometry(0.02, 0.028, a[2], 5), M(mix('a-leaf', 'warm', 0.25)), 0, a[2] / 2, 0)); r.add(mesh(new THREE.CapsuleGeometry(0.055, 0.2, 4, 8), M(mix('a-wood', 'ink', 0.1), { roughness: 0.9 }), 0, a[2] + 0.06, 0)); const lf = ball(0.2, M('a-leaf'), 0.12, a[2] * 0.4, 0, 1.2, 0.12, 0.3); lf.rotation.z = 0.9; r.add(lf); r.userData.k = i * 1.7; glade.add(r); reeds.push(r); });
    for (let i = 0; i < (LOW ? Math.min(3, CR.rings) : CR.rings); i++) { const m = fx(new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 40), new THREE.MeshBasicMaterial({ color: C('surface'), transparent: true, opacity: 0, depthWrite: false }))); m.rotation.x = -Math.PI / 2; m.position.y = 0.045; m.userData = { t: 1, max: 1 }; glade.add(m); rings.push(m); } }
  function ripple(x, z, max = 0.8){ const m = rings.find(r => r.userData.t >= 1); if (!m) return; m.position.x = x; m.position.z = z; m.userData.t = 0; m.userData.max = max; }
  /* 뒤 숲(둘레 나무) · 버섯 · 바위 */
  function bush(x, z, r, tn, berry){ const g = new THREE.Group(); g.position.set(x, 0, z); const m1 = M(tn, { roughness: 0.95 }), m2 = M(mix(tn, 'warm-soft', 0.1), { roughness: 0.95 });
    g.add(mesh(new THREE.CylinderGeometry(0.16 * r, 0.24 * r, 1.1 * r, 10), M('a-wood', { roughness: 0.9 }), 0, 0.5 * r, 0)); g.add(ball(1.0 * r, m1, 0, 1.6 * r, 0, 1, 0.92, 1)); g.add(ball(0.7 * r, m1, 0.62 * r, 1.25 * r, 0.1, 1, 0.9, 1)); g.add(ball(0.66 * r, m1, -0.56 * r, 1.3 * r, 0.15, 1, 0.9, 1)); g.add(ball(0.62 * r, m2, 0.1 * r, 2.15 * r, 0.1, 1, 0.8, 1)); g.add(ball(0.5 * r, m2, -0.2 * r, 1.5 * r, 0.7 * r, 1, 0.85, 0.8));
    if (berry) [[0.5, 1.5, 0.75], [-0.3, 1.9, 0.8], [0.1, 1.2, 0.95], [-0.7, 1.4, 0.6]].forEach(b => g.add(ball(0.09 * r, M('word-red', { roughness: 0.35 }), b[0] * r, b[1] * r, b[2] * r)));
    return g; }
  const bushes = L.bushes.map((b, i) => { const g = bush(b[0], b[1], b[2], i % 2 ? mix('stage-deep', 'a-leaf', 0.35) : C('stage-deep'), b[3]); glade.add(g); return g; });
  function mushroom(x, z, s){ const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); g.add(mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.32, 12), M('a-cream'), 0, 0.16, 0)); g.add(ball(0.26, M('a-red', { roughness: 0.5 }), 0, 0.34, 0, 1, 0.62, 1)); [[0.1, 0.46, 0.12], [-0.12, 0.44, 0.06], [0.02, 0.5, -0.1]].forEach(d => g.add(ball(0.045, M('surface'), d[0], d[1], d[2]))); return g; }
  L.mushrooms.forEach(m => glade.add(mushroom(m[0], m[1], m[2])));
  L.rocks.forEach((r, i) => { const g = new THREE.Group(); g.position.set(r[0], 0, r[1]); g.rotation.y = i * 1.3; g.add(ball(r[2], M(mix(mix('a-steel', 'stage-2', 0.3), 'ink', 0.25), { roughness: 0.9 }), 0, r[2] * 0.4, 0, 1.3, 0.75, 1)); g.add(ball(r[2] * 0.6, M(mix(mix('a-steel', 'stage-2', 0.3), 'ink', 0.3), { roughness: 0.9 }), r[2] * 0.9, r[2] * 0.25, 0.1, 1.2, 0.7, 1)); g.add(ball(r[2] * 0.7, M(mix('stage', 'a-leaf', 0.5), { roughness: 1 }), -0.05, r[2] * 0.78, 0.02, 1.2, 0.3, 0.9)); glade.add(g); });
  /* 매 장면 — 물 · 연잎 · 갈대 · 덤불 · 물무늬 */
  function step(dt, t){
    wind.value = t;
    bushes.forEach((b, i) => { b.rotation.z = Math.sin(t * 0.7 + i * 1.7) * 0.012; });
    waterTex.offset.x = t * 0.018; waterTex.offset.y = Math.sin(t * 0.3) * 0.03;
    lilies.forEach((p, i) => { p.position.y = 0.05 + Math.sin(t * 1.4 + i * 2) * 0.006; p.rotation.z += dt * 0.04 * (i % 2 ? 1 : -1); });
    reeds.forEach(r => { r.rotation.z = Math.sin(t * 1.2 + r.userData.k) * 0.07; });
    rings.forEach(m => { const u = m.userData; if (u.t >= 1) { m.material.opacity = 0; return; } u.t = Math.min(1, u.t + dt / 1.9); m.scale.setScalar(0.12 + u.t * u.max); m.material.opacity = (1 - u.t) * 0.55; });
  }
  return { group: glade, GW, GD, creek: CK, freeAt, ripple, step, wind, waterTex, lilies, reeds, rings, bushes };
}

/* ── 열매 나무 — 줄기 · 뿌리 · 둥근 잎 머리 · 작은 열매들 · 가지 끝의 큰 글자 열매 ── */
export function fruitTree(K, o){
  const { THREE, M, mix, mesh, ball, hex, letterTex } = K;
  const g = new THREE.Group(); g.position.set(o.x, 0, o.z); const bark = M('a-wood', { roughness: 0.9 });
  const trunk = new THREE.Group(); g.add(trunk);
  trunk.add(mesh(new THREE.CylinderGeometry(0.3, 0.52, 2.8, 14), bark, 0, 1.4, 0));
  [0.5, 2.6, 4.5].forEach(a => { const r = ball(0.3, bark, Math.cos(a) * 0.48, 0.06, Math.sin(a) * 0.48, 1.6, 0.55, 0.9); r.rotation.y = -a; g.add(r); });
  const crown = new THREE.Group(); crown.position.y = o.crownY || 3.6; trunk.add(crown);
  const leaf = o.leaf, L1 = M(leaf, { roughness: 0.95 }), L2 = M(mix(leaf, 'warm-soft', 0.12), { roughness: 0.95 }), L3 = M(mix(leaf, 'stage-deep', 0.4), { roughness: 0.95 });
  [[0, 0.15, 0, 1.75, L1], [1.3, -0.25, 0.2, 1.2, L1], [-1.3, -0.2, 0.25, 1.25, L1], [0.2, -0.4, 1.0, 1.15, L1], [0, 1.05, -0.2, 1.2, L2], [0.85, 0.8, 0.45, 0.8, L2], [-0.8, 0.75, 0.5, 0.85, L2], [0, -0.35, -1.0, 1.25, L3], [-0.9, -0.75, 0.7, 0.7, L3], [1.0, -0.8, 0.6, 0.7, L3]].forEach(c => crown.add(ball(c[3], c[4], c[0], c[1], c[2], 1, 0.9, 1)));
  const APPLES = [[-1.3, -0.35, 1.2], [0.9, 0.35, 1.55], [1.8, -0.5, 0.8], [-0.3, 0.95, 1.3], [-1.95, 0.3, 0.6], [0.45, -0.95, 1.75], [1.2, -0.75, 1.3], [-0.55, 0.1, 1.72], [0.85, 1.15, 0.9]];
  const apples = o.apples === true ? APPLES : o.apples;
  if (apples) apples.forEach(a => { crown.add(ball(0.25, M('a-red', { roughness: 0.3 }), a[0], a[1], a[2])); crown.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 5), bark, a[0], a[1] + 0.27, a[2])); });
  else [[-1.2, -0.3, 1.25], [1.0, 0.4, 1.5], [1.7, -0.55, 0.85], [-0.2, 1.0, 1.25], [0.5, -0.9, 1.75]].forEach(a => crown.add(ball(0.13, M('a-gold', { roughness: 0.4 }), a[0], a[1], a[2])));
  /* 글자 열매 — 가지 끝에 매달린 큰 열매 */
  const fruit = new THREE.Group(); fruit.position.set(...(o.fruitAt || (o.letter === 'a' ? [-1.25, 1.95, 1.95] : [-0.9, 2.15, 2.2]))); (o.fruitInCrown ? crown : g).add(fruit);
  fruit.add(ball(o.fruitR || 0.52, M(o.fruitTone, { roughness: 0.35 }), 0, 0, 0, 1, 0.95, 1));
  fruit.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6), M('a-wood'), 0, 0.7, 0));
  { const lf = ball(0.18, M('a-leaf'), 0.16, 0.56, 0, 1.3, 0.25, 0.7); lf.rotation.z = -0.5; fruit.add(lf); }
  const sp = new THREE.Mesh(new THREE.CircleGeometry(0.36, 32), new THREE.MeshBasicMaterial({ map: letterTex(o.letter, hex('ink'), hex('a-cream')) })); sp.position.set(0.07, 0.02, (o.fruitR || 0.52) + 0.025); sp.rotation.y = 0.12; fruit.add(sp);
  g.userData = { crown, trunk, fruit, fruitHome: fruit.position.clone() }; return g;
}
