-- =============================================================
-- 번호 + 이름 명단 (2026-09-02 준호 요청: "번호하고 이름이랑 같이 복붙 → 번호와 이름이 같이 저장")
--   student_seats.seat_no · student_profiles.seat_no (int, NULL 허용)
--   bulk_create_seats_v2(class, rows jsonb[{no,name}]) — 이름은 기존과 같은 멱등 규칙, 번호는 있으면 갱신
--   슬롯이 점유될 때 번호가 프로필로 따라간다(트리거) + 이미 점유된 것 백필
--   student_data_summary 뷰에 seat_no 추가 (리포트·대시보드가 번호순으로 읽는다)
--   재실행 안전. 의존: setup_student_entry.sql(bulk_create_seats·claim_seat), setup_data_requests.sql(뷰)
-- =============================================================

ALTER TABLE student_seats    ADD COLUMN IF NOT EXISTS seat_no int;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS seat_no int;

-- [1] 점유 시 번호 전달
CREATE OR REPLACE FUNCTION _seat_no_to_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NEW.claimed_by IS NOT NULL AND NEW.seat_no IS NOT NULL THEN
    UPDATE student_profiles SET seat_no = NEW.seat_no WHERE id = NEW.claimed_by AND seat_no IS DISTINCT FROM NEW.seat_no;
  END IF;
  RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS trg_seat_no_to_profile ON student_seats;
CREATE TRIGGER trg_seat_no_to_profile
  AFTER INSERT OR UPDATE OF claimed_by, seat_no ON student_seats
  FOR EACH ROW EXECUTE FUNCTION _seat_no_to_profile();

-- 백필: 이미 점유된 슬롯
UPDATE student_profiles sp SET seat_no = ss.seat_no
  FROM student_seats ss WHERE ss.claimed_by = sp.id AND ss.seat_no IS NOT NULL AND sp.seat_no IS DISTINCT FROM ss.seat_no;

-- [2] 번호+이름 일괄 등록
CREATE OR REPLACE FUNCTION bulk_create_seats_v2(p_class_code_id uuid, p_rows jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_teacher_id uuid; v_consent boolean; v_class_active boolean;
  r jsonb; v_name text; v_no int;
  v_created int := 0; v_updated int := 0; v_skipped_dup int := 0; v_skipped_invalid int := 0;
  v_invalid text[] := ARRAY[]::text[];
  v_existing uuid; v_existing_no int;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'bulk_create_seats_v2: 로그인 필요'; END IF;

  SELECT t.id, cc.consent_confirmed, cc.is_active INTO v_teacher_id, v_consent, v_class_active
    FROM class_codes cc JOIN teachers t ON cc.teacher_id = t.id
   WHERE cc.id = p_class_code_id AND t.user_id = auth.uid();
  IF v_teacher_id IS NULL THEN RAISE EXCEPTION 'bulk_create_seats_v2: 본인 학급이 아니거나 학급코드 없음'; END IF;
  IF v_class_active IS NOT TRUE THEN RAISE EXCEPTION 'bulk_create_seats_v2: 비활성 학급은 학생 등록 불가'; END IF;
  IF v_consent IS NOT TRUE THEN RAISE EXCEPTION 'bulk_create_seats_v2: 학부모 사전 동의 미확인 학급은 학생 등록 불가 (처리방침 v2.1 제7조)'; END IF;
  IF NOT kedu_teacher_approved() THEN RAISE EXCEPTION 'bulk_create_seats_v2: 교사 확인 후 등록할 수 있습니다'; END IF;

  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' OR jsonb_array_length(p_rows) = 0 THEN
    RETURN jsonb_build_object('created',0,'updated',0,'skipped_duplicate',0,'skipped_invalid',0,'message','입력 없음');
  END IF;
  IF jsonb_array_length(p_rows) > 50 THEN RAISE EXCEPTION 'bulk_create_seats_v2: 한 번에 최대 50명까지 등록 가능'; END IF;

  FOR r IN SELECT * FROM jsonb_array_elements(p_rows) LOOP
    v_name := btrim(coalesce(r->>'name',''));
    v_no   := CASE WHEN (r->>'no') ~ '^[0-9]{1,3}$' THEN (r->>'no')::int ELSE NULL END;
    IF length(v_name) = 0 THEN v_skipped_invalid := v_skipped_invalid + 1; CONTINUE; END IF;
    IF length(v_name) > 20 THEN v_skipped_invalid := v_skipped_invalid + 1; v_invalid := array_append(v_invalid, v_name || ' (20자 초과)'); CONTINUE; END IF;

    SELECT id, seat_no INTO v_existing, v_existing_no FROM student_seats WHERE class_code_id = p_class_code_id AND nickname = v_name;
    IF v_existing IS NOT NULL THEN
      -- 같은 이름이 이미 있으면 번호만 맞춘다 (다시 붙여 넣어도 안전)
      IF v_no IS NOT NULL AND v_existing_no IS DISTINCT FROM v_no THEN
        UPDATE student_seats SET seat_no = v_no WHERE id = v_existing; v_updated := v_updated + 1;
      ELSE
        v_skipped_dup := v_skipped_dup + 1;
      END IF;
      CONTINUE;
    END IF;

    INSERT INTO student_seats (class_code_id, nickname, seat_no, claim_code, created_by)
      VALUES (p_class_code_id, v_name, v_no, _gen_unique_claim_code(), v_teacher_id);
    v_created := v_created + 1;
  END LOOP;

  RETURN jsonb_build_object('created', v_created, 'updated', v_updated, 'skipped_duplicate', v_skipped_dup,
                            'skipped_invalid', v_skipped_invalid, 'invalid_samples', v_invalid[1:5]);
END $fn$;
REVOKE ALL ON FUNCTION bulk_create_seats_v2(uuid, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION bulk_create_seats_v2(uuid, jsonb) TO authenticated;

-- [3] 뷰에 번호 (열 끝에 추가 — CREATE OR REPLACE 허용)
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
  sp.seat_no
FROM student_profiles sp
LEFT JOIN class_codes cc ON sp.class_code_id = cc.id;
GRANT SELECT ON student_data_summary TO authenticated;

-- 검산:
--   SELECT column_name FROM information_schema.columns WHERE table_name='student_seats' AND column_name='seat_no';   → 1줄
--   SELECT seat_no, nickname FROM student_data_summary ORDER BY seat_no NULLS LAST LIMIT 5;
