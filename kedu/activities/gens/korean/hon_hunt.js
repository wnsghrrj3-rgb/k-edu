/* gens/korean/hon_hunt.js — 높임 표현 고칠 곳 찾기 (3학년 2학기 국어 4단원 「서로 존중하며 대화해요」 l03 · l05 · l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 낱말 토큰)가 쓴다 — 토큰 하나 = 어절 하나(고칠 곳은 두 어절 덩이도 하나).
 * params: { upto: 'l03' | 'l05' | 'all' }  단원 처음부터 그 차시까지(누적) · all = 단원 전체(l14)
 * next() → { prompt, icon, src, lines:[[tok…]…], tokens:[{t,hit} | {t:' ',sep:true}], answer:[고칠 곳…], fix:[바른 꼴…], why:[까닭 코드…], type, explain, l }
 *
 * 정본 l03(3·4차시) s04 ‘-시-’ · s05 께·께서 · s10 높임 낱말(연세·성함·계시다·주무시다) · s06 말끝 ‘-습니다·요’ = 듣는 사람
 *   · s07·s08 오개념 「높임말은 많이 붙일수록 공손」 → 물건·일에 붙인 ‘-시-’ · s11 기현이 쪽지(선생님이 · 두셨어요 · 안녕히 있어요)
 *   · s14 「음료 나오셨습니다」 · s15 펭이 전화 「엄마가 저녁 먹으래」 · s17 「우산이 있으세요?」 · 「제가 두고 갔어」.
 * 정본 l05(5·6차시) s07 「선생님이 너 오래」 → 「선생님께서 너 오라고 하셔」 · s10·s12·s17 옆집 어른께 한 말 「지금 어디 가?」 · 「우리 엄마가 갖다주래요」.
 * 찾을 것 = 높임 표현을 고쳐야 할 어절(판마다 2~3) · 판정 전엔 모든 낱말이 같은 모습(답 미노출).
 * 덫 = 바르게 높인 말(판마다 하나 이상 — 께서·께·‑시‑·높임 낱말·말끝) — 「높임말이면 누르기」·「많이 붙여야 공손」이 늘 걸림.
 *   l05 덫 「계셔」(친구에게 선생님 말씀 옮김 — 듣는 친구에겐 말끝을 높이지 않아도 됨, 정본 s07 ✓ 칸 「오라고 하셔」).
 * 까닭 코드(고칠 곳마다): t 물건·일을 높임 · p 웃어른을 안 높임 · e 듣는 분께 말끝을 낮춤 · m 말을 옮기며 높임이 빠짐
 * type(문항 단위 · 진단 축 — 행마다 적어 둠): ht_thing · ht_person · ht_end · ht_relay(l05)
 * 표지 문법(이 파일 안): [고칠 곳|바른 꼴|까닭] = 찾을 어절 · {낱말} = 바르게 높인 말(덫) · / = 줄 바꿈
 * 낱말 앞당김 0 — l03 글에 옮기·오래·갖다·서툴·다녀오·가세요·드셨(l05 첫 등장) · 편찮·뵙·아프·생신(l10·l12) 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['hon_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PROMPT = '높임 표현을 고쳐야 할 곳을 모두 눌러요';
  var ORDER = ['l03', 'l05'];
  var WHY = {
    t: '물건이나 일은 높이지 않아요',
    p: '웃어른을 높여 써요',
    e: '듣는 분이 웃어른이면 말끝을 높여요',
    m: '말을 옮길 때도 그분을 높여요'
  };

  /* [차시, 유형, 아이콘, 글 이름, 글] */
  var T = [
    // ── l03 · ht_thing — 물건·일에 붙인 ‘-시-’(정본 s07·s08·s14·s17)
    ['l03', 'ht_thing', '☂️', '교실에서 여쭌 말', '선생님, 제 우산이 교실에 [있으세요?|있나요?|t] / {선생님께서} {보셨어요?} / 아침에 제가 우산을 [두셨어요.|두었어요.|t]'],
    ['l03', 'ht_thing', '🏪', '가게에서 들은 말', '손님, {주문하신} 음료 [나오셨습니다.|나왔습니다.|t] / 컵이 많이 [뜨거우세요.|뜨거워요.|t] / {조심하세요.}'],
    ['l03', 'ht_thing', '🧹', '청소 시간', '선생님, 칠판이 아주 [깨끗하시네요.|깨끗하네요.|t] / 칠판은 제가 {닦았습니다.} / 연필이 바닥에 [떨어지셨어요.|떨어졌어요.|t]'],
    ['l03', 'ht_thing', '🎁', '할머니 댁에 간 선물', '할머니, 선물 상자가 [도착하셨어요.|도착했어요.|t] / 상자가 꽤 [무거우세요.|무거워요.|t] / 제가 들어 {드릴게요.}'],
    ['l03', 'ht_thing', '📚', '도서관에서', '선생님, 제가 찾던 책이 여기 [계시네요!|있네요!|t] / {선생님께서} 골라 {주셨어요?} / 책이 아주 [재미있으세요.|재미있어요.|t]'],
    ['l03', 'ht_thing', '🖍️', '미술 시간', '선생님, 제 크레파스가 [없으세요.|없어요.|t] / 하나만 {빌려주세요.} / 그림이 거의 [다 되셨어요.|다 되었어요.|t]'],
    // ── l03 · ht_person — 께서·께·‑시‑·높임 낱말이 빠짐(정본 s04·s05·s10·s11·s12·s15)
    ['l03', 'ht_person', '📝', '기현이의 쪽지', '[선생님이|선생님께서|p] 안 {계셔서} 쪽지를 남겨요. / 줄넘기는 사물함에 [두셨어요.|두었어요.|t] / {빌려주셔서} 고맙습니다. 안녕히 [있어요.|계세요.|p]'],
    ['l03', 'ht_person', '👵', '할머니께서 오신 날', '오늘 [할머니가|할머니께서|p] 우리 집에 [왔어요.|오셨어요.|p] / 저는 {할머니께} 그림을 {드렸어요.}'],
    ['l03', 'ht_person', '😴', '할아버지 방', '쉿! [할아버지가|할아버지께서|p] 방에서 [잔다.|주무신다.|p] / {아버지께서} 조용히 놀라고 {하셨다.}'],
    ['l03', 'ht_person', '🙋', '이웃 어른께 여쭌 말', '할아버지, [이름이|성함이|p] 어떻게 {되세요?} / 저는 3학년 {은후입니다.} / 할아버지 [나이를|연세를|p] 여쭈어봐도 될까요?'],
    ['l03', 'ht_person', '📞', '할머니께 건 전화', '펭이가 {할머니께} 전화를 {드렸어요.} / 할머니, [엄마가|어머니께서|p] [저녁|진지|p] [먹으래.|드시래요.|p]'],
    ['l03', 'ht_person', '🧓', '경비 아저씨', '아침에 경비 {아저씨께} 인사를 {드렸어요.} / [아저씨가|아저씨께서|p] 웃으며 [말했어요.|말씀하셨어요.|p]'],
    ['l03', 'ht_person', '🍚', '저녁 식사', '[할아버지에게|할아버지께|p] 수저를 놓아 {드렸어요.} / 할아버지께서 [밥을|진지를|p] 맛있게 {드십니다.}'],
    ['l03', 'ht_person', '🏫', '선생님께 낸 공책', '[선생님에게|선생님께|p] 공책을 {드렸어요.} / 선생님께서 공책을 [읽었어요.|읽으셨어요.|p] / 칭찬도 해 {주셨어요.}'],
    // ── l03 · ht_end — 듣는 분이 웃어른인데 말끝을 낮춤(정본 s06 · s17)
    ['l03', 'ht_end', '🪴', '선생님께 드린 말', '선생님, 화분에 물은 제가 [줬어.|주었어요.|e] / 내일도 제가 [할게.|할게요.|e] / 선생님께서 {웃으셨어요.}'],
    ['l03', 'ht_end', '☂️', '우산을 두고 간 날', '선생님, 어제 제가 우산을 두고 [갔어.|갔어요.|e] / 혹시 교실에 우산이 [있으세요?|있나요?|t] / {선생님께서} {보셨나요?}'],
    ['l03', 'ht_end', '👋', '할머니와 헤어질 때', '할머니, 저 먼저 [갈게.|갈게요.|e] / 맛있는 떡을 {주셔서} [고마워.|고맙습니다.|e] / 안녕히 {계세요.}'],
    ['l03', 'ht_end', '✏️', '선생님께 묻기', '선생님, 이 문제를 어떻게 [풀어?|풀어요?|e] / 선생님께서 {말씀하신} 방법을 [잊었어.|잊었어요.|e]'],
    ['l03', 'ht_end', '🗳️', '학급 회의', '혜온 친구, 이 문제를 어떻게 {생각하시는지} [말해 줘.|말씀해 주세요.|e] / 네, 제 생각을 [말할게.|말씀드리겠습니다.|e]'],
    // ── l05 · ht_relay — 말을 옮기며 높임이 빠짐(정본 s07 · s10 · s12 · s16 · s17)
    ['l05', 'ht_relay', '🗣️', '선생님 말씀 전하기', '기현아, [선생님이|선생님께서|m] 너 [오래.|오라고 하셔.|m] / 지금 교무실에 {계셔.}'],
    ['l05', 'ht_relay', '🍡', '옆집 어른께', '{안녕하세요?} 지금 어디 [가?|가세요?|e] / [우리 엄마가|저희 어머니께서|m] 이거 [갖다주래요.|갖다드리라고 하셨어요.|m] / 제가 좀 거들어 {드릴까요?}'],
    ['l05', 'ht_relay', '📣', '할머니 말씀 옮기기', '곰이야, [할머니가|할머니께서|m] 밥 먹으러 [오래.|오라고 하셔.|m] / 할머니께서 기다리고 {계셔.}'],
    ['l05', 'ht_relay', '🏃', '교장 선생님 말씀', '펭이야, [교장 선생님이|교장 선생님께서|m] 운동장으로 [나오래.|나오라고 하셔.|m] / 교장 선생님께서 {기다리셔.}'],
    ['l05', 'ht_relay', '📦', '아버지 말씀 전하기', '아저씨, [아빠가|아버지께서|m] 곧 [온대요.|오신대요.|m] / 아버지께서 {아저씨께} 전화를 {드린대요.}'],
    ['l05', 'ht_relay', '⚽', '체육 선생님 말씀', '얘들아, [체육 선생님이|체육 선생님께서|m] 공을 [가져오래.|가져오라고 하셔.|m] / 선생님께서 강당에 {계셔.}'],
    ['l05', 'ht_end', '🛗', '엘리베이터 인사', '할아버지, {안녕하세요?} 어디 [다녀와?|다녀오세요?|e] / 저는 학교에 [갔다 왔어.|갔다 왔어요.|e] / 안녕히 {가세요.}']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 글 → 줄마다 토큰. [고칠 곳|바른 꼴|까닭] = 찾을 어절(덩이) · {낱말} = 덫 · 나머지 어절 하나 */
  function parse(text) {
    return text.split(' / ').map(function (line) {
      var out = [], re = /\[([^\]|]+)\|([^\]|]+)\|([tpem])\]|\{([^}]+)\}|(\S+)/g, m;
      while ((m = re.exec(line))) {
        if (m[1]) out.push({ t: m[1], hit: true, fix: m[2], why: m[3] });
        else if (m[4]) out.push({ t: m[4], hit: false, trap: true });
        else out.push({ t: m[5], hit: false });
      }
      return out;
    });
  }
  var strip = function (s) { return s.replace(/[.?!]$/, ''); };

  /* 풀이 = 까닭마다 「고칠 곳」 → 「바른 꼴」 (까닭 순서 = 글에 처음 나온 순서) */
  function explainOf(lines) {
    var hits = [].concat.apply([], lines).filter(function (t) { return t.hit; });
    var order = [];
    hits.forEach(function (t) { if (order.indexOf(t.why) < 0) order.push(t.why); });
    return order.map(function (w) {
      return WHY[w] + ': ' + hits.filter(function (t) { return t.why === w; })
        .map(function (t) { return '「' + strip(t.t) + '」 → 「' + strip(t.fix) + '」'; }).join(' · ');
    }).join(' / ');
  }

  function build(row, id) {
    var lines = parse(row[4]);
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) { tokens.push({ t: t.t, hit: !!t.hit }); });
    });
    var hits = [].concat.apply([], lines).filter(function (t) { return t.hit; });
    return { id: id, l: row[0], icon: row[2], src: row[3], type: row[1],
             prompt: row[2] + ' ' + PROMPT, lines: lines, tokens: tokens,
             answer: hits.map(function (t) { return t.t; }), fix: hits.map(function (t) { return t.fix; }),
             why: hits.map(function (t) { return t.why; }), explain: explainOf(lines) };
  }

  function pool(upto) {
    var lim = upto && upto !== 'all' && ORDER.indexOf(upto) >= 0 ? ORDER.indexOf(upto) : ORDER.length - 1;
    return T.map(function (t, k) { return k; }).filter(function (k) { return ORDER.indexOf(T[k][0]) <= lim; });
  }

  return {
    id: 'hon_hunt',
    title: '높임 표현 고칠 곳 찾기',
    T: T, ORDER: ORDER, WHY: WHY, PROMPT: PROMPT,
    parse: parse, pool: pool,
    create: function (params, rng) {
      var idx = pool(params && params.upto);
      var deck = shuffle(rng, idx), last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 글이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], 'ho' + k + '_' + (n++));
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
    printHead: '글을 읽고 높임 표현을 고쳐야 할 곳에 모두 ○를 하고 바르게 고쳐 쓰세요.'
  };
}));
