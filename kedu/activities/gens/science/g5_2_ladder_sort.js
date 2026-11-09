/* gens/science/g5_2_ladder_sort.js — 에너지 이용 놀이 (5학년 2학기 과학 4단원 「자원과 에너지」 l05 · l06 · l10)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 놀이판 칸 글은 교과서·지도서 그대로.
 * 놀이 = 『과학』 5차시 「에너지를 지속가능하게 이용하려면?」 2번 「친구와 함께 에너지 이용 놀이를 해 봅시다」(지도서 365쪽)
 *   주사위를 던져 도착한 칸이 에너지를 지속가능하게 이용한 예이면 🪜 사다리 위쪽으로, 에너지를 낭비하거나 함부로 이용한 예이면
 *   🛝 미끄럼틀을 타고 아래로. 3번 「지속가능하게 이용하는 예와 그렇지 않은 예로 분류」 그대로 두 칸 반 릴레이.
 * 칸 글 출처(지도서 과학 5-2 4단원):
 *   l05  365~366쪽 놀이판 분류 예시 답 ①(일곱) · ②(여섯)
 *   l06  6·7차시 「자원과 에너지의 효율적인 이용 방법」 — LED등처럼 에너지 효율이 높은 조명 · 건물의 단열 강화 · 스마트 플러그나 타이머 ·
 *        자동차 대신 자전거, 도보, 대중교통 (사다리 칸으로 덧붙임)
 * 진단 축(366쪽 4번 까닭 · 지도 길잡이 「에너지 절약뿐만 아니라 재생 에너지를 이용하는 것이 좋다」):
 *   말 덫 ① 낭비처럼 안 보여도 석유로 에너지를 얻어 이산화 탄소가 생기거나, 에너지를 많이 소모하는 기계는 🛝
 *   말 덫 ② 나 혼자 하는 일이 아니어도(여러 나라가 협력 · 캠페인) 에너지를 지속가능하게 쓰는 일이면 🪜
 * params: { upto: 'l05'|'all' }  l05 = 5차시 놀이판 · all = 단원 전체(+ 6·7차시 효율적인 이용 방법)
 * next() → { item, tag, w, cat, type, why, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_ladder_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l05', 'l06'];
  var CATS = [{ key: 'up', label: '🪜 사다리 위로' }, { key: 'down', label: '🛝 미끄럼틀 아래로' }];
  var NAME = { up: '사다리 위로', down: '미끄럼틀 아래로' };
  var DOES = { up: '에너지를 지속가능하게 이용한 예라 사다리 위쪽으로 올라가요.',
               down: '에너지를 낭비하거나 함부로 이용한 예라 미끄럼틀을 타고 내려가요.' };
  var BOARD = '놀이판', EFF = '효율적인 이용';

  /* [차시, 칸, 자료, 칸 글, 풀이, 덧붙임 풀이(선택 — 말 덫)] */
  var S = [
    ['l05', 'up', BOARD, '냉난방을 할 때 적정 온도를 유지해요', '필요한 만큼만 에너지를 써요.'],
    ['l05', 'up', BOARD, '태양 에너지를 이용해요', '재생 가능한 자원에서 에너지를 얻어요.'],
    ['l05', 'up', BOARD, '에너지 절약 캠페인에 참여해요', '에너지를 아끼는 일을 함께 알려요.', '나 혼자 하는 일이 아니어도 에너지를 지속가능하게 쓰는 일이에요.'],
    ['l05', 'up', BOARD, '수력, 풍력 같은 재생 에너지를 이용해요', '물과 바람은 고갈될 위험이 적어요.'],
    ['l05', 'up', BOARD, '자원과 에너지를 아끼는 친환경 제품을 써요', '친환경 제품을 쓰면 에너지를 절약할 수 있어요.'],
    ['l05', 'up', BOARD, '가까운 곳은 걷거나 자전거를 타요', '걷거나 자전거를 타면 에너지를 절약해요.'],
    ['l05', 'up', BOARD, '여러 나라가 협력해 에너지 문제를 풀어요', '함께 노력하면 에너지를 지속가능하게 쓸 수 있어요.', '나라끼리 하는 일이라도 에너지를 지속가능하게 쓰는 일이에요.'],
    ['l05', 'down', BOARD, '창문을 열고 난방을 해요', '데운 공기가 밖으로 나가 에너지를 낭비해요.'],
    ['l05', 'down', BOARD, '석유로 에너지를 얻어 이산화 탄소가 생겨요', '석유는 고갈되는 자원이고 환경오염을 일으켜요.', '낭비처럼 안 보여도 석유를 태워 이산화 탄소가 생기면 지속가능하지 않아요.'],
    ['l05', 'down', BOARD, '빈방에 조명을 켜 두어요', '쓰지 않는 조명에 에너지를 낭비해요.'],
    ['l05', 'down', BOARD, '가까운 거리도 늘 자동차를 타요', '걸어갈 수 있는 곳에도 에너지를 써요.'],
    ['l05', 'down', BOARD, '보지 않는 텔레비전을 켜 두어요', '사용하지 않는 전기 기구를 켜 두면 불필요한 에너지가 쓰여요.'],
    ['l05', 'down', BOARD, '에너지를 많이 소모하는 기계를 써요', '같은 일에 에너지를 더 많이 써요.', '평범한 일처럼 보여도 에너지를 많이 소모하면 지속가능하지 않아요.'],
    ['l06', 'up', EFF, 'LED등처럼 효율이 높은 조명을 써요', '에너지 효율이 높아 에너지를 덜 써요.'],
    ['l06', 'up', EFF, '건물의 단열을 강화해요', '단열재로 열의 이동을 막아 에너지 소비를 줄여요.'],
    ['l06', 'up', EFF, '스마트 플러그나 타이머를 써요', '전자 기기를 사용하는 시간을 줄여요.'],
    ['l06', 'up', EFF, '자동차 대신 대중교통을 타요', '자동차 대신 자전거, 도보, 대중교통을 이용해 에너지를 아껴요.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(r) {
    return { l: r[0], cat: r[1], type: r[1], tag: r[2], w: r[3], why: r[4], item: r[2] + ' — ' + r[3],
             explain: '「' + r[3] + '」 — ' + NAME[r[1]] + '! ' + r[4] + ' ' + (r[5] ? r[5] + ' ' : '') + DOES[r[1]] };
  }

  return {
    id: 'g5_2_ladder_sort',
    title: '에너지 이용 놀이',
    categories: CATS,
    S: S, ORDER: ORDER, NAME: NAME, DOES: DOES,
    create: function (params, rng) {
      var p = params || {};
      var upto = p.upto === 'l05' ? 'l05' : 'all';
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
    printRender: function (q) { return q.w + ' → □ 사다리 위로 □ 미끄럼틀 아래로'; },
    printAnswer: function (q) { return q.w + ' → ' + NAME[q.cat]; },
    printHead: '놀이판 칸의 글을 읽고, 에너지를 지속가능하게 이용한 예면 사다리, 낭비하거나 함부로 이용한 예면 미끄럼틀에 ✓ 하세요.'
  };
}));
