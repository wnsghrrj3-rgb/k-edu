/* gens/math/ten_triple.js — 세 수로 10 만들기 (1학년 수학 5단원 10 모으기·가르기, 「10 바구니」)
 * 순수 함수·DOM 무관 (§9-3). 게임·활동지 공유.
 *
 * 두 얼굴을 갖는다.
 *  ① next()            활동지용 한 문항 — a + b + □ = 10 (빈칸 자리는 셋 중 하나)
 *  ② drop(onScreen)    게임용 다음에 떨어뜨릴 수 하나.
 *     화면(아직 시간이 넉넉한 위쪽)에 합이 10이 되는 세 수가 없으면 떠 있는 두 수의 짝이 되는 수를 낸다.
 *     답은 늘 있지만, 세 수가 연달아 내려오지는 않는다(순서대로 누르면 풀리는 판 금지 — 2026-09-23 준호 지적).
 * type: make10 세 수로 10 만들기 (활동지) — 게임 무대는 조작 결과로 태깅한다(§21-3 사전)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['ten_triple'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  /* §6-10 4·5항 — 조사 판정은 core/ko.js 한 곳에서. 못 찾으면 소리 내어 실패한다. */
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  var POOL = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7, 8];   // 작은 수가 조금 더 자주 — 큰 수가 깔리면 조합이 막힌다

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  function triple(rng) {                       // 1 이상 세 수, 합 10
    var a = ri(rng, 1, 8), b = ri(rng, 1, 9 - a);
    return [a, b, 10 - a - b];
  }

  function hasTriple(a) {
    for (var i = 0; i < a.length; i++)
      for (var j = i + 1; j < a.length; j++)
        for (var k = j + 1; k < a.length; k++)
          if (a[i] + a[j] + a[k] === 10) return true;
    return false;
  }

  function drop(onScreen, rng) {
    var a = onScreen || [];
    if (!hasTriple(a) || rng() < 0.3) {
      var pairs = [];
      for (var i = 0; i < a.length; i++)
        for (var j = i + 1; j < a.length; j++)
          if (a[i] + a[j] <= 9) pairs.push(10 - a[i] - a[j]);
      if (pairs.length) return pairs[Math.floor(rng() * pairs.length)];
      if (a.length && !hasTriple(a)) {
        // 큰 수만 깔려 짝을 못 만드는 판(8·7·6…) — 가장 작은 수와 짝이 될 작은 수를 내려 다음 과일이 답을 세우게 한다
        var cap = 9 - Math.min.apply(null, a);
        var small = POOL.filter(function (v) { return v <= cap; });
        return small[Math.floor(rng() * small.length)];
      }
    }
    return POOL[Math.floor(rng() * POOL.length)];
  }

  return {
    id: 'ten_triple',
    title: '세 수로 10 만들기',
    hasTriple: hasTriple,
    create: function (params, rng) {
      return {
        next: function () {
          var t = triple(rng), hole = ri(rng, 0, 2);
          var shown = t.map(function (v, i) { return i === hole ? '□' : String(v); });
          var known = t.filter(function (v, i) { return i !== hole; });
          return {
            nums: t, hole: hole,
            prompt: shown.join(' + ') + ' = 10',
            answer: String(t[hole]),
            type: 'make10',
            explain: KO.j(known[0], '와/과') + ' ' + KO.j(known[1], '을/를') + ' 모으면 ' + (known[0] + known[1]) + '. 10이 되려면 ' + KO.j(t[hole], '이/가') + ' 더 있어야 해요.'
          };
        },
        drop: function (onScreen) { return drop(onScreen, rng); }
      };
    }
  };
}));
