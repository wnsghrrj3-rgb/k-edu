/* gens/math/compare_size.js — 길이·넓이·담을 수 있는 양 비교 (1학년 수학 4단원)
 * 순수 함수·DOM 무관 (§9-3).
 * params: { aspect: 'length'|'area'|'volume'|'mix' }
 * next() → { aspect, L:{size,color,label}, R:{...}, answer:'L'|'E'|'R', type, prompt, explain }
 * type: length_far(길이 차 큼) · length_close(비슷) · area · volume
 *   close가 유독 약하면 "끝을 맞춰 대어 보기"(직접 비교 전략)가 안 잡힌 것.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['compare_size'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  var ASK = {
    length: { q: '어느 것이 더 길까요?', word: '길어요', unit: '연필' },
    area: { q: '어느 것이 더 넓을까요?', word: '넓어요', unit: '색종이' },
    volume: { q: '어느 컵에 더 많이 담길까요?', word: '많이 담겨요', unit: '컵' }
  };

  return {
    id: 'compare_size',
    title: '길이·넓이·들이 비교',
    create: function (params, rng) {
      var a = ((params || {}).aspect) || 'mix';
      return {
        next: function () {
          var aspect = (a === 'mix') ? ['length', 'area', 'volume'][ri(rng, 0, 2)] : a;
          var close = rng() < 0.4;
          var s1 = ri(rng, 30, 95);
          var s2;
          if (close) {                       // 눈으로 대충 봐선 모른다 — 대어 봐야 안다
            do { s2 = s1 + ri(rng, -12, 12); } while (s2 < 25 || s2 > 98 || s2 === s1);
          } else {
            do { s2 = ri(rng, 30, 95); } while (Math.abs(s2 - s1) < 25);
          }
          var ans = (s1 === s2) ? 'E' : (s1 > s2 ? 'L' : 'R');
          var type = (aspect === 'length') ? (close ? 'length_close' : 'length_far') : aspect;
          var big = (s1 > s2) ? '왼쪽' : '오른쪽';
          return {
            aspect: aspect,
            L: { size: s1 }, R: { size: s2 },
            prompt: ASK[aspect].q, answer: ans, type: type,
            explain: big + ' 것이 더 ' + ASK[aspect].word +
              (close ? '. 비슷해 보일 땐 끝을 맞추어 대어 봐요!' : '')
          };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      var bar = function (s) {
        return '<span style="display:inline-block;height:12px;width:' + Math.round(s * 0.6) +
               'px;background:#f59e0b;border-radius:6px;vertical-align:middle"></span>';
      };
      return bar(q.L.size) + '<span class="w-box">◯</span>' + bar(q.R.size);
    },
    printAnswer: function (q) { return q.answer === 'E' ? '=' : (q.answer === 'L' ? '>' : '<'); },
    printHead: '더 긴 것에 ○표 하세요. (◯ 안에 >, =, < 를 써도 좋아요)'
  };
}));
