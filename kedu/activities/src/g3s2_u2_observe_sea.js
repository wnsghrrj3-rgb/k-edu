/* src/g3s2_u2_observe_sea.js — 관찰 고르기: 지구와 바다 (3학년 2학기 과학 2단원 · l03~l06)
 * 장르: observe_pick(관찰 고르기) · 생성기: observe_sea
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3s2_u2_observe_sea',
    title: '🔍 관찰 고르기',
    subtitle: '두 그림을 자세히 보고 골라요. 그림만 봐서는 모르겠으면 「알 수 없어요」!',
    defaults: { n: 8, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 10, label: '10' }] }
    ],
    stageHtml:
      '<div id="op">' +
        '<div id="op-ask"></div>' +
        '<div id="op-pair">' +
          '<div class="op-card" id="op-a"><div class="op-tag">가</div><div class="op-pic"></div></div>' +
          '<div class="op-card" id="op-b"><div class="op-tag">나</div><div class="op-pic"></div></div>' +
        '</div>' +
        '<div id="op-step"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['observe_sea'].create({ upto: app.settings.upto }, app.rng);
      ObservePick.run(app, gen, {});
    }
  });
})();
