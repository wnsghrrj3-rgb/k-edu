/* ============================================================================
   K-edu 케이라이브(KLive) — 순수 로직 코어 (P1)
   ----------------------------------------------------------------------------
   한 줄: "학생이 지금 뭘 하는지"를 교사 타일로, 교사가 지목하면 반 전체 화면으로.

   완전 순수: Supabase 0 · DOM 0. 채널·화면은 live/index.html(학생 래퍼)과
   live/teacher.html(교사 모니터)이 주입한다. 여기는 메시지의 «모양»과 «규칙»만.
   → node 단독 테스트 대상 (live/tests/test_klive_core.js)

   채널: klive:{CODE} · broadcast event 'kl' · self:false (케이플 문법과 동일 계층)

   메시지 5종 (kind 고정 — 임의 신설 금지):
     학생 → : { kind:'hello', sid, name }                       입장 인사
              { kind:'state', sid, name, page, path, at, thumb? } 상태 방송
              { kind:'bye',   sid }                              퇴장
     교사 → : { kind:'ping' }                                   재입장 시 전원 즉시 재송신 요청
              { kind:'spotlight', sid, name }  /  { sid:null }   지목 / 해제
              { kind:'end' }                                     라이브 종료

   검증된 리스크 대응:
     - broadcast는 구독 전 메시지를 못 받음 → 교사 ping ↔ 학생 즉시 state 핸드셰이크.
     - WebGL 캔버스는 썸네일이 검게 나올 수 있음 → 신호 길이 하한(EMPTY_MIN)으로 버림,
       타일은 페이지 이름 카드로 폴백.
   ============================================================================ */
