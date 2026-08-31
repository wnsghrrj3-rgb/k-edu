#!/usr/bin/env node
/**
 * 케이학습지 → 케이학습리포트 합류 (v1.2 / 트래커 v2.3 / 렌더러 v0.3)
 *  ① 개념 사전(_concepts.json)이 실제 문항의 코드를 빠짐없이 덮는가
 *  ② play.html 배선: 화면 모드만 트래커 탑재 · lesson_id='ws:{set}' · 문항 키 q{seq} · 오개념 동봉
 *  ③ 트래커: 개념 코드는 concept_code, 숫자는 concept_id — 문자열이 FK 열로 새지 않음
 *  ④ SQL v1.2: ws: 제외 · 세 뷰 신설 · 판정 규칙이 차시와 동일(마지막 답·표본3·80/60)
 *  ⑤ lib v3: conceptMap 정렬·상태 분류, misconceptionTop 은 2회 이상만, wsLabel 사람 말
 * 실행: node tests/test_kedu_worksheet_report.js   (k-edu 루트)
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };

// ── ① 개념 사전 ──────────────────────────────────────────
const dict = JSON.parse(rd('kedu/worksheet/data/_concepts.json'));
const sets = fs.readdirSync(path.join(R, 'kedu/worksheet/data'))
  .filter(f => f.endsWith('.json') && !f.startsWith('_'));
ok(sets.length === 18, `학습지 세트 18개 (실제 ${sets.length})`);

const usedC = new Set(), usedM = new Set();
let qTotal = 0;
sets.forEach(f => {
  const d = JSON.parse(rd('kedu/worksheet/data/' + f));
  d.questions.forEach(q => {
    qTotal++;
    if (q.concept) usedC.add(q.concept);
    (q.options || []).forEach(o => { if (o.mis) usedM.add(o.mis); });
    (q.reason_options || []).forEach(o => { if (o.mis) usedM.add(o.mis); });
  });
});
ok(qTotal === 240, `문항 240 (실제 ${qTotal})`);
const missC = [...usedC].filter(c => !dict.concepts[c]);
const missM = [...usedM].filter(m => !dict.misconceptions[m]);
ok(missC.length === 0, '사전에 없는 개념 코드: ' + missC.join(','));
ok(missM.length === 0, '사전에 없는 오개념 코드: ' + missM.join(','));
ok(Object.keys(dict.concepts).every(c => usedC.has(c)), '문항이 쓰지 않는 유령 개념이 사전에 있음');
ok(Object.values(dict.concepts).every(c => c.name && c.unitName && c.lesson), '개념 항목에 이름·단원·차시가 모두 있음');
ok(Object.values(dict.misconceptions).every(m => m.text && m.hint && (m.concepts || []).length),
   '오개념 항목에 설명·교사 힌트·연결 개념이 모두 있음');
// 오개념이 가리키는 개념도 사전 안에 있어야 화면이 이름을 찾는다
const badLink = Object.values(dict.misconceptions).flatMap(m => m.concepts).filter(c => !dict.concepts[c]);
ok(badLink.length === 0, '오개념이 사전 밖 개념을 가리킴: ' + badLink.join(','));

// ── ② play.html 배선 ────────────────────────────────────
const play = rd('kedu/worksheet/play.html');
ok(/window\.KEDU_LESSON_ID\s*=\s*'ws:'\s*\+\s*set/.test(play), "lesson_id 접두사 'ws:' 배선");
ok(/mode'\)\s*\|\|\s*'screen'\)\s*!==\s*'screen'\)\s*return/.test(play), '종이(A4) 모드는 기록하지 않음');
ok(play.includes('/kedu_tracker.js') && play.includes('/kedu_config.js') && play.includes('supabase-js'),
   '화면 모드에서 트래커 3종 스크립트 탑재');
ok(/recordAnswer\(`q\$\{q\.seq\}`/.test(play), '문항 키가 q{seq} (차시와 같은 문법)');
ok(!/recordAnswer\(`\$\{SET\}:q/.test(play), '옛 문항 키(SET:q…)가 남아 있지 않음');
ok(/recordAnswer\([^)]*q\.concept,\s*\{mis:/.test(play), '개념 코드와 오개념을 함께 보냄');
ok(/!detail\?\.pending/.test(play), '교사 확인 대기(서술형)는 기록하지 않음');
ok(/!state\.retry[^\n]*recordLessonEnd\(okN, Q\.length\)/.test(play),
   "'다시 해볼까?'(부분 재출제)는 회차로 세지 않음");
ok(/if\(q\.get\('quiz'\)\) return;/.test(play), '쪽지 모드에서는 트래커를 싣지 않음(원장 어댑터가 기록)');
ok(/QUIZ && window\.keduQuiz/.test(play), '쪽지 기록 경로(E1)를 건드리지 않음');

// ── ③ 트래커 v2.3 ───────────────────────────────────────
const tr = rd('kedu_tracker.js');
ok(/if\(window\.KEDU_LESSON_ID\) return/.test(tr), 'KEDU_LESSON_ID 가 lesson_id 0순위');
ok(/window\.kedu\.setLessonId\s*=/.test(tr), 'setLessonId API 존재');
ok(/typeof conceptId === 'number' \|\| \/\^\\d\+\$\/\.test/.test(tr), '숫자만 concept_id(FK)로 감');
ok(/else row\.concept_code = String\(conceptId\)/.test(tr), '문자열 개념 코드는 concept_code 로 감');
ok(/if\(meta && meta\.mis\) row\.misconception_code/.test(tr),
   '오개념은 원장과 같은 열 이름(misconception_code)으로 기록');
ok(!/row\.mis_code/.test(tr), '옛 열 이름(mis_code)이 남아 있지 않음');
ok(tr.includes('state.unitId || location.pathname'), '되돌아갈 경로(unit_id) 재정의 가능');

// 실제 실행: 문자열/숫자 개념이 어느 열로 가는지 (가짜 Supabase)
(function trackerRun(){
  const rows = [];
  const fakeDb = { from(){ return { insert(r){ rows.push(r); return Promise.resolve({}); },
                                    select(){ return this; }, eq(){ return this; }, is(){ return this; },
                                    maybeSingle(){ return Promise.resolve({ data:null }); },
                                    update(){ return this; }, upsert(){ return Promise.resolve({}); },
                                    then(f){ return Promise.resolve({}).then(f); } }; } };
  const win = { location:{ pathname:'/kedu/worksheet/play.html', search:'?set=x', href:'' },
                sessionStorage:{ getItem:()=>null, setItem:()=>{} },
                setTimeout, Date, supabase:{}, getKeduDb:()=>fakeDb,
                document:{ querySelector:()=>null, addEventListener:()=>{}, readyState:'complete',
                           createElement:()=>({}), head:{ appendChild(){} } } };
  win.window = win; win.getKeduDb = () => fakeDb;
  const ctx = vm.createContext(win);
  vm.runInContext(rd('kedu_tracker.js'), ctx);
  // 내부 상태를 직접 세워 API만 검증 (init 은 세션이 없어 멈춘다)
  win.kedu.setLessonId('ws:g1_math_u1_L02_basic');
  ok(typeof win.kedu.setLessonId === 'function' && typeof win.kedu.recordAnswer === 'function',
     '트래커가 브라우저 밖에서도 API 를 노출');
})();

// ── ④ SQL v1.2 ─────────────────────────────────────────
const sql = rd('sql/setup_report_v1.sql');
ok(sql.includes('v1.2'), 'SQL 버전 v1.2 표기');
ok(/ADD COLUMN IF NOT EXISTS concept_code\s+text/.test(sql), 'scores.concept_code 보장');
ok(/ADD COLUMN IF NOT EXISTS misconception_code text/.test(sql), 'scores.misconception_code 보장(원장과 같은 이름)');
const bank = rd('sql/setup_worksheet_bank.sql');
ok(/ADD COLUMN IF NOT EXISTS concept_code\s+text/.test(bank) && /misconception_code text/.test(bank),
   '원장 SQL과 열 이름이 어긋나지 않음');
ok((sql.match(/NOT LIKE 'quiz:%'/g) || []).length >= 2, '쪽지(quiz:)도 차시 도달 지도에서 제외');
ok((sql.match(/NOT LIKE 'ws:%'/g) || []).length >= 2,
   '차시 도달 지도(문항·회차 양쪽)에서 파일 학습지 제외');
['report_concept_mastery', 'report_worksheet_runs', 'report_misconception'].forEach(v => {
  ok(sql.includes('DROP VIEW IF EXISTS ' + v) && sql.includes('CREATE VIEW ' + v), v + ' 멱등 생성');
  const body = sql.slice(sql.indexOf('CREATE VIEW ' + v));
  ok(/security_invoker = true/.test(body.slice(0, 200)), v + ' 는 security_invoker (RLS 그대로)');
});
const cm = sql.slice(sql.indexOf('CREATE VIEW report_concept_mastery'), sql.indexOf('CREATE VIEW report_worksheet_runs'));
ok(cm.includes('rn_q') && cm.includes('ORDER BY s.earned_at DESC'), '개념 판정도 문항별 마지막 답 기준');
ok(cm.includes("< 3 THEN 'watching'"), '표본 3 미만은 판단 보류');
ok(cm.includes('>= 80') && cm.includes('>= 60'), '80/60 판정 숫자를 차시와 공유');
ok(cm.includes("COALESCE(s.question_id, '') <> '_lesson_summary_'"), '요약 행은 문항으로 세지 않음');

// ── ⑤ lib v3 ───────────────────────────────────────────
const win = { KEDU_MAP:{}, setTimeout, Date };
win.window = win;
win.document = { head:{ appendChild(s){ try { vm.runInContext(rd(s.src.replace(/^\//,'')), ctx); s.onload && s.onload(); } catch(e){ s.onerror && s.onerror(e); } } }, createElement(){ return {}; } };
win.fetch = (u) => Promise.resolve({ ok:true, json: () => Promise.resolve(JSON.parse(rd(u.replace(/^\//,'')))) });
const ctx = vm.createContext(win);
vm.runInContext(rd('kedu_report_lib.js'), ctx);
const KR = win.KeduReport;

(async () => {
  ok(typeof KR.conceptMap === 'function' && typeof KR.misconceptionTop === 'function', 'lib v3 개념 API 노출');
  await KR.loadConcepts();
  ok(KR.concept('M1-1-C4').name === '수의 순서', '개념 코드 → 이름');
  ok(KR.concept('M1-1-C4').known === true && KR.concept('없는코드').known === false, '사전 밖 코드는 known=false');
  ok(!/M1-1-C/.test(KR.concept('M1-1-C4').name), '개념 이름에 원문 코드가 새지 않음');
  ok(KR.misconception('M07').hint.length > 0, '오개념 → 교사 힌트');

  const rows = [
    { student_id:'s1', concept_code:'M1-1-C7', status:'weak',     q_n:5, q_latest_ok:2 },
    { student_id:'s1', concept_code:'M1-1-C2', status:'solid',    q_n:6, q_latest_ok:6 },
    { student_id:'s1', concept_code:'M1-1-C4', status:'watching', q_n:2, q_latest_ok:1 }
  ];
  const cmap = KR.conceptMap(rows);
  ok(cmap.list.map(r => r.concept_code).join(',') === 'M1-1-C2,M1-1-C4,M1-1-C7', '개념 순서(사전 order)대로 정렬');
  ok(cmap.solid.length === 1 && cmap.weak.length === 1 && cmap.watching.length === 1, '상태별 분류');
  ok(cmap.byCode['M1-1-C7'].rate === 40, '정답률 계산');
  ok(cmap.list[0].info.name === '6~9의 수', '행에 개념 정보가 붙음');

  const mis = KR.misconceptionTop([
    { mis_code:'M01', n:1, still_open:true,  concept_code:'M1-1-C1', last_at:'2026-08-30' },
    { mis_code:'M07', n:3, still_open:false, concept_code:'M1-1-C5', last_at:'2026-08-29' },
    { mis_code:'M10', n:2, still_open:true,  concept_code:'M1-1-C7', last_at:'2026-08-28' }
  ], 2, 5);
  ok(mis.length === 2, '한 번 짚은 오개념은 반복이 아니다 (n>=2 만)');
  ok(mis[0].mis_code === 'M10', '아직 안 풀린 것이 먼저');
  ok(mis[0].info.hint && mis[0].concept.name === '수의 크기 비교', '오개념에 힌트·개념 이름이 붙음');

  ok(KR.wsSetId('ws:g1_math_u1_L02_basic') === 'g1_math_u1_L02_basic', '세트 키 추출');
  ok(KR.wsSetId('g1_1_math_u1_l02_v1') === null, '차시 id 는 세트가 아님');
  ok(KR.wsLabel('g1_math_u1_L02_basic') === '2차시 · 기본', '세트 이름 (기본)');
  ok(KR.wsLabel('g1_math_u1_L05_challenge') === '5차시 · 도전', '세트 이름 (도전)');
  ok(KR.wsLabel('g1_math_u1_review_c') === '단원 종합 C형', '세트 이름 (단원 종합)');
  ok(KR.wsUrl('g1_math_u1_L02_basic').startsWith('/kedu/worksheet/play.html?set='), '세트 URL');

  // 화면: 교사·학생 페이지가 새 뷰를 실제로 읽는가 + 금지어
  const teacher = rd('teacher/learning-report.html'), mine = rd('mylearning/index.html');
  ok(teacher.includes("from('report_concept_mastery')") && teacher.includes("from('report_misconception')"),
     '교사 화면이 개념·오개념 뷰를 읽음');
  ok(teacher.includes("from('report_worksheet_runs')"), '교사 화면이 푼 학습지를 읽음');
  ok(mine.includes("from('report_concept_mastery')"), '학생 화면이 개념 뷰를 읽음');
  const mineCard = mine.slice(mine.indexOf('다시 해볼 것'), mine.indexOf('다음 걸음'));
  ok(!/부족|미달|하위|점수|등수|평균/.test(mineCard), '학생 화면 개념 문구에 금지어·비교어 없음');

  console.log(`kedu_worksheet_report: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
