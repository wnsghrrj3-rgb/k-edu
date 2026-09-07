-- =============================================================================
-- setup_worksheet_v6.sql — 케이학습지 W6 교사 자작 (설계 v2 §3-1 ④ · §4-2 ① · §8-⑤) · 재실행 안전
--   선행: setup_worksheet_v2.sql(#44: question_bank.source/teacher_id) · setup_worksheet_v4.sql(#46: performance_tasks.source/teacher_id)
--   ① question_bank 읽기 = 케이에듀 문항 + 내 자작 (남의 자작은 안 보인다) / 쓰기 = 내 자작만
--   ② 자작 문항은 개념 태그 필수(§8-⑤) — CHECK 로 못 박는다(미분류는 리포트에서 빠져 자작의 값어치가 사라진다)
--   ③ 자작 qcode 규약 't_<teacher_id 앞 8>_<epoch>' — UNIQUE 충돌 없이 화면이 만든다
-- =============================================================================

-- [0] 선행 열 보증 — 2026-09-07 실측: #44 가 부분 적용돼 question_bank.source 가 없었다(42703). 같은 문장이라 재실행 안전.
ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS source     text NOT NULL DEFAULT 'kedu';
ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL;
ALTER TABLE quiz_set_items ADD COLUMN IF NOT EXISTS points int NOT NULL DEFAULT 1;
ALTER TABLE scores ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'online';
ALTER TABLE quiz_sets ADD COLUMN IF NOT EXISTS result_opened_at   timestamptz;
ALTER TABLE quiz_sets ADD COLUMN IF NOT EXISTS closed_at          timestamptz;
ALTER TABLE quiz_sets ADD COLUMN IF NOT EXISTS target_student_ids uuid[];
ALTER TABLE quiz_sets ADD COLUMN IF NOT EXISTS time_min           int;

DROP POLICY IF EXISTS p_qbank_teacher_read ON question_bank;
CREATE POLICY p_qbank_teacher_read ON question_bank
  FOR SELECT TO authenticated
  USING (is_active AND kedu_teacher_approved() AND (source = 'kedu' OR teacher_id = cw_my_teacher_id()));

DROP POLICY IF EXISTS p_qbank_teacher_own ON question_bank;
CREATE POLICY p_qbank_teacher_own ON question_bank
  FOR ALL TO authenticated
  USING (source = 'teacher' AND teacher_id = cw_my_teacher_id())
  WITH CHECK (source = 'teacher' AND teacher_id = cw_my_teacher_id() AND kedu_teacher_approved());

-- §8-⑤ 개념 태그 필수 (자작만; 케이에듀 문항은 시드가 보장)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'qbank_teacher_concept_required') THEN
    ALTER TABLE question_bank ADD CONSTRAINT qbank_teacher_concept_required
      CHECK (source <> 'teacher' OR concept_code IS NOT NULL);
  END IF;
END $$;

-- 검산: SELECT policyname FROM pg_policies WHERE tablename='question_bank' AND policyname='p_qbank_teacher_own';  → 1행
--       SELECT conname FROM pg_constraint WHERE conname='qbank_teacher_concept_required';  → 1행
