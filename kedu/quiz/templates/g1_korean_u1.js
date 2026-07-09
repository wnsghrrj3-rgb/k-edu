/* =============================================================
 * templates/g1_korean_u1.js — 케이퀴즈: 1학년 국어 1단원 「글자를 만들어요」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (compose·자모 조합)
 *
 * 차시(g1_korean_u1): l01·l02 단원 도입(퀴즈X) · l03~l06 글자의 짜임(자음+모음) ·
 *   l07·l08 읽고 쓰기 · l09~l11 여러 모음자 · l12 점검(통합) ·
 *   l13 실천 · l14 마무리(퀴즈X)
 * 성취기준 [2국04-01](한글 자모의 이름·소릿값, 글자 짜임)
 *
 * 원칙: 순수 한글 자모 조합 역학 → 코드가 유니코드로 정답 계산(core._util.compose).
 *   저작권: 교과서 본문·지문 차용 0. 자모 조합은 보편 한글 규칙.
 *   문구는 test_kquiz_core.js가 독립 재계산(자체 compose/decompose)할 수 있도록 고정.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "자음자 「C」과(와) 모음자 「J」을(를) 합치면 어떤 글자일까요?" → compose(C,J)
 *     "「글」의 첫소리(자음자)는 무엇일까요?"                        → decompose(글).cho
 *     "「글」의 모음자는 무엇일까요?"                               → decompose(글).jung
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var U = CORE._util;   // compose/decompose

  // 1학년 기본 자음 14(쌍자음 제외) · 기본 모음 10 · 여러 모음자 4
  var BASIC_CHO  = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  var BASIC_JUNG = ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ'];
  var MORE_JUNG  = ['ㅐ','ㅔ','ㅚ','ㅟ'];

  function other(arr, v, rng) {
    var pool = arr.filter(function (x) { return x !== v; });
    return pool[rng.int(0, pool.length - 1)];
  }

  // ── 자음자 + 모음자 → 글자 (compose, choice) ─────────────────────────────
  function makeComposeGlyph(tag, jungPool) {
    return {
      id: 't_compose_' + tag, type: 'compose', itemType: 'choice', difficulty: 1,
      gen: function (rng) {
        var cho = rng.pick(BASIC_CHO), jung = rng.pick(jungPool);
        return { cho: cho, jung: jung, altCho: other(BASIC_CHO, cho, rng), altJung: other(jungPool.concat(BASIC_JUNG), jung, rng) };
      },
      render: function (p) { return '자음자 「' + p.cho + '」과(와) 모음자 「' + p.jung + '」을(를) 합치면 어떤 글자일까요?'; },
      answer: function (p) { return U.compose(p.cho, p.jung); },
      distractors: function (p) {
        return [U.compose(p.altCho, p.jung), U.compose(p.cho, p.altJung), U.compose(p.altCho, p.altJung)];
      },
      validate: function (p, ans) { return !!ans; },
      explain: function (p) { return '「' + p.cho + '」과(와) 「' + p.jung + '」을(를) 합치면 「' + U.compose(p.cho, p.jung) + '」예요'; }
    };
  }
  var composeGlyphBasic = makeComposeGlyph('basic', BASIC_JUNG);
  var composeGlyphMore  = makeComposeGlyph('more', MORE_JUNG);

  // ── 글자 → 첫소리(자음자) 찾기 (pick, choice) ────────────────────────────
  var findChoTemplate = {
    id: 't_find_cho', type: 'pick', difficulty: 2,
    gen: function (rng) {
      var cho = rng.pick(BASIC_CHO), jung = rng.pick(BASIC_JUNG.concat(MORE_JUNG));
      return { cho: cho, jung: jung, glyph: U.compose(cho, jung) };
    },
    render: function (p) { return '「' + p.glyph + '」의 첫소리(자음자)는 무엇일까요?'; },
    answer: function (p) { return p.cho; },
    distractors: function (p, ans, rng) { return rng.shuffle(BASIC_CHO.filter(function (c) { return c !== p.cho; })).slice(0, 3); },
    validate: function (p) { return !!p.glyph; },
    explain: function (p) { return '「' + p.glyph + '」의 첫소리는 「' + p.cho + '」예요'; }
  };

  // ── 글자 → 모음자 찾기 (pick, choice) ────────────────────────────────────
  var findJungTemplate = {
    id: 't_find_jung', type: 'pick', difficulty: 2,
    gen: function (rng) {
      var cho = rng.pick(BASIC_CHO), jung = rng.pick(BASIC_JUNG.concat(MORE_JUNG));
      return { cho: cho, jung: jung, glyph: U.compose(cho, jung) };
    },
    render: function (p) { return '「' + p.glyph + '」의 모음자는 무엇일까요?'; },
    answer: function (p) { return p.jung; },
    distractors: function (p, ans, rng) { return rng.shuffle(BASIC_JUNG.concat(MORE_JUNG).filter(function (j) { return j !== p.jung; })).slice(0, 3); },
    validate: function (p) { return !!p.glyph; },
    explain: function (p) { return '「' + p.glyph + '」의 모음자는 「' + p.jung + '」예요'; }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 1, subject: 'korean', unit: 'u1', lesson: lesson }; }

  // l03~l06 글자의 짜임
  ['l03', 'l04', 'l05', 'l06'].forEach(function (L) {
    reg('g1_korean_u1_' + L, { source: src(L), fixed: [], templates: [composeGlyphBasic] });
  });
  // l07·l08 읽고 쓰기
  ['l07', 'l08'].forEach(function (L) {
    reg('g1_korean_u1_' + L, { source: src(L), fixed: [], templates: [composeGlyphBasic, findChoTemplate, findJungTemplate] });
  });
  // l09~l11 여러 모음자
  ['l09', 'l10', 'l11'].forEach(function (L) {
    reg('g1_korean_u1_' + L, { source: src(L), fixed: [], templates: [composeGlyphMore, findJungTemplate] });
  });
  // l12 점검(통합)
  reg('g1_korean_u1_l12', {
    source: src('l12'), fixed: [],
    templates: [composeGlyphBasic, composeGlyphMore, findChoTemplate, findJungTemplate]
  });

  // 단원 전체 세트
  reg('g1_korean_u1', {
    source: { grade: 1, subject: 'korean', unit: 'u1', lesson: 'all' }, fixed: [],
    templates: [composeGlyphBasic, composeGlyphMore, findChoTemplate, findJungTemplate]
  });
});
