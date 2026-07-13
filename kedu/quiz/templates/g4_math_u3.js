/* =============================================================
 * templates/g4_math_u3.js — 케이퀴즈: 4학년 1학기 3단원 「곱셈과 나눗셈」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g4_math_u3): l01 (세 자리)×(몇십) · l02 (세 자리)×(두 자리) ·
 *   l03 (세 자리)÷(몇십) · l04 (두·세 자리)÷(두 자리) 몫 한 자리 ·
 *   l05 몫 두 자리 · l06 나머지가 있는 나눗셈 · l07 검산 · l08 마무리
 * 성취기준 [4수01-04](곱셈)·[4수01-05](나눗셈과 검산)
 *
 * 원칙: 순수 수 연산 — 시각자산 무의존, 교과서 문항 차용 0.
 *   나눗셈은 **몫과 나머지를 따로 묻는다**(한 문제에 답이 둘이면 탭 조작으로 못 낸다).
 *   검산 문항이 이 단원의 핵심 개념이라 별도 템플릿으로 세운다.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{a} × {b} = ?"                                 → a*b
 *     "{a} ÷ {b}의 몫은 얼마일까요?"                   → floor(a/b)
 *     "{a} ÷ {b}의 나머지는 얼마일까요?"               → a%b
 *     "{a} ÷ {b} = {q} … {r} 입니다"  (참거짓)        → a === b*q + r && r < b
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  /* ── 곱셈 ────────────────────────────────────────────────────────────── */
  function makeMul(id, diff, concept, genFn) {
    return {
      id: id, type: 'param', difficulty: diff, concept: concept,
      itemType: 'short',
      gen: genFn,
      render: function (p) { return p.a + ' × ' + p.b + ' = ?'; },
      answer: function (p) { return p.a * p.b; },
      explain: function (p) { return p.a + ' × ' + p.b + ' = ' + (p.a * p.b); }
    };
  }
  var mulTens = makeMul('t_mul_tens', 1, '(세 자리)×(몇십)', function (r) {
    return { a: r.int(102, 989), b: r.int(2, 9) * 10 };
  });
  var mul2 = makeMul('t_mul2', 2, '(세 자리)×(두 자리)', function (r) {
    return { a: r.int(102, 989), b: r.int(12, 99) };
  });
  var mul3 = makeMul('t_mul3', 3, '(세 자리)×(두 자리)', function (r) {
    return { a: r.int(305, 989), b: r.int(45, 99) };      // 받아올림 잦은 구간
  });

  /* ── 나눗셈: 몫 ──────────────────────────────────────────────────────── */
  function makeQuot(id, diff, concept, genFn) {
    return {
      id: id, type: 'param', difficulty: diff, concept: concept,
      itemType: 'short', inRange: function (v) { return v >= 1; },
      gen: genFn,
      render: function (p) { return p.a + ' ÷ ' + p.b + '의 몫은 얼마일까요?'; },
      answer: function (p) { return Math.floor(p.a / p.b); },
      validate: function (p, ans) { return ans >= 1 && p.b > 0; },
      explain: function (p) {
        var q = Math.floor(p.a / p.b), r = p.a % p.b;
        return p.a + ' ÷ ' + p.b + ' = ' + q + (r ? ' … ' + r : '') + ' → 몫은 ' + q;
      }
    };
  }
  var quotTens = makeQuot('t_quot_tens', 1, '(세 자리)÷(몇십)', function (r) {
    var b = r.int(2, 9) * 10;
    return { a: r.int(b, 999), b: b };
  });
  var quot1 = makeQuot('t_quot1', 2, '(세 자리)÷(두 자리)', function (r) {
    var b = r.int(12, 49);
    return { a: r.int(b * 2, b * 9 + b - 1), b: b };      // 몫 한 자리
  });
  var quot2 = makeQuot('t_quot2', 3, '(세 자리)÷(두 자리)', function (r) {
    var b = r.int(12, 39);
    return { a: r.int(b * 10, Math.min(999, b * 40)), b: b };   // 몫 두 자리
  });

  /* ── 나눗셈: 나머지 ──────────────────────────────────────────────────── */
  var remain = {
    id: 't_remain', type: 'param', difficulty: 2, concept: '나머지가 있는 나눗셈',
    itemType: 'short', inRange: function (v) { return v >= 0; },
    gen: function (r) {
      var b = r.int(12, 49);
      var q = r.int(2, 20);
      var rem = r.int(1, b - 1);                          // 나머지가 반드시 있게
      return { a: b * q + rem, b: b };
    },
    render: function (p) { return p.a + ' ÷ ' + p.b + '의 나머지는 얼마일까요?'; },
    answer: function (p) { return p.a % p.b; },
    validate: function (p, ans) { return ans >= 0 && ans < p.b; },
    explain: function (p) {
      return p.a + ' ÷ ' + p.b + ' = ' + Math.floor(p.a / p.b) + ' … ' + (p.a % p.b);
    }
  };

  /* ── 검산 (참거짓) — 이 단원의 핵심 개념 ───────────────────────────── */
  var checkOx = {
    id: 't_check_ox', type: 'param', difficulty: 3, concept: '나눗셈의 검산',
    itemType: 'ox',
    gen: function (r) {
      var b = r.int(12, 49);
      var q = r.int(3, 20);
      var rem = r.int(0, b - 1);
      var a = b * q + rem;
      var wrong = r.pick([true, false]);
      if (!wrong) return { a: a, b: b, q: q, r: rem };
      // 틀린 식 만들기 — 몫을 흔들거나, 나머지를 제수보다 크게(전형적 오개념)
      return r.pick([
        { a: a, b: b, q: q + r.int(1, 2), r: rem },
        { a: a, b: b, q: q, r: rem + b },                 // 나머지 ≥ 제수 = 틀림
        { a: a, b: b, q: q - 1, r: rem }
      ]);
    },
    render: function (p) {
      return p.a + ' ÷ ' + p.b + ' = ' + p.q + ' … ' + p.r + ' 입니다';
    },
    answer: function (p) {
      return (p.b * p.q + p.r === p.a) && (p.r >= 0) && (p.r < p.b);
    },
    validate: function (p) { return p.q >= 1 && p.r >= 0; },
    explain: function (p) {
      if (p.r >= p.b) return '나머지(' + p.r + ')는 나누는 수(' + p.b + ')보다 작아야 해요';
      var c = p.b * p.q + p.r;
      return '검산: ' + p.b + ' × ' + p.q + ' + ' + p.r + ' = ' + c +
             (c === p.a ? ' → 맞아요' : ' → ' + p.a + '이(가) 아니에요');
    }
  };

  /* ── 곱셈 어림 (선택형) ─────────────────────────────────────────────── */
  var mulEstimate = {
    id: 't_mul_est', type: 'param', difficulty: 2, concept: '(세 자리)×(두 자리)',
    itemType: 'choice',
    gen: function (r) { return { a: r.int(180, 920), b: r.int(18, 92) }; },
    render: function (p) { return p.a + ' × ' + p.b + '의 값에 가장 가까운 수는 무엇일까요?'; },
    answer: function (p) {
      var v = p.a * p.b;
      return Math.round(v / 1000) * 1000;                 // 천의 자리로 어림
    },
    distractors: function (p) {
      var t = Math.round(p.a * p.b / 1000) * 1000;
      return [t + 10000, t - 10000, t + 5000, t - 5000].filter(function (x) { return x > 0; });
    },
    validate: function (p, ans) { return ans > 0; },
    explain: function (p) {
      return p.a + ' × ' + p.b + ' = ' + (p.a * p.b) + ' → 약 ' + (Math.round(p.a * p.b / 1000) * 1000);
    }
  };

  /* ── 차시별 등록 ─────────────────────────────────────────────────────── */
  function src(lesson) { return { grade: 4, subject: 'math', unit: 'u3', lesson: lesson }; }

  reg('g4_math_u3_l01', { source: src('l01'), fixed: [], templates: [mulTens] });
  reg('g4_math_u3_l02', { source: src('l02'), fixed: [], templates: [mul2, mul3, mulEstimate] });
  reg('g4_math_u3_l03', { source: src('l03'), fixed: [], templates: [quotTens] });
  reg('g4_math_u3_l04', { source: src('l04'), fixed: [], templates: [quot1] });
  reg('g4_math_u3_l05', { source: src('l05'), fixed: [], templates: [quot2] });
  reg('g4_math_u3_l06', { source: src('l06'), fixed: [], templates: [remain] });
  reg('g4_math_u3_l07', { source: src('l07'), fixed: [], templates: [checkOx, remain] });
  reg('g4_math_u3_l08', { source: src('l08'), fixed: [],
    templates: [mul2, quot1, quot2, remain, checkOx] });

  reg('g4_math_u3', {
    source: { grade: 4, subject: 'math', unit: 'u3', lesson: 'all' }, fixed: [],
    templates: [mulTens, mul2, mul3, mulEstimate, quotTens, quot1, quot2, remain, checkOx]
  });
});
