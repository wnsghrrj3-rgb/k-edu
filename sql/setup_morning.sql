-- =============================================
-- setup_morning.sql — 아침활동(케이모닝) 스키마
--
-- 케이박스와의 차이: 케이박스는 교사가 그때그때 골라 담아 "보내는" 구조지만,
--   아침활동은 요일 시간표를 한 번 짜두면 매일 아침 그날 것이 저절로 떠 있어야 한다.
--   그래서 발송(cw_sends)이 없고, 대신 "그날 회차를 자동으로 정하는" 규칙이 핵심이다.
--
-- 식별 체인(기존 그대로): auth.uid() → student_profiles(id, class_code_id)
--                        auth.uid() → teachers.id → class_codes.teacher_id
-- 의존: setup_tables.sql(teachers, class_codes), setup_student_profiles.sql(student_profiles)
--
-- 진도 규칙: 학급×과목마다 "다음 회차"를 들고 있다가, 그 과목의 날이 오면 하나씩 올린다.
--   마지막 회차를 넘기면 복습 모드(review)로 전환해 전체 누적에서 출제한다 — 끝나도 멈추지 않는다.
-- 문제 재현: 세션의 seed_base와 학생 프로필로 학생별 seed를 파생한다(같은 학생은 재접속해도 같은 문제, 옆자리와는 다른 문제).
-- =============================================

-- ---------------------------------------------
-- [1] ma_routines — 학급의 요일 시간표
--   days: {"mon":"hanja","tue":"english",...} 형태. 값이 없거나 null인 요일은 아침활동 없음.
--   한 학급에 한 줄(교사가 학급별로 다르게 운영).
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ma_routines (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code_id uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  teacher_id    uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  grade         int  NOT NULL DEFAULT 1 CHECK (grade BETWEEN 1 AND 6),
  days          jsonb NOT NULL DEFAULT '{}'::jsonb,
  question_count int NOT NULL DEFAULT 10 CHECK (question_count BETWEEN 5 AND 20),
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (class_code_id)
);

-- ---------------------------------------------
-- [2] ma_progress — 학급×과목의 다음 회차(자동 순차의 상태값)
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ma_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code_id uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  subject       text NOT NULL,
  next_step     int  NOT NULL DEFAULT 1,
  cycle         int  NOT NULL DEFAULT 1,      -- 전 회차를 한 바퀴 돈 횟수(복습 회차 구분)
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (class_code_id, subject)
);

-- ---------------------------------------------
-- [3] ma_sessions — 그날 실제로 배급된 회차 (하루 한 학급 하나)
--   mode: 'new'(진도) | 'review'(전 회차 소진 후 누적 복습)
--   lesson_key: 케이퀴즈 등록 키(예: g1_hanja_s03). 클라이언트가 이걸로 문제를 생성한다.
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ma_sessions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code_id  uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  run_date       date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Seoul')::date,
  subject        text NOT NULL,
  grade          int  NOT NULL,
  step           int  NOT NULL,
  mode           text NOT NULL DEFAULT 'new' CHECK (mode IN ('new','review')),
  lesson_key     text NOT NULL,
  question_count int  NOT NULL DEFAULT 10,
  seed_base      bigint NOT NULL,
  created_at     timestamptz DEFAULT now(),
  UNIQUE (class_code_id, run_date)
);
CREATE INDEX IF NOT EXISTS idx_ma_sessions_class ON ma_sessions(class_code_id, run_date DESC);

-- ---------------------------------------------
-- [4] ma_submissions — 학생 제출 + 자동채점 + 교사 피드백
--   payload: 케이퀴즈 결과 봉투(score/max/detail) — 채점은 도구가, 저장은 여기가.
--   detail 안의 문항별 정오가 그대로 남아 누적 통계의 재료가 된다.
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ma_submissions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id         uuid NOT NULL REFERENCES ma_sessions(id) ON DELETE CASCADE,
  student_profile_id uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  class_code_id      uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE,
  payload            jsonb NOT NULL DEFAULT '{}'::jsonb,
  auto_score         numeric,
  auto_max           numeric,
  spent_sec          int,
  status             text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','graded')),
  score              numeric,
  feedback           text DEFAULT '',
  submitted_at       timestamptz DEFAULT now(),
  graded_at          timestamptz,
  graded_by          uuid REFERENCES teachers(id) ON DELETE SET NULL,
  UNIQUE (session_id, student_profile_id)
);
CREATE INDEX IF NOT EXISTS idx_ma_subs_session ON ma_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_ma_subs_student ON ma_submissions(student_profile_id, submitted_at DESC);

