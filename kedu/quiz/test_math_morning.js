/* =============================================================
 * test_math_morning.js — 아침활동 수학(하루 1차시) 검산 (node)
 *   9.7차 전면 개정: 사다리의 기준이 케이퀴즈 보유분 → **자기주도 명세**로 바뀜.
 *   ① 명세 ↔ 파일시스템 드리프트 — math_lessons.js 가 grade{g}/semester1/math 실물과 같은가
 *      (자기주도에 차시를 더하거나 빼고 빌더를 안 돌리면 여기서 잡힌다)
 *   ② 사다리 무손실 — 명세의 모든 차시가 정확히 한 일차씩 배정되는가 + 순서 보존
 *   ③ 세트 연결 정직성 — 명세의 quiz 키가 전부 실등록돼 있고, 케이퀴즈 세트 중
 *      사다리에 안 매달린 고아가 없는가(이름 대조 누락 검출)
 *   ④ 전 일차 × 여러 시드: 문항 10개·발문 중복 0·보기 중복 0·정답 범위·
 *      만점 채점 일치·같은 시드 재현성
 *   ⑤ 모드 정합 — set 날은 그 세트 문항이 실제로 나오고, review 날은
 *      "그날까지 나온 세트" 밖의 문항이 없으며(미배운 단원 노출 0), borrow 는
 *      같은 단원 안에서만 당겨쓰는가
 *   ⑥ SQL ↔ JS 드리프트: ma_max_step(math) = 명세 일수
 *   ⑦ source 문구 — [object Object] 회귀(9.6차) + 단원 표기 존재
 * 실행: node kedu/quiz/test_math_morning.js
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var KQuiz = require('./kquiz-core.js');
var ROOT = path.join(__dirname, '..', '..');

var registered = [];
var origReg = KQuiz.register;
KQuiz.register = function (k, d) { registered.push(k); return origReg(k, d); };

var TPL = path.join(__dirname, 'templates');
fs.readdirSync(TPL).filter(function (f) { return /_math_u/.test(f); }).sort()
  .forEach(function (f) { require(path.join(TPL, f))(KQuiz); });
var unitKeys = registered.slice();
var LESSONS = require(path.join(TPL, 'math_lessons.js'));
require(path.join(TPL, 'math_morning.js'))(KQuiz);

var fail = 0, pass = 0;
function T(c, m) { if (c) { pass++; } else { fail++; console.log('  ✗ ' + m); } }

var GRADES = [1, 2, 3, 4, 5, 6];

/* ① 명세 ↔ 파일시스템 드리프트 — 빌더와 같은 규칙으로 재스캔해 대조 */
GRADES.forEach(function (g) {
  var base = path.join(ROOT, 'grade' + g, 'semester1', 'math');
  var fsUnits = {};
  fs.readdirSync(base).sort().forEach(function (d) {
    var m = d.match(/^(\d+)단원_(.+)$/);
    if (!m) return;
    var folder = path.join(base, d), sub = path.join(folder, '재수정_v1');
    var dirs = [folder].concat(fs.existsSync(sub) ? [sub] : []);
    var ls = {};
    dirs.forEach(function (sd) {
      fs.readdirSync(sd).forEach(function (f) {
        if (!/\.html$/.test(f) || /_game_|_adv_|_advanced|_extra_/.test(f)) return;
        var mm = f.match(new RegExp('^g' + g + '_math_u(\\d+)_l?(\\d+(?:_\\d+)?)(?:_(.+))?\\.html$'));
        if (mm) ls[mm[2]] = mm[3] || null;
      });
    });
    fsUnits[+m[1]] = { name: m[2], lessons: ls };
  });
  var man = LESSONS[g] || LESSONS[String(g)];
  T(!!man, 'g' + g + ' 명세 없음');
  if (!man) return;
  T(man.length === Object.keys(fsUnits).length,
    'g' + g + ' 단원 수 드리프트: 명세 ' + man.length + ' vs 실물 ' + Object.keys(fsUnits).length);
  man.forEach(function (u) {
    var real = fsUnits[u.unitNo];
    T(!!real && real.name === u.name, 'g' + g + ' u' + u.unitNo + ' 단원명 드리프트: ' + u.name);
    if (!real) return;
    T(u.lessons.length === Object.keys(real.lessons).length,
      'g' + g + ' u' + u.unitNo + ' 차시 수 드리프트: 명세 ' + u.lessons.length + ' vs 실물 ' + Object.keys(real.lessons).length);
    u.lessons.forEach(function (les) {
      T(Object.prototype.hasOwnProperty.call(real.lessons, les.l),
        'g' + g + ' u' + u.unitNo + ' ' + les.l + ' 실물에 없음(빌더 재실행 필요)');
      T(real.lessons[les.l] === les.title,
        'g' + g + ' u' + u.unitNo + ' ' + les.l + ' 제목 드리프트: ' + les.title);
    });
  });
});