(function (root, factory) {
  var API = factory();
  if (typeof window !== 'undefined') root.KLiveCore = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(this, function () {
  'use strict';

  /* ── 상수 (조율은 여기 한 곳에서만) ─────────────────────────────── */
  var FRESH_MS = 12000;   // 이내 = 초록(활동 중)
  var IDLE_MS  = 45000;   // 이내 = 노랑(잠잠) · 초과 = 회색(끊김)
  var PLAN = {            // 송신 계획 — 지목 여부에 따라 해상도·주기 전환
    normal: { stateMs: 5000, thumbMs: 4000, thumbW: 240, thumbQ: 0.5  },
    spot:   { stateMs: 2000, thumbMs: 1500, thumbW: 480, thumbQ: 0.55 }
  };
  var THUMB_MAX = 90000;  // dataURL 문자 상한 (채널 페이로드 보호)
  var EMPTY_MIN = 2200;   // 이보다 짧은 JPEG dataURL = 빈/검은 화면으로 간주
  var KINDS = ['hello', 'state', 'bye', 'ping', 'spotlight', 'end'];

  /* ── 코드·식별자 (rand 주입 → 테스트 결정성) ────────────────────── */
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 케이플과 동일: 0·O·1·I 제외
  function makeCode(rand, len) {
    rand = rand || Math.random; len = len || 4;
    var s = '';
    for (var i = 0; i < len; i++) s += ALPHABET[Math.floor(rand() * ALPHABET.length)];
    return s;
  }
  function makeSid(rand) {
    rand = rand || Math.random;
    return 's' + Math.floor(rand() * 1e9).toString(36) + Date.now().toString(36).slice(-4);
  }
  function channelName(code) { return 'klive:' + String(code).toUpperCase(); }
  function normCode(raw) {
    var c = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return c.length === 4 && !/[0O1I]/.test(c) ? c : null;
  }

  /* ── 메시지 검증 ─────────────────────────────────────────────────── */
  function isValid(m) {
    if (!m || typeof m !== 'object') return false;
    if (KINDS.indexOf(m.kind) < 0) return false;
    if ((m.kind === 'hello' || m.kind === 'state') && (!m.sid || !m.name)) return false;
    if (m.kind === 'bye' && !m.sid) return false;
    return true;
  }

  /* ── 교사 명부 리듀서 — roster는 { sid: {name,page,path,at,thumb} } ── */
  function rosterReduce(roster, m, now) {
    if (!isValid(m)) return roster;
    var r = {}; for (var k in roster) r[k] = roster[k]; // 얕은 복사(불변 갱신)
    if (m.kind === 'hello') {
      r[m.sid] = r[m.sid] || { name: m.name, page: '', path: '', at: now, thumb: null };
      r[m.sid].name = m.name; r[m.sid].at = now;
    } else if (m.kind === 'state') {
      var prev = r[m.sid] || {};
      r[m.sid] = {
        name: m.name,
        page: m.page != null ? String(m.page) : (prev.page || ''),
        path: m.path != null ? String(m.path) : (prev.path || ''),
        at:   now,
        thumb: m.thumb || prev.thumb || null // 썸네일 없는 하트비트는 이전 그림 유지
      };
    } else if (m.kind === 'bye') {
      delete r[m.sid];
    }
    return r;
  }

  /* ── 생기 분류 — 타일 점 색 ─────────────────────────────────────── */
  function classify(now, at) {
    var d = now - at;
    if (d < FRESH_MS) return 'fresh';
    if (d < IDLE_MS)  return 'idle';
    return 'off';
  }

  /* ── 송신 판단기 — 래퍼가 매 틱 물어봄: "지금 보낼까?" ───────────── */
  function createSender() {
    var lastState = -Infinity, lastThumb = -Infinity, lastSig = ''; // 첫 요청은 즉시 송신
    return {
      plan: function (spotted) { return spotted ? PLAN.spot : PLAN.normal; },
      // 상태 하트비트 차례인가 (force = 페이지 이동 직후 즉시 송신)
      dueState: function (now, spotted, force) {
        var p = spotted ? PLAN.spot : PLAN.normal;
        if (force || now - lastState >= p.stateMs) { lastState = now; return true; }
        return false;
      },
      // 썸네일 차례인가 — 주기 + 내용 변화 + 품질 하한/상한 모두 통과해야
      dueThumb: function (now, spotted, dataUrl) {
        var p = spotted ? PLAN.spot : PLAN.normal;
        if (now - lastThumb < p.thumbMs) return false;
        if (!dataUrl || dataUrl.length < EMPTY_MIN) return false;  // 빈/검은 화면
        if (dataUrl.length > THUMB_MAX) return false;              // 페이로드 보호
        var sig = thumbSig(dataUrl);
        if (sig === lastSig) return false;                         // 안 변했으면 침묵
        lastThumb = now; lastSig = sig;
        return true;
      }
    };
  }

  // 값싼 지문: 길이 + 보폭 샘플 32자 (전체 해시는 과함 — 초당 수 회뿐)
  function thumbSig(s) {
    var step = Math.max(1, Math.floor(s.length / 32)), acc = s.length + ':';
    for (var i = 0; i < s.length; i += step) acc += s.charCodeAt(i) % 97;
    return acc;
  }

  /* ── 스포트라이트 리듀서 — 세 화면(교사·지목학생·나머지)의 단일 진실 ── */
  function spotReduce(cur, m) {
    if (!m || m.kind !== 'spotlight') return cur;
    return m.sid ? { sid: m.sid, name: m.name || '' } : null;
  }
  // 내 화면에서 뭘 보여줘야 하나: 'me'(배너) | 'watch'(친구 화면) | null
  function spotView(spot, mySid) {
    if (!spot) return null;
    return spot.sid === mySid ? 'me' : 'watch';
  }

  return {
    FRESH_MS: FRESH_MS, IDLE_MS: IDLE_MS, PLAN: PLAN,
    THUMB_MAX: THUMB_MAX, EMPTY_MIN: EMPTY_MIN, KINDS: KINDS.slice(),
    makeCode: makeCode, makeSid: makeSid, channelName: channelName, normCode: normCode,
    isValid: isValid, rosterReduce: rosterReduce, classify: classify,
    createSender: createSender, thumbSig: thumbSig,
    spotReduce: spotReduce, spotView: spotView
  };
});
