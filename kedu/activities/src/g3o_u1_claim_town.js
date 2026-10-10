/* src/g3o_u1_claim_town.js — 친구 말 판정: 살기 좋은 곳 (3학년 1학기 사회 1단원 · l11·l12)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_town  (claim_clue·과학 claim_* 와 같은 엔진·같은 무대)
 * 범위(upto): l11 = 11차시만 · all = 12차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3o_u1_claim_town',
    title: '🗣️ 친구 말 판정',
    subtitle: '곰이·펭이의 살기 좋은 동네 이야기가 맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l11', label: '11차시까지' },
        { v: 'all', label: '12차시까지' }] },
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
      var gen = GENS['claim_town'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
