-- =============================================================================
-- setup_school_tasks_v15_storage.sql — 할 일판 파일 첨부 저장소 (setup_school_tasks_v15.sql 다음에 따로 실행)
-- 버킷 school (비공개, 20MB) · 경로 {school_id}/{task_id}/{uuid}.{ext}
-- 같은 학교 승인 교사: 읽기·올리기 / 지우기: 올린 본인(owner) — 관리자·올린 사람이 떼면 표에서만 사라지고 실체는 남을 수 있다(용량은 20MB×20개/할 일 상한).
-- ⚠️ storage.objects 정책 생성이 막히면(권한) Supabase 대시보드 Storage → New bucket → school · Private · 20MB 로 만들고 Policies 를 UI 에서 같은 조건으로.
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('school', 'school', false, 20971520,
        ARRAY['application/pdf','image/jpeg','image/png','image/webp','application/zip',
              'application/x-hwp','application/haansofthwp','application/vnd.hancom.hwp','application/vnd.hancom.hwpx','application/octet-stream',
              'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'text/plain','text/csv'])
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "school_same_school_read" ON storage.objects;
CREATE POLICY "school_same_school_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'school' AND (storage.foldername(name))[1] = kedu_my_school_id());

DROP POLICY IF EXISTS "school_same_school_insert" ON storage.objects;
CREATE POLICY "school_same_school_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'school' AND kedu_teacher_approved()
              AND (storage.foldername(name))[1] = kedu_my_school_id()
              AND kedu_task_visible(((storage.foldername(name))[2])::uuid));

DROP POLICY IF EXISTS "school_owner_delete" ON storage.objects;
CREATE POLICY "school_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'school' AND owner = auth.uid());

-- 검산: SELECT id, public, file_size_limit FROM storage.buckets WHERE id='school';  → 1행 · false · 20971520
--       SELECT policyname FROM pg_policies WHERE tablename='objects' AND policyname LIKE 'school_%';  → 3
