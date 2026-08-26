-- =============================================
-- K-edu 교사 승인(교사 증명) — 생태계설계_v2_공개준비 §D (A1) · §J-1
-- 작성: 2026-08-26
-- 본질: 인증(auth.users)과 승인(teachers.approval)을 분리한다.
--       가입 화면은 그대로 두고, teachers 행이 생기는 순간 DB 트리거가 승인 상태를 정한다.
--       1단계(우리 학교 시범) = 전원 'pending' → 준호가 /admin 에서 수동 승인.
--       2단계(교육청 도메인 자동승인) = kedu_policy.auto_approve_edu_domains 를 true 로 — 코드 무변경.
-- 의존: setup_tables.sql(teachers, class_codes) · setup_classwork.sql(cw_*) · setup_morning.sql(ma_routines)
-- 멱등 — 재실행 안전(IF NOT EXISTS · OR REPLACE · DROP POLICY IF EXISTS 선행).
-- 달러 인용은 $fn$/$do$ (SQL Editor 절단 시 미종료 지점이 드러나게).
-- =============================================

-- ---------------------------------------------------------------
-- [0] 정책 스위치 — 코드 수정 없이 1단계↔2단계
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kedu_policy (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  note       text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO kedu_policy (key, value, note) VALUES
  ('auto_approve_edu_domains', 'false'::jsonb, '교육청 메일 도메인 자동승인. 1단계=false(수동), 2단계=true. edu_domains.active 행만 본다.')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE kedu_policy ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- [1] 교육청 메일 도메인 — 초안 17개(§D-2). verified=false = 준호 실검증 전.
--     매칭은 정확 일치 또는 하위 도메인(x.sen.go.kr). 추가는 INSERT 한 줄, 코드 무변경.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS edu_domains (
  domain     text PRIMARY KEY,
  region     text NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  verified   boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
INSERT INTO edu_domains (domain, region) VALUES
  ('sen.go.kr','서울'), ('pen.go.kr','부산'), ('dge.go.kr','대구'), ('ice.go.kr','인천'),
  ('gen.go.kr','광주'), ('dje.go.kr','대전'), ('use.go.kr','울산'), ('sje.go.kr','세종'),
  ('goe.go.kr','경기'), ('gwe.go.kr','강원'), ('cbe.go.kr','충북'), ('cne.go.kr','충남'),
  ('jbe.go.kr','전북'), ('jne.go.kr','전남'), ('gbe.go.kr','경북'), ('gne.go.kr','경남'),
  ('jje.go.kr','제주')
ON CONFLICT (domain) DO NOTHING;

ALTER TABLE edu_domains ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- [2] teachers 승인 컬럼
--     approval: 'pending' | 'auto' | 'approved' | 'rejected'
--     approval_note: 승인대기 교사가 적는 학교명·직위 신청 메모(§D-3)
-- ---------------------------------------------------------------
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS approval              text NOT NULL DEFAULT 'pending';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS approved_at           timestamptz;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS approved_by           uuid;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS approval_note         text DEFAULT '';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS approval_requested_at timestamptz;

DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teachers_approval_check') THEN
    ALTER TABLE teachers ADD CONSTRAINT teachers_approval_check
      CHECK (approval IN ('pending','auto','approved','rejected'));
  END IF;
END $do$;

CREATE INDEX IF NOT EXISTS idx_teachers_approval ON teachers(approval);

COMMENT ON COLUMN teachers.approval IS
  '교사 승인 상태. pending=가입만(학급 개설·케이박스·아침활동 잠김) · auto=교육청 도메인 자동승인 · approved=관리자 승인 · rejected=반려. 트리거가 정하고, 관리자만 바꾼다.';

-- 게이트 이전 가입분 일괄 승인(시범 계정). 원치 않는 행은 /admin 에서 반려.
UPDATE teachers
   SET approval = 'approved',
       approved_at = COALESCE(approved_at, now()),
       approval_note = CASE WHEN approval_note = '' THEN '게이트 이전 가입 — 일괄 승인' ELSE approval_note END
 WHERE approval = 'pending' AND created_at < '2026-08-27';

-- ---------------------------------------------------------------
-- [3] 헬퍼 — RLS·화면이 묻는 함수 둘. (SECURITY DEFINER: teachers 자기참조 재귀 회피)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION kedu_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid() AND is_admin = true)
$fn$;

CREATE OR REPLACE FUNCTION kedu_teacher_approved()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM teachers
     WHERE user_id = auth.uid() AND approval IN ('auto','approved')
  )
