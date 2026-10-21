/* gens/korean/word_rel.js — 두 낱말은 어떤 관계일까? (3학년 2학기 국어 4단원 「서로 존중하며 대화해요」 l05 · l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l05 s06 셋: 🫙 한 낱말이 다른 낱말의 뜻을 포함 · ↔️ 서로 뜻이 반대 · 🟰 서로 뜻이 비슷.
 *   낱말 사이의 관계는 l05(5·6차시)에서 처음 나온다 → 이 활동은 l05 부터 · 범위 하나(upto 칩 0) · l14 = 단원 마무리.
 * 문항 꼴 = 정본 l05 s11 「운동화 — 신발」 — 낱말 짝 하나. 칸은 두 낱말의 뜻 사이가 정한다.
 * 진단 축(정본 l05 s06 watch 「포함하는 관계와 비슷한 관계를 헷갈리는 경우」):
 *   이름 낱말끼리의 짝이 포함 칸과 비슷 칸에 고루 — 「○○는 △△이다」(정본 s12 도전)가 서면 포함, 서로 바꾸어 써도 뜻이 같으면 비슷.
 *   비슷 칸 풀이는 늘 「한 가지가 아니라」로 포함과 가른다 · 포함 칸 풀이는 늘 「○○는 △△의 한 가지」(정본 s11 note).
 *   반대 칸에는 정본 「묻다 — 대답하다」 꼴(둘 다 말하는 일이라 비슷으로 읽기 쉬운 짝)을 함께.
 * 높임의 뜻이 있는 낱말 짝(진지·말씀·연세·편찮·뵙·여쭈 …)은 이 판 자리 아님(l03·l12 · hon_hunt) — 0.
 * params: {} (범위 하나)
 * next() → { item, a, b, cat, type, explain, l, obj }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['word_rel'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l05'];
  var CATS = [{ key: 'inc', label: '🫙 뜻을 포함' }, { key: 'opp', label: '↔️ 뜻이 반대' }, { key: 'sim', label: '🟰 뜻이 비슷' }];
  var NAME = { inc: '한 낱말이 다른 낱말의 뜻을 포함하는 관계', opp: '서로 뜻이 반대인 관계', sim: '서로 뜻이 비슷한 관계' };
  var DASH = ' — ';

  /* [차시, 칸, 앞 낱말, 뒤 낱말, (포함 칸만) 큰 낱말] — 정본 s11 짝 셋·s12 과일 둘이 그대로 */
  var S = [
    // 🫙 포함 — 정본 s06 ask 「신발과 운동화」 · s11 「운동화 — 신발」 · s12 도전 「과일」 → 사과·포도
    ['l05', 'inc', '운동화', '신발', '신발'],
    ['l05', 'inc', '과일', '사과', '과일'],
    ['l05', 'inc', '포도', '과일', '과일'],
    ['l05', 'inc', '동물', '토끼', '동물'],
    ['l05', 'inc', '장미', '꽃', '꽃'],
    ['l05', 'inc', '채소', '당근', '채소'],
    ['l05', 'inc', '피아노', '악기', '악기'],
    ['l05', 'inc', '곤충', '나비', '곤충'],
    ['l05', 'inc', '자전거', '탈것', '탈것'],
    // ↔️ 반대 — 정본 s11 「묻다 — 대답하다」 · 「서툰 인사」의 빠르게·천천히 걸음
    ['l05', 'opp', '묻다', '대답하다'],
    ['l05', 'opp', '주다', '받다'],
    ['l05', 'opp', '빠르다', '느리다'],
    ['l05', 'opp', '크다', '작다'],
    ['l05', 'opp', '길다', '짧다'],
    ['l05', 'opp', '열다', '닫다'],
    ['l05', 'opp', '웃다', '울다'],
    ['l05', 'opp', '뜨겁다', '차갑다'],
    ['l05', 'opp', '이기다', '지다'],
    // 🟰 비슷 — 정본 s11·s16 「돕다 — 거들다」 · 이름 낱말 짝 넷(포함과 헷갈리는 축)
    ['l05', 'sim', '돕다', '거들다'],
    ['l05', 'sim', '아이', '어린이'],
    ['l05', 'sim', '친구', '동무'],
    ['l05', 'sim', '걱정', '근심'],
    ['l05', 'sim', '가게', '상점'],
    ['l05', 'sim', '예쁘다', '아름답다'],
    ['l05', 'sim', '기쁘다', '즐겁다'],
    ['l05', 'sim', '빨리', '얼른'],
    ['l05', 'sim', '잡다', '쥐다']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function q(w) { return '「' + w + '」'; }
  function bat(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c % 28 > 0; }   // 받침 있음
  function why(s) {
    if (s[1] === 'inc') { var big = s[4], small = s[2] === big ? s[3] : s[2];
      return q(small) + (bat(small) ? '은' : '는') + ' ' + q(big) + '의 한 가지예요. ' + q(big) + (bat(big) ? '이' : '가') + ' ' + q(small) + '의 뜻을 포함해요.'; }
    var head = q(s[2]) + (bat(s[2]) ? '과' : '와') + ' ' + q(s[3]) + (bat(s[3]) ? '은' : '는');
    if (s[1] === 'opp') return head + ' 서로 뜻이 반대예요.';
    return head + ' 바꾸어 써도 뜻이 비슷해요. 하나가 다른 하나의 한 가지가 아니에요.';
  }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], a: s[2], b: s[3], item: s[2] + DASH + s[3], obj: s[2] + '|' + s[3],
             explain: why(s) + ' → ' + NAME[s[1]] };
  }

  return {
    id: 'word_rel',
    title: '두 낱말은 어떤 관계일까?',
    categories: CATS,
    S: S,
    ORDER: ORDER,
    NAME: NAME,
    DASH: DASH,
    create: function (params, rng) {
      var idx = S.map(function (s, k) { return k; });
      var deck = shuffle(rng, idx);
      var last = null, lastCat = '', run = 0;
      function share(k) { if (!last) return false; var s = S[k]; return s[2] === last[2] || s[2] === last[3] || s[3] === last[2] || s[3] === last[3]; }
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (S[k] === last || share(k)) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0 · 같은 낱말 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = S[k];
          return build(S[k]);
        },
        check: function (pick, qq) { return pick === qq.cat; }
      };
    },
    printRender: function (qq) { return '<u>' + qq.a + '</u>' + DASH + '<u>' + qq.b + '</u> → □ 포함 □ 반대 □ 비슷'; },
    printAnswer: function (qq) { return { inc: '포함', opp: '반대', sim: '비슷' }[qq.cat]; },
    printHead: '두 낱말은 어떤 관계일까요? □에 ✓ 하세요.'
  };
}));
