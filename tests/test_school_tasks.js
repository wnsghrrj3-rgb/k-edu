#!/usr/bin/env node
/**
 * 우리 학교 할 일판 게이트 — 생태계설계 v2 §J-10
 *  ① sql/setup_school_tasks.sql — 표 둘·제약·RLS 셋·RPC 다섯
 *  ② teacher/index.html — 대시보드 상단 카드 · 세 칸(할 일/지난 일/확인함) · 올리기·확인·내리기 배선 · 폴백
 *
 * ⚠️ 이 트랙 규칙 3: 일부러 깨서 빨간불을 본 것만 초록으로 친다 → `--rev` 로 역검증.
 * 실행: node tests/test_school_tasks.js   (k-edu 루트)
 *      node tests/test_school_tasks.js --rev   (역검증)
 */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };

// ── ① SQL ──────────────────────────────────────────────────
const sql = rd('sql/setup_school_tasks.sql');
[ 'CREATE TABLE IF NOT EXISTS school_tasks',
  'CREATE TABLE IF NOT EXISTS school_task_reads',
  'PRIMARY KEY (task_id, teacher_id)',
  'school_id   text NOT NULL REFERENCES schools(id)',
  'school_tasks_title_check',
  'FUNCTION kedu_my_school_id()',
  'FUNCTION list_school_tasks()',
  'FUNCTION add_school_task(',
  'FUNCTION mark_school_task(',
  'FUNCTION close_school_task(' ].forEach(k => ok(sql.includes(k), 'SQL 누락: ' + k));
ok(!/\$\$/.test(sql), 'SQL 에 $$ 사용 — $fn$/$do$ 로');
ok(/재실행 안전|멱등/.test(sql), '멱등 선언(규칙 2)');
ok(/-- {3}SELECT count\(\*\) FROM school_tasks;/.test(sql), '검산 줄(규칙 2)');

/* ★ 학교의 벽 — 이 두 정책이 「우리 학교」를 서버에서 막는다 */
ok(/CREATE POLICY p_school_tasks_same_school[\s\S]*?FOR SELECT/.test(sql), 'RLS 읽기 정책');
ok(/CREATE POLICY p_school_tasks_write[\s\S]*?FOR ALL/.test(sql), 'RLS 쓰기 정책');
const selPol = (sql.split('CREATE POLICY p_school_tasks_same_school')[1] || '').split('DROP POLICY')[0];
ok(/school_id = kedu_my_school_id\(\)/.test(selPol), '★ 읽기는 내 학교로 제한');
ok(/school_id IS NOT NULL/.test(selPol), '★ 학교 미지정(NULL)은 읽기에서도 막힌다 — NULL=NULL 구멍 방지');
const wPol = (sql.split('CREATE POLICY p_school_tasks_write')[1] || '').split('ALTER TABLE school_task_reads')[0];
ok(/kedu_teacher_approved\(\)/.test(wPol), '★ 쓰기는 승인 교사만(결정 ①)');
ok(/school_id = kedu_my_school_id\(\)/.test(wPol), '쓰기도 내 학교로 제한');
/* ★ 강화 — USING 과 WITH CHECK 를 따로 잰다(한쪽만 빼는 변이가 헛돌지 않게) */
const wUsing = (wPol.split('USING (')[1] || '').split('WITH CHECK')[0];
const wCheck = (wPol.split('WITH CHECK (')[1] || '');
ok(/kedu_teacher_approved\(\)/.test(wUsing), '★ 쓰기 USING 에 승인 검사');
ok(/kedu_teacher_approved\(\)/.test(wCheck), '★ 쓰기 WITH CHECK 에 승인 검사');
ok((wPol.match(/kedu_teacher_approved\(\)/g) || []).length === 2, '승인 검사가 양쪽에 정확히 하나씩');
ok(/CREATE POLICY p_school_task_reads_mine[\s\S]*?teacher_id = cw_my_teacher_id\(\)/.test(sql),
   '확인 표시는 자기 것만');
/* ★ 관리자 전용이 아니다 — 결정 ① */
const addFn = (sql.split('FUNCTION add_school_task(')[1] || '').split('GRANT EXECUTE ON FUNCTION add_school_task')[0];
ok(!/kedu_is_admin\(\)/.test(addFn), '★ 올리기가 관리자 전용이 아니다(결정 ①)');
ok(/kedu_teacher_approved\(\)/.test(addFn) && /school required/.test(addFn),
   '올리기 = 승인 교사 + 학교 지정 필요');

