/* =============================================================
 * test_morning_english_screen.js — 아침영어가 화면에서 실제로 뜨는가 (jsdom)
 *   ① 학생 화면 templateFiles() 가 english c키를 english_data.js + english.js 로 푸는가
 *   ② 그 파일이 레포에 실재하는가
 *   ③ 그렇게 로드하면 c키가 등록되고 10문항이 생성되는가
 *   ④ 미리보기(morning/sents_preview.html) — 교사 모드 · DB 무접촉 ·
 *      학년 목록을 원장에서 끌어오는가(하드코딩하면 1·2학년이 뜬다)
 *   ⑤ 교사 화면 짝 일치 — SUBJECTS 에 영어가 있으면 PREVIEW 통로도 있어야 한다
 *      (없으면 "고를 수 있는데 볼 수 없는 과목"이 된다. D4 배선을 여기서 지킨다)
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_morning_english_screen.js
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var { JSDOM } = require('jsdom');

var ROOT = path.join(__dirname, '..', '..');
/* 검사할 화면 폴더를 인자로 받는다 — 역검증은 변조 사본 폴더를 넘기므로
   원본 파일을 건드릴 일이 없다(9.7차 git 원복 함정 회피). */
var PAGES = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'morning');
var html = fs.readFileSync(path.join(PAGES, 'index.html'), 'utf8');
var DATA = require('./templates/english_data.js');

var fail = 0, pass = 0;
function T(c, m) { if (c) { pass++; } else { fail++; console.log('  ✗ ' + m); } }

/* ① 학생 화면의 파일 해석 규칙을 본문 그대로 떼어내 평가한다 */
var src = html.match(/function templateFiles\(lesson, cb\)\{[\s\S]*?\n  \}/);
T(!!src, 'morning/index.html 에서 templateFiles 를 못 찾음');
if (!src) { console.log('\n중단'); process.exit(1); }

var dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
dom.window.fetch = function () { return Promise.reject(new Error('영어는 catalog 를 쓰지 않는다')); };
dom.window.eval(src[0] + '; this.__tf = templateFiles;');

