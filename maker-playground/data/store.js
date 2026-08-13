/* ============================================================
   MK_STORE — R116 영속 이관: localStorage 5MB 쿼터를 벗는다
   ------------------------------------------------------------
   문제의 실체 (§1.109 R89 기록): 사진 dataURL 이 실리는 K_DOC·K_PROJ 는
   장당 100KB 급 — 수십 장 프로젝트가 localStorage 5MB 를 넘으면
   setItem 이 던지고, saveDoc 은 규약대로 조용히 false 를 돌려
   사용자는 저장이 죽은 줄 모른 채 작품을 잃는다.

   처방 = 동기 파사드 + 비동기 IndexedDB 미러:
   · 읽기·쓰기는 메모리 맵(M)에서 동기로 — live.js 의
     {getItem,setItem,removeItem} 계약을 그대로 입어 호출부 무수정.
   · 쓰기는 IDB 로 비동기 미러(내구). IDB 쓰기 실패 시에만
     localStorage 폴백 + degraded 표시 (정직: 조용히 버리지 않는다).
   · 부팅: init() 이 IDB 전량을 M 으로 적재 → ready.
     IDB 가 비어 있고 localStorage 에 mklive:* 가 있으면 1회 이주
     (원본 localStorage 는 롤백 안전망으로 지우지 않는다).
   · IDB 부재·실패 환경(구형·프라이빗·jsdom) = ready false —
     live.js store() 가 종전 localStorage 경로로 폴백, 옛 세계 무손.

   우선순위 (live.js store()): 주입 backend > MK_STORE(ready) > localStorage
   — 기존 하니스의 useBackend 계약이 항상 이긴다.

   정직 기록:
   · ready 이후 setItem 성공 = "메모리 수용 + 내구 시도" 다.
     내구 실패는 폴백·degraded 로 드러나되 반환값은 못 바꾼다(동기 파사드).
   · ready 전(부팅 수 ms 창)의 쓰기는 localStorage 로 간다 — 사용자
     조작이 닿기 전 창이라 실피해 없음, 다음 부팅 이주 대상도 아님
     (IDB 가 이미 비어 있지 않으므로). 문서화로만 남긴다.
   · removeItem 은 localStorage 사본도 함께 지운다 — 훗날 폴백 부팅에서
     지운 문서가 되살아나는 길을 막는다.
   ============================================================ */
