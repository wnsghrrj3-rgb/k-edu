/* 케이파크 · 마블런 — parts/lifter.js
 * 🛗 리프터 (M4): 구슬을 받아 나선 계단으로 2칸 올려주는 모터 부품.
 * 유일하게 에너지를 "주입"하는 부품 — 낮은 곳의 구슬에게 두 번째 기회를 준다.
 * 낮게 깔린 트랙 → 리프터 → 다시 높은 곳에서 액션 = 무한 확장의 핵심.
 *
 * 경로: 진입 포트 → 중심 (평지) → 나선 1.75바퀴 상승 (+2칸, motor 구간) → 상단 출구 포트.
 * 높이 계약: entryY = h·H,  exitY = (h+2)·H.  마크: { kind:'motor', i0, i1 } — 구간 내 v = liftSpeed 고정.
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  const NS = root.MarbleSim = root.MarbleSim || {};
  NS.PARTS = Object.assign(NS.PARTS || {}, mod.LIFTER_PARTS);
  NS.LIFT_RISE = mod.LIFT_RISE;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  function NSOf() {
    if (root.MarbleSim && root.MarbleSim.hexgrid && root.MarbleSim.CONST) return root.MarbleSim;
    const hx = require('../hexgrid.js');
    const bs = require('./basic.js');
    return Object.assign({}, hx, bs);
  }

  const LIFT_RISE = 2;        // 상승 칸수
  const HELIX_TURNS = 1.75;   // 나선 회전수
  const HELIX_R = 0.32;       // 나선 반경 (R 배수)

  function baseY(piece, C) { return piece.h * C.H + C.MR; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function pathLifter(piece, C) {
    const { hexgrid: hx } = NSOf();
    const e = hx.portMid(piece.q, piece.r, piece.rot, C.R);
    const x = hx.portMid(piece.q, piece.r, (piece.rot + 3) % 6, C.R);
    const c = hx.tileCenter(piece.q, piece.r, C.R);
    const y0 = baseY(piece, C);
    const y1 = y0 + LIFT_RISE * C.H;
    const rr = HELIX_R * C.R;
    const pts = [];

    // 1) 진입 포트 → 나선 시작점 (평지 접근)
    const thIn = Math.atan2(e.z - c.z, e.x - c.x);       // 입구 방향 각
    const hin = { x: c.x + rr * Math.cos(thIn), z: c.z + rr * Math.sin(thIn) };
    const NA = 3;
    for (let i = 0; i <= NA; i++) {
      const t = i / NA;
      pts.push({ x: lerp(e.x, hin.x, t), y: y0, z: lerp(e.z, hin.z, t) });
    }

    // 2) 나선 상승 (motor 구간) — 입구 각에서 출구 각까지 1.75바퀴
    const thOutTarget = Math.atan2(x.z - c.z, x.x - c.x);
    let sweep = 2 * Math.PI * HELIX_TURNS;
    // 출구 각도에 정확히 도달하도록 스윕 보정
    const endTh = thIn + sweep;
    const diff = ((thOutTarget - endTh) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    sweep += diff;
    const NH = 30;
    const motorI0 = pts.length - 1; // 나선 시작점부터 모터
    for (let i = 1; i <= NH; i++) {
      const t = i / NH;
      const th = thIn + sweep * t;
      pts.push({
        x: c.x + rr * Math.cos(th),
        y: lerp(y0, y1, t),
        z: c.z + rr * Math.sin(th),
      });
    }
    const motorI1 = pts.length - 1;

    // 3) 나선 끝 → 상단 출구 포트 (평지 방출)
    const hout = pts[pts.length - 1];
    const NB = 3;
    for (let i = 1; i <= NB; i++) {
      const t = i / NB;
      pts.push({ x: lerp(hout.x, x.x, t), y: y1, z: lerp(hout.z, x.z, t) });
    }

    return { points: pts, marks: [{ kind: 'motor', i0: motorI0, i1: motorI1 }] };
  }

  const LIFTER_PARTS = {
    lifter: {
      label: '리프터',
      entryPort: (p) => p.rot,
      exitPort: (p) => (p.rot + 3) % 6,
      entryY: (p, C) => baseY(p, C),
      exitY: (p, C) => baseY(p, C) + LIFT_RISE * C.H,
      path: pathLifter,
      bowl: false,
    },
  };

  return { LIFTER_PARTS, LIFT_RISE };
});
