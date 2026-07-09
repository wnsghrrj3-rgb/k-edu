/* =============================================================
 * templates/g3_math_u6.js — 케이퀴즈: 3학년 1학기 6단원 「분수와 소수」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·분수/소수 표현)
 *
 * 차시(g3_math_u6): l01 도입(퀴즈X) · l02 똑같이 나누기 · l03·l04 분수 알아보기 ·
 *   l05 분모 같은 분수 비교 · l06 단위분수 비교 · l07 분모 10인 분수 ·
 *   l08 소수 · l09 소수 비교 · l10 활동(퀴즈X)
 * 성취기준 [4수01-10~12](분수·단위분수·소수의 이해와 비교)
 *
 * 원칙: 전 문항 수치/표현 파라메트릭. 분수는 "a/b" 슬래시 표기, 소수는 "0.x"로 통일해
 *   답 문자열을 일관되게 → test가 동일 규칙 독립 재계산. 크기 비교는 "더 큰"으로 고정
 *   (분모 작을수록 큰 단위분수 개념 학습). 정답은 코드가 계산. 교과서 차용 0.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "전체를 똑같이 {b}로 나눈 것 중 {a}는 분수로 얼마일까요?"       → "a/b"
 *     "분수 {a}/{b}에서 분모는 무엇일까요?"                          → b
 *     "분수 {a}/{b}에서 분자는 무엇일까요?"                          → a
 *     "{a}/{n}과 {b}/{n} 중에서 더 큰 분수는 무엇일까요?"            → "max(a,b)/n"
 *     "단위분수 1/{a}과 1/{b} 중에서 더 큰 분수는 무엇일까요?"       → "1/min(a,b)"
 *     "{a}/10은 소수로 얼마일까요?"                                 → "0.a"
 *     "0.1이 {n}개이면 소수로 얼마일까요?"                          → "0.n"
 *     "0.{n}는 0.1이 몇 개일까요?"                                  → n
 *     "0.{a}와 0.{b} 중에서 더 큰 수는 무엇일까요?"                 → "0.max(a,b)"
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  function decLabel(n) { return '0.' + n; }         // n:1..9
  function otherDec(n) { return n >= 9 ? '0.1' : (n <= 1 ? '0.9' : '0.' + (n - 1)); }

  // ── ① 분수 만들기 (choice, 문자열 "a/b") ─────────────────────────────────
  var fractionMakeTemplate = {
    id: 't_fraction_make', type: 'param', difficulty: 1, choiceCount: 4,
    gen: function (r) { var b = r.int(2, 9), a = r.int(1, b - 1); return { a: a, b: b }; },
    render: function (p) { return '전체를 똑같이 ' + p.b + '로 나눈 것 중 ' + p.a + '는 분수로 얼마일까요?'; },
    answer: function (p) { return p.a + '/' + p.b; },
    distractors: function (p) { return [p.b + '/' + p.a, (p.a + 1) + '/' + p.b, p.a + '/' + (p.b + 1)]; },
    explain: function (p) { return '전체를 ' + p.b + '로 나눈 것 중 ' + p.a + '은(는) 「' + p.a + '/' + p.b + '」예요'; }
  };

  // ── ②③ 분모/분자 (choice, numeric) ──────────────────────────────────────
  function makePartTemplate(id, which) {
    return {
      id: id, type: 'param', difficulty: 2, inRange: function (v) { return v >= 1; },
      gen: function (r) { var b = r.int(2, 9), a = r.int(1, b - 1); return { a: a, b: b }; },
      render: function (p) { return '분수 ' + p.a + '/' + p.b + '에서 ' + (which === 'denom' ? '분모' : '분자') + '는 무엇일까요?'; },
      answer: function (p) { return which === 'denom' ? p.b : p.a; },
      distractors: function (p) { var v = which === 'denom' ? p.b : p.a; return [v + 1, v - 1, v + 2]; },
      explain: function (p) { return '분수 ' + p.a + '/' + p.b + '의 ' + (which === 'denom' ? '분모' : '분자') + '는 ' + (which === 'denom' ? p.b : p.a) + '예요'; }
    };
  }
  var denomTemplate = makePartTemplate('t_denom', 'denom');
  var numerTemplate = makePartTemplate('t_numer', 'numer');

  // ── ④ 분모 같은 분수 비교 (choice 2지, 문자열) ───────────────────────────
  var sameDenomTemplate = {
    id: 't_same_denom', type: 'param', difficulty: 2, choiceCount: 2,
    gen: function (r) {
      var n = r.int(3, 9), a = r.int(1, n - 1), b = r.int(1, n - 1);
      while (b === a) b = r.int(1, n - 1);
      return { a: a, b: b, n: n };
    },
    render: function (p) { return p.a + '/' + p.n + '과 ' + p.b + '/' + p.n + ' 중에서 더 큰 분수는 무엇일까요?'; },
    answer: function (p) { return Math.max(p.a, p.b) + '/' + p.n; },
    distractors: function (p) { return [Math.min(p.a, p.b) + '/' + p.n]; },
    explain: function (p) { return '분모가 같으면 분자가 큰 「' + Math.max(p.a, p.b) + '/' + p.n + '」이 더 커요'; }
  };

  // ── ⑤ 단위분수 비교 (choice 2지, 문자열) ─────────────────────────────────
  var unitFracTemplate = {
    id: 't_unit_frac', type: 'param', difficulty: 3, choiceCount: 2,
    gen: function (r) {
      var a = r.int(2, 9), b = r.int(2, 9);
      while (b === a) b = r.int(2, 9);
      return { a: a, b: b };
    },
    render: function (p) { return '단위분수 1/' + p.a + '과 1/' + p.b + ' 중에서 더 큰 분수는 무엇일까요?'; },
    answer: function (p) { return '1/' + Math.min(p.a, p.b); },
    distractors: function (p) { return ['1/' + Math.max(p.a, p.b)]; },
    explain: function (p) { return '단위분수는 분모가 작을수록 커서 「1/' + Math.min(p.a, p.b) + '」이 더 커요'; }
  };

  // ── ⑥ 분모 10인 분수 → 소수 (choice, 문자열) ─────────────────────────────
  var fracTenTemplate = {
    id: 't_frac_ten', type: 'param', difficulty: 2, choiceCount: 4,
    gen: function (r) { return { a: r.int(1, 9) }; },
    render: function (p) { return p.a + '/10은 소수로 얼마일까요?'; },
    answer: function (p) { return decLabel(p.a); },
    distractors: function (p) { return [otherDec(p.a), decLabel(p.a >= 9 ? 8 : p.a + 1), String(p.a)]; },
    explain: function (p) { return p.a + '/10은 소수로 「' + decLabel(p.a) + '」예요'; }
  };

  // ── ⑦a 0.1 개수 → 소수 (choice, 문자열) ──────────────────────────────────
  var decMakeTemplate = {
    id: 't_dec_make', type: 'param', difficulty: 1, choiceCount: 4,
    gen: function (r) { return { n: r.int(1, 9) }; },
    render: function (p) { return '0.1이 ' + p.n + '개이면 소수로 얼마일까요?'; },
    answer: function (p) { return decLabel(p.n); },
    distractors: function (p) { return [otherDec(p.n), decLabel(p.n >= 9 ? 7 : p.n + 1), String(p.n)]; },
    explain: function (p) { return '0.1이 ' + p.n + '개이면 「' + decLabel(p.n) + '」이에요'; }
  };

  // ── ⑦b 소수 → 0.1 개수 (choice, numeric) ─────────────────────────────────
  var decCountTemplate = {
    id: 't_dec_count', type: 'param', difficulty: 1, inRange: function (v) { return v >= 1; },
    gen: function (r) { return { n: r.int(1, 9) }; },
    render: function (p) { return '0.' + p.n + '는 0.1이 몇 개일까요?'; },
    answer: function (p) { return p.n; },
    distractors: function (p) { return [p.n + 1, p.n - 1, p.n + 2]; },
    explain: function (p) { return '0.' + p.n + '는 0.1이 ' + p.n + '개예요'; }
  };

  // ── ⑧ 소수 비교 (choice 2지, 문자열) ─────────────────────────────────────
  var decCompareTemplate = {
    id: 't_dec_compare', type: 'param', difficulty: 2, choiceCount: 2,
    gen: function (r) {
      var a = r.int(1, 9), b = r.int(1, 9);
      while (b === a) b = r.int(1, 9);
      return { a: a, b: b };
    },
    render: function (p) { return '0.' + p.a + '와 0.' + p.b + ' 중에서 더 큰 수는 무엇일까요?'; },
    answer: function (p) { return decLabel(Math.max(p.a, p.b)); },
    distractors: function (p) { return [decLabel(Math.min(p.a, p.b))]; },
    explain: function (p) { return '「' + decLabel(Math.max(p.a, p.b)) + '」이 더 커요'; }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 3, subject: 'math', unit: 'u6', lesson: lesson }; }

  reg('g3_math_u6_l02', { source: src('l02'), fixed: [], templates: [fractionMakeTemplate] });
  reg('g3_math_u6_l03', { source: src('l03'), fixed: [], templates: [fractionMakeTemplate] });
  reg('g3_math_u6_l04', { source: src('l04'), fixed: [], templates: [denomTemplate, numerTemplate, fractionMakeTemplate] });
  reg('g3_math_u6_l05', { source: src('l05'), fixed: [], templates: [sameDenomTemplate] });
  reg('g3_math_u6_l06', { source: src('l06'), fixed: [], templates: [unitFracTemplate] });
  reg('g3_math_u6_l07', { source: src('l07'), fixed: [], templates: [fracTenTemplate] });
  reg('g3_math_u6_l08', { source: src('l08'), fixed: [], templates: [decMakeTemplate, decCountTemplate] });
  reg('g3_math_u6_l09', { source: src('l09'), fixed: [], templates: [decCompareTemplate] });

  reg('g3_math_u6', {
    source: { grade: 3, subject: 'math', unit: 'u6', lesson: 'all' }, fixed: [],
    templates: [fractionMakeTemplate, denomTemplate, numerTemplate, sameDenomTemplate,
                unitFracTemplate, fracTenTemplate, decMakeTemplate, decCountTemplate, decCompareTemplate]
  });
});
