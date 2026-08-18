/* =============================================================
 * test_morning_english_screen.js — 아침영어가 화면에서 실제로 뜨는가 (jsdom)
 *   ① 학생 화면 templateFiles() 가 english c키를 english_data.js + english.js 로 푸는가
 *   ② 그 파일이 레포에 실재하는가
 *   ③ 그렇게 로드하면 c키가 등록되고 10문항이 생성되는가
 *   ⑨ 새 낱말 뜻(gloss, D8-ⓐ): 미리보기 배지·인쇄물 카드·주간표가 원장 뜻을 그대로 싣는가,
 *      문맥 예외가 공용 뜻을 이기는가, 뜻 숨기기가 낱말 뜻까지 덮는가
 *   ④ 미리보기(morning/sents_preview.html) — 교사 모드 · DB 무접촉 ·
 *      학년 목록을 원장에서 끌어오는가(하드코딩하면 1·2학년이 뜬다)
 *   ⑩ 소리 배선(D8-ⓓ): 학생·미리보기 화면이 KTTS 를 싣는가, 수학은 안 싣는가
 *   ⑤ 교사 화면 배선(D4) — 고르기·보기·열기·학년 가드를 실제로 굴려서 확인한다
 *      (짝이 어긋나면 "고를 수 있는데 볼 수 없는 과목"이 된다)
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

/* ⑤ 교사 화면 배선(D4) — 상수 대조가 아니라 실제로 굴려 본다.
      교사가 영어를 "고를 수 있고 · 볼 수 있고 · 열 수 있고 · 원장 없는 학년엔 못 넣는가" 넷을 한자리에서 강제한다. */
