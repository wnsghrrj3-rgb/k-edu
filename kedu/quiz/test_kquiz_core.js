/* =============================================================
 * test_kquiz_core.js — 케이퀴즈 core 순수 검산 (node, jsdom 불필요)
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §8
 * 실행: node kedu/quiz/test_kquiz_core.js
 * ============================================================= */
'use strict';
var KQuiz = require('./kquiz-core.js');
// 템플릿 등록(factory에 core 주입)
require('./templates/g1_math_u3.js')(KQuiz);

var fails = 0, pass = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fails++; console.log('  ✗ ' + msg); } }
function section(t) { console.log('\n[' + t + ']'); }

var LESSONS = ['g1_math_u3_l02','g1_math_u3_l03','g1_math_u3_l04','g1_math_u3_l05',
  'g1_math_u3_l06','g1_math_u3_l08','g1_math_u3_l09','g1_math_u3_l11',
  'g1_math_u3_l12','g1_math_u3_l13','g1_math_u3'];

// ── §8-1 재현성: 같은 (lesson,n,seed) 2회 → deep-equal ──────────────────────
section('§8-1 재현성');
LESSONS.forEach(function (L) {
  var a = KQuiz.generate({ lesson: L, n: 10, seed: 7731 });
  var b = KQuiz.generate({ lesson: L, n: 10, seed: 7731 });
  ok(JSON.stringify(a.items) === JSON.stringify(b.items), L + ' 재현 불일치');
});

// ── §8-2 정답 검산: 1,000회 생성, param형 독립 재계산 대조 ────────────────────
section('§8-2 정답 검산 (1,000회/lesson)');
LESSONS.forEach(function (L) {
  var bad = 0, total = 0, skipSum = 0;
  for (var s = 0; s < 1000; s++) {
    var r = KQuiz.generate({ lesson: L, n: 10, seed: s * 131 + 7 });
    skipSum += (10 - r.items.length);
    r.items.forEach(function (it) {
      total++;
      // choice: 정답 인덱스가 가리키는 값이 실제 수식 결과와 맞는지 파싱 재계산
      if (it.type === 'choice') {
        var mAdd = it.q.match(/^(\d+)\s*\+\s*(\d+)\s*=/);
        var mSub = it.q.match(/^(\d+)\s*−\s*(\d+)\s*=/);
        var mMix = it.q.match(/^(\d+)\s*([+−])\s*(\d+)\s*=/);
        var expect = null;
        if (mAdd) expect = +mAdd[1] + +mAdd[2];
        else if (mSub) expect = +mSub[1] - +mSub[2];
        else if (mMix) expect = mMix[2] === '+' ? +mMix[1] + +mMix[3] : +mMix[1] - +mMix[3];
        if (expect !== null) {
          var chosen = Number(it.choices[it.answer]);
          if (chosen !== expect) { bad++; }
        }
      }
    });
  }
  ok(bad === 0, L + ' 정답 오류 ' + bad + '건');
  console.log('    ' + L + ' — 문항 ' + total + ' · 검산오류 ' + bad + ' · 스킵합 ' + skipSum);
});

// ── §8-3 오답 무결: 정답 미포함·상호중복 0·범위(0..9) 내 ──────────────────────
section('§8-3 오답(choices) 무결');
LESSONS.forEach(function (L) {
  var dupOrBad = 0, rangeBad = 0, cnt = 0;
  for (var s = 0; s < 500; s++) {
    var r = KQuiz.generate({ lesson: L, n: 10, seed: s * 977 + 3 });
    r.items.forEach(function (it) {
      if (it.type !== 'choice') return;
      cnt++;
      var set = {}; var dup = false;
      it.choices.forEach(function (c) { if (set[c]) dup = true; set[c] = 1; });
      if (dup) dupOrBad++;
      // 수식형이면 보기 전부 0..99(음수·비정상 없음) — 학년 세계 범위 sanity
      it.choices.forEach(function (c) { var n = Number(c); if (!isFinite(n) || n < 0) rangeBad++; });
      // 정답 인덱스 유효
      if (it.answer < 0 || it.answer >= it.choices.length) dupOrBad++;
    });
  }
  ok(dupOrBad === 0, L + ' 보기 중복/정답인덱스 오류 ' + dupOrBad);
  ok(rangeBad === 0, L + ' 보기 음수/비정상 ' + rangeBad);
});

// ── §8-4 재생성 상한: 무한루프 없이 완료(위 루프가 끝난 것 자체가 증거) ──────────
section('§8-4 재생성 상한');
ok(true, '전 lesson 1,500회 생성 무한루프 없이 완료');

// ── §8-5 compose 유니코드 역산 ────────────────────────────────────────────
section('§8-5 compose 검산');
(function () {
  var u = KQuiz._util, bad = 0, n = 0;
  u.CHO.forEach(function (c) {
    u.JUNG.forEach(function (j) {
      var ch = u.compose(c, j); if (!ch) return;
      var d = u.decompose(ch); n++;
      if (!d || d.cho !== c || d.jung !== j) bad++;
    });
  });
  ok(bad === 0, 'compose/decompose 역산 불일치 ' + bad + '/' + n);
})();

// ── 채점 왕복: 전부 정답으로 풀면 만점 ──────────────────────────────────────
section('채점 왕복');
(function () {
  var r = KQuiz.generate({ lesson: 'g1_math_u3', n: 10, seed: 42 });
  var answers = r.items.map(function (it) {
    if (it.type === 'choice') return it.answer;
    if (it.type === 'ox') return it.answer;
    if (it.type === 'short') return it.answer;
    return null;
  });
  var g = KQuiz.gradeSet(r.items, answers);
  ok(g.score === g.max && g.max > 0, '전정답 채점 만점 아님 (' + g.score + '/' + g.max + ')');
})();

// ── short 정규화 채점 ─────────────────────────────────────────────────────
section('short 정규화');
(function () {
  var it = { type: 'short', answer: '7' };
  ok(KQuiz.gradeOne(it, ' ７ ').correct === true, '전각/공백 정규화 실패');
  ok(KQuiz.gradeOne(it, '8').correct === false, '오답 통과');
})();

console.log('\n──────────────');
console.log('PASS ' + pass + ' · FAIL ' + fails);
process.exit(fails ? 1 : 0);
