/* src/g3k_u2_pause_spot.js — 쐐기표 자리 찾기 (3학년 1학기 국어 2단원 「분명하고 유창하게」 l05·l14)
 * 장르: text_hunt(글 속 찾기 · 자리 토큰 — 엔진 v1.1.0 fixed) · 생성기: pause_spot
 * 문장 글자는 누를 수 없고, 낱말 사이·낱말 속의 빈 자리만 누른다. 맞히면 그 자리에 ∨(또는 ∨∨)가 선다.
 * 덫 = 정본 l05 오개념 둘 — 낱말 가운데 가르기 · 너무 자주 끊기. 자리는 판정 전 모두 같은 모습(답 미노출).
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k_u2_pause_spot',
    title: '⏸️ 쐐기표 자리 찾기',
    subtitle: '문장을 읽고 조금 쉬어 읽을 곳(∨), 조금 더 쉬어 읽을 곳(∨∨)을 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l05', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="pause"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['pause_spot'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {
        tokenLabel: function (tok) { return '<i class="slot"></i><b class="mk">' + (tok.m === 'v2' ? '∨∨' : '∨') + '</b>'; }
      });
    }
  });
})();
