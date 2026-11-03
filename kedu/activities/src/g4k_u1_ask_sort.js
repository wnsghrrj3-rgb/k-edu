/* src/g4k_u1_ask_sort.js — 어떤 질문일까? (4학년 1학기 국어 1단원 「깊이 있게 읽어요」 · l07·l09·l13)
 * 장르: category_race(분류 릴레이) · 생성기: ask_sort
 * 반 전체가 번호 순서로 나와 글을 읽으며 떠올린 질문 하나씩을 네 갈래(낱말의 뜻·이어질 내용·내 경험·더 궁금한 점)와
 * 「내용과 상관없음」 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto): l07 = 8차시까지(옹기 글) · all = 단원 전체(씨앗 글 · 마무리) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 1학기 활동 — id 에 학기 표지 없음(D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g4k_u1_ask_sort',
    title: '❓ 어떤 질문일까?',
    subtitle: '질문에 무엇이 담겼는지 보고 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '8차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="ask"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['ask_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['ask_sort'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
