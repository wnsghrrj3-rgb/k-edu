/* 뽑기 도구 — 순수 로직층 (P1)
 * 규약: 이 파일은 DOM·window·localStorage를 일절 모른다. 입력 → 출력만.
 *       UI(index.html)는 이 파일의 함수만 호출한다.
 * 결정성: 모든 무작위는 주입된 rng(0<=r<1)를 통과한다. 테스트는 시드 rng로 고정 재현.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PickLogic = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── 시드 난수 (mulberry32) — 같은 시드 = 같은 결과 ── */
  function makeRng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a += 0x6D2B79F5;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── 명단 파싱 ──
   * 줄바꿈·쉼표·탭 구분 모두 허용. 앞의 번호("1. 김하늘", "12) 박바다")는 떼어낸다.
   * 공백 줄 제거, 좌우 공백 제거, 중복 이름은 뒤엣것 제거(먼저 적은 순서 보존).
   */
  function parseRoster(text) {
    if (typeof text !== 'string') return [];
    var raw = text.split(/[\n,\t]/);
    var out = [];
    var seen = Object.create(null);
    for (var i = 0; i < raw.length; i++) {
      var s = raw[i].replace(/\s+/g, ' ').trim();
      if (!s) continue;
      s = s.replace(/^\d{1,3}\s*[.)\]:-]\s*/, '').trim();   // 선행 번호 제거
      if (!s) continue;
      if (s.length > 20) s = s.slice(0, 20);
      var key = s.toLowerCase();
      if (seen[key]) continue;
      seen[key] = 1;
      out.push(s);
    }
    return out;
  }

  /* ── 셔플 (Fisher–Yates, rng 주입) — 원본 불변 ── */
  function shuffle(list, rng) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ── 뽑기 대상 = 전체 명단 − 오늘 제외 ── */
  function activePool(names, excluded) {
    var ex = Object.create(null);
    (excluded || []).forEach(function (n) { ex[n] = 1; });
    return (names || []).filter(function (n) { return !ex[n]; });
  }

  /* ── 한 명 뽑기 ──
   * 원칙: 한 바퀴 안에서는 같은 사람이 두 번 나오지 않는다(공정성).
   *       남은 사람이 없으면 한 바퀴를 새로 열고(round+1) 전원 다시 후보.
   *       repeatAllowed=true면 매번 전원 후보(반복 허용 방식).
   * 반환: { name, drawn, round, exhausted }  — drawn = 갱신된 이번 바퀴 기록
   *       뽑을 사람이 아예 없으면 { name:null }.
   */
  function drawOne(opts) {
    var names = opts.names || [];
    var excluded = opts.excluded || [];
    var drawn = (opts.drawn || []).slice();
    var round = opts.round || 1;
    var rng = opts.rng || Math.random;
    var repeatAllowed = !!opts.repeatAllowed;

    var pool = activePool(names, excluded);
    if (pool.length === 0) return { name: null, drawn: drawn, round: round, exhausted: true };

    if (repeatAllowed) {
      var pick0 = pool[Math.floor(rng() * pool.length)];
      return { name: pick0, drawn: drawn, round: round, exhausted: false };
    }

    var done = Object.create(null);
    drawn.forEach(function (n) { done[n] = 1; });
    var left = pool.filter(function (n) { return !done[n]; });

    var newRound = round;
    if (left.length === 0) {          // 한 바퀴 완주 → 새 바퀴
      newRound = round + 1;
      drawn = [];
      left = pool;
    }
    var pick = left[Math.floor(rng() * left.length)];
    drawn.push(pick);
    return {
      name: pick,
      drawn: drawn,
      round: newRound,
      exhausted: false,
      leftAfter: left.length - 1
    };
  }

  /* ── 여러 명 뽑기 (한 번에 n명, 서로 다른 사람) ── */
  function drawMany(opts, n) {
    var count = Math.max(1, Math.floor(n || 1));
    var state = {
      names: opts.names, excluded: opts.excluded,
      drawn: (opts.drawn || []).slice(), round: opts.round || 1,
      rng: opts.rng || Math.random, repeatAllowed: false
    };
    var picked = [];
    var pool = activePool(state.names, state.excluded);
    var limit = Math.min(count, pool.length);
    for (var i = 0; i < limit; i++) {
      var r = drawOne(state);
      if (!r.name) break;
      picked.push(r.name);
      state.drawn = r.drawn;
      state.round = r.round;
    }
    return { picked: picked, drawn: state.drawn, round: state.round };
  }

  /* ── 모둠 짜기 ──
   * mode 'count' = 모둠을 value개로 / mode 'size' = 한 모둠 value명씩.
   * 인원은 최대한 고르게. 남는 사람은 앞 모둠부터 한 명씩 더 간다(빈 모둠 없음).
   * 반환: [ [이름...], [이름...] ... ]
   */
  function makeGroups(names, opts) {
    var pool = activePool(names, (opts && opts.excluded) || []);
    var rng = (opts && opts.rng) || Math.random;
    var mode = (opts && opts.mode) === 'size' ? 'size' : 'count';
    var value = Math.max(1, Math.floor((opts && opts.value) || 1));
    var total = pool.length;
    if (total === 0) return [];

    var groupCount;
    if (mode === 'count') {
      groupCount = Math.min(value, total);
    } else {
      groupCount = Math.ceil(total / value);
      if (groupCount < 1) groupCount = 1;
      // 혼자 남는 모둠 방지: 2명 이상을 요청했는데 한 명짜리 모둠이 생기면
      // 모둠 수를 하나 줄여 그 사람을 다른 모둠에 넣는다. (25명 2명씩 → 3,2,2…)
      if (value >= 2) {
        while (groupCount > 1 && Math.floor(total / groupCount) < 2) groupCount--;
      }
    }

    var order = shuffle(pool, rng);
    var base = Math.floor(total / groupCount);
    var extra = total - base * groupCount;      // 앞에서부터 한 명씩 더 받는 모둠 수

    var groups = [];
    var idx = 0;
    for (var g = 0; g < groupCount; g++) {
      var size = base + (g < extra ? 1 : 0);
      groups.push(order.slice(idx, idx + size));
      idx += size;
    }
    return groups;
  }

  /* ── 짝 짓기 = 모둠 2명씩의 별칭. 홀수면 마지막 한 모둠이 3명. ── */
  function makePairs(names, opts) {
    var o = opts || {};
    return makeGroups(names, { mode: 'size', value: 2, rng: o.rng, excluded: o.excluded });
  }

  /* ── 자기검산: 모둠 결과가 규약을 지켰는지 (게이트에서 호출) ── */
  function verifyGroups(groups, expectedNames) {
    var flat = [];
    groups.forEach(function (g) { g.forEach(function (n) { flat.push(n); }); });
    var sizes = groups.map(function (g) { return g.length; });
    var min = Math.min.apply(null, sizes.length ? sizes : [0]);
    var max = Math.max.apply(null, sizes.length ? sizes : [0]);
    var uniq = Object.create(null);
    var dup = false;
    flat.forEach(function (n) { if (uniq[n]) dup = true; uniq[n] = 1; });
    var missing = expectedNames.filter(function (n) { return !uniq[n]; });
    return {
      ok: !dup && missing.length === 0 && flat.length === expectedNames.length && (max - min) <= 1 && min >= 1,
      duplicated: dup,
      missing: missing,
      spread: max - min,
      emptyGroup: min < 1
    };
  }

  return {
    makeRng: makeRng,
    parseRoster: parseRoster,
    shuffle: shuffle,
    activePool: activePool,
    drawOne: drawOne,
    drawMany: drawMany,
    makeGroups: makeGroups,
    makePairs: makePairs,
    verifyGroups: verifyGroups
  };
});
