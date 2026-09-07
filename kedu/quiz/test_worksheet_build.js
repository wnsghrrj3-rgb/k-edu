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
T(/준비 중/.test(soon), '②③ 화면이 「준비 중」임을 말하지 않음');
T(/차시 쪽지」 탭/.test(soon), '단원 평가 준비 중 화면이 지금 대신 쓸 길(단원 종합 문항)을 안내하지 않음');

/* ── 동작: 가짜 DB 로 조립 화면까지 띄운다 (원장 2개념·문항 16개·학급 1) ── */
var BANK = [];
[['C1', 1], ['C2', 2]].forEach(function (c) {
  for (var i = 1; i <= 8; i++) BANK.push({ id: c[0] + i, qcode: c[0] + i, grade: 1, subject: 'math', unit_code: 'u1', lesson_code: 'l0' + c[1],
    concept_code: c[0], difficulty: ((i - 1) % 4) + 1, qkind: ['mc', 'sa', 'ox', 'blank', 'mc', 'sa', 'ox', 'blank'][i - 1], stem: '문항 ' + c[0] + i, misconception_codes: [], source_kind: 'kedu' });
});
var CONCEPTS = [{ code: 'C1', name: '수 세기', lesson_no: 1, unit_code: 'u1', grade: 1 }, { code: 'C2', name: '수 비교', lesson_no: 2, unit_code: 'u1', grade: 1 }];
function fakeDb() {
  function q(data) { var o = { then: function (r) { return Promise.resolve({ data: data, error: null }).then(r); } };
    ['select', 'eq', 'order', 'limit', 'in', 'insert'].forEach(function (m) { o[m] = function () { return o; }; });
    o.maybeSingle = function () { return Promise.resolve({ data: { id: 't1', name: '준호' } }); };
    o.single = function () { return Promise.resolve({ data: { id: 'set1' }, error: null }); };
    return o; }
  return {
    auth: { getSession: function () { return Promise.resolve({ data: { session: { user: { id: 'u1' } } } }); } },
    from: function (t) { return q(t === 'question_bank' ? BANK : t === 'concepts' ? CONCEPTS : t === 'class_codes' ? [{ id: 'c1', code: 'ABC', is_active: true }] : []); },
    rpc: function () { return Promise.resolve({ error: null }); }
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
    /* 배합대로 담기 = 5문항 */
    click('#qaGo');
    var cartN = d.getElementById('cart') ? d.getElementById('cart').children.length : -1;
    T(cartN === 5, '빠른 조립 기본으로 담은 문항이 5개가 아님: ' + cartN);
  }
  click('#topTabs [data-top="unit"]');
  T(/준비 중/.test(d.getElementById('view').textContent), '「단원 평가」 탭이 준비 중 화면을 안 그림');
  T(d.getElementById('subTabs').style.display === 'none', '②에서 ① 하위 탭이 그대로 보임');
  click('#topTabs [data-top="perf"]');
  T(/수행평가/.test(d.getElementById('view').textContent) && /준비 중/.test(d.getElementById('view').textContent), '「수행평가」 탭이 준비 중 화면을 안 그림');
  click('#topTabs [data-top="quiz"]');
  T(d.getElementById('subTabs').style.display === '', '①로 돌아왔는데 하위 탭이 안 돌아옴');
  T(d.querySelector('#topTabs [data-top="quiz"]').classList.contains('on'), '상위 탭 강조가 안 따라옴');
  /* ?tab=mine 진입 */
  var dom2 = new JSDOM(html, { runScripts: 'outside-only', url: 'https://x.test/kedu/worksheet/build.html?tab=mine' });
  dom2.window.getKeduDb = w.getKeduDb;
  try { dom2.window.eval(inline); } catch (e) { T(false, '?tab=mine 실행 예외: ' + e.message); }
  T(dom2.window.document.querySelector('#subTabs [data-tab="mine"]').classList.contains('on'), '?tab=mine 진입이 「내 쪽지」 탭을 안 켬(미리보기 돌아오기가 깨짐)');
  console.log('\n케이학습지 build W1 — ' + pass + ' PASS / ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
});
