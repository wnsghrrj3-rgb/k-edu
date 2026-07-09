/* =============================================================
 * templates/g2_math_u6.js — 케이퀴즈: 2학년 1학기 6단원 「곱셈」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g2_math_u6): l01 도입(퀴즈X) · l02 뛰어 세기 · l03 묶어 세기 ·
 *   l04·l05 몇 배 · l06 곱셈 · l07 곱셈식 · l08 정리·평가 · l09 창작(퀴즈X)
 * 성취기준 [2수01-08~09](곱셈의 이해·곱셈식)
 *
 * 원칙: 곱셈 도입 — 묶어 세기·몇 배·곱셈식이 모두 a×b 구조. 전 문항 수치 파라메트릭.
 *   곱셈구구 범위(2~9)로 제한. test가 동일 수식으로 독립 재계산.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{a}씩 {b}번 뛰어 세면 얼마일까요?"                  → a×b
 *     "{a}씩 {b} 묶음은 모두 몇 개일까요?"                  → a×b
 *     "{a}의 {b} 배는 얼마일까요?"                          → a×b
 *     "{a} × {b} = ?"  (× = U+00D7)                        → a×b
 *     "{a}을(를) {b}번 더한 것을 곱셈식으로 나타내면?"       → "a × b" (문자열)
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var MUL = '\u00D7';   // ×

  var nonneg = function (v) { return v >= 0; };

  // ── l02: 묶음 뛰어 세기 ──────────────────────────────────────────────────
  var jumpCount = {
    id: 't_jump', type: 'param', difficulty: 1,
    gen: function (r) { return { a: r.int(2, 9), b: r.int(2, 9) }; },
    render: function (p) { return p.a + '씩 ' + p.b + '번 뛰어 세면 얼마일까요?'; },
    answer: function (p) { return p.a * p.b; }, inRange: nonneg,
    explain: function (p) { return p.a + '씩 ' + p.b + '번이면 ' + (p.a * p.b) + '이에요'; }
  };

  // ── l03: 묶어 세기 (몇씩 몇 묶음) ────────────────────────────────────────
  var groupCount = {
    id: 't_group', type: 'param', difficulty: 1,
    gen: function (r) { return { a: r.int(2, 9), b: r.int(2, 9) }; },
    render: function (p) { return p.a + '씩 ' + p.b + ' 묶음은 모두 몇 개일까요?'; },
    answer: function (p) { return p.a * p.b; }, inRange: nonneg,
    explain: function (p) { return p.a + '씩 ' + p.b + ' 묶음은 ' + (p.a * p.b) + '개예요'; }
  };

  // ── l04·l05: 몇 배 ───────────────────────────────────────────────────────
  var timesOf = {
    id: 't_times', type: 'param', difficulty: 2,
    gen: function (r) { return { a: r.int(2, 9), b: r.int(2, 9) }; },
    render: function (p) { return p.a + '의 ' + p.b + ' 배는 얼마일까요?'; },
    answer: function (p) { return p.a * p.b; }, inRange: nonneg,
    explain: function (p) { return p.a + '의 ' + p.b + ' 배는 ' + (p.a * p.b) + '이에요'; }
  };

  // ── l06: 곱셈식 계산 ─────────────────────────────────────────────────────
  var multiplyValue = {
    id: 't_mul', type: 'param', difficulty: 2,
    gen: function (r) { return { a: r.int(2, 9), b: r.int(2, 9) }; },
    render: function (p) { return p.a + ' ' + MUL + ' ' + p.b + ' = ?'; },
    answer: function (p) { return p.a * p.b; }, inRange: nonneg,
    explain: function (p) { return p.a + ' ' + MUL + ' ' + p.b + ' = ' + (p.a * p.b); }
  };

  // ── l07: 곱셈식으로 나타내기 (반복 덧셈 → 곱셈식, 문자열 정답) ───────────
  var addToMul = {
    id: 't_add_to_mul', type: 'pick', difficulty: 2, choiceCount: 4,
    gen: function (r) { return { a: r.int(2, 9), b: r.int(2, 9) }; },
    render: function (p) { return p.a + '을(를) ' + p.b + '번 더한 것을 곱셈식으로 나타내면?'; },
    answer: function (p) { return p.a + ' ' + MUL + ' ' + p.b; },
    distractors: function (p) {
      return [
        p.b + ' ' + MUL + ' ' + p.a,
        p.a + ' ' + MUL + ' ' + (p.b + 1),
        (p.a + 1) + ' ' + MUL + ' ' + p.b
      ];
    },
    explain: function (p) { return p.a + '을(를) ' + p.b + '번 더하면 ' + p.a + ' ' + MUL + ' ' + p.b + '예요'; }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 2, subject: 'math', unit: 'u6', lesson: lesson }; }

  reg('g2_math_u6_l02', { source: src('l02'), fixed: [], templates: [jumpCount] });
  reg('g2_math_u6_l03', { source: src('l03'), fixed: [], templates: [groupCount] });
  reg('g2_math_u6_l04', { source: src('l04'), fixed: [], templates: [timesOf] });
  reg('g2_math_u6_l05', { source: src('l05'), fixed: [], templates: [timesOf, groupCount] });
  reg('g2_math_u6_l06', { source: src('l06'), fixed: [], templates: [multiplyValue] });
  reg('g2_math_u6_l07', { source: src('l07'), fixed: [], templates: [addToMul, multiplyValue] });
  reg('g2_math_u6_l08', { source: src('l08'), fixed: [], templates: [groupCount, timesOf, multiplyValue, addToMul] });

  reg('g2_math_u6', {
    source: { grade: 2, subject: 'math', unit: 'u6', lesson: 'all' }, fixed: [],
    templates: [jumpCount, groupCount, timesOf, multiplyValue, addToMul]
  });
});
