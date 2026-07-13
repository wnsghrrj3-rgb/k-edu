/* ============================================================================
   K-edu 케이배틀 — 프로필 영속 (kb-store.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제7조(신원 = 학급 명부·비밀번호 없음), 제8조(최소 수집), 제9조(데이터 골격).

   "교실에서 벌든 집에서 벌든 같은 파트너가 자란다" — 프로필은 하나.
   그래서 저장소는 **어댑터 2종**을 같은 계약 뒤에 숨긴다:

     local     기기 안에서만 영속 (localStorage). 서버 없이도 케이배틀이 완전히 돈다.
               → 헌법 제0조(저사양·저속·산골) 의 최후 방어선. 망이 죽어도 게임은 산다.
     supabase  학급 명부 기반 공용 프로필 (classes / profiles / answers).
               → 교실↔집 통합. `KBStore.use('supabase')` 로 전환.

   ⛔ 수집 안 하는 것(제8조): 생년월일·전화·이메일·사진·주소·비밀번호 — 필드 자체가 없다.
      저장하는 것 전부: 표시명, XP, 파트너 상태, 배지, 최근 기록.

   공개 API (전부 Promise):
     KBStore.use(kind)            'local' | 'supabase'
     KBStore.me()                 현재 프로필 | null
     KBStore.create({name, classCode})
     KBStore.switchTo(id)         기기 안 다른 아이로 (가족 공용 태블릿)
     KBStore.listLocal()          이 기기의 프로필들
     KBStore.save(profile)
     KBStore.record(result)       한 판 결과 → XP 적립 + 승급 판정 (제5조)
     KBStore.dailyDone(dateKey)   오늘 일일 도전 했나
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  if (root.KBStore) return;

  var KEY_LIST = 'kb.profiles';
  var KEY_CUR = 'kb.current';
  var HISTORY_MAX = 20;

  function ls() {
    try { return root.localStorage || null; } catch (e) { return null; }
  }
  function readJSON(k, dflt) {
    var s = ls(); if (!s) return dflt;
    try { var v = s.getItem(k); return v ? JSON.parse(v) : dflt; } catch (e) { return dflt; }
  }
  function writeJSON(k, v) {
    var s = ls(); if (!s) return false;
    try { s.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function uid() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function todayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  // 프로필 기본형 — 필드가 곧 수집 목록(제8조). 여기 없는 건 안 모은다.
  function blank(name, classCode) {
    return {
      id: uid(),
      name: String(name || '').slice(0, 10),
      classCode: classCode || null,
      xp: 0,
      partner: { species: null, stage: 0, parts: [], name: null },  // 제6조 (5번에서 채움)
      badges: [],
      // stats = 배지 판정의 재료(제6조). 새로 모으는 게 아니라 판마다 이미 나오는 값의 합계다.
      stats: { played: 0, correct: 0, bestStreak: 0,
               hard: 0,      // ★3 정답 누적 → 🦄 뿔
               coop: 0,      // 협동 성공 누적 → 🌟 빛 오라
               days: 0,      // 케이배틀에 온 날 수 → ✨ 별가루 꼬리
               lastDay: null },
      daily: { date: null, score: 0 },
      linkCode: null,        // 학부모 연결 코드 (아이가 만들어 부모에게 준다 — 제1조 ②)
      history: []            // [{ date, kind, score, xp }] 최근 20판
    };
  }

  /* ---------------- local 어댑터 ---------------- */
  var local = {
    kind: 'local',
    all: function () { return Promise.resolve(readJSON(KEY_LIST, [])); },
    me: function () {
      var id = (ls() && ls().getItem(KEY_CUR)) || null;
      var list = readJSON(KEY_LIST, []);
      var found = null;
      list.forEach(function (p) { if (p.id === id) found = p; });
      return Promise.resolve(found);
    },
    put: function (profile) {
      var list = readJSON(KEY_LIST, []);
      var hit = false;
      list = list.map(function (p) { if (p.id === profile.id) { hit = true; return profile; } return p; });
      if (!hit) list.push(profile);
      writeJSON(KEY_LIST, list);
      return Promise.resolve(profile);
    },
    setCurrent: function (id) {
      var s = ls(); if (s) { try { s.setItem(KEY_CUR, id); } catch (e) {} }
      return Promise.resolve(id);
    }
  };

  /* ---------------- supabase 어댑터 ----------------
     테이블 = sql/schema.sql (준호가 한 번 실행). 비밀번호 없음 — 학급코드+표시명이 신원.
     ⚠️ 실물 검증 대기: 작업 환경에서 supabase.co 차단 → 코드 계약만 맞춰둠(케이플과 동일 사정). */
  var supa = {
    kind: 'supabase',
    db: function () {
      var f = root.getKeduDb;
      if (typeof f !== 'function') throw new Error('kedu_config.js (getKeduDb) 없음');
      return f();
    },
    all: function () { return local.all(); },   // 기기 목록은 그대로 로컬
    me: function () {
      return local.me().then(function (p) {
        if (!p || !p.classCode) return p;
        return supa.db().from('kb_profiles').select('*')
          .eq('class_code', p.classCode).eq('name', p.name).maybeSingle()
          .then(function (r) {
            if (r.error || !r.data) return p;             // 서버 실패 → 로컬본으로 계속 (제0조)
            var srv = fromRow(r.data);
            srv.id = p.id;
            return local.put(srv).then(function () { return srv; });
          })
          .catch(function () { return p; });
      });
    },
    put: function (profile) {
      return local.put(profile).then(function () {        // 로컬 우선 기록(망 죽어도 안 잃음)
        if (!profile.classCode) return profile;
        return supa.db().from('kb_profiles').upsert(toRow(profile), { onConflict: 'class_code,name' })
          .then(function () { return profile; })
          .catch(function () { return profile; });
      });
    },
    setCurrent: local.setCurrent
  };
  function toRow(p) {
    return { class_code: p.classCode, name: p.name, xp: p.xp,
             partner: p.partner, badges: p.badges, stats: p.stats };
  }
  function fromRow(r) {
    return { id: null, name: r.name, classCode: r.class_code, xp: r.xp || 0,
             partner: r.partner || { species: null, stage: 0, parts: [], name: null },
             badges: r.badges || [], stats: r.stats || { played: 0, correct: 0, bestStreak: 0 },
             daily: { date: null, score: 0 }, history: [] };
  }

  /* ---------------- 공개 계약 ---------------- */
  var adapter = local;
  var cache = null;

  function use(kind) {
    adapter = (kind === 'supabase') ? supa : local;
    cache = null;
    return adapter.kind;
  }

  function me() {
    if (cache) return Promise.resolve(cache);
    return adapter.me().then(function (p) { cache = p; return p; });
  }

  function create(opts) {
    var p = blank(opts && opts.name, opts && opts.classCode);
    return adapter.put(p)
      .then(function () { return adapter.setCurrent(p.id); })
      .then(function () { cache = p; return p; });
  }

  function switchTo(id) {
    return adapter.setCurrent(id).then(function () { cache = null; return me(); });
  }

  function save(p) {
    cache = p;
    return adapter.put(p);
  }

  // 한 판 결과 → XP 적립 + 승급 판정. 강등 없음(제5조 ①).
  // result = { kind:'daily'|'race'|'battle', correct, hardCorrect, bestStreak, score, coopCleared }
  function record(result) {
    result = result || {};
    return me().then(function (p) {
      if (!p) return null;
      var KBXP = root.KBXP;
      if (!KBXP) throw new Error('kb-xp.js 먼저 로드');
      var day = todayKey();
      var firstToday = !(p.history[0] && p.history[0].date === day);
      var g = KBXP.gain({
        correct: result.correct, hardCorrect: result.hardCorrect,
        bestStreak: result.bestStreak, coopCleared: result.coopCleared,
        firstToday: firstToday
      });
      var step = KBXP.add(p.xp, g.total);
      p.xp = step.after.xp;
      p.stats.played += 1;
      p.stats.correct += Math.max(0, result.correct | 0);
      p.stats.bestStreak = Math.max(p.stats.bestStreak | 0, result.bestStreak | 0);
      p.stats.hard = (p.stats.hard | 0) + Math.max(0, result.hardCorrect | 0);
      if (result.coopCleared) p.stats.coop = (p.stats.coop | 0) + 1;
      if (p.stats.lastDay !== day) {                  // 오늘 처음 왔다 → 온 날 +1
        p.stats.days = (p.stats.days | 0) + 1;
        p.stats.lastDay = day;
      }
      if (result.kind === 'daily') p.daily = { date: day, score: result.score | 0 };
      p.history.unshift({ date: day, kind: result.kind || 'battle',
                          score: result.score | 0, xp: g.total });
      if (p.history.length > HISTORY_MAX) p.history.length = HISTORY_MAX;

      // 배지 판정 (제6조) — 새 데이터 없이 이미 쌓인 것으로만 본다.
      var got = [];
      var KBB = root.KBBadges;
      if (KBB) {
        var rows = (root.KBAnswers && root.KBAnswers.all()) || [];
        got = KBB.newly(p, rows);
        if (got.length) p.badges = KBB.evaluate(p, rows);
      }

      return save(p).then(function () {
        // rank.promoted → 풀스크린 승급 / newBadges → 배지 획득 연출
        return { profile: p, gain: g, rank: step, newBadges: got };
      });
    });
  }

  function dailyDone(dateKey) {
    return me().then(function (p) {
      return !!(p && p.daily && p.daily.date === (dateKey || todayKey()));
    });
  }

  root.KBStore = {
    use: use, me: me, create: create, switchTo: switchTo,
    listLocal: function () { return local.all(); },
    save: save, record: record, dailyDone: dailyDone,
    todayKey: todayKey,
    _blank: blank,
    get kind() { return adapter.kind; },
    _reset: function () { cache = null; }   // 테스트용
  };
})();
