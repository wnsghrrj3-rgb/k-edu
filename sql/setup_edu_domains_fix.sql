-- 교육청 도메인 교정 (2026-09-02) — 경북교육청 실제 메일 도메인은 gbe.kr (초안 gbe.go.kr 은 오기)
-- 재실행 안전. 의존: setup_teacher_approval.sql(#23)
UPDATE edu_domains SET domain = 'gbe.kr' WHERE domain = 'gbe.go.kr';
INSERT INTO edu_domains (domain, region, active, verified)
  SELECT 'gbe.kr', '경북', true, false WHERE NOT EXISTS (SELECT 1 FROM edu_domains WHERE domain = 'gbe.kr');
-- 검산:
--   SELECT domain FROM edu_domains WHERE region = '경북';                → gbe.kr
--   SELECT kedu_email_is_edu('a@gbe.kr') AS gb, kedu_email_is_edu('a@sen.go.kr') AS s;   → true / true
--   SELECT value FROM kedu_policy WHERE key = 'auto_approve_edu_domains';   → 자동승인을 쓰려면 true 여야 함
