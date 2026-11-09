/* src/g4k2_u1_real_sort.js — 현실과 같을까, 꾸며 썼을까? (4학년 2학기 국어 1단원 「비교하며 읽어요」 · l02·l04·l14)
 * 장르: category_race(분류 릴레이) · 생성기: g4_2_real_sort
 * 반 전체가 번호 순서로 나와 작품 속 장면 하나씩을 「현실과 비슷한 모습」·「꾸며 쓴 모습」 두 칸에 넣는다(혼자 하기 = n 문항).
 * 『국어』 41쪽 4번 (2)·61쪽 (1)번 「작품에 나타난 모습과 현실의 모습을 비교해 비슷한 점과 다른 점」 표를 반 릴레이로.
 * 범위(upto): l02 = 3차시까지(「심청전」·옛이야기 셋·「스펀지 교실」) · all = 단원 전체(「언제나 다정 죽집」·평가 자료·「비밀의 무게」)
 *   — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g4k2_u1_real_sort',
    title: '🌍 현실과 같을까, 꾸며 썼을까?',
    subtitle: '작품 속 장면이 우리 현실과 비슷한지, 글쓴이가 꾸며 쓴 것인지 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '3차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="rs"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g4_2_real_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g4_2_real_sort'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
