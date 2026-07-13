/* =============================================================
 * templates/g6_math_u4.js — 케이퀴즈: 6학년 1학기 4단원 「비와 비율」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g6_math_u4): l01 두 수의 비 · l02 비율 · l03 비율을 분수·소수로 ·
 *   l04 백분율 · l05 백분율의 활용(할인율·득점률) · l06 마무리
 * 성취기준 [6수04-01](비와 비율)·[6수04-02](백분율)
 *
 * ⭐ 이 단원의 최대 오개념: **기준량과 비교하는 양을 뒤집기.**
 *    "3에 대한 2의 비" 를 3/2 로 쓰는 아이가 반드시 나온다(정답은 2/3).
 *    → 교란지·ox 로 이것만 집요하게 때린다.
 *
 * 백분율은 정수로만 생성 → numpad 로 낼 수 있다(찍기 방지).
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
  function frRed(n, d) { var g = gcd(n, d) || 1; return (n / g) + '/' + (d / g); }

  /* ── 백분율 구하기 (수 입력) ───────────────────────────────────────── */
  var percent = {
    id: 't_percent', type: 'param', difficulty: 2, concept: '백분율',
    itemType: 'short',
    gen: function (r) {
      var base = r.pick([20, 25, 40, 50, 80, 100, 200, 250, 400, 500]);
      var pct = r.int(1, 20) * 5;                    // 5% 단위 → 비교하는 양이 정수
      return { base: base, part: base * pct / 100 };
    },
    render: function (p) {
      return '전체 ' + p.base + '명 중에서 ' + p.part + '명이 안경을 썼어요. 몇 %일까요?';
    },
    answer: function (p) { return Math.round(p.part / p.base * 100); },
    validate: function (p, ans) { return Number.isInteger(p.part) && ans > 0 && ans <= 100; },
    explain: function (p) {
      return p.part + ' ÷ ' + p.base + ' × 100 = ' + Math.round(p.part / p.base * 100) + '%';
    }
  };

  /* ── 백분율 → 비교하는 양 (수 입력) ───────────────────────────────── */
  var percentOf = {
    id: 't_percent_of', type: 'param', difficulty: 2, concept: '백분율의 활용',
    itemType: 'short',
    gen: function (r) {
      var base = r.pick([200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000]);
      var pct = r.int(1, 19) * 5;
      return { base: base, pct: pct };
    },
    render: function (p) {
      return p.base + '원의 ' + p.pct + '%는 얼마일까요?';
    },
    answer: function (p) { return p.base * p.pct / 100; },
    validate: function (p, ans) { return Number.isInteger(ans) && ans > 0; },
    explain: function (p) {
      return p.base + ' × ' + p.pct + ' ÷ 100 = ' + (p.base * p.pct / 100) + '원';
    }
  };

  /* ── 할인가 (수 입력 — 생활 속) ───────────────────────────────────── */
  var discount = {
    id: 't_discount', type: 'param', difficulty: 3, concept: '백분율의 활용',
    itemType: 'short',
    gen: function (r) {
      var base = r.pick([2000, 3000, 4000, 5000, 8000, 10000, 12000, 15000, 20000]);
      var pct = r.pick([10, 15, 20, 25, 30, 40, 50]);
      return { base: base, pct: pct };
    },
    render: function (p) {
      return p.base + '원짜리 물건을 ' + p.pct + '% 할인해서 팔아요. 얼마를 내야 할까요?';
    },
    answer: function (p) { return p.base - p.base * p.pct / 100; },
    validate: function (p, ans) { return Number.isInteger(ans) && ans > 0; },
    explain: function (p) {
      var off = p.base * p.pct / 100;
      return '할인액 ' + off + '원 → ' + p.base + ' \u2212 ' + off + ' = ' + (p.base - off) + '원';
    }
  };

  /* ── 비를 분수로 (선택형 — 기준량 뒤집기 오개념) ──────────────────── */
  var ratioFrac = {
    id: 't_ratio_frac', type: 'param', difficulty: 2, concept: '비와 비율',
    itemType: 'choice',
    gen: function (r) { return { a: r.int(2, 12), b: r.int(2, 12) }; },
    render: function (p) {
      return p.b + '에 대한 ' + p.a + '의 비를 분수로 나타내면 무엇일까요?';
    },
    answer: function (p) { return frRed(p.a, p.b); },
    distractors: function (p) {
      var right = frRed(p.a, p.b);
      return [
        frRed(p.b, p.a),                             // ⚠️ 기준량 뒤집기 (최대 오개념)
        frRed(p.a, p.a + p.b),
        frRed(p.a + p.b, p.b)
      ].filter(function (x) { return x !== right; });
    },
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) {
      return '"~에 대한" 앞이 기준량(분모) → ' + frRed(p.a, p.b);
    }
  };

  /* ── 기준량 뒤집기 정면 타격 (참거짓 — 서바이벌 재료) ─────────────── */
  var baseOx = {
    id: 't_base_ox', type: 'param', difficulty: 3, concept: '비와 비율',
    itemType: 'ox',
    gen: function (r) {
      var a = r.int(2, 12), b = r.int(2, 12);
      return { a: a, b: b, claim: r.pick([frRed(a, b), frRed(b, a)]) };
    },
    render: function (p) {
      return p.b + '에 대한 ' + p.a + '의 비율은 ' + p.claim + ' 입니다';
    },
    answer: function (p) { return p.claim === frRed(p.a, p.b); },
    validate: function (p) { return p.a !== p.b && frRed(p.a, p.b) !== frRed(p.b, p.a); },
    explain: function (p) {
      return '기준량은 "~에 대한" 앞의 수(' + p.b + ') → 분모. 정답은 ' + frRed(p.a, p.b);
    }
  };

  function src(lesson) { return { grade: 6, subject: 'math', unit: 'u4', lesson: lesson }; }

  reg('g6_math_u4_l01', { source: src('l01'), fixed: [], templates: [ratioFrac, baseOx] });
  reg('g6_math_u4_l02', { source: src('l02'), fixed: [], templates: [ratioFrac] });
  reg('g6_math_u4_l04', { source: src('l04'), fixed: [], templates: [percent] });
  reg('g6_math_u4_l05', { source: src('l05'), fixed: [], templates: [percentOf, discount] });
  reg('g6_math_u4_l06', { source: src('l06'), fixed: [],
    templates: [ratioFrac, percent, percentOf, discount, baseOx] });

  reg('g6_math_u4', {
    source: { grade: 6, subject: 'math', unit: 'u4', lesson: 'all' }, fixed: [],
    templates: [ratioFrac, percent, percentOf, discount, baseOx]
  });
});
