-- =============================================
-- K-edu Supabase 학년 와이프 자동화 — 적법성 갭 #3 마감
-- 작성: 2026-04-29 (사이클 ㊳)
-- 명세: handoff/kedu/2026-04-28_kedu_적합성_처리방침_v2.md 제4조
-- 처리방침 v2.1 부록 2 검증표 line "제4조 학년 와이프" 대응
-- 분할: 본 파일 = SQL 단위. FE D-day 카운트다운 배지 = 본 사이클 teacher/index.html.
--
-- 본 마이그레이션은 멱등(idempotent) — 재실행 안전.
-- 실행 전 필수: setup_tables.sql, setup_student_profiles.sql, setup_diagnosis_v2.sql,
--               setup_consent_confirmed.sql, setup_data_requests.sql
--
-- 「개인정보 보호법」 대응:
--   - 제15조·제17조 수집 목적 달성 후 보유기간 종료 시 지체없이 파기
--   - 제21조 개인정보의 파기 — 학년 단위 데이터 격리 원칙
-- 처리방침 v2.1 제4조 약속 (보유기간 = "매년 2월 28일 자정(KST)"):
--   - 학생 닉네임·학급 정보 → 자동 와이프(3월 1일 새 학년 전 일괄 삭제)
--   - 학생 학습 데이터(점수·진단·오답노트·숙제 이력) → 자동 와이프
--   - 학급코드 → 자동 비활성화 및 삭제
--
-- 와이프 시점 정확한 정의:
--   처리방침 본문 "매년 2월 28일 자정(KST)" + "3월 1일 새 학년 전" 부연
--   → 한국에서 2월 28일이 끝나는 시점 = 평년 KST 3월 1일 00:00 / 윤년 KST 2월 29일 00:00
--   → 둘 다 UTC 매년 2월 28일 15:00 으로 일관 (UTC=KST-9h)
--   → cron 표현: '0 15 28 2 *' (분=0 시=15 일=28 월=2 요일=*)
--
-- 보존 (와이프 대상 아님):
--   - teachers (회원 탈퇴 시까지 보존 — 제4조)
--   - auth.users (학생 본인 의사로만 삭제 — 제8조 1) 삭제권. 본 함수는 student_profiles row만 와이프)
--   - data_requests (3년 보존 — 제4조. target_*_id는 ON DELETE SET NULL 자동 처리)
--   - contents/lesson_concepts/premium_settings (학습 콘텐츠 메타 — 학생 데이터 아님)
-- =============================================


-- =============================================
-- [SECTION 1] pg_cron 확장 활성화
-- Supabase Dashboard > Database > Extensions에서 사전 활성화 권장.
-- 본 라인은 권한 부족 시 NOTICE만 띄우고 통과 — 멱등성 유지.
-- =============================================
DO $do$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  RAISE NOTICE 'pg_cron extension OK';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'pg_cron CREATE EXTENSION 권한 없음 — Dashboard > Database > Extensions에서 pg_cron 활성화 후 본 파일 재실행하세요.';
END $do$;


-- =============================================
-- [SECTION 2] 와이프 함수 — wipe_student_data_yearly()
-- 처리방침 v2.1 제4조 약속 풀세트 와이프 (학습 데이터 + 닉네임·학급 + 학급코드).
--
-- 호출자 권한 (둘 중 하나 충족):
--   (a) postgres / supabase_admin (pg_cron 자동 호출 시)
--   (b) is_admin=true 교사 (대시보드 수동 호출 시)
--
-- 기존 wipe_student_data()는 admin 수동용으로 그대로 유지 (학습 데이터 부분 와이프).
-- 본 함수는 처리방침 약속 풀세트 + cron 호출 가능 형태.
-- =============================================
CREATE OR REPLACE FUNCTION wipe_student_data_yearly()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller text := current_user;
  v_uid uuid := auth.uid();
  v_is_cron boolean := v_caller IN ('postgres', 'supabase_admin');
  v_is_admin boolean := EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = v_uid AND t.is_admin = true);

  c_scores bigint;
  c_wrong  bigint;
  c_hwc    bigint;
  c_hw     bigint;
  c_pl     bigint;
  c_seats  bigint;
  c_prof   bigint;
  c_codes  bigint;
