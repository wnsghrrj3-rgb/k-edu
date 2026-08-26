-- =============================================
-- K-edu 「우리 반에 열기」 — 생태계설계_v2_공개준비 §F (A6) · §J-3
-- 작성: 2026-08-26
-- 본질: 교사가 어떤 콘텐츠를 어느 학급에 열어 줬는지의 원장. 게이트(/kedu_gate.js)는 학급 세션의
--       class·class_rec 콘텐츠를 이 원장으로 판정한다(굳은 모드 OPENING_LOCK=true 일 때).
--       개방 한 줄 = 케이박스 카드 한 장(같은 사실의 두 얼굴, §F) — bundle_id 로 묶는다.
-- content_key 규약(게이트와 동일):
--   · lesson-id (예 g3_sci_u1_l09_v1)  → 그 차시만 (정확 일치)
--   · 경로 (예 /kpark/ · /labs/volcano.html) → 그 경로로 시작하는 모든 페이지 (접두 일치)
-- 의존: setup_tables.sql(class_codes, teachers) · setup_classwork.sql(cw_bundles) · setup_teacher_approval.sql(kedu_teacher_approved)
-- 멱등 — 재실행 안전. 달러 인용 $fn$/$do$.
-- =============================================

CREATE TABLE IF NOT EXISTS class_openings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code_id uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  content_key   text NOT NULL,
  title         text NOT NULL DEFAULT '',
  kind          text NOT NULL DEFAULT 'link',
  url           text NOT NULL DEFAULT '',
  bundle_id     uuid REFERENCES cw_bundles(id) ON DELETE SET NULL,
  opened_by     uuid REFERENCES teachers(id) ON DELETE SET NULL,
  opened_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_code_id, content_key)
);
CREATE INDEX IF NOT EXISTS idx_class_openings_class ON class_openings(class_code_id);

COMMENT ON TABLE class_openings IS
  '「우리 반에 열기」 원장. content_key = lesson-id(정확) 또는 경로 접두. 게이트가 학급 세션의 class·class_rec 판정에 쓴다(§F·§J-3).';

DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'class_openings_key_check') THEN
    ALTER TABLE class_openings ADD CONSTRAINT class_openings_key_check
      CHECK (length(content_key) BETWEEN 2 AND 200 AND content_key !~ '\s');
  END IF;
END $do$;

ALTER TABLE class_openings ENABLE ROW LEVEL SECURITY;

-- 교사: 자기 학급 것만. 쓰기는 승인 교사만(§D-5 "개방" 잠금).
DROP POLICY IF EXISTS p_class_openings_teacher ON class_openings;
CREATE POLICY p_class_openings_teacher ON class_openings
  FOR ALL TO authenticated
  USING (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = cw_my_teacher_id()))
  WITH CHECK (
    class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = cw_my_teacher_id())
    AND kedu_teacher_approved()
  );

-- 학생·게스트: 테이블 직접 접근 없음. 학급코드로 개방 목록만 받는다(세션 불요, anon 호출).
--   반환 최소화: content_key 만. 활성 학급코드가 아니면 빈 목록(존재 여부를 흘리지 않는다).
CREATE OR REPLACE FUNCTION list_class_openings(p_class_code text)
RETURNS TABLE (content_key text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT o.content_key
    FROM class_openings o
    JOIN class_codes c ON c.id = o.class_code_id
   WHERE c.is_active = true
     AND c.code = upper(trim(coalesce(p_class_code, '')))
     AND length(trim(coalesce(p_class_code, ''))) BETWEEN 4 AND 12
   ORDER BY o.opened_at DESC
   LIMIT 200
$fn$;
GRANT EXECUTE ON FUNCTION list_class_openings(text) TO anon, authenticated;

-- 교사: 열기(멱등 upsert) — 같은 반·같은 key 는 한 줄. bundle_id 는 처음 열 때만 채운다(닫았다 다시 열어도 카드는 하나).
CREATE OR REPLACE FUNCTION open_for_class(
  p_class_code_id uuid, p_content_key text, p_title text, p_kind text, p_url text, p_bundle_id uuid DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_tid uuid;
  v_id  uuid;
BEGIN
  v_tid := cw_my_teacher_id();
  IF v_tid IS NULL THEN
    RAISE EXCEPTION 'teacher required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF NOT kedu_teacher_approved() THEN
    RAISE EXCEPTION 'approval required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM class_codes WHERE id = p_class_code_id AND teacher_id = v_tid) THEN
    RAISE EXCEPTION 'not your class' USING ERRCODE = 'insufficient_privilege';
  END IF;
  INSERT INTO class_openings (class_code_id, content_key, title, kind, url, bundle_id, opened_by)
  VALUES (p_class_code_id, trim(p_content_key), left(coalesce(p_title,''), 120), coalesce(p_kind,'link'), left(coalesce(p_url,''), 400), p_bundle_id, v_tid)
  ON CONFLICT (class_code_id, content_key) DO UPDATE
     SET title = EXCLUDED.title, kind = EXCLUDED.kind, url = EXCLUDED.url,
         bundle_id = COALESCE(class_openings.bundle_id, EXCLUDED.bundle_id),
         opened_by = v_tid, opened_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$fn$;
GRANT EXECUTE ON FUNCTION open_for_class(uuid, text, text, text, text, uuid) TO authenticated;

-- 교사: 닫기 — 원장에서 지운다. 케이박스 카드(bundle)는 이력이므로 남긴다.
CREATE OR REPLACE FUNCTION close_for_class(p_class_code_id uuid, p_content_key text)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_tid uuid;
  v_n   int;
BEGIN
  v_tid := cw_my_teacher_id();
  IF v_tid IS NULL THEN
    RAISE EXCEPTION 'teacher required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  DELETE FROM class_openings o
   USING class_codes c
   WHERE o.class_code_id = c.id AND c.teacher_id = v_tid
     AND o.class_code_id = p_class_code_id AND o.content_key = trim(p_content_key);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RETURN v_n;
END;
$fn$;
GRANT EXECUTE ON FUNCTION close_for_class(uuid, text) TO authenticated;

-- ---------------------------------------------------------------
-- 검산
--   SELECT count(*) FROM class_openings;                                   → 0 (첫 실행)
--   SELECT * FROM list_class_openings('ABCDEF');                           → 0 rows (없는 코드)
--   SELECT policyname FROM pg_policies WHERE tablename = 'class_openings'; → p_class_openings_teacher
-- ---------------------------------------------------------------
