/* ============================================================================
   K-edu 케이배틀 — 문제 뱅크 (kb-bank.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제2조(문제 어댑터 스키마), 제7조 트랙 C(일일 도전).

   역할: 여러 소스를 KBQ 스키마(제2조) 한 벌로 정규화한다.
     ⑴ KBQ.SAMPLE                         — PoC 4문항
     ⑵ 케이플 놀이덱 (KpleDeck.from(id))   — 12종 상식·국어·수학 (읽기만! 케이플 파일 불변)
     ⑶ 케이플 차시덱 (window.LESSONS)      — 우리 반 배운 것
     ⑷ 차시 옆 문제.json                   — 최종 목적지 (아직 없음. 붙으면 여기 한 줄)

   ⑵⑶은 { q, a } 뿐이라 KBQ 로 올릴 때 유형을 정해줘야 한다:
     - 정답이 수 → numpad (⑤). 수 감각 문제를 4지선다로 내면 찍기가 된다.
     - 그 외    → mcq (①). 교란 3개는 KpleDeck 이 이미 만들어 준다(같은 덱 타정답·수 근접).
   난이도: 정답 길이·자릿수로 대략 매김 (차시 문제.json 이 오면 그쪽 difficulty 를 그대로 씀).

   일일 도전(제7조 트랙 C):
     - **날짜 시드 결정적 출제.** 같은 날 = 같은 10문제 → 반 친구끼리 같은 문제를 푼다
       ("나 오늘 8개!" 가 성립). 서버 부담 0, 고스트전의 토대.
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  if (root.KBank) return;

  var PLAY_IDS = ['emoji', 'riddle', 'animal', 'opposite', 'chosung', 'count',
                  'sound', 'season', 'body', 'food', 'color', 'nature'];

  /* ---------------- 결정적 난수 (날짜 시드) ---------------- */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {                      // mulberry32
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffled(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------------- {q,a} → KBQ 문제 ---------------- */
  function isNum(v) { return /^-?\d+$/.test(String(v).trim()); }

  function difficultyOf(a) {
    var s = String(a).trim();
    if (isNum(s)) return s.replace('-', '').length >= 3 ? 3 : (s.replace('-', '').length >= 2 ? 2 : 1);
    return s.length >= 5 ? 3 : (s.length >= 3 ? 2 : 1);
  }

  // item = { q, choices, answer } (KpleDeck.toGame 산출) 또는 { q, a }
  function toKBQ(item, idx, tag) {
    var ansText = (item.choices && item.choices[item.answer] != null)
      ? String(item.choices[item.answer]) : String(item.a);
    var id = 'kb-' + tag + '-' + idx;
    var diff = difficultyOf(ansText);

    if (isNum(ansText)) {
      return { id: id, type: 'numpad', difficulty: diff, gradeBand: '저', concept: tag,
        prompt: { text: String(item.q), image: null, audio: null },
        payload: { allowMinus: Number(ansText) < 0 },
        answer: { value: Number(ansText) }, timeLimit: 30 };
    }
    if (!item.choices || item.choices.length !== 4) return null;   // 교란 없으면 못 냄
    return { id: id, type: 'mcq', difficulty: diff, gradeBand: '저', concept: tag,
      prompt: { text: String(item.q), image: null, audio: null },
      payload: { choices: item.choices.map(String) },
      answer: { index: item.answer }, timeLimit: 20 };
  }

  // 케이플 덱(놀이·차시) → KBQ 배열. 케이플 파일은 읽기만 한다.
  function fromKpleDeck(source, tag) {
    var KD = root.KpleDeck;
    if (!KD) return [];
    var deck = KD.from(source);
    if (!deck) return [];
    var cfg = KD.toGame(deck, 'quiz_show');       // 교란 생성은 케이플이 이미 함
    var qs = (cfg && cfg.questions) || [];
    var out = [];
    qs.forEach(function (it, i) {
      var q = toKBQ(it, i, tag || 'deck');
      if (q && root.KBQ && root.KBQ.validate(q).length === 0) out.push(q);
    });
    return out;
  }

  // 뱅크 전체 (놀이덱 12종 + 샘플). 차시 문제.json 붙으면 여기 합류.
  function all() {
    var out = [];
    PLAY_IDS.forEach(function (id) { out = out.concat(fromKpleDeck(id, id)); });
    if (!out.length && root.KBQ) out = root.KBQ.SAMPLE.slice();   // 케이플 덱 미로드 시 폴백
    return out;
  }

  /* ---------------- 일일 도전 (제7조 트랙 C) ---------------- */
  // 같은 dateKey = 같은 문제. 기기·아이가 달라도 동일 → "나 오늘 8개!" 가 성립.
  function daily(dateKey, n) {
    n = n || 10;
    var pool = all();
    if (!pool.length) return [];
    var rnd = rng(hash('kb-daily-' + dateKey));
    var picked = shuffled(pool, rnd).slice(0, Math.min(n, pool.length));
    // 쉬운 것 → 어려운 것 (아이가 첫 문제에서 막히지 않게)
    picked.sort(function (a, b) { return a.difficulty - b.difficulty; });
    return picked;
  }

  /* ---------------- 교과 문제 (케이퀴즈 어댑터 · 헌법 제10조 9번) ----------------
     kb-kquiz.js 가 있으면 교과 단원이 뱅크에 합류한다. 없으면 놀이덱만으로 돈다. */
  function lesson(unitKey, opts) {
    var K = root.KBKQuiz;
    return K ? K.set(unitKey, opts) : [];
  }
  function loadLesson(unitKey) {
    var K = root.KBKQuiz;
    return K ? K.load(unitKey) : Promise.reject(new Error('kb-kquiz.js 없음'));
  }

  /* qid → 문제 복원 (오답 재편성의 뿌리).
     answers 엔 qid 만 저장하는데(제8조), 교과 문제는 **결정적 생성**이라 qid 만으로 되살아난다.
     놀이덱 문제는 뱅크에서 찾는다. 저장은 최소, 복원은 완전. */
  function byIds(qids) {
    var want = {};
    (qids || []).forEach(function (q) { want[q] = 1; });
    var K = root.KBKQuiz;
    var out = K ? K.byIds(Object.keys(want).filter(K.isKQ)) : [];
    var rest = Object.keys(want).filter(function (q) { return !(K && K.isKQ(q)); });
    if (rest.length) {
      var got = {};
      rest.forEach(function (q) { got[q] = 1; });
      out = out.concat(all().filter(function (q) { return got[q.id]; }));
    }
    return out;
  }
  // 오답 qid 들이 가리키는 교과 단원을 먼저 로드해 둔다 (byIds 가 온전해진다)
  function prepare(qids) {
    var K = root.KBKQuiz;
    return K ? K.prepare(qids) : Promise.resolve([]);
  }

  root.KBank = {
    all: all, daily: daily, fromKpleDeck: fromKpleDeck,
    lesson: lesson, loadLesson: loadLesson, byIds: byIds, prepare: prepare,
    PLAY_IDS: PLAY_IDS,
    _rng: rng, _hash: hash, _toKBQ: toKBQ
  };
})();
