/* test_boxbar.js — 어디서든 담기 바 jsdom 검증 (SPEC_BOXBAR §6)
 * 실행: node kedu_boxbar.test.js
 */
'use strict';
var JSDOM = require('/home/claude/node_modules/jsdom').JSDOM;
var fs = require('fs');
var fails = 0; function ok(c, m) { if (!c) { fails++; console.log('  ✗ ' + m); } }

function fresh(pathname, cache) {
  var dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'https://keduclass.com' + (pathname || '/') });
  var win = dom.window;
  if (cache) win.localStorage.setItem('kedu_boxbar_teacher_v1', JSON.stringify({ at: Date.now() }));
  // 스크립트 주입
  new Function('window', 'document', 'localStorage', 'location', 'requestAnimationFrame', 'setTimeout',
    fs.readFileSync(__dirname + '/kedu_boxbar.js', 'utf8'))
    (win, win.document, win.localStorage, win.location, win.requestAnimationFrame || function (f) { f(); }, win.setTimeout);
  // 자동부팅은 readyState==='loading'이면 DOMContentLoaded(비동기)를 기다린다.
  // 동기 검증이므로 명시 boot()으로 확정 — 캐시 없으면 no-op이라 무노출 케이스도 안전.
  try { win.KeduBoxbar.boot(); } catch (e) {}
  return win;
}

// §6-1 비로그인/캐시 없음 → DOM 삽입 0
console.log('[§6-1 학생/캐시없음 무노출]');
(function () {
  var win = fresh('/grade1/semester1/math/x.html', false);
  ok(!win.document.querySelector('.kbx-fab'), '캐시 없는데 FAB 생성됨');
  ok(!win.document.getElementById('kbx-css'), '캐시 없는데 CSS 주입됨');
})();

// §6-2 경로→kind 매핑
console.log('[§6-2 kind 매핑]');
(function () {
  var win = fresh('/', true);
  var B = win.KeduBoxbar;
  var cases = [
    ['/kedu/teacher/g1_math.html', 'kteacher'],
    ['/grade1/semester1/korean/x.html', 'selfstudy'],
    ['/grade4/y.html', 'selfstudy'],
    ['/grade5/semester1/korean/1단원/g5_kor_u1_l01.html', 'selfstudy'],  /* §9-5: [1-4]→[1-6] 수리 — 5·6학년이 link 폴백('제출은 모이지 않아요' 오표기)으로 새지 않는다 */
    ['/grade6/semester1/math/x.html', 'selfstudy'],
    ['/labs/scilab_lab2.html', 'klab'],
    ['/kple/game.html', 'kple'],
    ['/kmake/design.html', 'kmake'],
    ['/english/v3/unit1.html', 'english'],
    ['/kedu/quiz/index.html', 'quiz'],
    ['/board/notice.html', 'link']
  ];
  cases.forEach(function (c) { ok(B.detectKind(c[0]) === c[1], c[0] + ' → ' + B.detectKind(c[0]) + ' (기대 ' + c[1] + ')'); });
})();

// §6-4 CTX 우선순위
console.log('[§6-4 CTX 우선]');
(function () {
  var win = fresh('/grade1/x.html', true);
  win.KEDU_BOXBAR_CTX = { title: '차시명 우선', kind: 'kteacher', url: '/kedu/teacher/#l05' };
  var it = win.KeduBoxbar.currentItem();
  ok(it.title === '차시명 우선', 'CTX title 우선 안됨: ' + it.title);
  ok(it.kind === 'kteacher', 'CTX kind 우선 안됨');
})();

// 캐시 있을 때 FAB 생성 + 배지 초기 숨김
console.log('[캐시 있으면 FAB]');
(function () {
  var win = fresh('/kedu/teacher/g1_math.html', true);
  var fab = win.document.querySelector('.kbx-fab');
  ok(fab, '캐시 있는데 FAB 없음');
  ok(fab && fab.querySelector('.kbx-badge').style.display === 'none', '배지 초기 노출됨');
})();

// title 세션파라미터 제거
console.log('[URL 정리]');
(function () {
  var win = fresh('/kedu/quiz/index.html?lesson=g1_math_u3_l05&seed=999&cwb=abc', true);
  var it = win.KeduBoxbar.currentItem();
  ok(it.url.indexOf('seed=') < 0 && it.url.indexOf('cwb=') < 0, '세션 파라미터 미제거: ' + it.url);
  ok(it.url.indexOf('lesson=') >= 0, 'lesson 파라미터 유실: ' + it.url);
})();

// ═══ §7 초대하기 (비동기) ═══
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function fakeDb(log) {
  function tbl(name) {
    var q = {};
    q.select = function () { return q; };
    q.eq = function () { return q; };
    q.order = function () { return q; };
    q.limit = function () { return q; };
    q.insert = function (row) {
      log.push([name, 'insert', row]);
      if (name === 'cw_bundles') return { select: function () { return { single: function () { return Promise.resolve({ data: { id: 'B1' }, error: null }); } }; } };
      return Promise.resolve({ error: null });
    };
    q.upsert = function (row, opt) { log.push([name, 'upsert', row, opt]); return Promise.resolve({ error: null }); };
    q.then = function (res, rej) {
      var data = name === 'class_codes' ? [{ id: 'C1', label: '1반' }, { id: 'C2', label: '2반' }] : [];
      return Promise.resolve({ data: data, error: null }).then(res, rej);
    };
    return q;
  }
  return {
    auth: { getSession: function () { return Promise.resolve({ data: { session: { user: { id: 'u' } } } }); } },
    rpc: function (n) { return Promise.resolve({ data: 'T1', error: null }); },
    from: tbl
  };
}

