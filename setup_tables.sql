-- =============================================
-- K-edu Supabase 테이블 설정
-- Supabase Dashboard > SQL Editor에서 실행
-- =============================================

-- 1. 교사 테이블 (Supabase Auth 연동)
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  school text DEFAULT '',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- 교사 본인 데이터 읽기
CREATE POLICY "teachers_read_own" ON teachers
  FOR SELECT USING (user_id = auth.uid());

-- 어드민은 전체 교사 읽기
CREATE POLICY "admins_read_all_teachers" ON teachers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
  );

-- 회원가입 시 본인 행 삽입
CREATE POLICY "teachers_insert_own" ON teachers
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 본인 정보 수정
CREATE POLICY "teachers_update_own" ON teachers
  FOR UPDATE USING (user_id = auth.uid());

-- 2. class_codes에 teacher_id 추가 (이미 있으면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_codes' AND column_name = 'teacher_id'
  ) THEN
    ALTER TABLE class_codes ADD COLUMN teacher_id uuid REFERENCES teachers(id);
  END IF;
END $$;

-- class_codes: 교사 본인 코드 읽기
CREATE POLICY "teachers_read_own_codes" ON class_codes
  FOR SELECT USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );

-- class_codes: 교사 본인 코드 생성
CREATE POLICY "teachers_insert_codes" ON class_codes
  FOR INSERT WITH CHECK (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );

-- class_codes: 교사 본인 코드 수정
CREATE POLICY "teachers_update_codes" ON class_codes
  FOR UPDATE USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );

-- 3. students: 교사가 자기 학급 학생 조회 가능
CREATE POLICY "teachers_read_own_students" ON students
  FOR SELECT USING (
    class_code_id IN (
      SELECT cc.id FROM class_codes cc
      JOIN teachers t ON cc.teacher_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

-- 어드민은 전체 학생 읽기
CREATE POLICY "admins_read_all_students" ON students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
  );

-- 4. 페이지 방문 추적 테이블
CREATE TABLE IF NOT EXISTS page_visits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  page_path text NOT NULL,
  session_id text,
  visited_at timestamptz DEFAULT now()
);

ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- 누구나 방문 기록 삽입 가능 (anon)
CREATE POLICY "anyone_insert_visits" ON page_visits
  FOR INSERT WITH CHECK (true);

-- 어드민만 방문 기록 조회
CREATE POLICY "admins_read_visits" ON page_visits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
  );

-- 5. 콘텐츠 관리 테이블
CREATE TABLE IF NOT EXISTS contents (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  file_path text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,        -- 'korean', 'math', 'english'
  sub_category text DEFAULT '',   -- '1_문법', '1단원_9까지의수', '01_첫걸음' 등
  grade int,                      -- NULL이면 전학년 (영어)
  semester int,
  difficulty int DEFAULT 1,       -- 1~4 (⭐ 수)
  is_premium boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- 누구나 활성 콘텐츠 읽기
CREATE POLICY "anyone_read_active_contents" ON contents
  FOR SELECT USING (is_active = true);

-- 어드민만 전체 콘텐츠 관리
CREATE POLICY "admins_manage_contents" ON contents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin = true)
  );

-- =============================================
-- 실행 후 할 일:
-- 1. 준호 계정으로 회원가입 후 teachers 테이블에서 is_admin = true로 변경
--    UPDATE teachers SET is_admin = true WHERE name = '준호';
-- =============================================
