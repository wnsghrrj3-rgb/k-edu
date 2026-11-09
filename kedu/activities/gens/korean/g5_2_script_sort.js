/* gens/korean/g5_2_script_sort.js — 해설일까, 대사일까, 지문일까? (5학년 2학기 국어 6단원 「작품을 감상해요」 l07 · l09 · l11 · l15)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 판의 조각은 교과서 극본 그대로(몇 마디씩 · 괄호와 인물 이름은 걷음).
 * 칸 = 『국어』 278쪽 3번 「극본의 구성 요소를 알아봅시다」 — 극본은 해설, 대사, 지문으로 이루어져요.
 *   📜 해설 — 대체로 극본의 첫 부분에서 때, 곳, 등장인물, 무대 배경 같은 것을 설명하는 부분
 *   💬 대사 — 극본에서 인물이 직접 하는 말
 *   🎬 지문 — 극본에서 인물의 표정, 행동, 말투 같은 것을 설명하려고 괄호로 표현한 부분(지도서 314쪽: 입장·퇴장, 무대 장치나 효과 지시도)
 * 조각 출처(지도서 국어 5-2 6단원 312~326쪽 · 『국어』 쪽):
 *   l07  『국어』 276~279쪽 극본 「까막골 보임누리꽃의 비밀」 — 할아버지 · 솔이 · 토움
 *   all  『국어』 280~281쪽 극본 「샬럿의 거미줄」(조셉 로비넷 글) 1장 — 윌버 · 러비 · 샬럿 · 호머 주커만
 * 판의 꼴: 괄호와 「인물:」 표지를 걷어 낸 조각 한 줄 — 무엇을 말하는 조각인지(때·곳·무대 / 인물이 하는 말 / 표정·행동·등장·퇴장·소리)로 가린다.
 * 진단 축(지도서 313~314쪽):
 *   말 덫 ① 무대를 말해도 장면 가운데의 소리·등장·퇴장 지시는 🎬 지문(「무대 밖에서 꽈당 부딪치는 소리」) — 첫 부분의 무대 배경은 📜 해설
 *   말 덫 ② 「무서워지려고 그래」처럼 마음을 말해도 인물이 직접 한 말이면 💬 대사(「무섭다는 듯 … 숨기며」는 🎬 지문)
 * params: { upto: 'l07'|'all' }  l07 = 7·8차시(까막골) · all = 단원 전체(+ 샬럿의 거미줄)
 * next() → { item, tag, w, cat, type, why, src, explain, l }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_script_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07', 'l09'];
  var CATS = [{ key: 'scene', label: '📜 해설' }, { key: 'line', label: '💬 대사' }, { key: 'direct', label: '🎬 지문' }];
  var NAME = { scene: '해설', line: '대사', direct: '지문' };
  var IS = { scene: '해설이에요', line: '대사예요', direct: '지문이에요' };   // 받침 따라 이에요/예요
  /* 칸이 하는 일 = 『국어』 278쪽 3번 표 · 지도서 313~314쪽 */
  var DOES = { scene: '해설은 대체로 극본의 첫 부분에서 때, 곳, 등장인물, 무대 배경을 설명해요.',
               line: '대사는 극본에서 인물이 직접 하는 말이에요.',
               direct: '지문은 인물의 표정, 행동, 말투나 등장과 퇴장, 무대 효과를 괄호 안에 설명해요.' };
  var KK = '「까막골 보임누리꽃의 비밀」', CW = '「샬럿의 거미줄」';

  /* [차시, 칸, 작품, 조각, 풀이, 덧붙임 풀이(선택 — 말 덫)] */
  var S = [
    // ── l07 · 『국어』 276~279쪽 「까막골 보임누리꽃의 비밀」
    ['l07', 'scene', KK, '깊은 산골 허름한 초가집 앞 평상', '첫 부분에서 이야기가 펼쳐지는 곳을 설명해요.'],
    ['l07', 'scene', KK, '지붕에는 잡초가 듬성듬성 나 있는 허름한 초가집', '첫 부분에서 무대 배경을 설명해요.'],
    ['l07', 'scene', KK, '초가집 한 채가 무대 오른쪽에 있다', '첫 부분에서 무대에 무엇이 어디 있는지 설명해요.'],
    ['l07', 'line', KK, '이 은혜 잊지 않을게요.', '토움이가 할아버지께 직접 한 말이에요.'],
    ['l07', 'line', KK, '이 녀석아! 할아비 귀 안 먹었다!', '할아버지가 토움이에게 직접 한 말이에요.'],
    ['l07', 'line', KK, '전해 내려오는 이야기요?', '토움이와 솔이가 직접 한 말이에요.'],
    ['l07', 'line', KK, '왠지…… 쪼끔 무서워지려고 그래……', '토움이가 직접 한 말이에요.', '마음을 말해도 인물이 직접 한 말이라 대사예요.'],
    ['l07', 'line', KK, '허허허, 조심해서 가려무나.', '할아버지가 직접 한 말이에요.'],
    ['l07', 'direct', KK, '할아버지 귀에 바짝 다가서서 큰 목소리로', '토움이의 행동과 말투를 설명해요.'],
    ['l07', 'direct', KK, '깜짝 놀라며', '할아버지의 표정과 행동을 설명해요.'],
    ['l07', 'direct', KK, '무섭다는 듯 솔이 뒤로 살짝 몸을 숨기며', '토움이의 행동을 설명해요.', '「무섭다는 듯」 마음이 보여도 행동을 설명하는 괄호 속 말이라 지문이에요.'],
    ['l07', 'direct', KK, '토움이를 토닥거리며', '솔이의 행동을 설명해요.'],
    ['l07', 'direct', KK, '솔이는 토움이 손을 잡고 퇴장하고', '인물이 무대에서 나가는 퇴장을 알려 줘요.'],
    // ── l09 · 『국어』 280~281쪽 「샬럿의 거미줄」 1장
    ['l09', 'scene', CW, '어느 해 늦여름', '첫 부분에서 이야기가 펼쳐지는 때를 설명해요.'],
    ['l09', 'scene', CW, '어느 시골 마을 주커만 농장의 헛간', '첫 부분에서 이야기가 펼쳐지는 곳을 설명해요.'],
    ['l09', 'scene', CW, '나오는 인물: 샬럿, 윌버, 펀 애러블, 러비', '첫 부분에서 등장인물을 알려 줘요.'],
    ['l09', 'line', CW, '진짜 기분 나쁜 꿈이야.', '윌버가 직접 한 말이에요.'],
    ['l09', 'line', CW, '여기 있다, 꿀꿀아. 아침이다.', '러비가 윌버에게 직접 한 말이에요.'],
    ['l09', 'line', CW, '무슨 소리지? 윌버, 어디 있니?', '샬럿이 직접 한 말이에요.'],
    ['l09', 'line', CW, '돼지가 없어졌구먼!', '호머 주커만이 직접 한 말이에요.'],
    ['l09', 'direct', CW, '러비가 여물통을 들고 들어온다', '인물이 무대에 들어오는 것을 알려 줘요.'],
    ['l09', 'direct', CW, '거미줄의 글자를 보고', '러비의 행동을 설명해요.'],
    ['l09', 'direct', CW, '샬럿이 하품을 하면서 등장한다', '인물의 등장과 행동을 알려 줘요.'],
    ['l09', 'direct', CW, '무대 밖에서 꽈당 부딪치는 소리 들린다', '장면 가운데 들리는 소리(무대 효과)를 알려 줘요.', '무대를 말해도 장면 가운데의 소리 지시는 해설이 아니라 지문이에요.']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function build(r) {
    return { l: r[0], cat: r[1], type: r[1], tag: r[2], w: r[3], src: r[2], why: r[4], item: r[2] + ' — ' + r[3],
             explain: '「' + r[3] + '」 — ' + IS[r[1]] + '. ' + r[4] + ' ' + (r[5] ? r[5] + ' ' : '') + DOES[r[1]] };
  }

  return {
    id: 'g5_2_script_sort',
    title: '해설일까, 대사일까, 지문일까?',
    categories: CATS,
    S: S, ORDER: ORDER, NAME: NAME, IS: IS, DOES: DOES,
    create: function (params, rng) {
      var p = params || {};
      var upto = p.upto === 'l07' ? 'l07' : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : 0;
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var deck = shuffle(rng, idx);
      var last = -1, lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (k === last) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = k;
          return build(S[k]);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.item + ' → □ 해설 □ 대사 □ 지문'; },
    printAnswer: function (q) { return q.item + ' → ' + NAME[q.cat]; },
    printHead: '극본의 한 조각을 읽고, 해설인지 대사인지 지문인지 □에 ✓ 하세요. 극본은 해설, 대사, 지문으로 이루어져요.'
  };
}));
