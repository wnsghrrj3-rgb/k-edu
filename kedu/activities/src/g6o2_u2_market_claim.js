/* src/g6o2_u2_market_claim.js — 친구 말 판정: 시장경제와 국가 간 거래 (6학년 2학기 사회 2단원 · l02~l17)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: g6_2_market_claim  (과학·사회·국어·수학 claim_* 와 같은 엔진·같은 무대)
 * 틀 = 『사회』 116~117쪽 교실 놀이 「스파이를 찾아라」(거짓인 문장 찾기) · 77·111쪽 「재미있게 확인해요」.
 * 범위(upto): l02~l15 = 그 차시까지 누적 · all = 18차시까지(l19 생각을 펼쳐요·l20 단원 마무리도 all) · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 6학년 = 인물 없이 — 화자는 「친구」·「짝꿍」.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g6o2_u2_market_claim',
    title: '🗣️ 친구 말 판정',
    subtitle: '시장경제·경제성장·무역 이야기 — 스파이(거짓인 말)를 찾아요! 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '7차시까지' },
        { v: 'l08', label: '8차시까지' },
        { v: 'l09', label: '9차시까지' },
        { v: 'l10', label: '10차시까지' },
        { v: 'l11', label: '12차시까지' },
        { v: 'l13', label: '13차시까지' },
        { v: 'l14', label: '14차시까지' },
        { v: 'l15', label: '16차시까지' },
        { v: 'all', label: '18차시까지' }] },
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
      var gen = GENS['g6_2_market_claim'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
