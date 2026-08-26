/* ============================================================
   K-edu 게이트 (kedu_gate.js) — 판정기(/kedu_tier.js)의 집행자
   ------------------------------------------------------------
   2026-08-26 공개 준비 §J-2 (생태계설계_v2_공개준비 §B·§E)
   - 이 파일은 판정하지 않는다. 열쇠(누가)와 등급(무엇을)을 모아 KeduTier.can() 에 묻고,
     결과대로 통과시키거나 「보이되 잠김」 화면을 얹는다.
   - 페이지 삽입은 <script src="/kedu_gate.js"></script> 한 줄. 판정기·Supabase 가 없으면 스스로 싣는다.
   - 등급: <meta name="kedu-tier" content="open|class|class_rec|home"> 가 있으면 그것, 없으면 경로 표.
   - 학년: <meta name="kedu-lesson-id" content="g3_…"> → 경로(/grade3/ · /english/g3/).
   - 개방/배정 목록(§F class_openings)은 sessionStorage kedu_openings_v1 — §J-3 에서 채운다. 지금은 빈 목록.
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
  var OPEN_KEY  = 'kedu_openings_v1';     // §J-3 이 채울 개방 목록

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
  function openings() {
    try { var a = JSON.parse(sessionStorage.getItem(OPEN_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function isOpened(lessonId, p) {
    var list = openings();
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
        .then(function (t) { writeCache(t); return t; })
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
        var r = KT.can(t, tier, grade, { opened: isOpened(lessonId, path) });
        publish(r, tier, grade);
        if (!r.allow) lock(r, tier, grade, t);
      });
    }).catch(function () { /* 판정기를 못 실으면 열어 둔다 — 잠금 실패로 수업을 막지 않는다 */ });
  }

  function publish(r, tier, grade) {
    window.KeduGate = { result: r, contentTier: tier, contentGrade: grade, lessonId: lessonId, recheck: run };
    try { document.dispatchEvent(new CustomEvent('kedu-gate', { detail: window.KeduGate })); } catch (e) {}
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
  function goBack() { if (history.length > 1) history.back(); else location.href = '/'; }

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
        body: (rec ? '이 활동은 우리 반 기록이 남는 활동이에요. ' : '') + '선생님께 「우리 반에 열어 주세요」라고 말해 보세요.',
        buttons: [{ label: '돌아가기', pri: true, go: goBack }] };
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
