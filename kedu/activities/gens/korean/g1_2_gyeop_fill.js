/* gens/korean/g1_2_gyeop_fill.js — 겹받침 채우기 (1학년 2학기 국어 2단원 「낱말을 정확하게 읽어요」 l03 · l05 · l13 · l14 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 근거 = 지도서(국어 1-2 ㉮ 2단원) 98~105쪽: 『국어』 42~43쪽 5번 「두 낱말에 공통으로 들어갈 받침」 — 칸 넷이 바로 ㄺ·ㄼ·ㅀ·ㅄ
 *   (붉다·읽다 / 짧다·밟다 / 닳다·뚫다 / 약값·없다) · 44~45쪽 6번 붙임딱지 문장(하늘이 맑다 · 낙엽이 붉다 · 호수가 넓다 · 흙을 밟다 ·
 *   무릎을 꿇다 · 개미가 틀림없다 · 구멍을 뚫다) · 46~47쪽 1·2번(불빛이 밝다 · 들판이 넓다 · 감기를 앓다 · 물이 없다 ·
 *   우산을 잃어버렸다 · 바구니에 사과가 없다) · 48쪽 3번 잘못 쓴 글자(닥 → 닭 · 짭다 → 짧다 · 달았다 → 닳았다 · 업다 → 없다) ·
 *   49쪽 4번 「낱말 쓰기 놀이」(글자판의 길을 따라가며 받침을 채워 문장을 완성 — 이 활동이 그 놀이를 옮긴 것) · 74~75쪽 실천(굵다 · 여덟).
 *   소리는 지도서·정본에 적힌 [ ] 그대로(붉다[북따] · 밟다[밥ː따] · 닳다[달타] · 약값[약깝] · 맑다[막따] …).
 * 판 = 문장 하나 · 받침 자리가 빈 글자 하나(□). 칸 = 그 자리에 들어갈 겹받침. 정본 l03·l05 오개념 「밟다는 소리대로 밥다라고 써도 된다 ·
 *   업다라고 써도 뜻은 같다」가 이 판의 까닭 — 소리는 하나만 나도 글자는 겹받침 그대로.
 * params: { upto: 'l03'|'l05'|'all' }  l03 = 4차시까지 · l05 = 6차시까지 · all = 단원 전체(l13 실천·l14 마무리) · 이번 차시 문장이 덱 앞머리
 * next() → { item, pre, hole, post, word, cat, type, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g1_2_gyeop_fill'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l03', 'l05', 'l13'];
  var CATS = [{ key: 'rg', label: 'ㄺ' }, { key: 'rb', label: 'ㄼ' }, { key: 'rh', label: 'ㅀ' }, { key: 'bs', label: 'ㅄ' }];
  var JONG = { rg: 9, rb: 11, rh: 15, bs: 18 };                       // 유니코드 종성 번호
  var PAIR = { rg: 'ㄹ과 ㄱ', rb: 'ㄹ과 ㅂ', rh: 'ㄹ과 ㅎ', bs: 'ㅂ과 ㅅ' };

  /* [차시, 칸, 앞, 받침 글자(빈칸이 될 글자), 뒤, 낱말(기본꼴), 소리(지도서·정본 표기, 없으면 '')] */
  var S = [
    // l03 글자의 짜임 알기 (『국어』 38~45쪽)
    ['l03', 'rg', '하늘이 ', '맑', '다.', '맑다', '[막따]'],
    ['l03', 'rg', '낙엽이 ', '붉', '다.', '붉다', '[북따]'],
    ['l03', 'rg', '동화책을 ', '읽', '다.', '읽다', '[익따]'],
    ['l03', 'rg', '', '흙', '을 밟다.', '흙', ''],
    ['l03', 'rb', '흙을 ', '밟', '다.', '밟다', '[밥ː따]'],
    ['l03', 'rh', '무릎을 ', '꿇', '다.', '꿇다', '[꿀타]'],
    ['l03', 'rh', '구멍을 ', '뚫', '다.', '뚫다', '[뚤타]'],
    ['l03', 'rh', '냄비의 물이 ', '끓', '는다.', '끓다', ''],
    ['l03', 'bs', '개미가 틀림', '없', '다.', '틀림없다', '[틀리멉따]'],
    ['l03', 'bs', '약', '값', '이 이천 원이다.', '약값', '[약깝]'],
    // l05 받침에 주의하며 문장 쓰기 (『국어』 46~49쪽)
    ['l05', 'rg', '불빛이 ', '밝', '다.', '밝다', '[박따]'],
    ['l05', 'rg', '', '닭', '과 병아리가 모이를 먹는다.', '닭', '[닥]'],
    ['l05', 'rb', '들판이 ', '넓', '다.', '넓다', '[널따]'],
    ['l05', 'rb', '호수가 ', '넓', '다.', '넓다', '[널따]'],
    ['l05', 'rb', '크레파스가 연필보다 ', '짧', '다.', '짧다', '[짤따]'],
    ['l05', 'rh', '감기를 ', '앓', '다.', '앓다', '[알타]'],
    ['l05', 'rh', '연필심이 ', '닳', '았다.', '닳다', '[달타]'],
    ['l05', 'rh', '연우는 학교에서 우산을 ', '잃', '어버렸다.', '잃어버리다', ''],
    ['l05', 'bs', '물이 ', '없', '다.', '없다', '[업ː따]'],
    ['l05', 'bs', '바구니에 사과가 ', '없', '다.', '없다', '[업ː따]'],
    ['l05', 'bs', '필통에 연필이 ', '없', '다.', '없다', '[업ː따]'],
    // l13 배운 내용 실천하기 — 겹받침 낱말 카드 (『국어』 74~75쪽)
    ['l13', 'rg', '나무 기둥이 ', '굵', '다.', '굵다', '[국ː따]'],
    ['l13', 'rb', '문어는 다리가 여', '덟', ' 개다.', '여덟', '[여덜]']
  ];

  function open(syl) { var c = syl.charCodeAt(0) - 0xAC00; return String.fromCharCode(0xAC00 + c - c % 28); }   // 받침을 뺀 글자
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function nameOf(k) { return CATS.filter(function (c) { return c.key === k; })[0].label; }

  function build(s) {
    var sound = s[6] ? ' ' + s[6] : '';
    return { l: s[0], cat: s[1], type: s[1], pre: s[2], hole: open(s[3]), syl: s[3], post: s[4], word: s[5],
             item: s[2] + open(s[3]) + '□' + s[4],
             explain: '「' + s[5] + '」' + sound + ' — 받침 ' + nameOf(s[1]) + '(' + PAIR[s[1]] + '). 소리는 하나만 나도 글자는 겹받침 그대로 「' + s[3] + '」로 써요.' };
  }

  return {
    id: 'g1_2_gyeop_fill',
    title: '겹받침 채우기',
    categories: CATS,
    JONG: JONG,
    S: S,
    ORDER: ORDER,
    open: open,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return S[k][0] === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, lastWord = '', lastSent = '', lastCat = '', run = 0;
      function sent(k) { return S[k][2] + S[k][3] + S[k][4]; }
      function find() {
        for (var t = 0; t < deck.length; t++) {
          var k = deck[t];
          if (k === last || S[k][5] === lastWord || sent(k) === lastSent) continue;   // 같은 낱말·같은 문장 연달아 0 (넓다·없다 · 흙을 밟다)
          if (run >= 1 && S[k][1] === lastCat) continue;                    // 같은 받침 두 번 넘게 잇따름 0
          return t;
        }
        return -1;
      }
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }
          if (at < 0) at = 0;
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k; lastWord = S[k][5]; lastSent = sent(k);
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + q.hole + '(　)' + q.post + ' → □ ㄺ □ ㄼ □ ㅀ □ ㅄ'; },
    printAnswer: function (q) { return q.pre + q.syl + q.post + ' (' + nameOf(q.cat) + ')'; },
    printHead: '( ) 안에 들어갈 겹받침을 골라 □에 ✓ 하고, 문장을 소리 내어 읽어 보세요.'
  };
}));
