-- =============================================
-- K-edu 학생 진입 흐름 재구축 — student_seats RPC 2종
-- 작성: 2026-04-30 (적합성 사이클 ㊶)
-- 목적: 처리방침 v2.1 제2조 3 진정한 정합 — 학생은 별도 회원가입 없이
--       교사가 사전 등록한 닉네임으로만 진입.
-- 의존: setup_diagnosis_v2.sql SECTION 9 (student_seats 테이블)
--       setup_consent_confirmed.sql (class_codes.consent_confirmed CHECK)
--       setup_student_profiles.sql (student_profiles RLS)
-- 본 마이그레이션은 멱등(idempotent) — 재실행 안전.
-- =============================================


-- =============================================
-- [SECTION 1] 헬퍼 — claim_code 자동 생성 (6자리 영숫자, UNIQUE 보장)
-- =============================================
-- student_seats.claim_code는 NOT NULL UNIQUE이지만 본 흐름에서는
-- 학생이 학급코드+닉네임으로 진입하므로 사용 안 함. 미래 확장(단축코드 입력)에 대비해 자동 생성.

CREATE OR REPLACE FUNCTION _gen_unique_claim_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
  tries int := 0;
BEGIN
  LOOP
    candidate := '';
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    END LOOP;

    IF NOT EXISTS (SELECT 1 FROM student_seats WHERE claim_code = candidate) THEN
      RETURN candidate;
    END IF;

    tries := tries + 1;
    IF tries > 50 THEN
      RAISE EXCEPTION '_gen_unique_claim_code: 50회 시도 후에도 unique 코드 생성 실패';
    END IF;
  END LOOP;
END $$;


-- =============================================
-- [SECTION 2] bulk_create_seats — 교사용 학생 슬롯 일괄 등록
-- 본인 학급(consent_confirmed=true) 검증 + 닉네임 가드 + 중복 차단.
-- =============================================
CREATE OR REPLACE FUNCTION bulk_create_seats(
  p_class_code_id uuid,
  p_nicknames text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher_id uuid;
  v_consent boolean;
  v_class_active boolean;
  v_nick text;
  v_clean text;
  v_created int := 0;
  v_skipped_dup int := 0;
  v_skipped_invalid int := 0;
  v_invalid_reasons text[] := ARRAY[]::text[];
  v_claim_code text;
BEGIN
  -- 1) 호출자 검증
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'bulk_create_seats: 로그인 필요';
  END IF;

  -- 2) 본인 학급 + 동의 확인 학급만
  SELECT t.id, cc.consent_confirmed, cc.is_active
    INTO v_teacher_id, v_consent, v_class_active
    FROM class_codes cc
    JOIN teachers t ON cc.teacher_id = t.id
   WHERE cc.id = p_class_code_id
     AND t.user_id = auth.uid();

  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'bulk_create_seats: 본인 학급이 아니거나 학급코드 없음';
  END IF;

  IF v_class_active IS NOT TRUE THEN
    RAISE EXCEPTION 'bulk_create_seats: 비활성 학급은 학생 등록 불가';
  END IF;

  IF v_consent IS NOT TRUE THEN
    RAISE EXCEPTION 'bulk_create_seats: 학부모 사전 동의 미확인 학급은 학생 등록 불가 (처리방침 v2.1 제7조)';
  END IF;

  -- 3) 닉네임 배열 가드 — 50명 제한
  IF array_length(p_nicknames, 1) IS NULL OR array_length(p_nicknames, 1) = 0 THEN
    RETURN jsonb_build_object('created', 0, 'skipped_duplicate', 0, 'skipped_invalid', 0, 'message', '닉네임 입력 없음');
  END IF;

  IF array_length(p_nicknames, 1) > 50 THEN
    RAISE EXCEPTION 'bulk_create_seats: 한 번에 최대 50명까지 등록 가능';
  END IF;

  -- 4) 각 닉네임 처리 — 멱등(같은 학급 내 동일 닉네임이 이미 있으면 skip)
  FOREACH v_nick IN ARRAY p_nicknames LOOP
    -- 4-1) 닉네임 정제
    v_clean := btrim(coalesce(v_nick, ''));

    -- 4-2) 길이 가드 (1~20자)
    IF length(v_clean) = 0 THEN
      v_skipped_invalid := v_skipped_invalid + 1;
      CONTINUE;
    END IF;

    IF length(v_clean) > 20 THEN
      v_skipped_invalid := v_skipped_invalid + 1;
      v_invalid_reasons := array_append(v_invalid_reasons, v_clean || ' (20자 초과)');
      CONTINUE;
    END IF;

    -- 4-3) 같은 학급 내 중복 차단 (멱등)
    IF EXISTS (
      SELECT 1 FROM student_seats
       WHERE class_code_id = p_class_code_id
         AND nickname = v_clean
    ) THEN
      v_skipped_dup := v_skipped_dup + 1;
      CONTINUE;
    END IF;

    -- 4-4) UNIQUE claim_code 자동 생성 + INSERT
    v_claim_code := _gen_unique_claim_code();

    INSERT INTO student_seats (class_code_id, nickname, claim_code, created_by)
      VALUES (p_class_code_id, v_clean, v_claim_code, v_teacher_id);

    v_created := v_created + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'created', v_created,
    'skipped_duplicate', v_skipped_dup,
    'skipped_invalid', v_skipped_invalid,
    'invalid_samples', v_invalid_reasons[1:5]
  );
