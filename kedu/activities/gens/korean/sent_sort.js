/* gens/korean/sent_sort.js — 뒷부분은 어느 갈래? (3학년 1학기 국어 2단원 「분명하고 유창하게」 l02·l05)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * params: { upto: 'l02'|'l05'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 문장이 덱 앞머리
 * next() → { item:'콩이가 뛰어갑니다.', a:'콩이가', b:'뛰어갑니다.', cat:'act'|'state'|'what', type, explain, l }
 *
 * 칸 = 정본 l02 세 갈래: 어찌하다(움직임) · 어떠하다(상태) · 무엇이다(무엇인지).
 * type = 칸 그대로(act·state·what) — 수첩이 「어느 갈래를 헷갈리나」를 보여 준다. 정본 l02 오개념 축은
 *   「뒷부분은 모두 움직임」 → state 를 act 칸에 넣는 실수가 state miss 로 잡힌다.
 * 문장은 늘 「누가/무엇이 + 뒷부분」 두 부분 — 화면은 두 부분을 나눠 그린다(정본 l02 1교시 빗금 그대로, 갈래 표시는 0).
 * l05 = 단오 문장(정본 l05 제재). 단오 낱말은 l05 전 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['sent_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l02', 'l05'];
  var CATS = [{ key: 'act', label: '어찌하다' }, { key: 'state', label: '어떠하다' }, { key: 'what', label: '무엇이다' }];
  var WHY = {
    act: '몸으로 할 수 있는 움직임이라 어찌하다예요.',
    state: '「어떠하니?」에 답이 되는 상태라 어떠하다예요.',
    what: '무엇인지 알려 주니 무엇이다예요.'
  };

  /* [차시, 갈래, 앞부분, 뒷부분] */
  var S = [
    ['l02', 'act', '콩이가', '뛰어갑니다.'], ['l02', 'act', '콩이가', '짖습니다.'], ['l02', 'act', '새가', '날아갑니다.'],
    ['l02', 'act', '아이들이', '웃습니다.'], ['l02', 'act', '물이', '흐릅니다.'], ['l02', 'act', '동생이', '우유를 마십니다.'],
    ['l02', 'act', '고양이가', '잠을 잡니다.'], ['l02', 'act', '바람이', '붑니다.'], ['l02', 'act', '강아지가', '꼬리를 흔듭니다.'],
    ['l02', 'act', '민주가', '책을 읽습니다.'],
    ['l02', 'state', '콩이는', '귀엽습니다.'], ['l02', 'state', '콩이는', '작습니다.'], ['l02', 'state', '하늘이', '파랗습니다.'],
    ['l02', 'state', '꽃이', '빨갛습니다.'], ['l02', 'state', '꽃이', '예쁩니다.'], ['l02', 'state', '민주는', '친절합니다.'],
    ['l02', 'state', '바다가', '넓습니다.'], ['l02', 'state', '얼음이', '차갑습니다.'], ['l02', 'state', '수박이', '달콤합니다.'],
    ['l02', 'state', '교실이', '조용합니다.'],
    ['l02', 'what', '민주는', '3학년 학생입니다.'], ['l02', 'what', '콩이는', '강아지입니다.'], ['l02', 'what', '그는', '농부입니다.'],
    ['l02', 'what', '사과는', '과일입니다.'], ['l02', 'what', '장미는', '꽃입니다.'], ['l02', 'what', '이것은', '연필입니다.'],
    ['l02', 'what', '우리 엄마는', '선생님입니다.'], ['l02', 'what', '고래는', '바다 동물입니다.'],
    // l05 단오 문장(정본 l05)
    ['l05', 'act', '사람들은', '그네를 탑니다.'], ['l05', 'act', '아이들이', '씨름을 합니다.'], ['l05', 'act', '누나가', '창포물에 머리를 감습니다.'],
    ['l05', 'act', '사람들은', '씨름을 합니다.'],
    ['l05', 'state', '수리취떡은', '둥급니다.'], ['l05', 'state', '창포물이', '향기롭습니다.'], ['l05', 'state', '단오 잔치는', '즐겁습니다.'],
    ['l05', 'what', '단오는', '명절입니다.'], ['l05', 'what', '단오는', '즐거운 명절입니다.'], ['l05', 'what', '수리취떡은', '단오 떡입니다.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function build(s) {
    var b0 = s[3].replace(/\.$/, '');
    return { l: s[0], item: s[2] + ' ' + s[3], a: s[2], b: s[3], cat: s[1], type: s[1],
             explain: '「' + b0 + '」 — ' + WHY[s[1]] };
  }

  return {
    id: 'sent_sort',
    title: '뒷부분은 어느 갈래?',
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
      var deck = [], last = -1, lastCat = '', run = 0;
      deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) { deck = shuffle(rng, idx); }
          // 같은 갈래가 세 번 넘게 잇따르지 않게(규칙성이 답을 주지 않게) · 같은 문장 연달아 0
          function find() {
            for (var t = 0; t < deck.length; t++) {
              var k = deck[t];
              if (k === last) continue;
              if (run >= 2 && S[k][1] === lastCat) continue;
              return t;
            }
            return -1;
          }
          var pickAt = find();
          if (pickAt < 0) { deck = deck.concat(shuffle(rng, idx)); pickAt = find(); }   // 남은 덱이 한 갈래뿐이면 새 덱을 뒤에 이어 고른다
          var k2 = deck.splice(pickAt, 1)[0];
          run = S[k2][1] === lastCat ? run + 1 : 0; lastCat = S[k2][1]; last = k2;
          return build(S[k2]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.a + ' / <u>' + q.b + '</u> → □ 어찌하다 □ 어떠하다 □ 무엇이다'; },
    printAnswer: function (q) { return q.item + ' → ' + CATS.filter(function (c) { return c.key === q.cat; })[0].label; },
    printHead: '밑줄 친 뒷부분이 어느 갈래인지 □에 ✓ 하세요.'
  };
}));
