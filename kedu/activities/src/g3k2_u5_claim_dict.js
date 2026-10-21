/* src/g3k2_u5_claim_dict.js — 친구 말 판정: 사전으로 여는 세상 (3학년 2학기 국어 5단원 · l01 · l04 · l06 · l08 · l10 · l12 · l14)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_dict  (과학 claim_*·사회 claim_*·국어 claim_memory·claim_read·claim_write·claim_manner 와 같은 엔진·같은 무대)
 * 범위(upto): l01·l04·l06·l08·l10·l12 = 그 차시까지 누적 · all = 단원 전체(l14 마무리) — l02 낱말 종류는 word_kind · 사전 차례 놓기는 dict_order 자리 · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u5_claim_dict',
    title: '📖 친구 말 판정',
    subtitle: '곰이·펭이가 말한 기본형·기준·사전 쓰기가 알맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '1차시까지' },
        { v: 'l04', label: '5차시까지' },
        { v: 'l06', label: '7차시까지' },
        { v: 'l08', label: '9차시까지' },
        { v: 'l10', label: '11차시까지' },
        { v: 'l12', label: '13차시까지' },
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
      var gen = GENS['claim_dict'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
