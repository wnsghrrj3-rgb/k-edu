/* src/g3o_u2_clue_way.js — 어느 길로 알까? (3학년 1학기 사회 2단원 · l09·l12·l13·l14·l15·l18)
 * 장르: category_race(분류 릴레이) · 생성기: clue_way
 * 반 전체가 번호 순서로 나와 문장 하나씩, 밑줄 친 자료를 보고·읽고·듣고 아는 길 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto)는 l09 부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3o_u2_clue_way',
    title: '🔎 어느 길로 알까?',
    subtitle: '밑줄 친 자료로 옛 모습을 어떻게 알 수 있을까요? 보고·읽고·듣고 칸에 넣어요',
    defaults: { n: 10, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l09', label: '9차시까지' },
        { v: 'l13', label: '13차시까지' },
        { v: 'l14', label: '14차시까지' },
        { v: 'all', label: '15차시까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="cr" class="way"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['clue_way'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['clue_way'].categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
