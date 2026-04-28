-- =============================================
-- K-edu Supabase 권리 행사 채널 — 적법성 갭 #2 마감
-- 작성: 2026-04-29 (사이클 ㉝)
-- 명세: handoff/kedu/2026-04-27_kedu_적합성_자가점검.md (T08~T12)
-- 처리방침 v2 제8조 (정보주체의 권리·의무 및 행사방법) 대응
-- 분할: 본 파일 = SQL 단위 (1/3). 다음 사이클 = 교사 대시보드 UI.
--
-- 본 마이그레이션은 멱등(idempotent) — 재실행 안전.
-- 실행 전 필수: setup_tables.sql, setup_student_profiles.sql,
--               setup_diagnosis_v2.sql, setup_consent_confirmed.sql
--
-- 「개인정보 보호법」 대응:
--   - 제35조 개인정보 열람 (T08)
--   - 제36조 개인정보 정정·삭제 (T09)
--   - 제37조 개인정보 처리정지 (T11)
--   - 제38조 권리 행사 방법 — 10일 이내 처리 의무
-- =============================================


-- =============================================
-- [SECTION 1] data_requests 테이블 (T12)
-- 권리 행사 요청 이력 추적. 10일 이내 처리 의무 추적용 due_at GENERATED 컬럼.
-- =============================================
CREATE TABLE IF NOT EXISTS data_requests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_type text NOT NULL CHECK (request_type IN ('view', 'correct', 'delete', 'stop', 'export')),
  requester_type text NOT NULL CHECK (requester_type IN ('teacher', 'parent', 'admin')),
  requester_info text,                              -- 학부모 이메일/이름 등 자유 텍스트 (시스템 외 신청 대비)
  requester_user_id uuid REFERENCES auth.users(id), -- 시스템 내 신청자 (NULL이면 외부 채널)
  target_student_id uuid REFERENCES student_profiles(id) ON DELETE SET NULL,
  -- ON DELETE SET NULL: 학생 row가 직접 삭제되어도 처리 이력은 3년 보존 (처리방침 v2 제4조)
  target_class_code_id uuid REFERENCES class_codes(id) ON DELETE SET NULL,  -- 학급 단위 처리도 추적
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  note text,                                        -- 요청 사유, 처리 메모, 거부 사유
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES teachers(id),
  -- 10일 이내 처리 의무 자동 계산 (개인정보 보호법 제38조)
  due_at timestamptz GENERATED ALWAYS AS (requested_at + interval '10 days') STORED,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dr_target_student ON data_requests(target_student_id);
CREATE INDEX IF NOT EXISTS idx_dr_status ON data_requests(status);
CREATE INDEX IF NOT EXISTS idx_dr_pending_due ON data_requests(due_at) WHERE status IN ('pending', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_dr_requester ON data_requests(requester_user_id);

ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 교사: 본인 학급 학생/학급 관련 요청 SELECT/INSERT/UPDATE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='data_requests' AND policyname='dr_teacher_class') THEN
    CREATE POLICY "dr_teacher_class" ON data_requests
      FOR ALL USING (
        target_student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
        OR target_class_code_id IN (
          SELECT cc.id FROM class_codes cc
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      ) WITH CHECK (
        -- 교사는 본인 학급 외 요청 등록 불가
        target_student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
        OR target_class_code_id IN (
          SELECT cc.id FROM class_codes cc
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  -- 학부모: 본인 자녀 관련 요청 SELECT (이력 확인용)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='data_requests' AND policyname='dr_parent_read') THEN
    CREATE POLICY "dr_parent_read" ON data_requests
      FOR SELECT USING (
        target_student_id IN (
          SELECT psl.student_id FROM parent_student_links psl
          WHERE psl.parent_id = auth.uid() AND psl.verified_at IS NOT NULL
        )
      );
  END IF;
  -- 학부모: 본인 자녀 요청 신청 INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='data_requests' AND policyname='dr_parent_insert') THEN
    CREATE POLICY "dr_parent_insert" ON data_requests
      FOR INSERT WITH CHECK (
        requester_type = 'parent'
        AND requester_user_id = auth.uid()
        AND target_student_id IN (
          SELECT psl.student_id FROM parent_student_links psl
          WHERE psl.parent_id = auth.uid() AND psl.verified_at IS NOT NULL
        )
      );
  END IF;
  -- 어드민: 전체
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='data_requests' AND policyname='dr_admin_all') THEN
    CREATE POLICY "dr_admin_all" ON data_requests
      FOR ALL USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 2] 학생 처리정지 토글 — student_profiles.is_active (T11)
