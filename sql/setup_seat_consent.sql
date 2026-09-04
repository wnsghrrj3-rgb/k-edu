-- =============================================
-- K-edu #42 — 학생별 학부모 동의(student_seats.consent)
-- 준호 결정(2026-09-04): 저장형 학급 안에서도 학생마다 나눈다.
--   동의 O → 학급코드+이름으로 입장, 학습 기록 저장(종전 그대로)
--   동의 X → 같은 코드·이름으로 들어와도 게스트(구경)만: 프로필·기록 아무것도 만들지 않는다
-- 종전 "※ 미동의 학생은 학급에 포함하지 마세요" 안내는 이 열로 대체.
-- 실행: Supabase SQL Editor 1회. 재실행 안전.
-- 선행 #41(setup_seat_pin_off — 이 파일의 claim_seat_v2 는 #41 PIN 끈 본문 + 동의 검사 한 단락)·#35(seat_no·student_data_summary)·#19(is_active)
-- 미적용이면: 교사 명단은 동의 열 없이 종전대로, 학생 입장은 종전(전원 저장형)대로.
-- ※ 나중에 PIN 을 다시 켜려고 #40 을 재실행하면 이 동의 검사가 사라진다 — 그때는 #40 뒤에 이 파일을 다시 실행할 것.
-- =============================================

-- [1] 열
ALTER TABLE student_seats ADD COLUMN IF NOT EXISTS consent    boolean NOT NULL DEFAULT false;
ALTER TABLE student_seats ADD COLUMN IF NOT EXISTS consent_at timestamptz;
COMMENT ON COLUMN student_seats.consent IS '학부모(법정대리인) 사전 서면 동의 — 담임이 명단에서 표시. false 면 게스트 입장만(기록 저장 0)';

-- 백필(최초 1회): 이 SQL 이전에 등록된 자리는 학급 단위 동의 확인("미동의 학생은 포함하지 마세요") 아래 만들어졌으므로 동의로 본다.
UPDATE student_seats ss SET consent = true, consent_at = ss.created_at
  FROM class_codes cc
 WHERE cc.id = ss.class_code_id AND cc.consent_confirmed = true
   AND ss.consent = false AND ss.consent_at IS NULL
   AND NOT EXISTS (SELECT 1 FROM student_seats x WHERE x.consent_at IS NOT NULL);  -- 아직 아무도 표시하지 않은 최초 1회에만

