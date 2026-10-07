/* gens/social/time_sort.js — 언제일까? (3학년 1학기 사회 2단원 「일상에서 만나는 과거」 l01·l02·l06)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * params: { upto: 'l01'|'l02'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 문장이 덱 앞머리 (all = l06 소단원 ① 정리까지)
 * next() → { item, pre, w, post, cat, type, explain, l }   w = 때를 나타내는 말(밑줄) · pre/post = 그 말이 쓰인 문장
 *
 * 칸 = 정본 l01 세 때: 과거(이미 지나간 때) · 현재(지금 살아가는 이때) · 미래(아직 오지 않은 때). 키 = 정본 그림 tline 의 era 그대로(past·now·future).
 * 정본 l01 오개념 둘이 진단 축: 「일곱을 다 과거로 미는 아이」(now·future miss) · 「현재를 미래로 아는 아이」(now miss).
 * 문장의 때와 밑줄 낱말의 때는 늘 같게 짓는다 — 「오늘 아침에 먹었어요」(낱말 현재·일 과거)처럼 두 때로 읽히는 문장 0.
 * 「나중」은 정본 l02 에서 「먼저 → 나중」 차례 말로 쓰여 넣지 않는다. 선행 가드 낱말(사진 l02 · 타임캡슐 l06 등)은 그 차시부터.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['time_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l01', 'l02', 'l06'];
  var CATS = [{ key: 'past', label: '⏪ 과거' }, { key: 'now', label: '📍 현재' }, { key: 'future', label: '⏩ 미래' }];
  var WHY = { past: '이미 지나간 때라서 과거예요.', now: '지금 살아가고 있는 이때라서 현재예요.', future: '아직 오지 않은 때라서 미래예요.' };

  /* [차시, 때, 앞, 때를 나타내는 말, 뒤] */
  var S = [
    // l01 「시간을 나타내는 말」 — 정본 일곱 낱말(어제·작년·옛날·오늘·지금·내일·앞으로) + 정본 장면(곰이·펭이 · 심화 「작년·올해·내년」)
    ['l01', 'past', '', '어제', '는 비가 왔어.'], ['l01', 'future', '', '내일', '은 소풍 간대!'],
    ['l01', 'past', '', '작년', '에 2학년이었어요.'], ['l01', 'now', '', '지금', ' 3학년이에요.'],
    ['l01', 'future', '', '앞으로', ' 4학년이 돼요.'], ['l01', 'past', '', '옛날', '에 할머니가 다니던 학교예요.'],
    ['l01', 'now', '', '오늘', '은 맑고 따뜻해요.'], ['l01', 'now', '', '올해', ' 우리 반은 스물두 명이에요.'],
    ['l01', 'future', '', '내년', ' 봄에 동생이 입학해요.'], ['l01', 'past', '', '어제', ' 저녁에 줄넘기를 했어요.'],
    ['l01', 'future', '', '내일', ' 아침에 일찍 일어날 거예요.'], ['l01', 'now', '', '지금', ' 우리는 사회 공부를 하고 있어요.'],
    ['l01', 'past', '', '작년', ' 여름에 바다에 갔어요.'], ['l01', 'future', '', '앞으로', ' 키가 더 클 거예요.'],
    ['l01', 'now', '', '오늘', '은 우리 반이 청소 당번이에요.'],
    // l02 「나에게 있었던 중요한 일」 — 정본 예전·지난달·내일 날씨 + 과거의 나/지금의 나
    ['l02', 'past', '', '예전', '에는 줄넘기를 못 했어요.'], ['l02', 'now', '', '지금', '은 혼자 밥을 먹어요.'],
    ['l02', 'past', '', '지난달', '에 이가 하나 빠졌어요.'], ['l02', 'future', '', '내일', ' 날씨는 맑대요.'],
    ['l02', 'past', '', '작년', '에 자전거를 처음 탔어요.'], ['l02', 'now', '', '오늘', '은 내 생일이에요.'],
    ['l02', 'future', '', '앞으로', ' 수영을 배우고 싶어요.'], ['l02', 'past', '', '어제', ' 할머니 댁에 다녀왔어요.'],
    ['l02', 'future', '', '내년', '에 피아노 대회에 나가요.'], ['l02', 'now', '', '지금', '은 줄넘기를 잘해요.'],
    // l06 「소단원 ① 정리」 — 정본 타임캡슐·먼 뒷날·옛날 사진
    ['l06', 'future', '', '먼 뒷날', ' 타임캡슐을 열어 볼 거예요.'], ['l06', 'now', '', '오늘', ' 시간표를 타임캡슐에 넣어요.'],
    ['l06', 'past', '', '옛날', ' 사진 속 마을은 작았어요.'], ['l06', 'past', '', '어제', ' 학교 앞에 꽃이 피었어요.'],
    ['l06', 'now', '', '지금', ' 교실 시계는 열 시예요.'], ['l06', 'future', '', '내일', ' 모둠 발표를 해요.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], pre: s[2], w: s[3], post: s[4], item: s[2] + s[3] + s[4],
             explain: '「' + s[3] + '」 — ' + WHY[s[1]] };
  }

  return {
    id: 'time_sort',
    title: '언제일까?',
    categories: CATS,
    S: S,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = p.upto === 'l06' ? 'all' : (ORDER.indexOf(p.upto) >= 0 ? p.upto : 'all');
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
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 때 두 번 넘게 잇따름 0 · 같은 낱말 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k; lastW = S[k][3];
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + '<u>' + q.w + '</u>' + q.post + ' → □ 과거 □ 현재 □ 미래'; },
    printAnswer: function (q) { return q.w + ' → ' + CATS.filter(function (c) { return c.key === q.cat; })[0].label.replace(/^\S+ /, ''); },
    printHead: '밑줄 친 말이 과거·현재·미래 가운데 어느 때를 나타내는지 □에 ✓ 하세요.'
  };
}));
