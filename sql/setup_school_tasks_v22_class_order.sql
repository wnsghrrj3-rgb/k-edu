-- =============================================================================
-- setup_school_tasks_v22_class_order.sql — 우리 학교 할 일판 v2.2 「반 순서」
-- 준호 요구(2026-11-02): 반 이름이 1반·2반이 아니라 한글 이름이라 순서를 알아서 정해야 한다.
--   ① 학교 관리자가 「우리 학교 현황」에서 반 순서를 한 번 정한다(↑↓ 저장) → teachers.class_sort
--   ② 정하기 전엔 자동 — 반 이름 앞의 숫자(학년) → 반 이름 가나다 순. 새로 온 선생님은 맨 뒤.
--   ③ 파일 취합 zip 순서 · 모은 표 · 현황 명단 · 받는 사람 고르기가 모두 이 순서를 쓴다.
-- 전제: setup_school_tasks_v21_file.sql. 재실행 안전.
-- =============================================================================
DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='class_sort') THEN
    ALTER TABLE teachers ADD COLUMN class_sort int;
  END IF;
END $do$;

-- 반 순서 저장 — 학교 관리자 또는 준호. 배열 순서 = 반 순서. 같은 학교 승인 교사만 받는다.
CREATE OR REPLACE FUNCTION set_class_order(p_ids uuid[])
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_sid text; v_n int := 0; i int;
BEGIN
  v_sid := kedu_my_school_id();
  IF v_sid IS NULL OR NOT (kedu_is_admin() OR kedu_is_school_admin()) THEN
    RAISE EXCEPTION 'school admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  PERFORM set_config('kedu.school_role_set', '1', true);   -- 보호 트리거가 school_role 을 건드리지 않게(값은 그대로)
  FOR i IN 1..coalesce(array_length(p_ids,1),0) LOOP
    UPDATE teachers SET class_sort = i WHERE id = p_ids[i] AND school_id = v_sid AND approval IN ('auto','approved');
    IF FOUND THEN v_n := v_n + 1; END IF;
  END LOOP;
  RETURN v_n;
END $fn$;
GRANT EXECUTE ON FUNCTION set_class_order(uuid[]) TO authenticated;

-- 반 이름 자동 정렬 키 — 앞 숫자(학년·반 번호) 먼저, 그다음 이름
CREATE OR REPLACE FUNCTION kedu_label_num(p text)
RETURNS int LANGUAGE sql IMMUTABLE AS $fn$
  SELECT COALESCE(NULLIF(substring(coalesce(p,'') from '^\s*(\d+)'), '')::int, 999)
$fn$;

-- 모은 표 — 반 순서 적용
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

-- 현황 — class_sort 열 추가(반환형 변경 → 내렸다 다시) · 반 순서로
DROP FUNCTION IF EXISTS school_teacher_overview();
CREATE OR REPLACE FUNCTION school_teacher_overview()
RETURNS TABLE (teacher_id uuid, name text, class_label text, pending int, done int, is_admin boolean, class_sort int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  WITH sid AS (SELECT kedu_my_school_id() AS v WHERE kedu_is_school_admin() OR kedu_is_admin()),
  tasks AS (
    SELECT s.id, s.created_by FROM school_tasks s, sid WHERE s.school_id = sid.v AND s.closed_at IS NULL
  ),
  recv AS (
    SELECT t.id AS task_id, tt.id AS teacher_id
      FROM tasks t, teachers tt, sid
     WHERE tt.school_id = sid.v AND tt.approval IN ('auto','approved') AND tt.id IS DISTINCT FROM t.created_by
       AND ( NOT EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = t.id)
             OR EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = t.id AND g.teacher_id = tt.id) )
  ), x AS (
  SELECT tt.id AS teacher_id, COALESCE(tt.name,'') AS name,
         COALESCE((SELECT c.label FROM class_codes c WHERE c.teacher_id = tt.id AND c.is_active ORDER BY c.created_at DESC LIMIT 1), '') AS class_label,
         (SELECT count(*)::int FROM recv r LEFT JOIN school_task_reads x ON x.task_id = r.task_id AND x.teacher_id = r.teacher_id
           WHERE r.teacher_id = tt.id AND x.teacher_id IS NULL) AS pending,
         (SELECT count(*)::int FROM recv r JOIN school_task_reads x ON x.task_id = r.task_id AND x.teacher_id = r.teacher_id
           WHERE r.teacher_id = tt.id) AS done,
         (tt.school_role = 'admin') AS is_admin, tt.class_sort
    FROM teachers tt, sid
   WHERE tt.school_id = sid.v AND tt.approval IN ('auto','approved')
  )
  SELECT * FROM x ORDER BY class_sort NULLS LAST, kedu_label_num(class_label), class_label, name
$fn$;
GRANT EXECUTE ON FUNCTION school_teacher_overview() TO authenticated;

-- 받는 사람 고르기도 반 순서로
CREATE OR REPLACE FUNCTION list_school_teachers()
RETURNS TABLE (id uuid, name text, class_label text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT x.id, x.name, x.class_label FROM (
    SELECT t.id, COALESCE(t.name,'') AS name,
           COALESCE((SELECT c.label FROM class_codes c WHERE c.teacher_id = t.id AND c.is_active ORDER BY c.created_at DESC LIMIT 1), '') AS class_label,
           t.class_sort
      FROM teachers t
     WHERE kedu_my_school_id() IS NOT NULL AND t.school_id = kedu_my_school_id()
       AND t.approval IN ('auto','approved') AND t.id <> cw_my_teacher_id()
  ) x
  ORDER BY x.class_sort NULLS LAST, kedu_label_num(x.class_label), x.class_label, x.name
$fn$;
GRANT EXECUTE ON FUNCTION list_school_teachers() TO authenticated;

-- 검산: SELECT proname FROM pg_proc WHERE proname IN ('set_class_order','kedu_label_num','task_entries','school_teacher_overview','list_school_teachers'); → 5행
