/* gens/math/split_gather.js — 가르기·모으기 (1학년 수학 3단원, 수116-119)
 * 순수 함수·DOM 무관 (§9-3). 게임·활동지 공유.
 * params: { max: 9, qmode: 'gather'|'split'|'mix' }
 *   gather: a와 b를 모으면?      (a+b ≤ max)
 *   split : max를 a와 □로 가르기
 * type: gather_small(합≤5) · gather_large(합 6~9) · split_small(가른 수 ≤2) · split_large
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['split_gather'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  function gather(max, rng) {
    var sum = ri(rng, 2, max);
    var a = ri(rng, 1, sum - 1), b = sum - a;
    return {
      a: a, b: b, sum: sum, kind: 'gather',
      prompt: a + ' 과 ' + b + ' 을 모으면?', answer: String(sum),
      type: sum <= 5 ? 'gather_small' : 'gather_large',
      explain: a + '개에 ' + b + '개를 더 놓으면 모두 ' + sum + '개! ' + a + '와 ' + b + '를 모으면 ' + sum + '이에요'
    };
  }
  function split(max, rng) {
    var whole = ri(rng, 3, max);
    var a = ri(rng, 1, whole - 1), b = whole - a;
    return {
      a: a, b: b, sum: whole, kind: 'split',
      prompt: whole + ' 은 ' + a + ' 과 □', answer: String(b),
      type: b <= 2 ? 'split_small' : 'split_large',
      explain: whole + '개에서 ' + a + '개를 덜어내면 ' + b + '개가 남아요. ' + whole + '은 ' + a + '와 ' + b + '로 갈라져요'
    };
  }

  return {
    id: 'split_gather',
    title: '가르기와 모으기',
    create: function (params, rng) {
      var p = params || {};
      var max = [5, 9, 10].indexOf(+p.max) >= 0 ? +p.max : 9;
      var m = p.qmode || 'mix';
      return {
        next: function () {
          var kind = (m === 'mix') ? (rng() < 0.5 ? 'gather' : 'split') : m;
          var q = (kind === 'gather') ? gather(max, rng) : split(max, rng);
          var opts = [q.answer];
          while (opts.length < 4) {
            var c = String(ri(rng, 1, max));
            if (opts.indexOf(c) < 0) opts.push(c);
          }
          for (var i = opts.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1)), t = opts[i]; opts[i] = opts[j]; opts[j] = t;
          }
          q.options = opts;
          return q;
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num">' + q.prompt.replace('□', '<span class="w-box"> </span>')
        .replace('을 모으면?', '= <span class="w-box"> </span>') + '</span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '가르기와 모으기를 해 □ 안에 알맞은 수를 쓰세요.'
  };
}));
