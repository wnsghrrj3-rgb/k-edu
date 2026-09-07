/* =============================================================
 * test_worksheet_play_reveal.js — play.html 마감 후 공개(설계 §3-3) 학생 화면, jsdom
 *   reveal=false 인 원장 세트를 풀 때: 정오 색·해설·정답 노출 0, 마무리에 점수·틀린 문항·다시 해볼까 0.
 *   reveal=true(쪽지 기본)면 종전 그대로. 마감(closed)이면 문항 화면이 아예 안 선다.
 *   reveal 키가 없는 옛 서버 응답은 즉시 공개로 해석(kedu_quiz.js).
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_worksheet_play_reveal.js [화면폴더]
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var { JSDOM } = require('jsdom');
var ROOT = path.join(__dirname, '..', '..');
var DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'kedu', 'worksheet');
var html = fs.readFileSync(path.join(DIR, 'play.html'), 'utf8');
var quizjs = fs.readFileSync(path.join(process.argv[2] ? DIR : ROOT, process.argv[2] ? 'kedu_quiz.js' : 'kedu_quiz.js'), 'utf8');
var fail = 0, pass = 0;
function T(c, m) { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } }

/* 세트: 선택 2 + 단답 1 (단답은 「내 답 → 정답」 노출 여부를 본다) */
function makeSet(reveal, closed) {
  return { set: 's1', kind: 'unit_test', title: '1단원 정리', grade: 1, subject: 'math', unit: 'u1', show_result: reveal ? 'immediate' : 'after_close', reveal: reveal, closed: !!closed,
    questions: [
      { seq: 1, qid: 'a', qcode: 'a', concept: 'C1', difficulty: 1, kind: 'mc', stem: '사과는 몇 개?', options: [{ t: '3', correct: true }, { t: '2', mis: 'M01' }, { t: '4', mis: 'M01' }], explanation: ['하나씩 세요.', '3개예요.', '표시하며 세요.'] },
      { seq: 2, qid: 'b', qcode: 'b', concept: 'C1', difficulty: 1, kind: 'sa', stem: '숫자로 쓰세요.', answer: ['2'], explanation: ['둘이에요.', '2예요.', '마지막 수가 개수예요.'] },
      { seq: 3, qid: 'c', qcode: 'c', concept: 'C2', difficulty: 2, kind: 'mc', stem: '더 많은 것은?', options: [{ t: '왼쪽', correct: true }, { t: '오른쪽', mis: 'M10' }], explanation: ['짝지어 보세요.', '왼쪽이에요.', '남는 쪽이 많아요.'] }
    ] };
}
/* 인라인 스크립트만 창에서 굴린다(외부 js 는 document.write 로 실리므로 제외). keduQuiz 는 가짜. */
var inline = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/g).map(function (b) { return b.replace(/^<script>\s*|\s*<\/script>$/g, ''); });
var main = inline[inline.length - 1];
function boot(search, set) {
  var dom = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, ''), { runScripts: 'outside-only', url: 'https://x.test/kedu/worksheet/play.html' + search, pretendToBeVisual: true });
  var w = dom.window;
  w.KEDU_BACK = { fromTeacher: false };
  w.keduQuiz = { load: function () { return Promise.resolve(set); }, record: function () {}, recordEnd: function (a, b) { w.__end = [a, b]; }, misName: function () { return null; } };
  w.speechSynthesis = { cancel: function () {}, speak: function () {} };
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.HTMLElement.prototype.getBoundingClientRect = function () { return { left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10 }; };
  w.SpeechSynthesisUtterance = function () {};
  try { w.eval(main); } catch (e) { T(false, 'play.html 인라인 실행 예외: ' + e.message); }
  return new Promise(function (r) { setTimeout(function () { r(w); }, 250); });
}
function click(w, sel) { var el = w.document.querySelector(sel); if (!el) { T(false, '요소 없음: ' + sel); return false; } el.dispatchEvent(new w.Event('click', { bubbles: true })); return true; }
function answerAll(w, expectReveal) {
  var d = w.document;
  click(w, '[data-nav="resume"]');
  /* 1번 선택 — 오답을 고른다 */
  click(w, '.opt[data-i="1"]');
  var fb = d.getElementById('fb').textContent;
  var hasOkNo = !!d.querySelector('.opt.ok, .opt.no');
  T(hasOkNo === expectReveal, (expectReveal ? '즉시 공개인데 정오 색이 없음' : '마감 후 공개인데 선택지에 정오 색이 칠해짐'));
  T(/다시 생각해 볼까요|맞았어요/.test(fb) === expectReveal, (expectReveal ? '즉시 공개인데 정오 문구가 없음' : '마감 후 공개인데 정오 문구가 보임: ' + fb));
  T(/하나씩 세요|3개예요/.test(fb) === expectReveal, (expectReveal ? '즉시 공개인데 해설이 없음' : '마감 후 공개인데 해설이 보임'));
  if (!expectReveal) T(/답을 적었어요/.test(fb), '마감 후 공개의 안내 문구가 없음: ' + fb);
  click(w, '[data-nav="next"]');
  /* 2번 단답 — 오답 5 */
  click(w, '.pad [data-n="5"]'); click(w, '.pad [data-n="go"]');
  var box = d.getElementById('box') ? d.getElementById('box').textContent : '';
  T((/→\s*2/.test(box)) === expectReveal, (expectReveal ? '즉시 공개인데 단답 정답이 안 보임' : '마감 후 공개인데 단답 정답이 새어 나감: ' + box));
  click(w, '[data-nav="next"]');
  /* 3번 정답 */
  click(w, '.opt[data-i="0"]');
  click(w, '[data-nav="next"]');
  var fin = d.querySelector('.finish') ? d.querySelector('.finish').textContent : '';
  T(!!fin, '마무리 화면이 안 섬');
  T((/문제를 맞혔어요/.test(fin)) === expectReveal, (expectReveal ? '즉시 공개인데 점수가 없음' : '마감 후 공개인데 점수가 보임: ' + fin));
  T((!!d.querySelector('[data-nav="retry"]')) === expectReveal, (expectReveal ? '즉시 공개인데 다시 해볼까 없음' : '마감 후 공개인데 「다시 해볼까」가 뜸'));
  if (!expectReveal) T(/선생님께 보냈어요/.test(fin), '마감 후 마무리가 「보냈어요」를 말하지 않음');
  T(Array.isArray(w.__end) && w.__end[0] === 1 && w.__end[1] === 3, '세트 끝 기록(recordEnd)이 안 남음 — 교사가 볼 결과가 사라진다: ' + JSON.stringify(w.__end));
}
boot('?quiz=s1', makeSet(false)).then(function (w) {
  answerAll(w, false);
  return boot('?quiz=s1', makeSet(true));
}).then(function (w) {
  answerAll(w, true);
  return boot('?quiz=s1', makeSet(false, true));
}).then(function (w) {
  T(/응시가 마감됐어요/.test(w.document.body.textContent), '마감된 세트인데 문항 화면이 섬');
  T(!w.document.querySelector('[data-nav="resume"]'), '마감된 세트에 시작 버튼이 있음');
  /* 미리보기(교사)는 reveal=false 라도 다 보인다 */
  return boot('?quiz=s1&preview=1', makeSet(false));
}).then(function (w) {
  click(w, '[data-nav="resume"]'); click(w, '.opt[data-i="1"]');
  T(/다시 생각해 볼까요/.test(w.document.getElementById('fb').textContent), '교사 미리보기인데 마감 후 공개 규칙이 걸림');
  /* kedu_quiz.js — reveal 키 없는 옛 응답은 즉시 공개 */
  T(/reveal:\s*\(d\.reveal == null\) \? true : !!d\.reveal/.test(quizjs), 'kedu_quiz.js 가 reveal 을 안 넘기거나 옛 응답을 즉시 공개로 해석하지 않음');
  T(/closed:\s*!!d\.closed/.test(quizjs), 'kedu_quiz.js 가 closed 를 안 넘김');
  console.log('\n케이학습지 play 마감 후 공개 — ' + pass + ' PASS / ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
}).catch(function (e) { console.log('예외: ' + e.stack); process.exit(1); });
