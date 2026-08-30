-- =============================================
-- setup_kmovie_projects.sql  (2026-08-31)
-- 케이무비 「내 작업」 — 편집 상태(JSON)를 케이에듀 계정에 저장해 어느 기기에서든 목록에서 연다.
-- 명세: handoff/kmovie/_KMOVIE_STATUS.md "작업 파일 현황"
-- =============================================
-- 원칙:
--   · doc 은 편집 상태(컷·부품·자막·음악·설정)만. 원본 영상 바이트는 절대 올리지 않는다(기기에 남음).
--   · 본인 행만 읽고 쓴다(RLS auth.uid() = user_id). 교사 승인 여부와 무관 — 개인 작업물이라 학급 권한과 무관.
--   · id 는 클라이언트가 만든 uuid(기기 로컬 IndexedDB 와 같은 id 로 맞춘다).
-- 멱등 (IF NOT EXISTS / DROP POLICY IF EXISTS). 재실행 안전.
-- =============================================

CREATE TABLE IF NOT EXISTS kmovie_projects (
  id          uuid PRIMARY KEY,
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT '새 작업',
  doc         jsonb NOT NULL,
  dur_sec     numeric NOT NULL DEFAULT 0,
  clips       integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS kmovie_projects_user_updated ON kmovie_projects (user_id, updated_at DESC);

ALTER TABLE kmovie_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_kmovie_projects_owner ON kmovie_projects;
CREATE POLICY p_kmovie_projects_owner ON kmovie_projects
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON kmovie_projects TO authenticated;

-- doc 크기 가드 (원본 바이트가 실수로 들어오는 것을 막는다 — 편집 상태는 수백 KB 를 넘지 않는다)
ALTER TABLE kmovie_projects DROP CONSTRAINT IF EXISTS kmovie_projects_doc_size;
ALTER TABLE kmovie_projects ADD CONSTRAINT kmovie_projects_doc_size CHECK (pg_column_size(doc) < 4 * 1024 * 1024);

-- 검산
--   SELECT count(*) FROM kmovie_projects;                                   → 0
--   SELECT policyname FROM pg_policies WHERE tablename='kmovie_projects';   → p_kmovie_projects_owner
