/* gens/math/compare999.js — 세 자리 수 크기 비교 (2학년 수학 1단원)
 * compare50과 **똑같은 계약**(L/E/R + type + explain) — 저울 무대를 그대로 재사용한다.
 * §10-2 확장 검증 2회차: 생성기만 갈아끼우면 저울이 세 자리 수를 비교한다.
 * type: hundreds_diff(백의 자리가 다름) · tens_diff(백 같고 십이 다름) · ones_diff(백·십 같음)
 *       · zero_trap(0이 낀 수) · equal
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['compare999'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  return {
    id: 'compare999',
    title: '세 자리 수 비교',
    create: function (params, rng) {
      /* §6-9-4 — 옵션은 [500, 999] 둘뿐. 옵션 밖 값은 **아래로** 낮춘다(위로 올리지 않는다).
       * v3.29까지 `=== 500 ? 500 : 999`가 range:9 요청에 996을 냈다 (상향 코어션). */
      var rawRange = +((params || {}).range);
      var range = (rawRange >= 999 || isNaN(rawRange)) ? 999 : 500;
      /* §6-9-6 — 사후 클램프 금지: 백의 자리 상한을 생성 전에 계산해 처음부터 범위 안에서 낸다.
       * hMax*100+99 <= range 를 보장 → 십·일의 자리가 자유로워도 range를 넘지 않는다. */
      var hMax = Math.max(1, Math.floor((range - 99) / 100));
      return {
        next: function () {
          var r = rng(), a, b, type;
          if (r < 0.3) {                                  // 백의 자리가 다르다 — 한눈에 안다
            do { a = ri(rng, 100, range); b = ri(rng, 100, range); }
            while (Math.floor(a / 100) === Math.floor(b / 100));
            type = 'hundreds_diff';
          } else if (r < 0.55) {                          // 백은 같고 십이 다르다
            var h = ri(rng, 1, hMax);
            var t1 = ri(rng, 0, 9), t2;
            do { t2 = ri(rng, 0, 9); } while (t2 === t1);
            a = h * 100 + t1 * 10 + ri(rng, 0, 9);
            b = h * 100 + t2 * 10 + ri(rng, 0, 9);
            type = 'tens_diff';
          } else if (r < 0.75) {                          // 백·십이 같고 일만 다르다
            var h2 = ri(rng, 1, hMax), t = ri(rng, 0, 9);
            var o1 = ri(rng, 0, 9), o2;
            do { o2 = ri(rng, 0, 9); } while (o2 === o1);
            a = h2 * 100 + t * 10 + o1;
            b = h2 * 100 + t * 10 + o2;
            type = 'ones_diff';
          } else if (r < 0.92) {                          // 0이 낀 수 — 305 vs 350 같은 함정
            var h3 = ri(rng, 1, hMax);
            a = h3 * 100 + ri(rng, 1, 9);                 // h0o
            b = h3 * 100 + ri(rng, 1, 9) * 10;            // ht0
            type = 'zero_trap';
          } else {
            a = ri(rng, 100, range); b = a; type = 'equal';
          }
          var ans = (a === b) ? 'E' : (a > b ? 'L' : 'R');
          var big = Math.max(a, b), small = Math.min(a, b);
          var explain;
          if (type === 'equal') explain = '두 수가 똑같아요!';
          else if (type === 'hundreds_diff') explain = '백의 자리부터 비교해요: ' + Math.floor(big / 100) + ' > ' + Math.floor(small / 100) + ' — 백의 자리가 크면 더 큰 수!';
          else if (type === 'tens_diff') explain = '백의 자리가 같으니 십의 자리를 봐요: ' + Math.floor(big / 10) % 10 + ' > ' + Math.floor(small / 10) % 10;
          else if (type === 'ones_diff') explain = '백·십이 같으니 일의 자리를 봐요: ' + (big % 10) + ' > ' + (small % 10);
          else explain = big + '이(가) 더 커요. 0이 있는 자리를 빠뜨리지 말고 자리마다 비교해요!';

          return { a: a, b: b, prompt: a + ' ◯ ' + b, answer: ans, type: type, explain: explain };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num">' + q.a + '</span><span class="w-box">◯</span><span class="w-num">' + q.b + '</span>';
    },
    printAnswer: function (q) { return q.answer === 'E' ? '=' : (q.answer === 'L' ? '>' : '<'); },
    printHead: '두 수를 비교해 ◯ 안에 >, =, < 를 쓰세요.'
  };
}));
