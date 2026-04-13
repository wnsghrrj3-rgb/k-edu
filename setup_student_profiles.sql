-- =============================================
-- K-edu student_profiles 테이블 + RLS
-- Supabase Dashboard > SQL Editor에서 실행
-- 기존 students(비로그인 닉네임) → student_profiles(Auth 연동)
-- =============================================

-- 1. student_profiles 테이블
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  class_code_id uuid REFERENCES class_codes(id) ON DELETE SET NULL,
  grade int CHECK (grade BETWEEN 1 AND 6),
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sp_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sp_class_code ON student_profiles(class_code_id);

-- 2. RLS 활성화
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책

-- (a) 본인 읽기
CREATE POLICY "sp_read_own" ON student_profiles
  FOR SELECT USING (user_id = auth.uid());

-- (b) 본인 삽입 (회원가입 직후 프로필 생성)
CREATE POLICY "sp_insert_own" ON student_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- (c) 본인 수정 (닉네임 변경, 학급 연결/해제 등)
CREATE POLICY "sp_update_own" ON student_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- (d) 교사: 자기 학급 학생 조회
CREATE POLICY "sp_teacher_read_class" ON student_profiles
  FOR SELECT USING (
    class_code_id IN (
      SELECT cc.id FROM class_codes cc
      JOIN teachers t ON cc.teacher_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

-- (e) 어드민: 전체 학생 조회
CREATE POLICY "sp_admin_read_all" ON student_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.user_id = auth.uid() AND t.is_admin = true
    )
  );

-- =============================================
-- 실행 후 확인:
-- SELECT * FROM student_profiles LIMIT 5;
-- =============================================
