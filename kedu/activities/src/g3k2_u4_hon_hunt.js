/* src/g3k2_u4_hon_hunt.js — 높임 표현 고칠 곳 찾기 (3학년 2학기 국어 4단원 「서로 존중하며 대화해요」 l03 · l05 · l14)
 * 장르: text_hunt(글 속 찾기 · 낱말 토큰) · 생성기: hon_hunt
 * 쪽지·대화 글을 읽고 높임 표현을 고쳐야 할 어절(물건을 높인 말 · 웃어른을 안 높인 말 · 낮춘 말끝 · 옮기며 빠진 높임)을 모두 누른다.
 * 덫 = 바르게 높인 말(께서·께·‑시‑·높임 낱말·말끝) — 정본 l03 s08 「많이 붙일수록 공손」 · l05 「계셔」(친구에게 옮긴 말). 판정 전엔 모든 낱말이 같은 모습(답 미노출).
 * 줄 바꿈은 sep 토큰(이 활동 css 에서만 줄 끝). 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 넣어 준다(map.paramsByLesson). 2학기 — id 「k2」, map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u4_hon_hunt',
    title: '🙇 높임 표현 고칠 곳 찾기',
    subtitle: '글을 읽고 높임 표현을 고쳐야 할 곳을 모두 찾아 눌러요! 바르게 높인 말은 그대로 두어요.',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '4차시까지' },
        { v: 'l05', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="ho"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['hon_hunt'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
