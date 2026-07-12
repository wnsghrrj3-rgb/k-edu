-- =============================================
-- K-edu 방문 분석 업그레이드 마이그레이션
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. page_visits 테이블에 컬럼 추가
ALTER TABLE page_visits ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE page_visits ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE page_visits ADD COLUMN IF NOT EXISTS user_agent text;

-- 2. 조회 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_page_path ON page_visits(page_path);
CREATE INDEX IF NOT EXISTS idx_page_visits_session_id ON page_visits(session_id);

-- 3. 일별 집계 뷰 (관리자 대시보드용 - 빠른 조회)
CREATE OR REPLACE VIEW daily_visit_stats AS
SELECT
  date_trunc('day', visited_at)::date AS visit_date,
  COUNT(*) AS total_views,
  COUNT(DISTINCT session_id) AS unique_sessions,
  COUNT(DISTINCT page_path) AS unique_pages
FROM page_visits
GROUP BY date_trunc('day', visited_at)::date
ORDER BY visit_date DESC;

-- 4. 인기 페이지 뷰 (최근 30일)
CREATE OR REPLACE VIEW popular_pages AS
SELECT
  page_path,
  COUNT(*) AS view_count,
  COUNT(DISTINCT session_id) AS unique_visitors
FROM page_visits
WHERE visited_at >= NOW() - INTERVAL '30 days'
GROUP BY page_path
ORDER BY view_count DESC
LIMIT 20;

-- 5. 시간대별 방문 뷰
CREATE OR REPLACE VIEW hourly_visit_pattern AS
SELECT
  EXTRACT(HOUR FROM visited_at AT TIME ZONE 'Asia/Seoul') AS hour_kst,
  COUNT(*) AS visit_count
FROM page_visits
WHERE visited_at >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM visited_at AT TIME ZONE 'Asia/Seoul')
ORDER BY hour_kst;

-- 6. 뷰에 대한 RLS (뷰는 기본 테이블의 RLS를 따름, 별도 필요 없음)
-- page_visits의 admins_read_visits 정책이 적용됨
