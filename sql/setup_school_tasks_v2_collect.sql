-- =============================================================================
-- setup_school_tasks_v2_collect.sql — 우리 학교 할 일판 v2 「취합 양식」
-- 준호 결정(2026-11-02): 한글 파일을 합치지 않는다 — 담당자가 표 양식을 만들고, 받는 선생님은 자기 칸만 채운다.
--   ① 취합 양식을 올리면 그 자체가 할 일이다(받는 사람 = 채워야 하는 사람)
--   ② 「제출」을 누르는 순간 내 할 일에서 자동 완료(school_task_reads 에 한 줄) — 따로 확인 단추 없음
--   ③ 제출 뒤에도 기한 안에는 고칠 수 있다 — 완료 상태 그대로, 담당자에겐 「수정됨」만
--   ④ 필수 칸이 비면 제출이 안 된다(빈 줄이 완료로 잡히지 않게)
--   ⑤ 담당자 자신도 칸을 채울 수 있다(표에 들어간다) — n/N 분모에는 종전대로 들어가지 않는다
-- 학교 벽 = 종전 school_tasks RLS·kedu_task_visible 그대로(학교마다 따로 돈다 — 새 표도 school_id 로 잠근다).
-- 전제: setup_school_tasks.sql v1.4 · setup_school_tasks_v15.sql. 재실행 안전.
-- =============================================================================

