// =============================================
// K-edu 학습 추적 + 인증 가드 (kedu_tracker.js v2.4 — 2026-09-02)
// v2.4: 진단 창구 kedu.debug() — 조용히 삼키던 초기화 실패를 step/err 로 남긴다
// v2.3: 케이학습지 합류 — window.KEDU_LESSON_ID/UNIT, setLessonId(),
//       recordAnswer 개념 코드(concept_code)·오개념(misconception_code) 기록
//       — 열 이름은 케이학습지 원장(sql/setup_worksheet_bank.sql)과 같은 것을 쓴다
// 작성: 2026-04-28
// 명세: handoff/kedu/standards/데이터진단_표준.md
// 적합성: 학습데이터는 학급코드 학생만 저장. 방문집계(page_visits)는 익명·개인식별 없음.
//
// 페이지 사용:
//   <meta name="kedu-lesson-id" content="g1_korean_01_글자의짜임">
//   <script src="/kedu_config.js"></script>
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="/kedu_tracker.js"></script>
//
// 페이지 코드 API (선택):
//   window.kedu.recordAnswer(questionId, isCorrect, timeSpentSec, conceptId, meta)
//   window.kedu.setLessonId(id)   — 한 파일이 여러 차시/세트를 그리는 페이지(케이학습지)용
//   window.kedu.recordLessonEnd(score, total)
//   window.kedu.recordHomeworkDone(assignmentId)
//
// 저장 조건: 학급코드에 매핑된 student_profiles 보유자만.
// =============================================

