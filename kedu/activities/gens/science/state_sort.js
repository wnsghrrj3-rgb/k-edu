/* gens/science/state_sort.js — 고체일까, 액체일까, 기체일까? (3학년 2학기 과학 1단원 「물체와 물질」 l06·l07)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l07 s04·s07 세 상태: 🧱 고체 · 💧 액체 · 🎈 기체.
 *   l05 는 고체·액체 둘뿐이고 「기체」는 l06 에서 처음 나온다 → 이 활동은 l06 부터(칸 셋이 다 배운 말일 때).
 * 문장 = 물질이 나오는 한 줄 · 밑줄 = 물질. 칸은 밑줄 친 물질의 상태가 정한다. 문장·밑줄에 상태 이름(고체·액체·기체) 0.
 * 진단 축(정본 오개념·주의):
 *   l07 「액체에는 모두 물이 들어 있다」 → 식용유·참기름 = 액체(물 없는 액체)
 *   l07 s06·s11 「타이어 = 고체 · 타이어 속 공기 = 기체」 — 같은 물체의 부분이 상태가 갈린다(고무보트도 같은 꼴)
 *   l06 「공기는 보이지 않으니 없다」 → 보이지 않는 공기도 한 칸을 차지한다
 * 상태가 갈리거나 이 단원 밖인 것(얼음·수증기·가루·연기·비눗방울 막·젤리) 0 — 상태 변화는 4학년.
 * params: { upto: 'l06'|'all' }  l06 = 6차시 말만 · all = 7차시까지(l11 마무리도 all) · 이번 차시 문장이 덱 앞머리
 * next() → { item, pre, w, post, cat, type, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['state_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l06', 'l07'];
  var CATS = [{ key: 'solid', label: '🧱 고체' }, { key: 'liquid', label: '💧 액체' }, { key: 'gas', label: '🎈 기체' }];
  var WHY = { solid: '담는 용기에 관계없이 모양과 부피가 그대로예요.',
              liquid: '담는 용기에 따라 모양은 변하지만 부피는 그대로예요.',
              gas: '담는 용기에 따라 모양이 변하고 그 공간을 가득 채워요.' };

  /* [차시, 상태, 앞, 물질(밑줄), 뒤, 덧붙임 풀이(선택)] */
  var S = [
    // l06 — l05 의 고체·액체 + 공기(정본 l05 s06·s10 · l06 s06·s10·s14)
    ['l06', 'solid', '곰이가 ', '나무 블록', '을 넓은 그릇에 넣었어요.'],
    ['l06', 'solid', '필통에서 ', '지우개', '를 꺼냈어요.'],
    ['l06', 'solid', '', '가위', '로 색종이를 잘라요.'],
    ['l06', 'solid', '펭이가 ', '연필', '을 길쭉한 병에 꽂았어요.'],
    ['l06', 'liquid', '', '우유', '를 넓은 그릇에 부었어요.'],
    ['l06', 'liquid', '', '간장', '을 작은 그릇에 따랐어요.'],
    ['l06', 'liquid', '', '참기름', '을 숟가락에 조금 덜었어요.', '물이 들어 있지 않아도'],
    ['l06', 'liquid', '수조에 ', '물', '을 가득 담았어요.'],
    ['l06', 'gas', '바닷가에서 ', '튜브 속 공기', '가 몸을 띄워 줘요.', '눈에 보이지 않아도'],
    ['l06', 'gas', '', '풍선 속 공기', ' 덕분에 풍선이 동그래요.', '눈에 보이지 않아도'],
    ['l06', 'gas', '', '축구공 속 공기', ' 덕분에 공이 통통 튀어요.', '눈에 보이지 않아도'],
    ['l06', 'gas', '뚜껑을 닫은 ', '페트병 속 공기', '가 물을 밀어냈어요.', '눈에 보이지 않아도'],
    // l07 — 공원·자전거에서 찾기(정본 l07 s03·s05·s06·s10·s11·s14)
    ['l07', 'solid', '공원 의자 옆에 ', '돌', '이 놓여 있어요.'],
    ['l07', 'solid', '', '안경', '을 쓰고 책을 읽어요.'],
    ['l07', 'solid', '자전거 ', '타이어', '가 땅에 닿아 굴러가요.', '속에 공기가 들어 있어도 타이어 자체는'],
    ['l07', 'solid', '', '휠체어', '를 타고 공원을 돌아요.'],
    ['l07', 'liquid', '', '분수대의 물', '이 높이 솟아올라요.'],
    ['l07', 'liquid', '프라이팬에 ', '식용유', '를 둘렀어요.', '물이 들어 있지 않아도'],
    ['l07', 'liquid', '', '물통 속 물', '을 꿀꺽 마셨어요.'],
    ['l07', 'liquid', '공원 옆으로 ', '강물', '이 흘러요.'],
    ['l07', 'gas', '', '비눗방울 속 공기', '가 방울을 둥글게 부풀려요.', '눈에 보이지 않아도'],
    ['l07', 'gas', '펌프로 ', '타이어 속 공기', '를 더 넣었어요.', '타이어는 고체지만 그 속에 든 것은'],
    ['l07', 'gas', '', '고무보트 속 공기', '가 보트를 부풀게 해요.', '눈에 보이지 않아도']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function stem(w) { return w.replace(/ 속 공기$/, '').replace(/의 물$| 속 물$/, ''); }   // 「타이어」↔「타이어 속 공기」 연달아 0
  function build(s) {
    var name = CATS.filter(function (c) { return c.key === s[1]; })[0].label.replace(/^\S+ /, '');
    return { l: s[0], cat: s[1], type: s[1], pre: s[2], w: s[3], post: s[4], item: s[2] + s[3] + s[4],
             explain: '「' + s[3] + '」 — ' + (s[5] ? s[5] + ' ' : '') + WHY[s[1]] + ' 그래서 ' + name + '예요.' };
  }

  return {
    id: 'state_sort',
    title: '고체일까, 액체일까, 기체일까?',
    categories: CATS,
    S: S,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return S[k][0] === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, lastStem = '', lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (k === last || stem(S[k][3]) === lastStem) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 상태 두 번 넘게 잇따름 0 · 같은 물체 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k; lastStem = stem(S[k][3]);
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + '<u>' + q.w + '</u>' + q.post + ' → □ 고체 □ 액체 □ 기체'; },
    printAnswer: function (q) { return q.w + ' → ' + CATS.filter(function (c) { return c.key === q.cat; })[0].label.replace(/^\S+ /, ''); },
    printHead: '밑줄 친 물질이 고체·액체·기체 가운데 어느 상태인지 □에 ✓ 하세요.'
  };
}));
