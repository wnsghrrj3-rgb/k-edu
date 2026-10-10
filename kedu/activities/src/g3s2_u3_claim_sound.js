/* src/g3s2_u3_claim_sound.js — 친구 말 판정: 소리의 성질 (3학년 2학기 과학 3단원 · l05 · l06 · l07 · l09)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_sound  (과학 claim_*·사회 claim_* 와 같은 엔진·같은 무대)
 * 범위(upto): l05·l06·l07 = 그 차시까지 누적 · all = 9차시까지(l09 음향 카메라·l10 마무리) — l04 세기·높낮이는 sound_sort 자리 · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3s2_u3_claim_sound',
    title: '🗣️ 친구 말 판정',
    subtitle: '곰이·펭이의 소리 전달·소음·음향 카메라 이야기가 맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'l07', label: '8차시까지' },
        { v: 'all', label: '9차시까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 10, label: '10' }] }
    ],
    stageHtml:
      '<div id="cj">' +
        '<div id="cj-scene"></div>' +
        '<div id="cj-card"><div id="cj-speaker"><span id="cj-face"></span><span id="cj-who"></span></div>' +
        '<div id="cj-say"></div></div>' +
        '<div id="cj-verdict"></div>' +
        '<div id="cj-step"></div>' +
        '<div id="cj-why"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['claim_sound'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
