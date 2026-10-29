/* gens/social/change_sort.js — 어떤 사회 변화일까? (3학년 2학기 사회 1단원 「사회 변화와 다양한 문화」 l03·l04·l05·l06·l12 — 주제① 사회 변화로 달라진 생활 모습)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l06 s06 · l12 s04 네 사회 변화: 👶 저출산 · 👵 고령화 · 🤖 지능정보화 · 🌏 세계화.
 *   정본 l12 s07 「딩고 카드 열여섯 장을 네 주제로 — 한 주제에는 달라진 모습과 해결 노력이 함께」 · watch 「「사이버 범죄」와 「사이버 범죄 예방」은 같은 주제?」.
 *   l06 s06 watch 「변화와 노력을 엇갈려 짝짓는 경우」 · l12 s04 watch 「변화와 모습을 엇갈려 잇는 경우」.
 * 문장 = 달라진 모습(look) · 생긴 문제(prob) · 대응 노력(try) · 까닭(cause) 한 줄 · 밑줄 = 갈래를 정하는 곳. 문장에 사회 변화 이름 0.
 *   l02~l05 = 그 차시 개념 장·기본 문제·응용 장의 모습 · l06 = s06 대응 노력 · s12 포스터 문구 · l12 = s07 딩고 카드 열여섯 그대로.
 * 칸은 배운 것만 — 저출산 l02 · 고령화 l03 · 지능정보화 l04 · 세계화 l05 (categoriesFor). 그래서 활동은 칸이 둘 서는 l03 부터.
 * 덫(진단 축): ① 「일」 셋 — 일할 수 있는 사람 수(저출산) · 일자리 감소(지능정보화) · 일자리 제공(고령화)
 *   ② 「병원」 둘 — 출산을 도와주는 병원(저출산) · 노인 전문 병원(고령화) ③ 「기술」 — 의학 기술(고령화)
 *   ④ 「스마트폰」 — 세계 곳곳의 소식(세계화, 정본 l05 s04) ⑤ 「장단점」 — 누리고 보완(지능정보화) · 따져 받아들임(세계화)
 *   ⑥ 문제와 노력은 같은 주제 — 사이버 범죄 · 사이버 범죄 예방(정본 l12 s07 watch).
 * params: { upto: 'l03'|'l04'|'l05'|'l06'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 문장이 덱 앞머리 (all = l12 딩고 카드까지)
 * next() → { item, pre, w, post, cat, type, kind, explain, l, cats }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['change_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l02', 'l03', 'l04', 'l05', 'l06', 'l12'];
  var CATS = [{ key: 'low', label: '👶 저출산' }, { key: 'aging', label: '👵 고령화' }, { key: 'info', label: '🤖 지능정보화' }, { key: 'global', label: '🌏 세계화' }];
  var FROM = { low: 'l02', aging: 'l03', info: 'l04', global: 'l05' };   // 그 칸 이름이 정본에 처음 서는 차시
  var NAME = { low: '저출산', aging: '고령화', info: '지능정보화', global: '세계화' };
  var WHY = {
    look: { low: '태어나는 아이의 수가 줄어 달라진 모습이에요.', aging: '노인이 차지하는 비율이 높아져 달라진 모습이에요.',
            info: '인공지능과 정보 통신 기술로 달라진 모습이에요.', global: '세계 여러 나라와 오가며 달라진 모습이에요.' },
    prob: { info: '인공지능과 정보 통신 기술로 생긴 문제예요.', global: '세계 여러 나라를 오가며 생긴 문제예요.' },
    try:  { low: '아이를 낳아 기르는 부담을 덜려는 노력이에요.', aging: '노인의 건강하고 안정적인 생활을 도우려는 노력이에요.',
            info: '편리함은 누리고 문제는 보완하려는 노력이에요.', global: '세계 여러 나라와 함께 살아가려는 노력이에요.' },
    cause: { aging: '사람들이 오래 살게 된 까닭이라서 노인이 차지하는 비율이 높아져요.' }
  };

  /* [차시, 칸, 앞, 밑줄, 뒤, 갈래(look·prob·try·cause), 덫 풀이(선택)] */
  var S = [
    // l02 — 저출산(정본 s03·s07·s11·s14)
    ['l02', 'low', '', '학생 수', '가 줄어들고 있어요.', 'look'],
    ['l02', 'low', '', '가족 구성원의 수', '가 줄어들고 있어요.', 'look'],
    ['l02', 'low', '', '출산을 도와주는 병원', '의 수가 줄어들고 있어요.', 'look', '노인을 위한 병원이 아니라 아이가 태어나는 것을 돕는 병원이 줄어요.'],
    ['l02', 'low', '앞으로 ', '일할 수 있는 사람의 수', '가 줄어들 거예요.', 'look', '일자리가 아니라 일할 사람이 줄어드는 거예요.'],
    ['l02', 'low', '학생이 없어 ', '문을 닫은 학교', '가 생겼어요.', 'look'],
    ['l02', 'low', '자녀가 많은 가정은 ', '전기·가스·수도 요금', '을 할인받기도 해요.', 'try'],
    ['l02', 'low', '지역에 따라 ', '자녀 교육비', '를 지원해 주기도 해요.', 'try'],
    // l03 — 고령화(정본 s03·s04·s06·s07·s11·s14)
    ['l03', 'aging', '', '노인 전문 병원이나 요양 시설', '을 운영해요.', 'look', '같은 병원이라도 노인의 건강을 돌보는 곳이에요.'],
    ['l03', 'aging', '노인들에게 ', '배움의 기회', '를 주는 프로그램을 운영해요.', 'look'],
    ['l03', 'aging', '학교나 회사에서 ', '일을 하는 노인', '을 찾아볼 수 있어요.', 'look'],
    ['l03', 'aging', '우리 동네에 ', '노인 복지관', '이 새로 생겼어요.', 'look'],
    ['l03', 'aging', '', '등하교 안전 지킴이', '로 일하는 노인이 있어요.', 'look'],
    ['l03', 'aging', '백 명 마을에서 ', '노인이 4명에서 16명으로', ' 많아졌어요.', 'look'],
    ['l03', 'aging', '', '의학 기술', '이 발달해 사람들이 오래 살게 되었어요.', 'cause', '「기술」이 나와도 사람들이 오래 살게 된 이야기예요.'],
    ['l03', 'aging', '노인에게 ', '알맞은 일자리', '를 마련하려고 노력해요.', 'try'],
    // l04 — 지능정보화(정본 s04·s06·s07·s11·s14)
    ['l04', 'info', '', '인터넷', '으로 필요한 정보를 찾아봐요.', 'look'],
    ['l04', 'info', '멀리 떨어져 있는 사람과 ', '얼굴을 보며 대화', '해요.', 'look'],
    ['l04', 'info', '', '가상 현실(VR) 기기', '를 이용해 놀이해요.', 'look'],
    ['l04', 'info', '스마트폰을 이용해 ', '자전거를 빌려', ' 타요.', 'look'],
    ['l04', 'info', '', '배달 로봇', '이 물건을 날라 줘요.', 'look'],
    ['l04', 'info', '', '인공지능 전문가', '라는 직업이 새로 생겼어요.', 'look'],
    ['l04', 'info', '인공지능으로 만든 ', '가짜 뉴스', '가 많은 사람을 속여요.', 'prob'],
    ['l04', 'info', '다른 사람의 컴퓨터에 ', '허락 없이 들어가', ' 자료를 망가뜨려요.', 'prob'],
    ['l04', 'info', '', '스마트폰을 지나치게 이용', '해서 문제가 생겨요.', 'prob'],
    ['l04', 'info', '사람이 하던 일을 인공지능이 대신해 ', '일자리', '가 줄어들기도 해요.', 'prob', '일할 사람이 줄어서가 아니라 인공지능이 일을 대신해서 줄어요.'],
    // l05 — 세계화(정본 s03·s04·s05·s06·s07·s10·s14)
    ['l05', 'global', '동네에 ', '베트남 쌀국수 가게', '가 생겼어요.', 'look'],
    ['l05', 'global', '', '다른 나라에서 만든 영화', '를 볼 수 있어요.', 'look'],
    ['l05', 'global', '', '칠레에서 온 포도', '를 사 먹어요.', 'look'],
    ['l05', 'global', '우리나라 ', '라면', '이 미국과 중국에서 팔려요.', 'look'],
    ['l05', 'global', '', '우리나라 회사', '가 전 세계 곳곳에 진출해요.', 'look'],
    ['l05', 'global', '다른 나라 사람들이 ', '세종 학당', '에서 한국어를 배워요.', 'look'],
    ['l05', 'global', '', '스마트폰으로 세계 곳곳의 소식', '을 빠르게 주고받아요.', 'look', '스마트폰이 나와도 세계 여러 나라가 오가는 이야기예요.'],
    ['l05', 'global', '여러 나라를 오가는 사람이 많아져 ', '감염병', '이 빠르게 퍼질 수 있어요.', 'prob'],
    ['l05', 'global', '생활 양식이 비슷해지면서 ', '전통적인 생활 양식', '이 약해질 수 있어요.', 'prob'],
    // l06 — 대응 노력(정본 s06 · s12 포스터 문구)
    ['l06', 'low', '', '아이를 낳아 기르는 가정', '을 돕는 방법을 마련해요.', 'try'],
    ['l06', 'aging', '', '노인의 건강하고 안정적인 생활', '을 돕는 제도를 운영해요.', 'try'],
    ['l06', 'info', '', '장점은 누리고 단점은 보완', '하려는 태도가 필요해요.', 'try', '다른 나라 생활 양식을 따지는 것이 아니라 편리한 기술을 대하는 태도예요.'],
    ['l06', 'info', '', '사이버 범죄를 막기 위해', ' 모두 함께 노력해요.', 'try'],
    ['l06', 'global', '다른 나라의 생활 양식을 ', '장단점을 따져', ' 받아들여요.', 'try', '기술의 장단점이 아니라 다른 나라 생활 양식을 받아들이는 태도예요.'],
    ['l06', 'global', '세계 여러 나라의 문제를 ', '함께 풀려는', ' 자세가 필요해요.', 'try'],
    ['l06', 'global', '우리의 이웃이 된 ', '세계인들을 친구처럼', ' 여겨요.', 'try'],
    // l12 — 딩고 카드 열여섯(정본 s07 그대로)
    ['l12', 'low', '', '양육비 지원', '', 'try'],
    ['l12', 'low', '', '보육 시설 운영', '', 'try'],
    ['l12', 'low', '', '학생 수 감소', '', 'look'],
    ['l12', 'low', '', '일할 수 있는 사람 수 감소', '', 'look', '일자리가 아니라 일할 사람이 줄어드는 거예요.'],
    ['l12', 'aging', '', '일자리 제공', '', 'try', '노인에게 알맞은 일자리를 마련하는 노력이에요.'],
    ['l12', 'aging', '', '노인을 위한 시설 증가', '', 'look'],
    ['l12', 'aging', '', '복지 제도 운영', '', 'try'],
    ['l12', 'aging', '', '일을 하거나 일자리를 찾는 노인 증가', '', 'look'],
    ['l12', 'info', '', '인공지능 발달', '', 'look'],
    ['l12', 'info', '', '사이버 범죄', '', 'prob'],
    ['l12', 'info', '', '올바른 인터넷·스마트폰 사용 습관', '', 'try'],
    ['l12', 'info', '', '사이버 범죄 예방', '', 'try', '문제(사이버 범죄)와 그 문제를 막는 노력은 같은 주제예요.'],
    ['l12', 'global', '', '감염병의 빠른 확산', '', 'prob'],
    ['l12', 'global', '', '세계적인 문제에 관심', '', 'try'],
    ['l12', 'global', '', '다른 나라와의 교류 활발', '', 'look'],
    ['l12', 'global', '', '우리나라의 생활 양식을 소중히 여기는 태도', '', 'try']
  ];

  function lim(upto) { var i = ORDER.indexOf(upto); return (upto === 'all' || i < 0) ? ORDER.length - 1 : i; }
  function norm(upto) { return (upto === 'all' || ORDER.indexOf(upto) < 0 || upto === 'l02' || upto === 'l12') ? (upto === 'l02' ? 'l03' : 'all') : upto; }
  function categoriesFor(upto) { var L = lim(norm(upto)); return CATS.filter(function (c) { return ORDER.indexOf(FROM[c.key]) <= L; }); }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s, cats) {
    return { l: s[0], cat: s[1], type: s[1], kind: s[5], pre: s[2], w: s[3], post: s[4], item: s[2] + s[3] + s[4], cats: cats,
             explain: '「' + s[3] + '」 — ' + (s[6] ? s[6] + ' ' : '') + WHY[s[5]][s[1]] + ' → ' + NAME[s[1]] };
  }

  return {
    id: 'change_sort',
    title: '어떤 사회 변화일까?',
    categories: CATS,
    categoriesFor: categoriesFor,
    NAME: NAME,
    FROM: FROM,
    S: S,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = norm(p.upto);
      var L = lim(upto), cats = categoriesFor(upto), keys = cats.map(function (c) { return c.key; });
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= L && keys.indexOf(s[1]) >= 0) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return S[k][0] === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, lastW = '', lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (k === last || S[k][3] === lastW) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        categories: cats,
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
    printRender: function (q) {
      var ks = q.cats || CATS.map(function (c) { return c.key; });
      return q.pre + '<u>' + q.w + '</u>' + q.post + ' → ' + ks.map(function (k) { return '□ ' + NAME[k]; }).join(' ');
    },
    printAnswer: function (q) { return q.w + ' → ' + NAME[q.cat]; },
    printHead: '밑줄 친 곳을 보고, 어떤 사회 변화로 달라진 모습이거나 그 변화에 대응하는 노력인지 □에 ✓ 하세요.'
  };
}));
