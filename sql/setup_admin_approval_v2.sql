-- =============================================
-- #58 admin_set_teacher_approval v2 — 결과를 돌려준다 (2026-10-16)
-- 준호 보고: /admin 에서 「승인」이 안 눌러진다(아무 반응 없음).
-- 종전 RPC 는 RETURNS void 라 UPDATE 가 0행이거나 트리거가 되돌려도 화면이 「승인했어요」만 띄웠다.
-- v2 = 같은 본문 + 처리 뒤 실제 approval 과 영향 행 수를 jsonb 로 반환 → 화면이 대조해 정직하게 말한다.
-- 선행 #23(kedu_is_admin, teachers.approval). 재실행 안전(반환형 변경 → DROP 뒤 CREATE).
-- =============================================
BEGIN;

DROP FUNCTION IF EXISTS admin_set_teacher_approval(uuid, text);

CREATE OR REPLACE FUNCTION admin_set_teacher_approval(p_teacher_id uuid, p_status text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_n int := 0; v_after text; v_uid uuid;
BEGIN
  IF NOT kedu_is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_status NOT IN ('approved','rejected','pending') THEN
    RAISE EXCEPTION 'bad status: %', p_status USING ERRCODE = 'check_violation';
  END IF;
  UPDATE teachers
     SET approval    = p_status,
         approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE NULL END,
         approved_by = CASE WHEN p_status = 'approved' THEN auth.uid() ELSE NULL END
   WHERE id = p_teacher_id;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  SELECT approval, user_id INTO v_after, v_uid FROM teachers WHERE id = p_teacher_id;
  RETURN jsonb_build_object(
    'ok', v_n > 0 AND v_after = p_status,
    'rows', v_n,
    'approval', v_after,
    'has_user', v_uid IS NOT NULL
  );
END;
$fn$;
GRANT EXECUTE ON FUNCTION admin_set_teacher_approval(uuid, text) TO authenticated;

COMMIT;

-- 검산: SELECT pg_get_function_result('admin_set_teacher_approval(uuid,text)'::regprocedure);  → jsonb
-- 미적용이면 화면은 종전(void) 응답을 받아 재조회로 대조한다 — 깨지지 않는다.
