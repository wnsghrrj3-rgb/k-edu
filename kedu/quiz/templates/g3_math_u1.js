/* =============================================================
 * templates/g3_math_u1.js — 케이퀴즈: 3학년 1학기 1단원 「덧셈과 뺄셈」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g3_math_u1): l01 도입(퀴즈X) · l02~04 덧셈(1)(2)(3) · l05~07 뺄셈(1)(2)(3) ·
 *   l08 비사치기(놀이, 퀴즈X) · l09 마무리
 * 성취기준 [4수01-01](세 자리 수 범위 덧셈·뺄셈)
 *
 * 원칙: 전 문항 수치 파라메트릭 → test가 동일 수식 재계산. 세 자리 범위로 확장하되
 *   문구는 g2_math_u3와 100% 동일(a + b = ? / a − b = ? / □ … 일 때 □에 알맞은 수는?)
 *   → 기존 g2u3 재계산 브랜치를 그대로 공유(신규 재계산기 0). − 는 U+2212.
 *   받아올림/받아내림은 값 범위로 난이도 근사(정답은 코드가 보장).
 *
 *   재계산기 매칭(문구 절대 변경 금지 · 전부 g2u3 기존 브랜치 공유):
 *     "{a} + {b} = ?"                          → a+b
 *     "{a} − {b} = ?"  (− = U+2212)            → a−b
 *     "□ + {b} = {c}  일 때 …"                 → c−b
 *     "{a} + □ = {c}  일 때 …"                 → c−a
 *     "□ − {b} = {c}  일 때 …"                 → c+b
 *     "{a} − □ = {c}  일 때 …"                 → a−c
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var MINUS = '\u2212';

  // ── 세 자리 덧셈 (받아올림 근사: 범위로 난이도) ───────────────────────────
  function makeAdd(id, diff, lo, hi) {
    return {
      id: id, type: 'param', difficulty: diff,
      gen: function (r) { return { a: r.int(lo, hi), b: r.int(lo, hi) }; },
      render: function (p) { return p.a + ' + ' + p.b + ' = ?'; },
      answer: function (p) { return p.a + p.b; },
      distractors: function (p) { var s = p.a + p.b; return [s + 10, s - 10, s + 1, s - 100]; },
      explain: function (p) { return p.a + ' + ' + p.b + ' = ' + (p.a + p.b); }
    };
  }
  var add1 = makeAdd('t_add1', 1, 102, 498);   // 합 세 자리 유지·받아올림 적음
  var add2 = makeAdd('t_add2', 2, 305, 899);   // 받아올림 잦음·합 네 자리 가능

  // ── 세 자리 뺄셈 (a>b 보장·받아내림 근사) ─────────────────────────────────
  function makeSub(id, diff, lo, hi) {
    return {
      id: id, type: 'param', difficulty: diff, inRange: function (v) { return v >= 0; },
      gen: function (r) {
        var a = r.int(lo, hi), b = r.int(lo, hi);
        if (a < b) { var t = a; a = b; b = t; }
        if (a === b) a = Math.min(hi, a + 1);
        return { a: a, b: b };
      },
      render: function (p) { return p.a + ' ' + MINUS + ' ' + p.b + ' = ?'; },
      answer: function (p) { return p.a - p.b; },
      distractors: function (p) { var d = p.a - p.b; return [d + 10, d - 10, d + 1, d + 100]; },
      explain: function (p) { return p.a + ' ' + MINUS + ' ' + p.b + ' = ' + (p.a - p.b); }
    };
  }
  var sub1 = makeSub('t_sub1', 1, 120, 599);
  var sub2 = makeSub('t_sub2', 2, 300, 999);

  // ── □ 구하기 (덧뺄 관계, 세 자리) ─────────────────────────────────────────
  var boxTemplate = {
    id: 't_box', type: 'param', difficulty: 3, inRange: function (v) { return v >= 0; },
    gen: function (r) {
      var form = r.pick(['add1', 'add2', 'sub1', 'sub2']);
      var x = r.int(101, 599), y = r.int(101, 399);   // □와 상대항
      return { form: form, x: x, y: y };
    },
    render: function (p) {
      if (p.form === 'add1') return '□ + ' + p.y + ' = ' + (p.x + p.y) + '  일 때 □에 알맞은 수는?';
      if (p.form === 'add2') return p.y + ' + □ = ' + (p.x + p.y) + '  일 때 □에 알맞은 수는?';
      if (p.form === 'sub1') return '□ ' + MINUS + ' ' + p.y + ' = ' + p.x + '  일 때 □에 알맞은 수는?';
      return (p.x + p.y) + ' ' + MINUS + ' □ = ' + p.x + '  일 때 □에 알맞은 수는?';
    },
    answer: function (p) {
      if (p.form === 'add1' || p.form === 'add2') return p.x;         // □ = x
      if (p.form === 'sub1') return p.x + p.y;                        // □ − y = x → □ = x+y
      return p.y;                                                     // (x+y) − □ = x → □ = y
    },
    explain: function (p) {
      var a = (p.form === 'add1' || p.form === 'add2') ? p.x : (p.form === 'sub1' ? p.x + p.y : p.y);
      return '□ = ' + a + '이에요';
    }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 3, subject: 'math', unit: 'u1', lesson: lesson }; }

  reg('g3_math_u1_l02', { source: src('l02'), fixed: [], templates: [add1] });
  reg('g3_math_u1_l03', { source: src('l03'), fixed: [], templates: [add1, add2] });
  reg('g3_math_u1_l04', { source: src('l04'), fixed: [], templates: [add2] });
  reg('g3_math_u1_l05', { source: src('l05'), fixed: [], templates: [sub1] });
  reg('g3_math_u1_l06', { source: src('l06'), fixed: [], templates: [sub1, sub2] });
  reg('g3_math_u1_l07', { source: src('l07'), fixed: [], templates: [sub2] });
  reg('g3_math_u1_l09', { source: src('l09'), fixed: [], templates: [add1, add2, sub1, sub2, boxTemplate] });

  reg('g3_math_u1', {
    source: { grade: 3, subject: 'math', unit: 'u1', lesson: 'all' }, fixed: [],
    templates: [add1, add2, sub1, sub2, boxTemplate]
  });
});
