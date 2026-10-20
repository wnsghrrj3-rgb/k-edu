/* gens/korean/conn_sort.js — 그리고일까, 그러나일까, 그래서일까? (3학년 2학기 국어 3단원 「정확하게 글을 써요」 l07 · l10 · l12 · l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l07 s05 셋: ➕ 그리고 — 앞과 비슷한 내용 · 🔄 그러나 — 앞과 반대되는 내용 · 🎯 그래서 — 앞이 뒤의 까닭.
 *   이어 주는 말은 l07 에서 처음 나온다 → 이 활동은 l07 부터.
 * 문항 꼴 = 정본 l07 s10 「앞 문장. (　　　) 뒤 문장.」 — 빈칸이 밑줄 자리. 칸은 앞뒤 뜻의 관계가 정한다(정본 s05 note).
 * 진단 축(정본 l07 s08 오개념 「그래서 자리에 그러나를 넣어도 뜻은 같다」):
 *   같은 앞 문장, 뒤 문장만 달라 칸이 갈리는 짝 — 정본 s12 도전 「어제 늦게 잤습니다」 · s15 「배가 고팠습니다」 꼴.
 *   「그리고」 = 비슷한 내용을 나란히 놓을 때만 — 까닭·차례가 섞여 두 칸으로 읽히는 판 0.
 * params: { upto: 'l07'|'l10'|'l12'|'all' }  l07 = 8차시까지 · l10 = 11차시까지 · l12 = 13차시까지 · all = 14차시(단원 전체)
 * next() → { item, pre, w, post, cat, type, explain, l, obj }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['conn_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07', 'l10', 'l12', 'l14'];
  var CATS = [{ key: 'and', label: '➕ 그리고' }, { key: 'but', label: '🔄 그러나' }, { key: 'so', label: '🎯 그래서' }];
  var NAME = { and: '그리고', but: '그러나', so: '그래서' };
  var BLANK = '(　　　)';

  /* [차시, 칸, 앞 문장, 뒤 문장] — 앞 문장이 같은 줄끼리는 짝(연달아 0) */
  var S = [
    // l07 — 정본 l07 s04 「비 오는 날 체육 시간」 · s08 · s10 · s12 · s14 날씨 예보 · s15
    ['l07', 'so',  '아침부터 비가 내렸습니다.', '체육관에서 수업을 했습니다.'],
    ['l07', 'and', '아침부터 비가 내렸습니다.', '바람도 세게 불었습니다.'],
    ['l07', 'but', '채호는 이어달리기를 기다렸습니다.', '아침부터 비가 내렸습니다.'],
    ['l07', 'so',  '운동장에 물웅덩이가 생겼습니다.', '이어달리기를 할 수 없었습니다.'],
    ['l07', 'so',  '어제 늦게 잤습니다.', '오늘 아침에 늦잠을 잤습니다.'],
    ['l07', 'but', '어제 늦게 잤습니다.', '오늘 아침에는 일찍 일어났습니다.'],
    ['l07', 'so',  '나는 배가 고팠습니다.', '밥을 많이 먹었습니다.'],
    ['l07', 'but', '나는 배가 고팠습니다.', '밥을 먹지 않았습니다.'],
    ['l07', 'but', '윤하는 그림을 그리려고 했습니다.', '도화지가 없었습니다.'],
    ['l07', 'and', '선생님께서 놀이를 알려 주셨습니다.', '차례를 정하는 방법도 알려 주셨습니다.'],
    ['l07', 'so',  '오후부터 비가 오겠습니다.', '우산을 챙기는 것이 좋겠습니다.'],
    ['l07', 'but', '오전에는 맑겠습니다.', '오후부터 비가 오겠습니다.'],
    ['l07', 'and', '채호는 놀이를 하며 크게 웃었습니다.', '친구들도 함께 웃었습니다.'],
    ['l07', 'and', '다안이는 우산을 챙겼습니다.', '장화도 신었습니다.'],
    ['l07', 'and', '곰이는 일기를 썼습니다.', '펭이도 일기를 썼습니다.'],
    // l10 — 정본 l10 s03 곰이의 뒤죽박죽 사물함 · s07 세연이 글 · s10
    ['l10', 'and', '교과서와 공책은 세워서 꽂습니다.', '작은 물건은 바구니에 모아 담습니다.'],
    ['l10', 'so',  '안쪽에 두면 꺼내기 어렵습니다.', '자주 쓰는 것은 앞쪽에 둡니다.'],
    ['l10', 'but', '곰이는 공책을 사물함에 넣었습니다.', '공책을 찾을 수 없었습니다.'],
    ['l10', 'so',  '곰이는 사물함 칸을 나누었습니다.', '공책을 금방 찾았습니다.'],
    ['l10', 'but', '곰이는 사물함 칸을 나누었습니다.', '며칠 만에 다시 뒤죽박죽이 되었습니다.'],
    ['l10', 'and', '연필은 필통에 넣습니다.', '지우개도 필통에 넣습니다.'],
    // l12 — 정본 l12 s09 · s10 · s12 이어 주는 말 놀이 · s13·s17 이용 설명서
    ['l12', 'but', '학교 도서관에 새 책이 들어왔습니다.', '아직 빌릴 수 없었습니다.'],
    ['l12', 'and', '학교 도서관에 새 책이 들어왔습니다.', '새 의자도 들어왔습니다.'],
    ['l12', 'so',  '아침에 늦게 일어났습니다.', '서둘러 학교에 갔습니다.'],
    ['l12', 'but', '아침에 늦게 일어났습니다.', '학교에는 늦지 않았습니다.'],
    ['l12', 'so',  '운동장에 비가 그쳤습니다.', '우리는 운동장에서 공놀이를 했습니다.'],
    ['l12', 'and', '도서관에서는 작은 목소리로 말합니다.', '읽은 책은 제자리에 꽂습니다.'],
    ['l12', 'so',  '설명서에 차례를 자세히 적었습니다.', '동생이 혼자 책을 빌렸습니다.'],
    // l14 — 정본 l14 s10 텃밭 · s12 심화 쪽지
    ['l14', 'but', '텃밭에 씨를 뿌렸습니다.', '며칠 동안 싹이 나지 않았습니다.'],
    ['l14', 'and', '텃밭에 씨를 뿌렸습니다.', '옆 칸에는 상추를 심었습니다.'],
    ['l14', 'so',  '텃밭에 날마다 물을 주었습니다.', '싹이 쑥쑥 자랐습니다.'],
    ['l14', 'so',  '이번 주는 도서관이 금요일에 문을 닫습니다.', '책은 목요일까지 돌려줘야 합니다.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function bare(t) { return t.replace(/\.$/, ''); }
  function paired(s) { return S.some(function (o) { return o !== s && o[2] === s[2] && o[1] !== s[1]; }); }
  function why(s) {
    var a = '「' + bare(s[2]) + '」', b = '「' + bare(s[3]) + '」';
    if (s[1] === 'so') return a + '가 ' + b + '의 까닭이에요.';
    if (s[1] === 'but') return b + '는 ' + a + '와 반대되는 내용이에요.';
    return b + '는 ' + a + '와 비슷한 내용을 나란히 놓았어요.';
  }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], pre: s[2] + ' ', w: BLANK, post: ' ' + s[3], item: s[2] + ' ' + BLANK + ' ' + s[3], obj: s[2],
             explain: why(s) + ' → 「' + NAME[s[1]] + '」' + (paired(s) ? ' · 앞 문장이 같아도 뒤 문장에 따라 이어 주는 말이 달라져요.' : '') };
  }

  return {
    id: 'conn_sort',
    title: '그리고일까, 그러나일까, 그래서일까?',
    categories: CATS,
    S: S,
    ORDER: ORDER,
    NAME: NAME,
    BLANK: BLANK,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var deck = shuffle(rng, idx);
      var last = -1, lastObj = '', lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (k === last || S[k][2] === lastObj) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0 · 같은 앞 문장 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k; lastObj = S[k][2];
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.pre + '<u>' + BLANK + '</u>' + q.post + ' → □ 그리고 □ 그러나 □ 그래서'; },
    printAnswer: function (q) { return NAME[q.cat]; },
    printHead: '빈칸에 알맞은 이어 주는 말은 무엇일까요? □에 ✓ 하세요.'
  };
}));
