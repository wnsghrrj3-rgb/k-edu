/* ============================================================================
   K-edu 케이배틀 — answers 층 (kb-answers.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제9조(answers = 점수·스트릭·교사 통계·배지 판정·학부모 리포트가
             전부 여기서 파생), 제1조(유료는 오직 '보는 눈' — 추가 수집 없음),
             제8조(최소 수집).

   ⭐ 이 층의 존재 이유:
      케이배틀의 모든 파생 가치(교사 형성평가, 학부모 리포트, 오답 재편성, 배지)는
      **새 데이터를 더 모아서가 아니라 이미 쌓인 answers 를 다르게 보는 것**으로 나온다.
      그래서 수집은 딱 한 번, 뷰는 여러 개.

   수집하는 것 전부 (제8조 — 여기 없는 건 안 모은다):
      { qid, concept, difficulty, type, correct, ms, at, kind }
      ⛔ 문제 본문·정답·아이 이름 안 실림. 개념(concept)과 정오만.

   뷰 3종 (전부 같은 answers 에서 파생):
      byConcept()  개념별 정답률   → 아이: "내가 뭘 잘하지" / 교사: 형성평가 / 학부모: 유료 리포트
      growth()     주별 성장 곡선  → 학부모 리포트
      wrongSet()   오답 재편성 세트 → 아이가 다시 푸는 것(무료 — 제1조 ①)

   저장: KBStore 어댑터와 동일한 2종(local ring buffer / supabase kb_answers).
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  if (root.KBAnswers) return;

  var KEY = 'kb.answers';
  var RING_MAX = 600;              // 기기 저장 상한 (약 60판 분량 — 저사양 기기 보호)

  function ls() { try { return root.localStorage || null; } catch (e) { return null; } }
  function read() {
    var s = ls(); if (!s) return [];
    try { var v = s.getItem(KEY); return v ? JSON.parse(v) : []; } catch (e) { return []; }
  }
  function write(a) {
    var s = ls(); if (!s) return false;
    try { s.setItem(KEY, JSON.stringify(a)); return true; } catch (e) { return false; }
  }
  function dayKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  // ISO 주 시작(월요일) 키 — 성장 곡선 축
  function weekKey(ts) {
    var d = new Date(ts);
    var day = (d.getDay() + 6) % 7;               // 월=0
    d.setDate(d.getDate() - day);
    return dayKey(d.getTime());
  }

  /* ---------------- 수집 ----------------
     rows = [{ qid, concept, difficulty, type, correct, ms }]
     meta = { kind:'daily'|'race'|'battle'|'wrongset', profileId, classCode } */
  function log(rows, meta) {
    meta = meta || {};
    var at = Date.now();
    var clean = (rows || []).filter(function (r) { return r && r.qid; }).map(function (r) {
      return {                                    // ⛔ 문제 본문·정답 안 실림
        qid: String(r.qid),
        concept: String(r.concept || ''),
        difficulty: r.difficulty | 0,
        type: String(r.type || ''),
        correct: !!r.correct,
        ms: Math.max(0, r.ms | 0),
        at: at,
        kind: meta.kind || 'battle'
      };
    });
    if (!clean.length) return Promise.resolve([]);

    var all = read().concat(clean);
    if (all.length > RING_MAX) all = all.slice(all.length - RING_MAX);
    write(all);

    // supabase 어댑터일 때만 서버에도 (실패해도 로컬은 이미 남음 — 제0조)
    var KBStore = root.KBStore;
    if (!KBStore || KBStore.kind !== 'supabase' || !meta.profileId) return Promise.resolve(clean);
    try {
      return root.getKeduDb().from('kb_answers').insert(clean.map(function (r) {
        return { profile_id: meta.profileId, class_code: meta.classCode || null,
                 qid: r.qid, concept: r.concept, difficulty: r.difficulty,
                 type: r.type, correct: r.correct, ms: r.ms, kind: r.kind };
      })).then(function () { return clean; }).catch(function () { return clean; });
    } catch (e) { return Promise.resolve(clean); }
  }

  function all() { return read(); }
  function clear() { write([]); }

  /* ---------------- 뷰 ①: 개념별 정답률 ---------------- */
  // → 교사 대시보드(반 전체 = 같은 함수를 반 answers 에 돌림) / 학부모 리포트 / 아이 본인 화면
  function byConcept(rows) {
    rows = rows || read();
    var m = {};
    rows.forEach(function (r) {
      if (!r.concept) return;
      var c = m[r.concept] || (m[r.concept] = { concept: r.concept, n: 0, ok: 0, ms: 0 });
      c.n++; if (r.correct) c.ok++; c.ms += r.ms;
    });
    return Object.keys(m).map(function (k) {
      var c = m[k];
      return { concept: c.concept, n: c.n, ok: c.ok,
               rate: c.n ? c.ok / c.n : 0, avgMs: c.n ? Math.round(c.ms / c.n) : 0 };
    }).sort(function (a, b) { return a.rate - b.rate; });   // 약한 개념이 위로
  }

  /* ---------------- 뷰 ②: 성장 곡선 (주별) ---------------- */
  function growth(rows) {
    rows = rows || read();
    var m = {};
    rows.forEach(function (r) {
      var w = weekKey(r.at);
      var g = m[w] || (m[w] = { week: w, n: 0, ok: 0 });
      g.n++; if (r.correct) g.ok++;
    });
    return Object.keys(m).sort().map(function (w) {
      var g = m[w];
      return { week: g.week, n: g.n, ok: g.ok, rate: g.n ? g.ok / g.n : 0 };
    });
  }

  /* ---------------- 뷰 ③: 오답 재편성 세트 ----------------
     "최근에 틀렸고, 그 뒤로 맞힌 적 없는 문제" — 이미 극복한 건 다시 안 낸다.
     아이가 만지는 것 = 영원히 무료(제1조 ①). 유료는 학부모가 이걸 '보는' 것뿐. */
  function wrongQids(rows) {
    rows = rows || read();
    var last = {};
    rows.forEach(function (r) { last[r.qid] = r.correct; });   // 시간순 → 마지막 결과가 남음
    return Object.keys(last).filter(function (q) { return !last[q]; });
  }

  // 뱅크에서 실제 문제 객체로 복원 (문제 본문은 저장 안 하므로 뱅크에서 다시 찾는다)
  //  교과 문제(케이퀴즈)는 qid 만으로 결정적 재생성된다 — KBank.byIds 가 처리.
  //  ⚠️ 교과 오답을 되살리려면 먼저 KBank.prepare(KBAnswers.wrongQids()) 를 await 해야 한다.
  function wrongSet(n) {
    var KBank = root.KBank;
    if (!KBank) return [];
    var qids = wrongQids();
    var out = KBank.byIds ? KBank.byIds(qids) : (function () {
      var want = {};
      qids.forEach(function (q) { want[q] = 1; });
      return KBank.all().filter(function (q) { return want[q.id]; });
    })();
    return out.slice(0, n || 10);
  }

  root.KBAnswers = {
    log: log, all: all, clear: clear,
    byConcept: byConcept, growth: growth, wrongSet: wrongSet, wrongQids: wrongQids,
    _weekKey: weekKey, RING_MAX: RING_MAX
  };
})();
