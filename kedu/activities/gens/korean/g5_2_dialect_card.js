/* gens/korean/g5_2_dialect_card.js — 표준어 알아맞히기 (5학년 2학기 국어 3단원 「표준어와 방언을 알아봐요」 · 교과서판 2학기)
 * 순수 함수·DOM 무관 (§9-3). 장르 duel_quiz(stream)가 쓴다 — 방언 카드 한 장 + 보기 셋(표준어) 가운데 하나.
 * 놀이 = 『국어』 117쪽 4번 「표준어 알아맞히기 놀이」(붙임 13 방언 카드) — 한 사람이 방언 카드를 보여 주면 다른 사람은
 *   카드에 쓰인 방언과 뜻이 같은 표준어를 말한다 · 「잘 알아맞히지 못할 때에는 표준어의 첫 글자나 초성으로 도움을 줘도 좋아요」(→ hint).
 * params: { upto: 'l02'|'l04'|'l06'|'all', hint: 0|1 }  hint 1 = 카드에 표준어 초성(예 ㄱㅇ)을 함께 보인다
 * next() → { prompt, word, region, cho, answer, options:[셋 · 섞임], kind, type, explain, src, l }
 *
 * 근거(지도서 국어 5-2 3단원 — 쪽 = 지도서 인쇄 쪽 / 『국어』 쪽):
 *  l02 160~165쪽(『국어』 112~117쪽) — 112쪽 만화 옥시기(옥수수)·마숩제(맛있지) · 113쪽 「안동 고구마」(박승우) 국시(국수)·할매
 *        · 114쪽 「표준어와 방언」 까구리·깨고락지·먹장구·깨고리 = 개구리 · 162쪽 방언 다섯 고개 1(짐끼·지·짐치 = 김치)·2(겡이·고냉이·궤이 = 고양이)
 *        · 116~117쪽 깨깟허다(깨끗하다) · 할망(할머니) · 낭구(나무) · 짐치(김치) · 부추 = 분추·정구지·소풀·세우리 · 가새기(가위)
 *  l04 166~167쪽(『국어』 118~119쪽) 「할머니 댁에서 보낸 추석」 — 대간하다(힘들다) · 가생이(가장자리)
 *  l06 172~173쪽(『국어』 127쪽) 참고 자료 「주요 지역별 방언의 특징 및 사례」 — 감재(감자) · 단디(단단히) · 억수로(매우) · 싸게싸게(빨리빨리)
 *        · 무사(왜) · 하영(많이)
 *  all 180~181쪽(『국어』 135쪽) 「멋져 부러, 세발자전거!」 보기 — 자장구(자전거) · 바쿠(바퀴)
 * type = 표준어 갈래 다섯(판 단서 = 카드 뜻의 갈래) — food 음식 · animal 동물 · person 사람 · thing 물건과 자리 · talk 어떠한지·얼마나
 * 보기 = 답 + 같은 갈래 표준어를 먼저(음식끼리·동물끼리 — 짐작으로 고르지 않게), 모자라면 다른 갈래에서.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_dialect_card'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PROMPT = '방언 카드에 쓰인 말과 뜻이 같은 표준어는 무엇일까요?';
  var ORDER = ['l02', 'l04', 'l06', 'l08'];
  var KIND_NAME = { food: '음식 이름', animal: '동물 이름', person: '사람을 부르는 말', thing: '물건과 자리 이름', talk: '어떠한지·얼마나를 나타내는 말' };

  /* [차시, 갈래, 방언, 지역, 표준어, 근거 쪽] */
  var T = [
    ['l02', 'food', '옥시기', '강원 지역', '옥수수', '『국어』 112'],
    ['l02', 'talk', '마숩제', '강원 지역', '맛있지', '『국어』 112'],
    ['l02', 'food', '국시', '경상 지역', '국수', '『국어』 113'],
    ['l02', 'person', '할매', '경상 지역', '할머니', '『국어』 113'],
    ['l02', 'animal', '까구리', '여러 지역', '개구리', '『국어』 114'],
    ['l02', 'animal', '깨고락지', '여러 지역', '개구리', '『국어』 114'],
    ['l02', 'animal', '먹장구', '여러 지역', '개구리', '『국어』 114'],
    ['l02', 'food', '짐끼', '제주 지역', '김치', '지도서 162'],
    ['l02', 'food', '짐치', '강원 지역', '김치', '지도서 162 · 『국어』 116'],
    ['l02', 'animal', '겡이', '경상 지역', '고양이', '지도서 162'],
    ['l02', 'animal', '고냉이', '강원 지역', '고양이', '지도서 162'],
    ['l02', 'animal', '궤이', '경기 지역', '고양이', '지도서 162'],
    ['l02', 'talk', '깨깟허다', '전라 지역', '깨끗하다', '『국어』 116'],
    ['l02', 'person', '할망', '제주 지역', '할머니', '『국어』 116'],
    ['l02', 'thing', '낭구', '강원 지역', '나무', '『국어』 116'],
    ['l02', 'food', '정구지', '경상 지역', '부추', '『국어』 117'],
    ['l02', 'food', '분추', '강원 지역', '부추', '『국어』 117'],
    ['l02', 'food', '소풀', '전라 지역', '부추', '『국어』 117'],
    ['l02', 'food', '세우리', '제주 지역', '부추', '『국어』 117'],
    ['l02', 'thing', '가새기', '경상 지역', '가위', '『국어』 117'],
    ['l04', 'talk', '대간하다', '충청 지역', '힘들다', '『국어』 118 · 지도서 167'],
    ['l04', 'thing', '가생이', '충청 지역', '가장자리', '『국어』 119 · 지도서 167'],
    ['l06', 'food', '감재', '강원 지역', '감자', '『국어』 127 참고 자료'],
    ['l06', 'talk', '단디', '경상 지역', '단단히', '『국어』 127 참고 자료'],
    ['l06', 'talk', '억수로', '경상 지역', '매우', '『국어』 127 참고 자료'],
    ['l06', 'talk', '싸게싸게', '전라 지역', '빨리빨리', '『국어』 127 참고 자료'],
    ['l06', 'talk', '무사', '제주 지역', '왜', '『국어』 127 참고 자료'],
    ['l06', 'talk', '하영', '제주 지역', '많이', '『국어』 127 참고 자료'],
    ['l08', 'thing', '자장구', '전라 지역', '자전거', '『국어』 135'],
    ['l08', 'thing', '바쿠', '전라 지역', '바퀴', '『국어』 135']
  ];
  var KINDS = ['food', 'animal', 'person', 'thing', 'talk'];
  var CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function cho(w) { return w.split('').map(function (ch) { var c = ch.charCodeAt(0) - 0xAC00; return c >= 0 && c < 11172 ? CHO[Math.floor(c / 588)] : ch; }).join(''); }
  /* 받침 있으면 「은」 · 없으면 「는」 */
  function bat(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c < 11172 && c % 28 > 0; }
  function eun(w) { return bat(w) ? '은' : '는'; }
  function yeyo(w) { return bat(w) ? '이에요' : '예요'; }
  function ira(w) { return bat(w) ? '이라고' : '라고'; }
  function lim(upto) { var i = ORDER.indexOf(upto); return upto === 'all' || i < 0 ? ORDER.length - 1 : i; }
  function norm(upto) { return ORDER.indexOf(upto) >= 0 && upto !== 'l08' ? upto : 'all'; }
  function explainOf(row) {
    var same = T.filter(function (t) { return t[4] === row[4] && t[2] !== row[2]; }).map(function (t) { return t[2]; });
    return '「' + row[2] + '」' + eun(row[2]) + ' ' + row[3] + '에서 쓰는 방언으로, 표준어로는 「' + row[4] + '」' + yeyo(row[4]) + '.' +
      (same.length ? ' 「' + row[4] + '」' + eun(row[4]) + ' 「' + same.slice(0, 3).join('」, 「') + '」' + ira(same.slice(0, 3)[Math.min(same.length, 3) - 1]) + '도 해요.' : '') +
      ' 방언은 고쳐야 할 말이 아니라 그 지역의 삶이 담긴 말이에요.';
  }
  function optionsOf(row, rng, pool) {
    var mine = shuffle(rng, uniq(pool.filter(function (t) { return t[1] === row[1] && t[4] !== row[4]; }).map(function (t) { return t[4]; })));
    var rest = shuffle(rng, uniq(pool.filter(function (t) { return t[1] !== row[1] && t[4] !== row[4]; }).map(function (t) { return t[4]; })));
    return shuffle(rng, [row[4]].concat(mine.concat(rest).slice(0, 2)));
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  return {
    id: 'g5_2_dialect_card',
    title: '표준어 알아맞히기',
    T: T, ORDER: ORDER, KINDS: KINDS, KIND_NAME: KIND_NAME, PROMPT: PROMPT,
    cho: cho, eun: eun, yeyo: yeyo, ira: ira, explainOf: explainOf,
    create: function (params, rng) {
      params = params || {};
      var upto = norm(params.upto), L = lim(upto);
      var idx = []; T.forEach(function (t, k) { if (ORDER.indexOf(t[0]) <= L) idx.push(k); });
      var pool = T;                                                  // 보기는 단원 표준어 전체에서(앞 차시 카드라도 보기 이름은 쉬운 말)
      var deck = shuffle(rng, idx), last = -1, lastStd = '', n = 0;
      function find() { for (var t = 0; t < deck.length; t++) { if (T[deck[t]][4] !== lastStd && deck[t] !== last) return t; } return -1; }
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());
          }
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 표준어 카드 연달아 0
          if (at < 0) at = 0;
          var k = deck.splice(at, 1)[0], row = T[k]; last = k; lastStd = row[4];
          var opts = optionsOf(row, rng, pool);
          return { id: 'dc' + k + '_' + (n++), l: row[0], kind: row[1], type: row[1], word: row[2], region: row[3], answer: row[4], cho: cho(row[4]),
                   options: opts, src: row[5], hint: +params.hint === 1,
                   prompt: PROMPT + ' — 방언 카드: 「' + row[2] + '」(' + row[3] + ') / 보기: ' + opts.join(' · '),
                   explain: explainOf(row) };
        },
        check: function (pick, q) { return String(pick) === q.answer; }
      };
    },
    printRender: function (q) { return '방언 카드: 「' + q.word + '」 — ' + q.region + '<br>보기: ' + q.options.join(' · '); },
    printAnswer: function (q) { return q.word + ' → ' + q.answer + ' (' + q.region + ')'; },
    printHead: '방언 카드에 쓰인 말과 뜻이 같은 표준어에 ○ 하세요. 우리나라 사람들이 공통으로 쓰도록 정한 말이 표준어, 특정 지역에서 주로 쓰는 말이 방언이에요.'
  };
}));
