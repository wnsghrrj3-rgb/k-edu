/* src/g4o2_u3_land_sort.js — 산일까, 들일까, 바다일까? (4학년 2학기 사회 3단원 「다양한 환경과 삶의 모습」 · l05·l06·l08)
 * 장르: category_race · 생성기: g4_2_land_sort
 * 『사회』 111~122쪽 산·들·바다 세 차시와 이용·개발의 영향을 반 릴레이로.
 * 범위(upto) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 2학기 활동 — id 의 「g4o2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g4o2_u3_land_sort',
    title: '⛰️ 산일까, 들일까, 바다일까?',
    subtitle: '자연환경과 사람들의 생활 모습을 보고, 어느 지역의 모습인지 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l05', label: '5차시까지' },
        { v: 'all', label: '주제① 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="ld"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g4_2_land_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g4_2_land_sort'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
