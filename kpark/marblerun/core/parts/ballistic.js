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
 *   대포     D=3·d0=0.520m, 45°, boost 2.05, wallR 0.15 → 진입 0.37~1.57 성공
 *   트램펄린 D=2·d0=0.346m, 50°, boost 1.44, wallR 0.26 → 진입 0~1.96 성공
 *
 * ⚠ 실측 기반 (v1 튜닝 실패 교훈):
 *   평지 체인(낙차 없음)에서 부품에 도달하는 실제 진입 속도는 0.7~0.9 m/s 수준이다.
 *   v1은 이상적 값 1.35를 가정해 boost를 역산했고, 그 결과 대포가 **항상 못 미쳐 추락**했다.
 *   튜닝 기준점은 반드시 "평지에서 그냥 이어붙인 구슬"(≈0.75)이어야 한다.
 *
 * 부품 성격 분담 — 차이는 **과속 허용치**로 만든다:
 *   이 스케일(한 칸 0.17m)에서는 두 부품 다 자체 추진력이 지배적이라
 *   "느려서 못 건넌다"로는 난이도를 가를 수 없다. 대신 착지대 폭으로 가른다.
 *   💥 대포     = 좁고 정밀한 착지대(wallR 0.15). 부스터를 얹으면 **넘겨버린다**. (진입 1.57 초과)
 *   🤸 트램펄린 = 넓은 매트(wallR 0.26). 웬만한 과속은 받아낸다. (진입 1.96까지)
 *   → 입문은 트램펄린, 속도 관리 학습은 대포. 발견 가능한 실패는 항상 "오버".
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
    cannon:     { span: 3, angle: Math.PI / 4,          boost: 2.05, catchR: 0.088, wallR: 0.15, wallH: 0.05, arcN: 20 },
    trampoline: { span: 2, angle: (50 * Math.PI) / 180, boost: 1.44, catchR: 0.088, wallR: 0.26, wallH: 0.05, arcN: 16 },
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