var jobs = [];
DATA.grades().forEach(function (g) {
  jobs.push(Promise.resolve(dom.window.__tf('g' + g + '_english_c001')).then(function (files) {
    T(Array.isArray(files) && files.length === 2,
      'g' + g + ' 영어 c키 파일 목록 이상: ' + JSON.stringify(files));
    if (!files) return;
    T(/english_data\.js$/.test(files[0]), 'g' + g + ' 첫 파일이 원장이 아님: ' + files[0]);
    T(/english\.js$/.test(files[1]), 'g' + g + ' 둘째 파일이 템플릿이 아님: ' + files[1]);
    files.forEach(function (f) {                                   // ②
      T(fs.existsSync(path.join(ROOT, f.replace(/^\//, ''))), 'g' + g + ' 파일 없음: ' + f);
    });
  }));
});

/* ③ 그 목록대로 로드하면 실제로 문제가 서는가 */
(function () {
  var CORE = require('./kquiz-core.js');
  require('./templates/english.js')({ core: CORE }, DATA);
  DATA.grades().forEach(function (g) {
    [1, Math.ceil(DATA.maxDay(g) / 2), DATA.maxDay(g)].forEach(function (d) {
      var key = 'g' + g + '_english_c' + ('00' + d).slice(-3);
      T(CORE.has(key), key + ' 미등록');
      if (!CORE.has(key)) return;
      var out = CORE.generate({ lesson: key, n: 10, seed: 5 });
      T(out.items.length === 10, key + ' 문항수 ' + out.items.length);
      var def = CORE.getDef(key);
      T(!!(def && def.day_meta && def.day_meta.sent),
        key + ' day_meta 없음 — 미리보기가 오늘 문장을 못 보여준다');
    });
  });
})();

/* ④ 미리보기 페이지 */
(function () {
  var p = path.join(PAGES, 'sents_preview.html');
  T(fs.existsSync(p), 'morning/sents_preview.html 이 없음');
  if (!fs.existsSync(p)) return;
  var h = fs.readFileSync(p, 'utf8');
  T(/mode\s*:\s*'teacher'/.test(h), '영어 미리보기가 교사 모드로 띄우지 않음');
  T(h.indexOf('/kedu/quiz/templates/english_data.js') >= 0
    && h.indexOf('/kedu/quiz/templates/english.js') >= 0,
    '영어 미리보기가 학생 화면과 같은 두 파일을 쓰지 않음');
  T(/kquiz-core\.js/.test(h) && /kquiz-ui\.js/.test(h), '영어 미리보기에 케이퀴즈 스크립트 누락');
  T(h.indexOf('ma_submit') < 0 && h.indexOf('getKeduDb') < 0,
    '미리보기가 DB 를 건드림 — 학생 기록이 오염될 수 있다');
  /* 학년 목록은 원장이 정한다. 하드코딩하면 원장 없는 1·2학년이 드롭다운에 뜨고,
     교사가 고르면 빈 화면을 만난다. */
  T(/GRADES\s*=\s*DATA\.grades\(\)/.test(h),
    '영어 미리보기가 학년 목록을 원장(DATA.grades)에서 끌어오지 않음');
  T(/\[\s*1\s*,\s*2\s*,\s*3\s*,\s*4\s*,\s*5\s*,\s*6\s*\]/.test(h) === false,
    '영어 미리보기에 학년 하드코딩이 남아 있음');
  T(h.indexOf('maxDay') >= 0, '일차 목록을 원장 일수에서 끌어오지 않음');
})();

/* ⑤ 교사 화면 — 배선했다면 짝이 맞아야 한다 */
(function () {
  var t = fs.readFileSync(path.join(PAGES, 'teacher.html'), 'utf8');
  var inSubjects = /\[\s*'english'\s*,\s*'영어'\s*\]/.test(t);
  var inPreview = /english\s*:\s*\{\s*href/.test(t);
  T(inSubjects === inPreview,
    inSubjects
      ? '교사 화면 SUBJECTS 에 영어가 있는데 PREVIEW 통로가 없음 — 고를 수 있는데 볼 수 없다'
      : '교사 화면 PREVIEW 에 영어가 있는데 SUBJECTS 에 없음 — 통로만 있고 배정할 수 없다');
  if (inSubjects) {
    T(/english\s*:\s*'하루 한 문장'/.test(t), '교사 화면 과목별 진도 단위 문구(하루 한 문장)가 없음');
    T(t.indexOf('sents_preview.html') >= 0, 'PREVIEW 영어 통로가 미리보기 페이지를 가리키지 않음');
  } else {
    console.log('  · 교사 화면 영어 배선은 아직(D4 대기) — 짝 불일치 없음 확인');
  }
})();

/* ⑥ 학생 진입 — 과목마다 제 활동 화면으로 가는가
   (예전엔 lesson_key 만 있으면 무조건 한자 화면으로 보냈다. 수학·영어 학생이
    엉뚱한 1학년 한자 칸을 만나던 결함이라 여기서 못을 박는다) */
(function () {
  T(fs.existsSync(path.join(PAGES, 'sents.html')), 'morning/sents.html 이 없음');
  T(/var ACTIVITY = \{/.test(html), 'morning/index.html 에 과목별 활동 통로 맵(ACTIVITY)이 없음');
  T(html.indexOf("href=\"/morning/chars.html?key='+esc(t.lesson_key)") < 0,
    '과목을 안 보고 한자 화면으로 보내는 코드가 남아 있음');

  var pick = html.match(/var ACTIVITY = \{[\s\S]*?\n  \};/);
  var fn = html.match(/function activityLink\(t, when\)\{[\s\S]*?\n  \}/);
  var unit = html.match(/var STEP_UNIT = \{[\s\S]*?\};/);
  var stf = html.match(/function stepTxt\(t\)\{[\s\S]*?\n  \}/);
  T(!!(pick && fn && unit && stf), '활동 통로/진도 단위 함수를 못 찾음 — 시그니처가 바뀌었나');
  if (!(pick && fn && unit && stf)) return;

  var w = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }).window;
  w.eval('function esc(s){return String(s==null?"":s);}\n'
    + pick[0] + '\n' + fn[0] + '\n' + unit[0] + '\n' + stf[0]
    + '\nthis.__a = activityLink; this.__s = stepTxt;');

  var A = w.__a, S = w.__s;
  T(/\/morning\/sents\.html\?key=g3_english_c007/.test(A({ subject: 'english', lesson_key: 'g3_english_c007' }, 'before')),
    '영어 세션이 문장 화면으로 가지 않음');
  T(/\/morning\/chars\.html\?key=g1_hanja_c003/.test(A({ subject: 'hanja', lesson_key: 'g1_hanja_c003' }, 'before')),
    '한자 세션이 한자 화면으로 가지 않음');
  T(A({ subject: 'math', lesson_key: 'g3_math_c015' }, 'before') === '',
    '수학 세션에 활동 통로가 붙음 — 갈 곳 없는 링크다');
  T(A({ subject: 'korean', lesson_key: 'g3_korean_u1' }, 'after') === '',
    '국어 세션에 활동 통로가 붙음');
  T(A({ subject: 'english' }, 'before') === '', 'lesson_key 없는데 통로가 생김');
  T(A({ subject: 'english', lesson_key: 'g3_english_c007' }, 'after')
    !== A({ subject: 'english', lesson_key: 'g3_english_c007' }, 'before'),
    '풀기 전/뒤 문구가 같음 — 두 자리의 말이 달라야 한다');

  T(S({ subject: 'english', step: 7, mode: 'new' }) === '7일째 문장', '영어 진도 단위가 문장이 아님');
  T(S({ subject: 'hanja', step: 3, mode: 'new' }) === '3일째 글자', '한자 진도 단위가 글자가 아님');
  T(S({ subject: 'math', step: 5, mode: 'new' }) === '5일째 차시', '수학 진도 단위가 차시가 아님');
  T(S({ subject: 'english', step: 7, mode: 'review' }) === '복습', '복습 표시가 어긋남');
  T(html.indexOf("'일째 글자'") < 0 && html.indexOf('일째 글자)') < 0,
    '과목 무관하게 "일째 글자"라 부르는 자리가 남아 있음');
})();

Promise.all(jobs).then(function () {
  console.log('\n아침영어 화면 배선 — ' + pass + ' PASS / ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
})['catch'](function (e) {
  console.log('예외: ' + e.message);
  process.exit(1);
});
