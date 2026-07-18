/* 케이파크 · 마블런 — hexgrid.js
 * 육각 격자 순수 수학. DOM/Three.js 의존 제로.
 * flat-top 육각, axial 좌표 (q, r).
 * 월드 변환: x = 1.5·R·q,  z = √3·R·(r + q/2),  y = h·H
 */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  // 포트 k는 이웃 k를 향한다. 반대 포트 = (k+3)%6 (오프셋이 정확히 음수쌍).
  const NEIGHBORS = [
    [ 1,  0], // P0
    [ 1, -1], // P1
    [ 0, -1], // P2
    [-1,  0], // P3
    [-1,  1], // P4
    [ 0,  1], // P5
  ];

  const SQRT3 = Math.sqrt(3);

  function tileCenter(q, r, R) {
    return { x: 1.5 * R * q, z: SQRT3 * R * (r + q / 2) };
  }

  function neighborOf(q, r, port) {
    const d = NEIGHBORS[port];
    return { q: q + d[0], r: r + d[1] };
  }

  function opposite(port) {
    return (port + 3) % 6;
  }

  // 포트 방향 단위벡터 (수평)
  function portDir(q, r, port, R) {
    const c = tileCenter(q, r, R);
    const n = neighborOf(q, r, port);
    const cn = tileCenter(n.q, n.r, R);
    const dx = cn.x - c.x, dz = cn.z - c.z;
    const L = Math.hypot(dx, dz);
    return { x: dx / L, z: dz / L };
  }

  // 포트 변 중점 (인접 타일 중심의 정중앙)
  function portMid(q, r, port, R) {
    const c = tileCenter(q, r, R);
    const n = neighborOf(q, r, port);
    const cn = tileCenter(n.q, n.r, R);
    return { x: (c.x + cn.x) / 2, z: (c.z + cn.z) / 2 };
  }

  function key(q, r) { return q + ',' + r; }

  return { hexgrid: { NEIGHBORS, SQRT3, tileCenter, neighborOf, opposite, portDir, portMid, key } };
});
