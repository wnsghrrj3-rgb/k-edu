/* gens/science/handwash_order.js — 손 씻기 차례대로 (3학년 2학기 과학 4단원 「감염병과 건강한 생활」 l10 · l11 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)의 다섯째 실물 — 엔진 무개변, 생성기만 새로.
 * params: {} (범위 하나 — l10) · next() → { prompt, icon, cards:[{t,e}](섞임), order, answer, layout:'row', type, explain, l }
 *
 * 차례의 원천 = 정본 l10 하나뿐:
 *   s05·s07 6단계 「손바닥 → 손등 → 손가락 사이 → 두 손 모아 → 엄지손가락 → 손톱 밑」(이름) · s05·s11 단계마다 하는 방법(말)
 *   s13 짝 손 씻기 검사 「6단계를 한다 → 빠뜨린 단계에 표시 → 알려 주고 역할을 바꾼다 → 노래 한 곡 동안 다시 씻는다」
 * type(문항 단위 · 진단 축):
 *   hw_name   6단계 이름의 부분 차례(카드 3~4장)
 *   hw_how    방법 말의 부분 차례(카드 3장) — 정본 s05 watch 「3단계 손깍지와 4단계 손가락 잡기를 섞는 경우」 → 틀 대부분에 둘이 같이
 *   hw_check  짝 검사 걸음(정본 s13)
 * claim_health(l10) 은 「첫 단계 손바닥 · 마지막 손톱 밑」을 말 판정으로만 묻는다 — 이 판은 가운데 차례(손등~엄지)를 놓는다. 카드 글 = 진술 글 0.
 * 6단계 카드(hw_name·hw_how)에 번호·「단계」 0 · 모든 카드에 먼저/나중·처음·끝 0 · 그림(e)에 숫자 0 · 6단계 밖 말(헹구기·물 묻히기·말리기 — 정본에 차례 없음) 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['handwash_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l10'];
  /* 6단계 — [그림, 이름(정본 s05 name · s07), 방법(정본 s11 · s05 kind)] */
  var STEP = [
    ['👐', '손바닥', '손바닥을 마주 대고 문질러요'],
    ['🤚', '손등', '손등과 손바닥을 마주 대고 문질러요'],
    ['🖐️', '손가락 사이', '손깍지를 끼고 문질러요'],
    ['🤲', '두 손 모아', '손가락을 마주 잡고 문질러요'],
    ['👍', '엄지손가락', '엄지손가락을 돌려 가며 문질러요'],
    ['💅', '손톱 밑', '손톱 밑을 문질러요']
  ];
  var CHECK = [['🧼', '6단계로 씻기'], ['✏️', '빠뜨린 단계에 표시'], ['🔁', '알려 주고 역할 바꾸기'], ['🎵', '노래 한 곡 동안 다시 씻기']];

  /* 틀 — type · pick(6단계 번호 · 바른 차례) | seq(짝 검사) */
  var T = [
    { type: 'hw_name', pick: [0, 1, 2, 3] },
    { type: 'hw_name', pick: [1, 2, 3, 4] },
    { type: 'hw_name', pick: [2, 3, 4, 5] },
    { type: 'hw_name', pick: [0, 2, 3, 5] },
    { type: 'hw_name', pick: [1, 2, 3, 5] },
    { type: 'hw_name', pick: [0, 1, 4, 5] },
    { type: 'hw_name', pick: [1, 3, 4] },
    { type: 'hw_name', pick: [2, 3, 4] },
    { type: 'hw_name', pick: [0, 2, 3] },
    { type: 'hw_how', pick: [1, 2, 3] },
    { type: 'hw_how', pick: [2, 3, 4] },
    { type: 'hw_how', pick: [0, 2, 3] },
    { type: 'hw_how', pick: [2, 3, 5] },
    { type: 'hw_how', pick: [0, 1, 5] },
    { type: 'hw_check', seq: [0, 1, 2, 3] },
    { type: 'hw_check', seq: [1, 2, 3] }
  ];

  var HEAD = {
    hw_name: '손 씻기 6단계예요. 먼저 하는 것부터 놓아요',
    hw_how: '손 씻기 6단계에서 하는 방법이에요. 먼저 하는 것부터 놓아요',
    hw_check: '짝과 손 씻기 검사를 해요. 먼저 하는 일부터 놓아요'
  };
  var ICON = { hw_name: '🧼', hw_how: '🧼', hw_check: '👫' };
  var WHY = {
    hw_name: '손바닥 → 손등 → 손가락 사이 → 두 손 모아 → 엄지손가락 → 손톱 밑 차례로 기억해요.',
    hw_how: '손깍지를 끼는 손가락 사이가 먼저, 손가락을 마주 잡는 두 손 모아가 그다음이에요.',
    hw_check: '한 사람이 6단계로 씻으면 짝이 빠뜨린 단계에 표시하고, 알려 준 뒤 역할을 바꿔요. 마지막엔 둘 다 30초 이상 다시 씻어요.'
  };

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function seqOf(t) {
    if (t.type === 'hw_check') return t.seq.map(function (k) { return { e: CHECK[k][0], t: CHECK[k][1] }; });
    return t.pick.map(function (k) { return { e: STEP[k][0], t: t.type === 'hw_how' ? STEP[k][2] : STEP[k][1] }; });
  }

  function build(t, id, rng) {
    var cards = seqOf(t);
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'hw' + id, l: 'l10', type: t.type, icon: ICON[t.type], prompt: HEAD[t.type],
             cards: perm.map(function (j) { return cards[j]; }), order: order, answer: order.join(','), layout: 'row',
             explain: cards.map(function (c) { return c.t; }).join(' → ') + '. ' + WHY[t.type] };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'handwash_order',
    title: '손 씻기 차례대로',
    T: T, STEP: STEP, CHECK: CHECK,
    ORDER: ORDER,
    create: function (params, rng) {
      var idx = T.map(function (_, k) { return k; });
      var deck = shuffle(rng, idx);
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
