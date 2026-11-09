/* src/g2m2_u5_graphtalk.js — 알 수 있는 내용 말하기 놀이 (2학년 2학기 수학 5단원 5·6차시)
 * 장르: duel_quiz(stream) · 생성기: graph_talk — 2단원 「곱셈표 수 찾기 놀이」와 같은 스트림 엔진에 ◯ 그래프 무대를 올렸다.
 * 교과서판(2026-11-09): 『수학』 121쪽 「표와 그래프로 나타내고 알 수 있는 내용을 이야기하는 놀이」 —
 *   순서를 정해 그래프에서 알 수 있는 내용을 한 가지씩 말하고, 친구가 말한 내용이 맞는지 확인한다.
 *   세 친구의 말 가운데 맞는 말은 하나 — 바르게 말한 친구를 고르면 그 말풍선이 켜지고 그래프에서 근거가 된 칸이 빛난다.
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="gtk">' +
      '<div id="gwrap"></div>' +
      '<div id="talks"></div>' +
      '<div id="say"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g2m2_u5_graphtalk',
    title: '📊 알 수 있는 내용 말하기 놀이',
    subtitle: '친구가 그래프를 보고 한 말 — 맞는 말을 한 친구는 누구일까?',
    defaults: { book: 1, n: 10 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 문장으로 시작' }, { v: 0, label: '바로 새 그래프' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['graph_talk'], gen = G.create({ book: app.settings.book }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#gwrap').innerHTML = G.graphHtml(q.topic);
          app.el('#talks').innerHTML = q.claims.map(function (c) {
            return '<div class="talk" data-who="' + c.who + '"><span class="who">' + c.who + '</span><span class="bub">' + c.text + '</span></div>';
          }).join('');
        },
        reset: function (app) { var s = app.el('#say'); s.textContent = ''; s.classList.remove('show'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          var t = app.el('#talks').querySelector('.talk[data-who="' + q.answer + '"]');
          if (t) t.classList.add('right');
          var s = app.el('#say'); s.textContent = '✅ ' + q.answer + '의 말이 맞아요'; s.classList.add('show');
        }
      });
    }
  });
})();
