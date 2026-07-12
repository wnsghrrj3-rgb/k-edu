-- =============================================
-- K-edu Supabase 스키마 v2 — 진단 시스템 인프라
-- 작성: 2026-04-28 (사이클 인프라-㉑)
-- 명세: handoff/kedu/standards/데이터진단_표준.md
-- 적합성 audit 대응: handoff/STATUS-kedu-compliance.md
--
-- 실행 순서: setup_tables.sql → setup_student_profiles.sql
--           → setup_analytics_upgrade.sql → setup_contents_data.sql
--           → 본 파일 (setup_diagnosis_v2.sql)
--
-- 본 마이그레이션은 멱등(idempotent) — 재실행 안전.
-- =============================================


-- =============================================
-- [SECTION 0] 사전 안전장치 — scores 테이블 보장
-- =============================================
-- 현재 레포 SQL 4개에 scores 정의가 없음 (Supabase 대시보드에만 존재 가정).
-- 만약 이미 있으면 IF NOT EXISTS로 무시. 없으면 최소 골격 생성.

-- 기존 K-edu DB의 scores 컬럼: id(uuid), student_id, unit_id, score, max_score, earned_at
-- 이름 그대로 fallback 정의 (멱등 + 빈 DB 호환).
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  unit_id text,
  score int DEFAULT 0,
  max_score int DEFAULT 0,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;


-- =============================================
-- [SECTION 1] 신설 테이블 — lesson_concepts
-- 차시별 1~3개 핵심 개념 태그.
-- =============================================
CREATE TABLE IF NOT EXISTS lesson_concepts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lesson_id text NOT NULL,           -- 예: 'g1_korean_01_글자의짜임'
  concept_name text NOT NULL,        -- 예: '받침 분리'
  display_order int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lesson_id, concept_name)
);

CREATE INDEX IF NOT EXISTS idx_lc_lesson ON lesson_concepts(lesson_id);

ALTER TABLE lesson_concepts ENABLE ROW LEVEL SECURITY;

-- 누구나 개념 태그 조회 (콘텐츠 메타)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lesson_concepts' AND policyname='lc_anyone_read') THEN
    CREATE POLICY "lc_anyone_read" ON lesson_concepts
      FOR SELECT USING (true);
  END IF;
  -- 어드민만 관리
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lesson_concepts' AND policyname='lc_admin_manage') THEN
    CREATE POLICY "lc_admin_manage" ON lesson_concepts
      FOR ALL USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 1.5] 신설 테이블 — parent_student_links (선행 의존성)
-- 학부모-자녀 검증 매핑. parent_id는 auth.users.id 직접 참조.
-- 이후 wrong_answers / homework_* / scores의 학부모 RLS 정책이 본 테이블을 참조하므로
-- 반드시 먼저 정의되어야 함.
-- =============================================
CREATE TABLE IF NOT EXISTS parent_student_links (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  verified_at timestamptz,           -- NULL이면 검증 대기
  verified_by uuid REFERENCES teachers(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_psl_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_psl_student ON parent_student_links(student_id);

ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 학부모: 본인 매핑만 SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='parent_student_links' AND policyname='psl_parent_read') THEN
    CREATE POLICY "psl_parent_read" ON parent_student_links
      FOR SELECT USING (parent_id = auth.uid());
  END IF;
  -- 학부모: 본인 매핑 신청 INSERT (verified_at은 NULL로 들어감)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='parent_student_links' AND policyname='psl_parent_insert') THEN
    CREATE POLICY "psl_parent_insert" ON parent_student_links
      FOR INSERT WITH CHECK (parent_id = auth.uid() AND verified_at IS NULL);
  END IF;
  -- 교사: 본인 학급 학생 매핑 검증 (UPDATE verified_at)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='parent_student_links' AND policyname='psl_teacher_verify') THEN
    CREATE POLICY "psl_teacher_verify" ON parent_student_links
      FOR UPDATE USING (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  -- 교사: 본인 학급 학생 매핑 SELECT (검증 대기 목록 표시용)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='parent_student_links' AND policyname='psl_teacher_read') THEN
    CREATE POLICY "psl_teacher_read" ON parent_student_links
      FOR SELECT USING (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  -- 어드민
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='parent_student_links' AND policyname='psl_admin_all') THEN
    CREATE POLICY "psl_admin_all" ON parent_student_links
      FOR ALL USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 2] 신설 테이블 — wrong_answers (오답노트)
