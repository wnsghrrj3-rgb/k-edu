-- =============================================
-- K-edu 교사 승인 2차 경화 — 생태계설계_v2 §D 후속 (2026-08-27)
-- 1차(setup_teacher_approval.sql, #23 적용됨)의 빈틈 세 곳을 막는다:
--   [A] 스위치를 나중에 켜도, 이미 pending 인 교육청 메일 교사가 스스로 자동승인 받을 길이 없었다
--       → claim_edu_auto_approval() RPC (pending 전용 — 반려는 교육청 메일로도 못 뒤집는다)
--   [B] class_codes UPDATE 정책에 승인 조건이 없어, 반려된 교사가 기존 학급을
--       재활성화·코드 재발급할 수 있었다 → 미승인 교사는 「학급 끄기」만 허용
--       (겸사: #5 의 WITH CHECK 가 활성 게스트 학급의 모든 UPDATE 를 막던 잠복 결함을
--        트리거 방식(동의 다운그레이드만 금지)으로 교정 — 게스트 학급 학년 변경이 다시 된다)
--   [C] bulk_create_seats(SECURITY DEFINER)가 RLS 를 우회해, 반려된 교사가 기존
--       동의학급에 학생 슬롯을 계속 등록할 수 있었다 → student_seats INSERT 트리거로 차단
-- 부록: 공직자통합메일 korea.kr 을 edu_domains 에 active=false 로만 넣어 둔다(결정 대기).
-- 의존: setup_teacher_approval.sql(#23) · setup_consent_confirmed.sql(#5) · setup_student_entry.sql(#8)
-- 멱등 — 재실행 안전. 달러 인용은 $fn$/$do$.
-- =============================================

-- ---------------------------------------------------------------
-- [A-1] 트리거 ② 교체 — 본인 자동승인 통로 하나만 추가.
--       조건 전부(플래그·pending→auto·본인 컬럼 불변)를 만족할 때만 통과,
--       그 외는 1차와 완전히 동일하게 되돌린다.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION _teachers_protect_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF auth.uid() IS NULL OR kedu_is_admin() THEN
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

  -- 본인 자동승인(claim_edu_auto_approval 전용) — 트랜잭션 로컬 플래그 + pending→auto 전이만
  IF current_setting('kedu.self_auto_approve', true) = '1'
     AND OLD.approval = 'pending' AND NEW.approval = 'auto'
     AND NEW.user_id  = OLD.user_id
     AND NEW.is_admin = OLD.is_admin THEN
    NEW.approved_at := now();
    NEW.approved_by := NULL;                       -- 자동승인 — 승인 주체 없음
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
-- (트리거 자체는 1차의 trg_teachers_protect_approval 그대로 — 함수만 교체)

-- ---------------------------------------------------------------
-- [A-2] 본인 자동승인 RPC — 스위치 ON + 교육청 메일 + pending 일 때만.
--       반환: 'auto'(방금 승인) · 'already'(이미 승인) · 'switch_off' · 'not_edu' ·
--             'rejected'(반려는 관리자만 풀 수 있음) · 'no_profile'
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION claim_edu_auto_approval()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_approval text;
  v_email    text;
  v_auto     boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'login required' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT approval INTO v_approval FROM teachers WHERE user_id = auth.uid();
  IF v_approval IS NULL THEN RETURN 'no_profile'; END IF;
  IF v_approval IN ('auto','approved') THEN RETURN 'already'; END IF;
  IF v_approval = 'rejected' THEN RETURN 'rejected'; END IF;

  SELECT COALESCE((value = 'true'::jsonb), false) INTO v_auto
    FROM kedu_policy WHERE key = 'auto_approve_edu_domains';
  IF v_auto IS NOT TRUE THEN RETURN 'switch_off'; END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL OR NOT kedu_email_is_edu(v_email) THEN RETURN 'not_edu'; END IF;

  PERFORM set_config('kedu.self_auto_approve', '1', true);   -- 트랜잭션 로컬
  UPDATE teachers SET approval = 'auto' WHERE user_id = auth.uid();
  PERFORM set_config('kedu.self_auto_approve', '0', true);
  RETURN 'auto';
END;
$fn$;
GRANT EXECUTE ON FUNCTION claim_edu_auto_approval() TO authenticated;

-- ---------------------------------------------------------------
-- [B] class_codes UPDATE — 정책은 「소유 + (끄기 또는 승인)」만 보고,
--     동의 다운그레이드 금지는 OLD 를 볼 수 있는 트리거로 옮긴다.
--     (#5 의 WITH CHECK 는 NEW 만 봐서, 활성 게스트 학급(consent=false)의
--      정당한 UPDATE — 학년 변경·코드 재발급·저장형 전환 — 까지 전부 막고 있었다.)
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "teachers_update_codes" ON class_codes;
CREATE POLICY "teachers_update_codes" ON class_codes
  FOR UPDATE
  USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  )
  WITH CHECK (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
    AND (is_active = false OR kedu_teacher_approved())   -- 미승인(대기·반려)은 끄는 것만
  );

CREATE OR REPLACE FUNCTION _class_codes_no_consent_downgrade()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  -- 관리자·SQL Editor(service role) 통과 — 1차 트리거 ② 와 같은 규약
  IF auth.uid() IS NULL OR kedu_is_admin() THEN RETURN NEW; END IF;
  -- 활성 학급의 동의 확인은 내릴 수 없다 (#5 의 원 취지 그대로)
  IF OLD.consent_confirmed IS TRUE AND NEW.consent_confirmed IS NOT TRUE
     AND NEW.is_active IS TRUE THEN
    RAISE EXCEPTION 'consent_confirmed 는 활성 학급에서 내릴 수 없습니다 (학급을 먼저 비활성화하세요)'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_class_codes_no_consent_downgrade ON class_codes;
CREATE TRIGGER trg_class_codes_no_consent_downgrade
  BEFORE UPDATE ON class_codes
  FOR EACH ROW EXECUTE FUNCTION _class_codes_no_consent_downgrade();

-- ---------------------------------------------------------------
-- [C] student_seats INSERT 트리거 — 슬롯을 만드는 교사(created_by)가
--     승인 상태가 아니면 거부. SECURITY DEFINER RPC(bulk_create_seats)도
--     트리거는 못 지나친다. SQL Editor(auth.uid() NULL) 통과.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION _seats_require_approved_teacher()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.created_by IS NULL OR NOT EXISTS (
    SELECT 1 FROM teachers
     WHERE id = NEW.created_by AND approval IN ('auto','approved')
  ) THEN
    RAISE EXCEPTION '교사 확인 후 학생 슬롯을 등록할 수 있어요'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_seats_require_approved_teacher ON student_seats;
CREATE TRIGGER trg_seats_require_approved_teacher
  BEFORE INSERT ON student_seats
  FOR EACH ROW EXECUTE FUNCTION _seats_require_approved_teacher();

-- ---------------------------------------------------------------
-- [부록] 공직자통합메일 — 켜지 않고 등록만(결정 대기).
--        교사 아닌 공무원도 쓰는 도메인이라 자동승인 신호로는 약하다.
--        켜려면: UPDATE edu_domains SET active = true WHERE domain = 'korea.kr';
-- ---------------------------------------------------------------
INSERT INTO edu_domains (domain, region, active, verified) VALUES
  ('korea.kr', '공직자통합(결정 대기)', false, false)
ON CONFLICT (domain) DO NOTHING;

-- ---------------------------------------------------------------
-- 검산 (SQL Editor 에서 순서대로)
--   SELECT claim_edu_auto_approval();
--     → 준호 계정은 'already' (이미 approved) — 함수 존재·권한 확인용
--   SELECT count(*) FROM edu_domains WHERE domain = 'korea.kr' AND active = false;   → 1
--   SELECT policyname, with_check FROM pg_policies
--    WHERE tablename = 'class_codes' AND policyname = 'teachers_update_codes';
--     → with_check 에 kedu_teacher_approved 포함
--   SELECT tgname FROM pg_trigger WHERE tgname IN
--     ('trg_class_codes_no_consent_downgrade','trg_seats_require_approved_teacher');  → 2행
--   -- 동작 검산(준호 계정, 승인 상태): 대시보드에서 게스트 학급 학년 변경이 성공해야 함
-- =============================================
