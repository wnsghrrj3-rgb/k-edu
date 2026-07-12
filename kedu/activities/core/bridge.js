/* core/bridge.js — 케이티처 활동 시스템 브리지 v1.1.0
 * 헌법: handoff/kedu/activities/케이티처_활동시스템_설계.md §3·§4·§8
 * v1.0.0 프로토콜(§4 postMessage)은 동결 유지 — 변경 없음.
 * v1.1.0 추가: assign 재제출 병합(§8-4, M3 해소). cw_submit이 upsert(last-write-wins)이므로
 *   시도 이력이 서버에 쌓이지 않는다 → 브리지가 제출 직전에 이전 제출을 읽어 정책대로 병합한다.
 *   정책 sc = best(기본, D4) | first(D10 성향) | last. 조회 원천은 RPC cw_open_bundle(서버) >
 *   localStorage 백업(기기) > 없음(첫 시도). 조회 실패해도 제출은 반드시 수행한다(유실 0 우선).
 *
 * 프로토콜(§4): 상행 ACTIVITY_READY / PROGRESS / RESULT / EXIT, 하행 ACTIVITY_CONFIG / CLOSE. v:1 고정.
 * 모드 판정(§20-2): URL에 cwb+cwi(케이박스 딥링크)가 있으면 무조건 assign. 그 외 ?mode=, 기본 solo.
 * 설정 우선순위(§3-3): CONFIG > URL 파라미터 > init defaults(카탈로그 기본값) > 코드 기본값.
 * 핸드셰이크(§4-1): 선택적. CONFIG 800ms 미도착 = standalone 진행. 실패가 도구를 멈추게 하지 않는다.
 * 케이박스 제출(§20-2): finish 시 assign이면 KBox.submit 직결. 실패 시 localStorage 보관 +
 *   지수 백오프 재시도(기본 [2000,6000,18000]ms, window.__KBRIDGE_RETRY_MS__로 오버라이드) +
 *   재진입 시 자동 재제출. 학생 결과는 절대 유실하지 않는다(§4-4). 어댑터는 무수정(전 도구 공용).
 * detail(§13-3): 문항 수준 기록은 assign 모드에서만 발신·제출. 최대 100항목.
 * 시드(§3-1): ?seed= 있으면 고정(mulberry32), 없으면 랜덤. KBridge.rng로 노출.
 *
 * API(§4-5):
 *   KBridge.init({ activityId, defaults, onConfig(cfg), onClose, getProgress, configWaitMs })
 *   KBridge.progress({ q, total, ok, type })
 *   KBridge.finish({ score, total, durationSec, byType, detail, onSubmit })  → true | false(중복)
 *   KBridge.exit(reason, progress)
 *   KBridge.mode / .seed / .scoring / .rng() / .version
 */
