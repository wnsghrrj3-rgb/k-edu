/* gens/korean/g4_2_fix_hunt.js — 보고서 고칠 곳 찾기 (4학년 2학기 국어 2단원 「우리말 우리글」 l08 · l10 · l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 덩이 토큰 · fixed 조각)가 쓴다. 교과서판 2학기 — 판의 글은 교과서·지도서 그대로.
 * 근거 = 『국어』 101쪽 4번 「지후가 보고하는 글을 쓰기 전에 작성한 개요와 메모입니다. 1의 글과 비교하며 메모에서 잘못된 점을 찾아 말해 봅시다.」
 *   판 하나 = 📋 지후가 조사한 것(누를 수 없는 fixed 줄 — 『국어』 98쪽 지후의 글·99쪽 조사 계획 그대로) + 그것을 옮겨 쓴 글(누르는 덩이).
 *   찾을 덩이(정답) = 조사한 것과 다르게 옮긴 곳 — 메모 ㉠ 열여덟 명 → 스무 명 · ㉢ 까닭 셋 → 둘 · ㉣ 기사 출처 → 제목만.
 * 덫(문항 단위 · 진단 축 = type · 지도서 150~157쪽 · 『국어활동』 25쪽):
 *   more  부풀림 — 조사한 것보다 크게(스무 명 모두 · 우리 학교 4학년 모두 · 「반드시 낮아진다」) — 메모 ㉠ · 지도서 150 「과장하지 않고 정확하게」
 *   less  줄임 — 조사한 것을 빼고(까닭 셋 → 둘 · 방법 셋 → 하나 · 그래프 넷 → 둘) — 메모 ㉢ · 보고서 평가 기준 「과장, 축소, 변형, 왜곡」
 *   src   출처 부족 — 기사 제목만 · 「인터넷」만 · 제목·날짜 빠짐 — 메모 ㉣ 예시 답 「기자 이름, 기사 제목, 발행한 곳, 발행 일자」 · 『국어활동』 25쪽 3번
 *   mix   사실 칸에 생각 섞기 — 조사 소감 문장을 「조사한 내용」에 — 지도서 151 참고 「사실과 의견은 분명히 구별되도록」
 *   맞게 옮긴 덩이(열여덟 명 · 20명 · 그래프 수 · 바른 출처)도 함께 두어, 수만 보고 아무 덩이나 누르면 흔들린다.
 * params: { upto: 'l08'|'all' }  l08 = 8~9차시 지후의 글·메모 · all = 10~11차시 점검·출처까지(l10·l14)
 * next() → { prompt, icon, src, lines:[[tok…]…], tokens:[{t,hit} | {t:' ',sep:true} | {t,fixed:true}], answer:[…], type, explain, l }
 * 표지 문법(이 파일 안): {f:…} = 📋 조사한 것(누를 수 없음) · [쓴 말=>고친 말] = 찾을 덩이 · {o:…} = 맞게 옮긴 덩이 · | = 덩이 사이 · / = 줄 바꿈
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_fix_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l08', 'l10'];
  var PROMPT = '조사한 것과 다르게 쓴 곳을 모두 찾아 눌러요';
  var WHY = { more: '조사한 것보다 부풀렸어요', less: '조사한 것을 빼고 줄였어요', src: '출처가 부족해요', mix: '생각은 조사 소감 칸에 써요' };

  /* [차시, 아이콘, 칸 이름, type, 글] */
  var T = [
    // ── l08 · 『국어』 98쪽 지후의 글 · 99쪽 조사 계획 · 101쪽 메모 ㉠~㉣
    ['l08', '📊', '조사한 내용 — 설문 조사', 'more',
      '{f:📋 설문 조사: 20명 가운데 열여덟 명이 줄임말을 자주 사용함} / 설문 조사에서 | [스무 명 모두가 줄임말을 자주 사용했다.=>열여덟 명이 줄임말을 자주 사용했다.] / 주로 ‘생파’, ‘엄빠’, ‘깜놀’을 | 메신저와 인터넷에서 | 많이 사용했다.'],
    ['l08', '🎤', '조사한 내용 — 면담 조사', 'less',
      '{f:📋 면담 조사: 짧아서 쓰기 편함 · 습관이 됨 · 다른 친구들이 많이 씀} / 친구들을 면담해 보니 | [짧아서 쓰기 편하고 습관이 되었기 때문에=>짧아서 쓰기 편하고, 습관이 되었으며, 다른 친구들이 많이 사용하기 때문에] / 줄임말을 사용한다고 | 말했다.'],
    ['l08', '📰', '참고 자료와 그 출처', 'src',
      '{f:📋 참고한 기사: ○○○ 기자 · 「줄임말로 대화하는 초등학생」 · 『○○일보』 · 20○○. ○○. ○○.} / 조사 방법 — | 설문 조사, 면담 조사, 인터넷 조사 / 참고 자료와 그 출처 — | [「줄임말로 대화하는 초등학생」=>○○○ 기자, 「줄임말로 대화하는 초등학생」, 『○○일보』, 20○○. ○○. ○○.]'],
    ['l08', '📋', '조사 대상', 'more',
      '{f:📋 조사 대상: 4학년 ○반 학생 20명 · 조사 방법: 설문 조사 · 면담 조사 · 인터넷 조사} / 제목 — | 우리 반 친구들의 줄임말 사용 / 조사 대상 — | [우리 학교 4학년 학생 모두=>4학년 ○반 학생 20명] / 조사 방법 — | {o:설문 조사, 면담 조사, 인터넷 조사}'],
    ['l08', '📋', '조사 방법', 'less',
      '{f:📋 조사 대상: 4학년 ○반 학생 20명 · 조사 방법: 설문 조사 · 면담 조사 · 인터넷 조사} / 조사 대상 — | {o:4학년 ○반 학생 20명} / 조사 방법 — | [설문 조사=>설문 조사, 면담 조사, 인터넷 조사]'],
    ['l08', '📝', '조사한 내용과 조사 소감', 'mix',
      '{f:📋 설문: 20명 가운데 열여덟 명 · 조사 소감: 많은 친구가 줄임말을 사용하고 있어서 놀라웠다.} / 조사한 내용 — | {o:열여덟 명이 줄임말을 자주 사용했다.} | [많은 친구가 줄임말을 사용하고 있어서 놀라웠다.=>조사 소감 칸으로 옮겨 써요] / 주로 메신저와 인터넷에서 | 많이 사용했다.'],
    ['l08', '📊', '설문 조사와 면담 조사', 'more',
      '{f:📋 설문: 20명 가운데 열여덟 명 · 면담: 짧아서 쓰기 편함 · 습관이 됨 · 다른 친구들이 많이 씀} / 설문 조사에서 | [스무 명 모두가 줄임말을 자주 사용했다.=>열여덟 명이 줄임말을 자주 사용했다.] / 면담해 보니 | [짧아서 쓰기 편하기 때문에=>짧아서 쓰기 편하고, 습관이 되었으며, 다른 친구들이 많이 사용하기 때문에] | 줄임말을 쓴다고 했다.'],
    // ── l10 · 『국어』 102~105쪽 점검하기(사실에 근거 · 출처) · 지도서 156 쓰기 윤리 · 『국어활동』 24~25쪽
    ['l10', '🌐', '조사한 내용 — 인터넷 조사', 'more',
      '{f:📋 기사: 학년이 올라갈수록 줄임말을 더 많이 씀 · 자주 쓰면 맞춤법과 어휘 실력이 낮아질 수 있음} / 인터넷 뉴스 기사에서 조사해 보니 | {o:학년이 올라갈수록 줄임말을 더 많이 사용했다.} / [줄임말을 쓰면 맞춤법과 어휘 실력이 반드시 낮아진다.=>맞춤법과 어휘 실력이 낮아질 수 있다.]'],
    ['l10', '📰', '참고 자료와 그 출처', 'src',
      '{f:📋 참고한 자료: 인터넷 뉴스 기사 — ○○○ 기자, 「줄임말로 대화하는 초등학생」, 『○○일보』} / 조사 방법 — | 설문 조사, 면담 조사, 인터넷 조사 / 참고 자료와 그 출처 — | [인터넷=>○○○ 기자, 「줄임말로 대화하는 초등학생」, 『○○일보』, 발행 일자]'],
    ['l10', '📰', '참고 자료와 그 출처', 'src',
      '{f:📋 참고한 기사: ○○○ 기자 · 「줄임말로 대화하는 초등학생」 · 『○○일보』 · 20○○. ○○. ○○.} / 조사 소감 — | 바른 언어생활을 하도록 | 노력해야겠다. / 참고 자료와 그 출처 — | [○○○ 기자, 『○○일보』=>○○○ 기자, 「줄임말로 대화하는 초등학생」, 『○○일보』, 20○○. ○○. ○○.]'],
    ['l10', '📈', '그래프 — 줄임말을 쓰는 상황', 'less',
      '{f:📋 줄임말을 쓰는 상황: 메신저 8명 · 인터넷 5명 · 일상 대화 3명 · 게임 2명} / 그래프 — | [메신저 8명, 인터넷 5명=>메신저 8명, 인터넷 5명, 일상 대화 3명, 게임 2명] / 친구들은 | {o:메신저에서 줄임말을 가장 많이 사용했다.}'],
    ['l10', '📝', '조사한 내용과 출처', 'mix',
      '{f:📋 설문: 열여덟 명 · 조사 소감: 바른 언어생활을 하도록 노력해야겠다. · 출처: ○○○ 기자, 「줄임말로 대화하는 초등학생」, 『○○일보』} / 조사한 내용 — | {o:열여덟 명이 줄임말을 자주 사용했다.} | [바른 언어생활을 하도록 노력해야겠다.=>조사 소감 칸으로 옮겨 써요] / 참고 자료와 그 출처 — | [인터넷=>○○○ 기자, 「줄임말로 대화하는 초등학생」, 『○○일보』, 발행 일자]'],
    ['l10', '📝', '조사한 내용 — 인터넷 조사', 'mix',
      '{f:📋 기사: 학년이 올라갈수록 줄임말을 더 많이 씀 · 조사 소감: 바른 언어생활을 하도록 노력해야겠다.} / 인터넷 뉴스 기사에서 조사해 보니 | {o:학년이 올라갈수록 줄임말을 더 많이 사용했다.} / [그래서 바른 언어생활을 하도록 노력해야겠다.=>조사 소감 칸으로 옮겨 써요] | 그 기사는 | 『○○일보』에 실렸다.'],
    ['l10', '📊', '설문 조사와 출처', 'src',
      '{f:📋 설문: 20명 가운데 열여덟 명 · 참고한 기사: ○○○ 기자, 「줄임말로 대화하는 초등학생」, 『○○일보』, 20○○. ○○. ○○.} / 설문 조사에서 | {o:열여덟 명이 줄임말을 자주 사용했다.} / 참고 자료와 그 출처 — | [「줄임말로 대화하는 초등학생」=>○○○ 기자, 「줄임말로 대화하는 초등학생」, 『○○일보』, 20○○. ○○. ○○.]']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 글 → 줄마다 덩이 토큰 */
  function parse(text) {
    return text.split(' / ').map(function (line) {
      return line.split(' | ').map(function (c) {
        var m;
        if ((m = c.match(/^\{f:(.+)\}$/))) return { t: m[1], hit: false, fixed: true };
        if ((m = c.match(/^\[(.+)=>(.+)\]$/))) return { t: m[1], hit: true, fix: m[2] };
        if ((m = c.match(/^\{o:(.+)\}$/))) return { t: m[1], hit: false, same: true };
        return { t: c, hit: false };
      });
    });
  }

  function explainOf(lines, type) {
    var all = [].concat.apply([], lines);
    var fixes = all.filter(function (t) { return t.hit; }).map(function (t) { return '「' + t.t + '」 → ' + t.fix; });
    var same = all.filter(function (t) { return t.same; }).map(function (t) { return '「' + t.t + '」'; });
    return '고칠 곳(' + WHY[type] + '): ' + fixes.join(' · ') + (same.length ? '  (' + same.join(' · ') + '은 조사한 그대로 옮겼어요)' : '');
  }

  function build(row, id) {
    var lines = parse(row[4]);
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) { tokens.push(t.fixed ? { t: t.t, fixed: true } : { t: t.t, hit: !!t.hit }); });
    });
    var answer = [].concat.apply([], lines).filter(function (t) { return t.hit; }).map(function (t) { return t.t; });
    return { id: id, l: row[0], icon: row[1], src: row[2], type: row[3],
             prompt: row[1] + ' ' + PROMPT, lines: lines, tokens: tokens, answer: answer, explain: explainOf(lines, row[3]) };
  }

  return {
    id: 'g4_2_fix_hunt',
    title: '보고서 고칠 곳 찾기',
    T: T, ORDER: ORDER, PROMPT: PROMPT, WHY: WHY,
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
          return build(T[k], 'fx' + k + '_' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(pick) >= 0; }
      };
    },
    printRender: function (q) {
      return q.icon + ' <b>' + q.src + '</b><br>' + q.lines.map(function (line) {
        return line.map(function (t) { return t.t; }).join(' ');
      }).join('<br>');
    },
    printAnswer: function (q) { return q.lines.reduce(function (a, l) { return a.concat(l); }, []).filter(function (t) { return t.hit; }).map(function (t) { return t.t + ' → ' + t.fix; }).join(' · '); },
    printHead: '📋 조사한 것과 견주어, 다르게 옮겨 쓴 곳에 모두 밑줄을 긋고 바르게 고쳐 쓰세요.'
  };
}));
