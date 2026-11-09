/* gens/science/g5_2_split_sort.js — 어떻게 분리할까? (5학년 2학기 과학 1단원 「혼합물의 분리」 l04 · l05 · l07 · l10)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 혼합물·장면은 교과서·지도서 그대로.
 * 칸 = 지도서 단원 평가 3번 보기의 「성질 → 도구」 세 짝(알갱이의 크기가 다른 성질 → 체 · 섞이지 않고 분리되는 성질 → 스포이트
 *   · 물에 녹는 성질 → 거름 장치와 증발 장치) — 『과학』 3차시 · 4차시 · 5~6차시 탐구가 하나씩 맡는 세 방법.
 *   🥅 체(알갱이 크기) · 💧 스포이트·흡착포(섞이지 않는 액체) · ♨️ 거름과 증발(물에 녹는 성질)
 * 혼합물 출처(지도서 과학 5-2 1단원 · 『과학』 쪽):
 *   size     모래와 자갈(3차시 탐구) · 콩·팥·좁쌀(활동) · 좁쌀·쌀·팥(평가) · 자갈·콩·모래(평가) · 모래 속 작은 조개 · 해변 쓰레기 수거 장비(33쪽 예)
 *   oil      물과 기름(4차시 탐구) · 간장과 참기름 양념장(4차시 도입) · 바다에 유출된 기름 — 흡착포
 *   dissolve 소금과 모래(5~6차시 탐구) · 소금과 후추(평가) · 염전에서 바닷물로 소금 얻기 · 소금 호수(표지) · 전통 장 만들기
 * 진단 축(지도서 「성질 → 도구」 · 평가 문항): 말 덫 ① 고체끼리라도 한쪽이 물에 녹으면 ♨️(소금과 후추 · 소금과 모래) — 크기로 가르는 🥅 이 아님
 *   말 덫 ② 액체가 섞여도 기름은 물에 녹지 않고 뜨므로 💧(바다의 기름 · 양념장의 참기름) — ♨️ 이 아님
 * 칸은 배운 것만 선다(categoriesFor) — 4차시까지 둘(체 · 스포이트) · 5차시부터 셋.
 * params: { upto: 'l04'|'all' }
 * next() → { item, tag, w, cat, type, why, explain, l, cats }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_split_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l03', 'l04', 'l05'];
  var CATS = [{ key: 'size', label: '🥅 체' }, { key: 'oil', label: '💧 스포이트·흡착포' }, { key: 'dissolve', label: '♨️ 거름과 증발' }];
  var NAME = { size: '체', oil: '스포이트·흡착포', dissolve: '거름과 증발' };
  var FROM = { size: 'l03', oil: 'l04', dissolve: 'l05' };
  var DOES = { size: '알갱이의 크기가 다른 고체 혼합물은 체로 분리해요.',
               oil: '섞이지 않고 층으로 나뉘는 액체 혼합물은 스포이트나 흡착포로 분리해요.',
               dissolve: '물에 녹는 물질이 섞인 혼합물은 물에 녹여 거른 뒤, 물을 증발시켜 녹은 물질을 얻어요.' };

  /* [칸, 장면(태그), 혼합물·장면, 풀이, 덧붙임 풀이(선택 — 말 덫)] */
  var S = [
    ['size', '탐구', '모래와 자갈의 혼합물', '모래와 자갈은 알갱이의 크기가 달라요.'],
    ['size', '활동', '콩, 팥, 좁쌀의 혼합물', '눈 크기가 다른 체 두 개로 차례로 걸러요.'],
    ['size', '평가', '좁쌀, 쌀, 팥이 섞인 혼합물', '눈 크기가 좁쌀보다 크고 쌀보다 작은 체로 좁쌀을 걸러요.'],
    ['size', '평가', '자갈, 콩, 모래가 섞인 혼합물', '알갱이 크기에 맞는 체를 차례로 써요.'],
    ['size', '생활', '모래 속에 있는 작은 조개 잡기', '체를 사용해 모래와 조개를 분리해요.'],
    ['size', '생활', '해변 쓰레기 수거 장비', '모래와 쓰레기를 분리할 때도 체를 사용해요.'],
    ['oil', '탐구', '물과 기름의 혼합물', '물과 기름은 섞이지 않고 기름이 위에 떠요.'],
    ['oil', '도입', '간장과 참기름을 섞은 양념장', '참기름은 간장과 섞이지 않고 위로 떠요.', '액체끼리 섞여도 녹지 않고 뜨는 기름은 거름과 증발이 아니라 스포이트로 걷어 내요.'],
    ['oil', '생활', '바다에 유출된 기름', '흡착포로 바다 위의 기름을 제거해요.', '바닷물에 섞여도 기름은 물에 녹지 않아 흡착포로 빨아들여요.'],
    ['dissolve', '탐구', '소금과 모래의 혼합물', '물에 녹인 뒤 거름 장치로 모래를 거르고, 증발 장치로 소금을 얻어요.', '둘 다 고체 알갱이지만 크기가 아니라 물에 녹는 성질로 갈라요.'],
    ['dissolve', '평가', '소금과 후추의 혼합물', '물에 넣어 저은 뒤 걸러 후추를 분리하고, 물을 증발시켜 소금을 얻어요.', '알갱이 크기가 아니라 소금만 물에 녹는 성질로 갈라요.'],
    ['dissolve', '생활', '염전에서 바닷물로 소금 얻기', '바닷물을 모아 물을 증발시키면 소금이 남아요.'],
    ['dissolve', '표지', '소금 호수에 남은 흰색 소금', '호수의 물이 증발해 흰색의 소금이 남았어요.'],
    ['dissolve', '생활', '전통 장 만들기', '생활 속에서도 거름이나 증발을 이용해 전통 장을 만들어요.']
  ];

  function lim(upto) { var i = ORDER.indexOf(upto); return (upto === 'all' || i < 0) ? ORDER.length - 1 : i; }
  function norm(upto) { return upto === 'l04' ? 'l04' : 'all'; }
  function categoriesFor(upto) { var L = lim(norm(upto)); return CATS.filter(function (c) { return ORDER.indexOf(FROM[c.key]) <= L; }); }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s, keys) {
    return { l: FROM[s[0]], cat: s[0], type: s[0], tag: s[1], w: s[2], why: s[3], item: s[1] + ' — ' + s[2], cats: keys,
             explain: '「' + s[2] + '」 — ' + NAME[s[0]] + '로 분리해요. ' + s[3] + ' ' + (s[4] ? s[4] + ' ' : '') + DOES[s[0]] };
  }

  return {
    id: 'g5_2_split_sort',
    title: '어떻게 분리할까?',
    categories: CATS,
    categoriesFor: categoriesFor,
    NAME: NAME, FROM: FROM, DOES: DOES, S: S, ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = norm(p.upto);
      var cats = categoriesFor(upto), keys = cats.map(function (c) { return c.key; });
      var idx = [];
      S.forEach(function (s, k) { if (keys.indexOf(s[0]) >= 0) idx.push(k); });
      var deck = shuffle(rng, idx);
      var last = -1, lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (k === last) continue; if (run >= 1 && S[k][0] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        categories: cats,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0
          var k = deck.splice(at, 1)[0];
          run = S[k][0] === lastCat ? run + 1 : 0; lastCat = S[k][0]; last = k;
          return build(S[k], keys);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) {
      var ks = q.cats || CATS.map(function (c) { return c.key; });
      return q.w + ' → ' + ks.map(function (k) { return '□ ' + NAME[k]; }).join(' ');
    },
    printAnswer: function (q) { return q.w + ' → ' + NAME[q.cat]; },
    printHead: '혼합물을 보고, 어떤 성질을 이용해 무엇으로 분리하면 좋을지 □에 ✓ 하세요.'
  };
}));
