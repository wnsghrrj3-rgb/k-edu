-- =============================================
-- setup_owner_protect.sql  (#54 — 2026-09-09)
-- 준호 결정: 주인 계정 wnsghrrj@sen.go.kr 은 어떤 경로로도 삭제·강등되지 않는다.
--   · auth.users 행 삭제 차단 (대시보드 Users 에서 지워도 트리거가 막는다)
--   · teachers 행 삭제 차단
--   · teachers 행에서 is_admin=false / approval≠approved 로 내리는 UPDATE 차단
--   · admin_delete_teacher 에도 명시 검사 (트리거 이전에 사람이 읽을 메시지)
-- 재실행 안전.
-- =============================================
BEGIN;

CREATE OR REPLACE FUNCTION kedu_owner_email() RETURNS text
LANGUAGE sql IMMUTABLE AS $$ SELECT 'wnsghrrj@sen.go.kr'::text $$;

CREATE OR REPLACE FUNCTION _protect_owner_auth() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF lower(OLD.email) = kedu_owner_email() THEN
    RAISE EXCEPTION '주인 계정(%)은 삭제할 수 없습니다', OLD.email USING ERRCODE = 'check_violation';
  END IF;
  RETURN OLD;
END; $fn$;
DROP TRIGGER IF EXISTS trg_protect_owner_auth ON auth.users;
CREATE TRIGGER trg_protect_owner_auth BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION _protect_owner_auth();

CREATE OR REPLACE FUNCTION _protect_owner_teacher() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_email text;
BEGIN
  SELECT lower(email) INTO v_email FROM auth.users WHERE id = OLD.user_id;
  IF v_email IS DISTINCT FROM kedu_owner_email() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION '주인 계정의 교사 행은 삭제할 수 없습니다' USING ERRCODE = 'check_violation';
  END IF;
  -- UPDATE: 관리자·승인은 내리지 못한다, user_id 도 못 바꾼다
  NEW.is_admin := true;
  NEW.approval := 'approved';
  NEW.user_id  := OLD.user_id;
  RETURN NEW;
END; $fn$;
DROP TRIGGER IF EXISTS trg_protect_owner_teacher ON teachers;
CREATE TRIGGER trg_protect_owner_teacher BEFORE DELETE OR UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION _protect_owner_teacher();

-- admin_delete_teacher — 사람이 읽을 메시지로 먼저 막는다 (#53 본문 + 주인 검사)
CREATE OR REPLACE FUNCTION admin_delete_teacher(p_teacher_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_uid uuid; v_admin boolean; v_classes int; v_email text;
BEGIN
  IF NOT kedu_is_admin() THEN RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege'; END IF;
  SELECT user_id, coalesce(is_admin,false) INTO v_uid, v_admin FROM teachers WHERE id = p_teacher_id;
  IF v_uid IS NULL THEN RAISE EXCEPTION 'no such teacher' USING ERRCODE = 'no_data_found'; END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  IF lower(v_email) = kedu_owner_email() THEN RAISE EXCEPTION '주인 계정은 삭제할 수 없습니다' USING ERRCODE = 'check_violation'; END IF;
  IF v_uid = auth.uid() THEN RAISE EXCEPTION '자기 자신은 삭제할 수 없습니다' USING ERRCODE = 'check_violation'; END IF;
  IF v_admin THEN RAISE EXCEPTION '관리자 계정은 삭제할 수 없습니다 (먼저 관리자 해제)' USING ERRCODE = 'check_violation'; END IF;
  SELECT count(*) INTO v_classes FROM class_codes WHERE teacher_id = p_teacher_id;
  IF v_classes > 0 THEN
    RAISE EXCEPTION '학급코드 %개가 있는 교사는 삭제할 수 없습니다 — 학생 기록이 딸려 있어요. 잠그려면 「반려」를 쓰세요', v_classes USING ERRCODE = 'check_violation';
  END IF;
  DELETE FROM auth.users WHERE id = v_uid;
  DELETE FROM teachers WHERE id = p_teacher_id;
  RETURN jsonb_build_object('deleted', true, 'email', v_email);
END; $fn$;

COMMIT;

-- 검산: SELECT tgname FROM pg_trigger WHERE tgname IN ('trg_protect_owner_auth','trg_protect_owner_teacher');  → 2행
-- 역검증(실패해야 정상): DELETE FROM teachers WHERE user_id = (SELECT id FROM auth.users WHERE email='wnsghrrj@sen.go.kr');  → 예외
