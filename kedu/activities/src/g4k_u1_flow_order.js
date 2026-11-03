/* src/g4k_u1_flow_order.js — 순서 맞추기: 이야기 흐름 차례대로 (4학년 1학기 국어 1단원 「깊이 있게 읽어요」 l03·l05·l11·l13)
 * 장르: order_story(순서 맞추기 · 아홉째 실물) · 생성기: flow_order
 * 무대 = 세로 줄(lay-col) — 3-2 국어 u1 「이야기 차례대로」 무대 꼴, 화면을 채운다. 카드 왼쪽 = 그림 · 오른쪽 = 일·걸음 문장.
 * 범위(upto): l03 = 4차시까지(석봉·개미와 비둘기) · l05 = 6차시까지(+ 무루) · all = 단원 전체(+ 그림 카드·누구일까) — 케이티처가 차시마다 넣어 준다(map.paramsByLesson).
 * 1학기 활동 — id 에 학기 표지 없음(D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4k_u1_flow_order',
    title: '🕯️ 이야기 흐름 차례대로',
    subtitle: '석봉·무루 이야기의 중요한 일과 이야기 만드는 걸음을 알맞은 차례로 놓아요! 카드를 누르면 위 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '4차시까지' },
        { v: 'l05', label: '6차시까지' },
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
      var gen = GENS['flow_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
