/* ============================================================================
   K-edu 케이배틀 — 케이퀴즈 어댑터 (kb-kquiz.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제2조(문제 어댑터 · 타이핑 없음), 제9조(answers 의 concept 은 교육과정 개념),
             제10조 9번(차시 문제 주입).

   ⭐ 이 파일이 하는 일 하나:
      **케이배틀에 진짜 교과 문제를 붙인다.**
      새로 문제를 쓰지 않는다. K-edu 에는 이미 케이퀴즈(`kedu/quiz/`)가 있다 —
      20단원치 **파라메트릭 생성기**(규칙으로 심어 seed 하나로 재현 생성).
      케이배틀은 그걸 KBQ 스키마(제2조) 로 번역해 쓰기만 한다.
      ⛔ 케이퀴즈 파일은 읽기만 한다 (케이플과 같은 원칙).

   유형 번역 (제2조: 조작은 탭뿐 · 타이핑 없음):
      KQuiz choice → KBQ mcq     (교란 4개는 케이퀴즈가 이미 만든다)
      KQuiz ox     → KBQ ox
      KQuiz short  → 수면 KBQ numpad / 글자면 ⛔ 버림 (타이핑 금지)
      KQuiz open   → ⛔ 버림 (자동채점 대상 아님)

   ⭐ qid 가 곧 복원 열쇠:
      `kq:{단원키}:{seed}:{n}:{i}`
      케이퀴즈 생성이 **결정적**이라 이 다섯 조각이면 문제를 통째로 되살릴 수 있다.
      → answers 에는 여전히 qid 만 저장(제8조: 문제 본문 안 실림)하는데도
        **오답 재편성이 교과 문제까지 복원한다.** 저장은 최소, 복원은 완전.

   공개 API:
     KBKQuiz.catalog()                 Promise<[{key,grade,subject,subjectKo,unitNo,name,...}]>
     KBKQuiz.load(unitKey)             Promise — 그 단원 템플릿만 지연 로드(폰 보호)
     KBKQuiz.set(unitKey, {n, seed})   KBQ[] (load 후 동기)
     KBKQuiz.byIds(qids)               KBQ[] — qid 로 되살리기 (로드된 단원만)
     KBKQuiz.prepare(qids)             Promise — qid 들이 가리키는 단원을 전부 로드
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  if (root.KBKQuiz) return;

  var BASE = '../kedu/quiz/';          // kbattle/ 에서 본 케이퀴즈 위치
  var loaded = {};                     // unitKey → true
  var pending = {};                    // unitKey → Promise
  var catCache = null;
  var unitName = {};                   // unitKey → 단원명 (concept 기본값)
  var setCache = {};                   // "key|seed|n" → KBQ[]  (복원 재생성 비용 0)

  function inject(src) {
    return new Promise(function (res, rej) {
      var s = root.document.createElement('script');
      s.src = src;
      s.onload = function () { res(true); };
      s.onerror = function () { rej(new Error('로드 실패: ' + src)); };
      root.document.head.appendChild(s);
    });
  }

  function core() { return root.KQuiz && root.KQuiz.core; }

  function catalog() {
    if (catCache) return Promise.resolve(catCache);
    return fetch(BASE + 'catalog.json').then(function (r) { return r.json(); }).then(function (j) {
      catCache = (j && j.units) || [];
      catCache.forEach(function (u) { unitName[u.key] = u.name; });
      return catCache;
    }).catch(function () { return []; });
  }

  // 단원 템플릿 지연 로드 — 폰에 20개 파일을 다 내리지 않는다(제0조: 저사양·저속).
  function load(unitKey) {
    if (loaded[unitKey]) return Promise.resolve(true);
    if (pending[unitKey]) return pending[unitKey];
    var p = (core() ? Promise.resolve(true) : inject(BASE + 'kquiz-core.js'))
      .then(function () { return inject(BASE + 'templates/' + unitKey + '.js'); })
      .then(function () {
        if (!core() || !core().has(unitKey)) throw new Error('미등록 단원: ' + unitKey);
        loaded[unitKey] = true;
        return catalog();                       // 단원명(concept) 확보
      })
      .then(function () { return true; })
      .catch(function (e) { delete pending[unitKey]; throw e; });
    pending[unitKey] = p;
    return p;
  }

  /* ---------------- 번역: KQuiz item → KBQ 문제 ---------------- */
  function band(grade) { return grade <= 2 ? '저' : (grade <= 4 ? '중' : '고'); }
  function isNum(v) { return /^-?\d+(\.\d+)?$/.test(String(v).trim()); }

  function toKBQ(item, id, concept, gradeBand) {
    var diff = Math.min(3, Math.max(1, item.difficulty | 0 || 1));
    var base = { id: id, difficulty: diff, gradeBand: gradeBand, concept: concept,
                 prompt: { text: String(item.q), image: null, audio: null } };

    if (item.type === 'choice') {
      var ch = (item.choices || []).map(String);
      if (ch.length !== 4) return null;                       // 4지 아니면 안 낸다
      if (!(item.answer >= 0 && item.answer < 4)) return null;
      base.type = 'mcq';
      base.payload = { choices: ch };
      base.answer = { index: item.answer };
      base.timeLimit = 20;
      return base;
    }
    if (item.type === 'ox') {
      base.type = 'ox';
      base.payload = {};
      base.answer = { value: !!item.answer };
      base.timeLimit = 15;
      return base;
    }
    if (item.type === 'short') {
      if (!isNum(item.answer)) return null;                   // ⛔ 글자 입력 = 타이핑 (제2조)
      var v = Number(item.answer);
      base.type = 'numpad';
      base.payload = {
        allowMinus: v < 0,
        allowDecimal: !Number.isInteger(v)                    // 소수 답 → 소수점 키를 켠다(6학년 소수의 나눗셈)
      };
      base.answer = { value: v };
      base.timeLimit = 30;
      return base;
    }
    return null;                                              // open 등 → 버림
  }

  /* ---------------- 한 단원 → KBQ 세트 (결정적) ---------------- */
  function set(unitKey, opts) {
    opts = opts || {};
    var C = core();
    if (!C || !C.has(unitKey)) return [];
    var n = opts.n || 10;
    var seed = (opts.seed != null) ? (opts.seed | 0) : 1;
    var ck = unitKey + '|' + seed + '|' + n;
    if (setCache[ck]) return setCache[ck];

    var grade = parseInt((unitKey.match(/^g(\d+)/) || [0, 1])[1], 10) || 1;
    var gb = band(grade);
    var res;
    try { res = C.generate({ lesson: unitKey, n: n, seed: seed }); }
    catch (e) { return []; }

    var out = [];
    (res.items || []).forEach(function (it, i) {
      // concept = 템플릿이 알려주면 그것, 아니면 단원명. 교사 대시보드의 가로축이 된다(제9조).
      var concept = it.concept || unitName[unitKey] || unitKey;
      var q = toKBQ(it, 'kq:' + unitKey + ':' + seed + ':' + n + ':' + i, concept, gb);
      if (q && root.KBQ && root.KBQ.validate(q).length === 0) out.push(q);
    });
    setCache[ck] = out;
    return out;
  }

  /* ---------------- qid → 문제 복원 (오답 재편성) ---------------- */
  function parse(qid) {
    var m = String(qid).match(/^kq:([^:]+):(-?\d+):(\d+):(\d+)$/);
    if (!m) return null;
    return { key: m[1], seed: parseInt(m[2], 10), n: parseInt(m[3], 10), i: parseInt(m[4], 10) };
  }

  function byIds(qids) {
    var out = [];
    var C = core();
    (qids || []).forEach(function (qid) {
      var p = parse(qid);
      if (!p || !C || !C.has(p.key)) return;      // 그 단원 템플릿이 아직 없음 → 조용히 스킵
      var s = set(p.key, { n: p.n, seed: p.seed });
      var hit = s.filter(function (q) { return q.id === qid; })[0];
      // 결정적 생성이라 같은 seed·n 이면 같은 세트가 나온다. id 로 확인해서 꺼낸다.
      if (hit) out.push(hit);
    });
    return out;
  }

  // 오답 qid 들이 가리키는 단원을 전부 로드 — 이 뒤에 byIds 가 온전해진다.
  function prepare(qids) {
    var keys = {};
    (qids || []).forEach(function (qid) {
      var p = parse(qid);
      if (p) keys[p.key] = 1;
    });
    var list = Object.keys(keys);
    if (!list.length) return Promise.resolve([]);
    return Promise.all(list.map(function (k) {
      return load(k).catch(function () { return false; });    // 한 단원이 죽어도 나머지는 산다
    }));
  }

  root.KBKQuiz = {
    catalog: catalog, load: load, set: set, byIds: byIds, prepare: prepare,
    isKQ: function (qid) { return !!parse(qid); },
    _parse: parse, _toKBQ: toKBQ, _base: BASE
  };
})();
