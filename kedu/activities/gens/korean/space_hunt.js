/* gens/korean/space_hunt.js — 것·수·줄 띄어쓰기 찾기 (3학년 2학기 국어 2단원 「유창하게 읽고 발표해요」 l13 단원 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 낱말 토큰)가 쓴다 — 토큰 하나 = 어절 하나.
 * params: {}  범위 하나(l13) — 범위 칩 없음
 * next() → { prompt, icon, src, lines:[[tok…]…], tokens:[{t,hit} | {t:' ',sep:true}], answer:[틀린 어절…], fix:[바른 꼴…], type, explain, l }
 *
 * 정본 l13 s05: 「‘것 · 수 · 줄’은 혼자 쓰이지 못하고 다른 말에 기대어 쓰이는 말 → 앞말과 띄어 써요」
 *   (비가 온 것을 알았다 · 혼자 갈 수 있다 · 자전거를 탈 줄 안다 — s05 pairs 「온것을」·「탈줄」 = 틀린 꼴)
 * 정본 s06·s08·s15: 「줄넘기 · 수요일」처럼 한 낱말 속에 들어 있을 때는 붙여 써요 — 오개념 「어디에 나오든 띄어 쓴다」
 * 정본 s12 기본: ‘수’는 앞말 「갈」과도, 뒷말 「있다」와도 띄어 써요.
 * 찾을 것 = 것·수·줄을 붙여 써서 틀린 어절(판마다 2~3) · 판정 전엔 모든 낱말이 같은 모습(답 미노출).
 * 덫 = ① 바르게 띄어 쓴 것·수·줄(누르면 오탭 — 「수」만 보면 누르는 경우) ② 한 낱말 속 「줄·수」(줄넘기·수요일 … — s08 오개념 축)
 * type(문항 단위 · 진단 축):
 *   sp_front  앞말에 붙여 쓴 것·수·줄 찾기(온것을 · 갈수 · 탈줄) — s05 watch 「앞말에 붙여 한 낱말처럼」
 *   sp_back   뒷말에 붙여 쓴 수·줄도 든 글(수있다 · 줄안다) — s12 기본 「뒷말과도 띄어」
 *   sp_word   한 낱말 속 줄·수(줄넘기·수요일·줄다리기·수영·수박·줄무늬)가 낀 글 — s06·s08·s12 watch·s15 축
 * 표지 문법(이 파일 안): [틀린 꼴|바른 꼴] = 찾을 어절 · {낱말} = 한 낱말 덫(붙여 쓰는 게 맞음) · / = 줄 바꿈
 * 글 = 정본 s05·s12 보기 문장 + 같은 꼴 자체 구성(곰이·펭이 낭독 발표회 · 나겸이·한울이). 「줄게」·「거예요」처럼 것·수·줄로 읽힐 말 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['space_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PROMPT = '것·수·줄을 붙여 써서 틀린 곳을 모두 눌러요';
  var WORDS = ['줄넘기', '수요일', '줄다리기', '수영', '수박', '줄무늬'];   // 앞 둘 = 정본 s06 · 나머지 = 같은 꼴 자체 구성

  /* [아이콘, 글 이름, 글] */
  var T = [
    // ── sp_front · 앞말에 붙여 쓴 곳만(정본 s05 보기 그대로 + 자체 구성)
    ['✏️', '오늘 배운 문장', '비가 [온것을|온 것을] 알았다. / 혼자 [갈수|갈 수] 있다. / 자전거를 탈 줄 안다.'],
    ['🐻', '곰이와 펭이', '곰이는 [헤엄칠수|헤엄칠 수] 있어요. / 펭이는 물구나무를 [설줄|설 줄] 알아요. / 둘 다 연습한 것을 보여 주었어요.'],
    ['✏️', '내가 할 수 있는 일', '내가 [그린것을|그린 것을] 친구에게 보여 주었다. / 동생은 신발 끈을 [맬줄|맬 줄] 안다. / 나는 물구나무를 설 수 있다.'],
    ['🎤', '낭독 발표회 준비', '발표회에서 [읽을것을|읽을 것을] 골랐어요. / 곰이는 쉬어 [읽을줄|읽을 줄] 알아요. / 이제 떨지 않고 읽을 수 있어요.'],
    ['🎒', '소풍 가는 날', '펭이는 [먹을것을|먹을 것을] 가방에 넣었어요. / 한울이는 자전거를 [탈줄|탈 줄] 알아요. / 둘이 공원까지 갈 수 있어요.'],
    ['🎤', '나겸이와 한울이', '나겸이는 또박또박 [읽을수|읽을 수] 있어요. / 한울이는 [쉬는것을|쉬는 것을] 잊지 않아요. / 듣는 사람이 알아들을 수 있어요.'],
    // ── sp_back · 뒷말에 붙여 쓴 수·줄이 든 글(정본 s12 기본 「뒷말 「있다」와도 띄어」)
    ['✏️', '오늘 배운 문장', '나는 혼자 학교에 갈 [수있다.|수 있다.] / 형은 자전거를 탈 [줄안다.|줄 안다.] / 비가 온 것을 알았다.'],
    ['🐻', '높이뛰기', '곰이는 높이 뛸 [수있어요.|수 있어요.] / 펭이는 아직 [뛸수|뛸 수] 없어요. / 그래도 끝까지 뛰어 볼 수 있어요.'],
    ['🥢', '동생의 점심', '동생은 젓가락을 쓸 [줄몰라요.|줄 몰라요.] / 그래서 숟가락으로 먹을 수 있게 했어요. / 내가 [도와준것을|도와준 것을] 기억할까요?'],
    ['🎵', '발표회 노래', '펭이는 노래를 부를 [줄알아요.|줄 알아요.] / 곰이는 피리를 불 [수있어요.|수 있어요.] / 함께 연습한 것을 발표했어요.'],
    ['📖', '짝에게 말하기', '책에서 [읽은것을|읽은 것을] 짝에게 말해요. / 짝은 끝까지 들을 [수있어요.|수 있어요.] / 나는 쉬어 읽을 줄 알아요.'],
    ['🎵', '우리 반 발표', '우리 반은 노래를 [부를수있어요.|부를 수 있어요.] / 곰이는 율동을 출 [줄알아요.|줄 알아요.] / 연습한 것을 발표회에서 보여 줘요.'],
    // ── sp_word · 한 낱말 속 줄·수가 낀 글(정본 s06 · s08 오개념 · s15 펭이)
    ['🏃', '줄넘기하는 날', '{수요일}에는 {줄넘기}를 해요. / 나는 백 번을 [넘을수|넘을 수] 있어요. / 동생은 아직 [넘을줄|넘을 줄] 몰라요.'],
    ['🏃', '줄넘기 연습', '나는 {줄넘기}를 [할줄|할 줄] 알아요. / 오늘 [배운것을|배운 것을] 집에서도 연습해요. / 이제 두 번 뛰기도 [할수|할 수] 있어요.'],
    ['🏊', '수영 배우기', '{수요일}마다 {수영}을 배워요. / 이제 혼자 [뜰수|뜰 수] 있어요. / 물에 [뜨는것은|뜨는 것은] 재미있어요.'],
    ['🪢', '운동회', '운동회에서 {줄다리기}를 했어요. / 줄을 꽉 [잡을줄|잡을 줄] 알아야 해요. / 우리 반이 [이긴것을|이긴 것을] 알았어요.'],
    ['👕', '친구 찾기', '{수요일}에 {줄무늬} 옷을 입은 친구를 찾았어요. / 멀리서도 [알아볼수|알아볼 수] 있었어요. / 그 친구가 [웃는것을|웃는 것을] 보았어요.'],
    ['🍉', '여름 간식', '{수박}을 시원하게 [먹을수|먹을 수] 있어요. / 펭이는 씨를 [뱉을줄|뱉을 줄] 몰라요. / 곰이가 뱉는 것을 보여 주었어요.'],
    ['🎤', '수요일 발표회', '{수요일} 발표회에서 [읽을것을|읽을 것을] 정했어요. / 곰이는 「우산」을 [읽을수|읽을 수] 있어요. / 펭이는 분위기를 살려 읽을 줄 알아요.'],
    ['🏃', '줄넘기 대회', '{수요일}에 {줄넘기} 대회가 있어요. / 나는 두 번 뛰기를 [할수|할 수] 있어요. / 짝은 엇갈려 [뛸줄|뛸 줄] 알아요. / 나도 곧 [뛸수|뛸 수] 있어요.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 글 → 줄마다 토큰. [틀린|바른] = 찾을 어절 · {낱말} = 한 낱말 덫 · 나머지 어절 하나 */
  function parse(text) {
    return text.split(' / ').map(function (line) {
      var out = [], re = /\[([^\]|]+)\|([^\]]+)\]|\{([^}]+)\}(\S*)|(\S+)/g, m;
      while ((m = re.exec(line))) {
        if (m[1]) out.push({ t: m[1], hit: true, fix: m[2] });
        else if (m[3]) out.push({ t: m[3] + m[4], hit: false, word: m[3] });
        else out.push({ t: m[5], hit: false });
      }
      return out;
    });
  }
  function typeOf(lines) {
    var all = [].concat.apply([], lines);
    if (all.some(function (t) { return t.word; })) return 'sp_word';
    if (all.some(function (t) { return t.hit && /(수|줄)\S/.test(t.t) && !/^(.+)(수|줄)[.?!]?$/.test(t.t); })) return 'sp_back';
    return 'sp_front';
  }

  /* 풀이 = 틀린 어절 → 바른 꼴 · 한 낱말 덫은 「붙여 써요」 */
  function explainOf(lines) {
    var all = [].concat.apply([], lines);
    var parts = all.filter(function (t) { return t.hit; }).map(function (t) { return '「' + t.t.replace(/[.?!]$/, '') + '」 → 「' + t.fix.replace(/[.?!]$/, '') + '」'; });
    var w = all.filter(function (t) { return t.word; }).map(function (t) { return t.word; })
      .filter(function (x, i, a) { return a.indexOf(x) === i; });
    var head = typeOf(lines) === 'sp_back' ? '것·수·줄은 앞말과 띄어 쓰고, 수·줄 뒤에 오는 말과도 띄어 써요: ' : '것·수·줄은 앞말과 띄어 써요: ';
    return head + parts.join(' · ') +
      (w.length ? '  (「' + w.join('」·「') + '」은 한 낱말이라 붙여 써요)' : '');
  }

  function build(row, k, id) {
    var lines = parse(row[2]);
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) { tokens.push({ t: t.t, hit: !!t.hit }); });
    });
    var hits = [].concat.apply([], lines).filter(function (t) { return t.hit; });
    return { id: id, l: 'l13', icon: row[0], src: row[1], type: typeOf(lines),
             prompt: row[0] + ' ' + PROMPT, lines: lines, tokens: tokens,
             answer: hits.map(function (t) { return t.t; }), fix: hits.map(function (t) { return t.fix; }), explain: explainOf(lines) };
  }

  return {
    id: 'space_hunt',
    title: '것·수·줄 띄어쓰기 찾기',
    T: T, WORDS: WORDS, PROMPT: PROMPT,
    parse: parse, typeOf: typeOf,
    create: function (params, rng) {
      var idx = T.map(function (t, k) { return k; });
      var deck = shuffle(rng, idx), last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 글이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], k, 'sp' + k + '_' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(String(pick)) >= 0; }
      };
    },
    printRender: function (q) {
      return q.icon + ' <b>' + q.src + '</b><br>' + q.lines.map(function (line) {
        return line.map(function (t) { return t.t; }).join(' ');
      }).join('<br>');
    },
    printAnswer: function (q) { return q.answer.map(function (a, i) { return a.replace(/[.?!]$/, '') + ' → ' + q.fix[i].replace(/[.?!]$/, ''); }).join(' · '); },
    printHead: '글을 읽고 것·수·줄을 앞말이나 뒷말에 붙여 써서 틀린 곳에 모두 ○를 하고 바르게 고쳐 쓰세요.'
  };
}));
