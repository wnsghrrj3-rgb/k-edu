/* src/g3k2_u2_show_sort.js — 색일까, 크기일까, 모양일까? (3학년 2학기 국어 2단원 「유창하게 읽고 발표해요」 · l07·l08·l13)
 * 장르: category_race(분류 릴레이) · 생성기: show_sort
 * 반 전체가 번호 순서로 나와 안내·발표 자료 하나씩, 밑줄 친 일을 하려면 색·크기·모양 가운데 무엇을 쓸지 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto): l07 = 7차시 자료 · all = 10차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3k2_u2_show_sort',
    title: '🎨 색일까, 크기일까, 모양일까?',
    subtitle: '밑줄 친 일을 하려면 무엇을 쓸까요? 색·크기·모양 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '7차시까지' },
        { v: 'all', label: '10차시까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="show"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['show_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['show_sort'].categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