window.MK_STORE = (() => {
  'use strict';
  const DB = 'mk-maker', ST = 'kv';
  const M = new Map();                 /* 동기 진실 — ready 후 읽기·쓰기의 정본 */
  let idb = null;                      /* 주입 IDB 팩토리 — 기본 window.indexedDB */
  let dbh = null;                      /* 열린 DB 핸들 */
  let opening = false;
  const waiters = [];                  /* init 중복 호출 대기열 */
  let pending = 0;                     /* 미완 IDB 쓰기 수 */
  const idleQ = [];                    /* whenIdle 대기열 */

  const api = { ready: false, degraded: false };

  const useIDB = (f) => { idb = f; };

  const ls = () => {
    try { const t = window.localStorage; t.getItem('__mk'); return t; } catch (_) { return null; }
  };

  /* ---- 비동기 미러 ---- */
  function settle() { if (--pending <= 0) { pending = 0; idleQ.splice(0).forEach((f) => { try { f(); } catch (_) {} }); } }
  function whenIdle(cb) { if (pending <= 0) { try { queueMicrotask(cb); } catch (_) { setTimeout(cb, 0); } return; } idleQ.push(cb); }

  function fallbackSet(k, v) {
    api.degraded = true;
    const s = ls(); if (s) try { s.setItem(k, v); } catch (_) {}
  }
  function idbPut(k, v) {
    if (!dbh) return;
    pending++;
    try {
      const r = dbh.transaction(ST, 'readwrite').objectStore(ST).put(v, k);
      r.onsuccess = () => settle();
      r.onerror = () => { fallbackSet(k, v); settle(); };
    } catch (_) { fallbackSet(k, v); settle(); }
  }
  function idbDel(k) {
    if (!dbh) return;
    pending++;
    try {
      const r = dbh.transaction(ST, 'readwrite').objectStore(ST).delete(k);
      r.onsuccess = () => settle();
      r.onerror = () => { api.degraded = true; settle(); }
    } catch (_) { api.degraded = true; settle(); }
  }

  /* ---- 동기 파사드 — live.js store() 가 입는 계약 ---- */
  function getItem(k) { k = String(k); return M.has(k) ? M.get(k) : null; }
  function setItem(k, v) { k = String(k); v = String(v); M.set(k, v); idbPut(k, v); }
  function removeItem(k) {
    k = String(k); M.delete(k); idbDel(k);
    const s = ls(); if (s) try { s.removeItem(k); } catch (_) {}   /* 사본 부활 차단 */
  }
  function keys() { return [...M.keys()]; }

  /* ---- 1회 이주 — 첫 IDB 가동에서 localStorage 이삿짐 ---- */
  function migrate() {
    const s = ls(); if (!s) return 0;
    const found = [];
    try { for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && k.indexOf('mklive:') === 0) found.push(k); } } catch (_) {}
    let n = 0;
    found.forEach((k) => {
      let v = null; try { v = s.getItem(k); } catch (_) {}
      if (v != null) { M.set(k, String(v)); idbPut(k, String(v)); n++; }
    });
    return n;                          /* 원본은 남긴다 — 롤백 안전망 */
  }

  /* ---- 부팅 ---- */
  function init(cb) {
    const done = (ok) => { try { cb && cb(ok); } catch (_) {} };
    if (api.ready) return done(true);
    if (opening) { waiters.push(done); return; }
    const f = idb || (typeof window !== 'undefined' && window.indexedDB) || null;
    if (!f) return done(false);
    opening = true;
    const fail = () => { opening = false; done(false); waiters.splice(0).forEach((w) => w(false)); };
    let req;
    try { req = f.open(DB, 1); } catch (_) { return fail(); }
    req.onupgradeneeded = (ev) => {
      try {
        const db = (ev && ev.target && ev.target.result) || req.result;
        if (!db.objectStoreNames.contains(ST)) db.createObjectStore(ST);
      } catch (_) {}
    };
    req.onerror = fail;
    req.onsuccess = () => {
      dbh = req.result;
      let ks = null, vs = null, got = 0;
      const fin = () => {
        if (++got < 2) return;
        try { (ks || []).forEach((k, i) => M.set(String(k), String((vs || [])[i]))); } catch (_) {}
        if (M.size === 0) migrate();
        api.ready = true; opening = false;
        done(true); waiters.splice(0).forEach((w) => w(true));
      };
      try {
        const os = dbh.transaction(ST, 'readonly').objectStore(ST);
        const rk = os.getAllKeys(), rv = os.getAll();
        rk.onsuccess = () => { ks = rk.result; fin(); };
        rv.onsuccess = () => { vs = rv.result; fin(); };
        rk.onerror = rv.onerror = fail;
      } catch (_) { fail(); }
    };
  }

  /* ---- 판정 — 메모리 파사드 자기 검증 (IDB 무관·순수) ---- */
  function audit() {
    const v = [];
    const K = '__mkstore:audit', prevHad = M.has(K), prev = M.get(K);
    setItem(K, 'v1');
    if (getItem(K) !== 'v1') v.push('set→get 왕복 실패');
    setItem(K, 123);
    if (getItem(K) !== '123') v.push('값 문자열 강제 실패');
    removeItem(K);
    if (getItem(K) !== null) v.push('remove 후 null 아님');
    if (prevHad) M.set(K, prev);
    if (typeof api.ready !== 'boolean' || typeof api.degraded !== 'boolean') v.push('상태 플래그 형 오류');
    return { ok: v.length === 0, violations: v };
  }

  api.useIDB = useIDB; api.init = init;
  api.getItem = getItem; api.setItem = setItem; api.removeItem = removeItem;
  api.keys = keys; api.whenIdle = whenIdle; api.audit = audit;
  return api;
})();