-- 학급코드 학생만 누적. 정답 시 resolved_at 기록.
-- =============================================
CREATE TABLE IF NOT EXISTS wrong_answers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  question_id text NOT NULL,         -- 차시 내 문제 식별자
  attempts int DEFAULT 1,
  last_wrong_at timestamptz DEFAULT now(),
  resolved_at timestamptz,           -- NULL이면 미해결
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, lesson_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_wa_student ON wrong_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_wa_lesson ON wrong_answers(lesson_id);
CREATE INDEX IF NOT EXISTS idx_wa_unresolved ON wrong_answers(student_id) WHERE resolved_at IS NULL;

ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 학생: 본인 오답노트 전체 (CRUD)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wrong_answers' AND policyname='wa_student_own') THEN
    CREATE POLICY "wa_student_own" ON wrong_answers
      FOR ALL USING (
        student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
      );
  END IF;
  -- 학부모: 본인 자녀 오답 존재 여부만 SELECT (개별 텍스트는 노출 X — 대시보드에서 컬럼 제한)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wrong_answers' AND policyname='wa_parent_read') THEN
    CREATE POLICY "wa_parent_read" ON wrong_answers
      FOR SELECT USING (
        student_id IN (
          SELECT psl.student_id FROM parent_student_links psl
          WHERE psl.parent_id = auth.uid() AND psl.verified_at IS NOT NULL
        )
      );
  END IF;
  -- 교사: 본인 학급 학생 오답 SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wrong_answers' AND policyname='wa_teacher_class') THEN
    CREATE POLICY "wa_teacher_class" ON wrong_answers
      FOR SELECT USING (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  -- 어드민: 전체
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wrong_answers' AND policyname='wa_admin_all') THEN
    CREATE POLICY "wa_admin_all" ON wrong_answers
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 3] 신설 테이블 — premium_settings (유료 토글 3단)
-- scope: global | school | student. 운영자(admin) 단독 권한.
-- =============================================
CREATE TABLE IF NOT EXISTS premium_settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope text NOT NULL CHECK (scope IN ('global', 'school', 'student')),
  target_id text,                    -- school: school 명, student: student_profiles.id, global: NULL
  enabled boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES teachers(id),
  UNIQUE(scope, target_id)
);

CREATE INDEX IF NOT EXISTS idx_ps_scope ON premium_settings(scope, enabled);

ALTER TABLE premium_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 누구나 SELECT (콘텐츠 잠금 판단용 — global/school 정도는 익명도 봐야 함)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='premium_settings' AND policyname='ps_anyone_read') THEN
    CREATE POLICY "ps_anyone_read" ON premium_settings
      FOR SELECT USING (true);
  END IF;
  -- 어드민(준호)만 INSERT/UPDATE/DELETE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='premium_settings' AND policyname='ps_admin_manage') THEN
    CREATE POLICY "ps_admin_manage" ON premium_settings
      FOR ALL USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 4] 신설 테이블 — homework_assignments + homework_completions
-- 교사가 학급 단위로 차시 또는 보충세트 숙제 지정.
-- =============================================
CREATE TABLE IF NOT EXISTS homework_assignments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_code_id uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  extra_set_id text,                 -- 보충 세트 식별자 (nullable)
  due_date date,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ha_class ON homework_assignments(class_code_id);
CREATE INDEX IF NOT EXISTS idx_ha_teacher ON homework_assignments(teacher_id);

ALTER TABLE homework_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 교사 본인이 만든 숙제 관리
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='homework_assignments' AND policyname='ha_teacher_own') THEN
    CREATE POLICY "ha_teacher_own" ON homework_assignments
      FOR ALL USING (
        teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
      );
  END IF;
  -- 학생: 자기 학급 숙제 SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='homework_assignments' AND policyname='ha_student_class') THEN
    CREATE POLICY "ha_student_class" ON homework_assignments
      FOR SELECT USING (
        class_code_id IN (
          SELECT class_code_id FROM student_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
  -- 학부모: 자녀 학급 숙제 SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='homework_assignments' AND policyname='ha_parent_read') THEN
    CREATE POLICY "ha_parent_read" ON homework_assignments
      FOR SELECT USING (
        class_code_id IN (
          SELECT sp.class_code_id FROM student_profiles sp
          JOIN parent_student_links psl ON sp.id = psl.student_id
          WHERE psl.parent_id = auth.uid() AND psl.verified_at IS NOT NULL
        )
      );
  END IF;
  -- 어드민
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='homework_assignments' AND policyname='ha_admin_all') THEN
    CREATE POLICY "ha_admin_all" ON homework_assignments
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
END $$;


