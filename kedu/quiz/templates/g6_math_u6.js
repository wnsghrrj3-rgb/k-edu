/* =============================================================
 * templates/g6_math_u6.js — 케이퀴즈: 6학년 1학기 6단원 「직육면체의 부피와 겉넓이」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g6_math_u6): l01 부피 비교 · l02 1cm³ · l03 직육면체의 부피 ·
 *   l04 1m³ · l05 겉넓이 · l06 마무리
 * 성취기준 [6수03-05](직육면체의 부피·겉넓이)·[6수03-03](각기둥·각뿔의 구성 요소)
 *
 * 원칙: 부피·겉넓이는 **수치 관계**다 — 전개도 그림 없이 텍스트로 완결(시각자산 무의존).
 *   각기둥·각뿔의 면·모서리·꼭짓점 수도 **n에 대한 식**이라 순수 파라메트릭이다:
 *     n각기둥 → 면 n+2 · 모서리 3n · 꼭짓점 2n
 *     n각뿔   → 면 n+1 · 모서리 2n · 꼭짓점 n+1
 *   ⭐ 이 단원 최대 오개념: **겉넓이에서 면을 2배 안 하기** (한 쌍씩 있다는 걸 놓침).
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  var NAMES = { 3: '삼', 4: '사', 5: '오', 6: '육', 7: '칠', 8: '팔', 9: '구', 10: '십' };

  /* ── 직육면체의 부피 ───────────────────────────────────────────────── */
  var boxVolume = {
    id: 't_box_vol', type: 'param', difficulty: 1, concept: '직육면체의 부피',
    itemType: 'short',
    gen: function (r) { return { a: r.int(2, 15), b: r.int(2, 15), c: r.int(2, 15) }; },
    render: function (p) {
      return '가로 ' + p.a + 'cm, 세로 ' + p.b + 'cm, 높이 ' + p.c +
             'cm인 직육면체의 부피는 몇 cm³일까요?';
    },
    answer: function (p) { return p.a * p.b * p.c; },
    explain: function (p) {
      return '가로 × 세로 × 높이 = ' + p.a + ' × ' + p.b + ' × ' + p.c + ' = ' + (p.a * p.b * p.c) + 'cm³';
    }
  };

  /* ── 정육면체의 부피 ───────────────────────────────────────────────── */
  var cubeVolume = {
    id: 't_cube_vol', type: 'param', difficulty: 2, concept: '정육면체의 부피',
    itemType: 'short',
    gen: function (r) { return { a: r.int(2, 12) }; },
    render: function (p) {
      return '한 모서리가 ' + p.a + 'cm인 정육면체의 부피는 몇 cm³일까요?';
    },
    answer: function (p) { return p.a * p.a * p.a; },
    explain: function (p) {
      return p.a + ' × ' + p.a + ' × ' + p.a + ' = ' + (p.a * p.a * p.a) + 'cm³';
    }
  };

  /* ── 직육면체의 겉넓이 (최대 오개념: ×2 를 빼먹음) ────────────────── */
  var boxSurface = {
    id: 't_box_surf', type: 'param', difficulty: 3, concept: '직육면체의 겉넓이',
    itemType: 'short',
    gen: function (r) { return { a: r.int(2, 12), b: r.int(2, 12), c: r.int(2, 12) }; },
    render: function (p) {
      return '가로 ' + p.a + 'cm, 세로 ' + p.b + 'cm, 높이 ' + p.c +
             'cm인 직육면체의 겉넓이는 몇 cm²일까요?';
    },
    answer: function (p) { return 2 * (p.a * p.b + p.b * p.c + p.a * p.c); },
    explain: function (p) {
      return '(가로×세로 + 세로×높이 + 가로×높이) × 2 = (' +
             (p.a * p.b) + ' + ' + (p.b * p.c) + ' + ' + (p.a * p.c) + ') × 2 = ' +
             (2 * (p.a * p.b + p.b * p.c + p.a * p.c)) + 'cm² (면이 한 쌍씩 있어요)';
    }
  };

  /* ── 겉넓이 ×2 오개념 (참거짓 — 서바이벌 재료) ────────────────────── */
  var surfOx = {
    id: 't_surf_ox', type: 'param', difficulty: 3, concept: '직육면체의 겉넓이',
    itemType: 'ox',
    gen: function (r) {
      var a = r.int(2, 10), b = r.int(2, 10), c = r.int(2, 10);
      var right = 2 * (a * b + b * c + a * c);
      var myth = a * b + b * c + a * c;                 // ⚠️ ×2 를 빼먹은 오개념
      return { a: a, b: b, c: c, claim: r.pick([right, myth]) };
    },
    render: function (p) {
      return '가로 ' + p.a + 'cm, 세로 ' + p.b + 'cm, 높이 ' + p.c +
             'cm인 직육면체의 겉넓이는 ' + p.claim + 'cm²입니다';
    },
    answer: function (p) {
      return p.claim === 2 * (p.a * p.b + p.b * p.c + p.a * p.c);
    },
    explain: function (p) {
      return '마주 보는 면이 한 쌍씩 있으니 × 2 → ' +
             (2 * (p.a * p.b + p.b * p.c + p.a * p.c)) + 'cm²';
    }
  };

  /* ── 부피 역산 (수 입력) ───────────────────────────────────────────── */
  var volReverse = {
    id: 't_vol_rev', type: 'param', difficulty: 3, concept: '부피 공식의 역산',
    itemType: 'short',
    gen: function (r) {
      var a = r.int(2, 12), b = r.int(2, 12), c = r.int(2, 12);
      return { a: a, b: b, c: c, v: a * b * c };
    },
    render: function (p) {
      return '부피가 ' + p.v + 'cm³이고 밑면이 가로 ' + p.a + 'cm, 세로 ' + p.b +
             'cm인 직육면체의 높이는 몇 cm일까요?';
    },
    answer: function (p) { return p.v / (p.a * p.b); },
    validate: function (p, ans) { return Number.isInteger(ans) && ans > 0; },
    explain: function (p) {
      return p.v + ' ÷ (' + p.a + ' × ' + p.b + ') = ' + (p.v / (p.a * p.b)) + 'cm';
    }
  };

  function src(lesson) { return { grade: 6, subject: 'math', unit: 'u6', lesson: lesson }; }

  reg('g6_math_u6_l03', { source: src('l03'), fixed: [], templates: [boxVolume, cubeVolume] });
  reg('g6_math_u6_l05', { source: src('l05'), fixed: [], templates: [boxSurface, surfOx] });
  reg('g6_math_u6_l06', { source: src('l06'), fixed: [],
    templates: [boxVolume, cubeVolume, boxSurface, volReverse, surfOx] });

  reg('g6_math_u6', {
    source: { grade: 6, subject: 'math', unit: 'u6', lesson: 'all' }, fixed: [],
    templates: [boxVolume, cubeVolume, boxSurface, volReverse, surfOx]
  });

});
