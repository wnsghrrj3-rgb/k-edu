-- setup_classwork4.sql — 케이박스 증분 4: 케이티처 활동 시스템 편입
--
-- 목적: 활동 도구(게임)를 케이박스 과제로 발행할 수 있도록
--       cw_items.kind 어휘에 'activity'를 추가한다. 테이블 신설 없음.
-- 의존: setup_classwork.sql (cw_items, CHECK 'cw_items_kind_check')
--       setup_classwork3.sql ('quiz' 추가분 포함해 재정의)
-- 설계: handoff/kedu/activities/케이티처_활동시스템_설계.md §8
--
-- 제출 경로는 무수정: 활동 HTML → kedu_kbox_adapter.js → RPC cw_submit
--   → cw_submissions.payload = KEDU_RESULT v1 봉투 (tool='activity').
--   detail.byType(유형별 정오답) = 교사 대시보드 형성평가 화면의 원천.
--
-- 재시도 채점(best/first/last)은 브리지(core/bridge.js)가 제출 전 병합한다.
--   근거: cw_submit이 UNIQUE(student_profile_id, item_id) upsert = last-write-wins.
--   시도 이력이 행으로 쌓이지 않으므로 RPC 무수정 + 클라이언트 병합으로 확정 (M3 해소).

-- cw_items.kind CHECK 재정의 (기존 제약 DROP → activity 포함 재생성)
ALTER TABLE cw_items DROP CONSTRAINT IF EXISTS cw_items_kind_check;
ALTER TABLE cw_items ADD CONSTRAINT cw_items_kind_check
  CHECK (kind IN ('kteacher','selfstudy','klab','kple','kmake','english','link','quiz','activity'));

-- 확인용:
--   SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint WHERE conname = 'cw_items_kind_check';

NOTIFY pgrst, 'reload schema';
