/* 케이파크 보드게임 · 계산 여행 — 순수 로직 (UI 없음)
 * 케이파크를 도는 24칸 순환 말판. 주사위 두 개를 굴려 이동, 코인을 모은다.
 * 굴린 뒤 코인 2개를 내고 주사위 하나를 다시 굴릴 수 있다 (턴에 한 번) — 어디 떨어질지 계산하라!
 * 출발점을 지날 때마다 +3. 세 바퀴를 먼저 돌면 골인(+5) — 코인 많은 팀 승리. */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TravelCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  const N = 24, LAPS = 3, PASS_BONUS = 3, GOAL_BONUS = 5, REROLL_COST = 2, START_COINS = 10;

  /* 칸 정의: t = start | coin | evenodd | bridge */
  const TILES = [
    { t: 'start',   em: '🏁', nm: '출발',        v: 0 },
    { t: 'coin',    em: '🍬', nm: '사탕 가게',    v: 2 },
    { t: 'evenodd', em: '🎢', nm: '마블런',       v: 0 },   // 주사위 1개: 짝수 +4, 홀수 +1
    { t: 'coin',    em: '💸', nm: '소매치기 까치', v: -2 },
    { t: 'coin',    em: '🍭', nm: '솜사탕 수레',  v: 3 },
    { t: 'bridge',  em: '🌉', nm: '무지개 다리',  v: 0, to: 11 },
    { t: 'coin',    em: '🍬', nm: '사탕 가게',    v: 2 },
    { t: 'coin',    em: '🕳️', nm: '동전 구멍',    v: -3 },
    { t: 'coin',    em: '🎡', nm: '관람차',       v: 4 },
    { t: 'coin',    em: '🍬', nm: '사탕 가게',    v: 2 },
    { t: 'coin',    em: '💸', nm: '소매치기 까치', v: -2 },
    { t: 'coin',    em: '🧩', nm: '칠교 정원',    v: 3 },
    { t: 'coin',    em: '🎪', nm: '서커스',       v: 4 },
    { t: 'coin',    em: '💸', nm: '소매치기 까치', v: -2 },
    { t: 'coin',    em: '🍬', nm: '사탕 가게',    v: 2 },
    { t: 'coin',    em: '🕳️', nm: '동전 구멍',    v: -3 },
    { t: 'coin',    em: '🍭', nm: '솜사탕 수레',  v: 3 },
    { t: 'bridge',  em: '🌠', nm: '별똥 다리',    v: 0, to: 23 },
    { t: 'coin',    em: '🍬', nm: '사탕 가게',    v: 2 },
    { t: 'coin',    em: '💸', nm: '소매치기 까치', v: -2 },
    { t: 'coin',    em: '🎠', nm: '회전목마',     v: 4 },
    { t: 'coin',    em: '🕳️', nm: '동전 구멍',    v: -3 },
    { t: 'coin',    em: '🍬', nm: '사탕 가게',    v: 2 },
    { t: 'coin',    em: '🍭', nm: '솜사탕 수레',  v: 3 }
  ];

  function newState() {
    return { pos: { 1: 0, 2: 0 }, coins: { 1: START_COINS, 2: START_COINS }, laps: { 1: 0, 2: 0 } };
  }
  function rollDie(rnd) { rnd = rnd || Math.random; return 1 + Math.floor(rnd() * 6); }

  /* pos에서 n칸 전진 → { pos, passed } (출발점을 몇 번 지났나) */
  function step(pos, n) {
    let passed = 0, p = pos;
    for (let i = 0; i < n; i++) { p = (p + 1) % N; if (p === 0) passed++; }
    return { pos: p, passed };
  }

  /* 착지칸의 코인 기대값 (evenodd = 2.5, bridge = 건너간 칸 값 + 다리 자체 재미 0) */
  function tileEV(i) {
    const t = TILES[i];
    if (t.t === 'coin') return t.v;
    if (t.t === 'start') return 0;           // 통과 보너스는 passed로 따로 계산
    if (t.t === 'evenodd') return 2.5;
    if (t.t === 'bridge') return tileEV(t.to); // 점프 후 그 칸 효과
    return 0;
  }
  /* d1+d2로 이동했을 때 코인 기대 이득 (통과 보너스 포함) */
  function moveEV(pos, sum) {
    const r = step(pos, sum);
    return tileEV(r.pos) + r.passed * PASS_BONUS;
  }
  /* 주사위 하나를 다시 굴릴 때의 기대 이득 */
  function rerollEV(pos, keep) {
    let s = 0;
    for (let d = 1; d <= 6; d++) s += moveEV(pos, keep + d);
    return s / 6;
  }

  /* AI 결정: 'keep' | 'r1' | 'r2'
   * level 1: 안 굴림. 2: 나쁜 칸(−)이면 이득 계산해서 굴림. 3: 세 선택지 기댓값 비교. */
  function aiDecide(pos, d1, d2, coins, level, rnd) {
    rnd = rnd || Math.random;
    if (coins < REROLL_COST) return 'keep';
    const now = moveEV(pos, d1 + d2);
    if (level === 1) return 'keep';
    const ev1 = rerollEV(pos, d2) - REROLL_COST; // d1을 다시
    const ev2 = rerollEV(pos, d1) - REROLL_COST; // d2를 다시
    if (level === 2) {
      if (now < 0 && Math.max(ev1, ev2) > now + 0.5) return ev1 >= ev2 ? 'r1' : 'r2';
      return 'keep';
    }
    const best = Math.max(now, ev1, ev2);
    if (best === now) return 'keep';
    return ev1 >= ev2 ? 'r1' : 'r2';
  }

  /* 착지 처리: 코인 변화·다리 점프 서술 반환 (evenodd는 UI가 주사위 굴려 evenOddResult 호출) */
  function land(st, player, pos) {
    const evs = [];
    let p = pos, guard = 0;
    while (guard++ < 3) {
      const t = TILES[p];
      if (t.t === 'coin') { evs.push({ type: 'coin', at: p, v: t.v }); addCoins(st, player, t.v); break; }
      if (t.t === 'bridge') { evs.push({ type: 'bridge', from: p, to: t.to }); p = t.to; continue; }
      if (t.t === 'evenodd') { evs.push({ type: 'evenodd', at: p }); break; }
      break; // start 등
    }
    st.pos[player] = p;
    return evs;
  }
  function evenOddResult(st, player, die) {
    const v = die % 2 === 0 ? 4 : 1;
    addCoins(st, player, v);
    return v;
  }
  function addCoins(st, player, v) { st.coins[player] = Math.max(0, st.coins[player] + v); }

  /* 한 턴 전체 실행 (검증·자가 대국용): 굴림→AI 결정→이동→착지 */
  function playTurn(st, player, level, rnd) {
    rnd = rnd || Math.random;
    let d1 = rollDie(rnd), d2 = rollDie(rnd);
    const dec = aiDecide(st.pos[player], d1, d2, st.coins[player], level, rnd);
    if (dec === 'r1') { addCoins(st, player, -REROLL_COST); d1 = rollDie(rnd); }
    if (dec === 'r2') { addCoins(st, player, -REROLL_COST); d2 = rollDie(rnd); }
    const r = step(st.pos[player], d1 + d2);
    if (r.passed) {
      st.laps[player] += r.passed;
      addCoins(st, player, PASS_BONUS * r.passed);
    }
    st.pos[player] = r.pos;
    const evs = land(st, player, r.pos);
    for (const e of evs) if (e.type === 'evenodd') evenOddResult(st, player, rollDie(rnd));
    if (st.laps[player] >= LAPS) { addCoins(st, player, GOAL_BONUS); return { done: true, dec }; }
    return { done: false, dec };
  }

  return { N, LAPS, PASS_BONUS, GOAL_BONUS, REROLL_COST, START_COINS, TILES,
    newState, rollDie, step, tileEV, moveEV, rerollEV, aiDecide, land, evenOddResult, addCoins, playTurn };
}));
