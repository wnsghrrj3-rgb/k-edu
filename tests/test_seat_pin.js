#!/usr/bin/env node
/**
 * 학생 비밀번호(4자리 PIN) — sql/setup_seat_pin.sql (#40) + 두 화면 배선
 *  ① SQL: 해시 표(정책 0·권한 0) · claim_seat_v2 상태 기계 · v1 문 닫힘 · reset_seat_pin 담임만 · 쓰기 전 fresh_session
 *  ② index.html   — PIN 칸(setup 두 번·enter 한 번) · v2 호출 · fresh_session 재시도 1회 · #40 미적용 폴백 · 상태별 분기
 *  ③ teacher/index.html — 명단에 🔒/초기화됨/아직 · 초기화 단추(정한 학생만) · 열 없을 때 폴백
 *  실행: node tests/test_seat_pin.js   (k-edu 루트)
 *  서버 동작은 tests/pg/seat_pin_scenarios.sql 로 로컬 PG 에서 45건 재현(2026-09-03 45/0).
 */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };
const between = (s, a, b) => { const i = s.indexOf(a); if (i < 0) return ''; const j = s.indexOf(b, i); return s.slice(i, j < 0 ? undefined : j); };

// ── ① SQL
const sql = rd('sql/setup_seat_pin.sql');
[
  'CREATE TABLE IF NOT EXISTS student_seat_pins',
  'ALTER TABLE student_seat_pins ENABLE ROW LEVEL SECURITY',
  'REVOKE ALL ON student_seat_pins FROM anon, authenticated',
  'ADD COLUMN IF NOT EXISTS pin_set_at',
  'ADD COLUMN IF NOT EXISTS pin_reset_at',
  'FUNCTION claim_seat_v2(p_class_code text, p_nickname text, p_pin text DEFAULT NULL)',
  'FUNCTION reset_seat_pin(p_seat_id uuid)',
  "REVOKE EXECUTE ON FUNCTION claim_seat(text, text) FROM authenticated, anon, public",
  "GRANT EXECUTE ON FUNCTION claim_seat_v2(text, text, text) TO authenticated",
  "GRANT EXECUTE ON FUNCTION reset_seat_pin(uuid) TO authenticated",
].forEach(k => ok(sql.includes(k), 'SQL 누락: ' + k));
ok(!/CREATE POLICY[^\n]*student_seat_pins/.test(sql), '해시 표에 정책이 생겼다 — RPC 전용이어야 한다');
ok(!/ADD COLUMN IF NOT EXISTS pin_hash/.test(sql), '해시가 student_seats 에 있다 — 교사 명단이 읽는 표에 두지 않는다');

const v2 = between(sql, 'FUNCTION claim_seat_v2(', '$fn$;');
// 상태 기계 — 서버가 말하는 상태 전부
['no_session','not_found','pin_invalid','inactive','pin_locked','pin_required','pin_wrong','fresh_session','taken','pin_setup','created','reclaim']
  .forEach(st => ok(new RegExp("'status',\\s*'" + st + "'|v_status := '" + st + "'").test(v2), 'claim_seat_v2 상태 누락: ' + st));
