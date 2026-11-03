/* gens/korean/flow_order.js — 이야기 흐름 차례대로 (4학년 1학기 국어 1단원 「깊이 있게 읽어요」 l03 = 3·4차시 · l05 = 5·6차시 · l11 = 11·12차시 · l13 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)의 아홉째 실물 — 엔진 무개변, 생성기만 새로.
 * params: { upto: 'l03'|'l05'|'all' } · next() → { prompt, icon, cards:[{t,e}](섞임), order, answer, layout:'col', type, explain, l }
 *
 * 차례의 원천 = 정본 `data/g4_korean_u1.js` 만:
 *   l03 s05~s07 석봉 세 장면 · s12 기본 「중요한 일 네 가지를 차례대로」 · s09 「개미와 비둘기」 · s13 모둠 걸음 · s12 기본 steps
 *   l05 s04~s06 무루 네 장면(s04 「눈이 어두운 두더지로 태어났어요(첫 장면)」) · s08 「밀어냈다 → 보살폈다 → 구했다」 · s12 도전 「바뀐 곳 — 비 오던 밤」
 *   l11 s04·s09·s10 그림 네 장(집을 나선다 → 놀란다 → 책을 편다 → 웃으며 이야기한다) · s05 세 걸음 · s13 누구일까 놀이 걸음
 * type(문항 단위 · 진단 축):
 *   sb_flow    석봉 이야기 중요한 일(카드 3~4장) — 정본 s15 「한 문장으로만 줄이면 왜 혼났는지 빠짐」 → 「불을 끔」·「떡은 고른데 글씨는 제각각」이 틀 절반 넘게 든다
 *   ant_flow   개미와 비둘기 — 「서로 도왔다」 한 줄이 아니라 누가 먼저 구했는지(정본 s09)
 *   flow_steps 흐름 정리 걸음 — 빼 보기가 줄 세우기보다 먼저(정본 s13 · s08 「하나도 빠짐없이」)
 *   mole_flow  무루 이야기 장면 — 「비 오던 밤」이 「모두를 이끔」 앞(정본 s06 watch 「눈이 좋아졌다」가 아니라 앞발)
 *   rel_turn   관계가 바뀐 곳 — 정본 s08 세 고리 + s12 도전 「바뀐 곳」
 *   pic_order  그림 네 장 — 정본 s03 「놀란 얼굴이 맨 앞이면 왜 놀랐는지 모른다」 → 놀란 얼굴은 어느 판에서도 맨 앞 0
 *   make_steps 장면 카드로 이야기 만들기 — 정본 s05 · s08 「그림 설명만」이 아니라 말과 행동은 이은 뒤
 *   who_steps  누구일까 놀이 — 정본 s13 · s11 「정답을 먼저 알려 준다」 0
 * 카드에 번호·먼저/나중·처음·끝 0 · 그림(e)에 숫자 0 · 처음부터 맞게 놓인 판 0.
 * 낱말 앞당김 0 — l03 틀에 무루·두더지·그림 네 장·누구일까 0 · l05 틀에 그림 네 장·누구일까 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['flow_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l03', 'l05', 'l11'];

  /* 석봉 — 정본 l03 s05~s07 줄 · s12 기본 답 네 가지 */
  var SB = [
    ['🏠', '석봉이 한양에서 공부하고 고향집으로 돌아왔다'],
    ['🕯️', '어머니가 호롱불을 끄고 글씨를 써 보라고 했다'],
    ['🍡', '어둠 속에서 어머니는 떡을 썰고 석봉은 글씨를 썼다'],
    ['💡', '불을 켜 보니 떡은 고른데 글씨는 제각각이었다'],
    ['🚶', '어머니가 석봉을 그날로 한양에 돌려보냈다'],
    ['📚', '석봉이 부끄러워하며 다시 공부에 힘썼다']
  ];
  /* 개미와 비둘기 — 정본 l03 s09 */
  var ANT = [
    ['💧', '개미가 물을 마시러 갔다가 물에 빠졌다'],
    ['🍃', '비둘기가 나뭇잎을 떨어뜨려 개미를 구해 주었다'],
    ['🕸️', '사냥꾼이 비둘기를 잡으려고 그물을 던졌다'],
    ['🐜', '개미가 사냥꾼의 발을 물어 비둘기를 구해 주었다']
  ];
  /* 흐름 정리 걸음 — 정본 l03 s13 모둠 · s12 기본 steps */
  var FSTEP = [
    [['🃏', '일 카드를 모둠 판에 펼친다'], ['✋', '한 장씩 빼 보며 이야기가 이어지는지 말한다'], ['🧺', '빼도 되는 카드를 옆으로 치운다'], ['📏', '남은 카드를 일어난 차례대로 놓고 이어 읽는다']],
    [['💭', '장면 셋을 차례로 떠올린다'], ['✂️', '빠지면 이야기가 끊기는 일만 고른다'], ['🔗', '「→」로 이어 말한다']]
  ];
  /* 무루 — 정본 l05 s04~s06 줄 */
  var MOLE = [
    ['🌑', '무루가 눈이 어두운 두더지로 태어났다'],
    ['🚫', '또래 두더지들이 무루를 밀어냈다'],
    ['🤍', '마루가 무루에게 굴을 파는 법을 알려 주었다'],
    ['🌧️', '어느 날 밤 언덕에 굵은 비가 쏟아졌다'],
    ['🐾', '무루가 앞발 끝으로 흙이 떨리는 것을 느꼈다'],
    ['📣', '무루가 소리를 질러 두더지들을 깨웠다'],
    ['⛰️', '무루가 앞장서서 모두를 언덕 위로 이끌었다'],
    ['🌱', '마을은 서로 다른 재주를 귀하게 여기게 되었다']
  ];
  /* 관계가 바뀐 곳 — 정본 l05 s08 세 고리 · s12 도전 */
  var REL = [
    [['⚡', '두더지들이 무루를 밀어냈다'], ['🤍', '마루가 무루를 보살폈다'], ['🤝', '무루가 두더지들을 구했다']],
    [['⚡', '두더지들과 무루는 부딪히는 사이였다'], ['🌧️', '비 오던 밤 굴이 무너지려 했다'], ['🤝', '두더지들과 무루는 서로 돕는 사이가 되었다']],
    [['🤍', '마루가 무루를 보살폈다'], ['🌧️', '비 오던 밤 굴이 무너지려 했다'], ['🤝', '무루가 두더지들을 구했다'], ['🌱', '마을은 서로 다른 재주를 귀하게 여기게 되었다']]
  ];
  /* 그림 네 장 — 정본 l11 s04 · s10 (놀란 얼굴 = 1) */
  var PIC = [
    ['🎒', '가방을 메고 집을 나선다'],
    ['😲', '교실에서 놀란 얼굴을 한다'],
    ['📖', '책을 펼쳐 든다'],
    ['😊', '웃으며 친구에게 이야기한다']
  ];
  /* 장면 카드로 이야기 만들기 — 정본 l11 s05 · s13 */
  var MAKE = [
    [['🎴', '그림 네 장의 차례를 정한다'], ['🔗', '장면과 장면을 이어 짧은 이야기를 쓴다'], ['💬', '인물이 한 말과 행동을 넣는다']],
    [['🎴', '그림 네 장의 차례를 정한다'], ['✍️', '한 장면씩 한 문장을 쓴다'], ['💬', '인물의 말을 하나 넣는다'], ['📢', '모둠 앞에서 읽어 준다']]
  ];
  /* 누구일까 놀이 — 정본 l11 s06 · s13 */
  var WHO = [
    [['📕', '책 한 권을 고른다'], ['⬜', '제목과 차례에서 인물 이름을 □로 가린다'], ['🗣️', '한 사람씩 돌아가며 문제를 낸다'], ['🕵️', '다른 모둠이 짐작해 맞힌다']],
    [['⬜', '차례에 나온 인물 이름을 □로 가린다'], ['👀', '제목과 차례만 보여 준다'], ['🕵️', '누구에 대한 이야기인지 알아맞힌다']]
  ];

  /* 틀 — type · l · pick(배열 번호 · 늘어나는 차례) | seq(카드 줄 그대로) */
  var T = [
    { type: 'sb_flow', l: 'l03', pick: [0, 1, 3, 5] },
    { type: 'sb_flow', l: 'l03', pick: [1, 2, 3, 4] },
    { type: 'sb_flow', l: 'l03', pick: [0, 1, 2, 3] },
    { type: 'sb_flow', l: 'l03', pick: [1, 3, 4, 5] },
    { type: 'sb_flow', l: 'l03', pick: [0, 2, 3, 5] },
    { type: 'sb_flow', l: 'l03', pick: [0, 1, 3] },
    { type: 'sb_flow', l: 'l03', pick: [1, 3, 5] },
    { type: 'sb_flow', l: 'l03', pick: [2, 3, 4] },
    { type: 'sb_flow', l: 'l03', pick: [0, 4, 5] },
    { type: 'ant_flow', l: 'l03', pick: [0, 1, 2, 3] },
    { type: 'ant_flow', l: 'l03', pick: [0, 1, 3] },
    { type: 'ant_flow', l: 'l03', pick: [1, 2, 3] },
    { type: 'flow_steps', l: 'l03', seq: FSTEP[0] },
    { type: 'flow_steps', l: 'l03', seq: FSTEP[1] },
    { type: 'mole_flow', l: 'l05', pick: [0, 1, 3, 6] },
    { type: 'mole_flow', l: 'l05', pick: [1, 2, 3, 4] },
    { type: 'mole_flow', l: 'l05', pick: [3, 4, 5, 6] },
    { type: 'mole_flow', l: 'l05', pick: [1, 4, 6, 7] },
    { type: 'mole_flow', l: 'l05', pick: [2, 3, 5, 7] },
    { type: 'mole_flow', l: 'l05', pick: [0, 2, 4] },
    { type: 'mole_flow', l: 'l05', pick: [1, 3, 6] },
    { type: 'mole_flow', l: 'l05', pick: [4, 5, 6] },
    { type: 'rel_turn', l: 'l05', seq: REL[0] },
    { type: 'rel_turn', l: 'l05', seq: REL[1] },
    { type: 'rel_turn', l: 'l05', seq: REL[2] },
    { type: 'pic_order', l: 'l11', pick: [0, 1, 2, 3] },
    { type: 'pic_order', l: 'l11', pick: [0, 1, 3] },
    { type: 'pic_order', l: 'l11', pick: [0, 1, 2] },
    { type: 'pic_order', l: 'l11', pick: [0, 2, 3] },
    { type: 'make_steps', l: 'l11', seq: MAKE[0] },
    { type: 'make_steps', l: 'l11', seq: MAKE[1] },
    { type: 'who_steps', l: 'l11', seq: WHO[0] },
    { type: 'who_steps', l: 'l11', seq: WHO[1] }
  ];

  var HEAD = {
    sb_flow: '석봉 이야기에서 일어난 중요한 일이에요. 일어난 차례대로 놓아요',
    ant_flow: '「개미와 비둘기」에서 일어난 일이에요. 일어난 차례대로 놓아요',
    flow_steps: '이야기의 흐름을 정리해요. 하는 차례대로 놓아요',
    mole_flow: '무루 이야기에서 일어난 일이에요. 일어난 차례대로 놓아요',
    rel_turn: '인물들의 관계가 어떻게 달라졌나요? 일어난 차례대로 놓아요',
    pic_order: '그림 카드로 이야기를 만들어요. 자연스럽게 이어지는 차례대로 놓아요',
    make_steps: '장면 카드로 이야기를 만들어요. 하는 차례대로 놓아요',
    who_steps: '누구일까 놀이를 해요. 하는 차례대로 놓아요'
  };
  var ICON = { sb_flow: '🕯️', ant_flow: '🐜', flow_steps: '📏', mole_flow: '🐾', rel_turn: '🤝', pic_order: '🎴', make_steps: '✍️', who_steps: '🕵️' };
  var WHY = {
    sb_flow: '불을 끄고 글씨를 쓰게 한 일, 떡은 고른데 글씨는 제각각이었던 일이 빠지면 석봉이 왜 다시 한양으로 갔는지 알 수 없어요.',
    ant_flow: '「서로 도왔다」 한 줄로는 누가 먼저 누구를 구했는지 몰라요. 비둘기가 먼저 개미를 구하고, 뒤에 개미가 비둘기를 구했어요.',
    flow_steps: '빠지면 이야기가 끊기는 일만 남긴 뒤에 일어난 차례대로 이어요. 하나도 빼지 않고 다 적으면 흐름이 안 보여요.',
    mole_flow: '비가 쏟아지던 밤 무루는 눈이 아니라 앞발 끝으로 떨림을 느껴 모두를 이끌었어요. 그 뒤 마을이 달라졌어요.',
    rel_turn: '관계가 바뀐 곳이 이야기가 움직이는 곳이에요. 비 오던 밤 일 뒤로 두더지들과 무루는 서로 돕는 사이가 되었어요.',
    pic_order: '하루는 집을 나서며 시작해요. 놀란 얼굴이 맨 앞이면 왜 놀랐는지 알 수 없어요 — 놀란 까닭이 뒤에 와요.',
    make_steps: '차례를 정해 장면을 잇고, 인물의 말과 행동을 넣어야 그림 설명이 아니라 이야기가 돼요.',
    who_steps: '이름을 □로 가리고 제목과 차례만 보여 주어야 짐작할 것이 생겨요. 정답을 먼저 알려 주면 놀이가 안 돼요.'
  };

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  var SRC = { sb_flow: SB, ant_flow: ANT, mole_flow: MOLE, pic_order: PIC };
  function seqOf(t) {
    var rows = t.pick ? t.pick.map(function (k) { return SRC[t.type][k]; }) : t.seq;
    return rows.map(function (r) { return { e: r[0], t: r[1] }; });
  }

  function build(t, id, rng) {
    var cards = seqOf(t);
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'fo' + id, l: t.l, type: t.type, icon: ICON[t.type], prompt: HEAD[t.type],
             cards: perm.map(function (j) { return cards[j]; }), order: order, answer: order.join(','), layout: 'col',
             explain: cards.map(function (c) { return c.t; }).join(' → ') + '. ' + WHY[t.type] };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'flow_order',
    title: '이야기 흐름 차례대로',
    T: T, SB: SB, ANT: ANT, MOLE: MOLE, PIC: PIC, REL: REL, FSTEP: FSTEP, MAKE: MAKE, WHO: WHO,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== 'l11' ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      T.forEach(function (t, k) { if (ORDER.indexOf(t.l) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return T[k].l === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, n = 0;
      return {
        size: idx.length,
        upto: upto,
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
      return q.icon + ' ' + q.prompt + '<br>' + q.cards.map(function (c, k) { return MARK[k] + ' ' + c.e + ' ' + c.t; }).join('<br>') +
        '<br>' + q.order.map(function () { return '(　　)'; }).join(' → ');
    },
    printAnswer: function (q) { return q.order.map(function (k) { return MARK[k]; }).join(' → '); },
    printHead: '카드를 놓을 차례대로 기호를 써 보세요. (왼쪽이 먼저)'
  };
}));
