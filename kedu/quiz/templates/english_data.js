/* =============================================================
 * templates/english_data.js — 아침영어 데이터셋 (하루 한 문장 원장)
 *
 * 정본 설계: handoff/설계-아침영어-v1.md (2026-08-15). 이 파일이 그 §6 스키마의 실물이다.
 *   하루 = { d, pat, sent, ko, tiles, words, new, expand }
 *   - tiles: 조립 단위(구두점 포함 표시형). tiles.join(' ') === sent 왕복이 검사기로 강제된다.
 *   - words: 사다리 판정용 정규화 토큰(소문자, 구두점 제거, 덩어리 병합). 문장 토큰과 1:1.
 *   - new  : 그날 처음 등장하는 어휘 단위(≤3, 화이트리스트 제외). 검사기가 전수 강제.
 *   - expand: 3막 넓히기 — 같은 패턴, 그날까지 단어로만 성립할 때 채우고 안 되면 정직하게 null.
 *
 * ★어휘 사다리 헌법(설계 §3): 오늘 문장의 모든 단어 ∈ 오늘까지 누적 단어장.
 *   - 덩어리(CHUNKS)는 통짜 1단위. 덩어리가 원형 단어를 부여한다(EQUIV: i'm → i·am).
 *   - 화이트리스트(WHITELIST): 인명 Ben·Mia·Kai, 감탄 oh·wow — 새 단어로 안 센다.
 *   - 굴절(INFLECT): apple↔apples 같은 단어. 불규칙(go↔went)은 별도 단어.
 *
 * ★패턴 일수 배분(정본 확정): 골든 표본(설계 §12)의 배분을 승계 —
 *   P1 인사 2일 · P2 안부 2일 · P3 사물 3일 · P4 좋아함 3일 (= 골든 d1~10 그대로),
 *   P5~P10 각 5일(진술 → 변주 → 질문 → 응답 → 종합의 5단 리듬). 합계 40일.
 *   설계 §2 "패턴 × 4문장"은 평균 명세였고 골든이 이미 가변 배분 — 문서 §2·§8을 이 표로 갱신함.
 *
 * 문답 짝은 연속 이틀(설계 §12): d9→d10, d13→d14, d18→d19→d20, d21→d22, d29→d30.
 * 문장은 전부 창작 예문(저작권 0). g4~g6은 D5에서 이 파일에 추가된다.
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); return; }
  root.KQuiz = root.KQuiz || {};
  root.KQuiz.englishData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── 사다리 규약 상수 (검사기·엔진과 공유) ─────────────────── */
  var CHUNKS = ["i'm", "it's", "what's", "don't", "can't", 'thank you'];
  /* 덩어리 → 부여되는 원형 단어(이후 원형이 단독 등장해도 새 단어 아님) */
  var EQUIV = {
    "i'm":   ['i', 'am'],
    "it's":  ['it', 'is'],
    "what's": ['what', 'is'],
    "don't": ['do', 'not'],
    "can't": ['can', 'not'],
    'thank you': ['thank']
  };
  /* 굴절: 좌↔우 같은 단어 취급(양방향) */
  var INFLECT = { apples: 'apple', books: 'book', pencils: 'pencil', years: 'year', likes: 'like' };
  var WHITELIST = ['ben', 'mia', 'kai', 'oh', 'wow'];

  /* ── 패턴 계획 (일수 배분 정본) ────────────────────────────── */
  var PAT_PLAN = {
    g3: [
      { pat: 'P1',  ko: '인사·소개',   from: 1,  to: 2 },
      { pat: 'P2',  ko: '안부',        from: 3,  to: 4 },
      { pat: 'P3',  ko: '사물',        from: 5,  to: 7 },
      { pat: 'P4',  ko: '좋아함',      from: 8,  to: 10 },
      { pat: 'P5',  ko: '소유',        from: 11, to: 15 },
      { pat: 'P6',  ko: '능력',        from: 16, to: 20 },
      { pat: 'P7',  ko: '숫자·나이',   from: 21, to: 25 },
      { pat: 'P8',  ko: '색깔',        from: 26, to: 30 },
      { pat: 'P9',  ko: '지시·요청',   from: 31, to: 35 },
      { pat: 'P10', ko: '작별·종합',   from: 36, to: 40 }
    ]
  };

  /* ── g3 원장 40일 (골든 d1~10 = 설계 §12 전문 그대로) ──────── */
  var G3 = [
    { d: 1, pat: 'P1', sent: "Hello, I'm Ben.", ko: '안녕, 나는 벤이야.',
      tiles: ['Hello,', "I'm", 'Ben.'], words: ['hello', "i'm", 'ben'], new: ['hello', "i'm"],
      expand: { sent: "Hello, I'm Kai.", ko: '안녕, 나는 카이야.' } },
    { d: 2, pat: 'P1', sent: "Hi, I'm Mia.", ko: '안녕, 나는 미아야.',
      tiles: ['Hi,', "I'm", 'Mia.'], words: ['hi', "i'm", 'mia'], new: ['hi'],
      expand: { sent: "Hi, I'm Ben.", ko: '안녕, 나는 벤이야.' } },
    { d: 3, pat: 'P2', sent: 'How are you?', ko: '잘 지내?',
      tiles: ['How', 'are', 'you?'], words: ['how', 'are', 'you'], new: ['how', 'are', 'you'],
      expand: { sent: 'Hi, how are you?', ko: '안녕, 잘 지내?' } },
    { d: 4, pat: 'P2', sent: "I'm fine, thank you.", ko: '잘 지내, 고마워.',
      tiles: ["I'm", 'fine,', 'thank you.'], words: ["i'm", 'fine', 'thank you'], new: ['fine', 'thank you'],
      expand: { sent: "I'm fine.", ko: '잘 지내.' } },
    { d: 5, pat: 'P3', sent: "What's this?", ko: '이건 뭐야?',
      tiles: ["What's", 'this?'], words: ["what's", 'this'], new: ["what's", 'this'],
      expand: null },
    { d: 6, pat: 'P3', sent: "It's a pencil.", ko: '그건 연필이야.',
      tiles: ["It's", 'a', 'pencil.'], words: ["it's", 'a', 'pencil'], new: ["it's", 'a', 'pencil'],
      expand: { sent: "It's Ben!", ko: '벤이야!' } },
    { d: 7, pat: 'P3', sent: "It's a book.", ko: '그건 책이야.',
      tiles: ["It's", 'a', 'book.'], words: ["it's", 'a', 'book'], new: ['book'],
      expand: { sent: "It's Mia!", ko: '미아야!' } },
    { d: 8, pat: 'P4', sent: 'I like apples.', ko: '나는 사과를 좋아해.',
      tiles: ['I', 'like', 'apples.'], words: ['i', 'like', 'apples'], new: ['like', 'apples'],
      expand: { sent: 'I like books.', ko: '나는 책을 좋아해.' } },
    { d: 9, pat: 'P4', sent: 'Do you like apples?', ko: '너는 사과를 좋아해?',
      tiles: ['Do', 'you', 'like', 'apples?'], words: ['do', 'you', 'like', 'apples'], new: ['do'],
      expand: { sent: 'Do you like books?', ko: '너는 책을 좋아해?' } },
    { d: 10, pat: 'P4', sent: 'Yes, I do.', ko: '응, 좋아해.',
      tiles: ['Yes,', 'I', 'do.'], words: ['yes', 'i', 'do'], new: ['yes'],
      expand: { sent: 'Yes! I like books.', ko: '응! 나는 책을 좋아해.' } },

    { d: 11, pat: 'P5', sent: 'I have a pencil.', ko: '나는 연필이 있어.',
      tiles: ['I', 'have', 'a', 'pencil.'], words: ['i', 'have', 'a', 'pencil'], new: ['have'],
      expand: { sent: 'I have a book.', ko: '나는 책이 있어.' } },
    { d: 12, pat: 'P5', sent: 'I have two books.', ko: '나는 책이 두 권 있어.',
      tiles: ['I', 'have', 'two', 'books.'], words: ['i', 'have', 'two', 'books'], new: ['two'],
      expand: { sent: 'I have two pencils.', ko: '나는 연필이 두 자루 있어.' } },
    { d: 13, pat: 'P5', sent: 'Do you have a pencil?', ko: '너는 연필이 있어?',
      tiles: ['Do', 'you', 'have', 'a', 'pencil?'], words: ['do', 'you', 'have', 'a', 'pencil'], new: [],
      expand: { sent: 'Do you have a book?', ko: '너는 책이 있어?' } },
    { d: 14, pat: 'P5', sent: "No, I don't.", ko: '아니, 없어.',
      tiles: ['No,', 'I', "don't."], words: ['no', 'i', "don't"], new: ['no', "don't"],
      expand: { sent: "I don't have a book.", ko: '나는 책이 없어.' } },
    { d: 15, pat: 'P5', sent: 'I have three apples.', ko: '나는 사과가 세 개 있어.',
      tiles: ['I', 'have', 'three', 'apples.'], words: ['i', 'have', 'three', 'apples'], new: ['three'],
      expand: { sent: 'I have three books.', ko: '나는 책이 세 권 있어.' } },

    { d: 16, pat: 'P6', sent: 'I can swim.', ko: '나는 수영할 수 있어.',
      tiles: ['I', 'can', 'swim.'], words: ['i', 'can', 'swim'], new: ['can', 'swim'],
      expand: { sent: 'Mia can swim.', ko: '미아는 수영할 수 있어.' } },
    { d: 17, pat: 'P6', sent: 'I can jump.', ko: '나는 뛸 수 있어.',
      tiles: ['I', 'can', 'jump.'], words: ['i', 'can', 'jump'], new: ['jump'],
      expand: { sent: 'Kai can jump.', ko: '카이는 뛸 수 있어.' } },
    { d: 18, pat: 'P6', sent: 'Can you swim?', ko: '너는 수영할 수 있어?',
      tiles: ['Can', 'you', 'swim?'], words: ['can', 'you', 'swim'], new: [],
      expand: { sent: 'Can you jump?', ko: '너는 뛸 수 있어?' } },
    { d: 19, pat: 'P6', sent: 'Yes, I can.', ko: '응, 할 수 있어.',
      tiles: ['Yes,', 'I', 'can.'], words: ['yes', 'i', 'can'], new: [],
      expand: { sent: 'Ben can swim.', ko: '벤은 수영할 수 있어.' } },
    { d: 20, pat: 'P6', sent: "No, I can't.", ko: '아니, 못 해.',
      tiles: ['No,', 'I', "can't."], words: ['no', 'i', "can't"], new: ["can't"],
      expand: { sent: "I can't jump.", ko: '나는 못 뛰어.' } },

    { d: 21, pat: 'P7', sent: 'How old are you?', ko: '너는 몇 살이야?',
      tiles: ['How', 'old', 'are', 'you?'], words: ['how', 'old', 'are', 'you'], new: ['old'],
      expand: { sent: 'How old are you, Kai?', ko: '카이야, 너는 몇 살이야?' } },
    { d: 22, pat: 'P7', sent: "I'm ten years old.", ko: '나는 열 살이야.',
      tiles: ["I'm", 'ten', 'years', 'old.'], words: ["i'm", 'ten', 'years', 'old'], new: ['ten', 'years'],
      expand: { sent: 'Kai is ten years old.', ko: '카이는 열 살이야.' } },
    { d: 23, pat: 'P7', sent: 'Mia is nine years old.', ko: '미아는 아홉 살이야.',
      tiles: ['Mia', 'is', 'nine', 'years', 'old.'], words: ['mia', 'is', 'nine', 'years', 'old'], new: ['nine'],
      expand: { sent: 'Ben is ten years old.', ko: '벤은 열 살이야.' } },
    { d: 24, pat: 'P7', sent: 'One, two, three, four!', ko: '하나, 둘, 셋, 넷!',
      tiles: ['One,', 'two,', 'three,', 'four!'], words: ['one', 'two', 'three', 'four'], new: ['one', 'four'],
      expand: { sent: 'I have four books.', ko: '나는 책이 네 권 있어.' } },
    { d: 25, pat: 'P7', sent: "I'm nine years old, too.", ko: '나도 아홉 살이야.',
      tiles: ["I'm", 'nine', 'years', 'old,', 'too.'], words: ["i'm", 'nine', 'years', 'old', 'too'], new: ['too'],
      expand: { sent: "I'm ten years old, too.", ko: '나도 열 살이야.' } },

    { d: 26, pat: 'P8', sent: 'What color is it?', ko: '그건 무슨 색이야?',
      tiles: ['What', 'color', 'is', 'it?'], words: ['what', 'color', 'is', 'it'], new: ['color'],
      expand: null },
    { d: 27, pat: 'P8', sent: "It's red.", ko: '그건 빨간색이야.',
      tiles: ["It's", 'red.'], words: ["it's", 'red'], new: ['red'],
      expand: { sent: "It's a red pencil.", ko: '그건 빨간 연필이야.' } },
    { d: 28, pat: 'P8', sent: "It's blue and yellow.", ko: '그건 파란색과 노란색이야.',
      tiles: ["It's", 'blue', 'and', 'yellow.'], words: ["it's", 'blue', 'and', 'yellow'], new: ['blue', 'and', 'yellow'],
      expand: { sent: "It's a blue book.", ko: '그건 파란 책이야.' } },
    { d: 29, pat: 'P8', sent: 'I like green.', ko: '나는 초록색을 좋아해.',
      tiles: ['I', 'like', 'green.'], words: ['i', 'like', 'green'], new: ['green'],
      expand: { sent: 'I like red and blue.', ko: '나는 빨간색과 파란색을 좋아해.' } },
    { d: 30, pat: 'P8', sent: 'Do you like green?', ko: '너는 초록색을 좋아해?',
      tiles: ['Do', 'you', 'like', 'green?'], words: ['do', 'you', 'like', 'green'], new: [],
      expand: { sent: 'Do you like yellow?', ko: '너는 노란색을 좋아해?' } },

    { d: 31, pat: 'P9', sent: 'Stand up, please.', ko: '일어서 주세요.',
      tiles: ['Stand', 'up,', 'please.'], words: ['stand', 'up', 'please'], new: ['stand', 'up', 'please'],
      expand: { sent: 'Stand up, Ben!', ko: '벤, 일어서!' } },
    { d: 32, pat: 'P9', sent: 'Sit down, please.', ko: '앉아 주세요.',
      tiles: ['Sit', 'down,', 'please.'], words: ['sit', 'down', 'please'], new: ['sit', 'down'],
      expand: { sent: 'Sit down, Kai!', ko: '카이야, 앉아!' } },
    { d: 33, pat: 'P9', sent: 'Open the door, please.', ko: '문을 열어 주세요.',
      tiles: ['Open', 'the', 'door,', 'please.'], words: ['open', 'the', 'door', 'please'], new: ['open', 'the', 'door'],
      expand: { sent: 'Open the book, please.', ko: '책을 펴 주세요.' } },
    { d: 34, pat: 'P9', sent: 'Close the door, please.', ko: '문을 닫아 주세요.',
      tiles: ['Close', 'the', 'door,', 'please.'], words: ['close', 'the', 'door', 'please'], new: ['close'],
      expand: { sent: 'Close the door, Mia!', ko: '미아야, 문 닫아!' } },
    { d: 35, pat: 'P9', sent: 'Close the book, please.', ko: '책을 덮어 주세요.',
      tiles: ['Close', 'the', 'book,', 'please.'], words: ['close', 'the', 'book', 'please'], new: [],
      expand: { sent: 'Open the door, Kai!', ko: '카이야, 문 열어!' } },

    { d: 36, pat: 'P10', sent: 'Goodbye, Ben!', ko: '잘 가, 벤!',
      tiles: ['Goodbye,', 'Ben!'], words: ['goodbye', 'ben'], new: ['goodbye'],
      expand: { sent: 'Goodbye, Mia!', ko: '잘 가, 미아!' } },
    { d: 37, pat: 'P10', sent: 'See you, Mia!', ko: '또 봐, 미아!',
      tiles: ['See', 'you,', 'Mia!'], words: ['see', 'you', 'mia'], new: ['see'],
      expand: { sent: 'See you, Kai!', ko: '또 봐, 카이!' } },
    { d: 38, pat: 'P10', sent: 'Have a good day!', ko: '좋은 하루 보내!',
      tiles: ['Have', 'a', 'good', 'day!'], words: ['have', 'a', 'good', 'day'], new: ['good', 'day'],
      expand: { sent: 'Have a good day, Ben!', ko: '벤, 좋은 하루 보내!' } },
    { d: 39, pat: 'P10', sent: 'I can see a red apple.', ko: '빨간 사과가 보여.',
      tiles: ['I', 'can', 'see', 'a', 'red', 'apple.'], words: ['i', 'can', 'see', 'a', 'red', 'apple'], new: [],
      expand: { sent: 'I can see a blue book.', ko: '파란 책이 보여.' } },
    { d: 40, pat: 'P10', sent: 'Goodbye! See you!', ko: '잘 가! 또 봐!',
      tiles: ['Goodbye!', 'See', 'you!'], words: ['goodbye', 'see', 'you'], new: [],
      expand: { sent: 'Goodbye! Have a good day!', ko: '잘 가! 좋은 하루 보내!' } }
  ];

  var GRADES = { 3: G3 };

  /* ── 정규화·사다리 도우미 (검사기·엔진 공유) ───────────────── */
  function inflectBase(w) {
    if (INFLECT[w]) return INFLECT[w];
    for (var k in INFLECT) if (INFLECT[k] === w) return w; /* 원형은 그대로 */
    return w;
  }
  /* 문장 → 정규화 토큰(소문자, 구두점 제거, 덩어리 병합). words 배열과의 대조에 쓴다. */
  function tokenize(sent) {
    var s = String(sent).toLowerCase().replace(/[.,!?]/g, '');
    CHUNKS.forEach(function (c) {
      if (c.indexOf(' ') >= 0) s = s.split(c).join(c.replace(/ /g, '\u0001'));
    });
    return s.split(/\s+/).filter(Boolean).map(function (t) { return t.replace(/\u0001/g, ' '); });
  }
  /* 누적 단어장에 unit 을 편입(덩어리면 원형까지 부여) */
  function learn(set, unit) {
    set[unit] = 1;
    var base = inflectBase(unit); set[base] = 1;
    (EQUIV[unit] || []).forEach(function (w) { set[w] = 1; });
  }
  /* unit 이 단어장·화이트리스트로 커버되는가 */
  function covered(set, unit) {
    if (WHITELIST.indexOf(unit) >= 0) return true;
    if (set[unit]) return true;
    if (set[inflectBase(unit)]) return true;
    return false;
  }

  return {
    CHUNKS: CHUNKS, EQUIV: EQUIV, INFLECT: INFLECT, WHITELIST: WHITELIST, PAT_PLAN: PAT_PLAN,
    grades: function () { return Object.keys(GRADES).map(Number); },
    days: function (g) { return GRADES[g] || []; },
    day: function (g, d) { return (GRADES[g] || [])[d - 1] || null; },
    maxDay: function (g) { return (GRADES[g] || []).length; },
    plan: function (g) { return PAT_PLAN['g' + g] || []; },
    tokenize: tokenize, learn: learn, covered: covered, inflectBase: inflectBase
  };
});