BEGIN
  -- 권한 검증
  IF NOT (v_is_cron OR v_is_admin) THEN
    RAISE EXCEPTION 'wipe_student_data_yearly: cron(postgres/supabase_admin) 또는 admin 교사만 호출 가능 (caller=%, auth.uid=%)',
      v_caller, v_uid;
  END IF;

  -- ────────────────────────────────────────────
  -- 1. 학습 데이터 와이프 (제4조 "학생 학습 데이터")
  -- ────────────────────────────────────────────
  DELETE FROM scores;                  GET DIAGNOSTICS c_scores = ROW_COUNT;
  DELETE FROM wrong_answers;           GET DIAGNOSTICS c_wrong  = ROW_COUNT;
  DELETE FROM homework_completions;    GET DIAGNOSTICS c_hwc    = ROW_COUNT;
  DELETE FROM homework_assignments;    GET DIAGNOSTICS c_hw     = ROW_COUNT;

  -- ────────────────────────────────────────────
  -- 2. 학생 매핑·슬롯 와이프 (student_profiles DELETE 전 — claimed_by RESTRICT 회피)
  -- ────────────────────────────────────────────
  DELETE FROM parent_student_links;    GET DIAGNOSTICS c_pl    = ROW_COUNT;
  DELETE FROM student_seats;           GET DIAGNOSTICS c_seats = ROW_COUNT;

  -- ────────────────────────────────────────────
  -- 3. 학생 닉네임·학급 정보 와이프 (제4조 "학생 닉네임·학급 정보 일괄 삭제")
  --    student_profiles row 자체 DELETE.
  --    auth.users는 보존 — 학생 본인 의사로만 삭제 (제8조 1) 삭제권).
  --    student_profiles만 사라지면 학생은 다음 학년 입장 시 새 row 생성.
  -- ────────────────────────────────────────────
  DELETE FROM student_profiles;        GET DIAGNOSTICS c_prof = ROW_COUNT;

  -- ────────────────────────────────────────────
  -- 4. 학급코드 와이프 (제4조 "학급코드 자동 비활성화 및 삭제")
  --    student_profiles 삭제 후이므로 class_codes(id) 참조 정리됨.
  --    homework_assignments는 위 단계에서 이미 비었음.
  --    data_requests.target_class_code_id는 ON DELETE SET NULL 자동.
  -- ────────────────────────────────────────────
  DELETE FROM class_codes;             GET DIAGNOSTICS c_codes = ROW_COUNT;

  -- ────────────────────────────────────────────
  -- 5. 처리 이력 기록 (제38조 처리 통보 의무 — 본 와이프 자체도 권리 행사 통계로 추적)
  --    target_student_id, target_class_code_id 모두 NULL (전체 와이프)
  --    requester_user_id = v_uid (cron 호출 시 NULL 가능 — 시스템 자동)
  -- ────────────────────────────────────────────
  INSERT INTO data_requests (
    request_type, requester_type, requester_info, requester_user_id,
    target_student_id, target_class_code_id, status, note, processed_at
  )
  VALUES (
    'delete', 'admin',
    CASE WHEN v_is_cron THEN 'system:pg_cron' ELSE 'admin:manual' END,
    v_uid,
    NULL, NULL, 'completed',
    format('학년 와이프 자동 실행 — scores=%s, wrong_answers=%s, homework_completions=%s, homework_assignments=%s, parent_student_links=%s, student_seats=%s, student_profiles=%s, class_codes=%s',
      c_scores, c_wrong, c_hwc, c_hw, c_pl, c_seats, c_prof, c_codes),
    now()
  );

  RETURN jsonb_build_object(
    'wiped_at', now(),
    'caller', v_caller,
    'is_cron', v_is_cron,
    'counts', jsonb_build_object(
      'scores', c_scores,
      'wrong_answers', c_wrong,
      'homework_completions', c_hwc,
      'homework_assignments', c_hw,
      'parent_student_links', c_pl,
      'student_seats', c_seats,
      'student_profiles', c_prof,
      'class_codes', c_codes
    )
  );
END $$;

COMMENT ON FUNCTION wipe_student_data_yearly() IS
  '처리방침 v2.1 제4조 학년 와이프 풀세트 — 학습 데이터 + 학생 닉네임·학급 + 학급코드. 매년 2/28 KST 자정 pg_cron 자동 호출 또는 admin 수동 호출. data_requests 자동 기록.';


-- =============================================
-- [SECTION 3] 와이프 D-day 헬퍼 — next_yearly_wipe_at()
-- FE 카운트다운 배지·교사 대시보드 알림용. 다음 와이프 시점 반환.
-- 호출 시점에 따라 올해 또는 내년 2/28 15:00 UTC 반환.
-- =============================================
CREATE OR REPLACE FUNCTION next_yearly_wipe_at()
RETURNS timestamptz
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN now() < make_timestamptz(
      EXTRACT(YEAR FROM now())::int, 2, 28, 15, 0, 0, 'UTC'
    )
      THEN make_timestamptz(EXTRACT(YEAR FROM now())::int, 2, 28, 15, 0, 0, 'UTC')
    ELSE make_timestamptz((EXTRACT(YEAR FROM now())::int + 1), 2, 28, 15, 0, 0, 'UTC')
  END;
