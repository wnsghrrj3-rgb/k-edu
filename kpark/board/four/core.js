/* 케이파크 보드게임 · 사목 배틀 — 순수 로직 (UI 없음)
 * 보드: 7열 × 6행. cells[col][row], row 0 = 바닥. 돌: 1(별) / 2(달). 빈칸 0. */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FourCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  const COLS = 7, ROWS = 6;

  function newBoard() { const b = []; for (let c = 0; c < COLS; c++) b.push([0,0,0,0,0,0]); return b; }
  function clone(b) { return b.map(col => col.slice()); }
  function height(b, c) { let h = 0; while (h < ROWS && b[c][h] !== 0) h++; return h; }
  function canDrop(b, c) { return c >= 0 && c < COLS && height(b, c) < ROWS; }
  function drop(b, c, p) { const h = height(b, c); if (h >= ROWS) return -1; b[c][h] = p; return h; }
  function undrop(b, c) { const h = height(b, c); if (h > 0) b[c][h - 1] = 0; }
  function legalMoves(b) { const m = []; for (const c of [3,2,4,1,5,0,6]) if (canDrop(b, c)) m.push(c); return m; }
  function full(b) { return legalMoves(b).length === 0; }

  /* 4목 검사 — 마지막 착수 (c,r) 기준. 이긴 좌표 4개 배열 또는 null */
  const DIRS = [[1,0],[0,1],[1,1],[1,-1]];
  function winAt(b, c, r) {
    const p = b[c][r]; if (!p) return null;
    for (const [dc, dr] of DIRS) {
      const line = [[c, r]];
      for (const s of [1, -1]) {
        let cc = c + dc * s, rr = r + dr * s;
        while (cc >= 0 && cc < COLS && rr >= 0 && rr < ROWS && b[cc][rr] === p) {
          line.push([cc, rr]); cc += dc * s; rr += dr * s;
        }
      }
      if (line.length >= 4) {
        // 양방향 확장이라 line은 연속 — 정렬 후 착수점 포함 4칸 창을 돌려준다
        line.sort((a, z) => (a[0] - z[0]) || (a[1] - z[1]));
        const idx = line.findIndex(p => p[0] === c && p[1] === r);
        const st = Math.max(0, Math.min(idx, line.length - 4));
        return line.slice(st, st + 4);
      }
    }
    return null;
  }

  /* 평가: 4칸 창(window) 세기 */
  function evalBoard(b, me) {
    const op = 3 - me;
    let sc = 0;
    // 중앙열 가중
    for (let r = 0; r < ROWS; r++) if (b[3][r] === me) sc += 3; else if (b[3][r] === op) sc -= 3;
    function win4(cells) {
      let m = 0, o = 0;
      for (const v of cells) { if (v === me) m++; else if (v === op) o++; }
      if (m && o) return 0;
      if (m === 4) return 100000; if (o === 4) return -100000;
      if (m === 3) return 60; if (o === 3) return -80;
      if (m === 2) return 8; if (o === 2) return -8;
      return 0;
    }
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
      if (c + 3 < COLS) sc += win4([b[c][r], b[c+1][r], b[c+2][r], b[c+3][r]]);
      if (r + 3 < ROWS) sc += win4([b[c][r], b[c][r+1], b[c][r+2], b[c][r+3]]);
      if (c + 3 < COLS && r + 3 < ROWS) sc += win4([b[c][r], b[c+1][r+1], b[c+2][r+2], b[c+3][r+3]]);
      if (c + 3 < COLS && r - 3 >= 0) sc += win4([b[c][r], b[c+1][r-1], b[c+2][r-2], b[c+3][r-3]]);
    }
    return sc;
  }

  /* 미니맥스 + 알파베타. me 차례에서 최선 열 반환 */
  function search(b, me, depth, alpha, beta, maximizing, mover) {
    const moves = legalMoves(b);
    if (moves.length === 0) return { score: 0, col: -1 };
    if (depth === 0) return { score: evalBoard(b, mover), col: -1 };
    const cur = maximizing ? me : 3 - me;
    let best = maximizing ? -Infinity : Infinity, bestCol = moves[0];
    for (const c of moves) {
      const r = drop(b, c, cur);
      const w = winAt(b, c, r);
      let sc;
      if (w) sc = maximizing ? 1000000 - (10 - depth) : -1000000 + (10 - depth);
      else sc = search(b, me, depth - 1, alpha, beta, !maximizing, mover).score;
      undrop(b, c);
      if (maximizing) { if (sc > best) { best = sc; bestCol = c; } alpha = Math.max(alpha, sc); }
      else { if (sc < best) { best = sc; bestCol = c; } beta = Math.min(beta, sc); }
      if (beta <= alpha) break;
    }
    return { score: best, col: bestCol };
  }

  /* AI 착수. level 1(아장아장)=얕고 실수, 2(제법인데)=중간, 3(사목 도사)=깊이 탐색 */
  function aiMove(b, me, level, rnd) {
    rnd = rnd || Math.random;
    const moves = legalMoves(b);
    if (moves.length === 0) return -1;
    // 즉시 승리는 레벨 무관 잡는다
    for (const c of moves) { const r = drop(b, c, me); const w = winAt(b, c, r); undrop(b, c); if (w) return c; }
    // 즉시 패배 방어 (레벨1은 60% 확률로만 알아챔)
    const op = 3 - me;
    for (const c of moves) { const r = drop(b, c, op); const w = winAt(b, c, r); undrop(b, c);
      if (w && (level >= 2 || rnd() < 0.6)) return c; }
    if (level === 1) {
      if (rnd() < 0.35) return moves[Math.floor(rnd() * moves.length)];
      return search(clone(b), me, 2, -Infinity, Infinity, true, me).col;
    }
    const depth = level === 2 ? 4 : 6;
    return search(clone(b), me, depth, -Infinity, Infinity, true, me).col;
  }

  return { COLS, ROWS, newBoard, clone, height, canDrop, drop, undrop, legalMoves, full, winAt, evalBoard, aiMove, search };
}));
