/* gens/social/custom_sort.js — 세시 풍속일까, 일상생활 속 풍습일까? (3학년 2학기 사회 2단원 「일상생활 속 풍습과 교통·통신」 l01~l06 — 주제① 옛날과 오늘날의 풍습)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l01 s07 두 동그라미 그대로: ⭕ 일상생활 속 풍습(풍습 동그라미) · 🎯 세시 풍속(풍습 안쪽 동그라미).
 *   l01 s12 도전 「생일날 미역국이 세시 풍속에 놓이지 않는 까닭 — 생일은 사람마다 날이 달라」
 *   l07 s07 전광판 watch 「미역국·김장 같은 일상생활 속 풍습에도 불을 켜는 경우 — 명절·절기와 이어지는지」.
 *   l01 s15 오개념 「세시 풍속은 풍습이 아니야」 → 세시 풍속 풀이는 늘 「…되풀이하는 풍습이에요」(안쪽 동그라미도 풍습).
 * 문장 = 풍습 한 줄 · 밑줄 = 그 풍습(하는 일) · 앞 = 때·상황. 문장에 칸 이름(세시·일상·풍습·풍속) 0.
 *   l01 = s07 카드 여덟 그대로 + s04 설날 떡국·윷놀이 · s14 백일잔치 · l02 = 품앗이·일생 풍습(s04~s07·s14·s16)
 *   l03 = 혼례 비교·이어지는/사라져 가는 풍습(s04~s07·s14) · l04 = 다섯 명절(s04~s07) · l05 = 계절·설날 글(s05·s07) · l06 = 복주머니(s05).
 * 덫(진단 축): ① 떡 넷 — 이사 떡·백일잔치 떡(일상) · 설날 떡국·단오 수리취떡(세시)
 *   ② 먹는 풍습 — 생일 미역국(일상) ↔ 동지 팥죽(세시) ③ 「겨울」 — 김장(일상, l07 watch)
 *   ④ 지내는 예식 — 명절날 차례(세시) ↔ 장례(일상) ⑤ 품앗이 = 일상(l07 전광판 꺼진 칸).
 * 「결」은 차단 어휘라 「결혼」 말 대신 정본 l02 「혼례」로 쓴다(혼례 날·혼례를 마치고).
 * params: { upto: 'l01'|'l02'|'l03'|'l04'|'l05'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 문장이 덱 앞머리 (all = l06 복주머니까지)
 * next() → { item, pre, w, post, cat, type, when, explain, l, cats }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['custom_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l01', 'l02', 'l03', 'l04', 'l05', 'l06'];
  var CATS = [{ key: 'daily', label: '⭕ 일상생활 속 풍습' }, { key: 'season', label: '🎯 세시 풍속' }];
  var NAME = { daily: '일상생활 속 풍습', season: '세시 풍속' };
  var DAY = { seol: '설날', boreum: '정월 대보름', dano: '단오', chuseok: '추석', dongji: '동지', any: '명절' };
  function why(cat, when) {
    if (cat === 'season') return '해마다 ' + DAY[when] + '에 되풀이하는 풍습이에요.';
    if (when === 'life') return '사람마다 그날이 달라, 해마다 일정한 때에 모두 함께 하는 일이 아니에요.';
    return '집마다 하는 때가 달라, 해마다 일정한 때에 모두 함께 하는 일이 아니에요.';
  }

  /* [차시, 칸, 앞(때·상황), 밑줄(풍습), 뒤, 때(life·home | 명절 키), 덫 풀이(선택)] */
  var S = [
    // l01 — 정본 s07 카드 여덟 그대로 + s04 · s14
    ['l01', 'daily', '생일날 ', '미역국을 먹어요', '.', 'life', '먹는 풍습이라도 생일은 명절이 아니에요.'],
    ['l01', 'daily', '겨울이 되기 전에 ', '김장을 하고 나눠요', '.', 'home', '「겨울」이 나와도 명절이나 절기가 아니에요.'],
    ['l01', 'daily', '첫 번째 생일에 ', '돌잔치를 해요', '.', 'life'],
    ['l01', 'daily', '이사할 때 ', '이웃들에게 떡을 돌려요', '.', 'home', '떡을 나누어도 이사는 명절이 아니에요.'],
    ['l01', 'daily', '태어난 지 100일에 ', '떡을 나누는 백일잔치', '를 해요.', 'life', '떡을 나누어도 백일은 명절이 아니에요.'],
    ['l01', 'season', '명절날 아침에 ', '차례를 지내요', '.', 'any'],
    ['l01', 'season', '추석에 ', '송편을 먹어요', '.', 'chuseok'],
    ['l01', 'season', '', '연날리기 같은 전통 놀이', '를 즐겨요.', 'any'],
    ['l01', 'season', '설날에 ', '어른들께 세배해요', '.', 'seol'],
    ['l01', 'season', '설날 아침에 ', '떡국을 먹어요', '.', 'seol', '같은 떡이라도 설날은 모두에게 같은 날이에요.'],
    ['l01', 'season', '설날에 다 함께 ', '윷놀이를 해요', '.', 'seol'],
    // l02 — 품앗이 · 일생 동안의 풍습(정본 s04·s05·s06·s07·s14·s16)
    ['l02', 'daily', '김장할 때 이웃끼리 ', '품앗이로 서로 도와요', '.', 'home', '김장을 돌아가며 도와도 명절에 하는 일이 아니에요.'],
    ['l02', 'daily', '일손이 모자랄 때 ', '지붕 얹기', '를 서로 도와요.', 'home'],
    ['l02', 'daily', '이웃끼리 아이를 번갈아 돌봐 주는 ', '육아 품앗이', '를 해요.', 'home'],
    ['l02', 'daily', '반찬을 만들어 나누는 ', '반찬 품앗이', '를 해요.', 'home'],
    ['l02', 'daily', '아기가 태어나면 대문에 ', '금줄', '을 쳐요.', 'life'],
    ['l02', 'daily', '어른이 되는 ', '관례', '를 치러요.', 'life'],
    ['l02', 'daily', '부모님이 오래 사시기를 빌며 ', '회갑', '을 축하해요.', 'life'],
    ['l02', 'daily', '남은 가족들을 위로하며 ', '장례', '를 치러요.', 'life', '차례처럼 예식을 치러도 명절에 하는 일이 아니에요.'],
    // l03 — 옛날과 오늘날의 혼례 · 이어지는 풍습 · 사라져 가는 풍습(정본 s04·s05·s06·s07·s14)
    ['l03', 'daily', '옛날 혼례 날 신랑은 ', '나무로 만든 기러기', '를 가지고 갔어요.', 'life'],
    ['l03', 'daily', '혼례를 마치고 신랑 집안 어른들께 ', '폐백', '을 드려요.', 'life'],
    ['l03', 'daily', '평생 함께할 것을 약속하며 ', '반지', '를 주고받아요.', 'life'],
    ['l03', 'daily', '신랑 신부가 ', '신혼여행', '을 떠나요.', 'life'],
    ['l03', 'daily', '할아버지의 ', '회갑잔치', '를 열어요.', 'life'],
    ['l03', 'daily', '돌아가신 분을 나무 밑에 모시는 ', '수목장', '을 치러요.', 'life'],
    // l04 — 다섯 명절(정본 s04·s05·s06·s07)
    ['l04', 'season', '설날에 ', '설빔을 입어요', '.', 'seol'],
    ['l04', 'season', '설날에 ', '복조리', '를 걸어요.', 'seol'],
    ['l04', 'season', '설날에 ', '널뛰기', '를 즐겨요.', 'seol'],
    ['l04', 'season', '정월 대보름에 ', '부럼을 깨물어요', '.', 'boreum'],
    ['l04', 'season', '정월 대보름에 ', '오곡밥과 나물', '을 먹어요.', 'boreum'],
    ['l04', 'season', '정월 대보름 밤에 ', '달맞이', '를 하며 소원을 빌어요.', 'boreum'],
    ['l04', 'season', '풍년을 빌며 ', '쥐불놀이', '를 해요.', 'boreum'],
    ['l04', 'season', '', '달집태우기', '를 하며 풍년을 빌어요.', 'boreum'],
    ['l04', 'season', '단오에 ', '부채를 주고받아요', '.', 'dano'],
    ['l04', 'season', '단오에 ', '창포 삶은 물에 머리를 감아요', '.', 'dano'],
    ['l04', 'season', '단오에 ', '수리취떡', '을 먹어요.', 'dano', '같은 떡이라도 단오는 해마다 같은 날이에요.'],
    ['l04', 'season', '단오에 ', '씨름과 그네뛰기', '를 즐겨요.', 'dano'],
    ['l04', 'season', '추석에 ', '성묘', '하러 가요.', 'chuseok'],
    ['l04', 'season', '추석에 ', '강강술래', '를 해요.', 'chuseok'],
    ['l04', 'season', '추석에 ', '새로 난 곡식과 과일로 차례', '를 지내요.', 'chuseok'],
    ['l04', 'season', '동지에 ', '팥죽을 먹어요', '.', 'dongji', '먹는 풍습이라도 동지는 해마다 같은 때예요.'],
    ['l04', 'season', '동지에 ', '새해 달력과 버선', '을 주고받아요.', 'dongji'],
    // l05 — 계절·설날 글(정본 s05 · s07 노란 형광펜)
    ['l05', 'season', '새해 첫 보름달을 보며 ', '한 해의 풍년', '을 빌어요.', 'boreum'],
    ['l05', 'season', '설날에 친척들이 할아버지 댁에 모여 ', '차례', '를 지냈어요.', 'seol'],
    ['l05', 'season', '추석에 곡식을 거두고 ', '수확의 기쁨', '을 함께 나눠요.', 'chuseok'],
    // l06 — 복주머니(정본 s05)
    ['l06', 'season', '설날에 ', '복주머니', '를 차요.', 'seol']
  ];

  function lim(upto) { var i = ORDER.indexOf(upto); return (upto === 'all' || i < 0) ? ORDER.length - 1 : i; }
  function norm(upto) { return (ORDER.indexOf(upto) < 0 || upto === 'l06') ? 'all' : upto; }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s, cats) {
    return { l: s[0], cat: s[1], type: s[1], when: s[5], pre: s[2], w: s[3], post: s[4], item: s[2] + s[3] + s[4], cats: cats,
             explain: '「' + s[3] + '」 — ' + (s[6] ? s[6] + ' ' : '') + why(s[1], s[5]) + ' → ' + NAME[s[1]] };
  }

  return {
    id: 'custom_sort',
    title: '세시 풍속일까, 일상생활 속 풍습일까?',
    categories: CATS,
    categoriesFor: function () { return CATS; },
    NAME: NAME,
    DAY: DAY,
    S: S,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = norm(p.upto);
      var L = lim(upto), keys = CATS.map(function (c) { return c.key; });
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= L) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return S[k][0] === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, lastW = '', lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (k === last || S[k][3] === lastW) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        categories: CATS,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0 · 같은 밑줄 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k; lastW = S[k][3];
          return build(S[k], keys);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + '<u>' + q.w + '</u>' + q.post + ' → □ ' + NAME.daily + ' □ ' + NAME.season; },
    printAnswer: function (q) { return q.w + ' → ' + NAME[q.cat]; },
    printHead: '밑줄 친 풍습이 해마다 일정한 때에 되풀이하는 세시 풍속인지, 일상생활 속 풍습인지 □에 ✓ 하세요.'
  };
}));
