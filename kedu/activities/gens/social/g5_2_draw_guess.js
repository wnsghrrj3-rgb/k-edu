/* gens/social/g5_2_draw_guess.js — 그림으로 기억하기 (5학년 2학기 사회 2단원 「달라지는 시대, 변화하는 생활 모습」 · 교과서판 2학기)
 * 순수 함수·DOM 무관 (§9-3). 장르 duel_quiz(stream)가 쓴다 — 친구의 그림 + 단서 한 줄 → 보기 넷(단어) 가운데 하나.
 * 놀이 = 『사회』 114~115쪽 단원 마무리 「교실 놀이를 함께해요 — 그림으로 기억하기」(지도서 247쪽)
 *   문제를 내는 친구가 단원 낱말 8개를 30초 간격으로 부르면 나머지는 숫자·글자 없이 그림으로 그리고,
 *   다 그리면 무엇을 그렸는지 쓰고 맞춰 본다(놀이 판 예시 낱말: 전차 · 상평통보 · 천리경 · 동학 · 제사 · 탈놀이 · 측우기 · 서당).
 *   여기서는 맞춰 보기 쪽 — 친구가 그린 그림(그림 문자, 글자·숫자 0)과 그 낱말의 단서 한 줄(지도서 글)을 보고 무엇을 그렸는지 고른다.
 *   예시 낱말 가운데 「서당」은 시대 칸을 하나로 가릴 수 없어(풍속화 「서당」은 조선 후기 · 서당 체험) 판에서 뺐다.
 * params: { upto: 'l06'|'l10'|'all' }  l06 = 6차시까지(조선 전기 — 유교·과학 기구) · l10 = 10차시까지(+ 조선 후기) · all = 단원 전체(+ 개항 이후)
 * next() → { prompt, pic, hint, answer, options:[넷 · 섞임], era, type, explain, l }
 * type = 그 낱말의 때 — early 조선 전기 · late 조선 후기 · open 개항 이후 (단원 차례: l02~l07 · l08~l10 · l11)
 * 보기 = 답 + 같은 때 낱말 둘 + 다른 때 낱말 하나(같은 때끼리 견주어야 고를 수 있게).
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_draw_guess'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PROMPT = '친구가 그린 그림이에요. 무엇을 그렸을까요?';
  var ORDER = ['l06', 'l10', 'l11'];
  var ERA = { early: 'l06', late: 'l10', open: 'l11' };
  var ERA_NAME = { early: '조선 전기', late: '조선 후기', open: '개항 이후' };

  /* [때, 낱말, 그림(그림 문자 — 글자·숫자 0), 단서(지도서 글)] */
  var T = [
    ['early', '경복궁', '🏯👑', '큰 복을 누리기를 바라는 뜻이 담긴 궁궐'],
    ['early', '제사', '🍎🕯️🙇', '종묘에서 역대 왕과 왕비를 기리려고 지냈어요'],
    ['early', '삼강행실도', '📖🙇👨‍👩‍👦', '세종 때 집현전에서 백성을 가르치려고 펴낸 책'],
    ['early', '훈민정음', '📜👑🗣️', '세종이 만들어 반포한 뒤 백성의 생활이 달라졌어요'],
    ['early', '측우기', '🌧️🏺', '매년 비의 양을 재어 농사에 도움을 줬어요'],
    ['early', '자격루', '💧⏰', '물의 흐름을 이용한 물시계'],
    ['early', '앙부일구', '☀️🥣', '글을 읽을 줄 모르는 백성도 시각을 알 수 있었어요'],
    ['early', '혼천의', '🌞🌙⭐', '해와 달, 별의 움직임을 관찰했어요'],
    ['late', '상평통보', '🪙', '크기가 작고 썩지 않아 쌀보다 보관이 쉬웠어요'],
    ['late', '모내기법', '🌱🌾💧', '전국에서 이 방법으로 벼농사를 지었어요'],
    ['late', '고구마', '🍠🚢', '감자와 함께 외국에서 들어왔어요'],
    ['late', '천리경', '🔭👀', '멀리 있는 것을 크고 정확하게 보았어요'],
    ['late', '동학', '🙏🌄', '모든 사람이 평등하다는 생각을 담은 새로운 종교'],
    ['late', '탈놀이', '🎭💃', '탈을 쓰고 춤을 추며 양반을 비꼬았어요'],
    ['late', '판소리', '🥁🎤', '소리꾼이 북 장단에 맞추어 이야기를 풀어 가요'],
    ['late', '한글 소설', '📖✍️', '『홍길동전』, 『심청전』처럼 서민의 소망을 담았어요'],
    ['late', '민화', '🐯🖌️', '이름이 알려지지 않은 화가들이 생활 공간을 꾸미려고 그렸어요'],
    ['open', '전차', '🚋', '한성의 거리를 달리며 생활을 바꾸었어요'],
    ['open', '전깃불', '💡🏯', '경복궁과 한성 시내에 켜졌어요'],
    ['open', '독립신문', '📰', '서재필이 정부의 지원을 받아 만들었어요'],
    ['open', '배재 학당', '🏫✝️', '미국 선교사 아펜젤러가 세운 서양식 학교'],
    ['open', '양복', '🤵👞', '양식, 양옥처럼 서양에서 들어온 것'],
    ['open', '커피', '☕', '서양 식문화를 접할 수 있는 사람들이 주로 마셨어요']
  ];
  var KINDS = ['early', 'late', 'open'];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function lim(upto) { var i = ORDER.indexOf(upto); return upto === 'all' || i < 0 ? ORDER.length - 1 : i; }
  function norm(upto) { return (upto === 'l06' || upto === 'l10') ? upto : 'all'; }
  function iyeyo(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return (c >= 0 && c < 11172 && c % 28) ? '이에요' : '예요'; }
  function explainOf(row) { return '「' + row[1] + '」' + iyeyo(row[1]) + ' — ' + ERA_NAME[row[0]] + '. ' + row[3] + (/[.요]$/.test(row[3]) ? '' : '.'); }
  function optionsOf(row, rng, pool) {
    var same = shuffle(rng, pool.filter(function (t) { return t[0] === row[0] && t[1] !== row[1]; })).slice(0, 2).map(function (t) { return t[1]; });
    var other = shuffle(rng, pool.filter(function (t) { return t[0] !== row[0]; })).map(function (t) { return t[1]; });
    var fill = shuffle(rng, pool.filter(function (t) { return t[1] !== row[1] && same.indexOf(t[1]) < 0; })).map(function (t) { return t[1]; });
    var picks = same.concat(other.length ? [other[0]] : []);
    for (var i = 0; picks.length < 3 && i < fill.length; i++) if (picks.indexOf(fill[i]) < 0) picks.push(fill[i]);
    return shuffle(rng, [row[1]].concat(picks.slice(0, 3)));
  }

  return {
    id: 'g5_2_draw_guess',
    title: '그림으로 기억하기',
    T: T, ORDER: ORDER, ERA: ERA, ERA_NAME: ERA_NAME, KINDS: KINDS, PROMPT: PROMPT, explainOf: explainOf,
    create: function (params, rng) {
      params = params || {};
      var upto = norm(params.upto), L = lim(upto);
      var idx = []; T.forEach(function (t, k) { if (ORDER.indexOf(ERA[t[0]]) <= L) idx.push(k); });
      var pool = idx.map(function (k) { return T[k]; });                       // 보기는 배운 때 낱말에서만
      var deck = shuffle(rng, idx), last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) { deck = shuffle(rng, idx); if (deck.length > 1 && deck[0] === last) deck.push(deck.shift()); }
          var k = deck.shift(), row = T[k]; last = k;
          var opts = optionsOf(row, rng, pool);
          return { id: 'dg' + k + '_' + (n++), l: ERA[row[0]], era: row[0], type: row[0], pic: row[2], hint: row[3], answer: row[1], options: opts,
                   prompt: PROMPT + ' — 그림: ' + row[2] + ' / 단서: ' + row[3] + ' / 보기: ' + opts.join(' · '),
                   explain: explainOf(row) };
        },
        check: function (pick, q) { return String(pick) === q.answer; }
      };
    },
    printRender: function (q) { return '그림: ' + q.pic + '<br>단서: ' + q.hint + '<br>보기: ' + q.options.join(' · '); },
    printAnswer: function (q) { return q.answer + ' (' + ERA_NAME[q.era] + ')'; },
    printHead: '친구가 그린 그림과 단서를 보고, 무엇을 그렸는지 보기에서 골라 ○ 하세요.'
  };
}));
