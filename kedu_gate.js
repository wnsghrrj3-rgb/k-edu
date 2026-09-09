/* ==== KEDU_SCOPE BEGIN (자동 삽입 — 원본은 /kedu_scope.js, 바꾸면 여기도 같이) ==== */
/* ============================================================
   K-edu 저장소 계정 분리 (kedu_scope.js) — 2026-09-09
   ------------------------------------------------------------
   준호 보고(케이무비): "같은 컴퓨터 다른 아이디로 들어갔는데 다른 아이디에서 작업한 게 뜬다."
   원인은 브라우저 저장소(localStorage·sessionStorage)가 계정과 무관하게 하나라는 것 —
   차시 진행(kedu_progress_*)·아침활동 완료·케이파크 기록·뮤지엄 티켓·학년/학기 선택 등
   케이에듀 전 영역이 같은 구조였다. 페이지마다 고치는 대신 **저장소 자체를 계정별로 가른다**.

   - 이 파일은 페이지의 다른 스크립트보다 먼저(동기) 실행돼야 한다. /kedu_gate.js 와
     /kedu_teacher_gate.js 맨 위에 같은 코드가 들어 있고(그 둘이 안 실린 페이지만 이 파일을 직접 싣는다),
     한 페이지에 두 번 실려도 한 번만 건다(window.__keduScope).
   - 주인(owner) 판정은 **동기** — 네트워크 없이 이 기기의 흔적만 본다:
       · Supabase 세션(localStorage sb-*-auth-token 의 JWT) → 'u:<auth uid>'
         (학생 좌석도 익명 인증 uid 가 학생마다 다르므로(fresh_session) 같은 규칙으로 갈라진다)
       · 게스트(kedu_guest_v1) → 'g:<학급코드>'
       · 없음 → 옛 키 그대로(anon — 방문자끼리는 못 가른다, 종전과 같음)
   - 주인이 있으면 키 앞에 '@<owner>|' 를 붙여 읽고 쓴다. 인증·기억하기 등 **기기 것**은 그대로(PASS).
   - 옛(주인 없는) 값은 **정식 계정(교사 등, 익명 아님)의 첫 접속** 때 그 계정 것으로 옮긴다 —
     케이무비 52 와 같은 정책. 익명(학생) 세션은 옮기지 않는다(교실 공용 PC 의 옛 값은 누구 것인지 알 수 없다).
   - localStorage.key(i) 는 자기 것만 접두사를 떼어 돌려주고 남의 것은 빈 문자열('') —
     'kedu_progress_' 로 시작하는 키를 훑는 코드(kedu_lesson_bridge)가 그대로 돈다.
   - **동의 없으면 기기 안에도 남기지 않는다(준호 결정 2026-09-09)** — 정식 세션(계정·동의 좌석의 익명 uid)이
     없는 게스트(동의 전, 학급코드만)·방문자는 작업 자료·기록을 localStorage·sessionStorage 에 쓰지 못한다:
     쓰기는 페이지가 살아 있는 동안만 메모리에 두고(화면 안에서 쓰고 읽는 코드는 그대로 돈다), 새로고침·다음 접속엔 없다.
     읽기도 메모리만 — 옛 기기 값(주인 없는 키)은 안 보인다. 화면 설정(학년·학기·홈 표시·소리 끔·안내 봤음)만 예외(PREF).
     서버 저장은 종전대로 KeduTier.canSave()(정식 좌석만) — 여기는 그 규칙의 기기 쪽 짝이다.
   - 케이무비(kmv.*)는 자체 IndexedDB 주인 분리를 쓰므로 여기서 손대지 않는다. 개방 목록 캐시(kedu_openings_v1)는 학급코드로 스스로 검사하므로 그대로.
   ============================================================ */
