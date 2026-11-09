/* gens/korean/g2_2_scene_order.js — 이야기 장면 차례대로 (2학년 2학기 국어 1단원 「장면을 상상하며」 l07 = 7·8차시 · l09 = 9·10차시 · l14 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기) — 엔진 무개변, 생성기만 새로(echo_order 와 같은 계약).
 * params: { upto: 'l07' | 'all' } · next() → { prompt, icon, cards:[{t,e}](섞임), order, answer, layout:'col', type, explain, l }
 *
 * 근거 = 교과서 활동 둘 + 인물의 마음 표(지도서 1단원 · 『국어』 쪽):
 *   『국어』 24쪽 3번 「「할머니와 하얀 집」에서 일이 일어난 차례대로 빈칸에 번호를 써 봅시다」 — 네 장면 글 그대로(지도서 72쪽)
 *   『국어』 25쪽 4번 「인물의 마음을 상상해 봅시다」 — 이야기 상황 → 인물의 말이나 행동 → 인물의 마음(불안·걱정 / 놀람·당황 / 괜찮음·즐거움, 지도서 72쪽)
 *   『국어』 32쪽 「「엉뚱한 수리점」에서 일이 일어난 차례대로 빈칸에 번호를 써 봅시다」 — 네 장면 글 그대로(지도서 78쪽)
 *   이야기 본문(『국어』 18~23쪽 · 26~31쪽, 지도서 68~71쪽 · 74~77쪽)은 장면 한 줄씩만 줄여 쓴다(작품 본문 몇 줄 인용까지).
 * 정본 `data/g2s2_korean_u1.js` l07 s10 네 장면 · s11 상황 ↔ 마음 · s08 오개념 「마음은 처음부터 끝까지 똑같다」 → 「걱정 → 놀람 → 즐거움」 · l09 s05·s06 줄거리.
 * type(문항 단위 · 진단 축 — 무엇을 보고 차례를 정하는가):
 *   hm_order     「할머니와 하얀 집」 일이 일어난 차례(카드 3~4장) — 교과서 24쪽 네 장면 + 줄거리 장면
 *   heart_order  할머니의 마음이 바뀐 차례 — 카드 = 상황 + 마음(25쪽 표) · 정본 s08 오개념(마음은 똑같다)을 겨눈다
 *   sr_order     「엉뚱한 수리점」 일이 일어난 차례 — 교과서 32쪽 네 장면 + 수리점 손님 장면(한 판에 손님은 하나만)
 * 차례가 애매한 짝은 한 판에 넣지 않는다: 자랑하며 살았다 ↔ 아무도 초대하지 않았다(둘 다 늘 그랬던 일) ·
 *   고양이가 사라졌다 돌아왔다 ↔ 새끼를 낳았다 · 새끼를 낳았다 ↔ 새끼들을 보고 어쩔 줄 몰랐다 · 집 걱정 ↔ 지친 마음 · 수리점 손님끼리.
 * 카드에 번호·먼저/나중·처음·끝 0 · 그림(e)에 숫자 0 · 처음부터 맞게 놓인 판 0 · 차단 어휘 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g2_2_scene_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07', 'all'];

  /* 「할머니와 하얀 집」 장면 — 일어난 차례 · [그림, 글] (★ = 『국어』 24쪽 3번 카드 글 그대로) */
  var HM = [
    ['🏠', '할머니는 하얀 집을 자랑스러워하며 하얀 고양이와 함께 살았다'],   // 0 ★
    ['🚪', '할머니는 집에 뭐라도 묻을까 봐 아무도 초대하지 않았다'],          // 1
    ['🐈', '하얀 고양이가 사라졌다가 며칠 뒤에 돌아왔다'],                   // 2
    ['🐱', '하얀 고양이가 새끼를 낳았다'],                                   // 3 ★
    ['😲', '할머니는 새끼 고양이들을 보고 어쩔 줄 몰랐다'],                  // 4
    ['🧶', '새끼 고양이들 때문에 하얀 집은 난장판이 되었다'],                // 5
    ['😴', '할머니는 고양이들이 어지른 집을 정리하느라 지쳐 곯아떨어졌다'],    // 6 ★
    ['👀', '할머니 눈에 고양이마다 다른 것이 보이기 시작했다'],              // 7
    ['😊', '집이 더는 하얗지 않았지만 할머니는 즐거웠다']                    // 8 ★
  ];
  var TB_HM = [0, 3, 6, 8];   // 『국어』 24쪽 네 장면

  /* 할머니의 마음 — 상황 + 마음 · 바뀐 차례 (★ = 『국어』 25쪽 4번 표 세 줄) */
  var HEART = [
    ['🧹', '집이 더러워질까 봐 청소할 때 — 걱정하는 마음'],          // 0
    ['😟', '하얀 고양이가 보이지 않을 때 — 불안하고 걱정되는 마음'],   // 1 ★
    ['😌', '하얀 고양이가 돌아왔을 때 — “후유.” 안심한 마음'],        // 2
    ['😲', '새끼 고양이들을 발견했을 때 — 놀라고 당황한 마음'],        // 3 ★
    ['😩', '날마다 소동을 치울 때 — 지친 마음'],                      // 4
    ['🥰', '고양이들이 여전히 어지를 때 — 즐겁고 괜찮은 마음']         // 5 ★
  ];
  var TB_HEART = [1, 3, 5];   // 『국어』 25쪽 표

  /* 「엉뚱한 수리점」 — 틀 장면(★ = 『국어』 32쪽 네 장면을 폰 한 화면에 맞게 줄임) · 손님 장면은 한 판에 하나 */
  var SR = {
    play: ['🌳', '소이는 날이 어두워지는 것도 모르고 친구들과 놀았다'],          // ★
    open: ['💡', '밤이 되자 수리점에 불이 켜지고 어른들이 줄을 섰다'],          // ★
    broom: ['🧹', '빗자루를 날게 해 달라는 소이에게 아저씨는 안 된다고 했다'], // ★
    home: ['🪟', '소이는 재미있는 것을 재미없게 고치지 않겠다고 생각했다']        // ★
  };
  var GUEST = {
    chair: ['🪑', '소이가 왜 멀쩡한 의자를 가지고 나왔는지 물었다'],
    closet: ['🚪', '소이는 옷장이 숨바꼭질할 때 숨기 딱 좋겠다고 했다'],
    grass: ['🌿', '소이는 강아지풀로 간지럼을 태우면 재미있다고 했다'],
    ghost: ['👻', '소이는 침대 밑 유령이 자기 친구라고 했다'],
    name: ['🦖', '소이는 박공룡이란 이름도 멋지다고 생각했다']
  };
  var TB_SR = ['play', 'open', 'broom', 'home'];   // 『국어』 32쪽 네 장면
  function sr(keys) { return keys.map(function (k) { return SR[k] || GUEST[k]; }); }

  /* 틀 — type · l(처음 나오는 차시) · seq(카드 줄 = 바른 차례) */
  var T = [
    { type: 'hm_order', pick: TB_HM },
    { type: 'hm_order', pick: [0, 2, 4, 8] },
    { type: 'hm_order', pick: [1, 2, 5, 8] },
    { type: 'hm_order', pick: [0, 4, 6, 7] },
    { type: 'hm_order', pick: [1, 4, 5, 6] },
    { type: 'hm_order', pick: [2, 4, 6, 8] },
    { type: 'hm_order', pick: [0, 3, 5, 7] },
    { type: 'hm_order', pick: [1, 2, 6] },
    { type: 'hm_order', pick: [0, 5, 8] },
    { type: 'hm_order', pick: [2, 5, 7] },
    { type: 'hm_order', pick: [1, 4, 8] },
    { type: 'hm_order', pick: [3, 6, 8] },
    { type: 'hm_order', pick: [0, 2, 7] },
    { type: 'heart_order', heart: TB_HEART },
    { type: 'heart_order', heart: [0, 3, 5] },
    { type: 'heart_order', heart: [1, 2, 3] },
    { type: 'heart_order', heart: [2, 3, 5] },
    { type: 'heart_order', heart: [0, 1, 3, 5] },
    { type: 'heart_order', heart: [1, 2, 4, 5] },
    { type: 'heart_order', heart: [1, 3, 4, 5] },
    { type: 'heart_order', heart: [3, 4, 5] },
    { type: 'heart_order', heart: [0, 2, 5] },
    { type: 'heart_order', heart: [1, 2, 3, 5] },
    { type: 'heart_order', heart: [2, 4, 5] },
    { type: 'sr_order', sr: TB_SR },
    { type: 'sr_order', sr: ['play', 'open', 'chair', 'broom'] },
    { type: 'sr_order', sr: ['open', 'closet', 'broom', 'home'] },
    { type: 'sr_order', sr: ['play', 'grass', 'home'] },
    { type: 'sr_order', sr: ['open', 'ghost', 'broom'] },
    { type: 'sr_order', sr: ['play', 'open', 'name'] },
    { type: 'sr_order', sr: ['chair', 'broom', 'home'] },
    { type: 'sr_order', sr: ['play', 'closet', 'broom'] },
    { type: 'sr_order', sr: ['open', 'grass', 'home'] },
    { type: 'sr_order', sr: ['play', 'ghost', 'broom', 'home'] },
    { type: 'sr_order', sr: ['open', 'name', 'broom', 'home'] }
  ];
  var LV = { hm_order: 'l07', heart_order: 'l07', sr_order: 'l09' };

  var HEAD = {
    hm_order: '「할머니와 하얀 집」에서 일어난 일이에요. 먼저 일어난 일부터 놓아요',
    heart_order: '할머니의 마음은 어떻게 바뀌었나요? 먼저 든 마음부터 놓아요',
    sr_order: '「엉뚱한 수리점」에서 일어난 일이에요. 먼저 일어난 일부터 놓아요'
  };
  var ICON = { hm_order: '🏠', heart_order: '💗', sr_order: '🔧' };
  var WHY = {
    hm_order: '하얀 집을 자랑하던 할머니 → 새끼 고양이들 → 난장판 → 즐거운 할머니 차례예요. 일이 일어난 차례대로 떠올리면 장면이 이어져요.',
    heart_order: '인물의 마음은 처음부터 끝까지 똑같지 않아요. 할머니도 걱정 → 놀람 → 즐거움으로 바뀌었어요. 상황과 말이나 행동을 보고 그때그때의 마음을 상상해요.',
    sr_order: '놀이 → 수리점에 불이 켜짐 → 어른들과 나눈 말 → 빗자루 → 집에 돌아온 소이 차례예요. 소이가 겪은 일을 차례대로 다시 정리해 봐요.'
  };

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function rowsOf(t) {
    if (t.pick) return t.pick.map(function (k) { return HM[k]; });
    if (t.heart) return t.heart.map(function (k) { return HEART[k]; });
    return sr(t.sr);
  }

  function build(t, k, id, rng) {
    var cards = rowsOf(t).map(function (r) { return { e: r[0], t: r[1] }; });
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'so' + k + '_' + id, l: LV[t.type], type: t.type, icon: ICON[t.type], prompt: HEAD[t.type],
             cards: perm.map(function (j) { return cards[j]; }), order: order, answer: order.join(','), layout: 'col',
             explain: cards.map(function (c) { return c.t; }).join(' → ') + '. ' + WHY[t.type] };
  }

  function pool(upto) {
    var out = [];
    T.forEach(function (t, k) { if (upto !== 'l07' || LV[t.type] === 'l07') out.push(k); });
    return out;
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'g2_2_scene_order',
    title: '이야기 장면 차례대로',
    T: T, HM: HM, HEART: HEART, SR: SR, GUEST: GUEST, TB_HM: TB_HM, TB_HEART: TB_HEART, TB_SR: TB_SR, LV: LV, HEAD: HEAD, WHY: WHY,
    ORDER: ORDER, pool: pool, rowsOf: rowsOf,
    create: function (params, rng) {
      var upto = params && params.upto === 'l07' ? 'l07' : 'all';
      var idx = pool(upto);
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
          return build(T[k], k, n++, rng);
        },
        check: function (pick, q) { return String(pick) === String(q.answer); }
      };
    },
    printRender: function (q) {
      return q.icon + ' ' + q.prompt + '<br>' + q.cards.map(function (c, k) { return MARK[k] + ' ' + c.e + ' ' + c.t; }).join('<br>') +
        '<br>' + q.order.map(function () { return '(　　)'; }).join(' → ');
    },
    printAnswer: function (q) { return q.order.map(function (k) { return MARK[k]; }).join(' → '); },
    printHead: '일이 일어난 차례대로, 마음이 바뀐 차례대로 기호를 써 보세요. (왼쪽이 먼저)'
  };
}));
