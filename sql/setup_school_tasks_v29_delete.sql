-- =============================================================================
-- setup_school_tasks_v29_delete.sql — 할 일판 v2.9 「완전 삭제」
-- 준호 요구(2026-11-03): 보관함에 둔 것을 내가 지울 수 있어야 한다.
--   올린 사람(또는 준호)만 · 할 일·확인·받는 사람·제출·첨부 줄 전부 삭제(cascade) · 저장소 파일 경로는 돌려줘 화면이 지운다.
-- 재실행 안전.
-- =============================================================================
CREATE OR REPLACE FUNCTION delete_school_task(p_task_id uuid)
RETURNS text[] LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_sid text; v_paths text[];
BEGIN
  v_tid := cw_my_teacher_id(); v_sid := kedu_my_school_id();
  IF v_tid IS NULL OR v_sid IS NULL THEN RAISE EXCEPTION 'teacher required' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF NOT EXISTS (SELECT 1 FROM school_tasks s WHERE s.id = p_task_id AND s.school_id = v_sid AND (s.created_by = v_tid OR kedu_is_admin())) THEN
    RAISE EXCEPTION 'not your task' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT COALESCE(array_agg(p), '{}') INTO v_paths FROM (
    SELECT e.data->>'path' AS p FROM school_task_entries e WHERE e.task_id = p_task_id AND e.data ? 'path'
    UNION ALL
    SELECT a.url FROM school_task_attachments a WHERE a.task_id = p_task_id AND a.kind = 'file'
  ) q WHERE p IS NOT NULL AND p <> '';
  DELETE FROM school_tasks WHERE id = p_task_id;    -- reads·targets·entries·attachments 는 cascade
  RETURN v_paths;
END $fn$;
GRANT EXECUTE ON FUNCTION delete_school_task(uuid) TO authenticated;