-- [2] 담임이 동의 표시 — set_seats_consent(seat_ids[], on/off) · set_seat_consent(seat_id, on/off)
--     끄면: 이미 입장한 학생 프로필은 is_active=false(사유 '학부모 동의 전')로 내려 RLS(#19)가 기록 신규 INSERT 를 막는다. 기존 기록은 지우지 않는다(삭제는 권리 행사 채널).
--     켜면: 그 사유로 내려간 프로필만 되살린다(다른 사유의 처리정지는 건드리지 않는다).
CREATE OR REPLACE FUNCTION set_seats_consent(p_seat_ids uuid[], p_consent boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_n int := 0; v_p int := 0; c_reason constant text := '학부모 동의 전 (기록 저장 중지)';
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'set_seats_consent: 로그인 필요'; END IF;
  IF NOT kedu_teacher_approved() THEN RAISE EXCEPTION 'set_seats_consent: 교사 확인 후 쓸 수 있습니다'; END IF;

  WITH mine AS (
    SELECT ss.id FROM student_seats ss
      JOIN class_codes cc ON cc.id = ss.class_code_id
      JOIN teachers t ON t.id = cc.teacher_id
     WHERE t.user_id = auth.uid() AND ss.id = ANY(p_seat_ids) AND ss.consent IS DISTINCT FROM p_consent
  ), upd AS (
    UPDATE student_seats s SET consent = p_consent, consent_at = CASE WHEN p_consent THEN now() ELSE NULL END
      FROM mine WHERE s.id = mine.id RETURNING s.id
  )
  SELECT count(*) INTO v_n FROM upd;

  IF p_consent THEN
    UPDATE student_profiles sp SET is_active = true, deactivated_at = NULL, deactivation_reason = NULL
      FROM student_seats ss JOIN class_codes cc ON cc.id = ss.class_code_id JOIN teachers t ON t.id = cc.teacher_id
     WHERE t.user_id = auth.uid() AND ss.id = ANY(p_seat_ids) AND ss.consent = true
       AND sp.id = ss.claimed_by AND sp.is_active = false AND sp.deactivation_reason = c_reason;
  ELSE
    UPDATE student_profiles sp SET is_active = false, deactivated_at = now(), deactivation_reason = c_reason
      FROM student_seats ss JOIN class_codes cc ON cc.id = ss.class_code_id JOIN teachers t ON t.id = cc.teacher_id
     WHERE t.user_id = auth.uid() AND ss.id = ANY(p_seat_ids) AND ss.consent = false
       AND sp.id = ss.claimed_by AND sp.is_active = true;
  END IF;
  GET DIAGNOSTICS v_p = ROW_COUNT;

  RETURN jsonb_build_object('updated', v_n, 'profiles', v_p, 'consent', p_consent);
END $fn$;
REVOKE ALL ON FUNCTION set_seats_consent(uuid[], boolean) FROM public;
GRANT EXECUTE ON FUNCTION set_seats_consent(uuid[], boolean) TO authenticated;

CREATE OR REPLACE FUNCTION set_seat_consent(p_seat_id uuid, p_consent boolean)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public AS $fn$
  SELECT set_seats_consent(ARRAY[p_seat_id], p_consent);
$fn$;
REVOKE ALL ON FUNCTION set_seat_consent(uuid, boolean) FROM public;
GRANT EXECUTE ON FUNCTION set_seat_consent(uuid, boolean) TO authenticated;

-- [3] claim_seat_v2 — #41(PIN 끔) 본문 그대로 + 동의 전 자리는 guest_seat 로 돌려보낸다
CREATE OR REPLACE FUNCTION claim_seat_v2(p_class_code text, p_nickname text, p_pin text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $fn$
DECLARE
  v_uid uuid; v_code text; v_nick text;
  v_class_id uuid; v_grade int; v_consent boolean; v_active boolean;
  v_seat_id uuid; v_claimed_by uuid; v_seat_consent boolean; v_label text;
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
  SELECT id, claimed_by, consent INTO v_seat_id, v_claimed_by, v_seat_consent
    FROM student_seats WHERE class_code_id = v_class_id AND nickname = v_nick LIMIT 1;
  IF v_seat_id IS NULL THEN RETURN nf; END IF;

  -- (#42) 학생별 동의 — 동의 전 학생은 게스트로만: 프로필·기록 아무것도 만들지 않는다(쓰기 0)
  IF v_seat_consent IS NOT TRUE THEN
    SELECT label INTO v_label FROM class_codes WHERE id = v_class_id;
    RETURN jsonb_build_object('status','guest_seat', 'class_label', coalesce(v_label, v_code), 'grade', v_grade,
                              'message','아직 학부모 동의 전이라 기록은 저장되지 않아요. 구경만 할 수 있어요.');
  END IF;

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

-- [4] student_data_summary — seat_consent 열(끝에 추가). 리포트·학부모 화면이 읽는다.
DROP VIEW IF EXISTS student_data_summary;
CREATE VIEW student_data_summary
WITH (security_invoker = true) AS
SELECT
  sp.id AS student_id,
  sp.nickname,
  sp.class_code_id,
  cc.code AS class_code,
  sp.grade,
  sp.is_active,
  sp.deactivated_at,
  sp.deactivation_reason,
  sp.created_at AS student_created_at,
  sp.last_seen_at,
  COALESCE((SELECT COUNT(*) FROM scores s WHERE s.student_id = sp.id), 0)::int                        AS total_questions,
  COALESCE((SELECT COUNT(*) FROM scores s WHERE s.student_id = sp.id AND s.is_correct), 0)::int       AS correct_questions,
  COALESCE((SELECT COUNT(DISTINCT lesson_id) FROM scores s WHERE s.student_id = sp.id), 0)::int        AS lessons_attempted,
  COALESCE((SELECT SUM(time_spent_sec) FROM scores s WHERE s.student_id = sp.id), 0)::int             AS total_time_sec,
  COALESCE((SELECT COUNT(*) FROM wrong_answers wa WHERE wa.student_id = sp.id AND wa.resolved_at IS NULL), 0)::int AS unresolved_wrong_count,
  COALESCE((SELECT COUNT(*) FROM homework_completions hc WHERE hc.student_id = sp.id), 0)::int        AS homework_completed_count,
  sp.seat_no,
  (SELECT bool_or(ss.consent) FROM student_seats ss WHERE ss.claimed_by = sp.id) AS seat_consent
FROM student_profiles sp
LEFT JOIN class_codes cc ON sp.class_code_id = cc.id;
GRANT SELECT ON student_data_summary TO authenticated;

NOTIFY pgrst, 'reload schema';

-- =============================================
-- 검산
--   SELECT column_name FROM information_schema.columns WHERE table_name='student_seats' AND column_name IN ('consent','consent_at');  → 2행
--   SELECT count(*) FILTER (WHERE consent) AS on, count(*) AS total FROM student_seats;  → 준호 반 6/6(백필)
--   SELECT proname FROM pg_proc WHERE proname IN ('set_seat_consent','set_seats_consent');  → 2행
--   SELECT column_name FROM information_schema.columns WHERE table_name='student_data_summary' AND column_name='seat_consent';  → 1행
-- =============================================
