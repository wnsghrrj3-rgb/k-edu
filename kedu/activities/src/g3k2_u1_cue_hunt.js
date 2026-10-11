/* src/g3k2_u1_cue_hunt.js — 표지어 찾기 (3학년 2학기 국어 1단원 「경험과 관련지으며 이해해요」 l06·l11·l13)
 * 장르: text_hunt(글 속 찾기 · 낱말 토큰) · 생성기: cue_hunt
 * 안내 방송·대화·약속 글을 읽고 「중요한 내용이 온다」고 알려 주는 말(표지어)을 모두 누른다.
 * 덫 = 정본 l06 s06 watch — 「음, 그러니까」·「아까 뭐였더라」 같은 군말. 판정 전엔 모든 낱말이 같은 모습(답 미노출).
 * 줄 바꿈은 sep 토큰(이 활동 css 에서만 줄 끝) · 말한 사람 이름은 누를 수 없음(fixed).
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u1_cue_hunt',
    title: '👂 표지어 찾기',
    subtitle: '안내 말을 읽고 중요한 내용이 온다고 알려 주는 말을 모두 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l06', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="cue"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['cue_hunt'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