(function () {
  'use strict';
  var VERSION = '1.1.0';
  var MODES = ['class', 'solo', 'assign'];
  var SCORING = ['best', 'first', 'last'];
  var PKEY = 'kbridge_pending_v1';
  var BKEY = 'kbridge_best_v1';        // 서버 조회 실패 대비 기기 백업 (§8-4)
  var PREV_WAIT_MS = 1500;             // 이전 제출 조회 상한 — 넘으면 병합 없이 제출

  var q = new URLSearchParams(location.search);
  var isLocal = location.protocol === 'file:' ||
    location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var TARGET = isLocal ? '*' : location.origin;

  // ── 모드 판정: 케이박스 딥링크(cwb+cwi) = assign 강제 (§20-2)
  var kboxDeep = !!(q.get('cwb') && q.get('cwi'));
  var urlMode = q.get('mode');
  var mode = kboxDeep ? 'assign' : (MODES.indexOf(urlMode) >= 0 ? urlMode : 'solo');

  // ── 시드 난수 (mulberry32)
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var seedRaw = q.get('seed');
  var seed = (seedRaw != null && seedRaw !== '' && !isNaN(+seedRaw))
    ? (+seedRaw | 0) : Math.floor(Math.random() * 2147483647);
  var rng = mulberry32(seed);

  var state = {
    activityId: null,
    mode: mode,
    aid: q.get('aid') || null,
    sid: (q.get('sid') != null && q.get('sid') !== '') ? parseInt(q.get('sid'), 10) : null,
    mute: q.get('mute') === '1',
    sc: (SCORING.indexOf(q.get('sc')) >= 0 ? q.get('sc') : 'best'),   // §8-4 재시도 채점 정책
    startedAt: Date.now(),
    finished: false,
    closed: false
  };

  function post(msg) {
    try { (window.parent || window).postMessage(msg, TARGET); } catch (e) { /* 발신 실패는 무해 */ }
  }
  function validOrigin(ev) { return isLocal || ev.origin === location.origin; }

  // ── localStorage 보류 큐 (§4-4 유실 방지; 시크릿 모드 등 불가 환경은 조용히 무시 §14-10)
  function loadPending() {
    try { return JSON.parse(localStorage.getItem(PKEY) || '[]'); } catch (e) { return []; }
  }
  function savePending(arr) {
    try { localStorage.setItem(PKEY, JSON.stringify(arr)); } catch (e) { /* no-op */ }
  }
  function addPending(env) {
    var arr = loadPending();
    arr.push({ ts: Date.now(), env: env });
    savePending(arr);
  }
  function removePendingByTs(ts) {
    savePending(loadPending().filter(function (p) { return p.ts !== ts; }));
  }
  function retryDelays() {
    return (typeof window !== 'undefined' && window.__KBRIDGE_RETRY_MS__) || [2000, 6000, 18000];
  }

  // ── 케이박스 제출 (어댑터 직결 §20-2). done(res)는 최종 1회.
  function kboxSubmit(env, attempt, pendingTs, done) {
    var KB = window.KBox;
    if (!(KB && KB.active)) { if (done) done({ status: 'inactive' }); return; }
    var p;
    try { p = Promise.resolve(KB.submit(env)); }
    catch (e) { p = Promise.resolve({ status: 'error', message: String(e) }); }
    p.then(function (res) {
      var st = res && res.status;
      var fail = (st === 'error' || st === 'no_client' || st === 'no_session');
      if (!fail) { // ok·dup·inactive = 종결 (dup: 어댑터 이중 가드 통과 = 이미 제출됨)
        if (pendingTs != null) removePendingByTs(pendingTs);
        if (done) done(res || { status: 'ok' });
        return;
      }
      var delays = retryDelays();
      if (attempt < delays.length) {
        setTimeout(function () { kboxSubmit(env, attempt + 1, pendingTs, done); }, delays[attempt]);
      } else {
        if (pendingTs == null) addPending(env); // 최초 실패분만 보관 (재진입분은 이미 큐에 있음)
        if (done) done({ status: 'pending' });
      }
    });
  }

  // ── 재진입 시 보류분 자동 재제출 (init에서 호출)
  // 보류 봉투는 detail.attempt(이번 시도 raw)를 품고 있으므로 재병합해서 보낸다 —
  // 다른 기기에서 그 사이에 제출이 있었어도 정책(best/first)이 깨지지 않는다.
  function flushPending() {
    if (!(window.KBox && window.KBox.active)) return;
    loadPending().forEach(function (p) {
      var at = p.env && p.env.detail && p.env.detail.attempt;
      if (at) submitAssign(at, p.env.detail.activityId, p.ts, null);
      else kboxSubmit(p.env, 0, p.ts, null);   // v1.0.0 봉투 호환 (attempt 없음)
    });
  }

  // ── 재제출 병합 (§8-4) ────────────────────────────────────────────────────
  function itemKey() {
    var KB = window.KBox;
    return (KB && KB.bundleId && KB.itemId) ? (KB.bundleId + ':' + KB.itemId) : null;
  }
  function loadBackup() {
    var k = itemKey(); if (!k) return null;
    try { return (JSON.parse(localStorage.getItem(BKEY) || '{}'))[k] || null; } catch (e) { return null; }
  }
  function saveBackup(payload) {
    var k = itemKey(); if (!k) return;
    try {
      var all = JSON.parse(localStorage.getItem(BKEY) || '{}');
      all[k] = payload;
      localStorage.setItem(BKEY, JSON.stringify(all));
    } catch (e) { /* 시크릿 모드 등 — 서버가 원천이므로 무해 */ }
  }
  function sbClient() {
    if (window.sb && window.sb.rpc) return window.sb;
    if (typeof window.getKeduDb === 'function') { try { return window.getKeduDb(); } catch (e) { return null; } }
    return (window.supabase && window.supabase.rpc) ? window.supabase : null;
  }
  // 이전 제출 payload 조회: 서버(cw_open_bundle) > 기기 백업 > null. 실패해도 절대 막지 않는다.
  function readPrev(cb) {
    var KB = window.KBox;
    if (!(KB && KB.active && KB.bundleId && KB.itemId)) { cb(null); return; }
    var sb = sbClient();
    if (!sb || !sb.rpc) { cb(loadBackup()); return; }
    var settled = false;
    var timer = setTimeout(function () {
      if (settled) return; settled = true; cb(loadBackup());
    }, PREV_WAIT_MS);
    var p;
    try { p = Promise.resolve(sb.rpc('cw_open_bundle', { p_bundle_id: KB.bundleId })); }
    catch (e) { clearTimeout(timer); settled = true; cb(loadBackup()); return; }
    p.then(function (res) {
      if (settled) return; settled = true; clearTimeout(timer);
      var d = res && res.data, mine = null;
      var items = d && d.items;
      if (Array.isArray(items)) {
        for (var i = 0; i < items.length; i++) {
          if (items[i] && items[i].id === KB.itemId) { mine = items[i].payload || null; break; }
        }
      }
      cb((mine && mine.tool === 'activity') ? mine : loadBackup());
    }).catch(function () {
      if (settled) return; settled = true; clearTimeout(timer); cb(loadBackup());
    });
  }
  function rate(s, m) { return (m > 0) ? (s || 0) / m : 0; }

  // prev(이전 payload) + attempt(이번 시도) → 정책대로 병합된 KEDU_RESULT 봉투
  function mergeEnv(prev, attempt, activityId) {
    var pd = (prev && prev.detail) || null;
    var policy = state.sc;
    var mine = { score: attempt.score, max: attempt.max, at: attempt.at };
    var attempts = (pd && pd.attempts | 0) || 0;
    attempts += 1;

    var chosen;                                   // 채택된 시도 (최상위 score/max·byType·items의 원천)
    if (!prev || !pd) chosen = attempt;
    else if (policy === 'last') chosen = attempt;
    else if (policy === 'first') {
      chosen = {
        score: prev.score, max: prev.max, byType: pd.byType || {},
        items: pd.items || [], durationSec: pd.durationSec || 0,
        at: (pd.first && pd.first.at) || mine.at
      };
    } else {                                      // best (기본, D4) — 동률이면 이전 기록 존중
      chosen = (rate(attempt.score, attempt.max) > rate(prev.score, prev.max)) ? attempt : {
        score: prev.score, max: prev.max, byType: pd.byType || {},
        items: pd.items || [], durationSec: pd.durationSec || 0, at: mine.at
      };
    }

    var history = ((pd && pd.history) || []).concat([mine]).slice(-10);
    return {
      tool: 'activity', kind: 'auto',
      score: chosen.score, max: chosen.max,
      detail: {
        activityId: activityId,
        byType: chosen.byType || {},
        durationSec: chosen.durationSec,
        items: chosen.items || [],
        policy: policy,
        attempts: attempts,
        attempt: attempt,                          // 이번 시도 raw (보류 재제출 시 재병합용)
        first: (pd && pd.first) || mine,
        last: mine,
        history: history
      }
    };
  }

  // assign 제출 진입점: 이전 제출 조회 → 병합 → 제출(+실패 시 보류·재시도)
  function submitAssign(attempt, activityId, pendingTs, done) {
    readPrev(function (prev) {
      var env = mergeEnv(prev, attempt, activityId);
      kboxSubmit(env, 0, pendingTs, function (res) {
        if (res && (res.status === 'ok' || res.status === 'dup')) saveBackup(env);
        if (done) done(res);
      });
    });
  }

  // ── 설정 병합 (§3-3): CONFIG > URL > defaults
  function resolveConfig(hostCfg, defaults) {
    var params = {};
    var d = defaults || {};
    Object.keys(d).forEach(function (k) { params[k] = d[k]; });
    Object.keys(d).forEach(function (k) {           // URL 오버라이드 (defaults 선언 키만 — §3-1 미지 파라미터 무시)
      var v = q.get(k);
      if (v != null && v !== '') params[k] = isNaN(+v) ? v : +v;
    });
    var tRaw = q.get('t');                          // 예약 파라미터 t(제한 시간)
    if (tRaw != null && tRaw !== '' && !isNaN(+tRaw)) params.t = parseInt(tRaw, 10);
    if (hostCfg && hostCfg.params && SCORING.indexOf(hostCfg.params.sc) >= 0) state.sc = hostCfg.params.sc;
    params.sc = state.sc;                           // 예약 파라미터 sc(재시도 채점 정책, §8-4)

    var meta = { sid: state.sid, aid: state.aid, mute: state.mute, teamNames: null };
    if (hostCfg) {
      if (hostCfg.mode && MODES.indexOf(hostCfg.mode) >= 0 && !kboxDeep) state.mode = hostCfg.mode; // 딥링크 assign은 불가침
      if (hostCfg.params && typeof hostCfg.params === 'object') {
        Object.keys(hostCfg.params).forEach(function (k) { params[k] = hostCfg.params[k]; });
      }
      var hm = hostCfg.meta;
      if (hm && typeof hm === 'object') {
        if (hm.sid != null) { state.sid = hm.sid; meta.sid = hm.sid; }
        if (hm.aid != null) { state.aid = hm.aid; meta.aid = hm.aid; }
        if (hm.mute != null) { state.mute = !!hm.mute; meta.mute = state.mute; }
        if (hm.teamNames) meta.teamNames = hm.teamNames;
      }
    }
    return { mode: state.mode, params: params, meta: meta, seed: seed, hosted: !!hostCfg };
  }

  var KBridge = {
    version: VERSION,
    get mode() { return state.mode; },
    get seed() { return seed; },
    get scoring() { return state.sc; },
    rng: rng,

    // 부팅 시 1회 (§4-5)
    init: function (opts) {
      opts = opts || {};
      state.activityId = opts.activityId || 'unknown';
      post({ t: 'ACTIVITY_READY', v: 1, activityId: state.activityId, coreVersion: VERSION });
      flushPending();

      var settled = false;
      var timer = null;
      function settle(hostCfg) {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        var cfg = resolveConfig(hostCfg, opts.defaults);
        if (typeof opts.onConfig === 'function') opts.onConfig(cfg);
      }

      window.addEventListener('message', function (ev) {
        if (!validOrigin(ev)) return;
        var m = ev.data;
        if (!m || m.v !== 1) return;
        if (m.t === 'ACTIVITY_CONFIG') {
          settle(m);
        } else if (m.t === 'ACTIVITY_CLOSE') {       // §4-2 ⑥: 현재 상태로 EXIT/RESULT 후 정지
          if (state.finished || state.closed) return;
          if (typeof opts.onClose === 'function') opts.onClose();       // 도구가 RESULT로 마감할 기회
          if (!state.finished && !state.closed) {
            KBridge.exit('host_close', typeof opts.getProgress === 'function' ? opts.getProgress() : null);
          }
        }
      });

      timer = setTimeout(function () { settle(null); }, opts.configWaitMs || 800); // §4-1 standalone 진행
    },

    // 판정마다 (선택, §4-2 ②)
    progress: function (p) {
      p = p || {};
      post({
        t: 'ACTIVITY_PROGRESS', v: 1, activityId: state.activityId,
        q: p.q, total: p.total, ok: !!p.ok, type: p.type
      });
    },

    // 종료 시 1회 (§4-2 ③). 중복 호출 = false 반환 (이중 가드)
    finish: function (r) {
      if (state.finished) return false;
      state.finished = true;
      r = r || {};
      var durationSec = (r.durationSec != null) ? r.durationSec
        : Math.round((Date.now() - state.startedAt) / 1000);
      var byType = r.byType || {};
      var msg = {
        t: 'ACTIVITY_RESULT', v: 1,
        activityId: state.activityId, mode: state.mode,
        score: r.score, total: r.total, durationSec: durationSec, byType: byType
      };
      var detail = null;
      if (state.mode === 'assign') {                 // §13-3: detail은 assign에서만
        if (state.aid) msg.aid = state.aid;
        if (state.sid != null) msg.sid = state.sid;
        if (Array.isArray(r.detail)) { detail = r.detail.slice(0, 100); msg.detail = detail; }
      }
      post(msg);

      if (state.mode === 'assign') {                 // §8: KBox.submit 직결 + §8-4 정책 병합
        submitAssign({
          score: r.score, max: r.total, byType: byType,
          items: detail || [], durationSec: durationSec, at: Date.now()
        }, state.activityId, null, r.onSubmit || null);
      }
      return true;
    },

    // 중도 이탈 (§4-2 ④)
    exit: function (reason, progress) {
      if (state.finished || state.closed) return;
      state.closed = true;
      post({
        t: 'ACTIVITY_EXIT', v: 1, activityId: state.activityId,
        mode: state.mode, reason: reason || 'user', progress: progress || null
      });
    }
  };

  window.KBridge = KBridge;
})();
