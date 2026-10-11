/* src/g3s2_u4_spread_sort.js — 무엇을 통해 옮을까? (3학년 2학기 과학 4단원 「감염병과 건강한 생활」 · l05(5·6차시)·l11)
 * 장르: category_race(분류 릴레이) · 생성기: spread_sort
 * 반 전체가 번호 순서로 나와 습관 하나씩, 밑줄 친 것이 감염병을 손이나 음식으로 옮기는지 기침이나 공기로 옮기는지 칸에 넣는다(혼자 하기 = n 문항).
 * 범위는 l05 하나라 범위 칩이 없다.
 * 2학기 활동 — id 의 「s2」 = 과학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3s2_u4_spread_sort',
    title: '🦠 무엇을 통해 옮을까?',
    subtitle: '밑줄 친 습관은 손이나 음식으로? 기침이나 공기로? 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0 },
    settings: [
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="spread"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['spread_sort'].create({}, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['spread_sort'].categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
