/* src/g3o2_u1_change_sort.js — 어떤 사회 변화일까? (3학년 2학기 사회 1단원 「사회 변화와 다양한 문화」 · l03·l04·l05·l06·l12)
 * 장르: category_race(분류 릴레이) · 생성기: change_sort
 * 반 전체가 번호 순서로 나와 문장(또는 딩고 카드) 하나씩, 밑줄 친 곳을 보고 저출산·고령화·지능정보화·세계화 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto): l03 = 4차시까지 · l04 = 6차시까지 · l05 = 7차시까지 · l06 = 8차시까지 · all = 단원 전체(딩고 카드까지) — 케이티처가 차시마다 넣어 준다(map.paramsByLesson).
 * 칸은 배운 것만 선다(생성기 categoriesFor) — 4차시까지는 둘, 6차시까지는 셋, 7차시부터 넷.
 * 2학기 활동 — id 의 「o2」 = 사회·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3o2_u1_change_sort',
    title: '🔄 어떤 사회 변화일까?',
    subtitle: '밑줄 친 곳을 보고 저출산·고령화·지능정보화·세계화 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '4차시까지' },
        { v: 'l04', label: '6차시까지' },
        { v: 'l05', label: '7차시까지' },
        { v: 'l06', label: '8차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="change"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['change_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: gen.categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
