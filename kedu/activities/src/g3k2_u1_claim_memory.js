/* src/g3k2_u1_claim_memory.js — 친구 말 판정: 경험과 관련지으며 이해해요 (3학년 2학기 국어 1단원 · l01 · l02 · l04)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_memory  (과학 claim_*·사회 claim_* 와 같은 엔진·같은 무대 — 국어 첫 claim)
 * 범위(upto): l01·l02 = 그 차시까지 누적 · all = 5차시까지(l04 이야기 감상·l13 마무리) — l06 이후 간추리기는 cue_hunt·echo_order 자리 · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u1_claim_memory',
    title: '🗣️ 친구 말 판정',
    subtitle: '곰이·펭이가 떠올린 경험과 짐작한 마음이 알맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '1차시까지' },
        { v: 'l02', label: '3차시까지' },
        { v: 'all', label: '5차시까지' }] },
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
      var gen = GENS['claim_memory'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
