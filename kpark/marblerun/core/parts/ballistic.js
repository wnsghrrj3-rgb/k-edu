/* 케이파크 · 마블런 — parts/ballistic.js
 * 탄도 부품 2종 (M2b-1). 진짜 AIR 상태머신을 쓰는 첫 부품군.
 *
 * 💥 cannon      대포: 3타일 건너 착지대로 발사 (45°, 부스트 1.40)
 * 🤸 trampoline  트램펄린: 2타일 건너 착지대로 튕김 (50°, 부스트 1.00)
 *
 * 핵심 설계:
 *  - 두 부품 모두 "발사대 타일 + 비행 타일들 + 착지대 타일"을 한 번에 점유하는 **스팬 부품**.
 *    탭 한 번 = 부품 하나 (체인 모델 불변). span = 착지대까지의 타일 수.
 *  - 경로 웨이포인트의 공중 구간은 **설계 궤적**(정확히 착지대 중심에 꽂히는 속도)일 뿐,
 *    실제 시뮬은 sim이 발사 지점에서 진짜 포물선을 적분한다. 빠르면 넘어가고 느리면 못 미친다.
 *  - 포획 판정: 하강 중 착지대 평면(y=착지 높이) 통과 시 수평거리 ≤ catchR 이면 레일 복귀.
 *    실패하면 그대로 낙하 → crash. "들어갈까?!" 의 긴장이 전부 여기서 나온다.
 *
 * 튜닝 근거 (C.R=0.10 → 이웃 중심거리 d0=√3·R≈0.1732m, g=9.81):
 *   대포     D=3·d0=0.520m, 45°, boost 1.64 → 기준 진입 v≈1.35 m/s
 *   트램펄린 D=2·d0=0.346m, 50°, boost 1.27 → 기준 진입 v≈0.95 m/s
 *
 * 착지대는 **깔때기 + 뒷벽(백보드)** 구조:
 *   |오차| ≤ catchR(0.088)          → 깨끗한 포획 (속도 85% 유지)
 *   오버 catchR~wallR(0.16), 낮게    → 백보드에 맞고 툭 떨어짐 (속도 45%)
 *   그 밖                            → 빗나감 → 추락
 * → "느리면 못 건넌다"는 그대로 살리고, 빠른 쪽은 백보드가 받아준다.
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  const NS = root.MarbleSim = root.MarbleSim || {};
  NS.PARTS = Object.assign(NS.PARTS || {}, mod.BALLISTIC_PARTS);
  NS.BALLISTIC = mod.BALLISTIC;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  function NSOf() {
    if (root.MarbleSim && root.MarbleSim.hexgrid && root.MarbleSim.CONST) return root.MarbleSim;
    const hx = require('../hexgrid.js');
    const bs = require('./basic.js');
    return Object.assign({}, hx, bs);
  }

  const BALLISTIC = {
    cannon:     { span: 3, angle: Math.PI / 4,          boost: 1.64, catchR: 0.088, wallR: 0.16, wallH: 0.05, arcN: 20 },
    trampoline: { span: 2, angle: (50 * Math.PI) / 180, boost: 1.27, catchR: 0.088, wallR: 0.16, wallH: 0.05, arcN: 16 },
  };

  function baseY(piece, C) { return piece.h * C.H + C.MR; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* 발사대 타일에서 dirPort 방향으로 n칸 간 타일 */
  function tileAhead(piece, n) {
    const { hexgrid: hx } = NSOf();
    const dirPort = (piece.rot + 3) % 6;
    let q = piece.q, r = piece.r;
    for (let i = 0; i < n; i++) { const t = hx.neighborOf(q, r, dirPort); q = t.q; r = t.r; }
    return { q, r, dirPort };
  }

  function makePath(spec) {
    return function (piece, C) {
      const { hexgrid: hx } = NSOf();
      const y = baseY(piece, C);
      const land = tileAhead(piece, spec.span);
      const A = hx.tileCenter(piece.q, piece.r, C.R);        // 발사 지점 (발사대 중심)
      const B = hx.tileCenter(land.q, land.r, C.R);          // 착지 지점 (착지대 중심)
      const entry = hx.portMid(piece.q, piece.r, piece.rot, C.R);
      const exit = hx.portMid(land.q, land.r, land.dirPort, C.R);

      const D = Math.hypot(B.x - A.x, B.z - A.z);
      const apex = (D * Math.tan(spec.angle)) / 4;           // 등고 발사 포물선 정점

      const pts = [{ x: entry.x, y, z: entry.z }, { x: A.x, y, z: A.z }];
      const iLaunch = 1;
      const N = spec.arcN;
      for (let i = 1; i <= N; i++) {
        const t = i / N;
        pts.push({
          x: lerp(A.x, B.x, t),
          z: lerp(A.z, B.z, t),
          y: y + 4 * apex * t * (1 - t),
        });
      }
      const iLand = pts.length - 1;                          // 착지대 중심
      pts.push({ x: exit.x, y, z: exit.z });

      return {
        points: pts,
        marks: [
          { kind: 'air', i0: iLaunch, i1: iLand },           // 레일 렌더 끊김 + 마찰 0
          { kind: 'launch', i: iLaunch, iLand, angle: spec.angle, boost: spec.boost,
            catchR: spec.catchR, wallR: spec.wallR, wallH: spec.wallH },
        ],
      };
    };
  }

  function ballisticPart(key, label) {
    const spec = BALLISTIC[key];
    return {
      label,
      span: spec.span,
      entryPort: (p) => p.rot,
      exitPort: (p) => (p.rot + 3) % 6,
      exitTile: (p) => { const t = tileAhead(p, spec.span); return { q: t.q, r: t.r }; },
      entryY: (p, C) => baseY(p, C),
      exitY: (p, C) => baseY(p, C),
      path: makePath(spec),
      bowl: false,
    };
  }

  const BALLISTIC_PARTS = {
    cannon: ballisticPart('cannon', '대포'),
    trampoline: ballisticPart('trampoline', '트램펄린'),
  };

  return { BALLISTIC_PARTS, BALLISTIC, tileAhead };
});
