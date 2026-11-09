/* gens/math/g5_2_samok.js — 사각사각 사목 놀이 (5학년 2학기 수학 4단원 「소수의 곱셈」 9차시 함께하는 수학 · 『수학』 96~97쪽)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 *   + a·b(두 수 글자) · rows(이번 판에 보이는 놀이판 줄 번호 넷) · cells(보이는 24칸의 [a, b]) · marked(이 문제 앞에 표시된 칸)
 *   · cell(이 문제의 칸, 0~23) · line(노리는 네 칸) · done(이 문제로 네 칸이 나란히 → 「완성!」) · fresh(새 판의 첫 문제)
 * 교과서판(2026-11-10):
 *   『수학』 97쪽 놀이판 9줄 × 6칸(칸 = 소수의 곱셈 54) 그대로 — 이 판의 식만 낸다(지어낸 식 0).
 *   놀이 방법(96쪽) — 원하는 칸을 골라 문제를 풀고, 정답이면 내 색으로 표시 · 가로, 세로, 대각선 방향으로 4칸을 나란히 표시하면 「완성!」.
 *   화면이 좁아 놀이판을 4줄씩 보여 준다(9줄 가운데 이어진 4줄 — 처음 판은 교과서 판의 맨 위 4줄). 문제는 「색이 나란히 칠해지도록 칸을 고르는」
 *   핵심 질문(301쪽)대로 한 줄(가로·세로·대각선 4칸)을 노려 차례로 낸다 — 네 칸을 다 풀면 완성, 다음 판은 다른 4줄.
 * 보기의 다른 수 = 학습지 tb_g5_2_math_u4 오개념 모형(gen_tb.py wrongs_mul):
 *   X03 한 수의 소수점 아래 자릿수만 셈(0.28 × 5.6 → 15.68) · X02 곱의 소수점을 한 자리 덜·더 옮김(10배 크게·1/10배 작게)
 *   · X20 소수점 위치를 보지 않고 숫자만 같은 판의 다른 칸 곱(0.28 × 5.6 ↔ 2.8 × 5.6 = 15.68 — 숫자가 같으면 X02 와 같은 값).
 * type: p01(곱하는 수가 0.01 — 소수점이 왼쪽으로 두 자리) · dxd(소수×소수) · dxn(소수×자연수) · nxd(자연수×소수)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_samok'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  /* 『수학』 97쪽 놀이판 — 9줄 × 6칸 (교과서에 곱이 함께 적혀 있음 · 스모크가 따로 셈해 대조) */
  var BOARD = [
    [['1.7', '0.7'], ['1.06', '7'], ['16', '5.3'], ['17', '0.07'], ['40', '10.2'], ['0.28', '56']],
    [['11.5', '7'], ['6', '3.3'], ['1.9', '0.8'], ['1.5', '80'], ['12.2', '0.3'], ['7', '0.17']],
    [['2.8', '5.6'], ['0.28', '5.6'], ['36.5', '0.01'], ['1.5', '0.8'], ['0.15', '8'], ['4', '1.02']],
    [['0.5', '0.22'], ['0.33', '6'], ['28', '0.56'], ['0.4', '1.02'], ['3.5', '0.3'], ['10.2', '4']],
    [['2.6', '24'], ['5', '2.2'], ['0.7', '2.9'], ['1.35', '4'], ['88', '0.07'], ['3.65', '0.01']],
    [['2', '5.3'], ['1.1', '2.2'], ['0.09', '7.8'], ['0.36', '6'], ['2.53', '0.3'], ['1.73', '8']],
    [['9', '0.78'], ['0.29', '2.2'], ['3.6', '6'], ['0.04', '3.15'], ['30', '5.3'], ['0.9', '0.78']],
    [['0.14', '0.01'], ['25.3', '3'], ['7.8', '0.9'], ['12', '16.6'], ['0.88', '7'], ['120', '1.66']],
    [['3.5', '5'], ['0.4', '3.15'], ['13', '2.2'], ['26', '0.22'], ['0.31', '4'], ['8.8', '0.07']]
  ];
  var BOOK_ANS = [['1.19', '7.42', '84.8', '1.19', '408', '15.68'], ['80.5', '19.8', '1.52', '120', '3.66', '1.19'], ['15.68', '1.568', '0.365', '1.2', '1.2', '4.08'],
                  ['0.11', '1.98', '15.68', '0.408', '1.05', '40.8'], ['62.4', '11', '2.03', '5.4', '6.16', '0.0365'], ['10.6', '2.42', '0.702', '2.16', '0.759', '13.84'],
                  ['7.02', '0.638', '21.6', '0.126', '159', '0.702'], ['0.0014', '75.9', '7.02', '199.2', '6.16', '199.2'], ['17.5', '1.26', '28.6', '5.72', '1.24', '0.616']];
  /* 4줄 × 6칸 판에서 4칸이 나란한 줄 — 가로 12 · 세로 6 · 대각선 6 */
  var LINES = (function () {
    var L = [], r, c;
    for (r = 0; r < 4; r++) for (c = 0; c <= 2; c++) L.push([0, 1, 2, 3].map(function (k) { return r * 6 + c + k; }));
    for (c = 0; c < 6; c++) L.push([0, 1, 2, 3].map(function (k) { return k * 6 + c; }));
    for (c = 0; c <= 2; c++) L.push([0, 1, 2, 3].map(function (k) { return k * 6 + c + k; }));
    for (c = 3; c <= 5; c++) L.push([0, 1, 2, 3].map(function (k) { return k * 6 + c - k; }));
    return L;
  }());
  function linesOf(marked) { return LINES.filter(function (L) { return L.every(function (i) { return marked.indexOf(i) >= 0; }); }); }

  /* 소수 글자 ↔ 정수·자릿수 (부동소수 없이) */
  function dp(s) { var k = String(s).indexOf('.'); return k < 0 ? 0 : String(s).length - k - 1; }
  function digits(s) { return parseInt(String(s).replace('.', ''), 10); }
  function fmt(n, k) {                                           // 정수 n 을 소수점 아래 k 자리로 — 끝자리 0 생략
    var s = String(n); if (k <= 0) return s + new Array(1 - k).join('0');
    while (s.length <= k) s = '0' + s;
    s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k);
    return s.replace(/0+$/, '').replace(/\.$/, '');
  }
  function prod(a, b) { return fmt(digits(a) * digits(b), dp(a) + dp(b)); }
  function typeOf(a, b) {
    if (b === '0.01' || a === '0.01') return 'p01';
    if (dp(a) && dp(b)) return 'dxd';
    return dp(a) ? 'dxn' : 'nxd';
  }
  var KAN = ['', '한', '두', '세', '네'];
  function explainOf(a, b, r) {
    var N = digits(a) * digits(b), k = dp(a) + dp(b);
    var how = (dp(a) && dp(b)) ? '소수점 아래 자릿수 ' + dp(a) + ' + ' + dp(b) + ' = ' + k + '이라'
      : KO.j(dp(a) ? a : b, '은/는') + ' 소수 ' + KAN[k] + ' 자리 수라';
    return digits(a) + ' × ' + digits(b) + ' = ' + N + ' — ' + how + ' ' + N + '에서 소수점을 왼쪽으로 ' + KAN[k] + ' 자리 옮겨 ' + KO.ida(r) + '.';
  }
  function wrongsOf(rng, a, b, r) {
    var N = digits(a) * digits(b), k = dp(a) + dp(b), seen = {}, out = [];
    seen[r] = 1;
    function add(v, why) { if (!seen[v] && v !== '0') { seen[v] = 1; out.push({ v: v, why: why }); } }
    if (dp(a) && dp(b)) add(fmt(N, Math.max(dp(a), dp(b))), 'X03');     // 한 수의 자릿수만 — 지도서 오류 「소수점 찍기」
    var near = shuffle(rng, [fmt(N, k - 1), fmt(N, k + 1)]);              // 10배 크게 · 1/10배 작게
    near.forEach(function (v) { add(v, 'X02'); });
    return out.slice(0, 2);
  }

  return {
    id: 'g5_2_samok',
    title: '사각사각 사목 놀이',
    BOARD: BOARD, BOOK_ANS: BOOK_ANS, LINES: LINES, linesOf: linesOf, prod: prod, typeOf: typeOf,
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var top = null, marked = [], fresh = true, line = null, queue = [], lastTop = -1;
      function newBoard() {
        if (book && top === null) top = 0;                                   // 처음 판 = 교과서 판 맨 위 4줄
        else { var c = []; for (var t = 0; t <= 5; t++) if (t !== lastTop) c.push(t); top = pick(rng, c); }
        lastTop = top; marked = []; fresh = true;
        line = pick(rng, LINES); queue = shuffle(rng, line.slice());
      }
      function cellsOf() { var a = []; for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++) a.push(BOARD[top + r][c]); return a; }
      return {
        next: function () {
          if (top === null) newBoard();
          var cells = cellsOf(), cell = queue.shift(), a = cells[cell][0], b = cells[cell][1];
          var r = prod(a, b), before = marked.slice(), after = marked.concat([cell]);
          var done = linesOf(after).length > 0;
          var ws = wrongsOf(rng, a, b, r);
          var q = {
            a: a, b: b, rows: [top, top + 1, top + 2, top + 3], cells: cells.map(function (x) { return x.slice(); }), marked: before, cell: cell,
            line: line.slice(), done: done, fresh: fresh,
            prompt: a + ' × ' + b + ' = ?',
            options: shuffle(rng, [r].concat(ws.map(function (w) { return w.v; }))), answer: r, type: typeOf(a, b),
            traps: ws.map(function (w) { return w.why; }),
            explain: explainOf(a, b, r) + (done ? ' 네 칸이 나란히 — 완성!' : ' 놀이판에 표시해요.')
          };
          marked = after; fresh = false;
          if (done) newBoard();
          return q;
        },
        check: function (p, q) { return p === q.answer; }
      };
    },
    printRender: function (q) { return '<span class="w-num">' + q.a + ' × ' + q.b + '</span> = <span class="w-box">(　)</span>'; },
    printAnswer: function (q) { return q.answer; },
    printHead: '소수의 곱셈을 계산하세요. (사각사각 사목 놀이판의 칸)'
  };
}));
