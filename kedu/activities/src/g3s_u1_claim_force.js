/* src/g3s_u1_claim_force.js — 친구 말 판정: 힘과 우리 생활 (3학년 1학기 과학 1단원 · l01~l10)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_force
 * 곰이·펭이가 힘·무게·도구에 대해 한마디 한다. 맞는 말인지 판정하고, 왜 그런지 까닭 한 줄을 고른다.
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3s_u1_claim_force',
    title: '🗣️ 친구 말 판정',
    subtitle: '곰이·펭이의 말이 맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '1차시까지' }, { v: 'l02', label: '2차시까지' }, { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' }, { v: 'l05', label: '5차시까지' }, { v: 'l06', label: '6차시까지' },
        { v: 'l07', label: '8차시까지' }, { v: 'l09', label: '9차시까지' }, { v: 'all', label: '단원 전체' }] },
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
      var gen = GENS['claim_force'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
