/* =============================================================
 * templates/g3_math_u5.js — 케이퀴즈: 3학년 1학기 5단원 「길이와 시간」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치 + 복합 단위)
 *
 * 차시(g3_math_u5): l01 도입(퀴즈X) · l02 mm · l03 어림/재기(시각,제외) · l04 km ·
 *   l05 거리 어림(시각,제외) · l06 초 · l07 시간 덧셈 · l08 시간 뺄셈 ·
 *   l09 놀이(퀴즈X) · l10 마무리
 * 성취기준 [4수03-03~06](mm·km·초 단위, 시간의 합·차)
 *
 * 원칙: 어림·자 읽기는 시각이라 제외. 단위 변환은 정방향(복합→단일)만 numeric으로,
 *   시간 덧셈/뺄셈은 받아올림·받아내림 없는 것만(B+D<60 / B>D 보장) 복합표현으로.
 *   정답은 코드가 계산, test가 동일 수식 독립 재계산. 시간 뺄셈 − 는 U+2212.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{a}cm {b}mm는 몇 mm일까요?"                     → a·10+b
 *     "{a}cm는 몇 mm일까요?"                           → a·10
 *     "{a}km {b}m는 몇 m일까요?"                       → a·1000+b
 *     "{a}km는 몇 m일까요?"                            → a·1000
 *     "{a}분 {b}초는 몇 초일까요?"                     → a·60+b
 *     "{a}분은 몇 초일까요?"                           → a·60
 *     "{A}시간 {B}분 + {C}시간 {D}분은 몇 시간 몇 분일까요?" → "(A+C)시간 (B+D)분"
 *     "{A}시간 {B}분 − {C}시간 {D}분은 몇 시간 몇 분일까요?" → "(A−C)시간 (B−D)분"
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var MINUS = '\u2212';

  function numConv(id, diff, genFn, renderFn, ansFn) {
    return {
      id: id, type: 'param', difficulty: diff, inRange: function (v) { return v >= 1; },
      gen: genFn, render: renderFn, answer: ansFn,
      distractors: function (p) { var a = ansFn(p); return [a + 10, a - 10, a + 1, a - 1]; },
      explain: function (p) { return renderFn(p).replace('일까요?', '') + ' ' + ansFn(p) + '이에요'; }
    };
  }

  // ── 길이: mm ─────────────────────────────────────────────────────────────
  var cmMmToMm = numConv('t_cmmm_mm', 2,
    function (r) { return { a: r.int(1, 20), b: r.int(1, 9) }; },
    function (p) { return p.a + 'cm ' + p.b + 'mm는 몇 mm일까요?'; },
    function (p) { return p.a * 10 + p.b; });
  var cmToMm = numConv('t_cm_mm', 1,
    function (r) { return { a: r.int(1, 30) }; },
    function (p) { return p.a + 'cm는 몇 mm일까요?'; },
    function (p) { return p.a * 10; });

  // ── 거리: km ─────────────────────────────────────────────────────────────
  var kmMToM = numConv('t_kmm_m', 2,
    function (r) { return { a: r.int(1, 9), b: r.int(100, 900) }; },
    function (p) { return p.a + 'km ' + p.b + 'm는 몇 m일까요?'; },
    function (p) { return p.a * 1000 + p.b; });
  var kmToM = numConv('t_km_m', 1,
    function (r) { return { a: r.int(1, 9) }; },
    function (p) { return p.a + 'km는 몇 m일까요?'; },
    function (p) { return p.a * 1000; });

  // ── 시간: 초 ─────────────────────────────────────────────────────────────
  var minSecToSec = numConv('t_minsec_sec', 2,
    function (r) { return { a: r.int(1, 9), b: r.int(1, 59) }; },
    function (p) { return p.a + '분 ' + p.b + '초는 몇 초일까요?'; },
    function (p) { return p.a * 60 + p.b; });
  var minToSec = numConv('t_min_sec', 1,
    function (r) { return { a: r.int(1, 9) }; },
    function (p) { return p.a + '분은 몇 초일까요?'; },
    function (p) { return p.a * 60; });

  // ── 시간 덧셈 (받아올림 없음: B+D<60) ────────────────────────────────────
  var timeAddTemplate = {
    id: 't_time_add', type: 'param', difficulty: 3, choiceCount: 4,
    gen: function (r) { return { A: r.int(1, 5), B: r.int(1, 29), C: r.int(1, 4), D: r.int(1, 29) }; },
    render: function (p) { return p.A + '시간 ' + p.B + '분 + ' + p.C + '시간 ' + p.D + '분은 몇 시간 몇 분일까요?'; },
    answer: function (p) { return (p.A + p.C) + '시간 ' + (p.B + p.D) + '분'; },
    distractors: function (p) {
      var h = p.A + p.C, m = p.B + p.D;
      return [(h + 1) + '시간 ' + m + '분', h + '시간 ' + (m - 1) + '분', (h - 1) + '시간 ' + m + '분'];
    },
    explain: function (p) { return (p.A + p.C) + '시간 ' + (p.B + p.D) + '분이에요'; }
  };

  // ── 시간 뺄셈 (받아내림 없음: A>C, B>D) ──────────────────────────────────
  var timeSubTemplate = {
    id: 't_time_sub', type: 'param', difficulty: 3, choiceCount: 4,
    gen: function (r) {
      var A = r.int(3, 9), C = r.int(1, A - 1);
      var B = r.int(11, 50), D = r.int(1, B - 1);
      return { A: A, B: B, C: C, D: D };
    },
    render: function (p) { return p.A + '시간 ' + p.B + '분 ' + MINUS + ' ' + p.C + '시간 ' + p.D + '분은 몇 시간 몇 분일까요?'; },
    answer: function (p) { return (p.A - p.C) + '시간 ' + (p.B - p.D) + '분'; },
    distractors: function (p) {
      var h = p.A - p.C, m = p.B - p.D;
      return [(h + 1) + '시간 ' + m + '분', h + '시간 ' + (m + 1) + '분', (h + 1) + '시간 ' + (m + 1) + '분'];
    },
    explain: function (p) { return (p.A - p.C) + '시간 ' + (p.B - p.D) + '분이에요'; }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 3, subject: 'math', unit: 'u5', lesson: lesson }; }

  reg('g3_math_u5_l02', { source: src('l02'), fixed: [], templates: [cmToMm, cmMmToMm] });
  reg('g3_math_u5_l04', { source: src('l04'), fixed: [], templates: [kmToM, kmMToM] });
  reg('g3_math_u5_l06', { source: src('l06'), fixed: [], templates: [minToSec, minSecToSec] });
  reg('g3_math_u5_l07', { source: src('l07'), fixed: [], templates: [timeAddTemplate] });
  reg('g3_math_u5_l08', { source: src('l08'), fixed: [], templates: [timeSubTemplate] });
  reg('g3_math_u5_l10', { source: src('l10'), fixed: [], templates: [cmToMm, cmMmToMm, kmToM, kmMToM, minToSec, minSecToSec, timeAddTemplate, timeSubTemplate] });

  reg('g3_math_u5', {
    source: { grade: 3, subject: 'math', unit: 'u5', lesson: 'all' }, fixed: [],
    templates: [cmToMm, cmMmToMm, kmToM, kmMToM, minToSec, minSecToSec, timeAddTemplate, timeSubTemplate]
  });
});
