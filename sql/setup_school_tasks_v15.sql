-- =============================================================================
-- setup_school_tasks_v15.sql — 우리 학교 할 일판 v1.5 「같이 쓰는 자리」: 링크·파일 첨부
-- 준호 요구(2026-09-08, 실사용 뒤): 파일 올리기 + 구글 시트·드라이브 링크를 쉽게 붙여 공동 작업 공간으로.
--   시트 자체를 케이에듀가 흉내 내지 않는다 — 링크로 잇는다(준호 결정). 동시 편집은 시트 쪽 몫.
-- 전제: setup_school_tasks.sql v1.4 까지 실행됨(school_tasks · kedu_task_visible · kedu_my_school_id · kedu_is_school_admin).
-- ⚠️ 저장소(bucket·storage 정책)는 별도 파일 setup_school_tasks_v15_storage.sql — SQL Editor 는 파일 전체가 한 트랜잭션이라
--    storage 정책이 막히면 표까지 되돌아간다(09-07 실측 교훈). 이 파일 먼저, 그다음 storage.
-- 재실행 안전.
-- =============================================================================

CREATE TABLE IF NOT EXISTS school_task_attachments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    uuid NOT NULL REFERENCES school_tasks(id) ON DELETE CASCADE,
  school_id  text NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('link','file')),
  url        text NOT NULL,          -- link: https://… / file: 저장소 경로 {school_id}/{task_id}/{uuid}.{ext}
  label      text NOT NULL DEFAULT '',
  mime       text NOT NULL DEFAULT '',
  size       integer NOT NULL DEFAULT 0,
  added_by   uuid REFERENCES teachers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_school_task_att_task ON school_task_attachments (task_id, created_at);
COMMENT ON TABLE school_task_attachments IS '할 일판 첨부(v1.5). link = 시트·드라이브·문서 주소, file = school 버킷 경로. 같은 학교 승인 교사 누구나 붙인다(공동 작업).';

DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'school_task_att_shape') THEN
    ALTER TABLE school_task_attachments ADD CONSTRAINT school_task_att_shape
      CHECK ( length(label) <= 120 AND length(url) <= 2000 AND size >= 0 AND size <= 20971520
              AND ( (kind = 'link' AND url ~* '^https?://') OR (kind = 'file' AND url !~* '^https?://') ) );
  END IF;
END $do$;

-- RLS — 보이는 할 일의 첨부만 보인다 · 쓰기는 같은 학교 승인 교사(공동 작업) · 지우기는 붙인 사람·올린 사람·학교 관리자
ALTER TABLE school_task_attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_stask_att_select ON school_task_attachments;
CREATE POLICY p_stask_att_select ON school_task_attachments
  FOR SELECT TO authenticated
  USING (school_id = kedu_my_school_id() AND kedu_task_visible(task_id));
DROP POLICY IF EXISTS p_stask_att_insert ON school_task_attachments;
CREATE POLICY p_stask_att_insert ON school_task_attachments
  FOR INSERT TO authenticated
  WITH CHECK (school_id = kedu_my_school_id() AND kedu_teacher_approved() AND kedu_task_visible(task_id)
              AND added_by = cw_my_teacher_id());
DROP POLICY IF EXISTS p_stask_att_delete ON school_task_attachments;
CREATE POLICY p_stask_att_delete ON school_task_attachments
  FOR DELETE TO authenticated
  USING (school_id = kedu_my_school_id()
         AND ( added_by = cw_my_teacher_id()
               OR EXISTS (SELECT 1 FROM school_tasks s WHERE s.id = task_id AND s.created_by = cw_my_teacher_id())
               OR kedu_is_school_admin() ));

