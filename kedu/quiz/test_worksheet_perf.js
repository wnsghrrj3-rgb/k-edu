/* =============================================================
 * test_worksheet_perf.js — 케이학습지 ③ 수행평가 W4 (jsdom)
 *   ① 시드 변환기: 카드 7건이 규격(조건 3·루브릭 3×3·anchor 3·관찰 3·라벨에 평가 낱말 없음)대로 SQL 이 되는가
 *   ② perf.html: 과제문·조건 체크·글 3줄 상한·제출 upsert(run,student,checks) · 제출 뒤 「보냈어요」 · 공개 뒤 수준 라벨 · 마감 · 미리보기 무기록
 *   ③ build.html 수행평가 탭: 과제 카드 → 우리 반에 열기 = performance_runs + open_for_class(perf:, 라벨 = student_label)
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_worksheet_perf.js [화면폴더]
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process');
var { JSDOM } = require('jsdom');
var ROOT = path.join(__dirname, '..', '..');
var DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'kedu', 'worksheet');
var fail = 0, pass = 0;
function T(c, m) { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } }

/* ── ① 시드 ── */
var seed = fs.readFileSync(path.join(ROOT, 'sql', 'seed_perf_g1_math_u1.sql'), 'utf8');
var ins = seed.match(/INSERT INTO performance_tasks/g) || [];
T(ins.length === 7, '시드 과제 수가 7이 아님: ' + ins.length);
T(/ON CONFLICT \(code\) DO UPDATE/.test(seed), '시드가 재실행 안전(UPSERT)이 아님');
T(!/\*\*/.test(seed), '시드에 마크다운 굵게(**) 흔적이 남음');
T(/'photo'/.test(seed) && /'text'/.test(seed), '산출물 종류가 사진·글 둘로 갈리지 않음(§8-③)');
['평가', '시험', '채점'].forEach(function (w) {
  var labels = seed.match(/'[^']*',\s*'[^']*',\s*'[^']*',\s*'u1',\s*'[^']*',\s*'[^']*',\s*('[^']*')/g) || [];
  T(labels.every(function (l) { return l.split(',').pop().indexOf(w) < 0; }), '학생 라벨에 「' + w + '」 낱말이 들어감');
});
var v4 = fs.readFileSync(path.join(ROOT, 'sql', 'setup_worksheet_v4.sql'), 'utf8');
['performance_tasks', 'performance_runs', 'performance_submissions', 'performance_results'].forEach(function (t) { T(new RegExp('CREATE TABLE IF NOT EXISTS ' + t).test(v4), 'v4 에 ' + t + ' 표가 없음'); T(new RegExp('ALTER TABLE ' + t + '\\s+ENABLE ROW LEVEL SECURITY').test(v4), t + ' RLS 미설정'); });
T(/INSERT INTO storage\.buckets[^;]*'perf'[^;]*false/.test(v4), 'perf 버킷이 없거나 public 임');
T(/CREATE OR REPLACE FUNCTION get_perf_run/.test(v4) && /v_class <> v_run\.class_code_id/.test(v4), 'get_perf_run 이 없거나 남의 반 학생을 안 막음');
T(/CHECK \(kind IN \('photo','text'\)\)/.test(v4), '제출 종류가 사진·글로 제한되지 않음(§8-③)');
T(/r\.closed_at IS NULL/.test(v4), '마감된 run 에 제출이 가능함(RLS WITH CHECK)');

/* ── ② perf.html ── */
var html = fs.readFileSync(path.join(DIR, 'perf.html'), 'utf8');
var inline = (html.match(/<script>\s*([\s\S]*?)\s*<\/script>/g) || []).pop().replace(/^<script>\s*|\s*<\/script>$/g, '');
var TASK = { title: '우리 교실 수 찾기', student_label: '교실 탐험 — 수를 찾아라!', task_text: '교실에서 개수가 다른 물건을 찾아보세요.', conditions: ['3가지 이상 찾기', '숫자로 쓰고 말로 읽기', '가장 많은 것 말하기'], product_kind: 'text', area: '조사·탐구',
  rubric: { criteria: [{ name: '수 세기 정확성', levels: [{ label: '잘함', desc: '' }, { label: '보통', desc: '' }, { label: '노력 요함', desc: '' }] }] } };
