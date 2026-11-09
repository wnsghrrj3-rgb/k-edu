/* src/g4k2_u5_media_duel.js — 매체 대 매체 (4학년 2학기 국어 5단원 「오가는 마음」 5·6차시 · 11·12차시 · 마무리)
 * 장르: duel_quiz(stream) · 생성기: g4_2_media_duel — 2-2 국어 「세 고개 놀이」와 같은 스트림 엔진에 카드 판 무대를 올렸다.
 * 교과서판(2026-11-09): 지도서 318쪽 우리 반에서 정한 활동 예시 1 「매체 대 매체 놀이」 — 매체 카드 두 장 + 질문 카드 한 장,
 *   질문에 알맞게 두 매체의 특성을 비교해 대답한다. 여기서는 대답 한 줄을 보여 주고 「어느 매체 이야기일까?」(둘 다도 됨)를 고른다.
 *   맞히면 그 매체 카드에 ✓(둘 다면 두 장 모두)와 질문 카드 갈래가 뜬다(판정 전엔 표시 0 — 답 미노출).
 *   같은 두 매체도 질문에 따라 이쪽 · 저쪽 · 둘 다로 바뀐다 — 「모든 면에서 이기는 매체」는 없다(학습지 오개념 X57).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「k2」, map.semester 2.
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="md">' +
      '<div id="md-card"><b>질문 카드</b><span id="md-q"></span></div>' +
      '<div id="md-pair">' +
        '<div class="mcard" data-i="0"><span class="me"></span><span class="mn"></span><em class="mk"></em></div>' +
        '<span id="md-vs">VS</span>' +
        '<div class="mcard" data-i="1"><span class="me"></span><span class="mn"></span><em class="mk"></em></div>' +
      '</div>' +
      '<div id="md-say"></div>' +
      '<div id="md-tag"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g4k2_u5_media_duel',
    title: '🃏 매체 대 매체',
    subtitle: '질문 카드에 맞는 대답 — 어느 매체 이야기일까요? 둘 다일 수도 있어요',
    defaults: { book: 1, n: 8 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 카드로 시작' }, { v: 0, label: '바로 섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['g4_2_media_duel'], gen = G.create({ book: app.settings.book }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#md-q').textContent = q.cardQ;
          app.els('#md-pair .mcard').forEach(function (c, i) {
            c.querySelector('.me').textContent = q.media[i][0];
            c.querySelector('.mn').textContent = q.media[i][1];
          });
          app.el('#md-say').textContent = '“' + q.say + '”';
        },
        reset: function (app) {
          app.els('#md-pair .mcard').forEach(function (c) { c.classList.remove('win'); c.querySelector('.mk').textContent = ''; });
          var t = app.el('#md-tag'); t.textContent = ''; t.classList.remove('show');
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          app.els('#md-pair .mcard').forEach(function (c, i) {
            if (q.answer === G.BOTH || q.answer === q.media[i][1]) { c.classList.add('win'); c.querySelector('.mk').textContent = '✓'; }
          });
          var t = app.el('#md-tag'); t.textContent = '질문 카드 = ' + G.KIND_NAME[q.card] + (q.answer === G.BOTH ? ' · 두 매체가 같아요' : ' · 매체마다 잘하는 일이 달라요'); t.classList.add('show');
        }
      });
    }
  });
})();
