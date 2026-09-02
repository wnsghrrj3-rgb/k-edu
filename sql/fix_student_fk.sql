-- =============================================
-- fix_student_fk.sql  (#36 — 2026-09-02)
-- 학생 기록 표 4개의 student_id 외래키를 옛 students(id) → student_profiles(id) 로 교정
-- 배경: setup_diagnosis_v2.sql 은 student_profiles 를 참조하도록 적혀 있었으나, 실제 DB 에는
--       옛 students 표를 향한 제약이 남아 있어 학생 계정(student_profiles)의 모든 INSERT 가
--       23503 (PostgREST 409 Conflict) 로 거절되고 있었다 — scores 0행의 최종 원인.
--       확인 시점: students 0행 · student_profiles 7행 (잃을 데이터 없음).
-- 멱등 — 재실행 안전.
-- =============================================
BEGIN;

DO $do$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['scores','completions','assignment_completions','rankings_weekly'] LOOP
    IF to_regclass(t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', t, t || '_student_id_fkey');
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE',
        t, t || '_student_id_fkey');
    END IF;
  END LOOP;
END $do$;

COMMIT;

-- [검증]
-- SELECT conrelid::regclass, pg_get_constraintdef(oid) FROM pg_constraint
--  WHERE conname IN ('scores_student_id_fkey','completions_student_id_fkey',
--                    'assignment_completions_student_id_fkey','rankings_weekly_student_id_fkey');
--  → 넷 다 REFERENCES student_profiles(id)
-- SELECT conrelid::regclass FROM pg_constraint WHERE confrelid='students'::regclass;  → 0행
