/* gens/math/compare50.js — 두 수 크기 비교 생성기 (§9-3 규약)
 * 순수 함수·DOM 무관. 같은 파일을 게임(iframe)과 활동지(worksheet.html)가 공유한다.
 *
 * params: { range: 20|50|100 }  ← 이 셋만 지원한다. 그 밖의 값은 20으로 낮춘다(50으로 올리지 않는다).
 *   ⚠️ range=9 같은 「9까지의 수」는 이 생성기가 감당하지 못한다 (§21-3·§21-4 #2).
 *      한 자리 수끼리는 same_tens(십의 자리가 같은 두 수)라는 유형 자체가 성립하지 않는다 —
 *      전용 생성기가 필요하다. 조용히 50으로 되돌려 15·19를 내던 것이 v3.28까지의 결함.
 * next() → { a, b, prompt, answer:'L'|'E'|'R', type, explain, whyAns }
 * type(형성평가 신호): same_tens · boundary · far · equal  (카탈로그 types와 일치해야 함)
 *
 * §6-9 근거의 정직: 근거 문장은 화면에 있는 자리만 가리킨다.
 *   - same_tens는 십의 자리 1 이상에서만 낸다 (t=0이면 한 자리 수 둘 → 십의 자리가 없다).
 *   - far에서 자리 수가 다르면 "한 자리 / 두 자리" 언어로 말한다 (0을 십의 자리라고 하지 않는다).
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['compare50'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  /* §6-10 4·5항 — 조사 판정은 core/ko.js 한 곳에서. 못 찾으면 소리 내어 실패한다. */
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  var DIGIT_KO = { 1: '한', 2: '두', 3: '세' };
  function digits(n) { return String(n).length; }

  /* §6-9-1 — far 근거. 자리 수가 다르면 자리 수로 말한다 (100의 십의 자리를 10이라 하지 않는다). */
  function farExplain(a, b) {
    var big = Math.max(a, b), small = Math.min(a, b);
    if (digits(big) !== digits(small)) {
      return '자리 수가 달라요: ' + small + ' → ' + (DIGIT_KO[digits(small)] || digits(small)) + ' 자리 수, ' +
             big + ' → ' + (DIGIT_KO[digits(big)] || digits(big)) + ' 자리 수. 자리 수가 많은 쪽이 더 커요!';
    }
    return '십의 자리를 비교해요: ' + Math.floor(a / 10) + (a > b ? ' > ' : ' < ') + Math.floor(b / 10) +
           ' — 십의 자리가 크면 더 큰 수!';
  }

  function make(range, rng) {
    var r = rng(), type, a, b;
    if (r < 0.34) type = 'same_tens';
    else if (r < 0.56) type = 'boundary';
    else if (r < 0.88) type = 'far';
    else type = 'equal';

    if (type === 'same_tens') {
      // §6-9-1 — t는 1부터. t=0은 한 자리 수 둘이라 "십의 자리가 같다"가 화면에 없는 말이 된다.
      var t = ri(rng, 1, Math.max(1, Math.floor((range - 1) / 10)));
      var maxOnes = (t * 10 + 9 <= range) ? 9 : range - t * 10;
      var o1 = ri(rng, 0, maxOnes), o2;
      do { o2 = ri(rng, 0, maxOnes); } while (o2 === o1);
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
      type === 'boundary' ? small + ' 다음 수가 ' + KO.ida(big) + '. ' + KO.j(big, '이/가') + ' 1 더 커요' :
      type === 'far' ? farExplain(a, b) :
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
      // 지원 범위 밖은 조용히 50으로 올리지 않는다 — 작은 범위 요청을 더 큰 수로 되갚는 것이
      // 가장 나쁜 실패다(1학년에게 50까지의 수가 나간다). 가장 가까운 아래 지원값으로 낮춘다.
      var req = +((params || {}).range);
      var range = [20, 50, 100].indexOf(req) >= 0 ? req
        : (!isFinite(req) || req <= 0) ? 50 : (req < 20 ? 20 : (req < 50 ? 20 : (req < 100 ? 50 : 100)));
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
