-- =============================================
-- setup_rls_recursion_fix.sql
-- 작성: 2026-09-01
-- 증상: 교사가 케이학습리포트 진입 시
--       ERROR 42P17 "infinite recursion detected in policy for relation student_profiles"
--
-- 원인: RLS 정책이 서로를 참조해 고리가 닫혔다.
--   · student_profiles."sp_parent_read"  → parent_student_links 를 조회
--     (setup_parent_data_view.sql)
--   · parent_student_links."psl_teacher_read" → student_profiles 를 조회
--     (setup_diagnosis_v2.sql · setup_parent_link_actions.sql)
--   student_profiles 를 읽으려면 parent_student_links 정책을 평가해야 하고,
--   그 정책이 다시 student_profiles 를 읽으려 해서 재귀에 빠진다.
--
-- 해법: 고리의 양쪽 조회를 SECURITY DEFINER 함수로 감싼다.
--   함수 안에서는 RLS 를 타지 않으므로 정책 평가가 한 단계에서 끝난다.
--   권한 자체는 그대로다 — 함수가 auth.uid() 로 본인 것만 돌려준다.
--
-- 멱등 — 재실행 안전 (CREATE OR REPLACE / DROP POLICY IF EXISTS).
-- =============================================


-- =============================================
-- [1] 헬퍼 함수 — 내가 볼 수 있는 학생 id 집합
-- =============================================

-- (1-a) 학부모: 내가 연결(인증)된 자녀
CREATE OR REPLACE FUNCTION sp_my_linked_student_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $fn$
  SELECT psl.student_id
  FROM parent_student_links psl
  WHERE psl.parent_id = auth.uid()
    AND psl.verified_at IS NOT NULL
$fn$;

-- (1-b) 교사: 내 학급코드에 속한 학생
CREATE OR REPLACE FUNCTION sp_my_class_student_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $fn$
  SELECT sp.id
  FROM student_profiles sp
  JOIN class_codes cc ON sp.class_code_id = cc.id
  JOIN teachers    t  ON cc.teacher_id    = t.id
  WHERE t.user_id = auth.uid()
$fn$;

REVOKE ALL ON FUNCTION sp_my_linked_student_ids() FROM public;
REVOKE ALL ON FUNCTION sp_my_class_student_ids()  FROM public;
GRANT EXECUTE ON FUNCTION sp_my_linked_student_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION sp_my_class_student_ids()  TO authenticated;


-- =============================================
-- [2] student_profiles — 학부모 열람 정책을 함수 기반으로 교체
--   (고리의 한쪽을 끊는다)
-- =============================================

DROP POLICY IF EXISTS "sp_parent_read" ON student_profiles;
CREATE POLICY "sp_parent_read" ON student_profiles
  FOR SELECT
  USING ( id IN (SELECT sp_my_linked_student_ids()) );


-- =============================================
-- [3] parent_student_links — 교사 정책을 함수 기반으로 교체
--   (고리의 반대쪽도 끊는다 — 방향이 바뀌어도 재발하지 않게)
-- =============================================

DROP POLICY IF EXISTS "psl_teacher_read" ON parent_student_links;
CREATE POLICY "psl_teacher_read" ON parent_student_links
  FOR SELECT
  USING ( student_id IN (SELECT sp_my_class_student_ids()) );

DROP POLICY IF EXISTS "psl_teacher_verify" ON parent_student_links;
CREATE POLICY "psl_teacher_verify" ON parent_student_links
  FOR UPDATE
  USING ( student_id IN (SELECT sp_my_class_student_ids()) );

DROP POLICY IF EXISTS "psl_teacher_delete" ON parent_student_links;
CREATE POLICY "psl_teacher_delete" ON parent_student_links
  FOR DELETE
  USING ( student_id IN (SELECT sp_my_class_student_ids()) );


-- =============================================
-- 검산
--   ① SELECT count(*) FROM student_profiles;
--      → 재귀 에러 없이 숫자가 나오면 해소
--   ② SELECT policyname, qual FROM pg_policies
--      WHERE tablename IN ('student_profiles','parent_student_links')
--      ORDER BY tablename, policyname;
--      → sp_parent_read · psl_teacher_* 넷이 함수 호출 형태여야 함
-- =============================================
