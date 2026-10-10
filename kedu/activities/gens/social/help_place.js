/* gens/social/help_place.js — 어떤 일을 하는 곳? (3학년 1학기 사회 1단원 「우리가 사는 곳」 l07·l08 — 도움을 주는 장소)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l08 s05·s06 세 무리: 🦺 안전을 지키는 곳 · 💊 건강을 돌보는 곳 · 📖 배우고 즐기는 곳 (s07 짧은 이름 안전 · 건강 · 배움·즐거움).
 *   정본 l08 「도움을 주는 장소는 하는 일에 따라 세 무리로 묶을 수 있어요」 · 오개념 「모든 장소가 똑같은 일을 한다」.
 * 문장 = 장소가 하는 일 한 줄 · 밑줄 = 하는 일. 칸은 밑줄 친 하는 일이 정한다.
 *   l07 = 장소 이름이 드러난 문장(정본 l07 s06 「병원 — 건강 · 소방서·경찰서 — 안전 · 도서관 — 배움」).
 *   l08 = 「이곳」 문장 — 장소 이름을 감추고 하는 일만 보고 가른다. 밑줄에 칸 이름(안전·건강·배움·즐거) 0.
 *   l08 에서 처음 나오는 곳(보건소 · 놀이터 · 학교 보건실·도서실)은 l08 부터.
 * 정본에서 세 무리 어디에도 딱 맞지 않거나 무리가 갈리는 곳(우체국 — s07 「새 무리」 · 시장 · 공원 · 교무실)은 넣지 않는다.
 * params: { upto: 'l07'|'l08'|'all' }  l07 부터 그 차시까지 누적 · 이번 차시 문장이 덱 앞머리 (all = l08 까지 — l13 정리용)
 * next() → { item, pre, w, post, cat, type, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['help_place'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07', 'l08'];
  var CATS = [{ key: 'safe', label: '🦺 안전' }, { key: 'health', label: '💊 건강' }, { key: 'learn', label: '📖 배움·\u200b즐거움' }];   // \u200b = 좁은 칸에서 「배움·」 뒤로만 꺾임
  var WHY = { safe: '불을 끄고 위험을 막는 일이라서 안전을 지키는 곳이에요.',
              health: '아픈 사람을 낫게 하고 돌보는 일이라서 건강을 돌보는 곳이에요.',
              learn: '책을 읽고 배우거나 즐겁게 노는 일이라서 배우고 즐기는 곳이에요.' };

  /* [차시, 무리, 앞, 하는 일(밑줄), 뒤] */
  var S = [
    // l07 — 도움을 주는 장소(정본 s05·s06·s09·s10·s14) · 장소 이름이 드러난다
    ['l07', 'safe', '소방서는 ', '불을 끄고 사람을 구해요', '.'],
    ['l07', 'safe', '경찰서는 ', '위험을 막아 우리를 지켜요', '.'],
    ['l07', 'safe', '사이렌이 울려요. 소방서에서 ', '불을 끄러 달려와요', '.'],
    ['l07', 'safe', '밤에도 소방서는 ', '위험에서 사람을 구하려고 자리를 지켜요', '.'],
    ['l07', 'health', '병원은 ', '아픈 사람을 치료해요', '.'],
    ['l07', 'health', '곰이가 배가 아파서 병원에서 ', '치료를 받았어요', '.'],
    ['l07', 'health', '병원은 ', '우리 건강을 돌봐 줘요', '.'],
    ['l07', 'learn', '도서관은 ', '책을 빌려줘요', '.'],
    ['l07', 'learn', '도서관에서 ', '조용히 책을 읽으며 배워요', '.'],
    ['l07', 'learn', '펭이가 도서관에서 ', '궁금한 것을 책으로 찾아 배웠어요', '.'],
    // l08 — 하는 일에 따라 묶어요(정본 s05·s06·s09·s10·s11·s14) · 「이곳」 = 장소 이름을 감춘다 · 학교 안내판의 방
    ['l08', 'safe', '이곳에서는 ', '불을 끄고 위험에 빠진 사람을 구해요', '.'],
    ['l08', 'safe', '이곳에서는 ', '나쁜 일과 위험한 일을 막아요', '.'],
    ['l08', 'safe', '이곳 사람들은 ', '불이 나면 소방차를 타고 달려가요', '.'],
    ['l08', 'safe', '이곳에서는 ', '길을 잃은 아이를 찾아 집에 데려다줘요', '.'],
    ['l08', 'health', '이곳에서는 ', '아픈 사람을 치료해요', '.'],
    ['l08', 'health', '이곳에서는 ', '다친 곳을 살피고 약을 줘요', '.'],
    ['l08', 'health', '보건소에서는 ', '아픈 데가 없는지 살펴 줘요', '.'],
    ['l08', 'health', '학교 보건실에서는 ', '넘어져 다친 친구를 돌봐 줘요', '.'],
    ['l08', 'learn', '이곳에서는 ', '책을 빌려주고 읽게 해요', '.'],
    ['l08', 'learn', '이곳에서는 ', '친구와 미끄럼틀을 타며 놀아요', '.'],
    ['l08', 'learn', '놀이터에서는 ', '그네를 타며 신나게 뛰어놀아요', '.'],
    ['l08', 'learn', '학교 도서실에서는 ', '읽고 싶은 책을 골라 읽어요', '.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], pre: s[2], w: s[3], post: s[4], item: s[2] + s[3] + s[4],
             explain: '「' + s[3] + '」 — ' + WHY[s[1]] };
  }

  return {
    id: 'help_place',
    title: '어떤 일을 하는 곳?',
    categories: CATS,
    S: S,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return S[k][0] === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, lastW = '', lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (k === last || S[k][3] === lastW) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 무리 두 번 넘게 잇따름 0 · 같은 하는 일 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k; lastW = S[k][3];
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + '<u>' + q.w + '</u>' + q.post + ' → □ 안전 □ 건강 □ 배움·즐거움'; },
    printAnswer: function (q) { return q.w + ' → ' + CATS.filter(function (c) { return c.key === q.cat; })[0].label.replace(/^\S+ /, '').replace(/\u200b/g, ''); },
    printHead: '밑줄 친 하는 일을 보고, 그곳이 안전·건강·배움·즐거움 가운데 어느 무리인지 □에 ✓ 하세요.'
  };
}));
