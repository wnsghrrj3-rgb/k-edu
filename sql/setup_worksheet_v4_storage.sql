-- =============================================================================
-- setup_worksheet_v4_storage.sql — 수행평가 사진 저장소 (setup_worksheet_v4.sql 뒤에 따로 실행)
--   따로 둔 이유: SQL Editor 는 파일 전체가 한 트랜잭션이라, storage.objects 정책 생성이 권한으로
--   막히면 표 생성까지 함께 되돌아간다(2026-09-07 실측 — performance_tasks 가 없었다).
--   ★이 파일이 권한 오류로 막히면: Supabase 대시보드 Storage → New bucket → 이름 perf · Private ·
--     5MB · image/* 로 만들고, Policies 에서 아래 두 정책을 UI 로 붙인다. 표·화면은 이 파일 없이도 돈다
--     (사진 제출만 막히고 글 제출은 된다).
-- =============================================================================
-- [6] Storage 버킷 perf — 경로 규약: {class_code_id}/{run_id}/{student_id}.{ext}
--   학생: 자기 경로에만 쓰기·읽기 / 담임: 자기 학급 폴더 읽기. 얼굴 사진 금지는 화면 문구로.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('perf', 'perf', false, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "perf_student_own" ON storage.objects;
CREATE POLICY "perf_student_own" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'perf'
         AND (storage.foldername(name))[1] = (SELECT class_code_id::text FROM student_profiles WHERE user_id = auth.uid() LIMIT 1)
         AND storage.filename(name) LIKE (SELECT id::text FROM student_profiles WHERE user_id = auth.uid() LIMIT 1) || '%')
  WITH CHECK (bucket_id = 'perf'
         AND (storage.foldername(name))[1] = (SELECT class_code_id::text FROM student_profiles WHERE user_id = auth.uid() LIMIT 1)
         AND storage.filename(name) LIKE (SELECT id::text FROM student_profiles WHERE user_id = auth.uid() LIMIT 1) || '%');
DROP POLICY IF EXISTS "perf_teacher_read" ON storage.objects;
CREATE POLICY "perf_teacher_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'perf' AND (storage.foldername(name))[1] IN (SELECT id::text FROM class_codes WHERE teacher_id = cw_my_teacher_id()));


-- 검산: SELECT id, public FROM storage.buckets WHERE id='perf';  → 1행, public=false
--       SELECT policyname FROM pg_policies WHERE tablename='objects' AND policyname LIKE 'perf_%';  → 2행
