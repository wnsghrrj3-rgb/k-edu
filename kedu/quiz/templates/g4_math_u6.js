/* =============================================================
 * templates/g4_math_u6.js — 케이퀴즈: 4학년 1학기 6단원 「규칙 찾기」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g4_math_u6): l01 수의 배열에서 규칙 · l02 도형의 배열에서 규칙 ·
 *   l03 계산식의 배열 · l04 규칙적인 계산식 찾기 · l05 마무리
 * 성취기준 [4수04-01](수·도형의 배열에서 규칙 찾기)·[4수04-02](규칙을 수식으로)
 *
 * 원칙: 규칙은 수열이다 — 그림 없이 텍스트로 완결(시각자산 무의존).
 *   도형 배열도 **개수의 수열**로 환원해서 낸다(정삼각형 1층·2층·3층 = 1, 3, 6…).
 *   그래야 "그림을 봐야 푸는 문제"가 안 되고 파라메트릭이 성립한다.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{s1}, {s2}, {s3}, {s4}, … 다음에 올 수는 무엇일까요?"  → 규칙에 따라
 *     "{a}부터 {step}씩 커지는 수열의 {k}번째 수는 무엇일까요?" → a + step*(k−1)
 *     "이 수열은 {step}씩 커집니다"  (참거짓)                 → 실제 공차와 비교
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  function seqText(arr) { return arr.join(', ') + ', …'; }

  /* ── 등차수열: 다음에 올 수 (수 입력) ───────────────────────────────── */
  var arithNext = {
    id: 't_arith_next', type: 'param', difficulty: 1, concept: '수의 배열 규칙',
    itemType: 'short',
    gen: function (r) {
      var a = r.int(3, 60);
      var d = r.pick([2, 3, 4, 5, 6, 7, 10, 25, 50, 100]);
      return { a: a, d: d };
    },
    render: function (p) {
      var s = [p.a, p.a + p.d, p.a + 2 * p.d, p.a + 3 * p.d];
      return seqText(s) + ' 다음에 올 수는 무엇일까요?';
    },
    answer: function (p) { return p.a + 4 * p.d; },
    explain: function (p) { return p.d + '씩 커지는 규칙이에요 → ' + (p.a + 3 * p.d) + ' + ' + p.d + ' = ' + (p.a + 4 * p.d); }
  };

  /* ── 등차수열: 줄어드는 규칙 (수 입력) ──────────────────────────────── */
  var arithDown = {
    id: 't_arith_down', type: 'param', difficulty: 2, concept: '수의 배열 규칙',
    itemType: 'short', inRange: function (v) { return v >= 0; },
    gen: function (r) {
      var d = r.pick([3, 4, 5, 6, 7, 10, 20, 50]);
      var a = d * r.int(6, 20);                          // 5번째 항까지 음수가 안 되게
      return { a: a, d: d };
    },
    render: function (p) {
      var s = [p.a, p.a - p.d, p.a - 2 * p.d, p.a - 3 * p.d];
      return seqText(s) + ' 다음에 올 수는 무엇일까요?';
    },
    answer: function (p) { return p.a - 4 * p.d; },
    validate: function (p, ans) { return ans >= 0; },
    explain: function (p) { return p.d + '씩 작아지는 규칙이에요 → ' + (p.a - 4 * p.d); }
  };

  /* ── 등비수열: 곱하는 규칙 (수 입력) ────────────────────────────────── */
  var geoNext = {
    id: 't_geo_next', type: 'param', difficulty: 3, concept: '수의 배열 규칙',
    itemType: 'short',
    gen: function (r) {
      var a = r.int(1, 6);
      var m = r.pick([2, 3, 10]);
      return { a: a, m: m };
    },
    render: function (p) {
      var s = [p.a, p.a * p.m, p.a * p.m * p.m, p.a * p.m * p.m * p.m];
      return seqText(s) + ' 다음에 올 수는 무엇일까요?';
    },
    answer: function (p) { return p.a * Math.pow(p.m, 4); },
    explain: function (p) { return p.m + '씩 곱하는 규칙이에요 → ' + (p.a * Math.pow(p.m, 3)) + ' × ' + p.m + ' = ' + (p.a * Math.pow(p.m, 4)); }
  };

  /* ── n번째 수 구하기 (수 입력) — 규칙을 식으로 ─────────────────────── */
  var nthTerm = {
    id: 't_nth', type: 'param', difficulty: 3, concept: '규칙을 식으로 나타내기',
    itemType: 'short',
    gen: function (r) {
      return { a: r.int(2, 30), step: r.pick([3, 4, 5, 6, 7, 8, 10]), k: r.int(6, 20) };
    },
    render: function (p) {
      return p.a + '부터 ' + p.step + '씩 커지는 수열의 ' + p.k + '번째 수는 무엇일까요?';
    },
    answer: function (p) { return p.a + p.step * (p.k - 1); },
    explain: function (p) {
      return p.a + ' + ' + p.step + ' × (' + p.k + ' ' + '\u2212' + ' 1) = ' + (p.a + p.step * (p.k - 1));
    }
  };

  /* ── 도형 배열 → 개수 수열 (수 입력) ────────────────────────────────── */
  //  "그림을 봐야 푸는 문제"를 만들지 않는다. 도형 배열도 개수의 규칙으로 환원한다.
  var shapeCount = {
    id: 't_shape', type: 'param', difficulty: 2, concept: '도형의 배열 규칙',
    itemType: 'short',
    gen: function (r) {
      var base = r.int(1, 4);                            // 1층에 놓인 개수
      var add = r.int(2, 5);                             // 층마다 늘어나는 개수
      var k = r.int(5, 9);                               // 묻는 층
      return { base: base, add: add, k: k };
    },
    render: function (p) {
      var s = [p.base, p.base + p.add, p.base + 2 * p.add, p.base + 3 * p.add];
      return '쌓기나무를 1층에 ' + p.base + '개 놓고, 한 층 올라갈 때마다 ' + p.add +
             '개씩 더 놓아요. (' + seqText(s) + ') ' + p.k + '층에는 몇 개일까요?';
    },
    answer: function (p) { return p.base + p.add * (p.k - 1); },
    explain: function (p) {
      return p.base + ' + ' + p.add + ' × (' + p.k + ' \u2212 1) = ' + (p.base + p.add * (p.k - 1)) + '개';
    }
  };

  /* ── 규칙 판단 (참거짓 — 서바이벌·ox 재료) ─────────────────────────── */
  var ruleOx = {
    id: 't_rule_ox', type: 'param', difficulty: 2, concept: '수의 배열 규칙',
    itemType: 'ox',
    gen: function (r) {
      var a = r.int(2, 40);
      var d = r.pick([2, 3, 4, 5, 6, 10]);
      var claim = r.pick([d, d + r.int(1, 3), Math.max(1, d - r.int(1, 2))]);
      return { a: a, d: d, claim: claim };
    },
    render: function (p) {
      var s = [p.a, p.a + p.d, p.a + 2 * p.d, p.a + 3 * p.d];
      return seqText(s) + ' 이 수열은 ' + p.claim + '씩 커집니다';
    },
    answer: function (p) { return p.claim === p.d; },
    explain: function (p) { return '이 수열은 ' + p.d + '씩 커져요'; }
  };

  /* ── 계산식의 배열 (선택형) ─────────────────────────────────────────── */
  var calcPattern = {
    id: 't_calc_pat', type: 'param', difficulty: 3, concept: '계산식의 배열',
    itemType: 'short',
    gen: function (r) {
      var k = r.int(4, 8);                               // 몇 번째 식인가
      return { k: k };
    },
    render: function (p) {
      // 1×9+2=11, 12×9+3=111, 123×9+4=1111 … 규칙적인 계산식
      var lines = ['1 × 9 + 2 = 11', '12 × 9 + 3 = 111', '123 × 9 + 4 = 1111'];
      return lines.join(' / ') + ' … 이런 규칙으로 갈 때 ' + p.k +
             '번째 식의 답은 1이 몇 개일까요?';
    },
    answer: function (p) { return p.k + 1; },            // 1의 개수 = k+1
    explain: function (p) {
      return p.k + '번째 식의 답은 1이 ' + (p.k + 1) + '개예요 (한 줄 내려갈 때마다 1이 하나씩 늘어요)';
    }
  };

  /* ── 차시별 등록 ─────────────────────────────────────────────────────── */
  function src(lesson) { return { grade: 4, subject: 'math', unit: 'u6', lesson: lesson }; }

  reg('g4_math_u6_l01', { source: src('l01'), fixed: [], templates: [arithNext, arithDown, ruleOx] });
  reg('g4_math_u6_l02', { source: src('l02'), fixed: [], templates: [shapeCount] });
  reg('g4_math_u6_l03', { source: src('l03'), fixed: [], templates: [calcPattern] });
  reg('g4_math_u6_l04', { source: src('l04'), fixed: [], templates: [nthTerm, geoNext] });
  reg('g4_math_u6_l05', { source: src('l05'), fixed: [],
    templates: [arithNext, arithDown, geoNext, nthTerm, shapeCount, ruleOx] });

  reg('g4_math_u6', {
    source: { grade: 4, subject: 'math', unit: 'u6', lesson: 'all' }, fixed: [],
    templates: [arithNext, arithDown, geoNext, nthTerm, shapeCount, ruleOx, calcPattern]
  });
});
