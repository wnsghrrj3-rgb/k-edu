/* src/g4k_u1_claim_deep.js — 친구 말 판정: 깊이 있게 읽어요 (4학년 1학기 국어 1단원 · l01 · l02 · l05 · l09 · l11 · l13)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_deep  (과학 claim_*·사회 claim_*·3-2 국어 claim_* 와 같은 엔진·같은 무대)
 * 범위(upto): l01·l02·l05·l09·l11 = 그 차시까지 누적 · all = 단원 전체(l13 마무리) — 흐름 차례는 flow_order · 질문 갈래는 ask_sort ·
 *   글자와 소리가 다른 낱말은 text_hunt 자리 · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 1학기 활동 — id 에 학기 표지 없음(D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4k_u1_claim_deep',
    title: '📖 친구 말 판정',
    subtitle: '곰이·펭이가 말한 인물의 관계·짐작·이야기 만들기가 알맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '1차시까지' },
        { v: 'l02', label: '2차시까지' },
        { v: 'l05', label: '6차시까지' },
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
      var gen = GENS['claim_deep'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
