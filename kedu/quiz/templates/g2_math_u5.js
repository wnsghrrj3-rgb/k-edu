/* =============================================================
 * templates/g2_math_u5.js — 케이퀴즈: 2학년 1학기 5단원 「분류하기」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·빈도 + 개념 OX)
 *
 * 차시(g2_math_u5): l01 도입(퀴즈X) · l02 분류 방법(기준) · l03 기준 분류(조작) ·
 *   l04 분류하고 세기 · l05 결과 말하기 · l06 정리·평가 · l07 창작(퀴즈X)
 * 성취기준 [2수05-01~02](기준 분류·분류하여 세기)
 *
 * 원칙: 실제 분류·색칠·그래프 조작은 시각이라 제외. 텍스트 판정 가능한 것만:
 *   ① 분류하여 센 결과(빈도 데이터) 해석 — 합계·최다·최소·차. param, test 독립 재계산.
 *   ② 분류 기준 적절성 — 누가 해도 같은 결과(객관)여야 알맞음. 개념 OX, 집합 재계산.
 *   빈도 데이터는 문항 안에 텍스트로 명시(그래프 그림 없이 수치 제시).
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     데이터 프리픽스 "빨간색 {a}개, 파란색 {b}개, 노란색 {c}개가 있습니다. " 뒤에
 *       "모두 몇 개일까요?"                                → a+b+c
 *       "가장 많은 색깔은 무엇일까요?"                     → argmax 색깔
 *       "가장 적은 색깔은 무엇일까요?"                     → argmin 색깔
 *       "가장 많은 색깔은 가장 적은 색깔보다 몇 개 더 많을까요?" → max−min
 *     "「{기준}」은(는) 분류 기준으로 알맞습니다." (OX)     → 객관적 기준이면 O
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  var COLORS = ['빨간색', '파란색', '노란색'];

  // 서로 다른 세 빈도(동점 방지 — 최다/최소 유일 보장)
  function genFreq(r) {
    var a, b, c;
    do { a = r.int(1, 9); b = r.int(1, 9); c = r.int(1, 9); }
    while (a === b || b === c || a === c);
    return { a: a, b: b, c: c };
  }
  function dataPrefix(p) {
    return '빨간색 ' + p.a + '개, 파란색 ' + p.b + '개, 노란색 ' + p.c + '개가 있습니다. ';
  }
  function maxColor(p) {
    var mx = Math.max(p.a, p.b, p.c);
    return mx === p.a ? '빨간색' : (mx === p.b ? '파란색' : '노란색');
  }
  function minColor(p) {
    var mn = Math.min(p.a, p.b, p.c);
    return mn === p.a ? '빨간색' : (mn === p.b ? '파란색' : '노란색');
  }

  // ── ① 빈도 합계 (param, numeric) ─────────────────────────────────────────
  var freqSumTemplate = {
    id: 't_freq_sum', type: 'param', difficulty: 1, inRange: function (v) { return v >= 0; },
    gen: genFreq,
    render: function (p) { return dataPrefix(p) + '모두 몇 개일까요?'; },
    answer: function (p) { return p.a + p.b + p.c; },
    distractors: function (p) { var t = p.a + p.b + p.c; return [t + 1, t - 1, t + 2]; },
    explain: function (p) { return p.a + ' + ' + p.b + ' + ' + p.c + ' = ' + (p.a + p.b + p.c) + '개예요'; }
  };

  // ── ② 최다 색깔 (pick, choice 3지) ───────────────────────────────────────
  var freqMostTemplate = {
    id: 't_freq_most', type: 'pick', difficulty: 2, choiceCount: 3,
    gen: genFreq,
    render: function (p) { return dataPrefix(p) + '가장 많은 색깔은 무엇일까요?'; },
    answer: function (p) { return maxColor(p); },
    distractors: function (p) { var m = maxColor(p); return COLORS.filter(function (c) { return c !== m; }); },
    explain: function (p) { return '가장 많은 색깔은 「' + maxColor(p) + '」이에요'; }
  };

  // ── ③ 최소 색깔 (pick, choice 3지) ───────────────────────────────────────
  var freqLeastTemplate = {
    id: 't_freq_least', type: 'pick', difficulty: 2, choiceCount: 3,
    gen: genFreq,
    render: function (p) { return dataPrefix(p) + '가장 적은 색깔은 무엇일까요?'; },
    answer: function (p) { return minColor(p); },
    distractors: function (p) { var m = minColor(p); return COLORS.filter(function (c) { return c !== m; }); },
    explain: function (p) { return '가장 적은 색깔은 「' + minColor(p) + '」이에요'; }
  };

  // ── ④ 최다−최소 차 (param, numeric) ──────────────────────────────────────
  var freqDiffTemplate = {
    id: 't_freq_diff', type: 'param', difficulty: 3, inRange: function (v) { return v >= 0; },
    gen: genFreq,
    render: function (p) { return dataPrefix(p) + '가장 많은 색깔은 가장 적은 색깔보다 몇 개 더 많을까요?'; },
    answer: function (p) { return Math.max(p.a, p.b, p.c) - Math.min(p.a, p.b, p.c); },
    distractors: function (p) {
      var d = Math.max(p.a, p.b, p.c) - Math.min(p.a, p.b, p.c);
      return [d + 1, d - 1, d + 2];
    },
    explain: function (p) {
      var mx = Math.max(p.a, p.b, p.c), mn = Math.min(p.a, p.b, p.c);
      return mx + ' − ' + mn + ' = ' + (mx - mn) + '개 더 많아요';
    }
  };

  // ── ⑤ 분류 기준 적절성 O/X (개념) ────────────────────────────────────────
  var OBJECTIVE = ['색깔', '모양', '크기', '종류'];                 // 누가 해도 같음 → 알맞음
  var SUBJECTIVE = ['예쁜 것과 예쁘지 않은 것', '좋아하는 것과 싫어하는 것',
                    '맛있는 것과 맛없는 것', '멋진 것과 멋지지 않은 것'];  // 사람마다 다름 → 안 알맞음
  var critOxTemplate = {
    id: 't_criterion_ox', type: 'pick', itemType: 'ox', difficulty: 2,
    gen: function (rng) {
      var objective = rng.next() < 0.5;
      var crit = objective ? rng.pick(OBJECTIVE) : rng.pick(SUBJECTIVE);
      return { crit: crit, truth: objective };
    },
    render: function (p) { return '다음이 맞으면 O, 틀리면 X.\n「' + p.crit + '」은(는) 분류 기준으로 알맞습니다.'; },
    answer: function (p) { return p.truth; },
    explain: function (p) {
      return p.truth
        ? '「' + p.crit + '」은(는) 누가 분류해도 결과가 같아 알맞은 기준이에요'
        : '「' + p.crit + '」은(는) 사람마다 다르게 나눌 수 있어 분류 기준으로 알맞지 않아요';
    }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 2, subject: 'math', unit: 'u5', lesson: lesson }; }

  reg('g2_math_u5_l02', { source: src('l02'), fixed: [], templates: [critOxTemplate] });
  reg('g2_math_u5_l04', { source: src('l04'), fixed: [], templates: [freqSumTemplate, freqMostTemplate, freqLeastTemplate] });
  reg('g2_math_u5_l05', { source: src('l05'), fixed: [], templates: [freqMostTemplate, freqLeastTemplate, freqDiffTemplate] });
  reg('g2_math_u5_l06', { source: src('l06'), fixed: [], templates: [freqSumTemplate, freqMostTemplate, freqLeastTemplate, freqDiffTemplate, critOxTemplate] });

  reg('g2_math_u5', {
    source: { grade: 2, subject: 'math', unit: 'u5', lesson: 'all' }, fixed: [],
    templates: [freqSumTemplate, freqMostTemplate, freqLeastTemplate, freqDiffTemplate, critOxTemplate]
  });
});
