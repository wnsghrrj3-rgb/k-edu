/* src/g4k2_u3_opinion_judge.js — 의견 판정단: 의견을 모아서 (4학년 2학기 국어 3단원 · l02 · l04 · l13 · 교과서판 2학기)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: g4_2_opinion_judge  (claim_write·claim_deep 와 같은 엔진·같은 무대)
 * 범위(upto): l02 = 2·3차시(우현이네 · 주의할 점 · 독도의 날) · all = 단원 전체(4·5차시 분실물 토의 · 13차시 마무리) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 까닭 고르기가 곧 「왜?」 — 판정을 맞힌 뒤 의견을 마련할 때 생각할 점(주제·이유·실천·단점) 가운데 바른 까닭을 고른다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4k2_u3_opinion_judge',
    title: '🧑‍⚖️ 의견 판정단',
    subtitle: '토의에서 나온 의견에 대한 말이 알맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '3차시까지' },
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
      var gen = GENS['g4_2_opinion_judge'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
