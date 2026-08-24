/* gens/math/multiply.js — 곱셈 (2학년 수학 6단원)
 * 순수 함수·DOM 무관 (§9-3).
 * params: { max: 5|9, qmode: 'group'(몇씩 몇 묶음) | 'times'(곱셈식) | 'mix' }
 * type: times_2_5(2·5단 — 뛰어 세기로 닿는다) · times_3_4(3·4단) · times_hard(6~9단)
 *       · repeated_add(같은 수를 여러 번 더하기 = 곱셈의 뿌리)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['multiply'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  /* §6-10 4·5항 — 조사 판정은 core/ko.js 한 곳에서. 못 찾으면 소리 내어 실패한다. */
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  return {
    id: 'multiply',
    title: '곱셈',
    create: function (params, rng) {
      var p = params || {};
      var max = [5, 9].indexOf(+p.max) >= 0 ? +p.max : 9;
      var m = p.qmode || 'mix';
      return {
        next: function () {
          var a = ri(rng, 2, max);           // 몇씩
          var b = ri(rng, 2, max);           // 몇 묶음
          var ans = a * b;
          var kind = (m === 'mix') ? (rng() < 0.5 ? 'group' : 'times') : m;
          var prompt, explain;
          if (kind === 'group') {
            prompt = a + '씩 ' + b + '묶음은 모두 몇 개?';
            explain = a + '씩 ' + b + '묶음 = ' + Array(b + 1).join(a + '+').slice(0, -1) + ' = ' + ans +
                      '  →  ' + a + ' × ' + b + ' = ' + ans;
          } else {
            prompt = a + ' × ' + b + ' = ?';
            explain = KO.j(a, '을/를') + ' ' + b + '번 더한 것과 같아요 = ' + ans;
          }
          var type = (a === 2 || a === 5) ? 'times_2_5'
            : (a === 3 || a === 4) ? 'times_3_4'
            : (kind === 'group' ? 'repeated_add' : 'times_hard');

          var opts = [String(ans)];
          while (opts.length < 4) {
            var c = String(Math.max(2, ans + ri(rng, -9, 9)));
            if (opts.indexOf(c) < 0 && +c !== ans) opts.push(c);
          }
          for (var i = opts.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1)), x = opts[i]; opts[i] = opts[j]; opts[j] = x;
          }
          return { a: a, b: b, kind: kind, prompt: prompt, answer: String(ans),
                   options: opts, type: type, explain: explain };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num">' + q.a + ' × ' + q.b + ' =</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '곱셈을 해 □ 안에 알맞은 수를 쓰세요.'
  };
}));
