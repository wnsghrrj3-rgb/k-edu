/* src/g3o2_u2_custom_order.js — 순서 맞추기: 풍습 차례대로 (3학년 2학기 사회 2단원 「옛날과 오늘날의 생활 모습」 주제① l02~l06)
 * 장르: order_story(순서 맞추기 · 여덟째 실물) · 생성기: custom_order
 * 무대 = 26회차 연표 띠 그대로(가로 띠 + 「먼저 → 나중」 화살표, 답 흔적 아님). 카드 위 = 그림 · 아래 = 이름·하는 일.
 * 범위(upto)는 l02 부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3o2_u2_custom_order',
    title: '🧧 풍습 차례대로',
    subtitle: '일생 길·혼례·명절·복주머니의 차례를 띠에 놓아요! 카드를 누르면 왼쪽 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '3차시까지' },
        { v: 'l03', label: '5차시까지' },
        { v: 'l04', label: '7차시까지' },
        { v: 'l05', label: '8차시까지' },
        { v: 'all', label: '주제① 전체' }] },
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
      var gen = GENS['custom_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
