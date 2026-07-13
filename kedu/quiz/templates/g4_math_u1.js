/* =============================================================
 * templates/g4_math_u1.js — 케이퀴즈: 4학년 1학기 1단원 「큰 수」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (param·수치)
 *
 * 차시(g4_math_u1): l01 만 · l02 다섯 자리 수 · l03 십만·백만·천만 ·
 *   l04 억 · l05 조 · l06 뛰어 세기 · l07 수의 크기 비교 · l08 마무리
 * 성취기준 [4수01-01](큰 수의 자릿값과 위치적 기수법)·[4수01-02](큰 수의 크기 비교)
 *
 * 원칙: 순수 수 개념 — 시각자산 무의존, 교과서 문항 차용 0.
 *   정답은 코드가 계산(param) → test가 동일 수식 재계산.
 *   concept 필드 = 케이배틀 교사 대시보드의 가로축(교육과정 개념).
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "{n}에서 숫자 {d}는 어느 자리 숫자일까요?"        → 자릿값 이름
 *     "{n}에서 숫자 {d}가 나타내는 값은 얼마일까요?"    → d × 자릿수
 *     "{a}에서 {step}씩 {k}번 뛰어 세면 얼마일까요?"    → a + step*k
 *     "{a}와(과) {b} 중 더 큰 수는 무엇일까요?"         → max(a,b)
 *     "{n}은(는) 몇 자리 수일까요?"                     → 자릿수
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  var PLACE = ['일', '십', '백', '천', '만', '십만', '백만', '천만', '억', '십억', '백억', '천억', '조'];

  function digits(n) { return String(n).length; }
  // n의 오른쪽에서 i번째(0-based) 자리 숫자
  function digitAt(n, i) { return Math.floor(n / Math.pow(10, i)) % 10; }

  /* ── 자릿값 이름 (선택형) ────────────────────────────────────────────── */
  var placeName = {
    id: 't_place_name', type: 'param', difficulty: 1, concept: '자릿값',
    itemType: 'choice',
    gen: function (r) {
      var len = r.int(5, 8);                       // 다섯 자리 ~ 여덟 자리
      var n = r.int(Math.pow(10, len - 1), Math.pow(10, len) - 1);
      var i = r.int(0, len - 1);
      return { n: n, i: i };
    },
    render: function (p) {
      return p.n + '에서 숫자 ' + digitAt(p.n, p.i) + '는 어느 자리 숫자일까요?';
    },
    answer: function (p) { return PLACE[p.i]; },
    distractors: function (p) {
      var out = [];
      [-2, -1, 1, 2].forEach(function (d) {
        var j = p.i + d;
        if (j >= 0 && j < PLACE.length) out.push(PLACE[j]);
      });
      return out;
    },
    validate: function (p) {
      // 같은 숫자가 두 자리에 겹치면 문제가 애매해진다 → 재생성
      var d = digitAt(p.n, p.i);
      var cnt = 0;
      for (var k = 0; k < digits(p.n); k++) if (digitAt(p.n, k) === d) cnt++;
      return cnt === 1;
    },
    explain: function (p) {
      return p.n + '에서 ' + digitAt(p.n, p.i) + '는 ' + PLACE[p.i] + '의 자리에 있어요';
    }
  };

  /* ── 자릿값이 나타내는 값 (수 입력) ──────────────────────────────────── */
  var placeValue = {
    id: 't_place_value', type: 'param', difficulty: 2, concept: '자릿값',
    itemType: 'short',
    gen: function (r) {
      var len = r.int(5, 8);
      var n = r.int(Math.pow(10, len - 1), Math.pow(10, len) - 1);
      var i = r.int(1, len - 1);                   // 일의 자리는 시시하다
      return { n: n, i: i };
    },
    render: function (p) {
      return p.n + '에서 숫자 ' + digitAt(p.n, p.i) + '가 나타내는 값은 얼마일까요?';
    },
    answer: function (p) { return digitAt(p.n, p.i) * Math.pow(10, p.i); },
    validate: function (p, ans) {
      if (ans <= 0) return false;                  // 그 자리가 0이면 문제가 안 된다
      var d = digitAt(p.n, p.i);
      var cnt = 0;
      for (var k = 0; k < digits(p.n); k++) if (digitAt(p.n, k) === d) cnt++;
      return cnt === 1;
    },
    explain: function (p) {
      return digitAt(p.n, p.i) + ' × ' + Math.pow(10, p.i) + ' = ' + (digitAt(p.n, p.i) * Math.pow(10, p.i));
    }
  };

  /* ── 뛰어 세기 (수 입력) ─────────────────────────────────────────────── */
  function makeJump(id, diff, unit) {
    return {
      id: id, type: 'param', difficulty: diff, concept: '뛰어 세기',
      itemType: 'short',
      gen: function (r) {
        var a = r.int(1, 9) * unit * 10 + r.int(0, 9) * unit;   // 단위에 맞춘 시작 수
        return { a: a, step: unit * r.int(1, 5), k: r.int(2, 5) };
      },
      render: function (p) {
        return p.a + '에서 ' + p.step + '씩 ' + p.k + '번 뛰어 세면 얼마일까요?';
      },
      answer: function (p) { return p.a + p.step * p.k; },
      explain: function (p) {
        return p.a + ' + ' + p.step + ' × ' + p.k + ' = ' + (p.a + p.step * p.k);
      }
    };
  }
  var jump10000 = makeJump('t_jump_man', 1, 10000);          // 만씩
  var jump100000 = makeJump('t_jump_10man', 2, 100000);      // 십만씩

  /* ── 크기 비교 (선택형) ──────────────────────────────────────────────── */
  var compare = {
    id: 't_compare', type: 'param', difficulty: 1, concept: '큰 수의 크기 비교',
    itemType: 'choice',
    gen: function (r) {
      var len = r.int(6, 9);
      var a = r.int(Math.pow(10, len - 1), Math.pow(10, len) - 1);
      // 자릿수가 같은 두 수를 비교해야 진짜 비교가 된다 (자릿수 다르면 눈으로 끝)
      var b = r.int(Math.pow(10, len - 1), Math.pow(10, len) - 1);
      return { a: a, b: b };
    },
    render: function (p) { return p.a + '와(과) ' + p.b + ' 중 더 큰 수는 무엇일까요?'; },
    answer: function (p) { return Math.max(p.a, p.b); },
    distractors: function (p) { return [Math.min(p.a, p.b)]; },
    choiceCount: 2,
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) {
      return '높은 자리부터 비교하면 ' + Math.max(p.a, p.b) + '이(가) 더 커요';
    }
  };

  /* ── 자릿수 세기 (수 입력) ───────────────────────────────────────────── */
  var howManyDigits = {
    id: 't_digits', type: 'param', difficulty: 1, concept: '자릿값',
    itemType: 'short',
    gen: function (r) {
      var len = r.int(5, 10);
      return { n: r.int(Math.pow(10, len - 1), Math.pow(10, len) - 1) };
    },
    render: function (p) { return p.n + '은(는) 몇 자리 수일까요?'; },
    answer: function (p) { return digits(p.n); },
    explain: function (p) { return p.n + '은(는) ' + digits(p.n) + '자리 수예요'; }
  };

  /* ── 만 단위 읽기 (참거짓 — 서바이벌·ox 모드 재료) ──────────────────── */
  var manOx = {
    id: 't_man_ox', type: 'param', difficulty: 2, concept: '큰 수의 크기 비교',
    itemType: 'ox',
    gen: function (r) {
      var a = r.int(10000, 99999999);
      var b = r.int(10000, 99999999);
      var claim = r.pick(['bigger', 'smaller']);
      return { a: a, b: b, claim: claim };
    },
    render: function (p) {
      return p.a + '은(는) ' + p.b + '보다 ' + (p.claim === 'bigger' ? '큽니다' : '작습니다');
    },
    answer: function (p) {
      return p.claim === 'bigger' ? (p.a > p.b) : (p.a < p.b);
    },
    validate: function (p) { return p.a !== p.b; },
    explain: function (p) {
      return p.a + (p.a > p.b ? ' > ' : ' < ') + p.b;
    }
  };

  /* ── 차시별 등록 ─────────────────────────────────────────────────────── */
  function src(lesson) { return { grade: 4, subject: 'math', unit: 'u1', lesson: lesson }; }

  reg('g4_math_u1_l02', { source: src('l02'), fixed: [], templates: [howManyDigits, placeName] });
  reg('g4_math_u1_l03', { source: src('l03'), fixed: [], templates: [placeName, placeValue] });
  reg('g4_math_u1_l04', { source: src('l04'), fixed: [], templates: [placeName, placeValue] });
  reg('g4_math_u1_l05', { source: src('l05'), fixed: [], templates: [placeValue, howManyDigits] });
  reg('g4_math_u1_l06', { source: src('l06'), fixed: [], templates: [jump10000, jump100000] });
  reg('g4_math_u1_l07', { source: src('l07'), fixed: [], templates: [compare, manOx] });
  reg('g4_math_u1_l08', { source: src('l08'), fixed: [],
    templates: [placeName, placeValue, jump10000, compare, manOx] });

  reg('g4_math_u1', {
    source: { grade: 4, subject: 'math', unit: 'u1', lesson: 'all' }, fixed: [],
    templates: [howManyDigits, placeName, placeValue, jump10000, jump100000, compare, manOx]
  });
});
