/* 케이파크 보드게임 · 수학 땅따먹기 — 순수 로직 (UI 없음)
 * 9×9 판. 조각(폴리오미노)을 번갈아 놓아 땅을 넓힌다.
 * 규칙: 첫 조각은 자기 시작별을 덮어야 하고, 그 뒤로는 내 땅에 변으로 이어 붙인다.
 * 겹치기 금지. 둘 다 더 놓을 수 없으면 끝 — 칸 수 많은 팀 승리. */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LandCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  const N = 9;
  const STARTS = { 1: [0, 0], 2: [N - 1, N - 1] }; // 별팀 왼위 · 달팀 오른아래

  /* 조각 10종 (칸 좌표) — 합 33칸 */
  const PIECES = [
    { id: 'p1',  nm: '한 칸',   cells: [[0,0]] },
    { id: 'p2',  nm: '두 칸',   cells: [[0,0],[1,0]] },
    { id: 'i3',  nm: '막대3',  cells: [[0,0],[1,0],[2,0]] },
    { id: 'l3',  nm: '꺾임3',  cells: [[0,0],[1,0],[0,1]] },
    { id: 'i4',  nm: '막대4',  cells: [[0,0],[1,0],[2,0],[3,0]] },
    { id: 'o4',  nm: '네모4',  cells: [[0,0],[1,0],[0,1],[1,1]] },
    { id: 't4',  nm: '티4',    cells: [[0,0],[1,0],[2,0],[1,1]] },
    { id: 's4',  nm: '에스4',  cells: [[1,0],[2,0],[0,1],[1,1]] },
    { id: 'z4',  nm: '지그4',  cells: [[0,0],[1,0],[1,1],[2,1]] },
    { id: 'l4',  nm: '기역4',  cells: [[0,0],[0,1],[0,2],[1,2]] }
  ];
  const PIECE_MAP = {}; PIECES.forEach(p => PIECE_MAP[p.id] = p);

  function normalize(cells) {
    let mx = Infinity, my = Infinity;
    for (const [x, y] of cells) { if (x < mx) mx = x; if (y < my) my = y; }
    return cells.map(([x, y]) => [x - mx, y - my])
      .sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));
  }
  function orient(cells, r, f) {
    let cs = cells.map(([x, y]) => f ? [-x, y] : [x, y]);
    for (let i = 0; i < r; i++) cs = cs.map(([x, y]) => [-y, x]);
    return normalize(cs);
  }
  function key(cells) { return cells.map(c => c.join(',')).join(';'); }
  /* 중복 없는 방향 목록 */
  function uniqueOrients(pid) {
    const seen = {}, out = [];
    for (let f = 0; f < 2; f++) for (let r = 0; r < 4; r++) {
      const cs = orient(PIECE_MAP[pid].cells, r, f);
      const k = key(cs);
      if (!seen[k]) { seen[k] = 1; out.push(cs); }
    }
    return out;
  }

  function newBoard() { const b = []; for (let y = 0; y < N; y++) b.push(new Array(N).fill(0)); return b; }
  function newHand() { return PIECES.map(p => p.id); }
  function count(b, p) { let n = 0; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (b[y][x] === p) n++; return n; }
  function hasAny(b, p) { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (b[y][x] === p) return true; return false; }

  /* cells를 (ox,oy)에 놓을 수 있나 */
  function canPlace(b, player, cells, ox, oy) {
    const first = !hasAny(b, player);
    let touch = false, coverStart = false;
    const [sx, sy] = STARTS[player];
    for (const [dx, dy] of cells) {
      const x = ox + dx, y = oy + dy;
      if (x < 0 || x >= N || y < 0 || y >= N) return false;
      if (b[y][x] !== 0) return false;
      if (x === sx && y === sy) coverStart = true;
      if (!first) {
        for (const [ax, ay] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          const nx = x + ax, ny = y + ay;
          if (nx >= 0 && nx < N && ny >= 0 && ny < N && b[ny][nx] === player) touch = true;
        }
      }
    }
    return first ? coverStart : touch;
  }
  function place(b, player, cells, ox, oy) {
    for (const [dx, dy] of cells) b[oy + dy][ox + dx] = player;
  }

  /* 손패로 가능한 모든 수 */
  function allMoves(b, player, hand) {
    const out = [];
    for (const pid of hand) {
      for (const cells of uniqueOrients(pid)) {
        let w = 0, h = 0;
        for (const [x, y] of cells) { if (x > w) w = x; if (y > h) h = y; }
        for (let oy = 0; oy < N - h; oy++) for (let ox = 0; ox < N - w; ox++)
          if (canPlace(b, player, cells, ox, oy)) out.push({ pid, cells, ox, oy });
      }
    }
    return out;
  }
  function canMove(b, player, hand) {
    for (const pid of hand) {
      for (const cells of uniqueOrients(pid)) {
        let w = 0, h = 0;
        for (const [x, y] of cells) { if (x > w) w = x; if (y > h) h = y; }
        for (let oy = 0; oy < N - h; oy++) for (let ox = 0; ox < N - w; ox++)
          if (canPlace(b, player, cells, ox, oy)) return true;
      }
    }
    return false;
  }

  /* 내 땅의 확장 여지(빈 이웃 칸 수) */
  function frontier(b, player) {
    const seen = {};
    let n = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (b[y][x] !== player) continue;
      for (const [ax, ay] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + ax, ny = y + ay, k = nx + ',' + ny;
        if (nx >= 0 && nx < N && ny >= 0 && ny < N && b[ny][nx] === 0 && !seen[k]) { seen[k] = 1; n++; }
      }
    }
    return n;
  }

  /* AI: level 1 아무 데나, 2 크게+가운데, 3 크게+상대 길목 막기+내 여지 */
  function aiPick(b, player, hand, level, rnd) {
    rnd = rnd || Math.random;
    const moves = allMoves(b, player, hand);
    if (moves.length === 0) return null;
    if (level === 1) return moves[Math.floor(rnd() * moves.length)];
    const op = 3 - player;
    let best = null, bestSc = -Infinity;
    for (const m of moves) {
      const nb = b.map(r => r.slice());
      place(nb, player, m.cells, m.ox, m.oy);
      let sc = m.cells.length * 100;
      // 가운데 선점
      for (const [dx, dy] of m.cells) {
        const x = m.ox + dx, y = m.oy + dy;
        sc -= (Math.abs(x - 4) + Math.abs(y - 4)) * 2;
      }
      if (level >= 3) {
        sc -= frontier(nb, op) * 6;      // 상대 확장 여지 줄이기
        sc += frontier(nb, player) * 3;  // 내 확장 여지 지키기
      }
      sc += rnd() * 4; // 동점 무작위
      if (sc > bestSc) { bestSc = sc; best = m; }
    }
    return best;
  }

  return { N, STARTS, PIECES, PIECE_MAP, newBoard, newHand, normalize, orient, uniqueOrients,
    canPlace, place, allMoves, canMove, count, frontier, aiPick };
}));
