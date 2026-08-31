-- =============================================
-- setup_report_v1.sql  (v1.2 — 2026-08-31, v1.1 적용 후 증분)
-- 케이학습리포트 R0 — 집계 층 (규칙 기반, 외부 API 불요)
-- 명세: handoff/kedu/학습리포트_설계_v1.md §2
-- =============================================
-- 정확성 불변식 (설계 §1):
--   · 표본 부족 시 판단 보류 — 문항 3개 미만이면 'watching' (억지 분석 금지)
--   · 최근 가중 — 도달 판정은 "문항별 마지막 답"만 본다 (옛 오답이 낙인되지 않게).
--     v1.0은 '최근 5답' 기준이었으나, 한 차시 10문항 풀이에서 최근 5답은
--     한 회차의 후반 절반일 뿐이라 차시 도달을 대표하지 못한다 → v1.1에서 교정.
--   · 한 번 vs 계속 구분 — 반복 오답(wrong_answers.attempts>=2, 미해결)만 취약 근거
-- 판정 숫자(80/60·표본3)는 설계 §10 미결 — 준호 반 실측 후 조정 대상.
--
-- v1 판정 단위: 차시(lesson). v1.2에서 개념(concept) 단위 합류 —
-- 케이학습지 E0(개념 트리 C1~C7·오개념 M01~M11) 완성으로 태그가 실제로 들어온다.
-- 학습지 풀이는 scores.lesson_id = 'ws:{set}' 로 저장되며,
-- 차시 도달 지도([1])에서는 제외하고 개념 지도([6])로 합류시킨다.
-- 멱등 (DROP VIEW IF EXISTS → CREATE / IF NOT EXISTS). 재실행 안전.
-- =============================================

-- ---------------------------------------------
-- [1] report_lesson_mastery — 학생×차시 도달 판정 (v1.1)
--   q_n            = 답한 서로 다른 문항 수 (표본)
--   q_latest_ok    = 그중 마지막 답이 정답인 문항 수 (최근 가중)
--   status         = q_n<3 → watching / ok율 ≥80 solid / ≥60 edge / 그 외 weak
--   recent_n·recent_correct = 최근 5답 (근거 표시용 보조 지표, 판정에 안 씀)
--   runs·last_run_* = _lesson_summary_ 행(차시 끝 기록) 기준 회차·마지막 점수
--   security_invoker → scores RLS 그대로 (교사=자기 학급, 학생=본인, 학부모=검증 자녀)
--   ※ v1.0에서 열이 늘어 CREATE OR REPLACE가 거부되므로 DROP 후 재생성.
-- ---------------------------------------------
DROP VIEW IF EXISTS report_lesson_mastery;
CREATE VIEW report_lesson_mastery
WITH (security_invoker = true) AS
WITH q AS (                                  -- 문항 답(요약 행 제외)
  SELECT
    s.student_id, s.lesson_id, s.unit_id, s.question_id, s.is_correct,
    s.earned_at, COALESCE(s.time_spent_sec, 0) AS time_spent_sec,
    ROW_NUMBER() OVER (PARTITION BY s.student_id, s.lesson_id
                       ORDER BY s.earned_at DESC)                    AS rn_all,
    ROW_NUMBER() OVER (PARTITION BY s.student_id, s.lesson_id, s.question_id
                       ORDER BY s.earned_at DESC)                    AS rn_q
  FROM scores s
  WHERE s.student_id IS NOT NULL
    AND s.lesson_id  IS NOT NULL
    AND s.is_correct IS NOT NULL
    AND COALESCE(s.question_id, '') <> '_lesson_summary_'
    AND s.lesson_id NOT LIKE 'ws:%'          -- v1.2: 학습지 세트는 차시가 아니다 → [6]으로
    AND s.lesson_id NOT LIKE 'quiz:%'        -- 쪽지도 마찬가지
),
agg AS (
  SELECT
    student_id, lesson_id,
    MAX(unit_id)                                            AS unit_id,
    COUNT(*)::int                                           AS attempts_total,
    COUNT(*) FILTER (WHERE rn_all <= 5)::int                AS recent_n,
    COUNT(*) FILTER (WHERE rn_all <= 5 AND is_correct)::int AS recent_correct,
    COUNT(*) FILTER (WHERE rn_q = 1)::int                   AS q_n,
    COUNT(*) FILTER (WHERE rn_q = 1 AND is_correct)::int    AS q_latest_ok,
    COUNT(*) FILTER (WHERE is_correct)::int                 AS correct_total,
    MIN(earned_at)                                          AS first_attempt_at,
    MAX(earned_at)                                          AS last_attempt_at,
    SUM(time_spent_sec)::int                                AS time_sec
  FROM q
  GROUP BY student_id, lesson_id
),
runs AS (                                    -- 차시 끝 기록(_lesson_summary_)
  SELECT
    s.student_id, s.lesson_id,
    COUNT(*)::int AS runs,
    (ARRAY_AGG(s.score     ORDER BY s.earned_at DESC))[1] AS last_run_score,
    (ARRAY_AGG(s.max_score ORDER BY s.earned_at DESC))[1] AS last_run_max,
    MAX(s.earned_at)                                       AS last_run_at
  FROM scores s
  WHERE s.student_id IS NOT NULL AND s.lesson_id IS NOT NULL
    AND s.question_id = '_lesson_summary_'
    AND s.lesson_id NOT LIKE 'ws:%'          -- v1.2
    AND s.lesson_id NOT LIKE 'quiz:%'
  GROUP BY s.student_id, s.lesson_id
)
SELECT
  a.student_id, a.lesson_id, a.unit_id,
  a.attempts_total, a.recent_n, a.recent_correct, a.last_attempt_at,
  CASE
    WHEN a.q_n < 3 THEN 'watching'
    WHEN a.q_latest_ok * 100.0 / GREATEST(a.q_n, 1) >= 80 THEN 'solid'
    WHEN a.q_latest_ok * 100.0 / GREATEST(a.q_n, 1) >= 60 THEN 'edge'
    ELSE 'weak'
  END                                                     AS status,
  a.q_n, a.q_latest_ok, a.correct_total, a.first_attempt_at, a.time_sec,
  COALESCE(r.runs, 0)                                     AS runs,
  r.last_run_score, r.last_run_max, r.last_run_at
