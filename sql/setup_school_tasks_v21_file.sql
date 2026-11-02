-- =============================================================================
-- setup_school_tasks_v21_file.sql — 우리 학교 할 일판 v2.1 「파일 제출형 취합」
-- 준호 결정(2026-11-02): 각 반이 한글 파일을 내면 여러 반이 합쳐져야 한다 — 자동 합치기(hwp/hwpx)는 서식이 무너져 믿을 수 없으므로,
--   ① 반마다 파일 한 개를 낸다(내는 순간 그 교사 할 일 자동 완료 · 다시 내면 교체)
--   ② 담당자는 누가 냈는지 보고, 다 모이면 「반 순서대로 한꺼번에 내려받기」(zip · 01_1-1_이름_파일명)
--   ③ 마지막 합치기 한 번은 한글의 「문서 끼워 넣기」(파일 전부 선택) — 서식이 각 반이 낸 그대로 산다
-- 파일 실체 = v1.5 school 버킷 {school_id}/{task_id}/{uuid}.{ext} (storage 정책 그대로 · 같은 학교만 읽는다).
-- 전제: setup_school_tasks_v2_collect.sql. 재실행 안전.
-- =============================================================================

-- kind 에 'file' 추가
ALTER TABLE school_tasks DROP CONSTRAINT IF EXISTS school_tasks_kind_check;
ALTER TABLE school_tasks ADD CONSTRAINT school_tasks_kind_check CHECK (kind IN ('notice','collect','file'));

