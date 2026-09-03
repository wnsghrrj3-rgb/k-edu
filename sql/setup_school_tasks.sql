-- =============================================================
-- K-edu 「우리 학교 할 일판」 — 생태계설계_v2_공개준비 §J-10
-- 작성: 2026-09-03
-- 왜: 금성초는 나이스 메신저·밴드를 실질적으로 안 써서 학교 안 소식이 잘 놓친다.
--     전체 공유해 두면 **확인 전까지 대시보드 상단에 남고, 기한이 다가올수록 색이 짙어지는** 판.
--     댓글·채팅·파일 없음(준호 결정). 학교 단위 기준선 = teachers.school_id(setup_schools.sql #36).
--
-- 준호 결정 3건 (2026-09-03) — 코드에 박음:
--   ① 올릴 수 있는 사람 = **승인된 같은 학교 교사 누구나** (관리자 전용 아님 — 준호가 병목이 되지 않게)
--   ② 아침 메일 v1 **미포함** — 대시보드만 먼저(커스텀 SMTP 연결 전이라 메일에 기대면 기능이 SMTP에 묶인다)
--   ③ 기한이 지난 일 = **「지난 일」 칸으로 내려가되 남는다** (자동 숨김 아님 — 확인 전까지 사라지지 않는다)
--
-- 의존: setup_tables.sql(teachers) · setup_schools.sql(schools, teachers.school_id)
--       setup_teacher_approval.sql(kedu_teacher_approved, kedu_is_admin) · cw_my_teacher_id()
-- 멱등 — 재실행 안전. 달러 인용 $fn$/$do$.
-- =============================================================

-- ── 내 학교 (RLS·RPC 의 단일 창구) ───────────────────────────
-- ⚠️ 학교를 아직 고르지 않은 교사는 NULL — 그 교사에게는 할 일판이 통째로 비어 보인다(설계대로).
CREATE OR REPLACE FUNCTION kedu_my_school_id()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT t.school_id FROM teachers t WHERE t.user_id = auth.uid() LIMIT 1
$fn$;
GRANT EXECUTE ON FUNCTION kedu_my_school_id() TO authenticated;

CREATE TABLE IF NOT EXISTS school_tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   text NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title       text NOT NULL,
  detail      text NOT NULL DEFAULT '',
  due_date    date,                                  -- NULL = 기한 없는 알림(상시 남되 임박 색 없음)
  created_by  uuid REFERENCES teachers(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  closed_at   timestamptz,                           -- 올린 사람이 내림(모두에게서 사라짐)
  closed_by   uuid REFERENCES teachers(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_school_tasks_school ON school_tasks (school_id, closed_at, due_date);

COMMENT ON TABLE school_tasks IS
  '우리 학교 할 일판(§J-10). 학교 단위 공유 — 같은 school_id 승인 교사만 읽고 쓴다. 댓글·파일 없음.';

DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'school_tasks_title_check') THEN
    ALTER TABLE school_tasks ADD CONSTRAINT school_tasks_title_check
      CHECK (length(btrim(title)) BETWEEN 2 AND 120 AND length(detail) <= 1000);
  END IF;
END $do$;

-- ── 확인 표시 (준호 요구: 확인/완료 전까지 상단에 남는다) ──────
-- 한 사람이 한 줄. 확인 = 완료(두 동작으로 나누지 않는다 — 학교 소식은 「봤다」가 곧 처리다).
CREATE TABLE IF NOT EXISTS school_task_reads (
  task_id    uuid NOT NULL REFERENCES school_tasks(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  done_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, teacher_id)
);
CREATE INDEX IF NOT EXISTS idx_school_task_reads_teacher ON school_task_reads (teacher_id);

-- ── RLS ─────────────────────────────────────────────────────
-- ★ 이 두 정책이 「우리 학교」의 벽이다 — 다른 학교 교사는 서버에서 막힌다.
ALTER TABLE school_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_school_tasks_same_school ON school_tasks;
CREATE POLICY p_school_tasks_same_school ON school_tasks
  FOR SELECT TO authenticated
  USING (school_id IS NOT NULL AND school_id = kedu_my_school_id());
DROP POLICY IF EXISTS p_school_tasks_write ON school_tasks;
CREATE POLICY p_school_tasks_write ON school_tasks
  FOR ALL TO authenticated
  USING (school_id IS NOT NULL AND school_id = kedu_my_school_id() AND kedu_teacher_approved())
  WITH CHECK (school_id IS NOT NULL AND school_id = kedu_my_school_id() AND kedu_teacher_approved());

ALTER TABLE school_task_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_school_task_reads_mine ON school_task_reads;
CREATE POLICY p_school_task_reads_mine ON school_task_reads
  FOR ALL TO authenticated
  USING (teacher_id = cw_my_teacher_id())
  WITH CHECK (teacher_id = cw_my_teacher_id());

-- ── 목록 ────────────────────────────────────────────────────
-- ⚠️ 급함(urgency)은 서버가 계산한다 — 브라우저 시간대에 따라 「지난 일」 판정이 흔들리지 않게
--    한국 날짜 기준(now() AT TIME ZONE 'Asia/Seoul').
--    bucket: 'todo'(내가 아직 확인 안 함) · 'past'(기한 지남, 확인 전) · 'done'(내가 확인함)
--    ★ 기한이 지나도 확인 전까지 사라지지 않는다(준호 결정 ③) — 자리만 「지난 일」로 내려간다.
CREATE OR REPLACE FUNCTION list_school_tasks()
RETURNS TABLE (
  id uuid, title text, detail text, due_date date,
  days_left int, urgency text, bucket text,
  mine boolean, done boolean, done_count int, teacher_count int,
  created_by_name text, created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  WITH me AS (
    SELECT cw_my_teacher_id() AS tid, kedu_my_school_id() AS sid
  ), tcount AS (
    SELECT count(*)::int AS n FROM teachers t, me
     WHERE me.sid IS NOT NULL AND t.school_id = me.sid AND t.approval = 'approved'
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
         (SELECT count(*)::int FROM school_task_reads x WHERE x.task_id = s.id) AS done_count,
         (SELECT n FROM tcount) AS teacher_count,
         COALESCE(ct.name, '') AS created_by_name,
         s.created_at
    FROM school_tasks s
    CROSS JOIN me
    LEFT JOIN school_task_reads r ON r.task_id = s.id AND r.teacher_id = me.tid
    LEFT JOIN teachers ct ON ct.id = s.created_by
   WHERE me.sid IS NOT NULL AND s.school_id = me.sid AND s.closed_at IS NULL
   ORDER BY (r.teacher_id IS NOT NULL),                       -- 확인 안 한 것 먼저
            (s.due_date IS NULL),                             -- 기한 있는 것 먼저
            s.due_date NULLS LAST, s.created_at DESC
   LIMIT 200
$fn$;
GRANT EXECUTE ON FUNCTION list_school_tasks() TO authenticated;

-- ── 올리기 (승인된 같은 학교 교사 누구나 — 준호 결정 ①) ───────
CREATE OR REPLACE FUNCTION add_school_task(p_title text, p_detail text DEFAULT '', p_due date DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_sid text; v_id uuid;
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
  INSERT INTO school_tasks (school_id, title, detail, due_date, created_by)
  VALUES (v_sid, btrim(p_title), left(coalesce(p_detail,''), 1000), p_due, v_tid)
  RETURNING id INTO v_id;
  RETURN v_id;
END $fn$;
GRANT EXECUTE ON FUNCTION add_school_task(text, text, date) TO authenticated;

-- ── 확인 표시 켜기·끄기 (멱등) ───────────────────────────────
-- ⚠️ 다른 학교 할 일에는 표시를 남길 수 없다 — 학교 대조를 함수 안에서 한 번 더 한다(RLS 와 이중).
CREATE OR REPLACE FUNCTION mark_school_task(p_task_id uuid, p_done boolean DEFAULT true)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_sid text;
BEGIN
  v_tid := cw_my_teacher_id();
  v_sid := kedu_my_school_id();
  IF v_tid IS NULL OR v_sid IS NULL THEN
    RAISE EXCEPTION 'teacher required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM school_tasks WHERE id = p_task_id AND school_id = v_sid AND closed_at IS NULL) THEN
    RAISE EXCEPTION 'not your school task' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_done THEN
    INSERT INTO school_task_reads (task_id, teacher_id) VALUES (p_task_id, v_tid)
    ON CONFLICT (task_id, teacher_id) DO NOTHING;
  ELSE
    DELETE FROM school_task_reads WHERE task_id = p_task_id AND teacher_id = v_tid;
  END IF;
  RETURN p_done;
END $fn$;
GRANT EXECUTE ON FUNCTION mark_school_task(uuid, boolean) TO authenticated;

-- ── 내리기 (올린 사람 또는 준호) ─────────────────────────────
-- ⚠️ 지우지 않고 closed_at 을 찍는다 — 누가 언제 올렸는지가 남는다(이력).
CREATE OR REPLACE FUNCTION close_school_task(p_task_id uuid)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_sid text; v_n int;
BEGIN
  v_tid := cw_my_teacher_id();
  v_sid := kedu_my_school_id();
  IF v_tid IS NULL THEN
    RAISE EXCEPTION 'teacher required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  UPDATE school_tasks
     SET closed_at = now(), closed_by = v_tid, updated_at = now()
   WHERE id = p_task_id AND closed_at IS NULL
     AND (kedu_is_admin() OR (school_id = v_sid AND created_by = v_tid));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n = 0 THEN
    RAISE EXCEPTION 'not yours' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN v_n;
END $fn$;
GRANT EXECUTE ON FUNCTION close_school_task(uuid) TO authenticated;

-- ── 내 학교 보기·고치기 ─────────────────────────────────────
-- ⚠️ 왜 여기 있나: 할 일판이 통째로 school_id 에 걸려 있는데, **교사가 자기 학교를 고칠 자리가
--    없었다.** 가입 화면에서 목록에 없어 이름만 적은 사람은 school_request 로만 남고 school_id 는
--    NULL 이라 할 일판이 영영 안 보인다. 지금까지는 준호가 /admin 에서 한 명씩 지정해야 했다 —
--    연수 모드로 승인 병목을 없앤 것과 **같은 병목이 학교 지정에서 재발**한다.
--    그래서 본인이 직접 고르게 한다.
-- ⚠️ 권한 아님 — school_id 는 등급·승인과 무관한 소속 표시다(#23 보호 트리거가 지키는
--    approval·is_admin·user_id 는 건드리지 않는다). 승인 대기 교사도 고를 수 있다(가입 직후 자리).
CREATE OR REPLACE FUNCTION my_school()
RETURNS TABLE (school_id text, school_name text, office_short text, district text, school_request text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT t.school_id, COALESCE(s.name,''), COALESCE(o.short,''), COALESCE(s.district,''), COALESCE(t.school_request,'')
    FROM teachers t
    LEFT JOIN schools s ON s.id = t.school_id
    LEFT JOIN edu_offices o ON o.code = s.office_code
   WHERE t.user_id = auth.uid()
   LIMIT 1
$fn$;
GRANT EXECUTE ON FUNCTION my_school() TO authenticated;

CREATE OR REPLACE FUNCTION set_my_school(p_school_id text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid; v_label text;
BEGIN
  v_tid := cw_my_teacher_id();
  IF v_tid IS NULL THEN
    RAISE EXCEPTION 'teacher required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT s.name || ' (' || o.short || ' ' || s.district || ')'
    INTO v_label
    FROM schools s JOIN edu_offices o ON o.code = s.office_code
   WHERE s.id = p_school_id AND s.is_active;
  IF v_label IS NULL THEN
    RAISE EXCEPTION 'no such school' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  -- ★ 자기 행만. 학교 지정과 함께 school_request(직접 적은 글자)는 지운다.
  UPDATE teachers SET school_id = p_school_id, school = v_label, school_request = NULL
   WHERE id = v_tid;
  RETURN v_label;
END $fn$;
GRANT EXECUTE ON FUNCTION set_my_school(text) TO authenticated;

-- ---------------------------------------------------------------
-- 검산
--   SELECT count(*) FROM school_tasks;                                     → 0 (첫 실행)
--   SELECT count(*) FROM pg_policies WHERE tablename='school_tasks';       → 2
--   SELECT count(*) FROM pg_policies WHERE tablename='school_task_reads';  → 1
--   SELECT proname FROM pg_proc WHERE proname IN
--     ('kedu_my_school_id','list_school_tasks','add_school_task',
--      'mark_school_task','close_school_task','my_school','set_my_school'); → 7행
--   SELECT * FROM list_school_tasks();                                     → 0 rows (할 일 없음)
--   -- 준호 계정으로: SELECT kedu_my_school_id();                          → 금성초 학교ID (NULL 이면 학교 지정 먼저)
-- ---------------------------------------------------------------
