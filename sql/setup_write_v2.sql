-- =============================================================================
-- setup_write_v2.sql — 케이글쓰기 학습리포트 「해낸 것」 합류 (설계 v1 §13) · 재실행 안전  [#52]
--   선행: setup_write_v1.sql(#51 — write_runs·write_submissions·write_reviews)
--   ① 뷰 report_write — 학생 × 돌려준 첨삭 1줄: 과제·유형·밴드·차수·루브릭 수준(levels)·한마디·돌려준 때
--      report_performance(케이학습지 W5) 와 같은 꼴(title, area, levels, memo, graded_at, reveal_to_student) 이라
--      teacher/learning-report.html 이 같은 길로 읽어 「🏅 해낸 것」 한 목록에 섞는다(루브릭 본문은 kedu/write/data/rubric.json).
--   RLS 는 security_invoker 로 원래 표의 정책(담임·본인)을 그대로 탄다. 돌려주지 않은 첨삭(returned_at NULL)은 안 나온다.
-- =============================================================================
DROP VIEW IF EXISTS report_write;
CREATE VIEW report_write
WITH (security_invoker = true) AS
SELECT s.student_id, s.run_id, run.class_code_id, run.type, run.band, run.title, run.topic, run.prompt_id,
       s.attempt, rv.levels, rv.comment AS memo, rv.ask_rewrite, rv.returned_at AS graded_at,
       true AS reveal_to_student,
       '글쓰기' AS area,
       (SELECT AVG((v)::numeric) FROM jsonb_each_text(rv.levels) AS e(k, v))::numeric(4,2) AS avg_level,
       -- 같은 과제에서 마지막(가장 큰 차수)만 대표로 쓸 때 쓰는 표지
       (s.attempt = (SELECT max(s2.attempt) FROM write_submissions s2 WHERE s2.run_id = s.run_id AND s2.student_id = s.student_id)) AS is_last
  FROM write_reviews rv
  JOIN write_submissions s ON s.id = rv.submission_id
  JOIN write_runs run ON run.id = s.run_id
 WHERE rv.returned_at IS NOT NULL;

-- 검산: SELECT table_name FROM information_schema.views WHERE table_name='report_write';  → 1행
