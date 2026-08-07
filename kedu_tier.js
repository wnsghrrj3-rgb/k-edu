// =====================================================================
// kedu_tier.js — 케이에듀 접근 단계 단일 진실 공급원 (2026-08-08)
//
// 사다리 (생태계설계_v1 §3 + 준호 지시 2026-08-08):
//   visitor  방문자          — 코드 없음. 서버 저장 0, 신원 0.
//   guest    우리 반 구경     — 학급코드만(동의 전). 서버 저장 0, 이름 0.
//                              상태는 이 기기 localStorage뿐, 자정 만료.
//   student  우리 반(동의)   — claim_seat 좌석. 기록 저장·교사 관리 대상.
//   account  로그인(학생 아님) — 세션은 있으나 학생 좌석 없음(교사 등).
//                              교사 판정·권한은 교사 도구가 자체 수행.
//
// 규약:
//   · 저장 가능 여부는 반드시 KeduTier.canSave()로 판정한다.
//     guest/visitor에서 서버 기록을 남기는 코드는 컴플라이언스 위반.
//   · guest 상태는 이 파일만 읽고 쓴다(키: kedu_guest_v1).
//   · 게스트 입장은 익명 인증조차 만들지 않는다 — 서버 발자국 0.
// =====================================================================
(function () {
  'use strict';

  var LS_KEY = 'kedu_guest_v1';

  // ── 게스트 상태 (localStorage, 자정 만료) ─────────────────────────
  function readGuest() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      var g = JSON.parse(raw);
      if (!g || !g.code || !g.day) { localStorage.removeItem(LS_KEY); return null; }
      if (g.day !== todayKey()) { localStorage.removeItem(LS_KEY); return null; } // 자정 만료
      return g;
    } catch (e) { return null; }
  }

  function setGuest(code, label, grade) {
    var g = { code: code, label: label || code, grade: grade || null, day: todayKey() };
    try { localStorage.setItem(LS_KEY, JSON.stringify(g)); } catch (e) {}
    return g;
  }

  function clearGuest() {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  // ── 게스트 입장 — peek_class RPC (읽기 전용, 행 생성 0) ───────────
  // 반환: {status:'ok', guest} | {status:'not_found'} | {status:'error'}
  function enterGuest(db, code) {
    var clean = (code || '').trim().toUpperCase();
    if (clean.length < 4) return Promise.resolve({ status: 'not_found' });
    return db.rpc('peek_class', { p_class_code: clean }).then(function (res) {
      if (res.error) return { status: 'error' };
      var d = res.data;
      if (!d || d.status !== 'ok') return { status: 'not_found' };
      var g = setGuest(clean, d.class_label, d.grade);
      g.consent_class = d.consent_class === true;
      return { status: 'ok', guest: g };
    }).catch(function () { return { status: 'error' }; });
  }

  // ── 단계 판별 ─────────────────────────────────────────────────────
  // resolve(db) → Promise<{tier, guest?, profile?}>
  //   student 판정 = 세션 + my_seat_class ok (기존 홈 로직과 동일 기준)
  function resolve(db) {
    return db.auth.getSession().then(function (r) {
      var session = r && r.data && r.data.session;
      if (!session || !session.user) return tierWithoutSession();
      return db.rpc('my_seat_class').then(function (res) {
        if (!res.error && res.data && res.data.status === 'ok' && res.data.profile_id) {
          clearGuest(); // 정식 좌석이 생기면 게스트 흔적 정리
          return { tier: 'student', profile: res.data };
        }
        return { tier: 'account' };
      }).catch(function () { return { tier: 'account' }; });
    }).catch(function () { return tierWithoutSession(); });
  }

  function tierWithoutSession() {
    var g = readGuest();
    return g ? { tier: 'guest', guest: g } : { tier: 'visitor' };
  }

  // ── 공개 API ──────────────────────────────────────────────────────
  window.KeduTier = {
    resolve: resolve,          // async 전체 판별
    guest: readGuest,          // 동기 — 게스트 상태만
    enterGuest: enterGuest,    // 게스트 입장 시도
    clearGuest: clearGuest,    // 게스트 나가기
    canSave: function (tierObj) {   // 서버 저장 허용 여부 — 유일한 판정 창구
      return !!(tierObj && tierObj.tier === 'student');
    }
  };
})();