$fn$;

GRANT EXECUTE ON FUNCTION kedu_is_admin()         TO authenticated, anon;
GRANT EXECUTE ON FUNCTION kedu_teacher_approved() TO authenticated, anon;

-- 도메인 판정(트리거·관리자 화면 공용)
CREATE OR REPLACE FUNCTION kedu_email_is_edu(p_email text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM edu_domains d
     WHERE d.active
       AND (lower(split_part(p_email,'@',2)) = d.domain
            OR lower(split_part(p_email,'@',2)) LIKE '%.' || d.domain)
  )
$fn$;
GRANT EXECUTE ON FUNCTION kedu_email_is_edu(text) TO authenticated;

-- ---------------------------------------------------------------
-- [4] 트리거 ① INSERT — 가입 즉시 승인 상태 결정(§D-1·2·3). 클라이언트가 보낸 approval 은 무시.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION _teachers_set_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_email text;
  v_auto  boolean;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
  SELECT COALESCE((value = 'true'::jsonb), false) INTO v_auto
    FROM kedu_policy WHERE key = 'auto_approve_edu_domains';

  NEW.is_admin    := false;          -- 가입으로 관리자가 되는 길은 없다
  NEW.approved_by := NULL;
  IF v_auto IS TRUE AND v_email IS NOT NULL AND kedu_email_is_edu(v_email) THEN
    NEW.approval    := 'auto';
    NEW.approved_at := now();
  ELSE
    NEW.approval    := 'pending';
    NEW.approved_at := NULL;
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_teachers_set_approval ON teachers;
CREATE TRIGGER trg_teachers_set_approval
  BEFORE INSERT ON teachers
  FOR EACH ROW EXECUTE FUNCTION _teachers_set_approval();

-- ---------------------------------------------------------------
-- [5] 트리거 ② UPDATE — 승인·관리자 컬럼은 관리자만 바꾼다(teachers_update_own 이 열려 있어도 DB 층에서 되돌림).
--     auth.uid() 가 NULL(SQL Editor·service role)이면 통과.
--     교사 본인은 approval_note·approval_requested_at 만 만질 수 있다(신청 메모).
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION _teachers_protect_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF auth.uid() IS NULL OR kedu_is_admin() THEN
    -- 관리자 승인/반려 시각·주체 자동 기록
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

-- ---------------------------------------------------------------
-- [6] RLS — 관리자 UPDATE(승인/반려) + 정책·도메인 테이블 관리자 전용
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS admins_update_teachers ON teachers;
CREATE POLICY admins_update_teachers ON teachers
  FOR UPDATE USING (kedu_is_admin()) WITH CHECK (kedu_is_admin());

DROP POLICY IF EXISTS p_kedu_policy_admin ON kedu_policy;
CREATE POLICY p_kedu_policy_admin ON kedu_policy
  FOR ALL USING (kedu_is_admin()) WITH CHECK (kedu_is_admin());

DROP POLICY IF EXISTS p_edu_domains_admin ON edu_domains;
CREATE POLICY p_edu_domains_admin ON edu_domains
  FOR ALL USING (kedu_is_admin()) WITH CHECK (kedu_is_admin());

-- ---------------------------------------------------------------
-- [7] RLS 잠금(§D-5) — 학급 개설·케이박스·아침활동 쓰기는 승인 교사만.
--     읽기(USING)는 그대로 — 대기/반려 교사도 자기 것은 본다.
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "teachers_insert_codes" ON class_codes;
CREATE POLICY "teachers_insert_codes" ON class_codes
  FOR INSERT WITH CHECK (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
    AND kedu_teacher_approved()
  );

DROP POLICY IF EXISTS cw_bundles_teacher ON cw_bundles;
CREATE POLICY cw_bundles_teacher ON cw_bundles
  FOR ALL USING (teacher_id = cw_my_teacher_id())
  WITH CHECK (teacher_id = cw_my_teacher_id() AND kedu_teacher_approved());

DROP POLICY IF EXISTS cw_items_teacher ON cw_items;
CREATE POLICY cw_items_teacher ON cw_items
  FOR ALL USING (bundle_id IN (SELECT id FROM cw_bundles WHERE teacher_id = cw_my_teacher_id()))
  WITH CHECK (
    bundle_id IN (SELECT id FROM cw_bundles WHERE teacher_id = cw_my_teacher_id())
    AND kedu_teacher_approved()
  );

