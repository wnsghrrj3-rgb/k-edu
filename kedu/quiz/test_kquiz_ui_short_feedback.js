/* =============================================================
 * test_kquiz_ui_short_feedback.js — 단답 문항 채점·피드백 (jsdom 실마운트)
 *   ① 틀린 답: 입력창 빨강(.no) + 「정답은 N」 표시 + 💡 해설
 *   ② 맞은 답: 입력창 초록(.ok) + 정답 줄 없음 + ⭕ 해설
 *   ③ 끝까지 풀면 점수가 자동 채점으로 서는가(1/2)
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_kquiz_ui_short_feedback.js
 * ============================================================= */
'use strict';
var path = require('path');
var fs = require('fs');
var JSDOM = require('jsdom').JSDOM;

var dom = new JSDOM('<!DOCTYPE html><body><div id="m"></div></body>', { runScripts: 'outside-only' });
var win = dom.window;

function load(p) { new Function('self', 'window', 'document', 'module', fs.readFileSync(p, 'utf8'))(win, win, win.document, undefined); }
load(path.join(__dirname, 'kquiz-core.js'));
load(path.join(__dirname, 'kquiz-ui.js'));
var KQuiz = win.KQuiz;

var fail = 0, pass = 0;
function T(c, m) { if (c) { pass++; } else { fail++; console.log('  ✗ ' + m); } }

/* 정수 답 템플릿 + shortRatio:1 → 전 문항 단답 */
KQuiz.core.register('__ui_short', {
  source: '검사', fixed: [], shortRatio: 1,
  templates: [{
    id: 't_add', type: 'param', difficulty: 1,
    gen: function (rng) { return { a: rng.int(2, 9), b: rng.int(2, 9) }; },
    render: function (p) { return p.a + ' + ' + p.b + ' = ?'; },
    answer: function (p) { return p.a + p.b; },
    explain: function (p, ans) { return p.a + ' + ' + p.b + ' = ' + ans + ' 이에요'; }
  }]
});

var el = win.document.getElementById('m');
KQuiz.mount(el, { mode: 'student', lesson: '__ui_short', n: 2, seed: 5 });
var items = KQuiz.core.generate({ lesson: '__ui_short', n: 2, seed: 5 }).items;
T(items.every(function (it) { return it.type === 'short'; }), '전 문항 단답이어야 하는데 아님');

function setInput(v) {
  var inp = el.querySelector('.kq-short input');
  inp.value = v;
  inp.dispatchEvent(new win.window.Event('input', { bubbles: true }));
}
function click(sel, label) {
  var b = Array.prototype.filter.call(el.querySelectorAll(sel), function (x) {
    return !label || x.textContent.indexOf(label) >= 0;
  })[0];
  T(!!b, (label || sel) + ' 버튼 없음');
  if (b) b.click();
}

/* ① 1번 문항 — 일부러 틀린다 */
var wrong = String(Number(items[0].answer) + 1);
setInput(wrong);
click('.kq-foot .kq-btn.pri', '확인');
var inp1 = el.querySelector('.kq-short input');
T(inp1 && inp1.className === 'no', '틀린 단답 입력창이 빨강(.no)이 아님: ' + (inp1 && inp1.className));
var ans1 = el.querySelector('.kq-ans');
T(!!ans1, '틀렸는데 「정답은 N」 표시가 없음');
T(ans1 && ans1.textContent.indexOf(items[0].answer) >= 0,
  '정답 표시에 실제 정답(' + items[0].answer + ')이 없음: ' + (ans1 && ans1.textContent));
var exp1 = el.querySelector('.kq-exp');
T(exp1 && exp1.textContent.indexOf('💡') >= 0, '오답 해설(💡)이 없음');
click('.kq-foot .kq-btn.pri', '다음 문제');

/* ② 2번 문항 — 맞힌다 */
setInput(items[1].answer);
click('.kq-foot .kq-btn.pri', '확인');
var inp2 = el.querySelector('.kq-short input');
T(inp2 && inp2.className === 'ok', '맞힌 단답 입력창이 초록(.ok)이 아님: ' + (inp2 && inp2.className));
T(!el.querySelector('.kq-ans'), '맞혔는데 정답 줄이 떠 있음');
var exp2 = el.querySelector('.kq-exp');
T(exp2 && exp2.textContent.indexOf('⭕') >= 0, '정답 해설(⭕)이 없음');

/* ③ 결과 — 자동 채점 1/2 */
click('.kq-foot .kq-btn.pri', '결과 보기');
var big = el.querySelector('.kq-done .big');
T(big && big.textContent.replace(/\s/g, '') === '1/2', '자동 채점 점수가 1/2 이 아님: ' + (big && big.textContent));

console.log('\ntest_kquiz_ui_short_feedback: ' + pass + ' 통과, ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