-- ── 할 일 종류 + 양식 ────────────────────────────────────────
DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_tasks' AND column_name='kind') THEN
    ALTER TABLE school_tasks ADD COLUMN kind text NOT NULL DEFAULT 'notice';          -- 'notice' 알림 | 'collect' 취합 양식
    ALTER TABLE school_tasks ADD CONSTRAINT school_tasks_kind_check CHECK (kind IN ('notice','collect'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_tasks' AND column_name='collect_schema') THEN
    ALTER TABLE school_tasks ADD COLUMN collect_schema jsonb;   -- [{key,label,type('text'|'long'|'number'),required}] 1~8칸
  END IF;
END $do$;

-- 양식 검사 — 칸 1~8 · 이름 1~40자 · 종류 셋 중 하나. key 는 서버가 k1..k8 로 다시 매긴다.
CREATE OR REPLACE FUNCTION kedu_norm_collect_schema(p jsonb)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE AS $fn$
DECLARE v jsonb := '[]'::jsonb; e jsonb; i int := 0; lab text; ty text;
BEGIN
  IF p IS NULL OR jsonb_typeof(p) <> 'array' OR jsonb_array_length(p) < 1 OR jsonb_array_length(p) > 8 THEN
    RAISE EXCEPTION 'schema must have 1-8 columns' USING ERRCODE = 'check_violation';
  END IF;
  FOR e IN SELECT * FROM jsonb_array_elements(p) LOOP
    i := i + 1;
    lab := left(btrim(coalesce(e->>'label','')), 40);
    IF length(lab) < 1 THEN RAISE EXCEPTION 'column label required' USING ERRCODE = 'check_violation'; END IF;
    ty := coalesce(e->>'type','text');
    IF ty NOT IN ('text','long','number') THEN ty := 'text'; END IF;
    v := v || jsonb_build_object('key', 'k'||i, 'label', lab, 'type', ty, 'required', coalesce((e->>'required')::boolean, true));
  END LOOP;
  RETURN v;
END $fn$;

-- ── 제출 표 — RPC 전용(정책 없음 = 클라이언트 직접 접근 0) ─────
CREATE TABLE IF NOT EXISTS school_task_entries (
  task_id      uuid NOT NULL REFERENCES school_tasks(id) ON DELETE CASCADE,
  teacher_id   uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  school_id    text NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  data         jsonb NOT NULL DEFAULT '{}'::jsonb,     -- {k1: '...', k2: '...'}
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, teacher_id)
);
CREATE INDEX IF NOT EXISTS idx_school_task_entries_teacher ON school_task_entries (teacher_id);
ALTER TABLE school_task_entries ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE school_task_entries IS '취합 양식 제출(v2). 한 사람 한 줄. 제출 = 그 할 일 완료(school_task_reads 동시 기록). RPC 전용.';

-- ── 올리기 — v2: 종류·양식 ──────────────────────────────────
DROP FUNCTION IF EXISTS add_school_task(text, text, date, uuid[]);
CREATE OR REPLACE FUNCTION add_school_task(p_title text, p_detail text DEFAULT '', p_due date DEFAULT NULL, p_to uuid[] DEFAULT NULL,
                                           p_kind text DEFAULT 'notice', p_schema jsonb DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_sid text; v_id uuid; v_kind text; v_schema jsonb;
BEGIN
  v_tid := cw_my_teacher_id();
  v_sid := kedu_my_school_id();
  IF v_tid IS NULL THEN
    RAISE EXCEPTION 'teacher required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF NOT kedu_teacher_approved() THEN
    RAISE EXCEPTION 'approval required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_sid IS NULL THEN
    RAISE EXCEPTION 'school required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  v_kind := CASE WHEN p_kind = 'collect' THEN 'collect' ELSE 'notice' END;
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

-- ── 목록 — v2: kind·collect_schema·entry_count·my_entry 열 추가(반환형 변경 → 먼저 내린다) ──
DROP FUNCTION IF EXISTS list_school_tasks();
CREATE OR REPLACE FUNCTION list_school_tasks()
RETURNS TABLE (
  id uuid, title text, detail text, due_date date,
  days_left int, urgency text, bucket text,
  mine boolean, done boolean, done_count int, teacher_count int,
  created_by_name text, created_at timestamptz,
  targeted boolean, to_names text,
  recipient boolean,
  kind text, collect_schema jsonb, entry_count int, my_entry jsonb, my_entry_updated boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  WITH me AS (
    SELECT cw_my_teacher_id() AS tid, kedu_my_school_id() AS sid, kedu_is_school_admin() AS sadmin
  ), tcount AS (
    SELECT count(*)::int AS n FROM teachers t, me
     WHERE me.sid IS NOT NULL AND t.school_id = me.sid AND t.approval IN ('auto','approved')
  )
  SELECT s.id, s.title, s.detail, s.due_date,
         CASE WHEN s.due_date IS NULL THEN NULL
              ELSE (s.due_date - (now() AT TIME ZONE 'Asia/Seoul')::date) END AS days_left,
         CASE WHEN s.due_date IS NULL THEN 'none'
              WHEN s.due_date < (now() AT TIME ZONE 'Asia/Seoul')::date THEN 'past'
              WHEN s.due_date - (now() AT TIME ZONE 'Asia/Seoul')::date <= 1 THEN 'red'
              WHEN s.due_date - (now() AT TIME ZONE 'Asia/Seoul')::date <= 3 THEN 'orange'
              ELSE 'normal' END AS urgency,
         CASE WHEN r.teacher_id IS NOT NULL THEN 'done'
              WHEN s.due_date IS NOT NULL AND s.due_date < (now() AT TIME ZONE 'Asia/Seoul')::date THEN 'past'
              ELSE 'todo' END AS bucket,
         (s.created_by IS NOT NULL AND s.created_by = me.tid) AS mine,
         (r.teacher_id IS NOT NULL) AS done,
         (SELECT count(*)::int FROM school_task_reads x WHERE x.task_id = s.id AND x.teacher_id IS DISTINCT FROM s.created_by) AS done_count,
         CASE WHEN EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = s.id)
              THEN (SELECT count(*)::int FROM school_task_targets g WHERE g.task_id = s.id)
              ELSE (SELECT n FROM tcount) - CASE WHEN s.created_by IS NOT NULL AND EXISTS (SELECT 1 FROM teachers t2 WHERE t2.id = s.created_by AND t2.school_id = me.sid AND t2.approval IN ('auto','approved')) THEN 1 ELSE 0 END
              END AS teacher_count,
         COALESCE(ct.name, '') AS created_by_name,
         s.created_at,
         EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = s.id) AS targeted,
         COALESCE((SELECT string_agg(tt.name, ', ' ORDER BY tt.name)
                     FROM school_task_targets g JOIN teachers tt ON tt.id = g.teacher_id
                    WHERE g.task_id = s.id), '') AS to_names,
         ( NOT EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = s.id)
           OR EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = s.id AND g.teacher_id = me.tid) ) AS recipient,
         s.kind, s.collect_schema,
         (SELECT count(*)::int FROM school_task_entries e WHERE e.task_id = s.id) AS entry_count,
         (SELECT e.data FROM school_task_entries e WHERE e.task_id = s.id AND e.teacher_id = me.tid) AS my_entry,
         COALESCE((SELECT e.updated_at > e.submitted_at FROM school_task_entries e WHERE e.task_id = s.id AND e.teacher_id = me.tid), false) AS my_entry_updated
    FROM school_tasks s
    CROSS JOIN me
    LEFT JOIN school_task_reads r ON r.task_id = s.id AND r.teacher_id = me.tid
    LEFT JOIN teachers ct ON ct.id = s.created_by
   WHERE me.sid IS NOT NULL AND s.school_id = me.sid AND s.closed_at IS NULL
     AND ( NOT EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = s.id)
           OR s.created_by = me.tid
           OR EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = s.id AND g.teacher_id = me.tid)
           OR me.sadmin )
   ORDER BY (r.teacher_id IS NOT NULL), (s.due_date IS NULL), s.due_date NULLS LAST, s.created_at DESC
   LIMIT 200
$fn$;
GRANT EXECUTE ON FUNCTION list_school_tasks() TO authenticated;