(function () {
  var t = fs.readFileSync(path.join(PAGES, 'teacher.html'), 'utf8');

  /* 짝 일치 — 셋 중 하나만 빠져도 "고를 수 있는데 볼 수 없는 과목"이 된다 */
  var inSubjects = /\[\s*'english'\s*,\s*'영어'\s*\]/.test(t);
  var inPreview = /english\s*:\s*\{\s*href/.test(t);
  T(inSubjects === inPreview,
    inSubjects
      ? '교사 화면 SUBJECTS 에 영어가 있는데 PREVIEW 통로가 없음 — 고를 수 있는데 볼 수 없다'
      : '교사 화면 PREVIEW 에 영어가 있는데 SUBJECTS 에 없음 — 통로만 있고 배정할 수 없다');
  if (!inSubjects) { console.log('  · 교사 화면 영어 배선은 아직(D4 대기) — 짝 불일치 없음 확인'); return; }
  T(/english\s*:\s*'하루 한 문장'/.test(t), '교사 화면 과목별 진도 단위 문구(하루 한 문장)가 없음');
  T(t.indexOf('sents_preview.html') >= 0, 'PREVIEW 영어 통로가 미리보기 페이지를 가리키지 않음');
  T(t.indexOf('/kedu/quiz/templates/english_data.js') >= 0,
    '교사 화면이 영어 원장을 적재하지 않음 — 학년 가드·오늘 문장이 굴러갈 수 없다');

  /* 화면 본문을 그대로 떼어 평가한다 — 상수가 아니라 결과를 본다 */
  var grab = function (re, what) {
    var m = t.match(re);
    T(!!m, '교사 화면에서 ' + what + ' 를 못 찾음 — 시그니처가 바뀌었나');
    return m ? m[0] : '';
  };
  var parts = [
    grab(/var DOWS = \[[\s\S]*?\];/, 'DOWS'),
    grab(/var SUBJECTS = \[[\s\S]*?\];/, 'SUBJECTS'),
    grab(/var SUBJECT_KO = \{[\s\S]*?\};/, 'SUBJECT_KO'),
    grab(/var SUBJECT_UNIT = \{[\s\S]*?\};/, 'SUBJECT_UNIT'),
    grab(/function subjectGrades\(sub\)\{[\s\S]*?\n  \}/, 'subjectGrades'),
    grab(/function subjectOk\(sub, grade\)\{[\s\S]*?\n  \}/, 'subjectOk'),
    grab(/function subjectOptions\(sel, grade\)\{[\s\S]*?\n  \}/, 'subjectOptions'),
    grab(/var PREVIEW = \{[\s\S]*?\n  \};/, 'PREVIEW'),
    grab(/function previewLinks\(r, c\)\{[\s\S]*?\n  \}/, 'previewLinks'),
    grab(/function badDays\(days, grade\)\{[\s\S]*?\n  \}/, 'badDays'),
    grab(/function dayCells\(days, grade\)\{[\s\S]*?\n  \}/, 'dayCells'),
    grab(/function routineTxt\(r\)\{[\s\S]*?\n  \}/, 'routineTxt'),
    grab(/var ACTIVITY = \{[\s\S]*?\n  \};/, 'ACTIVITY'),
    grab(/function activityLink\(sess\)\{[\s\S]*?\n  \}/, 'activityLink'),
    grab(/function todayTag\(sess\)\{[\s\S]*?\n  \}/, 'todayTag')
  ];
  if (parts.some(function (x) { return !x; })) return;

  var w = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }).window;
  w.eval('function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}');
  w.KQuiz = { englishData: DATA, hanjaData: require('./templates/hanja_data.js') };
  w.eval(parts.join('\n') + '\nthis.__ = { so: subjectOptions, ok: subjectOk, pl: previewLinks, dc: dayCells, bd: badDays, rt: routineTxt, al: activityLink, tt: todayTag };');
  var F = w.__;

  /* (1) 학년 가드 — 원장 있는 학년만 고를 수 있다. 학년 목록은 원장이 정한다(박으면 원장이 늘어도 화면이 모른다) */
  var EG = DATA.grades();
  T(/KQuiz\.englishData\.grades\(\)/.test(t), '교사 화면이 영어 가능 학년을 원장에서 묻지 않음(하드코딩)');
  EG.forEach(function (g) { T(F.ok('english', g) === true, g + '학년 영어가 잠겨 있음 — 원장이 있는데 못 고른다'); });
  [1, 2].forEach(function (g) { T(F.ok('english', g) === false, g + '학년 영어가 열려 있음 — 원장이 없는데 고를 수 있다'); });
  [1, 6].forEach(function (g) {
    T(F.ok('hanja', g) === true && F.ok('math', g) === true, g + '학년 한자·수학이 잠김 — 전 학년 과목이다');
  });

  /* (2) 선택지 실물 — 잠긴 학년에선 disabled 이고 이유가 적혀 있다 */
  var o1 = F.so('', 1), o3 = F.so('', 3);
  T(/value="english"[^>]*disabled/.test(o1), '1학년 요일 칸에서 영어가 잠기지 않음');
  T(/영어 \(3학년부터\)/.test(o1), '잠긴 이유(몇 학년부터)를 적지 않음 — 교사가 왜 못 고르는지 모른다');
  T(/value="english"(?![^>]*disabled)/.test(o3), '3학년 요일 칸에서 영어가 잠겨 있음');
  T(/value="english"[^>]*selected/.test(F.so('english', 3)), '3학년에서 이미 고른 영어가 selected 로 살아나지 않음');
  T(/value="english"[^>]*selected/.test(F.so('english', 1)) === false,
    '1학년인데 영어가 selected — 저장하면 갈 곳 없는 시간표가 된다');

  /* (3) 학년을 내리면 못 쓰는 칸은 비운다(조용히 살아남지 않게) */
  var cells1 = F.dc({ mon: 'english', tue: 'hanja' }, 1);
  T(/value="english"[^>]*selected/.test(cells1) === false, '1학년으로 내렸는데 영어 칸이 그대로 선택돼 있음');
  T(/value="hanja"[^>]*selected/.test(cells1), '학년을 내리면서 멀쩡한 한자 칸까지 비움');
  /* 되돌림은 브라우저 기본값이 아니라 화면이 직접 말해야 한다 —
     빈 칸이 selected 없이 나가면 브라우저가 첫 항목을 고르는 것뿐이라, 규약이 아니라 우연이 된다. */
  T((cells1.split('</select>')[0].match(/<option value=""[^>]*selected/) || []).length === 1,
    '되돌린 칸의 \'없음\'이 명시적으로 selected 가 아님 — 브라우저 기본값에 기대고 있다');
  T(/<option value=""[^>]*selected/.test(F.so('english', 3)) === false,
    '멀쩡히 고른 학년인데 \'없음\'이 선택됨');
  T(/value="english"[^>]*selected/.test(F.dc({ mon: 'english' }, 4)), '4학년 영어 칸이 살아나지 않음');

  /* (3-2) 저장 직전 관문 — 화면을 우회해 들어온 조합도 막는다.
          잠긴 select 는 개발자도구로 풀 수 있고, 다른 탭에 열어 둔 묵은 화면은 옛 학년을 들고 있다. */
  T(/badDays\(days, newGrade\)/.test(t), '저장 자리에서 학년-과목 관문을 통과시키지 않음');
  T(F.bd({ mon: 'english', tue: 'hanja' }, 1).join() === 'mon', '1학년 영어 조합이 저장 관문을 통과함');
  T(F.bd({ mon: 'english', fri: 'english' }, 2).length === 2, '2학년 영어 두 칸 중 일부만 잡힘');
  T(F.bd({ mon: 'english', tue: 'hanja', fri: 'math' }, 5).length === 0, '멀쩡한 5학년 시간표가 막힘');
  T(F.bd({}, 1).length === 0, '빈 시간표가 막힘');

  /* (4) 미리보기 통로 — 시간표에 넣었으면 볼 곳이 있어야 하고, 학년이 따라가야 한다 */
  var pe = F.pl({ days: { mon: 'english', tue: 'english' }, grade: 5 }, {});
  T(pe.indexOf('/morning/sents_preview.html?grade=5') >= 0, '영어 미리보기 통로가 없거나 학년이 안 따라감');
  T((pe.match(/sents_preview/g) || []).length === 1, '같은 과목 미리보기 통로가 중복으로 붙음');
  var pm = F.pl({ days: { mon: 'hanja', wed: 'english', fri: 'math' }, grade: 3 }, {});
  ['chars.html', 'sents_preview.html', 'math.html'].forEach(function (h) {
    T(pm.indexOf(h) >= 0, '섞인 시간표에서 ' + h + ' 통로가 빠짐');
  });
  T(F.pl({ days: {}, grade: 3 }, {}) === '', '과목이 없는데 미리보기 통로가 붙음');

  /* (5) 사람 말 — 영어만 하는 반은 '하루 한 문장' */
  T(F.rt({ days: { mon: 'english', tue: 'english' } }).indexOf('하루 한 문장') >= 0,
    '영어 반 안내 문구에 진도 단위(하루 한 문장)가 없음');
  T(F.rt({ days: { mon: 'hanja', thu: 'english' } }).indexOf('하루 한 문장') >= 0,
    '섞인 시간표 문구에 영어 단위가 없음');

  /* (6) 현황판 통로 — 과목을 보고 연다(학생 화면과 같은 규약).
         예전 교사 화면은 lesson_key 만 있으면 무조건 한자 화면으로 보냈다. */
  T(t.indexOf("href=\"/morning/chars.html?key='+esc(s.lesson_key)") < 0,
    '교사 현황판에 과목을 안 보고 한자 화면으로 보내는 코드가 남아 있음');
  T(/\/morning\/sents\.html\?key=g3_english_c007/.test(F.al({ subject: 'english', lesson_key: 'g3_english_c007' })),
    '현황판에서 영어 세션이 문장 화면으로 열리지 않음');
  T(/\/morning\/chars\.html\?key=g1_hanja_c003/.test(F.al({ subject: 'hanja', lesson_key: 'g1_hanja_c003' })),
    '현황판에서 한자 세션이 한자 화면으로 열리지 않음');
  T(F.al({ subject: 'math', lesson_key: 'g3_math_c015' }) === '', '수학 세션에 활동 통로가 붙음 — 갈 곳 없는 링크다');
  T(F.al({ subject: 'english' }) === '', 'lesson_key 없는데 통로가 생김');

  /* (7) 오늘 태그 — 교사가 제목만 보고도 오늘 무엇이 나가는지 안다 */
  var d1 = DATA.day(3, 7);
  var tag = F.tt({ subject: 'english', lesson_key: 'g3_english_c007' });
  T(tag.indexOf(d1.sent) >= 0, '오늘 문장이 제목에 안 뜸');
  T(tag.indexOf(d1.ko) >= 0, '오늘 문장의 뜻이 제목에 안 뜸');
  T(F.tt({ subject: 'hanja', lesson_key: 'g1_hanja_c003' }).length > 0, '한자 오늘 글자 태그가 사라짐');
  T(F.tt({ subject: 'math', lesson_key: 'g3_math_c015' }) === '', '원장 없는 과목에 태그가 붙음');
  T(F.tt({ subject: 'english', lesson_key: 'g1_english_c001' }) === '',
    '원장 없는 학년(1학년 영어)에 태그가 지어내짐');
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

/* ══ 공용: 화면 하나를 jsdom 에서 실제로 띄운다 ══
   /kedu/... 로 부르는 스크립트를 레포 실물로 갈아 끼운다. 없는 태그를 갈아 끼우려 하면
   조용히 지나가지 않고 그 자리에서 실패로 남긴다 — 시그니처가 바뀌면 검사가 헛돌기 때문이다. */
function boot(file, qs, opt) {
  opt = opt || {};
  var p = path.join(PAGES, file);
  if (!fs.existsSync(p)) { T(false, 'morning/' + file + ' 이 없음'); return null; }
  var h = fs.readFileSync(p, 'utf8');
  [['/kedu/quiz/kquiz-core.js', ['kedu', 'quiz', 'kquiz-core.js']],
   ['/kedu/quiz/kquiz-ui.js', ['kedu', 'quiz', 'kquiz-ui.js']],
   ['/kedu/quiz/templates/english_data.js', ['kedu', 'quiz', 'templates', 'english_data.js']],
   ['/kedu/quiz/templates/english.js', ['kedu', 'quiz', 'templates', 'english.js']]
  ].forEach(function (pair) {
    var tag = '<script src="' + pair[0] + '"></script>';
    if (h.indexOf(tag) < 0) return;
    var src = '<script>' + fs.readFileSync(path.join(ROOT, pair[1].join(path.sep)), 'utf8') + '</script>';
    /* 원장에 구멍을 낸다 — 일수는 그대로인데 뒤쪽 날이 비어 있는 상태.
       원장이 학년마다 고르게 차 있는 지금은 "빈 날" 분기에 닿을 길이 없어,
       방어가 살아 있는지 죽어 있는지 구분되지 않는다. 그래서 닿게 만들어 본다. */
    if (opt.cap && pair[0].indexOf('english_data') >= 0) {
      src += '<script>(function(){var D=window.KQuiz.englishData,od=D.day,C=' + opt.cap + ';'
           + 'D.day=function(g,d){return d>C?null:od(g,d);};})();</script>';
    }
    h = h.replace(tag, src);
  });
  var dom = new JSDOM(h, {
    url: 'https://keduclass.com/morning/' + file + (qs || ''),
    runScripts: 'dangerously', pretendToBeVisual: true
  });
  var doc = dom.window.document;
  return {
    win: dom.window, doc: doc,
    $: function (s) { return doc.querySelector(s); },
    all: function (s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); },
    txt: function (s) { var e = doc.querySelector(s); return e ? e.textContent : ''; }
  };
}

