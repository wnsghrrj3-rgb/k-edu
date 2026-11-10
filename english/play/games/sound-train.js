/* ============================================================
 * 영어 놀이터 — 놀이 #15 「소리 기차」 (게임설계 v1 §4-15 · 소리·손)
 *   단어를 한 조각씩 천천히 들려준다 → 섞여 있는 기차 칸(소리 조각)을 들린 차례대로 잇는다 → 다 이으면 소리가 합쳐지며 기차가 달린다.
 *   헷갈리는 조각은 없다 — 차례를 귀로 듣고 맞추는 놀이(다리는 조각을 고르는 놀이). 화면·규칙은 조각 맞추기 공통(games/sound-bridge.js 의 PlaySoundBuild).
 *   실패 지원: 차례가 아닌 칸을 누르면 그 칸만 흔들리고 다시 천천히 들려준다.
 * ============================================================ */
(function (g) {
  'use strict';
  if (g.PlayGame && g.PlaySoundBuild) g.PlayGame.register({
    id: 'sound-train', no: 15, name: '소리 기차', icon: '🚂', channels: ['hand', 'sound'], axis: 'quest', need: { lv1: 4 },
    count: function (c) { return Math.min(g.PlaySoundBuild.CONF.words, g.PlaySoundBuild.pick(c, g.PlaySoundBuild.CONF.words).length); },
    intro: { en: 'Go! Go!', ko: '들린 차례대로 기차 칸을 이어 줘!' },
    start: function (ctx) { return g.PlaySoundBuild.run(ctx, 'train'); }
  });
})(window);
