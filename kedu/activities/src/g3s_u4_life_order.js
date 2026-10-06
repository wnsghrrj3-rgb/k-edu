/* src/g3s_u4_life_order.js — 순서 맞추기: 한살이 차례대로 (3학년 1학기 과학 4단원 「생물의 한살이」)
 * 장르: order_story(순서 맞추기 · 둘째 실물) · 생성기: life_order
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3s_u4_life_order',
    title: '🔄 한살이 차례대로',
    subtitle: '한살이 단계와 자라는 모습을 알맞은 차례로 놓아요! 카드를 누르면 빈자리에 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l07', label: '7차시까지' },
        { v: 'l10', label: '10차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml:
      '<div id="os" class="lay-col">' +
        '<div id="os-prompt"></div>' +
        '<div id="os-slots"></div>' +
        '<div id="os-pool"></div>' +
        '<div id="os-step"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['life_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
