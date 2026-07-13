/* =============================================================
 * templates/g5_math_u5.js — 케이퀴즈: 5학년 1학기 5단원 「분수의 덧셈과 뺄셈」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g5_math_u5): l01 진분수의 덧셈 · l02 대분수의 덧셈 ·
 *   l03 진분수의 뺄셈 · l04 대분수의 뺄셈 · l05 받아내림이 있는 뺄셈 · l06 마무리
 * 성취기준 [6수01-06](분모가 다른 분수의 덧셈과 뺄셈)
 *
 * ⭐ 교란지 = 오개념 (u4와 같은 원칙)
 *    **분수 덧셈 최대 오개념: 분모끼리 더하고 분자끼리 더하기** (2/3 + 1/4 = 3/7)
 *    이걸 교란지 1번에 반드시 넣는다 → 그 아이가 그걸 고르면 대시보드에 잡힌다.
 *    오답이 곧 진단이다.
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var MINUS = '\u2212';

  function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function red(n, d) { var g = gcd(n, d) || 1; return [n / g, d / g]; }
  function fr(n, d) {
    if (d === 1) return String(n);
    return n + '/' + d;
  }
  function frRed(n, d) { var r = red(n, d); return fr(r[0], r[1]); }

  /* ── 진분수의 덧셈 (분모가 다름) ───────────────────────────────────── */
  var addProper = {
    id: 't_add_proper', type: 'param', difficulty: 2, concept: '분모가 다른 진분수의 덧셈',
    itemType: 'choice',
    gen: function (r) {
      var d1 = r.int(2, 9), d2 = r.int(2, 9);
      var n1 = r.int(1, d1 - 1 > 0 ? d1 - 1 : 1);
      var n2 = r.int(1, d2 - 1 > 0 ? d2 - 1 : 1);
      return { n1: n1, d1: d1, n2: n2, d2: d2 };
    },
    render: function (p) {
      return fr(p.n1, p.d1) + ' + ' + fr(p.n2, p.d2) + ' = ?';
    },
    answer: function (p) {
      var L = lcm(p.d1, p.d2);
      return frRed(p.n1 * (L / p.d1) + p.n2 * (L / p.d2), L);
    },
    distractors: function (p) {
      var L = lcm(p.d1, p.d2);
      var right = frRed(p.n1 * (L / p.d1) + p.n2 * (L / p.d2), L);
      return [
        fr(p.n1 + p.n2, p.d1 + p.d2),                          // ⚠️ 최대 오개념: 분모끼리·분자끼리
        fr(p.n1 + p.n2, L),                                     // ⚠️ 통분하고 분자를 안 고침
        frRed(p.n1 * (L / p.d1) + p.n2 * (L / p.d2) + 1, L)     // ⚠️ 계산 실수 근접값
      ].filter(function (x) { return x !== right; });
    },
    validate: function (p) { return p.d1 !== p.d2 && p.n1 < p.d1 && p.n2 < p.d2; },
    explain: function (p) {
      var L = lcm(p.d1, p.d2);
      return '통분: ' + fr(p.n1 * (L / p.d1), L) + ' + ' + fr(p.n2 * (L / p.d2), L) +
             ' = ' + fr(p.n1 * (L / p.d1) + p.n2 * (L / p.d2), L) +
             ' → ' + frRed(p.n1 * (L / p.d1) + p.n2 * (L / p.d2), L);
    }
  };

  /* ── 진분수의 뺄셈 ─────────────────────────────────────────────────── */
  var subProper = {
    id: 't_sub_proper', type: 'param', difficulty: 2, concept: '분모가 다른 진분수의 뺄셈',
    itemType: 'choice',
    gen: function (r) {
      var d1 = r.int(2, 9), d2 = r.int(2, 9);
      var n1 = r.int(1, d1 - 1 > 0 ? d1 - 1 : 1);
      var n2 = r.int(1, d2 - 1 > 0 ? d2 - 1 : 1);
      return { n1: n1, d1: d1, n2: n2, d2: d2 };
    },
    render: function (p) {
      return fr(p.n1, p.d1) + ' ' + MINUS + ' ' + fr(p.n2, p.d2) + ' = ?';
    },
    answer: function (p) {
      var L = lcm(p.d1, p.d2);
      return frRed(p.n1 * (L / p.d1) - p.n2 * (L / p.d2), L);
    },
    distractors: function (p) {
      var L = lcm(p.d1, p.d2);
      var top = p.n1 * (L / p.d1) - p.n2 * (L / p.d2);
      var right = frRed(top, L);
      // ⛔ 초등에 음수·0 분수는 없다 — 교란지에도 넣지 않는다(오개념 교란은 '있을 법한 오답'이어야 한다)
      return [
        // ⚠️ 분모끼리·분자끼리 빼기 (분자가 0이 되면 그건 오답이 아니라 그냥 이상한 수 → 뺀다)
        (p.n1 - p.n2 !== 0) ? fr(Math.abs(p.n1 - p.n2), Math.abs(p.d1 - p.d2) || 1) : null,
        (p.n1 - p.n2 > 0) ? fr(p.n1 - p.n2, L) : null,           // ⚠️ 통분 후 분자 안 고침
        frRed(top + 1, L),                                        // ⚠️ 계산 실수 근접값
        (top - 1 > 0) ? frRed(top - 1, L) : null
      ].filter(function (x) { return x && x !== right; });
    },
    validate: function (p) {
      var L = lcm(p.d1, p.d2);
      return p.d1 !== p.d2 && p.n1 < p.d1 && p.n2 < p.d2 &&
             (p.n1 * (L / p.d1) - p.n2 * (L / p.d2)) > 0;        // 답이 양수여야 한다
    },
    explain: function (p) {
      var L = lcm(p.d1, p.d2);
      return '통분: ' + fr(p.n1 * (L / p.d1), L) + ' ' + MINUS + ' ' + fr(p.n2 * (L / p.d2), L) +
             ' = ' + frRed(p.n1 * (L / p.d1) - p.n2 * (L / p.d2), L);
    }
  };

  /* ── 대분수의 덧셈 (자연수 부분 분리) ──────────────────────────────── */
  var addMixed = {
    id: 't_add_mixed', type: 'param', difficulty: 3, concept: '대분수의 덧셈',
    itemType: 'choice',
    gen: function (r) {
      var d1 = r.int(2, 8), d2 = r.int(2, 8);
      return { w1: r.int(1, 4), n1: r.int(1, d1 - 1 > 0 ? d1 - 1 : 1), d1: d1,
               w2: r.int(1, 4), n2: r.int(1, d2 - 1 > 0 ? d2 - 1 : 1), d2: d2 };
    },
    render: function (p) {
      return p.w1 +'과 ' + fr(p.n1, p.d1) + ' 더하기 ' + p.w2 + '과 ' + fr(p.n2, p.d2) +
             ' 는 얼마일까요? (대분수 A와 B/C 를 "A와 B/C" 로 씁니다)';
    },
    answer: function (p) {
      var L = lcm(p.d1, p.d2);
      var num = (p.w1 * p.d1 + p.n1) * (L / p.d1) + (p.w2 * p.d2 + p.n2) * (L / p.d2);
      return mixedStr(num, L);
    },
    distractors: function (p) {
      var L = lcm(p.d1, p.d2);
      var num = (p.w1 * p.d1 + p.n1) * (L / p.d1) + (p.w2 * p.d2 + p.n2) * (L / p.d2);
      var right = mixedStr(num, L);
      return [
        (p.w1 + p.w2) + '와 ' + fr(p.n1 + p.n2, p.d1 + p.d2),      // ⚠️ 분모끼리 더하기
        (p.w1 + p.w2) + '와 ' + fr(p.n1 + p.n2, Math.max(p.d1, p.d2)),
        mixedStr(num + L, L)                                        // ⚠️ 자연수 하나 더
      ].filter(function (x) { return x !== right; });
    },
    validate: function (p) { return p.d1 !== p.d2; },
    explain: function (p) {
      var L = lcm(p.d1, p.d2);
      var num = (p.w1 * p.d1 + p.n1) * (L / p.d1) + (p.w2 * p.d2 + p.n2) * (L / p.d2);
      return '가분수로 바꿔 통분한 뒤 더해요 → ' + mixedStr(num, L);
    }
  };

  function mixedStr(num, den) {
    var r = red(num, den);
    num = r[0]; den = r[1];
    if (den === 1) return String(num);
    var w = Math.floor(num / den);
    var rest = num % den;
    if (w === 0) return fr(rest, den);
    if (rest === 0) return String(w);
    return w + '와 ' + fr(rest, den);
  }

  /* ── 분자 구하기 (수 입력 — numpad 로 낼 수 있는 분수 문항) ───────── */
  var addNumerator = {
    id: 't_add_num', type: 'param', difficulty: 2, concept: '분모가 다른 진분수의 덧셈',
    itemType: 'short',
    gen: function (r) {
      var d1 = r.int(2, 9), d2 = r.int(2, 9);
      return { n1: r.int(1, d1 - 1 > 0 ? d1 - 1 : 1), d1: d1,
               n2: r.int(1, d2 - 1 > 0 ? d2 - 1 : 1), d2: d2 };
    },
    render: function (p) {
      var L = lcm(p.d1, p.d2);
      return fr(p.n1, p.d1) + ' + ' + fr(p.n2, p.d2) + ' 을(를) 분모 ' + L +
             '(으)로 통분해서 더하면, 분자는 얼마일까요?';
    },
    answer: function (p) {
      var L = lcm(p.d1, p.d2);
      return p.n1 * (L / p.d1) + p.n2 * (L / p.d2);
    },
    validate: function (p) { return p.d1 !== p.d2 && p.n1 < p.d1 && p.n2 < p.d2; },
    explain: function (p) {
      var L = lcm(p.d1, p.d2);
      return p.n1 * (L / p.d1) + ' + ' + p.n2 * (L / p.d2) + ' = ' +
             (p.n1 * (L / p.d1) + p.n2 * (L / p.d2));
    }
  };

  /* ── 오개념 정면 타격 (참거짓 — 서바이벌 재료) ────────────────────── */
  var mythOx = {
    id: 't_myth_ox', type: 'param', difficulty: 3, concept: '분수 덧셈의 오개념',
    itemType: 'ox',
    gen: function (r) {
      var d1 = r.int(2, 9), d2 = r.int(2, 9);
      var n1 = r.int(1, d1 - 1 > 0 ? d1 - 1 : 1);
      var n2 = r.int(1, d2 - 1 > 0 ? d2 - 1 : 1);
      var L = lcm(d1, d2);
      var right = frRed(n1 * (L / d1) + n2 * (L / d2), L);
      var myth = fr(n1 + n2, d1 + d2);            // ⚠️ 분모끼리·분자끼리 더한 값
      return { n1: n1, d1: d1, n2: n2, d2: d2, claim: r.pick([right, myth]) };
    },
    render: function (p) {
      return fr(p.n1, p.d1) + ' + ' + fr(p.n2, p.d2) + ' = ' + p.claim + ' 입니다';
    },
    answer: function (p) {
      var L = lcm(p.d1, p.d2);
      return p.claim === frRed(p.n1 * (L / p.d1) + p.n2 * (L / p.d2), L);
    },
    validate: function (p) {
      var L = lcm(p.d1, p.d2);
      return p.d1 !== p.d2 &&
             frRed(p.n1 * (L / p.d1) + p.n2 * (L / p.d2), L) !== fr(p.n1 + p.n2, p.d1 + p.d2);
    },
    explain: function (p) {
      var L = lcm(p.d1, p.d2);
      return '분모끼리 더하면 안 돼요. 통분해서 더해요 → ' +
             frRed(p.n1 * (L / p.d1) + p.n2 * (L / p.d2), L);
    }
  };

  function src(lesson) { return { grade: 5, subject: 'math', unit: 'u5', lesson: lesson }; }

  reg('g5_math_u5_l01', { source: src('l01'), fixed: [], templates: [addProper, addNumerator] });
  reg('g5_math_u5_l02', { source: src('l02'), fixed: [], templates: [addMixed] });
  reg('g5_math_u5_l03', { source: src('l03'), fixed: [], templates: [subProper] });
  reg('g5_math_u5_l04', { source: src('l04'), fixed: [], templates: [subProper, addMixed] });
  reg('g5_math_u5_l06', { source: src('l06'), fixed: [],
    templates: [addProper, subProper, addNumerator, mythOx] });

  reg('g5_math_u5', {
    source: { grade: 5, subject: 'math', unit: 'u5', lesson: 'all' }, fixed: [],
    templates: [addProper, subProper, addMixed, addNumerator, mythOx]
  });
});
