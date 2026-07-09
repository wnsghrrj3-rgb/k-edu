/* =============================================================
 * templates/g1_korean_u3.js — 케이퀴즈: 1학년 국어 3단원 「낱말과 친해져요」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (compose·자모 조합)
 *
 * 차시(g1_korean_u3): l01 도입(퀴즈X) · l02~05 받침 있는 글자 쓰기(u2와 겹쳐 제외) ·
 *   l06~07 여러 가지 자음자(된소리) · l08~13 낱말 읽기·찾기(본문 의존, 제외)
 * 성취기준 [2국04-01](한글 자모의 소릿값·글자 짜임)
 *
 * 원칙: u3의 고유 실질 = 된소리 자음자(ㄲ·ㄸ·ㅃ·ㅆ·ㅉ). u1(기본자음)·u2(홑받침)에
 *   없던 새 자모라 겹침 0. 순수 자모 조합 역학 → core._util.compose가 유니코드로 정답 계산.
 *   조합·첫소리 문항은 u1 재계산기(hCompose/hDecompose, H_CHO 19에 된소리 포함)를 그대로 공유.
 *   된소리 판별 OX만 test에 신규 재계산기(된소리 집합). 저작권: 교과서 본문 차용 0.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     (u1 공유) "자음자 「C」과(와) 모음자 「J」을(를) 합치면 어떤 글자일까요?" → compose(C,J)
 *     (u1 공유) "「글」의 첫소리(자음자)는 무엇일까요?"                        → decompose(글).cho
 *     (신규 OX) "「C」은(는) 된소리 자음자입니다."                            → C ∈ {ㄲㄸㅃㅆㅉ}
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var U = CORE._util;   // compose/decompose

  var DDEN = ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'];                 // 된소리 자음자
  var BASIC_CHO = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  var JUNG = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];

  function other(arr, v, rng) {
    var pool = arr.filter(function (x) { return x !== v; });
    return pool[rng.int(0, pool.length - 1)];
  }

  // ── ① 된소리 자음자 + 모음자 → 글자 (compose, choice) ─────────────────────
  var composeDdenTemplate = {
    id: 't_compose_dden', type: 'compose', itemType: 'choice', difficulty: 1,
    gen: function (rng) {
      var cho = rng.pick(DDEN), jung = rng.pick(JUNG);
      return { cho: cho, jung: jung, altCho: other(DDEN, cho, rng), altJung: other(JUNG, jung, rng) };
    },
    render: function (p) { return '자음자 「' + p.cho + '」과(와) 모음자 「' + p.jung + '」을(를) 합치면 어떤 글자일까요?'; },
    answer: function (p) { return U.compose(p.cho, p.jung); },
    distractors: function (p) {
      return [U.compose(p.altCho, p.jung), U.compose(p.cho, p.altJung), U.compose(p.altCho, p.altJung)];
    },
    validate: function (p, ans) { return !!ans; },
    explain: function (p) { return '「' + p.cho + '」과(와) 「' + p.jung + '」을(를) 합치면 「' + U.compose(p.cho, p.jung) + '」예요'; }
  };

  // ── ② 된소리 글자 → 첫소리(자음자) 찾기 (pick, choice) ────────────────────
  var findDdenChoTemplate = {
    id: 't_find_dden_cho', type: 'pick', difficulty: 2,
    gen: function (rng) {
      var cho = rng.pick(DDEN), jung = rng.pick(JUNG);
      return { cho: cho, jung: jung, glyph: U.compose(cho, jung) };
    },
    render: function (p) { return '「' + p.glyph + '」의 첫소리(자음자)는 무엇일까요?'; },
    answer: function (p) { return p.cho; },
    distractors: function (p, ans, rng) { return rng.shuffle(DDEN.filter(function (c) { return c !== p.cho; })).slice(0, 3); },
    validate: function (p) { return !!p.glyph; },
    explain: function (p) { return '「' + p.glyph + '」의 첫소리는 「' + p.cho + '」예요'; }
  };

  // ── ③ 된소리 자음자 판별 O/X (된소리 집합) ───────────────────────────────
  var ddenOxTemplate = {
    id: 't_dden_ox', type: 'pick', itemType: 'ox', difficulty: 2,
    gen: function (rng) {
      var isDden = rng.next() < 0.5;
      var cho = isDden ? rng.pick(DDEN) : rng.pick(BASIC_CHO);
      return { cho: cho, truth: isDden };
    },
    render: function (p) { return '다음이 맞으면 O, 틀리면 X.\n「' + p.cho + '」은(는) 된소리 자음자입니다.'; },
    answer: function (p) { return p.truth; },
    explain: function (p) {
      return p.truth
        ? '「' + p.cho + '」은(는) 된소리 자음자(ㄲ·ㄸ·ㅃ·ㅆ·ㅉ) 중 하나예요'
        : '「' + p.cho + '」은(는) 된소리가 아닌 기본 자음자예요';
    }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 1, subject: 'korean', unit: 'u3', lesson: lesson }; }

  reg('g1_korean_u3_l06_07', {
    source: src('l06_07'), fixed: [],
    templates: [composeDdenTemplate, findDdenChoTemplate, ddenOxTemplate]
  });

  reg('g1_korean_u3', {
    source: { grade: 1, subject: 'korean', unit: 'u3', lesson: 'all' }, fixed: [],
    templates: [composeDdenTemplate, findDdenChoTemplate, ddenOxTemplate]
  });
});
