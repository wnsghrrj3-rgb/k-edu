-- =============================================
-- K-edu 학부모 매핑 검증 — 교사 측 액션 SQL (사이클 ㊷, 적합성 시리즈 #13)
-- =============================================
-- 본 파일은 교사가 학부모 자녀 매핑 신청을 [승인]·[거부]할 수 있도록
-- 누락된 RLS DELETE 정책 + 검증 대기 목록 조회 RPC를 정의합니다.
--
-- 사이클 ㊵에서 학부모 측 FE(`parent/index.html`)와 매핑 신청 RPC
-- (`request_parent_link`)는 마감되었으나, 교사 측 검증 UI는 미구현
-- → 검증 절차가 SQL Editor 직접 UPDATE로만 가능했던 갭 마감.
--
-- 처리방침 v2.1 약속 정합:
--   - 제2조 2) 학부모 회원: 자녀 매핑 검증 절차
--   - 제7조 학부모 동의 절차 ↔ parent_student_links verified_at 갱신
--   - line 188-190: "매핑 확인 후 parent_student_links 테이블에 기록"
--
-- 기존 RLS 정합 (사이클 ㉙, setup_diagnosis_v2.sql):
--   - psl_teacher_read (SELECT) — 본인 학급 학생 매핑 row 조회 ✅
--   - psl_teacher_verify (UPDATE) — 본인 학급 학생 row UPDATE (승인 동작) ✅
--   - psl_teacher_delete (DELETE) — ❌ 누락 (본 파일에서 마감)
--
-- 멱등 — 재실행 안전.
-- =============================================


-- =============================================
-- [SECTION 1] psl_teacher_delete RLS 정책 — 거부(DELETE) 권한 추가
-- =============================================
-- 거부 동작 = parent_student_links row DELETE.
-- 학부모 측 my_parent_links()에서 row가 사라짐 → 학부모는 "검증 안 됐다"로 인식 후
-- 정확한 학급코드+닉네임으로 재신청 가능.
--
-- 처리방침에 거부 통보 의무 명시 없음 → DELETE 단순 처리가 깔끔.
-- 거부 사유 통보는 교사가 학부모와 직접(가정통신문 채널·전화·이메일 등) — 시스템 외 절차.
-- =============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='parent_student_links' AND policyname='psl_teacher_delete') THEN
    CREATE POLICY "psl_teacher_delete" ON parent_student_links
      FOR DELETE USING (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 2] pending_parent_links_for_teacher() RPC
-- =============================================
-- 교사 대시보드 [학부모 매핑 검증 대기] 섹션용 헬퍼.
-- 본인 학급 학생의 verified_at IS NULL row + 학생 닉네임/학급/신청일 +
-- 학부모 이메일(마스킹).
--
-- 왜 SECURITY DEFINER인가:
--   - 학부모 이메일은 auth.users.email 컬럼 — 교사 일반 SELECT 권한 없음(RLS).
--   - 학부모 이메일은 학부모 본인이 가입 시 직접 입력한 정보(처리방침 제2조 2),
--     교사가 매핑 검증을 위해 부분적으로 알아야 함.
--   - 보수적 노출: 첫 글자 + ***@ + 도메인 (예: j***@gmail.com)으로 마스킹.
--   - 교사는 마스킹된 이메일로 학부모를 학생에게 확인하거나 직접 통화하여 정합 검증.
--
-- 보안 가드:
--   1. 호출자 = 교사 본인 (auth.uid()로 teachers 조회) — 학생/학부모 호출 차단
--   2. 본인 학급 학생의 매핑만 노출 — 다른 학급 매핑 차단(JOIN 조건)
--   3. 어드민도 호출 가능 (전체 학교 모니터링용)
--   4. verified_at IS NULL인 row만 — 이미 검증된 매핑은 별도 화면(미래 확장)
-- =============================================
CREATE OR REPLACE FUNCTION public.pending_parent_links_for_teacher()
RETURNS TABLE (
  link_id          bigint,
  student_id       uuid,
  student_nickname text,
  class_code       text,
  class_label      text,
  parent_email     text,
  parent_email_masked text,
  requested_at     timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_is_teacher boolean;
  v_is_admin boolean;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized — no auth.uid()';
  END IF;

  -- 호출자 자격 검증
  SELECT
    EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = v_caller_id),
    EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = v_caller_id AND t.is_admin = true)
  INTO v_is_teacher, v_is_admin;

  IF NOT v_is_teacher THEN
    RAISE EXCEPTION 'forbidden — caller is not a teacher';
  END IF;

  RETURN QUERY
  SELECT
    psl.id AS link_id,
    sp.id  AS student_id,
    sp.nickname AS student_nickname,
    cc.code AS class_code,
    cc.label AS class_label,
    u.email::text AS parent_email,
    -- 마스킹: 첫 글자 + ***@도메인 (이메일 길이 1자 이하면 ***@도메인)
    CASE
      WHEN u.email IS NULL THEN NULL
      WHEN position('@' IN u.email) <= 1 THEN '***'
      ELSE substr(split_part(u.email, '@', 1), 1, 1)
           || '***@'
           || split_part(u.email, '@', 2)
    END AS parent_email_masked,
    psl.created_at AS requested_at
  FROM parent_student_links psl
  JOIN student_profiles sp ON psl.student_id = sp.id
  JOIN class_codes cc ON sp.class_code_id = cc.id
  JOIN teachers t ON cc.teacher_id = t.id
  LEFT JOIN auth.users u ON psl.parent_id = u.id
  WHERE psl.verified_at IS NULL
    AND (
      v_is_admin
      OR t.user_id = v_caller_id
    )
  ORDER BY psl.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.pending_parent_links_for_teacher() TO authenticated;


-- =============================================
-- [SECTION 3] 검증 쿼리 (참고)
-- =============================================
-- 1. RLS 정책 4종 확인:
--    SELECT policyname FROM pg_policies
--     WHERE tablename='parent_student_links'
--     ORDER BY policyname;
--    -- → psl_admin_all, psl_parent_insert, psl_parent_read,
--    --   psl_teacher_delete (NEW), psl_teacher_read, psl_teacher_verify
--
-- 2. RPC 함수 존재 + SECURITY DEFINER:
--    SELECT proname, prosecdef FROM pg_proc
--     WHERE proname = 'pending_parent_links_for_teacher';
--    -- → 1행, prosecdef=true
--
-- 3. GRANT 확인:
--    SELECT routine_name, grantee FROM information_schema.routine_privileges
--     WHERE routine_name = 'pending_parent_links_for_teacher'
--       AND grantee = 'authenticated';
--    -- → 1행
--
-- 4. (교사 컨텍스트에서) 본인 학급 검증 대기 목록:
--    SELECT * FROM pending_parent_links_for_teacher();
--    -- 학생 닉네임/학급/마스킹 이메일/신청일 반환
--
-- 5. (교사 컨텍스트에서) 승인 — 직접 UPDATE (psl_teacher_verify 정책):
--    UPDATE parent_student_links
--       SET verified_at = now(),
--           verified_by = (SELECT id FROM teachers WHERE user_id = auth.uid())
--     WHERE id = <link_id>;
--
-- 6. (교사 컨텍스트에서) 거부 — 직접 DELETE (psl_teacher_delete 정책 NEW):
--    DELETE FROM parent_student_links WHERE id = <link_id>;

NOTIFY pgrst, 'reload schema';
