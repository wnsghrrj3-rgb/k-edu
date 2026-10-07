/* gens/korean/pause_spot.js — 쐐기표 자리 찾기 (3학년 1학기 국어 2단원 「분명하고 유창하게」 l05·l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 자리 토큰)가 쓴다 — 글 조각은 fixed(누를 수 없음), 누르는 것은 자리뿐.
 * params: { upto: 'l05'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 문장이 덱 앞머리
 * next() → { prompt, icon, tokens:[{t, fixed:true} | {t:'', gap:true, m:'v1'|'v2', hit}], hit(토큰 번호), answer, type, explain, l }
 *
 * 정본 l05: 쐐기표 ∨ = 누가/무엇이 다음에 조금 쉬기 · 겹쐐기표 ∨∨ = 문장이 끝나는 곳에서 조금 더 쉬기.
 * 오개념 두 축(정본 l05 s08·s15)이 곧 덫이다:
 *   ① ∨를 아무 곳에나 → 낱말 가운데 가르기(사람 ∨ 들은 · 명절 ∨ 입니다 · 둥급 ∨ 니다) = 낱말 속 자리
 *   ② ∨를 많이 둘수록 → 뒷부분 낱말 사이 자리
 * type(문항 단위 · 진단 축):
 *   pause_short  ∨ 자리 — 두 낱말 문장 (덫 = 낱말 속 자리만 · 축 ①)
 *   pause_long   ∨ 자리 — 뒷부분이 두 낱말 이상 (덫 = 뒷부분 사이 · 축 ②)
 *   pause_who2   ∨ 자리 — 앞부분이 두 낱말 (덫 = 앞부분 가운데 「우리 ∨ 엄마는」)
 *   end_pause    ∨∨ 자리 — 두 문장을 이어 놓고 문장이 끝나는 곳 (덫 = 각 문장의 ∨ 자리 · ∨와 ∨∨ 혼동)
 * 정답 자리는 늘 하나. 자리 토큰은 모두 같은 모습(판정 전 표지 0) — hit 은 생성기 안에만.
 * 문장 = 정본 l02·l05(단오)·l14 그대로 + 같은 꼴 자체 구성. 앞/뒷부분은 「/」, 낱말 속 가를 자리는 「|」(정본 오답 꼴 그대로: 명사|조사 · 줄기|끝).
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['pause_spot'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l05', 'l14'];
  var PROMPT = {
    v1: '∨(조금 쉬기)를 둘 곳을 눌러요',
    v2: '∨∨(조금 더 쉬기)를 둘 곳을 눌러요'
  };

  /* [차시, 문장] — l05 = 정본 l05 단오 문장 + 정본 l02 문장(l05 에서 처음 ∨ 를 두므로 l05 에 묶음) */
  var S = [
    ['l05', '사람|들은/그네|를 탑|니다.'], ['l05', '아이|들이/씨름|을 합|니다.'], ['l05', '누나|가/창포물|에 머리|를 감습|니다.'],
    ['l05', '수리취떡|은/둥급|니다.'], ['l05', '창포물|이/향기롭|습니다.'], ['l05', '단오|는/명절|입니다.'],
    ['l05', '단오|는/즐거운 명절|입니다.'], ['l05', '아이|들이/그네|를 탑|니다.'], ['l05', '수리취떡|은/단오 떡|입니다.'],
    ['l05', '사람|들은/씨름|을 합|니다.'], ['l05', '나|는/그네|를 탑|니다.'],
    ['l05', '콩이|가/짖습|니다.'], ['l05', '콩이|는/귀엽습|니다.'], ['l05', '꽃|이/예쁩|니다.'], ['l05', '바다|가/넓습|니다.'],
    ['l05', '얼음|이/차갑습|니다.'], ['l05', '교실|이/조용합|니다.'],
    ['l05', '동생|이/우유|를 마십|니다.'], ['l05', '강아지|가/꼬리|를 흔듭|니다.'], ['l05', '민주|는/3학년 학생|입니다.'],
    ['l05', '고래|는/바다 동물|입니다.'], ['l05', '고양이|가/잠|을 잡|니다.'], ['l05', '민주|가/책|을 읽습|니다.'],
    ['l05', '우리 엄마|는/선생님|입니다.'], ['l05', '단오 잔치|는/즐겁습|니다.'], ['l05', '우리 누나|는/창포물|에 머리|를 감습|니다.'],
    ['l05', '마을 사람|들은/그네|를 탑|니다.'], ['l05', '옆집 콩이|는/귀엽습|니다.'], ['l05', '우리 동생|이/우유|를 마십|니다.'],
    // l14 단원 마무리(정본 l14 s09·s11)
    ['l14', '새|가/노래합|니다.'], ['l14', '하늘|이/맑습|니다.'], ['l14', '그|는/화가|입니다.'], ['l14', '그|는/농부|입니다.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 문장 → { who:[낱말…], tail:[낱말…] } · 낱말 = ['사람','들은'] 처럼 가를 자리로 나눈 조각 */
  function parse(s) {
    var p = s.split('/');
    function words(x) { return x.split(' ').map(function (w) { return w.split('|'); }); }
    return { who: words(p[0]), tail: words(p[1]) };
  }
  function plain(w) { return w.join(''); }
  function sentText(P) { return P.who.concat(P.tail).map(plain).join(' '); }
  function whoText(P) { return P.who.map(plain).join(' '); }
  function typeOf(P) { return P.who.length > 1 ? 'pause_who2' : (P.tail.length > 1 ? 'pause_long' : 'pause_short'); }
  function marked(P) { return whoText(P) + ' ∨ ' + P.tail.map(plain).join(' '); }

  /* 한 문장의 자리 토큰 — 낱말 사이 자리는 전부, 낱말 속 자리는 k 개(무작위) */
  function sentTokens(P, kIn, rng) {
    var W = P.who.concat(P.tail), nWho = P.who.length;
    var inner = [];
    W.forEach(function (w, wi) { if (w.length > 1) inner.push(wi); });
    var pick = shuffle(rng, inner).slice(0, kIn);
    var out = [];
    W.forEach(function (w, wi) {
      if (pick.indexOf(wi) >= 0) { out.push({ t: w[0], fixed: true }); out.push({ gap: true, why: 'in' }); out.push({ t: w.slice(1).join(''), fixed: true }); }
      else out.push({ t: plain(w), fixed: true });
      if (wi < W.length - 1) out.push({ gap: true, why: wi === nWho - 1 ? 'who' : (wi < nWho - 1 ? 'whoin' : 'tail') });
    });
    return out;
  }
  function merge(toks) {   // 이웃한 글 조각을 하나로(자리 없는 곳은 띄어쓰기 그대로)
    var out = [];
    toks.forEach(function (t) {
      var prev = out[out.length - 1];
      if (t.fixed && prev && prev.fixed) prev.t += t.sp ? ' ' + t.t : t.t;
      else out.push(t);
    });
    return out;
  }

  function finish(q, toks, m) {
    var hit = -1;
    q.tokens = toks.map(function (t, k) {
      if (t.fixed) return { t: t.t, fixed: true };
      if (t.hitMe) hit = k;
      return { t: '', gap: true, m: m, hit: !!t.hitMe };
    });
    q.hit = hit;
    return q;
  }

  function buildSingle(k, rng, id) {
    var P = parse(S[k][1]), type = typeOf(P);
    var kIn = type === 'pause_short' ? 2 : 1;
    var toks = sentTokens(P, kIn, rng);
    toks.forEach(function (t) { if (t.gap && t.why === 'who') t.hitMe = true; });
    var w = whoText(P), tip;
    if (type === 'pause_short') tip = '낱말 가운데를 가르면 뜻이 무너져요.';
    else if (type === 'pause_long') tip = '뒷부분 안에서 자꾸 끊으면 뜻이 이어지지 않아요.';
    else tip = '「' + w + '」까지가 한 덩이예요. 「' + plain(P.who[0]) + '」에서 끊지 않아요.';
    var q = { id: id, l: S[k][0], type: type, icon: '⏸️', prompt: PROMPT.v1, sent: sentText(P),
              answer: marked(P),
              explain: '「' + w + '」(누가/무엇이) 다음에 ∨ — ' + marked(P) + ' ' + tip };
    return finish(q, toks, 'v1');
  }

  function buildEnd(a, b, rng, id) {
    var A = parse(S[a][1]), B = parse(S[b][1]);
    // 자리 = A 의 ∨ 자리 · A 끝(정답) · B 의 ∨ 자리 · 낱말 속 하나(A 나 B 뒷부분) — 나머지 낱말 사이는 띄어쓰기 그대로
    function part(P, inWord) {
      var W = P.who.concat(P.tail), nWho = P.who.length, out = [];
      W.forEach(function (w, wi) {
        if (wi === inWord) { out.push({ t: w[0], fixed: true, sp: wi > 0 && wi !== nWho }); out.push({ gap: true }); out.push({ t: w.slice(1).join(''), fixed: true }); }
        else out.push({ t: plain(w), fixed: true, sp: wi > 0 && wi !== nWho });
        if (wi === nWho - 1) out.push({ gap: true });
      });
      return out;
    }
    function innerOf(P) { var r = []; P.tail.forEach(function (w, j) { if (w.length > 1) r.push(P.who.length + j); }); return r; }
    var useA = rng() < 0.5, PA = innerOf(A), PB = innerOf(B);
    if (!PA.length) useA = false; if (!PB.length) useA = true;
    var src = useA ? PA : PB, iw = src[Math.floor(rng() * src.length)];
    var ta = part(A, useA ? iw : -1), tb = part(B, useA ? -1 : iw);
    var toks = merge(ta.concat([{ gap: true, hitMe: true }], tb));
    var sa = sentText(A), sb = sentText(B);
    var q = { id: id, l: ORDER.indexOf(S[a][0]) >= ORDER.indexOf(S[b][0]) ? S[a][0] : S[b][0], type: 'end_pause', icon: '⏹️',
              prompt: PROMPT.v2, sent: sa + ' ' + sb, answer: sa + ' ∨∨ ' + sb,
              explain: '첫 문장이 끝나는 곳(「' + plain(A.tail[A.tail.length - 1]) + '」 뒤)에 ∨∨ — ' + marked(A) + ' ∨∨ ' + marked(B) + ' ∨∨ ' +
                       '누가/무엇이 다음은 ∨(조금 쉬기), 문장 끝은 ∨∨(조금 더 쉬기)예요.' };
    return finish(q, toks, 'v2');
  }

  var MARK = '㉠㉡㉢㉣㉤㉥㉦'.split('');

  return {
    id: 'pause_spot',
    title: '쐐기표 자리 찾기',
    S: S,
    ORDER: ORDER,
    PROMPT: PROMPT,
    parse: parse,
    typeOf: typeOf,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return S[k][0] === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, lastType = '', run = 0, n = 0;
      function take() {
        if (!deck.length) { deck = shuffle(rng, idx); if (deck.length > 1 && deck[0] === last) deck.push(deck.shift()); }
        // 같은 유형 세 번 넘게 잇따름 0(규칙성이 답을 주지 않게)
        for (var pass = 0; pass < 2; pass++) {
          for (var t = 0; t < deck.length; t++) {
            var ty = typeOf(parse(S[deck[t]][1]));
            if (deck[t] !== last && !(run >= 2 && ty === lastType)) return deck.splice(t, 1)[0];
          }
          deck = deck.concat(shuffle(rng, idx));   // 남은 덱이 한 유형뿐이면 다음 바퀴를 미리 붙여 고른다
        }
        return deck.shift();
      }
      return {
        size: idx.length,
        next: function () {
          var id = 'ps' + (n++), q;
          if (n > 1 && lastType !== 'end_pause' && rng() < 0.25) {
            var a = take(), b = take(); if (b === a) b = take();
            q = buildEnd(a, b, rng, id); last = b;
          } else {
            var k = take(); q = buildSingle(k, rng, id); last = k;
          }
          run = q.type === lastType ? run + 1 : 1; lastType = q.type;
          return q;
        },
        check: function (pick, q2) { return Number(pick) === q2.hit; }
      };
    },
    printRender: function (q2) {
      var m = 0;
      return q2.icon + ' ' + q2.prompt + '<br>' + q2.tokens.map(function (t) { return t.gap ? ' ' + MARK[m++] + ' ' : t.t; }).join('');
    },
    printAnswer: function (q2) {
      var m = 0, a = '';
      q2.tokens.forEach(function (t) { if (t.gap) { if (t.hit) a = MARK[m]; m++; } });
      return a + ' ' + q2.answer;
    },
    printHead: '알맞은 곳의 기호에 ○를 하세요. ∨는 조금 쉬기, ∨∨는 조금 더 쉬기예요.'
  };
}));