/* ⑥ 미리보기 → 학생 화면·인쇄물 통로 (D6)
      교사가 "무엇이 나가는지" 본 자리에서 "아이가 어떻게 만나는지"로 바로 건너갈 수 있어야 한다.
      통로는 화면에 박힌 주소가 아니라 지금 고른 학년·일차를 따라가야 한다. */
(function () {
  var o = boot('sents_preview.html', '?grade=4&day=3');
  if (!o) return;
  var open1 = o.$('#wayOpen'), print1 = o.$('#wayPrint');
  T(!!open1, '미리보기에 학생 화면 통로가 없음 — 보기만 하고 열어 볼 수 없다');
  T(!!print1, '미리보기에 인쇄물 통로가 없음');
  if (!open1 || !print1) return;

  var hO = open1.getAttribute('href') || '', hP = print1.getAttribute('href') || '';
  T(hO.indexOf('/morning/sents.html') === 0, '학생 화면 통로가 3막 화면을 가리키지 않음: ' + hO);
  T(/grade=4/.test(hO) && /day=3/.test(hO), '학생 화면 통로가 고른 학년·일차를 안 물고 감: ' + hO);
  /* 교실 공용 기기에서 미리 돌려도 도장이 찍히면 안 된다 */
  T(/peek=1/.test(hO), '학생 화면 통로가 peek 없이 열림 — 미리 보다 아이 기록이 생긴다');
  T(hP.indexOf('/morning/sents_print.html') === 0, '인쇄물 통로가 인쇄 화면을 가리키지 않음: ' + hP);
  T(/grade=4/.test(hP) && /day=3/.test(hP), '인쇄물 통로가 고른 학년·일차를 안 물고 감: ' + hP);
  T(open1.getAttribute('target') === '_blank' && print1.getAttribute('target') === '_blank',
    '통로가 보던 자리를 덮어씀 — 준비하다 미리보기를 잃는다');
  T((open1.getAttribute('rel') || '').indexOf('noopener') >= 0
    && (print1.getAttribute('rel') || '').indexOf('noopener') >= 0, '새 창 통로에 noopener 가 없음');

  /* 일차를 바꾸면 통로도 따라와야 한다 — 묵은 주소가 남으면 엉뚱한 날이 열린다 */
  var d = o.doc.getElementById('d');
  d.value = '9'; d.onchange();
  T(/day=9/.test(o.$('#wayOpen').getAttribute('href')), '일차를 바꿨는데 학생 화면 통로가 묵은 날을 가리킴');
  T(/day=9/.test(o.$('#wayPrint').getAttribute('href')), '일차를 바꿨는데 인쇄물 통로가 묵은 날을 가리킴');
  var g = o.doc.getElementById('g');
  g.value = '6'; g.onchange();
  T(/grade=6/.test(o.$('#wayOpen').getAttribute('href')), '학년을 바꿨는데 통로가 묵은 학년을 가리킴');
  T(/day=1(&|$)/.test(o.$('#wayOpen').getAttribute('href')), '학년 전환 뒤 일차가 1로 안 접힘');

  /* 원장에 없는 일차에서는 통로 자체를 감춘다 — 열었는데 볼 것이 없으면 안 된다 */
  var card = o.doc.getElementById('wayCard');
  T(!!card, '통로 묶음 자리가 없음');
  T(card.style.display !== 'none', '정상 일차인데 통로가 감춰져 있음');

  /* ★새 낱말 뜻(D8-ⓐ) — 교사가 미리보기에서 "오늘 뭐가 새것인지"를 뜻까지 함께 본다.
     여기서 뜻이 비면 준비하는 사람이 뜻을 지어내게 된다. */
  var o4 = boot('sents_preview.html', '?grade=5&day=11');
  if (o4) {
    var xg = DATA.day(5, 11), gl = DATA.glossesOf(5, 11);
    var bg = o4.all('.badge');
    T(bg.length === (xg['new'] || []).length, '미리보기 새 낱말 배지 수가 원장과 다름: ' + bg.length);
    gl.forEach(function (it, i) {
      T(!!bg[i] && bg[i].textContent.indexOf(it.unit) >= 0, '미리보기 배지에 낱말이 빠짐: ' + it.unit);
      var em = bg[i] && bg[i].querySelector('em');
      T(!!em, '미리보기 배지에 뜻이 안 붙음: ' + it.unit);
      T(!em || em.textContent === it.ko, '미리보기 뜻이 원장과 다름: ' + it.unit + ' → "' + (em ? em.textContent : '') + '"');
    });
    /* 그날 문맥 예외가 공용 뜻을 이기는지 실물에서 확인(g5 d11 like = look like 의 like) */
    T(o4.txt('.badge') !== '' && o4.all('.badge').some(function (e) {
      return e.textContent.indexOf('(look like)') >= 0; }), '문맥 예외 뜻이 화면까지 안 내려옴');
  }
})();

