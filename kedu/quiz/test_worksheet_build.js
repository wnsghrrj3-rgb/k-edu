/* =============================================================
 * test_worksheet_build.js — 케이학습지 build.html W1 (3종 탭 골격 + ① 라벨·기본값), jsdom
 *   ① 상위 탭 3종(차시 쪽지·단원 평가·수행평가)이 실재하고, ②③은 「준비 중」을 정직하게 말하는가
 *   ② 차시 쪽지 = 기본 5문항 · 차시 선택 → 개념 자동 · 저장 이름 기본값 · 학생 카드 라벨 「오늘 확인 · 」
 *   ③ 옛 진입(?tab=mine)이 그대로 사는가
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_worksheet_build.js [화면폴더]
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var { JSDOM } = require('jsdom');
var ROOT = path.join(__dirname, '..', '..');
var DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'kedu', 'worksheet');
var html = fs.readFileSync(path.join(DIR, 'build.html'), 'utf8');
var fail = 0, pass = 0;
function T(c, m) { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } }

/* ── 정적: 구조 ── */
T(/id="topTabs"/.test(html) && /data-top="quiz"/.test(html) && /data-top="unit"/.test(html) && /data-top="perf"/.test(html), '상위 탭 3종이 없음');
T(/>차시 쪽지<\/button>/.test(html) && />단원 평가<\/button>/.test(html) && />수행평가<\/button>/.test(html), '상위 탭 이름이 설계 §5 와 다름');
T(/id="subTabs"/.test(html) && /data-tab="build"/.test(html) && /data-tab="mine"/.test(html), '① 하위 탭(조립·내 쪽지)이 사라짐');
T(/<h1>케이학습지<\/h1>/.test(html), '머리가 「케이학습지」가 아님(트랙 명명 2026-08-29)');
/* ① 기본값 */
T(/n === 5 \? ' selected'/.test(html), '빠른 조립 기본이 5문항이 아님(§2)');
T(/id="qaLesson"/.test(html) && /qaLesson'\)\.onchange/.test(html), '차시 고르기 → 개념 자동 선택이 없음(§2)');
/* 카드 라벨 — 평가 단어 없이 */
T(/CARD_LABEL = \{ quiz: '오늘 확인', unit_test: '단원 정리' \}/.test(html), '학생 카드 라벨 사전이 설계(§2·§3-2)와 다름');
T(/p_title: \(CARD_LABEL\[s\.kind\] \|\| CARD_LABEL\.quiz\) \+ ' · ' \+ s\.title/.test(html), '우리 반에 열기가 카드 라벨 접두를 안 붙임');
T(/평가 · /.test(html.replace(/<!--[\s\S]*?-->/g, '').match(/CARD_LABEL = [^\n]*/)[0]) === false, '학생 카드 라벨에 「평가」 낱말이 들어감(라벨 규약 위반)');
/* 저장 이름 기본값 */
T(/\|\| \(c0 \? \(c0\.lesson_no \? c0\.lesson_no \+ '차시 · ' : ''\) \+ c0\.name : '쪽지'\)/.test(html), '빈 제목의 기본값이 「N차시 · 개념」이 아님');
/* ②③ 준비 중 문구 — 있는 척 금지 */
var soon = (html.match(/function renderSoon[\s\S]*?\n\}/) || [''])[0];
T(!/grade:/.test(soon) && !/teacher_task:/.test(soon) && !/unit:/.test(soon) && !/perf:/.test(soon), 'W1~W6 이 구현됐는데 준비 중 항목이 남아 있음(구현된 것에 준비 중 문구 금지)');
T(/unit:/.test(soon) === false && /perf:/.test(soon) === false, '②③이 구현됐는데 준비 중 문구가 남아 있음');

