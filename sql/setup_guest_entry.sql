-- =====================================================================
-- setup_guest_entry.sql — 게스트(동의 전) 학급 입장 칸 신설 (2026-08-08)
--
-- 배경 (준호 지시 2026-08-08, 생태계설계_v1 §3 사다리에 L2g 칸 추가):
--   방문자 → [L2g 코드만 입장: 무저장·무이름] → 동의 학급(claim_seat) → 교사
--   기존 제약(class_codes_consent_required)은 "활성 = 동의"를 묶어 두어
--   동의 전 학급은 코드 활성화 자체가 불가했다. 게스트 칸을 열려면
--   "활성"과 "동의"를 분리하되, 진짜 불변식은 더 낮은 층에서 지킨다:
--
--   불변식 (이 파일 이후에도 반드시 참):
--     ① 좌석(student_seats)은 동의 학급에만 생긴다  → 트리거 가드
--     ② 프로필(student_profiles)은 동의 학급에만 생긴다 → 트리거 가드
--     ③ claim_seat는 미동의 학급을 not_found로 거른다 (기존 로직, 무변경)
--     ④ 게스트 입장은 서버에 어떤 행도 만들지 않는다 (peek_class = SELECT만,
--        익명 인증조차 만들지 않음 — 클라이언트 localStorage뿐)
--
-- 실행: Supabase SQL Editor에서 전체 실행 (멱등 — 재실행 안전)
-- 선행: setup_student_entry.sql, setup_consent_confirmed.sql
-- =====================================================================

-- ---------------------------------------------------------------
-- [1] "활성 = 동의" 결합 해제 — 활성은 입장 가능 여부, 동의는 저장 가능 여부
-- ---------------------------------------------------------------
ALTER TABLE class_codes DROP CONSTRAINT IF EXISTS class_codes_consent_required;

COMMENT ON COLUMN class_codes.consent_confirmed IS
  '학부모(법정대리인) 사전 동의 확인 여부. true = 저장형 학급(claim_seat 가능). false = 게스트 전용 학급(코드 입장만, 좌석·기록 생성 불가 — 트리거 가드).';

-- ---------------------------------------------------------------
-- [2] 트리거 가드 — 동의 없는 학급에는 좌석·프로필이 DB 층에서 못 생긴다
--     (claim_seat·bulk_create_seats가 뚫려도, 직접 INSERT가 와도 차단)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION _guard_consent_class()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_consent boolean;
BEGIN
  SELECT consent_confirmed INTO v_consent
    FROM class_codes
   WHERE id = NEW.class_code_id;

  IF v_consent IS NOT TRUE THEN
    RAISE EXCEPTION 'consent_required: class % has no confirmed consent — seats/profiles forbidden', NEW.class_code_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seats_consent_guard ON student_seats;
CREATE TRIGGER trg_seats_consent_guard
  BEFORE INSERT OR UPDATE OF class_code_id ON student_seats
  FOR EACH ROW EXECUTE FUNCTION _guard_consent_class();

DROP TRIGGER IF EXISTS trg_profiles_consent_guard ON student_profiles;
CREATE TRIGGER trg_profiles_consent_guard
  BEFORE INSERT OR UPDATE OF class_code_id ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION _guard_consent_class();

-- ---------------------------------------------------------------
-- [3] peek_class — 게스트 입장 검증 (읽기 전용, 행 생성 0)
--     세션 불요(anon 호출 가능). 반환 최소화: 상태·라벨·학년·저장형 여부만.
--     열거 완화: 실패 사유 통합(not_found 하나), 코드 형식 검증.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION peek_class(p_class_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_clean_code text;
  v_label text;
  v_grade int;
  v_consent boolean;
BEGIN
  v_clean_code := upper(btrim(coalesce(p_class_code, '')));

  IF length(v_clean_code) < 4 OR length(v_clean_code) > 12 THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  SELECT label, grade, consent_confirmed
    INTO v_label, v_grade, v_consent
    FROM class_codes
   WHERE code = v_clean_code
     AND is_active = true
   LIMIT 1;

  IF v_label IS NULL AND v_grade IS NULL AND v_consent IS NULL THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  RETURN jsonb_build_object(
    'status', 'ok',
    'class_label', coalesce(v_label, v_clean_code),
    'grade', v_grade,
    'consent_class', coalesce(v_consent, false)  -- true면 닉네임 입장(저장형)도 가능한 반
  );
END;
$$;

REVOKE ALL ON FUNCTION peek_class(text) FROM public;
GRANT EXECUTE ON FUNCTION peek_class(text) TO anon;
GRANT EXECUTE ON FUNCTION peek_class(text) TO authenticated;

-- ---------------------------------------------------------------
-- [4] 검증 쿼리 (실행 후 눈으로 확인)
-- ---------------------------------------------------------------
-- 1. 제약 해제 확인 (0행이어야 함):
--    SELECT conname FROM pg_constraint WHERE conname = 'class_codes_consent_required';
-- 2. 트리거 확인 (2행):
--    SELECT tgname FROM pg_trigger WHERE tgname LIKE 'trg_%_consent_guard';
-- 3. 가드 동작 확인 (에러가 나야 정상):
--    INSERT INTO student_seats (class_code_id, nickname)
--    VALUES ((SELECT id FROM class_codes WHERE consent_confirmed = false LIMIT 1), '테스트');
-- 4. peek 동작:
--    SELECT peek_class('실제코드');   -- {"status":"ok", ...}
--    SELECT peek_class('XXXX99');     -- {"status":"not_found"}
