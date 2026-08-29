-- =============================================
-- setup_report_v1.sql
-- 케이학습리포트 R0 — 집계 층 (규칙 기반, 외부 API 불요)
-- 명세: handoff/kedu/학습리포트_설계_v1.md §2
-- =============================================
-- 정확성 불변식 (설계 §1):
--   · 표본 부족 시 판단 보류 — 시도 3회 미만이면 'watching' (억지 분석 금지)
--   · 최근 가중 — 도달 판정은 최근 5회 시도 기준 (옛 오답이 낙인되지 않게)
--   · 한 번 vs 계속 구분 — 반복 오답(attempts>=2, 미해결)만 취약 근거
-- 판정 숫자는 설계 §10 미결 — 준호 반 실측 후 조정 대상.
--
-- v1 판정 단위: 차시(lesson). 개념(concept) 단위는 케이학습지 E0(원장·태그)
-- 완성 후 concept_id 채워지면 동일 구조의 concept 뷰 추가 (자리만 잡음).
-- 멱등 (CREATE OR REPLACE / IF NOT EXISTS).
-- =============================================

-- ---------------------------------------------
-- [1] report_lesson_mastery — 학생×차시 도달 판정
--   recent 창 = 최근 min(5, n)회. 비율 기준(80/60%)은
--   데이터진단_표준 7번과 동일 척도.
--   security_invoker → scores RLS 그대로 (교사=자기 학급, 학생=본인, 학부모=검증 자녀)
-- ---------------------------------------------
CREATE OR REPLACE VIEW report_lesson_mastery
WITH (security_invoker = true) AS
WITH ranked AS (
  SELECT
    s.student_id, s.lesson_id, s.unit_id, s.is_correct, s.earned_at,
    ROW_NUMBER() OVER (
      PARTITION BY s.student_id, s.lesson_id
      ORDER BY s.earned_at DESC
    ) AS rn
  FROM scores s
  WHERE s.student_id IS NOT NULL
    AND s.lesson_id IS NOT NULL
    AND s.is_correct IS NOT NULL          -- _lesson_summary_ 행 제외
)
SELECT
  student_id,
  lesson_id,
  MAX(unit_id)                                            AS unit_id,   -- 재도전 링크용 경로
  COUNT(*)::int                                           AS attempts_total,
  COUNT(*) FILTER (WHERE rn <= 5)::int                    AS recent_n,
  COUNT(*) FILTER (WHERE rn <= 5 AND is_correct)::int     AS recent_correct,
  MAX(earned_at)                                          AS last_attempt_at,
  CASE
    WHEN COUNT(*) < 3 THEN 'watching'   -- 표본 부족 → 판단 보류
    WHEN COUNT(*) FILTER (WHERE rn <= 5 AND is_correct) * 100.0
         / GREATEST(COUNT(*) FILTER (WHERE rn <= 5), 1) >= 80 THEN 'solid'
    WHEN COUNT(*) FILTER (WHERE rn <= 5 AND is_correct) * 100.0
         / GREATEST(COUNT(*) FILTER (WHERE rn <= 5), 1) >= 60 THEN 'edge'
    ELSE 'weak'
  END                                                     AS status
FROM ranked
GROUP BY student_id, lesson_id;

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
DO $$ BEGIN
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
END $$;

-- 학부모: 검증 완료 자녀 + visible_to_parent = true 만 읽기
DO $$ BEGIN
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
END $$;

-- ---------------------------------------------
-- [4] 학부모 아침활동 열람 RLS
--   근거: 처리방침 v2.1 line 103 "학습 시간·진척도" 범주.
--   ※ 처리방침 열람 항목 문구에 '아침활동'을 명시 추가할지 준호 확인 필요.
--   sp_parent_read(setup_parent_data_view.sql)와 동일한 verified 매핑 패턴.
-- ---------------------------------------------
DO $$ BEGIN
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
END $$;

-- ---------------------------------------------
-- [5] (자리) 케이학습지 attempts 합류 지점
--   E0(문제 원장·개념 태그)·E1(쪽지) 완성 후, attempts 테이블을
--   [1]과 동일 구조의 report_concept_mastery 뷰로 합류시킨다.
--   지금은 만들지 않는다 — 태그 없는 리포트는 숫자 나열일 뿐 (설계 선행 조건).
-- ---------------------------------------------

NOTIFY pgrst, 'reload schema';

-- =============================================
-- [검증 쿼리]
-- (1) SELECT * FROM report_lesson_mastery LIMIT 5;
-- (2) SELECT * FROM report_morning_daily LIMIT 5;
-- (3) SELECT policyname FROM pg_policies WHERE tablename='report_teacher_comments';
--     → rtc_teacher_manage, rtc_parent_read
-- (4) SELECT policyname FROM pg_policies WHERE tablename='ma_submissions';
--     → 기존 정책 + ma_subs_parent_read
-- =============================================
