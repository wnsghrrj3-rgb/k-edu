/* gens/math/bingo_calc.js — 덧셈 빙고·뺄셈 빙고 놀이 (1학년 2학기 수학 4단원 「덧셈과 뺄셈(2)」 3·4차시 · 7·8차시)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 *   + op(add·sub) · a·b(두 수) · board(빙고판 9칸) · marked(이 판 앞에 색칠된 칸) · cell(답이 있는 칸, 없으면 -1)
 *   · lines(색칠 뒤 완성된 줄) · bingo(두 줄 완성) · fresh(새 빙고판의 첫 판)
 * 교과서판(2026-11-09):
 *   『수학』 91쪽 「덧셈 빙고 놀이」(꾸러미 8·9) — 빙고판에 10부터 18까지 쓰고, 「하나, 둘, 셋」 하며 각자 고른 수 카드 두 장의
 *     합을 덧셈식으로 써서 빙고판에 있으면 색칠, 두 줄이면 「빙고!」. 지도서 245쪽 「합이 10보다 작으면 색칠할 수 없음」.
 *   『수학』 99쪽 「뺄셈 빙고 놀이」 — 빙고판에 2부터 10까지 쓰고, 선생님이 불러 주는 두 수(11, 7)의 차를 뺄셈식으로 써서 색칠.
 *   처음 빙고판 = 교과서 판(덧셈 11 17 12 / 16 13 15 / 14 18 10 · 뺄셈 9 2 8 / 4 3 6 / 10 7 5),
 *   처음 두 판 = 교과서 식(덧셈 7+8 · 9+8 · 7+6 · 4+9 · 8+8 · 5+7 / 뺄셈 11−7 · 12−9 · 14−7 · 12−6 · 18−9 · 15−5 가운데 둘).
 * 보기의 다른 수 = 지도서 오답 유형:
 *   덧셈 — 10을 만들고 남은 수를 하나 더/덜 셈, 10을 빠뜨리고 낱개만(7+8 → 5) (243~245쪽)
 *   뺄셈 — 13−8을 15로(작은 수에서 큰 수를 거꾸로 빼고 10은 그대로) · 14−9를 1로(10에서 빼고 낱개를 안 더함) (251·253쪽)
 * type: add_ten(합이 10) · add_nine(9와 더하기) · add_double(같은 두 수 더하기) · add_cross(그 밖의 10을 넘는 덧셈)
 *       · add_small(합이 10보다 작아 색칠 못 함) · sub_cross(받아내림 있는 (십몇)−(몇)) · sub_nine(9를 빼기) · sub_ten(낱개만 빼서 10)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['bingo_calc'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  var LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  var BOOK = {
    add: { board: [11, 17, 12, 16, 13, 15, 14, 18, 10], calls: [[7, 8], [9, 8], [7, 6], [4, 9], [8, 8], [5, 7]] },
    sub: { board: [9, 2, 8, 4, 3, 6, 10, 7, 5], calls: [[11, 7], [12, 9], [14, 7], [12, 6], [18, 9], [15, 5]] }
  };
  function linesOf(marked) { return LINES.filter(function (L) { return L.every(function (i) { return marked.indexOf(i) >= 0; }); }); }
  function typeOf(op, a, b) {
    if (op === 'add') {
      var s = a + b;
      if (s < 10) return 'add_small';
      if (s === 10) return 'add_ten';
      if (a === 9 || b === 9) return 'add_nine';
      if (a === b) return 'add_double';
      return 'add_cross';
    }
    if (a - b === 10) return 'sub_ten';
    if (b === 9) return 'sub_nine';
    return 'sub_cross';
  }
  /* 결과가 v 가 되는 두 수 — 덧셈은 수 카드 1~9 두 장, 뺄셈은 (십몇)−(몇) */
  function callFor(rng, op, v) {
    var c = [];
    if (op === 'add') { for (var a = 1; a <= 9; a++) { var b = v - a; if (b >= 1 && b <= 9) c.push([a, b]); } }
    else if (v === 10) { for (var u = 1; u <= 9; u++) c.push([10 + u, u]); }
    else { for (var s = 2; s <= 9; s++) { var m = v + s; if (m >= 11 && m <= 18 && s > m - 10) c.push([m, s]); } }   // 받아내림이 있게
    return pick(rng, c);
  }
  function explainOf(op, a, b, r, cell) {
    var t = typeOf(op, a, b), on = cell >= 0 ? ' 빙고판의 ' + KO.j(r, '을/를') + ' 색칠해요.' : '';
    if (op === 'add') {
      if (t === 'add_small') return a + '+' + b + '=' + r + ' — 합이 10보다 작아 빙고판에 없어요. 이번엔 색칠할 수 없어요.';
      if (t === 'add_ten') return a + '+' + b + '=10 — 10이 되는 더하기예요.' + on;
      var big = Math.max(a, b), small = Math.min(a, b), need = 10 - big;
      return KO.j(big, '와/과') + ' ' + KO.j(need, '을/를') + ' 더해 10, 남은 ' + KO.j(small - need, '을/를') + ' 더해 ' + KO.ida(r) + ' — ' + a + '+' + b + '=' + r + '.' + on;
    }
    if (t === 'sub_ten') return a + '−' + b + ' — 낱개 ' + b + '개를 빼면 10개씩 묶음 하나가 남아 10이에요.' + on;
    var ones = a - 10;
    return a + '−' + b + ' — 낱개 ' + ones + '개를 먼저 빼서 10, 10에서 ' + KO.j(b - ones, '을/를') + ' 더 빼면 ' + KO.ida(r) + '.' + on;
  }

  return {
    id: 'bingo_calc',
    title: '빙고 놀이',
    LINES: LINES, linesOf: linesOf,
    create: function (params, rng) {
      var op = params && params.op === 'sub' ? 'sub' : 'add';
      var book = !(params && +params.book === 0);
      var calls = shuffle(rng, BOOK[op].calls.slice()), qi = 0;
      var board = null, marked = [], fresh = true;
      function newBoard() {
        if (book && board === null) board = BOOK[op].board.slice();
        else { var v = []; for (var k = 0; k < 9; k++) v.push(op === 'add' ? 10 + k : 2 + k); board = shuffle(rng, v); }
        marked = []; fresh = true;
      }
      return {
        next: function () {
          if (board === null) newBoard();
          var a, b;
          if (book && qi < 2) { a = calls[qi][0]; b = calls[qi][1]; }
          else if (op === 'add' && rng() < 0.08) { a = ri(rng, 1, 5); b = ri(rng, 1, 9 - a); }       // 합이 10보다 작은 카드
          else {
            var open = []; for (var i = 0; i < 9; i++) if (marked.indexOf(i) < 0) open.push(i);
            var v = board[(open.length && rng() < 0.85) ? pick(rng, open) : ri(rng, 0, 8)];
            var ab = callFor(rng, op, v); a = ab[0]; b = ab[1];
          }
          qi++;
          var r = op === 'add' ? a + b : a - b, cell = board.indexOf(r), before = marked.slice();
          var after = (cell >= 0 && marked.indexOf(cell) < 0) ? marked.concat([cell]) : marked.slice();
          var lines = linesOf(after), bingo = lines.length >= 2 && linesOf(before).length < 2;
          var type = typeOf(op, a, b), P = [], S = [r + 1, r - 1];
          if (op === 'add' && r > 10) P.push(r - 10);                                          // 10을 빠뜨리고 낱개만 (7+8 → 5)
          if (op === 'sub' && type !== 'sub_ten') { var ones = a - 10; P.push(10 + (b - ones)); P.push(10 - b); }   // 13−8=15 · 14−9=1
          var seen = {}; seen[r] = 1;
          function okw(w) { if (w < 0 || w > 20 || seen[w]) return false; seen[w] = 1; return true; }
          var wrong = shuffle(rng, P).filter(okw).slice(0, 1);                                 // 지도서 덫 하나
          wrong = wrong.concat(shuffle(rng, S.concat(P)).filter(okw)).slice(0, 2);
          var q = {
            op: op, a: a, b: b, board: board.slice(), marked: before, cell: cell, lines: lines, bingo: bingo, fresh: fresh,
            prompt: a + (op === 'add' ? '+' : '−') + b + '=?',
            options: shuffle(rng, [String(r)].concat(wrong.map(String))), answer: String(r), type: type,
            explain: explainOf(op, a, b, r, cell) + (bingo ? ' 두 줄 완성 — 빙고!' : '')
          };
          marked = after; fresh = false;
          if (bingo) newBoard();                                                               // 빙고 → 새 빙고판
          return q;
        },
        check: function (p, q) { return p === q.answer; }
      };
    },
    printRender: function (q) { return '<span class="w-num">' + q.a + ' ' + (q.op === 'add' ? '+' : '−') + ' ' + q.b + '</span> = <span class="w-box">(　)</span>'; },
    printAnswer: function (q) { return q.answer; },
    printHead: '두 수의 합이나 차를 구하세요. (빙고판에 있으면 색칠!)'
  };
}));
