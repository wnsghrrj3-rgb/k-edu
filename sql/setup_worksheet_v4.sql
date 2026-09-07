-- =============================================================================
-- setup_worksheet_v4.sql — 케이학습지 W4 수행평가 (설계 v2 §4-1 · §4-2 · §4-3) · 재실행 안전
--   선행: setup_worksheet_v2.sql(#44) · setup_class_openings.sql · setup_classwork.sql(cw_my_teacher_id)
--   §8 결정: ③ v0 제출 = 사진·글 (녹음은 뒤로)
--   표 4 + RPC get_perf_run(학생이 과제를 받는 문). Storage 버킷·정책은 setup_worksheet_v4_storage.sql 로 분리
--   (SQL Editor 는 파일 전체를 한 트랜잭션으로 돌려서, storage 정책이 권한으로 막히면 표까지 통째로 되돌아간다 — 2026-09-07 실측)
-- =============================================================================

-- [1] 과제 정본
CREATE TABLE IF NOT EXISTS performance_tasks (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text UNIQUE NOT NULL,              -- '수행과제_01'
  grade          int  NOT NULL,
  subject        text NOT NULL,
  unit_code      text NOT NULL,
  area           text NOT NULL,                     -- 조사·탐구 / 만들기·표현 / 발표·말하기 / 문제해결 과정 / 글쓰기 / 관찰·실험
  title          text NOT NULL,
  student_label  text NOT NULL,                     -- 학생 카드 이름(평가 단어 없음)
  task_text      text NOT NULL,
  conditions     text[] NOT NULL DEFAULT '{}',
  rubric         jsonb NOT NULL,                    -- {criteria:[{name, levels:[{label,desc}×3]}×3]}
  anchors        jsonb NOT NULL DEFAULT '{}',       -- {잘함, 보통, 노력 요함}
  observe_points jsonb NOT NULL DEFAULT '[]',       -- [{text, mis_code|null, note|null}]
  std_code       text,
  lesson_link    text,
  concept_code   text,
  product_kind   text NOT NULL DEFAULT 'photo' CHECK (product_kind IN ('photo','text')),
  source         text NOT NULL DEFAULT 'kedu',      -- kedu | teacher
  teacher_id     uuid REFERENCES teachers(id) ON DELETE SET NULL,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- [2] 반에 연 것 = 배포 1건
CREATE TABLE IF NOT EXISTS performance_runs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id           uuid NOT NULL REFERENCES performance_tasks(id) ON DELETE RESTRICT,
  class_code_id     uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  teacher_id        uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  opened_at         timestamptz NOT NULL DEFAULT now(),
  closed_at         timestamptz,
  reveal_to_student boolean NOT NULL DEFAULT false,
  reveal_to_parent  boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_perf_runs_class ON performance_runs(class_code_id, opened_at DESC);

-- [3] 학생 제출 (한 학생 한 run 에 마지막 것만 — 다시 보내면 갱신)
CREATE TABLE IF NOT EXISTS performance_submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        uuid NOT NULL REFERENCES performance_runs(id) ON DELETE CASCADE,
  student_id    uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  kind          text NOT NULL CHECK (kind IN ('photo','text')),
  payload       jsonb NOT NULL DEFAULT '{}',        -- {path} (Storage 경로) | {text}
  checks        boolean[] NOT NULL DEFAULT '{}',    -- 조건 체크리스트
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, student_id)
);

-- [4] 교사 판정 (W5 채점 그리드가 쓴다 — 표는 지금 만든다)
CREATE TABLE IF NOT EXISTS performance_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id      uuid NOT NULL REFERENCES performance_runs(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  levels      jsonb NOT NULL DEFAULT '{}',          -- {"0":0,"1":2,"2":1}  기준 idx → 수준 idx(0 잘함·1 보통·2 노력)
  memo        text,
  mis_codes   text[] NOT NULL DEFAULT '{}',
  graded_at   timestamptz NOT NULL DEFAULT now(),
  graded_by   uuid REFERENCES teachers(id) ON DELETE SET NULL,
  UNIQUE (run_id, student_id)
);

-- [5] RLS
ALTER TABLE performance_tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_runs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_results     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_ptask_teacher_read ON performance_tasks;
CREATE POLICY p_ptask_teacher_read ON performance_tasks FOR SELECT TO authenticated
  USING (cw_my_teacher_id() IS NOT NULL AND (source = 'kedu' OR teacher_id = cw_my_teacher_id()));
DROP POLICY IF EXISTS p_ptask_teacher_own ON performance_tasks;
CREATE POLICY p_ptask_teacher_own ON performance_tasks FOR ALL TO authenticated
  USING (source = 'teacher' AND teacher_id = cw_my_teacher_id())
  WITH CHECK (source = 'teacher' AND teacher_id = cw_my_teacher_id());