CREATE TABLE IF NOT EXISTS homework_completions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assignment_id bigint NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_hc_assignment ON homework_completions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_hc_student ON homework_completions(student_id);

ALTER TABLE homework_completions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 학생: 본인 완료 INSERT/SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='homework_completions' AND policyname='hc_student_own') THEN
    CREATE POLICY "hc_student_own" ON homework_completions
      FOR ALL USING (
        student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
      ) WITH CHECK (
        student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
      );
  END IF;
  -- 교사: 본인 학급 완료 SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='homework_completions' AND policyname='hc_teacher_class') THEN
    CREATE POLICY "hc_teacher_class" ON homework_completions
      FOR SELECT USING (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  -- 학부모: 자녀 완료 SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='homework_completions' AND policyname='hc_parent_read') THEN
    CREATE POLICY "hc_parent_read" ON homework_completions
      FOR SELECT USING (
        student_id IN (
          SELECT psl.student_id FROM parent_student_links psl
          WHERE psl.parent_id = auth.uid() AND psl.verified_at IS NOT NULL
        )
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 5] (이동) parent_student_links는 의존성 때문에 SECTION 1.5로 이동됨.
--   wrong_answers·homework_*·scores의 학부모 RLS 정책이 본 테이블을 참조하므로
--   본 테이블이 먼저 존재해야 함.
-- =============================================


-- =============================================
-- [SECTION 6] scores 컬럼 추가 — question_id, concept_id, time_spent_sec
-- =============================================
ALTER TABLE scores ADD COLUMN IF NOT EXISTS question_id text;
ALTER TABLE scores ADD COLUMN IF NOT EXISTS concept_id bigint REFERENCES lesson_concepts(id);
ALTER TABLE scores ADD COLUMN IF NOT EXISTS time_spent_sec int;
ALTER TABLE scores ADD COLUMN IF NOT EXISTS is_correct boolean;
ALTER TABLE scores ADD COLUMN IF NOT EXISTS lesson_id text;  -- lesson_path와 별개로 정규화된 ID

CREATE INDEX IF NOT EXISTS idx_scores_student ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_lesson ON scores(lesson_id);
CREATE INDEX IF NOT EXISTS idx_scores_concept ON scores(concept_id);

