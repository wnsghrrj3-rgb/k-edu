/* src/g3o_u1_help_sort.js — 어떤 일을 하는 곳? (3학년 1학기 사회 1단원 · l07·l08·l13)
 * 장르: category_race(분류 릴레이) · 생성기: help_place
 * 반 전체가 번호 순서로 나와 문장 하나씩, 밑줄 친 하는 일을 보고 안전·건강·배움·즐거움 무리에 넣는다(혼자 하기 = n 문항).
 * 범위(upto)는 l07 부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3o_u1_help_sort',
    title: '🚒 어떤 일을 하는 곳?',
    subtitle: '밑줄 친 하는 일을 보고 안전·건강·배움·즐거움 무리에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '7차시까지' },
        { v: 'all', label: '8차시까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="help"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['help_place'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['help_place'].categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
