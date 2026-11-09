/* src/g3o2_u2_custom_hint.js — 세 고개 풍습 탐정 (3학년 2학기 사회 2단원 「옛날과 오늘날의 생활 모습」 l01~l08 = 지도서 2~12차시)
 * 장르: duel_quiz(stream) · 생성기: g3_2_custom_hint — 2-2 국어 「세 고개 놀이」(g2k2_u3_three_hint)의 고개 판 무대를 그대로 빌렸다(엔진·core 무개변).
 * 교과서판(2026-11-09): 『사회』 66~96쪽의 풍습·세시 풍속·전통 놀이·교통수단을 세 고개로 — 첫째 고개만으로는 보기 셋이 다 맞고,
 *   둘째 · 셋째 고개에서 하나씩 빠진다. 맞히면 상자가 열려 답이 보이고 빠진 보기가 뜬다(판정 전엔 어디에도 없음 — 답 미노출).
 *   「왜 그럴까」 보너스(혼자·과제) = 「셋째 고개는 무엇을 알려 줬어?」 — 언제 · 하는 일 · 담긴 마음.
 * 범위(upto)는 케이티처가 차시마다 넣어 준다(map.paramsByLesson) — 그 차시 판을 먼저, 앞 차시 판을 섞어서.
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「o2」, map.semester 2.
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="tg">' +
      '<div id="tg-box"><span id="tg-q">❓</span></div>' +
      '<ol id="tg-hints"></ol>' +
      '<div id="tg-say"></div>' +
    '</div>';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  ACore.create({
    activityId: 'g3o2_u2_custom_hint',
    title: '🔎 세 고개 풍습 탐정',
    subtitle: '고개를 하나씩 넘으며 들어 봐요 — 어떤 풍습일까요?',
    defaults: { upto: 'all', n: 8, why: 0 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '2차시까지' }, { v: 'l02', label: '3차시까지' }, { v: 'l03', label: '4~5차시까지' }, { v: 'l04', label: '6~7차시까지' },
        { v: 'l06', label: '9~10차시까지' }, { v: 'l07', label: '11차시까지' }, { v: 'all', label: '12차시까지(교통 포함)' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] },
      { key: 'why', label: '왜 그럴까 보너스', options: [{ v: 0, label: '끄기' }, { v: 1, label: '켜기' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['g3_2_custom_hint'], gen = G.create({ upto: app.settings.upto }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#tg-hints').innerHTML = q.clues.map(function (c, i) {
            return '<li class="hint h' + (i + 1) + '"><b>' + G.ORD[i] + ' 고개</b><span class="ht">' + esc(c) + '</span><em class="drop"></em></li>';
          }).join('');
        },
        reset: function (app) {
          var b = app.el('#tg-box'); b.classList.remove('open'); app.el('#tg-q').textContent = '❓';
          var s = app.el('#tg-say'); s.textContent = ''; s.classList.remove('show');
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          app.el('#tg-q').textContent = q.emoji + ' ' + q.answer;
          app.el('#tg-box').classList.add('open');
          var hs = app.els('#tg-hints .hint');
          hs[1].querySelector('.drop').textContent = '✗ ' + q.drop[0];
          hs[2].querySelector('.drop').textContent = '✗ ' + q.drop[1];
          hs[2].classList.add('key');
          var s = app.el('#tg-say'); s.textContent = '셋째 고개 = ' + G.KIND_NAME[q.kind]; s.classList.add('show');
        },
        why: {
          question: '🦉 셋째 고개는 무엇을 알려 줬어?',
          options: [
            { v: 'time', label: '📅 언제' },
            { v: 'act', label: '✋ 하는 일' },
            { v: 'wish', label: '💛 담긴 마음' }
          ],
          answerOf: function (q) { return q.whyAns; }
        }
      });
    }
  });
})();
