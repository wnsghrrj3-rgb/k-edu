/* src/g3o_u2_time_sort.js — 언제일까? (3학년 1학기 사회 2단원 「일상에서 만나는 과거」 · l01·l02·l06)
 * 장르: category_race(분류 릴레이) · 생성기: time_sort · 케이티처 사회 첫 활동(과목 약자 o — §12-1)
 * 반 전체가 번호 순서로 나와 문장 하나씩, 밑줄 친 때를 나타내는 말을 과거·현재·미래 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3o_u2_time_sort',
    title: '⏳ 언제일까?',
    subtitle: '밑줄 친 말이 이미 지나간 때인지, 지금인지, 아직 오지 않은 때인지 칸에 넣어요',
    defaults: { n: 10, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '1차시까지' },
        { v: 'l02', label: '2차시까지' },
        { v: 'all', label: '6차시까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="cr" class="time"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cr-arrow" aria-hidden="true">과거 → 현재 → 미래</div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['time_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['time_sort'].categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
