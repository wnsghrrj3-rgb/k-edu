/* gens/science/g5_2_heat_sort.js — 열은 어떻게 이동할까? (5학년 2학기 과학 3단원 「열과 우리 생활」 l05 · l07 · l08 · l12)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 장면은 교과서·지도서 그대로.
 * 칸 = 『과학』 74~75쪽 8차시 「여러 방식으로 이동하는 열」 세 방식 — 🔥 전도(고체에서 · 4차시) · 🌀 대류(액체·기체에서 · 5·6차시) · ☀️ 복사(빛에 의해 · 7차시)
 * 장면 출처(지도서 과학 5-2 3단원 — 정리·평가·학생 표현 예시의 「~로 열이 이동」 문장):
 *   conduct  프라이팬으로 음식 익히기 · 뜨거운 국에 담근 금속 숟가락 · 불 위의 철판 · 다리미로 다림질 · 구리판 실험
 *   convect  냄비 아랫부분을 가열해 물 끓이기 · 전기 주전자로 물 데우기 · 전기난로를 아래쪽에 설치 · 난방기로 집 안 공기 데우기
 *   radiate  난로 앞에 가면 따뜻함 · 모닥불 앞 · 창가에 햇빛이 비치면 방 안이 따뜻 · 태양 빛이 지구 표면에 도달
 * 진단 축(평가 문항 「② 전기난로의 열이 이동하는 방식은 전도이다」 ✕ · 지도서 「난로 앞에 가면 따뜻한 까닭도 복사」):
 *   말 덫 ① 같은 난로라도 아래쪽에 두어 방 공기를 데우는 일은 🌀 대류 · 난로 앞에서 느끼는 따뜻함은 ☀️ 복사 — 전도가 아님
 *   말 덫 ② 같은 물 끓이기라도 냄비·주전자 속 물이 돌며 데워지는 일은 🌀 대류 · 금속 손잡이·숟가락이 뜨거워지는 일은 🔥 전도
 * 칸은 배운 것만 선다(categoriesFor) — 6차시까지 둘(전도 · 대류) · 7차시부터 셋.
 * params: { upto: 'l05'|'all' }
 * next() → { item, tag, w, cat, type, why, explain, l, cats }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_heat_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l04', 'l05', 'l07'];
  var CATS = [{ key: 'conduct', label: '🔥 전도' }, { key: 'convect', label: '🌀 대류' }, { key: 'radiate', label: '☀️ 복사' }];
  var NAME = { conduct: '전도', convect: '대류', radiate: '복사' };
  var IS = { conduct: '전도예요', convect: '대류예요', radiate: '복사예요' };
  var FROM = { conduct: 'l04', convect: 'l05', radiate: 'l07' };
  var DOES = { conduct: '전도는 고체에서 온도가 높은 부분에서 낮은 부분으로 물체를 따라 열이 이동하는 방식이에요.',
               convect: '대류는 액체나 기체에서 데워진 물질이 위로 올라가고 차가운 물질이 내려오며 열이 이동하는 방식이에요.',
               radiate: '복사는 물질을 통하지 않고 열이 직접 이동하는 방식이에요.' };

  /* [칸, 장면(태그), 장면, 풀이, 덧붙임 풀이(선택 — 말 덫)] */
  var S = [
    ['conduct', '부엌', '프라이팬으로 음식 익히기', '프라이팬의 아랫부분을 가열하면 프라이팬 전체로 열이 이동해요.'],
    ['conduct', '부엌', '뜨거운 국에 담근 금속 숟가락', '숟가락을 따라 손잡이 쪽까지 열이 이동해요.', '같은 국이라도 숟가락이 뜨거워지는 일은 대류가 아니라 고체를 따라 이동하는 전도예요.'],
    ['conduct', '실험', '불 위에 놓은 철판', '불 위에 철판을 놓으면 철판 전체가 뜨거워져요.'],
    ['conduct', '집', '다리미로 다림질하기', '다리미를 켜면 금속 부분으로 열이 이동해요.'],
    ['conduct', '실험', '구리판 한쪽을 가열하기', '가열한 곳에서 먼 곳으로 구리판을 따라 열이 이동해요.'],
    ['convect', '부엌', '냄비 아랫부분을 가열해 물 끓이기', '아래에서 데워진 물이 위로 올라가며 물 전체가 데워져요.', '같은 냄비라도 물이 돌며 데워지는 일은 전도가 아니라 대류예요.'],
    ['convect', '부엌', '전기 주전자로 물 데우기', '전기 주전자는 물이 돌며 물 전체를 데워요.'],
    ['convect', '집', '전기난로를 방 아래쪽에 두기', '데워진 공기가 위로 올라가고 돌며 방 전체가 따뜻해져요.', '같은 난로라도 아래쪽에 두어 방 공기를 데우는 일은 대류예요.'],
    ['convect', '집', '난방기로 집 안 공기 데우기', '난방기를 켜면 집 안의 공기가 돌며 빠르게 데워져요.'],
    ['radiate', '집', '난로 앞에 가면 따뜻해요', '난로에서 열이 직접 이동해 와요.', '같은 난로라도 앞에 섰을 때 바로 느끼는 따뜻함은 전도가 아니라 복사예요.'],
    ['radiate', '밖', '모닥불 앞에서 느끼는 따뜻함', '모닥불에서 열이 직접 이동해 와요.'],
    ['radiate', '집', '창가에 햇빛이 비쳐 방 안이 따뜻해요', '햇빛에 의해 열이 직접 이동해요.'],
    ['radiate', '자연', '태양 빛이 지구 표면에 닿아요', '태양의 열이 물질을 통하지 않고 지구까지 와요.']
  ];

  function lim(upto) { var i = ORDER.indexOf(upto); return (upto === 'all' || i < 0) ? ORDER.length - 1 : i; }
  function norm(upto) { return upto === 'l05' ? 'l05' : 'all'; }
  function categoriesFor(upto) { var L = lim(norm(upto)); return CATS.filter(function (c) { return ORDER.indexOf(FROM[c.key]) <= L; }); }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s, keys) {
    return { l: FROM[s[0]], cat: s[0], type: s[0], tag: s[1], w: s[2], why: s[3], item: s[1] + ' — ' + s[2], cats: keys,
             explain: '「' + s[2] + '」 — ' + IS[s[0]] + '. ' + s[3] + ' ' + (s[4] ? s[4] + ' ' : '') + DOES[s[0]] };
  }

  return {
    id: 'g5_2_heat_sort',
    title: '열은 어떻게 이동할까?',
    categories: CATS,
    categoriesFor: categoriesFor,
    NAME: NAME, IS: IS, FROM: FROM, DOES: DOES, S: S, ORDER: ORDER,
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
    printHead: '장면을 읽고, 열이 어떤 방식으로 이동하는지 □에 ✓ 하세요.'
  };
}));
