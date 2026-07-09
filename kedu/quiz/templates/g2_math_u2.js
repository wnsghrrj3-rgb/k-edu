/* =============================================================
 * templates/g2_math_u2.js — 케이퀴즈: 2학년 1학기 2단원 「여러 가지 도형」(평면)
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (pick·성질행렬)
 *
 * 평면 3종: 삼각형 · 사각형 · 원
 * 차시(g2_math_u2): l01 도입(퀴즈X) · l02 삼각형 · l03 사각형 · l04 원 ·
 *   l05 칠교(활동, 퀴즈X) · l06 쌓기나무(조작, 퀴즈X) · l07 꾸미기(활동, 퀴즈X) ·
 *   l08 정리·평가 · l09 창작(퀴즈X)
 * 성취기준 [2수02-02](삼각형·사각형·원 관찰·구별)
 *
 * 원칙: 시각도형 단원이지만 '곧은 변 수·꼭짓점 수·굽은 선 여부'는 순수 텍스트로 판정.
 *   개수/특징은 성질행렬(PROP·FEAT)로 정답을 코드가 계산 → test가 동일 행렬로 독립 재계산.
 *   전부 순수 창작(교과서 차용 0). G1 u2 입체와 동형(성질행렬 pick).
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "곧은 변이 {s}개, 꼭짓점이 {v}개인 도형은 무엇일까요?"      → SHAPE_BY_SV[s_v]
 *     "「{도형}」의 곧은 변은 몇 개일까요?"                        → PROP[도형].sides
 *     "「{도형}」의 꼭짓점은 몇 개일까요?"                         → PROP[도형].vertices
 *     "「{도형}」은(는) {특징구}"  (OX, 숫자 없음)                 → FEAT[도형][특징] 진위
 *     "「{삼/사각형}」은(는) 곧은 변이 {n}개 있습니다"  (OX)       → PROP[도형].sides === n
 *     "「{삼/사각형}」은(는) 꼭짓점이 {n}개 있습니다"  (OX)        → PROP[도형].vertices === n
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  var SHAPES = ['삼각형', '사각형', '원'];

  // 개수 성질행렬: 곧은 변·꼭짓점
  var PROP = {
    '삼각형': { sides: 3, vertices: 3 },
    '사각형': { sides: 4, vertices: 4 },
    '원':     { sides: 0, vertices: 0 }
  };
  // 개수쌍 → 도형 (성질→도형 재계산용, 유일 판별)
  var SHAPE_BY_SV = {};
  SHAPES.forEach(function (s) { SHAPE_BY_SV[PROP[s].sides + '_' + PROP[s].vertices] = s; });

  // 특징 행렬(boolean): 곧은 변 있음 · 뾰족한 꼭짓점 있음 · 굽은 선
  var FEAT_KEYS = ['straightSide', 'vertex', 'round'];
  var FEAT = {
    '삼각형': { straightSide: true,  vertex: true,  round: false },
    '사각형': { straightSide: true,  vertex: true,  round: false },
    '원':     { straightSide: false, vertex: false, round: true  }
  };
  var FEAT_PHRASE = {
    straightSide: '곧은 변이 있습니다.',
    vertex: '뾰족한 꼭짓점이 있습니다.',
    round: '굽은 선으로 되어 있습니다.'
  };
  var FEAT_NEG = {
    straightSide: '곧은 변이 없어요.',
    vertex: '뾰족한 꼭짓점이 없어요.',
    round: '굽은 선이 아니에요.'
  };

  // ── ① 성질(변·꼭짓점 수) → 도형 (pick, choice 3지) ───────────────────────
  var shapeBySvTemplate = {
    id: 't_shape_by_sv', type: 'pick', difficulty: 1, choiceCount: 3,
    gen: function (rng) {
      var shape = rng.pick(SHAPES);
      return { shape: shape, s: PROP[shape].sides, v: PROP[shape].vertices };
    },
    render: function (p) { return '곧은 변이 ' + p.s + '개, 꼭짓점이 ' + p.v + '개인 도형은 무엇일까요?'; },
    answer: function (p) { return p.shape; },
    distractors: function (p) { return SHAPES.filter(function (s) { return s !== p.shape; }); },
    explain: function (p) { return '곧은 변 ' + p.s + '개·꼭짓점 ' + p.v + '개인 도형은 「' + p.shape + '」이에요'; }
  };

  // ── ② 도형 → 개수 (choice, numeric) ──────────────────────────────────────
  var shapeCountTemplate = {
    id: 't_shape_count', type: 'pick', difficulty: 2, inRange: function (v) { return v >= 0; },
    gen: function (rng) {
      var shape = rng.pick(SHAPES);
      var kind = rng.pick(['sides', 'vertices']);
      return { shape: shape, kind: kind, ans: PROP[shape][kind] };
    },
    render: function (p) {
      return '「' + p.shape + '」의 ' + (p.kind === 'sides' ? '곧은 변' : '꼭짓점') + '은 몇 개일까요?';
    },
    answer: function (p) { return p.ans; },
    distractors: function (p) {
      // 다른 도형의 같은 항목 값을 오답으로(부족분은 core가 autofill)
      return SHAPES.filter(function (s) { return s !== p.shape; })
                   .map(function (s) { return PROP[s][p.kind]; });
    },
    explain: function (p) {
      return '「' + p.shape + '」의 ' + (p.kind === 'sides' ? '곧은 변' : '꼭짓점') + '은(는) ' + p.ans + '개예요';
    }
  };

  // ── ③ 특징 O/X (특징행렬, 전체 도형) ─────────────────────────────────────
  var featOxTemplate = {
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

  // ── ④ 개수 O/X (삼각형·사각형만 — 원은 0개 명제가 부자연) ────────────────
  var countOxTemplate = {
    id: 't_shape_count_ox', type: 'pick', itemType: 'ox', difficulty: 3,
    gen: function (rng) {
      var shape = rng.pick(['삼각형', '사각형']);
      var kind = rng.pick(['sides', 'vertices']);
      var real = PROP[shape][kind];
      // 50% 실제값(O), 50% 오답값(±1, X)
      var n = rng.next() < 0.5 ? real : (rng.next() < 0.5 ? real + 1 : real - 1);
      if (n < 1) n = real + 1;                // 하한 보호(개수 명제는 1 이상)
      return { shape: shape, kind: kind, n: n, truth: real === n };
    },
    render: function (p) {
      return '다음이 맞으면 O, 틀리면 X.\n「' + p.shape + '」은(는) ' +
        (p.kind === 'sides' ? '곧은 변' : '꼭짓점') + '이 ' + p.n + '개 있습니다.';
    },
    answer: function (p) { return p.truth; },
    explain: function (p) {
      return '「' + p.shape + '」의 ' + (p.kind === 'sides' ? '곧은 변' : '꼭짓점') +
        '은(는) ' + PROP[p.shape][p.kind] + '개예요';
    }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 2, subject: 'math', unit: 'u2', lesson: lesson }; }

  reg('g2_math_u2_l02', { source: src('l02'), fixed: [], templates: [shapeBySvTemplate, shapeCountTemplate] });
  reg('g2_math_u2_l03', { source: src('l03'), fixed: [], templates: [shapeBySvTemplate, shapeCountTemplate] });
  reg('g2_math_u2_l04', { source: src('l04'), fixed: [], templates: [featOxTemplate, shapeBySvTemplate] });
  reg('g2_math_u2_l08', { source: src('l08'), fixed: [], templates: [shapeBySvTemplate, shapeCountTemplate, featOxTemplate, countOxTemplate] });

  reg('g2_math_u2', {
    source: { grade: 2, subject: 'math', unit: 'u2', lesson: 'all' }, fixed: [],
    templates: [shapeBySvTemplate, shapeCountTemplate, featOxTemplate, countOxTemplate]
  });
});
