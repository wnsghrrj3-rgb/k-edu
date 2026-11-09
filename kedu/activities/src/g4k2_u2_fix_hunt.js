/* src/g4k2_u2_fix_hunt.js — 보고서 고칠 곳 찾기 (4학년 2학기 국어 2단원 「우리말 우리글」 l08 · l10 · l14 · 교과서판 2학기)
 * 장르: text_hunt(글 속 찾기 · 덩이 토큰 · fixed 조각) · 생성기: g4_2_fix_hunt
 * 『국어』 101쪽 4번 그대로 — 📋 지후가 조사한 것(누를 수 없는 줄)과 견주어, 다르게 옮겨 쓴 덩이(부풀림·줄임·출처 부족·사실 칸에 생각)를 모두 누른다.
 * 맞게 옮긴 덩이(열여덟 명·20명·그래프 수·바른 출처)도 섞여 있어 수만 보고 누르면 흔들린다. 판정 전엔 모든 덩이가 같은 모습(답 미노출).
 * 줄 바꿈은 sep 토큰(이 활동 css 에서만 줄 끝) · 📋 줄(tfix)은 이 활동 css 에서만 메모 칸 모양 · 덩이는 길어도 칸 안에서 꺾임.
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4k2_u2_fix_hunt',
    title: '📝 보고서 고칠 곳 찾기',
    subtitle: '지후가 조사한 것과 견주어, 다르게 옮겨 쓴 곳을 모두 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l08', label: '9차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="fix"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['g4_2_fix_hunt'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
