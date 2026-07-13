/* =============================================================
 * templates/g6_math_u1.js — 케이퀴즈: 6학년 1학기 1단원 「분수의 나눗셈」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g6_math_u1): l01 (자연수)÷(자연수)를 분수로 · l02 (진분수)÷(자연수) ·
 *   l03 (가분수)÷(자연수) · l04 (대분수)÷(자연수) · l05 마무리
 * 성취기준 [6수01-07](분수의 나눗셈)
 *
 * ⭐ 교란지 = 오개념 (5학년 분수 단원과 같은 원칙)
 *    **분수 나눗셈 최대 오개념: 분자만 나누기** (2/3 ÷ 2 = 1/3 은 맞지만 3/4 ÷ 2 = 1.5/4 로 헤맴)
 *    **두 번째 오개념: 분모를 나누기** (3/4 ÷ 2 = 3/2)
 *    → 두 오답을 교란지에 반드시 넣는다. 아이가 그걸 고르면 대시보드에 잡힌다.
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
  function red(n, d) { var g = gcd(n, d) || 1; return [n / g, d / g]; }
  function fr(n, d) { return d === 1 ? String(n) : (n + '/' + d); }
  function frRed(n, d) { var r = red(n, d); return fr(r[0], r[1]); }

  /* ── (자연수)÷(자연수)를 분수로 ────────────────────────────────────── */
  var natDiv = {
    id: 't_nat_div', type: 'param', difficulty: 1, concept: '(자연수)÷(자연수)를 분수로',
    itemType: 'choice',
    gen: function (r) { return { a: r.int(1, 9), b: r.int(2, 9) }; },
    render: function (p) { return p.a + ' ÷ ' + p.b + ' 의 몫을 분수로 나타내면 무엇일까요?'; },
    answer: function (p) { return frRed(p.a, p.b); },
    distractors: function (p) {
      var right = frRed(p.a, p.b);
      return [
        fr(p.b, p.a),                       // ⚠️ 뒤집어 쓴 오개념
        fr(p.a, p.a + p.b),
        fr(p.a + p.b, p.b)
      ].filter(function (x) { return x !== right; });
    },
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) {
      return '나누는 수가 분모, 나누어지는 수가 분자 → ' + frRed(p.a, p.b);
    }
  };

  /* ── (진분수)÷(자연수) — 핵심 ─────────────────────────────────────── */
  var properDiv = {
    id: 't_proper_div', type: 'param', difficulty: 2, concept: '(진분수)÷(자연수)',
    itemType: 'choice',
    gen: function (r) {
      var d = r.int(2, 9);
      var n = r.int(1, d - 1 > 0 ? d - 1 : 1);
      return { n: n, d: d, k: r.int(2, 6) };
    },
    render: function (p) { return fr(p.n, p.d) + ' ÷ ' + p.k + ' = ?'; },
    answer: function (p) { return frRed(p.n, p.d * p.k); },
    distractors: function (p) {
      var right = frRed(p.n, p.d * p.k);
      var cand = [
        [p.n, p.d / p.k],                   // ⚠️ 분모를 나눈 오개념
        [p.n / p.k, p.d],                   // ⚠️ 분자를 나눈 오개념 (나누어떨어질 때만 그럴듯)
        [p.n * p.k, p.d],                   // ⚠️ 곱해버린 오개념
        [p.n, p.d + p.k]                    // ⚠️ 더해버린 오개념
      ];
      return cand.filter(function (c) {
        return c[0] > 0 && c[1] > 0 && Number.isInteger(c[0]) && Number.isInteger(c[1]) &&
               fr(c[0], c[1]) !== right;
      }).map(function (c) { return fr(c[0], c[1]); });
    },
    validate: function (p) { return p.n < p.d; },
    explain: function (p) {
      return '÷' + p.k + ' 는 ×1/' + p.k + ' → ' + fr(p.n, p.d) + ' × ' + fr(1, p.k) + ' = ' +
             frRed(p.n, p.d * p.k);
    }
  };

  /* ── (대분수)÷(자연수) ─────────────────────────────────────────────── */
  var mixedDiv = {
    id: 't_mixed_div', type: 'param', difficulty: 3, concept: '(대분수)÷(자연수)',
    itemType: 'choice',
    gen: function (r) {
      var d = r.int(2, 8);
      var n = r.int(1, d - 1 > 0 ? d - 1 : 1);
      return { w: r.int(1, 4), n: n, d: d, k: r.int(2, 5) };
    },
    render: function (p) {
      return p.w + '과 ' + fr(p.n, p.d) + ' 을(를) ' + p.k + '(으)로 나누면 얼마일까요? ' +
             '(대분수 A와 B/C 를 "A와 B/C" 로 씁니다)';
    },
    answer: function (p) {
      var top = p.w * p.d + p.n;
      return mixedStr(top, p.d * p.k);
    },
    distractors: function (p) {
      var top = p.w * p.d + p.n;
      var right = mixedStr(top, p.d * p.k);
      return [
        mixedStr(top, p.d) + ' ÷ ' + p.k,           // 형식만 흉내낸 오답 → 제거됨
        p.w + '와 ' + fr(p.n, p.d * p.k),           // ⚠️ 자연수 부분을 안 나눈 오개념 (가장 흔함)
        mixedStr(top * p.k, p.d),                   // ⚠️ 곱해버린 오개념
        mixedStr(top + p.k, p.d)
      ].filter(function (x) { return x !== right && x.indexOf('÷') < 0; });
    },
    validate: function (p) { return p.n < p.d; },
    explain: function (p) {
      var top = p.w * p.d + p.n;
      return '가분수로: ' + fr(top, p.d) + ' → ÷' + p.k + ' = ' + mixedStr(top, p.d * p.k) +
             ' (자연수 부분도 같이 나눠야 해요)';
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

  /* ── 분자만 구하기 (수 입력 — numpad 로 낼 수 있는 분수 문항) ───────── */
  var divNumerator = {
    id: 't_div_num', type: 'param', difficulty: 2, concept: '(진분수)÷(자연수)',
    itemType: 'short',
    gen: function (r) {
      var d = r.int(2, 9);
      var n = r.int(1, d - 1 > 0 ? d - 1 : 1);
      return { n: n, d: d, k: r.int(2, 6) };
    },
    render: function (p) {
      return fr(p.n, p.d) + ' ÷ ' + p.k + ' 을(를) 계산하면 분모가 ' + (p.d * p.k) +
             '인 분수가 돼요. 이때 분자는 얼마일까요?';
    },
    answer: function (p) { return p.n; },
    validate: function (p) { return p.n < p.d; },
    explain: function (p) {
      return '분모에만 ' + p.k + '를 곱해요 → 분자는 그대로 ' + p.n;
    }
  };

  /* ── 오개념 정면 타격 (참거짓 — 서바이벌 재료) ─────────────────────── */
  var divOx = {
    id: 't_div_ox', type: 'param', difficulty: 3, concept: '분수 나눗셈의 오개념',
    itemType: 'ox',
    gen: function (r) {
      var d = r.int(2, 8);
      var n = r.int(1, d - 1 > 0 ? d - 1 : 1);
      var k = r.int(2, 5);
      var right = frRed(n, d * k);
      var myth = fr(n * k, d);                       // ⚠️ 곱해버린 오개념
      return { n: n, d: d, k: k, claim: r.pick([right, myth]) };
    },
    render: function (p) {
      return fr(p.n, p.d) + ' ÷ ' + p.k + ' = ' + p.claim + ' 입니다';
    },
    answer: function (p) { return p.claim === frRed(p.n, p.d * p.k); },
    validate: function (p) {
      return p.n < p.d && frRed(p.n, p.d * p.k) !== fr(p.n * p.k, p.d);
    },
    explain: function (p) {
      return '÷' + p.k + ' 는 분모에 ' + p.k + '를 곱하는 것 → ' + frRed(p.n, p.d * p.k);
    }
  };

  function src(lesson) { return { grade: 6, subject: 'math', unit: 'u1', lesson: lesson }; }

  reg('g6_math_u1_l01', { source: src('l01'), fixed: [], templates: [natDiv] });
  reg('g6_math_u1_l02', { source: src('l02'), fixed: [], templates: [properDiv, divNumerator] });
  reg('g6_math_u1_l03', { source: src('l03'), fixed: [], templates: [properDiv, divOx] });
  reg('g6_math_u1_l04', { source: src('l04'), fixed: [], templates: [mixedDiv] });
  reg('g6_math_u1_l05', { source: src('l05'), fixed: [],
    templates: [natDiv, properDiv, mixedDiv, divNumerator, divOx] });

  reg('g6_math_u1', {
    source: { grade: 6, subject: 'math', unit: 'u1', lesson: 'all' }, fixed: [],
    templates: [natDiv, properDiv, mixedDiv, divNumerator, divOx]
  });
});
