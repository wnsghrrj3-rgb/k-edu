/* gens/math/compare9999.js — 네 자리 수 크기 비교 (2학년 2학기 수학 1단원 「네 자리 수」 7·8차시)
 * compare999 와 **똑같은 계약**(a/b + answer L/E/R + type + explain) — 저울 무대를 그대로 쓴다.
 * 교과서판(2026-11-09): 『수학』 26~27쪽 「수의 크기를 비교하는 놀이」(수 카드 4장으로 네 자리 수를 만들어 짝과 견주기)를
 *   저울 위 「나 ↔ 짝」 대결로 옮겼다. 처음 판은 교과서·확인해요의 수 그대로(1422·2180 / 5107·5400 / 6714·5400 / 6419·6518 /
 *   4518·4618 / 1982·1999 / 1999·2005 / 1422·2046) — 그다음부터 수 카드 1~9 두 묶음에서 뽑은 것처럼 만든다.
 * type: th_diff(천의 자리가 다름) · h_diff(천 같고 백이 다름) · t_diff(천·백 같고 십이 다름) · o_diff(일만 다름)
 *       · tail_trap(뒤쪽 숫자가 큰 쪽이 작은 수 — 1999 vs 2005) · equal(같은 수 — 「수의 크기가 같습니다」, 한 번 더)
 * 범위: 수 카드 1~9 로 만드는 수라 놀이 판에는 0 이 없다(교과서 놀이 규칙). 교과서 판(textbook)만 0 이 낀다.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['compare9999'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function d4(n) { return [Math.floor(n / 1000), Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10]; }
  function nm(d) { return d[0] * 1000 + d[1] * 100 + d[2] * 10 + d[3]; }
  function card(rng) { return ri(rng, 1, 9); }
  var PL = ['천', '백', '십', '일'];
  /* 교과서 판 — 『수학』 26~27 · 『수학익힘』 17 · 확인해요 6번 · 이야기책(30~31) · 지도서 144 토의 */
  var BOOK = [[1422, 2180], [5400, 5107], [6714, 5400], [6419, 6518], [4518, 4618], [1982, 1999], [1999, 2005], [1422, 2046]];
  function typeOf(a, b) {
    if (a === b) return 'equal';
    var x = d4(a), y = d4(b), i = 0; while (x[i] === y[i]) i++;
    var big = a > b ? x : y, small = a > b ? y : x;
    if (i === 0 && small.slice(1).join('') > big.slice(1).join('')) return 'tail_trap';
    return ['th_diff', 'h_diff', 't_diff', 'o_diff'][i];
  }
  function explainOf(a, b, type) {
    if (type === 'equal') return '두 수가 똑같아요 — 「수의 크기가 같습니다」 하고 한 번 더 해요!';
    var x = d4(a), y = d4(b), i = 0; while (x[i] === y[i]) i++;
    var big = Math.max(a, b), small = Math.min(a, b), bd = d4(big)[i], sd = d4(small)[i];
    var same = i === 0 ? '' : (i === 1 ? '천의 자리가 같으니 ' : i === 2 ? '천·백의 자리가 같으니 ' : '천·백·십의 자리가 같으니 ');
    var s = same + PL[i] + '의 자리를 봐요: ' + bd + ' > ' + sd + ' — ' + KO.j(big, '이/가') + ' 더 커요.';
    if (type === 'tail_trap') s += ' 뒤쪽 숫자가 커도 천의 자리가 작으면 작은 수예요!';
    return s;
  }
  return {
    id: 'compare9999',
    title: '네 자리 수 비교',
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var qi = 0, order = BOOK.slice();
      for (var k = order.length - 1; k > 0; k--) { var j = Math.floor(rng() * (k + 1)); var t = order[k]; order[k] = order[j]; order[j] = t; }
      return {
        next: function () {
          var a, b, type, r;
          if (book && qi < 2) { a = order[qi][0]; b = order[qi][1]; if (rng() < 0.5) { var s = a; a = b; b = s; } type = typeOf(a, b); qi++; }
          else {
            qi++; r = rng();
            var x = [card(rng), card(rng), card(rng), card(rng)], y;
            if (r < 0.2) { y = x.slice(); do { y[0] = card(rng); } while (y[0] === x[0]); for (var m = 1; m < 4; m++) y[m] = card(rng); }
            else if (r < 0.38) { y = x.slice(); var lo = Math.min(x[0], 8); y[0] = lo + 1; x[0] = lo; y[1] = ri(rng, 1, 3); y[2] = ri(rng, 1, 4); y[3] = ri(rng, 1, 4); x[1] = ri(rng, 6, 9); x[2] = ri(rng, 6, 9); x[3] = ri(rng, 5, 9); }
            else if (r < 0.6) { y = x.slice(); do { y[1] = card(rng); } while (y[1] === x[1]); y[2] = card(rng); y[3] = card(rng); }
            else if (r < 0.78) { y = x.slice(); do { y[2] = card(rng); } while (y[2] === x[2]); y[3] = card(rng); }
            else if (r < 0.93) { y = x.slice(); do { y[3] = card(rng); } while (y[3] === x[3]); }
            else { y = x.slice(); }
            a = nm(x); b = nm(y); if (rng() < 0.5) { var s2 = a; a = b; b = s2; }
            type = typeOf(a, b);
          }
          var ans = a === b ? 'E' : (a > b ? 'L' : 'R');
          return { a: a, b: b, prompt: a + ' ◯ ' + b, answer: ans, type: type, explain: explainOf(a, b, type) };
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
