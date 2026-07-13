/* =============================================================
 * kedu_tool_bridge.js — 도구·전시의 활동을 회수한다
 * 명세: handoff/생태계설계_v1.md §2(모이다) · 세계층 KEDU_COLLECT
 *
 * 한 줄: 케이랩·뮤지엄은 채점 대상이 아니다(탐구 도구·전시).
 *        "누가 했나"만 정직하게 남긴다. 점수를 지어내지 않는다.
 *
 * 회수 신호 2단 —
 *   1순위 «완주» : Museum.ticket.grant(...)  ← 뮤지엄 전시 28/29의 공통 완주 신호.
 *                  이미 티켓북(localStorage)에 쌓고 있었으나 KEDU_COLLECT와 따로 놀던 섬이었다.
 *   2순위 «참여» : 도구는 완주 개념이 없다. 실질 상호작용 12회 + 체류 45초 → 「했다」 1회.
 *                  느슨하면 안 한 아이가 한 걸로 뜬다. 임계값은 보수적으로 잡았다.
 *
 * 회수 채널 (있는 것만, 없으면 조용히 무동작 — 학생 방해 0):
 *   1) KEDU.collect   — 내 기기 1층 (kedu_collect.js)
 *   2) cw_submissions — 케이박스로 보낸 것 (?cwb=&cwi= 일 때만 어댑터를 지연 로드)
 *   3) scores         — 학급 코드 학생 (kedu_tracker.js가 이미 실린 페이지에서만)
 *
 * §0-6 L1 무저장: 케이박스도 학급 코드도 아니면 서버로 한 톨도 안 간다.
 * §0-9 3초 화면: supabase는 케이박스로 온 경우에만 지연 로드한다. 평상시 네트워크 0.
 *
 * 로드: 도구·전시 페이지 body 끝. kedu_collect.js 뒤.
 * ============================================================= */
(function () {
  'use strict';
  if (window.__keduToolBridge) return;
  window.__keduToolBridge = true;

  var q = new URLSearchParams(location.search);
  var CWB = q.get('cwb'), CWI = q.get('cwi');
  var FROM_KBOX = !!(CWB && CWI);

  // 앱 id = 파일명 (scilab_ecosys · ex01_gauss …)
  var m = location.pathname.match(/\/([^\/]+)\.html?$/i);
  var APP = m ? decodeURIComponent(m[1]) : 'tool';
  var IS_MUSEUM = location.pathname.indexOf('/museum/') === 0;
  var t0 = Date.now();
  var taps = 0;
  var sent = {};                 // id별 1회 가드

  function title() {
    return (document.title || APP).replace(/\s*[|·].*$/, '').trim();
  }

  // ── 채널 3: 케이박스 (딥링크로 왔을 때만 지연 로드) ────────────────────
  var kboxReady = null;
  function loadOne(src) {
    return new Promise(function (res) {
      var s = document.createElement('script');
      s.onload = function () { res(true); };     // 핸들러를 src보다 먼저 단다
      s.onerror = function () { res(false); };
      s.src = src;
      document.head.appendChild(s);
    });
  }
  function loadKbox() {
    if (kboxReady) return kboxReady;
    var need = [];
    if (typeof window.getKeduDb !== 'function') need.push('/kedu_config.js');
    if (!window.supabase) need.push('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    need.push('/kedu_kbox_adapter.js');

    kboxReady = window.KBox
      ? Promise.resolve(window.KBox)
      : need.reduce(function (p, src) {
          return p.then(function () { return loadOne(src); });
        }, Promise.resolve()).then(function () { return window.KBox || null; });
    return kboxReady;
  }

  // ── 회수 ───────────────────────────────────────────────────────────────
  //   kind: 전시 완주 = badge(티켓) · 도구 참여 = record
  function harvest(o) {
    var id = o.id || APP;
    if (sent[id]) return;
    sent[id] = true;

    var meta = {
      app: APP,
      sec: Math.round((Date.now() - t0) / 1000),
      taps: taps,
      how: o.how                       // 'ticket' | 'use'
    };
    if (o.fine) meta.fine = o.fine;

    // 1) 내 기기 1층
    try {
      if (window.KEDU && typeof window.KEDU.collect === 'function') {
        window.KEDU.collect({
          kind: o.kind, app: IS_MUSEUM ? 'museum' : 'klab',
          id: id, title: o.title || title(), meta: meta
        });
      }
    } catch (e) {}

    // 2) 케이박스로 보낸 것이면 결과봉투 (점수는 없다 — null로 정직하게)
    if (FROM_KBOX) {
      loadKbox().then(function (KB) {
        if (!KB || !KB.active) return;
        try {
          KB.submit({
            tool: IS_MUSEUM ? 'museum' : 'klab',
            kind: o.how === 'ticket' ? 'done' : 'use',
            score: null, max: null,
            detail: { id: id, title: o.title || title(), sec: meta.sec, taps: taps }
          });
        } catch (e) {}
      });
    }

    // 3) 학급 코드 학생 (tracker가 이미 실린 페이지에서만 — 없으면 안 부른다)
    try {
      if (window.kedu && typeof window.kedu.recordLessonEnd === 'function'
        && typeof window.kedu.isTracking === 'function' && window.kedu.isTracking()) {
        window.kedu.recordLessonEnd(0, 0);
      }
    } catch (e) {}
  }

  // ── 1순위: 뮤지엄 티켓 = 완주 (전시 코드 무손상, grant를 감싼다) ────────
  function hookTicket() {
    if (!window.Museum || !window.Museum.ticket) return false;
    var t = window.Museum.ticket;
    if (typeof t.grant !== 'function' || t.grant.__bridged) return true;
    var orig = t.grant;
    var wrapped = function (o) {
      var granted = orig.apply(this, arguments);
      // 재발급(이미 보유)은 false — 그때도 「봤다」는 사실이므로 첫 1회만 기록
      try {
        harvest({ kind: 'badge', how: 'ticket', id: (o && o.id) || APP, title: (o && o.title) || title(), fine: o && o.fine });
      } catch (e) {}
      return granted;
    };
    wrapped.__bridged = true;
    t.grant = wrapped;
    return true;
  }

  // ── 2순위: 참여 판정 (도구는 완주가 없다) ──────────────────────────────
  var MIN_TAPS = 12, MIN_SEC = 45;
  function onTap() {
    taps++;
    if (taps >= MIN_TAPS) check();
  }
  function check() {
    if (taps < MIN_TAPS) return;
    if ((Date.now() - t0) / 1000 < MIN_SEC) return;
    harvest({ kind: 'record', how: 'use', id: APP, title: title() });
  }

  ['pointerdown', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, onTap, { passive: true });
  });
  setInterval(check, 5000);
  // 떠날 때 마지막 기회 (조건 충족했는데 아직 안 보냈으면)
  window.addEventListener('pagehide', check);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') check();
  });

  // 뮤지엄 코어가 늦게 뜰 수 있다
  if (!hookTicket()) {
    var tries = 0;
    var iv = setInterval(function () {
      if (hookTicket() || ++tries > 20) clearInterval(iv);
    }, 250);
  }

  window.KEDU_TOOL = {
    app: APP,
    fromKbox: FROM_KBOX,
    _state: function () { return { taps: taps, sec: Math.round((Date.now() - t0) / 1000), sent: Object.keys(sent) }; },
    _harvest: harvest,
    _check: check
  };
})();
