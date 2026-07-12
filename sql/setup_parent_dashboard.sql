-- =============================================
-- K-edu 학부모 대시보드 지원 SQL (사이클 ㊵, 적합성 시리즈 #11)
-- =============================================
-- 본 파일은 학부모(법정대리인) 권리 행사 채널 — 학부모 측 FE를 위한
-- 헬퍼 SQL 함수만 정의합니다. 테이블·RLS는 setup_diagnosis_v2.sql /
-- setup_data_requests.sql에 이미 정의되어 있습니다.
--
-- 처리방침 v2.1 약속 정합:
--   - 제2조 2) 학부모 회원: 이메일+비번+자녀 학급코드+자녀 닉네임으로 자녀 매핑
--   - 제8조 권리 행사: 학부모는 본인 자녀(verified parent_student_links 매핑)에 대해
--                       열람·정정·삭제·처리정지 요청 INSERT
--   - line 181: "열람 요구 (학부모 대시보드에서 직접 또는 교사·운영자 통해)"
--   - line 188-190: "자녀 매핑은 자녀의 학급코드와 닉네임 일치 확인 후
--                     parent_student_links 테이블에 기록"
--
-- 멱등 — 재실행 안전.
-- =============================================


-- =============================================
-- [SECTION 1] request_parent_link() — 학부모 자녀 매핑 신청 RPC
-- =============================================
-- 문제: 학부모가 자녀의 student_id를 알아내려면 student_profiles SELECT 권한 필요.
--       그러나 RLS는 "verified parent_student_links 매핑 자녀만 SELECT"라 미매핑 시점에는 차단.
--       닭과 달걀 문제.
-- 해결: SECURITY DEFINER 함수로 RLS 우회 — 함수 내부에서 학급코드+닉네임 매칭 후
--       parent_student_links에 verified_at=NULL row INSERT.
--       검증은 교사가 대시보드에서 수동 (psl_teacher_verify 정책 참조).
--
-- 보안 가드:
--   1. 학부모만 호출 가능 (auth.uid() NOT NULL + teachers/student_profiles에 없음)
--   2. 학급코드 + 닉네임 양쪽 모두 일치 필수 (닉네임 추측 공격 일부 완화)
--   3. 학생 is_active=false면 차단 (처리정지된 학생에 새 매핑 신청 불가)
--   4. 이미 동일 (parent_id, student_id) 매핑 있으면 idempotent (UPSERT 시도가 아닌 명확한 메시지)
--
-- ※ rate limit은 본 함수에 직접 구현하지 않음 — Supabase 측 PostgREST rate limit 또는
--    별도 사이클의 audit_log 테이블에서 처리 검토 (현 사이클 범위 외).
-- =============================================
CREATE OR REPLACE FUNCTION request_parent_link(
  p_class_code text,
  p_nickname text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
  v_class_code_id uuid;
  v_student_id uuid;
  v_student_active boolean;
  v_existing_link_id bigint;
  v_existing_verified_at timestamptz;
BEGIN
  -- 1) 호출자 검증 — 학부모만
  v_parent_id := auth.uid();
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION '로그인이 필요합니다' USING ERRCODE = '28000';
  END IF;

  -- 교사·학생 차단 (역할 명확)
  IF EXISTS (SELECT 1 FROM teachers WHERE user_id = v_parent_id) THEN
    RAISE EXCEPTION '교사 계정에서는 학부모 매핑을 신청할 수 없습니다' USING ERRCODE = '42501';
  END IF;
  IF EXISTS (SELECT 1 FROM student_profiles WHERE user_id = v_parent_id) THEN
    RAISE EXCEPTION '학생 계정에서는 학부모 매핑을 신청할 수 없습니다' USING ERRCODE = '42501';
  END IF;

  -- 2) 입력 정규화 + 길이 가드
  p_class_code := upper(trim(p_class_code));
  p_nickname := trim(p_nickname);
  IF p_class_code IS NULL OR length(p_class_code) = 0 THEN
    RAISE EXCEPTION '학급코드를 입력해주세요' USING ERRCODE = '22023';
  END IF;
  IF p_nickname IS NULL OR length(p_nickname) = 0 THEN
    RAISE EXCEPTION '자녀 닉네임을 입력해주세요' USING ERRCODE = '22023';
  END IF;
  IF length(p_class_code) > 32 OR length(p_nickname) > 32 THEN
    RAISE EXCEPTION '입력값이 너무 깁니다' USING ERRCODE = '22023';
  END IF;

  -- 3) 학급코드 조회 (활성 학급만 — class_codes.is_active 컬럼이 있으면 필터, 없으면 전체)
  SELECT id INTO v_class_code_id
    FROM class_codes
   WHERE upper(code) = p_class_code
   LIMIT 1;
  IF v_class_code_id IS NULL THEN
    RAISE EXCEPTION '학급코드 또는 자녀 닉네임이 일치하지 않습니다' USING ERRCODE = '22023';
    -- 보안: 학급코드 자체 존재 여부를 노출하지 않음 (열거 공격 완화)
  END IF;

  -- 4) 학급 + 닉네임 양쪽 일치하는 학생 조회
  SELECT id, is_active
    INTO v_student_id, v_student_active
    FROM student_profiles
   WHERE class_code_id = v_class_code_id
     AND nickname = p_nickname
   LIMIT 1;
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION '학급코드 또는 자녀 닉네임이 일치하지 않습니다' USING ERRCODE = '22023';
  END IF;

  -- 5) 처리정지된 학생 차단
  IF v_student_active IS NOT TRUE THEN
    RAISE EXCEPTION '해당 학생은 현재 처리정지 상태입니다. 학교에 문의해주세요' USING ERRCODE = '42501';
  END IF;

  -- 6) 기존 매핑 확인 — 멱등 처리
  SELECT id, verified_at
    INTO v_existing_link_id, v_existing_verified_at
    FROM parent_student_links
   WHERE parent_id = v_parent_id AND student_id = v_student_id
   LIMIT 1;

  IF v_existing_link_id IS NOT NULL THEN
    -- 이미 매핑 신청 또는 검증 완료
    RETURN jsonb_build_object(
      'status', CASE WHEN v_existing_verified_at IS NOT NULL THEN 'already_verified' ELSE 'already_pending' END,
      'link_id', v_existing_link_id,
      'student_id', v_student_id,
      'message', CASE
        WHEN v_existing_verified_at IS NOT NULL
          THEN '이미 검증 완료된 자녀입니다'
          ELSE '이미 신청되었습니다. 담임 교사 검증을 기다려주세요'
      END
    );
  END IF;

  -- 7) 신규 매핑 신청 INSERT (verified_at = NULL)
  INSERT INTO parent_student_links (parent_id, student_id, verified_at)
       VALUES (v_parent_id, v_student_id, NULL)
       RETURNING id INTO v_existing_link_id;

  RETURN jsonb_build_object(
    'status', 'requested',
    'link_id', v_existing_link_id,
    'student_id', v_student_id,
    'message', '자녀 매핑 신청 완료 — 담임 교사가 검증한 후 권리 행사 가능'
  );
