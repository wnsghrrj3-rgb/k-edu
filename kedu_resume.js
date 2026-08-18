/* =====================================================================
   kedu_resume.js — 케이에듀 공용 「작업 이어하기」 (2026-08-18)

   한 줄: 아이가 만들던 것이 새로고침·뒤로가기·탭 정리로 사라지지 않게 한다.

   왜 공용인가 —
     케이에듀에는 「완성했다」를 담는 그릇이 셋 있다(kedu_collect 케이박스 수집,
     kedu_tracker 차시 기록, kedu_kbox_adapter 과제 제출). 그런데 「하던 중」을
     담는 그릇이 없어 색칠 놀이(localStorage)·케이메이커(MK_STORE)가 각자
     방언을 만들었다. 세 번째 방언을 막기 위한 단일 계층이 이 파일이다.

   접근 사다리 (준호 결정 2026-08-18) —
     visitor / guest → 저장 0. 이 기기 안에도 남기지 않는다.
     student        → 저장 O. 키에 좌석 profile_id 를 넣는다(공용 태블릿 분리).
     account(교사)   → 저장 O. 키에 세션 user id.
     판정은 KeduTier 를 통해서만 한다 — 저장 가부의 유일한 창구.

   지금 범위 = 이 기기 안(IndexedDB). 서버 동기는 seam(_push/_pull)만 두고
   no-op — 「먼저 기기 안, 서버는 나중에」(준호 결정). 스키마가 서면 여기만 채운다.

   사용 —
     <script src="/kedu_config.js"></script>
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="/kedu_tier.js"></script>
     <script src="/kedu_resume.js"></script>

     var R = await KeduResume.init({ app:'animlab', version:1 });
     if (R.can) {
       await KeduResume.save('main', { meta:{...}, parts:{ f0:blob, f1:blob } });
       var got = await KeduResume.load('main');
     }

   저장 단위 = 슬롯(slot). 한 슬롯 = {meta, parts}.
     meta  = JSON 가능한 작은 값(장수·fps·미션 등).
     parts = 이름 → Blob 맵. **바뀐 조각만 쓴다** — 애니 24장을 매번 통째로
             쓰면 태블릿이 버티지 못한다. parts 를 준 것만 갱신하고, 지울 것은
             값에 null 을 넣는다.

   정직 —
     · IndexedDB 부재·차단(사생활 모드 등) = ready false. 저장은 조용히 false 를
       돌리되 available 로 드러낸다. 조용히 잃어버리게 두지 않는다.
     · 만료 30일. 남의 기기에 아이 작업이 영영 남지 않게 부팅마다 청소한다.
   ===================================================================== */
