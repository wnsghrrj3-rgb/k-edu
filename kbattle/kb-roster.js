/* ============================================================================
   K-edu 케이배틀 — 학급 명부 (kb-roster.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제7조(신원 = 학급 명부 · 비밀번호 없음), 제8조(최소 수집),
             제9조(answers = 교사 대시보드의 유일한 뿌리), 제1조 ③(교사 영원 무료).

   ⭐ 이 층이 하는 일 하나:
      **교실에서 푼 문제를 아이의 프로필에 잇는다.**
      이게 없으면 트랙 A(교실 대결)는 닉네임뿐이라 XP도, 오답 세트도, 파트너도
      교실에서는 자라지 않는다. 명부가 붙는 순간 "교실에서 벌든 집에서 벌든
      같은 파트너가 자란다"(제7조)가 처음으로 성립한다.

   신원 = 학급코드 + 표시명. 비밀번호 없음(저학년 로그인은 벽 — 제7조).
     교사: 이름만 등록 → 명부 생성
     아이: 목록에서 자기 이름 탭 → 끝

   ⛔ 명부 행에 담기는 것 = 표시명뿐 (제8조). 생년월일·번호·사진 필드 자체가 없다.

   제0조(망이 죽어도 게임은 산다): 명부는 로컬에 캐시된다.
     서버가 안 되면 캐시된 이름 목록이 뜨고, 아이는 그대로 탭해서 들어간다.
     그날 기록은 로컬에 쌓였다가 다음 접속 때 서버로 올라간다.

   공개 API (전부 Promise):
     KBRoster.list(classCode)          명부 [{name, xp}] — 서버 우선, 실패 시 캐시
     KBRoster.cached(classCode)        즉시 반환(동기) — 캐시된 이름 목록
     KBRoster.add(classCode, names[])  교사: 이름 일괄 등록 (기존 아이 XP 안 건드림)
     KBRoster.remove(classCode, name)  교사: 명부에서 빼기
     KBRoster.enter(classCode, name)   아이: 명부 탭 → 프로필 진입 (KBStore 전환)
     KBRoster.classAnswers(classCode)  교사 대시보드 소스 — 반 전체 answers 행
     KBRoster.clearAnswers(classCode)  학년말 정리(제8조): 응답만 지움, XP·파트너는 남음
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  if (root.KBRoster) return;

  var CACHE_PREFIX = 'kb.roster.';
  var NAME_MAX = 10;
  var CLASS_MAX = 12;
  var ANSWERS_LIMIT = 4000;   // 반 전체 조회 상한 (한 학급 한 학기 분량)

  function ls() { try { return root.localStorage || null; } catch (e) { return null; } }

  function db() {
    var f = root.getKeduDb;
    if (typeof f !== 'function') throw new Error('kedu_config.js (getKeduDb) 없음');
    return f();
  }

  function normCode(c) {
    return String(c || '').trim().toUpperCase().slice(0, CLASS_MAX);
  }
  function normName(n) {
    return String(n || '').trim().slice(0, NAME_MAX);
  }

  /* ---------------- 로컬 캐시 (제0조 방어선) ---------------- */
  function cached(classCode) {
    var s = ls(); if (!s) return [];
    try {
      var v = s.getItem(CACHE_PREFIX + normCode(classCode));
      var a = v ? JSON.parse(v) : [];
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function cache(classCode, rows) {
    var s = ls(); if (!s) return rows;
    try { s.setItem(CACHE_PREFIX + normCode(classCode), JSON.stringify(rows)); } catch (e) {}
    return rows;
  }

  /* ---------------- 명부 읽기 ---------------- */
  function list(classCode) {
    var code = normCode(classCode);
    if (!code) return Promise.resolve([]);
    var fallback = cached(code);
    var q;
    try {
      q = db().from('kb_profiles').select('name,xp').eq('class_code', code).order('name');
    } catch (e) { return Promise.resolve(fallback); }

    return Promise.resolve(q).then(function (r) {
      if (!r || r.error || !r.data) return fallback;          // 서버 실패 → 캐시로 계속
      var rows = r.data.map(function (x) {
        return { name: x.name, xp: x.xp | 0 };                // ⛔ 다른 필드 안 들고 옴
      });
      return cache(code, rows);
    }).catch(function () { return fallback; });
  }

  /* ---------------- 교사: 이름 등록 ----------------
     ignoreDuplicates — 이미 있는 아이는 건드리지 않는다.
     (재등록이 XP를 0으로 밀면 안 된다. DB 트리거가 2차 방어, 여기가 1차.) */
  function add(classCode, names) {
    var code = normCode(classCode);
    if (!code) return Promise.reject(new Error('학급 코드가 없어요'));

    var seen = {};
    var rows = (names || []).map(normName).filter(function (n) {
      if (!n || seen[n]) return false;
      seen[n] = 1; return true;
    }).map(function (n) {
      return { class_code: code, name: n };                   // ⛔ 표시명뿐 (제8조)
    });
    if (!rows.length) return Promise.resolve([]);

    var q;
    try {
      q = db().from('kb_profiles')
        .upsert(rows, { onConflict: 'class_code,name', ignoreDuplicates: true });
    } catch (e) { return Promise.reject(e); }

    return Promise.resolve(q).then(function (r) {
      if (r && r.error) throw new Error(r.error.message || '명부 등록 실패');
      return list(code);
    });
  }

  function remove(classCode, name) {
    var code = normCode(classCode), nm = normName(name);
    if (!code || !nm) return Promise.resolve(cached(code));
    var q;
    try {
      q = db().from('kb_profiles').delete().eq('class_code', code).eq('name', nm);
    } catch (e) { return Promise.reject(e); }
    return Promise.resolve(q).then(function (r) {
      if (r && r.error) throw new Error(r.error.message || '삭제 실패');
      return list(code);
    });
  }

  /* ---------------- 아이: 명부 탭 → 프로필 진입 ----------------
     비밀번호 없음. 학급코드를 아는 사람만 그 반에 닿는 구조(제7조 · schema.sql 주석).
     같은 기기에 이미 그 프로필이 있으면 그걸 이어 쓰고(가족·학급 공용 태블릿),
     없으면 만든 뒤 서버본(XP·파트너)을 끌어와 덮는다. */
  function enter(classCode, name) {
    var KBStore = root.KBStore;
    if (!KBStore) return Promise.reject(new Error('kb-store.js 먼저 로드'));
    var code = normCode(classCode), nm = normName(name);
    if (!code || !nm) return Promise.reject(new Error('학급 코드와 이름이 필요해요'));

    KBStore.use('supabase');                                   // 학급 프로필 = 공용
    return KBStore.listLocal().then(function (mine) {
      var hit = null;
      (mine || []).forEach(function (p) {
        if (p.classCode === code && p.name === nm) hit = p;
      });
      if (hit) return KBStore.switchTo(hit.id);                // 기기에 있던 아이 → 이어서
      return KBStore.create({ name: nm, classCode: code })     // 처음 → 만들고
        .then(function () {
          KBStore._reset();                                    // 캐시 비우고
          return KBStore.me();                                 // 서버본(XP·파트너) 병합
        });
    });
  }

  /* ---------------- 교사 대시보드 소스 (제9조) ----------------
     반 전체 answers 행을 그대로 가져온다. 집계는 KBAnswers.byConcept(rows) —
     아이 화면·학부모 리포트와 **같은 함수**. 유료화를 위해 더 모으는 건 없다(제1조 ②). */
  function classAnswers(classCode) {
    var code = normCode(classCode);
    if (!code) return Promise.resolve([]);
    var q;
    try {
      q = db().from('kb_answers')
        .select('qid,concept,difficulty,type,correct,ms,at,kind')
        .eq('class_code', code)
        .order('at', { ascending: false })
        .limit(ANSWERS_LIMIT);
    } catch (e) { return Promise.resolve([]); }

    return Promise.resolve(q).then(function (r) {
      if (!r || r.error || !r.data) return [];
      return r.data.map(function (x) {
        return { qid: x.qid, concept: x.concept || '', difficulty: x.difficulty | 0,
                 type: x.type || '', correct: !!x.correct, ms: x.ms | 0,
                 at: x.at ? new Date(x.at).getTime() : Date.now(), kind: x.kind || 'battle' };
      });
    }).catch(function () { return []; });
  }

  /* 학년말 정리(제8조) — 응답 기록만 지운다. XP·파트너(kb_profiles)는 남아 이관된다. */
  function clearAnswers(classCode) {
    var code = normCode(classCode);
    if (!code) return Promise.resolve(false);
    var q;
    try { q = db().from('kb_answers').delete().eq('class_code', code); }
    catch (e) { return Promise.reject(e); }
    return Promise.resolve(q).then(function (r) {
      if (r && r.error) throw new Error(r.error.message || '삭제 실패');
      return true;
    });
  }

  root.KBRoster = {
    list: list, cached: cached, add: add, remove: remove, enter: enter,
    classAnswers: classAnswers, clearAnswers: clearAnswers,
    _norm: { code: normCode, name: normName }
  };
})();
