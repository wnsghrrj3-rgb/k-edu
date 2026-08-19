/* =============================================================
 * test_morning_review.js — 수학 오답 다시 보기 (되살리기 + 다시 풀기)
 *   ① review.html 의 rebuildWrong 을 그대로 떼어내 실제 c키에 대고 돌린다:
 *      제출 봉투를 흉내 내 틀린 문항만 되살리고, 발문·정답까지 원본과 같은가
 *   ② 템플릿이 바뀐 상황(가짜 id) → missing 으로 세는가(조용한 증발 금지)
 *   ③ 미등록 세트 → 전부 missing
 *   ④ kquiz-ui: cfg.items 로 마운트 → 되살린 오답만 뜨고, 풀고 채점까지 되는가
 *   ⑤ 회귀: cfg.items 없는 기존 마운트 경로가 그대로인가
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_morning_review.js
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var JSDOM = require('jsdom').JSDOM;

var ROOT = path.join(__dirname, '..', '..');
var html = fs.readFileSync(path.join(ROOT, 'morning', 'review.html'), 'utf8');
var catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'kedu', 'quiz', 'catalog.json'), 'utf8'));

var fail = 0, pass = 0;
function T(c, m) { if (c) { pass++; } else { fail++; console.log('  ✗ ' + m); } }

/* ── 순수 로직: rebuildWrong 을 화면에서 그대로 떼어낸다 ── */
var mR = html.match(/function rebuildWrong\(day, core\)\{[\s\S]*?\n  \}/);
T(!!mR, 'review.html 에서 rebuildWrong 을 못 찾음 — 시그니처가 바뀌었나');
if (!mR) { console.log('\n중단'); process.exit(1); }
var rebuildWrong = eval('(function(){' + mR[0] + '\nreturn rebuildWrong;})()');

var CORE = require('./kquiz-core.js');
(catalog.units || catalog.list || []).filter(function (u) { return u.subject === 'math'; })
  .forEach(function (u) {
    var mod = require(path.join(ROOT, 'kedu', 'quiz', 'templates', u.key + '.js'));
    if (typeof mod === 'function') mod(CORE);
  });
require(path.join(ROOT, 'kedu', 'quiz', 'templates', 'math_morning.js'))(CORE);

/* ① 실제 c키로 제출 봉투를 흉내 낸다: 홀수 번째 문항을 틀린 것으로 */
[[1, 5], [3, 12], [6, 30]].forEach(function (gd) {
  var key = 'g' + gd[0] + '_math_c' + ('00' + gd[1]).slice(-3);
  if (!CORE.has(key)) { T(false, key + ' 미등록 — 표본 키 갱신 필요'); return; }
  var seed = 777, n = 10;
  var orig = CORE.generate({ lesson: key, n: n, seed: seed }).items;
  var stored = orig.map(function (it, i) {
    return { id: it.id, answer: 'x', correct: i % 2 === 0 ? false : true };
  });
  var day = { set: key, seed: seed, n: n, items: stored };
  var r = rebuildWrong(day, CORE);
  T(r.missing === 0, key + ' 되살리기에서 missing ' + r.missing + '개(0이어야 함)');
  T(r.wrong.length === 5, key + ' 틀린 5문항이어야 하는데 ' + r.wrong.length);
  r.wrong.forEach(function (w, i) {
    var o = orig[i * 2];
    T(w.item.q === o.q, key + ' 되살린 발문이 원본과 다름(q' + (i * 2) + ')');
    T(String(w.item.answer) === String(o.answer), key + ' 되살린 정답이 원본과 다름(q' + (i * 2) + ')');
    T(w.my === 'x', key + ' 내가 쓴 답이 봉투 값과 다름');
  });
});

/* ② 템플릿 변경 흉내: 봉투 id 를 훼손 → missing 으로 세야 한다 */
var key2 = 'g3_math_c012', seed2 = 777;
var orig2 = CORE.generate({ lesson: key2, n: 10, seed: seed2 }).items;
var stored2 = orig2.map(function (it, i) {
  return { id: i < 2 ? ('없는_' + it.id) : it.id, answer: 'x', correct: false };
});
var r2 = rebuildWrong({ set: key2, seed: seed2, n: 10, items: stored2 }, CORE);
T(r2.missing === 2, 'id 훼손 2건이 missing 으로 안 잡힘: ' + r2.missing);
T(r2.wrong.length === 8, '살아남은 8건이어야 하는데 ' + r2.wrong.length);

