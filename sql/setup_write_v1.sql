-- =============================================================================
-- setup_write_v1.sql — 케이글쓰기 과제·제출·첨삭 (설계 v2 §11) · 재실행 안전
--   선행: setup_classwork.sql(cw_my_teacher_id) · setup_teacher_approval.sql(kedu_teacher_approved) · setup_class_openings.sql
--   준호 결정(2026-09-08): 학생은 자동 점검을 제출 전에 보지 않는다 → 제출 순간 자동 첨삭 스냅샷이 저장되고,
--   교사가 그 위에 표시·메모·한마디·루브릭을 얹어 「돌려주기」 해야 학생이 본다. 교사가 지운 자동 표시는 write_fp_log 에 쌓인다(사전 다듬기 재료).
--   표 4 + RPC 3. 학생 쓰기는 마감 전·허용 차수 안에서만. 동의 전 학생(guest_seat)은 프로필이 없어 애초에 못 쓴다.
-- =============================================================================

-- [1] 과제 = 반에 연 것 1건
CREATE TABLE IF NOT EXISTS write_runs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code_id  uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  teacher_id     uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  type           text NOT NULL CHECK (type IN ('argue','explain','book','letter','story')),
  band           text NOT NULL CHECK (band IN ('low','mid','high')),
  title          text NOT NULL,                      -- 학생 카드 이름
  topic          text NOT NULL,                      -- 논제
  keywords       text[] NOT NULL DEFAULT '{}',       -- 핵심 낱말 1~3
  prompt_id      text,                               -- data/prompts.json id (있으면 지문도 보여 준다)
  passage        text,                               -- 교사가 직접 넣은 읽을 글(선택)
  guide          text,                               -- 교사 안내 한 줄(선택)
  rewrite_max    int  NOT NULL DEFAULT 1 CHECK (rewrite_max BETWEEN 0 AND 3),   -- 다시 쓰기 허용 횟수(기본 1)
  due_at         timestamptz,
  opened_at      timestamptz NOT NULL DEFAULT now(),
  closed_at      timestamptz
);
CREATE INDEX IF NOT EXISTS idx_write_runs_class ON write_runs(class_code_id, opened_at DESC);

-- [2] 학생 제출 — 차수(attempt)마다 한 줄. 자동 첨삭 스냅샷(auto)은 제출 순간 화면이 계산해 같이 보낸다(학생은 못 본다).
CREATE TABLE IF NOT EXISTS write_submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        uuid NOT NULL REFERENCES write_runs(id) ON DELETE CASCADE,
  student_id    uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  attempt       int  NOT NULL DEFAULT 1 CHECK (attempt BETWEEN 1 AND 4),
  text          text NOT NULL,
  auto          jsonb NOT NULL DEFAULT '{}',         -- {marks:[…], memos:[…], elements:{…}, structure:{…}, length:{…}, engine:'v2'}
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, student_id, attempt)
);
CREATE INDEX IF NOT EXISTS idx_write_sub_run ON write_submissions(run_id, submitted_at DESC);

-- [3] 교사 첨삭 — 제출 한 줄에 한 줄. returned_at 이 채워져야 학생이 본다.
CREATE TABLE IF NOT EXISTS write_reviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id  uuid NOT NULL UNIQUE REFERENCES write_submissions(id) ON DELETE CASCADE,
  teacher_marks  jsonb NOT NULL DEFAULT '[]',        -- [{i, from, to, original, fix, why}] 파란 펜 (from/to 없으면 문장 메모)
  removed        jsonb NOT NULL DEFAULT '[]',        -- 교사가 지운 자동 표시의 key 목록 ["i:from:to:kind"]
  comment        text,                               -- 글 전체 한마디
  levels         jsonb NOT NULL DEFAULT '{}',        -- 루브릭 {"0":0,"1":2,"2":1} (기준 idx → 0 잘함·1 보통·2 노력)
  ask_rewrite    boolean NOT NULL DEFAULT false,     -- 「고쳐서 다시 보내 주세요」
  returned_at    timestamptz,
  reviewed_by    uuid REFERENCES teachers(id) ON DELETE SET NULL,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- [4] 교사가 지운 자동 표시(오탐) 장부 — 준호·베프가 사전을 다듬는 재료. 학생 글 원문은 안 남기고 그 문장만.
CREATE TABLE IF NOT EXISTS write_fp_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        text NOT NULL,
  original    text NOT NULL,
  fix         text,
  sentence    text NOT NULL,
  band        text,
  teacher_id  uuid REFERENCES teachers(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- [5] RLS
ALTER TABLE write_runs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE write_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE write_reviews     ENABLE ROW LEVEL SECURITY;
ALTER TABLE write_fp_log      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_wrun_teacher ON write_runs;
CREATE POLICY p_wrun_teacher ON write_runs FOR ALL TO authenticated
  USING (teacher_id = cw_my_teacher_id())
  WITH CHECK (teacher_id = cw_my_teacher_id() AND kedu_teacher_approved()
              AND class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = cw_my_teacher_id()));
