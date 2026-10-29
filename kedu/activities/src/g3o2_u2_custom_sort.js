/* src/g3o2_u2_custom_sort.js — 세시 풍속일까, 일상생활 속 풍습일까? (3학년 2학기 사회 2단원 「일상생활 속 풍습과 교통·통신」 · l01~l07 주제① 옛날과 오늘날의 풍습)
 * 장르: category_race(분류 릴레이) · 생성기: custom_sort
 * 반 전체가 번호 순서로 나와 풍습 한 줄씩, 밑줄 친 풍습을 보고 일상생활 속 풍습·세시 풍속 칸에 넣는다(혼자 하기 = n 문항).
 * 범위(upto): l01 = 2차시까지 · l02 = 3차시까지 · l03 = 5차시까지 · l04 = 7차시까지 · l05 = 8차시까지 · all = 주제① 전체 — 케이티처가 차시마다 넣어 준다(map.paramsByLesson).
 * 칸은 정본 l01 s07 두 동그라미 — 처음부터 둘 다 선다.
 * 2학기 활동 — id 의 「o2」 = 사회·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3o2_u2_custom_sort',
    title: '🎎 세시 풍속일까, 일상생활 속 풍습일까?',
    subtitle: '밑줄 친 풍습을 보고 일상생활 속 풍습·세시 풍속 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '2차시까지' },
        { v: 'l02', label: '3차시까지' },
        { v: 'l03', label: '5차시까지' },
        { v: 'l04', label: '7차시까지' },
        { v: 'l05', label: '8차시까지' },
        { v: 'all', label: '주제① 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="custom"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['custom_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: gen.categories,
        renderItem: function (q) { return '<span class="ctx">' + esc(q.pre) + '<span class="w">' + esc(q.w) + '</span>' + esc(q.post) + '</span>'; }
      });
    }
  });
})();
