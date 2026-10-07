/* gens/korean/para_hunt.js — 문단 속 문장 찾기 (3학년 1학기 국어 3단원 「짜임새 있는 글, 재미와 감동이 있는 글」 l02~l11)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기)가 쓴다 — 토큰 하나 = 문장 하나, 정답 문장은 늘 하나.
 * params: { upto: 'l02'|'l04'|'l08'|'l11'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 틀이 덱 앞머리
 * next() → { prompt, icon, tokens:[{t, hit}], answer, type, explain, l }
 *
 * type(문항 단위 · 진단 축 — 무엇을 보고 고르는가):
 *   main_front  중심 문장 찾기 — 맨 앞에 있는 문단 (l02)
 *   main_end    중심 문장 찾기 — 끝에 있는 문단 (l02 「중심 문장은 늘 맨 앞」 오개념 축 · 정본 동물 문단 계열)
 *   odd_one     어울리지 않는 뒷받침 문장 찾기 (l04 · 「재미있는 문장이면 어디든」 오개념 축 — 같은 학교 이야기라 헷갈리는 판 하나)
 *   feel_main   감상 문단의 중심 문장 = 느낀 부분 (l08 · 덫 = 「왜냐하면」 까닭 문장 · 일어난 일만 말한 문장)
 *   me_odd      '나' 설명서에서 한 가지 생각을 벗어난 문장 (l11 · 「모든 것을 한 문단에」 오개념 축)
 * 뒷받침 문장끼리는 차례가 정해져 있지 않다 → 섞는다(자리 쏠림 없이). feel_main 만 글의 차례 그대로(까닭은 느낀 부분 뒤).
 * 제재 = 정본 자체 창작(「나무가 주는 것」·「할머니의 단추 상자」·「발소리」 일부 사실) + 자체 구성. 회피 제재 0(정본 머리말).
 * 용어는 정본 그 차시까지(문단·중심 문장·뒷받침 문장·느낀 부분) — 교사 몫 용어 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['para_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l02', 'l04', 'l08', 'l11'];
  var PROMPT = {
    main_front: '이 문단의 중심 문장을 찾아 눌러요',
    main_end: '이 문단의 중심 문장을 찾아 눌러요',
    odd_one: '중심 문장과 어울리지 않는 문장을 찾아 눌러요',
    feel_main: '느낀 부분을 밝힌 중심 문장을 찾아 눌러요',
    me_odd: '\'나\' 설명서에서 한 가지 생각을 벗어난 문장을 찾아 눌러요'
  };

  /* 틀 — main 중심 문장 · subs 뒷받침 문장 · odd 어울리지 않는 문장(odd 유형) · why 풀이 끝말
   * feel_main 은 seq(글의 차례 그대로) + hit(중심 문장 자리) */
  var T = [
    // ── l02 중심 문장 — 맨 앞
    { l: 'l02', type: 'main_front', icon: '🌳', main: '나무는 우리에게 여러 가지 도움을 줍니다.',
      subs: ['더운 날에는 시원한 그늘을 만들어 줍니다.', '맑은 공기를 내뿜어 숨 쉬기 좋게 해 줍니다.', '맛있는 열매를 맺어 먹을거리도 줍니다.'],
      why: '그늘·공기·열매가 모두 나무가 주는 도움이에요.' },
    { l: 'l02', type: 'main_front', icon: '🐠', main: '바다에는 여러 가지 생물이 삽니다.',
      subs: ['물고기는 지느러미로 헤엄칩니다.', '게는 집게발로 먹이를 집습니다.', '해파리는 바닷물을 따라 둥둥 떠다닙니다.'],
      why: '물고기·게·해파리가 모두 바다에 사는 생물이에요.' },
    { l: 'l02', type: 'main_front', icon: '☔', main: '비 오는 날에는 챙길 것이 많습니다.',
      subs: ['우산을 펴서 비를 막습니다.', '장화를 신어 발이 젖지 않게 합니다.', '비옷을 입어 옷이 젖지 않게 합니다.'],
      why: '우산·장화·비옷이 모두 비 오는 날 챙길 것이에요.' },
    { l: 'l02', type: 'main_front', icon: '🙌', main: '우리 반 친구들은 저마다 잘하는 것이 다릅니다.',
      subs: ['민호는 달리기가 빠릅니다.', '서연이는 노래를 잘 부릅니다.', '지우는 그림을 멋지게 그립니다.'],
      why: '민호·서연이·지우가 잘하는 것이 모두 달라요.' },
    { l: 'l02', type: 'main_front', icon: '🏪', main: '시장에는 여러 가지 가게가 있습니다.',
      subs: ['생선 가게에는 고등어와 오징어가 있습니다.', '과일 가게에는 사과와 배가 있습니다.', '떡집에는 알록달록한 떡이 있습니다.'],
      why: '생선 가게·과일 가게·떡집이 모두 시장의 가게예요.' },
    { l: 'l02', type: 'main_front', icon: '🧹', main: '우리 반은 교실 청소를 나누어 합니다.',
      subs: ['한 모둠은 바닥을 씁니다.', '다른 모둠은 책상을 닦습니다.', '나머지 모둠은 쓰레기통을 비웁니다.'],
      why: '바닥 쓸기·책상 닦기·쓰레기통 비우기가 모두 나누어 하는 청소예요.' },

    // ── l02 중심 문장 — 끝 (「늘 맨 앞」 오개념 축)
    { l: 'l02', type: 'main_end', icon: '🦒', main: '이처럼 동물마다 길게 자란 부분이 다릅니다.',
      subs: ['토끼는 귀가 깁니다.', '기린은 목이 깁니다.', '코끼리는 코가 깁니다.'],
      why: '앞의 세 문장이 모두 이 생각의 예예요.' },
    { l: 'l02', type: 'main_end', icon: '🌼', main: '이렇게 계절마다 피는 꽃이 다릅니다.',
      subs: ['봄에는 개나리가 핍니다.', '여름에는 해바라기가 핍니다.', '가을에는 코스모스가 핍니다.'],
      why: '개나리·해바라기·코스모스가 피는 때가 모두 달라요.' },
    { l: 'l02', type: 'main_end', icon: '🪴', main: '이처럼 우리 가족은 함께 화분을 돌봅니다.',
      subs: ['아빠는 아침마다 화분에 물을 줍니다.', '엄마는 저녁마다 마른 잎을 떼어 줍니다.', '나는 주말마다 화분을 창가에 내놓습니다.'],
      why: '아빠·엄마·나가 하는 일이 모두 화분 돌보기예요.' },
    { l: 'l02', type: 'main_end', icon: '✏️', main: '이처럼 학용품은 저마다 쓰임이 있습니다.',
      subs: ['연필로는 글씨를 씁니다.', '지우개로는 틀린 글자를 지웁니다.', '자로는 곧은 줄을 긋습니다.'],
      why: '연필·지우개·자의 쓰임을 하나로 묶은 문장이에요.' },
    { l: 'l02', type: 'main_end', icon: '🚒', main: '이렇게 우리 둘레에는 고마운 일을 하는 분이 많습니다.',
      subs: ['소방관은 불을 끕니다.', '경찰관은 마을을 안전하게 지킵니다.', '의사는 아픈 사람을 치료합니다.'],
      why: '소방관·경찰관·의사가 하는 일을 하나로 묶은 문장이에요.' },

    // ── l04 어울리지 않는 뒷받침 문장
    { l: 'l04', type: 'odd_one', icon: '🏫', main: '우리 학교에는 다양한 장소가 있습니다.',
      subs: ['학생들이 공부하는 교실이 있습니다.', '책을 빌릴 수 있는 도서관이 있습니다.', '밥을 먹는 급식실이 있습니다.'],
      odd: '저는 피구를 가장 좋아합니다.', why: '학교 장소가 아니라 내가 좋아하는 운동을 말해요.' },
    { l: 'l04', type: 'odd_one', icon: '🏃', main: '우리 학교 운동장은 넓습니다.',
      subs: ['달리기를 마음껏 할 수 있습니다.', '여러 반이 함께 공놀이를 해도 자리가 넉넉합니다.'],
      odd: '어제 비가 많이 왔습니다.', why: '운동장이 넓다는 것이 아니라 날씨를 말해요.' },
    { l: 'l04', type: 'odd_one', icon: '📚', main: '우리 학교 도서관은 좋습니다.',
      subs: ['읽고 싶은 책이 가득합니다.', '푹신한 의자가 있어 편하게 읽을 수 있습니다.'],
      odd: '제 동생은 두 살입니다.', why: '도서관이 아니라 동생 이야기예요.' },
    { l: 'l04', type: 'odd_one', icon: '🪟', main: '우리 교실에는 좋은 점이 많습니다.',
      subs: ['창문이 커서 밝습니다.', '책꽂이에 책이 많습니다.', '사물함이 있어 짐을 넣어 둘 수 있습니다.'],
      odd: '나는 떡볶이를 좋아합니다.', why: '교실의 좋은 점이 아니라 내가 좋아하는 음식이에요.' },
    { l: 'l04', type: 'odd_one', icon: '🎉', main: '우리 학교에는 행사가 많습니다.',
      subs: ['봄에는 운동회가 열립니다.', '가을에는 발표회가 열립니다.', '겨울에는 학예회가 열립니다.'],
      odd: '강당은 아주 넓습니다.', why: '학교 이야기이긴 하지만 행사가 아니라 장소를 말해요.' },
    { l: 'l04', type: 'odd_one', icon: '🌳', main: '나무는 우리에게 여러 가지 도움을 줍니다.',
      subs: ['더운 날에는 시원한 그늘을 만들어 줍니다.', '맑은 공기를 내뿜어 숨 쉬기 좋게 해 줍니다.', '맛있는 열매를 맺어 먹을거리도 줍니다.'],
      odd: '나무에 올라가면 정말 신이 납니다.', why: '재미있는 문장이지만 나무가 주는 도움이 아니라 내 기분을 말해요.' },

    // ── l08 감상 문단 — 느낀 부분이 중심 문장 (글의 차례 그대로)
    { l: 'l08', type: 'feel_main', icon: '🧵', hit: 1, seq: [
      '수아는 할머니 댁 서랍에서 낡은 단추 상자를 찾았다.',
      '나는 할머니가 단추마다 담긴 이야기를 들려주는 부분에서 감동을 느꼈다.',
      '왜냐하면 낡은 단추에도 가족의 소중한 추억이 담겨 있다는 것을 알았기 때문이다.'] },
    { l: 'l08', type: 'feel_main', icon: '🔴', hit: 1, seq: [
      '할머니는 빨간 단추가 처음 산 외투에 달려 있었다고 말씀하셨다.',
      '나는 이 부분에서 할머니의 마음이 느껴져 뭉클했다.',
      '왜냐하면 오래된 단추를 지금까지 소중히 간직하셨기 때문이다.'] },
    { l: 'l08', type: 'feel_main', icon: '📦', hit: 0, seq: [
      '나는 수아가 단추 상자를 여는 장면이 가장 재미있었다.',
      '왜냐하면 상자 안에 무엇이 들었을지 나도 궁금했기 때문이다.'] },
    { l: 'l08', type: 'feel_main', icon: '👣', hit: 1, seq: [
      '시 「발소리」에는 여러 사람의 발소리가 나온다.',
      '나는 할아버지의 느린 발소리가 나오는 부분이 좋았다.',
      '왜냐하면 천천히 걸으시는 우리 할아버지가 떠올랐기 때문이다.'] },
    { l: 'l08', type: 'feel_main', icon: '🧸', hit: 0, seq: [
      '나는 수아가 물건을 아껴 쓰기로 마음먹는 부분에서 감동을 느꼈다.',
      '왜냐하면 나도 낡은 인형을 버리려다 그만둔 적이 있기 때문이다.'] },

    // ── l11 '나' 설명서 — 한 가지 생각
    { l: 'l11', type: 'me_odd', icon: '🎨', main: '나는 그림 그리기를 좋아합니다.',
      subs: ['쉬는 시간에 공책에 만화를 그립니다.', '가족의 모습을 그려 선물하기도 합니다.', '색칠할 때가 가장 즐겁습니다.'],
      odd: '우리 집은 학교 앞 아파트입니다.', why: '그림 그리기가 아니라 사는 곳을 말해요. 다른 문단에 쓰면 돼요.' },
    { l: 'l11', type: 'me_odd', icon: '⚽', main: '나는 축구를 좋아합니다.',
      subs: ['점심시간마다 운동장에서 공을 찹니다.', '골을 넣으면 친구들과 손뼉을 마주칩니다.'],
      odd: '나에게는 형이 한 명 있습니다.', why: '축구가 아니라 형제를 말해요. 다른 문단에 쓰면 돼요.' },
    { l: 'l11', type: 'me_odd', icon: '📖', main: '나는 책 읽기를 좋아합니다.',
      subs: ['잠자기 전에 꼭 한 권씩 읽습니다.', '재미있는 책은 친구에게 알려 줍니다.'],
      odd: '내 생일은 오월입니다.', why: '책 읽기가 아니라 생일을 말해요. 다른 문단에 쓰면 돼요.' },
    { l: 'l11', type: 'me_odd', icon: '🐶', main: '나는 강아지를 좋아합니다.',
      subs: ['길에서 강아지를 만나면 꼭 인사합니다.', '강아지가 나오는 그림책을 여러 번 읽었습니다.', '강아지를 쓰다듬을 때가 가장 행복합니다.'],
      odd: '나는 아침마다 우유를 마십니다.', why: '강아지가 아니라 아침에 마시는 것을 말해요. 다른 문단에 쓰면 돼요.' },
    { l: 'l11', type: 'me_odd', icon: '🍳', main: '나는 요리하기를 좋아합니다.',
      subs: ['주말에 엄마와 함께 김밥을 맙니다.', '내가 만든 달걀말이를 가족이 맛있게 먹습니다.'],
      odd: '나는 피아노 학원에 다닙니다.', why: '요리가 아니라 다니는 학원을 말해요. 다른 문단에 쓰면 돼요.' }
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function q(s) { return '「' + s.replace(/\.$/, '') + '」'; }

  function build(t, k, rng) {
    var lines, hit, ex;
    if (t.type === 'feel_main') {
      lines = t.seq.slice(); hit = t.hit;
      ex = q(lines[hit]) + ' — 느낀 부분을 밝힌 이 문장이 중심 문장이에요. 「왜냐하면」으로 시작하는 문장은 그 까닭을 덧붙이는 뒷받침 문장이에요.' +
        (hit > 0 ? ' 일어난 일만 말한 문장은 느낀 점이 아니에요.' : '');
    } else if (t.type === 'main_front' || t.type === 'main_end') {
      var s = shuffle(rng, t.subs);
      lines = t.type === 'main_front' ? [t.main].concat(s) : s.concat([t.main]);
      hit = t.type === 'main_front' ? 0 : lines.length - 1;
      ex = q(t.main) + ' — ' + t.why + ' 그래서 중심 문장이에요. 이 문단에서는 ' +
        (t.type === 'main_front' ? '맨 앞에 있어요.' : '끝에 있어요. 중심 문장이 늘 맨 앞에 오는 것은 아니에요.');
    } else {                                   // odd_one · me_odd — 중심 문장은 맨 앞, 어긋난 문장은 뒷받침 사이 아무 자리
      var body = shuffle(rng, t.subs.concat([t.odd]));
      lines = [t.main].concat(body);
      hit = lines.indexOf(t.odd);
      ex = '중심 문장은 ' + q(t.main) + '예요. ' + q(t.odd) + '는 ' + t.why;
    }
    return { id: 'ph' + k, l: t.l, type: t.type, icon: t.icon, prompt: PROMPT[t.type],
             tokens: lines.map(function (s, j) { return { t: s, hit: j === hit }; }),
             hit: hit, answer: lines[hit], explain: ex };
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣', '㉤'];

  return {
    id: 'para_hunt',
    title: '문단 속 문장 찾기',
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
        check: function (pick, q2) { return String(pick) === String(q2.answer); }
      };
    },
    printRender: function (q2) {
      return q2.icon + ' ' + q2.prompt + '<br>' + q2.tokens.map(function (tok, k) { return MARK[k] + ' ' + tok.t; }).join('<br>');
    },
    printAnswer: function (q2) { return MARK[q2.hit] + ' ' + q2.answer; },
    printHead: '문단을 읽고 알맞은 문장의 기호에 ○를 하세요.'
  };
}));
