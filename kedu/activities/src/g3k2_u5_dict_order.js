/* src/g3k2_u5_dict_order.js — 사전에 먼저 실리는 낱말은? (3학년 2학기 국어 5단원 「사전으로 여는 세상」 · l08·l12·l14)
 * 장르: order_story(순서 맞추기 · 일곱째 실물) · 생성기: dict_order
 * 무대 = 세로 줄(lay-col) — 사전 쪽처럼 위에서 아래로 낱말이 실린다. 카드 한 장 = 낱말 하나(기본형), 가운데 정렬·큰 글씨.
 * 범위(upto): l08 = 9차시까지 · l12 = 13차시까지 · all = 단원 전체 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u5_dict_order',
    title: '📖 사전에 먼저 실리는 낱말은?',
    subtitle: '첫 자음자 → 모음자 → 받침 차례로 견주어, 사전에 먼저 실리는 낱말부터 위에 놓아요! 카드를 누르면 위 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l08', label: '9차시까지' },
        { v: 'l12', label: '13차시까지' },
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
      var gen = GENS['dict_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