(async function () {
  // §7-0 활동 경로 인식 + 수합 정직 표기
  console.log('[§7-0 활동 kind·수합 표기]');
  (function () {
    var win = fresh('/', true);
    var B = win.KeduBoxbar;
    ok(B.detectKind('/kedu/activities/g1m_u1_seq9.html') === 'activity', '활동 경로 → activity 아님');
    ok(B.detectKind('/kpark/board/mafia/') === 'link', '케이파크 → link 아님');
    ok(B.hookLabel('quiz').ok === true, '퀴즈 수합 가능 표기 아님');
    ok(B.hookLabel('kmake').ok === true, '케이메이커 수합 가능 표기 아님 (2026-09-07 kedu_artifact.js 배선 후)');
    ok(B.hookLabel('link').t.indexOf('제출은 모이지') >= 0, '링크 정직 문구 없음');
  })();

  // §7-1 패널 열기 → 학급 칩 → 선택 → 초대 버튼 활성
  console.log('[§7-1 패널·학급 칩]');
  var log = [];
  global.getKeduDb = function () { return fakeDb(log); };
  var win = fresh('/kedu/activities/g1m_u3_relay.html', true);
  win.supabase = {}; win.getKeduDb = global.getKeduDb;
  win.KeduBoxbar.openPanel();
  await sleep(60);
  var p = win.document.querySelector('.kbx-panel');
  ok(p, '패널이 안 열림');
  ok(p && p.querySelectorAll('.kbx-p-chip').length === 2, '학급 칩 2개 아님');
  ok(p && p.querySelector('.kbx-p-hook.ok'), '활동인데 수합 가능 표기 없음');
  var inviteBtn = p.querySelector('.kbx-p-invite');
  ok(inviteBtn.disabled, '반 미선택인데 초대 버튼 활성');
  p.querySelectorAll('.kbx-p-chip')[0].click();
  ok(!inviteBtn.disabled && inviteBtn.textContent.indexOf('1반') >= 0, '반 선택 후 버튼 미갱신');

  // §7-2 초대 실행 → 박스(sent)+항목+발송 3단 배선 + 반 기억
  console.log('[§7-2 바로 초대 배선]');
  inviteBtn.click();
  await sleep(60);
  var bIns = log.find(function (x) { return x[0] === 'cw_bundles' && x[1] === 'insert'; });
  var iIns = log.find(function (x) { return x[0] === 'cw_items' && x[1] === 'insert'; });
  var sUp = log.find(function (x) { return x[0] === 'cw_sends' && x[1] === 'upsert'; });
  ok(bIns && bIns[2].status === 'sent' && bIns[2].sent_at, '박스가 sent로 생성되지 않음');
  ok(iIns && iIns[2].bundle_id === 'B1' && iIns[2].kind === 'activity', '항목 배선 오류');
  ok(sUp && sUp[2].class_code_id === 'C1' && sUp[3].onConflict === 'bundle_id,class_code_id', '발송 upsert 오류');
  ok(!win.document.querySelector('.kbx-panel'), '초대 후 패널이 안 닫힘');
  ok(win.document.querySelector('.kbx-toast'), '초대 완료 토스트 없음');
  var last = JSON.parse(win.localStorage.getItem('kedu_boxbar_lastclass_v1'));
  ok(last && last.id === 'C1', '최근 반 기억 안 됨');

  // §7-3 두 번째 열기 = 최근 반 자동 선택(원클릭)
  console.log('[§7-3 원클릭(최근 반 자동)]');
  win.KeduBoxbar.openPanel();
  await sleep(60);
  var p2 = win.document.querySelector('.kbx-panel');
  var selChip = p2 && p2.querySelector('.kbx-p-chip.sel');
  ok(selChip && selChip.textContent === '1반', '최근 반 자동 선택 안 됨');
  ok(!p2.querySelector('.kbx-p-invite').disabled, '자동 선택인데 초대 버튼 비활성');
  win.KeduBoxbar.closePanel();

  // §7-4 재발송 실수 가드: 같은 페이지·같은 반 3분 내 = 1차 경고, 2차 발송
  console.log('[§7-4 재발송 가드]');
  var n0 = log.filter(function (x) { return x[0] === 'cw_bundles'; }).length;
  await win.KeduBoxbar.invite({ id: 'C1', label: '1반' });   // 방금 보낸 것과 동일 → 경고만
  var n1 = log.filter(function (x) { return x[0] === 'cw_bundles'; }).length;
  ok(n1 === n0, '가드 무시하고 즉시 재발송됨');
  await win.KeduBoxbar.invite({ id: 'C1', label: '1반' });   // 두 번째 = 진짜 재발송
  var n2 = log.filter(function (x) { return x[0] === 'cw_bundles'; }).length;
  ok(n2 === n0 + 1, '2차 눌러도 재발송 안 됨');

  // §7-5 담기(기존 흐름) 버튼 생존
  console.log('[§7-5 담기 공존]');
  win.KeduBoxbar.openPanel();
  await sleep(60);
  var addBtn = win.document.querySelector('.kbx-p-add');
  ok(addBtn && addBtn.textContent.indexOf('담기') >= 0, '담기 버튼 소실');
  win.KeduBoxbar.closePanel();

  console.log('\n──────────────\n' + (fails ? ('FAIL ' + fails) : 'ALL PASS'));
  process.exit(fails ? 1 : 0);
})();
