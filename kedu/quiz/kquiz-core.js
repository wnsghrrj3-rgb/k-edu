/* =============================================================
 * kquiz-core.js — 케이퀴즈(K-Quiz) 생성 엔진 (순수 · DOM 0)
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md
 *
 * 한 줄: 문제를 파일로 쌓지 않고 규칙(템플릿)으로 심어 seed 하나로 재현 생성.
 *   생성 규칙은 데이터(templates/*.js), 엔진은 하나(이 파일), 소비처는 셋.
 *
 * 노출: window.KQuiz.core (브라우저) + module.exports (node 테스트) 이중.
 *   THREE·DOM·canvas·AudioContext 참조 0 — node 순수 단언 가능(P1 게이트 스타일).
 *
 * 템플릿 4종: param(수치 파라메트릭) · compose(한글 자모) · pick(고정 풀) · seq(순서·배열)
 * 문항 4형: choice · ox · short · open (open은 자동채점 세트 제외)
 * ============================================================= */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;   // node
  root.KQuiz = root.KQuiz || {};
  root.KQuiz.core = api;                                                     // browser
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── 결정론 rng (mulberry32 — labs/mathlab_number.html 자산 이식) ──────────
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // 문자열/숫자 seed → 32bit 정수 (FNV-1a 계열)
  function seedInt(s) {
    if (typeof s === 'number' && isFinite(s)) return s >>> 0;
    var str = String(s == null ? '' : s), h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }
  // rng 헬퍼 래퍼 — 템플릿 gen(rng)에 넘어가는 객체
  function makeRng(seed) {
    var next = mulberry32(seedInt(seed));
    return {
      next: next,                                   // [0,1)
      int: function (min, max) {                    // [min,max] 정수 포함
        return min + Math.floor(next() * (max - min + 1));
      },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      shuffle: function (arr) {                      // Fisher–Yates (비파괴)
        var a = arr.slice(), i, j, t;
        for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(next() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      }
    };
  }

  // ── 한글 자모 조합 (augment compose 검산 방식 이식) ───────────────────────
  var CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  var JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  function compose(cho, jung) {
    var ci = CHO.indexOf(cho), ji = JUNG.indexOf(jung);
    if (ci < 0 || ji < 0) return null;
    return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28);   // 받침 없는 글자
  }
  // 역산 검증(테스트용): 글자 → {cho,jung}
  function decompose(ch) {
    var code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return null;
    var jong = code % 28;
    if (jong !== 0) return null;                  // 받침 있으면 대상 아님
    var ci = Math.floor(code / 28 / 21), ji = Math.floor(code / 28) % 21;
    return { cho: CHO[ci], jung: JUNG[ji] };
  }

  // ── 답 정규화 (short 채점: 공백·전각 제거) ───────────────────────────────
  function normAnswer(s) {
    return String(s == null ? '' : s)
      .replace(/\s+/g, '')
      .replace(/[\uFF01-\uFF5E]/g, function (c) {    // 전각→반각
        return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
      })
      .toLowerCase();
  }

  // ── 오답(distractor) 정제: 정답충돌·중복·범위밖 필터 후 부족분 채움 ────────
  //  템플릿 작성자를 믿지 않는다(SPEC §9-1). core가 최종 책임.
  function buildChoices(correctVal, rawDistractors, rng, opts) {
    opts = opts || {};
    var want = opts.count || 4;                 // 총 보기 수(정답 포함)
    var inRange = opts.inRange || function () { return true; };
    var toKey = function (v) { return String(v); };
    var seen = {}; seen[toKey(correctVal)] = true;
    var pool = [];
    (rawDistractors || []).forEach(function (d) {
      var k = toKey(d);
      if (seen[k]) return;                      // 정답충돌·상호중복 제거
      if (!inRange(d)) return;                   // 학년 범위 밖 제거
      seen[k] = true; pool.push(d);
    });
    // 부족분: 정답 주변 ±1..±k 정수로 자동 보강(param형 안전망)
    if (opts.autofillNumeric && pool.length < want - 1) {
      var delta = 1;
      while (pool.length < want - 1 && delta < 40) {
        [correctVal - delta, correctVal + delta].forEach(function (cand) {
          if (pool.length >= want - 1) return;
          var k = toKey(cand);
          if (!seen[k] && inRange(cand)) { seen[k] = true; pool.push(cand); }
        });
        delta++;
      }
    }
    pool = pool.slice(0, want - 1);
    var choices = rng.shuffle(pool.concat([correctVal]));
    return { choices: choices, answer: choices.map(toKey).indexOf(toKey(correctVal)) };
  }

  // ── 단일 문항 생성 (템플릿 1회 실행 + validate 재시도 상한) ────────────────
  var RETRY_MAX = 20;   // SPEC §8-4 무한루프 금지
  function genOne(tpl, rng, ctx) {
    var p, ans, tries = 0;
    do {
      p = tpl.gen(rng);
      ans = tpl.answer ? tpl.answer(p) : (p && p.answer);
      tries++;
      if (!tpl.validate || tpl.validate(p, ans)) break;
    } while (tries < RETRY_MAX);
    if (tpl.validate && !tpl.validate(p, ans)) return null;   // 상한 초과 → 스킵

    var type = tpl.type === 'compose' ? (tpl.itemType || 'choice')
             : (tpl.itemType || (tpl.itemTypeOf ? tpl.itemTypeOf(p) : 'choice'));
    var q = tpl.render(p);
    var item = {
      source: ctx.source,
      type: type,
      q: q,
      difficulty: tpl.difficulty || 1,
      gen: { template_id: tpl.id, seed: ctx.seed }
    };
    if (tpl.explain) item.explain = tpl.explain(p, ans);
    if (tpl.concept) item.concept = tpl.concept;   // 소비처(케이배틀 answers)의 개념 축. 없으면 단원명으로 대체됨.

    if (type === 'choice') {
      var raw = tpl.distractors ? tpl.distractors(p, ans, rng) : [];
      var built = buildChoices(ans, raw, rng, {
        count: tpl.choiceCount || 4,
        inRange: tpl.inRange,
        autofillNumeric: tpl.autofillNumeric !== false && typeof ans === 'number'
      });
      item.choices = built.choices.map(String);
      item.answer = built.answer;
    } else if (type === 'ox') {
      item.answer = !!ans;
    } else if (type === 'short') {
      item.answer = String(ans);
    } else if (type === 'open') {
      item.answer = null;                        // 자동채점 대상 아님
    }
    return item;
  }

  // ── 템플릿 레지스트리 (templates/*.js가 등록) ─────────────────────────────
  var REG = {};   // lessonKey → { source, fixed:[], templates:[] }
  function register(lessonKey, def) { REG[lessonKey] = def; }

  /* 등록된 세트 정의를 읽는다(합성 세트용 — 아침활동 수학이 여러 차시의
     templates 를 엮어 '오늘 것 + 복습' 한 벌로 만든다).
     REG 자체는 노출하지 않는다. 반환값을 수정하면 원본이 상한다 — 읽기 전용으로 쓸 것. */
  function getDef(lessonKey) { return REG[lessonKey] || null; }
  function has(lessonKey) { return !!REG[lessonKey]; }

  // ── 공개: generate ───────────────────────────────────────────────────────
  //  opts = { lesson, n=10, seed, difficulty=[1,2,3], includeFixed=true }
  function generate(opts) {
    opts = opts || {};
    var key = opts.lesson;
    var def = REG[key];
    if (!def) throw new Error('[KQuiz] 미등록 lesson: ' + key);
    var n = opts.n || 10;
    var seed = opts.seed != null ? opts.seed : Math.floor(Math.random() * 1e9);
    var diffs = opts.difficulty || [1, 2, 3];
    var includeFixed = opts.includeFixed !== false;
    var rng = makeRng(seed);
    var source = def.source;
    var items = [];

    // ① 고정 문항(난이도 필터) — 있으면 앞에서 일부 채움(최대 n의 40%)
    if (includeFixed && def.fixed && def.fixed.length) {
      var pool = def.fixed.filter(function (f) {
        return diffs.indexOf(f.difficulty || 1) >= 0 && f.type !== 'open';
      });
      var takeFixed = Math.min(pool.length, Math.floor(n * 0.4));
      rng.shuffle(pool).slice(0, takeFixed).forEach(function (f) {
        var it = JSON.parse(JSON.stringify(f));
        it.source = source; it.gen = { template_id: 'fixed', seed: seed };
        items.push(it);
      });
    }

    // ② 템플릿 문항 — 난이도 맞는 템플릿을 라운드로빈으로 돌려 나머지 채움
    var usable = (def.templates || []).filter(function (t) {
      return diffs.indexOf(t.difficulty || 1) >= 0;
    });
    if (usable.length === 0 && items.length < n) {
      // 고정만으로 부족하고 템플릿도 없으면 있는 만큼만 반환(관문 없음)
      return { set: key, seed: seed, items: items.slice(0, n) };
    }
    // 같은 발문이 한 세트에 두 번 나오지 않게 1차로 거른다.
    //   출제 풀이 좁은 세트(예: 한자 회차 10자)에서 라운드로빈이 같은 문항을 다시 뽑는 걸 막는다.
    //   중복을 피하다 n을 못 채우면 2차에서 중복을 허용해 문항 수를 반드시 보장한다(기존 동작 호환).
    var guard = 0, ti = 0, seen = {};
    function push(it, tpl) {
      it.id = key + '_' + tpl.id + '_s' + seedInt(seed) + '_q' + items.length;
      items.push(it);
    }
    while (items.length < n && guard < n * RETRY_MAX) {
      var tpl = usable[ti % usable.length]; ti++; guard++;
      var it = genOne(tpl, rng, { source: source, seed: seed });
      if (it && !seen[it.q]) { seen[it.q] = 1; push(it, tpl); }
    }
    guard = 0;
    while (items.length < n && guard < n * RETRY_MAX) {      // 폴백: 중복 허용
      var tpl2 = usable[ti % usable.length]; ti++; guard++;
      var it2 = genOne(tpl2, rng, { source: source, seed: seed });
      if (it2) push(it2, tpl2);
    }
    return { set: key, seed: seed, items: items };
  }

  // ── 공개: 채점 ───────────────────────────────────────────────────────────
  function gradeOne(item, answer) {
    if (!item || item.type === 'open') return { correct: null };
    if (item.type === 'choice') return { correct: Number(answer) === Number(item.answer) };
    if (item.type === 'ox') return { correct: !!answer === !!item.answer };
    if (item.type === 'short') return { correct: normAnswer(answer) === normAnswer(item.answer) };
    return { correct: null };
  }
  function gradeSet(items, answers) {
    var scorable = items.filter(function (it) { return it.type !== 'open'; });
    var correct = 0, detail = [];
    items.forEach(function (it, i) {
      var r = gradeOne(it, answers ? answers[i] : undefined);
      if (r.correct === true) correct++;
      detail.push({ id: it.id, answer: answers ? answers[i] : null, correct: r.correct });
    });
    return { score: correct, max: scorable.length, detail: detail };
  }

  return {
    version: 1,
    generate: generate, gradeOne: gradeOne, gradeSet: gradeSet,
    register: register, has: has, getDef: getDef,
    // 유틸 노출(템플릿·테스트용)
    _util: { makeRng: makeRng, seedInt: seedInt, compose: compose, decompose: decompose,
             normAnswer: normAnswer, buildChoices: buildChoices, CHO: CHO, JUNG: JUNG }
  };
});
