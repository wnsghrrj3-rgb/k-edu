/* src/g4k_u1_sound_hunt.js — 해돋이는 [해도지] · [ㅈ]·[ㅊ]으로 바뀌는 낱말 찾기 (4학년 1학기 국어 1단원 「깊이 있게 읽어요」 l13 단원 마무리)
 * 장르: text_hunt(글 속 찾기 · 낱말 토큰) · 생성기: sound_hunt
 * 짧은 글을 읽고 받침 ㄷ·ㅌ 뒤에 ㅣ(→ [ㅈ]·[ㅊ])나 ㄷ 뒤에 히(→ [ㅊ])가 와서 소리가 바뀌는 어절을 모두 누른다.
 * 덫 = 받침 ㄷ·ㅌ 뒤에 다른 모음(같은 · 밭에) · 다른 받침 뒤에 ㅣ·히(먹이 · 막히다). 판정 전엔 모든 낱말이 같은 모습(답 미노출).
 * 소리는 풀이에만([해도지]) — 쓸 때는 글자대로(정본 s08). 줄 바꿈은 sep 토큰(이 활동 css 에서만 줄 끝). 범위는 l13 하나라 범위 칩이 없다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4k_u1_sound_hunt',
    title: '🔊 해돋이는 [해도지]',
    subtitle: '글을 읽고 [ㅈ]·[ㅊ]으로 소리가 바뀌는 낱말을 모두 찾아 눌러요! 받침 ㄷ·ㅌ 뒤에 ㅣ나 히가 오는지 먼저 봐요.',
    defaults: { n: 6 },
    settings: [
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="su"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['sound_hunt'].create({}, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
