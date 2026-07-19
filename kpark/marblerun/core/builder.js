/* 케이파크 · 마블런 — builder.js
 * 건설 모드 핵심: 체인 이어붙이기 모델 → M2b-2 "체인 속의 갈래(트리)" → M2b-4 "다시 만나는 갈래(DAG)".
 *
 * 트랙 = { startH, seq } — seq 항목은 부품 이름 문자열이거나 갈림길 노드:
 *   { type: 'switch'|'splitter', left: [...], right: [...] }          // 열린 갈래 (트리)
 *   { type: 'switch'|'splitter', left, right, merged: true, tail: [] } // 🤝 합류된 갈래 (DAG)
 *
 * 합류 계약: merged 노드는 left/right 각각이 정확히 하나의 열린 끝(골 없음)으로 끝나고,
 *  두 끝이 같은 타일을 같은 높이로, 서로 120° 각도로 바라봐야 한다.
 *  그 자리에 'merge' 부품이 놓이고 tail이 그 뒤를 하나의 체인으로 잇는다 (tail 속 갈림길 재귀 허용).
 *
 * 여전히: 회전 UI 없음, 탭 한 번 = 부품 하나.
 *
 * compile(state, activeDecisions?) → {
 *   ok, errors, pieces,           // pieces = 전체 배치 합집합 (DFS: 왼길 먼저)
 *   routes: [{                    // 잎(leaf) = 시작탑→끝 하나로 이어지는 경로
 *     decisions: [{id,dir}...],   //   경로 위 갈림길 선택 (id = pieces 인덱스)
 *     merges: [{id,arm}...],      //   경로 위 합류 부품과 진입 팔 (0/1)
 *     pieceIdxs,                  //   pieces 인덱스 사슬 (트렁크·꼬리 공유)
 *     ended, exitH, exitPort, next, seqRef,
 *   }],
 *   ended, activeRoute, next, exitH, exitPort, occupied,
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
                      'cannon', 'trampoline', 'switch', 'splitter', 'lifter'];
  const DROPS = { slope: 1, gyro: 2 };
  const RISES = { lifter: 2 };
  const MAX_H = 8;
  const SPANS = { cannon: 3, trampoline: 2 };

  function aheadTiles(hx, q, r, dir, n) {
    const out = [];
    let cq = q, cr = r;
    for (let i = 0; i < n; i++) { const t = hx.neighborOf(cq, cr, dir); cq = t.q; cr = t.r; out.push(t); }
    return out;
  }

  function isBranchNode(t) { return t && typeof t === 'object' && (t.type === 'switch' || t.type === 'splitter'); }

  function compile(state, activeDecisions) {
    const hx = hex();
    const startH = state.startH;
    const errors = [];
    const pieces = [{ type: 'start', q: 0, r: 0, h: startH, rot: 0 }];
    const occupied = new Set([hx.key(0, 0)]);

    /* 한 갈래(seq 배열)를 걷고 끝점(endpoint) 목록을 돌려준다.
     * endpoint = { q, r, exitPort, exitH, ended, decisions, merges, chain, next, seqRef } */
    function walk(seqArr, cur, decisions, merges, chain) {
      let { q, r, exitPort, exitH } = cur;
      let ended = false;

      for (let i = 0; i < seqArr.length; i++) {
        const item = seqArr[i];
        const t = isBranchNode(item) ? item.type : item;
        if (ended) { errors.push({ code: 'AFTER_GOAL', msg: '골 벨 뒤에는 부품을 놓을 수 없음', at: i }); return []; }
        if (APPENDABLE.indexOf(t) < 0) { errors.push({ code: 'UNKNOWN_TYPE', msg: '알 수 없는 부품: ' + t, at: i }); return []; }

        const n = hx.neighborOf(q, r, exitPort);
        const k = hx.key(n.q, n.r);
        if (occupied.has(k)) { errors.push({ code: 'COLLISION', msg: '자리가 이미 차 있음: ' + k, at: i }); return []; }

        const entry = hx.opposite(exitPort);
        const drop = DROPS[t] || 0;
        if (exitH < drop) { errors.push({ code: 'TOO_LOW', msg: '높이가 부족해 ' + t + '를 놓을 수 없음 (필요 ' + drop + '칸)', at: i }); return []; }
        const rise = RISES[t] || 0;
        if (rise && exitH + rise > MAX_H) { errors.push({ code: 'TOO_HIGH', msg: '너무 높아 ' + t + '를 놓을 수 없음 (최대 ' + MAX_H + '칸)', at: i }); return []; }
        const h = exitH - drop;

        const span = SPANS[t] || 0;
        let spanTiles = [];
        if (span > 0) {
          spanTiles = aheadTiles(hx, n.q, n.r, exitPort, span);
          for (const st of spanTiles) if (occupied.has(hx.key(st.q, st.r))) {
            errors.push({ code: 'SPAN_BLOCKED', msg: t + '는 앞쪽 ' + span + '칸이 더 필요해', at: i });
            return [];
          }
        }

        const pieceIdx = pieces.length;
        pieces.push({ type: t, q: n.q, r: n.r, h, rot: entry });
        occupied.add(k);
        chain = chain.concat([pieceIdx]);
        q = n.q; r = n.r;
        for (const st of spanTiles) { occupied.add(hx.key(st.q, st.r)); q = st.q; r = st.r; }
        if (drop > 0) exitH = h;
        if (rise > 0) exitH = exitH + rise;

        if (t === 'switch' || t === 'splitter') {
          // 갈림길: 왼길 먼저 (DFS) — 스위치 뒤 항목은 갈래 안에 있어야 함
          if (i !== seqArr.length - 1) {
            errors.push({ code: 'AFTER_SWITCH', msg: '갈림길 뒤 부품은 갈래(left/right) 안에 있어야 함', at: i });
            return [];
          }
          const eL = walk(item.left || [], { q, r, exitPort: (entry + 2) % 6, exitH },
                          decisions.concat([{ id: pieceIdx, dir: 0 }]), merges, chain);
          const eR = walk(item.right || [], { q, r, exitPort: (entry + 4) % 6, exitH },
                          decisions.concat([{ id: pieceIdx, dir: 1 }]), merges, chain);
          if (!item.merged) return eL.concat(eR);

          // ── 🤝 합류: 각 갈래는 정확히 하나의 열린 끝으로 끝나야 한다 ──
          if (errors.length) return [];
          if (eL.length !== 1 || eR.length !== 1 || eL[0].ended || eR[0].ended) {
            errors.push({ code: 'MERGE_OPEN', msg: '합류하려면 두 갈래가 각각 하나의 열린 끝으로 끝나야 해' });
            return [];
          }
          const a = eL[0], b = eR[0];
          const na = hx.neighborOf(a.q, a.r, a.exitPort);
          const nb = hx.neighborOf(b.q, b.r, b.exitPort);
          if (na.q !== nb.q || na.r !== nb.r) {
            errors.push({ code: 'MERGE_APART', msg: '두 갈래가 같은 자리를 향하고 있지 않아' });
            return [];
          }
          if (a.exitH !== b.exitH) {
            errors.push({ code: 'MERGE_HEIGHT', msg: '두 갈래의 높이가 달라 (' + a.exitH + ' vs ' + b.exitH + ')' });
            return [];
          }
          const ea = hx.opposite(a.exitPort), eb = hx.opposite(b.exitPort);
          let X, armA;
          if (eb === (ea + 2) % 6)      { X = (ea + 4) % 6; armA = 0; }
          else if (ea === (eb + 2) % 6) { X = (eb + 4) % 6; armA = 1; }
          else {
            errors.push({ code: 'MERGE_ANGLE', msg: '두 갈래가 120° 각도로 만나야 해' });
            return [];
          }
          const mk = hx.key(na.q, na.r);
          if (occupied.has(mk)) {
            errors.push({ code: 'COLLISION', msg: '합류 자리가 이미 차 있음: ' + mk });
            return [];
          }
          const mIdx = pieces.length;
          pieces.push({ type: 'merge', q: na.q, r: na.r, h: a.exitH, rot: X });
          occupied.add(mk);

          // 꼬리는 한 번만 걷는다 (배치·점유 공유) — 그 끝점을 상류 두 경로에 접붙인다
          const tails = walk(item.tail || [], { q: na.q, r: na.r, exitPort: X, exitH: a.exitH }, [], [], []);
          if (errors.length) return [];
          const out = [];
          for (const u of [{ ep: a, arm: armA }, { ep: b, arm: armA ^ 1 }]) {
            for (const te of tails) {
              out.push({
                q: te.q, r: te.r, exitPort: te.exitPort, exitH: te.exitH, ended: te.ended,
                decisions: u.ep.decisions.concat(te.decisions),
                merges: u.ep.merges.concat([{ id: mIdx, arm: u.arm }], te.merges),
                chain: u.ep.chain.concat([mIdx], te.chain),
                next: te.next, seqRef: te.seqRef,
              });
            }
          }
          return out;
        }

        if (t === 'curve_l')      exitPort = (entry + 2) % 6;
        else if (t === 'curve_r') exitPort = (entry + 4) % 6;
        else if (t === 'goal')    { ended = true; }
        else                      exitPort = (entry + 3) % 6;
      }

      // 갈래 끝 = 끝점 확정
      let next = null;
      if (!ended) {
        const n = hx.neighborOf(q, r, exitPort);
        next = { q: n.q, r: n.r, entry: hx.opposite(exitPort), blocked: occupied.has(hx.key(n.q, n.r)) };
      }
      return [{ q, r, exitPort, exitH, ended, decisions, merges, chain, next, seqRef: seqArr }];
    }

    const eps = walk(state.seq || [], { q: 0, r: 0, exitPort: 0, exitH: startH }, [], [], [0]);
    const routes = eps.map(ep => ({
      decisions: ep.decisions, merges: ep.merges, pieceIdxs: ep.chain,
      ended: ep.ended, exitH: ep.exitH, exitPort: ep.exitPort, next: ep.next, seqRef: ep.seqRef,
    }));

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
    if ((RISES[type] || 0) && route.exitH + RISES[type] > MAX_H) return false;
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

  /* 잎 → graph.buildTrack 투입용 배치 (갈림길에 dir, 합류에 arm 각인한 사본) */
  function leafPieces(comp, route) {
    const dirOf = new Map(route.decisions.map(d => [d.id, d.dir]));
    const armOf = new Map((route.merges || []).map(m => [m.id, m.arm]));
    return route.pieceIdxs.map(i => {
      const p = comp.pieces[i];
      if (dirOf.has(i)) return Object.assign({}, p, { dir: dirOf.get(i) });
      if (armOf.has(i)) return Object.assign({}, p, { arm: armOf.get(i) });
      return p;
    });
  }

  /* ── 🤝 합류 시도 ──
   * 아직 합류 안 된 갈림길 노드를 깊은 것부터 훑어, merged를 켜고 compile이
   * 통과하는 첫 노드에서 확정. 실패하면 되돌린다. 성공 시 { ok, node }. */
  function tryMerge(state) {
    const nodes = [];
    (function scan(arr) {
      for (const it of arr || []) {
        if (!isBranchNode(it)) continue;
        scan(it.left); scan(it.right); if (it.merged) scan(it.tail);
        if (!it.merged) nodes.push(it);
      }
    })(state.seq);
    for (const nd of nodes) {
      const hadTail = Object.prototype.hasOwnProperty.call(nd, 'tail');
      nd.merged = true;
      if (!hadTail) nd.tail = [];
      if (compile(state).ok) return { ok: true, node: nd };
      delete nd.merged;
      if (!hadTail) delete nd.tail;
    }
    return { ok: false };
  }

  /* 지금 합류 가능한가 (상태를 건드리지 않는다) */
  function canMerge(state) {
    const clone = JSON.parse(JSON.stringify({ startH: state.startH, seq: state.seq || [] }));
    return tryMerge(clone).ok;
  }

  /* 합류 취소 (undo) — 꼬리가 비어 있을 때만 */
  function unMerge(node) {
    if (!node || !node.merged) return false;
    if (node.tail && node.tail.length) return false;
    delete node.merged;
    delete node.tail;
    return true;
  }

  return { compile, canPlace, canPlaceRoute, leafPieces, tryMerge, canMerge, unMerge, APPENDABLE, SPANS, DROPS, RISES };
});