/* ⑦ 인쇄물 (D6) — 카드 · 주간표 두 판형 */
(function () {
  var p = path.join(PAGES, 'sents_print.html');
  T(fs.existsSync(p), 'morning/sents_print.html 이 없음');
  if (!fs.existsSync(p)) return;
  var raw = fs.readFileSync(p, 'utf8');
  T(raw.indexOf('ma_submit') < 0 && raw.indexOf('getKeduDb') < 0,
    '인쇄물이 DB 를 건드림 — 종이를 뽑는 일에 기록이 끼면 안 된다');
  T(/@media\s+print/.test(raw), '인쇄물에 인쇄 규칙(@media print)이 없음');
  T(/@page/.test(raw), '인쇄물에 용지 규격(@page)이 없음');
  T(/\[\s*1\s*,\s*2\s*,\s*3\s*,\s*4\s*,\s*5\s*,\s*6\s*\]/.test(raw) === false,
    '인쇄물에 학년 하드코딩이 있음 — 원장 없는 1·2학년이 뜬다');

  /* 카드 판형 */
  var g = 5, d = 7, x = DATA.day(g, d);
  var o = boot('sents_print.html', '?grade=' + g + '&day=' + d);
  if (!o) return;
  T(o.all('.sheet').length === 1, '카드 판형이 한 장이 아님');
  T(o.txt('.card-sent') === x.sent, '카드의 문장이 원장과 다름: ' + o.txt('.card-sent'));
  T(o.txt('.card-ko') === x.ko, '카드의 뜻이 원장과 다름');
  T(o.all('.card-tiles span').map(function (e) { return e.textContent; }).join(' ') === x.tiles.join(' '),
    '카드의 낱말 조각이 원장 tiles 와 다름');
  (x['new'] || []).forEach(function (w) {
    T(o.txt('.words').indexOf(w) >= 0, '카드에 새 낱말이 빠짐: ' + w);
  });
  /* ★새 낱말 뜻(D8-ⓐ) — 종이로 나가는 낱말에 뜻이 없으면 집에서 물어볼 데가 없다 */
  var gls = DATA.glossesOf(g, d), wsp = o.all('.words span');
  T(wsp.length === (x['new'] || []).length, '카드 새 낱말 칸 수가 원장과 다름: ' + wsp.length);
  gls.forEach(function (it, i) {
    var em = wsp[i] && wsp[i].querySelector('em');
    T(!!em, '카드 새 낱말에 뜻이 없음: ' + it.unit);
    T(!em || em.textContent === it.ko, '카드 뜻이 원장과 다름: ' + it.unit);
    T(!wsp[i] || wsp[i].textContent.indexOf(it.unit) >= 0, '카드에서 낱말이 뜻에 밀려 사라짐: ' + it.unit);
  });
  if (x.expand && x.expand.sent) {
    T(o.txt('.exp').indexOf(x.expand.sent) >= 0, '카드에 넓히기 문장이 없음');
  }
  /* 학년 목록은 원장이 정한다 */
  T(o.all('#g option').map(function (e) { return +e.value; }).join(',') === DATA.grades().join(','),
    '인쇄물 학년 목록이 원장과 다름');
  T(o.all('#d option').length === DATA.maxDay(g), '인쇄물 일차 목록이 원장 일수와 다름');

  /* 뜻 숨기기 — 합창 때 한국어가 먼저 읽히면 아이가 영어를 안 본다 */
  T(o.doc.body.classList.contains('noko') === false, '기본이 뜻 숨김 상태임');
  o.doc.getElementById('ko').click();
  T(o.doc.body.classList.contains('noko') === true, '뜻 숨기기가 안 걸림');
  T(o.doc.getElementById('ko').textContent.indexOf('보이기') >= 0, '뜻 숨긴 뒤 버튼 문구가 안 바뀜');
  o.doc.getElementById('ko').click();
  T(o.doc.body.classList.contains('noko') === false, '뜻 다시 보이기가 안 됨');
  T(o.txt('.card-sent') === x.sent, '뜻 토글 뒤 문장이 사라짐 — 다시 그릴 때 원장을 잃었다');

  /* ★숨김 규칙이 새 낱말 뜻까지 덮는가 — 문장 뜻만 가리고 낱말 뜻이 남으면 토글이 새는 문이 된다.
     상수 대조가 아니라, 규칙에 적힌 선택자를 실제 화면에 걸어 뜻 노드가 잡히는지 본다. */
  var mRule = raw.match(/body\.noko[^{]*\{[^}]*visibility\s*:\s*hidden[^}]*\}/);
  T(!!mRule, '인쇄물에 뜻 숨김 규칙이 없음');
  if (mRule) {
    var sels = mRule[0].split('{')[0].split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    o.doc.getElementById('ko').click();                 /* 숨김 켜기 */
    var hit = [];
    sels.forEach(function (sel) { try { hit = hit.concat(o.all(sel)); } catch (e) {} });
    var glNodes = o.all('.words span em');
    T(glNodes.length > 0, '숨김 검사에 쓸 새 낱말 뜻 노드가 없음 — 표본 일차를 바꿔야 한다');
    glNodes.forEach(function (e) {
      T(hit.indexOf(e) >= 0, '뜻 숨기기가 새 낱말 뜻을 안 덮음 — 한국어가 남아 합창 때 먼저 읽힌다');
    });
    T(o.all('.card-ko').every(function (e) { return hit.indexOf(e) >= 0; }), '뜻 숨기기가 문장 뜻을 안 덮음');
    o.doc.getElementById('ko').click();                 /* 원복 */
  }

  /* 주간표 판형 — 그 주 다섯 문장, 원장 끝을 넘으면 있는 만큼만 */
  o.doc.getElementById('mWeek').click();
  var rows = o.all('.wk tbody tr');
  T(rows.length === 5, '주간표가 다섯 줄이 아님: ' + rows.length);
  T(rows[0].querySelector('.s').textContent === DATA.day(g, 6).sent,
    '주간표 첫 줄이 그 주 첫날(6일째)이 아님');
  T(rows[4].querySelector('.s').textContent === DATA.day(g, 10).sent, '주간표 마지막 줄이 어긋남');
  T(o.txt('.wk').indexOf(DATA.day(g, 11).sent) < 0, '주간표에 다음 주 문장이 섞임');

  /* ★주간표 새 낱말 줄에도 뜻 — 가정통신문으로 나가는 판형이라 여기가 비면 집에서 못 읽는다 */
  for (var wi = 6; wi <= 10; wi++) {
    var wx = DATA.day(g, wi), wgl = DATA.glossesOf(g, wi);
    var line = rows[wi - 6].querySelector('.n');
    if (!(wx['new'] || []).length) { T(!line, wi + '일째는 새 낱말이 없는데 줄이 있음'); continue; }
    T(!!line, wi + '일째 새 낱말 줄이 없음');
    if (!line) continue;
    var ems = Array.prototype.slice.call(line.querySelectorAll('em'));
    T(ems.length === wgl.length, wi + '일째 뜻 개수 ' + ems.length + ' ≠ 새 낱말 ' + wgl.length);
    wgl.forEach(function (it, i) {
      T(line.textContent.indexOf(it.unit) >= 0, wi + '일째 주간표에 낱말이 빠짐: ' + it.unit);
      T(!!ems[i] && ems[i].textContent === it.ko, wi + '일째 주간표 뜻이 원장과 다름: ' + it.unit);
    });
  }

  /* 마지막 주 — 지어내지 않고 있는 만큼만.
     원장이 고르게 차 있는 지금은 부분 주가 생기지 않으므로, 원장에 구멍을 내어 닿게 한다.
     (원장이 학년마다 다른 길이로 자라면 이 상황이 실제로 온다) */
  var last = DATA.maxDay(g);
  var o2 = boot('sents_print.html', '?grade=' + g + '&day=' + last + '&mode=week', { cap: last - 2 });
  var r2 = o2.all('.wk tbody tr');
  T(r2.length === 3, '구멍 난 원장에서 주간표가 있는 만큼만 나오지 않음: ' + r2.length + '줄 (기대 3)');
  T(o2.txt('.wk').indexOf('undefined') < 0, '주간표가 빈 날을 지어냄');
  T(r2.length && r2[r2.length - 1].querySelector('.s').textContent === DATA.day(g, last - 2).sent,
    '구멍 난 원장에서 주간표 마지막 줄이 어긋남');

  /* 원장 없는 학년·이상 일차는 조용히 접는다 */
  var o3 = boot('sents_print.html', '?grade=1&day=999');
  T(o3.all('#g option').map(function (e) { return +e.value; }).indexOf(1) < 0,
    '인쇄물이 원장 없는 1학년을 고를 수 있게 함');
  T(o3.txt('.card-sent') === DATA.day(DATA.grades()[0], DATA.maxDay(DATA.grades()[0])).sent
    || o3.txt('.card-sent') === DATA.day(DATA.grades()[0], 1).sent,
    '원장 없는 학년·이상 일차에서 빈 카드가 나옴');
  T(o3.doc.querySelector('.sheet') !== null, '원장 없는 학년에서 종이가 아예 안 나옴');
})();

