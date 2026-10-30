/* gens/social/custom_order.js — 풍습 차례대로 (3학년 2학기 사회 2단원 「옛날과 오늘날의 생활 모습」 주제① l02~l06)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)의 여덟째 실물 — 엔진 무개변, 생성기만 새로.
 * params: { upto: 'l02'|'l03'|'l04'|'l05'|'l06'|'all' }  l02 부터 그 차시까지 누적 · 이번 차시 틀이 덱 앞머리 (all = l07 주제① 정리까지)
 * next() → { prompt, icon, cards:[{t,e}](섞임), order:[바른 차례의 카드 번호], answer:'2,0,1', layout:'row', type, explain }
 *
 * 카드 한 장 = 정거장·걸음·명절 하나: e = 그림(위) · t = 이름·하는 일(아래). 자리는 늘 가로 띠 + 「먼저 → 나중」(26회차 무대 그대로).
 *
 * type(문항 단위 · 진단 축 — 무엇의 차례인가):
 *   cu_life   일생 길 정거장 — 정본 l02 s07 「출생 → 백일 → 첫돌 → 관례 → 혼례 → 회갑 → 장례」(s12 도전 그대로)
 *   cu_deed   정거장마다 하는 일 — 정본 l02 s06·s16(금줄 · 첫 생일 잔치 · 성인식 · 부부가 되는 예식 · 오래 사시길 · 위로)
 *   cu_wed    옛날 혼례 날 — 정본 l03 s04(말 타고 신부 집으로 → 나무 기러기 → 혼례 → 신부 집에서 며칠 → 신랑 집 폐백)
 *   cu_cal    한 해 달력의 명절 — 정본 l04 s07 다섯 상자(음력 1월 1일 → 1월 15일 → 5월 5일 → 8월 15일 → 양력 12월 22일 무렵)
 *   cu_food   명절 음식 — 정본 l04 s12 기본(떡국 · 오곡밥 · 수리취떡 · 송편 · 팥죽)
 *   cu_play   명절에 하던 일 — 정본 l04 s04·s05·s06(세배 · 쥐불놀이 · 부채 · 강강술래 · 버선)
 *   cu_farm   옛날 한 해 농사와 세시 풍속 — 정본 l05 s05(겨울 풍년 빌기 → 봄 성묘·농사 시작 → 여름 쉬며 영양 음식 → 가을 거두어 나누기)
 *   cu_pouch  복주머니 만들기 — 정본 l06 s07 네 단계 · s15 오개념 「아무 순서로 만들어도」
 *
 * 차례가 둘로 읽히는 판 0 — 틀은 늘 정본이 못 박은 한 줄의 부분 차례(뒤섞임 0).
 *   명절 하는 일은 설날·정월 대보름 둘 다에 걸치는 놀이(윷놀이·연날리기·널뛰기) 0 — 세배만.
 * 앞 판 둘(custom_sort 칸 넣기 · claim_custom 친구 말)과 겹치는 꼴 0 — 칸 이름(일상생활 속 풍습·세시 풍속) 0 · ○/✕ 0.
 * 카드에 번호·「단계」·먼저/나중·처음·끝 0 · 차단 어휘(혼인 낱말 「결…」) 0 — 정본 l02 「혼례」로.
 * 주제② 교통(l08) 말 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['custom_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l02', 'l03', 'l04', 'l05', 'l06'];

  // l02 일생 길 — 정본 s07 그림 그대로
  var BIRTH = ['👶', '출생'], HUND = ['🎂', '백일'], DOL = ['🧸', '첫돌'], GWAN = ['🎩', '관례'], HON = ['💍', '혼례'], HOE = ['🎉', '회갑'], JANG = ['🕯️', '장례'];
  // l02 하는 일
  var D_ROPE = ['🪢', '대문에 금줄 치기'], D_100 = ['🍚', '100일 축하 잔치'], D_DOL = ['🧸', '첫 생일 잔치'], D_ADULT = ['🎩', '어른이 되는 성인식'],
      D_WED = ['💍', '부부가 되는 예식'], D_LONG = ['🎉', '오래 사시길 빌기'], D_COMFORT = ['🕯️', '남은 가족 위로'];
  // l03 옛날 혼례 날
  var W_GO = ['🐴', '말 타고 신부 집에'], W_GOOSE = ['🪿', '나무 기러기 건네기'], W_RITE = ['👘', '혼례복 입고 혼례'],
      W_STAY = ['🏮', '신부 집에서 며칠'], W_BOW = ['🙇', '신랑 집에서 폐백'];
  // l04 다섯 명절
  var SEOL = ['🌅', '설날'], BORUM = ['🌕', '정월 대보름'], DANO = ['🪭', '단오'], CHU = ['🌾', '추석'], DONG = ['❄️', '동지'];
  var F_SEOL = ['🍲', '떡국'], F_BORUM = ['🍚', '오곡밥'], F_DANO = ['🍡', '수리취떡'], F_CHU = ['🌙', '송편'], F_DONG = ['🥣', '팥죽'];
  var P_SEOL = ['🙇', '세배 드리기'], P_BORUM = ['🔥', '쥐불놀이'], P_DANO = ['🪭', '부채 주고받기'], P_CHU = ['💃', '강강술래'], P_DONG = ['🧦', '버선 주고받기'];
  // l05 한 해 농사
  var A_WISH = ['🌕', '보름달에 풍년 빌기'], A_START = ['🌱', '성묘하고 농사 시작'], A_REST = ['☀️', '쉬며 영양 음식'], A_HARV = ['🍂', '곡식 거두어 나누기'];
  // l06 복주머니
  var B_TEAR = ['📄', '활동 자료 뜯기'], B_PAINT = ['🖍️', '색칠하고 모양 뜯기'], B_GLUE = ['🧴', '풀로 모양 만들기'], B_HANDLE = ['🎀', '끈으로 손잡이 달기'];

  /* 틀 — l 차시 · type · icon · seq 바른 차례 [그림, 이름·하는 일] · why 풀이 끝말 */
  var T = [
    // ── l02 「옛날의 일상생활 속 풍습」 — 일생 길 일곱 정거장
    { l: 'l02', type: 'cu_life', icon: '🛤️', seq: [BIRTH, HUND, DOL],
      why: '아기가 태어나고, 100일이 되면 백일, 첫 번째 생일에 첫돌이에요. 백일이 첫돌보다 먼저예요.' },
    { l: 'l02', type: 'cu_life', icon: '🛤️', seq: [DOL, GWAN, HON],
      why: '관례는 혼례를 올리기 전에 하던 성인식이에요. 어른이 된 뒤에 부부가 되는 혼례를 올렸어요.' },
    { l: 'l02', type: 'cu_life', icon: '🛤️', seq: [GWAN, HON, HOE, JANG],
      why: '성인식 → 부부가 되는 예식 → 오래 사시길 비는 잔치 → 죽음을 맞이하는 장례 차례로 살아가요.' },
    { l: 'l02', type: 'cu_life', icon: '🛤️', seq: [HUND, GWAN, HOE],
      why: '어릴 때 백일, 어른이 될 때 관례, 늙어서 회갑이에요. 살아가는 차례대로 정거장이 이어져요.' },
    { l: 'l02', type: 'cu_life', icon: '🛤️', seq: [BIRTH, DOL, HON, JANG],
      why: '태어나서 첫돌을 맞고, 자라서 혼례를 올리고, 마지막 정거장은 장례예요. 장례에는 위로의 마음이 담겨 있어요.' },
    { l: 'l02', type: 'cu_deed', icon: '🎁', seq: [D_ROPE, D_100, D_DOL],
      why: '아기가 태어나면 대문에 금줄을 쳤어요. 100일이 되면 백일잔치, 첫 번째 생일에는 돌잔치를 했어요.' },
    { l: 'l02', type: 'cu_deed', icon: '🎁', seq: [D_DOL, D_ADULT, D_WED],
      why: '첫 생일 잔치는 아기 때, 성인식은 혼례를 올리기 전이에요. 어른이 된 뒤에 부부가 되는 예식을 올렸어요.' },
    { l: 'l02', type: 'cu_deed', icon: '🎁', seq: [D_ADULT, D_WED, D_LONG, D_COMFORT],
      why: '관례 → 혼례 → 회갑 → 장례 차례예요. 축하하는 일이 이어지다가, 장례에서는 남은 가족을 위로했어요.' },
    { l: 'l02', type: 'cu_deed', icon: '🎁', seq: [D_100, D_WED, D_LONG],
      why: '백일잔치는 아기 때, 혼례는 어른이 되어서, 회갑은 늙어서 해요. 모두 축하하는 마음이 담겨 있어요.' },

    // ── l03 「옛날과 오늘날의 일상생활 속 풍습 비교」 — 옛날 혼례 날
    { l: 'l03', type: 'cu_wed', icon: '🏮', seq: [W_GO, W_GOOSE, W_RITE],
      why: '신랑은 나무 기러기를 가지고 말을 타고 신부 집으로 갔어요. 기러기를 신부 쪽에 건넨 뒤 혼례를 치렀어요.' },
    { l: 'l03', type: 'cu_wed', icon: '🏮', seq: [W_RITE, W_STAY, W_BOW],
      why: '혼례가 끝나면 신부 집에서 며칠을 보낸 뒤 신랑 집으로 가서, 신랑 집안 어른들께 폐백을 드렸어요.' },
    { l: 'l03', type: 'cu_wed', icon: '🏮', seq: [W_GO, W_RITE, W_BOW],
      why: '혼례는 신부 집에서 치렀어요. 그래서 신랑이 먼저 신부 집으로 가고, 폐백은 신랑 집에 가서 드렸어요.' },
    { l: 'l03', type: 'cu_wed', icon: '🏮', seq: [W_GOOSE, W_RITE, W_STAY, W_BOW],
      why: '기러기를 건네고 혼례를 치른 뒤, 신부 집에서 며칠을 지내고, 신랑 집에서 폐백을 드려요.' },
    { l: 'l03', type: 'cu_wed', icon: '🏮', seq: [W_GO, W_GOOSE, W_STAY, W_BOW],
      why: '신부 집에 가서 기러기를 건네는 일이 앞이에요. 신부 집에서 며칠을 지낸 뒤에야 신랑 집으로 가서 폐백을 드려요.' },

    // ── l04 「옛날의 세시 풍속」 — 다섯 명절
    { l: 'l04', type: 'cu_cal', icon: '📅', seq: [SEOL, BORUM, DANO],
      why: '설날은 음력 1월 1일, 정월 대보름은 음력 1월 15일, 단오는 음력 5월 5일이에요.' },
    { l: 'l04', type: 'cu_cal', icon: '📅', seq: [BORUM, DANO, CHU],
      why: '정월 대보름은 음력 1월 15일, 단오는 음력 5월 5일, 추석은 음력 8월 15일이에요.' },
    { l: 'l04', type: 'cu_cal', icon: '📅', seq: [DANO, CHU, DONG],
      why: '단오(음력 5월 5일) 다음에 추석(음력 8월 15일)이 와요. 동지는 양력 12월 22일 무렵, 밤이 가장 긴 날이에요.' },
    { l: 'l04', type: 'cu_cal', icon: '📅', seq: [SEOL, DANO, CHU, DONG],
      why: '한 해가 시작되는 설날이 맨 앞이에요. 단오 → 추석 다음, 한 해 끝 무렵에 동지가 와요.' },
    { l: 'l04', type: 'cu_food', icon: '🍽️', seq: [F_SEOL, F_BORUM, F_DANO],
      why: '설날에 떡국, 정월 대보름에 오곡밥, 단오에 수리취떡을 먹었어요.' },
    { l: 'l04', type: 'cu_food', icon: '🍽️', seq: [F_DANO, F_CHU, F_DONG],
      why: '단오에 수리취떡, 추석에 송편, 동지에 팥죽을 먹었어요. 동지가 한 해 끝 무렵이에요.' },
    { l: 'l04', type: 'cu_food', icon: '🍽️', seq: [F_SEOL, F_CHU, F_DONG],
      why: '설날 떡국 → 추석 송편 → 동지 팥죽 차례예요. 음식으로 명절을 먼저 떠올려 보세요.' },
    { l: 'l04', type: 'cu_play', icon: '🎎', seq: [P_SEOL, P_BORUM, P_DANO],
      why: '설날에 세배를 드리고, 정월 대보름에 쥐불놀이를 하고, 단오에는 여름을 시원하게 보내라고 부채를 주고받았어요.' },
    { l: 'l04', type: 'cu_play', icon: '🎎', seq: [P_DANO, P_CHU, P_DONG],
      why: '단오에 부채, 추석에 강강술래, 동지에는 새해 달력과 버선을 주고받았어요.' },
    { l: 'l04', type: 'cu_play', icon: '🎎', seq: [P_BORUM, P_CHU, P_DONG],
      why: '정월 대보름 쥐불놀이 → 추석 강강술래 → 동지 버선 차례예요.' },

    // ── l05 「옛날과 오늘날의 세시 풍속 비교」 — 옛날 한 해 농사
    { l: 'l05', type: 'cu_farm', icon: '🌾', seq: [A_WISH, A_START, A_REST, A_HARV],
      why: '새해 첫 보름달에 풍년을 빌고, 봄에 농사일을 시작하고, 여름엔 무더위에 잠시 쉬고, 가을에 곡식을 거두어 기쁨을 나눴어요.' },
    { l: 'l05', type: 'cu_farm', icon: '🌾', seq: [A_START, A_REST, A_HARV],
      why: '봄에 농사일을 시작해야 여름에 쉬어 가고, 가을에 곡식을 거둘 수 있어요. 농사는 계절에 따라 할 일이 정해져 있었어요.' },
    { l: 'l05', type: 'cu_farm', icon: '🌾', seq: [A_WISH, A_START, A_REST],
      why: '풍년을 비는 일이 농사보다 앞이에요. 봄에 농사를 시작하고, 여름에는 잠시 쉬며 영양이 풍부한 음식을 먹었어요.' },
    { l: 'l05', type: 'cu_farm', icon: '🌾', seq: [A_WISH, A_REST, A_HARV],
      why: '겨울 보름달에 풍년을 빌고, 여름엔 무더위를 피해 잠시 쉬고, 가을에 곡식을 거두어 기쁨을 나눴어요.' },
    { l: 'l05', type: 'cu_farm', icon: '🌾', seq: [A_WISH, A_START, A_HARV],
      why: '새해에 풍년을 빌고 봄에 농사를 시작해야, 가을에 곡식을 거두어 함께 나눌 수 있어요.' },

    // ── l06 「옛날부터 전해 내려오는 풍습 체험」 — 복주머니
    { l: 'l06', type: 'cu_pouch', icon: '🧧', seq: [B_TEAR, B_PAINT, B_GLUE, B_HANDLE],
      why: '활동 자료를 뜯어 준비하고, 색칠한 뒤 모양대로 뜯고, 풀을 발라 모양을 만들고, 마지막에 끈으로 손잡이를 달아요.' },
    { l: 'l06', type: 'cu_pouch', icon: '🧧', seq: [B_TEAR, B_PAINT, B_GLUE],
      why: '자료를 뜯어 준비해야 색칠할 수 있어요. 풀을 먼저 바르면 색칠하기 어려워서, 색칠이 풀보다 앞이에요.' },
    { l: 'l06', type: 'cu_pouch', icon: '🧧', seq: [B_PAINT, B_GLUE, B_HANDLE],
      why: '색칠하고 뜯은 뒤에 풀을 발라 모양을 만들어요. 손잡이를 먼저 달면 모양을 만들 수 없어요.' },
    { l: 'l06', type: 'cu_pouch', icon: '🧧', seq: [B_TEAR, B_GLUE, B_HANDLE],
      why: '준비한 도안으로 풀을 발라 모양을 만든 다음, 손잡이는 맨 뒤에 달아요.' },
    { l: 'l06', type: 'cu_pouch', icon: '🧧', seq: [B_TEAR, B_PAINT, B_HANDLE],
      why: '활동 자료를 뜯고 색칠하는 일이 앞이에요. 리본이나 끈으로 손잡이를 달면 복주머니가 완성돼요.' }
  ];

  var HEAD = {
    cu_life: function () { return '일생 길 정거장이에요. 먼저 오는 정거장부터 놓아요'; },
    cu_deed: function () { return '살아가는 동안의 풍습이에요. 먼저 하는 일부터 놓아요'; },
    cu_wed: function () { return '옛날 혼례 날이에요. 먼저 하는 일부터 놓아요'; },
    cu_cal: function () { return '한 해 달력에 명절을 놓아요. 먼저 오는 날부터 놓아요'; },
    cu_food: function () { return '명절에 먹던 음식이에요. 한 해에 먼저 먹는 것부터 놓아요'; },
    cu_play: function () { return '명절에 하던 일이에요. 한 해에 먼저 하는 것부터 놓아요'; },
    cu_farm: function () { return '옛날 한 해 농사와 세시 풍속이에요. 새해부터 먼저 하는 일을 놓아요'; },
    cu_pouch: function () { return '복주머니를 만들어요. 먼저 하는 일부터 놓아요'; }
  };

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function explainOf(t) { return t.seq.map(function (s) { return s[1]; }).join(' → ') + '. ' + t.why; }

  function build(t, k, rng) {
    var cards = t.seq.map(function (s) { return { e: s[0], t: s[1] }; });
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0
    var shown = perm.map(function (j) { return cards[j]; });
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'cu' + k, l: t.l, type: t.type, icon: t.icon, prompt: HEAD[t.type](t),
             cards: shown, order: order, answer: order.join(','), layout: 'row', explain: explainOf(t) };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'custom_order',
    title: '풍습 차례대로',
    T: T,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = p.upto === 'l07' ? 'all' : (ORDER.indexOf(p.upto) >= 0 ? p.upto : 'all');
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
    printHead: '카드를 띠에 놓을 차례대로 기호를 써 보세요. (왼쪽이 먼저)'
  };
}));
