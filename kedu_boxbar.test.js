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

console.log('\n──────────────\n' + (fails ? ('FAIL ' + fails) : 'ALL PASS'));
process.exit(fails ? 1 : 0);
