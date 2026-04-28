-- =============================================
-- K-edu 적합성 갭 #1 — class_codes.consent_confirmed 강제
-- 자가점검 ID: T06 (DB) + T07a (BE: RLS WITH CHECK)
-- 처리방침 v2 제7조 1) 3,4 — 동의 미확인 학급은 학급코드 발급 차단
-- =============================================
-- 적용 시점: 적법성 갭 #1 (사이클 ㉛, 2026-04-29)
-- 실행: Supabase Dashboard > SQL Editor에서 1회 (멱등 — 재실행 안전)
-- =============================================

-- ---------------------------------------------
-- [1] 컬럼 추가 (멱등)
-- ---------------------------------------------
-- consent_confirmed: 학부모(법정대리인) 사전 서면 동의 확인 여부
-- consent_confirmed_at: 교사가 동의 확인 체크박스를 클릭한 타임스탬프

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_codes' AND column_name = 'consent_confirmed'
  ) THEN
    ALTER TABLE class_codes ADD COLUMN consent_confirmed boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_codes' AND column_name = 'consent_confirmed_at'
  ) THEN
    ALTER TABLE class_codes ADD COLUMN consent_confirmed_at timestamptz;
  END IF;
END $$;

-- ---------------------------------------------
-- [2] CHECK 제약 — 활성 학급은 반드시 동의 확인 완료
-- ---------------------------------------------
-- 비활성(`is_active = false`) row는 검사 제외 → 기존 row migration 자유.
-- NOT VALID로 추가하면 신규 INSERT/UPDATE만 검사. 기존 row 영향 없음.
-- 처리방침 v2 제7조 1) 4: "동의 미확인 학급은 학급코드 발급이 차단됩니다."

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'class_codes'::regclass
      AND conname = 'class_codes_consent_required'
  ) THEN
    ALTER TABLE class_codes
      ADD CONSTRAINT class_codes_consent_required
      CHECK (is_active = false OR consent_confirmed = true)
      NOT VALID;
  END IF;
END $$;

-- ---------------------------------------------
-- [3] RLS 정책 강화 — INSERT 시 동의 확인 강제
-- ---------------------------------------------
-- 기존 `teachers_insert_codes` 정책: 본인 teacher_id 검증만.
-- 강화: + `consent_confirmed = true` AND `consent_confirmed_at IS NOT NULL`.
-- 미준수 시 PostgREST가 row violates row-level security 거부.

DROP POLICY IF EXISTS "teachers_insert_codes" ON class_codes;

CREATE POLICY "teachers_insert_codes" ON class_codes
  FOR INSERT WITH CHECK (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
    AND consent_confirmed = true
    AND consent_confirmed_at IS NOT NULL
  );

-- ---------------------------------------------
-- [4] UPDATE 정책 — consent_confirmed 다운그레이드 금지
-- ---------------------------------------------
-- 기존 `teachers_update_codes` 정책: 본인 teacher_id 검증만.
-- 강화: 활성 상태로 UPDATE할 때 consent_confirmed = false로 못 내림.

DROP POLICY IF EXISTS "teachers_update_codes" ON class_codes;

CREATE POLICY "teachers_update_codes" ON class_codes
  FOR UPDATE
  USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  )
  WITH CHECK (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
    AND (is_active = false OR consent_confirmed = true)
  );

-- ---------------------------------------------
-- [5] 인덱스 — 동의 확인 row 조회 최적화 (선택)
-- ---------------------------------------------

CREATE INDEX IF NOT EXISTS idx_class_codes_consent
  ON class_codes(consent_confirmed) WHERE is_active = true;

-- =============================================
-- 검증 쿼리 (실행 후 수동 확인)
-- =============================================
-- 1. 컬럼 존재 확인:
--    SELECT column_name, data_type, is_nullable, column_default
--    FROM information_schema.columns
--    WHERE table_name = 'class_codes'
--      AND column_name IN ('consent_confirmed', 'consent_confirmed_at');
--
-- 2. 제약 확인:
--    SELECT conname, pg_get_constraintdef(oid)
--    FROM pg_constraint WHERE conrelid = 'class_codes'::regclass
--      AND conname = 'class_codes_consent_required';
--
-- 3. RLS 정책 확인:
--    SELECT policyname, cmd, qual, with_check
--    FROM pg_policies WHERE tablename = 'class_codes';
--
-- 4. 거부 시뮬레이션 (교사 세션에서):
--    INSERT INTO class_codes (code, label, grade, semester, is_active, teacher_id)
--    VALUES ('TEST00', '테스트', 1, 1, true, '<teacher_id>');
--    → "new row violates row-level security policy" 또는
--      "new row violates check constraint class_codes_consent_required" 중 하나로 거부되어야 정상.
-- =============================================
