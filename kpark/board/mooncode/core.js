/* 케이파크 보드게임 · 🌙 달빛 암호 — 순수 로직 (UI 없음)
 * 흑·백 타일 0~11 (총 24장). 각자 4장을 뽑아 작은 수부터 정렬(같은 수면 흑이 왼쪽).
 * 차례: 더미에서 1장 뽑기 → 상대의 뒤집힌 타일 하나를 "몇 번!" 추리.
 *   맞으면 그 타일 공개, 이어서 또 추리하거나 멈추고 뽑은 타일을 비밀로 내려놓기.
 *   틀리면 내가 뽑은 타일이 공개된 채 내 줄에 들어감. (더미가 없으면 내 비밀 타일 하나 공개)
 * 승리: 상대 타일을 모두 공개시키면 승리.
 * AI: 공개 정보와 정렬 규칙으로 가능한 모든 세계를 세어 확률이 가장 높은 추리를 한다. */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MoonCodeCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  const MAXN = 11;                       /* 0~11 */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* 타일 = {c:'b'|'w', n:0..11}. 전순서: 수 오름차순, 같은 수는 흑 < 백 */
  const key = t => t.n * 2 + (t.c === 'b' ? 0 : 1);
  const cmp = (a, b) => key(a) - key(b);
  const same = (a, b) => a.c === b.c && a.n === b.n;

  function allTiles() {
    const out = [];
    for (let n = 0; n <= MAXN; n++) { out.push({ c: 'b', n }); out.push({ c: 'w', n }); }
    return out;
  }

  function newGame(seed) {
    const rnd = mulberry32(seed >>> 0);
    const pool = allTiles();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    const g = {
      pool,
      rows: { 1: [], 2: [] },   /* row 항목: {c,n,open:bool} — 항상 cmp 정렬 유지 */
      turn: 1,
      held: null,               /* 이번 차례에 뽑아 든 타일 */
      phase: 'draw'             /* draw → guess → (guess|place) */
    };
    for (let k = 0; k < 4; k++) { _insert(g.rows[1], _pop(g), false); _insert(g.rows[2], _pop(g), false); }
    return g;
  }
  const _pop = g => g.pool.pop();
  function _insert(row, t, open) {
    const item = { c: t.c, n: t.n, open };
    let i = 0; while (i < row.length && cmp(row[i], item) < 0) i++;
    row.splice(i, 0, item);
    return i;
  }

  const opp = p => p === 1 ? 2 : 1;
  const hiddenIdx = row => row.map((t, i) => t.open ? -1 : i).filter(i => i >= 0);

  /* 차례 시작: 더미에서 뽑기(없으면 바로 추리 단계) */
  function draw(g) {
    if (g.phase !== 'draw') throw new Error('지금은 뽑을 수 없음');
    g.held = g.pool.length ? _pop(g) : null;
    g.phase = 'guess';
    return g.held;
  }

  /* 추리: 상대 row의 idx(뒤집힌 것)가 숫자 n인지 */
  function guess(g, idx, n) {
    if (g.phase !== 'guess') throw new Error('지금은 추리할 수 없음');
    const row = g.rows[opp(g.turn)];
    if (!row[idx] || row[idx].open) throw new Error('뒤집힌 타일만 추리 가능');
    if (row[idx].n === n) {
      row[idx].open = true;
      if (hiddenIdx(row).length === 0) { g.phase = 'over'; return { correct: true, win: true }; }
      return { correct: true, win: false };   /* 이어서 guess 또는 stop */
    }
    /* 실패: 든 타일 공개 삽입, 없으면 내 비밀 타일 중 가장 왼쪽 공개 */
    if (g.held) { _insert(g.rows[g.turn], g.held, true); g.held = null; }
    else {
      const my = g.rows[g.turn]; const h = hiddenIdx(my);
      if (h.length) my[h[0]].open = true;
      if (hiddenIdx(my).length === 0) { g.phase = 'over'; return { correct: false, lose: true }; }
    }
    _endTurn(g);
    return { correct: false };
  }

  /* 맞힌 뒤 멈추기: 든 타일을 비밀로 내려놓고 차례 종료 */
  function stop(g) {
    if (g.phase !== 'guess') throw new Error('지금은 멈출 수 없음');
    if (g.held) { _insert(g.rows[g.turn], g.held, false); g.held = null; }
    _endTurn(g);
  }
  function _endTurn(g) { g.turn = opp(g.turn); g.phase = 'draw'; }

  function winner(g) {
    if (hiddenIdx(g.rows[1]).length === 0) return 2;
    if (hiddenIdx(g.rows[2]).length === 0) return 1;
    return null;
  }

  /* ── 추리 AI ──
   * viewer(p) 관점: 미지 타일 = 전체 − 내 줄 − 상대 공개 − 내가 든 타일.
   * 상대 뒤집힌 칸들에 미지 타일 조합을 정렬 규칙에 맞게 넣어 보고,
   * 가능한 세계마다 (칸, 숫자) 빈도를 센다. */
  function analyze(g, p) {
    const row = g.rows[opp(p)];
    const hIdx = hiddenIdx(row);
    if (!hIdx.length) return { total: 0, best: null, table: {} };
    const knownKeys = new Set();
    g.rows[p].forEach(t => knownKeys.add(key(t)));
    row.forEach(t => { if (t.open) knownKeys.add(key(t)); });
    if (g.held) knownKeys.add(key(g.held));
    const U = allTiles().filter(t => !knownKeys.has(key(t)));   /* 미지 타일들 */
    U.sort(cmp);
    const h = hIdx.length;
    /* 칸별 경계: 왼쪽/오른쪽의 가장 가까운 공개 타일 key */
    const lo = hIdx.map(i => { for (let j = i - 1; j >= 0; j--) if (row[j].open) return key(row[j]); return -1; });
    const hi = hIdx.map(i => { for (let j = i + 1; j < row.length; j++) if (row[j].open) return key(row[j]); return 999; });
    const counts = hIdx.map(() => ({}));
    let total = 0;
    /* U에서 h개 고르는 조합(오름차순 인덱스) → 정렬 배치는 유일 → 경계 검사 */
    const pick = new Array(h);
    (function rec(start, d) {
      if (d === h) {
        for (let k = 0; k < h; k++) {
          const t = U[pick[k]];
          if (key(t) <= lo[k] || key(t) >= hi[k]) return;
        }
        /* 사이사이 숨은 칸끼리는 조합이 이미 오름차순이라 자동 만족 —
           단, 같은 숨은 구간이 아닌 경우도 pick 오름차순이므로 전체 정렬 성립 */
        total++;
        for (let k = 0; k < h; k++) counts[k][U[pick[k]].n] = (counts[k][U[pick[k]].n] || 0) + 1;
        return;
      }
      for (let i = start; i <= U.length - (h - d); i++) { pick[d] = i; rec(i + 1, d + 1); }
    })(0, 0);
    let best = null;
    const table = {};
    hIdx.forEach((idx, k) => {
      table[idx] = {};
      for (const n in counts[k]) {
        const pr = counts[k][n] / total;
        table[idx][n] = pr;
        if (!best || pr > best.p) best = { idx, n: +n, p: pr };
      }
    });
    return { total, best, table };
  }

  /* AI 한 차례 실행: 뽑고 → (확신도에 따라) 추리 반복 → 멈추기.
   * level: 'easy'(첫 성공 후 무조건 멈춤, 후보 중 랜덤) | 'hard'(최고 확률, 확신 시 연속 추리) */
  function aiTurn(g, level, rnd) {
    rnd = rnd || Math.random;
    const p = g.turn;
    draw(g);
    const moves = [];
    for (; ;) {
      const a = analyze(g, p);
      if (!a.best) break;
      let pickMove = a.best;
      if (level === 'easy') {
        const cand = [];
        for (const idx in a.table) for (const n in a.table[idx]) cand.push({ idx: +idx, n: +n, p: a.table[idx][n] });
        pickMove = cand[Math.floor(rnd() * cand.length)];
      }
      const r = guess(g, pickMove.idx, pickMove.n);
      moves.push({ idx: pickMove.idx, n: pickMove.n, correct: r.correct, p: pickMove.p });
      if (!r.correct || r.win) return moves;
      /* 성공 후 계속? */
      const nx = analyze(g, p);
      const go = level === 'hard' ? (nx.best && nx.best.p >= 0.65) : false;
      if (!go) { stop(g); return moves; }
    }
    stop(g);
    return moves;
  }

  return { MAXN, key, cmp, same, allTiles, newGame, draw, guess, stop, winner, analyze, aiTurn, opp, hiddenIdx };
}));
