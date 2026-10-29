/* gens/korean/geka_hunt.js — 갈게? 갈까? 틀리게 쓴 곳 찾기 (3학년 2학기 국어 6단원 「감상과 표현의 즐거움」 l14 단원 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 낱말 토큰)가 쓴다 — 토큰 하나 = 어절 하나.
 * params: {}  범위 하나(l14) — 범위 칩 없음
 * next() → { prompt, icon, src, lines:[[tok…]…], tokens:[{t,hit} | {t:' ',sep:true}], answer:[틀린 어절…], fix:[바른 꼴…], type, explain, l }
 *
 * 정본 l14 s06: 「내가 갈게.」는 [갈께]로 소리 나도 쓸 때는 「갈게」 — 약속하는 말 「갈게」 · 되돌아보는 말 「일어날걸」은 글자 그대로
 * 정본 l14 s07: 묻는 말(「무엇을 먹을까?」 · 「왜 늦을꼬?」)은 소리 나는 대로 — watch 「먹을가?」로 쓰는 경우
 * 정본 l14 s08 오개념: [갈께]로 소리 나니까 「갈께」로 쓴다 · tnote watch 「둘 다 ㄲ으로」 · hint 「물음표가 붙는 말인지 먼저」
 * 정본 l14 s10 쪽지 「금방 갈께. 일찍 일어날껄.」 · s12 기본 「내가 도와줄께. 어디로 갈가?」 · s15 「내가 할께」 · s14·r 「또 쓸게」 — 글에 그대로
 * 찾을 것 = 틀리게 쓴 어절(판마다 2~3) · 판정 전엔 모든 낱말이 같은 모습(답 미노출).
 * 덫 = 바르게 쓴 말(판마다 하나 이상) — 약속·되돌아보는 판엔 늘 바른 묻는 말 「까?·꼬?」(「ㄲ만 보면 누르기」),
 *       묻는 말 판엔 늘 바른 약속하는 말 「게」(「둘 다 ㄲ」 거꾸로 — 「게」만 보면 누르기).
 * type(문항 단위 · 진단 축 — 찾을 곳의 갈래로 정한다):
 *   gk_promise  약속하는 말을 「께」로 쓴 곳만(갈께 → 갈게) — s06·s08·s15
 *   gk_regret   되돌아보는 말 「껄」이 든 판(일어날껄 → 일어날걸) — s06·s10
 *   gk_ask      묻는 말을 「가?」로 쓴 곳만(먹을가? → 먹을까?) — s07 watch
 *   gk_mix      두 갈래가 한 글에(도와줄께 · 갈가?) — s12 기본 · 물음표부터
 * 표지 문법(이 파일 안): [틀린 꼴|바른 꼴] = 찾을 어절 · {바른 꼴} = 바르게 쓴 덫 · / = 줄 바꿈
 * 글 = 정본 s10·s12 쪽지 그대로 + 같은 꼴 자체 구성(곰이·펭이 쪽지·문자·편지). 「선생님께」처럼 낱말 끝 「께」인 보통 말 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['geka_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PROMPT = '틀리게 쓴 곳을 모두 눌러요';

  /* [아이콘, 글 이름, 글] */
  var T = [
    // ── gk_promise · 약속하는 말을 「께」로 쓴 곳만 — 덫 = 바른 묻는 말
    ['📝', '곰이의 쪽지', '내가 먼저 [갈께.|갈게.] / 너는 천천히 와. / 우리 어디서 {만날까?} / 내가 [기다릴께.|기다릴게.]'],
    ['📱', '펭이의 문자', '숙제 다 하고 [전화할께.|전화할게.] / 내일 몇 시에 {갈까?} / 공책은 내가 [챙길께.|챙길게.]'],
    ['✉️', '할머니 편지', '할머니, 방학에 꼭 [갈께요.|갈게요.] / 그때 무엇을 {먹을까요?} / 편지 또 [쓸께요.|쓸게요.]'],
    ['🧹', '청소 시간', '칠판은 내가 [닦을께.|닦을게.] / 바닥은 누가 {쓸까?} / 그럼 내가 [쓸께.|쓸게.] / 쓰레기는 언제 {버릴까?}'],
    ['📚', '책 빌리기', '그 책 다 읽으면 [빌려줄께.|빌려줄게.] / 언제 {돌려줄까?} / 다음 주에 꼭 [돌려줄께.|돌려줄게.]'],
    ['🎒', '준비물', '풀은 내가 [가져갈께.|가져갈게.] / 가위도 {가져갈까?} / 응, 가위는 너한테 [부탁할께.|부탁할게.]'],
    ['🙋', '모둠 발표', '발표는 내가 [할께.|할게.] / 그림은 누가 {그릴까?} / 그림은 내가 [그릴께.|그릴게.]'],
    ['🕗', '기다리는 곰이', '펭이는 왜 이리 {늦을꼬?} / 조금만 더 [기다릴께.|기다릴게.] / 오면 같이 [갈께.|갈게.]'],
    // ── gk_regret · 되돌아보는 말 「껄」이 든 판 — 덫 = 바른 묻는 말
    ['📝', '곰이가 건넨 쪽지', '금방 [갈께.|갈게.] / 일찍 [일어날껄.|일어날걸.] / 펭이야, 어디서 {볼까?}'],
    ['☔', '비 오는 날', '아침에 우산을 [챙길껄.|챙길걸.] / 엄마한테 {전화할까?} / 다음엔 꼭 [챙길께.|챙길게.]'],
    ['✏️', '받아쓰기', '두 개나 틀렸어. / 미리 한 번 더 [읽을껄.|읽을걸.] / 오늘 저녁에 [연습할께.|연습할게.] / 같이 {연습할까?}'],
    ['🍦', '아이스크림 가게', '딸기 맛을 [고를껄.|고를걸.] / 다음엔 무슨 맛을 {고를까?} / 그땐 꼭 딸기로 [할께.|할게.]'],
    ['🎨', '미술 시간', '물감을 조금만 [짤껄.|짤걸.] / 남은 물감은 어떻게 {할까?} / 붓은 내가 깨끗이 [씻을께.|씻을게.]'],
    ['⚽', '축구 경기', '공을 더 빨리 [찰껄.|찰걸.] / 다음 경기는 언제 {할까?} / 다음엔 꼭 [이길께.|이길게.]'],
    // ── gk_ask · 묻는 말을 「가?」로 쓴 곳만 — 덫 = 바른 약속하는 말
    ['📝', '펭이의 쪽지', '점심에 무엇을 [먹을가?|먹을까?] / 오늘은 내가 {살게.} / 그다음엔 어디로 [갈가?|갈까?]'],
    ['🎈', '생일 잔치', '선물은 무엇으로 [할가?|할까?] / 카드는 내가 {쓸게.} / 몇 시에 [모일가?|모일까?]'],
    ['🌳', '쉬는 시간', '운동장에서 [놀가?|놀까?] / 공은 내가 {가져올게.} / 누가 먼저 [찰가?|찰까?]'],
    ['🐟', '교실 어항', '물고기 밥은 언제 [줄가?|줄까?] / 아침에는 내가 {줄게.} / 물은 며칠마다 [바꿀가?|바꿀까?]'],
    ['📖', '도서관', '이 책을 [빌릴가?|빌릴까?] / 다 읽으면 {돌려줄게.} / 다음엔 무슨 책을 [읽을가?|읽을까?]'],
    ['🚌', '현장 체험학습', '버스에서 누구 옆에 [앉을가?|앉을까?] / 나는 창가에 {앉을게.} / 도시락은 어디서 [먹을가?|먹을까?]'],
    // ── gk_mix · 두 갈래가 한 글에 — 물음표부터(정본 s12 기본 쪽지 그대로가 첫 판)
    ['📝', '곰이의 고친 쪽지', '내가 [도와줄께.|도와줄게.] / 어디로 [갈가?|갈까?] / 끝나면 같이 {놀까?}'],
    ['📱', '저녁 문자', '지금 [출발할께요.|출발할게요.] / 엄마, 저녁은 뭐 [먹을가요?|먹을까요?] / 가는 길에 우유도 {살게요.}'],
    ['🎤', '발표 연습', '내가 먼저 [읽을께.|읽을게.] / 너는 언제 [읽을가?|읽을까?] / 끝나면 박수 {칠게.}'],
    ['🧺', '소풍 준비', '돗자리는 내가 [챙길께.|챙길게.] / 김밥은 몇 줄 [쌀가?|쌀까?] / 어제 미리 [살껄.|살걸.] / 과일도 {가져갈까?}'],
    ['🌧️', '비 오는 운동회', '운동회가 미뤄지면 어떻게 [할가?|할까?] / 내가 [알아볼께.|알아볼게.] / 어제 미리 {물어볼걸.}'],
    ['🐶', '강아지 산책', '오늘은 내가 [데려갈께.|데려갈게.] / 어느 길로 [갈가?|갈까?] / 아, 물을 챙겨 {올걸.}']
  ];

  var RE_PROMISE = /께(요)?[.!]?$/, RE_REGRET = /껄(요)?[.!]?$/, RE_ASK = /가(요)?\?$/;
  function kindOf(t) { return RE_REGRET.test(t) ? 'regret' : RE_PROMISE.test(t) ? 'promise' : RE_ASK.test(t) ? 'ask' : ''; }

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 글 → 줄마다 토큰. [틀린|바른] = 찾을 어절 · {바른 꼴} = 바르게 쓴 덫 · 나머지 어절 하나 */
  function parse(text) {
    return text.split(' / ').map(function (line) {
      var out = [], re = /\[([^\]|]+)\|([^\]]+)\]|\{([^}]+)\}|(\S+)/g, m;
      while ((m = re.exec(line))) {
        if (m[1]) out.push({ t: m[1], hit: true, fix: m[2], kind: kindOf(m[1]) });
        else if (m[3]) out.push({ t: m[3], hit: false, trap: true });
        else out.push({ t: m[4], hit: false });
      }
      return out;
    });
  }
  function typeOf(lines) {
    var k = [].concat.apply([], lines).filter(function (t) { return t.hit; }).map(function (t) { return t.kind; });
    var ask = k.indexOf('ask') >= 0, keep = k.some(function (x) { return x !== 'ask'; });
    if (ask && keep) return 'gk_mix';
    if (ask) return 'gk_ask';
    return k.indexOf('regret') >= 0 ? 'gk_regret' : 'gk_promise';
  }

  var HEAD = {
    gk_promise: '약속하는 말은 [께]로 소리 나도 글자는 「게」 그대로예요: ',
    gk_regret: '약속하는 말 · 되돌아보는 말은 소리가 세져도 글자는 「게 · 걸」 그대로예요: ',
    gk_ask: '물음표가 붙는 묻는 말은 소리 나는 대로 「까」로 써요: ',
    gk_mix: '물음표부터 봐요 — 묻는 말은 소리 나는 대로 「까」, 약속 · 되돌아보는 말은 「게 · 걸」: '
  };
  var strip = function (s) { return s.replace(/[.?!]$/, ''); };
  /* 받침 있으면 「은」 · 없으면 「는」 — 덫 맨 끝 글자로 고른다 */
  function eunNeun(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return (c >= 0 && c < 11172 && c % 28) ? '은' : '는'; }

  /* 풀이 = 머리 + 찾을 곳마다 「틀린」 → 「바른」 + 덫은 「바르게 썼어요」 */
  function explainOf(lines) {
    var all = [].concat.apply([], lines);
    var parts = all.filter(function (t) { return t.hit; }).map(function (t) { return '「' + strip(t.t) + '」 → 「' + strip(t.fix) + '」'; });
    var traps = all.filter(function (t) { return t.trap; }).map(function (t) { return strip(t.t); });
    return HEAD[typeOf(lines)] + parts.join(' · ') +
      (traps.length ? '  (「' + traps.join('」·「') + '」' + eunNeun(traps[traps.length - 1]) + ' 바르게 썼어요)' : '');
  }

  function build(row, k, id) {
    var lines = parse(row[2]);
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) { tokens.push({ t: t.t, hit: !!t.hit }); });
    });
    var hits = [].concat.apply([], lines).filter(function (t) { return t.hit; });
    return { id: id, l: 'l14', icon: row[0], src: row[1], type: typeOf(lines),
             prompt: row[0] + ' ' + PROMPT, lines: lines, tokens: tokens,
             answer: hits.map(function (t) { return t.t; }), fix: hits.map(function (t) { return t.fix; }), explain: explainOf(lines) };
  }

  return {
    id: 'geka_hunt',
    title: '갈게? 갈까? 틀리게 쓴 곳 찾기',
    T: T, PROMPT: PROMPT, HEAD: HEAD,
    parse: parse, typeOf: typeOf, kindOf: kindOf, eunNeun: eunNeun,
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
          return build(T[k], k, 'gk' + k + '_' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(String(pick)) >= 0; }
      };
    },
    printRender: function (q) {
      return q.icon + ' <b>' + q.src + '</b><br>' + q.lines.map(function (line) {
        return line.map(function (t) { return t.t; }).join(' ');
      }).join('<br>');
    },
    printAnswer: function (q) { return q.answer.map(function (a, i) { return strip(a) + ' → ' + strip(q.fix[i]); }).join(' · '); },
    printHead: '글을 읽고 「게 · 걸 · 까」를 틀리게 쓴 곳에 모두 ○를 하고 바르게 고쳐 쓰세요. 물음표가 붙는 말인지 먼저 보세요.'
  };
}));
