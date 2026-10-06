/* gens/science/life_order.js — 한살이 차례대로 (3학년 1학기 과학 4단원 「생물의 한살이」 l02·l04·l07·l10)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)의 둘째 실물 — 엔진 무개변, 생성기만 새로.
 * params: { upto: 'l02'|'l04'|'l07'|'l10'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 틀이 덱 앞머리
 * next() → { prompt, icon, cards:[{t,e?}](섞임), order:[바른 차례의 카드 번호], answer:'2,0,1', layout, type, explain }
 *
 * type(문항 단위 · 진단 축 — 무엇을 보고 차례를 정하는가):
 *   life_stage  한살이 단계 이름 차례 — 처음(알·새끼·씨)부터. 번데기가 있는 곤충·없는 곤충·알을 낳는 동물·식물(row)
 *   life_scene  자라는 모습 보고 차례 — 단계 이름 대신 모습·하는 일(잎 뒷면 노란 점·허물·움직이지 않음…)로 단계를 알아본다(col)
 *   life_loop   한살이는 다시 이어져요 — 가운데 단계부터 한 바퀴. 「다 자라면 끝」 오개념 축(row)
 *
 * 차례가 둘로 읽히는 판 0 — 한살이는 고리라서 시작을 정해 준다: life_stage·life_scene = 「처음부터」(한살이는 알·새끼·씨에서 시작 — 정본 l08·l10),
 *   life_loop = 시작 단계를 물음에 박는다. life_scene 의 마지막 장은 「다시」로 끝을 못 박거나, 첫 장만 될 수 있는 모습을 둔다.
 * 낱말은 정본 data/g3_science_u4.js 그 차시까지 나온 것만(스모크 B) — 무당벌레·사슴벌레·메뚜기는 l10, 개구리·병아리·강아지는 l04, 식물은 l07.
 * 정본 가드 그대로: 「햇빛」은 l05 부터(l02·l04 틀에 0) · 완전 변태·불완전 변태·난생·태생(교사 몫) 0 · 상표 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['life_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l02', 'l04', 'l07', 'l10'];

  function prompt(t) {
    if (t.type === 'life_stage') return t.who + '의 한살이를 처음부터 차례로 놓아요';
    if (t.type === 'life_scene') return t.who + t.ga + ' 자라는 모습을 처음부터 차례로 놓아요';
    return t.who + '의 한살이는 다시 이어져요. 「' + t.seq[0][0] + '」부터 한 바퀴 놓아요';
  }

  /* 틀 — l 차시 · type · who 생물 · ga 조사(life_scene) · icon · seq 바른 차례 [글, 그림] · why 풀이 끝말 */
  var T = [
    // ── l02 배추흰나비의 한살이(2·3차시) — 알 → 애벌레 → 번데기 → 어른벌레
    { l: 'l02', type: 'life_stage', who: '배추흰나비', icon: '🦋',
      seq: [['알', '🥚'], ['애벌레', '🐛'], ['번데기', '🟫'], ['어른벌레', '🦋']],
      why: '알에서 나온 애벌레가 번데기를 거쳐 어른벌레가 돼요.' },
    { l: 'l02', type: 'life_scene', who: '배추흰나비', ga: '가', icon: '🥬',
      seq: [['잎 뒷면에 노란 점처럼 붙어 있어요', '🥬'], ['잎을 갉아 먹으며 쑥쑥 자라요', '🍃'], ['한곳에 붙어 움직이지도 먹지도 않아요', '⏸️'], ['날개로 날며 꽃에서 꿀을 빨아요', '🌸']],
      why: '잎 뒷면의 노란 점은 알, 잎을 갉아 먹는 것은 애벌레, 움직이지 않는 것은 번데기, 꿀을 빠는 것은 어른벌레예요.' },
    { l: 'l02', type: 'life_scene', who: '배추흰나비', ga: '가', icon: '🔍',
      seq: [['크기가 약 1mm로 아주 작아요', '📏'], ['몸이 커지면 허물을 벗어요', '👕'], ['겉은 조용하지만 속에서 몸이 바뀌어요', '🤫'], ['날개 두 쌍, 다리 세 쌍이 있어요', '🪽']],
      why: '1mm 는 알, 허물을 벗는 것은 애벌레, 속에서 몸이 바뀌는 것은 번데기, 날개 두 쌍은 어른벌레예요.' },
    { l: 'l02', type: 'life_loop', who: '배추흰나비', icon: '🔁',
      seq: [['어른벌레', '🦋'], ['알', '🥚'], ['애벌레', '🐛'], ['번데기', '🟫']],
      why: '어른벌레가 다시 잎 뒷면에 알을 낳아요. 그래서 한살이는 다시 이어져요.' },
    { l: 'l02', type: 'life_loop', who: '배추흰나비', icon: '🔁',
      seq: [['번데기', '🟫'], ['어른벌레', '🦋'], ['알', '🥚'], ['애벌레', '🐛']],
      why: '번데기에서 어른벌레가 나오고, 어른벌레가 다시 알을 낳아요.' },

    // ── l04 다양한 동물의 한살이 — 알을 낳는 동물 · 새끼를 낳는 동물
    { l: 'l04', type: 'life_stage', who: '닭', icon: '🐔',
      seq: [['알', '🥚'], ['병아리', '🐣'], ['어린 닭', '🐥'], ['다 자란 닭', '🐔']],
      why: '알에서 병아리가 깨어나 자라면 다 자란 닭이 돼요.' },
    { l: 'l04', type: 'life_stage', who: '개구리', icon: '🐸',
      seq: [['알', '🥚'], ['올챙이', '💧'], ['개구리', '🐸']],
      why: '개구리는 알을 낳아요. 올챙이에게는 다리가 없지만 자라면서 다리가 생겨 개구리가 돼요.' },
    { l: 'l04', type: 'life_scene', who: '닭', ga: '이', icon: '🐣',
      seq: [['단단한 껍데기에 싸여 있어요', '🥚'], ['껍데기를 깨고 병아리가 나와요', '🐣'], ['병아리가 자라 어린 닭이 돼요', '🐥'], ['다 자란 닭이 다시 알을 낳아요', '🐔']],
      why: '단단한 껍데기에 싸인 알에서 병아리가 깨어나 자라고, 다 자란 닭이 다시 알을 낳아요.' },
    { l: 'l04', type: 'life_scene', who: '개', ga: '가', icon: '🐶',
      seq: [['어미 개가 새끼를 낳아요', '🐕'], ['강아지가 어미젖을 먹고 자라요', '🍼'], ['강아지가 자라 다 자란 개가 돼요', '🐶']],
      why: '개는 알이 아니라 새끼를 낳아요. 새끼는 어미젖을 먹고 자라요.' },
    { l: 'l04', type: 'life_loop', who: '닭', icon: '🔁',
      seq: [['다 자란 닭', '🐔'], ['알', '🥚'], ['병아리', '🐣'], ['어린 닭', '🐥']],
      why: '다 자란 닭이 다시 알을 낳아요. 다 자랐다고 한살이가 끝나지 않고 다시 이어져요.' },

    // ── l07 여러 가지 식물의 한살이 — 모든 식물: 씨 → 싹 → 자람 → 꽃 → 열매
    { l: 'l07', type: 'life_stage', who: '강낭콩', icon: '🫘',
      seq: [['씨', '🫘'], ['싹', '🌱'], ['자람', '🌿'], ['꽃', '🌸'], ['열매', '🫛']],
      why: '모든 식물은 씨에서 시작해 싹이 트고, 자라고, 꽃이 피고, 열매를 맺어요.' },
    { l: 'l07', type: 'life_stage', who: '감나무', icon: '🌳',
      seq: [['씨', '🟤'], ['싹', '🌱'], ['자람', '🌳'], ['꽃', '🌼'], ['열매', '🟠']],
      why: '감나무는 여러 해 살지만, 거치는 과정은 강낭콩과 같아요. 다른 점은 사는 기간이에요.' },
    { l: 'l07', type: 'life_stage', who: '벼', icon: '🌾',
      seq: [['씨', '🟤'], ['싹', '🌱'], ['자람', '🌿'], ['꽃', '🌼'], ['열매', '🌾']],
      why: '벼는 한 해만 살고 한살이를 마치는 한해살이 식물이에요. 그래도 씨에서 시작해 열매를 맺어요.' },
    { l: 'l07', type: 'life_scene', who: '강낭콩', ga: '이', icon: '🪴',
      seq: [['씨에서 싹이 터요', '🌱'], ['햇빛을 받으며 쑥쑥 자라요', '☀️'], ['꽃이 피어요', '🌸'], ['열매를 맺어 다시 씨를 남겨요', '🫛']],
      why: '씨에서 싹이 트고, 햇빛을 받으며 자라 꽃이 피고, 열매를 맺어 다시 씨를 남겨요.' },
    { l: 'l07', type: 'life_loop', who: '강낭콩', icon: '🔁',
      seq: [['꽃', '🌸'], ['열매', '🫛'], ['씨', '🫘'], ['싹', '🌱'], ['자람', '🌿']],
      why: '꽃이 핀 뒤 열매를 맺어 다시 씨를 남기고, 그 씨에서 다시 싹이 터요.' },

    // ── l10 톡톡! 과학 — 번데기를 거치는 곤충 · 거치지 않는 곤충
    { l: 'l10', type: 'life_stage', who: '잠자리', icon: '🪽',
      seq: [['알', '🥚'], ['애벌레', '💧'], ['어른벌레', '🪽']],
      why: '잠자리는 번데기를 거치지 않아요. 애벌레는 물속에서 살아요.' },
    { l: 'l10', type: 'life_stage', who: '메뚜기', icon: '🦗',
      seq: [['알', '🥚'], ['애벌레', '🌿'], ['어른벌레', '🦗']],
      why: '메뚜기도 번데기 없이 어른벌레가 돼요. 곤충마다 한살이가 달라요.' },
    { l: 'l10', type: 'life_stage', who: '무당벌레', icon: '🐞',
      seq: [['알', '🥚'], ['애벌레', '🐛'], ['번데기', '🟫'], ['어른벌레', '🐞']],
      why: '무당벌레는 번데기를 거치는 곤충이에요. 배추흰나비와 같은 차례예요.' },
    { l: 'l10', type: 'life_stage', who: '사슴벌레', icon: '🪲',
      seq: [['알', '🥚'], ['애벌레', '🐛'], ['번데기', '🟫'], ['어른벌레', '🪲']],
      why: '사슴벌레도 번데기를 거치는 곤충이에요. 모든 곤충은 알에서 시작해요.' },
    { l: 'l10', type: 'life_scene', who: '잠자리', ga: '가', icon: '🏞️',
      seq: [['알에서 애벌레가 나와요', '🥚'], ['애벌레가 물속에서 살아요', '💧'], ['어른벌레가 되어 하늘을 날아요', '🪽']],
      why: '잠자리 애벌레는 물속에서 살다가, 어른벌레가 되면 물 밖으로 나와 하늘을 날아요.' },
    { l: 'l10', type: 'life_loop', who: '잠자리', icon: '🔁',
      seq: [['어른벌레', '🪽'], ['알', '🥚'], ['애벌레', '💧']],
      why: '잠자리 어른벌레도 알을 낳아요. 번데기 없이 한살이가 다시 이어져요.' }
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function explainOf(t) {
    return t.seq.map(function (s) { return s[0]; }).join(' → ') + '. ' + t.why;
  }

  function build(t, k, rng) {
    var cards = t.seq.map(function (s) { return { t: s[0], e: s[1] }; });
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓인 판 0 (다시 섞기 — 자리 쏠림 없이)
    var shown = perm.map(function (j) { return cards[j]; });
    var order = idx.map(function (j) { return perm.indexOf(j); });
    return { id: 'lo' + k, l: t.l, type: t.type, icon: t.icon, who: t.who, prompt: prompt(t),
             cards: shown, order: order, answer: order.join(','), layout: t.type === 'life_scene' ? 'col' : 'row',
             explain: explainOf(t) };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣', '㉤'];

  return {
    id: 'life_order',
    title: '한살이 차례대로',
    T: T,
    ORDER: ORDER,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 ? p.upto : 'all';
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
      return q.icon + ' ' + q.prompt + '<br>' + q.cards.map(function (c, k) { return MARK[k] + ' ' + (c.e ? c.e + ' ' : '') + c.t; }).join(' &nbsp; ') +
        '<br>' + q.order.map(function () { return '(　　)'; }).join(' → ');
    },
    printAnswer: function (q) { return q.order.map(function (k) { return MARK[k]; }).join(' → '); },
    printHead: '카드를 알맞은 차례로 놓아 기호를 써 보세요.'
  };
}));
