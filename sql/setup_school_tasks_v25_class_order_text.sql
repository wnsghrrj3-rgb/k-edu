-- =============================================================================
-- setup_school_tasks_v25_class_order_text.sql — 할 일판 v2.5 「반 순서 미리 적기」
-- 준호 요구(2026-11-02): 반 순서를 한 번 적어 두면 모으기가 그 순서 그대로 나오게. 간결하게 — 한 줄에 한 반.
--   학교마다 school_class_order 한 줄(반 이름 배열). 모은 글·현황·받는 사람 고르기 정렬 = 이 배열 순서 → 없으면 숫자→가나다.
-- 전제: v2.2. 재실행 안전.
-- =============================================================================
CREATE TABLE IF NOT EXISTS school_class_order (
  school_id  text PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
  labels     text[] NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES teachers(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE school_class_order ENABLE ROW LEVEL SECURITY;   -- RPC 전용

CREATE OR REPLACE FUNCTION get_school_class_order()
RETURNS text[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT COALESCE((SELECT o.labels FROM school_class_order o WHERE o.school_id = kedu_my_school_id()), '{}'::text[])
$fn$;
GRANT EXECUTE ON FUNCTION get_school_class_order() TO authenticated;

-- 저장 — 학교 관리자 또는 준호. 빈 줄·공백은 버린다. 60개까지.
CREATE OR REPLACE FUNCTION set_school_class_order(p_labels text[])
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_sid text; v_labels text[];
BEGIN
  v_sid := kedu_my_school_id();
  IF v_sid IS NULL OR NOT (kedu_is_admin() OR kedu_is_school_admin()) THEN
    RAISE EXCEPTION 'school admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT array_agg(x ORDER BY ord) INTO v_labels
    FROM (SELECT DISTINCT ON (btrim(l)) btrim(l) AS x, ord FROM unnest(coalesce(p_labels,'{}')) WITH ORDINALITY u(l, ord)
           WHERE length(btrim(l)) BETWEEN 1 AND 40 ORDER BY btrim(l), ord) s;
  v_labels := COALESCE(v_labels, '{}');
  IF array_length(v_labels,1) > 60 THEN RAISE EXCEPTION 'too many' USING ERRCODE = 'check_violation'; END IF;
  INSERT INTO school_class_order (school_id, labels, updated_by) VALUES (v_sid, v_labels, cw_my_teacher_id())
  ON CONFLICT (school_id) DO UPDATE SET labels = EXCLUDED.labels, updated_by = EXCLUDED.updated_by, updated_at = now();
  RETURN coalesce(array_length(v_labels,1),0);
END $fn$;
GRANT EXECUTE ON FUNCTION set_school_class_order(text[]) TO authenticated;

-- 반 이름 → 순서 번호 (적어 둔 순서 · 부분 일치도 허용 「1학년 사랑반」 ⊃ 「사랑반」 · 없으면 큰 수)
CREATE OR REPLACE FUNCTION kedu_class_rank(p_school text, p_label text)
RETURNS int LANGUAGE sql STABLE AS $fn$
  SELECT COALESCE(
    (SELECT MIN(u.ord)::int FROM school_class_order o, unnest(o.labels) WITH ORDINALITY u(l, ord)
      WHERE o.school_id = p_school AND (btrim(p_label) = u.l OR position(u.l in coalesce(p_label,'')) > 0)),
    9999)
$fn$;

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
           e.data, e.submitted_at, e.updated_at, (w.teacher_id = t.created_by) AS is_creator, tt.class_sort, t.school_id
      FROM who w
      CROSS JOIN t
      JOIN teachers tt ON tt.id = w.teacher_id
      LEFT JOIN school_task_entries e ON e.task_id = t.id AND e.teacher_id = w.teacher_id
     WHERE t.see_all OR w.teacher_id = cw_my_teacher_id()
  )
  SELECT teacher_id, name, class_label, data, submitted_at, updated_at, is_creator
    FROM x
   ORDER BY kedu_class_rank(school_id, class_label), class_sort NULLS LAST, kedu_label_num(class_label), class_label, name
$fn$;
GRANT EXECUTE ON FUNCTION task_entries(uuid) TO authenticated;

DROP FUNCTION IF EXISTS school_teacher_overview();
CREATE OR REPLACE FUNCTION school_teacher_overview()
RETURNS TABLE (teacher_id uuid, name text, class_label text, pending int, done int, is_admin boolean, class_sort int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  WITH sid AS (SELECT kedu_my_school_id() AS v WHERE kedu_is_school_admin() OR kedu_is_admin()),
  tasks AS (SELECT s.id, s.created_by FROM school_tasks s, sid WHERE s.school_id = sid.v AND s.closed_at IS NULL),
  recv AS (
    SELECT t.id AS task_id, tt.id AS teacher_id FROM tasks t, teachers tt, sid
     WHERE tt.school_id = sid.v AND tt.approval IN ('auto','approved') AND tt.id IS DISTINCT FROM t.created_by
       AND ( NOT EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = t.id)
             OR EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = t.id AND g.teacher_id = tt.id) )
  ), x AS (
  SELECT tt.id AS teacher_id, COALESCE(tt.name,'') AS name,
         COALESCE((SELECT c.label FROM class_codes c WHERE c.teacher_id = tt.id AND c.is_active ORDER BY c.created_at DESC LIMIT 1), '') AS class_label,
         (SELECT count(*)::int FROM recv r LEFT JOIN school_task_reads x ON x.task_id = r.task_id AND x.teacher_id = r.teacher_id WHERE r.teacher_id = tt.id AND x.teacher_id IS NULL) AS pending,
         (SELECT count(*)::int FROM recv r JOIN school_task_reads x ON x.task_id = r.task_id AND x.teacher_id = r.teacher_id WHERE r.teacher_id = tt.id) AS done,
         (tt.school_role = 'admin') AS is_admin, tt.class_sort, sid.v AS school_id
    FROM teachers tt, sid
   WHERE tt.school_id = sid.v AND tt.approval IN ('auto','approved')
  )
  SELECT teacher_id, name, class_label, pending, done, is_admin, class_sort FROM x
   ORDER BY kedu_class_rank(school_id, class_label), class_sort NULLS LAST, kedu_label_num(class_label), class_label, name
$fn$;
GRANT EXECUTE ON FUNCTION school_teacher_overview() TO authenticated;

CREATE OR REPLACE FUNCTION list_school_teachers()
RETURNS TABLE (id uuid, name text, class_label text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT x.id, x.name, x.class_label FROM (
    SELECT t.id, COALESCE(t.name,'') AS name,
           COALESCE((SELECT c.label FROM class_codes c WHERE c.teacher_id = t.id AND c.is_active ORDER BY c.created_at DESC LIMIT 1), '') AS class_label,
           t.class_sort, t.school_id
      FROM teachers t
     WHERE kedu_my_school_id() IS NOT NULL AND t.school_id = kedu_my_school_id()
       AND t.approval IN ('auto','approved') AND t.id <> cw_my_teacher_id()
  ) x
  ORDER BY kedu_class_rank(x.school_id, x.class_label), x.class_sort NULLS LAST, kedu_label_num(x.class_label), x.class_label, x.name
$fn$;
GRANT EXECUTE ON FUNCTION list_school_teachers() TO authenticated;
-- 검산: SELECT count(*) FROM pg_proc WHERE proname IN ('get_school_class_order','set_school_class_order','kedu_class_rank','task_entries','school_teacher_overview','list_school_teachers'); → 6
