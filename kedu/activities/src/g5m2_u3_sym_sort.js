/* src/g5m2_u3_sym_sort.js — 대칭 네 갈래 분류 (5학년 2학기 수학 3단원 「합동과 대칭」 · l04·l07·l08·l11)
 * 장르: category_race(분류 릴레이) · 생성기: g5_2_sym_sort
 * 반 전체가 번호 순서로 나와 교과서 분류 판의 도형 하나씩을 칸에 넣는다(혼자 하기 = n 문항).
 * 칸은 차시마다 교과서 말 그대로 — 60쪽(선대칭도형인지) · 67쪽(점대칭도형인지) · 단원 전체(76쪽 문제로 마무리 2 · 지도서 242 —
 *   선대칭도형만 / 점대칭도형만 / 둘 다 / 둘 다 아님) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「m2」 = 수학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g5m2_u3_sym_sort',
    title: '🦋 대칭 네 갈래 분류',
    subtitle: '도형을 접어 보고 180° 돌려 보아 선대칭도형인지, 점대칭도형인지 알맞은 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l04', label: '4차시 — 선대칭도형인지' },
        { v: 'l07', label: '7차시 — 점대칭도형인지' },
        { v: 'all', label: '단원 전체 — 네 갈래' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="sy"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var G = GENS['g5_2_sym_sort'];
      var gen = G.create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: G.categoriesFor(app.settings.upto),
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span>' + q.svg + '</span>'; }
      });
    }
  });
})();
