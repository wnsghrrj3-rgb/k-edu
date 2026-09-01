-- =============================================================
-- 관리 화면 개요 — admin_overview() 한 번 호출로 장부를 채운다 (2026-09-02)
--   화면: admin/index.html (학급 · 학습 기록 유입 · 처리할 것 · 점검)
--   원칙: SECURITY DEFINER + kedu_is_admin() 검사. 관리자가 아니면 예외.
--         RLS 가 교사 자기 학급으로 좁혀 둔 표(class_codes 등)를 관리자만 통째로 본다.
--   재실행 안전(OR REPLACE / IF NOT EXISTS). 의존: #23(kedu_is_admin), #25(class_openings),
--   #29(question_bank·quiz_sets), #31(report_* 뷰). 없는 표는 to_regclass 로 건너뛴다.
-- =============================================================

-- [1] 관리자는 class_codes 전체 읽기 (기존 교사 목록의 학급코드 열이 관리자 본인 것만 보이던 구멍)
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_codes' AND policyname = 'class_codes_admin_read') THEN
    CREATE POLICY "class_codes_admin_read" ON class_codes
      FOR SELECT USING (kedu_is_admin());
  END IF;
END $do$;

-- [2] 개요 RPC
CREATE OR REPLACE FUNCTION admin_overview()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v jsonb := '{}'::jsonb;
  v_classes jsonb;
  v_scores jsonb;
  v_todo jsonb;
  v_checks jsonb;
  v_has_open  boolean := to_regclass('public.class_openings') IS NOT NULL;
  v_has_qb    boolean := to_regclass('public.question_bank')  IS NOT NULL;
  v_has_dr    boolean := to_regclass('public.data_requests')  IS NOT NULL;
  v_has_psl   boolean := to_regclass('public.parent_student_links') IS NOT NULL;
  v_has_ma    boolean := to_regclass('public.ma_sessions')    IS NOT NULL;
BEGIN
  IF NOT kedu_is_admin() THEN
    RAISE EXCEPTION 'admin only';
  END IF;

  -- 학급 장부: 활성 학급 전부
  EXECUTE format($q$
    SELECT COALESCE(jsonb_agg(row_to_json(r)::jsonb ORDER BY r.last_activity DESC NULLS LAST, r.created_at DESC), '[]'::jsonb)
    FROM (
      SELECT cc.id, cc.code, cc.label, cc.grade, cc.consent_confirmed, cc.created_at,
             t.name AS teacher_name, t.school,
             (SELECT count(*) FROM student_profiles sp WHERE sp.class_code_id = cc.id)::int AS students,
             %s AS openings,
             (SELECT max(s.earned_at) FROM scores s JOIN student_profiles sp ON sp.id = s.student_id
               WHERE sp.class_code_id = cc.id) AS last_activity
      FROM class_codes cc
      LEFT JOIN teachers t ON t.id = cc.teacher_id
      WHERE cc.is_active = true
    ) r $q$,
    CASE WHEN v_has_open THEN '(SELECT count(*) FROM class_openings o WHERE o.class_code_id = cc.id)::int' ELSE '0' END)
  INTO v_classes;

  -- 학습 기록 유입 (scores)
  SELECT jsonb_build_object(
    'total',        (SELECT count(*) FROM scores),
    'first_at',     (SELECT min(earned_at) FROM scores),
    'last_at',      (SELECT max(earned_at) FROM scores),
    'rows_7d',      (SELECT count(*) FROM scores WHERE earned_at > now() - interval '7 days'),
    'students_7d',  (SELECT count(DISTINCT student_id) FROM scores WHERE earned_at > now() - interval '7 days'),
    'lessons_7d',   (SELECT count(DISTINCT lesson_id) FROM scores
                      WHERE earned_at > now() - interval '7 days'
                        AND lesson_id NOT LIKE 'ws:%' AND lesson_id NOT LIKE 'quiz:%'),
    'worksheets_7d',(SELECT count(DISTINCT lesson_id) FROM scores
                      WHERE earned_at > now() - interval '7 days'
                        AND (lesson_id LIKE 'ws:%' OR lesson_id LIKE 'quiz:%')),
    'morning_today', CASE WHEN v_has_ma THEN
                       (SELECT count(DISTINCT class_code_id) FROM ma_sessions
                         WHERE run_date = (now() AT TIME ZONE 'Asia/Seoul')::date) ELSE 0 END
  ) INTO v_scores;

  -- 처리할 것
  SELECT jsonb_build_object(
    'approvals_pending', (SELECT count(*) FROM teachers WHERE approval = 'pending'),
    'data_requests_pending', CASE WHEN v_has_dr THEN
        (SELECT count(*) FROM data_requests WHERE status IN ('pending','in_progress')) ELSE 0 END,
    'data_requests_overdue', CASE WHEN v_has_dr THEN
        (SELECT count(*) FROM data_requests WHERE status IN ('pending','in_progress')
           AND requested_at < now() - interval '10 days') ELSE 0 END,
    'parent_links_pending', CASE WHEN v_has_psl THEN
        (SELECT count(*) FROM parent_student_links WHERE verified_at IS NULL) ELSE 0 END,
    'classes_no_consent', (SELECT count(*) FROM class_codes WHERE is_active AND consent_confirmed = false)
  ) INTO v_todo;

  -- 점검: SQL 적용 상태 (있어야 할 객체)
  SELECT jsonb_build_object(
    'teacher_approval', to_regclass('public.edu_domains') IS NOT NULL,
    'auto_approve',     COALESCE((SELECT value = 'true'::jsonb FROM kedu_policy WHERE key = 'auto_approve_edu_domains'), false),
    'edu_domains',      (SELECT count(*) FROM edu_domains),
    'class_openings',   v_has_open,
    'worksheet_bank',   v_has_qb,
    'question_bank_rows', CASE WHEN v_has_qb THEN (SELECT count(*) FROM question_bank) ELSE 0 END,
    'quiz_sets',        CASE WHEN v_has_qb THEN (SELECT count(*) FROM quiz_sets) ELSE 0 END,
    'report_views',     to_regclass('public.report_concept_mastery') IS NOT NULL,
    'morning',          v_has_ma,
    'kmovie',           to_regclass('public.kmovie_projects') IS NOT NULL
  ) INTO v_checks;

  v := jsonb_build_object('classes', v_classes, 'scores', v_scores, 'todo', v_todo, 'checks', v_checks,
                          'at', now());
  RETURN v;
END $fn$;

REVOKE ALL ON FUNCTION admin_overview() FROM public;
GRANT EXECUTE ON FUNCTION admin_overview() TO authenticated;

-- 검산:
--   SELECT jsonb_pretty(admin_overview());            -- 관리자 계정으로. classes 배열 + scores.total 등
--   SELECT policyname FROM pg_policies WHERE tablename='class_codes' AND policyname='class_codes_admin_read';  → 1줄
