/* gens/korean/g1_2_letter_swap.js — 한 자리만 바꾼 낱말 찾기 (1학년 2학기 국어 5단원 「생각을 키워요」 l04 · l12 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 낱말 토큰)가 쓴다.
 * 근거 = 지도서(국어 1-2 ㉯ 5단원) 216~218쪽: 『국어』 152쪽 1번 「달」의 첫 자음자 → 모음자 → 받침을 차례로 열기(달 → 발 → 별 → 벽) ·
 *   153쪽 2번 표 「첫 자음자만 바꾸기 · 모음자만 바꾸기 · 받침만 바꾸기」(볼 → 돌·솔 / 발·벌·별 / 복·봄·봉 · 감 → 담·밤·잠 / 검·곰·금 / 각·갓·강) ·
 *   지도서 211쪽 평가 「주어진 글자의 첫 자음자, 모음자, 받침을 각각 바꾸어 의미가 다른 글자를 만들어 보는 활동」 ·
 *   지도서 216쪽 유의점 「무의미한 글자(닥·뎔)가 구성되지 않도록 · 뜻이 있는 글자를 만들어 보도록」.
 *   케이티처 2세대 정본 data/g1s2_korean_u5.js l04(솔 → 볼·실·손 · 「한꺼번에 두 자리를 바꾸는 경우」 watch · 달을 한 번에 벽으로 = 세 자리) ·
 *   l12(「손」에서 하나만 바꾸어 만든 낱말 — 산·솔·솜·돈 · 밤 ↔ 람).
 * 판 = 바탕 글자 하나 + 낱말 여섯(찾을 것 2~3). 낱말은 모두 뜻이 있는 한 글자 낱말 WORDS 에서만 — 뜻 없는 글자 0(지도서 유의점).
 *   어느 자리가 바뀌었는지는 생성기가 첫 자음자·모음자·받침으로 나누어 직접 잰다(손으로 적지 않는다).
 * type(문항 단위 · 진단 축 — 어느 자리를 보는가):
 *   first  첫 자음자만 바꾸기 — 덫 = 모음자·받침만 바뀐 낱말, 두 자리 바뀐 낱말
 *   vowel  모음자만 바꾸기 — 덫 = 첫 자음자·받침만 바뀐 낱말, 두 자리 바뀐 낱말
 *   final  받침만 바꾸기 — 덫 = 첫 자음자·모음자만 바뀐 낱말, 두 자리 바뀐 낱말
 *   one    한 자리만 바꾸기(어느 자리든) — 덫 = 두 자리 넘게 바뀐 낱말(정본 l04 「달 → 벽」 축)
 * params: {}  범위 하나(l04 · l12 마무리도 같음) — 범위 칩 없음
 * next() → { prompt, icon, base, tokens:[{t, fixed} | {t:' ', sep} | {t, hit}], answer:[찾을 낱말…], type, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g1_2_letter_swap'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
  var JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
  var JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  /* 뜻이 있는 한 글자 낱말 — 교과서 152~153쪽 표의 낱말 전부 + 1학년이 아는 이름 낱말 (받침 없는 글자·겹받침 글자 0: 받침 자리가 늘 있게) */
  var WORDS = ['달', '발', '말', '살', '알', '날', '칼', '돌', '둘', '들', '담', '답', '볼', '솔', '벌', '별', '불', '복', '봄', '봉',
    '감', '밤', '잠', '삼', '땀', '검', '곰', '금', '김', '각', '갓', '강', '손', '돈', '산', '선', '솜', '속', '솥', '공', '종', '콩',
    '통', '동', '몸', '곳', '물', '굴', '줄', '풀', '꿀', '밀', '문', '범', '반', '밥', '방', '밭', '상', '박', '맛', '짐', '집', '책',
    '총', '눈', '빵', '쌀', '귤', '꽃', '옷', '잎', '입', '길', '꿈', '떡', '뿔', '실', '낮', '빛', '빗', '벽', '숲', '국', '죽', '북', '붓', '못'];
  /* 바탕 글자 — 교과서·정본에 나온 것만(달 · 볼 · 감 · 솔 · 손 · 공 · 곰 · 물 · 밤 · 발 · 산) */
  var BASES = ['달', '볼', '감', '솔', '손', '공', '곰', '물', '밤', '발', '산'];
  var TYPES = ['first', 'vowel', 'final', 'one'];
  var SLOT = { first: 0, vowel: 1, final: 2 };
  var SLOT_KO = ['첫 자음자', '모음자', '받침'];
  var PROMPT = {
    first: '첫 자음자만 바꾼 낱말을 모두 찾아요',
    vowel: '모음자만 바꾼 낱말을 모두 찾아요',
    final: '받침만 바꾼 낱말을 모두 찾아요',
    one: '한 자리만 바꾼 낱말을 모두 찾아요'
  };

  function parts(w) { var c = w.charCodeAt(0) - 0xAC00; return [Math.floor(c / 588), Math.floor((c % 588) / 28), c % 28]; }
  function jamo(w) { var p = parts(w); return [CHO[p[0]], JUNG[p[1]], JONG[p[2]]]; }
  function diff(a, b) { var x = parts(a), y = parts(b), d = []; for (var i = 0; i < 3; i++) if (x[i] !== y[i]) d.push(i); return d; }   // 바뀐 자리 번호들
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function isHit(type, d) { return type === 'one' ? d.length === 1 : (d.length === 1 && d[0] === SLOT[type]); }

  /* 바탕·유형마다 찾을 것과 덫 */
  function pools(base, type) {
    var hit = [], near = [], far = [];
    WORDS.forEach(function (w) {
      if (w === base) return;
      var d = diff(base, w);
      if (isHit(type, d)) hit.push(w);
      else if (d.length === 1) near.push(w);              // 다른 자리 하나만 바뀐 낱말 — 자리 덫
      else if (d.length === 2) far.push(w);               // 두 자리 바뀐 낱말 — 「한꺼번에 두 자리」 덫
    });
    return { hit: hit, near: near, far: far };
  }

  // 판이 서는 (바탕, 유형) 짝 — 찾을 것 2 이상 · 덫 3 이상(한 자리 유형은 자리 덫 1 이상)
  var COMBOS = [];
  BASES.forEach(function (b) {
    TYPES.forEach(function (ty) {
      var P = pools(b, ty);
      if (P.hit.length < 2) return;
      if (ty !== 'one' && !P.near.length) return;
      if (P.near.length + P.far.length < 3) return;
      COMBOS.push([b, ty]);
    });
  });

  function build(base, type, rng, id) {
    var P = pools(base, type);
    var nHit = Math.min(P.hit.length, rng() < 0.5 ? 2 : 3);
    var hits = shuffle(rng, P.hit).slice(0, nHit);
    var nDis = 6 - nHit, dis = [];
    if (type !== 'one') dis = dis.concat(shuffle(rng, P.near).slice(0, Math.min(P.near.length, rng() < 0.5 ? 1 : 2)));
    var rest = shuffle(rng, P.far.concat(type === 'one' ? [] : P.near.filter(function (w) { return dis.indexOf(w) < 0; })));
    dis = dis.concat(rest.slice(0, nDis - dis.length));
    var words = shuffle(rng, hits.concat(dis));
    var j = jamo(base);
    var tokens = [{ t: base, fixed: true }, { t: ' ', sep: true }].concat(words.map(function (w) { return { t: w, hit: hits.indexOf(w) >= 0 }; }));
    var hitSorted = words.filter(function (w) { return hits.indexOf(w) >= 0; });
    var trap = dis.filter(function (w) { return diff(base, w).length === 1; })[0] || dis[0];
    var td = diff(base, trap);
    // 낱말은 모두 받침이 있다 → 「은」 · 자리 이름 뒤 조사: 첫 자음자를 · 모음자를 · 받침을 / 첫 자음자와 · 모음자와 · 받침과
    var OBJ = ['첫 자음자를', '모음자를', '받침을'], AND = ['첫 자음자와', '모음자와', '받침과'];
    var trapLine = td.length === 1 ? '「' + trap + '」은 ' + OBJ[td[0]] + ' 바꾼 낱말이에요.'
                                   : '「' + trap + '」은 ' + AND[td[0]] + ' ' + OBJ[td[1]] + ' 한꺼번에 바꾼 낱말이에요.';
    var head = type === 'one'
      ? '「' + base + '」(' + j.join('·') + ')에서 한 자리만 바꾸면 ' + hitSorted.join('·') + '.'
      : '「' + base + '」(' + j.join('·') + ')의 ' + SLOT_KO[SLOT[type]] + '만 바꾸면 ' + hitSorted.join('·') + ' — 나머지 두 자리는 그대로예요.';
    return { id: id, l: 'l04', type: type, icon: '🔤', base: base, prompt: '「' + base + '」에서 ' + PROMPT[type],
             tokens: tokens, answer: hitSorted, explain: head + ' ' + trapLine };
  }

  return {
    id: 'g1_2_letter_swap',
    title: '한 자리만 바꾼 낱말 찾기',
    WORDS: WORDS,
    BASES: BASES,
    TYPES: TYPES,
    COMBOS: COMBOS,
    parts: parts,
    jamo: jamo,
    diff: diff,
    pools: pools,
    create: function (params, rng) {
      var deck = [], last = '', n = 0;
      function refill() {
        // 유형마다 고르게 — 유형을 먼저 돌리고, 그 유형이 서는 바탕을 고른다
        var byType = {};
        COMBOS.forEach(function (c) { (byType[c[1]] = byType[c[1]] || []).push(c); });
        var ts = shuffle(rng, TYPES.filter(function (t) { return byType[t]; }));
        var prev = deck.length ? deck[deck.length - 1][0] : last;
        ts.forEach(function (t) {
          var c = shuffle(rng, byType[t]), pickC = c.filter(function (x) { return x[0] !== prev; })[0] || c[0];   // 같은 바탕 연달아 0
          deck.push(pickC); prev = pickC[0];
        });
      }
      return {
        size: COMBOS.length,
        next: function () {
          if (!deck.length) refill();
          if (deck.length > 1 && deck[0][0] === last) deck.push(deck.shift());   // 같은 바탕 연달아 0
          var c = deck.shift(); last = c[0];
          return build(c[0], c[1], rng, 'ls' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(pick) >= 0; }
      };
    },
    printRender: function (q) {
      return q.prompt + '<br>' + q.tokens.filter(function (t) { return !t.fixed && !t.sep; }).map(function (t) { return '□ ' + t.t; }).join(' &nbsp; ');
    },
    printAnswer: function (q) { return q.answer.join(', '); },
    printHead: '바탕 글자에서 말한 자리만 바꾼 낱말을 모두 찾아 □에 ✓ 하세요.'
  };
}));
