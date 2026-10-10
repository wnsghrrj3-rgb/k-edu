/* src/g3s2_u1_claim_matter.js — 친구 말 판정: 물체와 물질 (3학년 2학기 과학 1단원 · l01~l04 · l08)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_matter  (과학 claim_*·사회 claim_* 와 같은 엔진·같은 무대)
 * 범위(upto): l01~l04 = 그 차시까지 누적 · all = 9차시까지(l08 설계·l11 마무리) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3s2_u1_claim_matter',
    title: '🗣️ 친구 말 판정',
    subtitle: '곰이·펭이의 물체·물질 이야기가 맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '1차시까지' },
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
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
      var gen = GENS['claim_matter'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
