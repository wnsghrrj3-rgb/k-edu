/* ============================================================================
   K-edu 케이플 K0 — 덱 시스템 어댑터 (kple-deck.js)
   ----------------------------------------------------------------------------
   "모든 문제가 모든 게임에 꽂힌다." 소스가 무엇이든 통일 덱으로 바꾸고,
   게임이 원하는 config 로 변환한다. 게임은 덱의 출처도, 교란 규칙도 모른다.

   ── 통일 덱 형식 ────────────────────────────────────────────────────────
     { title, items:[{ q, a, options?, hint?, img? }], grade?, subject? }
       q       질문(문자열)
       a       정답 "값"(index 아님). options 있으면 그 중 하나.
       options 이미 객관식이면 보기 배열. 없으면 교란으로 생성.

   ── 소스 3종 (설계 K0) ──────────────────────────────────────────────────
     ⑴ KT_PACKS   window.KT_PACKS[packId]  — {items:[{q,a,hint}]}
                  미로드 시 폴백 스텁(빈 덱 + 경고). 순서 역전 가드.
     ⑵ LESSONS    window.LESSONS[key]      — 케이티처 차시. slides 의
                  basic_problem / leveled_problem / exit_ticket / review 추출.
                  "여러 답"·open 주관식은 제외(객관식 변환 불가).
     ⑶ 놀이덱     PLAY_DECKS               — 자체 샘플(그냥 놀기). 아래 12종.

   ── 교란(오답 생성) 규칙 (설계 2026-07-08 정밀화) ───────────────────────
     수학  {정답±1,±2,±10} 중 자릿수 유지·양수·중복 제외 3개 (부족 시 ±3·±20)
     어휘  같은 덱의 다른 정답 3개 (덱 문항 < 4 → 그 게임에 그 덱 비노출)
     교란은 덱 어댑터 책임. 게임은 완성된 choices/answer 만 받는다.
   ============================================================================ */
