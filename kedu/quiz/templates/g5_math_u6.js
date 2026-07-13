/* =============================================================
 * templates/g5_math_u6.js — 케이퀴즈: 5학년 1학기 6단원 「다각형의 둘레와 넓이」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g5_math_u6): l01 정다각형의 둘레 · l02 직사각형의 둘레 ·
 *   l03 넓이의 단위 · l04 직사각형의 넓이 · l05 평행사변형의 넓이 ·
 *   l06 삼각형의 넓이 · l07 마름모의 넓이 · l08 사다리꼴의 넓이 · l09 마무리
 * 성취기준 [6수03-01](다각형의 둘레)·[6수03-02](넓이 공식)
 *
 * 원칙: 넓이 공식은 **수치 관계**다 — 도형 그림 없이 텍스트로 완결(시각자산 무의존).
 *   "그림을 보고 밑변을 찾아라"는 문항은 만들지 않는다(그건 케이랩·차시의 몫).
 *   여기서 다루는 건 **공식의 적용과 역산**뿐 — 그건 순수 수 개념이다.
 *   ⭐ 삼각형·사다리꼴의 ÷2 를 빼먹는 오개념을 교란지·ox 로 직접 때린다.
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  /* ── 정다각형의 둘레 ───────────────────────────────────────────────── */
  var regPoly = {
    id: 't_reg_poly', type: 'param', difficulty: 1, concept: '정다각형의 둘레',
    itemType: 'short',
    gen: function (r) { return { n: r.int(3, 8), s: r.int(3, 25) }; },
    render: function (p) {
      var nm = { 3: '정삼각형', 4: '정사각형', 5: '정오각형', 6: '정육각형', 7: '정칠각형', 8: '정팔각형' }[p.n];
      return '한 변의 길이가 ' + p.s + 'cm인 ' + nm + '의 둘레는 몇 cm일까요?';
    },
    answer: function (p) { return p.n * p.s; },
    explain: function (p) { return p.s + ' × ' + p.n + ' = ' + (p.n * p.s) + 'cm'; }
  };

  /* ── 직사각형의 둘레 ───────────────────────────────────────────────── */
  var rectPeri = {
    id: 't_rect_peri', type: 'param', difficulty: 1, concept: '직사각형의 둘레',
    itemType: 'short',
    gen: function (r) { return { a: r.int(3, 30), b: r.int(3, 30) }; },
    render: function (p) {
      return '가로 ' + p.a + 'cm, 세로 ' + p.b + 'cm인 직사각형의 둘레는 몇 cm일까요?';
    },
    answer: function (p) { return (p.a + p.b) * 2; },
    explain: function (p) { return '(' + p.a + ' + ' + p.b + ') × 2 = ' + ((p.a + p.b) * 2) + 'cm'; }
  };

  /* ── 직사각형의 넓이 ───────────────────────────────────────────────── */
  var rectArea = {
    id: 't_rect_area', type: 'param', difficulty: 1, concept: '직사각형의 넓이',
    itemType: 'short',
    gen: function (r) { return { a: r.int(3, 30), b: r.int(3, 30) }; },
    render: function (p) {
      return '가로 ' + p.a + 'cm, 세로 ' + p.b + 'cm인 직사각형의 넓이는 몇 cm²일까요?';
    },
    answer: function (p) { return p.a * p.b; },
    explain: function (p) { return p.a + ' × ' + p.b + ' = ' + (p.a * p.b) + 'cm²'; }
  };

  /* ── 평행사변형의 넓이 ─────────────────────────────────────────────── */
  var paraArea = {
    id: 't_para_area', type: 'param', difficulty: 2, concept: '평행사변형의 넓이',
    itemType: 'short',
    gen: function (r) { return { b: r.int(4, 25), h: r.int(3, 20) }; },
    render: function (p) {
      return '밑변이 ' + p.b + 'cm, 높이가 ' + p.h + 'cm인 평행사변형의 넓이는 몇 cm²일까요?';
    },
    answer: function (p) { return p.b * p.h; },
    explain: function (p) { return '밑변 × 높이 = ' + p.b + ' × ' + p.h + ' = ' + (p.b * p.h) + 'cm²'; }
  };

  /* ── 삼각형의 넓이 (÷2 를 빼먹는 오개념) ──────────────────────────── */
  var triArea = {
    id: 't_tri_area', type: 'param', difficulty: 2, concept: '삼각형의 넓이',
    itemType: 'short',
    gen: function (r) {
      var b = r.int(2, 15) * 2;                     // 짝수 → 답이 정수
      return { b: b, h: r.int(3, 20) };
    },
    render: function (p) {
      return '밑변이 ' + p.b + 'cm, 높이가 ' + p.h + 'cm인 삼각형의 넓이는 몇 cm²일까요?';
    },
    answer: function (p) { return p.b * p.h / 2; },
    validate: function (p, ans) { return Number.isInteger(ans); },
    explain: function (p) {
      return '밑변 × 높이 ÷ 2 = ' + p.b + ' × ' + p.h + ' ÷ 2 = ' + (p.b * p.h / 2) + 'cm²';
    }
  };

  /* ── 마름모의 넓이 ─────────────────────────────────────────────────── */
  var rhombusArea = {
    id: 't_rhom_area', type: 'param', difficulty: 3, concept: '마름모의 넓이',
    itemType: 'short',
    gen: function (r) {
      var a = r.int(2, 14) * 2;
      return { a: a, b: r.int(3, 20) };
    },
    render: function (p) {
      return '두 대각선의 길이가 ' + p.a + 'cm, ' + p.b + 'cm인 마름모의 넓이는 몇 cm²일까요?';
    },
    answer: function (p) { return p.a * p.b / 2; },
    validate: function (p, ans) { return Number.isInteger(ans); },
    explain: function (p) {
      return '한 대각선 × 다른 대각선 ÷ 2 = ' + p.a + ' × ' + p.b + ' ÷ 2 = ' + (p.a * p.b / 2) + 'cm²';
    }
  };

  /* ── 사다리꼴의 넓이 ───────────────────────────────────────────────── */
  var trapArea = {
    id: 't_trap_area', type: 'param', difficulty: 3, concept: '사다리꼴의 넓이',
    itemType: 'short',
    gen: function (r) {
      var a = r.int(3, 15), b = r.int(3, 15);
      var h = r.int(2, 10) * 2;                     // 짝수 → 답이 정수
      return { a: a, b: b, h: h };
    },
    render: function (p) {
      return '윗변이 ' + p.a + 'cm, 아랫변이 ' + p.b + 'cm, 높이가 ' + p.h +
             'cm인 사다리꼴의 넓이는 몇 cm²일까요?';
    },
    answer: function (p) { return (p.a + p.b) * p.h / 2; },
    validate: function (p, ans) { return Number.isInteger(ans); },
    explain: function (p) {
      return '(윗변 + 아랫변) × 높이 ÷ 2 = (' + p.a + ' + ' + p.b + ') × ' + p.h + ' ÷ 2 = ' +
             ((p.a + p.b) * p.h / 2) + 'cm²';
    }
  };

  /* ── 넓이 역산 (수 입력 — 공식을 거꾸로) ──────────────────────────── */
  var areaReverse = {
    id: 't_area_rev', type: 'param', difficulty: 3, concept: '넓이 공식의 역산',
    itemType: 'short',
    gen: function (r) {
      var b = r.int(3, 20), h = r.int(3, 20);
      return { b: b, h: h, area: b * h };
    },
    render: function (p) {
      return '넓이가 ' + p.area + 'cm²이고 가로가 ' + p.b + 'cm인 직사각형의 세로는 몇 cm일까요?';
    },
    answer: function (p) { return p.area / p.b; },
    validate: function (p, ans) { return Number.isInteger(ans) && ans > 0; },
    explain: function (p) { return p.area + ' ÷ ' + p.b + ' = ' + (p.area / p.b) + 'cm'; }
  };

  /* ── ÷2 오개념 정면 타격 (참거짓 — 서바이벌 재료) ─────────────────── */
  var halfOx = {
    id: 't_half_ox', type: 'param', difficulty: 2, concept: '삼각형의 넓이',
    itemType: 'ox',
    gen: function (r) {
      var b = r.int(2, 12) * 2, h = r.int(3, 15);
      var right = b * h / 2;
      var myth = b * h;                              // ⚠️ ÷2 를 빼먹는 오개념
      return { b: b, h: h, claim: r.pick([right, myth]) };
    },
    render: function (p) {
      return '밑변 ' + p.b + 'cm, 높이 ' + p.h + 'cm인 삼각형의 넓이는 ' + p.claim + 'cm²입니다';
    },
    answer: function (p) { return p.claim === (p.b * p.h / 2); },
    explain: function (p) {
      return '삼각형은 밑변 × 높이 ÷ 2 → ' + (p.b * p.h / 2) + 'cm² (÷2 를 잊지 마세요)';
    }
  };

  function src(lesson) { return { grade: 5, subject: 'math', unit: 'u6', lesson: lesson }; }

  reg('g5_math_u6_l01', { source: src('l01'), fixed: [], templates: [regPoly] });
  reg('g5_math_u6_l02', { source: src('l02'), fixed: [], templates: [rectPeri] });
  reg('g5_math_u6_l04', { source: src('l04'), fixed: [], templates: [rectArea, areaReverse] });
  reg('g5_math_u6_l05', { source: src('l05'), fixed: [], templates: [paraArea] });
  reg('g5_math_u6_l06', { source: src('l06'), fixed: [], templates: [triArea, halfOx] });
  reg('g5_math_u6_l07', { source: src('l07'), fixed: [], templates: [rhombusArea] });
  reg('g5_math_u6_l08', { source: src('l08'), fixed: [], templates: [trapArea] });
  reg('g5_math_u6_l09', { source: src('l09'), fixed: [],
    templates: [regPoly, rectArea, paraArea, triArea, rhombusArea, trapArea, halfOx] });

  reg('g5_math_u6', {
    source: { grade: 5, subject: 'math', unit: 'u6', lesson: 'all' }, fixed: [],
    templates: [regPoly, rectPeri, rectArea, paraArea, triArea, rhombusArea, trapArea, areaReverse, halfOx]
  });
});
