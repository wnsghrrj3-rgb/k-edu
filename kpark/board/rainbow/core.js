/* 케이파크 보드게임 · 🌈 무지개 육각길 — 순수 로직 (UI 없음)
 * 육각판에 두 칸짜리 무지개 타일을 놓는다. 놓은 칸에서 같은 그림이 이어진 줄만큼 그 색 점수.
 * 반전 규칙: 마지막 점수는 "내 색깔 중 가장 낮은 색" — 여섯 색을 골고루 키워야 이긴다!
 * 한 색이 12에 닿으면 "무지개 완성!" 보너스로 한 번 더. */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RainbowCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  const R = 4;                          // 반지름 (한 변 5 → 61칸)
  const MAX = 12;                       // 색 트랙 최대
  const HAND = 6;
  const SYMS = ['⭐', '🌙', '☀️', '🌈', '🍀', '🍇'];
  const COLS = ['#ffd35c', '#7ea8ff', '#ff9e3d', '#ff6fae', '#7dffb0', '#c58aff'];
  const DIRS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
  const CORNERS = [[R, 0], [0, R], [-R, R], [-R, 0], [0, -R], [R, -R]];  // 시작 그림 6개

  const K = (q, r) => q + ',' + r;
  function cells() {
    const out = [];
    for (let q = -R; q <= R; q++) for (let r = -R; r <= R; r++)
      if (Math.abs(q + r) <= R) out.push([q, r]);
    return out;
  }
  const inBoard = (q, r) => Math.abs(q) <= R && Math.abs(r) <= R && Math.abs(q + r) <= R;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* ---------- 게임 ---------- */
  function newGame(seed) {
    const rng = mulberry32((seed | 0) + 1);
    const board = {};
    for (const [q, r] of cells()) board[K(q, r)] = -1;   // -1 = 빈 칸
    CORNERS.forEach(([q, r], i) => board[K(q, r)] = i);  // 여섯 모서리 시작 그림
    /* 타일 주머니: 그림 쌍 21조합 × 3 = 63장 */
    let bag = [];
    for (let a = 0; a < 6; a++) for (let b = a; b < 6; b++) bag.push([a, b], [a, b], [a, b]);
    bag = shuffle(bag, rng);
    const hands = [null, [], []];
    for (let i = 0; i < HAND; i++) { hands[1].push(bag.pop()); hands[2].push(bag.pop()); }
    return {
      board, bag, hands, rng,
      tracks: { 1: [0, 0, 0, 0, 0, 0], 2: [0, 0, 0, 0, 0, 0] },
      turn: 1, over: false, winner: 0, passes: 0
    };
  }

  /* 빈 이웃 쌍 (자리 후보) */
  function emptyPairs(g) {
    const out = [];
    for (const [q, r] of cells()) {
      if (g.board[K(q, r)] !== -1) continue;
      for (let d = 0; d < 3; d++) {   // 방향 절반만 → 쌍 중복 없음
        const q2 = q + DIRS[d][0], r2 = r + DIRS[d][1];
        if (inBoard(q2, r2) && g.board[K(q2, r2)] === -1) out.push([[q, r], [q2, r2]]);
      }
    }
    return out;
  }
  function hasSpace(g) { return emptyPairs(g).length > 0; }

  /* 점수 계산: 각 반쪽에서 6방향(단, 자기 타일의 다른 반쪽 방향 제외)으로 같은 그림 줄 세기 */
  function scoreMove(g, tile, ca, cb) {
    const gains = [0, 0, 0, 0, 0, 0];
    const halves = [[ca, tile[0], cb], [cb, tile[1], ca]];
    for (const [cell, sym, other] of halves) {
      for (const [dq, dr] of DIRS) {
        if (cell[0] + dq === other[0] && cell[1] + dr === other[1]) continue;
        let q = cell[0] + dq, r = cell[1] + dr, n = 0;
        while (inBoard(q, r) && g.board[K(q, r)] === sym) { n++; q += dq; r += dr; }
        gains[sym] += n;
      }
    }
    return gains;
  }

  /* 수 적용. flip이면 타일 반쪽을 서로 바꿔 놓는다. → {gains, genius, drew} */
  function applyMove(g, handIdx, ca, cb, flip) {
    if (g.over) return null;
    const hand = g.hands[g.turn];
    const tile0 = hand[handIdx];
    if (!tile0) return null;
    const tile = flip ? [tile0[1], tile0[0]] : tile0;
    /* 검증 */
    if (!inBoard(ca[0], ca[1]) || !inBoard(cb[0], cb[1])) return null;
    if (g.board[K(ca[0], ca[1])] !== -1 || g.board[K(cb[0], cb[1])] !== -1) return null;
    if (!DIRS.some(([dq, dr]) => ca[0] + dq === cb[0] && ca[1] + dr === cb[1])) return null;

    const gains = scoreMove(g, tile, ca, cb);
    g.board[K(ca[0], ca[1])] = tile[0];
    g.board[K(cb[0], cb[1])] = tile[1];
    const tr = g.tracks[g.turn];
    let genius = false;
    for (let s = 0; s < 6; s++) {
      if (!gains[s]) continue;
      const before = tr[s];
      tr[s] = Math.min(MAX, tr[s] + gains[s]);
      if (before < MAX && tr[s] >= MAX) genius = true;
    }
    hand.splice(handIdx, 1);
    const drew = g.bag.length ? (hand.push(g.bag.pop()), true) : false;
    g.passes = 0;

    if (!genius) g.turn = 3 - g.turn;
    checkEnd(g);
    return { gains, genius, drew };
  }

  function pass(g) {   // 손패가 없을 때만
    if (g.over) return;
    g.passes++;
    g.turn = 3 - g.turn;
    if (g.passes >= 2) finish(g);
    else checkEnd(g);
  }

  function checkEnd(g) {
    if (!hasSpace(g)) return finish(g);
    if (g.hands[1].length === 0 && g.hands[2].length === 0) return finish(g);
  }
  /* 반전 규칙: 낮은 색부터 비교 — 더 높은 쪽 승리 */
  function compareTracks(a, b) {
    const sa = a.slice().sort((x, y) => x - y), sb = b.slice().sort((x, y) => x - y);
    for (let i = 0; i < 6; i++) if (sa[i] !== sb[i]) return sa[i] > sb[i] ? 1 : -1;
    return 0;
  }
  function finish(g) {
    g.over = true;
    const c = compareTracks(g.tracks[1], g.tracks[2]);
    g.winner = c > 0 ? 1 : c < 0 ? 2 : 0;
  }

  /* ---------- AI ---------- */
  /* 가치: 낮은 색을 키우는 게 곧 승점 — 가중치 = (MAX+1 − 현재값), 12 도달(한 번 더)은 큰 보너스 */
  function evalGains(tr, gains) {
    let v = 0;
    for (let s = 0; s < 6; s++) {
      if (!gains[s]) continue;
      let cur = tr[s];
      for (let i = 0; i < gains[s] && cur < MAX; i++) { v += (MAX + 1 - cur); cur++; }
      if (tr[s] < MAX && cur >= MAX) v += 30;   // 무지개 완성 = 한 번 더
    }
    return v;
  }
  function allMoves(g) {
    const out = [];
    const pairs = emptyPairs(g);
    const hand = g.hands[g.turn];
    for (let h = 0; h < hand.length; h++) {
      const flips = hand[h][0] === hand[h][1] ? [false] : [false, true];
      for (const [ca, cb] of pairs) for (const flip of flips)
        out.push({ h, ca, cb, flip });
    }
    return out;
  }
  function aiPick(g, level, rnd) {
    rnd = rnd || Math.random;
    const moves = allMoves(g);
    if (!moves.length) return null;
    const tr = g.tracks[g.turn], op = g.tracks[3 - g.turn];
    const scored = moves.map(m => {
      const tile0 = g.hands[g.turn][m.h];
      const tile = m.flip ? [tile0[1], tile0[0]] : tile0;
      const gains = scoreMove(g, tile, m.ca, m.cb);
      let v = evalGains(tr, gains);
      if (level >= 3) {
        /* 도사급: 상대가 그 자리에서 얻었을 값도 본다(길목 선점) */
        v += evalGains(op, gains) * 0.35;
        /* 내 최저 색을 올리는 수를 한 번 더 우대 */
        const minV = Math.min.apply(null, tr);
        for (let s = 0; s < 6; s++) if (tr[s] === minV && gains[s]) v += gains[s] * 3;
      }
      return { m, v: v + rnd() * 0.9 };
    });
    scored.sort((a, b) => b.v - a.v);
    if (level === 1) {   // 아장아장: 위쪽 절반에서 아무거나 (점수 감각만 살짝)
      const half = scored.slice(0, Math.max(1, (scored.length * 0.6) | 0));
      return half[(rnd() * half.length) | 0].m;
    }
    return scored[0].m;
  }

  return { R, MAX, HAND, SYMS, COLS, DIRS, CORNERS, K, cells, inBoard, mulberry32,
    newGame, emptyPairs, hasSpace, scoreMove, applyMove, pass, compareTracks,
    allMoves, aiPick, evalGains };
}));
