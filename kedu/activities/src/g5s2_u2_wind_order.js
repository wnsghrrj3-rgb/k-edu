/* src/g5s2_u2_wind_order.js — 날씨가 생기는 차례 (5학년 2학기 과학 2단원 「날씨와 우리 생활」 · l04·l07·l10)
 * 장르: order_story(순서 맞추기) · 생성기: g5_2_wind_order
 * 『과학』 40~43쪽 이슬·안개(·강수) · 44~51쪽 고기압과 저기압 · 바람의 방향(바닷가의 낮과 밤)을 까닭 → 결과 카드 3~4장 차례 놀이로.
 * 범위(upto): l04 = 5차시까지(이슬·안개·비) · all = 단원 전체(+ 기압과 바람 · 바닷가 바람) — 케이티처가 차시마다 넣어 준다(map.paramsByLesson).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「s2」 = 과학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g5s2_u2_wind_order',
    title: '🌬️ 날씨가 생기는 차례',
    subtitle: '까닭이 되는 일부터 차례로 놓아요! 카드를 누르면 위 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l04', label: '5차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml:
      '<div id="os" class="lay-col">' +
        '<div id="os-prompt"></div>' +
        '<div id="os-main">' +
          '<div id="os-slots"></div>' +
          '<div id="os-pool"></div>' +
        '</div>' +
        '<div id="os-step"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['g5_2_wind_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
