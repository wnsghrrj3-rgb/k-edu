/* src/g5m2_u6_fair_claim.js — 친구 말 판정: 평균과 가능성 (5학년 2학기 수학 6단원 · l02~l08)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: g5_2_fair_claim  (과학·사회·국어·6-2 수학 claim_* 와 같은 엔진·같은 무대)
 * 범위(upto): l02~l07 = 그 차시까지 누적 · all = 9차시까지(l08 해결하는 수학 산불 · l09 문제로 마무리) · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 5학년 = 인물 없이 — 화자는 「친구」·「짝꿍」.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g5m2_u6_fair_claim',
    title: '🗣️ 친구 말 판정',
    subtitle: '평균으로 견주기·유리한 회전판 고르기 이야기가 맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
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
      var gen = GENS['g5_2_fair_claim'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
