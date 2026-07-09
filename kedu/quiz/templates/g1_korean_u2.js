/* =============================================================
 * templates/g1_korean_u2.js — 케이퀴즈: 1학년 국어 2단원 「받침이 있는 글자」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (compose·종성)
 *
 * 차시(g1_korean_u2): l01·l02 도입(퀴즈X) · l03~l07 받침 글자 읽기(종성 조합) ·
 *   l08~l11 바른 자세로 말하고 듣기(태도/화법, 퀴즈X) · l12 실천 · l13 마무리(퀴즈X)
 * 성취기준 [2국04-01](받침 있는 글자의 짜임·읽기)
 *
 * 원칙: 홑받침 8종(ㄱㄴㄷㄹㅁㅂㅅㅇ)만 다뤄 G1 수준 유지.
 *   음운변동(받침 소리 규칙)은 학년 수준 밖 → 다루지 않음(글자 짜임만).
 *   종성 조합은 core.compose(받침 없음) 밖이라 이 파일에서 유니코드로 직접 처리(core 불변).
 *   저작권: 순수 자모 역학 — 교과서 본문 차용 0.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "자음자 「C」, 모음자 「J」, 받침 「T」을(를) 합치면 어떤 글자일까요?" → composeJong(C,J,T)
 *     "「글」의 받침은 무엇일까요?"                                       → decompose(글).jong
 *     "「글」에는 받침이 있습니다." (OX)                                  → (종성 유무)
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  var CHO  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  var JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  var JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  function composeJong(cho, jung, jong) {
    var ci = CHO.indexOf(cho), ji = JUNG.indexOf(jung), ki = JONG.indexOf(jong || '');
    if (ci < 0 || ji < 0 || ki < 0) return null;
    return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28 + ki);
  }
  function jongOf(ch) {
    var code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return null;
    return JONG[code % 28];   // '' = 받침 없음
  }

  // 읽기 쉬운 글자를 위해 기본 자음·단모음 위주 + 홑받침 8종
  var READ_CHO  = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅎ'];
  var READ_JUNG = ['ㅏ','ㅓ','ㅗ','ㅜ','ㅡ','ㅣ'];
  var BASIC_JONG = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ'];

  function other(arr, v, rng) { var p = arr.filter(function (x) { return x !== v; }); return p[rng.int(0, p.length - 1)]; }

  // ── 자음자+모음자+받침 → 글자 (choice) ───────────────────────────────────
  var composeJongTemplate = {
    id: 't_compose_jong', type: 'pick', difficulty: 2,
    gen: function (rng) {
      var cho = rng.pick(READ_CHO), jung = rng.pick(READ_JUNG), jong = rng.pick(BASIC_JONG);
      return { cho: cho, jung: jung, jong: jong, altJong: other(BASIC_JONG, jong, rng), altCho: other(READ_CHO, cho, rng) };
    },
    render: function (p) {
      return '자음자 「' + p.cho + '」, 모음자 「' + p.jung + '」, 받침 「' + p.jong + '」을(를) 합치면 어떤 글자일까요?';
    },
    answer: function (p) { return composeJong(p.cho, p.jung, p.jong); },
    distractors: function (p) {
      return [
        composeJong(p.cho, p.jung, p.altJong),  // 받침만 다른 글자
        composeJong(p.cho, p.jung, ''),          // 받침 없는 글자
        composeJong(p.altCho, p.jung, p.jong)    // 첫소리만 다른 글자
      ];
    },
    validate: function (p, ans) { return !!ans; },
    explain: function (p) { return '「' + p.cho + '」 「' + p.jung + '」 아래에 받침 「' + p.jong + '」을(를) 붙이면 「' + composeJong(p.cho, p.jung, p.jong) + '」예요'; }
  };

  // ── 글자 → 받침 찾기 (choice) ────────────────────────────────────────────
  var findJongTemplate = {
    id: 't_find_jong', type: 'pick', difficulty: 2,
    gen: function (rng) {
      var cho = rng.pick(READ_CHO), jung = rng.pick(READ_JUNG), jong = rng.pick(BASIC_JONG);
      return { jong: jong, glyph: composeJong(cho, jung, jong) };
    },
    render: function (p) { return '「' + p.glyph + '」의 받침은 무엇일까요?'; },
    answer: function (p) { return p.jong; },
    distractors: function (p, ans, rng) { return rng.shuffle(BASIC_JONG.filter(function (j) { return j !== p.jong; })).slice(0, 3); },
    validate: function (p) { return !!p.glyph; },
    explain: function (p) { return '「' + p.glyph + '」의 받침은 「' + p.jong + '」이에요'; }
  };

  // ── 받침 유무 판별 (OX) ──────────────────────────────────────────────────
  var hasJongOxTemplate = {
    id: 't_has_jong_ox', type: 'pick', itemType: 'ox', difficulty: 1,
    gen: function (rng) {
      var cho = rng.pick(READ_CHO), jung = rng.pick(READ_JUNG);
      var withJong = rng.next() < 0.5;
      var jong = withJong ? rng.pick(BASIC_JONG) : '';
      return { glyph: composeJong(cho, jung, jong), truth: withJong };
    },
    render: function (p) { return '다음이 맞으면 O, 틀리면 X.\n「' + p.glyph + '」에는 받침이 있습니다.'; },
    answer: function (p) { return p.truth; },
    explain: function (p) { return p.truth ? '「' + p.glyph + '」에는 받침이 있어요' : '「' + p.glyph + '」에는 받침이 없어요'; }
  };

  // ── 차시별 등록 (l03~l07 받침 글자 읽기만; l08~l11 화법·태도는 퀴즈 제외) ──
  function src(lesson) { return { grade: 1, subject: 'korean', unit: 'u2', lesson: lesson }; }

  ['l03', 'l04', 'l05', 'l06', 'l07'].forEach(function (L) {
    reg('g1_korean_u2_' + L, { source: src(L), fixed: [], templates: [composeJongTemplate, findJongTemplate, hasJongOxTemplate] });
  });

  reg('g1_korean_u2', {
    source: { grade: 1, subject: 'korean', unit: 'u2', lesson: 'all' }, fixed: [],
    templates: [composeJongTemplate, findJongTemplate, hasJongOxTemplate]
  });
});
