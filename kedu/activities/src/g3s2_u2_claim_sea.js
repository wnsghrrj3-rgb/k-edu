/* src/g3s2_u2_claim_sea.js — 친구 말 판정: 지구와 바다 (3학년 2학기 과학 2단원 · l02 · l07 · l08 · l10)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_sea  (과학 claim_*·사회 claim_* 와 같은 엔진·같은 무대)
 * 범위(upto): l02·l07·l08 = 그 차시까지 누적 · all = 10차시까지(l10 바다 자원·l11 마무리) — l03~l06 은 observe_sea 자리 · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3s2_u2_claim_sea',
    title: '🗣️ 친구 말 판정',
    subtitle: '곰이·펭이의 공기·갯벌·바다 이야기가 맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l07', label: '7차시까지' },
        { v: 'l08', label: '9차시까지' },
        { v: 'all', label: '10차시까지' }] },
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
      var gen = GENS['claim_sea'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
