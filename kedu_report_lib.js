// =============================================
// 케이학습리포트 공용 라이브러리 (kedu_report_lib.js v1)
// 명세: handoff/kedu/학습리포트_설계_v1.md
// 교사(R1)·학생(R2)·학부모(R3) 세 화면이 같은 집계 위의 세 스킨이 되도록
// 계산은 여기서 한 번만 짓는다 (설계 §0).
// 규칙 기반 — 외부 API 호출 없음.
// =============================================
(function(){
  'use strict';

  const SUBJECT_KO = {
    korean:'국어', math:'수학', science:'과학', social:'사회',
    english:'영어', hanja:'한자', chars:'한자', sents:'문장'
  };

  // ---- lesson_id → 사람이 읽는 이름 ----
  // 'g1_korean_01_글자의짜임' → {grade:1, subject:'국어', no:'01', name:'글자의 짜임', label:'국어 1. 글자의짜임'}
  function prettyLesson(lessonId){
    const raw = String(lessonId || '');
    const m = raw.match(/^g(\d)_([a-z]+)_(\d+)_(.+)$/i);
    if(!m) return { grade:null, subject:'', no:'', name:raw, label:raw };
    const subject = SUBJECT_KO[m[2].toLowerCase()] || m[2];
    return {
      grade: Number(m[1]), subject, no: m[3],
      name: m[4].replace(/_/g,' '),
      label: subject + ' ' + Number(m[3]) + '. ' + m[4].replace(/_/g,' ')
    };
  }

  // ---- KST 날짜 유틸 ----
  function kstDateStr(d){ // Date → 'YYYY-MM-DD' (Asia/Seoul)
    return new Date(d).toLocaleDateString('sv-SE', { timeZone:'Asia/Seoul' });
  }
  function mondayOf(dateStr){ // 'YYYY-MM-DD' → 그 주 월요일 'YYYY-MM-DD'
    const d = new Date(dateStr + 'T00:00:00+09:00');
    const day = (d.getUTCDay() + 6) % 7; // 월=0
    d.setUTCDate(d.getUTCDate() - day);
    return kstDateStr(d);
  }
  function addDays(dateStr, n){
    const d = new Date(dateStr + 'T00:00:00+09:00');
    d.setUTCDate(d.getUTCDate() + n);
    return kstDateStr(d);
  }
  function fmtMD(dateStr){
    return Number(dateStr.slice(5,7)) + '/' + Number(dateStr.slice(8,10));
  }

  // ---- 주간 집계 (설계 §1-①: 얼마나 했는가) ----
  // scores 행(is_correct 있는 문항 행 + _lesson_summary_ 행)과
  // report_morning_daily 행을 받아 최근 nWeeks 주를 만든다.
  // 반환: [{ weekStart, days:{'YYYY-MM-DD': {selfQ, selfLessons:Set, morning}}, 
  //          problems, correct, lessonsDone:Set, morningCount, activeDays }]
  function buildWeeks(scoreRows, morningRows, nWeeks){
    nWeeks = nWeeks || 3;
    const thisMonday = mondayOf(kstDateStr(new Date()));
    const weeks = [];
    const idx = {};
    for(let i = nWeeks - 1; i >= 0; i--){
      const ws = addDays(thisMonday, -7 * i);
      const w = { weekStart: ws, days:{}, problems:0, correct:0,
                  lessonsDone:new Set(), lessonsTouched:new Set(),
                  morningCount:0, activeDays:new Set() };
      for(let d = 0; d < 7; d++){
        w.days[addDays(ws, d)] = { selfQ:0, lessons:new Set(), morning:false };
      }
      weeks.push(w); idx[ws] = w;
    }
    (scoreRows || []).forEach(r => {
      const ds = kstDateStr(r.earned_at);
      const w = idx[mondayOf(ds)];
      if(!w || !w.days[ds]) return;
      w.activeDays.add(ds);
      if(r.question_id === '_lesson_summary_'){
        if(r.lesson_id) w.lessonsDone.add(r.lesson_id);
        return;
      }
      if(r.is_correct === null || r.is_correct === undefined) return;
      w.problems++; if(r.is_correct) w.correct++;
      w.days[ds].selfQ++;
      if(r.lesson_id){ w.days[ds].lessons.add(r.lesson_id); w.lessonsTouched.add(r.lesson_id); }
    });
    (morningRows || []).forEach(r => {
      const ds = r.run_date || kstDateStr(r.submitted_at);
      const w = idx[mondayOf(ds)];
      if(!w || !w.days[ds]) return;
      w.activeDays.add(ds);
      w.morningCount++;
      w.days[ds].morning = true;
    });
    return weeks;
  }

  // ---- 판정 정리 (설계 §1-②③) ----
  // masteryRows: report_lesson_mastery, wrongRows: wrong_answers
  // 반환 { solid:[], edge:[], weak:[], watching:[], repeatWrong:[] }
  // 취약 불변식: 1회 오답은 취약이 아니다 — 반복(attempts>=2, 미해결)만.
  function classify(masteryRows, wrongRows){
    const out = { solid:[], edge:[], weak:[], watching:[] };
    (masteryRows || []).forEach(r => {
      (out[r.status] || out.watching).push(r);
    });
    const repeatWrong = (wrongRows || []).filter(w =>
      (w.attempts || 0) >= 2 && !w.resolved_at
    ).sort((a,b) => (b.attempts||0) - (a.attempts||0));
    out.repeatWrong = repeatWrong;
    // 최신 시도가 앞에 오도록
    ['solid','edge','weak','watching'].forEach(k =>
      out[k].sort((a,b) => new Date(b.last_attempt_at||0) - new Date(a.last_attempt_at||0)));
    return out;
  }

  // ---- 다음 걸음 조립 (설계 §1-④) — 규칙 기반, 최대 3개 ----
  // 우선순위: ① 반복 오답이 있는 차시 다시 풀기
  //           ② weak 차시 한 번 더
  //           ③ 하다 만 차시(문항은 풀었는데 끝 기록 없음) 이어서
  function nextSteps(cls, masteryRows, scoreRows){
    const steps = [];
    const used = new Set();
    const unitOf = {};
    (masteryRows || []).forEach(r => { if(r.unit_id) unitOf[r.lesson_id] = r.unit_id; });
    (scoreRows || []).forEach(r => { if(r.lesson_id && r.unit_id && !unitOf[r.lesson_id]) unitOf[r.lesson_id] = r.unit_id; });

    (cls.repeatWrong || []).forEach(w => {
      if(steps.length >= 3 || used.has(w.lesson_id)) return;
      used.add(w.lesson_id);
      steps.push({ kind:'review', lessonId:w.lesson_id, unitId:unitOf[w.lesson_id] || null,
                   why:'여러 번 헷갈린 문제가 있어요', attempts:w.attempts });
    });
    (cls.weak || []).forEach(r => {
      if(steps.length >= 3 || used.has(r.lesson_id)) return;
      used.add(r.lesson_id);
      steps.push({ kind:'lesson', lessonId:r.lesson_id, unitId:r.unit_id || unitOf[r.lesson_id] || null,
                   why:'한 번 더 하면 탄탄해져요' });
    });
    if(steps.length < 3){
      const ended = new Set();
      (scoreRows || []).forEach(r => { if(r.question_id === '_lesson_summary_' && r.lesson_id) ended.add(r.lesson_id); });
      const started = {};
      (scoreRows || []).forEach(r => {
        if(r.question_id !== '_lesson_summary_' && r.lesson_id && !ended.has(r.lesson_id)){
          const t = new Date(r.earned_at).getTime();
          if(!started[r.lesson_id] || t > started[r.lesson_id].t)
            started[r.lesson_id] = { t, unitId: r.unit_id };
        }
      });
      Object.keys(started)
        .sort((a,b) => started[b].t - started[a].t)
        .forEach(lid => {
          if(steps.length >= 3 || used.has(lid)) return;
          used.add(lid);
          steps.push({ kind:'continue', lessonId:lid, unitId:started[lid].unitId || null,
                       why:'하다가 멈춘 곳이 있어요' });
        });
    }
    return steps;
  }

  // ---- 표본 안내 문구 ----
  const WATCHING_NOTE = '아직 지켜보는 중이에요 (기록이 더 쌓이면 알려 드려요)';

  window.KeduReport = {
    prettyLesson, kstDateStr, mondayOf, addDays, fmtMD,
    buildWeeks, classify, nextSteps, WATCHING_NOTE, SUBJECT_KO
  };
})();
