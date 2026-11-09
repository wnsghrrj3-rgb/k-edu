/* src/g5s2_u3_heat_sort.js — 열은 어떻게 이동할까? (5학년 2학기 과학 3단원 「열과 우리 생활」 · l05·l07·l08·l12)
 * 장르: category_race(분류 릴레이) · 생성기: g5_2_heat_sort
 * 반 전체가 번호 순서로 나와 장면 하나씩을 「전도 · 대류 · 복사」 칸에 넣는다(혼자 하기 = n 문항).
 * 『과학』 74~75쪽 8차시 「여러 방식으로 이동하는 열」 — 4·5·6·7차시에서 배운 세 방식을 생활 장면으로 견주는 반 릴레이.
 *   칸은 배운 것만(6차시까지 둘 · 7차시부터 셋 — 생성기 categoriesFor).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「s2」 = 과학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g5s2_u3_heat_sort',
    title: '🌡️ 열은 어떻게 이동할까?',
    subtitle: '생활 속 장면 — 열이 전도, 대류, 복사 가운데 어떤 방식으로 이동할까요?',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l05', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="ht"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g5_2_heat_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: gen.categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
