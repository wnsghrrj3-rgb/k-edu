/* gens/social/clue_way.js — 어느 길로 알까? (3학년 1학기 사회 2단원 l09 · l13 · l14 — 소단원 ②·③을 잇는다)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본의 「아는 길」 셋: 👀 보고 아는 길(l07 s07 · l13 s07) · 📖 읽고 아는 길 · 👂 듣고 아는 길(l09 s07 · l13 s07).
 *   정본 l09 쪽지 「"읽었니, 들었니?"만 물어도 두 길이 또렷이 갈립니다」 · l13 「자료마다 아는 길이 달라요 → 여러 자료를 함께」.
 * 문장 = 곰이·펭이(또는 어른)가 자료 하나로 옛 모습을 알아낸 장면 · 밑줄 = 그 자료. 칸은 밑줄 자료가 정한다.
 * 칸을 알려 주는 동사(봤·보았·읽·듣·들었·들려) 0 — 동사가 아니라 자료가 무엇인지로 가른다.
 * 정본에서 길이 둘로 읽히는 자료(영상 — l13 은 보고, l15 는 「움직임과 소리」 · 포스터 — 글과 그림)는 넣지 않는다.
 * 진단 축(정본 l09 오개념 「글로 적힌 것만 사실」의 그림자): 소리 내어 짚은 신문 → 듣고(❌) · 책에 실린 옛이야기 → 듣고(❌).
 * params: { upto: 'l09'|'l13'|'l14'|'all' }  l09 부터 그 차시까지 누적 · 이번 차시 문장이 덱 앞머리 (all = l14 까지 — l15·l18 정리용)
 * next() → { item, pre, w, post, cat, type, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['clue_way'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l09', 'l13', 'l14'];
  var CATS = [{ key: 'look', label: '👀 보고' }, { key: 'read', label: '📖 읽고' }, { key: 'hear', label: '👂 듣고' }];
  var WHY = { look: '눈으로 모습을 살펴 아는 자료라서 보고 아는 길이에요.',
              read: '글로 남긴 자료라서 읽고 아는 길이에요.',
              hear: '겪은 분·어른께 말로 전해 받는 자료라서 듣고 아는 길이에요.' };

  /* [차시, 길, 앞, 자료(밑줄), 뒤] */
  var S = [
    // l09 — 소단원 ② 단서·자료·증언 (l07 옛 사진·건축물·물건 · l08 옛 물건 · l09 신문·기록·증언)
    ['l09', 'look', '곰이가 ', '옛 사진', '에서 그때 옷차림을 찾았어요.'],
    ['l09', 'look', '펭이가 ', '한옥', '의 지붕 모양으로 옛날 집을 알았어요.'],
    ['l09', 'look', '', '맷돌', '의 둥근 돌 두 짝으로 곡식을 갈던 생활을 알았어요.'],
    ['l09', 'look', '곰이가 ', '오래된 담장', '에서 옛 동네 모습을 찾았어요.'],
    ['l09', 'look', '펭이가 ', '흑백 사진', '에서 좁은 흙길을 찾았어요.'],
    ['l09', 'look', '', '가마솥', '으로 옛날에 밥을 짓던 모습을 알았어요.'],
    ['l09', 'read', '곰이가 누렇게 바랜 ', '옛 신문', '을 펼쳤어요.'],
    ['l09', 'read', '펭이가 ', '옛 기록', '에서 그때 있었던 일을 찾았어요.'],
    ['l09', 'read', '', '잡지', '에 실린 글로 그때 사람들의 생활을 알았어요.'],
    ['l09', 'read', '곰이가 ', '옛 신문', '의 큰 제목을 소리 내어 짚었어요.'],
    ['l09', 'hear', '할머니께서 ', '어릴 때 냇가에서 빨래하던 이야기', '를 해 주셨어요.'],
    ['l09', 'hear', '곰이가 ', '어른의 증언', '으로 옛 동네를 알았어요.'],
    ['l09', 'hear', '펭이가 어른께 여쭈어 ', '그때 동네 모습 이야기', '를 받아 적었어요.'],
    ['l09', 'hear', '', '할머니의 증언', '으로 냇가 빨래를 알게 되었어요.'],
    // l13 — 우리 지역의 옛 모습 (옛 사진과 지도 · 옛 신문과 기록 · 옛이야기와 증언)
    ['l13', 'look', '곰이가 ', '옛 지도', '에서 좁은 길을 찾았어요.'],
    ['l13', 'look', '펭이가 ', '옛 사진', '에서 낮은 집이 늘어선 거리를 찾았어요.'],
    ['l13', 'look', '', '옛 지도', '에서 우리 학교 자리를 찾았어요.'],
    ['l13', 'read', '', '옛 기록', '에 그때 우리 지역 소식이 적혀 있었어요.'],
    ['l13', 'read', '펭이가 ', '옛 신문', '에서 우리 지역에 있었던 일을 찾았어요.'],
    ['l13', 'hear', '오래 사신 어른께서 ', '옛이야기', '를 해 주셨어요.'],
    ['l13', 'hear', '곰이가 ', '어른의 증언', '으로 옛 거리 모습을 알았어요.'],
    // l14 — 옛이야기와 땅 이름 (할아버지 · 도서관 책 · 지역 누리집 · 밤골·말죽거리·배다리)
    ['l14', 'read', '곰이가 ', '도서관 책', '에 실린 우리 마을 옛이야기를 찾았어요.'],
    ['l14', 'read', '펭이가 ', '지역 누리집', '의 글에서 밤골이라는 이름의 뜻을 찾았어요.'],
    ['l14', 'read', '', '옛 기록', '에서 밤골에 밤나무가 많았다는 것을 찾았어요.'],
    ['l14', 'hear', '할아버지께서 ', '옛날 옛적 이야기', '를 해 주셨어요.'],
    ['l14', 'hear', '', '마을 어른의 이야기', '로 말죽거리가 말에게 죽을 먹이던 곳인 걸 알았어요.'],
    ['l14', 'look', '펭이가 ', '옛 사진', '에서 배를 이어 놓은 다리를 찾았어요.'],
    ['l14', 'look', '', '옛 지도', '에서 배다리 자리를 찾았어요.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], pre: s[2], w: s[3], post: s[4], item: s[2] + s[3] + s[4],
             explain: '「' + s[3] + '」 — ' + WHY[s[1]] };
  }

  return {
    id: 'clue_way',
    title: '어느 길로 알까?',
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
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 길 두 번 넘게 잇따름 0 · 같은 자료 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k; lastW = S[k][3];
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + '<u>' + q.w + '</u>' + q.post + ' → □ 보고 □ 읽고 □ 듣고'; },
    printAnswer: function (q) { return q.w + ' → ' + CATS.filter(function (c) { return c.key === q.cat; })[0].label.replace(/^\S+ /, '') + ' 아는 길'; },
    printHead: '밑줄 친 자료로 옛 모습을 아는 길이 보고·읽고·듣고 가운데 어느 것인지 □에 ✓ 하세요.'
  };
}));
