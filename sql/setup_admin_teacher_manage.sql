-- =============================================
-- setup_admin_teacher_manage.sql  (#53 — 2026-09-09)
-- 관리 화면(/admin)에서 교사 계정을 준호가 직접 수정·삭제·비밀번호 초기화 (준호 요구 09-09).
--   admin_update_teacher(teacher, name, school)   이름·학교 글자 수정 (학교 지정은 기존 admin_set_teacher_school)
--   admin_set_teacher_password(teacher, pw)       비밀번호 초기화 — 확인 메일을 껐으니 「비밀번호 찾기」 대신 준호가 대신 정해 준다
--   admin_delete_teacher(teacher)                 계정 삭제 — auth.users 행을 지우면 teachers 는 FK CASCADE 로 함께 지워진다
-- 안전장치: 관리자만 · 자기 자신은 삭제 불가 · 다른 관리자는 삭제 불가 ·
--           **학급코드가 있는 교사는 삭제 거부**(class_codes.teacher_id 가 NO ACTION — 학생 기록이 딸려 있다. 잠그려면 「반려」).
-- 재실행 안전. 선행 #23(kedu_is_admin). pgcrypto(#40) 없으면 여기서 보장.
-- =============================================
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION admin_update_teacher(p_teacher_id uuid, p_name text, p_school text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NOT kedu_is_admin() THEN RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF p_name IS NULL OR length(btrim(p_name)) = 0 THEN RAISE EXCEPTION '이름이 비어 있습니다' USING ERRCODE = 'check_violation'; END IF;
  UPDATE teachers SET name = btrim(p_name), school = coalesce(btrim(p_school), school) WHERE id = p_teacher_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'no such teacher' USING ERRCODE = 'no_data_found'; END IF;
END; $fn$;
REVOKE ALL ON FUNCTION admin_update_teacher(uuid, text, text) FROM public;
GRANT EXECUTE ON FUNCTION admin_update_teacher(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION admin_set_teacher_password(p_teacher_id uuid, p_password text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $fn$
DECLARE v_uid uuid;
BEGIN
  IF NOT kedu_is_admin() THEN RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF p_password IS NULL OR length(p_password) < 6 THEN RAISE EXCEPTION '비밀번호는 6자 이상' USING ERRCODE = 'check_violation'; END IF;
  SELECT user_id INTO v_uid FROM teachers WHERE id = p_teacher_id;
  IF v_uid IS NULL THEN RAISE EXCEPTION 'no such teacher' USING ERRCODE = 'no_data_found'; END IF;
  UPDATE auth.users SET encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now() WHERE id = v_uid;
END; $fn$;
REVOKE ALL ON FUNCTION admin_set_teacher_password(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION admin_set_teacher_password(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION admin_delete_teacher(p_teacher_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_uid uuid; v_admin boolean; v_classes int; v_email text;
BEGIN
  IF NOT kedu_is_admin() THEN RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege'; END IF;
  SELECT user_id, coalesce(is_admin,false) INTO v_uid, v_admin FROM teachers WHERE id = p_teacher_id;
  IF v_uid IS NULL THEN RAISE EXCEPTION 'no such teacher' USING ERRCODE = 'no_data_found'; END IF;
  IF v_uid = auth.uid() THEN RAISE EXCEPTION '자기 자신은 삭제할 수 없습니다' USING ERRCODE = 'check_violation'; END IF;
  IF v_admin THEN RAISE EXCEPTION '관리자 계정은 삭제할 수 없습니다 (먼저 관리자 해제)' USING ERRCODE = 'check_violation'; END IF;
  SELECT count(*) INTO v_classes FROM class_codes WHERE teacher_id = p_teacher_id;
  IF v_classes > 0 THEN
    RAISE EXCEPTION '학급코드 %개가 있는 교사는 삭제할 수 없습니다 — 학생 기록이 딸려 있어요. 잠그려면 「반려」를 쓰세요', v_classes USING ERRCODE = 'check_violation';
  END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;   -- teachers.user_id ON DELETE CASCADE
  DELETE FROM teachers WHERE id = p_teacher_id;   -- 혹시 CASCADE 가 없는 구버전 대비(이미 지워졌으면 0행)
  RETURN jsonb_build_object('deleted', true, 'email', v_email);
END; $fn$;
REVOKE ALL ON FUNCTION admin_delete_teacher(uuid) FROM public;
GRANT EXECUTE ON FUNCTION admin_delete_teacher(uuid) TO authenticated;

COMMIT;

-- 검산: SELECT proname FROM pg_proc WHERE proname IN ('admin_update_teacher','admin_set_teacher_password','admin_delete_teacher');  → 3행
