/* src/g1k2_u1_feel_talk.js — 대화 채우기: 기분을 ‘나’로 말해요 (1학년 2학기 국어 1단원 「기분을 말해요」 · l07 · l09 · l11 · l13)
 * 장르: fill_dialog(대화 채우기) · 생성기: g1_2_feel_talk  (1-1 국어 u5 「알맞은 인사말」과 같은 엔진·같은 무대)
 * 교과서 카드 알아맞히기 놀이(그림 ↔ 기분 말)와 ‘나 전달법’·「화내지 말고 예쁘게 말해요」를 한 판으로 —
 * 빈 말풍선에 듣는 사람을 생각한 「나」의 말을 고른다.
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1k2_u1_feel_talk',
    title: '💛 기분을 ‘나’로 말해요',
    subtitle: '듣는 사람을 생각하며, 「나」의 빈 말풍선에 들어갈 말을 골라요!',
    defaults: { n: 8, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '8차시까지' },
        { v: 'l09', label: '10차시까지' },
        { v: 'l11', label: '12차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 10, label: '10' }] }
    ],
    stageHtml:
      '<div id="fd">' +
        '<div id="fd-sit"></div>' +
        '<div id="fd-talk"></div>' +
        '<div id="fd-opts"></div>' +
        '<div id="fd-step"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['g1_2_feel_talk'].create({ upto: app.settings.upto }, app.rng);
      FillDialog.run(app, gen, {});
    }
  });
})();
