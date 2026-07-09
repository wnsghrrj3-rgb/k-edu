/* =============================================================
 * templates/g3_math_u2.js — 케이퀴즈: 3학년 1학기 2단원 「평면도형」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (pick·정의사전·성질행렬)
 *
 * 차시(g3_math_u2): l01 도입(퀴즈X) · l02 선의 종류 · l03 각 · l04 직각 ·
 *   l05 직각삼각형 · l06 직사각형·정사각형 · l07 그림 그리기(활동, 퀴즈X) · l08 마무리
 * 성취기준 [4수02-01~04](직선·선분·반직선, 각·직각, 직각삼각형·직사각형·정사각형)
 *
 * 원칙: 시각 단원이지만 '정의'와 '성질(직각 수·변 길이)'은 순수 텍스트로 판정 가능.
 *   정의→용어는 자체 정의사전, 도형 판별·성질 OX는 성질행렬(g2u2 방식 확장) → test 독립 재계산.
 *   직각(l04)은 억지 정의 대신 도형 성질 OX(네 각 직각·직각 한 개)로 자연 커버. 교과서 차용 0.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "다음 설명에 알맞은 것은 무엇일까요?\n{정의}"        → DEF2TERM[정의]
 *     "다음 설명에 알맞은 도형은 무엇일까요?\n{설명}"      → SHAPE_BY_DESC[설명]
 *     "「{도형}」은(는) {성질구}"  (OX)                     → FEAT[도형][성질] 진위
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  // ── 정의 사전: 선의 종류 · 각 용어 (정의구 → 용어) ───────────────────────
  var LINE_TERMS = ['선분', '반직선', '직선'];
  var ANGLE_TERMS = ['각', '변', '꼭짓점'];
  var DEF2TERM = {
    '두 점을 곧게 이은 선': '선분',
    '한 점에서 시작하여 한쪽으로 끝없이 늘인 곧은 선': '반직선',
    '양쪽으로 끝없이 늘인 곧은 선': '직선',
    '한 점에서 그은 두 반직선으로 이루어진 도형': '각',
    '각을 이루는 두 반직선': '변',
    '각에서 두 반직선이 만나는 점': '꼭짓점'
  };
  var LINE_DEFS = Object.keys(DEF2TERM).filter(function (d) { return LINE_TERMS.indexOf(DEF2TERM[d]) >= 0; });
  var ANGLE_DEFS = Object.keys(DEF2TERM).filter(function (d) { return ANGLE_TERMS.indexOf(DEF2TERM[d]) >= 0; });

  function makeDefTemplate(id, defs, terms) {
    return {
      id: id, type: 'pick', difficulty: 1, choiceCount: 3,
      gen: function (rng) { var def = rng.pick(defs); return { def: def, term: DEF2TERM[def] }; },
      render: function (p) { return '다음 설명에 알맞은 것은 무엇일까요?\n' + p.def; },
      answer: function (p) { return p.term; },
      distractors: function (p) { return terms.filter(function (t) { return t !== p.term; }); },
      explain: function (p) { return '「' + p.def + '」은(는) 「' + p.term + '」이에요'; }
    };
  }
  var lineDefTemplate = makeDefTemplate('t_line_def', LINE_DEFS, LINE_TERMS);
  var angleDefTemplate = makeDefTemplate('t_angle_def', ANGLE_DEFS, ANGLE_TERMS);

  // ── 도형 판별: 설명 → 도형 (성질행렬, choice) ────────────────────────────
  var SHAPES = ['직각삼각형', '직사각형', '정사각형'];
  var SHAPE_BY_DESC = {
    '직각이 한 개 있는 삼각형': '직각삼각형',
    '네 각이 모두 직각이고, 네 변의 길이가 모두 같은 사각형': '정사각형',
    '네 각이 모두 직각이고, 네 변의 길이가 모두 같지는 않은 사각형': '직사각형'
  };
  var DESCS = Object.keys(SHAPE_BY_DESC);
  var shapeByDescTemplate = {
    id: 't_shape_by_desc', type: 'pick', difficulty: 2, choiceCount: 3,
    gen: function (rng) { var d = rng.pick(DESCS); return { desc: d, shape: SHAPE_BY_DESC[d] }; },
    render: function (p) { return '다음 설명에 알맞은 도형은 무엇일까요?\n' + p.desc; },
    answer: function (p) { return p.shape; },
    distractors: function (p) { return SHAPES.filter(function (s) { return s !== p.shape; }); },
    explain: function (p) { return '「' + p.desc + '」은(는) 「' + p.shape + '」이에요'; }
  };

  // ── 도형 성질 O/X (성질행렬) ─────────────────────────────────────────────
  var FEAT_KEYS = ['allRightAngle', 'allSidesEqual', 'oneRightAngle'];
  var FEAT = {
    '직각삼각형': { allRightAngle: false, allSidesEqual: false, oneRightAngle: true  },
    '직사각형':   { allRightAngle: true,  allSidesEqual: false, oneRightAngle: false },
    '정사각형':   { allRightAngle: true,  allSidesEqual: true,  oneRightAngle: false }
  };
  var FEAT_PHRASE = {
    allRightAngle: '네 각이 모두 직각입니다.',
    allSidesEqual: '네 변의 길이가 모두 같습니다.',
    oneRightAngle: '직각이 한 개 있습니다.'
  };
  var FEAT_NEG = {
    allRightAngle: '네 각이 모두 직각인 것은 아니에요.',
    allSidesEqual: '네 변의 길이가 모두 같지는 않아요.',
    oneRightAngle: '직각이 한 개 있는 것은 아니에요.'
  };
  var shapeFeatOxTemplate = {
    id: 't_shape_feat_ox', type: 'pick', itemType: 'ox', difficulty: 2,
    gen: function (rng) {
      var shape = rng.pick(SHAPES);
      var key = rng.pick(FEAT_KEYS);
      return { shape: shape, key: key, truth: FEAT[shape][key] };
    },
    render: function (p) { return '다음이 맞으면 O, 틀리면 X.\n「' + p.shape + '」은(는) ' + FEAT_PHRASE[p.key]; },
    answer: function (p) { return p.truth; },
    explain: function (p) { return '「' + p.shape + '」은(는) ' + (p.truth ? FEAT_PHRASE[p.key] : FEAT_NEG[p.key]); }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 3, subject: 'math', unit: 'u2', lesson: lesson }; }

  reg('g3_math_u2_l02', { source: src('l02'), fixed: [], templates: [lineDefTemplate] });
  reg('g3_math_u2_l03', { source: src('l03'), fixed: [], templates: [angleDefTemplate] });
  reg('g3_math_u2_l05', { source: src('l05'), fixed: [], templates: [shapeByDescTemplate, shapeFeatOxTemplate] });
  reg('g3_math_u2_l06', { source: src('l06'), fixed: [], templates: [shapeByDescTemplate, shapeFeatOxTemplate] });
  reg('g3_math_u2_l08', { source: src('l08'), fixed: [], templates: [lineDefTemplate, angleDefTemplate, shapeByDescTemplate, shapeFeatOxTemplate] });

  reg('g3_math_u2', {
    source: { grade: 3, subject: 'math', unit: 'u2', lesson: 'all' }, fixed: [],
    templates: [lineDefTemplate, angleDefTemplate, shapeByDescTemplate, shapeFeatOxTemplate]
  });
});
