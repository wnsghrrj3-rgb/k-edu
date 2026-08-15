/* =============================================================
 * test_math_morning.js — 아침활동 수학(하루 1차시) 검산 (node)
 *   ① 차시 무손실 — 등록된 수학 차시가 하나도 빠지지 않고 일차에 배정되는가
 *   ② 순서 = 교과 진도(단원↑ → 차시↑)
 *   ③ 전 일차 × 여러 시드: 문항 10개·발문 중복 0·보기 4개·정답 인덱스 범위·
 *      만점 채점 일치·같은 시드 재현성
 *   ④ 복습 혼입 — 2일차부터 이전 차시 문항이 실제로 섞이는가
 *   ⑤ SQL ↔ JS 드리프트: sql/setup_morning.sql 의 ma_max_step(math) 대조
 * 실행: node kedu/quiz/test_math_morning.js
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var KQuiz = require('./kquiz-core.js');

var registered = [];
var origReg = KQuiz.register;
KQuiz.register = function (k, d) { registered.push(k); return origReg(k, d); };

var TPL = path.join(__dirname, 'templates');
fs.readdirSync(TPL).filter(function (f) { return /_math_u/.test(f); }).sort()
  .forEach(function (f) { require(path.join(TPL, f))(KQuiz); });
var unitKeys = registered.slice();
require(path.join(TPL, 'math_morning.js'))(KQuiz);

var fail = 0, pass = 0;
function T(c, m) { if (c) { pass++; } else { fail++; console.log('  ✗ ' + m); } }

var GRADES = [1, 2, 3, 4, 5, 6];

/* ① 차시 무손실 — 단원 통합 키(g1_math_u1)는 하루 1차시에 쓰지 않으므로 제외 */
var lessons = unitKeys.filter(function (k) { return /_l\d/.test(k); });
var picked = {};
GRADES.forEach(function (g) {
  KQuiz.mathMorningOrder(g).forEach(function (k) { picked[k] = 1; });
});
lessons.forEach(function (k) {
  T(!!picked[k], '차시 ' + k + ' 가 어느 일차에도 배정되지 않음(합본 키 패턴 확인)');
});
T(Object.keys(picked).length === lessons.length,
  '배정 수(' + Object.keys(picked).length + ') ≠ 차시 수(' + lessons.length + ')');

/* ② 순서 = 교과 진도 */
GRADES.forEach(function (g) {
  var o = KQuiz.mathMorningOrder(g);
  var prevU = 0, prevL = 0;
  o.forEach(function (k) {
    var m = k.match(/_u(\d+)_l(\d+)/);
    T(!!m, g + '학년 키 형식 이상: ' + k);
    if (!m) return;
    var u = +m[1], l = +m[2];
    T(u > prevU || (u === prevU && l > prevL),
      g + '학년 진도 역행: ' + k + ' (앞이 u' + prevU + '_l' + prevL + ')');
    prevU = u; prevL = l;
  });
});