END;
$$;

-- 학부모(authenticated 모든 사용자)에게 EXECUTE 권한 부여
-- 함수 내부에서 호출자 역할 검증하므로 안전.
GRANT EXECUTE ON FUNCTION request_parent_link(text, text) TO authenticated;


-- =============================================
-- [SECTION 2] my_parent_links() — 본인 매핑 목록 조회 (학생 닉네임 포함)
-- =============================================
-- parent_student_links psl_parent_read 정책으로 본인 매핑 SELECT는 가능.
-- 그러나 student_profiles JOIN은 RLS 때문에 verified 매핑만 보임 — 검증 대기 row는 학생 닉네임이 NULL.
-- 검증 대기 시점에도 학부모가 "어떤 자녀를 신청했는지" 보여주려면 SECURITY DEFINER가 필요.
-- =============================================
CREATE OR REPLACE FUNCTION my_parent_links()
RETURNS TABLE (
  link_id bigint,
  student_id uuid,
  nickname text,
  class_code text,
  verified_at timestamptz,
  is_active boolean,
  requested_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
BEGIN
  v_parent_id := auth.uid();
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION '로그인이 필요합니다' USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  SELECT
    psl.id          AS link_id,
    sp.id           AS student_id,
    sp.nickname     AS nickname,
    cc.code         AS class_code,
    psl.verified_at AS verified_at,
    sp.is_active    AS is_active,
    psl.created_at  AS requested_at
  FROM parent_student_links psl
  JOIN student_profiles sp ON sp.id = psl.student_id
  LEFT JOIN class_codes cc ON cc.id = sp.class_code_id
  WHERE psl.parent_id = v_parent_id
  ORDER BY psl.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION my_parent_links() TO authenticated;


-- =============================================
-- [SECTION 3] my_data_requests() — 본인 신청 권리 행사 이력 조회
-- =============================================
-- data_requests RLS dr_parent_read는 verified 매핑 학생의 모든 요청 SELECT 허용.
-- 그러나 학부모 본인이 신청한 것만 보여주려면 requester_user_id = auth.uid() 필터 필요.
-- 또한 학생 닉네임 JOIN을 위해 SECURITY DEFINER 사용 (검증 매핑이 풀린 후에도 본인 신청 이력은 보여야 함).
-- =============================================
CREATE OR REPLACE FUNCTION my_data_requests()
RETURNS TABLE (
  id bigint,
  request_type text,
  target_student_id uuid,
  student_nickname text,
  status text,
  note text,
  requested_at timestamptz,
  due_at timestamptz,
  processed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
BEGIN
  v_parent_id := auth.uid();
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION '로그인이 필요합니다' USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  SELECT
    dr.id,
    dr.request_type,
    dr.target_student_id,
    sp.nickname        AS student_nickname,
    dr.status,
    dr.note,
    dr.requested_at,
    dr.due_at,
    dr.processed_at
  FROM data_requests dr
  LEFT JOIN student_profiles sp ON sp.id = dr.target_student_id
  WHERE dr.requester_user_id = v_parent_id
    AND dr.requester_type = 'parent'
  ORDER BY dr.requested_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION my_data_requests() TO authenticated;


-- =============================================
-- [SECTION 4] 검증 쿼리 (주석)
-- =============================================
-- 1) 함수 등록 확인:
--    SELECT proname, prosecdef FROM pg_proc
--     WHERE proname IN ('request_parent_link', 'my_parent_links', 'my_data_requests');
--    -- 3행 + prosecdef=true (SECURITY DEFINER)
--
-- 2) 학부모 컨텍스트에서 매핑 신청 테스트 (별도 학부모 계정 필요):
--    SELECT request_parent_link('TESTCODE', '테스트닉네임');
--    -- jsonb 반환 — status: requested / already_pending / already_verified
--
-- 3) 본인 매핑 목록:
--    SELECT * FROM my_parent_links();
--    -- 검증 대기 + 검증 완료 모두 표시
--
-- 4) 본인 권리 행사 이력:
--    SELECT * FROM my_data_requests();
--    -- pending / in_progress / completed / rejected 분기 가능

NOTIFY pgrst, 'reload schema';
