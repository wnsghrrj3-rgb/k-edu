/* gens/science/g4_2_role_sort.js — 생산자일까, 소비자일까, 분해자일까? (4학년 2학기 과학 2단원 「생물과 환경」 l03 · l04 · l10 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 판의 생물은 교과서·지도서 그대로.
 * 칸 = 『과학』 38~39쪽 [탐구 활동] 「생태계를 구성하는 생물요소를 그 역할에 따라 분류하기」 — 생물 카드를
 *   「스스로 양분을 만드는 생물 · 다른 생물을 먹는 생물 · 죽은 생물을 분해하는 생물」로 나누고 이름 붙이기(지도서 190~193쪽)
 *   → 🌱 생산자 · 🐾 소비자 · 🍄 분해자. 칸이 하는 일 = 『과학』 39쪽 개념 도입 문장.
 * 생물 출처(지도서 4-2 과학 2단원 · 『과학』·『실험관찰』 쪽):
 *   l03  『실험관찰』 71쪽 생물 카드 아홉(소나무·강아지풀·부들 / 왜가리·고래·메뚜기 / 곰팡이·버섯·세균) · 『과학』 39쪽 숲 생태계 그림
 *        (강아지풀·질경이·소나무 / 직박구리·노루·다람쥐 / 버섯·곰팡이·세균) · 더 생각해요 어항(검정말·생이새우·물곰팡이) · 형성 평가 두더지
 *        · 지도서 190쪽 오개념 바로잡기 「나무 밑동에서 자라는 버섯」 · 지도서 183쪽 2차시 텃밭 생태계(상추)
 *   l04  『과학』 40~43쪽 먹이사슬 놀이(벼 → 메뚜기 → 개구리 → 뱀 · 새매) · 종이컵 예시(토끼풀 → 토끼 → 여우) · 도입 그림(스라소니·토끼·여우)
 * 진단 축 = 칸(byType = cat). 지도서 190쪽 오개념 「버섯은 식물처럼 스스로 양분을 만든다」 · 191쪽 「분해자는 눈으로 볼 수 없어서 존재하지 않는다」
 *   → 버섯·세균·곰팡이·물곰팡이에 덧붙임 풀이. 식충식물(지도서 192쪽 참고 자료 — 생산자이자 소비자)은 칸 하나로 못 가르므로 판 밖.
 * params: { upto: 'l03'|'all' }  l03 = 3차시 생물 카드·숲·어항 · all = 4·5차시 먹이 관계 생물까지(l04·l10)
 * next() → { item, tag, w, cat, type, why, src, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_role_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l03', 'l04'];
  var CATS = [{ key: 'prod', label: '🌱 생산자' }, { key: 'cons', label: '🐾 소비자' }, { key: 'dec', label: '🍄 분해자' }];
  var NAME = { prod: '생산자', cons: '소비자', dec: '분해자' };
  var DOES = { prod: '생산자는 햇빛을 이용하여 스스로 양분을 만들고 다른 생물의 먹이가 돼요.',
               cons: '소비자는 생산자 또는 다른 생물을 먹어 양분을 얻어요.',
               dec: '분해자는 생산자와 소비자의 죽은 몸이나 배출물을 분해하여 양분을 얻어요.' };

  /* [차시, 칸, 장면, 모습, 풀이, 덧붙임 풀이(선택 — 말 덫)] */
  var S = [
    ['l03', 'prod', '생물 카드', '소나무', '햇빛을 이용하여 스스로 양분을 만들어요.'],
    ['l03', 'prod', '생물 카드', '강아지풀', '햇빛을 이용하여 스스로 양분을 만들어요.'],
    ['l03', 'prod', '생물 카드', '부들', '햇빛을 이용하여 스스로 양분을 만들어요.'],
    ['l03', 'cons', '생물 카드', '왜가리', '스스로 양분을 만들지 못하고 다른 생물을 먹어요.'],
    ['l03', 'cons', '생물 카드', '고래', '바다에 살아도 다른 생물을 먹어 양분을 얻어요.'],
    ['l03', 'cons', '생물 카드', '메뚜기', '스스로 양분을 만들지 못하고 다른 생물을 먹어요.'],
    ['l03', 'dec', '생물 카드', '곰팡이', '죽은 생물의 몸이나 배출물을 분해하여 양분을 얻어요.', '눈에 잘 보이지 않아도 살아 있는 생물요소예요.'],
    ['l03', 'dec', '생물 카드', '버섯', '죽은 생물의 몸이나 배출물을 분해하여 양분을 얻어요.', '식물처럼 생겼어도 스스로 양분을 만들지 못해요.'],
    ['l03', 'dec', '생물 카드', '세균', '죽은 생물의 몸이나 배출물을 분해하여 양분을 얻어요.', '눈에 보이지 않아도 살아 있는 생물요소예요.'],
    ['l03', 'prod', '숲 생태계', '질경이', '햇빛을 이용하여 스스로 양분을 만들어요.'],
    ['l03', 'cons', '숲 생태계', '직박구리', '다른 생물을 먹어 양분을 얻어요.'],
    ['l03', 'cons', '숲 생태계', '노루', '생산자를 먹어 양분을 얻어요.'],
    ['l03', 'cons', '숲 생태계', '다람쥐', '도토리 같은 생산자를 먹어 양분을 얻어요.'],
    ['l03', 'dec', '숲 생태계', '버섯(나무 밑동)', '나무 밑동 부근에서 자라며 죽은 몸이나 배출물을 분해해요.', '햇빛이 잘 들지 않는 곳에서 자라고, 스스로 양분을 만들지 못해요.'],
    ['l03', 'dec', '숲 생태계', '세균(4000배)', '생산자와 소비자의 죽은 몸이나 배출물을 분해해요.', '현미경으로 크게 보아야 보이는 살아 있는 생물요소예요.'],
    ['l03', 'prod', '어항 생태계', '검정말', '물속에 살아도 햇빛을 이용하여 스스로 양분을 만들어요.', '물속 식물도 생산자예요.'],
    ['l03', 'cons', '어항 생태계', '생이새우', '다른 생물을 먹어 양분을 얻어요.'],
    ['l03', 'dec', '어항 생태계', '물곰팡이', '죽은 몸이나 배출물을 분해하여 양분을 얻어요.', '어항 속에도 분해자가 있어요.'],
    ['l03', 'cons', '형성 평가', '두더지', '스스로 양분을 만들지 못하고 다른 생물을 먹어요.'],
    ['l03', 'prod', '텃밭 생태계', '상추', '햇빛을 이용하여 스스로 양분을 만들어요.'],
    ['l04', 'prod', '먹이사슬 놀이', '벼', '햇빛을 이용하여 스스로 양분을 만들고 메뚜기의 먹이가 돼요.'],
    ['l04', 'cons', '먹이사슬 놀이', '개구리', '메뚜기를 먹어 양분을 얻어요.'],
    ['l04', 'cons', '먹이사슬 놀이', '뱀', '개구리를 먹어 양분을 얻어요.'],
    ['l04', 'cons', '먹이그물', '새매', '개구리나 뱀을 먹어 양분을 얻어요.'],
    ['l04', 'prod', '종이컵 먹이사슬', '토끼풀', '햇빛을 이용하여 스스로 양분을 만들고 토끼의 먹이가 돼요.'],
    ['l04', 'cons', '종이컵 먹이사슬', '토끼', '토끼풀을 뜯어 먹어 양분을 얻어요.'],
    ['l04', 'cons', '종이컵 먹이사슬', '여우', '토끼를 잡아먹어 양분을 얻어요.'],
    ['l04', 'cons', '숲 생태계 도입', '스라소니', '토끼를 잡아먹어 양분을 얻어요.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function ieyo(w) { var c = w.charCodeAt(w.length - 1); return (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? w + '이에요' : w + '예요'; }   // 받침 → 이에요
  function build(r) {
    return { l: r[0], cat: r[1], type: r[1], tag: r[2], w: r[3], src: r[2], why: r[4], item: r[2] + ' — ' + r[3],
             explain: r[2] + ' — ' + r[3] + ': ' + ieyo(NAME[r[1]]) + '. ' + r[4] + ' ' + (r[5] ? r[5] + ' ' : '') + DOES[r[1]] };
  }

  return {
    id: 'g4_2_role_sort',
    title: '생산자일까, 소비자일까, 분해자일까?',
    categories: CATS,
    S: S, ORDER: ORDER, NAME: NAME, DOES: DOES,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
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
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0 · 같은 장면 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k;
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.item + ' → □ 생산자 □ 소비자 □ 분해자'; },
    printAnswer: function (q) { return q.item + ' → ' + NAME[q.cat]; },
    printHead: '생물을 읽고, 생태계에서 하는 역할에 따라 생산자·소비자·분해자 가운데 어디에 들어가는지 □에 ✓ 하세요.'
  };
}));
