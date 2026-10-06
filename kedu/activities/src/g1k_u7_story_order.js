/* src/g1k_u7_story_order.js — 순서 맞추기: 차례대로 놓아요 (1학년 1학기 국어 7단원 「알맞은 낱말을 찾아요」)
 * 장르: order_story(순서 맞추기) · 생성기: story_order
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1k_u7_story_order',
    title: '🧩 차례대로 놓아요',
    subtitle: '낱말 카드와 이야기 장면을 알맞은 차례로 놓아요! 카드를 누르면 빈자리에 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '7차시까지' },
        { v: 'l08', label: '8차시까지' },
        { v: 'l09', label: '9차시까지' },
        { v: 'l10', label: '10차시까지' },
        { v: 'l11', label: '11차시까지' },
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
      var gen = GENS['story_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
