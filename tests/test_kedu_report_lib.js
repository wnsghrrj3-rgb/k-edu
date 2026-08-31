#!/usr/bin/env node
/**
 * 케이학습리포트 공용 계산 — kedu_report_lib.js v2
 *  ① 차시 이름 해석: /kedu_map 정본으로 단원명·제목·URL (현행 794개 kedu-lesson-id 메타 중 794개 지도 적중 — g6 국어·사회 지도 합류로 폴백 0)
 *  ② 폴백 라벨(지도 밖 id·구형 id)이 원문 id 를 그대로 노출하지 않음
 *  ③ 주간·일별·연속일 집계 (KST) · 요약 행(_lesson_summary_)은 문항으로 안 셈
 *  ④ classify 불변식: 1회 오답은 취약 아님, watching 은 판단 보류
 *  ⑤ unitProgress: 단원 total/done/nextNew
 *  ⑥ nextSteps 4순위 · 최대 3 · 중복 없음 · URL 은 지도 우선
 * 실행: node tests/test_kedu_report_lib.js   (k-edu 루트)
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };

// ── 브라우저 흉내: document.createElement('script') → 파일을 동기 로드 ──
const win = { KEDU_MAP: {}, setTimeout, Date };
win.window = win;
const document = {
  head: { appendChild(s){ try { vm.runInContext(rd(s.src.replace(/^\//,'')), ctx); s.onload && s.onload(); } catch(e){ s.onerror && s.onerror(e); } } },
  createElement(){ return {}; }
};
win.document = document;
const ctx = vm.createContext(win);
vm.runInContext(rd('kedu_report_lib.js'), ctx);
const KR = win.KeduReport;

(async () => {
  // ── ① 지도 적중 ──────────────────────────────────────────
  const metas = [];
  const walk = d => fs.readdirSync(d, { withFileTypes:true }).forEach(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/node_modules|archive|kmovie|kmake/.test(e.name)) walk(p); }
    else if (/\.html?$/.test(e.name)) { const m = fs.readFileSync(p,'utf8').match(/kedu-lesson-id"\s+content="([^"]+)"/); if (m) metas.push(m[1]); }
  });
  ['grade1','grade2','grade3','grade4','grade5','grade6','english'].forEach(g => { if (fs.existsSync(path.join(R,g))) walk(path.join(R,g)); });
  await KR.loadCatalog(metas);
  const hit = metas.filter(id => KR.lesson(id).mapped).length;
  ok(metas.length > 700, '메타 lesson-id 수집 ' + metas.length);
  // 지도는 build_kedu_map.js 산출물이라 새 차시를 지으면 재생성 전까지 잠깐 벌어진다.
  // 그 틈을 0.98 로 좁혀 둔다 — 떨어지면 지도 재생성이 밀렸다는 신호(미적중 id 를 찍는다).
  ok(hit / metas.length >= 0.98, '지도 적중률 ' + hit + '/' + metas.length +
     ' — 지도 밖: ' + metas.filter(id => !KR.lesson(id).mapped).slice(0, 5).join(', '));
  const l = KR.lesson('g1_math_u1_l02-03_v1');
  ok(l.mapped && l.unitName === '9까지의 수' && /1, 2, 3, 4, 5/.test(l.title), '1학년 수학 1단원 2차시 해석: ' + l.label);
  ok(l.url && l.url.startsWith('/grade1/'), '지도 URL ' + l.url);
  ok(l.label === '수학 1단원 · 2차시 1, 2, 3, 4, 5를 알아볼까요', '라벨 형식 ' + l.label);
  const k = KR.lesson('g1_kor_u1_l01_02_v1');
  ok(k.mapped && k.subjectKo === '국어', '국어 kor 약칭 해석 ' + k.label);
  const s2 = KR.lesson('g1_2_math_u2_l06_v1');
  ok(s2.mapped && s2.semester === 2, '2학기 id 해석 ' + s2.label);

  // ── ② 폴백 ─────────────────────────────────────────────
  // 지도 밖 = 아직 안 지은 차시(track soon — 파일이 없어 lessonId 도 없음)
  const fb = KR.lesson('g6_social_u2_l03_v1');
  ok(!fb.mapped && fb.label === '사회 2단원 · 3차시', '지도 밖 폴백 라벨 ' + fb.label);
  // g6 국어·사회는 2026-08-31 지도 합류 — 전에는 위 폴백으로 떨어지던 24차시
  const g6s = KR.lesson('g6_social_u1_l03_v1');
  ok(g6s.mapped && g6s.unitName === '평화 통일을 위한 노력, 민주화와 산업화', 'g6 사회 해석 ' + g6s.label);
  const g6k = KR.lesson('g6_kor_u2_l14_v1');
  ok(g6k.mapped && g6k.subjectKo === '국어' && g6k.unitName === '바르게 고쳐 써요', 'g6 국어 해석 ' + g6k.label);
  const fb2 = KR.lesson('g1_korean_01_글자의짜임');
  ok(fb2.label === '국어 1. 글자의짜임', '구형 id 폴백 ' + fb2.label);
  ok(KR.lesson('random_page').label === 'random_page', '완전 미지 id 는 원문');
  ok(KR.parseId('g3_sci_u2_l04_v1').mapKey === 'g3_1_science', 'sci → science 지도 키');

  // ── ③ 시간 집계 ─────────────────────────────────────────
  const T = KR.today(), Y = KR.addDays(T,-1), Y2 = KR.addDays(T,-2), Y4 = KR.addDays(T,-4);
  const at = (ds, h) => ds + 'T' + String(h).padStart(2,'0') + ':00:00+09:00';
  const L1 = 'g1_math_u1_l02-03_v1', L2 = 'g1_math_u1_l04-05_v1', L3 = 'g1_math_u1_l06_v1';
  const scores = [
    { lesson_id:L1, unit_id:'/x', question_id:'q1', is_correct:true,  earned_at:at(Y4,9),  time_spent_sec:10 },
    { lesson_id:L1, unit_id:'/x', question_id:'q2', is_correct:false, earned_at:at(Y4,9),  time_spent_sec:20 },
    { lesson_id:L1, unit_id:'/x', question_id:'q3', is_correct:true,  earned_at:at(Y4,9),  time_spent_sec:5 },
    { lesson_id:L1, unit_id:'/x', question_id:'_lesson_summary_', is_correct:null, earned_at:at(Y4,9), score:2, max_score:3, time_spent_sec:60 },
    { lesson_id:L2, unit_id:'/y', question_id:'q1', is_correct:true,  earned_at:at(Y2,18), time_spent_sec:7 },
    { lesson_id:L2, unit_id:'/y', question_id:'q2', is_correct:true,  earned_at:at(Y,7),   time_spent_sec:7 },   // 하다 만 차시(끝 기록 없음)
  ];
  const morning = [{ run_date:Y, subject:'math' }, { run_date:T, subject:'hanja' }];
  const from = KR.addDays(T,-6);
  const ser = KR.dailySeries(scores, morning, from, T);
  ok(ser[Y4].q === 3 && ser[Y4].ok === 2 && ser[Y4].done.has(L1), '일별: 문항 3·정답 2·완료 1 (요약 행은 문항 아님)');
  ok(ser[Y4].sec === 95, '일별 시간 합 (요약 행 포함) ' + ser[Y4].sec);
  ok(ser[Y].morning === 1 && ser[T].morning === 1, '아침활동 일별');
  ok(ser[Y4].bySubject.math.q === 3, '과목별 일별');
  const wk = KR.buildWeeks(scores, morning, 1)[0];
  ok(wk.weekStart === KR.mondayOf(T) && Object.keys(wk.days).length === 7, '이번 주 7일');
  ok(KR.streak(scores, morning) >= 2, '연속 학습일 ≥2 (어제·오늘) → ' + KR.streak(scores, morning));
  ok(KR.streak([], []) === 0, '기록 없으면 연속 0');
  ok(KR.trendArrow(3, 5).dir === 'up' && KR.trendArrow(5, 5).dir === 'flat', '추세 화살표');
  ok(KR.pct(2,3) === 67 && KR.pct(0,0) === null, '정확률 (표본 0 은 null)');
  ok(KR.fmtDur(95) === '1분' && KR.fmtDur(3700) === '1시간 1분', '시간 표기');

  // ── ④ classify ────────────────────────────────────────
  const mastery = [
    { lesson_id:L1, unit_id:'/x', status:'edge',  last_attempt_at:at(Y4,9), q_n:3, q_latest_ok:2 },
    { lesson_id:L2, unit_id:'/y', status:'watching', last_attempt_at:at(Y,7), q_n:2, q_latest_ok:2 },
    { lesson_id:L3, unit_id:'/z', status:'weak', last_attempt_at:at(Y2,9), q_n:5, q_latest_ok:1 },
  ];
  const wrongs = [
    { lesson_id:L1, question_id:'q2', attempts:1, resolved_at:null },          // 1회 → 취약 아님
    { lesson_id:L3, question_id:'q1', attempts:3, resolved_at:null },
    { lesson_id:L3, question_id:'q4', attempts:2, resolved_at:null },
    { lesson_id:L3, question_id:'q5', attempts:4, resolved_at:'2026-01-01' },  // 해결됨
  ];
  const cls = KR.classify(mastery, wrongs);
  ok(cls.repeatWrong.length === 2 && cls.repeatWrong[0].attempts === 3, '반복 오답 = attempts≥2·미해결만 (2건)');
  ok(cls.repeatWrongLessons.length === 1 && cls.repeatWrongLessons[0].questions.length === 2, '반복 오답 차시 묶음');
  ok(cls.watching.length === 1 && cls.weak.length === 1 && cls.edge.length === 1, '상태 분류');
  ok(cls.byLesson[L3].status === 'weak', 'byLesson 색인');

  // ── ⑤ unitProgress ────────────────────────────────────
  const units = KR.unitProgress(scores, mastery);
  ok(units.length === 1 && units[0].unitName === '9까지의 수', '단원 1개 (9까지의 수)');
  const u = units[0];
  ok(u.mapped && u.total >= 7 && u.done === 1 && u.touched === 3, `단원 total ${u.total} done ${u.done} touched ${u.touched}`);
  ok(u.lessons[0].info.n === '1' && u.lessons[0].status === 'none', '단원 1차시(미시작) 가 맨 앞');
  ok(u.nextNew && u.nextNew.lessonId !== L1 && u.nextNew.lessonId !== L2 && u.nextNew.lessonId !== L3 && u.nextNew.url, '다음 새 차시 = 미시작 ' + u.nextNew.lessonId);
  ok(u.weak === 1 && u.solid === 0, '단원 취약/탄탄 수');

  // ── ⑥ nextSteps ───────────────────────────────────────
  const steps = KR.nextSteps(cls, mastery, scores, units);
  ok(steps.length === 3, '다음 걸음 3개');
  ok(steps[0].kind === 'review' && steps[0].lessonId === L3 && steps[0].questions === 2, '1순위 반복 오답 차시');
  ok(steps[1].kind === 'continue' && steps[1].lessonId === L2, '2순위(취약은 이미 사용) → 하다 만 차시');
  ok(steps[2].kind === 'new' && /9까지의 수/.test(steps[2].why), '3순위 단원의 다음 새 차시');
  ok(new Set(steps.map(s=>s.lessonId)).size === 3, '중복 없음');
  ok(steps[0].unitId === KR.lesson(L3).url, 'URL 은 지도 우선');
  const steps5 = KR.nextSteps(cls, mastery, scores, units, 5);
  ok(steps5.length === 3, 'max 5 → 후보가 3개뿐이면 3개(억지로 채우지 않음)');
  ok(KR.nextSteps(KR.classify([],[]), [], [], []).length === 0, '기록 없으면 0개');

  console.log(`kedu_report_lib: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