DROP POLICY IF EXISTS p_prun_teacher ON performance_runs;
CREATE POLICY p_prun_teacher ON performance_runs FOR ALL TO authenticated
  USING (teacher_id = cw_my_teacher_id()) WITH CHECK (teacher_id = cw_my_teacher_id());

-- 제출: 학생 본인 행 (읽기·쓰기) / 담임 읽기
DROP POLICY IF EXISTS p_psub_student ON performance_submissions;
CREATE POLICY p_psub_student ON performance_submissions FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
              AND run_id IN (SELECT r.id FROM performance_runs r JOIN student_profiles sp ON sp.class_code_id = r.class_code_id
                              WHERE sp.user_id = auth.uid() AND r.closed_at IS NULL));
DROP POLICY IF EXISTS p_psub_teacher_read ON performance_submissions;
CREATE POLICY p_psub_teacher_read ON performance_submissions FOR SELECT TO authenticated
  USING (run_id IN (SELECT id FROM performance_runs WHERE teacher_id = cw_my_teacher_id()));

DROP POLICY IF EXISTS p_pres_teacher ON performance_results;
CREATE POLICY p_pres_teacher ON performance_results FOR ALL TO authenticated
  USING (run_id IN (SELECT id FROM performance_runs WHERE teacher_id = cw_my_teacher_id()))
  WITH CHECK (run_id IN (SELECT id FROM performance_runs WHERE teacher_id = cw_my_teacher_id()));
-- 학생은 공개된 것만
DROP POLICY IF EXISTS p_pres_student_read ON performance_results;
CREATE POLICY p_pres_student_read ON performance_results FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
         AND run_id IN (SELECT id FROM performance_runs WHERE reveal_to_student));

-- [7] get_perf_run — 학생이 과제를 받는 유일한 문 (교사 본인은 미리보기)
CREATE OR REPLACE FUNCTION get_perf_run(p_run_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_sp uuid; v_class uuid; v_run performance_runs%ROWTYPE; v_t performance_tasks%ROWTYPE; v_sub jsonb; v_res jsonb; v_teacher boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT sp.id, sp.class_code_id INTO v_sp, v_class FROM student_profiles sp WHERE sp.user_id = auth.uid() LIMIT 1;
  SELECT * INTO v_run FROM performance_runs WHERE id = p_run_id;
  IF v_run.id IS NULL THEN RETURN NULL; END IF;
  v_teacher := (v_run.teacher_id IS NOT DISTINCT FROM cw_my_teacher_id());
  IF NOT v_teacher AND (v_class IS NULL OR v_class <> v_run.class_code_id) THEN RETURN NULL; END IF;
  SELECT * INTO v_t FROM performance_tasks WHERE id = v_run.task_id;
  IF v_sp IS NOT NULL THEN
    SELECT jsonb_build_object('kind', s.kind, 'payload', s.payload, 'checks', s.checks, 'submitted_at', s.submitted_at)
      INTO v_sub FROM performance_submissions s WHERE s.run_id = p_run_id AND s.student_id = v_sp;
    IF v_run.reveal_to_student THEN
      SELECT jsonb_build_object('levels', r.levels, 'memo', r.memo) INTO v_res
        FROM performance_results r WHERE r.run_id = p_run_id AND r.student_id = v_sp;
    END IF;
  END IF;
  RETURN jsonb_build_object(
    'run', v_run.id, 'class_code_id', v_run.class_code_id, 'closed', (v_run.closed_at IS NOT NULL),
    'student_id', v_sp, 'is_teacher', v_teacher,
    'task', jsonb_build_object('title', v_t.title, 'student_label', v_t.student_label, 'task_text', v_t.task_text,
                               'conditions', to_jsonb(v_t.conditions), 'product_kind', v_t.product_kind, 'area', v_t.area,
                               'rubric', CASE WHEN v_run.reveal_to_student OR v_teacher THEN v_t.rubric ELSE NULL END),
    'my', COALESCE(v_sub, jsonb_build_object('submitted', false)),
    'result', v_res
  );
END $fn$;
GRANT EXECUTE ON FUNCTION get_perf_run(uuid) TO authenticated;

-- 검산: SELECT count(*) FROM information_schema.tables WHERE table_name LIKE 'performance_%';  → 4
--       SELECT proname FROM pg_proc WHERE proname='get_perf_run';  → 1행
--       그 다음 seed_perf_g1_math_u1.sql → SELECT count(*) FROM performance_tasks; → 7
