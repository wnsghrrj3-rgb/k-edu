/* gens/math/compare50.js — 두 수 크기 비교 생성기 (§9-3 규약)
 * 순수 함수·DOM 무관. 같은 파일을 게임(iframe)과 활동지(worksheet.html)가 공유한다.
 *
 * params: { range: 20|50|100 }
 * next() → { a, b, prompt, answer:'L'|'E'|'R', type, explain, whyAns }
 * type(형성평가 신호): same_tens · boundary · far · equal  (카탈로그 types와 일치해야 함)
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['compare50'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  function make(range, rng) {
    var r = rng(), type, a, b;
    if (r < 0.34) type = 'same_tens';
    else if (r < 0.56) type = 'boundary';
    else if (r < 0.88) type = 'far';
    else type = 'equal';

    if (type === 'same_tens') {
      var t = ri(rng, 0, Math.floor((range - 1) / 10));
      var maxOnes = (t * 10 + 9 <= range) ? 9 : range - t * 10;
      var o1 = ri(rng, t === 0 ? 1 : 0, maxOnes), o2;
      do { o2 = ri(rng, t === 0 ? 1 : 0, maxOnes); } while (o2 === o1);
      a = t * 10 + o1; b = t * 10 + o2;
    } else if (type === 'boundary') {
      var d = ri(rng, 1, Math.floor(range / 10)) * 10;   // 10, 20, … range
      a = d - 1; b = d;
      if (rng() < 0.5) { var tmp = a; a = b; b = tmp; }
    } else if (type === 'far') {
      do { a = ri(rng, 1, range); b = ri(rng, 1, range); }
      while (Math.floor(a / 10) === Math.floor(b / 10) || Math.abs(a - b) === 1);
    } else { a = ri(rng, 1, range); b = a; }

    var ans = (a === b) ? 'E' : (a > b ? 'L' : 'R');
    var big = Math.max(a, b), small = Math.min(a, b);
    var explain =
      type === 'same_tens' ? '십의 자리가 같으니 낱개끼리 비교해요: ' + (a % 10) + (a > b ? ' > ' : ' < ') + (b % 10) :
      type === 'boundary' ? small + ' 다음 수가 ' + big + '이에요. ' + big + '이(가) 1 더 커요' :
      type === 'far' ? '십의 자리를 비교해요: ' + Math.floor(a / 10) + (a > b ? ' > ' : ' < ') + Math.floor(b / 10) + ' — 십의 자리가 크면 더 큰 수!' :
      '두 수가 똑같아요!';
    var whyAns = (type === 'same_tens') ? 'ones' : (type === 'equal' ? 'equal' : 'tens');

    return {
      a: a, b: b, prompt: a + ' ◯ ' + b, answer: ans,
      type: type, explain: explain, whyAns: whyAns
    };
  }

  return {
    id: 'compare50',
    title: '두 수의 크기 비교',
    create: function (params, rng) {
      var range = [20, 50, 100].indexOf(+((params || {}).range)) >= 0 ? +params.range : 50;
      return {
        next: function () { return make(range, rng); },
        check: function (pick, p) { return pick === p.answer; }
      };
    },
    // 활동지 인쇄 렌더 (§11-2)
    printRender: function (p) {
      return '<span class="w-num">' + p.a + '</span><span class="w-box">◯</span><span class="w-num">' + p.b + '</span>';
    },
    printAnswer: function (p) { return p.answer === 'E' ? '=' : (p.answer === 'L' ? '>' : '<'); },
    printHead: '두 수를 비교해 ◯ 안에 >, =, < 를 쓰세요.'
  };
}));
