/* 케이파크 · 마블런 — graph.js
 * 부품 배치 목록 → 연결 검증 → 전역 경로(웨이포인트) 빌드.
 * M0: 선형 체인 (start → ... → goal). 순수 로직, jsdom 테스트 대상.
 *
 * buildTrack(pieces, C?) → {
 *   ok, errors: [{code, msg, piece?}],
 *   points: [{x,y,z}],           // 전역 구슬 중심 경로
 *   bowlIndexRanges: [{i0,i1}],  // 골 그릇 감쇠 구간 (points 인덱스)
 *   order: [pieceIndex...],      // 체인 순서
 *   pieceRanges: [{i0,i1}],      // 부품별 points 구간 (렌더용)
 * }
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  function NS() {
    if (root.MarbleSim && root.MarbleSim.hexgrid && root.MarbleSim.PARTS) return root.MarbleSim;
    /* node 단독 로드 대비 */
    const hx = require('./hexgrid.js');
    const pt = require('./parts/basic.js');
    return Object.assign({}, hx, pt);
  }

  const EPS_Y = 1e-6;

  function buildTrack(pieces, Copt) {
    const { hexgrid: hx, PARTS, CONST } = NS();
    const C = Object.assign({}, CONST, Copt || {});
    const errors = [];
    const byTile = new Map();

    pieces.forEach((p, i) => {
      if (!PARTS[p.type]) { errors.push({ code: 'UNKNOWN_TYPE', msg: '알 수 없는 부품: ' + p.type, piece: i }); return; }
      const k = hx.key(p.q, p.r);
      if (byTile.has(k)) errors.push({ code: 'TILE_OVERLAP', msg: '타일 중복 배치: ' + k, piece: i });
      byTile.set(k, i);
    });

    const starts = pieces.map((p, i) => [p, i]).filter(([p]) => p.type === 'start');
    if (starts.length !== 1) {
      errors.push({ code: 'START_COUNT', msg: '시작탑은 정확히 1개여야 함 (현재 ' + starts.length + ')' });
    }
    if (errors.length) return { ok: false, errors, points: [], bowlIndexRanges: [], order: [], pieceRanges: [] };

    const points = [];
    const bowlIndexRanges = [];
    const pieceRanges = [];
    const order = [];
    const visited = new Set();

    let curIdx = starts[0][1];

    for (let step = 0; step < pieces.length; step++) {
      const cur = pieces[curIdx];
      const spec = PARTS[cur.type];
      if (visited.has(curIdx)) { errors.push({ code: 'LOOP', msg: 'M0에서는 순환 트랙 불가', piece: curIdx }); break; }
      visited.add(curIdx);
      order.push(curIdx);

      // 경로 이어붙이기 (연결점 중복 제거)
      const pts = spec.path(cur, C);
      const i0 = points.length === 0 ? 0 : points.length - 1;
      if (points.length === 0) points.push(...pts);
      else points.push(...pts.slice(1));
      const i1 = points.length - 1;
      pieceRanges.push({ i0, i1, pieceIndex: curIdx });
      if (spec.bowl) bowlIndexRanges.push({ i0, i1 });

      const exitPort = spec.exitPort(cur);
      if (exitPort === null || exitPort === undefined) break; // goal 도달

      // 다음 부품 탐색
      const n = hx.neighborOf(cur.q, cur.r, exitPort);
      const nk = hx.key(n.q, n.r);
      if (!byTile.has(nk)) {
        errors.push({ code: 'DISCONNECTED', msg: '출구 다음 타일 비어있음: ' + nk, piece: curIdx });
        break;
      }
      const nextIdx = byTile.get(nk);
      const next = pieces[nextIdx];
      const nextSpec = PARTS[next.type];
      const need = hx.opposite(exitPort);
      if (nextSpec.entryPort(next) !== need) {
        errors.push({ code: 'PORT_MISMATCH', msg: '포트 불일치: P' + need + ' 진입 필요, 현재 P' + nextSpec.entryPort(next), piece: nextIdx });
        break;
      }
      const yOut = spec.exitY(cur, C);
      const yIn = nextSpec.entryY(next, C);
      if (Math.abs(yOut - yIn) > EPS_Y) {
        errors.push({ code: 'HEIGHT_MISMATCH', msg: '높이 불일치: 출구 ' + yOut.toFixed(3) + 'm vs 진입 ' + yIn.toFixed(3) + 'm', piece: nextIdx });
        break;
      }
      curIdx = nextIdx;
    }

    const last = pieces[order[order.length - 1]];
    const reachedGoal = last && last.type === 'goal';
    if (!reachedGoal && errors.length === 0) {
      errors.push({ code: 'NO_GOAL', msg: '골 벨에 도달하지 못함' });
    }

    return { ok: errors.length === 0, errors, points, bowlIndexRanges, order, pieceRanges };
  }

  return { buildTrack };
});