// 4자리 숫자만
ok(/v_pin !~ '\^\[0-9\]\{4\}\$'/.test(v2), '4자리 숫자 검사 누락');
// bcrypt
ok(/crypt\(v_pin, gen_salt\('bf', 10\)\)/.test(v2), 'bcrypt 해시 누락');
ok(/crypt\(v_pin, v_hash\) <> v_hash/.test(v2), '해시 대조 누락');
ok(!/pin_hash\s*=\s*v_pin\b/.test(v2) && !/VALUES \(v_seat_id, v_pin\)/.test(v2), '평문 저장');
// 동의·활성 통합 오류(열거 방지)
ok(/v_active IS NOT TRUE OR v_consent IS NOT TRUE THEN RETURN nf/.test(v2), '미동의 학급 통합 오류 누락');
// 잠금 5회·5분
ok(/c_max_fail constant int := 5/.test(v2) && /c_lock constant interval := '5 minutes'/.test(v2), '잠금 상수(5회·5분) 누락');
ok(/locked_until = now\(\) \+ c_lock/.test(v2), '잠금 기록 누락');
// 정할 수 있는 사람 = 빈 자리 · 같은 기기 · 담임 초기화
ok(/v_may_set := \(v_claimed_by IS NULL\) OR \(v_owner_uid = v_uid\) OR \(v_reset_at IS NOT NULL\)/.test(v2), '정하기 허용 조건 누락(빈 자리·같은 기기·초기화)');
// fresh_session 은 쓰기 전에 돌아간다: 두 분기 모두 INSERT/UPDATE 앞
{
  const setBranch = between(v2, "IF v_pin IS NULL THEN RETURN jsonb_build_object('status','pin_setup')", 'INSERT INTO student_seat_pins');
  ok(/fresh_session/.test(setBranch), '정하기 분기에서 fresh_session 이 저장 앞에 없다');
  const verBranch = between(v2, "crypt(v_pin, v_hash) <> v_hash", 'v_claimed_by IS NULL THEN');
  ok(/fresh_session/.test(verBranch), '확인 분기에서 fresh_session 이 묶기 앞에 없다');
}
// 다른 기기였으면 프로필 user_id 를 옮긴다(기록 보존) — 새 프로필을 만들지 않는다
ok(/UPDATE student_profiles SET user_id = v_uid, last_seen_at = now\(\) WHERE id = v_profile/.test(v2), '기기 이동(rebound) 누락');
ok((v2.match(/INSERT INTO student_profiles/g) || []).length === 1, '프로필 INSERT 는 빈 자리 한 곳뿐이어야 한다');
// 초기화 뒤 표식 지움
ok(/UPDATE student_seats SET pin_set_at = now\(\), pin_reset_at = NULL/.test(v2), 'PIN 정하면 pin_reset_at 을 지운다');
// reset_seat_pin — 담임·승인·본인 학급
const rs = between(sql, 'FUNCTION reset_seat_pin(', '$fn$;');
ok(/NOT kedu_teacher_approved\(\)/.test(rs), 'reset 승인 검사 누락');
ok(/t\.user_id = auth\.uid\(\)/.test(rs), 'reset 본인 학급 검사 누락');
ok(/DELETE FROM student_seat_pins WHERE seat_id = p_seat_id/.test(rs), 'reset 해시 삭제 누락');
ok(/pin_set_at = NULL, pin_reset_at = now\(\)/.test(rs), 'reset 표식 누락');
// 재실행 안전
ok(/CREATE TABLE IF NOT EXISTS/.test(sql) && !/DROP TABLE/.test(sql), '재실행 안전 아님(DROP TABLE)');

// ── ② index.html
const ix = rd('index.html');
['id="entry-pin-row"', 'id="entry-pin"', 'id="entry-pin2-row"', 'id="entry-pin2"', 'id="entry-pin-hint"', 'id="entry-pin-label"']
  .forEach(k => ok(ix.includes(k), 'index PIN 칸 누락: ' + k));