/* ── ⑩ 소리 배선 (D8-ⓓ) ─────────────────────────────────────
 *  ★이 검사가 필요한 이유: 이 script 줄이 빠져도 화면은 안 깨진다.
 *    kquiz-ui 가 KTTS 를 못 찾으면 조용히 글 대체로 내려앉아 문항은 그대로 답할 수 있다.
 *    즉 **아무 증상 없이 소리만 영영 안 나는** 상태가 되고, 검사기 전부가 그린이다.
 *    그래서 배선 자체를 눈으로 확인한다. (역검증에서 이 줄을 지우면 여기서 죽어야 한다.) */
var TTS_SRC = '/english/v3/engine/k-tts.js';
[['index.html', true], ['sents_preview.html', true], ['math.html', false]].forEach(function (row) {
  var f = row[0], want = row[1];
  var p = path.join(PAGES, f);
  if (!fs.existsSync(p)) { T(false, '화면 없음: ' + f); return; }
  var h = fs.readFileSync(p, 'utf8');
  var has = h.indexOf(TTS_SRC) >= 0;
  if (want) {
    T(has, f + ' 가 KTTS 를 안 싣는다 — 확인 문제 소리가 통째로 안 난다(화면은 멀쩡해 보인다)');
    /* 순서: 소리 엔진이 렌더러보다 먼저 서야 첫 문항부터 소리가 난다 */
    T(has && h.indexOf(TTS_SRC) < h.indexOf('/kedu/quiz/kquiz-ui.js'),
      f + ' 에서 KTTS 가 kquiz-ui 뒤에 실린다 — 첫 문항이 소리를 놓칠 수 있다');
  } else {
    /* ★수학은 소리를 안 쓴다. 실으면 쓰지도 않는 엔진을 매일 아침 내려받게 된다. */
    T(!has, f + ' 가 KTTS 를 싣는다 — 수학은 소리를 안 쓰는데 매일 내려받게 된다');
  }
});

Promise.all(jobs).then(function () {
  console.log('\n아침영어 화면 배선 — ' + pass + ' PASS / ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
})['catch'](function (e) {
  console.log('예외: ' + e.message);
  process.exit(1);
});
