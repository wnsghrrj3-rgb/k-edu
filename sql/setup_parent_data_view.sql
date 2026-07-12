-- =============================================
-- setup_parent_data_view.sql
-- 사이클 ㊹ — 학부모 직접 열람 BE 갭 마감 (sp_parent_read RLS 정책 신설)
-- =============================================
-- 진짜 게이트: 처리방침 v2.1 line 23 "법정대리인의 자녀 학습 확인" + line 103
--             "본인 자녀의 차시별 진척도·약점 차시 리스트·학습 시간·오답노트 개수"
-- 직전 상태: scores·wrong_answers·homework_assignments 등에는 학부모 RLS(_parent_read)가
--           이미 마련(setup_diagnosis_v2.sql) 그러나 student_profiles 자체의 학부모 SELECT
--           정책은 누락. 학부모가 student_data_summary 뷰 호출 시 student_profiles RLS 통과
--           실패로 빈 결과만 반환됨. 사이클 ㊵ 시점 "BE 정합 완료" 추정 오류.
-- 닫는 방법: student_profiles에 sp_parent_read RLS SELECT 정책 신설.
--           parent_student_links 매핑이 verified_at IS NOT NULL인 학부모만 자녀 row SELECT.
--           사이클 ㊵ 학부모 대시보드 + 사이클 ㊷ 매핑 검증 흐름 정합.
--           sp_read_own / sp_teacher_read_class / sp_admin_read_all와 4단 RLS 완성.
-- 멱등 (IF NOT EXISTS).
-- =============================================

DO $$ BEGIN
  -- 학부모: 검증 완료(verified_at IS NOT NULL) 매핑이 있는 본인 자녀 student_profiles SELECT
  -- 처리방침 v2.1 line 23 + 제3조 3 RLS 4단 권한 정합
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE tablename = 'student_profiles' AND policyname = 'sp_parent_read'
  ) THEN
    CREATE POLICY "sp_parent_read" ON student_profiles
      FOR SELECT USING (
        id IN (
          SELECT psl.student_id FROM parent_student_links psl
          WHERE psl.parent_id = auth.uid()
            AND psl.verified_at IS NOT NULL
        )
      );
  END IF;
END $$;

-- 검증: scores_parent_read와 동일 매핑 패턴(verified_at IS NOT NULL).
-- 학부모가 student_data_summary 뷰 호출 시:
--   1. 뷰는 security_invoker = true → 호출자 RLS 정책 적용
--   2. student_profiles SELECT는 sp_parent_read 정책으로 본인 자녀만 통과
--   3. 뷰 내부 scoped subquery (scores/wrong_answers/homework_completions)는 각 테이블의
--      _parent_read 정책으로 학부모 본인 자녀만 통과
-- → 본인 자녀 1행만 반환되며, 타 자녀·타 학급·타 학생 row는 RLS로 차단됨.

-- student_lesson_progress 뷰는 scores 테이블 RLS를 따름 → scores_parent_read로 정합.

-- =============================================
-- PostgREST schema reload (Supabase RLS 정책 변경 후 캐시 무효화)
-- =============================================
NOTIFY pgrst, 'reload schema';

-- =============================================
-- [검증 쿼리 — 실행 후 점검용]
-- =============================================
-- (1) student_profiles RLS 정책 4종 확인 (학생 본인·교사·어드민·학부모)
-- SELECT policyname, cmd FROM pg_policies
--  WHERE tablename = 'student_profiles' ORDER BY policyname;
-- → sp_admin_delete_all, sp_admin_read_all, sp_admin_update_all,
--   sp_insert_own, sp_parent_read (NEW), sp_read_own,
--   sp_teacher_delete_class, sp_teacher_read_class, sp_teacher_update_class, sp_update_own

-- (2) sp_parent_read 정책 식별 + 조건 (USING 절 확인)
-- SELECT policyname, cmd, qual FROM pg_policies
--  WHERE tablename = 'student_profiles' AND policyname = 'sp_parent_read';
-- → 1행, cmd=SELECT, qual에 parent_student_links + verified_at IS NOT NULL 포함

-- (3) (학부모 로그인 후) student_data_summary 뷰 SELECT 테스트
-- 학부모 user_id로 인증된 세션에서:
-- SELECT student_id, nickname, total_questions, correct_questions, lessons_attempted,
--        total_time_sec, unresolved_wrong_count, homework_completed_count
--   FROM student_data_summary;
-- → 본인 자녀 검증 완료 row만 반환 (verified_at IS NULL이면 제외).
