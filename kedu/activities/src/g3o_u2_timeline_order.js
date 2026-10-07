/* src/g3o_u2_timeline_order.js — 순서 맞추기: 연표 차례대로 (3학년 1학기 사회 2단원 「일상에서 만나는 과거」 l04·l05)
 * 장르: order_story(순서 맞추기 · 셋째 실물) · 생성기: timeline_order
 * 자리는 늘 가로 띠 — 정본 l04 「왼쪽에서 오른쪽으로 갈수록 나중 일」. 띠 아래 「먼저 → 나중」 화살표(무대 고정, 답 흔적 아님).
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3o_u2_timeline_order',
    title: '📏 연표 차례대로',
    subtitle: '있었던 일을 연표 띠에 차례대로 놓아요! 카드를 누르면 왼쪽 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l04', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'all', label: '6차시까지' }] },
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
      var gen = GENS['timeline_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