(function(){
  // 중복 실행 방지 (v1과 다른 키로 공존 시 충돌 회피)
  if(window.__keduTrackerV2) return;
  window.__keduTrackerV2 = true;

  // 보호 경로 — 인증 필수
  var PROTECTED = /^\/(grade[1-6]|english)\/.+/;

  // 추적 제외 경로 — 허브·인증·관리 페이지
  var SKIP = /^\/(auth|admin|teacher)(\/|$)/;

  // 내부 상태
  var state = {
    client: null,
    session: null,
    profile: null,         // student_profiles row (없으면 null = 추적 X)
    lessonId: null,
    unitId: null,          // 기본 location.pathname. window.KEDU_LESSON_UNIT 로 덮어씀
    pageStartTs: null,
    step: 'created',       // v2.4 진단 — 초기화가 어디까지 갔나
    err: null              // v2.4 진단 — 삼켜지던 오류를 여기 남긴다
  };

  // v2.4 — 초기화 단계 표시. 조용한 실패를 kedu.debug() 로 볼 수 있게 한다.
  function mark(step, err){
    state.step = step;
    if(err) state.err = (err && err.message) ? err.message : String(err);
  }

  function init(){
    if(typeof window.supabase === 'undefined' ||
       typeof getKeduDb === 'undefined') {
      setTimeout(init, 200);
      return;
    }

    try {
      state.client = getKeduDb();
      mark('client');
      var path = location.pathname;

      // --- 방문 집계 (익명, 개인식별 없음) ---
      // page_visits: page_path + 임의 세션ID만 기록. 사용자 정보 저장 X.
      // 로그인 여부와 무관하게 동작 (관리자 대시보드 방문 통계용).
      logVisit(path);

      // --- 인증 가드 (보호 경로) ---
      // 무로그인 = 즉시 /auth로 리다이렉트.
      // 단, kedu_config.js의 KEDU_AUTH_GATE === false면 게이트 OFF (작업·검증용).
      if(PROTECTED.test(path) && (typeof KEDU_AUTH_GATE === 'undefined' || KEDU_AUTH_GATE !== false)){
        state.client.auth.getSession().then(function(result){
          state.session = result.data.session || null;
          if(!state.session){
            var returnUrl = encodeURIComponent(location.href);
            location.replace('/auth/?redirect=' + returnUrl);
            return;
          }
          // 로그인 사용자 → student_profiles 조회 → 추적 활성화
          loadProfileAndStart(path);
        });
        return;
      }

      // --- 비보호 경로 ---
      if(SKIP.test(path)) return;

      // 로그인 여부 확인. 무로그인 = 저장 X.
      mark('getSession');
      state.client.auth.getSession().then(function(result){
        state.session = result.data.session || null;
        if(!state.session){ mark('no-session'); return; }   // 무로그인 → 추적 X (적합성)
        mark('session-ok');
        loadProfileAndStart(path);
      }, function(e){ mark('getSession-failed', e); });

    } catch(e){
      // 추적 실패해도 페이지 동작 영향 없음 — 다만 v2.4부터 흔적은 남긴다
      mark('init-threw', e);
    }
  }

  // ============================================
  // 익명 방문 집계 (page_visits)
  // 저장 항목: page_path, session_id(임의 난수), visited_at(서버 default)
  // 개인식별 정보 저장 없음. 학습 데이터(scores 등)와 완전히 분리.
  // ============================================
  function logVisit(path){
    // 관리·인증 페이지는 집계 제외
    if(SKIP.test(path)) return;

    try {
      // 탭 단위 세션ID (유니크 방문자 계산용, 개인식별 불가)
      var sessionId = sessionStorage.getItem('kedu_visit_session');
      if(!sessionId){
        sessionId = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
        sessionStorage.setItem('kedu_visit_session', sessionId);
      }

      // 같은 세션 내 같은 페이지는 1회만 기록
      var pageKey = 'kedu_visited_' + path;
      if(sessionStorage.getItem(pageKey)) return;
      sessionStorage.setItem(pageKey, '1');

      state.client.from('page_visits').insert({
        page_path: path,
        session_id: sessionId
      }).then(function(){}).catch(function(){});
    } catch(e){
      // 집계 실패해도 페이지 동작 영향 없음
    }
  }

  // 학생 프로필 조회 → 학급코드 매핑 보유자만 추적
  function loadProfileAndStart(path){
    state.client.from('student_profiles')
      .select('id, class_code_id, grade')
      .eq('user_id', state.session.user.id)
      .maybeSingle()
      .then(function(res){
        if(res && res.error) { mark('profile-error', res.error); return; }
        if(!res || !res.data) { mark('profile-none'); return; }
        if(!res.data.class_code_id) { mark('profile-no-class'); return; }
        state.profile = res.data;
        mark('tracking');

        // last_seen_at 갱신
        state.client.from('student_profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', state.profile.id)
          .then(function(){}).catch(function(){});

        // 차시 시작 기록
        startLesson(path);
      })
      .catch(function(e){ mark('profile-threw', e); });
  }

  function resolveLessonId(path){
    // 0순위: window.KEDU_LESSON_ID — 한 파일이 여러 세트를 그리는 페이지(케이학습지 play.html)
    if(window.KEDU_LESSON_ID) return String(window.KEDU_LESSON_ID).trim();

    // 1순위: <meta name="kedu-lesson-id">
    var meta = document.querySelector('meta[name="kedu-lesson-id"]');
    if(meta && meta.content) return meta.content.trim();

    // 2순위: 파일명에서 .html 제거
    var m = path.match(/\/([^\/]+)\.html?$/i);
    if(m) return m[1];

    // 3순위: path 그대로
    return path;
  }

  function startLesson(path){
    state.lessonId = resolveLessonId(path);
    state.unitId   = window.KEDU_LESSON_UNIT ? String(window.KEDU_LESSON_UNIT) : location.pathname;
    state.pageStartTs = Date.now();
    // 차시 시작 자체는 별도 INSERT 안 함.
    // 첫 recordAnswer 시점에 스코어가 쌓이고, recordLessonEnd가 누계 기록.
  }

  // ============================================
  // 공개 API (페이지 코드가 호출)
  // ============================================
  window.kedu = window.kedu || {};

  /**
   * 문제 1건 풀이 결과 저장.
   * - scores INSERT
   * - 오답: wrong_answers UPSERT (attempts+1)
   * - 정답: 기존 미해결 wrong_answers를 resolved 처리
   *
   * @param {string}  questionId    차시 내 문제 식별자 (예: 'q1', 'q12')
   * @param {boolean} isCorrect     정오
   * @param {number}  timeSpentSec  풀이 소요 초 (없으면 0)
   * @param {number|string} conceptId  lesson_concepts.id (숫자) 또는 개념 코드 문자열
   *                                    (케이학습지 'M1-1-C2' — concept_code 열로 간다)
   * @param {object}  meta          { mis:'M07' } 오개념 코드 등 (선택)
   */
  window.kedu.recordAnswer = function(questionId, isCorrect, timeSpentSec, conceptId, meta){
    if(!state.profile || !state.lessonId) return;

    var row = {
      student_id:   state.profile.id,
      lesson_id:    state.lessonId,
      unit_id:      state.unitId || location.pathname,
      question_id:  String(questionId),
      is_correct:   !!isCorrect,
      time_spent_sec: Number(timeSpentSec) || 0,
      score:        isCorrect ? 1 : 0,
      max_score:    1
    };
    // 숫자면 lesson_concepts FK, 문자열이면 개념 코드(학습지 원장 문법)
    if(conceptId || conceptId === 0){
      if(typeof conceptId === 'number' || /^\d+$/.test(String(conceptId))) row.concept_id = Number(conceptId);
      else row.concept_code = String(conceptId);
    }
    if(meta && meta.mis) row.misconception_code = String(meta.mis);

    state.client.from('scores').insert(row)
      .then(function(){}).catch(function(){});

    if(!isCorrect){
      // 오답노트 UPSERT (수동 — supabase-js .upsert는 onConflict 컬럼 필요)
      state.client.from('wrong_answers')
        .select('id, attempts')
        .eq('student_id', state.profile.id)
        .eq('lesson_id', state.lessonId)
        .eq('question_id', String(questionId))
        .maybeSingle()
        .then(function(res){
          if(res && res.data){
            state.client.from('wrong_answers')
              .update({
                attempts: (res.data.attempts || 1) + 1,
                last_wrong_at: new Date().toISOString(),
                resolved_at: null
              })
              .eq('id', res.data.id)
              .then(function(){}).catch(function(){});
          } else {
            state.client.from('wrong_answers')
              .insert({
                student_id:   state.profile.id,
                lesson_id:    state.lessonId,
                question_id:  String(questionId),
                attempts:     1,
                last_wrong_at: new Date().toISOString()
              })
              .then(function(){}).catch(function(){});
          }
        })
        .catch(function(){});
    } else {
      // 정답 → 미해결 오답 resolved 처리
      state.client.from('wrong_answers')
        .update({ resolved_at: new Date().toISOString() })
        .eq('student_id', state.profile.id)
        .eq('lesson_id', state.lessonId)
        .eq('question_id', String(questionId))
        .is('resolved_at', null)
        .then(function(){}).catch(function(){});
    }
  };

  /**
   * 차시 종료 — 누계 점수 기록.
   * 진단 status는 student_lesson_progress 뷰가 자동 산출.
   *
   * @param {number} score  획득 점수 (또는 정답 수)
   * @param {number} total  총점 (또는 총 문제 수)
   */
  window.kedu.recordLessonEnd = function(score, total){
    if(!state.profile || !state.lessonId) return;
    var totalSec = state.pageStartTs
      ? Math.floor((Date.now() - state.pageStartTs) / 1000)
      : null;
    state.client.from('scores').insert({
      student_id:   state.profile.id,
      lesson_id:    state.lessonId,
      unit_id:      state.unitId || location.pathname,
      question_id:  '_lesson_summary_',
      is_correct:   null,
      score:        Number(score) || 0,
      max_score:    Number(total) || 0,
      time_spent_sec: totalSec
    }).then(function(){}).catch(function(){});
  };

  /**
   * 숙제 완료 표시.
   * @param {number} assignmentId homework_assignments.id
   */
  window.kedu.recordHomeworkDone = function(assignmentId){
    if(!state.profile || !assignmentId) return;
    state.client.from('homework_completions').upsert({
      assignment_id: Number(assignmentId),
      student_id:    state.profile.id,
      completed_at:  new Date().toISOString()
    }, { onConflict: 'assignment_id,student_id' })
      .then(function(){}).catch(function(){});
  };

  /**
   * 차시/세트 전환 — 한 파일이 여러 개를 그리는 페이지(케이학습지 play.html)용.
   * 시간 기준도 여기서 다시 시작한다.
   * @param {string} id      lesson_id (예: 'ws:g1_math_u1_L02_basic')
   * @param {string} unitId  선택 — 되돌아갈 경로 (기본 현재 경로)
   */
  window.kedu.setLessonId = function(id, unitId){
    if(!id) return;
    state.lessonId = String(id).trim();
    if(unitId) state.unitId = String(unitId);
    state.pageStartTs = Date.now();
  };

  /**
   * 페이지 코드용 — 현재 추적 활성화 여부.
   * 학생이 학급코드 미매핑이면 false, 페이지는 정상 동작.
   */
  window.kedu.isTracking = function(){
    return !!state.profile;
  };

  /**
   * v2.4 — 왜 기록이 안 되는지 한 줄로 보는 창구.
   * step 이 'tracking' 이 아니면 그 값이 멈춘 지점이다.
   *   no-session / profile-none / profile-no-class / profile-error / init-threw ...
   */
  window.kedu.debug = function(){
    return {
      version:    '2.4',
      step:       state.step,
      err:        state.err,
      hasSession: !!state.session,
      studentId:  state.profile ? state.profile.id : null,
      lessonId:   state.lessonId,
      unitId:     state.unitId,
      autowired:  window.kedu.autowired || null
    };
  };

  // ============================================
  // 엔진 자동 배선 (v2.1, 2026-08-31) — 케이학습리포트 재료
  //   차시 페이지가 recordAnswer/recordLessonEnd 를 직접 부르지 않아도,
  //   알려진 엔진 가족의 상태 전이를 잡아 같은 기록을 남긴다. 페이지 수정 0.
  //   ① KA 가족(수학·과학 3~6학년 등 469차시): getQState(qid) 상태의
  //      solved=true → 정답, wrongCount++ → 오답, saveProgress(true) → 차시 끝
  //   ② 사회 state.q 가족(5·6학년 사회 41차시): state.q[i].done=true → 정답,
  //      wrongCount++ → 오답 (차시 끝은 페이지가 직접 recordLessonEnd 호출)
  //   ③ pick 가족(1학년 활동형 6차시): [data-answer] 묶음의 [data-pick] 클릭 정오,
  //      차시 끝은 마지막 슬라이드 도달 시 (누계 점수는 keduTracker.recordScore 수신)
  //   끄기: <meta name="kedu-autowire" content="off">
  //   중복 방지: 페이지가 recordAnswer 를 직접 부르는 가족은 위 구조가 없다
  //   (tests/test_kedu_autowire.js 가 정적으로 강제).
  // ============================================
  function G(name){ try { return (0, eval)(name); } catch(e){ return undefined; } }

  function hookProp(obj, prop, onChange){
    if(!obj || typeof obj !== 'object') return;
    var d = Object.getOwnPropertyDescriptor(obj, prop);
    if(!d || !('value' in d) || !d.configurable) return;   // 이미 접근자면 손대지 않음
    var v = d.value;
    Object.defineProperty(obj, prop, {
      enumerable: true, configurable: true,
      get: function(){ return v; },
      set: function(nv){ var ov = v; v = nv; try { onChange(ov, nv); } catch(e){} }
    });
  }

  function autowireKA(){
    if(typeof window.getQState !== 'function' || typeof window.saveProgress !== 'function') return false;
    var orig = window.getQState;
    var hooked = new WeakSet();
    window.getQState = function(qid){
      var st = orig.apply(this, arguments);
      if(st && typeof st === 'object' && !hooked.has(st)){
        hooked.add(st);
        hookProp(st, 'solved', function(ov, nv){ if(nv === true && ov !== true) window.kedu.recordAnswer(qid, true, null, null); });
        hookProp(st, 'wrongCount', function(ov, nv){ if(typeof nv === 'number' && nv > (ov || 0)) window.kedu.recordAnswer(qid, false, null, null); });
      }
      return st;
    };
    var origSave = window.saveProgress, ended = false;
    window.saveProgress = function(done){
      if(done && !ended){
        ended = true;
        var total = 0;
        document.querySelectorAll('[data-q-points]').forEach(function(el){ total += parseInt(el.getAttribute('data-q-points'), 10) || 0; });
        var sc = G('score'); if(typeof sc !== 'number') sc = 0;
        window.kedu.recordLessonEnd(sc, total);
      }
      return origSave.apply(this, arguments);
    };
    return true;
  }

  function autowireSocial(){
    var st = G('state');
    if(!st || typeof st !== 'object' || !Array.isArray(st.q)) return false;
    st.q.forEach(function(qs, i){
      if(!qs || typeof qs !== 'object') return;
      var qid = 'q' + (i + 1);
      hookProp(qs, 'done', function(ov, nv){ if(nv === true && ov !== true) window.kedu.recordAnswer(qid, true, null, null); });
      hookProp(qs, 'wrongCount', function(ov, nv){ if(typeof nv === 'number' && nv > (ov || 0)) window.kedu.recordAnswer(qid, false, null, null); });
    });
    return true;
  }

  // ③ pick 가족 (1학년 활동형 6차시: g1 math u4_01~05·07)
  //    묶음 [data-answer] 안의 선택지 [data-pick] 클릭 → 정오.
  //    qid 는 묶음의 숫자형 data-* (data-ap/tos/wlc/reason/q = 슬라이드 번호), 없으면 순번.
  //    차시 끝은 마지막 슬라이드 도달 시 1회. 누계 점수는 페이지가 부르던
  //    window.keduTracker.recordScore(id, score) 를 받아 두었다가 그때 함께 보낸다.
  function pickQid(g, i){
    var a = g.attributes;
    for(var k = 0; k < a.length; k++){
      var n = a[k].name;
      if(n.indexOf('data-') !== 0 || n === 'data-answer' || n === 'data-pick') continue;
      if(/^\d+$/.test(a[k].value)) return 'q' + a[k].value;
    }
    return 'q' + (i + 1);
  }

  function pickMaxScore(){
    var total = 0, sc = document.scripts;
    for(var i = 0; i < sc.length; i++){
      if(sc[i].src) continue;
      var t = sc[i].textContent || '';
      (t.match(/addScore\(\s*\d+\s*\)/g) || []).forEach(function(m){ total += parseInt(m.replace(/\D/g, ''), 10) || 0; });
      (t.match(/attempts\s*===\s*1\s*\?\s*\d+/g) || []).forEach(function(m){ total += parseInt(m.replace(/\D/g, ''), 10) || 0; });
    }
    return total;
  }

  function bindActivityEnd(){
    var lastScore = 0, ended = false, total = pickMaxScore();
    window.keduTracker = window.keduTracker || {};
    if(typeof window.keduTracker.recordScore !== 'function'){
      window.keduTracker.recordScore = function(_lessonId, score){ lastScore = Number(score) || 0; };
    }
    function end(){
      if(ended) return;
      ended = true;
      window.kedu.recordLessonEnd(lastScore, total);
    }
    function atLast(){
      var c = G('cur'), t = G('TOTAL');
      return typeof c === 'number' && typeof t === 'number' && c >= t - 1;
    }
    var origNext = window.goNext;
    if(typeof origNext === 'function'){
      window.goNext = function(){
        if(atLast()) end();                       // 마지막 슬라이드에서 한 번 더 = 나가기
        var r = origNext.apply(this, arguments);
        if(atLast()) end();                       // 마지막 슬라이드에 막 도착
        return r;
      };
    }
    window.addEventListener('pagehide', function(){ if(atLast()) end(); });
  }

  function autowirePick(){
    var groups = [], all = document.querySelectorAll('[data-answer]');
    for(var i = 0; i < all.length; i++){ if(all[i].querySelector('[data-pick]')) groups.push(all[i]); }
    if(!groups.length) return false;
    groups.forEach(function(g, i){
      var qid = pickQid(g, i), ans = g.getAttribute('data-answer'), solved = false;
      g.addEventListener('click', function(e){
        if(solved) return;
        var b = e.target && e.target.closest ? e.target.closest('[data-pick]') : null;
        if(!b || !g.contains(b)) return;
        if(b.getAttribute('data-pick') === ans){ solved = true; window.kedu.recordAnswer(qid, true, null, null); }
        else window.kedu.recordAnswer(qid, false, null, null);
      }, true);
    });
    bindActivityEnd();
    return true;
  }

  function autowire(){
    var meta = document.querySelector('meta[name="kedu-autowire"]');
    if(meta && /^off$/i.test(meta.content || '')) return;
    if(!document.querySelector('meta[name="kedu-lesson-id"]')) return;  // 차시 메타 없는 페이지는 대상 아님
    try {
      window.kedu.autowired = autowireKA() ? 'ka'
        : (autowireSocial() ? 'social'
        : (autowirePick() ? 'pick' : null));
    } catch(e){ window.kedu.autowired = null; }
  }

  // DOM 로드 후 실행
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ init(); autowire(); });
  } else {
    init(); autowire();
  }
})();

