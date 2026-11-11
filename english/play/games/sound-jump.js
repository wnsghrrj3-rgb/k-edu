/* ============================================================
 * 영어 놀이터 — 놀이 #12 「소리 점프」 (게임설계 v1 §4-12 · 몸·소리)
 *   소리를 들려준다 → 왼쪽·오른쪽 글자 중 그 소리 쪽으로 몸을 기울인다(카메라). 카메라가 없으면 누른다.
 *   화면·규칙은 「몸으로 고르기」(games/legacy.js 의 lean)를 그대로 쓰고, 재료만 그림 대신 소리 글자로 바꾼다.
 *   카메라 영상은 화면 안에서 움직임만 본다 — 저장·전송 0.
 *   공통 인터페이스: start(ctx) — 증거 = 움직임(move) · 대상은 소리
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = { rounds: 6 };
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function start(ctx) {
    var P = g.PlayPhonics, S = ctx.services || {}, cellId = (ctx.zone && ctx.zone.id) || ctx.cell, list = [];
    var u = ctx.zone && ctx.zone.step && (ctx.zone.letterItems || []).length ? ctx.zone.letterItems.map(function (x) { return x.w; }) : P.units(cellId);      /* 한 해 길의 글자 걸음 = 그 걸음의 글자 */
    while (u.length && list.length < CONF.rounds) list = list.concat(shuffle(u));
    list = list.slice(0, CONF.rounds);
    /* 소리마다 견줄 것 하나씩 — 같은 종류에서, 소리가 같은 짝은 빼고 */
    var alt = {}, pool = {};
    list.forEach(function (k) { alt[k] = P.distract(k, cellId, 1)[0]; pool[k] = 1; pool[alt[k]] = 1; });
    var item = function (k) { return { w: k, pic: P.chip(k) }; };
    var c2 = {};
    Object.keys(ctx).forEach(function (k) { c2[k] = ctx[k]; });
    c2.targets = list.map(item);
    c2.pool = Object.keys(pool).map(item);
    c2.opt = Object.assign({}, ctx.opt || {}, {
      sayItem: function (k) { return P.say(S.tts, k); },             /* 단어 대신 소리를 낸다 */
      altFor: function (k) { return alt[k]; }
    });
    return g.PlayLegacy.lean(c2);
  }

  g.PlaySoundJump = { CONF: CONF, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'sound-jump', no: 12, name: '소리 점프', icon: 'jump', channels: ['body', 'sound'], axis: 'flow', need: { lv1: 3 }, cam: true,
    count: function () { return CONF.rounds; },
    intro: { en: 'Listen! Left or right?', ko: '들린 소리 쪽으로 몸을 기울여!' },
    intro1: { en: 'Listen!', ko: '들린 소리 쪽으로 몸을 기울여!' },     /* Lv1 무대에서 — 그때까지 배운 낱말·감탄만(W06) */
    start: start
  });
})(window);
