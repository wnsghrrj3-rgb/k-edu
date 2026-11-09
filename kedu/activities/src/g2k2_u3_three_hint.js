/* src/g2k2_u3_three_hint.js — 세 고개 놀이 (2학년 2학기 국어 3단원 「내용을 살펴요」 1·2차시 · 7·8차시 · 9·10차시 · 마무리)
 * 장르: duel_quiz(stream) · 생성기: g2_2_three_hint — 2-2 수학 「알 수 있는 내용 말하기 놀이」와 같은 스트림 엔진에 고개 판 무대를 올렸다.
 * 교과서판(2026-11-09): 지도서 151쪽 9~10차시 「세 고개 놀이 하기」 — 설명을 한 개씩 듣고 무엇인지 알아맞힌다.
 *   고개 셋이 차례로 열리고(첫째 고개만으로는 보기 셋이 다 맞다 — 「비슷한 물건이 많기 때문」), 보기 셋 가운데 답을 고른다.
 *   맞히면 상자가 열려 답이 보이고, 둘째 · 셋째 고개 옆에 그 고개에서 빠진 보기가 뜬다(판정 전엔 어디에도 없음 — 답 미노출).
 *   「왜 그럴까」 보너스(혼자·과제) = 「셋째 고개는 무엇을 알려 줬어?」 — 생김새 · 쓰임 · 재료(정본 특징 셋).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「k2」, map.semester 2.
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
    activityId: 'g2k2_u3_three_hint',
    title: '🔎 세 고개 놀이',
    subtitle: '고개를 하나씩 넘으며 들어 봐요 — 이 물건은 무엇일까요?',
    defaults: { book: 1, n: 8, why: 0 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 고개로 시작' }, { v: 0, label: '바로 새 고개' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] },
      { key: 'why', label: '왜 그럴까 보너스', options: [{ v: 0, label: '끄기' }, { v: 1, label: '켜기' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['g2_2_three_hint'], gen = G.create({ book: app.settings.book }, app.rng);
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
            { v: 'shape', label: '👀 생김새' },
            { v: 'use', label: '✋ 쓰임' },
            { v: 'made', label: '🧶 재료' }
          ],
          answerOf: function (q) { return q.whyAns; }
        }
      });
    }
  });
})();
