/* 케이파크 보드게임 · ⚡ 번개 퍼즐 — 순수 로직 (UI 없음)
 * 같은 그림자(실루엣)를 조각으로 누가 먼저 꽉 채우나! 속도 퍼즐 레이스.
 * 퍼즐은 조각을 실제로 이어 붙여 만든다 → 언제나 풀 수 있음이 보장.
 * 5라운드, 이긴 사람이 보석 💎 — 보석 많은 팀 승리. */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BoltCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  /* 조각 12종 (3~5칸) */
  const PIECES = [
    { id: 'i3', nm: '막대3', cells: [[0,0],[1,0],[2,0]] },
    { id: 'v3', nm: '꺾임3', cells: [[0,0],[1,0],[0,1]] },
    { id: 'i4', nm: '막대4', cells: [[0,0],[1,0],[2,0],[3,0]] },
    { id: 'o4', nm: '네모4', cells: [[0,0],[1,0],[0,1],[1,1]] },
    { id: 't4', nm: '티4',   cells: [[0,0],[1,0],[2,0],[1,1]] },
    { id: 's4', nm: '에스4', cells: [[1,0],[2,0],[0,1],[1,1]] },
    { id: 'z4', nm: '지그4', cells: [[0,0],[1,0],[1,1],[2,1]] },
    { id: 'l4', nm: '기역4', cells: [[0,0],[0,1],[0,2],[1,2]] },
    { id: 'u5', nm: '유5',   cells: [[0,0],[2,0],[0,1],[1,1],[2,1]] },
    { id: 'p5', nm: '피5',   cells: [[0,0],[1,0],[0,1],[1,1],[0,2]] },
    { id: 'w5', nm: '더블유5', cells: [[0,0],[0,1],[1,1],[1,2],[2,2]] },
    { id: 'n5', nm: '엔5',   cells: [[1,0],[1,1],[0,1],[0,2],[0,3]] }
  ];
  const PIECE_MAP = {}; PIECES.forEach(p => PIECE_MAP[p.id] = p);

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

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
  const key = cells => cells.map(c => c.join(',')).join(';');
  function uniqueOrients(pid) {
    const seen = {}, out = [];
    for (let f = 0; f < 2; f++) for (let r = 0; r < 4; r++) {
      const cs = orient(PIECE_MAP[pid].cells, r, f);
      const k = key(cs);
      if (!seen[k]) { seen[k] = 1; out.push({ r, f, cells: cs }); }
    }
    return out;
  }
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* ---------- 퍼즐 생성: 조각을 실제로 이어 붙여 그림자를 만든다 ---------- */
  const WORK = 8;                      // 작업 공간
  function tryBuild(pids, rng) {
    const occ = {};                    // "x,y" → pid
    const sol = [];
    for (let pi = 0; pi < pids.length; pi++) {
      const pid = pids[pi];
      const os = shuffle(uniqueOrients(pid), rng);
      let done = false;
      const positions = [];
      for (let oy = 0; oy < WORK; oy++) for (let ox = 0; ox < WORK; ox++) positions.push([ox, oy]);
      const ps = shuffle(positions, rng);
      for (const o of os) {
        for (const [ox, oy] of ps) {
          let fits = true, touch = pi === 0;
          for (const [dx, dy] of o.cells) {
            const x = ox + dx, y = oy + dy;
            if (x >= WORK || y >= WORK || occ[x + ',' + y]) { fits = false; break; }
            if (pi > 0) for (const [ax, ay] of [[1,0],[-1,0],[0,1],[0,-1]])
              if (occ[(x + ax) + ',' + (y + ay)]) touch = true;
          }
          if (fits && touch) {
            for (const [dx, dy] of o.cells) occ[(ox + dx) + ',' + (oy + dy)] = pid;
            sol.push({ pid, cells: o.cells, ox, oy });
            done = true; break;
          }
        }
        if (done) break;
      }
      if (!done) return null;
    }
    return sol;
  }

  /* level 1·2 = 조각 3개(3~4칸), level 3 = 조각 4개(3~5칸) */
  function genPuzzle(level, seed) {
    const rng = mulberry32((seed | 0) + level * 7919);
    const K = level >= 3 ? 4 : 3;
    const pool = PIECES.filter(p => p.cells.length <= (level >= 2 ? 5 : 4)).map(p => p.id);
    for (let attempt = 0; attempt < 60; attempt++) {
      const pids = shuffle(pool, rng).slice(0, K);
      const sol = tryBuild(pids, rng);
      if (!sol) continue;
      /* 원점 정렬 */
      let mx = Infinity, my = Infinity, Mx = 0, My = 0;
      for (const s of sol) for (const [dx, dy] of s.cells) {
        mx = Math.min(mx, s.ox + dx); my = Math.min(my, s.oy + dy);
        Mx = Math.max(Mx, s.ox + dx); My = Math.max(My, s.oy + dy);
      }
      const solution = sol.map(s => ({ pid: s.pid, cells: s.cells, ox: s.ox - mx, oy: s.oy - my }));
      const silSet = {};
      for (const s of solution) for (const [dx, dy] of s.cells) silSet[(s.ox + dx) + ',' + (s.oy + dy)] = 1;
      return {
        pieces: pids, solution, sil: silSet,
        W: Mx - mx + 1, H: My - my + 1,
        size: Object.keys(silSet).length
      };
    }
    return null; // 이론상 도달 불가 (테스트로 100시드 확인)
  }

  /* ---------- 놓기 규칙 ---------- */
  function canPlace(puz, placed, cells, ox, oy) {
    const used = {};
    for (const pid in placed) {
      const p = placed[pid];
      for (const [dx, dy] of p.cells) used[(p.ox + dx) + ',' + (p.oy + dy)] = 1;
    }
    for (const [dx, dy] of cells) {
      const k = (ox + dx) + ',' + (oy + dy);
      if (!puz.sil[k] || used[k]) return false;
    }
    return true;
  }
  function isSolved(puz, placed) {
    let n = 0;
    for (const pid of puz.pieces) {
      if (!placed[pid]) return false;
      n += placed[pid].cells.length;
    }
    return n === puz.size;   // 전부 놓였고 겹침 없음(canPlace 보장) = 정확히 덮음
  }

  /* ---------- 컴퓨터의 풀이 계획 (시간 연출) ---------- */
  function aiPlan(level, K, rnd) {
    rnd = rnd || Math.random;
    let total, failP;
    if (level === 1) { total = 35 + rnd() * 15; failP = 0.25; }
    else if (level === 2) { total = 20 + rnd() * 12; failP = 0.08; }
    else { total = 10 + rnd() * 6; failP = 0; }
    const fail = rnd() < failP;
    const reveals = [];
    for (let i = 0; i < K; i++) reveals.push(total * (0.25 + 0.75 * (i + 1) / K) * (0.9 + rnd() * 0.1));
    reveals.sort((a, b) => a - b);
    return { total: fail ? Infinity : total, reveals: fail ? reveals.slice(0, K - 1) : reveals };
  }

  /* ---------- 매치 (5라운드 보석) ---------- */
  const GEMS = ['💎', '💚', '🧡', '💜'];
  const ROUNDS = 5;
  const T_LIMIT = 90;
  function newMatch() { return { round: 1, gems: { 1: [], 2: [] }, over: false }; }
  function roundResult(match, winner, rnd) {
    rnd = rnd || Math.random;
    let gem = null;
    if (winner === 1 || winner === 2) {
      gem = GEMS[(rnd() * GEMS.length) | 0];
      match.gems[winner].push(gem);
    }
    if (match.round >= ROUNDS) match.over = true;
    else match.round++;
    return gem;
  }
  function matchWinner(match) {
    const a = match.gems[1].length, b = match.gems[2].length;
    return a > b ? 1 : b > a ? 2 : 0;
  }

  return { PIECES, PIECE_MAP, GEMS, ROUNDS, T_LIMIT, mulberry32, normalize, orient, uniqueOrients,
    genPuzzle, canPlace, isSolved, aiPlan, newMatch, roundResult, matchWinner };
}));
