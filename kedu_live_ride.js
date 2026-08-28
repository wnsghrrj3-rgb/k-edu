/* ============================================================================
   K-edu 케이라이브 동승 (kedu_live_ride.js) — 학생 쪽 자동 방송기 (b안, 2026-08-27)
   ----------------------------------------------------------------------------
   준호 요구: 학생이 라이브 코드를 따로 입력하지 않는다. 담임이 라이브를 켜면,
   케이에듀를 쓰고 있는 우리 반 학생 화면이 자동으로 교사 모니터에 잡힌다.

   동작:
     1) 신원 — 좌석 학생(my_seat_class: 닉네임+학급코드) 또는 게스트(KeduTier.guest:
        학급코드만, 이름은 "손님-xx"). 방문자·교사·학부모 계정은 아무것도 안 한다.
     2) 개방 신호 — class_openings 에 'feature:klive' 가 열려 있을 때만 채널 구독.
        (교사 모니터가 시작/종료 때 open/close. 평소엔 웹소켓 0 — 동시 접속 한도 보호)
     3) 방송 — 교사 ping 하트비트가 살아 있는 동안만 상태(페이지 이름·경로)와
        캔버스 썸네일을 보낸다. 그동안 학생 화면 우상단에 「🔴 라이브」 표시.
        ping 이 30초 끊기거나 end 를 받으면 즉시 침묵 + 표시 제거.
   개인정보: 보내는 것은 닉네임(또는 손님-xx)·페이지 이름·경로·캔버스 그림뿐.
             텍스트 입력값·키 입력은 어떤 경우에도 수집하지 않는다.
   로더: kedu_gate.js 말미가 학생 콘텐츠 경로에서만 이 파일을 싣는다.
   테스트: tests/test_live_ride.js (jsdom) — window.KeduRide 디버그 표면 사용.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__KEDU_RIDE__) return;
  window.__KEDU_RIDE__ = 1;

  var SS_SID = 'kedu_ride_sid_v1';   // 탭 수명 — 타일 안정성
  var SS_ME  = 'kedu_ride_me_v1';    // {code, name, at} 10분 캐시 (좌석 RPC 절약)
  var ME_MS  = 10 * 60 * 1000;
  var OPEN_KEY = 'kedu_openings_v1'; // 게이트와 공유하는 개방 목록 캐시 {code, keys, at}
  var LIVE_KEY = 'feature:klive';
  var PING_ALIVE_MS = 30000;         // 교사 ping 이 이 안에 안 오면 라이브 꺼진 것으로
  var RECHECK_MS = 90000;            // 미개방 시 개방 목록 재확인 주기

  var C = null;                      // KLiveCore
  var db = null;
  var me = null;                     // {code, name}
  var sid = null;
  var sender = null;
  var chSend = null;
  var liveUntil = 0;
  var saidHello = false;
  var spotOnMe = false;

  /* ── 유틸 ─────────────────────────────────────────────────────────── */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.async = false;
      s.onload = res; s.onerror = function () { rej(new Error('load ' + src)); };
      (document.head || document.documentElement).appendChild(s);
    });
  }
  function ensureCore() { return window.KLiveCore ? Promise.resolve() : loadScript('/live/klive-core.js'); }
  function ensureTier() { return window.KeduTier ? Promise.resolve() : loadScript('/kedu_tier.js'); }
  function ensureDb() {
    var p = Promise.resolve();
    if (!window.supabase) p = p.then(function () { return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'); });
    if (typeof window.getKeduDb !== 'function') p = p.then(function () { return loadScript('/kedu_config.js'); });
    return p.then(function () { db = window.getKeduDb(); return db; });
  }
  function ss(get, key, val) {
    try {
      if (get) return JSON.parse(sessionStorage.getItem(key) || 'null');
      sessionStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function pageName() {
    var t = (document.title || '').replace(/\s*[|·\-–]\s*(케이에듀|K-edu).*$/i, '').trim();
    return t || decodeURIComponent((location.pathname.split('/').filter(Boolean).pop() || '홈').replace(/\.html?$/, ''));
  }

  /* ── 신원 ─────────────────────────────────────────────────────────── */
  function mySid() {
    if (sid) return sid;
    var c = ss(true, SS_SID);
    if (c && typeof c === 'string') { sid = c; return sid; }
    sid = (window.KLiveCore ? window.KLiveCore.makeSid() : 's' + Math.random().toString(36).slice(2, 10));
    ss(false, SS_SID, sid);
    return sid;
  }
  function identify() {
    var cached = ss(true, SS_ME);
    if (cached && cached.code && cached.name && Date.now() - cached.at < ME_MS) return Promise.resolve(cached);
    return ensureTier().then(function () {
      var g = window.KeduTier.guest();
      if (g && g.code) {
        var m = { code: String(g.code).toUpperCase(), name: '손님-' + mySid().slice(-2).toUpperCase(), at: Date.now() };
        ss(false, SS_ME, m); return m;
      }
      // 좌석 학생인지 — 세션이 있어야만 의미. 없으면 방문자 = 동승 없음.
      return ensureDb().then(function () {
        return window.KeduTier.resolve(db).then(function (t) {
          if (t && t.tier === 'student' && t.profile && t.profile.class_code) {
            var m2 = { code: String(t.profile.class_code).toUpperCase(),
                       name: t.profile.nickname || '학생', at: Date.now() };
            ss(false, SS_ME, m2); return m2;
          }
          return null; // visitor / teacher / parent — 동승 대상 아님
        });
      });
    }).catch(function () { return null; });
  }

  /* ── 개방 신호 — 'feature:klive' 가 열려 있나 ─────────────────────── */
  function liveOpened(code) {
    var c = ss(true, OPEN_KEY);
    if (c && c.code === code && Date.now() - c.at < 60000) {
      return Promise.resolve((c.keys || []).indexOf(LIVE_KEY) >= 0);
    }
    return ensureDb().then(function () {
      return db.rpc('list_class_openings', { p_class_code: code }).then(function (r) {
        if (r.error) return false;
        var keys = (r.data || []).map(function (row) { return row.content_key; });
        ss(false, OPEN_KEY, { code: code, keys: keys, at: Date.now() });
        return keys.indexOf(LIVE_KEY) >= 0;
      });
    }).catch(function () { return false; });
  }

  /* ── 배지 ─────────────────────────────────────────────────────────── */
  function badge(on) {
    var el = document.getElementById('kedu-ride-badge');
    if (on) {
      if (!el) {
        el = document.createElement('div');
        el.id = 'kedu-ride-badge';
        el.setAttribute('style',
          'position:fixed;top:10px;right:10px;z-index:2147482000;display:flex;align-items:center;gap:6px;' +
          'background:rgba(20,24,34,.88);color:#fff;font:700 12px/1 Pretendard,-apple-system,sans-serif;' +
          'padding:7px 12px;border-radius:999px;box-shadow:0 3px 12px rgba(0,0,0,.3);pointer-events:auto;cursor:default;');
        el.title = '선생님이 우리 반 화면을 보고 있어요';
        el.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#ff5a5a;' +
          'box-shadow:0 0 6px #ff5a5a;display:inline-block"></span><span>라이브</span>';
        (document.body || document.documentElement).appendChild(el);
      }
      el.style.display = 'flex';
      if (spotOnMe) el.lastChild.textContent = '선생님이 내 화면을 보는 중';
      else el.lastChild.textContent = '라이브';
    } else if (el) {
      el.style.display = 'none';
    }
  }

  /* ── 썸네일 — 가장 큰 캔버스 한 장 (없으면 null → 이름 카드 폴백) ── */
  function grabThumb(w, q) {
    try {
      var best = null, area = 0, list = document.getElementsByTagName('canvas');
      for (var i = 0; i < list.length; i++) {
        var cv = list[i];
        if (cv.width >= 100 && cv.height >= 80 && cv.width * cv.height > area) { best = cv; area = cv.width * cv.height; }
      }
      if (!best) return null;
      var h = Math.round(best.height * (w / best.width));
      var off = document.createElement('canvas'); off.width = w; off.height = h;
      off.getContext('2d').drawImage(best, 0, 0, w, h);
      return off.toDataURL('image/jpeg', q);
    } catch (e) { return null; } // tainted 등 — 이름 카드 폴백
  }

  /* ── 방송 ─────────────────────────────────────────────────────────── */
  function sendState(force) {
    if (!chSend || !me) return;
    var now = Date.now();
    var spotted = spotOnMe;
    var plan = sender.plan(spotted);
    var thumb = null;
    var t = grabThumb(plan.thumbW, plan.thumbQ);
    if (sender.dueThumb(now, spotted, t)) thumb = t;
    if (sender.dueState(now, spotted, force || !!thumb)) {
      var m = { kind: 'state', sid: mySid(), name: me.name, page: pageName(), path: location.pathname, at: now };
      if (thumb) m.thumb = thumb;
      chSend(m);
    }
  }
  function onMsg(m) {
    if (!C.isValid(m)) return;
    if (m.kind === 'ping') {
      liveUntil = Date.now() + PING_ALIVE_MS;
      if (!saidHello) { chSend({ kind: 'hello', sid: mySid(), name: me.name }); saidHello = true; }
      badge(true);
      sendState(true); // 핸드셰이크 — 교사 재입장 즉시 재송신
    } else if (m.kind === 'spotlight') {
      spotOnMe = !!(m.sid && m.sid === mySid());
      if (liveUntil > Date.now()) badge(true);
    } else if (m.kind === 'end') {
      liveUntil = 0; saidHello = false; spotOnMe = false;
      badge(false);
    }
  }
  function tick() {
    var now = Date.now();
    if (now < liveUntil) {
      if (!document.hidden) sendState(false);
    } else {
      badge(false);
      saidHello = false;
    }
  }

  /* ── 채널 ─────────────────────────────────────────────────────────── */
  function join() {
    sender = C.createSender();
    var ch = db.channel(C.channelName(me.code), { config: { broadcast: { self: false, ack: false } } });
    ch.on('broadcast', { event: 'kl' }, function (e) { if (e && e.payload) onMsg(e.payload); });
    ch.subscribe();
    chSend = function (p) { try { ch.send({ type: 'broadcast', event: 'kl', payload: p }); } catch (e) {} };
    setInterval(tick, 1000);
  }

  /* ── 부팅 ─────────────────────────────────────────────────────────── */
  function boot() {
    ensureCore().then(function () {
      C = window.KLiveCore;
      return identify();
    }).then(function (m) {
      if (!m) return;                     // 동승 대상 아님
      me = m;
      var tryJoin = function () {
        liveOpened(me.code).then(function (open) {
          if (open) { ensureDb().then(join); }
          else setTimeout(tryJoin, RECHECK_MS); // 긴 차시 중에 라이브가 켜져도 잡히게
        });
      };
      tryJoin();
    }).catch(function () {});
  }

  /* 디버그·테스트 표면 (작고 무해 — jsdom 시나리오용) */
  window.KeduRide = {
    _boot: boot, _onMsg: function (m) { onMsg(m); }, _tick: tick,
    _state: function () { return { live: Date.now() < liveUntil, me: me, sid: sid }; }
  };

  boot();
})();
