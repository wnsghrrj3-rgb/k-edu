/* =============================================================
 * test_morning_math_picker.js — 아침수학 미리보기(math.html) 단원·차시 선택기
 *   ① math.html 에서 unitsFor/lessonLabel 을 떼어내 실제 사다리에 대고 돌린다
 *   ② 모든 일차가 단원 묶음 안에 정확히 한 번씩, 순서대로 들어가는가
 *   ③ 차시 라벨이 전부 비어 있지 않은가(제목 없는 옛 형식은 'N차시' 로 서는가)
 *   ④ 단원 첫 차시의 day 로 되짚으면 같은 단원이 나오는가(단원 변경 핸들러 경로)
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_morning_math_picker.js
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');

var ROOT = path.join(__dirname, '..', '..');
var html = fs.readFileSync(path.join(ROOT, 'morning', 'math.html'), 'utf8');
var catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'kedu', 'quiz', 'catalog.json'), 'utf8'));

var fail = 0, pass = 0;
function T(c, m) { if (c) { pass++; } else { fail++; console.log('  ✗ ' + m); } }

/* 화면 코드에서 그대로 떼어낸다 — 검사와 화면이 갈라지지 않게 */
var mU = html.match(/function unitsFor\(grade\)\{[\s\S]*?\n  \}/);
var mL = html.match(/function lessonLabel\(les\)\{[\s\S]*?\n  \}/);
T(!!mU, 'math.html 에서 unitsFor 를 못 찾음 — 시그니처가 바뀌었나');
T(!!mL, 'math.html 에서 lessonLabel 을 못 찾음');
if (!mU || !mL) { console.log('\n중단'); process.exit(1); }

/* 사다리를 실제 로드 규칙대로 살린다(단원 파일 전부 → math_lessons → math_morning) */
var CORE = require('./kquiz-core.js');
var KQuiz = { core: CORE };
(catalog.units || catalog.list || []).filter(function (u) { return u.subject === 'math'; })
  .forEach(function (u) {
    var mod = require(path.join(ROOT, 'kedu', 'quiz', 'templates', u.key + '.js'));
    if (typeof mod === 'function') mod(CORE);
  });
[ 'math_lessons.js', 'math_morning.js' ].forEach(function (f) {
  var mod = require(path.join(ROOT, 'kedu', 'quiz', 'templates', f));
  if (typeof mod === 'function' && f !== 'math_lessons.js') mod(CORE);
});

var fns = eval('(function(){' + mU[0] + '\n' + mL[0]
  + '\nreturn { unitsFor: unitsFor, lessonLabel: lessonLabel };})()');
var unitsFor = fns.unitsFor, lessonLabel = fns.lessonLabel;

[1, 2, 3, 4, 5, 6].forEach(function (g) {
  var order = CORE.mathMorningOrder(g);
  T(order.length > 0, 'g' + g + ' 사다리가 비었음');
  var units = unitsFor(g);
  T(units.length > 0, 'g' + g + ' 단원 묶음이 비었음');

  /* ② 일차 전수: 1..n 이 정확히 한 번씩, 단원 순서 = 사다리 순서 */
  var seen = [], flatDays = [];
  units.forEach(function (u) {
    T(!!u.name, 'g' + g + ' ' + u.unitNo + '단원 이름 없음');
    u.lessons.forEach(function (les) { flatDays.push(les.day); });
  });
  T(flatDays.length === order.length,
    'g' + g + ' 차시 수 불일치: 묶음 ' + flatDays.length + ' vs 사다리 ' + order.length);
  var mono = flatDays.every(function (d, i) { return d === i + 1; });
  T(mono, 'g' + g + ' 일차가 1..n 연속이 아님(빠짐/중복/순서 뒤섞임)');

  /* ③ 라벨 전수 */
  units.forEach(function (u) {
    u.lessons.forEach(function (les) {
      var lab = lessonLabel(les);
      T(typeof lab === 'string' && lab.length > 0,
        'g' + g + ' ' + u.unitNo + '단원 day' + les.day + ' 라벨이 비었음');
    });
  });

  /* ④ 단원 첫 차시 day 로 되짚기 */
  units.forEach(function (u) {
    var d = u.lessons[0].day;
    var back = units.filter(function (x) {
      return x.lessons.some(function (les) { return les.day === d; });
    })[0];
    T(back === u, 'g' + g + ' ' + u.unitNo + '단원 첫 차시 day' + d + ' 가 다른 단원으로 되짚어짐');
  });
});

console.log('\ntest_morning_math_picker: ' + pass + ' 통과, ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
