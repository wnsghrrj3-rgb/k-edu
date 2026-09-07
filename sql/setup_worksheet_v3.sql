-- =============================================================================
-- setup_worksheet_v3.sql — 케이학습지 W3 단원 평가 결과 (설계 v2 §3-4) · 재실행 안전
--   선행: setup_worksheet_v2.sql(#44)
--   ① scores.answer_text — 서술형 학생 답(채점 재료). 종전엔 답 문장이 어디에도 안 남았다.
--   ② quiz_set_matrix   — 세트 × 학생 × 문항 「마지막 답」 한 행 (교사 결과 화면·히트맵·종이 입력 재료)
--   ③ quiz_paper_input  — 종이 응시 ○× 격자를 scores 에 source='paper' 로 (§8-⑥)
--   ④ quiz_grade_essay  — 서술형 채점(0~배점) : 학생이 pending 으로 남긴 행을 채점 결과로 갱신
-- =============================================================================

-- [1] 서술 답 보관
ALTER TABLE scores ADD COLUMN IF NOT EXISTS answer_text text;

-- [2] 세트 × 학생 × 문항 마지막 답 (security_invoker → 교사는 자기 학급만)
DROP VIEW IF EXISTS quiz_set_matrix;
CREATE VIEW quiz_set_matrix
WITH (security_invoker = true) AS
SELECT x.quiz_set_id, x.student_id, x.question_bank_id, x.score_id,
       x.is_correct, x.score, x.max_score, x.misconception_code, x.concept_code,
       x.source, x.answer_text, x.earned_at,
       i.ord, i.points
FROM (
  SELECT s.id AS score_id, s.quiz_set_id, s.student_id, s.question_bank_id,
         s.is_correct, s.score, s.max_score, s.misconception_code, s.concept_code,
         s.source, s.answer_text, s.earned_at,
         ROW_NUMBER() OVER (PARTITION BY s.quiz_set_id, s.student_id, s.question_bank_id ORDER BY s.earned_at DESC) AS rn
    FROM scores s
   WHERE s.quiz_set_id IS NOT NULL AND s.question_bank_id IS NOT NULL
) x
JOIN quiz_set_items i ON i.set_id = x.quiz_set_id AND i.question_id = x.question_bank_id
WHERE x.rn = 1;

-- [3] 종이 응시 점수 입력 — 자기 세트 · 자기 학급 학생만. 같은 학생·문항은 새 행으로(마지막 답이 이긴다).
--   p_rows = [{"student_id": uuid, "answers": {"<question_bank_id>": true|false, ...}}, ...]
CREATE OR REPLACE FUNCTION quiz_paper_input(p_set_id uuid, p_rows jsonb)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_set quiz_sets%ROWTYPE; v_row jsonb; v_sid uuid; v_q record; v_k text; v_v boolean; v_n int := 0;
  v_ok int; v_tot int;
BEGIN
  SELECT * INTO v_set FROM quiz_sets WHERE id = p_set_id AND teacher_id = cw_my_teacher_id();
  IF v_set.id IS NULL THEN RAISE EXCEPTION 'not your set'; END IF;

  FOR v_row IN SELECT * FROM jsonb_array_elements(p_rows) LOOP
    v_sid := (v_row ->> 'student_id')::uuid;
    -- 이 학생이 내 학급인가
    IF NOT EXISTS (SELECT 1 FROM student_profiles sp JOIN class_codes cc ON cc.id = sp.class_code_id
                    WHERE sp.id = v_sid AND cc.teacher_id = cw_my_teacher_id()) THEN
      CONTINUE;
    END IF;
    v_ok := 0; v_tot := 0;
    FOR v_k, v_v IN SELECT key, (value)::boolean FROM jsonb_each_text(COALESCE(v_row -> 'answers', '{}'::jsonb)) LOOP
      SELECT q.id, q.qcode, q.concept_code, i.points INTO v_q
        FROM quiz_set_items i JOIN question_bank q ON q.id = i.question_id
       WHERE i.set_id = p_set_id AND q.id = v_k::uuid;
      IF v_q.id IS NULL THEN CONTINUE; END IF;
      INSERT INTO scores (student_id, lesson_id, unit_id, question_id, is_correct, score, max_score,
                          quiz_set_id, question_bank_id, concept_code, misconception_code, source)
      VALUES (v_sid, 'quiz:' || p_set_id::text, '/kedu/worksheet/paper', v_q.qcode, v_v,
              CASE WHEN v_v THEN v_q.points ELSE 0 END, v_q.points,
              p_set_id, v_q.id, v_q.concept_code, NULL, 'paper');
      v_n := v_n + 1; v_tot := v_tot + v_q.points; IF v_v THEN v_ok := v_ok + v_q.points; END IF;
    END LOOP;
    IF v_tot > 0 THEN
      INSERT INTO scores (student_id, lesson_id, unit_id, question_id, is_correct, score, max_score, quiz_set_id, source)
      VALUES (v_sid, 'quiz:' || p_set_id::text, '/kedu/worksheet/paper', '_lesson_summary_', NULL, v_ok, v_tot, p_set_id, 'paper');
    END IF;
  END LOOP;
  RETURN v_n;
END $fn$;
GRANT EXECUTE ON FUNCTION quiz_paper_input(uuid, jsonb) TO authenticated;

-- [4] 서술형 채점 — 그 행이 내 세트·내 학급 학생의 것일 때만. p_points 는 0 ~ 배점.
CREATE OR REPLACE FUNCTION quiz_grade_essay(p_score_id uuid, p_points int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_max int;
BEGIN
  SELECT i.points INTO v_max
    FROM scores s JOIN quiz_sets qs ON qs.id = s.quiz_set_id
    JOIN quiz_set_items i ON i.set_id = s.quiz_set_id AND i.question_id = s.question_bank_id
    JOIN student_profiles sp ON sp.id = s.student_id
    JOIN class_codes cc ON cc.id = sp.class_code_id
   WHERE s.id = p_score_id AND qs.teacher_id = cw_my_teacher_id() AND cc.teacher_id = cw_my_teacher_id();
  IF v_max IS NULL THEN RETURN false; END IF;
  UPDATE scores SET score = LEAST(GREATEST(p_points, 0), v_max), max_score = v_max,
                    is_correct = (p_points >= v_max)
   WHERE id = p_score_id;
  RETURN true;
END $fn$;
GRANT EXECUTE ON FUNCTION quiz_grade_essay(uuid, int) TO authenticated;

-- 검산: SELECT column_name FROM information_schema.columns WHERE table_name='scores' AND column_name='answer_text';  → 1행
--       SELECT table_name FROM information_schema.views WHERE table_name='quiz_set_matrix';  → 1행
--       SELECT proname FROM pg_proc WHERE proname IN ('quiz_paper_input','quiz_grade_essay');  → 2행
