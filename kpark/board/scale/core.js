/* 케이파크 보드게임 · 무게 배틀 — 순수 로직 (UI 없음)
 * 큰 저울 양팔에 자리(거리 1~6)가 있고, 두 사람이 번갈아 자기 추(1~6)를 아무 자리에 하나씩 건다.
 * 돌림힘 = 추 무게 × 거리. 내가 걸고 났을 때 |왼쪽 − 오른쪽| > 6 이면 저울이 와장창 — 건 사람이 진다.
 * 열두 개를 모두 무사히 걸면 둘 다 저울 지킴이 (무승부). */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ScaleCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  const DIST = 6;      // 한 팔의 자리 수 (거리 1~6)
  const LIMIT = 6;     // 이만큼 넘게 기울면 와장창

  function newState() {
    return {
      L: new Array(DIST + 1).fill(0),  // L[d] = 걸린 추 무게 (0=빈 자리), 인덱스 1~6
      R: new Array(DIST + 1).fill(0),
      own: { L: new Array(DIST + 1).fill(0), R: new Array(DIST + 1).fill(0) }, // 누가 건 추인지
      hands: { 1: [1, 2, 3, 4, 5, 6], 2: [1, 2, 3, 4, 5, 6] }
    };
  }
  function clone(st) {
    return {
      L: st.L.slice(), R: st.R.slice(),
      own: { L: st.own.L.slice(), R: st.own.R.slice() },
      hands: { 1: st.hands[1].slice(), 2: st.hands[2].slice() }
    };
  }
  function torque(arm) { let t = 0; for (let d = 1; d <= DIST; d++) t += arm[d] * d; return t; }
  function tilt(st) { return torque(st.R) - torque(st.L); } // +면 오른쪽으로 기욺
  function crashed(st) { return Math.abs(tilt(st)) > LIMIT; }

  /* 가능한 모든 수 (와장창 포함) */
  function allMoves(st, player) {
    const out = [];
    for (const w of st.hands[player])
      for (const side of ['L', 'R'])
        for (let d = 1; d <= DIST; d++)
          if (st[side][d] === 0) out.push({ w, side, d });
    return out;
  }
  function apply(st, player, m) {
    st[m.side][m.d] = m.w;
    st.own[m.side][m.d] = player;
    st.hands[player].splice(st.hands[player].indexOf(m.w), 1);
  }
  function isSafe(st, m) {
    const t = tilt(st) + (m.side === 'R' ? m.w * m.d : -m.w * m.d);
    return Math.abs(t) <= LIMIT;
  }
  function safeMoves(st, player) { return allMoves(st, player).filter(m => isSafe(st, m)); }
  function done(st) { return st.hands[1].length === 0 && st.hands[2].length === 0; }

  /* 미니맥스: 안전한 수가 없으면 그 사람이 진다. 다 걸면 무승부(0). */
  function search(st, player, depth) {
    if (done(st)) return { score: 0, move: null };
    const safe = safeMoves(st, player);
    if (safe.length === 0) return { score: -1000 - depth, move: null }; // 지금 사람 패배 (빨리 지면 더 나쁨)
    if (depth === 0) {
      // 휴리스틱: 다음 내 숨통 − 상대 숨통
      let best = -Infinity, bm = safe[0];
      for (const m of safe) {
        const ns = clone(st); apply(ns, player, m);
        const sc = -(safeMoves(ns, 3 - player).length);
        if (sc > best) { best = sc; bm = m; }
      }
      return { score: best, move: bm };
    }
    let best = -Infinity, bm = safe[0];
    for (const m of safe) {
      const ns = clone(st); apply(ns, player, m);
      const r = search(ns, 3 - player, depth - 1);
      const sc = -r.score;
      if (sc > best) { best = sc; bm = m; }
      if (best >= 1000) break; // 이미 필승
    }
    return { score: best, move: bm };
  }

  /* AI 착수. 안전한 수가 없으면 어쩔 수 없이 와장창(null 아님 — 최소 피해 수) */
  function aiMove(st, player, level, rnd) {
    rnd = rnd || Math.random;
    const safe = safeMoves(st, player);
    if (safe.length === 0) {
      const all = allMoves(st, player);
      // 그래도 제일 덜 기우는 수
      all.sort((a, b) => {
        const ta = Math.abs(tilt(st) + (a.side === 'R' ? a.w * a.d : -a.w * a.d));
        const tb = Math.abs(tilt(st) + (b.side === 'R' ? b.w * b.d : -b.w * b.d));
        return ta - tb;
      });
      return { move: all[0], crash: true };
    }
    if (level === 1) return { move: safe[Math.floor(rnd() * safe.length)], crash: false };
    if (level === 2) {
      // 상대 숨통 조이기 (1수 앞)
      let best = null, bestSc = -Infinity;
      for (const m of safe) {
        const ns = clone(st); apply(ns, player, m);
        const sc = -safeMoves(ns, 3 - player).length + rnd() * 0.5;
        if (sc > bestSc) { bestSc = sc; best = m; }
      }
      return { move: best, crash: false };
    }
    const r = search(clone(st), player, 3);
    return { move: r.move || safe[0], crash: false };
  }

  return { DIST, LIMIT, newState, clone, torque, tilt, crashed, allMoves, apply, isSafe, safeMoves, done, search, aiMove };
}));
