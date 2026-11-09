/* src/g4m2_u2_quad_sort.js — 사각형 분류 경주 (4학년 2학기 수학 2단원 「사각형」 · l05·l06·l07·l08·l10)
 * 장르: category_race(분류 릴레이) · 생성기: g4_2_quad_sort
 * 반 전체가 번호 순서로 나와 교과서 분류 판의 사각형 하나씩을 칸에 넣는다(혼자 하기 = n 문항).
 * 칸은 차시마다 교과서 표 머리 그대로 — 38쪽(평행한 변이 있는/없는) · 40쪽(없는/한 쌍인/두 쌍인) · 42쪽(네 변이 모두 같은/길이가 다른 변이 있는)
 *   · 단원 전체(51쪽 만화 — 평행한 변의 수) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「m2」 = 수학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g4m2_u2_quad_sort',
    title: '🔷 사각형 분류 경주',
    subtitle: '모눈 위 사각형을 보고 평행한 변의 수나 변의 길이에 따라 알맞은 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l05', label: '5차시 — 평행한 변이 있는지' },
        { v: 'l06', label: '6차시 — 평행한 변이 몇 쌍인지' },
        { v: 'l07', label: '7차시 — 네 변의 길이' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="qs"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var G = GENS['g4_2_quad_sort'];
      var gen = G.create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: G.categoriesFor(app.settings.upto),
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span>' + q.svg + '</span>'; }
      });
    }
  });
})();
