/* gens/korean/g5_2_adjust_order.js — 의견 조정 차례 잇기 (5학년 2학기 국어 4단원 「의견을 조정해요」 l02 · l06 · l13)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)가 쓴다 — 토의 말 카드 3~4장을 의견을 조정하는 차례로 놓는다.
 * 차례의 뼈대 = 『국어』 196쪽 3번 학급 토의 절차(붙임 7) — 토의 주제 정하기 → 의견 마련하기 → 의견 나누기
 *   → 의견 모으기(① 의견을 검토할 기준 마련하기 → ② 의견의 장점과 단점 검토하기 → ③ 합의점 찾기) → 의견 결정하기   (단계 1~7)
 *   의견 모으기 세 방법 = 186쪽 3번 붙임 6 「의견을 조정하는 방법」.
 * 카드 출처(지도서 국어 5-2 4단원 228~250쪽 · 『국어』 쪽):
 *   talk  l02  『국어』 182~184쪽 1번 토의 「우리 반 언어폭력 문제 해결」 — 사회자 · 민찬 · 수영 · 혜진의 말(줄임)
 *   step  l06  『국어』 196쪽 3번 학급 토의 절차 표의 「활동」 칸
 *   board all  『국어』 204쪽 마무리 1번 토의 「보드게임 문제」 — 사회자 · 민수 · 예진 · 지원 (교과서 글이 기준 마련에서 멈춰 세 단계)
 * 지도서 228쪽 지도의 유의점: 『국어』는 의견 조정 과정을 선형적으로 제시하지만 실제로는 앞 절차로 되돌아갈 수도 있다 → 풀이에 한 줄.
 * type = 무엇을 보고 차례를 정하나 — gather 의견 모으기 세 방법(기준 → 장단점 → 합의점) · open 토의 앞부분(주제·마련·나누기) · close 합의점 다음 결정
 * params: { upto: 'l02'|'l06'|'all' }
 * next() → { prompt, icon, cards:[{e, t}](섞인 차례), order, answer, layout:'col', type, chain, stages, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_adjust_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l02', 'l06', 'l13'];
  var STAGE = ['', '토의 주제 정하기', '의견 마련하기', '의견 나누기', '의견을 검토할 기준 마련하기', '의견의 장점과 단점 검토하기', '합의점 찾기', '의견 결정하기'];
  var MC = '🎤', ST = '🙋', PEN = '📝';
  /* C[사슬][단계] = [[그림, 카드 글], …] — 단계마다 고를 수 있는 말 */
  var C = {
    talk: {
      1: [[MC, '사회자 — 우리 반 언어폭력 문제를 해결할 방법을 찾아봐요']],
      2: [[MC, '사회자 — 각자 의견과 타당한 이유를 마련해 주세요']],
      3: [[ST, '민찬 — 누리 소통망 사용을 당분간 제한하면 좋겠어요'], [ST, '수영 — 언어폭력 예방 홍보 활동을 하면 어떨까요?'], [ST, '혜진 — 규칙을 어기면 다 같이 벌을 받으면 좋겠어요']],
      4: [[MC, '사회자 — 의견을 검토할 기준을 제안해 주세요'], [ST, '민찬 — 우리가 실천할 수 있는 방법인지 봐야 해요'], [ST, '수영 — 문제 해결에 효과적인 방법인지 봐야 해요'], [ST, '혜진 — 여러 사람에게 도움이 되는 방법인지 봐야 해요']],
      5: [[MC, '사회자 — 기준에 따라 장점과 단점을 검토해 봅시다'], [ST, '수영 — 소통망 제한은 효과적이지만 좋은 기능도 못 써요'], [ST, '혜진 — 홍보는 쉽게 실천하지만 효과가 오래가기 어려워요'], [ST, '민찬 — 규칙이 안 지켜지면 학급 분위기가 나빠질 수 있어요']],
      6: [[MC, '사회자 — 모두가 동의할 만한 의견으로 수정해 봅시다'], [ST, '민찬 — 소통망 규칙을 새로 정해 홍보하면 어떨까요?'], [ST, '혜진 — 규칙을 잘 실천한 학생에게 상을 주면 어떨까요?']],
      7: [[MC, '사회자 — 수정한 의견으로 우리 반이 실천할 의견을 결정해요']]
    },
    step: {
      1: [[PEN, '학급 토의 주제를 정한다']],
      2: [[PEN, '주제에 적합한 의견을 마련한다']],
      3: [[PEN, '마련한 의견을 발표한다']],
      4: [[PEN, '의견을 검토할 기준을 마련한다']],
      5: [[PEN, '기준에 따라 의견의 장점과 단점을 검토한다']],
      6: [[PEN, '검토한 내용을 바탕으로 의견을 조정해 합의점을 찾는다']],
      7: [[PEN, '학급에서 실천할 의견을 최종 결정한다']]
    },
    board: {
      1: [[MC, '사회자 — 보드게임 때 공간 부족과 소음 문제를 토의로 풀어요']],
      3: [[ST, '민수 — 보드게임을 하는 인원을 제한하면 좋겠어요'], [ST, '예진 — 보드게임을 하는 요일을 정하면 어떨까요?'], [ST, '지원 — 보드게임을 하는 장소와 규칙을 정하면 어떨까요?']],
      4: [[MC, '사회자 — 장점과 단점을 검토하기 위한 기준을 정해 봅시다'], [ST, '예진 — 문제를 효과적으로 해결할 수 있어야 해요']]
    }
  };
  var CHAIN = { talk: ['l02', '「우리 반 언어폭력 문제」 토의'], step: ['l06', '학급 토의 절차'], board: ['l13', '「보드게임 문제」 토의'] };
  var ICON = { talk: '🗣️', step: '📋', board: '🎲' };
  var HEAD = {
    gather: '의견을 조정하는 차례로 놓아요 — 기준을 정하고, 장단점을 검토하고, 합의점을 찾아요',
    open: '토의가 시작되는 차례로 놓아요 — 주제를 정하고 의견을 마련해 나누어요',
    close: '합의점을 찾은 다음에 무엇을 할까요? 토의 차례로 놓아요'
  };
  /* 틀 = [사슬, 갈래, 단계들] — 갈래는 단계로 정해진다(gather: 4·5·6 다 · close: 6·7 · open: 그 밖) */
  var FR = [];
  function typeOf(st) { return st.indexOf(4) >= 0 && st.indexOf(5) >= 0 && st.indexOf(6) >= 0 ? 'gather' : (st.indexOf(6) >= 0 && st.indexOf(7) >= 0 ? 'close' : 'open'); }
  ['talk', 'step'].forEach(function (ch) {
    [1, 2, 3, 7].forEach(function (x) { FR.push([ch, [4, 5, 6, x].sort()]); });                             // gather 4
    [[1, 2, 3, 4], [1, 2, 3, 5], [1, 2, 4, 5], [1, 3, 4, 5], [2, 3, 4, 5]].forEach(function (s) { FR.push([ch, s]); });   // open 5
    [[1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5], [3, 4], [3, 5]].forEach(function (p) { FR.push([ch, p.concat([6, 7])]); });   // close 9
  });
  FR.push(['board', [1, 3, 4]]);
  FR.forEach(function (f) { f[1].sort(function (a, b) { return a - b; }); f.push(typeOf(f[1])); });

  var WHY = {
    gather: '의견 모으기는 ① 의견을 검토할 기준을 마련하고 ② 기준에 따라 장점과 단점을 검토한 뒤 ③ 모두가 동의할 만한 합의점을 찾는 차례예요.',
    open: '토의는 주제를 정하고, 각자 의견을 마련한 뒤, 의견을 나누면서 시작해요. 기준은 의견이 다 나온 다음에 정해요.',
    close: '장단점을 고려해 합의점을 찾은 다음에 학급에서 실천할 의견을 결정해요.'
  };
  var BACK = ' 실제 토의에서는 필요하면 앞 절차로 되돌아갈 수도 있어요.';

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(f, id, rng) {
    var ch = f[0], st = f[1], type = f[2];
    var cards = st.map(function (s) { var opt = C[ch][s]; var c = opt[Math.floor(rng() * opt.length)]; return { e: c[0], t: c[1] }; });
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'ao' + id, l: CHAIN[ch][0], type: type, chain: ch, stages: st.slice(), icon: ICON[ch], prompt: CHAIN[ch][1] + ' — ' + HEAD[type],
             cards: perm.map(function (j) { return cards[j]; }), order: order, answer: order.join(','), layout: 'col',
             explain: st.map(function (s) { return STAGE[s]; }).join(' → ') + '. ' + WHY[type] + BACK };
  }
  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'g5_2_adjust_order',
    title: '의견 조정 차례 잇기',
    C: C, FR: FR, STAGE: STAGE, CHAIN: CHAIN, HEAD: HEAD, WHY: WHY, ORDER: ORDER, typeOf: typeOf,
    create: function (params, rng) {
      var p = params || {};
      var upto = (p.upto === 'l02' || p.upto === 'l06') ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      FR.forEach(function (f, k) { if (ORDER.indexOf(CHAIN[f[0]][0]) <= lim) idx.push(k); });
      var deck = shuffle(rng, idx), last = -1, lastType = '', n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) { deck = shuffle(rng, idx); if (deck.length > 1 && deck[0] === last) deck.push(deck.shift()); }
          var at = 0;
          for (var t = 0; t < deck.length; t++) { if (FR[deck[t]][2] !== lastType) { at = t; break; } }   // 같은 갈래 연달아 줄이기
          var k = deck.splice(at, 1)[0]; last = k; lastType = FR[k][2];
          return build(FR[k], k + '_' + (n++), rng);
        },
        check: function (pick, q) { return String(pick) === String(q.answer); }
      };
    },
    printRender: function (q) {
      return q.icon + ' ' + q.prompt + '<br>' + q.cards.map(function (c, k) { return MARK[k] + ' ' + c.e + ' ' + c.t; }).join('<br>') +
        '<br>' + q.order.map(function () { return '(　　)'; }).join(' → ');
    },
    printAnswer: function (q) { return q.order.map(function (k) { return MARK[k]; }).join(' → '); },
    printHead: '토의에서 의견을 조정하는 차례대로 기호를 써 보세요. (왼쪽이 앞)'
  };
}));
