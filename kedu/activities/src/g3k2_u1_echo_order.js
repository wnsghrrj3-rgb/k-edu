/* src/g3k2_u1_echo_order.js — 순서 맞추기: 이야기 차례대로 (3학년 2학기 국어 1단원 「경험과 관련지으며 이해해요」 l07·l13)
 * 장르: order_story(순서 맞추기 · 여섯째 실물) · 생성기: echo_order
 * 무대 = 세로 줄(lay-col) — 카드 한 장이 문장이라 1-1 국어 u7 장면 카드 무대 꼴, 화면을 채운다(21회차). 카드 왼쪽 = 그림 · 오른쪽 = 장면·걸음 문장.
 * 범위는 l07 하나라 범위 칩이 없다. 2학기 활동 — id 의 「k2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u1_echo_order',
    title: '⛰️ 이야기 차례대로',
    subtitle: '「소리 돌려주는 골짜기」 장면과 간추리는 걸음을 알맞은 차례로 놓아요! 카드를 누르면 위 빈자리부터 들어가요.',
    defaults: { n: 6 },
    settings: [
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
      var gen = GENS['echo_order'].create({}, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
