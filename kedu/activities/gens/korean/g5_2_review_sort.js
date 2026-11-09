/* gens/korean/g5_2_review_sort.js — 서평 조각 맞추기 (5학년 2학기 국어 1단원 「작품에 대한 의견을 나누어요」 l10 · l12 · l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 판의 문장은 교과서·지도서 그대로(줄임만).
 * 칸 = 『국어』 59쪽 (2)번 「서평에 들어갈 내용을 정리해 보세요」 붙임 4 표의 네 줄(제목 줄은 뺌 — 문장마다 붙일 칸이 아니라서)
 *   📘 책 소개 · 📜 줄거리 · ✨ 인상적인 부분과 까닭 · ⭐ 책에 대한 평가
 *   (지도서 101쪽 「투명 비닐을 덮어 제목, 책 소개, 줄거리, 인상적인 부분과 그 부분이 인상적인 까닭, 책에 대한 평가 등
 *    서평에 들어갈 내용을 파악하며 읽도록」 · 『국어』 66쪽 스스로 확인하기 셋째 줄도 같은 네 갈래)
 * 문장 출처(지도서 국어 5-2 1단원 100~110쪽 · 『국어』 쪽):
 *   l10  『국어』 58쪽 서평 「달걀이 깨진 순간, 우정이 시작된 순간」(『호랑이를 부탁해』) · 59쪽 붙임 4 표의 「설명」 칸
 *   all  + 『국어』 60쪽 점검하기 「재미있는 까닭 · 새롭고 신선한 까닭 · 감동적인 까닭」 스스로 묻기(→ 평가를 설득력 있게)
 *        + 65쪽 2번 보기 『초록색 약속』 인상적인 문장과 그 문장이 인상적인 까닭
 * 진단 축(지도서 100쪽 지도의 유의점 「단순히 책의 줄거리를 쓰는 데 그치지 않고 … 좋거나 아쉬운 까닭을 함께」 · 101쪽 활동의 유의점):
 *   말 덫 ① 장면을 말해도 「가장 인상적인 부분은 … 장면」이면 줄거리가 아니라 ✨ (일어난 일을 차례로 늘어놓은 것만 📜)
 *   말 덫 ② 「~때문입니다」가 붙어도 추천하는 까닭이면 ⭐ (장면이 인상적인 까닭이면 ✨)
 * params: { upto: 'l10'|'all' }  l10 = 10·11차시 서평 글과 붙임 4 · all = 단원 전체(점검하기 · 마무리 보기까지)
 * next() → { item, tag, w, cat, type, why, src, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_review_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l10', 'l12'];
  var CATS = [{ key: 'intro', label: '📘 책 소개' }, { key: 'plot', label: '📜 줄거리' },
              { key: 'impress', label: '✨ 인상적인 부분과 까닭' }, { key: 'judge', label: '⭐ 책에 대한 평가' }];
  var NAME = { intro: '책 소개', plot: '줄거리', impress: '인상적인 부분과 까닭', judge: '책에 대한 평가' };
  /* 칸이 하는 일 = 『국어』 59쪽 붙임 4 표 「설명」 칸 */
  var DOES = { intro: '책 소개에는 책의 제목, 작가, 대상 독자, 주제, 특징을 간단히 써요.',
               plot: '줄거리에는 책에서 일어난 일 가운데 중요한 일을 골라 차례대로 써요.',
               impress: '인상적인 부분에는 기억에 남는 장면이나 표현과 그 부분이 마음에 남은 까닭을 써요.',
               judge: '책에 대한 평가에는 책의 좋은 점이나 아쉬운 점, 누구에게 추천하는지와 그 까닭을 써요.' };
  var BOOK = '『호랑이를 부탁해』 서평', HOW = '서평 쓰는 법', CHECK = '점검하기', GREEN = '『초록색 약속』';

  /* [차시, 칸, 자료, 문장, 풀이, 덧붙임 풀이(선택 — 말 덫)] */
  var S = [
    // ── l10 · 『국어』 58쪽 서평 「달걀이 깨진 순간, 우정이 시작된 순간」
    ['l10', 'intro', BOOK, '『호랑이를 부탁해』는 어린이 장편 동화예요', '책의 제목과 갈래를 알려 줘요.'],
    ['l10', 'intro', BOOK, '5학년 4반 아이들이 달걀 부화 실험을 해요', '어떤 아이들의 무슨 이야기인지 간단히 알려 줘요.'],
    ['l10', 'intro', BOOK, '아이들이 겪는 사건과 성장을 그린 이야기예요', '책의 주제와 특징을 한마디로 알려 줘요.'],
    ['l10', 'plot', BOOK, '선생님의 제안으로 달걀 부화 실험을 시작해요', '이야기의 처음에 일어난 일이에요.'],
    ['l10', 'plot', BOOK, '아이들은 함께 부화기를 만들고 기다려요', '실험을 하며 일어난 일을 차례대로 말해요.'],
    ['l10', 'plot', BOOK, '난장판이 된 교실과 깨진 달걀을 발견해요', '「그러던 어느 날」 일어난 사건이에요.'],
    ['l10', 'plot', BOOK, '「검은 모자」를 쓴 사람이 용의자로 지목돼요', '사건이 이어지는 차례를 말해요.'],
    ['l10', 'plot', BOOK, '아이들은 남은 달걀을 지키기로 마음을 모아요', '아이들이 한 일을 차례대로 말해요.'],
    ['l10', 'plot', BOOK, '마침내 병아리들을 무사히 부화시켜요', '「마침내」 — 사건이 풀린 차례예요.'],
    ['l10', 'plot', BOOK, '닭을 보내는 과정에서 「검은 모자」의 정체가 드러나요', '이야기 끝에 일어난 일이에요.'],
    ['l10', 'impress', BOOK, '가장 인상적인 부분은 「검은 모자」와 대화하는 장면이에요', '기억에 남는 장면을 골랐어요.', '장면을 말해도 「가장 인상적인 부분은」이면 줄거리가 아니에요.'],
    ['l10', 'impress', BOOK, '서로 이해하고 용서하는 과정을 생생하게 보여 주기 때문이에요', '그 장면이 인상적인 까닭이에요.', '「때문이에요」가 붙었지만 장면이 인상적인 까닭이라 평가가 아니에요.'],
    ['l10', 'judge', BOOK, '저는 이 책을 우리 반 친구들에게 추천하고 싶어요', '누구에게 추천하는지 밝혀요.'],
    ['l10', 'judge', BOOK, '함께 문제를 풀며 더불어 성장함을 잘 보여 주기 때문이에요', '이 책을 추천하는 까닭이에요.', '「때문이에요」가 붙었지만 추천하는 까닭이라 책에 대한 평가예요.'],
    ['l10', 'judge', BOOK, '미안하다고 말할 용기를 깊이 생각해 볼 수 있어요', '책의 좋은 점을 말해요.'],
    ['l10', 'judge', BOOK, '친구 관계로 고민하는 친구에게 다정한 선물이 될 거예요', '어떤 독자에게 도움이 될지 평가해요.'],
    // ── l10 · 『국어』 59쪽 붙임 4 표 「설명」 칸
    ['l10', 'intro', HOW, '책의 제목, 작가, 대상 독자, 주제를 간단히 써요', '붙임 4 표의 「책 소개」 설명이에요.'],
    ['l10', 'plot', HOW, '중요한 일을 골라 차례대로 간단히 정리해요', '붙임 4 표의 「줄거리」 설명이에요.'],
    ['l10', 'impress', HOW, '기억에 남는 장면이나 표현과 그 까닭을 써요', '붙임 4 표의 「인상적인 부분과 까닭」 설명이에요.'],
    ['l10', 'judge', HOW, '책의 좋은 점이나 아쉬운 점을 써요', '붙임 4 표의 「책에 대한 평가」 설명이에요.'],
    ['l10', 'judge', HOW, '누구에게 추천하는지와 그 까닭도 함께 써요', '붙임 4 표의 「책에 대한 평가」 설명이에요.'],
    // ── l12 · 『국어』 60쪽 점검하기 · 65쪽 2번 보기
    ['l12', 'judge', CHECK, '이 책이 재미있는 까닭은 무엇일까?', '평가를 설득력 있게 말하려고 스스로 묻는 질문이에요.'],
    ['l12', 'judge', CHECK, '이 책이 새롭고 신선한 까닭은 무엇일까?', '평가를 설득력 있게 말하려고 스스로 묻는 질문이에요.'],
    ['l12', 'judge', CHECK, '이 책이 감동적인 까닭은 무엇일까?', '평가를 설득력 있게 말하려고 스스로 묻는 질문이에요.'],
    ['l12', 'impress', GREEN, '「무서워도 한 걸음 내딛는 마음」이라는 문장', '기억에 남는 표현(인상적인 문장)을 골랐어요.'],
    ['l12', 'impress', GREEN, '친구를 돕는 주인공과 잘 어울려서 기억에 남았어요', '그 문장이 인상적인 까닭이에요.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(r) {
    return { l: r[0], cat: r[1], type: r[1], tag: r[2], w: r[3], src: r[2], why: r[4], item: r[2] + ' — ' + r[3],
             explain: '「' + r[3] + '」 — ' + NAME[r[1]] + ' 칸이에요. ' + r[4] + ' ' + (r[5] ? r[5] + ' ' : '') + DOES[r[1]] };
  }

  return {
    id: 'g5_2_review_sort',
    title: '서평 조각 맞추기',
    categories: CATS,
    S: S, ORDER: ORDER, NAME: NAME, DOES: DOES,
    create: function (params, rng) {
      var p = params || {};
      var upto = p.upto === 'l10' ? 'l10' : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : 0;
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var deck = shuffle(rng, idx);
      var last = -1, lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (k === last) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k;
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.w + ' → □ 책 소개 □ 줄거리 □ 인상적인 부분과 까닭 □ 책에 대한 평가'; },
    printAnswer: function (q) { return q.w + ' → ' + NAME[q.cat]; },
    printHead: '서평의 한 문장을 읽고, 서평에 들어갈 내용 가운데 어느 칸에 들어갈지 □에 ✓ 하세요.'
  };
}));
