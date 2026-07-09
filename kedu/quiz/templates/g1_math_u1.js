/* =============================================================
 * templates/g1_math_u1.js — 케이퀴즈: 1학년 1학기 1단원 「9까지의 수」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2
 *
 * 차시(g1_math_u1): l01 단원도입(퀴즈X) · l06·l07 수의 순서 ·
 *   l08 1만큼 더 큰/작은 수 · l09 0 알기 · l10 수의 크기 비교 ·
 *   l11 단원 평가(통합) · l12 수 그림책 만들기(활동, 퀴즈X)
 * 성취기준 [2수01-01](수 개념·세기)·[2수01-03](순서·크기 비교)
 *
 * 원칙: 정답은 코드가 계산(param) → 0..9 수 세계. validate로 범위 밖 재생성.
 *   개수 세기는 기호(●)를 텍스트로 반복 렌더 → 순수 텍스트로 셈 가능(시각자산 무의존).
 *   문항 문구는 test_kquiz_core.js가 독립 재계산할 수 있도록 고정 패턴 유지.
 *   저작권: 순수 수 개념 — 교과서 문항 차용 0.
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  var in0to9 = function (v) { return v >= 0 && v <= 9; };

  // ── 개수 세기 (1..9) — 기호 반복 렌더, choice ────────────────────────────
  var countTemplate = {
    id: 't_count', type: 'param', difficulty: 1, inRange: in0to9,
    gen: function (rng) { return { n: rng.int(1, 9) }; },
    render: function (p) {
      var dots = '●'.repeat(p.n).split('').join(' ');
      return '아래 ●를 세어 보세요. 모두 몇 개일까요?\n' + dots;
    },
    answer: function (p) { return p.n; },
    distractors: function (p) { return [p.n - 1, p.n + 1, p.n + 2]; },
    validate: function (p, ans) { return ans >= 1 && ans <= 9; },
    explain: function (p) { return '하나씩 짚으며 세면 모두 ' + p.n + '개예요'; }
  };

  // ── 다음 수 (n → n+1, n:0..8) ────────────────────────────────────────────
  var nextTemplate = {
    id: 't_next', type: 'param', difficulty: 1, inRange: in0to9,
    gen: function (rng) { return { n: rng.int(0, 8) }; },
    render: function (p) { return p.n + ' 다음의 수는 무엇일까요?'; },
    answer: function (p) { return p.n + 1; },
    distractors: function (p) { return [p.n, p.n + 2, p.n - 1]; },
    validate: function (p, ans) { return ans >= 1 && ans <= 9; },
    explain: function (p) { return p.n + ' 바로 뒤에 오는 수는 ' + (p.n + 1); }
  };

  // ── 앞 수 (n → n-1, n:1..9) ──────────────────────────────────────────────
  var prevTemplate = {
    id: 't_prev', type: 'param', difficulty: 1, inRange: in0to9,
    gen: function (rng) { return { n: rng.int(1, 9) }; },
    render: function (p) { return p.n + ' 바로 앞의 수는 무엇일까요?'; },
    answer: function (p) { return p.n - 1; },
    distractors: function (p) { return [p.n, p.n + 1, p.n - 2]; },
    validate: function (p, ans) { return ans >= 0 && ans <= 8; },
    explain: function (p) { return p.n + ' 바로 앞에 오는 수는 ' + (p.n - 1); }
  };

  // ── 1만큼 더 큰 수 (n:0..8) ──────────────────────────────────────────────
  var oneMoreTemplate = {
    id: 't_one_more', type: 'param', difficulty: 2, inRange: in0to9,
    gen: function (rng) { return { n: rng.int(0, 8) }; },
    render: function (p) { return p.n + '보다 1만큼 더 큰 수는 무엇일까요?'; },
    answer: function (p) { return p.n + 1; },
    distractors: function (p) { return [p.n, p.n + 2, p.n - 1]; },
    validate: function (p, ans) { return ans >= 1 && ans <= 9; },
    explain: function (p) { return p.n + '보다 1만큼 더 큰 수는 ' + (p.n + 1); }
  };

  // ── 1만큼 더 작은 수 (n:1..9) ────────────────────────────────────────────
  var oneLessTemplate = {
    id: 't_one_less', type: 'param', difficulty: 2, inRange: in0to9,
    gen: function (rng) { return { n: rng.int(1, 9) }; },
    render: function (p) { return p.n + '보다 1만큼 더 작은 수는 무엇일까요?'; },
    answer: function (p) { return p.n - 1; },
    distractors: function (p) { return [p.n, p.n + 1, p.n - 2]; },
    validate: function (p, ans) { return ans >= 0 && ans <= 8; },
    explain: function (p) { return p.n + '보다 1만큼 더 작은 수는 ' + (p.n - 1); }
  };

  // ── 크기 비교: 더 큰 수 (a≠b, 0..9), choice ──────────────────────────────
  var biggerTemplate = {
    id: 't_bigger', type: 'param', difficulty: 1, inRange: in0to9,
    gen: function (rng) { var a = rng.int(0, 9), b = rng.int(0, 9); if (b === a) b = (a + rng.int(1, 8)) % 10; return { a: a, b: b }; },
    render: function (p) { return p.a + '와(과) ' + p.b + ' 중에서 더 큰 수는 무엇일까요?'; },
    answer: function (p) { return Math.max(p.a, p.b); },
    distractors: function (p) { return [Math.min(p.a, p.b)]; },
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) { return Math.max(p.a, p.b) + '이(가) ' + Math.min(p.a, p.b) + '보다 큽니다'; }
  };

  // ── 크기 비교: 더 작은 수, choice ────────────────────────────────────────
  var smallerTemplate = {
    id: 't_smaller', type: 'param', difficulty: 1, inRange: in0to9,
    gen: function (rng) { var a = rng.int(0, 9), b = rng.int(0, 9); if (b === a) b = (a + rng.int(1, 8)) % 10; return { a: a, b: b }; },
    render: function (p) { return p.a + '와(과) ' + p.b + ' 중에서 더 작은 수는 무엇일까요?'; },
    answer: function (p) { return Math.min(p.a, p.b); },
    distractors: function (p) { return [Math.max(p.a, p.b)]; },
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) { return Math.min(p.a, p.b) + '이(가) ' + Math.max(p.a, p.b) + '보다 작습니다'; }
  };

  // ── 크기 비교 OX (a≠b, 0 포함 — 0 개념도 커버) ───────────────────────────
  var compareOxTemplate = {
    id: 't_compare_ox', type: 'param', itemType: 'ox', difficulty: 2,
    gen: function (rng) {
      var a = rng.int(0, 9), b = rng.int(0, 9); if (b === a) b = (a + rng.int(1, 8)) % 10;
      var claimBigger = rng.next() < 0.5;                 // "a는 b보다 큽니다" 주장할지
      var word = claimBigger ? '큽니다' : '작습니다';
      var truth = claimBigger ? (a > b) : (a < b);
      return { a: a, b: b, word: word, truth: truth };
    },
    render: function (p) { return '다음이 맞으면 O, 틀리면 X.\n' + p.a + '은(는) ' + p.b + '보다 ' + p.word + '.'; },
    answer: function (p) { return p.truth; },
    explain: function (p) {
      return p.a > p.b ? (p.a + '이(가) ' + p.b + '보다 큽니다')
           : (p.a + '이(가) ' + p.b + '보다 작습니다');
    }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 1, subject: 'math', unit: 'u1', lesson: lesson }; }

  // l06·l07 수의 순서
  reg('g1_math_u1_l06', { source: src('l06'), fixed: [], templates: [nextTemplate, prevTemplate] });
  reg('g1_math_u1_l07', { source: src('l07'), fixed: [], templates: [nextTemplate, prevTemplate, countTemplate] });
  // l08 1만큼 더 큰/작은 수
  reg('g1_math_u1_l08', { source: src('l08'), fixed: [], templates: [oneMoreTemplate, oneLessTemplate] });
  // l09 0 알기 (0 다음 수 + 0 포함 크기비교)
  reg('g1_math_u1_l09', { source: src('l09'), fixed: [], templates: [nextTemplate, compareOxTemplate] });
  // l10 수의 크기 비교
  reg('g1_math_u1_l10', { source: src('l10'), fixed: [], templates: [biggerTemplate, smallerTemplate, compareOxTemplate] });
  // l11 단원 평가(통합)
  reg('g1_math_u1_l11', {
    source: src('l11'), fixed: [],
    templates: [countTemplate, nextTemplate, prevTemplate, oneMoreTemplate, oneLessTemplate, biggerTemplate, compareOxTemplate]
  });

  // 단원 전체 세트(범위 통합 과제용)
  reg('g1_math_u1', {
    source: { grade: 1, subject: 'math', unit: 'u1', lesson: 'all' }, fixed: [],
    templates: [countTemplate, nextTemplate, prevTemplate, oneMoreTemplate, oneLessTemplate,
                biggerTemplate, smallerTemplate, compareOxTemplate]
  });
});
