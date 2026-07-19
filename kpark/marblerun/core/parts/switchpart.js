/* 케이파크 · 마블런 — parts/switchpart.js
 * 🔀 스위치 (M2b-2): 구슬이 지날 때마다 방향이 딸깍 바뀌는 교대 분기.
 *
 * 기하 계약 (경로 교체 무결성의 핵심):
 *  - 경로 = [진입 포트 → 타일 중심] 직선 절반  +  [중심 → 출구 포트] 베지어 절반
 *  - 진입 절반은 좌/우 방향과 무관하게 완전히 동일 → 분기점(중심) 이전 기하 공유
 *  - 좌/우 출구 절반은 거울 대칭 → 호길이 동일
 *  → MultiSim이 분기점에서 잎 경로를 교체해도 s·위치·에너지가 이어진다.
 *
 * piece.dir: 0 = 왼길 (rot+2), 1 = 오른길 (rot+4). 잎(leaf) 빌드 시 지정.
 * marks: {kind:'decide', i} — 분기점(중심) 웨이포인트 인덱스. graph가 전역 인덱스로 승격.
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

  const ENTRY_N = 4; // 진입 절반 세그먼트 수 → 분기점 인덱스 = ENTRY_N
  const EXIT_N = 6;

  function exitPortOf(p) { return (p.rot + (p.dir === 1 ? 4 : 2)) % 6; }

  function pathSwitch(piece, C) {
    const { hexgrid: hx } = NS();
    const e = hx.portMid(piece.q, piece.r, piece.rot, C.R);
    const c = hx.tileCenter(piece.q, piece.r, C.R);
    const x = hx.portMid(piece.q, piece.r, exitPortOf(piece), C.R);
    const y = piece.h * C.H + C.MR;
    const pts = [];
    // 1) 진입 절반: 포트 → 중심 (직선, 방향 무관 공유)
    for (let i = 0; i <= ENTRY_N; i++) {
      const t = i / ENTRY_N;
      pts.push({ x: e.x + (c.x - e.x) * t, y, z: e.z + (c.z - e.z) * t });
    }
    // 2) 출구 절반: 중심 → 출구 포트 (2차 베지어, 제어점 = 중심에서 진입방향으로 살짝 연장)
    const dx = c.x - e.x, dz = c.z - e.z;
    const dl = Math.hypot(dx, dz) || 1;
    const ctrl = { x: c.x + (dx / dl) * dl * 0.5, z: c.z + (dz / dl) * dl * 0.5 };
    for (let i = 1; i <= EXIT_N; i++) {
      const t = i / EXIT_N, a = 1 - t;
      pts.push({
        x: a * a * c.x + 2 * a * t * ctrl.x + t * t * x.x,
        z: a * a * c.z + 2 * a * t * ctrl.z + t * t * x.z,
        y,
      });
    }
    return { points: pts, marks: [{ kind: 'decide', i: ENTRY_N }] };
  }

  const spec = {
    label: '스위치',
    entryPort: (p) => p.rot,
    exitPort: exitPortOf,
    entryY: (p, C) => p.h * C.H + C.MR,
    exitY: (p, C) => p.h * C.H + C.MR,
    path: pathSwitch,
    bowl: false,
    isSwitch: true,
  };

  const ns = NS();
  if (ns.PARTS) ns.PARTS.switch = spec;

  return { SWITCH: spec, SWITCH_ENTRY_N: ENTRY_N };
});
