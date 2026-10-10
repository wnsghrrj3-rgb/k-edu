/* src/g3s2_u1_state_sort.js — 고체일까, 액체일까, 기체일까? (3학년 2학기 과학 1단원 「물체와 물질」 · l06·l07·l11)
 * 장르: category_race(분류 릴레이) · 생성기: state_sort
 * 반 전체가 번호 순서로 나와 문장 하나씩, 밑줄 친 물질을 고체·액체·기체 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto): l06 = 6차시만 · all = 7차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 첫 활동 — id 의 「s2」 = 과학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3s2_u1_state_sort',
    title: '🎈 고체일까, 액체일까, 기체일까?',
    subtitle: '밑줄 친 물질을 보고 고체·액체·기체 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l06', label: '6차시까지' },
        { v: 'all', label: '7차시까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="state"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['state_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['state_sort'].categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
