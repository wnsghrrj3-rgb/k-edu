/* =============================================================
 * templates/g5_math_u1.js — 케이퀴즈: 5학년 1학기 1단원 「자연수의 혼합 계산」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g5_math_u1): l01 덧셈과 뺄셈이 섞인 식 · l02 곱셈과 나눗셈이 섞인 식 ·
 *   l03 덧셈·뺄셈·곱셈이 섞인 식 · l04 덧셈·뺄셈·나눗셈이 섞인 식 ·
 *   l05 사칙연산이 섞인 식 · l06 마무리
 * 성취기준 [6수01-01](혼합 계산의 계산 순서)
 *
 * 원칙: 순수 수 연산 — 시각자산 무의존.
 *   ⭐ 이 단원의 핵심은 답이 아니라 **순서**다. 그래서 ox 문항으로
 *      "괄호 먼저" · "곱나눗셈 먼저" 오개념을 직접 때린다(서바이벌 재료이기도 하다).
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{식} 을(를) 계산하면 얼마일까요?"       → 식의 값
 *     "{식} = {v} 입니다"  (참거짓)            → 실제 값과 비교
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var MINUS = '\u2212';

  function ev(s) {
    // 안전한 사칙 평가 (수·연산자·괄호만)
    if (!/^[\d\s+\-*/().]+$/.test(s)) return NaN;
    /* eslint-disable no-new-func */
    return Function('"use strict";return (' + s + ')')();
  }
  function show(s) { return s.replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/-/g, ' ' + MINUS + ' '); }

  /* ── ① 덧셈·뺄셈 혼합 (괄호 유무가 갈린다) ─────────────────────────── */
  var addSub = {
    id: 't_addsub', type: 'param', difficulty: 1, concept: '덧셈과 뺄셈이 섞인 식',
    itemType: 'short', inRange: function (v) { return v >= 0; },
    gen: function (r) {
      var a = r.int(30, 90), b = r.int(10, 40), c = r.int(5, 30);
      var paren = r.pick([true, false]);
      return { a: a, b: b, c: c, paren: paren };
    },
    render: function (p) {
      var s = p.paren ? (p.a + '-(' + p.b + '+' + p.c + ')') : (p.a + '-' + p.b + '+' + p.c);
      return show(s) + ' 을(를) 계산하면 얼마일까요?';
    },
    answer: function (p) {
      return p.paren ? (p.a - (p.b + p.c)) : (p.a - p.b + p.c);
    },
    validate: function (p, ans) { return ans >= 0; },
    explain: function (p) {
      return p.paren ? '괄호 안을 먼저: ' + p.b + ' + ' + p.c + ' = ' + (p.b + p.c) +
                       ' → ' + p.a + ' ' + MINUS + ' ' + (p.b + p.c) + ' = ' + (p.a - p.b - p.c)
                     : '앞에서부터 차례로 계산해요 → ' + (p.a - p.b + p.c);
    }
  };

  /* ── ② 곱셈·나눗셈 혼합 ─────────────────────────────────────────────── */
  var mulDiv = {
    id: 't_muldiv', type: 'param', difficulty: 2, concept: '곱셈과 나눗셈이 섞인 식',
    itemType: 'short', inRange: function (v) { return v > 0; },
    gen: function (r) {
      var b = r.int(2, 9), c = r.int(2, 9);
      var q = r.int(2, 20);
      return { a: b * q, b: b, c: c, paren: r.pick([true, false]) };
    },
    render: function (p) {
      var s = p.paren ? (p.a + '/(' + p.b + '*' + p.c + ')') : (p.a + '/' + p.b + '*' + p.c);
      return show(s) + ' 을(를) 계산하면 얼마일까요?';
    },
    answer: function (p) {
      return p.paren ? (p.a / (p.b * p.c)) : ((p.a / p.b) * p.c);
    },
    validate: function (p, ans) { return ans > 0 && Number.isInteger(ans); },
    explain: function (p) {
      return p.paren ? '괄호 먼저: ' + p.b + ' × ' + p.c + ' = ' + (p.b * p.c) + ' → ' + p.a + ' ÷ ' + (p.b * p.c)
                     : '앞에서부터: ' + p.a + ' ÷ ' + p.b + ' = ' + (p.a / p.b) + ' → × ' + p.c;
    }
  };

  /* ── ③ 사칙 혼합 (핵심 차시) ────────────────────────────────────────── */
  var mixAll = {
    id: 't_mix_all', type: 'param', difficulty: 3, concept: '사칙연산이 섞인 식',
    itemType: 'short', inRange: function (v) { return v >= 0; },
    gen: function (r) {
      var b = r.int(2, 9);
      var q = r.int(2, 12);
      return { a: r.int(20, 80), b: b, ab: b * q, c: r.int(2, 9), d: r.int(3, 20) };
    },
    render: function (p) {
      var s = p.a + '+' + p.ab + '/' + p.b + '*' + p.c + '-' + p.d;
      return show(s) + ' 을(를) 계산하면 얼마일까요?';
    },
    answer: function (p) { return p.a + (p.ab / p.b) * p.c - p.d; },
    validate: function (p, ans) { return ans >= 0 && Number.isInteger(ans); },
    explain: function (p) {
      var m = (p.ab / p.b) * p.c;
      return '곱셈·나눗셈 먼저: ' + p.ab + ' ÷ ' + p.b + ' × ' + p.c + ' = ' + m +
             ' → ' + p.a + ' + ' + m + ' ' + MINUS + ' ' + p.d + ' = ' + (p.a + m - p.d);
    }
  };

  /* ── ④ 계산 순서 오개념 (참거짓) — 이 단원의 심장 ─────────────────── */
  var orderOx = {
    id: 't_order_ox', type: 'param', difficulty: 2, concept: '계산 순서',
    itemType: 'ox',
    gen: function (r) {
      var a = r.int(3, 12), b = r.int(2, 9), c = r.int(2, 9);
      var right = a + b * c;
      var wrong = (a + b) * c;                    // 앞에서부터 계산하는 전형적 오개념
      var claim = r.pick([right, wrong]);
      return { a: a, b: b, c: c, claim: claim };
    },
    render: function (p) {
      return p.a + ' + ' + p.b + ' × ' + p.c + ' = ' + p.claim + ' 입니다';
    },
    answer: function (p) { return p.claim === (p.a + p.b * p.c); },
    validate: function (p) { return (p.a + p.b * p.c) !== ((p.a + p.b) * p.c); },
    explain: function (p) {
      return '곱셈을 먼저 해요 → ' + p.b + ' × ' + p.c + ' = ' + (p.b * p.c) +
             ' → ' + p.a + ' + ' + (p.b * p.c) + ' = ' + (p.a + p.b * p.c);
    }
  };

  /* ── ⑤ 괄호의 힘 (선택형) ──────────────────────────────────────────── */
  var parenChoice = {
    id: 't_paren', type: 'param', difficulty: 3, concept: '계산 순서',
    itemType: 'choice',
    gen: function (r) {
      var a = r.int(4, 15), b = r.int(2, 9), c = r.int(2, 8);
      return { a: a, b: b, c: c };
    },
    render: function (p) {
      return '(' + p.a + ' + ' + p.b + ') × ' + p.c + ' 을(를) 계산하면 얼마일까요?';
    },
    answer: function (p) { return (p.a + p.b) * p.c; },
    distractors: function (p) {
      return [p.a + p.b * p.c, p.a * p.c + p.b, (p.a + p.b) * p.c + p.c];   // 오개념 교란
    },
    explain: function (p) {
      return '괄호 먼저: ' + p.a + ' + ' + p.b + ' = ' + (p.a + p.b) + ' → × ' + p.c + ' = ' + ((p.a + p.b) * p.c);
    }
  };

  function src(lesson) { return { grade: 5, subject: 'math', unit: 'u1', lesson: lesson }; }

  reg('g5_math_u1_l01', { source: src('l01'), fixed: [], templates: [addSub] });
  reg('g5_math_u1_l02', { source: src('l02'), fixed: [], templates: [mulDiv] });
  reg('g5_math_u1_l03', { source: src('l03'), fixed: [], templates: [orderOx, parenChoice] });
  reg('g5_math_u1_l04', { source: src('l04'), fixed: [], templates: [addSub, mulDiv] });
  reg('g5_math_u1_l05', { source: src('l05'), fixed: [], templates: [mixAll, parenChoice] });
  reg('g5_math_u1_l06', { source: src('l06'), fixed: [],
    templates: [addSub, mulDiv, mixAll, orderOx, parenChoice] });

  reg('g5_math_u1', {
    source: { grade: 5, subject: 'math', unit: 'u1', lesson: 'all' }, fixed: [],
    templates: [addSub, mulDiv, mixAll, orderOx, parenChoice]
  });
});
