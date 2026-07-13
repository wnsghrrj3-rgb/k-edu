/* gens/math/count9.js — 9까지의 수 세기 (1학년 수학 1단원)
 * 순수 함수·DOM 무관 (§9-3). 게임·활동지 공유.
 * params: { max: 5|9, arrange: 'line'|'random'|'mix' }
 * next() → { total, items, layout, prompt, answer, options, type }
 * type: small(1~3) · mid(4~6) · large(7~9) — 세기 유창성의 세 구간
 *   large가 유독 약하면 "하나씩 짚어 세기"에 머물러 있다는 신호 (묶어 보기 미형성)
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['count9'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  var THINGS = ['🍎', '🐤', '🌰', '🐞', '🍓', '⭐', '🐟', '🌸'];

  return {
    id: 'count9',
    title: '9까지의 수 세기',
    create: function (params, rng) {
      var p = params || {};
      var max = [5, 9].indexOf(+p.max) >= 0 ? +p.max : 9;
      var arrange = p.arrange || 'mix';
      return {
        next: function () {
          var total = ri(rng, 1, max);
          var thing = THINGS[Math.floor(rng() * THINGS.length)];
          var layout = (arrange === 'mix') ? (rng() < 0.5 ? 'line' : 'random') : arrange;
          // 흩어 놓기(random) 좌표 — 세기 어려움의 진짜 원인은 배열이다
          var pts = [];
          for (var i = 0; i < total; i++) {
            pts.push({ x: 8 + Math.floor(rng() * 78), y: 10 + Math.floor(rng() * 70) });
          }
          var type = total <= 3 ? 'small' : (total <= 6 ? 'mid' : 'large');
          var opts = [String(total)];
          while (opts.length < 4) {
            var c = String(ri(rng, 1, Math.max(max, 5)));
            if (opts.indexOf(c) < 0) opts.push(c);
          }
          for (var j = opts.length - 1; j > 0; j--) {
            var k = Math.floor(rng() * (j + 1)), t = opts[j]; opts[j] = opts[k]; opts[k] = t;
          }
          return {
            total: total, thing: thing, layout: layout, points: pts,
            prompt: '모두 몇 개일까요?', answer: String(total), options: opts, type: type,
            explain: '하나, 둘, 셋… 모두 ' + total + '개예요' +
                     (total >= 7 ? '. 5개를 먼저 보고 나머지를 세면 빨라요!' : '')
          };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      var s = '';
      for (var i = 0; i < q.total; i++) s += q.thing;
      return '<span style="font-size:22px;letter-spacing:2px">' + s + '</span><span class="w-box"> </span><span>개</span>';
    },
    printAnswer: function (q) { return String(q.total); },
    printHead: '그림을 세어 □ 안에 알맞은 수를 쓰세요.'
  };
}));
