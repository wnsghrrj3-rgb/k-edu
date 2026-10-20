/* src/g3k2_u2_space_hunt.js — 것·수·줄 띄어쓰기 찾기 (3학년 2학기 국어 2단원 「유창하게 읽고 발표해요」 l13 단원 마무리)
 * 장르: text_hunt(글 속 찾기 · 낱말 토큰) · 생성기: space_hunt
 * 짧은 글을 읽고 것·수·줄을 앞말(또는 뒷말)에 붙여 써서 틀린 어절을 모두 누른다.
 * 덫 = 바르게 띄어 쓴 것·수·줄 · 한 낱말 속 줄·수(줄넘기·수요일 — 정본 s08 오개념). 판정 전엔 모든 낱말이 같은 모습(답 미노출).
 * 줄 바꿈은 sep 토큰(이 활동 css 에서만 줄 끝). 범위는 l13 하나라 범위 칩이 없다. 2학기 활동 — id 의 「k2」, map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u2_space_hunt',
    title: '✂️ 것·수·줄 띄어쓰기',
    subtitle: '글을 읽고 것·수·줄을 붙여 써서 틀린 곳을 모두 찾아 눌러요! 줄넘기·수요일처럼 한 낱말은 붙여 써요.',
    defaults: { n: 6 },
    settings: [
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="sp"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['space_hunt'].create({}, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