/* ★ 결정 ③ — 기한이 지나도 사라지지 않는다 */
const listFn = (sql.split('FUNCTION list_school_tasks()')[1] || '').split('GRANT EXECUTE ON FUNCTION list_school_tasks')[0];
ok(/closed_at IS NULL/.test(listFn), '내린 할 일만 목록에서 빠진다');
ok(!/due_date\s*>=/.test(listFn) && !/due_date\s*>\s*\(/.test(listFn),
   '★★ 결정 ③ — 기한으로 목록을 잘라 내는 자리 0(지난 일이 자동으로 숨지 않는다)');
/* ★ 강화 — WHERE 절만 떼어 재는 두 번째 각도 */
const listWhere = (listFn.split('WHERE me.sid IS NOT NULL AND s.school_id')[1] || '').split('ORDER BY')[0];
ok(listWhere.length > 0 && !/due_date/.test(listWhere),
   '★★ 결정 ③ — WHERE 절에 due_date 가 아예 없다');
ok(/closed_at IS NULL/.test(listWhere), 'WHERE 는 내린 것만 거른다');
ok(!/approval/.test(listWhere), 'WHERE 에 다른 조건이 끼어들지 않았다');
ok(/'past'/.test(listFn) && /bucket/.test(listFn), "★ 지난 일은 bucket='past' 로 내려갈 뿐");
ok(/'todo'/.test(listFn) && /'done'/.test(listFn), 'bucket 세 갈래(todo·past·done)');
ok((listFn.match(/Asia\/Seoul/g) || []).length >= 3,
   '★ 급함·지난 일 판정을 한국 날짜로 — 브라우저 시간대에 흔들리지 않는다');
ok(/'red'/.test(listFn) && /'orange'/.test(listFn) && /'normal'/.test(listFn) && /'none'/.test(listFn),
   'urgency 네 단계 + past');
ok(/<= 1 THEN 'red'/.test(listFn) && /<= 3 THEN 'orange'/.test(listFn), '기한이 다가올수록 짙어진다');
ok(/ORDER BY \(r\.teacher_id IS NOT NULL\)/.test(listFn), '★ 확인 안 한 것이 먼저 온다');
ok(/me\.sid IS NOT NULL/.test(listFn), '학교 미지정 교사에게는 빈 목록');

/* ★ 이중 방벽 — RPC 안에서도 학교를 다시 본다 */
const markFn = (sql.split('FUNCTION mark_school_task(')[1] || '').split('GRANT EXECUTE ON FUNCTION mark_school_task')[0];
ok(/school_id = v_sid/.test(markFn) && /not your school task/.test(markFn),
   '★ 확인 표시도 다른 학교 할 일에는 못 남긴다(RLS 와 이중)');
ok(/ON CONFLICT \(task_id, teacher_id\) DO NOTHING/.test(markFn), '확인 표시는 멱등');
const closeFn = (sql.split('FUNCTION close_school_task(')[1] || '').split('GRANT EXECUTE ON FUNCTION close_school_task')[0];
ok(/closed_at = now\(\)/.test(closeFn) && !/DELETE FROM school_tasks/.test(closeFn),
   '★ 내리기는 지우지 않고 closed_at 을 찍는다(이력 보존)');
ok(/kedu_is_admin\(\) OR \(school_id = v_sid AND created_by = v_tid\)/.test(closeFn),
   '내리기는 올린 사람 또는 관리자만');
/* 권한 */
['list_school_tasks() TO authenticated', 'add_school_task(text, text, date) TO authenticated',
 'mark_school_task(uuid, boolean) TO authenticated', 'close_school_task(uuid) TO authenticated']
  .forEach(k => ok(sql.includes('GRANT EXECUTE ON FUNCTION ' + k), 'GRANT 누락: ' + k));
ok(!/TO anon/.test(sql), '★ anon 에게는 아무것도 열지 않는다(학교 내부 정보)');

// ── ② 교사 화면 ─────────────────────────────────────────────
const html = rd('teacher/index.html');
[ 'id="schooltask-wrap"', 'id="schooltask-list"', 'id="schooltask-past-wrap"', 'id="schooltask-done-wrap"',
  'id="schooltask-form"', 'id="schooltask-title"', 'id="schooltask-due"', 'id="schooltask-detail"',
  'onclick="addSchoolTask()"', 'onclick="toggleSchoolTaskForm()"',
  'function loadSchoolTasks()', 'function addSchoolTask()', 'function markSchoolTask(', 'function closeSchoolTask(' ]
  .forEach(k => ok(html.includes(k), '교사 화면 누락: ' + k));
ok(/id="schooltask-wrap"[^>]*hidden/.test(html), '★ 폴백 — 기본은 숨김(SQL 미적용이면 종전 화면)');
ok(/await loadSchoolTasks\(\);[\s\S]{0,200}await loadOpenings\(\)/.test(html),
   '★ 대시보드 상단 — 할 일판이 열린 활동보다 먼저');
const wrapIdx = html.indexOf('id="schooltask-wrap"'), statsIdx = html.indexOf('<!-- STATS -->');
ok(wrapIdx > 0 && statsIdx > 0 && wrapIdx < statsIdx, '★ 카드가 통계·학급코드보다 위(준호 요구: 대시보드 상단)');
const loadFn = (html.split('async function loadSchoolTasks()')[1] || '').split('async function addSchoolTask()')[0];
ok(/if\(error\)\{ wrap\.hidden = true; return; \}/.test(loadFn), '★ 폴백 — RPC 실패면 카드를 숨기고 조용히 지나간다');
ok(/bucket === 'todo'/.test(loadFn) && /bucket === 'past'/.test(loadFn) && /bucket === 'done'/.test(loadFn),
   '세 칸을 bucket 으로 가른다');
ok(/todo\.length \+ past\.length/.test(loadFn), '★ 셈에 「지난 일」이 들어간다(확인 전이므로 아직 할 일)');
ok(!/new Date\(\)/.test(loadFn), '★ 화면이 급함을 다시 세지 않는다 — 서버 urgency 를 그대로 쓴다');
const rowFn = (html.split('function staskRow(t)')[1] || '').split('function toggleSchoolTaskFold')[0];
ok(/STASK_TONE\[t\.urgency\]/.test(rowFn), '색은 서버가 준 urgency 로만 정해진다');
ok(/data-urgency="\$\{t\.urgency\}"/.test(rowFn) && /data-bucket="\$\{t\.bucket\}"/.test(rowFn), '검사용 표식');
ok(/t\.mine/.test(rowFn) && /closeSchoolTask/.test(rowFn), '내리기는 올린 사람에게만 보인다');
ok(/escHtml\(t\.title\)/.test(rowFn) && /escHtml\(t\.detail\)/.test(rowFn), '★ 제목·내용 이스케이프');
ok(!/댓글|파일 첨부|채팅/.test(html.split('§J-10')[1] || ''), '★ 댓글·파일·채팅 없음(설계 결정)');
/* ★ 결정 ② — 아침 메일 v1 에는 싣지 않는다. 메일 쪽 어디에도 배선 0 */
const mailFiles = ['morning/index.html', 'morning/teacher.html', 'sql/setup_morning.sql', 'sql/setup_morning_review.sql'];
ok(mailFiles.every(f => { try { return !/school_task/.test(rd(f)); } catch (e) { return true; } }),
   '★ 아침활동·메일 쪽에 할 일판 배선 0(결정 ②)');

// ── ③ jsdom — 세 칸이 실제로 갈리는가 ─────────────────────────
(async () => {
  const REV = process.argv.includes('--rev');
  const rows = [
    { id:'t1', title:'수요조사 제출', detail:'', due_date:'2026-09-04', days_left:1, urgency:'red',
      bucket:'todo', mine:true, done:false, done_count:1, teacher_count:9, created_by_name:'준호', created_at:'' },
    { id:'t2', title:'교재 신청', detail:'2학기분', due_date:'2026-09-10', days_left:7, urgency:'normal',
      bucket:'todo', mine:false, done:false, done_count:3, teacher_count:9, created_by_name:'김', created_at:'' },
    { id:'t3', title:'안전 점검표', detail:'', due_date:'2026-08-30', days_left:-4, urgency:'past',
      bucket:'past', mine:false, done:false, done_count:2, teacher_count:9, created_by_name:'이', created_at:'' },
    { id:'t4', title:'연수 신청', detail:'', due_date:null, days_left:null, urgency:'none',
      bucket:'done', mine:false, done:true, done_count:9, teacher_count:9, created_by_name:'박', created_at:'' }
  ];
  const dom = new JSDOM('<!doctype html><body>' + (html.split('<!-- 우리 학교 할 일판')[1] || '').split('<!-- STATS -->')[0] + '</body>',
    { runScripts:'outside-only' });
  const w = dom.window, d = w.document;
  // 화면 함수만 떼어 실행 (엔진·Supabase 없이)
  const jsStart = html.indexOf('const STASK_TONE');
  const jsEnd = html.indexOf('// 우리 반에 열린 활동 (§F 「우리 반에 열기」)');
  ok(jsStart > 0 && jsEnd > jsStart, '하니스 — 조작 코드 구간 분리(스코프 함정 방지)');
  let code = html.slice(jsStart, jsEnd);
  if (REV) code = code.replace("bucket === 'past'", "bucket === '__none__'");   // 역검증: 지난 일 칸 해체
  w.eval('function escHtml(v){return String(v==null?"":v).replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\'":"&#39;"}[c]));}');
  w.eval('function showToast(){}');
  w.db = { rpc: async () => ({ data: rows, error: null }) };
  w.eval(code);
  await w.loadSchoolTasks();

  ok(d.getElementById('schooltask-wrap').hidden === false, 'jsdom — 목록이 오면 카드가 보인다');
  ok(d.getElementById('schooltask-count').textContent === '3개',
     '★ jsdom — 셈은 확인 안 한 것(할 일 2 + 지난 일 1)');
  const listIds = [...d.getElementById('schooltask-list').querySelectorAll('[data-stask]')].map(e => e.dataset.stask);
  ok(listIds.join(',') === 't1,t2', '★ jsdom — 상단 칸에는 확인 안 한 할 일만');
  const pastIds = [...d.getElementById('schooltask-past').querySelectorAll('[data-stask]')].map(e => e.dataset.stask);
  ok(pastIds.join(',') === 't3', '★★ jsdom — 기한 지난 일이 「지난 일」 칸에 남아 있다(결정 ③)');
  ok(d.getElementById('schooltask-past-wrap').hidden === false, 'jsdom — 지난 일 칸이 열린다');
  ok(d.getElementById('schooltask-past-count').textContent === '1', 'jsdom — 지난 일 개수');
  const doneIds = [...d.getElementById('schooltask-done').querySelectorAll('[data-stask]')].map(e => e.dataset.stask);
  ok(doneIds.join(',') === 't4', 'jsdom — 확인한 것은 아래 칸으로');
  const h = d.getElementById('schooltask-list').innerHTML;
  ok(h.indexOf('#E53E3E') >= 0, '★ jsdom — 임박한 할 일은 짙은 색');
  ok(h.indexOf('오늘·내일') >= 0 && h.indexOf('1일 남음') >= 0, 'jsdom — 남은 날 표시');
  ok(d.getElementById('schooltask-past').innerHTML.indexOf('4일 지남') >= 0, 'jsdom — 지난 날 표시');
  ok((h.match(/closeSchoolTask/g) || []).length === 1, 'jsdom — 내리기는 내가 올린 하나에만');
  ok(h.indexOf('확인 1 / 9명') >= 0, 'jsdom — 확인한 사람 수');
  // 접기
  w.toggleSchoolTaskFold('past');
  ok(d.getElementById('schooltask-past').hidden === false && d.getElementById('schooltask-past-caret').textContent === '▾',
     'jsdom — 지난 일 접기 토글');
  // 빈 목록 폴백
  w.db.rpc = async () => ({ data: [], error: null });
  await w.loadSchoolTasks();
  ok(d.getElementById('schooltask-list').innerHTML.indexOf('학교가 지정돼 있어야') >= 0,
     '★ jsdom — 빈 목록이면 학교 지정 안내(학교 미지정 교사)');
  ok(d.getElementById('schooltask-past-wrap').hidden === true, 'jsdom — 지난 일 칸은 닫힌다');
  // RPC 실패 폴백
  w.db.rpc = async () => ({ data: null, error: { message: 'function does not exist' } });
  await w.loadSchoolTasks();
  ok(d.getElementById('schooltask-wrap').hidden === true, '★ jsdom — SQL 미적용이면 카드가 통째로 숨는다(규칙 5)');

  console.log((fail === 0 ? '\u2705' : '\u274c') + ' 우리 학교 할 일판 — ' + pass + ' / ' + (pass + fail) + ' 통과' + (REV ? ' [역검증 모드]' : ''));
  process.exit(fail ? 1 : 0);
})();
