/* gens/korean/g1_2_feel_talk.js — 기분을 ‘나’로 말해요 (1학년 2학기 국어 1단원 「기분을 말해요」 l07 · l09 · l11 · l13 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 fill_dialog(대화 채우기)가 쓴다.
 * 근거 = 지도서(국어 1-2 ㉮ 1단원) 70~79쪽: 『국어』 20~21쪽 카드 알아맞히기 놀이(그림 카드 ↔ 기분을 나타내는 말 카드) ·
 *   22~23쪽 ‘나 전달법’(「나는 내가 만든 성이 무너져서 정말 속상해.」 · 「나는 네가 색연필을 빌려줘서 고마웠어.」) ·
 *   23쪽 6번 스스로 확인(기분을 나타내는 말 · 듣는 사람 · ‘나’로 시작해 있었던 일과 기분) ·
 *   24~27쪽 「화내지 말고 예쁘게 말해요」(도치 — 화내며 말하기 ↔ 바르고 고운 말) · 27쪽 세 상황(음식·큰 목소리·우유) ·
 *   28쪽 역할놀이 네 상황(놀이·나들이·실수로 피해·친구의 어려움).
 *   케이티처 2세대 정본 data/g1s2_korean_u1.js l07 오개념 「‘나’로 시작하기만 하면 된다 — 나는 네가 잘못해서 화났어」 ·
 *   l09 오개념 「화가 났을 때는 솔직하게 화를 내며」 · l11 오개념 「역할놀이는 아무 말이나」가 오답 보기의 원천이다.
 * params: { upto: 'l07'|'l09'|'l11'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 틀이 덱 앞머리 (l13 마무리 = all)
 * next() → { sit, icon, lines:[{who,face,me,say}], options:[3], answer:'0'|'1'|'2', type, explain, l }
 *
 * type(문항 단위 · 진단 축 — 「나」의 말에서 무엇을 보고 고르는가):
 *   feel_word   기분을 나타내는 말 — 그 상황에 어울리는 기분 말 (카드 놀이 · 역할놀이 상황). 보기 셋은 기분 말만 다르다.
 *   i_start     ‘나’로 시작하기 — 「너 때문에」 탓하는 말 ↔ 「나는 ~해서 ~했어」
 *   no_blame    ‘나’로 시작해도 탓하지 않기 — 「나는 네가 잘못해서 화났어」(정본 l07 오개념) ↔ 있었던 일과 내 기분만
 *   event_feel  있었던 일과 기분 둘 다 — 「고마웠어」(기분만) · 「네가 빌려줬어」(일만) ↔ 둘 다 든 말
 *   calm_talk   화내지 않고 고운 말로 — 도치의 「내가 먼저 탈 거야!」 ↔ 듣는 사람을 생각한 말
 * 오답 보기 첫째는 늘 그 문항의 축만 거꾸로 짚은 말이다(기분 말만 틀림 · 탓하는 말 · 일이나 기분 하나만 · 화내는 말).
 * 작품 본문은 짧은 한 줄 인용까지(도치의 말 「저리 가! 귀찮단 말이야!」 · 「얘들아, 난 너희들이랑 함께 놀면 좋겠어.」).
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g1_2_feel_talk'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l07', 'l09', 'l11'];
  var ME = { who: '나', face: '🧒' };

  /* 틀 — l 차시 · type · icon · sit 상황 · you [이름, 얼굴] · before 상대가 먼저 한 말(없으면 '') · ans · dis[축만 거꾸로, 다른 하나] · why */
  var T = [
    // ── l07 기분을 나타내는 말 하기 (『국어』 20~23쪽)
    { l: 'l07', type: 'feel_word', icon: '🎁', sit: '생일에 기준이가 선물을 주었어요', you: ['기준', '👦'], before: '생일 축하해! 내 선물이야.',
      ans: '나는 생일 선물을 받아서 행복해.', dis: ['나는 생일 선물을 받아서 슬퍼.', '나는 생일 선물을 받아서 무서워.'],
      why: '선물을 받으면 마음이 좋아요. 그때의 기분은 「행복해요」 — 그림 카드에 어울리는 기분 말 카드를 찾듯이 골라요.' },
    { l: 'l07', type: 'feel_word', icon: '🎤', sit: '노래를 잘 부른다고 선생님께서 칭찬해 주셨어요', you: ['짝', '👧'], before: '',
      ans: '나는 칭찬을 받아서 정말 뿌듯했어.', dis: ['나는 칭찬을 받아서 정말 슬펐어.', '나는 칭찬을 받아서 정말 화났어.'],
      why: '칭찬을 받으면 마음이 으쓱해요. 그 기분을 나타내는 말은 「뿌듯해요」예요.' },
    { l: 'l07', type: 'feel_word', icon: '🐶', sit: '큰 강아지가 왈왈 짖으며 달려왔어요', you: ['친구', '👦'], before: '괜찮아? 많이 놀랐지?',
      ans: '나는 강아지가 짖어서 무서웠어.', dis: ['나는 강아지가 짖어서 행복했어.', '나는 강아지가 짖어서 뿌듯했어.'],
      why: '큰 강아지가 짖으며 달려오면 겁이 나요. 그때의 기분은 「무서워요」예요.' },
    { l: 'l07', type: 'feel_word', icon: '🎈', sit: '아끼던 풍선이 펑 터졌어요', you: ['친구', '👧'], before: '어떡해, 풍선이 터졌네.',
      ans: '나는 아끼던 풍선이 터져서 슬퍼.', dis: ['나는 아끼던 풍선이 터져서 신나.', '나는 아끼던 풍선이 터져서 뿌듯해.'],
      why: '아끼던 것이 없어지면 마음이 아파요. 그 기분을 나타내는 말은 「슬퍼요」예요.' },
    { l: 'l07', type: 'feel_word', icon: '🪢', sit: '어려운 줄넘기를 끝까지 해냈어요', you: ['짝', '👦'], before: '와, 끝까지 넘었네!',
      ans: '나는 줄넘기를 끝까지 해서 후련해.', dis: ['나는 줄넘기를 끝까지 해서 무서워.', '나는 줄넘기를 끝까지 해서 슬퍼.'],
      why: '어려운 일을 끝내면 마음이 시원해요. 그 기분을 나타내는 말은 「후련해요」예요.' },
    { l: 'l07', type: 'i_start', icon: '🧱', sit: '민지가 지나가다가 쳐서 내가 만든 성이 무너졌어요', you: ['민지', '👧'], before: '어? 성이 무너졌네.',
      ans: '나는 내가 만든 성이 무너져서 정말 속상해.', dis: ['너 때문에 성이 무너졌잖아!', '다시는 내 옆에 오지 마.'],
      why: '「너 때문에」로 시작하면 듣는 민지가 상처받아요. ‘나’로 시작해 있었던 일(성이 무너짐)과 내 기분(속상해)을 말해요.' },
    { l: 'l07', type: 'i_start', icon: '📕', sit: '동생이 내 책에 낙서를 했어요', you: ['동생', '🧒'], before: '',
      ans: '나는 내 책에 낙서가 생겨서 속상해.', dis: ['너는 왜 내 책에 낙서해!', '네가 내 책을 다 망쳤어!'],
      why: '동생을 탓하는 말보다 ‘나’로 시작해 있었던 일과 기분을 말하면 동생도 내 마음을 알아요.' },
    { l: 'l07', type: 'event_feel', icon: '🖍️', sit: '짝이 색연필을 빌려주었어요', you: ['짝', '👧'], before: '내 색연필 써도 돼.',
      ans: '나는 네가 색연필을 빌려줘서 고마웠어.', dis: ['고마웠어.', '네가 색연필을 빌려줬어.'],
      why: '‘나’로 시작해 있었던 일(색연필을 빌려줌)과 기분(고마웠어)을 함께 말해요. 하나만 말하면 마음이 다 전해지지 않아요.' },
    { l: 'l07', type: 'no_blame', icon: '🧱', sit: '친구가 지나가다가 쳐서 내가 쌓은 성이 무너졌어요', you: ['친구', '👦'], before: '',
      ans: '나는 내가 쌓은 성이 무너져서 속상해.', dis: ['나는 네가 잘못해서 화났어.', '나는 네가 쳐서 화났어.'],
      why: '「나는」으로 시작해도 「네가 잘못해서」처럼 탓하는 말이 들어가면 듣는 사람이 속상해요. 있었던 일과 내 기분만 말해요.' },
    { l: 'l07', type: 'no_blame', icon: '🎨', sit: '친구가 내 그림을 보고 웃었어요', you: ['친구', '👦'], before: '하하, 이게 뭐야?',
      ans: '나는 내 그림을 보고 웃어서 속상했어.', dis: ['나는 네가 놀려서 화났어.', '너는 왜 내 그림을 보고 웃어!'],
      why: '「나는 네가 놀려서」처럼 탓하는 말을 넣지 않고, 있었던 일과 내 기분을 솔직하게 말해요.' },
    { l: 'l07', type: 'no_blame', icon: '🧸', sit: '동생이 내 장난감을 망가뜨렸어요', you: ['동생', '🧒'], before: '',
      ans: '나는 장난감이 망가져서 속상해.', dis: ['나는 네가 망가뜨려서 화났어.', '너 때문이야!'],
      why: '「너 때문이야!」 대신 「나는 장난감이 망가져서 속상해」라고 말하면 동생도 미안한 마음을 가질 수 있어요.' },

    // ── l09 「화내지 말고 예쁘게 말해요」 — 듣는 사람을 생각하며 기분 말하기 (『국어』 24~27쪽)
    { l: 'l09', type: 'calm_talk', icon: '🛝', sit: '그네를 오래 기다렸는데 친구가 먼저 타려고 해요', you: ['치치', '🦔'], before: '',
      ans: '나는 그네를 타고 싶었는데 기다려서 속상했어.', dis: ['내가 먼저 탈 거야!', '너는 왜 맨날 먼저 타!'],
      why: '도치처럼 「내가 먼저 탈 거야!」 하고 화를 내면 나쁜 말 구름이 커져요. ‘나’로 시작해 고운 말로 내 기분을 말해요.' },
    { l: 'l09', type: 'calm_talk', icon: '📣', sit: '친구가 큰 목소리로 소리쳤어요', you: ['친구', '👦'], before: '야!',
      ans: '나는 큰 목소리를 듣고 깜짝 놀랐어.', dis: ['저리 가! 귀찮단 말이야!', '시끄러워! 조용히 해!'],
      why: '화를 내며 말하면 듣는 사람도 다쳐요. 「나는 ~해서 ~했어」로 내 기분(깜짝 놀랐어)을 고운 말로 말해요.' },
    { l: 'l09', type: 'calm_talk', icon: '🥛', sit: '동생이 우유를 쏟아서 내 책이 젖었어요', you: ['동생', '🧒'], before: '앗, 미안해…….',
      ans: '나는 내 책이 우유에 젖어서 많이 속상했어.', dis: ['너 때문에 다 젖었잖아!', '다시는 내 책 만지지 마!'],
      why: '화를 내지 않고 ‘나’로 시작해 있었던 일(책이 젖음)과 기분(속상했어)을 말하면 동생도 마음을 알아요.' },
    { l: 'l09', type: 'calm_talk', icon: '🙈', sit: '놀이터에 갔는데 친구들이 모두 나를 모른 척했어요', you: ['친구들', '👫'], before: '',
      ans: '얘들아, 난 너희들이랑 함께 놀면 좋겠어.', dis: ['왜 나만 빼고 놀아!', '흥, 나도 너희랑 안 놀아!'],
      why: '도치는 화가 났지만 양산 할머니 말씀을 떠올려 예쁘게 말했어요. 그러자 나쁜 말 구름이 감쪽같이 사라졌어요.' },
    { l: 'l09', type: 'feel_word', icon: '🍲', sit: '할머니께서 맛있는 음식을 만들어 주신 일을 친구에게 말해요', you: ['친구', '👧'], before: '어제 뭐 했어?',
      ans: '나는 맛있는 음식을 먹게 되어서 기뻤어.', dis: ['나는 맛있는 음식을 먹게 되어서 슬펐어.', '나는 맛있는 음식을 먹게 되어서 무서웠어.'],
      why: '맛있는 음식을 먹게 되면 마음이 좋아요. 그때의 기분을 나타내는 말은 「기뻐요」예요.' },
    { l: 'l09', type: 'event_feel', icon: '🎤', sit: '선생님께 칭찬받은 일을 짝에게 말해요', you: ['짝', '👦'], before: '무슨 좋은 일 있어?',
      ans: '나는 노래를 잘 부른다고 칭찬받아서 뿌듯했어.', dis: ['뿌듯했어.', '선생님께서 칭찬해 주셨어.'],
      why: '‘나’로 시작해 있었던 일(노래로 칭찬받음)과 기분(뿌듯했어)을 둘 다 말해야 짝이 내 마음을 알아요.' },
    { l: 'l09', type: 'i_start', icon: '✏️', sit: '짝이 내 연필을 말없이 가져갔어요', you: ['짝', '👧'], before: '',
      ans: '나는 연필이 없어져서 깜짝 놀랐어.', dis: ['너는 왜 남의 연필을 가져가!', '네가 다 잘못했어!'],
      why: '「너는 왜」로 탓하기보다 ‘나’로 시작해 있었던 일과 내 기분을 말하면 듣는 사람이 덜 속상해요.' },

    // ── l11 배운 내용 실천하기 — 역할놀이 (『국어』 28~29쪽 네 상황)
    { l: 'l11', type: 'feel_word', icon: '💧', sit: '실수로 친구의 그림에 물을 쏟았어요', you: ['친구', '👦'], before: '앗, 내 그림!',
      ans: '앗, 미안해! 나는 실수로 물을 쏟았어.', dis: ['네가 거기 놓아서 그래.', '괜찮아, 별일 아니야.'],
      why: '실수로 친구에게 피해를 주었을 때는 「미안해」라는 기분 말이 꼭 들어가야 해요.' },
    { l: 'l11', type: 'feel_word', icon: '🤕', sit: '친구가 넘어져 무릎을 다쳤어요', you: ['친구', '👧'], before: '아야, 무릎이 아파…….',
      ans: '많이 아프니? 나는 네가 다쳐서 걱정돼.', dis: ['나는 네가 넘어져서 신나.', '그러게 조심하지 그랬어.'],
      why: '친구가 어려움을 당했을 때는 「걱정돼」처럼 친구를 생각하는 기분 말을 해요.' },
    { l: 'l11', type: 'feel_word', icon: '🧺', sit: '가족과 함께 나들이를 왔어요', you: ['동생', '🧒'], before: '오늘 정말 좋다!',
      ans: '나는 다 같이 와서 즐거워.', dis: ['나는 다 같이 와서 무서워.', '나는 다 같이 와서 속상해.'],
      why: '가족과 함께 나들이할 때의 기분은 「즐거워요」 — 그 상황에 어울리는 기분 말을 넣어 말해요.' },
    { l: 'l11', type: 'calm_talk', icon: '☔', sit: '친구가 우산을 털다가 내 옷이 젖었어요', you: ['친구', '👦'], before: '미안해! 옷 많이 젖었니?',
      ans: '괜찮아. 나는 조금 놀랐지만 금방 마를 거야.', dis: ['너 때문에 다 젖었잖아!', '다시는 우산 털지 마!'],
      why: '사과하는 친구에게 탓하는 말을 하면 친구가 더 미안하고 속상해요. 탓하지 않고 내 기분을 말해요.' },
    { l: 'l11', type: 'event_feel', icon: '🎲', sit: '친구들과 놀이를 하다가 친구가 내 차례를 기다려 주었어요', you: ['친구', '👧'], before: '천천히 해도 돼.',
      ans: '나는 네가 기다려 줘서 고마웠어.', dis: ['고마웠어.', '네가 기다려 줬어.'],
      why: '있었던 일(기다려 줌)과 내 기분(고마웠어)을 함께 말해야 내 마음이 다 전해져요.' }
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function build(t, k, rng) {
    var you = { who: t.you[0], face: t.you[1], me: false };
    var me = { who: ME.who, face: ME.face, me: true, say: null };
    var lines = [Object.assign({}, you, { say: t.before || '' }), me];
    var opts = shuffle(rng, [t.ans].concat(t.dis));
    return { id: 'ft' + k, l: t.l, type: t.type, sit: t.sit, icon: t.icon, lines: lines,
             options: opts, answer: String(opts.indexOf(t.ans)), explain: t.why, prompt: t.sit };
  }

  return {
    id: 'g1_2_feel_talk',
    title: '기분을 ‘나’로 말해요',
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
      var talk = q.lines.map(function (ln) {
        if (ln.say === '') return '';
        return ln.face + ' ' + ln.who + ': ' + (ln.say === null ? '(　　　　　　)' : ln.say);
      }).filter(Boolean).join(' &nbsp; ');
      return q.icon + ' ' + q.sit + '<br>' + (talk ? talk + '<br>' : '') + q.options.map(function (o, k) { return ['①', '②', '③'][k] + ' ' + o; }).join(' &nbsp; ');
    },
    printAnswer: function (q) { return ['①', '②', '③'][+q.answer] + ' ' + q.options[+q.answer]; },
    printHead: '상황을 읽고, 듣는 사람을 생각하며 「나」가 할 말을 골라 ○ 하세요.'
  };
}));
