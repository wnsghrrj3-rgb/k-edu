// =============================================
// K-edu 학습 추적 + 인증 가드 (kedu_tracker.js v2)
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
//   window.kedu.recordAnswer(questionId, isCorrect, timeSpentSec, conceptId)
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
    pageStartTs: null
  };

  function init(){
    if(typeof window.supabase === 'undefined' ||
       typeof getKeduDb === 'undefined') {
      setTimeout(init, 200);
      return;
    }

    try {
      state.client = getKeduDb();
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
      state.client.auth.getSession().then(function(result){
        state.session = result.data.session || null;
        if(!state.session) return;        // 무로그인 → 추적 X (적합성)
        loadProfileAndStart(path);
      });

    } catch(e){
      // 추적 실패해도 페이지 동작 영향 없음
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
        if(!res || !res.data || !res.data.class_code_id) {
          // 학급코드 미매핑 = 추적 X (교사·학부모·미가입학생)
          return;
        }
        state.profile = res.data;

        // last_seen_at 갱신
        state.client.from('student_profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', state.profile.id)
          .then(function(){}).catch(function(){});

        // 차시 시작 기록
        startLesson(path);
      })
      .catch(function(){ /* silent */ });
  }

  function resolveLessonId(path){
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
   * @param {number}  conceptId     lesson_concepts.id (선택)
   */
  window.kedu.recordAnswer = function(questionId, isCorrect, timeSpentSec, conceptId){
    if(!state.profile || !state.lessonId) return;

    var row = {
      student_id:   state.profile.id,
      lesson_id:    state.lessonId,
      unit_id:      location.pathname,
      question_id:  String(questionId),
      is_correct:   !!isCorrect,
      time_spent_sec: Number(timeSpentSec) || 0,
      score:        isCorrect ? 1 : 0,
      max_score:    1
    };
    if(conceptId) row.concept_id = conceptId;

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
      unit_id:      location.pathname,
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
   * 페이지 코드용 — 현재 추적 활성화 여부.
   * 학생이 학급코드 미매핑이면 false, 페이지는 정상 동작.
   */
  window.kedu.isTracking = function(){
    return !!state.profile;
  };

  // ============================================
  // 엔진 자동 배선 (v2.1, 2026-08-31) — 케이학습리포트 재료
  //   차시 페이지가 recordAnswer/recordLessonEnd 를 직접 부르지 않아도,
  //   알려진 엔진 가족의 상태 전이를 잡아 같은 기록을 남긴다. 페이지 수정 0.
  //   ① KA 가족(수학·과학 3~6학년 등 469차시): getQState(qid) 상태의
  //      solved=true → 정답, wrongCount++ → 오답, saveProgress(true) → 차시 끝
  //   ② 사회 state.q 가족(5·6학년 사회 41차시): state.q[i].done=true → 정답,
  //      wrongCount++ → 오답 (차시 끝은 페이지가 직접 recordLessonEnd 호출)
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

  function autowire(){
    var meta = document.querySelector('meta[name="kedu-autowire"]');
    if(meta && /^off$/i.test(meta.content || '')) return;
    if(!document.querySelector('meta[name="kedu-lesson-id"]')) return;  // 차시 메타 없는 페이지는 대상 아님
    try { window.kedu.autowired = autowireKA() ? 'ka' : (autowireSocial() ? 'social' : null); } catch(e){ window.kedu.autowired = null; }
  }

  // DOM 로드 후 실행
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ init(); autowire(); });
  } else {
    init(); autowire();
  }
})();
