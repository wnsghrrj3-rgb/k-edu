/* gens/science/g4_2_sky_order.js — 밤하늘 차례대로 (4학년 2학기 과학 1단원 「밤하늘 관찰」 l03 · l04 · l06 · l11 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기) — 엔진 무개변, 생성기만 새로. 교과서판 2학기 — 카드 글은 교과서·지도서 그대로.
 * params: { upto: 'l03'|'l04'|'all' } · next() → { prompt, icon, cards:[{t,e}](섞임), order, answer, layout:'row', type, explain, l }
 *
 * 차례의 원천(지도서 4-2 과학 1단원 · 『과학』 쪽):
 *   l03  『과학』 16~17쪽 [탐구 활동] 여러 날 동안 보이는 달의 모양 관찰하기 — 「초승달부터 달을 관찰하면 달의 모양이 초승달, 상현달, 보름달,
 *        하현달, 그믐달 순서로 달라집니다. 같은 모양의 달을 다시 보려면 약 30일이 걸립니다.」 · 더 생각해요 「오늘 초승달 → 약 30일 뒤 다시 초승달」
 *        · 지도서 127쪽 「그믐달을 본 뒤 며칠이 지나면 다시 초승달을 볼 수 있습니다」 · 『실험관찰』 63쪽 달 모양 붙임딱지(모양만)
 *   l04  『과학』 19쪽 잠깐 「태양에서 가까운 행성부터 순서대로」 — 예시 답안 수성, 금성, 지구, 화성, 목성, 토성, 천왕성, 해왕성
 *        (지도서 130쪽 유의: 실제 크기·거리 같은 물리량은 다루지 않음 → 크기 차례·거리 수는 판에 없음)
 *   l06  지도서 146쪽 「북극성을 찾는 방법」 — 북두칠성의 국자 모양 끝부분 두 별 ㉠·㉡을 연결하면 그 거리의 5배만큼 떨어진 곳의 별이 북극성
 * type(문항 단위 · 진단 축):
 *   mo_name   달 이름 카드(3~4장) — 초승달부터 관찰한 차례(끝에서 처음으로 넘어가지 않는 부분 차례)
 *   mo_shape  달 모양 카드(붙임딱지처럼 모양만 · 이름 0) — 같은 차례를 모양으로
 *   mo_again  그믐달 다음 = 다시 초승달 — 물음이 첫 달을 밝힌다(「하현달부터」) · 지도서 125쪽 오개념 「달의 모양이 실제로 변한다」는 풀이에서만
 *   pl_order  태양에서 가까운 행성부터(3~4장 · 이웃이 아닌 행성도 섞음)
 *   st_find   북극성 찾기 걸음(북두칠성 → 국자 끝 두 별 잇기 → 그 거리의 5배 → 북극성)
 * 카드 글에 번호·「먼저/나중」 0 · 달 모양 그림 = 북반구에서 보이는 모양 이모지(🌒 초승달 · 🌓 상현달 · 🌕 보름달 · 🌗 하현달 · 🌘 그믐달).
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_sky_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l03', 'l04', 'l06'];
  var MOON = [['🌒', '초승달'], ['🌓', '상현달'], ['🌕', '보름달'], ['🌗', '하현달'], ['🌘', '그믐달']];
  var PLANET = ['수성', '금성', '지구', '화성', '목성', '토성', '천왕성', '해왕성'];
  var STAR = [['🥄', '북두칠성 찾기'], ['🔗', '국자 끝 두 별 잇기'], ['✋', '그 거리의 5배 가기'], ['⭐', '북극성 찾기']];

  /* 틀 — [차시, type, 카드 번호(바른 차례)] — mo_again 은 끝 → 처음으로 넘어간다(물음이 첫 달을 밝힘) */
  var T = [
    ['l03', 'mo_name', [0, 1, 2, 3]], ['l03', 'mo_name', [1, 2, 3, 4]], ['l03', 'mo_name', [0, 2, 3, 4]], ['l03', 'mo_name', [0, 1, 3, 4]],
    ['l03', 'mo_name', [0, 1, 2]], ['l03', 'mo_name', [2, 3, 4]], ['l03', 'mo_name', [1, 3, 4]],
    ['l03', 'mo_shape', [0, 1, 2, 3]], ['l03', 'mo_shape', [1, 2, 3, 4]], ['l03', 'mo_shape', [0, 2, 3, 4]], ['l03', 'mo_shape', [0, 1, 2]], ['l03', 'mo_shape', [1, 2, 4]],
    ['l03', 'mo_again', [3, 4, 0]], ['l03', 'mo_again', [4, 0, 1]], ['l03', 'mo_again', [3, 4, 0, 1]], ['l03', 'mo_again', [2, 3, 4, 0]],
    ['l04', 'pl_order', [0, 1, 2, 3]], ['l04', 'pl_order', [2, 3, 4, 5]], ['l04', 'pl_order', [4, 5, 6, 7]], ['l04', 'pl_order', [0, 2, 4, 6]],
    ['l04', 'pl_order', [1, 3, 5, 7]], ['l04', 'pl_order', [3, 4, 6, 7]], ['l04', 'pl_order', [0, 3, 5]], ['l04', 'pl_order', [1, 4, 6]],
    ['l06', 'st_find', [0, 1, 2, 3]], ['l06', 'st_find', [0, 1, 2]], ['l06', 'st_find', [1, 2, 3]]
  ];

  var ICON = { mo_name: '🌙', mo_shape: '🌙', mo_again: '🔁', pl_order: '☀️', st_find: '🧭' };
  var WHY = {
    mo_name: '초승달부터 관찰하면 초승달 → 상현달 → 보름달 → 하현달 → 그믐달 순서로 달라져요.',
    mo_shape: '눈썹 모양 초승달에서 반달(상현달), 둥근 보름달, 반달(하현달), 그믐달 순서로 달라져요.',
    mo_again: '그믐달을 본 뒤 며칠이 지나면 다시 초승달을 볼 수 있어요. 같은 모양의 달을 다시 보려면 약 30일이 걸려요. 달의 실제 모양이 변하는 것은 아니에요.',
    pl_order: '태양에서 가까운 순서대로 수성, 금성, 지구, 화성, 목성, 토성, 천왕성, 해왕성이에요.',
    st_find: '북두칠성의 국자 모양 끝부분 두 별을 연결하고, 그 거리의 5배만큼 떨어진 곳에 있는 별이 북극성이에요.'
  };

  function head(t, seq) {
    if (t === 'mo_name') return '초승달부터 여러 날 동안 달을 관찰했어요. 먼저 본 달부터 놓아요';
    if (t === 'mo_shape') return '초승달부터 여러 날 동안 본 달의 모양이에요. 먼저 본 모양부터 놓아요';
    if (t === 'mo_again') return MOON[seq[0]][1] + '부터 여러 날 동안 달을 관찰했어요. 먼저 본 달부터 놓아요';
    if (t === 'pl_order') return '태양에서 가까운 행성부터 놓아요';
    return '밤하늘에서 북극성을 찾아요. 먼저 하는 일부터 놓아요';
  }
  function cardsOf(t, seq) {
    return seq.map(function (k) {
      if (t === 'mo_name' || t === 'mo_again') return { e: '', t: MOON[k][1] };
      if (t === 'mo_shape') return { e: MOON[k][0], t: '' };
      if (t === 'pl_order') return { e: '', t: PLANET[k] };
      return { e: STAR[k][0], t: STAR[k][1] };
    });
  }
  function nameOf(t, k) { return t === 'pl_order' ? PLANET[k] : t === 'st_find' ? STAR[k][1] : MOON[k][1]; }

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

  function build(row, id, rng) {
    var t = row[1], seq = row[2], cards = cardsOf(t, seq);
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'sk' + id, l: row[0], type: t, icon: ICON[t], prompt: head(t, seq),
             cards: perm.map(function (j) { return cards[j]; }), order: order, answer: order.join(','), layout: 'row',
             explain: seq.map(function (k) { return nameOf(t, k); }).join(' → ') + '. ' + WHY[t] };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'g4_2_sky_order',
    title: '밤하늘 차례대로',
    T: T, MOON: MOON, PLANET: PLANET, STAR: STAR, ORDER: ORDER, WHY: WHY,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      T.forEach(function (r, k) { if (ORDER.indexOf(r[0]) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return T[k][0] === upto; });   // 이번 차시 판이 덱 앞머리
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 틀이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], k + '_' + (n++), rng);
        },
        check: function (pick, q) { return String(pick) === String(q.answer); }
      };
    },
    printRender: function (q) {
      return q.icon + ' ' + q.prompt + '<br>' + q.cards.map(function (c, k) { return MARK[k] + ' ' + c.e + ' ' + c.t; }).join(' &nbsp; ') +
        '<br>' + q.order.map(function () { return '(　　)'; }).join(' → ');
    },
    printAnswer: function (q) { return q.order.map(function (k) { return MARK[k]; }).join(' → '); },
    printHead: '카드를 띠에 놓을 차례대로 기호를 써 보세요. (왼쪽이 먼저)'
  };
}));
