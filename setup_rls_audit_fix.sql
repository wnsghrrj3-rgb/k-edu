-- =============================================
-- K-edu RLS audit fix — UPDATE WITH CHECK 일괄 보강 + page_visits 정합 강화
-- 작성: 2026-04-30 (사이클 ㊺ T16)
-- 적합성 자가점검 T16 — RLS 정책 전수 audit 결과 발견된 7개 갭 마감
--
-- 갭 요약:
--   G1 setup_tables.sql `anyone_insert_visits` 잔여 (멱등 X)
--   G2 sp_update_own UPDATE WITH CHECK 누락
--   G3 sp_teacher_update_class UPDATE WITH CHECK 누락
--   G4 sp_admin_update_all UPDATE WITH CHECK 누락
--   G5 teachers_update_own UPDATE WITH CHECK 누락
--   G6 psl_teacher_verify UPDATE WITH CHECK 누락 (기존 ideas 메모)
--   G7 ss_student_claim UPDATE WITH CHECK 누락
--
-- 본 SQL은 멱등 — 재실행 안전.
-- =============================================

-- ---------------------------------------------
-- [G1] page_visits — anyone_insert_visits 잔여 정리
-- 기존 setup_diagnosis_v2.sql SECTION 8에서 이미 DROP·신설했으나
-- setup_tables.sql 재실행 시 anyone_insert_visits가 다시 생길 위험.
-- 본 사이클에서 한 번 더 정리(멱등) + setup_tables.sql 자체도 갱신.
-- ---------------------------------------------
DROP POLICY IF EXISTS "anyone_insert_visits" ON page_visits;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_visits' AND policyname='auth_insert_visits') THEN
    CREATE POLICY "auth_insert_visits" ON page_visits
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- ---------------------------------------------
-- [G2] sp_update_own — WITH CHECK 추가
-- 학생이 본인 row update 시 user_id 변경 차단.
-- (UNIQUE(user_id) 제약이 일부 막아도 baseline 방어층 추가)
-- ---------------------------------------------
ALTER POLICY "sp_update_own" ON student_profiles
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------
-- [G3] sp_teacher_update_class — WITH CHECK 추가
-- 교사가 학생 row update 시 class_code_id를 다른 학급으로 변경 차단
-- (학생 정정은 본인 학급 내에서만 — 전학 시나리오는 어드민 영역)
-- ---------------------------------------------
ALTER POLICY "sp_teacher_update_class" ON student_profiles
  WITH CHECK (
    class_code_id IN (
      SELECT cc.id FROM class_codes cc
      JOIN teachers t ON cc.teacher_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

-- ---------------------------------------------
-- [G4] sp_admin_update_all — WITH CHECK 추가
-- 어드민 권한 baseline 강화
-- ---------------------------------------------
ALTER POLICY "sp_admin_update_all" ON student_profiles
  WITH CHECK (
    EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
  );

-- ---------------------------------------------
-- [G5] teachers_update_own — WITH CHECK 추가
-- 교사가 본인 row update 시 user_id를 다른 사용자로 변경 차단
-- ---------------------------------------------
ALTER POLICY "teachers_update_own" ON teachers
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------
-- [G6] psl_teacher_verify — WITH CHECK 추가
-- 교사가 매핑 검증 UPDATE 시 student_id 변경 차단
-- (verified_at·verified_by만 변경되도록 — 다른 학생 매핑으로 변조 차단)
-- 기존 ideas 메모(2026-04-30_compliance_psl_teacher_verify_with_check.md) 마감
-- ---------------------------------------------
ALTER POLICY "psl_teacher_verify" ON parent_student_links
  WITH CHECK (
    student_id IN (
      SELECT sp.id FROM student_profiles sp
      WHERE sp.class_code_id IN (
        SELECT cc.id FROM class_codes cc
        JOIN teachers t ON cc.teacher_id = t.id
        WHERE t.user_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------
-- [G7] ss_student_claim — WITH CHECK 추가
-- 학생이 슬롯 UPDATE 시 claimed_by를 다른 학생 id로 변조 차단
-- (RPC claim_seat가 SECURITY DEFINER로 정상 흐름 처리하나 직접 UPDATE 우회 차단)
-- ---------------------------------------------
ALTER POLICY "ss_student_claim" ON student_seats
  WITH CHECK (
    claimed_by IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

-- ---------------------------------------------
-- PostgREST 스키마 캐시 갱신
-- ---------------------------------------------
NOTIFY pgrst, 'reload schema';

-- =============================================
-- 검증 쿼리 (실행 후 SQL Editor에서 확인)
-- =============================================
-- (1) page_visits 정책 확인
-- SELECT policyname, cmd FROM pg_policies WHERE tablename='page_visits';
-- → 2행: admins_read_visits(SELECT) + auth_insert_visits(INSERT)
-- anyone_insert_visits 없음 확인
--
-- (2) UPDATE 정책 WITH CHECK 보강 확인
-- SELECT tablename, policyname, with_check
--   FROM pg_policies
--   WHERE policyname IN (
--     'sp_update_own', 'sp_teacher_update_class', 'sp_admin_update_all',
--     'teachers_update_own', 'psl_teacher_verify', 'ss_student_claim'
--   )
--   ORDER BY tablename, policyname;
-- → 6행 모두 with_check IS NOT NULL
--
-- (3) sp_update_own 본인 row 변조 시도 차단 검증 (학생 세션)
-- UPDATE student_profiles SET user_id = '<다른_사용자_uuid>' WHERE id = '<본인_id>';
-- → 0 rows updated (WITH CHECK 차단)
--
-- (4) sp_teacher_update_class 학급 이동 차단 검증 (교사 세션)
-- UPDATE student_profiles SET class_code_id = '<다른_학급_id>' WHERE id = '<본인_학급_학생_id>';
-- → 0 rows updated (WITH CHECK 차단)
-- =============================================
