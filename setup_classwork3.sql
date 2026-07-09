-- =============================================
-- K-edu 케이박스 증분 3 — 케이퀴즈(quiz) 종류 편입
-- 작성: 2026-07-09
-- 본질: 케이퀴즈 제출물이 케이박스(cw_items) 파이프라인에 편승하도록
--       cw_items.kind 어휘에 'quiz'를 추가한다. 테이블 신설 없음.
-- SPEC: handoff/kquiz/SPEC_KQUIZ_설계.md §7
-- 의존: setup_classwork.sql (cw_items, 인라인 CHECK 'cw_items_kind_check')
-- 실행: 준호 (Supabase SQL Editor). 멱등(idempotent) — 재실행 안전.
--
-- 참고: KEDU_RESULT 봉투의 tool="quiz"는 cw_submissions payload(jsonb) 안의
--       값이라 DB CHECK 제약 대상이 아니다(애플리케이션 레벨 어휘). 별도 SQL 불필요.
--       봉투 확장은 kbox-adapter.js가 담당(draw 추가 전례와 동일).
-- =============================================

-- cw_items.kind CHECK 재정의 (기존 자동생성 제약 DROP → quiz 포함 재생성)
ALTER TABLE cw_items DROP CONSTRAINT IF EXISTS cw_items_kind_check;
ALTER TABLE cw_items ADD CONSTRAINT cw_items_kind_check
  CHECK (kind IN ('kteacher','selfstudy','klab','kple','kmake','english','link','quiz'));

-- 검증 (실행 후 확인용 — quiz 포함 여부)
-- SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint WHERE conname = 'cw_items_kind_check';