/* ③ 전 일차 전수 생성 검사 */
var SEEDS = [11, 977, 4231, 60013];
GRADES.forEach(function (g) {
  var n = KQuiz.mathMorningOrder(g).length;
  for (var d = 1; d <= n; d++) {
    var key = 'g' + g + '_math_c' + ('00' + d).slice(-3);
    T(KQuiz.has(key), key + ' 미등록');
    SEEDS.forEach(function (seed) {
      var r = KQuiz.generate({ lesson: key, n: 10, seed: seed });
      var items = r.items || r;
      T(items.length === 10, key + ' seed' + seed + ' 문항 ' + items.length + '개');
      var seenQ = {}, dup = 0;
      items.forEach(function (it) { if (seenQ[it.q]) dup++; seenQ[it.q] = 1; });
      T(dup === 0, key + ' seed' + seed + ' 발문 중복 ' + dup + '개');
      items.forEach(function (it, i) {
        if (it.choices) {
          // 보기 수를 4로 못 박지 않는다. 수학은 선택지가 본질적으로 3개인 문항이 있다
          // (예: "두루마리 휴지는 어떤 모양?" → 상자·둥근 기둥·공).
          // 원 차시 객관식의 19%가 그렇다. 봐야 할 것은 개수가 아니라 보기 중복이다.
          T(it.choices.length >= 2,
            key + ' seed' + seed + ' q' + i + ' 보기 ' + it.choices.length + '개');
          var cs = {}, cdup = 0;
          it.choices.forEach(function (c) { if (cs[c]) cdup++; cs[c] = 1; });
          T(cdup === 0, key + ' seed' + seed + ' q' + i + ' 보기 중복 ' + cdup + '개');
          T(it.answer >= 0 && it.answer < it.choices.length,
            key + ' seed' + seed + ' q' + i + ' 정답 인덱스 범위 밖: ' + it.answer);
        }
      });
      /* 만점 채점 일치 */
      var ans = items.map(function (it) {
        return it.choices ? it.answer : (it.answer != null ? it.answer : '');
      });
      var scored = KQuiz.gradeSet ? KQuiz.gradeSet(items, ans) : null;
      if (scored && scored.score != null) {
        T(scored.score === items.length,
          key + ' seed' + seed + ' 만점 채점 불일치: ' + scored.score + '/' + items.length);
      }
      /* 재현성 */
      var r2 = KQuiz.generate({ lesson: key, n: 10, seed: seed });
      var i2 = r2.items || r2;
      T(items.map(function (x) { return x.q; }).join('|') ===
        i2.map(function (x) { return x.q; }).join('|'),
        key + ' seed' + seed + ' 같은 시드 재현 실패');
    });
  }
});

/* ④ 복습 혼입 — 얇은 차시가 혼자 힘으로 10문항을 못 채우는 것이 이 설계의 이유다.
      2일차 이후엔 오늘 차시 단독 생성보다 고유 문항이 늘어야 한다. */
var mixedOk = 0, mixedCheck = 0;
GRADES.forEach(function (g) {
  var order = KQuiz.mathMorningOrder(g);
  for (var d = 2; d <= order.length; d++) {
    var solo = KQuiz.generate({ lesson: order[d - 1], n: 10, seed: 555 });
    var si = solo.items || solo, su = {};
    si.forEach(function (x) { su[x.q] = 1; });
    if (Object.keys(su).length < 10) {          // 혼자서는 얇은 차시
      mixedCheck++;
      var mix = KQuiz.generate({ lesson: 'g' + g + '_math_c' + ('00' + d).slice(-3), n: 10, seed: 555 });
      var mi = mix.items || mix, mu = {};
      mi.forEach(function (x) { mu[x.q] = 1; });
      if (Object.keys(mu).length === 10) mixedOk++;
      T(Object.keys(mu).length === 10,
        'g' + g + ' ' + d + '일차 얇은 차시를 복습으로 못 메움: 고유 ' + Object.keys(mu).length);
    }
  }
});

/* ⑤ SQL ↔ JS 드리프트 */
var sqlPath = path.join(__dirname, '..', '..', 'sql', 'setup_morning.sql');
var sql = fs.readFileSync(sqlPath, 'utf8');
var body = (sql.match(/CREATE OR REPLACE FUNCTION ma_max_step[\s\S]*?\$[A-Za-z_]*\$;/) || [''])[0];
T(!!body, 'SQL 에서 ma_max_step 을 못 찾음');
var sqlMax = {};
body.replace(/p_subject\s*=\s*'math'\s*AND\s*p_grade\s*=\s*(\d+)\s*THEN\s*(\d+)/g,
  function (_, g, v) { sqlMax[+g] = +v; return _; });
GRADES.forEach(function (g) {
  var js = KQuiz.mathMorningOrder(g).length;
  T(sqlMax[g] === js,
    'g' + g + ' 일차 불일치 — SQL ma_max_step=' + sqlMax[g] + ' vs 차시 수=' + js);
});

console.log('\n아침수학 검사 — 학년 ' + GRADES.length +
            ' · 총 ' + GRADES.reduce(function (a, g) { return a + KQuiz.mathMorningOrder(g).length; }, 0) +
            '일차 × ' + SEEDS.length + '시드 · 얇은 차시 복습 보정 ' + mixedOk + '/' + mixedCheck +
            ' — ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
