/* src/g3k2_u2_claim_read.js — 친구 말 판정: 유창하게 읽고 발표해요 (3학년 2학기 국어 2단원 · l01 · l02 · l03 · l05 · l11)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_read  (과학 claim_*·사회 claim_*·국어 claim_memory 와 같은 엔진·같은 무대)
 * 범위(upto): l01·l02·l03·l05 = 그 차시까지 누적 · all = 12차시까지(l11 소개 마당·l13 마무리) — l07·l08 글과 그림은 show_sort 자리 · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u2_claim_read',
    title: '🗣️ 친구 말 판정',
    subtitle: '곰이·펭이가 말한 읽기·발표 방법이 알맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '1차시까지' },
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '4차시까지' },
        { v: 'l05', label: '6차시까지' },
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
      var gen = GENS['claim_read'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
