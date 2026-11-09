/* src/g1k2_u4_event_order.js — 순서 맞추기: 일이 일어난 차례 (1학년 2학기 국어 4단원 「감동을 나누어요」 · l03 · l06 · l08 · l10 · l14)
 * 장르: order_story(순서 맞추기) · 생성기: g1_2_event_order  (1-1 국어 u7 「차례대로 놓아요」와 같은 엔진·같은 무대)
 * 「미역도 맛있어」·「소금을 만드는 맷돌」·만화 영화 두 편에서 있었던 일을 카드로 — 카드를 누르면 빈자리에 차례로 들어간다.
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1k2_u4_event_order',
    title: '🎞️ 일이 일어난 차례',
    subtitle: '누가 무엇을 했는지, 언제 일어났는지 생각하며 카드를 차례로 놓아요! 카드를 누르면 빈자리에 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '5차시까지' },
        { v: 'l06', label: '7차시까지' },
        { v: 'l08', label: '9차시까지' },
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
      var gen = GENS['g1_2_event_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