ok(/id="entry-pin" type="password" inputmode="numeric"[^>]*maxlength="4"/.test(ix), 'PIN 입력이 숫자 4자리 password 가 아니다');
ok(/db\.rpc\('claim_seat_v2', \{ p_class_code: code, p_nickname: nick, p_pin: pin \}\)/.test(ix), 'claim_seat_v2 호출 누락');
ok(/for\(let attempt = 0; attempt < 2; attempt\+\+\)/.test(ix), 'fresh_session 재시도가 1회로 묶이지 않음');
ok(/claim\.status !== 'fresh_session'\) break;\s*await db\.auth\.signOut\(\);\s*const \{ data: anonData, error: anonError \} = await db\.auth\.signInAnonymously\(\);/.test(ix), 'fresh_session → 새 익명 세션 순서 누락');
ok(/\/claim_seat_v2\|schema cache\/i\.test\(claimError\.message/.test(ix) && /db\.rpc\('claim_seat', \{ p_class_code: code, p_nickname: nick \}\)/.test(ix), '#40 미적용 폴백(v1) 누락');
ok(/status === 'pin_setup' \|\| status === 'pin_required'/.test(ix) && /setPinMode\(status === 'pin_setup' \? 'setup' : 'enter'\)/.test(ix), 'pin_setup/pin_required 분기 누락');
['pin_wrong','pin_locked','pin_invalid'].forEach(st => ok(ix.includes("status === '" + st + "'"), 'index 상태 분기 누락: ' + st));
// setup 은 두 번 같게, enter 는 한 번
ok(/if\(pin !== pin2\)/.test(ix), 'setup 두 번 대조 누락');
ok(/row2\.style\.display = mode === 'setup' \? 'flex' : 'none'/.test(ix), '한 번 더 칸이 setup 에서만 열리지 않음');
// PIN 은 칸이 열려 있을 때만 보낸다(첫 호출은 null → 서버가 모드를 정한다)
ok(/let pin = null;\s*if\(_pinMode\)\{/.test(ix), '첫 호출이 PIN 없이 가지 않는다');
ok(/if\(pin\.length !== 4\)\{ showError/.test(ix), '4자리 클라이언트 검사 누락');
// 이름·코드 바꾸면 모드 초기화 (서버가 이름마다 다시 정한다)
ok(/getElementById\('entry-nickname'\)\.addEventListener\('input', \(\) => \{ setPinMode\(null\); updateEntryBtn\(\); \}\)/.test(ix), '이름 바꿀 때 PIN 모드 초기화 누락');
ok(/getElementById\('entry-class-code'\)\.addEventListener\('input', \(\) => \{ setPinMode\(null\)/.test(ix), '코드 바꿀 때 PIN 모드 초기화 누락');
// 게스트(이름 없음) 경로는 PIN 무관 — nick 비면 모드 숨김
ok(/if\(!nick\) setPinMode\(null\);/.test(ix), '이름 없음(게스트)에서 PIN 칸이 남는다');
ok(/_pinMode === 'setup' \? '비밀번호 정하고 입장' : '입장'/.test(ix), '단추 문구 누락');
// 성공 시 칸 정리
ok(/if\(status === 'created' \|\| status === 'reclaim'\) setPinMode\(null\);/.test(ix), '입장 뒤 PIN 칸 정리 누락');

// ── ③ teacher/index.html
const te = rd('teacher/index.html');
ok(/\.select\('id, nickname, seat_no, claim_code, claimed_by, claimed_at, created_at, pin_set_at, pin_reset_at'\)/.test(te), '명단 조회에 pin 열 없음');
ok(/\/pin_set_at\|pin_reset_at\/\.test\(error\.message/.test(te), '열 없을 때(#40 미적용) 폴백 누락');
ok(/_seatPinCols = !error;/.test(te), '#40 적용 판정 누락');
ok(!/pin_hash/.test(te), '교사 화면이 해시를 읽는다');
ok(/if\(s\.pin_set_at\)\{[\s\S]*?resetSeatPin\('\$\{s\.id\}'/.test(te), '초기화 단추가 정한 학생에게만 붙지 않음');
ok(/else if\(s\.pin_reset_at\)\{[\s\S]*?초기화됨/.test(te), '초기화됨 표시 누락');
ok(/비밀번호 아직/.test(te), '아직 표시 누락');
ok(/async function resetSeatPin\(seatId, nickname\)/.test(te) && /db\.rpc\('reset_seat_pin', \{ p_seat_id: seatId \}\)/.test(te), 'reset RPC 호출 누락');
ok(/if\(!confirm\(/.test(between(te, 'async function resetSeatPin', 'await loadSeatsList')), '초기화 확인창 누락');
ok(/학습 기록은 그대로예요/.test(te), '초기화가 기록을 지우지 않는다는 문면 누락');
// 2026-09-04 되돌림(SQL #41): 명단의 PIN 표시는 스위치로 꺼 둔다. 표·열·RPC 는 그대로 남아 다시 켤 수 있다.
ok(/if\(_seatPinCols && SEAT_PIN_UI\)\{/.test(te), '열 없으면 PIN 표시를 통째로 숨기지 않음');
ok(/const SEAT_PIN_UI = false;/.test(te), 'PIN 표시 스위치가 꺼져 있지 않다(2026-09-04 되돌림)');

// ── 인라인 스크립트 문법
[['index.html', ix], ['teacher/index.html', te]].forEach(([f, s]) => {
  try {
    const m = s.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g, '');
    new Function(m); pass++;
  } catch (e) { fail++; console.log('  ✗ 문법 오류', f, e.message); }
});

console.log(`test_seat_pin: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