/* ② 사다리 무손실 + 순서 보존 */
GRADES.forEach(function (g) {
  var man = LESSONS[g] || LESSONS[String(g)];
  var flat = [];
  man.forEach(function (u) { u.lessons.forEach(function (l) { flat.push({ u: u.unitNo, l: l.l }); }); });
  var days = KQuiz.mathMorningOrder(g);
  T(days.length === flat.length, 'g' + g + ' 일수(' + days.length + ') ≠ 명세 차시 수(' + flat.length + ')');
  days.forEach(function (d, i) {
    T(d.unitNo === flat[i].u && d.l === flat[i].l,
      'g' + g + ' ' + (i + 1) + '일차가 명세 순서와 다름: u' + d.unitNo + '_' + d.l + ' vs u' + flat[i].u + '_' + flat[i].l);
    T(!!KQuiz.getDef('g' + g + '_math_c' + ('00' + (i + 1)).slice(-3)), 'g' + g + ' c' + (i + 1) + ' 미등록');
  });
});

/* ③ 세트 연결 정직성 */
var linked = {};
GRADES.forEach(function (g) {
  (LESSONS[g] || LESSONS[String(g)]).forEach(function (u) {
    u.lessons.forEach(function (les) {
      if (!les.quiz) return;
      linked[les.quiz] = 1;
      T(!!KQuiz.getDef(les.quiz), '명세의 quiz 키가 실등록에 없음: ' + les.quiz);
    });
  });
});
unitKeys.filter(function (k) { return /_l\d/.test(k); }).forEach(function (k) {
  T(!!linked[k], '고아 케이퀴즈 세트(사다리에 안 매달림 — 별칭·대조 누락?): ' + k);
});

/* ④ 전 일차 전수 생성 + ⑤ 모드 정합 */
var SEEDS = [11, 977, 4231, 60013];
var totalDays = 0, thinFixed = 0;

/* 세트 키 → 템플릿 집합(모드 정합 검사용) */
function tplSet(quizKey) { var d = KQuiz.getDef(quizKey); return d ? d.templates : []; }

