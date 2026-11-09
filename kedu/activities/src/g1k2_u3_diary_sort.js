/* src/g1k2_u3_diary_sort.js — 분류 릴레이: 그림일기 조각 나누기 (1학년 2학기 국어 3단원 「그림일기를 써요」 · l08 · l10 · l14)
 * 장르: category_race(분류 릴레이) · 생성기: g1_2_diary_sort
 * 그림일기 한 장(맨 위 날짜와 요일·날씨, 아래 글)에서 밑줄 친 조각이 무엇을 쓴 곳인지 — 날짜와 요일 · 날씨 · 경험한 일 · 생각이나 느낌 —
 * 칸에 넣는다(『국어』 97쪽 2번 「그림일기에 들어갈 내용」). 반 전체가 번호 순서로 한 조각씩(혼자 하기 = n 문항).
 * 범위(upto): l08 = 9차시까지 · all = 단원 전체 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function piece(t, q) { return '<span class="dy-p' + (t === q.w ? ' w' : '') + '">' + esc(t) + '</span>'; }
  ACore.create({
    activityId: 'g1k2_u3_diary_sort',
    title: '📔 그림일기 조각 나누기',
    subtitle: '밑줄 친 곳은 그림일기의 무엇일까요? 알맞은 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l08', label: '9차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="diary"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g1_2_diary_sort'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g1_2_diary_sort'].categories,
        renderItem: function (q) {
          var d = q.diary;
          return '<div class="dy"><div class="dy-top">' + piece(d.date, q) + piece(d.weather, q) + '</div>' +
                 '<div class="dy-pic">🖍️</div>' +
                 '<div class="dy-txt">' + d.lines.map(function (t) { return piece(t, q); }).join(' ') + '</div></div>';
        }
      });
    }
  });
})();
