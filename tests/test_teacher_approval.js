#!/usr/bin/env node
/**
 * 교사 승인(교사 증명) 게이트 — 생태계설계 v2 §D · §J-1
 *  ① sql/setup_teacher_approval.sql 에 객체가 다 있나(테이블 2·컬럼 5·함수 8·트리거 2·정책 잠금 5)
 *  ② teacher/index.html — 배너·신청 RPC·createCode 가드 배선
 *  ③ admin/index.html  — 대기 표·승인/반려 RPC·정책 스위치 배선
 *  ④ 두 페이지 인라인 스크립트 문법
 * 실행: node tests/test_teacher_approval.js   (k-edu 루트)
 */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };

const sql = rd('sql/setup_teacher_approval.sql');
[
  'CREATE TABLE IF NOT EXISTS kedu_policy', 'CREATE TABLE IF NOT EXISTS edu_domains',
  "('auto_approve_edu_domains', 'false'::jsonb",
  'ADD COLUMN IF NOT EXISTS approval ', 'ADD COLUMN IF NOT EXISTS approved_at', 'ADD COLUMN IF NOT EXISTS approved_by',
  'ADD COLUMN IF NOT EXISTS approval_note', 'ADD COLUMN IF NOT EXISTS approval_requested_at',
  "CHECK (approval IN ('pending','auto','approved','rejected'))",
  'FUNCTION kedu_is_admin()', 'FUNCTION kedu_teacher_approved()', 'FUNCTION kedu_email_is_edu(',
  'FUNCTION _teachers_set_approval()', 'FUNCTION _teachers_protect_approval()',
  'FUNCTION admin_teacher_list()', 'FUNCTION admin_set_teacher_approval(', 'FUNCTION admin_set_policy(',
  'FUNCTION request_teacher_approval(',
  'CREATE TRIGGER trg_teachers_set_approval', 'CREATE TRIGGER trg_teachers_protect_approval',
  'CREATE POLICY admins_update_teachers',
].forEach(k => ok(sql.includes(k), 'SQL 누락: ' + k));

// 17개 시도 도메인
const doms = (sql.match(/\('([a-z]+\.go\.kr)','[^']+'\)/g) || []);
ok(doms.length === 17, 'edu_domains 시드 17개가 아님: ' + doms.length);

// §D-5 잠금 — 정책 다섯에 kedu_teacher_approved() 가 WITH CHECK 에 들어갔나
['teachers_insert_codes', 'cw_bundles_teacher', 'cw_items_teacher', 'cw_sends_teacher', 'p_ma_routines_teacher'].forEach(p => {
  const i = sql.indexOf('CREATE POLICY ' + p) >= 0 ? sql.indexOf('CREATE POLICY ' + p) : sql.indexOf('CREATE POLICY "' + p + '"');
  const block = sql.slice(i, sql.indexOf(';', i));
  ok(i >= 0 && /WITH CHECK \([\s\S]*kedu_teacher_approved\(\)/.test(block), '정책 잠금 누락: ' + p);
});
// 가입 트리거는 클라이언트 approval·is_admin 을 무시한다
ok(/NEW\.is_admin\s*:=\s*false/.test(sql), '가입 트리거 is_admin 강제 없음');
ok(/NEW\.approval\s*:=\s*'pending'/.test(sql), '가입 트리거 pending 기본 없음');
// 보호 트리거는 비관리자 approval 변경을 되돌린다
ok(/NEW\.approval\s*:=\s*OLD\.approval/.test(sql), '보호 트리거 되돌림 없음');
// 달러 인용 규칙
ok(!/\$\$/.test(sql), 'SQL 에 $$ 사용 — $fn$/$do$ 로');

const t = rd('teacher/index.html');
['id="approval-banner"', 'renderApprovalBanner()', "db.rpc('request_teacher_approval'", 'function teacherApproved()', 'if(!teacherApproved())']
  .forEach(k => ok(t.includes(k), 'teacher 배선 누락: ' + k));
ok(t.indexOf('renderApprovalBanner();') < t.indexOf('await loadClassCode();'), 'teacher: 배너가 학급코드 로드보다 먼저여야');

const a = rd('admin/index.html');
['id="pending-body"', "db.rpc('admin_teacher_list')", "db.rpc('admin_set_teacher_approval'", "db.rpc('admin_set_policy'", 'id="policy-auto"', 'function esc(']
  .forEach(k => ok(a.includes(k), 'admin 배선 누락: ' + k));

// 인라인 스크립트 문법
for (const [f, s] of [['teacher/index.html', t], ['admin/index.html', a]]) {
  for (const m of s.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    try { new Function(m[1]); ok(true); } catch (e) { ok(false, f + ' 스크립트 문법: ' + e.message); }
  }
}

console.log(`교사 승인 게이트 — ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
