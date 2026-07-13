/* =============================================================
 * templates/g6_math_u2.js — 케이퀴즈: 6학년 1학기 2단원 「각기둥과 각뿔」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g6_math_u2): l01 각기둥 · l02 각기둥의 구성 요소 · l03 전개도(퀴즈X) ·
 *   l04 각뿔과 그 구성 요소 · l05 각뿔의 전개도(퀴즈X) · l06 마무리
 * 성취기준 [6수03-03](각기둥·각뿔의 구성 요소)
 *
 * 원칙: 면·모서리·꼭짓점 수는 **n에 대한 식**이라 순수 파라메트릭이다.
 *     n각기둥 → 면 n+2 · 모서리 3n · 꼭짓점 2n
 *     n각뿔   → 면 n+1 · 모서리 2n · 꼭짓점 n+1
 *   ⛔ 전개도 문항은 만들지 않는다 — 시각 자산 의존이라 파라메트릭이 성립 안 한다
 *      (그건 케이랩·차시의 몫이다).
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  var NAMES = { 3: '삼', 4: '사', 5: '오', 6: '육', 7: '칠', 8: '팔', 9: '구', 10: '십' };

  var prismParts = {
    id: 't_prism', type: 'param', difficulty: 2, concept: '각기둥의 구성 요소',
    itemType: 'short',
    gen: function (r) {
      return { n: r.int(3, 10), what: r.pick(['면', '모서리', '꼭짓점']) };
    },
    render: function (p) {
      return NAMES[p.n] + '각기둥의 ' + p.what + '은(는) 모두 몇 개일까요?';
    },
    answer: function (p) {
      if (p.what === '면') return p.n + 2;
      if (p.what === '모서리') return 3 * p.n;
      return 2 * p.n;
    },
    explain: function (p) {
      if (p.what === '면') return '옆면 ' + p.n + '개 + 밑면 2개 = ' + (p.n + 2) + '개';
      if (p.what === '모서리') return '밑면 모서리 ' + p.n + '개씩 2 + 옆 모서리 ' + p.n + '개 = ' + (3 * p.n) + '개';
      return '밑면 꼭짓점 ' + p.n + '개씩 2 = ' + (2 * p.n) + '개';
    }
  };

  var pyramidParts = {
    id: 't_pyramid', type: 'param', difficulty: 2, concept: '각뿔의 구성 요소',
    itemType: 'short',
    gen: function (r) {
      return { n: r.int(3, 10), what: r.pick(['면', '모서리', '꼭짓점']) };
    },
    render: function (p) {
      return NAMES[p.n] + '각뿔의 ' + p.what + '은(는) 모두 몇 개일까요?';
    },
    answer: function (p) {
      if (p.what === '면') return p.n + 1;
      if (p.what === '모서리') return 2 * p.n;
      return p.n + 1;
    },
    explain: function (p) {
      if (p.what === '면') return '옆면 ' + p.n + '개 + 밑면 1개 = ' + (p.n + 1) + '개';
      if (p.what === '모서리') return '밑면 모서리 ' + p.n + '개 + 옆 모서리 ' + p.n + '개 = ' + (2 * p.n) + '개';
      return '밑면 꼭짓점 ' + p.n + '개 + 뿔의 꼭짓점 1개 = ' + (p.n + 1) + '개';
    }
  };

  /* ── 각기둥 vs 각뿔 (참거짓) ──────────────────────────────────────── */
  var solidOx = {
    id: 't_solid_ox', type: 'param', difficulty: 2, concept: '각기둥과 각뿔',
    itemType: 'ox',
    gen: function (r) {
      var n = r.int(3, 9);
      var kind = r.pick(['기둥', '뿔']);
      var what = r.pick(['면', '모서리', '꼭짓점']);
      var right = kind === '기둥'
        ? (what === '면' ? n + 2 : what === '모서리' ? 3 * n : 2 * n)
        : (what === '면' ? n + 1 : what === '모서리' ? 2 * n : n + 1);
      var claim = r.pick([right, right + r.int(1, 3), Math.max(1, right - r.int(1, 2))]);
      return { n: n, kind: kind, what: what, claim: claim, right: right };
    },
    render: function (p) {
      return NAMES[p.n] + '각' + p.kind + '의 ' + p.what + '은(는) ' + p.claim + '개입니다';
    },
    answer: function (p) { return p.claim === p.right; },
    explain: function (p) {
      return NAMES[p.n] + '각' + p.kind + '의 ' + p.what + '은(는) ' + p.right + '개예요';
    }
  };

  function src(lesson) { return { grade: 6, subject: 'math', unit: 'u2', lesson: lesson }; }

  reg('g6_math_u2_l02', { source: src('l02'), fixed: [], templates: [prismParts] });
  reg('g6_math_u2_l04', { source: src('l04'), fixed: [], templates: [pyramidParts] });
  reg('g6_math_u2_l06', { source: src('l06'), fixed: [], templates: [prismParts, pyramidParts, solidOx] });

  reg('g6_math_u2', {
    source: { grade: 6, subject: 'math', unit: 'u2', lesson: 'all' }, fixed: [],
    templates: [prismParts, pyramidParts, solidOx]
  });
});
