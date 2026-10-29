/* src/g3k2_u6_geka_hunt.js — 갈게? 갈까? 틀리게 쓴 곳 찾기 (3학년 2학기 국어 6단원 「감상과 표현의 즐거움」 l14 단원 마무리)
 * 장르: text_hunt(글 속 찾기 · 낱말 토큰) · 생성기: geka_hunt
 * 쪽지·문자를 읽고 약속하는 말·되돌아보는 말을 「께·껄」로, 묻는 말을 「가?」로 틀리게 쓴 어절을 모두 누른다.
 * 덫 = 바르게 쓴 말(묻는 말 「까?」 · 약속하는 말 「게」 — 정본 s08 「둘 다 ㄲ」). 판정 전엔 모든 낱말이 같은 모습(답 미노출).
 * 줄 바꿈은 sep 토큰(이 활동 css 에서만 줄 끝). 범위는 l14 하나라 범위 칩이 없다. 2학기 활동 — id 의 「k2」, map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u6_geka_hunt',
    title: '✍️ 갈게? 갈까?',
    subtitle: '쪽지를 읽고 틀리게 쓴 곳을 모두 찾아 눌러요! 약속하는 말은 「게」, 묻는 말은 「까」 — 물음표부터 봐요.',
    defaults: { n: 6 },
    settings: [
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="gk"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['geka_hunt'].create({}, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
