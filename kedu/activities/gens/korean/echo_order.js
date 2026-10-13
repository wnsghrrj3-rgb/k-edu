/* gens/korean/echo_order.js — 이야기 차례대로 (3학년 2학기 국어 1단원 「경험과 관련지으며 이해해요」 l07 = 7·8차시 · l13 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)의 여섯째 실물 — 엔진 무개변, 생성기만 새로.
 * params: {} (범위 하나 — l07) · next() → { prompt, icon, cards:[{t,e}](섞임), order, answer, layout:'col', type, explain, l }
 *
 * 차례의 원천 = 정본 `data/g3s2_korean_u1.js` l07 「소리 돌려주는 골짜기」 하나뿐:
 *   s17 여섯 장면 ①~⑥(크게 외침 → 같은 소리 → 사납게 소리침 → 지침 → 할머니가 메아리라고 → 다정하게 외침) — 사건 카드 글 그대로
 *   s07 link 「원인 — 규안이가 준 소리 / 그래서 — 골짜기가 돌려준 소리」 세 쌍 + s04·s05 장면 + s12 도전(할머니 → 미안해 → 부드러운 미안해)
 *   s13 모둠 걸음(카드 받기 → 줄 세우기 → 화살표 → 발표)·1인 흐름 · s12 도전 steps(앞 일 찾기 → 돌아온 소리 찾기 → 잇기)
 * type(문항 단위 · 진단 축):
 *   ev_order    여섯 장면의 부분 차례(카드 3~4장) — 정본 s08 「앞부분만 짧게」·s13 watch 「할머니 장면을 빼고」 → 틀 절반 넘게 ⑤·⑥이 든다
 *   cause_echo  준 소리 → 돌아온 소리 → 그다음(카드 3~4장) — 정본 s07 watch 「돌아온 소리만 보고 준 소리를 거꾸로」 → 준 소리가 늘 돌아온 소리 바로 앞
 *   sum_steps   간추리는 걸음(정본 s13·s12) — 정본 s13 「꾸미기·발표부터」가 아니라 줄 세우기가 먼저
 * cue_hunt(l06·l11)는 표지어 낱말 판이라 카드 글과 겹치지 않는다. 카드에 번호·먼저/나중·처음·끝 0 · 그림(e)에 숫자 0 · 처음부터 맞게 놓인 판 0.
 * 낱말은 l07 까지 정본(메아리·골짜기·사납게·다정하게·간추리기 — l06 까지의 듣기 걸음 말은 이 판에 0). 차단 어휘 0 — 「그래서 어떻게 되었나」로 쓴다.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['echo_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07'];
  /* 여섯 장면 — [그림, 글] · 글은 정본 l07 s17 ①~⑥ 그대로(번호만 뺌) */
  var EV = [
    ['📣', '규안이가 골짜기에서 크게 외쳤다'],
    ['🔊', '같은 소리가 되돌아왔다'],
    ['😠', '놀리는 줄 알고 사납게 소리쳤다'],
    ['😩', '더 사나운 소리가 돌아와 지쳤다'],
    ['👵', '할머니가 메아리라고 알려 주었다'],
    ['😊', '다정하게 외치니 다정한 소리가 돌아왔다']
  ];
  /* 준 소리 → 돌아온 소리 → 그다음 — 정본 s07 세 쌍 · s04·s05 장면 · s12 도전 */
  var GIVE = { yaho: ['📣', '규안이가 반갑게 “야호!” 하고 외쳤다'], harsh: ['😠', '규안이가 사납게 소리쳤다'], sorry: ['🙇', '규안이가 “미안해!” 하고 외쳤다'] };
  var BACK = { yaho: ['🔊', '똑같은 “야호!”가 돌아왔다'], harsh: ['📢', '더 사나운 소리가 돌아왔다'], sorry: ['💗', '부드러운 “미안해!”가 돌아왔다'] };
  var NEXT = { who: ['❓', '규안이가 “누구야? 왜 따라 해!” 하고 소리쳤다'], think: ['💭', '누가 따라 하며 놀린다고 여겼다'],
               tired: ['🪨', '규안이가 지쳐 바위에 앉았다'], granny: ['👵', '할머니가 메아리라고 알려 주었다'], smile: ['😊', '규안이가 웃으며 산을 내려왔다'] };
  var CAUSE = [
    [GIVE.yaho, BACK.yaho, NEXT.who],
    [GIVE.harsh, BACK.harsh, NEXT.tired],
    [NEXT.granny, GIVE.sorry, BACK.sorry],
    [GIVE.sorry, BACK.sorry, NEXT.smile],
    [BACK.yaho, NEXT.think, GIVE.harsh],
    [GIVE.harsh, BACK.harsh, NEXT.tired, NEXT.granny],
    [NEXT.granny, GIVE.sorry, BACK.sorry, NEXT.smile]
  ];
  /* 간추리는 걸음 — 정본 s13 모둠·1인 · s12 도전 steps(화살표 걸음의 말은 차단 어휘 때문에 「이어지는 카드 사이」로) */
  var STEPS = [
    [['🃏', '모둠이 뒤섞인 사건 카드 여섯 장을 받는다'], ['📏', '일이 일어난 차례대로 카드를 줄 세운다'], ['➡️', '이어지는 카드 사이에 화살표를 그린다'], ['🎤', '카드를 이어 한 편으로 간추려 소리 내어 발표한다']],
    [['📏', '일이 일어난 차례대로 카드를 줄 세운다'], ['➡️', '이어지는 카드 사이에 화살표를 그린다'], ['🎤', '카드를 이어 한 편으로 간추려 소리 내어 발표한다']],
    [['✏️', '사건 여섯 개를 차례 번호를 붙여 공책에 적는다'], ['➡️', '이어지는 한 쌍에 화살표를 긋는다'], ['📝', '여섯 줄을 이어 세 문장으로 간추린다']],
    [['🔎', '「미안해!」 앞에 일어난 일을 찾는다'], ['👂', '「미안해!」 뒤에 돌아온 소리를 찾는다'], ['🔗', '「~해서 ~했고 ~했다」로 잇는다']]
  ];

  /* 틀 — type · pick(장면 번호 · 늘어나는 차례) | seq(카드 줄 그대로) */
  var T = [
    { type: 'ev_order', pick: [0, 1, 2, 3] },
    { type: 'ev_order', pick: [1, 2, 3, 4] },
    { type: 'ev_order', pick: [2, 3, 4, 5] },
    { type: 'ev_order', pick: [0, 1, 4, 5] },
    { type: 'ev_order', pick: [0, 2, 4, 5] },
    { type: 'ev_order', pick: [1, 3, 4, 5] },
    { type: 'ev_order', pick: [0, 3, 4, 5] },
    { type: 'ev_order', pick: [0, 1, 2] },
    { type: 'ev_order', pick: [1, 2, 3] },
    { type: 'ev_order', pick: [3, 4, 5] },
    { type: 'ev_order', pick: [2, 4, 5] },
    { type: 'ev_order', pick: [1, 4, 5] },
    { type: 'ev_order', pick: [0, 4, 5] },
    { type: 'ev_order', pick: [2, 3, 5] },
    { type: 'cause_echo', seq: CAUSE[0] },
    { type: 'cause_echo', seq: CAUSE[1] },
    { type: 'cause_echo', seq: CAUSE[2] },
    { type: 'cause_echo', seq: CAUSE[3] },
    { type: 'cause_echo', seq: CAUSE[4] },
    { type: 'cause_echo', seq: CAUSE[5] },
    { type: 'cause_echo', seq: CAUSE[6] },
    { type: 'sum_steps', seq: STEPS[0] },
    { type: 'sum_steps', seq: STEPS[1] },
    { type: 'sum_steps', seq: STEPS[2] },
    { type: 'sum_steps', seq: STEPS[3] }
  ];

  var HEAD = {
    ev_order: '「소리 돌려주는 골짜기」에서 일어난 일이에요. 먼저 일어난 일부터 놓아요',
    cause_echo: '규안이가 무엇을 주고, 무엇이 돌아왔나요? 먼저 일어난 일부터 놓아요',
    sum_steps: '이야기를 간추려요. 먼저 하는 일부터 놓아요'
  };
  var ICON = { ev_order: '⛰️', cause_echo: '🔁', sum_steps: '📝' };
  var WHY = {
    ev_order: '크게 외침 → 같은 소리 → 사납게 소리침 → 지침 → 할머니가 알려 줌 → 다정하게 외침 차례예요. 앞부분만 적으면 규안이가 왜 웃으며 내려왔는지 알 수 없어요.',
    cause_echo: '규안이가 무엇을 주었는지에 따라 골짜기가 무엇을 돌려주는지가 달라져요. 준 소리가 앞, 돌아온 소리가 그다음이에요.',
    sum_steps: '차례대로 줄 세우고, 이어지는 카드 사이에 화살표를 그린 뒤, 한 편으로 이어 간추려요.'
  };

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function seqOf(t) {
    var rows = t.pick ? t.pick.map(function (k) { return EV[k]; }) : t.seq;
    return rows.map(function (r) { return { e: r[0], t: r[1] }; });
  }

  function build(t, id, rng) {
    var cards = seqOf(t);
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'eo' + id, l: 'l07', type: t.type, icon: ICON[t.type], prompt: HEAD[t.type],
             cards: perm.map(function (j) { return cards[j]; }), order: order, answer: order.join(','), layout: 'col',
             explain: cards.map(function (c) { return c.t; }).join(' → ') + '. ' + WHY[t.type] };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'echo_order',
    title: '이야기 차례대로',
    T: T, EV: EV, CAUSE: CAUSE, STEPS: STEPS, GIVE: GIVE, BACK: BACK, NEXT: NEXT,
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
      return q.icon + ' ' + q.prompt + '<br>' + q.cards.map(function (c, k) { return MARK[k] + ' ' + c.e + ' ' + c.t; }).join('<br>') +
        '<br>' + q.order.map(function () { return '(　　)'; }).join(' → ');
    },
    printAnswer: function (q) { return q.order.map(function (k) { return MARK[k]; }).join(' → '); },
    printHead: '카드를 놓을 차례대로 기호를 써 보세요. (왼쪽이 먼저)'
  };
}));
