/* gens/korean/cue_hunt.js — 표지어 찾기 (3학년 2학기 국어 1단원 「경험과 관련지으며 이해해요」 l06·l11·l13)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 낱말 토큰)가 쓴다 — 토큰 하나 = 어절 하나(표지어·군말은 덩이 하나).
 * params: { upto: 'l06'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 글이 덱 앞머리
 * next() → { prompt, icon, src, lines:[[tok…]…], tokens:[{t,hit} | {t,fixed:true} | {t:' ',sep:true}], answer:[표지어…], type, explain, l }
 *
 * 정본 l06 s06: 말하는 사람이 중요한 곳에 붙이는 말 = 표지어 — 첫째 · 둘째 · 따라서 · 가장 중요한 것은 · 이것만 기억하세요
 *   (s14 「꼭 기억하세요」 · l11 s07 「셋째」). 「이것은」은 보통 말로도 쓰여 판에 넣지 않는다(정답이 둘로 읽히는 판 0).
 * 덫 = 정본 l06 s06 watch 「「음, 그러니까」도 표지어로 여기는 경우」 · s10 오답 「음, 그러니까」·「아까 뭐였더라」 · s15 펭이 공책.
 * type(문항 단위 · 진단 축):
 *   cue_order   차례를 세는 표지어(첫째·둘째·셋째)만 든 글
 *   cue_key     「따라서·가장 중요한 것은·이것만/꼭 기억하세요」가 든 글
 *   cue_filler  군말(음, 그러니까 · 아까 뭐였더라)이 끼어 있는 글 — s06 watch 축
 *   cue_dialog  묻는 사람·답하는 사람이 주고받는 글 — s05 watch 「질문과 대답을 섞어 적는 경우」 축(표지어는 답에만)
 * 글 = 정본 l06 s05 「책 고르는 법을 물었어요」 · l11 s07 「도서관을 함께 쓰는 약속」 문장 그대로 + 같은 꼴 자체 구성
 *   (l06 s13·s14 알림 방송·현장 체험 · s13 solo 가정 통신문 · l11 s14 학급 규칙). 「셋째」·도서관·반납대는 l11 부터.
 * 표지 문법(이 파일 안): [표지어] = 찾을 말 · {군말} = 누를 수 있지만 표지어 아님(덩이 하나) · <이름 —> = 누를 수 없는 말한 사람 · / = 줄 바꿈
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['cue_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l06', 'l11'];
  var CUES = ['첫째', '둘째', '셋째', '따라서', '가장 중요한 것은', '이것만 기억하세요', '꼭 기억하세요'];
  var ORDINAL = ['첫째', '둘째', '셋째'];
  var FILLERS = ['음, 그러니까', '아까 뭐였더라'];
  var PROMPT = '표지어를 모두 찾아 눌러요';

  /* [차시, 아이콘, 글 이름, 글] */
  var T = [
    // ── l06 · 정본 s05 「책 고르는 법을 물었어요」 그대로(앞·뒤 두 판으로 나눔 · 선생님 대답은 표지어가 든 첫 문장까지 — 덧붙인 둘째 문장은 폰 한 화면에 들게 뺌)
    ['l06', '💬', '책 고르는 법을 물었어요',
      '<수린 —> 읽고 싶은 책을 어떻게 고르면 좋을까요? / <선생님 —> [첫째,] 앞쪽을 두세 쪽 읽어 보세요. / <수린 —> 골랐는데 너무 어려우면 어떻게 하지요? / <선생님 —> [둘째,] 끝까지 안 읽어도 괜찮아요.'],
    ['l06', '💬', '책 고르는 법을 물었어요',
      '<선생님 —> [둘째,] 끝까지 안 읽어도 괜찮아요. / <수린 —> 읽은 것을 자꾸 잊어버려요. / <선생님 —> [이것만 기억하세요.] 다 적지 말고 마음에 남는 한 줄만 적어 두세요.'],
    ['l06', '💬', '공책에 무엇을 적을까',
      '<펭이 —> 공책에는 무엇을 적어요? / <선생님 —> [첫째,] 표지어 뒤에 온 말을 적어요. / <펭이 —> 다 적으면 안 돼요? / <선생님 —> [이것만 기억하세요.] 번호를 붙여 짧게 적어요.'],
    // ── l06 · 알림 방송(s13·s14 현장 체험) · 가정 통신문(s13 solo) — 자체 구성
    ['l06', '📢', '현장 체험 안내 방송',
      '내일은 현장 체험을 가요. / [첫째,] 아침 여덟 시 반까지 운동장에 모여요. / [둘째,] 물과 도시락을 챙겨 와요.'],
    ['l06', '📢', '현장 체험 준비물',
      '현장 체험 준비물을 알려 줄게요. / [첫째,] 모자를 쓰고 와요. / [꼭 기억하세요.] 이름표를 가방에 달아요.'],
    ['l06', '📢', '버스 타는 날',
      '내일은 버스를 타고 가요. / [가장 중요한 것은] 자리에 앉아 안전띠를 매는 거예요. / [이것만 기억하세요.] 버스 안에서는 일어서지 않아요.'],
    ['l06', '📄', '가정 통신문',
      '다음 주 수요일은 책 읽는 날이에요. / [첫째,] 집에서 읽을 책 한 권을 가져와요. / [둘째,] 마음에 남는 한 줄을 적어 와요.'],
    ['l06', '📢', '점심시간 안내',
      '점심시간 안내예요. / [첫째,] 손을 씻고 줄을 서요. / [둘째,] 다 먹은 식판은 정리대에 둬요.'],
    ['l06', '📢', '체육 시간 안내',
      '어젯밤에 비가 와서 운동장이 젖었어요. / [따라서] 오늘 체육은 강당에서 해요. / [꼭 기억하세요.] 실내화를 신고 와요.'],
    ['l06', '📢', '가방 싸기',
      '가방이 무거우면 어깨가 아파요. / [따라서] 필요한 것만 넣어요. / [가장 중요한 것은] 물병이에요.'],
    ['l06', '📢', '현장 체험 안내 방송',
      '{음, 그러니까} 내일 준비물을 말할게요. / [첫째,] 편한 운동화를 신어요. / [둘째,] 비옷을 가방에 넣어 와요.'],
    ['l06', '📢', '현장 체험 안내 방송',
      '{아까 뭐였더라} 아, 모이는 곳이었지요. / [첫째,] 정문 앞에 모여요. / [이것만 기억하세요.] 짝과 손을 잡고 다녀요.'],
    ['l06', '📢', '비 오는 날 안내',
      '오후에 비가 온대요. / {음, 그러니까} 우산이 없는 사람도 있지요. / [따라서] 교실 우산을 빌려 가요. / [꼭 기억하세요.] 내일 돌려주어요.'],
    ['l06', '📢', '책 읽는 날 안내',
      '{아까 뭐였더라} 책 읽는 날 이야기였지요. / {음, 그러니까} 수요일에 해요. / [첫째,] 읽을 책을 한 권 골라 와요. / [가장 중요한 것은] 끝까지 즐겁게 읽는 거예요.'],
    // ── l11 · 정본 s07 「도서관을 함께 쓰는 약속」 그대로(두 판으로 나눔)
    ['l11', '📚', '도서관을 함께 쓰는 약속',
      '[첫째,] 빌린 책은 정해진 날까지 돌려주세요. 기다리는 사람이 있어요. / [둘째,] 읽고 난 책은 제자리에 꽂거나 반납대에 두세요.'],
    ['l11', '📚', '도서관을 함께 쓰는 약속',
      '[셋째,] 책에는 표시를 하지 마세요. 연필로 그은 줄도 지워 주세요. / [이것만 기억하세요.] 다음 사람이 그대로 읽을 수 있게 두는 거예요.'],
    // ── l11 · 같은 꼴 자체 구성(도서관 약속 · s14 학급 규칙)
    ['l11', '📚', '도서관 약속',
      '[첫째,] 빌린 책은 정해진 날까지 돌려주세요. / [둘째,] 자리를 모르면 반납대에 두세요. / [셋째,] 책에는 표시를 하지 마세요.'],
    ['l11', '📌', '학급 규칙 게시판',
      '학급 회의에서 정한 규칙이에요. / [첫째,] 복도에서는 걸어 다녀요. / [둘째,] 친구 말을 끝까지 들어요. / [셋째,] 쓴 물건은 제자리에 둬요.'],
    ['l11', '📚', '도서관 약속',
      '{음, 그러니까} 도서관 약속을 다시 말할게요. / [첫째,] 빌린 책은 정해진 날까지 돌려주세요. / [이것만 기억하세요.] 다음 사람이 그대로 읽을 수 있게 두는 거예요.'],
    ['l11', '📌', '학급 규칙 게시판',
      '{아까 뭐였더라} 아, 학급 규칙이었지요. / [첫째,] 수업 종이 치면 자리에 앉아요. / [둘째,] 급식은 남기지 않고 먹어요.'],
    ['l11', '💬', '도서관에서 물었어요',
      '<곰이 —> 책을 빌리면 언제까지 돌려줘요? / <선생님 —> [첫째,] 정해진 날까지 돌려주세요. / <곰이 —> 어디에 꽂는지 모르면요? / <선생님 —> [둘째,] 자리를 모르면 반납대에 두세요.'],
    ['l11', '📚', '도서관 약속',
      '책에 그은 줄은 다음 사람을 불편하게 해요. / [따라서] 책에는 표시를 하지 마세요. / [가장 중요한 것은] 다음 사람을 생각하는 마음이에요.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function bare(s) { return s.replace(/[,.?!]+$/, ''); }

  /* 글 → 줄마다 토큰. 표지어·군말·말한 사람은 덩이 하나, 나머지는 어절 하나 */
  function parse(text) {
    return text.split(' / ').map(function (line) {
      var out = [], re = /\[([^\]]+)\]|\{([^}]+)\}|<([^>]+)>|(\S+)/g, m;
      while ((m = re.exec(line))) {
        if (m[1]) out.push({ t: m[1], hit: true, cue: bare(m[1]) });
        else if (m[2]) out.push({ t: m[2], hit: false, filler: true });
        else if (m[3]) out.push({ t: m[3], fixed: true, who: true });
        else out.push({ t: m[4], hit: false });
      }
      return out;
    });
  }
  function typeOf(lines) {
    var all = [].concat.apply([], lines);
    if (all.some(function (t) { return t.who; })) return 'cue_dialog';
    if (all.some(function (t) { return t.filler; })) return 'cue_filler';
    if (all.some(function (t) { return t.hit && ORDINAL.indexOf(t.cue) < 0; })) return 'cue_key';
    return 'cue_order';
  }

  /* 풀이 = 표지어 뒤에 온 말(그 줄 끝까지) — 「표지어 뒤만 간단히 적어요」(정본 s08 right) */
  function explainOf(lines) {
    var parts = [];
    lines.forEach(function (line) {
      line.forEach(function (t, k) {
        if (!t.hit) return;
        var rest = line.slice(k + 1).filter(function (x) { return !x.fixed; }).map(function (x) { return x.t; }).join(' ');
        var first = rest.split(/(?<=[.?!])\s/)[0];
        parts.push('「' + t.cue + '」 → ' + first);
      });
    });
    var all = [].concat.apply([], lines), f = all.filter(function (t) { return t.filler; }).map(function (t) { return '「' + t.t + '」'; });
    return '표지어 뒤를 적어요: ' + parts.join(' · ') + (f.length ? '  (' + f.join('·') + '는 표지어가 아니에요)' : '');
  }

  function build(row, id) {
    var lines = parse(row[3]);
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) {
        if (t.fixed) tokens.push({ t: t.t, fixed: true });
        else tokens.push({ t: t.t, hit: !!t.hit });
      });
    });
    var answer = [].concat.apply([], lines).filter(function (t) { return t.hit; }).map(function (t) { return t.cue; });
    return { id: id, l: row[0], icon: row[1], src: row[2], type: typeOf(lines),
             prompt: row[1] + ' ' + PROMPT, lines: lines, tokens: tokens, answer: answer, explain: explainOf(lines) };
  }

  return {
    id: 'cue_hunt',
    title: '표지어 찾기',
    T: T, ORDER: ORDER, CUES: CUES, FILLERS: FILLERS, PROMPT: PROMPT,
    parse: parse, typeOf: typeOf,
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
          return build(T[k], 'cu' + k + '_' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(bare(String(pick))) >= 0; }
      };
    },
    printRender: function (q) {
      return q.icon + ' <b>' + q.src + '</b><br>' + q.lines.map(function (line) {
        return line.map(function (t) { return t.fixed ? '<b>' + t.t + '</b>' : t.t; }).join(' ');
      }).join('<br>');
    },
    printAnswer: function (q) { return q.answer.join(' · '); },
    printHead: '글을 읽고 표지어(중요한 내용이 온다고 알려 주는 말)에 모두 ○를 하세요.'
  };
}));
