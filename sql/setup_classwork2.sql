-- setup_classwork2.sql — 케이박스 증분 2: 결과봉투 자동점수 + 채점 보존
--
-- 목적 두 가지
--   ① cw_submissions 에 자동채점 칸을 만든다(auto_score·auto_max·auto_kind·spent_sec·resubmitted).
--      지금은 봉투(KEDU_RESULT v1)가 payload jsonb 안에만 있어 교사 화면이 도구별로 따로 파내야 했다.
--   ② cw_submit 을 교체해 재제출이 교사 채점을 덮지 않게 한다.
--      현행 함정: ON CONFLICT DO UPDATE SET status='submitted' → 채점 완료 뒤 학생이 다시 내면
--      점수·피드백은 남는데 status 가 submitted 로 회귀해 '채점 안 한 것'처럼 보였다.
--
-- SPEC: handoff/classwork/SPEC_KBOX2_결과봉투_자동채점_학부모.md §2-1·§2-2
--       (§2-3~2-5 학부모 코드·report.html 은 채택하지 않음 — 학부모 화면은 parent/growth.html 로 일원화)
-- 의존: setup_classwork.sql (#14) · setup_classwork3.sql (#15) · setup_classwork4.sql (#17)
-- 실행: 준호 (Supabase SQL Editor). 멱등 — 재실행 안전.
--
-- 검산
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name='cw_submissions' AND column_name IN
--          ('auto_score','auto_max','auto_kind','spent_sec','resubmitted');
--   → 5행
--   SELECT proname FROM pg_proc WHERE proname='cw_submit';  → 1행

-- =============================================
-- [1] 자동채점 칸 (봉투에서 꺼내 열로 승격)
--   auto_score / auto_max = 도구가 매긴 점수·만점
--   auto_kind             = auto(자동) / artifact(작품) / manual(수동) — SPEC 3등급
--   spent_sec             = 활동에 쓴 시간(초)
--   resubmitted           = 채점 뒤 다시 낸 적 있음 → 교사 화면 🔁 뱃지
-- =============================================
ALTER TABLE cw_submissions ADD COLUMN IF NOT EXISTS auto_score  numeric;
ALTER TABLE cw_submissions ADD COLUMN IF NOT EXISTS auto_max    numeric;
ALTER TABLE cw_submissions ADD COLUMN IF NOT EXISTS auto_kind   text;
ALTER TABLE cw_submissions ADD COLUMN IF NOT EXISTS spent_sec   int;
ALTER TABLE cw_submissions ADD COLUMN IF NOT EXISTS resubmitted boolean NOT NULL DEFAULT false;

-- 이미 들어온 제출분 백필(payload 봉투 → 열). 봉투가 아닌 제출(남긴 말만)은 그대로 NULL.
UPDATE cw_submissions
   SET auto_score = COALESCE(auto_score, (payload->>'score')::numeric),
       auto_max   = COALESCE(auto_max,   (payload->>'max')::numeric),
       auto_kind  = COALESCE(auto_kind,   payload->>'kind'),
       spent_sec  = COALESCE(spent_sec,  (payload->>'spent_sec')::int)
 WHERE payload ? 'v'
   AND (auto_score IS NULL AND auto_max IS NULL AND auto_kind IS NULL AND spent_sec IS NULL);

-- =============================================
-- [2] cw_submit v2 — 봉투 추출 + 채점 보존
--   규칙: 교사가 매긴 score·feedback·status 는 학생 재제출로 절대 덮이지 않는다.
--         자동점수·답안(payload)은 최신으로 갱신하고, 채점 뒤 재제출이면 resubmitted=true.
-- =============================================
CREATE OR REPLACE FUNCTION cw_submit(p_bundle_id uuid, p_item_id uuid, p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE v_uid uuid; v_pid uuid; v_cc uuid; v_ok boolean; v_p jsonb;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RETURN jsonb_build_object('status','no_session'); END IF;

  SELECT sp.id, sp.class_code_id INTO v_pid, v_cc
    FROM student_profiles sp WHERE sp.user_id = v_uid LIMIT 1;
  IF v_pid IS NULL THEN RETURN jsonb_build_object('status','no_profile'); END IF;

  SELECT EXISTS(SELECT 1 FROM cw_sends s
                 WHERE s.bundle_id = p_bundle_id AND s.class_code_id = v_cc) INTO v_ok;
  IF NOT v_ok THEN RETURN jsonb_build_object('status','not_found'); END IF;

  v_p := COALESCE(p_payload, '{}'::jsonb);

  INSERT INTO cw_submissions (bundle_id, item_id, student_profile_id, class_code_id,
                              payload, status, submitted_at,
                              auto_score, auto_max, auto_kind, spent_sec)
  VALUES (p_bundle_id, p_item_id, v_pid, v_cc,
          v_p, 'submitted', now(),
          (v_p->>'score')::numeric,
          (v_p->>'max')::numeric,
          NULLIF(v_p->>'kind',''),
          (v_p->>'spent_sec')::int)
  ON CONFLICT (student_profile_id, item_id) DO UPDATE SET
    payload      = EXCLUDED.payload,
    auto_score   = EXCLUDED.auto_score,
    auto_max     = EXCLUDED.auto_max,
    auto_kind    = EXCLUDED.auto_kind,
    spent_sec    = EXCLUDED.spent_sec,
    resubmitted  = (cw_submissions.status = 'graded'),
    status       = CASE WHEN cw_submissions.status = 'graded' THEN 'graded' ELSE 'submitted' END,
    submitted_at = now();

  RETURN jsonb_build_object('status','ok');
END $fn$;

GRANT EXECUTE ON FUNCTION cw_submit(uuid, uuid, jsonb) TO authenticated;

-- 교사 채점 UPDATE 시 재제출 뱃지는 내려간다(채점으로 확인했다는 뜻).
-- 별도 트리거 없이 화면(classwork/index.html saveGrade)이 resubmitted=false 를 같이 보낸다.

NOTIFY pgrst, 'reload schema';
