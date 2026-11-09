/* src/g5s2_u1_split_sort.js — 어떻게 분리할까? (5학년 2학기 과학 1단원 「혼합물의 분리」 · l04·l05·l07·l10)
 * 장르: category_race(분류 릴레이) · 생성기: g5_2_split_sort
 * 반 전체가 번호 순서로 나와 혼합물 하나씩을 「체 · 스포이트·흡착포 · 거름과 증발」 칸에 넣는다(혼자 하기 = n 문항).
 * 지도서 단원 평가 「성질 → 도구」(알갱이의 크기가 다른 성질 → 체 · 섞이지 않고 분리되는 성질 → 스포이트 · 물에 녹는 성질 → 거름·증발)와
 *   『과학』 3~6차시 탐구 · 7차시 생활 속 장치를 반 릴레이로. 칸은 배운 것만(4차시까지 둘 · 5차시부터 셋 — 생성기 categoriesFor).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「s2」 = 과학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g5s2_u1_split_sort',
    title: '🧪 어떻게 분리할까?',
    subtitle: '혼합물의 성질을 보고 — 체, 스포이트·흡착포, 거름과 증발 가운데 무엇으로 분리할까요?',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l04', label: '4차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="sp"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g5_2_split_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: gen.categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
