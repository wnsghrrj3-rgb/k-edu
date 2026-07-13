/* =============================================================
 * templates/g5_math_u4.js — 케이퀴즈: 5학년 1학기 4단원 「약분과 통분」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g5_math_u4): l01 크기가 같은 분수 · l02 약분 · l03 기약분수 ·
 *   l04 통분 · l05 분수의 크기 비교 · l06 분수와 소수의 크기 비교 · l07 마무리
 * 성취기준 [6수01-04](약분·통분)·[6수01-05](분수의 크기 비교)
 *
 * ⭐ 설계 결정 — **분수 답은 4지선다로 낸다.**
 *    케이배틀의 수 입력(numpad)은 정수만 받는다(제2조: 타이핑 없음 → 분수 입력기가 없다).
 *    그래서 답이 분수인 문항은 choice 로 낸다. 그런데 이게 오히려 낫다:
 *    **교란지를 전형적 오개념으로 채우면, 오답 자체가 진단이 된다.**
 *      통분 오개념: 분모끼리·분자끼리 따로 더하기 / 분모만 맞추고 분자 안 고치기
 *      약분 오개념: 분자만 나누기 / 분모만 나누기
 *    → 케이배틀 교사 대시보드에서 "이 아이가 어떤 오개념에 걸리는지"가 보인다.
 *
 *    답이 정수인 문항(최소공배수·공통분모·약분 횟수)은 그대로 short(numpad).
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function fr(n, d) { return n + '/' + d; }

  /* ── 기약분수로 나타내기 (선택형 — 교란 = 약분 오개념) ────────────── */
  var reduce = {
    id: 't_reduce', type: 'param', difficulty: 2, concept: '약분과 기약분수',
    itemType: 'choice',
    gen: function (r) {
      var g = r.int(2, 9);
      var n = r.int(1, 8), d = r.int(2, 9);
      if (n >= d) { var t = n; n = d - 1 > 0 ? d - 1 : 1; d = t + 1; }
      return { n: n * g, d: d * g, g: g, bn: n, bd: d };
    },
    render: function (p) { return fr(p.n, p.d) + '을(를) 기약분수로 나타내면 무엇일까요?'; },
    answer: function (p) {
      var g = gcd(p.n, p.d);
      return fr(p.n / g, p.d / g);
    },
    distractors: function (p) {
      var g = gcd(p.n, p.d);
      var right = fr(p.n / g, p.d);
      // ⛔ 교란지도 '진분수'여야 한다 — 0/n, 가분수는 아이가 봐도 답이 아닌 게 티가 난다.
      //    오개념 교란의 조건: **있을 법한 오답**이어야 한다.
      var cand = [
        [p.n / g, p.d],            // ⚠️ 분자만 나눈 오개념
        [p.n, p.d / g],            // ⚠️ 분모만 나눈 오개념
        [p.n - g, p.d - g],        // ⚠️ 나누기 대신 빼기 오개념
        [p.n / g + 1, p.d / g],    // ⚠️ 근접 실수
        [p.n / g, p.d / g + 1]
      ];
      var okAns = fr(p.n / gcd(p.n, p.d), p.d / gcd(p.n, p.d));
      return cand.filter(function (c) {
        return c[0] > 0 && c[1] > 0 && c[0] < c[1] && fr(c[0], c[1]) !== okAns;
      }).map(function (c) { return fr(c[0], c[1]); });
    },
    validate: function (p) { return gcd(p.n, p.d) > 1 && p.n < p.d; },
    explain: function (p) {
      var g = gcd(p.n, p.d);
      return '분자와 분모를 최대공약수 ' + g + '(으)로 나눠요 → ' + fr(p.n / g, p.d / g);
    }
  };

  /* ── 공통분모 구하기 (수 입력 — 통분의 뿌리) ──────────────────────── */
  var commonDenom = {
    id: 't_common_denom', type: 'param', difficulty: 2, concept: '통분',
    itemType: 'short',
    gen: function (r) { return { a: r.int(2, 12), b: r.int(2, 12) }; },
    render: function (p) {
      return fr(1, p.a) + '와(과) ' + fr(1, p.b) + '을(를) 통분할 때, 가장 작은 공통분모는 얼마일까요?';
    },
    answer: function (p) { return lcm(p.a, p.b); },
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) {
      return p.a + '과 ' + p.b + '의 최소공배수 → ' + lcm(p.a, p.b);
    }
  };

  /* ── 통분한 결과 (선택형 — 교란 = 통분 오개념) ────────────────────── */
  var makeCommon = {
    id: 't_make_common', type: 'param', difficulty: 3, concept: '통분',
    itemType: 'choice',
    gen: function (r) {
      var a = r.int(2, 9), b = r.int(2, 9);
      var n = r.int(1, a - 1 > 0 ? a - 1 : 1);
      return { n: n, a: a, b: b };
    },
    render: function (p) {
      return fr(p.n, p.a) + '을(를) 분모가 ' + lcm(p.a, p.b) + '인 분수로 나타내면 무엇일까요?';
    },
    answer: function (p) {
      var L = lcm(p.a, p.b);
      return fr(p.n * (L / p.a), L);
    },
    distractors: function (p) {
      var L = lcm(p.a, p.b);
      return [
        fr(p.n, L),                          // ⚠️ 분모만 바꾸고 분자를 안 고친 오개념 (가장 흔함)
        fr(p.n + (L - p.a), L),              // ⚠️ 곱하기 대신 더하기 오개념
        fr(p.n * p.b, L)                     // ⚠️ 상대 분모를 그냥 곱한 오개념
      ].filter(function (x) { return x !== fr(p.n * (L / p.a), L); });
    },
    validate: function (p) { return p.a !== p.b && p.n < p.a; },
    explain: function (p) {
      var L = lcm(p.a, p.b), k = L / p.a;
      return '분모가 ' + p.a + ' → ' + L + '이 되려면 ' + k + '배. 분자도 ' + k + '배 → ' +
             fr(p.n * k, L);
    }
  };

  /* ── 분수의 크기 비교 (선택형) ─────────────────────────────────────── */
  var compareFrac = {
    id: 't_cmp_frac', type: 'param', difficulty: 2, concept: '분수의 크기 비교',
    itemType: 'choice',
    gen: function (r) {
      var a = r.int(2, 9), b = r.int(2, 9);
      var n1 = r.int(1, a - 1 > 0 ? a - 1 : 1);
      var n2 = r.int(1, b - 1 > 0 ? b - 1 : 1);
      return { n1: n1, d1: a, n2: n2, d2: b };
    },
    render: function (p) {
      return fr(p.n1, p.d1) + '와(과) ' + fr(p.n2, p.d2) + ' 중 더 큰 수는 무엇일까요?';
    },
    answer: function (p) {
      return (p.n1 * p.d2 > p.n2 * p.d1) ? fr(p.n1, p.d1) : fr(p.n2, p.d2);
    },
    distractors: function (p) {
      return [(p.n1 * p.d2 > p.n2 * p.d1) ? fr(p.n2, p.d2) : fr(p.n1, p.d1)];
    },
    choiceCount: 2,
    validate: function (p) {
      return (p.n1 * p.d2) !== (p.n2 * p.d1) && p.n1 < p.d1 && p.n2 < p.d2;
    },
    explain: function (p) {
      var L = lcm(p.d1, p.d2);
      return '통분하면 ' + fr(p.n1 * (L / p.d1), L) + ' 와 ' + fr(p.n2 * (L / p.d2), L) +
             ' → ' + ((p.n1 * p.d2 > p.n2 * p.d1) ? fr(p.n1, p.d1) : fr(p.n2, p.d2)) + '이(가) 커요';
    }
  };

  /* ── 분수 비교 참거짓 (오개념 정면 타격 — 서바이벌 재료) ───────────── */
  var fracOx = {
    id: 't_frac_ox', type: 'param', difficulty: 3, concept: '분수의 크기 비교',
    itemType: 'ox',
    gen: function (r) {
      // ⚠️ "분모가 크면 분수가 크다"는 초등 최대 오개념을 직접 때린다
      var d1 = r.int(2, 9), d2 = r.int(2, 9);
      var n1 = r.int(1, d1 - 1 > 0 ? d1 - 1 : 1);
      var n2 = r.int(1, d2 - 1 > 0 ? d2 - 1 : 1);
      return { n1: n1, d1: d1, n2: n2, d2: d2 };
    },
    render: function (p) {
      return fr(p.n1, p.d1) + '은(는) ' + fr(p.n2, p.d2) + '보다 큽니다';
    },
    answer: function (p) { return p.n1 * p.d2 > p.n2 * p.d1; },
    validate: function (p) {
      return (p.n1 * p.d2) !== (p.n2 * p.d1) && p.n1 < p.d1 && p.n2 < p.d2;
    },
    explain: function (p) {
      var L = lcm(p.d1, p.d2);
      return '통분: ' + fr(p.n1 * (L / p.d1), L) + ' vs ' + fr(p.n2 * (L / p.d2), L);
    }
  };

  /* ── 크기가 같은 분수 (수 입력) ────────────────────────────────────── */
  var equalFrac = {
    id: 't_equal_frac', type: 'param', difficulty: 1, concept: '크기가 같은 분수',
    itemType: 'short',
    gen: function (r) {
      var n = r.int(1, 7), d = r.int(2, 9), k = r.int(2, 6);
      if (n >= d) n = d - 1 > 0 ? d - 1 : 1;
      return { n: n, d: d, k: k };
    },
    render: function (p) {
      return fr(p.n, p.d) + ' = □/' + (p.d * p.k) + ' 일 때 □에 알맞은 수는 무엇일까요?';
    },
    answer: function (p) { return p.n * p.k; },
    explain: function (p) {
      return '분모가 ' + p.k + '배가 됐으니 분자도 ' + p.k + '배 → ' + p.n + ' × ' + p.k + ' = ' + (p.n * p.k);
    }
  };

  function src(lesson) { return { grade: 5, subject: 'math', unit: 'u4', lesson: lesson }; }

  reg('g5_math_u4_l01', { source: src('l01'), fixed: [], templates: [equalFrac] });
  reg('g5_math_u4_l02', { source: src('l02'), fixed: [], templates: [reduce] });
  reg('g5_math_u4_l03', { source: src('l03'), fixed: [], templates: [reduce] });
  reg('g5_math_u4_l04', { source: src('l04'), fixed: [], templates: [commonDenom, makeCommon] });
  reg('g5_math_u4_l05', { source: src('l05'), fixed: [], templates: [compareFrac, fracOx] });
  reg('g5_math_u4_l07', { source: src('l07'), fixed: [],
    templates: [equalFrac, reduce, commonDenom, makeCommon, compareFrac, fracOx] });

  reg('g5_math_u4', {
    source: { grade: 5, subject: 'math', unit: 'u4', lesson: 'all' }, fixed: [],
    templates: [equalFrac, reduce, commonDenom, makeCommon, compareFrac, fracOx]
  });
});
