-- =============================================================
-- 학교 표 (2026-09-02) — 출처: 공공데이터포털 「전국초중등학교위치표준데이터」(기준일 2026-03-20, 한국교육시설안전원)
--   초등학교 · 운영 중 6,303교. id = 공공데이터 학교ID(B0000xxxxx) → 이름이 같아도 안 섞인다(금성초등학교만 전국 11곳)
--   교사는 가입 때 여기서 고른다(teachers.school_id). 학교 단위 기능(할 일판·공유·시범학교)의 기준.
--   재실행 안전(UPSERT). 순서: 이 파일 → seed_schools_1~4.sql
-- =============================================================
CREATE TABLE IF NOT EXISTS edu_offices (
  code       text PRIMARY KEY,      -- 시도교육청코드
  name       text NOT NULL,         -- 서울특별시교육청
  short      text NOT NULL,         -- 서울
  domain     text                   -- 교육청 메일 도메인 (edu_domains 와 같은 값)
);
INSERT INTO edu_offices (code, name, short, domain) VALUES
  ('7010000', '서울특별시교육청', '서울', 'sen.go.kr'),
  ('7150000', '부산광역시교육청', '부산', 'pen.go.kr'),
  ('7240000', '대구광역시교육청', '대구', 'dge.go.kr'),
  ('7310000', '인천광역시교육청', '인천', 'ice.go.kr'),
  ('7380000', '광주광역시교육청', '광주', 'gen.go.kr'),
  ('7430000', '대전광역시교육청', '대전', 'dje.go.kr'),
  ('7480000', '울산광역시교육청', '울산', 'use.go.kr'),
  ('7530000', '경기도교육청', '경기', 'goe.go.kr'),
  ('7801000', '강원특별자치도교육청', '강원', 'gwe.go.kr'),
  ('8000000', '충청북도교육청', '충북', 'cbe.go.kr'),
  ('8140000', '충청남도교육청', '충남', 'cne.go.kr'),
  ('8321000', '전북특별자치도교육청', '전북', 'jbe.go.kr'),
  ('8490000', '전라남도교육청', '전남', 'jne.go.kr'),
  ('8750000', '경상북도교육청', '경북', 'gbe.kr'),
  ('9010000', '경상남도교육청', '경남', 'gne.go.kr'),
  ('9290000', '제주특별자치도교육청', '제주', 'jje.go.kr'),
  ('9300000', '세종특별자치시교육청', '세종', 'sje.go.kr')
ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, short=EXCLUDED.short, domain=EXCLUDED.domain;