-- =============================================
-- RLS — 교사는 자기 학급만, 학생은 자기 것만
-- =============================================
ALTER TABLE ma_routines    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ma_progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ma_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ma_submissions ENABLE ROW LEVEL SECURITY;

-- 교사 id 조회(케이박스와 동일 규약)
CREATE OR REPLACE FUNCTION ma_my_teacher_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM teachers WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 학생 프로필 조회
CREATE OR REPLACE FUNCTION ma_my_profile() RETURNS TABLE(pid uuid, ccid uuid)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id, class_code_id FROM student_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

DO $$ BEGIN
  -- 교사: 자기 학급 루틴 전권
  DROP POLICY IF EXISTS p_ma_routines_teacher ON ma_routines;
  CREATE POLICY p_ma_routines_teacher ON ma_routines FOR ALL TO authenticated
    USING (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = ma_my_teacher_id()))
    WITH CHECK (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = ma_my_teacher_id()));

  -- 학생: 자기 학급 루틴 읽기만(오늘 뭐 하는지 알아야 하므로)
  DROP POLICY IF EXISTS p_ma_routines_student ON ma_routines;
  CREATE POLICY p_ma_routines_student ON ma_routines FOR SELECT TO authenticated
    USING (class_code_id IN (SELECT ccid FROM ma_my_profile()));

  DROP POLICY IF EXISTS p_ma_progress_teacher ON ma_progress;
  CREATE POLICY p_ma_progress_teacher ON ma_progress FOR ALL TO authenticated
    USING (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = ma_my_teacher_id()))
    WITH CHECK (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = ma_my_teacher_id()));

  DROP POLICY IF EXISTS p_ma_sessions_read ON ma_sessions;
  CREATE POLICY p_ma_sessions_read ON ma_sessions FOR SELECT TO authenticated
    USING (
      class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = ma_my_teacher_id())
      OR class_code_id IN (SELECT ccid FROM ma_my_profile())
    );

  -- 제출: 학생은 자기 것, 교사는 자기 학급 것
  DROP POLICY IF EXISTS p_ma_subs_student ON ma_submissions;
  CREATE POLICY p_ma_subs_student ON ma_submissions FOR SELECT TO authenticated
    USING (student_profile_id IN (SELECT pid FROM ma_my_profile()));

  DROP POLICY IF EXISTS p_ma_subs_teacher ON ma_submissions;
  CREATE POLICY p_ma_subs_teacher ON ma_submissions FOR ALL TO authenticated
    USING (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = ma_my_teacher_id()))
    WITH CHECK (class_code_id IN (SELECT id FROM class_codes WHERE teacher_id = ma_my_teacher_id()));
END $$;

