/* gens/math/flip_ten.js — 수 카드 뒤집기 놀이 (1학년 2학기 수학 2단원 「덧셈과 뺄셈(1)」 7·8차시 「10을 만들어 더해 볼까요」)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 *   + cards(뒤집은 수 카드 셋) · pair(더하여 10이 되는 두 카드의 자리, 없으면 null) · sum · expr(덧셈식) · ring(10을 만든 두 수)
 * 교과서판(2026-11-09): 『수학』 55쪽 「수 카드 뒤집기 놀이」(꾸러미 5) — 수 카드 3장을 뒤집어 두 수를 더하여 10이 되면
 *   카드를 모두 가져가 덧셈식을 만들고(9 1 7 → 9+1+7=17), 10이 되지 않으면 다시 뒤집어 놓는다(2 3 5).
 *   처음 두 판은 교과서 카드(55쪽 표 9·1·7 / 4·8·2 / 7·3·5 / 3·6·4 · 54쪽 3·7·4 / 4·3·7 / 4·6·3 / 3·4·6 / 9·1·5 / 5·9·1 · 그림 2·3·5).
 * 보기 = 세 수의 합 · 덫 하나 · 「다시 뒤집기」 — 덫은 지도서 오답 유형(194쪽): 10을 만든 뒤 남은 수를 하나 더/덜 셈,
 *   10을 만든 두 수만 더하고 끝냄(합 10). 10을 만들 수 없는 판은 세 수의 합(2+3+5=10처럼 셋이 10이어도)이 덫.
 * type: front(앞의 두 수로 10) · back(뒤의 두 수로 10 — 지도서 194 「뒤에 있는 두 수로 10을 만들어 더하는 덧셈식」)
 *       · apart(떨어진 두 수로 10 — 순서를 바꾸어 덧셈식) · none(10을 만들 수 없어 다시 뒤집기)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['flip_ten'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  var NONE = 'none';
  /* 교과서 판 — 『수학』 54~55쪽 */
  var BOOK = [[9, 1, 7], [4, 8, 2], [7, 3, 5], [3, 6, 4], [3, 7, 4], [4, 3, 7], [4, 6, 3], [3, 4, 6], [9, 1, 5], [5, 9, 1], [2, 3, 5]];

  /* 더하여 10이 되는 두 카드 자리 — 여럿이면 앞쪽부터 */
  function pairs(c) {
    var out = [];
    [[0, 1], [1, 2], [0, 2]].forEach(function (p) { if (c[p[0]] + c[p[1]] === 10) out.push(p); });
    return out;
  }
  function typeOf(c) {
    var ps = pairs(c);
    if (!ps.length) return NONE;
    var p = ps[0];
    return p[0] === 0 && p[1] === 1 ? 'front' : (p[0] === 1 ? 'back' : 'apart');
  }

  function build(rng, c) {
    var type = typeOf(c), sum = c[0] + c[1] + c[2], ps = pairs(c), p = ps[0] || null, expr, ring, ex, wrong;
    if (type === NONE) {
      expr = ''; ring = null;
      ex = c.join(', ') + ' — 어느 두 수를 더해도 10이 되지 않아요' + (sum === 10 ? '(세 수를 모두 더하면 10이지만 두 수로는 안 돼요)' : '') + '. 카드를 다시 뒤집어 놓아요.';
      wrong = [String(sum), String(sum + (rng() < 0.5 ? 1 : -1))];
    } else {
      var rest = c[3 - p[0] - p[1]];
      ring = [c[p[0]], c[p[1]]];
      if (type === 'apart') expr = c[p[0]] + '+' + c[p[1]] + '+' + rest + '=' + sum;          // 순서를 바꾸어 10부터
      else expr = c[0] + '+' + c[1] + '+' + c[2] + '=' + sum;
      ex = KO.j(ring[0], '와/과') + ' ' + KO.j(ring[1], '을/를') + ' 더하면 10, 10과 ' + KO.j(rest, '을/를') + ' 더하면 ' + sum + ' — ' + expr;
      var traps = [sum + 1, sum - 1];
      if (rng() < 0.35) traps.push(10);                                                         // 10만 말하고 끝냄
      wrong = [String(pick(rng, traps))];
    }
    var answer = type === NONE ? NONE : String(sum);
    var seen = {}; seen[answer] = 1;
    var opts = [answer];
    wrong.forEach(function (w) { if (!seen[w] && opts.length < (type === NONE ? 3 : 2)) { seen[w] = 1; opts.push(w); } });
    if (type !== NONE) opts.push(NONE);
    return {
      cards: c.slice(), pair: p, sum: sum, expr: expr, ring: ring,
      prompt: c.join(' · ') + ' — 10을 만들 수 있으면 세 수의 합, 없으면 다시 뒤집기',
      options: shuffle(rng, opts), answer: answer, type: type, explain: ex
    };
  }

  function makeRandom(rng, type) {
    var a, b, c, tries = 0;
    for (;;) {
      tries++;
      if (type === NONE) c = [ri(rng, 1, 9), ri(rng, 1, 9), ri(rng, 1, 9)];
      else {
        a = ri(rng, 1, 9); b = 10 - a; var r = ri(rng, 1, 9);
        c = type === 'front' ? [a, b, r] : type === 'back' ? [r, a, b] : [a, r, b];
      }
      if (typeOf(c) === type && pairs(c).length <= 1) return c;
      if (tries > 200) return type === NONE ? [2, 3, 5] : [9, 1, 7];
    }
  }

  return {
    id: 'flip_ten',
    title: '수 카드 뒤집기',
    NONE: NONE, pairs: pairs,
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var order = shuffle(rng, BOOK.slice()), qi = 0, bag = [];
      return {
        next: function () {
          var c;
          if (book && qi < 2) c = order[qi].slice();
          else {
            if (!bag.length) bag = shuffle(rng, ['front', 'back', 'apart', NONE]);
            c = makeRandom(rng, bag.pop());
          }
          qi++;
          return build(rng, c);
        },
        check: function (p, q) { return p === q.answer; }
      };
    },
    printRender: function (q) {
      return q.cards.map(function (n) { return '<span class="w-num">' + n + '</span>'; }).join(' ') + ' → <span class="w-box">(　)+(　)+(　)=(　)</span>';
    },
    printAnswer: function (q) { return q.answer === NONE ? '10을 만들 수 없어요' : q.expr; },
    printHead: '세 수 가운데 더하여 10이 되는 두 수를 먼저 더하는 덧셈식을 쓰세요. 10을 만들 수 없으면 ✕.'
  };
}));
