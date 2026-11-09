/* src/g4k2_u6_cause_chain.js — 순서 맞추기: 원인과 결과 사슬 잇기 (4학년 2학기 국어 6단원 「상상의 날개」 l02·l04·l06·l08·l11·l13)
 * 장르: order_story(순서 맞추기) · 생성기: g4_2_cause_chain
 * 지도서 358쪽 「원인과 결과로 놀이 하기」 · 『국어』 282쪽 이야기 이어 말하기를, 교과서 장면(형광 바다 · 방울토마토 · 얼룩말 · 세린이 · 방 씨 규수 · 포도 치마 ·
 * 실베스터 · 랑랑별 때때롱 · 두근두근 · 당나귀와 황소)의 카드를 「앞의 일이 까닭이 되어 이어지는」 차례로 줄 세우는 사슬 놀이로.
 * 무대 = 세로 줄(lay-col) — echo_order 무대 그대로. 2학기 활동 — id 의 「k2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4k2_u6_cause_chain',
    title: '🔗 원인과 결과 사슬 잇기',
    subtitle: '교과서 장면 카드를 앞의 일이 까닭이 되어 이어지는 차례로 놓아요! 카드를 누르면 위 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '3차시까지' },
        { v: 'l04', label: '5차시까지' },
        { v: 'l06', label: '7차시까지' },
        { v: 'l08', label: '10차시까지' },
        { v: 'l11', label: '12차시까지' },
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
      var gen = GENS['g4_2_cause_chain'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
