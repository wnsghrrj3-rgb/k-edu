/* gens/korean/story_order.js — 차례대로 놓아요 (1학년 1학기 국어 7단원 「알맞은 낱말을 찾아요」 l07~l13)
 * 순수 함수·DOM 무관 (§9-3). 장르 order_story(순서 맞추기)가 쓴다.
 * params: { upto: 'l07'|'l08'|'l09'|'l10'|'l11'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 틀이 덱 앞머리
 * next() → { prompt, icon, cards:[{t,e?}](섞임), order:[바른 차례의 카드 번호], answer:'2,0,1', layout, type, explain }
 *
 * type(문항 단위 · 진단 축 — 무엇을 보고 차례를 정하는가):
 *   word_order  낱말 카드 차례 — 누가 → 무엇을 → 어찌하다 (l07·l08·l11). 문장은 정본 그 차시까지 나온 문장 그대로(스모크 B).
 *   scene_time  이야기 장면 차례 — 처음 → 가운데 → 끝, 시간이 흐르는 차례 (l09)
 *   cause_next  앞 일과 뒤 일 — 앞 일이 있어야 뒤 일이 생기는 차례 (l10 「이어지는 문장」)
 * 장면 카드는 하나하나가 「누가 무엇을 하다」 문장이다(l07 에서 배운 꼴) — 장면을 문장으로 만드는 단원의 뜻 그대로.
 * 차례가 둘로 읽히는 이야기는 틀에 넣지 않는다(답이 둘인 문항 0) — 다음 일이 앞 일 없이는 생길 수 없게 고른다.
 * 그림책 본문·인물명 0 — l09 고양이 이야기는 정본 장면 안내(img_hint)만, 나머지는 자체 구성(정본 저작권 방침 그대로).
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['story_order'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07', 'l08', 'l09', 'l10', 'l11'];
  var PROMPT = {
    word_order: '낱말 카드를 차례로 놓아 문장을 만들어요',
    scene_time: '이야기 장면을 일어난 차례로 놓아요',
    cause_next: '어떤 일이 먼저 일어났을까요? 차례로 놓아요'
  };

  /* 틀 — l 차시 · type · icon · seq 바른 차례(word_order 는 낱말 셋, 나머지는 [문장, 그림]) · why 풀이 끝말 */
  var T = [
    // l07 「누가 무엇을 하다」 세 조각 — 정본 l07 문장
    { l: 'l07', type: 'word_order', icon: '🐿️', seq: ['다람쥐가', '도토리를', '먹는다'] },
    { l: 'l07', type: 'word_order', icon: '⚾', seq: ['아이가', '공을', '던진다'] },
    { l: 'l07', type: 'word_order', icon: '📚', seq: ['엄마가', '책을', '읽는다'] },
    { l: 'l07', type: 'word_order', icon: '🥕', seq: ['토끼가', '당근을', '먹는다'] },
    // l08 두 가지 문장 가려 쓰기 — 움직임 문장(정본 l08)
    { l: 'l08', type: 'word_order', icon: '🍈', seq: ['동생이', '참외를', '먹는다'] },
    { l: 'l08', type: 'word_order', icon: '🧺', seq: ['아빠가', '빨래를', '넌다'] },
    { l: 'l08', type: 'word_order', icon: '🎹', seq: ['누나가', '피아노를', '친다'] },

    // l09 이야기 보고 문장 만들기① — 장면 차례(시간이 흐르는 차례)
    { l: 'l09', type: 'scene_time', icon: '🐱', seq: [['고양이가 책을 펼친다', '📖'], ['고양이가 책 속으로 들어간다', '✨'], ['고양이가 배를 탄다', '⛵'], ['고양이가 책을 안고 잠든다', '😴']],
      why: '책을 펼쳐야 책 속으로 들어가고, 책 속 바다에서 배를 타요. 여행이 끝나면 잠이 들어요.' },
    { l: 'l09', type: 'scene_time', icon: '🧒', seq: [['아이가 아침에 일어난다', '🌅'], ['아이가 학교에 간다', '🎒'], ['아이가 급식을 먹는다', '🍱'], ['아이가 집에 돌아온다', '🏠']],
      why: '아침에 일어나 학교에 가고, 학교에서 급식을 먹은 뒤 집에 돌아와요.' },
    { l: 'l09', type: 'scene_time', icon: '🐶', seq: [['강아지가 공을 본다', '👀'], ['강아지가 공을 쫓아간다', '🐕'], ['강아지가 공을 문다', '🎾'], ['강아지가 공을 가져온다', '🤲']],
      why: '공을 봐야 쫓아가고, 쫓아가야 물 수 있어요. 문 공을 가져와요.' },
    { l: 'l09', type: 'scene_time', icon: '🐿️', seq: [['다람쥐가 도토리를 줍는다', '🌰'], ['다람쥐가 도토리를 굴로 나른다', '🐾'], ['다람쥐가 도토리를 굴에 숨긴다', '🕳️']],
      why: '도토리를 주워야 나를 수 있고, 굴까지 날라야 굴에 숨길 수 있어요.' },
    { l: 'l09', type: 'scene_time', icon: '🖍️', seq: [['동생이 종이를 꺼낸다', '📄'], ['동생이 그림을 그린다', '🖍️'], ['동생이 그림을 벽에 붙인다', '🖼️']],
      why: '종이를 꺼내야 그림을 그리고, 다 그린 그림을 벽에 붙여요.' },
    { l: 'l09', type: 'scene_time', icon: '🏖️', seq: [['가족이 바다에 간다', '🚗'], ['아이가 모래성을 쌓는다', '🏰'], ['파도가 모래성을 덮친다', '🌊'], ['아이가 모래성을 다시 쌓는다', '💪']],
      why: '바다에 가서 모래성을 쌓아요. 파도가 덮친 뒤에 「다시」 쌓아요.' },
    { l: 'l09', type: 'scene_time', icon: '🐰', seq: [['토끼가 밭으로 달린다', '🏃'], ['토끼가 당근을 뽑는다', '🥕'], ['토끼가 당근을 먹는다', '😋']],
      why: '밭에 가야 당근을 뽑고, 뽑아야 먹을 수 있어요.' },

    // l10 이야기 보고 문장 만들기② — 이어지는 문장(앞 일이 뒤 일을 부른다)
    { l: 'l10', type: 'cause_next', icon: '🐻', seq: [['곰이 꽃 냄새를 맡는다', '🌸'], ['곰이 재채기를 한다', '🤧'], ['곰이 코를 닦는다', '🧻']],
      why: '꽃 냄새를 맡아서 코가 간질간질, 그래서 재채기를 해요. 재채기를 한 뒤에 코를 닦아요.' },
    { l: 'l10', type: 'cause_next', icon: '🦊', seq: [['여우가 물을 끓인다', '🔥'], ['여우가 차를 마신다', '🍵'], ['여우가 컵을 씻는다', '🫧']],
      why: '물을 끓여야 따뜻한 차를 마실 수 있어요. 다 마시고 컵을 씻어요.' },
    { l: 'l10', type: 'cause_next', icon: '🎣', seq: [['아버지께서 낚싯대를 던지신다', '🎣'], ['물고기가 미끼를 문다', '🐟'], ['아버지께서 물고기를 잡으신다', '🙌']],
      why: '낚싯대를 던져야 물고기가 미끼를 물고, 미끼를 물어야 물고기를 잡을 수 있어요.' },
    { l: 'l10', type: 'cause_next', icon: '🌧️', seq: [['먹구름이 몰려온다', '☁️'], ['비가 내린다', '🌧️'], ['아이가 우산을 편다', '☂️']],
      why: '먹구름이 몰려와서 비가 내려요. 비가 내리니까 우산을 펴요.' },
    { l: 'l10', type: 'cause_next', icon: '🌱', seq: [['아이가 씨앗을 심는다', '🫘'], ['아이가 물을 준다', '💧'], ['싹이 쏙 난다', '🌱']],
      why: '씨앗을 심고 물을 주어야 싹이 나요. 싹은 심기 전에 날 수 없어요.' },
    { l: 'l10', type: 'cause_next', icon: '✏️', seq: [['연필심이 부러진다', '💥'], ['아이가 연필을 깎는다', '✏️'], ['아이가 글씨를 쓴다', '📝']],
      why: '연필심이 부러져서 연필을 깎아요. 깎아야 다시 글씨를 쓸 수 있어요.' },
    { l: 'l10', type: 'cause_next', icon: '🎈', seq: [['아기가 풍선을 놓친다', '🎈'], ['풍선이 하늘로 날아간다', '☁️'], ['아기가 엉엉 운다', '😭']],
      why: '풍선을 놓쳐서 풍선이 날아가요. 풍선이 날아가서 아기가 울어요.' },
    { l: 'l10', type: 'cause_next', icon: '🍎', seq: [['아이가 사과를 씻는다', '🚰'], ['엄마가 사과를 깎는다', '🔪'], ['아이가 사과를 먹는다', '😋']],
      why: '사과를 씻고 깎아야 먹을 수 있어요. 먹은 사과는 깎을 수 없어요.' },
    { l: 'l10', type: 'cause_next', icon: '⛄', seq: [['눈이 펑펑 내린다', '❄️'], ['아이들이 눈을 굴린다', '⚪'], ['아이들이 눈사람을 만든다', '⛄']],
      why: '눈이 내려야 눈을 굴릴 수 있고, 굴린 눈으로 눈사람을 만들어요.' },

    // l11 낱말 카드로 문장 만들기① — 정본 l11 카드 문장
    { l: 'l11', type: 'word_order', icon: '🖍️', seq: ['동생이', '그림을', '그린다'] },
    { l: 'l11', type: 'word_order', icon: '⚽', seq: ['친구가', '공을', '찬다'] },
    { l: 'l11', type: 'word_order', icon: '🎤', seq: ['엄마가', '노래를', '부른다'] },
    { l: 'l11', type: 'word_order', icon: '🐰', seq: ['토끼가', '도토리를', '먹는다'] },
    { l: 'l11', type: 'word_order', icon: '🌰', seq: ['다람쥐가', '도토리를', '숨긴다'] }
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function cardsOf(t) {
    return t.seq.map(function (s) { return t.type === 'word_order' ? { t: s } : { t: s[0], e: s[1] }; });
  }

  function explainOf(t) {
    if (t.type === 'word_order') {
      return '누가(' + t.seq[0] + ') → 무엇을(' + t.seq[1] + ') → 어찌하다(' + t.seq[2] + ') 차례로 놓아야 「' + t.seq.join(' ') + '」 문장이 돼요.';
    }
    var words = t.seq.length === 4 ? ['먼저', '그다음', '그리고', '마지막에'] : ['먼저', '그다음', '마지막에'];
    return t.seq.map(function (s, k) { return words[k] + ' ' + s[0]; }).join(' → ') + '. ' + t.why;
  }

  function build(t, k, rng) {
    var cards = cardsOf(t);
    var idx = cards.map(function (_, j) { return j; });
    var perm = shuffle(rng, idx);
    while (perm.join() === idx.join()) perm = shuffle(rng, idx);      // 처음부터 맞게 놓여 있는 판 0 (다시 섞기 — 자리 쏠림 없이)
    var shown = perm.map(function (j) { return cards[j]; });
    var order = idx.map(function (j) { return perm.indexOf(j); });    // 바른 차례 = 섞인 카드 번호
    return { id: 'so' + k, l: t.l, type: t.type, icon: t.icon, prompt: PROMPT[t.type],
             cards: shown, order: order, answer: order.join(','), layout: t.type === 'word_order' ? 'row' : 'col',
             explain: explainOf(t) };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣', '㉤'];

  return {
    id: 'story_order',
    title: '차례대로 놓아요',
    T: T,
    ORDER: ORDER,
    PROMPT: PROMPT,
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