-- 올리기 — kind='file' 허용(양식 없음)
CREATE OR REPLACE FUNCTION add_school_task(p_title text, p_detail text DEFAULT '', p_due date DEFAULT NULL, p_to uuid[] DEFAULT NULL,
                                           p_kind text DEFAULT 'notice', p_schema jsonb DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_sid text; v_id uuid; v_kind text; v_schema jsonb;
BEGIN
  v_tid := cw_my_teacher_id();
  v_sid := kedu_my_school_id();
  IF v_tid IS NULL THEN RAISE EXCEPTION 'teacher required' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF NOT kedu_teacher_approved() THEN RAISE EXCEPTION 'approval required' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF v_sid IS NULL THEN RAISE EXCEPTION 'school required' USING ERRCODE = 'insufficient_privilege'; END IF;
  v_kind := CASE WHEN p_kind IN ('collect','file') THEN p_kind ELSE 'notice' END;
  v_schema := CASE WHEN v_kind = 'collect' THEN kedu_norm_collect_schema(p_schema) ELSE NULL END;
  INSERT INTO school_tasks (school_id, title, detail, due_date, created_by, kind, collect_schema)
  VALUES (v_sid, btrim(p_title), left(coalesce(p_detail,''), 1000), p_due, v_tid, v_kind, v_schema)
  RETURNING id INTO v_id;
  IF p_to IS NOT NULL AND array_length(p_to, 1) > 0 THEN
    INSERT INTO school_task_targets (task_id, teacher_id)
    SELECT v_id, t.id FROM teachers t
     WHERE t.id = ANY(p_to) AND t.school_id = v_sid AND t.approval IN ('auto','approved') AND t.id <> v_tid
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN v_id;
END $fn$;
GRANT EXECUTE ON FUNCTION add_school_task(text, text, date, uuid[], text, jsonb) TO authenticated;

-- 파일 내기(= 자동 완료). 화면이 저장소에 올린 뒤 경로를 넘긴다. 다시 내면 교체 — 옛 경로를 돌려줘 화면이 저장소에서 지운다.
CREATE OR REPLACE FUNCTION submit_task_file(p_task_id uuid, p_path text, p_name text, p_size integer DEFAULT 0)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_sid text; v_task school_tasks%ROWTYPE; v_old text;
BEGIN
  v_tid := cw_my_teacher_id(); v_sid := kedu_my_school_id();
  IF v_tid IS NULL OR NOT kedu_teacher_approved() THEN RAISE EXCEPTION 'approval required' USING ERRCODE = 'insufficient_privilege'; END IF;
  SELECT * INTO v_task FROM school_tasks WHERE id = p_task_id AND school_id = v_sid;
  IF v_task.id IS NULL OR NOT kedu_task_visible(p_task_id) THEN RAISE EXCEPTION 'not your school task' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF v_task.kind <> 'file' THEN RAISE EXCEPTION 'not a file task' USING ERRCODE = 'check_violation'; END IF;
  IF v_task.closed_at IS NOT NULL THEN RAISE EXCEPTION 'task closed' USING ERRCODE = 'check_violation'; END IF;
  IF v_task.created_by <> v_tid AND EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = p_task_id)
     AND NOT EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = p_task_id AND g.teacher_id = v_tid) THEN
    RAISE EXCEPTION 'not a recipient' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_path NOT LIKE v_sid || '/' || p_task_id::text || '/%' THEN RAISE EXCEPTION 'bad file path' USING ERRCODE = 'check_violation'; END IF;
  SELECT e.data->>'path' INTO v_old FROM school_task_entries e WHERE e.task_id = p_task_id AND e.teacher_id = v_tid;
  INSERT INTO school_task_entries (task_id, teacher_id, school_id, data)
  VALUES (p_task_id, v_tid, v_sid, jsonb_build_object('path', left(p_path, 2000), 'name', left(coalesce(p_name,''), 200), 'size', greatest(0, coalesce(p_size,0))))
  ON CONFLICT (task_id, teacher_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now();
  INSERT INTO school_task_reads (task_id, teacher_id) VALUES (p_task_id, v_tid) ON CONFLICT DO NOTHING;
  UPDATE school_tasks SET updated_at = now() WHERE id = p_task_id;
  RETURN coalesce(v_old, '');
END $fn$;
GRANT EXECUTE ON FUNCTION submit_task_file(uuid, text, text, integer) TO authenticated;

-- 모은 표 — 파일형도 같은 함수로(kind IN collect·file)
CREATE OR REPLACE FUNCTION task_entries(p_task_id uuid)
RETURNS TABLE (teacher_id uuid, name text, class_label text, data jsonb, submitted_at timestamptz, updated_at timestamptz, is_creator boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  WITH t AS (
    SELECT s.id, s.school_id, s.created_by,
           (s.created_by = cw_my_teacher_id() OR kedu_is_admin() OR kedu_is_school_admin()) AS see_all
      FROM school_tasks s
     WHERE s.id = p_task_id AND s.school_id = kedu_my_school_id() AND s.kind IN ('collect','file') AND kedu_task_visible(s.id)
  ), who AS (
    SELECT g.teacher_id FROM school_task_targets g, t WHERE g.task_id = t.id
    UNION
    SELECT tt.id FROM teachers tt, t
     WHERE NOT EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = t.id)
       AND tt.school_id = t.school_id AND tt.approval IN ('auto','approved') AND tt.id IS DISTINCT FROM t.created_by
    UNION
    SELECT e.teacher_id FROM school_task_entries e, t WHERE e.task_id = t.id
  )
  SELECT w.teacher_id, COALESCE(tt.name,''),
         COALESCE((SELECT c.label FROM class_codes c WHERE c.teacher_id = tt.id AND c.is_active ORDER BY c.created_at DESC LIMIT 1), ''),
         e.data, e.submitted_at, e.updated_at, (w.teacher_id = t.created_by)
    FROM who w
    CROSS JOIN t
    JOIN teachers tt ON tt.id = w.teacher_id
    LEFT JOIN school_task_entries e ON e.task_id = t.id AND e.teacher_id = w.teacher_id
   WHERE t.see_all OR w.teacher_id = cw_my_teacher_id()
   ORDER BY (e.teacher_id IS NULL), 3, tt.name
$fn$;
GRANT EXECUTE ON FUNCTION task_entries(uuid) TO authenticated;

-- 검산: SELECT proname FROM pg_proc WHERE proname IN ('submit_task_file','task_entries','add_school_task'); → 3행