-- 처리방침 v2 제8조 1) "처리정지 요구" + 「개인정보 보호법」 제37조 대응.
-- =============================================
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS deactivated_at timestamptz;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS deactivation_reason text;

CREATE INDEX IF NOT EXISTS idx_sp_active_inactive ON student_profiles(is_active) WHERE is_active = false;

-- is_active 변경은 담임 교사·어드민만 가능 — 학생 본인은 자가 재활성화 불가.
-- 컬럼 단위 RLS는 PostgreSQL이 행 단위라 트리거로 강제.
CREATE OR REPLACE FUNCTION enforce_student_active_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.deactivated_at IS DISTINCT FROM OLD.deactivated_at
     OR NEW.deactivation_reason IS DISTINCT FROM OLD.deactivation_reason
  THEN
    -- 어드민
    IF EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true) THEN
      RETURN NEW;
    END IF;
    -- 본인 학급 담임 교사 (NEW 또는 OLD 학급 어느 쪽이든 일치하면 통과 — 학급 이동 케이스 대비)
    IF EXISTS (
      SELECT 1 FROM class_codes cc
      JOIN teachers t ON cc.teacher_id = t.id
      WHERE cc.id IN (NEW.class_code_id, OLD.class_code_id) AND t.user_id = auth.uid()
    ) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION '학생 처리정지(is_active) 변경은 담임 교사 또는 운영자만 가능합니다';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS sp_active_guard ON student_profiles;
CREATE TRIGGER sp_active_guard
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_student_active_change();

