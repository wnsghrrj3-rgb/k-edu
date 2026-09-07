-- =============================================================================
-- setup_worksheet_v5.sql — 케이학습지 W5 수행평가 채점·공개·리포트 합류 (설계 v2 §4-2 ③④ · §4-4) · 재실행 안전
--   선행: setup_worksheet_v4.sql(#46)
--   ① 뷰 report_performance — 학생×run: 과제·기준별 수준·평균 수준·M코드·공개 여부 (security_invoker)
--   ② RPC perf_grade(run, student, levels, memo, mis_codes) — 담임만, UPSERT
--   ③ RPC perf_reveal(run, to_student, to_parent) — 담임만
-- =============================================================================

-- [1] 리포트 뷰
DROP VIEW IF EXISTS report_performance;
CREATE VIEW report_performance
WITH (security_invoker = true) AS
SELECT r.run_id, r.student_id, run.class_code_id, run.task_id,
       t.code AS task_code, t.title, t.student_label, t.area, t.concept_code, t.std_code,
       t.rubric, r.levels, r.memo, r.mis_codes, r.graded_at,
       run.reveal_to_student, run.reveal_to_parent, run.opened_at,
       -- 평균 수준: 0 잘함 · 1 보통 · 2 노력 (낮을수록 좋다). 기준이 비어 있으면 NULL
       (SELECT AVG((v)::numeric) FROM jsonb_each_text(r.levels) AS e(k, v))::numeric(4,2) AS avg_level,
       (SELECT s.kind FROM performance_submissions s WHERE s.run_id = r.run_id AND s.student_id = r.student_id) AS submit_kind
  FROM performance_results r
  JOIN performance_runs run ON run.id = r.run_id
  JOIN performance_tasks t ON t.id = run.task_id;

-- [2] 채점 — 자기 run·자기 학급 학생만. levels = {"0":0,"1":2,"2":1}
CREATE OR REPLACE FUNCTION perf_grade(p_run_id uuid, p_student_id uuid, p_levels jsonb, p_memo text DEFAULT NULL, p_mis_codes text[] DEFAULT '{}')
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid := cw_my_teacher_id();
BEGIN
  IF v_tid IS NULL THEN RETURN false; END IF;
  IF NOT EXISTS (SELECT 1 FROM performance_runs run JOIN student_profiles sp ON sp.class_code_id = run.class_code_id
                  WHERE run.id = p_run_id AND run.teacher_id = v_tid AND sp.id = p_student_id) THEN
    RETURN false;
  END IF;
  INSERT INTO performance_results (run_id, student_id, levels, memo, mis_codes, graded_at, graded_by)
  VALUES (p_run_id, p_student_id, COALESCE(p_levels, '{}'::jsonb), NULLIF(p_memo, ''), COALESCE(p_mis_codes, '{}'), now(), v_tid)
  ON CONFLICT (run_id, student_id) DO UPDATE
    SET levels = EXCLUDED.levels, memo = EXCLUDED.memo, mis_codes = EXCLUDED.mis_codes, graded_at = now(), graded_by = v_tid;
  RETURN true;
END $fn$;
GRANT EXECUTE ON FUNCTION perf_grade(uuid, uuid, jsonb, text, text[]) TO authenticated;

-- [3] 공개 — 학생/학부모 각각 수동 (§4-2 ④)
CREATE OR REPLACE FUNCTION perf_reveal(p_run_id uuid, p_to_student boolean, p_to_parent boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  UPDATE performance_runs SET reveal_to_student = p_to_student, reveal_to_parent = p_to_parent
   WHERE id = p_run_id AND teacher_id = cw_my_teacher_id();
  RETURN FOUND;
END $fn$;
GRANT EXECUTE ON FUNCTION perf_reveal(uuid, boolean, boolean) TO authenticated;

-- 검산: SELECT table_name FROM information_schema.views WHERE table_name='report_performance';  → 1행
--       SELECT proname FROM pg_proc WHERE proname IN ('perf_grade','perf_reveal');  → 2행