function boot(search, data, hooks) {
  var dom = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, ''), { runScripts: 'outside-only', url: 'https://x.test/kedu/worksheet/perf.html' + search, pretendToBeVisual: true });
  var w = dom.window; var calls = { upserts: [] };
  w.getKeduDb = function () { return {
    rpc: function () { return Promise.resolve({ data: JSON.parse(JSON.stringify(data)), error: null }); },   // 화면이 응답을 고쳐 써도 다음 부팅에 안 새게
    from: function (t) { return { upsert: function (row, opt) { calls.upserts.push({ table: t, row: row, opt: opt }); return Promise.resolve({ error: null }); } }; },
    storage: { from: function () { return { upload: function () { return Promise.resolve({ error: null }); } }; } }
  }; };
  w.speechSynthesis = { cancel: function () {}, speak: function () {} }; w.SpeechSynthesisUtterance = function () {};
  w.alert = function () {};
  try { w.eval(inline); } catch (e) { T(false, 'perf.html 실행 예외: ' + e.message); }
  return new Promise(function (r) { setTimeout(function () { r({ w: w, calls: calls }); }, 60); });
}
function click(w, sel) { var el = w.document.querySelector(sel); if (!el) { T(false, '요소 없음: ' + sel); return; } el.dispatchEvent(new w.Event('click', { bubbles: true })); }
var base = { run: 'r1', class_code_id: 'c1', closed: false, student_id: 'S1', is_teacher: false, task: TASK, my: { submitted: false }, result: null };
boot('?run=r1', base).then(function (o) {
  var d = o.w.document, w = o.w;
  T(/교실 탐험/.test(d.getElementById('ttl').textContent) && /개수가 다른 물건/.test(d.getElementById('task').textContent), '과제 라벨·과제문이 안 뜸');
  T(d.querySelectorAll('.checks input').length === 3, '조건 체크리스트 3개가 아님');
  T(!!d.getElementById('tts'), '읽어주기 단추가 없음');
  T(!/평가|채점/.test(d.body.textContent), '학생 화면에 평가·채점 낱말이 보임');
  var ta = d.getElementById('ta'), send = d.getElementById('send');
  T(!!ta && send.disabled, '글 칸이 없거나 빈 채로 보내기가 열려 있음');
  ta.value = '하나\n둘\n셋\n넷'; ta.dispatchEvent(new w.Event('input', { bubbles: true }));
  T(ta.value.split('\n').length === 3, '글이 3줄 상한을 넘김(저학년 상한): ' + JSON.stringify(ta.value));
  T(!send.disabled, '글을 썼는데 보내기가 안 열림');
  d.getElementById('c0').checked = true; d.getElementById('c0').dispatchEvent(new w.Event('change', { bubbles: true }));
  click(w, '#send');
  return new Promise(function (r) { setTimeout(function () { r(o); }, 60); });
}).then(function (o) {
  var up = o.calls.upserts[0];
  T(!!up && up.table === 'performance_submissions' && up.row.run_id === 'r1' && up.row.student_id === 'S1' && up.row.kind === 'text' && /하나/.test(up.row.payload.text) && up.row.checks[0] === true && up.row.checks[1] === false,
    '제출 upsert 행이 다름: ' + JSON.stringify(up && up.row));
  T(!!up && up.opt && /run_id,student_id/.test(up.opt.onConflict), '다시 보내면 갱신되는 키(run,student)가 아님');
  T(/선생님께 보냈어요/.test(o.w.document.body.textContent) && /확인 중/.test(o.w.document.body.textContent), '제출 뒤 「보냈어요·확인 중」이 안 뜸');
  /* 공개 뒤 */
  return boot('?run=r1', Object.assign({}, base, { my: { submitted_at: '2026-09-07T00:00:00Z' }, result: { levels: { '0': 1 }, memo: '잘 찾았어요' } }));
}).then(function (o) {
  var t = o.w.document.body.textContent;
  T(/보통/.test(t) && /잘 찾았어요/.test(t) && !/\d+점/.test(t), '공개 뒤 수준 라벨·한마디가 없거나 점수 숫자가 보임');
  /* 마감 */
  return boot('?run=r1', Object.assign({}, base, { closed: true }));
}).then(function (o) {
  T(/마감됐어요/.test(o.w.document.body.textContent) && !o.w.document.getElementById('send'), '마감된 과제에 보내기가 열려 있음');
  /* 미리보기 = 기록 0 */
  return boot('?run=r1&preview=1', Object.assign({}, base, { student_id: 'S1', is_teacher: true }));   // 프로필이 있어도 preview 면 기록 0 이어야 한다
}).then(function (o) {
  var d = o.w.document, w = o.w;
  T(/선생님 미리보기/.test(d.body.textContent), '미리보기 띠가 없음 — 조용히 다르게 도는 화면');
  var ta = d.getElementById('ta'); ta.value = '미리'; ta.dispatchEvent(new w.Event('input', { bubbles: true })); click(w, '#send');
  return new Promise(function (r) { setTimeout(function () { r(o); }, 40); });
}).then(function (o) {
  T(o.calls.upserts.length === 0, '미리보기인데 제출이 기록됨');
  T(/기록에 남지 않았어요/.test(o.w.document.body.textContent), '미리보기 보내기 뒤 안내가 없음');
  /* ── ③ build.html 수행평가 탭 ── */
  var b = fs.readFileSync(path.join(DIR, 'build.html'), 'utf8');
  T(/function renderPerf\(/.test(b) && /function openPerf\(/.test(b) && /function renderPerfRuns\(/.test(b), 'build.html 에 수행평가 탭 함수가 없음');
  T(/from\('performance_runs'\)\.insert\(\{ task_id: taskId, class_code_id: classId, teacher_id: ME\.id \}\)/.test(b), '우리 반에 열기가 performance_runs 를 안 만듦');
  T(/p_content_key: 'perf:' \+ run\.id, p_title: t\.student_label, p_kind: 'perf', p_url: '\/kedu\/worksheet\/perf\.html\?run=' \+ run\.id/.test(b), '케이박스 카드 키·라벨·주소가 설계(§4-2)와 다름');
  T(/얼굴이 나오지 않게/.test(b) && /얼굴이 나오지 않게/.test(html), '얼굴 사진 금지 안내가 교사·학생 화면에 없음');
  T(/renderSoon\('grade'\)/.test(b) && /W5/.test(b), '채점 그리드가 아직 없다는 것을 말하지 않음(있는 척 금지)');
  console.log('\n케이학습지 수행평가 W4 — ' + pass + ' PASS / ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
}).catch(function (e) { console.log('예외: ' + e.stack); process.exit(1); });