-- 교사: 본인 학급 학생 UPDATE 정책 (is_active 토글, 닉네임 정정 등)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_profiles' AND policyname='sp_teacher_update_class') THEN
    CREATE POLICY "sp_teacher_update_class" ON student_profiles
      FOR UPDATE USING (
        class_code_id IN (
          SELECT cc.id FROM class_codes cc
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_profiles' AND policyname='sp_admin_update_all') THEN
    CREATE POLICY "sp_admin_update_all" ON student_profiles
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 3] 처리정지 학생 INSERT 차단 — scores·wrong_answers·homework_completions
-- is_active=false 학생은 학습 데이터 신규 INSERT 불가 (RLS WITH CHECK 강화).
-- 클라이언트 우회 방지: tracker.js를 우회해 직접 호출해도 DB 단에서 거부.
-- =============================================
DO $$ BEGIN
  -- scores
  DROP POLICY IF EXISTS "scores_student_own" ON scores;
  CREATE POLICY "scores_student_own" ON scores
    FOR ALL USING (
      student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
    ) WITH CHECK (
      student_id IN (
        SELECT id FROM student_profiles
        WHERE user_id = auth.uid() AND is_active = true
      )
    );
  -- wrong_answers
  DROP POLICY IF EXISTS "wa_student_own" ON wrong_answers;
  CREATE POLICY "wa_student_own" ON wrong_answers
    FOR ALL USING (
      student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
    ) WITH CHECK (
      student_id IN (
        SELECT id FROM student_profiles
        WHERE user_id = auth.uid() AND is_active = true
      )
    );
  -- homework_completions
  DROP POLICY IF EXISTS "hc_student_own" ON homework_completions;
  CREATE POLICY "hc_student_own" ON homework_completions
    FOR ALL USING (
      student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
    ) WITH CHECK (
      student_id IN (
        SELECT id FROM student_profiles
        WHERE user_id = auth.uid() AND is_active = true
      )
    );
END $$;


-- =============================================
-- [SECTION 4] 교사·어드민 학생 데이터 DELETE 권한 — T09
-- 처리방침 v2 제8조 1) "삭제 요구" + 제7조 2) 법정대리인 삭제 요구 대응.
-- 학부모 동의 철회 → 교사가 케이에듀 관리 패널에서 자녀 데이터 일괄 삭제.
-- 어드민(준호)은 보호책임자 직접 요청 처리용.
-- =============================================
DO $$ BEGIN
  -- scores
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scores' AND policyname='scores_teacher_delete') THEN
    CREATE POLICY "scores_teacher_delete" ON scores
      FOR DELETE USING (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scores' AND policyname='scores_admin_delete') THEN
    CREATE POLICY "scores_admin_delete" ON scores
      FOR DELETE USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
  -- wrong_answers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wrong_answers' AND policyname='wa_teacher_delete') THEN
    CREATE POLICY "wa_teacher_delete" ON wrong_answers
      FOR DELETE USING (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wrong_answers' AND policyname='wa_admin_delete') THEN
    CREATE POLICY "wa_admin_delete" ON wrong_answers
      FOR DELETE USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
  -- homework_completions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='homework_completions' AND policyname='hc_teacher_delete') THEN
    CREATE POLICY "hc_teacher_delete" ON homework_completions
      FOR DELETE USING (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON sp.class_code_id = cc.id
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='homework_completions' AND policyname='hc_admin_delete') THEN
    CREATE POLICY "hc_admin_delete" ON homework_completions
      FOR DELETE USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
  -- student_profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_profiles' AND policyname='sp_teacher_delete_class') THEN
    CREATE POLICY "sp_teacher_delete_class" ON student_profiles
      FOR DELETE USING (
        class_code_id IN (
          SELECT cc.id FROM class_codes cc
          JOIN teachers t ON cc.teacher_id = t.id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_profiles' AND policyname='sp_admin_delete_all') THEN
    CREATE POLICY "sp_admin_delete_all" ON student_profiles
      FOR DELETE USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
END $$;


-- =============================================
-- [SECTION 5] 학생 데이터 일괄 삭제 헬퍼 — T09
-- 한 학생의 모든 학습 데이터를 단일 트랜잭션에서 삭제 + 닉네임 익명화 + 이력 자동 기록.
-- 호출자: 담임 교사 또는 어드민 (함수 내부에서 권한 재검증).
-- 반환: jsonb { deleted: {...}, profile_anonymized: bool, request_id }
--
-- 삭제 정책: student_profiles 자체는 보존 (감사 추적용), 닉네임만 익명화.
-- 닉네임 패턴: '[삭제됨_xxxxxxxx]' (uuid 앞 8자) — 식별 불가.
-- =============================================
CREATE OR REPLACE FUNCTION delete_student_data(
  p_student_id uuid,
  p_request_id bigint DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  c_scores bigint;
  c_wrong  bigint;
  c_hwc    bigint;
  c_seats  bigint;
  c_links  bigint;
  v_class_code_id uuid;
  v_teacher_id uuid;
  v_is_admin boolean;
BEGIN
  -- 학생 학급 조회
  SELECT sp.class_code_id INTO v_class_code_id
    FROM student_profiles sp WHERE sp.id = p_student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'delete_student_data: 학생 ID 없음 (%)', p_student_id;
  END IF;

  -- 권한 검증: 어드민 OR 담임 교사
  v_is_admin := EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true);

  IF NOT v_is_admin AND NOT EXISTS (
    SELECT 1 FROM class_codes cc
    JOIN teachers t ON cc.teacher_id = t.id
    WHERE cc.id = v_class_code_id AND t.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'delete_student_data: 권한 없음 (담임 교사 또는 운영자만 호출 가능)';
  END IF;

  SELECT id INTO v_teacher_id FROM teachers WHERE user_id = auth.uid() LIMIT 1;

  -- 학습 데이터 삭제 (FK ON DELETE CASCADE 미지원 테이블 우선)
  DELETE FROM scores WHERE student_id = p_student_id;
    GET DIAGNOSTICS c_scores = ROW_COUNT;
  DELETE FROM wrong_answers WHERE student_id = p_student_id;
    GET DIAGNOSTICS c_wrong = ROW_COUNT;
  DELETE FROM homework_completions WHERE student_id = p_student_id;
    GET DIAGNOSTICS c_hwc = ROW_COUNT;
  DELETE FROM parent_student_links WHERE student_id = p_student_id;
    GET DIAGNOSTICS c_links = ROW_COUNT;

  -- student_seats: claim 해제 (행 자체는 학년 와이프에서 삭제, 슬롯은 학급 단위 자산)
  UPDATE student_seats
    SET claimed_by = NULL, claimed_at = NULL
    WHERE claimed_by = p_student_id;
    GET DIAGNOSTICS c_seats = ROW_COUNT;

  -- student_profiles 닉네임 익명화 + 처리정지 (감사 추적용 row 보존)
  UPDATE student_profiles
    SET nickname = '[삭제됨_' || left(id::text, 8) || ']',
        is_active = false,
        deactivated_at = now(),
        deactivation_reason = COALESCE(p_note, '권리 행사 — 데이터 삭제 요청')
    WHERE id = p_student_id;

  -- data_requests 이력
  IF p_request_id IS NOT NULL THEN
    UPDATE data_requests
      SET status = 'completed',
          processed_at = now(),
          processed_by = v_teacher_id,
          note = COALESCE(p_note, note)
      WHERE id = p_request_id;
  ELSE
    INSERT INTO data_requests(
      request_type, requester_type, requester_user_id,
      target_student_id, status, processed_at, processed_by, note
    ) VALUES (
      'delete',
      CASE WHEN v_is_admin THEN 'admin' ELSE 'teacher' END,
      auth.uid(),
      p_student_id, 'completed', now(), v_teacher_id, p_note
    );
  END IF;

  RETURN jsonb_build_object(
    'student_id', p_student_id,
    'deleted', jsonb_build_object(
      'scores', c_scores,
      'wrong_answers', c_wrong,
      'homework_completions', c_hwc,
      'parent_links', c_links,
      'seats_unclaimed', c_seats
    ),
    'profile_anonymized', true,
    'request_id', p_request_id
  );
END $$;


-- =============================================
-- [SECTION 6] 처리정지 토글 헬퍼 — T11
-- 교사·어드민이 학생 처리정지/재활성화. data_requests 이력 자동 기록.
-- =============================================
CREATE OR REPLACE FUNCTION toggle_student_processing(
  p_student_id uuid,
  p_active boolean,
  p_request_id bigint DEFAULT NULL,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_class_code_id uuid;
  v_teacher_id uuid;
  v_is_admin boolean;
BEGIN
  SELECT sp.class_code_id INTO v_class_code_id
    FROM student_profiles sp WHERE sp.id = p_student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'toggle_student_processing: 학생 ID 없음 (%)', p_student_id;
  END IF;

  v_is_admin := EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true);

  IF NOT v_is_admin AND NOT EXISTS (
    SELECT 1 FROM class_codes cc
    JOIN teachers t ON cc.teacher_id = t.id
    WHERE cc.id = v_class_code_id AND t.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'toggle_student_processing: 권한 없음';
  END IF;

  SELECT id INTO v_teacher_id FROM teachers WHERE user_id = auth.uid() LIMIT 1;

  UPDATE student_profiles
    SET is_active = p_active,
        deactivated_at = CASE WHEN p_active = false THEN now() ELSE NULL END,
        deactivation_reason = CASE WHEN p_active = false THEN p_reason ELSE NULL END
    WHERE id = p_student_id;

  IF p_request_id IS NOT NULL THEN
    UPDATE data_requests
      SET status = 'completed',
          processed_at = now(),
          processed_by = v_teacher_id,
          note = COALESCE(p_reason, note)
      WHERE id = p_request_id;
  ELSE
    INSERT INTO data_requests(
      request_type, requester_type, requester_user_id,
      target_student_id, status, processed_at, processed_by, note
    ) VALUES (
      'stop',
      CASE WHEN v_is_admin THEN 'admin' ELSE 'teacher' END,
      auth.uid(),
      p_student_id, 'completed', now(), v_teacher_id, p_reason
    );
  END IF;

  RETURN jsonb_build_object(
    'student_id', p_student_id,
    'is_active', p_active,
    'reason', p_reason,
    'request_id', p_request_id
  );
END $$;


-- =============================================
-- [SECTION 7] 학생 데이터 통합 조회 뷰 — T08·T10 지원
-- 교사·어드민·학부모가 학생 1명의 진척도 + 약점 + 시간을 한 번에 조회.
-- CSV 내보내기(T10) 시 본 뷰에서 학급 단위 필터링.
-- 자존감 보호 원칙: 본 뷰는 교사·어드민·학부모용. 학생 본인 화면에는 정량 비공개.
-- =============================================
CREATE OR REPLACE VIEW student_data_summary
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
  -- 학습 통계
  COALESCE((SELECT COUNT(*) FROM scores s WHERE s.student_id = sp.id), 0)::int                        AS total_questions,
  COALESCE((SELECT COUNT(*) FROM scores s WHERE s.student_id = sp.id AND s.is_correct), 0)::int       AS correct_questions,
  COALESCE((SELECT COUNT(DISTINCT lesson_id) FROM scores s WHERE s.student_id = sp.id), 0)::int        AS lessons_attempted,
  COALESCE((SELECT SUM(time_spent_sec) FROM scores s WHERE s.student_id = sp.id), 0)::int             AS total_time_sec,
  -- 오답노트
  COALESCE((SELECT COUNT(*) FROM wrong_answers wa WHERE wa.student_id = sp.id AND wa.resolved_at IS NULL), 0)::int AS unresolved_wrong_count,
  -- 숙제
  COALESCE((SELECT COUNT(*) FROM homework_completions hc WHERE hc.student_id = sp.id), 0)::int        AS homework_completed_count
FROM student_profiles sp
LEFT JOIN class_codes cc ON sp.class_code_id = cc.id;

-- 뷰는 student_profiles RLS를 따름 — 교사는 본인 학급만 조회.


-- =============================================
-- [SECTION 8] 미처리·연체 요청 알림 뷰 — 10일 이내 의무 추적
-- 교사 대시보드 알림 배지·운영자 보고용.
-- =============================================
CREATE OR REPLACE VIEW data_requests_overdue
WITH (security_invoker = true) AS
SELECT
  dr.id,
  dr.request_type,
  dr.requester_type,
  dr.requester_info,
  dr.requester_user_id,
  dr.target_student_id,
  dr.target_class_code_id,
  dr.status,
  dr.note,
  dr.requested_at,
  dr.processed_at,
  dr.processed_by,
  dr.due_at,
  ROUND(EXTRACT(EPOCH FROM (now() - dr.requested_at)) / 86400)::int AS days_elapsed,
  ROUND(EXTRACT(EPOCH FROM (dr.due_at - now())) / 86400)::int       AS days_remaining,
  CASE
    WHEN now() > dr.due_at THEN 'overdue'
    WHEN now() > dr.due_at - interval '3 days' THEN 'urgent'
    ELSE 'on_track'
  END AS urgency
FROM data_requests dr
WHERE dr.status IN ('pending', 'in_progress');

-- 뷰는 data_requests RLS를 따름.


-- =============================================
-- [검증 쿼리 — 실행 후 점검용]
-- =============================================
-- (1) 테이블·컬럼 생성 확인
--     SELECT column_name, data_type, is_nullable
--       FROM information_schema.columns
--       WHERE table_name = 'data_requests' ORDER BY ordinal_position;
--     SELECT column_name FROM information_schema.columns
--       WHERE table_name='student_profiles' AND column_name IN ('is_active','deactivated_at','deactivation_reason');
--
-- (2) 정책 등록 확인
--     SELECT tablename, policyname FROM pg_policies
--       WHERE tablename IN ('data_requests','student_profiles','scores','wrong_answers','homework_completions')
--       ORDER BY tablename, policyname;
--
-- (3) 트리거 확인
--     SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname = 'sp_active_guard';
--
-- (4) 함수 호출 시뮬레이션 (실제 학생 ID 대입)
--     -- SELECT toggle_student_processing('학생-uuid'::uuid, false, NULL, '학부모 처리정지 요청');
--     -- SELECT delete_student_data('학생-uuid'::uuid, NULL, '학부모 동의 철회');
--
-- (5) 미처리 요청 확인
--     -- SELECT * FROM data_requests_overdue ORDER BY urgency DESC, days_remaining;

-- =============================================
-- 다음 사이클: 교사 대시보드 학생 관리 UI
--   - teacher/index.html 학생 관리 패널 신설
--   - 학생 행 옆 [열람][CSV][처리정지][삭제] 액션 버튼
--   - data_requests 미처리 알림 배지 (overdue/urgent)
--   - 학부모용 학부모 대시보드는 추후 별도 사이클 (parent/index.html)
-- =============================================