END $$;

GRANT EXECUTE ON FUNCTION bulk_create_seats(uuid, text[]) TO authenticated;


-- =============================================
-- [SECTION 3] claim_seat — 학생 익명 인증 후 슬롯 점유
-- 학급코드 + 닉네임 매칭 → student_profiles 생성 + seat 점유.
-- 시나리오:
--   (a) 신규 점유 → INSERT student_profiles + UPDATE seat(claimed_by, claimed_at) → status='created'
--   (b) 재진입(같은 user_id) → 기존 student_profiles 반환 → status='reclaim'
--   (c) 도용(다른 user_id가 이미 점유) → 차단 → status='taken'
--   (d) 학급/닉네임 매칭 실패 → 통합 에러 → status='not_found'
--   (e) 처리정지 학생 → status='inactive'
-- =============================================
CREATE OR REPLACE FUNCTION claim_seat(
  p_class_code text,
  p_nickname text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_clean_code text;
  v_clean_nick text;
  v_class_id uuid;
  v_class_grade int;
  v_class_consent boolean;
  v_class_active boolean;
  v_seat_id uuid;
  v_seat_claimed_by uuid;
  v_existing_profile_id uuid;
  v_existing_profile_user uuid;
  v_existing_active boolean;
  v_new_profile_id uuid;
BEGIN
  -- 1) 호출자 검증 (익명 인증도 auth.uid() 발급되므로 통과)
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('status', 'no_session', 'message', '인증 세션이 없습니다');
  END IF;

  -- 2) 입력 정제
  v_clean_code := upper(btrim(coalesce(p_class_code, '')));
  v_clean_nick := btrim(coalesce(p_nickname, ''));

  IF length(v_clean_code) < 4 OR length(v_clean_code) > 12 THEN
    RETURN jsonb_build_object('status', 'not_found', 'message', '학급코드 또는 닉네임이 일치하지 않습니다');
  END IF;

  IF length(v_clean_nick) = 0 OR length(v_clean_nick) > 20 THEN
    RETURN jsonb_build_object('status', 'not_found', 'message', '학급코드 또는 닉네임이 일치하지 않습니다');
  END IF;

  -- 3) 학급코드 조회 (active + consent_confirmed 강제)
  SELECT id, grade, consent_confirmed, is_active
    INTO v_class_id, v_class_grade, v_class_consent, v_class_active
    FROM class_codes
   WHERE code = v_clean_code
   LIMIT 1;

  -- 학급 없음 / 비활성 / 미동의 → 모두 통합 에러 (열거 공격 완화)
  IF v_class_id IS NULL OR v_class_active IS NOT TRUE OR v_class_consent IS NOT TRUE THEN
    RETURN jsonb_build_object('status', 'not_found', 'message', '학급코드 또는 닉네임이 일치하지 않습니다');
  END IF;

  -- 4) 슬롯 매칭
  SELECT id, claimed_by
    INTO v_seat_id, v_seat_claimed_by
    FROM student_seats
   WHERE class_code_id = v_class_id
     AND nickname = v_clean_nick
   LIMIT 1;

  IF v_seat_id IS NULL THEN
    -- 슬롯 없음 → 통합 에러 (학급코드 존재 여부 노출 차단)
    RETURN jsonb_build_object('status', 'not_found', 'message', '학급코드 또는 닉네임이 일치하지 않습니다');
  END IF;

  -- 5) 점유 상태 분기
  IF v_seat_claimed_by IS NULL THEN
    -- (a) 신규 점유: student_profiles 생성 + seat UPDATE
    -- 같은 user_id로 다른 학급에서 이미 student_profiles row가 있는지 확인
    SELECT id, is_active
      INTO v_existing_profile_id, v_existing_active
      FROM student_profiles
     WHERE user_id = v_uid
     LIMIT 1;

    IF v_existing_profile_id IS NOT NULL THEN
      -- 같은 익명 세션이 이미 다른 학급 슬롯을 점유한 상태 — 학급 이동
      IF v_existing_active IS FALSE THEN
        RETURN jsonb_build_object('status', 'inactive', 'message', '처리정지된 학생입니다. 담임 선생님께 문의하세요.');
      END IF;

      -- 기존 프로필을 새 학급으로 갱신
      UPDATE student_profiles
         SET nickname = v_clean_nick,
             class_code_id = v_class_id,
             grade = v_class_grade,
             last_seen_at = now()
       WHERE id = v_existing_profile_id;

      UPDATE student_seats
         SET claimed_by = v_existing_profile_id,
             claimed_at = now()
       WHERE id = v_seat_id;

      RETURN jsonb_build_object(
        'status', 'created',
        'profile_id', v_existing_profile_id,
        'nickname', v_clean_nick,
        'class_code_id', v_class_id,
        'grade', v_class_grade
      );
    END IF;

    -- 신규 student_profiles 생성
    INSERT INTO student_profiles (user_id, nickname, class_code_id, grade)
      VALUES (v_uid, v_clean_nick, v_class_id, v_class_grade)
    RETURNING id INTO v_new_profile_id;

    UPDATE student_seats
       SET claimed_by = v_new_profile_id,
           claimed_at = now()
     WHERE id = v_seat_id;

    RETURN jsonb_build_object(
      'status', 'created',
      'profile_id', v_new_profile_id,
      'nickname', v_clean_nick,
      'class_code_id', v_class_id,
      'grade', v_class_grade
    );
  END IF;

  -- 6) 이미 점유된 슬롯 — user_id 매칭 확인
  SELECT user_id, is_active
    INTO v_existing_profile_user, v_existing_active
    FROM student_profiles
   WHERE id = v_seat_claimed_by
   LIMIT 1;

  IF v_existing_profile_user IS NULL THEN
    -- 슬롯에 claimed_by는 있는데 student_profiles row 없음 (FK 깨짐 — 사실상 발생 안 함)
    RETURN jsonb_build_object('status', 'not_found', 'message', '학급코드 또는 닉네임이 일치하지 않습니다');
  END IF;

  IF v_existing_active IS FALSE THEN
    RETURN jsonb_build_object('status', 'inactive', 'message', '처리정지된 학생입니다. 담임 선생님께 문의하세요.');
  END IF;

  IF v_existing_profile_user = v_uid THEN
    -- (b) 재진입 — 본인 슬롯
    UPDATE student_profiles
       SET last_seen_at = now()
     WHERE id = v_seat_claimed_by;

    RETURN jsonb_build_object(
      'status', 'reclaim',
      'profile_id', v_seat_claimed_by,
      'nickname', v_clean_nick,
      'class_code_id', v_class_id,
      'grade', v_class_grade
    );
  END IF;

  -- (c) 다른 user_id가 이미 점유 → 차단
  RETURN jsonb_build_object(
    'status', 'taken',
    'message', '이미 다른 기기에서 사용 중인 닉네임입니다. 다른 닉네임을 선택하거나 담임 선생님께 문의하세요.'
  );