(function (g) {
  'use strict';
  if (g.__keduScope) return;
  var S = g.Storage && g.Storage.prototype;
  if (!S || !g.localStorage) { g.__keduScope = { owner: null, off: true }; return; }

  var PASS = [/^sb-/, /^kedu_guest_v1$/, /^kedu_remember$/, /^kedu_admin_remember$/, /^kedu_admin_session$/, /^kedu_session$/, /^kedu_openings_v1$/, /^kmv\./, /^kedu_scope/, /^supabase\./];
  function pass(k) { for (var i = 0; i < PASS.length; i++) if (PASS[i].test(k)) return true; return false; }

  var rawGet = S.getItem, rawSet = S.setItem, rawRemove = S.removeItem, rawKey = S.key;
  function jwtPayload(tok) {
    try { var b = tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(decodeURIComponent(escape(atob(b + '==='.slice((b.length + 3) % 4))))); } catch (e) { return null; }
  }
  /* 주인 판정 — 페이지가 열릴 때 한 번. {id, anonymous} */
  function detect() {
    try {
      for (var i = 0; i < g.localStorage.length; i++) {
        var k = rawKey.call(g.localStorage, i);
        if (!k || k.indexOf('sb-') !== 0 || k.indexOf('-auth-token') < 0) continue;
        var raw = rawGet.call(g.localStorage, k); if (!raw) continue;
        var j = JSON.parse(raw); var tok = j && (j.access_token || (j.currentSession && j.currentSession.access_token));
        var p = tok ? jwtPayload(tok) : null; var sub = (p && p.sub) || (j && j.user && j.user.id);
        if (sub) return { id: 'u:' + sub, anonymous: !!(p && p.is_anonymous) || !!(j && j.user && j.user.is_anonymous) };
      }
    } catch (e) {}
    try { var gr = rawGet.call(g.localStorage, 'kedu_guest_v1'); var gj = gr && JSON.parse(gr); if (gj && gj.code) return { id: 'g:' + String(gj.code).toUpperCase(), anonymous: true }; } catch (e) {}
    return null;
  }
  var own = detect();
  var persist = !!(own && own.id.indexOf('u:') === 0);      // 정식 세션(계정·동의 좌석)만 기기에 남긴다
  var PREF = [/^kedu_(grade|semester|home)$/, /^klab_muted$/, /\.howto$/];
  function pref(k) { for (var i = 0; i < PREF.length; i++) if (PREF[i].test(k)) return true; return false; }
  var prefix = own ? '@' + own.id + '|' : '';
  var map = function (k) { k = String(k); return (prefix && !pass(k)) ? prefix + k : k; };

  if (!persist) {
    /* 게스트·방문자 — 작업 자료·기록은 메모리에만(이 페이지 동안), 기기엔 안 남긴다. 화면 설정(PREF)은 기기에(게스트면 학급코드별) */
    var mem = { local: {}, session: {} };
    var bag = function (st) { return st === g.sessionStorage ? mem.session : mem.local; };
    var keep = function (k) { return pass(k) || pref(k); };
    S.getItem = function (k) { k = String(k); if (keep(k)) return rawGet.call(this, map(k)); var b = bag(this); return Object.prototype.hasOwnProperty.call(b, k) ? b[k] : null; };
    S.setItem = function (k, v) { k = String(k); if (keep(k)) return rawSet.call(this, map(k), v); bag(this)[k] = String(v); };
    S.removeItem = function (k) { k = String(k); if (keep(k)) return rawRemove.call(this, map(k)); delete bag(this)[k]; };
    S.key = function (i) {
      var k = rawKey.call(this, i); if (k == null) return k;
      if (pass(k)) return k;
      if (prefix && k.indexOf(prefix) === 0) { var r = k.slice(prefix.length); return pref(r) ? r : ''; }
      return (!prefix && pref(k)) ? k : '';               // 옛 기기 값·남의 것은 안 보이게
    };
  } else {
    S.getItem = function (k) { return rawGet.call(this, map(k)); };
    S.setItem = function (k, v) { return rawSet.call(this, map(k), v); };
    S.removeItem = function (k) { return rawRemove.call(this, map(k)); };
    S.key = function (i) {
      var k = rawKey.call(this, i); if (k == null) return k;
      if (pass(k)) return k;
      if (k.indexOf(prefix) === 0) return k.slice(prefix.length);
      return '';                                   // 남의 것(다른 주인·옛 값) — 훑는 코드에 안 보이게
    };
    /* 옛 값 인계 — 정식 계정의 첫 접속 때 한 번(플래그는 localStorage 에 주인별) */
    if (!own.anonymous) {
      try {
        var flag = 'kedu_scope_m|' + own.id;
        if (!rawGet.call(g.localStorage, flag)) {
          var moved = 0, ks = [];
          for (var i = 0; i < g.localStorage.length; i++) { var k = rawKey.call(g.localStorage, i); if (k && k.charAt(0) !== '@' && !pass(k)) ks.push(k); }
          for (var j = 0; j < ks.length; j++) {
            var v = rawGet.call(g.localStorage, ks[j]);
            if (v == null) continue;
            if (rawGet.call(g.localStorage, prefix + ks[j]) == null) { try { rawSet.call(g.localStorage, prefix + ks[j], v); moved++; } catch (e) { continue; } }
            try { rawRemove.call(g.localStorage, ks[j]); } catch (e) {}
          }
          rawSet.call(g.localStorage, flag, String(Date.now()));
          if (moved) try { console.info('[kedu_scope] 옛 저장값 ' + moved + '개를 이 계정으로 옮김'); } catch (e) {}
        }
      } catch (e) {}
    }
  }
  g.__keduScope = { owner: own ? own.id : null, anonymous: own ? own.anonymous : null, persist: persist, prefix: prefix, off: false, pass: pass, map: map, raw: { get: rawGet, set: rawSet, remove: rawRemove, key: rawKey } };
})(typeof window !== 'undefined' ? window : globalThis);
/* ==== KEDU_SCOPE END ==== */
/* ============================================================
   K-edu 게이트 (kedu_gate.js) — 판정기(/kedu_tier.js)의 집행자
   ------------------------------------------------------------
   2026-08-26 공개 준비 §J-2 (생태계설계_v2_공개준비 §B·§E)
   - 이 파일은 판정하지 않는다. 열쇠(누가)와 등급(무엇을)을 모아 KeduTier.can() 에 묻고,
     결과대로 통과시키거나 「보이되 잠김」 화면을 얹는다.
   - 페이지 삽입은 <script src="/kedu_gate.js"></script> 한 줄. 판정기·Supabase 가 없으면 스스로 싣는다.
   - 등급: <meta name="kedu-tier" content="open|class|class_rec|home"> 가 있으면 그것, 없으면 경로 표.
   - 학년: <meta name="kedu-lesson-id" content="g3_…"> → 경로(/grade3/ · /english/g3/).
   - 개방 목록(§F class_openings): 학급 세션이면 list_class_openings(학급코드) RPC 로 받아 sessionStorage
     kedu_openings_v1 에 60초 캐시 {code, keys, at}. 잠금 카드의 「다시 확인」이 캐시를 비우고 다시 묻는다.
   - 서버 강제(미들웨어)는 2단계. 여기는 브라우저 판정이다.

   [구 임시 잠금] 아래 KEDU_TEMP_LOCK 은 2026-08-08 해제 상태 그대로 둔다. true 로 바꾸면 종전 아이디/비번 가림막.
   ============================================================ */
