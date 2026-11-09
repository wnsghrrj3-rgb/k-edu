/* src/g5k2_u6_script_sort.js — 해설일까, 대사일까, 지문일까? (5학년 2학기 국어 6단원 「작품을 감상해요」 · l07·l09·l11·l15)
 * 장르: category_race(분류 릴레이) · 생성기: g5_2_script_sort
 * 반 전체가 번호 순서로 나와 극본 조각 하나씩을 「해설 · 대사 · 지문」 세 칸에 넣는다(혼자 하기 = n 문항).
 * 『국어』 278쪽 3번 「극본의 구성 요소를 알아봅시다」 — 「까막골 보임누리꽃의 비밀」 · 「샬럿의 거미줄」 조각을 반 릴레이로.
 * 범위(upto): l07 = 7·8차시(까막골) · all = 단원 전체(+ 샬럿의 거미줄) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g5k2_u6_script_sort',
    title: '🎭 해설일까, 대사일까, 지문일까?',
    subtitle: '극본의 한 조각 — 때·곳을 알려 주는 해설일까, 인물이 하는 대사일까, 행동을 알려 주는 지문일까요?',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '8차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="sc"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g5_2_script_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g5_2_script_sort'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span><span class="w">' + esc(q.w) + '</span></span>'; }
      });
    }
  });
})();
