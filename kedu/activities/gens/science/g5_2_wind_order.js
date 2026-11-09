/* gens/science/g5_2_wind_order.js — 날씨가 생기는 차례 (5학년 2학기 과학 2단원 「날씨와 우리 생활」 l04 · l07 · l10)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)가 쓴다 — 까닭 → 결과 카드 3~4장을 일어나는 차례로 놓는다.
 * 사슬(지도서 과학 5-2 2단원 · 『과학』 쪽 — 카드 글은 지도서 정리 문장을 짧게):
 *   water  l04  『과학』 40~43쪽 「이슬, 안개, 구름을 비교해 보자!」 · 기상 요소 「강수」 —
 *          DEW  이슬 = 공기 중의 수증기가 차가워진 물체에 닿아 표면에 물방울로 맺힌 것
 *          FOG  안개 = 공기 중의 수증기가 지표면 가까이에서 응결해 물방울로 떠 있는 것
 *          RAIN 구름의 작은 물방울에 수증기가 달라붙어 무거워지면 지표면으로 떨어진다(비와 눈, 우박)
 *   press l07  『과학』 44~47쪽 — 차가운 공기는 무거워 고기압 · 온도가 다른 두 지역 사이에 기압 차이가 생기면서 바람이 고기압에서 저기압으로 분다
 *   coast l07  『과학』 48~51쪽 — 맑은 날 낮에는 육지가 바다보다 빨리 가열되어 바다에서 육지 쪽으로(해풍),
 *              밤에는 육지가 바다보다 빨리 냉각되어 육지에서 바다 쪽으로(육풍) 바람이 분다
 * 판의 꼴: 사슬의 카드를 3~4장 골라(차례는 사슬 차례 그대로) 섞어 낸다. 카드에 차례 말·숫자 0 · 처음부터 맞게 놓인 판 0.
 * 진단 축: 해풍 · 육풍 — 낮·밤에 따라 고기압·저기압 자리가 뒤바뀐다(외워 쓰는 「바다 → 육지」 덫) · 바람은 늘 고기압에서 저기압으로.
 * type = water 수증기가 물방울로 · press 기압 차이와 바람 · coast 바닷가의 낮과 밤 바람
 * params: { upto: 'l04'|'all' }  l04 = 5차시까지(이슬·안개·비) · all = 단원 전체(+ 기압과 바람 · 바닷가 바람)
 * next() → { prompt, icon, cards:[{e, t}](섞인 차례), order, answer, layout:'col', type, chain, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_wind_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l04', 'l07'];
  /* C[사슬] = [[그림, 카드 글] …] — 바른 차례 */
  var C = {
    DEW: [['💨', '공기 중에 수증기가 있어요'], ['🥶', '수증기가 차가워진 물체에 닿아요'], ['💧', '물체 표면에 물방울로 맺혀요']],
    FOG: [['💨', '공기 중에 수증기가 있어요'], ['🌫️', '지표면 가까이에서 수증기가 응결해요'], ['☁️', '작은 물방울로 떠 있어요']],
    RAIN: [['☁️', '구름 속에 작은 물방울이 있어요'], ['💨', '물방울에 수증기가 달라붙어요'], ['⚖️', '물방울이 커지고 무거워져요'], ['🌧️', '지표면으로 떨어져요']],
    RULE: [['🌡️', '두 지역의 온도가 달라져요'], ['🧊', '차가운 쪽 공기는 무거워 고기압이 돼요'], ['↕️', '두 지역 사이에 기압 차이가 생겨요'], ['🌬️', '공기가 고기압에서 저기압으로 움직여요']],
    SEA: [['☀️', '맑은 날 낮에 햇빛이 육지와 바다를 데워요'], ['🏝️', '육지가 바다보다 빨리 데워져요'], ['🔺', '육지 위는 저기압, 바다 위는 고기압이 돼요'], ['🌊', '바다에서 육지 쪽으로 바람이 불어요']],
    LAND: [['🌙', '맑은 날 밤이 되어 햇빛이 없어요'], ['🏝️', '육지가 바다보다 빨리 식어요'], ['🔻', '육지 위는 고기압, 바다 위는 저기압이 돼요'], ['🏞️', '육지에서 바다 쪽으로 바람이 불어요']]
  };
  var CH = { DEW: ['water', 'l04'], FOG: ['water', 'l04'], RAIN: ['water', 'l04'], RULE: ['press', 'l07'], SEA: ['coast', 'l07'], LAND: ['coast', 'l07'] };
  var NAME = { DEW: '이슬', FOG: '안개', RAIN: '비', RULE: '바람이 부는 까닭', SEA: '바닷가의 낮 바람', LAND: '바닷가의 밤 바람' };
  var ICON = { water: '💧', press: '🌬️', coast: '🏖️' };
  var HEAD = { water: '수증기가 물방울이 되는 차례로 놓아요', press: '바람이 생기는 차례로 놓아요', coast: '바닷가에서 바람이 부는 차례로 놓아요' };
  var WHY = {
    DEW: '이슬은 공기 중의 수증기가 차가워진 물체에 닿아 표면에 물방울로 맺힌 것이에요.',
    FOG: '안개는 공기 중의 수증기가 지표면 가까이에서 응결해 물방울로 떠 있는 것이에요.',
    RAIN: '구름의 작은 물방울에 수증기가 달라붙어 무거워지면 지표면으로 떨어져요 — 비와 눈, 우박 같은 강수예요.',
    RULE: '온도가 다른 두 지역 사이에 기압 차이가 생기면 바람이 고기압에서 저기압으로 불어요.',
    SEA: '맑은 날 낮에는 육지가 바다보다 빨리 데워져 육지 위가 저기압이 되므로 바다에서 육지 쪽으로 바람이 불어요.',
    LAND: '맑은 날 밤에는 육지가 바다보다 빨리 식어 육지 위가 고기압이 되므로 육지에서 바다 쪽으로 바람이 불어요.'
  };
  /* 틀 = 사슬마다 카드 전부 + (4장 사슬이면) 3장짜리 넷 */
  var T = [];
  Object.keys(C).forEach(function (ch) {
    var n = C[ch].length, all = []; for (var i = 0; i < n; i++) all.push(i);
    T.push({ chain: ch, pick: all });
    if (n === 4) [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]].forEach(function (p) { T.push({ chain: ch, pick: p }); });
  });

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(t, id, rng) {
    var cards = t.pick.map(function (k) { var r = C[t.chain][k]; return { e: r[0], t: r[1] }; });
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);
    var order = idx.map(function (j) { return perm.indexOf(j); });
    var type = CH[t.chain][0];
    return { id: 'wo' + id, l: CH[t.chain][1], type: type, chain: t.chain, icon: ICON[type], prompt: NAME[t.chain] + ' — ' + HEAD[type],
             cards: perm.map(function (j) { return cards[j]; }), order: order, answer: order.join(','), layout: 'col',
             explain: cards.map(function (c) { return c.t; }).join(' → ') + '. ' + WHY[t.chain] };
  }
  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'g5_2_wind_order',
    title: '날씨가 생기는 차례',
    C: C, CH: CH, T: T, NAME: NAME, HEAD: HEAD, WHY: WHY, ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = p.upto === 'l04' ? 'l04' : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : 0;
      var idx = [];
      T.forEach(function (t, k) { if (ORDER.indexOf(CH[t.chain][1]) <= lim) idx.push(k); });
      var deck = shuffle(rng, idx), last = -1, lastCh = '', n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) { deck = shuffle(rng, idx); if (deck.length > 1 && deck[0] === last) deck.push(deck.shift()); }
          var at = 0;
          for (var t = 0; t < deck.length; t++) { if (T[deck[t]].chain !== lastCh) { at = t; break; } }   // 같은 사슬 연달아 줄이기
          var k = deck.splice(at, 1)[0]; last = k; lastCh = T[k].chain;
          return build(T[k], k + '_' + (n++), rng);
        },
        check: function (pick, q) { return String(pick) === String(q.answer); }
      };
    },
    printRender: function (q) {
      return q.icon + ' ' + q.prompt + '<br>' + q.cards.map(function (c, k) { return MARK[k] + ' ' + c.e + ' ' + c.t; }).join('<br>') +
        '<br>' + q.order.map(function () { return '(　　)'; }).join(' → ');
    },
    printAnswer: function (q) { return q.order.map(function (k) { return MARK[k]; }).join(' → '); },
    printHead: '까닭이 되는 일부터 차례대로 기호를 써 보세요. (왼쪽이 앞)'
  };
}));
