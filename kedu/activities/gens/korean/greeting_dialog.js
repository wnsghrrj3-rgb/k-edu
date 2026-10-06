/* gens/korean/greeting_dialog.js — 알맞은 인사말 (1학년 1학기 국어 5단원 「반갑게 인사해요」 l01~l04·l09~l11)
 * 순수 함수·DOM 무관 (§9-3). 장르 fill_dialog(대화 채우기)가 쓴다.
 * params: { upto: 'l01'|'l02'|'l03'|'l04'|'l09'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 말이 덱 앞머리
 * next() → { sit, icon, lines:[{who,face,me,say}], options:[3], answer:'0'|'1'|'2', type, explain }
 *
 * type(문항 단위 · 진단 축):
 *   to_whom   상대 — 친구에게는 짧고 다정하게, 웃어른께는 공손하게 (안녕 ↔ 안녕하세요 · 미안해 ↔ 죄송합니다)
 *   meet_part 만날 때 ↔ 헤어질 때 (안녕하세요 ↔ 안녕히 가세요 · 반가워 ↔ 잘 가)
 *   feeling   상황(마음) — 고마울·미안할·축하할·걱정될·반가울 때
 *   reply     주고받기 — 받은 말에 알맞게 되받기 (미안해 → 괜찮아 · 축하해 → 고마워)
 *   day_time  하루의 때 — 나설 때 ↔ 돌아올 때 · 먹기 전 ↔ 먹은 뒤 · 일어나서 ↔ 잠들 때
 * 헷갈림 짝: 오답 보기 첫째는 언제나 그 문항의 축을 거꾸로 짚은 말(상대만 틀림 · 때만 틀림 …) — 무엇에서 무너졌는지가 byType 로 남는다.
 * 말(보기·상대의 말)은 정본 g1_korean_u5.js 그 차시까지 이미 나온 인사말만 쓴다(스모크 B 가 대조한다).
 * 헤어질 때 친구에게 하는 「안녕」처럼 두 쪽 다 맞는 말은 오답 보기로 쓰지 않는다 — 답이 둘인 문항 0.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['greeting_dialog'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l01', 'l02', 'l03', 'l04', 'l09'];
  var ME = { who: '나', face: '🧒' };
  var P = {
    friend: [{ who: '친구', face: '👦' }, { who: '친구', face: '👧' }],
    elder: [{ who: '할머니', face: '👵' }, { who: '할아버지', face: '👴' }, { who: '선생님', face: '👩‍🏫' }, { who: '이웃 어른', face: '🧑' }],
    teacher: [{ who: '선생님', face: '👩‍🏫' }, { who: '경비 아저씨', face: '👮' }],
    parent: [{ who: '엄마', face: '👩' }, { who: '아빠', face: '👨' }],
    newcomer: [{ who: '새로 오신 선생님', face: '👩‍🏫' }, { who: '이웃 어른', face: '🧑' }]
  };

  // 받침 따라 조사 — 을/를 · 이/가 · 와/과 · 은/는
  function jong(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c <= 11171 && c % 28 !== 0; }
  function fill(s, w) {
    return s.replace(/\{W\}(을|를|이|가|와|과|은|는)?/g, function (_, j) {
      if (!j) return w;
      var b = jong(w), pair = { '을': ['을', '를'], '를': ['을', '를'], '이': ['이', '가'], '가': ['이', '가'], '와': ['과', '와'], '과': ['과', '와'], '은': ['은', '는'], '는': ['은', '는'] }[j];
      return w + (b ? pair[0] : pair[1]);
    });
  }

  /* 틀 — l 차시 · type · to 상대 무리 · sit 상황 · icon · before 상대가 먼저 한 말 · after 상대가 되받은 말 · ans · dis[축 거꾸로, 다른 하나] · why */
  var T = [
    // l01 단원 도입 — 우리가 아는 인사말(안녕 · 안녕하세요 · 다녀오겠습니다 · 잘 먹겠습니다)
    { l: 'l01', type: 'to_whom', to: 'friend', icon: '🌞', sit: '아침에 {W}를 만났어요', ans: '안녕', dis: ['안녕하세요', '잘 먹겠습니다'],
      why: '{W}에게는 반갑게 손을 흔들며 「안녕」 해요. 「안녕하세요」는 어른께 공손하게 하는 인사예요.' },
    { l: 'l01', type: 'to_whom', to: 'teacher', icon: '🌞', sit: '아침에 {W}을 만났어요', ans: '안녕하세요', dis: ['안녕', '다녀오겠습니다'],
      why: '{W}은 어른이에요. 고개를 숙이며 공손하게 「안녕하세요」 해요. 「안녕」은 친구에게 하는 인사예요.' },
    { l: 'l01', type: 'day_time', to: 'parent', icon: '🏠', sit: '학교에 가려고 집을 나서요', ans: '다녀오겠습니다', dis: ['잘 먹겠습니다', '안녕'],
      why: '집을 나설 때는 「다녀오겠습니다」 해요. 「잘 먹겠습니다」는 밥을 먹기 전에 하는 인사예요.' },
    { l: 'l01', type: 'day_time', to: 'parent', icon: '🍚', sit: '맛있는 밥을 먹기 전이에요', ans: '잘 먹겠습니다', dis: ['다녀오겠습니다', '안녕하세요'],
      why: '밥을 먹기 전에는 「잘 먹겠습니다」 해요. 「다녀오겠습니다」는 집을 나설 때 하는 인사예요.' },

    // l02 알맞은 인사말 — 상대에 따라(친구 ↔ 웃어른) · 만날 때 ↔ 헤어질 때
    { l: 'l02', type: 'to_whom', to: 'friend', icon: '🏫', sit: '학교 끝나고 {W}와 헤어져요', ans: '잘 가', dis: ['안녕히 가세요', '안녕하세요'],
      why: '친구와 헤어질 때는 짧고 다정하게 「잘 가」. 「안녕히 가세요」는 웃어른께 하는 인사예요.' },
    { l: 'l02', type: 'to_whom', to: 'elder', icon: '👋', sit: '{W}께서 먼저 집에 가세요', ans: '안녕히 가세요', dis: ['잘 가', '안녕하세요'],
      why: '{W}은 웃어른이에요. 헤어질 때 공손하게 「안녕히 가세요」. 「잘 가」는 친구에게 하는 인사예요.' },
    { l: 'l02', type: 'meet_part', to: 'elder', icon: '🌞', sit: '아침에 {W}을 만났어요', ans: '안녕하세요', dis: ['안녕히 가세요', '안녕'],
      why: '만났을 때는 「안녕하세요」. 「안녕히 가세요」는 헤어질 때 하는 인사예요.' },
    { l: 'l02', type: 'meet_part', to: 'friend', icon: '🛝', sit: '놀이터에서 {W}와 헤어져요', ans: '또 보자', dis: ['안녕하세요', '고맙습니다'],
      why: '친구와 헤어질 때는 「또 보자」. 「안녕하세요」는 웃어른을 만났을 때 하는 인사예요.' },
    { l: 'l02', type: 'to_whom', to: 'elder', icon: '🗺️', sit: '{W}께서 길을 알려 주셨어요', ans: '고맙습니다', dis: ['고마워', '안녕히 가세요'],
      why: '고마울 때 웃어른께는 공손하게 「고맙습니다」. 「고마워」는 친구에게 하는 말이에요.' },
    { l: 'l02', type: 'day_time', to: 'parent', icon: '🌙', sit: '잠자리에 들며 {W}께 인사해요', ans: '안녕히 주무세요', dis: ['다녀오겠습니다', '안녕하세요'],
      why: '잠자리에 들 때 부모님께는 「안녕히 주무세요」. 「다녀오겠습니다」는 집을 나설 때 하는 인사예요.' },

    // l03 상황에 알맞은 인사말 — 마음(고마울·미안할·축하할·걱정될·반가울 때)
    { l: 'l03', type: 'feeling', to: 'friend', icon: '😊', sit: '{W}가 내 지우개를 주워 줬어요', ans: '고마워', dis: ['미안해', '축하해'],
      why: '도움을 받았을 때는 고마운 마음을 담아 「고마워」. 「미안해」는 잘못했을 때 하는 말이에요.' },
    { l: 'l03', type: 'feeling', to: 'friend', icon: '😥', sit: '실수로 {W} 발을 밟았어요', ans: '미안해', dis: ['고마워', '축하해'],
      why: '잘못했을 때는 미안한 마음을 담아 「미안해」. 「고마워」는 도움을 받았을 때 하는 말이에요.' },
    { l: 'l03', type: 'feeling', to: 'friend', icon: '🎉', sit: '{W}가 달리기에서 일 등을 했어요', ans: '축하해', dis: ['미안해', '고마워'],
      why: '좋은 일이 생긴 친구에게는 「축하해」. 「미안해」는 잘못했을 때 하는 말이에요.' },
    { l: 'l03', type: 'feeling', to: 'friend', icon: '🤒', sit: '{W}가 몸이 아파서 걱정돼요', ans: '괜찮아?', dis: ['축하해', '고마워'],
      why: '아픈 친구가 걱정될 때는 마음을 담아 「괜찮아?」. 「축하해」는 좋은 일이 생겼을 때 하는 말이에요.' },
    { l: 'l03', type: 'feeling', to: 'friend', icon: '🤝', sit: '새로 온 {W}를 처음 만났어요', ans: '반가워', dis: ['미안해', '잘 가'],
      why: '처음 만나 반가울 때는 「반가워」. 「잘 가」는 헤어질 때 하는 인사예요.' },
    { l: 'l03', type: 'to_whom', to: 'elder', icon: '🪴', sit: '실수로 {W}의 화분을 쓰러뜨렸어요', ans: '죄송합니다', dis: ['미안해', '고맙습니다'],
      why: '웃어른께 잘못했을 때는 공손하게 「죄송합니다」. 「미안해」는 친구에게 하는 말이에요.' },
    { l: 'l03', type: 'to_whom', to: 'elder', icon: '🏆', sit: '{W}께서 상을 받으셨어요', ans: '축하합니다', dis: ['축하해', '죄송합니다'],
      why: '웃어른께는 공손하게 「축하합니다」. 「축하해」는 친구에게 하는 말이에요.' },
    { l: 'l03', type: 'feeling', to: 'newcomer', icon: '🤝', sit: '{W}을 처음 만났어요', ans: '만나서 반갑습니다', dis: ['죄송합니다', '축하합니다'],
      why: '처음 만나 반가울 때 웃어른께는 「만나서 반갑습니다」. 「죄송합니다」는 잘못했을 때 하는 말이에요.' },

    // l04 역할놀이 — 인사는 주고받아요(받은 말에 알맞게 되받기)
    { l: 'l04', type: 'reply', to: 'friend', icon: '😥', sit: '{W}가 실수로 내 발을 밟았어요', before: '미안해.', ans: '괜찮아', dis: ['미안해', '축하해'],
      why: '「미안해」를 들으면 「괜찮아」 하고 되받아요. 잘못한 사람은 내가 아니라서 「미안해」를 따라 하지 않아요.' },
    { l: 'l04', type: 'reply', to: 'friend', icon: '🎂', sit: '오늘은 내 생일이에요', before: '축하해!', ans: '고마워', dis: ['축하해', '미안해'],
      why: '「축하해」를 들으면 고마운 마음으로 「고마워」 하고 되받아요. 축하받는 사람은 나예요.' },
    { l: 'l04', type: 'reply', to: 'friend', icon: '🌞', sit: '아침에 {W}가 먼저 인사했어요', before: '안녕!', ans: '안녕', dis: ['잘 가', '미안해'],
      why: '만나서 「안녕!」을 들으면 반갑게 「안녕」 하고 되받아요. 「잘 가」는 헤어질 때 하는 인사예요.' },
    { l: 'l04', type: 'reply', to: 'friend', icon: '🛝', sit: '{W}와 헤어지는데 {W}가 먼저 인사했어요', before: '잘 가!', ans: '또 보자', dis: ['안녕하세요', '미안해'],
      why: '헤어질 때 「잘 가!」를 들으면 「또 보자」 하고 되받아요. 인사는 주고받아야 완성돼요.' },
    { l: 'l04', type: 'to_whom', to: 'elder', icon: '🚶', sit: '등굣길에 {W}을 만났어요', after: '그래, 안녕.', ans: '안녕하세요', dis: ['안녕', '축하해'],
      why: '{W}은 웃어른이라 공손하게 「안녕하세요」 해요. 그러면 {W}께서 「그래, 안녕」 하고 되받아 주세요.' },

    // l09 여러 상황 — 하루 인사 지도(나설 때 ↔ 돌아올 때 · 먹기 전 ↔ 먹은 뒤 · 일어나서 ↔ 잠들 때)
    { l: 'l09', type: 'day_time', to: 'parent', icon: '🌅', sit: '아침에 일어나 {W}를 만났어요', ans: '안녕히 주무셨어요?', dis: ['안녕히 주무세요', '다녀왔습니다'],
      why: '아침에 일어나서는 「안녕히 주무셨어요?」. 「안녕히 주무세요」는 잠자리에 들 때 하는 인사예요.' },
    { l: 'l09', type: 'day_time', to: 'parent', icon: '🌙', sit: '밤이 되어 잠자리에 들어요', ans: '안녕히 주무세요', dis: ['안녕히 주무셨어요?', '잘 먹었습니다'],
      why: '잠자리에 들 때는 「안녕히 주무세요」. 「안녕히 주무셨어요?」는 아침에 일어나서 하는 인사예요.' },
    { l: 'l09', type: 'day_time', to: 'parent', icon: '🏠', sit: '학교 끝나고 집에 돌아왔어요', ans: '다녀왔습니다', dis: ['다녀오겠습니다', '안녕히 주무세요'],
      why: '집에 돌아왔을 때는 「다녀왔습니다」. 「다녀오겠습니다」는 집을 나설 때 하는 인사예요.' },
    { l: 'l09', type: 'day_time', to: 'parent', icon: '🎒', sit: '학교에 가려고 집을 나서요', ans: '다녀오겠습니다', dis: ['다녀왔습니다', '잘 먹었습니다'],
      why: '집을 나설 때는 「다녀오겠습니다」. 「다녀왔습니다」는 집에 돌아왔을 때 하는 인사예요.' },
    { l: 'l09', type: 'day_time', to: 'parent', icon: '🍚', sit: '밥을 다 먹었어요', ans: '잘 먹었습니다', dis: ['잘 먹겠습니다', '다녀왔습니다'],
      why: '밥을 다 먹은 뒤에는 「잘 먹었습니다」. 「잘 먹겠습니다」는 먹기 전에 하는 인사예요.' },
    { l: 'l09', type: 'day_time', to: 'teacher', icon: '🍱', sit: '급식실에서 밥을 먹기 전이에요', ans: '잘 먹겠습니다', dis: ['잘 먹었습니다', '다녀오겠습니다'],
      why: '먹기 전에는 「잘 먹겠습니다」. 「잘 먹었습니다」는 다 먹은 뒤에 하는 인사예요.' },
    { l: 'l09', type: 'meet_part', to: 'friend', icon: '🛝', sit: '놀이터에서 놀다가 {W}와 헤어져요', ans: '잘 가, 내일 보자', dis: ['반가워', '다녀왔습니다'],
      why: '헤어질 때는 「잘 가, 내일 보자」. 「반가워」는 만났을 때 하는 인사예요.' }
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(rng, a) { return a[Math.floor(rng() * a.length)]; }

  function build(t, k, rng) {
    var p = pick(rng, P[t.to]);
    var you = { who: p.who, face: p.face, me: false };
    var me = { who: ME.who, face: ME.face, me: true, say: null };
    var lines;
    if (t.before) lines = [Object.assign({}, you, { say: t.before }), me];
    else if (t.after) lines = [me, Object.assign({}, you, { say: t.after })];
    else lines = [Object.assign({}, you, { say: '' }), me];
    var opts = shuffle(rng, [t.ans].concat(t.dis));
    return { id: 'gd' + k, l: t.l, type: t.type, sit: fill(t.sit, p.who), icon: t.icon, lines: lines,
             options: opts, answer: String(opts.indexOf(t.ans)), explain: fill(t.why, p.who), prompt: fill(t.sit, p.who) };
  }

  return {
    id: 'greeting_dialog',
    title: '알맞은 인사말',
    T: T,
    ORDER: ORDER,
    fill: fill,
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
      var talk = q.lines.map(function (ln) {
        if (ln.say === '') return '';
        return ln.face + ' ' + ln.who + ': ' + (ln.say === null ? '(　　　　　　)' : ln.say);
      }).filter(Boolean).join(' &nbsp; ');
      return q.icon + ' ' + q.sit + '<br>' + talk + '<br>' + q.options.map(function (o, k) { return ['①', '②', '③'][k] + ' ' + o; }).join(' &nbsp; ');
    },
    printAnswer: function (q) { return ['①', '②', '③'][+q.answer] + ' ' + q.options[+q.answer]; },
    printHead: '상황을 읽고, 빈 말풍선에 알맞은 인사말을 골라 ○ 하세요.'
  };
}));
