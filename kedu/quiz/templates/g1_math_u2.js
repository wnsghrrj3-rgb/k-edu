/* =============================================================
 * templates/g1_math_u2.js — 케이퀴즈: 1학년 1학기 2단원 「여러 가지 모양」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (pick·성질행렬)
 *
 * 입체 3종: 상자 모양 · 둥근 기둥 모양 · 공 모양
 * 차시(g1_math_u2): l01 도입(퀴즈X) · l02 모양 찾아보기 · l03 모양 알아보기(성질) ·
 *   l04 모양으로 만들기(활동, 퀴즈X) · l05 모양 찾기 놀이 · l06 단원 정리·평가 ·
 *   l07 창작(퀴즈X)
 * 성취기준 [2수02-01](입체도형 관찰·분류)
 *
 * 원칙: 시각도형 단원이지만 '성질(굴러감·쌓임·뾰족·둥근면)'은 순수 텍스트로 판정 가능.
 *   OX는 성질행렬(PROPS)로 정답을 코드가 계산 → test가 동일 행렬로 독립 재계산.
 *   물건→모양은 정의적 매핑(축구공=공) → 자체 사전. 전부 순수 창작(교과서 차용 0).
 *   문구는 test_kquiz_core.js가 독립 재계산할 수 있도록 고정 패턴 유지.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "「{물건}」은(는) 어떤 모양일까요?"                  → 정의 사전 OBJ[물건]
 *     "{모양}은(는) {성질구}"  (OX)                       → PROPS[모양][성질] 진위
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  var SHAPES = ['상자 모양', '둥근 기둥 모양', '공 모양'];

  // 정의적 물건→모양 사전(순수 창작·보편 물건)
  var OBJECTS = [
    ['주사위', '상자 모양'], ['선물 상자', '상자 모양'], ['벽돌', '상자 모양'], ['티슈 상자', '상자 모양'],
    ['음료수 캔', '둥근 기둥 모양'], ['두루마리 휴지', '둥근 기둥 모양'], ['통조림', '둥근 기둥 모양'],
    ['축구공', '공 모양'], ['농구공', '공 모양'], ['지구본', '공 모양'], ['구슬', '공 모양']
  ];

  // 성질행렬: 각 모양이 성질을 '가지는가'(true/false)
  var PROP_KEYS = ['rollAny', 'vertex', 'flatFace', 'roundSurface'];
  var PROPS = {
    '상자 모양':      { rollAny: false, vertex: true,  flatFace: true,  roundSurface: false },
    '둥근 기둥 모양': { rollAny: false, vertex: false, flatFace: true,  roundSurface: true  },
    '공 모양':        { rollAny: true,  vertex: false, flatFace: false, roundSurface: true  }
  };
  var PROP_PHRASE = {
    rollAny: '어느 쪽으로도 잘 굴러갑니다.',
    vertex: '뾰족한 곳이 있습니다.',
    flatFace: '평평한 면이 있습니다.',
    roundSurface: '둥근 부분이 있습니다.'
  };
  var PROP_NEG = {
    rollAny: '어느 쪽으로도 잘 굴러가지는 않아요.',
    vertex: '뾰족한 곳이 없어요.',
    flatFace: '평평한 면이 없어요.',
    roundSurface: '둥근 부분이 없어요.'
  };

  // ── 물건 → 모양 (pick, choice 3지) ───────────────────────────────────────
  var objectShapeTemplate = {
    id: 't_obj_shape', type: 'pick', difficulty: 1, choiceCount: 3,
    gen: function (rng) { var e = rng.pick(OBJECTS); return { obj: e[0], shape: e[1] }; },
    render: function (p) { return '「' + p.obj + '」은(는) 어떤 모양일까요?'; },
    answer: function (p) { return p.shape; },
    distractors: function (p) { return SHAPES.filter(function (s) { return s !== p.shape; }); },
    explain: function (p) { return '「' + p.obj + '」은(는) ' + p.shape + '이에요'; }
  };

  // ── 모양의 성질 O/X (성질행렬로 정답 계산) ───────────────────────────────
  var shapePropOxTemplate = {
    id: 't_shape_prop_ox', type: 'pick', itemType: 'ox', difficulty: 2,
    gen: function (rng) {
      var shape = rng.pick(SHAPES);
      var prop = rng.pick(PROP_KEYS);
      return { shape: shape, prop: prop, truth: PROPS[shape][prop] };
    },
    render: function (p) { return '다음이 맞으면 O, 틀리면 X.\n' + p.shape + '은(는) ' + PROP_PHRASE[p.prop]; },
    answer: function (p) { return p.truth; },
    explain: function (p) { return p.shape + '은(는) ' + (p.truth ? PROP_PHRASE[p.prop] : PROP_NEG[p.prop]); }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 1, subject: 'math', unit: 'u2', lesson: lesson }; }

  reg('g1_math_u2_l02', { source: src('l02'), fixed: [], templates: [objectShapeTemplate] });
  reg('g1_math_u2_l03', { source: src('l03'), fixed: [], templates: [shapePropOxTemplate] });
  reg('g1_math_u2_l05', { source: src('l05'), fixed: [], templates: [objectShapeTemplate, shapePropOxTemplate] });
  reg('g1_math_u2_l06', { source: src('l06'), fixed: [], templates: [objectShapeTemplate, shapePropOxTemplate] });

  reg('g1_math_u2', {
    source: { grade: 1, subject: 'math', unit: 'u2', lesson: 'all' }, fixed: [],
    templates: [objectShapeTemplate, shapePropOxTemplate]
  });
});
