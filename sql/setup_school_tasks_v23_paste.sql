-- =============================================================================
-- setup_school_tasks_v23_paste.sql — 우리 학교 할 일판 v2.3 「한글 붙여넣기 취합」
-- 준호 결정(2026-11-02): 파일 합치기가 안 되면 각자 한글 내용을 복사해 붙여넣고, 다 모이면 반 순서로 이어진 전체를 한 번에 복사해 한글에 넣는다.
--   kind='paste' · 제출 = html(붙여넣은 내용) + text(검색·미리보기용) · 제출 = 자동 완료 · 다시 내면 교체
-- 전제: setup_school_tasks_v22_class_order.sql. 재실행 안전.
-- =============================================================================
ALTER TABLE school_tasks DROP CONSTRAINT IF EXISTS school_tasks_kind_check;
ALTER TABLE school_tasks ADD CONSTRAINT school_tasks_kind_check CHECK (kind IN ('notice','collect','file','paste'));

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
  v_kind := CASE WHEN p_kind IN ('collect','file','paste') THEN p_kind ELSE 'notice' END;
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

-- 붙여넣기 제출(= 자동 완료). html 은 1.5MB 까지 · script/style/iframe 은 서버에서도 한 번 더 뗀다.
CREATE OR REPLACE FUNCTION submit_task_paste(p_task_id uuid, p_html text, p_text text DEFAULT '')
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_sid text; v_task school_tasks%ROWTYPE; v_html text; v_text text;
BEGIN
  v_tid := cw_my_teacher_id(); v_sid := kedu_my_school_id();
  IF v_tid IS NULL OR NOT kedu_teacher_approved() THEN RAISE EXCEPTION 'approval required' USING ERRCODE = 'insufficient_privilege'; END IF;
  SELECT * INTO v_task FROM school_tasks WHERE id = p_task_id AND school_id = v_sid;
  IF v_task.id IS NULL OR NOT kedu_task_visible(p_task_id) THEN RAISE EXCEPTION 'not your school task' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF v_task.kind <> 'paste' THEN RAISE EXCEPTION 'not a paste task' USING ERRCODE = 'check_violation'; END IF;
  IF v_task.closed_at IS NOT NULL THEN RAISE EXCEPTION 'task closed' USING ERRCODE = 'check_violation'; END IF;
  IF v_task.created_by <> v_tid AND EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = p_task_id)
     AND NOT EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = p_task_id AND g.teacher_id = v_tid) THEN
    RAISE EXCEPTION 'not a recipient' USING ERRCODE = 'insufficient_privilege';
  END IF;
  v_html := coalesce(p_html, '');
  v_html := regexp_replace(v_html, '<(script|style|iframe|object|embed|link|meta)[^>]*>.*?</\1>', '', 'gis');
  v_html := regexp_replace(v_html, '<(script|style|iframe|object|embed|link|meta)[^>]*/?>', '', 'gi');
  v_html := regexp_replace(v_html, '\son[a-z]+\s*=\s*("[^"]*"|''[^'']*''|[^\s>]+)', '', 'gi');
  IF length(v_html) > 1500000 THEN RAISE EXCEPTION 'too long' USING ERRCODE = 'check_violation'; END IF;
  v_text := left(btrim(coalesce(p_text, '')), 20000);
  IF length(v_text) = 0 THEN RAISE EXCEPTION 'required: 내용' USING ERRCODE = 'check_violation'; END IF;
  INSERT INTO school_task_entries (task_id, teacher_id, school_id, data)
  VALUES (p_task_id, v_tid, v_sid, jsonb_build_object('html', v_html, 'text', v_text))
  ON CONFLICT (task_id, teacher_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now();
  INSERT INTO school_task_reads (task_id, teacher_id) VALUES (p_task_id, v_tid) ON CONFLICT DO NOTHING;
  UPDATE school_tasks SET updated_at = now() WHERE id = p_task_id;
  RETURN true;
END $fn$;
GRANT EXECUTE ON FUNCTION submit_task_paste(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION task_entries(p_task_id uuid)
RETURNS TABLE (teacher_id uuid, name text, class_label text, data jsonb, submitted_at timestamptz, updated_at timestamptz, is_creator boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  WITH t AS (
    SELECT s.id, s.school_id, s.created_by,
           (s.created_by = cw_my_teacher_id() OR kedu_is_admin() OR kedu_is_school_admin()) AS see_all
      FROM school_tasks s
     WHERE s.id = p_task_id AND s.school_id = kedu_my_school_id() AND s.kind IN ('collect','file','paste') AND kedu_task_visible(s.id)
  ), who AS (
    SELECT g.teacher_id FROM school_task_targets g, t WHERE g.task_id = t.id
    UNION
    SELECT tt.id FROM teachers tt, t
     WHERE NOT EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = t.id)
       AND tt.school_id = t.school_id AND tt.approval IN ('auto','approved') AND tt.id IS DISTINCT FROM t.created_by
    UNION
    SELECT e.teacher_id FROM school_task_entries e, t WHERE e.task_id = t.id
  ), x AS (
    SELECT w.teacher_id, COALESCE(tt.name,'') AS name,
           COALESCE((SELECT c.label FROM class_codes c WHERE c.teacher_id = tt.id AND c.is_active ORDER BY c.created_at DESC LIMIT 1), '') AS class_label,
           e.data, e.submitted_at, e.updated_at, (w.teacher_id = t.created_by) AS is_creator, tt.class_sort
      FROM who w
      CROSS JOIN t
      JOIN teachers tt ON tt.id = w.teacher_id
      LEFT JOIN school_task_entries e ON e.task_id = t.id AND e.teacher_id = w.teacher_id
     WHERE t.see_all OR w.teacher_id = cw_my_teacher_id()
  )
  SELECT teacher_id, name, class_label, data, submitted_at, updated_at, is_creator
    FROM x
   ORDER BY class_sort NULLS LAST, kedu_label_num(class_label), class_label, name
$fn$;
GRANT EXECUTE ON FUNCTION task_entries(uuid) TO authenticated;
-- 검산: SELECT count(*) FROM pg_proc WHERE proname IN ('submit_task_paste','task_entries','add_school_task'); → 3
