/* gens/korean/g1_2_event_order.js — 일이 일어난 차례 (1학년 2학기 국어 4단원 「감동을 나누어요」 l03 · l06 · l08 · l10 · l14 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)가 쓴다.
 * 근거 = 지도서(국어 1-2 ㉮ 4단원) 180~195쪽:
 *   l03 『국어』 114~117쪽 「미역도 맛있어」 — 지도서 183쪽 대안 활동 「문장 카드를 차례대로 정리」의 예시 문장 넷 그대로
 *       (주원이는 미역무침을 먹기 싫어했다 → 서윤이가 주원이에게 미역무침을 먹어 보라고 했다 → 주원이는 용기 내어 미역무침을 먹어 보았다 →
 *        선생님께서 주원이를 칭찬해 주셨다) · 지도서 183쪽 「들려줄 이야기의 다른 예」 「신나는 물감 놀이」
 *   l06 『국어』 118~122쪽 「소금을 만드는 맷돌」 — 122쪽 「시간을 나타내는 말」(어느 날 아침 → 저녁이 되자 → 깊은 밤) · 일어난 일 차례
 *   l08 『국어』 124~127쪽 「빨간 모자가 된 아이쿠」 — 127쪽 5번 붙임딱지 네 문장 그대로
 *   l10 『국어』 128~131쪽 「아기 거북이가 숲으로 왔어요!」 — 130쪽 「일어난 일을 차례대로」 네 문장 그대로
 *   지도서 177쪽 평가 지도 방안 「시간 표현에만 집중하고 사건의 인과 관계를 고려하지 않으면」 → cause_next 축 ·
 *   정본 data/g1s2_korean_u4.js l06 오개념 「차례는 이야기에 먼저 나온 낱말 차례대로」 → time_word 축(시간을 나타내는 말을 따라간다).
 * params: { upto: 'l03'|'l06'|'l08'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 틀이 덱 앞머리 (l10·l14 = all)
 * next() → { prompt, icon, cards:[{t,e}](섞임), order:[바른 차례의 카드 번호], answer:'2,0,1', layout:'col', type, explain, l }
 *
 * type(문항 단위 · 진단 축 — 무엇을 보고 차례를 정하는가):
 *   who_did    누가 무엇을 했는지 — 인물이 한 일을 차례로 (생활 이야기)
 *   time_word  시간을 나타내는 말 — 어느 날 아침 → 저녁 → 깊은 밤 · 토요일 → 일요일 (때를 알려 주는 말을 따라간다)
 *   cause_next 앞 일과 뒤 일 — 앞 일이 있어야 뒤 일이 생긴다 (소금이 쏟아져서 → 배가 기우뚱 → 바닷속에)
 *   cartoon    만화 영화에서 있었던 일 — 본 장면을 떠올려 차례로
 * 카드는 한 장마다 「누가 … 다」 한 문장(4단원 「누가 무엇을 했는지」 그대로) · 차례 흔적 낱말(먼저·그다음·마지막·처음·끝) 0 ·
 * 차례가 둘로 읽히는 틀 0 · 처음부터 맞게 놓인 판 0(다시 섞기). 작품 본문은 옮기지 않고 교과서·지도서의 정리 문장만 쓴다.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g1_2_event_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l03', 'l06', 'l08', 'l10'];
  var PROMPT = {
    who_did: '누가 무엇을 했는지 생각하며 차례로 놓아요',
    time_word: '시간을 나타내는 말을 찾아 차례로 놓아요',
    cause_next: '앞 일 때문에 뒤 일이 생겨요. 차례로 놓아요',
    cartoon: '만화 영화에서 있었던 일을 차례로 놓아요'
  };

  /* 틀 — l 차시 · type · icon · src 이야기 이름 · seq 바른 차례 [문장, 그림] · why 풀이 끝말 */
  var T = [
    // l03 「미역도 맛있어」 · 「신나는 물감 놀이」
    { l: 'l03', type: 'who_did', icon: '🥗', src: '미역도 맛있어',
      seq: [['주원이는 미역무침을 먹기 싫어했다', '🙅'], ['서윤이가 주원이에게 미역무침을 먹어 보라고 했다', '🗣️'], ['주원이는 용기 내어 미역무침을 먹어 보았다', '😣'], ['선생님께서 주원이를 칭찬해 주셨다', '👏']],
      why: '먹기 싫던 주원이에게 서윤이가 권했고, 주원이가 용기를 내어 먹자 선생님께서 칭찬해 주셨어요.' },
    { l: 'l03', type: 'who_did', icon: '🥗', src: '미역도 맛있어',
      seq: [['서윤이가 미역무침을 맛있게 먹었다', '😋'], ['주원이는 고개를 절레절레 저었다', '🙅'], ['주원이는 눈을 질끈 감고 미역무침을 먹어 보았다', '😖']],
      why: '서윤이가 맛있게 먹는 모습을 보고도 주원이는 고개를 저었어요. 그 뒤에 눈을 질끈 감고 먹어 보았어요.' },
    { l: 'l03', type: 'who_did', icon: '🎨', src: '신나는 물감 놀이',
      seq: [['훈이네 반 친구들이 미술실에서 물감 놀이를 했다', '🎨'], ['주은이가 실수로 훈이 옷에 물감을 묻혔다', '👕'], ['훈이가 주은이에게 큰 소리로 말했다', '📢'], ['주은이가 작은 목소리로 미안하다고 했다', '🙏']],
      why: '물감 놀이를 하다가 주은이가 실수로 물감을 묻혔고, 훈이가 큰 소리로 말하자 주은이가 미안하다고 했어요.' },
    { l: 'l03', type: 'cause_next', icon: '🥗', src: '미역도 맛있어',
      seq: [['주원이가 미역무침을 모두 다 먹었다', '🍽️'], ['선생님께서 주원이를 칭찬해 주셨다', '👏'], ['주원이는 어깨가 으쓱해졌다', '😊']],
      why: '미역무침을 다 먹었기 때문에 칭찬을 받았고, 칭찬을 받아서 어깨가 으쓱해졌어요.' },

    // l06 「소금을 만드는 맷돌」 — 시간을 나타내는 말 · 앞 일과 뒤 일
    { l: 'l06', type: 'time_word', icon: '🪨', src: '소금을 만드는 맷돌',
      seq: [['어느 날 아침, 사람들이 시장에 모여 맷돌 이야기를 했다', '🌅'], ['저녁이 되자 도둑이 궁궐로 숨어들었다', '🌆'], ['깊은 밤, 도둑이 몰래 맷돌을 훔쳐 도망갔다', '🌙']],
      why: '시간을 나타내는 말을 따라가요 — 어느 날 아침 → 저녁 → 깊은 밤.' },
    { l: 'l06', type: 'time_word', icon: '🪨', src: '소금을 만드는 맷돌',
      seq: [['어느 날 아침, 도둑이 사람들의 맷돌 이야기를 몰래 들었다', '👂'], ['저녁이 되자 도둑이 궁궐로 숨어들었다', '🌆'], ['깊은 밤, 도둑이 몰래 맷돌을 훔쳐 도망갔다', '🌙'], ['도둑이 배를 타고 바다를 건넜다', '⛵']],
      why: '어느 날 아침 → 저녁 → 깊은 밤에 맷돌을 훔친 뒤에야 배를 타고 바다를 건너요.' },
    { l: 'l06', type: 'time_word', icon: '📅', src: '시간을 나타내는 말',
      seq: [['토요일에 지우가 할머니 댁에 갔다', '🏡'], ['일요일에 지우가 할머니와 고구마를 캤다', '🍠'], ['월요일에 지우가 친구들에게 고구마를 나누어 주었다', '🎒']],
      why: '토요일 → 일요일 → 월요일. 「토요일에」처럼 때를 알려 주는 말을 보면 차례를 알 수 있어요.' },
    { l: 'l06', type: 'time_word', icon: '⏰', src: '시간을 나타내는 말',
      seq: [['아침에 민호가 운동장에서 줄넘기를 했다', '🌅'], ['점심에 민호가 친구들과 급식을 먹었다', '🍱'], ['저녁에 민호가 그림일기를 썼다', '🌙']],
      why: '아침 → 점심 → 저녁. 하루의 때를 알려 주는 말을 따라 놓아요.' },
    { l: 'l06', type: 'cause_next', icon: '🧂', src: '소금을 만드는 맷돌',
      seq: [['도둑이 “나와라, 소금!” 하고 외쳤다', '🗣️'], ['맷돌에서 하얀 소금이 쏟아져 나왔다', '🧂'], ['소금이 쌓여 배가 기우뚱거렸다', '⛵'], ['맷돌이 도둑과 함께 바닷속에 가라앉았다', '🌊']],
      why: '소금이 나오라고 외쳐서 소금이 쏟아졌고, 소금이 쌓여 배가 기우뚱거리다가 바닷속에 가라앉았어요.' },
    { l: 'l06', type: 'cause_next', icon: '🌊', src: '소금을 만드는 맷돌',
      seq: [['맷돌이 도둑과 함께 바닷속에 가라앉았다', '🌊'], ['바닷속에서도 맷돌이 쉬지 않고 돌았다', '🔄'], ['바닷물이 짜게 되었다', '🧂']],
      why: '바닷속에 가라앉은 맷돌이 쉬지 않고 돌아서 바닷물이 짜게 되었대요.' },

    // l08 「빨간 모자가 된 아이쿠」 (만화 영화)
    { l: 'l08', type: 'cartoon', icon: '🌼', src: '빨간 모자가 된 아이쿠',
      seq: [['아이쿠가 할머니 댁에 가기로 했다', '🏠'], ['아이쿠와 비비가 할머니께 꽃을 따 드리기로 했다', '🌼'], ['아이쿠가 할머니로 변장한 카르망 콩드 백작을 만났다', '🎩'], ['꽃을 선물받은 카르망 콩드 백작에게 이상한 반응이 생겼다', '🤧']],
      why: '할머니 댁에 가기로 하고, 꽃을 따 드리기로 했어요. 할머니 댁에서 변장한 백작을 만나 꽃을 주자 이상한 반응이 생겼어요.' },
    { l: 'l08', type: 'cause_next', icon: '🤧', src: '빨간 모자가 된 아이쿠',
      seq: [['아이쿠가 변장한 백작을 할머니라고 불렀다', '🎩'], ['아이쿠가 백작에게 꽃을 선물했다', '💐'], ['백작이 콧물을 흘리며 재채기를 했다', '🤧']],
      why: '아이쿠는 백작을 할머니인 줄 알고 꽃을 주었어요. 꽃을 받은 뒤에 백작은 콧물이 나고 재채기를 했어요.' },

    // l10 「아기 거북이가 숲으로 왔어요!」 (만화 영화)
    { l: 'l10', type: 'cartoon', icon: '🐢', src: '아기 거북이가 숲으로 왔어요!',
      seq: [['꽁지가 거북알을 발견했다', '🥚'], ['아기 거북이 까투리 가족을 따라 집으로 갔다', '🐾'], ['아기 거북과 꽁지는 재미있게 놀았다', '🛝'], ['아기 거북이 다시 가족을 만났다', '🤗']],
      why: '꽁지가 거북알을 찾고, 아기 거북이 까투리 가족을 따라가 함께 놀다가, 마침내 다시 가족을 만났어요.' },
    { l: 'l10', type: 'cartoon', icon: '🐢', src: '아기 거북이가 숲으로 왔어요!',
      seq: [['아기 거북이 혼자 늦게 알에서 깨어났다', '🐣'], ['아기 거북이 까투리 가족을 따라 집으로 갔다', '🐾'], ['아기 거북이 다시 가족을 만났다', '🤗']],
      why: '혼자 늦게 깨어난 아기 거북은 까투리 가족을 따라갔고, 나중에 다시 가족을 만났어요.' }
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function explainOf(t) {
    var words = t.seq.length === 4 ? ['①', '②', '③', '④'] : ['①', '②', '③'];
    return t.seq.map(function (s, k) { return words[k] + ' ' + s[0]; }).join(' → ') + '. ' + t.why;
  }

  function build(t, k, rng) {
    var cards = t.seq.map(function (s) { return { t: s[0], e: s[1] }; });
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓여 있는 판 0
    var shown = perm.map(function (j) { return cards[j]; });
    var order = idx.map(function (j) { return perm.indexOf(j); });    // 바른 차례 = 섞인 카드 번호
    return { id: 'eo' + k, l: t.l, type: t.type, icon: t.icon, src: t.src, prompt: PROMPT[t.type] + ' — 「' + t.src + '」',
             cards: shown, order: order, answer: order.join(','), layout: 'col', explain: explainOf(t) };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'g1_2_event_order',
    title: '일이 일어난 차례',
    T: T,
    ORDER: ORDER,
    PROMPT: PROMPT,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      T.forEach(function (t, k) { if (ORDER.indexOf(t.l) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return T[k].l === upto; });
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
      return q.icon + ' ' + q.prompt + '<br>' + q.cards.map(function (c, k) { return MARK[k] + ' ' + c.e + ' ' + c.t; }).join('<br>') +
        '<br>' + q.order.map(function () { return '(　　)'; }).join(' → ');
    },
    printAnswer: function (q) { return q.order.map(function (k) { return MARK[k]; }).join(' → '); },
    printHead: '일이 일어난 차례대로 기호를 써 보세요.'
  };
}));
