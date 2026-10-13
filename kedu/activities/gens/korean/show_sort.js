/* gens/korean/show_sort.js — 색일까, 크기일까, 모양일까? (3학년 2학기 국어 2단원 「유창하게 읽고 발표해요」 l07 · l08 · l13)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l07 s06 셋: 🎨 색 — 서로 다른 것을 구별 · 🔠 크기 — 중요한 것을 눈에 띄게 · 🔷 모양 — 어디에 있는지, 어느 쪽인지.
 *   「크기」·「모양」은 l07 에서 처음 나온다 → 이 활동은 l07 부터.
 * 문장 = 안내·발표 자료 하나 + 밑줄 = 그 자료로 하려는 일. 칸은 하려는 일이 정한다(정본 s06 「이렇게 했어요 ↔ 그 까닭」을 거꾸로 — 까닭을 보고 고른다).
 * 문장·밑줄에 칸 이름(색·크기·모양)·크게·화살표·동그라미·굵은 0 — 어떻게 나타낼지는 아이가 고른다.
 * 진단 축(정본 오개념):
 *   l07 「그림은 보기 좋게 꾸미려고」 → 모든 문장이 「~게 하고 싶어요」 — 하려는 일이 먼저, 꾸미기 문장 0
 *   l08 「알록달록하고 글씨가 모두 클수록」 → 크기 = 「가장」 중요한 것 하나(풀이 「모두 크게 쓰면 무엇이 중요한지 알 수 없어요」)
 *   말 덫: 「한눈에」가 든 색 문장(서로 다른 칸) · 「다른」이 든 크기 문장(다른 글자보다 가장 먼저) · 「가장」이 든 모양 문장(가장 가까운 계단에서 어느 쪽)
 * params: { upto: 'l07'|'all' }  l07 = 7차시(도서관·사물함·표시판·책에 붙인 번호·물 마시는 곳) · all = 10차시까지(줄넘기·우산 안내문·운동장 — l13 마무리도 all)
 * next() → { item, pre, w, post, cat, type, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['show_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07', 'l08'];
  var CATS = [{ key: 'color', label: '🎨 색' }, { key: 'size', label: '🔠 크기' }, { key: 'shape', label: '🔷 모양' }];
  var WHY = { color: '색은 서로 다른 것을 구별해 보여 줘요.',
              size: '크기는 중요한 것을 눈에 띄게 해요.',
              shape: '모양은 어디에 있는지, 어느 쪽인지 알려 줘요.' };
  var USE = { color: '색을', size: '크기를', shape: '모양을' };
  var NAME = { color: '색', size: '크기', shape: '모양' };
  var END = ' 하고 싶어요.';

  /* [차시, 칸, 앞, 밑줄(하려는 일), 뒤, 자료(연달아 막기), 덧붙임 풀이(선택 — 덫)] */
  var S = [
    // l07 — 정본 l07 s04~s07·s12·s13(도서관 안내 · 3층 평면 그림 · 사물함 · 교실 문 표시판 · 책에 붙인 번호 · 출석 번호 · 물 마시는 곳)
    ['l07', 'color', '3층 평면 그림에서 ', '교실과 도서관이 서로 다른 곳으로 보이게', END, '평면 그림'],
    ['l07', 'color', '교실 문 표시판에서 ', '우리 반과 옆 반 표시판이 서로 구별되게', END, '표시판'],
    ['l07', 'color', '책에 붙인 번호 안내에서 ', '칸마다 꽂을 책이 서로 구별되게', END, '책'],
    ['l07', 'color', '사물함 안내에서 ', '모둠마다 칸이 서로 다르다는 것이 한눈에 보이게', END, '사물함', '「한눈에」가 있어도 하려는 일은 서로 다른 칸을 나누어 보이는 거예요.'],
    ['l07', 'size', '사물함 안내에서 ', '가장 중요한 번호가 눈에 띄게', END, '사물함'],
    ['l07', 'size', '도서관 안내에서 ', '「도서관」이라는 이름이 가장 먼저 눈에 들어오게', END, '도서관'],
    ['l07', 'size', '교실 문 표시판에서 ', '몇 학년 몇 반인지가 가장 먼저 눈에 들어오게', END, '표시판'],
    ['l07', 'size', '책에 붙인 번호 안내에서 ', '다른 글자보다 번호가 가장 먼저 눈에 들어오게', END, '책', '「다른」이 있어도 하려는 일은 가장 중요한 것을 먼저 보이게 하는 거예요.'],
    ['l07', 'shape', '도서관 안내에서 ', '가장 가까운 계단을 올라와 어느 쪽으로 가는지 알게', END, '도서관', '「가장」이 있어도 하려는 일은 가는 쪽을 알려 주는 거예요.'],
    ['l07', 'shape', '3층 평면 그림에서 ', '도서관이 어디에 있는지 알게', END, '평면 그림'],
    ['l07', 'shape', '물 마시는 곳 안내에서 ', '복도에서 어느 쪽으로 가야 하는지 알게', END, '물 마시는 곳'],
    ['l07', 'shape', '교실 안내에서 ', '우리 교실이 복도 어디에 있는지 알게', END, '교실'],
    // l08 — 정본 l08 s03·s04·s05·s07·s11·s12(줄넘기 발표 자료 · 우산 안내문 · 운동장에 붙일 자료 · 제목 · 도막)
    ['l08', 'color', '줄넘기 발표 자료에서 ', '뛰는 방법 세 가지가 서로 구별되게', END, '뛰는 방법'],
    ['l08', 'color', '우산 안내문에서 ', '우산꽂이와 물기를 터는 곳이 서로 달라 보이게', END, '우산'],
    ['l08', 'color', '줄넘기 발표 자료에서 ', '네 도막이 서로 다른 내용이라는 것이 한눈에 보이게', END, '도막', '「한눈에」가 있어도 하려는 일은 서로 다른 것을 나누어 보이는 거예요.'],
    ['l08', 'size', '줄넘기 발표 자료에서 ', '제목이 가장 먼저 눈에 들어오게', END, '제목'],
    ['l08', 'size', '우산 안내문에서 ', '바쁜 아침에도 가장 중요한 한 줄이 눈에 띄게', END, '우산', '모두 크게 쓰면 무엇이 중요한지 알 수 없어요.'],
    ['l08', 'size', '운동장에 붙일 자료에서 ', '「한 걸음 떨어져서!」가 가장 먼저 눈에 들어오게', END, '운동장'],
    ['l08', 'shape', '줄넘기 발표 자료에서 ', '손잡이를 어느 쪽으로 당겨야 하는지 알게', END, '손잡이'],
    ['l08', 'shape', '우산 안내문에서 ', '우산꽂이가 교실 어디에 있는지 알게', END, '우산'],
    ['l08', 'shape', '운동장에 붙일 자료에서 ', '줄넘기를 하는 곳이 운동장 어디인지 알게', END, '운동장']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], pre: s[2], w: s[3], post: s[4], item: s[2] + s[3] + s[4], obj: s[5],
             explain: '「' + s[3] + '」 — ' + (s[6] ? s[6] + ' ' : '') + WHY[s[1]] + ' 그래서 ' + USE[s[1]] + ' 써요.' };
  }

  return {
    id: 'show_sort',
    title: '색일까, 크기일까, 모양일까?',
    categories: CATS,
    S: S,
    ORDER: ORDER,
    NAME: NAME,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var deck = shuffle(rng, idx);
      var last = -1, lastObj = '', lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (k === last || S[k][5] === lastObj) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0 · 같은 자료 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k; lastObj = S[k][5];
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + '<u>' + q.w + '</u>' + q.post + ' → □ 색 □ 크기 □ 모양'; },
    printAnswer: function (q) { return q.w + ' → ' + NAME[q.cat]; },
    printHead: '밑줄 친 일을 하려면 색·크기·모양 가운데 무엇을 쓰면 좋을까요? □에 ✓ 하세요.'
  };
}));