END $$;

GRANT EXECUTE ON FUNCTION claim_seat(text, text) TO authenticated;


-- =============================================
-- [SECTION 4] my_seat_class — 학생용 본인 학급 정보 조회
-- 학생 대시보드 / 메인 chip 표시용 헬퍼.
-- =============================================
CREATE OR REPLACE FUNCTION my_seat_class()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_result jsonb;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('status', 'no_session');
  END IF;

  SELECT jsonb_build_object(
    'status', 'ok',
    'profile_id', sp.id,
    'nickname', sp.nickname,
    'is_active', sp.is_active,
    'class_code_id', cc.id,
    'class_code', cc.code,
    'class_label', cc.label,
    'grade', cc.grade,
    'semester', cc.semester
  ) INTO v_result
  FROM student_profiles sp
  LEFT JOIN class_codes cc ON sp.class_code_id = cc.id
  WHERE sp.user_id = v_uid
  LIMIT 1;

  IF v_result IS NULL THEN
    RETURN jsonb_build_object('status', 'no_profile');
  END IF;

  RETURN v_result;
END $$;

GRANT EXECUTE ON FUNCTION my_seat_class() TO authenticated;


-- =============================================
-- [SECTION 5] PostgREST 스키마 reload
-- =============================================
NOTIFY pgrst, 'reload schema';


-- =============================================
-- 검증 쿼리 (실행 후 수동 확인)
-- =============================================
-- 1. 함수 3종 존재 + SECURITY DEFINER 확인:
--    SELECT proname, prosecdef FROM pg_proc
--     WHERE proname IN ('bulk_create_seats','claim_seat','my_seat_class','_gen_unique_claim_code');
--    → 4행 + 모두 prosecdef=true
--
-- 2. 교사 컨텍스트에서 슬롯 일괄 등록 (ROLLBACK으로 검증만):
--    BEGIN;
--    SELECT bulk_create_seats(
--      (SELECT id FROM class_codes WHERE teacher_id = (SELECT id FROM teachers WHERE user_id=auth.uid()) LIMIT 1),
--      ARRAY['하늘이','바다','구름이']
--    );
--    ROLLBACK;
--    → jsonb { created: 3, skipped_duplicate: 0, skipped_invalid: 0 }
--
-- 3. 익명 인증 학생 → claim_seat 호출 (FE에서 검증)
-- =============================================
