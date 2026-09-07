// =============================================
// 케이학습지 쪽지 어댑터 (kedu_quiz.js v1)
// 작성: 2026-08-31
// 명세: handoff/kedu/평가모듈_설계_v1.md §11 E1
//
// 역할 둘뿐:
//   ① 원장에서 조립된 쪽지 한 벌을 받아온다  → get_quiz_set(set_id) RPC
//   ② 학생이 답한 사실을 scores 에 남긴다     → 개념·오개념 코드까지 함께
//
// 파일 학습지(play.html?set=…)에는 아무 영향이 없다. ?quiz= 일 때만 로드된다.
// 사용:
//   <script src="/kedu_config.js"></script>
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="/kedu_quiz.js"></script>
//   await window.keduQuiz.ready();
//   const data = await window.keduQuiz.load(setId);
//   window.keduQuiz.record({...});
// =============================================

(function(){
  if (window.keduQuiz) return;

  var state = { db:null, profile:null, setId:null, setMeta:null, misNames:{} };
  var readyP = null;

  function waitLib(){
    return new Promise(function(res){
      (function tick(){
        if (typeof window.supabase !== 'undefined' && typeof getKeduDb !== 'undefined') return res();
        setTimeout(tick, 150);
      })();
    });
  }

  function ready(){
    if (readyP) return readyP;
    readyP = waitLib().then(function(){
      state.db = getKeduDb();
      return state.db.auth.getSession();
    }).then(function(r){
      if (!r || !r.data || !r.data.session) return null;   // 무로그인 → 기록 없음(적합성)
      return state.db.from('student_profiles')
        .select('id, class_code_id')
        .eq('user_id', r.data.session.user.id)
        .maybeSingle()
        .then(function(res){ state.profile = (res && res.data) || null; return state.profile; });
    }).catch(function(){ return null; });
    return readyP;
  }

  // ---------------------------------------------
  // ① 쪽지 받아오기
  //   반환 모양은 파일 학습지 JSON 과 같다 — play.html 은 출처를 몰라도 된다.
  //   열려 있지 않거나 없는 세트면 null.
  // ---------------------------------------------
  function load(setId){
    return ready().then(function(){
      if (!state.db) return null;
      return state.db.rpc('get_quiz_set', { p_set_id: setId });
    }).then(function(res){
      if (!res || res.error || !res.data) return null;
      var d = res.data;
      state.setId = setId;
      state.setMeta = d;
      loadMisNames(d);
      return {
        set:      setId,
        kind:     d.kind === 'unit_test' ? 'unit_review' : 'quiz',
        title:    d.title || '쪽지',
        header:   (d.grade ? d.grade + '학년' : '') + ' 쪽지',
        grade:    d.grade,
        subject:  d.subject,
        unit:     d.unit,
        show_result: d.show_result || 'immediate',
        // W2(2026-09-07): 서버가 「정오·해설을 보여도 되는가」를 정한다. 옛 get_quiz_set(v1)은 이 키가 없다 → 즉시 공개로 해석.
        reveal:   (d.reveal == null) ? true : !!d.reveal,
        closed:   !!d.closed,
        time_min: d.time_min || null,
        questions: (d.questions || []).map(function(q, i){
          q.seq = q.seq || (i + 1);
          return q;
        })
      };
    }).catch(function(){ return null; });
  }

  // 마무리 화면의 「이번에 연습할 것」 이름을 사전에서 가져온다(하드코딩 대신).
  function loadMisNames(d){
    try {
      var codes = {};
      (d.questions || []).forEach(function(q){
        (q.options || []).concat(q.reason_options || []).forEach(function(o){
          if (o && o.mis) codes[o.mis] = 1;
        });
      });
      var list = Object.keys(codes);
      if (!list.length || !state.db) return;
      state.db.from('misconceptions').select('code, title, teacher_hint').in('code', list)
        .then(function(res){
          ((res && res.data) || []).forEach(function(m){ state.misNames[m.code] = m.teacher_hint || m.title; });
        });
    } catch(e){}
  }

  function misName(code){ return state.misNames[code] || null; }

  // ---------------------------------------------
  // ② 답 한 건 기록
  //   scores 한 행. quiz_set_id·question_bank_id·concept_code·misconception_code 까지
  //   채워야 오개념 분포(quiz_misconception_dist)가 산다.
  //   교사 미리보기(student_profiles 없음)는 조용히 건너뛴다.
  // ---------------------------------------------
  function record(o){
    if (!state.profile || !state.db || !state.setId) return;
    var row = {
      student_id:    state.profile.id,
      lesson_id:     'quiz:' + state.setId,
      unit_id:       location.pathname,
      question_id:   String(o.questionId || ''),
      is_correct:    !!o.ok,
      time_spent_sec: Number(o.sec) || 0,
      score:         o.ok ? 1 : 0,
      max_score:     1,
      quiz_set_id:   state.setId,
      concept_code:  o.concept || null,
      misconception_code: o.ok ? null : (o.mis || null)
    };
    if (o.qid) row.question_bank_id = o.qid;
    state.db.from('scores').insert(row).then(function(){}).catch(function(){});
  }

  // 쪽지 끝 — 누계 한 줄(리포트의 runs·마지막 점수 재료)
  function recordEnd(score, total, sec){
    if (!state.profile || !state.db || !state.setId) return;
    state.db.from('scores').insert({
      student_id:   state.profile.id,
      lesson_id:    'quiz:' + state.setId,
      unit_id:      location.pathname,
      question_id:  '_lesson_summary_',
      is_correct:   null,
      score:        Number(score) || 0,
      max_score:    Number(total) || 0,
      time_spent_sec: Number(sec) || null,
      quiz_set_id:  state.setId
    }).then(function(){}).catch(function(){});
  }

  function isTracking(){ return !!state.profile; }

  window.keduQuiz = { ready: ready, load: load, record: record, recordEnd: recordEnd,
                      misName: misName, isTracking: isTracking };
})();
