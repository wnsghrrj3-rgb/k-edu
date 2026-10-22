/* src/g3k2_u5_stem_hunt.js — 바뀌지 않는 부분 짚기 (3학년 2학기 국어 5단원 「사전으로 여는 세상」 l04 · l06 · l14)
 * 장르: text_hunt(글 속 찾기 · 글자 토큰) · 생성기: stem_hunt
 * 모양이 바뀐 낱말 3~4개가 한 줄씩 쌓이고, 낱말마다 바뀌지 않는 부분의 글자를 모두 누른다(정본 l04 s09 「나란히 놓고 처음부터 같은 곳까지 짚어」).
 * 덫 = 바뀌는 부분의 첫 글자 「으」·「어/아」(정본 s04 watch 「접으」 · s09 「심어」) · 이름 낱말은 낱말 전체가 그대로(s05). 판정 전엔 모든 글자가 같은 모습(답 미노출).
 * 줄 바꿈은 sep 토큰(이 활동 css 에서만 줄 끝). 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 넣어 준다(map.paramsByLesson). 2학기 — id 「k2」, map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u5_stem_hunt',
    title: '🔒 바뀌지 않는 부분 짚기',
    subtitle: '모양이 바뀐 낱말들을 나란히 놓고, 낱말마다 바뀌지 않는 부분을 모두 찾아 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l04', label: '5차시까지' },
        { v: 'l06', label: '7차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="st"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['stem_hunt'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