FROM agg a
LEFT JOIN runs r ON r.student_id = a.student_id AND r.lesson_id = a.lesson_id;

-- ---------------------------------------------
-- [2] report_morning_daily — 학생×날짜 아침활동 (과목 포함)
--   ma_submissions RLS를 따름. 주간 점 그래프·꾸준함의 재료.
-- ---------------------------------------------
CREATE OR REPLACE VIEW report_morning_daily
WITH (security_invoker = true) AS
SELECT
  sub.student_profile_id                       AS student_id,
  ses.run_date,
  ses.subject,
  ses.mode,
  sub.auto_score,
  sub.auto_max,
  sub.score                                    AS teacher_score,
  sub.spent_sec,
  sub.submitted_at
FROM ma_submissions sub
JOIN ma_sessions ses ON ses.id = sub.session_id;

-- ---------------------------------------------
-- [3] report_teacher_comments — 교사 한마디 (설계 §9 자리)
--   학생당 1행. 교사가 쓰고, visible_to_parent 체크 시에만 학부모 노출.
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS report_teacher_comments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  comment           text NOT NULL DEFAULT '',
  visible_to_parent boolean NOT NULL DEFAULT false,
  updated_by        uuid REFERENCES teachers(id) ON DELETE SET NULL,
  updated_at        timestamptz DEFAULT now(),
  UNIQUE (student_id)
);

ALTER TABLE report_teacher_comments ENABLE ROW LEVEL SECURITY;

-- 교사: 자기 학급 학생만 읽기/쓰기
DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='report_teacher_comments' AND policyname='rtc_teacher_manage') THEN
    CREATE POLICY "rtc_teacher_manage" ON report_teacher_comments
      FOR ALL USING (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON cc.id = sp.class_code_id
          JOIN teachers t   ON t.id  = cc.teacher_id
          WHERE t.user_id = auth.uid()
        )
      ) WITH CHECK (
        student_id IN (
          SELECT sp.id FROM student_profiles sp
          JOIN class_codes cc ON cc.id = sp.class_code_id
          JOIN teachers t   ON t.id  = cc.teacher_id
          WHERE t.user_id = auth.uid()
        )
      );
  END IF;
END $do$;

