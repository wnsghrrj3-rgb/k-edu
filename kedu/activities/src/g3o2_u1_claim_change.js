/* src/g3o2_u1_claim_change.js — 친구 말 판정: 사회 변화로 달라진 생활 모습 (3학년 2학기 사회 1단원 · l01 · l02 · l03 · l04 · l05 · l06 · l12)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: claim_change  (과학 claim_*·사회 claim_town·claim_clue·국어 claim_* 와 같은 엔진·같은 무대)
 * 범위(upto): l01~l06 = 그 차시까지 누적 · all = 단원 전체(l12 정리) — 네 사회 변화 칸 넣기는 change_sort · 주제② 문화(l07~l11)는 다음 판 자리 · 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3o2_u1_claim_change',
    title: '🗣️ 친구 말 판정',
    subtitle: '곰이·펭이가 말한 사회 변화 이야기가 맞을까요? 판정하고 까닭까지 골라요',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '2차시까지' },
        { v: 'l02', label: '3차시까지' },
        { v: 'l03', label: '4차시까지' },
        { v: 'l04', label: '6차시까지' },
        { v: 'l05', label: '7차시까지' },
        { v: 'l06', label: '8차시까지' },
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
      var gen = GENS['claim_change'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
