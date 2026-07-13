/* =============================================================
 * templates/g4_math_u2.js — 케이퀴즈: 4학년 1학기 2단원 「각도」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g4_math_u2): l01 각의 크기 · l02 각도 재기 · l03 예각·둔각 ·
 *   l04 각도 어림 · l05 각도의 합과 차 · l06 삼각형 세 각의 합 ·
 *   l07 사각형 네 각의 합 · l08 마무리
 * 성취기준 [4수02-01](각의 크기)·[4수02-02](삼각형·사각형 내각의 합)
 *
 * 원칙: 각도는 수치다 — 각도기 그림 없이 텍스트로 완결(시각자산 무의존).
 *   "그림에서 각도를 재라"는 문항은 만들지 않는다(각도기 조작은 케이랩·차시의 몫).
 *   여기서 다루는 건 **각도 사이의 관계**뿐 — 그건 순수 수 개념이다.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{a}도는 예각일까요, 둔각일까요?"                  → a<90 예각 / a>90 둔각
 *     "{a}도와 {b}도를 더하면 몇 도일까요?"              → a+b
 *     "{a}도에서 {b}도를 빼면 몇 도일까요?"              → a−b
 *     "삼각형의 두 각이 {a}도, {b}도일 때 나머지 한 각은?"  → 180−a−b
 *     "사각형의 세 각이 {a}도, {b}도, {c}도일 때 나머지는?" → 360−a−b−c
 *     "직각은 몇 도일까요?" 류 고정 문항 없음(전부 파라메트릭)
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var MINUS = '\u2212';

  /* ── 예각·직각·둔각 분류 (선택형) ───────────────────────────────────── */
  var sharpBlunt = {
    id: 't_sharp_blunt', type: 'param', difficulty: 1, concept: '예각과 둔각',
    itemType: 'choice',
    gen: function (r) {
      var kind = r.pick(['sharp', 'right', 'blunt']);
      var a = kind === 'right' ? 90
            : kind === 'sharp' ? r.int(10, 89)
            : r.int(91, 179);
      return { a: a };
    },
    render: function (p) { return p.a + '도는 어떤 각일까요?'; },
    answer: function (p) { return p.a < 90 ? '예각' : (p.a === 90 ? '직각' : '둔각'); },
    distractors: function (p) {
      return ['예각', '직각', '둔각'].filter(function (x) {
        return x !== (p.a < 90 ? '예각' : (p.a === 90 ? '직각' : '둔각'));
      });
    },
    choiceCount: 3,
    explain: function (p) {
      if (p.a < 90) return '0도보다 크고 직각(90도)보다 작으면 예각이에요';
      if (p.a === 90) return '90도는 직각이에요';
      return '직각(90도)보다 크고 180도보다 작으면 둔각이에요';
    }
  };

  /* ── 각도의 합 (수 입력) ─────────────────────────────────────────────── */
  var addAngle = {
    id: 't_angle_add', type: 'param', difficulty: 1, concept: '각도의 합과 차',
    itemType: 'short',
    gen: function (r) { return { a: r.int(15, 120), b: r.int(15, 120) }; },
    render: function (p) { return p.a + '도와 ' + p.b + '도를 더하면 몇 도일까요?'; },
    answer: function (p) { return p.a + p.b; },
    explain: function (p) { return p.a + ' + ' + p.b + ' = ' + (p.a + p.b) + '도'; }
  };

  /* ── 각도의 차 (수 입력) ─────────────────────────────────────────────── */
  var subAngle = {
    id: 't_angle_sub', type: 'param', difficulty: 2, concept: '각도의 합과 차',
    itemType: 'short', inRange: function (v) { return v > 0; },
    gen: function (r) {
      var a = r.int(60, 175), b = r.int(15, 120);
      if (a <= b) { var t = a; a = b + r.int(5, 30); b = t; }
      return { a: a, b: b };
    },
    render: function (p) { return p.a + '도에서 ' + p.b + '도를 빼면 몇 도일까요?'; },
    answer: function (p) { return p.a - p.b; },
    validate: function (p, ans) { return ans > 0; },
    explain: function (p) { return p.a + ' ' + MINUS + ' ' + p.b + ' = ' + (p.a - p.b) + '도'; }
  };

  /* ── 삼각형 세 각의 합 = 180도 (수 입력) ────────────────────────────── */
  var triangleSum = {
    id: 't_tri_sum', type: 'param', difficulty: 2, concept: '삼각형 세 각의 합',
    itemType: 'short', inRange: function (v) { return v > 0 && v < 180; },
    gen: function (r) {
      var a = r.int(20, 110);
      var b = r.int(20, 170 - a);
      return { a: a, b: b };
    },
    render: function (p) {
      return '삼각형의 두 각이 ' + p.a + '도, ' + p.b + '도일 때 나머지 한 각은 몇 도일까요?';
    },
    answer: function (p) { return 180 - p.a - p.b; },
    validate: function (p, ans) { return ans > 0 && ans < 180; },
    explain: function (p) {
      return '삼각형 세 각의 합은 180도 → 180 ' + MINUS + ' ' + p.a + ' ' + MINUS + ' ' + p.b +
             ' = ' + (180 - p.a - p.b) + '도';
    }
  };

  /* ── 사각형 네 각의 합 = 360도 (수 입력) ────────────────────────────── */
  var quadSum = {
    id: 't_quad_sum', type: 'param', difficulty: 3, concept: '사각형 네 각의 합',
    itemType: 'short', inRange: function (v) { return v > 0 && v < 360; },
    gen: function (r) {
      var a = r.int(50, 120), b = r.int(50, 120), c = r.int(50, 120);
      return { a: a, b: b, c: c };
    },
    render: function (p) {
      return '사각형의 세 각이 ' + p.a + '도, ' + p.b + '도, ' + p.c + '도일 때 나머지 한 각은 몇 도일까요?';
    },
    answer: function (p) { return 360 - p.a - p.b - p.c; },
    validate: function (p, ans) { return ans > 0 && ans < 360; },
    explain: function (p) {
      return '사각형 네 각의 합은 360도 → 360 ' + MINUS + ' ' + p.a + ' ' + MINUS + ' ' + p.b +
             ' ' + MINUS + ' ' + p.c + ' = ' + (360 - p.a - p.b - p.c) + '도';
    }
  };

  /* ── 참거짓 (서바이벌·ox 모드 재료) ─────────────────────────────────── */
  var angleOx = {
    id: 't_angle_ox', type: 'param', difficulty: 2, concept: '예각과 둔각',
    itemType: 'ox',
    gen: function (r) {
      var a = r.int(10, 179);
      var claim = r.pick(['sharp', 'blunt']);
      return { a: a, claim: claim };
    },
    render: function (p) {
      return p.a + '도는 ' + (p.claim === 'sharp' ? '예각' : '둔각') + '입니다';
    },
    answer: function (p) {
      return p.claim === 'sharp' ? (p.a < 90) : (p.a > 90);
    },
    validate: function (p) { return p.a !== 90; },
    explain: function (p) {
      return p.a + '도는 ' + (p.a < 90 ? '예각' : '둔각') + '이에요';
    }
  };

  /* ── 삼각형 성립 판단 (참거짓 · 고난도) ─────────────────────────────── */
  var triOx = {
    id: 't_tri_ox', type: 'param', difficulty: 3, concept: '삼각형 세 각의 합',
    itemType: 'ox',
    gen: function (r) {
      var a = r.int(30, 100), b = r.int(30, 100);
      var c = r.pick([180 - a - b, 180 - a - b + r.int(5, 25), 180 - a - b - r.int(5, 25)]);
      return { a: a, b: b, c: c };
    },
    render: function (p) {
      return '세 각이 ' + p.a + '도, ' + p.b + '도, ' + p.c + '도인 삼각형을 그릴 수 있습니다';
    },
    answer: function (p) { return (p.a + p.b + p.c) === 180; },
    validate: function (p) { return p.c > 0; },
    explain: function (p) {
      var s = p.a + p.b + p.c;
      return '세 각의 합이 ' + s + '도 → ' + (s === 180 ? '180도라 그릴 수 있어요' : '180도가 아니라 그릴 수 없어요');
    }
  };

  /* ── 차시별 등록 ─────────────────────────────────────────────────────── */
  function src(lesson) { return { grade: 4, subject: 'math', unit: 'u2', lesson: lesson }; }

  reg('g4_math_u2_l03', { source: src('l03'), fixed: [], templates: [sharpBlunt, angleOx] });
  reg('g4_math_u2_l04', { source: src('l04'), fixed: [], templates: [sharpBlunt] });
  reg('g4_math_u2_l05', { source: src('l05'), fixed: [], templates: [addAngle, subAngle] });
  reg('g4_math_u2_l06', { source: src('l06'), fixed: [], templates: [triangleSum, triOx] });
  reg('g4_math_u2_l07', { source: src('l07'), fixed: [], templates: [quadSum] });
  reg('g4_math_u2_l08', { source: src('l08'), fixed: [],
    templates: [sharpBlunt, addAngle, subAngle, triangleSum, quadSum, angleOx] });

  reg('g4_math_u2', {
    source: { grade: 4, subject: 'math', unit: 'u2', lesson: 'all' }, fixed: [],
    templates: [sharpBlunt, addAngle, subAngle, triangleSum, quadSum, angleOx, triOx]
  });
});
