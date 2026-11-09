/* src/g5k2_u5_clue_hunt.js — 단서와 함축된 표현 찾기 (5학년 2학기 국어 5단원 「추론하며 읽어요」 · l02·l04·l07·l09·l14)
 * 장르: text_hunt(글 속 찾기 · 덩이 토큰 · fixed 줄) · 생성기: g5_2_clue_hunt
 * 『국어』 215쪽 「투명 비닐을 덮으면 색으로 표시되는 문장」 단서 찾기 · 224쪽 생략된 내용 추론 단서 ①② · 230~233쪽 「인류, 책, 도서관」 함축된 표현
 *   · 243쪽 「사라, 버스를 타다」 붙임 11 — 📋 질문과 추론한 내용(또는 표현의 뜻)을 보고, 단서 덩이 · 그 뜻이 함축된 표현 덩이를 모두 누른다.
 * 범위(upto): l02 = 3차시까지 · l04 = 6차시까지 · l07 = 8차시까지 · all = 단원 전체 — 케이티처가 차시마다 넣어 준다(map.paramsByLesson).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g5k2_u5_clue_hunt',
    title: '🔍 단서와 함축된 표현 찾기',
    subtitle: '추론한 내용이나 뜻을 보고, 글에서 단서나 그 뜻이 숨은 표현을 모두 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '3차시까지' },
        { v: 'l04', label: '6차시까지' },
        { v: 'l07', label: '8차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="ch"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['g5_2_clue_hunt'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
