/* gens/math/gugu_clue.js — 곱셈표 수 찾기 놀이 (2학년 2학기 수학 2단원 「곱셈구구」 9·11차시)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 * 교과서판(2026-11-09): 『수학』 55쪽 「곱셈표에서 수 찾기 놀이」 — 친구들이 곱셈구구로 수를 설명하면(「2단 곱셈구구에 있는 수야」
 *   「4단 곱셈구구에도 있어」 「3 × 5보다 커」) 곱셈표에서 그 수를 찾는다. 『수학익힘』 35쪽(5단·십의 자리 40·홀수 → 45)과
 *   확인해요 3번(7단·짝수·9 × 3보다 크고 6 × 6보다 작음 → 28)도 같은 꼴이다. 처음 두 판은 이 교과서 수(16 · 45 · 28 가운데 둘).
 * 단서는 언제나 셋 — 셋을 모두 지키는 수가 곱셈표(1~9 × 1~9)에 **하나뿐**이 되도록 만들고,
 *   보기의 다른 수는 **단서 둘만 지키는 덫**(어느 단서 하나를 어긴 수)으로 고른다 — 지도서 203쪽 오답 유형(조건 하나를 빠뜨림).
 * type: two_dan(두 단에 모두 있는 수 + 크기) · parity(단 + 짝수·홀수 + 크기) · tens(단 + 십의 자리 숫자 + 짝·홀) · size(단 + 크다 + 작다)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['gugu_clue'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  /* 곱셈표 1~9 × 1~9 에 나오는 수 */
  var S = (function () { var o = {}, out = []; for (var a = 1; a <= 9; a++) for (var b = 1; b <= 9; b++) o[a * b] = 1; for (var k in o) out.push(+k); return out.sort(function (x, y) { return x - y; }); })();
  function cells(n) { var c = []; for (var a = 1; a <= 9; a++) if (n % a === 0 && n / a <= 9) c.push([a, n / a]); return c; }
  function pairsOf(v) { return cells(v).filter(function (p) { return p[0] >= 2 && p[1] >= 2; }); }
  var P2 = S.filter(function (v) { return pairsOf(v).length; });       // 「몇 × 몇」으로 말할 수 있는 수(2~9단끼리)

  /* 단서 — 말(친구가 하는 말) + 판정 */
  function DAN(k, also) { return { t: 'dan', k: k, text: k + '단 곱셈구구에' + (also ? '도 있어.' : ' 있는 수야.'), test: function (x) { return x % k === 0 && x / k >= 1 && x / k <= 9; } }; }
  function GT(p) { return { t: 'gt', p: p, text: p[0] + ' × ' + p[1] + '보다 커.', test: function (x) { return x > p[0] * p[1]; } }; }
  function LT(p) { return { t: 'lt', p: p, text: p[0] + ' × ' + p[1] + '보다 작아.', test: function (x) { return x < p[0] * p[1]; } }; }
  function RANGE(p, q) { return { t: 'range', p: p, q: q, text: p[0] + ' × ' + p[1] + '보다 크고 ' + q[0] + ' × ' + q[1] + '보다 작아.', test: function (x) { return x > p[0] * p[1] && x < q[0] * q[1]; } }; }
  function PAR(even) { return { t: 'par', even: even, text: even ? '짝수야.' : '홀수야.', test: function (x) { return (x % 2 === 0) === even; } }; }
  function TENS(d) { return { t: 'tens', d: d, text: '십의 자리 숫자는 ' + KO.j(d * 10, '을/를') + ' 나타내.', test: function (x) { return x >= 10 && Math.floor(x / 10) === d; } }; }

  /* 교과서 판 — 『수학』 55쪽 · 『수학익힘』 35쪽 · 확인해요 3번 */
  var BOOK = [
    { n: 16, type: 'two_dan', clues: function () { return [DAN(2), DAN(4, true), GT([3, 5])]; } },
    { n: 45, type: 'tens', clues: function () { return [DAN(5), TENS(4), PAR(false)]; } },
    { n: 28, type: 'parity', clues: function () { return [DAN(7), PAR(true), RANGE([9, 3], [6, 6])]; } }
  ];

  function allOk(cs, x) { for (var i = 0; i < cs.length; i++) if (!cs[i].test(x)) return false; return true; }
  function solve(cs) { return S.filter(function (x) { return allOk(cs, x); }); }
  function trapsOf(cs, n, rng) {          // 단서 하나만 어기고 나머지 둘은 지키는 수 — 어긴 단서마다 하나씩
    var out = [];
    for (var i = 0; i < cs.length; i++) {
      var pool = S.filter(function (x) { return x !== n && !cs[i].test(x) && cs.every(function (c, j) { return j === i || c.test(x); }); });
      if (pool.length) out.push({ x: pick(rng, pool), broke: i });
    }
    return out;
  }
  function prodBelow(rng, n, span) { var c = P2.filter(function (v) { return v < n && v >= n - span; }); return c.length ? pick(rng, pairsOf(pick(rng, c))) : null; }
  function prodAbove(rng, n, span) { var c = P2.filter(function (v) { return v > n && v <= n + span; }); return c.length ? pick(rng, pairsOf(pick(rng, c))) : null; }

  function makeRandom(rng) {
    for (var tries = 0; tries < 400; tries++) {
      var type = pick(rng, ['two_dan', 'parity', 'tens', 'size']);
      var k = ri(rng, 2, 9), m = ri(rng, 2, 9), n = k * m, cs = null;
      if (type === 'two_dan') {
        var ks = []; for (var k2 = 2; k2 <= 9; k2++) if (k2 !== k && n % k2 === 0 && n / k2 <= 9) ks.push(k2);
        if (!ks.length) continue;
        var size = rng() < 0.5 ? (function () { var p = prodBelow(rng, n, 12); return p && GT(p); })() : (function () { var p = prodAbove(rng, n, 12); return p && LT(p); })();
        if (!size) continue;
        cs = [DAN(k), DAN(pick(rng, ks), true), size];
      } else if (type === 'parity') {
        var lo = prodBelow(rng, n, 10), hi = prodAbove(rng, n, 10);
        if (!lo || !hi) continue;
        cs = [DAN(k), PAR(n % 2 === 0), RANGE(lo, hi)];
      } else if (type === 'tens') {
        if (n < 10) continue;
        cs = [DAN(k), TENS(Math.floor(n / 10)), PAR(n % 2 === 0)];
      } else {
        var a = prodBelow(rng, n, 9), b = prodAbove(rng, n, 9);
        if (!a || !b) continue;
        cs = [DAN(k), GT(a), LT(b)];
      }
      var sol = solve(cs);
      if (sol.length !== 1 || sol[0] !== n) continue;
      var tr = trapsOf(cs, n, rng);
      if (tr.length < 2) continue;
      return { n: n, type: type, cs: cs, traps: tr };
    }
    return null;
  }
  function build(rng, item) {
    var who = ['🐻 곰이', '🐧 펭이', '🙋 지아'];
    var opts = shuffle(rng, [item.n].concat(item.traps.map(function (t) { return t.x; }))).map(String);
    var t0 = item.traps[0];
    var where = cells(item.n).map(function (c) { return c[0] + ' × ' + c[1]; }).join(', ');
    var explain = KO.j(item.n, '은/는') + ' 세 단서를 모두 지켜요. ' + KO.j(t0.x, '은/는') + ' ' + '①②③'[t0.broke] + ' 단서에 맞지 않아요. 곱셈표에서 ' +
                  KO.j(item.n, '이/가') + ' 있는 칸: ' + where;
    return {
      n: item.n, clues: item.cs.map(function (c, i) { return { who: who[i], text: c.text }; }),
      traps: item.traps.map(function (t) { return { x: t.x, broke: t.broke }; }), cells: cells(item.n),
      prompt: item.cs.map(function (c, i) { return '①②③'[i] + ' ' + c.text; }).join(' '),
      options: opts, answer: String(item.n), type: item.type, explain: explain
    };
  }

  return {
    id: 'gugu_clue',
    title: '곱셈표 수 찾기',
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var order = shuffle(rng, BOOK.slice()), qi = 0;
      return {
        next: function () {
          var item;
          if (book && qi < 2) {
            var b = order[qi]; var cs = b.clues();
            item = { n: b.n, type: b.type, cs: cs, traps: trapsOf(cs, b.n, rng) };
          } else item = makeRandom(rng);
          qi++;
          return build(rng, item);
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num" style="font-size:.8em">' + q.prompt + '</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '세 단서를 모두 지키는 수를 곱셈표에서 찾아 쓰세요.'
  };
}));
