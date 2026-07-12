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
-- 학생측 — 받은 박스 조회·제출 (익명 auth + student_profiles 매핑, SECURITY DEFINER)
-- 학생은 테이블 직접 접근 X. 아래 RPC로만 접근(발송 검증 포함).
-- 학생 매핑: auth.uid() → student_profiles.user_id → id(프로필)·class_code_id
-- =============================================

-- 제출 중복 방지 (학생당 항목당 1제출 → 재제출은 갱신)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cw_sub_uniq') THEN
    ALTER TABLE cw_submissions ADD CONSTRAINT cw_sub_uniq UNIQUE (student_profile_id, item_id);
  END IF;
END $$;

-- [학생] 받은 박스 목록 (내 학급에 발송된 것 + 내 진행도)
CREATE OR REPLACE FUNCTION cw_my_inbox()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_uid uuid; v_pid uuid; v_cc uuid; v_res jsonb;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RETURN jsonb_build_object('status','no_session'); END IF;
  SELECT sp.id, sp.class_code_id INTO v_pid, v_cc FROM student_profiles sp WHERE sp.user_id = v_uid LIMIT 1;
  IF v_pid IS NULL THEN RETURN jsonb_build_object('status','no_profile'); END IF;
  SELECT jsonb_build_object('status','ok','boxes',
    COALESCE(jsonb_agg(box ORDER BY (box->>'sent_at') DESC), '[]'::jsonb))
  INTO v_res FROM (
    SELECT jsonb_build_object(
      'bundle_id', b.id, 'title', b.title, 'description', b.description, 'sent_at', s.sent_at,
      'item_count', (SELECT count(*) FROM cw_items i WHERE i.bundle_id = b.id),
      'done_count', (SELECT count(*) FROM cw_submissions su WHERE su.bundle_id = b.id AND su.student_profile_id = v_pid)
    ) AS box
    FROM cw_sends s JOIN cw_bundles b ON b.id = s.bundle_id
    WHERE s.class_code_id = v_cc AND b.status = 'sent'
  ) t;
  RETURN v_res;
END $$;
GRANT EXECUTE ON FUNCTION cw_my_inbox() TO authenticated;

-- [학생] 박스 열기 (항목 + 내 제출·채점 상태)
CREATE OR REPLACE FUNCTION cw_open_bundle(p_bundle_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_uid uuid; v_pid uuid; v_cc uuid; v_ok boolean; v_res jsonb;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RETURN jsonb_build_object('status','no_session'); END IF;
  SELECT sp.id, sp.class_code_id INTO v_pid, v_cc FROM student_profiles sp WHERE sp.user_id = v_uid LIMIT 1;
  IF v_pid IS NULL THEN RETURN jsonb_build_object('status','no_profile'); END IF;
  SELECT EXISTS(SELECT 1 FROM cw_sends s WHERE s.bundle_id = p_bundle_id AND s.class_code_id = v_cc) INTO v_ok;
  IF NOT v_ok THEN RETURN jsonb_build_object('status','not_found'); END IF;
  SELECT jsonb_build_object('status','ok',
    'bundle', (SELECT jsonb_build_object('id',b.id,'title',b.title,'description',b.description) FROM cw_bundles b WHERE b.id = p_bundle_id),
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', i.id, 'kind', i.kind, 'title', i.title, 'url', i.url,
        'submitted', (su.id IS NOT NULL), 'status', su.status, 'score', su.score,
        'feedback', su.feedback, 'payload', su.payload
      ) ORDER BY i.sort_order)
      FROM cw_items i
      LEFT JOIN cw_submissions su ON su.item_id = i.id AND su.student_profile_id = v_pid
      WHERE i.bundle_id = p_bundle_id
    ), '[]'::jsonb)
  ) INTO v_res;
  RETURN v_res;
END $$;
GRANT EXECUTE ON FUNCTION cw_open_bundle(uuid) TO authenticated;

-- [학생] 제출 (항목별, 재제출은 갱신)
CREATE OR REPLACE FUNCTION cw_submit(p_bundle_id uuid, p_item_id uuid, p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_uid uuid; v_pid uuid; v_cc uuid; v_ok boolean;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RETURN jsonb_build_object('status','no_session'); END IF;
  SELECT sp.id, sp.class_code_id INTO v_pid, v_cc FROM student_profiles sp WHERE sp.user_id = v_uid LIMIT 1;
  IF v_pid IS NULL THEN RETURN jsonb_build_object('status','no_profile'); END IF;
  SELECT EXISTS(SELECT 1 FROM cw_sends s WHERE s.bundle_id = p_bundle_id AND s.class_code_id = v_cc) INTO v_ok;
  IF NOT v_ok THEN RETURN jsonb_build_object('status','not_found'); END IF;
  INSERT INTO cw_submissions (bundle_id, item_id, student_profile_id, class_code_id, payload, status, submitted_at)
  VALUES (p_bundle_id, p_item_id, v_pid, v_cc, COALESCE(p_payload,'{}'::jsonb), 'submitted', now())
  ON CONFLICT (student_profile_id, item_id)
  DO UPDATE SET payload = EXCLUDED.payload, status = 'submitted', submitted_at = now();
  RETURN jsonb_build_object('status','ok');
END $$;
GRANT EXECUTE ON FUNCTION cw_submit(uuid, uuid, jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';
