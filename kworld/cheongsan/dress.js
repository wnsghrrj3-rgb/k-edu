/* 청산리 — 엿새 · 무대 꾸미기(11-23 블렌더 2차, 준호 「블렌더를 사용해서 더 멋지게」)
   cheongsan2.glb 의 모델을 큰 지형에 놓는다: 먼 산(눈 덮인 봉우리) · 가파른 곳의 바위벽 · 비탈의 바위 · 숲 속 쓰러진 나무와 그루터기 · 높은 데 눈 더미 · 물가 갈대와 돌 · 큰 소나무.
   모델이 없으면(이름이 ART 에 없으면) 그 줄은 건너뛴다 — 놀이는 그대로 돈다. 놓는 자리는 씨앗 하나로 늘 같다(자동 판이 같은 판을 본다). */
import * as THREE from 'three';
import { ART, artInst, artGeo, artMat, rng, dist } from '../scene/kit.js';
import { MAP_W, MAP_H, Hq, slopeAt, mainD, floorAt, VALLEYS } from './map.js';

export function dressWorld({ scene, forest, avoid = () => false, lite = false }) {
  const r = rng(4242), has = (n) => !!ART[n], extra = [];
  /* ── 먼 산: 판 둘레 150~330 m 밖에 빙 둘러(안개에 흐려져 멀어 보인다) ── */
  const mts = ['cs_mount_a', 'cs_mount_b', 'cs_mount_c'].filter(has);
  if (mts.length) { const by = {}; const N = lite ? 20 : 30; for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2 + r() * 0.12, rx = MAP_W / 2 + 300 + r() * 190, rz = MAP_H / 2 + 280 + r() * 170, x = MAP_W / 2 + Math.cos(a) * rx, z = MAP_H / 2 + Math.sin(a) * rz, nm = mts[i % mts.length], sc = 1.0 + r() * 0.9; (by[nm] = by[nm] || []).push([x, 4 + r() * 12, z, [sc, sc * (0.85 + r() * 0.5), sc], r() * 6.28]); }
    /* 안개는 받지 않고(멀어서 다 지워진다) 대신 색을 엷은 하늘빛 쪽으로 반쯤 — 눈 덮인 봉우리가 멀리 흐리게 보인다. 밤에는 빛이 약해 저절로 어둡다 */
    const mm = artMat.clone(); mm.fog = false; const hz = new THREE.Color(0xc4ccd8), d = new THREE.Object3D();
    for (const nm in by) { const g = artGeo(nm).clone(), c = g.attributes.color; for (let i = 0; i < c.count; i++) c.setXYZ(i, c.getX(i) * 0.5 + hz.r * 0.5, c.getY(i) * 0.5 + hz.g * 0.5, c.getZ(i) * 0.5 + hz.b * 0.5); const list = by[nm], m = new THREE.InstancedMesh(g, mm, list.length); list.forEach((t, i) => { d.position.set(t[0], t[1], t[2]); d.scale.set(t[3][0], t[3][1], t[3][2]); d.rotation.set(0, t[4], 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); }); m.computeBoundingSphere(); m.castShadow = false; m.receiveShadow = false; scene.add(m); } }
  /* ── 바위벽: 가파른 곳(기울기 1.7 넘음 = 못 오르는 곳)에 내리막을 보고 세운다 ── */
  const cl = ['cs_cliff_a', 'cs_cliff_b'].filter(has);
  if (cl.length) { const put = []; for (const [x0, z0, x1, z1] of [[0, 96, 300, 250], [480, 60, 650, 170], [380, 30, 500, 150], [20, 250, 300, 360]]) for (let z = z0; z <= z1; z += 7) for (let x = x0; x <= x1; x += 7) { if (slopeAt(x, z) < 1.75) continue; if (put.some((p) => dist(p[0], p[1], x, z) < 11)) continue; const gx = Hq(x + 2, z) - Hq(x - 2, z), gz = Hq(x, z + 2) - Hq(x, z - 2), l = Math.hypot(gx, gz) || 1; put.push([x, z, Math.atan2(-gx / l, -gz / l)]); if (put.length > (lite ? 40 : 80)) break; }
    put.forEach((p, i) => extra.push([cl[i % cl.length], p[0], p[1], 0.62 + r() * 0.25, p[2], 'prop', -4.2])); }
  /* ── 비탈의 바위 · 숲 속 쓰러진 나무·그루터기 · 눈 더미 ── */
  const rocks = ['cs_rock_s1', 'cs_rock_s2', 'cs_rock_s3'].filter(has), REG = [[-10, 96, 300, 250, 1], [478, 50, 655, 262, 0.55], [0, 262, 590, 385, 0.7], [376, 22, 508, 170, 0.45]];
  const ok = (x, z) => !avoid(x, z) && Math.abs(mainD(x, z)[0]) > 4.5 && slopeAt(x, z) < 1.5;
  for (const [x0, z0, x1, z1, k] of REG) { const n = Math.round((lite ? 110 : 230) * k);
    if (rocks.length) for (let i = 0, t = 0; i < n && t < n * 6; t++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0); if (!ok(x, z)) continue; const up = Hq(x, z) - floorAt(x, z); if (up < 1 && r() < 0.6) continue; extra.push([rocks[Math.floor(r() * rocks.length)], x, z, 0.7 + r() * 1.3, r() * 6.28, 'deco']); i++; }
    if (has('cs_snowpatch_a')) for (let i = 0, t = 0; i < n * 0.7 && t < n * 8; t++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), h = Hq(x, z); if (h < 22 + r() * 8 || slopeAt(x, z) > 0.32 || avoid(x, z)) continue; extra.push([r() < 0.5 ? 'cs_snowpatch_a' : 'cs_snowpatch_b', x, z, 0.6 + r() * 0.6, r() * 6.28, 'deco', 0.05]); i++; } }
  /* 쓰러진 나무·그루터기: 나무 곁(숲 안)에 */
  if (has('cs_log_fallen') || has('cs_stump')) { let k = 0; for (const [x, z] of forest.put) { if (++k % (lite ? 26 : 13)) continue; const px = x + (r() - 0.5) * 5, pz = z + (r() - 0.5) * 5; if (!ok(px, pz)) continue; const nm = r() < 0.4 && has('cs_log_fallen') ? 'cs_log_fallen' : 'cs_stump'; if (has(nm)) extra.push([nm, px, pz, 0.8 + r() * 0.5, r() * 6.28, 'prop']); } }
  /* ── 물가: 고동하 갈대·돌 ── */
  if (has('cs_reeds') || has('cs_river_rocks')) { const P = VALLEYS.godong; for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L; for (let s = 0; s < L; s += lite ? 9 : 5) { if (r() < 0.35) continue; const t = s / L, side = r() < 0.5 ? -1 : 1, off = 5.2 + r() * 3.5, x = a[0] + (b[0] - a[0]) * t + nx * off * side, z = a[1] + (b[1] - a[1]) * t + nz * off * side; if (x < 0 || x > MAP_W || z < 200 || z > 388 || avoid(x, z)) continue; const nm = r() < 0.7 ? 'cs_reeds' : 'cs_river_rocks'; if (has(nm)) extra.push([nm, x, z, 0.8 + r() * 0.6, r() * 6.28, 'deco']); } } }
  /* ── 큰 소나무(길잡이 나무): 고갯마루 · 빈터 가 · 어귀 · 마을 어귀 · 능선 ── */
  if (has('cs_pine_big')) for (const [x, z, s] of [[28, 160, 1.1], [44, 196, 1], [94, 150, 0.95], [258, 182, 1.05], [318, 196, 1], [372, 172, 0.9], [546, 104, 1], [588, 100, 0.9], [540, 224, 1.05], [452, 96, 1], [110, 276, 1], [70, 306, 0.9], [300, 286, 1], [478, 270, 1]]) if (!avoid(x, z)) extra.push(['cs_pine_big', x, z, s, r() * 6.28, 'prop']);
  forest.addExtra(extra); forest.build(); forest.lod(64, 172);
  return { n: extra.length };
}