(function () {
  'use strict';

  // ── 구 임시 잠금 (해제 상태) ─────────────────────────────
  var KEDU_TEMP_LOCK = false;
  var GATE_ID = '11';
  var GATE_PW = '11';
  // ────────────────────────────────────────────────────────

  var CACHE_KEY = 'kedu_gate_t_v1';       // 열쇠 판별 결과 캐시 (sessionStorage, 5분)
  var CACHE_MS  = 5 * 60 * 1000;
  var OPEN_KEY  = 'kedu_openings_v1';     // 개방 목록 캐시 {code, keys, at} (§J-3)
  var OPEN_MS   = 60 * 1000;

  var path = (location.pathname || '/').toLowerCase();

  // 항상 문 없는 경로 (약관·개인정보·입구·교사 도구)
  var FREE = ['/terms', '/privacy', '/auth', '/teacher', '/admin', '/parent', '/kedu/teacher', '/kedu/activities', '/kedu/components', '/archive', '/redesign', '/docs', '/design'];
  for (var i = 0; i < FREE.length; i++) if (path.indexOf(FREE[i]) === 0) { if (!KEDU_TEMP_LOCK) return; }

  function q(sel) { return document.querySelector(sel); }
  function metaContent(name) { var m = q('meta[name="' + name + '"]'); return m ? (m.getAttribute('content') || '') : ''; }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.async = false;
      s.onload = res; s.onerror = function () { rej(new Error('load fail ' + src)); };
      (document.head || document.documentElement).appendChild(s);
    });
  }
  function ensureTier() { return window.KeduTier ? Promise.resolve() : loadScript('/kedu_tier.js'); }
  function ensureDb() {
    var p = Promise.resolve();
    if (!window.supabase) p = p.then(function () { return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'); });
    if (typeof window.getKeduDb !== 'function') p = p.then(function () { return loadScript('/kedu_config.js'); });
    return p.then(function () { return window.getKeduDb(); });
  }
  function hasSbSession() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('sb-') === 0 && k.indexOf('-auth-token') > 0) return true;
      }
    } catch (e) {}
    return false;
  }
  function readCache() {
    try {
      var c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (c && c.t && (Date.now() - c.at) < CACHE_MS) return c.t;
    } catch (e) {}
    return null;
  }
  function writeCache(t) { try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: t, at: Date.now() })); } catch (e) {} }
  // ── 개방 목록 (§J-3) ─────────────────────────────────────
  function classCodeOf(t) {
    if (!t) return null;
    if (t.tier === 'guest' && t.guest) return t.guest.code || null;
    if (t.tier === 'student' && t.profile) return t.profile.class_code || null;
    return null;
  }
  function readOpenings(code) {
    try {
      var c = JSON.parse(sessionStorage.getItem(OPEN_KEY) || 'null');
      if (Array.isArray(c)) return c;                                    // 옛 꼴(배열) 호환
      if (c && c.code === code && Array.isArray(c.keys) && (Date.now() - c.at) < OPEN_MS) return c.keys;
    } catch (e) {}
    return null;
  }
  function writeOpenings(code, keys) { try { sessionStorage.setItem(OPEN_KEY, JSON.stringify({ code: code, keys: keys, at: Date.now() })); } catch (e) {} }
  function fetchOpenings(code) {
    if (!code) return Promise.resolve([]);
    var cached = readOpenings(code);
    if (cached) return Promise.resolve(cached);
    return ensureDb().then(function (db) { return db.rpc('list_class_openings', { p_class_code: code }); })
      .then(function (r) {
        var keys = (r && !r.error && Array.isArray(r.data)) ? r.data.map(function (x) { return x && x.content_key; }).filter(Boolean) : [];
        if (r && !r.error) writeOpenings(code, keys);   // 실패는 캐시하지 않는다(다음 페이지에서 다시 묻는다)
        return keys;
      })
      .catch(function () { return []; });
  }
  function isOpened(lessonId, p, list) {
    list = list || [];
    for (var i = 0; i < list.length; i++) {
      var o = String(list[i] || '').toLowerCase();
      if (!o) continue;
      if (lessonId && lessonId.toLowerCase() === o) return true;
      if (o.charAt(0) === '/' && p.indexOf(o) === 0) return true;
    }
    return false;
  }

  // ── 열쇠 판별: 세션 흔적이 없으면 RPC 없이 동기(방문자·게스트) ───
  function resolveKey() {
    var cached = readCache();
    if (cached) return Promise.resolve(cached);
    return ensureTier().then(function () {
      if (!hasSbSession()) {
        var g = window.KeduTier.guest();
        return g ? { tier: 'guest', guest: g } : { tier: 'visitor' };
      }
      return ensureDb().then(function (db) { return window.KeduTier.resolve(db); })
        .then(function (t) {
          // 좌석·교사 판별만 캐시. 방문자/빈 계정 결과를 캐시하면 로그인 직후 5분 동안 잠긴다.
          if (t && (t.tier === 'student' || t.teacher)) writeCache(t);
          return t;
        })
        .catch(function () { return { tier: 'visitor' }; });
    });
  }

  // ── 집행 ─────────────────────────────────────────────────
  var lessonId = metaContent('kedu-lesson-id');
  var metaTier = metaContent('kedu-tier');

  function run() {
    ensureTier().then(function () {
      var KT = window.KeduTier;
      var tier = metaTier || KT.tierOfPath(path);
      var grade = KT.gradeOf(lessonId, path);
      if (!tier) { publish({ allow: true, reason: 'free' }, null, null); return; }
      // 방문자 + open 은 판별조차 필요 없다(가장 흔한 경로 — 서버 호출 0)
      if (tier === 'open' && !hasSbSession() && !KT.guest()) { publish({ allow: true, reason: 'open', key: 'L1' }, tier, grade); return; }
      resolveKey().then(function (t) {
        var code = classCodeOf(t);
        // 개방 목록은 학급 세션이 class·class_rec 을 열 때(또는 굳은 학년 잠금 아래 open 을 열 때)만 묻는다
        var need = !!code && (tier !== 'open' || !!KT.GRADE_LOCK);
        return (need ? fetchOpenings(code) : Promise.resolve([])).then(function (keys) {
          var r = KT.can(t, tier, grade, { opened: isOpened(lessonId, path, keys) });
          publish(r, tier, grade);
          if (!r.allow) lock(r, tier, grade, t);
        });
      });
    }).catch(function () { /* 판정기를 못 실으면 열어 둔다 — 잠금 실패로 수업을 막지 않는다 */ });
  }

  function publish(r, tier, grade) {
    window.KeduGate = { result: r, contentTier: tier, contentGrade: grade, lessonId: lessonId, recheck: recheck,
      clearCache: clearCaches };
    try { document.dispatchEvent(new CustomEvent('kedu-gate', { detail: window.KeduGate })); } catch (e) {}
  }

  function clearCaches() { try { sessionStorage.removeItem(CACHE_KEY); sessionStorage.removeItem(OPEN_KEY); } catch (e) {} }
  function recheck() {
    clearCaches();
    var ov = document.getElementById('kedu-lock'), st = document.getElementById('kedu-lock-style');
    if (ov) ov.remove(); if (st) st.remove();
    try { document.documentElement.style.overflow = ''; } catch (e) {}
    run();
  }

  // ── 「보이되 잠김」 화면 ───────────────────────────────────
  function lock(r, tier, grade, t) {
    if (document.getElementById('kedu-lock')) return;
    var copy = lockCopy(r, tier, grade, t);
    var css =
      '#kedu-lock{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(255,247,237,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
      'font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}' +
      '#kedu-lock-card{width:min(380px,88vw);background:#fff;border-radius:24px;padding:34px 28px 26px;text-align:center;' +
      'box-shadow:0 20px 60px rgba(214,120,90,.2)}' +
      '#kedu-lock-card .ic{font-size:44px;line-height:1;margin-bottom:10px}' +
      '#kedu-lock-card h1{margin:0 0 8px;font-size:21px;color:#E07856;font-weight:800;letter-spacing:-.4px}' +
      '#kedu-lock-card p{margin:0 0 20px;font-size:14.5px;color:#6b5f59;line-height:1.65;word-break:keep-all}' +
      '#kedu-lock-card .btns{display:flex;flex-direction:column;gap:8px}' +
      '#kedu-lock-card button{padding:13px 16px;border-radius:14px;border:2px solid #F2E0D7;background:#fff;font-size:15px;font-weight:700;color:#8a5a45;cursor:pointer}' +
      '#kedu-lock-card button.pri{background:#E07856;border-color:#E07856;color:#fff}' +
      '#kedu-lock-card button:active{transform:scale(.98)}';
    var style = document.createElement('style'); style.id = 'kedu-lock-style'; style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
    var ov = document.createElement('div'); ov.id = 'kedu-lock';
    ov.innerHTML = '<div id="kedu-lock-card"><div class="ic">' + copy.icon + '</div><h1>' + copy.title + '</h1><p>' + copy.body + '</p><div class="btns"></div></div>';
    var btns = ov.querySelector('.btns');
    copy.buttons.forEach(function (b) {
      var el = document.createElement('button'); el.textContent = b.label; if (b.pri) el.className = 'pri';
      el.addEventListener('click', b.go); btns.appendChild(el);
    });
    (document.body || document.documentElement).appendChild(ov);
    try { document.documentElement.style.overflow = 'hidden'; } catch (e) {}
  }

  function goHome() { location.href = '/'; }
  /* 잠금 카드의 「돌아가기」 — 직접 URL 진입이면 브라우저 뒤로가 없다.
     그때는 공용 돌아가기(kedu_back v2)가 계산한 구조상 허브로 보낸다(2026-08-27 동선 점검). */
  function goBack() {
    if (window.KEDU_BACK && window.KEDU_BACK.go) { window.KEDU_BACK.go(); return; }
    if (history.length > 1) history.back(); else location.href = '/';
  }

  function lockCopy(r, tier, grade, t) {
    var rec = tier === 'class_rec';
    if (r.reason === 'grade') {
      return { icon: '🚪', title: (grade ? grade + '학년' : '다른 학년') + ' 방이에요',
        body: '우리 반은 ' + r.myGrade + '학년이에요. 우리 반 방으로 돌아가서 공부해요.',
        buttons: [{ label: '우리 반 방으로', pri: true, go: goHome }] };
    }
    if (r.reason === 'consent') {
      return { icon: '📝', title: '동의 후 사용할 수 있어요',
        body: '이 활동은 기록이 남아요. 선생님이 학부모 동의를 확인한 뒤에 열려요.',
        buttons: [{ label: '돌아가기', pri: true, go: goBack }] };
    }
    if (r.reason === 'home') {
      return { icon: '🏠', title: '학부모 전용 준비 중',
        body: '이 공간은 아직 열리지 않았어요.',
        buttons: [{ label: '돌아가기', pri: true, go: goBack }] };
    }
    if (r.key === 'account') {
      return { icon: '🔑', title: '선생님 계정 확인이 필요해요',
        body: '교사 확인이 끝나면 바로 열려요. 선생님 공간에서 확인을 신청해 주세요.',
        buttons: [{ label: '선생님 공간으로', pri: true, go: function () { location.href = '/teacher/'; } }, { label: '돌아가기', go: goBack }] };
    }
    if (r.key === 'L2g' || r.key === 'L2a') {
      return { icon: '🔒', title: '선생님이 열어주면 할 수 있어요',
        body: (rec ? '이 활동은 우리 반 기록이 남는 활동이에요. ' : '') + '선생님께 「우리 반에 열어 주세요」라고 말해 보세요. 열어 주셨으면 「다시 확인」을 눌러요.',
        buttons: [{ label: '다시 확인', pri: true, go: recheck }, { label: '돌아가기', go: goBack }] };
    }
    return { icon: '🔒', title: '선생님이 열어주면 할 수 있어요',
      body: '학급 코드로 들어오면 선생님이 열어 준 활동을 할 수 있어요. 자기주도 학습은 코드 없이도 자유예요.',
      buttons: [{ label: '학급 코드로 들어가기', pri: true, go: goHome }, { label: '둘러보기로 돌아가기', go: goBack }] };
  }

  // ── 구 임시 잠금 (원형 유지) ──────────────────────────────
  function buildTempGate() {
    if (document.getElementById('kedu-gate-overlay')) return;
    var css =
      '#kedu-gate-overlay{position:fixed;inset:0;z-index:2147483647;' +
      'background:linear-gradient(160deg,#FFF7ED 0%,#FFE9DF 55%,#FFE0D2 100%);' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;}' +
      '#kedu-gate-card{width:min(360px,86vw);background:#fff;border-radius:24px;' +
      'padding:40px 30px;box-shadow:0 20px 60px rgba(214,120,90,.18);text-align:center;}' +
      '#kedu-gate-card h1{margin:0 0 8px;font-size:22px;color:#E07856;font-weight:800;letter-spacing:-.5px;}' +
      '#kedu-gate-card p{margin:0 0 24px;font-size:14px;color:#8a7d76;line-height:1.6;}' +
      '#kedu-gate-card input{width:100%;box-sizing:border-box;padding:14px 16px;margin:6px 0;' +
      'border:2px solid #F2E0D7;border-radius:14px;font-size:16px;outline:none;transition:border-color .15s;}' +
      '#kedu-gate-card input:focus{border-color:#E07856;}' +
      '#kedu-gate-btn{width:100%;margin-top:14px;padding:14px;border:none;border-radius:14px;cursor:pointer;' +
      'background:#E07856;color:#fff;font-size:16px;font-weight:700;transition:transform .08s,background .15s;}' +
      '#kedu-gate-btn:hover{background:#d56a47;}#kedu-gate-btn:active{transform:scale(.98);}' +
      '#kedu-gate-msg{min-height:18px;margin-top:12px;font-size:13px;color:#e0506b;font-weight:600;}' +
      '@keyframes kedu-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}' +
      '.kedu-shake{animation:kedu-shake .35s;}';
    var style = document.createElement('style'); style.id = 'kedu-gate-style'; style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
    var overlay = document.createElement('div'); overlay.id = 'kedu-gate-overlay';
    overlay.innerHTML =
      '<div id="kedu-gate-card"><h1>케이에듀</h1><p>잠시 점검 중이에요.<br>아이디와 비밀번호를 입력해 주세요.</p>' +
      '<input id="kedu-gate-id" type="text" placeholder="아이디" autocomplete="off" autocapitalize="off" />' +
      '<input id="kedu-gate-pw" type="password" placeholder="비밀번호" autocomplete="off" />' +
      '<button id="kedu-gate-btn" type="button">들어가기</button><div id="kedu-gate-msg"></div></div>';
    (document.body || document.documentElement).appendChild(overlay);
    var idEl = overlay.querySelector('#kedu-gate-id'), pwEl = overlay.querySelector('#kedu-gate-pw');
    var btn = overlay.querySelector('#kedu-gate-btn'), msg = overlay.querySelector('#kedu-gate-msg'), card = overlay.querySelector('#kedu-gate-card');
    function tryEnter() {
      if (idEl.value === GATE_ID && pwEl.value === GATE_PW) {
        try { sessionStorage.setItem('kedu_gate_ok', '1'); } catch (e) {}
        overlay.remove(); if (style && style.remove) style.remove();
      } else {
        msg.textContent = '아이디 또는 비밀번호가 맞지 않아요.';
        card.classList.remove('kedu-shake'); void card.offsetWidth; card.classList.add('kedu-shake');
        pwEl.value = ''; pwEl.focus();
      }
    }
    btn.addEventListener('click', tryEnter);
    overlay.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); tryEnter(); } });
    setTimeout(function () { idEl.focus(); }, 50);
  }

  function start() {
    if (KEDU_TEMP_LOCK) {
      var tw = ['/terms', '/privacy', '/auth'], skip = false;
      for (var i = 0; i < tw.length; i++) if (path.indexOf(tw[i]) === 0) skip = true;
      try { if (sessionStorage.getItem('kedu_gate_ok') === '1') skip = true; } catch (e) {}
      if (!skip) buildTempGate();
    }
    run();
  }

  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();


/* ── 케이라이브 동승 로더 (b안, 2026-08-27) ─────────────────────────────
   학생 콘텐츠 경로에서만 /kedu_live_ride.js 를 싣는다. 문 없는 경로(교사·관리·
   입구·라이브 자신)는 제외. 게이트 판정과 독립 — 실패해도 페이지에 영향 없음. */
(function () {
  try {
    if (typeof document === 'undefined' || typeof location === 'undefined') return;
    var p = (location.pathname || '/').toLowerCase();
    var skip = ['/terms', '/privacy', '/auth', '/teacher', '/admin', '/parent', '/live',
                '/classwork', '/kedu/teacher', '/kedu/hub', '/kple/host.html', '/kbattle/host.html',
                '/archive', '/redesign', '/docs', '/design'];
    for (var i = 0; i < skip.length; i++) if (p.indexOf(skip[i]) === 0) return;
    if (document.getElementById('kedu-ride-js')) return;
    var s = document.createElement('script');
    s.id = 'kedu-ride-js'; s.src = '/kedu_live_ride.js'; s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();
