/* =============================================================
 * templates/g3_math_u3.js — 케이퀴즈: 3학년 1학기 3단원 「나눗셈」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g3_math_u3): l01 도입(퀴즈X) · l02 똑같이 나누기(등분제) · l03 묶어 덜기(포함제) ·
 *   l04 나눗셈식 · l05 곱셈과 나눗셈의 관계 · l06 곱셈구구로 몫 · l07 해결 · l08 마무리
 * 성취기준 [4수01-06~07](나눗셈의 의미·몫, 곱셈과 나눗셈 관계)
 *
 * 원칙: 3학년 1학기는 나머지 없는 나눗셈 → 전부 나누어떨어지게 생성(a = b × q).
 *   전 문항 수치 파라메트릭, 정답은 코드가 계산(q). test가 동일 수식 독립 재계산.
 *   ÷ 는 U+00F7. 등분/포함/관계는 문장형이나 재계산은 수치만 파싱(물건명 무관).
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{a} ÷ {b} = ?"  (÷ = U+00F7)                                  → a÷b
 *     "…{a}개를 {b}명에게 똑같이 나누어 주면 한 명이 몇 개씩 …?"      → a÷b (등분)
 *     "…{a}개를 {b}개씩 묶으면 몇 묶음이 될까요?"                     → a÷b (포함)
 *     "어떤 수에 {b}을(를) 곱하면 {a}이(가) 됩니다. 어떤 수는 …?"     → a÷b (관계)
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var DIV = '\u00F7';
  var THINGS = ['사탕', '구슬', '색연필', '딸기', '쿠키', '색종이'];

  // 나누어떨어지는 (a=b×q) 생성 헬퍼
  function genDiv(r) {
    var b = r.int(2, 9), q = r.int(2, 9);
    return { a: b * q, b: b, q: q };
  }

  // ── ① 나눗셈식 몫 (choice, numeric) ──────────────────────────────────────
  var divExprTemplate = {
    id: 't_div_expr', type: 'param', difficulty: 2, inRange: function (v) { return v >= 1; },
    gen: genDiv,
    render: function (p) { return p.a + ' ' + DIV + ' ' + p.b + ' = ?'; },
    answer: function (p) { return p.q; },
    distractors: function (p) { return [p.q + 1, p.q - 1, p.q + 2]; },
    explain: function (p) { return p.a + ' ' + DIV + ' ' + p.b + ' = ' + p.q; }
  };

  // ── ② 등분제: a개를 b명에게 똑같이 (choice, numeric) ─────────────────────
  var divShareTemplate = {
    id: 't_div_share', type: 'param', difficulty: 1, inRange: function (v) { return v >= 1; },
    gen: function (r) { var d = genDiv(r); d.thing = r.pick(THINGS); return d; },
    render: function (p) { return p.thing + ' ' + p.a + '개를 ' + p.b + '명에게 똑같이 나누어 주면 한 명이 몇 개씩 가질까요?'; },
    answer: function (p) { return p.q; },
    distractors: function (p) { return [p.q + 1, p.q - 1, p.q + 2]; },
    explain: function (p) { return p.a + ' ' + DIV + ' ' + p.b + ' = ' + p.q + '(개)예요'; }
  };

  // ── ③ 포함제: a개를 b개씩 묶으면 몇 묶음 (choice, numeric) ────────────────
  var divGroupTemplate = {
    id: 't_div_group', type: 'param', difficulty: 1, inRange: function (v) { return v >= 1; },
    gen: function (r) { var d = genDiv(r); d.thing = r.pick(THINGS); return d; },
    render: function (p) { return p.thing + ' ' + p.a + '개를 ' + p.b + '개씩 묶으면 몇 묶음이 될까요?'; },
    answer: function (p) { return p.q; },
    distractors: function (p) { return [p.q + 1, p.q - 1, p.q + 2]; },
    explain: function (p) { return p.a + ' ' + DIV + ' ' + p.b + ' = ' + p.q + '(묶음)이에요'; }
  };

  // ── ④ 곱셈과 나눗셈의 관계 (choice, numeric) ─────────────────────────────
  var divRelationTemplate = {
    id: 't_div_relation', type: 'param', difficulty: 3, inRange: function (v) { return v >= 1; },
    gen: genDiv,
    render: function (p) { return '어떤 수에 ' + p.b + '을(를) 곱하면 ' + p.a + '이(가) 됩니다. 어떤 수는 얼마일까요?'; },
    answer: function (p) { return p.q; },
    distractors: function (p) { return [p.q + 1, p.q - 1, p.q + 2]; },
    explain: function (p) { return p.a + ' ' + DIV + ' ' + p.b + ' = ' + p.q + '이므로 어떤 수는 ' + p.q + '예요'; }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 3, subject: 'math', unit: 'u3', lesson: lesson }; }

  reg('g3_math_u3_l02', { source: src('l02'), fixed: [], templates: [divShareTemplate] });
  reg('g3_math_u3_l03', { source: src('l03'), fixed: [], templates: [divGroupTemplate] });
  reg('g3_math_u3_l04', { source: src('l04'), fixed: [], templates: [divExprTemplate, divShareTemplate, divGroupTemplate] });
  reg('g3_math_u3_l05', { source: src('l05'), fixed: [], templates: [divRelationTemplate, divExprTemplate] });
  reg('g3_math_u3_l06', { source: src('l06'), fixed: [], templates: [divExprTemplate, divShareTemplate, divGroupTemplate] });
  reg('g3_math_u3_l08', { source: src('l08'), fixed: [], templates: [divExprTemplate, divShareTemplate, divGroupTemplate, divRelationTemplate] });

  reg('g3_math_u3', {
    source: { grade: 3, subject: 'math', unit: 'u3', lesson: 'all' }, fixed: [],
    templates: [divExprTemplate, divShareTemplate, divGroupTemplate, divRelationTemplate]
  });
});