-- scores RLS 4단 권한
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scores' AND policyname='scores_student_own') THEN
    CREATE POLICY "scores_student_own" ON scores
      FOR ALL USING (
        student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
      ) WITH CHECK (
        student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scores' AND policyname='scores_parent_read') THEN
    CREATE POLICY "scores_parent_read" ON scores
      FOR SELECT USING (
        student_id IN (
          SELECT psl.student_id FROM parent_student_links psl
          WHERE psl.parent_id = auth.uid() AND psl.verified_at IS NOT NULL
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scores' AND policyname='scores_teacher_class') THEN
    CREATE POLICY "scores_teacher_class" ON scores
      FOR SELECT USING (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scores' AND policyname='scores_admin_all') THEN
    CREATE POLICY "scores_admin_all" ON scores
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 7] 신설 뷰 — student_lesson_progress
-- 학생 차시별 진척도 + 진단 status (excellent/try_again/supplement).
-- 임계값: 80% 이상 / 60~79% / 60% 미만 (데이터진단_표준 7번).
-- =============================================
CREATE OR REPLACE VIEW student_lesson_progress AS
SELECT
  s.student_id,
  s.lesson_id,
  COUNT(*)::int                                                   AS attempts,
  COUNT(*) FILTER (WHERE s.is_correct = true)::int                AS correct_count,
  CASE
    WHEN COUNT(*) = 0 THEN 0
    ELSE ROUND(
      100.0 * COUNT(*) FILTER (WHERE s.is_correct = true) / COUNT(*)
    )::int
  END                                                             AS accuracy,
  CASE
    WHEN COUNT(*) = 0 THEN 'no_data'
    WHEN COUNT(*) FILTER (WHERE s.is_correct = true) * 100.0 / COUNT(*) >= 80 THEN 'excellent'
    WHEN COUNT(*) FILTER (WHERE s.is_correct = true) * 100.0 / COUNT(*) >= 60 THEN 'try_again'
    ELSE 'supplement'
  END                                                             AS status,
  SUM(s.time_spent_sec)::int                                      AS total_time_sec,
  MAX(s.earned_at)                                                AS last_attempt_at
FROM scores s
WHERE s.student_id IS NOT NULL
  AND s.lesson_id  IS NOT NULL
GROUP BY s.student_id, s.lesson_id;

-- 뷰는 기본 테이블(scores) RLS를 따름 → 별도 권한 불필요.


-- =============================================
-- [SECTION 8] 적합성 audit 대응 — page_visits 정책 폐기
-- 🔴 anyone_insert_visits = 무로그인 INSERT 허용 → 처리방침 위반.
-- =============================================
DROP POLICY IF EXISTS "anyone_insert_visits" ON page_visits;

-- 신규 정책: 로그인 사용자만 INSERT
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_visits' AND policyname='auth_insert_visits') THEN
    CREATE POLICY "auth_insert_visits" ON page_visits
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;


-- =============================================
-- [SECTION 9] 익명 닉네임 교사 일괄 부여 — student_profiles 보강
-- 적합성: 1학년 입력 부담 + 실명 저장 X.
-- 교사가 학급 단위로 nickname만 일괄 INSERT 가능하도록 정책 추가.
-- =============================================

-- student_profiles는 user_id NOT NULL이지만, 교사 일괄 부여는
-- "사전 등록 슬롯"이 아니라 학생이 가입하면 닉네임이 미리 정해져 있는 형태.
-- 따라서 교사용 별도 테이블 student_seats 신설 (가입 전 슬롯).
CREATE TABLE IF NOT EXISTS student_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code_id uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  claim_code text NOT NULL UNIQUE,   -- 학생이 가입 시 입력하는 단축코드 (6자리)
  claimed_by uuid REFERENCES student_profiles(id),
  claimed_at timestamptz,
  created_by uuid REFERENCES teachers(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_code_id, nickname)
);

CREATE INDEX IF NOT EXISTS idx_seats_class ON student_seats(class_code_id);
CREATE INDEX IF NOT EXISTS idx_seats_unclaimed ON student_seats(class_code_id) WHERE claimed_by IS NULL;

ALTER TABLE student_seats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 교사: 본인 학급 슬롯 전체 관리
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_seats' AND policyname='ss_teacher_own') THEN
    CREATE POLICY "ss_teacher_own" ON student_seats
      FOR ALL USING (
        class_code_id IN (
          SELECT cc.id FROM class_codes cc
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  -- 학생: claim_code로 조회 가능 (가입 전 anon 상태이므로 SELECT는 모두 허용 — claim_code 자체가 비밀)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_seats' AND policyname='ss_anyone_select') THEN
    CREATE POLICY "ss_anyone_select" ON student_seats
      FOR SELECT USING (true);
  END IF;
  -- 학생: 본인이 claim한 슬롯의 claimed_by/claimed_at만 UPDATE 가능
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_seats' AND policyname='ss_student_claim') THEN
    CREATE POLICY "ss_student_claim" ON student_seats
      FOR UPDATE USING (
        claimed_by IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 10] 학년 와이프 함수 — wipe_student_data()
-- 호출: 매년 2월 28일 자정 (cron 또는 수동).
-- 와이프 대상: scores, wrong_answers, homework_completions.
-- 보존: student_profiles (탈퇴는 학생/학부모 본인 의사), teachers, contents, premium_settings.
-- =============================================
CREATE OR REPLACE FUNCTION wipe_student_data()
RETURNS TABLE(table_name text, deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  c_scores bigint;
  c_wrong  bigint;
  c_hwc    bigint;
  c_seats  bigint;
BEGIN
  -- 어드민만 실행 가능
  IF NOT EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true) THEN
    RAISE EXCEPTION 'wipe_student_data: admin only';
  END IF;

  DELETE FROM scores;                  GET DIAGNOSTICS c_scores = ROW_COUNT;
  DELETE FROM wrong_answers;           GET DIAGNOSTICS c_wrong  = ROW_COUNT;
  DELETE FROM homework_completions;    GET DIAGNOSTICS c_hwc    = ROW_COUNT;
  DELETE FROM homework_assignments;    -- 숙제 자체도 학년 단위
  DELETE FROM student_seats WHERE claimed_by IS NULL; GET DIAGNOSTICS c_seats = ROW_COUNT;

  RETURN QUERY VALUES
    ('scores', c_scores),
    ('wrong_answers', c_wrong),
    ('homework_completions', c_hwc),
    ('student_seats_unclaimed', c_seats);
END $$;


-- =============================================
-- 완료. 다음 작업:
--   1. kedu_tracker.js 재작성 (본 사이클에 포함)
--   2. teacher/students-bulk.html (다음 사이클)
--   3. 처리방침 v2 (적합성 도메인)
-- =============================================