$$;

COMMENT ON FUNCTION next_yearly_wipe_at() IS
  '다음 학년 와이프 시점 반환 (UTC). KST로 평년 3/1 00:00, 윤년 2/29 00:00. FE 카운트다운 배지용.';

GRANT EXECUTE ON FUNCTION next_yearly_wipe_at() TO authenticated;


-- =============================================
-- [SECTION 4] pg_cron 등록 — 매년 2월 28일 15:00 UTC (= KST 익일 자정)
-- 멱등: 기존 같은 이름 작업 unschedule 후 재등록.
-- pg_cron 미활성화·권한 부족 시 NOTICE 후 통과.
-- =============================================
DO $do$
DECLARE
  v_jobid bigint;
BEGIN
  -- pg_cron 스키마 존재 확인
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') THEN
    RAISE NOTICE 'cron 스키마 없음 — pg_cron 확장이 미활성화 상태입니다. Dashboard > Database > Extensions에서 활성화 후 본 SECTION 재실행하세요.';
    RETURN;
  END IF;

  -- 기존 동일 이름 job unschedule (멱등)
  SELECT jobid INTO v_jobid FROM cron.job WHERE jobname = 'kedu-yearly-wipe-kst';
  IF v_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(v_jobid);
    RAISE NOTICE 'kedu-yearly-wipe-kst 기존 job (id=%) 해제됨', v_jobid;
  END IF;

  -- 신규 등록 — 매년 2월 28일 15:00 UTC = KST 다음날 00:00
  PERFORM cron.schedule(
    'kedu-yearly-wipe-kst',
    '0 15 28 2 *',
    $cron$SELECT public.wipe_student_data_yearly();$cron$
  );
  RAISE NOTICE 'kedu-yearly-wipe-kst 등록 완료 (매년 2/28 15:00 UTC = KST 다음날 자정).';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'cron.schedule 권한 부족 — Supabase Dashboard SQL Editor에서 본 파일 재실행하세요 (supabase_admin 권한 필요).';
WHEN OTHERS THEN
  RAISE NOTICE 'cron 등록 실패 (sqlstate=%, message=%) — 수동 등록 필요.', SQLSTATE, SQLERRM;
END $do$;


-- =============================================
-- [SECTION 5] 검증 쿼리 (주석)
-- 본 파일 적용 후 Dashboard SQL Editor에서 다음 쿼리로 확인:
-- =============================================
-- 1) 함수 정의 확인
--   SELECT proname, pg_get_function_arguments(oid), pg_get_function_result(oid)
--     FROM pg_proc
--    WHERE proname IN ('wipe_student_data_yearly', 'next_yearly_wipe_at');
--
-- 2) cron job 등록 확인
--   SELECT jobid, jobname, schedule, command, active
--     FROM cron.job
--    WHERE jobname = 'kedu-yearly-wipe-kst';
--
-- 3) 다음 와이프 시점 확인 (UTC 반환 — KST는 +9h)
--   SELECT
--     next_yearly_wipe_at()                              AS next_utc,
--     next_yearly_wipe_at() AT TIME ZONE 'Asia/Seoul'   AS next_kst,
--     EXTRACT(EPOCH FROM (next_yearly_wipe_at() - now())) / 86400 AS days_until;
--
-- 4) 수동 와이프 시뮬레이션 (admin 교사만, 트랜잭션 ROLLBACK으로 안전 점검)
--   BEGIN;
--   SELECT wipe_student_data_yearly();
--   ROLLBACK;
--
-- 5) cron 실행 이력 (와이프 발생 후 확인)
--   SELECT jobid, runid, status, return_message, start_time, end_time
--     FROM cron.job_run_details
--    WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'kedu-yearly-wipe-kst')
--    ORDER BY start_time DESC LIMIT 10;
--
-- 6) data_requests에 와이프 기록 확인
--   SELECT id, request_type, requester_type, requester_info, status, note, processed_at
--     FROM data_requests
--    WHERE requester_info IN ('system:pg_cron', 'admin:manual')
--    ORDER BY processed_at DESC LIMIT 10;
-- =============================================

-- =============================================
-- 완료. 다음 작업:
--   1. teacher/index.html 와이프 D-day 카운트다운 배지 (본 사이클 후속)
--   2. parent/index.html PDF 다운로드 알림 (별도 사이클 — 학부모 대시보드 신설과 함께)
--   3. 처리방침 v2.1 부록 2 검증표 line 갱신 ("등록 예정" → "등록 완료" — 단일 채팅)
-- =============================================
