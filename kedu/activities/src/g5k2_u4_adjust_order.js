/* src/g5k2_u4_adjust_order.js — 의견 조정 차례 잇기 (5학년 2학기 국어 4단원 「의견을 조정해요」 · l02·l06·l13)
 * 장르: order_story(순서 맞추기) · 생성기: g5_2_adjust_order
 * 『국어』 182~184쪽 「우리 반 언어폭력 문제」 토의 · 196쪽 학급 토의 절차(붙임 7) · 204쪽 「보드게임 문제」 토의의 말 카드 3~4장을
 *   의견을 조정하는 차례(주제 → 마련 → 나누기 → 기준 → 장단점 → 합의점 → 결정)로 놓는다. 186쪽 붙임 6 「의견을 조정하는 방법」을 카드 놀이로.
 * 범위(upto): l02 = 3차시까지(언어폭력 토의) · l06 = 7차시까지(+ 학급 토의 절차) · all = 단원 전체(+ 마무리 보드게임 토의)
 *   — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  var root = document.getElementById('a-root'); if (root) root.classList.add('ao');   // 이 활동 css 덩이 표지(엔진이 #os 의 class 를 판마다 다시 써서 #a-root 에 단다)
  ACore.create({
    activityId: 'g5k2_u4_adjust_order',
    title: '🤝 의견 조정 차례 잇기',
    subtitle: '토의 말 카드를 의견을 조정하는 차례로 놓아요! 카드를 누르면 위 빈자리부터 들어가요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '3차시까지' },
        { v: 'l06', label: '7차시까지' },
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
      var gen = GENS['g5_2_adjust_order'].create({ upto: app.settings.upto }, app.rng);
      OrderStory.run(app, gen, {});
    }
  });
})();
