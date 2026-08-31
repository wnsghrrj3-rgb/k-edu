#!/usr/bin/env node
/**
 * 케이학습리포트 세 화면 렌더 검증 (jsdom + 가짜 Supabase)
 *  ① 교사 학급 화면: 한눈에·막힌 차시·도달 지도·기간 표 — 기간/과목 전환, 원문 lesson_id 미노출, CSV
 *  ② 교사 학생 카드: 4단 + 단원 진도 + 근거 모달(문항별 이력) + 이웃 이동
 *  ③ 학생 「내 학습」: 금지어 없음, 점수 숫자 없음, 뱃지·내 지도·다음 걸음, 저학년 큰 글씨
 *  ④ 학부모 성장 리포트: 비교·석차 없음, 이번 주/4주 전환, 단원별 걸음, 가정 활동, 열람 로그 INSERT
 * 실행: NODE_PATH=/home/claude/.jsdom/node_modules node tests/test_kedu_report_pages.js   (k-edu 루트)
 */
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── 가짜 데이터 ───────────────────────────────────────────
const T = new Date(); const iso = (dOff, h) => { const d = new Date(T); d.setDate(d.getDate()+dOff); d.setHours(h||10,0,0,0); return d.toISOString(); };
const ymd = dOff => { const d = new Date(T); d.setDate(d.getDate()+dOff); return d.toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'}); };
const L1='g1_math_u1_l02-03_v1', L2='g1_math_u1_l04-05_v1', L3='g1_math_u1_l06_v1', K1='g1_kor_u1_l01_02_v1', X='g6_social_u1_l03_v1';
const S1='11111111-1111-1111-1111-111111111111', S2='22222222-2222-2222-2222-222222222222';
const CC='cccccccc-cccc-cccc-cccc-cccccccccccc';
const students = [
  { student_id:S2, nickname:'2번', class_code_id:CC, class_code:'ABC123', grade:1, total_questions:30, total_time_sec:900, is_active:true },
  { student_id:S1, nickname:'1번', class_code_id:CC, class_code:'ABC123', grade:1, total_questions:60, total_time_sec:2400, is_active:true },
];
const mastery = [
  { student_id:S1, lesson_id:L1, unit_id:'/g/x.html', status:'solid', q_n:10, q_latest_ok:9, attempts_total:14, recent_n:5, recent_correct:5, runs:1, last_run_score:9, last_run_max:10, time_sec:300, last_attempt_at:iso(-3) },
  { student_id:S1, lesson_id:L3, unit_id:'/g/z.html', status:'weak',  q_n:6,  q_latest_ok:2, attempts_total:9,  recent_n:5, recent_correct:2, runs:0, time_sec:200, last_attempt_at:iso(-1) },
  { student_id:S1, lesson_id:K1, unit_id:'/g/k.html', status:'watching', q_n:2, q_latest_ok:2, attempts_total:2, recent_n:2, recent_correct:2, runs:0, time_sec:20, last_attempt_at:iso(0) },
  { student_id:S1, lesson_id:X,  unit_id:'/g/s.html', status:'edge', q_n:5, q_latest_ok:3, attempts_total:5, recent_n:5, recent_correct:3, runs:0, time_sec:50, last_attempt_at:iso(-8) },
  { student_id:S2, lesson_id:L1, unit_id:'/g/x.html', status:'edge',  q_n:10, q_latest_ok:7, attempts_total:10, recent_n:5, recent_correct:3, runs:1, last_run_score:7, last_run_max:10, time_sec:400, last_attempt_at:iso(-2) },
];
const scores = [
  { student_id:S1, lesson_id:L1, unit_id:'/g/x.html', question_id:'g1_math_u1_l02-03_s1', is_correct:true,  earned_at:iso(-3,9), time_spent_sec:8 },
  { student_id:S1, lesson_id:L1, unit_id:'/g/x.html', question_id:'g1_math_u1_l02-03_s2', is_correct:false, earned_at:iso(-3,9), time_spent_sec:12 },
  { student_id:S1, lesson_id:L1, unit_id:'/g/x.html', question_id:'g1_math_u1_l02-03_s2', is_correct:true,  earned_at:iso(-3,9), time_spent_sec:6 },
  { student_id:S1, lesson_id:L1, unit_id:'/g/x.html', question_id:'_lesson_summary_', is_correct:null, earned_at:iso(-3,9), score:9, max_score:10, time_spent_sec:300 },
  { student_id:S1, lesson_id:L3, unit_id:'/g/z.html', question_id:'g1_math_u1_l06_s1', is_correct:false, earned_at:iso(-1,17), time_spent_sec:20 },
  { student_id:S1, lesson_id:L3, unit_id:'/g/z.html', question_id:'g1_math_u1_l06_s2', is_correct:true,  earned_at:iso(-1,17), time_spent_sec:9 },
  { student_id:S1, lesson_id:K1, unit_id:'/g/k.html', question_id:'g1_kor_u1_l01_02_s1', is_correct:true, earned_at:iso(0,8), time_spent_sec:5 },
  { student_id:S2, lesson_id:L1, unit_id:'/g/x.html', question_id:'g1_math_u1_l02-03_s1', is_correct:true,  earned_at:iso(-2,9), time_spent_sec:8 },
  { student_id:S2, lesson_id:L1, unit_id:'/g/x.html', question_id:'_lesson_summary_', is_correct:null, earned_at:iso(-2,9), score:7, max_score:10, time_spent_sec:400 },
];
const wrongs = [
  { student_id:S1, lesson_id:L3, question_id:'g1_math_u1_l06_s1', attempts:3, resolved_at:null, last_wrong_at:iso(-1) },
  { student_id:S1, lesson_id:L1, question_id:'g1_math_u1_l02-03_s2', attempts:1, resolved_at:iso(-3), last_wrong_at:iso(-3) },
];
const morning = [ { student_id:S1, run_date:ymd(-1), subject:'math' }, { student_id:S1, run_date:ymd(0), subject:'hanja' } ];
const comments = [ { student_id:S1, comment:'스스로 고쳐 쓰는 모습이 좋았습니다.', visible_to_parent:true, updated_at:iso(-1) } ];

// ── 가짜 supabase 질의 빌더 ─────────────────────────────────
const inserts = [];
function fakeDb(role){
  const tables = {
    teachers: [{ id:'t1', name:'준호', user_id:'u-teacher' }],
    class_codes: [{ id:CC, code:'ABC123', label:'1학년 3반', teacher_id:'t1', is_active:true, created_at:iso(-30) }],
    student_data_summary: students, report_lesson_mastery: mastery, scores, wrong_answers: wrongs,
    report_morning_daily: morning, report_teacher_comments: comments,
    student_profiles: [{ id:S1, nickname:'1번', grade:1, class_code_id:CC, user_id:'u-student' }],
    parent_student_links: [{ student_id:S1, parent_id:'u-parent', verified_at:iso(-10) }],
    report_parent_views: [],
  };
  const build = (name) => {
    let rows = (tables[name]||[]).slice(); let single = false;
    const b = {
      select(){ return b; },
      eq(k,v){ rows = rows.filter(r => String(r[k])===String(v)); return b; },
      in(k,vs){ rows = rows.filter(r => vs.map(String).includes(String(r[k]))); return b; },
      is(k,v){ rows = rows.filter(r => v===null ? (r[k]===null||r[k]===undefined) : r[k]===v); return b; },
      not(){ return b; }, gte(k,v){ rows = rows.filter(r => !r[k] || String(r[k]) >= String(v)); return b; },
      order(){ return b; }, limit(){ return b; }, maybeSingle(){ single = true; return b; },
      insert(row){ inserts.push({ table:name, row }); rows = []; return b; },
      upsert(row){ inserts.push({ table:name, row }); rows = []; return b; },
      update(){ return b; },
      then(res){ return Promise.resolve({ data: single ? (rows[0]||null) : rows, error:null }).then(res); },
      catch(){ return b; }
    };
    return b;
  };
  return {
    auth: { getSession: async () => ({ data: { session: { user: { id: role==='teacher'?'u-teacher':role==='student'?'u-student':'u-parent' } } } }) },
    from: build
  };
}

async function open(file, role, url){
  let html = rd(file)
    .replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^>]*><\/script>/g, '')
    .replace(/<script src="\.\.\/kedu_config\.js"><\/script>/, '')
    .replace(/<script src="\.\.\/kedu_report_lib\.js"><\/script>/, '<script>' + rd('kedu_report_lib.js').replace('document.head.appendChild(s);', '(window.__appendScript || document.head.appendChild.bind(document.head))(s);') + '</script>');
  const vc = new VirtualConsole(); const errors = [];
  vc.on('jsdomError', e => { if(!/Could not load|not implemented/i.test(String(e.message||e))) errors.push(String(e.message||e)); });
  vc.on('error', e => errors.push(String(e)));
  const dom = new JSDOM(html, {
    url, runScripts:'dangerously', virtualConsole: vc, pretendToBeVisual:true,
    beforeParse(w){
      w.getKeduDb = () => fakeDb(role);
      w.speechSynthesis = { cancel(){}, speak(){} }; w.SpeechSynthesisUtterance = function(){};
      w.navigator.clipboard = { writeText: async () => {} };
      w.alert = () => {};
      // 지도(/kedu_map/*.js) 동적 로딩 → 로컬 파일을 직접 실행
      w.__appendScript = (el) => { try { w.eval(rd(new URL(el.src, 'https://keduclass.com').pathname.replace(/^\//,''))); setTimeout(()=>el.onload&&el.onload(),0); } catch(e){ setTimeout(()=>el.onerror&&el.onerror(e),0); } };
    }
  });
  // 페이지 인라인 스크립트는 파싱 시 이미 실행됨 → init() 이 비동기로 렌더
  for(let i=0;i<40;i++){ await sleep(25); if(!/모으는 중|가져오는 중|정리하는 중/.test(dom.window.document.getElementById('app').textContent)) break; }
  return { dom, errors, doc: dom.window.document, win: dom.window };
}

(async () => {
  const RAW_ID = /g\d_(math|kor|sci|social)_u\d+_l\d/;

  // ── ① 교사 학급 화면 ─────────────────────────────────────
  {
    const { doc, win, errors } = await open('teacher/learning-report.html', 'teacher', 'https://keduclass.com/teacher/learning-report.html');
    const txt = doc.getElementById('app').textContent;
    ok(errors.length === 0, '교사 학급: JS 오류 없음 ' + errors.join(' | '));
    ok(/이번 주 한눈에/.test(txt) && /지금 막힌 차시/.test(txt) && /차시 도달 지도/.test(txt) && /이번 주 학습량/.test(txt), '교사 학급: 4개 섹션');
    ok(/9까지의 수/.test(txt) && /순서를 알아볼까요/.test(txt), '교사 학급: 단원명·차시 제목 정본 표시');
    ok(!RAW_ID.test(txt), '교사 학급: 원문 lesson_id 미노출');
    ok(/사회 1단원 · 3차시/.test(doc.querySelector('.hm').textContent + ' ' + txt) || /사회 1단원/.test(txt), '교사 학급: 지도 밖 id 폴백 라벨(사회 1단원)');
    const rows = [...doc.querySelectorAll('.r-table tbody tr')].map(tr => tr.querySelector('td b').textContent);
    ok(rows.join(',') === '1번,2번', '교사 학급: 번호순 정렬 ' + rows.join(','));
    ok(doc.querySelectorAll('.hm tbody tr').length === 2 && doc.querySelectorAll('.hm thead tr.les th').length >= 5, '교사 학급: 도달 지도 2행 × 차시열');
    ok(doc.querySelector('.hm i.rep'), '교사 학급: 반복 오답 칸 표시');
    ok(/1번.*학생 1명/s.test(doc.querySelector('.stuck-grid')?.textContent||'') || /학생 1명/.test(doc.querySelector('.stuck-grid')?.textContent||''), '교사 학급: 막힌 차시 카드');
    win.setPeriod('4w'); const t4 = doc.getElementById('app').textContent;
    ok(/최근 4주 한눈에/.test(t4) && /28일 중/.test(t4), '교사 학급: 최근 4주 전환');
    win.setPeriod('last'); ok(/지난 주 한눈에/.test(doc.getElementById('app').textContent), '교사 학급: 지난 주 전환');
    win.setSubject('korean'); ok(doc.querySelectorAll('.hm thead tr.les th').length === 2, '교사 학급: 과목 필터(국어 1열+모서리)');
    const csv = win.eval('_csv'); ok(csv && csv.split('\n').length === 3 && /^학생,/.test(csv), '교사 학급: CSV 3줄');
  }

  // ── ② 교사 학생 카드 ─────────────────────────────────────
  {
    const { doc, win, errors } = await open('teacher/learning-report.html', 'teacher', 'https://keduclass.com/teacher/learning-report.html?student_id='+S1+'&class_code_id='+CC);
    const txt = doc.getElementById('app').textContent;
    ok(errors.length === 0, '학생 카드: JS 오류 없음 ' + errors.join(' | '));
    ok(/얼마나 했는가/.test(txt) && /무엇을 잘하는가/.test(txt) && /무엇이 부족한가/.test(txt) && /앞으로 무엇을/.test(txt) && /단원 진도/.test(txt), '학생 카드: 4단 + 단원 진도');
    ok(!RAW_ID.test(txt), '학생 카드: 원문 lesson_id 미노출');
    ok(/연속 학습/.test(txt) && /이번 주 정답률/.test(txt), '학생 카드: 연속 학습·정답률');
    ok(/반복 오답/.test(txt) && /1번\(3회\)/.test(txt), '학생 카드: 반복 오답 문항 번호·횟수');
    ok(doc.querySelectorAll('.step-card').length >= 3 && /다음 차시예요|9까지의 수/.test(txt), '학생 카드: 다음 걸음 (새 차시 포함)');
    ok(doc.querySelector('.unit .dots') && doc.querySelectorAll('.unit').length === 3, '학생 카드: 단원 카드 3개(수학·국어·사회 폴백) ' + doc.querySelectorAll('.unit').length);
    ok(/2번/.test(doc.querySelector('.stu-head .nav')?.textContent||''), '학생 카드: 이웃 학생 이동');
    win.openEv(L1);
    const ev = doc.getElementById('ev-body').textContent;
    ok(doc.getElementById('ev-modal').classList.contains('on') && /2번/.test(ev) && /완료 회차/.test(ev) && /9\/10/.test(ev), '학생 카드: 근거 모달 — 문항 이력·완료 회차');
    ok(doc.querySelectorAll('.ev-table .hist .x').length === 1 && doc.querySelectorAll('.ev-table .hist .o').length === 2, '학생 카드: 근거 ○× 이력');
    ok(/교사 한마디/.test(txt) && doc.getElementById('cmt-text').value.includes('고쳐 쓰는'), '학생 카드: 교사 한마디 로드');
    ok(/스스로 고쳐 쓰는/.test(doc.querySelector('.print-cmt')?.textContent||''), '학생 카드: 인쇄용 한마디');
  }

  // ── ③ 학생 「내 학습」 ────────────────────────────────────
  {
    const { doc, win, errors } = await open('mylearning/index.html', 'student', 'https://keduclass.com/mylearning/');
    const txt = doc.getElementById('app').textContent;
    ok(errors.length === 0, '내 학습: JS 오류 없음 ' + errors.join(' | '));
    ok(!/부족|미달|하위|시험|점수|취약|등수/.test(txt), '내 학습: 금지어 없음');
    ok(!/\d+%/.test(txt), '내 학습: 백분율 없음');
    ok(!RAW_ID.test(txt), '내 학습: 원문 lesson_id 미노출');
    ok(doc.body.classList.contains('lower'), '내 학습: 1학년 큰 글씨');
    ok(/내가 한 것/.test(txt) && /탄탄한 것/.test(txt) && /다시 해볼 것/.test(txt) && /다음 걸음/.test(txt) && /내 지도/.test(txt), '내 학습: 5카드');
    ok(/1, 2, 3, 4, 5를 알아볼까요/.test(doc.querySelector('.badges')?.textContent||''), '내 학습: 뱃지 = 정본 차시 제목');
    ok(/한 번 더!/.test(txt) && /수의 순서|순서를 알아볼까요/.test(txt), '내 학습: 다시 해볼 것 = 취약 차시');
    ok(/연속으로/.test(txt), '내 학습: 연속 학습일');
    ok(doc.querySelectorAll('.unit .cells a, .unit .cells i').length >= 7, '내 학습: 내 지도 차시 칸');
    ok(doc.querySelector('.unit .cells .next'), '내 학습: 다음 새 차시 강조');
    ok(doc.querySelectorAll('.go-card').length >= 3, '내 학습: 다음 걸음 카드');
    ok(/background:#EEF4FF/.test(doc.querySelector('.badge')?.getAttribute('style')||''), '내 학습: 뱃지 = 과목별 색(수학)');

    // 특별 뱃지는 완주 단원·연속일이 있어야 뜬다 — 공유 데이터엔 없으므로 직접 그려 확인
    const KRw = win.KeduReport;
    const sc = [0,1,2,3,4,5,6].map(d => ({ lesson_id:L1, question_id:'q1', is_correct:true, earned_at:iso(-d,10) }));
    const wk7 = KRw.buildWeeks(sc, [], 1)[0];
    win.render({ nickname:'1번', grade:1 },
      wk7,
      { solid:[{lesson_id:L1}], watching:[], weak:[], repeatWrongLessons:[] },
      [],
      [{ subjectKo:'수학', unitNum:1, unitName:'9까지의 수', total:3, done:3, lessons:[] },
       { subjectKo:'국어', unitNum:2, unitName:'받침이 있는 글자', total:4, done:1, lessons:[] }],
      7);
    const t3 = doc.getElementById('app').textContent;
    const tros = doc.querySelectorAll('.tro');
    ok(tros.length === 2 && /단원을 끝까지!/.test(t3) && /9까지의 수/.test(tros[0].textContent), '내 학습: 특별 뱃지 — 완주 단원만(3/3 O, 1/4 X)');
    ok(/일주일 개근/.test(t3) && /7일째 이어 가는 중/.test(t3), '내 학습: 특별 뱃지 — 연속 학습 단계');
    ok(!/부족|미달|하위|시험|점수|취약|등수/.test(t3), '내 학습: 뱃지 문구 금지어 없음');
  }

  // ── ④ 학부모 성장 리포트 ─────────────────────────────────
  {
    inserts.length = 0;
    const { doc, win, errors } = await open('parent/growth.html', 'parent', 'https://keduclass.com/parent/growth.html');
    const txt = doc.getElementById('app').textContent;
    ok(errors.length === 0, '학부모: JS 오류 없음 ' + errors.join(' | '));
    ok(!/석차|백분위|등수|반 평균|취약|부족/.test(txt), '학부모: 비교·부정어 없음');
    ok(/다른 아이와 비교하지 않습니다/.test(txt), '학부모: 원칙 문구');
    ok(!RAW_ID.test(txt), '학부모: 원문 lesson_id 미노출');
    ok(/이번 주 아이가 한 것/.test(txt) && /잘 하고 있는 것/.test(txt) && /단원별 걸음/.test(txt) && /함께 해보면 좋은 것/.test(txt) && /담임 선생님 한마디/.test(txt), '학부모: 5섹션');
    ok(/9까지의 수/.test(doc.querySelector('.home-card')?.textContent||''), '학부모: 가정 활동 문구에 단원명');
    ok(/끝까지 마쳤습니다/.test(txt) && /수학 \d차시/.test(txt), '학부모: 요약 문장(완료 차시·과목)');
    ok(inserts.some(i => i.table==='report_parent_views' && i.row.period==='week' && i.row.student_id===S1), '학부모: 열람 로그 INSERT');
    win.setPeriod('month'); await sleep(10);
    const t2 = doc.getElementById('app').textContent;
    ok(/최근 4주 아이가 한 것/.test(t2) && doc.querySelectorAll('.cal .d').length === 28, '학부모: 4주 달력 28칸');
    ok(inserts.some(i => i.table==='report_parent_views' && i.row.period==='month'), '학부모: 기간 전환 열람 로그');
  }

  console.log(`kedu_report_pages: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
