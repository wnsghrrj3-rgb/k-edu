/* src/g3o2_u2_claim_custom.js — 친구 말 판정: 옛날과 오늘날의 풍습 (3학년 2학기 사회 2단원 주제① · l01 · l02 · l03 · l04 · l05 · l06 · l07)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_custom  (과학 claim_*·사회 claim_town·claim_clue·claim_change·국어 claim_* 와 같은 엔진·같은 무대)
 * 범위(upto): l01~l06 = 그 차시까지 누적 · all = 주제① 전체(l07 정리) — 풍습을 두 동그라미에 넣기는 custom_sort · 주제② 교통(l08~)은 다음 판 자리 · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3o2_u2_claim_custom',
    title: '🗣️ 친구 말 판정',
    subtitle: '곰이·펭이가 말한 옛날과 오늘날의 풍습 이야기가 맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '2차시까지' },
        { v: 'l02', label: '3차시까지' },
        { v: 'l03', label: '5차시까지' },
        { v: 'l04', label: '7차시까지' },
        { v: 'l05', label: '8차시까지' },
        { v: 'l06', label: '10차시까지' },
        { v: 'all', label: '주제① 전체' }] },
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
      var gen = GENS['claim_custom'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
