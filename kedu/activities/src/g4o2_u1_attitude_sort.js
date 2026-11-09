/* src/g4o2_u1_attitude_sort.js — 어떤 태도일까? (4학년 2학기 사회 1단원 「민주주의와 자치」 · l03·l04·l05·l07)
 * 장르: category_race · 생성기: g4_2_attitude_sort
 * 『사회』 16~17쪽 학급 회의 · 지도서 39쪽 활동지 「태도를 찾아 선으로 이어 봅시다」를 반 릴레이로.
 * 범위(upto) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 2학기 활동 — id 의 「g4o2」, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g4o2_u1_attitude_sort',
    title: '🗳️ 어떤 태도일까?',
    subtitle: '회의와 학교생활의 모습을 보고, 민주주의를 실천하는 어떤 태도인지 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'all', label: '주제① 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="dm"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g4_2_attitude_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g4_2_attitude_sort'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
