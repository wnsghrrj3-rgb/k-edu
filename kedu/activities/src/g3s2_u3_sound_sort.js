/* src/g3s2_u3_sound_sort.js — 세기일까, 높낮이일까? (3학년 2학기 과학 3단원 「소리의 성질」 · l04·l09·l10)
 * 장르: category_race(분류 릴레이) · 생성기: sound_sort
 * 반 전체가 번호 순서로 나와 장면 하나씩, 밑줄 친 것이 바꾸는 것이 소리의 세기인지 높낮이인지 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto): l04 = 3·4차시 장면 · all = 9차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「s2」 = 과학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3s2_u3_sound_sort',
    title: '🎼 세기일까, 높낮이일까?',
    subtitle: '밑줄 친 것이 바꾸는 것은 소리의 세기? 소리의 높낮이? 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l04', label: '4차시까지' },
        { v: 'all', label: '9차시까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="sound"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['sound_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['sound_sort'].categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
