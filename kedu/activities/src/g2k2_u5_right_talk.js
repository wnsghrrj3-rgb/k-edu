/* src/g2k2_u5_right_talk.js — 바르게 말한 친구 찾기 (2학년 2학기 국어 5단원 「바른 말로 이야기 나누어요」 l03 · l05 · l14)
 * 장르: text_hunt(글 속 찾기 · 문장 토큰) · 생성기: g2_2_right_talk
 * 『국어』 146쪽 「바르게 말한 사람 찾기 놀이」 — 모둠 친구 넷이 한 문장씩 읽고, 헷갈리는 낱말(작다·적다 · 다르다·틀리다 ·
 * 잃어버리다·잊어버리다 · 가르치다·가리키다 · 바라다·바래다)을 바르게 쓴 친구의 문장을 모두 누른다.
 * 이름은 누를 수 없는 조각(fixed) · 문장 하나가 누르는 자리 · 판정 전엔 모든 문장이 같은 모습(답 미노출).
 * 줄 바꿈은 sep 토큰(이 활동 css 에서만 줄 끝). 범위 칩 없음. 2학기 활동 — id 의 「k2」, map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2k2_u5_right_talk',
    title: '🗣️ 바르게 말한 친구 찾기',
    subtitle: '친구 넷이 한 문장씩 읽었어요. 헷갈리는 낱말을 바르게 쓴 친구의 문장을 모두 찾아 눌러요! 낱말의 뜻을 먼저 떠올려요.',
    defaults: { n: 6 },
    settings: [
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="rt"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['g2_2_right_talk'].create({}, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
