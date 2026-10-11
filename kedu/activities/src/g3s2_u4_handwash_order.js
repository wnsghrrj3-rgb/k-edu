/* src/g3s2_u4_handwash_order.js — 순서 맞추기: 손 씻기 차례대로 (3학년 2학기 과학 4단원 「감염병과 건강한 생활」 l10·l11)
 * 장르: order_story(순서 맞추기 · 다섯째 실물) · 생성기: handwash_order
 * 무대 = 26회차 연표 띠 그대로(가로 띠 + 「먼저 → 나중」 화살표, 답 흔적 아님). 카드 위 = 그림 · 아래 = 단계 이름·방법.
 * 범위는 l10 하나라 범위 칩이 없다. 2학기 활동 — id 의 「s2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3s2_u4_handwash_order',
    title: '🧼 손 씻기 차례대로',
    subtitle: '손 씻기 6단계와 짝 검사의 차례를 띠에 놓아요! 카드를 누르면 왼쪽 빈자리부터 들어가요.',
    defaults: { n: 6 },
    settings: [
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
      var gen = GENS['handwash_order'].create({}, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
