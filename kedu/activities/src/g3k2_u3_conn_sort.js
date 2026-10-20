/* src/g3k2_u3_conn_sort.js — 그리고일까, 그러나일까, 그래서일까? (3학년 2학기 국어 3단원 「정확하게 글을 써요」 · l07·l10·l12·l14)
 * 장르: category_race(분류 릴레이) · 생성기: conn_sort
 * 반 전체가 번호 순서로 나와 「앞 문장. (　　　) 뒤 문장.」 하나씩, 빈칸에 알맞은 이어 주는 말 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto): l07 = 8차시까지 · l10 = 11차시까지 · l12 = 13차시까지 · all = 단원 전체 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3k2_u3_conn_sort',
    title: '🔗 그리고일까, 그러나일까, 그래서일까?',
    subtitle: '빈칸에 알맞은 이어 주는 말은? 앞뒤 뜻을 보고 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '8차시까지' },
        { v: 'l10', label: '11차시까지' },
        { v: 'l12', label: '13차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="conn"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['conn_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['conn_sort'].categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
