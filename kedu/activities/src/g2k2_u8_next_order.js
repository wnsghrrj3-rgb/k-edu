/* src/g2k2_u8_next_order.js — 순서 맞추기: 이어질 이야기 차례대로 (2학년 2학기 국어 8단원 「나도 작가」 l07·l09·l14)
 * 장르: order_story(순서 맞추기) · 생성기: g2_2_next_order
 * 『국어』 249쪽 「일이 일어난 차례대로 번호 쓰기」 · 256쪽 붙임 6 차례 정리 · 258쪽 이야기 표현하기 놀이 · 원작 뒷이야기(지도서 333쪽) · 『국어활동』 뒷이야기를
 * 장면 카드 줄 세우기 놀이로. 무대 = 세로 줄(lay-col) — echo_order 무대 그대로. 2학기 활동 — id 의 「k2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2k2_u8_next_order',
    title: '📖 이어질 이야기 차례대로',
    subtitle: '「빈집에 온 손님」·「오, 미지의 택배」 장면과 이어질 이야기를 일이 일어난 차례로 놓아요! 카드를 누르면 위 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '8차시까지' },
        { v: 'l09', label: '10차시까지' },
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
      var gen = GENS['g2_2_next_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
