\set QUIET on
\pset format unaligned
\pset tuples_only on
CREATE OR REPLACE FUNCTION as_uid(u text) RETURNS void LANGUAGE sql AS $$ SELECT set_config('t.uid', u, false) $$;
CREATE TEMP TABLE res(n int, name text, got text, want text);
CREATE OR REPLACE FUNCTION chk(n int, name text, got jsonb, want text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN INSERT INTO res VALUES (n, name, got->>'status', want); END $$;
-- 1 세션 없음
SELECT as_uid(''); SELECT chk(1,'세션 없음', claim_seat_v2('ABCD','하늘',NULL), 'no_session');
-- 2 미동의 학급
SELECT as_uid('00000000-0000-0000-0000-000000000001'); SELECT chk(2,'미동의 학급', claim_seat_v2('NOCO','하늘',NULL), 'not_found');
-- 3 없는 이름
SELECT chk(3,'없는 이름', claim_seat_v2('ABCD','없음',NULL), 'not_found');
-- 4 첫 접속: PIN 없이 → pin_setup (아무것도 안 씀)
SELECT chk(4,'첫 접속 pin_setup', claim_seat_v2('ABCD','하늘',NULL), 'pin_setup');
SELECT chk(5,'pin_setup 뒤 자리 그대로 빔', CASE WHEN (SELECT claimed_by FROM student_seats WHERE nickname='하늘') IS NULL THEN '{"status":"empty"}' ELSE '{"status":"x"}' END::jsonb, 'empty');
-- 6 잘못된 형식
SELECT chk(6,'3자리', claim_seat_v2('ABCD','하늘','123'), 'pin_invalid');
SELECT chk(7,'글자', claim_seat_v2('ABCD','하늘','ab12'), 'pin_invalid');
-- 8 정해서 입장
SELECT chk(8,'하늘 PIN 1234 설정→created', claim_seat_v2('ABCD','하늘','1234'), 'created');
SELECT chk(9,'해시 저장·평문 아님', CASE WHEN (SELECT pin_hash FROM student_seat_pins p JOIN student_seats s ON s.id=p.seat_id WHERE s.nickname='하늘') LIKE '$2%' THEN '{"status":"hash"}' ELSE '{"status":"x"}' END::jsonb, 'hash');
SELECT chk(10,'pin_set_at 찍힘', CASE WHEN (SELECT pin_set_at FROM student_seats WHERE nickname='하늘') IS NOT NULL THEN '{"status":"y"}' ELSE '{"status":"x"}' END::jsonb, 'y');
-- 11 같은 기기 재접속: PIN 없이 → pin_required
SELECT chk(11,'재접속 pin_required', claim_seat_v2('ABCD','하늘',NULL), 'pin_required');
-- 12 틀림
SELECT chk(12,'틀림 pin_wrong', claim_seat_v2('ABCD','하늘','0000'), 'pin_wrong');
SELECT chk(13,'남은 횟수 4', CASE WHEN (claim_seat_v2('ABCD','하늘','0001')->>'left')='3' THEN '{"status":"3"}' ELSE '{"status":"x"}' END::jsonb, '3');
-- 14 맞음 → reclaim, fail 초기화
SELECT chk(14,'맞음 reclaim', claim_seat_v2('ABCD','하늘','1234'), 'reclaim');
SELECT chk(15,'fail_n 0 복귀', CASE WHEN (SELECT fail_n FROM student_seat_pins) = 0 THEN '{"status":"0"}' ELSE '{"status":"x"}' END::jsonb, '0');
-- 16 다른 기기(uid2, 프로필 없음)가 이름만 → pin_required (taken 아님)
SELECT as_uid('00000000-0000-0000-0000-000000000002');
SELECT chk(16,'다른 기기 pin_required', claim_seat_v2('ABCD','하늘',NULL), 'pin_required');
-- 17 다른 기기 틀린 PIN → 못 들어감
SELECT chk(17,'다른 기기 오답', claim_seat_v2('ABCD','하늘','9999'), 'pin_wrong');
-- 18 다른 기기 맞는 PIN → reclaim + rebound, 프로필 user_id 이동
SELECT chk(18,'다른 기기 정답 reclaim', claim_seat_v2('ABCD','하늘','1234'), 'reclaim');
SELECT chk(19,'프로필이 uid2 로 옮겨짐', CASE WHEN (SELECT user_id FROM student_profiles WHERE nickname='하늘')='00000000-0000-0000-0000-000000000002' THEN '{"status":"y"}' ELSE '{"status":"x"}' END::jsonb, 'y');
SELECT chk(20,'프로필 수 1(복제 없음)', CASE WHEN (SELECT count(*) FROM student_profiles WHERE nickname='하늘')=1 THEN '{"status":"1"}' ELSE '{"status":"x"}' END::jsonb, '1');
-- 21 uid2(하늘 기기)에서 바다로 첫 접속 → pin_setup → PIN 주면 fresh_session (쓰기 0)
SELECT chk(21,'공용 기기 바다 pin_setup', claim_seat_v2('ABCD','바다',NULL), 'pin_setup');
SELECT chk(22,'공용 기기 바다 fresh_session', claim_seat_v2('ABCD','바다','5678'), 'fresh_session');
SELECT chk(23,'fresh_session 은 PIN 안 씀', CASE WHEN (SELECT count(*) FROM student_seat_pins)=1 THEN '{"status":"1"}' ELSE '{"status":"x"}' END::jsonb, '1');
SELECT chk(24,'fresh_session 은 자리 안 씀', CASE WHEN (SELECT claimed_by FROM student_seats WHERE nickname='바다') IS NULL THEN '{"status":"y"}' ELSE '{"status":"x"}' END::jsonb, 'y');
-- 25 새 세션(uid1 은 이제 프로필 없음 — 하늘이 uid2 로 갔으니) 에서 바다 설정
SELECT as_uid('00000000-0000-0000-0000-000000000001');
SELECT chk(25,'새 세션 바다 created', claim_seat_v2('ABCD','바다','5678'), 'created');
-- 26 옛 좌석(구름, uid3 묶임, PIN 없음): uid3 → pin_setup, 다른 uid → taken
SELECT as_uid('00000000-0000-0000-0000-000000000003');
SELECT chk(26,'옛 좌석 같은 기기 pin_setup', claim_seat_v2('ABCD','구름',NULL), 'pin_setup');
SELECT as_uid('00000000-0000-0000-0000-000000000004');
SELECT chk(27,'옛 좌석 다른 기기 taken', claim_seat_v2('ABCD','구름',NULL), 'taken');
SELECT chk(28,'옛 좌석 다른 기기 PIN 줘도 taken', claim_seat_v2('ABCD','구름','1111'), 'taken');
-- 29 담임 초기화: 미승인 교사 거부, 남의 학급 거부, 본인 통과
SELECT as_uid('00000000-0000-0000-0000-000000000004');
DO $$ BEGIN PERFORM reset_seat_pin('30000000-0000-0000-0000-000000000003'); INSERT INTO res VALUES (29,'미승인 교사 초기화','ok','error'); EXCEPTION WHEN OTHERS THEN INSERT INTO res VALUES (29,'미승인 교사 초기화','error','error'); END $$;
SELECT as_uid('00000000-0000-0000-0000-00000000000a');
DO $$ BEGIN PERFORM reset_seat_pin(gen_random_uuid()); INSERT INTO res VALUES (30,'남의/없는 자리 초기화','ok','error'); EXCEPTION WHEN OTHERS THEN INSERT INTO res VALUES (30,'남의/없는 자리 초기화','error','error'); END $$;
SELECT chk(31,'담임 초기화 ok', reset_seat_pin('30000000-0000-0000-0000-000000000003'), 'ok');
SELECT chk(32,'pin_reset_at 찍힘', CASE WHEN (SELECT pin_reset_at FROM student_seats WHERE nickname='구름') IS NOT NULL THEN '{"status":"y"}' ELSE '{"status":"x"}' END::jsonb, 'y');
-- 33 초기화 뒤 다른 기기(uid4)에서 정하고 입장 → reclaim + rebound(기록 유지)
SELECT as_uid('00000000-0000-0000-0000-000000000004');
SELECT chk(33,'초기화 뒤 다른 기기 pin_setup', claim_seat_v2('ABCD','구름',NULL), 'pin_setup');
SELECT chk(34,'초기화 뒤 정하고 reclaim', claim_seat_v2('ABCD','구름','2468'), 'reclaim');
SELECT chk(35,'구름 프로필 id 유지(기록 보존)', CASE WHEN (SELECT id FROM student_profiles WHERE nickname='구름')='40000000-0000-0000-0000-000000000003' THEN '{"status":"y"}' ELSE '{"status":"x"}' END::jsonb, 'y');
SELECT chk(36,'pin_reset_at 지워짐', CASE WHEN (SELECT pin_reset_at FROM student_seats WHERE nickname='구름') IS NULL THEN '{"status":"y"}' ELSE '{"status":"x"}' END::jsonb, 'y');
-- 37 하늘 초기화 → 하늘 기기(uid2) 다시 정할 때 옛 PIN 은 안 통함
SELECT as_uid('00000000-0000-0000-0000-00000000000a'); SELECT reset_seat_pin('30000000-0000-0000-0000-000000000001');
SELECT as_uid('00000000-0000-0000-0000-000000000002');
SELECT chk(37,'초기화 뒤 옛 PIN 은 새 PIN 이 됨(setup)', claim_seat_v2('ABCD','하늘',NULL), 'pin_setup');
SELECT chk(38,'새 PIN 설정 reclaim', claim_seat_v2('ABCD','하늘','1111'), 'reclaim');
-- 39 잠금: 5회 틀림 → pin_locked, 정답도 잠김
SELECT as_uid('00000000-0000-0000-0000-000000000001');
SELECT claim_seat_v2('ABCD','바다','0000'); SELECT claim_seat_v2('ABCD','바다','0000'); SELECT claim_seat_v2('ABCD','바다','0000'); SELECT claim_seat_v2('ABCD','바다','0000');
SELECT chk(39,'5회째 pin_locked', claim_seat_v2('ABCD','바다','0000'), 'pin_locked');
SELECT chk(40,'잠긴 동안 정답도 pin_locked', claim_seat_v2('ABCD','바다','5678'), 'pin_locked');
UPDATE student_seat_pins SET locked_until = now() - interval '1 second';
SELECT chk(41,'잠금 풀리면 정답 통과', claim_seat_v2('ABCD','바다','5678'), 'reclaim');
-- 42 v1 닫힘
SELECT chk(42,'v1 authenticated 실행권 없음', CASE WHEN has_function_privilege('authenticated','claim_seat(text,text)','EXECUTE') THEN '{"status":"open"}' ELSE '{"status":"closed"}' END::jsonb, 'closed');
SELECT chk(43,'pins 표 정책 0', CASE WHEN (SELECT count(*) FROM pg_policies WHERE tablename='student_seat_pins')=0 THEN '{"status":"0"}' ELSE '{"status":"x"}' END::jsonb, '0');
SELECT chk(44,'pins 표 authenticated SELECT 없음', CASE WHEN has_table_privilege('authenticated','student_seat_pins','SELECT') THEN '{"status":"x"}' ELSE '{"status":"none"}' END::jsonb, 'none');
-- 45 처리정지
UPDATE student_profiles SET is_active=false WHERE nickname='구름';
SELECT as_uid('00000000-0000-0000-0000-000000000004');
SELECT chk(45,'처리정지 inactive', claim_seat_v2('ABCD','구름','2468'), 'inactive');
SELECT n||' '||name||' → '||got||CASE WHEN got=want THEN ' ✓' ELSE ' ✗ (want '||want||')' END FROM res ORDER BY n;
SELECT 'PASS '||count(*) FILTER (WHERE got=want)||' / FAIL '||count(*) FILTER (WHERE got<>want) FROM res;
