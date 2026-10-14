-- =============================================
-- setup_admin_seed.sql — 케이학습지 시드를 화면에서 넣는 RPC (2026-10-14)
--   화면: admin/seed.html — 단추 하나로 kedu/worksheet/data/*.json 을 원장에 UPSERT.
--   이유: 시드 SQL 46개(16MB)는 SQL 편집기 크기 제한에 걸려 손으로 못 넣는다.
--   원칙: SECURITY DEFINER + kedu_is_admin() 검사. 관리자가 아니면 예외. 재실행 안전(OR REPLACE).
--   의존: setup_worksheet_bank.sql · #23(kedu_is_admin)
-- =============================================
CREATE OR REPLACE FUNCTION admin_seed_rows(p_concepts jsonb DEFAULT '[]', p_mis jsonb DEFAULT '[]', p_questions jsonb DEFAULT '[]')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE nc int := 0; nm int := 0; nq int := 0;
BEGIN
  IF NOT kedu_is_admin() THEN RAISE EXCEPTION '관리자만 시드를 넣을 수 있어요'; END IF;

  INSERT INTO concepts (code, subject, grade, semester, unit_code, lesson_no, name, achievement_codes, ord)
  SELECT x.code, x.subject, x.grade, x.semester, x.unit_code, x.lesson_no, x.name, COALESCE(x.achievement_codes, '{}'), COALESCE(x.ord, 0)
  FROM jsonb_to_recordset(p_concepts) AS x(code text, subject text, grade int, semester int, unit_code text, lesson_no int, name text, achievement_codes text[], ord int)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, lesson_no = EXCLUDED.lesson_no,
    achievement_codes = EXCLUDED.achievement_codes, ord = EXCLUDED.ord, is_active = true;
  GET DIAGNOSTICS nc = ROW_COUNT;

  INSERT INTO misconceptions (code, subject, grade, unit_code, concept_codes, title, teacher_hint)
  SELECT x.code, x.subject, x.grade, x.unit_code, COALESCE(x.concept_codes, '{}'), x.title, COALESCE(x.teacher_hint, '')
  FROM jsonb_to_recordset(p_mis) AS x(code text, subject text, grade int, unit_code text, concept_codes text[], title text, teacher_hint text)
  ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, teacher_hint = EXCLUDED.teacher_hint, concept_codes = EXCLUDED.concept_codes;
  GET DIAGNOSTICS nm = ROW_COUNT;

  INSERT INTO question_bank (qcode, subject, grade, semester, unit_code, lesson_code, source_set, source_kind, concept_code,
                             difficulty, qkind, grading, stem, misconception_codes, has_variant, payload)
  SELECT x.qcode, x.subject, x.grade, x.semester, x.unit_code, x.lesson_code, x.source_set, x.source_kind, x.concept_code,
         x.difficulty, x.qkind, COALESCE(x.grading, 'auto'), COALESCE(x.stem, ''), COALESCE(x.misconception_codes, '{}'),
         COALESCE(x.has_variant, false), x.payload
  FROM jsonb_to_recordset(p_questions) AS x(qcode text, subject text, grade int, semester int, unit_code text, lesson_code text,
         source_set text, source_kind text, concept_code text, difficulty int, qkind text, grading text, stem text,
         misconception_codes text[], has_variant boolean, payload jsonb)
  ON CONFLICT (qcode) DO UPDATE SET concept_code = EXCLUDED.concept_code, difficulty = EXCLUDED.difficulty,
    qkind = EXCLUDED.qkind, grading = EXCLUDED.grading, stem = EXCLUDED.stem,
    misconception_codes = EXCLUDED.misconception_codes, has_variant = EXCLUDED.has_variant,
    payload = EXCLUDED.payload, is_active = true;
  GET DIAGNOSTICS nq = ROW_COUNT;

  RETURN jsonb_build_object('concepts', nc, 'misconceptions', nm, 'questions', nq);
END $$;
REVOKE ALL ON FUNCTION admin_seed_rows(jsonb, jsonb, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION admin_seed_rows(jsonb, jsonb, jsonb) TO authenticated;

-- 현황: SELECT grade, semester, subject, unit_code, count(*) FROM question_bank WHERE is_active GROUP BY 1,2,3,4 ORDER BY 1,2,3,4;
