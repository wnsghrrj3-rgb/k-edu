/* gens/social/survey_order.js — 조사·영상 차례대로 (3학년 1학기 사회 2단원 「일상에서 만나는 과거」 소단원 ③ l16·l17)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)의 넷째 실물 — 엔진 무개변, 생성기만 새로.
 * params: { upto: 'l16'|'l17'|'all' }  l16 부터 그 차시까지 누적 · 이번 차시 틀이 덱 앞머리 (all = l18 단원 정리까지)
 * next() → { prompt, icon, cards:[{t,e}](섞임), order:[바른 차례의 카드 번호], answer:'2,0,1', layout:'row', type, explain }
 *
 * 카드 한 장 = 걸음 하나 또는 장면 하나: e = 그림(위) · t = 하는 일·자막(아래). 자리는 늘 가로 띠 + 「먼저 → 나중」(26회차 무대 그대로).
 *
 * type(문항 단위 · 진단 축 — 무엇의 차례인가):
 *   sv_steps  지역 조사 걸음 — 정본 l16 「계획 → 자료 → 비교 → 정리」(+ s07 해설사처럼 알리기)
 *   sv_plan   조사 계획서 — 정본 l16 s13 모둠 계획서(조사할 것 → 찾을 곳 / 맡을 일 → 모둠 판에 붙이기)
 *   sv_video  영상 만드는 걸음 — 정본 l17 s17 「자료 고르기 → 차례 정하기 → 자막 붙이기 → 친구에게 소개하기」
 *   sv_scene  장면 자막의 차례 — 정본 l17 s06·s07(좁은 흙길 → 길을 넓혔어요 → 넓은 길) · 「옛날 → 오늘」
 *   sv_flow   소개 영상의 흐름 — 정본 l17 s12 심화(옛 거리 사진 → 오늘 거리 사진 → 우리 반 소감)
 *
 * 정본 오개념 둘이 진단 축: l16 「계획 없이 아무 자료나」 — 계획이 든 틀은 늘 계획이 맨 앞(틀 절반 이상에 계획).
 *   l17 「많이 넣을수록 좋다 · 순서 없이」 — 고르기가 든 틀은 늘 고르기가 맨 앞 · 소개가 든 틀은 늘 소개가 끝 · 장면은 늘 옛날 → 오늘.
 * 26회차 tl_steps(연표 만드는 걸음)와 카드 글 겹침 0 — 같은 판 둘이 아니다.
 * 차례가 둘로 읽히는 판 0 — 걸음은 정본이 못 박은 차례의 부분 차례만, 장면은 「~이었어요 → 했어요 → ~이 되었어요」.
 * 카드에 번호·「단계」·먼저/나중·처음·끝 0 · 「축제」(l18) 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['survey_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l16', 'l17'];

  var PLAN = ['🧭', '계획 세우기'], DATA = ['📦', '자료 찾기'], CMP = ['⚖️', '비교하기'], RPT = ['📝', '보고서로 정리'], TELL = ['🎤', '사람들에게 알리기'];
  var PICK = ['✂️', '자료 고르기'], ORD = ['🔢', '차례 정하기'], SUB = ['💬', '자막 붙이기'], SHOW = ['🎤', '친구에게 소개하기'];

  /* 틀 — l 차시 · type · icon · seq 바른 차례 [그림, 하는 일·자막] · why 풀이 끝말 */
  var T = [
    // ── l16 「우리 지역 조사하기」
    { l: 'l16', type: 'sv_steps', icon: '🔎', seq: [PLAN, DATA, CMP, RPT],
      why: '무엇을 어떻게 조사할지 계획부터 세워요. 계획에 맞춰 자료를 찾고, 비교하고, 보고서로 정리해요.' },
    { l: 'l16', type: 'sv_steps', icon: '🔎', seq: [PLAN, DATA, CMP],
      why: '계획 없이 자료부터 찾으면 무엇을 알았는지 말하기 어려워요. 계획이 맨 앞이에요.' },
    { l: 'l16', type: 'sv_steps', icon: '🔎', seq: [DATA, CMP, RPT],
      why: '찾아 모은 자료가 있어야 나란히 놓고 비교할 수 있어요. 비교해서 알게 된 점을 보고서에 적어요.' },
    { l: 'l16', type: 'sv_steps', icon: '🔎', seq: [PLAN, CMP, RPT],
      why: '계획을 세운 뒤 옛날과 오늘을 비교하고, 알게 된 점은 보고서로 정리해요.' },
    { l: 'l16', type: 'sv_steps', icon: '🎤', seq: [CMP, RPT, TELL],
      why: '비교해서 알게 된 점을 보고서로 정리해야 문화 해설사처럼 사람들에게 알려 줄 수 있어요.' },
    { l: 'l16', type: 'sv_steps', icon: '🎤', seq: [PLAN, DATA, RPT, TELL],
      why: '계획 → 자료 → 정리 차례로 하고, 정리한 것을 사람들에게 알기 쉽게 알려 줘요.' },
    { l: 'l16', type: 'sv_plan', icon: '📋', seq: [['🎯', '조사할 것 정하기'], ['🔎', '찾을 곳 정하기'], ['📌', '모둠 판에 붙이기']],
      why: '무엇을 조사할지 정해야 어디에서 찾을지 정할 수 있어요. 다 적은 계획서는 모둠 판에 붙여요.' },
    { l: 'l16', type: 'sv_plan', icon: '📋', seq: [['🎯', '조사할 것 정하기'], ['🙋', '맡을 일 나누기'], ['📌', '모둠 판에 붙이기']],
      why: '조사할 것이 정해져야 누가 무엇을 맡을지 나눌 수 있어요. 계획서는 다 쓴 뒤에 붙여요.' },

    // ── l17 「영상으로 소개하기」
    { l: 'l17', type: 'sv_video', icon: '🎬', seq: [PICK, ORD, SUB, SHOW],
      why: '보여 줄 자료를 고르고, 차례를 정하고, 자막을 붙인 뒤 친구에게 소개해요.' },
    { l: 'l17', type: 'sv_video', icon: '🎬', seq: [PICK, ORD, SUB],
      why: '많이 넣는 것보다 고르는 것이 먼저예요. 고른 자료의 차례를 정한 다음 자막을 붙여요.' },
    { l: 'l17', type: 'sv_video', icon: '🎬', seq: [PICK, ORD, SHOW],
      why: '자료를 고르고 차례를 정해야 흐름이 생겨요. 소개는 다 만든 뒤에 해요.' },
    { l: 'l17', type: 'sv_video', icon: '🎬', seq: [ORD, SUB, SHOW],
      why: '차례가 정해져야 장면마다 자막을 붙일 수 있어요. 소개는 맨 뒤예요.' },
    { l: 'l17', type: 'sv_scene', icon: '🛣️', seq: [['🛤️', '좁은 흙길이었어요'], ['🏗️', '길을 넓혔어요'], ['🛣️', '넓은 길이 되었어요']],
      why: '옛날 → 오늘 차례로 놓으면 길이 어떻게 달라졌는지 한눈에 보여요.' },
    { l: 'l17', type: 'sv_scene', icon: '🏢', seq: [['🏚️', '낮은 집이 많았어요'], ['🚧', '낡은 집을 헐었어요'], ['🏢', '높은 건물이 섰어요']],
      why: '낮은 집이 있던 옛 모습에서 시작해야 높은 건물이 선 오늘 모습이 달라진 점으로 보여요.' },
    { l: 'l17', type: 'sv_scene', icon: '🏫', seq: [['🌾', '논이 넓었어요'], ['🚧', '공사를 했어요'], ['🏫', '학교가 섰어요']],
      why: '옛 모습 → 바뀌는 모습 → 오늘 모습 차례예요. 자막만 읽어도 흐름이 보여요.' },
    { l: 'l17', type: 'sv_flow', icon: '📽️', seq: [['🛤️', '옛 거리 사진'], ['🛣️', '오늘 거리 사진'], ['💬', '우리 반 소감']],
      why: '옛날 다음에 오늘을 보여 주면 변화가 잘 보여요. 소감은 다 보여 준 뒤에 말해요.' },
    { l: 'l17', type: 'sv_flow', icon: '📽️', seq: [['🧺', '옛 시장 사진'], ['🏬', '오늘 시장 사진'], ['💬', '우리 반 소감']],
      why: '옛 시장 사진 → 오늘 시장 사진으로 견줄 수 있는 짝을 놓고, 소감으로 마쳐요.' },
    { l: 'l17', type: 'sv_flow', icon: '📽️', seq: [['🏚️', '옛 집 사진'], ['🚧', '공사하는 사진'], ['🏢', '오늘 건물 사진'], ['💬', '우리 반 소감']],
      why: '옛 모습 → 바뀌는 모습 → 오늘 모습 차례로 보여 주고, 우리 반 소감은 맨 뒤에 붙여요.' }
  ];

  var HEAD = {
    sv_steps: function () { return '우리 지역을 조사하는 걸음이에요. 먼저 하는 일부터 놓아요'; },
    sv_plan: function () { return '모둠 조사 계획서를 만들어요. 먼저 하는 일부터 놓아요'; },
    sv_video: function () { return '소개 영상을 만드는 걸음이에요. 먼저 하는 일부터 놓아요'; },
    sv_scene: function () { return '「달라진 우리 지역」 영상 장면이에요. 먼저 보여 줄 장면부터 놓아요'; },
    sv_flow: function () { return '소개 영상의 흐름이에요. 먼저 보여 줄 것부터 놓아요'; }
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
    return { id: 'sv' + k, l: t.l, type: t.type, icon: t.icon, prompt: HEAD[t.type](t),
             cards: shown, order: order, answer: order.join(','), layout: 'row', explain: explainOf(t) };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣'];

  return {
    id: 'survey_order',
    title: '조사·영상 차례대로',
    T: T,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = p.upto === 'l18' ? 'all' : (ORDER.indexOf(p.upto) >= 0 ? p.upto : 'all');
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
