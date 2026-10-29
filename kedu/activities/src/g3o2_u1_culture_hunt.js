/* src/g3o2_u1_culture_hunt.js — 다양한 문화 글 속 찾기 (3학년 2학기 사회 1단원 「사회 변화와 다양한 문화」 주제② l07~l10 · l11·l12 정리)
 * 장르: text_hunt(글 속 찾기 · 덩이 토큰) · 생성기: culture_hunt
 * 짧은 글을 읽고 물음에 맞는 덩이(문화가 아닌 행동 · 늘어난 사람들과 관련 있는 모습 · 차별 · 생긴 문제 · 바람직하지 못한 태도)를 모두 누른다.
 * 덫 = 정본 오개념·watch(먹는 방식 · 외국 것만 · 편견(생각) · 좋아진 점 · 「~지 않아요」). 판정 전엔 모든 덩이가 같은 모습(답 미노출).
 * 범위(upto)는 문화 쪽 처음(l07)부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3o2_u1_culture_hunt',
    title: '🔍 다양한 문화 글 속 찾기',
    subtitle: '짧은 글을 읽고 물음에 맞는 곳을 모두 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l07', label: '9차시까지' },
        { v: 'l08', label: '11차시까지' },
        { v: 'l09', label: '13차시까지' },
        { v: 'l10', label: '15차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="cul"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['culture_hunt'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
