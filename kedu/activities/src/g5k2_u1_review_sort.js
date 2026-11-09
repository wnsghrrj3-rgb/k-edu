/* src/g5k2_u1_review_sort.js — 서평 조각 맞추기 (5학년 2학기 국어 1단원 「작품에 대한 의견을 나누어요」 · l10·l12·l14)
 * 장르: category_race(분류 릴레이) · 생성기: g5_2_review_sort
 * 반 전체가 번호 순서로 나와 서평의 한 문장씩을 「책 소개 · 줄거리 · 인상적인 부분과 까닭 · 책에 대한 평가」 네 칸에 넣는다(혼자 하기 = n 문항).
 * 『국어』 58~59쪽 「서평 알아보기」 — 투명 비닐을 덮고 서평에 들어갈 내용을 찾아 붙임 4 붙임딱지를 붙이던 활동을 반 릴레이로.
 * 범위(upto): l10 = 10·11차시(『호랑이를 부탁해』 서평 · 붙임 4 설명) · all = 단원 전체(점검하기 질문 · 마무리 『초록색 약속』 보기)
 *   — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g5k2_u1_review_sort',
    title: '📚 서평 조각 맞추기',
    subtitle: '서평의 한 문장 — 책 소개, 줄거리, 인상적인 부분과 까닭, 책에 대한 평가 가운데 어느 칸일까요?',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l10', label: '10·11차시 서평' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="rv"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g5_2_review_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g5_2_review_sort'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
