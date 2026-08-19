-- =============================================================
-- setup_morning_review.sql — 아침수학 오답 다시 보기 (학생용)
--
-- 설계 한 줄: 서버는 오답 '사진'을 따로 저장하지 않는다. 제출 봉투에 이미
--   set·seed·문항별 정오가 있고 케이퀴즈 생성이 seed 결정론이라, 화면이
--   그 봉투로 그날 그 문항을 비트 그대로 되살린다(스키마 변경 0).
--
-- [RPC] ma_my_wrong(p_days) — 나(학생)의 최근 수학 제출 중 틀린 문항이
--   하나라도 있는 날만. 학생 본인 전용(교사 열람은 별건으로 — 지금은 안 연다).
--   기본 30일: 템플릿을 수정하면 옛 seed 가 다른 문항을 낳을 수 있어
--   되살리기 유효기간을 짧게 잡는 완충이다(화면 쪽도 id 대조로 한 번 더 거른다).
--
-- 적용: Supabase SQL Editor 에서 이 파일 전체 실행(재실행 안전).
-- =============================================================

CREATE OR REPLACE FUNCTION ma_my_wrong(p_days int DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE v_pid uuid; v_cc uuid; v_res jsonb;
BEGIN
  SELECT pid, ccid INTO v_pid, v_cc FROM ma_my_profile();
  IF v_pid IS NULL THEN RETURN jsonb_build_object('status','no_profile'); END IF;

  SELECT jsonb_build_object(
    'status','ok',
    'days', COALESCE(jsonb_agg(jsonb_build_object(
        'run_date', se.run_date,
        'step',     se.step,
        'mode',     se.mode,
        'set',      su.payload->'detail'->>'set',
        'seed',     su.payload->'detail'->'seed',
        'n',        su.payload->'detail'->'n',
        'items',    su.payload->'detail'->'items'   -- [{id, answer, correct}] 전체 — 정오 판단은 화면이
      ) ORDER BY se.run_date DESC), '[]'::jsonb)
  ) INTO v_res
  FROM ma_submissions su
  JOIN ma_sessions se ON se.id = su.session_id
  WHERE su.student_profile_id = v_pid
    AND se.subject = 'math'
    AND se.run_date >= (now() AT TIME ZONE 'Asia/Seoul')::date - p_days
    AND su.payload->'detail'->>'set' IS NOT NULL
    -- 틀린 문항이 하나라도 있는 제출만 — 다 맞은 날은 오답노트에 나올 이유가 없다
    AND jsonb_path_exists(su.payload, '$.detail.items[*] ? (@.correct == false)');

  RETURN v_res;
END $fn$;
GRANT EXECUTE ON FUNCTION ma_my_wrong(int) TO authenticated;