/* ③ 미등록 세트 */
var r3 = rebuildWrong({ set: 'g9_math_c999', seed: 1, n: 10,
  items: [{ id: 'a', answer: 'x', correct: false }, { id: 'b', answer: 'y', correct: true }] }, CORE);
T(r3.wrong.length === 0 && r3.missing === 1, '미등록 세트가 missing 1(틀린 것만)로 안 섬');

/* ④⑤ jsdom 실마운트 — cfg.items 경로와 기존 경로 */
var dom = new JSDOM('<!DOCTYPE html><body><div id="a"></div><div id="b"></div></body>', { runScripts: 'outside-only' });
var win = dom.window;
function load(p) { new Function('self', 'window', 'document', 'module', fs.readFileSync(p, 'utf8'))(win, win, win.document, undefined); }
load(path.join(__dirname, 'kquiz-core.js'));
(catalog.units || catalog.list || []).filter(function (u) { return u.subject === 'math' && u.grade === 3; })
  .forEach(function (u) { load(path.join(__dirname, 'templates', u.key + '.js')); });
load(path.join(__dirname, 'templates', 'math_lessons.js'));
load(path.join(__dirname, 'templates', 'math_morning.js'));
load(path.join(__dirname, 'kquiz-ui.js'));
var KQuizW = win.KQuiz;

var wrongItems = KQuizW.core.generate({ lesson: key2, n: 10, seed: seed2 }).items
  .slice(0, 3).map(function (it) { var c = {}; for (var k in it) c[k] = it[k]; return c; });
var elA = win.document.getElementById('a');
KQuizW.mount(elA, { mode: 'student', items: wrongItems });
T(!!elA.querySelector('.kq-qt'), 'cfg.items 마운트에서 문항이 안 뜸');
T(elA.querySelector('.kq-prog').textContent.indexOf('/ 3') >= 0,
  '문항 수가 되살린 3개가 아님: ' + elA.querySelector('.kq-prog').textContent);
T(elA.querySelector('.kq-qt').textContent === wrongItems[0].q, '첫 문항이 되살린 오답이 아님');

/* 3문항 전부 정답으로 밟아 자동 채점 3/3 까지 */
for (var qi = 0; qi < 3; qi++) {
  var it = wrongItems[qi];
  if (it.type === 'short') {
    var inp = elA.querySelector('.kq-short input');
    inp.value = it.answer;
    inp.dispatchEvent(new win.window.Event('input', { bubbles: true }));
  } else if (it.type === 'ox') {
    elA.querySelectorAll('.kq-ox .kq-opt')[it.answer ? 0 : 1].click();
  } else {
    elA.querySelectorAll('.kq-opts .kq-opt')[it.answer].click();
  }
  var btns = elA.querySelectorAll('.kq-foot .kq-btn.pri');
  btns[btns.length - 1].click();                    // 확인
  btns = elA.querySelectorAll('.kq-foot .kq-btn.pri');
  btns[btns.length - 1].click();                    // 다음/결과
}
var big = elA.querySelector('.kq-done .big');
T(big && big.textContent.replace(/\s/g, '') === '3/3',
  '다시 풀기 채점이 3/3 이 아님: ' + (big && big.textContent));
T(!elA.querySelector('.kq-btn.pri') || elA.textContent.indexOf('제출') < 0
  || !Array.prototype.some.call(elA.querySelectorAll('.kq-btn'), function (b) { return b.textContent.indexOf('제출') >= 0; }),
  '연습 모드인데 제출 버튼이 뜸 — 오늘 기록을 덮을 수 있다');

/* ⑤ 기존 경로 회귀 */
var elB = win.document.getElementById('b');
KQuizW.mount(elB, { mode: 'student', lesson: key2, n: 5, seed: 9 });
T(!!elB.querySelector('.kq-qt'), '기존 lesson 마운트 경로가 깨짐');
T(elB.querySelector('.kq-prog').textContent.indexOf('/ 5') >= 0, '기존 경로 문항 수가 5가 아님');

console.log('\ntest_morning_review: ' + pass + ' 통과, ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
