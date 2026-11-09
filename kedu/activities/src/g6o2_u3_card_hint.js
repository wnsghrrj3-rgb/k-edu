/* src/g6o2_u3_card_hint.js — 지구촌 낱말 카드 세 고개 (6학년 2학기 사회 3단원 「지구촌 사람들」 l02~l12 · l14 = 지도서 2~14차시)
 * 장르: duel_quiz(stream) · 생성기: g6_2_card_hint — 3-2 사회 「세 고개 풍습 탐정」(g3o2_u2_custom_hint)의 고개 판 무대를 그대로 빌렸다(엔진·core 무개변).
 * 교과서판(2026-11-10): 『사회』 160~161쪽 교실 놀이 「카드 모으기 놀이」(진 사람이 카드 낱말과 관련 있는 문제를 내고 상대가 맞힘)를 세 고개로 —
 *   카드 낱말이 답. 첫째 고개만으로는 보기 셋이 다 맞고, 둘째 · 셋째 고개에서 하나씩 빠진다. 맞히면 상자가 열려 답이 보이고 빠진 보기가 뜬다(답 미노출).
 *   「왜 그럴까」 보너스(혼자·과제) = 「셋째 고개는 무엇을 알려 줬어?」 — 자료 속 수 · 까닭 · 뜻·특징.
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
    activityId: 'g6o2_u3_card_hint',
    title: '🃏 지구촌 낱말 카드 세 고개',
    subtitle: '카드 모으기 놀이처럼 고개를 하나씩 넘으며 들어 봐요 — 카드의 낱말은?',
    defaults: { upto: 'all', n: 8, why: 0 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2~3차시까지' }, { v: 'l04', label: '4차시까지' }, { v: 'l05', label: '5차시까지' }, { v: 'l06', label: '6차시까지' },
        { v: 'l07', label: '7차시까지' }, { v: 'l08', label: '8~9차시까지' }, { v: 'l10', label: '10~11차시까지' }, { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] },
      { key: 'why', label: '왜 그럴까 보너스', options: [{ v: 0, label: '끄기' }, { v: 1, label: '켜기' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['g6_2_card_hint'], gen = G.create({ upto: app.settings.upto }, app.rng);
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
            { v: 'data', label: '📊 자료 속 수' },
            { v: 'why', label: '🔍 까닭' },
            { v: 'feat', label: '📖 뜻·특징' }
          ],
          answerOf: function (q) { return q.whyAns; }
        }
      });
    }
  });
})();
