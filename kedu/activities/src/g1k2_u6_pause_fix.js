/* src/g1k2_u6_pause_fix.js — 글 속 찾기: 어색하게 띄어 읽은 곳 찾기 (1학년 2학기 국어 6단원 「문장을 읽고 써요」 · l08 · l13 · l15)
 * 장르: text_hunt(글 속 찾기 · 자리 토큰 — 엔진 v1.1.0 fixed) · 생성기: g1_2_pause_fix  (3-1 국어 u2 「쐐기표 자리 찾기」와 같은 엔진)
 * 친구가 ∨를 해 둔 문장 — 글자는 누를 수 없고 ∨만 누른다. 여러 ∨ 가운데 낱말 안에서 끊은 「어색한 ∨」 하나를 찾는다.
 * 띄어 읽기는 정답이 하나가 아니므로(지도서 245쪽 ❺❻) 바른 자리를 묻지 않고 뜻이 무너지는 자리만 묻는다. ∨는 판정 전 모두 같은 모습(답 미노출).
 * 범위(upto): l08 = 9차시까지 · all = 단원 전체(목소리 연극 l13·마무리 l15) — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1k2_u6_pause_fix',
    title: '🔍 어색하게 띄어 읽은 곳 찾기',
    subtitle: '친구가 ∨에서 쉬어 읽었어요. 낱말 가운데에서 끊어 어색한 ∨를 찾아 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l08', label: '9차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="vfix"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['g1_2_pause_fix'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {
        tokenLabel: function () { return '<b class="mk">∨</b>'; }
      });
    }
  });
})();
