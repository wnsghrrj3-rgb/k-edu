/* src/g4s2_u3_gas_sort.js — 온도 때문일까, 압력 때문일까? (4학년 2학기 과학 3단원 「여러 가지 기체」 · l04·l05·l11)
 * 장르: category_race · 생성기: g4_2_gas_sort
 * 지도서 267쪽 형성 평가 「온도에 따른 예 · 압력에 따른 예」와 『과학』 60~65쪽 장면을 반 릴레이로.
 * 범위(upto) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 2학기 활동 — id 의 「g4s2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g4s2_u3_gas_sort',
    title: '🎈 온도 때문일까, 압력 때문일까?',
    subtitle: '기체의 부피가 달라진 장면을 보고, 온도와 압력 가운데 무엇이 달라져서인지 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l04', label: '4차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="gas"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g4_2_gas_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g4_2_gas_sort'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
