/* src/g4s2_u4_climate_hunt.js — 기후 지킴이 글 속 찾기 (4학년 2학기 과학 4단원 「기후 변화와 우리 생활」 · l03·l06·l07·l10)
 * 장르: text_hunt · 생성기: g4_2_climate_hunt
 * 『과학』 84~85쪽 인간의 활동 · 90~91쪽 대응 방법 · 더 생각해요(학교에서 실천)를 글 속 찾기로.
 * 범위(upto) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 2학기 활동 — id 의 「g4s2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4s2_u4_climate_hunt',
    title: '🌏 기후 지킴이 글 속 찾기',
    subtitle: '짧은 글을 읽고 물음에 맞는 곳을 모두 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '3차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="clm"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['g4_2_climate_hunt'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
