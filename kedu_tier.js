// =====================================================================
// kedu_tier.js — 케이에듀 접근 단계 단일 진실 공급원 (2026-08-08 · 판정기 2026-08-26)
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
//
// 2026-08-26 공개 준비 §J-2 (생태계설계_v2_공개준비 §B·§E) — 열쇠 × 등급 판정기:
//   열쇠(누가)  = 위 사다리. account 이면서 teacher(승인) 이면 T.
//   등급(무엇을) = 콘텐츠 tier: open | class | class_rec | home  (경로 → tier 표 CONTENT_TIERS,
//                  DB 원장 contents.tier 는 같은 표의 거울 — sql/setup_contents_tier.sql)
//   판정 창구는 하나: KeduTier.can(tierObj, contentTier, contentGrade, opts) → {allow, reason, save}
//   집행자는 /kedu_gate.js — 페이지는 판정기를 직접 부르지 않는다.
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
        return resolveTeacher(db, session.user.id);
      }).catch(function () { return resolveTeacher(db, session.user.id); });
    }).catch(function () { return tierWithoutSession(); });
  }

  // account 세션 → 교사 행이 있으면 teacher 를 실어 준다(tier 값은 'account' 그대로 — 기존 호출자 호환).
  //   teacher.approved = approval 이 auto/approved (컬럼 없는 구버전 DB 는 행이 있으면 승인으로 본다)
  function resolveTeacher(db, userId) {
    return db.from('teachers').select('*').eq('user_id', userId).maybeSingle().then(function (r) {
      var t = r && !r.error && r.data;
      if (!t) return { tier: 'account' };
      var a = t.approval;
      return { tier: 'account', teacher: { id: t.id, approval: a === undefined ? 'approved' : a,
               approved: a === undefined || a === 'auto' || a === 'approved', is_admin: !!t.is_admin } };
    }).catch(function () { return { tier: 'account' }; });
  }

  function tierWithoutSession() {
    var g = readGuest();
    return g ? { tier: 'guest', guest: g } : { tier: 'visitor' };
  }

  // ── 등급 표 (경로 → tier). 앞 글자 일치, 위에서부터 첫 일치. null = 문 없음(도구·문서·입구) ──
  //   open      누구나 (자기주도·케이랩·뮤지엄·허브·케이영재 — 홍보 채널, 잠그지 않는다)
  //   class     교사가 학급에 열어주면 (기록 불필요)
  //   class_rec 교사가 열어주고 동의 학급만 (기록이 본질)
  //   home      L3 (지금은 빈 목록)
  var CONTENT_TIERS = [
    ['/classwork/', 'class_rec'], ['/morning/', 'class_rec'], ['/kbattle/', 'class_rec'], ['/live/', 'class_rec'],
    ['/kpark/', 'class'], ['/maker/', 'class'], ['/kmake/', 'class'], ['/maker-playground/', 'class'],
    ['/draw/', 'class'], ['/kple/', 'class'],
    ['/grade1/', 'open'], ['/grade2/', 'open'], ['/grade3/', 'open'], ['/grade4/', 'open'],
    ['/grade5/', 'open'], ['/grade6/', 'open'], ['/english/', 'open'], ['/gifted/', 'open'],
    ['/labs/', 'open'], ['/museum/', 'open'], ['/hub2/', 'open'], ['/kedu/hub/', 'open']
  ];

  function tierOfPath(path) {
    var p = (path || '').toLowerCase();
    for (var i = 0; i < CONTENT_TIERS.length; i++) {
      if (p.indexOf(CONTENT_TIERS[i][0]) === 0) return CONTENT_TIERS[i][1];
    }
    return null;
  }

  // 콘텐츠 학년: lesson-id(g3_…) → 경로(/grade3/ · /english/g3/) 순. 못 찾으면 null(전학년).
  function gradeOf(lessonId, path) {
    var m = /^g([1-6])_/.exec(lessonId || '');
    if (m) return +m[1];
    m = /^\/grade([1-6])\//.exec((path || '').toLowerCase());
    if (m) return +m[1];
    m = /^\/english\/g([1-6])\//.exec((path || '').toLowerCase());
    if (m) return +m[1];
    return null;
  }

  // 열쇠: L1 방문자 · L2g 동의 전 학급 · L2a 동의 학급 좌석 · T 승인 교사 · account(세션만·교사 아님/미승인)
  function keyOf(t) {
    if (!t) return 'L1';
    if (t.tier === 'student') return 'L2a';
    if (t.tier === 'guest') return 'L2g';
    if (t.tier === 'account') return (t.teacher && t.teacher.approved) ? 'T' : 'account';
    return 'L1';
  }

  function keyGrade(t) {
    if (!t) return null;
    if (t.tier === 'student' && t.profile) return t.profile.grade || null;
    if (t.tier === 'guest' && t.guest) return t.guest.grade || null;
    return null;
  }

  // ── 학년 잠금 스위치 (§E A5) ──────────────────────────────────────
  //   false = 무른 모드: 학년이 달라도 통과시키고 결과에 gradeMismatch 만 표시한다.
  //   true  = 굳은 모드: L2 가 다른 학년 콘텐츠를 열면 잠근다(우리 반 방으로).
  //   2026-08-26 무른 모드로 둔 이유 둘 — 굳히기 전에 둘 다 풀려야 한다:
  //     ① class_codes.grade 가 학급 생성 때 늘 1로 박혀 실데이터가 아니다(교사 화면에 학년 선택을 달았지만
  //        기존 학급은 교사가 한 번 바꿔 줘야 한다) ② 입구(index.html)가 학급 세션에도 전 학년을 고르게 한다.
  var GRADE_LOCK = false;

  // ── 개방 잠금 스위치 (§B class·class_rec × L2) ──────────────────────
  //   false = 무른 모드: 학급 세션(L2g·L2a)은 개방 목록 없이도 class·class_rec 을 연다(동의 규칙은 그대로).
  //   true  = 굳은 모드: 교사가 「우리 반에 열기」로 열어준 것만 통과.
  //   2026-08-26 무른 모드 — §J-3 「우리 반에 열기」가 라이브에 오르기 전엔 열쇠 없는 문이라 학급이 통째로 막힌다.
  //   방문자(L1)는 스위치와 무관하게 잠긴다(보이되 잠김).
  var OPENING_LOCK = false;

  // ── 판정 (§B 표 + §E 우선순위) ──────────────────────────────────
  //   can(t, contentTier, contentGrade, {opened:boolean}) → {allow, reason, save, key}
  //   reason: 'teacher' | 'opened' | 'open' | 'free' | 'grade' | 'consent' | 'locked' | 'home'
  //   ① T 교사 → 전부 ② L2 + 개방/배정 목록 → 통과(학년 불문, 저장은 동의 학급만)
  //   ③ L2 + 학년 일치 + open → 통과 ④ L1 + open → 통과 ⑤ 그 외 → 잠금(보이되 잠김)
  function can(t, contentTier, contentGrade, opts) {
    var key = keyOf(t);
    var opened = !!(opts && opts.opened);
    var saveOk = key === 'L2a';
    if (!contentTier) return { allow: true, reason: 'free', save: saveOk, key: key };
    if (key === 'T') return { allow: true, reason: 'teacher', save: false, key: key };
    if (contentTier === 'home') return { allow: false, reason: 'home', save: false, key: key };

    var isClass = key === 'L2g' || key === 'L2a';
    if (isClass && contentTier !== 'open' && !(window.KeduTier && window.KeduTier.OPENING_LOCK)) opened = true;   // 무른 모드: class·class_rec 은 학급이면 열린 것으로(open 의 학년 규칙은 별개)
    if (isClass && opened) {
      if (contentTier === 'class_rec' && key === 'L2g') return { allow: false, reason: 'consent', save: false, key: key };
      return { allow: true, reason: 'opened', save: saveOk, key: key };
    }
    if (contentTier === 'open') {
      if (isClass) {
        var g = keyGrade(t);
        if (g && contentGrade && g !== contentGrade) {
          if (window.KeduTier && window.KeduTier.GRADE_LOCK) return { allow: false, reason: 'grade', save: false, key: key, myGrade: g };
          return { allow: true, reason: 'open', save: saveOk, key: key, gradeMismatch: true, myGrade: g };
        }
        return { allow: true, reason: 'open', save: saveOk, key: key };
      }
      return { allow: true, reason: 'open', save: false, key: key };   // L1 · account: 전 학년 자유, 저장 없음
    }
    // class · class_rec 인데 열어준 적 없음
    if (isClass && contentTier === 'class_rec' && key === 'L2g') return { allow: false, reason: 'consent', save: false, key: key };
    return { allow: false, reason: 'locked', save: false, key: key };
  }

  // ── 공개 API ──────────────────────────────────────────────────────
  window.KeduTier = {
    GRADE_LOCK: GRADE_LOCK,    // 학년 잠금 스위치 — 위 주석의 둘이 풀리면 true
    OPENING_LOCK: OPENING_LOCK,// 개방 잠금 스위치 — §J-3 「우리 반에 열기」 라이브 후 true
    CONTENT_TIERS: CONTENT_TIERS,
    tierOfPath: tierOfPath,    // 경로 → 콘텐츠 tier
    gradeOf: gradeOf,          // lesson-id·경로 → 학년
    keyOf: keyOf,              // tierObj → 열쇠
    can: can,                  // 열쇠 × 등급 판정 — 유일한 창구
    resolve: resolve,          // async 전체 판별
    guest: readGuest,          // 동기 — 게스트 상태만
    enterGuest: enterGuest,    // 게스트 입장 시도
    clearGuest: clearGuest,    // 게스트 나가기
    canSave: function (tierObj) {   // 서버 저장 허용 여부 — 유일한 판정 창구
      return !!(tierObj && tierObj.tier === 'student');
    }
  };
})();
