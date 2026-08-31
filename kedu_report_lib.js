// =============================================
// 케이학습리포트 공용 라이브러리 (kedu_report_lib.js v3 — 2026-08-31)
// 명세: handoff/kedu/학습리포트_설계_v1.md
// 교사(R1)·학생(R2)·학부모(R3) 세 화면이 같은 집계 위의 세 스킨이 되도록
// 계산은 여기서 한 번만 짓는다 (설계 §0). 규칙 기반 — 외부 API 호출 없음.
//
// v2 변경:
//  · 차시 이름 해석을 /kedu_map/*.js(정본 지도)로 — 단원명·차시 제목·URL·단원 내 순서
//  · 단원 진도(unitProgress): 단원별 완료/전체·상태 점 — "얼마나 했는가"의 실체
//  · 일별 시리즈(dailySeries)·연속 학습일(streak)·주간 과목별 집계·정확률
//  · 다음 걸음 4순위: 반복 오답 → 취약 차시 → 하다 만 차시 → 단원의 다음 새 차시
//  · report_lesson_mastery v1.1 열(q_n·q_latest_ok·runs·last_run_*) 사용
//
// v3 변경 (케이학습지 합류):
//  · 개념 사전 해석 — 원장(concepts·misconceptions) 우선, 파일(_concepts.json) 대체
//  · report_concept_mastery → conceptMap(), report_misconception → misconceptionTop()
//  · 학습지 세트(lesson_id 'ws:{set}') 이름·URL 해석 — wsSetId/wsLabel/wsUrl
// =============================================
(function(){
  'use strict';

  const SUBJECT_KO = {
    korean:'국어', kor:'국어', math:'수학', science:'과학', sci:'과학',
    social:'사회', soc:'사회', english:'영어', eng:'영어',
    hanja:'한자', chars:'한자', sents:'문장'
  };
  const SUBJECT_KEY = { kor:'korean', korean:'korean', math:'math', sci:'science', science:'science',
                        social:'social', soc:'social', eng:'english', english:'english' };
  const SUBJECT_ORDER = { korean:1, math:2, science:3, social:4, english:5, hanja:6 };

  // =============================================
  // 1. 차시 지도 (카탈로그) — /kedu_map/{key}.js 를 필요한 만큼만 불러온다
  // =============================================
  const _catalog = {};        // lessonId → info
  const _unitIndex = {};      // mapKey → [{unitNum, unitName, lessons:[info...]}]
  const _loaded = new Set();  // mapKey
  let _indexKeys = null;      // _index.js 의 key 목록

  // lessonId → 지도 파일 키. 'g1_math_u1_l02-03_v1' → 'g1_1_math', 'g1_2_math_u2_l06_v1' → 'g1_2_math'
  function parseId(lessonId){
    const raw = String(lessonId || '');
    let m = raw.match(/^g(\d)(?:_(\d))?_(kor|korean|math|sci|science|social|soc|eng|english)_u(\d+)(?:_(.*))?$/i);
    if(m){
      const subj = SUBJECT_KEY[m[3].toLowerCase()] || m[3].toLowerCase();
      return { grade:Number(m[1]), semester:Number(m[2]||1), subject:subj, unitNum:Number(m[4]),
               tail:m[5]||'', mapKey:'g'+m[1]+'_'+(m[2]||1)+'_'+subj };
    }
    // 구형 'g1_korean_01_글자의짜임'
    m = raw.match(/^g(\d)_([a-z]+)_(\d+)_(.+)$/i);
    if(m){
      const subj = SUBJECT_KEY[m[2].toLowerCase()] || m[2].toLowerCase();
      return { grade:Number(m[1]), semester:1, subject:subj, unitNum:null, tail:m[3]+'_'+m[4], legacyNo:m[3], legacyName:m[4].replace(/_/g,' '), mapKey:null };
    }
    return null;
  }

  function loadScript(src){
    return new Promise(res => {
      const s = document.createElement('script');
      s.src = src; s.onload = () => res(true); s.onerror = () => res(false);
      document.head.appendChild(s);
    });
  }

  function indexMap(key){
    const map = window.KEDU_MAP && window.KEDU_MAP[key];
    if(!map || _unitIndex[key]) return;
    const units = [];
    (map.units || []).forEach(u => {
      const unit = { key, grade:map.grade, semester:map.semester, subject:map.subject,
                     subjectKo:SUBJECT_KO[map.subject]||map.subject,
                     unitNum:u.num, unitName:u.name, kind:u.kind, lessons:[] };
      (u.lessons || []).forEach((l, i) => {
        const info = {
          lessonId:l.lessonId, key:l.key, grade:map.grade, semester:map.semester,
          subject:map.subject, subjectKo:unit.subjectKo,
          unitNum:u.num, unitName:u.name, n:l.n, order:i, title:l.title || '', sub:l.sub||null,
          url:l.url || null, ready:l.ready !== false, track:l.track||null, mapped:true
        };
        info.label = info.subjectKo + ' ' + u.num + '단원 · ' + (l.n ? l.n + '차시 ' : '') + info.title;
        info.short = info.subjectKo + ' · ' + info.title;
        unit.lessons.push(info);
        if(!_catalog[l.lessonId]) _catalog[l.lessonId] = info;
      });
      units.push(unit);
    });
    _unitIndex[key] = units;
  }

  // 여러 lessonId 에 필요한 지도 파일을 한 번에 불러온다. 실패해도 조용히(폴백 라벨).
  async function loadCatalog(lessonIds){
    if(_indexKeys === null){
      if(!window.KEDU_MAP_INDEX) await loadScript('/kedu_map/_index.js');
      _indexKeys = new Set((window.KEDU_MAP_INDEX || []).map(x => x.key));
    }
    const need = new Set();
    (lessonIds || []).forEach(id => {
      const p = parseId(id);
      if(p && p.mapKey && _indexKeys.has(p.mapKey) && !_loaded.has(p.mapKey)) need.add(p.mapKey);
    });
    await Promise.all([...need].map(async key => {
      _loaded.add(key);
      if(!(window.KEDU_MAP && window.KEDU_MAP[key])) await loadScript('/kedu_map/' + key + '.js');
      indexMap(key);
    }));
    // 이미 전역에 있던 지도도 색인
    Object.keys(window.KEDU_MAP || {}).forEach(indexMap);
  }

  // lessonId → 사람이 읽는 정보. 지도에 없으면 id 에서 최대한 뽑아 폴백.
  function lesson(lessonId){
    if(_catalog[lessonId]) return _catalog[lessonId];
    const p = parseId(lessonId);
    const raw = String(lessonId || '');
    if(!p) return { lessonId:raw, grade:null, semester:null, subject:'', subjectKo:'', unitNum:null, unitName:'',
                    n:'', title:raw, url:null, label:raw, short:raw, mapped:false };
    const subjectKo = SUBJECT_KO[p.subject] || p.subject;
    let title, unitName = '';
    if(p.unitNum !== null){
      const lm = p.tail.match(/^l(\d+)(?:[-_](\d+))?/i);
      title = lm ? (lm[2] ? Number(lm[1])+'~'+Number(lm[2])+'차시' : Number(lm[1])+'차시')
                 : (p.tail.replace(/_v\d+$/,'').replace(/_/g,' ') || '차시');
    } else {
      title = p.legacyName; unitName = ''; 
    }
    const label = p.unitNum !== null ? subjectKo + ' ' + p.unitNum + '단원 · ' + title
                                     : subjectKo + ' ' + Number(p.legacyNo) + '. ' + title;
    const info = { lessonId:raw, grade:p.grade, semester:p.semester, subject:p.subject, subjectKo,
                   unitNum:p.unitNum, unitName, n:'', order:9999, title, url:null,
                   label, short:subjectKo + ' · ' + title, mapped:false };
    _catalog[raw] = info;
    return info;
  }
  // v1 호환 이름
  function prettyLesson(lessonId){ return lesson(lessonId); }

  // 정렬 키: 학년 → 과목 → 단원 → 단원 내 순서
  function lessonSortKey(lessonId){
    const l = lesson(lessonId);
    return [l.grade||9, SUBJECT_ORDER[l.subject]||9, l.unitNum||99, l.order??9999, l.lessonId];
  }
  function cmpLesson(a, b){
    const ka = lessonSortKey(a), kb = lessonSortKey(b);
    for(let i=0;i<ka.length;i++){ if(ka[i] < kb[i]) return -1; if(ka[i] > kb[i]) return 1; }
    return 0;
  }

  // =============================================
  // 2. KST 날짜 유틸
  // =============================================
  function kstDateStr(d){ return new Date(d).toLocaleDateString('sv-SE', { timeZone:'Asia/Seoul' }); }
  function mondayOf(dateStr){
    const d = new Date(dateStr + 'T00:00:00+09:00');
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day);
    return kstDateStr(d);
  }
  function addDays(dateStr, n){
    const d = new Date(dateStr + 'T00:00:00+09:00');
    d.setUTCDate(d.getUTCDate() + n);
    return kstDateStr(d);
  }
  function fmtMD(dateStr){ return Number(dateStr.slice(5,7)) + '/' + Number(dateStr.slice(8,10)); }
  function today(){ return kstDateStr(new Date()); }
  function isSummary(r){ return r && r.question_id === '_lesson_summary_'; }

  // =============================================
  // 3. 일별 시리즈 — 모든 시간 집계의 기초
  //   days: { 'YYYY-MM-DD': { q, ok, lessons:Set, done:Set, morning:0, sec, bySubject:{subj:{q,ok}} } }
  // =============================================
  function dailySeries(scoreRows, morningRows, fromStr, toStr){
    const days = {};
    let d = fromStr;
    while(d <= toStr){ days[d] = { q:0, ok:0, lessons:new Set(), done:new Set(), morning:0, sec:0, bySubject:{} }; d = addDays(d,1); }
    (scoreRows || []).forEach(r => {
      const ds = kstDateStr(r.earned_at);
      const day = days[ds]; if(!day) return;
      day.sec += Number(r.time_spent_sec)||0;
      if(isSummary(r)){ if(r.lesson_id) day.done.add(r.lesson_id); return; }
      if(r.is_correct === null || r.is_correct === undefined) return;
      day.q++; if(r.is_correct) day.ok++;
      if(r.lesson_id){
        day.lessons.add(r.lesson_id);
        const subj = lesson(r.lesson_id).subject || '_';
        const bs = day.bySubject[subj] = day.bySubject[subj] || { q:0, ok:0 };
        bs.q++; if(r.is_correct) bs.ok++;
      }
    });
    (morningRows || []).forEach(r => {
      const ds = r.run_date || kstDateStr(r.submitted_at);
      const day = days[ds]; if(!day) return;
      day.morning++;
    });
    return days;
  }
  function dayActive(day){ return !!day && (day.q > 0 || day.lessons.size > 0 || day.done.size > 0 || day.morning > 0); }

  // =============================================
  // 4. 주간 집계 (설계 §1-①) — 최근 nWeeks 주, 이번 주가 마지막
  //   [{ weekStart, days:{ds:{selfQ,lessons:Set,morning:bool,...}}, problems, correct,
  //      lessonsDone:Set, lessonsTouched:Set, morningCount, activeDays:Set, sec, bySubject }]
  // =============================================
  function buildWeeks(scoreRows, morningRows, nWeeks){
    nWeeks = nWeeks || 3;
    const thisMonday = mondayOf(today());
    const from = addDays(thisMonday, -7 * (nWeeks - 1));
    const to = addDays(thisMonday, 6);
    const series = dailySeries(scoreRows, morningRows, from, to);
    const weeks = [];
    for(let i = nWeeks - 1; i >= 0; i--){
      const ws = addDays(thisMonday, -7 * i);
      const w = { weekStart:ws, days:{}, problems:0, correct:0, lessonsDone:new Set(), lessonsTouched:new Set(),
                  morningCount:0, activeDays:new Set(), sec:0, bySubject:{} };
      for(let k = 0; k < 7; k++){
        const ds = addDays(ws, k); const day = series[ds];
        w.days[ds] = { selfQ:day.q, ok:day.ok, lessons:day.lessons, done:day.done, morning:day.morning > 0, morningN:day.morning, sec:day.sec };
        w.problems += day.q; w.correct += day.ok; w.morningCount += day.morning; w.sec += day.sec;
        day.lessons.forEach(l => w.lessonsTouched.add(l));
        day.done.forEach(l => w.lessonsDone.add(l));
        if(dayActive(day)) w.activeDays.add(ds);
        Object.keys(day.bySubject).forEach(s => {
          const bs = w.bySubject[s] = w.bySubject[s] || { q:0, ok:0, lessons:new Set() };
          bs.q += day.bySubject[s].q; bs.ok += day.bySubject[s].ok;
        });
        day.lessons.forEach(l => { const s = lesson(l).subject||'_'; (w.bySubject[s] = w.bySubject[s]||{q:0,ok:0,lessons:new Set()}).lessons.add(l); });
      }
      weeks.push(w);
    }
    return weeks;
  }

  // 연속 학습일 — 오늘 또는 어제부터 거슬러 세기
  function streak(scoreRows, morningRows){
    const to = today(); const from = addDays(to, -120);
    const series = dailySeries(scoreRows, morningRows, from, to);
    let d = to, n = 0;
    if(!dayActive(series[d])) d = addDays(d, -1);        // 오늘 아직 안 했으면 어제부터
    while(series[d] && dayActive(series[d])){ n++; d = addDays(d, -1); }
    return n;
  }

  function trendArrow(prev, cur){
    if(cur > prev) return { dir:'up', text:'↗ 늘고 있음' };
    if(cur < prev) return { dir:'down', text:'↘ 줄고 있음' };
    return { dir:'flat', text:'→ 비슷함' };
  }
  function pct(ok, n){ return n ? Math.round(100 * ok / n) : null; }
  function fmtDur(sec){
    sec = Number(sec)||0; if(sec < 60) return sec + '초';
    const m = Math.floor(sec/60); return m < 60 ? m + '분' : Math.floor(m/60) + '시간 ' + (m%60) + '분';
  }

  // =============================================
  // 5. 판정 정리 (설계 §1-②③)
  //   masteryRows: report_lesson_mastery, wrongRows: wrong_answers
  //   반환 { solid, edge, weak, watching, repeatWrong, byLesson }
  //   취약 불변식: 1회 오답은 취약이 아니다 — 반복(attempts>=2, 미해결)만.
  // =============================================
  function classify(masteryRows, wrongRows){
    const out = { solid:[], edge:[], weak:[], watching:[], byLesson:{} };
    (masteryRows || []).forEach(r => { (out[r.status] || out.watching).push(r); out.byLesson[r.lesson_id] = r; });
    out.repeatWrong = (wrongRows || []).filter(w => (w.attempts||0) >= 2 && !w.resolved_at)
      .sort((a,b) => (b.attempts||0) - (a.attempts||0) || new Date(b.last_wrong_at||0) - new Date(a.last_wrong_at||0));
    // 반복 오답을 차시 단위로 묶기 (문항 수·최대 반복)
    const byL = {};
    out.repeatWrong.forEach(w => {
      const g = byL[w.lesson_id] = byL[w.lesson_id] || { lesson_id:w.lesson_id, questions:[], maxAttempts:0, last:null };
      g.questions.push(w); g.maxAttempts = Math.max(g.maxAttempts, w.attempts||0);
      if(!g.last || new Date(w.last_wrong_at) > new Date(g.last)) g.last = w.last_wrong_at;
    });
    out.repeatWrongLessons = Object.values(byL).sort((a,b) => b.questions.length - a.questions.length || b.maxAttempts - a.maxAttempts);
    ['solid','edge','weak','watching'].forEach(k =>
      out[k].sort((a,b) => new Date(b.last_attempt_at||0) - new Date(a.last_attempt_at||0)));
    return out;
  }

  // =============================================
  // 6. 단원 진도 — 지도(카탈로그) 위에 학생 기록을 얹는다
  //   반환 [{ key, subject, subjectKo, unitNum, unitName, total, done, touched,
  //           lessons:[{info, status:'solid'|'edge'|'weak'|'watching'|'touched'|'none', done:bool, mastery}],
  //           nextNew:info|null, lastAt }]
  //   total = ready 차시 수. done = _lesson_summary_ 있음. touched = 답만 있음.
  //   지도에 없는 단원(구형 id)은 기록된 차시만으로 구성(total=null).
  // =============================================
  function unitProgress(scoreRows, masteryRows){
    const doneSet = new Set(), touched = new Set(), lastAt = {};
    (scoreRows || []).forEach(r => {
      if(!r.lesson_id) return;
      if(isSummary(r)) doneSet.add(r.lesson_id); else if(r.is_correct !== null && r.is_correct !== undefined) touched.add(r.lesson_id);
      const t = new Date(r.earned_at).getTime(); if(!lastAt[r.lesson_id] || t > lastAt[r.lesson_id]) lastAt[r.lesson_id] = t;
    });
    const mastery = {}; (masteryRows || []).forEach(m => { mastery[m.lesson_id] = m; touched.add(m.lesson_id); const t = new Date(m.last_attempt_at||0).getTime(); if(!lastAt[m.lesson_id]||t>lastAt[m.lesson_id]) lastAt[m.lesson_id]=t; });
    const all = new Set([...doneSet, ...touched]);
    const units = {};
    all.forEach(lid => {
      const info = lesson(lid);
      const ukey = info.mapped ? (info.grade+'_'+info.semester+'_'+info.subject+'_u'+info.unitNum)
                               : ('x_'+(info.grade||0)+'_'+(info.subject||'_')+'_u'+(info.unitNum||0));
      if(!units[ukey]){
        let unitLessons = null;
        if(info.mapped){
          const mk = 'g'+info.grade+'_'+info.semester+'_'+info.subject;
          const u = (_unitIndex[mk]||[]).find(x => x.unitNum === info.unitNum);
          unitLessons = u ? u.lessons.filter(l => l.ready) : null;
        }
        units[ukey] = { key:ukey, grade:info.grade, semester:info.semester, subject:info.subject, subjectKo:info.subjectKo,
                        unitNum:info.unitNum, unitName:info.unitName, mapped:!!unitLessons,
                        total: unitLessons ? unitLessons.length : null, _lessons: unitLessons, extra:[] };
      }
      const u = units[ukey];
      if(!u._lessons || !u._lessons.find(l => l.lessonId === lid)) u.extra.push(info);
    });
    const list = Object.values(units).map(u => {
      const infos = (u._lessons || []).concat(u.extra.sort((a,b)=>cmpLesson(a.lessonId,b.lessonId)));
      const lessons = infos.map(info => {
        const m = mastery[info.lessonId]; const done = doneSet.has(info.lessonId);
        const status = m ? m.status : (done || touched.has(info.lessonId) ? 'touched' : 'none');
        return { info, status, done, mastery:m||null, lastAt:lastAt[info.lessonId]||0 };
      });
      const done = lessons.filter(l => l.done).length;
      const touchedN = lessons.filter(l => l.status !== 'none').length;
      // 다음 새 차시 = 마지막으로 손댄 차시 이후 첫 미시작(ready) 차시, 없으면 앞쪽 미시작
      let lastIdx = -1; lessons.forEach((l,i) => { if(l.status !== 'none') lastIdx = i; });
      let nextNew = lessons.slice(lastIdx+1).find(l => l.status === 'none' && l.info.url) || lessons.find(l => l.status === 'none' && l.info.url) || null;
      const ulast = Math.max(0, ...lessons.map(l => l.lastAt));
      return { key:u.key, grade:u.grade, semester:u.semester, subject:u.subject, subjectKo:u.subjectKo, unitNum:u.unitNum,
               unitName:u.unitName, mapped:u.mapped, total:u.total, done, touched:touchedN, lessons,
               nextNew: nextNew ? nextNew.info : null, lastAt:ulast,
               weak: lessons.filter(l=>l.status==='weak').length, solid: lessons.filter(l=>l.status==='solid').length };
    });
    list.sort((a,b) => (SUBJECT_ORDER[a.subject]||9)-(SUBJECT_ORDER[b.subject]||9) || (a.unitNum||99)-(b.unitNum||99));
    return list;
  }

  // 차시 열기 URL — 지도 URL 우선, 없으면 기록된 unit_id(경로)
  function lessonUrl(lessonId, fallback){
    const info = lesson(lessonId);
    return info.url || fallback || null;
  }


  // =============================================
  // 6-2. 개념 사전 · 개념 도달 (v3, 2026-08-31 — 케이학습지 합류)
  //   개념 코드('M1-1-C2')·오개념 코드('M07')를 사람 말로 옮긴다.
  //   사전 정본 = /kedu/worksheet/data/_concepts.json (한 번만 불러 캐시).
  //   차시 도달과 같은 규칙 위에 서므로 화면은 status 색을 그대로 재사용한다.
  // =============================================
  const CONCEPTS_URL = '/kedu/worksheet/data/_concepts.json';
  let _dict = null;                      // { concepts:{}, misconceptions:{} }
  let _dictPromise = null;

  //   정본 순서: ① 케이학습지 원장(concepts·misconceptions 표) ② 파일 사전(_concepts.json).
  //   원장이 적재되면 학년·과목이 늘어도 화면은 그대로다. 원장 적용 전에도 리포트가
  //   서도록 파일 사전을 뒤에 둔다.
  function loadConcepts(db){
    if(_dict) return Promise.resolve(_dict);
    if(_dictPromise) return _dictPromise;
    const fromFile = () => fetch(CONCEPTS_URL)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
    const fromBank = db ? Promise.all([
        db.from('concepts').select('code,name,subject,unit_code,lesson_no,ord,achievement_codes'),
        db.from('misconceptions').select('code,title,teacher_hint,concept_codes')
      ]).then(res => {
        const cs = (res[0] && res[0].data) || [], ms = (res[1] && res[1].data) || [];
        if(!cs.length) return null;
        const out = { concepts:{}, misconceptions:{} };
        cs.forEach(r => { out.concepts[r.code] = { name:r.name, full:r.name, subject:r.subject || '',
          unitName:'', lesson:r.lesson_no ? ('L' + String(r.lesson_no).padStart(2,'0')) : '',
          order:r.ord || 0, achievement:(r.achievement_codes || [])[0] || '' }; });
        ms.forEach(r => { out.misconceptions[r.code] = { text:r.title, hint:r.teacher_hint || '',
          concepts:r.concept_codes || [] }; });
        return out;
      }).catch(() => null) : Promise.resolve(null);
    _dictPromise = fromBank
      .then(d => d || fromFile())
      .then(j => { _dict = j || { concepts:{}, misconceptions:{} }; return _dict; });
    return _dictPromise;
  }

  // 개념 코드 → { code, name, full, subject, subjectKo, unitName, lesson, order, known }
  function concept(code){
    const c = (_dict && _dict.concepts && _dict.concepts[code]) || null;
    if(!c) return { code, name:String(code||''), full:String(code||''), subject:'', subjectKo:'',
                    unitName:'', lesson:'', order:999, known:false };
    return { code, name:c.name, full:c.full || c.name, subject:c.subject || '',
             subjectKo:SUBJECT_KO[c.subject] || '', unitName:c.unitName || '',
             lesson:c.lesson || '', order:c.order || 999, achievement:c.achievement || '', known:true };
  }

  // 오개념 코드 → { code, text, hint, concepts:[], known }
  function misconception(code){
    const m = (_dict && _dict.misconceptions && _dict.misconceptions[code]) || null;
    if(!m) return { code, text:String(code||''), hint:'', concepts:[], known:false };
    return { code, text:m.text, hint:m.hint || '', concepts:m.concepts || [], known:true };
  }

  // report_concept_mastery 행 → 사전 붙이고 개념 순서로 정렬
  //   반환 { list:[{...row, info, rate}], byCode:{}, solid, edge, weak, watching }
  function conceptMap(conceptRows){
    const out = { list:[], byCode:{}, solid:[], edge:[], weak:[], watching:[] };
    (conceptRows || []).forEach(r => {
      const row = Object.assign({}, r, {
        info: concept(r.concept_code),
        rate: pct(r.q_latest_ok, r.q_n)
      });
      out.list.push(row); out.byCode[r.concept_code] = row;
      (out[r.status] || out.watching).push(row);
    });
    out.list.sort((a,b) => (a.info.order||999) - (b.info.order||999) ||
                            String(a.concept_code).localeCompare(String(b.concept_code)));
    return out;
  }

  // report_misconception 행 → 반복(n>=2)·미해결 우선. 화면은 상위 몇 개만 쓴다.
  //   불변식: 한 번 짚은 오개념은 '반복'이 아니다 (설계 §1).
  function misconceptionTop(misRows, minN, max){
    minN = minN || 2;
    return (misRows || [])
      .filter(r => (r.n || 0) >= minN)
      .map(r => Object.assign({}, r, { info: misconception(r.mis_code), concept: concept(r.concept_code) }))
      .sort((a,b) => (b.still_open === true) - (a.still_open === true) ||
                     (b.n || 0) - (a.n || 0) ||
                     new Date(b.last_at || 0) - new Date(a.last_at || 0))
      .slice(0, max || 5);
  }

  // 학습지 세트 키 ↔ lesson_id
  function wsSetId(lessonId){ const r = String(lessonId || ''); return r.startsWith('ws:') ? r.slice(3) : null; }
  function wsUrl(setId){ return '/kedu/worksheet/play.html?set=' + encodeURIComponent(setId); }
  // 세트 키 → 사람이 읽는 이름 ('g1_math_u1_L02_basic' → '2차시 · 기본')
  function wsLabel(setId){
    const m = String(setId || '').match(/^g(\d)_([a-z]+)_u(\d+)_(?:L(\d+)_(basic|challenge)|review_([a-d]))$/i);
    if(!m) return String(setId || '');
    if(m[6]) return '단원 종합 ' + m[6].toUpperCase() + '형';
    return Number(m[4]) + '차시 · ' + (m[5].toLowerCase() === 'basic' ? '기본' : '도전');
  }

  // =============================================
  // 7. 다음 걸음 조립 (설계 §1-④) — 규칙 기반, 최대 3개
  //   ① 반복 오답 차시 다시 풀기 → ② weak 차시 한 번 더
  //   → ③ 하다 만 차시(답은 있는데 끝 기록 없음, 지도상 다음 차시 있음) → ④ 단원의 다음 새 차시
  // =============================================
  function nextSteps(cls, masteryRows, scoreRows, units, max){
    max = max || 3;
    const steps = []; const used = new Set();
    const unitOf = {};
    (masteryRows || []).forEach(r => { if(r.unit_id) unitOf[r.lesson_id] = r.unit_id; });
    (scoreRows || []).forEach(r => { if(r.lesson_id && r.unit_id && !unitOf[r.lesson_id]) unitOf[r.lesson_id] = r.unit_id; });
    const push = (kind, lid, why, extra) => {
      if(steps.length >= max || used.has(lid)) return; used.add(lid);
      steps.push(Object.assign({ kind, lessonId:lid, unitId:lessonUrl(lid, unitOf[lid]), why }, extra||{}));
    };
    (cls.repeatWrongLessons || []).forEach(g => push('review', g.lesson_id,
      g.questions.length >= 2 ? '여러 번 헷갈린 문제가 ' + g.questions.length + '개 있어요' : '여러 번 헷갈린 문제가 있어요',
      { attempts:g.maxAttempts, questions:g.questions.length }));
    (cls.weak || []).forEach(r => push('lesson', r.lesson_id, '한 번 더 하면 탄탄해져요'));
    if(steps.length < max){
      const ended = new Set(); const started = {};
      (scoreRows || []).forEach(r => { if(isSummary(r) && r.lesson_id) ended.add(r.lesson_id); });
      (scoreRows || []).forEach(r => {
        if(!isSummary(r) && r.lesson_id && !ended.has(r.lesson_id)){
          const t = new Date(r.earned_at).getTime();
          if(!started[r.lesson_id] || t > started[r.lesson_id].t) started[r.lesson_id] = { t, unitId:r.unit_id };
        }
      });
      Object.keys(started).sort((a,b) => started[b].t - started[a].t)
        .forEach(lid => push('continue', lid, '하다가 멈춘 곳이 있어요'));
    }
    if(steps.length < max && units && units.length){
      // 가장 최근에 손댄 단원부터, 다음 새 차시
      units.slice().sort((a,b) => b.lastAt - a.lastAt).forEach(u => {
        if(u.nextNew) push('new', u.nextNew.lessonId, u.unitName ? '「' + u.unitName + '」의 다음 차시예요' : '다음 새 차시예요');
      });
    }
    return steps;
  }

  const WATCHING_NOTE = '아직 지켜보는 중이에요 (기록이 더 쌓이면 알려 드려요)';
  const STATUS_KO = { solid:'탄탄', edge:'경계', weak:'취약', watching:'관찰 중', touched:'풀어봄', none:'아직' };

  window.KeduReport = {
    // 카탈로그
    loadCatalog, lesson, prettyLesson, lessonUrl, cmpLesson, parseId,
    // 날짜
    kstDateStr, mondayOf, addDays, fmtMD, today, fmtDur,
    // 집계
    dailySeries, dayActive, buildWeeks, streak, trendArrow, pct,
    classify, unitProgress, nextSteps,
    // 개념 (v3 — 케이학습지 합류)
    loadConcepts, concept, misconception, conceptMap, misconceptionTop,
    wsSetId, wsUrl, wsLabel,
    WATCHING_NOTE, STATUS_KO, SUBJECT_KO, SUBJECT_ORDER
  };
})();