-- 학부모: 검증 완료 자녀 + visible_to_parent = true 만 읽기
DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='report_teacher_comments' AND policyname='rtc_parent_read') THEN
    CREATE POLICY "rtc_parent_read" ON report_teacher_comments
      FOR SELECT USING (
        visible_to_parent = true
        AND student_id IN (
          SELECT psl.student_id FROM parent_student_links psl
          WHERE psl.parent_id = auth.uid()
            AND psl.verified_at IS NOT NULL
        )
      );
  END IF;
END $do$;

-- ---------------------------------------------
-- [4] 학부모 아침활동 열람 RLS
--   근거: 처리방침 v2.1 line 103 "학습 시간·진척도" 범주.
--   ※ 처리방침 열람 항목 문구에 '아침활동'을 명시 추가할지 준호 확인 필요.
--   sp_parent_read(setup_parent_data_view.sql)와 동일한 verified 매핑 패턴.
-- ---------------------------------------------
DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ma_submissions' AND policyname='ma_subs_parent_read') THEN
    CREATE POLICY "ma_subs_parent_read" ON ma_submissions
      FOR SELECT USING (
        student_profile_id IN (
          SELECT psl.student_id FROM parent_student_links psl
          WHERE psl.parent_id = auth.uid()
            AND psl.verified_at IS NOT NULL
        )
      );
  END IF;
  -- ma_sessions는 학급 단위 메타 — 자녀 제출이 있는 세션만 학부모 SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ma_sessions' AND policyname='ma_sess_parent_read') THEN
    CREATE POLICY "ma_sess_parent_read" ON ma_sessions
      FOR SELECT USING (
        id IN (
          SELECT sub.session_id FROM ma_submissions sub
          WHERE sub.student_profile_id IN (
            SELECT psl.student_id FROM parent_student_links psl
            WHERE psl.parent_id = auth.uid()
              AND psl.verified_at IS NOT NULL
          )
        )
      );
  END IF;
END $do$;

-- ---------------------------------------------
-- [5] report_parent_views — 학부모 리포트 열람 로그 (설계 §6: 학부모용만 audit)
--   누가(parent_id)·누구를(student_id)·언제. 학부모 본인 INSERT만, 읽기는 관리자.
--   성적 민감 데이터 열람 기록 — 처리방침 열람 로그 범주.
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS report_parent_views (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  period      text,                          -- 'week' | 'month'
  viewed_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rpv_student ON report_parent_views(student_id, viewed_at DESC);
ALTER TABLE report_parent_views ENABLE ROW LEVEL SECURITY;

DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='report_parent_views' AND policyname='rpv_parent_insert') THEN
    CREATE POLICY "rpv_parent_insert" ON report_parent_views
      FOR INSERT WITH CHECK (
        parent_id = auth.uid()
        AND student_id IN (
          SELECT psl.student_id FROM parent_student_links psl
          WHERE psl.parent_id = auth.uid() AND psl.verified_at IS NOT NULL
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='report_parent_views' AND policyname='rpv_admin_read') THEN
    CREATE POLICY "rpv_admin_read" ON report_parent_views
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
      );
  END IF;
END $do$;

-- =============================================
-- v1.2 증분 — 케이학습지 합류 (개념 단위)
-- =============================================

-- ---------------------------------------------
-- [6-0] scores 개념·오개념 열
--   concept_id(bigint FK)는 lesson_concepts 용. 학습지 원장은 코드 문법('M1-1-C2')을
--   쓰므로 텍스트 열을 따로 둔다 — 태그 출처가 늘어도 뷰는 그대로.
--   misconception_code = 학생이 고른 오답 선택지의 오개념 코드('M07'). 정답이면 NULL.
-- ---------------------------------------------
-- 열 자체는 케이학습지 원장(sql/setup_worksheet_bank.sql [6])이 먼저 만든다.
-- 이 파일이 단독으로 먼저 실행돼도 뷰가 서도록 같은 이름으로 한 번 더 보장한다(멱등).
ALTER TABLE scores ADD COLUMN IF NOT EXISTS concept_code       text;
ALTER TABLE scores ADD COLUMN IF NOT EXISTS misconception_code text;
CREATE INDEX IF NOT EXISTS idx_scores_concept_code ON scores(concept_code)       WHERE concept_code       IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scores_mis_code     ON scores(misconception_code) WHERE misconception_code IS NOT NULL;