DROP POLICY IF EXISTS cw_sends_teacher ON cw_sends;
CREATE POLICY cw_sends_teacher ON cw_sends
  FOR ALL USING (bundle_id IN (SELECT id FROM cw_bundles WHERE teacher_id = cw_my_teacher_id()))
  WITH CHECK (
    bundle_id IN (SELECT id FROM cw_bundles WHERE teacher_id = cw_my_teacher_id())
    AND class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = cw_my_teacher_id())
    AND kedu_teacher_approved()
  );

DO $do$ BEGIN
  IF to_regclass('public.ma_routines') IS NOT NULL THEN
    DROP POLICY IF EXISTS p_ma_routines_teacher ON ma_routines;
    CREATE POLICY p_ma_routines_teacher ON ma_routines FOR ALL TO authenticated
      USING (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = ma_my_teacher_id()))
      WITH CHECK (
        class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = ma_my_teacher_id())
        AND kedu_teacher_approved()
      );
  END IF;
END $do$;

-- ---------------------------------------------------------------
-- [8] 관리자 RPC — 이메일은 auth.users 에만 있어 SECURITY DEFINER 로 합쳐 준다(관리자만).
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_teacher_list()
RETURNS TABLE (
  id uuid, user_id uuid, name text, school text, email text,
  is_admin boolean, approval text, approval_note text,
  approval_requested_at timestamptz, approved_at timestamptz, created_at timestamptz,
  is_edu_email boolean
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT t.id, t.user_id, t.name, t.school, u.email::text,
         t.is_admin, t.approval, t.approval_note,
         t.approval_requested_at, t.approved_at, t.created_at,
         kedu_email_is_edu(u.email::text)
    FROM teachers t
    LEFT JOIN auth.users u ON u.id = t.user_id
   WHERE kedu_is_admin()
   ORDER BY (t.approval = 'pending') DESC, t.created_at DESC
$fn$;
GRANT EXECUTE ON FUNCTION admin_teacher_list() TO authenticated;

CREATE OR REPLACE FUNCTION admin_set_teacher_approval(p_teacher_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NOT kedu_is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_status NOT IN ('approved','rejected','pending') THEN
    RAISE EXCEPTION 'bad status: %', p_status USING ERRCODE = 'check_violation';
  END IF;
  UPDATE teachers
     SET approval    = p_status,
         approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE NULL END,
         approved_by = CASE WHEN p_status = 'approved' THEN auth.uid() ELSE NULL END
   WHERE id = p_teacher_id;
END;
$fn$;
GRANT EXECUTE ON FUNCTION admin_set_teacher_approval(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION admin_set_policy(p_key text, p_value jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NOT kedu_is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  UPDATE kedu_policy SET value = p_value, updated_at = now() WHERE key = p_key;
END;
$fn$;
GRANT EXECUTE ON FUNCTION admin_set_policy(text, jsonb) TO authenticated;

-- ---------------------------------------------------------------
-- [9] 교사 본인 — 승인 신청 메모(§D-3). teachers_update_own + 트리거②가 다른 컬럼을 되돌린다.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION request_teacher_approval(p_note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'login required' USING ERRCODE = 'insufficient_privilege';
  END IF;
  UPDATE teachers
     SET approval_note = left(COALESCE(p_note,''), 200),
         approval_requested_at = now()
   WHERE user_id = auth.uid() AND approval IN ('pending','rejected');
END;
$fn$;
GRANT EXECUTE ON FUNCTION request_teacher_approval(text) TO authenticated;

-- ---------------------------------------------------------------
-- 검산
--   SELECT key, value FROM kedu_policy;                                  → auto_approve_edu_domains false
--   SELECT count(*) AS n, count(*) FILTER (WHERE verified) AS v FROM edu_domains;   → 17 / 0
--   SELECT approval, count(*) FROM teachers GROUP BY 1;                  → 기존 행 전부 approved
--   SELECT kedu_email_is_edu('a@sen.go.kr') AS s, kedu_email_is_edu('a@gmail.com') AS g;  → true / false
--   SELECT policyname FROM pg_policies WHERE tablename='class_codes' AND policyname='teachers_insert_codes';
-- ---------------------------------------------------------------
