/* src/g1k_u1_jamo_sort.js — 자음자냐 모음자냐 (1학년 국어 1단원 글자를 만들어요 · l03·l13)
 * 장르: category_race(분류 릴레이) · 생성기: jamo_sort
 * 반 전체가 번호 순서로 나와 한 글자씩 「자음자」「모음자」 칸에 넣는다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1k_u1_jamo_sort',
    title: '🔠 자음자냐 모음자냐',
    subtitle: '나온 글자를 자음자 칸, 모음자 칸에 넣어요',
    defaults: { n: 10, runners: 20, shuffle: 0, pool: 'basic' },
    settings: [
      { key: 'pool', label: '글자', options: [{ v: 'basic', label: '기본 자모' }, { v: 'more', label: '여러 가지 모음자' }, { v: 'mix', label: '섞어서' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="cr"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['jamo_sort'].create({ pool: app.settings.pool }, app.rng);
      CategoryRace.run(app, gen, { categories: GENS['jamo_sort'].categories });
    }
  });
})();