(function () {
  'use strict';

  /* ── 유틸 ── */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function norm(s) { return String(s == null ? '' : s).trim(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  // "여러 답 (예: …)" / 자유서술형 = 객관식 변환 불가 → 제외
  function isOpenAnswer(a) {
    if (a == null) return true;
    return /여러\s*답|자유|여러\s*가지|예\s*:/.test(String(a));
  }
  function isNumeric(a) { return /^-?\d+$/.test(norm(a)); }

  /* ── 교란: 수학 ── */
  function distractMath(answer) {
    var a = parseInt(norm(answer), 10);
    if (isNaN(a)) return null;
    var digits = String(Math.abs(a)).length, out = [];
    function feed(list) {
      for (var i = 0; i < list.length && out.length < 3; i++) {
        var v = a + list[i];
        if (v <= 0) continue;                       // 양수만
        if (String(Math.abs(v)).length !== digits) continue; // 자릿수 유지
        if (v === a || out.indexOf(v) >= 0) continue;         // 중복 제외
        out.push(v);
      }
    }
    feed([1, -1, 2, -2, 10, -10]);
    if (out.length < 3) feed([3, -3, 20, -20]);
    return out.length === 3 ? out.map(String) : null;
  }
  /* ── 교란: 어휘 ── (덱의 다른 정답 3개) */
  function distractWord(answer, deckAnswers) {
    var seen = {}, pool = [];
    for (var i = 0; i < deckAnswers.length; i++) {
      var v = norm(deckAnswers[i]);
      if (v && v !== norm(answer) && !seen[v]) { seen[v] = 1; pool.push(v); }
    }
    shuffle(pool);
    return pool.length >= 3 ? pool.slice(0, 3) : null;
  }
  /* item → { choices:[4], answer:index } | null(생성 불가) */
  function makeChoices(item, deckAnswers, subject) {
    // 이미 객관식이면 그대로(정답을 보기 안에 보장)
    if (item.options && item.options.length >= 2) {
      var opts = item.options.map(norm), ai = opts.indexOf(norm(item.a));
      if (ai < 0) { opts = [norm(item.a)].concat(opts); ai = 0; }
      return { choices: opts.slice(0, 4), answer: opts.slice(0, 4).indexOf(norm(item.a)) };
    }
    var mathish = /수학|math/i.test(subject || '') || isNumeric(item.a);
    var wrong = mathish ? distractMath(item.a) : null;
    if (!wrong) wrong = distractWord(item.a, deckAnswers);
    if (!wrong) return null;
    var all = shuffle([norm(item.a)].concat(wrong));
    return { choices: all, answer: all.indexOf(norm(item.a)) };
  }

  /* ── 소스 ⑵: LESSONS 차시 추출 ── */
  function extractFromLesson(lesson) {
    var out = [], slides = (lesson && lesson.slides) || [];
    for (var i = 0; i < slides.length; i++) {
      var b = slides[i].block, d = slides[i].data || {};
      if (b === 'basic_problem' || b === 'advanced_problem' || b === 'question') {
        if (d.question != null && d.answer != null && !isOpenAnswer(d.answer))
          out.push({ q: norm(d.question), a: norm(d.answer), hint: norm(d.title || d.note || '') });
      } else if (b === 'leveled_problem' && d.levels) {
        ['기본', '도전'].forEach(function (k) {   // 심화(open) 제외
          var lv = d.levels[k];
          if (lv && lv.q && lv.a && !lv.open && !isOpenAnswer(lv.a))
            out.push({ q: norm(lv.q), a: norm(lv.a), hint: norm(d.title || '') });
        });
      } else if ((b === 'exit_ticket' || b === 'review') && d.items) {
        d.items.forEach(function (it) {
          if (it.q && it.a && !isOpenAnswer(it.a)) out.push({ q: norm(it.q), a: norm(it.a) });
        });
      }
    }
    return out;
  }
  function fromLessons(keys, meta) {
    var L = (typeof window !== 'undefined' && window.LESSONS) || null;
    if (!L) { console.warn('[kple-deck] LESSONS 미로드'); return null; }
    keys = [].concat(keys);
    var items = [];
    keys.forEach(function (k) { if (L[k]) items = items.concat(extractFromLesson(L[k])); });
    var seen = {}, uniq = [];
    items.forEach(function (it) { if (!seen[it.q]) { seen[it.q] = 1; uniq.push(it); } });
    return {
      title: (meta && meta.title) || '우리 반 배운 것', items: uniq,
      grade: meta && meta.grade, subject: meta && meta.subject
    };
  }

  /* ── 소스 ⑴: KT_PACKS ── (순서 역전 가드: 미로드 = 폴백 스텁) */
  function fromPack(packId) {
    var P = (typeof window !== 'undefined' && window.KT_PACKS) || null;
    if (!P) { console.warn('[kple-deck] KT_PACKS 미로드 — 폴백 스텁(빈 덱)'); return { title: '', items: [], _stub: true }; }
    var pk = P[packId];
    if (!pk) { console.warn('[kple-deck] KT_PACKS 팩 없음: ' + packId); return null; }
    var items = (pk.items || []).filter(function (it) { return it.q && it.a; })
      .map(function (it) { return { q: norm(it.q), a: norm(it.a), hint: norm(it.hint || '') }; });
    return { title: pk.title || packId, items: items, grade: pk.grade, subject: pk.subject };
  }

  /* ── 소스 ⑶: 놀이덱 12종 (그냥 놀기 · 오퍼스 양산 · 저작권/차단어 안전선) ──
     전부 사실 기반 상식·낱말·이모지. 캐릭터·상표·특정 IP 재현 없음.
     저학년 눈높이. 각 덱 정답이 서로 달라 어휘 교란 풀이 충분(≥4문항).      */
  var PLAY_DECKS = {
    emoji: { title: '🖼️ 이모지 뜻 맞히기', subject: '놀이', items: [
      { q: '🌧️ 이 그림이 나타내는 날씨는?', a: '비' },
      { q: '☀️ 이 그림이 나타내는 날씨는?', a: '맑음' },
      { q: '⛄ 이 그림과 어울리는 계절은?', a: '겨울' },
      { q: '🍎 이 그림이 나타내는 과일은?', a: '사과' },
      { q: '🐶 이 그림이 나타내는 동물은?', a: '강아지' },
      { q: '🚒 이 그림이 나타내는 자동차는?', a: '소방차' } ] },
    riddle: { title: '🧩 재미있는 수수께끼', subject: '상식', items: [
      { q: '다리가 넷인데 걷지 못하는 것은?', a: '책상' },
      { q: '먹을수록 많아지는 것은?', a: '나이' },
      { q: '위로 던지면 하얗고 떨어지면 노란 것은?', a: '달걀' },
      { q: '아무리 써도 없어지지 않는 것은?', a: '이름' },
      { q: '문은 문인데 못 여는 문은?', a: '소문' } ] },
    animal: { title: '🐾 동물 상식', subject: '상식', items: [
      { q: '목이 가장 긴 동물은?', a: '기린' },
      { q: '코로 물을 뿜는 큰 동물은?', a: '코끼리' },
      { q: '밤에 눈이 잘 보이고 "야옹" 우는 동물은?', a: '고양이' },
      { q: '등에 딱딱한 껍데기를 지고 천천히 걷는 동물은?', a: '거북이' },
      { q: '꿀을 모으고 꽃을 찾아다니는 곤충은?', a: '벌' } ] },
    opposite: { title: '🔁 반대말 찾기', subject: '국어', items: [
      { q: '"크다"의 반대말은?', a: '작다' },
      { q: '"높다"의 반대말은?', a: '낮다' },
      { q: '"빠르다"의 반대말은?', a: '느리다' },
      { q: '"밝다"의 반대말은?', a: '어둡다' },
      { q: '"뜨겁다"의 반대말은?', a: '차갑다' } ] },
    chosung: { title: '🔤 초성 낱말 퀴즈', subject: '국어', items: [
      { q: '"ㅎㅐ" — 낮에 하늘에 떠서 밝게 비추는 것은?', a: '해' },
      { q: '"ㄷㅏㄹ" — 밤하늘에 뜨는 둥근 것은?', a: '달' },
      { q: '"ㄴㅏㅁㅜ" — 뿌리·줄기·잎이 있는 큰 식물은?', a: '나무' },
      { q: '"ㅁㅜㄹ" — 마시면 목이 시원해지는 것은?', a: '물' },
      { q: '"ㅅㅐ" — 하늘을 날며 지저귀는 동물은?', a: '새' } ] },
    count: { title: '🔢 수 세기 · 계산', subject: '수학', items: [
      { q: '사과 3개 + 사과 2개 = 모두 몇 개?', a: '5' },
      { q: '손가락 열 개에서 셋을 접으면 몇 개가 펴져 있나요?', a: '7' },
      { q: '4보다 1 큰 수는?', a: '5' },
      { q: '6 다음 수는?', a: '7' },
      { q: '8 - 2 는?', a: '6' } ] },
    sound: { title: '🎵 흉내 내는 말', subject: '국어', items: [
      { q: '강아지가 짖는 소리는?', a: '멍멍' },
      { q: '고양이가 우는 소리는?', a: '야옹' },
      { q: '오리가 우는 소리는?', a: '꽥꽥' },
      { q: '개구리가 우는 소리는?', a: '개굴개굴' },
      { q: '빗방울 떨어지는 소리는?', a: '뚝뚝' } ] },
    season: { title: '🍂 계절 이야기', subject: '상식', items: [
      { q: '꽃이 피고 새싹이 돋는 계절은?', a: '봄' },
      { q: '가장 덥고 수박을 먹는 계절은?', a: '여름' },
      { q: '단풍이 들고 낙엽이 지는 계절은?', a: '가을' },
      { q: '눈이 내리고 가장 추운 계절은?', a: '겨울' },
      { q: '봄 다음에 오는 계절은?', a: '여름' } ] },
    body: { title: '🧍 우리 몸', subject: '상식', items: [
      { q: '냄새를 맡는 곳은?', a: '코' },
      { q: '소리를 듣는 곳은?', a: '귀' },
      { q: '음식을 씹는 곳은?', a: '입' },
      { q: '물건을 잡을 때 쓰는 것은?', a: '손' },
      { q: '걸을 때 쓰는 것은?', a: '발' } ] },
    food: { title: '🍚 음식 상식', subject: '상식', items: [
      { q: '벼에서 얻어 밥을 짓는 것은?', a: '쌀' },
      { q: '노랗고 껍질을 까서 먹는 길쭉한 과일은?', a: '바나나' },
      { q: '빨갛고 새콤달콤, 케첩을 만드는 채소는?', a: '토마토' },
      { q: '하얗고 소에서 얻는 마시는 것은?', a: '우유' },
      { q: '김밥을 감쌀 때 쓰는 검은 바다 재료는?', a: '김' } ] },
    color: { title: '🎨 색깔 놀이', subject: '상식', items: [
      { q: '맑은 날 하늘의 색은?', a: '파랑' },
      { q: '잘 익은 토마토의 색은?', a: '빨강' },
      { q: '바나나의 색은?', a: '노랑' },
      { q: '나뭇잎의 색은?', a: '초록' },
      { q: '빨강과 노랑을 섞으면 나오는 색은?', a: '주황' } ] },
    nature: { title: '🌍 자연과 하늘', subject: '상식', items: [
      { q: '비가 온 뒤 하늘에 뜨는 일곱 빛깔 다리는?', a: '무지개' },
      { q: '밤하늘에서 반짝이는 작은 빛은?', a: '별' },
      { q: '물이 얼면 무엇이 되나요?', a: '얼음' },
      { q: '바닷물의 맛은?', a: '짠맛' },
      { q: '해가 지는 쪽은 동쪽일까요 서쪽일까요?', a: '서쪽' } ] }
  };

  /* ── from(): 소스 → 통일 덱 ── */
  function from(source) {
    if (!source) return null;
    if (typeof source === 'string') {
      if (PLAY_DECKS[source]) return clone(PLAY_DECKS[source]);
      return fromPack(source);                 // 문자열 기본 = 팩 id
    }
    if (source.play) return PLAY_DECKS[source.play] ? clone(PLAY_DECKS[source.play]) : null;
    if (source.pack) return fromPack(source.pack);
    if (source.lessons) return fromLessons(source.lessons, source);
    if (source.items) return {                 // 직접 주입(테스트/외부)
      title: source.title || '', items: source.items,
      grade: source.grade, subject: source.subject
    };
    return null;
  }

  /* ── toGame(): 통일 덱 → 게임별 config ──
     게임은 이 config 만 받는다. 교란·형식 변환은 전부 여기서 끝냄.        */
  function toQuizConfig(deck) {
    var items = deck.items || [];
    // 주관식(options 없음) 문항이 있는데 덱 문항<4 → 어휘 교란 불가 → 비노출
    var needDistract = items.some(function (it) { return !(it.options && it.options.length >= 2); });
    if (needDistract && items.length < 4) {
      console.warn('[kple-deck] 덱 문항<4 — 퀴즈류 비노출: ' + deck.title);
      return null;
    }
    var deckAnswers = items.map(function (it) { return norm(it.a); });
    var qs = [];
    items.forEach(function (it) {
      var c = makeChoices(it, deckAnswers, deck.subject);
      if (c) qs.push({ q: it.q, choices: c.choices, answer: c.answer, hint: it.hint || '' });
    });
    return qs.length ? { questions: qs, title: deck.title } : null;
  }
  function toGame(deck, gameId) {
    if (!deck) return null;
    switch (gameId) {
      case 'quiz_show':
      case 'speed_quiz':
      case 'goldenbell':                         // 예약(게이트 후) — 같은 4지선다 계약
        return toQuizConfig(deck);
      case 'co_draw':
        return { topic: deck.title };
      case 'catch_mind': {
        var words = (deck.items || []).map(function (it) { return norm(it.a); }).filter(Boolean);
        return { words: words.length ? words : null, title: deck.title };
      }
      default:                                   // 미지의 게임 → 통일 items 그대로
        return { items: deck.items || [], title: deck.title };
    }
  }

  /* ── 놀이덱 카탈로그(호스트 UI 「그냥 놀기」 탭용) ── */
  function playCatalog() {
    return Object.keys(PLAY_DECKS).map(function (id) {
      return { id: id, title: PLAY_DECKS[id].title, subject: PLAY_DECKS[id].subject, count: PLAY_DECKS[id].items.length };
    });
  }

  window.KpleDeck = {
    from: from, toGame: toGame,
    playCatalog: playCatalog,
    // 내부 노출(테스트·재사용)
    _distractMath: distractMath, _distractWord: distractWord,
    _makeChoices: makeChoices, _extractFromLesson: extractFromLesson,
    _playDecks: PLAY_DECKS
  };
})();