/* 야영지 소품: 걸어총 · 잠자리 · 솥 거는 삼발이 · 장작더미 · 등 — 가운데(cx, cz) 둘레 r. jp = 기병 야영지(안장 걸이·말 매는 가로대). keep(x, z) 가 거짓이면 그 자리는 비운다(고리·사람 자리) */
export function dressCamp(putArt, cx, cz, { r = 9, seed = 1, jp = false, table = null, keep = () => true, n = 4 } = {}) {
  const q = rng(seed * 31 + 5), P = (nm, x, z, ry = 0, s = 1) => (keep(x, z) ? putArt(nm, x, z, ry, s) : null);
  for (let i = 0; i < n; i++) { const a = q() * 6.28, rr = r * (0.55 + q() * 0.4); P('cs_rifle_stack', cx + Math.cos(a) * rr, cz + Math.sin(a) * rr, q() * 3); }
  for (let i = 0; i < n + 2; i++) { const a = q() * 6.28, rr = r * (0.35 + q() * 0.7); P('cs_bedroll', cx + Math.cos(a) * rr, cz + Math.sin(a) * rr, q() * 6.28); }
  P('cs_woodpile', cx - r * 0.9, cz + r * 0.35, q() * 3); P('cs_lantern', cx + r * 0.5, cz - r * 0.75); P('cs_lantern', cx - r * 0.6, cz - r * 0.6);
  if (!jp) P('cs_tripod_pot', cx + r * 0.35, cz + r * 0.5, q() * 3);
  if (jp) { P('cs_saddle_rack', cx - r * 0.8, cz - r * 0.5, 0.2); P('cs_saddle_rack', cx + r * 0.9, cz - r * 0.3, -0.3); }
  if (table) P('cs_map_table', table[0], table[1], table[2] || 0);
}
/* 마을 소품: 집마다 장작더미, 둘에 하나 낟가리, 가운데 우물과 수레 */
export function dressVillage(putArt, houses, { seed = 1, well = null } = {}) {
  const q = rng(seed * 17 + 3); let sx = 0, sz = 0;
  houses.forEach(([x, z, ry = 0], i) => { sx += x; sz += z; const c = Math.cos(ry), s = Math.sin(ry); putArt('cs_woodpile', x - c * 3.6 - s * 0.6, z + s * 3.6 - c * 0.6, ry + 1.57, 0.8); if (i % 2 === 0) putArt('cs_haystack', x + c * 4.4 - s * 2.2, z - s * 4.4 - c * 2.2, q() * 6, 0.9 + q() * 0.3); });
  const cx = sx / houses.length, cz = sz / houses.length; if (well) putArt('cs_well', well[0], well[1], q() * 3); else putArt('cs_well', cx + 1.5, cz + 4.5, q() * 3); putArt('cs_cart', cx - 5, cz + 6, 0.6 + q());
}