-- ---------------------------------------------
-- [6] report_concept_mastery — 학생×개념 도달 판정
--   [1]과 같은 규칙(문항별 마지막 답 · 표본 3 미만이면 watching · 80/60).
--   출처를 가리지 않는다: 자기주도 차시든 학습지 세트든 concept_code 만 있으면 합류.
--   문항 키는 (lesson_id, question_id) — 세트가 달라도 같은 개념이면 한 줄로 모인다.
-- ---------------------------------------------
DROP VIEW IF EXISTS report_concept_mastery;
CREATE VIEW report_concept_mastery
WITH (security_invoker = true) AS
WITH q AS (
  SELECT
    s.student_id, s.concept_code, s.lesson_id, s.question_id, s.is_correct,
    s.earned_at, COALESCE(s.time_spent_sec, 0) AS time_spent_sec,
    ROW_NUMBER() OVER (PARTITION BY s.student_id, s.concept_code, s.lesson_id, s.question_id
                       ORDER BY s.earned_at DESC) AS rn_q
  FROM scores s
  WHERE s.student_id   IS NOT NULL
    AND s.concept_code IS NOT NULL
    AND s.is_correct   IS NOT NULL
    AND COALESCE(s.question_id, '') <> '_lesson_summary_'
)
SELECT
  student_id,
  concept_code,
  COUNT(*)::int                                        AS attempts_total,
  COUNT(*) FILTER (WHERE rn_q = 1)::int                AS q_n,
  COUNT(*) FILTER (WHERE rn_q = 1 AND is_correct)::int AS q_latest_ok,
  COUNT(*) FILTER (WHERE is_correct)::int              AS correct_total,
  COUNT(DISTINCT lesson_id)::int                       AS sources,
  MIN(earned_at)                                       AS first_attempt_at,
  MAX(earned_at)                                       AS last_attempt_at,
  SUM(time_spent_sec)::int                             AS time_sec,
  CASE
    WHEN COUNT(*) FILTER (WHERE rn_q = 1) < 3 THEN 'watching'
    WHEN COUNT(*) FILTER (WHERE rn_q = 1 AND is_correct) * 100.0
         / GREATEST(COUNT(*) FILTER (WHERE rn_q = 1), 1) >= 80 THEN 'solid'
    WHEN COUNT(*) FILTER (WHERE rn_q = 1 AND is_correct) * 100.0
         / GREATEST(COUNT(*) FILTER (WHERE rn_q = 1), 1) >= 60 THEN 'edge'
    ELSE 'weak'
  END                                                  AS status
FROM q
GROUP BY student_id, concept_code;

-- ---------------------------------------------
-- [7] report_worksheet_runs — 학생×학습지 세트 (몇 판·몇 점)
--   'ws:'(파일 학습지) · 'quiz:'(원장 쪽지) 둘 다. 교사 화면의 「푼 학습지」 칸 재료.
--   set_id = 접두사를 뗀 키(파일이면 data/{set}.json, 쪽지면 quiz_sets.id).
-- ---------------------------------------------
DROP VIEW IF EXISTS report_worksheet_runs;
CREATE VIEW report_worksheet_runs
WITH (security_invoker = true) AS
WITH ans AS (
  SELECT student_id, lesson_id,
         COUNT(*)::int                           AS attempts_total,
         COUNT(*) FILTER (WHERE is_correct)::int AS correct_total,
         COUNT(DISTINCT question_id)::int        AS q_n,
         MIN(earned_at)                          AS first_attempt_at,
         MAX(earned_at)                          AS last_attempt_at
  FROM scores
  WHERE student_id IS NOT NULL AND (lesson_id LIKE 'ws:%' OR lesson_id LIKE 'quiz:%')
    AND is_correct IS NOT NULL
    AND COALESCE(question_id, '') <> '_lesson_summary_'
  GROUP BY student_id, lesson_id
),
fin AS (
  SELECT student_id, lesson_id,
         COUNT(*)::int                                      AS runs,
         (ARRAY_AGG(score     ORDER BY earned_at DESC))[1]  AS last_run_score,
         (ARRAY_AGG(max_score ORDER BY earned_at DESC))[1]  AS last_run_max,
         MAX(earned_at)                                     AS last_run_at,
         SUM(COALESCE(time_spent_sec, 0))::int              AS time_sec
  FROM scores
  WHERE student_id IS NOT NULL AND (lesson_id LIKE 'ws:%' OR lesson_id LIKE 'quiz:%')
    AND question_id = '_lesson_summary_'
  GROUP BY student_id, lesson_id
)
SELECT
  a.student_id,
  a.lesson_id,
  SUBSTRING(a.lesson_id FROM POSITION(':' IN a.lesson_id) + 1) AS set_id,
  SPLIT_PART(a.lesson_id, ':', 1)                             AS source,   -- 'ws' | 'quiz'
  a.attempts_total, a.correct_total, a.q_n,
  a.first_attempt_at, a.last_attempt_at,
  COALESCE(f.runs, 0)            AS runs,
  f.last_run_score, f.last_run_max, f.last_run_at,
  COALESCE(f.time_sec, 0)        AS time_sec
