/* =============================================================
 * templates/g1_math_u5.js — 케이퀴즈: 1학년 1학기 5단원 「50까지의 수」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2
 *
 * 차시(g1_math_u5): l02_03 10 개념+가르기 · l04 십몇 · l05 모으기·가르기 ·
 *   l06 몇십(10개씩 묶어 세기) · l07 몇십몇(50까지 세기) · l08 수의 순서 ·
 *   l09 수의 크기 비교 · l10 단원 평가(통합) · l11 창의 활동(퀴즈X)
 * 성취기준 [2수01-01](50까지 수 개념·자릿값)·[2수01-03](순서·크기 비교)
 *
 * 원칙: 정답은 코드가 계산(param) → 0..50 수 세계. validate로 범위 밖 재생성.
 *   자릿값(10개씩 묶음/낱개)은 순수 수 개념 → 시각자산 무의존, 텍스트로 셈 가능.
 *   문구는 test_kquiz_core.js가 독립 재계산할 수 있도록 고정 패턴 유지.
 *   저작권: 순수 수 개념 — 교과서 문항 차용 0.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "10개씩 묶음 K개와 낱개 M개는 얼마일까요?"      → 10K+M   (몇십몇/십몇)
 *     "10개씩 묶음 K개는 얼마일까요?"                 → 10K     (몇십)
 *     "N에서 10개씩 묶음은 몇 개일까요?"              → ⌊N/10⌋  (자릿값-십)
 *     "N에서 낱개는 몇 개일까요?"                     → N%10    (자릿값-낱개)
 *     "S을(를) A와(과) 몇으로 가를 수 있을까요?"      → S-A     (가르기, u3 재계산기 재사용)
 *     "A과(와) B을(를) 모으면 얼마일까요?"            → A+B     (모으기, u3 재계산기 재사용)
 *     "N 다음의/바로 앞의 수" · "A와(과) B 중 더 큰/작은" · "A은(는) B보다 큽니다/작습니다"
 *                                                     → u1 재계산기 재사용(다자리 \d+ 대응)
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  var in0to50 = function (v) { return v >= 0 && v <= 50; };
  var in0to9  = function (v) { return v >= 0 && v <= 9; };
  var in1to5  = function (v) { return v >= 1 && v <= 5; };

  // ── 10 가르기 (10 = A + ?, A:1..9) ───────────────────────────────────────
  var tenSplitTemplate = {
    id: 't_ten_split', type: 'param', difficulty: 1, inRange: in0to9,
    gen: function (rng) { return { a: rng.int(1, 9) }; },
    render: function (p) { return '10을(를) ' + p.a + '와(과) 몇으로 가를 수 있을까요?'; },
    answer: function (p) { return 10 - p.a; },
    distractors: function (p) { return [p.a, 10 - p.a + 1, 10 - p.a - 1]; },
    validate: function (p, ans) { return ans >= 1 && ans <= 9; },
    explain: function (p) { return '10은 ' + p.a + '과(와) ' + (10 - p.a) + '(으)로 가를 수 있어요'; }
  };

  // ── 십몇 모으기 (10 + M, M:1..9) ─────────────────────────────────────────
  var teenGatherTemplate = {
    id: 't_teen_gather', type: 'param', difficulty: 1, inRange: in0to50,
    gen: function (rng) { return { m: rng.int(1, 9) }; },
    render: function (p) { return '10과(와) ' + p.m + '을(를) 모으면 얼마일까요?'; },
    answer: function (p) { return 10 + p.m; },
    distractors: function (p) { return [p.m, 10 + p.m + 1, 10 + p.m - 1]; },
    validate: function (p, ans) { return ans >= 11 && ans <= 19; },
    explain: function (p) { return '10과(와) ' + p.m + '을(를) 모으면 ' + (10 + p.m); }
  };

  // ── 십몇 가르기 (1M = 10 + ?, M:1..9) ────────────────────────────────────
  var teenSplitTemplate = {
    id: 't_teen_split', type: 'param', difficulty: 2, inRange: in0to9,
    gen: function (rng) { return { s: 10 + rng.int(1, 9) }; },
    render: function (p) { return p.s + '을(를) 10와(과) 몇으로 가를 수 있을까요?'; },
    answer: function (p) { return p.s - 10; },
    distractors: function (p) { return [p.s, p.s - 10 + 1, p.s - 10 - 1]; },
    validate: function (p, ans) { return ans >= 1 && ans <= 9; },
    explain: function (p) { return p.s + '은(는) 10과(와) ' + (p.s - 10) + '(으)로 가를 수 있어요'; }
  };

  // ── 십몇 구성 (10개씩 묶음 1개와 낱개 M개, M:1..9) ────────────────────────
  var teenComposeTemplate = {
    id: 't_teen_compose', type: 'param', difficulty: 1, inRange: in0to50,
    gen: function (rng) { return { m: rng.int(1, 9) }; },
    render: function (p) { return '10개씩 묶음 1개와 낱개 ' + p.m + '개는 얼마일까요?'; },
    answer: function (p) { return 10 + p.m; },
    distractors: function (p) { return [p.m, 20 + p.m, 10 + p.m + 1]; },
    validate: function (p, ans) { return ans >= 11 && ans <= 19; },
    explain: function (p) { return '10개씩 묶음 1개는 10, 낱개 ' + p.m + '개를 더하면 ' + (10 + p.m); }
  };

  // ── 몇십 (10개씩 묶음 K개, K:2..5) ───────────────────────────────────────
  var tensCountTemplate = {
    id: 't_tens_count', type: 'param', difficulty: 1, inRange: in0to50,
    gen: function (rng) { return { k: rng.int(2, 5) }; },
    render: function (p) { return '10개씩 묶음 ' + p.k + '개는 얼마일까요?'; },
    answer: function (p) { return 10 * p.k; },
    distractors: function (p) {
      var others = [10, 20, 30, 40, 50].filter(function (v) { return v !== 10 * p.k; });
      return [others[0], others[1], others[2]];
    },
    validate: function (p, ans) { return ans >= 20 && ans <= 50 && ans % 10 === 0; },
    explain: function (p) { return '10이 ' + p.k + '개면 ' + (10 * p.k); }
  };

  // ── 몇십몇 구성 (10개씩 묶음 K개와 낱개 M개, K:1..4, M:1..9) ──────────────
  var twoDigitComposeTemplate = {
    id: 't_2d_compose', type: 'param', difficulty: 2, inRange: in0to50,
    gen: function (rng) { return { k: rng.int(1, 4), m: rng.int(1, 9) }; },
    render: function (p) { return '10개씩 묶음 ' + p.k + '개와 낱개 ' + p.m + '개는 얼마일까요?'; },
    answer: function (p) { return 10 * p.k + p.m; },
    distractors: function (p) {
      var a = 10 * p.k + p.m;
      return [10 * p.m + p.k, a + 10, a - 10]; // 자리 뒤바꿈 오류 + 이웃 몇십
    },
    validate: function (p, ans) { return ans >= 11 && ans <= 49; },
    explain: function (p) { return '10이 ' + p.k + '개(=' + (10 * p.k) + '), 낱개 ' + p.m + '개를 더하면 ' + (10 * p.k + p.m); }
  };

  // ── 자릿값: 10개씩 묶음 수 (N → ⌊N/10⌋, N:11..49) ────────────────────────
  var tensDigitTemplate = {
    id: 't_tens_digit', type: 'param', difficulty: 2, inRange: in1to5,
    gen: function (rng) { var k = rng.int(1, 4), m = rng.int(0, 9); return { n: 10 * k + m }; },
    render: function (p) { return p.n + '에서 10개씩 묶음은 몇 개일까요?'; },
    answer: function (p) { return Math.floor(p.n / 10); },
    distractors: function (p) { var k = Math.floor(p.n / 10); return [p.n % 10, k + 1, k - 1]; },
    validate: function (p, ans) { return ans >= 1 && ans <= 4; },
    explain: function (p) { return p.n + '은(는) 10개씩 묶음 ' + Math.floor(p.n / 10) + '개와 낱개 ' + (p.n % 10) + '개'; }
  };

  // ── 자릿값: 낱개 수 (N → N%10, N:11..49) ─────────────────────────────────
  var onesDigitTemplate = {
    id: 't_ones_digit', type: 'param', difficulty: 2, inRange: in0to9,
    gen: function (rng) { var k = rng.int(1, 4), m = rng.int(0, 9); return { n: 10 * k + m }; },
    render: function (p) { return p.n + '에서 낱개는 몇 개일까요?'; },
    answer: function (p) { return p.n % 10; },
    distractors: function (p) { return [Math.floor(p.n / 10), p.n % 10 + 1, p.n % 10 - 1]; },
    validate: function (p, ans) { return ans >= 0 && ans <= 9; },
    explain: function (p) { return p.n + '의 낱개는 ' + (p.n % 10) + '개'; }
  };

  // ── 다음 수 (n → n+1, n:9..49) ───────────────────────────────────────────
  var nextTemplate = {
    id: 't_next50', type: 'param', difficulty: 1, inRange: in0to50,
    gen: function (rng) { return { n: rng.int(9, 49) }; },
    render: function (p) { return p.n + ' 다음의 수는 무엇일까요?'; },
    answer: function (p) { return p.n + 1; },
    distractors: function (p) { return [p.n, p.n + 2, p.n - 1]; },
    validate: function (p, ans) { return ans >= 10 && ans <= 50; },
    explain: function (p) { return p.n + ' 바로 뒤에 오는 수는 ' + (p.n + 1); }
  };

  // ── 앞 수 (n → n-1, n:11..50) ────────────────────────────────────────────
  var prevTemplate = {
    id: 't_prev50', type: 'param', difficulty: 1, inRange: in0to50,
    gen: function (rng) { return { n: rng.int(11, 50) }; },
    render: function (p) { return p.n + ' 바로 앞의 수는 무엇일까요?'; },
    answer: function (p) { return p.n - 1; },
    distractors: function (p) { return [p.n, p.n + 1, p.n - 2]; },
    validate: function (p, ans) { return ans >= 10 && ans <= 49; },
    explain: function (p) { return p.n + ' 바로 앞에 오는 수는 ' + (p.n - 1); }
  };

  // ── 크기 비교: 더 큰 수 (a≠b, 0..50), choice ─────────────────────────────
  var biggerTemplate = {
    id: 't_bigger50', type: 'param', difficulty: 2, inRange: in0to50,
    gen: function (rng) { var a = rng.int(0, 50), b = rng.int(0, 50); if (b === a) b = (a + 7) % 51; return { a: a, b: b }; },
    render: function (p) { return p.a + '와(과) ' + p.b + ' 중에서 더 큰 수는 무엇일까요?'; },
    answer: function (p) { return Math.max(p.a, p.b); },
    distractors: function (p) { return [Math.min(p.a, p.b)]; },
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) { return Math.max(p.a, p.b) + '이(가) ' + Math.min(p.a, p.b) + '보다 큽니다'; }
  };

  // ── 크기 비교: 더 작은 수, choice ────────────────────────────────────────
  var smallerTemplate = {
    id: 't_smaller50', type: 'param', difficulty: 2, inRange: in0to50,
    gen: function (rng) { var a = rng.int(0, 50), b = rng.int(0, 50); if (b === a) b = (a + 7) % 51; return { a: a, b: b }; },
    render: function (p) { return p.a + '와(과) ' + p.b + ' 중에서 더 작은 수는 무엇일까요?'; },
    answer: function (p) { return Math.min(p.a, p.b); },
    distractors: function (p) { return [Math.max(p.a, p.b)]; },
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) { return Math.min(p.a, p.b) + '이(가) ' + Math.max(p.a, p.b) + '보다 작습니다'; }
  };

  // ── 크기 비교 OX (a≠b, 0..50) ────────────────────────────────────────────
  var compareOxTemplate = {
    id: 't_compare_ox50', type: 'param', itemType: 'ox', difficulty: 2,
    gen: function (rng) {
      var a = rng.int(0, 50), b = rng.int(0, 50); if (b === a) b = (a + 7) % 51;
      var claimBigger = rng.next() < 0.5;
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
  function src(lesson) { return { grade: 1, subject: 'math', unit: 'u5', lesson: lesson }; }

  // l02_03 10 개념 + 가르기
  reg('g1_math_u5_l02_03', { source: src('l02_03'), fixed: [], templates: [tenSplitTemplate, nextTemplate] });
  // l04 십몇
  reg('g1_math_u5_l04', { source: src('l04'), fixed: [], templates: [teenComposeTemplate, onesDigitTemplate, tensDigitTemplate] });
  // l05 모으기와 가르기
  reg('g1_math_u5_l05', { source: src('l05'), fixed: [], templates: [teenGatherTemplate, teenSplitTemplate] });
  // l06 몇십 (10개씩 묶어 세기)
  reg('g1_math_u5_l06', { source: src('l06'), fixed: [], templates: [tensCountTemplate] });
  // l07 몇십몇 (50까지 세기)
  reg('g1_math_u5_l07', { source: src('l07'), fixed: [], templates: [twoDigitComposeTemplate, tensDigitTemplate, onesDigitTemplate] });
  // l08 수의 순서
  reg('g1_math_u5_l08', { source: src('l08'), fixed: [], templates: [nextTemplate, prevTemplate] });
  // l09 수의 크기 비교
  reg('g1_math_u5_l09', { source: src('l09'), fixed: [], templates: [biggerTemplate, smallerTemplate, compareOxTemplate] });
  // l10 단원 평가(통합)
  reg('g1_math_u5_l10', {
    source: src('l10'), fixed: [],
    templates: [tensCountTemplate, twoDigitComposeTemplate, tensDigitTemplate, onesDigitTemplate,
                nextTemplate, prevTemplate, biggerTemplate, compareOxTemplate, tenSplitTemplate]
  });

  // 단원 전체 세트(범위 통합 과제용)
  reg('g1_math_u5', {
    source: { grade: 1, subject: 'math', unit: 'u5', lesson: 'all' }, fixed: [],
    templates: [tenSplitTemplate, teenComposeTemplate, tensCountTemplate, twoDigitComposeTemplate,
                tensDigitTemplate, onesDigitTemplate, nextTemplate, prevTemplate,
                biggerTemplate, smallerTemplate, compareOxTemplate]
  });
});
