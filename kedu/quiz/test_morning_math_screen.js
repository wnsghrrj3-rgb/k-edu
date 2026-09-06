/* =============================================================
 * test_morning_math_screen.js — 아침활동 수학이 학생 화면에서 실제로 뜨는가 (jsdom)
 *   ① templateFiles() 가 수학 c키를 그 학년 단원 파일 전부 + math_morning.js 로 푸는가
 *   ② 그 파일 목록이 레포에 실재하는가(경로 오타·양산 후 카탈로그 미갱신 검출)
 *   ③ 그렇게 로드하면 c키가 등록되고 10문항이 생성되는가
 *   ④ 한자 키·단원 키의 기존 해석이 깨지지 않았는가(회귀)
 *   ⑤ 미리보기 `math.html` 이 c키에서 진도일을 실제로 읽는가 + 「오늘」의 자격(설계 §4 ⓒ·§11-7) (2026-09-07)
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
  /* ★D8-ⓖ 로 인자가 하나 늘었다(오늘 몫 세션). 이름만 보지 말고 **오늘을 넘겨받는지**까지 본다 —
     세션 없이 부르면 통로는 영영 첫날만 연다(수학 미리보기도 같은 통로를 탄다). */
  T(/previewLinks\(r, c, todaySess\(\)\)/.test(thtml), '배너가 previewLinks 에 오늘 몫을 안 넘김');
  T(/function previewLinks\(r, c, sess\)/.test(thtml), '교사 화면 previewLinks 시그니처가 바뀜');

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

    /* ── ⑤ c키 → 진도일 · 「오늘」의 자격 ───────────────────────────
       ★교사 통로 표(PREVIEW.math)에 `key:true` 가 붙었다. 그 줄은 「이 화면이 c키를 실제로 읽는다」는
       약속이라, 약속이 화면 쪽에서 실재하는지 여기서 굴려 본다 — 표만 앞서 가면 그날로 첫날이 열린다
       (한자가 넉 달 겪은 결함). fromUrl·onToday·dayW 를 본문에서 떼어 그대로 평가한다. */
    T(/PREVIEW = \{[\s\S]*?math\s*:\s*\{[^}]*key\s*:\s*true/.test(thtml), '교사 통로 표에서 수학이 c키를 안 문다(key:true 없음)');
    var fu = mhtml.match(/function fromUrl\(\)\{[\s\S]*?\n  \}/);
    var ot = mhtml.match(/function onToday\(\)\{[^\n]*\}/), dw = mhtml.match(/function dayW\(\)\{[^\n]*\}/);
    T(!!fu && !!ot && !!dw, 'math.html 에서 fromUrl/onToday/dayW 를 못 찾음 — 이름이 다르면 다음 사람이 한쪽만 고친다');
    if (fu && ot && dw) {
      function run(search) {
        var d2 = new JSDOM('<body></body>', { runScripts: 'outside-only', url: 'https://x.test/morning/math.html' + search });
        d2.window.eval(fu[0] + '; var st = fromUrl(); ' + ot[0] + ';' + dw[0] + '; this.__r = { st: st, on: onToday(), w: dayW() };');
        return d2.window.__r;
      }
      var a = run('?key=g3_math_c015');
      T(a.st.grade === 3 && a.st.day === 15 && a.st.today === 15 && a.on === true && a.w === '오늘',
        'c키 통로가 진도일을 못 읽음: ' + JSON.stringify(a.st));
      var b = run('?key=g3_math_c015&day=3');
      T(b.st.day === 3 && b.st.today === 15 && b.on === false && b.w === '이 날',
        'c키+day 로 옆 차시를 보면 「오늘이 며칠째인지」를 잃음(↩ 통로가 성립 안 함): ' + JSON.stringify(b.st));
      var c = run('?grade=4&day=7');
      T(c.st.grade === 4 && c.st.day === 7 && c.st.today === null && c.on === false,
        '`?grade&day` 통로가 오늘을 안다고 우김: ' + JSON.stringify(c.st));
      var e = run('?key=g9_math_c015');
      T(e.st.today === null, '학년 범위 밖 c키가 오늘을 내줌');
      var f = run('?key=g3_hanja_c015');
      T(f.st.today === null, '남의 과목 c키(한자)를 수학 진도로 읽음');
    }
    /* 「오늘」의 자격 — (a) 화면이 자기 말을 하는 자리 정면 대조. 수학은 원장 문장이 안 실리는 화면이라
       정적 마크업엔 「오늘」이 한 번도 없어야 하고, 스크립트 안의 「오늘」은 전부 onToday() 뒤에 서야 한다.
       (본문 전체 정규식 훑기가 아니라 줄 단위 — 주석 줄은 제외.) */
    var body = mhtml.replace(/<script>[\s\S]*?<\/script>/g, '')
                    .replace(/<button[^>]*id="back"[^>]*>[^<]*<\/button>/, '');   // ↩ 칩은 today 를 알 때만 보인다(아래서 따로 본다)
    T(/오늘/.test(body) === false, '정적 마크업이 자격 없이 「오늘」이라 말함(제목·머리·안내문)');
    T(/<button[^>]*id="back"[^>]*display:none/.test(mhtml), '↩ 칩이 처음부터 보인다 — `?grade=` 로 열어도 「오늘」이 뜬다');
    T(/<title>[^<]*오늘/.test(mhtml) === false, '<title> 이 「오늘」을 말함 — `?grade=` 로 열려도 그 제목이 뜬다');
    var js = (mhtml.match(/<script>([\s\S]*?)<\/script>/) || ['', ''])[1]
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/mg, '');          // 주석은 말이 아니다
    var bad = js.split('\n').filter(function (l) {
      return /오늘/.test(l) && !/onToday\(\)/.test(l) && !/st\.today/.test(l);
    });
    T(bad.length === 0, '스크립트가 onToday() 근거 없이 「오늘」을 씀: ' + bad.map(function (l) { return l.trim(); }).join(' | '));
    T(/오늘 차시로 ↩/.test(mhtml), '오늘 몫을 벗어났을 때 돌아올 ↩ 통로가 없음 — 정직해지면서 정보가 줄었다');
    T(/st\.today = null;\s*loadGrade/.test(mhtml), '학년을 바꿔도 진도일을 버리지 않음 — 다른 학년의 차시를 오늘이라 부른다');
  }
})();

Promise.all(jobs).then(function () {
  console.log('\n아침수학 화면 배선 — ' + pass + ' PASS / ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
})['catch'](function (e) {
  console.log('예외: ' + e.message);
  process.exit(1);
});
