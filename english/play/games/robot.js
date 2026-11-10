/* ============================================================
 * 영어 놀이터 — 놀이 #9 「로봇 공장」 뼈대 (게임설계 v1 §4-9 · 손·귀 · 창작)
 *   ★ 아직 켜지 않는다(draft) — 몸·얼굴 칸(Lv2)과 수·꾸밈말 칸(Lv1)을 쓰는 무대에서 완성한다. 조립기는 draft 놀이를 고르지 않는다.
 *   할 일(무대를 지을 때): 「two hands」 「big eyes」 를 듣고 그 부품을 끌어다 붙인다 → 다 붙이면 로봇이 춤춘다.
 *     · 재료 = 수(one~five) + 꾸미는 말(big·small) + 몸 단어 — 통단어로만 배운 몸 단어(feet·eye·hair)는 듣기에만 쓴다
 *     · 실패 지원 = 개수를 눈으로 세어 보여 주기
 *     · 증거 = 듣기(listen) + 만들기(build)
 *   지금 있는 것: 등록 정보(조건 칸·채널)와 주문을 짜는 plan — 화면은 없다.
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = { orders: 3, maxCount: 3 };
  /* 주문 — 구역 자료의 robot: { parts:['hand','eye'], counts:['one','two'], attrs:['big','small'] } 에서 짠다(없으면 빈 목록) */
  function plan(zone, n) {
    var r = (zone && zone.robot) || null, out = [];
    if (!r || !(r.parts || []).length) return out;
    for (var i = 0; i < (n || CONF.orders); i++) out.push({ part: r.parts[i % r.parts.length], count: (r.counts || ['one'])[i % (r.counts || ['one']).length], attr: (r.attrs || [])[i % Math.max(1, (r.attrs || []).length)] || '' });
    return out;
  }
  function start() { return Promise.resolve({ completed: false, draft: true }); }
  g.PlayRobot = { CONF: CONF, plan: plan, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'robot', no: 9, name: '로봇 공장', icon: '🤖', channels: ['hand', 'ear'], axis: 'make', need: { lv1: 15, lv2: 15 }, draft: true,
    fits: function (zone) { return plan(zone, 1).length > 0; },
    count: function () { return 0; },
    intro: { en: 'Two hands!', ko: '들은 대로 로봇을 조립해 봐!' },
    start: start
  });
})(window);
