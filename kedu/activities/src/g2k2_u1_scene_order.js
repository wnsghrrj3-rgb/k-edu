/* src/g2k2_u1_scene_order.js — 순서 맞추기: 이야기 장면 차례대로 (2학년 2학기 국어 1단원 「장면을 상상하며」 l07·l09·l14)
 * 장르: order_story(순서 맞추기) · 생성기: g2_2_scene_order
 * 교과서 『국어』 24쪽·32쪽 「일이 일어난 차례대로 빈칸에 번호를 써 봅시다」와 25쪽 「인물의 마음을 상상해 봅시다」를 카드 놀이로.
 * 무대 = 세로 줄(lay-col) — 3-2 국어 u1 「이야기 차례대로」 무대 꼴 그대로(카드 왼쪽 = 그림 · 오른쪽 = 장면 문장).
 * 범위(upto)는 단원 처음부터 그 차시까지 — 8차시까지(7·8차시 묶음)는 「할머니와 하얀 집」만, 단원 전체는 「엉뚱한 수리점」까지(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2k2_u1_scene_order',
    title: '🏠 이야기 장면 차례대로',
    subtitle: '「할머니와 하얀 집」·「엉뚱한 수리점」 장면과 할머니의 마음을 알맞은 차례로 놓아요! 카드를 누르면 위 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '8차시까지' },
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
      var gen = GENS['g2_2_scene_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
