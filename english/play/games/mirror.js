/* ============================================================
 * 영어 놀이터 — 놀이 #8 「변신 거울」 뼈대 (게임설계 v1 §4-8 · 손·말 · 웃음·창작)
 *   ★ 아직 켜지 않는다(draft) — 변신 거울 무대(몸·얼굴 · 기분 칸)에서 완성한다. 조립기는 draft 놀이를 고르지 않는다.
 *   할 일(무대를 지을 때): 색·옷·몸 카드를 고르면 거울 속 캐릭터가 바뀐다 → 「I am ~.」 로 말한다.
 *     · 재료 = 그 칸의 단어 + 그 칸까지 나온 꾸미는 말(색은 Lv1 색 칸, 몸은 Lv2 몸·얼굴 칸)
 *     · 실패 지원 = 두 선택지를 나란히 비교 · 말은 core/tutor.js 의 3단
 *     · 증거 = 만들기(build) + 말하기(say)
 *   지금 있는 것: 등록 정보(조건 칸·채널)와 「무엇을 고르게 할지」 짜는 plan — 화면은 없다.
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = { picks: 3 };
  /* 고를 거리 — 구역 자료의 mirror: [{ part:'hair', options:['red','blue'] }, …] 를 그대로 쓴다(없으면 빈 목록) */
  function plan(zone, n) { return ((zone && zone.mirror) || []).slice(0, n || CONF.picks); }
  function start() { return Promise.resolve({ completed: false, draft: true }); }
  g.PlayMirror = { CONF: CONF, plan: plan, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'mirror', no: 8, name: '변신 거울', icon: '🪞', channels: ['make', 'say'], axis: 'make', need: { lv1: 13, lv2: 15 }, draft: true,
    fits: function (zone) { return plan(zone, 1).length > 0; },
    count: function () { return 0; },
    intro: { en: 'I am ~.', ko: '거울 앞에서 변신해 봐!' },
    start: start
  });
})(window);
