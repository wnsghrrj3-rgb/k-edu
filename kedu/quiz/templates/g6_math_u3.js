/* =============================================================
 * templates/g6_math_u3.js — 케이퀴즈: 6학년 1학기 3단원 「소수의 나눗셈」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g6_math_u3): l01 (소수)÷(자연수) 자릿수 같은 경우 · l02 몫이 1보다 작은 경우 ·
 *   l03 소수점 아래 0을 내려 계산 · l04 몫의 소수점 위치 · l05 어림하기 · l06 마무리
 * 성취기준 [6수01-09](소수의 나눗셈)
 *
 * ⭐ 이 단원은 **케이배틀 numpad 에 소수점 키를 켜게 만든 단원**이다.
 *    답이 3.5 인데 4지선다로 내면 찍기가 된다 → 입력이어야 한다.
 *    (kb-questions.js `payload.allowDecimal` — 소수점도 **탭**이지 타이핑이 아니다. 제2조 유지.)
 *
 * ⭐ 이 단원의 핵심 오개념 = **몫의 소수점 위치**.
 *    12.6 ÷ 3 = 4.2 인데 42 라고 쓰는 아이가 반드시 나온다.
 *    → ox 문항으로 소수점 위치만 직접 때린다.
 *
 * 원칙: 답이 유한소수가 되게만 생성한다(순환소수는 초등 범위 밖).
 *   부동소수점 오차는 코드가 반올림으로 정리한다 — 아이 잘못이 아니다.
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  // 소수 정리 — 부동소수점 찌꺼기 제거 (0.30000000000000004 → 0.3)
  function fix(v, k) { return Number(v.toFixed(k == null ? 3 : k)); }

  /* ── (소수)÷(자연수) — 나누어떨어지게 생성 ────────────────────────── */
  function makeDecDiv(id, diff, concept, genFn) {
    return {
      id: id, type: 'param', difficulty: diff, concept: concept,
      itemType: 'short',
      gen: genFn,
      render: function (p) { return p.a + ' ÷ ' + p.b + ' = ?'; },
      answer: function (p) { return fix(p.a / p.b); },
      validate: function (p, ans) {
        return ans > 0 && Math.abs(ans * p.b - p.a) < 1e-9;   // 유한소수만
      },
      explain: function (p) { return p.a + ' ÷ ' + p.b + ' = ' + fix(p.a / p.b); }
    };
  }

  // 몫이 1보다 큰 경우 (소수 한 자리)
  var dec1 = makeDecDiv('t_dec1', 1, '(소수)÷(자연수)', function (r) {
    var b = r.int(2, 9);
    var q = r.int(11, 99);                       // 몫 = q/10 (소수 한 자리)
    return { a: fix(b * q / 10), b: b };
  });

  // 몫이 소수 두 자리
  var dec2 = makeDecDiv('t_dec2', 2, '(소수)÷(자연수)', function (r) {
    var b = r.int(2, 9);
    var q = r.int(105, 999);                     // 몫 = q/100
    return { a: fix(b * q / 100), b: b };
  });

  // 몫이 1보다 작은 경우 (전형적 함정)
  var decSmall = makeDecDiv('t_dec_small', 2, '몫이 1보다 작은 나눗셈', function (r) {
    var b = r.int(2, 9);
    var q = r.int(11, 99);                       // 몫 = q/100 < 1
    return { a: fix(b * q / 100), b: b };
  });

  // 두 자리로 나누기
  var decTwoDigit = makeDecDiv('t_dec_2d', 3, '(소수)÷(두 자리 수)', function (r) {
    var b = r.int(12, 25);
    var q = r.int(11, 99);
    return { a: fix(b * q / 10), b: b };
  });

  /* ── 몫의 소수점 위치 (참거짓) — 이 단원의 심장 ───────────────────── */
  var pointOx = {
    id: 't_point_ox', type: 'param', difficulty: 2, concept: '몫의 소수점 위치',
    itemType: 'ox',
    gen: function (r) {
      var b = r.int(2, 9);
      var q = r.int(11, 99);
      var a = fix(b * q / 10);
      var right = fix(q / 10);
      var myth = q;                              // ⚠️ 소수점을 빠뜨린 오개념
      return { a: a, b: b, claim: r.pick([right, myth]) };
    },
    render: function (p) { return p.a + ' ÷ ' + p.b + ' = ' + p.claim + ' 입니다'; },
    answer: function (p) { return Math.abs(p.claim - p.a / p.b) < 1e-9; },
    explain: function (p) {
      return p.a + ' ÷ ' + p.b + ' = ' + fix(p.a / p.b) + ' (소수점 위치를 잘 보세요)';
    }
  };

  /* ── 어림하기 (선택형) ─────────────────────────────────────────────── */
  var estimate = {
    id: 't_dec_est', type: 'param', difficulty: 2, concept: '소수 나눗셈의 어림',
    itemType: 'choice',
    gen: function (r) {
      var b = r.int(2, 9);
      var q = r.int(15, 95);
      return { a: fix(b * q / 10), b: b };
    },
    render: function (p) { return p.a + ' ÷ ' + p.b + ' 의 몫은 대략 얼마일까요?'; },
    answer: function (p) { return Math.round(p.a / p.b); },
    distractors: function (p) {
      var t = Math.round(p.a / p.b);
      return [t + 1, t - 1, t * 10, Math.max(1, Math.round(t / 10))]
        .filter(function (x) { return x > 0 && x !== t; });
    },
    validate: function (p, ans) { return ans > 0; },
    explain: function (p) {
      return p.a + ' ÷ ' + p.b + ' = ' + fix(p.a / p.b) + ' → 대략 ' + Math.round(p.a / p.b);
    }
  };

  /* ── 몫을 10배·100배 하면 (선택형 — 소수점 이동 개념) ─────────────── */
  var shiftPoint = {
    id: 't_shift', type: 'param', difficulty: 3, concept: '몫의 소수점 위치',
    itemType: 'short',
    gen: function (r) {
      var b = r.int(2, 9);
      var q = r.int(11, 99);
      return { a: fix(b * q / 10), b: b, times: r.pick([10, 100]) };
    },
    render: function (p) {
      return p.a + ' ÷ ' + p.b + ' 의 몫에 ' + p.times + '을(를) 곱하면 얼마일까요?';
    },
    answer: function (p) { return fix(p.a / p.b * p.times, 2); },
    validate: function (p, ans) { return ans > 0; },
    explain: function (p) {
      return '몫 ' + fix(p.a / p.b) + ' × ' + p.times + ' = ' + fix(p.a / p.b * p.times, 2) +
             ' (소수점이 오른쪽으로 옮겨가요)';
    }
  };

  function src(lesson) { return { grade: 6, subject: 'math', unit: 'u3', lesson: lesson }; }

  reg('g6_math_u3_l01', { source: src('l01'), fixed: [], templates: [dec1] });
  reg('g6_math_u3_l02', { source: src('l02'), fixed: [], templates: [decSmall] });
  reg('g6_math_u3_l03', { source: src('l03'), fixed: [], templates: [dec2] });
  reg('g6_math_u3_l04', { source: src('l04'), fixed: [], templates: [pointOx, shiftPoint] });
  reg('g6_math_u3_l05', { source: src('l05'), fixed: [], templates: [estimate] });
  reg('g6_math_u3_l06', { source: src('l06'), fixed: [],
    templates: [dec1, dec2, decSmall, decTwoDigit, pointOx, estimate] });

  reg('g6_math_u3', {
    source: { grade: 6, subject: 'math', unit: 'u3', lesson: 'all' }, fixed: [],
    templates: [dec1, dec2, decSmall, decTwoDigit, pointOx, estimate, shiftPoint]
  });
});
