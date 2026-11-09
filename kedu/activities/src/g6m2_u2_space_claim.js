/* src/g6m2_u2_space_claim.js — 친구 말 판정: 공간과 입체 (6학년 2학기 수학 2단원 · l02~l11)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: g6_2_space_claim  (과학·사회·국어 claim_* 와 같은 엔진·같은 무대)
 * 범위(upto): l02~l10 = 그 차시까지 누적 · all = 11차시까지(l11 생각이 반짝 수학·l12 문제로 마무리) · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 6학년 = 인물 없이 — 화자는 「친구」·「짝꿍」.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g6m2_u2_space_claim',
    title: '🗣️ 친구 말 판정',
    subtitle: '여러 방향에서 본 모양·쌓기나무 개수·쌓은 모양 이야기가 맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'l07', label: '7차시까지' },
        { v: 'l08', label: '8차시까지' },
        { v: 'l09', label: '9차시까지' },
        { v: 'l10', label: '10차시까지' },
        { v: 'all', label: '11차시까지' }] },
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
      var gen = GENS['g6_2_space_claim'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
