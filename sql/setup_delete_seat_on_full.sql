-- =============================================
-- #57 setup_delete_seat_on_full.sql — 2026-10-12
-- 완전 삭제 시 명단 자리(student_seats)도 함께 제거
-- 배경: 권리 행사 채널 [삭제] → 완전 삭제를 해도 명단에 학생이 그대로 남아
--       교사가 두 번 지워야 했음(준호 보고). 익명화 모드는 종전대로 claim 해제만.
-- delete_student_data 재정의 (setup_data_requests.sql 본문 + student_seats 분기).
-- 재실행 안전. 검산:
--   SELECT prosrc LIKE '%#57%' FROM pg_proc WHERE proname='delete_student_data';  → true
-- =============================================

CREATE OR REPLACE FUNCTION delete_student_data(
  p_student_id uuid,
  p_request_id bigint DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_full_delete boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  c_scores bigint;
  c_wrong  bigint;
  c_hwc    bigint;
  c_seats  bigint;
  c_links  bigint;
  v_class_code_id uuid;
  v_teacher_id uuid;
  v_is_admin boolean;
  v_profile_action text;
  v_default_note text;
BEGIN
  -- 학생 학급 조회
  SELECT sp.class_code_id INTO v_class_code_id
    FROM student_profiles sp WHERE sp.id = p_student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'delete_student_data: 학생 ID 없음 (%)', p_student_id;
  END IF;

  -- 권한 검증: 어드민 OR 담임 교사
  v_is_admin := EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true);

  IF NOT v_is_admin AND NOT EXISTS (
    SELECT 1 FROM class_codes cc
    JOIN teachers t ON cc.teacher_id = t.id
    WHERE cc.id = v_class_code_id AND t.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'delete_student_data: 권한 없음 (담임 교사 또는 운영자만 호출 가능)';
  END IF;

  SELECT id INTO v_teacher_id FROM teachers WHERE user_id = auth.uid() LIMIT 1;

  v_default_note := CASE WHEN p_full_delete
    THEN '권리 행사 — 완전 삭제 요청 (법정대리인 명시 요청)'
    ELSE '권리 행사 — 데이터 삭제 요청 (기본 익명화 모드)'
  END;

  -- 학습 데이터 삭제 (FK ON DELETE CASCADE 미지원 테이블 우선)
  DELETE FROM scores WHERE student_id = p_student_id;
    GET DIAGNOSTICS c_scores = ROW_COUNT;
  DELETE FROM wrong_answers WHERE student_id = p_student_id;
    GET DIAGNOSTICS c_wrong = ROW_COUNT;
  DELETE FROM homework_completions WHERE student_id = p_student_id;
    GET DIAGNOSTICS c_hwc = ROW_COUNT;
  DELETE FROM parent_student_links WHERE student_id = p_student_id;
    GET DIAGNOSTICS c_links = ROW_COUNT;

  -- student_seats (#57): 완전 삭제면 명단 자리도 함께 제거, 익명화면 claim 해제만
  IF p_full_delete THEN
    DELETE FROM student_seats WHERE claimed_by = p_student_id;
    GET DIAGNOSTICS c_seats = ROW_COUNT;
  ELSE
    UPDATE student_seats
      SET claimed_by = NULL, claimed_at = NULL
      WHERE claimed_by = p_student_id;
    GET DIAGNOSTICS c_seats = ROW_COUNT;
  END IF;

  -- data_requests 이력 (student_profiles 처리보다 먼저 — full_delete 시 ON DELETE SET NULL 발동 순서 의존)
  IF p_request_id IS NOT NULL THEN
    UPDATE data_requests
      SET status = 'completed',
          processed_at = now(),
          processed_by = v_teacher_id,
          note = COALESCE(p_note, note)
      WHERE id = p_request_id;
  ELSE
    INSERT INTO data_requests(
      request_type, requester_type, requester_user_id,
      target_student_id, status, processed_at, processed_by, note
    ) VALUES (
      'delete',
      CASE WHEN v_is_admin THEN 'admin' ELSE 'teacher' END,
      auth.uid(),
      p_student_id, 'completed', now(), v_teacher_id,
      COALESCE(p_note, v_default_note)
    );
  END IF;

  -- student_profiles 처리: 분기
  IF p_full_delete THEN
    -- 완전 삭제: 학생 프로필 row 자체 제거.
    -- data_requests.target_student_id는 ON DELETE SET NULL로 자동 NULL 처리.
    -- 처리 이력 row 자체는 「개인정보 보호법」 제38조 처리 통보 의무·감사 로그를 위해 보존.
    DELETE FROM student_profiles WHERE id = p_student_id;
    v_profile_action := 'deleted';
  ELSE
    -- 기본 익명화: 닉네임 변경 + 처리정지 + 감사 추적용 row 보존
    UPDATE student_profiles
      SET nickname = '[삭제됨_' || left(id::text, 8) || ']',
          is_active = false,
          deactivated_at = now(),
          deactivation_reason = COALESCE(p_note, v_default_note)
      WHERE id = p_student_id;
    v_profile_action := 'anonymized';
  END IF;

  RETURN jsonb_build_object(
    'student_id', p_student_id,
    'deleted', jsonb_build_object(
      'scores', c_scores,
      'wrong_answers', c_wrong,
      'homework_completions', c_hwc,
      'parent_links', c_links,
      'seats_unclaimed', c_seats,
      'seats_deleted', CASE WHEN p_full_delete THEN c_seats ELSE 0 END
    ),
    'profile_action', v_profile_action,         -- 'anonymized' | 'deleted'
    'profile_anonymized', NOT p_full_delete,    -- 호환성 유지 (FE 기존 분기 영향 없음)
    'request_id', p_request_id
  );
END $$;
