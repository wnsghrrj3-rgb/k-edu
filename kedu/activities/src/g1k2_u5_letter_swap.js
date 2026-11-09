/* src/g1k2_u5_letter_swap.js — 글 속 찾기: 한 자리만 바꾼 낱말 찾기 (1학년 2학기 국어 5단원 「생각을 키워요」 · l04 · l12)
 * 장르: text_hunt(글 속 찾기 · 낱말 토큰 — 엔진 v1.1.0 fixed) · 생성기: g1_2_letter_swap
 * 맨 위 바탕 글자(누를 수 없음) 아래 낱말 여섯 — 『국어』 153쪽 표처럼 「첫 자음자만 · 모음자만 · 받침만 · 한 자리만」 바꾼 낱말을 모두 누른다.
 * 판정 전엔 모든 낱말이 같은 모습(답 미노출). 범위 하나(l04 · l12 마무리) — 범위 칩 없음.
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1k2_u5_letter_swap',
    title: '🔤 한 자리만 바꾼 낱말 찾기',
    subtitle: '글자 하나에서 첫 자음자·모음자·받침 가운데 한 자리만 바꾸면 뜻이 다른 낱말이 돼요. 바꾼 낱말을 모두 찾아요!',
    defaults: { n: 6 },
    settings: [
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="swap"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['g1_2_letter_swap'].create({}, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
