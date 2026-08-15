/* =============================================================
 * test_morning_math_screen.js — 아침활동 수학이 학생 화면에서 실제로 뜨는가 (jsdom)
 *   ① templateFiles() 가 수학 c키를 그 학년 단원 파일 전부 + math_morning.js 로 푸는가
 *   ② 그 파일 목록이 레포에 실재하는가(경로 오타·양산 후 카탈로그 미갱신 검출)
 *   ③ 그렇게 로드하면 c키가 등록되고 10문항이 생성되는가
 *   ④ 한자 키·단원 키의 기존 해석이 깨지지 않았는가(회귀)
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_morning_math_screen.js
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var { JSDOM } = require('jsdom');

var ROOT = path.join(__dirname, '..', '..');
var html = fs.readFileSync(path.join(ROOT, 'morning', 'index.html'), 'utf8');
var catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'kedu', 'quiz', 'catalog.json'), 'utf8'));

var fail = 0, pass = 0;
function T(c, m) { if (c) { pass++; } else { fail++; console.log('  ✗ ' + m); } }

/* templateFiles 본문만 떼어내 그대로 평가한다(화면 코드와 검사가 갈라지지 않게). */
var src = html.match(/function templateFiles\(lesson, cb\)\{[\s\S]*?\n  \}/);
T(!!src, 'morning/index.html 에서 templateFiles 를 못 찾음 — 함수 시그니처가 바뀌었나');
if (!src) { console.log('\n중단'); process.exit(1); }

var dom = new JSDOM('<!doctype html><html><body></body></html>');
var win = dom.window;
win.fetch = function (u) {
  T(u === '/kedu/quiz/catalog.json', 'catalog 경로가 예상과 다름: ' + u);
  return Promise.resolve({ json: function () { return Promise.resolve(catalog); } });
};
win.eval(src[0] + '; this.__tf = templateFiles;');

var GRADES = [1, 2, 3, 4, 5, 6];
var jobs = [];

GRADES.forEach(function (g) {
  jobs.push(win.__tf('g' + g + '_math_c001').then(function (files) {
    T(Array.isArray(files) && files.length >= 2, 'g' + g + ' 수학 c키 파일 목록이 비었음');
    if (!files) return;
    var last = files[files.length - 1];
    T(/math_morning\.js$/.test(last), 'g' + g + ' 목록 끝이 math_morning.js 가 아님: ' + last);

    // ② 실재 확인
    files.forEach(function (f) {
      var p = path.join(ROOT, f.replace(/^\//, ''));
      T(fs.existsSync(p), 'g' + g + ' 파일 없음: ' + f);
    });

    // 카탈로그가 아는 그 학년 단원을 하나도 빠뜨리지 않아야 한다
    var expect = (catalog.units || catalog.list || []).filter(function (u) {
      return u.subject === 'math' && u.grade === g;
    }).length;
    T(files.length === expect + 1,
      'g' + g + ' 단원 파일 수 불일치: ' + (files.length - 1) + ' vs 카탈로그 ' + expect);

    // ③ 그 목록대로 로드하면 c키가 살아나는가
    var KQuiz = require('./kquiz-core.js');
    files.forEach(function (f) {
      var mod = require(path.join(ROOT, f.replace(/^\//, '')));
      if (typeof mod === 'function') mod(KQuiz);
    });
    var key = 'g' + g + '_math_c001';
    T(KQuiz.has(key), key + ' 가 등록되지 않음');
    if (KQuiz.has(key)) {
      var r = KQuiz.generate({ lesson: key, n: 10, seed: 4242 });
      var items = r.items || r;
      T(items.length === 10, key + ' 문항 ' + items.length + '개');
      var seen = {}, dup = 0;
      items.forEach(function (it) { if (seen[it.q]) dup++; seen[it.q] = 1; });
      T(dup === 0, key + ' 발문 중복 ' + dup);
    }
  }));
});

/* ④ 기존 해석 회귀 */
jobs.push(win.__tf('g1_hanja_c001').then(function (f) {
  T(f && f.length === 2 && /hanja_data\.js$/.test(f[0]) && /hanja\.js$/.test(f[1]),
    '한자 c키 해석이 깨짐: ' + JSON.stringify(f));
}));
jobs.push(win.__tf('g1_hanja_s01').then(function (f) {
  T(f && f.length === 2, '한자 옛 s키 해석이 깨짐: ' + JSON.stringify(f));
}));
jobs.push(win.__tf('g3_math_u1_l02').then(function (f) {
  T(f && f.length === 1 && /g3_math_u1\.js$/.test(f[0]),
    '단원 키 해석이 깨짐: ' + JSON.stringify(f));
}));

Promise.all(jobs).then(function () {
  console.log('\n아침수학 화면 배선 — ' + pass + ' PASS / ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
})['catch'](function (e) {
  console.log('예외: ' + e.message);
  process.exit(1);
});
