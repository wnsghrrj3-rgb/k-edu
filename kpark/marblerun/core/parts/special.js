/* 케이파크 · 마블런 — parts/special.js
 * 티어3 특수 부품 4종 (M5). 렌더 무관 순수 로직.
 *
 * 🎨 colorgate 색 게이트 : 지정 색 구슬만 통과 — 다른 색은 팅! 튕겨 나온다.
 *                          색은 상태가 아니라 설정 (piece.color 0=🔵 1=🩷 2=🟡, 탭으로 순환).
 *                          스위치의 "역행하면 결정이 풀린다"와 만나면 자동 색 분류기가 태어난다.
 * 🏁 racegate  레이스 게이트 : 결승 아치 — 구슬마다 자기 출발 기준 통과 시간을 기록 (포토피니시).
 * 🁢 domino    도미노 : 구슬이 지나가면 레일 양옆 도미노가 와르르 — 순수 연출 (물리 영향 없음).
 * 🎼 orgol     종착 오르골 : 골의 자매 부품 — 도착 순서대로 멜로디 한 음씩. 트랙이 악기가 된다.
 *
 * 기하: gate/finish/domino = 직선 레일 + 중앙 단일 마크. orgol = 골 그릇과 동일 계약.
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  const NS = root.MarbleSim = root.MarbleSim || {};
  NS.PARTS = Object.assign(NS.PARTS || {}, mod.SPECIAL_PARTS);
  NS.GATE_COLORS = mod.GATE_COLORS;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  function NSOf() {
    if (root.MarbleSim && root.MarbleSim.hexgrid && root.MarbleSim.CONST) return root.MarbleSim;
    const hx = require('../hexgrid.js');
    const bs = require('./basic.js');
    return Object.assign({}, hx, bs);
  }

  // 게이트 색 팔레트 — 구슬 색(m % 3)과 같은 순서
  const GATE_COLORS = [
    { name: '파랑', emoji: '🔵' },
    { name: '분홍', emoji: '🩷' },
    { name: '노랑', emoji: '🟡' },
  ];

  function baseY(piece, C) { return piece.h * C.H + C.MR; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* 직선 5점 경로 — 중앙(인덱스 2)이 마크 지점 */
  function pathStraight5(piece, C) {
    const { hexgrid: hx } = NSOf();
    const e = hx.portMid(piece.q, piece.r, piece.rot, C.R);
    const x = hx.portMid(piece.q, piece.r, (piece.rot + 3) % 6, C.R);
    const y = baseY(piece, C);
    const pts = [];
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      pts.push({ x: lerp(e.x, x.x, t), z: lerp(e.z, x.z, t), y });
    }
    return pts;
  }

  function pathGate(piece, C)   { return { points: pathStraight5(piece, C), marks: [{ kind: 'gate',   i: 2 }] }; }
  function pathFinish(piece, C) { return { points: pathStraight5(piece, C), marks: [{ kind: 'finish', i: 2 }] }; }
  function pathDomino(piece, C) { return { points: pathStraight5(piece, C), marks: [{ kind: 'domino', i: 2 }] }; }

  /* 오르골 그릇: 골 벨과 동일 계약 (입구 → 중심, 살짝 오목) */
  function pathOrgol(piece, C) {
    const { hexgrid: hx } = NSOf();
    const e = hx.portMid(piece.q, piece.r, piece.rot, C.R);
    const c = hx.tileCenter(piece.q, piece.r, C.R);
    const y = baseY(piece, C);
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

  const straightMeta = {
    entryPort: (p) => p.rot,
    exitPort: (p) => (p.rot + 3) % 6,
    entryY: (p, C) => baseY(p, C),
    exitY: (p, C) => baseY(p, C),
    bowl: false,
  };

  const SPECIAL_PARTS = {
    colorgate: Object.assign({ label: '색 게이트', path: pathGate }, straightMeta),
    racegate:  Object.assign({ label: '레이스 게이트', path: pathFinish }, straightMeta),
    domino:    Object.assign({ label: '도미노', path: pathDomino }, straightMeta),
    orgol: {
      label: '오르골',
      entryPort: (p) => p.rot,
      exitPort: () => null,
      entryY: (p, C) => baseY(p, C),
      exitY: () => null,
      path: pathOrgol,
      bowl: true, // 골과 동일한 그릇 감쇠 — 도착 = 벨 이벤트 (UI가 멜로디로 바꾼다)
    },
  };

  return { SPECIAL_PARTS, GATE_COLORS };
});
