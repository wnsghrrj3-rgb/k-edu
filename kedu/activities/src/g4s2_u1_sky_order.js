/* src/g4s2_u1_sky_order.js — 밤하늘 차례대로 (4학년 2학기 과학 1단원 「밤하늘 관찰」 · l03·l04·l06·l11)
 * 장르: order_story · 생성기: g4_2_sky_order
 * 『과학』 16~17쪽 달 모양 관찰 · 19쪽 잠깐(행성 차례) · 지도서 146쪽 북극성 찾는 방법을 띠에.
 * 범위(upto) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 2학기 활동 — id 의 「g4s2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4s2_u1_sky_order',
    title: '🌙 밤하늘 차례대로',
    subtitle: '여러 날 동안 변하는 달, 태양에서 가까운 행성, 북극성 찾는 걸음을 띠에 놓아요! 카드를 누르면 왼쪽 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '5차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml:
      '<div id="os" class="lay-row">' +
        '<div id="os-prompt"></div>' +
        '<div id="os-band">' +
          '<div id="os-slots"></div>' +
          '<div id="os-arrow"><span>먼저</span><i></i><span>나중</span></div>' +
        '</div>' +
        '<div id="os-pool"></div>' +
        '<div id="os-step"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['g4_2_sky_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
