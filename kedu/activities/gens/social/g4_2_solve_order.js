/* gens/social/g4_2_solve_order.js — 지역문제 해결 차례대로 (4학년 2학기 사회 2단원 「지역문제를 해결하고 지역을 알리는 노력」 l05 · l07 · l08 · l12 · l15)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기) — 엔진 무개변, 생성기만 새로. 교과서판 2학기 — 카드 글은 교과서·지도서 그대로.
 * params: { upto: 'l05'|'l07'|'all' } · next() → { prompt, icon, cards:[{t,e}](섞임), order, answer, layout:'row', type, explain, l }
 *
 * 차례의 원천(지도서 4-2 사회 2단원 · 『사회』 쪽):
 *   해결 과정   지도서 124쪽 「교과서에서는 지역문제 해결 과정을 '문제 확인 → 문제 발생 원인 파악 → 문제 해결 방안 탐색 → 문제 해결 방안 결정
 *              → 문제 해결 방안 실천'의 순서로 구성」 · 『사회』 66쪽 「문제가 일어난 원인을 알아야」 · 69쪽 「원인을 알아본 후에 해결 방안을 찾습니다」
 *              · 74쪽 「해결 방안을 정한 다음에는 구체적으로 계획을 세워서 실천」
 *   시원이네    『사회』 64쪽 설문 조사 결과로 주차 문제 정하기 · 66~68쪽 자료로 원인 찾기(주차 공간이 부족) · 69~70쪽 토의로 해결 방안 내기
 *              · 69쪽 장단점 비교 → 대화와 타협 → 알맞은 방안 · 74쪽 ① 시청 게시판에 오후 6시 이후 공공 기관 주차장 개방 요청 → 주민 간의 다툼이 줄어듦
 *   방안 고르기 지도서 138쪽 5~6차시 주요 내용 「다양한 해결 방안 제시하기 → 해결 방안 평가하기 → 대화와 타협으로 의견 조정하기 → 해결 방안 선택하기」
 *              · 『사회』 71~72쪽 할 수 있어요 1) 붙임쪽지 세 장 → 2) 평가 기준 점수 → 3) ❷ 계속·멈춰 칸 → ❸ 계속 칸에 세 장
 *   알리기      지도서 176쪽 12~13차시 주요 내용 「① 소개하고 싶은 자랑거리를 정함 ② 모둠 친구들과 소개 방법을 정함 ③ 소개 방법에 알맞은 소개 자료를 만듦」
 *              · 『사회』 93쪽 사회 관계망 서비스에 올리기(자료를 만든 뒤 게시) · 92쪽 안내도 ❶ 백지도에 색칠 ❷ 특징 설명 자료 붙이기 ❸ 선으로 이어 완성
 * type(문항 단위 · 진단 축):
 *   sv_step  해결 과정 이름(3~4장) — 1단원 「해결 방안을 먼저 결정」(『사회』 25쪽 꼭! 기억해요 ×) 꼴의 앞당김을 겨눈다
 *   sv_case  시원이네 주차 문제 걸음(3장)
 *   sv_pick  해결 방안을 고르는 걸음(3장 — 고르기 과정 · 붙임쪽지 놀이)
 *   pr_make  자랑거리 소개 자료 만들기 걸음(3장 — 소개 과정 · 안내도)
 * 카드 글에 번호·「먼저/나중」 0 · 「실천」이 든 판은 l07 · 알리기 판은 l12.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_solve_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l05', 'l07', 'l12'];
  var SET = {
    step: [['🔎', '문제 확인'], ['📊', '원인 파악'], ['💡', '해결 방안 탐색'], ['⚖️', '해결 방안 결정'], ['💪', '해결 방안 실천']],
    cased: [['🗳️', '설문 조사로 주차 문제 정하기'], ['📈', '자료로 부족한 주차 공간 찾기'], ['💬', '토의로 해결 방안 내기'],
            ['⚖️', '장단점 견주어 방안 정하기'], ['📝', '시청 게시판에 개방 요청 글'], ['😊', '주민 간의 다툼이 줄어듦']],
    pick: [['💡', '다양한 해결 방안 제시하기'], ['📝', '해결 방안 평가하기'], ['🤝', '대화와 타협으로 의견 조정하기'], ['✅', '해결 방안 선택하기']],
    note: [['🗒️', '붙임쪽지 세 장에 방안 쓰기'], ['🔢', '평가 기준으로 점수 매기기'], ['🚦', '계속·멈춰 칸으로 옮기기'], ['3️⃣', '계속 칸에 세 장 모으기']],
    promo: [['⭐', '소개할 자랑거리 정하기'], ['🗣️', '모둠과 소개 방법 정하기'], ['🖍️', '알맞은 소개 자료 만들기'], ['📱', '사회 관계망 서비스에 올리기']],
    map: [['🗺️', '백지도에 색칠하기'], ['📌', '특징 설명 자료 붙이기'], ['〰️', '선으로 이어 완성하기']]
  };

  /* 틀 — [차시, type, 카드 묶음, 카드 번호(바른 차례)] */
  var T = [
    ['l05', 'sv_step', 'step', [0, 1, 2, 3]], ['l05', 'sv_step', 'step', [0, 1, 2]], ['l05', 'sv_step', 'step', [1, 2, 3]], ['l05', 'sv_step', 'step', [0, 1, 3]],
    ['l07', 'sv_step', 'step', [1, 2, 3, 4]], ['l07', 'sv_step', 'step', [0, 2, 3, 4]], ['l07', 'sv_step', 'step', [0, 1, 3, 4]], ['l07', 'sv_step', 'step', [0, 1, 2, 4]],
    ['l05', 'sv_case', 'cased', [0, 1, 2]], ['l05', 'sv_case', 'cased', [1, 2, 3]], ['l05', 'sv_case', 'cased', [0, 2, 3]],
    ['l07', 'sv_case', 'cased', [2, 3, 4]], ['l07', 'sv_case', 'cased', [3, 4, 5]], ['l07', 'sv_case', 'cased', [1, 3, 4]], ['l07', 'sv_case', 'cased', [0, 4, 5]],
    ['l05', 'sv_pick', 'pick', [0, 1, 2]], ['l05', 'sv_pick', 'pick', [1, 2, 3]], ['l05', 'sv_pick', 'pick', [0, 2, 3]], ['l05', 'sv_pick', 'pick', [0, 1, 3]],
    ['l05', 'sv_pick', 'note', [0, 1, 2]], ['l05', 'sv_pick', 'note', [1, 2, 3]], ['l05', 'sv_pick', 'note', [0, 1, 3]],
    ['l12', 'pr_make', 'promo', [0, 1, 2]], ['l12', 'pr_make', 'promo', [1, 2, 3]], ['l12', 'pr_make', 'promo', [0, 2, 3]], ['l12', 'pr_make', 'map', [0, 1, 2]]
  ];

  var ICON = { sv_step: '🧩', sv_case: '🚗', sv_pick: '🗳️', pr_make: '📣' };
  var HEAD = {
    step: '지역문제를 해결하는 과정이에요. 먼저 하는 것부터 놓아요',
    cased: '시원이네 모둠이 주차 문제를 해결했어요. 먼저 한 일부터 놓아요',
    pick: '해결 방안을 고르는 과정이에요. 먼저 하는 것부터 놓아요',
    note: '붙임쪽지로 해결 방안을 골라요. 먼저 하는 것부터 놓아요',
    promo: '우리 지역의 자랑거리를 소개해요. 먼저 하는 것부터 놓아요',
    map: '자랑거리 안내도를 만들어요. 먼저 하는 것부터 놓아요'
  };
  var WHY = {
    step: '문제 확인 → 원인 파악 → 해결 방안 탐색 → 해결 방안 결정 → 해결 방안 실천 차례예요. 해결 방안은 원인을 알아본 뒤에 찾고, 정한 다음에 실천해요.',
    cased: '시원이네 모둠은 설문 조사 결과로 주차 문제를 정하고, 자료로 원인을 찾고, 토의로 방안을 낸 뒤 장단점을 견주어 정하고 실천했어요. 실천하니 주민 간의 다툼이 줄어들었어요.',
    pick: '해결 방안을 여럿 내고, 평가하고, 대화와 타협으로 의견을 조정한 뒤 골라요.',
    note: '붙임쪽지에 방안을 쓰고, 평가 기준으로 점수를 매긴 뒤, 계속·멈춰 칸으로 옮기며 계속 칸에 세 장이 모일 때까지 되풀이해요.',
    promo: '소개할 자랑거리를 먼저 정하고, 소개 방법을 정한 뒤, 그 방법에 알맞은 자료를 만들어요. 만든 자료는 사회 관계망 서비스에 올려 알릴 수 있어요.',
    map: '백지도에 색칠하고, 특징을 설명하는 자료를 붙인 뒤, 선으로 이어 안내도를 완성해요.'
  };

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

  function build(row, id, rng) {
    var set = SET[row[2]], seq = row[3];
    var cards = seq.map(function (k) { return { e: set[k][0], t: set[k][1] }; });
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'sv' + id, l: row[0], type: row[1], icon: ICON[row[1]], prompt: HEAD[row[2]], set: row[2],
             cards: perm.map(function (j) { return cards[j]; }), order: order, answer: order.join(','), layout: 'row',
             explain: cards.map(function (c) { return c.t; }).join(' → ') + '. ' + WHY[row[2]] };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'g4_2_solve_order',
    title: '지역문제 해결 차례대로',
    T: T, SET: SET, ORDER: ORDER, WHY: WHY,
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
