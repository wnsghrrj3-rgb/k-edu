/* gens/korean/dict_order.js — 사전에 먼저 실리는 낱말은? (3학년 2학기 국어 5단원 「사전으로 여는 세상」 l08 · l12 · l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)의 일곱째 실물 — 엔진 무개변, 생성기만 새로.
 * 차례의 원천 = 정본 l08 s04 「첫 자음자 → 모음자 → 받침 · 첫 글자가 같으면 다음 글자」 · s05 자음자 열아홉 · s06 모음자 스물하나 · s07 「받침 없는 글자가 먼저」.
 *   정본 판 그대로: l08 s05 나비·다리·손 · s06·s10 바람·보람 · s07·s12 도전 다리·달·담 · s11·s15 모래밭·모래알 · s12 기본 가방·나비·다리
 *                  l12 s15 남짓 → 비탈 → 어귀 → 여닫이 · l14 s12 도전 북돋우다 → 아우르다 → 여미다.
 * 카드 = 낱말 하나(기본형 — 정본 l08 s08 「사전에는 기본형만」). 바른 차례 = 사전 차례(유니코드 한글 음절 차례와 같다 — 스모크가 문자열 견주기로 검산).
 * type(문항 단위 · 진단 축 = 무엇까지 보아야 차례가 서는가):
 *   first_cons  첫 글자 첫 자음자만 — 정본 s05 watch 「쌍자음자를 빼고」(ㄲ·ㄸ·ㅃ·ㅆ·ㅉ 판) · s15 「ㅇ은 맨 앞」(ㅇ이 ㅅ 다음) · s03 watch 「글자 수 차례」(짧은 낱말이 뒤)
 *   vowel       첫 자음자가 같아 모음자까지 — 정본 s06 watch 「ㅐ·ㅒ를 빼고」(ㅐ 판) · l12 s15 watch 「ㅓ와 ㅕ」
 *   final       첫 자음자·모음자가 같아 받침까지 — 정본 s07 watch 「받침 있는 쪽이 먼저」 → 판마다 받침 없는 글자가 맨 앞
 *   next_syll   첫 글자가 같아 다음 글자까지 — 정본 s11·s15(모래밭 → 모래알 · ㅇ 덫) · s17 「두 번째 글자도 같으면 세 번째 글자」
 * 판마다 카드 3~4장 · 한 판 안에 앞 낱말이 뒤 낱말의 앞부분인 짝 0 · 처음부터 맞게 놓인 판 0 · 같은 판 연달아 0 · 낱말이 겹치는 판 연달아 0.
 * params: { upto: 'l08'|'l12'|'all' }  l08 = 9차시까지 · l12 = 13차시까지 · all = 14차시(단원 전체)
 * 낱말 앞당김 0(남짓·머리 l10 · 먼지 l12 · 감·나이·오이·한여름 l14 — 그 범위에서만). 낱말 종류 칸(word_kind)·바뀌지 않는 부분(l04) 0 · 차단 어휘 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['dict_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l08', 'l12', 'l14'];
  var CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
  var JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
  var JONG = [''].concat('ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'.split(''));

  /* [차시, type, 바른 차례(사전 차례)] */
  var S = [
    // l08 — 첫 자음자만 (s05 · s12 기본 · 쌍자음자 · ㅇ · 글자 수)
    ['l08', 'first_cons', ['가방', '나비', '다리']],
    ['l08', 'first_cons', ['나비', '다리', '손']],
    ['l08', 'first_cons', ['고래', '꼬리', '나무']],
    ['l08', 'first_cons', ['다리', '딸기', '라면', '모래밭']],
    ['l08', 'first_cons', ['바구니', '빵', '사과']],
    ['l08', 'first_cons', ['손', '쌀', '어귀']],
    ['l08', 'first_cons', ['사물함', '어귀', '자두']],
    ['l08', 'first_cons', ['자두', '짝', '참새']],
    ['l08', 'first_cons', ['코', '토끼', '포도', '하늘']],
    ['l08', 'first_cons', ['계단', '물통', '비탈', '손잡이']],
    ['l08', 'first_cons', ['김', '다람쥐', '빗자루']],
    ['l08', 'first_cons', ['뚜껑', '마음', '우산', '하늘']],
    // l08 — 모음자까지 (s06 · s10 · ㅐ)
    ['l08', 'vowel', ['바람', '보람', '비탈']],
    ['l08', 'vowel', ['가방', '개미', '거미', '고래']],
    ['l08', 'vowel', ['나비', '노래', '누나']],
    ['l08', 'vowel', ['다리', '도토리', '두드리다']],
    ['l08', 'vowel', ['마음', '메뚜기', '모래밭', '묵직하다']],
    ['l08', 'vowel', ['사과', '새', '손', '심다']],
    ['l08', 'vowel', ['어귀', '여닫다', '오리', '우산']],
    ['l08', 'vowel', ['자두', '접다', '집다']],
    ['l08', 'vowel', ['하늘', '호박', '환하다']],
    ['l08', 'vowel', ['개미', '계단', '고래']],
    ['l08', 'vowel', ['마음', '매끈하다', '물통']],
    // l08 — 받침까지 (s07 · s12 도전 · 받침 없는 글자가 먼저)
    ['l08', 'final', ['다리', '달', '담']],
    ['l08', 'final', ['다리', '단추', '달', '담']],
    ['l08', 'final', ['바구니', '박', '반', '밤']],
    ['l08', 'final', ['사과', '산', '살', '상']],
    ['l08', 'final', ['가위', '갈매기', '강']],
    ['l08', 'final', ['기차', '길', '김']],
    ['l08', 'final', ['고래', '곰', '공']],
    ['l08', 'final', ['소', '손', '솜']],
    ['l08', 'final', ['비누', '빗자루', '빛']],
    ['l08', 'final', ['마음', '말', '맛']],
    ['l08', 'final', ['나비', '낙타', '날개']],
    // l08 — 다음 글자까지 (s11 · s15 ㅇ 덫 · s17)
    ['l08', 'next_syll', ['모기', '모래밭', '모래알']],
    ['l08', 'next_syll', ['바구니', '바다', '바람', '바위']],
    ['l08', 'next_syll', ['사과', '사물함', '사자']],
    ['l08', 'next_syll', ['손뼉', '손잡이', '손톱']],
    ['l08', 'next_syll', ['비누', '비둘기', '비탈']],
    ['l08', 'next_syll', ['다람쥐', '다리', '다발']],
    ['l08', 'next_syll', ['물감', '물개', '물통']],
    ['l08', 'next_syll', ['가방', '가시', '가위']],
    ['l08', 'next_syll', ['나라', '나무', '나비']],
    ['l08', 'next_syll', ['고구마', '고래', '고양이']],
    ['l08', 'next_syll', ['아기', '아빠', '아이']],
    // l12 — 내 낱말 공책 사전 차례 (s13 · s15 정본 판)
    ['l12', 'vowel', ['남짓', '비탈', '어귀', '여닫이']],
    ['l12', 'vowel', ['먼지', '모래밭', '물통']],
    ['l12', 'final', ['나비', '남짓', '노래']],
    ['l12', 'final', ['머리', '먼지', '멍게']],
    // l14 — 단원 정리 (s12 도전 정본 판 · s07 낱말)
    ['l14', 'vowel', ['북돋우다', '아우르다', '여미다']],
    ['l14', 'vowel', ['나이', '논일', '눈인사']],
    ['l14', 'vowel', ['아우르다', '여미다', '오이']],
    ['l14', 'final', ['하늘', '한여름', '할머니']],
    ['l14', 'next_syll', ['오리', '오이', '오징어']],
    ['l14', 'next_syll', ['눈사람', '눈썹', '눈인사']]
  ];

  var PROMPT = '사전에 먼저 실리는 낱말부터 놓아요';
  var PART = { L: '첫 자음자', V: '모음자', T: '받침' };
  var PART_O = { L: '첫 자음자를', V: '모음자를', T: '받침을' };
  var SYL = ['첫 글자', '두 번째 글자', '세 번째 글자', '네 번째 글자'];

  function jamo(ch) {
    var c = ch.charCodeAt(0) - 0xAC00;
    return { L: CHO[Math.floor(c / 588)], V: JUNG[Math.floor((c % 588) / 28)], T: JONG[c % 28] };
  }
  /* 두 낱말의 차례가 갈리는 자리 — { i: 글자 자리, p: 'L'|'V'|'T', a, b } (앞부분 짝은 null) */
  function diff(a, b) {
    for (var i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) continue;
      var x = jamo(a[i]), y = jamo(b[i]);
      var p = x.L !== y.L ? 'L' : x.V !== y.V ? 'V' : 'T';
      return { i: i, p: p, a: x[p], b: y[p] };
    }
    return null;
  }
  function jl(s) { return s === '' ? '없음' : s; }
  function bat(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c < 11172 && c % 28 !== 0; }   // 끝 글자 받침
  function wa(w) { return '「' + w + '」' + (bat(w) ? '과' : '와'); }
  function eun(w) { return '「' + w + '」' + (bat(w) ? '은' : '는'); }
  function ro(j) { return j + (j === 'ㄹ' ? '로' : '으로'); }   // 자음자 이름(기역·니은 …)은 ㄹ(리을)만 받침 ㄹ

  function explainOf(w) {
    var ds = [];
    for (var k = 1; k < w.length; k++) ds.push(diff(w[k - 1], w[k]));
    var same = ds.every(function (d) { return d.i === ds[0].i && d.p === ds[0].p; });
    var body;
    if (same) {
      var d0 = ds[0], chain = [jl(d0.a)].concat(ds.map(function (d) { return jl(d.b); }));
      var lead = '';
      if (d0.i > 0) lead = '「' + w[0].slice(0, d0.i) + '」까지 같아요. ';
      else if (d0.p === 'V') lead = '첫 자음자가 ' + ro(jamo(w[0][0]).L) + ' 같아요. ';
      else if (d0.p === 'T') lead = '첫 자음자와 모음자가 같아요. ';
      body = lead + SYL[d0.i] + '의 ' + PART_O[d0.p] + ' 봐요: ' + chain.join(' → ') + '.';
    } else {
      body = ds.map(function (d, k) {
        return wa(w[k]) + ' ' + eun(w[k + 1]) + ' ' + SYL[d.i] + '의 ' + PART[d.p] + '(' + jl(d.a) + ' → ' + jl(d.b) + ')';
      }).join(' · ') + '.';
    }
    var tip = [];
    if (ds.some(function (d) { return d.p === 'T'; })) tip.push('받침이 없는 글자가 먼저예요.');
    if (ds.some(function (d) { return d.p === 'L' && /[ㄲㄸㅃㅆㅉ]/.test(d.b); })) tip.push('ㄲ · ㄸ · ㅃ · ㅆ · ㅉ은 짝이 되는 자음자 바로 다음이에요.');
    if (ds.some(function (d) { return d.p === 'L' && d.b === 'ㅇ'; })) tip.push('ㅇ은 소리가 없어도 맨 앞이 아니에요 — 자음자 차례에서 ㅅ · ㅆ 다음이에요.');
    if (ds.some(function (d) { return d.i > 0; })) tip.push('첫 글자가 같으면 다음 글자를 같은 방법으로 봐요.');
    return w.join(' → ') + '. ' + body + (tip.length ? ' ' + tip.join(' ') : '');
  }

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function build(k, n, rng) {
    var row = S[k], w = row[2];
    var idx = w.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'do' + k + '_' + n, l: row[0], type: row[1], icon: '📖', prompt: PROMPT,
             cards: perm.map(function (j) { return { t: w[j] }; }), order: order, answer: order.join(','), layout: 'col',
             words: w.slice(), explain: explainOf(w) };
  }

  function pool(upto) {
    var lim = upto === 'l08' ? 1 : upto === 'l12' ? 2 : 3;
    var out = [];
    S.forEach(function (r, k) { if (ORDER.indexOf(r[0]) < lim) out.push(k); });
    return out;
  }
  function overlap(a, b) { return a != null && b != null && S[a][2].some(function (x) { return S[b][2].indexOf(x) >= 0; }); }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'dict_order',
    title: '사전에 먼저 실리는 낱말은?',
    S: S, ORDER: ORDER, CHO: CHO, JUNG: JUNG, JONG: JONG,
    jamo: jamo, diff: diff, explainOf: explainOf, pool: pool,
    create: function (params, rng) {
      var idx = pool((params && params.upto) || 'all');
      var deck = [], last = null, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = 0;
          while (at < deck.length && (deck[at] === last || overlap(deck[at], last))) at++;   // 같은 판·낱말 겹치는 판 연달아 0
          if (at === deck.length) {                                                           // 남은 판이 다 겹치면 새 판 묶음에서
            var fresh = shuffle(rng, idx).filter(function (k) { return deck.indexOf(k) < 0 && k !== last && !overlap(k, last); });
            if (fresh.length) { deck.unshift(fresh[0]); at = 0; } else at = 0;
          }
          var k = deck.splice(at, 1)[0]; last = k;
          return build(k, n++, rng);
        },
        check: function (pick, q) { return String(pick) === String(q.answer); }
      };
    },
    printRender: function (q) {
      return q.icon + ' ' + q.prompt + '<br>' + q.cards.map(function (c, k) { return MARK[k] + ' ' + c.t; }).join('<br>') +
        '<br>' + q.order.map(function () { return '(　　)'; }).join(' → ');
    },
    printAnswer: function (q) { return q.order.map(function (k) { return MARK[k]; }).join(' → '); },
    printHead: '사전에 실리는 차례대로 기호를 써 보세요. (왼쪽이 먼저)'
  };
}));
