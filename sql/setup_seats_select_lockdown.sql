-- =============================================
-- student_seats 공개 SELECT 잠금 (2026-07-11 대점검 3차, 페이블)
-- =============================================
-- 발견: ss_anyone_select = FOR SELECT USING(true)
--   → anon 키만으로 전 학급의 nickname + claim_code(6자리 가입 비밀코드) 전체 덤프 가능.
--   → claim_code를 훔치면 미입장 슬롯을 타인이 선점(계정 탈취형) 가능. 학생 별명도 노출.
--
-- 안전 근거 (드롭해도 아무 흐름도 안 깨짐 — 2026-07-11 코드 전수 확인):
--   1) 학생 입장 = claim_seat(text,text) RPC, SECURITY DEFINER → 테이블 SELECT 정책 불필요
--   2) 교사 슬롯 목록/삭제 = teacher/index.html → ss_teacher_own (FOR ALL, 본인 학급 한정)이 커버
--   3) 그 외 student_seats 직접 조회 코드 = 저장소 전체에 없음
--
-- 실행: Supabase SQL Editor에 이 파일 전체 붙여넣고 Run 1회.
-- =============================================

DROP POLICY IF EXISTS "ss_anyone_select" ON student_seats;

-- (선택 보강) 학생이 자기 슬롯만 볼 필요가 생기면 아래 주석 해제:
-- CREATE POLICY "ss_self_select" ON student_seats
--   FOR SELECT USING (
--     claimed_by IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
--   );

NOTIFY pgrst, 'reload schema';

-- =============================================
-- 검증 (실행 후 확인):
-- 1) SELECT policyname, cmd FROM pg_policies WHERE tablename='student_seats';
--    → ss_anyone_select 없어야 정상. ss_teacher_own(ALL)·ss_student_claim(UPDATE)만 남음.
-- 2) 시크릿 창(비로그인)에서 keduclass.com 콘솔:
--    db.from('student_seats').select('*') → 빈 배열이어야 정상.
-- 3) 교사 계정으로 슬롯 목록 열기 → 그대로 보여야 정상.
-- 4) 새 학생 입장 코드로 가입 1회 테스트 → 그대로 되어야 정상 (RPC 경유).
-- =============================================
