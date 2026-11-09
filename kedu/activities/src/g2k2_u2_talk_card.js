/* src/g2k2_u2_talk_card.js — 대화 카드 놀이 (2학년 2학기 국어 2단원 「서로 존중해요」)
 * 장르: fill_dialog(대화 채우기) · 생성기: g2_2_talk_card
 * 『국어』 63쪽 「대화 카드 놀이」를 화면으로 — 짝(또는 이야기 속 인물)이 카드의 말을 하면 「나」의 빈 말풍선에 알맞게 반응하는 말을 고른다.
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 2학기 활동 — id 의 「k2」, map.semester 2.
 * 무대 = greeting_dialog 무대 꼴 그대로 + 긴 말(카드의 말 · 보기)이 폰 세로 한 화면에 들도록 이 활동 css 에서 글자만 한 단계 낮춤(core·엔진 무개변).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2k2_u2_talk_card',
    title: '🃏 대화 카드 놀이',
    subtitle: '짝이 카드의 말을 하면 나는 어떻게 반응할까요? 상대의 기분을 생각하며 알맞은 말을 골라요!',
    defaults: { n: 8, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '4차시까지' },
        { v: 'l05', label: '6차시까지' },
        { v: 'l07', label: '8차시까지' },
        { v: 'l09', label: '10차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 10, label: '10' }] }
    ],
    stageHtml:
      '<div id="fd" class="tc">' +
        '<div id="fd-sit"></div>' +
        '<div id="fd-talk"></div>' +
        '<div id="fd-opts"></div>' +
        '<div id="fd-step"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['g2_2_talk_card'].create({ upto: app.settings.upto }, app.rng);
      FillDialog.run(app, gen, {});
    }
  });
})();
