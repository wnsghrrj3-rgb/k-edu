/* src/g1m2_u1_samecard.js — 같은 수 모으기 놀이 (1학년 2학기 수학 1단원 2·3·4차시)
 * 장르: duel_quiz(stream) · 생성기: same_card — 2학년 2학기 「곱셈표 수 찾기 놀이」와 같은 스트림 엔진에 카드 손패 무대를 올렸다.
 * 교과서판(2026-11-09): 『수학』 23쪽 「같은 수 모으기 놀이」 — 같은 수를 나타내는 연결 모형·숫자·「칠십팔」·「일흔여덟」 카드
 *   4장을 모으면 「모았다!」. 손에 같은 수 카드 3장이 있고 한 장이 모자란다 — 오른쪽 친구가 내미는 카드 셋 가운데
 *   알맞은 한 장을 고르면 빈자리에 들어가 네 장이 모인다. 2차시(19쪽 「같은 수 찾기 놀이」)는 몇십(60·70·80·90) 판.
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="scd">' +
      '<div id="scask"><span class="who">🙋 내 카드</span><span class="bub">같은 수 카드 4장을 모으려면 어떤 카드가 필요할까요?</span></div>' +
      '<div id="hand"></div>' +
      '<div id="say"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g1m2_u1_samecard',
    title: '🃏 같은 수 모으기 놀이',
    subtitle: '연결 모형·숫자·두 가지 읽기 — 같은 수 카드 4장을 모아요',
    defaults: { range: 'all', book: 1, n: 10 },
    settings: [
      { key: 'range', label: '수 범위', options: [{ v: 'tens', label: '몇십 (60·70·80·90)' }, { v: 'all', label: '99까지의 수' }] },
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 수로 시작' }, { v: 0, label: '바로 새 카드' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['same_card'], gen = G.create({ range: app.settings.range, book: app.settings.book }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#hand').innerHTML = q.hand.map(function (c) { return G.cardHtml(c); }).join('') +
            '<span class="sc sc-slot" id="slot">?</span>';
        },
        reset: function (app) { var s = app.el('#say'); s.textContent = ''; s.classList.remove('show'); },
        options: function (q) { return q.cards.map(function (c) { return { pick: G.keyOf(c), label: G.cardHtml(c, 'sc-opt') }; }); },
        reveal: function (app, q) {
          var c = q.cards.filter(function (x) { return G.keyOf(x) === q.answer; })[0];
          var slot = app.el('#slot'); if (slot) slot.outerHTML = G.cardHtml(c, 'sc-got');
          var s = app.el('#say'); s.textContent = '🎉 모았다! — ' + q.n + ' · ' + G.sino(q.n) + ' · ' + G.native(q.n); s.classList.add('show');
        }
      });
    }
  });
})();
