/* gens/social/timeline_order.js — 연표 띠에 차례대로 (3학년 1학기 사회 2단원 「일상에서 만나는 과거」 l04·l05)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)의 셋째 실물 — 엔진 무개변, 생성기만 새로.
 * params: { upto: 'l04'|'l05'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 틀이 덱 앞머리 (all = l06 소단원 ① 정리까지)
 * next() → { prompt, icon, cards:[{t,e}](섞임), order:[바른 차례의 카드 번호], answer:'2,0,1', layout:'row', type, explain }
 *
 * 카드 한 장 = 연표 한 칸(정본 l04 s06 「언제 + 무슨 일」): e = 때(위) · t = 있었던 일(아래). 때가 없는 유형은 e = 그림.
 * 놓는 자리는 늘 가로 띠(row) — 정본 l04 「왼쪽에서 오른쪽으로 갈수록 나중 일」. 무대 띠 아래 「먼저 → 나중」 화살표.
 *
 * type(문항 단위 · 진단 축 — 무엇을 보고 놓을 곳을 정하는가):
 *   tl_age    나이(○살)를 보고 — 정본 연표 그림(0살 태어남 · 1살 걸음마 · 8살 입학 · 10살 3학년 · 9살 줄넘기 대회)
 *   tl_life   때가 없어도 — 살면서 앞뒤가 늘 정해진 일(태어남 → 걸음마 → 입학 → 3학년 · 학년 차례)
 *   tl_year   연도를 보고 — 정본 l04 심화 「우리 학교 연표」(학교가 세워진 해 · 운동장이 바뀐 해)
 *   tl_month  달(○월)을 보고 — 정본 l04·l05 「행사 사진을 날짜대로」·「알림장 날짜」(한 학년 안 3월~12월만 — 새해로 넘어가는 판 0)
 *   tl_steps  연표를 만드는 걸음 — l04 세 걸음(떠올리기 → 순서 정하기 → 띠에 적기) · l05 네 걸음(자료 모으기 → 순서 정하기 → 띠에 적기 → 꾸미기)
 *
 * 정본 오개념 둘이 진단 축: l04 「중요해 보이는 일을 앞에(입학을 태어남보다 앞)」 — 그래서 틀마다 크고 빛나는 일(입학·대회·상)이 맨 앞이 아닌 자리에 있다.
 *   l05 「꾸미기부터」 — 꾸미기가 든 걸음 틀은 늘 꾸미기가 끝.
 * 차례가 둘로 읽히는 판 0 — 때가 있는 유형은 때가 모두 다르고, 때가 없는 유형은 누구에게나 앞뒤가 같은 일만.
 * 생년월일 0(정본 t_04_safe·t_05_safe — 나이로) · 「타임캡슐」(l06) 0 · 카드에 번호·「단계」·먼저/나중 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['timeline_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l04', 'l05'];

  /* 틀 — l 차시 · type · who 누구의 연표 · icon · seq 바른 차례 [때 또는 그림, 있었던 일] · why 풀이 끝말 */
  var T = [
    // ── l04 「시간의 흐름에 따라 연표 만들기」
    { l: 'l04', type: 'tl_age', who: '곰이', icon: '🐻',
      seq: [['0살', '태어남'], ['1살', '걸음마'], ['8살', '입학'], ['10살', '3학년']],
      why: '연표는 중요한 정도가 아니라 때가 놓일 곳을 정해요. 그래서 입학보다 태어남이 먼저예요.' },
    { l: 'l04', type: 'tl_age', who: '펭이', icon: '🐧',
      seq: [['5살', '세발자전거'], ['7살', '수영 배우기'], ['8살', '입학'], ['9살', '줄넘기 대회']],
      why: '나이가 적을수록 먼저 있었던 일이에요. 왼쪽이 먼저, 오른쪽이 나중이에요.' },
    { l: 'l04', type: 'tl_age', who: '곰이', icon: '🏆',
      seq: [['2살', '말 배우기'], ['6살', '그림 대회'], ['8살', '입학'], ['10살', '반장 되기']],
      why: '상을 받은 일이 크게 느껴져도 일어난 때대로 놓아요. 몇 살 때인지를 보면 돼요.' },
    { l: 'l04', type: 'tl_life', who: '곰이', icon: '🧒',
      seq: [['👶', '태어남'], ['🚶', '걸음마'], ['🎒', '입학'], ['🧒', '3학년']],
      why: '때가 적혀 있지 않아도 누구나 태어난 뒤에 걸음마를 하고, 그다음 입학해요. 입학이 커 보여도 태어남이 먼저예요.' },
    { l: 'l04', type: 'tl_life', who: '펭이', icon: '🏫',
      seq: [['🎒', '입학'], ['📗', '2학년'], ['📘', '3학년']],
      why: '입학한 뒤 2학년이 되고, 그다음 3학년이 돼요.' },
    { l: 'l04', type: 'tl_life', who: '곰이', icon: '🌱',
      seq: [['🌸', '입학식'], ['🏃', '1학년 운동회'], ['📗', '2학년'], ['📘', '3학년']],
      why: '입학식을 해야 1학년 운동회에 나가고, 학년은 한 해에 하나씩 올라가요. 입학식이 가장 먼저예요.' },
    { l: 'l04', type: 'tl_year', who: '우리 학교', icon: '🏫',
      seq: [['1985년', '학교가 세워짐'], ['2010년', '운동장 바뀜'], ['2024년', '도서관 새로 지음']],
      why: '연도의 수가 작을수록 먼저 있었던 일이에요. 학교가 세워진 해가 가장 왼쪽이에요.' },
    { l: 'l04', type: 'tl_year', who: '우리 학교', icon: '🏫',
      seq: [['1992년', '학교가 세워짐'], ['2003년', '강당 지음'], ['2015년', '운동장 바뀜'], ['2022년', '나무 심기']],
      why: '연도를 보고 먼저 있었던 일부터 왼쪽에 놓아요.' },
    { l: 'l04', type: 'tl_steps', who: '연표', icon: '📏',
      seq: [['💭', '있었던 일 떠올리기'], ['🔢', '시간 순서 정하기'], ['📏', '띠 위에 적기']],
      why: '먼저 있었던 일을 떠올리고, 그다음 시간 순서를 정해요. 정한 차례대로 띠 위에 적으면 연표가 돼요.' },

    // ── l05 「순서가 드러나는 연표 만들기」
    { l: 'l05', type: 'tl_steps', who: '연표', icon: '🎨',
      seq: [['📦', '자료 모으기'], ['🔢', '순서 정하기'], ['📏', '띠에 적기'], ['🖍️', '꾸미기']],
      why: '모으고, 차례를 정하고, 적고, 마지막에 꾸며요. 꾸미기부터 하면 차례가 흐트러져요.' },
    { l: 'l05', type: 'tl_steps', who: '연표', icon: '🎨',
      seq: [['📦', '자료 모으기'], ['📏', '띠에 적기'], ['🖍️', '꾸미기']],
      why: '자료를 먼저 모아야 적을 것이 생겨요. 꾸미기는 마지막 걸음이에요.' },
    { l: 'l05', type: 'tl_steps', who: '연표', icon: '🎨',
      seq: [['🔢', '순서 정하기'], ['📏', '띠에 적기'], ['🖍️', '꾸미기']],
      why: '차례를 먼저 정해야 띠에 차례대로 적을 수 있어요. 꾸미기는 맨 끝이에요.' },
    { l: 'l05', type: 'tl_steps', who: '연표', icon: '🎨',
      seq: [['📦', '자료 모으기'], ['🔢', '순서 정하기'], ['🖍️', '꾸미기']],
      why: '모은 자료로 차례를 정하고, 그림과 짧은 설명은 마지막에 더해요.' },
    { l: 'l05', type: 'tl_age', who: '곰이', icon: '🐻',
      seq: [['0살', '태어남'], ['1살', '걸음마'], ['8살', '입학'], ['9살', '줄넘기 대회']],
      why: '정한 차례대로 때와 있었던 일을 띠에 적어요. 왼쪽에서 오른쪽으로 갈수록 나중 일이에요.' },
    { l: 'l05', type: 'tl_month', who: '우리 반', icon: '📔',
      seq: [['3월', '새 학년 시작'], ['5월', '운동회'], ['7월', '여름 방학'], ['10월', '학예회']],
      why: '알림장 날짜도 차례대로 늘어놓으면 연표가 돼요. 3월이 가장 먼저예요.' },
    { l: 'l05', type: 'tl_month', who: '우리 반', icon: '📷',
      seq: [['4월', '봄 소풍'], ['6월', '수영 교실'], ['9월', '2학기 시작'], ['12월', '겨울 방학']],
      why: '행사 사진을 날짜대로 붙이면 그대로 연표가 돼요. 달의 수가 작을수록 먼저예요.' },
    { l: 'l05', type: 'tl_month', who: '우리 반', icon: '🏆',
      seq: [['3월', '짝 정하기'], ['6월', '현장 체험 학습'], ['11월', '학급 발표회']],
      why: '큰 행사가 꼭 앞에 오지 않아요. 몇 월에 있었는지를 보고 놓아요.' }
  ];

  var HEAD = {
    tl_age: function (t) { return t.who + '의 연표예요. 먼저 있었던 일부터 왼쪽에 놓아요'; },
    tl_life: function (t) { return '때가 적혀 있지 않아요. ' + t.who + '에게 먼저 있었던 일부터 놓아요'; },
    tl_year: function (t) { return t.who + ' 연표예요. 먼저 있었던 일부터 왼쪽에 놓아요'; },
    tl_month: function (t) { return t.who + ' 행사 연표예요. 먼저 있었던 일부터 왼쪽에 놓아요'; },
    tl_steps: function (t) { return '연표를 만드는 걸음이에요. 먼저 하는 일부터 놓아요'; }
  };

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hasWhen(t) { return t.type !== 'tl_life' && t.type !== 'tl_steps'; }

  function explainOf(t) {
    return t.seq.map(function (s) { return hasWhen(t) ? s[0] + ' ' + s[1] : s[1]; }).join(' → ') + '. ' + t.why;
  }

  function build(t, k, rng) {
    var cards = t.seq.map(function (s) { return { e: s[0], t: s[1] }; });
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0 (다시 섞기 — 자리 쏠림 없이)
    var shown = perm.map(function (j) { return cards[j]; });
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'tl' + k, l: t.l, type: t.type, icon: t.icon, who: t.who, prompt: HEAD[t.type](t),
             cards: shown, order: order, answer: order.join(','), layout: 'row', explain: explainOf(t) };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'timeline_order',
    title: '연표 차례대로',
    T: T,
    ORDER: ORDER,
    hasWhen: hasWhen,
    create: function (params, rng) {
      var p = params || {};
      var upto = p.upto === 'l06' ? 'all' : (ORDER.indexOf(p.upto) >= 0 ? p.upto : 'all');
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      T.forEach(function (t, k) { if (ORDER.indexOf(t.l) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return T[k].l === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 틀이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], k + '_' + (n++), rng);
        },
        check: function (pick, q) { return String(pick) === String(q.answer); }
      };
    },
    printRender: function (q) {
      return q.icon + ' ' + q.prompt + '<br>' + q.cards.map(function (c, k) { return MARK[k] + ' ' + c.e + ' ' + c.t; }).join(' &nbsp; ') +
        '<br>' + q.order.map(function () { return '(　　)'; }).join(' → ');
    },
    printAnswer: function (q) { return q.order.map(function (k) { return MARK[k]; }).join(' → '); },
    printHead: '카드를 연표 띠에 놓을 차례대로 기호를 써 보세요. (왼쪽이 먼저)'
  };
}));
