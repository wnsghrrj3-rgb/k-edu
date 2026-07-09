/* =============================================================
 * templates/g2_math_u4.js — 케이퀴즈: 2학년 1학기 4단원 「길이 재기」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치 + 개념 OX)
 *
 * 차시(g2_math_u4): l01 도입(퀴즈X) · l02 길이 비교(직접/간접, 시각) ·
 *   l03 여러 가지 단위로 재기 · l04 1cm 알기 ·
 *   l05 자로 재는 방법(시각) · l06 자로 재기(실측, 시각) · l07 어림하기(시각)
 * 성취기준 [2수03-01~02](임의단위·1cm 이해)
 *
 * 원칙: 자 눈금·실측·어림은 시각 조작이라 제외. 텍스트로 판정 가능한 것만:
 *   ① 1cm 반복 개념(1cm로 n번 = n cm) — param, test가 동일 수식 재계산.
 *   ② 임의단위-횟수 관계(작은 단위일수록 잰 횟수 많음) — 개념 OX, 진리표 재계산.
 *   ③ cm 수치 길이 비교 — 순수 수치(교과서 차용 0, 비교어휘 아님).
 *   ※ 길이의 합·차는 3학년 과정 → 넣지 않음(교육과정 준수).
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "1cm로 {n}번 잰 길이는 몇 cm일까요?"                        → n
 *     "「{n}cm」는 1cm로 몇 번 잰 길이일까요?"                     → n
 *     "「{a}cm」와 「{b}cm」 중에서 {더 긴|더 짧은} 것은 …"        → max/min + 'cm'
 *     "같은 길이를 잴 때, 단위가 {작을수록|클수록} 잰 횟수가 {많습니다|적습니다}." (OX)
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  // ── ① 1cm 반복 → 길이 (choice, numeric) ──────────────────────────────────
  var cmToLenTemplate = {
    id: 't_cm_to_len', type: 'param', difficulty: 1, inRange: function (v) { return v >= 1; },
    gen: function (r) { return { n: r.int(2, 20) }; },
    render: function (p) { return '1cm로 ' + p.n + '번 잰 길이는 몇 cm일까요?'; },
    answer: function (p) { return p.n; },
    distractors: function (p) { return [p.n + 1, p.n - 1, p.n + 2]; },
    explain: function (p) { return '1cm로 ' + p.n + '번 잰 길이는 ' + p.n + 'cm예요'; }
  };

  // ── ② 길이 → 1cm 횟수 (choice, numeric) — 역방향 이해 ─────────────────────
  var lenToCmTemplate = {
    id: 't_len_to_cm', type: 'param', difficulty: 1, inRange: function (v) { return v >= 1; },
    gen: function (r) { return { n: r.int(2, 20) }; },
    render: function (p) { return '「' + p.n + 'cm」는 1cm로 몇 번 잰 길이일까요?'; },
    answer: function (p) { return p.n; },
    distractors: function (p) { return [p.n + 1, p.n - 1, p.n + 2]; },
    explain: function (p) { return '「' + p.n + 'cm」는 1cm로 ' + p.n + '번 잰 길이예요'; }
  };

  // ── ③ cm 수치 길이 비교 (choice, 2지) ────────────────────────────────────
  var lengthCompareTemplate = {
    id: 't_len_compare', type: 'param', difficulty: 2, choiceCount: 2,
    gen: function (r) {
      var a = r.int(1, 20), b = r.int(1, 20);
      while (b === a) b = r.int(1, 20);
      var dir = r.pick(['더 긴', '더 짧은']);
      return { a: a, b: b, dir: dir };
    },
    render: function (p) {
      return '「' + p.a + 'cm」와 「' + p.b + 'cm」 중에서 ' + p.dir + ' 것은 무엇일까요?';
    },
    answer: function (p) {
      var big = Math.max(p.a, p.b), small = Math.min(p.a, p.b);
      return (p.dir === '더 긴' ? big : small) + 'cm';
    },
    distractors: function (p) {
      var big = Math.max(p.a, p.b), small = Math.min(p.a, p.b);
      return [(p.dir === '더 긴' ? small : big) + 'cm'];
    },
    explain: function (p) {
      var big = Math.max(p.a, p.b), small = Math.min(p.a, p.b);
      return (p.dir === '더 긴' ? big : small) + 'cm가 ' + p.dir + ' 길이예요';
    }
  };

  // ── ④ 임의단위-횟수 관계 O/X (개념, 진리표) ───────────────────────────────
  var unitCountOxTemplate = {
    id: 't_unit_count_ox', type: 'param', itemType: 'ox', difficulty: 2,
    gen: function (r) {
      var u = r.pick(['작을수록', '클수록']);
      var c = r.pick(['많습니다', '적습니다']);
      var truth = (u === '작을수록') ? (c === '많습니다') : (c === '적습니다');
      return { u: u, c: c, truth: truth };
    },
    render: function (p) {
      return '다음이 맞으면 O, 틀리면 X.\n같은 길이를 잴 때, 단위가 ' + p.u + ' 잰 횟수가 ' + p.c;
    },
    answer: function (p) { return p.truth; },
    explain: function (p) {
      return '단위가 작을수록 한 번에 재는 길이가 짧아, 잰 횟수는 더 많아져요';
    }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 2, subject: 'math', unit: 'u4', lesson: lesson }; }

  reg('g2_math_u4_l03', { source: src('l03'), fixed: [], templates: [unitCountOxTemplate] });
  reg('g2_math_u4_l04', { source: src('l04'), fixed: [], templates: [cmToLenTemplate, lenToCmTemplate, lengthCompareTemplate] });

  reg('g2_math_u4', {
    source: { grade: 2, subject: 'math', unit: 'u4', lesson: 'all' }, fixed: [],
    templates: [cmToLenTemplate, lenToCmTemplate, lengthCompareTemplate, unitCountOxTemplate]
  });
});
