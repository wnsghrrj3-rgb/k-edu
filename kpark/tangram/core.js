/* 케이파크 · 칠교놀이 — core.js
 * 순수 로직. DOM/SVG 의존 제로. (index.html·tests 공유 단일 소스)
 * 좌표계: 칠교 한 변 8 정사각형(넓이 64), y-아래 방향(SVG와 동일).
 * 퍼즐 배치 [sh, x, y, r, f]: 앵커(x,y) 기준, r = 45°×r 회전, f = 뒤집기(평행사변형).
 */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.TangramCore = mod;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SQ2 = Math.sqrt(2);

  /* 조각 7개 — 한 변 8 정사각형의 고전 분해 (넓이 합 64) */
  const SHAPES = {
    L: { n: '큰 삼각형',   poly: [[0, 0], [4 * SQ2, 0], [0, 4 * SQ2]], area: 16, count: 2 },
    M: { n: '중간 삼각형', poly: [[0, 0], [4, 0], [0, 4]],             area: 8,  count: 1 },
    S: { n: '작은 삼각형', poly: [[0, 0], [2 * SQ2, 0], [0, 2 * SQ2]], area: 4,  count: 2 },
    Q: { n: '정사각형',    poly: [[0, 0], [2 * SQ2, 0], [2 * SQ2, 2 * SQ2], [0, 2 * SQ2]], area: 8, count: 1 },
    P: { n: '평행사변형',  poly: [[0, 0], [4, 0], [6, 2], [2, 2]],     area: 8,  count: 1, flip: true }
  };

  /* 조각 인스턴스 7개 (L·S는 2개씩) */
  const PIECE_SET = ['L', 'L', 'M', 'S', 'S', 'Q', 'P'];

  /* 앵커 기준 변환 (퍼즐 정답 배치용) — 뒤집기 먼저, 회전 나중 */
  function xform(sh, x, y, r, f) {
    const sp = SHAPES[sh], th = r * Math.PI / 4, c = Math.cos(th), s = Math.sin(th);
    return sp.poly.map(function (p) {
      const px = p[0], py = f ? -p[1] : p[1];
      return [x + px * c - py * s, y + px * s + py * c];
    });
  }

  function polyArea(poly) {
    let a = 0;
    for (let i = 0; i < poly.length; i++) {
      const j = (i + 1) % poly.length;
      a += poly[i][0] * poly[j][1] - poly[j][0] * poly[i][1];
    }
    return Math.abs(a / 2);
  }

  function centroid(poly) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < poly.length; i++) {
      const j = (i + 1) % poly.length;
      const cr = poly[i][0] * poly[j][1] - poly[j][0] * poly[i][1];
      a += cr; cx += (poly[i][0] + poly[j][0]) * cr; cy += (poly[i][1] + poly[j][1]) * cr;
    }
    a /= 2;
    return [cx / (6 * a), cy / (6 * a)];
  }

  function pointIn(poly, x, y) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function bbox(polys) {
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    polys.forEach(function (p) {
      p.forEach(function (v) {
        if (v[0] < minx) minx = v[0]; if (v[0] > maxx) maxx = v[0];
        if (v[1] < miny) miny = v[1]; if (v[1] > maxy) maxy = v[1];
      });
    });
    return [minx, miny, maxx, maxy];
  }

  /* 중심(centroid) 기준 연속 변환 — 놀이 중 조각 상태.
   * 회전이 자기 중심을 도니 손맛이 자연스럽다. deg는 연속(애니메이션 허용). */
  function pieceWorldPoly(sh, cx, cy, deg, f) {
    const base = SHAPES[sh].poly.map(function (p) { return [p[0], f ? -p[1] : p[1]]; });
    const c0 = centroid(base);
    const th = deg * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
    return base.map(function (p) {
      const px = p[0] - c0[0], py = p[1] - c0[1];
      return [cx + px * c - py * s, cy + px * s + py * c];
    });
  }

  /* 두 다각형이 (평행이동을 무시하고) 같은 도형인지 — 중심 정렬 후 꼭짓점 최근접 매칭.
   * 회전 대칭(정사각형 90°, 평행사변형 180°, 뒤집힌 등변직각삼각형 등)은
   * 파라미터가 달라도 꼭짓점 집합이 같으므로 자동 흡수된다. */
  function shapeMatch(polyA, polyB, tol) {
    if (polyA.length !== polyB.length) return false;
    const ca = centroid(polyA), cb = centroid(polyB);
    const dx = cb[0] - ca[0], dy = cb[1] - ca[1];
    const used = new Array(polyB.length).fill(false);
    for (let i = 0; i < polyA.length; i++) {
      const ax = polyA[i][0] + dx, ay = polyA[i][1] + dy;
      let best = -1, bd = 1e9;
      for (let j = 0; j < polyB.length; j++) {
        if (used[j]) continue;
        const d = Math.hypot(ax - polyB[j][0], ay - polyB[j][1]);
        if (d < bd) { bd = d; best = j; }
      }
      if (bd > tol) return false;
      used[best] = true;
    }
    return true;
  }

  /* 스냅 판정: 모양 일치(회전·뒤집기 정확) + 위치 근접(관대) */
  function slotMatch(piecePoly, slotPoly, posTol, shapeTol) {
    const ca = centroid(piecePoly), cb = centroid(slotPoly);
    if (Math.hypot(ca[0] - cb[0], ca[1] - cb[1]) > posTol) return false;
    return shapeMatch(piecePoly, slotPoly, shapeTol);
  }

  /* 겹침 샘플 검사 (검증용): A 내부 샘플점이 B에 들어가는 개수.
   * 경계 공유 오탐 방지: A를 중심 기준 0.99로 살짝 수축해 샘플. */
  function overlapSamples(polyA, polyB, step) {
    step = step || 0.23;
    const ca = centroid(polyA);
    const shrunk = polyA.map(function (p) {
      return [ca[0] + (p[0] - ca[0]) * 0.99, ca[1] + (p[1] - ca[1]) * 0.99];
    });
    const bb = bbox([shrunk]);
    let hits = 0;
    for (let y = bb[1] + 0.077; y < bb[3]; y += step)
      for (let x = bb[0] + 0.111; x < bb[2]; x += step)
        if (pointIn(shrunk, x, y) && pointIn(polyB, x, y)) hits++;
    return hits;
  }

  /* ── 퍼즐 10종 (지난 세션 저작·전수 겹침 0 검증본) ── */
  const PUZZLE_DATA = {
    square:   { pl: [["L",4,4,7,0],["L",4,4,1,0],["M",0,0,0,0],["S",6,2,5,0],["Q",4,0,1,0],["S",4,4,3,0],["P",2,2,2,0]], w: 8, h: 8 },
    triangle: { pl: [["L",4,4,7,0],["P",8,0,2,1],["S",12,4,3,0],["L",4,4,1,0],["M",8,8,6,0],["Q",10,6,7,0],["S",14,6,1,0]], w: 16, h: 8 },
    tree:     { pl: [["M",5.41,0,1,0],["L",5.41,2.828,1,0],["L",5.41,6.828,1,0],["Q",3.996,10.828,0,0],["P",2.82,13.657,0,0],["S",0,13.657,0,0],["S",9.65,13.657,2,0]], w: 9.65, h: 16.49 },
    house:    { pl: [["L",6,1,1,0],["M",2,5,0,0],["S",4,7,7,0],["S",4,7,1,0],["L",6,5,0,0],["Q",3,0,1,0],["P",2,5,2,0]], w: 11.66, h: 11 },
    rocket:   { pl: [["L",2.828,2.828,0,0],["L",8.485,8.485,4,0],["M",5.657,0,1,0],["S",2.828,5.657,2,0],["S",8.485,5.657,0,0],["Q",5.657,8.485,1,0],["P",3.657,12.485,0,0]], w: 11.31, h: 14.49 },
    fish:     { pl: [["L",8,2,1,0],["L",8,10,5,0],["M",12,6,7,0],["S",8,0,1,0],["S",8,12,5,0],["Q",2,4,1,0],["P",10,10,0,0]], w: 16, h: 12 },
    boat:     { pl: [["L",6.83,13.66,5,0],["L",10.83,9.66,4,0],["M",5.17,9.66,4,0],["Q",10.83,0,1,0],["P",2.83,13.66,0,0],["S",0,13.66,0,0],["S",8.83,15.66,6,0]], w: 12.83, h: 16.49 },
    cat:      { pl: [["L",8,5.828,1,0],["L",8,13.828,5,0],["Q",8,1.828,1,0],["S",7,2.828,4,0],["S",9,2.828,6,0],["P",12,9.828,7,0],["M",0,9.828,0,0]], w: 17.66, h: 13.83 },
    bird:     { pl: [["P",4,4,0,0],["L",4,0,1,0],["L",11,10,5,0],["Q",10,2,1,0],["S",14,4,3,0],["S",8,4,5,0],["M",6,6,2,0]], w: 15, h: 10 },
    runner:   { pl: [["Q",5.657,2,1,0],["S",5.657,0,1,0],["L",5.657,6,0,0],["M",11.314,6,6,0],["P",8.485,8.828,1,0],["S",11.314,14.485,0,0],["L",5.657,11.657,2,0]], w: 15.31, h: 17.31 }
  };

  /* 난이도·이름·순서 (⭐ 모양 안내선 / ⭐⭐ 그림자만 / ⭐⭐⭐ 그림자 + 조각 뒤섞임) */
  const PUZZLES = [
    { id: 'square',   name: '네모',        stars: 1 },
    { id: 'triangle', name: '세모',        stars: 1 },
    { id: 'tree',     name: '나무',        stars: 1 },
    { id: 'house',    name: '집',          stars: 2 },
    { id: 'rocket',   name: '로켓',        stars: 2 },
    { id: 'fish',     name: '물고기',      stars: 2 },
    { id: 'boat',     name: '돛단배',      stars: 2 },
    { id: 'cat',      name: '고양이',      stars: 3 },
    { id: 'bird',     name: '새',          stars: 3 },
    { id: 'runner',   name: '달리는 사람', stars: 3 }
  ].map(function (m) {
    const d = PUZZLE_DATA[m.id];
    return { id: m.id, name: m.name, stars: m.stars, w: d.w, h: d.h, pl: d.pl };
  });

  /* 퍼즐의 정답 슬롯 다각형 목록 */
  function puzzleSlots(pz) {
    return pz.pl.map(function (p) {
      return { sh: p[0], poly: xform(p[0], p[1], p[2], p[3], p[4]) };
    });
  }

  return {
    SQ2, SHAPES, PIECE_SET, PUZZLES,
    xform, polyArea, centroid, pointIn, bbox,
    pieceWorldPoly, shapeMatch, slotMatch, overlapSamples, puzzleSlots
  };
});
