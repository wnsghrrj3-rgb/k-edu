/* 케이파크 보드게임 · 🎩 타일 마술사 — 순수 로직 (UI 없음)
 * 4색 × 1~13 × 2벌 + 조커 2 = 106장. 각자 14장으로 시작.
 * 묶음: 같은 색 연속 3장 이상(계단) 또는 같은 수 다른 색 3~4장(모둠). 조커는 아무 타일 대신!
 * 첫 등록: 내 손에서만 만든 묶음 합이 30점 이상(쉬움 20). 등록 후엔 판 위 타일을 자유롭게 재배열 가능.
 * 낼 수 없으면 1장 뽑기. 손이 비면 "매직!" 승리. 더미가 비고 둘 다 못 내면 손 합계가 적은 쪽 승. */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TileMagicCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* 타일: {id, c:0..3, n:1..13} · 조커: {id, j:true} */
  function allTiles() {
    const out = []; let id = 0;
    for (let d = 0; d < 2; d++) for (let c = 0; c < 4; c++) for (let n = 1; n <= 13; n++) out.push({ id: id++, c, n });
    out.push({ id: id++, j: true }); out.push({ id: id++, j: true });
    return out;
  }

  function newGame(seed, opts) {
    opts = opts || {};
    const rnd = mulberry32(seed >>> 0);
    const pool = allTiles();
    for (let i = pool.length - 1; i > 0; i--) {
      const k = Math.floor(rnd() * (i + 1));
      const t = pool[i]; pool[i] = pool[k]; pool[k] = t;
    }
    const g = {
      pool,
      hands: { 1: [], 2: [] },
      table: [],                 /* 묶음 배열: [[tile,…],…] */
      opened: { 1: false, 2: false },
      target: opts.target || 30,
      turn: 1, passes: 0, over: null
    };
    for (let k = 0; k < 14; k++) { g.hands[1].push(pool.pop()); g.hands[2].push(pool.pop()); }
    return g;
  }

  /* ── 묶음 검증. false 또는 {type, value} (조커는 대신하는 값으로 계산, 최대값 배치) ── */
  function validMeld(tiles) {
    const n = tiles.length;
    if (n < 3) return false;
    const jokers = tiles.filter(t => t.j).length;
    const real = tiles.filter(t => !t.j);
    if (!real.length) return false;
    /* 모둠: 같은 수, 다른 색, 3~4장 */
    let group = false;
    if (n <= 4 && real.every(t => t.n === real[0].n)) {
      const cols = new Set(real.map(t => t.c));
      if (cols.size === real.length) group = { type: 'group', value: real[0].n * n };
    }
    /* 계단: 같은 색, 연속 수(조커로 빈칸 채움) */
    let run = false;
    if (real.every(t => t.c === real[0].c)) {
      const nums = real.map(t => t.n).sort((a, b) => a - b);
      let dup = false;
      for (let i = 1; i < nums.length; i++) if (nums[i] === nums[i - 1]) dup = true;
      if (!dup) {
        const min = nums[0], max = nums[nums.length - 1];
        const gaps = (max - min + 1) - nums.length;
        if (gaps <= jokers) {
          const left = jokers - gaps;
          const xMin = Math.max(0, max + left - 13);      /* 위로 못 뻗는 만큼 아래로 */
          const xMax = Math.min(left, min - 1);
          if (xMin <= xMax) {
            const lo = min - xMin, hi = max + (left - xMin);   /* 최대 점수 배치 */
            run = { type: 'run', value: (hi + lo) * (hi - lo + 1) / 2 };
          }
        }
      }
    }
    if (group && run) return group.value >= run.value ? group : run;
    return group || run || false;
  }

  const validateTable = melds => melds.every(m => validMeld(m));
  const ids = arr => arr.map(t => t.id).sort((a, b) => a - b).join(',');
  const flat = melds => melds.reduce((s, m) => s.concat(m), []);

  /* ── 턴 종료 시도: newMelds = 플레이어가 만든 새 판 전체.
   * 성공 시 적용하고 {placed, win} 반환. 실패 시 {error} ── */
  function tryEndTurn(g, p, newMelds) {
    if (g.over) return { error: '게임이 끝났어요' };
    if (p !== g.turn) return { error: '내 차례가 아니에요' };
    const oldIds = new Set(flat(g.table).map(t => t.id));
    const newTiles = flat(newMelds);
    const newIds = new Set(newTiles.map(t => t.id));
    if (newIds.size !== newTiles.length) return { error: '같은 타일이 두 번 쓰였어요' };
    for (const id of oldIds) if (!newIds.has(id)) return { error: '판 위 타일은 손으로 가져올 수 없어요' };
    const handIds = new Set(g.hands[p].map(t => t.id));
    const placed = newTiles.filter(t => !oldIds.has(t.id));
    for (const t of placed) if (!handIds.has(t.id)) return { error: '알 수 없는 타일' };
    if (!placed.length) return { error: '적어도 1장은 내려놓아야 해요 (못 내면 뽑기!)' };
    for (const m of newMelds) if (!validMeld(m)) return { error: '완성되지 않은 묶음이 있어요' };
    if (!g.opened[p]) {
      /* 첫 등록: 새 묶음은 전부 내 손 타일로만, 기존 묶음은 그대로여야 함 */
      const oldSet = new Set(g.table.map(m => ids(m)));
      let sum = 0;
      for (const m of newMelds) {
        if (oldSet.has(ids(m))) { oldSet.delete(ids(m)); continue; }
        if (!m.every(t => !oldIds.has(t.id))) return { error: '첫 등록은 판 위 타일을 쓸 수 없어요' };
        sum += validMeld(m).value;
      }
      if (oldSet.size) return { error: '첫 등록 전에는 판을 재배열할 수 없어요' };
      if (sum < g.target) return { error: '첫 등록은 ' + g.target + '점 이상! (지금 ' + sum + '점)' };
      g.opened[p] = true;
    }
    const placedIds = new Set(placed.map(t => t.id));
    g.hands[p] = g.hands[p].filter(t => !placedIds.has(t.id));
    g.table = newMelds.map(m => m.slice());
    g.passes = 0;
    if (!g.hands[p].length) { g.over = { winner: p, magic: true }; return { placed: placed.length, win: true }; }
    g.turn = p === 1 ? 2 : 1;
    return { placed: placed.length, win: false };
  }

  /* 뽑기(또는 더미 없으면 패스). 막힌 게임 종료 처리 */
  function drawPass(g, p) {
    if (g.over) return { error: '게임이 끝났어요' };
    if (p !== g.turn) return { error: '내 차례가 아니에요' };
    let drawn = null;
    if (g.pool.length) { drawn = g.pool.pop(); g.hands[p].push(drawn); g.passes = 0; }
    else {
      g.passes++;
      if (g.passes >= 2) {
        const s1 = handSum(g.hands[1]), s2 = handSum(g.hands[2]);
        g.over = { winner: s1 === s2 ? 0 : (s1 < s2 ? 1 : 2), magic: false, sums: { 1: s1, 2: s2 } };
        return { drawn: null, over: g.over };
      }
    }
    g.turn = p === 1 ? 2 : 1;
    return { drawn };
  }

  const handSum = hand => hand.reduce((s, t) => s + (t.j ? 30 : t.n), 0);

  /* ── AI: 손에서 묶음 탐색(모둠·계단) + 등록 후엔 판 확장 ── */
  function findHandMelds(hand) {
    const used = new Set(); const melds = [];
    /* 모둠: 같은 수, 색 중복 없이 3~4 */
    for (let n = 13; n >= 1; n--) {
      const byCol = {};
      hand.forEach(t => { if (!t.j && t.n === n && !used.has(t.id) && !byCol[t.c]) byCol[t.c] = t; });
      const cols = Object.values(byCol);
      if (cols.length >= 3) { cols.slice(0, 4).forEach(t => used.add(t.id)); melds.push(cols.slice(0, 4)); }
    }
    /* 계단: 색별 연속 구간 */
    for (let c = 0; c < 4; c++) {
      const byN = {};
      hand.forEach(t => { if (!t.j && t.c === c && !used.has(t.id) && !byN[t.n]) byN[t.n] = t; });
      let chain = [];
      for (let n = 1; n <= 14; n++) {
        if (byN[n]) chain.push(byN[n]);
        else {
          if (chain.length >= 3) { chain.forEach(t => used.add(t.id)); melds.push(chain.slice()); }
          chain = [];
        }
      }
    }
    return melds;
  }

  /* AI 한 차례 실행. 결과 {action:'meld'|'extend'|'draw', …} */
  function aiTurn(g) {
    const p = g.turn, hand = g.hands[p];
    const melds = findHandMelds(hand);
    if (!g.opened[p]) {
      const sum = melds.reduce((s, m) => s + (validMeld(m) ? validMeld(m).value : 0), 0);
      if (melds.length && sum >= g.target) {
        const table = g.table.concat(melds);
        const r = tryEndTurn(g, p, table);
        if (!r.error) return { action: 'meld', count: melds.length, win: r.win };
      }
      const d = drawPass(g, p);
      return { action: 'draw', over: d.over };
    }
    /* 등록 후: 손 묶음 전부 + 확장 시도 */
    const table = g.table.map(m => m.slice()).concat(melds);
    const usedIds = new Set(flat(melds).map(t => t.id));
    let extended = 0;
    for (const m of table) {
      const v = validMeld(m); if (!v) continue;
      if (v.type === 'run') {
        const real = m.filter(t => !t.j);
        const c = real[0].c;
        const nums = real.map(t => t.n);
        const lo = Math.min.apply(null, nums), hi = Math.max.apply(null, nums);
        for (const t of hand) {
          if (t.j || usedIds.has(t.id) || t.c !== c) continue;
          if (t.n === lo - 1 && validMeld([t].concat(m))) { m.unshift(t); usedIds.add(t.id); extended++; }
          else if (t.n === hi + 1 && validMeld(m.concat([t]))) { m.push(t); usedIds.add(t.id); extended++; }
        }
      } else if (v.type === 'group' && m.length === 3) {
        const real = m.filter(t => !t.j);
        const cols = new Set(real.map(t => t.c));
        for (const t of hand) {
          if (t.j || usedIds.has(t.id)) continue;
          if (t.n === real[0].n && !cols.has(t.c)) { m.push(t); usedIds.add(t.id); extended++; break; }
        }
      }
    }
    if (melds.length || extended) {
      const r = tryEndTurn(g, p, table);
      if (!r.error) return { action: 'meld', count: melds.length, extended, win: r.win };
    }
    const d = drawPass(g, p);
    return { action: 'draw', over: d.over };
  }

  return { allTiles, newGame, validMeld, validateTable, tryEndTurn, drawPass, handSum, findHandMelds, aiTurn };
}));
