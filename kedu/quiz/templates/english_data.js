/* =============================================================
 * templates/english_data.js — 아침영어 데이터셋 (하루 한 문장 원장)
 *
 * 정본 설계: handoff/설계-아침영어-v1.md (2026-08-15). 이 파일이 그 §6 스키마의 실물이다.
 *   하루 = { d, pat, sent, ko, tiles, words, new, expand, gloss? }
 *   - gloss: 그날 새 낱말의 문맥 뜻 덮어쓰기(선택). 없으면 공용 GLOSS 를 쓴다.
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
 * 문장은 전부 창작 예문(저작권 0).
 * ★학년 차등(2026-08-16): GRADE_RULES 로 학년별 new/tiles 상한을 코드에 상주 —
 *   학년마다 독립 사다리(zero-base)이며, 차등은 문장 길이와 하루 어휘량으로 준다.
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); return; }
  root.KQuiz = root.KQuiz || {};
  root.KQuiz.englishData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── 사다리 규약 상수 (검사기·엔진과 공유) ─────────────────── */
  var CHUNKS = ["i'm", "it's", "what's", "don't", "can't", "let's", "didn't", "how's", 'thank you'];
  /* 덩어리 → 부여되는 원형 단어(이후 원형이 단독 등장해도 새 단어 아님) */
  var EQUIV = {
    "i'm":   ['i', 'am'],
    "it's":  ['it', 'is'],
    "what's": ['what', 'is'],
    "how's": ['how', 'is'],
    "don't": ['do', 'not'],
    "can't": ['can', 'not'],
    "didn't": ['did', 'not'],
    "let's": ['let'],          /* us 는 부여하지 않는다 — 초등은 let's 를 통짜로 배운다 */
    'thank you': ['thank']
  };
  /* 굴절: 좌↔우 같은 단어 취급(양방향) */
  var INFLECT = {
    apples: 'apple', books: 'book', pencils: 'pencil', years: 'year', likes: 'like',
    bags: 'bag', cats: 'cat', dogs: 'dog', eyes: 'eye', blocks: 'block',
    gets: 'get', goes: 'go', eats: 'eat', wants: 'want', has: 'have', thinks: 'think'
  };
  var WHITELIST = ['ben', 'mia', 'kai', 'oh', 'wow'];

  /* ── 새 낱말 뜻(gloss) ★ (2026-08-16 D8-ⓐ · 설계 §6 스키마 확장) ──────
   * 배지 탭이 소리만 내던 이유는 원장에 뜻 칸이 없어서였다(§4 D3 기록).
   * 그 칸을 여기서 연다. 단위는 원장의 어휘 단위와 같다 — 덩어리("thank you")·
   * 굴절형(apples)·고유명사(busan)도 제 뜻을 따로 갖는다.
   *   GLOSS      : 공용 뜻(그 단위가 원장 전체에서 갖는 기본 뜻)
   *   day.gloss  : 그날 문맥에서 뜻이 갈리는 경우의 덮어쓰기(아래 8건)
   * 뜻은 초등 눈높이로 짧게 — 사전 뜻 나열이 아니라 그 문장에서 쓰인 뜻 하나.
   * 검사기 ⑨절이 전수 강제한다: 뜻 없는 새 낱말 0 · 고아 덮어쓰기 0 · 죽은 항목 0.
   * ================================================================= */
  var GLOSS = {
    'a': '하나의', 'about': '(How about) ~은 어때', 'and': '그리고', 'apples': '사과들',
    'are': '~이다, ~있다', 'at': '~에', 'bag': '가방', 'be': '~이다',
    'because': '왜냐하면', 'bed': '침대', 'been': '(have been) 가 본 적 있다',
    'big': '큰', 'bigger': '더 큰', 'blocks': '(길의) 블록', 'blue': '파란색',
    'book': '책', 'borrow': '빌리다', 'busan': '부산', 'busy': '바쁜',
    'can': '~할 수 있다', "can't": '~할 수 없다', 'canada': '캐나다', 'cap': '모자',
    'cat': '고양이', 'close': '닫다', 'cold': '추운', 'color': '색깔',
    'come': '오다', 'cook': '요리사', 'corner': '모퉁이', 'could': '~해 주시겠어요',
    'curly': '곱슬곱슬한', 'day': '날, 하루', 'desk': '책상', 'did': '(지난 일) ~했니',
    "didn't": '~하지 않았다', 'do': '하다', 'doctor': '의사', 'does': '(묻는 말을 만드는 말)',
    'dog': '개', "don't": '~하지 않다', 'door': '문', 'down': '아래로',
    'eat': '먹다', 'eight': '여덟, 8', 'ever': '(경험) 한 번이라도', 'every': '매~, 모든',
    'everyone': '모두', 'exercise': '운동하다', 'eyes': '눈', 'faster': '더 빠른',
    'fine': '잘 지내는', 'four': '넷, 4', 'friday': '금요일', 'from': '~에서 (온)',
    'get': '(get up) 일어나다', 'go': '가다', 'going': '(be going to) ~할 거야',
    'good': '좋은', 'goodbye': '안녕 (헤어질 때)', 'great': '아주 좋은', 'green': '초록색',
    'had': '(have의 과거) 먹었다', 'hair': '머리카락', 'happy': '기쁜',
    'has': '가지고 있다', 'have': '가지고 있다', 'he': '그는', 'hello': '안녕 (만날 때)',
    'help': '돕다', 'here': '여기에', 'hi': '안녕', 'hot': '더운', 'house': '집',
    'how': '어떻게, 얼마나', 'i': '나는', "i'm": '나는 ~이다', 'in': '~ 안에',
    'is': '~이다, ~있다', 'it': '그것', "it's": '그것은 ~이다', 'jeju': '제주',
    'jump': '뛰다', 'kind': '친절한', 'korea': '한국', 'late': '늦은', 'left': '왼쪽',
    "let's": '~하자', 'like': '좋아하다', 'long': '긴', 'look': '(look like) ~처럼 보이다',
    'lost': '잃어버렸다', 'lunch': '점심', 'many': '(How many) 몇 개의',
    'may': '(May I ~?) ~해도 될까요', 'me': '나를, 나에게', 'meet': '만나다',
    'mine': '내 것', 'monday': '월요일', 'much': '훨씬', 'my': '나의',
    'never': '한 번도 ~않다', 'nine': '아홉, 9', 'no': '아니', 'noon': '낮 열두 시',
    "o'clock": '~시', 'often': '자주', 'old': '(나이가) ~살인', 'on': '~ 위에',
    'one': '하나, 1', 'open': '열다', 'park': '공원', 'pen': '펜', 'pencil': '연필',
    'pencils': '연필들', 'photo': '사진', 'play': '(운동을) 하다', 'please': '~해 주세요',
    'problem': '문제', 'quiet': '조용한', 'rainy': '비 오는', 'red': '빨간색',
    'right': '오른쪽', 'run': '달리다', 'sad': '슬픈', 'saturday': '토요일',
    'saw': '(see의 과거) 보았다', 'school': '학교', 'see': '보다, 만나다',
    'seven': '일곱, 7', 'she': '그녀는', 'short': '짧은', 'sit': '앉다',
    'ski': '스키를 타다', 'so': '그렇게', 'soccer': '축구', 'sorry': '미안해',
    'sounds': '~하게 들리다', 'stand': '서다', 'straight': '곧장', 'sunny': '화창한',
    'sure': '물론이지', 'swim': '수영하다', 'swimming': '수영하기', 'take': '가져가다',
    'tall': '키가 큰', 'taller': '키가 더 큰', 'teacher': '선생님', 'ten': '열, 10',
    'test': '시험', 'than': '~보다', 'thank you': '고마워', 'that': '그것, 저것',
    'the': '그', 'there': '거기에', 'think': '생각하다', 'this': '이것',
    'three': '셋, 3', 'time': '시간, 시각', 'to': '~로, ~에게', 'today': '오늘',
    'together': '함께', 'tomorrow': '내일', 'too': '~도 또한', 'turn': '돌다',
    'tv': '텔레비전', 'twice': '두 번', 'two': '둘, 2', 'under': '~ 아래에',
    'up': '위로', 'use': '쓰다, 사용하다', 'very': '아주', 'visit': '찾아가다',
    'want': '원하다', 'was': '(is의 과거) ~였다', 'watch': '보다', 'we': '우리는',
    'weather': '날씨', 'week': '주, 일주일', 'went': '(go의 과거) 갔다', 'what': '무엇',
    "what's": '무엇이 ~이니', 'where': '어디', 'which': '어느 것', 'whose': '누구의',
    'why': '왜', 'will': '~할 거야', 'winter': '겨울', 'worry': '걱정하다',
    'years': '(나이) 살, 해', 'yellow': '노란색', 'yes': '응, 그래',
    'yesterday': '어제', 'you': '너는, 너를', 'your': '너의'
  };


  /* ── 학년 규약 ★ (설계 §2 학년 차등의 실물) ────────────────────
   * 학년별 독립 사다리(zero-base): 각 학년 40일은 자족적이다.
   *   상급생이 하급 원장을 이수했다는 보장이 없다(도입 시점·전학·미이수) — 학년 안에서
   *   재료가 닫혀 있어야 "오늘 문장을 못 읽는 날"이 구조적으로 생기지 않는다.
   * 학년 차등은 대신 아래 두 상한으로 준다. 검사기가 전수 강제한다.
   *   newMax  : 하루 새 어휘 단위 상한 (3학년 3 → 6학년 4)
   *   tileMax : 조립 타일 수 상한 = 문장 길이 (3학년 6 → 6학년 9)
   * ================================================================= */
  var GRADE_RULES = {
    3: { newMax: 3, tileMax: 6, days: 40 },
    4: { newMax: 3, tileMax: 7, days: 40 },
    5: { newMax: 4, tileMax: 8, days: 40 },
    6: { newMax: 4, tileMax: 9, days: 40 }
  };

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
    ],
    g4: [
      { pat: 'P1',  ko: '시각',        from: 1,  to: 3 },
      { pat: 'P2',  ko: '요일',        from: 4,  to: 6 },
      { pat: 'P3',  ko: '날씨',        from: 7,  to: 10 },
      { pat: 'P4',  ko: '위치',        from: 11, to: 14 },
      { pat: 'P5',  ko: '제안',        from: 15, to: 18 },
      { pat: 'P6',  ko: '금지',        from: 19, to: 22 },
      { pat: 'P7',  ko: '수량',        from: 23, to: 26 },
      { pat: 'P8',  ko: '소유',        from: 27, to: 30 },
      { pat: 'P9',  ko: '사람 묘사',   from: 31, to: 35 },
      { pat: 'P10', ko: '종합',        from: 36, to: 40 }
    ],
    g5: [
      { pat: 'P1',  ko: '출신',        from: 1,  to: 3 },
      { pat: 'P2',  ko: '장래희망',    from: 4,  to: 7 },
      { pat: 'P3',  ko: '외모',        from: 8,  to: 11 },
      { pat: 'P4',  ko: '하루 일과',   from: 12, to: 15 },
      { pat: 'P5',  ko: '과거',        from: 16, to: 19 },
      { pat: 'P6',  ko: '과거 질문',   from: 20, to: 23 },
      { pat: 'P7',  ko: '허락',        from: 24, to: 27 },
      { pat: 'P8',  ko: '초대',        from: 28, to: 31 },
      { pat: 'P9',  ko: '감정·이유',   from: 32, to: 35 },
      { pat: 'P10', ko: '종합',        from: 36, to: 40 }
    ],
    g6: [
      { pat: 'P1',  ko: '계획',        from: 1,  to: 3 },
      { pat: 'P2',  ko: '이유',        from: 4,  to: 7 },
      { pat: 'P3',  ko: '빈도',        from: 8,  to: 11 },
      { pat: 'P4',  ko: '길 안내',     from: 12, to: 15 },
      { pat: 'P5',  ko: '의견',        from: 16, to: 19 },
      { pat: 'P6',  ko: '비교',        from: 20, to: 23 },
      { pat: 'P7',  ko: '경험',        from: 24, to: 27 },
      { pat: 'P8',  ko: '제안',        from: 28, to: 31 },
      { pat: 'P9',  ko: '정중한 요청', from: 32, to: 35 },
      { pat: 'P10', ko: '종합·졸업',   from: 36, to: 40 }
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
      tiles: ['Do', 'you', 'like', 'apples?'], words: ['do', 'you', 'like', 'apples'], new: ['do'], gloss: { 'do': '(묻는 말을 만드는 말)' },
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

  /* ── g4 원장 40일 (독립 사다리 · new ≤3 · tiles ≤7) ─────────
   * 3학년보다 문장이 한 뼘 길고, 시각·요일·날씨처럼 '오늘의 교실'을 바로 말하게 하는 축.
   * 재료는 g3 를 상속하지 않는다 — d1 부터 다시 쌓되 도달 지점이 높다. */
  var G4 = [
    { d: 1, pat: 'P1', sent: "It's seven o'clock.", ko: '7시야.',
      tiles: ["It's", 'seven', "o'clock."], words: ["it's", 'seven', "o'clock"], new: ["it's", 'seven', "o'clock"],
      expand: null },
    { d: 2, pat: 'P1', sent: "It's eight o'clock, Ben.", ko: '벤, 8시야.',
      tiles: ["It's", 'eight', "o'clock,", 'Ben.'], words: ["it's", 'eight', "o'clock", 'ben'], new: ['eight'],
      expand: { sent: "It's seven o'clock, Ben.", ko: '벤, 7시야.' } },
    { d: 3, pat: 'P1', sent: 'What time is it?', ko: '몇 시야?',
      tiles: ['What', 'time', 'is', 'it?'], words: ['what', 'time', 'is', 'it'], new: ['what', 'time'],
      expand: { sent: 'What time is it, Ben?', ko: '벤, 몇 시야?' } },

    { d: 4, pat: 'P2', sent: "It's Monday today.", ko: '오늘은 월요일이야.',
      tiles: ["It's", 'Monday', 'today.'], words: ["it's", 'monday', 'today'], new: ['monday', 'today'],
      expand: { sent: "It's Monday.", ko: '월요일이야.' } },
    { d: 5, pat: 'P2', sent: 'What day is it today?', ko: '오늘 무슨 요일이야?',
      tiles: ['What', 'day', 'is', 'it', 'today?'], words: ['what', 'day', 'is', 'it', 'today'], new: ['day'], gloss: { 'day': '요일' },
      expand: { sent: 'What day is it?', ko: '무슨 요일이야?' } },
    { d: 6, pat: 'P2', sent: "It's Friday!", ko: '금요일이야!',
      tiles: ["It's", 'Friday!'], words: ["it's", 'friday'], new: ['friday'],
      expand: { sent: "It's Friday today!", ko: '오늘은 금요일이야!' } },

    { d: 7, pat: 'P3', sent: "It's sunny today.", ko: '오늘은 맑아.',
      tiles: ["It's", 'sunny', 'today.'], words: ["it's", 'sunny', 'today'], new: ['sunny'],
      expand: { sent: "It's sunny.", ko: '맑아.' } },
    { d: 8, pat: 'P3', sent: 'How is the weather?', ko: '날씨가 어때?',
      tiles: ['How', 'is', 'the', 'weather?'], words: ['how', 'is', 'the', 'weather'], new: ['how', 'the', 'weather'],
      expand: { sent: 'How is the weather today?', ko: '오늘 날씨가 어때?' } },
    { d: 9, pat: 'P3', sent: "It's rainy and cold.", ko: '비 오고 추워.',
      tiles: ["It's", 'rainy', 'and', 'cold.'], words: ["it's", 'rainy', 'and', 'cold'], new: ['rainy', 'and', 'cold'],
      expand: { sent: "It's cold today.", ko: '오늘은 추워.' } },
    { d: 10, pat: 'P3', sent: "It's hot and sunny.", ko: '덥고 맑아.',
      tiles: ["It's", 'hot', 'and', 'sunny.'], words: ["it's", 'hot', 'and', 'sunny'], new: ['hot'],
      expand: { sent: "It's hot today.", ko: '오늘은 더워.' } },

    { d: 11, pat: 'P4', sent: 'The book is on the desk.', ko: '책이 책상 위에 있어.',
      tiles: ['The', 'book', 'is', 'on', 'the', 'desk.'], words: ['the', 'book', 'is', 'on', 'the', 'desk'], new: ['book', 'on', 'desk'],
      expand: null },
    { d: 12, pat: 'P4', sent: 'The cat is under the desk.', ko: '고양이가 책상 아래에 있어.',
      tiles: ['The', 'cat', 'is', 'under', 'the', 'desk.'], words: ['the', 'cat', 'is', 'under', 'the', 'desk'], new: ['cat', 'under'],
      expand: { sent: 'The cat is on the desk.', ko: '고양이가 책상 위에 있어.' } },
    { d: 13, pat: 'P4', sent: 'Where is my bag?', ko: '내 가방 어디 있어?',
      tiles: ['Where', 'is', 'my', 'bag?'], words: ['where', 'is', 'my', 'bag'], new: ['where', 'my', 'bag'],
      expand: { sent: 'Where is my book?', ko: '내 책 어디 있어?' } },
    { d: 14, pat: 'P4', sent: "It's in my bag.", ko: '내 가방 안에 있어.',
      tiles: ["It's", 'in', 'my', 'bag.'], words: ["it's", 'in', 'my', 'bag'], new: ['in'],
      expand: { sent: 'The cat is in my bag.', ko: '고양이가 내 가방 안에 있어.' } },

    { d: 15, pat: 'P5', sent: "Let's go!", ko: '가자!',
      tiles: ["Let's", 'go!'], words: ["let's", 'go'], new: ["let's", 'go'],
      expand: { sent: "Let's go, Ben!", ko: '벤, 가자!' } },
    { d: 16, pat: 'P5', sent: "Let's play soccer.", ko: '축구하자.',
      tiles: ["Let's", 'play', 'soccer.'], words: ["let's", 'play', 'soccer'], new: ['play', 'soccer'],
      expand: { sent: "Let's play!", ko: '놀자!' } },
    { d: 17, pat: 'P5', sent: "Let's go to the park.", ko: '공원에 가자.',
      tiles: ["Let's", 'go', 'to', 'the', 'park.'], words: ["let's", 'go', 'to', 'the', 'park'], new: ['to', 'park'],
      expand: { sent: "Let's go to the park, Mia!", ko: '미아야, 공원에 가자!' } },
    { d: 18, pat: 'P5', sent: 'Sounds good!', ko: '좋아!',
      tiles: ['Sounds', 'good!'], words: ['sounds', 'good'], new: ['sounds', 'good'],
      expand: { sent: "Let's play soccer, Ben!", ko: '벤, 축구하자!' } },

    { d: 19, pat: 'P6', sent: "Don't run.", ko: '뛰지 마.',
      tiles: ["Don't", 'run.'], words: ["don't", 'run'], new: ["don't", 'run'],
      expand: { sent: "Don't go!", ko: '가지 마!' } },
    { d: 20, pat: 'P6', sent: "Don't be late.", ko: '늦지 마.',
      tiles: ["Don't", 'be', 'late.'], words: ["don't", 'be', 'late'], new: ['be', 'late'],
      expand: { sent: "Don't be late, Ben!", ko: '벤, 늦지 마!' } },
    { d: 21, pat: 'P6', sent: "Don't worry, Mia.", ko: '미아야, 걱정하지 마.',
      tiles: ["Don't", 'worry,', 'Mia.'], words: ["don't", 'worry', 'mia'], new: ['worry'],
      expand: { sent: "Don't worry!", ko: '걱정 마!' } },
    { d: 22, pat: 'P6', sent: 'Please be quiet.', ko: '조용히 해 주세요.',
      tiles: ['Please', 'be', 'quiet.'], words: ['please', 'be', 'quiet'], new: ['please', 'quiet'],
      expand: { sent: "Please don't run.", ko: '뛰지 말아 주세요.' } },

    { d: 23, pat: 'P7', sent: 'How many books?', ko: '책이 몇 권이야?',
      tiles: ['How', 'many', 'books?'], words: ['how', 'many', 'books'], new: ['many'],
      expand: { sent: 'How many bags?', ko: '가방이 몇 개야?' } },
    { d: 24, pat: 'P7', sent: 'How many cats do you have?', ko: '고양이를 몇 마리 키워?',
      tiles: ['How', 'many', 'cats', 'do', 'you', 'have?'], words: ['how', 'many', 'cats', 'do', 'you', 'have'], new: ['you', 'have'],
      expand: { sent: 'How many books do you have?', ko: '책이 몇 권 있어?' } },
    { d: 25, pat: 'P7', sent: 'I have three cats.', ko: '나는 고양이가 세 마리 있어.',
      tiles: ['I', 'have', 'three', 'cats.'], words: ['i', 'have', 'three', 'cats'], new: ['i', 'three'],
      expand: { sent: 'I have three books.', ko: '나는 책이 세 권 있어.' } },
    { d: 26, pat: 'P7', sent: 'How many pencils are there?', ko: '연필이 몇 자루 있어?',
      tiles: ['How', 'many', 'pencils', 'are', 'there?'], words: ['how', 'many', 'pencils', 'are', 'there'], new: ['pencils', 'are', 'there'], gloss: { 'there': '(there are) ~이 있다' },
      expand: { sent: 'How many cats are there?', ko: '고양이가 몇 마리 있어?' } },

    { d: 27, pat: 'P8', sent: 'This is my pencil.', ko: '이건 내 연필이야.',
      tiles: ['This', 'is', 'my', 'pencil.'], words: ['this', 'is', 'my', 'pencil'], new: ['this'],
      expand: { sent: 'This is my book.', ko: '이건 내 책이야.' } },
    { d: 28, pat: 'P8', sent: 'Is this your bag?', ko: '이건 네 가방이야?',
      tiles: ['Is', 'this', 'your', 'bag?'], words: ['is', 'this', 'your', 'bag'], new: ['your'],
      expand: { sent: 'Is this your pencil?', ko: '이건 네 연필이야?' } },
    { d: 29, pat: 'P8', sent: "No, it's not mine.", ko: '아니, 내 것 아니야.',
      tiles: ['No,', "it's", 'not', 'mine.'], words: ['no', "it's", 'not', 'mine'], new: ['no', 'mine'],
      expand: { sent: "It's not my bag.", ko: '그건 내 가방이 아니야.' } },
    { d: 30, pat: 'P8', sent: 'Whose book is this?', ko: '이건 누구 책이야?',
      tiles: ['Whose', 'book', 'is', 'this?'], words: ['whose', 'book', 'is', 'this'], new: ['whose'],
      expand: { sent: 'Whose pencil is this?', ko: '이건 누구 연필이야?' } },

    { d: 31, pat: 'P9', sent: 'He is tall.', ko: '그는 키가 커.',
      tiles: ['He', 'is', 'tall.'], words: ['he', 'is', 'tall'], new: ['he', 'tall'],
      expand: { sent: 'Ben is tall.', ko: '벤은 키가 커.' } },
    { d: 32, pat: 'P9', sent: 'She is very kind.', ko: '그녀는 정말 친절해.',
      tiles: ['She', 'is', 'very', 'kind.'], words: ['she', 'is', 'very', 'kind'], new: ['she', 'very', 'kind'],
      expand: { sent: 'Mia is very kind.', ko: '미아는 정말 친절해.' } },
    { d: 33, pat: 'P9', sent: 'He has short hair.', ko: '그는 머리가 짧아.',
      tiles: ['He', 'has', 'short', 'hair.'], words: ['he', 'has', 'short', 'hair'], new: ['short', 'hair'],
      expand: { sent: 'She has short hair.', ko: '그녀는 머리가 짧아.' } },
    { d: 34, pat: 'P9', sent: 'Is she tall?', ko: '그녀는 키가 커?',
      tiles: ['Is', 'she', 'tall?'], words: ['is', 'she', 'tall'], new: [],
      expand: { sent: 'Is he tall?', ko: '그는 키가 커?' } },
    { d: 35, pat: 'P9', sent: 'Yes, she is very tall.', ko: '응, 그녀는 키가 정말 커.',
      tiles: ['Yes,', 'she', 'is', 'very', 'tall.'], words: ['yes', 'she', 'is', 'very', 'tall'], new: ['yes'],
      expand: { sent: 'Yes, he is tall.', ko: '응, 그는 키가 커.' } },

    { d: 36, pat: 'P10', sent: "Let's meet at two o'clock.", ko: '2시에 만나자.',
      tiles: ["Let's", 'meet', 'at', 'two', "o'clock."], words: ["let's", 'meet', 'at', 'two', "o'clock"], new: ['meet', 'at', 'two'],
      expand: { sent: "Let's meet at the park.", ko: '공원에서 만나자.' } },
    { d: 37, pat: 'P10', sent: "Don't be late, please!", ko: '늦지 말아 주세요!',
      tiles: ["Don't", 'be', 'late,', 'please!'], words: ["don't", 'be', 'late', 'please'], new: [],
      expand: { sent: "Please don't be late.", ko: '늦지 말아 주세요.' } },
    { d: 38, pat: 'P10', sent: "It's a very hot day.", ko: '정말 더운 날이야.',
      tiles: ["It's", 'a', 'very', 'hot', 'day.'], words: ["it's", 'a', 'very', 'hot', 'day'], new: ['a'],
      expand: { sent: "It's a very cold day.", ko: '정말 추운 날이야.' } },
    { d: 39, pat: 'P10', sent: "Let's go to the park on Friday.", ko: '금요일에 공원에 가자.',
      tiles: ["Let's", 'go', 'to', 'the', 'park', 'on', 'Friday.'], words: ["let's", 'go', 'to', 'the', 'park', 'on', 'friday'], new: [],
      expand: { sent: "Let's meet at the park on Monday.", ko: '월요일에 공원에서 만나자.' } },
    { d: 40, pat: 'P10', sent: 'See you tomorrow, everyone!', ko: '내일 봐, 모두!',
      tiles: ['See', 'you', 'tomorrow,', 'everyone!'], words: ['see', 'you', 'tomorrow', 'everyone'], new: ['see', 'tomorrow', 'everyone'],
      expand: { sent: 'See you tomorrow, Ben!', ko: '벤, 내일 봐!' } }
  ];

  /* ── g5 원장 40일 (독립 사다리 · new ≤4 · tiles ≤8) ─────────
   * 문장이 '나'를 설명하기 시작한다: 출신·장래·일과·어제 있었던 일.
   * 과거형(went·saw·had·was)이 처음 들어오는 학년이다. */
  var G5 = [
    { d: 1, pat: 'P1', sent: "I'm from Korea.", ko: '나는 한국에서 왔어.',
      tiles: ["I'm", 'from', 'Korea.'], words: ["i'm", 'from', 'korea'], new: ["i'm", 'from', 'korea'],
      expand: null },
    { d: 2, pat: 'P1', sent: 'Where are you from?', ko: '너는 어디에서 왔어?',
      tiles: ['Where', 'are', 'you', 'from?'], words: ['where', 'are', 'you', 'from'], new: ['where', 'are', 'you'],
      expand: { sent: 'Where are you from, Ben?', ko: '벤, 너는 어디에서 왔어?' } },
    { d: 3, pat: 'P1', sent: "I'm from Canada.", ko: '나는 캐나다에서 왔어.',
      tiles: ["I'm", 'from', 'Canada.'], words: ["i'm", 'from', 'canada'], new: ['canada'],
      expand: { sent: 'Are you from Canada?', ko: '너는 캐나다에서 왔어?' } },

    { d: 4, pat: 'P2', sent: "I'm a teacher.", ko: '나는 선생님이야.',
      tiles: ["I'm", 'a', 'teacher.'], words: ["i'm", 'a', 'teacher'], new: ['a', 'teacher'],
      expand: { sent: 'Are you a teacher?', ko: '너는 선생님이야?' } },
    { d: 5, pat: 'P2', sent: 'I want to be a doctor.', ko: '나는 의사가 되고 싶어.',
      tiles: ['I', 'want', 'to', 'be', 'a', 'doctor.'], words: ['i', 'want', 'to', 'be', 'a', 'doctor'], new: ['want', 'to', 'be', 'doctor'], gloss: { 'be': '되다' },
      expand: { sent: 'I want to be a teacher.', ko: '나는 선생님이 되고 싶어.' } },
    { d: 6, pat: 'P2', sent: 'What do you want to be?', ko: '너는 뭐가 되고 싶어?',
      tiles: ['What', 'do', 'you', 'want', 'to', 'be?'], words: ['what', 'do', 'you', 'want', 'to', 'be'], new: ['what', 'do'], gloss: { 'do': '(묻는 말을 만드는 말)' },
      expand: { sent: 'What do you want to be, Mia?', ko: '미아야, 너는 뭐가 되고 싶어?' } },
    { d: 7, pat: 'P2', sent: 'I want to be a cook.', ko: '나는 요리사가 되고 싶어.',
      tiles: ['I', 'want', 'to', 'be', 'a', 'cook.'], words: ['i', 'want', 'to', 'be', 'a', 'cook'], new: ['cook'],
      expand: { sent: 'Mia wants to be a cook.', ko: '미아는 요리사가 되고 싶어 해.' } },

    { d: 8, pat: 'P3', sent: 'She has long hair.', ko: '그녀는 머리가 길어.',
      tiles: ['She', 'has', 'long', 'hair.'], words: ['she', 'has', 'long', 'hair'], new: ['she', 'has', 'long', 'hair'],
      expand: { sent: 'Ben has long hair.', ko: '벤은 머리가 길어.' } },
    { d: 9, pat: 'P3', sent: 'He has curly hair.', ko: '그는 머리가 곱슬이야.',
      tiles: ['He', 'has', 'curly', 'hair.'], words: ['he', 'has', 'curly', 'hair'], new: ['he', 'curly'],
      expand: { sent: 'She has curly hair.', ko: '그녀는 머리가 곱슬이야.' } },
    { d: 10, pat: 'P3', sent: 'She has big eyes.', ko: '그녀는 눈이 커.',
      tiles: ['She', 'has', 'big', 'eyes.'], words: ['she', 'has', 'big', 'eyes'], new: ['big', 'eyes'],
      expand: { sent: 'He has big eyes.', ko: '그는 눈이 커.' } },
    { d: 11, pat: 'P3', sent: 'What does he look like?', ko: '그는 어떻게 생겼어?',
      tiles: ['What', 'does', 'he', 'look', 'like?'], words: ['what', 'does', 'he', 'look', 'like'], new: ['does', 'look', 'like'], gloss: { 'like': '(look like) ~처럼' },
      expand: { sent: 'What does she look like?', ko: '그녀는 어떻게 생겼어?' } },

    { d: 12, pat: 'P4', sent: 'I get up at seven.', ko: '나는 7시에 일어나.',
      tiles: ['I', 'get', 'up', 'at', 'seven.'], words: ['i', 'get', 'up', 'at', 'seven'], new: ['get', 'up', 'at', 'seven'],
      expand: { sent: 'Ben gets up at seven.', ko: '벤은 7시에 일어나.' } },
    { d: 13, pat: 'P4', sent: 'I go to school at eight.', ko: '나는 8시에 학교에 가.',
      tiles: ['I', 'go', 'to', 'school', 'at', 'eight.'], words: ['i', 'go', 'to', 'school', 'at', 'eight'], new: ['go', 'school', 'eight'],
      expand: { sent: 'I go to school at seven.', ko: '나는 7시에 학교에 가.' } },
    { d: 14, pat: 'P4', sent: 'I eat lunch at noon.', ko: '나는 정오에 점심을 먹어.',
      tiles: ['I', 'eat', 'lunch', 'at', 'noon.'], words: ['i', 'eat', 'lunch', 'at', 'noon'], new: ['eat', 'lunch', 'noon'],
      expand: { sent: 'Ben eats lunch at noon.', ko: '벤은 정오에 점심을 먹어.' } },
    { d: 15, pat: 'P4', sent: 'I go to bed at nine.', ko: '나는 9시에 자러 가.',
      tiles: ['I', 'go', 'to', 'bed', 'at', 'nine.'], words: ['i', 'go', 'to', 'bed', 'at', 'nine'], new: ['bed', 'nine'],
      expand: { sent: 'She goes to bed at nine.', ko: '그녀는 9시에 자러 가.' } },

    { d: 16, pat: 'P5', sent: 'I went to the park.', ko: '나는 공원에 갔어.',
      tiles: ['I', 'went', 'to', 'the', 'park.'], words: ['i', 'went', 'to', 'the', 'park'], new: ['went', 'the', 'park'],
      expand: { sent: 'I went to school.', ko: '나는 학교에 갔어.' } },
    { d: 17, pat: 'P5', sent: 'I saw a big dog.', ko: '나는 큰 개를 봤어.',
      tiles: ['I', 'saw', 'a', 'big', 'dog.'], words: ['i', 'saw', 'a', 'big', 'dog'], new: ['saw', 'dog'],
      expand: { sent: 'She saw a big dog.', ko: '그녀는 큰 개를 봤어.' } },
    { d: 18, pat: 'P5', sent: 'We had lunch together.', ko: '우리는 같이 점심을 먹었어.',
      tiles: ['We', 'had', 'lunch', 'together.'], words: ['we', 'had', 'lunch', 'together'], new: ['we', 'had', 'together'],
      expand: { sent: 'We had lunch at noon.', ko: '우리는 정오에 점심을 먹었어.' } },
    { d: 19, pat: 'P5', sent: 'It was a great day.', ko: '멋진 하루였어.',
      tiles: ['It', 'was', 'a', 'great', 'day.'], words: ['it', 'was', 'a', 'great', 'day'], new: ['it', 'was', 'great', 'day'],
      expand: { sent: 'It was a long day.', ko: '긴 하루였어.' } },

    { d: 20, pat: 'P6', sent: 'Did you go to the park?', ko: '너는 공원에 갔어?',
      tiles: ['Did', 'you', 'go', 'to', 'the', 'park?'], words: ['did', 'you', 'go', 'to', 'the', 'park'], new: ['did'],
      expand: { sent: 'Did you go to school?', ko: '너는 학교에 갔어?' } },
    { d: 21, pat: 'P6', sent: 'Yes, I did.', ko: '응, 갔어.',
      tiles: ['Yes,', 'I', 'did.'], words: ['yes', 'i', 'did'], new: ['yes'],
      expand: { sent: 'Yes, we did.', ko: '응, 우리 갔어.' } },
    { d: 22, pat: 'P6', sent: "No, I didn't.", ko: '아니, 안 갔어.',
      tiles: ['No,', 'I', "didn't."], words: ['no', 'i', "didn't"], new: ['no', "didn't"],
      expand: { sent: "No, we didn't.", ko: '아니, 우리 안 갔어.' } },
    { d: 23, pat: 'P6', sent: 'What did you do yesterday?', ko: '너 어제 뭐 했어?',
      tiles: ['What', 'did', 'you', 'do', 'yesterday?'], words: ['what', 'did', 'you', 'do', 'yesterday'], new: ['yesterday'],
      expand: { sent: 'What did you do?', ko: '너 뭐 했어?' } },

    { d: 24, pat: 'P7', sent: 'May I come in?', ko: '들어가도 될까요?',
      tiles: ['May', 'I', 'come', 'in?'], words: ['may', 'i', 'come', 'in'], new: ['may', 'come', 'in'],
      expand: { sent: 'May I go in?', ko: '들어가도 될까요?' } },
    { d: 25, pat: 'P7', sent: 'Sure, come in.', ko: '그럼, 들어와.',
      tiles: ['Sure,', 'come', 'in.'], words: ['sure', 'come', 'in'], new: ['sure'],
      expand: { sent: 'Sure, go in.', ko: '그럼, 들어가.' } },
    { d: 26, pat: 'P7', sent: 'May I use your pencil?', ko: '네 연필 써도 될까?',
      tiles: ['May', 'I', 'use', 'your', 'pencil?'], words: ['may', 'i', 'use', 'your', 'pencil'], new: ['use', 'your', 'pencil'],
      expand: { sent: 'May I use your pencil, Ben?', ko: '벤, 네 연필 써도 될까?' } },
    { d: 27, pat: 'P7', sent: 'Sorry, you may not.', ko: '미안하지만, 안 돼.',
      tiles: ['Sorry,', 'you', 'may', 'not.'], words: ['sorry', 'you', 'may', 'not'], new: ['sorry'],
      expand: { sent: 'No, you may not.', ko: '아니, 안 돼.' } },

    { d: 28, pat: 'P8', sent: 'Will you come to my house?', ko: '우리 집에 올래?',
      tiles: ['Will', 'you', 'come', 'to', 'my', 'house?'], words: ['will', 'you', 'come', 'to', 'my', 'house'], new: ['will', 'my', 'house'],
      expand: { sent: 'Will you come to my school?', ko: '우리 학교에 올래?' } },
    { d: 29, pat: 'P8', sent: 'Sure, I will.', ko: '그럼, 갈게.',
      tiles: ['Sure,', 'I', 'will.'], words: ['sure', 'i', 'will'], new: [],
      expand: { sent: 'Yes, I will.', ko: '응, 갈게.' } },
    { d: 30, pat: 'P8', sent: "Sorry, I can't.", ko: '미안, 못 가.',
      tiles: ['Sorry,', 'I', "can't."], words: ['sorry', 'i', "can't"], new: ["can't"],
      expand: { sent: "Sorry, she can't.", ko: '미안, 그녀는 못 가.' } },
    { d: 31, pat: 'P8', sent: "Let's meet at four.", ko: '4시에 만나자.',
      tiles: ["Let's", 'meet', 'at', 'four.'], words: ["let's", 'meet', 'at', 'four'], new: ["let's", 'meet', 'four'],
      expand: { sent: "Let's meet at school.", ko: '학교에서 만나자.' } },

    { d: 32, pat: 'P9', sent: 'She is happy today.', ko: '그녀는 오늘 행복해.',
      tiles: ['She', 'is', 'happy', 'today.'], words: ['she', 'is', 'happy', 'today'], new: ['is', 'happy', 'today'],
      expand: { sent: "I'm happy today.", ko: '나 오늘 행복해.' } },
    { d: 33, pat: 'P9', sent: 'Why are you sad?', ko: '너 왜 슬퍼?',
      tiles: ['Why', 'are', 'you', 'sad?'], words: ['why', 'are', 'you', 'sad'], new: ['why', 'sad'],
      expand: { sent: 'Why are you happy?', ko: '너 왜 행복해?' } },
    { d: 34, pat: 'P9', sent: 'Because I lost my cap.', ko: '모자를 잃어버렸거든.',
      tiles: ['Because', 'I', 'lost', 'my', 'cap.'], words: ['because', 'i', 'lost', 'my', 'cap'], new: ['because', 'lost', 'cap'],
      expand: { sent: 'Because I lost my pencil.', ko: '연필을 잃어버렸거든.' } },
    { d: 35, pat: 'P9', sent: "Don't worry. I'm here.", ko: '걱정 마. 내가 있잖아.',
      tiles: ["Don't", 'worry.', "I'm", 'here.'], words: ["don't", 'worry', "i'm", 'here'], new: ["don't", 'worry', 'here'],
      expand: { sent: "Don't worry, Mia.", ko: '미아야, 걱정 마.' } },

    { d: 36, pat: 'P10', sent: 'I want to be a great cook.', ko: '나는 훌륭한 요리사가 되고 싶어.',
      tiles: ['I', 'want', 'to', 'be', 'a', 'great', 'cook.'], words: ['i', 'want', 'to', 'be', 'a', 'great', 'cook'], new: [],
      expand: { sent: 'I want to be a great teacher.', ko: '나는 훌륭한 선생님이 되고 싶어.' } },
    { d: 37, pat: 'P10', sent: 'Did you have lunch at noon?', ko: '너 정오에 점심 먹었어?',
      tiles: ['Did', 'you', 'have', 'lunch', 'at', 'noon?'], words: ['did', 'you', 'have', 'lunch', 'at', 'noon'], new: [],
      expand: { sent: 'Did you have lunch together?', ko: '너희 같이 점심 먹었어?' } },
    { d: 38, pat: 'P10', sent: 'She has long hair and big eyes.', ko: '그녀는 머리가 길고 눈이 커.',
      tiles: ['She', 'has', 'long', 'hair', 'and', 'big', 'eyes.'], words: ['she', 'has', 'long', 'hair', 'and', 'big', 'eyes'], new: ['and'],
      expand: { sent: 'He has curly hair and big eyes.', ko: '그는 머리가 곱슬이고 눈이 커.' } },
    { d: 39, pat: 'P10', sent: "Why don't we meet at four?", ko: '우리 4시에 만나는 게 어때?',
      tiles: ['Why', "don't", 'we', 'meet', 'at', 'four?'], words: ['why', "don't", 'we', 'meet', 'at', 'four'], new: [],
      expand: { sent: "Why don't we meet at school?", ko: '우리 학교에서 만나는 게 어때?' } },
    { d: 40, pat: 'P10', sent: 'It was a great day. See you!', ko: '멋진 하루였어. 또 봐!',
      tiles: ['It', 'was', 'a', 'great', 'day.', 'See', 'you!'], words: ['it', 'was', 'a', 'great', 'day', 'see', 'you'], new: ['see'],
      expand: { sent: 'It was a great day, Ben!', ko: '벤, 멋진 하루였어!' } }
  ];

  /* ── g6 원장 40일 (독립 사다리 · new ≤4 · tiles ≤9) ─────────
   * 졸업 학년: 계획·이유·의견·비교·경험처럼 '생각을 말하는' 틀이 축이다.
   * 문장이 두 마디로 이어지고(접속·비교), 마지막 5일은 졸업 인사로 닫는다. */
  var G6 = [
    { d: 1, pat: 'P1', sent: "I'm going to swim.", ko: '나는 수영할 거야.',
      tiles: ["I'm", 'going', 'to', 'swim.'], words: ["i'm", 'going', 'to', 'swim'], new: ["i'm", 'going', 'to', 'swim'],
      expand: null },
    { d: 2, pat: 'P1', sent: "I'm going to visit Busan.", ko: '나는 부산에 갈 거야.',
      tiles: ["I'm", 'going', 'to', 'visit', 'Busan.'], words: ["i'm", 'going', 'to', 'visit', 'busan'], new: ['visit', 'busan'],
      expand: { sent: "I'm going to visit Ben.", ko: '나는 벤을 보러 갈 거야.' } },
    { d: 3, pat: 'P1', sent: 'What are you going to do?', ko: '너는 뭐 할 거야?',
      tiles: ['What', 'are', 'you', 'going', 'to', 'do?'], words: ['what', 'are', 'you', 'going', 'to', 'do'], new: ['what', 'are', 'you', 'do'],
      expand: { sent: 'What are you going to do, Mia?', ko: '미아야, 너는 뭐 할 거야?' } },

    { d: 4, pat: 'P2', sent: 'Why are you so busy?', ko: '너 왜 그렇게 바빠?',
      tiles: ['Why', 'are', 'you', 'so', 'busy?'], words: ['why', 'are', 'you', 'so', 'busy'], new: ['why', 'so', 'busy'],
      expand: { sent: 'Why are you so busy, Ben?', ko: '벤, 너 왜 그렇게 바빠?' } },
    { d: 5, pat: 'P2', sent: 'Because I have a test.', ko: '시험이 있거든.',
      tiles: ['Because', 'I', 'have', 'a', 'test.'], words: ['because', 'i', 'have', 'a', 'test'], new: ['because', 'have', 'a', 'test'],
      expand: { sent: 'Because Ben has a test.', ko: '벤이 시험이 있거든.' } },
    { d: 6, pat: 'P2', sent: 'Why do you like winter?', ko: '너는 왜 겨울을 좋아해?',
      tiles: ['Why', 'do', 'you', 'like', 'winter?'], words: ['why', 'do', 'you', 'like', 'winter'], new: ['like', 'winter'],
      expand: { sent: 'Why do you like Busan?', ko: '너는 왜 부산을 좋아해?' } },
    { d: 7, pat: 'P2', sent: 'Because I can ski.', ko: '스키를 탈 수 있거든.',
      tiles: ['Because', 'I', 'can', 'ski.'], words: ['because', 'i', 'can', 'ski'], new: ['can', 'ski'],
      expand: { sent: 'Because I can swim.', ko: '수영할 수 있거든.' } },

    { d: 8, pat: 'P3', sent: 'How often do you exercise?', ko: '너는 얼마나 자주 운동해?',
      tiles: ['How', 'often', 'do', 'you', 'exercise?'], words: ['how', 'often', 'do', 'you', 'exercise'], new: ['how', 'often', 'exercise'],
      expand: { sent: 'How often do you swim?', ko: '너는 얼마나 자주 수영해?' } },
    { d: 9, pat: 'P3', sent: 'I exercise every day.', ko: '나는 매일 운동해.',
      tiles: ['I', 'exercise', 'every', 'day.'], words: ['i', 'exercise', 'every', 'day'], new: ['every', 'day'],
      expand: { sent: 'I swim every day.', ko: '나는 매일 수영해.' } },
    { d: 10, pat: 'P3', sent: 'I go swimming twice a week.', ko: '나는 일주일에 두 번 수영하러 가.',
      tiles: ['I', 'go', 'swimming', 'twice', 'a', 'week.'], words: ['i', 'go', 'swimming', 'twice', 'a', 'week'], new: ['go', 'swimming', 'twice', 'week'],
      expand: { sent: 'I go swimming every day.', ko: '나는 매일 수영하러 가.' } },
    { d: 11, pat: 'P3', sent: 'I never watch TV.', ko: '나는 TV를 전혀 안 봐.',
      tiles: ['I', 'never', 'watch', 'TV.'], words: ['i', 'never', 'watch', 'tv'], new: ['never', 'watch', 'tv'],
      expand: { sent: 'I watch TV every day.', ko: '나는 매일 TV를 봐.' } },

    { d: 12, pat: 'P4', sent: 'Go straight two blocks.', ko: '두 블록 직진하세요.',
      tiles: ['Go', 'straight', 'two', 'blocks.'], words: ['go', 'straight', 'two', 'blocks'], new: ['straight', 'two', 'blocks'],
      expand: { sent: 'Go straight, Ben.', ko: '벤, 직진해.' } },
    { d: 13, pat: 'P4', sent: 'Turn left.', ko: '왼쪽으로 도세요.',
      tiles: ['Turn', 'left.'], words: ['turn', 'left'], new: ['turn', 'left'],
      expand: { sent: 'Turn left, Ben.', ko: '벤, 왼쪽으로 돌아.' } },
    { d: 14, pat: 'P4', sent: 'Turn right at the corner.', ko: '모퉁이에서 오른쪽으로 도세요.',
      tiles: ['Turn', 'right', 'at', 'the', 'corner.'], words: ['turn', 'right', 'at', 'the', 'corner'], new: ['right', 'at', 'the', 'corner'],
      expand: { sent: 'Turn left at the corner.', ko: '모퉁이에서 왼쪽으로 도세요.' } },
    { d: 15, pat: 'P4', sent: "It's on your left.", ko: '그건 네 왼쪽에 있어.',
      tiles: ["It's", 'on', 'your', 'left.'], words: ["it's", 'on', 'your', 'left'], new: ["it's", 'on', 'your'],
      expand: { sent: "It's on your right.", ko: '그건 네 오른쪽에 있어.' } },

    { d: 16, pat: 'P5', sent: "I think it's great.", ko: '내 생각엔 훌륭해.',
      tiles: ['I', 'think', "it's", 'great.'], words: ['i', 'think', "it's", 'great'], new: ['think', 'great'],
      expand: { sent: "Ben thinks it's great.", ko: '벤은 훌륭하다고 생각해.' } },
    { d: 17, pat: 'P5', sent: 'I think you are right.', ko: '네 말이 맞는 것 같아.',
      tiles: ['I', 'think', 'you', 'are', 'right.'], words: ['i', 'think', 'you', 'are', 'right'], new: [],
      expand: { sent: 'I think Ben is right.', ko: '벤 말이 맞는 것 같아.' } },
    { d: 18, pat: 'P5', sent: 'What do you think?', ko: '너는 어떻게 생각해?',
      tiles: ['What', 'do', 'you', 'think?'], words: ['what', 'do', 'you', 'think'], new: [],
      expand: { sent: 'What do you think, Mia?', ko: '미아야, 너는 어떻게 생각해?' } },
    { d: 19, pat: 'P5', sent: "I don't think so.", ko: '난 그렇게 생각하지 않아.',
      tiles: ['I', "don't", 'think', 'so.'], words: ['i', "don't", 'think', 'so'], new: ["don't"],
      expand: { sent: "I don't think so, Ben.", ko: '벤, 난 그렇게 생각하지 않아.' } },

    { d: 20, pat: 'P6', sent: 'Ben is taller than me.', ko: '벤은 나보다 키가 커.',
      tiles: ['Ben', 'is', 'taller', 'than', 'me.'], words: ['ben', 'is', 'taller', 'than', 'me'], new: ['taller', 'than', 'me'],
      expand: { sent: 'Mia is taller than me.', ko: '미아는 나보다 키가 커.' } },
    { d: 21, pat: 'P6', sent: "I'm faster than Ben.", ko: '나는 벤보다 빨라.',
      tiles: ["I'm", 'faster', 'than', 'Ben.'], words: ["i'm", 'faster', 'than', 'ben'], new: ['faster'],
      expand: { sent: 'Mia is faster than Ben.', ko: '미아는 벤보다 빨라.' } },
    { d: 22, pat: 'P6', sent: 'Which is bigger?', ko: '어느 쪽이 더 커?',
      tiles: ['Which', 'is', 'bigger?'], words: ['which', 'is', 'bigger'], new: ['which', 'bigger'],
      expand: { sent: 'Which is faster?', ko: '어느 쪽이 더 빨라?' } },
    { d: 23, pat: 'P6', sent: 'This one is much bigger.', ko: '이게 훨씬 더 커.',
      tiles: ['This', 'one', 'is', 'much', 'bigger.'], words: ['this', 'one', 'is', 'much', 'bigger'], new: ['this', 'one', 'much'], gloss: { 'one': '(앞에 말한) 것' },
      expand: { sent: 'This one is much faster.', ko: '이게 훨씬 더 빨라.' } },

    { d: 24, pat: 'P7', sent: 'I have been to Busan.', ko: '나는 부산에 가 본 적 있어.',
      tiles: ['I', 'have', 'been', 'to', 'Busan.'], words: ['i', 'have', 'been', 'to', 'busan'], new: ['been'],
      expand: { sent: 'Ben has been to Busan.', ko: '벤은 부산에 가 본 적 있어.' } },
    { d: 25, pat: 'P7', sent: 'Have you ever been to Jeju?', ko: '너 제주에 가 본 적 있어?',
      tiles: ['Have', 'you', 'ever', 'been', 'to', 'Jeju?'], words: ['have', 'you', 'ever', 'been', 'to', 'jeju'], new: ['ever', 'jeju'],
      expand: { sent: 'Have you ever been to Busan?', ko: '너 부산에 가 본 적 있어?' } },
    { d: 26, pat: 'P7', sent: 'Yes, I have. It was great.', ko: '응, 있어. 정말 좋았어.',
      tiles: ['Yes,', 'I', 'have.', 'It', 'was', 'great.'], words: ['yes', 'i', 'have', 'it', 'was', 'great'], new: ['yes', 'was'],
      expand: { sent: 'Yes, I have.', ko: '응, 있어.' } },
    { d: 27, pat: 'P7', sent: 'No, I have never been there.', ko: '아니, 한 번도 안 가 봤어.',
      tiles: ['No,', 'I', 'have', 'never', 'been', 'there.'], words: ['no', 'i', 'have', 'never', 'been', 'there'], new: ['no', 'there'],
      expand: { sent: 'I have never been to Jeju.', ko: '나는 제주에 한 번도 안 가 봤어.' } },

    { d: 28, pat: 'P8', sent: "Why don't we go together?", ko: '우리 같이 가는 게 어때?',
      tiles: ['Why', "don't", 'we', 'go', 'together?'], words: ['why', "don't", 'we', 'go', 'together'], new: ['we', 'together'],
      expand: { sent: "Why don't we go to Busan?", ko: '우리 부산에 가는 게 어때?' } },
    { d: 29, pat: 'P8', sent: 'That sounds great!', ko: '그거 좋다!',
      tiles: ['That', 'sounds', 'great!'], words: ['that', 'sounds', 'great'], new: ['that', 'sounds'],
      expand: { sent: 'That sounds great, Ben!', ko: '벤, 그거 좋다!' } },
    { d: 30, pat: 'P8', sent: 'How about this Saturday?', ko: '이번 토요일 어때?',
      tiles: ['How', 'about', 'this', 'Saturday?'], words: ['how', 'about', 'this', 'saturday'], new: ['about', 'saturday'],
      expand: { sent: 'How about this week?', ko: '이번 주 어때?' } },
    { d: 31, pat: 'P8', sent: "Let's meet at ten.", ko: '10시에 만나자.',
      tiles: ["Let's", 'meet', 'at', 'ten.'], words: ["let's", 'meet', 'at', 'ten'], new: ["let's", 'meet', 'ten'],
      expand: { sent: "Let's meet on Saturday.", ko: '토요일에 만나자.' } },

    { d: 32, pat: 'P9', sent: 'Could you help me, please?', ko: '저 좀 도와주시겠어요?',
      tiles: ['Could', 'you', 'help', 'me,', 'please?'], words: ['could', 'you', 'help', 'me', 'please'], new: ['could', 'help', 'please'],
      expand: { sent: 'Could you help Ben, please?', ko: '벤 좀 도와주시겠어요?' } },
    { d: 33, pat: 'P9', sent: 'Sure, no problem.', ko: '그럼요, 문제없어요.',
      tiles: ['Sure,', 'no', 'problem.'], words: ['sure', 'no', 'problem'], new: ['sure', 'problem'],
      expand: { sent: 'Sure, I can help you.', ko: '그럼요, 제가 도와드릴게요.' } },
    { d: 34, pat: 'P9', sent: 'May I borrow your pen?', ko: '펜 좀 빌려도 될까요?',
      tiles: ['May', 'I', 'borrow', 'your', 'pen?'], words: ['may', 'i', 'borrow', 'your', 'pen'], new: ['may', 'borrow', 'pen'],
      expand: { sent: 'Could I borrow your pen?', ko: '펜 좀 빌릴 수 있을까요?' } },
    { d: 35, pat: 'P9', sent: 'Here you are. Take it.', ko: '여기 있어. 가져가.',
      tiles: ['Here', 'you', 'are.', 'Take', 'it.'], words: ['here', 'you', 'are', 'take', 'it'], new: ['here', 'take'], gloss: { 'here': '여기 있어 (Here you are)' },
      expand: { sent: 'Here you are.', ko: '여기 있어.' } },

    { d: 36, pat: 'P10', sent: "I'm going to visit Jeju this Saturday.", ko: '나는 이번 토요일에 제주에 갈 거야.',
      tiles: ["I'm", 'going', 'to', 'visit', 'Jeju', 'this', 'Saturday.'], words: ["i'm", 'going', 'to', 'visit', 'jeju', 'this', 'saturday'], new: [],
      expand: { sent: "I'm going to visit Busan this Saturday.", ko: '나는 이번 토요일에 부산에 갈 거야.' } },
    { d: 37, pat: 'P10', sent: 'I think Jeju is much bigger than Busan.', ko: '내 생각엔 제주가 부산보다 훨씬 커.',
      tiles: ['I', 'think', 'Jeju', 'is', 'much', 'bigger', 'than', 'Busan.'], words: ['i', 'think', 'jeju', 'is', 'much', 'bigger', 'than', 'busan'], new: [],
      expand: { sent: 'I think Busan is bigger than Jeju.', ko: '내 생각엔 부산이 제주보다 커.' } },
    { d: 38, pat: 'P10', sent: 'How often do you watch TV?', ko: '너는 얼마나 자주 TV를 봐?',
      tiles: ['How', 'often', 'do', 'you', 'watch', 'TV?'], words: ['how', 'often', 'do', 'you', 'watch', 'tv'], new: [],
      expand: { sent: 'How often do you go swimming?', ko: '너는 얼마나 자주 수영하러 가?' } },
    { d: 39, pat: 'P10', sent: 'Could you take a photo, please?', ko: '사진 좀 찍어 주시겠어요?',
      tiles: ['Could', 'you', 'take', 'a', 'photo,', 'please?'], words: ['could', 'you', 'take', 'a', 'photo', 'please'], new: ['photo'],
      expand: { sent: 'Could you take a photo, Ben?', ko: '벤, 사진 좀 찍어 줄래?' } },
    { d: 40, pat: 'P10', sent: 'Thank you, everyone. See you!', ko: '모두 고마워. 또 봐!',
      tiles: ['Thank', 'you,', 'everyone.', 'See', 'you!'], words: ['thank you', 'everyone', 'see', 'you'], new: ['thank you', 'everyone', 'see'],
      expand: { sent: 'Thank you, Ben. See you!', ko: '벤, 고마워. 또 봐!' } }
  ];

  var GRADES = { 3: G3, 4: G4, 5: G5, 6: G6 };

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

  /* 그날 그 단위의 뜻 — 그날 덮어쓰기가 있으면 그것이 이긴다(문맥 우선) */
  function glossOf(g, d, unit) {
    var row = (GRADES[g] || [])[d - 1];
    if (row && row.gloss && row.gloss[unit]) return row.gloss[unit];
    return GLOSS[unit] || '';
  }
  /* 그날 새 낱말을 [{unit, ko}] 로 — 화면·인쇄물이 공유하는 단일 통로 */
  function glossesOf(g, d) {
    var row = (GRADES[g] || [])[d - 1];
    if (!row) return [];
    return (row['new'] || []).map(function (u) { return { unit: u, ko: glossOf(g, d, u) }; });
  }

  /* ── 틀(패턴) 단일 통로 ★ (2026-08-18 D8-ⓔ · 설계 §2·§4) ─────────────
   * 화면·인쇄물은 「몇 주 · 무슨 요일」을 알 수 없다 — 그것은 교사 시간표(ma_routines)가
   * 정하는 것이고 원장에는 없다. 원장이 아는 단위는 오직 **틀**이다.
   * 그래서 묶음·표기를 전부 이 두 통로로만 얻게 한다(뜻을 glossOf 하나로 모은 것과 같은 방식).
   *   patOf(g, d)  : { pat, ko, from, to, idx, len, no } — 그날이 어느 틀의 몇째 날인가
   *   patGroups(g) : 원장 길이로 자른 틀 묶음 배열 — 둘러보기·인쇄물이 이 경계로만 나눈다
   * 원장의 day.pat 과 PAT_PLAN 구간이 어긋나면 **지어내지 않고 null 을 낸다**.
   * ================================================================= */
  function patOf(g, d) {
    var row = (GRADES[g] || [])[d - 1];
    if (!row) return null;
    var plan = PAT_PLAN['g' + g] || [];
    for (var i = 0; i < plan.length; i++) {
      var p = plan[i];
      if (p.pat !== row.pat) continue;
      if (d < p.from || d > p.to) return null;      /* 구간 밖 = 원장 훼손. 거짓말 대신 침묵 */
      return { pat: p.pat, ko: p.ko, from: p.from, to: p.to,
               idx: d - p.from + 1, len: p.to - p.from + 1, no: i + 1 };
    }
    return null;
  }
  function patGroups(g) {
    var n = (GRADES[g] || []).length;
    return (PAT_PLAN['g' + g] || []).map(function (p, i) {
      return { pat: p.pat, ko: p.ko, no: i + 1, from: p.from, to: Math.min(p.to, n) };
    }).filter(function (p) { return p.from <= n; });
  }

  return {
    CHUNKS: CHUNKS, EQUIV: EQUIV, INFLECT: INFLECT, WHITELIST: WHITELIST, PAT_PLAN: PAT_PLAN,
    GLOSS: GLOSS, glossOf: glossOf, glossesOf: glossesOf,
    patOf: patOf, patGroups: patGroups,
    GRADE_RULES: GRADE_RULES,
    rules: function (g) { return GRADE_RULES[g] || null; },
    grades: function () { return Object.keys(GRADES).map(Number); },
    days: function (g) { return GRADES[g] || []; },
    day: function (g, d) { return (GRADES[g] || [])[d - 1] || null; },
    maxDay: function (g) { return (GRADES[g] || []).length; },
    plan: function (g) { return PAT_PLAN['g' + g] || []; },
    tokenize: tokenize, learn: learn, covered: covered, inflectBase: inflectBase
  };
});
