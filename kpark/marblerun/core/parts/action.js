/* 케이파크 · 마블런 — parts/action.js
 * 액션 부품 6종 (M2a — 순수 RAIL 스플라인 계열, 체인 빌더 호환).
 * basic.js 뒤에 로드 — NS.PARTS에 병합.
 *
 * ⛰ hill    언덕: 봉우리(0.9H)를 넘어라 — 속도 부족이면 역행하는 드라마
 * ➰ loop    루프: 360° 수직 루프 — 충분한 속도 필요
 * 🌀 gyro    자이로 낙하: 나선 2회전, 높이 2칸 급강하 (exitH ≥ 2 필요)
 * 🛫 jump    점프: 레일이 끊긴 공중 구간 (air: 마찰 0)
 * 🚀 booster 부스터: 통과하면 가속 (boost 구간: 음의 마찰)
 * 〰 zigzag  지그재그: 좌우 물결 — 곡률 마찰의 맛
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  const NS = root.MarbleSim = root.MarbleSim || {};
  NS.PARTS = Object.assign(NS.PARTS || {}, mod.ACTION_PARTS);
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  function NSOf() {
    if (root.MarbleSim && root.MarbleSim.hexgrid && root.MarbleSim.CONST) return root.MarbleSim;
    const hx = require('../hexgrid.js');
    const bs = require('./basic.js');
    return Object.assign({}, hx, bs);
  }

  function baseY(piece, C) { return piece.h * C.H + C.MR; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function coseE(a, b, t) { return a + (b - a) * (1 - Math.cos(Math.PI * t)) / 2; }

  function ends(piece, C) {
    const { hexgrid: hx } = NSOf();
    return {
      e: hx.portMid(piece.q, piece.r, piece.rot, C.R),
      x: hx.portMid(piece.q, piece.r, (piece.rot + 3) % 6, C.R),
      c: hx.tileCenter(piece.q, piece.r, C.R),
    };
  }

  // ---- ⛰ 언덕 ----
  const HILL_BUMP_H = 0.9; // 봉우리 = 0.9칸 (같은 높이 출발이면 아슬아슬)
  function pathHill(piece, C) {
    const { e, x } = ends(piece, C);
    const y = baseY(piece, C);
    const bump = HILL_BUMP_H * C.H;
    const pts = [];
    const N = 14;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push({ x: lerp(e.x, x.x, t), z: lerp(e.z, x.z, t), y: y + bump * (1 - Math.cos(2 * Math.PI * t)) / 2 });
    }
    return pts;
  }

  // ---- ➰ 루프 ----
  const R_LOOP = 0.045; // 꼭대기 = 2R_LOOP = 1.8칸 상당
  function pathLoop(piece, C) {
    const { e, x } = ends(piece, C);
    const y = baseY(piece, C);
    const ux = x.x - e.x, uz = x.z - e.z;
    const L = Math.hypot(ux, uz);
    const dx = ux / L, dz = uz / L;
    const mid = { x: (e.x + x.x) / 2, z: (e.z + x.z) / 2 };
    const pts = [{ x: e.x, y, z: e.z }];
    // 진입
    for (let i = 1; i <= 3; i++) {
      const t = i / 3;
      pts.push({ x: lerp(e.x, mid.x, t), y, z: lerp(e.z, mid.z, t) });
    }
    // 원: 바닥에서 진행 방향으로 진입, 한 바퀴
    const cy = y + R_LOOP;
    const N = 26;
    for (let i = 1; i <= N; i++) {
      const th = (2 * Math.PI * i) / N;
      pts.push({
        x: mid.x + dx * R_LOOP * Math.sin(th),
        y: cy - R_LOOP * Math.cos(th),
        z: mid.z + dz * R_LOOP * Math.sin(th),
      });
    }
    // 진출
    for (let i = 1; i <= 3; i++) {
      const t = i / 3;
      pts.push({ x: lerp(mid.x, x.x, t), y, z: lerp(mid.z, x.z, t) });
    }
    return pts;
  }

  // ---- 🌀 자이로 낙하 (2칸 하강 나선) ----
  function pathGyro(piece, C) {
    const { hexgrid: hx } = NSOf();
    const { e, x, c } = ends(piece, C);
    const yTop = baseY(piece, C) + 2 * C.H;
    const yBot = baseY(piece, C);
    const thE = Math.atan2(e.z - c.z, e.x - c.x);
    const rIn = Math.hypot(e.x - c.x, e.z - c.z);
    const rMin = 0.05;
    const TURNS = 2;
    const pts = [];
    const N = 30;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const th = thE + Math.PI * (2 * TURNS + 1) * t; // 2회전 + 반바퀴 → 반대편 출구
      const rad = rIn - (rIn - rMin) * Math.sin(Math.PI * t); // 들어갔다 나오는 반경
      pts.push({
        x: c.x + rad * Math.cos(th),
        z: c.z + rad * Math.sin(th),
        y: coseE(yTop, yBot, t),
      });
    }
    pts[N] = { x: x.x, y: yBot, z: x.z }; // 출구 정합
    return pts;
  }

  // ---- 🛫 점프 (공중 구간) ----
  function pathJump(piece, C) {
    const { e, x } = ends(piece, C);
    const y = baseY(piece, C);
    const tipT = 0.32, landT = 0.78;
    const tipY = y + 0.018, landY = y + 0.002, apexY = y + 0.032;
    const pts = [];
    const N = 18;
    let tipI = -1, landI = -1;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      let yy;
      if (t <= tipT) yy = coseE(y, tipY, t / tipT);
      else if (t <= landT) {
        // 팁→착지 포물선 (정점 apexY)
        const u = (t - tipT) / (landT - tipT); // 0..1
        yy = (1 - u) * (1 - u) * tipY + 2 * (1 - u) * u * apexY + u * u * landY;
      } else yy = coseE(landY, y, (t - landT) / (1 - landT));
      pts.push({ x: lerp(e.x, x.x, t), z: lerp(e.z, x.z, t), y: yy });
      if (tipI < 0 && t >= tipT) tipI = i;
      if (landI < 0 && t >= landT) landI = i;
    }
    return { points: pts, marks: [{ kind: 'air', i0: tipI, i1: landI }] };
  }

  // ---- 🚀 부스터 ----
  function pathBooster(piece, C) {
    const { e, x } = ends(piece, C);
    const y = baseY(piece, C);
    const pts = [];
    const N = 8;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push({ x: lerp(e.x, x.x, t), y, z: lerp(e.z, x.z, t) });
    }
    return { points: pts, marks: [{ kind: 'boost', i0: 1, i1: N - 1 }] };
  }

  // ---- 〰 지그재그 ----
  function pathZigzag(piece, C) {
    const { e, x } = ends(piece, C);
    const y = baseY(piece, C);
    const ux = x.x - e.x, uz = x.z - e.z;
    const L = Math.hypot(ux, uz);
    const nx = uz / L, nz = -ux / L; // 수평 법선
    const A = 0.03;
    const pts = [];
    const N = 20;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const off = A * Math.sin(4 * Math.PI * t) * Math.sin(Math.PI * t);
      pts.push({ x: lerp(e.x, x.x, t) + nx * off, y, z: lerp(e.z, x.z, t) + nz * off });
    }
    return pts;
  }

  // ---- 레지스트리 (전부 진입=rot, 출구=반대 포트) ----
  function flat(pathFn, label, extra) {
    return Object.assign({
      label,
      entryPort: (p) => p.rot,
      exitPort: (p) => (p.rot + 3) % 6,
      entryY: (p, C) => baseY(p, C),
      exitY: (p, C) => baseY(p, C),
      path: pathFn,
      bowl: false,
    }, extra || {});
  }

  const ACTION_PARTS = {
    hill:    flat(pathHill, '언덕'),
    loop:    flat(pathLoop, '루프'),
    jump:    flat(pathJump, '점프'),
    booster: flat(pathBooster, '부스터'),
    zigzag:  flat(pathZigzag, '지그재그'),
    gyro: flat(pathGyro, '자이로 낙하', {
      entryY: (p, C) => baseY(p, C) + 2 * C.H, // 2칸 위에서 진입
    }),
  };

  return { ACTION_PARTS };
});
