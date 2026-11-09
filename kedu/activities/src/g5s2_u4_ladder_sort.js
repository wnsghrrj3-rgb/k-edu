/* src/g5s2_u4_ladder_sort.js — 에너지 이용 놀이 (5학년 2학기 과학 4단원 「자원과 에너지」 · l05·l06·l10)
 * 장르: category_race(분류 릴레이) · 생성기: g5_2_ladder_sort
 * 『과학』 5차시 「친구와 함께 에너지 이용 놀이를 해 봅시다」(지도서 365쪽) — 도착한 칸이 에너지를 지속가능하게 이용한 예이면 🪜 사다리 위로,
 *   낭비하거나 함부로 이용한 예이면 🛝 미끄럼틀 아래로. 반 전체가 번호 순서로 나와 놀이판 칸 글 하나씩을 두 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto): l05 = 5차시 놀이판 · all = 단원 전체(+ 6·7차시 효율적인 이용 방법) — 케이티처가 차시마다 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「s2」 = 과학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g5s2_u4_ladder_sort',
    title: '🪜 에너지 이용 놀이',
    subtitle: '도착한 칸 — 에너지를 지속가능하게 쓰면 사다리 위로, 낭비하면 미끄럼틀 아래로!',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l05', label: '5차시 놀이판' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="lad"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g5_2_ladder_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g5_2_ladder_sort'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
