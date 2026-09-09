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
