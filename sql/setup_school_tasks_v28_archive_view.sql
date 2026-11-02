-- =============================================================================
-- setup_school_tasks_v28_archive_view.sql — 할 일판 v2.8 「보관함에서도 모은 글 다시 보기」
-- 준호 요구(2026-11-03): 제출이 끝나 보관해도, 내가 지우기 전까지는 모은 내용을 꺼내 볼 수 있어야 한다.
--   보관함 목록에 kind·collect_schema 를 더해 화면이 「모은 글 보기 ▾」를 붙인다. task_entries 는 닫힌 할 일도 읽는다(종전 그대로).
-- 재실행 안전.
-- =============================================================================
DROP FUNCTION IF EXISTS list_school_tasks_archived();
CREATE OR REPLACE FUNCTION list_school_tasks_archived()
RETURNS TABLE (id uuid, title text, due_date date, closed_at timestamptz, done_count int, teacher_count int, targeted boolean, to_names text,
               kind text, collect_schema jsonb, entry_count int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT s.id, s.title, s.due_date, s.closed_at,
         (SELECT count(*)::int FROM school_task_reads x WHERE x.task_id = s.id AND x.teacher_id IS DISTINCT FROM s.created_by),
         CASE WHEN EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = s.id)
              THEN (SELECT count(*)::int FROM school_task_targets g WHERE g.task_id = s.id)
              ELSE (SELECT count(*)::int FROM teachers t WHERE t.school_id = s.school_id AND t.approval IN ('auto','approved') AND t.id IS DISTINCT FROM s.created_by) END,
         EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = s.id),
         COALESCE((SELECT string_agg(tt.name, ', ' ORDER BY tt.name) FROM school_task_targets g JOIN teachers tt ON tt.id = g.teacher_id WHERE g.task_id = s.id), ''),
         s.kind, s.collect_schema,
         (SELECT count(*)::int FROM school_task_entries e WHERE e.task_id = s.id)
    FROM school_tasks s
   WHERE s.school_id = kedu_my_school_id() AND s.created_by = cw_my_teacher_id() AND s.closed_at IS NOT NULL
   ORDER BY s.closed_at DESC
   LIMIT 100
$fn$;
GRANT EXECUTE ON FUNCTION list_school_tasks_archived() TO authenticated;