-- 학생: 우리 반 과제 읽기
DROP POLICY IF EXISTS p_wrun_student_read ON write_runs;
CREATE POLICY p_wrun_student_read ON write_runs FOR SELECT TO authenticated
  USING (class_code_id IN (SELECT class_code_id FROM student_profiles WHERE user_id = auth.uid()));

-- 제출: 학생 본인 읽기 / 쓰기는 RPC(write_submit)로만 — 차수·마감 검사를 서버가 한다
DROP POLICY IF EXISTS p_wsub_student_read ON write_submissions;
CREATE POLICY p_wsub_student_read ON write_submissions FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS p_wsub_teacher_read ON write_submissions;
CREATE POLICY p_wsub_teacher_read ON write_submissions FOR SELECT TO authenticated
  USING (run_id IN (SELECT id FROM write_runs WHERE teacher_id = cw_my_teacher_id()));

-- 첨삭: 담임 전부 / 학생은 돌려준 것만
DROP POLICY IF EXISTS p_wrev_teacher ON write_reviews;
CREATE POLICY p_wrev_teacher ON write_reviews FOR ALL TO authenticated
  USING (submission_id IN (SELECT s.id FROM write_submissions s JOIN write_runs r ON r.id = s.run_id WHERE r.teacher_id = cw_my_teacher_id()))
  WITH CHECK (submission_id IN (SELECT s.id FROM write_submissions s JOIN write_runs r ON r.id = s.run_id WHERE r.teacher_id = cw_my_teacher_id()));
DROP POLICY IF EXISTS p_wrev_student_read ON write_reviews;
CREATE POLICY p_wrev_student_read ON write_reviews FOR SELECT TO authenticated
  USING (returned_at IS NOT NULL
         AND submission_id IN (SELECT id FROM write_submissions WHERE student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())));

-- 오탐 장부: 승인 교사 쓰기만(읽기는 관리자 — /admin 또는 service_role)
DROP POLICY IF EXISTS p_wfp_teacher_insert ON write_fp_log;
CREATE POLICY p_wfp_teacher_insert ON write_fp_log FOR INSERT TO authenticated
  WITH CHECK (kedu_teacher_approved() AND teacher_id = cw_my_teacher_id());
DROP POLICY IF EXISTS p_wfp_admin_read ON write_fp_log;
CREATE POLICY p_wfp_admin_read ON write_fp_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid() AND is_admin));

-- [6] get_write_run — 학생이 과제를 받는 유일한 문(교사 본인은 미리보기). 돌려준 첨삭만 준다.
CREATE OR REPLACE FUNCTION get_write_run(p_run_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_sp uuid; v_class uuid; v_run write_runs%ROWTYPE; v_teacher boolean; v_subs jsonb; v_name text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT sp.id, sp.class_code_id, sp.nickname INTO v_sp, v_class, v_name FROM student_profiles sp WHERE sp.user_id = auth.uid() LIMIT 1;
  SELECT * INTO v_run FROM write_runs WHERE id = p_run_id;
  IF v_run.id IS NULL THEN RETURN NULL; END IF;
  v_teacher := (v_run.teacher_id IS NOT DISTINCT FROM cw_my_teacher_id());
  IF NOT v_teacher AND (v_class IS NULL OR v_class <> v_run.class_code_id) THEN RETURN NULL; END IF;
  IF v_sp IS NOT NULL THEN
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
             'id', s.id, 'attempt', s.attempt, 'text', s.text, 'submitted_at', s.submitted_at,
             'review', CASE WHEN rv.returned_at IS NOT NULL THEN jsonb_build_object(
                 'auto', s.auto, 'teacher_marks', rv.teacher_marks, 'removed', rv.removed, 'comment', rv.comment,
                 'levels', rv.levels, 'ask_rewrite', rv.ask_rewrite, 'returned_at', rv.returned_at) ELSE NULL END
           ) ORDER BY s.attempt), '[]'::jsonb)
      INTO v_subs
      FROM write_submissions s LEFT JOIN write_reviews rv ON rv.submission_id = s.id
     WHERE s.run_id = p_run_id AND s.student_id = v_sp;
  END IF;
  RETURN jsonb_build_object(
    'run', v_run.id, 'class_code_id', v_run.class_code_id, 'closed', (v_run.closed_at IS NOT NULL),
    'student_id', v_sp, 'student_name', v_name, 'is_teacher', v_teacher,
    'type', v_run.type, 'band', v_run.band, 'title', v_run.title, 'topic', v_run.topic, 'keywords', to_jsonb(v_run.keywords),
    'prompt_id', v_run.prompt_id, 'passage', v_run.passage, 'guide', v_run.guide, 'rewrite_max', v_run.rewrite_max, 'due_at', v_run.due_at,
    'subs', COALESCE(v_subs, '[]'::jsonb)
  );
