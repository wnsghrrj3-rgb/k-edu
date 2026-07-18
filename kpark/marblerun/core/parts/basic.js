/* 케이파크 · 마블런 — parts/basic.js
 * 티어1 기본 부품 스펙 (M0: 5종). 렌더 무관 순수 로직.
 * 부품 = { 포트 정의, 경로 웨이포인트, 높이 계약 }
 * 웨이포인트 y = 구슬 중심 높이 (판 높이 + MR).
 *
 * 배치: piece = { type, q, r, h, rot }
 *  - h  = 기둥 스택 개수 (판 높이 = h·H)
 *  - rot = 진입 포트 인덱스 (start는 출구 포트)
 *
 * 높이 계약:
 *  - straight/curve/goal : entryY = exitY = h·H
 *  - slope               : entryY = (h+1)·H → exitY = h·H  (경사면, 높이 1칸 하강)
 *  - start               : exitY = h·H (깔때기 낙차 FUNNEL_DROP로 초기 속도 부여)
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  // 물리·기하 상수 (M0 튜닝 값 — 골든 시나리오가 회귀 방어선)
  const CONST = {
    R: 0.10,          // 타일 외접반경 (m) — 이웃 중심거리 = √3·R ≈ 0.173m
    H: 0.05,          // 기둥 1칸 단위높이 (m)
    MR: 0.012,        // 구슬 반지름 (m)
    FUNNEL_DROP: 0.03, // 시작탑 깔때기 낙차 (m) → v₀ ≈ 0.77 m/s
  };

  function hex() { return (root.MarbleSim || (typeof module !== 'undefined' ? require('../hexgrid.js') : {})).hexgrid; }

  function baseY(piece, C) { return piece.h * C.H + C.MR; }

  // 코사인 이즈 보간 (경사·낙차의 dh/ds 연속성)
  function coseELerp(a, b, t) {
    const u = (1 - Math.cos(Math.PI * t)) / 2;
    return a + (b - a) * u;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // ---- 부품별 경로 생성 ----

  function pathStart(piece, C) {
    const hx = hex();
    const c = hx.tileCenter(piece.q, piece.r, C.R);
    const exitP = hx.portMid(piece.q, piece.r, piece.rot, C.R);
    const y0 = baseY(piece, C) + C.FUNNEL_DROP;
    const y1 = baseY(piece, C);
    const pts = [];
    const N = 6;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push({
        x: lerp(c.x, exitP.x, t),
        z: lerp(c.z, exitP.z, t),
        y: coseELerp(y0, y1, t),
      });
    }
    return pts;
  }

  function pathStraight(piece, C) {
    const hx = hex();
    const e = hx.portMid(piece.q, piece.r, piece.rot, C.R);
    const c = hx.tileCenter(piece.q, piece.r, C.R);
    const x = hx.portMid(piece.q, piece.r, hx.opposite(piece.rot), C.R);
    const y = baseY(piece, C);
    return [
      { x: e.x, y, z: e.z },
      { x: c.x, y, z: c.z },
      { x: x.x, y, z: x.z },
    ];
  }

  function pathCurve(piece, C, turn) {
    // turn: +2 (좌 120°) | +4 (우 120°). 2차 베지어 (제어점 = 타일 중심)
    const hx = hex();
    const e = hx.portMid(piece.q, piece.r, piece.rot, C.R);
    const c = hx.tileCenter(piece.q, piece.r, C.R);
    const x = hx.portMid(piece.q, piece.r, (piece.rot + turn) % 6, C.R);
    const y = baseY(piece, C);
    const pts = [];
    const N = 8;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const a = 1 - t;
      pts.push({
        x: a * a * e.x + 2 * a * t * c.x + t * t * x.x,
        z: a * a * e.z + 2 * a * t * c.z + t * t * x.z,
        y,
      });
    }
    return pts;
  }

  function pathSlope(piece, C) {
    const hx = hex();
    const e = hx.portMid(piece.q, piece.r, piece.rot, C.R);
    const x = hx.portMid(piece.q, piece.r, hx.opposite(piece.rot), C.R);
    const y0 = baseY(piece, C) + C.H; // 진입(높은 쪽)
    const y1 = baseY(piece, C);       // 출구(낮은 쪽)
    const pts = [];
    const N = 10;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push({
        x: lerp(e.x, x.x, t),
        z: lerp(e.z, x.z, t),
        y: coseELerp(y0, y1, t),
      });
    }
    return pts;
  }

  function pathGoal(piece, C) {
    const hx = hex();
    const e = hx.portMid(piece.q, piece.r, piece.rot, C.R);
    const c = hx.tileCenter(piece.q, piece.r, C.R);
    const y = baseY(piece, C);
    // 그릇: 입구 → 중심, 살짝 오목 (중심이 0.4·MR 낮음)
    const pts = [];
    const N = 6;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push({
        x: lerp(e.x, c.x, t),
        z: lerp(e.z, c.z, t),
        y: y - 0.4 * C.MR * Math.sin(Math.PI * t / 2),
      });
    }
    return pts;
  }

  // ---- 부품 레지스트리 ----
  // meta: entryPort/exitPort(piece) → 포트 인덱스 | null, entryY/exitY(piece,C) → 구슬 중심 y
  const PARTS = {
    start: {
      label: '시작탑',
      entryPort: () => null,
      exitPort: (p) => p.rot,
      entryY: () => null,
      exitY: (p, C) => baseY(p, C),
      path: pathStart,
      bowl: false,
    },
    straight: {
      label: '직선 레일',
      entryPort: (p) => p.rot,
      exitPort: (p) => (p.rot + 3) % 6,
      entryY: (p, C) => baseY(p, C),
      exitY: (p, C) => baseY(p, C),
      path: pathStraight,
      bowl: false,
    },
    curve_l: {
      label: '커브(좌)',
      entryPort: (p) => p.rot,
      exitPort: (p) => (p.rot + 2) % 6,
      entryY: (p, C) => baseY(p, C),
      exitY: (p, C) => baseY(p, C),
      path: (p, C) => pathCurve(p, C, 2),
      bowl: false,
    },
    curve_r: {
      label: '커브(우)',
      entryPort: (p) => p.rot,
      exitPort: (p) => (p.rot + 4) % 6,
      entryY: (p, C) => baseY(p, C),
      exitY: (p, C) => baseY(p, C),
      path: (p, C) => pathCurve(p, C, 4),
      bowl: false,
    },
    slope: {
      label: '경사 레일',
      entryPort: (p) => p.rot,
      exitPort: (p) => (p.rot + 3) % 6,
      entryY: (p, C) => baseY(p, C) + C.H,
      exitY: (p, C) => baseY(p, C),
      path: pathSlope,
      bowl: false,
    },
    goal: {
      label: '골 벨',
      entryPort: (p) => p.rot,
      exitPort: () => null,
      entryY: (p, C) => baseY(p, C),
      exitY: () => null,
      path: pathGoal,
      bowl: true, // 그릇 감쇠 구간
    },
  };

  return { CONST, PARTS };
});
