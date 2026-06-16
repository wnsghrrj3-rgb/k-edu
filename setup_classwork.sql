-- =============================================
-- K-edu 케이박스(classwork) — 콘텐츠 묶음 전달 → 제출 → 채점 → 피드백
-- 작성: 2026-06-16
-- 본질: 교사가 케이에듀 콘텐츠(케이티처·자기주도·케이랩·케이플·케이메이커·영어)를
--       하나의 "케이박스"로 묶어 학급에 보내고, 학생 결과를 받아 채점·피드백까지 닫는 루프.
-- 의존: setup_tables.sql(teachers, class_codes.teacher_id), setup_student_profiles.sql(student_profiles)
-- 교사 식별 체인: auth.uid() → teachers.user_id → teachers.id → class_codes.teacher_id
-- 멱등(idempotent) — 재실행 안전.
-- 상태: 교사측 RLS 완비. 학생 제출·수신은 다음 단계에서 RPC(익명 auth + student_profiles 매핑)로 연결.
-- =============================================

-- 교사 id 헬퍼 (auth.uid() → teachers.id)
CREATE OR REPLACE FUNCTION cw_my_teacher_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM teachers WHERE user_id = auth.uid() LIMIT 1
$$;

-- =============================================
-- [1] cw_bundles — 케이박스 (교사가 만드는 묶음)
-- =============================================
CREATE TABLE IF NOT EXISTS cw_bundles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text DEFAULT '',
  status      text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent')),
  created_at  timestamptz DEFAULT now(),
  sent_at     timestamptz
);
CREATE INDEX IF NOT EXISTS idx_cw_bundles_teacher ON cw_bundles(teacher_id);

-- =============================================
-- [2] cw_items — 케이박스에 담긴 콘텐츠 항목
-- kind = 케이에듀 도구 종류. url = 바로 여는 경로(deep-link). config = 종류별 부가설정.
-- =============================================
CREATE TABLE IF NOT EXISTS cw_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id  uuid NOT NULL REFERENCES cw_bundles(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('kteacher','selfstudy','klab','kple','kmake','english','link')),
  title      text NOT NULL,
  url        text DEFAULT '',
  config     jsonb DEFAULT '{}'::jsonb,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cw_items_bundle ON cw_items(bundle_id);

-- =============================================
-- [3] cw_sends — 발송 (한 케이박스를 여러 학급에 보낼 수 있음)
-- =============================================
CREATE TABLE IF NOT EXISTS cw_sends (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id     uuid NOT NULL REFERENCES cw_bundles(id) ON DELETE CASCADE,
  class_code_id uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  sent_at       timestamptz DEFAULT now(),
  UNIQUE (bundle_id, class_code_id)
);
CREATE INDEX IF NOT EXISTS idx_cw_sends_class ON cw_sends(class_code_id);

-- =============================================
-- [4] cw_submissions — 학생 제출 + 채점·피드백 (한 행에 결과와 평가를 함께)
-- payload  = 학생 결과(작품 JSON·답안·게임점수 등 종류별)
-- status   = submitted(제출) → graded(채점완료)
-- score / feedback / graded_at / graded_by = 교사 채점·피드백
-- =============================================
CREATE TABLE IF NOT EXISTS cw_submissions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id          uuid NOT NULL REFERENCES cw_bundles(id) ON DELETE CASCADE,
  item_id            uuid REFERENCES cw_items(id) ON DELETE CASCADE,
  student_profile_id uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  class_code_id      uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  payload            jsonb DEFAULT '{}'::jsonb,
  status             text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','graded')),
  score              numeric,
  feedback           text DEFAULT '',
  submitted_at       timestamptz DEFAULT now(),
  graded_at          timestamptz,
  graded_by          uuid REFERENCES teachers(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_cw_subs_bundle ON cw_submissions(bundle_id);
CREATE INDEX IF NOT EXISTS idx_cw_subs_class  ON cw_submissions(class_code_id);

-- =============================================
-- RLS — 교사측 (본인 케이박스·항목·발송 전체 / 본인 학급 제출 조회·채점)
-- =============================================
ALTER TABLE cw_bundles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cw_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cw_sends       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cw_submissions ENABLE ROW LEVEL SECURITY;

-- bundles: 본인 것 전체
DROP POLICY IF EXISTS cw_bundles_teacher ON cw_bundles;
CREATE POLICY cw_bundles_teacher ON cw_bundles
  FOR ALL USING (teacher_id = cw_my_teacher_id())
  WITH CHECK (teacher_id = cw_my_teacher_id());

-- items: 소유 케이박스의 항목
DROP POLICY IF EXISTS cw_items_teacher ON cw_items;
CREATE POLICY cw_items_teacher ON cw_items
  FOR ALL USING (bundle_id IN (SELECT id FROM cw_bundles WHERE teacher_id = cw_my_teacher_id()))
  WITH CHECK (bundle_id IN (SELECT id FROM cw_bundles WHERE teacher_id = cw_my_teacher_id()));

-- sends: 소유 케이박스의 발송, 대상 학급도 본인 것
DROP POLICY IF EXISTS cw_sends_teacher ON cw_sends;
CREATE POLICY cw_sends_teacher ON cw_sends
  FOR ALL USING (bundle_id IN (SELECT id FROM cw_bundles WHERE teacher_id = cw_my_teacher_id()))
  WITH CHECK (
    bundle_id IN (SELECT id FROM cw_bundles WHERE teacher_id = cw_my_teacher_id())
    AND class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = cw_my_teacher_id())
  );

-- submissions: 교사는 본인 학급 제출을 조회·채점(update). (학생 insert 정책은 다음 단계 RPC에서.)
DROP POLICY IF EXISTS cw_subs_teacher_read ON cw_submissions;
CREATE POLICY cw_subs_teacher_read ON cw_submissions
  FOR SELECT USING (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = cw_my_teacher_id()));

DROP POLICY IF EXISTS cw_subs_teacher_grade ON cw_submissions;
CREATE POLICY cw_subs_teacher_grade ON cw_submissions
  FOR UPDATE USING (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = cw_my_teacher_id()))
  WITH CHECK (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = cw_my_teacher_id()));

-- =============================================
-- [다음 단계] 학생측 — 별도 사이클에서 추가
--  · 받은 케이박스 조회: 익명 auth.uid() → student_profiles → class_code_id → cw_sends 조인 RPC
--  · 제출: claim_seat 패턴의 SECURITY DEFINER RPC(cw_submit)로 student_profile 검증 후 insert
--  · 학생 RLS는 student_profiles의 auth 매핑을 RPC로 감싸 처리(직접 노출 최소화)
-- =============================================
