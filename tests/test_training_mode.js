#!/usr/bin/env node
/**
 * 연수 모드 — sql/setup_training_mode.sql (#38) + 세 화면 배선
 *  ① SQL: 컬럼·정책행·함수 5·트리거 재정의(원본 보호 규칙 유지)
 *  ② auth/index.html    — 연수 코드 칸·메타데이터·insert 폴백
 *  ③ teacher/index.html — 배너 코드 청구·자가복구 전달
 *  ④ admin/index.html   — 연수 모드 줄·모두 승인·자동 새로고침
 * 실행: node tests/test_training_mode.js   (k-edu 루트)
 */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };

// ── ① SQL
const sql = rd('sql/setup_training_mode.sql');
[
  'ADD COLUMN IF NOT EXISTS signup_code',
  "('training', 'null'::jsonb",
  'FUNCTION kedu_training_active()',
  'FUNCTION _teachers_set_approval()',
  'FUNCTION _teachers_protect_approval()',
  'FUNCTION claim_training_code(',
  'FUNCTION admin_set_training(',
  'FUNCTION admin_clear_training()',
  'FUNCTION admin_training_status()',
  'FUNCTION admin_approve_all_pending()',
  'CREATE TRIGGER trg_teachers_protect_approval',
].forEach(k => ok(sql.includes(k), 'SQL 누락: ' + k));

// 코드는 저장되지 않는다
ok(/NEW\.signup_code := NULL/.test(sql), '가입 트리거가 signup_code 를 비우지 않음');
// 만료 검사
ok(/\(value->>'until'\)::timestamptz > now\(\)/.test(sql), '만료 검사 누락');
// 재정의한 보호 트리거가 #23 의 되돌림 규칙을 그대로 유지하는가
const prot = sql.slice(sql.indexOf('FUNCTION _teachers_protect_approval()'));
['NEW.approval    := OLD.approval', 'NEW.approved_at := OLD.approved_at',
 'NEW.approved_by := OLD.approved_by', 'NEW.is_admin    := OLD.is_admin',
 'NEW.user_id     := OLD.user_id'].forEach(k => ok(prot.includes(k), '보호 트리거 되돌림 누락: ' + k));
ok(/insufficient_privilege/.test(prot), '보호 트리거의 자가승격 차단 누락');
// 우회는 청구 함수 안에서만
ok(/current_setting\('kedu\.training_claim', true\) = 'on'/.test(sql), '청구 우회 조건 누락');
ok((sql.match(/set_config\('kedu\.training_claim'/g) || []).length === 2, '청구 우회를 켜고 끄는 짝이 안 맞음');
// 관리자 전용
['admin_set_training', 'admin_clear_training', 'admin_training_status', 'admin_approve_all_pending'].forEach(fn => {
  const i = sql.indexOf('FUNCTION ' + fn);
  const body = sql.slice(i, sql.indexOf('$fn$;', i));
  ok(/NOT kedu_is_admin\(\)/.test(body), '관리자 검사 누락: ' + fn);
});

// ── ② auth
const auth = rd('auth/index.html');
ok(auth.includes('id="signup-teacher-code"'), 'auth 연수 코드 입력칸 없음');
ok(auth.includes("getElementById('group-teacher-code').style.display"), 'auth 코드 칸 역할 토글 없음');
ok(auth.includes('teacher_signup_code:'), 'auth 메타데이터에 코드 없음');
ok(/row\.signup_code = signupCode/.test(auth), 'auth insert 에 signup_code 없음');
ok(/\/signup_code\/\.test\(error\.message/.test(auth), 'auth #38 미적용 폴백 없음');

// ── ③ teacher
const te = rd('teacher/index.html');
ok(te.includes('id="approval-code"'), 'teacher 코드 입력칸 없음');
ok(te.includes("db.rpc('claim_training_code'"), 'teacher 코드 청구 RPC 없음');
ok(/healRow\.signup_code = meta\.teacher_signup_code/.test(te), 'teacher 자가복구에 코드 전달 없음');
ok(/\/signup_code\/\.test\(healErr\.message/.test(te), 'teacher 자가복구 폴백 없음');

// ── ④ admin
const ad = rd('admin/index.html');
[
  'id="training-code"', 'id="training-off"', 'id="approve-all-btn"', 'id="pending-auto-refresh"',
  "db.rpc('admin_set_training'", "db.rpc('admin_clear_training')", "db.rpc('admin_training_status')",
  "db.rpc('admin_approve_all_pending')", 'function togglePendingRefresh', 'await loadTraining();',
].forEach(k => ok(ad.includes(k), 'admin 배선 누락: ' + k));
ok(/SQL #38/.test(ad), 'admin 미적용 안내 문구 없음');

// ── 인라인 스크립트 문법
[['auth/index.html', auth], ['teacher/index.html', te], ['admin/index.html', ad]].forEach(([f, s]) => {
  try {
    const m = s.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g, '');
    new Function(m); pass++;
  } catch (e) { fail++; console.log('  ✗ 문법 오류', f, e.message); }
});

console.log(`연수 모드: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
