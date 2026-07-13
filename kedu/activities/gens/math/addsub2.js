/* gens/math/addsub2.js — 두 자리 수 덧셈과 뺄셈 (2학년 수학 3단원)
 * 순수 함수·DOM 무관 (§9-3). 선다 대결·릴레이·활동지 공유.
 * params: { qmode: 'add'|'sub'|'mix', carry: 0|1(받아올림/내림 포함) }
 * type: add_plain · add_carry(받아올림) · sub_plain · sub_borrow(받아내림)
 *   carry/borrow가 약하면 자릿수를 넘나드는 계산이 안 잡힌 것 — 2학년 최대 고비.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['addsub2'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  return {
    id: 'addsub2',
    title: '두 자리 덧셈·뺄셈',
    create: function (params, rng) {
      var p = params || {};
      var m = p.qmode || 'mix';
      var withCarry = (+p.carry !== 0);
      return {
        next: function () {
          var kind = (m === 'mix') ? (rng() < 0.5 ? 'add' : 'sub') : m;
          var a, b, ans, type, explain;
          if (kind === 'add') {
            var wantCarry = withCarry && rng() < 0.55;
            var tries = 0;
            do {
              a = ri(rng, 11, 89); b = ri(rng, 11, 89);
              tries++;
            } while (tries < 30 && (a + b > 99 || ((a % 10 + b % 10 >= 10) !== wantCarry)));
            ans = a + b;
            type = (a % 10 + b % 10 >= 10) ? 'add_carry' : 'add_plain';
            explain = (type === 'add_carry')
              ? '낱개끼리 더하면 ' + (a % 10) + '+' + (b % 10) + '=' + (a % 10 + b % 10) + ' — 10이 넘으니 십의 자리로 1을 올려요!'
              : '십은 십끼리, 낱개는 낱개끼리 더해요: ' + a + '+' + b + '=' + ans;
          } else {
            var wantBorrow = withCarry && rng() < 0.55;
            var t2 = 0;
            do {
              a = ri(rng, 21, 99); b = ri(rng, 11, a - 1);
              t2++;
            } while (t2 < 30 && ((a % 10 < b % 10) !== wantBorrow));
            ans = a - b;
            type = (a % 10 < b % 10) ? 'sub_borrow' : 'sub_plain';
            explain = (type === 'sub_borrow')
              ? '낱개가 모자라요(' + (a % 10) + '<' + (b % 10) + '). 십의 자리에서 10을 빌려와요!'
              : '십은 십끼리, 낱개는 낱개끼리 빼요: ' + a + '−' + b + '=' + ans;
          }
          var opts = [String(ans)];
          while (opts.length < 4) {
            var d = ans + ri(rng, -12, 12) || ans + 1;
            var c = String(Math.abs(d));
            if (opts.indexOf(c) < 0 && +c !== ans) opts.push(c);
          }
          for (var i = opts.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1)), x = opts[i]; opts[i] = opts[j]; opts[j] = x;
          }
          return {
            a: a, b: b, kind: kind,
            prompt: a + (kind === 'add' ? ' + ' : ' − ') + b + ' = ?',
            answer: String(ans), options: opts, type: type, explain: explain
          };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num">' + q.a + (q.kind === 'add' ? ' + ' : ' − ') + q.b + ' =</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '계산해 □ 안에 알맞은 수를 쓰세요.'
  };
}));
