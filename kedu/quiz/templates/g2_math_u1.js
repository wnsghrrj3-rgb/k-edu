/* =============================================================
 * templates/g2_math_u1.js — 케이퀴즈: 2학년 1학기 1단원 「세 자리 수」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g2_math_u1): l01 도입(퀴즈X) · l02 백 · l03 몇백 · l04 세 자리 수 ·
 *   l05 자릿값(같은 3, 다른 값) · l06 뛰어 세기 · l07 수의 크기 비교 ·
 *   l08 정리·평가 · l09 창작(퀴즈X)
 * 성취기준 [2수01-01~03](세 자리 수·자릿값·크기 비교)
 *
 * 원칙: 전 문항 수치 파라메트릭 → test가 동일 수식으로 독립 재계산.
 *   크기 비교·다음/앞 수는 g1 문구를 그대로 재사용(재계산 브랜치 공유).
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{base}이 {k}개이면 얼마일까요?"                           → base*k
 *     "100이 {a}개, 10이 {b}개, 1이 {c}개이면 얼마일까요?"        → 100a+10b+c
 *     "{N}에서 {백|십|일}의 자리 숫자는 무엇일까요?"              → 해당 자리 숫자
 *     "{N}에서 {백|십|일}의 자리 숫자 {d}는 얼마를 나타낼까요?"   → d×자릿값
 *     "{a}부터 {step}씩 뛰어 세면 「a, a+step, a+2step」 다음…"    → a+3·step
 *     (재사용) "…중에서 더 큰/작은 수는", "…다음/바로 앞의 수는", "…보다 큽니다/작습니다"
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  // ── l02·l03: 단위가 몇 개이면 얼마 (10·100) ──────────────────────────────
  function makeUnitCount(id, base, kMin, kMax) {
    return {
      id: id, type: 'param', difficulty: 1,
      gen: function (r) { return { base: base, k: r.int(kMin, kMax) }; },
      render: function (p) { return p.base + '이 ' + p.k + '개이면 얼마일까요?'; },
      answer: function (p) { return p.base * p.k; },
      distractors: function (p) { return [p.base * (p.k + 1), p.base * Math.max(1, p.k - 1)]; },
      explain: function (p) { return p.base + '이 ' + p.k + '개이면 ' + (p.base * p.k) + '이에요'; }
    };
  }
  var unit10  = makeUnitCount('t_unit10', 10, 1, 10);
  var unit100 = makeUnitCount('t_unit100', 100, 2, 9);

  // ── l04: 세 자리 수 구성 (100이 a·10이 b·1이 c) ──────────────────────────
  var threeCompose = {
    id: 't_three_compose', type: 'param', difficulty: 2,
    gen: function (r) { return { a: r.int(1, 9), b: r.int(0, 9), c: r.int(0, 9) }; },
    render: function (p) { return '100이 ' + p.a + '개, 10이 ' + p.b + '개, 1이 ' + p.c + '개이면 얼마일까요?'; },
    answer: function (p) { return 100 * p.a + 10 * p.b + p.c; },
    distractors: function (p) {
      return [100 * p.a + p.b * 1 + p.c * 10, 100 * p.a + 10 * p.b, p.a + 10 * p.b + 100 * p.c];
    },
    explain: function (p) { return '100이 ' + p.a + '개는 ' + (100 * p.a) + ', 10이 ' + p.b + '개는 ' + (10 * p.b) + ', 1이 ' + p.c + '개는 ' + p.c + ' → ' + (100 * p.a + 10 * p.b + p.c); }
  };

  // ── l05: 자릿값 — 자리 숫자 찾기 / 나타내는 값 ───────────────────────────
  function digitAt(N, place) {
    return place === '백' ? Math.floor(N / 100) % 10 : place === '십' ? Math.floor(N / 10) % 10 : N % 10;
  }
  function placeVal(place) { return place === '백' ? 100 : place === '십' ? 10 : 1; }

  var placeDigit = {
    id: 't_place_digit', type: 'param', difficulty: 2,
    gen: function (r) { return { N: r.int(100, 999), place: r.pick(['백', '십', '일']) }; },
    render: function (p) { return p.N + '에서 ' + p.place + '의 자리 숫자는 무엇일까요?'; },
    answer: function (p) { return digitAt(p.N, p.place); },
    inRange: function (v) { return v >= 0 && v <= 9; },
    distractors: function (p) { return [digitAt(p.N, '백'), digitAt(p.N, '십'), digitAt(p.N, '일')]; },
    explain: function (p) { return p.N + '의 ' + p.place + '의 자리 숫자는 ' + digitAt(p.N, p.place) + '이에요'; }
  };

  var placeValue = {
    id: 't_place_value', type: 'param', difficulty: 3,
    gen: function (r) { var N = r.int(100, 999), place = r.pick(['백', '십', '일']); return { N: N, place: place, d: digitAt(N, place) }; },
    validate: function (p) { return p.d > 0; },   // 0은 자릿값 의미가 흐려 제외
    render: function (p) { return p.N + '에서 ' + p.place + '의 자리 숫자 ' + p.d + '는 얼마를 나타낼까요?'; },
    answer: function (p) { return p.d * placeVal(p.place); },
    inRange: function (v) { return v >= 0; },
    distractors: function (p) { return [p.d, p.d * 10, p.d * 100]; },
    explain: function (p) { return p.place + '의 자리 숫자 ' + p.d + '는 ' + (p.d * placeVal(p.place)) + '을(를) 나타내요'; }
  };

  // ── l06: 뛰어 세기 (1·10·100씩) ─────────────────────────────────────────
  var skipCount = {
    id: 't_skip', type: 'param', difficulty: 2,
    gen: function (r) { var step = r.pick([1, 10, 100]); var start = r.int(100, 999 - 3 * step); return { start: start, step: step }; },
    render: function (p) {
      var a = p.start, b = a + p.step, c = a + 2 * p.step;
      return a + '부터 ' + p.step + '씩 뛰어 세면 「' + a + ', ' + b + ', ' + c + '」 다음에 올 수는 무엇일까요?';
    },
    answer: function (p) { return p.start + 3 * p.step; },
    distractors: function (p) { return [p.start + 2 * p.step, p.start + 4 * p.step, p.start + 3 * p.step + 1]; },
    explain: function (p) { return p.step + '씩 더해 가면 다음은 ' + (p.start + 3 * p.step) + '이에요'; }
  };

  // ── l06/l07: 다음/바로 앞 수 (g1 문구 재사용) ───────────────────────────
  var nextNum = {
    id: 't_next', type: 'param', difficulty: 1,
    gen: function (r) { return { n: r.int(100, 998) }; },
    render: function (p) { return p.n + ' 다음의 수는 무엇일까요?'; },
    answer: function (p) { return p.n + 1; },
    explain: function (p) { return p.n + ' 바로 다음은 ' + (p.n + 1); }
  };
  var prevNum = {
    id: 't_prev', type: 'param', difficulty: 1,
    gen: function (r) { return { n: r.int(101, 999) }; },
    render: function (p) { return p.n + ' 바로 앞의 수는 무엇일까요?'; },
    answer: function (p) { return p.n - 1; },
    explain: function (p) { return p.n + ' 바로 앞은 ' + (p.n - 1); }
  };

  // ── l07: 크기 비교 (choice·OX, g1 문구 재사용) ──────────────────────────
  function twoDistinct(r) { var a = r.int(100, 999), b; do { b = r.int(100, 999); } while (b === a); return [a, b]; }
  var cmpBig = {
    id: 't_cmp_big', type: 'param', difficulty: 2,
    gen: function (r) { var ab = twoDistinct(r); return { a: ab[0], b: ab[1] }; },
    render: function (p) { return p.a + '와(과) ' + p.b + ' 중에서 더 큰 수는 무엇일까요?'; },
    answer: function (p) { return Math.max(p.a, p.b); },
    distractors: function (p) { return [Math.min(p.a, p.b)]; },
    explain: function (p) { return Math.max(p.a, p.b) + '이(가) 더 커요'; }
  };
  var cmpSmall = {
    id: 't_cmp_small', type: 'param', difficulty: 2,
    gen: function (r) { var ab = twoDistinct(r); return { a: ab[0], b: ab[1] }; },
    render: function (p) { return p.a + '와(과) ' + p.b + ' 중에서 더 작은 수는 무엇일까요?'; },
    answer: function (p) { return Math.min(p.a, p.b); },
    distractors: function (p) { return [Math.max(p.a, p.b)]; },
    explain: function (p) { return Math.min(p.a, p.b) + '이(가) 더 작아요'; }
  };
  var cmpOx = {
    id: 't_cmp_ox', type: 'param', itemType: 'ox', difficulty: 2,
    gen: function (r) {
      var ab = twoDistinct(r), word = r.next() < 0.5 ? '큽니다' : '작습니다';
      return { a: ab[0], b: ab[1], word: word, truth: word === '큽니다' ? ab[0] > ab[1] : ab[0] < ab[1] };
    },
    render: function (p) { return '다음이 맞으면 O, 틀리면 X.\n' + p.a + '은(는) ' + p.b + '보다 ' + p.word + '.'; },
    answer: function (p) { return p.truth; },
    explain: function (p) { return p.a + '은(는) ' + p.b + '보다 ' + (p.a > p.b ? '큽니다' : '작습니다'); }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 2, subject: 'math', unit: 'u1', lesson: lesson }; }

  reg('g2_math_u1_l02', { source: src('l02'), fixed: [], templates: [unit10] });
  reg('g2_math_u1_l03', { source: src('l03'), fixed: [], templates: [unit100] });
  reg('g2_math_u1_l04', { source: src('l04'), fixed: [], templates: [threeCompose] });
  reg('g2_math_u1_l05', { source: src('l05'), fixed: [], templates: [placeDigit, placeValue] });
  reg('g2_math_u1_l06', { source: src('l06'), fixed: [], templates: [skipCount, nextNum, prevNum] });
  reg('g2_math_u1_l07', { source: src('l07'), fixed: [], templates: [cmpBig, cmpSmall, cmpOx] });
  reg('g2_math_u1_l08', { source: src('l08'), fixed: [], templates: [threeCompose, placeDigit, skipCount, cmpBig, cmpOx] });

  reg('g2_math_u1', {
    source: { grade: 2, subject: 'math', unit: 'u1', lesson: 'all' }, fixed: [],
    templates: [unit10, unit100, threeCompose, placeDigit, placeValue, skipCount, nextNum, prevNum, cmpBig, cmpSmall, cmpOx]
  });
});
