/* 케이파크 · 마블런 — parts/mergepart.js
 * 🤝 합류 (M2b-4): 두 갈래가 다시 하나로 만나는 부품. 트리 → DAG의 핵심.
 *
 * 기하 = 시간을 거꾸로 돌린 스위치:
 *  - 좌/우 진입 절반: 진입 포트 → 중심 (2차 베지어, 좌우 거울 대칭 → 호길이 동일)
 *    베지어 제어점은 중심 뒤편(출구 반대 방향)에 두어 중심에서의 접선이 출구 직선과 이어진다.
 *  - 출구 절반: 중심 → 출구 포트 (직선, 어느 팔로 들어와도 완전히 동일)
 *  → 합류 이후 구간 기하는 모든 경로가 공유 — 꼬리(tail) 웨이포인트 완전 일치.
 *
 * 포트 계약: piece.rot = 출구 포트 X. 진입은 (X+2)%6 (arm 0) / (X+4)%6 (arm 1).
 *  두 갈래는 같은 타일·같은 높이·서로 120° 각도로 들어와야 한다 (builder가 검증).
 * piece.arm: 이 경로(잎)가 어느 팔로 들어오는지 — leafPieces가 각인.
 * 분기 결정 없음 → decide 마크 없음, MultiSim 변경 불필요 (구슬은 그냥 지나간다).
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  function NS() {
    if (root.MarbleSim && root.MarbleSim.hexgrid && root.MarbleSim.PARTS) return root.MarbleSim;
    const hx = require('../hexgrid.js');
    const pt = require('./basic.js');
    return Object.assign({}, hx, pt);
  }

  const ENTRY_N = 6; // 진입 절반(베지어) 세그먼트 수 — 스위치 출구 절반의 거울
  const EXIT_N = 4;  // 출구 절반(직선) — 스위치 진입 절반의 거울

  function entryPortOf(p) { return (p.rot + (p.arm === 1 ? 4 : 2)) % 6; }

  function pathMerge(piece, C) {
    const { hexgrid: hx } = NS();
    const e = hx.portMid(piece.q, piece.r, entryPortOf(piece), C.R);
    const c = hx.tileCenter(piece.q, piece.r, C.R);
    const x = hx.portMid(piece.q, piece.r, piece.rot, C.R);
    const y = piece.h * C.H + C.MR;
    const pts = [];
    // 1) 진입 절반: 포트 → 중심 (베지어, 제어점 = 중심에서 출구 반대쪽으로 연장)
    const dx = x.x - c.x, dz = x.z - c.z;
    const dl = Math.hypot(dx, dz) || 1;
    const ctrl = { x: c.x - (dx / dl) * dl * 0.5, z: c.z - (dz / dl) * dl * 0.5 };
    for (let i = 0; i <= ENTRY_N; i++) {
      const t = i / ENTRY_N, a = 1 - t;
      pts.push({
        x: a * a * e.x + 2 * a * t * ctrl.x + t * t * c.x,
        z: a * a * e.z + 2 * a * t * ctrl.z + t * t * c.z,
        y,
      });
    }
    // 2) 출구 절반: 중심 → 출구 포트 (직선, 팔 무관 공유)
    for (let i = 1; i <= EXIT_N; i++) {
      const t = i / EXIT_N;
      pts.push({ x: c.x + (x.x - c.x) * t, y, z: c.z + (x.z - c.z) * t });
    }
    return { points: pts };
  }

  const spec = {
    label: '합류',
    entryPort: entryPortOf,
    exitPort: (p) => p.rot,
    entryY: (p, C) => p.h * C.H + C.MR,
    exitY: (p, C) => p.h * C.H + C.MR,
    path: pathMerge,
    bowl: false,
    isMerge: true,
  };

  const ns = NS();
  if (ns.PARTS) ns.PARTS.merge = spec;

  return { MERGE: spec, MERGE_ENTRY_N: ENTRY_N };
});
