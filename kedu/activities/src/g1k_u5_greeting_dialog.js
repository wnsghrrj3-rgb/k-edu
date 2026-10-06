/* src/g1k_u5_greeting_dialog.js — 대화 채우기: 알맞은 인사말 (1학년 1학기 국어 5단원 「반갑게 인사해요」)
 * 장르: fill_dialog(대화 채우기) · 생성기: greeting_dialog
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1k_u5_greeting_dialog',
    title: '💬 알맞은 인사말',
    subtitle: '누구에게, 어떤 때 하는 말일까요? 빈 말풍선에 알맞은 인사말을 골라요!',
    defaults: { n: 8, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '1차시까지' },
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l09', label: '9차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 10, label: '10' }] }
    ],
    stageHtml:
      '<div id="fd">' +
        '<div id="fd-sit"></div>' +
        '<div id="fd-talk"></div>' +
        '<div id="fd-opts"></div>' +
        '<div id="fd-step"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['greeting_dialog'].create({ upto: app.settings.upto }, app.rng);
      FillDialog.run(app, gen, {});
    }
  });
})();