(function () {
  'use strict';
  if (window.KeduResume) return;

  var DB = 'kedu-resume', ST = 'slots', VER = 1;
  var TTL_MS = 30 * 24 * 60 * 60 * 1000;          // 30일 — 지난 작업 자동 청소

  var dbh = null, ready = false, opened = false;
  var idbFactory = null;                           // 테스트 주입구
  var ctx = { app: null, version: 1, tier: 'visitor', owner: null, can: false, inited: false };

  function factory() {
    return idbFactory || (typeof window !== 'undefined' && window.indexedDB) || null;
  }

  // ── IndexedDB 열기 ────────────────────────────────────────────────
  function open() {
    if (opened) return Promise.resolve(ready);
    opened = true;
    var f = factory();
    if (!f) { ready = false; return Promise.resolve(false); }
    return new Promise(function (res) {
      var req;
      try { req = f.open(DB, VER); } catch (e) { ready = false; return res(false); }
      req.onupgradeneeded = function (ev) {
        try {
          var db = (ev && ev.target && ev.target.result) || req.result;
          if (!db.objectStoreNames.contains(ST)) {
            var os = db.createObjectStore(ST, { keyPath: 'key' });
            os.createIndex('at', 'at');
          }
        } catch (e) {}
      };
      req.onerror = function () { ready = false; res(false); };
      req.onsuccess = function () { dbh = req.result; ready = true; res(true); };
    });
  }

  function tx(mode) {
    if (!dbh) return null;
    try { return dbh.transaction(ST, mode).objectStore(ST); } catch (e) { return null; }
  }
  function wrap(req) {
    return new Promise(function (res, rej) {
      if (!req) return rej(new Error('no-store'));
      req.onsuccess = function () { res(req.result); };
      req.onerror = function () { rej(req.error || new Error('idb')); };
    });
  }

  // ── 키 = app · 소유자 · 슬롯 ──────────────────────────────────────
  //    소유자를 키에 넣는 이유: 학교 태블릿은 공용이다. 다음 아이가 열었을 때
  //    앞 아이의 그림이 떠오르면 안 된다.
  function keyOf(slot) {
    return ctx.app + '|' + (ctx.owner || 'anon') + '|' + String(slot || 'main');
  }

  // ── 소유자 판별 — student=좌석 profile_id, account=세션 user id ────
  function resolveOwner(db) {
    return window.KeduTier.resolve(db).then(function (t) {
      var tier = (t && t.tier) || 'visitor';
      if (tier === 'student') {
        var pid = t.profile && (t.profile.profile_id || t.profile.id);
        return { tier: tier, owner: pid ? ('s_' + pid) : null };
      }
      if (tier === 'account') {
        return db.auth.getSession().then(function (r) {
          var u = r && r.data && r.data.session && r.data.session.user;
          return { tier: tier, owner: u && u.id ? ('a_' + u.id) : null };
        }).catch(function () { return { tier: tier, owner: null }; });
      }
      return { tier: tier, owner: null };            // visitor·guest = 저장 없음
    }).catch(function () { return { tier: 'visitor', owner: null }; });
  }

  function clientOf(opts) {
    if (opts && opts.db) return opts.db;
    if (window.sb) return window.sb;
    if (typeof getKeduDb === 'function') { try { return getKeduDb(); } catch (e) { return null; } }
    return null;
  }

  // ── 만료 청소 ─────────────────────────────────────────────────────
  function sweep() {
    var os = tx('readwrite'); if (!os) return Promise.resolve(0);
    var cut = Date.now() - TTL_MS, n = 0;
    return new Promise(function (res) {
      var req;
      try { req = os.openCursor(); } catch (e) { return res(0); }
      req.onsuccess = function () {
        var c = req.result;
        if (!c) return res(n);
        var v = c.value;
        if (!v || typeof v.at !== 'number' || v.at < cut) { try { c.delete(); n++; } catch (e) {} }
        c.continue();
      };
      req.onerror = function () { res(n); };
    });
  }

  // ── init — 저장 가부를 확정한다. 이 전에는 아무것도 쓰지 않는다 ────
  function init(opts) {
    opts = opts || {};
    ctx.app = String(opts.app || 'unknown');
    ctx.version = opts.version || 1;
    var db = clientOf(opts);
    var tierP = (db && window.KeduTier)
      ? resolveOwner(db)
      : Promise.resolve({ tier: 'visitor', owner: null });   // 인증 계층 없는 페이지 = 저장 없음

    return tierP.then(function (t) {
      ctx.tier = t.tier;
      ctx.owner = t.owner;
      var allowed = !!(window.KeduTier && window.KeduTier.canSave({ tier: t.tier })) || t.tier === 'account';
      if (!allowed || !t.owner) {                            // 소유자를 못 정하면 저장하지 않는다
        ctx.can = false; ctx.inited = true;
        return { can: false, tier: ctx.tier, available: false, reason: allowed ? 'no_owner' : 'tier' };
      }
      return open().then(function (ok) {
        ctx.can = ok; ctx.inited = true;
        if (ok) { sweep(); }
        return { can: ok, tier: ctx.tier, available: ok, reason: ok ? null : 'no_idb' };
      });
    });
  }

  // ── 저장 — parts 는 준 것만 갱신(바뀐 조각만 쓴다) ────────────────
  function save(slot, payload) {
    if (!ctx.can) return Promise.resolve(false);
    payload = payload || {};
    var key = keyOf(slot);
    var os = tx('readwrite'); if (!os) return Promise.resolve(false);
    return wrap(os.get(key)).then(function (old) {
      var rec = old || { key: key, app: ctx.app, owner: ctx.owner, slot: String(slot || 'main'),
                         v: ctx.version, meta: {}, parts: {}, at: 0 };
      rec.v = ctx.version;
      if (payload.meta && typeof payload.meta === 'object') rec.meta = payload.meta;
      if (payload.parts && typeof payload.parts === 'object') {
        Object.keys(payload.parts).forEach(function (k) {
          var val = payload.parts[k];
          if (val == null) delete rec.parts[k];               // null = 이 조각 삭제
          else rec.parts[k] = val;
        });
      }
      if (payload.replaceParts) rec.parts = payload.parts || {};
      rec.at = Date.now();
      var os2 = tx('readwrite'); if (!os2) return false;
      return wrap(os2.put(rec)).then(function () { return true; }, function () { return false; });
    }, function () { return false; });
  }

  // ── 불러오기 — 버전이 다르면 되살리지 않는다(포맷 깨짐 방지) ──────
  function load(slot) {
    if (!ctx.can) return Promise.resolve(null);
    var os = tx('readonly'); if (!os) return Promise.resolve(null);
    return wrap(os.get(keyOf(slot))).then(function (rec) {
      if (!rec) return null;
      if (rec.v !== ctx.version) return null;
      if (typeof rec.at === 'number' && rec.at < Date.now() - TTL_MS) return null;
      return { meta: rec.meta || {}, parts: rec.parts || {}, at: rec.at, slot: rec.slot };
    }, function () { return null; });
  }

  function clear(slot) {
    if (!ctx.can) return Promise.resolve(false);
    var os = tx('readwrite'); if (!os) return Promise.resolve(false);
    return wrap(os.delete(keyOf(slot))).then(function () { return true; }, function () { return false; });
  }

  // 이 앱·이 소유자의 슬롯 목록(최신순) — 여러 작품을 두는 도구용
  function list() {
    if (!ctx.can) return Promise.resolve([]);
    var os = tx('readonly'); if (!os) return Promise.resolve([]);
    var pre = ctx.app + '|' + (ctx.owner || 'anon') + '|', out = [];
    return new Promise(function (res) {
      var req;
      try { req = os.openCursor(); } catch (e) { return res([]); }
      req.onsuccess = function () {
        var c = req.result;
        if (!c) { out.sort(function (a, b) { return b.at - a.at; }); return res(out); }
        var v = c.value;
        if (v && typeof v.key === 'string' && v.key.indexOf(pre) === 0) {
          out.push({ slot: v.slot, at: v.at, meta: v.meta || {} });
        }
        c.continue();
      };
      req.onerror = function () { res([]); };
    });
  }

  // ── 자동 저장 도우미 — 도구는 mark() 만 부른다 ────────────────────
  //    획 하나마다 쓰면 태블릿이 버티지 못하고, 안 쓰면 잃는다. 그 사이를 잡는다.
  function autosaver(slot, collect, opts) {
    opts = opts || {};
    var wait = opts.wait || 1800, timer = null, running = false, again = false;
    function flush() {
      if (!ctx.can) return Promise.resolve(false);
      if (running) { again = true; return Promise.resolve(false); }
      running = true;
      var payload;
      try { payload = collect(); } catch (e) { running = false; return Promise.resolve(false); }
      var p = (payload && typeof payload.then === 'function') ? payload : Promise.resolve(payload);
      return p.then(function (pl) { return pl ? save(slot, pl) : false; })
              .catch(function () { return false; })
              .then(function (r) {
                running = false;
                if (again) { again = false; return flush(); }
                return r;
              });
    }
    return {
      mark: function () {
        if (!ctx.can) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () { timer = null; flush(); }, wait);
      },
      flush: function () { if (timer) { clearTimeout(timer); timer = null; } return flush(); }
    };
  }

  // ── 서버 동기 seam — 「서버는 나중에」. 스키마가 서면 여기만 채운다 ──
  var _push = null, _pull = null;

  window.KeduResume = {
    init: init, save: save, load: load, clear: clear, list: list, autosaver: autosaver,
    canSave: function () { return !!ctx.can; },
    tier: function () { return ctx.tier; },
    state: function () { return { app: ctx.app, tier: ctx.tier, owner: ctx.owner, can: ctx.can, inited: ctx.inited }; },
    _useIDB: function (f) { idbFactory = f; opened = false; dbh = null; ready = false; },  // 테스트 주입
    _sync: { push: _push, pull: _pull },                                                    // 서버 확장 지점
    TTL_MS: TTL_MS
  };
})();
