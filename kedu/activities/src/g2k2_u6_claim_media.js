/* src/g2k2_u6_claim_media.js — 바르게 말한 친구는? 매체를 경험해요 (2학년 2학기 국어 6단원 · l01 · l03 · l05 · l07 · l09 · l11 · l13)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: g2_2_claim_media  (국어 claim_memory·claim_read·claim_write·claim_manner·claim_dict·claim_feel 와 같은 엔진·같은 무대)
 * 교과서 『국어』 194~195쪽 마무리 · 『국어활동』 79~81쪽 「바르게 말한 친구 · 바르게 읽은 돌하르방 찾기」를 판정 놀이로.
 * 범위(upto): l01~l11 = 그 차시까지 누적 · all = 단원 전체(l13 마무리) · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 2학기 활동 — id 의 「k2」, map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2k2_u6_claim_media',
    title: '📺 바르게 말한 친구는?',
    subtitle: '친구들이 매체 이야기를 해요. 바르게 말했을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '2차시까지' },
        { v: 'l03', label: '4차시까지' },
        { v: 'l05', label: '6차시까지' },
        { v: 'l07', label: '8차시까지' },
        { v: 'l09', label: '10차시까지' },
        { v: 'l11', label: '12차시까지' },
        { v: 'all', label: '단원 전체' }] },
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
      var gen = GENS['g2_2_claim_media'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
