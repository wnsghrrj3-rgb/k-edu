/* =============================================================
 * templates/g2_math_u3.js — 케이퀴즈: 2학년 1학기 3단원 「덧셈과 뺄셈」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g2_math_u3): l01 도입(퀴즈X) · l02~l04 덧셈(받아올림) · l05~l07 뺄셈(받아내림) ·
 *   l08 세 수의 계산 · l09·l10 덧셈과 뺄셈의 관계(□) · l11 정리·평가 · l12 창작(퀴즈X)
 * 성취기준 [2수01-05~07](받아올림·받아내림 덧뺄, 세 수 계산, 덧뺄 관계)
 *
 * 원칙: 전 문항 수치 파라메트릭 → test가 동일 수식으로 독립 재계산.
 *   두 수 덧셈/뺄셈은 g1 문구(a + b = ? / a − b = ?, − 는 U+2212)를 재사용해 검산 공유.
 *   세 수 계산·□(관계)는 신규 문구 + 신규 재계산.
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{a} + {b} = ?"                         → a+b   (기존)
 *     "{a} − {b} = ?"  (− = U+2212)           → a-b   (기존)
 *     "{a} op {b} op {c} = ?"                 → 좌→우 계산
 *     "□ + {b} = {c}  일 때 □에 알맞은 수는?"  → c-b
 *     "{a} + □ = {c}  …"                      → c-a
 *     "□ − {b} = {c}  …"                      → c+b
 *     "{a} − □ = {c}  …"                      → a-c
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;
  var MINUS = '\u2212';   // −

  // ── 덧셈(받아올림) ───────────────────────────────────────────────────────
  function makeAdd(id, aMin, aMax, bMin, bMax) {
    return {
      id: id, type: 'param', difficulty: 2,
      gen: function (r) { return { a: r.int(aMin, aMax), b: r.int(bMin, bMax) }; },
      validate: function (p) { return (p.a % 10) + (p.b % 10) >= 10; },   // 받아올림 보장
      render: function (p) { return p.a + ' + ' + p.b + ' = ?'; },
      answer: function (p) { return p.a + p.b; },
      explain: function (p) { return p.a + ' + ' + p.b + ' = ' + (p.a + p.b); }
    };
  }
  var addTwoOne = makeAdd('t_add_21', 10, 99, 1, 9);
  var addTwoTwo = makeAdd('t_add_22', 15, 89, 15, 89);

  // ── 뺄셈(받아내림) ───────────────────────────────────────────────────────
  function makeSub(id, aMin, aMax, bMin, bMax) {
    return {
      id: id, type: 'param', difficulty: 2,
      gen: function (r) { var a = r.int(aMin, aMax), b = r.int(bMin, Math.min(bMax, a - 1)); return { a: a, b: b }; },
      validate: function (p) { return p.a > p.b && (p.a % 10) < (p.b % 10); },   // 받아내림 보장
      render: function (p) { return p.a + ' ' + MINUS + ' ' + p.b + ' = ?'; },
      answer: function (p) { return p.a - p.b; },
      inRange: function (v) { return v >= 0; },
      explain: function (p) { return p.a + ' ' + MINUS + ' ' + p.b + ' = ' + (p.a - p.b); }
    };
  }
  var subTwoOne = makeSub('t_sub_21', 11, 99, 2, 9);
  var subTwoTwo = makeSub('t_sub_22', 21, 99, 12, 89);

  // ── 세 수의 계산 (좌→우) ─────────────────────────────────────────────────
  var threeOp = {
    id: 't_three_op', type: 'param', difficulty: 3,
    gen: function (r) {
      var a, b, c, op1, op2, mid, res, t = 0;
      do {
        a = r.int(10, 50); b = r.int(10, 40); c = r.int(1, 30);
        op1 = r.pick(['+', MINUS]); op2 = r.pick(['+', MINUS]);
        mid = op1 === '+' ? a + b : a - b;
        res = op2 === '+' ? mid + c : mid - c;
        t++;
      } while ((mid < 0 || res < 0) && t < 40);
      return { a: a, b: b, c: c, op1: op1, op2: op2, res: res };
    },
    validate: function (p) { return p.res >= 0; },
    render: function (p) { return p.a + ' ' + p.op1 + ' ' + p.b + ' ' + p.op2 + ' ' + p.c + ' = ?'; },
    answer: function (p) { return p.res; },
    inRange: function (v) { return v >= 0; },
    explain: function (p) { return '앞에서부터 차례로 계산하면 ' + p.res + '이에요'; }
  };

  // ── 덧셈과 뺄셈의 관계 (□ 구하기) ────────────────────────────────────────
  var boxRel = {
    id: 't_box_rel', type: 'param', difficulty: 3,
    gen: function (r) {
      var form = r.pick(['add1', 'add2', 'sub1', 'sub2']);
      var x, y, c;   // 문항에 드러나는 두 수 + □ 정답
      if (form === 'add1') { var b = r.int(3, 40); var ans = r.int(3, 50); c = b + ans; return { form: form, b: b, c: c, ans: ans }; }
      if (form === 'add2') { var a = r.int(3, 40); var ans2 = r.int(3, 50); c = a + ans2; return { form: form, a: a, c: c, ans: ans2 }; }
      if (form === 'sub1') { var b2 = r.int(3, 40); var c2 = r.int(3, 50); return { form: form, b: b2, c: c2, ans: c2 + b2 }; }
      /* sub2 */           var ans4 = r.int(3, 40); var c4 = r.int(3, 40); return { form: form, a: ans4 + c4, c: c4, ans: ans4 };
    },
    render: function (p) {
      if (p.form === 'add1') return '□ + ' + p.b + ' = ' + p.c + '  일 때 □에 알맞은 수는?';
      if (p.form === 'add2') return p.a + ' + □ = ' + p.c + '  일 때 □에 알맞은 수는?';
      if (p.form === 'sub1') return '□ ' + MINUS + ' ' + p.b + ' = ' + p.c + '  일 때 □에 알맞은 수는?';
      return p.a + ' ' + MINUS + ' □ = ' + p.c + '  일 때 □에 알맞은 수는?';
    },
    answer: function (p) { return p.ans; },
    inRange: function (v) { return v >= 0; },
    explain: function (p) { return '□ = ' + p.ans + '이에요'; }
  };

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 2, subject: 'math', unit: 'u3', lesson: lesson }; }

  reg('g2_math_u3_l02', { source: src('l02'), fixed: [], templates: [addTwoOne] });
  reg('g2_math_u3_l03', { source: src('l03'), fixed: [], templates: [addTwoTwo] });
  reg('g2_math_u3_l04', { source: src('l04'), fixed: [], templates: [addTwoOne, addTwoTwo] });
  reg('g2_math_u3_l05', { source: src('l05'), fixed: [], templates: [subTwoOne] });
  reg('g2_math_u3_l06', { source: src('l06'), fixed: [], templates: [subTwoTwo] });
  reg('g2_math_u3_l07', { source: src('l07'), fixed: [], templates: [subTwoOne, subTwoTwo] });
  reg('g2_math_u3_l08', { source: src('l08'), fixed: [], templates: [threeOp] });
  reg('g2_math_u3_l09', { source: src('l09'), fixed: [], templates: [boxRel] });
  reg('g2_math_u3_l10', { source: src('l10'), fixed: [], templates: [boxRel] });
  reg('g2_math_u3_l11', { source: src('l11'), fixed: [], templates: [addTwoTwo, subTwoTwo, threeOp, boxRel] });

  reg('g2_math_u3', {
    source: { grade: 2, subject: 'math', unit: 'u3', lesson: 'all' }, fixed: [],
    templates: [addTwoOne, addTwoTwo, subTwoOne, subTwoTwo, threeOp, boxRel]
  });
});
