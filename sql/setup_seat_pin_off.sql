-- =============================================================
-- 학생 비밀번호(PIN) 끄기 — 2026-09-04 준호 결정
--   "연수 전에 학생 비번은 되돌린다. 학급코드와 이름만 쳐서 들어가도록."
--   #40(setup_seat_pin.sql)에서 세운 문을 열어 두는 되돌림 조각이다.
--
-- 무엇이 바뀌나
--   ① claim_seat_v2(code, name, pin) 를 다시 만든다 — p_pin 은 받되 **무시**한다.
--      pin_setup · pin_required · pin_wrong · pin_locked 상태가 사라지므로,
--      화면(index.html)의 PIN 칸은 서버가 요구할 때만 열리는 구조라 자동으로 안 열린다.
--   ② 이미 정해 둔 해시를 지운다(student_seat_pins 비움) — 나중에 다시 켤 때
--      아이들이 옛 비밀번호를 기억할 리 없다. 표·열·함수는 남긴다.
--   ③ student_seats.pin_set_at / pin_reset_at 을 NULL 로 — 교사 명단 표식 정리.
--   ④ 기기 이동은 v1 처럼 막지 않고(taken) v2 처럼 옮긴다(rebound) — 이름만으로 들어오는
--      마당에 다른 태블릿을 잡았다고 못 들어가면 연수·수업에서 그대로 사고가 난다.
--      기록은 프로필에 달려 있으므로 user_id 만 옮기면 그대로 보존된다.
--
-- 되돌리기(다시 켜기): sql/setup_seat_pin.sql 을 한 번 더 실행하면 #40 상태로 돌아간다.
-- 재실행 안전. 의존: #40(setup_seat_pin.sql) · #35(seat_no) · setup_student_entry.sql
-- =============================================================

-- [1] 입장 함수 — PIN 무시
CREATE OR REPLACE FUNCTION claim_seat_v2(p_class_code text, p_nickname text, p_pin text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $fn$
DECLARE
  v_uid uuid; v_code text; v_nick text;
  v_class_id uuid; v_grade int; v_consent boolean; v_active boolean;
  v_seat_id uuid; v_claimed_by uuid;
  v_owner_uid uuid; v_owner_active boolean;
  v_cur_profile uuid; v_cur_active boolean;
  v_profile uuid; v_status text; v_rebound boolean := false;
  nf constant jsonb := jsonb_build_object('status','not_found','message','학급코드 또는 이름이 일치하지 않습니다');
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RETURN jsonb_build_object('status','no_session','message','인증 세션이 없습니다'); END IF;

  v_code := upper(btrim(coalesce(p_class_code,'')));
  v_nick := btrim(coalesce(p_nickname,''));
  IF length(v_code) < 4 OR length(v_code) > 12 THEN RETURN nf; END IF;
  IF length(v_nick) = 0 OR length(v_nick) > 20 THEN RETURN nf; END IF;
  -- p_pin 은 받기만 하고 쓰지 않는다(옛 화면이 보내도 그냥 통과).

  -- 학급(활성 + 동의) — 없음·비활성·미동의는 통합 오류(열거 방지)
  SELECT id, grade, consent_confirmed, is_active INTO v_class_id, v_grade, v_consent, v_active
    FROM class_codes WHERE code = v_code LIMIT 1;
  IF v_class_id IS NULL OR v_active IS NOT TRUE OR v_consent IS NOT TRUE THEN RETURN nf; END IF;

  -- 자리
  SELECT id, claimed_by INTO v_seat_id, v_claimed_by
    FROM student_seats WHERE class_code_id = v_class_id AND nickname = v_nick LIMIT 1;
  IF v_seat_id IS NULL THEN RETURN nf; END IF;

  -- 자리 주인(있으면)
  IF v_claimed_by IS NOT NULL THEN
    SELECT user_id, is_active INTO v_owner_uid, v_owner_active FROM student_profiles WHERE id = v_claimed_by;
    IF v_owner_uid IS NULL THEN RETURN nf; END IF;
    IF v_owner_active IS FALSE THEN
      RETURN jsonb_build_object('status','inactive','message','처리정지된 학생입니다. 담임 선생님께 문의하세요.');
    END IF;
  END IF;

  -- 이 기기가 이미 다른 학생 프로필을 들고 있으면 새 익명 세션이 필요하다(user_id UNIQUE)
  SELECT id, is_active INTO v_cur_profile, v_cur_active FROM student_profiles WHERE user_id = v_uid LIMIT 1;
  IF v_cur_profile IS NOT NULL AND v_cur_profile IS DISTINCT FROM v_claimed_by THEN
    IF v_claimed_by IS NULL AND v_cur_active IS NOT FALSE THEN
      -- 빈 자리 + 이 기기의 프로필 = 학급·자리 이동(v1 규칙 그대로 프로필을 옮긴다)
      UPDATE student_profiles SET nickname = v_nick, class_code_id = v_class_id, grade = v_grade, last_seen_at = now()
        WHERE id = v_cur_profile;
      UPDATE student_seats SET claimed_by = v_cur_profile, claimed_at = now() WHERE id = v_seat_id;
      RETURN jsonb_build_object('status','created','profile_id', v_cur_profile, 'nickname', v_nick,
                                'class_code_id', v_class_id, 'grade', v_grade, 'rebound', false);
    END IF;
    IF v_cur_active IS FALSE THEN
      RETURN jsonb_build_object('status','inactive','message','처리정지된 학생입니다. 담임 선생님께 문의하세요.');
    END IF;
    RETURN jsonb_build_object('status','fresh_session');   -- 화면이 새 익명 세션으로 다시 보낸다
  END IF;

  IF v_claimed_by IS NULL THEN
    INSERT INTO student_profiles (user_id, nickname, class_code_id, grade) VALUES (v_uid, v_nick, v_class_id, v_grade)
      RETURNING id INTO v_profile;
    UPDATE student_seats SET claimed_by = v_profile, claimed_at = now() WHERE id = v_seat_id;
    v_status := 'created';
  ELSE
    v_profile := v_claimed_by;
    IF v_owner_uid <> v_uid THEN
      UPDATE student_profiles SET user_id = v_uid, last_seen_at = now() WHERE id = v_profile;  -- 기기 이동, 기록 보존
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

-- [2] 정해 둔 비밀번호·표식 비우기 (표와 열은 남긴다 — 다시 켤 때 그대로 쓴다)
DELETE FROM student_seat_pins;
UPDATE student_seats SET pin_set_at = NULL, pin_reset_at = NULL
 WHERE pin_set_at IS NOT NULL OR pin_reset_at IS NOT NULL;

NOTIFY pgrst, 'reload schema';

-- 검산
--   SELECT count(*) FROM student_seat_pins;                                   → 0
--   SELECT count(*) FROM student_seats WHERE pin_set_at IS NOT NULL;          → 0
--   학생 화면에서 학급코드 + 이름만 넣고 입장 → 비밀번호 칸이 뜨지 않아야 한다.