-- ── 첨부 붙이기 ──────────────────────────────────────────────
-- kind='link': p_url 은 https 주소, p_label 비면 도메인. kind='file': p_url 은 저장소 경로(화면이 올린 뒤 넘김) — 경로 앞이 우리 학교/이 할 일이어야 한다.
CREATE OR REPLACE FUNCTION add_school_task_attachment(p_task_id uuid, p_kind text, p_url text, p_label text DEFAULT '', p_mime text DEFAULT '', p_size integer DEFAULT 0)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_sid text; v_id uuid; v_url text; v_label text;
BEGIN
  v_tid := cw_my_teacher_id(); v_sid := kedu_my_school_id();
  IF v_tid IS NULL OR NOT kedu_teacher_approved() THEN RAISE EXCEPTION 'approval required' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF v_sid IS NULL THEN RAISE EXCEPTION 'school required' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF NOT kedu_task_visible(p_task_id) THEN RAISE EXCEPTION 'task not visible' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF EXISTS (SELECT 1 FROM school_tasks s WHERE s.id = p_task_id AND s.closed_at IS NOT NULL) THEN
    RAISE EXCEPTION 'task closed' USING ERRCODE = 'check_violation';
  END IF;
  v_url := btrim(coalesce(p_url,''));
  IF p_kind = 'link' THEN
    IF v_url !~* '^https?://' THEN RAISE EXCEPTION 'link must start with http(s)://' USING ERRCODE = 'check_violation'; END IF;
    v_label := coalesce(nullif(btrim(p_label),''), regexp_replace(v_url, '^https?://([^/]+).*$', '\1'));
  ELSIF p_kind = 'file' THEN
    IF v_url NOT LIKE v_sid || '/' || p_task_id::text || '/%' THEN RAISE EXCEPTION 'bad file path' USING ERRCODE = 'check_violation'; END IF;
    v_label := coalesce(nullif(btrim(p_label),''), regexp_replace(v_url, '^.*/', ''));
  ELSE
    RAISE EXCEPTION 'kind must be link or file' USING ERRCODE = 'check_violation';
  END IF;
  IF (SELECT count(*) FROM school_task_attachments a WHERE a.task_id = p_task_id) >= 20 THEN
    RAISE EXCEPTION 'too many attachments' USING ERRCODE = 'check_violation';
  END IF;
  INSERT INTO school_task_attachments (task_id, school_id, kind, url, label, mime, size, added_by)
  VALUES (p_task_id, v_sid, p_kind, left(v_url, 2000), left(v_label, 120), left(coalesce(p_mime,''), 80), greatest(0, coalesce(p_size,0)), v_tid)
  RETURNING id INTO v_id;
  UPDATE school_tasks SET updated_at = now() WHERE id = p_task_id;
  RETURN v_id;
END $fn$;
GRANT EXECUTE ON FUNCTION add_school_task_attachment(uuid, text, text, text, text, integer) TO authenticated;

-- ── 첨부 떼기 — 붙인 사람 · 할 일 올린 사람 · 학교 관리자. 파일 실체 삭제는 화면이 storage.remove 로(정책이 소유자만 허용) ──
CREATE OR REPLACE FUNCTION remove_school_task_attachment(p_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_row school_task_attachments%ROWTYPE;
BEGIN
  v_tid := cw_my_teacher_id();
  SELECT * INTO v_row FROM school_task_attachments WHERE id = p_id AND school_id = kedu_my_school_id();
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'not found' USING ERRCODE = 'no_data_found'; END IF;
  IF NOT ( v_row.added_by = v_tid
           OR EXISTS (SELECT 1 FROM school_tasks s WHERE s.id = v_row.task_id AND s.created_by = v_tid)
           OR kedu_is_school_admin() ) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = 'insufficient_privilege';
  END IF;
  DELETE FROM school_task_attachments WHERE id = p_id;
  RETURN CASE WHEN v_row.kind = 'file' THEN v_row.url ELSE '' END;   -- 파일이면 경로를 돌려줘 화면이 저장소에서도 지운다
END $fn$;
GRANT EXECUTE ON FUNCTION remove_school_task_attachment(uuid) TO authenticated;

-- ── 첨부 목록 — 보이는 할 일 전부의 첨부를 한 번에(목록 그릴 때 한 호출) ──
DROP FUNCTION IF EXISTS list_school_task_attachments();
CREATE OR REPLACE FUNCTION list_school_task_attachments()
RETURNS TABLE (id uuid, task_id uuid, kind text, url text, label text, mime text, size integer,
               added_by_name text, mine boolean, can_remove boolean, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT a.id, a.task_id, a.kind, a.url, a.label, a.mime, a.size,
         COALESCE(t.name,'') AS added_by_name,
         (a.added_by = cw_my_teacher_id()) AS mine,
         ( a.added_by = cw_my_teacher_id()
           OR s.created_by = cw_my_teacher_id()
           OR kedu_is_school_admin() ) AS can_remove,
         a.created_at
    FROM school_task_attachments a
    JOIN school_tasks s ON s.id = a.task_id
    LEFT JOIN teachers t ON t.id = a.added_by
   WHERE a.school_id = kedu_my_school_id() AND kedu_task_visible(a.task_id)
   ORDER BY a.task_id, a.created_at
   LIMIT 2000
$fn$;
GRANT EXECUTE ON FUNCTION list_school_task_attachments() TO authenticated;

-- 검산:
--   SELECT count(*) FROM school_task_attachments;                       → 0 (처음)
--   SELECT proname FROM pg_proc WHERE proname LIKE '%school_task_attachment%';  → 3
--   SELECT policyname FROM pg_policies WHERE tablename='school_task_attachments'; → 3
