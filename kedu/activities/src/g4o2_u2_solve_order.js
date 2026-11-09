/* src/g4o2_u2_solve_order.js — 지역문제 해결 차례대로 (4학년 2학기 사회 2단원 「지역문제를 해결하고 지역을 알리는 노력」 · l05·l07·l08·l12·l15)
 * 장르: order_story · 생성기: g4_2_solve_order
 * 지도서 124쪽 해결 과정 · 『사회』 63~75쪽 시원이네 주차 문제 · 90~93쪽 자랑거리 소개를 띠에.
 * 범위(upto) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 2학기 활동 — id 의 「g4o2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4o2_u2_solve_order',
    title: '🧩 지역문제 해결 차례대로',
    subtitle: '지역문제를 해결하는 과정과 자랑거리를 알리는 걸음을 띠에 놓아요! 카드를 누르면 왼쪽 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l05', label: '6차시까지' },
        { v: 'l07', label: '7차시까지' },
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
      var gen = GENS['g4_2_solve_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
