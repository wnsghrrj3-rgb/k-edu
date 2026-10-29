/* gens/korean/part_sort.js — 문제 상황일까, 의견일까, 이유일까? (3학년 2학기 국어 6단원 「감상과 표현의 즐거움」 l07 · l09 · l10 · l12 · l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l07 s06 · s17 셋: 🔍 문제 상황 · 💭 내 의견 · 🧱 이유.
 *   의견을 제시하는 글의 세 부분은 l07(7·8차시)에서 처음 나온다 → 이 활동은 l07 부터.
 * 문항 꼴 = 정본 l07 s05 · l09 s05 · l10 s07 글의 한 줄 — 위에 작은 글 이름(어떤 글의 줄인지) · 아래에 그 줄 한 문장.
 *   칸은 그 줄이 글에서 하는 일이 정한다: 무엇이 불편한지(문제 상황) · 어떻게 하자는지(의견) · 왜 그런지(이유).
 *   맺음(l10 s06 「다 같이 해 보자」)·받쳐 주지 못하는 이유(l09 s05 4번 줄 · l10 s11) 0 — 칸이 둘로 읽힐 줄은 싣지 않는다.
 * 진단 축(정본):
 *   ① l07 s04 hint 「좋겠다 · 하자 · 해야 한다」가 붙으면 생각 → 의견 말끝 셋 다 · 건의함(l07 s14)·팻말(l12 s17)의 「주세요 · 해요」도 의견
 *   ② l10 s10 「「왜냐하면」이 붙은 줄과 「하자」로 끝나는 줄을 먼저 갈라」 → 이유는 왜냐하면·첫째·둘째·또 + 「때문이다」
 *   덫 ㉠ 문제 상황에 「때문에」(정본 l07 s06 「자리 때문에 불편한 일이 자주 생긴다」) — 「때문」이 있다고 이유가 아님
 *   덫 ㉡ 의견에 「그래서」(정본 l07 s05 · l09 s05) — 이어 주는 말이 앞에 와도 어떻게 하자는 줄
 *   덫 ㉢ l10 부터 「때문」 없는 이유 — 정본 l10 s05 「좋아질 일이 곧 이유」 · s09 「무엇이 좋아지는지를 적은 것만 이유」
 * params: { upto: 'l07'|'l09'|'l10'|'all' }  l07 = 8차시까지 · l09 = 9차시까지 · l10 = 11차시까지 · all = 단원 전체(l12 팻말 · l14 마무리)
 * next() → { item, tag, w, cat, type, trap, explain, l, obj }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['part_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07', 'l09', 'l10', 'l12'];
  var CATS = [{ key: 'prob', label: '🔍 문제 상황' }, { key: 'op', label: '💭 내 의견' }, { key: 'rs', label: '🧱 이유' }];
  var NAME = { prob: '문제 상황', op: '내 의견', rs: '그렇게 생각한 이유' };
  var WHY = { prob: '무엇이 불편한지 적은 줄이에요.',
              op: '어떻게 하자는 줄이에요.',
              rs: '왜 그렇게 생각했는지 적은 줄이에요.' };
  var TRAP = { because: '「때문에」가 있어도 이유가 아니라 불편한 일을 적었어요.',
               so: '「그래서」로 시작해도 어떻게 하자는 말이에요.',
               polite: '「주세요 · 해요」도 어떻게 해 달라는 말이에요.',
               good: '그렇게 하면 좋아질 일이 곧 이유예요.' };

  /* [차시, 칸, 글 이름(작게), 줄, 덫(선택)] — 글 이름이 같은 줄은 연달아 나오지 않는다 */
  var S = [
    // l07 — 정본 s05 「자리를 함께 정하자」 · s09 · s04(화분과 사물함 문)
    ['l07', 'prob', '🪴 물건 자리', '우리 교실에도 물건이 놓인 자리 때문에 불편한 일이 자주 생긴다.', 'because'],
    ['l07', 'op', '🪴 물건 자리', '그래서 학기 초에 물건 자리를 다 함께 정하면 좋겠다.', 'so'],
    ['l07', 'rs', '🪴 물건 자리', '왜냐하면 한 사람이 정하면 그 사람 눈에만 편한 자리가 되기 때문이다.'],
    ['l07', 'rs', '🪴 물건 자리', '또 함께 정하면 불편한 곳을 미리 말할 수 있기 때문이다.'],
    ['l07', 'prob', '🪴 물건 자리', '화분 때문에 사물함 문이 반쯤만 열린다.', 'because'],
    ['l07', 'op', '🪴 물건 자리', '물건마다 자리를 정해야 한다.'],
    ['l07', 'op', '🪴 물건 자리', '학기 초에 물건 자리를 의논하자.'],
    // l07 — 정본 s12 글 ② 학급 문고 · 도전 「칸마다 이름표」
    ['l07', 'prob', '📚 학급 문고', '학급 문고의 책이 뒤섞여 찾는 데 오래 걸린다.'],
    ['l07', 'op', '📚 학급 문고', '요일을 나누어 모둠이 돌아가며 정리하자.'],
    ['l07', 'rs', '📚 학급 문고', '첫째, 한 사람이 다 맡으면 오래 걸리기 때문이다.'],
    ['l07', 'rs', '📚 학급 문고', '둘째, 정리한 칸은 잘 알게 되기 때문이다.'],
    ['l07', 'op', '📚 학급 문고', '학급 문고 칸마다 이름표를 붙이자.'],
    // l07 — 정본 s14 건의함 쪽지
    ['l07', 'prob', '📮 건의함 쪽지', '오후 수업 시간에 배가 고프다는 친구가 많다.'],
    ['l07', 'op', '📮 건의함 쪽지', '급식에 과일을 더 주세요.', 'polite'],
    ['l07', 'rs', '📮 건의함 쪽지', '왜냐하면 오후에 배가 고파 집중이 안 되기 때문이에요.'],
    // l07 — 정본 s12 심화 「지우개 가루가 쌓인다 · 하교 전에 각자 책상 밑을 치우자 · 내 자리는 내가 잘 알아서」
    ['l07', 'prob', '🧽 지우개 가루', '책상 밑에 지우개 가루가 쌓인다.'],
    ['l07', 'op', '🧽 지우개 가루', '하교 전에 각자 책상 밑을 치우자.'],
    ['l07', 'rs', '🧽 지우개 가루', '왜냐하면 자기 자리는 자기가 잘 알기 때문이다.'],
    // l09 — 정본 s05 「교실 창문을 자주 열자」 · s12 기본 「먼지가 밖으로 나가 재채기가 줄기 때문이다」
    ['l09', 'prob', '🪟 교실 창문', '교실 공기가 답답할 때가 많다.'],
    ['l09', 'op', '🪟 교실 창문', '그래서 쉬는 시간마다 창문을 열면 좋겠다.', 'so'],
    ['l09', 'rs', '🪟 교실 창문', '첫째, 공기가 바뀌면 머리가 맑아져 다음 시간에 집중하기 쉽기 때문이다.'],
    ['l09', 'rs', '🪟 교실 창문', '둘째, 먼지가 밖으로 나가 재채기가 줄기 때문이다.'],
    // l10 — 정본 s07 ㉮ 번호 칸 · ㉯ 이름표 · s09 이유 셋 · s03 「비 온 날 우산꽂이가 뒤엉켜서」
    ['l10', 'prob', '☂️ 우산꽂이', '비 온 날 우산꽂이가 뒤엉켜 내 우산을 찾기 어렵다.'],
    ['l10', 'op', '☂️ 우산꽂이', '우산꽂이에 반 번호 칸을 붙이자.'],
    ['l10', 'op', '☂️ 우산꽂이', '우산에 이름표를 달자.'],
    ['l10', 'rs', '☂️ 우산꽂이', '왜냐하면 제 우산을 바로 찾을 수 있기 때문이다.'],
    ['l10', 'rs', '☂️ 우산꽂이', '번호 칸이 있으면 남의 우산을 잘못 가져가는 일이 줄어든다.', 'good'],
    ['l10', 'rs', '☂️ 우산꽂이', '이름표가 있으면 잃어버려도 주인에게 돌아올 수 있다.', 'good'],
    ['l10', 'rs', '☂️ 우산꽂이', '번호 칸이 있으면 비 온 날 나가는 줄이 빨리 빠진다.', 'good'],
    ['l10', 'prob', '☂️ 우산꽂이', '우산꽂이 때문에 비 온 날마다 문 앞이 붐빈다.', 'because'],
    // l12 — 정본 s17 「조용히 이야기해요. 옆 모둠이 잘 들리지 않아요.」 · s12 기본 「복도에서는 걸어요. 모퉁이에서 부딪히면 다쳐요.」
    ['l12', 'op', '🪧 손 팻말', '조용히 이야기해요.', 'polite'],
    ['l12', 'op', '🪧 손 팻말', '복도에서는 걸어요.', 'polite'],
    ['l12', 'prob', '🪧 손 팻말', '쉬는 시간마다 복도에서 뛰다가 부딪히는 일이 생긴다.'],
    ['l12', 'rs', '🪧 손 팻말', '왜냐하면 모퉁이에서 부딪히면 다치기 때문이에요.'],
    ['l12', 'rs', '🪧 손 팻말', '왜냐하면 옆 모둠이 잘 들리지 않기 때문이에요.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], tag: s[2], w: s[3], item: s[3], obj: s[2], trap: s[4] || null,
             explain: WHY[s[1]] + (s[4] ? ' ' + TRAP[s[4]] : '') + ' → ' + NAME[s[1]] };
  }

  return {
    id: 'part_sort',
    title: '문제 상황일까, 의견일까, 이유일까?',
    categories: CATS,
    S: S,
    ORDER: ORDER,
    NAME: NAME,
    TRAP: TRAP,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var deck = shuffle(rng, idx);
      var last = null, lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (last && S[k][2] === last[2]) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        upto: upto,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0 · 같은 글 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = S[k];
          return build(S[k]);
        },
        check: function (pick, qq) { return pick === qq.cat; }
      };
    },
    printRender: function (qq) { return qq.tag + ' — <u>' + qq.w + '</u> → □ 문제 상황 □ 내 의견 □ 이유'; },
    printAnswer: function (qq) { return { prob: '문제 상황', op: '내 의견', rs: '이유' }[qq.cat]; },
    printHead: '의견을 제시하는 글의 어느 부분일까요? □에 ✓ 하세요.'
  };
}));
