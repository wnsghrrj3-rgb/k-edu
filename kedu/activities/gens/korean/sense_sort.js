/* gens/korean/sense_sort.js — 어떤 감각일까? (3학년 1학기 국어 1단원 「생생하게 표현해요」 l01·l02·l04)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * params: { upto: 'l01'|'l02'|'l04'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 표현이 덱 앞머리
 * next() → { item, pre, w, post, cat, type, explain, l }   w = 감각적 표현(밑줄) · pre/post = 그 표현이 쓰인 자리
 *
 * 칸 = 정본 l02 다섯 감각: 👀 모습(눈) · 👂 소리(귀) · 👃 냄새(코) · 👅 맛(입) · ✋ 느낌(손·살갗). type = 칸 그대로.
 * 정본 l02 오개념 「감각적 표현 = 소리 흉내 말뿐」 → 모습·냄새·느낌을 소리 칸에 넣는 실수가 그 갈래 miss 로 잡힌다.
 * 늘 문맥(어디에 쓰였나)과 함께 낸다 — 같은 흉내 말이 문맥 따라 다른 감각이 되는 일이 있어서(정본 「풀밭에서」 살랑살랑 = 모습).
 * 두 감각으로 읽히는 말(바삭바삭 — 맛·소리, 보글보글 — 소리·모습, 쿵쿵 등)은 넣지 않는다. 정본이 감각을 밝힌 표현은 정본 그대로.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['sense_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l01', 'l02', 'l04'];
  var CATS = [{ key: 'sight', label: '👀 모습' }, { key: 'sound', label: '👂 소리' }, { key: 'smell', label: '👃 냄새' },
              { key: 'taste', label: '👅 맛' }, { key: 'touch', label: '✋ 느낌' }];
  var WHY = { sight: '눈으로 본 모습이에요.', sound: '귀로 들은 소리예요.', smell: '코로 맡은 냄새예요.',
              taste: '입으로 맛본 맛이에요.', touch: '손이나 살갗으로 느낀 느낌이에요.' };

  /* [차시, 감각, 앞, 표현, 뒤] */
  var S = [
    ['l01', 'sound', '새가 ', '짹짹', ' 노래해요'], ['l01', 'sound', '꿀벌이 ', '부웅부웅', ' 날아다녀요'],
    ['l01', 'sight', '', '알록달록', ' 무지개 빛깔'], ['l01', 'sight', '노란 꽃이 ', '방긋', ' 피었어요'],
    ['l01', 'touch', '바람이 ', '간질간질', ' 볼을 스쳐요'], ['l01', 'taste', '', '쫄깃쫄깃', ' 씹히는 떡 맛'],
    ['l01', 'smell', '빵 굽는 ', '고소한', ' 냄새'],
    // l02 시 「풀밭에서」(정본) + 자체 구성
    ['l02', 'sight', '초록 풀밭에 ', '살랑살랑', ''], ['l02', 'sight', '노랑 민들레 ', '방긋방긋', ''],
    ['l02', 'sound', '풀벌레는 ', '또르르 또르르', ''], ['l02', 'smell', '코끝에 스미는 풀 내음 ', '향긋', ''],
    ['l02', 'sight', '밤하늘에 별이 ', '반짝반짝', ''], ['l02', 'sound', '시냇물이 ', '졸졸', ' 흘러요'],
    ['l02', 'sound', '연못에서 개구리가 ', '개굴개굴', ''], ['l02', 'smell', '부엌에서 ', '구수한', ' 된장국 냄새'],
    ['l02', 'smell', '바닷가에서 ', '짭조름한', ' 바다 냄새'], ['l02', 'taste', '', '새콤달콤', '한 딸기 맛'],
    ['l02', 'taste', '', '매콤한', ' 떡볶이 맛'], ['l02', 'taste', '', '달콤한', ' 꿀 한 숟가락 맛'],
    ['l02', 'touch', '강아지 털이 ', '보들보들', ''], ['l02', 'touch', '할아버지 수염이 ', '까끌까끌', ''],
    ['l02', 'touch', '새 이불이 ', '폭신폭신', ''], ['l02', 'touch', '얼음을 쥔 손이 ', '꽁꽁', ' 시려요'],
    // l04 시 「폴짝 줄넘기」(정본 — 소리 하나·모습 셋)
    ['l04', 'sound', '', '휘잉휘잉', ' 줄이 노래해'], ['l04', 'sight', '', '빙글빙글', ' 동그라미 그려요'],
    ['l04', 'sight', '', '폴짝폴짝', ' 콩처럼 튀고'], ['l04', 'sight', '', '사뿐사뿐', ' 깃털로 내려요'],
    ['l04', 'sound', '운동화가 ', '뽀득뽀득', ' 소리를 내요'], ['l04', 'sight', '토끼가 ', '깡충깡충', ' 뛰어가요']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], pre: s[2], w: s[3], post: s[4], item: s[2] + s[3] + s[4],
             explain: '「' + s[3] + '」 — ' + WHY[s[1]] };
  }

  return {
    id: 'sense_sort',
    title: '어떤 감각일까?',
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
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 감각 두 번 넘게 잇따름 0 · 같은 표현 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k;
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + '<u>' + q.w + '</u>' + q.post + ' → □ 모습 □ 소리 □ 냄새 □ 맛 □ 느낌'; },
    printAnswer: function (q) { return q.w + ' → ' + CATS.filter(function (c) { return c.key === q.cat; })[0].label.replace(/^\S+ /, ''); },
    printHead: '밑줄 친 감각적 표현이 어떤 감각을 나타내는지 □에 ✓ 하세요.'
  };
}));
