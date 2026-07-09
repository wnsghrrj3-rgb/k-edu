/* =============================================================
 * templates/g1_math_u3.js — 케이퀴즈 파일럿: 1학년 1학기 3단원 「덧셈과 뺄셈」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2
 *
 * 차시(g1_math_u3): l01 자연과함께해요(도입) · l02·l03 모으기와가르기 ·
 *   l04 덧셈알기 · l05 덧셈하기 · l06 덧셈종합 · l08 뺄셈알기 ·
 *   l09 뺄셈하기 · l11 0더하고빼기 · l12 덧셈과뺄셈 · l13 정리
 *
 * 원칙: 정답은 코드가 계산(param) → 틀린 문제 원천 차단.
 *   합·차 범위 = 한 자리 수 세계(0..9). validate로 범위 밖 재생성.
 *   저작권: 순수 수식 — 교과서 문항 차용 0.
 *
 * 노출: window.KQuiz.register(lessonKey, def). node 테스트는 core를 먼저 require.
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory;                 // node: 테스트가 core 주입해 factory(KQuiz) 호출
    return;
  }
  factory(root.KQuiz);                          // 브라우저: core 선로드 전제(window.KQuiz.core)
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  // node 테스트는 core api 직접 주입 / 브라우저는 window.KQuiz(.core 보유) 주입 — 양쪽 대응
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  // ── 공용 템플릿 조각 ─────────────────────────────────────────────────────
  var inRange0to9 = function (v) { return v >= 0 && v <= 9; };

  // 덧셈(합 ≤ 9)
  function addTemplate(id, diff) {
    return {
      id: id, type: 'param', difficulty: diff || 1, inRange: inRange0to9,
      gen: function (rng) { var a = rng.int(1, 8), b = rng.int(1, 9 - a); return { a: a, b: b }; },
      render: function (p) { return p.a + ' + ' + p.b + ' = ?'; },
      answer: function (p) { return p.a + p.b; },
      distractors: function (p, ans) { return [ans - 1, ans + 1, ans + 2, p.a, p.b]; },
      validate: function (p, ans) { return ans >= 2 && ans <= 9; },
      explain: function (p, ans) { return p.a + '에서 ' + p.b + '만큼 이어 세면 ' + ans; }
    };
  }
  // 뺄셈(피감수 ≤ 9, 차 ≥ 0)
  function subTemplate(id, diff) {
    return {
      id: id, type: 'param', difficulty: diff || 1, inRange: inRange0to9,
      gen: function (rng) { var a = rng.int(2, 9), b = rng.int(1, a); return { a: a, b: b }; },
      render: function (p) { return p.a + ' − ' + p.b + ' = ?'; },
      answer: function (p) { return p.a - p.b; },
      distractors: function (p, ans) { return [ans + 1, ans - 1, ans + 2, p.a, p.b]; },
      validate: function (p, ans) { return ans >= 0 && ans <= 8; },
      explain: function (p, ans) { return p.a + '에서 ' + p.b + '만큼 덜어 내면 ' + ans; }
    };
  }
  // 모으기(두 수 → 합), 가르기(수 → 두 갈래 중 빈칸)
  var gatherTemplate = {
    id: 't_gather', type: 'param', difficulty: 1, inRange: inRange0to9,
    gen: function (rng) { var a = rng.int(1, 8), b = rng.int(1, 9 - a); return { a: a, b: b }; },
    render: function (p) { return p.a + '과(와) ' + p.b + '을(를) 모으면 얼마일까요?'; },
    answer: function (p) { return p.a + p.b; },
    distractors: function (p, ans) { return [ans - 1, ans + 1, Math.abs(p.a - p.b)]; },
    validate: function (p, ans) { return ans >= 2 && ans <= 9; },
    explain: function (p, ans) { return p.a + '과 ' + p.b + '를 모으면 ' + ans; }
  };
  var splitTemplate = {
    id: 't_split', type: 'param', difficulty: 2, inRange: inRange0to9,
    gen: function (rng) { var s = rng.int(3, 9), a = rng.int(1, s - 1); return { s: s, a: a }; },
    render: function (p) { return p.s + '을(를) ' + p.a + '와(과) 몇으로 가를 수 있을까요?'; },
    answer: function (p) { return p.s - p.a; },
    distractors: function (p, ans) { return [ans + 1, ans - 1, p.s]; },
    validate: function (p, ans) { return ans >= 1 && ans <= 8; },
    explain: function (p, ans) { return p.s + '는 ' + p.a + '와 ' + ans + '로 가를 수 있어요'; }
  };
  // 0을 더하고 빼기 — OX 형(개념 확인)
  var zeroTemplate = {
    id: 't_zero', type: 'param', itemType: 'ox', difficulty: 1,
    gen: function (rng) {
      var n = rng.int(1, 9), op = rng.pick(['+', '−']);
      var right = op === '+' ? (n + ' + 0 = ' + n) : (n + ' − 0 = ' + n);
      var wrong = op === '+' ? (n + ' + 0 = ' + (n + 1)) : (n + ' − 0 = ' + (n - 1));
      var showTrue = rng.next() < 0.5;
      return { text: showTrue ? right : wrong, truth: showTrue };
    },
    render: function (p) { return '다음 식이 맞으면 O, 틀리면 X.  ' + p.text; },
    answer: function (p) { return p.truth; },
    explain: function () { return '어떤 수에 0을 더하거나 빼도 그 수는 그대로예요'; }
  };
  // 덧셈·뺄셈 혼합(종합) — 식 자동 생성
  var mixedTemplate = {
    id: 't_mixed', type: 'param', difficulty: 2, inRange: inRange0to9,
    gen: function (rng) {
      if (rng.next() < 0.5) { var a = rng.int(1, 8), b = rng.int(1, 9 - a); return { a: a, b: b, op: '+' }; }
      var x = rng.int(2, 9), y = rng.int(1, x); return { a: x, b: y, op: '−' };
    },
    render: function (p) { return p.a + ' ' + p.op + ' ' + p.b + ' = ?'; },
    answer: function (p) { return p.op === '+' ? p.a + p.b : p.a - p.b; },
    distractors: function (p, ans) { return [ans - 1, ans + 1, ans + 2, p.a]; },
    validate: function (p, ans) { return ans >= 0 && ans <= 9; },
    explain: function (p, ans) { return '답은 ' + ans; }
  };
  // 빈칸 채우기(□ + b = c) — short 형, 덧셈 역연산
  var blankTemplate = {
    id: 't_blank', type: 'param', itemType: 'short', difficulty: 3,
    gen: function (rng) { var a = rng.int(1, 8), b = rng.int(1, 9 - a); return { a: a, b: b, c: a + b }; },
    render: function (p) { return '□ + ' + p.b + ' = ' + p.c + '  일 때 □에 알맞은 수는?'; },
    answer: function (p) { return p.a; },
    validate: function (p) { return p.a >= 1 && p.c <= 9; },
    explain: function (p) { return p.c + '에서 ' + p.b + '를 빼면 ' + p.a; }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 1, subject: 'math', unit: 'u3', lesson: lesson }; }

  // l02·l03 모으기와 가르기
  reg('g1_math_u3_l02', { source: src('l02'), fixed: [], templates: [gatherTemplate] });
  reg('g1_math_u3_l03', { source: src('l03'), fixed: [], templates: [gatherTemplate, splitTemplate] });
  // l04 덧셈 알기 · l05 덧셈 하기 · l06 덧셈 종합
  reg('g1_math_u3_l04', { source: src('l04'), fixed: [], templates: [addTemplate('t_add', 1)] });
  reg('g1_math_u3_l05', { source: src('l05'), fixed: [], templates: [addTemplate('t_add', 1), gatherTemplate] });
  reg('g1_math_u3_l06', { source: src('l06'), fixed: [], templates: [addTemplate('t_add', 1), addTemplate('t_add2', 2)] });
  // l08 뺄셈 알기 · l09 뺄셈 하기
  reg('g1_math_u3_l08', { source: src('l08'), fixed: [], templates: [subTemplate('t_sub', 1)] });
  reg('g1_math_u3_l09', { source: src('l09'), fixed: [], templates: [subTemplate('t_sub', 1), splitTemplate] });
  // l11 0을 더하고 빼기
  reg('g1_math_u3_l11', { source: src('l11'), fixed: [], templates: [zeroTemplate, addTemplate('t_add', 1)] });
  // l12 덧셈과 뺄셈 · l13 정리(혼합+빈칸)
  reg('g1_math_u3_l12', { source: src('l12'), fixed: [], templates: [mixedTemplate] });
  reg('g1_math_u3_l13', { source: src('l13'), fixed: [], templates: [mixedTemplate, blankTemplate, zeroTemplate] });

  // 단원 전체 세트(범위 통합 과제용)
  reg('g1_math_u3', {
    source: { grade: 1, subject: 'math', unit: 'u3', lesson: 'all' }, fixed: [],
    templates: [addTemplate('t_add', 1), subTemplate('t_sub', 1), gatherTemplate,
                splitTemplate, zeroTemplate, mixedTemplate, blankTemplate]
  });
});
