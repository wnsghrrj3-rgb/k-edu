/* src/g1k2_u2_gyeop_fill.js — 분류 릴레이: 겹받침 채우기 (1학년 2학기 국어 2단원 「낱말을 정확하게 읽어요」 · l03 · l05 · l13 · l14)
 * 장르: category_race(분류 릴레이) · 생성기: g1_2_gyeop_fill
 * 교과서 49쪽 「낱말 쓰기 놀이」(글자판의 길을 따라가며 받침을 채워 문장 완성)를 반 전체 릴레이로 —
 * 번호 순서로 한 명씩 나와 받침 자리가 빈 글자(□)에 들어갈 겹받침 ㄺ·ㄼ·ㅀ·ㅄ 를 고른다(혼자 하기 = n 문항).
 * 범위(upto): l03 = 4차시까지 · l05 = 6차시까지 · all = 단원 전체 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g1k2_u2_gyeop_fill',
    title: '🧩 겹받침 채우기',
    subtitle: '받침 자리가 빈 글자에 알맞은 겹받침을 넣어 문장을 완성해요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '4차시까지' },
        { v: 'l05', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="gyeop"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g1_2_gyeop_fill'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g1_2_gyeop_fill'].categories,
        renderItem: function (q) {
          return '<span class="ctx">' + esc(q.pre) + '<span class="hole"><b>' + esc(q.hole) + '</b><i class="slot"></i></span>' + esc(q.post) + '</span>';
        }
      });
    }
  });
})();
