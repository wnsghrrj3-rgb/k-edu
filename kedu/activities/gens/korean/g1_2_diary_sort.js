/* gens/korean/g1_2_diary_sort.js — 그림일기 조각 나누기 (1학년 2학기 국어 3단원 「그림일기를 써요」 l08 · l10 · l14 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 근거 = 지도서(국어 1-2 ㉮ 3단원) 152~157쪽: 『국어』 96쪽 찬호의 그림일기(10월 24일 일요일 · 해가 쨍쨍한 날 · 할머니 댁 사과 따기 ·
 *   「사과를 직접 따 보니 정말 재미있었다.」) · 97쪽 2번 그림일기에 들어갈 내용(날짜와 요일 · 날씨 · 그림 · 글 — 경험한 일 / 생각이나 느낌) ·
 *   98~99쪽 3·4번 고칠 점·주의할 점(<보기> 날씨 · 내용 · 경험한 일 · 생각이나 느낌) · 지도서 156~157쪽 「그림일기의 글 부분 점검하기」·
 *   「잘 쓴 그림일기 읽어 보기」 예시(5월 30일 금요일 · 맑음 · 거짓말 · 「엄마, 죄송해요.」).
 *   케이티처 2세대 정본 data/g1s2_korean_u3.js l10(운동회 콩 주머니 · 「구름이 낮잠 자는 날」처럼 날씨를 재미있게 · 현장 체험 학습 김밥·장미 공원 ·
 *   동생과 동화책) · l14(「해님이 방긋 웃는 날」 · 미끄럼틀을 처음 거꾸로 · 「무서웠지만 신났다」) · l12(고양이와 공놀이).
 * 판 = 그림일기 한 장(맨 위 날짜와 요일·날씨 + 글 두세 줄) 가운데 밑줄 친 한 조각. 칸 = 97쪽 2번 그대로 넷:
 *   date 날짜와 요일 · weather 날씨 · event 경험한 일 · feel 생각이나 느낌.
 * 진단 축의 핵심은 event ↔ feel(정본 l08 watch 「있었던 일과 느낌을 가르지 못하는 경우」·찬호 셋째 줄) —
 *   날씨를 재미있게 쓴 말(「해님이 방긋 웃는 날」)은 마음처럼 들려도 날씨 칸(덫). 한 문장에 일과 느낌이 섞인 줄(「~해서 신났다」)은 묻지 않는다.
 * params: { upto: 'l08'|'all' }  l08 = 9차시까지 · all = 단원 전체(l10·l14) · 이번 차시 일기가 덱 앞머리
 * next() → { diary:{date, weather, lines:[문장]}, part:'date'|'weather'|0|1|…, w(밑줄 친 조각), cat, type, item, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g1_2_diary_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l08', 'l10'];
  var CATS = [{ key: 'date', label: '📅 날짜와 요일' }, { key: 'weather', label: '🌤️ 날씨' }, { key: 'event', label: '✏️ 경험한 일' }, { key: 'feel', label: '💭 생각이나 느낌' }];
  var WHY = {
    date: '그림일기 맨 위에는 언제 쓴 일기인지 날짜와 요일을 써요.',
    weather: '날짜와 요일 옆에는 그날의 날씨를 써요. 재미있게 꾸며 써도 날씨예요.',
    event: '글에는 그날 경험한 일 가운데 기억에 남는 일을 자세히 써요 — 언제, 어디에서, 누구와 무엇을 했는지.',
    feel: '경험한 일에 대한 생각이나 느낌도 써요 — 그때 마음이 어땠는지, 앞으로 어떻게 하고 싶은지.'
  };

  /* 그림일기 — l 차시 · date · weather · lines [문장, 'event'|'feel'] · src 근거 */
  var D = [
    { l: 'l08', src: '국어 96쪽 찬호', date: '20○○년 10월 24일 일요일', weather: '해가 쨍쨍한 날',
      lines: [['과수원을 하시는 할머니 댁에 놀러 갔다.', 'event'], ['나와 동생은 빨갛게 익은 사과를 땄다.', 'event'], ['사과를 직접 따 보니 정말 재미있었다.', 'feel']] },
    { l: 'l08', src: '지도서 157쪽 잘 쓴 그림일기', date: '20○○년 5월 30일 금요일', weather: '맑음',
      lines: [['엄마한테 거짓말을 했다.', 'event'], ['숙제가 없다고 했다.', 'event'], ['엄마, 죄송해요.', 'feel'], ['일기를 쓰고 숙제를 해야겠다.', 'feel']] },
    { l: 'l08', src: '지도서 156쪽 글 부분 점검', date: '20○○년 6월 12일 수요일', weather: '비가 주룩주룩 오는 날',
      lines: [['체육관에서 친구들과 공 던지기를 했다.', 'event'], ['공을 던지고 있는데 동생이 자꾸 끼어들었다.', 'event'], ['매우 기분이 나빴다.', 'feel']] },
    { l: 'l10', src: '정본 l10 운동회 · 날씨 재미있게', date: '20○○년 10월 7일 금요일', weather: '구름이 낮잠 자는 날',
      lines: [['운동회 날 운동장에서 박 터뜨리기를 했다.', 'event'], ['박이 터질 때까지 콩 주머니를 던졌다.', 'event'], ['우리 편이 이겨서 기분이 좋았다.', 'feel']] },
    { l: 'l10', src: '정본 l10 현장 체험 학습', date: '20○○년 5월 16일 목요일', weather: '바람이 살랑살랑 부는 날',
      lines: [['어머니께서 맛있는 김밥을 싸 주셨다.', 'event'], ['선생님을 따라서 장미 공원으로 걸어갔다.', 'event'], ['장미 향기를 맡으니 마음이 편안했다.', 'feel']] },
    { l: 'l10', src: '정본 l10·l14 놀이터', date: '20○○년 9월 3일 토요일', weather: '해님이 방긋 웃는 날',
      lines: [['놀이터에서 미끄럼틀을 처음 거꾸로 타 보았다.', 'event'], ['무서웠지만 신났다.', 'feel']] },
    { l: 'l10', src: '정본 l10 동생과 동화책', date: '20○○년 11월 2일 화요일', weather: '찬 바람이 쌩쌩 부는 날',
      lines: [['저녁에 거실에서 동생과 동화책을 읽었다.', 'event'], ['다음에도 동생에게 책을 읽어 주고 싶다.', 'feel']] },
    { l: 'l10', src: '정본 l12 우리 집 고양이', date: '20○○년 4월 20일 일요일', weather: '맑음',
      lines: [['동생과 고양이와 공놀이를 했다.', 'event'], ['고양이가 공을 굴리는 모습이 정말 귀여웠다.', 'feel']] }
  ];

  // 판 목록 — 일기마다 날짜·날씨·글 줄 하나하나
  var S = [];
  D.forEach(function (d, di) {
    S.push({ di: di, part: 'date', cat: 'date' });
    S.push({ di: di, part: 'weather', cat: 'weather' });
    d.lines.forEach(function (ln, li) { S.push({ di: di, part: li, cat: ln[1] }); });
  });

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function labelOf(k) { return CATS.filter(function (c) { return c.key === k; })[0].label.replace(/^\S+ /, ''); }
  function wordOf(s) { var d = D[s.di]; return s.part === 'date' ? d.date : s.part === 'weather' ? d.weather : d.lines[s.part][0]; }

  function build(s) {
    var d = D[s.di], w = wordOf(s);
    return { l: d.l, cat: s.cat, type: s.cat, part: s.part, w: w, item: w,
             diary: { date: d.date, weather: d.weather, lines: d.lines.map(function (ln) { return ln[0]; }) },
             explain: '「' + w + '」 — ' + labelOf(s.cat) + '. ' + WHY[s.cat] };
  }

  return {
    id: 'g1_2_diary_sort',
    title: '그림일기 조각 나누기',
    categories: CATS,
    D: D,
    S: S,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(D[s.di].l) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return D[S[k].di].l === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var lastDi = -1, lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) {
          var s = S[deck[t]];
          if (s.di === lastDi) continue;                                    // 같은 일기 연달아 0
          if (run >= 1 && s.cat === lastCat) continue;                      // 같은 칸 두 번 넘게 잇따름 0
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
          var s = S[deck.splice(at, 1)[0]];
          run = s.cat === lastCat ? run + 1 : 0; lastCat = s.cat; lastDi = s.di;
          return build(s);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) {
      var d = q.diary;
      function u(t) { return t === q.w ? '<u>' + t + '</u>' : t; }
      return u(d.date) + ' &nbsp; ' + u(d.weather) + '<br>' + d.lines.map(u).join(' ') + '<br>밑줄 친 곳 → □ 날짜와 요일 □ 날씨 □ 경험한 일 □ 생각이나 느낌';
    },
    printAnswer: function (q) { return q.w + ' → ' + labelOf(q.cat); },
    printHead: '그림일기에서 밑줄 친 곳은 무엇을 쓴 곳인지 □에 ✓ 하세요.'
  };
}));
