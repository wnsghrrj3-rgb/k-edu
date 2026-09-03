-- =============================================================
-- 학생 비밀번호(4자리 PIN) — 2026-09-03 준호 결정
--   "이름까지만 쓰면 다른 사람이 무단으로 들어갈 수 있으니 각자 비밀번호도 설정해야 해"
--   결정: 4자리 숫자 · 학생이 첫 접속 때 직접 정한다 · 잊으면 담임이 명단에서 초기화
--
-- 구조
--   student_seat_pins(seat_id PK, pin_hash, fail_n, locked_until)  ← RLS 켜고 정책 0 = RPC 전용
--     · 해시(bcrypt)는 이 표에만 있고 어떤 화면도 읽지 못한다(교사도). 4자리는 표만 보면 금방 뒤집히기 때문.
--   student_seats.pin_set_at / pin_reset_at  ← 교사 명단이 보는 상태(🔒 있음 / 초기화됨 / 아직)
--   claim_seat_v2(code, name, pin)  ← 학생 입장의 유일한 문. claim_seat(v1)은 REVOKE — 이름만으로 못 들어온다.
--   reset_seat_pin(seat_id)          ← 담임(승인 교사, 본인 학급)만
--
-- 흐름(서버가 상태로 말하고 화면은 그대로 따른다)
--   pin_setup    : 아직 비밀번호 없음(첫 접속·초기화 뒤) → 학생이 4자리를 정해 다시 보낸다
--   pin_required : 비밀번호 있음 → 넣어서 다시 보낸다
--   pin_wrong    : 틀림(left = 남은 횟수). 5회 틀리면 5분 잠금(pin_locked, wait_sec)
--   fresh_session: 이 기기의 익명 세션이 다른 학생 것 → 화면이 새 익명 세션을 만들어 같은 값으로 다시 보낸다
--                  (서버는 아무것도 쓰지 않은 상태에서 돌려보낸다)
--   taken        : 다른 기기에 묶인 자리인데 비밀번호가 아직 없다(옛 좌석) → 담임 초기화 뒤 그 기기에서 정한다
--   created / reclaim : 통과. 다른 기기였으면 프로필의 user_id 를 이 기기로 옮긴다(rebound=true) — 기록은 그대로.
--
-- 동의 규칙은 v1 그대로(미동의 학급은 not_found, 좌석·프로필은 트리거 가드). 게스트(이름 없음) 입장은 무관.
-- 재실행 안전. 의존: setup_student_entry.sql(claim_seat·my_seat_class) · setup_seat_no.sql · setup_teacher_approval.sql(kedu_teacher_approved)
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- [1] 표
CREATE TABLE IF NOT EXISTS student_seat_pins (
  seat_id      uuid PRIMARY KEY REFERENCES student_seats(id) ON DELETE CASCADE,
  pin_hash     text NOT NULL,
  fail_n       int  NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE student_seat_pins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON student_seat_pins FROM anon, authenticated;
-- 정책 0 — 읽기·쓰기 전부 아래 RPC(SECURITY DEFINER)만 지난다.

ALTER TABLE student_seats ADD COLUMN IF NOT EXISTS pin_set_at   timestamptz;
ALTER TABLE student_seats ADD COLUMN IF NOT EXISTS pin_reset_at timestamptz;

-- [2] 학생 입장 v2 — 학급코드 + 이름 + PIN
CREATE OR REPLACE FUNCTION claim_seat_v2(p_class_code text, p_nickname text, p_pin text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $fn$
DECLARE
  v_uid uuid; v_code text; v_nick text; v_pin text;
  v_class_id uuid; v_grade int; v_consent boolean; v_active boolean;
  v_seat_id uuid; v_claimed_by uuid; v_reset_at timestamptz;
  v_owner_uid uuid; v_owner_active boolean;
  v_cur_profile uuid; v_cur_active boolean;
  v_hash text; v_fail int; v_locked timestamptz;
  v_has_pin boolean; v_may_set boolean; v_need_fresh boolean;
  v_profile uuid; v_status text; v_rebound boolean := false;
  c_max_fail constant int := 5; c_lock constant interval := '5 minutes';
  nf constant jsonb := jsonb_build_object('status','not_found','message','학급코드 또는 이름이 일치하지 않습니다');
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RETURN jsonb_build_object('status','no_session','message','인증 세션이 없습니다'); END IF;

  v_code := upper(btrim(coalesce(p_class_code,'')));
  v_nick := btrim(coalesce(p_nickname,''));
  v_pin  := NULLIF(regexp_replace(coalesce(p_pin,''), '\D', '', 'g'), '');
  IF length(v_code) < 4 OR length(v_code) > 12 THEN RETURN nf; END IF;
  IF length(v_nick) = 0 OR length(v_nick) > 20 THEN RETURN nf; END IF;
  IF v_pin IS NOT NULL AND v_pin !~ '^[0-9]{4}$' THEN
    RETURN jsonb_build_object('status','pin_invalid','message','비밀번호는 숫자 4자리예요');
  END IF;

  -- 학급(활성 + 동의) — 없음·비활성·미동의는 통합 오류(열거 방지)
  SELECT id, grade, consent_confirmed, is_active INTO v_class_id, v_grade, v_consent, v_active
    FROM class_codes WHERE code = v_code LIMIT 1;
  IF v_class_id IS NULL OR v_active IS NOT TRUE OR v_consent IS NOT TRUE THEN RETURN nf; END IF;

  -- 자리
  SELECT id, claimed_by, pin_reset_at INTO v_seat_id, v_claimed_by, v_reset_at
    FROM student_seats WHERE class_code_id = v_class_id AND nickname = v_nick LIMIT 1;
  IF v_seat_id IS NULL THEN RETURN nf; END IF;

  -- 자리 주인(있으면)
  IF v_claimed_by IS NOT NULL THEN
    SELECT user_id, is_active INTO v_owner_uid, v_owner_active FROM student_profiles WHERE id = v_claimed_by;
    IF v_owner_uid IS NULL THEN RETURN nf; END IF;   -- FK 깨짐(사실상 없음)
    IF v_owner_active IS FALSE THEN
      RETURN jsonb_build_object('status','inactive','message','처리정지된 학생입니다. 담임 선생님께 문의하세요.');
    END IF;
  END IF;

  -- 이 기기(uid)가 이미 들고 있는 프로필 — 다른 학생 것이면 새 세션이 필요하다(user_id UNIQUE)
  SELECT id, is_active INTO v_cur_profile, v_cur_active FROM student_profiles WHERE user_id = v_uid LIMIT 1;
  v_need_fresh := (v_cur_profile IS NOT NULL AND v_cur_profile IS DISTINCT FROM v_claimed_by);

  -- PIN 상태
  SELECT pin_hash, fail_n, locked_until INTO v_hash, v_fail, v_locked FROM student_seat_pins WHERE seat_id = v_seat_id;
  v_has_pin := v_hash IS NOT NULL;

  IF v_has_pin THEN
    IF v_locked IS NOT NULL AND v_locked > now() THEN
      RETURN jsonb_build_object('status','pin_locked','wait_sec', ceil(extract(epoch FROM (v_locked - now())))::int,
                                'message','비밀번호를 여러 번 틀려서 잠시 잠겼어요. 조금 뒤에 다시 해 보세요.');
    END IF;
    IF v_pin IS NULL THEN RETURN jsonb_build_object('status','pin_required'); END IF;
    IF crypt(v_pin, v_hash) <> v_hash THEN
      v_fail := coalesce(v_fail,0) + 1;
      IF v_fail >= c_max_fail THEN
        UPDATE student_seat_pins SET fail_n = 0, locked_until = now() + c_lock, updated_at = now() WHERE seat_id = v_seat_id;
        RETURN jsonb_build_object('status','pin_locked','wait_sec', extract(epoch FROM c_lock)::int,
                                  'message','비밀번호를 5번 틀려서 5분 동안 잠겼어요. 잊었으면 담임 선생님께 초기화를 부탁하세요.');
      END IF;
      UPDATE student_seat_pins SET fail_n = v_fail, updated_at = now() WHERE seat_id = v_seat_id;
      RETURN jsonb_build_object('status','pin_wrong','left', c_max_fail - v_fail,
                                'message','비밀번호가 달라요. 다시 넣어 보세요.');
    END IF;
    IF v_need_fresh THEN RETURN jsonb_build_object('status','fresh_session'); END IF;
    IF v_fail > 0 OR v_locked IS NOT NULL THEN
      UPDATE student_seat_pins SET fail_n = 0, locked_until = NULL, updated_at = now() WHERE seat_id = v_seat_id;
    END IF;
  ELSE
    -- 아직 비밀번호 없음: 정할 수 있는 사람 = 빈 자리 · 같은 기기 · 담임이 초기화한 자리
    v_may_set := (v_claimed_by IS NULL) OR (v_owner_uid = v_uid) OR (v_reset_at IS NOT NULL);
    IF NOT v_may_set THEN
      RETURN jsonb_build_object('status','taken',
        'message','다른 기기에서 쓰고 있는 이름이에요. 담임 선생님께 비밀번호 초기화를 부탁하세요.');
    END IF;
    IF v_pin IS NULL THEN RETURN jsonb_build_object('status','pin_setup'); END IF;
    IF v_need_fresh THEN RETURN jsonb_build_object('status','fresh_session'); END IF;
    INSERT INTO student_seat_pins (seat_id, pin_hash) VALUES (v_seat_id, crypt(v_pin, gen_salt('bf', 10)))
      ON CONFLICT (seat_id) DO UPDATE SET pin_hash = EXCLUDED.pin_hash, fail_n = 0, locked_until = NULL, updated_at = now();
    UPDATE student_seats SET pin_set_at = now(), pin_reset_at = NULL WHERE id = v_seat_id;
  END IF;

  -- 여기부터는 통과. 자리와 이 기기를 묶는다.
  IF v_claimed_by IS NULL THEN
    IF v_cur_profile IS NOT NULL THEN
      -- (v_need_fresh 가 false 이므로) 있을 수 없는 조합 — 방어
      RETURN jsonb_build_object('status','fresh_session');
    END IF;
    INSERT INTO student_profiles (user_id, nickname, class_code_id, grade) VALUES (v_uid, v_nick, v_class_id, v_grade)
      RETURNING id INTO v_profile;
    UPDATE student_seats SET claimed_by = v_profile, claimed_at = now() WHERE id = v_seat_id;
    v_status := 'created';
  ELSE
    v_profile := v_claimed_by;
    IF v_owner_uid <> v_uid THEN
      -- 다른 기기였다: 프로필을 이 기기로 옮긴다(기록은 프로필에 달려 있으니 그대로)
      UPDATE student_profiles SET user_id = v_uid, last_seen_at = now() WHERE id = v_profile;
      v_rebound := true;
    ELSE
      UPDATE student_profiles SET last_seen_at = now() WHERE id = v_profile;
    END IF;
    v_status := 'reclaim';
  END IF;

  RETURN jsonb_build_object('status', v_status, 'profile_id', v_profile, 'nickname', v_nick,
                            'class_code_id', v_class_id, 'grade', v_grade, 'rebound', v_rebound);
END $fn$;
REVOKE ALL ON FUNCTION claim_seat_v2(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION claim_seat_v2(text, text, text) TO authenticated;

-- v1(이름만) 문은 닫는다 — 비밀번호를 우회할 수 없게. 정의는 남겨 둔다(v2 가 잘못되면 GRANT 한 줄로 되돌림).
REVOKE EXECUTE ON FUNCTION claim_seat(text, text) FROM authenticated, anon, public;

-- [3] 담임 초기화
CREATE OR REPLACE FUNCTION reset_seat_pin(p_seat_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_nick text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'reset_seat_pin: 로그인 필요'; END IF;
  IF NOT kedu_teacher_approved() THEN RAISE EXCEPTION 'reset_seat_pin: 교사 확인 후 쓸 수 있습니다'; END IF;
  SELECT ss.nickname INTO v_nick
    FROM student_seats ss JOIN class_codes cc ON cc.id = ss.class_code_id JOIN teachers t ON t.id = cc.teacher_id
   WHERE ss.id = p_seat_id AND t.user_id = auth.uid();
  IF v_nick IS NULL THEN RAISE EXCEPTION 'reset_seat_pin: 본인 학급 자리가 아닙니다'; END IF;
  DELETE FROM student_seat_pins WHERE seat_id = p_seat_id;
  UPDATE student_seats SET pin_set_at = NULL, pin_reset_at = now() WHERE id = p_seat_id;
  RETURN jsonb_build_object('status','ok','nickname', v_nick);
END $fn$;
REVOKE ALL ON FUNCTION reset_seat_pin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION reset_seat_pin(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';

-- 검산
--   SELECT count(*) FROM pg_policies WHERE tablename='student_seat_pins';                       → 0 (정책 없음 = RPC 전용)
--   SELECT proname FROM pg_proc WHERE proname IN ('claim_seat_v2','reset_seat_pin');              → 2행
--   SELECT column_name FROM information_schema.columns WHERE table_name='student_seats' AND column_name IN ('pin_set_at','pin_reset_at'); → 2행
--   SELECT has_function_privilege('authenticated','claim_seat(text,text)','EXECUTE');             → false (v1 닫힘)
--   기존 학생(준호 반 6명): 다음 접속 때 같은 기기면 pin_setup → 정하고 들어감. 다른 기기면 taken → 명단에서 초기화.
