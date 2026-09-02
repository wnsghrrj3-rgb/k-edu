-- =============================================================
-- 연수 모드 (2026-09-02) — 연수장에서 준호가 병목이 되지 않게 한다.
--   문제: 수동 승인(#23·#32)에서는 연수 중 20~30명이 동시에 가입하면
--         준호가 /admin 을 붙들고 승인 버튼만 눌러야 한다.
--   해법: 「연수 코드」 — 칠판에 적어 주는 임시 코드. 이 코드로 가입하면 바로 열린다.
--         코드는 만료 시각이 있고, 준호가 /admin 에서 언제든 끈다. 상시 자동승인 스위치는 건드리지 않는다.
--   재실행 안전. 선행: setup_teacher_approval.sql(#23)
-- =============================================================

-- [1] 가입 순간에만 실어 보내는 코드 칸 (트리거가 즉시 비운다 — DB 에 남지 않는다)
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS signup_code text;
COMMENT ON COLUMN teachers.signup_code IS '가입 폼의 연수 코드. BEFORE INSERT 트리거가 판정 후 NULL 로 지운다.';

-- [2] 정책 행 — value 는 null 이거나 {"code":"...","until":"...","label":"..."}
INSERT INTO kedu_policy (key, value, note) VALUES
  ('training', 'null'::jsonb, '연수 코드. {"code","until","label"} 이고 until 이 지나면 자동으로 꺼진다. /admin 연수 모드에서 켠다.')
ON CONFLICT (key) DO NOTHING;

-- [3] 지금 살아 있는 연수 코드 (없으면 NULL)
CREATE OR REPLACE FUNCTION kedu_training_active()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT CASE
           WHEN jsonb_typeof(value) = 'object'
            AND length(COALESCE(value->>'code','')) >= 4
            AND (value->>'until')::timestamptz > now()
           THEN value
         END
    FROM kedu_policy WHERE key = 'training';
$fn$;

-- [4] 트리거 ① 재정의 — 교육청 자동승인 판정 뒤에 연수 코드 판정을 얹는다
CREATE OR REPLACE FUNCTION _teachers_set_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_email text;
  v_auto  boolean;
  v_train jsonb;
  v_code  text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
  SELECT COALESCE((value = 'true'::jsonb), false) INTO v_auto
    FROM kedu_policy WHERE key = 'auto_approve_edu_domains';

  NEW.is_admin    := false;          -- 가입으로 관리자가 되는 길은 없다
  NEW.approved_by := NULL;

  v_code  := upper(btrim(COALESCE(NEW.signup_code, '')));
  v_train := kedu_training_active();

  IF v_auto IS TRUE AND v_email IS NOT NULL AND kedu_email_is_edu(v_email) THEN
    NEW.approval    := 'auto';
    NEW.approved_at := now();
  ELSIF v_train IS NOT NULL AND v_code <> '' AND v_code = upper(btrim(v_train->>'code')) THEN
    NEW.approval    := 'auto';
    NEW.approved_at := now();
    NEW.approval_note := left(COALESCE(NULLIF(NEW.approval_note,''), '') ||
                              '[연수] ' || COALESCE(v_train->>'label','연수 코드로 가입'), 200);
  ELSE
    NEW.approval    := 'pending';
    NEW.approved_at := NULL;
  END IF;

  NEW.signup_code := NULL;           -- 코드는 저장하지 않는다
  RETURN NEW;
END;
$fn$;

-- [5] 트리거 ② 보강 — 연수 코드 청구(아래 [6])만 예외로 통과시킨다.
--     세션 GUC 는 PostgREST 로 들어오는 클라이언트가 세울 수 없다(트랜잭션 지역 설정).
CREATE OR REPLACE FUNCTION _teachers_protect_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF current_setting('kedu.training_claim', true) = 'on' THEN
    RETURN NEW;                      -- claim_training_code() 안에서만 켜진다(트랜잭션 지역)
  END IF;
  IF auth.uid() IS NULL OR kedu_is_admin() THEN
    -- 관리자 승인/반려 시각·주체 자동 기록 (#23 원본 그대로)
    IF NEW.approval IS DISTINCT FROM OLD.approval THEN
      IF NEW.approval IN ('approved','auto') THEN
        NEW.approved_at := now();
        NEW.approved_by := auth.uid();
      ELSE
        NEW.approved_at := NULL;
        NEW.approved_by := NULL;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  NEW.approval    := OLD.approval;
  NEW.approved_at := OLD.approved_at;
  NEW.approved_by := OLD.approved_by;
  NEW.is_admin    := OLD.is_admin;
  NEW.user_id     := OLD.user_id;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_teachers_protect_approval ON teachers;
CREATE TRIGGER trg_teachers_protect_approval
  BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION _teachers_protect_approval();

-- [6] 이미 가입한 대기 교사가 뒤늦게 코드를 받았을 때 (교사 대시보드 배너)
CREATE OR REPLACE FUNCTION claim_training_code(p_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_train jsonb;
  v_n     int := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'login required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  v_train := kedu_training_active();
  IF v_train IS NULL THEN RETURN false; END IF;
  IF upper(btrim(COALESCE(p_code,''))) <> upper(btrim(v_train->>'code')) THEN RETURN false; END IF;

  PERFORM set_config('kedu.training_claim', 'on', true);
  UPDATE teachers
     SET approval = 'auto',
         approved_at = now(),
         approval_note = left(COALESCE(NULLIF(approval_note,''),'') || ' [연수] ' ||
                              COALESCE(v_train->>'label','연수 코드'), 200)
   WHERE user_id = auth.uid() AND approval IN ('pending','rejected');
  GET DIAGNOSTICS v_n = ROW_COUNT;
  PERFORM set_config('kedu.training_claim', 'off', true);
  RETURN v_n > 0;
END;
$fn$;
GRANT EXECUTE ON FUNCTION claim_training_code(text) TO authenticated;

-- [7] 관리자 — 연수 코드 켜기/끄기/읽기
CREATE OR REPLACE FUNCTION admin_set_training(p_code text, p_hours int DEFAULT 8, p_label text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v jsonb;
BEGIN
  IF NOT kedu_is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF length(btrim(COALESCE(p_code,''))) < 4 THEN
    RAISE EXCEPTION '연수 코드는 4자 이상이어야 합니다';
  END IF;
  v := jsonb_build_object(
         'code',  upper(btrim(p_code)),
         'until', to_jsonb((now() + make_interval(hours => greatest(1, least(p_hours, 72))))::text),
         'label', left(COALESCE(p_label,''), 40));
  UPDATE kedu_policy SET value = v, updated_at = now() WHERE key = 'training';
  RETURN v;
END;
$fn$;
GRANT EXECUTE ON FUNCTION admin_set_training(text, int, text) TO authenticated;

CREATE OR REPLACE FUNCTION admin_clear_training()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NOT kedu_is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  UPDATE kedu_policy SET value = 'null'::jsonb, updated_at = now() WHERE key = 'training';
END;
$fn$;
GRANT EXECUTE ON FUNCTION admin_clear_training() TO authenticated;

CREATE OR REPLACE FUNCTION admin_training_status()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NOT kedu_is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN COALESCE(kedu_training_active(), 'null'::jsonb);
END;
$fn$;
GRANT EXECUTE ON FUNCTION admin_training_status() TO authenticated;

-- [8] 관리자 — 대기 중인 교사 일괄 승인 (연수 뒤 한 번에 처리)
CREATE OR REPLACE FUNCTION admin_approve_all_pending()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_n int;
BEGIN
  IF NOT kedu_is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  UPDATE teachers
     SET approval = 'approved', approved_at = now(), approved_by = auth.uid()
   WHERE approval = 'pending';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RETURN v_n;
END;
$fn$;
GRANT EXECUTE ON FUNCTION admin_approve_all_pending() TO authenticated;

-- =============================================================
-- 검산
--   SELECT kedu_training_active();                       -- NULL (아직 안 켬)
--   SELECT admin_set_training('금성2026', 8, '금성초 연수');  -- SQL Editor 에선 admin only 예외가 정상, 화면에서 켠다
--   SELECT column_name FROM information_schema.columns WHERE table_name='teachers' AND column_name='signup_code';
-- =============================================================