-- =============================================
-- [RPC] ma_set_routine — 교사: 요일 시간표 저장
-- =============================================
CREATE OR REPLACE FUNCTION ma_set_routine(
  p_class_code_id uuid, p_grade int, p_days jsonb,
  p_question_count int DEFAULT 10, p_active boolean DEFAULT true
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_tid uuid; v_old_grade int; v_reset boolean := false;
BEGIN
  v_tid := ma_my_teacher_id();
  IF v_tid IS NULL THEN RETURN jsonb_build_object('status','not_teacher'); END IF;
  IF NOT EXISTS (SELECT 1 FROM class_codes WHERE id = p_class_code_id AND teacher_id = v_tid) THEN
    RETURN jsonb_build_object('status','not_my_class');
  END IF;

  SELECT grade INTO v_old_grade FROM ma_routines WHERE class_code_id = p_class_code_id;

  INSERT INTO ma_routines (class_code_id, teacher_id, grade, days, question_count, active)
  VALUES (p_class_code_id, v_tid, p_grade, p_days, p_question_count, p_active)
  ON CONFLICT (class_code_id) DO UPDATE
    SET grade = EXCLUDED.grade, days = EXCLUDED.days,
        question_count = EXCLUDED.question_count, active = EXCLUDED.active,
        teacher_id = EXCLUDED.teacher_id, updated_at = now();

  -- ★학년이 바뀌면 진도를 1회차로 되돌린다.
  --   학년마다 배우는 글자가 통째로 다르므로 회차 번호를 이어받으면 안 된다.
  --   (예: 1학년으로 3일 하다 4학년으로 바꾸면 next_step=4 → 4학년 s01~s03 30자를 통째로 건너뛴다)
  --   같은 트랜잭션에서 처리해 "학년만 바뀌고 진도는 그대로"인 어긋난 상태가 생기지 않게 한다.
  IF v_old_grade IS NOT NULL AND v_old_grade <> p_grade THEN
    UPDATE ma_progress SET next_step = 1, cycle = 1, updated_at = now()
     WHERE class_code_id = p_class_code_id;
    v_reset := true;
  END IF;

  RETURN jsonb_build_object('status','ok', 'grade_changed', v_reset,
                            'from_grade', v_old_grade, 'to_grade', p_grade);
END $$;
GRANT EXECUTE ON FUNCTION ma_set_routine(uuid,int,jsonb,int,boolean) TO authenticated;

-- =============================================
-- [보조] ma_max_step — 과목 × 학년의 총 일차 수
--   ★ 한자 진도 단위 = 하루 1자. 매일 하는 활동이 1년을 버텨야 하므로
--     하루 10자(회차)로는 5~10일 만에 끝나 버린다 → 글자 단위로 바꿈.
--     1·2·3학년 =  50자 →  50일차 (약 10주)
--     4·5학년   =  75자 →  75일차 (약 15주)
--     6학년     = 100자 → 100일차 (약 20주)
--   원장은 kedu/quiz/templates/hanja_data.js. 이 표와 어긋나면
--   kedu/quiz/test_hanja_morning.js 가 이 파일을 직접 읽어 잡아낸다.
-- =============================================
CREATE OR REPLACE FUNCTION ma_max_step(p_subject text, p_grade int)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_subject = 'hanja' AND p_grade IN (1,2,3) THEN 50
    WHEN p_subject = 'hanja' AND p_grade IN (4,5)   THEN 75
    WHEN p_subject = 'hanja' AND p_grade  = 6       THEN 100
    ELSE 50
  END;
$$;
GRANT EXECUTE ON FUNCTION ma_max_step(text,int) TO authenticated;

-- =============================================
-- [RPC] ma_today — 오늘 것 가져오기 (학생·교사 공용)
--   호출 시점에 그날 세션이 없으면 요일 시간표를 보고 자동으로 만든다.
--   즉 교사가 아무것도 누르지 않아도, 학생이 아침에 열면 그날 것이 생성돼 있다.
--   ★ 진도 상승은 세션이 "처음 만들어질 때" 딱 한 번 일어난다(중복 상승 없음).
-- =============================================
CREATE OR REPLACE FUNCTION ma_today(p_class_code_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_cc uuid; v_pid uuid; v_is_teacher boolean := false;
  v_r ma_routines%ROWTYPE; v_dow text; v_subject text;
  v_sess ma_sessions%ROWTYPE; v_step int; v_cycle int; v_max_step int;
  v_mode text; v_key text; v_today date; v_sub jsonb; v_seed bigint;
BEGIN
  v_today := (now() AT TIME ZONE 'Asia/Seoul')::date;

  -- 호출자 판별: 학생이면 자기 학급, 교사면 인자로 받은 학급
  SELECT pid, ccid INTO v_pid, v_cc FROM ma_my_profile();
  IF v_pid IS NULL THEN
    v_cc := p_class_code_id; v_is_teacher := true;
    IF v_cc IS NULL OR ma_my_teacher_id() IS NULL THEN
      RETURN jsonb_build_object('status','no_profile');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM class_codes WHERE id = v_cc AND teacher_id = ma_my_teacher_id()) THEN
      RETURN jsonb_build_object('status','not_my_class');
    END IF;
  END IF;

  SELECT * INTO v_r FROM ma_routines WHERE class_code_id = v_cc;
  IF v_r.id IS NULL OR NOT v_r.active THEN
    RETURN jsonb_build_object('status','no_routine');
  END IF;

  -- 이미 오늘 세션이 있으면 그대로(진도 재상승 없음)
  SELECT * INTO v_sess FROM ma_sessions WHERE class_code_id = v_cc AND run_date = v_today;

  IF v_sess.id IS NULL THEN
    v_dow := lower(to_char(v_today, 'dy'));               -- mon, tue, ...
    v_subject := v_r.days ->> v_dow;
    IF v_subject IS NULL OR v_subject = '' THEN
      RETURN jsonb_build_object('status','off_day', 'dow', v_dow);
    END IF;

    -- 진도 읽기(없으면 1회차부터)
    INSERT INTO ma_progress (class_code_id, subject) VALUES (v_cc, v_subject)
      ON CONFLICT (class_code_id, subject) DO NOTHING;
    SELECT next_step, cycle INTO v_step, v_cycle
      FROM ma_progress WHERE class_code_id = v_cc AND subject = v_subject;

    -- 과목 × 학년별 총 일차 (학년마다 신출 자수가 달라 학년을 함께 넘긴다)
    v_max_step := ma_max_step(v_subject, v_r.grade);

    IF v_step > v_max_step THEN                            -- 한 바퀴 다 돌면 복습 모드
      v_mode := 'review';
      v_step := ((v_step - 1) % v_max_step) + 1;
    ELSE
      v_mode := 'new';
    END IF;

    -- 하루 1자 키: g4_hanja_c015 = 4학년 15일차(15번째 글자)
    v_key := 'g' || v_r.grade || '_' || v_subject || '_c' || lpad(v_step::text, 3, '0');
    v_seed := (extract(epoch from now())::bigint % 1000000000);

    INSERT INTO ma_sessions (class_code_id, run_date, subject, grade, step, mode, lesson_key, question_count, seed_base)
    VALUES (v_cc, v_today, v_subject, v_r.grade, v_step, v_mode, v_key, v_r.question_count, v_seed)
    ON CONFLICT (class_code_id, run_date) DO NOTHING;
    SELECT * INTO v_sess FROM ma_sessions WHERE class_code_id = v_cc AND run_date = v_today;

    -- 진도 한 칸 전진(다음 그 과목 날에 다음 회차가 나온다)
    UPDATE ma_progress
       SET next_step = next_step + 1,
           cycle = CASE WHEN next_step + 1 > v_max_step * (cycle) THEN cycle + 1 ELSE cycle END,
           updated_at = now()
     WHERE class_code_id = v_cc AND subject = v_subject;
  END IF;

  -- 학생이면 내 제출 상태와 내 seed를 함께 준다
  IF v_pid IS NOT NULL THEN
    SELECT jsonb_build_object(
      'submitted', true, 'status', s.status, 'auto_score', s.auto_score,
      'auto_max', s.auto_max, 'score', s.score, 'feedback', s.feedback,
      'submitted_at', s.submitted_at
    ) INTO v_sub FROM ma_submissions s
     WHERE s.session_id = v_sess.id AND s.student_profile_id = v_pid;
  END IF;

  RETURN jsonb_build_object(
    'status','ok',
    'session_id', v_sess.id,
    'run_date', v_sess.run_date,
    'subject', v_sess.subject,
    'grade', v_sess.grade,
    'step', v_sess.step,
    'mode', v_sess.mode,
    'lesson_key', v_sess.lesson_key,
    'question_count', v_sess.question_count,
    -- 학생별 seed 파생: 같은 학생은 재접속해도 같은 문제, 옆자리와는 다른 문제
    'seed', CASE WHEN v_pid IS NULL THEN v_sess.seed_base
                 ELSE (v_sess.seed_base + ('x' || substr(md5(v_pid::text), 1, 8))::bit(32)::bigint) % 2147483647 END,
    'my', COALESCE(v_sub, jsonb_build_object('submitted', false)),
    'is_teacher', v_is_teacher
  );
END $$;
GRANT EXECUTE ON FUNCTION ma_today(uuid) TO authenticated;

-- =============================================
-- [RPC] ma_submit — 학생: 답안 제출(자동채점 봉투 저장)
--   다시 풀면 갱신하되, 교사가 이미 채점한 건 채점 결과를 지우지 않는다.
-- =============================================
CREATE OR REPLACE FUNCTION ma_submit(p_session_id uuid, p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_pid uuid; v_cc uuid; v_scc uuid;
BEGIN
  SELECT pid, ccid INTO v_pid, v_cc FROM ma_my_profile();
  IF v_pid IS NULL THEN RETURN jsonb_build_object('status','no_profile'); END IF;

  SELECT class_code_id INTO v_scc FROM ma_sessions WHERE id = p_session_id;
  IF v_scc IS NULL OR v_scc <> v_cc THEN RETURN jsonb_build_object('status','not_my_session'); END IF;

  INSERT INTO ma_submissions (
    session_id, student_profile_id, class_code_id, payload,
    auto_score, auto_max, spent_sec, status, submitted_at
  ) VALUES (
    p_session_id, v_pid, v_cc, p_payload,
    NULLIF(p_payload->>'score','')::numeric, NULLIF(p_payload->>'max','')::numeric,
    NULLIF(p_payload->>'spent_sec','')::int, 'submitted', now()
  )
  ON CONFLICT (session_id, student_profile_id) DO UPDATE SET
    payload      = EXCLUDED.payload,
    auto_score   = EXCLUDED.auto_score,
    auto_max     = EXCLUDED.auto_max,
    spent_sec    = EXCLUDED.spent_sec,
    submitted_at = now(),
    -- 채점 완료분은 상태·점수·피드백을 보존(재제출로 교사 채점이 증발하지 않게)
    status       = ma_submissions.status;

  RETURN jsonb_build_object('status','ok');
END $$;
GRANT EXECUTE ON FUNCTION ma_submit(uuid, jsonb) TO authenticated;

-- =============================================
-- [RPC] ma_board — 교사: 오늘 제출 현황(미제출 학생 포함)
--   교실에서 제일 먼저 필요한 정보가 "안 낸 아이 명단"이라 명단 전체를 왼쪽 조인한다.
-- =============================================
CREATE OR REPLACE FUNCTION ma_board(p_session_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_tid uuid; v_cc uuid; v_res jsonb; v_sess ma_sessions%ROWTYPE;
BEGIN
  v_tid := ma_my_teacher_id();
  IF v_tid IS NULL THEN RETURN jsonb_build_object('status','not_teacher'); END IF;
  SELECT * INTO v_sess FROM ma_sessions WHERE id = p_session_id;
  IF v_sess.id IS NULL THEN RETURN jsonb_build_object('status','no_session'); END IF;
  IF NOT EXISTS (SELECT 1 FROM class_codes WHERE id = v_sess.class_code_id AND teacher_id = v_tid) THEN
    RETURN jsonb_build_object('status','not_my_class');
  END IF;
  v_cc := v_sess.class_code_id;

  SELECT jsonb_build_object(
    'status','ok',
    'session', jsonb_build_object('id', v_sess.id, 'subject', v_sess.subject, 'step', v_sess.step,
                                  'mode', v_sess.mode, 'run_date', v_sess.run_date,
                                  'lesson_key', v_sess.lesson_key),
    'rows', COALESCE(jsonb_agg(r ORDER BY r->>'nickname'), '[]'::jsonb),
    'summary', jsonb_build_object(
      'total', count(*),
      'submitted', count(*) FILTER (WHERE (r->>'submitted')::boolean),
      'graded', count(*) FILTER (WHERE r->>'status' = 'graded')
    )
  ) INTO v_res
  FROM (
    SELECT jsonb_build_object(
      'student_profile_id', sp.id,
      'nickname', sp.nickname,
      'submitted', (su.id IS NOT NULL),
      'status', su.status,
      'auto_score', su.auto_score,
      'auto_max', su.auto_max,
      'score', su.score,
      'feedback', su.feedback,
      'spent_sec', su.spent_sec,
      'submitted_at', su.submitted_at,
      'detail', su.payload->'detail'
    ) AS r
    FROM student_profiles sp
    LEFT JOIN ma_submissions su
           ON su.student_profile_id = sp.id AND su.session_id = p_session_id
    WHERE sp.class_code_id = v_cc
  ) t;

  RETURN v_res;
END $$;
GRANT EXECUTE ON FUNCTION ma_board(uuid) TO authenticated;

-- =============================================
-- [RPC] ma_grade — 교사: 점수 확정·피드백 (자동점수 일괄 반영 지원)
--   p_student_profile_id 가 NULL이면 그 세션 제출자 전원에게 자동점수를 그대로 확정한다.
-- =============================================
CREATE OR REPLACE FUNCTION ma_grade(
  p_session_id uuid, p_student_profile_id uuid DEFAULT NULL,
  p_score numeric DEFAULT NULL, p_feedback text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_tid uuid; v_cc uuid; v_n int;
BEGIN
  v_tid := ma_my_teacher_id();
  IF v_tid IS NULL THEN RETURN jsonb_build_object('status','not_teacher'); END IF;
  SELECT class_code_id INTO v_cc FROM ma_sessions WHERE id = p_session_id;
  IF v_cc IS NULL THEN RETURN jsonb_build_object('status','no_session'); END IF;
  IF NOT EXISTS (SELECT 1 FROM class_codes WHERE id = v_cc AND teacher_id = v_tid) THEN
    RETURN jsonb_build_object('status','not_my_class');
  END IF;

  IF p_student_profile_id IS NULL THEN            -- 일괄: 자동점수를 정식 점수로
    UPDATE ma_submissions
       SET score = COALESCE(score, auto_score), status = 'graded',
           graded_at = now(), graded_by = v_tid
     WHERE session_id = p_session_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
  ELSE
    UPDATE ma_submissions
       SET score = COALESCE(p_score, auto_score),
           feedback = COALESCE(p_feedback, feedback),
           status = 'graded', graded_at = now(), graded_by = v_tid
     WHERE session_id = p_session_id AND student_profile_id = p_student_profile_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object('status','ok','updated',v_n);
END $$;
GRANT EXECUTE ON FUNCTION ma_grade(uuid, uuid, numeric, text) TO authenticated;

-- =============================================
-- [RPC] ma_stats — 누적 기록
--   학생 본인이 부르면 자기 것, 교사가 학생을 지정해 부르면 그 학생 것.
--   아침활동의 값어치는 하루치가 아니라 이 누적에 있다.
-- =============================================
CREATE OR REPLACE FUNCTION ma_stats(p_student_profile_id uuid DEFAULT NULL, p_days int DEFAULT 60)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_pid uuid; v_cc uuid; v_tid uuid; v_res jsonb;
BEGIN
  SELECT pid, ccid INTO v_pid, v_cc FROM ma_my_profile();
  IF v_pid IS NULL THEN                                  -- 교사 경로
    v_tid := ma_my_teacher_id();
    IF v_tid IS NULL OR p_student_profile_id IS NULL THEN
      RETURN jsonb_build_object('status','no_profile');
    END IF;
    SELECT class_code_id INTO v_cc FROM student_profiles WHERE id = p_student_profile_id;
    IF NOT EXISTS (SELECT 1 FROM class_codes WHERE id = v_cc AND teacher_id = v_tid) THEN
      RETURN jsonb_build_object('status','not_my_class');
    END IF;
    v_pid := p_student_profile_id;
  ELSIF p_student_profile_id IS NOT NULL AND p_student_profile_id <> v_pid THEN
    RETURN jsonb_build_object('status','forbidden');      -- 학생이 남의 기록을 볼 수 없다
  END IF;

  SELECT jsonb_build_object(
    'status','ok',
    'student_profile_id', v_pid,
    'overall', jsonb_build_object(
      'sessions', count(*),
      'correct', COALESCE(sum(su.auto_score), 0),
      'total',   COALESCE(sum(su.auto_max), 0),
      'rate', CASE WHEN COALESCE(sum(su.auto_max),0) > 0
                   THEN round(100.0 * sum(su.auto_score) / sum(su.auto_max), 1) ELSE NULL END
    ),
    'recent', COALESCE(jsonb_agg(jsonb_build_object(
        'run_date', se.run_date, 'subject', se.subject, 'step', se.step, 'mode', se.mode,
        'auto_score', su.auto_score, 'auto_max', su.auto_max,
        'score', su.score, 'status', su.status, 'feedback', su.feedback
      ) ORDER BY se.run_date DESC), '[]'::jsonb)
  ) INTO v_res
  FROM ma_submissions su
  JOIN ma_sessions se ON se.id = su.session_id
  WHERE su.student_profile_id = v_pid
    AND se.run_date >= (now() AT TIME ZONE 'Asia/Seoul')::date - p_days;

  RETURN v_res;
END $$;
GRANT EXECUTE ON FUNCTION ma_stats(uuid, int) TO authenticated;
