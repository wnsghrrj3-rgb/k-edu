/* src/g4k2_u4_stage_sort.js — 읽기 전? 읽는 중? 읽은 뒤? (4학년 2학기 국어 4단원 「책 속의 길을 따라」 · l07·l11·l13)
 * 장르: category_race(분류 릴레이) · 생성기: g4_2_stage_sort
 * 반 전체가 번호 순서로 나와 읽기 과정의 활동이나 되돌아보는 질문 하나씩을 「읽기 전」·「읽기 중」·「읽기 후」 세 칸에 넣는다(혼자 하기 = n 문항).
 * 『국어』 200쪽 1번(보기 가~아를 읽기 전·중·후에)·202쪽 4번(붙임딱지 질문 표)을 반 릴레이로 — 209·215쪽 질문·도움말과 219쪽 질문 카드까지.
 * 범위(upto): l07 = 8차시까지(200~203쪽 · 「화살나무를 아시나요?」) · all = 단원 전체(「약, 잘 쓰고 잘 버리는 방법」·「저작권을 왜 지켜야 하나요?」·질문 카드)
 *   — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g4k2_u4_stage_sort',
    title: '📖 읽기 전? 읽는 중? 읽은 뒤?',
    subtitle: '읽기 과정에서 하는 일이나 되돌아보는 질문이 읽기 전·중·후 가운데 언제인지 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '8차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="ss"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g4_2_stage_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g4_2_stage_sort'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
