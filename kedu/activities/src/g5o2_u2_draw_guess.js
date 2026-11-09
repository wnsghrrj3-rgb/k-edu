/* src/g5o2_u2_draw_guess.js — 그림으로 기억하기 (5학년 2학기 사회 2단원 「달라지는 시대, 변화하는 생활 모습」 6차시 · 10차시 · 11·12차시 · 단원 마무리)
 * 장르: duel_quiz(stream) · 생성기: g5_2_draw_guess — 「표준어 알아맞히기」와 같은 스트림 엔진에 그림 판 무대를 올렸다.
 * 교과서판(2026-11-09): 『사회』 114~115쪽 단원 마무리 「그림으로 기억하기」 — 친구가 단원 낱말을 숫자·글자 없이 그린 그림을 보고
 *   무엇을 그렸는지 맞춘다. 그림(그림 문자) + 단서 한 줄 → 보기 넷. 맞히면 그림판 아래에 낱말과 때(조선 전기·후기·개항 이후)가 뜬다(판정 전 0 — 답 미노출).
 * 범위(upto): l06 = 6차시까지 · l10 = 10차시까지 · all = 단원 전체 — 케이티처가 차시마다 넣어 준다(map.paramsByLesson).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「o2」 = 사회·2학기, map.semester 2.
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="dg">' +
      '<div id="dg-board"><b>친구의 그림</b><span id="dg-pic"></span><span id="dg-ans"></span></div>' +
      '<div id="dg-hint"></div>' +
      '<div id="dg-tag"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g5o2_u2_draw_guess',
    title: '🎨 그림으로 기억하기',
    subtitle: '친구가 숫자·글자 없이 그린 그림 — 무엇을 그렸을까요?',
    defaults: { upto: 'all', n: 8 },
    settings: [
      { key: 'upto', label: '범위', options: [{ v: 'l06', label: '6차시까지' }, { v: 'l10', label: '10차시까지' }, { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['g5_2_draw_guess'], gen = G.create({ upto: app.settings.upto }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#dg-pic').textContent = q.pic;
          app.el('#dg-hint').textContent = '단서 — ' + q.hint;
        },
        reset: function (app) {
          app.el('#dg-board').classList.remove('open'); app.el('#dg-ans').textContent = '';
          var t = app.el('#dg-tag'); t.textContent = ''; t.classList.remove('show');
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          app.el('#dg-ans').textContent = q.answer;
          app.el('#dg-board').classList.add('open');
          var t = app.el('#dg-tag'); t.textContent = G.ERA_NAME[q.era]; t.classList.add('show');
        }
      });
    }
  });
})();