GRADES.forEach(function (g) {
  var days = KQuiz.mathMorningOrder(g);
  totalDays += days.length;
  var soFar = [];   // 그날까지 나온 세트의 템플릿(참조 비교)
  days.forEach(function (day, idx) {
    var dayNo = idx + 1;
    var cKey = 'g' + g + '_math_c' + ('00' + dayNo).slice(-3);
    var def = KQuiz.getDef(cKey);
    if (!def) return;   // ②에서 이미 실패로 집계

    /* ⑤ 모드 정합 */
    T(def.lesson_meta && def.lesson_meta.mode === day.mode, cKey + ' 모드 메타 불일치');
    if (day.mode === 'set') {
      var mine = tplSet(day.quiz);
      var hasOwn = def.templates.some(function (t) { return mine.indexOf(t) >= 0; });
      T(hasOwn, cKey + ' set 날인데 자기 세트 문항이 없음');
      var allowed = soFar.concat(mine);
      def.templates.forEach(function (t) {
        T(allowed.indexOf(t) >= 0, cKey + ' 에 미배운 세트 문항 혼입');
      });
    } else if (day.mode === 'review') {
      T(def.templates.length > 0, cKey + ' review 날인데 풀이 비었음');
      def.templates.forEach(function (t) {
        T(soFar.indexOf(t) >= 0, cKey + ' review 에 그날까지 안 나온 문항 혼입(미배운 단원 노출)');
      });
      thinFixed++;
    } else if (day.mode === 'borrow') {
      T(soFar.length === 0, cKey + ' borrow 인데 복습 풀이 있었음(review 여야 함)');
      // 당겨쓴 세트가 같은 단원 것인지 — 템플릿 출처 세트를 역추적
      var srcUnit = null;
      (LESSONS[g] || LESSONS[String(g)]).forEach(function (u) {
        u.lessons.forEach(function (les) {
          if (les.quiz && tplSet(les.quiz).indexOf(def.templates[0]) >= 0) srcUnit = u.unitNo;
        });
      });
      T(srcUnit === day.unitNo, cKey + ' borrow 가 다른 단원(u' + srcUnit + ')에서 당겨씀');
    }
    if (day.mode === 'set') soFar = soFar.concat(tplSet(day.quiz));

    /* ④ 생성 검사 */
    SEEDS.forEach(function (seed) {
      var r1 = KQuiz.generate({ lesson: cKey, n: 10, seed: seed });
      var it1 = r1.items || r1;
      T(it1.length === 10, cKey + ' seed ' + seed + ' 문항 ' + it1.length);
      var seenQ = {}, dupQ = 0;
      it1.forEach(function (it) { if (seenQ[it.q]) dupQ++; seenQ[it.q] = 1; });
      T(dupQ === 0, cKey + ' seed ' + seed + ' 발문 중복 ' + dupQ);
      it1.forEach(function (it) {
        if (it.type === 'choice') {
          var cs = {}, dupC = 0;
          it.choices.forEach(function (c) { if (cs[c]) dupC++; cs[c] = 1; });
          T(dupC === 0, cKey + ' 보기 중복');
          T(it.answer >= 0 && it.answer < it.choices.length, cKey + ' 정답 인덱스 범위 밖');
        }
      });
      var r2 = KQuiz.generate({ lesson: cKey, n: 10, seed: seed });
      var it2 = r2.items || r2;
      T(JSON.stringify(it1) === JSON.stringify(it2), cKey + ' seed ' + seed + ' 재현성 깨짐');
      var full = it1.map(function (it) { return it.type === 'choice' ? it.answer : it.answer; });
      var sc = KQuiz.grade ? KQuiz.grade(it1, full) : null;
      if (sc) T(sc.score === sc.max, cKey + ' 만점 채점 불일치');
    });
  });
});

/* ⑥ SQL ↔ JS 드리프트 */
var sql = fs.readFileSync(path.join(ROOT, 'sql', 'setup_morning.sql'), 'utf8');
GRADES.forEach(function (g) {
  var js = KQuiz.mathMorningOrder(g).length;
  var m = sql.match(new RegExp("p_subject = 'math'\\s+AND p_grade\\s+=\\s+" + g + "\\s+THEN\\s+(\\d+)"));
  T(!!m, 'SQL 에 math g' + g + ' 행이 없음');
  if (m) T(+m[1] === js, 'SQL↔JS 드리프트 g' + g + ': SQL ' + m[1] + ' vs JS ' + js);
});

/* ⑦ source 문구 회귀 — [object Object] (9.6차 실측) + 단원 표기 */
GRADES.forEach(function (g) {
  KQuiz.mathMorningOrder(g).forEach(function (_, i) {
    var d = KQuiz.getDef('g' + g + '_math_c' + ('00' + (i + 1)).slice(-3));
    T(String(d.source).indexOf('[object') < 0, 'g' + g + ' ' + (i + 1) + '일차 source 에 [object Object]');
    T(/\d+단원/.test(String(d.source)), 'g' + g + ' ' + (i + 1) + '일차 source 에 단원 표기 없음: ' + d.source);
  });
});

console.log('\n아침수학 검사(자기주도 명세 기준) — 총 ' + totalDays + '일차(복습 구성 ' + thinFixed + '일) × ' + SEEDS.length + '시드 — '
  + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