FROM ans a
LEFT JOIN fin f ON f.student_id = a.student_id AND f.lesson_id = a.lesson_id;

-- ---------------------------------------------
-- [8] report_misconception — 학생×오개념 코드
--   같은 오개념을 몇 번, 어떤 개념에서 짚었는지. 교사 힌트 연결용.
--   불변식(설계 §1): 한 번은 취약이 아니다 → 화면은 n>=2 만 '반복'으로 읽는다.
--   still_open = 그 문항의 마지막 답이 아직 오답인 것이 하나라도 있음.
-- ---------------------------------------------
DROP VIEW IF EXISTS report_misconception;
CREATE VIEW report_misconception
WITH (security_invoker = true) AS
WITH picks AS (
  SELECT
    s.student_id, s.misconception_code AS mis_code, s.concept_code, s.lesson_id, s.question_id, s.earned_at
  FROM scores s
  WHERE s.student_id IS NOT NULL
    AND s.misconception_code IS NOT NULL
    AND s.is_correct IS FALSE
),
latest AS (
  SELECT student_id, lesson_id, question_id, is_correct
  FROM (
    SELECT s.student_id, s.lesson_id, s.question_id, s.is_correct,
           ROW_NUMBER() OVER (PARTITION BY s.student_id, s.lesson_id, s.question_id
                              ORDER BY s.earned_at DESC) AS rn
    FROM scores s
    WHERE s.student_id IS NOT NULL AND s.is_correct IS NOT NULL
  ) t
  WHERE rn = 1
)
SELECT
  p.student_id,
  p.mis_code,
  COUNT(*)::int                                   AS n,
  COUNT(DISTINCT p.question_id)::int              AS questions,
  COUNT(DISTINCT p.lesson_id)::int                AS sources,
  MIN(p.concept_code)                             AS concept_code,
  MAX(p.earned_at)                                AS last_at,
  BOOL_OR(l.is_correct IS FALSE)                  AS still_open
FROM picks p
LEFT JOIN latest l
  ON l.student_id = p.student_id AND l.lesson_id = p.lesson_id
 AND l.question_id = p.question_id
GROUP BY p.student_id, p.mis_code;

NOTIFY pgrst, 'reload schema';

-- =============================================
-- [검증 쿼리]
-- (1) SELECT status, count(*) FROM report_lesson_mastery GROUP BY 1;
--     → watching/solid/edge/weak 분포 (빈 DB면 0행)
-- (v1.2) SELECT concept_code, status, q_n, q_latest_ok FROM report_concept_mastery ORDER BY 1;
-- (v1.2) SELECT set_id, runs, last_run_score, last_run_max FROM report_worksheet_runs;
-- (v1.2) SELECT mis_code, n, still_open FROM report_misconception ORDER BY n DESC;
-- (v1.2) SELECT count(*) FROM scores WHERE lesson_id LIKE 'ws:%';   -- 학습지 유입 확인
-- (2) SELECT lesson_id, q_n, q_latest_ok, status, runs, last_run_score, last_run_max
--       FROM report_lesson_mastery ORDER BY last_attempt_at DESC LIMIT 5;
-- (3) SELECT * FROM report_morning_daily LIMIT 5;
-- (4) SELECT policyname FROM pg_policies WHERE tablename='report_teacher_comments';
--     → rtc_teacher_manage, rtc_parent_read
-- (5) SELECT policyname FROM pg_policies WHERE tablename='ma_submissions';
--     → 기존 정책 + ma_subs_parent_read
-- (6) SELECT policyname FROM pg_policies WHERE tablename='report_parent_views';
--     → rpv_parent_insert, rpv_admin_read
-- =============================================