END $fn$;
GRANT EXECUTE ON FUNCTION get_write_run(uuid) TO authenticated;

-- [7] write_submit — 학생 제출(차수 자동). 마감·차수·「다시 쓰기 요청 뒤에만 다음 차수」를 서버가 지킨다.
CREATE OR REPLACE FUNCTION write_submit(p_run_id uuid, p_text text, p_auto jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_sp uuid; v_class uuid; v_run write_runs%ROWTYPE; v_last write_submissions%ROWTYPE; v_rev write_reviews%ROWTYPE; v_attempt int; v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('status','no_session'); END IF;
  SELECT sp.id, sp.class_code_id INTO v_sp, v_class FROM student_profiles sp WHERE sp.user_id = auth.uid() AND sp.is_active LIMIT 1;
  IF v_sp IS NULL THEN RETURN jsonb_build_object('status','no_profile'); END IF;
  SELECT * INTO v_run FROM write_runs WHERE id = p_run_id;
  IF v_run.id IS NULL OR v_run.class_code_id <> v_class THEN RETURN jsonb_build_object('status','not_yours'); END IF;
  IF v_run.closed_at IS NOT NULL OR (v_run.due_at IS NOT NULL AND v_run.due_at < now()) THEN RETURN jsonb_build_object('status','closed'); END IF;
  IF length(trim(coalesce(p_text,''))) < 10 THEN RETURN jsonb_build_object('status','too_short'); END IF;
  SELECT * INTO v_last FROM write_submissions WHERE run_id = p_run_id AND student_id = v_sp ORDER BY attempt DESC LIMIT 1;
  IF v_last.id IS NULL THEN
    v_attempt := 1;
  ELSE
    SELECT * INTO v_rev FROM write_reviews WHERE submission_id = v_last.id;
    IF v_rev.returned_at IS NULL THEN
      -- 아직 선생님이 안 봤으면 같은 차수를 덮어쓴다(잘못 보낸 것 고치기)
      UPDATE write_submissions SET text = p_text, auto = coalesce(p_auto,'{}'::jsonb), submitted_at = now() WHERE id = v_last.id;
      RETURN jsonb_build_object('status','replaced','attempt', v_last.attempt, 'id', v_last.id);
    END IF;
    IF v_last.attempt > v_run.rewrite_max THEN RETURN jsonb_build_object('status','no_more'); END IF;
    v_attempt := v_last.attempt + 1;
  END IF;
  INSERT INTO write_submissions (run_id, student_id, attempt, text, auto)
  VALUES (p_run_id, v_sp, v_attempt, p_text, coalesce(p_auto,'{}'::jsonb)) RETURNING id INTO v_id;
  RETURN jsonb_build_object('status','ok','attempt', v_attempt, 'id', v_id);
END $fn$;
GRANT EXECUTE ON FUNCTION write_submit(uuid, text, jsonb) TO authenticated;

-- [8] list_write_runs_mine — 학생 화면 「우리 반 글쓰기」 목록(내 제출 상태 포함)
CREATE OR REPLACE FUNCTION list_write_runs_mine()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_sp uuid; v_class uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN '[]'::jsonb; END IF;
  SELECT sp.id, sp.class_code_id INTO v_sp, v_class FROM student_profiles sp WHERE sp.user_id = auth.uid() LIMIT 1;
  IF v_class IS NULL THEN RETURN '[]'::jsonb; END IF;
  RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'run', r.id, 'title', r.title, 'topic', r.topic, 'type', r.type, 'band', r.band, 'due_at', r.due_at, 'closed', (r.closed_at IS NOT NULL),
      'attempts', (SELECT count(*) FROM write_submissions s WHERE s.run_id = r.id AND s.student_id = v_sp),
      'returned', (SELECT count(*) FROM write_submissions s JOIN write_reviews rv ON rv.submission_id = s.id WHERE s.run_id = r.id AND s.student_id = v_sp AND rv.returned_at IS NOT NULL),
      'ask_rewrite', COALESCE((SELECT rv.ask_rewrite FROM write_submissions s JOIN write_reviews rv ON rv.submission_id = s.id WHERE s.run_id = r.id AND s.student_id = v_sp ORDER BY s.attempt DESC LIMIT 1), false)
    ) ORDER BY r.opened_at DESC)
    FROM write_runs r WHERE r.class_code_id = v_class), '[]'::jsonb);
END $fn$;
GRANT EXECUTE ON FUNCTION list_write_runs_mine() TO authenticated;

-- 검산: SELECT count(*) FROM information_schema.tables WHERE table_name LIKE 'write_%';  → 4
--       SELECT proname FROM pg_proc WHERE proname IN ('get_write_run','write_submit','list_write_runs_mine');  → 3행
--       SELECT count(*) FROM pg_policies WHERE tablename='write_submissions';  → 2
