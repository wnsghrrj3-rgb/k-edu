/* src/g3k2_u3_claim_write.js — 친구 말 판정: 정확하게 글을 써요 (3학년 2학기 국어 3단원 · l09 · l10 · l12 · l14)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_write  (과학 claim_*·사회 claim_*·국어 claim_memory·claim_read 와 같은 엔진·같은 무대)
 * 범위(upto): l09·l10·l12 = 그 차시까지 누적 · all = 단원 전체(l14 마무리) — l02~l05 출처 찾기는 src_hunt · l07 이어 주는 말은 conn_sort 자리 · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u3_claim_write',
    title: '✍️ 친구 말 판정',
    subtitle: '곰이·펭이가 말한 글 쓰는 방법이 알맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l09', label: '9차시까지' },
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
      var gen = GENS['claim_write'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
