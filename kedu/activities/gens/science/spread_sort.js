/* gens/science/spread_sort.js — 무엇을 통해 옮을까? (3학년 2학기 과학 4단원 「감염병과 건강한 생활」 l05 = 5·6차시 · l11 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l05 s10 두 통: 🖐️ 손이나 음식으로 · 💨 기침이나 공기로 (「무엇을 통해 감염될까요?」).
 *   「감염 과정」·「비말」·「무엇을 통해」는 l05 에서 처음 나온다 → 이 활동은 l05 부터.
 * 문장 = 생활 습관 한 장면 · 밑줄 = 병원체가 건너가는 길(손·침이 묻은 음식 / 기침·비말·같은 교실). 칸은 밑줄이 정한다.
 * 진단 축(정본):
 *   s05 watch 「「기침」만 감염 과정으로 여기는 경우 — 손·침·물도」 → 손 칸 문장이 기침 칸만큼
 *   s15 생각을 넓혀요 「손바닥으로 가리면 비말이 손에 묻고, 그 손으로 물건을 만지면 손을 통해」 → 기침이 든 장면이라도 밑줄이 손이면 손 칸
 *   거꾸로 — 급식을 먹는 자리여도 밑줄이 기침이면 기침 칸
 * 오염된 물(정본 s11 · s17)은 두 통 어디에도 없어(먹는 것이라 「음식」으로 읽힐 수도) 0 — 칸이 둘로 읽히는 판을 세우지 않는다.
 * 역할극·예방 수칙(l07 — 비누·30초·예방접종) 0.
 * params: {} (범위 하나 — l05) · next() → { item, pre, w, post, cat, type, explain, l, obj }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['spread_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l05'];
  var CATS = [{ key: 'hand', label: '🖐️ 손이나 음식으로' }, { key: 'air', label: '💨 기침이나 공기로' }];
  var WHY = { hand: '손이나 음식에 묻은 병원체·침을 통해 옮을 수 있어요.',
              air: '기침할 때 나오는 비말이나 같은 공간의 공기를 통해 옮을 수 있어요.' };
  var NAME = { hand: '손이나 음식으로', air: '기침이나 공기로' };

  /* [차시, 칸, 앞, 밑줄, 뒤, 물체(연달아 막기), 덧붙임 풀이(선택)] — 정본 l05 s04·s05·s09·s10·s11·s14·s15 */
  var S = [
    ['l05', 'hand', '', '손을 씻지 않고 눈을 비벼서', ' 유행성 눈병에 걸렸어요.', '눈'],
    ['l05', 'hand', '친구가 ', '먹던 음식', '을 먹었어요.', '음식'],
    ['l05', 'hand', '친구와 ', '한 빵을 베어 먹었어요', '.', '빵'],
    ['l05', 'hand', '화장실에 다녀온 뒤 ', '손을 씻지 않고 빵을 먹었어요', '.', '빵'],
    ['l05', 'hand', '기침을 손바닥으로 가린 뒤 ', '그 손으로 물건을 만졌어요', '.', '손바닥', '기침을 했어도 비말이 묻은 손이 옮겨요.'],
    ['l05', 'hand', '반찬을 ', '한 젓가락으로 같이 집어 먹었어요', '.', '젓가락'],
    ['l05', 'hand', '열이 나는 친구가 ', '나눠 준 빵을 먹었어요', '.', '빵'],
    ['l05', 'air', '', '아무렇게나 기침하는 친구', '와 놀았어요.', '기침'],
    ['l05', 'air', '아픈 친구와 ', '같은 교실', '에 있었어요.', '교실'],
    ['l05', 'air', '수두에 걸린 친구와 ', '같은 교실', '에 있었어요.', '교실'],
    ['l05', 'air', '친구가 내 앞에서 ', '입과 코를 가리지 않고 기침', '했어요.', '기침'],
    ['l05', 'air', '급식을 먹는데 옆 친구가 ', '아무렇게나 기침', '을 했어요.', '기침', '밥을 먹는 자리여도 기침으로 나온 비말이 퍼져요.'],
    ['l05', 'air', '', '기침할 때 나오는 비말', '이 친구에게 튀었어요.', '비말'],
    ['l05', 'air', '감기에 걸린 친구가 ', '교실에서 재채기', '를 했어요.', '재채기']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], pre: s[2], w: s[3], post: s[4], item: s[2] + s[3] + s[4], obj: s[5],
             explain: '「' + s[3] + '」 — ' + (s[6] ? s[6] + ' ' : '') + WHY[s[1]] + ' 그래서 ' + NAME[s[1]] + ' 옮아요.' };
  }

  return {
    id: 'spread_sort',
    title: '무엇을 통해 옮을까?',
    categories: CATS,
    S: S,
    ORDER: ORDER,
    create: function (params, rng) {
      var idx = S.map(function (s, k) { return k; });
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
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0 · 같은 물체 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k; lastObj = S[k][5];
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + '<u>' + q.w + '</u>' + q.post + ' → □ 손이나 음식으로 □ 기침이나 공기로'; },
    printAnswer: function (q) { return q.w + ' → ' + NAME[q.cat]; },
    printHead: '밑줄 친 습관은 무엇을 통해 감염병을 옮길까요? □에 ✓ 하세요.'
  };
}));
