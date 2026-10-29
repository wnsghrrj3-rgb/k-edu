/* gens/social/culture_hunt.js — 다양한 문화 글 속 찾기 (3학년 2학기 사회 1단원 「사회 변화와 다양한 문화」 주제② 문화
 *   l07 = 9차시 · l08 = 10·11차시 · l09 = 12·13차시 · l10 = 14·15차시 · l11·l12 정리)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 덩이 토큰)가 쓴다 — 토큰 하나 = 뜻 덩이 하나(행동·모습·태도 한 덩이).
 * params: { upto: 'l07'|'l08'|'l09'|'l10'|'all' }  단원 문화 쪽 처음부터 그 차시까지 누적 · 이번 차시 글이 덱 앞머리
 * next() → { prompt, icon, src, lines:[[tok…]…], tokens:[{t,hit} | {t:' ',sep:true}], answer:[…], type, explain, l }
 *
 * 유형 = 물음 = 진단 축(정본 data/g3s2_social_u1.js):
 *   cu_not   (l07) 문화가 아닌 행동 — 태어날 때부터 하게 되는 행동(배가 고파서 먹기 · 졸려서 하품·잠, s05·s10)
 *            덫 w = 무엇을 어떻게 먹는지·인사하는 방법(s08 watch 「먹는 것」과 「먹는 방식」) — 같은 「먹어요」가 두 칸에
 *   cu_many  (l08) 이주민·1인 가구·반려동물과 관련 있는 모습 — 판마다 외국 것이 아닌 정답(1인 가구·반려동물)이 하나 넘게(s03 watch)
 *            덫 o = 닮은 보통 모습(그네 타는 놀이터 ↔ 반려동물 놀이터 · 가족과 함께 사는 집 ↔ 혼자 사는 이웃)
 *   cu_disc  (l09) 차별 = 편견을 가지고 다르게 대우한 행동 · 덫 p = 마음속 생각(편견) — s06 watch 「편견(생각)과 차별(대우)」
 *   cu_shade (l09) 생긴 문제(그늘 면) · 덫 b = 좋아진 점(밝은 면) — s07 두 면 · s08 오개념 「아무 문제도 생기지 않았어요」
 *   cu_attit (l10) 바람직하지 못한 태도(탑이 기울어요, s07) · 덫 n = 「~지 않아요」 바른 태도(낱말 「차별」·「비난」이 들어 있어도)
 *            · r = 다른 바른 태도 · s08 오개념 「우리 문화를 더 소중하게」 = 찾을 덩이
 * 글 = 정본 l07 s04·s07 · l08 s07 · l09 s05~s07 · l10 s04·s07·s10 문장 그대로 + 같은 꼴 자체 구성. 낱말은 정본 그 차시까지
 *   (이주민·1인 가구·반려동물 l08 · 편견·차별·피부색·갈등 l09 · 무시·경계·비난·목줄·서툰 l10 — 스모크가 정본 첫 등장을 잼).
 *   사회 변화(저출산·고령화·지능정보화·세계화 — change_sort·claim_change 몫) 0 · 다문화·초대장(l11) 0 · 차단 어휘 0.
 * 표지 문법(이 파일 안): [찾을 덩이] · {w|o|p|b|n|r:덫} · | = 덩이 사이 · / = 줄 바꿈
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['culture_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07', 'l08', 'l09', 'l10'];
  var PROMPT = {
    cu_not: '😴 문화가 아닌 행동을 모두 찾아 눌러요',
    cu_many: '🏘️ 이주민·1인 가구·반려동물과 관련 있는 모습을 모두 눌러요',
    cu_disc: '⚖️ 차별(다르게 대우한 행동)을 모두 찾아 눌러요',
    cu_shade: '🌥️ 생긴 문제(그늘 면)를 모두 찾아 눌러요',
    cu_attit: '⚠️ 바람직하지 못한 태도를 모두 찾아 눌러요'
  };
  var TYPE_L = { cu_not: 'l07', cu_many: 'l08', cu_disc: 'l09', cu_shade: 'l09', cu_attit: 'l10' };

  /* [차시, 아이콘, 글 이름, type, 글] */
  var T = [
    // ── l07 · 정본 s04 세 가족 생일상 · s05 태어날 때부터 하게 되는 행동 · s07 여러 나라 학교 · s10 기본 문제 보기
    ['l07', '🎂', '곰이네 생일날', 'cu_not',
      '{w:생일 아침에 미역국을 끓여 먹어요.} | {w:숟가락과 젓가락으로 먹어요.} / 밤이 되자 | [졸려서 하품을 해요.] | [졸려서 잠을 자요.]'],
    ['l07', '🏫', '펭이의 학교', 'cu_not',
      '{w:선생님께 고개를 숙여 인사해요.} / 점심시간에 | [배가 고파서 밥을 먹어요.] / {w:숟가락과 젓가락으로 밥을 먹어요.} | {w:웃어른께는 높임말을 써요.}'],
    ['l07', '🍽️', '할아버지 댁에서', 'cu_not',
      '{w:웃어른께 허리를 숙여 인사해요.} / [배가 고파서 음식을 먹어요.] | {w:숟가락과 젓가락으로 음식을 먹어요.} / 저녁을 먹고 나니 | [졸려서 하품을 해요.]'],
    ['l07', '🍜', '친구네 생일상', 'cu_not',
      '{w:친구네는 생일에 면발이 긴 국수를 먹어요.} / 노래를 부르다가 | [졸려서 하품을 해요.] / {w:가족이 모여 생일을 축하해요.}'],
    ['l07', '🌙', '곰이의 하루', 'cu_not',
      '{w:아침마다 가족에게 인사해요.} / 밖에서 놀고 오니 | [배가 고파서 밥을 먹어요.] | {w:가족과 함께 숟가락으로 밥을 먹어요.} / 밤늦게 | [졸려서 잠을 자요.]'],
    ['l07', '🌐', '여러 나라 학교', 'cu_not',
      '{w:중국은 9월에 새 학년이 시작해요.} / {w:미국에서는 선생님 이름을 부르며 악수해요.} / 수업 시간에 | [졸려서 하품을 했어요.]'],
    // ── l08 · 정본 s03 우리 동네 한 바퀴 · s04 다양한 나라의 물건과 음식을 파는 거리 · s05 1인 가구 · s06 반려동물 · s07 세 깃발
    ['l08', '🏘️', '우리 동네 한 바퀴', 'cu_many',
      '[인도 음식점에서 맨손으로 먹는 사람들] / {o:빵집 앞에 선 긴 줄} / [강아지가 뛰노는 반려동물 놀이터] | {o:아이들이 그네를 타는 놀이터}'],
    ['l08', '🛒', '동네 가게 거리', 'cu_many',
      '[「혼자 만들어 먹는 맛있는 집밥」 반찬 가게 간판] / {o:채소를 파는 가게} | {o:학교 앞 문구점} / [다양한 나라의 물건과 음식을 파는 거리]'],
    ['l08', '🌳', '공원 산책', 'cu_many',
      '[강아지와 함께 산책하는 사람] | {o:공원 의자에서 책을 읽는 사람} / [반려동물과 관련 있는 행사 안내] | {o:꽃을 심는 날 안내}'],
    ['l08', '🏠', '우리 아파트', 'cu_many',
      '[혼자 사는 이웃 할아버지] | {o:엄마, 아빠와 함께 사는 옆집 동생} / [3층 집에서 함께 사는 고양이] | {o:아파트 앞 꽃밭}'],
    ['l08', '💒', '토요일 동네', 'cu_many',
      '[다른 나라에서 옮겨 와 사는 이웃 가족] / {o:동네를 지나가는 버스} | {o:문을 연 꽃집} / [혼자 사는 사람이 장을 보는 동네 상점]'],
    ['l08', '📋', '동네 게시판', 'cu_many',
      '[외국인 이주민을 위한 프로그램 안내] | {o:어린이 그림 대회 안내} / [반려동물과 함께하는 행사 안내] | {o:동네 청소하는 날 안내}'],
    // ── l09 · 정본 s06 편견(생각)·차별(대우) · 종교·언어·피부색 · 반려동물 갈등 · s12 도전 「생각」과 「대우」
    ['l09', '🏫', '피부색이 다른 친구', 'cu_disc',
      '피부색이 다른 친구가 우리 반에 왔어요. / {p:한 아이는 그 친구가 이상하다고 생각했어요.} / [그래서 모둠 놀이에 그 친구만 넣어 주지 않았어요.]'],
    ['l09', '🗣️', '언어가 다른 친구', 'cu_disc',
      '언어가 다른 친구가 우리 반에 왔어요. / {p:어떤 아이는 언어가 다른 친구는 공부를 못할 거라고 생각했어요.} / [그래서 그 친구가 발표할 때 듣지 않았어요.] / [자리도 그 친구만 맨 끝으로 보냈어요.]'],
    ['l09', '🐕', '강아지와 사는 이웃', 'cu_disc',
      '강아지와 사는 이웃이 이사를 왔어요. / {p:어떤 사람은 강아지와 사는 집은 늘 소음이 클 거라고 생각했어요.} / [그래서 그 집 사람에게만 인사를 하지 않았어요.]'],
    ['l09', '🙏', '종교가 다른 이웃', 'cu_disc',
      '종교가 다른 이웃이 이사를 왔어요. / {p:한 사람은 그 종교가 이상하다고 생각했어요.} / [그래서 동네 잔치에 그 이웃만 부르지 않았어요.]'],
    // ── l09 · 정본 s04·s05 좋아진 점 · s06 생긴 문제 · s07 「두 면을 뒤집어 봐요」 세 카드 · s14 갈등 까닭
    ['l09', '🌏', '외국인 이주민 카드', 'cu_shade',
      '{b:여러 나라 문화를 경험할 기회가 늘었어요.} / {b:베트남에서 오신 선생님께 베트남 설날 이야기를 들었어요.} / [언어가 다르다는 까닭으로 부당한 대우를 받는 사람이 있어요.]'],
    ['l09', '🏠', '1인 가구 카드', 'cu_shade',
      '{b:작은 가전제품이 인기를 끌어요.} / {b:적은 양을 포장한 상품이 많아졌어요.} / [아플 때 도움을 청할 사람이 없어 어려움을 겪기도 해요.] / [외로움이나 불안함을 느끼기도 해요.]'],
    ['l09', '🐾', '반려동물 카드', 'cu_shade',
      '{b:반려동물과 지내며 마음의 안정을 얻어요.} / {b:수의사, 반려동물 훈련사 같은 직업이 있어요.} / [짖는 소리 때문에 이웃 간에 갈등이 생겨요.] / [버려지는 동물이 생기기도 해요.]'],
    ['l09', '🃏', '섞인 카드', 'cu_shade',
      '[피부색이 다르다는 까닭으로 부당한 대우를 받기도 해요.] / {b:혼자 사는 사람을 위한 작은 집이 많아졌어요.} / [배설물과 냄새 때문에 이웃 간에 갈등이 생겨요.] / {b:반려동물 미용사 같은 직업이 생겼어요.}'],
    // ── l10 · 정본 s04 바람직한·바람직하지 못한 태도 · s07 존중의 탑 블록 여섯 · s08 오개념 · s10 보기
    ['l10', '🧱', '존중의 탑 블록', 'cu_attit',
      '{n:다른 문화에 대한 편견을 갖지 않고 차별하지 않아요.} / [외국인 이주민을 무시하고 경계해요.] / {r:서로 다른 문화를 이해하고 존중해요.}'],
    ['l10', '🧱', '탑을 쌓아요', 'cu_attit',
      '[1인 가구의 사람들을 이상하다고 생각해요.] / {r:다른 문화의 사람들이 겪는 어려움에 관심을 가져요.} / [반려동물을 가족이라고 생각하는 사람들을 비난해요.] / {n:다른 문화에 대한 편견을 갖지 않고 차별하지 않아요.}'],
    ['l10', '💬', '교실에서 들은 말', 'cu_attit',
      '[다른 문화보다 우리 문화를 더 소중하게 생각해요.] / {r:내가 누리는 문화처럼 다른 사람이 누리는 문화도 소중하게 여겨요.} / {n:한국어에 서툰 친구를 놀리지 않아요.}'],
    ['l10', '🐕', '공원에서', 'cu_attit',
      '{r:반려견과 산책할 때 목줄을 채워요.} / [반려동물과 함께 사는 사람들을 배려하지 않아요.] / {n:다른 사람의 반려동물을 함부로 비난하지 않아요.}'],
    ['l10', '🙏', '다른 종교', 'cu_attit',
      '[다른 종교의 가르침을 이해하려고 하지 않아요.] / {r:다른 문화를 올바르게 이해하려고 노력해요.} / {n:피부색이 다르다고 차별하지 않아요.}'],
    ['l10', '🍱', '점심시간', 'cu_attit',
      '[다른 나라 친구의 도시락을 이상하다고 놀려요.] / {n:친구네 생일 음식을 이상하다고 말하지 않아요.} / [외국인 이주민을 무시하고 경계해요.] / {r:서로 다른 문화를 이해하고 존중해요.}']
  ];

  var LEAD = {
    cu_not: '태어날 때부터 하게 되는 행동은 문화가 아니에요',
    cu_many: '우리 사회의 다양한 문화 — 외국인 이주민 · 1인 가구 · 반려동물과 함께 사는 사람',
    cu_disc: '차별 = 편견을 가지고 다르게 대우한 행동',
    cu_shade: '다양한 문화가 퍼지면 좋은 점과 함께 문제도 생겨요',
    cu_attit: '탑을 기울게 하는 태도'
  };
  var TRAP_NOTE = {
    w: '무엇을 어떻게 먹는지 · 어떻게 인사하는지는 문화예요',
    o: '늘어난 사람들과 관계없는 모습이에요',
    p: '「생각했어요」 — 마음속 생각은 편견이에요',
    b: '나머지는 좋아진 점(밝은 면)이에요',
    n: '「~지 않아요」는 바람직한 태도예요',
    r: '나머지는 바람직한 태도예요'
  };
  var TAIL = { cu_many: '외국 것만이 아니라 1인 가구 · 반려동물도 다양한 문화예요' };

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function bare(s) { return String(s).replace(/[,.]+$/, ''); }

  /* 글 → 줄마다 덩이 토큰 */
  function parse(text) {
    return text.split(' / ').map(function (line) {
      return line.split(' | ').map(function (c) {
        var m;
        if ((m = c.match(/^\[(.+)\]$/))) return { t: m[1], hit: true, ans: bare(m[1]) };
        if ((m = c.match(/^\{([wopbnr]):(.+)\}$/))) return { t: m[2], hit: false, trap: m[1] };
        return { t: c, hit: false };
      });
    });
  }

  function explainOf(lines, type) {
    var all = [].concat.apply([], lines);
    var hits = all.filter(function (t) { return t.hit; }).map(function (t) { return '「' + t.ans + '」'; });
    var notes = [], seen = {};
    all.forEach(function (t) { if (t.trap && !seen[t.trap]) { seen[t.trap] = 1; notes.push(TRAP_NOTE[t.trap]); } });
    if (TAIL[type]) notes = [TAIL[type]];
    return LEAD[type] + ': ' + hits.join(' · ') + (notes.length ? '  (' + notes.join(' · ') + ')' : '');
  }

  function build(row, id) {
    var lines = parse(row[4]);
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) { tokens.push({ t: t.t, hit: !!t.hit }); });
    });
    var answer = [].concat.apply([], lines).filter(function (t) { return t.hit; }).map(function (t) { return t.ans; });
    return { id: id, l: row[0], icon: row[1], src: row[2], type: row[3],
             prompt: PROMPT[row[3]], lines: lines, tokens: tokens, answer: answer, explain: explainOf(lines, row[3]) };
  }

  return {
    id: 'culture_hunt',
    title: '다양한 문화 글 속 찾기',
    T: T, ORDER: ORDER, PROMPT: PROMPT, TYPE_L: TYPE_L,
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
          return build(T[k], 'cu' + k + '_' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(bare(pick)) >= 0; }
      };
    },
    printRender: function (q) {
      return q.icon + ' <b>' + q.src + '</b> — ' + q.prompt.replace(/^\S+ /, '') + '<br>' + q.lines.map(function (line) {
        return line.map(function (t) { return t.t; }).join(' ');
      }).join('<br>');
    },
    printAnswer: function (q) { return q.answer.join(' · '); },
    printHead: '글을 읽고 물음에 맞는 곳에 모두 밑줄을 그으세요.'
  };
}));
