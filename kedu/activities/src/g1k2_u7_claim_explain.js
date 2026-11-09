/* src/g1k2_u7_claim_explain.js — 친구 말 판정: 무엇을 설명하나요? (1학년 2학기 국어 7단원 「무엇이 중요할까요」 · l03 · l05 · l14)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: g1_2_claim_explain  (국어 claim_read·claim_memory 와 같은 엔진·같은 무대)
 * 위 줄(scene)에 교과서 글 한 줄(근거), 그 아래 곰이·펭이가 한 말 — 맞는 말인지 판정하고 까닭까지 고른다.
 * 범위(upto): l03 = 4차시까지(「독도」) · l05 = 6차시까지(「자연은 발명왕」) · all = 단원 전체 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1k2_u7_claim_explain',
    title: '📖 무엇을 설명하나요?',
    subtitle: '글 한 줄을 읽고, 곰이·펭이의 말이 맞는지 판정해요. 까닭도 골라요!',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '4차시까지' },
        { v: 'l05', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 10, label: '10' }] }
    ],
    stageHtml:
      '<div id="cj" class="read">' +
        '<div id="cj-scene"></div>' +
        '<div id="cj-card"><div id="cj-speaker"><span id="cj-face"></span><span id="cj-who"></span></div>' +
        '<div id="cj-say"></div></div>' +
        '<div id="cj-verdict"></div>' +
        '<div id="cj-step"></div>' +
        '<div id="cj-why"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['g1_2_claim_explain'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