/* ── 동작: 가짜 DB 로 조립 화면까지 띄운다 (원장 2개념·문항 16개·학급 1) ── */
var BANK = [];
[['C1', 1], ['C2', 2]].forEach(function (c) {
  for (var i = 1; i <= 8; i++) BANK.push({ id: c[0] + i, qcode: c[0] + i, grade: 1, subject: 'math', unit_code: 'u1', lesson_code: 'l0' + c[1],
    concept_code: c[0], difficulty: ((i - 1) % 4) + 1, qkind: ['mc', 'sa', 'ox', 'blank', 'mc', 'sa', 'ox', 'blank'][i - 1], stem: '문항 ' + c[0] + i, misconception_codes: [], source_kind: 'kedu' });
});
var CONCEPTS = [{ code: 'C1', name: '수 세기', lesson_no: 1, unit_code: 'u1', grade: 1 }, { code: 'C2', name: '수 비교', lesson_no: 2, unit_code: 'u1', grade: 1 }];
/* 단원 종합 A·B 형(unit_review) 각 6문항 — 동형 검사지 전환용. 개념 C1·C2 교대, 난이도 1..4 순환 */
['a', 'b'].forEach(function (f) {
  for (var i = 1; i <= 6; i++) BANK.push({ id: 'R' + f + i, qcode: 'g1_math_u1_review_' + f + '#' + i, grade: 1, subject: 'math', unit_code: 'u1', lesson_code: null,
    concept_code: i % 2 ? 'C1' : 'C2', difficulty: ((i - 1) % 4) + 1, qkind: i === 6 ? 'essay' : 'mc', stem: '종합 ' + f + i, misconception_codes: [], source_kind: 'unit_review', source_set: 'g1_math_u1_review_' + f });
});
var INSERTS = [], RPCS = [];                             // 저장·RPC 로 무엇을 보내는지 본다
/* W3 결과 화면 재료: 단원 평가 세트 1(문항 Ra1·Ra2·Ra6, 배점 1) · 학생 2 · 마지막 답 행 */
var SETS = [{ id: 'set1', title: '1단원 정리', kind: 'unit_test', grade: 1, subject: 'math', unit_code: 'u1', created_at: '2026-09-07T00:00:00Z', show_result: 'after_close', result_opened_at: null, closed_at: null, time_min: 20, quiz_set_items: [{ count: 3 }] }];
var ITEMS = [{ ord: 1, points: 1, question_id: 'Ra1' }, { ord: 2, points: 1, question_id: 'Ra2' }, { ord: 3, points: 1, question_id: 'Ra6' }];
var STUDENTS = [{ id: 'S1', nickname: '가람', seat_no: 1, class_code_id: 'c1' }, { id: 'S2', nickname: '나래', seat_no: 2, class_code_id: 'c1' }];
var MATRIX = [
  { quiz_set_id: 'set1', student_id: 'S1', question_bank_id: 'Ra1', score_id: 'sc1', is_correct: true,  score: 1, max_score: 1, concept_code: 'C1', source: 'online', ord: 1, points: 1 },
  { quiz_set_id: 'set1', student_id: 'S1', question_bank_id: 'Ra2', score_id: 'sc2', is_correct: true,  score: 1, max_score: 1, concept_code: 'C2', source: 'online', ord: 2, points: 1 },
  { quiz_set_id: 'set1', student_id: 'S1', question_bank_id: 'Ra6', score_id: 'sc3', is_correct: null,  score: 0, max_score: 1, concept_code: 'C2', source: 'online', answer_text: '둘 더하기 셋은 다섯', ord: 3, points: 1 },
  { quiz_set_id: 'set1', student_id: 'S2', question_bank_id: 'Ra1', score_id: 'sc4', is_correct: false, score: 0, max_score: 1, concept_code: 'C1', misconception_code: 'M01', source: 'online', ord: 1, points: 1 },
  { quiz_set_id: 'set1', student_id: 'S2', question_bank_id: 'Ra2', score_id: 'sc5', is_correct: false, score: 0, max_score: 1, concept_code: 'C2', source: 'online', ord: 2, points: 1 }
];
function fakeDb() {
  function q(table, data) { var o = { then: function (r) { return Promise.resolve({ data: data, error: null }).then(r); } };
    ['select', 'eq', 'order', 'limit', 'in'].forEach(function (m) { o[m] = function () { return o; }; });
    var lastRow = null;
    o.insert = function (row) { INSERTS.push({ table: table, row: row }); lastRow = row; return o; };
    o.maybeSingle = function () { return Promise.resolve({ data: { id: 't1', name: '준호' } }); };
    o.single = function () { return Promise.resolve({ data: (table === 'question_bank' || table === 'performance_tasks') && lastRow ? Object.assign({ id: 'new_' + table }, lastRow) : { id: 'newset' }, error: null }); };
    return o; }
  var TABLES = { question_bank: BANK, concepts: CONCEPTS, class_codes: [{ id: 'c1', code: 'ABC', is_active: true }], quiz_sets: SETS,
    class_openings: [{ class_code_id: 'c1', content_key: 'quiz:set1' }], student_profiles: STUDENTS, quiz_set_items: ITEMS, quiz_set_matrix: MATRIX };
  return {
    auth: { getSession: function () { return Promise.resolve({ data: { session: { user: { id: 'u1' } } } }); } },
    from: function (t) { return q(t, TABLES[t] || []); },
    rpc: function (name, args) { RPCS.push({ name: name, args: args }); return Promise.resolve({ data: name === 'quiz_paper_input' ? 3 : true, error: null }); }
  };
}
var dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://x.test/kedu/worksheet/build.html' });
var w = dom.window;
w.getKeduDb = fakeDb;
var inline = (html.match(/<script>\s*([\s\S]*?)\s*<\/script>/) || ['', ''])[1];
try { w.eval(inline); } catch (e) { T(false, '인라인 스크립트 실행 예외: ' + e.message); }
var ran = new Promise(function (r) { setTimeout(r, 60); });
ran.then(function () {
  var d = w.document;
  function click(sel) { var el = d.querySelector(sel); if (!el) { T(false, '요소 없음: ' + sel); return; } el.dispatchEvent(new w.Event('click', { bubbles: true })); }
  /* ① 조립 화면이 실제로 섰는가 + 기본값·차시→개념 자동 */
  T(!!d.getElementById('qaN') && d.getElementById('qaN').value === '5', '조립 화면의 빠른 조립 기본이 5문항이 아님(실구동): ' + (d.getElementById('qaN') || {}).value);
  var ql = d.getElementById('qaLesson'), qc = d.getElementById('qaConcept');
  T(!!ql && !!qc, '차시 고르기/개념 선택 요소가 없음');
  if (ql && qc) {
    qc.value = 'C1';
    ql.value = '2'; ql.dispatchEvent(new w.Event('change', { bubbles: true }));
    T(qc.value === 'C2', '차시 2 를 골랐는데 개념이 2차시 것으로 안 바뀜: ' + qc.value);
    ql.value = '1'; ql.dispatchEvent(new w.Event('change', { bubbles: true }));
    T(qc.value === 'C1', '차시 1 로 되돌렸는데 개념이 안 따라옴');
    /* ── W6 자작 문항: 개념 태그 없이는 저장 불가 → 태그 넣으면 question_bank 에 source='teacher' 로 ── */
    click('#mkOpen');
    T(!!d.getElementById('mkConcept') && !!d.getElementById('mkStem'), '내 문항 만들기 폼이 안 열림');
    d.getElementById('mkStem').value = '사과 세 개와 두 개를 더하면?';
    d.getElementById('mkExp1').value = '하나씩 이어 세요';
    d.querySelector('[data-mko="0"]').value = '5'; d.querySelector('[data-mko="1"]').value = '4'; d.querySelector('[data-mko="2"]').value = '6';
    INSERTS.length = 0;
    click('#mkSave');
    T(INSERTS.length === 0 && /개념 태그/.test(d.getElementById('mkMsg').textContent), '개념 태그 없이 문항이 저장됨(§8-⑤)');
    d.getElementById('mkConcept').value = 'C1';
    click('#mkSave');
    return new Promise(function (r) { setTimeout(r, 40); }).then(function () {
      var qi = INSERTS.find(function (x) { return x.table === 'question_bank'; });
      T(!!qi && qi.row.source === 'teacher' && qi.row.teacher_id === 't1' && qi.row.concept_code === 'C1' && qi.row.qkind === 'mc' && /^t_/.test(qi.row.qcode), '자작 문항 행이 설계와 다름: ' + JSON.stringify(qi && qi.row).slice(0, 200));
      T(!!qi && qi.row.payload && qi.row.payload.options.length === 3 && qi.row.payload.options[0].correct === true && qi.row.payload.explanation[0] === '하나씩 이어 세요', '자작 문항 payload 가 원장 문항 모양이 아님(play.html 이 못 그린다)');
      T(!!d.querySelector('#qlist .badge.mine') || /내 문항/.test(d.getElementById('qlist').textContent), '저장한 내 문항이 원장 목록에 안 뜨거나 배지가 없음');
      T(d.getElementById('mkCount').textContent === '1개', '내 문항 수가 갱신되지 않음');
    });
  }
}).then(function () {
  var d = w.document;
  function click(sel) { var el = d.querySelector(sel); if (!el) { T(false, '요소 없음: ' + sel); return; } el.dispatchEvent(new w.Event('click', { bubbles: true })); }
  {
    /* 배합대로 담기 = 5문항 */
    click('#qaGo');
    var cartN = d.getElementById('cart') ? d.getElementById('cart').children.length : -1;
    T(cartN === 5, '빠른 조립 기본으로 담은 문항이 5개가 아님: ' + cartN);
  }
  /* ── ② 단원 평가 (W2) ── */
  click('#topTabs [data-top="unit"]');
  T(!!d.getElementById('uGo') && !!d.getElementById('uFormGo'), '「단원 평가」 탭에 추천안·동형 검사지 버튼이 없음');
  T(d.getElementById('subTabs').style.display === '' && d.querySelector('#subTabs [data-tab="mine"]').textContent === '내 단원 평가', '②의 하위 탭 이름이 「내 단원 평가」가 아님');
  T(d.getElementById('uN').value === '15' && d.getElementById('uMin').value === '20', '1학년 기본이 15문항·20분이 아님(§8-①): ' + d.getElementById('uN').value + '/' + d.getElementById('uMin').value);
  T(d.getElementById('uShow').value === 'after_close', '단원 평가 공개 기본이 「마감 후」가 아님(§8-②)');
  /* 추천안 = 문항 수 정확 · 난이도 8:8:6:3 배분 · 개념 균배 */
  d.getElementById('uN').value = '10';
  click('#uGo');
  var rows = d.querySelectorAll('#ulist li');
  T(rows.length === 10, '추천안이 고른 문항 수가 요청과 다름: ' + rows.length);
  var mixt = d.getElementById('uMixtext').textContent;
  T(/D1 3 · D2 4 · D3 2 · D4 1/.test(mixt) || /D1 3 · D2 3 · D3 3 · D4 1/.test(mixt), '추천안 난이도 배분이 8:8:6:3 을 안 따름: ' + mixt);
  T(/개념 2개/.test(mixt), '추천안이 개념을 균배하지 않음(한 개념만 뽑음): ' + mixt);
  /* 편집: 삭제·순서·배점·교체 */
  var stemOf = function (li) { return li.children[1].textContent; };
  var firstStem = stemOf(rows[0]);
  click('#ulist [data-dn="0"]');
  T(stemOf(d.querySelectorAll('#ulist li')[1]) === firstStem, '순서 ↓ 가 동작하지 않음');
  click('#ulist [data-rm="9"]');
  T(d.querySelectorAll('#ulist li').length === 9, '삭제가 동작하지 않음');
  var before = stemOf(d.querySelectorAll('#ulist li')[0]);
  click('#ulist [data-sw="0"]');
  T(stemOf(d.querySelectorAll('#ulist li')[0]) !== before, '교체가 다른 문항으로 바꾸지 않음');
  var ptBefore = Number((d.getElementById('uMixtext').textContent.match(/(\d+)점/) || [0, 0])[1]);
  var pt = d.querySelector('#ulist [data-pt="0"]'); var ptOld = Number(pt.value); pt.value = String(ptOld + 2); pt.dispatchEvent(new w.Event('change', { bubbles: true }));
  T(new RegExp('9문항 · ' + (ptBefore + 2) + '점').test(d.getElementById('uMixtext').textContent), '배점 변경이 합계에 반영되지 않음: ' + d.getElementById('uMixtext').textContent);
  /* 동형 검사지 전환 = 그 형 문항 그대로, 서술은 3점 */
  T(d.getElementById('uForm').options.length === 2 && /A형/.test(d.getElementById('uForm').options[0].textContent), '동형 검사지 목록(A·B형)이 안 뜸');
  d.getElementById('uForm').value = 'g1_math_u1_review_b';
  click('#uFormGo');
  rows = d.querySelectorAll('#ulist li');
  T(rows.length === 6 && /종합 b1/.test(rows[0].textContent) && /종합 b6/.test(rows[5].textContent), 'B형 전환이 그 형 문항을 순서대로 담지 않음');
  T(d.querySelector('#ulist [data-pt="5"]').value === '3', '서술형 기본 배점이 3점이 아님');
  /* 저장 = unit_test · after_close · 배점 동봉 */
  d.getElementById('uTitle').value = '1단원 정리';
  click('#uSave');
  return new Promise(function (r) { setTimeout(r, 30); }).then(function () {
    var setIns = INSERTS.find(function (x) { return x.table === 'quiz_sets'; }), itemIns = INSERTS.find(function (x) { return x.table === 'quiz_set_items'; });
    T(!!setIns && setIns.row.kind === 'unit_test' && setIns.row.show_result === 'after_close' && setIns.row.time_min === 20 && setIns.row.title === '1단원 정리',
      '단원 평가 저장 행이 설계와 다름: ' + JSON.stringify(setIns && setIns.row));
    T(!!itemIns && itemIns.row.length === 6 && itemIns.row[5].points === 3 && itemIns.row[0].ord === 1, '문항 행에 배점·순서가 안 실림: ' + JSON.stringify(itemIns && itemIns.row.slice(0, 2)));
    T(d.querySelector('#subTabs [data-tab="mine"]').classList.contains('on'), '저장 뒤 「내 단원 평가」 탭으로 안 넘어감');
    return new Promise(function (r) { setTimeout(function () { r(d); }, 40); });
  });
}).then(function (d) {
  function click(sel) { var el = d.querySelector(sel); if (!el) { T(false, '요소 없음: ' + sel); return; } el.dispatchEvent(new w.Event('click', { bubbles: true })); }
  /* ── ③ 결과 화면 (W3) — 내 단원 평가 목록 → 결과 보기 ── */
  T(!!d.querySelector('[data-res="set1"]') && !!d.querySelector('[data-paper="set1"]') && !!d.querySelector('[data-reveal="set1"]') && !!d.querySelector('[data-close="set1"]'),
    '내 단원 평가 행에 결과·종이·결과 열기·마감 단추가 다 있지 않음');
  click('[data-res="set1"]');
  return new Promise(function (r) { setTimeout(function () { r(d); }, 80); }).then(function () {
    var box = d.getElementById('res-set1'); var t = box.textContent;
    /* 학급 표: 번호순, ○×?, 점수, 도달 */
    var trs = box.querySelectorAll('table.grid tr');
    T(/학급 표/.test(t) && trs.length >= 3, '학급 표가 안 그려짐');
    var r1 = box.querySelector('table.grid tr:nth-child(2)'), r2 = box.querySelector('table.grid tr:nth-child(3)');
    T(r1 && /가람/.test(r1.textContent) && /○/.test(r1.textContent) && !!r1.querySelector('td.p') && !/×/.test(r1.textContent), '1번 학생 행에 ○·채점 전(?) 칸이 없거나 채점 전을 ×로 표시함: ' + (r1 && r1.textContent));
    T(r1 && /거의/.test(r1.textContent), '2/3 = 67% 인데 「거의」가 아님: ' + (r1 && r1.textContent));
    T(r2 && /나래/.test(r2.textContent) && /×/.test(r2.textContent) && /미도달/.test(r2.textContent) && /·/.test(r2.textContent), '2번 학생 행(×·미제출 문항 ··미도달)이 다름: ' + (r2 && r2.textContent));
    /* 히트맵 */
    var heat = box.querySelector('table.heat');
    T(!!heat && /수 세기/.test(heat.textContent) && /수 비교/.test(heat.textContent), '개념 히트맵에 개념 이름이 없음');
    T(!!heat && heat.querySelectorAll('td.h3').length >= 1 && heat.querySelectorAll('td.h1').length >= 1, '히트맵 색 등급(도달·미도달)이 안 칠해짐');
    /* 막힌 개념 + 보완 쪽지 = 미도달 학생만 */
    var wk = box.querySelector('[data-remed="C1"]');
    T(!!wk && /1명에게만/.test(wk.textContent), '보완 쪽지 단추가 미도달 학생 수(1명)를 말하지 않음: ' + (wk && wk.textContent));
    INSERTS.length = 0; RPCS.length = 0;
    click('[data-remed="C1"]');
    return new Promise(function (r) { setTimeout(r, 60); }).then(function () {
      var qs = INSERTS.find(function (x) { return x.table === 'quiz_sets'; });
      T(!!qs && qs.row.kind === 'quiz' && Array.isArray(qs.row.target_student_ids) && qs.row.target_student_ids.length === 1 && qs.row.target_student_ids[0] === 'S2',
        '보완 쪽지가 미도달 학생(S2)에게만 배정되지 않음(§8-④ 준호 결정): ' + JSON.stringify(qs && qs.row));
      T(!!qs && /한 번 더/.test(qs.row.title) && qs.row.show_result === 'immediate', '보완 쪽지 제목·즉시 공개가 아님');
      var op = RPCS.find(function (x) { return x.name === 'open_for_class'; });
      T(!!op && op.args.p_class_code_id === 'c1' && /^quiz:/.test(op.args.p_content_key) && /오늘 확인 · 한 번 더/.test(op.args.p_title), '보완 쪽지를 열린 반에 안 열거나 카드 라벨이 다름: ' + JSON.stringify(op && op.args));
      /* 종이 점수 — 2번 학생 1·2번 맞음으로 표시 → RPC payload */
      RPCS.length = 0;
      var tr2 = box.querySelector('tr[data-psid="S2"]');
      T(!!tr2, '종이 점수 격자에 2번 학생 행이 없음');
      if (tr2) {
        var c1 = tr2.querySelector('input[data-pq="Ra1"]'); c1.checked = true; c1.dispatchEvent(new w.Event('change', { bubbles: true }));
        var c2 = tr2.querySelector('input[data-pq="Ra2"]'); c2.checked = true; c2.dispatchEvent(new w.Event('change', { bubbles: true }));
        click('[data-psave="set1"]');
      }
      return new Promise(function (r) { setTimeout(r, 60); });
    }).then(function () {
      var pi = RPCS.find(function (x) { return x.name === 'quiz_paper_input'; });
      T(!!pi && pi.args.p_set_id === 'set1' && pi.args.p_rows.length === 1 && pi.args.p_rows[0].student_id === 'S2' && pi.args.p_rows[0].answers.Ra1 === true && pi.args.p_rows[0].answers.Ra6 === false,
        '종이 점수 payload 가 다름(표시한 학생만·문항별 ○×): ' + JSON.stringify(pi && pi.args));
      return new Promise(function (r) { setTimeout(r, 80); });
    }).then(function () {
      /* 서술 채점 — 다시 그려진 뒤 */
      var box2 = d.getElementById('res-set1');
      T(/서술형 채점/.test(box2.textContent) && /둘 더하기 셋은 다섯/.test(box2.textContent), '서술형 답 문장이 채점 칸에 안 보임');
      RPCS.length = 0;
      click('[data-essay="sc3"][data-pts="1"]');
      return new Promise(function (r) { setTimeout(r, 40); });
    }).then(function () {
      var ge = RPCS.find(function (x) { return x.name === 'quiz_grade_essay'; });
      T(!!ge && ge.args.p_score_id === 'sc3' && ge.args.p_points === 1, '서술 채점 RPC 가 안 나감: ' + JSON.stringify(ge && ge.args));
      return d;
    });
  });
}).then(function (d) {
  function click(sel) { var el = d.querySelector(sel); if (!el) { T(false, '요소 없음: ' + sel); return; } el.dispatchEvent(new w.Event('click', { bubbles: true })); }
  /* 내 목록 코드에 단원 평가 전용 통로(종이·결과 열기·마감)가 있는가 — 정적 */
  T(/data-paper=/.test(html) && /mode=paper&preview=1/.test(html), '내 단원 평가에 종이 문제지 통로가 없음(§3-2)');
  T(/quiz_set_open_result/.test(html) && /quiz_set_close/.test(html), '결과 열기·마감 RPC 호출이 없음');
  T(/s\.show_result !== 'immediate' && !s\.result_opened_at \? `<button[^`]*data-reveal/.test(html), '「결과 열기」가 닫힌 세트에만 뜨도록 조건이 안 걸림');
  click('#topTabs [data-top="perf"]');
  T(d.querySelector('#subTabs [data-tab="build"]').textContent === '과제 고르기' && d.querySelector('#subTabs [data-tab="mine"]').textContent === '연 과제', '③의 하위 탭 이름(과제 고르기·연 과제)이 아님');
  click('#topTabs [data-top="quiz"]');
  T(d.getElementById('subTabs').style.display === '', '①로 돌아왔는데 하위 탭이 안 돌아옴');
  T(d.querySelector('#topTabs [data-top="quiz"]').classList.contains('on'), '상위 탭 강조가 안 따라옴');
  /* ?tab=mine 진입 */
  var dom2 = new JSDOM(html, { runScripts: 'outside-only', url: 'https://x.test/kedu/worksheet/build.html?tab=mine' });
  dom2.window.getKeduDb = w.getKeduDb;
  try { dom2.window.eval(inline); } catch (e) { T(false, '?tab=mine 실행 예외: ' + e.message); }
  T(dom2.window.document.querySelector('#subTabs [data-tab="mine"]').classList.contains('on'), '?tab=mine 진입이 「내 쪽지」 탭을 안 켬(미리보기 돌아오기가 깨짐)');
  console.log('\n케이학습지 build W1~W6 — ' + pass + ' PASS / ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
});
