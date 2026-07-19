/* 케이파크 보드게임 · 숫자 사다리 원정 — 순수 로직 (UI 없음)
 * 1~100 지그재그 판. 사다리는 올라가고 미끄럼틀은 내려간다.
 * 🚀 로켓 = 5칸 전진, ⭐ 별 = 한 번 더, ✨ 반짝 = 암산 반짝 문제 (맞히면 +3). */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LadderCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  const GOAL = 100;
  const LADDERS = { 4: 24, 13: 46, 33: 52, 42: 63, 50: 69, 62: 81, 74: 92 };
  const SLIDES  = { 27: 9, 40: 21, 56: 37, 65: 44, 78: 58, 89: 68, 98: 79 };
  const ROCKETS = [17, 47, 71];       // +5
  const STARS   = [22, 55, 86];       // 한 번 더
  const SPARKS  = [8, 31, 48, 60, 83, 94]; // 암산 반짝

  /* n(1~100) → [col,row] — row 0 = 맨 아래 줄, 지그재그 */
  function tileXY(n) {
    const i = n - 1, row = Math.floor(i / 10), k = i % 10;
    const col = row % 2 === 0 ? k : 9 - k;
    return [col, row];
  }
  function tileType(n) {
    if (LADDERS[n]) return 'ladder';
    if (SLIDES[n]) return 'slide';
    if (ROCKETS.indexOf(n) >= 0) return 'rocket';
    if (STARS.indexOf(n) >= 0) return 'star';
    if (SPARKS.indexOf(n) >= 0) return 'spark';
    return '';
  }

  /* 주사위 이동 + 특수칸 연쇄 해소.
   * 반환: { pos, events:[{type,from,to}...], extraRoll, spark }
   * spark=true면 UI가 문제를 낸 뒤 answerSpark()로 이어간다. */
  function move(pos, die) {
    let p = Math.min(pos + die, GOAL);
    const events = [{ type: 'roll', from: pos, to: p }];
    return resolve(p, events);
  }
  function resolve(p, events) {
    let extraRoll = false, spark = false, guard = 0;
    while (guard++ < 12) {
      if (p >= GOAL) { p = GOAL; break; }
      const t = tileType(p);
      if (t === 'ladder') { events.push({ type: 'ladder', from: p, to: LADDERS[p] }); p = LADDERS[p]; continue; }
      if (t === 'slide') { events.push({ type: 'slide', from: p, to: SLIDES[p] }); p = SLIDES[p]; continue; }
      if (t === 'rocket') { const to = Math.min(p + 5, GOAL); events.push({ type: 'rocket', from: p, to }); p = to; continue; }
      if (t === 'star') { events.push({ type: 'star', from: p, to: p }); extraRoll = true; break; }
      if (t === 'spark') { events.push({ type: 'spark', from: p, to: p }); spark = true; break; }
      break;
    }
    return { pos: p, events, extraRoll, spark };
  }
  /* 반짝 문제 정답 → +3 후 연쇄 재해소 (또 반짝이면 다시 문제) */
  function sparkBonus(pos) {
    const to = Math.min(pos + 3, GOAL);
    const events = [{ type: 'bonus', from: pos, to }];
    // +3 지점의 반짝은 다시 발동하지 않도록 사다리·미끄럼틀·로켓·별만 해소
    let p = to, guard = 0, extraRoll = false;
    while (guard++ < 12) {
      if (p >= GOAL) { p = GOAL; break; }
      const t = tileType(p);
      if (t === 'ladder') { events.push({ type: 'ladder', from: p, to: LADDERS[p] }); p = LADDERS[p]; continue; }
      if (t === 'slide') { events.push({ type: 'slide', from: p, to: SLIDES[p] }); p = SLIDES[p]; continue; }
      if (t === 'rocket') { const q = Math.min(p + 5, GOAL); events.push({ type: 'rocket', from: p, to: q }); p = q; continue; }
      if (t === 'star') { events.push({ type: 'star', from: p, to: p }); extraRoll = true; break; }
      break;
    }
    return { pos: p, events, extraRoll, spark: false };
  }

  /* 암산 반짝 문제 생성: 덧셈·뺄셈(두 자리)·곱셈(구구단) */
  function genQuestion(rnd) {
    rnd = rnd || Math.random;
    const kind = Math.floor(rnd() * 3);
    let a, b, ans, q;
    if (kind === 0) { a = 11 + Math.floor(rnd() * 39); b = 6 + Math.floor(rnd() * 34); ans = a + b; q = a + ' + ' + b; }
    else if (kind === 1) { a = 21 + Math.floor(rnd() * 59); b = 5 + Math.floor(rnd() * (a - 10)); ans = a - b; q = a + ' − ' + b; }
    else { a = 2 + Math.floor(rnd() * 8); b = 2 + Math.floor(rnd() * 8); ans = a * b; q = a + ' × ' + b; }
    const set = [ans];
    while (set.length < 3) {
      const d = ans + (Math.floor(rnd() * 7) - 3);
      if (d !== ans && d > 0 && set.indexOf(d) < 0) set.push(d);
    }
    // 섞기
    for (let i = set.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = set[i]; set[i] = set[j]; set[j] = t; }
    return { q, choices: set, answer: ans };
  }

  function rollDie(rnd) { rnd = rnd || Math.random; return 1 + Math.floor(rnd() * 6); }

  return { GOAL, LADDERS, SLIDES, ROCKETS, STARS, SPARKS, tileXY, tileType, move, resolve, sparkBonus, genQuestion, rollDie };
}));
