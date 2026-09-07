-- =============================================================================
-- setup_worksheet_v2.sql — 케이학습지 3종 v2 델타 (W2 단원 평가) · 재실행 안전
--   설계: handoff/kedu/케이학습지_3종_설계_v2.md §3 · §6  (2026-09-07 준호 결정 §8 반영)
--   선행: setup_worksheet_bank.sql(#29) · setup_class_openings.sql
--   §8 결정: ① 1~2학년 15문항·20분 / 3~6학년 25문항·30분(화면 기본값) ② 단원 평가 기본 「마감 후」
--            ③ 수행 v0 사진·글(W4) ④ 보완 쪽지 = 미도달 학생에게만(target_student_ids)
--            ⑤ 자작 문항 개념 태그 필수(W6) ⑥ 종이 점수 입력 W3
-- =============================================================================

-- [1] quiz_sets — 공개·마감·배정·시간
ALTER TABLE quiz_sets ADD COLUMN IF NOT EXISTS result_opened_at   timestamptz;   -- 「결과 열기」 누른 시각(after_close·manual)
ALTER TABLE quiz_sets ADD COLUMN IF NOT EXISTS closed_at          timestamptz;   -- 응시 마감(NULL = 열려 있음)
ALTER TABLE quiz_sets ADD COLUMN IF NOT EXISTS target_student_ids uuid[];        -- NULL = 반 전체 / 배열 = 그 학생만(보완 쪽지, §8-④)
ALTER TABLE quiz_sets ADD COLUMN IF NOT EXISTS time_min           int;           -- 예상 시간(안내용)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_sets_show_result_check') THEN
    ALTER TABLE quiz_sets ADD CONSTRAINT quiz_sets_show_result_check
      CHECK (show_result IN ('immediate','after_close','manual'));
  END IF;
END $$;

-- [2] quiz_set_items — 배점
ALTER TABLE quiz_set_items ADD COLUMN IF NOT EXISTS points int NOT NULL DEFAULT 1;

-- [3] question_bank — 출처(W6 자작 대비 열만; RLS 는 W6 에서)
ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS source     text NOT NULL DEFAULT 'kedu';   -- kedu | teacher
ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL;

-- [4] scores — 종이 응시 구분(W3 종이 점수 입력이 'paper' 로 쓴다)
ALTER TABLE scores ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'online';

-- [5] get_quiz_set v2 — 배정 검사 + 공개 여부(reveal) + 배점
--   reveal = 학생 화면이 정오·해설을 보여도 되는가.
--     immediate → 항상 / after_close·manual → 교사가 「결과 열기」를 누른 뒤(result_opened_at)
--   교사 본인 미리보기는 늘 reveal. 배정(target_student_ids)에 없는 학생은 세트의 존재를 모른다(NULL).
CREATE OR REPLACE FUNCTION get_quiz_set(p_set_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_class uuid; v_sp uuid;
  v_set   quiz_sets%ROWTYPE;
  v_qs    jsonb;
  v_teacher boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;

  SELECT sp.id, sp.class_code_id INTO v_sp, v_class
    FROM student_profiles sp WHERE sp.user_id = auth.uid() LIMIT 1;

  SELECT * INTO v_set FROM quiz_sets WHERE id = p_set_id AND NOT is_archived;
  IF v_set.id IS NULL THEN RETURN NULL; END IF;

  v_teacher := (v_set.teacher_id IS NOT DISTINCT FROM cw_my_teacher_id());
  IF NOT v_teacher THEN
    IF v_class IS NULL THEN RETURN NULL; END IF;
    IF NOT EXISTS (
      SELECT 1 FROM class_openings o
       WHERE o.class_code_id = v_class
         AND o.content_key = 'quiz:' || p_set_id::text
    ) THEN
      RETURN NULL;
    END IF;
    -- 배정된 학생만(보완 쪽지). 배정이 없으면 반 전체.
    IF v_set.target_student_ids IS NOT NULL AND NOT (v_sp = ANY (v_set.target_student_ids)) THEN
      RETURN NULL;
    END IF;
  END IF;

  SELECT jsonb_agg(
           q.payload
           || jsonb_build_object('qid', q.id, 'qcode', q.qcode,
                                 'concept', q.concept_code, 'seq', i.ord, 'points', i.points)
           ORDER BY i.ord)
    INTO v_qs
    FROM quiz_set_items i
    JOIN question_bank q ON q.id = i.question_id
   WHERE i.set_id = p_set_id AND q.is_active;

  RETURN jsonb_build_object(
    'set',       v_set.id,
    'title',     v_set.title,
    'kind',      v_set.kind,
    'grade',     v_set.grade,
    'subject',   v_set.subject,
    'unit',      v_set.unit_code,
    'show_result', v_set.show_result,
    'time_min',  v_set.time_min,
    'closed',    (v_set.closed_at IS NOT NULL),
    'reveal',    (v_teacher OR v_set.show_result = 'immediate' OR v_set.result_opened_at IS NOT NULL),
    'questions', COALESCE(v_qs, '[]'::jsonb)
  );
END $fn$;
GRANT EXECUTE ON FUNCTION get_quiz_set(uuid) TO authenticated;

-- [6] 교사 조작 — 결과 열기 / 마감 (자기 세트만)
CREATE OR REPLACE FUNCTION quiz_set_open_result(p_set_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  UPDATE quiz_sets SET result_opened_at = COALESCE(result_opened_at, now())
   WHERE id = p_set_id AND teacher_id = cw_my_teacher_id();
  RETURN FOUND;
END $fn$;
GRANT EXECUTE ON FUNCTION quiz_set_open_result(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION quiz_set_close(p_set_id uuid, p_close boolean DEFAULT true)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  UPDATE quiz_sets SET closed_at = CASE WHEN p_close THEN COALESCE(closed_at, now()) ELSE NULL END
   WHERE id = p_set_id AND teacher_id = cw_my_teacher_id();
  RETURN FOUND;
END $fn$;
GRANT EXECUTE ON FUNCTION quiz_set_close(uuid, boolean) TO authenticated;

-- 검산: SELECT column_name FROM information_schema.columns WHERE table_name='quiz_sets'
--         AND column_name IN ('result_opened_at','closed_at','target_student_ids','time_min');  → 4행
--       SELECT proname FROM pg_proc WHERE proname IN ('quiz_set_open_result','quiz_set_close');  → 2행
