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
    require('./parts/action.js');
    require('./parts/ballistic.js');
    require('./parts/switchpart.js');
    require('./parts/splitter.js');
    require('./parts/mergepart.js');
    require('./parts/lifter.js');
    require('./parts/special.js');
    return Object.assign({}, hx, pt);
  }

  const EPS_Y = 1e-6;

  function buildTrack(pieces, Copt, opts) {
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
    if (errors.length) return { ok: false, errors, points: [], bowlIndexRanges: [], airIndexRanges: [], convexIndexRanges: [], boostIndexRanges: [], motorIndexRanges: [], launchMarks: [], decideMarks: [], gateMarks: [], finishMarks: [], dominoMarks: [], order: [], pieceRanges: [] };

    const points = [];
    const bowlIndexRanges = [];
    const airIndexRanges = [];
    const convexIndexRanges = [];
    const boostIndexRanges = [];
    const motorIndexRanges = [];
    const launchMarks = [];
    const decideMarks = [];
    const gateMarks = [];    // 🎨 색 게이트 (M5) — {i, piece}
    const finishMarks = [];  // 🏁 레이스 게이트 (M5) — {i, piece}
    const dominoMarks = [];  // 🁢 도미노 (M5) — {i, piece}
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

      // 경로 이어붙이기 (연결점 중복 제거) — marks(air/boost) 오프셋 반영
      const res = spec.path(cur, C);
      const pts = Array.isArray(res) ? res : res.points;
      const marks = Array.isArray(res) ? [] : (res.marks || []);
      const i0 = points.length === 0 ? 0 : points.length - 1;
      if (points.length === 0) points.push(...pts);
      else points.push(...pts.slice(1));
      const i1 = points.length - 1;
      pieceRanges.push({ i0, i1, pieceIndex: curIdx });
      if (spec.bowl) bowlIndexRanges.push({ i0, i1 });
      for (const m of marks) {
        const g = { i0: i0 + m.i0, i1: i0 + m.i1 };
        if (m.kind === 'air') airIndexRanges.push(g);
        else if (m.kind === 'convex') convexIndexRanges.push(g);
        else if (m.kind === 'boost') boostIndexRanges.push(g);
        else if (m.kind === 'motor') motorIndexRanges.push(g);
        else if (m.kind === 'launch') launchMarks.push({
          i: i0 + m.i, iLand: i0 + m.iLand, angle: m.angle, boost: m.boost,
          catchR: m.catchR, wallR: m.wallR, wallH: m.wallH,
        });
        else if (m.kind === 'decide') decideMarks.push({ i: i0 + m.i, piece: curIdx });
        else if (m.kind === 'gate') gateMarks.push({ i: i0 + m.i, piece: curIdx });
        else if (m.kind === 'finish') finishMarks.push({ i: i0 + m.i, piece: curIdx });
        else if (m.kind === 'domino') dominoMarks.push({ i: i0 + m.i, piece: curIdx });
      }

      const exitPort = spec.exitPort(cur);
      if (exitPort === null || exitPort === undefined) break; // goal 도달

      // 다음 부품 탐색 — 스팬 부품(대포·트램펄린)은 착지대 타일에서 이어진다
      const et = spec.exitTile ? spec.exitTile(cur) : { q: cur.q, r: cur.r };
      const n = hx.neighborOf(et.q, et.r, exitPort);
      const nk = hx.key(n.q, n.r);
      if (!byTile.has(nk)) {
        if (!(opts && opts.allowNoGoal)) errors.push({ code: 'DISCONNECTED', msg: '출구 다음 타일 비어있음: ' + nk, piece: curIdx });
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
    const reachedGoal = last && (last.type === 'goal' || last.type === 'orgol');
    if (!reachedGoal && errors.length === 0 && !(opts && opts.allowNoGoal)) {
      errors.push({ code: 'NO_GOAL', msg: '골 벨에 도달하지 못함' });
    }

    return { ok: errors.length === 0, errors, points, bowlIndexRanges, airIndexRanges, convexIndexRanges, boostIndexRanges, motorIndexRanges, launchMarks, decideMarks, gateMarks, finishMarks, dominoMarks, order, pieceRanges };
  }

  return { buildTrack };
});
