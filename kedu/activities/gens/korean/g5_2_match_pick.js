/* gens/korean/g5_2_match_pick.js — 어울리는 말에 ○ (5학년 2학기 국어 2단원 「올바른 문장으로 글을 써요」 · 교과서판 2학기)
 * 순수 함수·DOM 무관 (§9-3). 장르 duel_quiz(stream)가 쓴다 — 보기 둘(『국어』 80쪽 2의 (1)번처럼 「알맞은 말에 ○ 표」) 가운데 하나.
 * params: { book: 1|0 }  1 = 첫 판을 『국어』 80쪽 첫 문장(「나는 주말 봉사 활동에 반드시 …」)으로 시작
 * next() → { prompt, sent:[앞, 뒤], answer, wrong, options:[둘 · 섞임], full, kind, group, type, whyAns, explain, src, l }
 *
 * 근거(지도서 국어 5-2 2단원 — 쪽 = 지도서 인쇄 쪽 / 『국어』 쪽):
 *  126~127쪽(『국어』 78~79쪽) 1의 (1)번 — 주어·목적어에 어울리는 서술어: 새가 지저귀다 · 호랑이가 으르렁대다 · 꽃이 피다 · 새싹이 돋다
 *        · 양말을 신다/벗다 · 모자를 쓰다/벗다 · 김치를 담그다 · 송편을 빚다 · 「모자를 신다는 어울리지 않아요」
 *        · 79쪽 문장 탐구 놀이 예시 「동생이 만두를 빚는다 → 동생이 송편을 빚는다」
 *  126쪽 참고 자료 「서술어가 체언을 한정한다」 — 물이 흐른다(나무가 ✕) · 물을/주스를 마신다(빵을 ✕) · 눈을 감는다(입을 ✕) · 입을 다문다(눈을 ✕)
 *  128쪽(『국어』 80~81쪽) 2번 — 반드시 (참석해야 한다) · (결코) 포기하지 않았다 · 왜냐하면 … (감동적이기 때문이다)
 *        · 「장미꽃 피우기」 일기: 여간 … 일이 아니었다 · 도저히 이해되지 않았다 · 별로 어렵지 않았다 · 복잡했기 때문이다
 *        · (4) 반드시 ↔ ……(어)야 하다 · 결코·여간·도저히·별로 ↔ 부정하는 말 · 왜냐하면 ↔ ……(이)기 때문이다
 *  129쪽(『국어』 82~83쪽) 3번 「형섭이의 하루」 — 갯벌 썰매를 타고 조개를 캤다 · 할아버지께서 된장찌개를 끓여 주셨다 · 결코 잊지 못할 것이다
 * 판의 꼴: 문장 한 줄에 빈칸 하나 + 보기 둘(바른 말 · 어울리지 않는 말) → 고르면 빈칸이 채워져 문장이 완성된다.
 * type = 호응 갈래 여섯 — must 반드시 · neg 부정하는 말 · cause 왜냐하면 · subj 주어와 서술어 · obj 목적어와 서술어 · honor 높임
 * whyAns = 무엇과 무엇이 어울려야 했나(「왜 그럴까」 보너스) — word 꾸며 주는 말과 뒤따르는 말 · subj · obj · honor
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_match_pick'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PROMPT = '빈칸에 어울리는 말은 무엇일까요?';
  var KIND_NAME = { must: '반드시 ↔ ……야 하다', neg: '부정하는 말과 어울려요', cause: '왜냐하면 ↔ ……때문이다',
                    subj: '주어 ↔ 서술어', obj: '목적어 ↔ 서술어', honor: '높이는 말끼리' };
  var GROUP = { must: 'word', neg: 'word', cause: 'word', subj: 'subj', obj: 'obj', honor: 'honor' };
  /* 갈래마다 풀이 = 『국어』 81쪽 (4)번 · 78쪽 말풍선 · 83쪽 고친 까닭 */
  var RULE = {
    must: '「반드시」는 「……야 하다」처럼 꼭 그렇게 하거나 되어야 함을 나타내는 말과 호응해요.',
    neg: '「결코, 여간, 도저히, 별로」는 「……지 않다, ……지 못하다, ……가 아니다」처럼 부정하는 말과 호응해요.',
    cause: '「왜냐하면」은 「……기 때문이다」처럼 그렇게 한 까닭을 나타내는 말과 호응해요.',
    subj: '주어와 서술어가 잘 어울려야 해요. 「새가 지저귀다」는 자연스럽지만 「호랑이가 지저귀다」는 어울리지 않아요.',
    obj: '목적어와 서술어가 잘 어울려야 해요. 「모자를 쓰다」는 자연스럽지만 「모자를 신다」는 어울리지 않아요.',
    honor: '「할아버지」는 높임의 대상이라 높임을 표현하는 「께서」와 「-시-」를 넣어요.'
  };

  /* [갈래, 앞, 뒤, 바른 말, 어울리지 않는 말, 근거 쪽] — 빈칸 = 앞과 뒤 사이 */
  var T = [
    ['must', '나는 주말 봉사 활동에 반드시 ', '.', '참석해야 한다', '참석해도 된다', '『국어』 80'],   // 첫 판(book 1)
    ['neg', '우리는 힘들어도 합창 연습을 ', ' 포기하지 않았다.', '결코', '아마', '『국어』 80'],
    ['neg', '장미꽃 접기는 여간 어려운 ', '.', '일이 아니었다', '일이었다', '『국어』 81'],
    ['neg', '자꾸 헷갈려서 도저히 ', '.', '이해되지 않았다', '이해되었다', '『국어』 81'],
    ['neg', '노란 색종이로 다시 접어 보니 별로 ', '.', '어렵지 않았다', '어려웠다', '『국어』 81'],
    ['neg', '그 아름다운 모습은 결코 ', ' 것이다.', '잊지 못할', '잊을', '『국어』 82'],
    ['cause', '왜냐하면 어린 왕자와 여우가 대화하는 장면이 정말 ', '.', '감동적이기 때문이다', '감동적이다', '『국어』 80'],
    ['cause', '왜냐하면 접는 순서가 ', '.', '복잡했기 때문이다', '복잡했다', '『국어』 81'],
    ['subj', '나뭇가지 위에서 새가 ', '.', '지저귄다', '으르렁댄다', '『국어』 78'],
    ['subj', '숲속에서 호랑이가 ', '.', '으르렁댄다', '지저귄다', '『국어』 78'],
    ['subj', '봄이 되자 꽃이 ', '.', '피었다', '으르렁댔다', '『국어』 78'],
    ['subj', '땅에서 새싹이 ', '.', '돋았다', '지저귀었다', '『국어』 78'],
    ['subj', '', ' 흐른다.', '물이', '바위가', '지도서 126'],
    ['obj', '추워서 두꺼운 양말을 ', '.', '신었다', '썼다', '『국어』 78'],
    ['obj', '햇볕이 뜨거워 모자를 ', '.', '썼다', '신었다', '『국어』 78'],
    ['obj', '할머니와 함께 김치를 ', '.', '담갔다', '빚었다', '『국어』 78'],
    ['obj', '추석에 가족과 송편을 ', '.', '빚었다', '담갔다', '『국어』 78·79'],
    ['obj', '목이 말라서 ', ' 마셨다.', '주스를', '빵을', '지도서 126'],
    ['obj', '졸려서 ', ' 감았다.', '눈을', '입을', '지도서 126'],
    ['obj', '비밀을 지키려고 ', ' 꼭 다물었다.', '입을', '눈을', '지도서 126'],
    ['obj', '형과 나는 신나게 ', ' 조개를 캤다.', '갯벌 썰매를 타고', '갯벌 썰매와', '『국어』 82'],
    ['honor', '', ' 된장찌개를 끓여 주셨다.', '할아버지께서', '할아버지가', '『국어』 82'],
    ['honor', '할아버지께서 된장찌개를 끓여 ', '.', '주셨다', '주었다', '『국어』 82']
  ];
  var KINDS = ['must', 'neg', 'cause', 'subj', 'obj', 'honor'];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fullOf(row) { return row[1] + row[3] + row[2]; }
  /* 받침 있으면 「은」 · 없으면 「는」 — 맨 끝 글자로 고른다 */
  function eun(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return (c >= 0 && c < 11172 && c % 28) ? '은' : '는'; }
  function explainOf(row) {
    return '「' + fullOf(row) + '」 — 「' + row[4] + '」' + eun(row[4]) + ' 어울리지 않아요. ' + RULE[row[0]];
  }
  function build(row, id, rng) {
    var opts = shuffle(rng, [row[3], row[4]]);
    return { id: id, l: 'l03', kind: row[0], type: row[0], group: GROUP[row[0]], whyAns: GROUP[row[0]],
             sent: [row[1], row[2]], answer: row[3], wrong: row[4], options: opts, full: fullOf(row), src: row[5],
             prompt: PROMPT + ' — ' + row[1] + '□' + row[2] + ' (' + opts.join(' / ') + ')',
             explain: explainOf(row) };
  }

  return {
    id: 'g5_2_match_pick',
    title: '어울리는 말에 ○',
    T: T, KINDS: KINDS, KIND_NAME: KIND_NAME, GROUP: GROUP, RULE: RULE, PROMPT: PROMPT,
    fullOf: fullOf, explainOf: explainOf, eun: eun,
    create: function (params, rng) {
      params = params || {};
      var book = +(params.book == null ? 1 : params.book) === 1;
      var idx = T.map(function (t, k) { return k; });
      var deck = shuffle(rng, idx), last = -1, lastKind = '', n = 0;
      if (book) { deck.splice(deck.indexOf(0), 1); deck.unshift(0); }        // 첫 판 = 『국어』 80쪽 「반드시」
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 판이 연달아 나오지 않게
          }
          var at = 0;
          for (var t = 0; t < deck.length; t++) { if (T[deck[t]][0] !== lastKind || t === deck.length - 1) { at = t; break; } }   // 같은 갈래 연달아 줄이기
          if (n === 0 && book) at = 0;
          var k = deck.splice(at, 1)[0]; last = k; lastKind = T[k][0];
          return build(T[k], 'mp' + k + '_' + (n++), rng);
        },
        check: function (pick, q) { return String(pick) === q.answer; }
      };
    },
    printRender: function (q) { return q.sent[0] + '( ' + q.options.join(' , ') + ' )' + q.sent[1]; },
    printAnswer: function (q) { return q.full + ' (' + KIND_NAME[q.kind] + ')'; },
    printHead: '문장을 읽고 앞뒤 말과 잘 어울리는 말에 ○ 표를 하세요. 문장에서 앞에 오는 말에 어울리는 말이 뒤따르는 것을 호응이라고 해요.'
  };
}));
