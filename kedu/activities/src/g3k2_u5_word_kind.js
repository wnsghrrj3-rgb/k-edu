/* src/g3k2_u5_word_kind.js — 이름일까, 움직임일까, 성질이나 상태일까? (3학년 2학기 국어 5단원 「사전으로 여는 세상」 · l02·l06·l10·l12·l14)
 * 장르: category_race(분류 릴레이) · 생성기: word_kind
 * 반 전체가 번호 순서로 나와 낱말 하나씩, 이름·움직임·성질이나 상태 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto): l02 = 3차시까지 · l06 = 7차시까지 · l10 = 11차시까지 · all = 단원 전체 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3k2_u5_word_kind',
    title: '🏷️ 이름일까, 움직임일까, 성질이나 상태일까?',
    subtitle: '낱말을 틀에 넣어 읽어 보고 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '3차시까지' },
        { v: 'l06', label: '7차시까지' },
        { v: 'l10', label: '11차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="kind"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['word_kind'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['word_kind'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
