/* gens/korean/g1_2_pause_fix.js — 어색하게 띄어 읽은 곳 찾기 (1학년 2학기 국어 6단원 「문장을 읽고 써요」 l08 · l13 · l15 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 자리 토큰 — 엔진 v1.1.0 fixed)가 쓴다.
 * 근거 = 지도서(국어 1-2 ㉯ 6단원) 254~257쪽: 『국어』 191~193쪽 「소방관의 부탁」 — 192쪽 3번 첫 번째·두 번째 띄어 읽기
 *   (「불이 나면∨모두의 안전을 위해∨건물에서∨멀리 떨어진 곳으로∨대피해야 합니다.」) · 193쪽 4번 예시 답안 ∨ 자리 ·
 *   지도서 255쪽 동기 유발 ㉯(「소화전 근처에는∨주차하면 안 됩니다.∨소방관은∨불이 났을 때∨소화전에∨호스를 연결해서∨물을 얻는답니다.」) ·
 *   지도서 257쪽 『국어활동』 64~65쪽 ㉮㉯㉰(개·기린·개구리의 혀) · 208~209쪽 실천 「목소리 연극」(공작새와 꾀꼬리 대본 — 정본 l13 s04 의 짧은 줄만).
 *   지도서 254쪽 「학생들은 의미 단위를 무시하여 띄어 읽는 경향 … 하나의 낱말 안에서 띄어 읽기도 한다」 · 245쪽 유의 사항 ❺❻
 *   「띄어 읽기는 여러 지점에서 가능 — 한 가지 정답보다 다양한 방식」 → 이 판은 바른 ∨ 자리를 하나로 묻지 않는다.
 *   여러 ∨ 가운데 「낱말 안에서 끊은」 하나만 찾는다(정본 data/g1s2_korean_u6.js l08 기본③ 「신고가 들∨어오면 소방∨관은」 ·
 *   l13 기본② 「제 모∨습에서 … 예뻐∨지고」가 바로 그 꼴).
 * 판 = 문장 하나 + 친구가 해 둔 ∨ 여럿(지도서 예시의 바른 자리) + 낱말 안에 잘못 든 ∨ 하나. 글자는 누를 수 없고(fixed) ∨만 누른다.
 *   ∨ 는 모두 같은 모습(판정 전 표지 0) — hit 은 생성기 안에만.
 * type(문항 단위 · 진단 축 — 어디를 갈랐나):
 *   word_mid   한 낱말 가운데를 가름 — 소방∨관은 · 건∨물에서 · 들∨어오면 (글자마다 끊어 읽기)
 *   word_tail  낱말 끝에 붙은 말을 뗌 — 전화∨를 · 사람들∨에게 · 됩∨니다 (띄어 쓰지 않은 곳에서 쉬기)
 * params: { upto: 'l08'|'all' }  l08 = 9차시까지(소방관·『국어활동』) · all = 단원 전체(l13 목소리 연극·l15 마무리) · 이번 차시 문장이 덱 앞머리
 * next() → { prompt, icon, sent, tokens:[{t, fixed} | {t:'∨', hit}], answer, type, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g1_2_pause_fix'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l08', 'l13'];
  var PROMPT = '친구가 ∨에서 쉬어 읽었어요. 어색하게 끊어 읽은 ∨ 하나를 찾아 눌러요';

  /* [차시, 문장(「/」 = 친구의 바른 ∨ · 띄어쓰기 자리에만), 잘못 들 수 있는 곳 [유형, 「|」로 가른 어절]…, 근거] */
  var S = [
    ['l08', '첫째,/소방서에 장난 전화를 하면/안 됩니다.', [['word_mid', '소방|서에'], ['word_tail', '전화|를'], ['word_tail', '됩|니다.']], '국어 193쪽 4번'],
    ['l08', '신고가 들어오면/소방관은/바로 출동해야 합니다.', [['word_mid', '들|어오면'], ['word_mid', '소방|관은'], ['word_tail', '신고|가']], '정본 l08 기본③'],
    ['l08', '그런데 만약/그 전화가 장난이라면/정말 도움이 필요한 다른 사람들에게/소방관이 갈 수 없게 됩니다.', [['word_mid', '장|난이라면'], ['word_tail', '사람들|에게'], ['word_tail', '전화|가']], '국어 193쪽 4번'],
    ['l08', '소화전 근처에는/주차하면 안 됩니다.', [['word_mid', '소화|전'], ['word_tail', '근처|에는'], ['word_tail', '주차하|면']], '지도서 255쪽 ㉯'],
    ['l08', '불이 나면/모두의 안전을 위해/건물에서/멀리 떨어진 곳으로/대피해야 합니다.', [['word_mid', '건|물에서'], ['word_mid', '대|피해야'], ['word_tail', '안전|을'], ['word_tail', '나|면']], '국어 192쪽 3번'],
    ['l08', '소방관은/불이 났을 때/소화전에/호스를 연결해서/물을 얻는답니다.', [['word_mid', '연|결해서'], ['word_tail', '호스|를'], ['word_tail', '소화전|에']], '지도서 255쪽 ㉯'],
    ['l08', '셋째,/불이 난 곳 근처에서/구경하지 말고/빠르게 대피해야 합니다.', [['word_mid', '구|경하지'], ['word_tail', '근처|에서'], ['word_tail', '합|니다.']], '정본 l08 생각을 넓혀요'],
    ['l08', '개는/혀로/더위를 식힙니다.', [['word_mid', '더|위를'], ['word_tail', '더위|를'], ['word_tail', '식힙|니다.']], '국어활동 64~65쪽 ㉮'],
    ['l08', '기린은/혀로/얼굴에 붙은 벌레를/떼어 냅니다.', [['word_mid', '벌|레를'], ['word_tail', '기린|은'], ['word_tail', '얼굴|에']], '국어활동 64~65쪽 ㉯'],
    ['l08', '개구리는/혀로/날아다니는 벌레를/잡아먹습니다.', [['word_mid', '개|구리는'], ['word_mid', '날아|다니는'], ['word_tail', '벌레|를']], '국어활동 64~65쪽 ㉰'],
    ['l13', '그건 안 돼요./저는/지금 제 모습에서/목소리만 더 예뻐지고 싶은 거예요.', [['word_mid', '모|습에서'], ['word_mid', '예뻐|지고'], ['word_tail', '목소리|만']], '정본 l13 기본②'],
    ['l13', '공작새는/꾀꼬리의 아름다운 목소리를/부러워했어요.', [['word_mid', '꾀|꼬리의'], ['word_mid', '아름|다운'], ['word_tail', '목소리|를']], '정본 l13 대본'],
    ['l13', '공작새야,/너에게는/아름다운 깃털이 있잖아.', [['word_mid', '깃|털이'], ['word_tail', '깃털|이'], ['word_tail', '너|에게는']], '정본 l13 대본']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function plain(s) { return s.replace(/\//g, ' '); }
  function bare(w) { return w.replace(/[.,!?]+$/, ''); }
  function eun(w) { var c = bare(w).charCodeAt(bare(w).length - 1) - 0xAC00; return bare(w) + ((c >= 0 && c <= 11171 && c % 28) ? '」은' : '」는'); }   // 받침 따라 은/는

  /* 문장 + 잘못 든 ∨ 하나 → 토큰. 어절마다 fixed 하나(뒤에 띄어쓰기가 있으면 끝에 빈칸 하나), ∨ 는 자리 토큰 */
  function tokensOf(sent, wrong) {
    var bad = wrong.replace('|', ''), cut = wrong.indexOf('|');
    var out = [];
    var chunks = sent.split('/');
    chunks.forEach(function (ch, ci) {
      var words = ch.split(' ');
      words.forEach(function (w, wi) {
        var lastInChunk = wi === words.length - 1;
        var tail = lastInChunk ? '' : ' ';
        if (w === bad) {
          out.push({ t: w.slice(0, cut), fixed: true });
          out.push({ t: '∨', hit: true });
          out.push({ t: w.slice(cut) + tail, fixed: true });
        } else out.push({ t: w + tail, fixed: true });
      });
      if (ci < chunks.length - 1) out.push({ t: '∨', hit: false });
    });
    return out;
  }

  function build(s, wi, id) {
    var w = s[2][wi], type = w[0], word = w[1].replace('|', ''), shown = w[1].replace('|', '∨');
    var tip = type === 'word_mid'
      ? '「' + eun(word) + ' 한 낱말이에요. 「' + bare(shown) + '」처럼 낱말 가운데에서 끊으면 뜻이 무너져요.'
      : '「' + bare(word) + '」의 「' + eun(w[1].split('|')[1]) + ' 앞말에 붙어 있어요. 「' + bare(shown) + '」처럼 떼어 끊지 않아요.';
    return { id: id, l: s[0], type: type, icon: '📖', prompt: PROMPT, sent: plain(s[1]), src: s[3],
             tokens: tokensOf(s[1], w[1]), answer: bare(shown),
             explain: tip + ' 다른 ∨는 뜻이 이어지는 덩어리 사이라 괜찮아요 — 쉬는 곳은 조금 달라도 뜻이 통하면 돼요.' };
  }

  return {
    id: 'g1_2_pause_fix',
    title: '어색하게 띄어 읽은 곳 찾기',
    S: S,
    ORDER: ORDER,
    PROMPT: PROMPT,
    tokensOf: tokensOf,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return S[k][0] === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, n = 0, lastType = '', run = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 문장 연달아 0
          }
          var k = deck.shift(); last = k;
          var ws = S[k][2].map(function (_, i) { return i; });
          // 같은 갈래(가운데·끝)가 세 번 잇따르지 않게 — 그 문장에 다른 갈래가 있으면 그쪽
          var other = ws.filter(function (i) { return S[k][2][i][0] !== lastType; });
          var pick = (run >= 1 && other.length) ? other[Math.floor(rng() * other.length)] : ws[Math.floor(rng() * ws.length)];
          var ty = S[k][2][pick][0]; run = ty === lastType ? run + 1 : 0; lastType = ty;
          return build(S[k], pick, 'pf' + (n++));
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      var k = 0, MARK = '㉠㉡㉢㉣㉤㉥㉦'.split('');
      return q.prompt + '<br>' + q.tokens.map(function (t) { return t.fixed ? t.t : '∨' + MARK[k++]; }).join('');
    },
    printAnswer: function (q) { var k = 0, MARK = '㉠㉡㉢㉣㉤㉥㉦'.split(''), a = ''; q.tokens.forEach(function (t) { if (!t.fixed) { if (t.hit) a = MARK[k]; k++; } }); return a + ' (' + q.answer + ')'; },
    printHead: '친구가 ∨에서 쉬어 읽었어요. 어색하게 끊어 읽은 ∨의 기호를 써 보세요.'
  };
}));
