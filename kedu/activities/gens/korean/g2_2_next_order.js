/* gens/korean/g2_2_next_order.js — 이어질 이야기 차례대로 (2학년 2학기 국어 8단원 「나도 작가」 l07 = 7·8차시 · l09 = 9·10차시 · l14 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기) — 엔진 무개변, 생성기만 새로(계약 = echo_order 그대로).
 * params: { upto: 'l07'|'l09'|'all' }  단원 처음부터 그 차시까지 누적 · 그 차시 틀이 덱 앞머리
 * next() → { prompt, icon, cards:[{t,e}](섞임), order, answer, layout:'col', type, explain, l }
 *
 * 차례의 원천 = 교과서 활동 그대로(지도서 8단원):
 *   『국어』 249쪽 3번 「일이 일어난 차례대로 빈칸에 번호를 써 봅시다」(지도서 331쪽) — 네 장면 카드 글 그대로(한 판은 교과서 네 장 그대로)
 *     + 『국어』 244~248쪽 「빈집에 온 손님」 사건(엄마 아빠 말씀 · 빈집 · 담요 · 어둠뿐) — 정본 l07 s05 간추린 이야기 다섯 줄
 *   지도서 333쪽 참고 자료 「빈집에 온 손님」 뒷이야기 · 331쪽 대안 활동 「원작의 이어질 이야기와 자신의 이야기를 비교」 — 정본 l07 s08 · s15 · s17
 *   『국어』 256쪽 계획하기 (1) 「일이 일어난 차례대로 정리해 보세요」 붙임 6 다섯 장면(지도서 337쪽) — 카드 글 그대로 · 정본 l09 s05 · s12 도전
 *   『국어』 258쪽 이야기 표현하기 놀이 「카드 속 상황이 이어질 때 미지가 어떻게 행동할지」(지도서 338쪽) — 정본 l09 s11 · s12 심화 예시 · 설명서 사용 방법
 *   『국어활동』 104~107쪽 「밤에도 놀면 안 돼?」 뒷이야기(지도서 329쪽 참고 자료 · 335쪽 활용 방안 「소원이 이루어질 때 어떤 일이 일어날지」)
 * type(문항 단위 · 진단 축 = 무엇을 보고 차례를 정하는가):
 *   gs_order  「빈집에 온 손님」 일이 일어난 차례 — 교과서 249쪽 네 장면 + 간추린 사건
 *   gs_after  원작에 이어진 이야기 — 어둠뿐 → 담요 가지러 → … → 오소리 아줌마(흐름과 성격: 책임감 있는 금방울이 용기를 냄)
 *   mj_order  「오, 미지의 택배」 일이 일어난 차례 — 교과서 256쪽 붙임 6 다섯 장면
 *   mj_next   미지의 이어질 장면 — 설명서대로 · 운동화를 신은 까닭(보고 싶은 누군가)에 맞게
 *   nt_after  「밤에도 놀면 안 돼?」 뒷이야기 — 소원이 이루어진 뒤 두 인물의 생각이 바뀜
 * 카드에 번호·먼저/나중·처음·마지막·끝·그다음 0 · 그림(e)에 숫자 0 · 처음부터 맞게 놓인 판 0 · 한 판 안 같은 글·같은 그림 0.
 * 작품 본문은 옮기지 않는다 — 장면 카드는 교과서 활동 카드 글 · 정본 간추린 줄 · 지도서 뒷이야기의 줄거리 한 줄씩.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g2_2_next_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07', 'l09'];

  /* 「빈집에 온 손님」 사건 — 일어난 차례대로. ★ = 『국어』 249쪽 카드 글 그대로 */
  var GS = [
    ['👪', '엄마 아빠가 할머니 댁에 가시며 동생들을 잘 돌보라고 하셨다'],
    ['🌧️', '하늘이 어둑해지자 금방울이 동생들을 찾기 시작했다'],             // ★
    ['🏚️', '금방울이 빈집에 갔지만 동생들은 보이지 않았다'],
    ['🔥', '금방울이 집에서 동생들을 만났다'],                               // ★
    ['🚪', '낯선 손님이 문을 두드렸지만 금방울은 문을 열어 주지 않았다'],     // ★
    ['🧸', '작은방울의 담요를 빈집에 두고 온 것이 생각났다'],
    ['🎵', '금방울이 작은방울을 업고 자장가를 불러 주었다'],                 // ★
    ['🌑', '문틈으로 보니 덩치는 없고 어둠뿐이었다']
  ];
  var BOOK = [1, 3, 4, 6];   // 『국어』 249쪽 네 장면
  /* 원작에 이어진 이야기(지도서 333쪽) — 첫 줄은 교과서 이야기의 마지막 장면 */
  var GA = [
    GS[7],
    ['🧺', '금방울이 용기를 내어 담요를 가지러 빈집으로 갔다'],
    ['😱', '빈집 창문 안의 커다란 눈을 보고 놀라 도망쳤다'],
    ['🍯', '꿀물도 자장가도 작은방울을 달래지 못했다'],
    ['🛋️', '다시 가 보니 덩치가 담요를 덮고 아파서 떨고 있었다'],
    ['🪵', '금방울이 장작과 따뜻한 차를 빈집에 넣어 주었다'],
    ['🦡', '아침에 보니 덩치는 아기를 안은 오소리 아줌마였다']
  ];
  /* 「오, 미지의 택배」 — ★ = 『국어』 256쪽 붙임 6 카드 글 그대로 */
  var MJ = [
    ['🎂', '미지는 자기 앞으로 온 택배를 받으면 어른이라고 정해 두었다'],
    ['📦', '어느 날 미지에게 택배가 도착했다'],                  // ★
    ['🏢', '미지는 경비실에서 파란색 택배 상자를 찾아왔다'],     // ★
    ['👟', '택배 상자 안에 운동화가 들어 있었다'],               // ★
    ['📜', '미지는 제품 설명서를 발견하고 읽었다'],              // ★
    ['🐇', '미지는 운동화를 신고 폴짝폴짝 세 번 뛰었다']          // ★
  ];
  /* 미지의 이어질 장면 — 설명서 사용 방법 · 정본 l09 s11(하늘나라에 닿아 두리번) · s12 심화 예시(두 장면) */
  var MN = [
    MJ[4], MJ[5],
    ['🏃', '미지는 숨이 찰 때까지 힘껏 달렸다'],
    ['☁️', '미지가 달리고 달려 하늘나라에 닿았다'],
    ['👀', '보고 싶었던 누군가를 찾아 두리번거렸다'],
    ['🤗', '반갑게 안고 이야기를 나누었다'],
    ['👋', '시간이 다 되어 손을 흔들고 다시 힘껏 달려왔다']
  ];
  /* 「밤에도 놀면 안 돼?」 뒷이야기(『국어활동』 · 지도서 329쪽) — 깜깜이 생각(4)과 태양이 생각(5)은 한 판에 함께 넣지 않는다(때가 겹침) */
  var NT = [
    ['🌙', '깜깜이와 태양이의 소원이 모두 이루어졌다'],
    ['🎤', '태양이는 밤새 맛있는 음식을 먹고 노래하고 숨바꼭질을 했다'],
    ['🌅', '날이 밝자 태양이와 깜깜이는 각자 집으로 돌아갔다'],
    ['🛏️', '깜깜이는 또 잠자리에 들었지만 잠이 오지 않았다'],
    ['🦇', '깜깜이는 밤에는 밖에 나가 놀아야겠다고 생각했다'],
    ['😴', '태양이는 밤에는 잠을 푹 자야겠다고 생각했다']
  ];
  var SRC = { gs_order: GS, gs_after: GA, mj_order: MJ, mj_next: MN, nt_after: NT };
  var LES = { gs_order: 'l07', gs_after: 'l07', nt_after: 'l07', mj_order: 'l09', mj_next: 'l09' };

  /* 틀 — type · pick(사건 번호 · 늘어나는 차례) */
  var P = {
    gs_order: [BOOK, [0, 1, 3, 4], [1, 2, 3, 4], [3, 4, 5, 6], [4, 5, 6, 7], [0, 2, 4, 6], [1, 3, 6, 7], [2, 3, 5, 7], [0, 1, 2], [3, 4, 6], [5, 6, 7], [1, 4, 7], [2, 4, 5]],
    gs_after: [[0, 1, 2], [0, 1, 4, 5], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [1, 4, 5, 6], [0, 1, 5, 6], [1, 2, 5], [4, 5, 6], [0, 2, 6], [1, 3, 6]],
    mj_order: [[1, 2, 3, 4], [2, 3, 4, 5], [1, 2, 4, 5], [1, 3, 4, 5], [1, 2, 3, 5], [0, 1, 2, 3], [0, 2, 3, 5], [0, 1, 4, 5], [1, 2, 3], [3, 4, 5], [0, 1, 2], [2, 4, 5], [0, 3, 5]],
    mj_next: [[1, 2, 3, 4], [0, 1, 3, 4], [3, 4, 5, 6], [2, 3, 4, 5], [1, 3, 5, 6], [0, 1, 2], [3, 4, 5], [4, 5, 6], [1, 3, 4], [2, 4, 6], [0, 3, 6]],
    nt_after: [[0, 1, 2], [0, 1, 2, 3], [1, 2, 3, 4], [0, 2, 3, 4], [0, 1, 3, 4], [1, 2, 3], [2, 3, 4], [0, 1, 5], [0, 2, 5], [1, 2, 5], [0, 1, 2, 5]]
  };
  var T = [];
  Object.keys(P).forEach(function (ty) { P[ty].forEach(function (pk) { T.push({ type: ty, l: LES[ty], pick: pk }); }); });

  var HEAD = {
    gs_order: '「빈집에 온 손님」에서 일어난 일이에요. 먼저 일어난 일부터 놓아요',
    gs_after: '원작에서는 이야기가 이렇게 이어져요. 먼저 일어난 일부터 놓아요',
    mj_order: '「오, 미지의 택배」에서 일어난 일이에요. 먼저 일어난 일부터 놓아요',
    mj_next: '미지의 이야기가 이어져요. 흐름에 맞게 먼저 일어날 일부터 놓아요',
    nt_after: '「밤에도 놀면 안 돼?」 뒷이야기예요. 먼저 일어난 일부터 놓아요'
  };
  var ICON = { gs_order: '🏚️', gs_after: '🦡', mj_order: '📦', mj_next: '👟', nt_after: '🦇' };
  var WHY = {
    gs_order: '동생 찾기 → 동생 만나기 → 낯선 손님 → 자장가 차례로 이야기가 흘러가요. 일이 일어난 차례를 알면 이어질 이야기를 상상할 수 있어요.',
    gs_after: '책임감 있는 금방울은 무서워도 동생을 위해 용기를 내요. 원작과 다르게 상상해도 흐름과 인물의 성격에 맞으면 좋은 이야기예요.',
    mj_order: '택배 도착 → 경비실에서 상자 찾기 → 상자 속 운동화 → 제품 설명서 읽기 → 운동화 신고 세 번 뛰기 차례예요.',
    mj_next: '설명서에 적힌 대로 세 번 뛰고 힘껏 달려요. 미지가 운동화를 신은 까닭(보고 싶은 누군가)을 생각하면 흐름에 맞는 이어질 이야기가 돼요.',
    nt_after: '소원이 이루어져 밤새 놀고, 날이 밝아 집에 간 뒤에 두 인물의 생각이 바뀌어요. 일이 일어난 차례대로 놓아요.'
  };

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function seqOf(t) { return t.pick.map(function (k) { var r = SRC[t.type][k]; return { e: r[0], t: r[1] }; }); }

  function build(t, id, rng) {
    var cards = seqOf(t);
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'no' + id, l: t.l, type: t.type, icon: ICON[t.type], prompt: HEAD[t.type],
             cards: perm.map(function (j) { return cards[j]; }), order: order, answer: order.join(','), layout: 'col',
             explain: cards.map(function (c) { return c.t; }).join(' → ') + '. ' + WHY[t.type] };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'g2_2_next_order',
    title: '이어질 이야기 차례대로',
    T: T, P: P, GS: GS, GA: GA, MJ: MJ, MN: MN, NT: NT, BOOK: BOOK, HEAD: HEAD, WHY: WHY,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 ? p.upto : 'all';
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
    printHead: '일이 일어난 차례대로 기호를 써 보세요. (왼쪽이 먼저)'
  };
}));