CREATE TABLE IF NOT EXISTS schools (
  id          text PRIMARY KEY,               -- 공공데이터 학교ID
  name        text NOT NULL,
  level       text NOT NULL DEFAULT 'elem',
  office_code text NOT NULL REFERENCES edu_offices(code),
  district    text NOT NULL DEFAULT '',       -- 시군구 (중랑구·의성군)
  district_office text NOT NULL DEFAULT '',   -- 교육지원청명
  road_addr   text NOT NULL DEFAULT '',
  founding    text NOT NULL DEFAULT '',       -- 공립/사립/국립
  is_branch   boolean NOT NULL DEFAULT false, -- 분교
  lat         double precision, lng double precision,
  is_active   boolean NOT NULL DEFAULT true,
  source      text NOT NULL DEFAULT 'data.go.kr',   -- 'data.go.kr' | 'manual'(목록에 없어 신청으로 추가)
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools (name);
CREATE INDEX IF NOT EXISTS idx_schools_office ON schools (office_code, name);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_schools_read ON schools;
CREATE POLICY p_schools_read ON schools FOR SELECT TO anon, authenticated USING (is_active);   -- 공공데이터 — 가입 화면(비로그인)이 검색한다
DROP POLICY IF EXISTS p_schools_admin_write ON schools;
CREATE POLICY p_schools_admin_write ON schools FOR ALL USING (kedu_is_admin()) WITH CHECK (kedu_is_admin());
ALTER TABLE edu_offices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_edu_offices_read ON edu_offices;
CREATE POLICY p_edu_offices_read ON edu_offices FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON schools, edu_offices TO anon, authenticated;

-- 교사 ↔ 학교
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS school_id text REFERENCES schools(id);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS school_request text;   -- 목록에 없어 신청한 학교명·주소 (승인 때 준호가 schools 에 추가 후 지정)
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers (school_id);

-- 검색 RPC — 이름 부분일치 + 시도 필터, 20건. anon 허용(가입 화면)
CREATE OR REPLACE FUNCTION search_schools(p_q text, p_office text DEFAULT NULL)
RETURNS TABLE (id text, name text, office_code text, office_short text, district text, road_addr text, founding text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT s.id, s.name, s.office_code, o.short, s.district, s.road_addr, s.founding
  FROM schools s JOIN edu_offices o ON o.code = s.office_code
  WHERE s.is_active
    AND (p_office IS NULL OR p_office = '' OR s.office_code = p_office)
    AND length(btrim(coalesce(p_q,''))) >= 1
    AND replace(s.name,' ','') ILIKE '%' || replace(btrim(p_q),' ','') || '%'
  ORDER BY (replace(s.name,' ','') ILIKE replace(btrim(p_q),' ','') || '%') DESC, s.name, o.short, s.district
  LIMIT 20
$fn$;
GRANT EXECUTE ON FUNCTION search_schools(text, text) TO anon, authenticated;

-- 관리자: 교사에게 학교 지정 (기존 계정 3명 + 목록에 없던 학교)
CREATE OR REPLACE FUNCTION admin_set_teacher_school(p_teacher_id uuid, p_school_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NOT kedu_is_admin() THEN RAISE EXCEPTION 'admin only'; END IF;
  UPDATE teachers SET school_id = p_school_id,
         school = COALESCE((SELECT s.name || ' (' || o.short || ' ' || s.district || ')' FROM schools s JOIN edu_offices o ON o.code=s.office_code WHERE s.id = p_school_id), school)
   WHERE id = p_teacher_id;
END $fn$;
REVOKE ALL ON FUNCTION admin_set_teacher_school(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION admin_set_teacher_school(uuid, text) TO authenticated;

-- 가입 트리거(setup_teacher_approval)가 만든 행에 school_id 를 채우는 건 클라이언트(auth/·teacher/ 자가 복구)가 한다.
-- 검산 (seed 4개 실행 후):
--   SELECT count(*) FROM schools;                                    → 6303
--   SELECT * FROM search_schools('금성', '7010000');                  → 서울 중랑구 금성초등학교 1건
--   SELECT id, name, district FROM search_schools('금성');            → 11건

-- 관리자 교사 목록에 학교 열 추가 (반환형 변경이라 DROP 후 재생성)
DROP FUNCTION IF EXISTS admin_teacher_list();
CREATE FUNCTION admin_teacher_list()
RETURNS TABLE (
  id uuid, user_id uuid, name text, school text, email text,
  is_admin boolean, approval text, approval_note text,
  approval_requested_at timestamptz, approved_at timestamptz, created_at timestamptz,
  is_edu_email boolean,
  school_id text, school_request text, office_short text, office_domain text, email_office_match boolean
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT t.id, t.user_id, t.name, t.school, u.email::text,
         t.is_admin, t.approval, t.approval_note,
         t.approval_requested_at, t.approved_at, t.created_at,
         kedu_email_is_edu(u.email::text),
         t.school_id, t.school_request, o.short, o.domain,
         CASE WHEN o.domain IS NULL OR u.email IS NULL THEN NULL
              ELSE lower(split_part(u.email::text,'@',2)) = o.domain OR lower(split_part(u.email::text,'@',2)) LIKE '%.' || o.domain END
    FROM teachers t
    LEFT JOIN auth.users u ON u.id = t.user_id
    LEFT JOIN schools s ON s.id = t.school_id
    LEFT JOIN edu_offices o ON o.code = s.office_code
   WHERE kedu_is_admin()
   ORDER BY (t.approval = 'pending') DESC, t.created_at DESC
$fn$;
GRANT EXECUTE ON FUNCTION admin_teacher_list() TO authenticated;
