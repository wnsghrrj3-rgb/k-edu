/* gens/korean/src_hunt.js — 출처 찾기 (3학년 2학기 국어 3단원 「정확하게 글을 써요」 l02 · l03 = 3·4차시 · l05 = 5·6차시 · l14 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 덩이 토큰)가 쓴다 — 토큰 하나 = 뜻 덩이 하나(출처는 늘 통째로 한 덩이).
 * params: { upto: 'l02'|'l03'|'l05'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 글이 덱 앞머리
 * next() → { prompt, icon, src, lines:[[tok…]…], tokens:[{t,hit} | {t:' ',sep:true}], answer:[출처…], type, explain, l }
 *
 * 출처의 원천 = 정본 l01 s05 · l02 s04~s06(「○○에 따르면」 문장 안 · 「■ 출처:」 그림 아래) · l05 s04·s08(표시 없어도 「○○을 보면」·「따르면」).
 *   찾을 덩이(정답) = 가져온 곳과 자료 이름이 통째로 든 덩이 — 정본 l02 s10 답 「「급식실 이용 안내」, 학교 누리집」처럼 있는 곳까지.
 *   다른 덩이에는 자료 이름·있는 곳이 0(출처가 둘로 갈려 읽히는 판 0).
 * 덫(문항 단위 · 진단 축 = type):
 *   src_byline  글 이름·신문 이름·글쓴이(「글 하선」) — 정본 l02 s08 오개념 「글쓴이 이름, 신문 이름도 출처」 · s10 오답 셋
 *   src_heard   들은 말(「어떤 형에게 들으니」·「누가 그러는데」) — 정본 l03 s05 「없음」 · s03 펭이 · s11
 *   src_nopic   아래가 빈 그림 — 정본 l03 ㉯ · l05 s05 상추 잎 그림 「적혀 있지 않음」(그 그림 바로 뒤에 「■ 출처:」가 오는 판 0)
 *   src_form    덫 없이 출처 꼴만 여럿(문장 안 · 그림 아래 · 「을 보면」) — 정본 l02 s06 「여러 곳에」 · l05 s08 「표시가 없어도」
 * 글 = 정본 l02 s04·s05 · l03 s04 · l05 s04·s05 문장 그대로 + 같은 꼴 자체 구성. 낱말은 정본 그 차시까지(복도·모퉁이 l03 · 텃밭·상추 l05).
 *   이어 주는 말(그리고·그러나·그래서 — l07 conn_sort 몫) · 차례 말(먼저·다음으로 — l09) · 지어낸 출처(l10) 0.
 * 표지 문법(이 파일 안): [출처] = 찾을 덩이 · {b:…} 글 이름·글쓴이 · {h:…} 들은 말 · {p:…} 출처 없는 그림 · | = 덩이 사이 · / = 줄 바꿈
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['src_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l02', 'l03', 'l05'];
  var PROMPT = '출처를 모두 찾아 눌러요';

  /* [차시, 아이콘, 글 이름, type, 글] */
  var T = [
    // ── l02 · 정본 s05 「급식실에서 지킬 것」(3학년 1반 학급 신문 · 글 하선) 그대로 · s04 글 ㉯ · l01 s05 딱지 · s15 급식실 앞 안내판
    ['l02', '📰', '급식실에서 지킬 것', 'src_byline',
      '{b:급식실에서 지킬 것} | {b:3학년 1반 학급 신문} | {b:글 하선} / [학교 누리집 「급식실 이용 안내」에 따르면,] | 급식실에 들어가기 전에는 | 손을 씻어야 한다고 합니다. / 🖼️ 손을 씻는 차례 그림 | [■ 출처: 「손 씻는 차례」, 보건실 안내장.]'],
    ['l02', '📰', '식판을 받을 때', 'src_byline',
      '{b:식판을 받을 때} | {b:3학년 1반 학급 신문} | {b:글 하선} / 식판을 받을 때에는 | 먹을 만큼만 받습니다. / 다 먹은 뒤에는 | 정해진 곳에 | 식판을 놓습니다. / [■ 출처: 「급식실 이용 안내」, 학교 누리집.]'],
    ['l02', '📰', '도서관 책 돌려주기', 'src_byline',
      '{b:도서관 책 돌려주기} | {b:글 펭이} / [도서관 앞 「이용 안내」에 따르면,] | 빌린 책은 | 정해진 날까지 | 돌려주어야 한다고 합니다.'],
    ['l02', '📰', '딱지 접는 법', 'src_byline',
      '{b:딱지 접는 법} | {b:3학년 1반 학급 신문} | {b:글 도영} / [「종이접기 첫걸음」 책에 따르면,] | 딱지는 | 네 번 접어요. / 색종이 두 장을 | 준비해요.'],
    ['l02', '📰', '급식실에서는 걸어요', 'src_byline',
      '{b:급식실에서는 걸어요} | {b:글 곰이} / 급식실에서는 | 뛰면 안 됩니다. / 식판을 들고 | 천천히 걸어요. / [■ 출처: 급식실 앞 안내판.]'],
    ['l02', '📰', '도서관에서 지킬 것', 'src_byline',
      '{b:도서관에서 지킬 것} | {b:3학년 1반 학급 신문} | {b:글 곰이} / 도서관에서는 | 작은 목소리로 말해요. / [■ 출처: 「이용 안내」, 도서관 앞.]'],
    ['l02', '📰', '손을 깨끗이', 'src_byline',
      '{b:손을 깨끗이} | {b:글 도영} / [보건실 안내장 「손 씻는 차례」에 따르면,] | 비누로 손을 | 꼼꼼히 씻어야 한다고 합니다. / 🖼️ 차례대로 줄을 선 그림 | [■ 출처: 「급식실 이용 안내」, 학교 누리집.]'],
    ['l02', '📄', '손 씻는 차례', 'src_form',
      '급식실에 가기 전에는 | 손을 씻어요. / [보건실 안내장 「손 씻는 차례」에 따르면,] | 비누를 묻혀 | 손을 비벼야 한다고 합니다. / 🖼️ 손을 씻는 차례 그림 | [■ 출처: 「손 씻는 차례」, 보건실 안내장.]'],
    // ── l03 · 정본 s04 「복도에서는 걸어 다녀요」 ㉮~㉱ 그대로(나누어 담음) · s03 펭이 「누가 그러는데」 · s07 계단
    ['l03', '🚶', '복도에서는 걸어 다녀요', 'src_heard',
      '복도에서는 | 걸어 다녀요. / {h:어떤 형에게 들으니} | 복도에서 부딪치는 일이 | 많다고 합니다. / [보건실 안내장 「다친 곳을 줄이려면」에 따르면,] | 부딪쳐서 다치는 일은 | 뛸 때 더 자주 생긴다고 합니다.'],
    ['l03', '🚶', '복도에서는 걸어 다녀요', 'src_nopic',
      '모퉁이에서는 | 앞이 잘 보이지 않습니다. / {p:🖼️ 복도에서 나란히 걸어가는 그림} / 🖼️ 오른쪽으로 걸어가는 그림 | [■ 출처: 「복도 통행 안내」, 학교 누리집.]'],
    ['l03', '🚶', '복도 이야기', 'src_heard',
      '{h:누가 그러는데} | 복도에서 부딪치는 일이 | 엄청 많대요. / [학교 누리집 「복도 통행 안내」에 따르면,] | 복도에서는 | 오른쪽으로 걸어야 합니다.'],
    ['l03', '🚶', '계단에서 지킬 것', 'src_heard',
      '계단에서는 | 한 칸씩 | 천천히 걸어요. / [■ 출처: 「복도 통행 안내」, 학교 누리집.] / {h:친구에게 들으니} | 계단에서 넘어지는 일도 | 많다고 합니다.'],
    ['l03', '🚶', '모퉁이에서는 천천히', 'src_nopic',
      '[보건실 안내장 「다친 곳을 줄이려면」에 따르면,] | 모퉁이에서는 | 천천히 걸어야 한다고 합니다. / {p:🖼️ 모퉁이를 도는 친구 그림} / 복도는 | 여러 반이 함께 쓰는 곳입니다.'],
    ['l03', '🚶', '복도에서 뛰면', 'src_heard',
      '{h:누가 그러는데} | 복도에서 뛰면 | 금방 다친대요. / [보건실 안내장 「다친 곳을 줄이려면」에 따르면,] | 부딪쳐서 다치는 일은 | 걸을 때보다 뛸 때 | 더 자주 생긴다고 합니다.'],
    ['l03', '🚶', '쉬는 시간 복도', 'src_heard',
      '{h:어떤 형에게 들으니} | 쉬는 시간에 | 복도가 가장 붐빈다고 합니다. / [학교 누리집 「복도 통행 안내」에 따르면,] | 복도에서는 | 나란히 걸어 다녀야 합니다.'],
    ['l03', '🚶', '복도 통행', 'src_nopic',
      '{p:🖼️ 줄지어 걷는 친구들 그림} / 복도는 | 여러 반이 함께 쓰는 곳입니다. / 🖼️ 걸어가는 방향을 나타낸 그림 | [■ 출처: 「복도 통행 안내」, 학교 누리집.]'],
    // ── l05 · 정본 s04·s05 「우리 학교 텃밭」 그대로(나누어 담음 — 표시 없는 글) · s12 심화 「학교 텃밭 가꾸기 안내」
    ['l05', '🌱', '우리 학교 텃밭', 'src_form',
      '우리 학교 운동장 옆에는 | 작은 텃밭이 있습니다. / [텃밭 앞에 서 있는 「텃밭 안내판」을 보면] | 어느 칸에 무엇을 심었는지 | 알 수 있습니다. / 봄에는 | 상추와 방울토마토를 | 심었습니다.'],
    ['l05', '🌱', '우리 학교 텃밭', 'src_form',
      '[교실 뒤에 붙여 둔 「물 주는 차례표」에 따르면,] | 우리 반은 | 목요일에 텃밭을 맡습니다. / 🖼️ 물뿌리개로 물을 주는 그림 | [■ 출처: 「물 주는 차례표」, 교실 뒤 게시판.]'],
    ['l05', '🌱', '우리 학교 텃밭', 'src_nopic',
      '상추는 | 잎을 뜯어 먹습니다. / {p:🖼️ 상추 잎을 뜯는 손 그림} / [학교 누리집 「학교 텃밭 가꾸기 안내」에 따르면,] | 방울토마토는 | 여름에 빨갛게 익습니다.'],
    ['l05', '🌱', '텃밭 가꾸기', 'src_nopic',
      '텃밭을 가꾸려면 | 물뿌리개와 모종삽을 | 마련해야 합니다. / {p:🖼️ 모종삽 그림} / [교실 뒤에 붙여 둔 「물 주는 차례표」에 따르면,] | 흙이 말랐을 때 | 물을 줍니다.'],
    ['l05', '🌱', '상추에 물 주기', 'src_heard',
      '{h:친구가 그러는데} | 상추는 | 날마다 물을 줘야 한대요. / [텃밭 앞 「텃밭 안내판」에 따르면,] | 흙이 말랐을 때 | 물을 줍니다.'],
    ['l05', '📰', '우리 학교 텃밭', 'src_byline',
      '{b:우리 학교 텃밭} | {b:3학년 1반 학급 신문} | {b:글 세연} / [텃밭 앞 「텃밭 안내판」을 보면] | 봄에 상추를 심었다는 것을 | 알 수 있습니다.'],
    ['l05', '🌱', '상추 심기', 'src_form',
      '[학교 누리집 「학교 텃밭 가꾸기 안내」에 따르면,] | 상추는 | 봄에 심습니다. / 🖼️ 상추를 심는 그림 | [■ 출처: 「텃밭 안내판」, 텃밭 앞.]']
  ];

  var TRAP_NOTE = {
    b: function (t) { return '「' + t + '」 — ' + (/^글 /.test(t) ? '쓴 사람이에요' : (/신문$/.test(t) ? '신문 이름이에요' : '글의 이름이에요')); },
    h: function (t) { return '「' + t + '」 — 누구에게 들었는지 알 수 없어요'; },
    p: function () { return '이 그림 아래에는 출처가 적혀 있지 않아요'; }
  };

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function bare(s) { return String(s).replace(/[,.]+$/, ''); }

  /* 글 → 줄마다 덩이 토큰 */
  function parse(text) {
    return text.split(' / ').map(function (line) {
      return line.split(' | ').map(function (c) {
        var m;
        if ((m = c.match(/^\[(.+)\]$/))) return { t: m[1], hit: true, src: bare(m[1]) };
        if ((m = c.match(/^\{([bhp]):(.+)\}$/))) return { t: m[2], hit: false, trap: m[1] };
        return { t: c, hit: false };
      });
    });
  }

  function explainOf(lines) {
    var all = [].concat.apply([], lines);
    var srcs = all.filter(function (t) { return t.hit; }).map(function (t) { return '「' + t.src + '」'; });
    var notes = all.filter(function (t) { return t.trap; }).map(function (t) { return TRAP_NOTE[t.trap](t.t); });
    var seen = {}; notes = notes.filter(function (n) { if (seen[n]) return false; seen[n] = 1; return true; });
    return '출처 = 가져온 곳과 자료 이름: ' + srcs.join(' · ') + (notes.length ? '  (' + notes.join(' · ') + ')' : '');
  }

  function build(row, id) {
    var lines = parse(row[4]);
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) { tokens.push({ t: t.t, hit: !!t.hit }); });
    });
    var answer = [].concat.apply([], lines).filter(function (t) { return t.hit; }).map(function (t) { return t.src; });
    return { id: id, l: row[0], icon: row[1], src: row[2], type: row[3],
             prompt: row[1] + ' ' + PROMPT, lines: lines, tokens: tokens, answer: answer, explain: explainOf(lines) };
  }

  return {
    id: 'src_hunt',
    title: '출처 찾기',
    T: T, ORDER: ORDER, PROMPT: PROMPT,
    parse: parse,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      T.forEach(function (t, k) { if (ORDER.indexOf(t[0]) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return T[k][0] === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 글이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], 'sr' + k + '_' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(bare(pick)) >= 0; }
      };
    },
    printRender: function (q) {
      return q.icon + ' <b>' + q.src + '</b><br>' + q.lines.map(function (line) {
        return line.map(function (t) { return t.t; }).join(' ');
      }).join('<br>');
    },
    printAnswer: function (q) { return q.answer.join(' · '); },
    printHead: '글을 읽고 출처(자료를 가져온 곳과 자료 이름)에 모두 밑줄을 그으세요.'
  };
}));
