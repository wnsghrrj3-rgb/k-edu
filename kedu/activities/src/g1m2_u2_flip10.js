/* src/g1m2_u2_flip10.js — 수 카드 뒤집기 놀이 (1학년 2학기 수학 2단원 7·8차시 「10을 만들어 더해 볼까요」)
 * 장르: duel_quiz(stream) · 생성기: flip_ten — 스트림 엔진에 뒤집힌 수 카드 판을 올렸다.
 * 교과서판(2026-11-09): 『수학』 55쪽 「수 카드 뒤집기 놀이」 — 수 카드 3장을 뒤집어 두 수를 더하여 10이 되면 카드를 모두
 *   가져가 덧셈식을 만들고, 10이 되지 않으면 다시 뒤집어 놓는다. 보기 = 세 수의 합 둘 + 「다시 뒤집기」.
 *   맞히면 10이 되는 두 카드에 테가 둘리고(교과서 54쪽 빨간 테) 덧셈식이 뜬다.
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="fl">' +
      '<div id="flask"><span class="who">🙋 내 차례</span><span class="bub">두 수를 더하여 10이 되나요? 되면 세 수를 모두 더해요.</span></div>' +
      '<div id="deck"></div>' +
      '<div id="cards"></div>' +
      '<div id="say"></div>' +
    '</div>';
  function deckHtml() { var h = ''; for (var i = 0; i < 7; i++) h += '<i class="back"></i>'; return h; }

  ACore.create({
    activityId: 'g1m2_u2_flip10',
    title: '🔄 수 카드 뒤집기 놀이',
    subtitle: '뒤집은 세 장 가운데 더하여 10이 되는 두 수를 먼저 찾아요',
    defaults: { book: 1, n: 10 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 카드로 시작' }, { v: 0, label: '바로 새 카드' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['flip_ten'], gen = G.create({ book: app.settings.book }, app.rng);
      app.el('#deck').innerHTML = deckHtml();
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#cards').innerHTML = q.cards.map(function (n, i) {
            return '<span class="fc" data-i="' + i + '" style="animation-delay:' + (i * 0.12) + 's">' + n + '</span>';
          }).join('');
        },
        reset: function (app) { var s = app.el('#say'); s.textContent = ''; s.classList.remove('show'); },
        options: function (q) {
          return q.options.map(function (o) { return { pick: o, label: o === G.NONE ? '🔄 다시 뒤집기' : o }; });
        },
        reveal: function (app, q) {
          var fc = app.el('#cards').querySelectorAll('.fc'), s = app.el('#say');
          if (q.pair) { q.pair.forEach(function (i) { fc[i].classList.add('ten'); }); s.textContent = '🎉 ' + q.expr + ' — 카드를 모두 가져가요'; }
          else { for (var i = 0; i < fc.length; i++) fc[i].classList.add('down'); s.textContent = '🙅 10을 만들 수 없어요 — 다시 뒤집어 놓아요'; }
          s.classList.add('show');
        }
      });
    }
  });
})();
