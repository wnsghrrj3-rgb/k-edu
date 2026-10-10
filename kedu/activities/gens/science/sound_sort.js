/* gens/science/sound_sort.js — 세기일까, 높낮이일까? (3학년 2학기 과학 3단원 「소리의 성질」 l04 · l09 · l10)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l10 s09 두 통: 🔊 소리의 세기 · 🎼 소리의 높낮이 (l09 s10 도 같은 두 통).
 *   「세기」는 l03, 「높낮이」는 l04 에서 처음 나온다 → 이 활동은 l04 부터(두 칸이 다 배운 말일 때).
 * 문장 = 소리를 낸 한 장면 · 밑줄 = 바뀐 것(치는 힘·떨림 / 물체의 길이). 칸은 밑줄이 바꾸는 성질이 정한다.
 * 문장·밑줄에 칸 이름(세기·높낮이)과 결과 말(큰 소리·작은 소리·높은 소리·낮은 소리) 0 — 결과가 아니라 까닭을 보고 고른다.
 * 진단 축(정본 오개념):
 *   l04 「같은 음판을 세게 치면 소리가 높아진다」 → 같은 음판·같은 관·같은 길이 고무줄을 세게 = 세기(길이는 그대로)
 *   l04 생각을 넓혀요 「긴 관을 세게 불면 높은 소리」 → 세게 = 세기 · 길이 = 높낮이를 한 장면에 섞지 않는다(한 문장 = 한 가지만 바뀜)
 *   l03 쌀알(정본 퐁퐁이) 「높게 튀면 = 세게 친 것」 → 「높이」라는 말이 있어도 세기
 *   l10 「크게 떨리면 작은 소리」 → 떨림의 크기 = 세기
 * 두 가지가 같이 바뀌는 장면 · 소리의 전달(l05 — 고체·액체·기체) · 음향 카메라 색깔 0.
 * params: { upto: 'l04'|'all' }  l04 = 3·4차시 장면 · all = 9차시까지(정본 l09 s10 설명 꼴 + l06·l07 소음 세기 줄이기 — l10 마무리도 all)
 * next() → { item, pre, w, post, cat, type, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['sound_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l04', 'l09'];
  var CATS = [{ key: 'loud', label: '🔊 소리의 세기' }, { key: 'pitch', label: '🎼 소리의 높낮이' }];
  var WHY = { loud: '떨림의 크고 작은 정도가 바뀌면 소리의 크고 작은 정도가 달라져요.',
              pitch: '소리 나는 물체의 길이가 바뀌면 소리의 높고 낮은 정도가 달라져요.' };
  var NAME = { loud: '소리의 세기', pitch: '소리의 높낮이' };

  /* [차시, 칸, 앞, 밑줄, 뒤, 물체(연달아 막기), 덧붙임 풀이(선택)] */
  var S = [
    // l04 — 3차시 작은북·심벌즈·쌀알 + 4차시 간이 악기·글로켄슈필·팬 플루트·기타·피아노(정본 l03 s05·s09·s13·s14 · l04 s05·s06·s09·s12·s14·s15)
    ['l04', 'loud', '작은북을 ', '더 세게', ' 쳤어요.', '작은북'],
    ['l04', 'loud', '심벌즈를 ', '더 약하게', ' 쳤어요.', '심벌즈'],
    ['l04', 'loud', '북면 위 쌀알이 ', '더 높이 튀어', ' 올랐어요.', '작은북', '「높이」 튀었어도 북면이 더 크게 떨린 거예요.'],
    ['l04', 'loud', '같은 음판을 ', '더 세게', ' 두드렸어요.', '음판', '같은 음판이라 길이는 그대로예요.'],
    ['l04', 'loud', '팬 플루트의 같은 관을 ', '더 세게', ' 불었어요.', '관', '같은 관이라 길이는 그대로예요.'],
    ['l04', 'loud', '고무줄을 같은 길이로 잡고 ', '더 세게', ' 튕겼어요.', '고무줄', '잡은 길이는 그대로예요.'],
    ['l04', 'loud', '아기를 재우려고 자장가를 ', '더 작게', ' 불렀어요.', '목소리'],
    ['l04', 'loud', '소리 나는 심벌즈가 ', '더 크게 떨렸어요', '.', '심벌즈'],
    ['l04', 'pitch', '글로켄슈필의 ', '더 짧은 음판', '을 두드렸어요.', '음판'],
    ['l04', 'pitch', '글로켄슈필의 ', '더 긴 음판', '을 두드렸어요.', '음판'],
    ['l04', 'pitch', '팬 플루트의 ', '더 짧은 관', '을 불었어요.', '관'],
    ['l04', 'pitch', '팬 플루트의 ', '더 긴 관', '을 불었어요.', '관'],
    ['l04', 'pitch', '고무줄을 ', '더 짧게 잡고', ' 튕겼어요.', '고무줄'],
    ['l04', 'pitch', '자 윗부분을 눌러 고무줄을 ', '더 길게 잡고', ' 튕겼어요.', '고무줄'],
    ['l04', 'pitch', '기타 줄을 ', '더 짧게 잡고', ' 튕겼어요.', '기타'],
    ['l04', 'pitch', '피아노 조율사가 ', '더 긴 줄', '을 소리 내 보았어요.', '피아노'],
    // l09 — 정본 l09 s10 설명 꼴(물체가 크게·작게 떨려요 · 길이가 짧아요·길어요) + l06·l07 소음의 세기 줄이기(텔레비전·스피커)
    ['l09', 'loud', '소리 나는 물체가 ', '크게 떨려요', '.', '물체'],
    ['l09', 'loud', '소리 나는 물체가 ', '작게 떨려요', '.', '물체'],
    ['l09', 'loud', '텔레비전 소리를 ', '작게', ' 했어요.', '텔레비전'],
    ['l09', 'loud', '스피커 소리를 ', '작게', ' 했어요.', '스피커'],
    ['l09', 'pitch', '소리 나는 물체의 ', '길이가 짧아요', '.', '물체'],
    ['l09', 'pitch', '소리 나는 물체의 ', '길이가 길어요', '.', '물체']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], pre: s[2], w: s[3], post: s[4], item: s[2] + s[3] + s[4], obj: s[5],
             explain: '「' + s[3] + '」 — ' + (s[6] ? s[6] + ' ' : '') + WHY[s[1]] + ' 그래서 ' + NAME[s[1]] + '예요.' };
  }

  return {
    id: 'sound_sort',
    title: '세기일까, 높낮이일까?',
    categories: CATS,
    S: S,
    ORDER: ORDER,
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
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0 · 같은 물체 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k; lastObj = S[k][5];
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + '<u>' + q.w + '</u>' + q.post + ' → □ 소리의 세기 □ 소리의 높낮이'; },
    printAnswer: function (q) { return q.w + ' → ' + NAME[q.cat]; },
    printHead: '밑줄 친 것이 바꾸는 것은 소리의 세기일까요, 높낮이일까요? □에 ✓ 하세요.'
  };
}));
