/* src/g4m2_u1_calc_judge.js — 친구 말 판정: 누구 계산이 맞을까? (4학년 2학기 수학 1단원 「분수의 덧셈과 뺄셈」 · 2~8차시 · 10차시 마무리)
 * 장르: claim_judge(맞다·아니다·알 수 없다) · 생성기: g4_2_calc_judge  (g1k2_u7_claim_explain 과 같은 엔진·같은 무대)
 * 위 줄(scene)에 교과서 식·장면 한 줄(근거), 그 아래 서준·채원·도윤·지유·건우·은비가 한 계산 — 맞는 계산인지 판정하고 까닭까지 고른다.
 * 교과서 22쪽 7번 「잘못 계산한 곳을 찾아 이유를 설명하고, 바르게 계산해 봅시다」 · 익힘 수학에 퐁당 · 지도서 오류 1~3 을 놀이로.
 * 범위(upto): 그 차시까지 누적 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「m2」 = 수학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4m2_u1_calc_judge',
    title: '🧮 누구 계산이 맞을까?',
    subtitle: '교과서 식을 보고 친구의 분수 계산이 맞는지 판정해요. 까닭도 골라요!',
    defaults: { n: 5, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'l07', label: '7차시까지' },
        { v: 'l08', label: '8차시까지' },
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
      var gen = GENS['g4_2_calc_judge'].create({ upto: app.settings.upto }, app.rng);
      ClaimJudge.run(app, gen, {});
    }
  });
})();
