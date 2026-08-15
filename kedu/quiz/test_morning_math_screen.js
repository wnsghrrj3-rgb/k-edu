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

/* runScripts 없으면 window.eval 이 창 realm 이 아니라 노드 로컬 스코프에서 돌아
 * 함수 선언이 window 에 안 붙는다(8차에서 이걸 몰라 헤맨 지점). */
var dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
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
    T(/math_lessons\.js$/.test(files[files.length - 2] || ''),
      'g' + g + ' math_morning 앞에 정본 명세(math_lessons.js)가 없음 — 사다리가 8차 방식으로 돌아감');

    // ② 실재 확인
    files.forEach(function (f) {
      var p = path.join(ROOT, f.replace(/^\//, ''));
      T(fs.existsSync(p), 'g' + g + ' 파일 없음: ' + f);
    });

    // 카탈로그가 아는 그 학년 단원을 하나도 빠뜨리지 않아야 한다
    var expect = (catalog.units || catalog.list || []).filter(function (u) {
      return u.subject === 'math' && u.grade === g;
    }).length;
    T(files.length === expect + 2,
      'g' + g + ' 단원 파일 수 불일치: ' + (files.length - 2) + ' vs 카탈로그 ' + expect);

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

/* ⑤ 교사 화면 — 수학이 시간표에 노출되는가 */
(function () {
  var thtml = fs.readFileSync(path.join(ROOT, 'morning', 'teacher.html'), 'utf8');
  T(/\[\s*'math'\s*,\s*'수학'\s*\]/.test(thtml), '교사 화면 SUBJECTS 에 수학이 없음');
  T(thtml.indexOf("SUBJECT_UNIT") >= 0 && /math\s*:\s*'하루 한 차시'/.test(thtml),
    '교사 화면 과목별 진도 단위 문구(하루 한 차시)가 없음');
  T(thtml.indexOf("SUBJECT_KO[(r.days||{}).mon") < 0,
    '배너 요약이 아직 월요일 과목 하나로 전체를 대표하고 있음');

  // routineTxt 를 떼어내 그대로 행동 검사(화면 코드와 검사가 갈라지지 않게)
  var fm = thtml.match(/function routineTxt\(r\)\{[\s\S]*?\n  \}/);
  T(!!fm, '교사 화면에서 routineTxt 를 못 찾음');
  if (fm) {
    var tdom = new JSDOM('<body></body>', { runScripts: 'outside-only' });
    tdom.window.eval(
      "var SUBJECT_KO={hanja:'한자',math:'수학'};var SUBJECT_UNIT={hanja:'하루 한 자',math:'하루 한 차시'};"
      + fm[0] + "; this.__rt = routineTxt;");
    var rt = tdom.window.__rt;
    T(rt({ days: { mon: 'hanja', tue: 'hanja' } }) === '한자 <b>하루 한 자</b>', 'routineTxt 단일 한자 문구 오류');
    T(rt({ days: { mon: 'math' } }) === '수학 <b>하루 한 차시</b>', 'routineTxt 단일 수학 문구 오류');
    var mix = rt({ days: { mon: 'hanja', tue: 'hanja', thu: 'math', fri: 'math' } });
    T(mix.indexOf('월·화요일 한자') >= 0 && mix.indexOf('목·금요일 수학') >= 0, 'routineTxt 혼합 문구 오류: ' + mix);
    T(rt({}) === '아직 과목이 없어요', 'routineTxt 빈 시간표 문구 오류');
  }
  // 시간표에 넣을 수 있는 과목은 전부 미리보기 통로가 있어야 한다
  // (9.5차 실기기에서 수학을 배정해도 볼 곳이 없던 구멍 — 회귀 방지)
  var subs = (thtml.match(/\[\s*'([a-z]+)'\s*,\s*'[^']+'\s*\]/g) || [])
    .map(function (s) { return (s.match(/'([a-z]+)'/) || [])[1]; })
    .filter(function (s) { return s && s !== 'mon' && s !== 'tue' && s !== 'wed' && s !== 'thu' && s !== 'fri'; });
  T(subs.indexOf('hanja') >= 0 && subs.indexOf('math') >= 0, 'SUBJECTS 파싱 실패: ' + subs.join(','));
  T(/var PREVIEW = \{/.test(thtml), '교사 화면에 과목별 미리보기 맵(PREVIEW)이 없음');
  subs.forEach(function (s) {
    T(new RegExp(s + '\\s*:\\s*\\{\\s*href').test(thtml),
      '시간표에 고를 수 있는 과목인데 미리보기 통로가 없음: ' + s);
  });
  T(thtml.indexOf('previewLinks(r, c)') >= 0, '배너가 previewLinks 를 쓰지 않음');

  // 미리보기 페이지 실재 + 학생 화면과 같은 규칙으로 파일을 푸는가
  var mpath = path.join(ROOT, 'morning', 'math.html');
  T(fs.existsSync(mpath), 'morning/math.html 이 없음');
  if (fs.existsSync(mpath)) {
    var mhtml = fs.readFileSync(mpath, 'utf8');
    T(/mode\s*:\s*'teacher'/.test(mhtml), '수학 미리보기가 교사 모드로 띄우지 않음');
    T(mhtml.indexOf('math_morning.js') >= 0 && mhtml.indexOf('catalog.json') >= 0,
      '수학 미리보기가 학생 화면과 같은 파일 해석 규칙을 쓰지 않음');
    T(/kquiz-core\.js/.test(mhtml) && /kquiz-ui\.js/.test(mhtml), '수학 미리보기에 케이퀴즈 스크립트 누락');
    T(mhtml.indexOf('ma_submit') < 0 && mhtml.indexOf('getKeduDb') < 0,
      '미리보기가 DB 를 건드림 — 학생 기록이 오염될 수 있음');
  }
})();

Promise.all(jobs).then(function () {
  console.log('\n아침수학 화면 배선 — ' + pass + ' PASS / ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
})['catch'](function (e) {
  console.log('예외: ' + e.message);
  process.exit(1);
});
