/* =============================================================
 * templates/g5_math_u2.js — 케이퀴즈: 5학년 1학기 2단원 「약수와 배수」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g5_math_u2): l01 약수 · l02 배수 · l03 약수와 배수의 관계 ·
 *   l04 공약수와 최대공약수 · l05 공배수와 최소공배수 · l06 마무리
 * 성취기준 [6수01-02](약수·배수)·[6수01-03](최대공약수·최소공배수)
 *
 * 원칙: 순수 수 개념 — 시각자산 무의존. 정답은 코드가 계산.
 *   ⭐ 최대공약수·최소공배수는 **다음 단원(약분과 통분)의 뿌리**다.
 *      여기가 흔들리면 분수 전체가 무너진다 → concept 을 세밀하게 심는다.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{n}의 약수는 모두 몇 개일까요?"                 → 약수 개수
 *     "{a}과(와) {b}의 최대공약수는 얼마일까요?"       → gcd(a,b)
 *     "{a}과(와) {b}의 최소공배수는 얼마일까요?"       → lcm(a,b)
 *     "{a}은(는) {b}의 배수입니다"  (참거짓)           → a % b === 0
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
  function divisors(n) {
    var out = [];
    for (var i = 1; i <= n; i++) if (n % i === 0) out.push(i);
    return out;
  }

  /* ── 약수의 개수 ─────────────────────────────────────────────────────── */
  var divCount = {
    id: 't_div_count', type: 'param', difficulty: 1, concept: '약수',
    itemType: 'short',
    gen: function (r) { return { n: r.int(12, 96) }; },
    render: function (p) { return p.n + '의 약수는 모두 몇 개일까요?'; },
    answer: function (p) { return divisors(p.n).length; },
    explain: function (p) {
      return p.n + '의 약수: ' + divisors(p.n).join(', ') + ' → ' + divisors(p.n).length + '개';
    }
  };

  /* ── 가장 큰 약수(자기 자신 제외) ───────────────────────────────────── */
  var divBiggest = {
    id: 't_div_big', type: 'param', difficulty: 2, concept: '약수',
    itemType: 'short',
    gen: function (r) { return { n: r.int(20, 99) }; },
    render: function (p) {
      return p.n + '의 약수 중에서 ' + p.n + '을(를) 뺀 가장 큰 약수는 무엇일까요?';
    },
    answer: function (p) {
      var d = divisors(p.n);
      return d[d.length - 2];
    },
    validate: function (p, ans) { return ans >= 1 && divisors(p.n).length >= 2; },
    explain: function (p) {
      var d = divisors(p.n);
      return p.n + '의 약수: ' + d.join(', ') + ' → ' + d[d.length - 2];
    }
  };

  /* ── 배수 판단 (참거짓 — 서바이벌 재료) ────────────────────────────── */
  var multipleOx = {
    id: 't_mul_ox', type: 'param', difficulty: 1, concept: '배수',
    itemType: 'ox',
    gen: function (r) {
      var b = r.int(2, 12);
      var yes = r.pick([true, false]);
      var a = yes ? b * r.int(2, 12) : b * r.int(2, 12) + r.int(1, b - 1);
      return { a: a, b: b };
    },
    render: function (p) { return p.a + '은(는) ' + p.b + '의 배수입니다'; },
    answer: function (p) { return p.a % p.b === 0; },
    validate: function (p) { return p.b >= 2; },
    explain: function (p) {
      return p.a + ' ÷ ' + p.b + ' = ' + Math.floor(p.a / p.b) +
             (p.a % p.b ? ' … ' + (p.a % p.b) + ' → 배수가 아니에요' : ' → 나누어떨어지니 배수예요');
    }
  };

  /* ── 몇 번째 배수 ────────────────────────────────────────────────────── */
  var nthMultiple = {
    id: 't_nth_mul', type: 'param', difficulty: 1, concept: '배수',
    itemType: 'short',
    gen: function (r) { return { b: r.int(3, 15), k: r.int(4, 12) }; },
    render: function (p) { return p.b + '의 배수 중에서 ' + p.k + '번째 수는 무엇일까요?'; },
    answer: function (p) { return p.b * p.k; },
    explain: function (p) { return p.b + ' × ' + p.k + ' = ' + (p.b * p.k); }
  };

  /* ── 최대공약수 (다음 단원 = 약분의 뿌리) ──────────────────────────── */
  var gcdT = {
    id: 't_gcd', type: 'param', difficulty: 2, concept: '최대공약수',
    itemType: 'short',
    gen: function (r) {
      var g = r.int(2, 12);
      return { a: g * r.int(2, 9), b: g * r.int(2, 9) };
    },
    render: function (p) { return p.a + '과(와) ' + p.b + '의 최대공약수는 얼마일까요?'; },
    answer: function (p) { return gcd(p.a, p.b); },
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) {
      return p.a + '과 ' + p.b + '의 공약수 중 가장 큰 수 → ' + gcd(p.a, p.b);
    }
  };

  /* ── 최소공배수 (다음 단원 = 통분의 뿌리) ──────────────────────────── */
  var lcmT = {
    id: 't_lcm', type: 'param', difficulty: 3, concept: '최소공배수',
    itemType: 'short',
    gen: function (r) { return { a: r.int(4, 18), b: r.int(4, 18) }; },
    render: function (p) { return p.a + '과(와) ' + p.b + '의 최소공배수는 얼마일까요?'; },
    answer: function (p) { return lcm(p.a, p.b); },
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) {
      return p.a + '과 ' + p.b + '의 공배수 중 가장 작은 수 → ' + lcm(p.a, p.b) +
             ' (' + p.a + ' × ' + p.b + ' ÷ 최대공약수 ' + gcd(p.a, p.b) + ')';
    }
  };

  /* ── 공약수 판단 (선택형) ──────────────────────────────────────────── */
  var commonDiv = {
    id: 't_common_div', type: 'param', difficulty: 2, concept: '공약수',
    itemType: 'choice',
    gen: function (r) {
      var g = r.int(4, 15);
      return { a: g * r.int(2, 7), b: g * r.int(2, 7) };
    },
    render: function (p) {
      return p.a + '과(와) ' + p.b + '의 공약수가 아닌 것은 무엇일까요?';
    },
    answer: function (p) {
      var g = gcd(p.a, p.b);
      for (var i = 2; i < 100; i++) if (g % i !== 0) return i;   // 공약수가 아닌 가장 작은 수
      return 0;
    },
    distractors: function (p) {
      return divisors(gcd(p.a, p.b)).filter(function (d) { return d > 1; });
    },
    validate: function (p, ans) {
      return ans > 0 && divisors(gcd(p.a, p.b)).length >= 4 && p.a !== p.b;
    },
    explain: function (p) {
      return p.a + '과 ' + p.b + '의 공약수: ' + divisors(gcd(p.a, p.b)).join(', ');
    }
  };

  function src(lesson) { return { grade: 5, subject: 'math', unit: 'u2', lesson: lesson }; }

  reg('g5_math_u2_l01', { source: src('l01'), fixed: [], templates: [divCount, divBiggest] });
  reg('g5_math_u2_l02', { source: src('l02'), fixed: [], templates: [nthMultiple, multipleOx] });
  reg('g5_math_u2_l03', { source: src('l03'), fixed: [], templates: [multipleOx, divCount] });
  reg('g5_math_u2_l04', { source: src('l04'), fixed: [], templates: [gcdT, commonDiv] });
  reg('g5_math_u2_l05', { source: src('l05'), fixed: [], templates: [lcmT] });
  reg('g5_math_u2_l06', { source: src('l06'), fixed: [],
    templates: [divCount, nthMultiple, gcdT, lcmT, multipleOx] });

  reg('g5_math_u2', {
    source: { grade: 5, subject: 'math', unit: 'u2', lesson: 'all' }, fixed: [],
    templates: [divCount, divBiggest, nthMultiple, multipleOx, gcdT, lcmT, commonDiv]
  });
});
