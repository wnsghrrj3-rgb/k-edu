/* =============================================================
 * templates/g3_math_u4.js — 케이퀴즈: 3학년 1학기 4단원 「곱셈」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g3_math_u4): l01 도입(퀴즈X) · l02 (몇십)×(몇) · l03 (몇십몇)×(몇) 올림없음 ·
 *   l04 십의 자리 올림 · l05 일의 자리 올림 · l06 올림 두 번 ·
 *   l07 활동(퀴즈X) · l08 마무리
 * 성취기준 [4수01-04](두 자리 수 × 한 자리 수)
 *
 * 원칙: 전 문항 "a × b = ?" 형태 → g2u6 곱셈식 재계산기(× = U+00D7) 그대로 공유(신규 0).
 *   차시별 올림 조건(없음/십의자리/일의자리/두 번)은 gen에서 자릿수 곱을 직접 제어해
 *   정확히 만족시킴(정답은 코드가 계산). 값 요행이 아닌 조건 생성.
 *
 *   재계산기 매칭(문구 절대 변경 금지 · g2u6 기존 브랜치 공유):
 *     "{a} × {b} = ?"  (× = U+00D7)            → a×b
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var MULT = '\u00D7';

  function mulItem(id, diff, genFn) {
    return {
      id: id, type: 'param', difficulty: diff, inRange: function (v) { return v >= 1; },
      gen: genFn,
      render: function (p) { return p.a + ' ' + MULT + ' ' + p.b + ' = ?'; },
      answer: function (p) { return p.a * p.b; },
      distractors: function (p) { var m = p.a * p.b; return [m + p.b, m - p.b, m + 10, m - 10]; },
      explain: function (p) { return p.a + ' ' + MULT + ' ' + p.b + ' = ' + (p.a * p.b); }
    };
  }

  // (몇십)×(몇): a = 몇십, 올림 없음
  var mulTens = mulItem('t_mul_tens', 1, function (r) {
    return { a: r.int(1, 9) * 10, b: r.int(2, 9) };
  });
  // (몇십몇)×(몇) 올림 없음: d1·b<10 && d0·b<10
  var mulNoCarry = mulItem('t_mul_nocarry', 1, function (r) {
    var b, d1, d0;
    do { b = r.int(2, 9); d1 = r.int(1, 9); d0 = r.int(1, 9); }
    while (!(d1 * b < 10 && d0 * b < 10));
    return { a: d1 * 10 + d0, b: b };
  });
  // 십의 자리 올림: d1·b>=10 && d0·b<10
  var mulTensCarry = mulItem('t_mul_tenscarry', 2, function (r) {
    var b, d1, d0;
    do { b = r.int(2, 9); d1 = r.int(1, 9); d0 = r.int(1, 9); }
    while (!(d1 * b >= 10 && d0 * b < 10));
    return { a: d1 * 10 + d0, b: b };
  });
  // 일의 자리 올림: d0·b>=10 && d1·b<10 (십의 자리 자체 곱은 올림 없음)
  var mulOnesCarry = mulItem('t_mul_onescarry', 2, function (r) {
    var b, d1, d0;
    do { b = r.int(2, 9); d1 = r.int(1, 9); d0 = r.int(1, 9); }
    while (!(d0 * b >= 10 && d1 * b < 10));
    return { a: d1 * 10 + d0, b: b };
  });
  // 올림 두 번: d0·b>=10 && d1·b>=10
  var mulBothCarry = mulItem('t_mul_bothcarry', 3, function (r) {
    var b, d1, d0;
    do { b = r.int(2, 9); d1 = r.int(1, 9); d0 = r.int(1, 9); }
    while (!(d0 * b >= 10 && d1 * b >= 10));
    return { a: d1 * 10 + d0, b: b };
  });

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 3, subject: 'math', unit: 'u4', lesson: lesson }; }

  reg('g3_math_u4_l02', { source: src('l02'), fixed: [], templates: [mulTens] });
  reg('g3_math_u4_l03', { source: src('l03'), fixed: [], templates: [mulNoCarry] });
  reg('g3_math_u4_l04', { source: src('l04'), fixed: [], templates: [mulTensCarry] });
  reg('g3_math_u4_l05', { source: src('l05'), fixed: [], templates: [mulOnesCarry] });
  reg('g3_math_u4_l06', { source: src('l06'), fixed: [], templates: [mulBothCarry] });
  reg('g3_math_u4_l08', { source: src('l08'), fixed: [], templates: [mulTens, mulNoCarry, mulTensCarry, mulOnesCarry, mulBothCarry] });

  reg('g3_math_u4', {
    source: { grade: 3, subject: 'math', unit: 'u4', lesson: 'all' }, fixed: [],
    templates: [mulTens, mulNoCarry, mulTensCarry, mulOnesCarry, mulBothCarry]
  });
});
