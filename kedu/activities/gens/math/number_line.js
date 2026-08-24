/* gens/math/number_line.js — 수의 순서·뛰어 세기 (1단원 9까지의 수 / 5단원 50까지의 수)
 * 순수 함수·DOM 무관 (§9-3). 게임(순서 탭)·활동지(빈칸) 공유.
 * params: { from, to, step: 1|2|5|10, count: 카드 수, desc: 0|1 }
 * next() → { seq:[정답 순서], cards:[섞인 카드], typeOf(v), prompt, type }
 * type(문항 단위): decade_cross(x9→x0 경계) · skip(뛰어 세기) · back(거꾸로 세기) · mid
 *   판정 우선순위 = 경계 > 뛰어 > 거꾸로 > 순서 (§21-3·§10-4)
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['number_line'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  return {
    id: 'number_line',
    title: '수의 순서 잇기',
    create: function (params, rng) {
      var p = params || {};
      var from = +p.from || 1, to = +p.to || 9;
      // 뛰어 세기 폭: 1~10. 2학년 곱셈이 3씩·4씩을 쓰므로 화이트리스트를 두지 않는다
      var step = (+p.step >= 1 && +p.step <= 10) ? Math.floor(+p.step) : 1;
      var count = +p.count || 6;
      var desc = +p.desc === 1;
      return {
        next: function () {
          var span = (count - 1) * step;
          var start = (to - span > from) ? ri(rng, from, to - span) : from;
          var seq = [];
          for (var i = 0; i < count; i++) seq.push(start + i * step);
          if (desc) seq.reverse();

          var cards = seq.slice();
          for (var j = cards.length - 1; j > 0; j--) {          // 섞기
            var k = Math.floor(rng() * (j + 1)), t = cards[j]; cards[j] = cards[k]; cards[k] = t;
          }
          // 카드 하나라도 십의 경계를 넘으면(예: 19→20) 그 문항은 decade_cross
          var cross = false;
          for (var m = 1; m < seq.length; m++) {
            if (Math.floor(Math.min(seq[m - 1], seq[m]) / 10) !== Math.floor(Math.max(seq[m - 1], seq[m]) / 10)) cross = true;
          }
          // 한 문항 = 한 키 (§13-2). 판정 우선순위: 경계 넘김 > 뛰어 세기 > 거꾸로 > 순서.
          // `back`은 g1u1 「9까지의 수」의 진단 축이다 — 1~9엔 십의 경계도 뛰어 세기도
          // 없어서, 이 키가 없으면 그 활동의 수첩이 한 칸이 되고 형성평가가 성립하지 않는다.
          var type = cross ? 'decade_cross'
                   : (step > 1 ? 'skip' : (desc ? 'back' : 'mid'));
          return {
            seq: seq, cards: cards, step: step, desc: desc, type: type,
            prompt: (desc ? '큰 수부터' : '작은 수부터') + (step > 1 ? ' ' + step + '씩 뛰어' : '') + ' 순서대로 짚어요',
            answer: seq.join(','),
            explain: seq.join(' → ') +
              (cross ? '  (십의 자리가 바뀌는 곳을 조심!)' : (step > 1 ? '  (' + step + '씩 커져요)' : ''))
          };
        },
        check: function (pick, q) { return +pick === q.seq[0]; }
      };
    },
    printRender: function (q) {
      // 활동지: 순서 중 일부를 빈칸으로
      var hide = [1, 3];
      return q.seq.map(function (v, i) {
        return (hide.indexOf(i) >= 0)
          ? '<span class="w-box"> </span>'
          : '<span class="w-num">' + v + '</span>';
      }).join('<span style="margin:0 4px;color:#cbb894">›</span>');
    },
    printAnswer: function (q) { return q.seq.join(' '); },
    printHead: '수의 순서에 맞게 □ 안에 알맞은 수를 쓰세요.'
  };
}));