-- ── 제출(= 자동 완료) ──────────────────────────────────────────
-- 받는 사람 또는 올린 사람. 필수 칸이 비면 거부. 두 번째부터는 고치기(updated_at 만 갱신 · 완료 그대로).
CREATE OR REPLACE FUNCTION submit_task_entry(p_task_id uuid, p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_sid text; v_task school_tasks%ROWTYPE; e jsonb; v_out jsonb := '{}'::jsonb; v_val text; v_key text; v_is_creator boolean;
BEGIN
  v_tid := cw_my_teacher_id(); v_sid := kedu_my_school_id();
  IF v_tid IS NULL OR NOT kedu_teacher_approved() THEN RAISE EXCEPTION 'approval required' USING ERRCODE = 'insufficient_privilege'; END IF;
  SELECT * INTO v_task FROM school_tasks WHERE id = p_task_id AND school_id = v_sid;
  IF v_task.id IS NULL OR NOT kedu_task_visible(p_task_id) THEN RAISE EXCEPTION 'not your school task' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF v_task.kind <> 'collect' THEN RAISE EXCEPTION 'not a collect task' USING ERRCODE = 'check_violation'; END IF;
  IF v_task.closed_at IS NOT NULL THEN RAISE EXCEPTION 'task closed' USING ERRCODE = 'check_violation'; END IF;
  v_is_creator := (v_task.created_by = v_tid);
  IF NOT v_is_creator AND EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = p_task_id)
     AND NOT EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = p_task_id AND g.teacher_id = v_tid) THEN
    RAISE EXCEPTION 'not a recipient' USING ERRCODE = 'insufficient_privilege';
  END IF;
  -- 양식 칸만 받는다 · 글자 수 제한 · 필수 검사
  FOR e IN SELECT * FROM jsonb_array_elements(v_task.collect_schema) LOOP
    v_key := e->>'key';
    v_val := left(btrim(coalesce(p_data->>v_key, '')), CASE WHEN e->>'type' = 'long' THEN 2000 ELSE 200 END);
    IF coalesce((e->>'required')::boolean, true) AND length(v_val) = 0 THEN
      RAISE EXCEPTION 'required: %', e->>'label' USING ERRCODE = 'check_violation';
    END IF;
    IF e->>'type' = 'number' AND length(v_val) > 0 AND v_val !~ '^-?[0-9]+([.,][0-9]+)?$' THEN
      RAISE EXCEPTION 'number: %', e->>'label' USING ERRCODE = 'check_violation';
    END IF;
    v_out := v_out || jsonb_build_object(v_key, v_val);
  END LOOP;
  INSERT INTO school_task_entries (task_id, teacher_id, school_id, data)
  VALUES (p_task_id, v_tid, v_sid, v_out)
  ON CONFLICT (task_id, teacher_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now();
  -- ★ 제출 = 완료. 올린 사람 자신은 종전대로 n/N 에 들어가지 않는다(reads 에 넣어도 분자에서 빠진다)
  INSERT INTO school_task_reads (task_id, teacher_id) VALUES (p_task_id, v_tid) ON CONFLICT DO NOTHING;
  UPDATE school_tasks SET updated_at = now() WHERE id = p_task_id;
  RETURN v_out;
END $fn$;
GRANT EXECUTE ON FUNCTION submit_task_entry(uuid, jsonb) TO authenticated;

-- ── 모은 표 — 올린 사람·학교 관리자·준호 = 전부, 그 밖 = 내 줄만 ──
-- 받는 사람 전원이 한 줄씩(안 낸 사람은 data NULL) — 「누가 안 냈나」가 표에서 바로 보인다.
CREATE OR REPLACE FUNCTION task_entries(p_task_id uuid)
RETURNS TABLE (teacher_id uuid, name text, class_label text, data jsonb, submitted_at timestamptz, updated_at timestamptz, is_creator boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  WITH t AS (
    SELECT s.id, s.school_id, s.created_by,
           (s.created_by = cw_my_teacher_id() OR kedu_is_admin() OR kedu_is_school_admin()) AS see_all
      FROM school_tasks s
     WHERE s.id = p_task_id AND s.school_id = kedu_my_school_id() AND s.kind = 'collect' AND kedu_task_visible(s.id)
  ), who AS (
    SELECT g.teacher_id FROM school_task_targets g, t WHERE g.task_id = t.id
    UNION
    SELECT tt.id FROM teachers tt, t
     WHERE NOT EXISTS (SELECT 1 FROM school_task_targets g WHERE g.task_id = t.id)
       AND tt.school_id = t.school_id AND tt.approval IN ('auto','approved') AND tt.id IS DISTINCT FROM t.created_by
    UNION
    SELECT e.teacher_id FROM school_task_entries e, t WHERE e.task_id = t.id        -- 올린 사람이 채운 줄도 표에
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

-- 검산:
--   SELECT column_name FROM information_schema.columns WHERE table_name='school_tasks' AND column_name IN ('kind','collect_schema'); → 2행
--   SELECT count(*) FROM pg_policies WHERE tablename='school_task_entries'; → 0 (RPC 전용)
--   SELECT proname FROM pg_proc WHERE proname IN ('submit_task_entry','task_entries','kedu_norm_collect_schema','add_school_task','list_school_tasks'); → 5행
--   SELECT kind, collect_schema FROM school_tasks LIMIT 3;   → 기존 행은 notice · NULL
