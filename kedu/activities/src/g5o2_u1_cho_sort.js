/* src/g5o2_u1_cho_sort.js — 자음 단어 찾기 판 (5학년 2학기 사회 1단원 「유적과 유물로 살펴본 옛 사람들의 생활」 · l09·l12·l17·l20)
 * 장르: category_race(분류 릴레이) · 생성기: g5_2_cho_sort
 * 『사회』 68~69쪽 단원 마무리 「교실 놀이를 함께해요 — 자음 단어 찾기 놀이」의 놀이 판(주제 네 칸)을 반 릴레이로 —
 *   자음 표가 붙은 단어 카드 한 장을 보고, 놀이 판의 어느 주제 칸(선사 시대와 고조선 · 삼국과 가야 · 통일신라와 발해 · 고려)에 적을 단어인지 고른다.
 * 칸은 배운 것만 선다(생성기 categoriesFor) — 10차시까지 둘 · 12차시까지 셋 · 단원 전체 넷. 케이티처가 차시마다 범위를 넣어 준다(map.paramsByLesson).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「o2」 = 사회·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g5o2_u1_cho_sort',
    title: '🔤 자음 단어 찾기 판',
    subtitle: '자음으로 시작하는 단어 — 놀이 판의 어느 주제 칸에 적을까요?',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l09', label: '10차시까지' },
        { v: 'l12', label: '12차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="cho"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g5_2_cho_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: gen.categories,
        renderItem: function (q) { return '<span class="ctx"><span class="cho">' + esc(q.cho) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
