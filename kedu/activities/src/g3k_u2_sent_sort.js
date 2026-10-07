/* src/g3k_u2_sent_sort.js — 뒷부분은 어느 갈래? (3학년 1학기 국어 2단원 「분명하고 유창하게」 · l02·l05·l14)
 * 장르: category_race(분류 릴레이) · 생성기: sent_sort
 * 반 전체가 번호 순서로 나와 문장 하나씩 「어찌하다」「어떠하다」「무엇이다」 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3k_u2_sent_sort',
    title: '✂️ 뒷부분은 어느 갈래?',
    subtitle: '문장의 뒷부분을 보고 어찌하다·어떠하다·무엇이다 칸에 넣어요',
    defaults: { n: 10, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '4차시까지' },
        { v: 'l05', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="cr" class="sent"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['sent_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['sent_sort'].categories,
        renderItem: function (q) { return '<span class="sa">' + esc(q.a) + '</span><span class="sb">' + esc(q.b) + '</span>'; }
      });
    }
  });
})();
