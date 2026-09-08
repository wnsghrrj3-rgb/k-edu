-- =============================================
-- setup_parent_code.sql  (#55 — 2026-09-09)
-- 학부모 코드 — 준호 결정(09-09): 학부모는 따로 신청·검증하지 않는다. 담임이 학생 명단에서 학부모 코드를
--   발급하면(동의한 학생만) 학부모가 그 코드로 자녀와 즉시 연결된다(담임 검증 없음 — 코드가 곧 검증).
--   · student_parent_codes(seat_id PK, code UNIQUE) — RLS 켜고 정책 0·권한 0 = RPC 전용(학생 화면이 코드를 못 읽는다)
--   · issue_parent_codes(class, seats[], renew)  담임(승인·본인 학급) — consent=true 자리만, renew=true 면 새 코드
--   · list_parent_codes(class)                    담임 — 명단에 코드 표시
--   · claim_parent_code(code)                     학부모 — 좌석→프로필→parent_student_links(verified_at=now())
--       학생이 아직 한 번도 안 들어와 프로필이 없으면 student_not_entered (연결은 자녀가 들어온 뒤에)
--   · 동의를 끄면(set_seats_consent) 코드도 함께 지운다 — 동의 전 학생은 학부모 열람 없음 원칙
-- 옛 request_parent_link(학급코드+이름 신청) 는 REVOKE — 화면도 코드 방식으로 바꿈. 되돌리려면 GRANT 한 줄.
-- 재실행 안전. 선행 #42(consent)·#23.
-- =============================================
BEGIN;

CREATE TABLE IF NOT EXISTS student_parent_codes (
  seat_id   uuid PRIMARY KEY REFERENCES student_seats(id) ON DELETE CASCADE,
  code      text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  issued_by uuid REFERENCES teachers(id) ON DELETE SET NULL
);
ALTER TABLE student_parent_codes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON student_parent_codes FROM anon, authenticated;

CREATE OR REPLACE FUNCTION _gen_parent_code() RETURNS text
LANGUAGE plpgsql AS $fn$
DECLARE chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text; i int;
BEGIN
  FOR i IN 1..50 LOOP
    c := '';
    FOR j IN 1..8 LOOP c := c || substr(chars, 1 + floor(random()*length(chars))::int, 1); END LOOP;
    c := substr(c,1,4) || '-' || substr(c,5,4);
    IF NOT EXISTS (SELECT 1 FROM student_parent_codes WHERE code = c) THEN RETURN c; END IF;
  END LOOP;
  RAISE EXCEPTION '_gen_parent_code: 코드 생성 실패';
END; $fn$;

CREATE OR REPLACE FUNCTION _my_teacher_id_for_class(p_class uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_tid uuid;
BEGIN
  IF NOT kedu_teacher_approved() THEN RAISE EXCEPTION 'approval required' USING ERRCODE = 'insufficient_privilege'; END IF;
  SELECT t.id INTO v_tid FROM teachers t JOIN class_codes cc ON cc.teacher_id = t.id
   WHERE t.user_id = auth.uid() AND cc.id = p_class;
  IF v_tid IS NULL THEN RAISE EXCEPTION 'not your class' USING ERRCODE = 'insufficient_privilege'; END IF;
  RETURN v_tid;
END; $fn$;

CREATE OR REPLACE FUNCTION issue_parent_codes(p_class uuid, p_seat_ids uuid[] DEFAULT NULL, p_renew boolean DEFAULT false)
RETURNS TABLE (seat_id uuid, code text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
#variable_conflict use_column
DECLARE v_tid uuid; r record;
BEGIN
  v_tid := _my_teacher_id_for_class(p_class);
  FOR r IN
    SELECT s.id FROM student_seats s
     WHERE s.class_code_id = p_class AND s.consent = true
       AND (p_seat_ids IS NULL OR s.id = ANY(p_seat_ids))
  LOOP
    IF p_renew THEN DELETE FROM student_parent_codes WHERE student_parent_codes.seat_id = r.id; END IF;
    INSERT INTO student_parent_codes (seat_id, code, issued_by)
      VALUES (r.id, _gen_parent_code(), v_tid)
      ON CONFLICT (seat_id) DO NOTHING;
  END LOOP;
  RETURN QUERY SELECT c.seat_id, c.code FROM student_parent_codes c
    JOIN student_seats s ON s.id = c.seat_id WHERE s.class_code_id = p_class;
END; $fn$;
REVOKE ALL ON FUNCTION issue_parent_codes(uuid, uuid[], boolean) FROM public;
GRANT EXECUTE ON FUNCTION issue_parent_codes(uuid, uuid[], boolean) TO authenticated;

CREATE OR REPLACE FUNCTION list_parent_codes(p_class uuid)
RETURNS TABLE (seat_id uuid, code text, issued_at timestamptz, linked int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
#variable_conflict use_column
BEGIN
  PERFORM _my_teacher_id_for_class(p_class);
  RETURN QUERY
    SELECT c.seat_id, c.code, c.issued_at,
           (SELECT count(*)::int FROM parent_student_links l WHERE l.student_id = s.claimed_by AND l.verified_at IS NOT NULL)
      FROM student_parent_codes c JOIN student_seats s ON s.id = c.seat_id
     WHERE s.class_code_id = p_class;
END; $fn$;
REVOKE ALL ON FUNCTION list_parent_codes(uuid) FROM public;
GRANT EXECUTE ON FUNCTION list_parent_codes(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION claim_parent_code(p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_parent uuid; v_seat record; v_teacher uuid; v_link_id bigint;
BEGIN
  v_parent := auth.uid();
  IF v_parent IS NULL THEN RAISE EXCEPTION '로그인이 필요합니다' USING ERRCODE = '28000'; END IF;
  IF EXISTS (SELECT 1 FROM teachers WHERE user_id = v_parent) THEN
    RAISE EXCEPTION '교사 계정에서는 자녀를 연결할 수 없습니다' USING ERRCODE = '42501'; END IF;
  IF EXISTS (SELECT 1 FROM student_profiles WHERE user_id = v_parent) THEN
    RAISE EXCEPTION '학생 계정에서는 자녀를 연결할 수 없습니다' USING ERRCODE = '42501'; END IF;

  p_code := upper(regexp_replace(coalesce(p_code,''), '[^A-Za-z0-9]', '', 'g'));
  IF length(p_code) <> 8 THEN RETURN jsonb_build_object('status','not_found'); END IF;
  p_code := substr(p_code,1,4) || '-' || substr(p_code,5,4);

  SELECT s.id, s.nickname, s.claimed_by, s.consent, cc.teacher_id, cc.is_active, cc.label
    INTO v_seat
    FROM student_parent_codes c
    JOIN student_seats s ON s.id = c.seat_id
    JOIN class_codes cc ON cc.id = s.class_code_id
   WHERE c.code = p_code;
  IF NOT FOUND THEN RETURN jsonb_build_object('status','not_found'); END IF;
  IF v_seat.consent IS NOT TRUE OR v_seat.is_active IS NOT TRUE THEN RETURN jsonb_build_object('status','not_found'); END IF;
  IF v_seat.claimed_by IS NULL THEN
    RETURN jsonb_build_object('status','student_not_entered', 'nickname', v_seat.nickname);
  END IF;

  INSERT INTO parent_student_links (parent_id, student_id, verified_at, verified_by)
    VALUES (v_parent, v_seat.claimed_by, now(), v_seat.teacher_id)
    ON CONFLICT (parent_id, student_id) DO UPDATE
      SET verified_at = coalesce(parent_student_links.verified_at, now()),
          verified_by = coalesce(parent_student_links.verified_by, EXCLUDED.verified_by)
    RETURNING id INTO v_link_id;
  RETURN jsonb_build_object('status','linked', 'link_id', v_link_id, 'student_id', v_seat.claimed_by,
                            'nickname', v_seat.nickname, 'class_label', v_seat.label);
END; $fn$;
REVOKE ALL ON FUNCTION claim_parent_code(text) FROM public;
GRANT EXECUTE ON FUNCTION claim_parent_code(text) TO authenticated;

-- 동의를 끄면 학부모 코드도 지운다 (#42 set_seats_consent 뒤에 얹는 트리거 — 함수 본문 무접촉)
CREATE OR REPLACE FUNCTION _drop_parent_code_on_consent_off() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NEW.consent IS NOT TRUE AND OLD.consent IS TRUE THEN
    DELETE FROM student_parent_codes WHERE seat_id = NEW.id;
  END IF;
  RETURN NEW;
END; $fn$;
DROP TRIGGER IF EXISTS trg_seat_consent_off_parent_code ON student_seats;
CREATE TRIGGER trg_seat_consent_off_parent_code AFTER UPDATE OF consent ON student_seats
  FOR EACH ROW EXECUTE FUNCTION _drop_parent_code_on_consent_off();

-- 옛 신청 경로 닫기(정의는 남김)
REVOKE EXECUTE ON FUNCTION request_parent_link(text, text) FROM authenticated, anon, public;

COMMIT;

-- 검산:
--   SELECT proname FROM pg_proc WHERE proname IN ('issue_parent_codes','list_parent_codes','claim_parent_code'); → 3행
--   SELECT has_function_privilege('authenticated','request_parent_link(text,text)','EXECUTE'); → false
