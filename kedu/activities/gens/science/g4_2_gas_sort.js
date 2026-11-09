/* gens/science/g4_2_gas_sort.js — 온도 때문일까, 압력 때문일까? (4학년 2학기 과학 3단원 「여러 가지 기체」 l04 · l05 · l11 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 판의 장면은 교과서·지도서 그대로.
 * 칸 = 지도서 267쪽 5차시 형성 평가 「온도에 따른 기체의 부피 변화의 예 · 압력에 따른 기체의 부피 변화의 예를 보기에서 모두 골라」
 *   → 🌡️ 온도가 달라져서 · 👐 압력이 달라져서. 칸이 하는 일 = 『과학』 61쪽·63쪽 정리 문장.
 * 장면 출처(지도서 4-2 과학 3단원 · 『과학』 쪽):
 *   l03  『과학』 60~61쪽 열기구 도입 · 포일 풍선 실험(머리 말리개·얼음 수조) · 추운 겨울날 풍선
 *   l04  『과학』 62~63쪽 주사기 피스톤 누르기·당기기 · 배구공 도입 · 호핑볼 · 더 생각해요 운동화 공기 주머니
 *   l05  『과학』 64~65쪽 ㉮ 튜브·비치 볼 땡볕 · ㉯ 에어 매트 · ㉰ 축구공 · ㉱ 비닐 랩 · 타이어 도입 · 더 생각해요 비치 볼 그늘
 *        · 지도서 266~267쪽 조사 예(포개진 그릇 · 달걀 · 공기 안전 매트 · 과자 봉지 산 정상 · 잠수부 공기 방울)
 * 진단 축 = 칸(byType = cat). 말 덫: 산 정상의 과자 봉지 · 잠수부의 공기 방울 = 압력(서늘한 산 · 차가운 물이 떠올라도) — 지도서 266쪽.
 * params: { upto: 'l04'|'all' }  l04 = 3·4차시 실험 장면 · all = 5차시 생활 속 예까지(l05·l11)
 *   — 온도·압력 두 칸이 모두 서는 4차시부터 판을 연다.
 * next() → { item, tag, w, cat, type, why, src, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_gas_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l03', 'l04', 'l05'];
  var CATS = [{ key: 'temp', label: '🌡️ 온도가 달라져서' }, { key: 'press', label: '👐 압력이 달라져서' }];
  var NAME = { temp: '온도에 따른 부피 변화', press: '압력에 따른 부피 변화' };
  var DOES = { temp: '온도가 높아지면 기체의 부피가 늘어나고, 온도가 낮아지면 줄어들어요.',
               press: '기체에 미치는 압력이 높아지면 부피가 줄어들고, 압력이 낮아지면 늘어나요.' };

  /* [차시, 칸, 장면, 모습, 풀이, 덧붙임 풀이(선택 — 말 덫)] */
  var S = [
    ['l03', 'temp', '온도 실험', '포일 풍선에 머리 말리개로 따뜻한 바람을 쏘여요', '온도가 높아지면 기체의 부피가 늘어나 풍선이 부풀어요.'],
    ['l03', 'temp', '온도 실험', '포일 풍선을 얼음이 담긴 수조에 넣어요', '온도가 낮아지면 기체의 부피가 줄어들어 풍선이 쭈그러져요.'],
    ['l03', 'temp', '도입', '열기구 아래쪽을 가열하니 부풀어 올라요', '온도가 높아지면서 열기구 안 공기의 부피가 늘어났어요.'],
    ['l03', 'temp', '추운 겨울날', '바깥에 둔 풍선이 쭈그러들어요', '풍선 안 기체의 온도가 낮아져 부피가 줄었어요.'],
    ['l03', 'temp', '추운 겨울날', '실내로 가져온 풍선이 다시 팽팽해져요', '풍선 안 기체의 온도가 높아져 부피가 늘었어요.'],
    ['l04', 'press', '압력 실험', '주사기 피스톤을 누르니 공기의 부피가 작아져요', '주사기 안 공기에 미치는 압력이 높아져 부피가 줄었어요.'],
    ['l04', 'press', '압력 실험', '주사기 피스톤을 당기니 공기의 부피가 커져요', '주사기 안 공기에 미치는 압력이 낮아져 부피가 늘었어요.'],
    ['l04', 'press', '호핑볼', '호핑볼에 앉으니 눌려서 납작해져요', '호핑볼 안 기체에 미치는 압력이 높아져 부피가 줄었어요.'],
    ['l04', 'press', '도입', '세게 친 배구공이 찌그러져요', '배구공 안 기체에 미치는 압력이 높아져 부피가 줄었어요.'],
    ['l04', 'press', '더 생각해요', '공기 주머니가 든 운동화를 신고 걸어요', '공기 주머니에 미치는 압력이 높아지면서 부피가 줄어요.'],
    ['l05', 'temp', '생활 속 ㉮', '땡볕 아래 튜브와 비치 볼이 팽팽해져요', '온도가 높아지면서 기체의 부피가 늘어났어요.'],
    ['l05', 'press', '생활 속 ㉯', '에어 매트 위에 앉으니 납작해져요', '몸으로 누르면 에어 매트 안 기체에 미치는 압력이 높아져요.'],
    ['l05', 'press', '생활 속 ㉰', '축구공을 세게 차니 순간 찌그러져요', '축구공에 미치는 압력이 높아지면서 부피가 줄었어요.'],
    ['l05', 'temp', '생활 속 ㉱', '냉장고 속 용기의 비닐 랩이 오목해져요', '온도가 낮아지면서 용기 안 기체의 부피가 줄었어요.'],
    ['l05', 'press', '도입', '짐을 많이 실은 자동차 타이어가 찌그러져요', '타이어 안 공기에 미치는 압력이 높아져 부피가 줄었어요.'],
    ['l05', 'temp', '설거지', '포개진 그릇을 뜨거운 물에 넣으니 빠져요', '온도가 높아지면서 두 그릇 사이 공기의 부피가 늘어났어요.'],
    ['l05', 'temp', '달걀 삶기', '차가운 달걀을 끓는 물에 넣으니 터져요', '온도가 크게 높아지면서 공기 집 속 공기의 부피가 늘어났어요.'],
    ['l05', 'press', '화재 대피', '공기 안전 매트에 뛰어내리니 움푹 들어가요', '매트 안 공기에 미치는 압력이 높아져 부피가 줄었어요.'],
    ['l05', 'press', '산 정상', '과자 봉지가 땅 위에서보다 팽팽해져요', '높이 올라갈수록 주변 공기의 압력이 낮아져 부피가 늘어났어요.', '산 위가 서늘하더라도 봉지를 부풀린 것은 낮아진 압력이에요.'],
    ['l05', 'press', '바닷속', '잠수부의 공기 방울이 올라갈수록 커져요', '위로 올라갈수록 주변 물의 압력이 낮아져 부피가 늘어났어요.', '물 온도가 아니라 물의 압력이 낮아진 거예요.'],
    ['l05', 'temp', '더 생각해요', '팽팽한 비치 볼을 그늘로 옮기니 작아져요', '온도가 낮아지면서 비치 볼 안 공기의 부피가 줄었어요.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function ieyo(w) { var c = w.charCodeAt(w.length - 1); return (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? w + '이에요' : w + '예요'; }   // 받침 → 이에요
  function build(r) {
    return { l: r[0], cat: r[1], type: r[1], tag: r[2], w: r[3], src: r[2], why: r[4], item: r[2] + ' — ' + r[3],
             explain: r[2] + ' — ' + r[3] + ': ' + ieyo(NAME[r[1]]) + '. ' + r[4] + ' ' + (r[5] ? r[5] + ' ' : '') + DOES[r[1]] };
  }

  return {
    id: 'g4_2_gas_sort',
    title: '온도 때문일까, 압력 때문일까?',
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
    printRender: function (q) { return q.item + ' → □ 온도가 달라져서 □ 압력이 달라져서'; },
    printAnswer: function (q) { return q.item + ' → ' + NAME[q.cat]; },
    printHead: '기체의 부피가 달라진 장면을 읽고, 온도와 압력 가운데 무엇이 달라져서인지 □에 ✓ 하세요.'
  };
}));
