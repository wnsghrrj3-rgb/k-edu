/* gens/korean/g4_2_media_duel.js — 매체 대 매체 (4학년 2학기 국어 5단원 「오가는 마음」 · 교과서판 2학기)
 * 순수 함수·DOM 무관 (§9-3). 장르 duel_quiz(stream)가 쓴다 — 보기 셋(매체 카드 두 장 + 「둘 다」) 가운데 하나.
 * params: { book: 1|0 }  1 = 첫 판을 『국어』 225쪽 「생각 열기」(손 편지와 휴대 전화 메시지 — 빠르게 전한다)로 시작
 * next() → { prompt, card, cardQ, media:[[그림, 이름] 둘 · 섞임], say, answer, options:[이름 둘 + '둘 다'], type, explain, l }
 *
 * 근거(교사용 지도서 국어 4-2 5단원 — 쪽 = 지도서 인쇄 쪽):
 *  318쪽 우리 반에서 정한 활동 예시 1 「매체 대 매체 놀이」 — 매체 카드 두 장을 뽑고, 상대가 보여 준 질문 카드의 질문에 알맞게
 *        두 매체의 특성을 비교하여 대답한다 · 같은 질문 카드가 나오면 앞사람과 다른 대답(→ 같은 질문에 여러 판).
 *        질문 카드 여섯 가운데 다섯을 쓴다(「주도권」 카드는 지도서·교과서에 비교 근거가 없어 뺌).
 *  296쪽(『국어』 225쪽) 손 편지 = 보내는 사람의 예의와 정성 · 휴대 전화 메시지 = 빠르게 전하고 그림말로 감정 표현
 *  299쪽(『국어』 229쪽) 표 — 디지털 기기 · 같은 시간과 장소에 있지 않아도 됨 · 대화 상대가 분명하지 않을 수 있음 / 직접 만나서 = 분명함
 *        4번 그림말·사진으로 감정 표현 · 즉각 반응하는 경우도 그렇지 않은 경우도
 *  228쪽 그림 다(여러 친구 얼굴 = 영상 회의) · 231쪽 상황 나(이름을 밝히지 않고 여러 사람이 읽는 게시판) · 295쪽 ❸ 여러 명이 함께 대화하는 채팅방
 *  301쪽 참고 자료 — 인터넷에 남긴 글은 삭제가 힘듦 · 321쪽 참고 자료 — 나눈 대화가 모두 기록으로 남음
 *  236쪽 그림·음성·지도·동영상 자료 · 영상 통화 때 서로 인사를 주고받음 · 309쪽 편지 = 정성 · 천천히 정리 · 특별한 추억으로 기억에 남음
 *  238쪽 2번 편지 = 생각할 시간이 충분하고 고쳐 쓸 수도 있음 · 310쪽 편지의 일반적 특징 = 읽는 사람이 정해져 있다
 * 판의 꼴: 질문 카드 하나 + 매체 카드 둘 + 한 매체(또는 둘 다)의 특성을 말한 대답 한 줄 → 「이 대답은 어느 매체 이야기일까?」
 *   한 쌍(손 편지·메시지 등)이 질문에 따라 이쪽 · 저쪽 · 둘 다로 바뀌게 판을 고루 둔다 — 「모든 면에서 이기는 매체」 덫(학습지 X57).
 * type = 질문 카드 갈래 다섯 — speed 빠르기 · keep 보관 · people 사람 수 · fixed 정해진 상대 · form 전하는 꼴.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_media_duel'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PROMPT = '질문 카드에 맞는 대답이에요. 어느 매체 이야기일까요?';
  var BOTH = '둘 다';
  var MEDIA = {
    letter: ['✉️', '손 편지'], msg: ['📱', '메시지'], face: ['🗣️', '직접 대화'], room: ['💬', '대화방'],
    board: ['📋', '게시판'], video: ['📹', '영상 통화'], meet: ['🖥️', '영상 회의']
  };
  var CARDS = {
    speed: '생각을 얼마나 빠르게 전달할 수 있나요?',
    keep: '전달한 내용을 얼마나 오랫동안 기억하거나 보관할 수 있나요?',
    people: '의견을 전달할 수 있는 사람의 수는 어떤가요?',
    fixed: '말하는 이와 듣는 이가 정해져 있나요?',
    form: '글자, 사진, 도표, 그림, 동영상 가운데에서 무엇으로 생각을 전달하는 것이 효과적인가요?'
  };
  var KIND_NAME = { speed: '빠르기', keep: '보관', people: '사람 수', fixed: '정해진 상대', form: '전하는 꼴' };

  /* [질문 카드, 매체 1, 매체 2, 대답, 답('a' = 매체 1 · 'b' = 매체 2 · 'both'), 근거 쪽] */
  var T = [
    ['speed', 'letter', 'msg', '내용이나 마음을 빠르게 전할 수 있어요.', 'b', '『국어』 225'],          // 첫 판(book 1)
    ['speed', 'msg', 'letter', '생각할 시간이 충분하고 고쳐 쓸 수도 있어요.', 'b', '『국어』 238'],
    ['speed', 'face', 'room', '멀리 떨어져 있어도 바로 이야기를 주고받을 수 있어요.', 'b', '『국어』 229·234'],
    ['speed', 'room', 'face', '상대가 곧바로 답하지 않을 때도 있어요.', 'a', '『국어』 229'],
    ['speed', 'letter', 'msg', '마음을 천천히 정리하며 쓰게 돼요.', 'a', '지도서 309'],
    ['speed', 'msg', 'room', '떨어져 있어도 마음을 빠르게 전할 수 있어요.', 'both', '『국어』 225·229'],
    ['keep', 'letter', 'face', '특별한 추억으로 기억에 남도록 간직할 수 있어요.', 'a', '지도서 309'],
    ['keep', 'face', 'board', '한 번 남긴 글은 지우기 어려워요.', 'b', '지도서 301'],
    ['keep', 'room', 'face', '나눈 대화가 모두 기록으로 남아요.', 'a', '지도서 321'],
    ['keep', 'board', 'room', '남긴 글이 기록으로 남으니 올리기 전에 꼼꼼히 읽어 봐야 해요.', 'both', '지도서 301·321'],
    ['people', 'letter', 'board', '여러 사람이 함께 읽어요.', 'b', '『국어』 231'],
    ['people', 'meet', 'letter', '여러 사람이 한 화면에 모여 얼굴을 보며 이야기해요.', 'a', '『국어』 228'],
    ['people', 'letter', 'room', '여러 친구가 한곳에 모여 함께 이야기를 나눠요.', 'b', '지도서 295'],
    ['people', 'room', 'meet', '여러 사람이 함께 대화를 나눌 수 있어요.', 'both', '『국어』 228 · 지도서 295'],
    ['fixed', 'board', 'letter', '읽는 사람이 정해져 있어요.', 'b', '지도서 310'],
    ['fixed', 'face', 'board', '이름을 밝히지 않아 누가 쓴 글인지 모를 때가 있어요.', 'b', '『국어』 231'],
    ['fixed', 'room', 'face', '대화 상대가 분명하지 않을 수 있어요.', 'a', '『국어』 229'],
    ['fixed', 'room', 'face', '대화 상대가 분명해요.', 'b', '『국어』 229'],
    ['fixed', 'letter', 'face', '누구에게 하는 말인지 정해져 있어요.', 'both', '지도서 310 · 『국어』 229'],
    ['form', 'letter', 'msg', '그림말로 감정을 표현할 수 있어요.', 'b', '『국어』 225'],
    ['form', 'room', 'letter', '그림, 음성, 지도, 동영상 같은 자료를 함께 보낼 수 있어요.', 'a', '『국어』 236'],
    ['form', 'letter', 'video', '얼굴을 보며 서로 인사를 주고받을 수 있어요.', 'b', '『국어』 236'],
    ['form', 'msg', 'room', '그림말이나 사진으로 감정을 나타낼 수 있어요.', 'both', '『국어』 225·229']
  ];
  var KINDS = ['speed', 'keep', 'people', 'fixed', 'form'];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* 받침 있으면 「과」 · 없으면 「와」 — 이름 맨 끝 글자로 고른다 */
  function wa(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return (c >= 0 && c < 11172 && c % 28) ? '과' : '와'; }
  function answerOf(row) { return row[4] === 'both' ? BOTH : MEDIA[row[4] === 'a' ? row[1] : row[2]][1]; }

  function explainOf(row) {
    var a = MEDIA[row[1]][1], b = MEDIA[row[2]][1], s = '「' + row[3].replace(/\.$/, '') + '」 — ';
    if (row[4] === 'both') return s + a + wa(a) + ' ' + b + ' 모두 그래요. 두 매체가 같은 점도 있어요.';
    var win = row[4] === 'a' ? a : b, other = row[4] === 'a' ? b : a;
    return s + win + ' 이야기예요. ' + other + '도 다른 질문에서는 잘하는 일이 있어요 — 매체마다 잘하는 일이 달라요.';
  }

  function build(row, k, id, rng) {
    var pair = shuffle(rng, [row[1], row[2]]);
    var media = pair.map(function (m) { return MEDIA[m].slice(); });
    return { id: id, l: 'l11', card: row[0], type: row[0], cardQ: CARDS[row[0]], media: media, say: row[3], src: row[5],
             answer: answerOf(row), options: [media[0][1], media[1][1], BOTH],
             prompt: PROMPT + ' — 질문 카드: ' + CARDS[row[0]] + ' / ' + media[0][1] + ' · ' + media[1][1] + ' / 대답: ' + row[3],
             explain: explainOf(row) };
  }

  return {
    id: 'g4_2_media_duel',
    title: '매체 대 매체',
    T: T, MEDIA: MEDIA, CARDS: CARDS, KINDS: KINDS, KIND_NAME: KIND_NAME, BOTH: BOTH, PROMPT: PROMPT,
    answerOf: answerOf, explainOf: explainOf, wa: wa,
    create: function (params, rng) {
      params = params || {};
      var book = +(params.book == null ? 1 : params.book) === 1;
      var idx = T.map(function (t, k) { return k; });
      var deck = shuffle(rng, idx), last = -1, n = 0;
      if (book) { deck.splice(deck.indexOf(0), 1); deck.unshift(0); }        // 첫 판 = 『국어』 225쪽 손 편지 · 메시지
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 판이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], k, 'md' + k + '_' + (n++), rng);
        },
        check: function (pick, q) { return String(pick) === q.answer; }
      };
    },
    printRender: function (q) {
      return '질문 카드: ' + q.cardQ + '<br>매체 카드: ' + q.media.map(function (m) { return m[1]; }).join(' · ') + '<br>대답: ' + q.say + '<br>보기: ' + q.options.join(' · ');
    },
    printAnswer: function (q) { return q.answer + ' (질문 카드 = ' + KIND_NAME[q.card] + ')'; },
    printHead: '질문 카드와 매체 카드 두 장을 보고, 대답이 어느 매체 이야기인지(둘 다일 수도 있어요) ○를 하세요. 매체마다 잘하는 일이 달라요.'
  };
}));
