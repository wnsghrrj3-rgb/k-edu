/* 케이파크 · 마블런 — builder.js
 * 건설 모드 핵심: 체인 이어붙이기 모델 → M2b-2에서 "체인 속의 갈래(트리)"로 확장.
 *
 * 트랙 = { startH, seq } — seq 항목은 부품 이름 문자열이거나 스위치 노드:
 *   { type: 'switch', left: [...], right: [...] }   // 재귀 허용 (갈래 속의 갈래)
 *
 * 여전히: 회전 UI 없음, 탭 한 번 = 부품 하나. 스위치를 놓으면 길이 둘로 갈라지고,
 * 각 갈래는 자기 골 벨로 끝나야 한다.
 *
 * compile(state, activeDecisions?) → {
 *   ok, errors, pieces,           // pieces = 전체 배치 합집합 (DFS: 왼길 먼저)
 *   routes: [{                    // 잎(leaf) = 시작탑→골 하나로 이어지는 경로
 *     decisions: [{id,dir}...],   //   경로 위 스위치들의 선택 (id = 스위치 pieces 인덱스)
 *     pieceIdxs,                  //   pieces 인덱스 사슬 (트렁크 공유)
 *     ended, exitH, exitPort, next, seqRef,
 *   }],
 *   ended,                        // 모든 잎이 골로 종결
 *   activeRoute,                  // activeDecisions와 일치하는 잎 인덱스
 *   next, exitH, exitPort,        // 활성 잎의 것 (기존 호출부 호환)
 *   occupied,
 * }
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  function hex() {
    if (root.MarbleSim && root.MarbleSim.hexgrid) return root.MarbleSim.hexgrid;
    return require('./hexgrid.js').hexgrid;
  }

  const APPENDABLE = ['straight', 'curve_l', 'curve_r', 'slope', 'goal',
                      'hill', 'loop', 'gyro', 'jump', 'booster', 'zigzag',
                      'cannon', 'trampoline', 'switch'];
  const DROPS = { slope: 1, gyro: 2 };
  const SPANS = { cannon: 3, trampoline: 2 };

  function aheadTiles(hx, q, r, dir, n) {
    const out = [];
    let cq = q, cr = r;
    for (let i = 0; i < n; i++) { const t = hx.neighborOf(cq, cr, dir); cq = t.q; cr = t.r; out.push(t); }
    return out;
  }

  function isSwitchNode(t) { return t && typeof t === 'object' && t.type === 'switch'; }

  function compile(state, activeDecisions) {
    const hx = hex();
    const startH = state.startH;
    const errors = [];
    const pieces = [{ type: 'start', q: 0, r: 0, h: startH, rot: 0 }];
    const occupied = new Set([hx.key(0, 0)]);
    const routes = [];

    /* 한 갈래(seq 배열)를 커서 상태로 걷는다. 스위치를 만나면 좌/우로 재귀. */
    function walk(seqArr, cur, decisions, chain) {
      let { q, r, exitPort, exitH } = cur;
      let ended = false;

      for (let i = 0; i < seqArr.length; i++) {
        const item = seqArr[i];
        const t = isSwitchNode(item) ? 'switch' : item;
        if (ended) { errors.push({ code: 'AFTER_GOAL', msg: '골 벨 뒤에는 부품을 놓을 수 없음', at: i }); return; }
        if (APPENDABLE.indexOf(t) < 0) { errors.push({ code: 'UNKNOWN_TYPE', msg: '알 수 없는 부품: ' + t, at: i }); return; }

        const n = hx.neighborOf(q, r, exitPort);
        const k = hx.key(n.q, n.r);
        if (occupied.has(k)) { errors.push({ code: 'COLLISION', msg: '자리가 이미 차 있음: ' + k, at: i }); return; }

        const entry = hx.opposite(exitPort);
        const drop = DROPS[t] || 0;
        if (exitH < drop) { errors.push({ code: 'TOO_LOW', msg: '높이가 부족해 ' + t + '를 놓을 수 없음 (필요 ' + drop + '칸)', at: i }); return; }
        const h = exitH - drop;

        const span = SPANS[t] || 0;
        let spanTiles = [];
        if (span > 0) {
          spanTiles = aheadTiles(hx, n.q, n.r, exitPort, span);
          for (const st of spanTiles) if (occupied.has(hx.key(st.q, st.r))) {
            errors.push({ code: 'SPAN_BLOCKED', msg: t + '는 앞쪽 ' + span + '칸이 더 필요해', at: i });
            return;
          }
        }

        const pieceIdx = pieces.length;
        pieces.push({ type: t, q: n.q, r: n.r, h, rot: entry });
        occupied.add(k);
        chain = chain.concat([pieceIdx]);
        q = n.q; r = n.r;
        for (const st of spanTiles) { occupied.add(hx.key(st.q, st.r)); q = st.q; r = st.r; }
        if (drop > 0) exitH = h;

        if (t === 'switch') {
          // 갈림길: 왼길 먼저 (DFS) — 남은 seqArr는 존재할 수 없음 (스위치 뒤 항목은 갈래 안에 있어야 함)
          if (i !== seqArr.length - 1) {
            errors.push({ code: 'AFTER_SWITCH', msg: '스위치 뒤 부품은 갈래(left/right) 안에 있어야 함', at: i });
            return;
          }
          walk(item.left || [], { q, r, exitPort: (entry + 2) % 6, exitH },
               decisions.concat([{ id: pieceIdx, dir: 0 }]), chain);
          walk(item.right || [], { q, r, exitPort: (entry + 4) % 6, exitH },
               decisions.concat([{ id: pieceIdx, dir: 1 }]), chain);
          return;
        }

        if (t === 'curve_l')      exitPort = (entry + 2) % 6;
        else if (t === 'curve_r') exitPort = (entry + 4) % 6;
        else if (t === 'goal')    { ended = true; }
        else                      exitPort = (entry + 3) % 6;
      }

      // 갈래 끝 = 잎 확정
      let next = null;
      if (!ended) {
        const n = hx.neighborOf(q, r, exitPort);
        next = { q: n.q, r: n.r, entry: hx.opposite(exitPort), blocked: occupied.has(hx.key(n.q, n.r)) };
      }
      routes.push({ decisions, pieceIdxs: chain, ended, exitH, exitPort, next, seqRef: seqArr });
    }

    walk(state.seq || [], { q: 0, r: 0, exitPort: 0, exitH: startH }, [], [0]);

    const ended = routes.length > 0 && routes.every(rt => rt.ended);

    // 활성 잎: activeDecisions(0/1 배열)와 결정 시퀀스가 일치하는 잎. 없으면 첫 열린 잎 → 첫 잎.
    let activeRoute = 0;
    if (activeDecisions && activeDecisions.length) {
      const found = routes.findIndex(rt =>
        rt.decisions.length === activeDecisions.length &&
        rt.decisions.every((d, j) => d.dir === activeDecisions[j]));
      if (found >= 0) activeRoute = found;
      else {
        const open = routes.findIndex(rt => !rt.ended);
        activeRoute = open >= 0 ? open : 0;
      }
    } else {
      const open = routes.findIndex(rt => !rt.ended);
      if (open >= 0) activeRoute = open;
    }
    const act = routes[activeRoute] || { ended: true, exitH: startH, exitPort: 0, next: null };

    return {
      ok: errors.length === 0, errors, pieces, routes, ended,
      activeRoute, next: act.next, exitH: act.exitH, exitPort: act.exitPort,
      occupied,
    };
  }

  /* 특정 잎에 type을 놓을 수 있는가 */
  function canPlaceRoute(comp, route, type) {
    if (!comp.ok || !route || route.ended) return false;
    if (!route.next || route.next.blocked) return false;
    if ((DROPS[type] || 0) > route.exitH) return false;
    if (APPENDABLE.indexOf(type) < 0) return false;
    const span = SPANS[type] || 0;
    if (span > 0 && comp.occupied) {
      const hx = hex();
      for (const st of aheadTiles(hx, route.next.q, route.next.r, route.exitPort, span)) {
        if (comp.occupied.has(hx.key(st.q, st.r))) return false;
      }
    }
    return true;
  }

  /* 활성 잎 기준 (기존 호출부·테스트 호환) */
  function canPlace(comp, type) {
    return canPlaceRoute(comp, comp.routes && comp.routes[comp.activeRoute], type);
  }

  /* 잎 → graph.buildTrack 투입용 배치 (스위치에 dir 각인한 사본) */
  function leafPieces(comp, route) {
    const dirOf = new Map(route.decisions.map(d => [d.id, d.dir]));
    return route.pieceIdxs.map(i => {
      const p = comp.pieces[i];
      return dirOf.has(i) ? Object.assign({}, p, { dir: dirOf.get(i) }) : p;
    });
  }

  return { compile, canPlace, canPlaceRoute, leafPieces, APPENDABLE, SPANS, DROPS };
});
