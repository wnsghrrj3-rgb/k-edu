/* src/g6o2_u1_climate_sort.js — 기후 박람회 전시관 나누기 (6학년 2학기 사회 1단원 「세계의 자연환경」 · l11·l12·l14)
 * 장르: category_race · 생성기: g6_2_climate_sort
 * 『사회』 34~49쪽 여섯 기후 지역의 생활 모습을 기후 박람회 전시관(지도서 70쪽 프로젝트) 칸으로 반 릴레이.
 * 범위(upto) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 2학기 활동 — id 의 「g6o2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g6o2_u1_climate_sort',
    title: '🌏 기후 박람회 전시관 나누기',
    subtitle: '세계 여러 기후 지역의 생활 모습을 보고, 어느 기후 전시관에 놓을지 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l11', label: '11차시까지' },
        { v: 'all', label: '13차시까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="cl"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g6_2_climate_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g6_2_climate_sort'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
