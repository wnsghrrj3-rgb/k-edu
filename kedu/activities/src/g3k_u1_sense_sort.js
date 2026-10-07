/* src/g3k_u1_sense_sort.js — 어떤 감각일까? (3학년 1학기 국어 1단원 「생생하게 표현해요」 · l01·l02·l04·l13)
 * 장르: category_race(분류 릴레이) · 생성기: sense_sort
 * 반 전체가 번호 순서로 나와 감각적 표현 하나씩 다섯 감각 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3k_u1_sense_sort',
    title: '👀 어떤 감각일까?',
    subtitle: '밑줄 친 표현이 눈·귀·코·입·손 가운데 어디로 느낀 것인지 칸에 넣어요',
    defaults: { n: 10, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '1차시까지' },
        { v: 'l02', label: '3차시까지' },
        { v: 'l04', label: '5차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="cr" class="sense"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['sense_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['sense_sort'].categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
